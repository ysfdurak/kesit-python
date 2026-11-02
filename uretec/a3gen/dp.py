from build import D

T = 'Dinamik programlama'
P = []


def ints(r, n, lo, hi):
    return ' '.join(str(r.randint(lo, hi)) for _ in range(n))


# ---------------------------------------------------------------- a-166
P.append(dict(
    id='a-166', title='Kırık basamaklı apron merdiveni', track=T, diff='Kolay',
    tags=['1B DP', 'sayma', 'mod'], src='LeetCode 70 Climbing Stairs / Codeforces kırık basamak varyantı',
    statement=D('''
        <p>Kanat Havayolları\'nın apron merdiveninde N basamak var (yer 0. basamak, kapı N. basamak). Yolcu her adımda <b>1 ya da 2</b> basamak çıkabilir. Bakımdaki M basamak kırık; bu basamaklara basılamaz (kapı ve yer hiçbir zaman kırık değildir).</p>
        <p>Yerden kapıya kaç farklı yolla çıkılabilir? Sayı büyük olabileceği için 10^9+7\'ye göre kalanını yaz.</p>'''),
    input='<p>İlk satırda N ve M. M &gt; 0 ise ikinci satırda kırık basamak numaraları (1 ≤ numara ≤ N−1).</p>',
    output='<p>Yol sayısı mod 10^9+7.</p>',
    constraints='1 ≤ N ≤ 10^5, 0 ≤ M ≤ N−1',
    samples=[('4 0\n', '1+1+1+1, 1+1+2, 1+2+1, 2+1+1, 2+2: 5 yol.'),
             ('5 1\n3\n', '3. basamak kırık: 0→1→2→4→5 ve 0→2→4→5 olmak üzere 2 yol.')],
    hidden=['1 0\n', '2 1\n1\n', '3 2\n1 2\n', '6 2\n2 4\n', '10 0\n',
            {'gen': D('''
                print(100000, 0)
                ''')},
            {'gen': D('''
                import random
                random.seed(166)
                n = 100000
                k = sorted(random.sample(range(1, n), 20000))
                k = [x for i, x in enumerate(k) if i == 0 or x != k[i - 1] + 1]
                print(n, len(k))
                print(*k)
                ''')}],
    start=D('''
        import sys
        veri = sys.stdin.read().split()
        n, m = int(veri[0]), int(veri[1])
        kirik = set(map(int, veri[2:2 + m]))
        MOD = 10**9 + 7
        yol = [0] * (n + 1)
        yol[0] = 1
        # yol[i] = yol[i-1] + yol[i-2] (i kırık değilse)
        '''),
    sol=D('''
        import sys
        veri = sys.stdin.read().split()
        n, m = int(veri[0]), int(veri[1])
        kirik = set(map(int, veri[2:2 + m]))
        MOD = 10**9 + 7
        yol = [0] * (n + 1)
        yol[0] = 1
        for i in range(1, n + 1):
            if i in kirik:
                continue
            yol[i] = (yol[i - 1] + (yol[i - 2] if i >= 2 else 0)) % MOD
        print(yol[n])
        '''),
    brute=D('''
        import sys
        v = sys.stdin.read().split(); n, m = int(v[0]), int(v[1]); k = set(map(int, v[2:2+m]))
        def f(i):
            if i == n: return 1
            if i > n or i in k: return 0
            return f(i+1) + f(i+2)
        print(f(0) % (10**9+7))
        '''),
    rnd=lambda r: (lambda n: (lambda ks: f"{n} {len(ks)}\n{' '.join(map(str, ks))}\n")(sorted(r.sample(range(1, n), r.randint(0, n - 1))) if n > 1 else []))(r.randint(1, 12)),
    editorial=D('''
        <p><b>Yaklaşım:</b> <code>yol[i]</code> = i. basamağa ulaşma yolu sayısı. Son adım ya 1 ya 2 basamaktır: <code>yol[i] = yol[i−1] + yol[i−2]</code>. Kırık basamak için <code>yol[i] = 0</code> (oraya basılamaz, oradan da devam edilemez). Taban: <code>yol[0] = 1</code>. Her adımda mod al.</p>
        <p><b>Karmaşıklık:</b> O(N) zaman; yalnız son iki değeri tutarak O(1) bellek.</p>
        <p><b>Naif çözüm neden yetmez:</b> Özyinelemeli "1 adım dene, 2 adım dene" ağacı üstel büyür: N=40\'ta bile ~10^8 çağrı, N=10^5\'te ayrıca özyineleme sınırı aşılır. Aynı alt problemi (i. basamaktan kaç yol) defalarca çözmek DP\'nin önlediği israftır.</p>
        <p><b>Sık hata:</b> Mod almayı sona bırakmak (Python taşmaz ama dev sayılarla toplama yavaşlar; başka dillerde taşar) ve M = 0 iken ikinci satırı okumaya çalışmak.</p>'''),
    hints=['Son adım 1 ya da 2 basamaktır.', 'Kırık basamağın yol sayısı 0; her toplamda % MOD al.']))

# ---------------------------------------------------------------- a-167
P.append(dict(
    id='a-167', title='Bitişik olmayan bölgelerden en çok bahşiş', track=T, diff='Kolay',
    tags=['1B DP', 'seçim'], src='LeetCode 198 House Robber benzeri',
    statement=D('''
        <p>Lezzet Kurye\'de bir kurye, cadde boyunca sıralanmış N teslimat bölgesinden bazılarını seçecek; i. bölgedeki toplam beklenen bahşiş b<sub>i</sub>. Trafik kuralları yüzünden <b>yan yana iki bölge</b> aynı vardiyada seçilemiyor.</p>
        <p>Toplanabilecek en yüksek bahşişi bul (hiç bölge seçmemek de mümkündür: 0).</p>'''),
    input='<p>İlk satırda N. İkinci satırda N bahşiş değeri.</p>',
    output='<p>En yüksek toplam.</p>',
    constraints='1 ≤ N ≤ 2·10^5, 0 ≤ b ≤ 10^4',
    samples=[('5\n2 7 9 3 1\n', '1., 3. ve 5. bölge: 2+9+1 = 12.'),
             ('4\n2 1 1 2\n', '1. ve 4. bölge: 4.')],
    hidden=['1\n0\n', '1\n9\n', '2\n5 6\n', '3\n10 1 10\n', '6\n5 5 10 100 10 5\n',
            {'gen': D('''
                import random
                random.seed(167)
                n = 200000
                print(n)
                print(*[random.randint(0, 10**4) for _ in range(n)])
                ''')}],
    start=D('''
        n = int(input())
        b = list(map(int, input().split()))
        al, alma = 0, 0   # son bölgeyi aldım / almadım durumundaki en iyiler
        '''),
    sol=D('''
        n = int(input())
        b = list(map(int, input().split()))
        onceki2, onceki1 = 0, 0
        for x in b:
            onceki2, onceki1 = onceki1, max(onceki1, onceki2 + x)
        print(onceki1)
        '''),
    brute=D('''
        n = int(input()); b = list(map(int, input().split())); best = 0
        for m in range(1 << n):
            if m & (m >> 1): continue
            best = max(best, sum(b[i] for i in range(n) if m >> i & 1))
        print(best)
        '''),
    rnd=lambda r: (lambda n: f"{n}\n{ints(r, n, 0, 9)}\n")(r.randint(1, 10)),
    editorial=D('''
        <p><b>Yaklaşım:</b> <code>dp[i]</code> = ilk i bölgeden elde edilebilecek en iyi toplam. i. bölge için iki seçenek var: almazsın (<code>dp[i−1]</code>) ya da alırsın, o zaman i−1 alınamaz (<code>dp[i−2] + b[i]</code>). <code>dp[i] = max(dp[i−1], dp[i−2] + b[i])</code>. Yalnız son iki değer gerektiği için iki değişken yeter.</p>
        <p><b>Karmaşıklık:</b> O(N) zaman, O(1) bellek.</p>
        <p><b>Naif çözüm neden yetmez:</b> Tüm uygun alt kümeleri denemek Fibonacci kadar (~1,6^N) seçenek demek; N=50\'de bile milyarlar. Açgözlü "en büyüğü al, komşularını sil" de yanlış: [2, 3, 2] için 3 yerine 4 doğrudur.</p>
        <p><b>Sık hata:</b> Tek-çift indeksleri ayrı ayrı toplayıp büyüğünü almak (örnek 2\'de 2+1=3 ve 1+2=3 verir, doğru cevap 4).</p>'''),
    hints=['Her bölge için: al ya da alma.', 'dp[i] = max(dp[i−1], dp[i−2] + b[i]).']))

