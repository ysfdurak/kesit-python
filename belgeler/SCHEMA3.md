# Kesit Python — SÜRÜM 3 şemaları (Arena, Mülakat, Sık hatalar, Veri seti görevleri)

Genel kurallar SCHEMA.md ve AGENT_PROMPT2.md ile aynı: her dosya bağımsız IIFE, `node --check` geçer; tek tırnaklı JS stringleri (\n, \'),
HTML içinde Python kodunda `&lt; &gt; &amp;`. Her dosyayı yazınca doğrula: `python3 /home/claude/py/tools/verify.py <dosya>` (FAIL=0).
Doğrulamayı scratchpad içinde boş bir alt klasörden çalıştır. Türkçe, sade, "sen" dili.

## Ortak veri setleri (`veri` modülü) — tarayıcıda ve doğrulamada hazır
Kesit SQL ve Kesit Power BI ile aynı kurgusal veriler. İçeriğe bakmak için:
`PP_VERI=/home/claude/py/data python3 -c "import sys; sys.path.insert(0,'/home/claude/py/tools/pylib'); import veri; veri.liste(); veri.tablolar('anadolu_market')"`
Şema ayrıntısı: /home/claude/py/data/manifest.json (sütun açıklamaları dahil).
```python
import veri
veri.kayitlar("ilgaz_bank", "bank_accounts")   # list[dict], sayılar dönüştürülmüş, boşlar None (pandas GEREKMEZ)
veri.oku("anadolu_market", "orders")             # pandas DataFrame (needs: ['pandas'] ekle)
veri.baglan("kanat_havayollari")                 # bellek içi sqlite3 bağlantısı (needs: ['sqlite3'] ekle)
veri.baglan("pedal_izmir", tablolar=["bk_trips", "bk_stations"])  # büyük sette yalnız gerekenler
veri.yol("pusula_ik", "ik_employees")            # CSV yolu
```
Setler: anadolu_market (e-ticaret, 10 tablo), ilgaz_bank (5), pusula_ik (11, İK), lezzet_kurye (7, yemek teslimat),
kanat_havayollari (7), pedal_izmir (6, ~117 bin yolculuk), kesit_bi (27, Power BI yıldız şeması: Satislar, Urunler, Musteriler, Tarih...),
kirli_veri (4 dağınık tablo: bayi, hedef, urun, musteri — Türkçe sayı biçimi, başlık satırı, boşluklar).
Veri setinin adı kodda geçmeli (tarayıcı yalnız adı geçen seti indirir). Testlerde beklenen değerleri gerçekten hesaplayıp yaz (önce kendin çalıştır).

---------------------------------------------------------------------
## 1) Kodlama Arenası (HackerRank tarzı) — `W.PY_ARENA`
```js
(function (W) { 'use strict'; const A = W.PY_ARENA = W.PY_ARENA || []; A.push(
{ id: 'a-101', title: 'Kargo desisi', track: 'Python dili', diff: 'Kolay', pts: 10,   // Kolay 10, Orta 30, Zor 60
  tags: ['input', 'aritmetik'], src: 'HackerRank Python: Introduction benzeri',      // ilham kaynağı (soru metni ÖZGÜN olmalı, kopyalama yok)
  mode: 'stdin',            // 'stdin': program standart girdiden okur, standart çıktıya yazar (HackerRank gibi)
                            // 'func' : öğrenci bir fonksiyon yazar; `tests` (assert) ile denetlenir
  statement: '<p>Görev metni (HTML). Gerçek iş senaryosu.</p>',
  input: '<p>Girdi biçimi: ilk satırda N, sonra N satır...</p>',
  output: '<p>Çıktı biçimi</p>',
  constraints: '1 ≤ N ≤ 10^5',
  samples: [ { in: '3\n10 20 30\n', out: '60\n', why: 'Açıklama' } ],   // 1–3 örnek; ekranda görünür
  hidden: [ { in: '...', out: '...' } ],                             // 6–12 gizli test: kenar durumlar, büyük girdi (performans), boş/tek eleman
  start: 'n = int(input())\n# kodunu yaz\n',                         // girdi okuma iskeleti
  sol: '...',                                                        // örnek çözüm; TÜM örnek+gizli testleri geçmeli
  editorial: '<p>Çözüm yaklaşımı, karmaşıklık, alternatifler, sık hata.</p>',
  hints: ['...', '...'] }
); })(window);
```
- `mode:'stdin'` testlerinde girdi `sys.stdin` ve `input()` ile okunabilir; çıktı satır sonlarındaki boşluklar kırpılarak birebir karşılaştırılır.
- Büyük girdileri elle yazma: gizli testlerde 10^4–10^5 boyutlu girdiyi literal yazmak yerine `gen` alanı kullan:
  `hidden: [ { gen: 'import random\nrandom.seed(7)\nn=50000\nprint(n)\nprint(*[random.randint(1,10**6) for _ in range(n)])' } ]`
  → doğrulayıcı ve uygulama gen kodunu çalıştırıp çıktısını girdi yapar; beklenen çıktı `sol` ile hesaplanır (out yazma).
- `mode:'func'` için: `fn: 'iki_toplam'`, `start`, `sol`, `tests` (assert'ler; örnekleri `samples` olarak da göster: `{ in: 'iki_toplam([2,7,11], 9)', out: '(0, 1)' }`).
- Track değerleri: 'Python dili', 'Veri tipleri', 'Metinler', 'Kümeler ve sözlükler', 'Matematik', 'itertools ve collections', 'Tarih ve saat', 'Hatalar ve istisnalar', 'Sınıflar', 'Fonksiyonel', 'Regex', 'Algoritmalar', 'Veri yapıları', 'Dinamik programlama', 'Graf', 'numpy', 'pandas', 'Veri seti analizi', 'SQL + Python'.
- Zorluk dağılımı yaklaşık: %40 Kolay, %40 Orta, %20 Zor.

## 2) Mülakat soru bankası — `W.PY_INTERVIEW`
```js
(function (W) { 'use strict'; const Q = W.PY_INTERVIEW = W.PY_INTERVIEW || []; Q.push(
{ id: 'm-001', roles: ['genel', 'backend'], lv: 'orta', topic: 'Değişebilirlik',
  kind: 'kavram',        // 'kavram' | 'kod-okuma' | 'tasarim' | 'davranissal' | 'vaka'
  q: 'Değişebilir varsayılan argüman neden tehlikelidir?',
  a: '<p>Model cevap (HTML; 80–220 kelime). Kısa tanım → neden → örnek → çözüm.</p>',
  code: 'def ekle(x, l=[]):\n    l.append(x)\n    return l\nprint(ekle(1), ekle(2))\n',   // isteğe bağlı; çalıştırılabilir olmalı
  out: '[1, 2] [1, 2]',          // code varsa gerçek çıktı (doğrulayıcı denetler)
  follow: ['Peki dataclass alanlarında bu nasıl çözülür?'],          // olası takip soruları
  flags: ['"Her çağrıda yeni liste oluşur" demek yanlış'],          // kırmızı bayrak: zayıf/yanlış cevap işaretleri
  tip: 'Mülakatta önce kısa cevap ver, sonra örnekle göster.' }
); })(window);
```
Roller: 'genel', 'analist', 'bilimci', 'ml', 'muhendis', 'backend', 'web', 'otomasyon', 'ai'. Seviye: 'temel' | 'orta' | 'ileri'.
Kaynak çeşitliliği: popüler mülakat soru listeleri (genel Python, OOP, GIL, bellek, async, pandas, SQL, ML, sistem tasarımı, davranışsal STAR). Soruları ÖZGÜN cümlelerle yaz.

## 3) Sık hatalar kataloğu — `W.PY_MISTAKES`
```js
(function (W) { 'use strict'; const M = W.PY_MISTAKES = W.PY_MISTAKES || []; M.push(
{ id: 'h-001', topic: 'Listeler', lv: 'temel', title: 'Gezerken listeden silmek',
  bad: 'sayilar = [1, 2, 2, 3]\nfor s in sayilar:\n    if s == 2:\n        sayilar.remove(s)\nprint(sayilar)\n',
  bad_out: '[1, 2, 3]',            // hatalı kodun GERÇEK çıktısı (ya da hata adı: 'ValueError: ...' -> bad_err: 'ValueError')
  good: 'sayilar = [1, 2, 2, 3]\nsayilar = [s for s in sayilar if s != 2]\nprint(sayilar)\n',
  good_out: '[1, 3]',
  why: 'Liste gezilirken kısalınca indeks kayar ve bir eleman atlanır.',
  rule: 'Gezdiğin koleksiyonu değiştirme; yenisini kur.' }
); })(window);
```
`bad` ve `good` çalıştırılabilir olmalı; çıktıları doğrulayıcı denetler. Hata veren `bad` için `bad_out` yerine `bad_err: 'TypeError'`.

## 4) Veri seti görevleri — pratik bankasına (`W.PY_BANK`) eklenir
Normal bank görevi + `ds: 'anadolu_market'` alanı + `topic: 'Veri seti: Anadolu Market'` gibi. Gerçek analiz soruları:
"En çok ciro yapan 5 şehir", "Kohort tutma oranı", "Rötar nedenlerinin payı", "Gece yolculuklarının ortalama süresi", "Maaş bandı altındaki çalışanlar" vb.
Testler sonucu (sayı, liste, DataFrame özetleri) denetlesin; beklenen değeri önce kendin hesapla.
pandas kullanan görevlerde `needs: ['pandas']`, sqlite kullananlarda `needs: ['sqlite3']`.
