  { id: 'veri-boru-hatti', lv: 'ileri', mod: 'Üretime Hazırlık', min: 42,
    title: 'Veri boru hattı (ETL): çıkar, dönüştür, yükle',
    sum: 'Anadolu Market günlük satış ETL\'i: pathlib ile dosya düzeni, logging, şema doğrulama, hata kuyruğu, idempotent yükleme (sqlite3) ve zamanlama kavramı.',
    goals: ['Extract/transform/load adımlarını ayrı, test edilebilir fonksiyonlara bölebilirim', 'pathlib ile gelen/işlenen/hatalı dosya düzeni kurabilirim', 'Şema doğrulamasıyla bozuk satırları hata kuyruğuna ayırabilirim', 'sqlite3 ile idempotent (tekrar çalıştırılabilir) yükleme yazabilirim', 'logging ile izlenebilir çalışma kaydı tutar, cron/Airflow zamanlamasını açıklayabilirim'],
    body: `<h2>Neden önemli?</h2>
<p>Anadolu Market her gece mağaza sistemlerinden gelen satış dosyalarını merkez veritabanına yükler. Bu iş bir kez yazılıp yıllarca her gece çalışır; bu yüzden "çalışıyor" yetmez: dosya yarım gelirse ne olur, aynı dosya iki kez gelirse mükerrer kayıt oluşur mu, bozuk satır tüm yüklemeyi durdurur mu, sabah ekip neyin yüklendiğini nereden görür? Bu derste bir <b>veri boru hattı</b> (data pipeline) kurarken sorulan bu soruların standart cevaplarını öğreneceksin. ETL = Extract (çıkar), Transform (dönüştür), Load (yükle).</p>

<h2>Dosya düzeni ve pathlib</h2>
<p>Klasik düzen üç klasördür: <code>gelen/</code> (ham dosyalar bırakılır), <code>islenen/</code> (başarıyla yüklenenler taşınır), <code>hatali/</code> (işlenemeyenler ve hata kuyruğu). <code>pathlib.Path</code> ile klasörleri oluştur, dosyaları desenle bul, taşı. Pyodide\'de bellek içi dosya sistemi olduğu için aynı kod tarayıcıda da çalışır.</p>
<pre class="py">from pathlib import Path
import shutil

KOK = Path('etl_demo')
GELEN, ISLENEN, HATALI = KOK / 'gelen', KOK / 'islenen', KOK / 'hatali'
for k in (GELEN, ISLENEN, HATALI):
    k.mkdir(parents=True, exist_ok=True)

(GELEN / 'satis_2024-05-01.csv').write_text(
    'siparis_no,sehir,tutar,adet\\n1001,İzmir,149.90,2\\n1002,Bursa,80.00,1\\n', encoding='utf-8')
(GELEN / 'satis_2024-05-02.csv').write_text(
    'siparis_no,sehir,tutar,adet\\n1003,Ankara,abc,1\\n1004,İzmir,20.5,3\\n', encoding='utf-8')
(GELEN / 'notlar.txt').write_text('bu dosya ETL konusu değil')

for p in sorted(GELEN.glob('satis_*.csv')):
    print(p.name, p.stem, p.suffix, p.stat().st_size, 'bayt')
shutil.move(str(GELEN / 'notlar.txt'), str(HATALI / 'notlar.txt'))
print('hatali:', [p.name for p in HATALI.iterdir()])
</pre>
<div class="tip"><b>Dosya adında tarih</b><code>satis_2024-05-01.csv</code> gibi ISO tarihli adlar hem sıralamayı hem "bu dosya daha önce yüklendi mi?" sorusunu kolaylaştırır. İş tarihi (business date) ile dosyanın geliş zamanını karıştırma; ikisini de kaydet.</div>

<h2>Extract ve şema doğrulama</h2>
<p>Çıkarma adımı ham satırları okur; dönüştürme adımı her satırı şemaya göre doğrular ve tipler. Bozuk satır tüm işi durdurmamalı; <b>hata kuyruğuna</b> (dead-letter queue) yazılıp iş devam etmeli. Her hata kaydı: kaynak dosya, satır numarası, ham veri, hata nedeni.</p>
<pre class="py">import csv, io
from dataclasses import dataclass
from decimal import Decimal, InvalidOperation

@dataclass(frozen=True)
class Satis:
    siparis_no: int
    sehir: str
    tutar: Decimal
    adet: int

SEHIRLER = {'İzmir', 'Bursa', 'Ankara', 'İstanbul'}

def dogrula(ham: dict) -&gt; Satis:
    try:
        no = int(ham['siparis_no'])
        tutar = Decimal(ham['tutar'])
        adet = int(ham['adet'])
    except (KeyError, ValueError, InvalidOperation) as e:
        raise ValueError(f'tip hatası: {e}') from e
    if tutar &lt; 0: raise ValueError('tutar negatif')
    if adet &lt;= 0: raise ValueError('adet pozitif olmalı')
    sehir = ham['sehir'].strip()
    if sehir not in SEHIRLER: raise ValueError(f'bilinmeyen şehir: {sehir}')
    return Satis(no, sehir, tutar, adet)

def extract_transform(metin: str, kaynak: str):
    gecerli, hatalar = [], []
    for i, ham in enumerate(csv.DictReader(io.StringIO(metin)), start=2):   # 1 = başlık
        try:
            gecerli.append(dogrula(ham))
        except ValueError as e:
            hatalar.append({'kaynak': kaynak, 'satir': i, 'ham': ham, 'neden': str(e)})
    return gecerli, hatalar

metin = 'siparis_no,sehir,tutar,adet\\n1003,Ankara,abc,1\\n1004,İzmir,20.5,3\\n1005,Mars,5,1\\n'
g, h = extract_transform(metin, 'satis_2024-05-02.csv')
print('geçerli:', g)
for x in h:
    print('HATA', x['satir'], x['neden'])
</pre>
<div class="note"><b>Para için Decimal</b>Satış tutarlarını float ile toplarsan kuruş farkları birikir. Dönüştürme adımında <code>Decimal</code>\'e çevir, veritabanına kuruş cinsinden tam sayı ya da metin olarak yaz.</div>

<h2>Load: idempotent yükleme</h2>
<p>İdempotent yükleme, aynı dosyayı iki kez çalıştırınca sonucun değişmemesi demektir. İki araç: tabloda doğal anahtar üzerinde <code>UNIQUE</code> kısıtı ve <code>INSERT ... ON CONFLICT DO UPDATE</code> (upsert); ayrıca hangi dosyanın yüklendiğini tutan bir <code>yukleme_kaydi</code> tablosu. Yükleme bir <b>işlem</b> (transaction) içinde yapılır: ya hepsi ya hiçbiri.</p>
<pre class="py">import sqlite3
from decimal import Decimal

def semayi_kur(con):
    con.executescript('''
        CREATE TABLE IF NOT EXISTS satis (
            siparis_no INTEGER PRIMARY KEY, sehir TEXT NOT NULL,
            tutar_kurus INTEGER NOT NULL, adet INTEGER NOT NULL, kaynak TEXT NOT NULL);
        CREATE TABLE IF NOT EXISTS yukleme_kaydi (
            kaynak TEXT PRIMARY KEY, satir INTEGER, hata INTEGER, yuklendi_utc TEXT);
    ''')

def load(con, satislar, kaynak, hata_sayisi):
    with con:                                   # transaction: hata olursa geri alınır
        con.executemany('''
            INSERT INTO satis (siparis_no, sehir, tutar_kurus, adet, kaynak)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(siparis_no) DO UPDATE SET
                sehir=excluded.sehir, tutar_kurus=excluded.tutar_kurus,
                adet=excluded.adet, kaynak=excluded.kaynak
        ''', [(s.siparis_no, s.sehir, int(s.tutar * 100), s.adet, kaynak) for s in satislar])
        con.execute('''INSERT INTO yukleme_kaydi VALUES (?, ?, ?, datetime('now'))
                       ON CONFLICT(kaynak) DO UPDATE SET satir=excluded.satir, hata=excluded.hata,
                       yuklendi_utc=excluded.yuklendi_utc''', (kaynak, len(satislar), hata_sayisi))

con = sqlite3.connect(':memory:')
semayi_kur(con)
veri = [Satis(1001, 'İzmir', Decimal('149.90'), 2), Satis(1002, 'Bursa', Decimal('80.00'), 1)]
load(con, veri, 'satis_2024-05-01.csv', 0)
load(con, veri, 'satis_2024-05-01.csv', 0)     # ikinci çalıştırma: mükerrer yok
print(con.execute('SELECT COUNT(*), SUM(tutar_kurus) FROM satis').fetchone())
print(con.execute('SELECT kaynak, satir FROM yukleme_kaydi').fetchall())
</pre>
<div class="warn"><b>Yarım yükleme</b><code>with con:</code> bloğu istisna durumunda <code>ROLLBACK</code> yapar. Dosyayı <code>islenen/</code> klasörüne taşıma işlemini yalnızca commit başarılı olduktan sonra yap; yoksa veritabanında olmayan bir dosya "işlendi" görünür.</div>

<h2>logging ile izlenebilirlik</h2>
<p><code>print</code> yerine <code>logging</code>: seviye (INFO/WARNING/ERROR), zaman damgası, modül adı, ve üretimde dosyaya ya da merkezi log sistemine yönlendirme. Her çalıştırma için bir <b>çalıştırma kimliği</b> (run id) üret; sabah ekip "dün gece 03:00 çalıştırması" diye arar.</p>
<pre class="py">import logging, io, uuid

akis = io.StringIO()
logging.basicConfig(stream=akis, level=logging.INFO,
                    format='%(asctime)s %(levelname)s %(name)s: %(message)s', force=True)
log = logging.getLogger('etl.satis')

run_id = uuid.UUID(int=12345)            # gerçekte uuid.uuid4()
log.info('başladı run_id=%s', run_id)
log.info('dosya=%s geçerli=%d hata=%d', 'satis_2024-05-02.csv', 1, 2)
log.warning('hata kuyruğuna yazıldı: %d satır', 2)
log.error('dosya okunamadı: %s', 'satis_2024-05-03.csv')
print(akis.getvalue())
</pre>
<div class="tbl-wrap"><table><tr><th>Adım</th><th>Girdi</th><th>Çıktı</th><th>Hata durumunda</th></tr><tr><td>Extract</td><td>gelen/*.csv</td><td>ham satır listesi</td><td>Dosya hatali/ klasörüne, ERROR log</td></tr><tr><td>Transform</td><td>ham satırlar</td><td>Satis nesneleri + hata kuyruğu</td><td>Satır kuyruğa, WARNING log, iş devam</td></tr><tr><td>Load</td><td>Satis nesneleri</td><td>DB satırları + yükleme kaydı</td><td>ROLLBACK, dosya gelen/ içinde kalır</td></tr><tr><td>Arşiv</td><td>işlenen dosya</td><td>islenen/ klasörü</td><td>Yalnızca commit sonrası</td></tr></table></div>

<h2>Uçtan uca: Anadolu Market günlük satış ETL\'i</h2>
<pre class="py">import sqlite3, shutil, json, logging, io
from pathlib import Path

def calistir(kok: Path, con, log):
    gelen, islenen, hatali = kok / 'gelen', kok / 'islenen', kok / 'hatali'
    for k in (gelen, islenen, hatali): k.mkdir(parents=True, exist_ok=True)
    ozet = []
    for dosya in sorted(gelen.glob('satis_*.csv')):
        gecerli, hatalar = extract_transform(dosya.read_text(encoding='utf-8'), dosya.name)
        if hatalar:
            (hatali / (dosya.stem + '.hatalar.jsonl')).write_text(
                '\\n'.join(json.dumps(h, ensure_ascii=False) for h in hatalar), encoding='utf-8')
        load(con, gecerli, dosya.name, len(hatalar))
        shutil.move(str(dosya), str(islenen / dosya.name))
        log.info('%s: %d yüklendi, %d hatalı', dosya.name, len(gecerli), len(hatalar))
        ozet.append((dosya.name, len(gecerli), len(hatalar)))
    return ozet

akis = io.StringIO()
logging.basicConfig(stream=akis, level=logging.INFO, format='%(levelname)s %(message)s', force=True)
con = sqlite3.connect(':memory:'); semayi_kur(con)
print(calistir(Path('etl_demo'), con, logging.getLogger('etl')))
print('kalan gelen:', [p.name for p in Path('etl_demo/gelen').iterdir()])
print(con.execute('SELECT sehir, SUM(tutar_kurus)/100.0 FROM satis GROUP BY sehir').fetchall())
print(akis.getvalue().strip())
</pre>

<h2>Zamanlama: cron ve Airflow</h2>
<p>Betiği her gece çalıştırmak için en basit araç <code>cron</code>\'dur: <code>0 3 * * * /opt/etl/.venv/bin/python -m etl.satis</code> satırı her gün 03:00\'te çalıştırır. Boru hattı büyüyünce (bağımlılıklar, yeniden deneme, izleme, geriye dönük çalıştırma) Airflow, Prefect ya da Dagster gibi orkestratörler kullanılır: her adım bir görev (task), görevler yönlü çevrimsiz çizge (DAG) oluşturur, başarısız görev tek başına yeniden denenir. İdempotent yazılmış bir ETL, bu araçlarla sorunsuz çalışır; idempotent olmayan ise her yeniden denemede mükerrer kayıt üretir.</p>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Üretim ETL\'inde olgunluk işaretleri</h3>
<p>İyi bir boru hattı; yapılandırmayı koddan ayırır (ortam değişkeni, TOML), her çalıştırma için metrik üretir (satır sayısı, süre, hata oranı) ve bu metrikleri bir panoya ya da uyarı sistemine gönderir. Hata oranı bir eşiği aşarsa (örneğin satırların yüzde biri) yükleme durdurulur; sessizce yüzde kırk hatalı dosya yüklemek, hiç yüklememekten kötüdür.</p>
<p>Veri kalitesi kontrolleri (data quality checks) yüklemeden sonra çalışır: bugünün toplamı dünün yüzde ellisinden azsa uyar, şehir listesinde bilinmeyen değer varsa uyar. Great Expectations ve pandera bu kontrolleri bildirimsel yazmanı sağlar. Büyük hacimde satır satır Python yerine pandas (ya da Polars) ile vektörel dönüştürme ve <code>to_sql</code>/COPY ile toplu yükleme yapılır; ancak hata kuyruğu, idempotency ve log disiplini aynı kalır.</p>
<p>Geriye dönük çalıştırma (backfill) için betik tarih parametresi almalı: <code>python -m etl.satis --tarih 2024-05-01</code>. Bugünün tarihini kodun içinde <code>date.today()</code> ile sabitlemek, bir hafta sonra "geçen pazartesiyi yeniden yükle" ihtiyacını imkânsız kılar.</p>
</section>`,
    ex: [
      { t: 'code', id: 'veri-boru-hatti-1',
        q: '<p><code>dogrula_satir(ham: dict) -> dict</code> yaz. Kurallar: <code>siparis_no</code> int\'e çevrilebilmeli; <code>tutar</code> <code>Decimal</code>\'e çevrilebilmeli ve negatif olmamalı; <code>adet</code> pozitif int; <code>sehir</code> kırpılmış ve boş olmamalı. Hata durumunda <code>ValueError</code>. Geçerliyse <code>{\'siparis_no\': int, \'sehir\': str, \'tutar_kurus\': int (tutar*100, yuvarlanmış), \'adet\': int}</code> döndür.</p>',
        start: 'from decimal import Decimal, InvalidOperation\n\ndef dogrula_satir(ham):\n    pass\n',
        sol: 'from decimal import Decimal, InvalidOperation\n\ndef dogrula_satir(ham):\n    try:\n        no = int(ham[\'siparis_no\'])\n        tutar = Decimal(str(ham[\'tutar\']))\n        adet = int(ham[\'adet\'])\n    except (KeyError, ValueError, InvalidOperation) as e:\n        raise ValueError(f\'tip hatası: {e}\') from e\n    if tutar < 0:\n        raise ValueError(\'tutar negatif\')\n    if adet <= 0:\n        raise ValueError(\'adet pozitif olmalı\')\n    sehir = str(ham.get(\'sehir\', \'\')).strip()\n    if not sehir:\n        raise ValueError(\'sehir boş\')\n    return {\'siparis_no\': no, \'sehir\': sehir, \'tutar_kurus\': int(round(tutar * 100)), \'adet\': adet}\n',
        tests: 'r = dogrula_satir({\'siparis_no\': \'1001\', \'sehir\': \' İzmir \', \'tutar\': \'149.90\', \'adet\': \'2\'})\nassert r == {\'siparis_no\': 1001, \'sehir\': \'İzmir\', \'tutar_kurus\': 14990, \'adet\': 2}, "Geçerli satır dönüştürülmeli"\nassert dogrula_satir({\'siparis_no\': 1, \'sehir\': \'A\', \'tutar\': \'0.1\', \'adet\': 1})[\'tutar_kurus\'] == 10, "0.1 -> 10 kuruş (float hatası olmamalı)"\nfor bozuk in (\n    {\'siparis_no\': \'x\', \'sehir\': \'A\', \'tutar\': \'1\', \'adet\': \'1\'},\n    {\'siparis_no\': \'1\', \'sehir\': \'A\', \'tutar\': \'abc\', \'adet\': \'1\'},\n    {\'siparis_no\': \'1\', \'sehir\': \'A\', \'tutar\': \'-5\', \'adet\': \'1\'},\n    {\'siparis_no\': \'1\', \'sehir\': \'A\', \'tutar\': \'5\', \'adet\': \'0\'},\n    {\'siparis_no\': \'1\', \'sehir\': \'  \', \'tutar\': \'5\', \'adet\': \'1\'},\n    {\'sehir\': \'A\', \'tutar\': \'5\', \'adet\': \'1\'},\n):\n    try:\n        dogrula_satir(bozuk)\n        assert False, f"Bozuk satır ValueError vermeli: {bozuk}"\n    except ValueError:\n        pass\n',
        hints: ['Decimal(str(x)) ile float girdiyi de güvenli çevir; InvalidOperation yakala.', 'KeyError\'ı da ValueError\'a çevir; eksik alan şema hatasıdır.'],
        why: 'Dönüştürme adımı tipleri sabitler ve parayı kuruşa çevirir; sonraki adımlar artık doğrulanmış veriyle çalışır.' },
      { t: 'code', id: 'veri-boru-hatti-2',
        q: '<p><code>extract_transform(metin: str, kaynak: str, dogrulayici) -> tuple[list, list]</code>: CSV metnini <code>csv.DictReader</code> ile okur, her satırı <code>dogrulayici(ham)</code>\'dan geçirir. Geçerli sonuçları ilk listeye; <code>ValueError</code> verenleri <code>{\'kaynak\', \'satir\', \'ham\', \'neden\'}</code> sözlüğü olarak ikinci listeye koyar. <code>satir</code> dosyadaki gerçek satır numarası (başlık 1, ilk veri 2).</p>',
        start: 'import csv, io\n\ndef extract_transform(metin, kaynak, dogrulayici):\n    pass\n',
        sol: 'import csv, io\n\ndef extract_transform(metin, kaynak, dogrulayici):\n    gecerli, hatalar = [], []\n    for i, ham in enumerate(csv.DictReader(io.StringIO(metin)), start=2):\n        try:\n            gecerli.append(dogrulayici(ham))\n        except ValueError as e:\n            hatalar.append({\'kaynak\': kaynak, \'satir\': i, \'ham\': ham, \'neden\': str(e)})\n    return gecerli, hatalar\n',
        tests: 'def d(ham):\n    if ham[\'tutar\'] == \'abc\':\n        raise ValueError(\'tutar sayı değil\')\n    return int(ham[\'no\'])\nmetin = \'no,tutar\\n1,5\\n2,abc\\n3,7\\n\'\ng, h = extract_transform(metin, \'x.csv\', d)\nassert g == [1, 3], "Geçerli satırlar sırayla"\nassert len(h) == 1 and h[0][\'satir\'] == 3 and h[0][\'kaynak\'] == \'x.csv\', "Hatalı satır 3. satırda"\nassert h[0][\'neden\'] == \'tutar sayı değil\' and h[0][\'ham\'] == {\'no\': \'2\', \'tutar\': \'abc\'}, "Hata kaydı alanları"\nassert extract_transform(\'no,tutar\\n\', \'y.csv\', d) == ([], []), "Boş dosya boş sonuç"\n',
        hints: ['enumerate(..., start=2) ile başlığı say.', 'Yalnızca ValueError yakala; programlama hataları yayılmalı.'],
        why: 'Bozuk satırı kuyruğa ayırıp devam etmek işi durdurmaz; satır numarası ve ham veri ile hata sabah kolayca bulunur.' },
      { t: 'mc', q: 'ETL yüklemesinin idempotent olması ne demektir?',
        o: ['Yükleme her zaman çok hızlı tamamlanır', 'Aynı girdiyle tekrar çalıştırmak sonucu değiştirmez', 'Yükleme hiçbir zaman hata vermez', 'Yükleme sırayla tek iş parçacığında yapılır'],
        a: 1, why: 'İdempotent yükleme, aynı dosyanın iki kez işlenmesinin mükerrer kayıt üretmemesi demektir; upsert ve yükleme kaydı tablosu ile sağlanır. Hız, hatasızlık ve iş parçacığı sayısıyla ilgisi yoktur.' },
      { t: 'code', id: 'veri-boru-hatti-4',
        q: '<p>İdempotent yükleme. <code>semayi_kur(con)</code>: <code>satis(siparis_no INTEGER PRIMARY KEY, sehir TEXT, tutar_kurus INTEGER, adet INTEGER)</code> tablosunu oluştursun (IF NOT EXISTS). <code>load(con, satirlar: list[dict]) -> int</code>: satırları <code>INSERT ... ON CONFLICT(siparis_no) DO UPDATE</code> ile tek işlemde yüklesin ve tablodaki toplam satır sayısını döndürsün. Satır sözlükleri <code>siparis_no, sehir, tutar_kurus, adet</code> anahtarlarını taşır.</p>',
        start: 'import sqlite3\n\ndef semayi_kur(con):\n    pass\n\ndef load(con, satirlar):\n    pass\n',
        sol: 'import sqlite3\n\ndef semayi_kur(con):\n    con.execute(\'\'\'CREATE TABLE IF NOT EXISTS satis (\n        siparis_no INTEGER PRIMARY KEY, sehir TEXT, tutar_kurus INTEGER, adet INTEGER)\'\'\')\n\ndef load(con, satirlar):\n    with con:\n        con.executemany(\'\'\'INSERT INTO satis (siparis_no, sehir, tutar_kurus, adet)\n            VALUES (:siparis_no, :sehir, :tutar_kurus, :adet)\n            ON CONFLICT(siparis_no) DO UPDATE SET sehir=excluded.sehir,\n                tutar_kurus=excluded.tutar_kurus, adet=excluded.adet\'\'\', satirlar)\n    return con.execute(\'SELECT COUNT(*) FROM satis\').fetchone()[0]\n',
        tests: 'con = sqlite3.connect(\':memory:\')\nsemayi_kur(con); semayi_kur(con)\nv = [{\'siparis_no\': 1, \'sehir\': \'İzmir\', \'tutar_kurus\': 1000, \'adet\': 1},\n     {\'siparis_no\': 2, \'sehir\': \'Bursa\', \'tutar_kurus\': 500, \'adet\': 2}]\nassert load(con, v) == 2, "İlk yükleme 2 satır"\nassert load(con, v) == 2, "Tekrar yükleme mükerrer üretmemeli"\nv[1][\'tutar_kurus\'] = 700\nassert load(con, [v[1]]) == 2, "Güncelleme satır eklememeli"\nassert con.execute(\'SELECT tutar_kurus FROM satis WHERE siparis_no=2\').fetchone()[0] == 700, "Çakışmada güncellenmeli"\nassert con.execute(\'SELECT SUM(tutar_kurus) FROM satis\').fetchone()[0] == 1700, "Toplam"\n',
        hints: ['executemany adlandırılmış parametrelerle (:ad) sözlük listesi alabilir.', 'with con: bloğu commit/rollback yönetir.'],
        why: 'PRIMARY KEY + ON CONFLICT DO UPDATE, "varsa güncelle yoksa ekle" davranışını tek SQL ile verir; işlem bloğu yarım yüklemeyi önler.' },
      { t: 'code', id: 'veri-boru-hatti-5',
        q: '<p>Dosya düzeni. <code>klasorleri_kur(kok: Path) -> dict</code>: <code>gelen</code>, <code>islenen</code>, <code>hatali</code> alt klasörlerini oluşturup <code>{\'gelen\': Path, ...}</code> döndürsün. <code>bekleyen_dosyalar(kok) -> list[Path]</code>: <code>gelen/</code> içindeki <code>satis_*.csv</code> dosyalarını ada göre sıralı döndürsün. <code>arsivle(dosya: Path, hedef_klasor: Path) -> Path</code>: dosyayı hedef klasöre taşıyıp yeni yolu döndürsün (<code>Path.replace</code> kullan).</p>',
        start: 'from pathlib import Path\n\ndef klasorleri_kur(kok):\n    pass\n\ndef bekleyen_dosyalar(kok):\n    pass\n\ndef arsivle(dosya, hedef_klasor):\n    pass\n',
        sol: 'from pathlib import Path\n\ndef klasorleri_kur(kok):\n    kok = Path(kok)\n    d = {ad: kok / ad for ad in (\'gelen\', \'islenen\', \'hatali\')}\n    for p in d.values():\n        p.mkdir(parents=True, exist_ok=True)\n    return d\n\ndef bekleyen_dosyalar(kok):\n    return sorted((Path(kok) / \'gelen\').glob(\'satis_*.csv\'))\n\ndef arsivle(dosya, hedef_klasor):\n    hedef = Path(hedef_klasor) / Path(dosya).name\n    Path(dosya).replace(hedef)\n    return hedef\n',
        tests: 'import tempfile, shutil\nkok = Path(tempfile.mkdtemp()) / \'etl_test\'\nd = klasorleri_kur(kok)\nassert set(d) == {\'gelen\', \'islenen\', \'hatali\'} and all(p.is_dir() for p in d.values()), "Üç klasör oluşmalı"\nklasorleri_kur(kok)\n(d[\'gelen\'] / \'satis_2024-05-02.csv\').write_text(\'a\')\n(d[\'gelen\'] / \'satis_2024-05-01.csv\').write_text(\'b\')\n(d[\'gelen\'] / \'notlar.txt\').write_text(\'c\')\nb = bekleyen_dosyalar(kok)\nassert [p.name for p in b] == [\'satis_2024-05-01.csv\', \'satis_2024-05-02.csv\'], "Yalnızca satis_*.csv, sıralı"\nyeni = arsivle(b[0], d[\'islenen\'])\nassert yeni == d[\'islenen\'] / \'satis_2024-05-01.csv\' and yeni.exists() and not b[0].exists(), "Dosya taşınmalı"\nassert len(bekleyen_dosyalar(kok)) == 1, "Taşınan dosya artık bekleyen değil"\nshutil.rmtree(kok.parent, ignore_errors=True)\n',
        hints: ['mkdir(parents=True, exist_ok=True) tekrar çağrıda hata vermez.', 'Path.glob(\'satis_*.csv\') ve sorted().'],
        why: 'pathlib ile klasör düzeni platformdan bağımsız kurulur; glob deseni ETL dışı dosyaları doğal olarak dışarıda bırakır.' },
      { t: 'code', id: 'veri-boru-hatti-6',
        q: '<p>Hata kuyruğu ve logging. <code>hata_kuyruguna_yaz(hatalar: list[dict], yol: Path) -> int</code>: her hatayı bir satır JSON (<code>ensure_ascii=False</code>) olarak dosyaya <b>ekleyerek</b> (append) yazsın, yazılan satır sayısını döndürsün. <code>etl_logger(akis) -> logging.Logger</code>: <code>\'etl\'</code> adlı logger\'a verilen akışa yazan bir <code>StreamHandler</code> eklesin, format <code>\'%(levelname)s %(message)s\'</code>, seviye INFO; önce logger\'daki eski handler\'ları temizlesin, <code>propagate=False</code> yapsın.</p>',
        start: 'import json, logging\nfrom pathlib import Path\n\ndef hata_kuyruguna_yaz(hatalar, yol):\n    pass\n\ndef etl_logger(akis):\n    pass\n',
        sol: 'import json, logging\nfrom pathlib import Path\n\ndef hata_kuyruguna_yaz(hatalar, yol):\n    yol = Path(yol)\n    with yol.open(\'a\', encoding=\'utf-8\') as f:\n        for h in hatalar:\n            f.write(json.dumps(h, ensure_ascii=False) + \'\\n\')\n    return len(hatalar)\n\ndef etl_logger(akis):\n    log = logging.getLogger(\'etl\')\n    log.handlers.clear()\n    h = logging.StreamHandler(akis)\n    h.setFormatter(logging.Formatter(\'%(levelname)s %(message)s\'))\n    log.addHandler(h)\n    log.setLevel(logging.INFO)\n    log.propagate = False\n    return log\n',
        tests: 'import io, tempfile\nyol = Path(tempfile.mkdtemp()) / \'hatalar.jsonl\'\nassert hata_kuyruguna_yaz([{\'satir\': 2, \'neden\': \'tutar sayı değil\'}], yol) == 1\nassert hata_kuyruguna_yaz([{\'satir\': 5, \'neden\': \'şehir yok\'}, {\'satir\': 6, \'neden\': \'x\'}], yol) == 2\nsatirlar = yol.read_text(encoding=\'utf-8\').strip().splitlines()\nassert len(satirlar) == 3, "Append ile 3 satır olmalı"\nassert json.loads(satirlar[1])[\'neden\'] == \'şehir yok\' and \'şehir\' in satirlar[1], "Türkçe karakter kaçırılmadan yazılmalı"\nakis = io.StringIO()\nlog = etl_logger(akis)\nlog.debug(\'gizli\'); log.info(\'yüklendi %d\', 3); log.warning(\'uyarı\')\nciktilar = akis.getvalue().strip().splitlines()\nassert ciktilar == [\'INFO yüklendi 3\', \'WARNING uyarı\'], f"Log biçimi/seviyesi yanlış: {ciktilar}"\nlog2 = etl_logger(io.StringIO())\nassert len(log2.handlers) == 1 and log2 is log, "Tekrar çağrıda handler birikmemeli"\n',
        hints: ['JSONL: her satır bir JSON nesnesi, dosya \'a\' modunda açılır.', 'logging.getLogger(\'etl\') aynı nesneyi döndürür; handlers.clear() ile birikmeyi önle.'],
        why: 'JSONL hata kuyruğu hem insan hem makine tarafından okunur; dedicated logger ile ETL\'in kaydı uygulamanın diğer loglarından ayrışır.' },
      { t: 'mc', q: 'Yüklenen dosyayı <code>islenen/</code> klasörüne taşımak için en doğru an hangisi?',
        o: ['Dosya okunur okunmaz', 'Dönüştürme adımı bittiğinde', 'Veritabanı işlemi (commit) başarıyla tamamlandıktan sonra', 'Hata kuyruğu yazıldığında'],
        a: 2, why: 'Dosya ancak verisi kalıcı olarak veritabanına girdikten sonra işlenmiş sayılır. Daha erken taşırsan rollback durumunda dosya "işlendi" görünür ama veri yoktur.' }
    ],
    faq: [
      { q: 'Satır satır Python yerine pandas kullanmalı mıyım?', a: 'Dosya büyükse (yüz binlerce satır) evet: vektörel dönüştürme çok daha hızlıdır. Ancak hata kuyruğu, idempotent yükleme ve log disiplini aynen kalır; pandas yalnızca transform adımını değiştirir.' },
      { q: 'cron mu Airflow mu?', a: 'Tek betik, tek bağımlılık, günde bir çalışma: cron yeter. Birbirine bağlı görevler, yeniden deneme, geriye dönük çalıştırma ve izleme gerekiyorsa bir orkestratör (Airflow, Prefect, Dagster).' },
      { q: 'Hata oranı ne zaman işi durdurmalı?', a: 'Ekiple bir eşik belirle (örneğin satırların yüzde biri). Eşik altı hatalar kuyruğa gider, iş devam eder; eşik üstü dosya tamamen reddedilir ve uyarı gönderilir. Sessizce yarı bozuk veri yüklemek en kötü senaryodur.' }
    ],
    mistakes: [
      { bad: 'for ham in reader:\n    satislar.append(dogrula(ham))  # ilk bozuk satırda iş durur', good: 'for i, ham in enumerate(reader, start=2):\n    try:\n        satislar.append(dogrula(ham))\n    except ValueError as e:\n        hatalar.append({\'satir\': i, \'neden\': str(e)})', why: 'Tek bozuk satır bütün günün yüklemesini engellememeli; hata kuyruğuna ayır.' },
      { bad: 'con.execute(\'INSERT INTO satis VALUES (?, ?, ?)\', satir)\n# aynı dosya ikinci kez gelince mükerrer', good: 'con.execute(\'INSERT INTO satis VALUES (?, ?, ?) ON CONFLICT(siparis_no) DO UPDATE SET ...\', satir)', why: 'Upsert ile tekrar çalıştırma güvenli olur; yeniden denemeler mükerrer kayıt üretmez.' },
      { bad: 'shutil.move(dosya, islenen)\nload(con, satislar)', good: 'load(con, satislar)   # commit\nshutil.move(dosya, islenen)', why: 'Önce taşıyıp sonra yüklersen yükleme başarısız olunca dosya kaybolmuş gibi görünür.' },
      { bad: 'tarih = date.today()  # betik içinde sabit', good: 'parser.add_argument(\'--tarih\', default=str(date.today()))', why: 'Tarih parametre olmazsa geçmiş bir günü yeniden yüklemek (backfill) mümkün olmaz.' }
    ]
  },
