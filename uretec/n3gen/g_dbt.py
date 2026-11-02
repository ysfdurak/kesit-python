import sys
sys.path.insert(0, '/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad/n3gen')
from emit_n3 import write, ded, py, pc

body = '''
<h2>ETL'den ELT'ye</h2>
<p><i>veri-boru-hatti</i> dersinde veriyi Python'da çıkarıp dönüştürdün, sonra veritabanına yükledin (ETL: extract, transform, load). Bulut ambarları (BigQuery, Snowflake, Redshift) ve DuckDB gibi hızlı analitik motorlar çıkınca sıra değişti: ham veri önce olduğu gibi ambara <b>yüklenir</b>, dönüşüm ambarın içinde <b>SQL ile</b> yapılır. Buna <b>ELT</b> denir. Avantajı: ham veri her zaman elindedir (yeniden hesaplanabilir), dönüşüm ambarın paralel gücüyle çalışır ve iş mantığı analistlerin de okuyabildiği SQL'dedir.</p>
<p>ELT'de yüzlerce SQL dosyası birikir. Hangisi hangisinden önce çalışmalı? Hangi tablo hangi kaynaktan geliyor? Bir sütunu değiştirince ne bozulur? <b>dbt</b> (data build tool) bu soruları çözen açık kaynak araçtır: SQL dosyalarını <b>model</b> olarak düzenler, Jinja şablonlarıyla modüler hale getirir, aralarındaki bağımlılıklardan bir grafik çıkarır, doğru sırada çalıştırır, test eder ve belgeler. Bu derste dbt'nin mantığını öğrenip <b>DuckDB + jinja2</b> ile kendi "mini-dbt"ni yazacak, sonunda <code>kanat_havayollari</code> için katmanlı bir proje kuracaksın.</p>
<div class="tbl-wrap"><table>
<tr><th></th><th>ETL</th><th>ELT</th></tr>
<tr><td>Dönüşüm nerede?</td><td>Ambar dışında (Python, Spark, araç)</td><td>Ambarın içinde (SQL)</td></tr>
<tr><td>Ham veri</td><td>Çoğu zaman saklanmaz</td><td>Ambarda <code>ham</code>/<code>raw</code> şemasında durur</td></tr>
<tr><td>Kim yazar?</td><td>Veri mühendisi</td><td>Analitik mühendisi, analist, mühendis</td></tr>
<tr><td>Araçlar</td><td>Python, Airflow, Spark</td><td>Fivetran/Airbyte (yükleme) + dbt (dönüşüm)</td></tr>
</table></div>
<div class="note"><b>Kendi bilgisayarında dene</b>dbt bir komut satırı aracıdır ve bu sayfadaki motorda çalışmaz. Gri kutulardaki dbt dosyalarını kendi bilgisayarında dene: <code>pip install dbt-duckdb</code>, sonra <code>dbt init kanat</code>. Yeşil kutular ve alıştırmalar aynı mantığı <b>jinja2</b> ve <b>DuckDB</b> ile burada çalıştırır.</div>

<h2>dbt proje yapısı ve katmanlar</h2>
''' + pc('''
kanat/
├── dbt_project.yml          # proje adı, varsayılan materializasyonlar
├── models/
│   ├── staging/             # kaynakla 1-1: yeniden adlandır, tür dönüştür, temizle
│   │   ├── _sources.yml     # ham tablolar (source) tanımı
│   │   ├── stg_ucuslar.sql
│   │   └── stg_gecikmeler.sql
│   ├── intermediate/        # iş mantığı ara adımları (birleştir, taneciğe indir)
│   │   └── int_ucus_gecikme.sql
│   └── marts/               # son kullanıcıya hazır olgu ve boyutlar
│       ├── mart_rota_performans.sql
│       └── _marts.yml       # testler ve belgeler
├── seeds/                   # küçük sabit CSV'ler (kod tabloları)
├── snapshots/               # SCD2 anlık görüntüleri
└── tests/                   # özel (singular) SQL testleri
''') + '''
<ul>
<li><b>sources</b>: yükleme aracının ambara bıraktığı ham tablolar. Modeller ham tabloya adıyla değil <code>{{ source('kanat', 'hv_flights') }}</code> ile erişir.</li>
<li><b>staging</b> (<code>stg_</code>): her kaynak tablo için bir model. Sütunları yeniden adlandırır, türleri dönüştürür, birimleri düzeltir. JOIN yok, iş mantığı yok.</li>
<li><b>intermediate</b> (<code>int_</code>): staging modellerini birleştirir, taneciği değiştirir (ör. gecikme nedenlerini uçuş düzeyine toplar).</li>
<li><b>marts</b> (<code>mart_</code>, <code>fct_</code>, <code>dim_</code>): panolara ve analistlere açılan son tablolar; <i>veri-modelleme</i> dersindeki yıldız şema burada kurulur.</li>
</ul>
''' + pc('''
-- models/staging/stg_ucuslar.sql
select
    flight_id,
    flight_no                                as ucus_no,
    route_id,
    status                                   as durum,
    cast(sched_dep as timestamp)             as plan_kalkis,
    date_diff('minute', cast(sched_dep as timestamp), cast(actual_dep as timestamp)) as kalkis_gecikme_dk
from {{ source('kanat', 'hv_flights') }}

-- models/marts/mart_rota_performans.sql
{{ config(materialized='table') }}
select r.rota, count(*) as ucus,
       avg(case when u.kalkis_gecikme_dk <= 15 then 1 else 0 end) as zamaninda_oran
from {{ ref('stg_ucuslar') }} u
join {{ ref('stg_rotalar') }} r using (route_id)
where u.durum <> 'cancelled'
group by 1
''') + '''

<h2>ref() ve bağımlılık grafiği</h2>
<p>dbt'nin kalbi <code>ref()</code> fonksiyonudur. Model içinde <code>{{ ref('stg_ucuslar') }}</code> yazdığında iki şey olur: (1) şablon derlenirken bu ifade gerçek tablo adına (<code>analytics.stg_ucuslar</code>) dönüşür; (2) dbt "bu model stg_ucuslar'a bağımlı" diye not alır. Tüm modellerin notlarından yönlü, döngüsüz bir grafik (DAG: directed acyclic graph) çıkar; dbt modelleri bu grafiğin <b>topolojik sırasıyla</b> çalıştırır. Tablo adını elle yazarsan bağımlılık kaybolur ve sıra bozulur. Bunu jinja2 ile kendin kurabilirsin:</p>
''' + py('''
from jinja2 import Template

def derle(sablon, sema="analytics"):
    bagimliliklar = []
    def ref(ad):
        bagimliliklar.append(ad)      # derlerken bağımlılığı kaydet
        return f"{sema}.{ad}"
    sql = Template(sablon).render(ref=ref)
    return sql, bagimliliklar

sablon = "select * from {{ ref('stg_ucuslar') }} u join {{ ref('stg_rotalar') }} r using (route_id)"
sql, bag = derle(sablon)
print(sql)
print(bag)
''') + '''
<p>Python'un standart kütüphanesindeki <code>graphlib.TopologicalSorter</code> bağımlılık grafiğini sıralar ve döngü varsa <code>CycleError</code> verir:</p>
''' + py('''
from graphlib import TopologicalSorter

graf = {                              # model: [bağımlı olduğu modeller]
    "stg_ucuslar": [],
    "stg_rotalar": [],
    "stg_gecikmeler": [],
    "int_ucus_gecikme": ["stg_gecikmeler"],
    "mart_rota_performans": ["stg_ucuslar", "stg_rotalar", "int_ucus_gecikme"],
}
print(list(TopologicalSorter(graf).static_order()))
''') + '''

<h2>Jinja ile modüler SQL: makrolar</h2>
<p>Jinja; değişken (<code>{{ }}</code>), kontrol yapısı (<code>{% for %}</code>, <code>{% if %}</code>) ve makro (<code>{% macro %}</code>) sağlar. Tekrar eden SQL'i (ör. kuruşu liraya çevirmek, para birimi sütunları) bir makroya alırsın; dbt paketleri (<code>dbt_utils</code>) yüzlerce hazır makro sunar.</p>
''' + py('''
from jinja2 import Template

sablon = """
{%- macro dk_to_saat(sutun) -%} round({{ sutun }} / 60.0, 2) {%- endmacro -%}
select
{%- for s in sutunlar %}
    {{ dk_to_saat(s) }} as {{ s }}_saat{{ "," if not loop.last }}
{%- endfor %}
from ucuslar
"""
print(Template(sablon).render(sutunlar=["blok_dk", "gecikme_dk"]))
''') + '''

<h2>Materializasyon: view, table, incremental</h2>
<div class="tbl-wrap"><table>
<tr><th>Tür</th><th>Ne üretir?</th><th>Ne zaman?</th></tr>
<tr><td><code>view</code></td><td><code>CREATE VIEW</code>; her sorguda yeniden hesaplanır</td><td>Staging, hafif modeller (varsayılan)</td></tr>
<tr><td><code>table</code></td><td><code>CREATE TABLE AS</code>; her çalışmada baştan</td><td>Panoların okuduğu martlar</td></tr>
<tr><td><code>incremental</code></td><td>İlk çalışmada tablo; sonra yalnız yeni satırları ekler</td><td>Milyonlarca satırlık olay/işlem tabloları</td></tr>
<tr><td><code>ephemeral</code></td><td>Tablo üretmez; kullanan modele CTE olarak gömülür</td><td>Küçük ara adımlar</td></tr>
</table></div>
''' + pc('''
-- models/marts/fct_rezervasyon.sql
{{ config(materialized='incremental', unique_key='booking_id') }}
select * from {{ ref('stg_rezervasyonlar') }}
{% if is_incremental() %}
  -- yalnız hedefte olan en yeni kayıttan sonrakiler (watermark)
  where rezervasyon_zamani > (select max(rezervasyon_zamani) from {{ this }})
{% endif %}
''') + '''
<p>Artımlı modelin üç riski vardır: geç gelen kayıtlar (watermark'tan eski zaman damgasıyla gelir, kaçırılır), güncellenen kayıtlar (<code>unique_key</code> ile upsert gerekir) ve şema değişikliği. Çözüm: watermark'a küçük bir geri bakma payı (lookback) eklemek, <code>unique_key</code> vermek ve ara sıra <code>dbt run --full-refresh</code> çalıştırmak.</p>

<h2>Testler</h2>
<p>dbt'de test, <b>hatalı satırları döndüren</b> bir SQL sorgusudur: 0 satır dönerse test geçer. Dört yerleşik genel (generic) test YAML'da tanımlanır:</p>
''' + pc('''
# models/marts/_marts.yml
models:
  - name: stg_ucuslar
    description: "Her satır bir planlı uçuş."
    columns:
      - name: flight_id
        tests: [unique, not_null]
      - name: durum
        tests:
          - accepted_values: {values: ['landed', 'cancelled', 'diverted']}
      - name: route_id
        tests:
          - relationships: {to: ref('stg_rotalar'), field: route_id}
''') + '''
<div class="tbl-wrap"><table>
<tr><th>Test</th><th>Hatalı satırı bulan SQL</th></tr>
<tr><td>unique</td><td><code>select k from t group by k having count(*) &gt; 1</code></td></tr>
<tr><td>not_null</td><td><code>select * from t where k is null</code></td></tr>
<tr><td>accepted_values</td><td><code>select * from t where k not in ('a', 'b')</code></td></tr>
<tr><td>relationships</td><td><code>select c.* from cocuk c left join ebeveyn p on c.k = p.k where c.k is not null and p.k is null</code></td></tr>
</table></div>
''' + py('''
import duckdb
import veri

con = duckdb.connect()
con.execute(f"CREATE VIEW ucus AS SELECT * FROM read_csv('{veri.yol('kanat_havayollari', 'hv_flights')}')")
TESTLER = {
    "unique": "select {s} from {t} group by {s} having count(*) > 1",
    "not_null": "select * from {t} where {s} is null",
}
for tur, sablon in TESTLER.items():
    for sutun in ["flight_id", "actual_dep"]:
        hatali = con.execute(f"select count(*) from ({sablon.format(t='ucus', s=sutun)})").fetchone()[0]
        print(f"{tur:9} {sutun:11} -> {'GEÇTİ' if hatali == 0 else f'KALDI ({hatali})'}")
''') + '''
<p><code>actual_dep</code> üzerindeki <code>not_null</code> testi 62 iptal uçuş yüzünden kalır. Bu bir veri hatası değil, kuralın eksikliğidir: test <code>where: "status &lt;&gt; 'cancelled'"</code> koşuluyla yazılmalıdır. Testler, iş kuralını açıkça yazmaya zorlar. Özel (singular) testler <code>tests/</code> klasöründe tek bir SQL dosyasıdır, ör. "iniş zamanı kalkıştan önce olamaz".</p>

<h2>Belgeleme ve köken (lineage)</h2>
<p><code>dbt docs generate</code> YAML'daki açıklamalardan ve bağımlılık grafiğinden bir web sitesi üretir: her modelin sütunları, testleri ve köken grafiği. Köken grafiği iki soruyu yanıtlar: "Bu sayı nereden geliyor?" (yukarı akış, upstream) ve "Bu tabloyu değiştirirsem ne bozulur?" (aşağı akış, downstream: etki analizi). Seçici sözdizimi de bu grafiğe dayanır: <code>dbt run --select +mart_rota_performans</code> modeli ve tüm atalarını, <code>stg_ucuslar+</code> modeli ve tüm torunlarını çalıştırır.</p>

<h2>Snapshot ve seed</h2>
<p><b>Snapshot</b>, kaynak tablodaki değişiklikleri SCD tip 2 olarak saklar (<i>veri-modelleme</i> dersi). dbt her çalışmada izlenen sütunları karşılaştırır, değişen satırın eski sürümüne <code>dbt_valid_to</code> yazar ve yeni sürüm ekler. <b>Seed</b> ise depoda tutulan küçük CSV dosyalarıdır (gecikme neden kodları, ülke-bölge eşlemesi); <code>dbt seed</code> onları tabloya yükler ve modeller <code>ref()</code> ile kullanır.</p>
''' + pc('''
-- snapshots/yolcu_snapshot.sql
{% snapshot yolcu_snapshot %}
{{ config(target_schema='snapshots', unique_key='passenger_id',
          strategy='check', check_cols=['tier', 'city']) }}
select * from {{ source('kanat', 'hv_passengers') }}
{% endsnapshot %}
''') + '''
<div class="tbl-wrap"><table>
<tr><th>Komut</th><th>Ne yapar?</th></tr>
<tr><td><code>dbt run</code></td><td>Modelleri DAG sırasıyla çalıştırır</td></tr>
<tr><td><code>dbt test</code></td><td>Tüm testleri çalıştırır</td></tr>
<tr><td><code>dbt build</code></td><td>Seed, run, snapshot ve test'i DAG sırasında birlikte yapar; testi kalan modelin torunlarını atlar</td></tr>
<tr><td><code>dbt run --select +mart_x</code></td><td>Model ve ataları</td></tr>
<tr><td><code>dbt docs generate &amp;&amp; dbt docs serve</code></td><td>Belge sitesi ve köken grafiği</td></tr>
</table></div>
<div class="note"><b>Gerçek işte</b>Analitik mühendisliği ekiplerinde her model bir çekme isteğiyle (pull request) gelir; CI hattı yalnız değişen modelleri ve torunlarını derleyip test eder (<code>--select state:modified+</code>). Testsiz mart, açıklamasız sütun ve <code>ref</code> yerine elle yazılmış tablo adı kod incelemesinde geri çevrilir. Pazartesi sabahı "pano neden boş?" sorusunun cevabı çoğunlukla bir kaynak tablonun gecikmesidir; bu yüzden kaynaklara tazelik (freshness) testi de eklenir.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Model sözleşmeleri ve sürümleme</h3>
<p>dbt 1.5 ile gelen <b>contract</b> özelliği bir martın sütun adlarını ve türlerini sabitler; model bu sözleşmeye uymazsa derleme başarısız olur. Panolara ve diğer ekiplere açılan modeller için kırılmaz bir API gibi davranır; büyük değişikliklerde model sürümleri (<code>v2</code>) yayınlanır.</p>
<h3>İdempotentlik ve yeniden çalıştırma</h3>
<p>Her model, aynı girdiyle tekrar çalıştırıldığında aynı sonucu vermelidir. <code>table</code> ve <code>view</code> bunu kendiliğinden sağlar; <code>incremental</code> modellerde <code>unique_key</code> ve doğru watermark karşılaştırması (<code>&gt;</code> ile <code>&gt;=</code> farkı) kritik hale gelir.</p>
<h3>Orkestrasyonla ilişki</h3>
<p>dbt yalnızca dönüşümü yapar; ne zaman çalışacağını Airflow, Dagster ya da Prefect belirler (<i>orkestrasyon</i> dersi). Dagster ve Astronomer Cosmos, dbt grafiğini her model ayrı görev olacak şekilde orkestratöre taşır.</p>
<h3>Semantik katman</h3>
<p>Aynı "aktif müşteri" tanımının her panoda farklı hesaplanmasını önlemek için ölçüler (metrics) dbt'nin semantik katmanında bir kez tanımlanır; BI araçları bu tanımı sorgular. Power BI'daki ölçü tabloları ile aynı fikirdir.</p>
</section>
'''

