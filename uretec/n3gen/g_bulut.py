import sys
sys.path.insert(0, '/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad/n3gen')
from emit_n3 import write, ded, py, pc

SAHTE_S3 = ded('''
class NoSuchKey(KeyError):
    pass


class SahteS3:
    """boto3 S3 istemcisinin bellek içi, sadeleştirilmiş taklidi."""

    def __init__(self):
        self.kovalar = {}

    def create_bucket(self, Bucket):
        self.kovalar.setdefault(Bucket, {})

    def put_object(self, Bucket, Key, Body):
        if isinstance(Body, str):
            Body = Body.encode("utf-8")
        self.kovalar[Bucket][Key] = Body
        return {"ETag": str(hash(Body))}

    def get_object(self, Bucket, Key):
        try:
            return {"Body": self.kovalar[Bucket][Key], "ContentLength": len(self.kovalar[Bucket][Key])}
        except KeyError:
            raise NoSuchKey(Key) from None

    def delete_object(self, Bucket, Key):
        self.kovalar[Bucket].pop(Key, None)

    def list_objects_v2(self, Bucket, Prefix="", MaxKeys=1000, ContinuationToken=None):
        anahtarlar = sorted(k for k in self.kovalar[Bucket] if k.startswith(Prefix))
        if ContinuationToken:
            anahtarlar = [k for k in anahtarlar if k > ContinuationToken]
        sayfa = anahtarlar[:MaxKeys]
        yanit = {"KeyCount": len(sayfa), "IsTruncated": len(anahtarlar) > MaxKeys}
        if sayfa:                                   # gerçek S3 gibi: boş sonuçta Contents yok
            yanit["Contents"] = [{"Key": k, "Size": len(self.kovalar[Bucket][k])} for k in sayfa]
        if yanit["IsTruncated"]:
            yanit["NextContinuationToken"] = sayfa[-1]
        return yanit
''')

