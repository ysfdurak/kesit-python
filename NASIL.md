# NASIL — derleme, doğrulama ve yayın

Bu dal (`kaynak`), `main`'deki her şeye ek olarak içeriği üretmekte kullanılan geçici betikleri (`uretec/`) ve içerik yazdırma talimatlarını (`belgeler/ajan-talimatlari/`) içerir.

## Klasörler

| Yol | Ne |
|---|---|
| `kaynak/` | Düzenlenecek kaynak: `index.html`, `app.js`, `app2.js`, `engine.js` (sayfa tarafı), `pyworker.js` (Python motoru, Web Worker), `sync.js`, `levels.js` (ders sırası `PY_ORDER`, modül, seviye ve başlık düzeltmeleri, isteğe bağlı dersler, ön koşul), `paths.js` (öğrenme yolları, portföy önerileri, müfredat), `bilinen-sinirlar.js` (Veri setleri sayfasındaki notlar), `ex_anahtar.js` (kimliksiz alıştırmaların eski ilerleme anahtarları, `tools/exkey.py` üretir), `c_*.js` (çekirdek dersler), `bank.js`, `exams.js`, `v2/` (ek dersler, uzantılar, pratik), `v3/` (arena, mülakat, sık hatalar, veri görevleri, yol sınavları) |
| kök (`index.html`, `*.js`) | Derlenmiş site; elle düzenleme, `tools/build.py` üretir |
| `data/` | 8 veri seti, CSV + `manifest.json` (site ve araçlar ortak kullanır) |
| `tools/` | Derleme ve doğrulama araçları (yollar depoya göreli) |
| `tools/pylib/veri.py` | `import veri` modülü (`PP_VERI` ortam değişkeni veri klasörünü gösterir) |
| `uretec/` | İçerik üreteçleri ve yardımcı betikler (aşağıya bakın) |
| `belgeler/` | `SCHEMA.md`, `SCHEMA3.md` (içerik şemaları), `AUDIT.md` (rol uzmanı denetimi), `ajan-talimatlari/` |

## Gereksinimler

- Python 3.12+; doğrulama için: `pip install pandas numpy scikit-learn scipy statsmodels polars duckdb pyarrow pydantic jinja2 pyyaml matplotlib seaborn` (alıştırmaların kullandığı paketler)
- Node.js 18+ (`node --check` ve Pyodide araçları için)
- `npm install` → `pyodide@0.27.8`
- Arayüz testi için: `pip install playwright && playwright install chromium`

## Derleme

```bash
python3 tools/build.py
```

`kaynak/v2/*/*.js` ve `kaynak/v3/*/*.js` parçalarını türüne göre (`PY_LESSONS`, `PY_EXT`, `PY_BANK`, `PY_EXAMS`, `PY_ARENA`, `PY_INTERVIEW`, `PY_MISTAKES`) birleştirir, her paketi `node --check` ile denetler ve köke yazar: `c_*.js`, `n_temel/orta/ileri.js` (yeni dersler), `x_*.js` (uzantılar), `bank.js`, `exams.js`, `arena.js`, `interview.js`, `mistakes.js`, `index.html`.
Yeni bir dersi siteye almak için ders id'sini `kaynak/levels.js` içindeki `PY_ORDER`'a ve ilgili öğrenme yoluna (`kaynak/paths.js`) ekleyin.

Yol sınavları derlenmiş dersler üzerinden üretilir (önce derle, sonra üret, sonra tekrar derle). Kavram soruları betiğin içinde elle yazılıdır; kod soruları ders kodunun değiştirilmiş hâlidir:

```bash
python3 tools/build.py
python3 tools/gen_exams.py
python3 tools/build.py
```

Yeni alıştırma türleri: `t: 'local'` (kendi bilgisayarında görevi: `steps`, `file`, `fname`, `cmd`, `expect`), `t: 'order', plain: true` (kod olmayan adım sıralama). `erken: true` etiketi: henüz görülmemiş yapı kullanan görev; "Erken meydan okuma" olarak görünür, dersi bitirmek için gerekmez. Testlerde `__source__` yorumsuz kaynaktır, `__kod__` yorum ve metin içleri ayıklanmış koddur; yasak yapı denetimlerinde `__kod__` kullan.

## Doğrulama

Hepsi FAIL=0 / hata=0 vermelidir. Testler geçici bir klasörde çalışır; büyük dosya listelerinde makineyi zorlamamak için `VW` (iş parçacığı, varsayılan 8) ve `VT` (zaman aşımı çarpanı, varsayılan 1 → 60 sn) kullanın.

