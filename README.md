# Kesit Python — PythonPatika

Sıfırdan ileri seviyeye, tarayıcıda **gerçek Python** çalıştırarak Türkçe Python öğrenme uygulaması. Kurulum gerektirmez: Python, [Pyodide](https://pyodide.org) (WebAssembly'e derlenmiş CPython 3.12) ile sayfanın içinde çalışır; pandas, numpy, scikit-learn, polars, DuckDB, statsmodels gibi paketler ihtiyaç anında yüklenir.

[Kesit SQL](https://github.com/ysfdurak/kesit-sql) ve [Kesit Power BI](https://github.com/ysfdurak/kesit-powerbi) ile aynı kurgusal şirket verilerini kullanır.

## İçerik

| Bölüm | Kapsam |
|---|---|
| Dersler | 140 ders, 3.100+ otomatik testli alıştırma (Temel / Orta / İleri) |
| Patikalar | 10 rol: Python Temelleri, Veri Analisti, Veri Bilimci, Veri Mühendisi, Backend, Makine Öğrenmesi, Web, Yapay Zekâ ile Python, Otomasyon, Sertifika ve Mülakat |
| Yapay Zekâ | LLM API, istem mühendisliği, embedding ve vektör arama, RAG, ajanlar, LLM değerlendirme, yerel modeller, YZ bitirme projesi + ML dersleri |
| Pratik | 550 seviyeli görev (140'ı gerçek veri setleriyle) |
| Kodlama Arenası | 250 HackerRank tarzı problem: stdin/stdout, gizli testler, puan ve rütbe, süreli yarışma |
| Sınavlar | 17 sınav: seviye tespit, seviye bitirme, kodlama, PCEP/PCAP tarzı deneme, 10 patika sınavı |
| Mülakat | 321 yalnız Python mülakat sorusu, role göre; model cevap, takip soruları, kart modu ve 45 dk simülasyon |
| Sık hatalar | 160 katalog kaydı + derslerdeki hata örnekleri (hatalı kod → gerçek çıktı → doğru kod → kural) |
| Veri setleri | 8 set, 78 tablo: Anadolu Market, Anadolu Bank, Pusula İK, Lezzet Kurye, Kanat Havayolları, Pedal İzmir, Kesit BI modeli, kirli veri |

Dersler ve alıştırmalar veri setlerine `import veri` ile erişir:

```python
import veri
df = veri.oku("anadolu_market", "orders")          # pandas DataFrame
con = veri.baglan("lezzet_kurye")                  # bellek içi SQLite
```

## Çalıştırma

Derlenmiş site deponun kökündedir (GitHub Pages: *Settings → Pages → Branch: main, / (root)*). Yerelde:

```bash
python3 -m http.server 8000
# http://localhost:8000
```

İlerleme tarayıcıda saklanır; Profil'den JSON yedeği alınıp geri yüklenebilir.

## Klasör yapısı

```
index.html, *.js              derlenmiş site (tools/build.py üretir; elle düzenleme, kaynak/ altında değiştir)
data/                         CSV veri setleri + manifest.json (site ve araçlar ortak kullanır)
kaynak/
  index.html, app.js, app2.js arayüz (görünümler, arena, mülakat, sık hatalar, veri setleri, yapay zekâ)
  engine.js                   Pyodide motoru: uyumluluk katmanı (asyncio, thread, polars), test çalıştırıcı
  levels.js, paths.js         seviyeler, ders sırası, patikalar, müfredat
  c_*.js, bank.js, exams.js   çekirdek dersler, pratik bankası, sınavlar
  v2/                         ek dersler (n*, t*, o*, i*), ders uzantıları (e*, x*), pratik görevleri (b*)
  v3/                         arena (a*), mülakat (m*), sık hatalar (h*), veri seti görevleri (d*), patika sınavları (s1)
tools/                        derleme ve doğrulama araçları; tools/pylib/veri.py
belgeler/                     içerik şemaları ve uzman denetim raporu
```

## Derleme ve doğrulama

```bash
python3 tools/build.py                 # kaynak/ parçalarını birleştirir → kök (site)
python3 tools/verify.py <dosyalar>     # her alıştırmayı CPython'da çalıştırır (çözüm geçmeli, başlangıç kodu kalmalı)
python3 tools/examples.py <dosyalar>   # ders gövdesindeki örnek kodları çalıştırır
npm install                            # pyodide
node tools/pyodide_verify.mjs <dosya>  # aynı denetimi gerçek tarayıcı motoruyla yapar
node tools/pyodide_examples.mjs <dosya>
python3 tools/uitest.py                # Playwright ile tüm görünümleri açar
node tools/gen_exams.mjs > kaynak/v3/s1/sinav_roller.js   # patika sınavlarını doğrulanmış alıştırmalardan derler
```

`pyodide_verify.mjs` pandas gibi paketleri Pyodide CDN'inden indirir; ağ yoksa tam Pyodide sürümünü ([0.27.8](https://github.com/pyodide/pyodide/releases/tag/0.27.8)) indirip `.whl` dosyalarını `node_modules/pyodide/` içine kopyalayın.

Yayımlanan içeriğin tamamı iki ortamda doğrulanmıştır: yerel CPython ve tarayıcıdaki Pyodide.
