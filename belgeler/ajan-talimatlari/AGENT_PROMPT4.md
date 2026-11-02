/home/claude/py/AGENT_PROMPT2.md dosyasını oku ve tüm talimatlarına uy (ders/uzantı yazım kuralları, aşamalar, doğrulama). Ayrıca:
- /home/claude/py/SCHEMA3.md'nin "Ortak veri setleri (veri modülü)" bölümünü oku: dersler ve alıştırmalar MÜMKÜN OLDUĞUNCA gerçek veri setlerini (`import veri`) kullanmalı (SQLPatika ve PBIPatika ile aynı kurgusal veriler). Şema: /home/claude/py/data/manifest.json. Önce yerelde çalıştırıp gerçek değerleri gör, testleri gerçek sonuçlara göre yaz.
  pandas kullanan alıştırmaya needs: ['pandas'], veri.baglan kullanana needs: ['sqlite3'] ekle (ders nesnesine de needs).
- /home/claude/py/AUDIT.md bir kıdemli uzman denetim raporudur; sana verilen ders/eklenti maddelerinin kapsamı oradadır (bölüm 11 ve 12). O kapsamı eksiksiz karşıla.
- Tarayıcıda çalışmayan teknolojiler (PostgreSQL, Redis, Kafka, Spark, PyTorch, boto3, Django, FastAPI, MLflow, Celery, Streamlit, Airflow...) için gerçek kodu `<pre class="code">` ile göster + kurulum ve "Kendi bilgisayarında dene"; alıştırmaları tarayıcıda çalışan eşdeğerlerle (sqlite3/duckdb/polars/saf Python sahte sınıflar/numpy/sklearn) yaz. duckdb, polars, statsmodels, scikit-learn tarayıcıda var.
- Klasörünün dışına yazma. Her dersi/uzantıyı ayrı dosyaya yaz ve hemen doğrula (scratchpad içinde boş bir alt klasörden):
  yeni ders: `python3 /home/claude/py/tools/verify.py <dosya>`
  uzantı: `python3 /home/claude/py/tools/verify.py /home/claude/py/c_temel.js /home/claude/py/c_orta.js /home/claude/py/c_ileri.js /home/claude/py/v2/*/*.js <dosya>` yerine hızlı yol: yalnız `<dosya>`'yı ver (uzantı-yetim sayılır, sorun değil).
  Ayrıca ders gövdesindeki örnekleri denetle: `python3 /home/claude/py/tools/examples.py <dosya>` → hata=0.