ex = []
ex += [
    {'t': 'mc', 'stage': 'Isınma',
     'q': 'ELT yaklaşımının ETL\'ye göre en belirgin avantajı hangisidir?',
     'o': ['Ambara hiç ham veri yüklenmez, depolamadan tasarruf edilir', 'Ham veri ambarda kalır; dönüşüm yeniden çalıştırılabilir', 'Python bilmeyen hiç kimse veri hattına dokunamaz', 'Dönüşümler ambarın dışında, ayrı sunucuda çalışır'],
     'a': 1,
     'why': 'ELT\'de ham veri ambarda saklanır; bir dönüşüm hatası bulunduğunda kaynaktan yeniden çekmeden modelleri baştan çalıştırabilirsin. Dönüşüm ambarın içinde, ambarın gücüyle ve okunabilir SQL ile yapılır.'},
    {'t': 'mc', 'stage': 'Isınma',
     'q': 'Bir dbt modelinde <code>select * from analytics.stg_ucuslar</code> yazmak yerine <code>{{ ref(\'stg_ucuslar\') }}</code> kullanmanın temel nedeni nedir?',
     'o': ['ref daha kısa yazılır ve okunması kolaylaşır', 'ref bağımlılığı kaydeder; sıra ve şema doğru belirlenir', 'Elle yazılan tablo adı SQL\'de her zaman hata verir', 'ref sorgu sonucunu önbelleğe alıp modeli hızlandırır'],
     'a': 1,
     'why': 'ref() derleme sırasında hem doğru şemayı (geliştirme, test, üretim) yerleştirir hem de bağımlılık grafiğine kenar ekler. Elle yazılan ad çalışır ama dbt bağımlılığı bilmez; model kaynağından önce çalışabilir ve köken grafiği eksik kalır.'},
    {'t': 'mc', 'stage': 'Isınma',
     'q': 'Artımlı (incremental) bir modelde <code>where olay_zamani &gt; (select max(olay_zamani) from {{ this }})</code> filtresi kullanılıyor. Hangi kayıtlar <b>kaçırılabilir</b>?',
     'o': ['İlk çalıştırmada kaynaktan gelen tüm kayıtlar', 'Watermark\'tan eski zaman damgasıyla geç gelenler', 'Kaynakta zaman damgası en büyük olan son kayıt', 'Hiçbiri; watermark filtresi her zaman tam sonuç verir'],
     'a': 1,
     'why': 'Kaynağa geç ulaşan (late-arriving) bir kayıt, watermark\'tan küçük bir zaman damgası taşıyorsa filtre onu sonsuza dek atlar. Çözüm: geri bakma payı (ör. son 3 gün) + unique_key ile upsert ve periyodik full-refresh.'},
]
ex += [
    {'t': 'predict', 'stage': 'Kodu oku', 'q': 'Mini-dbt derleyicisi ne üretir? Bu kod ne yazdırır?',
     'needs': ['jinja2'],
     'code': ded('''
from jinja2 import Template

goruldu = []
def ref(ad):
    goruldu.append(ad)
    return "dev_ayse." + ad

sql = Template("select * from {{ ref('stg_a') }} join {{ ref('stg_b') }} using (id)").render(ref=ref)
print(sql)
print(goruldu)
'''),
     'o': ["select * from dev_ayse.stg_a join dev_ayse.stg_b using (id)\n['stg_a', 'stg_b']", "select * from {{ ref('stg_a') }} join {{ ref('stg_b') }} using (id)\n[]", "select * from stg_a join stg_b using (id)\n['stg_a', 'stg_b']", "select * from dev_ayse.stg_a join dev_ayse.stg_b using (id)\n[]"],
     'a': 0,
     'why': 'render sırasında Jinja her {{ ref(...) }} ifadesini çağırır: fonksiyon dönüş değerini (şema + ad) metne yazar ve yan etki olarak adı listeye ekler. dbt geliştirici başına ayrı şema (dev_ayse) kullanmayı bu sayede kolayca yapar.'},
    {'t': 'predict', 'stage': 'Kodu oku', 'q': 'Bağımlılık grafiğinin çalışma sırası nedir? Bu kod ne yazdırır?',
     'code': ded('''
from graphlib import TopologicalSorter

graf = {
    "mart_rota": ["int_gecikme"],
    "int_gecikme": ["stg_gecikme"],
    "stg_gecikme": [],
}
print(" -> ".join(TopologicalSorter(graf).static_order()))
'''),
     'o': ['stg_gecikme -> int_gecikme -> mart_rota', 'mart_rota -> int_gecikme -> stg_gecikme', 'mart_rota -> stg_gecikme -> int_gecikme', 'CycleError'],
     'a': 0,
     'why': 'Sözlükte her model bağımlı olduğu modelleri (öncülleri) listeler. static_order önce öncülleri verir: staging, sonra intermediate, en son mart. Sözlüğün yazılış sırası önemsizdir.'},
    {'t': 'predict', 'stage': 'Kodu oku', 'q': 'Jinja döngüsü hangi SQL\'i üretir? Bu kod ne yazdırır?',
     'needs': ['jinja2'],
     'code': ded('''
from jinja2 import Template

t = Template("select {% for s in sutunlar %}sum({{ s }}) as {{ s }}{{ ', ' if not loop.last }}{% endfor %} from g")
print(t.render(sutunlar=["hava", "teknik"]))
'''),
     'o': ['select sum(hava) as hava, sum(teknik) as teknik from g', 'select sum(hava) as hava, sum(teknik) as teknik,  from g', 'select sum(hava) as havasum(teknik) as teknik from g', "select sum(['hava', 'teknik']) from g"],
     'a': 0,
     'why': 'loop.last son yinelemede True olur; virgül yalnız son eleman dışındakilere eklenir. SQL üretiminde sondaki fazladan virgül en sık şablon hatasıdır.'},
    {'t': 'order', 'stage': 'Kodu oku', 'needs': ['jinja2', 'duckdb'],
     'q': '<p>Modelleri ref ile derleyip DuckDB\'de görünüm (view) olarak doğru sırada oluşturan mini-dbt\'nin satırlarını sırala.</p>',
     'lines': [
         'import duckdb',
         'from jinja2 import Template',
         'modeller = {"stg_sayi": "select range as n from range(5)", "mart_toplam": "select sum(n) as t from {{ ref(\'stg_sayi\') }}"}',
         'con = duckdb.connect()',
         'for ad in ["stg_sayi", "mart_toplam"]:',
         '    sql = Template(modeller[ad]).render(ref=lambda m: m)',
         '    con.execute(f"create view {ad} as {sql}")',
         'print(con.execute("select t from mart_toplam").fetchone()[0])',
     ],
     'expect': '10\n',
     'hint': 'Önce importlar ve model sözlüğü, sonra bağlantı; döngü içinde önce derle sonra çalıştır.',
     'why': 'Her model önce Jinja ile derlenir (ref gerçek ada döner), sonra CREATE VIEW ile oluşturulur. stg_sayi mart_toplam\'dan önce oluşmalı; 0+1+2+3+4 = 10.'},
]

