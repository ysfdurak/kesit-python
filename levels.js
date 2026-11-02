/* PythonPatika — 3 seviye: Temel, Orta, İleri; ders sırası ve modüller */
(function (W) {
'use strict';
W.PY_TIER = v => { const s = String(v == null ? '' : v); if (s === 'temel' || /^A[12]?$/.test(s)) return 'temel'; if (s === 'orta' || /^B[12]?$/.test(s)) return 'orta'; if (s === 'ileri' || /^C[12]?$/.test(s)) return 'ileri'; return s; };
W.PY_LEVELS = [
  { id: 'temel', name: 'Temel', c: 'lv1', tag: 'Sıfırdan ilk programa', code: '5–20 satır: değişken, koşul, döngü, fonksiyon, liste ve sözlük',
    desc: 'Python\'ı kurar, değişkenleri ve veri yapılarını kullanır, koşul ve döngülerle akış kurar, fonksiyon yazar, dosya okur ve hatayı yakalar.',
    can: ['Python\'ı ve bir editörü kurar, betiği terminalden çalıştırırım.', 'Sayı, metin, liste, demet, küme ve sözlükle veriyi tutar ve dönüştürürüm.', 'if/elif/else, for ve while ile akış kurar, sonsuz döngüden kaçınırım.', 'Parametreli fonksiyon yazar, değer döndürür, modül olarak içe aktarırım.', 'Dosya okur-yazar, try/except ile hatayı yakalar, f-string ile rapor üretirim.'] },
  { id: 'orta', name: 'Orta', c: 'lv3', tag: 'Analist ve geliştirici düzeyi', code: '20–80 satır: comprehension, üreteç, sınıf, dekoratör, test, regex, JSON/CSV, SQLite',
    desc: 'Pythonic kod yazar: comprehension ve üreteçler, nesne yönelimli tasarım, dataclass ve tip ipuçları, standart kütüphane, test ve paket yönetimiyle sürdürülebilir projeler kurar.',
    can: ['Liste/sözlük comprehension, üreteç ve itertools ile veriyi tek geçişte işlerim.', 'Sınıf, kalıtım, dataclass ve özel istisnalarla okunur ve genişleyebilir kod yazarım.', 'Dekoratör, bağlam yöneticisi ve tip ipuçlarıyla kodu güvenli ve yeniden kullanılabilir yaparım.', 'JSON, CSV, tarih-saat, regex ve SQLite ile gerçek veriyi okur, temizler, saklarım.', 'unittest/pytest ile test yazar, sanal ortam ve pip ile bağımlılığı yönetirim.'] },
  { id: 'ileri', name: 'İleri', c: 'lv5', tag: 'Uzman ve kurumsal düzey', code: '50–200 satır: pandas/numpy, async, eşzamanlılık, performans, mimari, dağıtım',
    desc: 'pandas ve numpy ile veri analizi yapar; async ve eşzamanlılıkla hızlı sistemler kurar; performansı ölçer, ileri OOP ve tasarım kalıplarıyla mimari tasarlar; paketi test, kalite ve CI ile dağıtır.',
    can: ['pandas ile milyon satırlık veriyi okur, temizler, gruplar, birleştirir ve raporlarım.', 'asyncio, threading ve multiprocessing arasında doğru aracı seçer, GIL\'in etkisini açıklarım.', 'Profil alır, darboğazı bulur, algoritma ve veri yapısı seçimiyle kodu hızlandırırım.', 'Protocol, generic, ABC ve tasarım kalıplarıyla test edilebilir mimari kurarım.', 'pyproject, CLI, ruff, pre-commit ve GitHub Actions ile paketi üretime hazırlarım.'] }
];
/* Ders sırası ve modül başlıkları (seviye içinde öğrenme sırası) */
W.PY_ORDER = [
  'python-nedir', 'kurulum-windows', 'kurulum-macos-linux', 'kurulum-araclar', 'vscode', 'jupyter-colab', 'terminal-temelleri',
  'ilk-program', 'degiskenler', 'sayilar-islemler', 'operatorler', 'metinler', 'unicode-metin', 'girdi-donusum',
  'listeler', 'demet-kume', 'sozlukler', 'ic-ice-veri', 'kosullar', 'match-case', 'donguler',
  'dongu-kaliplari', 'fonksiyonlar', 'kapsam-moduller', 'ozyineleme', 'string-bicimleme', 'dosya-islemleri', 'hatalar',
  'hata-ayiklama', 'kod-stili', 'proje-temel', 'proje-oyunlar', 'kapsamli-ifadeler', 'iteratorler-uretecler', 'fonksiyonel',
  'kapanis-kapsam', 'dekoratorler', 'moduller-paketler', 'sanal-ortam-pip', 'kutuphane-turu', 'siniflar-oop', 'kapsulleme-ozellik',
  'kalitim-polimorfizm', 'coklu-kalitim', 'dataclass-typing', 'hata-tasarim', 'logging', 'collections-itertools', 'tarih-saat',
  'regex', 'json-csv', 'dosya-ileri', 'yapilandirma', 'standart-kutuphane', 'sqlite-python', 'veri-yapilari',
  'algoritmalar', 'mulakat-kaliplari-2', 'excel-otomasyon', 'web-scraping', 'http-api', 'entegrasyon-saas', 'cli-araclari',
  'ofis-otomasyon', 'pdf-word-otomasyon', 'pydantic-dogrulama', 'sablon-rapor', 'gui-tkinter', 'test-yazma', 'pytest',
  'git-proje-yapisi', 'proje-orta', 'proje-orta-otomasyon', 'numpy', 'pandas-giris', 'pandas-temizlik', 'pandas-groupby',
  'sql-analitik', 'pandas-ileri', 'pandas-zaman-serisi', 'gorsellestirme', 'seaborn-plotly', 'eda-kesifsel', 'istatistik',
  'is-metrikleri', 'polars-duckdb', 'spark-dagitik', 'ml-giris', 'ml-regresyon-siniflandirma', 'ozellik-muhendisligi', 'ml-pipeline-degerlendirme',
  'ml-kumeleme', 'zaman-serisi-tahmin', 'derin-ogrenme-giris', 'nlp-metin', 'async', 'eszamanlilik', 'performans',
  'bellek-ic-yapi', 'ileri-oop', 'metaprogramlama', 'tasarim-kaliplari', 'tip-sistemi-ileri', 'postgresql-python', 'sqlalchemy-orm',
  'api-web', 'flask', 'fastapi', 'redis-kuyruk', 'django-giris', 'django-ileri', 'kimlik-yetki',
  'web-guvenlik', 'llm-api', 'prompt-muhendisligi', 'embedding-vektor-arama', 'rag-uygulamasi', 'llm-ajanlar', 'llm-degerlendirme', 'yerel-modeller-hf', 'yapay-zeka-ile-kod', 'veri-modelleme', 'veri-boru-hatti',
  'dbt-elt', 'orkestrasyon', 'akis-isleme', 'paketleme-dagitim', 'docker-deploy', 'bulut-temelleri', 'mlops-yasam-dongusu',
  'kalite-ci', 'gozlemlenebilirlik', 'test-ileri', 'sistem-tasarimi', 'mulakat-hazirlik', 'veri-mulakat', 'proje-ileri',
  'proje-ml', 'proje-ai', 'proje-api'
];
/* Modül düzeltmeleri: ders dosyasındaki mod alanını müfredat sırasına göre geçersiz kılar */
W.PY_MOD_FIX = { 'sanal-ortam-pip': 'Modüller ve Paketler', 'api-web': 'Web ve API', 'sqlalchemy-orm': 'Mimari', 'llm-api': 'Yapay Zekâ', 'yapay-zeka-ile-kod': 'Yapay Zekâ', 'nlp-metin': 'Makine Öğrenmesi', 'proje-ml': 'Bitirme', 'proje-api': 'Bitirme', 'proje-ai': 'Bitirme', 'gui-tkinter': 'Otomasyon ve Araçlar', 'polars-duckdb': 'Veri Bilimi Araçları', 'logging': 'Nesne Yönelimli Programlama', 'pytest': 'Kalite ve Proje', 'ozyineleme': 'Fonksiyonlar ve Modüller', 'kutuphane-turu': 'Modüller ve Paketler', 'moduller-paketler': 'Modüller ve Paketler' };
W.PY_MODS = {
  temel: ['Başlangıç', 'Veri Türleri', 'Akış Kontrolü', 'Fonksiyonlar ve Modüller', 'Dosya ve Hata', 'Bitirme'],
  orta: ['Pythonic Kod', 'Modüller ve Paketler', 'Nesne Yönelimli Programlama', 'Standart Kütüphane', 'Veri Yapıları ve Algoritmalar', 'Otomasyon ve Araçlar', 'Kalite ve Proje', 'Bitirme'],
  ileri: ['Veri Bilimi Araçları', 'Makine Öğrenmesi', 'Eşzamanlılık ve Performans', 'Mimari', 'Web ve API', 'Yapay Zekâ', 'Üretime Hazırlık', 'Bitirme']
};
})(window);