body = '''
<h2>Neden bulut?</h2>
<p>Kanat Havayolları'nın veri ekibi her gece uçuş, rezervasyon ve gecikme dosyalarını işliyor. İlk yıl tek bir sunucu yetti. Sonra veri büyüdü, sunucunun diski doldu, bir gece disk bozuldu ve iki günlük veri kayboldu; yeni sunucu almak haftalar sürdü. Bulut (cloud) bu sorunları kiralık, ölçeklenebilir ve yönetilen hizmetlerle çözer: depolamayı terabayt terabayt değil gigabayt-ay olarak ödersin, sunucuyu dakikalar içinde açıp kapatırsın, yedekleme ve donanım arızası sağlayıcının sorunudur.</p>
<p>Bu derste bir veri ya da backend mühendisinin bulutta ilk gün ihtiyaç duyduğu temelleri öğreneceksin: hizmet modelleri, bölgeler, <b>nesne depolama</b> (S3) ve <b>boto3</b>, data lake klasör düzeni, <b>IAM</b> ve en az yetki ilkesi, imzalı URL, serverless fonksiyonlar, yönetilen veritabanları ve <b>maliyet</b>. Uygulamayı Docker ile paketlemeyi <i>docker-deploy</i> dersinde gördün; bu ders o paketin nereye ve nasıl gideceğini anlatır.</p>
<div class="note"><b>Kendi bilgisayarında dene</b>boto3 gerçek bir AWS hesabı ve ağ erişimi ister; bu sayfadaki motorda çalışmaz. Gri kutulardaki kodları kendi bilgisayarında dene: <code>pip install boto3 moto</code>. Gerçek hesapta denerken ücretsiz katman (free tier) sınırlarını ve bütçe alarmını ayarlamayı unutma. Yeşil kutular ve alıştırmalar boto3'ün arayüzünü taklit eden bellek içi bir <b>SahteS3</b> sınıfı ve saf Python ile çalışır.</div>

<h2>Hizmet modelleri, bölgeler ve sağlayıcılar</h2>
<ul>
<li><b>IaaS</b> (altyapı hizmeti): sanal makine, disk, ağ kiralarsın; işletim sistemi ve yazılım senin sorumluluğundur. Örnek: EC2.</li>
<li><b>PaaS</b> (platform hizmeti): kodunu ya da konteynerini verirsin, sunucuyu sağlayıcı yönetir. Örnek: Cloud Run, App Service, yönetilen veritabanı.</li>
<li><b>SaaS</b> (yazılım hizmeti): hazır uygulamayı kullanırsın. Örnek: Gmail, Salesforce.</li>
</ul>
<p><b>Bölge</b> (region) coğrafi bir veri merkezi grubudur (ör. Frankfurt); <b>kullanılabilirlik alanı</b> (availability zone, AZ) bölge içindeki birbirinden bağımsız elektrik ve ağa sahip veri merkezidir. Kritik sistemler en az iki AZ'ye yayılır; bir AZ çökerse diğeri çalışmaya devam eder. Bölge seçimi gecikme (kullanıcıya yakınlık), fiyat ve <b>yasal veri yerleşimi</b> kurallarına göre yapılır.</p>
<div class="tbl-wrap"><table>
<tr><th>Hizmet</th><th>AWS</th><th>Google Cloud</th><th>Azure</th></tr>
<tr><td>Nesne depolama</td><td>S3</td><td>Cloud Storage (GCS)</td><td>Blob Storage</td></tr>
<tr><td>Sanal makine</td><td>EC2</td><td>Compute Engine</td><td>Virtual Machines</td></tr>
<tr><td>Serverless fonksiyon</td><td>Lambda</td><td>Cloud Run functions</td><td>Azure Functions</td></tr>
<tr><td>Konteyner çalıştırma</td><td>ECS / Fargate</td><td>Cloud Run</td><td>Container Apps</td></tr>
<tr><td>Yönetilen PostgreSQL</td><td>RDS / Aurora</td><td>Cloud SQL</td><td>Azure Database for PostgreSQL</td></tr>
<tr><td>Veri ambarı</td><td>Redshift</td><td>BigQuery</td><td>Synapse / Fabric</td></tr>
<tr><td>Kimlik ve yetki</td><td>IAM</td><td>Cloud IAM</td><td>Entra ID + RBAC</td></tr>
</table></div>

<h2>Nesne depolama: bucket, key, prefix</h2>
<p>S3 bir dosya sistemi değildir; <b>anahtar-değer deposudur</b>. <b>Bucket</b> (kova) küresel olarak benzersiz adlı bir kaptır; içindeki her <b>nesne</b> (object) bir <b>anahtar</b> (key) ile saklanır: <code>ham/kanat/ucuslar/yil=2024/ay=09/gun=01/part-000.csv</code>. Konsolda "klasör" gibi görünen şey anahtarın <code>/</code>'a kadarki <b>önekidir</b> (prefix); gerçek klasör yoktur. Nesneler değiştirilmez, üstüne yazılır; "dosyanın sonuna ekle" yoktur.</p>
''' + pc('''
import boto3

s3 = boto3.client("s3", region_name="eu-central-1")      # kimlik bilgisi ortamdan/rolden gelir
s3.upload_file("ucuslar.csv", "kanat-veri", "ham/kanat/ucuslar/yil=2024/ay=09/gun=01/part-000.csv")

nesne = s3.get_object(Bucket="kanat-veri", Key="ham/kanat/ucuslar/yil=2024/ay=09/gun=01/part-000.csv")
metin = nesne["Body"].read().decode("utf-8")

# Listeleme en fazla 1000 anahtar döndürür: sayfalayıcı (paginator) kullan
sayfalayici = s3.get_paginator("list_objects_v2")
for sayfa in sayfalayici.paginate(Bucket="kanat-veri", Prefix="ham/kanat/ucuslar/yil=2024/ay=09/"):
    for nesne in sayfa.get("Contents", []):
        print(nesne["Key"], nesne["Size"])
''') + '''
<p>Aynı arayüzü bellek içinde taklit eden bir sınıfla tarayıcıda deneyelim. Alıştırmalarda bu <code>SahteS3</code> sınıfını kullanacaksın; metot ve parametre adları boto3 ile aynıdır, böylece kodun gerçek istemciye neredeyse değişmeden taşınır.</p>
''' + py(SAHTE_S3 + '''

s3 = SahteS3()
s3.create_bucket(Bucket="kanat-veri")
for gun in ["01", "02", "03"]:
    s3.put_object(Bucket="kanat-veri", Key=f"ham/kanat/ucuslar/yil=2024/ay=09/gun={gun}/part-000.csv",
                  Body="flight_id,status\\n1,landed\\n")
s3.put_object(Bucket="kanat-veri", Key="ham/kanat/gecikmeler/yil=2024/ay=09/gun=01/part-000.csv", Body="x")

yanit = s3.list_objects_v2(Bucket="kanat-veri", Prefix="ham/kanat/ucuslar/", MaxKeys=2)
print([n["Key"].split("/")[-2] for n in yanit["Contents"]], yanit["IsTruncated"])
print(s3.get_object(Bucket="kanat-veri", Key="ham/kanat/ucuslar/yil=2024/ay=09/gun=01/part-000.csv")["Body"].decode())
''') + '''

<h2>Data lake yerleşimi ve bölümleme</h2>
<p>Data lake (veri gölü), farklı kaynaklardan gelen ham ve işlenmiş verinin nesne depolamada düzenli bir yol şemasıyla tutulmasıdır. Yaygın katman düzeni (madalyon mimarisi olarak da bilinir):</p>
<div class="tbl-wrap"><table>
<tr><th>Katman</th><th>İçerik</th><th>Kural</th></tr>
<tr><td><code>ham/</code> (bronze)</td><td>Kaynaktan geldiği gibi</td><td>Asla değiştirilmez; yeniden işleme kaynağı</td></tr>
<tr><td><code>temiz/</code> (silver)</td><td>Tür dönüşümü, tekilleştirme, şema doğrulama</td><td>Genellikle Parquet</td></tr>
<tr><td><code>mart/</code> (gold)</td><td>İş için özetlenmiş tablolar</td><td>Panolar ve analistler okur</td></tr>
</table></div>
<p>Her katmanda veri <b>tarihe göre bölümlenir</b> (partitioning). Hive biçimi (<code>yil=2024/ay=09/gun=01</code>) sorgu motorlarının (Athena, BigQuery, Spark, DuckDB) yalnızca ilgili klasörleri okumasını sağlar (partition pruning): "Eylül verisi" sorgusu diğer ayları hiç açmaz. Ay ve gün <b>iki haneli</b> yazılmalıdır, yoksa metin sıralaması bozulur (<code>ay=10</code> &lt; <code>ay=9</code>).</p>
''' + py('''
from datetime import date

def lake_yolu(katman, kaynak, tablo, gun, parca=0):
    if katman not in {"ham", "temiz", "mart"}:
        raise ValueError(f"bilinmeyen katman: {katman}")
    return f"{katman}/{kaynak}/{tablo}/yil={gun.year}/ay={gun.month:02d}/gun={gun.day:02d}/part-{parca:03d}.csv"

print(lake_yolu("ham", "kanat", "ucuslar", date(2024, 9, 1)))
print(sorted(["ay=9", "ay=10", "ay=11"]), sorted(["ay=09", "ay=10", "ay=11"]))
''') + '''

<h2>IAM ve en az yetki</h2>
<p>IAM (Identity and Access Management) "kim, hangi kaynakta, hangi işlemi yapabilir?" sorusunu yönetir. Yetki JSON <b>politikalarıyla</b> verilir. Değerlendirme kuralı basittir: varsayılan olarak her şey yasaktır; bir <code>Allow</code> izin verir; açık bir <code>Deny</code> her zaman kazanır.</p>
''' + pc('''
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "HamKatmaniOku",
      "Effect": "Allow",
      "Action": ["s3:GetObject"],
      "Resource": "arn:aws:s3:::kanat-veri/ham/kanat/*"
    },
    {
      "Sid": "MartKatmaninaYaz",
      "Effect": "Allow",
      "Action": ["s3:PutObject"],
      "Resource": "arn:aws:s3:::kanat-veri/mart/*"
    }
  ]
}
''') + '''
<p><b>En az yetki ilkesi</b> (least privilege): her kimlik yalnızca işini yapmak için gereken eylemlere, yalnızca gereken kaynaklarda sahip olmalı. <code>"Action": "s3:*"</code> ve <code>"Resource": "*"</code> görmek kod incelemesinde kırmızı bayraktır.</p>
<div class="tbl-wrap"><table>
<tr><th></th><th>Erişim anahtarı (access key)</th><th>Rol (role)</th></tr>
<tr><td>Nedir?</td><td>Kalıcı kullanıcı adı/parola çifti</td><td>Geçici kimlik bilgisi veren kimlik</td></tr>
<tr><td>Süre</td><td>Silinene kadar geçerli</td><td>Dakikalar/saatler sonra kendiliğinden düşer</td></tr>
<tr><td>Risk</td><td>Koda, git'e, loga sızabilir</td><td>Sızsa bile kısa ömürlü</td></tr>
<tr><td>Kullanım</td><td>Mümkünse hiç; zorunluysa kasada (secrets manager)</td><td>EC2, Lambda, konteyner, CI (OIDC) için standart</td></tr>
</table></div>
<p>boto3 kimlik bilgisini sırayla ortam değişkenlerinden, <code>~/.aws</code> profilinden ve çalıştığı makinenin rolünden arar. Koda asla anahtar yazma; yazdıysan anahtarı hemen iptal et (git geçmişinden silmek yetmez).</p>

<h3>İmzalı URL (presigned URL)</h3>
<p>Bir müşteriye özel bir faturayı indirtmek için kovayı herkese açmak yerine <b>süreli, imzalı bir bağlantı</b> üretirsin: <code>s3.generate_presigned_url("get_object", Params={...}, ExpiresIn=900)</code>. URL; nesne anahtarı, son kullanma zamanı ve gizli anahtarla üretilmiş bir HMAC imzası içerir. Sunucu imzayı yeniden hesaplar, eşleşmiyorsa ya da süre geçtiyse reddeder. Mantığı standart kütüphaneyle:</p>
''' + py('''
import hashlib
import hmac

GIZLI = b"sunucuda-saklanan-gizli-anahtar"

def imzala(anahtar, bitis):
    mesaj = f"{anahtar}|{bitis}".encode()
    return hmac.new(GIZLI, mesaj, hashlib.sha256).hexdigest()[:16]

bitis = 1_735_700_000 + 900          # simdi + 15 dakika (epoch saniye)
imza = imzala("fatura/2024/12/F-1001.pdf", bitis)
print(f"https://kanat-veri.s3.amazonaws.com/fatura/2024/12/F-1001.pdf?expires={bitis}&sig={imza}")
print(hmac.compare_digest(imza, imzala("fatura/2024/12/F-1001.pdf", bitis)),
      hmac.compare_digest(imza, imzala("fatura/2024/12/F-1002.pdf", bitis)))
''') + '''

<h2>Serverless fonksiyon ve olay tetikleyici</h2>
<p><b>Serverless</b> (sunucusuz) fonksiyonda yalnız bir fonksiyon yazarsın; sağlayıcı onu bir olay geldiğinde çalıştırır, milisaniye başına ücret alır, boşta maliyet sıfırdır. Tipik veri kullanımı: <code>ham/</code>'a yeni dosya düşünce S3 bir olay üretir, Lambda dosyayı okuyup doğrular ve <code>temiz/</code>'e yazar. Sınırları: çalışma süresi sınırı (AWS Lambda'da 15 dakika), soğuk başlangıç (cold start) gecikmesi, sınırlı bellek/disk. Uzun işler için konteyner (Fargate, Cloud Run) ya da toplu iş (batch) hizmetleri seçilir.</p>
''' + pc('''
import json, urllib.parse, boto3

s3 = boto3.client("s3")

def handler(event, context):
    for kayit in event["Records"]:
        kova = kayit["s3"]["bucket"]["name"]
        anahtar = urllib.parse.unquote_plus(kayit["s3"]["object"]["key"])   # olaydaki anahtar URL kodludur!
        govde = s3.get_object(Bucket=kova, Key=anahtar)["Body"].read()
        # ... doğrula, dönüştür ...
        s3.put_object(Bucket=kova, Key=anahtar.replace("ham/", "temiz/", 1), Body=govde)
    return {"statusCode": 200, "body": json.dumps({"islenen": len(event["Records"])})}
''') + '''

<h2>Yönetilen veritabanı ve ambar</h2>
<p>Kendi sunucunda PostgreSQL kurmak yerine <b>yönetilen</b> hizmet (RDS, Cloud SQL) yedekleme, yama, çoğaltma ve AZ'ler arası yedekliliği üstlenir; sen şema ve sorguyla ilgilenirsin (<i>postgresql-python</i> dersi). Analitik için <b>BigQuery</b> (sunucusuz, taranan bayt başına ücret), <b>Snowflake</b> (depolama ve hesaplama ayrı ölçeklenir) ve <b>Redshift</b> gibi ambarlar kullanılır; dbt modelleri (<i>dbt-elt</i>) bu ambarlarda çalışır. Ortak tasarım ilkesi: <b>depolama ve hesaplamanın ayrılması</b>. Veri ucuz nesne depolamada durur, sorgu anında hesaplama kiralanır.</p>

<h2>Maliyet tuzakları</h2>
<p>Bulut faturası birkaç kalemden oluşur: depolama (GB-ay), istek sayısı (her PUT/GET/LIST), <b>dışarı çıkan trafik</b> (egress: buluttan internete ya da başka bölgeye veri aktarımı) ve hesaplama süresi. En sık sürprizler:</p>
<ul>
<li><b>Çıkış trafiği</b>: veriyi buluta yüklemek genellikle ücretsiz, dışarı çekmek ücretlidir. Analizi verinin bulunduğu bölgede yap.</li>
<li><b>Küçük dosyalar</b>: saatte binlerce 5 KB'lık dosya hem istek ücretini patlatır hem de sorgu motorlarını yavaşlatır. Dosyaları yüzlerce MB'lık parçalarda birleştir (compaction).</li>
<li><b>Unutulan kaynaklar</b>: test için açılıp kapatılmayan makineler, ekli kalmış diskler, eski anlık görüntüler. Etiketleme (tag) ve bütçe alarmı şart.</li>
<li><b>Yaşam döngüsü yok</b>: 3 yıllık ham log'u en pahalı depolama sınıfında tutmak. Eski veriyi soğuk sınıfa taşıyan ya da silen yaşam döngüsü (lifecycle) kuralı yaz.</li>
</ul>
''' + py('''
# Temsili birim fiyatlar (gerçek fiyatlar bölgeye ve zamana göre değişir; sağlayıcının fiyat sayfasına bak)
FIYAT = {"depolama_gb_ay": 0.023, "put_1000": 0.005, "get_1000": 0.0004, "cikis_gb": 0.09}

def aylik(gb, put, get, cikis_gb):
    return round(gb * FIYAT["depolama_gb_ay"] + put / 1000 * FIYAT["put_1000"]
                 + get / 1000 * FIYAT["get_1000"] + cikis_gb * FIYAT["cikis_gb"], 2)

# Aynı 500 GB veri: saatte 3600 küçük dosya mı, saatte 1 büyük dosya mı?
print("küçük dosyalar:", aylik(500, 3600 * 24 * 30, 3600 * 24 * 30 * 5, 50), "$")
print("birleştirilmiş:", aylik(500, 24 * 30, 24 * 30 * 5, 50), "$")
''') + '''

<h2>Altyapıyı kod olarak yönetmek</h2>
<p>Konsolda tıklayarak kurulan altyapı tekrarlanamaz ve denetlenemez. <b>IaC</b> (Infrastructure as Code) araçlarında (Terraform, Pulumi, AWS CDK) kovalar, roller ve politikalar dosyada tanımlanır, kod incelemesinden geçer ve <code>plan</code> ile değişiklik önceden görülür.</p>
''' + pc('''
# main.tf
resource "aws_s3_bucket" "veri" {
  bucket = "kanat-veri"
  tags   = { ekip = "veri", ortam = "prod" }
}
resource "aws_s3_bucket_lifecycle_configuration" "ham" {
  bucket = aws_s3_bucket.veri.id
  rule {
    id     = "ham-soguk"
    status = "Enabled"
    filter { prefix = "ham/" }
    transition { days = 90  storage_class = "GLACIER" }
  }
}
''') + '''

<h2>Test: sahte bulut</h2>
<p>Birim testlerinde gerçek buluta gitmek yavaş, pahalı ve kırılgandır. <b>moto</b> kütüphanesi boto3 çağrılarını bellek içinde karşılar; alıştırmalardaki <code>SahteS3</code> ile aynı fikir. Entegrasyon testleri için LocalStack gibi yerel emülatörler de vardır.</p>
''' + pc('''
import boto3
from moto import mock_aws

@mock_aws
def test_rapor_mart_katmanina_yazilir():
    s3 = boto3.client("s3", region_name="eu-central-1")
    s3.create_bucket(Bucket="kanat-veri", CreateBucketConfiguration={"LocationConstraint": "eu-central-1"})
    rapor_uret(s3, "kanat-veri", "2024-09-01")              # test edilen fonksiyon
    anahtarlar = [o["Key"] for o in s3.list_objects_v2(Bucket="kanat-veri", Prefix="mart/")["Contents"]]
    assert anahtarlar == ["mart/kanat/gunluk/yil=2024/ay=09/gun=01/rapor.json"]
''') + '''
<div class="warn"><b>KVKK ve veri yerleşimi</b>Kişisel veriyi yurt dışındaki bir bölgeye aktarmak KVKK kapsamında ek şartlara bağlıdır. Bölge seçimi teknik değil hukuki bir karardır: hangi verinin (kimlik, sağlık, finans) hangi bölgede tutulabileceğini hukuk ve bilgi güvenliği ekipleriyle birlikte belirle, kişisel veriyi mümkünse maskele ya da takma adlandır (pseudonymization) ve şifreleme anahtarlarının yönetimini planla.</div>
<div class="note"><b>Gerçek işte</b>Bulut olaylarının çoğu karmaşık saldırılar değil, basit yapılandırma hatalarıdır: herkese açık bırakılmış bir kova, git'e itilmiş bir erişim anahtarı, <code>s3:*</code> yetkili bir uygulama rolü. Kıdemli ekipler üç kuralı otomatikleştirir: hesap düzeyinde "herkese açık erişimi engelle" ayarı, uzun ömürlü anahtar yerine rol ve OIDC, ve her kaynağa sahibini ve maliyet merkezini gösteren etiket. Faturayı her ay ekip bazında incelemek de mühendisliğin parçasıdır (FinOps).</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Tablo biçimleri</h3>
<p>Data lake'te düz Parquet dosyalarının üstüne <b>Apache Iceberg</b>, <b>Delta Lake</b> ve <b>Hudi</b> gibi açık tablo biçimleri ACID işlem, şema evrimi, zamanda yolculuk (eski sürümü sorgulama) ve satır düzeyinde güncelleme ekler. "Lakehouse" mimarisi bunların üstüne kurulur.</p>
<h3>Tutarlılık ve idempotent yazma</h3>
<p>S3 bugün yazdığını hemen okuyabildiğin güçlü tutarlılık sunar; ama olay tetikleyicileri en az bir kez (at-least-once) teslim edilir. Aynı olay iki kez gelebilir; Lambda'n aynı girdiyle iki kez çalışınca aynı sonucu üretmeli (deterministik çıktı anahtarı, üstüne yazma).</p>
<h3>Ağ ve şifreleme</h3>
<p>VPC (sanal özel ağ), alt ağlar ve güvenlik grupları veritabanını internetten ayırır; VPC endpoint ile S3 trafiği internete çıkmadan gider (hem güvenlik hem çıkış maliyeti). Kovalarda varsayılan şifreleme açık olmalı; hassas veride anahtarı kendin yönettiğin KMS anahtarı kullan.</p>
<h3>Gözlemlenebilirlik</h3>
<p>CloudWatch, Cloud Logging gibi hizmetler logları ve metrikleri toplar; S3 erişim logları ve CloudTrail "kim, ne zaman, neyi okudu?" sorusunu yanıtlar. Denetim izi KVKK açısından da gereklidir.</p>
</section>
'''