# ---------------------------------------------------------------- a-168
P.append(dict(
    id='a-168', title='En kârlı ardışık satış dönemi', track=T, diff='Kolay',
    tags=['Kadane', '1B DP'], src='LeetCode 53 Maximum Subarray / HackerRank The Maximum Subarray benzeri',
    statement=D('''
        <p>Anadolu Market\'in yeni şubesinin günlük net kâr/zarar kaydı elinde. Yatırımcı sunumunda "en iyi ardışık dönem" gösterilecek: <b>en az bir gün</b> içeren, toplamı en büyük ardışık gün aralığı.</p>
        <p>Bu toplamı yazdır.</p>'''),
    input='<p>İlk satırda N. İkinci satırda N tam sayı.</p>',
    output='<p>En büyük ardışık toplam.</p>',
    constraints='1 ≤ N ≤ 2·10^5, |değer| ≤ 10^4',
    samples=[('9\n-2 1 -3 4 -1 2 1 -5 4\n', '[4, −1, 2, 1] toplamı 6.'),
             ('3\n-8 -3 -6\n', 'Hepsi zarar: en az zararlı tek gün −3.')],
    hidden=['1\n-5\n', '1\n0\n', '5\n1 2 3 4 5\n', '6\n5 -10 5 -10 5 -1\n', '4\n-1 0 -2 0\n',
            {'gen': D('''
                import random
                random.seed(168)
                n = 200000
                print(n)
                print(*[random.randint(-10**4, 10**4) for _ in range(n)])
                ''')},
            {'gen': D('''
                import random
                random.seed(1680)
                n = 200000
                print(n)
                print(*[random.randint(-10**4, -1) for _ in range(n)])
                ''')}],
    start=D('''
        n = int(input())
        a = list(map(int, input().split()))
        burada_biten = en_iyi = a[0]
        # her günde: devam et ya da yeniden başla
        '''),
    sol=D('''
        n = int(input())
        a = list(map(int, input().split()))
        burada_biten = en_iyi = a[0]
        for x in a[1:]:
            burada_biten = max(x, burada_biten + x)
            if burada_biten > en_iyi:
                en_iyi = burada_biten
        print(en_iyi)
        '''),
    brute=D('''
        n = int(input()); a = list(map(int, input().split()))
        print(max(sum(a[i:j+1]) for i in range(n) for j in range(i, n)))
        '''),
    rnd=lambda r: (lambda n: f"{n}\n{ints(r, n, -9, 9)}\n")(r.randint(1, 10)),
    editorial=D('''
        <p><b>Yaklaşım (Kadane):</b> <code>burada_biten</code> = bugün biten en iyi dönemin toplamı. Bugün için iki seçenek var: dünkü dönemi uzatmak (<code>burada_biten + x</code>) ya da bugün yeniden başlamak (<code>x</code>). Hangisi büyükse odur. Genel en iyi, bu değerlerin maksimumudur. Bu bir 1B DP\'dir: dp[i] = max(a[i], dp[i−1] + a[i]).</p>
        <p><b>Karmaşıklık:</b> O(N) zaman, O(1) bellek.</p>
        <p><b>Naif çözüm neden yetmez:</b> Tüm (i, j) aralıklarını denemek O(N²) = 2·10^10 (önek toplamıyla bile); iç toplamı her seferinde hesaplarsan O(N³).</p>
        <p><b>Sık hata:</b> <code>en_iyi = 0</code> ile başlamak: tüm değerler negatifken 0 yazarsın, oysa en az bir gün seçilmeli (gizli testte tamamı negatif bir dizi var).</p>'''),
    hints=['Her gün: önceki dönemi uzat ya da burada yeniden başla.', 'Başlangıç değeri a[0] olmalı, 0 değil.']))

# ---------------------------------------------------------------- a-169
P.append(dict(
    id='a-169', title='En az banknotla para üstü', track=T, diff='Orta',
    tags=['para üstü', 'sınırsız sırt çantası', '1B DP'], src='LeetCode 322 Coin Change benzeri',
    statement=D('''
        <p>Anadolu Bank\'ın yeni ATM\'si, kasasında K farklı banknot/madeni para değeri bulunduruyor (her birinden sınırsız sayıda). Müşteri A TL çekmek istediğinde ATM <b>en az sayıda</b> parça vermeli.</p>
        <p>A tutarını tam olarak oluşturan en az parça sayısını yaz; mümkün değilse <code>-1</code> yaz. A = 0 için cevap 0.</p>'''),
    input='<p>İlk satırda K ve A. İkinci satırda K farklı değer.</p>',
    output='<p>En az parça sayısı ya da −1.</p>',
    constraints='1 ≤ K ≤ 12, 1 ≤ değer ≤ 10^4, 0 ≤ A ≤ 10^5',
    samples=[('3 11\n1 2 5\n', '5+5+1 = 11: 3 parça.'),
             ('1 3\n2\n', 'Yalnız 2\'likle 3 oluşmaz: −1.'),
             ('3 6\n1 3 4\n', 'Açgözlü 4+1+1 (3 parça) verir; doğrusu 3+3 (2 parça).')],
    hidden=['1 0\n7\n', '2 7\n2 4\n', '1 10000\n1\n', '4 63\n1 5 10 21\n', '3 100000\n9999 10000 1\n',
            {'gen': D('''
                print(10, 100000)
                print(37, 113, 251, 509, 997, 1999, 4001, 6007, 8009, 9973)
                ''')},
            {'gen': D('''
                print(12, 99999)
                print(*range(2, 25, 2))
                ''')}],
    start=D('''
        k, a = map(int, input().split())
        degerler = list(map(int, input().split()))
        SONSUZ = float('inf')
        dp = [0] + [SONSUZ] * a   # dp[t] = t tutarı için en az parça
        '''),
    sol=D('''
        k, a = map(int, input().split())
        degerler = list(map(int, input().split()))
        SONSUZ = a + 1
        dp = [0] + [SONSUZ] * a
        for d in degerler:
            for t in range(d, a + 1):
                v = dp[t - d] + 1
                if v < dp[t]:
                    dp[t] = v
        print(dp[a] if dp[a] <= a else -1)
        '''),
    brute=D('''
        from collections import deque
        k, a = map(int, input().split()); c = list(map(int, input().split()))
        dist = {0: 0}; q = deque([0])
        while q:
            u = q.popleft()
            for x in c:
                if u + x <= a and u + x not in dist: dist[u+x] = dist[u] + 1; q.append(u + x)
        print(dist.get(a, -1))
        '''),
    rnd=lambda r: (lambda k: f"{k} {r.randint(0, 40)}\n{' '.join(map(str, r.sample(range(1, 15), k)))}\n")(r.randint(1, 4)),
    editorial=D('''
        <p><b>Yaklaşım:</b> <code>dp[t]</code> = t TL için en az parça. Son verilen parça d ise <code>dp[t] = dp[t−d] + 1</code>; tüm d\'ler üzerinden minimum. <code>dp[0] = 0</code>, ulaşılamayanlar "sonsuz". Her değerden sınırsız olduğu için t\'yi <b>artan</b> sırada gezmek doğru (aynı parça tekrar kullanılabilir): bu, sınırsız sırt çantası kalıbıdır.</p>
        <p><b>Karmaşıklık:</b> O(K · A) = 12 × 10^5 ≈ 1,2·10^6 adım; bellek O(A).</p>
        <p><b>Naif çözüm neden yetmez:</b> Açgözlü "hep en büyük parçayı ver" bu değer kümelerinde yanlış (örnek 3). Tüm kombinasyonları özyinelemeyle denemek üsteldir; not almadan (memoization) A = 10^5 için hem süre hem özyineleme derinliği patlar.</p>
        <p><b>Sık hata:</b> "Sonsuz" için <code>float(\'inf\')</code> kullanıp sonda <code>inf</code> yazdırmak ya da −1 kontrolünü unutmak; A = 0 durumunda 0 yerine −1 vermek.</p>'''),
    hints=['dp[t] = min(dp[t − d] + 1) tüm d için.', 'Açgözlü yaklaşım bu değerlerde yanlış sonuç verebilir; örnek 3\'e bak.']))