```bash
# 1) CPython: her alıştırmanın çözümü testleri geçmeli, başlangıç kodu geçmemeli; predict/order çıktıları, arena (örnek + gizli + gen testleri), mülakat kod çıktıları, sık hata kayıtları
VW=2 VT=4 python3 tools/verify.py kaynak/c_temel.js kaynak/c_orta.js kaynak/c_ileri.js kaynak/bank.js kaynak/exams.js kaynak/v2/*/*.js kaynak/v3/*/*.js

# 2) Ders gövdelerindeki <pre class="py"> örnekleri (ders başına ortak ad alanında, sırayla)
python3 tools/examples.py c_temel.js c_orta.js c_ileri.js n_temel.js n_orta.js n_ileri.js x_1.js x_2.js

# 3) Aynı denetimler GERÇEK tarayıcı motoruyla (Pyodide 0.27.8, Node içinde) — dosya dosya çalıştırın (tek süreçte çok paket belleği doldurur)
node --max-old-space-size=4000 tools/pyodide_verify.mjs kaynak/v2/n1/sql-analitik.js
node --max-old-space-size=4000 tools/pyodide_examples.mjs kaynak/v2/n1/sql-analitik.js
#    ONLY='regex' yalnız eşleşen öğeleri, TRACE=1 her öğeyi yazdırır, START=n n. öğeden başlar, NOPKG=1 üçüncü taraf paket isteyenleri atlar

# 4) Arayüz: tüm dersleri, görünümleri, pratik görevlerini ve sınavları headless Chromium'da açar
python3 tools/uitest.py        # "UI testi: TEMİZ" beklenir

# 5) Vurgulayıcı özellik testi: tüm kodda un(hl(x)) === x
node tools/hltest.js

# 6) Temel seviyede öğretilmemiş yapı ölçümü: "ihlal 0" beklenir
python3 tools/olcum_temel.py
```

Pyodide paketleri (pandas, scikit-learn, polars…) varsayılan olarak `cdn.jsdelivr.net/pyodide/v0.27.8/full/` adresinden iner. Ağ kısıtlıysa tam sürümü indirip tekerlekleri yerel pakete kopyalayın:

```bash
curl -L -o pyodide.tar.bz2 https://github.com/pyodide/pyodide/releases/download/0.27.8/pyodide-0.27.8.tar.bz2
mkdir pyfull && tar -xjf pyodide.tar.bz2 -C pyfull --wildcards 'pyodide/*.whl' 'pyodide/*.zip'
cp -n pyfull/pyodide/*.whl pyfull/pyodide/*.zip node_modules/pyodide/
```

Dosya başına toplu çalıştırma betikleri: `uretec/vf/chain.sh cp|pyo <dosyalar>` (verify veya pyodide_verify, her dosya ayrı süreç, log klasörüne yazar) ve `uretec/vf/exchain.sh <dosyalar>` (pyodide_examples). Bu iki betik eski ortamın mutlak yollarını kullanır; çalıştırmadan önce içindeki `V=` ve `cd` yollarını düzeltin.

## Yayın

- **GitHub Pages:** Settings → Pages → Branch `main`, `/ (root)`.
- **claude.ai artifact:** kökteki `index.html` sayfa, diğer kök `*.js` dosyaları ve `data/**` (CSV + manifest) ek dosya olarak yayımlanır (yaklaşık 97 dosya, 30 MB). Yayından önce U+FFFD karakteri olmadığını denetleyin: `grep -c $'\xef\xbf\xbd' *.js index.html`.

## Bilinen tarayıcı (Pyodide) farkları — `kaynak/pyworker.js` PRELUDE'unda çözüldü

- Motor Web Worker'da çalışır (`pyworker.js`): sayfa donmaz, Durdur ve süre sınırı işçiyi sonlandırıp yenisini başlatır. input() girdileri önceden verilir; matplotlib şekilleri Agg ile PNG olarak sayfaya gelir.
- asyncio JSPI'siz döngüyle; thread'ler ertelenmiş çalıştırılır (`start` sıraya koyar; `join`, boş `Queue.get`, `Queue.join` veya program sonu çalıştırır); `ThreadPoolExecutor`/`ProcessPoolExecutor` eşzamanlı.
- polars: `scan_csv`/`scan_parquet`/`read_parquet`/`write_parquet` yok veya çöküyor → `_pp_polars_patch()` eager okuma + `.lazy()` ve pyarrow ile sağlar; `to_arrow`/`to_pandas` taşma paniğinde Python listeleri üzerinden aktarır; pyarrow sonradan yüklenince `_pp_fix_lazy()` polars bayraklarını günceller.
- `hashlib.pbkdf2_hmac` için `hashlib` paketi yüklenir ve önbellekteki `hashlib/hmac/secrets` modülleri atılır.
- SQLite 3.39 `ROUND` ve pandas/scikit-learn/statsmodels sürüm farkları: testler eşitlik ve yuvarlamada toleranslı yazılmalı.