# Rehberli
ex.append({'t': 'code', 'stage': 'Rehberli', 'id': 'dbt-elt-1', 'diff': 2, 'needs': ['jinja2'],
  'q': '<p>Mini-dbt derleyicisi. <code>derle(sablon, sema="analytics")</code> yaz: Jinja şablonunu <code>ref</code> ve <code>source</code> fonksiyonlarıyla derlesin. <code>ref("x")</code> → <code>"{sema}.x"</code>; <code>source("kanat", "hv_flights")</code> → <code>"ham_kanat.hv_flights"</code> (kaynak şeması <code>"ham_" + kaynak adı</code>). Fonksiyon <code>(sql, refs, sources)</code> döndürsün: <code>refs</code> modelin bağımlı olduğu modellerin <b>tekrarsız, sıralı</b> listesi; <code>sources</code> <code>(kaynak, tablo)</code> demetlerinin tekrarsız, sıralı listesi.</p>',
  'guide': ['İki küme oluştur: refs ve sources.', 'İç fonksiyon ref(ad): kümeye ekle, sema + "." + ad döndür.', 'İç fonksiyon source(kaynak, tablo): demeti kümeye ekle, "ham_" + kaynak + "." + tablo döndür.', 'Template(sablon).render(ref=ref, source=source) ile derle; kümeleri sorted ile listeye çevir.'],
  'example': ded('''
from jinja2 import Template

kullanilan = set()
def para(sutun):
    kullanilan.add(sutun)
    return f"round({sutun} / 100.0, 2)"
print(Template("select {{ para('tutar_kurus') }} as tutar").render(para=para), kullanilan)
'''),
  'start': ded('''
from jinja2 import Template


def derle(sablon, sema="analytics"):
    refs, sources = set(), set()
    # TODO: ref ve source fonksiyonlarını tanımla
    # TODO: şablonu bu fonksiyonlarla render et
    sql = sablon
    return sql, sorted(refs), sorted(sources)


print(derle("select * from {{ source('kanat', 'hv_flights') }} f join {{ ref('stg_rotalar') }} r using (route_id)"))
'''),
  'sol': ded('''
from jinja2 import Template


def derle(sablon, sema="analytics"):
    refs, sources = set(), set()

    def ref(ad):
        refs.add(ad)
        return f"{sema}.{ad}"

    def source(kaynak, tablo):
        sources.add((kaynak, tablo))
        return f"ham_{kaynak}.{tablo}"

    sql = Template(sablon).render(ref=ref, source=source)
    return sql, sorted(refs), sorted(sources)


print(derle("select * from {{ source('kanat', 'hv_flights') }} f join {{ ref('stg_rotalar') }} r using (route_id)"))
'''),
  'tests': ded('''
_s, _r, _k = derle("select * from {{ source('kanat', 'hv_flights') }} f join {{ ref('stg_rotalar') }} r using (route_id)")
assert _s == "select * from ham_kanat.hv_flights f join analytics.stg_rotalar r using (route_id)", f"derlenmiş SQL yanlış: {_s}"
assert _r == ["stg_rotalar"] and _k == [("kanat", "hv_flights")], f"bağımlılıklar yanlış: {_r}, {_k}"
_s2, _r2, _ = derle("{{ ref('b') }} {{ ref('a') }} {{ ref('b') }}", sema="dev_can")
assert _s2 == "dev_can.b dev_can.a dev_can.b" and _r2 == ["a", "b"], "ref tekrarsız ve sıralı listelenmeli; şema parametresi kullanılmalı"
assert derle("select 1") == ("select 1", [], []), "bağımlılıksız model"
'''),
  'hints': ['Jinja şablon içinden çağrılan Python fonksiyonlarını render\'a anahtar sözcük argümanı olarak verirsin.', 'İç fonksiyonlar dış fonksiyonun refs ve sources kümelerine erişebilir (closure).', 'def ref(ad): refs.add(ad); return f"{sema}.{ad}"'],
  'why': 'dbt\'nin derleme adımı tam olarak budur: şablonu çalıştırırken ref/source çağrılarını yakalayıp hem gerçek adı yerleştirir hem de bağımlılıkları toplar. Aynı model, yalnız sema parametresi değişerek geliştirme ve üretim ortamında çalışır.'})

ex.append({'t': 'code', 'stage': 'Rehberli', 'id': 'dbt-elt-2', 'diff': 2, 'needs': ['jinja2'],
  'q': '<p><code>calisma_sirasi(modeller)</code> yaz: <code>modeller</code> <code>{ad: jinja_sql}</code> sözlüğüdür. Her modeli derleyerek <code>ref</code> bağımlılıklarını bul, <code>graphlib.TopologicalSorter</code> ile çalışma sırasını liste olarak döndür. Var olmayan bir modele <code>ref</code> verilmişse <code>ValueError</code>, döngü varsa yine <code>ValueError</code> fırlat (mesajda "döngü" geçsin).</p>',
  'guide': ['Her model için ref çağrılarını toplayan bir render yap (dbt-elt-1\'deki gibi).', 'Bağımlılık listesindeki her ad modeller içinde mi, kontrol et.', 'graf = {ad: bagimliliklar} sözlüğünü TopologicalSorter\'a ver.', 'graphlib.CycleError\'ı yakalayıp ValueError("döngü ...") fırlat.'],
  'example': ded('''
from graphlib import TopologicalSorter, CycleError

try:
    list(TopologicalSorter({"a": ["b"], "b": ["a"]}).static_order())
except CycleError as e:
    print("döngü:", e.args[1])
'''),
  'start': ded('''
from graphlib import TopologicalSorter, CycleError
from jinja2 import Template


def calisma_sirasi(modeller):
    graf = {}
    for ad, sablon in modeller.items():
        bag = []
        # TODO: ref çağrılarını bag listesine topla (render ile)
        # TODO: bilinmeyen model -> ValueError
        graf[ad] = bag
    # TODO: döngüyü yakala
    return list(graf)


MODELLER = {
    "mart_rota_performans": "select * from {{ ref('stg_ucuslar') }} join {{ ref('stg_rotalar') }} using (route_id) left join {{ ref('int_ucus_gecikme') }} using (flight_id)",
    "int_ucus_gecikme": "select flight_id, sum(dakika) from {{ ref('stg_gecikmeler') }} group by 1",
    "stg_ucuslar": "select * from ham.hv_flights",
    "stg_rotalar": "select * from ham.hv_routes",
    "stg_gecikmeler": "select * from ham.hv_delays",
}
print(calisma_sirasi(MODELLER))
'''),
  'sol': ded('''
from graphlib import TopologicalSorter, CycleError
from jinja2 import Template


def calisma_sirasi(modeller):
    graf = {}
    for ad, sablon in modeller.items():
        bag = []
        Template(sablon).render(ref=lambda m: bag.append(m) or m)
        for m in bag:
            if m not in modeller:
                raise ValueError(f"{ad} bilinmeyen modele ref veriyor: {m}")
        graf[ad] = bag
    try:
        return list(TopologicalSorter(graf).static_order())
    except CycleError as e:
        raise ValueError(f"döngü var: {e.args[1]}") from None


MODELLER = {
    "mart_rota_performans": "select * from {{ ref('stg_ucuslar') }} join {{ ref('stg_rotalar') }} using (route_id) left join {{ ref('int_ucus_gecikme') }} using (flight_id)",
    "int_ucus_gecikme": "select flight_id, sum(dakika) from {{ ref('stg_gecikmeler') }} group by 1",
    "stg_ucuslar": "select * from ham.hv_flights",
    "stg_rotalar": "select * from ham.hv_routes",
    "stg_gecikmeler": "select * from ham.hv_delays",
}
print(calisma_sirasi(MODELLER))
'''),
  'tests': ded('''
_s = calisma_sirasi(MODELLER)
assert sorted(_s) == sorted(MODELLER), "her model sırada bir kez yer almalı"
_i = {m: k for k, m in enumerate(_s)}
assert _i["stg_gecikmeler"] < _i["int_ucus_gecikme"] < _i["mart_rota_performans"], f"gecikme zinciri sırası yanlış: {_s}"
assert _i["stg_ucuslar"] < _i["mart_rota_performans"] and _i["stg_rotalar"] < _i["mart_rota_performans"], "mart, staging modellerinden sonra"
try:
    calisma_sirasi({"a": "{{ ref('yok') }}"}); assert False, "bilinmeyen ref ValueError vermeli"
except ValueError:
    pass
try:
    calisma_sirasi({"a": "{{ ref('b') }}", "b": "{{ ref('a') }}"}); assert False, "döngü ValueError vermeli"
except ValueError as e:
    assert "döngü" in str(e), "mesajda 'döngü' geçmeli"
'''),
  'hints': ['Template(sablon).render(ref=lambda m: bag.append(m) or m) hem kaydeder hem adı döndürür.', 'TopologicalSorter(graf).static_order() bir üreteç döndürür; list() ile çevir.', 'except CycleError as e: raise ValueError("döngü ...")'],
  'why': 'Bu, dbt run\'ın planlama adımıdır: tüm modelleri derle, DAG kur, döngü ve kırık referansları çalıştırmadan önce yakala. Kırık bir ref üretimde değil derleme anında hata vermelidir.'})

