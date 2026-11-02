# PythonPatika — içerik şeması (yazarlar için)

PythonPatika, SQLPatika ve PBIPatika'nın kardeşi: Türkçe, sıfırdan işe hazır seviyeye Python öğreten bir web uygulaması. Tarayıcıda **gerçek Python** (Pyodide, CPython 3.12) çalışır; öğrenci kodu yazar, "Çalıştır"a basar, testler otomatik kontrol eder.

Her içerik dosyası bir tarayıcı JS dosyasıdır ve şöyle başlar/biter:

```js
/* PythonPatika — <dosya açıklaması> */
(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
  { ...ders 1... },
  { ...ders 2... }
);
})(window);
```

Dosyayı `node --check dosya.js` geçecek biçimde yaz. Template literal (backtick) içinde backtick ve `${` KULLANMA. Tek tırnaklı JS stringlerinde kesme işaretini `\'` ile kaç. HTML içinde `<` ve `>` karakterleri Python kodu içinde geçecekse `<pre class="py">` içinde **`&lt;` `&gt;` `&amp;` olarak kaçır** (uygulama geri çözer).

## Ders nesnesi

```js
{
  id: 'degiskenler',            // kısa, ASCII, tireli, benzersiz; PY_ORDER listesinde geçmeli
  lv: 'temel',                  // 'temel' | 'orta' | 'ileri'
  mod: 'Başlangıç',             // modül adı (seviye içinde gruplama)
  min: 18,                      // tahmini dakika
  title: 'Değişkenler ve veri türleri',
  sum: 'Bir cümlelik özet; listede görünür.',
  goals: ['Bu dersten sonra ... yapabilirim', '...'],   // 3-5 madde, "yapabilirim" dilinde
  body: `...HTML...`,           // kuram; aşağıdaki HTML sözlüğünü kullan
  ex: [ ...alıştırmalar... ],   // 4-8 alıştırma; en az yarısı 'code' türünde
  faq: [ { q: 'Soru?', a: 'Cevap (düz metin ya da basit HTML).' } ],   // 2-4 SSS
  mistakes: [ { bad: 'kod', good: 'kod', why: 'neden' } ]            // 2-4 sık hata (bad/good Python kodu; tek satır ya da \n ile çok satır)
}
```

### body HTML sözlüğü (yalnızca bunlar)
- `<h2>`, `<h3>`, `<p>`, `<ul>/<ol>/<li>`, `<b>`, `<i>`, `<code>` (satır içi)
- `<pre class="py">...kod...</pre>` → **çalıştırılabilir** Python kutusu (uygulama "Çalıştır" düğmesi ekler). Kod çıktı üretmeli (print) ki öğrenci sonucu görsün. input() KULLANMA (motor sabit girdi verir ama derste gereksiz).
- `<pre class="out">...</pre>` → beklenen çıktıyı göstermek için (nadiren; genelde çalıştırsınlar)
- `<div class="tip"><b>Başlık</b>metin</div>` (ipucu, yeşil), `<div class="warn"><b>Başlık</b>metin</div>` (uyarı, turuncu), `<div class="note"><b>Başlık</b>metin</div>` (not, gri). b etiketi hemen div'in ilk çocuğu olmalı.
- `<div class="tbl-wrap"><table><tr><th>..</th></tr><tr><td>..</td></tr></table></div>`
- `<div class="steps-list"><ol><li>...</li></ol></div>` adım adım tarifler için.
- "Uzmanlaş" bölümü: `<section class="deep"><span class="eyebrow">Uzmanlaş</span> ...daha derin içerik... </section>` — dersin sonunda, iş hayatından/ileri bakış.

### Alıştırma türleri (`ex` dizisi)

1) Çoktan seçmeli
```js
{ t: 'mc', q: 'Soru metni (kısa HTML olabilir, <code> kullanılabilir)',
  o: ['A', 'B', 'C', 'D'], a: 1,     // a: doğru şıkkın indeksi (0 tabanlı). DOĞRU ŞIK EN UZUN ŞIK OLMASIN; uzunlukları karıştır.
  why: 'Neden doğru, diğerleri neden değil (2-3 cümle).' }
```