# ---------------------------------------------------------------- a-170
P.append(dict(
    id='a-170', title='Para üstünü verme yolları', track=T, diff='Orta',
    tags=['para üstü', 'sayma', 'kombinasyon DP'], src='LeetCode 518 Coin Change II / HackerRank The Coin Change Problem benzeri',
    statement=D('''
        <p>Anadolu Market kasiyerleri için hazırlanan eğitim oyununda soru şu: elde K farklı değerde madeni para var (her birinden sınırsız). A kuruşluk para üstü <b>kaç farklı şekilde</b> verilebilir? Sıra önemli değil: 1+2 ile 2+1 aynı yoldur.</p>
        <p>Cevabı 10^9+7\'ye göre kalan olarak yaz. A = 0 için tek yol var (hiç para vermemek).</p>'''),
    input='<p>İlk satırda K ve A. İkinci satırda K farklı değer.</p>',
    output='<p>Yol sayısı mod 10^9+7.</p>',
    constraints='1 ≤ K ≤ 12, 1 ≤ değer ≤ 10^4, 0 ≤ A ≤ 10^5',
    samples=[('3 5\n1 2 5\n', '5; 2+2+1; 2+1+1+1; 1+1+1+1+1: 4 yol.'),
             ('1 3\n2\n', 'Oluşturulamaz: 0.')],
    hidden=['1 0\n5\n', '1 10\n10\n', '2 4\n1 2\n', '4 10\n2 5 3 6\n', '3 100\n1 5 10\n',
            {'gen': D('''
                print(12, 100000)
                print(1, 2, 5, 10, 20, 25, 50, 100, 200, 500, 1000, 2000)
                ''')},
            {'gen': D('''
                print(5, 99991)
                print(7, 11, 13, 17, 19)
                ''')}],
    start=D('''
        k, a = map(int, input().split())
        degerler = list(map(int, input().split()))
        MOD = 10**9 + 7
        yol = [1] + [0] * a
        # dış döngü paralar, iç döngü tutarlar olmalı (neden?)
        '''),
    sol=D('''
        k, a = map(int, input().split())
        degerler = list(map(int, input().split()))
        MOD = 10**9 + 7
        yol = [1] + [0] * a
        for d in degerler:
            for t in range(d, a + 1):
                yol[t] = (yol[t] + yol[t - d]) % MOD
        print(yol[a])
        '''),
    brute=D('''
        k, a = map(int, input().split()); c = list(map(int, input().split()))
        def f(i, t):
            if t == 0: return 1
            if i == len(c) or t < 0: return 0
            return f(i, t - c[i]) + f(i + 1, t)
        print(f(0, a) % (10**9+7))
        '''),
    rnd=lambda r: (lambda k: f"{k} {r.randint(0, 25)}\n{' '.join(map(str, r.sample(range(1, 9), k)))}\n")(r.randint(1, 4)),
    editorial=D('''
        <p><b>Yaklaşım:</b> <code>yol[t]</code> = t tutarını o ana kadar işlenen paralarla oluşturma yolu sayısı. Paraları <b>dış döngüde</b> tek tek ekle; her para d için <code>yol[t] += yol[t−d]</code> (t artan). Böylece her kombinasyon, paraların sabit bir sırasıyla tam bir kez sayılır.</p>
        <p><b>Karmaşıklık:</b> O(K · A), bellek O(A).</p>
        <p><b>Naif çözüm neden yetmez:</b> Tüm kombinasyonları özyinelemeyle saymak, gizli testteki gibi 1 kuruşluk para varken astronomik sayıda yol üretir (cevap mod alınmasını gerektirecek kadar büyük). Not alma olmadan saymak imkânsız.</p>
        <p><b>Sık hata:</b> Döngüleri ters kurmak (dışta tutar, içte para): o zaman 1+2 ile 2+1 ayrı sayılır ve <b>permütasyon</b> sayısını bulursun (örnek 1\'de 4 yerine 9). Bu ayrım mülakatlarda sık sorulur.</p>'''),
    hints=['Paralar dış döngüde olmalı.', 'yol[t] += yol[t − d]; her adımda mod al.']))