ex = []
ex += [
    {'t': 'mc', 'stage': 'Isınma',
     'q': 'S3 konsolunda <code>ham/kanat/ucuslar/</code> bir klasör gibi görünüyor. Gerçekte nedir?',
     'o': ['Diskte ayrı bir dizin; içine dosya taşınabilir', 'Anahtarların ortak öneki; ayrı bir nesne olması gerekmez', 'Ayrı bir alt kova (sub-bucket)', 'Yalnızca konsolun tuttuğu bir etiket (tag)'],
     'a': 1,
     'why': 'Nesne depolama düz bir anahtar-değer deposudur. "Klasör", anahtarların / ile ayrılmış öneklerinden türetilen bir görünümdür; listeleme Prefix ve Delimiter ile yapılır. Bu yüzden "klasörü yeniden adlandırmak" aslında tüm nesneleri kopyalayıp silmek demektir.'},
    {'t': 'mc', 'stage': 'Isınma',
     'q': 'Bir Lambda fonksiyonunun S3\'ten okuması gerekiyor. En güvenli kimlik yöntemi hangisidir?',
     'o': ['Erişim anahtarını kodun içine sabit olarak yazmak', 'Fonksiyona yalnız gereken izinli bir IAM rolü bağlamak', 'Anahtarı ortam değişkenine düz metin yazmak', 'Kovayı herkese açık okumaya izin verecek şekilde ayarlamak'],
     'a': 1,
     'why': 'Rol, kısa ömürlü ve kendiliğinden yenilenen kimlik bilgisi verir; koda veya yapılandırmaya gizli bilgi girmez. Rolün politikası yalnız gereken eylem ve öneki kapsamalı (en az yetki).'},
    {'t': 'mc', 'stage': 'Isınma',
     'q': 'Bir ekip her dakika birkaç KB\'lık JSON dosyasını S3\'e yazıyor ve Athena sorguları çok yavaş. En olası neden ve çözüm nedir?',
     'o': ['Depolama sınıfı yanlış; Glacier\'a taşınmalı', 'Küçük dosya sorunu; dosyalar büyük parçalarda birleştirilmeli', 'Bölge yanlış; veri başka bölgeye kopyalanmalı', 'JSON yerine CSV kullanılırsa sorun kendiliğinden kalkar'],
     'a': 1,
     'why': 'Sorgu motoru her dosya için ayrı istek ve açma maliyeti öder; milyonlarca küçük dosya hem yavaş hem pahalıdır. Periyodik birleştirme (compaction) ve sütun tabanlı biçim (Parquet) standart çözümdür.'},
]
ex += [
    {'t': 'predict', 'stage': 'Kodu oku', 'q': 'Ön ek ve ayırıcıyla "klasör" listeleme. Bu kod ne yazdırır?',
     'code': ded('''
anahtarlar = [
    "ham/kanat/ucuslar/ay=09/a.csv",
    "ham/kanat/ucuslar/ay=10/b.csv",
    "ham/kanat/ucuslar/ay=10/c.csv",
    "ham/kanat/gecikmeler/ay=09/d.csv",
    "ham/kanat/ucuslar/ozet.json",
]
onek = "ham/kanat/ucuslar/"
klasorler, dosyalar = set(), []
for k in anahtarlar:
    if not k.startswith(onek):
        continue
    kalan = k[len(onek):]
    if "/" in kalan:
        klasorler.add(onek + kalan.split("/")[0] + "/")
    else:
        dosyalar.append(k)
print(sorted(klasorler), dosyalar)
'''),
     'o': ["['ham/kanat/ucuslar/ay=09/', 'ham/kanat/ucuslar/ay=10/'] ['ham/kanat/ucuslar/ozet.json']", "['ham/kanat/ucuslar/ay=09/', 'ham/kanat/ucuslar/ay=10/', 'ham/kanat/ucuslar/ay=10/'] ['ham/kanat/ucuslar/ozet.json']", "['ay=09', 'ay=10'] []", "['ham/kanat/gecikmeler/ay=09/', 'ham/kanat/ucuslar/ay=09/', 'ham/kanat/ucuslar/ay=10/'] ['ham/kanat/ucuslar/ozet.json']"],
     'a': 0,
     'why': 'Bu, list_objects_v2(Prefix=..., Delimiter="/") davranışıdır: önekten sonraki ilk / \'a kadar olan kısımlar CommonPrefixes (alt "klasörler") olur ve tekilleşir; / içermeyenler doğrudan nesnelerdir. Gecikmeler öneke uymadığı için hiç görünmez.'},
    {'t': 'predict', 'stage': 'Kodu oku', 'q': 'IAM eylem kalıpları joker karakter (*) içerebilir. Bu kod ne yazdırır?',
     'code': ded('''
from fnmatch import fnmatchcase

izinli = ["s3:Get*", "s3:ListBucket"]
for eylem in ["s3:GetObject", "s3:PutObject", "s3:ListBucket", "s3:GetObjectAcl"]:
    print(eylem, any(fnmatchcase(eylem, k) for k in izinli))
'''),
     'o': ['s3:GetObject True\ns3:PutObject False\ns3:ListBucket True\ns3:GetObjectAcl True', 's3:GetObject True\ns3:PutObject False\ns3:ListBucket True\ns3:GetObjectAcl False', 's3:GetObject True\ns3:PutObject True\ns3:ListBucket True\ns3:GetObjectAcl True', 's3:GetObject False\ns3:PutObject False\ns3:ListBucket True\ns3:GetObjectAcl False'],
     'a': 0,
     'why': 's3:Get* "s3:Get" ile başlayan her eylemi kapsar; GetObjectAcl de buna dahildir. Joker karakterler beklediğinden geniş yetki verebilir: "yalnız nesne okusun" istiyorsan s3:GetObject yaz.'},
    {'t': 'predict', 'stage': 'Kodu oku', 'q': 'Temsili fiyatlarla aylık fatura hesabı. Bu kod ne yazdırır?',
     'code': ded('''
FIYAT = {"depolama_gb_ay": 0.02, "cikis_gb": 0.09}
depolama = 1000 * FIYAT["depolama_gb_ay"]
cikis = 300 * FIYAT["cikis_gb"]
print(round(depolama, 2), round(cikis, 2), round(depolama + cikis, 2))
'''),
     'o': ['20.0 27.0 47.0', '20.0 2.7 22.7', '2.0 27.0 29.0', '20.0 27.0 20.0'],
     'a': 0,
     'why': '1000 GB × 0.02 = 20 $ depolama; 300 GB çıkış × 0.09 = 27 $. Örnekte veriyi dışarı çekmek, onu bir ay saklamaktan daha pahalı: çıkış trafiği en sık gözden kaçan kalemdir.'},
    {'t': 'order', 'stage': 'Kodu oku',
     'q': '<p>Bir uçuş kaydının tarihinden Hive biçimli data lake yolu üreten programın satırlarını sırala.</p>',
     'lines': [
         'from datetime import datetime',
         'kayit = {"flight_id": 1, "sched_dep": "2024-09-01 06:00:00"}',
         'zaman = datetime.fromisoformat(kayit["sched_dep"])',
         'bolum = f"yil={zaman.year}/ay={zaman.month:02d}/gun={zaman.day:02d}"',
         'yol = "/".join(["ham", "kanat", "ucuslar", bolum, "part-000.csv"])',
         'print(yol)',
     ],
     'expect': 'ham/kanat/ucuslar/yil=2024/ay=09/gun=01/part-000.csv\n',
     'hint': 'Önce tarih nesnesi, sonra bölüm metni, en son tam yol.',
     'why': 'Bölüm metni tarihten türetilir ve iki haneli ay/gün kullanır; tam yol katman, kaynak, tablo, bölüm ve dosya adının birleşimidir.'},
]

# Rehberli
ex.append({'t': 'code', 'stage': 'Rehberli', 'id': 'bulut-temelleri-1', 'diff': 2,
  'q': '<p>boto3 arayüzlü bir <code>SahteS3</code> sınıfı yaz (testlerde moto\'nun yaptığı gibi):</p><ul><li><code>create_bucket(Bucket)</code></li><li><code>put_object(Bucket, Key, Body)</code>: <code>Body</code> metinse UTF-8 baytlara çevir; kova yoksa <code>KeyError</code>.</li><li><code>get_object(Bucket, Key)</code>: <code>{"Body": bytes, "ContentLength": int}</code>; anahtar yoksa <code>NoSuchKey</code> (KeyError alt sınıfı).</li><li><code>list_objects_v2(Bucket, Prefix="")</code>: öneke uyan anahtarları <b>sıralı</b> olarak <code>{"KeyCount": n, "Contents": [{"Key": ..., "Size": ...}]}</code> biçiminde döndür; eşleşme yoksa <code>Contents</code> anahtarı <b>hiç olmasın</b> (gerçek S3 böyle davranır).</li></ul>',
  'guide': ['Kovaları {ad: {anahtar: bytes}} sözlüğünde tut.', 'put_object\'te isinstance(Body, str) ise encode et.', 'get_object\'te KeyError\'ı yakalayıp NoSuchKey fırlat.', 'list_objects_v2\'de startswith(Prefix) ile süz, sırala; boşsa yalnız KeyCount döndür.'],
  'example': ded('''
class Depo:
    def __init__(self):
        self.raflar = {}

    def koy(self, raf, etiket, icerik):
        self.raflar.setdefault(raf, {})[etiket] = icerik

    def listele(self, raf, onek=""):
        return sorted(e for e in self.raflar.get(raf, {}) if e.startswith(onek))

d = Depo()
d.koy("A", "kitap/roman/1", "Suç ve Ceza")
d.koy("A", "kitap/siir/1", "Kuyucaklı")
print(d.listele("A", "kitap/roman/"))
'''),
  'start': ded('''
class NoSuchKey(KeyError):
    pass


class SahteS3:
    def __init__(self):
        self.kovalar = {}

    def create_bucket(self, Bucket):
        # TODO
        pass

    def put_object(self, Bucket, Key, Body):
        # TODO: metni baytlara çevir ve sakla
        pass

    def get_object(self, Bucket, Key):
        # TODO: yoksa NoSuchKey
        pass

    def list_objects_v2(self, Bucket, Prefix=""):
        # TODO: sıralı Contents, boşsa Contents yok
        pass


s3 = SahteS3()
s3.create_bucket(Bucket="kanat-veri")
s3.put_object(Bucket="kanat-veri", Key="ham/kanat/a.csv", Body="flight_id\\n1\\n")
print(s3.list_objects_v2(Bucket="kanat-veri", Prefix="ham/"))
'''),
  'sol': ded('''
class NoSuchKey(KeyError):
    pass


class SahteS3:
    def __init__(self):
        self.kovalar = {}

    def create_bucket(self, Bucket):
        self.kovalar.setdefault(Bucket, {})

    def put_object(self, Bucket, Key, Body):
        if isinstance(Body, str):
            Body = Body.encode("utf-8")
        self.kovalar[Bucket][Key] = Body
        return {"ETag": str(hash(Body))}

    def get_object(self, Bucket, Key):
        try:
            govde = self.kovalar[Bucket][Key]
        except KeyError:
            raise NoSuchKey(Key) from None
        return {"Body": govde, "ContentLength": len(govde)}

    def list_objects_v2(self, Bucket, Prefix=""):
        anahtarlar = sorted(k for k in self.kovalar[Bucket] if k.startswith(Prefix))
        yanit = {"KeyCount": len(anahtarlar)}
        if anahtarlar:
            yanit["Contents"] = [{"Key": k, "Size": len(self.kovalar[Bucket][k])} for k in anahtarlar]
        return yanit


s3 = SahteS3()
s3.create_bucket(Bucket="kanat-veri")
s3.put_object(Bucket="kanat-veri", Key="ham/kanat/a.csv", Body="flight_id\\n1\\n")
print(s3.list_objects_v2(Bucket="kanat-veri", Prefix="ham/"))
'''),
  'tests': ded('''
_s = SahteS3()
_s.create_bucket(Bucket="k")
_s.put_object(Bucket="k", Key="ham/b.csv", Body="İzmir")
_s.put_object(Bucket="k", Key="ham/a.csv", Body=b"\\x00\\x01")
_s.put_object(Bucket="k", Key="mart/x.json", Body="{}")
assert _s.get_object(Bucket="k", Key="ham/b.csv")["Body"] == "İzmir".encode("utf-8"), "metin UTF-8 baytlara çevrilmeli"
assert _s.get_object(Bucket="k", Key="ham/b.csv")["ContentLength"] == 6, "İzmir UTF-8'de 6 bayttır (İ iki bayt)"
_l = _s.list_objects_v2(Bucket="k", Prefix="ham/")
assert _l == {"KeyCount": 2, "Contents": [{"Key": "ham/a.csv", "Size": 2}, {"Key": "ham/b.csv", "Size": 6}]}, f"listeleme yanlış: {_l}"
assert _s.list_objects_v2(Bucket="k", Prefix="temiz/") == {"KeyCount": 0}, "eşleşme yoksa Contents anahtarı olmamalı"
try:
    _s.get_object(Bucket="k", Key="yok.csv"); assert False, "olmayan anahtar NoSuchKey fırlatmalı"
except NoSuchKey:
    pass
try:
    _s.put_object(Bucket="olmayan", Key="a", Body="x"); assert False, "olmayan kovaya yazma KeyError"
except KeyError:
    pass
_s.put_object(Bucket="k", Key="ham/a.csv", Body="yeni")
assert _s.get_object(Bucket="k", Key="ham/a.csv")["Body"] == b"yeni", "aynı anahtara yazmak üstüne yazar"
'''),
  'hints': ['self.kovalar = {}; create_bucket: self.kovalar.setdefault(Bucket, {})', 'get_object: try: govde = self.kovalar[Bucket][Key] except KeyError: raise NoSuchKey(Key)', 'Liste boşsa yanıta Contents ekleme: kodda sayfa.get("Contents", []) yazmanın nedeni budur.'],
  'why': 'Gerçek istemcinin arayüzünü birebir taklit eden bir test çiftesi (test double), iş kodunu bulut olmadan test etmeni sağlar. Boş listede Contents anahtarının olmaması gerçek bir S3 davranışıdır; sayfa["Contents"] yazan kod boş önekte KeyError ile çöker.'})