2) Kod yazma (otomatik test)
```js
{ t: 'code', id: 'degiskenler-1',       // ders id + sıra
  q: '<p>Görev metni HTML. Ne yapılacağı, hangi ad/fonksiyonun beklendiği NET olsun.</p>',
  start: 'def topla(a, b):\n    # buraya yaz\n    pass\n',   // başlangıç kodu (opsiyonel ama tercih edilir)
  sol: 'def topla(a, b):\n    return a + b\n',               // örnek çözüm; testleri GEÇMELİ
  tests: 'assert topla(2, 3) == 5, "topla(2,3) 5 olmalı"\nassert topla(-1, 1) == 0\n',  // öğrenci kodundan SONRA aynı ad alanında çalışır; başarısız assert mesajı öğrenciye gösterilir
  expect: 'Merhaba\n',   // alternatif/ek: beklenen stdout (tam eşleşme, sondaki boşluklar kırpılır). tests ya da expect'ten en az biri olmalı; ikisi de olabilir.
  stdin: ['Ayşe', '25'],  // opsiyonel: input() çağrılarına sırayla verilecek değerler
  hints: ['İpucu 1', 'İpucu 2'],   // 1-3 kademeli ipucu
  why: 'Çözümün kısa açıklaması (çözüm gösterildiğinde).' }
```
Testler için kurallar:
- `tests` içinde yalnızca `assert` ve küçük yardımcı kod kullan. Her assert'e Türkçe mesaj ekle (öğrenci bunu görür).
- Kayan noktalı sonuçlarda `abs(x - y) < 1e-6` ya da `round` kullan.
- Standart kütüphane dışında yalnızca şunlar kullanılabilir (Pyodide'de hazır): `math, random, statistics, datetime, json, csv, re, collections, itertools, functools, dataclasses, typing, string, io, textwrap, enum, decimal, fractions, pathlib (bellek içi), unittest, sqlite3`. İleri seviyede **pandas ve numpy** de kullanılabilir (uygulama otomatik yükler) ama her alıştırmada değil; dosya başında yorumla işaretle: `// needs: pandas`.
- Dosya okuma gerekirse önce kodda dosyayı yaz (`open('x.txt','w')`) sonra oku; ağ erişimi yok; `requests` yok.
- `random` kullanan görevlerde testte `random.seed(0)` ile deterministik hale getir ya da sonucun özelliğini test et (uzunluk, aralık).
- Öğrenciden fonksiyon isteniyorsa fonksiyon adı ve parametreleri görev metninde açıkça geçsin.

## Ders standardı (kalite çıtası: DataCamp/Codecademy'den daha fazla ve daha iyi)
- Her ders: neden önemli (iş hayatından somut senaryo: Anadolu Market e-ticaret verisi, Anadolu Bank işlem verisi, İK, lojistik, üretim), kavram, en az 3 çalıştırılabilir örnek, sık hatalar, "Uzmanlaş" bölümü, 4-8 alıştırma, SSS.
- Kurum senaryosu: "Anadolu Market" (e-ticaret: siparişler, müşteriler, ürünler, şehirler) ve "Anadolu Bank" (hesaplar, işlemler, kredi başvuruları). Örnek verileri küçük listeler/sözlükler/CSV string'leri olarak ders içinde üret.
- Dil: sade, doğrudan, "sen" dili; terimlerin İngilizcesi ilk geçtiğinde parantezde: değişken (variable).
- Kod stili: PEP 8, snake_case, 4 boşluk girinti, Python 3.12 (match, f-string, type hints, walrus, dataclass, | tip birleşimi).
- Her dersin body uzunluğu 900-1800 kelime; kod örnekleri kısa ve amaçlı.
- Gerçek dünya anekdotları uydurma rakam içermesin; genel geçer olsun.

## Pratik bankası (bank.js)
```js
(function (W) {
'use strict';
const B = W.PY_BANK = W.PY_BANK || [];
B.push(
  { id: 'b-001', lv: 'temel', topic: 'Listeler', diff: 1,   // diff: 1 kolay, 2 orta, 3 zor
    kind: 'yaz',                 // 'yaz' (sıfırdan yaz) | 'bug' (hatayı bul-düzelt: start hatalı kod içerir) | 'tamamla' (boşluk doldur)
    title: 'Şehre göre sipariş sayısı',
    q: '<p>Görev HTML</p>', start: '...', sol: '...', tests: '...', expect: '...', stdin: [...], hints: [...], why: '...',
    tags: ['dict', 'sayım'], min: 6 }
);
})(window);
```
Konular (topic): Temel: 'Değişkenler ve Türler', 'Metinler', 'Listeler', 'Sözlükler', 'Koşullar', 'Döngüler', 'Fonksiyonlar', 'Dosya ve Hata'. Orta: 'Comprehension', 'Üreteçler', 'Fonksiyonel', 'Dekoratörler', 'OOP', 'Dataclass ve Tip', 'collections/itertools', 'Tarih-Saat', 'Regex', 'JSON/CSV', 'SQLite', 'Test'. İleri: 'numpy', 'pandas', 'async', 'Eşzamanlılık', 'Performans', 'İleri OOP', 'Tasarım Kalıpları', 'Algoritma', 'ETL'.

## Sınavlar (exams.js)
```js
(function (W) {
'use strict';
const E = W.PY_EXAMS = W.PY_EXAMS || [];
E.push(
  { id: 'temel-bitirme', title: 'Temel seviye bitirme sınavı', lv: 'temel', kind: 'quiz',   // 'quiz' (yalnız mc) | 'kod' (mc + code karışık, zamanlı kodlama)
    min: 30, pass: 70, desc: 'Ne ölçer, kaç soru.',
    qs: [ { t: 'mc', q, o, a, why, topic: 'Listeler' }, { t: 'code', id: 'ex-temel-1', q, start, sol, tests, expect, hints, why, topic: 'Fonksiyonlar', pts: 3 } ] }
);
})(window);
```

---------------------------------------------------------------------
# SÜRÜM 2 EKLERİ (genişletme turu) — BU BÖLÜM ÖNCEKİLERİN ÜZERİNDEDİR
---------------------------------------------------------------------

## Yeni alıştırma türleri

3) Çıktıyı tahmin et (kod okuma) — öğrenci kodu çalıştırmadan çıktıyı seçer, sonra çalıştırıp görür
```js
{ t: 'predict', stage: 'Kodu oku', q: 'Bu kod ne yazdırır?',
  code: 'x = [1, 2, 3]\ny = x\ny.append(4)\nprint(x)\n',
  o: ['[1, 2, 3]', '[1, 2, 3, 4]', '[4]', 'Hata verir'], a: 1,   // o[a] GERÇEK stdout ile birebir aynı olmalı (çok satırlıysa \n ile)
  why: 'y = x yeni liste oluşturmaz; iki ad aynı listeyi gösterir.' }
```
- Hata bekleniyorsa `raises: true` ve doğru şık hata adını içersin: `'TypeError'` ya da `'TypeError hatası verir'`.
- Yanlış şıklar gerçekçi yanılgılar olsun (en sık yapılan hata). Şıklar birbirinden farklı.