# ---------------------------------------------------------------- a-171
P.append(dict(
    id='a-171', title='Kargo uçağına en değerli yük', track=T, diff='Orta',
    tags=['0/1 sırt çantası', '1B DP'], src='Klasik 0/1 Knapsack (AtCoder DP D) benzeri',
    statement=D('''
        <p>Kanat Havayolları\'nın kargo uçağının kalan kapasitesi W kg. Bekleyen N gönderinin her birinin ağırlığı w<sub>i</sub> ve taşıma ücreti v<sub>i</sub>. Her gönderi ya tamamen alınır ya hiç alınmaz (bölünemez, en fazla bir kez).</p>
        <p>Kapasiteyi aşmadan elde edilebilecek en yüksek toplam ücreti bul.</p>'''),
    input='<p>İlk satırda N ve W. Sonraki N satırda <code>w v</code>.</p>',
    output='<p>En yüksek toplam ücret.</p>',
    constraints='1 ≤ N ≤ 100, 1 ≤ W ≤ 10^4, 1 ≤ w ≤ 10^4, 1 ≤ v ≤ 10^9',
    samples=[('3 8\n3 30\n4 50\n5 60\n', '3+5 = 8 kg ile 30+60 = 90.'),
             ('2 3\n4 100\n5 200\n', 'Hiçbiri sığmıyor: 0.')],
    hidden=['1 1\n1 7\n', '1 5\n6 7\n', '3 10\n5 10\n5 10\n5 10\n', '4 7\n1 1\n3 4\n4 5\n5 7\n', '5 15\n12 4\n2 2\n1 1\n4 10\n1 2\n',
            {'gen': D('''
                import random
                random.seed(171)
                n, w = 100, 10000
                print(n, w)
                for _ in range(n):
                    print(random.randint(1, 600), random.randint(1, 10**9))
                ''')},
            {'gen': D('''
                import random
                random.seed(1710)
                n, w = 100, 10000
                print(n, w)
                for _ in range(n):
                    a = random.randint(50, 400)
                    print(a, a * 1000 + random.randint(0, 999))
                ''')}],
    start=D('''
        import sys
        veri = sys.stdin.read().split()
        n, W = int(veri[0]), int(veri[1])
        dp = [0] * (W + 1)   # dp[c] = c kapasiteyle en iyi ücret
        # her gönderi için kapasiteyi YUKARIDAN aşağı gez
        '''),
    sol=D('''
        import sys
        veri = sys.stdin.read().split()
        n, W = int(veri[0]), int(veri[1])
        dp = [0] * (W + 1)
        for i in range(n):
            w, v = int(veri[2 + 2 * i]), int(veri[3 + 2 * i])
            if w > W:
                continue
            for c in range(W, w - 1, -1):
                aday = dp[c - w] + v
                if aday > dp[c]:
                    dp[c] = aday
        print(dp[W])
        '''),
    brute=D('''
        n, W = map(int, input().split()); it = [tuple(map(int, input().split())) for _ in range(n)]; b = 0
        for m in range(1 << n):
            sw = sum(it[i][0] for i in range(n) if m >> i & 1)
            if sw <= W: b = max(b, sum(it[i][1] for i in range(n) if m >> i & 1))
        print(b)
        '''),
    rnd=lambda r: (lambda n: f"{n} {r.randint(1, 15)}\n" + ''.join(f"{r.randint(1, 8)} {r.randint(1, 20)}\n" for _ in range(n)))(r.randint(1, 8)),
    editorial=D('''
        <p><b>Yaklaşım:</b> <code>dp[c]</code> = o ana kadar işlenen gönderilerle, en fazla c kg kullanarak elde edilebilecek en iyi ücret. Yeni gönderi (w, v) için: <code>dp[c] = max(dp[c], dp[c−w] + v)</code>. Kapasiteyi <b>yukarıdan aşağı</b> gezmek, aynı gönderinin bir turda iki kez kullanılmasını engeller (dp[c−w] henüz bu gönderiyle güncellenmemiştir).</p>
        <p><b>Karmaşıklık:</b> O(N · W) = 100 × 10^4 = 10^6, bellek O(W). (2B tablo dp[i][c] ile de aynı zaman, O(N·W) bellek.)</p>
        <p><b>Naif çözüm neden yetmez:</b> Tüm alt kümeler 2^100 — evrenin yaşından uzun. Açgözlü "ücret/ağırlık oranı en yüksek olanı al" 0/1 versiyonda yanlıştır (kesirli sırt çantasında doğrudur).</p>
        <p><b>Sık hata:</b> Kapasiteyi aşağıdan yukarı gezmek: bu, sınırsız sırt çantasına (her gönderiden sınırsız) dönüşür ve fazla ücret hesaplar.</p>'''),
    hints=['dp[c] = max(dp[c], dp[c − w] + v).', 'Aynı gönderiyi iki kez almamak için c\'yi W\'den w\'ye doğru azalt.']))

# ---------------------------------------------------------------- a-172
P.append(dict(
    id='a-172', title='En uzun artan maaş serisi', track=T, diff='Orta',
    tags=['LIS', 'ikili arama', 'DP'], src='LeetCode 300 Longest Increasing Subsequence benzeri',
    statement=D('''
        <p>Pusula İK, bir çalışanın yıllar içindeki performans puanlarına bakıyor. Kariyer gelişimini ölçmek için puanlardan <b>sırayı bozmadan</b> seçilebilecek, <b>kesinlikle artan</b> en uzun alt dizinin (ardışık olması gerekmez) uzunluğunu istiyor.</p>'''),
    input='<p>İlk satırda N. İkinci satırda N puan.</p>',
    output='<p>En uzun kesin artan alt dizinin uzunluğu.</p>',
    constraints='1 ≤ N ≤ 2·10^5, 0 ≤ puan ≤ 10^9',
    samples=[('8\n10 9 2 5 3 7 101 18\n', '2, 3, 7, 18 (ya da 2, 5, 7, 101): uzunluk 4.'),
             ('5\n7 7 7 7 7\n', 'Eşitler artan sayılmaz: 1.')],
    hidden=['1\n5\n', '5\n1 2 3 4 5\n', '5\n5 4 3 2 1\n', '6\n0 1 0 3 2 3\n', '8\n3 5 6 2 5 4 19 5\n',
            {'gen': D('''
                import random
                random.seed(172)
                n = 200000
                print(n)
                print(*[random.randint(0, 10**9) for _ in range(n)])
                ''')},
            {'gen': D('''
                n = 200000
                print(n)
                print(*[i // 2 for i in range(n)])
                ''')}],
    start=D('''
        from bisect import bisect_left
        n = int(input())
        a = list(map(int, input().split()))
        kuyruklar = []   # kuyruklar[k] = uzunluğu k+1 olan artan dizilerin en küçük son elemanı
        '''),
    sol=D('''
        from bisect import bisect_left
        n = int(input())
        a = list(map(int, input().split()))
        kuyruklar = []
        for x in a:
            i = bisect_left(kuyruklar, x)
            if i == len(kuyruklar):
                kuyruklar.append(x)
            else:
                kuyruklar[i] = x
        print(len(kuyruklar))
        '''),
    brute=D('''
        n = int(input()); a = list(map(int, input().split())); d = [1]*n
        for i in range(n):
            for j in range(i):
                if a[j] < a[i]: d[i] = max(d[i], d[j] + 1)
        print(max(d))
        '''),
    rnd=lambda r: (lambda n: f"{n}\n{ints(r, n, 0, 6)}\n")(r.randint(1, 12)),
    editorial=D('''
        <p><b>Klasik DP:</b> <code>d[i]</code> = a[i] ile biten en uzun artan alt dizi; <code>d[i] = 1 + max(d[j])</code>, j &lt; i ve a[j] &lt; a[i]. Doğru ama O(N²): 2·10^5 için 2·10^10 adım, gizli testlerde zaman aşımı.</p>
        <p><b>O(N log N) yaklaşım (sabır sıralaması):</b> <code>kuyruklar[k]</code>, uzunluğu k+1 olan artan alt dizilerin <b>en küçük</b> son elemanı. Bu dizi her zaman artandır, bu yüzden ikili arama yapılabilir. Yeni x için <code>bisect_left(kuyruklar, x)</code> konumunu bul: sona düşüyorsa en uzun diziyi bir uzat, değilse o uzunluk için daha küçük bir son eleman bulduğun için değiştir. Cevap <code>len(kuyruklar)</code>. (Not: <code>kuyruklar</code>\'ın kendisi bir LIS değildir, yalnız uzunluğu doğrudur.)</p>
        <p><b>Karmaşıklık:</b> O(N log N), bellek O(N).</p>
        <p><b>Sık hata:</b> "Kesin artan" için <code>bisect_left</code>, "azalmayan" için <code>bisect_right</code> gerekir; karıştırmak eşit değerli testleri bozar (örnek 2 ve gizli testteki 0 0 1 1 2 2... dizisi).</p>'''),
    hints=['O(N²) DP doğru ama yavaş.', 'Her uzunluk için en küçük son elemanı tut; bisect_left ile yerini bul.']))

