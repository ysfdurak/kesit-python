/* Kesit Python — 'orkestrasyon' uzantısı (AUDIT 12, Derinleş + ek alıştırmalar) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'orkestrasyon',
    min: 30,
    needs: ['sqlite3'],
    html: `<p>Derste TaskFlow'a kısa bir örnekle girdin ve backfill'in ne olduğunu gördün. Bu bölüm Airflow'un en çok kafa karıştıran üç konusunu açıyor: bir çalışmanın <b>hangi zaman dilimini</b> işlediği (data interval), <b>catchup</b> ile <b>backfill</b> arasındaki fark ve saat yerine <b>veri güncellenince</b> tetiklenen zamanlama. Sonunda aynı akışı Prefect ve Dagster'da da göreceksin.</p>
<h2>Data interval: çalışma, dilimin sonunda başlar</h2>
<p>Airflow'da günlük bir DAG, "1 Ekim" verisini 1 Ekim'de değil, gün <b>bittikten sonra</b> (2 Ekim 00:00'dan sonra) işler; çünkü ancak o zaman günün verisi tamamdır. Her çalışma bir zaman dilimi taşır: <code>data_interval_start</code> (ve onun eşi <code>logical_date</code>, şablonda <code>{{ ds }}</code>) ile <code>data_interval_end</code>. Görevlerin "şimdi"ye değil bu dilime bakması, backfill'in ve yeniden çalıştırmanın doğru sonuç vermesinin tek yoludur.</p>
<div class="tbl-wrap"><table><tr><th>Çalışma</th><th>data_interval_start (ds)</th><th>data_interval_end</th><th>Gerçekte başladığı an</th></tr>
<tr><td>Günlük, 1. çalışma</td><td>2024-10-01 00:00</td><td>2024-10-02 00:00</td><td>2024-10-02 00:00 sonrası</td></tr>
<tr><td>Günlük, 2. çalışma</td><td>2024-10-02 00:00</td><td>2024-10-03 00:00</td><td>2024-10-03 00:00 sonrası</td></tr></table></div>
<p>Dilim <b>yarı açıktır</b>: başlangıç dahil, bitiş hariç. SQL'de bunun karşılığı <code>zaman &gt;= :bas AND zaman &lt; :bit</code>'tir; <code>BETWEEN</code> iki ucu da dahil eder ve gece yarısındaki kayıtları iki güne birden yazar.</p>
<pre class="py">import veri
from datetime import date, timedelta
conn = veri.baglan("lezzet_kurye", tablolar=["lk_orders"])

def gunluk_siparis(ds: date) -&gt; int:           # görev: yalnız kendi dilimine bakar
    bas, bit = ds.isoformat(), (ds + timedelta(days=1)).isoformat()
    return conn.execute("SELECT COUNT(*) FROM lk_orders WHERE placed_at &gt;= ? AND placed_at &lt; ?",
                        (bas, bit)).fetchone()[0]

ds = date(2024, 10, 1)                         # backfill: 1-7 Ekim
while ds &lt;= date(2024, 10, 7):
    print(ds, gunluk_siparis(ds))
    ds += timedelta(days=1)</pre>
<h2>TaskFlow derinlemesine</h2>
<pre class="code">from airflow.decorators import dag, task      # Airflow 3: from airflow.sdk import dag, task
from datetime import datetime

@dag(schedule="@daily", start_date=datetime(2024, 10, 1), catchup=False,
     max_active_runs=1, default_args={"retries": 2})
def lezzet_gunluk():
    @task
    def subeler() -&gt; list[str]:
        return ["izmir", "ankara", "istanbul"]

    @task
    def cek(sube: str, data_interval_start=None) -&gt; str:   # bağlam argümanı adla enjekte edilir
        ds = data_interval_start.strftime("%Y-%m-%d")
        return f"s3://ham/{sube}/{ds}.parquet"              # XCom'a veri değil YOL koy

    @task(multiple_outputs=True)
    def ozet(yollar: list[str]) -&gt; dict:
        return {"dosya": len(yollar), "durum": "tamam"}

    yollar = cek.expand(sube=subeler())       # dinamik eşleme: her şube için bir görev örneği
    ozet(yollar)

lezzet_gunluk()</pre>
<p><code>.expand()</code> dinamik görev eşlemesidir (dynamic task mapping): şube sayısı çalışma anında belirlenir ve her biri ayrı, ayrı yeniden denenebilen bir görev olur. <code>multiple_outputs=True</code> sözlüğün her anahtarını ayrı XCom yapar. <code>max_active_runs=1</code> aynı DAG'ın iki gününün aynı anda çalışmasını engeller.</p>
<h2>catchup mı, backfill mi?</h2>
<div class="tbl-wrap"><table><tr><th></th><th>catchup=True</th><th>Backfill</th></tr>
<tr><td>Kim başlatır?</td><td>Zamanlayıcı, kendiliğinden</td><td>Sen, komutla</td></tr>
<tr><td>Hangi dilimler?</td><td><code>start_date</code>'ten bugüne kadar çalışmamış <b>tüm</b> dilimler</td><td>Verdiğin aralık (<code>-s</code> ile <code>-e</code>)</td></tr>
<tr><td>Ne zaman tehlikeli?</td><td>Eski start_date ile yeni DAG açınca yüzlerce çalışma kuyruğa girer</td><td>Görev idempotent değilse veri ikilenir</td></tr></table></div>
<pre class="code">airflow dags backfill lezzet_gunluk -s 2024-10-01 -e 2024-10-07       # Airflow 2
airflow backfill create --dag-id lezzet_gunluk \\
    --from-date 2024-10-01 --to-date 2024-10-07 --max-active-runs 2   # Airflow 3</pre>
<p>Pratik kural: yeni DAG'ları <code>catchup=False</code> ile aç, geçmişi gerekiyorsa bilinçli bir backfill komutuyla ve <code>max_active_runs</code> sınırıyla doldur. <code>depends_on_past=True</code> bir günün görevi, bir önceki günün aynı görevi başarılı olmadan başlamasın der; kümülatif tablolarda (dünkü bakiye + bugünkü hareket) gereklidir.</p>
<h2>Veri farkındalıklı zamanlama: dataset ve asset</h2>
<p>"Her gün 02:00'de çalış" yerine "<code>siparisler</code> tablosu güncellenince çalış" demek, üreticisi gecikince tüketicinin boş veriyle çalışmasını önler. Airflow 2.4+ bunu <code>Dataset</code>, Airflow 3 <code>Asset</code> adıyla yapar: üretici görev <code>outlets</code> ile neyi güncellediğini bildirir, tüketici DAG <code>schedule=[...]</code> ile bekler. Listedeki <b>tüm</b> varlıklar son çalışmadan beri güncellenince tetiklenir.</p>
<pre class="code">from airflow.sdk import Asset, dag, task
siparisler = Asset("s3://ambar/siparisler")
kuryeler = Asset("s3://ambar/kuryeler")

@dag(schedule="@hourly")
def uretici():
    @task(outlets=[siparisler])
    def yaz(): ...
    yaz()

@dag(schedule=[siparisler, kuryeler])        # ikisi de güncellenince
def kurye_performans():
    ...</pre>
<h2>Aynı akış Prefect ve Dagster'da</h2>
<pre class="code"># Prefect: sıradan Python, @flow ve @task
from prefect import flow, task
@task(retries=2)
def cek(sube: str, gun: str) -&gt; str: ...
@flow
def lezzet_gunluk(gun: str):
    yollar = cek.map(["izmir", "ankara"], gun)

# Dagster: varlık (asset) odaklı; "hangi tablo neyden üretilir"
from dagster import asset, DailyPartitionsDefinition
gunluk = DailyPartitionsDefinition(start_date="2024-10-01")
@asset(partitions_def=gunluk)
def ham_siparis(context): ...
@asset(partitions_def=gunluk)
def gunluk_ozet(ham_siparis): ...           # bağımlılık parametre adından çıkar</pre>
<p>Prefect'te zamanlama ve dağıtım akıştan ayrıdır, dinamik akışlar doğaldır. Dagster'da birincil kavram görev değil <b>tablo</b>dur; bölümler (partitions) backfill'i "şu günlerin bölümlerini yeniden üret" düğmesine indirir ve soy ağacı (lineage) kendiliğinden çizilir.</p>
<div class="note"><b>Gerçek işte</b>Orkestrasyon hatalarının çoğu araçtan değil zaman kavramından çıkar: "şimdi"ye bakan görev, <code>BETWEEN</code> ile çift sayılan gece yarısı, saat dilimi olmayan <code>start_date</code>, idempotent olmayan yükleme. Mülakatta "Dünün işini yeniden çalıştırırsan ne olur?" sorusuna net cevap verebilmek, Airflow'un bütün menülerini bilmekten değerlidir.</div>`,
    ex: [
      {
        t: 'mc',
        id: 'orkestrasyon-y1',
        stage: 'Isınma',
        q: '<code>schedule="@daily"</code>, <code>start_date=2024-10-01</code> olan bir DAG\'ın ilk çalışması ne zaman başlar ve hangi veriyi işler?',
        o: ['1 Ekim 00:00\'da başlar, 1 Ekim verisini işler', '2 Ekim 00:00 sonrası başlar, 1 Ekim verisini işler', '2 Ekim 00:00 sonrası başlar, 2 Ekim verisini işler', '1 Ekim 00:00\'da başlar, 30 Eylül verisini işler'],
        a: 1,
        why: 'Airflow bir dilimi o dilim bittikten sonra çalıştırır: [1 Ekim 00:00, 2 Ekim 00:00) diliminin çalışması 2 Ekim 00:00\'dan sonra başlar ve ds = 2024-10-01 olur. Bu yüzden görevler "bugün"e değil data_interval_start/ds değerine bakmalıdır.'
      },
      {
        t: 'mc',
        id: 'orkestrasyon-y2',
        stage: 'Isınma',
        q: 'Yeni bir günlük DAG\'ı <code>start_date</code> 90 gün önce olacak şekilde <code>catchup=True</code> ile açtın. Ne olur?',
        o: [
          'Yalnız bugünün çalışması oluşur',
          'Zamanlayıcı geçmiş 90 dilimin hepsi için çalışma oluşturur',
          'DAG hata verir; geçmiş tarihli start_date yasaktır',
          'Geçmiş dilimler için yalnız başarısız görevler yeniden denenir'
        ],
        a: 1,
        why: 'catchup=True, start_date\'ten bu yana çalışmamış her dilim için kendiliğinden çalışma oluşturur. max_active_runs sınırlı değilse kaynaklar dolar. Yeni DAG\'ları catchup=False ile açıp geçmişi bilinçli bir backfill ile doldurmak daha güvenlidir.'
      },
      {
        t: 'predict',
        id: 'orkestrasyon-y3',
        stage: 'Kodu oku',
        needs: ['sqlite3'],
        q: 'Gerçek <code>lk_orders</code> tablosunda 1-3 Ekim için iki sorgu: bu kod ne yazdırır?',
        o: ['115 166', '166 166', '115 115', '166 115'],
        a: 0,
        code: 'import veri\nc = veri.baglan("lezzet_kurye", tablolar=["lk_orders"])\na = c.execute("SELECT COUNT(*) FROM lk_orders WHERE placed_at BETWEEN \'2024-10-01\' AND \'2024-10-03\'").fetchone()[0]\nb = c.execute("SELECT COUNT(*) FROM lk_orders WHERE placed_at >= \'2024-10-01\' AND placed_at < \'2024-10-04\'").fetchone()[0]\nprint(a, b)\n',
        why: 'placed_at metin olarak "2024-10-03 11:20:00" biçimindedir ve "2024-10-03"ten büyüktür; BETWEEN üst sınırı 3 Ekim\'in tüm siparişlerini dışarıda bırakır (62 + 53 = 115). Yarı açık aralık (>= başlangıç, &lt; ertesi gün) üç günü eksiksiz alır: 62 + 53 + 51 = 166.'
      },
      {
        t: 'order',
        id: 'orkestrasyon-y4',
        stage: 'Kodu oku',
        q: '<p>Haftalık bir DAG\'ın backfill dilimlerini (yarı açık) üreten programın satırlarını sırala. Beklenen çıktı:</p><pre class="out">2024-10-07 → 2024-10-14\n2024-10-14 → 2024-10-21</pre>',
        lines: ['from datetime import date, timedelta', 'adim = timedelta(weeks=1)', 'bas, son = date(2024, 10, 7), date(2024, 10, 21)', 'while bas + adim <= son:', '    print(bas, "→", bas + adim)', '    bas += adim'],
        expect: '2024-10-07 → 2024-10-14\n2024-10-14 → 2024-10-21\n',
        hint: 'Adım ve sınırlar döngüden önce tanımlanır; yazdırma, ilerletmeden önce gelir.',
        why: 'Koşul "dilimin sonu bitişi geçmesin" der; böylece yalnız tamamlanmış haftalar işlenir. bas += adim döngünün son satırı olmalı, yoksa ilk dilim atlanır.'
      },
      {
        t: 'code',
        id: 'orkestrasyon-y5',
        stage: 'Rehberli',
        diff: 2,
        q: '<p><code>dilimler(baslangic, bitis, adim_saat=24)</code> yaz: <code>baslangic</code> ve <code>bitis</code> <code>"YYYY-MM-DD HH:MM"</code> metinleri. <code>baslangic</code>\'ten başlayarak <code>adim_saat</code> uzunluğunda <b>yarı açık</b> dilimler üret; dilimin sonu <code>bitis</code>\'i aşmıyorsa listeye ekle. Her dilimi <code>("YYYY-MM-DD HH:MM", "YYYY-MM-DD HH:MM")</code> demeti olarak döndür.</p>',
        guide: [
          'İki metni datetime.strptime(m, "%Y-%m-%d %H:%M") ile çevir.',
          'adim = timedelta(hours=adim_saat).',
          'while bas + adim &lt;= bit: dilimi ekle, bas\'ı adım kadar ilerlet.',
          'Demetleri strftime ile aynı biçime geri çevir.'
        ],
        example: 'from datetime import datetime, timedelta\nt = datetime.strptime("2024-10-01 06:00", "%Y-%m-%d %H:%M")\nprint((t + timedelta(hours=6)).strftime("%Y-%m-%d %H:%M"))\n',
        start: 'from datetime import datetime, timedelta\n\nBICIM = "%Y-%m-%d %H:%M"\n\ndef dilimler(baslangic, bitis, adim_saat=24):\n    sonuc = []\n    # TODO: metinleri datetime\'a çevir, adımı hesapla\n    # TODO: dilim sonu bitişi aşmadıkça ekle\n    return sonuc\n',
        sol: 'from datetime import datetime, timedelta\n\nBICIM = "%Y-%m-%d %H:%M"\n\ndef dilimler(baslangic, bitis, adim_saat=24):\n    bas = datetime.strptime(baslangic, BICIM)\n    bit = datetime.strptime(bitis, BICIM)\n    adim = timedelta(hours=adim_saat)\n    sonuc = []\n    while bas + adim <= bit:\n        sonuc.append((bas.strftime(BICIM), (bas + adim).strftime(BICIM)))\n        bas += adim\n    return sonuc\n',
        tests: 'assert dilimler("2024-10-01 00:00", "2024-10-03 00:00") == [("2024-10-01 00:00", "2024-10-02 00:00"), ("2024-10-02 00:00", "2024-10-03 00:00")], "İki tam gün"\nassert dilimler("2024-10-01 00:00", "2024-10-02 12:00") == [("2024-10-01 00:00", "2024-10-02 00:00")], "Yarım kalan dilim işlenmez"\nassert len(dilimler("2024-10-01 00:00", "2024-10-02 00:00", adim_saat=6)) == 4, "Günde 4 adet 6 saatlik dilim"\nassert dilimler("2024-10-31 22:00", "2024-11-01 01:00", adim_saat=1)[-1] == ("2024-11-01 00:00", "2024-11-01 01:00"), "Ay geçişi doğru olmalı"\nassert dilimler("2024-10-01 00:00", "2024-10-01 00:00") == [], "Boş aralık"\n',
        hints: [
          'Tarih aritmetiğini metinle değil datetime + timedelta ile yap; ay ve yıl geçişleri kendiliğinden çözülür.',
          'Koşul bas + adim &lt;= bit: dilimin SONU bitişi geçmemeli.',
          'sonuc.append((bas.strftime(BICIM), (bas + adim).strftime(BICIM)))'
        ],
        why: 'Airflow\'un zamanlayıcısı ve backfill komutu bu hesabı yapar: tamamlanmamış dilim çalıştırılmaz. Saatlik ve günlük DAG\'larda aynı mantık; yalnız adım değişir.'
      },
      {
        t: 'code',
        id: 'orkestrasyon-y6',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p>Zamanlayıcının catchup davranışını yaz: <code>olusturulacak(start_date, simdi, catchup, son_calisan=None)</code> günlük bir DAG için oluşturulacak çalışmaların <code>ds</code> değerlerini (<code>date</code> listesi) döndürsün. Kurallar: Bir dilim, sonu (<code>ds + 1 gün</code>, gece yarısı) <code>simdi</code>\'den küçük ya da eşitse tamamlanmıştır. <code>son_calisan</code> verilirse ondan sonraki günlerden başla, verilmezse <code>start_date</code>\'ten. <code>catchup=True</code> ise tamamlanmış ve henüz çalışmamış tüm dilimler; <code>catchup=False</code> ise yalnız en sonuncusu (hiç yoksa boş liste).</p>',
        start: 'from datetime import date, datetime, timedelta\n\ndef olusturulacak(start_date, simdi, catchup, son_calisan=None):\n    pass\n',
        sol: 'from datetime import date, datetime, timedelta\n\ndef olusturulacak(start_date, simdi, catchup, son_calisan=None):\n    ds = son_calisan + timedelta(days=1) if son_calisan else start_date\n    tamam = []\n    while datetime.combine(ds + timedelta(days=1), datetime.min.time()) <= simdi:\n        tamam.append(ds)\n        ds += timedelta(days=1)\n    if catchup:\n        return tamam\n    return tamam[-1:]\n',
        tests: 'S = datetime(2024, 10, 5, 3, 0)\nassert olusturulacak(date(2024, 10, 1), S, True) == [date(2024, 10, d) for d in (1, 2, 3, 4)], "5 Ekim 03:00\'te 1-4 Ekim dilimleri tamamlanmış"\nassert olusturulacak(date(2024, 10, 1), S, False) == [date(2024, 10, 4)], "catchup=False yalnız en son tamamlanan dilim"\nassert olusturulacak(date(2024, 10, 1), S, True, son_calisan=date(2024, 10, 2)) == [date(2024, 10, 3), date(2024, 10, 4)], "Son çalışandan sonrası"\nassert olusturulacak(date(2024, 10, 5), S, True) == [], "5 Ekim dilimi henüz bitmedi"\nassert olusturulacak(date(2024, 10, 4), datetime(2024, 10, 5, 0, 0), True) == [date(2024, 10, 4)], "Dilim sonu tam gece yarısında tamamlanmış sayılır"\n',
        hints: [
          'Başlangıç günü: son_calisan varsa ertesi gün, yoksa start_date.',
          'Dilim sonunu datetime.combine(ds + 1 gün, saat 00:00) ile hesaplayıp simdi ile karşılaştır.',
          'catchup False ise listenin son elemanı: tamam[-1:] (boşsa boş döner).'
        ],
        why: 'catchup=False olsa bile Airflow en son tamamlanan dilimi çalıştırır; geçmişin kalanını atlar. Bir DAG\'ı haftalarca durdurup açtığında catchup=True ise birikmiş tüm günler çalışır; bu davranışı önceden hesaplayabilmek sürprizleri önler.'
      },
      {
        t: 'code',
        id: 'orkestrasyon-y7',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p>Veri farkındalıklı zamanlama: <code>tetiklenenler(dagler, olaylar)</code> yaz. <code>dagler</code> sözlüğü DAG adını beklediği varlık (asset) kümesine eşler. <code>olaylar</code>, sırayla güncellenen varlık adlarının listesidir. Bir DAG, son tetiklenmesinden beri beklediği <b>tüm</b> varlıklar en az bir kez güncellenince tetiklenir ve sayacı sıfırlanır. Tetiklenmeleri oluş sırasıyla <code>(olay_indeksi, dag_adi)</code> listesi olarak döndür; aynı olayda birden çok DAG tetiklenirse DAG adına göre alfabetik sırala.</p>',
        start: 'def tetiklenenler(dagler, olaylar):\n    pass\n',
        sol: 'def tetiklenenler(dagler, olaylar):\n    gorulen = {d: set() for d in dagler}\n    sonuc = []\n    for i, varlik in enumerate(olaylar):\n        for d in sorted(dagler):\n            if varlik in dagler[d]:\n                gorulen[d].add(varlik)\n                if gorulen[d] == dagler[d]:\n                    sonuc.append((i, d))\n                    gorulen[d] = set()\n    return sonuc\n',
        tests: 'D = {"kurye_performans": {"siparisler", "kuryeler"}, "gunluk_ozet": {"siparisler"}}\nO = ["siparisler", "siparisler", "kuryeler", "kuryeler", "siparisler"]\nassert tetiklenenler(D, O) == [(0, "gunluk_ozet"), (1, "gunluk_ozet"), (2, "kurye_performans"), (4, "gunluk_ozet"), (4, "kurye_performans")], f"Gelen: {tetiklenenler(D, O)}"\nassert tetiklenenler(D, ["kuryeler", "kuryeler"]) == [], "siparisler güncellenmeden kurye_performans tetiklenmez"\nassert tetiklenenler({}, O) == [], "DAG yoksa tetikleme yok"\n',
        hints: ['Her DAG için "son tetiklenmeden beri görülen varlıklar" kümesi tut.', 'Görülen küme beklenen kümeye eşit olunca tetikle ve kümeyi sıfırla.', 'Aynı olayda alfabetik sıra için DAG\'ları sorted(dagler) ile gez.'],
        why: 'Airflow\'da schedule=[A, B] "ikisi de güncellenince" demektir; A iki kez güncellense de B gelene kadar beklenir ve tek çalışma oluşur. Bu, üretici geciktiğinde tüketicinin yarım veriyle çalışmasını engeller.'
      },
      {
        t: 'code',
        id: 'orkestrasyon-y8',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        needs: ['sqlite3'],
        q: '<p>Hatayı bul ve düzelt. <code>gunluk_say(conn, ds)</code> bir Airflow görevinin içidir: <code>ds</code> (<code>"YYYY-MM-DD"</code>) gününün <code>lk_orders</code> siparişlerini saymalı. Backfill sonrası günlük sayıların toplamı aralıktaki toplam siparişi tutmuyor; hatta her gün 0 çıkıyor.</p>',
        start: 'from datetime import date, timedelta\n\ndef gunluk_say(conn, ds):\n    return conn.execute(\n        "SELECT COUNT(*) FROM lk_orders WHERE placed_at BETWEEN ? AND ?", (ds, ds)\n    ).fetchone()[0]\n',
        sol: 'from datetime import date, timedelta\n\ndef gunluk_say(conn, ds):\n    ertesi = (date.fromisoformat(ds) + timedelta(days=1)).isoformat()\n    return conn.execute(\n        "SELECT COUNT(*) FROM lk_orders WHERE placed_at >= ? AND placed_at < ?", (ds, ertesi)\n    ).fetchone()[0]\n',
        tests: 'import veri\nc = veri.baglan("lezzet_kurye", tablolar=["lk_orders"])\ngunler = [(date(2024, 10, 1) + timedelta(days=i)).isoformat() for i in range(7)]\nsayilar = [gunluk_say(c, g) for g in gunler]\nassert sayilar == [62, 53, 51, 49, 86, 69, 62], f"1-7 Ekim günlük sipariş sayıları yanlış: {sayilar}"\ntoplam = c.execute("SELECT COUNT(*) FROM lk_orders WHERE placed_at >= \'2024-10-01\' AND placed_at < \'2024-10-08\'").fetchone()[0]\nassert sum(sayilar) == toplam, "Günlük toplamlar haftalık toplamı tutmalı (yarı açık dilimler örtüşmez, boşluk bırakmaz)"\n',
        hints: ['placed_at "2024-10-01 11:07:01" biçiminde; "2024-10-01" ile BETWEEN neyi yakalar?', 'Dilimi [ds, ds + 1 gün) olarak tanımla.', 'ertesi = (date.fromisoformat(ds) + timedelta(days=1)).isoformat()'],
        why: 'Tarih-saat sütununu yalnız tarihle BETWEEN\'e sokmak günün tüm saatlerini dışarıda bırakır; iki ucu dahil eden aralık ise gece yarısı kayıtlarını iki güne yazar. Yarı açık aralık hem eksiksiz hem örtüşmesizdir; backfill toplamlarının tutması bunun kanıtıdır.'
      },
      {
        t: 'code',
        id: 'orkestrasyon-y9',
        stage: 'Meydan okuma',
        diff: 3,
        q: '<p>Backfill yürütücüsünü simüle et: <code>backfill(gunler, max_active_runs, depends_on_past, basarisiz)</code>. <code>gunler</code> sıralı tarih metinleri, <code>basarisiz</code> çalışınca hata verecek günlerin kümesi. Çalışmalar <b>dalgalar</b> hâlinde yürür: her dalgada sıradaki en fazla <code>max_active_runs</code> gün aynı anda çalışır. <code>depends_on_past=True</code> ise bir gün, önceki günü başarılı olmadan çalışamaz: dalga yalnız bir gün içerir ve bir başarısızlıktan sonra kalan tüm günler çalışmaz. <code>False</code> ise başarısızlık diğerlerini engellemez. <code>(dalgalar, basarili, calismayan)</code> döndür: dalgalar liste listesi, diğer ikisi sıralı liste.</p>',
        start: 'def backfill(gunler, max_active_runs, depends_on_past, basarisiz):\n    return [], [], []\n',
        sol: 'def backfill(gunler, max_active_runs, depends_on_past, basarisiz):\n    boyut = 1 if depends_on_past else max_active_runs\n    dalgalar, basarili, calismayan = [], [], []\n    i = 0\n    while i < len(gunler):\n        dalga = gunler[i:i + boyut]\n        dalgalar.append(dalga)\n        i += boyut\n        hata = False\n        for g in dalga:\n            if g in basarisiz:\n                hata = True\n            else:\n                basarili.append(g)\n        if hata and depends_on_past:\n            calismayan = gunler[i:]\n            break\n    return dalgalar, sorted(basarili), sorted(calismayan)\n',
        tests: 'G = ["10-01", "10-02", "10-03", "10-04", "10-05"]\nd, b, c = backfill(G, 2, False, {"10-03"})\nassert d == [["10-01", "10-02"], ["10-03", "10-04"], ["10-05"]], f"İkişerli dalgalar: {d}"\nassert b == ["10-01", "10-02", "10-04", "10-05"] and c == [], "depends_on_past=False: hata diğerlerini engellemez"\nd, b, c = backfill(G, 3, True, {"10-03"})\nassert d == [["10-01"], ["10-02"], ["10-03"]], f"depends_on_past: tek tek ve hata sonrası durur: {d}"\nassert b == ["10-01", "10-02"] and c == ["10-04", "10-05"], "Hatadan sonraki günler çalışmaz"\nassert backfill(G, 10, False, set())[0] == [G], "Sınır geniş ise tek dalga"\nassert backfill([], 2, True, set()) == ([], [], []), "Boş aralık"\n',
        hints: ['Dalga boyutu: depends_on_past ise 1, değilse max_active_runs.', 'Listeyi gunler[i:i + boyut] dilimleriyle yürü.', 'depends_on_past ve hata varsa kalan gunler[i:] çalışmayanlardır; döngüden çık.'],
        why: 'max_active_runs kaynakları korur, depends_on_past ise kümülatif tabloların tutarlılığını. İkincisi açıkken bir günün hatası tüm backfill\'i durdurur; bu yüzden ya hatayı düzeltip o günden devam edersin ya da görevi bağımsız (idempotent ve kümülatif olmayan) tasarlarsın.'
      }
    ],
    faq: [
      {
        q: 'Airflow 2 ile Airflow 3 arasında bu konularda ne değişti?',
        a: 'Airflow 3\'te Dataset adı Asset oldu, DAG ve görev API\'si airflow.sdk altına taşındı, backfill zamanlayıcı tarafından yönetilen bir nesne hâline geldi (airflow backfill create) ve logical_date bazı çalışmalarda boş olabilir. Kavramlar (data interval, catchup, idempotentlik) aynı kaldı; kodu taşırken resmi yükseltme kılavuzunu ve ruff\'ın AIR kurallarını kullan.'
      },
      {
        q: 'Saat dilimini nasıl yönetmeliyim?',
        a: 'start_date\'i her zaman saat dilimli ver (pendulum.datetime(2024, 10, 1, tz="Europe/Istanbul")) ya da her şeyi UTC tut. Saat dilimsiz start_date, sunucunun varsayılanına göre yorumlanır ve "gün" sınırları raporla uyuşmaz.'
      }
    ]
  }
);
})(window);