ex.append({'t': 'code', 'stage': 'Rehberli', 'id': 'dbt-elt-3', 'diff': 2, 'needs': ['duckdb'],
  'q': '<p>Genel testleri SQL\'e çevir. <code>test_sql(tur, tablo, sutun, **kw)</code> yaz ve hatalı satırları döndüren SQL üretsin: <code>"unique"</code>, <code>"not_null"</code>, <code>"accepted_values"</code> (<code>kw["values"]</code> listesi; tırnaklı metin olarak yaz). İsteğe bağlı <code>kw["where"]</code> verilirse test yalnız o koşulu sağlayan satırlarda çalışsın. Sonra <code>test_calistir(con, tur, tablo, sutun, **kw)</code> hatalı satır sayısını döndürsün. <code>kanat_havayollari</code> uçuşlarıyla dene.</p>',
  'guide': ['Önce kaynak ifadesini kur: where varsa (select * from tablo where ...) t, yoksa tablo.', 'unique: group by sutun having count(*) > 1', 'not_null: where sutun is null; accepted_values: where sutun not in (\'a\', \'b\')', 'test_calistir: select count(*) from (<test sql>)'],
  'example': ded('''
degerler = ["Eko", "EkoFlex", "Business"]
liste = ", ".join(f"'{d}'" for d in degerler)
print(f"select * from rezervasyon where fare_class not in ({liste})")
'''),
  'start': ded('''
import duckdb
import veri


def test_sql(tur, tablo, sutun, **kw):
    kaynak = tablo
    # TODO: where varsa kaynağı alt sorguya çevir
    # TODO: tur'e göre SQL döndür; bilinmeyen tür -> ValueError
    return ""


def test_calistir(con, tur, tablo, sutun, **kw):
    # TODO
    return None


con = duckdb.connect()
con.execute(f"CREATE VIEW ucus AS SELECT * FROM read_csv('{veri.yol('kanat_havayollari', 'hv_flights')}')")
print(test_calistir(con, "not_null", "ucus", "actual_dep"))
'''),
  'sol': ded('''
import duckdb
import veri


def test_sql(tur, tablo, sutun, **kw):
    kaynak = tablo
    if kw.get("where"):
        kaynak = f"(select * from {tablo} where {kw['where']}) t"
    if tur == "unique":
        return f"select {sutun} from {kaynak} group by {sutun} having count(*) > 1"
    if tur == "not_null":
        return f"select * from {kaynak} where {sutun} is null"
    if tur == "accepted_values":
        liste = ", ".join(f"'{v}'" for v in kw["values"])
        return f"select * from {kaynak} where {sutun} not in ({liste})"
    raise ValueError(f"bilinmeyen test: {tur}")


def test_calistir(con, tur, tablo, sutun, **kw):
    return con.execute(f"select count(*) from ({test_sql(tur, tablo, sutun, **kw)})").fetchone()[0]


con = duckdb.connect()
con.execute(f"CREATE VIEW ucus AS SELECT * FROM read_csv('{veri.yol('kanat_havayollari', 'hv_flights')}')")
print(test_calistir(con, "not_null", "ucus", "actual_dep"))
'''),
  'tests': ded('''
import duckdb as _d
_c = _d.connect()
_c.execute(f"CREATE VIEW ucus AS SELECT * FROM read_csv('{veri.yol('kanat_havayollari', 'hv_flights')}')")
assert test_calistir(_c, "unique", "ucus", "flight_id") == 0, "flight_id benzersiz"
assert test_calistir(_c, "unique", "ucus", "flight_no") > 0, "aynı sefer numarası her gün tekrar eder"
assert test_calistir(_c, "not_null", "ucus", "actual_dep") == 62, "62 iptal uçuşun kalkış zamanı boş"
assert test_calistir(_c, "not_null", "ucus", "actual_dep", where="status <> 'cancelled'") == 0, "iptaller dışında boş kalkış yok"
assert test_calistir(_c, "accepted_values", "ucus", "status", values=["landed", "cancelled"]) == 9, "9 yönlendirilmiş (diverted) uçuş kabul listesinde değil"
assert test_calistir(_c, "accepted_values", "ucus", "status", values=["landed", "cancelled", "diverted"]) == 0, "tam liste ile geçmeli"
try:
    test_sql("pozitif", "ucus", "pax"); assert False, "bilinmeyen test türü ValueError"
except ValueError:
    pass
'''),
  'hints': ['Hatalı satırı döndüren SELECT\'i dışarıdan count(*) ile sar.', 'accepted_values için değerleri tek tırnakla birleştir: ", ".join(f"\'{v}\'" for v in values)', 'where koşulu: (select * from tablo where ...) t kaynağını kullan.'],
  'why': 'dbt testleri "hatalı satırı bul" sorgularıdır; bu yüzden test sonucuna bakıp hatalı satırları doğrudan inceleyebilirsin. where parametresi, iş kuralını (iptal uçuşta kalkış zamanı olmaz) testin içine yazmanı sağlar.'})

ex.append({'t': 'code', 'stage': 'Rehberli', 'id': 'dbt-elt-4', 'diff': 2, 'needs': ['jinja2', 'duckdb'],
  'q': '<p>Staging modeli. <code>stg_kur(con)</code> yaz: <code>source(kaynak, tablo)</code> Jinja fonksiyonu <code>read_csv(\'...\')</code> ifadesine (yol: <code>veri.yol("kanat_havayollari", tablo)</code>) dönüşsün; aşağıdaki şablonu bununla derleyip DuckDB\'de <code>stg_ucuslar</code> adlı <b>view</b> olarak oluştur. Şablonu tamamla: <code>flight_id</code>, <code>flight_no AS ucus_no</code>, <code>route_id</code>, <code>status AS durum</code>, <code>sched_dep</code>\'i timestamp\'e çeviren <code>plan_kalkis</code>, ve <code>date_diff(\'minute\', plan, gerçek)</code> ile <code>kalkis_gecikme_dk</code>. Fonksiyon <code>{durum: uçuş sayısı}</code> sözlüğü döndürsün.</p>',
  'guide': ['source fonksiyonu: lambda k, t: f"read_csv(\'{veri.yol(\'kanat_havayollari\', t)}\')" (kaynak adı burada sabit).', 'Şablondaki TODO sütunlarını yaz; CAST(... AS TIMESTAMP) kullan.', 'Derlenen SQL ile CREATE VIEW stg_ucuslar AS ... çalıştır.', 'GROUP BY durum ile sayıları al ve dict\'e çevir.'],
  'example': ded('''
import duckdb

con = duckdb.connect()
print(con.execute("""
    SELECT date_diff('minute', TIMESTAMP '2024-09-01 06:00:00', TIMESTAMP '2024-09-01 06:17:00')
""").fetchone()[0])
'''),
  'start': ded('''
import duckdb
from jinja2 import Template
import veri

STG_UCUSLAR = """
select
    flight_id,
    -- TODO: ucus_no, route_id, durum, plan_kalkis, kalkis_gecikme_dk
from {{ source('kanat', 'hv_flights') }}
"""


def stg_kur(con):
    # TODO: source fonksiyonunu tanımla, şablonu derle, view oluştur
    return {}


con = duckdb.connect()
print(stg_kur(con))
'''),
  'sol': ded('''
import duckdb
from jinja2 import Template
import veri

STG_UCUSLAR = """
select
    flight_id,
    flight_no                       as ucus_no,
    route_id,
    status                          as durum,
    cast(sched_dep as timestamp)    as plan_kalkis,
    date_diff('minute', cast(sched_dep as timestamp), cast(actual_dep as timestamp)) as kalkis_gecikme_dk
from {{ source('kanat', 'hv_flights') }}
"""


def stg_kur(con):
    def source(kaynak, tablo):
        return f"read_csv('{veri.yol('kanat_havayollari', tablo)}')"
    sql = Template(STG_UCUSLAR).render(source=source)
    con.execute(f"create view stg_ucuslar as {sql}")
    return dict(con.execute("select durum, count(*) from stg_ucuslar group by 1").fetchall())


con = duckdb.connect()
print(stg_kur(con))
'''),
  'tests': ded('''
import duckdb as _d
_c = _d.connect()
_r = stg_kur(_c)
assert _r == {"landed": 3102, "cancelled": 62, "diverted": 9}, f"durum sayıları yanlış: {_r}"
_sut = [r[0] for r in _c.execute("describe stg_ucuslar").fetchall()]
assert _sut == ["flight_id", "ucus_no", "route_id", "durum", "plan_kalkis", "kalkis_gecikme_dk"], f"sütunlar/sıra yanlış: {_sut}"
assert _c.execute("select kalkis_gecikme_dk from stg_ucuslar where flight_id = 1").fetchone()[0] == 3, "uçuş 1: 06:00 planlı, 06:03 kalktı -> 3 dk"
assert _c.execute("select count(*) from stg_ucuslar where kalkis_gecikme_dk is null").fetchone()[0] == 62, "iptal uçuşların gecikmesi boş (NULL)"
assert _c.execute("select table_type from information_schema.tables where table_name = 'stg_ucuslar'").fetchone()[0] == "VIEW", "staging modeli view olmalı"
'''),
  'hints': ['Template(STG_UCUSLAR).render(source=source)', 'cast(sched_dep as timestamp) as plan_kalkis', 'date_diff(\'minute\', cast(sched_dep as timestamp), cast(actual_dep as timestamp)) as kalkis_gecikme_dk'],
  'why': 'Staging katmanı kaynağın tek giriş noktasıdır: yeniden adlandırma, tür dönüşümü ve türetilmiş basit sütunlar burada bir kez yapılır; sonraki tüm modeller temiz adlarla çalışır. Kaynak yolu ya da şeması değişirse yalnız source tanımı güncellenir.'})

# Kendin yaz
ex.append({'t': 'code', 'stage': 'Kendin yaz', 'id': 'dbt-elt-5', 'diff': 2, 'needs': ['duckdb'],
  'q': '<p>Artımlı materializasyon. <code>artimli_calistir(con, kaynak, hedef, zaman_sutunu)</code> yaz: <code>hedef</code> tablo yoksa <code>CREATE TABLE hedef AS SELECT * FROM kaynak</code> (ilk çalışma); varsa yalnız <code>zaman_sutunu</code> hedefteki en büyük değerden <b>büyük</b> olan kaynak satırlarını ekle. Eklenen satır sayısını döndür. Tablonun varlığını <code>information_schema.tables</code> ile kontrol et. <code>kanat_havayollari</code> rezervasyonlarıyla dene.</p>',
  'start': ded('''
import duckdb
import veri


def artimli_calistir(con, kaynak, hedef, zaman_sutunu):
    pass


con = duckdb.connect()
con.execute(f"CREATE TABLE tum AS SELECT * FROM read_csv('{veri.yol('kanat_havayollari', 'hv_bookings')}')")
con.execute("CREATE TABLE gelen AS SELECT * FROM tum WHERE booked_at < '2024-10-01'")
print(artimli_calistir(con, "gelen", "fct_rezervasyon", "booked_at"))
'''),
  'sol': ded('''
import duckdb
import veri


def artimli_calistir(con, kaynak, hedef, zaman_sutunu):
    var = con.execute(
        "select count(*) from information_schema.tables where table_name = ?", [hedef]
    ).fetchone()[0]
    if not var:
        con.execute(f"create table {hedef} as select * from {kaynak}")
        return con.execute(f"select count(*) from {hedef}").fetchone()[0]
    once = con.execute(f"select count(*) from {hedef}").fetchone()[0]
    con.execute(f"""
        insert into {hedef}
        select * from {kaynak}
        where {zaman_sutunu} > (select max({zaman_sutunu}) from {hedef})
    """)
    return con.execute(f"select count(*) from {hedef}").fetchone()[0] - once


con = duckdb.connect()
con.execute(f"CREATE TABLE tum AS SELECT * FROM read_csv('{veri.yol('kanat_havayollari', 'hv_bookings')}')")
con.execute("CREATE TABLE gelen AS SELECT * FROM tum WHERE booked_at < '2024-10-01'")
print(artimli_calistir(con, "gelen", "fct_rezervasyon", "booked_at"))
'''),
  'tests': ded('''
import duckdb as _d
_c = _d.connect()
_c.execute(f"CREATE TABLE tum AS SELECT * FROM read_csv('{veri.yol('kanat_havayollari', 'hv_bookings')}')")
_c.execute("CREATE TABLE gelen AS SELECT * FROM tum WHERE booked_at < '2024-10-01'")
_n1 = artimli_calistir(_c, "gelen", "fct", "booked_at")
_b1 = _c.execute("select count(*) from tum where booked_at < '2024-10-01'").fetchone()[0]
assert _n1 == _b1, f"ilk çalışma tüm kaynağı yüklemeli ({_b1}), gelen {_n1}"
assert artimli_calistir(_c, "gelen", "fct", "booked_at") == 0, "yeni veri yokken tekrar çalıştırma 0 satır eklemeli (idempotent)"
_c.execute("CREATE OR REPLACE TABLE gelen AS SELECT * FROM tum")
_n2 = artimli_calistir(_c, "gelen", "fct", "booked_at")
assert _n2 == 5020 - _b1, f"ikinci çalışma yalnız yeni {5020 - _b1} satırı eklemeli, gelen {_n2}"
assert _c.execute("select count(*), count(distinct booking_id) from fct").fetchone() == (5020, 5020), "çift kayıt olmamalı"
'''),
  'hints': ['Varlık kontrolü: select count(*) from information_schema.tables where table_name = ?', 'İlk çalışmada create table ... as select; sonrakilerde insert into ... select ... where zaman > (select max(zaman) from hedef)', 'Eklenen sayıyı önce/sonra count(*) farkıyla bul.'],
  'why': 'dbt\'nin incremental materializasyonu tam olarak bu iki dallı mantığı üretir: is_incremental() yanlışsa tam yükleme, doğruysa watermark filtresi. Büyük tablolarda her gün yalnız yeni satırları işlemek maliyeti ve süreyi dramatik azaltır.'})