# ---------------------------------------------------------------- a-173
P.append(dict(
    id='a-173', title='Depo robotunun engelli yolları', track=T, diff='Orta',
    tags=['2B DP', 'ızgara', 'sayma'], src='LeetCode 63 Unique Paths II benzeri',
    statement=D('''
        <p>Anadolu Market\'in otomatik deposunda bir robot R×C ızgaranın sol üst köşesinden sağ alt köşesine gidecek. Robot yalnızca <b>sağa</b> ya da <b>aşağı</b> hareket edebiliyor. <code>#</code> ile işaretli hücrelerde palet var, oraya girilemez; <code>.</code> boş hücredir.</p>
        <p>Kaç farklı yol olduğunu 10^9+7\'ye göre kalan olarak yaz. Başlangıç ya da bitiş doluysa cevap 0.</p>'''),
    input='<p>İlk satırda R ve C. Sonraki R satırda C karakterlik ızgara satırları.</p>',
    output='<p>Yol sayısı mod 10^9+7.</p>',
    constraints='1 ≤ R, C ≤ 500',
    samples=[('3 3\n...\n.#.\n...\n', 'Ortadaki paletin üstünden ya da altından: 2 yol.'),
             ('2 2\n.#\n#.\n', 'Hiç yol yok: 0.')],
    hidden=['1 1\n.\n', '1 1\n#\n', '1 5\n.....\n', '3 1\n.\n#\n.\n', '3 4\n....\n...#\n#...\n', '2 2\n..\n.#\n',
            {'gen': D('''
                print(500, 500)
                for _ in range(500):
                    print('.' * 500)
                ''')},
            {'gen': D('''
                import random
                random.seed(173)
                r = c = 500
                print(r, c)
                for i in range(r):
                    print(''.join('#' if random.random() < 0.08 and (i, j) not in ((0, 0), (r - 1, c - 1)) else '.' for j in range(c)))
                ''')}],
    start=D('''
        import sys
        satirlar = sys.stdin.read().split()
        r, c = int(satirlar[0]), int(satirlar[1])
        izgara = satirlar[2:2 + r]
        MOD = 10**9 + 7
        dp = [0] * c   # tek satırlık DP yeter
        '''),
    sol=D('''
        import sys
        satirlar = sys.stdin.read().split()
        r, c = int(satirlar[0]), int(satirlar[1])
        izgara = satirlar[2:2 + r]
        MOD = 10**9 + 7
        dp = [0] * c
        dp[0] = 1
        for i in range(r):
            satir = izgara[i]
            for j in range(c):
                if satir[j] == '#':
                    dp[j] = 0
                elif j > 0:
                    dp[j] = (dp[j] + dp[j - 1]) % MOD
        print(dp[c - 1])
        '''),
    brute=D('''
        import sys
        s = sys.stdin.read().split(); r, c = int(s[0]), int(s[1]); g = s[2:2+r]
        def f(i, j):
            if i >= r or j >= c or g[i][j] == '#': return 0
            if (i, j) == (r-1, c-1): return 1
            return f(i+1, j) + f(i, j+1)
        print(f(0, 0) % (10**9+7))
        '''),
    rnd=lambda r: (lambda R, C: f"{R} {C}\n" + ''.join(''.join(r.choice('..#') for _ in range(C)) + '\n' for _ in range(R)))(r.randint(1, 5), r.randint(1, 5)),
    editorial=D('''
        <p><b>Yaklaşım:</b> <code>dp[i][j]</code> = (i, j) hücresine yol sayısı = üstten gelen + soldan gelen: <code>dp[i−1][j] + dp[i][j−1]</code>. Dolu hücrede 0. Satır satır işlerken yalnız bir önceki satır gerektiği için tek boyutlu dizi yeter: <code>dp[j]</code> güncellenmeden önce "üst"ü, <code>dp[j−1]</code> ise zaten güncellenmiş "sol"u tutar.</p>
        <p><b>Karmaşıklık:</b> O(R · C) = 2,5·10^5 adım, bellek O(C).</p>
        <p><b>Naif çözüm neden yetmez:</b> Tüm yolları özyinelemeyle saymak, engelsiz 500×500 ızgarada C(998, 499) ≈ 10^299 yol demek; tek tek gezmek imkânsız. Ayrıca derinlik 1000\'i aşar.</p>
        <p><b>Sık hata:</b> Başlangıç hücresi doluyken <code>dp[0] = 1</code> bırakmak (döngüde ilk hücreyi de kontrol et) ve ilk sütundaki bir engelden sonra alttaki hücrelerin de 0 olması gerektiğini unutmak (tek boyutlu dizide <code>dp[0] = 0</code> kalıcı olur, bu yüzden doğru çalışır).</p>'''),
    hints=['Bir hücreye yalnız üstten ya da soldan gelinir.', 'Dolu hücrede yol sayısı 0; tek boyutlu dizi yeterli.']))

