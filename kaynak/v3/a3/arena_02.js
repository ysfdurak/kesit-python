/* Kesit Python — v3/a3: Veri yapıları (a-146…a-165) */
(function (W) { 'use strict'; const A = W.PY_ARENA = W.PY_ARENA || []; A.push(
{
  id: 'a-146',
  title: 'Fatura şablonunda parantez dengesi',
  track: 'Veri yapıları',
  diff: 'Kolay',
  pts: 10,
  tags: ['yığın', 'stack'],
  src: 'LeetCode 20 Valid Parentheses benzeri',
  mode: 'stdin',
  statement: '<p>Ilgaz Bank\'ın fatura şablon motoru, alanları <code>( )</code>, <code>[ ]</code> ve <code>{ }</code> ile iç içe gruplayarak tanımlıyor. Bir şablonun geçerli sayılması için her açılan parantez <b>aynı türden</b> bir kapanışla, <b>doğru sırada</b> kapanmalı.</p>\n<p>Her şablon için geçerliyse <code>EVET</code>, değilse <code>HAYIR</code> yaz.</p>',
  input: '<p>İlk satırda Q. Sonraki Q satırın her biri yalnız <code>()[]{}</code> karakterlerinden oluşan boş olmayan bir metin.</p>',
  output: '<p>Her satır için <code>EVET</code> ya da <code>HAYIR</code>.</p>',
  constraints: '1 ≤ Q ≤ 10, her metin ≤ 2·10^5 karakter',
  samples: [
      { in: '4\n()[]{}\n([{}])\n(]\n([)]\n', out: 'EVET\nEVET\nHAYIR\nHAYIR\n', why: 'İlk ikisi düzgün kapanıyor. "(]" tür uyuşmazlığı, "([)]" sıra hatası.' },
      { in: '2\n((\n))\n', out: 'HAYIR\nHAYIR\n', why: 'İlki kapanmadan bitiyor, ikincisi açılmadan kapanıyor.' }
  ],
  hidden: [
      { in: '1\n(\n', out: 'HAYIR\n' },
      { in: '1\n)\n', out: 'HAYIR\n' },
      { in: '1\n{[]}\n', out: 'EVET\n' },
      { in: '3\n[\n]\n[]\n', out: 'HAYIR\nHAYIR\nEVET\n' },
      { in: '2\n{{{{}}}}\n{{{{}}}\n', out: 'EVET\nHAYIR\n' },
      { in: '1\n()(())((()))[]\n', out: 'EVET\n' },
      { gen: 'import random\nrandom.seed(146)\ndef uret(n):\n    s, st = [], []\n    for _ in range(n):\n        if st and random.random() < 0.5:\n            s.append(st.pop())\n        else:\n            a, b = random.choice([\'()\', \'[]\', \'{}\'])\n            s.append(a); st.append(b)\n    return \'\'.join(s) + \'\'.join(reversed(st))\na = uret(100000)\nprint(3)\nprint(a)\nprint(a[:-1])\nprint(a[:50000] + \')\' + a[50000:])\n' }
  ],
  start: 'import sys\nsatirlar = sys.stdin.read().split()\nq = int(satirlar[0])\neslik = {\')\': \'(\', \']\': \'[\', \'}\': \'{\'}\nfor s in satirlar[1:q + 1]:\n    yigin = []\n    # açılışları yığına koy, kapanışta tepeyle eşleştir\n',
  sol: 'import sys\nsatirlar = sys.stdin.read().split()\nq = int(satirlar[0])\neslik = {\')\': \'(\', \']\': \'[\', \'}\': \'{\'}\ncevap = []\nfor s in satirlar[1:q + 1]:\n    yigin = []\n    ok = True\n    for c in s:\n        if c in eslik:\n            if not yigin or yigin.pop() != eslik[c]:\n                ok = False\n                break\n        else:\n            yigin.append(c)\n    cevap.append(\'EVET\' if ok and not yigin else \'HAYIR\')\nprint(\'\\n\'.join(cevap))\n',
  editorial: '<p><b>Yaklaşım:</b> Yığın (stack) son giren ilk çıkar (LIFO) mantığıyla çalışır; iç içe yapının en içteki açılışı ilk kapanmalıdır. Açılışları yığına it; kapanış gelince yığının tepesindeki açılış aynı türden olmalı, değilse ya da yığın boşsa geçersiz. Sonda yığın boş kalmalı.</p>\n<p><b>Karmaşıklık:</b> O(n) zaman, en kötü O(n) bellek. Python\'da liste <code>append</code>/<code>pop</code> ile mükemmel bir yığındır.</p>\n<p><b>Naif çözüm neden yetmez:</b> "İçinde () [] {} kaldıkça sil" döngüsü her turda metni yeniden kurar: O(n²). Derin iç içe 10^5\'lik bir şablonda on binlerce tur demek. Sadece açılış/kapanış <b>sayılarını</b> karşılaştırmak ise "([)]" gibi sıra hatalarını yakalayamaz.</p>\n<p><b>Sık hata:</b> Sonda yığının boş olup olmadığını kontrol etmemek ("((" geçerli sanılır) ya da boş yığından <code>pop</code> yapıp <code>IndexError</code> almak.</p>',
  hints: ['Açılışları bir listeye ekle (push).', 'Kapanışta tepeyi çıkar ve türünü kontrol et; sonda liste boş olmalı.']
},
{
  id: 'a-147',
  title: 'Sipariş kuyruğu simülasyonu',
  track: 'Veri yapıları',
  diff: 'Kolay',
  pts: 10,
  tags: ['kuyruk', 'deque'],
  src: 'HackerRank Queue using Two Stacks / collections.deque benzeri',
  mode: 'stdin',
  statement: '<p>Lezzet Kurye\'nin mutfak ekranı siparişleri geliş sırasıyla işliyor (ilk gelen ilk çıkar). Aşağıdaki komutları sırayla uygula:</p>\n<ul><li><code>EKLE x</code>: x numaralı siparişi kuyruğun sonuna ekle.</li>\n<li><code>TESLIM</code>: kuyruğun başındaki siparişi çıkar ve numarasını yaz; kuyruk boşsa <code>BOS</code> yaz.</li>\n<li><code>SIRADAKI</code>: baştaki siparişi çıkarmadan yaz; boşsa <code>BOS</code>.</li>\n<li><code>SAY</code>: kuyrukta kaç sipariş olduğunu yaz.</li></ul>',
  input: '<p>İlk satırda Q, sonraki Q satırda birer komut.</p>',
  output: '<p>EKLE dışındaki her komut için bir satır.</p>',
  constraints: '1 ≤ Q ≤ 2·10^5, 1 ≤ x ≤ 10^9',
  samples: [
      { in: '7\nEKLE 5\nEKLE 8\nSIRADAKI\nTESLIM\nSAY\nTESLIM\nTESLIM\n', out: '5\n5\n1\n8\nBOS\n', why: 'Önce 5 geldi: SIRADAKI 5, TESLIM 5, kalan 1, TESLIM 8, sonra kuyruk boş.' }
  ],
  hidden: [
      { in: '1\nSAY\n', out: '0\n' },
      { in: '2\nTESLIM\nSIRADAKI\n', out: 'BOS\nBOS\n' },
      { in: '4\nEKLE 1\nEKLE 1\nTESLIM\nSIRADAKI\n', out: '1\n1\n' },
      { in: '5\nEKLE 3\nTESLIM\nEKLE 4\nSAY\nSIRADAKI\n', out: '3\n1\n4\n' },
      { in: '3\nEKLE 1000000000\nSAY\nTESLIM\n', out: '1\n1000000000\n' },
      { gen: 'import random\nrandom.seed(147)\nq = 200000\nprint(q)\nout = []\nfor i in range(q):\n    if i < 120000:\n        out.append(\'EKLE \' + str(random.randint(1, 10**9)) if random.random() < 0.85 else random.choice([\'SAY\', \'SIRADAKI\']))\n    else:\n        out.append(random.choice([\'TESLIM\', \'TESLIM\', \'TESLIM\', \'SAY\', \'SIRADAKI\']))\nprint(\'\\n\'.join(out))\n' }
  ],
  start: 'import sys\nfrom collections import deque\ninput = sys.stdin.readline\nq = int(input())\nkuyruk = deque()\nfor _ in range(q):\n    komut = input().split()\n    # komutu işle\n',
  sol: 'import sys\nfrom collections import deque\nsatirlar = sys.stdin.read().split(\'\\n\')\nq = int(satirlar[0])\nkuyruk = deque()\ncikti = []\nfor k in range(1, q + 1):\n    komut = satirlar[k].split()\n    if komut[0] == \'EKLE\':\n        kuyruk.append(komut[1])\n    elif komut[0] == \'TESLIM\':\n        cikti.append(kuyruk.popleft() if kuyruk else \'BOS\')\n    elif komut[0] == \'SIRADAKI\':\n        cikti.append(kuyruk[0] if kuyruk else \'BOS\')\n    else:\n        cikti.append(str(len(kuyruk)))\nprint(\'\\n\'.join(cikti))\n',
  editorial: '<p><b>Yaklaşım:</b> İlk giren ilk çıkar (FIFO) yapısı kuyruktur. Python\'da <code>collections.deque</code> iki uçtan da O(1) ekleme/çıkarma yapar: <code>append</code> ile sona ekle, <code>popleft</code> ile baştan al, <code>[0]</code> ile baştakine bak.</p>\n<p><b>Karmaşıklık:</b> Komut başına O(1), toplam O(Q).</p>\n<p><b>Naif çözüm neden yetmez:</b> Listeyle <code>liste.pop(0)</code> her seferinde tüm elemanları bir sola kaydırır: O(n). Kuyrukta 10^5 sipariş varken 8·10^4 TESLIM komutu ~4·10^9 eleman kaydırması demektir. (Liste ile "baş indeksi" tutarak da O(1) yapılabilir, ama bellek geri verilmez.)</p>\n<p><b>Sık hata:</b> Boş kuyrukta <code>popleft</code> çağırıp <code>IndexError</code> almak ve SAY çıktısını sayı yerine liste olarak yazdırmak. Mülakat varyantı: iki yığınla kuyruk (biri gelen, biri giden) da amortize O(1)\'dir.</p>',
  hints: ['collections.deque kullan.', 'TESLIM ve SIRADAKI\'de önce boş mu diye bak.']
},
{
  id: 'a-148',
  title: 'Hediye çekine tam uyan iki ürün',
  track: 'Veri yapıları',
  diff: 'Kolay',
  pts: 10,
  tags: ['hash', 'sözlük'],
  src: 'LeetCode 1 Two Sum benzeri',
  mode: 'stdin',
  statement: '<p>Anadolu Market\'te bir müşterinin K TL\'lik hediye çeki var ve sepetine <b>tutarı tam K olan iki farklı ürün</b> eklemek istiyor. Ürünler raf sırasıyla 1\'den N\'ye numaralı, i. ürünün fiyatı a<sub>i</sub>.</p>\n<p>a<sub>i</sub> + a<sub>j</sub> = K ve i &lt; j olan bir çift bul. Birden çok çift varsa <b>j\'si en küçük</b> olanı, o da eşitse <b>i\'si en küçük</b> olanı seç. Çift yoksa <code>YOK</code> yaz.</p>',
  input: '<p>İlk satırda N ve K. İkinci satırda N fiyat.</p>',
  output: '<p><code>i j</code> (1 tabanlı) ya da <code>YOK</code>.</p>',
  constraints: '2 ≤ N ≤ 2·10^5, 1 ≤ a, K ≤ 2·10^9',
  samples: [
      { in: '5 9\n2 7 11 15 7\n', out: '1 2\n', why: 'j=2 için 2+7=9 bulunur: 1 2.' },
      { in: '4 10\n5 3 6 5\n', out: '1 4\n', why: 'j=3\'te 3 ile eşleşecek 7 yok; ilk uygun j=4: 5+5 → 1 4.' }
  ],
  hidden: [
      { in: '2 4\n2 2\n', out: '1 2\n' },
      { in: '2 5\n2 2\n', out: 'YOK\n' },
      { in: '3 6\n3 3 3\n', out: '1 2\n' },
      { in: '6 100\n1 2 3 4 5 6\n', out: 'YOK\n' },
      { in: '5 8\n4 1 7 4 1\n', out: '2 3\n' },
      { gen: 'import random\nrandom.seed(148)\nn = 200000\na = [random.randint(1, 10**9) * 2 for _ in range(n)]\nprint(n, 999999999)\nprint(*a)\n' },
      { gen: 'import random\nrandom.seed(1480)\nn = 200000\na = [random.randint(1, 10**9) for _ in range(n)]\na[150000] = 1234\na[199999] = 2 * 10**9 - 1234\nprint(n, 2 * 10**9)\nprint(*a)\n' }
  ],
  start: 'n, k = map(int, input().split())\na = list(map(int, input().split()))\nilk_gorulen = {}\n# her j için k - a[j] daha önce görüldü mü?\n',
  sol: 'n, k = map(int, input().split())\na = list(map(int, input().split()))\nilk_gorulen = {}\ncevap = \'YOK\'\nfor j, x in enumerate(a):\n    i = ilk_gorulen.get(k - x)\n    if i is not None:\n        cevap = f\'{i + 1} {j + 1}\'\n        break\n    if x not in ilk_gorulen:\n        ilk_gorulen[x] = j\nprint(cevap)\n',
  editorial: '<p><b>Yaklaşım:</b> Soldan sağa geç; her j için tamamlayıcı <code>K − a[j]</code> daha önce görüldü mü diye sözlüğe bak (O(1)). Sözlükte her değerin <b>ilk</b> görüldüğü indeksi sakla; böylece aynı j için en küçük i gelir. j\'yi soldan taradığın için bulduğun ilk çift j\'si en küçük olandır.</p>\n<p><b>Karmaşıklık:</b> O(N) zaman, O(N) bellek.</p>\n<p><b>Naif çözüm neden yetmez:</b> Tüm çiftleri denemek O(N²) = 2·10^10 (gizli testte çift yok, yani tamamı taranır). Sıralayıp iki işaretçi O(N log N) çalışır ama orijinal indeksleri ve "en küçük j" kuralını korumak zahmetlidir.</p>\n<p><b>Sık hata:</b> Önce sözlüğe ekleyip sonra bakmak: K = 2·a[j] iken ürünü kendisiyle eşleştirirsin. Ya da her görüşte indeksi güncelleyip en küçük i\'yi kaybetmek.</p>',
  hints: ['Her j için aradığın değer K − a[j].', 'Önce sözlüğe bak, sonra (ilk kez görülüyorsa) ekle.']
},
{
  id: 'a-149',
  title: 'Anagram ürün etiketleri',
  track: 'Veri yapıları',
  diff: 'Kolay',
  pts: 10,
  tags: ['hash', 'gruplama'],
  src: 'LeetCode 49 Group Anagrams benzeri',
  mode: 'stdin',
  statement: '<p>Anadolu Market\'in stok sistemine yanlışlıkla harfleri karışmış etiketler girilmiş: "elma" ile "lame", "male" aynı harflerden oluşuyor. Veri ekibi, aynı harf çokluğuna sahip etiketleri (anagramları) bir grup sayıyor.</p>\n<p>Kaç farklı grup olduğunu ve en kalabalık grubun kaç etiket içerdiğini yaz.</p>',
  input: '<p>İlk satırda N. İkinci satırda boşlukla ayrılmış N etiket (küçük İngilizce harfler).</p>',
  output: '<p>Tek satırda <code>grup_sayisi en_buyuk_grup</code>.</p>',
  constraints: '1 ≤ N ≤ 10^5, 1 ≤ etiket uzunluğu ≤ 10',
  samples: [
      { in: '6\neat tea tan ate nat bat\n', out: '3 3\n', why: 'Gruplar: {eat, tea, ate}, {tan, nat}, {bat} → 3 grup, en büyüğü 3.' }
  ],
  hidden: [
      { in: '1\na\n', out: '1 1\n' },
      { in: '3\nab ba ab\n', out: '1 3\n' },
      { in: '4\nabc abd bcd cde\n', out: '4 1\n' },
      { in: '5\naab aba baa abb bab\n', out: '2 3\n' },
      { in: '3\na aa aaa\n', out: '3 1\n' },
      { gen: 'import random\nrandom.seed(149)\nn = 100000\nprint(n)\nprint(*[\'\'.join(random.choice(\'abcde\') for _ in range(random.randint(1, 6))) for _ in range(n)])\n' },
      { gen: 'import random\nrandom.seed(1490)\nn = 100000\nprint(n)\nprint(*[\'\'.join(random.choice(\'abcdefghijklmnopqrstuvwxyz\') for _ in range(10)) for _ in range(n)])\n' }
  ],
  start: 'from collections import defaultdict\nn = int(input())\netiketler = input().split()\ngruplar = defaultdict(int)\n# her etiket için sıralı harflerden bir anahtar üret\n',
  sol: 'from collections import defaultdict\nn = int(input())\netiketler = input().split()\ngruplar = defaultdict(int)\nfor e in etiketler:\n    gruplar[\'\'.join(sorted(e))] += 1\nprint(len(gruplar), max(gruplar.values()))\n',
  editorial: '<p><b>Yaklaşım:</b> Anagramların ortak bir "imzası" vardır: harflerinin sıralanmış hâli (<code>\'\'.join(sorted(e))</code>) ya da 26 elemanlı harf sayacı demeti. Bu imzayı sözlük anahtarı yapıp say. Grup sayısı = sözlükteki anahtar sayısı.</p>\n<p><b>Karmaşıklık:</b> O(N · L log L), L ≤ 10. Sayaç imzası ile O(N · L).</p>\n<p><b>Naif çözüm neden yetmez:</b> Her etiketi mevcut tüm gruplarla karşılaştırmak O(N · G) — gizli testte neredeyse her etiket kendi grubunda, yani O(N²) = 10^10 karşılaştırma.</p>\n<p><b>Sık hata:</b> Anahtar olarak <code>set(e)</code> kullanmak: "aab" ile "abb" aynı kümeyi verir ama anagram değildir. Liste anahtar olamaz (hashlenemez); demet ya da metin kullan.</p>',
  hints: ['Anagramların sıralanmış harfleri aynıdır.', 'Bu sıralı metni sözlük anahtarı yap.']
},
{
  id: 'a-150',
  title: 'Kasada anlık en düşük tutar',
  track: 'Veri yapıları',
  diff: 'Orta',
  pts: 30,
  tags: ['yığın', 'tasarım'],
  src: 'LeetCode 155 Min Stack benzeri',
  mode: 'stdin',
  statement: '<p>Ilgaz Bank şubesindeki kasa, yatırılan zarfları üst üste koyuyor (son konan ilk alınır). Şube müdürü her an yığındaki <b>en düşük tutarlı</b> zarfı da bilmek istiyor. Komutlar:</p>\n<ul><li><code>KOY x</code>: x tutarlı zarfı tepeye koy.</li>\n<li><code>AL</code>: tepedeki zarfı çıkar (yığın boşsa <code>BOS</code> yaz, aksi hâlde bir şey yazma).</li>\n<li><code>TEPE</code>: tepedeki tutarı yaz (boşsa <code>BOS</code>).</li>\n<li><code>MIN</code>: yığındaki en küçük tutarı yaz (boşsa <code>BOS</code>).</li></ul>',
  input: '<p>İlk satırda Q, sonraki Q satırda birer komut.</p>',
  output: '<p>Çıktı üreten her komut için bir satır.</p>',
  constraints: '1 ≤ Q ≤ 2·10^5, −10^9 ≤ x ≤ 10^9',
  samples: [
      { in: '8\nKOY 5\nKOY 3\nKOY 7\nMIN\nAL\nAL\nMIN\nTEPE\n', out: '3\n5\n5\n', why: 'İlk MIN 3. İki AL ile 7 ve 3 çıkar; kalan 5: MIN 5, TEPE 5.' }
  ],
  hidden: [
      { in: '2\nMIN\nAL\n', out: 'BOS\nBOS\n' },
      { in: '4\nKOY -1\nKOY -1\nAL\nMIN\n', out: '-1\n' },
      { in: '5\nKOY 2\nKOY 2\nKOY 1\nAL\nMIN\n', out: '2\n' },
      { in: '6\nKOY 9\nAL\nTEPE\nMIN\nKOY 4\nMIN\n', out: 'BOS\nBOS\n4\n' },
      { in: '5\nKOY 3\nKOY 1\nKOY 2\nAL\nMIN\n', out: '1\n' },
      { gen: 'import random\nrandom.seed(150)\nq = 200000\nprint(q)\nout = []\nfor i in range(q):\n    if i < 100000:\n        out.append(\'KOY \' + str(10**9 - i * 7 + random.randint(0, 5)) if random.random() < 0.9 else \'MIN\')\n    else:\n        out.append(random.choice([\'AL\', \'MIN\', \'MIN\', \'TEPE\']))\nprint(\'\\n\'.join(out))\n' }
  ],
  start: 'import sys\ninput = sys.stdin.readline\nq = int(input())\nyigin = []   # (deger, o ana kadarki_min) çiftleri tutabilirsin\nfor _ in range(q):\n    komut = input().split()\n',
  sol: 'import sys\nsatirlar = sys.stdin.read().split(\'\\n\')\nq = int(satirlar[0])\nyigin = []\ncikti = []\nfor k in range(1, q + 1):\n    komut = satirlar[k].split()\n    c = komut[0]\n    if c == \'KOY\':\n        x = int(komut[1])\n        m = x if not yigin or x < yigin[-1][1] else yigin[-1][1]\n        yigin.append((x, m))\n    elif c == \'AL\':\n        if yigin:\n            yigin.pop()\n        else:\n            cikti.append(\'BOS\')\n    elif c == \'TEPE\':\n        cikti.append(str(yigin[-1][0]) if yigin else \'BOS\')\n    else:\n        cikti.append(str(yigin[-1][1]) if yigin else \'BOS\')\nprint(\'\\n\'.join(cikti))\n',
  editorial: '<p><b>Yaklaşım:</b> Her elemanı, eklendiği andaki yığın minimumuyla birlikte sakla: <code>(x, min(x, önceki_min))</code>. Tepeden çıkarınca altındaki elemanın kaydettiği minimum otomatik olarak geçerli olur; hiçbir şeyi yeniden hesaplamazsın. (Alternatif: ayrı bir "minimumlar yığını".)</p>\n<p><b>Karmaşıklık:</b> Her komut O(1), toplam O(Q); bellek O(Q).</p>\n<p><b>Naif çözüm neden yetmez:</b> MIN için her seferinde <code>min(yigin)</code> çağırmak O(n). Gizli testte yığında ~9·10^4 eleman varken 5·10^4 MIN komutu ~4,5·10^9 karşılaştırma demek. Tek bir "en küçük" değişkeni tutmak da yetmez: en küçük eleman AL ile çıkınca bir öncekini bilemezsin.</p>\n<p><b>Sık hata:</b> Eşit minimumları atlamak (ayrı minimum yığınında <code>&lt;</code> yerine <code>&lt;=</code> kullanılmalı) ve boş yığında AL komutunu sessizce yutmak.</p>',
  hints: [
      'Tek bir min değişkeni yetmez; çıkarılan eleman minimumsa ne olacak?',
      'Her elemanla birlikte "o ana kadarki minimumu" sakla.'
  ]
},
{
  id: 'a-151',
  title: 'Daha yüksek ciroya kaç gün var?',
  track: 'Veri yapıları',
  diff: 'Orta',
  pts: 30,
  tags: ['monoton yığın'],
  src: 'LeetCode 739 Daily Temperatures benzeri',
  mode: 'stdin',
  statement: '<p>Anadolu Market\'in analistleri her gün için şu soruyu soruyor: "Bugünkü cirodan <b>kesinlikle daha yüksek</b> ciro kaç gün sonra görüldü?" Böyle bir gün gelmediyse cevap 0.</p>\n<p>Her gün için bekleme süresini yazdır.</p>',
  input: '<p>İlk satırda N. İkinci satırda N günlük ciro.</p>',
  output: '<p>Tek satırda N tam sayı.</p>',
  constraints: '1 ≤ N ≤ 2·10^5, 0 ≤ ciro ≤ 10^9',
  samples: [
      { in: '8\n73 74 75 71 69 72 76 73\n', out: '1 1 4 2 1 1 0 0\n', why: '73 → ertesi gün 74 (1). 75 → 4 gün sonra 76. Son gün için daha yüksek yok (0).' }
  ],
  hidden: [
      { in: '1\n5\n', out: '0\n' },
      { in: '4\n1 2 3 4\n', out: '1 1 1 0\n' },
      { in: '4\n4 3 2 1\n', out: '0 0 0 0\n' },
      { in: '5\n3 3 3 3 4\n', out: '4 3 2 1 0\n' },
      { in: '6\n2 1 1 1 1 3\n', out: '5 4 3 2 1 0\n' },
      { gen: 'import random\nrandom.seed(151)\nn = 200000\nprint(n)\nprint(*[random.randint(0, 10**9) for _ in range(n)])\n' },
      { gen: 'n = 200000\nprint(n)\nprint(*(list(range(n - 1, 0, -1)) + [n]))\n' }
  ],
  start: 'n = int(input())\nciro = list(map(int, input().split()))\ncevap = [0] * n\nyigin = []   # cevabı henüz bulunmamış günlerin indeksleri\n# her yeni gün, yığının tepesindeki daha düşük günleri çözer\n',
  sol: 'n = int(input())\nciro = list(map(int, input().split()))\ncevap = [0] * n\nyigin = []\nfor i, c in enumerate(ciro):\n    while yigin and ciro[yigin[-1]] < c:\n        j = yigin.pop()\n        cevap[j] = i - j\n    yigin.append(i)\nprint(*cevap)\n',
  editorial: '<p><b>Yaklaşım:</b> Monoton azalan yığın. Yığında, cevabı henüz bulunmamış günlerin indeksleri vardır ve cirolar tepeye doğru azalmayan biçimde dizilidir. Yeni gün geldiğinde tepedeki daha düşük cirolu günlerin "ilk daha yüksek günü" bugündür: onları çıkar, farkı yaz. Sonra bugünü yığına koy.</p>\n<p><b>Karmaşıklık:</b> Her indeks yığına bir kez girip en fazla bir kez çıkar: O(N) zaman (amortize), O(N) bellek.</p>\n<p><b>Naif çözüm neden yetmez:</b> Her gün için ileri doğru tarama O(N²). Gizli testte cirolar sürekli azalıp en sonda yükseliyor: her gün N\'ye kadar tarar, ~2·10^10 adım.</p>\n<p><b>Bu kalıbı tanı:</b> "Sağdaki/soldaki ilk daha büyük/küçük eleman" sorularının hepsi monoton yığındır (hisse fiyatı açıklığı, histogramdaki en büyük dikdörtgen...). <b>Sık hata:</b> Yığına değer koymak: mesafe için indeks gerekir.</p>',
  hints: ['Cevabı bekleyen günleri bir yığında tut.', 'Yeni gün, tepedeki kendisinden düşük cirolu tüm günlerin cevabıdır.']
},
{
  id: 'a-152',
  title: 'En çok satan K ürün',
  track: 'Veri yapıları',
  diff: 'Kolay',
  pts: 10,
  tags: ['hash', 'Counter', 'heap'],
  src: 'LeetCode 347 / 692 Top K Frequent benzeri',
  mode: 'stdin',
  statement: '<p>Anadolu Market\'in günlük satış kaydında her satır satılan bir ürünün kodudur. Pazarlama ekibi en çok satan K ürünü istiyor: satış adedi çok olan önce, adetler eşitse kodu <b>alfabetik olarak küçük</b> olan önce.</p>\n<p>Farklı ürün sayısı K\'dan azsa hepsini yaz.</p>',
  input: '<p>İlk satırda N ve K. İkinci satırda boşlukla ayrılmış N ürün kodu.</p>',
  output: '<p>Her satırda <code>kod adet</code>.</p>',
  constraints: '1 ≤ N ≤ 2·10^5, 1 ≤ K ≤ 1000, kodlar 1–8 karakter',
  samples: [
      { in: '8 2\ncay seker cay un seker cay un un\n', out: 'cay 3\nun 3\n', why: 'cay 3, un 3, seker 2. Eşit olanlardan cay alfabetik önce.' }
  ],
  hidden: [
      { in: '1 1\nx\n', out: 'x 1\n' },
      { in: '3 5\na b a\n', out: 'a 2\nb 1\n' },
      { in: '4 2\nd c b a\n', out: 'a 1\nb 1\n' },
      { in: '6 1\nzz zz yy yy xx xx\n', out: 'xx 2\n' },
      { in: '5 3\nab ab b b a\n', out: 'ab 2\nb 2\na 1\n' },
      { gen: 'import random\nrandom.seed(152)\nkodlar = [\'\'.join(random.choice(\'abcdefgh\') for _ in range(4)) for _ in range(3000)]\nn = 200000\nprint(n, 50)\nprint(*[random.choice(kodlar[:random.randint(1, 3000)]) for _ in range(n)])\n' }
  ],
  start: 'from collections import Counter\nn, k = map(int, input().split())\nkodlar = input().split()\nsayac = Counter(kodlar)\n# adet azalan, kod artan sırada ilk k\n',
  sol: 'from collections import Counter\nimport heapq\nn, k = map(int, input().split())\nkodlar = input().split()\nsayac = Counter(kodlar)\nenler = heapq.nsmallest(k, sayac.items(), key=lambda t: (-t[1], t[0]))\nprint(\'\\n\'.join(f\'{kod} {adet}\' for kod, adet in enler))\n',
  editorial: '<p><b>Yaklaşım:</b> Önce <code>Counter</code> ile adetleri say (O(N)). Sonra U farklı ürün arasından ilk K\'yı seç: <code>heapq.nsmallest(K, ..., key=(-adet, kod))</code> O(U log K), ya da tümünü sıralamak O(U log U). İkisi de burada rahat geçer.</p>\n<p><b>Karmaşıklık:</b> O(N + U log K).</p>\n<p><b>Naif çözüm neden yetmez:</b> Her farklı kod için <code>liste.count(kod)</code> çağırmak O(N · U) = 2·10^5 × 3000 = 6·10^8; CPython\'da dakikalar sürer.</p>\n<p><b>Sık hata:</b> <code>Counter.most_common(K)</code> eşitlikleri ilk görülme sırasına göre bırakır, alfabetik değil; bu yüzden ikincil anahtarı kendin vermelisin. <b>Uzmanlaş:</b> Kova sıralaması (adet → kodlar listesi) ile O(N) çözüm de mümkün.</p>',
  hints: ['Counter ile say.', 'Anahtar (−adet, kod) ile sırala ya da heapq.nsmallest kullan.']
},
{
  id: 'a-153',
  title: 'Kargo vagonlarını ters çevir',
  track: 'Veri yapıları',
  diff: 'Kolay',
  pts: 10,
  tags: ['bağlı liste', 'sınıf', 'işaretçi'],
  src: 'LeetCode 206 Reverse Linked List benzeri',
  mode: 'func',
  fn: 'ters_cevir',
  statement: '<p>Kanat Havayolları\'nın kargo treninde vagonlar tek yönlü bağlı liste ile modelleniyor: her <code>Dugum</code> nesnesinin <code>deger</code> (vagon numarası) ve <code>sonraki</code> (arkasındaki vagon ya da <code>None</code>) alanları var. Tren ters yönde yüklenecek.</p>\n<p><code>ters_cevir(bas)</code> fonksiyonunu yaz: listeyi <b>yerinde</b> ters çevirip yeni baş düğümü döndürsün. Yeni düğüm oluşturma; mevcut düğümlerin <code>sonraki</code> bağlarını değiştir. Boş liste için <code>None</code> döndür.</p>',
  input: '<p>Fonksiyon girdisi: bağlı listenin baş düğümü (<code>Dugum</code> ya da <code>None</code>).</p>',
  output: '<p>Ters çevrilmiş listenin baş düğümü.</p>',
  constraints: '0 ≤ düğüm sayısı ≤ 10^5',
  samples: [
      { in: 'ters_cevir(1 → 2 → 3 → 4)', out: '4 → 3 → 2 → 1', why: 'Her düğümün okunu bir öncekine çevir.' },
      { in: 'ters_cevir(None)', out: 'None', why: 'Boş liste boş kalır.' }
  ],
  tests: 'def _kur(degerler):\n    bas = None\n    for v in reversed(degerler):\n        bas = Dugum(v, bas)\n    return bas\n\ndef _liste(bas, sinir=10**6):\n    out = []\n    while bas is not None and len(out) < sinir:\n        out.append(bas.deger)\n        bas = bas.sonraki\n    return out\n\ndef _dugumler(bas):\n    out = []\n    while bas is not None:\n        out.append(bas)\n        bas = bas.sonraki\n    return out\nassert ters_cevir(None) is None\nassert _liste(ters_cevir(_kur([7]))) == [7]\nassert _liste(ters_cevir(_kur([1, 2, 3, 4]))) == [4, 3, 2, 1]\nassert _liste(ters_cevir(_kur([5, 5, 1]))) == [1, 5, 5]\n_b = _kur(list(range(10)))\n_d = _dugumler(_b)\n_y = ters_cevir(_b)\nassert _dugumler(_y) == _d[::-1], \'yeni düğüm oluşturma; mevcut düğümleri yeniden bağla\'\nassert _d[0].sonraki is None\n_buyuk = list(range(100000))\nassert _liste(ters_cevir(_kur(_buyuk))) == _buyuk[::-1], \'10^5 düğümde de çalışmalı (özyineleme derinliğine dikkat)\'\n',
  start: 'class Dugum:\n    def __init__(self, deger, sonraki=None):\n        self.deger = deger\n        self.sonraki = sonraki\n\n\ndef ters_cevir(bas):\n    onceki = None\n    simdiki = bas\n    # TODO: her adımda simdiki.sonraki\'yi onceki\'ye çevir\n    pass\n',
  sol: 'class Dugum:\n    def __init__(self, deger, sonraki=None):\n        self.deger = deger\n        self.sonraki = sonraki\n\n\ndef ters_cevir(bas):\n    onceki = None\n    simdiki = bas\n    while simdiki is not None:\n        sonraki = simdiki.sonraki\n        simdiki.sonraki = onceki\n        onceki = simdiki\n        simdiki = sonraki\n    return onceki\n',
  editorial: '<p><b>Yaklaşım:</b> Üç işaretçi: <code>onceki</code>, <code>simdiki</code>, <code>sonraki</code>. Her adımda önce <code>sonraki = simdiki.sonraki</code> ile yolu kaybetmemek için ilerideki düğümü sakla, sonra <code>simdiki.sonraki = onceki</code> ile oku ters çevir, ardından iki işaretçiyi bir adım ilerlet. Döngü bitince <code>onceki</code> yeni baştır.</p>\n<p><b>Karmaşıklık:</b> O(n) zaman, O(1) ek bellek.</p>\n<p><b>Naif/alternatif çözümler:</b> Değerleri listeye kopyalayıp ters sırayla yeni düğümler kurmak O(n) bellek harcar ve testteki "aynı düğümler" şartını bozar. Özyinelemeli çözüm zariftir ama 10^5 düğümde Python\'un ~1000\'lik özyineleme sınırına takılır (<code>RecursionError</code>).</p>\n<p><b>Sık hata:</b> <code>simdiki.sonraki</code>\'yi değiştirmeden önce saklamamak (liste kopar) ve eski baş düğümün <code>sonraki</code>\'sini <code>None</code> yapmamak (döngü oluşur).</p>',
  hints: ['onceki = None ile başla.', 'Bağı değiştirmeden önce bir sonraki düğümü bir değişkende sakla.']
},
{
  id: 'a-154',
  title: 'Rota zincirinde döngünün başladığı durak',
  track: 'Veri yapıları',
  diff: 'Orta',
  pts: 30,
  tags: ['bağlı liste', 'sınıf', 'Floyd', 'iki işaretçi'],
  src: 'LeetCode 142 Linked List Cycle II benzeri',
  mode: 'func',
  fn: 'dongu_baslangici',
  statement: '<p>Lezzet Kurye\'nin rota motoru durakları tek yönlü bağlı liste olarak tutuyor (<code>Dugum</code>: <code>deger</code>, <code>sonraki</code>). Hatalı bir güncelleme yüzünden bazı rotalarda son durak, önceki duraklardan birine bağlanmış ve bir <b>döngü</b> oluşmuş olabilir.</p>\n<p><code>dongu_baslangici(bas)</code> fonksiyonunu yaz: döngü varsa döngünün <b>başladığı düğümü</b> (nesnenin kendisini), yoksa <code>None</code> döndürsün. Listeyi değiştirme. Hedef: O(1) ek bellek.</p>',
  input: '<p>Fonksiyon girdisi: listenin baş düğümü (döngü içerebilir).</p>',
  output: '<p>Döngünün ilk düğümü ya da <code>None</code>.</p>',
  constraints: '0 ≤ düğüm sayısı ≤ 10^5',
  samples: [
      { in: 'dongu_baslangici(3 → 2 → 0 → -4 → (tekrar 2))', out: 'değeri 2 olan düğüm', why: 'Son düğüm 2. düğüme bağlanmış.' },
      { in: 'dongu_baslangici(1 → 2 → None)', out: 'None', why: 'Döngü yok.' }
  ],
  tests: 'def _kur(degerler):\n    bas = None\n    for v in reversed(degerler):\n        bas = Dugum(v, bas)\n    return bas\n\ndef _liste(bas, sinir=10**6):\n    out = []\n    while bas is not None and len(out) < sinir:\n        out.append(bas.deger)\n        bas = bas.sonraki\n    return out\n\ndef _dugumler(bas):\n    out = []\n    while bas is not None:\n        out.append(bas)\n        bas = bas.sonraki\n    return out\ndef _donguli(degerler, pos):\n    bas = _kur(degerler)\n    d = _dugumler(bas)\n    if pos >= 0:\n        d[-1].sonraki = d[pos]\n    return bas, d\n\nassert dongu_baslangici(None) is None\n_b, _d = _donguli([1, 2], -1)\nassert dongu_baslangici(_b) is None\n_b, _d = _donguli([3, 2, 0, -4], 1)\nassert dongu_baslangici(_b) is _d[1]\n_b, _d = _donguli([1], 0)\nassert dongu_baslangici(_b) is _d[0]\n_b, _d = _donguli([1, 2], 0)\nassert dongu_baslangici(_b) is _d[0]\n_b, _d = _donguli([7, 7, 7, 7, 7], 3)\nassert dongu_baslangici(_b) is _d[3], \'değer değil düğüm kimliği karşılaştırılmalı\'\n_b, _d = _donguli(list(range(100000)), 99999)\nassert dongu_baslangici(_b) is _d[99999]\n_b, _d = _donguli(list(range(100000)), 12345)\nassert dongu_baslangici(_b) is _d[12345]\nassert _d[-1].sonraki is _d[12345], \'liste değiştirilmemeli\'\n_b, _d = _donguli(list(range(100000)), -1)\nassert dongu_baslangici(_b) is None\n',
  start: 'class Dugum:\n    def __init__(self, deger, sonraki=None):\n        self.deger = deger\n        self.sonraki = sonraki\n\n\ndef dongu_baslangici(bas):\n    yavas = hizli = bas\n    # TODO: önce buluşma noktasını bul, sonra döngü başını\n    pass\n',
  sol: 'class Dugum:\n    def __init__(self, deger, sonraki=None):\n        self.deger = deger\n        self.sonraki = sonraki\n\n\ndef dongu_baslangici(bas):\n    yavas = hizli = bas\n    while hizli is not None and hizli.sonraki is not None:\n        yavas = yavas.sonraki\n        hizli = hizli.sonraki.sonraki\n        if yavas is hizli:\n            yavas = bas\n            while yavas is not hizli:\n                yavas = yavas.sonraki\n                hizli = hizli.sonraki\n            return yavas\n    return None\n',
  editorial: '<p><b>Yaklaşım (Floyd\'un kaplumbağa–tavşan algoritması):</b> Yavaş işaretçi bir, hızlı işaretçi iki adım ilerler. Döngü yoksa hızlı olan <code>None</code>\'a ulaşır. Döngü varsa döngü içinde buluşurlar. Baştan döngü başına uzaklık a, döngü başından buluşma noktasına b, döngü uzunluğu c olsun: hızlı 2 kat yol aldığından a + b ≡ 0 (mod c), yani buluşma noktasından a adım daha gidince döngü başına varılır. Bu yüzden bir işaretçiyi başa al, ikisini de birer adım ilerlet; buluştukları düğüm döngü başıdır.</p>\n<p><b>Karmaşıklık:</b> O(n) zaman, O(1) bellek.</p>\n<p><b>Basit alternatif:</b> Ziyaret edilen düğümleri bir <code>set</code>\'te tutmak O(n) zaman ama O(n) bellektir; bu soru özellikle sabit bellek ister. Değerleri kümede tutmak ise <b>yanlıştır</b>: farklı düğümler aynı değeri taşıyabilir (testteki 7\'li liste).</p>\n<p><b>Sık hata:</b> <code>==</code> yerine <code>is</code> kullanmamak, <code>hizli.sonraki</code>\'nin <code>None</code> olabileceğini kontrol etmemek ve listeyi işaretleyerek (ör. <code>deger</code>\'i değiştirerek) çözmek.</p>',
  hints: [
      'Biri 1, biri 2 adım ilerleyen iki işaretçi döngüde mutlaka buluşur.',
      'Buluşunca birini başa al; ikisini birer adım ilerlet, buluştukları yer döngü başı.'
  ]
},
{
  id: 'a-155',
  title: 'Sevkiyat zincirini K\'lı gruplar hâlinde çevir',
  track: 'Veri yapıları',
  diff: 'Zor',
  pts: 60,
  tags: ['bağlı liste', 'sınıf', 'işaretçi'],
  src: 'LeetCode 25 Reverse Nodes in k-Group benzeri',
  mode: 'func',
  fn: 'k_grup_ters',
  statement: '<p>Anadolu Market\'in dağıtım planında koliler tek yönlü bağlı liste (<code>Dugum</code>: <code>deger</code>, <code>sonraki</code>) olarak sıralı. Kamyonlar K\'şar koli alıyor ve her kamyona son yüklenen koli ilk indirilecek; bu yüzden listenin her ardışık K\'lık grubu kendi içinde ters çevrilmeli. Sonda K\'dan az koli kalırsa onlar <b>olduğu gibi</b> bırakılır.</p>\n<p><code>k_grup_ters(bas, k)</code> fonksiyonunu yaz ve yeni baş düğümü döndür. Düğümlerin değerlerini değiştirme; bağları yeniden kur.</p>',
  input: '<p>Fonksiyon girdisi: baş düğüm ve pozitif tam sayı k.</p>',
  output: '<p>Yeni baş düğüm.</p>',
  constraints: '0 ≤ düğüm sayısı ≤ 10^5, 1 ≤ k ≤ 10^5',
  samples: [
      { in: 'k_grup_ters(1 → 2 → 3 → 4 → 5, 2)', out: '2 → 1 → 4 → 3 → 5', why: '[1,2] ve [3,4] çevrildi; 5 tek kaldığı için yerinde.' },
      { in: 'k_grup_ters(1 → 2 → 3 → 4 → 5, 3)', out: '3 → 2 → 1 → 4 → 5', why: 'Kalan 2 düğüm K\'dan az.' }
  ],
  tests: 'def _kur(degerler):\n    bas = None\n    for v in reversed(degerler):\n        bas = Dugum(v, bas)\n    return bas\n\ndef _liste(bas, sinir=10**6):\n    out = []\n    while bas is not None and len(out) < sinir:\n        out.append(bas.deger)\n        bas = bas.sonraki\n    return out\n\ndef _dugumler(bas):\n    out = []\n    while bas is not None:\n        out.append(bas)\n        bas = bas.sonraki\n    return out\ndef _bek(v, k):\n    out = []\n    for i in range(0, len(v), k):\n        g = v[i:i + k]\n        out += g[::-1] if len(g) == k else g\n    return out\n\nassert k_grup_ters(None, 3) is None\nassert _liste(k_grup_ters(_kur([1, 2, 3, 4, 5]), 2)) == [2, 1, 4, 3, 5]\nassert _liste(k_grup_ters(_kur([1, 2, 3, 4, 5]), 3)) == [3, 2, 1, 4, 5]\nassert _liste(k_grup_ters(_kur([1, 2, 3, 4, 5]), 1)) == [1, 2, 3, 4, 5]\nassert _liste(k_grup_ters(_kur([1, 2, 3, 4]), 4)) == [4, 3, 2, 1]\nassert _liste(k_grup_ters(_kur([1, 2, 3]), 5)) == [1, 2, 3]\nassert _liste(k_grup_ters(_kur([1, 2, 3, 4, 5, 6]), 3)) == [3, 2, 1, 6, 5, 4]\n_v = list(range(12))\n_b = _kur(_v)\n_d = _dugumler(_b)\n_y = k_grup_ters(_b, 5)\nassert set(map(id, _dugumler(_y))) == set(map(id, _d)), \'yeni düğüm oluşturma\'\nassert _liste(_y) == _bek(_v, 5)\nfor _k in (2, 7, 1000, 99999, 100000):\n    _v = list(range(100000))\n    assert _liste(k_grup_ters(_kur(_v), _k)) == _bek(_v, _k), f\'k={_k} büyük girdi\'\n',
  start: 'class Dugum:\n    def __init__(self, deger, sonraki=None):\n        self.deger = deger\n        self.sonraki = sonraki\n\n\ndef k_grup_ters(bas, k):\n    sahte = Dugum(0, bas)\n    grup_onu = sahte\n    # TODO: k düğüm var mı kontrol et, varsa o grubu çevir ve bağla\n    pass\n',
  sol: 'class Dugum:\n    def __init__(self, deger, sonraki=None):\n        self.deger = deger\n        self.sonraki = sonraki\n\n\ndef k_grup_ters(bas, k):\n    sahte = Dugum(0, bas)\n    grup_onu = sahte\n    while True:\n        kth = grup_onu\n        for _ in range(k):\n            kth = kth.sonraki\n            if kth is None:\n                return sahte.sonraki\n        grup_sonrasi = kth.sonraki\n        onceki, simdiki = grup_sonrasi, grup_onu.sonraki\n        while simdiki is not grup_sonrasi:\n            sonraki = simdiki.sonraki\n            simdiki.sonraki = onceki\n            onceki = simdiki\n            simdiki = sonraki\n        ilk = grup_onu.sonraki\n        grup_onu.sonraki = kth\n        grup_onu = ilk\n',
  editorial: '<p><b>Yaklaşım:</b> Başa bir <b>sahte düğüm</b> (dummy) koy; böylece ilk grubun çevrilmesi özel durum olmaz. <code>grup_onu</code> her zaman çevrilecek grubun hemen önündeki düğümdür. Her turda: (1) K adım ilerleyerek grubun son düğümünü (<code>kth</code>) bul; K düğüm yoksa dur. (2) Grubu, ters çevirmenin <code>onceki</code> başlangıcı <code>grup_sonrasi</code> olacak şekilde çevir; böylece grubun yeni sonu doğrudan sonraki gruba bağlanır. (3) <code>grup_onu.sonraki = kth</code> yap ve <code>grup_onu</code>\'yu grubun yeni sonu (eski ilk düğüm) olarak ilerlet.</p>\n<p><b>Karmaşıklık:</b> Her düğüm sabit sayıda ziyaret edilir: O(n) zaman, O(1) ek bellek.</p>\n<p><b>Naif çözüm neden yetmez:</b> Değerleri listeye çekip dilimleri ters çevirmek ve değerleri geri yazmak "düğüm değerlerini değiştirme" kuralını çiğner ve O(n) bellek ister. Her grup için listeyi baştan sayarak gezmek O(n²/k) yapar (k küçükken 10^5 düğümde yavaş). Özyinelemeli çözüm ise k=2 ve n=10^5 için 5·10^4 derinliğe çıkar ve <code>RecursionError</code> verir.</p>\n<p><b>Sık hata:</b> Çevrilen grubun sonunu sonraki gruba bağlamayı unutmak (liste kopar) ve son eksik grubu da çevirmek.</p>',
  hints: [
      'Sahte bir baş düğüm kullan; grup_onu = sahte.',
      'Önce K düğüm var mı bak; varsa grubu, sonundaki düğüme bağlanacak şekilde çevir.',
      'Grubun eski ilk düğümü, bir sonraki turun grup_onu\'su olur.'
  ]
},
{
  id: 'a-156',
  title: 'Canlı satış tablosunda K. büyük',
  track: 'Veri yapıları',
  diff: 'Orta',
  pts: 30,
  tags: ['heap', 'öncelik kuyruğu'],
  src: 'LeetCode 703 Kth Largest Element in a Stream benzeri',
  mode: 'stdin',
  statement: '<p>Anadolu Market\'in kampanya gününde satış tutarları tek tek ekrana düşüyor. Yönetim ekranında "şu ana kadarki satışlar arasında <b>K. en büyük</b> tutar" sürekli gösteriliyor (bu tutarın üstündekiler ödül alacak).</p>\n<p>Her yeni satıştan sonra K. en büyük tutarı yaz; o ana kadar K\'dan az satış varsa <code>-1</code> yaz.</p>',
  input: '<p>İlk satırda N ve K. İkinci satırda N satış tutarı (geliş sırasıyla).</p>',
  output: '<p>Tek satırda N tam sayı.</p>',
  constraints: '1 ≤ K ≤ N ≤ 2·10^5, 1 ≤ tutar ≤ 10^9',
  samples: [
      { in: '6 3\n4 5 8 2 3 10\n', out: '-1 -1 4 4 4 5\n', why: 'İlk iki satışta 3 tutar yok: −1. Sonra [4,5,8] → 4; 2 eklenince yine 4; 3 → 4; 10 → [5,8,10] → 5.' }
  ],
  hidden: [
      { in: '1 1\n7\n', out: '7\n' },
      { in: '3 1\n5 1 9\n', out: '5 5 9\n' },
      { in: '4 4\n1 1 1 1\n', out: '-1 -1 -1 1\n' },
      { in: '5 2\n10 9 8 7 6\n', out: '-1 9 9 9 9\n' },
      { in: '5 3\n1 2 3 4 5\n', out: '-1 -1 1 2 3\n' },
      { gen: 'import random\nrandom.seed(156)\nn = 200000\nprint(n, 50000)\nprint(*[random.randint(1, 10**9) for _ in range(n)])\n' },
      { gen: 'n = 200000\nprint(n, 1000)\nprint(*range(1, n + 1))\n' }
  ],
  start: 'import heapq\nn, k = map(int, input().split())\nsatislar = list(map(int, input().split()))\nheap = []   # en büyük k tutarı tutan min-heap\n',
  sol: 'import heapq\nn, k = map(int, input().split())\nsatislar = list(map(int, input().split()))\nheap = []\ncikti = []\nfor x in satislar:\n    if len(heap) < k:\n        heapq.heappush(heap, x)\n    elif x > heap[0]:\n        heapq.heapreplace(heap, x)\n    cikti.append(heap[0] if len(heap) == k else -1)\nprint(*cikti)\n',
  editorial: '<p><b>Yaklaşım:</b> En büyük K tutarı boyutu K olan bir <b>min-heap</b>\'te tut. Heap\'in tepesi (<code>heap[0]</code>) bu K tutarın en küçüğü, yani K. en büyüktür. Yeni tutar tepeden büyükse <code>heapreplace</code> ile tepeyi at ve yeniyi ekle; değilse K. en büyük değişmez.</p>\n<p><b>Karmaşıklık:</b> Satış başına O(log K); toplam O(N log K), bellek O(K).</p>\n<p><b>Naif çözüm neden yetmez:</b> Her satıştan sonra tüm listeyi sıralamak O(N² log N); <code>bisect.insort</code> ile sıralı liste tutmak ekleme başına O(N) kaydırma yapar. N = 2·10^5 için ikisi de saniyeler, hatta dakikalar sürer.</p>\n<p><b>Sık hata:</b> Python\'un <code>heapq</code>\'su <b>min</b>-heap\'tir; "en büyükleri" tutmak için min-heap doğru seçimdir (en küçüğü atılacak olan). Max-heap sanıp negatif değerle uğraşmak gereksizdir.</p>',
  hints: ['Yalnız en büyük K tutarı tutman yeter.', 'Min-heap\'in tepesi bu K tutarın en küçüğü, yani cevaptır.']
},
{
  id: 'a-157',
  title: 'Kayan pencerede en yüksek bekleme süresi',
  track: 'Veri yapıları',
  diff: 'Zor',
  pts: 60,
  tags: ['deque', 'monoton kuyruk', 'kayan pencere'],
  src: 'LeetCode 239 Sliding Window Maximum benzeri',
  mode: 'stdin',
  statement: '<p>Lezzet Kurye\'nin müşteri hizmetleri, siparişlerin bekleme sürelerini dakika dakika izliyor. Son K siparişlik her pencerede <b>en uzun bekleme süresi</b> panoda gösteriliyor.</p>\n<p>N uzunluğundaki dizide K boyutlu her ardışık pencerenin maksimumunu (soldan sağa, N−K+1 değer) yazdır.</p>',
  input: '<p>İlk satırda N ve K. İkinci satırda N bekleme süresi.</p>',
  output: '<p>Tek satırda N−K+1 tam sayı.</p>',
  constraints: '1 ≤ K ≤ N ≤ 2·10^5, 0 ≤ süre ≤ 10^9',
  samples: [
      { in: '8 3\n1 3 0 2 5 3 6 7\n', out: '3 3 5 5 6 7\n', why: 'Pencereler: [1,3,0]→3, [3,0,2]→3, [0,2,5]→5, [2,5,3]→5, [5,3,6]→6, [3,6,7]→7.' }
  ],
  hidden: [
      { in: '1 1\n5\n', out: '5\n' },
      { in: '4 4\n1 9 2 8\n', out: '9\n' },
      { in: '5 1\n3 1 4 1 5\n', out: '3 1 4 1 5\n' },
      { in: '6 2\n9 8 7 6 5 4\n', out: '9 8 7 6 5\n' },
      { in: '6 3\n1 1 1 1 1 1\n', out: '1 1 1 1\n' },
      { gen: 'import random\nrandom.seed(157)\nn = 200000\nprint(n, 1000)\nprint(*[random.randint(0, 10**9) for _ in range(n)])\n' },
      { gen: 'n = 200000\nprint(n, 100000)\nprint(*range(n, 0, -1))\n' },
      { gen: 'n = 200000\nprint(n, 50000)\nprint(*range(n))\n' }
  ],
  start: 'from collections import deque\nn, k = map(int, input().split())\na = list(map(int, input().split()))\ndq = deque()   # indeksler; a değerleri azalan sırada\n',
  sol: 'from collections import deque\nn, k = map(int, input().split())\na = list(map(int, input().split()))\ndq = deque()\ncikti = []\nfor i, x in enumerate(a):\n    while dq and a[dq[-1]] <= x:\n        dq.pop()\n    dq.append(i)\n    if dq[0] <= i - k:\n        dq.popleft()\n    if i >= k - 1:\n        cikti.append(a[dq[0]])\nprint(*cikti)\n',
  editorial: '<p><b>Yaklaşım:</b> Monoton azalan deque. Deque\'te indeksler tutulur ve karşılık gelen değerler baştan sona azalır. Yeni eleman gelince sondan kendisinden küçük-eşit olanları at (artık asla maksimum olamazlar, çünkü daha yeni ve daha büyük biri var). Baştaki indeks pencereden çıktıysa (<code>≤ i − K</code>) onu da at. Pencerenin maksimumu her zaman deque\'in başındadır.</p>\n<p><b>Karmaşıklık:</b> Her indeks deque\'e bir kez girer, bir kez çıkar: O(N). Bellek O(K).</p>\n<p><b>Naif çözüm neden yetmez:</b> Her pencere için <code>max(a[i:i+K])</code> O(N·K) — gizli testte K = 10^5 ile 10^10 işlem. Heap ile (değer, indeks) tutup tembel silmek O(N log N) ile geçer ama daha yavaştır.</p>\n<p><b>Sık hata:</b> Deque\'te değer tutmak (pencereden çıkışı anlayamazsın) ve pencere tamamlanmadan (<code>i &lt; K−1</code>) çıktı üretmek.</p>',
  hints: ['Deque\'te indeks tut; değerler azalan sırada olsun.', 'Yeni elemandan küçükleri sondan at, pencereden çıkanı baştan at.']
},
{
  id: 'a-158',
  title: 'Çarşı cephesine en büyük tabela',
  track: 'Veri yapıları',
  diff: 'Zor',
  pts: 60,
  tags: ['monoton yığın'],
  src: 'LeetCode 84 Largest Rectangle in Histogram benzeri',
  mode: 'stdin',
  statement: '<p>Anadolu Market, bir çarşı caddesinde yan yana duran N dükkânın cephesini kiralayacak. Her dükkânın genişliği 1 metre, i. dükkânın cephe yüksekliği h<sub>i</sub> metre. Ardışık dükkânların cephesine yerden başlayan, <b>tek parça dikdörtgen</b> bir tabela asılacak; tabelanın yüksekliği kapsadığı en alçak cepheyi aşamaz.</p>\n<p>Asılabilecek en büyük tabela alanını bul.</p>',
  input: '<p>İlk satırda N. İkinci satırda N yükseklik.</p>',
  output: '<p>En büyük alan.</p>',
  constraints: '1 ≤ N ≤ 2·10^5, 0 ≤ h ≤ 10^9',
  samples: [
      { in: '6\n2 1 5 6 2 3\n', out: '10\n', why: '5 ve 6 metrelik dükkânlar üzerinde 5 m yükseklik × 2 m: alan 10.' },
      { in: '2\n2 4\n', out: '4\n', why: '4×1 = 4 ya da 2×2 = 4: cevap 4.' }
  ],
  hidden: [
      { in: '1\n0\n', out: '0\n' },
      { in: '1\n7\n', out: '7\n' },
      { in: '5\n1 1 1 1 1\n', out: '5\n' },
      { in: '5\n1 2 3 4 5\n', out: '9\n' },
      { in: '5\n5 4 3 2 1\n', out: '9\n' },
      { in: '7\n6 2 5 4 5 1 6\n', out: '12\n' },
      { gen: 'import random\nrandom.seed(158)\nn = 200000\nprint(n)\nprint(*[random.randint(0, 10**9) for _ in range(n)])\n' },
      { gen: 'n = 200000\nprint(n)\nprint(*range(1, n + 1))\n' },
      { gen: 'n = 200000\nprint(n)\nprint(*([10**9] * n))\n' }
  ],
  start: 'n = int(input())\nh = list(map(int, input().split()))\nyigin = []   # yükseklikleri artan indeksler\nen_buyuk = 0\n',
  sol: 'n = int(input())\nh = list(map(int, input().split()))\nh.append(0)\nyigin = []\nen_buyuk = 0\nfor i, y in enumerate(h):\n    bas = i\n    while yigin and yigin[-1][1] >= y:\n        j, yj = yigin.pop()\n        alan = yj * (i - j)\n        if alan > en_buyuk:\n            en_buyuk = alan\n        bas = j\n    yigin.append((bas, y))\nprint(en_buyuk)\n',
  editorial: '<p><b>Yaklaşım:</b> Her dükkânın yüksekliği için o yükseklikte tabelanın ne kadar sola ve sağa uzayabileceğini bilmek gerekir: soldaki ve sağdaki ilk <b>daha alçak</b> dükkâna kadar. Yükseklikleri artan bir yığın tut: elemanlar (başlangıç indeksi, yükseklik). Yeni yükseklik tepedekinden düşük ya da eşitse tepedeki dikdörtgen artık sağa uzayamaz: çıkar, alanını <code>yükseklik × (i − başlangıç)</code> hesapla ve yeni elemanın başlangıcını onun başlangıcına çek (alçak olan sola doğru uzayabilir). Sona 0 yükseklik ekleyerek yığındaki her şeyi boşaltmayı garanti et.</p>\n<p><b>Karmaşıklık:</b> Her indeks bir kez girer, bir kez çıkar: O(N).</p>\n<p><b>Naif çözüm neden yetmez:</b> Her başlangıç için sağa genişleyip minimumu güncellemek O(N²) = 2·10^10 — gizli testlerde dakikalar sürer. Böl ve yönet (en alçağı bul, ikiye böl) sıralı girdide O(N²)\'ye düşer.</p>\n<p><b>Sık hata:</b> Sondaki 0 nöbetçisini eklememek (artan dizide hiçbir alan hesaplanmaz) ve genişliği çıkarılan elemanın kendi indeksinden hesaplayıp sola uzamayı kaçırmak.</p>',
  hints: [
      'Her yükseklik için sol ve sağdaki ilk daha alçak dükkânı düşün.',
      'Artan bir yığın tut; daha alçak gelince tepeyi çıkar ve alanını hesapla.',
      'Sona 0 ekle ki yığın boşalsın.'
  ]
},
{
  id: 'a-159',
  title: 'Bisiklet yolu ağındaki bölge sayısı',
  track: 'Veri yapıları',
  diff: 'Orta',
  pts: 30,
  tags: ['union-find', 'DSU'],
  src: 'LeetCode 547 / 323 Number of Connected Components benzeri',
  mode: 'stdin',
  statement: '<p>Pedal İzmir\'in N istasyonu başlangıçta birbirine bağlı değil. Belediye her gün iki istasyon arasına yeni bir bisiklet yolu açıyor. Bir yolla (doğrudan ya da dolaylı) birbirine ulaşılabilen istasyonlar aynı <b>bölge</b> sayılıyor.</p>\n<p>Her yeni yol açıldıktan sonra toplam bölge sayısını yaz.</p>',
  input: '<p>İlk satırda N ve Q. Sonraki Q satırda <code>a b</code> (1 ≤ a, b ≤ N; a = b olabilir, aynı yol tekrar açılabilir).</p>',
  output: '<p>Her yol için bir satırda bölge sayısı.</p>',
  constraints: '1 ≤ N, Q ≤ 2·10^5',
  samples: [
      { in: '5 4\n1 2\n3 4\n2 1\n2 3\n', out: '4\n3\n3\n2\n', why: '5 → 4 → 3 → (1-2 zaten bağlı) 3 → 2.' }
  ],
  hidden: [
      { in: '1 1\n1 1\n', out: '1\n' },
      { in: '3 3\n1 2\n2 3\n1 3\n', out: '2\n1\n1\n' },
      { in: '4 2\n1 2\n3 4\n', out: '3\n2\n' },
      { in: '6 5\n1 2\n3 4\n5 6\n2 3\n4 5\n', out: '5\n4\n3\n2\n1\n' },
      { in: '4 3\n2 2\n4 4\n1 4\n', out: '4\n4\n3\n' },
      { gen: 'import random\nrandom.seed(159)\nn = q = 200000\nprint(n, q)\nprint(\'\\n\'.join(f\'{random.randint(1, n)} {random.randint(1, n)}\' for _ in range(q)))\n' },
      { gen: 'n = q = 200000\nprint(n, q - 1)\nprint(\'\\n\'.join(f\'{i} {i + 1}\' for i in range(1, n)))\n' }
  ],
  start: 'import sys\ninput = sys.stdin.readline\nn, q = map(int, input().split())\nebeveyn = list(range(n + 1))\n\ndef bul(x):\n    # kökü bul (yol sıkıştırmayla)\n    pass\n',
  sol: 'import sys\nveri = sys.stdin.read().split()\nn, q = int(veri[0]), int(veri[1])\nebeveyn = list(range(n + 1))\nboyut = [1] * (n + 1)\n\ndef bul(x):\n    kok = x\n    while ebeveyn[kok] != kok:\n        kok = ebeveyn[kok]\n    while ebeveyn[x] != kok:\n        ebeveyn[x], x = kok, ebeveyn[x]\n    return kok\n\nbolge = n\ncikti = []\nfor t in range(q):\n    a, b = bul(int(veri[2 + 2 * t])), bul(int(veri[3 + 2 * t]))\n    if a != b:\n        if boyut[a] < boyut[b]:\n            a, b = b, a\n        ebeveyn[b] = a\n        boyut[a] += boyut[b]\n        bolge -= 1\n    cikti.append(bolge)\nprint(\'\\n\'.join(map(str, cikti)))\n',
  editorial: '<p><b>Yaklaşım:</b> Birleşim-bul (union-find / disjoint set union). Her istasyonun bir ebeveyni var; kök, bölgenin temsilcisidir. Yeni yol açılınca iki ucun köklerini bul; farklıysa küçük ağacı büyüğün altına bağla (boyuta göre birleştirme) ve bölge sayısını 1 azalt. <code>bul</code> sırasında yolu köke doğrudan bağlamak (yol sıkıştırma) ağaçları neredeyse düz tutar.</p>\n<p><b>Karmaşıklık:</b> İşlem başına amortize O(α(N)) (pratikte sabit); toplam O(N + Q).</p>\n<p><b>Naif çözüm neden yetmez:</b> Her yoldan sonra BFS/DFS ile bileşen saymak O(Q·(N+Q)) = ~8·10^10. "Her istasyonun bölge etiketini tut, birleşince küçük etiketliyi güncelle" yaklaşımı akıllıca yapılmazsa O(N²)\'ye çıkar.</p>\n<p><b>Sık hata:</b> Özyinelemeli <code>bul</code> yazmak: yol sıkıştırma olmadan zincir 2·10^5 derinliğe ulaşır ve <code>RecursionError</code> verir (gizli testteki zincir girdisi). Döngüyle yaz.</p>',
  hints: [
      'Her istasyon için ebeveyn dizisi tut; kök = bölge temsilcisi.',
      'Kökler farklıysa birleştir ve sayacı azalt; bul() fonksiyonunu döngüyle yaz.'
  ]
},
{
  id: 'a-160',
  title: 'Aynı müşterinin dağınık kayıtları',
  track: 'Veri yapıları',
  diff: 'Orta',
  pts: 30,
  tags: ['union-find', 'hash'],
  src: 'LeetCode 721 Accounts Merge benzeri',
  mode: 'stdin',
  statement: '<p>Ilgaz Bank\'ın eski sistemlerinden gelen N müşteri kaydının her birinde bir veya daha fazla e-posta adresi var. İki kayıt <b>en az bir ortak e-posta</b> içeriyorsa aynı kişiye aittir; bu ilişki geçişlidir (A ile B, B ile C ortaksa üçü de aynı kişi).</p>\n<p>Kaç farklı kişi olduğunu ve her kişinin <b>farklı e-posta sayısını</b> büyükten küçüğe yaz.</p>',
  input: '<p>İlk satırda N. Sonraki N satırın her biri: <code>m e1 e2 ... em</code> (e-posta sayısı ve adresler).</p>',
  output: '<p>İlk satırda kişi sayısı, ikinci satırda e-posta sayıları (azalan).</p>',
  constraints: '1 ≤ N ≤ 5·10^4, 1 ≤ m ≤ 10, toplam e-posta ≤ 2·10^5',
  samples: [
      { in: '4\n2 ali@x.com ali@y.com\n1 ayse@x.com\n2 ali@y.com a.k@z.com\n1 ali@x.com\n', out: '2\n3 1\n', why: 'Kayıt 1, 3, 4 ortak adreslerle bağlı: {ali@x, ali@y, a.k@z} → 3 e-posta. Ayşe ayrı: 1. Kişi sayısı 2.' }
  ],
  hidden: [
      { in: '1\n1 a@b\n', out: '1\n1\n' },
      { in: '2\n1 a@b\n1 a@b\n', out: '1\n1\n' },
      { in: '3\n2 a b\n2 c d\n2 b c\n', out: '1\n4\n' },
      { in: '3\n1 a\n1 b\n1 c\n', out: '3\n1 1 1\n' },
      { in: '4\n3 a b c\n1 d\n2 d e\n2 c x\n', out: '2\n4 2\n' },
      { gen: 'import random\nrandom.seed(160)\nn = 50000\nprint(n)\nfor _ in range(n):\n    m = random.randint(1, 6)\n    print(m, *[f\'u{random.randint(1, 120000)}@pp.com\' for _ in range(m)])\n' },
      { gen: 'n = 50000\nprint(n)\nfor i in range(n):\n    print(2, f\'k{i}@zincir.com\', f\'k{i + 1}@zincir.com\')\n' }
  ],
  start: 'import sys\ninput = sys.stdin.readline\nn = int(input())\nsahip = {}   # e-posta -> ilk görüldüğü kayıt\nebeveyn = list(range(n))\n',
  sol: 'import sys\nsatirlar = sys.stdin.read().split(\'\\n\')\nn = int(satirlar[0])\nebeveyn = list(range(n))\n\ndef bul(x):\n    kok = x\n    while ebeveyn[kok] != kok:\n        kok = ebeveyn[kok]\n    while ebeveyn[x] != kok:\n        ebeveyn[x], x = kok, ebeveyn[x]\n    return kok\n\nsahip = {}\nkayit_epostalari = []\nfor i in range(n):\n    parca = satirlar[i + 1].split()\n    epostalar = parca[1:]\n    kayit_epostalari.append(epostalar)\n    for e in epostalar:\n        if e in sahip:\n            a, b = bul(sahip[e]), bul(i)\n            if a != b:\n                ebeveyn[b] = a\n        else:\n            sahip[e] = i\nkisi = {}\nfor e, i in sahip.items():\n    k = bul(i)\n    kisi[k] = kisi.get(k, 0) + 1\nsayilar = sorted(kisi.values(), reverse=True)\nprint(len(sayilar))\nprint(*sayilar)\n',
  editorial: '<p><b>Yaklaşım:</b> Kayıtları union-find düğümleri yap. Her e-postanın ilk görüldüğü kaydı sözlükte tut; aynı e-posta başka kayıtta görülünce iki kaydı birleştir. Sonda her e-postayı sahibi olan kaydın köküne say: bu, kişi başına farklı e-posta sayısını verir (sözlük her adresi bir kez içerdiği için tekrarlar kendiliğinden elenir).</p>\n<p><b>Karmaşıklık:</b> Toplam e-posta sayısı E için O(E · α(N)) + sonuçları sıralamak O(N log N).</p>\n<p><b>Naif çözüm neden yetmez:</b> "Ortak eleman kalmayana dek kümeleri birleştir" ya da her kayıt çiftini karşılaştırmak O(N²) küme işlemi; 5·10^4 kayıtta 10^9 mertebesi. Zincir hâlindeki gizli testte tekrar tekrar birleştirme her adımda büyüyen kümeleri kopyalar.</p>\n<p><b>Alternatif:</b> E-postaları düğüm, kayıtları kenar sayıp BFS/DFS ile bileşen bulmak da O(E)\'dir. <b>Sık hata:</b> Aynı kayıt içinde aynı e-posta iki kez yazılmışsa onu iki kez saymak.</p>',
  hints: ['Her e-posta için "ilk sahibi" sözlüğü tut.', 'Aynı e-posta yeni kayıtta çıkarsa iki kaydı union-find ile birleştir.']
},
{
  id: 'a-161',
  title: 'Arama kutusu önek sayacı',
  track: 'Veri yapıları',
  diff: 'Orta',
  pts: 30,
  tags: ['trie', 'sözlük'],
  src: 'LeetCode 208 Implement Trie / HackerRank Contacts benzeri',
  mode: 'stdin',
  statement: '<p>Anadolu Market\'in arama kutusu, kullanıcı yazarken "bu harflerle başlayan kaç ürün adı var?" bilgisini anlık gösteriyor. Ürün kataloğu gün içinde büyüyor. İşlemler:</p>\n<ul><li><code>EKLE w</code>: w ürün adını kataloğa ekle (aynı ad birden çok kez eklenebilir; her ekleme ayrı sayılır).</li>\n<li><code>SAY p</code>: katalogda p ile başlayan ad sayısını yaz.</li></ul>',
  input: '<p>İlk satırda Q, sonraki Q satırda birer işlem. Kelimeler küçük İngilizce harflerden oluşur.</p>',
  output: '<p>Her SAY için bir satır.</p>',
  constraints: '1 ≤ Q ≤ 10^5, 1 ≤ |w|, |p| ≤ 12',
  samples: [
      { in: '6\nEKLE elma\nEKLE elmas\nEKLE erik\nSAY el\nSAY e\nSAY ka\n', out: '2\n3\n0\n', why: '"el" ile 2, "e" ile 3, "ka" ile 0 ad başlıyor.' }
  ],
  hidden: [
      { in: '1\nSAY a\n', out: '0\n' },
      { in: '3\nEKLE a\nEKLE a\nSAY a\n', out: '2\n' },
      { in: '4\nEKLE abc\nSAY abcd\nSAY abc\nSAY ab\n', out: '0\n1\n1\n' },
      { in: '5\nSAY x\nEKLE xy\nSAY x\nEKLE x\nSAY x\n', out: '0\n1\n2\n' },
      { in: '3\nEKLE kalem\nSAY kalemlik\nSAY k\n', out: '0\n1\n' },
      { gen: 'import random\nrandom.seed(161)\nq = 100000\nprint(q)\nout = []\nfor i in range(q):\n    if random.random() < 0.6:\n        out.append(\'EKLE \' + \'\'.join(random.choice(\'abcd\') for _ in range(random.randint(4, 12))))\n    else:\n        out.append(\'SAY \' + \'\'.join(random.choice(\'abcd\') for _ in range(random.randint(1, 4))))\nprint(\'\\n\'.join(out))\n' }
  ],
  start: 'import sys\ninput = sys.stdin.readline\nq = int(input())\nkok = {}   # her düğüm: {harf: alt_dugum, \'#\': bu düğümden geçen kelime sayısı}\nfor _ in range(q):\n    islem, kelime = input().split()\n',
  sol: 'import sys\nsatirlar = sys.stdin.read().split(\'\\n\')\nq = int(satirlar[0])\nkok = {}\ncikti = []\nfor k in range(1, q + 1):\n    islem, kelime = satirlar[k].split()\n    if islem == \'EKLE\':\n        d = kok\n        for c in kelime:\n            alt = d.get(c)\n            if alt is None:\n                alt = d[c] = {\'#\': 0}\n            alt[\'#\'] += 1\n            d = alt\n    else:\n        d = kok\n        for c in kelime:\n            d = d.get(c)\n            if d is None:\n                break\n        cikti.append(str(d[\'#\']) if d is not None else \'0\')\nprint(\'\\n\'.join(cikti))\n',
  editorial: '<p><b>Yaklaşım:</b> Trie (önek ağacı). Her düğüm bir sözlük: harf → alt düğüm. Ek olarak her düğümde, o düğümden <b>geçen</b> kelime sayısını (<code>\'#\'</code>) tut. Ekleme sırasında yol boyunca her düğümün sayacını artır. Sorguda öneki takip et; yol kopuyorsa 0, aksi hâlde vardığın düğümün sayacı cevaptır.</p>\n<p><b>Karmaşıklık:</b> İşlem başına O(L), L ≤ 12; toplam O(Q · L).</p>\n<p><b>Naif çözüm neden yetmez:</b> Her SAY için tüm kelimelerde <code>startswith</code> denemek O(Q · W) — gizli testte ~6·10^4 kelime × 4·10^4 sorgu = 2,4·10^9 kontrol.</p>\n<p><b>Alternatif:</b> Her eklemede kelimenin tüm öneklerini bir <code>Counter</code>\'da artırmak da O(L) ve burada geçer; ama trie, otomatik tamamlama ("bu önekle başlayan ilk 5 kelime") gibi genişletmelere uygundur. <b>Sık hata:</b> Sayacı yalnız kelime sonunda tutmak: o zaman sorgu alt ağacın tamamını gezmek zorunda kalır.</p>',
  hints: ['İç içe sözlüklerle bir önek ağacı kur.', 'Her düğümde oradan geçen kelime sayısını tut; SAY o düğümün sayacıdır.']
},
{
  id: 'a-162',
  title: 'Yetki kodları arasında en büyük XOR',
  track: 'Veri yapıları',
  diff: 'Zor',
  pts: 60,
  tags: ['trie', 'bit işlemleri', 'açgözlü'],
  src: 'LeetCode 421 Maximum XOR of Two Numbers benzeri',
  mode: 'stdin',
  statement: '<p>Ilgaz Bank güvenlik ekibi, iki kullanıcının 30 bitlik yetki kodları ne kadar "zıt" diye ölçmek için kodların XOR\'unu kullanıyor. Denetim raporu için tüm kullanıcı çiftleri arasındaki <b>en büyük XOR</b> değeri gerekiyor.</p>\n<p>max(a<sub>i</sub> XOR a<sub>j</sub>) değerini yazdır (i ≠ j).</p>',
  input: '<p>İlk satırda N. İkinci satırda N kod.</p>',
  output: '<p>En büyük XOR.</p>',
  constraints: '2 ≤ N ≤ 5·10^4, 0 ≤ kod &lt; 2^30',
  samples: [
      { in: '6\n3 10 5 25 2 8\n', out: '28\n', why: '5 XOR 25 = 00101 XOR 11001 = 11100 = 28.' }
  ],
  hidden: [
      { in: '2\n0 0\n', out: '0\n' },
      { in: '2\n0 1073741823\n', out: '1073741823\n' },
      { in: '3\n7 7 7\n', out: '0\n' },
      { in: '4\n1 2 4 8\n', out: '12\n' },
      { in: '5\n14 70 53 83 49\n', out: '119\n' },
      { gen: 'import random\nrandom.seed(162)\nn = 50000\nprint(n)\nprint(*[random.randint(0, 2**30 - 1) for _ in range(n)])\n' },
      { gen: 'import random\nrandom.seed(1620)\nn = 50000\nprint(n)\nprint(*[random.randint(0, 2**29 - 1) | (1 << 29) for _ in range(n)])\n' }
  ],
  start: 'n = int(input())\na = list(map(int, input().split()))\nen_iyi = 0\n# yüksek bitten başlayarak cevabı bit bit kur\n',
  sol: 'n = int(input())\na = list(map(int, input().split()))\nen_iyi = 0\nmaske = 0\nfor b in range(29, -1, -1):\n    maske |= 1 << b\n    onekler = {x & maske for x in a}\n    aday = en_iyi | (1 << b)\n    for p in onekler:\n        if (p ^ aday) in onekler:\n            en_iyi = aday\n            break\nprint(en_iyi)\n',
  editorial: '<p><b>Yaklaşım (açgözlü bit bit):</b> XOR\'u büyütmenin en etkili yolu yüksek bitleri 1 yapmaktır. Cevabı en yüksek bitten başlayarak kur: şimdiye kadarki cevaba bu biti eklemeyi dene (<code>aday</code>). Kodların ilk (yüksek) bitlerinden oluşan önek kümesinde <code>p ^ aday</code> de varsa, XOR\'u <code>aday</code> olan iki kod vardır (çünkü p ^ q = aday ⇔ q = p ^ aday). Varsa biti kabul et.</p>\n<p><b>Trie alternatifi:</b> Kodları ikili trie\'ye (30 seviye) ekle; her kod için her seviyede mümkünse <b>ters</b> bite git. O(30 · N) ama Python\'da sözlüklü trie 3·10^6 düğüm adımı yapar, küme yaklaşımı daha hızlıdır.</p>\n<p><b>Karmaşıklık:</b> O(30 · N) zaman, O(N) bellek.</p>\n<p><b>Naif çözüm neden yetmez:</b> Tüm çiftlerin XOR\'u N(N−1)/2 ≈ 1,25·10^9 işlem.</p>\n<p><b>Sık hata:</b> Önek maskesini unutup tam kodları kümeye koymak (o zaman yalnız tam eşleşme ararsın) ve <code>p ^ aday in onekler</code> ifadesinin önceliğinden emin olmamak: karşılaştırmalar (<code>in</code> dahil) <code>^</code>\'den düşük önceliklidir, yani ifade <code>(p ^ aday) in onekler</code> olarak çalışır; yine de parantez yazmak okunabilirliği artırır.</p>',
  hints: ['Yüksek biti 1 yapmak, alt bitlerin hepsinden değerlidir.', 'p ^ q = aday ise q = p ^ aday: önek kümesinde ara.']
},
{
  id: 'a-163',
  title: 'Kur servisi için LRU önbellek',
  track: 'Veri yapıları',
  diff: 'Orta',
  pts: 30,
  tags: ['LRU', 'OrderedDict', 'tasarım'],
  src: 'LeetCode 146 LRU Cache benzeri',
  mode: 'stdin',
  statement: '<p>Ilgaz Bank\'ın döviz kuru servisi yavaş olduğu için sonuçlar C kapasiteli bir önbellekte tutuluyor. Önbellek dolduğunda <b>en uzun süredir kullanılmayan</b> (Least Recently Used) kayıt atılıyor. İşlemler:</p>\n<ul><li><code>GET k</code>: k anahtarının değerini yaz ve onu "en son kullanılan" yap; yoksa <code>-1</code> yaz.</li>\n<li><code>PUT k v</code>: k\'nin değerini v yap (varsa güncelle) ve en son kullanılan yap. Yeni anahtar eklenirken önbellek doluysa önce LRU kaydı at.</li></ul>',
  input: '<p>İlk satırda C ve Q. Sonraki Q satırda birer işlem.</p>',
  output: '<p>Her GET için bir satır.</p>',
  constraints: '1 ≤ C ≤ 10^5, 1 ≤ Q ≤ 2·10^5, 0 ≤ k, v ≤ 10^9',
  samples: [
      { in: '2 9\nPUT 1 1\nPUT 2 2\nGET 1\nPUT 3 3\nGET 2\nPUT 4 4\nGET 1\nGET 3\nGET 4\n', out: '1\n-1\n-1\n3\n4\n', why: 'GET 1 → 1 (1 tazelendi). PUT 3, en eski olan 2\'yi atar: GET 2 → −1. PUT 4, 1\'i atar. Sonra −1, 3, 4.' }
  ],
  hidden: [
      { in: '1 3\nPUT 5 50\nPUT 6 60\nGET 5\n', out: '-1\n' },
      { in: '1 3\nPUT 5 50\nPUT 5 55\nGET 5\n', out: '55\n' },
      { in: '2 6\nPUT 1 1\nPUT 2 2\nPUT 1 10\nPUT 3 3\nGET 2\nGET 1\n', out: '-1\n10\n' },
      { in: '3 4\nGET 0\nPUT 0 0\nGET 0\nGET 1\n', out: '-1\n0\n-1\n' },
      { in: '2 7\nPUT 2 1\nPUT 1 1\nPUT 2 3\nPUT 4 1\nGET 1\nGET 2\nGET 4\n', out: '-1\n3\n1\n' },
      { gen: 'import random\nrandom.seed(163)\nc, q = 50000, 200000\nprint(c, q)\nout = []\nfor _ in range(q):\n    k = random.randint(0, 80000)\n    out.append(f\'GET {k}\' if random.random() < 0.5 else f\'PUT {k} {random.randint(0, 10**9)}\')\nprint(\'\\n\'.join(out))\n' },
      { gen: 'c, q = 100000, 200000\nprint(c, q)\nout = [f\'PUT {i} {i}\' for i in range(100000)] + [f\'GET {i}\' for i in range(0, 200000, 2)]\nprint(\'\\n\'.join(out))\n' }
  ],
  start: 'import sys\nfrom collections import OrderedDict\ninput = sys.stdin.readline\nc, q = map(int, input().split())\nonbellek = OrderedDict()\nfor _ in range(q):\n    parca = input().split()\n',
  sol: 'import sys\nfrom collections import OrderedDict\nsatirlar = sys.stdin.read().split(\'\\n\')\nc, q = map(int, satirlar[0].split())\nonbellek = OrderedDict()\ncikti = []\nfor i in range(1, q + 1):\n    parca = satirlar[i].split()\n    k = parca[1]\n    if parca[0] == \'GET\':\n        if k in onbellek:\n            onbellek.move_to_end(k)\n            cikti.append(onbellek[k])\n        else:\n            cikti.append(\'-1\')\n    else:\n        if k in onbellek:\n            onbellek.move_to_end(k)\n        elif len(onbellek) >= c:\n            onbellek.popitem(last=False)\n        onbellek[k] = parca[2]\nprint(\'\\n\'.join(cikti))\n',
  editorial: '<p><b>Yaklaşım:</b> LRU iki şey ister: anahtarla O(1) erişim (sözlük) ve kullanım sırasını O(1) güncelleme (çift yönlü bağlı liste). Python\'da <code>collections.OrderedDict</code> ikisini birlikte sunar: <code>move_to_end(k)</code> kaydı en sona (en yeni) taşır, <code>popitem(last=False)</code> en baştakini (en eski) atar.</p>\n<p><b>Karmaşıklık:</b> Her işlem O(1); bellek O(C).</p>\n<p><b>Naif çözüm neden yetmez:</b> Kayıtları bir listede tutup her erişimde arayıp sona taşımak işlem başına O(C): gizli testte C = 10^5 ve 2·10^5 işlemle ~10^10 adım. Her kayda "son kullanım zamanı" yazıp tahliyede minimumu aramak da tahliye başına O(C).</p>\n<p><b>Mülakatta:</b> Genellikle OrderedDict kullanmadan, sözlük + kendi çift yönlü bağlı listeni (sahte baş/son düğümlerle) yazman istenir. <b>Sık hata:</b> Var olan anahtarı PUT ile güncellerken tahliye yapmak (kapasite aşılmıyor) ve GET\'te kaydı tazelemeyi unutmak.</p>',
  hints: ['Sözlük + kullanım sırası birlikte gerekli.', 'OrderedDict.move_to_end ve popitem(last=False) tam bu iş için.']
},
{
  id: 'a-164',
  title: 'En uzun ardışık fatura serisi',
  track: 'Veri yapıları',
  diff: 'Kolay',
  pts: 10,
  tags: ['hash', 'küme'],
  src: 'LeetCode 128 Longest Consecutive Sequence benzeri',
  mode: 'stdin',
  statement: '<p>Pusula İK\'nın muhasebe arşivinde fatura numaraları karışık sırada duruyor (bazıları tekrar taranmış). Denetçi, eksiksiz ardışık bir seri (ör. 100, 101, 102, 103) oluşturan <b>en uzun numara dizisinin</b> uzunluğunu istiyor; sıra önemli değil, yalnızca numaraların varlığı.</p>',
  input: '<p>İlk satırda N. İkinci satırda N fatura numarası.</p>',
  output: '<p>En uzun ardışık serinin uzunluğu.</p>',
  constraints: '1 ≤ N ≤ 2·10^5, −10^9 ≤ numara ≤ 10^9',
  samples: [
      { in: '6\n100 4 200 1 3 2\n', out: '4\n', why: '1, 2, 3, 4 ardışık: uzunluk 4.' },
      { in: '5\n0 0 -1 1 1\n', out: '3\n', why: 'Tekrarlar sayılmaz: −1, 0, 1 → 3.' }
  ],
  hidden: [
      { in: '1\n5\n', out: '1\n' },
      { in: '2\n1000000000 -1000000000\n', out: '1\n' },
      { in: '4\n7 7 7 7\n', out: '1\n' },
      { in: '7\n9 1 4 7 3 -1 0\n', out: '3\n' },
      { in: '10\n0 3 7 2 5 8 4 6 0 1\n', out: '9\n' },
      { gen: 'import random\nrandom.seed(164)\nn = 200000\nprint(n)\nprint(*[random.randint(-300000, 300000) for _ in range(n)])\n' },
      { gen: 'import random\nrandom.seed(1640)\na = list(range(-100000, 100000))\nrandom.shuffle(a)\nprint(len(a))\nprint(*a)\n' }
  ],
  start: 'n = int(input())\nnumaralar = set(map(int, input().split()))\nen_uzun = 0\n# yalnızca serinin başlangıcı olan numaralardan say\n',
  sol: 'n = int(input())\nnumaralar = set(map(int, input().split()))\nen_uzun = 0\nfor x in numaralar:\n    if x - 1 not in numaralar:\n        y = x\n        while y + 1 in numaralar:\n            y += 1\n        if y - x + 1 > en_uzun:\n            en_uzun = y - x + 1\nprint(en_uzun)\n',
  editorial: '<p><b>Yaklaşım:</b> Numaraları bir kümeye koy (O(1) üyelik testi). Bir x\'ten saymaya yalnızca <code>x − 1</code> kümede <b>yoksa</b> başla; çünkü o zaman x bir serinin başıdır. Oradan <code>x+1, x+2, ...</code> kümede oldukça ilerle. Her numara en fazla bir kez "ilerleme" adımında ziyaret edilir.</p>\n<p><b>Karmaşıklık:</b> O(N) beklenen zaman, O(N) bellek. Sıralama ile O(N log N) çözüm de burada geçer.</p>\n<p><b>Naif çözüm neden yetmez:</b> Her numaradan başlayıp ileri saymak (başlangıç kontrolü olmadan) tek uzun seride O(N²) olur: 2·10^5 elemanlık ardışık gizli testte 2·10^10 adım. Listede <code>in</code> ile üyelik aramak da adım başına O(N).</p>\n<p><b>Sık hata:</b> Tekrarları iki kez saymak (kümeye çevirmek çözer) ve sıralı yaklaşımda eşit komşularda sayacı sıfırlamak.</p>',
  hints: ['Kümeye çevir.', 'Yalnızca x−1 kümede yoksa x\'ten saymaya başla.']
},
{
  id: 'a-165',
  title: 'Teslimat sürelerinin anlık medyanı',
  track: 'Veri yapıları',
  diff: 'Zor',
  pts: 60,
  tags: ['heap', 'iki heap', 'medyan'],
  src: 'LeetCode 295 Find Median from Data Stream benzeri',
  mode: 'stdin',
  statement: '<p>Lezzet Kurye\'nin canlı panosu, gün içinde tamamlanan her teslimattan sonra o ana kadarki teslimat sürelerinin <b>medyanını</b> gösteriyor (ortalama aşırı uçlardan çok etkilendiği için medyan tercih ediliyor). Eleman sayısı çiftse medyan ortadaki iki değerin ortalamasıdır.</p>\n<p>Her teslimattan sonra medyanı <b>bir ondalık basamakla</b> yaz (ör. <code>5.0</code>, <code>7.5</code>).</p>',
  input: '<p>İlk satırda N. İkinci satırda N teslimat süresi (dakika, tam sayı).</p>',
  output: '<p>Tek satırda N değer.</p>',
  constraints: '1 ≤ N ≤ 2·10^5, 1 ≤ süre ≤ 10^6',
  samples: [
      { in: '5\n5 15 1 3 8\n', out: '5.0 10.0 5.0 4.0 5.0\n', why: '[5]→5.0; [5,15]→10.0; [1,5,15]→5.0; [1,3,5,15]→4.0; [1,3,5,8,15]→5.0.' }
  ],
  hidden: [
      { in: '1\n7\n', out: '7.0\n' },
      { in: '2\n1 2\n', out: '1.0 1.5\n' },
      { in: '4\n4 4 4 4\n', out: '4.0 4.0 4.0 4.0\n' },
      { in: '6\n10 9 8 7 6 5\n', out: '10.0 9.5 9.0 8.5 8.0 7.5\n' },
      { in: '6\n1 1000000 1 1000000 1 1000000\n', out: '1.0 500000.5 1.0 500000.5 1.0 500000.5\n' },
      { gen: 'import random\nrandom.seed(165)\nn = 200000\nprint(n)\nprint(*[random.randint(1, 10**6) for _ in range(n)])\n' },
      { gen: 'n = 200000\nprint(n)\nprint(*range(n, 0, -1))\n' }
  ],
  start: 'import heapq\nn = int(input())\nsureler = list(map(int, input().split()))\nalt = []   # küçük yarı: max-heap (negatif değerlerle)\nust = []   # büyük yarı: min-heap\n',
  sol: 'import heapq\nn = int(input())\nsureler = list(map(int, input().split()))\nalt = []\nust = []\ncikti = []\nfor x in sureler:\n    if not alt or x <= -alt[0]:\n        heapq.heappush(alt, -x)\n    else:\n        heapq.heappush(ust, x)\n    if len(alt) > len(ust) + 1:\n        heapq.heappush(ust, -heapq.heappop(alt))\n    elif len(ust) > len(alt):\n        heapq.heappush(alt, -heapq.heappop(ust))\n    if len(alt) > len(ust):\n        cikti.append(f\'{-alt[0]:.1f}\')\n    else:\n        cikti.append(f\'{(-alt[0] + ust[0]) / 2:.1f}\')\nprint(\' \'.join(cikti))\n',
  editorial: '<p><b>Yaklaşım:</b> Verinin küçük yarısını bir <b>max-heap</b>\'te (Python\'da değerleri negatif yaparak), büyük yarısını bir <b>min-heap</b>\'te tut. Alt yarının boyutu ya üst yarıya eşit ya da bir fazla olsun. Yeni değeri uygun yarıya ekle, sonra boyutları dengelemek için gerekirse bir elemanı diğer heap\'e taşı. Medyan: tek sayıda eleman varsa alt yarının tepesi, çiftse iki tepenin ortalaması.</p>\n<p><b>Karmaşıklık:</b> Ekleme başına O(log N), medyan O(1); toplam O(N log N).</p>\n<p><b>Naif çözüm neden yetmez:</b> Her adımda sıralamak O(N² log N); <code>bisect.insort</code> ile sıralı liste O(N²) kaydırma (2·10^5\'te ~2·10^10 bayt taşıma, CPython\'da çok yavaş; gizli testteki azalan dizi her eklemeyi listenin başına yaptırır).</p>\n<p><b>Sık hata:</b> Max-heap için negatifleri geri çevirmeyi unutmak, dengeleme koşulunu tek yönlü yazmak ve çift sayıda elemanda ortalamayı tam sayı bölmesiyle (<code>//</code>) almak.</p>',
  hints: [
      'Küçük yarı ve büyük yarı için iki heap.',
      'Python heapq min-heap\'tir; max-heap için değerleri negatif sakla.',
      'Boyut farkı en fazla 1 olacak şekilde dengele.'
  ]
}
); })(window);
