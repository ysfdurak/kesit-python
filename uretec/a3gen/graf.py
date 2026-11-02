from build import D

T = 'Graf'
P = []


def grid(r, R, C, chars):
    return ''.join(''.join(r.choice(chars) for _ in range(C)) + '\n' for _ in range(R))


def edges(r, n, m, w=None, directed=False, allow_dup=True):
    out = []
    seen = set()
    while len(out) < m:
        a, b = r.randint(1, n), r.randint(1, n)
        if a == b:
            continue
        key = (a, b) if directed else (min(a, b), max(a, b))
        if not allow_dup and key in seen:
            if len(seen) >= (n * (n - 1) // (1 if directed else 2)):
                break
            continue
        seen.add(key)
        out.append(f'{a} {b}' + (f' {r.randint(*w)}' if w else ''))
    return out


# ---------------------------------------------------------------- a-179
P.append(dict(
    id='a-179', title='Depo planındaki dolu raf blokları', track=T, diff='Kolay',
    tags=['ızgara', 'BFS', 'DFS', 'bileşen'], src='LeetCode 200 Number of Islands benzeri',
    statement=D('''
        <p>Anadolu Market\'in depo kat planı R×C ızgara olarak tutuluyor: <code>1</code> dolu raf, <code>0</code> boş koridor. Yatay ya da dikey komşu dolu hücreler aynı <b>raf bloğuna</b> aittir (çapraz komşuluk sayılmaz).</p>
        <p>Depoda kaç ayrı raf bloğu olduğunu bul.</p>'''),
    input='<p>İlk satırda R ve C. Sonraki R satırda C karakterlik <code>0/1</code> dizileri.</p>',
    output='<p>Blok sayısı.</p>',
    constraints='1 ≤ R, C ≤ 500',
    samples=[('4 5\n11000\n11000\n00100\n00011\n', 'Sol üstte 4 hücrelik blok, ortada tek hücre, sağ altta 2 hücre: 3 blok.'),
             ('3 3\n101\n010\n101\n', 'Çaprazlar bağlı sayılmaz: 5 ayrı blok.')],
    hidden=['1 1\n0\n', '1 1\n1\n', '2 3\n111\n111\n', '3 4\n1001\n0000\n1001\n', '5 5\n11111\n10001\n10101\n10001\n11111\n',
            {'gen': D('''
                import random
                random.seed(179)
                print(500, 500)
                for _ in range(500):
                    print(''.join(random.choice('0011') for _ in range(500)))
                ''')},
            {'gen': D('''
                print(500, 500)
                for i in range(500):
                    if i % 2 == 0:
                        print('1' * 500)
                    elif i % 4 == 1:
                        print('0' * 499 + '1')
                    else:
                        print('1' + '0' * 499)
                ''')}],
    start=D('''
        import sys
        from collections import deque
        satirlar = sys.stdin.read().split()
        r, c = int(satirlar[0]), int(satirlar[1])
        g = [list(s) for s in satirlar[2:2 + r]]
        blok = 0
        # her ziyaret edilmemiş 1 için BFS başlat ve bloğu işaretle
        '''),
    sol=D('''
        import sys
        from collections import deque
        satirlar = sys.stdin.read().split()
        r, c = int(satirlar[0]), int(satirlar[1])
        g = [list(s) for s in satirlar[2:2 + r]]
        blok = 0
        for i in range(r):
            for j in range(c):
                if g[i][j] == '1':
                    blok += 1
                    g[i][j] = '0'
                    q = deque([(i, j)])
                    while q:
                        x, y = q.popleft()
                        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                            if 0 <= nx < r and 0 <= ny < c and g[nx][ny] == '1':
                                g[nx][ny] = '0'
                                q.append((nx, ny))
        print(blok)
        '''),
    brute=D('''
        import sys
        s = sys.stdin.read().split(); r, c = int(s[0]), int(s[1]); g = s[2:2+r]
        par = {}
        def f(x):
            while par[x] != x: x = par[x]
            return x
        for i in range(r):
            for j in range(c):
                if g[i][j] == '1': par[(i, j)] = (i, j)
        for (i, j) in list(par):
            for n in ((i+1, j), (i, j+1)):
                if n in par: par[f(n)] = f((i, j))
        print(len({f(k) for k in par}))
        '''),
    rnd=lambda r: (lambda R, C: f"{R} {C}\n" + grid(r, R, C, '01'))(r.randint(1, 6), r.randint(1, 6)),
    editorial=D('''
        <p><b>Yaklaşım:</b> Izgarayı bir graf gibi düşün: her dolu hücre bir düğüm, dört yönlü komşular kenar. Soldan sağa, yukarıdan aşağı gez; henüz ziyaret edilmemiş bir <code>1</code> bulduğunda yeni bir blok başlat ve BFS (ya da yığınla DFS) ile o bloğa ait tüm hücreleri işaretle (burada <code>0</code> yaparak). Başlatılan BFS sayısı cevaptır.</p>
        <p><b>Karmaşıklık:</b> Her hücre en fazla bir kez kuyruğa girer: O(R · C).</p>
        <p><b>Naif çözüm neden yetmez:</b> Her dolu hücre için "başka bir dolu hücreye bağlı mı?" diye tüm ızgarayı yeniden taramak O((R·C)²). Özyinelemeli DFS ise doğru ama gizli testteki yılan biçimli 500×500 blokta derinlik 10^5\'i aşar ve <code>RecursionError</code> verir; bu yüzden açık kuyruk/yığın kullan.</p>
        <p><b>Sık hata:</b> Hücreyi kuyruktan çıkarırken işaretlemek: aynı hücre birden çok kez kuyruğa girer. Kuyruğa <b>eklerken</b> işaretle.</p>'''),
    hints=['Her yeni 1 bir blok başlatır; komşularını BFS ile işaretle.', 'Hücreyi kuyruğa eklerken işaretle; özyineleme yerine deque kullan.']))

# ---------------------------------------------------------------- a-180
P.append(dict(
    id='a-180', title='İki istasyon arasında bisiklet yolu var mı?', track=T, diff='Kolay',
    tags=['BFS', 'komşuluk listesi'], src='LeetCode 1971 Find if Path Exists in Graph benzeri',
    statement=D('''
        <p>Pedal İzmir\'in N istasyonu, iki yönlü M bisiklet yoluyla bağlı. Bir kullanıcı S istasyonundan bisiklet alıp yalnız bisiklet yollarını kullanarak T istasyonuna gitmek istiyor.</p>
        <p>Mümkünse <code>EVET</code>, değilse <code>HAYIR</code> yaz.</p>'''),
    input='<p>İlk satırda N, M, S, T. Sonraki M satırda <code>a b</code> (iki yönlü yol).</p>',
    output='<p><code>EVET</code> ya da <code>HAYIR</code>.</p>',
    constraints='1 ≤ N ≤ 10^5, 0 ≤ M ≤ 2·10^5, 1 ≤ S, T ≤ N',
    samples=[('6 4 1 4\n1 2\n2 3\n3 4\n5 6\n', '1 → 2 → 3 → 4: EVET.'),
             ('6 4 1 6\n1 2\n2 3\n3 4\n5 6\n', '6 yalnız 5\'e bağlı: HAYIR.')],
    hidden=['1 0 1 1\n', '2 0 1 2\n', '2 1 2 1\n1 2\n', '4 2 1 4\n1 2\n3 4\n', '5 4 5 1\n1 2\n2 3\n3 4\n4 5\n',
            {'gen': D('''
                n = 100000
                print(n, n - 1, 1, n)
                print('\\n'.join(f'{i} {i + 1}' for i in range(1, n)))
                ''')},
            {'gen': D('''
                import random
                random.seed(180)
                n, m = 100000, 200000
                print(n, m, 1, 2)
                out = []
                for _ in range(m):
                    a = random.randint(1, n // 2) * 2 - 1
                    b = random.randint(1, n // 2) * 2 - 1
                    out.append(f'{a} {b}')
                print('\\n'.join(out))
                ''')}],
    start=D('''
        import sys
        from collections import deque
        veri = sys.stdin.read().split()
        n, m, s, t = map(int, veri[:4])
        komsu = [[] for _ in range(n + 1)]
        # kenarları ekle, S'den BFS yap
        '''),
    sol=D('''
        import sys
        from collections import deque
        veri = sys.stdin.read().split()
        n, m, s, t = map(int, veri[:4])
        komsu = [[] for _ in range(n + 1)]
        for i in range(m):
            a, b = int(veri[4 + 2 * i]), int(veri[5 + 2 * i])
            komsu[a].append(b)
            komsu[b].append(a)
        gorildu = [False] * (n + 1)
        gorildu[s] = True
        q = deque([s])
        while q:
            u = q.popleft()
            for v in komsu[u]:
                if not gorildu[v]:
                    gorildu[v] = True
                    q.append(v)
        print('EVET' if gorildu[t] else 'HAYIR')
        '''),
    brute=D('''
        import sys
        v = sys.stdin.read().split(); n, m, s, t = map(int, v[:4])
        E = [(int(v[4+2*i]), int(v[5+2*i])) for i in range(m)]
        R = {s}
        for _ in range(n):
            for a, b in E:
                if a in R or b in R: R |= {a, b}
        print('EVET' if t in R else 'HAYIR')
        '''),
    rnd=lambda r: (lambda n: (lambda m: f"{n} {m} {r.randint(1, n)} {r.randint(1, n)}\n" + ''.join(f"{r.randint(1, n)} {r.randint(1, n)}\n" for _ in range(m)))(r.randint(0, 6)))(r.randint(1, 7)),
    editorial=D('''
        <p><b>Yaklaşım:</b> Grafı komşuluk listesiyle kur (her yol iki yöne eklenir). S\'den BFS başlat; ziyaret edilen her düğümü işaretle. Sonunda T işaretliyse yol vardır. (Erken çıkış: T kuyruğa girdiği an durabilirsin.) Union-find da bu soru için uygundur.</p>
        <p><b>Karmaşıklık:</b> O(N + M) zaman ve bellek.</p>
        <p><b>Naif çözüm neden yetmez:</b> "Ulaşılabilir kümeyi, değişmeyene dek tüm kenarları tarayarak genişlet" yaklaşımı her turda M kenarı gezer ve zincir biçimli grafta N tur sürer: O(N · M) = 2·10^10. Komşuluk matrisi ise N² = 10^10 hücre bellek ister.</p>
        <p><b>Sık hata:</b> Yolları tek yönlü eklemek, S = T durumunu unutmak (cevap EVET) ve özyinelemeli DFS\'nin 10^5 uzunluğundaki zincirde özyineleme sınırına takılması.</p>'''),
    hints=['Komşuluk listesi kur; yolları iki yöne de ekle.', 'S\'den BFS yap ve T\'nin ziyaret edilip edilmediğine bak.']))

# ---------------------------------------------------------------- a-181
P.append(dict(
    id='a-181', title='Depo robotu için en kısa rota', track=T, diff='Orta',
    tags=['BFS', 'ızgara', 'en kısa yol'], src='LeetCode 1091 Shortest Path in Binary Matrix / klasik labirent BFS',
    statement=D('''
        <p>Anadolu Market\'in otomatik deposunda bir robot <code>S</code> hücresinden <code>E</code> hücresindeki paketleme istasyonuna gidecek. Izgarada <code>#</code> duvar/raf, <code>.</code> boş koridor. Robot her adımda yukarı, aşağı, sola ya da sağa bir hücre ilerler.</p>
        <p>En az adım sayısını yaz; ulaşılamıyorsa <code>-1</code>.</p>'''),
    input='<p>İlk satırda R ve C. Sonraki R satırda ızgara (tam bir <code>S</code> ve bir <code>E</code> var).</p>',
    output='<p>En az adım sayısı ya da −1.</p>',
    constraints='1 ≤ R, C ≤ 500',
    samples=[('4 5\nS.#..\n.##.#\n...#E\n.#...\n', 'S\'den aşağı inip alttaki koridordan dolaşarak E\'ye 11 adımda ulaşılır.'),
             ('3 3\nS#.\n##.\n..E\n', 'S tamamen kapalı: −1.')],
    hidden=['1 2\nSE\n', '2 1\nE\nS\n', '1 3\nS#E\n', '3 3\nS..\n.#.\n..E\n', '5 5\nS....\n####.\n.....\n.####\n....E\n',
            {'gen': D('''
                r = c = 500
                print(r, c)
                for i in range(r):
                    if i % 2 == 1:
                        row = ['#'] * c
                        row[c - 1 if i % 4 == 1 else 0] = '.'
                    else:
                        row = ['.'] * c
                    if i == 0:
                        row[0] = 'S'
                    if i == r - 1:
                        row[c - 1] = 'E'
                    print(''.join(row))
                ''')},
            {'gen': D('''
                import random
                random.seed(181)
                r = c = 500
                g = [['#' if random.random() < 0.3 else '.' for _ in range(c)] for _ in range(r)]
                g[0][0] = 'S'
                g[r - 1][c - 1] = 'E'
                print(r, c)
                for row in g:
                    print(''.join(row))
                ''')}],
    start=D('''
        import sys
        from collections import deque
        satirlar = sys.stdin.read().split()
        r, c = int(satirlar[0]), int(satirlar[1])
        g = satirlar[2:2 + r]
        # S ve E'yi bul, S'den BFS ile mesafe hesapla
        '''),
    sol=D('''
        import sys
        from collections import deque
        satirlar = sys.stdin.read().split()
        r, c = int(satirlar[0]), int(satirlar[1])
        g = satirlar[2:2 + r]
        for i in range(r):
            for j in range(c):
                if g[i][j] == 'S':
                    s = (i, j)
                elif g[i][j] == 'E':
                    e = (i, j)
        mesafe = [[-1] * c for _ in range(r)]
        mesafe[s[0]][s[1]] = 0
        q = deque([s])
        while q:
            x, y = q.popleft()
            if (x, y) == e:
                break
            d = mesafe[x][y] + 1
            for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if 0 <= nx < r and 0 <= ny < c and g[nx][ny] != '#' and mesafe[nx][ny] < 0:
                    mesafe[nx][ny] = d
                    q.append((nx, ny))
        print(mesafe[e[0]][e[1]])
        '''),
    brute=D('''
        import sys
        s = sys.stdin.read().split(); r, c = int(s[0]), int(s[1]); g = s[2:2+r]
        INF = 10**9; D = [[INF]*c for _ in range(r)]
        for i in range(r):
            for j in range(c):
                if g[i][j] == 'S': D[i][j] = 0
        for _ in range(r*c):
            for i in range(r):
                for j in range(c):
                    if g[i][j] == '#': continue
                    for a, b in ((i+1, j), (i-1, j), (i, j+1), (i, j-1)):
                        if 0 <= a < r and 0 <= b < c: D[i][j] = min(D[i][j], D[a][b] + 1)
        for i in range(r):
            for j in range(c):
                if g[i][j] == 'E': print(D[i][j] if D[i][j] < INF else -1)
        '''),
    rnd=lambda r: (lambda R, C: (lambda g: (lambda cells: (g.__setitem__(cells[0][0], g[cells[0][0]][:cells[0][1]] + 'S' + g[cells[0][0]][cells[0][1] + 1:]), g.__setitem__(cells[1][0], g[cells[1][0]][:cells[1][1]] + 'E' + g[cells[1][0]][cells[1][1] + 1:]), f"{R} {C}\n" + '\n'.join(g) + '\n')[-1])(r.sample([(i, j) for i in range(R) for j in range(C)], 2)))([''.join(r.choice('..#') for _ in range(C)) for _ in range(R)]))(r.randint(1, 5), r.randint(2, 5)),
    editorial=D('''
        <p><b>Yaklaşım:</b> Ağırlıksız grafta (her adım 1) en kısa yol BFS ile bulunur: BFS düğümleri başlangıçtan uzaklık sırasıyla ziyaret eder, bu yüzden bir hücreye ilk ulaşıldığında bulunan mesafe en kısadır. Mesafe matrisini −1 ile başlat; komşu boş ve ziyaret edilmemişse mesafesini yaz ve kuyruğa ekle. E\'ye ulaşınca durabilirsin.</p>
        <p><b>Karmaşıklık:</b> O(R · C) zaman ve bellek.</p>
        <p><b>Naif çözüm neden yetmez:</b> DFS ile tüm yolları deneyip en kısasını seçmek üsteldir (açık bir ızgarada yol sayısı astronomik). "Mesafeler değişmeyene dek tüm hücreleri güncelle" (Bellman–Ford benzeri) O((R·C)²); gizli testteki 500×500 yılan labirentte 6·10^10 adım.</p>
        <p><b>Sık hata:</b> <code>deque</code> yerine liste ve <code>pop(0)</code> kullanmak (O(n) çıkarma) ve ziyaret işaretini kuyruktan çıkarırken koymak.</p>'''),
    hints=['Her adım 1 birim: BFS en kısa yolu verir.', 'Mesafe matrisini −1 ile başlat; −1 olan hücre ziyaret edilmemiştir.']))

# ---------------------------------------------------------------- a-182
P.append(dict(
    id='a-182', title='Soğuk zincirde bozulmanın yayılması', track=T, diff='Orta',
    tags=['çok kaynaklı BFS', 'ızgara'], src='LeetCode 994 Rotting Oranges benzeri',
    statement=D('''
        <p>Anadolu Market\'in soğuk hava deposunda bir elektrik kesintisi oldu. Raf ızgarasında her hücre: <code>0</code> boş, <code>1</code> sağlam ürün, <code>2</code> bozulmuş ürün. Her dakika, bozulmuş bir ürünün yatay/dikey komşusu olan sağlam ürünler de bozuluyor.</p>
        <p>Tüm ürünlerin bozulması için geçen dakikayı yaz. Hiç bozulmayacak sağlam ürün kalıyorsa <code>-1</code>, başta hiç sağlam ürün yoksa <code>0</code> yaz.</p>'''),
    input='<p>İlk satırda R ve C. Sonraki R satırda C karakterlik <code>0/1/2</code> dizileri.</p>',
    output='<p>Dakika sayısı ya da −1.</p>',
    constraints='1 ≤ R, C ≤ 500',
    samples=[('3 3\n211\n110\n011\n', 'Bozulma köşeden yayılır; sağ alttaki ürün 4. dakikada bozulur.'),
             ('3 3\n211\n011\n101\n', 'Sol alttaki ürün hiçbir bozuk ürüne komşu olamıyor: −1.')],
    hidden=['1 1\n0\n', '1 1\n1\n', '1 1\n2\n', '1 3\n202\n', '2 4\n2111\n1112\n', '3 3\n000\n010\n002\n',
            {'gen': D('''
                print(500, 500)
                print('2' + '1' * 499)
                for _ in range(499):
                    print('1' * 500)
                ''')},
            {'gen': D('''
                import random
                random.seed(182)
                print(500, 500)
                for _ in range(500):
                    print(''.join(random.choice('11111110') if random.random() > 0.0005 else '2' for _ in range(500)))
                ''')}],
    start=D('''
        import sys
        from collections import deque
        satirlar = sys.stdin.read().split()
        r, c = int(satirlar[0]), int(satirlar[1])
        g = [list(s) for s in satirlar[2:2 + r]]
        q = deque()
        saglam = 0
        # tüm bozuk hücreleri aynı anda kuyruğa koy (çok kaynaklı BFS)
        '''),
    sol=D('''
        import sys
        from collections import deque
        satirlar = sys.stdin.read().split()
        r, c = int(satirlar[0]), int(satirlar[1])
        g = [list(s) for s in satirlar[2:2 + r]]
        q = deque()
        saglam = 0
        for i in range(r):
            for j in range(c):
                if g[i][j] == '2':
                    q.append((i, j, 0))
                elif g[i][j] == '1':
                    saglam += 1
        dakika = 0
        while q:
            x, y, t = q.popleft()
            dakika = t
            for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if 0 <= nx < r and 0 <= ny < c and g[nx][ny] == '1':
                    g[nx][ny] = '2'
                    saglam -= 1
                    q.append((nx, ny, t + 1))
        print(dakika if saglam == 0 else -1)
        '''),
    brute=D('''
        import sys
        s = sys.stdin.read().split(); r, c = int(s[0]), int(s[1]); g = [list(x) for x in s[2:2+r]]; t = 0
        while True:
            yeni = [(i, j) for i in range(r) for j in range(c) if g[i][j] == '1' and any(0 <= a < r and 0 <= b < c and g[a][b] == '2' for a, b in ((i+1, j), (i-1, j), (i, j+1), (i, j-1)))]
            if not yeni: break
            for i, j in yeni: g[i][j] = '2'
            t += 1
        print(-1 if any('1' in row for row in g) else t)
        '''),
    rnd=lambda r: (lambda R, C: f"{R} {C}\n" + grid(r, R, C, '0112'))(r.randint(1, 5), r.randint(1, 5)),
    editorial=D('''
        <p><b>Yaklaşım:</b> Çok kaynaklı BFS. Başlangıçtaki <b>tüm</b> bozuk hücreleri 0. dakika olarak aynı anda kuyruğa koy. BFS seviye seviye ilerlediği için bir sağlam ürüne ilk ulaşıldığı dakika, onun bozulduğu dakikadır. Sağlam sayısını tut; her bozulmada azalt. Kuyruktan çıkan son dakika cevaptır; sonda sağlam kalırsa −1.</p>
        <p><b>Karmaşıklık:</b> O(R · C).</p>
        <p><b>Naif çözüm neden yetmez:</b> Dakika dakika tüm ızgarayı tarayıp yeni bozulanları bulmak, her dakika O(R·C) iş yapar; gizli testte tek köşeden yayılma 998 dakika sürer: ~2,5·10^8 hücre kontrolü (ayrıca her biri 4 komşu). Her bozuk hücreden ayrı ayrı BFS yapmak da O((R·C)²) olabilir.</p>
        <p><b>Sık hata:</b> Başta hiç sağlam ürün yokken 0 yerine −1 yazmak ve aynı dakikada bozulanları bir sonraki dakikada değil aynı tur içinde yaymaya devam etmek (kuyruğa dakika bilgisini koy).</p>'''),
    hints=['Tüm bozuk hücrelerden aynı anda başlayan BFS.', 'Sağlam ürün sayacını tut; sonda sıfır değilse −1.']))

# ---------------------------------------------------------------- a-183
P.append(dict(
    id='a-183', title='Eğitim programının önkoşul sırası', track=T, diff='Orta',
    tags=['topolojik sıralama', 'Kahn', 'heap'], src='LeetCode 210 Course Schedule II benzeri',
    statement=D('''
        <p>Pusula İK\'nın yeni çalışan eğitim programında 1\'den N\'ye numaralı modüller var. Bazı modüllerin önkoşulu var: <code>a b</code> satırı "a, b\'den önce tamamlanmalı" demek. Her an önkoşulları tamamlanmış modüller arasından <b>numarası en küçük olan</b> alınır.</p>
        <p>Bu kurala göre modüllerin alınma sırasını yaz. Önkoşullar döngü içeriyorsa (sıra imkânsızsa) <code>IMKANSIZ</code> yaz.</p>'''),
    input='<p>İlk satırda N ve M. Sonraki M satırda <code>a b</code>.</p>',
    output='<p>Tek satırda N modül numarası ya da <code>IMKANSIZ</code>.</p>',
    constraints='1 ≤ N ≤ 10^5, 0 ≤ M ≤ 2·10^5',
    samples=[('4 3\n2 1\n2 3\n3 4\n', '2 önkoşulsuz, diğerleri ona bağlı: 2, sonra en küçük uygun 1, sonra 3, 4.'),
             ('3 3\n1 2\n2 3\n3 1\n', '1 → 2 → 3 → 1 döngüsü: IMKANSIZ.')],
    hidden=['1 0\n', '3 0\n', '2 1\n2 1\n', '2 2\n1 2\n2 1\n', '5 4\n5 4\n4 3\n3 2\n2 1\n', '6 6\n1 4\n2 4\n3 5\n4 6\n5 6\n1 2\n',
            {'gen': D('''
                import random
                random.seed(183)
                n, m = 100000, 200000
                perm = list(range(1, n + 1))
                random.shuffle(perm)
                pos = {v: i for i, v in enumerate(perm)}
                print(n, m)
                out = []
                for _ in range(m):
                    a, b = random.sample(perm, 2)
                    if pos[a] > pos[b]:
                        a, b = b, a
                    out.append(f'{a} {b}')
                print('\\n'.join(out))
                ''')},
            {'gen': D('''
                n = 100000
                print(n, n)
                print('\\n'.join(f'{i} {i + 1}' for i in range(1, n)))
                print(n, 50000)
                ''')}],
    start=D('''
        import sys
        import heapq
        veri = sys.stdin.read().split()
        n, m = int(veri[0]), int(veri[1])
        sonraki = [[] for _ in range(n + 1)]
        giris = [0] * (n + 1)   # her modülün bekleyen önkoşul sayısı
        '''),
    sol=D('''
        import sys
        import heapq
        veri = sys.stdin.read().split()
        n, m = int(veri[0]), int(veri[1])
        sonraki = [[] for _ in range(n + 1)]
        giris = [0] * (n + 1)
        for i in range(m):
            a, b = int(veri[2 + 2 * i]), int(veri[3 + 2 * i])
            sonraki[a].append(b)
            giris[b] += 1
        hazir = [v for v in range(1, n + 1) if giris[v] == 0]
        heapq.heapify(hazir)
        sira = []
        while hazir:
            u = heapq.heappop(hazir)
            sira.append(u)
            for v in sonraki[u]:
                giris[v] -= 1
                if giris[v] == 0:
                    heapq.heappush(hazir, v)
        print(' '.join(map(str, sira)) if len(sira) == n else 'IMKANSIZ')
        '''),
    brute=D('''
        import sys
        v = sys.stdin.read().split(); n, m = int(v[0]), int(v[1])
        E = [(int(v[2+2*i]), int(v[3+2*i])) for i in range(m)]
        done = []; S = set()
        while len(done) < n:
            ok = [x for x in range(1, n+1) if x not in S and all(a in S for a, b in E if b == x)]
            if not ok: print('IMKANSIZ'); raise SystemExit
            done.append(min(ok)); S.add(min(ok))
        print(*done)
        '''),
    rnd=lambda r: (lambda n: (lambda m: f"{n} {m}\n" + ''.join(f"{r.randint(1, n)} {r.randint(1, n)}\n" for _ in range(m)))(r.randint(0, 6)))(r.randint(1, 6)),
    editorial=D('''
        <p><b>Yaklaşım (Kahn algoritması):</b> Her modülün giriş derecesini (bekleyen önkoşul sayısı) hesapla. Derecesi 0 olanlar alınmaya hazırdır. "En küçük numaralı" kuralı için hazır modülleri bir <b>min-heap</b>\'te tut. Heap\'ten çıkardığın modülü sıraya ekle ve onu önkoşul olarak bekleyenlerin derecesini azalt; 0\'a düşeni heap\'e koy. Sonda sırada N modül yoksa kalanlar bir döngü içindedir: IMKANSIZ.</p>
        <p><b>Karmaşıklık:</b> O((N + M) log N); heap yerine sıradan kuyruk kullansaydın (sözlükçe kural olmadan) O(N + M).</p>
        <p><b>Naif çözüm neden yetmez:</b> Her adımda tüm modülleri tarayıp "önkoşulları bitmiş en küçük modül"ü aramak O(N · (N + M)) — 10^5 modülde 10^10. Tüm permütasyonları denemek ise faktöriyel.</p>
        <p><b>Sık hata:</b> Kenar yönünü ters kurmak (a → b, a önce), aynı önkoşul satırı iki kez gelirse dereceyi bir kez saymak (iki kez saymak doğru; azaltırken de iki kez azalır) ve döngü kontrolünü unutmak. <b>Alternatif:</b> DFS tabanlı topolojik sıralama da döngüyü (gri düğüm) yakalar ama sözlükçe en küçük sırayı doğal olarak vermez.</p>'''),
    hints=['Giriş derecesi 0 olanlar hazırdır.', 'Hazırları min-heap\'te tut; sırada N modül yoksa döngü var.']))

# ---------------------------------------------------------------- a-184
P.append(dict(
    id='a-184', title='Bisiklet ağında döngü var mı?', track=T, diff='Orta',
    tags=['union-find', 'döngü tespiti', 'yönsüz graf'], src='LeetCode 684 Redundant Connection / Graph Valid Tree benzeri',
    statement=D('''
        <p>Pedal İzmir, yeni bisiklet yolu ağını maliyet nedeniyle <b>döngüsüz</b> (orman yapısında) kurmak istiyor: iki istasyon arasında birden fazla güzergâh olmamalı. Yollar sırayla planlanıyor ve plan ekibi, döngü oluşturan <b>ilk</b> yolu bulmak istiyor.</p>
        <p>Döngü oluşturan ilk yolun sıra numarasını (1\'den başlayarak) yaz; hiçbir yol döngü oluşturmuyorsa <code>0</code> yaz.</p>'''),
    input='<p>İlk satırda N ve M. Sonraki M satırda <code>a b</code> (a ≠ b, iki yönlü). Aynı iki istasyon arasında ikinci bir yol da döngü sayılır.</p>',
    output='<p>Sıra numarası ya da 0.</p>',
    constraints='2 ≤ N ≤ 10^5, 1 ≤ M ≤ 2·10^5',
    samples=[('4 4\n1 2\n2 3\n3 4\n4 1\n', '4. yol 4 ile 1\'i bağlıyor; ikisi zaten 1-2-3-4 üzerinden bağlı: 4.'),
             ('5 3\n1 2\n3 4\n4 5\n', 'Ağ bir orman: 0.')],
    hidden=['2 1\n1 2\n', '2 2\n1 2\n2 1\n', '3 3\n1 2\n1 3\n2 3\n', '6 5\n1 2\n3 4\n5 6\n2 3\n4 5\n', '5 5\n1 2\n3 4\n1 3\n2 4\n1 5\n',
            {'gen': D('''
                import random
                random.seed(184)
                n = 100000
                kenar = [(random.randint(1, i - 1), i) for i in range(2, n + 1)]
                random.shuffle(kenar)
                print(n, n)
                print('\\n'.join(f'{a} {b}' for a, b in kenar))
                print(1, n)
                ''')},
            {'gen': D('''
                n = 100000
                print(n, n - 1)
                print('\\n'.join(f'{i} {i + 1}' for i in range(1, n)))
                ''')}],
    start=D('''
        import sys
        veri = sys.stdin.read().split()
        n, m = int(veri[0]), int(veri[1])
        ebeveyn = list(range(n + 1))

        def bul(x):
            pass
        '''),
    sol=D('''
        import sys
        veri = sys.stdin.read().split()
        n, m = int(veri[0]), int(veri[1])
        ebeveyn = list(range(n + 1))

        def bul(x):
            kok = x
            while ebeveyn[kok] != kok:
                kok = ebeveyn[kok]
            while ebeveyn[x] != kok:
                ebeveyn[x], x = kok, ebeveyn[x]
            return kok

        cevap = 0
        for i in range(m):
            a, b = bul(int(veri[2 + 2 * i])), bul(int(veri[3 + 2 * i]))
            if a == b:
                cevap = i + 1
                break
            ebeveyn[a] = b
        print(cevap)
        '''),
    brute=D('''
        import sys
        v = sys.stdin.read().split(); n, m = int(v[0]), int(v[1]); adj = {i: [] for i in range(1, n+1)}
        for i in range(m):
            a, b = int(v[2+2*i]), int(v[3+2*i])
            S = {a}; st = [a]
            while st:
                u = st.pop()
                for w in adj[u]:
                    if w not in S: S.add(w); st.append(w)
            if b in S: print(i+1); raise SystemExit
            adj[a].append(b); adj[b].append(a)
        print(0)
        '''),
    rnd=lambda r: (lambda n: (lambda m: f"{n} {m}\n" + ''.join((lambda a: f"{a} {r.choice([x for x in range(1, n + 1) if x != a])}\n")(r.randint(1, n)) for _ in range(m)))(r.randint(1, 6)))(r.randint(2, 7)),
    editorial=D('''
        <p><b>Yaklaşım:</b> Yönsüz grafta bir kenar, iki ucu <b>zaten aynı bileşendeyse</b> döngü oluşturur. Union-find ile yolları sırayla ekle: önce iki ucun köklerini bul; aynıysa bu yol ilk döngü yoludur, değilse bileşenleri birleştir.</p>
        <p><b>Karmaşıklık:</b> Yol sıkıştırmayla kenar başına neredeyse O(1); toplam O(N + M).</p>
        <p><b>Naif çözüm neden yetmez:</b> Her yeni yoldan önce a\'dan b\'ye DFS/BFS ile yol var mı diye bakmak, kenar başına O(N + M): gizli testteki 10^5 kenarlı ağaçta ~10^10 adım. (Tek seferlik "döngü var mı?" sorusu için tek bir DFS yeterdi; ama "ilk döngü kenarı" sorusu artımlı yapı ister.)</p>
        <p><b>Sık hata:</b> Özyinelemeli <code>bul</code> (zincir girdide derinlik 10^5), çift kenarı (aynı iki istasyon) gözden kaçırmak ve yönlü graflarda bu yöntemi kullanmak: yönlü döngü tespiti için DFS renklendirme ya da Kahn algoritması gerekir (a-183).</p>'''),
    hints=['Bir yolun iki ucu zaten bağlıysa o yol döngü oluşturur.', 'Union-find ile her yoldan önce kökleri karşılaştır.']))

# ---------------------------------------------------------------- a-185
P.append(dict(
    id='a-185', title='Duyurunun tüm havalimanlarına ulaşma süresi', track=T, diff='Orta',
    tags=['Dijkstra', 'heap', 'en kısa yol'], src='LeetCode 743 Network Delay Time benzeri',
    statement=D('''
        <p>Kanat Havayolları\'nın operasyon merkezi K numaralı havalimanından acil bir duyuru yayınlıyor. Duyuru, havalimanları arasındaki <b>tek yönlü</b> veri hatlarıyla yayılıyor; u\'dan v\'ye hattın gecikmesi w dakika. Her havalimanı duyuruyu ilk aldığı anda tüm çıkış hatlarına iletiyor.</p>
        <p>Duyurunun <b>tüm</b> N havalimanına ulaşması kaç dakika sürer? Ulaşamayan havalimanı varsa <code>-1</code> yaz.</p>'''),
    input='<p>İlk satırda N, M, K. Sonraki M satırda <code>u v w</code>.</p>',
    output='<p>Süre ya da −1.</p>',
    constraints='1 ≤ N ≤ 10^5, 0 ≤ M ≤ 2·10^5, 0 ≤ w ≤ 10^4',
    samples=[('4 3 2\n2 1 1\n2 3 1\n3 4 1\n', '1 ve 3\'e 1 dakikada, 4\'e 2 dakikada ulaşır: 2.'),
             ('2 1 2\n1 2 1\n', 'Hat 1\'den 2\'ye; 2\'den 1\'e ulaşılamaz: −1.')],
    hidden=['1 0 1\n', '2 1 1\n1 2 0\n', '3 3 1\n1 2 10\n1 3 1\n3 2 1\n', '3 2 1\n1 2 5\n3 1 5\n', '4 5 1\n1 2 4\n1 3 1\n3 2 1\n2 4 1\n3 4 9\n',
            {'gen': D('''
                import random
                random.seed(185)
                n, m = 100000, 200000
                print(n, m, 1)
                out = [f'{i} {i + 1} {random.randint(0, 10**4)}' for i in range(1, n)]
                while len(out) < m:
                    out.append(f'{random.randint(1, n)} {random.randint(1, n)} {random.randint(0, 10**4)}')
                print('\\n'.join(out))
                ''')},
            {'gen': D('''
                import random
                random.seed(1850)
                n, m = 100000, 200000
                print(n, m, 7)
                print('\\n'.join(f'{random.randint(1, n)} {random.randint(1, n)} {random.randint(1, 10**4)}' for _ in range(m)))
                ''')}],
    start=D('''
        import sys
        import heapq
        veri = sys.stdin.read().split()
        n, m, k = int(veri[0]), int(veri[1]), int(veri[2])
        komsu = [[] for _ in range(n + 1)]
        # Dijkstra: (mesafe, düğüm) çiftlerini heap'te tut
        '''),
    sol=D('''
        import sys
        import heapq
        veri = sys.stdin.read().split()
        n, m, k = int(veri[0]), int(veri[1]), int(veri[2])
        komsu = [[] for _ in range(n + 1)]
        for i in range(m):
            u, v, w = int(veri[3 + 3 * i]), int(veri[4 + 3 * i]), int(veri[5 + 3 * i])
            komsu[u].append((v, w))
        SONSUZ = float('inf')
        mesafe = [SONSUZ] * (n + 1)
        mesafe[k] = 0
        heap = [(0, k)]
        while heap:
            d, u = heapq.heappop(heap)
            if d > mesafe[u]:
                continue
            for v, w in komsu[u]:
                nd = d + w
                if nd < mesafe[v]:
                    mesafe[v] = nd
                    heapq.heappush(heap, (nd, v))
        en_uzak = max(mesafe[1:])
        print(-1 if en_uzak == SONSUZ else en_uzak)
        '''),
    brute=D('''
        import sys
        v = sys.stdin.read().split(); n, m, k = int(v[0]), int(v[1]), int(v[2])
        E = [(int(v[3+3*i]), int(v[4+3*i]), int(v[5+3*i])) for i in range(m)]
        INF = 10**18; d = [INF]*(n+1); d[k] = 0
        for _ in range(n):
            for a, b, w in E:
                if d[a] + w < d[b]: d[b] = d[a] + w
        x = max(d[1:]); print(-1 if x >= INF else x)
        '''),
    rnd=lambda r: (lambda n: (lambda m: f"{n} {m} {r.randint(1, n)}\n" + ''.join(f"{r.randint(1, n)} {r.randint(1, n)} {r.randint(0, 9)}\n" for _ in range(m)))(r.randint(0, 9)))(r.randint(1, 6)),
    editorial=D('''
        <p><b>Yaklaşım (Dijkstra):</b> Negatif olmayan ağırlıklı grafta tek kaynaktan en kısa yollar. Kaynağın mesafesi 0, diğerleri sonsuz. Min-heap\'ten her seferinde mesafesi en küçük düğümü çıkar; onun mesafesi artık kesindir. Komşularını gevşet (<code>d + w &lt; mesafe[v]</code> ise güncelle ve heap\'e ekle). Heap\'te eskimiş kayıtlar kalabilir; çıkarınca <code>d &gt; mesafe[u]</code> ise atla (tembel silme). Cevap, mesafelerin en büyüğüdür.</p>
        <p><b>Karmaşıklık:</b> O((N + M) log M).</p>
        <p><b>Naif çözüm neden yetmez:</b> Bellman–Ford N tur × M kenar = 2·10^10 gevşetme. BFS ise ağırlıklı grafta yanlış sonuç verir (az kenarlı yol her zaman en kısa değildir, örnek: 1→2 doğrudan 10 dk, 1→3→2 toplam 2 dk). Her çıkarımda tüm düğümler arasından minimumu aramak O(N²) = 10^10.</p>
        <p><b>Sık hata:</b> Eskimiş heap kayıtlarını atlamamak (gereksiz iş, yoğun grafta ciddi yavaşlama) ve hatları iki yönlü eklemek.</p>'''),
    hints=['Ağırlıklar negatif değil: Dijkstra.', 'heapq ile (mesafe, düğüm); eskimiş kayıtları atla.', 'Cevap en büyük mesafe; sonsuz varsa −1.']))

# ---------------------------------------------------------------- a-186
P.append(dict(
    id='a-186', title='Aktarma sınırlı en ucuz bilet', track=T, diff='Zor',
    tags=['Bellman–Ford', 'kısıtlı en kısa yol', 'DP'], src='LeetCode 787 Cheapest Flights Within K Stops benzeri',
    statement=D('''
        <p>Kanat Havayolları\'nın bilet motoru, N şehir arasındaki M tek yönlü uçuşun fiyatlarını biliyor. Bir müşteri S şehrinden T şehrine gitmek istiyor ama en fazla <b>K aktarma</b> (ara durak) kabul ediyor; yani en fazla K+1 uçuş kullanabilir.</p>
        <p>Bu koşulla en ucuz toplam fiyatı yaz; uygun bir yol yoksa <code>-1</code>.</p>'''),
    input='<p>İlk satırda N, M, S, T, K. Sonraki M satırda <code>u v fiyat</code>.</p>',
    output='<p>En ucuz fiyat ya da −1.</p>',
    constraints='2 ≤ N ≤ 2000, 0 ≤ M ≤ 10^4, 0 ≤ K ≤ 100, 1 ≤ fiyat ≤ 10^4, S ≠ T',
    samples=[('4 5 1 4 1\n1 2 100\n2 3 100\n2 4 600\n3 4 200\n1 3 500\n',
              '1→2→3→4 = 400 ama 2 aktarma. 1 aktarmayla: 1→2→4 = 700, 1→3→4 = 700. Cevap 700.'),
             ('3 3 1 3 0\n1 2 100\n2 3 100\n1 3 500\n', 'Aktarmasız tek seçenek doğrudan uçuş: 500.')],
    hidden=['2 0 1 2 5\n', '2 1 1 2 0\n1 2 7\n', '3 2 1 3 0\n1 2 1\n2 3 1\n', '3 2 1 3 1\n1 2 1\n2 3 1\n', '4 4 1 4 2\n1 2 1\n2 3 1\n3 4 1\n1 4 10\n',
            '5 6 1 5 1\n1 2 5\n2 5 5\n1 3 1\n3 4 1\n4 5 1\n1 5 100\n',
            {'gen': D('''
                import random
                random.seed(186)
                n, m = 2000, 10000
                print(n, m, 1, n, 100)
                out = [f'{i} {i + 1} {random.randint(1, 50)}' for i in range(1, n)]
                while len(out) < m:
                    a = random.randint(1, n - 1)
                    out.append(f'{a} {min(n, a + random.randint(1, 60))} {random.randint(500, 10**4)}')
                print('\\n'.join(out))
                ''')},
            {'gen': D('''
                import random
                random.seed(1860)
                n, m = 2000, 10000
                print(n, m, 5, 1999, 100)
                print('\\n'.join(f'{random.randint(1, n)} {random.randint(1, n)} {random.randint(1, 10**4)}' for _ in range(m)))
                ''')}],
    start=D('''
        import sys
        veri = sys.stdin.read().split()
        n, m, s, t, k = map(int, veri[:5])
        SONSUZ = float('inf')
        maliyet = [SONSUZ] * (n + 1)
        maliyet[s] = 0
        # k+1 tur: her turda kenarları ÖNCEKİ turun kopyasından gevşet
        '''),
    sol=D('''
        import sys
        veri = sys.stdin.read().split()
        n, m, s, t, k = map(int, veri[:5])
        ucuslar = [(int(veri[5 + 3 * i]), int(veri[6 + 3 * i]), int(veri[7 + 3 * i])) for i in range(m)]
        SONSUZ = float('inf')
        maliyet = [SONSUZ] * (n + 1)
        maliyet[s] = 0
        for _ in range(k + 1):
            yeni = maliyet[:]
            degisti = False
            for u, v, f in ucuslar:
                du = maliyet[u]
                if du != SONSUZ and du + f < yeni[v]:
                    yeni[v] = du + f
                    degisti = True
            maliyet = yeni
            if not degisti:
                break
        print(maliyet[t] if maliyet[t] != SONSUZ else -1)
        '''),
    brute=D('''
        import sys
        v = sys.stdin.read().split(); n, m, s, t, k = map(int, v[:5])
        E = [(int(v[5+3*i]), int(v[6+3*i]), int(v[7+3*i])) for i in range(m)]
        best = [None]
        def dfs(u, c, uc):
            if u == t:
                if best[0] is None or c < best[0]: best[0] = c
                return
            if uc == k + 1: return
            for a, b, f in E:
                if a == u: dfs(b, c + f, uc + 1)
        dfs(s, 0, 0)
        print(best[0] if best[0] is not None else -1)
        '''),
    rnd=lambda r: (lambda n: (lambda m: (lambda st: f"{n} {m} {st[0]} {st[1]} {r.randint(0, 3)}\n" + ''.join(f"{r.randint(1, n)} {r.randint(1, n)} {r.randint(1, 9)}\n" for _ in range(m)))(r.sample(range(1, n + 1), 2)))(r.randint(0, 7)))(r.randint(2, 5)),
    editorial=D('''
        <p><b>Yaklaşım:</b> Aktarma sınırı yüzünden düz Dijkstra yetmez: daha ucuz ama çok aktarmalı bir yol, daha pahalı ama az aktarmalı yolu "eler" ve sınır aşılır. Bellman–Ford\'u <b>K+1 turla sınırla</b>: i. turun sonunda <code>maliyet[v]</code>, en fazla i uçuşla v\'ye ulaşmanın en ucuz fiyatıdır. Kritik nokta: bir tur içinde yalnız <b>önceki turun</b> değerlerinden gevşetmek (kopya dizi). Aksi hâlde aynı turda zincirleme gevşeme olur ve fazla uçuş kullanılır.</p>
        <p><b>Karmaşıklık:</b> O((K+1) · M) = 101 × 10^4 ≈ 10^6. Bir turda hiçbir şey değişmezse erken dur.</p>
        <p><b>Naif çözüm neden yetmez:</b> Tüm yolları DFS ile K+1 derinliğe kadar denemek, ortalama çıkış derecesi d iken d^(K+1) yol demek; gizli testte astronomik. Durum = (şehir, kullanılan uçuş) olan Dijkstra da çalışır, ama N·K durumda heap maliyeti daha yüksektir.</p>
        <p><b>Sık hata:</b> Kopya dizi kullanmamak (örnek 1\'de 400 bulursun), K\'yı uçuş sayısı sanıp K tur çalıştırmak (K aktarma = K+1 uçuş).</p>'''),
    hints=['En fazla K+1 uçuş: K+1 tur Bellman–Ford.', 'Her turda önceki turun kopyasından gevşet; aynı tur içinde zincirleme olmasın.']))

# ---------------------------------------------------------------- a-187
P.append(dict(
    id='a-187', title='Şubeleri birbirine bağlayan en ucuz fiber ağ', track=T, diff='Zor',
    tags=['MST', 'Kruskal', 'union-find'], src='HackerRank Kruskal (MST): Really Special Subtree / LeetCode 1584 benzeri',
    statement=D('''
        <p>Anadolu Bank, N şubesini özel fiber hatla birbirine bağlayacak. M aday hattın her birinin döşeme maliyeti biliniyor (hatlar iki yönlü). Amaç: tüm şubelerin (doğrudan ya da dolaylı) birbirine ulaşabildiği, <b>toplam maliyeti en düşük</b> hat kümesini seçmek.</p>
        <p>Bu en düşük toplam maliyeti yaz. Tüm şubeleri bağlamak mümkün değilse <code>-1</code> yaz.</p>'''),
    input='<p>İlk satırda N ve M. Sonraki M satırda <code>a b maliyet</code>.</p>',
    output='<p>En düşük toplam maliyet ya da −1.</p>',
    constraints='1 ≤ N ≤ 10^5, 0 ≤ M ≤ 2·10^5, 1 ≤ maliyet ≤ 10^6',
    samples=[('4 5\n1 2 10\n2 3 15\n1 3 5\n3 4 4\n2 4 8\n', 'Seçilen hatlar: 3-4 (4), 1-3 (5), 2-4 (8): toplam 17.'),
             ('3 1\n1 2 7\n', '3. şubeye hiç hat yok: −1.')],
    hidden=['1 0\n', '2 0\n', '2 2\n1 2 5\n1 2 3\n', '3 3\n1 2 1\n2 3 1\n1 3 1\n', '5 7\n1 2 3\n1 3 8\n2 4 5\n3 4 2\n3 5 4\n4 5 6\n2 3 9\n',
            '4 3\n1 2 1\n1 2 2\n3 4 1\n',
            {'gen': D('''
                import random
                random.seed(187)
                n, m = 100000, 200000
                print(n, m)
                out = [f'{random.randint(1, i - 1)} {i} {random.randint(1, 10**6)}' for i in range(2, n + 1)]
                while len(out) < m:
                    out.append(f'{random.randint(1, n)} {random.randint(1, n)} {random.randint(1, 10**6)}')
                random.shuffle(out)
                print('\\n'.join(out))
                ''')},
            {'gen': D('''
                import random
                random.seed(1870)
                n, m = 100000, 200000
                print(n, m)
                print('\\n'.join(f'{random.randint(1, n - 1)} {random.randint(1, n - 1)} {random.randint(1, 10**6)}' for _ in range(m)))
                ''')}],
    start=D('''
        import sys
        veri = sys.stdin.read().split()
        n, m = int(veri[0]), int(veri[1])
        hatlar = []
        ebeveyn = list(range(n + 1))
        # hatları maliyete göre sırala, döngü oluşturmayanları al
        '''),
    sol=D('''
        import sys
        veri = sys.stdin.read().split()
        n, m = int(veri[0]), int(veri[1])
        hatlar = sorted((int(veri[4 + 3 * i]), int(veri[2 + 3 * i]), int(veri[3 + 3 * i])) for i in range(m))
        ebeveyn = list(range(n + 1))

        def bul(x):
            kok = x
            while ebeveyn[kok] != kok:
                kok = ebeveyn[kok]
            while ebeveyn[x] != kok:
                ebeveyn[x], x = kok, ebeveyn[x]
            return kok

        toplam = 0
        secilen = 0
        for c, a, b in hatlar:
            ra, rb = bul(a), bul(b)
            if ra != rb:
                ebeveyn[ra] = rb
                toplam += c
                secilen += 1
                if secilen == n - 1:
                    break
        print(toplam if secilen == n - 1 else -1)
        '''),
    brute=D('''
        import sys
        v = sys.stdin.read().split(); n, m = int(v[0]), int(v[1])
        E = [(int(v[2+3*i]), int(v[3+3*i]), int(v[4+3*i])) for i in range(m)]
        INF = 10**18; inT = [False]*(n+1); d = [INF]*(n+1); d[1] = 0; tot = 0
        for _ in range(n):
            u = min((x for x in range(1, n+1) if not inT[x]), key=lambda x: d[x])
            if d[u] >= INF: print(-1); raise SystemExit
            inT[u] = True; tot += d[u]
            for a, b, c in E:
                if a == u and not inT[b]: d[b] = min(d[b], c)
                if b == u and not inT[a]: d[a] = min(d[a], c)
        print(tot)
        '''),
    rnd=lambda r: (lambda n: (lambda m: f"{n} {m}\n" + ''.join(f"{r.randint(1, n)} {r.randint(1, n)} {r.randint(1, 9)}\n" for _ in range(m)))(r.randint(0, 9)))(r.randint(1, 6)),
    editorial=D('''
        <p><b>Yaklaşım (Kruskal):</b> Hatları maliyete göre artan sırala. Sırayla gez; hat iki farklı bileşeni bağlıyorsa (union-find ile kontrol) al ve bileşenleri birleştir, aynı bileşendeyse atla (döngü oluştururdu). N−1 hat seçilince minimum yayılan ağaç (MST) tamamdır; daha azı seçildiyse graf bağlı değildir: −1. Doğruluğunun dayanağı "kesit özelliği"dir: herhangi bir kesiti geçen en ucuz kenar bir MST\'de yer alır.</p>
        <p><b>Karmaşıklık:</b> Sıralama O(M log M) + union-find işlemleri neredeyse O(M).</p>
        <p><b>Alternatif (Prim):</b> Heap ile O(M log N); yoğun graflarda dizi tabanlı O(N²) Prim tercih edilir.</p>
        <p><b>Naif çözüm neden yetmez:</b> Heap\'siz Prim her adımda tüm düğümleri tarar: O(N²) = 10^10. Kenar alt kümelerini denemek üsteldir. Kruskal\'da union-find yerine her hatta BFS ile döngü kontrolü yapmak O(M · N).</p>
        <p><b>Sık hata:</b> Kendine dönen (a = b) hatları ve aynı çift arasındaki çoklu hatları hesaba katmamak (union-find doğal olarak eler), bağlılık kontrolünü unutmak.</p>'''),
    hints=['Hatları ucuzdan pahalıya sırala.', 'Union-find ile iki ucu farklı bileşendeyse al; sonda N−1 hat seçildi mi kontrol et.']))

# ---------------------------------------------------------------- a-188
P.append(dict(
    id='a-188', title='Ürün kodunu adım adım dönüştürme', track=T, diff='Zor',
    tags=['BFS', 'örtük graf', 'metin'], src='LeetCode 127 Word Ladder benzeri',
    statement=D('''
        <p>Anadolu Market\'in stok sistemi, bir ürün kodunu başka bir koda dönüştürürken her adımda <b>yalnızca bir harf</b> değiştirmeye izin veriyor ve her ara kod <b>katalogda kayıtlı</b> olmalı (kod uzunluğu sabit). Başlangıç kodu katalogda olmak zorunda değil; hedef kod katalogda olmalı.</p>
        <p>Başlangıçtan hedefe en kısa dönüşüm dizisindeki <b>kod sayısını</b> (başlangıç ve hedef dahil) yaz. Mümkün değilse <code>0</code> yaz.</p>'''),
    input='<p>İlk satırda başlangıç ve hedef kod. İkinci satırda N, üçüncü satırda boşlukla ayrılmış N katalog kodu (hepsi aynı uzunlukta, küçük İngilizce harfler).</p>',
    output='<p>Kod sayısı ya da 0.</p>',
    constraints='1 ≤ kod uzunluğu ≤ 8, 1 ≤ N ≤ 5·10^4',
    samples=[('hit cog\n6\nhot dot dog lot log cog\n', 'hit → hot → dot → dog → cog: 5 kod.'),
             ('hit cog\n5\nhot dot dog lot log\n', 'Hedef katalogda yok: 0.')],
    hidden=['a c\n3\na b c\n', 'ab ab\n1\nab\n', 'ab cd\n2\nad cb\n', 'abc xyz\n3\nxbc xyc xyz\n', 'kale masa\n7\nkasa mala male kala masa kasa mase\n',
            'aaa bbb\n2\nbbb aab\n',
            {'gen': D('''
                import random
                random.seed(188)
                kume = set()
                while len(kume) < 50000:
                    kume.add(''.join(random.choice('abcdef') for _ in range(7)))
                kume = sorted(kume)
                print('aaaaaaa', kume[-1])
                print(len(kume))
                print(*kume)
                ''')},
            {'gen': D('''
                import itertools
                kume = [''.join(p) for p in itertools.product('abcdefg', repeat=5)]
                kume = [k for k in kume if 'g' not in k[1:]] + ['ggggg']
                print('aaaaa', 'ggggg')
                print(len(kume))
                print(*kume)
                ''')}],
    start=D('''
        import sys
        from collections import deque
        veri = sys.stdin.read().split()
        bas, hedef = veri[0], veri[1]
        n = int(veri[2])
        katalog = set(veri[3:3 + n])
        # BFS: her koddan tek harf değiştirerek komşuları üret
        '''),
    sol=D('''
        import sys
        from collections import deque
        veri = sys.stdin.read().split()
        bas, hedef = veri[0], veri[1]
        n = int(veri[2])
        katalog = set(veri[3:3 + n])
        if hedef not in katalog:
            print(0)
        elif bas == hedef:
            print(1)
        else:
            harfler = sorted(set(''.join(katalog)))
            katalog.discard(bas)
            q = deque([(bas, 1)])
            cevap = 0
            while q and not cevap:
                kod, d = q.popleft()
                for i in range(len(kod)):
                    on, son = kod[:i], kod[i + 1:]
                    for h in harfler:
                        aday = on + h + son
                        if aday in katalog:
                            if aday == hedef:
                                cevap = d + 1
                                break
                            katalog.discard(aday)
                            q.append((aday, d + 1))
                    if cevap:
                        break
            print(cevap)
        '''),
    brute=D('''
        import sys
        v = sys.stdin.read().split(); b, h = v[0], v[1]; n = int(v[2]); W = list(dict.fromkeys(v[3:3+n]))
        if h not in W: print(0); raise SystemExit
        if b == h: print(1); raise SystemExit
        nodes = [b] + [w for w in W if w != b]
        def adj(x, y): return sum(p != q for p, q in zip(x, y)) == 1
        dist = {b: 1}; fr = [b]
        while fr:
            nf = []
            for x in fr:
                for y in nodes:
                    if y not in dist and adj(x, y): dist[y] = dist[x] + 1; nf.append(y)
            fr = nf
        print(dist.get(h, 0))
        '''),
    rnd=lambda r: (lambda L: (lambda W: f"{''.join(r.choice('abc') for _ in range(L))} {r.choice(W) if r.random() < 0.8 else ''.join(r.choice('abc') for _ in range(L))}\n{len(W)}\n{' '.join(W)}\n")([''.join(r.choice('abc') for _ in range(L)) for _ in range(r.randint(1, 8))]))(r.randint(1, 3)),
    editorial=D('''
        <p><b>Yaklaşım:</b> Kodlar düğüm, tek harf farkı kenar: ağırlıksız grafta en kısa yol, yani BFS. Kenarları önceden kurmak yerine örtük üret: bir kodun her konumuna katalogdaki her harfi koyup oluşan aday katalogda mı diye kümede bak (O(1)). Ziyaret edilen kodları katalogdan sil ki tekrar kuyruğa girmesin. Kullanılan harf kümesini katalogla sınırlamak (26 yerine yalnız geçen harfler) aday sayısını ciddi azaltır.</p>
        <p><b>Karmaşıklık:</b> O(N · L · Σ · L): her kod için L konum × Σ harf aday, her aday L uzunluğunda metin kurulumu. Örüntü kovaları (<code>h*t</code> → [hit, hot]) ile de O(N · L²).</p>
        <p><b>Naif çözüm neden yetmez:</b> Tüm kod çiftlerini karşılaştırarak komşuluk kurmak O(N² · L) = 2,5·10^9 · L karşılaştırma; gizli testteki 5·10^4 kodda saatler sürer. DFS ile tüm yolları denemek ise üsteldir ve en kısayı garanti etmez.</p>
        <p><b>Sık hata:</b> Kod sayısı yerine adım sayısı yazmak (cevap adım + 1), hedef katalogda değilken aramaya başlamak ve düğümü kuyruktan çıkarırken işaretlemek (aynı kod defalarca kuyruğa girer).</p>'''),
    hints=['Tek harf farkı = kenar; en kısa yol için BFS.', 'Komşuları üretmek için her konuma her harfi dene ve kümede ara; ziyaret edileni kümeden sil.']))

# ---------------------------------------------------------------- a-189
P.append(dict(
    id='a-189', title='Çatışan çalışanları iki ekibe ayır', track=T, diff='Orta',
    tags=['BFS', 'iki parçalı graf', 'renklendirme'], src='LeetCode 886 Possible Bipartition / 785 Is Graph Bipartite benzeri',
    statement=D('''
        <p>Pusula İK, şirket içi hackathon için N çalışanı <b>iki ekibe</b> ayıracak. M çift çalışan geçmişteki projelerde anlaşamamış; her çiftteki iki kişi <b>aynı ekipte olamaz</b>. Ekiplerin boyutları önemli değil (bir ekip boş da kalabilir).</p>
        <p>Böyle bir bölme mümkünse <code>EVET</code>, değilse <code>HAYIR</code> yaz.</p>'''),
    input='<p>İlk satırda N ve M. Sonraki M satırda <code>a b</code> (a ≠ b).</p>',
    output='<p><code>EVET</code> ya da <code>HAYIR</code>.</p>',
    constraints='1 ≤ N ≤ 10^5, 0 ≤ M ≤ 2·10^5',
    samples=[('4 3\n1 2\n1 3\n2 4\n', 'Ekip A: {1, 4}, ekip B: {2, 3}: EVET.'),
             ('3 3\n1 2\n2 3\n1 3\n', 'Üç kişilik çatışma üçgeni iki ekibe sığmaz: HAYIR.')],
    hidden=['1 0\n', '2 1\n1 2\n', '4 4\n1 2\n2 3\n3 4\n4 1\n', '5 5\n1 2\n2 3\n3 4\n4 5\n5 1\n', '6 3\n1 2\n3 4\n5 6\n', '6 4\n1 2\n2 3\n4 5\n5 6\n',
            {'gen': D('''
                import random
                random.seed(189)
                n, m = 100000, 200000
                print(n, m)
                out = []
                for _ in range(m):
                    a = random.randint(1, n // 2) * 2
                    b = random.randint(1, n // 2) * 2 - 1
                    out.append(f'{a} {b}')
                print('\\n'.join(out))
                ''')},
            {'gen': D('''
                n = 100001
                print(n, n)
                print('\\n'.join(f'{i} {i + 1}' for i in range(1, n)))
                print(n, 1)
                ''')}],
    start=D('''
        import sys
        from collections import deque
        veri = sys.stdin.read().split()
        n, m = int(veri[0]), int(veri[1])
        komsu = [[] for _ in range(n + 1)]
        renk = [-1] * (n + 1)   # -1: atanmadı, 0/1: ekip
        '''),
    sol=D('''
        import sys
        from collections import deque
        veri = sys.stdin.read().split()
        n, m = int(veri[0]), int(veri[1])
        komsu = [[] for _ in range(n + 1)]
        for i in range(m):
            a, b = int(veri[2 + 2 * i]), int(veri[3 + 2 * i])
            komsu[a].append(b)
            komsu[b].append(a)
        renk = [-1] * (n + 1)
        ok = True
        for s in range(1, n + 1):
            if renk[s] != -1 or not ok:
                continue
            renk[s] = 0
            q = deque([s])
            while q and ok:
                u = q.popleft()
                for v in komsu[u]:
                    if renk[v] == -1:
                        renk[v] = 1 - renk[u]
                        q.append(v)
                    elif renk[v] == renk[u]:
                        ok = False
                        break
        print('EVET' if ok else 'HAYIR')
        '''),
    brute=D('''
        import sys
        from itertools import product
        v = sys.stdin.read().split(); n, m = int(v[0]), int(v[1])
        E = [(int(v[2+2*i]), int(v[3+2*i])) for i in range(m)]
        print('EVET' if any(all(c[a-1] != c[b-1] for a, b in E) for c in product((0, 1), repeat=n)) else 'HAYIR')
        '''),
    rnd=lambda r: (lambda n: (lambda m: f"{n} {m}\n" + ''.join((lambda a: f"{a} {r.choice([x for x in range(1, n + 1) if x != a])}\n")(r.randint(1, n)) for _ in range(m)))(r.randint(0, 7)))(r.randint(2, 7)),
    editorial=D('''
        <p><b>Yaklaşım:</b> Çatışmaları kenar sayarsan soru "graf iki parçalı (bipartite) mı?" olur. Her bileşende BFS ile iki renk dağıt: başlangıca 0, her komşuya karşıt renk. Bir komşu zaten <b>aynı renkteyse</b> çelişki var: tek uzunluklu bir döngü bulundu, bölme imkânsız. Graf bağlı olmayabilir; her renksiz düğümden yeni BFS başlat.</p>
        <p><b>Karmaşıklık:</b> O(N + M).</p>
        <p><b>Naif çözüm neden yetmez:</b> Tüm 2^N ekip atamasını denemek, 10^5 kişide hayal bile edilemez. Açgözlü "sırayla gelen kişiyi uygun ekibe koy" yaklaşımı ise geri dönüş olmadan yanlış karar verebilir; BFS renklendirmesi bu yüzden zorunludur.</p>
        <p><b>Sık hata:</b> Yalnızca 1. düğümden BFS yapıp diğer bileşenleri atlamak (gizli testte çift sayılar ve tek sayılar ayrı gruplarda ve bazı kişiler izole), özyinelemeli DFS\'nin uzun zincirde (gizli testte 10^5 uzunluk) derinlik sınırını aşması.</p>'''),
    hints=['Soru: graf iki renkle boyanabilir mi?', 'Her renksiz düğümden BFS; komşu aynı renkteyse HAYIR.']))

# ---------------------------------------------------------------- a-190
P.append(dict(
    id='a-190', title='Sel suları çekilirken en erken geçiş', track=T, diff='Zor',
    tags=['Dijkstra', 'minimax yol', 'ızgara', 'heap'], src='LeetCode 778 Swim in Rising Water benzeri',
    statement=D('''
        <p>Pedal İzmir\'in sahil bölgesi N×N hücreli bir ızgara; her hücrenin yükseltisi e<sub>ij</sub> metre. Fırtınada su seviyesi zamanla <b>yükseliyor</b>: t anında su seviyesi t metre ve yalnızca yükseltisi ≤ t olan hücreler su altında, yani tekneyle geçilebilir durumda. Kurtarma teknesi sol üst köşeden sağ alt köşeye, yalnız su altındaki hücreler arasında dört yönlü ve anında hareket edebiliyor.</p>
        <p>Teknenin karşıya geçebileceği <b>en erken t</b> anını bul.</p>'''),
    input='<p>İlk satırda N. Sonraki N satırda N yükselti.</p>',
    output='<p>En küçük t.</p>',
    constraints='1 ≤ N ≤ 300, 0 ≤ yükselti ≤ 10^6',
    samples=[('2\n0 2\n1 3\n', 'Bitiş hücresinin kendisi 3 metre: en erken t = 3.'),
             ('5\n0 1 2 3 4\n24 23 22 21 5\n12 13 14 15 16\n11 17 18 19 20\n10 9 8 7 6\n',
              'Dış çevreden dolaşan yolun en yüksek hücresi 16: t = 16.')],
    hidden=['1\n7\n', '2\n5 1\n1 0\n', '3\n0 9 0\n0 9 0\n0 0 0\n', '3\n1 1 1\n9 9 1\n1 1 1\n', '3\n4 4 4\n4 4 4\n4 4 4\n',
            {'gen': D('''
                import random
                random.seed(190)
                n = 300
                print(n)
                for _ in range(n):
                    print(*[random.randint(0, 10**6) for _ in range(n)])
                ''')},
            {'gen': D('''
                n = 300
                print(n)
                for i in range(n):
                    print(*[(i * n + (j if i % 2 == 0 else n - 1 - j)) for j in range(n)])
                ''')}],
    start=D('''
        import sys
        import heapq
        veri = sys.stdin.read().split()
        n = int(veri[0])
        e = [list(map(int, veri[1 + i * n:1 + (i + 1) * n])) for i in range(n)]
        # heap'te (yol üzerindeki en yüksek yükselti, satır, sütun)
        '''),
    sol=D('''
        import sys
        import heapq
        veri = sys.stdin.read().split()
        n = int(veri[0])
        e = [list(map(int, veri[1 + i * n:1 + (i + 1) * n])) for i in range(n)]
        gorildu = [[False] * n for _ in range(n)]
        heap = [(e[0][0], 0, 0)]
        gorildu[0][0] = True
        while heap:
            t, x, y = heapq.heappop(heap)
            if x == n - 1 and y == n - 1:
                print(t)
                break
            for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                if 0 <= nx < n and 0 <= ny < n and not gorildu[nx][ny]:
                    gorildu[nx][ny] = True
                    v = e[nx][ny]
                    heapq.heappush(heap, (t if t > v else v, nx, ny))
        '''),
    brute=D('''
        import sys
        v = sys.stdin.read().split(); n = int(v[0]); e = [list(map(int, v[1+i*n:1+(i+1)*n])) for i in range(n)]
        for t in range(0, max(map(max, e)) + 1):
            if e[0][0] > t: continue
            S = {(0, 0)}; st = [(0, 0)]
            while st:
                x, y = st.pop()
                for a, b in ((x+1, y), (x-1, y), (x, y+1), (x, y-1)):
                    if 0 <= a < n and 0 <= b < n and (a, b) not in S and e[a][b] <= t: S.add((a, b)); st.append((a, b))
            if (n-1, n-1) in S: print(t); break
        '''),
    rnd=lambda r: (lambda n: f"{n}\n" + ''.join(' '.join(str(r.randint(0, 12)) for _ in range(n)) + '\n' for _ in range(n)))(r.randint(1, 5)),
    editorial=D('''
        <p><b>Yaklaşım:</b> Bir yolun geçilebildiği en erken an, yol üzerindeki <b>en yüksek</b> hücredir. Bu en yüksek değeri en küçük yapan yolu arıyoruz (minimax yol). Dijkstra\'nın bir çeşidi: heap\'te (o hücreye ulaşan yolun maksimum yükseltisi, hücre) tut; her seferinde en küçük değerli hücreyi çıkar, komşulara <code>max(t, e[komşu])</code> değeriyle geç. Hedef heap\'ten çıktığı anda değeri kesindir. Burada her hücreyi kuyruğa eklerken işaretlemek güvenlidir, çünkü heap değerleri maksimumla tanımlı ve monoton artar ("Prim benzeri" genişleme).</p>
        <p><b>Karmaşıklık:</b> O(N² log N²).</p>
        <p><b>Alternatifler:</b> (1) t üzerinde ikili arama + her t için BFS: O(N² log(max e)). (2) Hücreleri yükseltiye göre sırala, union-find ile sırayla "su altına al", başlangıç ve bitiş aynı bileşene düştüğü an cevap.</p>
        <p><b>Naif çözüm neden yetmez:</b> t\'yi 0\'dan başlayıp birer artırarak her seferinde BFS yapmak O(max e · N²) = 10^6 × 9·10^4 — imkânsız. DFS ile tüm yolları denemek üsteldir.</p>
        <p><b>Sık hata:</b> Yol uzunluğunu (toplamı) minimize etmek: burada toplam değil maksimum önemli. Ayrıca başlangıç hücresinin kendi yükseltisini hesaba katmamak.</p>'''),
    hints=['Bir yolun maliyeti, üzerindeki en yüksek hücredir.', 'Dijkstra gibi ilerle ama toplam yerine max(t, e[komşu]) kullan.']))