ex.append({'t': 'code', 'stage': 'Rehberli', 'id': 'bulut-temelleri-2', 'diff': 2,
  'q': '<p><code>bolum_yolu(katman, kaynak, tablo, zaman, parca=0)</code> yaz: <code>zaman</code> <code>"YYYY-MM-DD HH:MM:SS"</code> metnidir. Sonuç <code>"{katman}/{kaynak}/{tablo}/yil=YYYY/ay=MM/gun=DD/part-NNN.csv"</code> biçiminde olsun (ay, gün iki; parça üç haneli). Katman <code>ham</code>, <code>temiz</code>, <code>mart</code> dışındaysa <code>ValueError</code>. Sonra <code>bolumle(kayitlar)</code> yaz: <code>kanat_havayollari</code> uçuşlarını <code>sched_dep</code>\'e göre <code>ham/kanat/ucuslar</code> altında bölümlere ayırıp <code>{yol: [kayıtlar]}</code> sözlüğü döndürsün.</p>',
  'guide': ['datetime.fromisoformat ile metni tarihe çevir.', 'f-string biçimlerinde :02d ve :03d kullan.', 'Katmanı bir kümede ara; yoksa ValueError.', 'bolumle: defaultdict(list) ile her kaydı kendi yoluna ekle.'],
  'example': ded('''
from collections import defaultdict

satislar = [("2024-09-01", 10), ("2024-09-02", 5), ("2024-09-01", 7)]
gruplar = defaultdict(list)
for gun, tutar in satislar:
    gruplar[f"gun={gun}"].append(tutar)
print(dict(gruplar))
'''),
  'start': ded('''
from collections import defaultdict
from datetime import datetime
import veri


def bolum_yolu(katman, kaynak, tablo, zaman, parca=0):
    # TODO: katman kontrolü
    # TODO: tarihi ayrıştır ve yolu üret
    return ""


def bolumle(kayitlar):
    # TODO
    return {}


ucuslar = veri.kayitlar("kanat_havayollari", "hv_flights")
b = bolumle(ucuslar)
print(len(b), next(iter(b), None))
'''),
  'sol': ded('''
from collections import defaultdict
from datetime import datetime
import veri

KATMANLAR = {"ham", "temiz", "mart"}


def bolum_yolu(katman, kaynak, tablo, zaman, parca=0):
    if katman not in KATMANLAR:
        raise ValueError(f"bilinmeyen katman: {katman}")
    z = datetime.fromisoformat(zaman)
    return f"{katman}/{kaynak}/{tablo}/yil={z.year}/ay={z.month:02d}/gun={z.day:02d}/part-{parca:03d}.csv"


def bolumle(kayitlar):
    gruplar = defaultdict(list)
    for k in kayitlar:
        gruplar[bolum_yolu("ham", "kanat", "ucuslar", k["sched_dep"])].append(k)
    return dict(gruplar)


ucuslar = veri.kayitlar("kanat_havayollari", "hv_flights")
b = bolumle(ucuslar)
print(len(b), next(iter(b), None))
'''),
  'tests': ded('''
assert bolum_yolu("temiz", "kanat", "ucuslar", "2024-09-01 06:00:00") == "temiz/kanat/ucuslar/yil=2024/ay=09/gun=01/part-000.csv", "iki haneli ay/gün, üç haneli parça"
assert bolum_yolu("ham", "kanat", "gecikmeler", "2024-12-31 21:45:00", 7).endswith("ay=12/gun=31/part-007.csv"), "parça numarası"
try:
    bolum_yolu("arsiv", "kanat", "ucuslar", "2024-09-01 06:00:00"); assert False, "bilinmeyen katman ValueError"
except ValueError:
    pass
_b = bolumle(veri.kayitlar("kanat_havayollari", "hv_flights"))
assert len(_b) == 122, f"Eylül-Aralık 2024: 122 günlük bölüm olmalı, gelen {len(_b)}"
assert sum(len(v) for v in _b.values()) == 3173, "her uçuş tam bir bölüme düşmeli"
assert len(_b["ham/kanat/ucuslar/yil=2024/ay=09/gun=01/part-000.csv"]) == sum(1 for r in veri.kayitlar("kanat_havayollari", "hv_flights") if r["sched_dep"].startswith("2024-09-01")), "1 Eylül bölümü"
assert sorted(_b) == sorted(_b, key=lambda y: y.split("/")[3:6]), "iki haneli biçim sayesinde metin sırası takvim sırasıyla aynı olmalı"
'''),
  'hints': ['z = datetime.fromisoformat(zaman)', 'f"...ay={z.month:02d}/gun={z.day:02d}/part-{parca:03d}.csv"', 'gruplar[bolum_yolu("ham", "kanat", "ucuslar", k["sched_dep"])].append(k)'],
  'why': 'Tarihe göre Hive bölümleme, sorgu motorlarının yalnız gerekli günleri okumasını sağlar. Yol üretimini tek bir fonksiyonda toplamak; yazan, okuyan ve silen tüm işlerin aynı düzeni kullanmasını garanti eder.'})

ex.append({'t': 'code', 'stage': 'Rehberli', 'id': 'bulut-temelleri-3', 'diff': 2,
  'q': '<p>IAM politika denetleyicisi. <code>politika_denetle(metin)</code> yaz: JSON metnini okuyup sorun listesini döndürsün (boş liste = geçerli). Kurallar:</p><ul><li>JSON geçersizse yalnız <code>["JSON geçersiz"]</code>.</li><li><code>Version</code> <code>"2012-10-17"</code> değilse: <code>"Version 2012-10-17 olmalı"</code>.</li><li><code>Statement</code> boş olmayan bir liste değilse: <code>"Statement boş olmayan liste olmalı"</code> (ve diğer deyim kontrollerini atla).</li><li>Her deyim (1\'den numaralı <code>i</code>) için: <code>Effect</code> Allow/Deny değilse <code>"i: Effect Allow ya da Deny olmalı"</code>; <code>Action</code> ya da <code>Resource</code> yoksa <code>"i: Action eksik"</code> / <code>"i: Resource eksik"</code>.</li><li>En az yetki: <code>Allow</code> deyiminde eylemlerden biri <code>"*"</code> ya da <code>"servis:*"</code> biçimindeyse <code>"i: eylemde tam joker"</code>; kaynaklardan biri tam olarak <code>"*"</code> ise <code>"i: kaynakta tam joker"</code>.</li></ul><p><code>Action</code> ve <code>Resource</code> metin ya da liste olabilir.</p>',
  'guide': ['json.loads\'u try/except json.JSONDecodeError içinde çağır.', 'Metin ya da liste gelebilen alanlar için yardımcı: liste_yap(x) -> [x] if str else x.', 'Deyimleri enumerate(..., 1) ile numaralandır.', 'Joker kontrolü: e == "*" or e.endswith(":*")'],
  'example': ded('''
import json

metin = '{"Version": "2012-10-17", "Statement": [{"Effect": "Allow", "Action": "s3:GetObject"}]}'
p = json.loads(metin)
for i, d in enumerate(p["Statement"], 1):
    eylemler = [d["Action"]] if isinstance(d["Action"], str) else d["Action"]
    print(i, d["Effect"], eylemler, "Resource" in d)
'''),
  'start': ded('''
import json


def politika_denetle(metin):
    sorunlar = []
    # TODO: JSON'u oku
    # TODO: Version ve Statement kontrolü
    # TODO: her deyim için Effect, Action, Resource ve joker kontrolü
    return sorunlar


print(politika_denetle('{"Version": "2012-10-17", "Statement": [{"Effect": "Allow", "Action": "s3:*", "Resource": "*"}]}'))
'''),
  'sol': ded('''
import json


def _liste(x):
    return [x] if isinstance(x, str) else list(x)


def politika_denetle(metin):
    try:
        p = json.loads(metin)
    except json.JSONDecodeError:
        return ["JSON geçersiz"]
    sorunlar = []
    if p.get("Version") != "2012-10-17":
        sorunlar.append("Version 2012-10-17 olmalı")
    deyimler = p.get("Statement")
    if not isinstance(deyimler, list) or not deyimler:
        sorunlar.append("Statement boş olmayan liste olmalı")
        return sorunlar
    for i, d in enumerate(deyimler, 1):
        if d.get("Effect") not in ("Allow", "Deny"):
            sorunlar.append(f"{i}: Effect Allow ya da Deny olmalı")
        if "Action" not in d:
            sorunlar.append(f"{i}: Action eksik")
        if "Resource" not in d:
            sorunlar.append(f"{i}: Resource eksik")
        if d.get("Effect") == "Allow":
            if any(e == "*" or e.endswith(":*") for e in _liste(d.get("Action", []))):
                sorunlar.append(f"{i}: eylemde tam joker")
            if any(r == "*" for r in _liste(d.get("Resource", []))):
                sorunlar.append(f"{i}: kaynakta tam joker")
    return sorunlar


print(politika_denetle('{"Version": "2012-10-17", "Statement": [{"Effect": "Allow", "Action": "s3:*", "Resource": "*"}]}'))
'''),
  'tests': ded('''
import json as _j
_iyi = _j.dumps({"Version": "2012-10-17", "Statement": [
    {"Effect": "Allow", "Action": ["s3:GetObject"], "Resource": "arn:aws:s3:::kanat-veri/ham/*"},
    {"Effect": "Deny", "Action": "s3:*", "Resource": "*"}]})
assert politika_denetle(_iyi) == [], "geçerli politika; Deny deyimindeki joker sorun değildir"
assert politika_denetle("{bozuk") == ["JSON geçersiz"], "bozuk JSON"
_k = _j.dumps({"Version": "2008-10-17", "Statement": [
    {"Effect": "Allow", "Action": "s3:*", "Resource": "*"},
    {"Effect": "allow", "Resource": "arn:aws:s3:::x/*"}]})
assert politika_denetle(_k) == ["Version 2012-10-17 olmalı", "1: eylemde tam joker", "1: kaynakta tam joker", "2: Effect Allow ya da Deny olmalı", "2: Action eksik"], f"sorun listesi yanlış: {politika_denetle(_k)}"
assert politika_denetle(_j.dumps({"Version": "2012-10-17", "Statement": []})) == ["Statement boş olmayan liste olmalı"], "boş Statement"
assert politika_denetle(_j.dumps({"Version": "2012-10-17", "Statement": [{"Effect": "Allow", "Action": ["s3:GetObject", "*"], "Resource": ["arn:aws:s3:::a/*"]}]})) == ["1: eylemde tam joker"], "liste içindeki * yakalanmalı"
'''),
  'hints': ['Hata sırası önemli: önce Version, sonra her deyim için Effect, Action, Resource, sonra joker kontrolleri.', 'def _liste(x): return [x] if isinstance(x, str) else list(x)', 'Joker kontrolünü yalnız Effect == "Allow" olan deyimlerde yap.'],
  'why': 'Politika hataları en sık bulut güvenlik açığıdır. Bu tür denetimleri CI\'da (ör. Terraform planından önce) otomatik çalıştırmak, s3:* ve Resource: * gibi aşırı geniş yetkilerin üretime gitmesini engeller. AWS IAM Access Analyzer ve checkov gibi araçlar aynı fikri genişletir.'})

