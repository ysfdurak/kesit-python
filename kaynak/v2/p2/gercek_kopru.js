/* Kesit Python: bulut, derin öğrenme, Airflow, Selenium, MongoDB için yerel görevler. uretec/p2/gercek.py üretir, elle düzenleme. */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
{
 "id": "bulut-temelleri",
 "min": 8,
 "html": "<h2>Azure ve BigQuery karşılıkları</h2><p>Türkiye'deki ilanlarda Azure ve BigQuery sık geçer. Kavramlar aynı, adlar farklıdır. İstemciler ağ ve hesap ister; tarayıcıda çalışmaz.</p><div class=\"tbl-wrap\"><table><tr><th>Kavram</th><th>AWS</th><th>Azure</th><th>Google Cloud</th></tr><tr><td>Nesne depolama</td><td>S3</td><td>Blob Storage</td><td>Cloud Storage (GCS)</td></tr><tr><td>Veri ambarı</td><td>Redshift</td><td>Synapse, Fabric</td><td>BigQuery</td></tr><tr><td>Veri taşıma ve zamanlama</td><td>Glue, Step Functions</td><td>Data Factory</td><td>Dataflow, Composer</td></tr><tr><td>Python kütüphanesi</td><td>boto3</td><td>azure-storage-blob</td><td>google-cloud-storage, google-cloud-bigquery</td></tr></table></div>",
 "ex": [
  {
   "t": "local",
   "id": "bulut-temelleri-gy1",
   "stage": "Kendi bilgisayarında",
   "q": "<p>Azure hesabı açmadan Blob Storage kodu dene: Azurite, Microsoft'un yerel öykünücüsüdür. Bu betik bu ortamda çalıştırılmadı.</p>",
   "steps": [
    "<code>npx azurite --silent --location ./azurite</code> ile öykünücüyü başlat.",
    "<code>python -m pip install azure-storage-blob</code> yaz.",
    "Kodu <code>blob.py</code> olarak kaydet. Bağlantı metni Azurite'in belgelerde yayımlanan geliştirme hesabıdır; gerçek anahtarı koda yazma.",
    "Komutu çalıştır: yüklediğin metin geri gelmeli."
   ],
   "file": "from azure.storage.blob import BlobServiceClient\n\nservis = BlobServiceClient.from_connection_string(\"UseDevelopmentStorage=true\")\nkap = servis.get_container_client(\"rapor\")\nif not kap.exists():\n    kap.create_container()\nkap.upload_blob(\"merhaba.txt\", b\"Merhaba Azure\", overwrite=True)\nprint(kap.download_blob(\"merhaba.txt\").readall().decode())\n",
   "fname": "blob.py",
   "cmd": "python blob.py",
   "expect": "Merhaba Azure"
  },
  {
   "t": "local",
   "id": "bulut-temelleri-gy2",
   "stage": "Kendi bilgisayarında",
   "q": "<p>BigQuery'de herkese açık bir veri kümesini sorgula. Google hesabı ister; sandbox kartsız açılır, kota uygulanır. Bu betik bu ortamda çalıştırılmadı.</p>",
   "steps": [
    "Google Cloud'da proje aç, <code>gcloud auth application-default login</code> yap.",
    "<code>python -m pip install google-cloud-bigquery pandas db-dtypes</code> yaz.",
    "Kodu kaydet, <code>PROJE</code> ortam değişkenine proje kimliğini yaz.",
    "Çalıştır. BigQuery taranan veriye göre ücretlendirir: önce <code>dry_run</code> ile boyuta bak, <code>SELECT *</code> yazma."
   ],
   "file": "import os\nfrom google.cloud import bigquery\n\nc = bigquery.Client(project=os.environ[\"PROJE\"])\nsql = \"SELECT name, SUM(number) AS n FROM `bigquery-public-data.usa_names.usa_1910_2013` GROUP BY name ORDER BY n DESC LIMIT 5\"\nprova = c.query(sql, job_config=bigquery.QueryJobConfig(dry_run=True))\nprint(\"Taranacak bayt:\", prova.total_bytes_processed)\nprint(c.query(sql).to_dataframe())\n",
   "fname": "bq.py",
   "cmd": "python bq.py"
  }
 ]
},
{
 "id": "derin-ogrenme-giris",
 "min": 6,
 "ex": [
  {
   "t": "local",
   "id": "derin-ogrenme-giris-gy1",
   "stage": "Kendi bilgisayarında",
   "q": "<p>İlk gerçek PyTorch modelini bilgisayarında eğit. PyTorch tarayıcıda çalışmaz. Bu betik bu ortamda çalıştırılmadı; kayıp değeri her makinede biraz farklı çıkar, azalıyor olması yeterli.</p>",
   "steps": [
    "<code>python -m pip install torch</code> yaz (GPU gerekmez).",
    "Kodu <code>egit.py</code> olarak kaydet, çalıştır.",
    "Kayıp azalmalı. Keras tercih edersen <code>python -m pip install keras torch</code>, <code>keras.Sequential</code> ile aynı ağ üç satırda kurulur; ilanlarda ikisi de geçer."
   ],
   "file": "import torch\nfrom torch import nn\n\ntorch.manual_seed(0)\nX = torch.rand(200, 2)\ny = (X.sum(dim=1) > 1).float().unsqueeze(1)\nmodel = nn.Sequential(nn.Linear(2, 8), nn.ReLU(), nn.Linear(8, 1))\nkayip_f = nn.BCEWithLogitsLoss()\nopt = torch.optim.Adam(model.parameters(), lr=0.05)\nfor tur in range(100):\n    opt.zero_grad()\n    kayip = kayip_f(model(X), y)\n    kayip.backward()\n    opt.step()\n    if tur % 25 == 0:\n        print(tur, round(kayip.item(), 3))\nprint(\"son\", round(kayip.item(), 3))\n",
   "fname": "egit.py",
   "cmd": "python egit.py"
  }
 ]
},
{
 "id": "orkestrasyon",
 "min": 8,
 "ex": [
  {
   "t": "local",
   "id": "orkestrasyon-gy1",
   "stage": "Kendi bilgisayarında",
   "q": "<p>Dersteki küçük DAG benzetiminin gerçeğini kur. Airflow tarayıcıda çalışmaz, Windows'ta WSL ya da Docker ister. Bu dosya bu ortamda çalıştırılmadı.</p>",
   "steps": [
    "Sanal ortamda Airflow 3'ü kur: resmî kurulum sayfasındaki sürüm kısıtlı komutu kullan. Kod Airflow 3 içindir; 2.x'te içe aktarma <code>from airflow.decorators import dag, task</code> olur.",
    "<code>airflow standalone</code> ile başlat; arayüz <code>http://localhost:8080</code>.",
    "Kodu <code>~/airflow/dags/satis.py</code> olarak kaydet.",
    "Komutla bir tarih için dene. Sonra arayüzden yeniden deneme ve <code>catchup</code> davranışına bak."
   ],
   "file": "from datetime import datetime, timedelta\n\nfrom airflow.sdk import dag, task\n\n@dag(schedule=\"@daily\", start_date=datetime(2024, 10, 1), catchup=False, default_args={\"retries\": 2, \"retry_delay\": timedelta(minutes=5)})\ndef satis_etl():\n    @task\n    def cikar(ds=None):\n        return {\"tarih\": ds, \"satir\": 3}\n\n    @task\n    def yukle(sonuc):\n        print(\"yuklendi\", sonuc)\n\n    yukle(cikar())\n\nsatis_etl()\n",
   "fname": "satis.py",
   "cmd": "airflow dags test satis_etl 2024-10-01"
  }
 ]
},
{
 "id": "web-scraping",
 "min": 6,
 "ex": [
  {
   "t": "local",
   "id": "web-scraping-gy1",
   "stage": "Kendi bilgisayarında",
   "q": "<p>Gerçek tarayıcıyı Selenium ile sür. Tarayıcı içinde tarayıcı çalışmaz, bu yüzden görev bilgisayarında. Sayfayı önce <code>python -m http.server</code> ile kendin sunarsın; izinsiz siteye gitmezsin. Bu betik bu ortamda çalıştırılmadı.</p>",
   "steps": [
    "<code>python -m pip install selenium</code> yaz. Chrome kuruluysa sürücüyü Selenium kendisi bulur.",
    "Aynı klasörde içinde <code>&lt;h1&gt;Kesit&lt;/h1&gt;</code> olan bir <code>index.html</code> oluştur, <code>python -m http.server 8000</code> başlat.",
    "Kodu kaydet, ikinci terminalde çalıştır.",
    "Ekran değişince kırılır: <code>WebDriverWait</code> kullan, <code>time.sleep</code> kullanma. Playwright de aynı işi görür."
   ],
   "file": "from selenium import webdriver\nfrom selenium.webdriver.common.by import By\nfrom selenium.webdriver.support import expected_conditions as EC\nfrom selenium.webdriver.support.ui import WebDriverWait\n\nsec = webdriver.ChromeOptions()\nsec.add_argument(\"--headless=new\")\nd = webdriver.Chrome(options=sec)\ntry:\n    d.get(\"http://localhost:8000/\")\n    h = WebDriverWait(d, 10).until(EC.presence_of_element_located((By.TAG_NAME, \"h1\")))\n    print(h.text)\nfinally:\n    d.quit()\n",
   "fname": "sur.py",
   "cmd": "python sur.py",
   "expect": "Kesit"
  }
 ]
},
{
 "id": "veri-modelleme",
 "min": 6,
 "html": "<h2>Belge veritabanı: MongoDB</h2><p>İlişkisel tabloda sipariş ve kalemler ayrı durur. MongoDB'de kalemler siparişin içinde tek belgedir: birlikte okunan veri için hızlı, şeması esnek. Karşılığında birleştirme zayıf, tutarlılık daha çok senin işin. Raporlama ve çok tablolu analizde ilişkisel model hâlâ daha rahattır.</p>",
 "ex": [
  {
   "t": "local",
   "id": "veri-modelleme-gy1",
   "stage": "Kendi bilgisayarında",
   "q": "<p>pymongo ile gerçek bir MongoDB'ye yaz ve topla. Sürücü ağ ister, tarayıcıda çalışmaz. Bu betik bu ortamda çalıştırılmadı.</p>",
   "steps": [
    "MongoDB'yi başlat: <code>docker run -d -p 27017:27017 mongo</code> ya da Atlas'ın ücretsiz katmanı.",
    "<code>python -m pip install pymongo</code> yaz.",
    "Kodu kaydet, çalıştır."
   ],
   "file": "from pymongo import MongoClient\n\nc = MongoClient(\"mongodb://localhost:27017\")\ns = c.kesit.siparis\ns.drop()\ns.insert_many([\n    {\"no\": 1, \"sehir\": \"Van\", \"kalemler\": [{\"ad\": \"cay\", \"tutar\": 50}, {\"ad\": \"kek\", \"tutar\": 30}]},\n    {\"no\": 2, \"sehir\": \"Kars\", \"kalemler\": [{\"ad\": \"kahve\", \"tutar\": 120}]},\n])\nprint(s.find_one({\"sehir\": \"Van\"})[\"no\"])\nhat = [{\"$unwind\": \"$kalemler\"}, {\"$group\": {\"_id\": \"$sehir\", \"ciro\": {\"$sum\": \"$kalemler.tutar\"}}}, {\"$sort\": {\"ciro\": -1}}]\nprint(list(s.aggregate(hat)))\n",
   "fname": "mongo.py",
   "cmd": "python mongo.py"
  }
 ]
}
);
})(window);
