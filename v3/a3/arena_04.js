/* PythonPatika — v3/a3: Graf (a-179…a-190) */
(function (W) { 'use strict'; const A = W.PY_ARENA = W.PY_ARENA || []; A.push(
{
  id: 'a-179',
  title: 'Depo planındaki dolu raf blokları',
  track: 'Graf',
  diff: 'Kolay',
  pts: 10,
  tags: ['ızgara', 'BFS', 'DFS', 'bileşen'],
  src: 'LeetCode 200 Number of Islands benzeri',
  mode: 'stdin',
  statement: '<p>Anadolu Market\'in depo kat planı R×C ızgara olarak tutuluyor: <code>1</code> dolu raf, <code>0</code> boş koridor. Yatay ya da dikey komşu dolu hücreler aynı <b>raf bloğuna</b> aittir (çapraz komşuluk sayılmaz).</p>\n<p>Depoda kaç ayrı raf bloğu olduğunu bul.</p>',
  input: '<p>İlk satırda R ve C. Sonraki R satırda C karakterlik <code>0/1</code> dizileri.</p>',
  output: '<p>Blok sayısı.</p>',
  constraints: '1 ≤ R, C ≤ 500',
  samples: [
      { in: '4 5\n11000\n11000\n00100\n00011\n', out: '3\n', why: 'Sol üstte 4 hücrelik blok, ortada tek hücre, sağ altta 2 hücre: 3 blok.' },
      { in: '3 3\n101\n010\n101\n', out: '5\n', why: 'Çaprazlar bağlı sayılmaz: 5 ayrı blok.' }
  ],
  hidden: [
      { in: '1 1\n0\n', out: '0\n' },
      { in: '1 1\n1\n', out: '1\n' },
      { in: '2 3\n111\n111\n', out: '1\n' },
      { in: '3 4\n1001\n0000\n1001\n', out: '4\n' },
      { in: '5 5\n11111\n10001\n10101\n10001\n11111\n', out: '2\n' },
      { gen: 'import random\nrandom.seed(179)\nprint(500, 500)\nfor _ in range(500):\n    print(\'\'.join(random.choice(\'0011\') for _ in range(500)))\n' },
      { gen: 'print(500, 500)\nfor i in range(500):\n    if i % 2 == 0:\n        print(\'1\' * 500)\n    elif i % 4 == 1:\n        print(\'0\' * 499 + \'1\')\n    else:\n        print(\'1\' + \'0\' * 499)\n' }
  ],
  start: 'import sys\nfrom collections import deque\nsatirlar = sys.stdin.read().split()\nr, c = int(satirlar[0]), int(satirlar[1])\ng = [list(s) for s in satirlar[2:2 + r]]\nblok = 0\n# her ziyaret edilmemiş 1 için BFS başlat ve bloğu işaretle\n',
  sol: 'import sys\nfrom collections import deque\nsatirlar = sys.stdin.read().split()\nr, c = int(satirlar[0]), int(satirlar[1])\ng = [list(s) for s in satirlar[2:2 + r]]\nblok = 0\nfor i in range(r):\n    for j in range(c):\n        if g[i][j] == \'1\':\n            blok += 1\n            g[i][j] = \'0\'\n            q = deque([(i, j)])\n            while q:\n                x, y = q.popleft()\n                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):\n                    if 0 <= nx < r and 0 <= ny < c and g[nx][ny] == \'1\':\n                        g[nx][ny] = \'0\'\n                        q.append((nx, ny))\nprint(blok)\n',
  editorial: '<p><b>Yaklaşım:</b> Izgarayı bir graf gibi düşün: her dolu hücre bir düğüm, dört yönlü komşular kenar. Soldan sağa, yukarıdan aşağı gez; henüz ziyaret edilmemiş bir <code>1</code> bulduğunda yeni bir blok başlat ve BFS (ya da yığınla DFS) ile o bloğa ait tüm hücreleri işaretle (burada <code>0</code> yaparak). Başlatılan BFS sayısı cevaptır.</p>\n<p><b>Karmaşıklık:</b> Her hücre en fazla bir kez kuyruğa girer: O(R · C).</p>\n<p><b>Naif çözüm neden yetmez:</b> Her dolu hücre için "başka bir dolu hücreye bağlı mı?" diye tüm ızgarayı yeniden taramak O((R·C)²). Özyinelemeli DFS ise doğru ama gizli testteki yılan biçimli 500×500 blokta derinlik 10^5\'i aşar ve <code>RecursionError</code> verir; bu yüzden açık kuyruk/yığın kullan.</p>\n<p><b>Sık hata:</b> Hücreyi kuyruktan çıkarırken işaretlemek: aynı hücre birden çok kez kuyruğa girer. Kuyruğa <b>eklerken</b> işaretle.</p>',
  hints: [
      'Her yeni 1 bir blok başlatır; komşularını BFS ile işaretle.',
      'Hücreyi kuyruğa eklerken işaretle; özyineleme yerine deque kullan.'
  ]
},
{
  id: 'a-180',
  title: 'İki istasyon arasında bisiklet yolu var mı?',
  track: 'Graf',
  diff: 'Kolay',
  pts: 10,
  tags: ['BFS', 'komşuluk listesi'],
  src: 'LeetCode 1971 Find if Path Exists in Graph benzeri',
  mode: 'stdin',
  statement: '<p>Pedal İzmir\'in N istasyonu, iki yönlü M bisiklet yoluyla bağlı. Bir kullanıcı S istasyonundan bisiklet alıp yalnız bisiklet yollarını kullanarak T istasyonuna gitmek istiyor.</p>\n<p>Mümkünse <code>EVET</code>, değilse <code>HAYIR</code> yaz.</p>',
  input: '<p>İlk satırda N, M, S, T. Sonraki M satırda <code>a b</code> (iki yönlü yol).</p>',
  output: '<p><code>EVET</code> ya da <code>HAYIR</code>.</p>',
  constraints: '1 ≤ N ≤ 10^5, 0 ≤ M ≤ 2·10^5, 1 ≤ S, T ≤ N',
  samples: [
      { in: '6 4 1 4\n1 2\n2 3\n3 4\n5 6\n', out: 'EVET\n', why: '1 → 2 → 3 → 4: EVET.' },
      { in: '6 4 1 6\n1 2\n2 3\n3 4\n5 6\n', out: 'HAYIR\n', why: '6 yalnız 5\'e bağlı: HAYIR.' }
  ],
  hidden: [
      { in: '1 0 1 1\n', out: 'EVET\n' },
      { in: '2 0 1 2\n', out: 'HAYIR\n' },
      { in: '2 1 2 1\n1 2\n', out: 'EVET\n' },
      { in: '4 2 1 4\n1 2\n3 4\n', out: 'HAYIR\n' },
      { in: '5 4 5 1\n1 2\n2 3\n3 4\n4 5\n', out: 'EVET\n' },
      { gen: 'n = 100000\nprint(n, n - 1, 1, n)\nprint(\'\\n\'.join(f\'{i} {i + 1}\' for i in range(1, n)))\n' },
      { gen: 'import random\nrandom.seed(180)\nn, m = 100000, 200000\nprint(n, m, 1, 2)\nout = []\nfor _ in range(m):\n    a = random.randint(1, n // 2) * 2 - 1\n    b = random.randint(1, n // 2) * 2 - 1\n    out.append(f\'{a} {b}\')\nprint(\'\\n\'.join(out))\n' }
  ],
  start: 'import sys\nfrom collections import deque\nveri = sys.stdin.read().split()\nn, m, s, t = map(int, veri[:4])\nkomsu = [[] for _ in range(n + 1)]\n# kenarları ekle, S\'den BFS yap\n',
  sol: 'import sys\nfrom collections import deque\nveri = sys.stdin.read().split()\nn, m, s, t = map(int, veri[:4])\nkomsu = [[] for _ in range(n + 1)]\nfor i in range(m):\n    a, b = int(veri[4 + 2 * i]), int(veri[5 + 2 * i])\n    komsu[a].append(b)\n    komsu[b].append(a)\ngorildu = [False] * (n + 1)\ngorildu[s] = True\nq = deque([s])\nwhile q:\n    u = q.popleft()\n    for v in komsu[u]:\n        if not gorildu[v]:\n            gorildu[v] = True\n            q.append(v)\nprint(\'EVET\' if gorildu[t] else \'HAYIR\')\n',
  editorial: '<p><b>Yaklaşım:</b> Grafı komşuluk listesiyle kur (her yol iki yöne eklenir). S\'den BFS başlat; ziyaret edilen her düğümü işaretle. Sonunda T işaretliyse yol vardır. (Erken çıkış: T kuyruğa girdiği an durabilirsin.) Union-find da bu soru için uygundur.</p>\n<p><b>Karmaşıklık:</b> O(N + M) zaman ve bellek.</p>\n<p><b>Naif çözüm neden yetmez:</b> "Ulaşılabilir kümeyi, değişmeyene dek tüm kenarları tarayarak genişlet" yaklaşımı her turda M kenarı gezer ve zincir biçimli grafta N tur sürer: O(N · M) = 2·10^10. Komşuluk matrisi ise N² = 10^10 hücre bellek ister.</p>\n<p><b>Sık hata:</b> Yolları tek yönlü eklemek, S = T durumunu unutmak (cevap EVET) ve özyinelemeli DFS\'nin 10^5 uzunluğundaki zincirde özyineleme sınırına takılması.</p>',
  hints: ['Komşuluk listesi kur; yolları iki yöne de ekle.', 'S\'den BFS yap ve T\'nin ziyaret edilip edilmediğine bak.']
},
{
  id: 'a-181',
  title: 'Depo robotu için en kısa rota',
  track: 'Graf',
  diff: 'Orta',
  pts: 30,
  tags: ['BFS', 'ızgara', 'en kısa yol'],
  src: 'LeetCode 1091 Shortest Path in Binary Matrix / klasik labirent BFS',
  mode: 'stdin',
  statement: '<p>Anadolu Market\'in otomatik deposunda bir robot <code>S</code> hücresinden <code>E</code> hücresindeki paketleme istasyonuna gidecek. Izgarada <code>#</code> duvar/raf, <code>.</code> boş koridor. Robot her adımda yukarı, aşağı, sola ya da sağa bir hücre ilerler.</p>\n<p>En az adım sayısını yaz; ulaşılamıyorsa <code>-1</code>.</p>',
  input: '<p>İlk satırda R ve C. Sonraki R satırda ızgara (tam bir <code>S</code> ve bir <code>E</code> var).</p>',
  output: '<p>En az adım sayısı ya da −1.</p>',
  constraints: '1 ≤ R, C ≤ 500',
  samples: [
      { in: '4 5\nS.#..\n.##.#\n...#E\n.#...\n', out: '8\n', why: 'S\'den aşağı inip alttaki koridordan dolaşarak E\'ye 11 adımda ulaşılır.' },
      { in: '3 3\nS#.\n##.\n..E\n', out: '-1\n', why: 'S tamamen kapalı: −1.' }
  ],
  hidden: [
      { in: '1 2\nSE\n', out: '1\n' },
      { in: '2 1\nE\nS\n', out: '1\n' },
      { in: '1 3\nS#E\n', out: '-1\n' },
      { in: '3 3\nS..\n.#.\n..E\n', out: '4\n' },
      { in: '5 5\nS....\n####.\n.....\n.####\n....E\n', out: '16\n' },
      { gen: 'r = c = 500\nprint(r, c)\nfor i in range(r):\n    if i % 2 == 1:\n        row = [\'#\'] * c\n        row[c - 1 if i % 4 == 1 else 0] = \'.\'\n    else:\n        row = [\'.\'] * c\n    if i == 0:\n        row[0] = \'S\'\n    if i == r - 1:\n        row[c - 1] = \'E\'\n    print(\'\'.join(row))\n' },
      { gen: 'import random\nrandom.seed(181)\nr = c = 500\ng = [[\'#\' if random.random() < 0.3 else \'.\' for _ in range(c)] for _ in range(r)]\ng[0][0] = \'S\'\ng[r - 1][c - 1] = \'E\'\nprint(r, c)\nfor row in g:\n    print(\'\'.join(row))\n' }
  ],
  start: 'import sys\nfrom collections import deque\nsatirlar = sys.stdin.read().split()\nr, c = int(satirlar[0]), int(satirlar[1])\ng = satirlar[2:2 + r]\n# S ve E\'yi bul, S\'den BFS ile mesafe hesapla\n',
  sol: 'import sys\nfrom collections import deque\nsatirlar = sys.stdin.read().split()\nr, c = int(satirlar[0]), int(satirlar[1])\ng = satirlar[2:2 + r]\nfor i in range(r):\n    for j in range(c):\n        if g[i][j] == \'S\':\n            s = (i, j)\n        elif g[i][j] == \'E\':\n            e = (i, j)\nmesafe = [[-1] * c for _ in range(r)]\nmesafe[s[0]][s[1]] = 0\nq = deque([s])\nwhile q:\n    x, y = q.popleft()\n    if (x, y) == e:\n        break\n    d = mesafe[x][y] + 1\n    for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):\n        if 0 <= nx < r and 0 <= ny < c and g[nx][ny] != \'#\' and mesafe[nx][ny] < 0:\n            mesafe[nx][ny] = d\n            q.append((nx, ny))\nprint(mesafe[e[0]][e[1]])\n',
  editorial: '<p><b>Yaklaşım:</b> Ağırlıksız grafta (her adım 1) en kısa yol BFS ile bulunur: BFS düğümleri başlangıçtan uzaklık sırasıyla ziyaret eder, bu yüzden bir hücreye ilk ulaşıldığında bulunan mesafe en kısadır. Mesafe matrisini −1 ile başlat; komşu boş ve ziyaret edilmemişse mesafesini yaz ve kuyruğa ekle. E\'ye ulaşınca durabilirsin.</p>\n<p><b>Karmaşıklık:</b> O(R · C) zaman ve bellek.</p>\n<p><b>Naif çözüm neden yetmez:</b> DFS ile tüm yolları deneyip en kısasını seçmek üsteldir (açık bir ızgarada yol sayısı astronomik). "Mesafeler değişmeyene dek tüm hücreleri güncelle" (Bellman–Ford benzeri) O((R·C)²); gizli testteki 500×500 yılan labirentte 6·10^10 adım.</p>\n<p><b>Sık hata:</b> <code>deque</code> yerine liste ve <code>pop(0)</code> kullanmak (O(n) çıkarma) ve ziyaret işaretini kuyruktan çıkarırken koymak.</p>',
  hints: ['Her adım 1 birim: BFS en kısa yolu verir.', 'Mesafe matrisini −1 ile başlat; −1 olan hücre ziyaret edilmemiştir.']
},
{
  id: 'a-182',
  title: 'Soğuk zincirde bozulmanın yayılması',
  track: 'Graf',
  diff: 'Orta',
  pts: 30,
  tags: ['çok kaynaklı BFS', 'ızgara'],
  src: 'LeetCode 994 Rotting Oranges benzeri',
  mode: 'stdin',
  statement: '<p>Anadolu Market\'in soğuk hava deposunda bir elektrik kesintisi oldu. Raf ızgarasında her hücre: <code>0</code> boş, <code>1</code> sağlam ürün, <code>2</code> bozulmuş ürün. Her dakika, bozulmuş bir ürünün yatay/dikey komşusu olan sağlam ürünler de bozuluyor.</p>\n<p>Tüm ürünlerin bozulması için geçen dakikayı yaz. Hiç bozulmayacak sağlam ürün kalıyorsa <code>-1</code>, başta hiç sağlam ürün yoksa <code>0</code> yaz.</p>',
  input: '<p>İlk satırda R ve C. Sonraki R satırda C karakterlik <code>0/1/2</code> dizileri.</p>',
  output: '<p>Dakika sayısı ya da −1.</p>',
  constraints: '1 ≤ R, C ≤ 500',
  samples: [
      { in: '3 3\n211\n110\n011\n', out: '4\n', why: 'Bozulma köşeden yayılır; sağ alttaki ürün 4. dakikada bozulur.' },
      { in: '3 3\n211\n011\n101\n', out: '-1\n', why: 'Sol alttaki ürün hiçbir bozuk ürüne komşu olamıyor: −1.' }
  ],
  hidden: [
      { in: '1 1\n0\n', out: '0\n' },
      { in: '1 1\n1\n', out: '-1\n' },
      { in: '1 1\n2\n', out: '0\n' },
      { in: '1 3\n202\n', out: '0\n' },
      { in: '2 4\n2111\n1112\n', out: '2\n' },
      { in: '3 3\n000\n010\n002\n', out: '-1\n' },
      { gen: 'print(500, 500)\nprint(\'2\' + \'1\' * 499)\nfor _ in range(499):\n    print(\'1\' * 500)\n' },
      { gen: 'import random\nrandom.seed(182)\nprint(500, 500)\nfor _ in range(500):\n    print(\'\'.join(random.choice(\'11111110\') if random.random() > 0.0005 else \'2\' for _ in range(500)))\n' }
  ],
  start: 'import sys\nfrom collections import deque\nsatirlar = sys.stdin.read().split()\nr, c = int(satirlar[0]), int(satirlar[1])\ng = [list(s) for s in satirlar[2:2 + r]]\nq = deque()\nsaglam = 0\n# tüm bozuk hücreleri aynı anda kuyruğa koy (çok kaynaklı BFS)\n',
  sol: 'import sys\nfrom collections import deque\nsatirlar = sys.stdin.read().split()\nr, c = int(satirlar[0]), int(satirlar[1])\ng = [list(s) for s in satirlar[2:2 + r]]\nq = deque()\nsaglam = 0\nfor i in range(r):\n    for j in range(c):\n        if g[i][j] == \'2\':\n            q.append((i, j, 0))\n        elif g[i][j] == \'1\':\n            saglam += 1\ndakika = 0\nwhile q:\n    x, y, t = q.popleft()\n    dakika = t\n    for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):\n        if 0 <= nx < r and 0 <= ny < c and g[nx][ny] == \'1\':\n            g[nx][ny] = \'2\'\n            saglam -= 1\n            q.append((nx, ny, t + 1))\nprint(dakika if saglam == 0 else -1)\n',
  editorial: '<p><b>Yaklaşım:</b> Çok kaynaklı BFS. Başlangıçtaki <b>tüm</b> bozuk hücreleri 0. dakika olarak aynı anda kuyruğa koy. BFS seviye seviye ilerlediği için bir sağlam ürüne ilk ulaşıldığı dakika, onun bozulduğu dakikadır. Sağlam sayısını tut; her bozulmada azalt. Kuyruktan çıkan son dakika cevaptır; sonda sağlam kalırsa −1.</p>\n<p><b>Karmaşıklık:</b> O(R · C).</p>\n<p><b>Naif çözüm neden yetmez:</b> Dakika dakika tüm ızgarayı tarayıp yeni bozulanları bulmak, her dakika O(R·C) iş yapar; gizli testte tek köşeden yayılma 998 dakika sürer: ~2,5·10^8 hücre kontrolü (ayrıca her biri 4 komşu). Her bozuk hücreden ayrı ayrı BFS yapmak da O((R·C)²) olabilir.</p>\n<p><b>Sık hata:</b> Başta hiç sağlam ürün yokken 0 yerine −1 yazmak ve aynı dakikada bozulanları bir sonraki dakikada değil aynı tur içinde yaymaya devam etmek (kuyruğa dakika bilgisini koy).</p>',
  hints: ['Tüm bozuk hücrelerden aynı anda başlayan BFS.', 'Sağlam ürün sayacını tut; sonda sıfır değilse −1.']
},
{
  id: 'a-183',
  title: 'Eğitim programının önkoşul sırası',
  track: 'Graf',
  diff: 'Orta',
  pts: 30,
  tags: ['topolojik sıralama', 'Kahn', 'heap'],
  src: 'LeetCode 210 Course Schedule II benzeri',
  mode: 'stdin',
  statement: '<p>Pusula İK\'nın yeni çalışan eğitim programında 1\'den N\'ye numaralı modüller var. Bazı modüllerin önkoşulu var: <code>a b</code> satırı "a, b\'den önce tamamlanmalı" demek. Her an önkoşulları tamamlanmış modüller arasından <b>numarası en küçük olan</b> alınır.</p>\n<p>Bu kurala göre modüllerin alınma sırasını yaz. Önkoşullar döngü içeriyorsa (sıra imkânsızsa) <code>IMKANSIZ</code> yaz.</p>',
  input: '<p>İlk satırda N ve M. Sonraki M satırda <code>a b</code>.</p>',
  output: '<p>Tek satırda N modül numarası ya da <code>IMKANSIZ</code>.</p>',
  constraints: '1 ≤ N ≤ 10^5, 0 ≤ M ≤ 2·10^5',
  samples: [
      { in: '4 3\n2 1\n2 3\n3 4\n', out: '2 1 3 4\n', why: '2 önkoşulsuz, diğerleri ona bağlı: 2, sonra en küçük uygun 1, sonra 3, 4.' },
      { in: '3 3\n1 2\n2 3\n3 1\n', out: 'IMKANSIZ\n', why: '1 → 2 → 3 → 1 döngüsü: IMKANSIZ.' }
  ],
  hidden: [
      { in: '1 0\n', out: '1\n' },
      { in: '3 0\n', out: '1 2 3\n' },
      { in: '2 1\n2 1\n', out: '2 1\n' },
      { in: '2 2\n1 2\n2 1\n', out: 'IMKANSIZ\n' },
      { in: '5 4\n5 4\n4 3\n3 2\n2 1\n', out: '5 4 3 2 1\n' },
      { in: '6 6\n1 4\n2 4\n3 5\n4 6\n5 6\n1 2\n', out: '1 2 3 4 5 6\n' },
      { gen: 'import random\nrandom.seed(183)\nn, m = 100000, 200000\nperm = list(range(1, n + 1))\nrandom.shuffle(perm)\npos = {v: i for i, v in enumerate(perm)}\nprint(n, m)\nout = []\nfor _ in range(m):\n    a, b = random.sample(perm, 2)\n    if pos[a] > pos[b]:\n        a, b = b, a\n    out.append(f\'{a} {b}\')\nprint(\'\\n\'.join(out))\n' },
      { gen: 'n = 100000\nprint(n, n)\nprint(\'\\n\'.join(f\'{i} {i + 1}\' for i in range(1, n)))\nprint(n, 50000)\n' }
  ],
  start: 'import sys\nimport heapq\nveri = sys.stdin.read().split()\nn, m = int(veri[0]), int(veri[1])\nsonraki = [[] for _ in range(n + 1)]\ngiris = [0] * (n + 1)   # her modülün bekleyen önkoşul sayısı\n',
  sol: 'import sys\nimport heapq\nveri = sys.stdin.read().split()\nn, m = int(veri[0]), int(veri[1])\nsonraki = [[] for _ in range(n + 1)]\ngiris = [0] * (n + 1)\nfor i in range(m):\n    a, b = int(veri[2 + 2 * i]), int(veri[3 + 2 * i])\n    sonraki[a].append(b)\n    giris[b] += 1\nhazir = [v for v in range(1, n + 1) if giris[v] == 0]\nheapq.heapify(hazir)\nsira = []\nwhile hazir:\n    u = heapq.heappop(hazir)\n    sira.append(u)\n    for v in sonraki[u]:\n        giris[v] -= 1\n        if giris[v] == 0:\n            heapq.heappush(hazir, v)\nprint(\' \'.join(map(str, sira)) if len(sira) == n else \'IMKANSIZ\')\n',
  editorial: '<p><b>Yaklaşım (Kahn algoritması):</b> Her modülün giriş derecesini (bekleyen önkoşul sayısı) hesapla. Derecesi 0 olanlar alınmaya hazırdır. "En küçük numaralı" kuralı için hazır modülleri bir <b>min-heap</b>\'te tut. Heap\'ten çıkardığın modülü sıraya ekle ve onu önkoşul olarak bekleyenlerin derecesini azalt; 0\'a düşeni heap\'e koy. Sonda sırada N modül yoksa kalanlar bir döngü içindedir: IMKANSIZ.</p>\n<p><b>Karmaşıklık:</b> O((N + M) log N); heap yerine sıradan kuyruk kullansaydın (sözlükçe kural olmadan) O(N + M).</p>\n<p><b>Naif çözüm neden yetmez:</b> Her adımda tüm modülleri tarayıp "önkoşulları bitmiş en küçük modül"ü aramak O(N · (N + M)) — 10^5 modülde 10^10. Tüm permütasyonları denemek ise faktöriyel.</p>\n<p><b>Sık hata:</b> Kenar yönünü ters kurmak (a → b, a önce), aynı önkoşul satırı iki kez gelirse dereceyi bir kez saymak (iki kez saymak doğru; azaltırken de iki kez azalır) ve döngü kontrolünü unutmak. <b>Alternatif:</b> DFS tabanlı topolojik sıralama da döngüyü (gri düğüm) yakalar ama sözlükçe en küçük sırayı doğal olarak vermez.</p>',
  hints: ['Giriş derecesi 0 olanlar hazırdır.', 'Hazırları min-heap\'te tut; sırada N modül yoksa döngü var.']
},
{
  id: 'a-184',
  title: 'Bisiklet ağında döngü var mı?',
  track: 'Graf',
  diff: 'Orta',
  pts: 30,
  tags: ['union-find', 'döngü tespiti', 'yönsüz graf'],
  src: 'LeetCode 684 Redundant Connection / Graph Valid Tree benzeri',
  mode: 'stdin',
  statement: '<p>Pedal İzmir, yeni bisiklet yolu ağını maliyet nedeniyle <b>döngüsüz</b> (orman yapısında) kurmak istiyor: iki istasyon arasında birden fazla güzergâh olmamalı. Yollar sırayla planlanıyor ve plan ekibi, döngü oluşturan <b>ilk</b> yolu bulmak istiyor.</p>\n<p>Döngü oluşturan ilk yolun sıra numarasını (1\'den başlayarak) yaz; hiçbir yol döngü oluşturmuyorsa <code>0</code> yaz.</p>',
  input: '<p>İlk satırda N ve M. Sonraki M satırda <code>a b</code> (a ≠ b, iki yönlü). Aynı iki istasyon arasında ikinci bir yol da döngü sayılır.</p>',
  output: '<p>Sıra numarası ya da 0.</p>',
  constraints: '2 ≤ N ≤ 10^5, 1 ≤ M ≤ 2·10^5',
  samples: [
      { in: '4 4\n1 2\n2 3\n3 4\n4 1\n', out: '4\n', why: '4. yol 4 ile 1\'i bağlıyor; ikisi zaten 1-2-3-4 üzerinden bağlı: 4.' },
      { in: '5 3\n1 2\n3 4\n4 5\n', out: '0\n', why: 'Ağ bir orman: 0.' }
  ],
  hidden: [
      { in: '2 1\n1 2\n', out: '0\n' },
      { in: '2 2\n1 2\n2 1\n', out: '2\n' },
      { in: '3 3\n1 2\n1 3\n2 3\n', out: '3\n' },
      { in: '6 5\n1 2\n3 4\n5 6\n2 3\n4 5\n', out: '0\n' },
      { in: '5 5\n1 2\n3 4\n1 3\n2 4\n1 5\n', out: '4\n' },
      { gen: 'import random\nrandom.seed(184)\nn = 100000\nkenar = [(random.randint(1, i - 1), i) for i in range(2, n + 1)]\nrandom.shuffle(kenar)\nprint(n, n)\nprint(\'\\n\'.join(f\'{a} {b}\' for a, b in kenar))\nprint(1, n)\n' },
      { gen: 'n = 100000\nprint(n, n - 1)\nprint(\'\\n\'.join(f\'{i} {i + 1}\' for i in range(1, n)))\n' }
  ],
  start: 'import sys\nveri = sys.stdin.read().split()\nn, m = int(veri[0]), int(veri[1])\nebeveyn = list(range(n + 1))\n\ndef bul(x):\n    pass\n',
  sol: 'import sys\nveri = sys.stdin.read().split()\nn, m = int(veri[0]), int(veri[1])\nebeveyn = list(range(n + 1))\n\ndef bul(x):\n    kok = x\n    while ebeveyn[kok] != kok:\n        kok = ebeveyn[kok]\n    while ebeveyn[x] != kok:\n        ebeveyn[x], x = kok, ebeveyn[x]\n    return kok\n\ncevap = 0\nfor i in range(m):\n    a, b = bul(int(veri[2 + 2 * i])), bul(int(veri[3 + 2 * i]))\n    if a == b:\n        cevap = i + 1\n        break\n    ebeveyn[a] = b\nprint(cevap)\n',
  editorial: '<p><b>Yaklaşım:</b> Yönsüz grafta bir kenar, iki ucu <b>zaten aynı bileşendeyse</b> döngü oluşturur. Union-find ile yolları sırayla ekle: önce iki ucun köklerini bul; aynıysa bu yol ilk döngü yoludur, değilse bileşenleri birleştir.</p>\n<p><b>Karmaşıklık:</b> Yol sıkıştırmayla kenar başına neredeyse O(1); toplam O(N + M).</p>\n<p><b>Naif çözüm neden yetmez:</b> Her yeni yoldan önce a\'dan b\'ye DFS/BFS ile yol var mı diye bakmak, kenar başına O(N + M): gizli testteki 10^5 kenarlı ağaçta ~10^10 adım. (Tek seferlik "döngü var mı?" sorusu için tek bir DFS yeterdi; ama "ilk döngü kenarı" sorusu artımlı yapı ister.)</p>\n<p><b>Sık hata:</b> Özyinelemeli <code>bul</code> (zincir girdide derinlik 10^5), çift kenarı (aynı iki istasyon) gözden kaçırmak ve yönlü graflarda bu yöntemi kullanmak: yönlü döngü tespiti için DFS renklendirme ya da Kahn algoritması gerekir (a-183).</p>',
  hints: ['Bir yolun iki ucu zaten bağlıysa o yol döngü oluşturur.', 'Union-find ile her yoldan önce kökleri karşılaştır.']
},
{
  id: 'a-185',
  title: 'Duyurunun tüm havalimanlarına ulaşma süresi',
  track: 'Graf',
  diff: 'Orta',
  pts: 30,
  tags: ['Dijkstra', 'heap', 'en kısa yol'],
  src: 'LeetCode 743 Network Delay Time benzeri',
  mode: 'stdin',
  statement: '<p>Kanat Havayolları\'nın operasyon merkezi K numaralı havalimanından acil bir duyuru yayınlıyor. Duyuru, havalimanları arasındaki <b>tek yönlü</b> veri hatlarıyla yayılıyor; u\'dan v\'ye hattın gecikmesi w dakika. Her havalimanı duyuruyu ilk aldığı anda tüm çıkış hatlarına iletiyor.</p>\n<p>Duyurunun <b>tüm</b> N havalimanına ulaşması kaç dakika sürer? Ulaşamayan havalimanı varsa <code>-1</code> yaz.</p>',
  input: '<p>İlk satırda N, M, K. Sonraki M satırda <code>u v w</code>.</p>',
  output: '<p>Süre ya da −1.</p>',
  constraints: '1 ≤ N ≤ 10^5, 0 ≤ M ≤ 2·10^5, 0 ≤ w ≤ 10^4',
  samples: [
      { in: '4 3 2\n2 1 1\n2 3 1\n3 4 1\n', out: '2\n', why: '1 ve 3\'e 1 dakikada, 4\'e 2 dakikada ulaşır: 2.' },
      { in: '2 1 2\n1 2 1\n', out: '-1\n', why: 'Hat 1\'den 2\'ye; 2\'den 1\'e ulaşılamaz: −1.' }
  ],
  hidden: [
      { in: '1 0 1\n', out: '0\n' },
      { in: '2 1 1\n1 2 0\n', out: '0\n' },
      { in: '3 3 1\n1 2 10\n1 3 1\n3 2 1\n', out: '2\n' },
      { in: '3 2 1\n1 2 5\n3 1 5\n', out: '-1\n' },
      { in: '4 5 1\n1 2 4\n1 3 1\n3 2 1\n2 4 1\n3 4 9\n', out: '3\n' },
      { gen: 'import random\nrandom.seed(185)\nn, m = 100000, 200000\nprint(n, m, 1)\nout = [f\'{i} {i + 1} {random.randint(0, 10**4)}\' for i in range(1, n)]\nwhile len(out) < m:\n    out.append(f\'{random.randint(1, n)} {random.randint(1, n)} {random.randint(0, 10**4)}\')\nprint(\'\\n\'.join(out))\n' },
      { gen: 'import random\nrandom.seed(1850)\nn, m = 100000, 200000\nprint(n, m, 7)\nprint(\'\\n\'.join(f\'{random.randint(1, n)} {random.randint(1, n)} {random.randint(1, 10**4)}\' for _ in range(m)))\n' }
  ],
  start: 'import sys\nimport heapq\nveri = sys.stdin.read().split()\nn, m, k = int(veri[0]), int(veri[1]), int(veri[2])\nkomsu = [[] for _ in range(n + 1)]\n# Dijkstra: (mesafe, düğüm) çiftlerini heap\'te tut\n',
  sol: 'import sys\nimport heapq\nveri = sys.stdin.read().split()\nn, m, k = int(veri[0]), int(veri[1]), int(veri[2])\nkomsu = [[] for _ in range(n + 1)]\nfor i in range(m):\n    u, v, w = int(veri[3 + 3 * i]), int(veri[4 + 3 * i]), int(veri[5 + 3 * i])\n    komsu[u].append((v, w))\nSONSUZ = float(\'inf\')\nmesafe = [SONSUZ] * (n + 1)\nmesafe[k] = 0\nheap = [(0, k)]\nwhile heap:\n    d, u = heapq.heappop(heap)\n    if d > mesafe[u]:\n        continue\n    for v, w in komsu[u]:\n        nd = d + w\n        if nd < mesafe[v]:\n            mesafe[v] = nd\n            heapq.heappush(heap, (nd, v))\nen_uzak = max(mesafe[1:])\nprint(-1 if en_uzak == SONSUZ else en_uzak)\n',
  editorial: '<p><b>Yaklaşım (Dijkstra):</b> Negatif olmayan ağırlıklı grafta tek kaynaktan en kısa yollar. Kaynağın mesafesi 0, diğerleri sonsuz. Min-heap\'ten her seferinde mesafesi en küçük düğümü çıkar; onun mesafesi artık kesindir. Komşularını gevşet (<code>d + w &lt; mesafe[v]</code> ise güncelle ve heap\'e ekle). Heap\'te eskimiş kayıtlar kalabilir; çıkarınca <code>d &gt; mesafe[u]</code> ise atla (tembel silme). Cevap, mesafelerin en büyüğüdür.</p>\n<p><b>Karmaşıklık:</b> O((N + M) log M).</p>\n<p><b>Naif çözüm neden yetmez:</b> Bellman–Ford N tur × M kenar = 2·10^10 gevşetme. BFS ise ağırlıklı grafta yanlış sonuç verir (az kenarlı yol her zaman en kısa değildir, örnek: 1→2 doğrudan 10 dk, 1→3→2 toplam 2 dk). Her çıkarımda tüm düğümler arasından minimumu aramak O(N²) = 10^10.</p>\n<p><b>Sık hata:</b> Eskimiş heap kayıtlarını atlamamak (gereksiz iş, yoğun grafta ciddi yavaşlama) ve hatları iki yönlü eklemek.</p>',
  hints: [
      'Ağırlıklar negatif değil: Dijkstra.',
      'heapq ile (mesafe, düğüm); eskimiş kayıtları atla.',
      'Cevap en büyük mesafe; sonsuz varsa −1.'
  ]
},
{
  id: 'a-186',
  title: 'Aktarma sınırlı en ucuz bilet',
  track: 'Graf',
  diff: 'Zor',
  pts: 60,
  tags: ['Bellman–Ford', 'kısıtlı en kısa yol', 'DP'],
  src: 'LeetCode 787 Cheapest Flights Within K Stops benzeri',
  mode: 'stdin',
  statement: '<p>Kanat Havayolları\'nın bilet motoru, N şehir arasındaki M tek yönlü uçuşun fiyatlarını biliyor. Bir müşteri S şehrinden T şehrine gitmek istiyor ama en fazla <b>K aktarma</b> (ara durak) kabul ediyor; yani en fazla K+1 uçuş kullanabilir.</p>\n<p>Bu koşulla en ucuz toplam fiyatı yaz; uygun bir yol yoksa <code>-1</code>.</p>',
  input: '<p>İlk satırda N, M, S, T, K. Sonraki M satırda <code>u v fiyat</code>.</p>',
  output: '<p>En ucuz fiyat ya da −1.</p>',
  constraints: '2 ≤ N ≤ 2000, 0 ≤ M ≤ 10^4, 0 ≤ K ≤ 100, 1 ≤ fiyat ≤ 10^4, S ≠ T',
  samples: [
      { in: '4 5 1 4 1\n1 2 100\n2 3 100\n2 4 600\n3 4 200\n1 3 500\n', out: '700\n', why: '1→2→3→4 = 400 ama 2 aktarma. 1 aktarmayla: 1→2→4 = 700, 1→3→4 = 700. Cevap 700.' },
      { in: '3 3 1 3 0\n1 2 100\n2 3 100\n1 3 500\n', out: '500\n', why: 'Aktarmasız tek seçenek doğrudan uçuş: 500.' }
  ],
  hidden: [
      { in: '2 0 1 2 5\n', out: '-1\n' },
      { in: '2 1 1 2 0\n1 2 7\n', out: '7\n' },
      { in: '3 2 1 3 0\n1 2 1\n2 3 1\n', out: '-1\n' },
      { in: '3 2 1 3 1\n1 2 1\n2 3 1\n', out: '2\n' },
      { in: '4 4 1 4 2\n1 2 1\n2 3 1\n3 4 1\n1 4 10\n', out: '3\n' },
      { in: '5 6 1 5 1\n1 2 5\n2 5 5\n1 3 1\n3 4 1\n4 5 1\n1 5 100\n', out: '10\n' },
      { gen: 'import random\nrandom.seed(186)\nn, m = 2000, 10000\nprint(n, m, 1, n, 100)\nout = [f\'{i} {i + 1} {random.randint(1, 50)}\' for i in range(1, n)]\nwhile len(out) < m:\n    a = random.randint(1, n - 1)\n    out.append(f\'{a} {min(n, a + random.randint(1, 60))} {random.randint(500, 10**4)}\')\nprint(\'\\n\'.join(out))\n' },
      { gen: 'import random\nrandom.seed(1860)\nn, m = 2000, 10000\nprint(n, m, 5, 1999, 100)\nprint(\'\\n\'.join(f\'{random.randint(1, n)} {random.randint(1, n)} {random.randint(1, 10**4)}\' for _ in range(m)))\n' }
  ],
  start: 'import sys\nveri = sys.stdin.read().split()\nn, m, s, t, k = map(int, veri[:5])\nSONSUZ = float(\'inf\')\nmaliyet = [SONSUZ] * (n + 1)\nmaliyet[s] = 0\n# k+1 tur: her turda kenarları ÖNCEKİ turun kopyasından gevşet\n',
  sol: 'import sys\nveri = sys.stdin.read().split()\nn, m, s, t, k = map(int, veri[:5])\nucuslar = [(int(veri[5 + 3 * i]), int(veri[6 + 3 * i]), int(veri[7 + 3 * i])) for i in range(m)]\nSONSUZ = float(\'inf\')\nmaliyet = [SONSUZ] * (n + 1)\nmaliyet[s] = 0\nfor _ in range(k + 1):\n    yeni = maliyet[:]\n    degisti = False\n    for u, v, f in ucuslar:\n        du = maliyet[u]\n        if du != SONSUZ and du + f < yeni[v]:\n            yeni[v] = du + f\n            degisti = True\n    maliyet = yeni\n    if not degisti:\n        break\nprint(maliyet[t] if maliyet[t] != SONSUZ else -1)\n',
  editorial: '<p><b>Yaklaşım:</b> Aktarma sınırı yüzünden düz Dijkstra yetmez: daha ucuz ama çok aktarmalı bir yol, daha pahalı ama az aktarmalı yolu "eler" ve sınır aşılır. Bellman–Ford\'u <b>K+1 turla sınırla</b>: i. turun sonunda <code>maliyet[v]</code>, en fazla i uçuşla v\'ye ulaşmanın en ucuz fiyatıdır. Kritik nokta: bir tur içinde yalnız <b>önceki turun</b> değerlerinden gevşetmek (kopya dizi). Aksi hâlde aynı turda zincirleme gevşeme olur ve fazla uçuş kullanılır.</p>\n<p><b>Karmaşıklık:</b> O((K+1) · M) = 101 × 10^4 ≈ 10^6. Bir turda hiçbir şey değişmezse erken dur.</p>\n<p><b>Naif çözüm neden yetmez:</b> Tüm yolları DFS ile K+1 derinliğe kadar denemek, ortalama çıkış derecesi d iken d^(K+1) yol demek; gizli testte astronomik. Durum = (şehir, kullanılan uçuş) olan Dijkstra da çalışır, ama N·K durumda heap maliyeti daha yüksektir.</p>\n<p><b>Sık hata:</b> Kopya dizi kullanmamak (örnek 1\'de 400 bulursun), K\'yı uçuş sayısı sanıp K tur çalıştırmak (K aktarma = K+1 uçuş).</p>',
  hints: ['En fazla K+1 uçuş: K+1 tur Bellman–Ford.', 'Her turda önceki turun kopyasından gevşet; aynı tur içinde zincirleme olmasın.']
},
{
  id: 'a-187',
  title: 'Şubeleri birbirine bağlayan en ucuz fiber ağ',
  track: 'Graf',
  diff: 'Zor',
  pts: 60,
  tags: ['MST', 'Kruskal', 'union-find'],
  src: 'HackerRank Kruskal (MST): Really Special Subtree / LeetCode 1584 benzeri',
  mode: 'stdin',
  statement: '<p>Anadolu Bank, N şubesini özel fiber hatla birbirine bağlayacak. M aday hattın her birinin döşeme maliyeti biliniyor (hatlar iki yönlü). Amaç: tüm şubelerin (doğrudan ya da dolaylı) birbirine ulaşabildiği, <b>toplam maliyeti en düşük</b> hat kümesini seçmek.</p>\n<p>Bu en düşük toplam maliyeti yaz. Tüm şubeleri bağlamak mümkün değilse <code>-1</code> yaz.</p>',
  input: '<p>İlk satırda N ve M. Sonraki M satırda <code>a b maliyet</code>.</p>',
  output: '<p>En düşük toplam maliyet ya da −1.</p>',
  constraints: '1 ≤ N ≤ 10^5, 0 ≤ M ≤ 2·10^5, 1 ≤ maliyet ≤ 10^6',
  samples: [
      { in: '4 5\n1 2 10\n2 3 15\n1 3 5\n3 4 4\n2 4 8\n', out: '17\n', why: 'Seçilen hatlar: 3-4 (4), 1-3 (5), 2-4 (8): toplam 17.' },
      { in: '3 1\n1 2 7\n', out: '-1\n', why: '3. şubeye hiç hat yok: −1.' }
  ],
  hidden: [
      { in: '1 0\n', out: '0\n' },
      { in: '2 0\n', out: '-1\n' },
      { in: '2 2\n1 2 5\n1 2 3\n', out: '3\n' },
      { in: '3 3\n1 2 1\n2 3 1\n1 3 1\n', out: '2\n' },
      { in: '5 7\n1 2 3\n1 3 8\n2 4 5\n3 4 2\n3 5 4\n4 5 6\n2 3 9\n', out: '14\n' },
      { in: '4 3\n1 2 1\n1 2 2\n3 4 1\n', out: '-1\n' },
      { gen: 'import random\nrandom.seed(187)\nn, m = 100000, 200000\nprint(n, m)\nout = [f\'{random.randint(1, i - 1)} {i} {random.randint(1, 10**6)}\' for i in range(2, n + 1)]\nwhile len(out) < m:\n    out.append(f\'{random.randint(1, n)} {random.randint(1, n)} {random.randint(1, 10**6)}\')\nrandom.shuffle(out)\nprint(\'\\n\'.join(out))\n' },
      { gen: 'import random\nrandom.seed(1870)\nn, m = 100000, 200000\nprint(n, m)\nprint(\'\\n\'.join(f\'{random.randint(1, n - 1)} {random.randint(1, n - 1)} {random.randint(1, 10**6)}\' for _ in range(m)))\n' }
  ],
  start: 'import sys\nveri = sys.stdin.read().split()\nn, m = int(veri[0]), int(veri[1])\nhatlar = []\nebeveyn = list(range(n + 1))\n# hatları maliyete göre sırala, döngü oluşturmayanları al\n',
  sol: 'import sys\nveri = sys.stdin.read().split()\nn, m = int(veri[0]), int(veri[1])\nhatlar = sorted((int(veri[4 + 3 * i]), int(veri[2 + 3 * i]), int(veri[3 + 3 * i])) for i in range(m))\nebeveyn = list(range(n + 1))\n\ndef bul(x):\n    kok = x\n    while ebeveyn[kok] != kok:\n        kok = ebeveyn[kok]\n    while ebeveyn[x] != kok:\n        ebeveyn[x], x = kok, ebeveyn[x]\n    return kok\n\ntoplam = 0\nsecilen = 0\nfor c, a, b in hatlar:\n    ra, rb = bul(a), bul(b)\n    if ra != rb:\n        ebeveyn[ra] = rb\n        toplam += c\n        secilen += 1\n        if secilen == n - 1:\n            break\nprint(toplam if secilen == n - 1 else -1)\n',
  editorial: '<p><b>Yaklaşım (Kruskal):</b> Hatları maliyete göre artan sırala. Sırayla gez; hat iki farklı bileşeni bağlıyorsa (union-find ile kontrol) al ve bileşenleri birleştir, aynı bileşendeyse atla (döngü oluştururdu). N−1 hat seçilince minimum yayılan ağaç (MST) tamamdır; daha azı seçildiyse graf bağlı değildir: −1. Doğruluğunun dayanağı "kesit özelliği"dir: herhangi bir kesiti geçen en ucuz kenar bir MST\'de yer alır.</p>\n<p><b>Karmaşıklık:</b> Sıralama O(M log M) + union-find işlemleri neredeyse O(M).</p>\n<p><b>Alternatif (Prim):</b> Heap ile O(M log N); yoğun graflarda dizi tabanlı O(N²) Prim tercih edilir.</p>\n<p><b>Naif çözüm neden yetmez:</b> Heap\'siz Prim her adımda tüm düğümleri tarar: O(N²) = 10^10. Kenar alt kümelerini denemek üsteldir. Kruskal\'da union-find yerine her hatta BFS ile döngü kontrolü yapmak O(M · N).</p>\n<p><b>Sık hata:</b> Kendine dönen (a = b) hatları ve aynı çift arasındaki çoklu hatları hesaba katmamak (union-find doğal olarak eler), bağlılık kontrolünü unutmak.</p>',
  hints: ['Hatları ucuzdan pahalıya sırala.', 'Union-find ile iki ucu farklı bileşendeyse al; sonda N−1 hat seçildi mi kontrol et.']
},
{
  id: 'a-188',
  title: 'Ürün kodunu adım adım dönüştürme',
  track: 'Graf',
  diff: 'Zor',
  pts: 60,
  tags: ['BFS', 'örtük graf', 'metin'],
  src: 'LeetCode 127 Word Ladder benzeri',
  mode: 'stdin',
  statement: '<p>Anadolu Market\'in stok sistemi, bir ürün kodunu başka bir koda dönüştürürken her adımda <b>yalnızca bir harf</b> değiştirmeye izin veriyor ve her ara kod <b>katalogda kayıtlı</b> olmalı (kod uzunluğu sabit). Başlangıç kodu katalogda olmak zorunda değil; hedef kod katalogda olmalı.</p>\n<p>Başlangıçtan hedefe en kısa dönüşüm dizisindeki <b>kod sayısını</b> (başlangıç ve hedef dahil) yaz. Mümkün değilse <code>0</code> yaz.</p>',
  input: '<p>İlk satırda başlangıç ve hedef kod. İkinci satırda N, üçüncü satırda boşlukla ayrılmış N katalog kodu (hepsi aynı uzunlukta, küçük İngilizce harfler).</p>',
  output: '<p>Kod sayısı ya da 0.</p>',
  constraints: '1 ≤ kod uzunluğu ≤ 8, 1 ≤ N ≤ 5·10^4',
  samples: [
      { in: 'hit cog\n6\nhot dot dog lot log cog\n', out: '5\n', why: 'hit → hot → dot → dog → cog: 5 kod.' },
      { in: 'hit cog\n5\nhot dot dog lot log\n', out: '0\n', why: 'Hedef katalogda yok: 0.' }
  ],
  hidden: [
      { in: 'a c\n3\na b c\n', out: '2\n' },
      { in: 'ab ab\n1\nab\n', out: '1\n' },
      { in: 'ab cd\n2\nad cb\n', out: '0\n' },
      { in: 'abc xyz\n3\nxbc xyc xyz\n', out: '4\n' },
      { in: 'kale masa\n7\nkasa mala male kala masa kasa mase\n', out: '4\n' },
      { in: 'aaa bbb\n2\nbbb aab\n', out: '0\n' },
      { gen: 'import random\nrandom.seed(188)\nkume = set()\nwhile len(kume) < 50000:\n    kume.add(\'\'.join(random.choice(\'abcdef\') for _ in range(7)))\nkume = sorted(kume)\nprint(\'aaaaaaa\', kume[-1])\nprint(len(kume))\nprint(*kume)\n' },
      { gen: 'import itertools\nkume = [\'\'.join(p) for p in itertools.product(\'abcdefg\', repeat=5)]\nkume = [k for k in kume if \'g\' not in k[1:]] + [\'ggggg\']\nprint(\'aaaaa\', \'ggggg\')\nprint(len(kume))\nprint(*kume)\n' }
  ],
  start: 'import sys\nfrom collections import deque\nveri = sys.stdin.read().split()\nbas, hedef = veri[0], veri[1]\nn = int(veri[2])\nkatalog = set(veri[3:3 + n])\n# BFS: her koddan tek harf değiştirerek komşuları üret\n',
  sol: 'import sys\nfrom collections import deque\nveri = sys.stdin.read().split()\nbas, hedef = veri[0], veri[1]\nn = int(veri[2])\nkatalog = set(veri[3:3 + n])\nif hedef not in katalog:\n    print(0)\nelif bas == hedef:\n    print(1)\nelse:\n    harfler = sorted(set(\'\'.join(katalog)))\n    katalog.discard(bas)\n    q = deque([(bas, 1)])\n    cevap = 0\n    while q and not cevap:\n        kod, d = q.popleft()\n        for i in range(len(kod)):\n            on, son = kod[:i], kod[i + 1:]\n            for h in harfler:\n                aday = on + h + son\n                if aday in katalog:\n                    if aday == hedef:\n                        cevap = d + 1\n                        break\n                    katalog.discard(aday)\n                    q.append((aday, d + 1))\n            if cevap:\n                break\n    print(cevap)\n',
  editorial: '<p><b>Yaklaşım:</b> Kodlar düğüm, tek harf farkı kenar: ağırlıksız grafta en kısa yol, yani BFS. Kenarları önceden kurmak yerine örtük üret: bir kodun her konumuna katalogdaki her harfi koyup oluşan aday katalogda mı diye kümede bak (O(1)). Ziyaret edilen kodları katalogdan sil ki tekrar kuyruğa girmesin. Kullanılan harf kümesini katalogla sınırlamak (26 yerine yalnız geçen harfler) aday sayısını ciddi azaltır.</p>\n<p><b>Karmaşıklık:</b> O(N · L · Σ · L): her kod için L konum × Σ harf aday, her aday L uzunluğunda metin kurulumu. Örüntü kovaları (<code>h*t</code> → [hit, hot]) ile de O(N · L²).</p>\n<p><b>Naif çözüm neden yetmez:</b> Tüm kod çiftlerini karşılaştırarak komşuluk kurmak O(N² · L) = 2,5·10^9 · L karşılaştırma; gizli testteki 5·10^4 kodda saatler sürer. DFS ile tüm yolları denemek ise üsteldir ve en kısayı garanti etmez.</p>\n<p><b>Sık hata:</b> Kod sayısı yerine adım sayısı yazmak (cevap adım + 1), hedef katalogda değilken aramaya başlamak ve düğümü kuyruktan çıkarırken işaretlemek (aynı kod defalarca kuyruğa girer).</p>',
  hints: [
      'Tek harf farkı = kenar; en kısa yol için BFS.',
      'Komşuları üretmek için her konuma her harfi dene ve kümede ara; ziyaret edileni kümeden sil.'
  ]
},
{
  id: 'a-189',
  title: 'Çatışan çalışanları iki ekibe ayır',
  track: 'Graf',
  diff: 'Orta',
  pts: 30,
  tags: ['BFS', 'iki parçalı graf', 'renklendirme'],
  src: 'LeetCode 886 Possible Bipartition / 785 Is Graph Bipartite benzeri',
  mode: 'stdin',
  statement: '<p>Pusula İK, şirket içi hackathon için N çalışanı <b>iki ekibe</b> ayıracak. M çift çalışan geçmişteki projelerde anlaşamamış; her çiftteki iki kişi <b>aynı ekipte olamaz</b>. Ekiplerin boyutları önemli değil (bir ekip boş da kalabilir).</p>\n<p>Böyle bir bölme mümkünse <code>EVET</code>, değilse <code>HAYIR</code> yaz.</p>',
  input: '<p>İlk satırda N ve M. Sonraki M satırda <code>a b</code> (a ≠ b).</p>',
  output: '<p><code>EVET</code> ya da <code>HAYIR</code>.</p>',
  constraints: '1 ≤ N ≤ 10^5, 0 ≤ M ≤ 2·10^5',
  samples: [
      { in: '4 3\n1 2\n1 3\n2 4\n', out: 'EVET\n', why: 'Ekip A: {1, 4}, ekip B: {2, 3}: EVET.' },
      { in: '3 3\n1 2\n2 3\n1 3\n', out: 'HAYIR\n', why: 'Üç kişilik çatışma üçgeni iki ekibe sığmaz: HAYIR.' }
  ],
  hidden: [
      { in: '1 0\n', out: 'EVET\n' },
      { in: '2 1\n1 2\n', out: 'EVET\n' },
      { in: '4 4\n1 2\n2 3\n3 4\n4 1\n', out: 'EVET\n' },
      { in: '5 5\n1 2\n2 3\n3 4\n4 5\n5 1\n', out: 'HAYIR\n' },
      { in: '6 3\n1 2\n3 4\n5 6\n', out: 'EVET\n' },
      { in: '6 4\n1 2\n2 3\n4 5\n5 6\n', out: 'EVET\n' },
      { gen: 'import random\nrandom.seed(189)\nn, m = 100000, 200000\nprint(n, m)\nout = []\nfor _ in range(m):\n    a = random.randint(1, n // 2) * 2\n    b = random.randint(1, n // 2) * 2 - 1\n    out.append(f\'{a} {b}\')\nprint(\'\\n\'.join(out))\n' },
      { gen: 'n = 100001\nprint(n, n)\nprint(\'\\n\'.join(f\'{i} {i + 1}\' for i in range(1, n)))\nprint(n, 1)\n' }
  ],
  start: 'import sys\nfrom collections import deque\nveri = sys.stdin.read().split()\nn, m = int(veri[0]), int(veri[1])\nkomsu = [[] for _ in range(n + 1)]\nrenk = [-1] * (n + 1)   # -1: atanmadı, 0/1: ekip\n',
  sol: 'import sys\nfrom collections import deque\nveri = sys.stdin.read().split()\nn, m = int(veri[0]), int(veri[1])\nkomsu = [[] for _ in range(n + 1)]\nfor i in range(m):\n    a, b = int(veri[2 + 2 * i]), int(veri[3 + 2 * i])\n    komsu[a].append(b)\n    komsu[b].append(a)\nrenk = [-1] * (n + 1)\nok = True\nfor s in range(1, n + 1):\n    if renk[s] != -1 or not ok:\n        continue\n    renk[s] = 0\n    q = deque([s])\n    while q and ok:\n        u = q.popleft()\n        for v in komsu[u]:\n            if renk[v] == -1:\n                renk[v] = 1 - renk[u]\n                q.append(v)\n            elif renk[v] == renk[u]:\n                ok = False\n                break\nprint(\'EVET\' if ok else \'HAYIR\')\n',
  editorial: '<p><b>Yaklaşım:</b> Çatışmaları kenar sayarsan soru "graf iki parçalı (bipartite) mı?" olur. Her bileşende BFS ile iki renk dağıt: başlangıca 0, her komşuya karşıt renk. Bir komşu zaten <b>aynı renkteyse</b> çelişki var: tek uzunluklu bir döngü bulundu, bölme imkânsız. Graf bağlı olmayabilir; her renksiz düğümden yeni BFS başlat.</p>\n<p><b>Karmaşıklık:</b> O(N + M).</p>\n<p><b>Naif çözüm neden yetmez:</b> Tüm 2^N ekip atamasını denemek, 10^5 kişide hayal bile edilemez. Açgözlü "sırayla gelen kişiyi uygun ekibe koy" yaklaşımı ise geri dönüş olmadan yanlış karar verebilir; BFS renklendirmesi bu yüzden zorunludur.</p>\n<p><b>Sık hata:</b> Yalnızca 1. düğümden BFS yapıp diğer bileşenleri atlamak (gizli testte çift sayılar ve tek sayılar ayrı gruplarda ve bazı kişiler izole), özyinelemeli DFS\'nin uzun zincirde (gizli testte 10^5 uzunluk) derinlik sınırını aşması.</p>',
  hints: ['Soru: graf iki renkle boyanabilir mi?', 'Her renksiz düğümden BFS; komşu aynı renkteyse HAYIR.']
},
{
  id: 'a-190',
  title: 'Sel suları çekilirken en erken geçiş',
  track: 'Graf',
  diff: 'Zor',
  pts: 60,
  tags: ['Dijkstra', 'minimax yol', 'ızgara', 'heap'],
  src: 'LeetCode 778 Swim in Rising Water benzeri',
  mode: 'stdin',
  statement: '<p>Pedal İzmir\'in sahil bölgesi N×N hücreli bir ızgara; her hücrenin yükseltisi e<sub>ij</sub> metre. Fırtınada su seviyesi zamanla <b>yükseliyor</b>: t anında su seviyesi t metre ve yalnızca yükseltisi ≤ t olan hücreler su altında, yani tekneyle geçilebilir durumda. Kurtarma teknesi sol üst köşeden sağ alt köşeye, yalnız su altındaki hücreler arasında dört yönlü ve anında hareket edebiliyor.</p>\n<p>Teknenin karşıya geçebileceği <b>en erken t</b> anını bul.</p>',
  input: '<p>İlk satırda N. Sonraki N satırda N yükselti.</p>',
  output: '<p>En küçük t.</p>',
  constraints: '1 ≤ N ≤ 300, 0 ≤ yükselti ≤ 10^6',
  samples: [
      { in: '2\n0 2\n1 3\n', out: '3\n', why: 'Bitiş hücresinin kendisi 3 metre: en erken t = 3.' },
      { in: '5\n0 1 2 3 4\n24 23 22 21 5\n12 13 14 15 16\n11 17 18 19 20\n10 9 8 7 6\n', out: '16\n', why: 'Dış çevreden dolaşan yolun en yüksek hücresi 16: t = 16.' }
  ],
  hidden: [
      { in: '1\n7\n', out: '7\n' },
      { in: '2\n5 1\n1 0\n', out: '5\n' },
      { in: '3\n0 9 0\n0 9 0\n0 0 0\n', out: '0\n' },
      { in: '3\n1 1 1\n9 9 1\n1 1 1\n', out: '1\n' },
      { in: '3\n4 4 4\n4 4 4\n4 4 4\n', out: '4\n' },
      { gen: 'import random\nrandom.seed(190)\nn = 300\nprint(n)\nfor _ in range(n):\n    print(*[random.randint(0, 10**6) for _ in range(n)])\n' },
      { gen: 'n = 300\nprint(n)\nfor i in range(n):\n    print(*[(i * n + (j if i % 2 == 0 else n - 1 - j)) for j in range(n)])\n' }
  ],
  start: 'import sys\nimport heapq\nveri = sys.stdin.read().split()\nn = int(veri[0])\ne = [list(map(int, veri[1 + i * n:1 + (i + 1) * n])) for i in range(n)]\n# heap\'te (yol üzerindeki en yüksek yükselti, satır, sütun)\n',
  sol: 'import sys\nimport heapq\nveri = sys.stdin.read().split()\nn = int(veri[0])\ne = [list(map(int, veri[1 + i * n:1 + (i + 1) * n])) for i in range(n)]\ngorildu = [[False] * n for _ in range(n)]\nheap = [(e[0][0], 0, 0)]\ngorildu[0][0] = True\nwhile heap:\n    t, x, y = heapq.heappop(heap)\n    if x == n - 1 and y == n - 1:\n        print(t)\n        break\n    for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):\n        if 0 <= nx < n and 0 <= ny < n and not gorildu[nx][ny]:\n            gorildu[nx][ny] = True\n            v = e[nx][ny]\n            heapq.heappush(heap, (t if t > v else v, nx, ny))\n',
  editorial: '<p><b>Yaklaşım:</b> Bir yolun geçilebildiği en erken an, yol üzerindeki <b>en yüksek</b> hücredir. Bu en yüksek değeri en küçük yapan yolu arıyoruz (minimax yol). Dijkstra\'nın bir çeşidi: heap\'te (o hücreye ulaşan yolun maksimum yükseltisi, hücre) tut; her seferinde en küçük değerli hücreyi çıkar, komşulara <code>max(t, e[komşu])</code> değeriyle geç. Hedef heap\'ten çıktığı anda değeri kesindir. Burada her hücreyi kuyruğa eklerken işaretlemek güvenlidir, çünkü heap değerleri maksimumla tanımlı ve monoton artar ("Prim benzeri" genişleme).</p>\n<p><b>Karmaşıklık:</b> O(N² log N²).</p>\n<p><b>Alternatifler:</b> (1) t üzerinde ikili arama + her t için BFS: O(N² log(max e)). (2) Hücreleri yükseltiye göre sırala, union-find ile sırayla "su altına al", başlangıç ve bitiş aynı bileşene düştüğü an cevap.</p>\n<p><b>Naif çözüm neden yetmez:</b> t\'yi 0\'dan başlayıp birer artırarak her seferinde BFS yapmak O(max e · N²) = 10^6 × 9·10^4 — imkânsız. DFS ile tüm yolları denemek üsteldir.</p>\n<p><b>Sık hata:</b> Yol uzunluğunu (toplamı) minimize etmek: burada toplam değil maksimum önemli. Ayrıca başlangıç hücresinin kendi yükseltisini hesaba katmamak.</p>',
  hints: ['Bir yolun maliyeti, üzerindeki en yüksek hücredir.', 'Dijkstra gibi ilerle ama toplam yerine max(t, e[komşu]) kullan.']
}
); })(window);