ex.append({'t': 'code', 'stage': 'Rehberli', 'id': 'bulut-temelleri-4', 'diff': 2,
  'q': '<p>İmzalı URL. <code>imzali_url(kova, anahtar, gizli, simdi, sure=900)</code> yaz: bitiş zamanı <code>simdi + sure</code> (epoch saniye) olsun; imza <code>HMAC-SHA256(gizli, f"{kova}/{anahtar}|{bitis}")</code>\'in hex özeti. Dönüş: <code>f"https://{kova}.s3.example.com/{anahtar}?expires={bitis}&amp;sig={imza}"</code>. Sonra <code>dogrula(url, gizli, simdi)</code> yaz: URL\'yi <code>urllib.parse</code> ile ayrıştır, imzayı yeniden hesapla, <code>hmac.compare_digest</code> ile karşılaştır; imza tutmuyorsa <code>"imza geçersiz"</code>, süre geçmişse (<code>simdi &gt; bitis</code>) <code>"süresi doldu"</code>, ikisi de tamamsa <code>"tamam"</code> döndür.</p>',
  'guide': ['gizli metni encode et; hmac.new(gizli, mesaj, hashlib.sha256).hexdigest()', 'urlsplit ile host (kova = host\'un ilk parçası), path (anahtar = baştaki / hariç) ve query\'yi al.', 'parse_qs ile expires ve sig değerlerini oku.', 'Önce imzayı, sonra süreyi kontrol et.'],
  'example': ded('''
from urllib.parse import urlsplit, parse_qs

u = urlsplit("https://kanat-veri.s3.example.com/rapor/a.pdf?expires=100&sig=abc")
print(u.hostname.split(".")[0], u.path[1:], parse_qs(u.query))
'''),
  'start': ded('''
import hashlib
import hmac
from urllib.parse import urlsplit, parse_qs


def imzali_url(kova, anahtar, gizli, simdi, sure=900):
    bitis = simdi + sure
    imza = ""  # TODO: HMAC-SHA256
    return f"https://{kova}.s3.example.com/{anahtar}?expires={bitis}&sig={imza}"


def dogrula(url, gizli, simdi):
    # TODO: ayrıştır, imzayı yeniden hesapla, karşılaştır, süreyi kontrol et
    return "tamam"


u = imzali_url("kanat-veri", "fatura/F-1001.pdf", "gizli", 1_700_000_000)
print(u)
print(dogrula(u, "gizli", 1_700_000_100))
'''),
  'sol': ded('''
import hashlib
import hmac
from urllib.parse import urlsplit, parse_qs


def _imza(gizli, kova, anahtar, bitis):
    return hmac.new(gizli.encode(), f"{kova}/{anahtar}|{bitis}".encode(), hashlib.sha256).hexdigest()


def imzali_url(kova, anahtar, gizli, simdi, sure=900):
    bitis = simdi + sure
    imza = _imza(gizli, kova, anahtar, bitis)
    return f"https://{kova}.s3.example.com/{anahtar}?expires={bitis}&sig={imza}"


def dogrula(url, gizli, simdi):
    u = urlsplit(url)
    kova = u.hostname.split(".")[0]
    anahtar = u.path[1:]
    q = parse_qs(u.query)
    bitis = int(q["expires"][0])
    if not hmac.compare_digest(q["sig"][0], _imza(gizli, kova, anahtar, bitis)):
        return "imza geçersiz"
    if simdi > bitis:
        return "süresi doldu"
    return "tamam"


u = imzali_url("kanat-veri", "fatura/F-1001.pdf", "gizli", 1_700_000_000)
print(u)
print(dogrula(u, "gizli", 1_700_000_100))
'''),
  'tests': ded('''
_u = imzali_url("kanat-veri", "fatura/F-1001.pdf", "gizli", 1_700_000_000)
assert _u.startswith("https://kanat-veri.s3.example.com/fatura/F-1001.pdf?expires=1700000900&sig="), f"URL biçimi yanlış: {_u}"
assert len(_u.split("sig=")[1]) == 64, "SHA-256 hex özeti 64 karakterdir"
assert dogrula(_u, "gizli", 1_700_000_500) == "tamam", "süre içinde geçerli"
assert dogrula(_u, "gizli", 1_700_000_901) == "süresi doldu", "süre dolunca reddedilmeli"
assert dogrula(_u.replace("F-1001", "F-1002"), "gizli", 1_700_000_500) == "imza geçersiz", "başka dosyaya çevrilen URL reddedilmeli"
assert dogrula(_u.replace("expires=1700000900", "expires=1800000900"), "gizli", 1_700_000_500) == "imza geçersiz", "süreyi uzatmak imzayı bozmalı"
assert dogrula(_u, "baska-gizli", 1_700_000_500) == "imza geçersiz", "farklı gizli anahtar"
assert "compare_digest" in __source__, "imzayı sabit zamanlı karşılaştır (hmac.compare_digest)"
'''),
  'hints': ['İmzayı üreten küçük bir yardımcı fonksiyon yaz; hem imzalamada hem doğrulamada kullan.', 'u = urlsplit(url); kova = u.hostname.split(".")[0]; anahtar = u.path[1:]', 'q = parse_qs(u.query); bitis = int(q["expires"][0])'],
  'why': 'Bitiş zamanı imzanın içinde olduğu için kullanıcı URL\'deki süreyi değiştiremez; değiştirirse imza tutmaz. compare_digest, karşılaştırma süresinden bilgi sızdıran zamanlama saldırılarını önler. Gerçek S3 imzası (SigV4) daha fazla alan içerir ama ilke aynıdır.'})

# Kendin yaz
ex.append({'t': 'code', 'stage': 'Kendin yaz', 'id': 'bulut-temelleri-5', 'diff': 2,
  'q': '<p>Sayfalama. Aşağıdaki <code>SahteS3.list_objects_v2</code> gerçek S3 gibi en fazla <code>MaxKeys</code> anahtar döndürür; devamı varsa <code>IsTruncated=True</code> ve <code>NextContinuationToken</code> verir. <code>tum_nesneler(s3, kova, onek)</code> adında bir <b>üreteç</b> (generator) yaz: tüm sayfaları dolaşıp her nesne sözlüğünü <code>yield</code> etsin (<code>MaxKeys=1000</code> ile). Sonra <code>onek_ozeti(s3, kova, onek)</code> yaz: <code>(nesne_sayisi, toplam_bayt)</code> döndürsün.</p>',
  'start': SAHTE_S3 + ded('''


def tum_nesneler(s3, kova, onek):
    pass


def onek_ozeti(s3, kova, onek):
    pass
'''),
  'sol': SAHTE_S3 + ded('''


def tum_nesneler(s3, kova, onek):
    belirtec = None
    while True:
        yanit = s3.list_objects_v2(Bucket=kova, Prefix=onek, MaxKeys=1000, ContinuationToken=belirtec)
        yield from yanit.get("Contents", [])
        if not yanit["IsTruncated"]:
            break
        belirtec = yanit["NextContinuationToken"]


def onek_ozeti(s3, kova, onek):
    sayi = toplam = 0
    for n in tum_nesneler(s3, kova, onek):
        sayi += 1
        toplam += n["Size"]
    return sayi, toplam
'''),
  'tests': ded('''
import types as _t
_s = SahteS3(); _s.create_bucket(Bucket="k")
for _i in range(2500):
    _s.put_object(Bucket="k", Key=f"ham/log/{_i:05d}.json", Body="x" * (_i % 7))
_s.put_object(Bucket="k", Key="mart/a.csv", Body="abc")
assert isinstance(tum_nesneler(_s, "k", "ham/"), _t.GeneratorType), "tum_nesneler bir üreteç olmalı (yield)"
assert onek_ozeti(_s, "k", "ham/") == (2500, sum(_i % 7 for _i in range(2500))), "2500 nesnenin hepsi sayılmalı: ilk sayfada yalnız 1000 gelir"
assert onek_ozeti(_s, "k", "temiz/") == (0, 0), "eşleşme yoksa (0, 0); Contents anahtarı olmayabilir"
assert onek_ozeti(_s, "k", "") == (2501, sum(_i % 7 for _i in range(2500)) + 3), "önek boşsa tüm kova"
assert [n["Key"] for n in tum_nesneler(_s, "k", "ham/log/0099")] == ["ham/log/00990.json", "ham/log/00991.json", "ham/log/00992.json", "ham/log/00993.json", "ham/log/00994.json", "ham/log/00995.json", "ham/log/00996.json", "ham/log/00997.json", "ham/log/00998.json", "ham/log/00999.json"], "önekle süzülmüş, sıralı"
'''),
  'hints': ['while döngüsünde ContinuationToken\'ı bir değişkende taşı; ilk çağrıda None.', 'yanit.get("Contents", []) boş sayfada çökmez.', 'IsTruncated False olunca dur; değilse belirtec = yanit["NextContinuationToken"]'],
  'why': 'Sayfalamayı unutan kod test ortamında (az nesne) çalışır, üretimde ilk 1000 nesnede sessizce durur. boto3\'ün get_paginator\'ı bu döngüyü senin yerine yapar; üreteç kullanmak milyonlarca anahtarı belleğe almadan işlemeni sağlar.'})

ex.append({'t': 'code', 'stage': 'Kendin yaz', 'id': 'bulut-temelleri-6', 'diff': 2,
  'q': '<p>IAM değerlendirme. <code>izin_var_mi(politika, eylem, kaynak)</code> yaz: <code>politika</code> bir sözlüktür (<code>Statement</code> listesi; <code>Action</code> ve <code>Resource</code> metin ya da liste, joker <code>*</code> ve <code>?</code> içerebilir). Kural: eylem ve kaynakla eşleşen bir <code>Deny</code> varsa <code>False</code>; yoksa eşleşen bir <code>Allow</code> varsa <code>True</code>; hiçbiri yoksa <code>False</code> (varsayılan ret). Eşleştirmede büyük/küçük harf duyarlı <code>fnmatch.fnmatchcase</code> kullan.</p>',
  'start': ded('''
from fnmatch import fnmatchcase


def izin_var_mi(politika, eylem, kaynak):
    pass


POLITIKA = {"Version": "2012-10-17", "Statement": [
    {"Effect": "Allow", "Action": ["s3:GetObject", "s3:ListBucket"], "Resource": ["arn:aws:s3:::kanat-veri", "arn:aws:s3:::kanat-veri/*"]},
    {"Effect": "Allow", "Action": "s3:PutObject", "Resource": "arn:aws:s3:::kanat-veri/mart/*"},
    {"Effect": "Deny", "Action": "s3:*", "Resource": "arn:aws:s3:::kanat-veri/ham/kisisel/*"},
]}
print(izin_var_mi(POLITIKA, "s3:GetObject", "arn:aws:s3:::kanat-veri/ham/ucuslar/a.csv"))
'''),
  'sol': ded('''
from fnmatch import fnmatchcase


def _liste(x):
    return [x] if isinstance(x, str) else list(x)


def _eslesir(deyim, eylem, kaynak):
    return (any(fnmatchcase(eylem, a) for a in _liste(deyim["Action"]))
            and any(fnmatchcase(kaynak, r) for r in _liste(deyim["Resource"])))


def izin_var_mi(politika, eylem, kaynak):
    eslesen = [d for d in politika["Statement"] if _eslesir(d, eylem, kaynak)]
    if any(d["Effect"] == "Deny" for d in eslesen):
        return False
    return any(d["Effect"] == "Allow" for d in eslesen)


POLITIKA = {"Version": "2012-10-17", "Statement": [
    {"Effect": "Allow", "Action": ["s3:GetObject", "s3:ListBucket"], "Resource": ["arn:aws:s3:::kanat-veri", "arn:aws:s3:::kanat-veri/*"]},
    {"Effect": "Allow", "Action": "s3:PutObject", "Resource": "arn:aws:s3:::kanat-veri/mart/*"},
    {"Effect": "Deny", "Action": "s3:*", "Resource": "arn:aws:s3:::kanat-veri/ham/kisisel/*"},
]}
print(izin_var_mi(POLITIKA, "s3:GetObject", "arn:aws:s3:::kanat-veri/ham/ucuslar/a.csv"))
'''),
  'tests': ded('''
_k = "arn:aws:s3:::kanat-veri/"
assert izin_var_mi(POLITIKA, "s3:GetObject", _k + "ham/ucuslar/a.csv") is True, "ham katmanı okunabilir"
assert izin_var_mi(POLITIKA, "s3:PutObject", _k + "mart/rapor.json") is True, "mart katmanına yazılabilir"
assert izin_var_mi(POLITIKA, "s3:PutObject", _k + "ham/ucuslar/a.csv") is False, "ham katmanına yazma izni yok (varsayılan ret)"
assert izin_var_mi(POLITIKA, "s3:GetObject", _k + "ham/kisisel/yolcu.csv") is False, "açık Deny, Allow'u ezer"
assert izin_var_mi(POLITIKA, "s3:ListBucket", "arn:aws:s3:::kanat-veri") is True, "kova düzeyinde listeleme"
assert izin_var_mi(POLITIKA, "s3:DeleteObject", _k + "mart/rapor.json") is False, "silme izni verilmedi"
assert izin_var_mi(POLITIKA, "s3:getobject", _k + "mart/a") is False, "eşleştirme büyük/küçük harf duyarlı"
assert izin_var_mi({"Statement": [{"Effect": "Allow", "Action": "s3:Get?bject", "Resource": "*"}]}, "s3:GetObject", "x") is True, "? tek karakter jokeridir"
'''),
  'hints': ['Önce eylem ve kaynakla eşleşen deyimleri bul.', 'Eşleşenler arasında Deny varsa False; sonra Allow var mı bak.', 'Metin ya da liste olabilen alanları listeye çeviren küçük bir yardımcı yaz.'],
  'why': 'Bu, AWS\'nin politika değerlendirme mantığının özüdür: varsayılan ret, Allow ile izin, açık Deny her zaman kazanır. Hassas önekleri (ham/kisisel/) geniş Allow\'lara rağmen korumak için açık Deny kullanılır.'})

