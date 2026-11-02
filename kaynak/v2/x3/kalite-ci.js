/* Kesit Python — 'kalite-ci' uzantısı (AUDIT 12, Derinleş + ek alıştırmalar) */
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  {
    id: 'kalite-ci',
    min: 30,
    html: `<p>CI "kod sağlam mı?" sorusunu yanıtlar. Sürekli dağıtım (continuous delivery/deployment, CD) ise bir sonraki soruyu: "Sağlam kod kullanıcıya nasıl, güvenle ve geri alınabilir biçimde ulaşır?" Bu bölüm imaj üretmeyi, ortamları, sürüm etiketlerini, geri almayı ve ML projelerinde model kalite kapısını anlatıyor.</p>
<h2>Teslim mi, dağıtım mı?</h2>
<div class="tbl-wrap"><table><tr><th>Kavram</th><th>Ne olur?</th></tr>
<tr><td>Sürekli entegrasyon (CI)</td><td>Her push'ta lint, tip, test; ana dal hep yeşil</td></tr>
<tr><td>Sürekli teslim (continuous delivery)</td><td>Her yeşil commit yayına <b>hazır</b> bir paket (imaj) üretir; prod'a çıkış bir onay ya da etiketle olur</td></tr>
<tr><td>Sürekli dağıtım (continuous deployment)</td><td>Yeşil commit insan onayı olmadan prod'a çıkar</td></tr></table></div>
<p>Çoğu ekip ortadakini kullanır: <code>main</code>'e her birleşme staging'e otomatik gider; prod'a çıkış bir sürüm etiketi (<code>v1.4.2</code>) ve onayla olur.</p>
<h2>İmajı bir kez inşa et, her yere aynısını taşı</h2>
<p>CD'nin altın kuralı: staging'de test ettiğin <b>aynı imaj</b> prod'a gider; prod için yeniden inşa edilmez. Ortamlar arasında yalnız yapılandırma (ortam değişkenleri, sırlar) değişir. İmaj, kayıt defterine (registry: GitHub Container Registry, Docker Hub, ECR) <b>değiştirilemez</b> bir etiketle gönderilir: commit SHA'sı ya da sürüm numarası. <code>latest</code> yalnız kolaylık etiketidir, dağıtımda kullanılmaz.</p>
<pre class="code"># .github/workflows/cd.yml
name: cd
on:
  push:
    branches: [main]
    tags: ["v*.*.*"]
jobs:
  imaj:
    runs-on: ubuntu-latest
    permissions: {contents: read, packages: write}
    outputs: {etiket: $\{{ steps.meta.outputs.version }}}
    steps:
      - uses: actions/checkout@v4
      - uses: docker/login-action@v3
        with: {registry: ghcr.io, username: $\{{ github.actor }}, password: $\{{ secrets.GITHUB_TOKEN }}}
      - id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/anadolu/market-api
          tags: |
            type=sha
            type=semver,pattern={{version}}
      - uses: docker/build-push-action@v6
        with: {push: true, tags: $\{{ steps.meta.outputs.tags }}}
  staging:
    needs: imaj
    environment: staging
    runs-on: ubuntu-latest
    steps:
      - run: ./deploy.sh staging $\{{ needs.imaj.outputs.etiket }}
      - run: ./smoke_test.sh https://staging.market.example.com
  prod:
    needs: staging
    if: startsWith(github.ref, 'refs/tags/v')
    environment: production          # GitHub'da "required reviewers" ile onay ister
    runs-on: ubuntu-latest
    steps:
      - run: ./deploy.sh prod $\{{ needs.imaj.outputs.etiket }}</pre>
<p><code>environment:</code> anahtarı GitHub'da ortam başına ayrı sırlar ve koruma kuralları (onaylayıcı, bekleme süresi, yalnız etiketlerden dağıtım) tanımlamanı sağlar. <b>Duman testi</b> (smoke test), dağıtımdan hemen sonra birkaç kritik uç noktayı (<code>/health</code>, giriş, sepet) çağıran kısa bir denetimdir; başarısızsa hat durur.</p>
<h2>Sürüm numarası: anlamsal sürümleme</h2>
<p>Anlamsal sürümleme (semantic versioning) <code>MAJOR.MINOR.PATCH</code> biçimindedir: geriye uyumsuz değişiklik major'ı, yeni özellik minor'ı, hata düzeltmesi patch'i artırır. Commit mesajlarını <i>Conventional Commits</i> kuralıyla (<code>feat:</code>, <code>fix:</code>, <code>feat!:</code>) yazarsan bir sonraki sürümü araçlar (release-please, semantic-release) otomatik hesaplar ve değişiklik günlüğünü (CHANGELOG) üretir.</p>
<h2>Geri alma (rollback)</h2>
<p>Her dağıtım bir gün geri alınacakmış gibi yapılır. Değiştirilemez etiketler sayesinde geri almak, bir önceki <b>başarılı</b> imaj etiketini yeniden dağıtmaktır (<code>kubectl rollout undo</code>, Render/Fly panelinde "redeploy previous"). Geri almayı zorlaştıran tek şey veritabanıdır: yeni sürümün migration'ı eski kodu bozuyorsa geri dönüş de bozulur. Bu yüzden sqlalchemy-orm dersindeki genişlet-daralt kalıbı CD'nin ön koşuludur. Riskli özellikleri <b>özellik bayrağı</b> (feature flag) arkasında yayınlamak, kodu geri almadan özelliği kapatmayı sağlar. Kanarya (canary) dağıtımda yeni sürüm önce trafiğin küçük bir yüzdesine açılır, hata oranı izlenir, sorun yoksa genişletilir.</p>
<div class="warn"><b>"İleri düzelt" her zaman seçenek değildir</b>Prod bozukken hızlı bir düzeltme commit'i yazıp yeniden dağıtmak (fix forward) cazip gelir ama CI süresi kadar kesinti demektir. Önce geri al, kullanıcıyı kurtar, sonra sakin kafayla düzelt.</div>
<h2>ML projelerinde model kalite kapısı</h2>
<p>Model de bir yapıt (artifact) gibi sürümlenir ve dağıtılır; ama "testler geçti" yetmez, yeni model eskisinden <b>kötü</b> olabilir. Kalite kapısı, aday modeli üretimdeki (temel) modelle aynı sabit doğrulama kümesinde karşılaştırır ve kurallardan biri bozulursa dağıtımı durdurur: ana metrik en az temel kadar olmalı, gecikme ve model boyutu sınırı aşmamalı, hiçbir müşteri segmentinde performans belirgin düşmemeli.</p>
<pre class="py">from sklearn.datasets import make_classification
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import train_test_split

X, y = make_classification(n_samples=1500, n_features=8, random_state=7)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.3, random_state=7)

temel = LogisticRegression(max_iter=1000).fit(X_tr, y_tr)
aday = DecisionTreeClassifier(max_depth=3, random_state=7).fit(X_tr, y_tr)
auc_t = roc_auc_score(y_te, temel.predict_proba(X_te)[:, 1])
auc_a = roc_auc_score(y_te, aday.predict_proba(X_te)[:, 1])

TOLERANS = 0.005          # gürültü payı
gecti = auc_a &gt;= auc_t - TOLERANS
print(f"temel AUC={auc_t:.3f}  aday AUC={auc_a:.3f}  kapı: {'GEÇTİ' if gecti else 'REDDEDİLDİ'}")</pre>
<p>Bu betik CI'da çalışır ve reddedince <code>sys.exit(1)</code> ile hattı durdurur. Doğrulama kümesi sabit tutulur (sürümlenir); her eğitimde değişirse karşılaştırma anlamsızlaşır. MLflow model kayıt defterinde "Staging → Production" geçişi de bu kapının arkasına konur.</p>
<div class="note"><b>Gerçek işte</b>Olgun ekiplerde prod'a çıkış sıkıcı bir olaydır: günde birkaç kez, küçük değişikliklerle, otomatik duman testi ve tek tıkla geri almayla. Dağıtım sıklığı, değişiklik başarısızlık oranı, geri dönüş süresi ve değişikliğin prod'a ulaşma süresi (DORA metrikleri) bu olgunluğun ölçüsüdür.</div>`,
    ex: [
      {
        t: 'mc',
        id: 'kalite-ci-y1',
        stage: 'Isınma',
        q: 'Staging\'de test edilen sürümü prod\'a çıkarırken doğru yaklaşım hangisi?',
        o: [
          'Prod için kaynak koddan imajı yeniden inşa etmek',
          'Staging\'de test edilen aynı imaj etiketini prod\'a dağıtmak',
          'Prod\'da her zaman <code>latest</code> etiketini çekmek',
          'Prod sunucusunda <code>git pull</code> çalıştırmak'
        ],
        a: 1,
        why: 'Yeniden inşa, farklı bağımlılık sürümleriyle test edilmemiş bir imaj üretebilir. latest değişkendir; hangi sürümün çalıştığı belirsizleşir ve geri alma imkânsızlaşır. Bir kez inşa et, aynı değiştirilemez etiketi her ortama taşı.'
      },
      {
        t: 'mc',
        id: 'kalite-ci-y2',
        stage: 'Isınma',
        q: 'Yeni bir sürüm prod\'a çıktı ve hata oranı aniden yükseldi. Migration\'lar genişlet-daralt kuralına uygun yazılmış. İlk yapılacak şey?',
        o: ['Hatayı bulup düzeltme commit\'i yazmak', 'Bir önceki başarılı imaj etiketine geri dönmek', 'Veritabanını yedekten geri yüklemek', 'Staging ortamını silip yeniden kurmak'],
        a: 1,
        why: 'Önce kullanıcıyı kurtar: geri alma dakikalar sürer, düzeltme ise CI süresi ve riski taşır. Migration\'lar geriye uyumlu olduğu için eski kod yeni şemayla çalışır. Veritabanı geri yükleme veri kaybettirir, son çaredir.'
      },
      {
        t: 'predict',
        id: 'kalite-ci-y3',
        stage: 'Kodu oku',
        q: 'Hangi git referansları prod dağıtımını tetikler? Bu kod ne yazdırır?',
        o: ['[\'v1.4.2\', \'v2.0.0-rc1\']', '[\'v1.4.2\']', '[\'v1.4.2\', \'v1.4\', \'v2.0.0-rc1\']', '[\'main\', \'v1.4.2\', \'v2.0.0-rc1\']'],
        a: 0,
        code: 'from fnmatch import fnmatch\nrefs = ["refs/heads/main", "refs/tags/v1.4.2", "refs/tags/v1.4", "refs/tags/deneme", "refs/tags/v2.0.0-rc1"]\ndesen = "refs/tags/v*.*.*"\nprint([r.rsplit("/", 1)[1] for r in refs if fnmatch(r, desen)])\n',
        why: '* herhangi bir metinle eşleşir; v2.0.0-rc1 de iki nokta içerdiği için desene uyar. Ön sürümlerin (rc) prod\'a gitmesini istemiyorsan iş akışında ayrıca kontrol etmelisin. v1.4\'te iki nokta yok, eşleşmez.'
      },
      {
        t: 'predict',
        id: 'kalite-ci-y4',
        stage: 'Kodu oku',
        q: 'Sürüm karşılaştırması: bu kod ne yazdırır?',
        o: ['1.9.3 1.10.0', '1.10.0 1.10.0', '1.9.3 1.9.3', '1.2.11 1.10.0'],
        a: 0,
        code: 'surumler = ["1.10.0", "1.9.3", "1.2.11"]\nprint(max(surumler), max(surumler, key=lambda s: tuple(map(int, s.split(".")))))\n',
        why: 'Metin karşılaştırması karakter karakter yapılır: "1.9" > "1.1" olduğu için 1.9.3 en büyük görünür. Sayı demetine çevirince (1, 10, 0) > (1, 9, 3) doğru sonucu verir. "Son sürüme geri al" kodunda bu hata yanlış imajı seçtirir.'
      },
      {
        t: 'order',
        id: 'kalite-ci-y5',
        stage: 'Kodu oku',
        q: '<p>Model kalite kapısı betiğinin satırlarını sırala: metrikleri oku, kuralları uygula, ihlal varsa çıkış kodu 1 ile durdur. Beklenen çıktı:</p><pre class="out">REDDEDİLDİ: [\'gecikme_ms 140 &gt; 120\']</pre>',
        lines: [
          'aday = {"auc": 0.84, "gecikme_ms": 140}',
          'kurallar = [("auc", ">=", 0.82), ("gecikme_ms", "<=", 120)]',
          'ihlaller = []',
          'for metrik, op, esik in kurallar:',
          '    if (op == ">=" and aday[metrik] < esik) or (op == "<=" and aday[metrik] > esik):',
          '        ihlaller.append(f"{metrik} {aday[metrik]} {\'<\' if op == \'>=\' else \'>\'} {esik}")',
          'print("REDDEDİLDİ:" if ihlaller else "GEÇTİ", ihlaller)'
        ],
        expect: 'REDDEDİLDİ: [\'gecikme_ms 140 > 120\']\n',
        hint: 'Liste döngüden önce kurulur; ekleme if bloğunun içindedir; özet en sonda yazdırılır.',
        why: 'Kalite kapısı yalnız doğruluğa bakmaz; gecikme ve boyut gibi operasyonel kurallar da aynı listeye girer. Gerçek betik ihlal varsa sys.exit(1) ile CI işini kırmızıya çevirir.'
      },
      {
        t: 'code',
        id: 'kalite-ci-y6',
        stage: 'Rehberli',
        diff: 2,
        q: '<p>Conventional Commits\'ten sonraki sürümü hesapla. <code>sonraki_surum(mevcut, mesajlar)</code> yaz: <code>mevcut</code> "1.4.2" gibi bir metin, <code>mesajlar</code> commit başlıklarıdır. Kural: herhangi bir mesajda tür sonrası <code>!</code> (ör. <code>feat!:</code>, <code>fix(api)!:</code>) ya da <code>BREAKING CHANGE</code> varsa major artar (minor ve patch 0); yoksa <code>feat</code> varsa minor artar (patch 0); yoksa <code>fix</code> ya da <code>perf</code> varsa patch artar; hiçbiri yoksa sürüm değişmez.</p>',
        guide: [
          'Sürümü üç tamsayıya ayır.',
          'Her mesajın ":" öncesindeki başlığını al; parantezli kapsamı (scope) atıp türü bul.',
          'En yüksek etki düzeyini bul: 3 major, 2 minor, 1 patch, 0 yok.',
          'Düzeye göre yeni sürümü f-string ile kur.'
        ],
        example: 'import re\nm = re.match(r"(\\w+)(\\([^)]*\\))?(!)?:", "fix(sepet)!: indirim hesabı")\nprint(m.group(1), m.group(2), m.group(3))\n',
        start: 'import re\n\ndef sonraki_surum(mevcut, mesajlar):\n    major, minor, patch = map(int, mevcut.split("."))\n    duzey = 0\n    for m in mesajlar:\n        # TODO: türü ve ! işaretini bul, düzeyi güncelle\n        pass\n    # TODO: düzeye göre yeni sürümü döndür\n    return mevcut\n',
        sol: 'import re\n\ndef sonraki_surum(mevcut, mesajlar):\n    major, minor, patch = map(int, mevcut.split("."))\n    duzey = 0\n    for m in mesajlar:\n        e = re.match(r"(\\w+)(\\([^)]*\\))?(!)?:", m)\n        if "BREAKING CHANGE" in m or (e and e.group(3)):\n            duzey = max(duzey, 3)\n        elif e and e.group(1) == "feat":\n            duzey = max(duzey, 2)\n        elif e and e.group(1) in ("fix", "perf"):\n            duzey = max(duzey, 1)\n    if duzey == 3:\n        return f"{major + 1}.0.0"\n    if duzey == 2:\n        return f"{major}.{minor + 1}.0"\n    if duzey == 1:\n        return f"{major}.{minor}.{patch + 1}"\n    return mevcut\n',
        tests: 'assert sonraki_surum("1.4.2", ["fix: sepette yuvarlama", "docs: README"]) == "1.4.3", "Yalnız fix varsa patch artar"\nassert sonraki_surum("1.4.2", ["fix: x", "feat(odeme): taksit"]) == "1.5.0", "feat minor\'ı artırır ve patch sıfırlanır"\nassert sonraki_surum("1.4.2", ["feat!: v2 uç noktaları", "fix: y"]) == "2.0.0", "! major artırır"\nassert sonraki_surum("1.4.2", ["fix(api)!: alan adı değişti"]) == "2.0.0", "Kapsamlı türde de ! major demektir"\nassert sonraki_surum("1.4.2", ["refactor: temizlik\\n\\nBREAKING CHANGE: eski uç nokta kaldırıldı"]) == "2.0.0", "BREAKING CHANGE gövdede de olabilir"\nassert sonraki_surum("1.4.2", ["chore: bağımlılık", "test: ek"]) == "1.4.2", "Etkisiz türler sürümü değiştirmez"\nassert sonraki_surum("0.9.9", ["perf: önbellek"]) == "0.9.10", "perf patch artırır; sayılar metin gibi değil sayı gibi artar"\n',
        hints: [
          'Etkiyi sayısal düzeyle (0-3) tut ve max ile güncelle; en yüksek etki kazanır.',
          're.match(r"(\\w+)(\\([^)]*\\))?(!)?:", m) türü, kapsamı ve ! işaretini yakalar.',
          'Major artınca minor ve patch, minor artınca patch sıfırlanır.'
        ],
        why: 'release-please ve semantic-release bu mantıkla çalışır. Sürüm numarası insan kararı olmaktan çıkınca etiket ve CHANGELOG otomatik üretilir; kullanıcılar da numaraya bakarak yükseltmenin güvenli olup olmadığını anlar.'
      },
      {
        t: 'code',
        id: 'kalite-ci-y7',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p><code>imaj_etiketleri(imaj, sha, ref)</code> yaz (docker/metadata-action benzeri). Her zaman <code>imaj:sha-&lt;ilk 7 karakter&gt;</code> üret. <code>ref</code> <code>refs/heads/main</code> ise ek olarak <code>imaj:main</code>. <code>ref</code> <code>refs/tags/vX.Y.Z</code> ise (yalnız sayılardan oluşan üç parça) ek olarak <code>imaj:X.Y.Z</code>, <code>imaj:X.Y</code> ve <code>imaj:latest</code>. Diğer referanslarda (başka dal, ön sürüm etiketi) yalnız sha etiketi. Etiketleri bu sırayla liste olarak döndür.</p>',
        start: 'def imaj_etiketleri(imaj, sha, ref):\n    pass\n',
        sol: 'import re\n\ndef imaj_etiketleri(imaj, sha, ref):\n    etiketler = [f"{imaj}:sha-{sha[:7]}"]\n    if ref == "refs/heads/main":\n        etiketler.append(f"{imaj}:main")\n    m = re.fullmatch(r"refs/tags/v(\\d+)\\.(\\d+)\\.(\\d+)", ref)\n    if m:\n        x, y, z = m.groups()\n        etiketler += [f"{imaj}:{x}.{y}.{z}", f"{imaj}:{x}.{y}", f"{imaj}:latest"]\n    return etiketler\n',
        tests: 'I = "ghcr.io/anadolu/market-api"\nS = "3f9c2a1b7d4e5f60"\nassert imaj_etiketleri(I, S, "refs/heads/main") == [I + ":sha-3f9c2a1", I + ":main"], "main dalı: sha ve main"\nassert imaj_etiketleri(I, S, "refs/tags/v1.4.2") == [I + ":sha-3f9c2a1", I + ":1.4.2", I + ":1.4", I + ":latest"], "Sürüm etiketi: tam, kısa ve latest"\nassert imaj_etiketleri(I, S, "refs/tags/v2.0.0-rc1") == [I + ":sha-3f9c2a1"], "Ön sürüm latest almamalı"\nassert imaj_etiketleri(I, S, "refs/heads/ozellik/sepet") == [I + ":sha-3f9c2a1"], "Diğer dallar yalnız sha etiketi alır"\n',
        hints: ['sha etiketi her durumda ilk eleman.', 'Sürüm etiketi için re.fullmatch ile tam eşleşme kullan; -rc1 gibi ekler eşleşmemeli.', 'X.Y etiketi, kullanıcıların "1.4 serisinin son yaması"nı çekmesini sağlar.'],
        why: 'sha etiketi her commit\'i izlenebilir kılar ve geri almanın dayanağıdır. latest yalnız kararlı sürümlere verilir; ön sürüme latest vermek, latest çeken herkesi test edilmemiş koda taşır.'
      },
      {
        t: 'code',
        id: 'kalite-ci-y8',
        stage: 'Kendin yaz',
        diff: 2,
        q: '<p><code>geri_alma_hedefi(gecmis)</code> yaz. <code>gecmis</code> dağıtım kayıtlarının eski→yeni sıralı listesidir: <code>{"etiket": "1.4.2", "durum": "basarili" | "basarisiz" | "geri_alindi"}</code>. Son kayıt şu an çalışan (sorunlu) sürümdür. Ondan önceki, durumu <code>"basarili"</code> olan ve etiketi şu ankinden <b>farklı</b> en yakın kaydın etiketini döndür; yoksa <code>None</code>.</p>',
        start: 'def geri_alma_hedefi(gecmis):\n    pass\n',
        sol: 'def geri_alma_hedefi(gecmis):\n    if not gecmis:\n        return None\n    simdiki = gecmis[-1]["etiket"]\n    for kayit in reversed(gecmis[:-1]):\n        if kayit["durum"] == "basarili" and kayit["etiket"] != simdiki:\n            return kayit["etiket"]\n    return None\n',
        tests: 'G = [{"etiket": "1.3.0", "durum": "basarili"}, {"etiket": "1.4.0", "durum": "basarili"},\n     {"etiket": "1.4.1", "durum": "basarisiz"}, {"etiket": "1.4.2", "durum": "basarili"}]\nassert geri_alma_hedefi(G) == "1.4.0", "Başarısız 1.4.1 atlanmalı; en yakın başarılı 1.4.0"\nG2 = [{"etiket": "1.3.0", "durum": "basarili"}, {"etiket": "1.4.0", "durum": "basarili"}, {"etiket": "1.4.0", "durum": "basarili"}]\nassert geri_alma_hedefi(G2) == "1.3.0", "Aynı etiketin yeniden dağıtımı geri alma hedefi olamaz"\nG3 = [{"etiket": "1.2.0", "durum": "basarili"}, {"etiket": "1.3.0", "durum": "geri_alindi"}, {"etiket": "1.4.0", "durum": "basarili"}]\nassert geri_alma_hedefi(G3) == "1.2.0", "Daha önce geri alınmış sürüme dönülmez"\nassert geri_alma_hedefi([{"etiket": "1.0.0", "durum": "basarili"}]) is None, "Tek kayıtta dönülecek sürüm yok"\nassert geri_alma_hedefi([]) is None, "Boş geçmişte None"\n',
        hints: ['Son kaydı ayır; geri kalanı sondan başa gez.', 'reversed(gecmis[:-1]) en yakından en eskiye gider.', 'Durum ve etiket koşulunu birlikte denetle.'],
        why: 'Geri alma "bir önceki satır" demek değildir: arada başarısız ya da geri alınmış sürümler, aynı etiketin yeniden dağıtımları olabilir. Bu mantık CD aracında hazır olsa da kayıtların (dağıtım geçmişi) tutulması senin sorumluluğundadır.'
      },
      {
        t: 'code',
        id: 'kalite-ci-y9',
        stage: 'Hata avı',
        kind: 'bug',
        diff: 2,
        q: '<p>Hatayı bul ve düzelt. <code>kapi(aday, temel, tolerans=0.005)</code> model kalite kapısıdır: aday AUC, temel AUC\'den en fazla <code>tolerans</code> kadar düşük olabilir; aday gecikmesi temelin 1,2 katını aşamaz. Geçerse <code>(True, [])</code>, geçmezse <code>(False, nedenler)</code> döndürmeli. Şu anki kod daha kötü modelleri geçiriyor ve iyi modelleri reddediyor.</p>',
        start: 'def kapi(aday, temel, tolerans=0.005):\n    nedenler = []\n    if aday["auc"] > temel["auc"] - tolerans:\n        nedenler.append("auc düştü")\n    if aday["gecikme_ms"] > temel["gecikme_ms"] * 1.2:\n        nedenler.append("gecikme arttı")\n    return (len(nedenler) > 0, nedenler)\n',
        sol: 'def kapi(aday, temel, tolerans=0.005):\n    nedenler = []\n    if aday["auc"] < temel["auc"] - tolerans:\n        nedenler.append("auc düştü")\n    if aday["gecikme_ms"] > temel["gecikme_ms"] * 1.2:\n        nedenler.append("gecikme arttı")\n    return (len(nedenler) == 0, nedenler)\n',
        tests: 'T = {"auc": 0.850, "gecikme_ms": 40}\nassert kapi({"auc": 0.860, "gecikme_ms": 42}, T) == (True, []), "Daha iyi AUC ve kabul edilebilir gecikme geçmeli"\nassert kapi({"auc": 0.847, "gecikme_ms": 40}, T) == (True, []), "Tolerans içindeki küçük düşüş geçmeli"\nassert kapi({"auc": 0.830, "gecikme_ms": 40}, T) == (False, ["auc düştü"]), "0.02 düşüş reddedilmeli"\nassert kapi({"auc": 0.900, "gecikme_ms": 60}, T) == (False, ["gecikme arttı"]), "AUC iyi olsa da gecikme 48 ms sınırını aşıyor"\n',
        hints: ['İki ayrı hata var: biri karşılaştırma yönünde, biri dönüş değerinde.', 'İhlal koşulu "aday, temel eksi toleranstan KÜÇÜK" olmalı.', 'Geçti bilgisi "neden yok" demektir: len(nedenler) == 0.'],
        why: 'Kalite kapısındaki ters işaret en tehlikeli hatalardandır: CI yeşil yanar, kötü model prod\'a gider. Kapının kendisini de bilinen iyi ve kötü örneklerle test etmek bu yüzden şarttır.'
      },
      {
        t: 'code',
        id: 'kalite-ci-y10',
        stage: 'Meydan okuma',
        diff: 3,
        needs: ['pandas'],
        q: '<p>Dilim (segment) bazında kalite kapısı. Genel başarı iyi görünse de bir müşteri segmentinde model çökebilir. <code>dilim_kapisi(df, esik=0.05)</code> yaz: <code>df</code> sütunları <code>segment</code>, <code>y</code> (gerçek 0/1), <code>temel</code> ve <code>aday</code> (tahmin 0/1). Her segment için doğruluğu (accuracy) hesapla; adayın doğruluğu temelinkinden <code>esik</code>\'ten <b>fazla</b> düşen segmentlerin adlarını sıralı liste olarak döndür. Gerçek veri: Ilgaz Bank müşterilerinin <code>segment</code> sütunu.</p>',
        start: 'import pandas as pd\n\ndef dilim_kapisi(df, esik=0.05):\n    return []\n',
        sol: 'import pandas as pd\n\ndef dilim_kapisi(df, esik=0.05):\n    d = df.assign(t_dogru=(df["temel"] == df["y"]).astype(float),\n                  a_dogru=(df["aday"] == df["y"]).astype(float))\n    ozet = d.groupby("segment")[["t_dogru", "a_dogru"]].mean()\n    kotu = ozet[ozet["a_dogru"] < ozet["t_dogru"] - esik]\n    return sorted(kotu.index.tolist())\n',
        tests: 'import veri\nimport numpy as np\nm = veri.oku("ilgaz_bank", "bank_customers")\nrng = np.random.default_rng(3)\ny = (m["risk_score"] > m["risk_score"].median()).astype(int).to_numpy()\ntemel = np.where(rng.random(len(m)) < 0.85, y, 1 - y)\naday = temel.copy()\nsegs = m["segment"].to_numpy()\nhedef = sorted(set(segs))[0]\nbozuk = (segs == hedef) & (rng.random(len(m)) < 0.3)\naday[bozuk] = 1 - y[bozuk]\ndf = pd.DataFrame({"segment": segs, "y": y, "temel": temel, "aday": aday})\ngenel_t = (df.temel == df.y).mean(); genel_a = (df.aday == df.y).mean()\nsonuc = dilim_kapisi(df)\nassert sonuc == [hedef], f"Yalnız {hedef!r} segmenti yakalanmalı, gelen {sonuc}"\nassert dilim_kapisi(df.assign(aday=df.temel)) == [], "Aday temel ile aynıysa hiçbir segment düşmez"\nassert dilim_kapisi(df, esik=0.5) == [], "Çok gevşek eşikte hiçbir segment takılmamalı"\n',
        hints: ['Önce her satır için temel ve adayın doğru olup olmadığını 0/1 sütun olarak ekle.', 'groupby("segment") ile iki sütunun ortalaması segment doğruluğudur.', 'ozet[ozet.a_dogru < ozet.t_dogru - esik].index'],
        why: 'Ortalama, küçük bir segmentteki çöküşü gizler; genel doğruluk birkaç puan düşer ama o segmentteki müşteriler için model işe yaramaz hâle gelir. Olgun ML hatlarında kalite kapısı hem genel hem dilim bazında kural içerir (ml-pipeline-degerlendirme dersindeki hata dilimi analizi).'
      }
    ],
    faq: [
      {
        q: 'Staging ortamı prod\'un birebir kopyası olmak zorunda mı?',
        a: 'Aynı imaj, aynı altyapı türü (aynı veritabanı motoru ve sürümü, aynı ters vekil) ve benzer yapılandırma olmalı; boyut ve veri hacmi küçük olabilir. Prod verisini staging\'e kopyalamak KVKK riski taşır; maskeleyerek ya da sentetik veriyle doldur.'
      },
      {
        q: 'GitHub Actions dışında hangi CD araçları var?',
        a: 'GitLab CI/CD, CircleCI, Jenkins, Azure Pipelines genel amaçlı hatlardır. Kubernetes dünyasında Argo CD ve Flux "GitOps" yaklaşımıyla çalışır: istenen durum bir git deposunda tutulur, araç kümeyi o depoya eşitler; geri alma bir git revert\'tür.'
      }
    ]
  }
);
})(window);