# ---------------------------------------------------------------- a-174
P.append(dict(
    id='a-174', title='İki tedarik listesinin en uzun ortak sırası', track=T, diff='Orta',
    tags=['LCS', '2B DP'], src='LeetCode 1143 Longest Common Subsequence / HackerRank Common Child benzeri',
    statement=D('''
        <p>Anadolu Market\'in iki bölge deposu, gün içinde gelen tedarikçi kamyonlarının sırasını harflerle kodluyor (her harf bir tedarikçi). Lojistik ekibi iki sıralamanın ne kadar benzediğini ölçmek için <b>en uzun ortak alt dizinin</b> (her iki metinde de aynı sırayla geçen, ardışık olması gerekmeyen karakterler) uzunluğunu istiyor.</p>'''),
    input='<p>İlk satırda metin A, ikinci satırda metin B (büyük İngilizce harfler).</p>',
    output='<p>LCS uzunluğu.</p>',
    constraints='1 ≤ |A|, |B| ≤ 1500',
    samples=[('ABCBDAB\nBDCABA\n', 'Örneğin "BCBA" her ikisinde de sırayla geçiyor: 4.'),
             ('ABC\nDEF\n', 'Ortak karakter yok: 0.')],
    hidden=['A\nA\n', 'A\nB\n', 'AAAA\nAA\n', 'HARRY\nSALLY\n', 'SHINCHAN\nNOHARAAA\n', 'ABCDEF\nFBDAMN\n',
            {'gen': D('''
                import random
                random.seed(174)
                print(''.join(random.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ') for _ in range(1500)))
                print(''.join(random.choice('ABCDEFGHIJKLMNOPQRSTUVWXYZ') for _ in range(1500)))
                ''')},
            {'gen': D('''
                import random
                random.seed(1740)
                print(''.join(random.choice('AB') for _ in range(1500)))
                print(''.join(random.choice('AB') for _ in range(1400)))
                ''')}],
    start=D('''
        a = input().strip()
        b = input().strip()
        onceki = [0] * (len(b) + 1)   # bir önceki satır
        '''),
    sol=D('''
        a = input().strip()
        b = input().strip()
        m = len(b)
        onceki = [0] * (m + 1)
        for ca in a:
            simdiki = [0] * (m + 1)
            for j in range(m):
                if ca == b[j]:
                    simdiki[j + 1] = onceki[j] + 1
                else:
                    x, y = onceki[j + 1], simdiki[j]
                    simdiki[j + 1] = x if x > y else y
            onceki = simdiki
        print(onceki[m])
        '''),
    brute=D('''
        from itertools import combinations
        a = input().strip(); b = input().strip(); best = 0
        def sub(s, t):
            it = iter(t); return all(c in it for c in s)
        for L in range(min(len(a), len(b)), 0, -1):
            if any(sub(c, b) for c in combinations(a, L)): best = L; break
        print(best)
        '''),
    rnd=lambda r: ''.join(r.choice('ABC') for _ in range(r.randint(1, 7))) + '\n' + ''.join(r.choice('ABC') for _ in range(r.randint(1, 7))) + '\n',
    editorial=D('''
        <p><b>Yaklaşım:</b> <code>dp[i][j]</code> = A\'nın ilk i ve B\'nin ilk j karakterinin LCS uzunluğu. Son karakterler eşitse <code>dp[i−1][j−1] + 1</code>; değilse birini atla: <code>max(dp[i−1][j], dp[i][j−1])</code>. Her satır yalnız bir öncekine baktığı için iki satır (O(|B|) bellek) yeter.</p>
        <p><b>Karmaşıklık:</b> O(|A| · |B|) = 2,25·10^6 hücre. CPython\'da iç döngüyü sade tutmak (yerel değişkenler, <code>max()</code> yerine karşılaştırma) belirgin hız kazandırır.</p>
        <p><b>Naif çözüm neden yetmez:</b> A\'nın tüm alt dizilerini (2^|A|) üretip B\'de aramak üsteldir; not almayan özyineleme de aynı alt problemleri katlanarak tekrarlar. 1500 karakterde ikisi de imkânsız.</p>
        <p><b>Sık hata:</b> Alt dizi (ardışık değil) ile alt metni (ardışık) karıştırmak: en uzun ortak <b>alt metin</b> sorusunda eşitsizlik durumunda 0 yazılır, max alınmaz. <b>Uzmanlaş:</b> Tabloyu geriye izleyerek LCS\'nin kendisini de üretebilirsin (o zaman tam tabloyu saklaman gerekir).</p>'''),
    hints=['Son karakterler eşitse 1 + dp[i−1][j−1], değilse max(üst, sol).', 'Yalnız önceki satırı tutarak belleği azalt.']))

# ---------------------------------------------------------------- a-175
P.append(dict(
    id='a-175', title='Arama kutusunda yazım düzeltme maliyeti', track=T, diff='Zor',
    tags=['düzenleme mesafesi', '2B DP', 'Levenshtein'], src='LeetCode 72 Edit Distance benzeri',
    statement=D('''
        <p>Anadolu Market\'in arama motoru, kullanıcının yazdığı kelimeyi katalogdaki ürün adına dönüştürmenin maliyetini Levenshtein mesafesiyle ölçüyor: tek bir karakter <b>ekleme</b>, <b>silme</b> ya da <b>değiştirme</b> 1 birim. En düşük maliyetli ürün "Bunu mu demek istediniz?" önerisi oluyor.</p>
        <p>Birinci kelimeyi ikinciye dönüştürmenin en az maliyetini yaz.</p>'''),
    input='<p>İlk satırda kaynak, ikinci satırda hedef kelime (küçük İngilizce harfler).</p>',
    output='<p>En az işlem sayısı.</p>',
    constraints='1 ≤ uzunluklar ≤ 1500',
    samples=[('horse\nros\n', 'horse → rorse (h→r) → rose (r sil) → ros (e sil): 3.'),
             ('intention\nexecution\n', '5 işlem gerekir.')],
    hidden=['a\na\n', 'a\nb\n', 'abc\nabcdef\n', 'kitten\nsitting\n', 'sunday\nsaturday\n', 'zzzz\na\n',
            {'gen': D('''
                import random
                random.seed(175)
                print(''.join(random.choice('abcdefghij') for _ in range(1500)))
                print(''.join(random.choice('abcdefghij') for _ in range(1500)))
                ''')},
            {'gen': D('''
                import random
                random.seed(1750)
                s = [random.choice('abcde') for _ in range(1500)]
                t = s[:]
                for _ in range(200):
                    t[random.randrange(len(t))] = random.choice('vwxyz')
                print(''.join(s))
                print(''.join(t[:1300]))
                ''')}],
    start=D('''
        a = input().strip()
        b = input().strip()
        onceki = list(range(len(b) + 1))   # boş kaynaktan b'nin önekine: j ekleme
        '''),
    sol=D('''
        a = input().strip()
        b = input().strip()
        m = len(b)
        onceki = list(range(m + 1))
        for i, ca in enumerate(a, 1):
            simdiki = [i] + [0] * m
            for j in range(m):
                if ca == b[j]:
                    simdiki[j + 1] = onceki[j]
                else:
                    x = onceki[j]
                    if onceki[j + 1] < x:
                        x = onceki[j + 1]
                    if simdiki[j] < x:
                        x = simdiki[j]
                    simdiki[j + 1] = x + 1
            onceki = simdiki
        print(onceki[m])
        '''),
    brute=D('''
        from functools import lru_cache
        a = input().strip(); b = input().strip()
        @lru_cache(None)
        def f(i, j):
            if i == len(a): return len(b) - j
            if j == len(b): return len(a) - i
            if a[i] == b[j]: return f(i+1, j+1)
            return 1 + min(f(i+1, j), f(i, j+1), f(i+1, j+1))
        print(f(0, 0))
        '''),
    rnd=lambda r: ''.join(r.choice('abc') for _ in range(r.randint(1, 8))) + '\n' + ''.join(r.choice('abc') for _ in range(r.randint(1, 8))) + '\n',
    editorial=D('''
        <p><b>Yaklaşım:</b> <code>dp[i][j]</code> = kaynağın ilk i karakterini hedefin ilk j karakterine çevirme maliyeti. Tabanlar: <code>dp[0][j] = j</code> (j ekleme), <code>dp[i][0] = i</code> (i silme). Son karakterler eşitse maliyet eklemeden <code>dp[i−1][j−1]</code>. Değilse 1 + üç seçeneğin en küçüğü: değiştir (<code>dp[i−1][j−1]</code>), sil (<code>dp[i−1][j]</code>), ekle (<code>dp[i][j−1]</code>). İki satırla O(m) bellek yeter.</p>
        <p><b>Karmaşıklık:</b> O(n · m) = 2,25·10^6 hücre. CPython\'da iç döngüde <code>min()</code> fonksiyon çağrısı yerine karşılaştırma yazmak ~2 kat hız kazandırır.</p>
        <p><b>Naif çözüm neden yetmez:</b> Not almayan özyineleme her eşitsizlikte 3 dala ayrılır: O(3^(n+m)). 1500 karakterde imkânsız; <code>lru_cache</code> ile not alsan bile özyineleme derinliği (n+m ≈ 3000) Python sınırını aşar ve 2,25·10^6 önbellek girdisi çok bellek yer.</p>
        <p><b>Sık hata:</b> Taban satır/sütunu 0 ile başlatmak (boş metne dönüşümün maliyeti 0 değildir) ve <code>simdiki[0] = i</code> atamasını unutmak.</p>'''),
    hints=['dp[i][j]: ilk i karakteri ilk j karaktere çevirme maliyeti.', 'Eşitse çapraz değer; değilse 1 + min(çapraz, üst, sol).', 'Taban: dp[0][j] = j, dp[i][0] = i.']))