ex.append({'t': 'code', 'stage': 'Kendin yaz', 'id': 'bulut-temelleri-7', 'diff': 2,
  'q': '<p>Aylık maliyet hesabı. <code>aylik_maliyet(kullanim, fiyat)</code> yaz. <code>kullanim</code>: <code>{"depolama_gb": ..., "put": ..., "get": ..., "cikis_gb": ...}</code>. <code>fiyat</code>: <code>{"depolama_gb_ay": ..., "put_1000": ..., "get_1000": ..., "cikis_gb": ..., "ucretsiz_cikis_gb": ...}</code> (PUT/GET fiyatı 1000 istek başınadır; çıkış trafiğinin ilk <code>ucretsiz_cikis_gb</code> GB\'ı ücretsizdir). Kalem kalem maliyeti ve toplamı <code>{"depolama": ..., "istek": ..., "cikis": ..., "toplam": ...}</code> olarak, her biri 2 basamağa yuvarlanmış döndür. Negatif kullanım <code>ValueError</code>.</p>',
  'start': ded('''
FIYAT = {"depolama_gb_ay": 0.023, "put_1000": 0.005, "get_1000": 0.0004, "cikis_gb": 0.09, "ucretsiz_cikis_gb": 100}


def aylik_maliyet(kullanim, fiyat):
    pass


print(aylik_maliyet({"depolama_gb": 500, "put": 2_000_000, "get": 10_000_000, "cikis_gb": 250}, FIYAT))
'''),
  'sol': ded('''
FIYAT = {"depolama_gb_ay": 0.023, "put_1000": 0.005, "get_1000": 0.0004, "cikis_gb": 0.09, "ucretsiz_cikis_gb": 100}


def aylik_maliyet(kullanim, fiyat):
    if any(v < 0 for v in kullanim.values()):
        raise ValueError("kullanım negatif olamaz")
    depolama = kullanim["depolama_gb"] * fiyat["depolama_gb_ay"]
    istek = kullanim["put"] / 1000 * fiyat["put_1000"] + kullanim["get"] / 1000 * fiyat["get_1000"]
    cikis = max(0, kullanim["cikis_gb"] - fiyat["ucretsiz_cikis_gb"]) * fiyat["cikis_gb"]
    return {"depolama": round(depolama, 2), "istek": round(istek, 2), "cikis": round(cikis, 2),
            "toplam": round(depolama + istek + cikis, 2)}


print(aylik_maliyet({"depolama_gb": 500, "put": 2_000_000, "get": 10_000_000, "cikis_gb": 250}, FIYAT))
'''),
  'tests': ded('''
_r = aylik_maliyet({"depolama_gb": 500, "put": 2_000_000, "get": 10_000_000, "cikis_gb": 250}, FIYAT)
assert _r == {"depolama": 11.5, "istek": 14.0, "cikis": 13.5, "toplam": 39.0}, f"500 GB: 11.5; istek: 10 + 4 = 14; çıkış (250-100)*0.09 = 13.5. Gelen {_r}"
assert aylik_maliyet({"depolama_gb": 10, "put": 0, "get": 0, "cikis_gb": 40}, FIYAT)["cikis"] == 0, "ücretsiz kotanın altındaki çıkış 0"
assert aylik_maliyet({"depolama_gb": 0, "put": 1, "get": 0, "cikis_gb": 0}, FIYAT)["toplam"] == 0.0, "1 PUT ihmal edilir düzeyde"
try:
    aylik_maliyet({"depolama_gb": -1, "put": 0, "get": 0, "cikis_gb": 0}, FIYAT); assert False, "negatif kullanım ValueError"
except ValueError:
    pass
'''),
  'hints': ['İstek maliyeti: adet / 1000 * birim fiyat.', 'Çıkış: max(0, cikis_gb - ucretsiz) * fiyat', 'Toplamı yuvarlanmamış kalemlerden hesapla, sonra yuvarla.'],
  'why': 'Mimari kararlar (dosya boyutu, önbellek, bölge) doğrudan faturaya yansır. Basit bir maliyet modeli; "dosyaları birleştirirsek" ya da "analizi aynı bölgede yaparsak" gibi seçenekleri rakamla karşılaştırmanı sağlar. Gerçek fiyatlar bölgeye göre değişir; her zaman sağlayıcının hesaplayıcısıyla doğrula.'})

ex.append({'t': 'code', 'stage': 'Kendin yaz', 'id': 'bulut-temelleri-8', 'diff': 2,
  'q': '<p>Olay tetikleyicili fonksiyon. <code>handler(event, context, s3)</code> yaz (Lambda imzası + test için enjekte edilen istemci). Her <code>event["Records"]</code> kaydı için <code>s3.bucket.name</code> ve <code>s3.object.key</code>\'i oku; nesne <code>kanat_havayollari</code> gecikme CSV\'si (<code>flight_id,reason,minutes</code>). Neden bazında toplam dakikayı hesapla ve anahtarın başındaki <code>ham/</code>\'ı <code>temiz/</code> yapıp uzantıyı <code>.json</code>\'a çevirerek JSON (<code>sort_keys=True</code>) olarak yaz. <code>{"statusCode": 200, "islenen": kayıt_sayısı}</code> döndür. Anahtar <code>ham/</code> ile başlamıyorsa o kaydı atla (sonsuz döngü koruması).</p>',
  'start': SAHTE_S3 + ded('''
import csv
import io
import json
import veri


def handler(event, context, s3):
    pass


s3 = SahteS3()
s3.create_bucket(Bucket="kanat-veri")
with open(veri.yol("kanat_havayollari", "hv_delays"), encoding="utf-8") as f:
    s3.put_object(Bucket="kanat-veri", Key="ham/kanat/gecikmeler/tum.csv", Body=f.read())
olay = {"Records": [{"s3": {"bucket": {"name": "kanat-veri"}, "object": {"key": "ham/kanat/gecikmeler/tum.csv"}}}]}
print(handler(olay, None, s3))
'''),
  'sol': SAHTE_S3 + ded('''
import csv
import io
import json
import veri


def handler(event, context, s3):
    islenen = 0
    for kayit in event["Records"]:
        kova = kayit["s3"]["bucket"]["name"]
        anahtar = kayit["s3"]["object"]["key"]
        if not anahtar.startswith("ham/"):
            continue
        metin = s3.get_object(Bucket=kova, Key=anahtar)["Body"].decode("utf-8")
        toplam = {}
        for satir in csv.DictReader(io.StringIO(metin)):
            toplam[satir["reason"]] = toplam.get(satir["reason"], 0) + int(satir["minutes"])
        hedef = "temiz/" + anahtar[len("ham/"):].rsplit(".", 1)[0] + ".json"
        s3.put_object(Bucket=kova, Key=hedef, Body=json.dumps(toplam, sort_keys=True))
        islenen += 1
    return {"statusCode": 200, "islenen": islenen}


s3 = SahteS3()
s3.create_bucket(Bucket="kanat-veri")
with open(veri.yol("kanat_havayollari", "hv_delays"), encoding="utf-8") as f:
    s3.put_object(Bucket="kanat-veri", Key="ham/kanat/gecikmeler/tum.csv", Body=f.read())
olay = {"Records": [{"s3": {"bucket": {"name": "kanat-veri"}, "object": {"key": "ham/kanat/gecikmeler/tum.csv"}}}]}
print(handler(olay, None, s3))
'''),
  'tests': ded('''
import json as _j
_s = SahteS3(); _s.create_bucket(Bucket="kv")
with open(veri.yol("kanat_havayollari", "hv_delays"), encoding="utf-8") as _f:
    _s.put_object(Bucket="kv", Key="ham/kanat/gecikmeler/tum.csv", Body=_f.read())
_s.put_object(Bucket="kv", Key="ham/kanat/gecikmeler/kucuk.csv", Body="flight_id,reason,minutes\\n1,hava,10\\n2,hava,5\\n3,teknik,7\\n")
_s.put_object(Bucket="kv", Key="temiz/eski.csv", Body="x")
_e = lambda k: {"s3": {"bucket": {"name": "kv"}, "object": {"key": k}}}
_r = handler({"Records": [_e("ham/kanat/gecikmeler/tum.csv"), _e("ham/kanat/gecikmeler/kucuk.csv"), _e("temiz/eski.csv")]}, None, _s)
assert _r == {"statusCode": 200, "islenen": 2}, f"iki ham nesne işlenmeli, temiz/ atlanmalı: {_r}"
_t = _j.loads(_s.get_object(Bucket="kv", Key="temiz/kanat/gecikmeler/tum.json")["Body"])
assert _t == {"gec_gelen_ucak": 26420, "hava": 21570, "hava_trafik": 7854, "teknik": 7901, "yer_hizmetleri": 8498}, f"neden toplamları yanlış: {_t}"
assert _s.get_object(Bucket="kv", Key="temiz/kanat/gecikmeler/kucuk.json")["Body"] == b'{"hava": 15, "teknik": 7}', "JSON sort_keys=True ile yazılmalı"
'''),
  'hints': ['Gövde bayttır: .decode("utf-8") sonra csv.DictReader(io.StringIO(metin))', 'Hedef anahtar: "temiz/" + anahtar[len("ham/"):] ve uzantıyı rsplit(".", 1) ile değiştir.', 'temiz/\'e yazan fonksiyon temiz/ olaylarını işlerse kendi kendini tetikleyen döngü oluşur; ön eki kontrol et.'],
  'why': 'Olay tetikleyicili veri işleme bulutun temel kalıbıdır. Fonksiyonun kendi çıktısıyla yeniden tetiklenmesi gerçek ve pahalı bir hatadır; giriş ve çıkış öneklerini ayırmak ve girişte önek kontrolü yapmak bunu önler. İstemciyi parametre olarak almak ise fonksiyonu sahte istemciyle test edilebilir kılar.'})

# Hata avı
ex.append({'t': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'id': 'bulut-temelleri-9', 'diff': 2,
  'q': '<p>Hatayı bul ve düzelt. <code>ay_onekleri(baslangic, bitis)</code> iki tarih arasındaki her ay için <code>ham/kanat/ucuslar/yil=YYYY/ay=MM/</code> önekini üretmeli ve sonuç listesi takvim sırasında olmalı. Sorgu motoru Ekim-Aralık bölümlerini bulamıyor ve sıralı listede Ekim, Eylül\'den önce çıkıyor. Ayrıca listede Aralık ayı hiç yok: yıl geçişi bir ay erken yapılıyor.</p>',
  'start': ded('''
def ay_onekleri(baslangic, bitis):
    yil, ay = baslangic
    onekler = []
    while (yil, ay) <= bitis:
        onekler.append(f"ham/kanat/ucuslar/yil={yil}/ay={ay}/")
        ay += 1
        if ay == 12:
            yil, ay = yil + 1, 1
    return sorted(onekler)


print(ay_onekleri((2024, 9), (2025, 1)))
'''),
  'sol': ded('''
def ay_onekleri(baslangic, bitis):
    yil, ay = baslangic
    onekler = []
    while (yil, ay) <= bitis:
        onekler.append(f"ham/kanat/ucuslar/yil={yil}/ay={ay:02d}/")
        ay += 1
        if ay == 13:
            yil, ay = yil + 1, 1
    return sorted(onekler)


print(ay_onekleri((2024, 9), (2025, 1)))
'''),
  'tests': ded('''
_r = ay_onekleri((2024, 9), (2025, 1))
assert _r == ["ham/kanat/ucuslar/yil=2024/ay=09/", "ham/kanat/ucuslar/yil=2024/ay=10/", "ham/kanat/ucuslar/yil=2024/ay=11/", "ham/kanat/ucuslar/yil=2024/ay=12/", "ham/kanat/ucuslar/yil=2025/ay=01/"], f"önekler yanlış: {_r}"
assert len(ay_onekleri((2023, 1), (2024, 12))) == 24, "iki yıl = 24 ay"
assert ay_onekleri((2024, 5), (2024, 5)) == ["ham/kanat/ucuslar/yil=2024/ay=05/"], "tek ay"
'''),
  'hints': ['Ay iki haneli yazılmazsa "ay=10" metin olarak "ay=9"dan küçük olur ve yazan işle okuyan işin yolları uyuşmaz.', 'f"ay={ay:02d}"', 'Yıl, ay 13 olunca artmalı (12 değil).'],
  'why': 'Bölüm yolları metin olarak karşılaştırılır; sıfır doldurma (zero padding) olmadan sıralama ve aralık sorguları bozulur. Yazan ve okuyan işlerin aynı yol fonksiyonunu kullanması bu tür uyumsuzlukları kökten önler.'})

