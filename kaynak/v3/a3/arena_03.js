/* PythonPatika — v3/a3: Dinamik programlama (a-166…a-178) */
(function (W) { 'use strict'; const A = W.PY_ARENA = W.PY_ARENA || []; A.push(
{
  id: 'a-166',
  title: 'Kırık basamaklı apron merdiveni',
  track: 'Dinamik programlama',
  diff: 'Kolay',
  pts: 10,
  tags: ['1B DP', 'sayma', 'mod'],
  src: 'LeetCode 70 Climbing Stairs / Codeforces kırık basamak varyantı',
  mode: 'stdin',
  statement: '<p>Kanat Havayolları\'nın apron merdiveninde N basamak var (yer 0. basamak, kapı N. basamak). Yolcu her adımda <b>1 ya da 2</b> basamak çıkabilir. Bakımdaki M basamak kırık; bu basamaklara basılamaz (kapı ve yer hiçbir zaman kırık değildir).</p>\n<p>Yerden kapıya kaç farklı yolla çıkılabilir? Sayı büyük olabileceği için 10^9+7\'ye göre kalanını yaz.</p>',
  input: '<p>İlk satırda N ve M. M &gt; 0 ise ikinci satırda kırık basamak numaraları (1 ≤ numara ≤ N−1).</p>',
  output: '<p>Yol sayısı mod 10^9+7.</p>',
  constraints: '1 ≤ N ≤ 10^5, 0 ≤ M ≤ N−1',
  samples: [
      { in: '4 0\n', out: '5\n', why: '1+1+1+1, 1+1+2, 1+2+1, 2+1+1, 2+2: 5 yol.' },
      { in: '5 1\n3\n', out: '2\n', why: '3. basamak kırık: 0→1→2→4→5 ve 0→2→4→5 olmak üzere 2 yol.' }
  ],
  hidden: [
      { in: '1 0\n', out: '1\n' },
      { in: '2 1\n1\n', out: '1\n' },
      { in: '3 2\n1 2\n', out: '0\n' },
      { in: '6 2\n2 4\n', out: '1\n' },
      { in: '10 0\n', out: '89\n' },
      { gen: 'print(100000, 0)\n' },
      { gen: 'import random\nrandom.seed(166)\nn = 100000\nk = sorted(random.sample(range(1, n), 20000))\nk = [x for i, x in enumerate(k) if i == 0 or x != k[i - 1] + 1]\nprint(n, len(k))\nprint(*k)\n' }
  ],
  start: 'import sys\nveri = sys.stdin.read().split()\nn, m = int(veri[0]), int(veri[1])\nkirik = set(map(int, veri[2:2 + m]))\nMOD = 10**9 + 7\nyol = [0] * (n + 1)\nyol[0] = 1\n# yol[i] = yol[i-1] + yol[i-2] (i kırık değilse)\n',
  sol: 'import sys\nveri = sys.stdin.read().split()\nn, m = int(veri[0]), int(veri[1])\nkirik = set(map(int, veri[2:2 + m]))\nMOD = 10**9 + 7\nyol = [0] * (n + 1)\nyol[0] = 1\nfor i in range(1, n + 1):\n    if i in kirik:\n        continue\n    yol[i] = (yol[i - 1] + (yol[i - 2] if i >= 2 else 0)) % MOD\nprint(yol[n])\n',
  editorial: '<p><b>Yaklaşım:</b> <code>yol[i]</code> = i. basamağa ulaşma yolu sayısı. Son adım ya 1 ya 2 basamaktır: <code>yol[i] = yol[i−1] + yol[i−2]</code>. Kırık basamak için <code>yol[i] = 0</code> (oraya basılamaz, oradan da devam edilemez). Taban: <code>yol[0] = 1</code>. Her adımda mod al.</p>\n<p><b>Karmaşıklık:</b> O(N) zaman; yalnız son iki değeri tutarak O(1) bellek.</p>\n<p><b>Naif çözüm neden yetmez:</b> Özyinelemeli "1 adım dene, 2 adım dene" ağacı üstel büyür: N=40\'ta bile ~10^8 çağrı, N=10^5\'te ayrıca özyineleme sınırı aşılır. Aynı alt problemi (i. basamaktan kaç yol) defalarca çözmek DP\'nin önlediği israftır.</p>\n<p><b>Sık hata:</b> Mod almayı sona bırakmak (Python taşmaz ama dev sayılarla toplama yavaşlar; başka dillerde taşar) ve M = 0 iken ikinci satırı okumaya çalışmak.</p>',
  hints: ['Son adım 1 ya da 2 basamaktır.', 'Kırık basamağın yol sayısı 0; her toplamda % MOD al.']
},
{
  id: 'a-167',
  title: 'Bitişik olmayan bölgelerden en çok bahşiş',
  track: 'Dinamik programlama',
  diff: 'Kolay',
  pts: 10,
  tags: ['1B DP', 'seçim'],
  src: 'LeetCode 198 House Robber benzeri',
  mode: 'stdin',
  statement: '<p>Lezzet Kurye\'de bir kurye, cadde boyunca sıralanmış N teslimat bölgesinden bazılarını seçecek; i. bölgedeki toplam beklenen bahşiş b<sub>i</sub>. Trafik kuralları yüzünden <b>yan yana iki bölge</b> aynı vardiyada seçilemiyor.</p>\n<p>Toplanabilecek en yüksek bahşişi bul (hiç bölge seçmemek de mümkündür: 0).</p>',
  input: '<p>İlk satırda N. İkinci satırda N bahşiş değeri.</p>',
  output: '<p>En yüksek toplam.</p>',
  constraints: '1 ≤ N ≤ 2·10^5, 0 ≤ b ≤ 10^4',
  samples: [
      { in: '5\n2 7 9 3 1\n', out: '12\n', why: '1., 3. ve 5. bölge: 2+9+1 = 12.' },
      { in: '4\n2 1 1 2\n', out: '4\n', why: '1. ve 4. bölge: 4.' }
  ],
  hidden: [
      { in: '1\n0\n', out: '0\n' },
      { in: '1\n9\n', out: '9\n' },
      { in: '2\n5 6\n', out: '6\n' },
      { in: '3\n10 1 10\n', out: '20\n' },
      { in: '6\n5 5 10 100 10 5\n', out: '110\n' },
      { gen: 'import random\nrandom.seed(167)\nn = 200000\nprint(n)\nprint(*[random.randint(0, 10**4) for _ in range(n)])\n' }
  ],
  start: 'n = int(input())\nb = list(map(int, input().split()))\nal, alma = 0, 0   # son bölgeyi aldım / almadım durumundaki en iyiler\n',
  sol: 'n = int(input())\nb = list(map(int, input().split()))\nonceki2, onceki1 = 0, 0\nfor x in b:\n    onceki2, onceki1 = onceki1, max(onceki1, onceki2 + x)\nprint(onceki1)\n',
  editorial: '<p><b>Yaklaşım:</b> <code>dp[i]</code> = ilk i bölgeden elde edilebilecek en iyi toplam. i. bölge için iki seçenek var: almazsın (<code>dp[i−1]</code>) ya da alırsın, o zaman i−1 alınamaz (<code>dp[i−2] + b[i]</code>). <code>dp[i] = max(dp[i−1], dp[i−2] + b[i])</code>. Yalnız son iki değer gerektiği için iki değişken yeter.</p>\n<p><b>Karmaşıklık:</b> O(N) zaman, O(1) bellek.</p>\n<p><b>Naif çözüm neden yetmez:</b> Tüm uygun alt kümeleri denemek Fibonacci kadar (~1,6^N) seçenek demek; N=50\'de bile milyarlar. Açgözlü "en büyüğü al, komşularını sil" de yanlış: [2, 3, 2] için 3 yerine 4 doğrudur.</p>\n<p><b>Sık hata:</b> Tek-çift indeksleri ayrı ayrı toplayıp büyüğünü almak (örnek 2\'de 2+1=3 ve 1+2=3 verir, doğru cevap 4).</p>',
  hints: ['Her bölge için: al ya da alma.', 'dp[i] = max(dp[i−1], dp[i−2] + b[i]).']
},
{
  id: 'a-168',
  title: 'En kârlı ardışık satış dönemi',
  track: 'Dinamik programlama',
  diff: 'Kolay',
  pts: 10,
  tags: ['Kadane', '1B DP'],
  src: 'LeetCode 53 Maximum Subarray / HackerRank The Maximum Subarray benzeri',
  mode: 'stdin',
  statement: '<p>Anadolu Market\'in yeni şubesinin günlük net kâr/zarar kaydı elinde. Yatırımcı sunumunda "en iyi ardışık dönem" gösterilecek: <b>en az bir gün</b> içeren, toplamı en büyük ardışık gün aralığı.</p>\n<p>Bu toplamı yazdır.</p>',
  input: '<p>İlk satırda N. İkinci satırda N tam sayı.</p>',
  output: '<p>En büyük ardışık toplam.</p>',
  constraints: '1 ≤ N ≤ 2·10^5, |değer| ≤ 10^4',
  samples: [
      { in: '9\n-2 1 -3 4 -1 2 1 -5 4\n', out: '6\n', why: '[4, −1, 2, 1] toplamı 6.' },
      { in: '3\n-8 -3 -6\n', out: '-3\n', why: 'Hepsi zarar: en az zararlı tek gün −3.' }
  ],
  hidden: [
      { in: '1\n-5\n', out: '-5\n' },
      { in: '1\n0\n', out: '0\n' },
      { in: '5\n1 2 3 4 5\n', out: '15\n' },
      { in: '6\n5 -10 5 -10 5 -1\n', out: '5\n' },
      { in: '4\n-1 0 -2 0\n', out: '0\n' },
      { gen: 'import random\nrandom.seed(168)\nn = 200000\nprint(n)\nprint(*[random.randint(-10**4, 10**4) for _ in range(n)])\n' },
      { gen: 'import random\nrandom.seed(1680)\nn = 200000\nprint(n)\nprint(*[random.randint(-10**4, -1) for _ in range(n)])\n' }
  ],
  start: 'n = int(input())\na = list(map(int, input().split()))\nburada_biten = en_iyi = a[0]\n# her günde: devam et ya da yeniden başla\n',
  sol: 'n = int(input())\na = list(map(int, input().split()))\nburada_biten = en_iyi = a[0]\nfor x in a[1:]:\n    burada_biten = max(x, burada_biten + x)\n    if burada_biten > en_iyi:\n        en_iyi = burada_biten\nprint(en_iyi)\n',
  editorial: '<p><b>Yaklaşım (Kadane):</b> <code>burada_biten</code> = bugün biten en iyi dönemin toplamı. Bugün için iki seçenek var: dünkü dönemi uzatmak (<code>burada_biten + x</code>) ya da bugün yeniden başlamak (<code>x</code>). Hangisi büyükse odur. Genel en iyi, bu değerlerin maksimumudur. Bu bir 1B DP\'dir: dp[i] = max(a[i], dp[i−1] + a[i]).</p>\n<p><b>Karmaşıklık:</b> O(N) zaman, O(1) bellek.</p>\n<p><b>Naif çözüm neden yetmez:</b> Tüm (i, j) aralıklarını denemek O(N²) = 2·10^10 (önek toplamıyla bile); iç toplamı her seferinde hesaplarsan O(N³).</p>\n<p><b>Sık hata:</b> <code>en_iyi = 0</code> ile başlamak: tüm değerler negatifken 0 yazarsın, oysa en az bir gün seçilmeli (gizli testte tamamı negatif bir dizi var).</p>',
  hints: ['Her gün: önceki dönemi uzat ya da burada yeniden başla.', 'Başlangıç değeri a[0] olmalı, 0 değil.']
},
{
  id: 'a-169',
  title: 'En az banknotla para üstü',
  track: 'Dinamik programlama',
  diff: 'Orta',
  pts: 30,
  tags: ['para üstü', 'sınırsız sırt çantası', '1B DP'],
  src: 'LeetCode 322 Coin Change benzeri',
  mode: 'stdin',
  statement: '<p>Anadolu Bank\'ın yeni ATM\'si, kasasında K farklı banknot/madeni para değeri bulunduruyor (her birinden sınırsız sayıda). Müşteri A TL çekmek istediğinde ATM <b>en az sayıda</b> parça vermeli.</p>\n<p>A tutarını tam olarak oluşturan en az parça sayısını yaz; mümkün değilse <code>-1</code> yaz. A = 0 için cevap 0.</p>',
  input: '<p>İlk satırda K ve A. İkinci satırda K farklı değer.</p>',
  output: '<p>En az parça sayısı ya da −1.</p>',
  constraints: '1 ≤ K ≤ 12, 1 ≤ değer ≤ 10^4, 0 ≤ A ≤ 10^5',
  samples: [
      { in: '3 11\n1 2 5\n', out: '3\n', why: '5+5+1 = 11: 3 parça.' },
      { in: '1 3\n2\n', out: '-1\n', why: 'Yalnız 2\'likle 3 oluşmaz: −1.' },
      { in: '3 6\n1 3 4\n', out: '2\n', why: 'Açgözlü 4+1+1 (3 parça) verir; doğrusu 3+3 (2 parça).' }
  ],
  hidden: [
      { in: '1 0\n7\n', out: '0\n' },
      { in: '2 7\n2 4\n', out: '-1\n' },
      { in: '1 10000\n1\n', out: '10000\n' },
      { in: '4 63\n1 5 10 21\n', out: '3\n' },
      { in: '3 100000\n9999 10000 1\n', out: '10\n' },
      { gen: 'print(10, 100000)\nprint(37, 113, 251, 509, 997, 1999, 4001, 6007, 8009, 9973)\n' },
      { gen: 'print(12, 99999)\nprint(*range(2, 25, 2))\n' }
  ],
  start: 'k, a = map(int, input().split())\ndegerler = list(map(int, input().split()))\nSONSUZ = float(\'inf\')\ndp = [0] + [SONSUZ] * a   # dp[t] = t tutarı için en az parça\n',
  sol: 'k, a = map(int, input().split())\ndegerler = list(map(int, input().split()))\nSONSUZ = a + 1\ndp = [0] + [SONSUZ] * a\nfor d in degerler:\n    for t in range(d, a + 1):\n        v = dp[t - d] + 1\n        if v < dp[t]:\n            dp[t] = v\nprint(dp[a] if dp[a] <= a else -1)\n',
  editorial: '<p><b>Yaklaşım:</b> <code>dp[t]</code> = t TL için en az parça. Son verilen parça d ise <code>dp[t] = dp[t−d] + 1</code>; tüm d\'ler üzerinden minimum. <code>dp[0] = 0</code>, ulaşılamayanlar "sonsuz". Her değerden sınırsız olduğu için t\'yi <b>artan</b> sırada gezmek doğru (aynı parça tekrar kullanılabilir): bu, sınırsız sırt çantası kalıbıdır.</p>\n<p><b>Karmaşıklık:</b> O(K · A) = 12 × 10^5 ≈ 1,2·10^6 adım; bellek O(A).</p>\n<p><b>Naif çözüm neden yetmez:</b> Açgözlü "hep en büyük parçayı ver" bu değer kümelerinde yanlış (örnek 3). Tüm kombinasyonları özyinelemeyle denemek üsteldir; not almadan (memoization) A = 10^5 için hem süre hem özyineleme derinliği patlar.</p>\n<p><b>Sık hata:</b> "Sonsuz" için <code>float(\'inf\')</code> kullanıp sonda <code>inf</code> yazdırmak ya da −1 kontrolünü unutmak; A = 0 durumunda 0 yerine −1 vermek.</p>',
  hints: ['dp[t] = min(dp[t − d] + 1) tüm d için.', 'Açgözlü yaklaşım bu değerlerde yanlış sonuç verebilir; örnek 3\'e bak.']
},
{
  id: 'a-170',
  title: 'Para üstünü verme yolları',
  track: 'Dinamik programlama',
  diff: 'Orta',
  pts: 30,
  tags: ['para üstü', 'sayma', 'kombinasyon DP'],
  src: 'LeetCode 518 Coin Change II / HackerRank The Coin Change Problem benzeri',
  mode: 'stdin',
  statement: '<p>Anadolu Market kasiyerleri için hazırlanan eğitim oyununda soru şu: elde K farklı değerde madeni para var (her birinden sınırsız). A kuruşluk para üstü <b>kaç farklı şekilde</b> verilebilir? Sıra önemli değil: 1+2 ile 2+1 aynı yoldur.</p>\n<p>Cevabı 10^9+7\'ye göre kalan olarak yaz. A = 0 için tek yol var (hiç para vermemek).</p>',
  input: '<p>İlk satırda K ve A. İkinci satırda K farklı değer.</p>',
  output: '<p>Yol sayısı mod 10^9+7.</p>',
  constraints: '1 ≤ K ≤ 12, 1 ≤ değer ≤ 10^4, 0 ≤ A ≤ 10^5',
  samples: [
      { in: '3 5\n1 2 5\n', out: '4\n', why: '5; 2+2+1; 2+1+1+1; 1+1+1+1+1: 4 yol.' },
      { in: '1 3\n2\n', out: '0\n', why: 'Oluşturulamaz: 0.' }
  ],
  hidden: [
      { in: '1 0\n5\n', out: '1\n' },
      { in: '1 10\n10\n', out: '1\n' },
      { in: '2 4\n1 2\n', out: '3\n' },
      { in: '4 10\n2 5 3 6\n', out: '5\n' },
      { in: '3 100\n1 5 10\n', out: '121\n' },
      { gen: 'print(12, 100000)\nprint(1, 2, 5, 10, 20, 25, 50, 100, 200, 500, 1000, 2000)\n' },
      { gen: 'print(5, 99991)\nprint(7, 11, 13, 17, 19)\n' }
  ],
  start: 'k, a = map(int, input().split())\ndegerler = list(map(int, input().split()))\nMOD = 10**9 + 7\nyol = [1] + [0] * a\n# dış döngü paralar, iç döngü tutarlar olmalı (neden?)\n',
  sol: 'k, a = map(int, input().split())\ndegerler = list(map(int, input().split()))\nMOD = 10**9 + 7\nyol = [1] + [0] * a\nfor d in degerler:\n    for t in range(d, a + 1):\n        yol[t] = (yol[t] + yol[t - d]) % MOD\nprint(yol[a])\n',
  editorial: '<p><b>Yaklaşım:</b> <code>yol[t]</code> = t tutarını o ana kadar işlenen paralarla oluşturma yolu sayısı. Paraları <b>dış döngüde</b> tek tek ekle; her para d için <code>yol[t] += yol[t−d]</code> (t artan). Böylece her kombinasyon, paraların sabit bir sırasıyla tam bir kez sayılır.</p>\n<p><b>Karmaşıklık:</b> O(K · A), bellek O(A).</p>\n<p><b>Naif çözüm neden yetmez:</b> Tüm kombinasyonları özyinelemeyle saymak, gizli testteki gibi 1 kuruşluk para varken astronomik sayıda yol üretir (cevap mod alınmasını gerektirecek kadar büyük). Not alma olmadan saymak imkânsız.</p>\n<p><b>Sık hata:</b> Döngüleri ters kurmak (dışta tutar, içte para): o zaman 1+2 ile 2+1 ayrı sayılır ve <b>permütasyon</b> sayısını bulursun (örnek 1\'de 4 yerine 9). Bu ayrım mülakatlarda sık sorulur.</p>',
  hints: ['Paralar dış döngüde olmalı.', 'yol[t] += yol[t − d]; her adımda mod al.']
},
{
  id: 'a-171',
  title: 'Kargo uçağına en değerli yük',
  track: 'Dinamik programlama',
  diff: 'Orta',
  pts: 30,
  tags: ['0/1 sırt çantası', '1B DP'],
  src: 'Klasik 0/1 Knapsack (AtCoder DP D) benzeri',
  mode: 'stdin',
  statement: '<p>Kanat Havayolları\'nın kargo uçağının kalan kapasitesi W kg. Bekleyen N gönderinin her birinin ağırlığı w<sub>i</sub> ve taşıma ücreti v<sub>i</sub>. Her gönderi ya tamamen alınır ya hiç alınmaz (bölünemez, en fazla bir kez).</p>\n<p>Kapasiteyi aşmadan elde edilebilecek en yüksek toplam ücreti bul.</p>',
  input: '<p>İlk satırda N ve W. Sonraki N satırda <code>w v</code>.</p>',
  output: '<p>En yüksek toplam ücret.</p>',
  constraints: '1 ≤ N ≤ 100, 1 ≤ W ≤ 10^4, 1 ≤ w ≤ 10^4, 1 ≤ v ≤ 10^9',
  samples: [
      { in: '3 8\n3 30\n4 50\n5 60\n', out: '90\n', why: '3+5 = 8 kg ile 30+60 = 90.' },
      { in: '2 3\n4 100\n5 200\n', out: '0\n', why: 'Hiçbiri sığmıyor: 0.' }
  ],
  hidden: [
      { in: '1 1\n1 7\n', out: '7\n' },
      { in: '1 5\n6 7\n', out: '0\n' },
      { in: '3 10\n5 10\n5 10\n5 10\n', out: '20\n' },
      { in: '4 7\n1 1\n3 4\n4 5\n5 7\n', out: '9\n' },
      { in: '5 15\n12 4\n2 2\n1 1\n4 10\n1 2\n', out: '15\n' },
      { gen: 'import random\nrandom.seed(171)\nn, w = 100, 10000\nprint(n, w)\nfor _ in range(n):\n    print(random.randint(1, 600), random.randint(1, 10**9))\n' },
      { gen: 'import random\nrandom.seed(1710)\nn, w = 100, 10000\nprint(n, w)\nfor _ in range(n):\n    a = random.randint(50, 400)\n    print(a, a * 1000 + random.randint(0, 999))\n' }
  ],
  start: 'import sys\nveri = sys.stdin.read().split()\nn, W = int(veri[0]), int(veri[1])\ndp = [0] * (W + 1)   # dp[c] = c kapasiteyle en iyi ücret\n# her gönderi için kapasiteyi YUKARIDAN aşağı gez\n',
  sol: 'import sys\nveri = sys.stdin.read().split()\nn, W = int(veri[0]), int(veri[1])\ndp = [0] * (W + 1)\nfor i in range(n):\n    w, v = int(veri[2 + 2 * i]), int(veri[3 + 2 * i])\n    if w > W:\n        continue\n    for c in range(W, w - 1, -1):\n        aday = dp[c - w] + v\n        if aday > dp[c]:\n            dp[c] = aday\nprint(dp[W])\n',
  editorial: '<p><b>Yaklaşım:</b> <code>dp[c]</code> = o ana kadar işlenen gönderilerle, en fazla c kg kullanarak elde edilebilecek en iyi ücret. Yeni gönderi (w, v) için: <code>dp[c] = max(dp[c], dp[c−w] + v)</code>. Kapasiteyi <b>yukarıdan aşağı</b> gezmek, aynı gönderinin bir turda iki kez kullanılmasını engeller (dp[c−w] henüz bu gönderiyle güncellenmemiştir).</p>\n<p><b>Karmaşıklık:</b> O(N · W) = 100 × 10^4 = 10^6, bellek O(W). (2B tablo dp[i][c] ile de aynı zaman, O(N·W) bellek.)</p>\n<p><b>Naif çözüm neden yetmez:</b> Tüm alt kümeler 2^100 — evrenin yaşından uzun. Açgözlü "ücret/ağırlık oranı en yüksek olanı al" 0/1 versiyonda yanlıştır (kesirli sırt çantasında doğrudur).</p>\n<p><b>Sık hata:</b> Kapasiteyi aşağıdan yukarı gezmek: bu, sınırsız sırt çantasına (her gönderiden sınırsız) dönüşür ve fazla ücret hesaplar.</p>',
  hints: ['dp[c] = max(dp[c], dp[c − w] + v).', 'Aynı gönderiyi iki kez almamak için c\'yi W\'den w\'ye doğru azalt.']
},
{
  id: 'a-172',
  title: 'En uzun artan maaş serisi',
  track: 'Dinamik programlama',
  diff: 'Orta',
  pts: 30,
  tags: ['LIS', 'ikili arama', 'DP'],
  src: 'LeetCode 300 Longest Increasing Subsequence benzeri',
  mode: 'stdin',
  statement: '<p>Pusula İK, bir çalışanın yıllar içindeki performans puanlarına bakıyor. Kariyer gelişimini ölçmek için puanlardan <b>sırayı bozmadan</b> seçilebilecek, <b>kesinlikle artan</b> en uzun alt dizinin (ardışık olması gerekmez) uzunluğunu istiyor.</p>',
  input: '<p>İlk satırda N. İkinci satırda N puan.</p>',
  output: '<p>En uzun kesin artan alt dizinin uzunluğu.</p>',
  constraints: '1 ≤ N ≤ 2·10^5, 0 ≤ puan ≤ 10^9',
  samples: [
      { in: '8\n10 9 2 5 3 7 101 18\n', out: '4\n', why: '2, 3, 7, 18 (ya da 2, 5, 7, 101): uzunluk 4.' },
      { in: '5\n7 7 7 7 7\n', out: '1\n', why: 'Eşitler artan sayılmaz: 1.' }
  ],
  hidden: [
      { in: '1\n5\n', out: '1\n' },
      { in: '5\n1 2 3 4 5\n', out: '5\n' },
      { in: '5\n5 4 3 2 1\n', out: '1\n' },
      { in: '6\n0 1 0 3 2 3\n', out: '4\n' },
      { in: '8\n3 5 6 2 5 4 19 5\n', out: '4\n' },
      { gen: 'import random\nrandom.seed(172)\nn = 200000\nprint(n)\nprint(*[random.randint(0, 10**9) for _ in range(n)])\n' },
      { gen: 'n = 200000\nprint(n)\nprint(*[i // 2 for i in range(n)])\n' }
  ],
  start: 'from bisect import bisect_left\nn = int(input())\na = list(map(int, input().split()))\nkuyruklar = []   # kuyruklar[k] = uzunluğu k+1 olan artan dizilerin en küçük son elemanı\n',
  sol: 'from bisect import bisect_left\nn = int(input())\na = list(map(int, input().split()))\nkuyruklar = []\nfor x in a:\n    i = bisect_left(kuyruklar, x)\n    if i == len(kuyruklar):\n        kuyruklar.append(x)\n    else:\n        kuyruklar[i] = x\nprint(len(kuyruklar))\n',
  editorial: '<p><b>Klasik DP:</b> <code>d[i]</code> = a[i] ile biten en uzun artan alt dizi; <code>d[i] = 1 + max(d[j])</code>, j &lt; i ve a[j] &lt; a[i]. Doğru ama O(N²): 2·10^5 için 2·10^10 adım, gizli testlerde zaman aşımı.</p>\n<p><b>O(N log N) yaklaşım (sabır sıralaması):</b> <code>kuyruklar[k]</code>, uzunluğu k+1 olan artan alt dizilerin <b>en küçük</b> son elemanı. Bu dizi her zaman artandır, bu yüzden ikili arama yapılabilir. Yeni x için <code>bisect_left(kuyruklar, x)</code> konumunu bul: sona düşüyorsa en uzun diziyi bir uzat, değilse o uzunluk için daha küçük bir son eleman bulduğun için değiştir. Cevap <code>len(kuyruklar)</code>. (Not: <code>kuyruklar</code>\'ın kendisi bir LIS değildir, yalnız uzunluğu doğrudur.)</p>\n<p><b>Karmaşıklık:</b> O(N log N), bellek O(N).</p>\n<p><b>Sık hata:</b> "Kesin artan" için <code>bisect_left</code>, "azalmayan" için <code>bisect_right</code> gerekir; karıştırmak eşit değerli testleri bozar (örnek 2 ve gizli testteki 0 0 1 1 2 2... dizisi).</p>',
  hints: ['O(N²) DP doğru ama yavaş.', 'Her uzunluk için en küçük son elemanı tut; bisect_left ile yerini bul.']
},
{
  id: 'a-173',
  title: 'Depo robotunun engelli yolları',
  track: 'Dinamik programlama',
  diff: 'Orta',
  pts: 30,
  tags: ['2B DP', 'ızgara', 'sayma'],
  src: 'LeetCode 63 Unique Paths II benzeri',
  mode: 'stdin',
  statement: '<p>Anadolu Market\'in otomatik deposunda bir robot R×C ızgaranın sol üst köşesinden sağ alt köşesine gidecek. Robot yalnızca <b>sağa</b> ya da <b>aşağı</b> hareket edebiliyor. <code>#</code> ile işaretli hücrelerde palet var, oraya girilemez; <code>.</code> boş hücredir.</p>\n<p>Kaç farklı yol olduğunu 10^9+7\'ye göre kalan olarak yaz. Başlangıç ya da bitiş doluysa cevap 0.</p>',
  input: '<p>İlk satırda R ve C. Sonraki R satırda C karakterlik ızgara satırları.</p>',
  output: '<p>Yol sayısı mod 10^9+7.</p>',
  constraints: '1 ≤ R, C ≤ 500',
  samples: [
      { in: '3 3\n...\n.#.\n...\n', out: '2\n', why: 'Ortadaki paletin üstünden ya da altından: 2 yol.' },
      { in: '2 2\n.#\n#.\n', out: '0\n', why: 'Hiç yol yok: 0.' }
  ],
  hidden: [
      { in: '1 1\n.\n', out: '1\n' },
      { in: '1 1\n#\n', out: '0\n' },
      { in: '1 5\n.....\n', out: '1\n' },
      { in: '3 1\n.\n#\n.\n', out: '0\n' },
      { in: '3 4\n....\n...#\n#...\n', out: '5\n' },
      { in: '2 2\n..\n.#\n', out: '0\n' },
      { gen: 'print(500, 500)\nfor _ in range(500):\n    print(\'.\' * 500)\n' },
      { gen: 'import random\nrandom.seed(173)\nr = c = 500\nprint(r, c)\nfor i in range(r):\n    print(\'\'.join(\'#\' if random.random() < 0.08 and (i, j) not in ((0, 0), (r - 1, c - 1)) else \'.\' for j in range(c)))\n' }
  ],
  start: 'import sys\nsatirlar = sys.stdin.read().split()\nr, c = int(satirlar[0]), int(satirlar[1])\nizgara = satirlar[2:2 + r]\nMOD = 10**9 + 7\ndp = [0] * c   # tek satırlık DP yeter\n',
  sol: 'import sys\nsatirlar = sys.stdin.read().split()\nr, c = int(satirlar[0]), int(satirlar[1])\nizgara = satirlar[2:2 + r]\nMOD = 10**9 + 7\ndp = [0] * c\ndp[0] = 1\nfor i in range(r):\n    satir = izgara[i]\n    for j in range(c):\n        if satir[j] == \'#\':\n            dp[j] = 0\n        elif j > 0:\n            dp[j] = (dp[j] + dp[j - 1]) % MOD\nprint(dp[c - 1])\n',
  editorial: '<p><b>Yaklaşım:</b> <code>dp[i][j]</code> = (i, j) hücresine yol sayısı = üstten gelen + soldan gelen: <code>dp[i−1][j] + dp[i][j−1]</code>. Dolu hücrede 0. Satır satır işlerken yalnız bir önceki satır gerektiği için tek boyutlu dizi yeter: <code>dp[j]</code> güncellenmeden önce "üst"ü, <code>dp[j−1]</code> ise zaten güncellenmiş "sol"u tutar.</p>\n<p><b>Karmaşıklık:</b> O(R · C) = 2,5·10^5 adım, bellek O(C).</p>\n<p><b>Naif çözüm neden yetmez:</b> Tüm yolları özyinelemeyle saymak, engelsiz 500×500 ızgarada C(998, 499) ≈ 10^299 yol demek; tek tek gezmek imkânsız. Ayrıca derinlik 1000\'i aşar.</p>\n<p><b>Sık hata:</b> Başlangıç hücresi doluyken <code>dp[0] = 1</code> bırakmak (döngüde ilk hücreyi de kontrol et) ve ilk sütundaki bir engelden sonra alttaki hücrelerin de 0 olması gerektiğini unutmak (tek boyutlu dizide <code>dp[0] = 0</code> kalıcı olur, bu yüzden doğru çalışır).</p>',
  hints: ['Bir hücreye yalnız üstten ya da soldan gelinir.', 'Dolu hücrede yol sayısı 0; tek boyutlu dizi yeterli.']
},
{
  id: 'a-174',
  title: 'İki tedarik listesinin en uzun ortak sırası',
  track: 'Dinamik programlama',
  diff: 'Orta',
  pts: 30,
  tags: ['LCS', '2B DP'],
  src: 'LeetCode 1143 Longest Common Subsequence / HackerRank Common Child benzeri',
  mode: 'stdin',
  statement: '<p>Anadolu Market\'in iki bölge deposu, gün içinde gelen tedarikçi kamyonlarının sırasını harflerle kodluyor (her harf bir tedarikçi). Lojistik ekibi iki sıralamanın ne kadar benzediğini ölçmek için <b>en uzun ortak alt dizinin</b> (her iki metinde de aynı sırayla geçen, ardışık olması gerekmeyen karakterler) uzunluğunu istiyor.</p>',
  input: '<p>İlk satırda metin A, ikinci satırda metin B (büyük İngilizce harfler).</p>',
  output: '<p>LCS uzunluğu.</p>',
  constraints: '1 ≤ |A|, |B| ≤ 1500',
  samples: [
      { in: 'ABCBDAB\nBDCABA\n', out: '4\n', why: 'Örneğin "BCBA" her ikisinde de sırayla geçiyor: 4.' },
      { in: 'ABC\nDEF\n', out: '0\n', why: 'Ortak karakter yok: 0.' }
  ],
  hidden: [
      { in: 'A\nA\n', out: '1\n' },
      { in: 'A\nB\n', out: '0\n' },
      { in: 'AAAA\nAA\n', out: '2\n' },
      { in: 'HARRY\nSALLY\n', out: '2\n' },
      { in: 'SHINCHAN\nNOHARAAA\n', out: '3\n' },
      { in: 'ABCDEF\nFBDAMN\n', out: '2\n' },
      { gen: 'import random\nrandom.seed(174)\nprint(\'\'.join(random.choice(\'ABCDEFGHIJKLMNOPQRSTUVWXYZ\') for _ in range(1500)))\nprint(\'\'.join(random.choice(\'ABCDEFGHIJKLMNOPQRSTUVWXYZ\') for _ in range(1500)))\n' },
      { gen: 'import random\nrandom.seed(1740)\nprint(\'\'.join(random.choice(\'AB\') for _ in range(1500)))\nprint(\'\'.join(random.choice(\'AB\') for _ in range(1400)))\n' }
  ],
  start: 'a = input().strip()\nb = input().strip()\nonceki = [0] * (len(b) + 1)   # bir önceki satır\n',
  sol: 'a = input().strip()\nb = input().strip()\nm = len(b)\nonceki = [0] * (m + 1)\nfor ca in a:\n    simdiki = [0] * (m + 1)\n    for j in range(m):\n        if ca == b[j]:\n            simdiki[j + 1] = onceki[j] + 1\n        else:\n            x, y = onceki[j + 1], simdiki[j]\n            simdiki[j + 1] = x if x > y else y\n    onceki = simdiki\nprint(onceki[m])\n',
  editorial: '<p><b>Yaklaşım:</b> <code>dp[i][j]</code> = A\'nın ilk i ve B\'nin ilk j karakterinin LCS uzunluğu. Son karakterler eşitse <code>dp[i−1][j−1] + 1</code>; değilse birini atla: <code>max(dp[i−1][j], dp[i][j−1])</code>. Her satır yalnız bir öncekine baktığı için iki satır (O(|B|) bellek) yeter.</p>\n<p><b>Karmaşıklık:</b> O(|A| · |B|) = 2,25·10^6 hücre. CPython\'da iç döngüyü sade tutmak (yerel değişkenler, <code>max()</code> yerine karşılaştırma) belirgin hız kazandırır.</p>\n<p><b>Naif çözüm neden yetmez:</b> A\'nın tüm alt dizilerini (2^|A|) üretip B\'de aramak üsteldir; not almayan özyineleme de aynı alt problemleri katlanarak tekrarlar. 1500 karakterde ikisi de imkânsız.</p>\n<p><b>Sık hata:</b> Alt dizi (ardışık değil) ile alt metni (ardışık) karıştırmak: en uzun ortak <b>alt metin</b> sorusunda eşitsizlik durumunda 0 yazılır, max alınmaz. <b>Uzmanlaş:</b> Tabloyu geriye izleyerek LCS\'nin kendisini de üretebilirsin (o zaman tam tabloyu saklaman gerekir).</p>',
  hints: ['Son karakterler eşitse 1 + dp[i−1][j−1], değilse max(üst, sol).', 'Yalnız önceki satırı tutarak belleği azalt.']
},
{
  id: 'a-175',
  title: 'Arama kutusunda yazım düzeltme maliyeti',
  track: 'Dinamik programlama',
  diff: 'Zor',
  pts: 60,
  tags: ['düzenleme mesafesi', '2B DP', 'Levenshtein'],
  src: 'LeetCode 72 Edit Distance benzeri',
  mode: 'stdin',
  statement: '<p>Anadolu Market\'in arama motoru, kullanıcının yazdığı kelimeyi katalogdaki ürün adına dönüştürmenin maliyetini Levenshtein mesafesiyle ölçüyor: tek bir karakter <b>ekleme</b>, <b>silme</b> ya da <b>değiştirme</b> 1 birim. En düşük maliyetli ürün "Bunu mu demek istediniz?" önerisi oluyor.</p>\n<p>Birinci kelimeyi ikinciye dönüştürmenin en az maliyetini yaz.</p>',
  input: '<p>İlk satırda kaynak, ikinci satırda hedef kelime (küçük İngilizce harfler).</p>',
  output: '<p>En az işlem sayısı.</p>',
  constraints: '1 ≤ uzunluklar ≤ 1500',
  samples: [
      { in: 'horse\nros\n', out: '3\n', why: 'horse → rorse (h→r) → rose (r sil) → ros (e sil): 3.' },
      { in: 'intention\nexecution\n', out: '5\n', why: '5 işlem gerekir.' }
  ],
  hidden: [
      { in: 'a\na\n', out: '0\n' },
      { in: 'a\nb\n', out: '1\n' },
      { in: 'abc\nabcdef\n', out: '3\n' },
      { in: 'kitten\nsitting\n', out: '3\n' },
      { in: 'sunday\nsaturday\n', out: '3\n' },
      { in: 'zzzz\na\n', out: '4\n' },
      { gen: 'import random\nrandom.seed(175)\nprint(\'\'.join(random.choice(\'abcdefghij\') for _ in range(1500)))\nprint(\'\'.join(random.choice(\'abcdefghij\') for _ in range(1500)))\n' },
      { gen: 'import random\nrandom.seed(1750)\ns = [random.choice(\'abcde\') for _ in range(1500)]\nt = s[:]\nfor _ in range(200):\n    t[random.randrange(len(t))] = random.choice(\'vwxyz\')\nprint(\'\'.join(s))\nprint(\'\'.join(t[:1300]))\n' }
  ],
  start: 'a = input().strip()\nb = input().strip()\nonceki = list(range(len(b) + 1))   # boş kaynaktan b\'nin önekine: j ekleme\n',
  sol: 'a = input().strip()\nb = input().strip()\nm = len(b)\nonceki = list(range(m + 1))\nfor i, ca in enumerate(a, 1):\n    simdiki = [i] + [0] * m\n    for j in range(m):\n        if ca == b[j]:\n            simdiki[j + 1] = onceki[j]\n        else:\n            x = onceki[j]\n            if onceki[j + 1] < x:\n                x = onceki[j + 1]\n            if simdiki[j] < x:\n                x = simdiki[j]\n            simdiki[j + 1] = x + 1\n    onceki = simdiki\nprint(onceki[m])\n',
  editorial: '<p><b>Yaklaşım:</b> <code>dp[i][j]</code> = kaynağın ilk i karakterini hedefin ilk j karakterine çevirme maliyeti. Tabanlar: <code>dp[0][j] = j</code> (j ekleme), <code>dp[i][0] = i</code> (i silme). Son karakterler eşitse maliyet eklemeden <code>dp[i−1][j−1]</code>. Değilse 1 + üç seçeneğin en küçüğü: değiştir (<code>dp[i−1][j−1]</code>), sil (<code>dp[i−1][j]</code>), ekle (<code>dp[i][j−1]</code>). İki satırla O(m) bellek yeter.</p>\n<p><b>Karmaşıklık:</b> O(n · m) = 2,25·10^6 hücre. CPython\'da iç döngüde <code>min()</code> fonksiyon çağrısı yerine karşılaştırma yazmak ~2 kat hız kazandırır.</p>\n<p><b>Naif çözüm neden yetmez:</b> Not almayan özyineleme her eşitsizlikte 3 dala ayrılır: O(3^(n+m)). 1500 karakterde imkânsız; <code>lru_cache</code> ile not alsan bile özyineleme derinliği (n+m ≈ 3000) Python sınırını aşar ve 2,25·10^6 önbellek girdisi çok bellek yer.</p>\n<p><b>Sık hata:</b> Taban satır/sütunu 0 ile başlatmak (boş metne dönüşümün maliyeti 0 değildir) ve <code>simdiki[0] = i</code> atamasını unutmak.</p>',
  hints: [
      'dp[i][j]: ilk i karakteri ilk j karaktere çevirme maliyeti.',
      'Eşitse çapraz değer; değilse 1 + min(çapraz, üst, sol).',
      'Taban: dp[0][j] = j, dp[i][0] = i.'
  ]
},
{
  id: 'a-176',
  title: 'Kampanya kodunun gizli geçiş sayısı',
  track: 'Dinamik programlama',
  diff: 'Zor',
  pts: 60,
  tags: ['alt dizi sayma', '2B DP', 'mod'],
  src: 'LeetCode 115 Distinct Subsequences benzeri',
  mode: 'stdin',
  statement: '<p>Anadolu Market, uzun bir reklam metninin içine bir kampanya kodu gizliyor: kod, metinden bazı karakterler silinerek (kalanların sırası korunarak) elde edilebiliyorsa "geçiyor" sayılır. Pazarlama ekibi kodun metinde <b>kaç farklı şekilde</b> geçtiğini, yani kodu oluşturan farklı indeks kümelerinin sayısını istiyor.</p>\n<p>Cevabı 10^9+7\'ye göre kalan olarak yaz.</p>',
  input: '<p>İlk satırda metin s, ikinci satırda kod t (küçük İngilizce harfler).</p>',
  output: '<p>Geçiş sayısı mod 10^9+7.</p>',
  constraints: '1 ≤ |s| ≤ 5·10^4, 1 ≤ |t| ≤ 100',
  samples: [
      { in: 'rabbbit\nrabbit\n', out: '3\n', why: 'Üç b\'den hangisinin atlanacağı seçilebilir: 3 yol.' },
      { in: 'babgbag\nbag\n', out: '5\n', why: '5 farklı indeks kümesi "bag" oluşturur.' }
  ],
  hidden: [
      { in: 'a\na\n', out: '1\n' },
      { in: 'a\nb\n', out: '0\n' },
      { in: 'aaa\naaaa\n', out: '0\n' },
      { in: 'aaaa\naa\n', out: '6\n' },
      { in: 'abcabc\nabc\n', out: '4\n' },
      { in: 'xyz\nxyz\n', out: '1\n' },
      { gen: 'import random\nrandom.seed(176)\nprint(\'\'.join(random.choice(\'ab\') for _ in range(50000)))\nprint(\'\'.join(random.choice(\'ab\') for _ in range(100)))\n' },
      { gen: 'import random\nrandom.seed(1760)\nprint(\'\'.join(random.choice(\'abcdefghijklmnopqrstuvwxyz\') for _ in range(50000)))\nprint(\'\'.join(random.choice(\'abcdefghijklmnopqrstuvwxyz\') for _ in range(100)))\n' }
  ],
  start: 's = input().strip()\nt = input().strip()\nMOD = 10**9 + 7\ndp = [1] + [0] * len(t)   # dp[j] = t\'nin ilk j karakterinin geçiş sayısı\n',
  sol: 'from collections import defaultdict\ns = input().strip()\nt = input().strip()\nMOD = 10**9 + 7\nm = len(t)\ndp = [1] + [0] * m\nkonumlar = defaultdict(list)\nfor j in range(m - 1, -1, -1):\n    konumlar[t[j]].append(j)\nfor c in s:\n    for j in konumlar.get(c, ()):\n        dp[j + 1] = (dp[j + 1] + dp[j]) % MOD\nprint(dp[m])\n',
  editorial: '<p><b>Yaklaşım:</b> <code>dp[i][j]</code> = s\'nin ilk i karakterinde t\'nin ilk j karakterinin kaç kez geçtiği. s[i] karakterini kullanmazsan <code>dp[i−1][j]</code>; s[i] == t[j] ise onu t\'nin j. karakteri olarak kullanmak <code>dp[i−1][j−1]</code> ekler. Taban: boş kod her önekte 1 kez geçer (<code>dp[·][0] = 1</code>).</p>\n<p><b>Bellek ve hız hilesi:</b> Tek boyutlu <code>dp[j]</code> yeter; ama j\'yi <b>azalan</b> sırada güncellemelisin ki aynı s karakteri iki kez kullanılmasın (0/1 sırt çantasındaki gibi). Ayrıca her s karakteri için yalnız t\'de o karakterin geçtiği konumları gezersen (önceden hazırlanmış, azalan sıralı liste) iş yükü |s| · |t| yerine çok daha az olur.</p>\n<p><b>Karmaşıklık:</b> En kötü O(|s| · |t|) = 5·10^6; tipik olarak çok daha az.</p>\n<p><b>Naif çözüm neden yetmez:</b> s\'den |t| uzunluğundaki tüm indeks kombinasyonlarını denemek C(|s|, |t|) — astronomik. Not almayan özyineleme de üstel.</p>\n<p><b>Sık hata:</b> j\'yi artan sırada güncellemek ("aaa" içinde "aa" için 3 yerine fazla sayar) ve mod almayı unutmak.</p>',
  hints: [
      'dp[j]: kodun ilk j karakteri kaç farklı şekilde oluştu?',
      's\'nin her karakteri için, t\'de eşleştiği konumları SONDAN başa güncelle.'
  ]
},
{
  id: 'a-177',
  title: 'Joker karakterli dosya filtresi',
  track: 'Dinamik programlama',
  diff: 'Zor',
  pts: 60,
  tags: ['desen eşleme', '2B DP'],
  src: 'LeetCode 44 Wildcard Matching benzeri',
  mode: 'stdin',
  statement: '<p>Kanat Havayolları\'nın raporlama sistemi, dosya adlarını joker karakterli desenlerle filtreliyor:</p>\n<ul><li><code>?</code> tam olarak bir karakterle eşleşir,</li><li><code>*</code> boş dahil herhangi bir karakter dizisiyle eşleşir,</li><li>diğer karakterler yalnız kendileriyle eşleşir.</li></ul>\n<p>Desen dosya adının <b>tamamıyla</b> eşleşiyorsa <code>EVET</code>, değilse <code>HAYIR</code> yaz.</p>',
  input: '<p>İlk satırda dosya adı s (küçük harf, rakam, nokta, alt çizgi), ikinci satırda desen p (aynı karakterler ve <code>?</code>, <code>*</code>).</p>',
  output: '<p><code>EVET</code> ya da <code>HAYIR</code>.</p>',
  constraints: '1 ≤ |s| ≤ 1500, 1 ≤ |p| ≤ 1500',
  samples: [
      { in: 'rapor_2024.csv\nrapor_*.csv\n', out: 'EVET\n', why: '* "2024" ile eşleşir: EVET.' },
      { in: 'ucus.log\n?cus.tx?\n', out: 'HAYIR\n', why: 'Uzantı "log" ile "tx?" eşleşmez: HAYIR.' },
      { in: 'abc\n***a?c**\n', out: 'EVET\n', why: 'Yıldızlar boş eşleşebilir: EVET.' }
  ],
  hidden: [
      { in: 'a\n*\n', out: 'EVET\n' },
      { in: 'a\n?\n', out: 'EVET\n' },
      { in: 'a\nb\n', out: 'HAYIR\n' },
      { in: 'ab\n?\n', out: 'HAYIR\n' },
      { in: 'aa\na\n', out: 'HAYIR\n' },
      { in: 'adceb\n*a*b\n', out: 'EVET\n' },
      { in: 'acdcb\na*c?b\n', out: 'HAYIR\n' },
      { in: 'mississippi\nm??*ss*?i*pi\n', out: 'HAYIR\n' },
      { gen: 'print(\'a\' * 1500)\nprint(\'*a\' * 749 + \'b\')\n' },
      { gen: 'print(\'a\' * 1500)\nprint(\'a*\' * 750)\n' },
      { gen: 'import random\nrandom.seed(177)\ns = \'\'.join(random.choice(\'ab\') for _ in range(1500))\np = list(s)\nfor i in range(0, 1500, 7):\n    p[i] = \'?\'\nfor i in range(3, 1500, 37):\n    p[i] = \'*\'\nprint(s)\nprint(\'\'.join(p))\n' }
  ],
  start: 's = input().strip()\np = input().strip()\n# dp[j] = desenin ilk j karakteri, s\'nin şu ana kadarki önekiyle eşleşiyor mu?\n',
  sol: 's = input().strip()\np = input().strip()\nm = len(p)\nonceki = [False] * (m + 1)\nonceki[0] = True\nfor j in range(m):\n    onceki[j + 1] = onceki[j] and p[j] == \'*\'\nfor c in s:\n    simdiki = [False] * (m + 1)\n    for j in range(m):\n        pj = p[j]\n        if pj == \'*\':\n            simdiki[j + 1] = simdiki[j] or onceki[j + 1]\n        elif pj == \'?\' or pj == c:\n            simdiki[j + 1] = onceki[j]\n    onceki = simdiki\nprint(\'EVET\' if onceki[m] else \'HAYIR\')\n',
  editorial: '<p><b>Yaklaşım:</b> <code>dp[i][j]</code> = s\'nin ilk i karakteri ile desenin ilk j karakteri eşleşiyor mu. Desen karakteri <code>?</code> ya da aynı harfse <code>dp[i−1][j−1]</code>. <code>*</code> ise iki seçenek: boş eşleşir (<code>dp[i][j−1]</code>) ya da bir karakter daha yutar (<code>dp[i−1][j]</code>). Taban: <code>dp[0][0] = True</code>; <code>dp[0][j]</code> yalnız desenin ilk j karakteri hep <code>*</code> ise True.</p>\n<p><b>Karmaşıklık:</b> O(|s| · |p|) ≈ 2,25·10^6, iki satırla O(|p|) bellek.</p>\n<p><b>Naif çözüm neden yetmez:</b> Her <code>*</code> için "kaç karakter yutsun?" sorusunu geri izlemeli (backtracking) denemek, gizli testteki gibi çok yıldızlı ve sonunda başarısız olan desenlerde üstel patlar. Desenin regex\'e çevrilmesi de aynı nedenle "felaket geri izleme"ye (catastrophic backtracking) düşebilir.</p>\n<p><b>Alternatif:</b> Son görülen <code>*</code> konumunu hatırlayan açgözlü iki işaretçi yöntemi O(|s| · |p|) en kötü, pratikte O(|s| + |p|) çalışır. <b>Sık hata:</b> Taban satırda baştaki yıldızları hesaba katmamak.</p>',
  hints: [
      '* için iki seçenek: boş eşleş ya da bir karakter daha yut.',
      'Taban satır: desenin başı yalnız yıldızlardan oluşuyorsa boş metinle eşleşir.'
  ]
},
{
  id: 'a-178',
  title: 'SMS doğrulama kodunu çözme yolları',
  track: 'Dinamik programlama',
  diff: 'Orta',
  pts: 30,
  tags: ['1B DP', 'sayma', 'mod'],
  src: 'LeetCode 91 Decode Ways benzeri',
  mode: 'stdin',
  statement: '<p>Anadolu Bank\'ın eski bir SMS sistemi harfleri sayıya çevirerek gönderiyor: A → 1, B → 2, ..., Z → 26. Ayraç olmadığı için "12" hem "AB" hem "L" olabilir. Güvenlik ekibi, gelen rakam dizisinin <b>kaç farklı harf dizisine</b> çözülebileceğini merak ediyor.</p>\n<p>Çözüm sayısını 10^9+7\'ye göre kalan olarak yaz. "0" tek başına bir harf değildir; "05" gibi başında sıfır olan iki basamaklı kod da geçersizdir. Hiç çözüm yoksa 0 yaz.</p>',
  input: '<p>Tek satırda rakam dizisi.</p>',
  output: '<p>Çözüm sayısı mod 10^9+7.</p>',
  constraints: '1 ≤ uzunluk ≤ 10^5',
  samples: [
      { in: '226\n', out: '3\n', why: '"BZ" (2 26), "VF" (22 6), "BBF" (2 2 6): 3.' },
      { in: '06\n', out: '0\n', why: 'Baştaki 0 hiçbir harfe karşılık gelmez: 0.' }
  ],
  hidden: [
      { in: '1\n', out: '1\n' },
      { in: '0\n', out: '0\n' },
      { in: '10\n', out: '1\n' },
      { in: '27\n', out: '1\n' },
      { in: '100\n', out: '0\n' },
      { in: '1201234\n', out: '3\n' },
      { in: '2611055971756562\n', out: '4\n' },
      { in: '301\n', out: '0\n' },
      { gen: 'print(\'1\' * 100000)\n' },
      { gen: 'import random\nrandom.seed(178)\nparca = []\nuzunluk = 0\nwhile uzunluk < 99998:\n    t = random.choice([\'1\', \'2\', \'1\', \'2\', \'3\', \'7\', \'9\', \'10\', \'20\', \'26\', \'27\'])\n    parca.append(t)\n    uzunluk += len(t)\nprint(\'\'.join(parca))\n' }
  ],
  start: 's = input().strip()\nMOD = 10**9 + 7\n# onceki2 = dp[i-2], onceki1 = dp[i-1]\n',
  sol: 's = input().strip()\nMOD = 10**9 + 7\nonceki2, onceki1 = 1, 1\nfor i, c in enumerate(s):\n    simdi = 0\n    if c != \'0\':\n        simdi = onceki1\n    if i > 0 and (s[i - 1] == \'1\' or (s[i - 1] == \'2\' and c <= \'6\')):\n        simdi += onceki2\n    onceki2, onceki1 = onceki1, simdi % MOD\nprint(onceki1)\n',
  editorial: '<p><b>Yaklaşım:</b> <code>dp[i]</code> = ilk i rakamın çözüm sayısı. Son harf ya tek rakamdır (rakam 0 değilse <code>dp[i−1]</code> ekler) ya da iki rakamdır (10–26 arasındaysa <code>dp[i−2]</code> ekler). <code>dp[0] = 1</code>. Yalnız son iki değer gerekir.</p>\n<p><b>Karmaşıklık:</b> O(n) zaman, O(1) bellek.</p>\n<p><b>Naif çözüm neden yetmez:</b> Not almayan özyineleme her adımda ikiye dallanır: "111...1" (10^5 tane) için Fibonacci(10^5) çağrı; ayrıca özyineleme derinliği aşılır. Cevap bile ~20.000 basamaklı bir sayı olurdu; bu yüzden mod istenir.</p>\n<p><b>Sık hata:</b> Sıfırları yanlış ele almak: "10" ve "20" yalnız iki basamaklı olarak çözülebilir; "30", "00" çözülemez. Bir de "06"yı geçerli iki basamaklı kod saymak (sayıya çevirince 6 olur, ama ön ek sıfır yasak).</p>',
  hints: ['Son harf ya bir ya iki rakamdan oluşur.', '0 tek başına geçersiz; iki basamak 10..26 arasında olmalı.']
}
); })(window);