# ---------------------------------------------------------------- a-176
P.append(dict(
    id='a-176', title='Kampanya kodunun gizli geçiş sayısı', track=T, diff='Zor',
    tags=['alt dizi sayma', '2B DP', 'mod'], src='LeetCode 115 Distinct Subsequences benzeri',
    statement=D('''
        <p>Anadolu Market, uzun bir reklam metninin içine bir kampanya kodu gizliyor: kod, metinden bazı karakterler silinerek (kalanların sırası korunarak) elde edilebiliyorsa "geçiyor" sayılır. Pazarlama ekibi kodun metinde <b>kaç farklı şekilde</b> geçtiğini, yani kodu oluşturan farklı indeks kümelerinin sayısını istiyor.</p>
        <p>Cevabı 10^9+7\'ye göre kalan olarak yaz.</p>'''),
    input='<p>İlk satırda metin s, ikinci satırda kod t (küçük İngilizce harfler).</p>',
    output='<p>Geçiş sayısı mod 10^9+7.</p>',
    constraints='1 ≤ |s| ≤ 5·10^4, 1 ≤ |t| ≤ 100',
    samples=[('rabbbit\nrabbit\n', 'Üç b\'den hangisinin atlanacağı seçilebilir: 3 yol.'),
             ('babgbag\nbag\n', '5 farklı indeks kümesi "bag" oluşturur.')],
    hidden=['a\na\n', 'a\nb\n', 'aaa\naaaa\n', 'aaaa\naa\n', 'abcabc\nabc\n', 'xyz\nxyz\n',
            {'gen': D('''
                import random
                random.seed(176)
                print(''.join(random.choice('ab') for _ in range(50000)))
                print(''.join(random.choice('ab') for _ in range(100)))
                ''')},
            {'gen': D('''
                import random
                random.seed(1760)
                print(''.join(random.choice('abcdefghijklmnopqrstuvwxyz') for _ in range(50000)))
                print(''.join(random.choice('abcdefghijklmnopqrstuvwxyz') for _ in range(100)))
                ''')}],
    start=D('''
        s = input().strip()
        t = input().strip()
        MOD = 10**9 + 7
        dp = [1] + [0] * len(t)   # dp[j] = t'nin ilk j karakterinin geçiş sayısı
        '''),
    sol=D('''
        from collections import defaultdict
        s = input().strip()
        t = input().strip()
        MOD = 10**9 + 7
        m = len(t)
        dp = [1] + [0] * m
        konumlar = defaultdict(list)
        for j in range(m - 1, -1, -1):
            konumlar[t[j]].append(j)
        for c in s:
            for j in konumlar.get(c, ()):
                dp[j + 1] = (dp[j + 1] + dp[j]) % MOD
        print(dp[m])
        '''),
    brute=D('''
        from itertools import combinations
        s = input().strip(); t = input().strip()
        print(sum(1 for c in combinations(range(len(s)), len(t)) if ''.join(s[i] for i in c) == t) % (10**9+7))
        '''),
    rnd=lambda r: ''.join(r.choice('ab') for _ in range(r.randint(1, 10))) + '\n' + ''.join(r.choice('ab') for _ in range(r.randint(1, 3))) + '\n',
    editorial=D('''
        <p><b>Yaklaşım:</b> <code>dp[i][j]</code> = s\'nin ilk i karakterinde t\'nin ilk j karakterinin kaç kez geçtiği. s[i] karakterini kullanmazsan <code>dp[i−1][j]</code>; s[i] == t[j] ise onu t\'nin j. karakteri olarak kullanmak <code>dp[i−1][j−1]</code> ekler. Taban: boş kod her önekte 1 kez geçer (<code>dp[·][0] = 1</code>).</p>
        <p><b>Bellek ve hız hilesi:</b> Tek boyutlu <code>dp[j]</code> yeter; ama j\'yi <b>azalan</b> sırada güncellemelisin ki aynı s karakteri iki kez kullanılmasın (0/1 sırt çantasındaki gibi). Ayrıca her s karakteri için yalnız t\'de o karakterin geçtiği konumları gezersen (önceden hazırlanmış, azalan sıralı liste) iş yükü |s| · |t| yerine çok daha az olur.</p>
        <p><b>Karmaşıklık:</b> En kötü O(|s| · |t|) = 5·10^6; tipik olarak çok daha az.</p>
        <p><b>Naif çözüm neden yetmez:</b> s\'den |t| uzunluğundaki tüm indeks kombinasyonlarını denemek C(|s|, |t|) — astronomik. Not almayan özyineleme de üstel.</p>
        <p><b>Sık hata:</b> j\'yi artan sırada güncellemek ("aaa" içinde "aa" için 3 yerine fazla sayar) ve mod almayı unutmak.</p>'''),
    hints=['dp[j]: kodun ilk j karakteri kaç farklı şekilde oluştu?', 's\'nin her karakteri için, t\'de eşleştiği konumları SONDAN başa güncelle.']))