ex.append({'t': 'code', 'stage': 'Kendin yaz', 'id': 'dbt-elt-6', 'diff': 2, 'needs': ['sqlite3'],
  'q': '<p><code>relationships</code> testi. <code>iliski_testi(con, cocuk, sutun, ebeveyn, ebeveyn_sutun)</code> yaz: çocuk tablodaki dolu (<code>NULL</code> olmayan) <code>sutun</code> değerlerinden ebeveyn tabloda karşılığı olmayan <b>satır sayısını</b> döndürsün (yetim kayıtlar). <code>veri.baglan("kanat_havayollari")</code> ile dene: gecikmeler → uçuşlar, rezervasyonlar → yolcular.</p>',
  'start': ded('''
import veri


def iliski_testi(con, cocuk, sutun, ebeveyn, ebeveyn_sutun):
    pass


con = veri.baglan("kanat_havayollari", tablolar=["hv_delays", "hv_flights", "hv_bookings", "hv_passengers"])
print(iliski_testi(con, "hv_delays", "flight_id", "hv_flights", "flight_id"))
'''),
  'sol': ded('''
import veri


def iliski_testi(con, cocuk, sutun, ebeveyn, ebeveyn_sutun):
    sql = f"""
        select count(*) from {cocuk} c
        left join {ebeveyn} p on c.{sutun} = p.{ebeveyn_sutun}
        where c.{sutun} is not null and p.{ebeveyn_sutun} is null
    """
    return con.execute(sql).fetchone()[0]


con = veri.baglan("kanat_havayollari", tablolar=["hv_delays", "hv_flights", "hv_bookings", "hv_passengers"])
print(iliski_testi(con, "hv_delays", "flight_id", "hv_flights", "flight_id"))
'''),
  'tests': ded('''
_c = veri.baglan("kanat_havayollari", tablolar=["hv_delays", "hv_flights", "hv_bookings", "hv_passengers"])
assert iliski_testi(_c, "hv_delays", "flight_id", "hv_flights", "flight_id") == 0, "tüm gecikmeler var olan uçuşlara bağlı"
assert iliski_testi(_c, "hv_bookings", "passenger_id", "hv_passengers", "passenger_id") == 0, "tüm rezervasyonların yolcusu var"
_c.execute("insert into hv_delays values (99999, 'teknik', 30), (99999, 'hava', 10), (NULL, 'hava', 5)")
assert iliski_testi(_c, "hv_delays", "flight_id", "hv_flights", "flight_id") == 2, "olmayan uçuşa bağlı 2 satır yetim; NULL sayılmaz (not_null testinin işi)"
_c.execute("delete from hv_passengers where passenger_id = 607")
assert iliski_testi(_c, "hv_bookings", "passenger_id", "hv_passengers", "passenger_id") == _c.execute("select count(*) from hv_bookings where passenger_id = 607").fetchone()[0], "silinen yolcunun rezervasyonları yetim kalır"
'''),
  'hints': ['LEFT JOIN ile ebeveyni bağla; karşılığı olmayanlarda ebeveyn sütunu NULL olur.', 'NULL çocuk değerlerini hariç tut: where c.sutun is not null'],
  'why': 'Ambarda yabancı anahtar kısıtı çoğunlukla yoktur (ya da uygulanmaz); bütünlüğü testler korur. NULL\'ları bu testte saymamak dbt\'nin davranışıdır: boşluk ayrı bir kuraldır ve not_null testiyle denetlenir.'})

ex.append({'t': 'code', 'stage': 'Kendin yaz', 'id': 'dbt-elt-7', 'diff': 2,
  'q': '<p>Köken (lineage) ve etki analizi. <code>graf</code>: <code>{model: [doğrudan bağımlı olduğu modeller]}</code>. İki fonksiyon yaz: <code>ust_akis(graf, model)</code> modelin <b>tüm</b> atalarını (dolaylılar dahil), <code>alt_akis(graf, model)</code> modelden etkilenen <b>tüm</b> torunları sıralı liste olarak döndürsün; modelin kendisi listede olmasın. Bilinmeyen model için <code>KeyError</code>.</p>',
  'start': ded('''
def ust_akis(graf, model):
    pass


def alt_akis(graf, model):
    pass


GRAF = {
    "stg_ucuslar": [], "stg_rotalar": [], "stg_gecikmeler": [], "stg_rezervasyonlar": [],
    "int_ucus_gecikme": ["stg_gecikmeler"],
    "mart_rota_performans": ["stg_ucuslar", "stg_rotalar", "int_ucus_gecikme"],
    "mart_doluluk": ["stg_ucuslar", "stg_rezervasyonlar"],
    "rapor_yonetim": ["mart_rota_performans", "mart_doluluk"],
}
print(ust_akis(GRAF, "mart_rota_performans"), alt_akis(GRAF, "stg_ucuslar"))
'''),
  'sol': ded('''
def ust_akis(graf, model):
    if model not in graf:
        raise KeyError(model)
    gorulen, yigin = set(), list(graf[model])
    while yigin:
        m = yigin.pop()
        if m not in gorulen:
            gorulen.add(m)
            yigin.extend(graf[m])
    return sorted(gorulen)


def alt_akis(graf, model):
    if model not in graf:
        raise KeyError(model)
    cocuklar = {m: [] for m in graf}
    for m, ebeveynler in graf.items():
        for e in ebeveynler:
            cocuklar[e].append(m)
    gorulen, yigin = set(), list(cocuklar[model])
    while yigin:
        m = yigin.pop()
        if m not in gorulen:
            gorulen.add(m)
            yigin.extend(cocuklar[m])
    return sorted(gorulen)


GRAF = {
    "stg_ucuslar": [], "stg_rotalar": [], "stg_gecikmeler": [], "stg_rezervasyonlar": [],
    "int_ucus_gecikme": ["stg_gecikmeler"],
    "mart_rota_performans": ["stg_ucuslar", "stg_rotalar", "int_ucus_gecikme"],
    "mart_doluluk": ["stg_ucuslar", "stg_rezervasyonlar"],
    "rapor_yonetim": ["mart_rota_performans", "mart_doluluk"],
}
print(ust_akis(GRAF, "mart_rota_performans"), alt_akis(GRAF, "stg_ucuslar"))
'''),
  'tests': ded('''
assert ust_akis(GRAF, "mart_rota_performans") == ["int_ucus_gecikme", "stg_gecikmeler", "stg_rotalar", "stg_ucuslar"], "dolaylı ata stg_gecikmeler de dahil olmalı"
assert alt_akis(GRAF, "stg_ucuslar") == ["mart_doluluk", "mart_rota_performans", "rapor_yonetim"], "stg_ucuslar değişirse iki mart ve rapor etkilenir"
assert alt_akis(GRAF, "stg_gecikmeler") == ["int_ucus_gecikme", "mart_rota_performans", "rapor_yonetim"], "zincirleme etki"
assert ust_akis(GRAF, "stg_rotalar") == [] and alt_akis(GRAF, "rapor_yonetim") == [], "kaynak ve uç modeller"
assert len(ust_akis(GRAF, "rapor_yonetim")) == 7, "rapor tüm diğer modellere bağlı (7)"
try:
    ust_akis(GRAF, "yok"); assert False, "bilinmeyen model KeyError"
except KeyError:
    pass
'''),
  'hints': ['Üst akış: grafikte ebeveynleri izleyen bir derinlik/genişlik öncelikli arama; görülenleri kümede tut.', 'Alt akış için önce grafiği ters çevir: her ebeveyn için çocuk listesi.', 'Elmas biçimli grafikte aynı modele iki yoldan ulaşılır; küme tekrarları önler.'],
  'why': 'dbt docs\'taki köken grafiği ve --select +model / model+ seçicileri bu iki gezinmeye dayanır. Bir kaynak sütununu değiştirmeden önce alt_akis ile etkilenecek panoları listelemek, kıdemli ekiplerin standart değişiklik kontrolüdür.'})