ex.append({'t': 'code', 'stage': 'Hata avı', 'kind': 'bug', 'id': 'bulut-temelleri-10', 'diff': 2,
  'q': '<p>Hatayı bul ve düzelt. Kanat Havayolları\'nın Lambda fonksiyonu, adında boşluk ya da Türkçe karakter olan dosyalarda <code>NoSuchKey</code> hatası veriyor. Sebep: S3 olaylarındaki nesne anahtarı <b>URL kodlu</b> gelir (boşluk <code>+</code>, <code>ş</code> <code>%C5%9F</code> olur). <code>handler(event, s3)</code> anahtarı doğru çözsün ve her nesnenin bayt boyutunu <code>{anahtar: boyut}</code> olarak döndürsün.</p>',
  'start': SAHTE_S3 + ded('''
from urllib.parse import quote_plus


def handler(event, s3):
    boyutlar = {}
    for kayit in event["Records"]:
        kova = kayit["s3"]["bucket"]["name"]
        anahtar = kayit["s3"]["object"]["key"]
        boyutlar[anahtar] = s3.get_object(Bucket=kova, Key=anahtar)["ContentLength"]
    return boyutlar


s3 = SahteS3()
s3.create_bucket(Bucket="kv")
s3.put_object(Bucket="kv", Key="ham/rapor 2024/uçuş özet.csv", Body="a,b\\n1,2\\n")
olay = {"Records": [{"s3": {"bucket": {"name": "kv"}, "object": {"key": quote_plus("ham/rapor 2024/uçuş özet.csv", safe="/")}}}]}
print(handler(olay, s3))
'''),
  'sol': SAHTE_S3 + ded('''
from urllib.parse import quote_plus, unquote_plus


def handler(event, s3):
    boyutlar = {}
    for kayit in event["Records"]:
        kova = kayit["s3"]["bucket"]["name"]
        anahtar = unquote_plus(kayit["s3"]["object"]["key"])
        boyutlar[anahtar] = s3.get_object(Bucket=kova, Key=anahtar)["ContentLength"]
    return boyutlar


s3 = SahteS3()
s3.create_bucket(Bucket="kv")
s3.put_object(Bucket="kv", Key="ham/rapor 2024/uçuş özet.csv", Body="a,b\\n1,2\\n")
olay = {"Records": [{"s3": {"bucket": {"name": "kv"}, "object": {"key": quote_plus("ham/rapor 2024/uçuş özet.csv", safe="/")}}}]}
print(handler(olay, s3))
'''),
  'tests': ded('''
_s = SahteS3(); _s.create_bucket(Bucket="kv")
_s.put_object(Bucket="kv", Key="ham/rapor 2024/uçuş özet.csv", Body="a,b\\n1,2\\n")
_s.put_object(Bucket="kv", Key="ham/a+b.csv", Body="xyz")
_s.put_object(Bucket="kv", Key="ham/duz.csv", Body="1")
_e = lambda k: {"s3": {"bucket": {"name": "kv"}, "object": {"key": quote_plus(k, safe="/")}}}
_r = handler({"Records": [_e("ham/rapor 2024/uçuş özet.csv"), _e("ham/a+b.csv"), _e("ham/duz.csv")]}, _s)
assert _r == {"ham/rapor 2024/uçuş özet.csv": 8, "ham/a+b.csv": 3, "ham/duz.csv": 1}, f"anahtarlar çözülmeli (gerçek + işareti %2B olarak gelir): {_r}"
'''),
  'hints': ['Olay anahtarı form kodlamasıyla (application/x-www-form-urlencoded) gelir.', 'urllib.parse.unquote_plus hem %XX dizilerini hem + → boşluk dönüşümünü yapar; unquote yalnız ilkini yapar.'],
  'why': 'Bu, AWS belgelerinde de uyarılan ve üretimde sık yaşanan bir hatadır: test dosyalarında boşluk ve Türkçe karakter olmadığı için fark edilmez. unquote_plus gerekir; gerçek + karakteri olayda %2B olarak geldiği için doğru çözülür.'})

# Meydan okuma
ex.append({'t': 'code', 'stage': 'Meydan okuma', 'id': 'bulut-temelleri-11', 'diff': 3,
  'q': '<p>Küçük dosya birleştirme (compaction). <code>birlestir(s3, kova, onek, hedef_bayt)</code> yaz: öneke uyan tüm CSV nesnelerini (hepsi aynı başlık satırına sahip) anahtar sırasıyla oku, başlığı yalnız bir kez yazarak <b>en fazla</b> <code>hedef_bayt</code> boyutlu (UTF-8 bayt) parçalar halinde birleştir: bir dosyanın satırları bölünmez; mevcut parçaya eklenince sınır aşılacaksa yeni parça başlat (tek dosya sınırdan büyükse kendi başına bir parça olur). Parçaları <code>onek + "birlesik/part-000.csv"</code>, <code>part-001.csv</code>... olarak yaz, ardından <b>yalnız yazma başarılı olduktan sonra</b> kaynak nesneleri sil. <code>(kaynak_sayisi, parca_sayisi)</code> döndür. Önceden birleştirilmiş <code>birlesik/</code> nesnelerini kaynak sayma. Başlıkları farklı bir dosya varsa hiçbir şey yazmadan <code>ValueError</code> fırlat.</p>',
  'start': SAHTE_S3 + ded('''


def birlestir(s3, kova, onek, hedef_bayt):
    pass
'''),
  'sol': SAHTE_S3 + ded('''


def birlestir(s3, kova, onek, hedef_bayt):
    kaynaklar = []
    belirtec = None
    while True:
        y = s3.list_objects_v2(Bucket=kova, Prefix=onek, ContinuationToken=belirtec)
        kaynaklar += [n["Key"] for n in y.get("Contents", []) if not n["Key"].startswith(onek + "birlesik/")]
        if not y["IsTruncated"]:
            break
        belirtec = y["NextContinuationToken"]
    if not kaynaklar:
        return 0, 0
    baslik = None
    govdeler = []
    for k in kaynaklar:
        satirlar = s3.get_object(Bucket=kova, Key=k)["Body"].decode("utf-8").splitlines(keepends=True)
        if baslik is None:
            baslik = satirlar[0]
        elif satirlar[0] != baslik:
            raise ValueError(f"başlık uyuşmuyor: {k}")
        govdeler.append("".join(satirlar[1:]))
    parcalar, mevcut = [], ""
    bb = len(baslik.encode("utf-8"))
    for g in govdeler:
        if mevcut and bb + len((mevcut + g).encode("utf-8")) > hedef_bayt:
            parcalar.append(mevcut)
            mevcut = ""
        mevcut += g
    parcalar.append(mevcut)
    for i, p in enumerate(parcalar):
        s3.put_object(Bucket=kova, Key=f"{onek}birlesik/part-{i:03d}.csv", Body=baslik + p)
    for k in kaynaklar:
        s3.delete_object(Bucket=kova, Key=k)
    return len(kaynaklar), len(parcalar)
'''),
  'tests': ded('''
_s = SahteS3(); _s.create_bucket(Bucket="k")
_on = "ham/kanat/olay/gun=01/"
for _i in range(10):
    _s.put_object(Bucket="k", Key=f"{_on}{_i:03d}.csv", Body="id,dk\\n" + f"{_i},{_i * 3}\\n" * 4)
_s.put_object(Bucket="k", Key="ham/kanat/olay/gun=02/000.csv", Body="id,dk\\n9,9\\n")
_tek = len(("id,dk\\n" + "0,0\\n" * 4).encode())
assert birlestir(_s, "k", _on, 60) == (10, 5), "10 küçük dosya, 60 baytlık parçalara (başlık dahil): 5 parça"
_kalan = [n["Key"] for n in _s.list_objects_v2(Bucket="k", Prefix=_on)["Contents"]]
assert _kalan == [f"{_on}birlesik/part-{_i:03d}.csv" for _i in range(5)], f"yalnız birleşik parçalar kalmalı: {_kalan}"
_tum = "".join(_s.get_object(Bucket="k", Key=_k)["Body"].decode() for _k in _kalan)
assert _tum.count("id,dk") == 5 and _tum.count("\\n") == 45, "her parçada bir başlık; 40 veri satırı korunmalı"
assert all(_s.get_object(Bucket="k", Key=_k)["ContentLength"] <= 60 for _k in _kalan), "parçalar sınırı aşmamalı"
assert _s.get_object(Bucket="k", Key="ham/kanat/olay/gun=02/000.csv")["Body"] == b"id,dk\\n9,9\\n", "başka önekteki dosyaya dokunulmamalı"
assert birlestir(_s, "k", _on, 60) == (0, 0), "birlesik/ nesneleri yeniden kaynak sayılmamalı"
_s.put_object(Bucket="k", Key="ham/x/a.csv", Body="id,dk\\n1,1\\n")
_s.put_object(Bucket="k", Key="ham/x/b.csv", Body="kod,dk\\n1,1\\n")
try:
    birlestir(_s, "k", "ham/x/", 1000); assert False, "farklı başlık ValueError"
except ValueError:
    pass
assert _s.list_objects_v2(Bucket="k", Prefix="ham/x/")["KeyCount"] == 2, "hata durumunda hiçbir şey yazılmamalı ya da silinmemeli"
assert birlestir(_s, "k", "ham/yok/", 100) == (0, 0), "boş önek"
'''),
  'hints': ['Önce tüm kaynakları oku ve başlıkları doğrula; yazma/silme en sona kalsın.', 'Parçalama: mevcut boş değilse ve başlık + mevcut + yeni gövde sınırı aşıyorsa mevcut parçayı kapat.', 'Boyutu len(metin.encode("utf-8")) ile ölç; Türkçe karakterler birden çok bayttır.'],
  'why': 'Compaction, data lake bakımının rutin işidir: akış ya da olay tabanlı yazımlar binlerce küçük dosya üretir. Sıra önemlidir: önce doğrula, sonra yaz, en son sil. Ters sıra (önce sil) bir hata anında veri kaybıdır; birleşik parçaları yeniden kaynak saymamak ise işi idempotent yapar.'})

ex.append({'t': 'code', 'stage': 'Meydan okuma', 'id': 'bulut-temelleri-12', 'diff': 3,
  'q': '<p>Yaşam döngüsü kuralının maliyete etkisi. <code>yasam_dongusu(nesneler, kurallar, fiyat)</code> yaz. <code>nesneler</code>: <code>{"key", "gb", "yas_gun"}</code> sözlükleri. <code>kurallar</code>: <code>{"onek", "gecis_gun", "sinif", "silme_gun"}</code> sözlükleri (<code>gecis_gun</code>/<code>sinif</code> ya da <code>silme_gun</code> <code>None</code> olabilir). Bir nesneye, önekine uyan kurallardan <b>en uzun önekli</b> olan uygulanır. Nesnenin yaşı <code>silme_gun</code>\'e ulaştıysa (&gt;=) silinir; değilse <code>gecis_gun</code>\'e ulaştıysa <code>sinif</code>\'a taşınır; aksi halde <code>"STANDARD"</code> kalır. <code>fiyat</code>: <code>{sinif: gb_ay_fiyati}</code>. Şunu döndür: <code>{"once": hepsi STANDARD iken aylık maliyet, "sonra": kurallar uygulanınca, "silinen": silinen nesne sayısı, "sinif_gb": {sinif: toplam_gb}}</code>; maliyetler 2 basamak.</p>',
  'start': ded('''
def yasam_dongusu(nesneler, kurallar, fiyat):
    pass
'''),
  'sol': ded('''
def yasam_dongusu(nesneler, kurallar, fiyat):
    once = sonra = 0.0
    silinen = 0
    sinif_gb = {}
    for n in nesneler:
        once += n["gb"] * fiyat["STANDARD"]
        uyan = [k for k in kurallar if n["key"].startswith(k["onek"])]
        kural = max(uyan, key=lambda k: len(k["onek"])) if uyan else None
        sinif = "STANDARD"
        if kural:
            if kural.get("silme_gun") is not None and n["yas_gun"] >= kural["silme_gun"]:
                silinen += 1
                continue
            if kural.get("gecis_gun") is not None and n["yas_gun"] >= kural["gecis_gun"]:
                sinif = kural["sinif"]
        sonra += n["gb"] * fiyat[sinif]
        sinif_gb[sinif] = sinif_gb.get(sinif, 0) + n["gb"]
    return {"once": round(once, 2), "sonra": round(sonra, 2), "silinen": silinen, "sinif_gb": sinif_gb}
'''),
  'tests': ded('''
_f = {"STANDARD": 0.023, "IA": 0.0125, "GLACIER": 0.004}
_n = [
    {"key": "ham/kanat/ucuslar/a", "gb": 100, "yas_gun": 10},
    {"key": "ham/kanat/ucuslar/b", "gb": 200, "yas_gun": 45},
    {"key": "ham/kanat/ucuslar/c", "gb": 300, "yas_gun": 400},
    {"key": "ham/log/x", "gb": 50, "yas_gun": 31},
    {"key": "ham/log/y", "gb": 50, "yas_gun": 29},
    {"key": "mart/rapor", "gb": 20, "yas_gun": 900},
]
_k = [
    {"onek": "ham/", "gecis_gun": 30, "sinif": "IA", "silme_gun": None},
    {"onek": "ham/kanat/", "gecis_gun": 90, "sinif": "GLACIER", "silme_gun": None},
    {"onek": "ham/log/", "gecis_gun": None, "sinif": None, "silme_gun": 30},
]
_r = yasam_dongusu(_n, _k, _f)
assert _r["once"] == round(720 * 0.023, 2), "önce: 720 GB STANDARD"
assert _r["silinen"] == 1, "ham/log/x 31 günlük: silinir (en uzun önek ham/log/ kuralı)"
assert _r["sinif_gb"] == {"STANDARD": 370, "GLACIER": 300}, f"ham/kanat/ için 90 gün kuralı geçerli (ham/ kuralı değil): {_r['sinif_gb']}"
assert _r["sonra"] == round(370 * 0.023 + 300 * 0.004, 2), f"sonra maliyeti yanlış: {_r['sonra']}"
assert yasam_dongusu(_n, [], _f)["sonra"] == _r["once"], "kural yoksa maliyet değişmez"
assert yasam_dongusu([{"key": "ham/z", "gb": 10, "yas_gun": 30}], _k, _f)["sinif_gb"] == {"IA": 10}, "sınır günü dahil (>=)"
'''),
  'hints': ['Her nesne için önekine uyan kuralları bul; max(uyan, key=lambda k: len(k["onek"])) en özelini verir.', 'Önce silme koşulunu, sonra geçiş koşulunu kontrol et.', 'Silinen nesne "sonra" maliyetine ve sinif_gb\'ye girmez.'],
  'why': 'Yaşam döngüsü kuralları, depolama maliyetini düşürmenin en kolay yoludur; ama sıralama ve öncelik hataları ya gereksiz maliyet ya da istenmeyen silme üretir. Kuralı uygulamadan önce envanter üzerinde böyle bir simülasyon çalıştırmak, kıdemli ekiplerin standart adımıdır.'})

