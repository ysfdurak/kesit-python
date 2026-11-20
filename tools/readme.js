/* README.md üretir (sayılar uygulamanın içeriğinden) */
const fs = require('fs'), vm = require('vm');
global.window = global; const h = fs.readFileSync('index.html', 'utf8');
const files = h.match(/src="[^"]+\.js"/g).map(s => s.slice(5, -1)).filter(f => !/^(app|app2|engine|sync|portfolio|config)\.js$/.test(f));
for (const f of files) vm.runInThisContext(fs.readFileSync(f, 'utf8'));
const lm = {}; const L = (window.PY_LESSONS || []).filter(l => (window.PY_ORDER || []).includes(l.id)); L.forEach(l => lm[l.id] = l);
(window.PY_EXT || []).forEach(x => { if (lm[x.id] && x.ex) lm[x.id].ex = (lm[x.id].ex || []).concat(x.ex); });
const ex = L.reduce((a, l) => a + (l.ex || []).length, 0), n = v => Number(v).toLocaleString('tr-TR');
const IV = (window.PY_INTERVIEW || []).filter(q => q.kind !== 'davranissal' && !(q.roles || []).includes('davranissal'));
process.stdout.write(`# Kesit Python

**Sıfırdan işe hazır seviyeye Türkçe Python eğitimi. Kurulum yok, hesap yok.** Tarayıcında çalışan gerçek Python motoruyla (Pyodide) kod yazarsın; alıştırmalar otomatik testlerle anında denetlenir.

**Dene:** https://ysfdurak.github.io/kesit-python/

![Tarayıcıda çalışan Python](ekran/alistirma.png)

## Neler var?
- **${n(L.length)} ders, ${n(ex)} ders içi alıştırma, ${n((window.PY_BANK || []).length)} pratik görevi.** Dili sıfırdan öğretir; otomasyon, veri analizi, web, makine öğrenmesi ve LLM uygulamalarına uzanır. Kurulum isteğe bağlıdır ("Bilgisayarına geç" bölümü).
- **${n((window.PY_PATHS || []).length)} öğrenme yolu:** veri analisti, veri bilimci, veri mühendisi, backend, web, makine öğrenmesi, yapay zekâ, otomasyon ve diğerleri. Her yolda ön koşul, sınav, role süzülmüş mülakat soruları ve portföy önerileri.
- **${n((window.PY_ARENA || []).length)} Python Arena problemi, ${n(IV.length)} Python mülakat sorusu, ${n((window.PY_MISTAKES || []).length)} sık hata kaydı, ${n((window.PY_EXAMS || []).length)} sınav.**
- **8 kurgusal veri seti:** e-ticaret, banka, İK, yemek teslimatı, havayolu, bisiklet paylaşımı, Power BI modeli ve kirli veri.

| Karşılama | Ders | Yapay zekâ |
|---|---|---|
| ![](ekran/karsilama.png) | ![](ekran/ders.png) | ![](ekran/yapay-zeka.png) |

## Nasıl çalışıyor?
- Sunucu yok: Python kodu CPython'ın WebAssembly sürümü olan Pyodide ile tarayıcıda, ayrı bir iş parçacığında (Web Worker) çalışır. Sonsuz döngü sayfayı dondurmaz; Durdur düğmesi ve 60 saniyelik süre sınırı motoru yeniden başlatır.
- Her alıştırmanın nasıl çalıştığı başlığında yazar: **Gerçek Python · tarayıcıda** (kod ve kütüphane burada gerçekten çalışır), **Benzetim · dış sistem taklit** (FastAPI, PostgreSQL, bulut, LLM gibi burada çalışmayan bir aracın yerine aynı mantık Python'da kurulur), **Kendi bilgisayarında · burada çalışmaz** (gerçek araçla yapılıp işaretlenir). Ders içindeki kod kutuları da "Python · burada çalışır" ya da "Kendi bilgisayarında · burada çalışmaz" etiketlidir. Kural \`app.js › kosuKipi\`.
- İlerleme yalnızca kullanıcının tarayıcısında saklanır; Profil sayfasından dosyaya kaydedilip başka cihazda birleştirilerek yüklenebilir. Site kişisel veri toplamaz.
- Python motoru ve kütüphaneler ilk kod çalıştırmada jsDelivr'dan iner; site dosyaları ilk ziyarette tarayıcı önbelleğine alınır, yeni sürümde eski önbellek silinir.
- Alıştırma çözümleri otomatik testlerle gerçek Python'da denetlenir; denetim araçları \`kaynak\` dalındadır.


## İngilizce tanıtım turu
Arayüz Türkçe kalır. İngilizce okuyan ziyaretçi için adresin sonuna \`?lang=en\` eklenir ([https://ysfdurak.github.io/kesit-python/?lang=en](https://ysfdurak.github.io/kesit-python/?lang=en)): her ekranı anlatan bir rehber paneli ve menü/başlıklarda İngilizce karşılıklar açılır; \`?lang=tr\` kapatır. Ayrıntı: [INGILIZCE-TUR.md](INGILIZCE-TUR.md).
## Bilinen sınırlar
- Tarayıcıda gerçek iş parçacığı, süreç ve doğrudan ağ yok; bu konuları anlatan dersler kendi bilgisayarında beklenen çıktıyı yazar. Flask, Django, Docker, Spark gibi araçların alıştırmaları taklit eder, "Kendi bilgisayarında" görevleri gerçeğini çalıştırmanı ister.
- input() girdileri kod çalışmadan önce verilir.

## Kaynak kod ve kardeş projeler
Uygulamanın düzenlenebilir kaynağı, derleme ve test araçları [\`kaynak\` dalındadır](https://github.com/ysfdurak/kesit-python/tree/kaynak). Aynı mantıkla hazırlanmış diğer eğitimler: **[Kesit SQL](https://ysfdurak.github.io/kesit-sql/)**, **[Kesit Power BI](https://ysfdurak.github.io/kesit-powerbi/)** ve **[Kesit İstatistik](https://ysfdurak.github.io/kesit-istatistik/)**. Banka, İK, teslimat, havayolu ve bisiklet veri setleri üç uygulamada aynıdır; Anadolu Market'te aynı şirket ve siparişler kullanılır, Power BI modeli zenginleştirilmiştir.

## Yapay zekâ kullanımı
Ürün kararlarını ve kapsamı Yusuf Durak belirledi; kod ve içerik yapay zekâ (Claude) ile geliştirildi.

## Açık kaynak bileşenler
- [Pyodide](https://pyodide.org) (MPL-2.0) ve içinde gelen paketler, kendi lisanslarıyla
- Yazı tipleri: Bricolage Grotesque, IBM Plex Sans, JetBrains Mono (SIL Open Font License; metinler \`vendor/fonts\` içinde)

## English

**Kesit Python** teaches Python from scratch to job-ready level, in Turkish. Code runs in the browser on real Python (Pyodide, in a Web Worker) and exercises are checked by automated tests: no install, no account.

- ${Number(L.length).toLocaleString('en-US')} lessons, ${Number(ex).toLocaleString('en-US')} in-lesson exercises and ${Number((window.PY_BANK || []).length).toLocaleString('en-US')} practice tasks, from the basics to automation, data analysis, web, machine learning and LLM apps.
- ${Number((window.PY_PATHS || []).length).toLocaleString('en-US')} learning paths with prerequisites, exams, role-specific interview questions and portfolio ideas.
- ${Number((window.PY_ARENA || []).length).toLocaleString('en-US')} Python Arena problems, ${Number(IV.length).toLocaleString('en-US')} interview questions, ${Number((window.PY_MISTAKES || []).length).toLocaleString('en-US')} common-mistake notes, ${Number((window.PY_EXAMS || []).length).toLocaleString('en-US')} exams and 8 fictional datasets.
- Progress stays in the browser and can be backed up to a file. The Python engine is downloaded from jsDelivr on first run.

The interface and lessons are in Turkish. Add \`?lang=en\` to the address ([ysfdurak.github.io/kesit-python/?lang=en](https://ysfdurak.github.io/kesit-python/?lang=en)) for an English guide that explains each screen.

Try it: https://ysfdurak.github.io/kesit-python/ · Sister apps: [SQL](https://github.com/ysfdurak/kesit-sql), [Power BI](https://github.com/ysfdurak/kesit-powerbi), [Statistics](https://github.com/ysfdurak/kesit-istatistik).

## Sorumluluk notu
Ücretsiz, ticari olmayan bir eğitim ve portföy projesidir; içerik “olduğu gibi” sunulur. Veri setlerindeki tüm şirketler, kişiler ve kayıtlar hayalidir. Python Software Foundation ya da Python Institute ile bağlantılı değildir.

## Uçtan uca vaka: depo toplama süresi
Dört Kesit uygulaması tek bir iş sorusunda birleşir: Anadolu Market Gebze deposunda raf düzeni değişti; toplama süresi kısaldı mı, kısaldıysa yaymaya yeter mi? SQL → Python → Power BI → İstatistik. Her adım öncekinin beklenen çıktısıyla başlar ve sonrakini açar; ilerleme tarayıcıda \`kesit.vaka.depo\` anahtarında ortaktır.

- Bu uygulamadaki adım: [/kesit-python/vaka/depo/](https://ysfdurak.github.io/kesit-python/vaka/depo/). 2. adım: SQL çıktısını pandas ile denetle (temizlik, vardiya karışımı, vardiya içi fark). Sayfa uygulamanın Python motorunu (\`pyworker.js\`) kullanır; çözüm \`tests/vaka_depo.py\` ile CI'da CPython + pandas ile denetlenir.
- Veri ve sayfa üreteci: [ysfdurak.github.io › vaka/depo-kaynak](https://github.com/ysfdurak/ysfdurak.github.io/tree/main/vaka/depo-kaynak). Sayfayı elle düzenleme; üreteçte değiştirip dört depoya yeniden yaz.

## Lisans
- Uygulama kodu: [PolyForm Shield 1.0.0](LICENSE.md). Kişiler, okullar ve şirketler kendi işlerinde ücretsiz kullanabilir; satmak ya da rakip ürün yapmak yazılı izin gerektirir.
- Ders içerikleri ve veri setleri: kodla aynı lisans, [PolyForm Shield 1.0.0](LICENSE.md) (özet: [LICENSE-ICERIK.md](LICENSE-ICERIK.md))

Kurumunuzda kullanıyorsanız haber verirseniz sevinirim: kurulumda yardımcı olabilir, kurumunuza özel ihtiyaçları birlikte değerlendirebiliriz. İletişim: iletisim@ysfdurak.com

**English:** the app code is released under [PolyForm Shield 1.0.0](LICENSE.md): individuals, schools and companies may use, change and self-host the app and its content for free; selling them or offering a competing product needs written permission. Lesson content and datasets are under the same licence. Contact: contact@ysfdurak.com
`);