ex.append({'t': 'code', 'stage': 'Kendin yaz', 'id': 'dbt-elt-8', 'diff': 2, 'needs': ['duckdb'],
  'q': '<p>Seed. Gecikme nedeni kodlarının Türkçe etiketleri depoda küçük bir CSV olarak tutuluyor. <code>seed_yukle(con, ad, csv_metni)</code> yaz: metni <code>ad + ".csv"</code> dosyasına yazıp DuckDB\'de <code>ad</code> adlı tabloya yüklesin (varsa yerine koysun) ve satır sayısını döndürsün. Sonra <code>neden_ozeti(con)</code> yaz: <code>kanat_havayollari</code> gecikmelerini (<code>hv_delays</code>) seed ile birleştirip <code>[(etiket, toplam_dakika), ...]</code> listesini toplam dakikaya göre azalan sırada döndürsün.</p>',
  'start': ded('''
import duckdb
import veri

NEDENLER = """kod,etiket
gec_gelen_ucak,Geç gelen uçak
hava,Hava koşulları
hava_trafik,Hava trafik kontrolü
teknik,Teknik arıza
yer_hizmetleri,Yer hizmetleri
"""


def seed_yukle(con, ad, csv_metni):
    pass


def neden_ozeti(con):
    pass


con = duckdb.connect()
print(seed_yukle(con, "seed_gecikme_nedenleri", NEDENLER))
print(neden_ozeti(con))
'''),
  'sol': ded('''
import duckdb
import veri

NEDENLER = """kod,etiket
gec_gelen_ucak,Geç gelen uçak
hava,Hava koşulları
hava_trafik,Hava trafik kontrolü
teknik,Teknik arıza
yer_hizmetleri,Yer hizmetleri
"""


def seed_yukle(con, ad, csv_metni):
    yol = ad + ".csv"
    with open(yol, "w", encoding="utf-8") as f:
        f.write(csv_metni)
    con.execute(f"create or replace table {ad} as select * from read_csv('{yol}', header = true)")
    return con.execute(f"select count(*) from {ad}").fetchone()[0]


def neden_ozeti(con):
    yol = veri.yol("kanat_havayollari", "hv_delays")
    return con.execute(f"""
        select s.etiket, sum(d.minutes) as dk
        from read_csv('{yol}') d
        join seed_gecikme_nedenleri s on s.kod = d.reason
        group by 1 order by 2 desc
    """).fetchall()


con = duckdb.connect()
print(seed_yukle(con, "seed_gecikme_nedenleri", NEDENLER))
print(neden_ozeti(con))
'''),
  'tests': ded('''
import duckdb as _d
_c = _d.connect()
assert seed_yukle(_c, "seed_gecikme_nedenleri", NEDENLER) == 5, "5 neden kodu"
assert seed_yukle(_c, "seed_gecikme_nedenleri", NEDENLER) == 5, "tekrar yükleme çoğaltmamalı (create or replace)"
_r = neden_ozeti(_c)
assert [(a, int(b)) for a, b in _r] == [("Geç gelen uçak", 26420), ("Hava koşulları", 21570), ("Yer hizmetleri", 8498), ("Teknik arıza", 7901), ("Hava trafik kontrolü", 7854)], f"özet yanlış: {_r}"
'''),
  'hints': ['Önce dosyayı yaz, sonra read_csv(\'dosya.csv\', header = true) ile oku.', 'create or replace table ad as select ... yeniden çalıştırmayı güvenli yapar.', 'hv_delays.reason = seed.kod üzerinden JOIN; sum(minutes) ile grupla.'],
  'why': 'Seed\'ler kodla birlikte sürümlenen küçük referans tablolarıdır: etiketler, eşlemeler, hedef oranları. Etiketi SQL içinde CASE WHEN ile gömmek yerine seed\'de tutmak, değişikliği tek satırlık bir CSV düzenlemesine indirir.'})

# Hata avı
ex.append({'t': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'id': 'dbt-elt-9', 'diff': 2, 'needs': ['jinja2', 'duckdb'],
  'q': '<p>Hatayı bul ve düzelt. Ekibin mini-dbt\'si <code>calistir(con, modeller)</code> modelleri derleyip view olarak oluşturuyor ama "Catalog Error: Table ... does not exist" hatası veriyor. Modeller sözlükte rastgele sırada duruyor. Bağımlılıkları <code>ref</code> ile toplayıp <code>graphlib</code> ile doğru sırada çalıştır; fonksiyon oluşturulan modellerin sırasını liste olarak döndürsün.</p>',
  'start': ded('''
import duckdb
from jinja2 import Template


def calistir(con, modeller):
    sira = []
    for ad, sablon in modeller.items():
        sql = Template(sablon).render(ref=lambda m: m)
        con.execute(f"create or replace view {ad} as {sql}")
        sira.append(ad)
    return sira


MODELLER = {
    "mart_ozet": "select durum, count(*) as n from {{ ref('stg_ucus') }} group by 1",
    "stg_ucus": "select * from (values (1, 'landed'), (2, 'landed'), (3, 'cancelled')) t(id, durum)",
}
con = duckdb.connect()
print(calistir(con, MODELLER))
'''),
  'sol': ded('''
import duckdb
from graphlib import TopologicalSorter
from jinja2 import Template


def calistir(con, modeller):
    graf = {}
    for ad, sablon in modeller.items():
        bag = []
        Template(sablon).render(ref=lambda m: bag.append(m) or m)
        graf[ad] = bag
    sira = []
    for ad in TopologicalSorter(graf).static_order():
        sql = Template(modeller[ad]).render(ref=lambda m: m)
        con.execute(f"create or replace view {ad} as {sql}")
        sira.append(ad)
    return sira


MODELLER = {
    "mart_ozet": "select durum, count(*) as n from {{ ref('stg_ucus') }} group by 1",
    "stg_ucus": "select * from (values (1, 'landed'), (2, 'landed'), (3, 'cancelled')) t(id, durum)",
}
con = duckdb.connect()
print(calistir(con, MODELLER))
'''),
  'tests': ded('''
import duckdb as _d
_c = _d.connect()
assert calistir(_c, MODELLER) == ["stg_ucus", "mart_ozet"], "staging, mart\'tan önce oluşturulmalı"
assert dict(_c.execute("select durum, n from mart_ozet").fetchall()) == {"landed": 2, "cancelled": 1}, "mart doğru sonucu vermeli"
_m2 = {"c": "select x + 1 as x from {{ ref('b') }}", "b": "select x * 2 as x from {{ ref('a') }}", "a": "select 5 as x"}
assert calistir(_d.connect(), _m2) == ["a", "b", "c"], "üç aşamalı zincir"
'''),
  'hints': ['Sözlük sırası çalışma sırası değildir; önce bağımlılıkları topla.', 'Her model için render(ref=lambda m: bag.append(m) or m) ile ref\'leri yakala.', 'TopologicalSorter(graf).static_order() sırasıyla view\'ları oluştur.'],
  'why': 'dbt\'nin en temel garantisi DAG sırasıdır. Model dosyalarının alfabetik ya da yazılış sırası anlamsızdır; sıra yalnız ref\'lerden türetilir. Bu yüzden ref yerine elle yazılan tablo adı bu hataya geri dönmektir.'})

ex.append({'t': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'id': 'dbt-elt-10', 'diff': 2, 'needs': ['duckdb'],
  'q': '<p>Hatayı bul ve düzelt. Artımlı model her saat çalışıyor; analist, yeni rezervasyon gelmediği saatlerde bile <code>fct_rezervasyon</code> satır sayısının arttığını ve aynı <code>booking_id</code>\'nin birden çok kez göründüğünü fark etti. <code>artimli(con)</code> fonksiyonunu tekrar çalıştırmaya dayanıklı (idempotent) hale getir.</p>',
  'start': ded('''
import duckdb
import veri


def artimli(con):
    con.execute("""
        insert into fct_rezervasyon
        select * from kaynak
        where booked_at >= (select max(booked_at) from fct_rezervasyon)
    """)
    return con.execute("select count(*) from fct_rezervasyon").fetchone()[0]


con = duckdb.connect()
con.execute(f"create table kaynak as select * from read_csv('{veri.yol('kanat_havayollari', 'hv_bookings')}')")
con.execute("create table fct_rezervasyon as select * from kaynak where booked_at < '2024-11-01'")
print(artimli(con), artimli(con))
'''),
  'sol': ded('''
import duckdb
import veri


def artimli(con):
    con.execute("""
        insert into fct_rezervasyon
        select * from kaynak
        where booked_at > (select max(booked_at) from fct_rezervasyon)
    """)
    return con.execute("select count(*) from fct_rezervasyon").fetchone()[0]


con = duckdb.connect()
con.execute(f"create table kaynak as select * from read_csv('{veri.yol('kanat_havayollari', 'hv_bookings')}')")
con.execute("create table fct_rezervasyon as select * from kaynak where booked_at < '2024-11-01'")
print(artimli(con), artimli(con))
'''),
  'tests': ded('''
import duckdb as _d
_c = _d.connect()
_c.execute(f"create table kaynak as select * from read_csv('{veri.yol('kanat_havayollari', 'hv_bookings')}')")
_c.execute("create table fct_rezervasyon as select * from kaynak where booked_at < '2024-11-01'")
_a = artimli(_c); _b = artimli(_c); _x = artimli(_c)
assert _a == _b == _x == 5020, f"tekrar çalıştırmalar satır eklememeli: {(_a, _b, _x)}"
assert _c.execute("select count(*) - count(distinct booking_id) from fct_rezervasyon").fetchone()[0] == 0, "çift booking_id olmamalı"
'''),
  'hints': ['Watermark\'a eşit zaman damgalı satırlar zaten hedefte.', '>= yerine > kullan.'],
  'why': 'Watermark karşılaştırmasında >= hedefte zaten bulunan son zaman damgalı satırları her çalışmada yeniden ekler. > ile tekrar çalıştırma güvenli olur; aynı zaman damgasını paylaşan geç kayıtlar için ise unique_key ile upsert (merge) kullanılır.'})

# Meydan okuma
ex.append({'t': 'code', 'stage': 'Meydan okuma', 'id': 'dbt-elt-11', 'diff': 3, 'needs': ['duckdb'],
  'q': '<p>dbt snapshot (check stratejisi). <code>snapshot_al(con, kaynak, hedef, anahtar, izlenen, zaman)</code> yaz:</p><ul><li>Hedef yoksa: kaynağın tüm sütunları + <code>gecerli_bas</code> (= <code>zaman</code>) + <code>gecerli_bit</code> (NULL) ile oluştur.</li><li>Varsa: güncel satırı (<code>gecerli_bit IS NULL</code>) olan ve <code>izlenen</code> sütunlarından en az biri değişmiş anahtarlar için güncel satırı <code>gecerli_bit = zaman</code> ile kapat ve yeni sürüm ekle; hedefte hiç olmayan yeni anahtarları da ekle.</li><li><code>(kapatilan, eklenen)</code> sayılarını döndür.</li></ul><p><code>zaman</code> bir ISO metindir (<code>\'2025-01-01\'</code>); sütun türü TIMESTAMP olsun. <code>kanat_havayollari</code> yolcularının <code>tier</code> ve <code>city</code> değişiklikleriyle dene.</p>',
  'start': ded('''
import duckdb
import veri


def snapshot_al(con, kaynak, hedef, anahtar, izlenen, zaman):
    pass


con = duckdb.connect()
con.execute(f"create table yolcu as select passenger_id, full_name, tier, city from read_csv('{veri.yol('kanat_havayollari', 'hv_passengers')}')")
print(snapshot_al(con, "yolcu", "snap_yolcu", "passenger_id", ["tier", "city"], "2025-01-01"))
'''),
  'sol': ded('''
import duckdb
import veri


def snapshot_al(con, kaynak, hedef, anahtar, izlenen, zaman):
    var = con.execute("select count(*) from information_schema.tables where table_name = ?", [hedef]).fetchone()[0]
    if not var:
        con.execute(f"""create table {hedef} as
            select *, cast(? as timestamp) as gecerli_bas, cast(null as timestamp) as gecerli_bit
            from {kaynak}""", [zaman])
        return 0, con.execute(f"select count(*) from {hedef}").fetchone()[0]
    fark = " or ".join(f"s.{c} is distinct from k.{c}" for c in izlenen)
    degisen = [r[0] for r in con.execute(f"""
        select k.{anahtar} from {kaynak} k
        join {hedef} s on s.{anahtar} = k.{anahtar} and s.gecerli_bit is null
        where {fark}""").fetchall()]
    yeni = [r[0] for r in con.execute(f"""
        select k.{anahtar} from {kaynak} k
        where k.{anahtar} not in (select {anahtar} from {hedef})""").fetchall()]
    if degisen:
        con.execute(f"""update {hedef} set gecerli_bit = cast(? as timestamp)
            where gecerli_bit is null and {anahtar} in (select unnest(?))""", [zaman, degisen])
    eklenecek = degisen + yeni
    if eklenecek:
        con.execute(f"""insert into {hedef}
            select *, cast(? as timestamp), cast(null as timestamp) from {kaynak}
            where {anahtar} in (select unnest(?))""", [zaman, eklenecek])
    return len(degisen), len(eklenecek)


con = duckdb.connect()
con.execute(f"create table yolcu as select passenger_id, full_name, tier, city from read_csv('{veri.yol('kanat_havayollari', 'hv_passengers')}')")
print(snapshot_al(con, "yolcu", "snap_yolcu", "passenger_id", ["tier", "city"], "2025-01-01"))
'''),
  'tests': ded('''
import duckdb as _d
_c = _d.connect()
_c.execute(f"create table yolcu as select passenger_id, full_name, tier, city from read_csv('{veri.yol('kanat_havayollari', 'hv_passengers')}')")
assert snapshot_al(_c, "yolcu", "snap", "passenger_id", ["tier", "city"], "2025-01-01") == (0, 900), "ilk snapshot 900 yolcu"
assert snapshot_al(_c, "yolcu", "snap", "passenger_id", ["tier", "city"], "2025-01-02") == (0, 0), "değişiklik yoksa hiçbir şey olmamalı"
_c.execute("update yolcu set tier = 'Gold' where passenger_id in (1, 2) and tier <> 'Gold'")
_n = _c.execute("select count(*) from snap where passenger_id in (1, 2) and tier <> 'Gold'").fetchone()[0]
_c.execute("update yolcu set full_name = full_name || ' X' where passenger_id = 3")
_c.execute("update yolcu set city = NULL where passenger_id = 4")
_c.execute("insert into yolcu values (901, 'Deniz Ak', 'Classic', 'Van')")
assert snapshot_al(_c, "yolcu", "snap", "passenger_id", ["tier", "city"], "2025-02-01") == (_n + 1, _n + 2), f"tier değişen {_n} + city NULL olan 1 kapatılmalı; yeni yolcu eklenmeli. İzlenmeyen ad değişikliği sayılmaz"
assert _c.execute("select count(*) from snap where gecerli_bit is null").fetchone()[0] == 901, "her yolcunun tek güncel satırı olmalı"
assert _c.execute("select count(*) from snap where passenger_id = 4").fetchone()[0] == 2, "NULL'a dönüşen şehir de değişikliktir (IS DISTINCT FROM)"
assert str(_c.execute("select max(gecerli_bit) from snap").fetchone()[0]).startswith("2025-02-01"), "kapanış zamanı snapshot zamanı olmalı"
'''),
  'hints': ['Değişiklik koşulu: s.tier IS DISTINCT FROM k.tier OR ...; = kullanırsan NULL değişimlerini kaçırırsın.', 'Önce değişen ve yeni anahtarları listele, sonra güncel satırları kapat, en son yeni sürümleri ekle.', 'DuckDB\'de liste parametresi: where anahtar in (select unnest(?))'],
  'why': 'dbt snapshot\'ın check stratejisi tam olarak bu üç adımı yapar. IS DISTINCT FROM, NULL\'ı da bir değer gibi karşılaştırır; düz = karşılaştırması NULL\'a geçişleri sessizce kaçırır ve geçmiş eksik kalır.'})

