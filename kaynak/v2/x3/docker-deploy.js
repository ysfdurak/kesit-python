/* Kesit Python — 'docker-deploy' uzantısı (AUDIT 12, Derinleş + ek alıştırmalar) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'docker-deploy',
    min: 30,
    html: `<p>İmajın hazır ve compose ile yerelde çalışıyor. Şimdi üç gerçek soru var: uygulamanın önüne ne koyarsın (Nginx), en hızlı nasıl yayına alırsın (PaaS) ve ekip büyüdüğünde konteynerleri kim yönetir (Kubernetes)?</p>
<h2>Nginx: ters vekil sunucu (reverse proxy)</h2>
<p>gunicorn ya da uvicorn Python kodunu çalıştırmakta iyidir ama internete doğrudan açılmak için tasarlanmamıştır. Önlerine Nginx konur ve şu işleri üstlenir: HTTPS sertifikasını sonlandırmak (TLS termination), statik dosyaları Python'a hiç uğratmadan sunmak, yavaş istemcileri tamponlayıp (buffering) uygulama işçilerini boşta bekletmemek, gzip sıkıştırma, istek boyutu ve hız sınırı.</p>
<pre class="code"># /etc/nginx/conf.d/market.conf
upstream api {
    server 127.0.0.1:8000;          # gunicorn/uvicorn; compose'da: server api:8000;
}
server {
    listen 443 ssl;
    server_name market.example.com;
    ssl_certificate     /etc/letsencrypt/live/market.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/market.example.com/privkey.pem;
    client_max_body_size 10m;

    location /static/ {
        alias /srv/market/static/;   # Python'a uğramaz
        expires 7d;
    }
    location / {
        proxy_pass http://api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 30s;
    }
}
server { listen 80; server_name market.example.com; return 301 https://$host$request_uri; }</pre>
<p><code>X-Forwarded-*</code> başlıkları önemlidir: uygulama artık isteği Nginx'ten aldığı için gerçek istemci IP'sini ve isteğin HTTPS olup olmadığını bu başlıklardan öğrenir (uvicorn'da <code>--proxy-headers</code>, Flask'ta <code>ProxyFix</code>). Nginx, <code>location</code> bloklarından isteğin yoluyla <b>en uzun eşleşen öneki</b> seçer; <code>/static/logo.png</code> için <code>/static/</code>, <code>/api/siparis</code> için <code>/</code> çalışır. Yapılandırmayı her değişiklikten sonra <code>nginx -t</code> ile denetle, sonra <code>nginx -s reload</code> ile kesintisiz yeniden yükle.</p>
<h2>PaaS'a adım adım dağıtım</h2>
<p>Platform hizmeti (PaaS) sunucu, Nginx ve sertifika işini senin yerine yapar. Render, Railway ve Fly.io'da akış neredeyse aynıdır:</p>
<div class="steps-list"><ol>
<li>Depoda çalışan bir <code>Dockerfile</code> olsun; uygulama portu <b><code>PORT</code> ortam değişkeninden</b> okusun (<code>--bind 0.0.0.0:$PORT</code>). Platform portu kendisi atar.</li>
<li>GitHub deposunu platforma bağla; her <code>main</code> push'unda imaj otomatik inşa edilir.</li>
<li>Yönetilen PostgreSQL ekle; platform <code>DATABASE_URL</code>'i ortam değişkeni olarak verir. Sırları panelden gir, depoya koyma.</li>
<li>Sağlık kontrolü yolunu (<code>/health</code>) tanımla; yeni sürüm sağlıklı olmadan trafik ona geçmez.</li>
<li>Migration'ı yayın öncesi komut olarak ayarla (Render'da pre-deploy command, Fly'da <code>release_command = "alembic upgrade head"</code>).</li>
</ol></div>
<pre class="code"># Fly.io
fly launch            # fly.toml üretir, bölge ve uygulama adı sorar
fly secrets set SECRET_KEY=... DATABASE_URL=...
fly deploy            # imajı inşa eder, sağlık kontrolüyle yayına alır
fly logs              # canlı log</pre>
<h2>Kubernetes'in temel nesneleri</h2>
<p>Kubernetes (k8s), konteynerleri bir makine kümesinde çalıştıran orkestratördür. Ona "ne istediğini" YAML ile söylersin (bildirimsel, declarative), o da gerçek durumu sürekli istenen duruma yaklaştırır: bir pod çökerse yenisini başlatır.</p>
<div class="tbl-wrap"><table><tr><th>Nesne</th><th>Ne yapar?</th><th>Compose karşılığı</th></tr>
<tr><td>Pod</td><td>Bir ya da birkaç konteynerin en küçük çalışma birimi; geçicidir</td><td>Tek konteyner</td></tr>
<tr><td>Deployment</td><td>İstenen kopya sayısını (replicas) korur, sürüm geçişini kademeli yapar</td><td><code>services.api</code> + <code>deploy.replicas</code></td></tr>
<tr><td>Service</td><td>Etiketle seçilen podlara sabit ad ve IP verir, yükü dağıtır</td><td>Servis adıyla erişim</td></tr>
<tr><td>ConfigMap</td><td>Gizli olmayan ayarlar (metin değerler)</td><td><code>environment:</code></td></tr>
<tr><td>Secret</td><td>Parola, anahtar; değerler base64 ile kodlanır (şifreleme değildir)</td><td><code>.env</code> / secrets</td></tr>
<tr><td>Probe</td><td>liveness: takıldıysa yeniden başlat; readiness: hazır değilse trafik verme</td><td><code>healthcheck</code></td></tr></table></div>
<pre class="code">apiVersion: apps/v1
kind: Deployment
metadata: {name: market-api}
spec:
  replicas: 3
  selector: {matchLabels: {app: market-api}}
  template:
    metadata: {labels: {app: market-api}}
    spec:
      containers:
        - name: api
          image: ghcr.io/anadolu/market-api:1.4.2
          ports: [{containerPort: 8000}]
          envFrom: [{configMapRef: {name: market-ayar}}, {secretRef: {name: market-sir}}]
          resources: {requests: {cpu: 100m, memory: 128Mi}, limits: {memory: 256Mi}}
          readinessProbe: {httpGet: {path: /ready, port: 8000}, periodSeconds: 5}
          livenessProbe: {httpGet: {path: /health, port: 8000}, initialDelaySeconds: 10}
---
apiVersion: v1
kind: Service
metadata: {name: market-api}
spec:
  selector: {app: market-api}      # template.labels ile AYNI olmalı
  ports: [{port: 80, targetPort: 8000}]</pre>
<pre class="code">kubectl apply -f k8s/                 # istenen durumu gönder
kubectl get pods -l app=market-api     # durum
kubectl logs deploy/market-api -f      # log
kubectl rollout status deploy/market-api
kubectl rollout undo deploy/market-api # bir önceki sürüme dön</pre>
<div class="note"><b>Kendi bilgisayarında dene</b>Docker Desktop'ta Kubernetes'i açabilir ya da <code>kind</code> veya <code>minikube</code> ile yerel küme kurabilirsin. Tarayıcıda küme yok; ama manifestler sadece YAML'dır ve en sık hatalar (seçici uyuşmazlığı, eksik probe, <code>latest</code> etiketi) Python ile yakalanabilir:</div>
<pre class="py">import yaml
metin = """
apiVersion: apps/v1
kind: Deployment
metadata: {name: market-api}
spec:
  replicas: 2
  selector: {matchLabels: {app: market-api}}
  template:
    metadata: {labels: {app: market-api, katman: web}}
    spec:
      containers: [{name: api, image: "market-api:latest"}]
---
apiVersion: v1
kind: Service
metadata: {name: market-api}
spec: {selector: {app: market-apı}, ports: [{port: 80, targetPort: 8000}]}
"""
belgeler = list(yaml.safe_load_all(metin))
dep = next(b for b in belgeler if b["kind"] == "Deployment")
etiketler = dep["spec"]["template"]["metadata"]["labels"]
for b in belgeler:
    if b["kind"] == "Service":
        secici = b["spec"]["selector"]
        uyar = all(etiketler.get(k) == v for k, v in secici.items())
        print(b["metadata"]["name"], "podları buluyor mu?", uyar)
for c in dep["spec"]["template"]["spec"]["containers"]:
    print(c["name"], "etiket:", c["image"].rpartition(":")[2], "| probe var mı?", "readinessProbe" in c)</pre>
<p>Tek harflik bir fark (<code>market-apı</code>) Service'in hiçbir podu bulamamasına yol açar; kubectl hata vermez, istekler sadece yanıtsız kalır. Bu tür denetimler CI'da <code>kubeconform</code> ve <code>kube-linter</code> gibi araçlarla yapılır.</p>
<div class="note"><b>Gerçek işte</b>Çoğu ekip Kubernetes'e doğrudan değil, Helm şablonları ya da Kustomize ile ortam başına (staging, prod) farklı değerler vererek dağıtım yapar. Yeni başlayan biri için önemli olan YAML'ı okuyabilmek, probe ve kaynak sınırlarını anlamak ve <code>kubectl get/describe/logs</code> ile sorunu bulabilmektir.</div>`,
    ex: [
      {
        t: 'mc',
        id: 'docker-deploy-y1',
        stage: 'Isınma',
        q: 'Bir podun <b>readinessProbe</b>\'u başarısız olmaya başladı, livenessProbe ise geçiyor. Kubernetes ne yapar?',
        o: ['Podu hemen yeniden başlatır', 'Podu Service\'in trafik listesinden çıkarır, yeniden başlatmaz', 'Deployment\'ı bir önceki sürüme geri alır', 'Hiçbir şey; readiness yalnız ilk açılışta denetlenir'],
        a: 1,
        why: 'Readiness "trafik almaya hazır mısın?" sorusudur; başarısızsa pod Service uç noktalarından çıkarılır ama çalışmaya devam eder (ör. veritabanı geçici olarak yok). Yeniden başlatma liveness başarısız olduğunda yapılır. Geri alma otomatik değildir, kubectl rollout undo ile sen yaparsın.'
      },
      {
        t: 'mc',
        id: 'docker-deploy-y2',
        stage: 'Isınma',
        q: 'Uygulama Nginx arkasında çalışıyor ve loglarda her isteğin IP\'si <code>127.0.0.1</code> görünüyor. En olası neden?',
        o: ['Nginx istekleri önbellekten yanıtlıyor', 'Uygulama X-Forwarded-For başlığını dikkate almıyor', 'gunicorn yanlış porta bağlanmış', 'HTTPS sertifikası süresi dolmuş'],
        a: 1,
        why: 'Uygulamanın gördüğü bağlantı Nginx\'ten gelir; gerçek istemci adresi Nginx\'in eklediği X-Forwarded-For / X-Real-IP başlığındadır. uvicorn --proxy-headers ya da Flask ProxyFix ile bu başlıklara güvenmesini söylemen gerekir (yalnız Nginx\'ten geldiğinden eminsen).'
      },
      {
        t: 'predict',
        id: 'docker-deploy-y3',
        stage: 'Kodu oku',
        q: 'Secret değerleri base64 ile saklanır. Bu kod ne yazdırır?',
        o: ['parola123 12', 'cGFyb2xhMTIz 12', 'parola123 9', '***** 12'],
        a: 0,
        code: 'import base64, yaml\ns = yaml.safe_load("""\nkind: Secret\ndata:\n  DB_SIFRE: cGFyb2xhMTIz\n""")\ndeger = base64.b64decode(s["data"]["DB_SIFRE"]).decode()\nprint(deger, len(s["data"]["DB_SIFRE"]))\n',
        why: 'base64 bir kodlamadır, şifreleme değil: herkes tek satırla çözebilir. 9 baytlık "parola123" kodlanınca 12 karakter olur. Bu yüzden Secret\'lara erişim RBAC ile sınırlanır ve küme tarafında şifreleme (encryption at rest) açılır.'
      },
      {
        t: 'predict',
        id: 'docker-deploy-y4',
        stage: 'Kodu oku',
        q: 'Ortam değişkenleri metin olmalıdır. Bu ConfigMap okununca ne yazdırır?',
        o: ['[\'str\', \'str\', \'str\']', '[\'bool\', \'int\', \'str\']', '[\'str\', \'int\', \'str\']', '[\'bool\', \'str\', \'str\']'],
        a: 1,
        code: 'import yaml\ncm = yaml.safe_load("""\ndata:\n  DEBUG: false\n  PORT: 8000\n  BOLGE: "eu"\n""")\nprint([type(v).__name__ for v in cm["data"].values()])\n',
        why: 'YAML false\'u bool, 8000\'i int olarak okur. Kubernetes ConfigMap verisinde yalnız metin kabul eder ve bu manifesti reddeder; değerleri "false" ve "8000" diye tırnaklamalısın.'
      },
      {
        t: 'order',
        id: 'docker-deploy-y5',
        stage: 'Kodu oku',
        q: '<p>Çok belgeli (<code>---</code> ile ayrılmış) bir manifest dosyasındaki nesneleri türüne göre sayan programın satırlarını sırala. Beklenen çıktı:</p><pre class="out">{\'ConfigMap\': 1, \'Deployment\': 1, \'Service\': 2}</pre>',
        lines: [
          'import yaml',
          'metin = "kind: Deployment\\n---\\nkind: Service\\n---\\nkind: Service\\n---\\nkind: ConfigMap\\n"',
          'sayac = {}',
          'for belge in yaml.safe_load_all(metin):',
          '    sayac[belge["kind"]] = sayac.get(belge["kind"], 0) + 1',
          'print(dict(sorted(sayac.items())))'
        ],
        expect: '{\'ConfigMap\': 1, \'Deployment\': 1, \'Service\': 2}\n',
        hint: 'safe_load_all bir üreteç döndürür; döngüden önce sayaç hazır olmalı.',
        why: 'safe_load yalnız ilk belgeyi okur; --- ile ayrılmış dosyada tüm nesneler için safe_load_all gerekir. Sonuç, sözlük sıralanarak deterministik yazdırılır.'
      },
      {
        t: 'code',
        id: 'docker-deploy-y6',
        stage: 'Rehberli',
        diff: 2,
        q: '<p><code>sahipsiz_servisler(yaml_metin)</code> yaz: çok belgeli manifestteki her <code>Service</code>\'in <code>spec.selector</code> etiketlerinin, en az bir <code>Deployment</code>\'ın <code>spec.template.metadata.labels</code> etiketlerinin <b>alt kümesi</b> olup olmadığını denetlesin. Hiçbir Deployment\'la eşleşmeyen Service adlarını sıralı liste olarak döndür.</p>',
        guide: [
          'yaml.safe_load_all ile belgeleri listeye al; boş belgeleri (None) atla.',
          'Deployment\'ların şablon etiketlerini (sözlük) bir listede topla.',
          'Her Service için selector\'ın tüm anahtar-değer çiftleri bir etiket sözlüğünde var mı bak: all(...) ve any(...).',
          'Eşleşmeyenlerin adlarını sorted ile döndür.'
        ],
        example: 'istenen = {"renk": "mavi"}\nurunler = [{"renk": "mavi", "beden": "M"}, {"renk": "kırmızı"}]\nprint([u for u in urunler if all(u.get(k) == v for k, v in istenen.items())])\n',
        start: 'import yaml\n\ndef sahipsiz_servisler(yaml_metin):\n    belgeler = [b for b in yaml.safe_load_all(yaml_metin) if b]\n    etiketler = []\n    # TODO: Deployment şablon etiketlerini topla\n    sahipsiz = []\n    # TODO: her Service\'in selector\'ı bir etiket sözlüğünün alt kümesi mi?\n    return sorted(sahipsiz)\n',
        sol: 'import yaml\n\ndef sahipsiz_servisler(yaml_metin):\n    belgeler = [b for b in yaml.safe_load_all(yaml_metin) if b]\n    etiketler = [b["spec"]["template"]["metadata"]["labels"] for b in belgeler if b["kind"] == "Deployment"]\n    sahipsiz = []\n    for b in belgeler:\n        if b["kind"] != "Service":\n            continue\n        secici = b["spec"]["selector"]\n        if not any(all(e.get(k) == v for k, v in secici.items()) for e in etiketler):\n            sahipsiz.append(b["metadata"]["name"])\n    return sorted(sahipsiz)\n',
        tests: 'M = """\nkind: Deployment\nmetadata: {name: api}\nspec: {template: {metadata: {labels: {app: api, katman: web}}}}\n---\nkind: Deployment\nmetadata: {name: isci}\nspec: {template: {metadata: {labels: {app: isci}}}}\n---\nkind: Service\nmetadata: {name: api-svc}\nspec: {selector: {app: api}}\n---\nkind: Service\nmetadata: {name: yanlis-svc}\nspec: {selector: {app: apı}}\n---\nkind: Service\nmetadata: {name: fazla-svc}\nspec: {selector: {app: isci, katman: web}}\n---\n"""\nassert sahipsiz_servisler(M) == ["fazla-svc", "yanlis-svc"], "yanlis-svc (yazım hatası) ve fazla-svc (isci podunda katman etiketi yok) sahipsiz olmalı"\nassert sahipsiz_servisler("kind: Service\\nmetadata: {name: s}\\nspec: {selector: {app: x}}\\n") == ["s"], "Hiç Deployment yoksa her Service sahipsizdir"\n',
        hints: [
          'Selector bir alt küme denetimidir: seçicideki her çift pod etiketlerinde aynı değerle bulunmalı.',
          'any(all(e.get(k) == v for k, v in secici.items()) for e in etiketler)',
          'Sondaki boş --- belgesi None döner; listeyi kurarken if b ile ele.'
        ],
        why: 'Seçici uyuşmazlığı kubectl apply sırasında hata vermez; Service\'in uç nokta listesi boş kalır ve istekler zaman aşımına düşer. CI\'da bu tür denetimler dağıtımdan önce yakalar.'
      },
      {
        t: 'code',
        id: 'docker-deploy-y7',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p><code>deployment_denetle(yaml_metin)</code> yaz: tek bir Deployment manifestini <code>yaml.safe_load</code> ile okuyup kurallara göre hata mesajlarının listesini döndürsün (sıra: önce replicas, sonra konteynerler manifestteki sırayla, her konteynerde kurallar aşağıdaki sırayla):</p><ul><li><code>replicas</code> 2\'den azsa: <code>"replicas en az 2 olmalı"</code></li><li>imaj etiketi yoksa ya da <code>latest</code> ise: <code>"&lt;ad&gt;: sabit imaj etiketi yok"</code></li><li><code>resources.limits.memory</code> yoksa: <code>"&lt;ad&gt;: bellek sınırı yok"</code></li><li><code>readinessProbe</code> yoksa: <code>"&lt;ad&gt;: readinessProbe yok"</code></li><li><code>livenessProbe</code> yoksa: <code>"&lt;ad&gt;: livenessProbe yok"</code></li></ul><p>Etiket, imajın son <code>/</code>\'dan sonraki kısmındaki <code>:</code>\'den sonra gelen metindir (kayıt defteri portu <code>host:5000/ad</code> etiket sayılmaz).</p>',
        start: 'import yaml\n\ndef deployment_denetle(yaml_metin):\n    pass\n',
        sol: 'import yaml\n\ndef deployment_denetle(yaml_metin):\n    d = yaml.safe_load(yaml_metin)\n    hatalar = []\n    spec = d.get("spec", {})\n    if spec.get("replicas", 1) < 2:\n        hatalar.append("replicas en az 2 olmalı")\n    for c in spec["template"]["spec"]["containers"]:\n        ad = c["name"]\n        son = c["image"].rsplit("/", 1)[-1]\n        etiket = son.split(":", 1)[1] if ":" in son else ""\n        if etiket in ("", "latest"):\n            hatalar.append(f"{ad}: sabit imaj etiketi yok")\n        if not c.get("resources", {}).get("limits", {}).get("memory"):\n            hatalar.append(f"{ad}: bellek sınırı yok")\n        if "readinessProbe" not in c:\n            hatalar.append(f"{ad}: readinessProbe yok")\n        if "livenessProbe" not in c:\n            hatalar.append(f"{ad}: livenessProbe yok")\n    return hatalar\n',
        tests: 'IYI = """\nkind: Deployment\nspec:\n  replicas: 3\n  template:\n    spec:\n      containers:\n        - name: api\n          image: registry.local:5000/market-api:1.4.2\n          resources: {limits: {memory: 256Mi}}\n          readinessProbe: {httpGet: {path: /ready, port: 8000}}\n          livenessProbe: {httpGet: {path: /health, port: 8000}}\n"""\nassert deployment_denetle(IYI) == [], "Kurallara uyan manifest hata vermemeli (5000 bir port, etiket 1.4.2)"\nKOTU = """\nkind: Deployment\nspec:\n  template:\n    spec:\n      containers:\n        - name: api\n          image: registry.local:5000/market-api\n          readinessProbe: {httpGet: {path: /ready, port: 8000}}\n        - name: log\n          image: fluent-bit:latest\n          resources: {limits: {memory: 64Mi}}\n          livenessProbe: {exec: {command: [true]}}\n"""\nbeklenen = ["replicas en az 2 olmalı", "api: sabit imaj etiketi yok", "api: bellek sınırı yok", "api: livenessProbe yok", "log: sabit imaj etiketi yok", "log: readinessProbe yok"]\nassert deployment_denetle(KOTU) == beklenen, f"Beklenen {beklenen}, gelen {deployment_denetle(KOTU)}"\n',
        hints: [
          'replicas yazılmamışsa Kubernetes 1 kabul eder.',
          'Etiketi bulmak için önce rsplit("/", 1)[-1] ile son parçayı al, sonra ":" ara.',
          'İç içe isteğe bağlı alanlarda c.get("resources", {}).get("limits", {}) zinciri KeyError\'u önler.'
        ],
        why: 'Bu, kube-linter benzeri araçların yaptığının özüdür. latest etiketi hangi sürümün çalıştığını belirsizleştirir ve geri almayı imkânsız kılar; bellek sınırı olmayan pod düğümü boğabilir; probe\'suz pod hazır olmadan trafik alır.'
      },
      {
        t: 'code',
        id: 'docker-deploy-y8',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p>Nginx\'in <code>location</code> seçimini taklit et. <code>hedef_bul(konumlar, yol)</code> yaz: <code>konumlar</code> sözlüğü önek → hedef eşlemesidir (ör. <code>{"/": "api", "/static/": "dosya"}</code>). Yolla eşleşen <b>en uzun</b> öneki seçip hedefini döndür; hiçbiri eşleşmezse <code>None</code>. Ayrıca <code>"= /tam"</code> biçimindeki anahtarlar tam eşleşmedir ve varsa her şeyden önce gelir.</p>',
        start: 'def hedef_bul(konumlar, yol):\n    pass\n',
        sol: 'def hedef_bul(konumlar, yol):\n    for anahtar, hedef in konumlar.items():\n        if anahtar.startswith("= ") and anahtar[2:] == yol:\n            return hedef\n    en_iyi = None\n    for anahtar, hedef in konumlar.items():\n        if anahtar.startswith("= "):\n            continue\n        if yol.startswith(anahtar) and (en_iyi is None or len(anahtar) > len(en_iyi[0])):\n            en_iyi = (anahtar, hedef)\n    return en_iyi[1] if en_iyi else None\n',
        tests: 'K = {"/": "api", "/static/": "dosya", "/static/img/": "cdn", "= /health": "nginx", "/api/": "api-v2"}\nassert hedef_bul(K, "/static/css/a.css") == "dosya", "/static/ en uzun eşleşen önek"\nassert hedef_bul(K, "/static/img/logo.png") == "cdn", "/static/img/ daha uzun olduğu için kazanır"\nassert hedef_bul(K, "/health") == "nginx", "Tam eşleşme (=) önceliklidir"\nassert hedef_bul(K, "/healthz") == "api", "= yalnız birebir yolda çalışır; /healthz için / kalır"\nassert hedef_bul(K, "/api/siparis") == "api-v2", "/api/ önekine gitmeli"\nassert hedef_bul({"/static/": "dosya"}, "/sepet") is None, "Hiçbir önek eşleşmezse None"\n',
        hints: ['Önce "= " ile başlayan anahtarlarda birebir eşitlik ara.', 'Diğerlerinde yol.startswith(onek) olanlar arasından en uzun öneki seç.', 'max(eslesenler, key=len) de kullanılabilir; boşsa None döndür.'],
        why: 'Nginx önek konumlarında sıraya değil uzunluğa bakar; = ile tanımlı tam eşleşme ise aramayı hemen bitirir. (Gerçek Nginx\'te ^~ ve ~ regex konumları da vardır.) /static yerine /static/ yazmak gibi küçük farklar beklenmedik yönlendirmelere yol açar.'
      },
      {
        t: 'code',
        id: 'docker-deploy-y9',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        q: '<p>Hatayı bul ve düzelt. <code>configmap_verisi(yaml_metin)</code> bir YAML ayar dosyasını Kubernetes ConfigMap <code>data</code> alanına uygun hâle getirmeli: tüm değerler metin olmalı; bool değerler Kubernetes\'in beklediği gibi küçük harfle <code>"true"</code>/<code>"false"</code>, <code>None</code> değerler boş metin olmalı. Şu anki kod <code>"False"</code> üretiyor ve <code>None</code>\'ı <code>"None"</code> yapıyor.</p>',
        start: 'import yaml\n\ndef configmap_verisi(yaml_metin):\n    ham = yaml.safe_load(yaml_metin)\n    return {k: str(v) for k, v in ham.items()}\n',
        sol: 'import yaml\n\ndef configmap_verisi(yaml_metin):\n    ham = yaml.safe_load(yaml_metin)\n    sonuc = {}\n    for k, v in ham.items():\n        if isinstance(v, bool):\n            sonuc[k] = "true" if v else "false"\n        elif v is None:\n            sonuc[k] = ""\n        else:\n            sonuc[k] = str(v)\n    return sonuc\n',
        tests: 'v = configmap_verisi("DEBUG: false\\nPORT: 8000\\nORAN: 0.25\\nBOLGE: eu\\nSENTRY_DSN:\\nCACHE: yes\\n")\nassert v["DEBUG"] == "false", "bool küçük harfle \'false\' olmalı, Python\'ın \'False\' yazımı değil"\nassert v["PORT"] == "8000" and v["ORAN"] == "0.25", "Sayılar metne çevrilmeli"\nassert v["SENTRY_DSN"] == "", "Boş değer \'None\' değil boş metin olmalı"\nassert v["CACHE"] == "true", "YAML 1.1\'de yes bool True okunur; \'true\' yazılmalı"\nassert all(isinstance(x, str) for x in v.values()), "Tüm değerler str olmalı"\n',
        hints: ['str(False) "False" verir; Kubernetes ve çoğu uygulama "false" bekler.', 'bool kontrolünü int/float\'tan ayrı yap; None için ayrı dal ekle.', 'isinstance(v, bool) dalı: "true" if v else "false"'],
        why: 'YAML\'ın tür çıkarımı (false, yes, 8000) ConfigMap\'te sık hata kaynağıdır. Uygulama tarafında da ortam değişkenleri hep metin gelir; "False" ya da "None" gibi Python yazımları uygulamada beklenmedik dallara yol açar.'
      },
      {
        t: 'code',
        id: 'docker-deploy-y10',
        stage: 'Meydan okuma',
        diff: 3,
        q: '<p>Deployment\'ın kademeli güncellemesini (rolling update) simüle et. <code>kademeli_guncelle(replicas, max_surge, max_unavailable)</code> her adımdan sonraki <code>(eski, yeni)</code> pod sayılarını liste olarak döndürsün. Yeni podların anında hazır olduğunu varsay. Her adımda:</p><ol><li>Ekle: toplam pod <code>replicas + max_surge</code>\'ı aşmayacak ve yeni sayısı <code>replicas</code>\'ı geçmeyecek kadar yeni pod ekle.</li><li>Sil: hazır pod sayısı <code>replicas - max_unavailable</code>\'ın altına düşmeyecek kadar eski pod sil.</li></ol><p>Eski 0, yeni <code>replicas</code> olunca dur. <code>max_surge</code> ve <code>max_unavailable</code> ikisi de 0 ise ilerleme imkânsızdır: <code>ValueError</code> fırlat.</p>',
        start: 'def kademeli_guncelle(replicas, max_surge, max_unavailable):\n    adimlar = []\n    return adimlar\n',
        sol: 'def kademeli_guncelle(replicas, max_surge, max_unavailable):\n    if max_surge == 0 and max_unavailable == 0:\n        raise ValueError("max_surge ve max_unavailable ikisi birden 0 olamaz")\n    eski, yeni = replicas, 0\n    adimlar = []\n    while not (eski == 0 and yeni == replicas):\n        ekle = max(0, min(replicas + max_surge - (eski + yeni), replicas - yeni))\n        yeni += ekle\n        sil = max(0, min(eski, eski + yeni - (replicas - max_unavailable)))\n        eski -= sil\n        adimlar.append((eski, yeni))\n    return adimlar\n',
        tests: 'assert kademeli_guncelle(3, 1, 0) == [(2, 1), (1, 2), (0, 3)], "surge=1: her adımda bir yeni, bir eski"\nassert kademeli_guncelle(4, 0, 2) == [(2, 0), (0, 2), (0, 4)], "surge=0, unavailable=2: önce ikisi silinir, sonra yeniler eklenir"\nassert kademeli_guncelle(4, 2, 1) == [(1, 2), (0, 4)], "surge=2, unavailable=1"\nassert kademeli_guncelle(1, 1, 0) == [(0, 1)], "Tek kopyada surge ile kesintisiz geçiş"\ntry:\n    kademeli_guncelle(3, 0, 0)\n    assert False, "İkisi de 0 ise ValueError beklenir"\nexcept ValueError:\n    pass\n',
        hints: [
          'Durumu (eski, yeni) iki sayıyla tut; her turda önce ekle sonra sil.',
          'ekle = min(replicas + max_surge - (eski + yeni), replicas - yeni); negatifse 0.',
          'sil = min(eski, (eski + yeni) - (replicas - max_unavailable)); negatifse 0.'
        ],
        why: 'Kubernetes\'in varsayılanı maxSurge=25%, maxUnavailable=25%\'tir. surge kapasite fazlası pahasına hız kazandırır; unavailable ise ek kaynak istemeden ama kapasiteyi geçici düşürerek ilerler. İkisi birden 0 olursa güncelleme hiç ilerleyemez; Kubernetes bu ayarı reddeder.'
      }
    ],
    faq: [
      {
        q: 'Render/Fly varken Kubernetes\'e ne zaman geçmeliyim?',
        a: 'Tek ya da birkaç servisli bir ürün için PaaS çok daha ucuz ve basittir. Kubernetes, çok sayıda servis, ekip başına bağımsız dağıtım, özel ağ kuralları, GPU iş yükleri ya da şirket politikası gerektirdiğinde anlamlıdır ve genellikle yönetilen hizmet (EKS, GKE, AKS) olarak kullanılır.'
      },
      {
        q: 'Nginx yerine Caddy ya da Traefik kullanabilir miyim?',
        a: 'Evet. Caddy Let\'s Encrypt sertifikasını kendiliğinden alır ve yapılandırması kısadır; Traefik Docker ve Kubernetes etiketlerinden yönlendirmeyi otomatik çıkarır. Kavramlar (ters vekil, TLS sonlandırma, X-Forwarded başlıkları) aynıdır.'
      }
    ],
    mistakes: [
      {
        why: 'Konteyner içinde 127.0.0.1 yalnız konteynerin kendisinden erişilebilir; platformun yönlendiricisi ulaşamaz. PaaS portu PORT değişkeniyle verir; sabit port yazmak dağıtımı "sağlık kontrolü başarısız" ile düşürür.',
        bad: 'gunicorn app:app --bind 127.0.0.1:8000',
        good: 'gunicorn app:app --bind 0.0.0.0:${PORT:-8000}'
      }
    ]
  }
);
})(window);
