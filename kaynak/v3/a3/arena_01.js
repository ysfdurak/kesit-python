/* Kesit Python — v3/a3: Algoritmalar (a-121…a-145) */
(function (W) { 'use strict'; const A = W.PY_ARENA = W.PY_ARENA || []; A.push(
{
  id: 'a-121',
  title: 'Kampanya pankartı simetrik mi?',
  track: 'Algoritmalar',
  diff: 'Kolay',
  pts: 10,
  tags: ['iki işaretçi', 'metin'],
  src: 'LeetCode 125 Valid Palindrome benzeri',
  mode: 'stdin',
  statement: '<p>Anadolu Market\'in tasarım ekibi, vitrin pankartlarında soldan ve sağdan aynı okunan sloganları kullanmak istiyor. Bir sloganın <b>simetrik</b> sayılması için yalnızca harfler ve rakamlar dikkate alınır; boşluk ve noktalama işaretleri yok sayılır, büyük/küçük harf farkı önemsizdir.</p>\n<p>Her slogan için simetrikse <code>EVET</code>, değilse <code>HAYIR</code> yaz. Harf ve rakam içermeyen (tamamen noktalama ya da boş) bir slogan simetrik kabul edilir.</p>',
  input: '<p>İlk satırda slogan sayısı Q. Sonraki Q satırın her biri bir slogan (yalnız İngilizce harfler, rakamlar, boşluk ve noktalama içerir; satır boş olabilir).</p>',
  output: '<p>Her slogan için ayrı satırda <code>EVET</code> ya da <code>HAYIR</code>.</p>',
  constraints: '1 ≤ Q ≤ 10, her satırın uzunluğu ≤ 2·10^5',
  samples: [
      { in: '3\nA man, a plan, a canal: Panama\nrace a car\nNo lemon, no melon!\n', out: 'EVET\nHAYIR\nEVET\n', why: 'İlk ve üçüncü slogan yalnız harfler bırakılıp küçültülünce tersiyle aynı; "raceacar" ise değil.' },
      { in: '2\n...!!\nAb1 1bA\n', out: 'EVET\nEVET\n', why: 'İlk satırda hiç harf/rakam yok, simetrik sayılır. İkincisi "ab11ba" olur.' }
  ],
  hidden: [
      { in: '1\na\n', out: 'EVET\n' },
      { in: '1\nab\n', out: 'HAYIR\n' },
      { in: '2\n0P\nWas it a car or a cat I saw?\n', out: 'HAYIR\nEVET\n' },
      { in: '3\n   \nZ.z\n12321 x 12321\n', out: 'EVET\nEVET\nEVET\n' },
      { in: '1\nTaco cat; ATAC ocat\n', out: 'EVET\n' },
      { gen: 'import random\nrandom.seed(121)\nh = \'\'.join(random.choice(\'abcXYZ019\') for _ in range(90000))\nprint(3)\nprint(h + \' ,. \' + h[::-1].upper())\nprint(h + \'q\' + h[::-1])\nprint(h + \'qw\' + h[::-1])\n' }
  ],
  start: 'import sys\nsatirlar = sys.stdin.read().split(\'\\n\')\nq = int(satirlar[0])\nfor k in range(1, q + 1):\n    s = satirlar[k] if k < len(satirlar) else \'\'\n    # iki işaretçiyle kontrol et\n',
  sol: 'import sys\nsatirlar = sys.stdin.read().split(\'\\n\')\nq = int(satirlar[0])\ncevap = []\nfor k in range(1, q + 1):\n    s = satirlar[k] if k < len(satirlar) else \'\'\n    i, j = 0, len(s) - 1\n    ok = True\n    while i < j:\n        if not s[i].isalnum():\n            i += 1\n        elif not s[j].isalnum():\n            j -= 1\n        elif s[i].lower() != s[j].lower():\n            ok = False\n            break\n        else:\n            i += 1\n            j -= 1\n    cevap.append(\'EVET\' if ok else \'HAYIR\')\nprint(\'\\n\'.join(cevap))\n',
  editorial: '<p><b>Yaklaşım:</b> Biri baştan biri sondan başlayan iki işaretçi tut. Harf/rakam olmayan karakterin üzerinden geç; ikisi de geçerli karakterdeyse <code>lower()</code> ile karşılaştır, eşitse ikisini de içeri kaydır. Bir uyuşmazlık görürsen hemen dur.</p>\n<p><b>Karmaşıklık:</b> O(n) zaman, O(1) ek bellek (satırın kendisi dışında).</p>\n<p><b>Naif çözüm:</b> Temizlenmiş metni kurup <code>t == t[::-1]</code> demek de O(n)\'dir ve burada geçer; ama iki ek kopya oluşturur. Mülakatlarda genellikle "ek bellek kullanmadan" istenir; iki işaretçi bu yüzden öğretilir. Asıl yavaş yol, her adımda <code>s.replace</code> ya da dilimleme ile yeni metin üretmektir (O(n²)).</p>\n<p><b>Sık hata:</b> Satırları <code>split()</code> ile bölmek: boşluklu sloganlar parçalanır. Satırı <code>split(\'\\n\')</code> ile almalısın; ayrıca boş satırı unutma.</p>',
  hints: ['Sol ve sağ uçtan birer işaretçi başlat.', 'isalnum() olmayan karakteri atla, kalanları lower() ile karşılaştır.']
},
{
  id: 'a-122',
  title: 'İki deponun stok kodlarını birleştir',
  track: 'Algoritmalar',
  diff: 'Kolay',
  pts: 10,
  tags: ['iki işaretçi', 'birleştirme'],
  src: 'LeetCode 88 Merge Sorted Array benzeri',
  mode: 'stdin',
  statement: '<p>Anadolu Market\'in İzmir ve Ankara depoları, ürün kodlarını küçükten büyüğe sıralı tutuyor. Merkez, iki listeyi tek bir sıralı listede görmek istiyor. Aynı kod iki depoda da olabilir; birleşik listede iki kez yer alır.</p>\n<p>İki sıralı listeyi tek bir sıralı liste olarak yazdır.</p>',
  input: '<p>İlk satırda N ve M. İkinci satırda N kod (azalmayan sırada), üçüncü satırda M kod (azalmayan sırada). N ya da M sıfırsa o satır boştur.</p>',
  output: '<p>Tek satırda, boşlukla ayrılmış N+M kod.</p>',
  constraints: '0 ≤ N, M ≤ 10^5, N+M ≥ 1, 0 ≤ kod ≤ 10^9',
  samples: [
      { in: '4 3\n1 4 4 9\n2 4 10\n', out: '1 2 4 4 4 9 10\n', why: 'İki işaretçiyle her adımda küçük olanı alırız: 1 2 4 4 4 9 10.' },
      { in: '0 2\n\n5 6\n', out: '5 6\n', why: 'İlk depo boş; ikinci liste olduğu gibi yazılır.' }
  ],
  hidden: [
      { in: '1 1\n7\n3\n', out: '3 7\n' },
      { in: '3 0\n1 2 3\n\n', out: '1 2 3\n' },
      { in: '2 2\n5 5\n5 5\n', out: '5 5 5 5\n' },
      { in: '5 5\n1 3 5 7 9\n2 4 6 8 10\n', out: '1 2 3 4 5 6 7 8 9 10\n' },
      { gen: 'import random\nrandom.seed(122)\nn, m = 100000, 100000\na = sorted(random.randint(0, 10**9) for _ in range(n))\nb = sorted(random.randint(0, 10**9) for _ in range(m))\nprint(n, m)\nprint(*a)\nprint(*b)\n' },
      { in: '2 3\n0 1000000000\n0 5 1000000000\n', out: '0 0 5 1000000000 1000000000\n' }
  ],
  start: 'import sys\nsatirlar = sys.stdin.read().split(\'\\n\')\nn, m = map(int, satirlar[0].split())\na = list(map(int, satirlar[1].split()))\nb = list(map(int, satirlar[2].split()))\n# iki işaretçiyle birleştir\n',
  sol: 'import sys\nsatirlar = sys.stdin.read().split(\'\\n\')\nn, m = map(int, satirlar[0].split())\na = list(map(int, satirlar[1].split())) if n else []\nb = list(map(int, satirlar[2].split())) if m else []\ni = j = 0\nsonuc = []\nwhile i < n and j < m:\n    if a[i] <= b[j]:\n        sonuc.append(a[i]); i += 1\n    else:\n        sonuc.append(b[j]); j += 1\nsonuc.extend(a[i:])\nsonuc.extend(b[j:])\nprint(*sonuc)\n',
  editorial: '<p><b>Yaklaşım:</b> Her listenin başına bir işaretçi koy. Her adımda iki işaretçinin gösterdiği değerden küçük olanı sonuca ekle ve o işaretçiyi ilerlet. Bir liste bitince diğerinin kalanını olduğu gibi ekle. Bu, merge sort\'un "birleştir" adımının ta kendisidir.</p>\n<p><b>Karmaşıklık:</b> O(N+M) zaman, sonuç için O(N+M) bellek.</p>\n<p><b>Naif çözüm:</b> Her elemanı <code>insert</code> ile doğru yere koymak O(N·M) kaydırma yapar ve 10^5 boyutunda çok yavaşlar. <code>sorted(a + b)</code> O((N+M) log(N+M)) ile burada geçer (Timsal sıralı parçaları fark edip hızlanır bile), ama listelerin zaten sıralı olduğu bilgisini kullanmaz. <code>heapq.merge</code> da aynı iki işaretçi fikrinin hazır hâlidir.</p>\n<p><b>Sık hata:</b> N=0 iken boş satırı <code>int</code>\'e çevirmeye çalışmak ya da döngüden sonra kalan elemanları eklemeyi unutmak.</p>',
  hints: ['Her iki listenin başına birer indeks koy.', 'Döngü bitince kalan kuyruğu da ekle.']
},
{
  id: 'a-123',
  title: 'Dönem cirosu sorguları',
  track: 'Algoritmalar',
  diff: 'Kolay',
  pts: 10,
  tags: ['önek toplamı', 'sorgu'],
  src: 'HackerRank / LeetCode 303 Range Sum Query benzeri',
  mode: 'stdin',
  statement: '<p>Anadolu Market finans ekibi günlük net ciroyu (iade günlerinde negatif olabilir) bir dizi olarak tutuyor. Gün içinde yüzlerce kez "L. günden R. güne kadar toplam ciro ne?" sorusu geliyor.</p>\n<p>Her sorgu için L ile R (ikisi dahil, 1\'den başlayan numaralama) arasındaki günlerin toplam cirosunu yazdır.</p>',
  input: '<p>İlk satırda N ve Q. İkinci satırda N tam sayı (günlük ciro). Sonraki Q satırın her birinde L R.</p>',
  output: '<p>Her sorgu için bir satırda toplam.</p>',
  constraints: '1 ≤ N, Q ≤ 10^5, |ciro| ≤ 10^9, 1 ≤ L ≤ R ≤ N',
  samples: [
      { in: '5 3\n10 -2 7 4 1\n1 3\n2 5\n4 4\n', out: '15\n10\n4\n', why: '1–3: 10−2+7=15; 2–5: −2+7+4+1=10; 4–4: 4.' }
  ],
  hidden: [
      { in: '1 1\n-5\n1 1\n', out: '-5\n' },
      { in: '3 2\n0 0 0\n1 3\n2 2\n', out: '0\n0\n' },
      { in: '4 4\n1000000000 1000000000 1000000000 1000000000\n1 4\n1 1\n2 3\n4 4\n', out: '4000000000\n1000000000\n2000000000\n1000000000\n' },
      { gen: 'import random\nrandom.seed(123)\nn = q = 100000\nprint(n, q)\nprint(*[random.randint(-10**9, 10**9) for _ in range(n)])\nout = []\nfor _ in range(q):\n    l = random.randint(1, n // 10)\n    r = random.randint(n - n // 10, n)\n    out.append(f\'{l} {r}\')\nprint(\'\\n\'.join(out))\n' },
      { gen: 'import random\nrandom.seed(1230)\nn = q = 100000\nprint(n, q)\nprint(*[random.randint(-5, 5) for _ in range(n)])\nfor _ in range(q):\n    l = random.randint(1, n); r = random.randint(l, n)\n    print(l, r)\n' },
      { in: '6 3\n-1 -2 -3 -4 -5 -6\n1 6\n3 4\n6 6\n', out: '-21\n-7\n-6\n' },
      { in: '2 2\n7 -7\n1 2\n2 2\n', out: '0\n-7\n' }
  ],
  start: 'import sys\ninput = sys.stdin.readline\nn, q = map(int, input().split())\nciro = list(map(int, input().split()))\nfor _ in range(q):\n    l, r = map(int, input().split())\n    # önek toplamı ile O(1) cevapla\n',
  sol: 'import sys\nveri = sys.stdin.read().split()\nn, q = int(veri[0]), int(veri[1])\nonek = [0] * (n + 1)\nfor i in range(n):\n    onek[i + 1] = onek[i] + int(veri[2 + i])\ncevap = []\np = 2 + n\nfor _ in range(q):\n    l, r = int(veri[p]), int(veri[p + 1]); p += 2\n    cevap.append(onek[r] - onek[l - 1])\nprint(\'\\n\'.join(map(str, cevap)))\n',
  editorial: '<p><b>Yaklaşım:</b> <code>onek[i]</code> = ilk i günün toplamı olacak şekilde bir önek (prefix) dizisi kur; <code>onek[0] = 0</code>. Sonra L..R toplamı <code>onek[R] - onek[L-1]</code> olur. Ön hazırlık bir kez yapılır, her sorgu sabit sürede cevaplanır. (<code>itertools.accumulate</code> da aynı diziyi üretir.)</p>\n<p><b>Karmaşıklık:</b> O(N + Q) zaman, O(N) bellek.</p>\n<p><b>Naif çözüm neden yetmez:</b> Her sorguda <code>sum(ciro[L-1:R])</code> demek sorgu başına O(N), toplamda O(N·Q) = 10^10 işlem demektir; gizli testteki geniş aralıklı 10^5 sorguda zaman sınırını aşar.</p>\n<p><b>Sık hata:</b> 1 tabanlı L\'yi 0 tabanlı diziyle karıştırmak (<code>onek[L]</code> yazmak) ve çok satırlı girdiyi <code>input()</code> ile tek tek okuyup yavaşlamak; büyük girdide <code>sys.stdin</code> kullan.</p>',
  hints: ['onek[i+1] = onek[i] + ciro[i]', 'L..R toplamı = onek[R] − onek[L−1].']
},
{
  id: 'a-124',
  title: 'En iyi K günlük kampanya dönemi',
  track: 'Algoritmalar',
  diff: 'Kolay',
  pts: 10,
  tags: ['kayan pencere'],
  src: 'LeetCode 643 Maximum Average Subarray I benzeri',
  mode: 'stdin',
  statement: '<p>Lezzet Kurye, bir sonraki reklam kampanyasını geçmiş verideki en başarılı <b>K ardışık günlük</b> dönemi örnek alarak planlayacak. Günlük net kâr dizisi verildiğinde, uzunluğu tam K olan ardışık dönemler içinde toplam kârı en yüksek olanın toplamını bul.</p>',
  input: '<p>İlk satırda N ve K. İkinci satırda N tam sayı (günlük net kâr; negatif olabilir).</p>',
  output: '<p>En büyük K günlük toplam.</p>',
  constraints: '1 ≤ K ≤ N ≤ 2·10^5, |kâr| ≤ 10^4',
  samples: [
      { in: '6 3\n2 -1 4 3 -6 5\n', out: '6\n', why: 'Pencereler: 5, 6, 1, 2. En büyüğü −1+4+3 = 6.' },
      { in: '3 3\n-1 -2 -3\n', out: '-6\n', why: 'Tek pencere var: −6.' }
  ],
  hidden: [
      { in: '1 1\n-7\n', out: '-7\n' },
      { in: '5 1\n-3 -1 -2 -9 -4\n', out: '-1\n' },
      { in: '5 2\n1 1 1 1 1\n', out: '2\n' },
      { in: '8 4\n5 5 -20 5 5 5 5 -1\n', out: '20\n' },
      { gen: 'import random\nrandom.seed(124)\nn, k = 200000, 70000\nprint(n, k)\nprint(*[random.randint(-10**4, 10**4) for _ in range(n)])\n' },
      { in: '6 6\n1 2 3 4 5 6\n', out: '21\n' }
  ],
  start: 'n, k = map(int, input().split())\nkar = list(map(int, input().split()))\n# ilk pencerenin toplamını al, sonra kaydır\n',
  sol: 'n, k = map(int, input().split())\nkar = list(map(int, input().split()))\ntoplam = sum(kar[:k])\nen_iyi = toplam\nfor i in range(k, n):\n    toplam += kar[i] - kar[i - k]\n    if toplam > en_iyi:\n        en_iyi = toplam\nprint(en_iyi)\n',
  editorial: '<p><b>Yaklaşım:</b> Sabit boyutlu kayan pencere (sliding window). İlk K elemanın toplamını hesapla. Pencereyi bir sağa kaydırırken yeni gireni ekle, çıkanı düş: <code>toplam += kar[i] - kar[i-K]</code>. Her adımda en iyiyi güncelle.</p>\n<p><b>Karmaşıklık:</b> O(N) zaman, O(1) ek bellek.</p>\n<p><b>Naif çözüm neden yetmez:</b> Her başlangıç için <code>sum(kar[i:i+K])</code> hesaplamak O(N·K)\'dir; gizli testte N=2·10^5, K=7·10^4 için ~10^10 işlem eder.</p>\n<p><b>Sık hata:</b> <code>en_iyi = 0</code> ile başlamak: tüm değerler negatifse yanlış cevap verir. İlk pencerenin toplamıyla başla.</p>',
  hints: ['Pencere kayınca yalnız iki eleman değişir.', 'Başlangıç değerini 0 değil ilk pencerenin toplamı yap.']
},
{
  id: 'a-125',
  title: 'Tekrarsız en uzun rota kodu',
  track: 'Algoritmalar',
  diff: 'Orta',
  pts: 30,
  tags: ['kayan pencere', 'sözlük'],
  src: 'LeetCode 3 Longest Substring Without Repeating Characters benzeri',
  mode: 'stdin',
  statement: '<p>Lezzet Kurye\'nin rota kayıtlarında her karakter bir mahalle kodudur. Operasyon ekibi, hiçbir mahallenin tekrar etmediği <b>en uzun ardışık bölümün</b> uzunluğunu merak ediyor; bu, kuryenin aynı yere dönmeden yaptığı en uzun kesintisiz tur sayılıyor.</p>\n<p>Verilen metinde, içinde aynı karakterin iki kez geçmediği en uzun alt dizinin (ardışık parça) uzunluğunu yazdır.</p>',
  input: '<p>Tek satırda rota metni (küçük İngilizce harfler ve rakamlar).</p>',
  output: '<p>Tek tam sayı: en uzun tekrarsız parçanın uzunluğu.</p>',
  constraints: '1 ≤ |s| ≤ 2·10^5',
  samples: [
      { in: 'abcabcbb\n', out: '3\n', why: 'En uzun tekrarsız parçalar "abc", "bca", "cab": uzunluk 3.' },
      { in: 'pwwkew\n', out: '3\n', why: '"wke" uzunluk 3; "pwke" ardışık değil, sayılmaz.' }
  ],
  hidden: [
      { in: 'a\n', out: '1\n' },
      { in: 'bbbbbb\n', out: '1\n' },
      { in: 'abba\n', out: '2\n' },
      { in: 'dvdf\n', out: '3\n' },
      { in: 'tmmzuxt\n', out: '5\n' },
      { in: '0123456789abcdefghijklmnopqrstuvwxyz\n', out: '36\n' },
      { gen: 'import random\nrandom.seed(125)\nprint(\'\'.join(random.choice(\'abcdefghijklmnopqrstuvwxyz0123456789\') for _ in range(200000)))\n' },
      { gen: 's = \'abcdefghijklmnopqrstuvwxyz0123456789\'\nprint((s * 6000)[:200000])\n' }
  ],
  start: 's = input().strip()\n# son görülme indekslerini sözlükte tut\n',
  sol: 's = input().strip()\nson = {}\nsol = 0\nen_iyi = 0\nfor i, c in enumerate(s):\n    if c in son and son[c] >= sol:\n        sol = son[c] + 1\n    son[c] = i\n    if i - sol + 1 > en_iyi:\n        en_iyi = i - sol + 1\nprint(en_iyi)\n',
  editorial: '<p><b>Yaklaşım:</b> Değişken boyutlu kayan pencere. <code>sol</code> pencerenin başı, <code>i</code> sonu. Her karakterin son görüldüğü indeksi sözlükte tut. Yeni karakter pencerenin içinde daha önce görüldüyse (<code>son[c] &gt;= sol</code>), pencerenin başını o tekrarın bir sağına zıplat. Her adımda pencere uzunluğu <code>i - sol + 1</code> adaydır.</p>\n<p><b>Karmaşıklık:</b> O(n) zaman; sözlük en fazla alfabe kadar (O(min(n, Σ))) bellek.</p>\n<p><b>Naif çözüm neden yetmez:</b> Tüm (i, j) çiftlerini deneyip <code>set</code> ile kontrol etmek O(n²)–O(n³)\'tür; 2·10^5 karakterde milyarlarca adım eder.</p>\n<p><b>Sık hata:</b> <code>son[c] &gt;= sol</code> kontrolünü unutmak: "abba" örneğinde ikinci a geldiğinde eski a pencerenin dışındadır, <code>sol</code> geri gitmemelidir (cevap 2).</p>',
  hints: ['Pencerenin başını ve her karakterin son indeksini tut.', 'Tekrar pencere içindeyse başı son[c]+1\'e taşı; geri gitme.']
},
{
  id: 'a-126',
  title: 'Depo çatısında biriken yağmur',
  track: 'Algoritmalar',
  diff: 'Zor',
  pts: 60,
  tags: ['iki işaretçi', 'önek maksimum'],
  src: 'LeetCode 42 Trapping Rain Water benzeri',
  mode: 'stdin',
  statement: '<p>Anadolu Market\'in açık depo alanında yan yana dizilmiş, her biri 1 birim genişliğinde N raf bloğu var; i. bloğun yüksekliği h<sub>i</sub>. Şiddetli yağmurdan sonra bloklar arasındaki çukurlarda su birikiyor. Bir sütunun üzerinde biriken su miktarı, solundaki en yüksek blok ile sağındaki en yüksek bloktan <b>küçük olanı</b> eksi kendi yüksekliğidir (negatifse 0).</p>\n<p>Toplam kaç birim su biriktiğini hesapla.</p>',
  input: '<p>İlk satırda N. İkinci satırda N tam sayı (yükseklikler).</p>',
  output: '<p>Toplam biriken su (tam sayı).</p>',
  constraints: '1 ≤ N ≤ 2·10^5, 0 ≤ h ≤ 10^4',
  samples: [
      { in: '12\n0 1 0 2 1 0 1 3 2 1 2 1\n', out: '6\n', why: 'Çukurlarda 1+1+2+1+1 = 6 birim su birikir.' },
      { in: '6\n4 2 0 3 2 5\n', out: '9\n', why: 'Sütunlara 2, 4, 1, 2 birim: toplam 9.' }
  ],
  hidden: [
      { in: '1\n5\n', out: '0\n' },
      { in: '2\n3 3\n', out: '0\n' },
      { in: '5\n1 2 3 4 5\n', out: '0\n' },
      { in: '5\n5 4 3 2 1\n', out: '0\n' },
      { in: '3\n5 0 5\n', out: '5\n' },
      { in: '7\n0 0 0 0 0 0 0\n', out: '0\n' },
      { gen: 'import random\nrandom.seed(126)\nn = 200000\nprint(n)\nprint(*[random.randint(0, 10**4) for _ in range(n)])\n' },
      { gen: 'n = 200000\nprint(n)\nh = [10000] + [0] * (n - 2) + [9999]\nprint(*h)\n' }
  ],
  start: 'n = int(input())\nh = list(map(int, input().split()))\n# iki uçtan işaretçilerle ilerle\n',
  sol: 'n = int(input())\nh = list(map(int, input().split()))\ni, j = 0, n - 1\nsol_max = sag_max = 0\nsu = 0\nwhile i < j:\n    if h[i] < h[j]:\n        if h[i] >= sol_max:\n            sol_max = h[i]\n        else:\n            su += sol_max - h[i]\n        i += 1\n    else:\n        if h[j] >= sag_max:\n            sag_max = h[j]\n        else:\n            su += sag_max - h[j]\n        j -= 1\nprint(su)\n',
  editorial: '<p><b>Yaklaşım:</b> Her sütundaki su = <code>min(soldaki_max, sağdaki_max) - h[i]</code>. İki işaretçiyle tek geçişte hesaplanabilir: Sol ve sağ uçtan başla, <code>sol_max</code> ve <code>sag_max</code> tut. <code>h[i] &lt; h[j]</code> ise sol taraftaki sütunun suyu kesinlikle <code>sol_max</code> ile sınırlıdır (çünkü sağda en az h[j] kadar yüksek bir duvar var); onu hesapla ve <code>i</code>\'yi ilerlet. Aksi hâlde simetrik işlemi sağda yap.</p>\n<p><b>Karmaşıklık:</b> O(N) zaman, O(1) ek bellek. Alternatif: iki önek-maksimum dizisi (soldan ve sağdan) ile O(N) zaman, O(N) bellek; monoton yığınla da çözülür.</p>\n<p><b>Naif çözüm neden yetmez:</b> Her sütun için solu ve sağı baştan taramak O(N²) = 4·10^10 işlem; gizli testteki 2·10^5 blokta saniyelerce değil dakikalarca sürer.</p>\n<p><b>Sık hata:</b> Sadece en yüksek komşuya bakmak (yerel çukur sanmak) ya da hangi tarafı ilerleteceğine yanlış karar vermek: her zaman <b>alçak</b> taraftaki işaretçiyi ilerlet.</p>',
  hints: [
      'Su seviyesi min(sol en yüksek, sağ en yüksek) ile belirlenir.',
      'Alçak taraftaki işaretçinin suyu kesin bilinir; onu işle ve ilerlet.'
  ]
},
{
  id: 'a-127',
  title: 'Net sıfır işlem üçlüleri',
  track: 'Algoritmalar',
  diff: 'Orta',
  pts: 30,
  tags: ['iki işaretçi', 'sıralama'],
  src: 'LeetCode 15 3Sum benzeri',
  mode: 'stdin',
  statement: '<p>Ilgaz Bank denetim ekibi, toplamı tam sıfır olan üç hesap hareketi (örneğin +500, −200, −300) bulduğunda bunları "dengeleyici üçlü" olarak işaretliyor. Aynı tutar değerlerinden oluşan üçlüler tek sayılır: {−1, 0, 1} hangi indekslerden gelirse gelsin bir kez sayılır.</p>\n<p>Farklı indekslerdeki üç hareketten oluşan, toplamı 0 olan <b>farklı değer üçlülerinin</b> sayısını yazdır.</p>',
  input: '<p>İlk satırda N. İkinci satırda N tam sayı (hareket tutarları).</p>',
  output: '<p>Farklı üçlü sayısı.</p>',
  constraints: '3 ≤ N ≤ 1500, |tutar| ≤ 10^5',
  samples: [
      { in: '6\n-1 0 1 2 -1 -4\n', out: '2\n', why: 'Üçlüler: {−1, −1, 2} ve {−1, 0, 1}. Cevap 2.' },
      { in: '3\n0 0 0\n', out: '1\n', why: '{0, 0, 0} tek üçlü.' }
  ],
  hidden: [
      { in: '3\n1 2 3\n', out: '0\n' },
      { in: '5\n0 0 0 0 0\n', out: '1\n' },
      { in: '7\n-2 0 1 1 2 -1 -1\n', out: '4\n' },
      { in: '4\n-1 -1 2 2\n', out: '1\n' },
      { gen: 'import random\nrandom.seed(127)\nn = 1500\nprint(n)\nprint(*[random.randint(-10**5, 10**5) for _ in range(n)])\n' },
      { gen: 'import random\nrandom.seed(1270)\nn = 1500\nprint(n)\nprint(*[random.randint(-300, 300) for _ in range(n)])\n' }
  ],
  start: 'n = int(input())\na = sorted(map(int, input().split()))\nsayac = 0\n# her i için iki işaretçiyle j, k ara; tekrarları atla\nprint(sayac)\n',
  sol: 'n = int(input())\na = sorted(map(int, input().split()))\nsayac = 0\nfor i in range(n - 2):\n    if i > 0 and a[i] == a[i - 1]:\n        continue\n    if a[i] > 0:\n        break\n    hedef = -a[i]\n    j, k = i + 1, n - 1\n    while j < k:\n        t = a[j] + a[k]\n        if t < hedef:\n            j += 1\n        elif t > hedef:\n            k -= 1\n        else:\n            sayac += 1\n            v = a[j]\n            while j < k and a[j] == v:\n                j += 1\n            k -= 1\nprint(sayac)\n',
  editorial: '<p><b>Yaklaşım:</b> Diziyi sırala. Her <code>i</code> için (aynı değer bir öncekiyle eşitse atla) kalan kısımda toplamı <code>-a[i]</code> olan çifti iki işaretçiyle ara: toplam küçükse <code>j</code>\'yi, büyükse <code>k</code>\'yi kaydır. Bir çift bulunca say, <code>j</code>\'yi aynı değerleri geçecek kadar ilerlet. <code>a[i] &gt; 0</code> olunca dur; üç pozitif sıfır edemez.</p>\n<p><b>Karmaşıklık:</b> Sıralama O(N log N) + dış döngü × iki işaretçi O(N²). Bellek O(1) (sıralı liste dışında).</p>\n<p><b>Naif çözüm neden yetmez:</b> Üç iç içe döngü (ya da <code>combinations(a, 3)</code>) O(N³) ≈ 5,6·10^8 üçlü üretir (N=1500); CPython\'da dakikalar sürer. Hash tablosu ile O(N²) çözüm de mümkündür ama tekrarları ayıklamak daha zahmetlidir.</p>\n<p><b>Sık hata:</b> Tekrarları atlamamak ve aynı üçlüyü birden çok kez saymak; ya da tekrarları <code>set</code> ile ayıklayıp yine O(N³) kalmak.</p>',
  hints: [
      'Önce sırala; sıralı dizide iki işaretçi çalışır.',
      'Aynı a[i] değerini ikinci kez kullanma; çift bulunca aynı a[j] değerlerini de atla.'
  ]
},
{
  id: 'a-128',
  title: 'Hedef tonaja ulaşan en kısa sevkiyat',
  track: 'Algoritmalar',
  diff: 'Orta',
  pts: 30,
  tags: ['kayan pencere', 'iki işaretçi'],
  src: 'LeetCode 209 Minimum Size Subarray Sum benzeri',
  mode: 'stdin',
  statement: '<p>Kanat Havayolları kargo bölümünde paletler sırayla bantta ilerliyor; i. paletin ağırlığı w<sub>i</sub> (pozitif). Bir uçağa <b>ardışık</b> paletler yüklenecek ve toplam ağırlık en az S olmalı (aksi hâlde sefer kârsız).</p>\n<p>Toplamı en az S olan en kısa ardışık palet grubunun uzunluğunu yazdır. Hiçbir grup yetmiyorsa 0 yaz.</p>',
  input: '<p>İlk satırda N ve S. İkinci satırda N pozitif tam sayı.</p>',
  output: '<p>En kısa uzunluk ya da 0.</p>',
  constraints: '1 ≤ N ≤ 2·10^5, 1 ≤ w ≤ 10^4, 1 ≤ S ≤ 2·10^9',
  samples: [
      { in: '6 7\n2 3 1 2 4 3\n', out: '2\n', why: '[4, 3] toplamı 7, uzunluk 2.' },
      { in: '3 100\n10 20 30\n', out: '0\n', why: 'Hepsinin toplamı 60, yani 100\'e ulaşılamıyor: cevap 0.' }
  ],
  hidden: [
      { in: '1 5\n5\n', out: '1\n' },
      { in: '1 6\n5\n', out: '0\n' },
      { in: '5 11\n1 2 3 4 5\n', out: '3\n' },
      { in: '8 15\n1 1 1 1 1 1 1 1\n', out: '0\n' },
      { in: '4 4\n1 4 4 1\n', out: '1\n' },
      { gen: 'import random\nrandom.seed(128)\nn = 200000\nprint(n, 3 * 10**7)\nprint(*[random.randint(1, 10**4) for _ in range(n)])\n' },
      { gen: 'n = 200000\nprint(n, 150000)\nprint(*([1] * n))\n' }
  ],
  start: 'n, s = map(int, input().split())\nw = list(map(int, input().split()))\n# pencereyi sağdan büyüt, toplam >= s iken soldan daralt\n',
  sol: 'n, s = map(int, input().split())\nw = list(map(int, input().split()))\nen_kisa = n + 1\ntoplam = 0\nsol = 0\nfor i in range(n):\n    toplam += w[i]\n    while toplam >= s:\n        if i - sol + 1 < en_kisa:\n            en_kisa = i - sol + 1\n        toplam -= w[sol]\n        sol += 1\nprint(0 if en_kisa == n + 1 else en_kisa)\n',
  editorial: '<p><b>Yaklaşım:</b> Değerler pozitif olduğu için pencere toplamı sağa genişleyince artar, soldan daralınca azalır. Sağ ucu ilerlet, toplam S\'ye ulaştıkça uzunluğu kaydet ve sol ucu daralt. Her eleman pencereye bir kez girer, bir kez çıkar.</p>\n<p><b>Karmaşıklık:</b> O(N) zaman (amortize), O(1) bellek. Alternatif: önek toplamları + ikili arama ile O(N log N).</p>\n<p><b>Naif çözüm neden yetmez:</b> Her başlangıç için sağa doğru toplamak O(N²) = 4·10^10 adımdır. Gizli testte 2·10^5 palet ve büyük S var.</p>\n<p><b>Sık hata:</b> Bu tekniği negatif değerli dizilere uygulamak (orada toplam monoton değildir; önek + monoton deque gerekir) ve hiç pencere bulunamadığında 0 yerine N+1 yazdırmak.</p>',
  hints: ['Değerler pozitif: pencere büyüyünce toplam artar.', 'Toplam ≥ S olduğu sürece soldan daralt ve en kısa uzunluğu güncelle.']
},
{
  id: 'a-129',
  title: 'Tüm stok kodlarını kapsayan en kısa raf aralığı',
  track: 'Algoritmalar',
  diff: 'Zor',
  pts: 60,
  tags: ['kayan pencere', 'sayaç'],
  src: 'LeetCode 76 Minimum Window Substring benzeri',
  mode: 'stdin',
  statement: '<p>Anadolu Market deposunda raflar tek sıra hâlinde dizili ve her rafta tek harfli bir ürün kategorisi kodu var (s metni). Bir toplayıcı, siparişteki tüm kategorileri (t metni, tekrarlar dahil: "AAB" iki A ve bir B ister) tek bir <b>ardışık raf aralığından</b> toplamak istiyor.</p>\n<p>t\'deki her karakteri (tekrar sayısıyla) içeren en kısa ardışık parçayı yazdır. Aynı uzunlukta birden çok parça varsa <b>en soldakini</b> seç. Hiçbiri yoksa <code>YOK</code> yaz.</p>',
  input: '<p>İlk satırda s, ikinci satırda t (büyük ve küçük İngilizce harfler; büyük/küçük harf farklı sayılır).</p>',
  output: '<p>En kısa parça ya da <code>YOK</code>.</p>',
  constraints: '1 ≤ |s| ≤ 10^5, 1 ≤ |t| ≤ 10^4',
  samples: [
      { in: 'ADOBECODEBANC\nABC\n', out: 'BANC\n', why: '"BANC" A, B ve C\'yi içeren en kısa parça (uzunluk 4).' },
      { in: 'aa\naaa\n', out: 'YOK\n', why: 's\'de yalnız iki a var, üç a istenmiş: YOK.' }
  ],
  hidden: [
      { in: 'a\na\n', out: 'a\n' },
      { in: 'a\nA\n', out: 'YOK\n' },
      { in: 'abcabc\ncb\n', out: 'bc\n' },
      { in: 'xyzAAByyAB\nAAB\n', out: 'AAB\n' },
      { in: 'bba\nab\n', out: 'ba\n' },
      { in: 'aaflslflsldkalskaaa\naaa\n', out: 'aaa\n' },
      { gen: 'import random\nrandom.seed(129)\ns = \'\'.join(random.choice(\'abcdefghij\') for _ in range(100000))\nt = \'\'.join(random.choice(\'abcdefghij\') for _ in range(40))\nprint(s)\nprint(t)\n' },
      { gen: 'import random\nrandom.seed(1290)\ns = \'\'.join(random.choice(\'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ\') for _ in range(100000))\nt = \'\'.join(random.choice(\'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ\') for _ in range(10000))\nprint(s)\nprint(t)\n' },
      { gen: 's = \'a\' * 99999 + \'b\'\nprint(s)\nprint(\'ba\')\n' }
  ],
  start: 'from collections import Counter\ns = input().strip()\nt = input().strip()\ngerek = Counter(t)\n# eksik sayısını tutarak pencereyi genişlet/daralt\n',
  sol: 'from collections import Counter\ns = input().strip()\nt = input().strip()\ngerek = Counter(t)\neksik = len(t)\nsol = 0\nen_bas, en_uzun = 0, len(s) + 1\nfor i, c in enumerate(s):\n    if gerek[c] > 0:\n        eksik -= 1\n    gerek[c] -= 1\n    if eksik == 0:\n        while gerek[s[sol]] < 0:\n            gerek[s[sol]] += 1\n            sol += 1\n        if i - sol + 1 < en_uzun:\n            en_bas, en_uzun = sol, i - sol + 1\n        gerek[s[sol]] += 1\n        eksik += 1\n        sol += 1\nprint(\'YOK\' if en_uzun > len(s) else s[en_bas:en_bas + en_uzun])\n',
  editorial: '<p><b>Yaklaşım:</b> <code>gerek</code> sayacı t\'deki karakterlerden kaç tane daha lazım olduğunu, <code>eksik</code> toplam eksik karakter sayısını tutar. Sağ ucu ilerletirken gelen karakter hâlâ gerekiyorsa <code>eksik</code>\'i azalt. <code>eksik == 0</code> olunca pencere geçerlidir: soldan fazlalıkları (sayacı negatif olanları) at, uzunluğu kaydet, sonra bir gerekli karakteri bırakıp aramaya devam et.</p>\n<p><b>Karmaşıklık:</b> Her indeks pencereye bir kez girip bir kez çıkar: O(|s| + |t|) zaman, alfabe boyutunda bellek.</p>\n<p><b>Naif çözüm neden yetmez:</b> Tüm parçaları denemek O(|s|²) parça × her birinde sayım; 10^5 uzunlukta 10^10\'dan fazla işlem. Her pencere için <code>Counter</code> karşılaştırmak da alfabe kadar ek maliyet getirir.</p>\n<p><b>Sık hata:</b> Tekrar sayısını göz ardı etmek (<code>set(t)</code> kullanmak), büyük/küçük harfi aynı saymak ve eşit uzunlukta sağdaki pencereyi seçmek (karşılaştırmada <code>&lt;=</code> yerine <code>&lt;</code> kullan).</p>',
  hints: [
      'Eksik karakter sayısını tek bir tamsayıda tut; her seferinde Counter karşılaştırma.',
      'Pencere geçerli olunca soldan gereksizleri at, kaydet, sonra bir adım daha daralt.'
  ]
},
{
  id: 'a-130',
  title: 'Net bakiye değişimi tam K olan dönemler',
  track: 'Algoritmalar',
  diff: 'Orta',
  pts: 30,
  tags: ['önek toplamı', 'sözlük'],
  src: 'LeetCode 560 Subarray Sum Equals K benzeri',
  mode: 'stdin',
  statement: '<p>Ilgaz Bank\'ın risk ekibi, bir müşterinin günlük bakiye değişimlerini (yatırma pozitif, çekme negatif) inceliyor. Toplam değişimi tam olarak K olan <b>ardışık gün dönemlerinin</b> sayısı şüpheli örüntü göstergesi sayılıyor.</p>\n<p>Toplamı K olan ardışık alt dizi (en az 1 gün) sayısını yazdır.</p>',
  input: '<p>İlk satırda N ve K. İkinci satırda N tam sayı.</p>',
  output: '<p>Dönem sayısı.</p>',
  constraints: '1 ≤ N ≤ 2·10^5, |değer| ≤ 1000, |K| ≤ 10^8',
  samples: [
      { in: '5 3\n1 2 1 2 1\n', out: '4\n', why: '[1,2], [2,1], [1,2], [2,1]: 4 dönem.' },
      { in: '4 0\n1 -1 1 -1\n', out: '4\n', why: 'Toplamı 0 olan dönemler: [1,−1] üç kez ve [1,−1,1,−1] bir kez: 4.' }
  ],
  hidden: [
      { in: '1 5\n5\n', out: '1\n' },
      { in: '1 0\n0\n', out: '1\n' },
      { in: '3 0\n0 0 0\n', out: '6\n' },
      { in: '5 -2\n-1 -1 1 -2 0\n', out: '5\n' },
      { in: '4 100\n1 2 3 4\n', out: '0\n' },
      { gen: 'import random\nrandom.seed(130)\nn = 200000\nprint(n, 7)\nprint(*[random.randint(-3, 3) for _ in range(n)])\n' },
      { gen: 'n = 200000\nprint(n, 0)\nprint(*([0] * n))\n' }
  ],
  start: 'from collections import defaultdict\nn, k = map(int, input().split())\na = list(map(int, input().split()))\n# görülen önek toplamlarını say\n',
  sol: 'n, k = map(int, input().split())\na = list(map(int, input().split()))\ngoruldu = {0: 1}\nonek = 0\nsayac = 0\nfor x in a:\n    onek += x\n    sayac += goruldu.get(onek - k, 0)\n    goruldu[onek] = goruldu.get(onek, 0) + 1\nprint(sayac)\n',
  editorial: '<p><b>Yaklaşım:</b> P(i) ilk i elemanın toplamı olsun. (j, i] aralığının toplamı P(i) − P(j). Bu K ise P(j) = P(i) − K. Soldan geçerken her önek toplamının kaç kez görüldüğünü sözlükte say; her adımda <code>goruldu[onek - K]</code> kadar yeni dönem bulursun. Başlangıçta <code>{0: 1}</code> (boş önek) olmalı ki baştan başlayan dönemler sayılsın.</p>\n<p><b>Karmaşıklık:</b> O(N) zaman, O(N) bellek.</p>\n<p><b>Naif çözüm neden yetmez:</b> Tüm (i, j) çiftlerini denemek O(N²) = 2·10^10\'dur. Değerler negatif olabildiği için kayan pencere de çalışmaz: toplam monoton değildir. Cevap 2·10^10 civarına çıkabilir; Python tam sayıları taşmaz ama başka dillerde 64 bit gerekir.</p>\n<p><b>Sık hata:</b> <code>{0: 1}</code> başlangıcını unutmak ya da sözlüğü güncelledikten <i>sonra</i> sorgulamak (K=0 iken her elemanı kendisiyle eşleyip fazla sayarsın).</p>',
  hints: ['Aralık toplamı = iki önek toplamının farkı.', 'Önce onek−K kaç kez görüldü diye bak, sonra onek\'i sözlüğe ekle.']
},
{
  id: 'a-131',
  title: 'İstenen saatten sonraki ilk uçuş',
  track: 'Algoritmalar',
  diff: 'Kolay',
  pts: 10,
  tags: ['ikili arama', 'bisect'],
  src: 'HackerRank / LeetCode lower_bound kalıbı',
  mode: 'stdin',
  statement: '<p>Kanat Havayolları\'nın İstanbul–İzmir hattındaki kalkış saatleri, gece yarısından itibaren dakika cinsinden <b>sıralı</b> bir listede tutuluyor (aynı dakikada birden çok sefer olabilir). Çağrı merkezi her müşteri için "x. dakikada ya da sonrasında kalkan ilk uçuş hangi dakikada?" sorusunu yanıtlıyor.</p>\n<p>Her sorgu için x\'ten büyük ya da eşit ilk kalkış dakikasını yaz; yoksa <code>-1</code> yaz.</p>',
  input: '<p>İlk satırda N ve Q. İkinci satırda N kalkış dakikası (azalmayan sırada). Sonraki Q satırda birer x.</p>',
  output: '<p>Her sorgu için bir satır.</p>',
  constraints: '1 ≤ N, Q ≤ 10^5, 0 ≤ dakika, x ≤ 10^9',
  samples: [
      { in: '5 4\n60 90 90 300 720\n0\n90\n91\n800\n', out: '60\n90\n300\n-1\n', why: 'x=0 → 60, x=90 → 90, x=91 → 300, x=800 → uçuş yok: −1.' }
  ],
  hidden: [
      { in: '1 2\n5\n5\n6\n', out: '5\n-1\n' },
      { in: '3 3\n10 10 10\n9\n10\n11\n', out: '10\n10\n-1\n' },
      { in: '4 1\n1 2 3 4\n0\n', out: '1\n' },
      { gen: 'import random\nrandom.seed(131)\nn = q = 100000\na = sorted(random.randint(0, 10**9) for _ in range(n))\nprint(n, q)\nprint(*a)\nprint(\'\\n\'.join(str(random.randint(0, 10**9)) for _ in range(q)))\n' },
      { gen: 'import random\nrandom.seed(1310)\nn = q = 100000\na = sorted(random.randint(0, 1000) for _ in range(n))\nprint(n, q)\nprint(*a)\nprint(\'\\n\'.join(str(random.randint(0, 1001)) for _ in range(q)))\n' },
      { in: '5 5\n2 4 6 8 10\n1\n3\n10\n11\n1000000000\n', out: '2\n4\n10\n-1\n-1\n' },
      { in: '2 1\n0 1000000000\n1000000000\n', out: '1000000000\n' }
  ],
  start: 'import sys\nfrom bisect import bisect_left\ninput = sys.stdin.readline\nn, q = map(int, input().split())\na = list(map(int, input().split()))\nfor _ in range(q):\n    x = int(input())\n    # bisect_left ile ilk >= x konumunu bul\n',
  sol: 'import sys\nfrom bisect import bisect_left\nveri = sys.stdin.read().split()\nn, q = int(veri[0]), int(veri[1])\na = list(map(int, veri[2:2 + n]))\ncevap = []\nfor t in veri[2 + n:2 + n + q]:\n    i = bisect_left(a, int(t))\n    cevap.append(a[i] if i < n else -1)\nprint(\'\\n\'.join(map(str, cevap)))\n',
  editorial: '<p><b>Yaklaşım:</b> Liste sıralı olduğundan "x\'ten büyük-eşit ilk eleman" ikili aramayla bulunur. <code>bisect_left(a, x)</code> x\'in sırayı bozmadan girebileceği en soldaki konumu verir; bu konum N ise öyle bir uçuş yoktur.</p>\n<p><b>Karmaşıklık:</b> Sorgu başına O(log N), toplam O((N + Q) log N).</p>\n<p><b>Naif çözüm neden yetmez:</b> Her sorguda listeyi baştan taramak O(N·Q) = 10^10 karşılaştırma. Sözlükle "tam eşleşme" aramak da işe yaramaz; x listede olmayabilir.</p>\n<p><b>Kendi ikili araman:</b> <code>lo, hi = 0, n</code>; <code>while lo &lt; hi: mid = (lo+hi)//2; if a[mid] &lt; x: lo = mid+1 else: hi = mid</code>. Sık hata: <code>hi = n-1</code> ile başlayıp "yok" durumunu kaçırmak ya da <code>bisect_right</code> kullanıp eşit değeri atlamak.</p>',
  hints: ['Sıralı listede "ilk ≥ x" = bisect_left.', 'Dönen indeks N ise −1 yaz.']
},
{
  id: 'a-132',
  title: 'Kuryenin minimum saatlik hızı',
  track: 'Algoritmalar',
  diff: 'Orta',
  pts: 30,
  tags: ['ikili arama', 'cevap üzerinde arama'],
  src: 'LeetCode 875 Koko Eating Bananas benzeri',
  mode: 'stdin',
  statement: '<p>Lezzet Kurye\'de bir kurye N bölgedeki bekleyen siparişleri H saat içinde bitirmek zorunda; i. bölgede p<sub>i</sub> sipariş var. Kurye saatlik hızını v (saatte en fazla v sipariş) olarak seçer. Her saat yalnızca <b>tek bir bölgede</b> çalışır: o bölgede v\'den az sipariş kaldıysa hepsini bitirir ve o saatin kalanı boşa gider.</p>\n<p>Tüm siparişleri H saat içinde bitirebileceği en küçük tam sayı v\'yi bul.</p>',
  input: '<p>İlk satırda N ve H. İkinci satırda N tam sayı p<sub>i</sub>.</p>',
  output: '<p>En küçük v.</p>',
  constraints: '1 ≤ N ≤ 10^5, N ≤ H ≤ 10^9, 1 ≤ p ≤ 10^9',
  samples: [
      { in: '4 8\n3 6 7 11\n', out: '4\n', why: 'v=4 ile 1+2+2+3 = 8 saat; v=3 ile 1+2+3+4 = 10 saat (yetmez). Cevap 4.' },
      { in: '5 5\n30 11 23 4 20\n', out: '30\n', why: 'Her bölgeye tam 1 saat düşer: v en büyük değer olan 30 olmalı.' }
  ],
  hidden: [
      { in: '1 1\n1\n', out: '1\n' },
      { in: '1 1000000000\n1000000000\n', out: '1\n' },
      { in: '3 6\n5 5 5\n', out: '3\n' },
      { in: '2 3\n10 1\n', out: '5\n' },
      { gen: 'import random\nrandom.seed(132)\nn = 100000\np = [random.randint(1, 10**9) for _ in range(n)]\nprint(n, 3 * n + 12345)\nprint(*p)\n' },
      { gen: 'import random\nrandom.seed(1320)\nn = 100000\np = [random.randint(1, 10**6) for _ in range(n)]\nprint(n, 10**9)\nprint(*p)\n' }
  ],
  start: 'n, h = map(int, input().split())\np = list(map(int, input().split()))\n\ndef saat(v):\n    # v hızıyla toplam kaç saat gerekir?\n    pass\n\n# 1..max(p) aralığında ikili arama\n',
  sol: 'n, h = map(int, input().split())\np = list(map(int, input().split()))\n\ndef saat(v):\n    return sum((x + v - 1) // v for x in p)\n\nlo, hi = 1, max(p)\nwhile lo < hi:\n    mid = (lo + hi) // 2\n    if saat(mid) <= h:\n        hi = mid\n    else:\n        lo = mid + 1\nprint(lo)\n',
  editorial: '<p><b>Yaklaşım:</b> Cevap üzerinde ikili arama. v hızıyla gereken süre <code>Σ ceil(p/v)</code>; v arttıkça süre azalır (monoton). Bu yüzden "süre ≤ H" koşulunu sağlayan en küçük v ikili aramayla bulunur. Alt sınır 1, üst sınır <code>max(p)</code> (bu hızda her bölge tam 1 saat sürer ve N ≤ H).</p>\n<p><b>Karmaşıklık:</b> O(N · log(max p)) ≈ 10^5 × 30.</p>\n<p><b>Naif çözüm neden yetmez:</b> v\'yi 1\'den başlayıp birer artırmak, cevap 10^9 civarındayken 10^9 deneme × N demektir. Gizli testte cevap çok büyük.</p>\n<p><b>Sık hata:</b> Tavan bölmeyi <code>math.ceil(x / v)</code> ile yapmak (büyük sayılarda kayan nokta hatası riski); tam sayı hilesi <code>(x + v - 1) // v</code> güvenlidir. Bir de <code>lo &lt;= hi</code>/<code>hi = mid - 1</code> karışıklığından doğan sonsuz döngüler.</p>',
  hints: ['Hız arttıkça gereken saat azalır: monoton bir koşul.', 'Koşulu sağlayan en küçük v için 1..max(p) aralığında ikili ara.']
},
{
  id: 'a-133',
  title: 'Maaş bandındaki çalışan sayısı',
  track: 'Algoritmalar',
  diff: 'Orta',
  pts: 30,
  tags: ['ikili arama', 'sıralama'],
  src: 'HackerRank / Codeforces aralık sayma sorguları benzeri',
  mode: 'stdin',
  statement: '<p>Pusula İK, şirket genelindeki N çalışanın aylık maaşlarını tutuyor (sırasız). Yöneticiler gün boyunca "maaşı L ile R arasında (ikisi dahil) olan kaç kişi var?" diye soruyor; bu bilgiyle zam bütçesi planlanıyor.</p>\n<p>Her sorgu için aralıktaki çalışan sayısını yazdır.</p>',
  input: '<p>İlk satırda N ve Q. İkinci satırda N maaş. Sonraki Q satırda L R.</p>',
  output: '<p>Her sorgu için bir satır.</p>',
  constraints: '1 ≤ N, Q ≤ 10^5, 1 ≤ maaş ≤ 10^9, 1 ≤ L ≤ R ≤ 10^9',
  samples: [
      { in: '6 3\n42000 35000 50000 35000 90000 61000\n35000 50000\n60000 100000\n1 1000\n', out: '4\n2\n0\n', why: '35–50 bin: 35000, 35000, 42000, 50000 → 4. 60–100 bin: 61000, 90000 → 2. Üçüncüde kimse yok.' }
  ],
  hidden: [
      { in: '1 2\n5\n5 5\n6 9\n', out: '1\n0\n' },
      { in: '4 2\n7 7 7 7\n7 7\n1 6\n', out: '4\n0\n' },
      { in: '5 1\n1 2 3 4 5\n1 1000000000\n', out: '5\n' },
      { gen: 'import random\nrandom.seed(133)\nn = q = 100000\nprint(n, q)\nprint(*[random.randint(1, 10**9) for _ in range(n)])\nout = []\nfor _ in range(q):\n    l = random.randint(1, 10**9 // 2); out.append(f\'{l} {l + random.randint(0, 10**9 // 2)}\')\nprint(\'\\n\'.join(out))\n' },
      { gen: 'import random\nrandom.seed(1330)\nn = q = 100000\nprint(n, q)\nprint(*[random.randint(1, 100) for _ in range(n)])\nfor _ in range(q):\n    l = random.randint(1, 100); print(l, random.randint(l, 100))\n' },
      { in: '5 3\n10 20 30 40 50\n15 15\n20 40\n50 1000000000\n', out: '0\n3\n1\n' },
      { in: '3 2\n1000000000 1 1\n1 1\n1000000000 1000000000\n', out: '2\n1\n' }
  ],
  start: 'import sys\nfrom bisect import bisect_left, bisect_right\ninput = sys.stdin.readline\nn, q = map(int, input().split())\nmaas = list(map(int, input().split()))\n# önce sırala, sonra iki bisect farkı\n',
  sol: 'import sys\nfrom bisect import bisect_left, bisect_right\nveri = sys.stdin.read().split()\nn, q = int(veri[0]), int(veri[1])\nmaas = sorted(map(int, veri[2:2 + n]))\ncevap = []\np = 2 + n\nfor _ in range(q):\n    l, r = int(veri[p]), int(veri[p + 1]); p += 2\n    cevap.append(bisect_right(maas, r) - bisect_left(maas, l))\nprint(\'\\n\'.join(map(str, cevap)))\n',
  editorial: '<p><b>Yaklaşım:</b> Maaşları bir kez sırala. Sıralı listede [L, R] aralığındaki eleman sayısı <code>bisect_right(maas, R) - bisect_left(maas, L)</code>: R\'den büyük ilk elemanın konumu eksi L\'den küçük olmayan ilk elemanın konumu.</p>\n<p><b>Karmaşıklık:</b> O(N log N) ön hazırlık + sorgu başına O(log N).</p>\n<p><b>Naif çözüm neden yetmez:</b> Her sorguda tüm maaşları gezip saymak O(N·Q) = 10^10. Değer aralığı 10^9 olduğu için "her maaş değeri için sayaç dizisi + önek toplamı" da bellek açısından mümkün değil (koordinat sıkıştırmasıyla olurdu, ama bisect daha basit).</p>\n<p><b>Sık hata:</b> İki tarafta da <code>bisect_left</code> kullanmak: R\'ye eşit maaşlar sayılmaz. Uçlardan biri dahil, biri hariç olan aralıklarda hangi bisect\'in seçileceğini mutlaka küçük örnekle doğrula.</p>',
  hints: ['Maaşları bir kez sırala.', 'Sayı = bisect_right(R) − bisect_left(L).']
},
{
  id: 'a-134',
  title: 'D günde sevkiyat için en küçük kamyon kapasitesi',
  track: 'Algoritmalar',
  diff: 'Orta',
  pts: 30,
  tags: ['ikili arama', 'açgözlü'],
  src: 'LeetCode 1011 Capacity To Ship Packages Within D Days benzeri',
  mode: 'stdin',
  statement: '<p>Anadolu Market\'in Gebze deposundan çıkan N koli bant üzerinde sırayla duruyor (i. kolinin ağırlığı w<sub>i</sub>). Her gün tek bir kamyon, banttaki sıradan <b>sırayı bozmadan</b> koli yükler; kamyon kapasitesini aşacak koli bir sonraki güne kalır.</p>\n<p>Tüm kolilerin en fazla D günde gönderilebilmesi için gereken en küçük kamyon kapasitesini bul.</p>',
  input: '<p>İlk satırda N ve D. İkinci satırda N ağırlık.</p>',
  output: '<p>En küçük kapasite.</p>',
  constraints: '1 ≤ D ≤ N ≤ 5·10^4, 1 ≤ w ≤ 500',
  samples: [
      { in: '10 5\n1 2 3 4 5 6 7 8 9 10\n', out: '15\n', why: 'Kapasite 15: [1..5], [6,7], [8], [9], [10] → 5 gün. 14 ile 6 gün gerekir.' },
      { in: '4 1\n3 2 2 4\n', out: '11\n', why: 'Tek günde hepsi: 11.' }
  ],
  hidden: [
      { in: '1 1\n7\n', out: '7\n' },
      { in: '5 5\n4 4 4 4 4\n', out: '4\n' },
      { in: '6 3\n3 2 2 4 1 4\n', out: '6\n' },
      { in: '5 4\n1 2 3 1 1\n', out: '3\n' },
      { gen: 'import random\nrandom.seed(134)\nn = 50000\nprint(n, 37)\nprint(*[random.randint(1, 500) for _ in range(n)])\n' },
      { gen: 'import random\nrandom.seed(1340)\nn = 50000\nprint(n, 20000)\nprint(*[random.randint(1, 500) for _ in range(n)])\n' }
  ],
  start: 'n, d = map(int, input().split())\nw = list(map(int, input().split()))\n\ndef gun_sayisi(kapasite):\n    # açgözlü: sığdıkça aynı güne yükle\n    pass\n',
  sol: 'n, d = map(int, input().split())\nw = list(map(int, input().split()))\n\ndef gun_sayisi(kapasite):\n    gun, yuk = 1, 0\n    for x in w:\n        if yuk + x > kapasite:\n            gun += 1\n            yuk = 0\n        yuk += x\n    return gun\n\nlo, hi = max(w), sum(w)\nwhile lo < hi:\n    mid = (lo + hi) // 2\n    if gun_sayisi(mid) <= d:\n        hi = mid\n    else:\n        lo = mid + 1\nprint(lo)\n',
  editorial: '<p><b>Yaklaşım:</b> Kapasite sabitse gün sayısı açgözlü hesaplanır: koli sığdıkça aynı güne koy, sığmazsa yeni gün aç. Kapasite arttıkça gün sayısı azalır (monoton), dolayısıyla <code>gun_sayisi(c) ≤ D</code> olan en küçük c, <code>[max(w), sum(w)]</code> aralığında ikili aramayla bulunur. Alt sınır <code>max(w)</code>: en ağır koli sığmalı.</p>\n<p><b>Karmaşıklık:</b> O(N · log(Σw)) ≈ 5·10^4 × 25.</p>\n<p><b>Naif çözüm neden yetmez:</b> Kapasiteyi <code>max(w)</code>\'den birer birer artırmak cevaba kadar (milyonlarca) deneme × N adım demektir. Tüm bölme yollarını denemek ise üsteldir.</p>\n<p><b>Sık hata:</b> Alt sınırı 1 almak (o zaman tek koli bile sığmaz ve açgözlü fonksiyon yanlış sayar) ve sıralamayı bozmak (kolileri sıralamak problemi değiştirir).</p>',
  hints: ['Sabit kapasite için gün sayısını açgözlü hesapla.', 'Kapasite ↑ ⇒ gün ↓; max(w)..sum(w) arasında ikili ara.']
},
{
  id: 'a-135',
  title: 'İstasyonlar arası k. en kısa mesafe',
  track: 'Algoritmalar',
  diff: 'Zor',
  pts: 60,
  tags: ['ikili arama', 'iki işaretçi', 'sıralama'],
  src: 'LeetCode 719 Find K-th Smallest Pair Distance benzeri',
  mode: 'stdin',
  statement: '<p>Pedal İzmir, Kordon boyunca düz bir hat üzerinde N bisiklet istasyonu işletiyor; i. istasyonun konumu x<sub>i</sub> metre. Planlama ekibi, tüm istasyon çiftleri arasındaki N(N−1)/2 mesafeyi küçükten büyüğe dizdiğinde <b>k. sıradaki</b> mesafeyi istiyor (servis aracı menzili buna göre seçilecek).</p>\n<p>|x<sub>i</sub> − x<sub>j</sub>| (i &lt; j) değerleri arasında k. en küçüğü yazdır.</p>',
  input: '<p>İlk satırda N ve k. İkinci satırda N konum (sırasız, tekrar olabilir).</p>',
  output: '<p>k. en küçük mesafe.</p>',
  constraints: '2 ≤ N ≤ 4·10^4, 1 ≤ k ≤ N(N−1)/2, 0 ≤ x ≤ 10^6',
  samples: [
      { in: '3 1\n1 3 1\n', out: '0\n', why: 'Mesafeler: 0, 2, 2. En küçüğü 0.' },
      { in: '4 4\n10 40 20 70\n', out: '30\n', why: 'Mesafeler sıralı: 10, 20, 30, 30, 50, 60. 4. sıradaki 30.' }
  ],
  hidden: [
      { in: '2 1\n0 1000000\n', out: '1000000\n' },
      { in: '5 10\n1 2 3 4 5\n', out: '4\n' },
      { in: '5 3\n7 7 7 7 7\n', out: '0\n' },
      { in: '6 7\n1 6 1 10 3 3\n', out: '3\n' },
      { gen: 'import random\nrandom.seed(135)\nn = 40000\nprint(n, n * (n - 1) // 4)\nprint(*[random.randint(0, 10**6) for _ in range(n)])\n' },
      { gen: 'import random\nrandom.seed(1350)\nn = 40000\nprint(n, 123456789)\nprint(*[random.randint(0, 5000) for _ in range(n)])\n' }
  ],
  start: 'from bisect import bisect_right\nn, k = map(int, input().split())\nx = sorted(map(int, input().split()))\n\ndef kac_cift(d):\n    # mesafesi <= d olan çift sayısı\n    pass\n',
  sol: 'from bisect import bisect_right\nn, k = map(int, input().split())\nx = sorted(map(int, input().split()))\n\ndef kac_cift(d):\n    return sum(bisect_right(x, v + d) for v in x) - n * (n + 1) // 2\n\nlo, hi = 0, x[-1] - x[0]\nwhile lo < hi:\n    mid = (lo + hi) // 2\n    if kac_cift(mid) >= k:\n        hi = mid\n    else:\n        lo = mid + 1\nprint(lo)\n',
  editorial: '<p><b>Yaklaşım:</b> Cevabın kendisi üzerinde ikili arama. Konumları sırala. Bir d için "mesafesi ≤ d olan çift sayısı" hızlı sayılabilir: her i için <code>x[i] + d</code>\'yi aşmayan son konum <code>bisect_right</code> (ya da iki işaretçi) ile bulunur; i\'den sonra o konuma kadar olan herkes çift oluşturur. Bu sayı d ile monoton artar; sayının ≥ k olduğu en küçük d cevaptır. Çözümdeki formül, <code>Σ bisect_right(x, v+d)</code>\'den her i için kendisi dahil soldaki <code>i+1</code> elemanı çıkarır: <code>n(n+1)/2</code>.</p>\n<p><b>Karmaşıklık:</b> O(N log N · log(max x)) ≈ 4·10^4 × 15 × 20; iki işaretçili sayımla O(N log(max x)).</p>\n<p><b>Naif çözüm neden yetmez:</b> Tüm mesafeleri üretip sıralamak N=4·10^4 için 8·10^8 çift demek: hem zaman hem bellek (gigabaytlarca) yetmez. Heap ile k kez çekmek de k çok büyük olduğunda (gizli testte ~4·10^8) imkânsız.</p>\n<p><b>Sık hata:</b> Aynı konumlu istasyonları unutmak (mesafe 0 da bir çifttir) ve sayım fonksiyonunda i ile kendisini eşleştirmek.</p>',
  hints: [
      'Cevap 0..max−min arasında; "≤ d olan çift sayısı" d ile artar.',
      'Sıralı dizide her eleman için x+d\'yi aşmayan son indeksi bisect ile bul.'
  ]
},
{
  id: 'a-136',
  title: 'Kurye performans sıralaması',
  track: 'Algoritmalar',
  diff: 'Kolay',
  pts: 10,
  tags: ['sıralama', 'anahtar fonksiyonu'],
  src: 'HackerRank Python: Athlete Sort / çok anahtarlı sıralama benzeri',
  mode: 'stdin',
  statement: '<p>Lezzet Kurye ay sonunda kuryeleri şu kurallara göre sıralayıp ilan ediyor:</p>\n<ol><li>Müşteri puanı yüksek olan önce,</li><li>puanlar eşitse teslimat sayısı yüksek olan önce,</li><li>o da eşitse adı alfabetik olarak önce gelen önce.</li></ol>\n<p>Sıralanmış listedeki adları yazdır.</p>',
  input: '<p>İlk satırda N. Sonraki N satırın her birinde <code>ad puan teslimat</code> (ad boşluksuz, küçük İngilizce harfler).</p>',
  output: '<p>Her satırda bir ad, sıralanmış hâliyle.</p>',
  constraints: '1 ≤ N ≤ 10^5, 0 ≤ puan ≤ 100, 0 ≤ teslimat ≤ 10^4',
  samples: [
      { in: '4\nali 90 120\nzeynep 95 80\ncan 90 150\nbora 90 120\n', out: 'zeynep\ncan\nali\nbora\n', why: 'zeynep (95) ilk. 90 puanlılardan can 150 teslimatla önde; ali ve bora eşit, alfabetik: ali, bora.' }
  ],
  hidden: [
      { in: '1\ntek 0 0\n', out: 'tek\n' },
      { in: '3\nc 50 5\nb 50 5\na 50 5\n', out: 'a\nb\nc\n' },
      { in: '3\nx 1 100\ny 2 0\nz 1 101\n', out: 'y\nz\nx\n' },
      { gen: 'import random\nrandom.seed(136)\nn = 100000\nprint(n)\nh = \'abcdefghij\'\nfor i in range(n):\n    ad = \'\'.join(random.choice(h) for _ in range(6))\n    print(ad, random.randint(80, 100), random.randint(0, 50))\n' },
      { in: '2\nzz 100 10000\naa 0 0\n', out: 'zz\naa\n' },
      { in: '4\nmert 70 3\nmert 70 3\nayse 70 4\nbaris 71 0\n', out: 'baris\nayse\nmert\nmert\n' }
  ],
  start: 'import sys\ninput = sys.stdin.readline\nn = int(input())\nkuryeler = []\nfor _ in range(n):\n    ad, puan, teslim = input().split()\n    kuryeler.append((ad, int(puan), int(teslim)))\n# key ile sırala\n',
  sol: 'import sys\ninput = sys.stdin.readline\nn = int(input())\nkuryeler = []\nfor _ in range(n):\n    ad, puan, teslim = input().split()\n    kuryeler.append((ad, int(puan), int(teslim)))\nkuryeler.sort(key=lambda k: (-k[1], -k[2], k[0]))\nprint(\'\\n\'.join(k[0] for k in kuryeler))\n',
  editorial: '<p><b>Yaklaşım:</b> Python\'da çok ölçütlü sıralama için anahtar fonksiyonu bir demet döndürür; demetler soldan sağa karşılaştırılır. Azalan sıralanacak sayısal alanların önüne eksi koyarak tek bir <code>sort</code> yeterli olur: <code>key=lambda k: (-puan, -teslimat, ad)</code>.</p>\n<p><b>Karmaşıklık:</b> O(N log N).</p>\n<p><b>Alternatif:</b> Python\'un sıralaması <b>kararlı</b>dır (stable). Önce ada göre artan, sonra teslimata göre azalan, en son puana göre azalan sırala; sonuç aynı olur. Metin alanını azalan sıralamak gerekirse eksi işareti işe yaramaz; o zaman bu kararlı çok geçişli yöntem ya da <code>functools.cmp_to_key</code> kullanılır.</p>\n<p><b>Naif çözüm:</b> Kendi yazdığın kabarcık sıralaması O(N²) = 10^10 karşılaştırma ile gizli testi bitiremez. <b>Sık hata:</b> <code>reverse=True</code> verip adı da ters sıralamak.</p>',
  hints: ['key bir demet döndürebilir.', 'Azalan sayısal ölçüt için değerin negatifini kullan.']
},
{
  id: 'a-137',
  title: 'Kampanya kodundan en büyük sayı',
  track: 'Algoritmalar',
  diff: 'Orta',
  pts: 30,
  tags: ['sıralama', 'karşılaştırıcı', 'açgözlü'],
  src: 'LeetCode 179 Largest Number benzeri',
  mode: 'stdin',
  statement: '<p>Anadolu Market, yılbaşı çekilişinde katılımcılara N sayı kartı veriyor. Kartları yan yana dizerek oluşturulan sayının en büyüğünü yapan kişi büyük ödülü kazanıyor. Kartlar döndürülemez veya bölünemez; yalnızca sıraları değiştirilebilir.</p>\n<p>Elde edilebilecek en büyük sayıyı yaz (sonuç yalnız sıfırlardan oluşuyorsa tek bir <code>0</code> yaz).</p>',
  input: '<p>İlk satırda N. İkinci satırda N negatif olmayan tam sayı.</p>',
  output: '<p>En büyük sayı (metin olarak).</p>',
  constraints: '1 ≤ N ≤ 2·10^4, 0 ≤ sayı ≤ 10^9',
  samples: [
      { in: '5\n3 30 34 5 9\n', out: '9534330\n', why: '"9", "5", "34", "3", "30" sırası 9534330 verir; 30\'u 3\'ün önüne koymak 330 yerine 303 verir.' },
      { in: '3\n0 0 0\n', out: '0\n', why: 'Sonuç "000" değil, 0.' }
  ],
  hidden: [
      { in: '1\n10\n', out: '10\n' },
      { in: '2\n10 2\n', out: '210\n' },
      { in: '2\n121 12\n', out: '12121\n' },
      { in: '4\n0 0 1 0\n', out: '1000\n' },
      { in: '3\n824 8247 82\n', out: '828248247\n' },
      { in: '5\n1000000000 9 99 999 0\n', out: '99999910000000000\n' },
      { gen: 'import random\nrandom.seed(137)\nn = 20000\nprint(n)\nprint(*[random.choice([random.randint(0, 99), random.randint(0, 10**9), random.randint(0, 9999)]) for _ in range(n)])\n' }
  ],
  start: 'from functools import cmp_to_key\nn = int(input())\nkartlar = input().split()\n\ndef karsilastir(a, b):\n    # a+b ile b+a\'yı karşılaştır\n    pass\n',
  sol: 'from functools import cmp_to_key\nn = int(input())\nkartlar = input().split()\n\ndef karsilastir(a, b):\n    if a + b > b + a:\n        return -1\n    if a + b < b + a:\n        return 1\n    return 0\n\nkartlar.sort(key=cmp_to_key(karsilastir))\nsonuc = \'\'.join(kartlar).lstrip(\'0\')\nprint(sonuc or \'0\')\n',
  editorial: '<p><b>Yaklaşım:</b> İki kartın hangisinin önce gelmesi gerektiğine yalnızca onları yan yana koyarak karar verebilirsin: <code>a+b &gt; b+a</code> ise a önce. Bu karşılaştırma geçişlidir, dolayısıyla <code>functools.cmp_to_key</code> ile sıralama doğru sonucu verir. Sonda baştaki sıfırları temizle; geriye bir şey kalmazsa "0".</p>\n<p><b>Karmaşıklık:</b> O(N log N) karşılaştırma, her biri en fazla ~20 karakter.</p>\n<p><b>Naif çözüm neden yetmez:</b> Tüm permütasyonları denemek N! — 12 kartta bile yarım milyar. Sayısal büyüklüğe göre sıralamak da yanlış: 9 &gt; 34 olmalı ama sayısal olarak değil. Metin olarak ters sıralamak da yanlış: "30" &gt; "3" metin olarak, ama 3 önce gelmeli.</p>\n<p><b>Alternatif:</b> Kart uzunluğu ≤ 10 iken <code>key=lambda s: s * 10</code> ile karşılaştırıcısız ters sıralama da doğru sonuç verir (sonsuz tekrarı karşılaştırmanın kısa yolu), ama gerekçesi daha az açıktır.</p>',
  hints: ['İki kartı a+b ve b+a olarak birleştirip karşılaştır.', 'Sonuç sıfırla başlıyorsa hepsi sıfırdır.']
},
{
  id: 'a-138',
  title: 'Toplantı odası rezervasyonlarını birleştir',
  track: 'Algoritmalar',
  diff: 'Kolay',
  pts: 10,
  tags: ['aralıklar', 'sıralama'],
  src: 'LeetCode 56 Merge Intervals benzeri',
  mode: 'stdin',
  statement: '<p>Pusula İK\'nın büyük toplantı salonu için gün içinde N rezervasyon yapılmış; her biri [başlangıç, bitiş] dakika aralığı. Temizlik ekibi salonun hangi zaman bloklarında dolu olduğunu görmek istiyor. Çakışan ya da <b>uç uca değen</b> (biri 60\'ta bitip diğeri 60\'ta başlayan) aralıklar tek blok sayılır.</p>\n<p>Birleştirilmiş blokları başlangıca göre sıralı yazdır.</p>',
  input: '<p>İlk satırda N. Sonraki N satırda <code>baslangic bitis</code> (baslangic ≤ bitis).</p>',
  output: '<p>İlk satırda blok sayısı B, sonraki B satırda <code>baslangic bitis</code>.</p>',
  constraints: '1 ≤ N ≤ 10^5, 0 ≤ başlangıç ≤ bitiş ≤ 10^9',
  samples: [
      { in: '4\n1 3\n8 10\n2 6\n15 18\n', out: '3\n1 6\n8 10\n15 18\n', why: '[1,3] ve [2,6] çakışır → [1,6]. Diğerleri ayrı: 3 blok.' },
      { in: '2\n1 4\n4 5\n', out: '1\n1 5\n', why: 'Uç uca değiyorlar: [1,5].' }
  ],
  hidden: [
      { in: '1\n5 5\n', out: '1\n5 5\n' },
      { in: '3\n1 10\n2 3\n4 5\n', out: '1\n1 10\n' },
      { in: '3\n5 6\n1 2\n3 4\n', out: '3\n1 2\n3 4\n5 6\n' },
      { in: '4\n1 4\n0 0\n0 4\n6 7\n', out: '2\n0 4\n6 7\n' },
      { gen: 'import random\nrandom.seed(138)\nn = 100000\nprint(n)\nfor _ in range(n):\n    s = random.randint(0, 10**9 - 5000)\n    print(s, s + random.randint(0, 5000))\n' },
      { gen: 'import random\nrandom.seed(1380)\nn = 100000\nprint(n)\nfor _ in range(n):\n    s = random.randint(0, 10**7)\n    print(s, s + random.randint(0, 300))\n' }
  ],
  start: 'import sys\ninput = sys.stdin.readline\nn = int(input())\naraliklar = [tuple(map(int, input().split())) for _ in range(n)]\n# başlangıca göre sırala, sonra tek geçişte birleştir\n',
  sol: 'import sys\nveri = sys.stdin.read().split()\nn = int(veri[0])\naraliklar = sorted((int(veri[1 + 2 * i]), int(veri[2 + 2 * i])) for i in range(n))\nbloklar = []\nfor s, e in araliklar:\n    if bloklar and s <= bloklar[-1][1]:\n        if e > bloklar[-1][1]:\n            bloklar[-1][1] = e\n    else:\n        bloklar.append([s, e])\ncikti = [str(len(bloklar))] + [f\'{s} {e}\' for s, e in bloklar]\nprint(\'\\n\'.join(cikti))\n',
  editorial: '<p><b>Yaklaşım:</b> Aralıkları başlangıca göre sırala. Sonra soldan geç: mevcut aralığın başlangıcı son bloğun bitişinden küçük ya da eşitse (değme dahil) son bloğu <code>max(bitiş)</code> ile uzat; değilse yeni blok aç.</p>\n<p><b>Karmaşıklık:</b> Sıralama O(N log N) + tek geçiş O(N).</p>\n<p><b>Naif çözüm neden yetmez:</b> Her çifti karşılaştırıp çakışanları birleştire birleştire ilerlemek O(N²) ve üstü; 10^5 rezervasyonda 10^10 karşılaştırma. Dakika dizisi işaretlemek ise 10^9 uzunluğunda bir dizi ister.</p>\n<p><b>Sık hata:</b> Son bloğun bitişini körü körüne yeni bitişle değiştirmek: [1,10] içine düşen [2,3] bloğu [1,3]\'e küçültür. Her zaman <code>max</code> al.</p>',
  hints: ['Önce başlangıca göre sırala.', 'Yeni başlangıç ≤ son bitiş ise birleştir: son bitiş = max(son bitiş, yeni bitiş).']
},
{
  id: 'a-139',
  title: 'Mülakat günü için gereken oda sayısı',
  track: 'Algoritmalar',
  diff: 'Orta',
  pts: 30,
  tags: ['aralıklar', 'süpürme', 'heap'],
  src: 'LeetCode 253 Meeting Rooms II benzeri',
  mode: 'stdin',
  statement: '<p>Pusula İK işe alım gününde N mülakat planladı; her mülakat [s, e) yarı açık aralığında sürüyor (e anında oda boşalır, aynı anda başka mülakat başlayabilir). Her mülakat ayrı bir odada yapılmalı.</p>\n<p>Tüm mülakatların çakışmadan yapılabilmesi için gereken <b>en az oda sayısını</b> bul.</p>',
  input: '<p>İlk satırda N. Sonraki N satırda <code>s e</code> (s &lt; e).</p>',
  output: '<p>En az oda sayısı.</p>',
  constraints: '1 ≤ N ≤ 10^5, 0 ≤ s &lt; e ≤ 10^9',
  samples: [
      { in: '3\n0 30\n5 10\n15 20\n', out: '2\n', why: '0–30 mülakatı diğer ikisiyle çakışıyor, ama 5–10 ile 15–20 çakışmıyor: 2 oda.' },
      { in: '2\n7 10\n2 7\n', out: '1\n', why: 'Biri 7\'de bitiyor, diğeri 7\'de başlıyor: 1 oda yeter.' }
  ],
  hidden: [
      { in: '1\n0 1\n', out: '1\n' },
      { in: '3\n1 5\n1 5\n1 5\n', out: '3\n' },
      { in: '4\n1 2\n2 3\n3 4\n4 5\n', out: '1\n' },
      { in: '5\n1 10\n2 7\n3 19\n8 12\n10 20\n', out: '3\n' },
      { gen: 'import random\nrandom.seed(139)\nn = 100000\nprint(n)\nfor _ in range(n):\n    s = random.randint(0, 10**6)\n    print(s, s + random.randint(1, 50000))\n' },
      { gen: 'n = 100000\nprint(n)\nfor i in range(n):\n    print(i, 2 * n - i)\n' }
  ],
  start: 'import sys\ninput = sys.stdin.readline\nn = int(input())\nmulakatlar = [tuple(map(int, input().split())) for _ in range(n)]\n# başlangıçları ve bitişleri ayrı sırala ya da heap kullan\n',
  sol: 'import sys\nveri = sys.stdin.read().split()\nn = int(veri[0])\nbas = sorted(int(veri[1 + 2 * i]) for i in range(n))\nbit = sorted(int(veri[2 + 2 * i]) for i in range(n))\noda = en_cok = 0\nj = 0\nfor s in bas:\n    while bit[j] <= s:\n        j += 1\n        oda -= 1\n    oda += 1\n    if oda > en_cok:\n        en_cok = oda\nprint(en_cok)\n',
  editorial: '<p><b>Yaklaşım (süpürme):</b> Başlangıçları ve bitişleri ayrı ayrı sırala. Başlangıçları sırayla gez; her başlangıçtan önce, bu ana kadar (≤ s) bitmiş mülakatları düşür, sonra yeni mülakatı say. Anlık sayıların en büyüğü cevaptır. Yarı açık aralık yüzünden "bitiş ≤ s" koşulu önemlidir: aynı anda biten oda tekrar kullanılabilir.</p>\n<p><b>Alternatif (heap):</b> Mülakatları başlangıca göre sırala, kullanılan odaların bitiş zamanlarını min-heap\'te tut; en erken biten oda boşaldıysa onu yeniden kullan (<code>heapreplace</code>), yoksa yeni oda aç. Heap\'in son boyutu cevaptır.</p>\n<p><b>Karmaşıklık:</b> İkisi de O(N log N).</p>\n<p><b>Naif çözüm neden yetmez:</b> Her mülakat için diğer tüm mülakatlarla çakışmayı saymak O(N²); zaman ekseninde dakika dakika dizi tutmak ise 10^9 boyut ister.</p>',
  hints: ['Aynı anda en çok kaç mülakat sürüyor? Cevap bu.', 'Başlangıç ve bitişleri ayrı sırala; bitiş ≤ başlangıç olanları önce düş.']
},
{
  id: 'a-140',
  title: 'Çanta kapasitesine göre sipariş eşleştirme',
  track: 'Algoritmalar',
  diff: 'Kolay',
  pts: 10,
  tags: ['açgözlü', 'sıralama', 'iki işaretçi'],
  src: 'LeetCode 455 Assign Cookies benzeri',
  mode: 'stdin',
  statement: '<p>Lezzet Kurye\'de akşam yoğunluğunda N kurye ve M sipariş var. i. kuryenin çantası c<sub>i</sub> litre, j. siparişin hacmi v<sub>j</sub> litre. Her kurye en fazla bir sipariş alabilir ve sipariş çantaya sığmalı (v ≤ c).</p>\n<p>Aynı anda en fazla kaç sipariş yola çıkarılabilir?</p>',
  input: '<p>İlk satırda N ve M. İkinci satırda N çanta kapasitesi, üçüncü satırda M sipariş hacmi.</p>',
  output: '<p>En fazla eşleşme sayısı.</p>',
  constraints: '1 ≤ N, M ≤ 10^5, 1 ≤ c, v ≤ 10^9',
  samples: [
      { in: '3 4\n5 2 8\n6 1 3 9\n', out: '3\n', why: '2 litrelik çanta 1\'i, 5 litrelik 3\'ü, 8 litrelik 6\'yı alır: 3 sipariş.' },
      { in: '2 2\n1 1\n2 3\n', out: '0\n', why: 'Hiçbir sipariş sığmıyor: 0.' }
  ],
  hidden: [
      { in: '1 1\n5\n5\n', out: '1\n' },
      { in: '3 1\n9 9 9\n1\n', out: '1\n' },
      { in: '1 3\n10\n1 2 3\n', out: '1\n' },
      { in: '4 4\n1 2 3 4\n2 3 4 5\n', out: '3\n' },
      { gen: 'import random\nrandom.seed(140)\nn = m = 100000\nprint(n, m)\nprint(*[random.randint(1, 10**9) for _ in range(n)])\nprint(*[random.randint(1, 10**9) for _ in range(m)])\n' },
      { in: '5 3\n1 1 1 1 1\n1 1 2\n', out: '2\n' }
  ],
  start: 'n, m = map(int, input().split())\ncanta = list(map(int, input().split()))\nsiparis = list(map(int, input().split()))\n# ikisini de sırala, küçük siparişi en küçük uygun çantaya ver\n',
  sol: 'n, m = map(int, input().split())\ncanta = sorted(map(int, input().split()))\nsiparis = sorted(map(int, input().split()))\nj = 0\nfor c in canta:\n    if j < m and siparis[j] <= c:\n        j += 1\nprint(j)\n',
  editorial: '<p><b>Yaklaşım:</b> Açgözlü (greedy). Çantaları ve siparişleri küçükten büyüğe sırala. Çantaları sırayla gez; bekleyen en küçük sipariş bu çantaya sığıyorsa eşleştir. En küçük siparişi, ona yetecek en küçük çantaya vermek büyük çantaları büyük siparişler için saklar; bir değiştirme (exchange) argümanıyla bu seçimin hiçbir zaman kötüleştirmediği gösterilir.</p>\n<p><b>Karmaşıklık:</b> O(N log N + M log M).</p>\n<p><b>Naif çözüm neden yetmez:</b> Tüm atamaları denemek üsteldir; her sipariş için tüm çantaları tarayıp uygun olanı aramak da O(N·M) = 10^10.</p>\n<p><b>Sık hata:</b> En büyük çantaya önce en küçük siparişi vermek: bu, sonradan gelen büyük siparişleri açıkta bırakır.</p>',
  hints: ['İki listeyi de sırala.', 'Her çanta için bekleyen en küçük sipariş sığıyorsa eşleştir.']
},
{
  id: 'a-141',
  title: 'Elektrikli bisikletle en az şarj durağı',
  track: 'Algoritmalar',
  diff: 'Orta',
  pts: 30,
  tags: ['açgözlü', 'BFS seviyesi'],
  src: 'LeetCode 45 Jump Game II benzeri',
  mode: 'stdin',
  statement: '<p>Pedal İzmir\'in sahil hattında 0\'dan N−1\'e numaralı N istasyon var. Elektrikli bisiklet i. istasyonda şarj edilirse en fazla a<sub>i</sub> istasyon ileri gidebilir (a<sub>i</sub> = 0 ise o istasyon şarj vermez). Bisikletçi 0. istasyondan başlıyor ve N−1. istasyona ulaşmak istiyor.</p>\n<p>Gereken <b>en az şarj (atlama) sayısını</b> yaz. Ulaşmak mümkün değilse <code>-1</code> yaz. N = 1 ise cevap 0.</p>',
  input: '<p>İlk satırda N. İkinci satırda N tam sayı a<sub>i</sub>.</p>',
  output: '<p>En az atlama sayısı ya da −1.</p>',
  constraints: '1 ≤ N ≤ 2·10^5, 0 ≤ a ≤ 10^5',
  samples: [
      { in: '5\n2 3 1 1 4\n', out: '2\n', why: '0 → 1 → 4: iki atlama.' },
      { in: '5\n3 2 1 0 4\n', out: '-1\n', why: 'Hangi yoldan gidilirse gidilsin 3. istasyonda takılınır: −1.' }
  ],
  hidden: [
      { in: '1\n0\n', out: '0\n' },
      { in: '2\n0 5\n', out: '-1\n' },
      { in: '2\n1 0\n', out: '1\n' },
      { in: '6\n1 1 1 1 1 1\n', out: '5\n' },
      { in: '7\n6 0 0 0 0 0 0\n', out: '1\n' },
      { in: '5\n1 2 0 1 0\n', out: '3\n' },
      { gen: 'import random\nrandom.seed(141)\nn = 200000\nprint(n)\nprint(*[random.randint(1, 20) for _ in range(n)])\n' },
      { gen: 'n = 200000\nprint(n)\nprint(*([1] * n))\n' },
      { gen: 'import random\nrandom.seed(1410)\nn = 200000\na = [random.randint(1, 30) for _ in range(n)]\nfor i in range(150000, 150030):\n    a[i] = 0\nfor i in range(149970, 150000):\n    a[i] = min(a[i], 150000 - i)\nprint(n)\nprint(*a)\n' }
  ],
  start: 'n = int(input())\na = list(map(int, input().split()))\n# mevcut seviyenin sonunu ve ulaşılabilecek en uzak noktayı tut\n',
  sol: 'n = int(input())\na = list(map(int, input().split()))\natlama = 0\nseviye_sonu = 0\nen_uzak = 0\ncevap = 0\nif n > 1:\n    cevap = -1\n    for i in range(n - 1):\n        if i > en_uzak:\n            break\n        if i + a[i] > en_uzak:\n            en_uzak = i + a[i]\n        if i == seviye_sonu:\n            atlama += 1\n            seviye_sonu = en_uzak\n            if seviye_sonu >= n - 1:\n                cevap = atlama\n                break\nprint(cevap)\n',
  editorial: '<p><b>Yaklaşım:</b> Bunu seviyeli bir BFS gibi düşün: k atlamayla ulaşılabilen istasyonlar ardışık bir aralık oluşturur. Soldan geçerken bu aralığın sonunu (<code>seviye_sonu</code>) ve şu ana dek görülen en uzak erişimi (<code>en_uzak</code>) tut. <code>i</code> seviye sonuna gelince bir atlama daha yapmak zorundasın; yeni seviye sonu <code>en_uzak</code> olur. <code>i &gt; en_uzak</code> olursa o istasyona hiç ulaşılamıyordur: −1.</p>\n<p><b>Karmaşıklık:</b> O(N) zaman, O(1) bellek.</p>\n<p><b>Naif çözüm neden yetmez:</b> DP ile her i\'den ulaşılabilen tüm j\'leri güncellemek O(N · max a) — gizli testte 2·10^5 × 10^5\'e kadar. Özyinelemeli "tüm yolları dene" ise üsteldir.</p>\n<p><b>Sık hata:</b> Döngüyü son istasyonu da kapsayacak şekilde çalıştırıp fazladan bir atlama saymak ve ulaşılamazlık kontrolünü unutmak.</p>',
  hints: [
      'k atlamayla ulaşılabilen istasyonlar bir aralık oluşturur.',
      'i aralığın sonuna gelince atlama sayısını artır ve aralığı en_uzak\'a genişlet.'
  ]
},
{
  id: 'a-142',
  title: 'Adil performans primi dağıtımı',
  track: 'Algoritmalar',
  diff: 'Zor',
  pts: 60,
  tags: ['açgözlü', 'iki geçiş'],
  src: 'LeetCode 135 Candy benzeri',
  mode: 'stdin',
  statement: '<p>Pusula İK, üretim bandında yan yana çalışan N kişiye prim kuponu dağıtacak. Kurallar:</p>\n<ul><li>Herkes en az 1 kupon alır.</li><li>Bir çalışanın performans puanı <b>yanındaki komşusundan</b> kesinlikle yüksekse, o komşudan daha fazla kupon almalıdır.</li></ul>\n<p>Eşit puanlı komşular arasında bir kısıt yoktur. Kurallara uyan en az toplam kupon sayısını bul.</p>',
  input: '<p>İlk satırda N. İkinci satırda N performans puanı.</p>',
  output: '<p>En az toplam kupon.</p>',
  constraints: '1 ≤ N ≤ 2·10^5, 0 ≤ puan ≤ 10^9',
  samples: [
      { in: '3\n1 0 2\n', out: '5\n', why: 'Kuponlar 2, 1, 2: toplam 5.' },
      { in: '3\n1 2 2\n', out: '4\n', why: 'Kuponlar 1, 2, 1: üçüncü kişi ikinciyle eşit, fazlasını almak zorunda değil. Toplam 4.' }
  ],
  hidden: [
      { in: '1\n7\n', out: '1\n' },
      { in: '5\n1 2 3 4 5\n', out: '15\n' },
      { in: '5\n5 4 3 2 1\n', out: '15\n' },
      { in: '7\n1 3 4 5 2 2 1\n', out: '14\n' },
      { in: '6\n1 6 10 8 7 3\n', out: '13\n' },
      { in: '4\n2 2 2 2\n', out: '4\n' },
      { gen: 'import random\nrandom.seed(142)\nn = 200000\nprint(n)\nprint(*[random.randint(0, 100) for _ in range(n)])\n' },
      { gen: 'n = 200000\nprint(n)\nprint(*(list(range(100000)) + list(range(100000, 0, -1))))\n' }
  ],
  start: 'n = int(input())\np = list(map(int, input().split()))\nkupon = [1] * n\n# soldan sağa, sonra sağdan sola geç\n',
  sol: 'n = int(input())\np = list(map(int, input().split()))\nkupon = [1] * n\nfor i in range(1, n):\n    if p[i] > p[i - 1]:\n        kupon[i] = kupon[i - 1] + 1\nfor i in range(n - 2, -1, -1):\n    if p[i] > p[i + 1] and kupon[i] <= kupon[i + 1]:\n        kupon[i] = kupon[i + 1] + 1\nprint(sum(kupon))\n',
  editorial: '<p><b>Yaklaşım:</b> Kuralı iki yöne ayır. Soldan sağa geçişte yalnızca sol komşu kuralını sağla: puan soldakinden yüksekse <code>kupon[i] = kupon[i-1] + 1</code>. Sağdan sola geçişte sağ komşu kuralını sağla, ama önceki değeri bozmamak için <code>max</code> mantığıyla (yalnız gerekirse artır). İki geçişten sonra her iki kural da sağlanır ve her değer kendi gereken alt sınırına eşittir; bu yüzden toplam en küçüktür.</p>\n<p><b>Karmaşıklık:</b> O(N) zaman, O(N) bellek. (Eğim sayarak O(1) bellekli bir sürüm de vardır.)</p>\n<p><b>Naif çözüm neden yetmez:</b> "Kural ihlali kalmayana dek düzelt" döngüsü uzun azalan dizilerde O(N²) tur atar; gizli testteki 10^5 uzunluğunda inen bölümde 10^10 adıma çıkar.</p>\n<p><b>Sık hata:</b> İkinci geçişte <code>kupon[i] = kupon[i+1] + 1</code> diye koşulsuz atamak; soldan gelen daha büyük değeri ezersin. Bir de eşit puanlıları da artırmak (kural yalnız "kesinlikle yüksek" için).</p>',
  hints: ['Sol komşu ve sağ komşu kurallarını ayrı geçişlerde sağla.', 'İkinci geçişte yalnız gerekiyorsa artır (max mantığı).']
},
{
  id: 'a-143',
  title: 'Eşi olmayan biniş kartı',
  track: 'Algoritmalar',
  diff: 'Kolay',
  pts: 10,
  tags: ['bit işlemleri', 'XOR'],
  src: 'LeetCode 136 Single Number benzeri',
  mode: 'stdin',
  statement: '<p>Kanat Havayolları\'nda her yolcunun biniş kartı hem kapıda hem uçak kapısında okutuluyor; yani her kart numarası kayıtlarda <b>tam iki kez</b> görünmeli. Bir yolcu ise kapıda okutulduğu hâlde uçağa binmemiş: onun numarası yalnız <b>bir kez</b> var.</p>\n<p>Tek kez görünen kart numarasını bul. Ek bellek kullanmadan çözmeye çalış.</p>',
  input: '<p>İlk satırda N (tek sayı). İkinci satırda N kart numarası (sırasız).</p>',
  output: '<p>Tek kez görünen numara.</p>',
  constraints: '1 ≤ N ≤ 2·10^5 + 1, 0 ≤ numara ≤ 10^9',
  samples: [
      { in: '5\n4 1 2 1 2\n', out: '4\n', why: '1 ve 2 ikişer kez var; 4 tek: cevap 4.' }
  ],
  hidden: [
      { in: '1\n0\n', out: '0\n' },
      { in: '3\n7 7 1000000000\n', out: '1000000000\n' },
      { in: '7\n9 3 9 5 5 3 0\n', out: '0\n' },
      { in: '5\n0 6 0 8 8\n', out: '6\n' },
      { gen: 'import random\nrandom.seed(143)\nk = 100000\nv = random.sample(range(10**9), k + 1)\na = v[:k] * 2 + [v[k]]\nrandom.shuffle(a)\nprint(len(a))\nprint(*a)\n' },
      { in: '3\n1000000000 5 5\n', out: '1000000000\n' }
  ],
  start: 'n = int(input())\nkartlar = list(map(int, input().split()))\nsonuc = 0\n# XOR\'un x ^ x = 0 özelliğini kullan\n',
  sol: 'n = int(input())\nkartlar = list(map(int, input().split()))\nsonuc = 0\nfor k in kartlar:\n    sonuc ^= k\nprint(sonuc)\n',
  editorial: '<p><b>Yaklaşım:</b> XOR (<code>^</code>) işleminin özellikleri: <code>x ^ x = 0</code>, <code>x ^ 0 = x</code> ve değişme/birleşme özelliği. Tüm numaraları XOR\'larsan çiftler birbirini sıfırlar, geriye tek kalan numara kalır.</p>\n<p><b>Karmaşıklık:</b> O(N) zaman, O(1) ek bellek. Python\'da tek satırda: <code>functools.reduce(operator.xor, kartlar)</code>.</p>\n<p><b>Naif çözüm:</b> Her numara için <code>list.count</code> çağırmak O(N²) = 4·10^10; gizli testte biter mi bitmez mi bekletir. <code>Counter</code> veya <code>set</code> ile O(N) zaman ama O(N) bellek kullanılır; mülakatta beklenen O(1) bellek çözümü XOR\'dur.</p>\n<p><b>Uzmanlaş:</b> "Biri bir kez, diğerleri üç kez" varyantında her bit konumunun toplamını 3\'e göre mod alarak çözersin.</p>',
  hints: ['x ^ x = 0 ve x ^ 0 = x.', 'Hepsini XOR\'la.']
},
{
  id: 'a-144',
  title: 'Yetki bayraklarının toplam farkı',
  track: 'Algoritmalar',
  diff: 'Orta',
  pts: 30,
  tags: ['bit işlemleri', 'sayma'],
  src: 'LeetCode 477 Total Hamming Distance benzeri',
  mode: 'stdin',
  statement: '<p>Ilgaz Bank\'ın iç sistemlerinde her kullanıcının yetkileri 30 bitlik bir maske ile tutuluyor (her bit bir yetki). Güvenlik ekibi, yetki dağılımının ne kadar çeşitli olduğunu ölçmek için tüm kullanıcı çiftleri arasındaki <b>Hamming mesafelerinin</b> (farklı bit sayısı) toplamını istiyor.</p>\n<p>Σ<sub>i&lt;j</sub> popcount(m<sub>i</sub> XOR m<sub>j</sub>) değerini yazdır.</p>',
  input: '<p>İlk satırda N. İkinci satırda N maske (onluk tabanda).</p>',
  output: '<p>Toplam mesafe.</p>',
  constraints: '1 ≤ N ≤ 10^5, 0 ≤ maske &lt; 2^30',
  samples: [
      { in: '3\n4 14 2\n', out: '6\n', why: '4=0100, 14=1110, 2=0010. Mesafeler: (4,14)=2, (4,2)=2, (14,2)=2 → 6.' }
  ],
  hidden: [
      { in: '1\n5\n', out: '0\n' },
      { in: '2\n0 1073741823\n', out: '30\n' },
      { in: '4\n7 7 7 7\n', out: '0\n' },
      { in: '4\n1 2 4 8\n', out: '12\n' },
      { gen: 'import random\nrandom.seed(144)\nn = 100000\nprint(n)\nprint(*[random.randint(0, 2**30 - 1) for _ in range(n)])\n' },
      { in: '3\n1 1 0\n', out: '2\n' },
      { in: '5\n0 0 0 0 1073741823\n', out: '120\n' }
  ],
  start: 'n = int(input())\nm = list(map(int, input().split()))\n# her bit konumu için kaç maskede 1 olduğunu say\n',
  sol: 'n = int(input())\nm = list(map(int, input().split()))\ntoplam = 0\nfor b in range(30):\n    birler = sum((x >> b) & 1 for x in m)\n    toplam += birler * (n - birler)\nprint(toplam)\n',
  editorial: '<p><b>Yaklaşım:</b> Toplamı bit bit ayır. Belirli bir b bitinde, o biti 1 olan <code>birler</code> kişi ile 0 olan <code>n - birler</code> kişiden oluşan her çift tam 1 fark üretir; aynı değerdeki çiftler 0 üretir. Bu yüzden b bitinin katkısı <code>birler × (n − birler)</code>. 30 biti topla.</p>\n<p><b>Karmaşıklık:</b> O(30 · N), bellek O(1).</p>\n<p><b>Naif çözüm neden yetmez:</b> Tüm çiftleri XOR\'layıp bit saymak N(N−1)/2 ≈ 5·10^9 çift; CPython\'da saatler sürer.</p>\n<p><b>İpucu/Bit işlemleri:</b> <code>(x &gt;&gt; b) &amp; 1</code> x\'in b. bitini verir. Python 3.10+ <code>int.bit_count()</code> popcount\'u hızlı hesaplar. Bu "katkı tekniği" (her bileşenin cevaba katkısını ayrı say) birçok çift-toplamı sorusunda işe yarar.</p>',
  hints: ['Her bit konumunu ayrı düşün.', 'O bitte 1 olan k kişi varsa katkı k·(n−k).']
},
{
  id: 'a-145',
  title: 'Biniş sırasındaki ihlaller',
  track: 'Algoritmalar',
  diff: 'Zor',
  pts: 60,
  tags: ['sıralama', 'böl ve yönet', 'merge sort'],
  src: 'HackerRank Merge Sort: Counting Inversions benzeri',
  mode: 'stdin',
  statement: '<p>Kanat Havayolları\'nda yolcular grup numarası küçükten büyüğe doğru uçağa binmeli. Kapıda okutulan gerçek sıraya bakan operasyon ekibi, düzensizliği ölçmek için <b>ihlal sayısını</b> hesaplıyor: önce binen yolcunun grup numarası sonra binenden <b>kesinlikle büyükse</b> bu çift bir ihlaldir.</p>\n<p>i &lt; j ve a<sub>i</sub> &gt; a<sub>j</sub> olan çift sayısını yaz.</p>',
  input: '<p>İlk satırda N. İkinci satırda N grup numarası (biniş sırasıyla).</p>',
  output: '<p>İhlal sayısı.</p>',
  constraints: '1 ≤ N ≤ 10^5, 1 ≤ a ≤ 10^9',
  samples: [
      { in: '5\n2 4 1 3 5\n', out: '3\n', why: 'İhlaller: (2,1), (4,1), (4,3) → 3.' },
      { in: '4\n3 3 3 3\n', out: '0\n', why: 'Eşitler ihlal sayılmaz: 0.' }
  ],
  hidden: [
      { in: '1\n1\n', out: '0\n' },
      { in: '2\n2 1\n', out: '1\n' },
      { in: '5\n5 4 3 2 1\n', out: '10\n' },
      { in: '6\n1 1 2 2 1 1\n', out: '4\n' },
      { in: '6\n10 1 9 2 8 3\n', out: '9\n' },
      { gen: 'import random\nrandom.seed(145)\nn = 100000\nprint(n)\nprint(*[random.randint(1, 10**9) for _ in range(n)])\n' },
      { gen: 'n = 100000\nprint(n)\nprint(*range(n, 0, -1))\n' }
  ],
  start: 'n = int(input())\na = list(map(int, input().split()))\n\ndef say_ve_sirala(dizi):\n    # dizi\'yi sıralanmış hâliyle ve içindeki ihlal sayısıyla döndür\n    pass\n',
  sol: 'n = int(input())\na = list(map(int, input().split()))\n\ndef say_ve_sirala(dizi):\n    if len(dizi) <= 1:\n        return dizi, 0\n    orta = len(dizi) // 2\n    sol, x = say_ve_sirala(dizi[:orta])\n    sag, y = say_ve_sirala(dizi[orta:])\n    birlesik = []\n    i = j = 0\n    sayac = x + y\n    ls, rs = len(sol), len(sag)\n    while i < ls and j < rs:\n        if sol[i] <= sag[j]:\n            birlesik.append(sol[i]); i += 1\n        else:\n            birlesik.append(sag[j]); j += 1\n            sayac += ls - i\n    birlesik.extend(sol[i:])\n    birlesik.extend(sag[j:])\n    return birlesik, sayac\n\nprint(say_ve_sirala(a)[1])\n',
  editorial: '<p><b>Yaklaşım:</b> Merge sort\'u sayaçla zenginleştir. Diziyi ikiye böl, her yarıdaki ihlalleri özyinelemeyle say ve sırala. Birleştirirken sağ yarıdan bir eleman alındığında (sol[i] &gt; sag[j]), sol yarıda henüz alınmamış <code>ls − i</code> elemanın hepsi ondan büyüktür: hepsi ihlaldir. Eşitlikte soldakini önce almak (<code>&lt;=</code>) eşit çiftlerin sayılmamasını sağlar.</p>\n<p><b>Karmaşıklık:</b> O(N log N) zaman, O(N) bellek; özyineleme derinliği yalnız log N.</p>\n<p><b>Naif çözüm neden yetmez:</b> Çift döngü O(N²) = 5·10^9 karşılaştırma. Ters sıralı 10^5 elemanlık gizli testte cevap ~5·10^9\'dur ve saymak bile saatler sürer.</p>\n<p><b>Alternatif:</b> Değerleri sıkıştırıp Fenwick ağacı (BIT) ile "benden önce gelip benden büyük olanları" saymak da O(N log N)\'dir. <b>Sık hata:</b> Birleştirmede <code>&lt;</code> kullanıp eşit değerleri ihlal saymak.</p>',
  hints: ['Merge sort\'un birleştirme adımında say.', 'Sağdan bir eleman alındığında soldaki kalan eleman sayısı kadar ihlal ekle.']
}
); })(window);