ex.append({'t': 'code', 'stage': 'Meydan okuma', 'id': 'dbt-elt-12', 'diff': 3,
  'q': '<p>dbt seçici sözdizimi. <code>sec(graf, secici)</code> yaz (<code>graf</code>: <code>{model: [ebeveynler]}</code>). Seçici biçimleri: <code>"m"</code> yalnız model; <code>"+m"</code> model + tüm ataları; <code>"m+"</code> model + tüm torunları; <code>"+m+"</code> ikisi; <code>"2+m"</code> model + en fazla 2 kuşak ata; <code>"m+1"</code> model + en fazla 1 kuşak torun. Birden çok seçici boşlukla ayrılabilir (birleşim). Sonucu <b>çalışma sırasıyla</b> liste olarak döndür: her adımda, seçili modeller içinde öncülleri tamamlanmış (hazır) olanlardan alfabetik olarak ilkini al (Kahn algoritması). Bilinmeyen model <code>KeyError</code>.</p>',
  'start': ded('''
import re


def sec(graf, secici):
    pass


GRAF = {
    "stg_ucuslar": [], "stg_rotalar": [], "stg_gecikmeler": [], "stg_rezervasyonlar": [],
    "int_ucus_gecikme": ["stg_gecikmeler"],
    "mart_rota_performans": ["stg_ucuslar", "stg_rotalar", "int_ucus_gecikme"],
    "mart_doluluk": ["stg_ucuslar", "stg_rezervasyonlar"],
    "rapor_yonetim": ["mart_rota_performans", "mart_doluluk"],
}
print(sec(GRAF, "+mart_rota_performans"))
'''),
  'sol': ded('''
import re


def _gez(komsu, bas, derinlik):
    sonuc, sinir = set(), {bas}
    adim = 0
    while sinir and (derinlik is None or adim < derinlik):
        sinir = {n for m in sinir for n in komsu[m]} - sonuc
        sonuc |= sinir
        adim += 1
    return sonuc


def sec(graf, secici):
    cocuk = {m: [] for m in graf}
    for m, ebeveynler in graf.items():
        for e in ebeveynler:
            cocuk[e].append(m)
    secilen = set()
    for parca in secici.split():
        m = re.fullmatch(r"(\\d*)(\\+?)([\\w.]+)(\\+?)(\\d*)", parca)
        if not m:
            raise ValueError(parca)
        ust_n, ust, ad, alt, alt_n = m.groups()
        if ad not in graf:
            raise KeyError(ad)
        secilen.add(ad)
        if ust:
            secilen |= _gez(graf, ad, int(ust_n) if ust_n else None)
        if alt:
            secilen |= _gez(cocuk, ad, int(alt_n) if alt_n else None)
    derece = {m: sum(1 for e in graf[m] if e in secilen) for m in secilen}
    hazir = sorted(m for m, d in derece.items() if d == 0)
    sira = []
    while hazir:
        m = hazir.pop(0)
        sira.append(m)
        for c in cocuk[m]:
            if c in derece:
                derece[c] -= 1
                if derece[c] == 0:
                    hazir.append(c)
                    hazir.sort()
    return sira


GRAF = {
    "stg_ucuslar": [], "stg_rotalar": [], "stg_gecikmeler": [], "stg_rezervasyonlar": [],
    "int_ucus_gecikme": ["stg_gecikmeler"],
    "mart_rota_performans": ["stg_ucuslar", "stg_rotalar", "int_ucus_gecikme"],
    "mart_doluluk": ["stg_ucuslar", "stg_rezervasyonlar"],
    "rapor_yonetim": ["mart_rota_performans", "mart_doluluk"],
}
print(sec(GRAF, "+mart_rota_performans"))
'''),
  'tests': ded('''
assert sec(GRAF, "mart_doluluk") == ["mart_doluluk"], "yalın seçici yalnız modeli seçer"
assert sec(GRAF, "+mart_rota_performans") == ["stg_gecikmeler", "int_ucus_gecikme", "stg_rotalar", "stg_ucuslar", "mart_rota_performans"], f"atalar topolojik + alfabetik sırada olmalı: {sec(GRAF, '+mart_rota_performans')}"
assert sec(GRAF, "stg_ucuslar+") == ["stg_ucuslar", "mart_doluluk", "mart_rota_performans", "rapor_yonetim"], f"torunlar: {sec(GRAF, 'stg_ucuslar+')}"
assert sec(GRAF, "1+mart_rota_performans") == ["int_ucus_gecikme", "stg_rotalar", "stg_ucuslar", "mart_rota_performans"], "1 kuşak ata: stg_gecikmeler dahil olmamalı"
assert sec(GRAF, "stg_gecikmeler+1") == ["stg_gecikmeler", "int_ucus_gecikme"], "1 kuşak torun"
assert sec(GRAF, "+int_ucus_gecikme+") == ["stg_gecikmeler", "int_ucus_gecikme", "mart_rota_performans", "rapor_yonetim"], "iki yönlü"
assert sec(GRAF, "stg_rotalar mart_doluluk") == ["mart_doluluk", "stg_rotalar"], "birleşim; aralarında bağ yoksa alfabetik"
try:
    sec(GRAF, "+yok"); assert False, "bilinmeyen model KeyError"
except KeyError:
    pass
'''),
  'hints': ['Seçiciyi düzenli ifadeyle parçala: (\\d*)(\\+?)(ad)(\\+?)(\\d*)', 'Atalar için grafiği, torunlar için ters grafiği kuşak kuşak (genişlik öncelikli) gez; derinlik sınırı varsa o kadar adım at.', 'Sıralama için Kahn algoritması: seçili alt grafikte giriş derecesi 0 olanları alfabetik bir listede tut, her adımda en küçüğünü al.'],
  'why': 'dbt run --select ve dbt build seçicileri, büyük projelerde yalnız gereken parçayı çalıştırmanın yoludur: bir staging değişikliğinden sonra "stg_x+" ile etkilenen her şeyi yeniden kur, bir panoyu tazelemek için "+mart_y" ile yalnız onun zincirini çalıştır.'})