# Mini proje
ex.append({'t': 'code', 'stage': 'Mini proje', 'id': 'bulut-temelleri-13', 'diff': 3,
  'q': '<p>Kanat Havayolları mini data lake hattı (SahteS3 ile). Üç fonksiyon yaz:</p><ol><li><code>ham_yukle(s3, kova, ucuslar)</code>: <code>kanat_havayollari</code> uçuş kayıtlarını <code>sched_dep</code> gününe göre bölümle ve her günü <code>ham/kanat/ucuslar/yil=YYYY/ay=MM/gun=DD/part-000.csv</code> anahtarına CSV (başlık: <code>flight_id,sched_dep,actual_dep,status</code>; boş değer boş hücre) olarak yaz. Yazılan nesne sayısını döndür.</li><li><code>gunluk_mart(s3, kova, yil, ay)</code>: yalnız o ayın önekini listeleyip (sayfalamayı unutma) her günün dosyasını oku; iptal olmayan uçuşlarda kalkış gecikmesi ≤ 15 dk olanların oranını hesapla; sonucu <code>mart/kanat/zamaninda/yil=YYYY/ay=MM/ozet.json</code>\'a <code>{"YYYY-MM-DD": oran(3 basamak), ...}</code> olarak yaz ve sözlüğü döndür.</li><li><code>en_kotu_gun(s3, kova, yil, ay)</code>: mart dosyasını okuyup oranı en düşük günü <code>(tarih, oran)</code> olarak döndür (eşitlikte erken tarih).</li></ol>',
  'start': SAHTE_S3 + ded('''
import csv
import io
import json
from collections import defaultdict
from datetime import datetime
import veri


def ham_yukle(s3, kova, ucuslar):
    pass


def gunluk_mart(s3, kova, yil, ay):
    pass


def en_kotu_gun(s3, kova, yil, ay):
    pass


s3 = SahteS3()
s3.create_bucket(Bucket="kanat-veri")
print(ham_yukle(s3, "kanat-veri", veri.kayitlar("kanat_havayollari", "hv_flights")))
'''),
  'sol': SAHTE_S3 + ded('''
import csv
import io
import json
from collections import defaultdict
from datetime import datetime
import veri

ALANLAR = ["flight_id", "sched_dep", "actual_dep", "status"]


def ham_yukle(s3, kova, ucuslar):
    gunler = defaultdict(list)
    for u in ucuslar:
        z = datetime.fromisoformat(u["sched_dep"])
        gunler[f"ham/kanat/ucuslar/yil={z.year}/ay={z.month:02d}/gun={z.day:02d}/part-000.csv"].append(u)
    for anahtar, kayitlar in gunler.items():
        tampon = io.StringIO()
        yazici = csv.DictWriter(tampon, fieldnames=ALANLAR, extrasaction="ignore", lineterminator="\\n")
        yazici.writeheader()
        yazici.writerows({k: ("" if r[k] is None else r[k]) for k in ALANLAR} for r in kayitlar)
        s3.put_object(Bucket=kova, Key=anahtar, Body=tampon.getvalue())
    return len(gunler)


def _listele(s3, kova, onek):
    belirtec = None
    while True:
        y = s3.list_objects_v2(Bucket=kova, Prefix=onek, ContinuationToken=belirtec)
        yield from (n["Key"] for n in y.get("Contents", []))
        if not y["IsTruncated"]:
            return
        belirtec = y["NextContinuationToken"]


def gunluk_mart(s3, kova, yil, ay):
    onek = f"ham/kanat/ucuslar/yil={yil}/ay={ay:02d}/"
    ozet = {}
    for anahtar in _listele(s3, kova, onek):
        metin = s3.get_object(Bucket=kova, Key=anahtar)["Body"].decode("utf-8")
        zamaninda = toplam = 0
        gun = None
        for r in csv.DictReader(io.StringIO(metin)):
            gun = r["sched_dep"][:10]
            if r["status"] == "cancelled":
                continue
            gecikme = (datetime.fromisoformat(r["actual_dep"]) - datetime.fromisoformat(r["sched_dep"])).total_seconds() / 60
            toplam += 1
            zamaninda += gecikme <= 15
        if toplam:
            ozet[gun] = round(zamaninda / toplam, 3)
    s3.put_object(Bucket=kova, Key=f"mart/kanat/zamaninda/yil={yil}/ay={ay:02d}/ozet.json",
                  Body=json.dumps(ozet, sort_keys=True))
    return ozet


def en_kotu_gun(s3, kova, yil, ay):
    ozet = json.loads(s3.get_object(Bucket=kova, Key=f"mart/kanat/zamaninda/yil={yil}/ay={ay:02d}/ozet.json")["Body"])
    return min(ozet.items(), key=lambda kv: (kv[1], kv[0]))


s3 = SahteS3()
s3.create_bucket(Bucket="kanat-veri")
print(ham_yukle(s3, "kanat-veri", veri.kayitlar("kanat_havayollari", "hv_flights")))
'''),
  'tests': ded('''
_s = SahteS3(); _s.create_bucket(Bucket="kv")
_u = veri.kayitlar("kanat_havayollari", "hv_flights")
assert ham_yukle(_s, "kv", _u) == 122, "122 günlük bölüm yazılmalı"
_g = _s.get_object(Bucket="kv", Key="ham/kanat/ucuslar/yil=2024/ay=10/gun=01/part-000.csv")["Body"].decode()
assert _g.splitlines()[0] == "flight_id,sched_dep,actual_dep,status", "CSV başlığı yanlış"
assert len(_g.splitlines()) - 1 == sum(1 for r in _u if r["sched_dep"].startswith("2024-10-01")), "1 Ekim dosyasında o günün tüm uçuşları olmalı"
_m = gunluk_mart(_s, "kv", 2024, 10)
assert len(_m) == 31 and min(_m) == "2024-10-01" and max(_m) == "2024-10-31", "Ekim\'in 31 günü"
assert _m["2024-10-12"] == 0.84 and _m["2024-10-13"] == 0.5, f"günlük oranlar yanlış: 12 Ekim {_m['2024-10-12']}, 13 Ekim {_m['2024-10-13']}"
assert en_kotu_gun(_s, "kv", 2024, 10) == ("2024-10-13", 0.5), "en kötü gün 13 Ekim (0.5)"
assert _s.list_objects_v2(Bucket="kv", Prefix="mart/")["KeyCount"] == 1, "mart katmanına tek özet yazılmalı"
assert len(gunluk_mart(_s, "kv", 2024, 9)) == 30, "Eylül: 30 gün"
'''),
  'hints': ['ham_yukle: bulut-temelleri-2\'deki gibi günlere grupla; csv.DictWriter ile io.StringIO\'ya yaz, None değerleri "" yap.', 'gunluk_mart: önek f"ham/kanat/ucuslar/yil={yil}/ay={ay:02d}/"; her dosyada iptal olmayanların gecikmesini datetime farkıyla hesapla.', 'en_kotu_gun: min(ozet.items(), key=lambda kv: (kv[1], kv[0]))'],
  'why': 'Bu küçük hat gerçek bir data lake işinin iskeletidir: ham katmana bölümlü yazım, yalnız ilgili bölümü okuyan (partition pruning) dönüşüm ve mart katmanına özet. Aynı kod boto3 istemcisiyle gerçek S3\'te, bir Lambda ya da zamanlanmış konteyner içinde çalışır.'})

lesson = {
  'id': 'bulut-temelleri', 'lv': 'ileri', 'mod': 'Üretime Hazırlık', 'min': 60,
  'title': 'Bulut temelleri: nesne depolama, IAM, serverless ve maliyet',
  'sum': 'IaaS/PaaS/SaaS, bölge ve AZ kavramlarını, S3 nesne depolamayı ve boto3\'ü, data lake katmanlarını ve tarih bölümlemeyi, IAM politikaları ve en az yetkiyi, imzalı URL\'yi, serverless fonksiyonları, yönetilen veritabanlarını, maliyet tuzaklarını ve sahte bulutla test yazmayı öğrenirsin.',
  'goals': [
    'IaaS, PaaS ve SaaS ile bölge/AZ kavramlarını açıklayıp AWS, GCP ve Azure hizmetlerini eşleyebilirim.',
    'boto3 arayüzlü nesne depolama kodu yazabilir, sayfalama ile listeleme yapıp data lake yollarını tarihe göre bölümleyebilirim.',
    'IAM politikası yazıp en az yetki ilkesine göre denetleyebilir, imzalı URL mantığını uygulayabilirim.',
    'Olay tetikleyicili bir serverless fonksiyonu sahte istemciyle test edilebilir biçimde yazabilirim.',
    'Depolama, istek ve çıkış trafiği kalemleriyle maliyet hesaplayıp küçük dosya ve yaşam döngüsü kararlarını rakamla değerlendirebilirim.'
  ],
  'body': body,
  'ex': ex,
  'faq': [
    {'q': 'AWS mi, GCP mi, Azure mı öğrenmeliyim?', 'a': 'Kavramlar (nesne depolama, IAM, serverless, yönetilen veritabanı) üçünde de aynıdır; eşleme tablosu bunu gösterir. Hedeflediğin şirketlerin ilanlarına bak; Türkiye\'de kurumsal tarafta Azure, girişimlerde AWS ve GCP yaygındır. Birini iyi öğrenince diğerine geçiş haftalar sürer.'},
    {'q': 'Kişisel hesapta yanlışlıkla büyük fatura çıkmasından nasıl korunurum?', 'a': 'Hesabı açar açmaz bütçe ve fatura alarmı kur, kök (root) hesaba MFA ekle ve onu günlük işte kullanma, deneme kaynaklarını etiketle ve iş bitince sil. Erişim anahtarını asla herkese açık depoya itme; otomatik tarayıcılar dakikalar içinde bulur.'},
    {'q': 'boto3 yerine pandas ile doğrudan S3 okunabilir mi?', 'a': 'Evet. s3fs kuruluysa pd.read_parquet("s3://kova/yol/") çalışır; DuckDB ve polars da s3:// yollarını okur. Altta yine boto3/aws kimlik zinciri kullanılır. Büyük veride yalnız gereken bölümleri okumak için yol önekini daraltmayı unutma.'},
    {'q': 'Serverless her zaman daha ucuz mu?', 'a': 'Hayır. Ara sıra çalışan, ani yüklenen işler için ucuzdur; sürekli yüksek trafikte milisaniye ücreti sabit bir konteyner ya da makineden pahalıya gelebilir. Süre sınırı, soğuk başlangıç ve yerel test zorluğu da karar ölçütleridir.'}
  ],
  'mistakes': [
    {'bad': 's3 = boto3.client("s3", aws_access_key_id="AKIA...", aws_secret_access_key="...")', 'good': 's3 = boto3.client("s3")  # kimlik rolden ya da ortamdan gelir', 'why': 'Koda yazılan anahtar git geçmişine, loglara ve ekran görüntülerine sızar. Rol ve ortam tabanlı kimlik zinciri kullan; sızan anahtarı hemen iptal et.'},
    {'bad': 'yanit = s3.list_objects_v2(Bucket=kova, Prefix=onek)\nfor n in yanit["Contents"]: ...', 'good': 'for sayfa in s3.get_paginator("list_objects_v2").paginate(Bucket=kova, Prefix=onek):\n    for n in sayfa.get("Contents", []): ...', 'why': 'Tek çağrı en fazla 1000 nesne döndürür ve boş önekte Contents anahtarı yoktur. Sayfalayıcı ve .get kullan.'},
    {'bad': 'f"ham/ucuslar/yil={y}/ay={m}/gun={d}/"', 'good': 'f"ham/ucuslar/yil={y}/ay={m:02d}/gun={d:02d}/"', 'why': 'Sıfır doldurma olmadan metin sıralaması bozulur (ay=10 < ay=9) ve yazan/okuyan işlerin yolları uyuşmaz.'},
    {'bad': '{"Effect": "Allow", "Action": "s3:*", "Resource": "*"}', 'good': '{"Effect": "Allow", "Action": ["s3:GetObject"], "Resource": "arn:aws:s3:::kanat-veri/ham/*"}', 'why': 'Tam joker, hesaptaki her kovada silme dahil her işlemi verir. Yalnız gereken eylemi ve öneki yaz.'},
    {'bad': 'anahtar = kayit["s3"]["object"]["key"]', 'good': 'anahtar = urllib.parse.unquote_plus(kayit["s3"]["object"]["key"])', 'why': 'S3 olaylarındaki anahtar URL kodludur; boşluk ve Türkçe karakterli dosyalarda NoSuchKey hatası alırsın.'}
  ],
}

write(lesson, '/home/claude/py/v2/n3/bulut-temelleri.js')