# ---------------------------------------------------------------- a-177
P.append(dict(
    id='a-177', title='Joker karakterli dosya filtresi', track=T, diff='Zor',
    tags=['desen eşleme', '2B DP'], src='LeetCode 44 Wildcard Matching benzeri',
    statement=D('''
        <p>Kanat Havayolları\'nın raporlama sistemi, dosya adlarını joker karakterli desenlerle filtreliyor:</p>
        <ul><li><code>?</code> tam olarak bir karakterle eşleşir,</li><li><code>*</code> boş dahil herhangi bir karakter dizisiyle eşleşir,</li><li>diğer karakterler yalnız kendileriyle eşleşir.</li></ul>
        <p>Desen dosya adının <b>tamamıyla</b> eşleşiyorsa <code>EVET</code>, değilse <code>HAYIR</code> yaz.</p>'''),
    input='<p>İlk satırda dosya adı s (küçük harf, rakam, nokta, alt çizgi), ikinci satırda desen p (aynı karakterler ve <code>?</code>, <code>*</code>).</p>',
    output='<p><code>EVET</code> ya da <code>HAYIR</code>.</p>',
    constraints='1 ≤ |s| ≤ 1500, 1 ≤ |p| ≤ 1500',
    samples=[('rapor_2024.csv\nrapor_*.csv\n', '* "2024" ile eşleşir: EVET.'),
             ('ucus.log\n?cus.tx?\n', 'Uzantı "log" ile "tx?" eşleşmez: HAYIR.'),
             ('abc\n***a?c**\n', 'Yıldızlar boş eşleşebilir: EVET.')],
    hidden=['a\n*\n', 'a\n?\n', 'a\nb\n', 'ab\n?\n', 'aa\na\n', 'adceb\n*a*b\n', 'acdcb\na*c?b\n', 'mississippi\nm??*ss*?i*pi\n',
            {'gen': D('''
                print('a' * 1500)
                print('*a' * 749 + 'b')
                ''')},
            {'gen': D('''
                print('a' * 1500)
                print('a*' * 750)
                ''')},
            {'gen': D('''
                import random
                random.seed(177)
                s = ''.join(random.choice('ab') for _ in range(1500))
                p = list(s)
                for i in range(0, 1500, 7):
                    p[i] = '?'
                for i in range(3, 1500, 37):
                    p[i] = '*'
                print(s)
                print(''.join(p))
                ''')}],
    start=D('''
        s = input().strip()
        p = input().strip()
        # dp[j] = desenin ilk j karakteri, s'nin şu ana kadarki önekiyle eşleşiyor mu?
        '''),
    sol=D('''
        s = input().strip()
        p = input().strip()
        m = len(p)
        onceki = [False] * (m + 1)
        onceki[0] = True
        for j in range(m):
            onceki[j + 1] = onceki[j] and p[j] == '*'
        for c in s:
            simdiki = [False] * (m + 1)
            for j in range(m):
                pj = p[j]
                if pj == '*':
                    simdiki[j + 1] = simdiki[j] or onceki[j + 1]
                elif pj == '?' or pj == c:
                    simdiki[j + 1] = onceki[j]
            onceki = simdiki
        print('EVET' if onceki[m] else 'HAYIR')
        '''),
    brute=D('''
        import re
        s = input().strip(); p = input().strip()
        rx = ''.join('.*' if ch == '*' else '.' if ch == '?' else re.escape(ch) for ch in p)
        print('EVET' if re.fullmatch(rx, s) else 'HAYIR')
        '''),
    rnd=lambda r: ''.join(r.choice('ab') for _ in range(r.randint(1, 7))) + '\n' + ''.join(r.choice('ab?*') for _ in range(r.randint(1, 6))) + '\n',
    editorial=D('''
        <p><b>Yaklaşım:</b> <code>dp[i][j]</code> = s\'nin ilk i karakteri ile desenin ilk j karakteri eşleşiyor mu. Desen karakteri <code>?</code> ya da aynı harfse <code>dp[i−1][j−1]</code>. <code>*</code> ise iki seçenek: boş eşleşir (<code>dp[i][j−1]</code>) ya da bir karakter daha yutar (<code>dp[i−1][j]</code>). Taban: <code>dp[0][0] = True</code>; <code>dp[0][j]</code> yalnız desenin ilk j karakteri hep <code>*</code> ise True.</p>
        <p><b>Karmaşıklık:</b> O(|s| · |p|) ≈ 2,25·10^6, iki satırla O(|p|) bellek.</p>
        <p><b>Naif çözüm neden yetmez:</b> Her <code>*</code> için "kaç karakter yutsun?" sorusunu geri izlemeli (backtracking) denemek, gizli testteki gibi çok yıldızlı ve sonunda başarısız olan desenlerde üstel patlar. Desenin regex\'e çevrilmesi de aynı nedenle "felaket geri izleme"ye (catastrophic backtracking) düşebilir.</p>
        <p><b>Alternatif:</b> Son görülen <code>*</code> konumunu hatırlayan açgözlü iki işaretçi yöntemi O(|s| · |p|) en kötü, pratikte O(|s| + |p|) çalışır. <b>Sık hata:</b> Taban satırda baştaki yıldızları hesaba katmamak.</p>'''),
    hints=['* için iki seçenek: boş eşleş ya da bir karakter daha yut.', 'Taban satır: desenin başı yalnız yıldızlardan oluşuyorsa boş metinle eşleşir.']))

# ---------------------------------------------------------------- a-178
P.append(dict(
    id='a-178', title='SMS doğrulama kodunu çözme yolları', track=T, diff='Orta',
    tags=['1B DP', 'sayma', 'mod'], src='LeetCode 91 Decode Ways benzeri',
    statement=D('''
        <p>Anadolu Bank\'ın eski bir SMS sistemi harfleri sayıya çevirerek gönderiyor: A → 1, B → 2, ..., Z → 26. Ayraç olmadığı için "12" hem "AB" hem "L" olabilir. Güvenlik ekibi, gelen rakam dizisinin <b>kaç farklı harf dizisine</b> çözülebileceğini merak ediyor.</p>
        <p>Çözüm sayısını 10^9+7\'ye göre kalan olarak yaz. "0" tek başına bir harf değildir; "05" gibi başında sıfır olan iki basamaklı kod da geçersizdir. Hiç çözüm yoksa 0 yaz.</p>'''),
    input='<p>Tek satırda rakam dizisi.</p>',
    output='<p>Çözüm sayısı mod 10^9+7.</p>',
    constraints='1 ≤ uzunluk ≤ 10^5',
    samples=[('226\n', '"BZ" (2 26), "VF" (22 6), "BBF" (2 2 6): 3.'),
             ('06\n', 'Baştaki 0 hiçbir harfe karşılık gelmez: 0.')],
    hidden=['1\n', '0\n', '10\n', '27\n', '100\n', '1201234\n', '2611055971756562\n', '301\n',
            {'gen': D('''
                print('1' * 100000)
                ''')},
            {'gen': D('''
                import random
                random.seed(178)
                parca = []
                uzunluk = 0
                while uzunluk < 99998:
                    t = random.choice(['1', '2', '1', '2', '3', '7', '9', '10', '20', '26', '27'])
                    parca.append(t)
                    uzunluk += len(t)
                print(''.join(parca))
                ''')}],
    start=D('''
        s = input().strip()
        MOD = 10**9 + 7
        # onceki2 = dp[i-2], onceki1 = dp[i-1]
        '''),
    sol=D('''
        s = input().strip()
        MOD = 10**9 + 7
        onceki2, onceki1 = 1, 1
        for i, c in enumerate(s):
            simdi = 0
            if c != '0':
                simdi = onceki1
            if i > 0 and (s[i - 1] == '1' or (s[i - 1] == '2' and c <= '6')):
                simdi += onceki2
            onceki2, onceki1 = onceki1, simdi % MOD
        print(onceki1)
        '''),
    brute=D('''
        s = input().strip()
        def f(i):
            if i == len(s): return 1
            if s[i] == '0': return 0
            r = f(i+1)
            if i + 1 < len(s) and 10 <= int(s[i:i+2]) <= 26: r += f(i+2)
            return r
        print(f(0) % (10**9+7))
        '''),
    rnd=lambda r: ''.join(r.choice('0122367') for _ in range(r.randint(1, 12))) + '\n',
    editorial=D('''
        <p><b>Yaklaşım:</b> <code>dp[i]</code> = ilk i rakamın çözüm sayısı. Son harf ya tek rakamdır (rakam 0 değilse <code>dp[i−1]</code> ekler) ya da iki rakamdır (10–26 arasındaysa <code>dp[i−2]</code> ekler). <code>dp[0] = 1</code>. Yalnız son iki değer gerekir.</p>
        <p><b>Karmaşıklık:</b> O(n) zaman, O(1) bellek.</p>
        <p><b>Naif çözüm neden yetmez:</b> Not almayan özyineleme her adımda ikiye dallanır: "111...1" (10^5 tane) için Fibonacci(10^5) çağrı; ayrıca özyineleme derinliği aşılır. Cevap bile ~20.000 basamaklı bir sayı olurdu; bu yüzden mod istenir.</p>
        <p><b>Sık hata:</b> Sıfırları yanlış ele almak: "10" ve "20" yalnız iki basamaklı olarak çözülebilir; "30", "00" çözülemez. Bir de "06"yı geçerli iki basamaklı kod saymak (sayıya çevirince 6 olur, ama ön ek sıfır yasak).</p>'''),
    hints=['Son harf ya bir ya iki rakamdan oluşur.', '0 tek başına geçersiz; iki basamak 10..26 arasında olmalı.']))