# Mini proje
ex.append({'t': 'code', 'stage': 'Mini proje', 'id': 'dbt-elt-13', 'diff': 3, 'needs': ['jinja2', 'duckdb'],
  'q': '<p>Kanat Havayolları mini-dbt projesi. Modeller ve materializasyonları aşağıdaki iskelette hazır. <code>MiniDbt</code> sınıfını tamamla:</p><ul><li><code>__init__(self, con, modeller)</code>: <code>modeller</code> <code>{ad: (materializasyon, jinja_sql)}</code>.</li><li><code>derle(self, ad)</code>: <code>ref(m)</code> → <code>m</code>, <code>source("kanat", t)</code> → <code>read_csv(\'...\')</code> (yol <code>veri.yol("kanat_havayollari", t)</code>). Derlenmiş SQL\'i döndür.</li><li><code>calistir(self)</code>: modelleri bağımlılık sırasıyla <code>create or replace view</code> ya da <code>create or replace table</code> olarak oluştur; sırayı liste olarak döndür.</li><li><code>test(self, ad, sutun, tur)</code>: <code>"unique"</code> ya da <code>"not_null"</code> için hatalı satır sayısı.</li></ul><p>Sonra <code>rapor(dbt)</code> yaz: projeyi çalıştır, <code>mart_rota_performans</code>\'ta <code>rota</code> için unique ve not_null testlerini çalıştır; ikisi de geçerse zamanında kalkış oranı en düşük 3 rotayı <code>[(rota, ucus, zamaninda_oran), ...]</code> olarak döndür (oran artan, eşitlikte rota adı); bir test kalırsa <code>RuntimeError</code> fırlat.</p>',
  'start': ded('''
import duckdb
from graphlib import TopologicalSorter
from jinja2 import Template
import veri

MODELLER = {
    "mart_rota_performans": ("table", """
        select r.rota, count(*) as ucus,
               round(avg(case when u.kalkis_gecikme_dk <= 15 then 1 else 0 end), 3) as zamaninda_oran,
               round(avg(coalesce(g.toplam_neden_dk, 0)), 1) as ort_neden_dk
        from {{ ref('stg_ucuslar') }} u
        join {{ ref('stg_rotalar') }} r using (route_id)
        left join {{ ref('int_ucus_gecikme') }} g using (flight_id)
        where u.durum <> 'cancelled'
        group by 1"""),
    "int_ucus_gecikme": ("table", """
        select flight_id, sum(dakika) as toplam_neden_dk, count(*) as neden_sayisi
        from {{ ref('stg_gecikmeler') }} group by 1"""),
    "stg_ucuslar": ("view", """
        select flight_id, route_id, status as durum,
               date_diff('minute', cast(sched_dep as timestamp), cast(actual_dep as timestamp)) as kalkis_gecikme_dk
        from {{ source('kanat', 'hv_flights') }}"""),
    "stg_rotalar": ("view", """
        select route_id, origin || '-' || dest as rota, distance_km as mesafe_km
        from {{ source('kanat', 'hv_routes') }}"""),
    "stg_gecikmeler": ("view", """
        select flight_id, reason as neden, minutes as dakika
        from {{ source('kanat', 'hv_delays') }}"""),
}


class MiniDbt:
    def __init__(self, con, modeller):
        self.con = con
        self.modeller = modeller

    def derle(self, ad):
        pass

    def calistir(self):
        pass

    def test(self, ad, sutun, tur):
        pass


def rapor(dbt):
    pass


print(rapor(MiniDbt(duckdb.connect(), MODELLER)))
'''),
  'sol': ded('''
import duckdb
from graphlib import TopologicalSorter
from jinja2 import Template
import veri

MODELLER = {
    "mart_rota_performans": ("table", """
        select r.rota, count(*) as ucus,
               round(avg(case when u.kalkis_gecikme_dk <= 15 then 1 else 0 end), 3) as zamaninda_oran,
               round(avg(coalesce(g.toplam_neden_dk, 0)), 1) as ort_neden_dk
        from {{ ref('stg_ucuslar') }} u
        join {{ ref('stg_rotalar') }} r using (route_id)
        left join {{ ref('int_ucus_gecikme') }} g using (flight_id)
        where u.durum <> 'cancelled'
        group by 1"""),
    "int_ucus_gecikme": ("table", """
        select flight_id, sum(dakika) as toplam_neden_dk, count(*) as neden_sayisi
        from {{ ref('stg_gecikmeler') }} group by 1"""),
    "stg_ucuslar": ("view", """
        select flight_id, route_id, status as durum,
               date_diff('minute', cast(sched_dep as timestamp), cast(actual_dep as timestamp)) as kalkis_gecikme_dk
        from {{ source('kanat', 'hv_flights') }}"""),
    "stg_rotalar": ("view", """
        select route_id, origin || '-' || dest as rota, distance_km as mesafe_km
        from {{ source('kanat', 'hv_routes') }}"""),
    "stg_gecikmeler": ("view", """
        select flight_id, reason as neden, minutes as dakika
        from {{ source('kanat', 'hv_delays') }}"""),
}


class MiniDbt:
    def __init__(self, con, modeller):
        self.con = con
        self.modeller = modeller

    def _render(self, ad, kayit=None):
        def ref(m):
            if m not in self.modeller:
                raise ValueError(f"{ad}: bilinmeyen model {m}")
            if kayit is not None:
                kayit.append(m)
            return m

        def source(kaynak, tablo):
            return f"read_csv('{veri.yol('kanat_havayollari', tablo)}')"

        return Template(self.modeller[ad][1]).render(ref=ref, source=source)

    def derle(self, ad):
        return self._render(ad)

    def calistir(self):
        graf = {}
        for ad in self.modeller:
            bag = []
            self._render(ad, bag)
            graf[ad] = bag
        sira = list(TopologicalSorter(graf).static_order())
        for ad in sira:
            tur = self.modeller[ad][0]
            self.con.execute(f"create or replace {tur} {ad} as {self.derle(ad)}")
        return sira

    def test(self, ad, sutun, tur):
        if tur == "unique":
            sql = f"select {sutun} from {ad} group by {sutun} having count(*) > 1"
        elif tur == "not_null":
            sql = f"select * from {ad} where {sutun} is null"
        else:
            raise ValueError(tur)
        return self.con.execute(f"select count(*) from ({sql})").fetchone()[0]


def rapor(dbt):
    dbt.calistir()
    for tur in ("unique", "not_null"):
        if dbt.test("mart_rota_performans", "rota", tur):
            raise RuntimeError(f"{tur} testi kaldı")
    return dbt.con.execute("""
        select rota, ucus, zamaninda_oran from mart_rota_performans
        order by zamaninda_oran, rota limit 3
    """).fetchall()


print(rapor(MiniDbt(duckdb.connect(), MODELLER)))
'''),
  'tests': ded('''
import duckdb as _d
_c = _d.connect()
_dbt = MiniDbt(_c, MODELLER)
assert "read_csv(" in _dbt.derle("stg_ucuslar") and "{{" not in _dbt.derle("mart_rota_performans"), "derle Jinja ifadelerini çözmeli"
_r = rapor(_dbt)
assert [(a, b, float(c)) for a, b, c in _r] == [("IST-VAN", 49, 0.449), ("FRA-IST", 85, 0.482), ("ESB-ADB", 70, 0.486)], f"en düşük zamanında kalkış oranlı 3 rota yanlış: {_r}"
assert _c.execute("select table_type from information_schema.tables where table_name = 'mart_rota_performans'").fetchone()[0] == "BASE TABLE", "mart table olarak oluşmalı"
assert _c.execute("select table_type from information_schema.tables where table_name = 'stg_ucuslar'").fetchone()[0] == "VIEW", "staging view olarak oluşmalı"
assert _c.execute("select sum(ucus), count(*) from mart_rota_performans").fetchone() == (3111, 44), "iptaller hariç 3111 uçuş, 44 rota"
assert _dbt.test("stg_ucuslar", "flight_id", "unique") == 0 and _dbt.test("int_ucus_gecikme", "flight_id", "unique") == 0, "int modeli uçuş taneciğinde olmalı"
assert _dbt.test("stg_gecikmeler", "flight_id", "unique") > 0, "staging gecikmeler uçuş başına birden çok neden içerir"
_s = MiniDbt(_d.connect(), MODELLER).calistir()
assert _s.index("stg_gecikmeler") < _s.index("int_ucus_gecikme") < _s.index("mart_rota_performans"), "DAG sırası"
'''),
  'hints': ['derle: Template(sql).render(ref=lambda m: m, source=lambda k, t: f"read_csv(\'{veri.yol(\'kanat_havayollari\', t)}\')")', 'calistir: her modelin ref\'lerini toplayıp graf kur, TopologicalSorter ile sırala, materializasyona göre create or replace view/table.', 'int_ucus_gecikme bir uçuşun birden çok gecikme nedenini tek satıra indirir; mart bu sayede fan-out yapmaz.'],
  'why': 'Bu proje dbt\'nin özünü taşır: kaynak tanımı, katmanlar (staging view, intermediate ve mart table), ref ile DAG, materializasyon ve test kapısı. Gecikme nedenleri uçuş başına birden çok satır olduğu için intermediate model taneciği uçuşa indirir; aksi halde mart\'taki uçuş sayısı şişerdi (veri-modelleme dersindeki fan-out).'})

lesson = {
  'id': 'dbt-elt', 'lv': 'ileri', 'mod': 'Üretime Hazırlık', 'min': 60,
  'needs': ['duckdb', 'jinja2', 'sqlite3'],
  'title': 'ELT ve dbt mantığı: katmanlı SQL dönüşümleri ve testler',
  'sum': 'ETL\'den ELT\'ye geçişi, dbt\'nin sources-staging-intermediate-marts katmanlarını, ref() ve bağımlılık grafiğini, materializasyonları, testleri, köken, snapshot ve seed\'i öğrenir; DuckDB ve jinja2 ile kendi mini-dbt\'ni yazıp kanat_havayollari için katmanlı bir proje kurarsın.',
  'goals': [
    'ETL ile ELT\'yi karşılaştırıp dbt projesini sources, staging, intermediate ve marts katmanlarına ayırabilirim.',
    'Jinja ile ref/source çözen bir derleyici yazıp bağımlılık grafiğini topolojik sırayla çalıştırabilirim.',
    'view, table ve incremental materializasyonların farkını bilip idempotent artımlı yükleme yazabilirim.',
    'unique, not_null, accepted_values ve relationships testlerini SQL olarak üretip çalıştırabilirim.',
    'Köken grafiğiyle etki analizi yapabilir, snapshot (SCD2) ve seed mantığını uygulayabilirim.'
  ],
  'body': body,
  'ex': ex,
  'faq': [
    {'q': 'dbt bir orkestratör mü?', 'a': 'Hayır. dbt yalnız ambar içindeki SQL dönüşümlerini derler, sıralar ve çalıştırır. Ne zaman çalışacağını, yükleme adımlarıyla sırasını Airflow, Dagster, Prefect ya da dbt Cloud zamanlayıcısı belirler.'},
    {'q': 'dbt Core ile dbt Cloud farkı?', 'a': 'dbt Core açık kaynak komut satırı aracıdır; kendi sunucunda, CI\'da çalıştırırsın. dbt Cloud aynı motorun üzerine web IDE, zamanlayıcı, belge barındırma ve semantik katman ekleyen ücretli hizmettir. Bu dersteki kavramlar ikisinde aynıdır.'},
    {'q': 'Python modeli yazılabilir mi?', 'a': 'Evet; dbt 1.3\'ten beri Snowflake, Databricks ve BigQuery gibi platformlarda model bir Python fonksiyonu (DataFrame döndüren) olabilir. Yine de dbt projelerinin büyük çoğunluğu SQL\'dir; Python modelini SQL\'de zor olan işler (ör. ML skoru) için ayır.'},
    {'q': 'Testler ne zaman çalışmalı?', 'a': 'Her model oluşturulduktan hemen sonra (dbt build bunu yapar). Kaynak tablolar için tazelik ve temel testler yükleme sonrası, mart testleri panolar yenilenmeden önce çalışmalı. Testi kalan modelin torunları atlanır, böylece hatalı veri panoya ulaşmaz.'}
  ],
  'mistakes': [
    {'bad': 'select * from analytics.stg_ucuslar', 'good': "select * from {{ ref('stg_ucuslar') }}", 'why': 'Elle yazılan tablo adı bağımlılığı gizler: model yanlış sırada çalışabilir, ortam şeması (dev/prod) yanlış olur ve köken grafiği eksik kalır.'},
    {'bad': "where olay_zamani >= (select max(olay_zamani) from {{ this }})", 'good': "where olay_zamani > (select max(olay_zamani) from {{ this }})\n-- ve config(unique_key='olay_id')", 'why': '>= her çalışmada son zaman damgalı satırları yeniden ekler. > ile birlikte unique_key vermek tekrar çalıştırmayı güvenli kılar.'},
    {'bad': '-- staging modelinde\nselect u.*, r.rota from hv_flights u join hv_routes r using (route_id)', 'good': '-- staging: tek kaynak, yeniden adlandır/dönüştür\n-- JOIN\'ler intermediate ya da mart katmanında', 'why': 'Staging her kaynak tablo için tek giriş noktasıdır. JOIN ve iş mantığı oraya girerse yeniden kullanım ve test zorlaşır.'},
    {'bad': "{% for s in sutunlar %}sum({{ s }}) as {{ s }}, {% endfor %} from t", 'good': "{% for s in sutunlar %}sum({{ s }}) as {{ s }}{{ ', ' if not loop.last }}{% endfor %} from t", 'why': 'Döngüyle SQL üretirken sondaki fazladan virgül sözdizimi hatası verir; loop.last ile son elemanı ayır.'}
  ],
}

write(lesson, '/home/claude/py/v2/n3/dbt-elt.js')