## `uretec/` — içerik üreteçleri

İçerik alt ajanlarla, her ders/dosya için bir Python üretici betikle yazıldı; betik testlerdeki beklenen değerleri gerçek veriden hesaplayıp `.js` dosyasını üretir. Bir dosyayı düzeltmek için JS'i elle değil, üreticisini düzenleyip yeniden çalıştırmak en güvenlisidir. Betikler eski çalışma ortamının mutlak yollarını (`/home/claude/py/...`, `/tmp/claude-0/.../scratchpad/...`) içerir; çalıştırmadan önce bu yolları depodaki karşılıklarına (`kaynak/...`, `uretec/...`) çevirin.

| Klasör / dosya | Ürettiği |
|---|---|
| `n1/` | `kaynak/v2/n1`: sql-analitik, eda-kesifsel, is-metrikleri, veri-mulakat |
| `gen/` (`L1–L4.py`, `build.py`, `vwrap.py`) | `v2/n2` (özellik müh., MLOps, zaman serisi, derin öğrenme), `v2/n5` (`l1–l4.py`, `emit.py`), `v2/n7` ve `v3/d2` veri görevleri (`pusula.py`, `lezzet.py`, `kanat.py`, `pedal.py`) |
| `n3gen/`, `n4gen/`, `n8gen/` | `v2/n3`, `v2/n4`, `v2/n8` (RAG, yerel modeller, YZ bitirme projesi) |
| `x1/` (`c_*.py`, `seqv.py`), `x2gen/` (`slow.py`), `src/` + `gen.py` | Ders uzantıları `v2/x1`, `v2/x2`, `v2/x3` |
| `arena_a1/`, `a2gen/`, `a3gen/`, `a4gen/` | Python Arena `v3/a1–a4` |
| `m1gen/`, `m2gen/`, `m3gen/`, `m4/` | Mülakat soruları `v3/m1–m4` |
| `h1gen/` | Sık hatalar `v3/h1` |
| `e1`–`e7`, `t1gen`, `gen_t4`, `i1agent`, `i2gen`, `o3`, `o5b`, `b`, `b3`, kökteki `l_*.py`, `g_*.py`, `*_N.py` | Önceki sürümlerin dersleri, uzantıları ve pratik bankası parçaları |
| `vf/` | Doğrulama zincirleri (`chain.sh`, `exchain.sh`), `pyrun.mjs` (bir .py dosyasını veri ile Pyodide'de çalıştırır), `showex.js` (bir alıştırmanın çözüm/testini yazdırır) |
| `dom.py`, `shots.py`, `ut2.py`, `ut3.py` | Playwright ile ekran görüntüsü ve etkileşim denetimleri |
| `eski-parcalar/` | İlk sürümün ders parçaları (`frag`, `frag2`) ve kullanılmayan `c_temel1.js` |

Mülakat bankası temizliği `kaynak/v3/mz/mulakat_temizlik.js` içindedir: davranışsal sorular ve Python'a dayanmayan sorular derleme sırasında listeden çıkarılır (dosya adı `mz`, diğer `m*` klasörlerinden sonra yüklensin diye).

## Ortak veri setleri
`data/` altındaki Ilgaz Bank, Kanat Havayolları, Lezzet Kurye, Pusula İK ve Pedal İzmir CSV'leri Kesit SQL üreteçlerinden gelir (Kesit SQL `NASIL.md` → Ortak veri setleri). Python'da elle düzenlenmez: Power BI `scratchpad/ds/csv` dosyasının BOM'suz kopyasıdır. Kopyalamadan sonra `data/manifest.json` içinde `rows` ve `bytes` güncellenir; `name` alanları (`Anadolu Market (Power BI modeli)`, `Kirli veri` kaynağı dahil) elle verilmiştir, korunur. Beklenen değerler `kaynak/` içindeki testlerde sabit yazılıdır: veri değişince `tools/verify.py` hangi görevlerin değiştiğini gösterir; `uretec/` betikleri eskimiş olabilir, doğrudan `kaynak/` düzenlenir.