4) Satırları sırala (Parsons) — karışık satırları doğru sıraya koyar
```js
{ t: 'order', stage: 'Kodu oku', q: '<p>Şehre göre ciroyu toplayan programın satırlarını sırala.</p>',
  lines: ['ciro = {}', 'for s in siparisler:', '    ciro[s["sehir"]] = ciro.get(s["sehir"], 0) + s["tutar"]', 'print(ciro)'],   // DOĞRU sırada yaz; uygulama karıştırır. Girintiler satırın içinde.
  tests: '...', expect: '...',   // en az biri; lines tek başına çalışabilmeli (gerekirse ilk satırlarda veri tanımla)
  hint: 'Sözlük döngüden önce oluşturulmalı.', why: '...' }
```
- 4–9 satır. Aynı metne sahip iki satır OLMASIN. Sıra tek anlamlı olsun (ör. birbirinden bağımsız iki atama varsa biri diğerine bağlı olacak şekilde yaz).

## Kod görevlerinde yol göstericilik (rehberli görevler)
`code` alıştırmalarına şu alanları ekleyebilirsin (rehberli aşamada ZORUNLU):
- `guide: ['Boş bir sözlük oluştur.', 'Her siparişte şehri anahtar yap...', 'Sözlüğü döndür.']` → ekranda işaretlenebilir "Yol haritası" olarak çıkar (3–6 adım, kodu vermeden yönlendir).
- `example: '...python kodu...'` → "Benzer bir örnek gör" (aynı tekniği BAŞKA veriyle gösteren kısa, çalışan kod; çözümün kendisi değil).
- `start`: rehberli görevde iskelet + `# TODO` yorumları olsun. **start kodu testleri GEÇMEMELİ** (doğrulayıcı bunu denetler).
- `hints`: 2–3 kademeli: 1) hangi kavram, 2) hangi fonksiyon/kalıp, 3) neredeyse çözüm (tek satır eksik).
- Test assert mesajları öğretici olsun: neyi beklediğini ve neden, örneğin `"topla([]) 0 döndürmeli: boş listenin toplamı 0'dır"`.
- `diff: 1|2|3` zorluk yıldızı.

