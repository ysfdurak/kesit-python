# PythonPatika: rol patikaları müfredat denetimi

Tarih: 2 Kasım 2026 · Kapsam: `levels.js` (PY_ORDER, 111 ders), `paths.js` (10 patika), tüm ders gövdeleri ve alıştırmalar (`tools/show.py` ile çıkarıldı), `data/manifest.json` (8 veri seti)
Yöntem: Her patika, o rolün kıdemli uzmanının gözüyle incelendi. İşe girmek ve ilk 6 ayda verimli olmak için gereken beceriler muadil programlar ve iş ilanlarıyla karşılaştırıldı. Konu kapsamı ders başlıkları üzerinden ve tüm ders metninde anahtar kelime taramasıyla doğrulandı. "Yalnız anılıyor" diye işaretlenen konular, derste bir iki cümleyle geçen ama alıştırması olmayan konulardır.
Öncelik etiketleri: **Kritik** (bu olmadan işe alım mülakatı ya da ilk ay zorlanır), **Önemli** (ilk 6 ayda mutlaka karşılaşılır), **İyi olur** (fark yaratır).

---

## 0. Yönetici özeti: tüm patikaları kesen bulgular

1. **8 veri seti hiçbir derste kullanılmıyor.** Ders metinlerinde ve alıştırmalarda `import veri`, `veri.oku`, `veri.baglan` sıfır kez geçiyor. `anadolu_bank`, `pusula_ik`, `lezzet_kurye`, `kanat_havayollari`, `pedal_izmir`, `kesit_bi` ve `kirli_veri` adları da hiçbir derste yok. `anadolu_market` yalnız `django-giris` ve `pytest` derslerinde, o da ad olarak geçiyor. Projeler (proje-ileri, proje-ml) bile satır içi küçük ya da sentetik veri üretiyor. En az emekle en çok değer bunu düzelterek kazanılır: ileri seviyedeki veri derslerinde ve bitirme projelerinde gerçek tablolar kullanılmalı (bkz. Ekle-1, Ekle-27…29).
2. **4 ders hiçbir patikada yok:** `proje-orta` (Anadolu Bank işlem analizi, orta seviyenin en iyi projelerinden), `kurulum-araclar`, `kutuphane-turu`, `metaprogramlama`.
3. **Veri rollerinde SQL derinliği eksik.** SQL, veri analisti ilanlarının bir numaralı becerisi ve Google, IBM, DataCamp programlarının hepsinde ayrı bir ders. PythonPatika'da yalnız `sqlite-python` var. Pencere fonksiyonları, CTE ve pandas ile SQL arasında çeviri kalıpları derste anılıyor ama alıştırması yok. Kardeş uygulama SQLPatika dili öğretiyor, ama "Python'dan SQL ile analiz" köprüsü kurulmamış.
4. **İleri konuların çoğu yalnız anılıyor.** MLflow, Celery/RQ, Kubernetes, Streamlit, ARIMA, XGBoost/LightGBM, dbt, Great Expectations/pandera, Playwright, OAuth2/JWT, Alembic, embedding ve vektör veritabanı derslerde bir iki cümleyle geçiyor. Hiçbirinin uygulamalı bölümü ya da alıştırması yok. Bunlar ilgili rollerin ilk 6 ayında doğrudan karşılaşılan konular.
5. **Hiç olmayan konular:** feature engineering (ayrı ders olarak), SHAP/PDP, derin öğrenme (PyTorch veya numpy ile sinir ağı), MLOps izleme ve veri kayması, PostgreSQL'e özgü konular (psycopg, COPY, EXPLAIN), Redis/önbellek stratejileri, mesaj kuyruğu ve akış işleme (Kafka), bulut nesne depolama (S3/boto3), veri modelleme (yıldız şema, Kimball), gözlemlenebilirlik (metrik, iz, SLO), sistem tasarımı, ajanlar ve MCP, Google Sheets/IMAP/Teams entegrasyonu, PDF'ten tablo çıkarma, LeetCode'daki ağaç, trie, aralık ve 2B DP kalıpları, veri rolü mülakatı (SQL, pandas ve ürün metriği vaka soruları).
6. **Patika tutarlılığı sorunları:**
   - `ai` patikasında `test-ileri` var ama `test-yazma` ve `pytest` yok (ön koşul boşluğu). Patika `python-nedir` ile başlıyor ama değişken ve döngü derslerini içermiyor, ön koşulu belirsiz.
   - `ml` patikasında `docker-deploy`, `fastapi`'den önce geliyor (servis yazılmadan dağıtım). Git, pytest, logging ve SQL yok.
   - `web` patikasında `async`, `fastapi`'den sonra geliyor (FastAPI async uç noktalarını kullanıyor).
   - `muhendis` patikasında `pandas-groupby` yok, bitirme projesi yok.
   - `bilimci` patikasında SQL hiç yok.
   - `otomasyon` patikasında pivot ve groupby yok (Excel'in yerini alan asıl iş). `logging` de yok, oysa gözetimsiz çalışan betikler için şart.
   - `kod-stili` yalnız `genel` patikasında; `mulakat-hazirlik` yalnız `sertifika` patikasında.
7. **Tarayıcı kısıtı (Pyodide 0.27.8).** Önerilerin çoğu tarayıcıda çalıştırılabilir: sqlite3, DuckDB, polars, pyarrow, scikit-learn, statsmodels, numpy, networkx, SQLAlchemy, pydantic ve jinja2 Pyodide'de bulunuyor (`tools/pyodide_verify.mjs` ile doğrulanmalı). Spark, Kafka, Redis, PostgreSQL, PyTorch, Streamlit, Celery ve boto3 tarayıcıda çalışmaz. Bunlar için ders metninde **gösterim kodu** verilmeli, alıştırmalar ise aynı sözleşmeyi taklit eden **saf Python sahteleriyle** yazılmalı: dict tabanlı FakeRedis, `asyncio.Queue` ile kuyruk, DuckDB ile Spark SQL eşdeğeri, numpy ile sinir ağı, moto benzeri sahte S3 sınıfı. Mevcut `llm-api` dersi sahte istemciyle bunu zaten iyi yapıyor; aynı kalıp sürdürülmeli.

**Sayısal özet:** 24 yeni ders önerisi (Bölüm 11), 30 "mevcut derse ekle" önerisi (Bölüm 12) ve her patika için ekleme, çıkarma ve sıra düzeltmeleri (Bölüm 1–10, (c) maddeleri).

---

## 1. Python Temelleri (`genel`): kıdemli Python eğitmeni ve işe alım yöneticisi gözüyle

### 1.1 Gereken beceriler (giriş seviyesi her rol)
Söz dizimi ve veri yapıları; kontrol akışı; fonksiyon ve kapsam; dosya, CSV ve JSON; hata yönetimi; modül, paket, venv ve pip; temel OOP; Git ile çalışmak; basit test; temiz kod ve PEP 8; hata ayıklama. Kaynaklar: Real Python Core Language Basics ve Intermediate yolları, roadmap.sh Python, HackerRank Python (Basic) beceri listesi (kontrol akışı, fonksiyon, string ve koleksiyon, yineleme, modüler tasarım, sınıf ve nitelik, yerleşik fonksiyonlar), PCEP.

### 1.2 Karşılık ve eksikler
- **Var ve güçlü:** Temel seviyenin tamamı (32 ders) + kapsamli-ifadeler, iteratorler-uretecler, fonksiyonel, moduller-paketler, sanal-ortam-pip, siniflar-oop.
- **Önemli:** Git (`git-proje-yapisi`) ve test (`test-yazma`) patikada yok. Real Python ve DataCamp gibi muadil yollarda bu ikisi temelin parçası.
- **Önemli:** `json-csv`, `collections-itertools`, `dataclass-typing` ve `dekoratorler` yok. "Pythonic çekirdek" vaadiyle tutarsız; HackerRank Python (Intermediate) dekoratör ve koleksiyon konularını soruyor.
- **İyi olur:** `kurulum-araclar` hiçbir patikada yok. kurulum-windows ve kurulum-macos-linux ile büyük ölçüde örtüşüyor.

### 1.3 Düzeltme
- (c) Patikaya ekle: `dekoratorler`, `dataclass-typing`, `collections-itertools`, `json-csv`, `test-yazma`, `git-proje-yapisi`, `proje-orta` (sona, orta seviye bitirme olarak).
- (c) `kurulum-araclar`: ya genel patikada kurulum-macos-linux ile vscode arasına girsin, ya da üç kurulum dersi birleştirilsin. Hiçbir patikada olmayan bir dersin sırada durması kafa karıştırıyor.
- (c) `kutuphane-turu` genel patikanın sonuna (sanal-ortam-pip'ten sonra) eklenmeli; tüm rollere "hangi iş için hangi paket" haritası veriyor.

### 1.4 Mülakat ve portföy
Mülakat: değişebilir ve değişmez türler, `is` ile `==` farkı, değişebilir varsayılan argüman, liste ile demet farkı, sözlüğün neden hızlı olduğu, `*args`/`**kwargs`, comprehension ile üreteç farkı, EAFP, `__name__ == "__main__"`.
Portföy: `kirli_veri` tablolarını (bayi, musteri, urun) saf Python ile temizleyip rapor yazan bir CLI. Ardından `anadolu_market.orders` ve `order_items` ile `proje-temel`'in gerçek veriyle çalışan sürümü (`veri.kayitlar` pandas'sız çalışır).

---

## 2. Veri Analisti (`analist`): 8 yıllık lead data analyst gözüyle

### 2.1 Gereken beceriler
1. **SQL** (JOIN, GROUP BY, CTE, pencere fonksiyonları): ilanların bir numaralı becerisi. Google Data Analytics, IBM ve DataCamp'te ayrı ders; roadmap.sh data-analyst'te çekirdek konu.
2. Excel ya da Sheets (pivot, formül) ve bir BI aracı (Power BI ya da Tableau). Türkiye ilanlarında Power BI baskın.
3. pandas ile temizleme, birleştirme, gruplama ve yeniden şekillendirme.
4. **Keşifsel veri analizi (EDA):** DataCamp Data Analyst in Python'da ayrı ders, Google Advanced'te modül.
5. Betimsel istatistik, örnekleme, hipotez testi ve A/B testi (DataCamp: Sampling ve Hypothesis Testing ayrı dersler).
6. **İş metrikleri:** KPI, kohort ve tutundurma, huni, RFM, LTV.
7. Görselleştirme ve veri hikâyesi (Google: "Share Data Through the Art of Visualization").
8. Paydaş iletişimi, problem çerçeveleme ("Ask Questions…") ve vaka çalışması portföyü (Google Capstone).
9. Tekrarlanabilir rapor otomasyonu (notebook'tan rapora, zamanlanmış rapor).

### 2.2 Karşılık ve eksikler

| Beceri | PythonPatika karşılığı | Durum | Öncelik |
|---|---|---|---|
| SQL | sqlite-python (pencere fonksiyonu yalnız anılıyor), polars-duckdb (DuckDB'ye SQL) | **Yüzeysel**: CTE, LAG/LEAD, ROW_NUMBER, tarih aralığı, pandas↔SQL çevirisi için alıştırma yok | **Kritik** |
| pandas | pandas-giris/temizlik/groupby/ileri/zaman-serisi | Güçlü | – |
| EDA iş akışı | Ayrı ders yok ("keşifsel" yalnız jupyter-colab'da geçiyor) | **Eksik** | **Kritik** |
| İş metrikleri | proje-ileri (RFM, kohort), ml-kumeleme (RFM) | **Kısmi**: huni, tutundurma eğrisi, LTV, YoY/MoM köprüsü, Pareto ve katkı analizi yok | **Kritik** |
| A/B testi | istatistik (A/B bölümü, güç analizi) | İyi; SRM kontrolü, peeking ve CUPED yok | Önemli |
| Görselleştirme | gorsellestirme, seaborn-plotly | İyi; pano (Streamlit/Dash) ve veri hikâyesi yalnız anılıyor | Önemli |
| Power BI ve Excel köprüsü | excel-otomasyon; Power BI 2 derste anılıyor | **Eksik**: yıldız şema hazırlama, Power BI Python betiği, Excel'de Python | Önemli |
| Veri modelleme (yıldız şema) | Yok | **Eksik** (kesit_bi seti tam bunun için var) | Önemli |
| Mülakat | mulakat-hazirlik algoritma odaklı | **Eksik**: SQL/pandas canlı soruları, ürün metriği vaka soruları | **Kritik** |
| Git ve tekrarlanabilirlik | Patikada yok | Eksik | Önemli |

### 2.3 Düzeltme
- (a) Yeni: `sql-analitik`, `eda-kesifsel`, `is-metrikleri`, `veri-mulakat`, `veri-modelleme` (Bölüm 11).
- (b) Ekle: istatistik → SRM, peeking, CUPED (Ekle-2); seaborn-plotly → pano ve veri hikâyesi (Ekle-3); excel-otomasyon → Power BI ve Excel'de Python köprüsü (Ekle-4); jupyter-colab → notebook'tan rapora (Ekle-30); ml-kumeleme → market sepeti (Ekle-7).
- (c) Patikaya ekle: `git-proje-yapisi`, `hata-ayiklama`, `proje-orta` ve yeni dersler. İsteğe bağlı çıkarma: `dataclass-typing` (analist için düşük getiri; yeri `eda-kesifsel`'e verilebilir).
- (c) Önerilen sıra: … `sqlite-python` → `sql-analitik` (pandas-groupby'dan hemen sonra) → … `istatistik` → `is-metrikleri` → `eda-kesifsel` (gorsellestirme ve seaborn'dan sonra, istatistikten önce) → `veri-modelleme` → `polars-duckdb` → `veri-boru-hatti` → `proje-ileri` → `veri-mulakat`.

### 2.4 Mülakat konuları ve portföy
**Mülakat:** SQL'de ikinci en yüksek maaş, departman içi sıralama, ardışık günler, aylık tutundurma ve kohort, hareketli ortalama; LEFT JOIN ile satır çoğalması; NULL ile COUNT davranışı. pandas'ta merge ile join farkı, groupby + transform, pivot ile melt, tekrarlı kayıt. İstatistikte p-değerinin yorumu, güven aralığı, Simpson paradoksu, korelasyon ile nedensellik farkı. Vaka: "Sipariş sayısı %10 düştü, nasıl araştırırsın?" (metrik ağacı, segment kırılımı, mevsimsellik, veri hatası). Ürün metrikleri: DAU, dönüşüm, AOV, churn.
**Portföy (veri setleriyle):**
1. **Anadolu Market ticari performans raporu.** Kaynak: `orders`, `order_items`, `products`, `customers`. İçerik: ciro ve kâr (price−cost), kategori ve kanal kırılımı, YoY/MoM, kohort tutundurma ısı haritası, RFM segmentleri. Çıktı: HTML rapor ve yönetici özeti.
2. **Huni ve A/B testi.** `web_events` ile huni dönüşüm oranları, `ab_test` ile SRM kontrolü, oran testi ve gelir farkı için bootstrap. Sonuç bir karar notu olarak yazılır.
3. **Pusula İK işten ayrılma analizi.** `ik_employees` (term_date, term_reason), `ik_reviews`, `ik_survey` (eNPS), `ik_salaries`: departman ve kıdem bazında ayrılma oranı, ücret bandı konumu, eNPS ile ayrılma ilişkisi.
4. **Kanat Havayolları zamanında kalkış (OTP) analizi.** `hv_flights` ve `hv_delays`: rötar nedeni Pareto, rota ve uçak bazında OTP, doluluk (pax/seats).
5. **Kirli veri temizlik hattı.** `kirli_veri` → temiz tablo → `kesit_bi` yıldız şemasına uygun CSV (PBIPatika'ya köprü).

---

## 3. Veri Bilimci (`bilimci`): kıdemli/lead data scientist gözüyle

### 3.1 Gereken beceriler
SQL ile veri çekme (IBM DS: "Databases and SQL for Data Science"); EDA; istatistik ve deney tasarımı; **feature engineering** (Miuul ML bootcamp'te ayrı modül: aykırı, eksik, kodlama, ölçekleme, özellik çıkarma; Google Advanced'te ayrı başlık); denetimli ve denetimsiz öğrenme, ağaç toplulukları, dengesiz veri; model değerlendirme ve açıklanabilirlik; zaman serisi tahmini; derin öğrenmeye giriş; iş problemini modele çevirme ve sonucu anlatma; Git ve notebook disiplini.

### 3.2 Karşılık ve eksikler

| Beceri | Karşılık | Durum | Öncelik |
|---|---|---|---|
| SQL | Patikada hiç yok | **Eksik** | **Kritik** |
| EDA | Yok | **Eksik** | **Kritik** |
| Feature engineering | proje-ml içinde bir bölüm; pandas-temizlik (cut/qcut) | **Yüzeysel**: hedef kodlama, lag ve grup özellikleri, sızıntısız özellik üretimi ve özellik seçimi yok | **Kritik** |
| Ağaç toplulukları ve boosting | ml-regresyon-siniflandirma ("Ağaçlar ve topluluklar"; XGBoost ve LightGBM yalnız anılıyor) | Kısmi | Önemli |
| Açıklanabilirlik | permutation_importance (ml-regresyon, proje-ml) | **Yüzeysel**: PDP/ICE, SHAP, hata dilimi analizi yok | Önemli |
| Zaman serisi tahmini | pandas-zaman-serisi ("Tahmine giriş"; ARIMA ve ETS yalnız anılıyor), TimeSeriesSplit (ml-pipeline) | **Yüzeysel** | Önemli |
| Derin öğrenme | Yok (PyTorch yalnız python-nedir'de anılıyor) | **Eksik** | Önemli |
| Deney tasarımı | istatistik | İyi | – |
| Hiperparametre arama | GridSearch ve RandomizedSearch | İyi; Optuna/Bayes arama yok | İyi olur |
| Öneri sistemleri, market sepeti | Yok | Eksik | İyi olur |
| Git | Patikada yok | Eksik | Önemli |

### 3.3 Düzeltme
- (a) Yeni: `sql-analitik`, `eda-kesifsel`, `ozellik-muhendisligi`, `zaman-serisi-tahmin`, `derin-ogrenme-giris`, `is-metrikleri`, `veri-mulakat`.
- (b) Ekle: ml-pipeline-degerlendirme → açıklanabilirlik (PDP, SHAP kavramı, hata dilimleri, adalet) ve Optuna (Ekle-5, Ekle-6); ml-kumeleme → market sepeti ve öneri (Ekle-7).
- (c) Patikaya ekle: `sqlite-python`, `git-proje-yapisi`, `mulakat-hazirlik`, `llm-api` (2026'da veri bilimcilerden LLM ile metin sınıflandırma ve özetleme bekleniyor; IBM DS sertifikasına "Generative AI" dersi eklendi). İsteğe bağlı çıkarma: `ozyineleme` (veri bilimi için düşük getiri).
- (c) Sıra: `ml-giris` → `ml-regresyon-siniflandirma` → `ozellik-muhendisligi` → `ml-pipeline-degerlendirme` → `ml-kumeleme` → `zaman-serisi-tahmin` → `derin-ogrenme-giris` → `nlp-metin`.

### 3.4 Mülakat ve portföy
**Mülakat:** yanlılık ile varyans dengesi; düzenlileştirme (L1 ile L2); veri sızıntısı örnekleri; dengesiz sınıfta hangi metrik (PR-AUC, eşik); çapraz doğrulama türleri (zaman serisinde neden rastgele bölünmez); boosting ile bagging farkı; özellik önemi tuzakları; A/B testinde güç ve örneklem; "modeli iş birimine nasıl anlatırsın?"; take-home: churn ya da talep tahmini.
**Portföy:**
1. **Pedal İzmir saatlik talep tahmini.** `bk_trips` saatlik toplanır, `bk_weather` ile birleştirilir; özellikler: saat, gün, kıyı istasyonu, yağış, sıcaklık. Önce naive ve seasonal-naive temel çizgisi, sonra ETS ve gradient boosting; TimeSeriesSplit ile geriye dönük test (backtest); istasyon düzeyinde yeniden dengeleme önerisi.
2. **Pusula İK işten ayrılma (attrition) modeli.** `ik_employees` + `ik_reviews` + `ik_salaries` (bant içi konum, son zamdan geçen süre) + `ik_leaves` + `ik_survey`; zaman bazlı bölme; SHAP ile açıklama; adalet kontrolü (cinsiyet ve yaş grubu hata oranları).
3. **Anadolu Bank anomali ve dolandırıcılık taraması.** `bank_txns`: hesap bazında z-skoru ve IsolationForest; merchant_category profili; `bank_fx` ile TL'ye çevirme.
4. **Lezzet Kurye yorum duygu analizi.** `lk_ratings.comment`: TF-IDF + lojistik regresyon; food_score'u zayıf etiket olarak kullanma.

---

## 4. Makine Öğrenmesi (`ml`): staff ML engineer gözüyle

### 4.1 Gereken beceriler
DataCamp ML Engineer patikası şu sırayı izliyor: denetimli öğrenme, MLOps kavramları, kabuk (shell), MLOps dağıtım ve yaşam döngüsü, **MLflow**, ETL/ELT, Great Expectations ile **veri kalitesi**, **DVC** ile veri sürümleme, **ML izleme** (kavram ve Python), Docker, **ML için CI/CD**. Bunlara ek olarak sağlam yazılım mühendisliği (test, paketleme, API), feature engineering, derin öğrenme temelleri (PyTorch), model servisleme (toplu ve çevrim içi) ve bulut temelleri gerekiyor. 2026 ilanları LLM/RAG deneyimini de sık istiyor (Kariyer.net Qlteq AI Engineer ilanı: FastAPI, pydantic, pandas, scikit-learn, RAG, vektör veritabanı, Docker, Git).

### 4.2 Karşılık ve eksikler

| Beceri | Karşılık | Durum | Öncelik |
|---|---|---|---|
| scikit-learn ve pipeline | ml-giris, ml-regresyon, ml-pipeline, ml-kumeleme | Güçlü | – |
| Feature engineering | proje-ml'de kısmen | Yüzeysel | **Kritik** |
| Deney takibi ve model kaydı (MLflow) | ml-pipeline'da bir cümle | **Eksik** | **Kritik** |
| İzleme ve veri kayması (PSI/KS) | proje-ml'de bir cümle | **Eksik** | **Kritik** |
| Model servisleme | fastapi + joblib (ayrı derslerde, bağlanmamış) | Kısmi | Önemli |
| Derin öğrenme | Yok | **Eksik** | Önemli |
| Veri kalitesi ve sürümleme (GE/pandera, DVC) | veri-boru-hatti'nda anılıyor; patikada değil | Eksik | Önemli |
| Test, Git, logging | Patikada yok | **Eksik** | **Kritik** |
| Kabuk ve Linux | terminal-temelleri patikada değil | Eksik | Önemli |
| Bulut (S3, servisleme) | Yok | Eksik | Önemli |
| Embedding ve vektör arama | llm-api ve nlp-metin'de kavramsal | Yüzeysel | Önemli |
| Zaman serisi tahmini | Yüzeysel | – | Önemli |

### 4.3 Düzeltme
- (a) Yeni: `ozellik-muhendisligi`, `mlops-yasam-dongusu`, `derin-ogrenme-giris`, `zaman-serisi-tahmin`, `embedding-vektor-arama`, `bulut-temelleri`, `gozlemlenebilirlik`.
- (b) Ekle: ml-pipeline → açıklanabilirlik ve Optuna (Ekle-5, Ekle-6); kalite-ci → CD ve model artefaktı (Ekle-15); proje-ml → gerçek `anadolu_bank` tabloları, servisleme ve izleme (Ekle-28).
- (c) Patikaya ekle: `terminal-temelleri`, `git-proje-yapisi`, `test-yazma`, `pytest`, `logging`, `sqlite-python`, `pydantic-dogrulama`, `veri-boru-hatti`.
- (c) **Sıra hatası:** `fastapi` (şu an docker-deploy'dan sonra) `docker-deploy`'dan önceye alınmalı. `llm-api` → `performans` geçişi de geriye sarıyor; performans, ML bloğundan önce gelmeli.
- Önerilen son sıra: … `ml-kumeleme` → `zaman-serisi-tahmin` → `derin-ogrenme-giris` → `nlp-metin` → `embedding-vektor-arama` → `llm-api` → `fastapi` → `docker-deploy` → `mlops-yasam-dongusu` → `bulut-temelleri` → `kalite-ci` → `proje-ml`.

### 4.4 Mülakat ve portföy
**Mülakat:** eğitim ile servisleme arasındaki çarpıklık (training-serving skew); toplu ve çevrim içi tahmin; model sürümleme; veri kayması ile kavram kayması farkı ve tespiti; yeniden eğitim stratejisi; özellik deposunun neden gerektiği; gecikme ve maliyet ödünleşimi; A/B testiyle model yayını (shadow, canary); ML sistem tasarımı ("kurye varış süresi tahmini servisini tasarla").
**Portföy:**
1. **Lezzet Kurye teslim süresi (ETA) servisi.** `lk_orders` (placed_at→delivered_at), `lk_restaurants`, `lk_couriers`, `lk_order_lines`: özellik hattı, HistGradientBoosting, MLflow benzeri deney kaydı (tarayıcıda JSON kayıt defteri), FastAPI `/predict`, Dockerfile, PSI ile haftalık kayma raporu.
2. **Anadolu Bank churn modelini üretime almak.** proje-ml'i gerçek `bank_accounts` (closed_date → etiket) ve `bank_txns` özellikleriyle yeniden kurmak; model kartı ve toplu skorlama işi.
3. **Pedal İzmir talep tahmini:** zaman serisi + gözlemlenebilirlik (tahmin hatası panosu).

---

## 5. Veri Mühendisi (`muhendis`): staff data engineer gözüyle

### 5.1 Gereken beceriler
roadmap.sh data-engineer şu başlıkları sayıyor: SQL ve algoritmalar, Git, Linux, API'ler; veritabanı temelleri (OLTP/OLAP, indeks, **veri modelleme**); **veri ambarı ve göl** (data mart, şema tasarımı, bulut ambarları); ETL/ELT, ters ETL, zamanlama, idempotentlik; **Airflow, dbt, Prefect**; dağıtık sistemler ve **Spark**; **Kafka/RabbitMQ**, toplu ile akış işleme farkı; veri kalitesi, köken (lineage) ve KVKK/GDPR; **bulut**; konteyner, Kubernetes, IaC, CI/CD; izleme ve test. DataCamp Data Engineer in Python patikası "Understanding Cloud Computing" ile başlıyor; ETL/ELT, Airflow, Git ve yazılım mühendisliği ilkelerini içeriyor. Kariyer.net'teki EPAM Senior Data Engineer ilanı: ileri dbt, CTE ve pencere fonksiyonları, Kimball ve Data Vault, Great Expectations/Soda, Snowflake/BigQuery/Databricks, partitioning, Terraform; Python ve Spark "tercih sebebi".

### 5.2 Karşılık ve eksikler

| Beceri | Karşılık | Durum | Öncelik |
|---|---|---|---|
| Python ile ETL, idempotent yükleme | veri-boru-hatti (çok iyi: artımlı yükleme, CDC ve SCD2 tablosu, kalite kapıları) | Güçlü | – |
| Orkestrasyon | orkestrasyon (cron, DAG, Airflow) | İyi; Prefect/Dagster ve backfill alıştırması yok | İyi olur |
| İleri SQL | sqlite-python | **Yüzeysel** | **Kritik** |
| Veri modelleme (Kimball, yıldız şema, SCD tipleri) | veri-boru-hatti'nda SCD2 alıştırması | **Eksik** | **Kritik** |
| dbt ve ELT | Yalnız anılıyor (3 ders) | **Eksik** | **Kritik** |
| PostgreSQL (COPY, EXPLAIN, ON CONFLICT) | sqlalchemy-orm, docker-deploy'da anılıyor | Eksik | Önemli |
| Spark | polars-duckdb'de bir bölüm | Yüzeysel | Önemli |
| Akış işleme ve Kafka | Yok | **Eksik** | Önemli |
| Bulut (S3, IAM, data lake düzeni) | Yok | **Eksik** | **Kritik** |
| Veri kalitesi araçları | veri-boru-hatti'nda kalite kapısı; pandera ve GE yalnız anılıyor | Yüzeysel | Önemli |
| Parquet ve bölümlenmiş göl | polars-duckdb, veri-boru-hatti | Kısmi | Önemli |
| Gözlemlenebilirlik | orkestrasyon'da metrik bölümü | Kısmi | Önemli |
| Linux ve kabuk | terminal-temelleri | Kısmi (grep/awk/jq, ssh yok) | Önemli |
| pandas groupby | Patikada yok | Eksik | Önemli |
| Bitirme projesi | **Patikada hiç proje yok** | Eksik | **Kritik** |

### 5.3 Düzeltme
- (a) Yeni: `sql-analitik`, `veri-modelleme`, `dbt-elt`, `postgresql-python`, `spark-dagitik`, `akis-isleme`, `bulut-temelleri`, `gozlemlenebilirlik`, `veri-mulakat`.
- (b) Ekle: veri-boru-hatti → uygulamalı veri kalitesi ve sözleşmesi (Ekle-17); orkestrasyon → Airflow TaskFlow, backfill, Prefect karşılaştırması (Ekle-18); polars-duckdb → hive bölümlü göl (Ekle-19); terminal-temelleri → Linux kabuk iş akışı (Ekle-16).
- (c) Patikaya ekle: `pandas-groupby`, `kod-stili`, `mulakat-hazirlik`, `proje-orta`, `proje-ileri`. İsteğe bağlı çıkarma: `cli-araclari` (paketleme-dagitim'de argparse var).
- (c) Önerilen ileri sıra: `sql-analitik` → `postgresql-python` → `sqlalchemy-orm` → `veri-modelleme` → `polars-duckdb` → `spark-dagitik` → `veri-boru-hatti` → `dbt-elt` → `orkestrasyon` → `akis-isleme` → `bulut-temelleri` → `docker-deploy` → `gozlemlenebilirlik` → `kalite-ci` → `proje-ileri`.

### 5.4 Mülakat ve portföy
**Mülakat:** OLTP ile OLAP farkı; yıldız ile kar tanesi şeması; SCD 1, 2 ve 3; ETL ile ELT farkı; idempotent ve artımlı yükleme (watermark); geç gelen veri; tam bir kez işleme (exactly-once) neden zor; partition ile bucket farkı; Spark'ta shuffle ve skew; Parquet neden sütunsal; veri kalitesi boyutları; DAG tasarımı ve backfill; pencere fonksiyonu ve tekilleştirme SQL'i (ROW_NUMBER ile son kaydı al).
**Portföy:**
1. **Anadolu Bank artımlı ETL.** `bank_txns` (42 bin satır) günlük parçalara bölünür → watermark ile artımlı yükleme → `bank_fx` ile TL'ye çevirme → SQLite ya da DuckDB'de günlük hesap özeti mart'ı; idempotentlik testi (iki kez çalıştır, aynı sonuç).
2. **Kanat Havayolları yıldız şeması.** `hv_flights` olgu tablosu; `hv_routes`, `hv_aircraft` ve `hv_airports` boyutları (tz_offset ile UTC normalizasyonu); dbt tarzı staging, intermediate ve mart katmanları ve testler (unique, not_null, relationships).
3. **Pedal İzmir veri gölü.** `bk_trips` (117 bin satır) `yil=…/ay=…/` biçiminde bölümlü Parquet'e yazılır; DuckDB ile bölüm budamalı (partition pruning) sorgu; `bk_maintenance` ile SCD2 bisiklet durumu.
4. **CDC ve upsert.** `anadolu_market.price_updates` ve `raw_signups`: fiyat değişikliğini SCD2 ürün boyutuna işleme, kirli kayıtları karantina tablosuna yazma.

---

## 6. Backend Geliştirici (`backend`): staff backend engineer gözüyle

### 6.1 Gereken beceriler
roadmap.sh backend şu başlıkları sayıyor: internet, HTTP ve DNS; Git; web sunucuları (Nginx); **ilişkisel veritabanı** (PostgreSQL: indeks, normalizasyon, transaction, migration) ve **NoSQL/Redis**; replikasyon, sharding ve CAP; REST, GraphQL, gRPC, OpenAPI, **WebSocket ve SSE**; **kimlik doğrulama** (JWT, OAuth 2.0, cookie, OpenID); web güvenliği (CORS, CSP, TLS, OWASP); **önbellek**; test; CI/CD; mimari ve **mesajlaşma** (RabbitMQ, Kafka); konteyner ve Kubernetes; **gözlemlenebilirlik** ve dayanıklılık (circuit breaker, backpressure); backend'de yapay zekâ (LLM, embedding, tool use, MCP, RAG). Türkiye ilanları: Techcareer Python Backend ilanında derin Django bilgisi, AWS, Docker ve Kubernetes zorunlu; FastAPI ve Flask artı. Uluslararası ilanlarda Django, PostgreSQL, Redis, Celery ve Docker kombinasyonu tipik.

### 6.2 Karşılık ve eksikler

| Beceri | Karşılık | Durum | Öncelik |
|---|---|---|---|
| OOP, tasarım kalıpları, tip sistemi | 8+ ders | Çok güçlü | – |
| REST API tasarımı | api-web (idempotency, ETag, problem+json), fastapi, flask | Güçlü | – |
| Django | django-giris (tek ders; DRF bir bölüm) | **Yüzeysel** (Türkiye'de baskın çatı) | **Kritik** |
| PostgreSQL | Anılıyor | **Eksik** | **Kritik** |
| Kimlik doğrulama ve yetkilendirme | fastapi'de bir paragraf (OAuth2 + JWT), web-guvenlik'te JWT, proje-api'de HMAC token | **Yüzeysel**: refresh token, RBAC ve OAuth akışları yok | **Kritik** |
| Önbellek ve Redis | Anılıyor | **Eksik** | **Kritik** |
| Arka plan işleri (Celery/RQ) | fastapi'de "BackgroundTasks yetmez" uyarısı | **Eksik** | **Kritik** |
| Migration (Alembic) | "gösterim" | Yüzeysel | Önemli |
| WebSocket ve SSE | Yok | Eksik | Önemli |
| Gözlemlenebilirlik (metrik, iz, SLO) | logging iyi; metrik ve iz yok | Eksik | Önemli |
| Sistem tasarımı | mulakat-hazirlik'te bir bölüm | Yüzeysel | Önemli |
| Mesaj kuyrukları ve olay güdümlü mimari | Yok | Eksik | Önemli |
| Bulut ve Kubernetes | docker-deploy'da anılıyor | Eksik | Önemli |
| Test (entegrasyon, DB) | test-yazma, pytest, test-ileri | İyi; gerçek DB'li entegrasyon testi yok | Önemli |

### 6.3 Düzeltme
- (a) Yeni: `postgresql-python`, `kimlik-yetki`, `redis-kuyruk`, `django-ileri`, `gozlemlenebilirlik`, `sistem-tasarimi`, `bulut-temelleri`, `akis-isleme` (İyi olur).
- (b) Ekle: fastapi → WebSocket, SSE, sayfalama ve hız sınırı (Ekle-11); sqlalchemy-orm → Alembic iş akışı ve async oturum (Ekle-13); docker-deploy → Nginx ve Kubernetes temelleri (Ekle-14); test-ileri → DB'li entegrasyon testi ve yük testi (Ekle-22); web-guvenlik → güvenlik başlıkları ve SSRF (Ekle-23); proje-api → Postgres, Redis ve arka plan işi (Ekle-29).
- (c) Patikaya ekle: `kod-stili`, `mulakat-hazirlik`. Patika 47 derse çıkıyor; yer açmak için `sablon-rapor`, `coklu-kalitim` (PCAP odaklı) ve `regex` isteğe bağlı yapılabilir.
- (c) Sıra: `postgresql-python`, `sqlalchemy-orm`'dan önce; `kimlik-yetki`, `web-guvenlik`'ten önce; `redis-kuyruk` ve `django-ileri`, `django-giris`'ten sonra; `sistem-tasarimi`, `proje-api`'den önce.

### 6.4 Mülakat ve portföy
**Mülakat:** HTTP metodlarında idempotentlik; REST durum kodları; N+1 problemi; transaction izolasyon seviyeleri ve yarış durumu (stok düşme); indeks ne zaman işe yaramaz; önbellek geçersizleştirme (invalidation) stratejileri; JWT ile oturum farkı ve token iptali; OAuth2 authorization code + PKCE; GIL ve async ile thread seçimi; Celery'de yeniden deneme ve idempotent görev; hız sınırlayıcı tasarımı; sistem tasarımı (URL kısaltıcı, bildirim servisi); Django ORM'de select_related ile prefetch_related farkı; DRF serializer doğrulaması.
**Portföy:**
1. **Kanat Havayolları rezervasyon API'si.** `hv_flights`, `hv_bookings` (seat), `hv_passengers`: uçuş arama (sayfalama, filtre), koltuk kilitleme (SELECT FOR UPDATE ya da iyimser kilit), idempotency anahtarı, tier'a göre RBAC, Redis önbellekli uçuş arama, onay e-postası için arka plan işi.
2. **Lezzet Kurye sipariş durum makinesi ve canlı takip.** `lk_orders.status` geçişleri, kurye atama kuyruğu, WebSocket ya da SSE ile durum yayını, metrikler (p95 gecikme).
3. **Anadolu Market Sipariş API'si** (mevcut proje-api) PostgreSQL, Alembic, Redis ve Docker Compose ile üretim düzeyine taşınır.

---

## 7. Web Geliştirici (`web`): kıdemli full-stack Python geliştirici gözüyle

### 7.1 Gereken beceriler
Backend'in tamamı ve ek olarak: Django (MVT, ORM, admin, formlar, auth, DRF), şablonlar, oturum ve cookie, CSRF, dosya yükleme, statik dosyalar; temel HTML, CSS ve JavaScript (fetch, DOM), sunucu tarafı oluşturma ve HTMX; dağıtım (Nginx, gunicorn/uvicorn, PaaS). Real Python yolları: "Become a Python Web Developer", "Flask by Example", "Django for Web Development".

### 7.2 Karşılık ve eksikler
- Flask, FastAPI, django-giris ve web-guvenlik iyi. **Kritik:** Django tek derse sığmış; Türkiye'deki ilanların çoğunluğu Django + DRF istiyor (`django-ileri`).
- **Kritik:** Kimlik doğrulama akışları (`kimlik-yetki`).
- **Önemli:** Ön yüz temeli (HTML formu, fetch, HTMX) yok. Python full-stack ilanları en azından şablon, form ve az JS istiyor (Ekle-12).
- **Önemli:** WebSocket yok (Ekle-11). PostgreSQL ve Redis yok.
- **Önemli:** Patikada `hata-tasarim`, `logging` ve `test-yazma` yok (yalnız pytest var).
- Sıra hatası: `async`, `web-guvenlik`'ten sonra geliyor; FastAPI'den önce olmalı.

### 7.3 Düzeltme
- (a) Yeni: `django-ileri`, `kimlik-yetki`, `postgresql-python`, `redis-kuyruk`.
- (b) Ekle: flask/django-giris → HTMX ve temel ön yüz (Ekle-12); fastapi → WebSocket (Ekle-11); docker-deploy → Nginx ve PaaS'a gerçek dağıtım (Ekle-14).
- (c) Patikaya ekle: `hata-tasarim`, `logging`, `test-yazma`, `web-scraping` (İyi olur). `async`, `api-web`'den hemen önceye taşınmalı.

### 7.4 Mülakat ve portföy
**Mülakat:** istek-yanıt yaşam döngüsü; WSGI ile ASGI farkı; Django middleware; ORM optimizasyonu; CSRF ve XSS savunması; cookie bayrakları (HttpOnly, Secure, SameSite); oturum mu token mı; statik ve medya dosyaları; dağıtım (reverse proxy, worker sayısı).
**Portföy:**
1. **Pusula İK izin talep portalı (Django).** `ik_employees` (manager_id hiyerarşisi), `ik_leaves`: çalışan izin talep eder, yönetici onaylar (rol tabanlı yetki), admin paneli, HTMX ile anlık bakiye, DRF ile mobil API.
2. **Kanat uçuş arama sitesi.** FastAPI + Jinja2 + HTMX; `hv_airports` için otomatik tamamlama.

---

## 8. Yapay Zekâ ile Python (`ai`): kıdemli AI/LLM engineer gözüyle

### 8.1 Gereken beceriler
roadmap.sh AI Engineer: önceden eğitilmiş modelleri kullanma; sağlayıcı API'leri, token ve fiyatlandırma; **yapay zekâ güvenliği** (istem enjeksiyonu, önyargı, gizlilik, moderasyon); açık modeller (Hugging Face, **Ollama**); **embedding** (anlamsal arama, sınıflandırma, anomali); **vektör veritabanları** (Chroma, FAISS, Pinecone; indeksleme, benzerlik araması); **RAG** (chunking, getirme, üretim; LangChain ve LlamaIndex); istem mühendisliği, ReAct, **araç çağırma ve ajanlar**; çok modlu yapay zekâ. Kariyer.net ve Techcareer ilanları: FastAPI ve pydantic, RAG, vektör veritabanı ve pgvector, LangChain, SQL ve SQLAlchemy, Docker, Git, AI kod asistanlarını (Cursor, Claude Code, Copilot) günlük kullanım; n8n ve Make gibi otomasyon araçları, webhook, ERP ve CRM entegrasyonu; Celery ve Redis tercih sebebi.

### 8.2 Karşılık ve eksikler

| Beceri | Karşılık | Durum | Öncelik |
|---|---|---|---|
| LLM API, yapılandırılmış çıktı, araç çağırma, maliyet | llm-api (çok iyi, sahte istemciyle uygulamalı) | Güçlü | – |
| AI asistanıyla kod yazma | yapay-zeka-ile-kod | İyi; ajanlı kodlama iş akışı ve MCP yok | Önemli |
| Embedding ve vektör arama, chunking, hibrit arama, rerank | llm-api'de TF-IDF RAG ve kavramsal embedding bölümü | **Yüzeysel** | **Kritik** |
| Ajanlar (ReAct döngüsü, hafıza, durdurma, MCP) | Yalnız tek tur araç çağırma | **Eksik** | **Kritik** |
| LLM değerlendirme ve gözlemlenebilirlik | llm-api ve yapay-zeka-ile-kod'da birer bölüm | Kısmi | Önemli |
| Açık ve yerel modeller (HF, Ollama) | nlp-metin'de pipeline gösterimi | Yüzeysel | Önemli |
| SQL (text-to-SQL, pgvector) | Patikada SQL yok | Eksik | Önemli |
| Entegrasyon (webhook, Sheets, Teams, e-posta) | http-api; patikada entegrasyon yok | Eksik | Önemli |
| Test temeli | test-ileri var, **pytest ve test-yazma yok** | Ön koşul boşluğu | **Kritik** |
| Docker ve dağıtım | Patikada yok | Eksik | Önemli |
| Güvenlik (istem enjeksiyonu, KVKK) | llm-api'de bölüm | İyi | – |

### 8.3 Düzeltme
- (a) Yeni: `embedding-vektor-arama`, `llm-ajanlar`, `entegrasyon-saas`, `sql-analitik` (text-to-SQL için).
- (b) Ekle: llm-api → açık ve yerel modeller, sağlayıcıdan bağımsız soyutlama, SSE ile akış (Ekle-9); yapay-zeka-ile-kod → ajanlı kodlama ve MCP (Ekle-10).
- (c) Patikaya ekle: `test-yazma`, `pytest` (test-ileri'den önce), `logging`, `sqlite-python`, `docker-deploy`, `redis-kuyruk` (İyi olur). Çıkar: `python-nedir` (yerine patika açıklamasına "Ön koşul: Python Temelleri" notu). İsteğe bağlı çıkarma: `ml-giris` (embedding dersinde gereken ML sezgisi verilecek).
- (c) Sıra: `async` → `numpy` geriye sarıyor; numpy ve pandas başa alınmalı. Önerilen: … `pandas-giris` → `sqlite-python` → `nlp-metin` → `llm-api` → `embedding-vektor-arama` → `llm-ajanlar` → `yapay-zeka-ile-kod` → `fastapi` → `docker-deploy` → `test-ileri`.
- (c) Patikanın bitirme projesi `proje-ml` (churn) AI rolüne uymuyor. `llm-ajanlar` dersinin "Mini proje" alıştırması AI bitirmesi olarak tasarlansın, `proje-api` de patikaya eklensin.

### 8.4 Mülakat ve portföy
**Mülakat:** RAG ile ince ayar (fine-tuning) farkı ve hangisi ne zaman; chunk boyutu ve örtüşme; hibrit arama; getirme kalitesinin ölçülmesi (recall@k, MRR); halüsinasyonu azaltma; istem enjeksiyonu savunması; token maliyetini düşürme (önbellek, küçük model yönlendirme); yapılandırılmış çıktı doğrulama ve yeniden deneme; ajan döngüsünü sonlandırma ve araç yetkisi; LLM değerlendirmesi (altın set, LLM-as-judge yanlılığı); KVKK ve kişisel veri maskeleme.
**Portföy:**
1. **Anadolu Market text-to-SQL asistanı.** `veri.baglan("anadolu_market")` şeması istemle verilir → LLM SQL üretir → yalnız SELECT'e izin veren ve tablo listesini doğrulayan bekçi katmanı (guardrail) → sonuç tablosu ve doğal dil özeti; 30 soruluk altın setle doğruluk ölçümü (sahte istemciyle tarayıcıda çalışır).
2. **Lezzet Kurye yorum sınıflandırıcı.** `lk_ratings.comment` → pydantic şemalı yapılandırılmış çıktı (konu, duygu, aciliyet) → `food_score` ve `courier_score` ile tutarlılık kontrolü → haftalık özet.
3. **Pusula İK politika asistanı (RAG).** Kurgusal izin ve yan hak yönetmeliği metni + `ik_leaves` istatistikleri; embedding ile arama, kaynak gösterimi ve "bilmiyorum" davranışı.

---

## 9. Otomasyon ve Ofis (`otomasyon`): kıdemli RPA ve iş süreçleri otomasyon uzmanı gözüyle

### 9.1 Gereken beceriler
Dosya ve klasör işlemleri; Excel (okuma ve yazma, biçim, **pivot**); CSV ve JSON; e-posta gönderme **ve okuma** (IMAP, Outlook/Graph); **PDF'ten metin ve tablo çıkarma**, Word şablonu doldurma; web ve tarayıcı otomasyonu (Playwright/Selenium); zamanlanmış görevler (Windows Görev Zamanlayıcı); log ve hata bildirimi; **bulut uygulamalarıyla entegrasyon** (Google Sheets, Teams, Slack webhook, REST); n8n ve Make ile Python'u birlikte kullanma (Techcareer AI mühendisi pozisyon özeti n8n ve Make deneyimi istiyor). Real Python "Python Web Scraping" ve DataCamp "Importing Data" dersleri de bu kapsamda.

### 9.2 Karşılık ve eksikler
- Güçlü: dosya-islemleri, dosya-ileri, excel-otomasyon, ofis-otomasyon (dry-run, idempotent, kilit dosyası), cli-araclari, web-scraping, sablon-rapor, proje-orta-otomasyon.
- **Kritik:** pandas-groupby ve pivot_table patikada yok. Excel kullanıcısının ilk istediği şey pivot.
- **Önemli:** PDF ve Word yalnız "dokunuş" düzeyinde (ofis-otomasyon'da bir bölüm); fatura ve ekstreden tablo çıkarma yok.
- **Önemli:** E-posta okuma (IMAP), Google Sheets, Teams ve Slack webhook yok.
- **Önemli:** `logging` patikada yok; gözetimsiz betik için zorunlu.
- **İyi olur:** Playwright yalnız anılıyor; giriş yapılan portaldan rapor indirmek tipik bir ofis işi.

### 9.3 Düzeltme
- (a) Yeni: `pdf-word-otomasyon`, `entegrasyon-saas`.
- (b) Ekle: web-scraping → uygulamalı Playwright (Ekle-25); excel-otomasyon → Power BI ve Excel'de Python köprüsü (Ekle-4).
- (c) Patikaya ekle: `pandas-groupby`, `logging`, `test-yazma` (İyi olur). İsteğe bağlı çıkarma: `gui-tkinter` (iş yerinde nadiren istenir; seçmeli olarak kalabilir).

### 9.4 Mülakat ve portföy
**Mülakat:** "Bu işi neden otomatikleştirelim?" (ROI hesabı); hata durumunda geri alma; idempotentlik; kimlik bilgilerinin saklanması; zamanlama ve izleme; kırılgan seçiciler.
**Portföy:**
1. **Pusula İK aylık izin raporu robotu.** `ik_leaves` + `ik_employees` → departman bazlı pivot → biçimli Excel → yöneticilere kişiselleştirilmiş e-posta taslağı (dry-run) → log.
2. **Lezzet Kurye restoran komisyon faturaları.** `lk_orders` + `lk_restaurants.commission_pct` → her restoran için Jinja2 ile HTML'den PDF fatura → klasöre arşiv → özet Excel.
3. **Kirli bayi listesini Sheets'e senkronlamak.** `kirli_veri.bayi` temizlenir → sahte Sheets istemcisine idempotent yazma → değişiklik varsa Teams webhook bildirimi.

---

## 10. Sertifika ve Mülakat (`sertifika`): teknik mülakatçı ve PCAP eğitmeni gözüyle

### 10.1 Gereken beceriler
PCEP ve PCAP (Python Institute) konu listeleri; HackerRank Python (Basic) ve Problem Solving (Basic/Intermediate: hash map, yığın, kuyruk, optimal çözüm). **NeetCode 150 kategorileri:** Array & Hashing, Two Pointers, Sliding Window, Stack, Binary Search, Linked List, Trees, Tries, Heap, Backtracking, Graphs, Advanced Graphs, 1-D DP, 2-D DP, Greedy, Intervals, Math & Geometry, Bit Manipulation. Real Python "Ace Your Python Coding Interview". Bunlara ek olarak sistem tasarımı (orta ve kıdemli) ve davranışsal mülakat.

### 10.2 Karşılık ve eksikler

| NeetCode kategorisi | Karşılık | Durum |
|---|---|---|
| Array & Hashing, Two Pointers, Sliding Window, Binary Search, Prefix Sum | algoritmalar, mulakat-hazirlik | Var |
| Stack, Heap | mulakat-hazirlik "Derinleş", veri-yapilari | Var |
| 1-D DP, Backtracking, BFS/DFS | algoritmalar, mulakat-hazirlik | Var (kısa) |
| **Linked List problemleri** (ters çevirme, döngü tespiti, birleştirme) | veri-yapilari'nda yapı var, problem yok | **Eksik**: Önemli |
| **Trees** (gezinme, derinlik, LCA, BST doğrulama) | veri-yapilari'nda BST yapısı | **Eksik**: **Kritik** |
| **Tries** | veri-yapilari'nda anılıyor | Eksik: Önemli |
| **Advanced Graphs** (Dijkstra, topolojik sıralama, union-find) | Dijkstra anılıyor; union-find anılıyor | **Eksik**: Önemli |
| **2-D DP** (LCS, edit distance, grid) | Yok | Eksik: Önemli |
| **Intervals**, Greedy | Kısmen | Eksik: Önemli |
| Bit manipulation | operatorler'de "bit hileleri" | Kısmi |
| Sistem tasarımı | mulakat-hazirlik'te bir bölüm | Yüzeysel: Önemli |
| PCEP/PCAP söz dizimi | Patika ve exams.js'deki deneme sınavı | Güçlü |

### 10.3 Düzeltme
- (a) Yeni: `mulakat-kaliplari-2`, `sistem-tasarimi`.
- (c) Patikaya ekle: `string-bicimleme` (PCEP format alanı), `test-yazma` (canlı kodlamada test yazmak artı puan). PCAP sonrası yol için patika açıklamasına PCPP1 notu eklenebilir; PCPP1 konuları (`gui-tkinter`, `logging`, `yapilandirma`, `sqlite-python`, `http-api`) zaten mevcut derslerde var.
- (c) Sıra: `dosya-ileri` → `collections-itertools` geriye sarıyor; collections-itertools, dosya-ileri'den önce gelmeli.

### 10.4 Mülakat ve portföy
**Mülakat:** Yukarıdaki kategorilerin her birinden 2–3 soru; Big-O konuşmak; kenar durumlar; Python'a özgü sorular (GIL, üreteç, dekoratör, MRO, `__slots__`, sığ ve derin kopya).
**Portföy veri setleriyle:**
1. `kanat_havayollari.hv_routes` (distance_km) → Dijkstra ile en kısa rota, BFS ile en az aktarma.
2. `pusula_ik.ik_employees.manager_id` → organizasyon ağacı: derinlik, en yakın ortak yönetici (LCA), alt ağaç boyutu.
3. `ik_departments.parent_id` → topolojik sıralama.
4. `bk_trips` istasyon çiftleri → union-find ile bağlantılı bölgeler.
5. `lk_orders` teslim aralıkları → aralık birleştirme, aynı anda en çok aktif kurye (sweep line).

---

## 11. Birleşik öncelikli liste: 24 yeni ders (tekilleştirilmiş)

Biçim: id · başlık · seviye · mod (PY_MODS'taki modül) · önerilen PY_ORDER yeri · patikalar · öncelik · kapsam. Hiçbiri mevcut 111 dersin id'si ya da ana konusuyla çakışmıyor. Mevcut derste yalnız "anılan" konular derinleştiriliyor ve ilgili derse çapraz bağlantı veriliyor.

### Kritik (12)

**1. `sql-analitik`: Python'dan SQL ile analiz: CTE, pencere fonksiyonları ve pandas karşılıkları**
ileri · Veri Bilimi Araçları · pandas-groupby'dan sonra · analist, bilimci, muhendis, ml, ai · Tarayıcıda: sqlite3 (`veri.baglan`) + DuckDB
- `veri.baglan("anadolu_market")` ile gerçek şemada sorgu; `pd.read_sql` + params
- CTE ile adım adım sorgu; alt sorgu ile CTE karşılaştırması
- Pencere fonksiyonları: ROW_NUMBER, RANK, LAG/LEAD, kümülatif SUM OVER, hareketli ortalama (ROWS BETWEEN)
- Tekilleştirme kalıbı (her müşterinin son siparişi), boşluk-ada (ardışık günler)
- Kohort ve tutundurma sorgusu SQL'de; aynısı pandas'ta (çeviri tablosu)
- LEFT JOIN ile satır çoğalması ve NULL tuzakları; COUNT(*) ile COUNT(col) farkı
- Tarih fonksiyonları (SQLite strftime, DuckDB date_trunc)
- SQL'de mi pandas'ta mı yapmalı? Karar ölçütleri; EXPLAIN'e kısa bakış

**2. `eda-kesifsel`: Keşifsel veri analizi (EDA): sorudan bulguya**
ileri · Veri Bilimi Araçları · seaborn-plotly'den sonra, istatistik'ten önce · analist, bilimci, ml · Tarayıcıda: pandas, matplotlib
- EDA'nın amacı: soru listesi ve hipotez defteri
- Veri profili: şekil, türler, eksiklik haritası, benzersizlik, aralık kontrolleri (otomatik `profil(df)` fonksiyonu)
- Tek değişkenli analiz: dağılım, çarpıklık, aykırı değer; kategorik frekans ve uzun kuyruk
- İki değişkenli analiz: sayısal-sayısal (korelasyon, Spearman), kategorik-sayısal (grup kutu grafiği), kategorik-kategorik (crosstab, normalize)
- Zaman boyutu: trend ve mevsimsellik ön kontrolü
- Veri hatası mı, gerçek sinyal mi? (`kirli_veri` ve `raw_signups` örnekleri)
- Bulgu yazımı: "gözlem → kanıt → olası açıklama → sonraki adım"
- Mini proje: `kanat_havayollari` rötar EDA'sı

**3. `is-metrikleri`: İş metrikleri ve analitik kalıplar: KPI, huni, kohort, LTV**
ileri · Veri Bilimi Araçları · istatistik'ten sonra · analist, bilimci · Tarayıcıda: pandas
- KPI ağacı (ciro = trafik × dönüşüm × AOV) ve metrik tanım sözleşmesi
- Huni analizi: `web_events` ile adım dönüşümü, cihaz kırılımı
- Kohort tutundurma tablosu ve eğrisi; churn tanımları
- LTV (basit ve kohort bazlı), CAC/LTV oranı
- YoY, MoM, YTD; takvim etkisi ve aynı gün karşılaştırması
- Katkı ve köprü (bridge) analizi: fiyat, hacim ve karma etkisi
- Pareto (ABC) ve 80/20; RFM'e çapraz bağlantı (proje-ileri)
- Metrik tuzakları: oran ortalaması, Simpson paradoksu, payda kayması

**4. `veri-mulakat`: Veri rolleri mülakatı: SQL, pandas, istatistik ve vaka soruları**
ileri · Üretime Hazırlık · mulakat-hazirlik'ten sonra · analist, bilimci, muhendis, ml · Tarayıcıda: sqlite3, pandas
- Sık 15 SQL kalıbı (n'inci en yüksek, ardışık, oran, pivot, tekilleştirme)
- pandas canlı kodlama: merge, groupby+transform, pivot, zaman penceresi
- İstatistik soruları: p-değeri, güven aralığı, güç, çoklu test
- Ürün ve vaka soruları: "metrik düştü" çerçevesi, A/B karar soruları
- ML soruları (bilimci ve ml için): sızıntı, metrik seçimi, dengesizlik
- Veri mühendisliği soruları: idempotentlik, SCD, partition
- Take-home analiz teslimi: yapı, README ve 1 sayfalık özet
- Zamanlı deneme seti (her bölümden 2 soru)

**5. `ozellik-muhendisligi`: Özellik mühendisliği: ham veriden modele hazır özelliğe**
ileri · Makine Öğrenmesi · ml-regresyon-siniflandirma'dan sonra · bilimci, ml · Tarayıcıda: pandas, scikit-learn
- Tarih ve saat özellikleri (gün, saat, tatil, döngüsel sin/cos)
- Oran, fark ve etkileşim özellikleri; log ve Box-Cox dönüşümleri
- Grup istatistiği özellikleri (müşteri ortalaması) ve sızıntısız hesap (yalnız geçmiş)
- Lag ve rolling özellikler (zaman sıralı veri)
- Yüksek kardinaliteli kategorikler: frekans, hedef kodlama (CV içinde), OneHot'un sınırı
- Binning; eksiklik göstergesi özellikleri
- Özellik seçimi: varyans, korelasyon, model tabanlı, permutation
- `FunctionTransformer` ve özel dönüştürücüyle Pipeline'a gömme; `anadolu_bank` ile mini proje

**6. `mlops-yasam-dongusu`: MLOps: deney takibi, model kaydı, servisleme ve izleme**
ileri · Üretime Hazırlık · docker-deploy'dan sonra · ml, bilimci (İyi olur), ai · Tarayıcıda: JSON tabanlı mini kayıt defteri; MLflow gösterim
- ML yaşam döngüsü ve olgunluk seviyeleri
- Deney takibi: parametre, metrik ve artefakt; MLflow API gösterimi + tarayıcıda çalışan mini `DeneyKaydi` sınıfı
- Model kayıt defteri ve aşamalar (staging/prod); sürüm ve imza
- Veri ve model sürümleme (DVC kavramı, hash tabanlı)
- Toplu ve çevrim içi servisleme; FastAPI + joblib; girdi şeması doğrulama (pydantic)
- İzleme: veri kayması (PSI, KS testi), tahmin dağılımı, gecikmeli etiketle performans
- Yeniden eğitim tetikleyicileri; shadow ve canary yayın
- ML için CI: model testi (davranış testleri), eşik kapıları

**7. `postgresql-python`: PostgreSQL ile Python: psycopg, transaction, indeks ve toplu yükleme**
ileri · Mimari · sqlalchemy-orm'dan önce · backend, web, muhendis, ai · Tarayıcıda: SQLite/DuckDB ile eşdeğer alıştırmalar; psycopg gösterim
- PostgreSQL ile SQLite farkları (türler, eşzamanlılık, roller); Docker'da başlatma
- psycopg 3: bağlantı, parametre, imleç, `row_factory`, bağlantı havuzu
- Transaction ve izolasyon seviyeleri; SELECT … FOR UPDATE ile stok ve koltuk kilidi
- `INSERT … ON CONFLICT` (upsert), RETURNING
- COPY ile toplu yükleme; executemany ile performans karşılaştırması
- İndeks türleri (B-tree, GIN), EXPLAIN ANALYZE okuma
- JSONB ve pgvector'a kısa bakış
- Migration disiplini (Alembic'e köprü); bağlantı sızıntısı ve zaman aşımı

**8. `veri-modelleme`: Veri modelleme ve ambar: normalizasyon, yıldız şema, SCD**
ileri · Üretime Hazırlık · veri-boru-hatti'ndan önce · muhendis, analist · Tarayıcıda: DuckDB/SQLite + `kesit_bi`
- OLTP ile OLAP; normalizasyon (1NF–3NF) ve bilinçli denormalizasyon
- Kimball: olgu ve boyut, grain belirleme, ölçü türleri (toplanabilir, yarı toplanabilir)
- Yıldız ile kar tanesi; `kesit_bi` modelini (Satislar, Urunler, Tarih) okumak
- Tarih boyutu üretmek; vekil anahtar (surrogate key)
- SCD tip 1, 2 ve 3 (veri-boru-hatti'ndaki SCD2'ye çapraz bağlantı)
- `anadolu_market`'ten yıldız şemaya dönüşüm alıştırması
- Data vault ve one-big-table'a kısa bakış; Power BI modeliyle ilişki (PBIPatika köprüsü)

**9. `dbt-elt`: ELT ve dbt mantığı: katmanlı SQL dönüşümleri ve testler**
ileri · Üretime Hazırlık · veri-boru-hatti'ndan sonra · muhendis, analist (İyi olur) · Tarayıcıda: DuckDB + jinja2 ile "mini-dbt"
- ETL'den ELT'ye: ambar içi dönüşüm
- dbt proje yapısı: sources, staging, intermediate, marts
- `ref()` ve bağımlılık grafiği; Jinja2 ile modüler SQL (mini-dbt derleyicisi yazmak)
- Materializasyon: view, table, incremental (watermark)
- Testler: unique, not_null, accepted_values, relationships; özel test
- Belgeleme ve köken (lineage)
- Snapshot (SCD2) ve seed
- Mini proje: `kanat_havayollari` için staging, mart ve testler

**10. `bulut-temelleri`: Bulut temelleri: nesne depolama, IAM, serverless ve maliyet**
ileri · Üretime Hazırlık · docker-deploy'dan sonra · muhendis, backend, ml · Tarayıcıda: sahte S3 sınıfı; boto3 gösterim
- IaaS, PaaS, SaaS; bölge ve kullanılabilirlik alanı; AWS, GCP ve Azure eşleme tablosu
- Nesne depolama: bucket, key, prefix; boto3 ile yükleme, listeleme, sayfalama
- Data lake yerleşimi: `ham/`, `temiz/`, `mart/` ve tarih bölümlü yollar
- IAM ve en az yetki; erişim anahtarı ile rol farkı; presigned URL
- Serverless fonksiyon (Lambda) ve olay tetikleyici
- Yönetilen veritabanı ve ambar (RDS, BigQuery, Snowflake) kavramsal
- Maliyet tuzakları (çıkış trafiği, küçük dosyalar); IaC (Terraform) kavramı
- Test: moto ile sahte bulut; KVKK'da veri yerleşimi (data residency)

**11. `kimlik-yetki`: Kimlik doğrulama ve yetkilendirme: oturum, JWT, OAuth2 ve RBAC**
ileri · Web ve API · web-guvenlik'ten önce · backend, web · Tarayıcıda: hmac ve saf Python JWT benzeri imza; FastAPI gösterim
- Kimlik doğrulama ile yetkilendirme farkı; oturum çerezi ile token karşılaştırması
- Parola akışı (web-guvenlik'e bağlantı), giriş denemesi sınırlama
- JWT doğru kullanımı: exp, aud, iss; access ve refresh token; döndürme ve iptal listesi
- OAuth2 akışları: authorization code + PKCE, client credentials; OIDC ve SSO kavramı
- FastAPI `Security` ve `OAuth2PasswordBearer` bağımlılıkları; kapsamlar (scopes)
- RBAC ve ABAC; nesne düzeyinde yetki (IDOR açığı)
- Django auth ve izinleri (django-ileri'ye bağlantı)
- Parola sıfırlama ve e-posta doğrulama akışının güvenli tasarımı

**12. `django-ileri`: İleri Django ve DRF: ORM optimizasyonu, izinler ve test**
ileri · Web ve API · django-giris'ten sonra · backend, web · Tarayıcıda: gösterim + Django ORM'e eşdeğer SQLite alıştırmaları
- Model ilişkileri, özel manager ve QuerySet metodları
- select_related, prefetch_related, annotate, F ve Q ifadeleri; sorgu sayısını ölçmek
- Sinyaller ve ne zaman kaçınılmalı; transaction.atomic
- DRF: serializer doğrulaması, ViewSet ve router, izin sınıfları, sayfalama, filtreleme, throttling
- Ayarların ortama göre ayrılması; özel yönetim komutları
- pytest-django ile test; factory'ler
- Celery entegrasyonu (redis-kuyruk'a bağlantı); statik ve medya dosyalar
- Mini proje: Pusula İK izin onay API'si

### Önemli (10)

**13. `redis-kuyruk`: Redis, önbellek ve arka plan işleri (Celery/RQ)**
ileri · Web ve API · fastapi'den sonra · backend, web, ai (İyi olur) · Tarayıcıda: dict tabanlı FakeRedis + asyncio işçi havuzu; Celery gösterim
- Redis veri türleri (string, hash, list, set, sorted set) ve kullanım yerleri
- Cache-aside, write-through; TTL; geçersizleştirme stratejileri; cache stampede
- Hız sınırlayıcı: token bucket ve kayan pencere (Redis ile)
- Dağıtık kilit ve tuzakları; oturum deposu
- Görev kuyruğu kavramı: üretici, broker, işçi; Celery ve RQ gösterimi
- Yeniden deneme ve backoff, idempotent görev, ölü mektup kuyruğu
- Zamanlanmış görevler (beat); sonuç deposu; izleme (Flower)
- Pub/sub ile basit bildirim

**14. `gozlemlenebilirlik`: Gözlemlenebilirlik: log, metrik, iz ve SLO**
ileri · Üretime Hazırlık · kalite-ci'dan sonra · backend, muhendis, ml · Tarayıcıda: saf Python metrik toplayıcı ve iz simülasyonu
- Üç sütun ve aralarındaki ilişki; logging dersindeki yapılandırılmış log'a bağlantı
- Korelasyon ve istek kimliği; contextvars ile yayılım
- Metrik türleri (counter, gauge, histogram); Prometheus istemcisi gösterimi; p50 ve p95 hesaplama
- RED ve USE yöntemleri
- OpenTelemetry ile dağıtık iz: span, trace, örnekleme
- SLI, SLO, hata bütçesi; alarm tasarımı (gürültüsüz alarm)
- Hata takibi (Sentry kavramı); sağlık uç noktaları (docker-deploy'a bağlantı)
- Veri hattı gözlemlenebilirliği: tazelik, hacim, şema değişimi

**15. `sistem-tasarimi`: Sistem tasarımı temelleri: ölçekleme, tutarlılık ve tasarım mülakatı**
ileri · Üretime Hazırlık · mulakat-hazirlik'ten önce · backend, web, sertifika, muhendis (İyi olur) · Tarayıcıda: kapasite hesap alıştırmaları, tutarlı hash simülasyonu
- Gereksinim çıkarma ve kaba tahmin hesabı (QPS, depolama)
- Dikey ve yatay ölçekleme, durumsuz servis, yük dengeleyici
- Önbellek katmanları, CDN
- Replikasyon, sharding, tutarlı hash; CAP ve PACELC
- Kuyruk ve olay güdümlü mimari; senkron ve asenkron iletişim
- Dayanıklılık: zaman aşımı, retry, circuit breaker, backpressure (http-api'ye bağlantı)
- Örnek tasarımlar: URL kısaltıcı, bildirim servisi, Lezzet Kurye sipariş akışı
- Mülakat formatı ve değerlendirme rubriği

**16. `embedding-vektor-arama`: Embedding ve vektör arama: anlamsal arama ve RAG'in getirme katmanı**
ileri · Yapay Zekâ · llm-api'den sonra · ai, ml · Tarayıcıda: numpy ile kosinüs ve brute-force kNN; sahte embedding modeli
- Embedding nedir; boyut, normalizasyon, benzerlik ölçüleri
- numpy ile kNN; ANN kavramı (HNSW, IVF) ve FAISS, Chroma, pgvector gösterimi
- Parçalama (chunking) stratejileri: sabit, cümle ve başlık bazlı; örtüşme
- Hibrit arama: BM25 (saf Python) + vektör; skor birleştirme (RRF)
- Yeniden sıralama (reranking) kavramı
- Getirme değerlendirmesi: recall@k, MRR, altın soru seti
- Metadata filtreleme ve yetki (her kullanıcı yalnız kendi belgesini görmeli)
- Kullanım alanları: benzer şikâyet bulma, kümeleme, anomali (`lk_ratings`)

**17. `llm-ajanlar`: LLM ajanları: araç döngüsü, hafıza, MCP ve güvenli sınırlar**
ileri · Yapay Zekâ · embedding-vektor-arama'dan sonra · ai · Tarayıcıda: sahte LLM istemcisiyle tam döngü
- Ajan nedir, ne zaman gereksizdir (iş akışı ile ajan farkı)
- ReAct döngüsü: düşün, araç çağır, gözlemle; durdurma koşulları ve adım sınırı
- Araç şemaları (pydantic'ten JSON Schema), hata dönüşü ve yeniden deneme
- Durum ve hafıza: konuşma özeti, uzun dönem hafıza (embedding'e bağlantı)
- MCP (Model Context Protocol) kavramı: sunucu, araç ve kaynak; basit MCP sunucusu gösterimi
- Güvenlik: araç yetkisi, insan onayı, istem enjeksiyonu ve veri sızıntısı
- Maliyet ve gecikme; LangChain/LangGraph ve LlamaIndex'e konumlandırma
- Mini proje (AI bitirmesi): `anadolu_market` text-to-SQL ajanı + değerlendirme seti

**18. `zaman-serisi-tahmin`: Zaman serisi tahmini: temel çizgiden ETS, ARIMA ve ML'ye**
ileri · Makine Öğrenmesi · ml-kumeleme'den sonra · bilimci, ml, analist (İyi olur) · Tarayıcıda: statsmodels, scikit-learn
- Tahmin problemi: ufuk, sıklık, toplama seviyesi
- Temel çizgiler: naive, seasonal naive, hareketli ortalama
- Bileşen ayrıştırma (STL) ve durağanlık (ADF kavramı)
- Üstel düzeltme (ETS, Holt-Winters) ve ARIMA/SARIMAX (dışsal değişken: hava)
- Lag özellikli ML tahmini; doğrudan ve özyinelemeli çok adımlı tahmin
- Geriye dönük test (backtest): genişleyen pencere ve TimeSeriesSplit
- Metrikler: MAE, RMSE, MAPE tuzakları, sMAPE, MASE; tahmin aralığı
- Mini proje: `pedal_izmir` saatlik talep + `bk_weather`

**19. `derin-ogrenme-giris`: Sinir ağlarına giriş: numpy'dan PyTorch'a**
ileri · Makine Öğrenmesi · zaman-serisi-tahmin'den sonra · bilimci, ml, ai · Tarayıcıda: numpy + sklearn MLP; PyTorch gösterim
- Nöron, katman, aktivasyon; ileri yayılım
- Kayıp fonksiyonları; gradyan inişi ve geri yayılım (numpy ile 2 katmanlı ağ)
- Mini-batch, öğrenme oranı, epoch; eğitim eğrisi okuma
- Aşırı öğrenmeye karşı: dropout, erken durdurma, düzenlileştirme
- scikit-learn MLPClassifier ile tablo verisi; ağaç topluluklarıyla karşılaştırma
- PyTorch gösterimi: tensör, nn.Module, eğitim döngüsü, DataLoader
- CNN, RNN ve transformer'a kavramsal bakış; transfer öğrenme
- Ne zaman derin öğrenme, ne zaman gradient boosting?

**20. `spark-dagitik`: PySpark ile dağıtık veri işleme**
ileri · Veri Bilimi Araçları · polars-duckdb'den sonra · muhendis · Tarayıcıda: DuckDB/polars eşdeğer alıştırmalar; PySpark gösterim
- Dağıtık hesaplama: sürücü, yürütücü, partition
- SparkSession, DataFrame API, tembel değerlendirme, eylemler
- Dönüşümler: dar ile geniş; shuffle'ın maliyeti
- Join stratejileri (broadcast), veri çarpıklığı (skew) ve salting
- Spark SQL ve pencere fonksiyonları
- Parquet, partitionBy, Delta ve Iceberg kavramı
- UDF'nin bedeli; pandas UDF
- Spark UI okumak; ne zaman Spark gereksizdir (DuckDB ve polars karşılaştırması)

**21. `akis-isleme`: Akış işleme ve mesaj kuyrukları: Kafka kavramları**
ileri · Üretime Hazırlık · orkestrasyon'dan sonra · muhendis, backend (İyi olur) · Tarayıcıda: asyncio.Queue ve bellek içi "log" ile Kafka benzetimi
- Toplu, mikro-toplu ve akış; olay zamanı ile işlem zamanı
- Kafka: topic, partition, offset, consumer group, saklama süresi
- Teslim garantileri: en çok bir, en az bir, tam bir kez; idempotent tüketici
- Pencereleme (tumbling, sliding, session); geç gelen veri ve watermark
- Şema evrimi (Avro ve şema kayıt defteri kavramı)
- RabbitMQ ve Redis Streams ile karşılaştırma
- CDC (Debezium) → Kafka → ambar akışı
- Mini proje: `bank_txns` akışında dakikalık şüpheli işlem sayacı

**22. `mulakat-kaliplari-2`: Mülakat kalıpları II: bağlı liste, ağaç, trie, graf, aralık ve 2B DP**
orta · Veri Yapıları ve Algoritmalar · algoritmalar'dan sonra · sertifika, backend, muhendis · Tarayıcıda: tamamen
- Bağlı liste: ters çevirme, Floyd döngü tespiti, iki sıralı listeyi birleştirme
- Ağaç: DFS (pre, in, post) ve BFS seviye gezinmesi, derinlik, BST doğrulama, LCA
- Trie: ekleme, önek arama, otomatik tamamlama
- Gelişmiş graf: Dijkstra (`hv_routes`), topolojik sıralama (`ik_departments`), union-find
- Aralıklar: birleştirme, ekleme, sweep line (en çok eşzamanlı teslimat)
- 2B DP: LCS, edit distance, grid yolları; tablodan bellek optimizasyonuna
- Bit manipülasyonu: tek sayıyı bulma, bit sayma
- Kalıp tanıma tablosu (NeetCode kategorileri ile eşleme)

### İyi olur (2)

**23. `pdf-word-otomasyon`: PDF ve Word belgeleriyle otomasyon**
orta · Otomasyon ve Araçlar · ofis-otomasyon'dan sonra · otomasyon · Tarayıcıda: pypdf (saf Python) ile okuma; python-docx ve pdfplumber gösterim
- PDF'in yapısı: metin katmanı ve taranmış görüntü farkı
- pypdf ile sayfa okuma, birleştirme, bölme, döndürme, filigran
- pdfplumber ile tablo çıkarma (fatura ve ekstre), regex ile alan ayıklama
- OCR kavramı (Tesseract), ne zaman gerekir
- python-docx ile Word şablonunu doldurma (sözleşme, teklif)
- HTML'den PDF üretimi (WeasyPrint) ve sablon-rapor'a bağlantı
- Toplu işlem: klasördeki 200 PDF'ten özet Excel
- Hata dayanıklılığı ve kişisel veri (KVKK) maskeleme

**24. `entegrasyon-saas`: İş uygulamalarıyla entegrasyon: Google Sheets, e-posta okuma, Teams, Slack ve webhook**
orta · Otomasyon ve Araçlar · http-api'den sonra · otomasyon, ai · Tarayıcıda: sahte istemciler; gspread, imaplib ve MS Graph gösterim
- Entegrasyon kalıpları: çekme (polling) ile itme (webhook)
- Google Sheets API (gspread, servis hesabı); idempotent satır güncelleme
- imaplib ile e-posta okuma: arama, ek indirme, eki işleme hattı
- Microsoft Graph ile Outlook ve Teams; gelen webhook ile kanala mesaj
- Slack webhook ve basit bot
- OAuth ve servis hesabı gizli bilgilerinin yönetimi (yapilandirma'ya bağlantı)
- Gelen webhook alıcısı (FastAPI) ve imza doğrulama (api-web'e bağlantı)
- n8n ve Make ile Python'un iş bölümü: düşük kodlu akışa Python adımı eklemek

> Not: Seçimde dışarıda kalan ama sonraki dalgada değerlendirilebilecek dersler: `web-on-yuz-temel` (HTML, CSS, JS ve HTMX; şimdilik Ekle-12 ile karşılanıyor), `model-aciklama` (Ekle-5), `veri-kalitesi` (Ekle-17), `pano-streamlit` (Ekle-3), `tarayici-otomasyonu` (Ekle-25), `oneri-sistemleri`, `nedensel-cikarim`, `bilgisayarli-goru`.

---

## 12. Birleşik öncelikli liste: 30 "mevcut derse ekle" önerisi

| # | Ders | Eklenecek alt konu | Öncelik | Patikalar |
|---|---|---|---|---|
| 1 | `pandas-giris` (ve tüm ileri veri dersleri) | "Ders veri setleri" bölümü: `veri.liste()`, `veri.oku()`, `veri.baglan()`; ileri veri derslerinin her birinde gerçek tablolarla en az 2 alıştırma (pandas-temizlik → `kirli_veri`, `raw_signups`; pandas-groupby → `order_items`; pandas-zaman-serisi → `bk_trips`; gorsellestirme → `hv_flights`; istatistik → `ab_test`; ml-kumeleme → `customers` + `orders`; nlp-metin → `lk_ratings`) | **Kritik** | Tümü |
| 2 | `istatistik` | A/B testinde SRM (örneklem oranı uyumsuzluğu) ki-kare kontrolü, sık bakma (peeking) sorunu ve sıralı test kavramı, CUPED ile varyans azaltma, oranlar için z-testi; `ab_test` tablosuyla | Önemli | analist, bilimci |
| 3 | `seaborn-plotly` | "Panoya geçiş" bölümü: Streamlit ve Dash ile basit pano (gösterim), pano tasarım ilkeleri (KPI kartı, filtre, ayrıntıya inme), veri hikâyesi akışı (bağlam, gerilim, çözüm), tek dosyalık HTML rapor | Önemli | analist |
| 4 | `excel-otomasyon` | Power BI ve Excel köprüsü: Power BI'da Python betik kaynağı ve Python görseli, Excel'de Python (`=PY`), Power BI'a yıldız şemalı CSV/Parquet hazırlama (`kesit_bi` ile), PBIPatika'ya bağlantı | Önemli | analist, otomasyon |
| 5 | `ml-pipeline-degerlendirme` | Model açıklanabilirliği: PDP ve ICE (`sklearn.inspection`), SHAP kavramı (gösterim), hata dilimi analizi (segment bazında hata), adalet metrikleri (grup bazında FPR/FNR), model kartına ekleme | Önemli | bilimci, ml |
| 6 | `ml-pipeline-degerlendirme` | Bayesçi hiperparametre arama (Optuna gösterimi), HalvingGridSearchCV, erken durdurma; arama bütçesi | İyi olur | bilimci, ml |
| 7 | `ml-kumeleme` | Market sepeti analizi (destek, güven, lift; saf pandas ile Apriori benzeri) ve öğe-öğe benzerliğiyle basit öneri; `order_items` ile | İyi olur | analist, bilimci |
| 8 | `ml-regresyon-siniflandirma` | Gradient boosting uygulaması: HistGradientBoosting ayarları (learning_rate, max_leaf_nodes, early_stopping), XGBoost ve LightGBM API eşlemesi, kategorik destek | Önemli | bilimci, ml |
| 9 | `llm-api` | Açık ve yerel modeller (Hugging Face Inference, Ollama gösterimi), sağlayıcıdan bağımsız istemci arayüzü (Protocol ile), SSE ile akışı istemciye iletmek, model yönlendirme (küçük ve büyük model) | Önemli | ai |
| 10 | `yapay-zeka-ile-kod` | Ajanlı kodlama iş akışı (Claude Code, Cursor): görev bölme, kurallar dosyası, MCP ile araç bağlama, ajan çıktısını PR olarak inceleme kontrol listesi | Önemli | ai, tümü |
| 11 | `fastapi` | WebSocket uç noktası ve yayın, SSE ile akış, sayfalama (offset ve cursor) ve filtreleme kalıbı, hız sınırı middleware'i, async veritabanı oturumu | Önemli | backend, web, ai |
| 12 | `flask` ve `django-giris` | HTMX ile kısmi sayfa güncelleme; temel HTML formu, `fetch` ile JSON çağrısı; sunucu tarafı oluşturma ile SPA farkı | Önemli | web |
| 13 | `sqlalchemy-orm` | Alembic gerçek iş akışı (autogenerate, downgrade, veri migration'ı, sıfır kesintili migration ilkeleri), async SQLAlchemy | Önemli | backend, web, muhendis |
| 14 | `docker-deploy` | Nginx reverse proxy yapılandırması, PaaS'a (Render, Railway, Fly) adım adım dağıtım, Kubernetes temel nesneleri (Pod, Deployment, Service, ConfigMap, Secret, probe) ve kubectl gösterimi | Önemli | backend, web, ml, muhendis |
| 15 | `kalite-ci` | Sürekli dağıtım (CD): imaj oluşturma ve kayıt defterine gönderme, staging/prod ortamları, etiketle sürüm yayını, geri alma; ML için model kalite kapısı | Önemli | backend, ml, muhendis |
| 16 | `terminal-temelleri` (Uzmanlaş) | Linux kabuk iş akışı: grep, sed, awk, jq, find, xargs; izinler ve chmod; süreçler (ps, kill), ssh ve scp, tmux; tek satırlık log analizi | Önemli | muhendis, backend, ml |
| 17 | `veri-boru-hatti` | Uygulamalı veri kalitesi: pandera şeması (ya da saf Python şema doğrulayıcı), kalite boyutları (tamlık, tekillik, geçerlilik, tazelik), karantina tablosu, YAML veri sözleşmesi, sonuç raporu | Önemli | muhendis, analist, ml |
| 18 | `orkestrasyon` | Airflow TaskFlow API örneği, backfill ve catchup, veri farkındalıklı zamanlama (datasets/assets); Prefect ve Dagster karşılaştırması | İyi olur | muhendis |
| 19 | `polars-duckdb` | Hive bölümlü Parquet gölü: yazma (`partition_by`), DuckDB `read_parquet(..., hive_partitioning=true)`, bölüm budama ölçümü, küçük dosya sorunu | Önemli | muhendis |
| 20 | `sqlite-python` | Pencere fonksiyonu ve CTE için 2 uygulamalı alıştırma (şu an yalnız anılıyor); `sql-analitik`'e köprü | Önemli | analist, muhendis |
| 21 | `pandas-zaman-serisi` | "Tahmine giriş" bölümünü `zaman-serisi-tahmin`'e yönlendiren köprü ve sızıntısız lag özelliği alıştırması | İyi olur | bilimci, analist |
| 22 | `test-ileri` | Gerçek veritabanıyla entegrasyon testi (transaction rollback fixture, testcontainers kavramı), sözleşme testi (OpenAPI), yük testi (locust gösterimi) | Önemli | backend, web |
| 23 | `web-guvenlik` | Güvenlik başlıkları (CSP, HSTS, X-Frame-Options), SSRF, oturum sabitleme, pip-audit ile bağımlılık taraması (kalite-ci'ye bağlantı) | Önemli | backend, web |
| 24 | `mulakat-hazirlik` | Patikalara göre "hangi bölüm kime" haritası; `veri-mulakat`, `mulakat-kaliplari-2` ve `sistem-tasarimi`'ye yönlendirme; 45 dakikalık deneme mülakatı senaryosu | İyi olur | sertifika, backend |
| 25 | `web-scraping` | Uygulamalı Playwright: bekleme stratejileri, giriş yapılan portalda oturumu saklama, ağ yanıtını yakalayıp gizli API'yi kullanma, dosya indirme | İyi olur | otomasyon |
| 26 | `ofis-otomasyon` | Hata bildirimi (Teams webhook ve e-posta) ve çalışma özeti; Windows Görev Zamanlayıcı'da "kullanıcı oturum açmamışken çalıştır" ve kimlik bilgisi tuzakları | İyi olur | otomasyon |
| 27 | `proje-ileri` | Satır içi veri yerine `veri.oku("anadolu_market", ...)` ile gerçek 910 sipariş ve 1620 satır; kohort ve RFM sonuçlarını `kesit_bi.RFMSegmentleri` ile karşılaştırma | **Kritik** | analist, bilimci, muhendis |
| 28 | `proje-ml` | Sentetik veri yerine `anadolu_bank` (bank_accounts.closed_date → etiket; bank_txns'ten 90 günlük özellikler); FastAPI ile servisleme ve PSI ile izleme adımı | **Kritik** | bilimci, ml |
| 29 | `proje-api` | PostgreSQL + Alembic + Redis önbellek + arka plan işi (onay e-postası) ile docker compose; hız sınırı | Önemli | backend, web |
| 30 | `jupyter-colab` / `git-proje-yapisi` | Notebook'tan rapora (nbconvert, Quarto, papermill parametreli rapor) ve portföy deposu (README şablonu, bulgu özeti, ekran görüntüsü, GitHub'da yayın) | Önemli | analist, bilimci, tümü |

---

## 13. Patika değişikliklerinin özet tablosu

| Patika | Ekle (mevcut) | Ekle (yeni) | Çıkar ya da isteğe bağlı | Sıra düzeltmesi |
|---|---|---|---|---|
| genel | dekoratorler, dataclass-typing, collections-itertools, json-csv, test-yazma, git-proje-yapisi, kutuphane-turu, proje-orta, (kurulum-araclar ya da birleştir) | – | – | – |
| analist | git-proje-yapisi, hata-ayiklama, proje-orta | sql-analitik, eda-kesifsel, is-metrikleri, veri-modelleme, veri-mulakat, zaman-serisi-tahmin (İyi olur) | dataclass-typing (isteğe bağlı) | sql-analitik pandas-groupby'dan sonra |
| bilimci | sqlite-python, git-proje-yapisi, mulakat-hazirlik, llm-api | sql-analitik, eda-kesifsel, ozellik-muhendisligi, zaman-serisi-tahmin, derin-ogrenme-giris, is-metrikleri, veri-mulakat | ozyineleme (isteğe bağlı) | ML bloğu sırası (Bölüm 3.3) |
| ml | terminal-temelleri, git-proje-yapisi, test-yazma, pytest, logging, sqlite-python, pydantic-dogrulama, veri-boru-hatti | ozellik-muhendisligi, mlops-yasam-dongusu, derin-ogrenme-giris, zaman-serisi-tahmin, embedding-vektor-arama, bulut-temelleri | – | fastapi docker-deploy'dan önce; performans ML bloğundan önce |
| muhendis | pandas-groupby, kod-stili, mulakat-hazirlik, proje-orta, proje-ileri | sql-analitik, postgresql-python, veri-modelleme, dbt-elt, spark-dagitik, akis-isleme, bulut-temelleri, gozlemlenebilirlik, veri-mulakat, mulakat-kaliplari-2 | cli-araclari (isteğe bağlı) | Bölüm 5.3 |
| backend | kod-stili, mulakat-hazirlik | postgresql-python, kimlik-yetki, redis-kuyruk, django-ileri, gozlemlenebilirlik, sistem-tasarimi, bulut-temelleri, mulakat-kaliplari-2, akis-isleme (İyi olur) | sablon-rapor, coklu-kalitim, regex (isteğe bağlı) | Bölüm 6.3 |
| web | hata-tasarim, logging, test-yazma | django-ileri, kimlik-yetki, postgresql-python, redis-kuyruk | – | async api-web'den önce |
| ai | test-yazma, pytest, logging, sqlite-python, docker-deploy, proje-api | embedding-vektor-arama, llm-ajanlar, entegrasyon-saas, sql-analitik, redis-kuyruk (İyi olur) | python-nedir (ön koşul notu ile değiştir); ml-giris (isteğe bağlı) | numpy ve pandas async'ten önce |
| otomasyon | pandas-groupby, logging, test-yazma (İyi olur) | pdf-word-otomasyon, entegrasyon-saas | gui-tkinter (seçmeli) | – |
| sertifika | string-bicimleme, test-yazma | mulakat-kaliplari-2, sistem-tasarimi | – | collections-itertools dosya-ileri'den önce |

Ayrıca `metaprogramlama` hiçbir patikada yok: `backend` ve `sertifika` patikalarına "İleri seçmeli" olarak eklenmeli ya da PCPP hazırlığı kapsamında konumlandırılmalı. `paths.js` içindeki `PY_CURRICULUM` karşılaştırma tablosuna yeni satırlar da eklenmeli: SQL ile analiz, EDA ve iş metrikleri, veri modelleme ve ELT, bulut, MLOps, vektör arama ve ajanlar, önbellek ve kuyruk, gözlemlenebilirlik ve sistem tasarımı.

---

## 14. Uygulama sırası önerisi (dalga planı)

1. **Dalga 1 (en hızlı kazanç, içerik düzenlemesi):** Ekle-1, 27 ve 28 (veri setlerini kullanmak); patika düzeltmeleri (Bölüm 13); Ekle-20.
2. **Dalga 2 (veri rolleri, Kritik):** `sql-analitik`, `eda-kesifsel`, `is-metrikleri`, `ozellik-muhendisligi`, `veri-modelleme`, `veri-mulakat`.
3. **Dalga 3 (mühendislik ve backend, Kritik):** `postgresql-python`, `kimlik-yetki`, `django-ileri`, `dbt-elt`, `bulut-temelleri`, `mlops-yasam-dongusu`.
4. **Dalga 4 (Önemli):** `redis-kuyruk`, `gozlemlenebilirlik`, `sistem-tasarimi`, `embedding-vektor-arama`, `llm-ajanlar`, `zaman-serisi-tahmin`, `derin-ogrenme-giris`, `spark-dagitik`, `akis-isleme`, `mulakat-kaliplari-2`.
5. **Dalga 5 (İyi olur):** `pdf-word-otomasyon`, `entegrasyon-saas` ve kalan Ekle maddeleri.

---

## Kaynaklar

- roadmap.sh Data Engineer: https://roadmap.sh/data-engineer (konu özeti: https://iagodantasf.github.io/tech-studies/roadmaps/role-based/data-engineer/)
- roadmap.sh Backend: https://iagodantasf.github.io/tech-studies/roadmaps/role-based/backend/ ve https://dev.to/roadmapsh/mastering-backend-development-mpb
- roadmap.sh AI Engineer: https://dev.to/roadmapsh/ai-engineer-roadmap-3n8 ve https://roadmap.sh/pdfs/roadmaps/ai-engineer.pdf
- DataCamp Data Analyst with Python: https://www.datacamp.com/tracks/data-analyst-with-python
- DataCamp Data Engineer in Python: https://www.datacamp.com/tracks/data-engineer-in-python
- DataCamp Machine Learning Engineer: https://datacamp.com/tracks/machine-learning-engineer
- Google Data Analytics Professional Certificate: https://www.coursera.org/professional-certificates/google-data-analytics
- Google Advanced Data Analytics: https://www.coursera.org/programs/sobma/professional-certificates/google-advanced-data-analytics
- IBM Data Science Professional Certificate: https://www.coursera.org/professional-certificates/ibm-data-science
- freeCodeCamp Data Analysis with Python projeleri: https://github.com/sfoteini/data-analysis-python-freeCodeCamp
- Real Python Learning Paths: https://realpython.com/learning-paths
- NeetCode 150 listesi: https://leetcode.com/discuss/post/5808617/heres-the-list-of-neetcodes-top-150-ques-rydm/
- HackerRank Problem Solving (Intermediate): https://www.hackerrank.com/skills-verification/problem_solving_intermediate
- HackerRank Python (Basic) beceri listesi özeti: https://prachub.com/resources/hackerrank-python-basic-certification-prep-practice-the-published-skills-with-original-tasks
- Miuul Machine Learning Bootcamp müfredatı (katılımcı deposu): https://github.com/edaaydinea/Miuul-Machine-Learning-Summer-Bootcamp
- Techcareer Data Science Bootcamp with Python: https://www.techcareer.net/bootcamp/data-science-bootcamp-with-python
- Techcareer Python Backend Developer ilanı: https://techcareer.net/jobs/detail/python-backend-developer
- Techcareer Yapay Zekâ Mühendisi pozisyon sayfası: https://www.techcareer.net/en/jobs/positions/yapay-zeka-muhendisi
- Kariyer.net EPAM Senior Data Engineer: https://www.kariyer.net/is-ilani/epam-systems-turkey-yazilim-gelistirme-limited-sir-senior-data-engineer-4484510
- Kariyer.net Qlteq AI Engineer (GenAI, Agents): https://www.kariyer.net/is-ilani/qlteq-teknoloji-yazilim-danismanlik-anonim-sirketi-ai-engineer-genai-autonomous-agents-operations-4583390

Not: BTK Akademi ve Miuul'un güncel resmî müfredat sayfalarına doğrudan erişilemedi. Miuul için katılımcı deposundaki modül listesi kullanıldı. Kariyer.net'ten yalnız iki ilan okunabildi; rol bazlı beceri listeleri bu ilanlar ve uluslararası programlarla birlikte değerlendirildi.
