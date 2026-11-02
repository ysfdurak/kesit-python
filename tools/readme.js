/* README.md üretir (sayılar uygulamanın içeriğinden) */
const fs = require('fs'), vm = require('vm');
global.window = global; const h = fs.readFileSync('index.html', 'utf8');
const files = h.match(/src="[^"]+\.js"/g).map(s => s.slice(5, -1)).filter(f => !/^(app|app2|engine|sync|portfolio)\.js$/.test(f));
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
- **${n(L.length)} ders, ${n(ex)} ders içi alıştırma, ${n((window.PY_BANK || []).length)} pratik görevi.** Kurulumdan pandas'a, otomasyondan web geliştirmeye, makine öğrenmesinden LLM uygulamalarına.
- **${n((window.PY_PATHS || []).length)} rol patikası:** veri analisti, veri bilimci, web geliştirici, yapay zekâ ve diğerleri.
- **${n((window.PY_ARENA || []).length)} arena problemi, ${n(IV.length)} Python mülakat sorusu, ${n((window.PY_MISTAKES || []).length)} sık hata kaydı, ${n((window.PY_EXAMS || []).length)} sınav.**
- **8 hayali veri seti:** e-ticaret, banka, İK, yemek teslimatı, havayolu, bisiklet paylaşımı, Power BI modeli ve kirli veri.

| Karşılama | Ders | Yapay zekâ |
|---|---|---|
| ![](ekran/karsilama.png) | ![](ekran/ders.png) | ![](ekran/yapay-zeka.png) |

## Nasıl çalışıyor?
- Sunucu yok: Python kodu CPython'ın WebAssembly sürümü olan Pyodide ile tarayıcıda çalışır.
- İlerleme yalnızca kullanıcının tarayıcısında saklanır; Profil sayfasından dosyaya kaydedilip başka cihazda yüklenebilir. Site kişisel veri toplamaz. Python motoru ve kütüphaneler jsDelivr'dan iner.
- Alıştırma çözümleri otomatik testlerle gerçek Python'da doğrulanır; denetim araçları `kaynak` dalındadır.

## Kaynak kod ve kardeş projeler
Uygulamanın düzenlenebilir kaynağı, derleme ve test araçları [\`kaynak\` dalındadır](https://github.com/ysfdurak/kesit-python/tree/kaynak). Aynı mantıkla hazırlanmış diğer eğitimler: **[Kesit SQL](https://ysfdurak.github.io/kesit-sql/)** ve **[Kesit Power BI](https://ysfdurak.github.io/kesit-powerbi/)**.

## Yapay zekâ kullanımı
Ürün kararlarını ve kapsamı Yusuf Durak belirledi; kod ve içerik yapay zekâ (Claude) ile geliştirildi.

## Sorumluluk notu
Ücretsiz, ticari olmayan bir eğitim ve portföy projesidir; içerik “olduğu gibi” sunulur. Veri setlerindeki tüm şirketler, kişiler ve kayıtlar hayalidir. Python Software Foundation ya da Python Institute ile bağlantılı değildir.

## Lisans
- Uygulama kodu: [MIT](LICENSE)
- Ders içerikleri ve veri setleri: [CC BY-NC 4.0](LICENSE-ICERIK.md)
`);