## Aşamalar (`stage` alanı) — her alıştırmaya ZORUNLU
Bir dersin alıştırmaları şu aşamalardan geçerek ilerler (uygulama bu sırayla gruplar):
1. `'Isınma'` — 2–3 mc (kavram)
2. `'Kodu oku'` — 2–3 predict + 1–2 order
3. `'Rehberli'` — 3–4 code (guide + example + iskelet start)
4. `'Kendin yaz'` — 3–4 code (yalnız görev metni + hints)
5. `'Hata avı'` — 1–2 code, `kind: 'bug'` (start çalışmayan/yanlış sonuç veren gerçekçi kod; q'da "hatayı bul ve düzelt")
6. `'Meydan okuma'` — 1–2 code, diff 3 (kenar durumlar, verimlilik)
7. `'Mini proje'` — (isteğe bağlı) 1 code, birkaç fonksiyonu birleştiren küçük iş görevi
YENİ BİR DERS için hedef: **16–20 alıştırma**. Mevcut derse uzantı yazarken: dersin mevcut alıştırmalarını oku (tekrar etme), eksik aşamaları doldurarak dersi **en az 18 alıştırmaya** tamamla.

## Ders uzantısı dosyası (mevcut derslere alıştırma ekleme)
```js
(function (W) {
'use strict';
const X = W.PY_EXT = W.PY_EXT || [];
X.push(
  { id: 'listeler', ex: [ {...}, {...} ] },
  { id: 'sozlukler', ex: [ ... ] }
);
})(window);
```
Uzantı alıştırmalarının `id`'leri `<ders-id>-x<sıra>` biçiminde olsun (ör. `listeler-x1`), mevcut id'lerle çakışmasın. Mevcut alıştırmaların `stage` alanı yok; uygulama onları mc → Isınma, code → Kendin yaz olarak sayar.

## Kütüphaneler: tarayıcıda ne çalışır?
Tarayıcı motoru (Pyodide 0.27) `import` satırlarına bakıp paketi kendisi yükler. ÇALIŞIR: standart kütüphane, numpy, pandas, matplotlib, scipy, scikit-learn, statsmodels, sqlalchemy, pydantic, pyyaml, jinja2, beautifulsoup4, lxml, polars, duckdb, pyarrow, networkx, sympy, rich, click, httpx (ağsız), python-dateutil, pytz, Pillow, pytest (modül olarak).
ÇALIŞMAZ (yalnız kendi bilgisayarında): flask, fastapi, django, openpyxl, xlsxwriter, seaborn, plotly, requests ile gerçek ağ, selenium, tkinter, streamlit, python-docx, pypdf.
- Çalışmayan kütüphanenin kodunu derste `<pre class="code">` ile göster (çalıştır düğmesi çıkmaz) ve hemen altına "Kendi bilgisayarında dene" notu + kurulum komutu (`pip install ...`) yaz.
- O derslerin ALIŞTIRMALARI yine tarayıcıda çalışmalı: kütüphanenin mantığını standart kütüphane/çalışan paketlerle taklit eden görevler (ör. Flask yönlendiricisini sözlükle taklit eden fonksiyon, openpyxl yerine hücre adresi→indeks çevirici, BeautifulSoup gerçek çalışır).
- Yerel doğrulama ortamında yukarıdaki "çalışır" listesi yüklü; pandas 3.x yerelde, 2.2 tarayıcıda: iki sürümde ortak API kullan.

## Kurulum dersleri için
İşletim sistemine göre (Windows / macOS / Linux) ayrı başlıklar, her adımda tam komut (`<pre class="code">`), ekranda ne görüleceği, sık hata ve çözümü (tablo: belirti → neden → çözüm). Alıştırmalar: komut/çıktı yorumlama mc ve predict'leri, PATH/sürüm metni ayrıştıran code görevleri (sys.version_info, platform modülü, shlex ile komut ayrıştırma, requirements doğrulama vb.).
