# Kesit Python

**Sıfırdan işe hazır seviyeye Türkçe Python eğitimi. Kurulum yok, hesap yok.** Tarayıcında çalışan gerçek Python motoruyla (Pyodide) kod yazarsın; alıştırmalar otomatik testlerle anında denetlenir.

**Dene:** https://ysfdurak.github.io/kesit-python/

![Tarayıcıda çalışan Python](ekran/alistirma.png)

## Neler var?
- **156 ders, 3.240 ders içi alıştırma, 562 pratik görevi.** Dili sıfırdan öğretir; otomasyon, veri analizi, web, makine öğrenmesi ve LLM uygulamalarına uzanır. Kurulum isteğe bağlıdır ("Bilgisayarına geç" bölümü).
- **11 öğrenme yolu:** veri analisti, veri bilimci, veri mühendisi, backend, web, makine öğrenmesi, yapay zekâ, otomasyon ve diğerleri. Her yolda ön koşul, sınav, role süzülmüş mülakat soruları ve portföy önerileri.
- **250 Python Arena problemi, 292 Python mülakat sorusu, 160 sık hata kaydı, 18 sınav.**
- **8 kurgusal veri seti:** e-ticaret, banka, İK, yemek teslimatı, havayolu, bisiklet paylaşımı, Power BI modeli ve kirli veri.

| Karşılama | Ders | Yapay zekâ |
|---|---|---|
| ![](ekran/karsilama.png) | ![](ekran/ders.png) | ![](ekran/yapay-zeka.png) |

## Nasıl çalışıyor?
- Sunucu yok: Python kodu CPython'ın WebAssembly sürümü olan Pyodide ile tarayıcıda, ayrı bir iş parçacığında (Web Worker) çalışır. Sonsuz döngü sayfayı dondurmaz; Durdur düğmesi ve 60 saniyelik süre sınırı motoru yeniden başlatır.
- İlerleme yalnızca kullanıcının tarayıcısında saklanır; Profil sayfasından dosyaya kaydedilip başka cihazda birleştirilerek yüklenebilir. Site kişisel veri toplamaz.
- Python motoru ve kütüphaneler ilk kod çalıştırmada jsDelivr'dan iner; site dosyaları ilk ziyarette tarayıcı önbelleğine alınır, yeni sürümde eski önbellek silinir.
- Alıştırma çözümleri otomatik testlerle gerçek Python'da denetlenir; denetim araçları `kaynak` dalındadır.


## İngilizce tanıtım turu
Arayüz Türkçe kalır. İngilizce okuyan ziyaretçi için adresin sonuna `?lang=en` eklenir ([https://ysfdurak.github.io/kesit-python/?lang=en](https://ysfdurak.github.io/kesit-python/?lang=en)): her ekranı anlatan bir rehber paneli ve menü/başlıklarda İngilizce karşılıklar açılır; `?lang=tr` kapatır. Ayrıntı: [INGILIZCE-TUR.md](INGILIZCE-TUR.md).
## Bilinen sınırlar
- Tarayıcıda gerçek iş parçacığı, süreç ve doğrudan ağ yok; bu konuları anlatan dersler kendi bilgisayarında beklenen çıktıyı yazar. Flask, Django, Docker, Spark gibi araçların alıştırmaları taklit eder, "Kendi bilgisayarında" görevleri gerçeğini çalıştırmanı ister.
- input() girdileri kod çalışmadan önce verilir.

## Kaynak kod ve kardeş projeler
Uygulamanın düzenlenebilir kaynağı, derleme ve test araçları [`kaynak` dalındadır](https://github.com/ysfdurak/kesit-python/tree/kaynak). Aynı mantıkla hazırlanmış diğer eğitimler: **[Kesit SQL](https://ysfdurak.github.io/kesit-sql/)**, **[Kesit Power BI](https://ysfdurak.github.io/kesit-powerbi/)** ve **[Kesit İstatistik](https://ysfdurak.github.io/kesit-istatistik/)**. Banka, İK, teslimat, havayolu ve bisiklet veri setleri üç uygulamada aynıdır; Anadolu Market'te aynı şirket ve siparişler kullanılır, Power BI modeli zenginleştirilmiştir.

## Yapay zekâ kullanımı
Ürün kararlarını ve kapsamı Yusuf Durak belirledi; kod ve içerik yapay zekâ (Claude) ile geliştirildi.

## Açık kaynak bileşenler
- [Pyodide](https://pyodide.org) (MPL-2.0) ve içinde gelen paketler, kendi lisanslarıyla
- Yazı tipleri: Bricolage Grotesque, IBM Plex Sans, JetBrains Mono (SIL Open Font License; metinler `vendor/fonts` içinde)

## English

**Kesit Python** teaches Python from scratch to job-ready level, in Turkish. Code runs in the browser on real Python (Pyodide, in a Web Worker) and exercises are checked by automated tests: no install, no account.

- 156 lessons, 3,240 in-lesson exercises and 562 practice tasks, from the basics to automation, data analysis, web, machine learning and LLM apps.
- 11 learning paths with prerequisites, exams, role-specific interview questions and portfolio ideas.
- 250 Python Arena problems, 292 interview questions, 160 common-mistake notes, 18 exams and 8 fictional datasets.
- Progress stays in the browser and can be backed up to a file. The Python engine is downloaded from jsDelivr on first run.

The interface and lessons are in Turkish. Add `?lang=en` to the address ([ysfdurak.github.io/kesit-python/?lang=en](https://ysfdurak.github.io/kesit-python/?lang=en)) for an English guide that explains each screen.

Try it: https://ysfdurak.github.io/kesit-python/ · Sister apps: [SQL](https://github.com/ysfdurak/kesit-sql), [Power BI](https://github.com/ysfdurak/kesit-powerbi), [Statistics](https://github.com/ysfdurak/kesit-istatistik).

## Sorumluluk notu
Ücretsiz, ticari olmayan bir eğitim ve portföy projesidir; içerik “olduğu gibi” sunulur. Veri setlerindeki tüm şirketler, kişiler ve kayıtlar hayalidir. Python Software Foundation ya da Python Institute ile bağlantılı değildir.

## Lisans
- Uygulama kodu: [PolyForm Shield 1.0.0](LICENSE.md). Kişiler, okullar ve şirketler kendi işlerinde ücretsiz kullanabilir; satmak ya da rakip ürün yapmak yazılı izin gerektirir.
- Ders içerikleri ve veri setleri: [CC BY-NC 4.0](LICENSE-ICERIK.md)

Kurumunuzda kullanıyorsanız haber verirseniz sevinirim: kurulumda yardımcı olabilir, kurumunuza özel ihtiyaçları birlikte değerlendirebiliriz. İletişim: iletisim@ysfdurak.com

**English:** the app code is released under [PolyForm Shield 1.0.0](LICENSE.md): individuals, schools and companies may use, change and self-host it for free; selling it or offering a competing product needs written permission. Lesson content and datasets stay under [CC BY-NC 4.0](LICENSE-ICERIK.md). Contact: contact@ysfdurak.com
