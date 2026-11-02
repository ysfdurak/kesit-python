import sys
G = '/tmp/claude-0/-home-claude/6c066959-3fcb-54bb-bdf1-c8ae148dfc4c/scratchpad/gen'
sys.path.insert(0, G)
from emit import PY, CODE, write

LL = '''class Dugum:
    def __init__(self, deger, sonraki=None):
        self.deger = deger
        self.sonraki = sonraki

def listeden(degerler):
    bas = None
    for d in reversed(degerler):
        bas = Dugum(d, bas)
    return bas

def listeye(bas, sinir=100):
    sonuc = []
    while bas and len(sonuc) < sinir:
        sonuc.append(bas.deger)
        bas = bas.sonraki
    return sonuc
'''
TREE = '''class Agac:
    def __init__(self, deger, sol=None, sag=None):
        self.deger = deger
        self.sol = sol
        self.sag = sag
'''

body = '''
<h2>Neden ikinci bir kalıp dersi?</h2>
<p><code>algoritmalar</code> ve <code>mulakat-hazirlik</code> derslerinde dizi, sözlük, iki işaretçi, kayan pencere, ikili arama, BFS ve tek boyutlu dinamik programlama kalıplarını gördün. Teknik mülakatların ikinci yarısı genellikle <b>işaretçi tabanlı yapılar</b> (bağlı liste, ağaç, trie), <b>ileri graf</b> (ağırlıklı en kısa yol, bağımlılık sırası, bağlı bileşenler), <b>aralıklar</b> ve <b>iki boyutlu DP</b> üzerinedir. Bu kalıplar iş hayatında da karşına çıkar: Kanat Havayolları\'nda en kısa aktarma rotası, Pusula İK\'da organizasyon ağacı, Lezzet Kurye\'de aynı anda yoldaki kurye sayısı, arama kutusunda otomatik tamamlama.</p>
<p>Bu derste her kalıbın <b>tanıma ipucunu</b>, Python iskeletini ve karmaşıklığını öğreneceksin; örneklerin çoğu gerçek veri setleri üzerinde çalışır.</p>

<h2>1. Bağlı liste problemleri</h2>
<p><code>veri-yapilari</code> dersinde düğümlerden bağlı liste kurdun. Mülakat soruları genelde üç işaretçi hilesine dayanır: <b>ters çevirme</b> (önceki/şimdiki/sonraki), <b>hızlı-yavaş işaretçi</b> (Floyd: döngü tespiti, ortadaki eleman) ve <b>sahte baş düğüm</b> (dummy head: birleştirme, silme).</p>
''' + PY(LL + r'''

def ters_cevir(bas):
    onceki = None
    while bas:
        bas.sonraki, onceki, bas = onceki, bas, bas.sonraki
    return onceki

def dongu_var_mi(bas):
    yavas = hizli = bas
    while hizli and hizli.sonraki:
        yavas, hizli = yavas.sonraki, hizli.sonraki.sonraki
        if yavas is hizli:
            return True
    return False

rota = listeden(["Depo", "Konak", "Alsancak", "Bornova"])
print(listeye(ters_cevir(rota)))
dongulu = listeden([1, 2, 3, 4])
dongulu.sonraki.sonraki.sonraki.sonraki = dongulu.sonraki   # 4 → 2
print(dongu_var_mi(dongulu), dongu_var_mi(listeden([1, 2, 3])))
''') + '''
<div class="tip"><b>Floyd\'un ikinci aşaması</b>Hızlı ve yavaş işaretçi buluştuktan sonra birini başa al, ikisini de birer adım ilerlet: tekrar buluştukları düğüm döngünün <b>başlangıcıdır</b>. Ek bellek O(1), süre O(n).</div>

<h2>2. Ağaçlar: gezinme, derinlik, BST, LCA</h2>
<p>Ağaç sorularının çoğu tek bir özyinelemeli fikre indirgenir: "sol alt ağaç için cevabı bil, sağ alt ağaç için cevabı bil, ikisini birleştir". <b>Derinlik öncelikli</b> (DFS) gezinmenin üç sırası vardır: <b>pre-order</b> (kök, sol, sağ: ağacı kopyalamak), <b>in-order</b> (sol, kök, sağ: BST\'de sıralı çıktı), <b>post-order</b> (sol, sağ, kök: alt ağaç boyutu, silme). <b>Genişlik öncelikli</b> (BFS) gezinme ise kuyrukla seviye seviye ilerler.</p>
''' + PY(TREE + r'''
from collections import deque

kok = Agac(8, Agac(3, Agac(1), Agac(6)), Agac(10, None, Agac(14)))

def inorder(d):
    return inorder(d.sol) + [d.deger] + inorder(d.sag) if d else []

def derinlik(d):
    return 1 + max(derinlik(d.sol), derinlik(d.sag)) if d else 0

def seviyeler(kok):
    sonuc, q = [], deque([kok] if kok else [])
    while q:
        sonuc.append([d.deger for d in q])
        q = deque(c for d in q for c in (d.sol, d.sag) if c)
    return sonuc

print("in-order:", inorder(kok), "derinlik:", derinlik(kok))
print("seviyeler:", seviyeler(kok))
''') + '''
<p><b>BST doğrulama</b>da sık yapılan hata yalnız çocuklarla karşılaştırmaktır; doğru yöntem her düğüme izin verilen <b>(alt, üst) aralığını</b> aşağı taşımaktır. <b>En yakın ortak ata</b> (Lowest Common Ancestor, LCA) ise organizasyon ağacında "iki çalışanın ortak yöneticisi" sorusudur: ebeveyn işaretçisi varsa birinin atalarını kümeye koyup diğerinden yukarı çıkarsın.</p>

<h2>3. Trie: önek ağacı ve otomatik tamamlama</h2>
<p><b>Trie</b>, her kenarı bir karakter olan bir ağaçtır; aynı öneki paylaşan kelimeler aynı yolu paylaşır. "Bu önekle başlayan kelime var mı?" sorusu kelime sayısından bağımsız, yalnız önek uzunluğu kadar (O(L)) sürer. Anadolu Market arama kutusundaki ürün önerisi tipik kullanımdır:</p>
''' + PY(r'''
import veri

class Trie:
    def __init__(self):
        self.kok = {}

    def ekle(self, kelime):
        dugum = self.kok
        for harf in kelime:
            dugum = dugum.setdefault(harf, {})
        dugum["$"] = True                       # kelime sonu işareti

    def tamamla(self, onek, k=5):
        dugum = self.kok
        for harf in onek:
            if harf not in dugum:
                return []
            dugum = dugum[harf]
        sonuc, yigin = [], [(dugum, onek)]
        while yigin and len(sonuc) < k:
            d, yol = yigin.pop()
            if "$" in d:
                sonuc.append(yol)
            for harf in sorted((h for h in d if h != "$"), reverse=True):
                yigin.append((d[harf], yol + harf))
        return sonuc

t = Trie()
for urun in veri.kayitlar("anadolu_market", "products"):
    t.ekle(urun["name"].replace("İ", "i").replace("I", "ı").lower())
print(t.tamamla("k", 4))
print(t.tamamla("su"), t.tamamla("xyz"))
''') + '''

<h2>4. İleri graf: Dijkstra, topolojik sıralama, union-find</h2>
<p><b>Dijkstra</b>, kenar ağırlıkları negatif olmayan grafta tek kaynaktan en kısa yolları bulur: bir öncelik kuyruğundan (heapq) her seferinde en yakın düğümü çıkar, komşuların mesafesini gevşet (relax). Kuyruktan eski (stale) bir kayıt çıkarsa atla. Karmaşıklık O((V + E) log V). Kanat Havayolları\'nın gerçek rota tablosunda Berlin\'den Ankara\'ya en kısa yol:</p>
''' + PY(r'''
import heapq
from collections import defaultdict

graf = defaultdict(list)
for r in veri.kayitlar("kanat_havayollari", "hv_routes"):
    graf[r["origin"]].append((r["dest"], r["distance_km"]))

def dijkstra(bas, hedef):
    mesafe, onceki = {bas: 0}, {}
    kuyruk = [(0, bas)]
    while kuyruk:
        d, u = heapq.heappop(kuyruk)
        if u == hedef:
            yol = [u]
            while yol[-1] != bas:
                yol.append(onceki[yol[-1]])
            return d, yol[::-1]
        if d > mesafe[u]:
            continue                            # eski kayıt
        for v, w in graf[u]:
            if d + w < mesafe.get(v, float("inf")):
                mesafe[v], onceki[v] = d + w, u
                heapq.heappush(kuyruk, (d + w, v))
    return None

print(dijkstra("BER", "ESB"))
print(dijkstra("FRA", "BER"))
''') + '''
<p>BER→ESB için en az aktarmalı yollar iki tane (SAW-ADB ve SAW-AYT üzerinden, ikisi de 3 uçuş); BFS hangisini önce bulursa onu verir, Dijkstra ise kilometreye bakarak AYT üzerinden olanı (2618 km) seçer. <b>Negatif ağırlık</b> varsa Dijkstra yanlış sonuç verir; Bellman-Ford gerekir.</p>
<p><b>Topolojik sıralama</b>, yönlü döngüsüz grafta (DAG) her kenarın (a → b) a\'yı b\'den önce koyan sıralamadır: derleme sırası, veri hattı görevleri, ön koşullu dersler, departman hiyerarşisi. Kahn algoritması giriş derecesi 0 olanlardan başlar; tüm düğümler çıkarılamıyorsa döngü vardır. <b>Union-find</b> (ayrık küme, disjoint set) ise "bu iki öğe aynı grupta mı?" sorusunu neredeyse O(1)\'de cevaplar; yol sıkıştırma (path compression) ve boyuta göre birleştirme ile.</p>
''' + PY(r'''
departman = veri.kayitlar("pusula_ik", "ik_departments")
ad = {d["dept_id"]: d["name"] for d in departman}
giris = {d["name"]: 0 for d in departman}
cocuk = defaultdict(list)
for d in departman:
    if d["parent_id"] is not None:
        cocuk[ad[d["parent_id"]]].append(d["name"])
        giris[d["name"]] += 1
hazir = sorted(n for n, g in giris.items() if g == 0)
sira = []
while hazir:
    u = hazir.pop(0)
    sira.append(u)
    for v in cocuk[u]:
        giris[v] -= 1
        if giris[v] == 0:
            hazir.append(v)
print(sira[:6], "...", len(sira) == len(giris))

ebeveyn = {}
def bul(x):
    ebeveyn.setdefault(x, x)
    while ebeveyn[x] != x:
        ebeveyn[x] = ebeveyn[ebeveyn[x]]        # yol sıkıştırma (yarılama)
        x = ebeveyn[x]
    return x
for a, b in [("ali", "ayse"), ("veli", "can"), ("ayse", "can")]:
    ebeveyn[bul(a)] = bul(b)
print(bul("ali") == bul("veli"), bul("ali") == bul("zeynep"))
''') + '''

<h2>5. Aralıklar ve sweep line</h2>
<p>Aralık problemlerinin anahtarı <b>başlangıca göre sıralamaktır</b>. Birleştirme (merge), ekleme (insert) ve çakışma kontrolü bu sıralamadan sonra tek geçişle çözülür. "Aynı anda en çok kaç ...?" sorusu ise <b>sweep line</b> (süpürme çizgisi) ile çözülür: her aralığı (+1 başlangıç, −1 bitiş) olaylarına çevir, zamana göre sırala, sayacı gez. Aynı anda biten ve başlayan olayda bitişi önce işlemek, yarı açık [başlangıç, bitiş) aralığı anlamına gelir.</p>
''' + PY(r'''
olaylar = []
for s in veri.kayitlar("lezzet_kurye", "lk_orders"):
    if s["picked_at"] and s["delivered_at"]:
        olaylar += [(s["picked_at"], 1), (s["delivered_at"], -1)]
olaylar.sort()                                  # aynı saniyede -1, +1'den önce gelir
yolda = en_cok = 0
for zaman, degisim in olaylar:
    yolda += degisim
    if yolda > en_cok:
        en_cok, an = yolda, zaman
print(f"{len(olaylar) // 2} teslimat; aynı anda en çok {en_cok} kurye yolda ({an})")
''') + '''

<h2>6. İki boyutlu dinamik programlama</h2>
<p>İki dizi ya da bir ızgara üzerinde "en uzun / en az / kaç yol" soruları genelde <b>2B DP</b>\'dir: <code>dp[i][j]</code> = ilk dizinin ilk i, ikincinin ilk j elemanı için cevap. <code>algoritmalar</code> dersinde LCS\'yi gördün. <b>Düzenleme mesafesi</b> (edit distance, Levenshtein) bir metni diğerine çeviren en az ekleme/silme/değiştirme sayısıdır; adres ve şehir adlarındaki yazım hatalarını eşleştirmede kullanılır. Her satır yalnız bir önceki satıra baktığı için tabloyu iki satıra indirip belleği O(n·m)\'den O(m)\'ye düşürebilirsin.</p>
''' + PY(r'''
def duzenleme(a, b):
    onceki = list(range(len(b) + 1))           # boş a → b'nin ilk j harfi: j ekleme
    for i in range(1, len(a) + 1):
        simdiki = [i] + [0] * len(b)
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                simdiki[j] = onceki[j - 1]
            else:
                simdiki[j] = 1 + min(onceki[j], simdiki[j - 1], onceki[j - 1])
        onceki = simdiki
    return onceki[-1]

for yazilan in ["Eskisehir", "Kayseeri", "Ankra", "İzmir"]:
    print(yazilan, "→", min(["Eskişehir", "Kayseri", "Ankara", "İzmir"], key=lambda s: duzenleme(yazilan, s)))
''') + '''

<h2>7. Bit manipülasyonu</h2>
<div class="tbl-wrap"><table>
<tr><th>İfade</th><th>Anlamı</th><th>Kullanım</th></tr>
<tr><td><code>x &amp; 1</code></td><td>Son bit</td><td>Tek mi çift mi</td></tr>
<tr><td><code>x &amp; (x - 1)</code></td><td>En sağdaki 1 bitini siler</td><td>Bit sayma (Kernighan), 2\'nin kuvveti mi?</td></tr>
<tr><td><code>a ^ a == 0</code>, <code>a ^ 0 == a</code></td><td>XOR kendini götürür</td><td>Çiftler arasında tek kalanı bulma</td></tr>
<tr><td><code>maske | BAYRAK</code>, <code>maske &amp; ~BAYRAK</code></td><td>Bayrak aç / kapat</td><td>Yetki maskeleri</td></tr>
<tr><td><code>x.bit_count()</code></td><td>1 bitlerinin sayısı (Python 3.10+)</td><td>Hazır ve hızlı</td></tr>
</table></div>

<h2>8. Kalıp tanıma tablosu</h2>
<div class="tbl-wrap"><table>
<tr><th>Soruda ne görüyorsun?</th><th>Kalıp (NeetCode kategorisi)</th><th>Karmaşıklık</th></tr>
<tr><td>Düğüm, "sonraki", döngü, ortadaki eleman</td><td>Linked List: hızlı-yavaş işaretçi, dummy head</td><td>O(n), O(1) bellek</td></tr>
<tr><td>Hiyerarşi, "alt ağaç", "seviye"</td><td>Trees: DFS özyineleme / BFS kuyruk</td><td>O(n)</td></tr>
<tr><td>Önek, otomatik tamamlama, sözlükte kelime arama</td><td>Tries</td><td>O(L) sorgu</td></tr>
<tr><td>Ağırlıklı en kısa yol, negatif ağırlık yok</td><td>Advanced Graphs: Dijkstra</td><td>O((V+E) log V)</td></tr>
<tr><td>Bağımlılık, ön koşul, "hangi sırayla"</td><td>Graphs: topolojik sıralama</td><td>O(V+E)</td></tr>
<tr><td>"Aynı grupta mı", dinamik bağlantı</td><td>Graphs: union-find</td><td>~O(α(n))</td></tr>
<tr><td>Zaman aralıkları, çakışma, "aynı anda en çok"</td><td>Intervals: sırala + tara, sweep line</td><td>O(n log n)</td></tr>
<tr><td>İki dizi/ızgara, "en az işlem", "kaç yol"</td><td>2-D DP</td><td>O(n·m)</td></tr>
<tr><td>"Ekstra bellek kullanmadan", tek kalan, bayraklar</td><td>Bit Manipulation</td><td>O(n), O(1)</td></tr>
</table></div>
<div class="warn"><b>Özyineleme derinliği</b>Python\'ın varsayılan özyineleme sınırı yaklaşık 1000\'dir. Çok derin (ör. tek kollu, 10 000 düğümlü) ağaçlarda özyinelemeli DFS <code>RecursionError</code> verir; mülakatta bunu söylemek ve yığınla yinelemeli sürümü önermek artı puandır.</div>
<div class="note"><b>Gerçek işte</b>Bu yapılar günlük kodda genelde kütüphaneler içinde saklıdır: Dijkstra rota servislerinde ve <code>networkx</code>\'te, topolojik sıralama Airflow ve dbt\'nin görev planlayıcısında, trie arama motorlarının öneri katmanında, düzenleme mesafesi veri temizleme ve kayıt eşleştirmede (<code>rapidfuzz</code>), sweep line kapasite planlamasında. Mülakattaki değer, doğru yapıyı tanıyıp karmaşıklığını konuşabilmektir; işte ise önce hazır ve test edilmiş kütüphaneyi seçersin.</div>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>A* ve iki yönlü arama</h3>
<p>Hedef biliniyorsa Dijkstra\'yı bir sezgisel tahminle (heuristic, ör. kuş uçuşu mesafe: <code>hv_airports</code> enlem-boylamından) yönlendiren A* çok daha az düğüm açar. Sezgisel gerçek mesafeyi asla aşmamalıdır (admissible).</p>
<h3>Segment ağacı ve Fenwick ağacı</h3>
<p>Aralık toplamı sorgusu ve tek eleman güncellemesi birlikte gerekiyorsa önek toplamı yetmez (güncelleme O(n)); segment ağacı ya da Fenwick ağacı ikisini de O(log n)\'de yapar.</p>
<h3>DP\'de durum tasarımı</h3>
<p>2B DP\'nin zor kısmı formül değil durum tanımıdır: "dp[i][j] neyi temsil ediyor?" cümlesini yüksek sesle kur, taban durumlarını (boş dizi, ilk satır) ayrıca yaz, sonra geçişi çıkar. Belleği azaltmak için hangi önceki hücrelere bakıldığını tabloda işaretle.</p>
</section>
'''

ex = []
ex.append(dict(t='mc', stage='Isınma',
    q='Lezzet Kurye operasyon ekibi "geçen ay aynı anda en çok kaç kurye yoldaydı?" diye soruyor. Elinde her teslimatın alınma ve teslim zamanı var. Hangi kalıp?',
    o=['Her teslimatı diğer tüm teslimatlarla karşılaştıran iç içe döngü', 'Başlangıç/bitiş olaylarını zamana göre sıralayıp sayaçla tarayan sweep line', 'Teslimatları bir trie\'ye ekleyip zaman öneklerini saymak', 'Teslimatlar arasında union-find ile bağlı bileşen bulmak'], a=1,
    why='Her aralık bir +1 ve bir −1 olayına dönüşür; sıralayıp tek geçişte sayaç gezilir: O(n log n). İç içe döngü O(n²) olur ve 7 bin teslimatta bile gereksiz yavaştır.'))
ex.append(dict(t='mc', stage='Isınma',
    q='Bir ikili ağacın geçerli bir BST (ikili arama ağacı) olup olmadığını doğrulamanın güvenilir yolu hangisi?',
    o=['Her düğümün sol çocuğu küçük, sağ çocuğu büyükse ağaç BST\'dir', 'Her düğüme izin verilen (alt, üst) aralığını aşağı taşıyıp kontrol etmek', 'Ağacın derinliği log2(n) değerini aşmıyorsa ağaç BST kabul edilir', 'Seviye seviye (BFS) gezip her seviyenin sıralı olup olmadığına bakmak'], a=1,
    why='Yalnız çocuklara bakmak, torunun dedeyle çeliştiği durumu kaçırır (ör. 10\'un sol alt ağacında 12). Aralık taşımak ya da in-order gezinmenin kesin artan olduğunu kontrol etmek doğru yöntemlerdir.'))
ex.append(dict(t='mc', stage='Isınma',
    q='Bir ödül programında bazı aktarmalar mil kazandırıyor (negatif maliyet). En düşük maliyetli rotayı bulmak için Dijkstra kullanılabilir mi?',
    o=['Evet; Dijkstra her türlü kenar ağırlığıyla her zaman doğru çalışır', 'Hayır; negatif kenarda Dijkstra yanılabilir, Bellman-Ford gerekir', 'Evet; yeter ki öncelik kuyruğu yerine sıradan bir kuyruk kullanılsın', 'Hayır; en kısa yol kavramı yalnızca ağırlıksız graflarda tanımlıdır'], a=1,
    why='Dijkstra kuyruktan çıkan düğümün mesafesini kesinleşmiş sayar; negatif bir kenar bu varsayımı bozar. Bellman-Ford O(V·E) sürede negatif kenarları (ve negatif döngüyü) ele alır.'))
ex.append(dict(t='predict', stage='Kodu oku',
    q='Kernighan bit sayma yöntemi. Bu kod ne yazdırır?',
    code='x = 13\nadim = 0\nwhile x:\n    x &= x - 1\n    adim += 1\nprint(adim, bin(13), (13).bit_count())\n',
    o=['3 0b1101 3', '4 0b1101 3', '13 0b1101 3', '3 0b1011 3'], a=0,
    why='13 = 0b1101; x &= x - 1 her turda en sağdaki 1 bitini siler: 1101 → 1100 → 1000 → 0, yani 3 tur. Döngü bit uzunluğu kadar değil, 1 biti kadar döner.'))
ex.append(dict(t='predict', stage='Kodu oku',
    q='Bu ağaç gezinmesi ne yazdırır?',
    code='class A:\n    def __init__(self, d, sol=None, sag=None):\n        self.d, self.sol, self.sag = d, sol, sag\n\ndef post(n):\n    return post(n.sol) + post(n.sag) + [n.d] if n else []\n\ndef ino(n):\n    return ino(n.sol) + [n.d] + ino(n.sag) if n else []\n\nk = A(8, A(3, A(1), A(6)), A(10, None, A(14)))\nprint(ino(k))\nprint(post(k))\n',
    o=['[1, 3, 6, 8, 10, 14]\n[1, 6, 3, 14, 10, 8]', '[8, 3, 1, 6, 10, 14]\n[1, 6, 3, 14, 10, 8]', '[1, 3, 6, 8, 10, 14]\n[14, 10, 8, 6, 3, 1]', '[1, 3, 6, 8, 10, 14]\n[1, 3, 6, 10, 14, 8]'], a=0,
    why='BST\'de in-order (sol, kök, sağ) sıralı çıktı verir. Post-order (sol, sağ, kök) kökü en sona koyar: önce 3\'ün alt ağacı (1, 6, 3), sonra 10\'unki (14, 10), en son 8.'))
ex.append(dict(t='predict', stage='Kodu oku',
    q='XOR ile çiftler arasında tek kalanı bulma. Bu kod ne yazdırır?',
    code='from functools import reduce\nfrom operator import xor\n\nkodlar = [4471, 1205, 3310, 1205, 4471]\nprint(reduce(xor, kodlar), 7 ^ 7, 7 ^ 0)\n',
    o=['3310 0 7', '4471 0 7', '3310 7 0', '0 0 7'], a=0,
    why='a ^ a = 0 ve a ^ 0 = a; XOR değişmeli ve birleşmelidir. Çift geçen kodlar birbirini götürür, tek geçen 3310 kalır. Ek bellek gerektirmez.'))
ex.append(dict(t='order', stage='Kodu oku',
    q='<p>Floyd\'un hızlı-yavaş işaretçi algoritmasıyla bağlı listede döngü olup olmadığını bulan fonksiyonun satırlarını sırala (Dugum sınıfı ve liste kurulumu hazır kabul edilmiş, ilk satırlarda).</p>',
    lines=['class Dugum:',
           '    def __init__(self, d, s=None): self.d, self.sonraki = d, s',
           'def dongu_var_mi(bas):',
           '    yavas = hizli = bas',
           '    while hizli and hizli.sonraki:',
           '        yavas, hizli = yavas.sonraki, hizli.sonraki.sonraki',
           '        if yavas is hizli:',
           '            return True',
           '    return False'],
    tests='c = Dugum(3)\nb = Dugum(2, c)\na = Dugum(1, b)\nassert dongu_var_mi(a) is False\nc.sonraki = a\nassert dongu_var_mi(a) is True\n',
    hint='İki işaretçi aynı yerden başlar; hızlı olan iki adım atar. Buluşma kontrolü ilerledikten sonra yapılır.',
    why='Döngü yoksa hızlı işaretçi listenin sonuna ulaşır; varsa döngü içinde yavaşı her turda bir adım yakalar ve mutlaka buluşurlar. Kontrol ilerlemeden önce yapılsaydı ilk turda (ikisi de baştayken) yanlışlıkla True dönerdi.'))

ex.append(dict(t='code', id='mulakat-kaliplari-2-1', stage='Rehberli', diff=1,
    q='<p>İki <b>sıralı</b> bağlı listeyi tek sıralı listede birleştir: <code>birlestir(a, b)</code> yeni listenin başını döndürsün. Yeni düğüm oluşturma, var olan düğümleri bağla. Eşit değerlerde <code>a</code>\'nınki önce gelsin. <code>Dugum</code>, <code>listeden</code> ve <code>listeye</code> hazır.</p>',
    guide=['Sahte bir baş düğüm (dummy) ve onu izleyen bir "kuyruk" işaretçisi oluştur.', 'İki liste de boş değilken küçük (eşitse a) olanı kuyruğa bağla ve o listede ilerle.', 'Döngü bitince kalan listeyi (a or b) kuyruğun sonuna bağla.', 'dummy.sonraki\'yi döndür.'],
    example='kalan_a, kalan_b = [5, 9], []\nprint(kalan_a or kalan_b)\n',
    start=LL + '\ndef birlestir(a, b):\n    sahte = Dugum(None)\n    kuyruk = sahte\n    # TODO: küçük olanı bağla, ilerle; sonra kalanı ekle\n    return sahte.sonraki\n',
    sol=LL + '\ndef birlestir(a, b):\n    sahte = Dugum(None)\n    kuyruk = sahte\n    while a and b:\n        if a.deger <= b.deger:\n            kuyruk.sonraki, a = a, a.sonraki\n        else:\n            kuyruk.sonraki, b = b, b.sonraki\n        kuyruk = kuyruk.sonraki\n    kuyruk.sonraki = a or b\n    return sahte.sonraki\n',
    tests='a = listeden([1, 4, 4, 9])\nb = listeden([2, 4, 10])\nilk_a4 = a.sonraki\nr = birlestir(a, b)\nassert listeye(r) == [1, 2, 4, 4, 4, 9, 10], f"Gelen {listeye(r)}"\nassert r.sonraki.sonraki is ilk_a4, "Eşit değerlerde a\'nın düğümü önce gelmeli ve yeni düğüm oluşturulmamalı"\nassert listeye(birlestir(None, listeden([3]))) == [3]\nassert birlestir(None, None) is None\nassert listeye(birlestir(listeden([5, 6]), listeden([1]))) == [1, 5, 6]\n',
    hints=['Sahte baş düğüm, "ilk eleman hangi listeden?" özel durumunu ortadan kaldırır.', 'kuyruk.sonraki = a or b'],
    why='Dummy head kalıbı bağlı liste sorularının yarısında işe yarar (birleştirme, belirli değerleri silme, bölme). Süre O(n + m), ek bellek O(1). Merge sort\'un birleştirme adımı da budur.'))

ex.append(dict(t='code', id='mulakat-kaliplari-2-2', stage='Rehberli', diff=1,
    q='<p><code>seviye_gezinme(kok)</code>: ikili ağacı BFS ile seviye seviye gez ve her seviyenin değerlerini soldan sağa bir liste olarak döndür (liste listesi). Boş ağaç için <code>[]</code>. Ayrıca <code>sag_gorunum(kok)</code>: her seviyenin <b>en sağdaki</b> değeri (ağaca sağdan bakınca görünenler). <code>Agac</code> sınıfı hazır.</p>',
    guide=['collections.deque ile kökten başlayan bir kuyruk kur (kök None ise boş).', 'Her turda kuyruktaki eleman sayısı kadar (o seviye) düğüm çıkar.', 'Çıkan düğümün değerini seviye listesine, çocuklarını kuyruğa ekle.', 'sag_gorunum: seviye_gezinme sonucunun her listesinin son elemanı.'],
    example='from collections import deque\nq = deque([1, 2, 3])\nfor _ in range(len(q)):\n    print(q.popleft())\n',
    start=TREE + '\nfrom collections import deque\n\ndef seviye_gezinme(kok):\n    sonuc = []\n    q = deque([kok])\n    # TODO: her seviyeyi ayrı listeye topla\n    return sonuc\n\ndef sag_gorunum(kok):\n    return []\n',
    sol=TREE + '\nfrom collections import deque\n\ndef seviye_gezinme(kok):\n    sonuc = []\n    q = deque([kok] if kok else [])\n    while q:\n        seviye = []\n        for _ in range(len(q)):\n            d = q.popleft()\n            seviye.append(d.deger)\n            if d.sol:\n                q.append(d.sol)\n            if d.sag:\n                q.append(d.sag)\n        sonuc.append(seviye)\n    return sonuc\n\ndef sag_gorunum(kok):\n    return [s[-1] for s in seviye_gezinme(kok)]\n',
    tests='k = Agac("Genel Müdür", Agac("Satış", Agac("Kurumsal"), Agac("Pazarlama")), Agac("Teknoloji", Agac("Veri")))\nassert seviye_gezinme(k) == [["Genel Müdür"], ["Satış", "Teknoloji"], ["Kurumsal", "Pazarlama", "Veri"]], f"Gelen {seviye_gezinme(k)}"\nassert sag_gorunum(k) == ["Genel Müdür", "Teknoloji", "Veri"]\nassert seviye_gezinme(None) == [] and sag_gorunum(None) == []\nsol_kol = Agac(1, Agac(2, Agac(3)))\nassert sag_gorunum(sol_kol) == [1, 2, 3], "Sağ çocuk yoksa sol taraftaki düğüm görünür"\n',
    hints=['Seviyeyi ayırmanın yolu: döngüye girerken len(q)\'yu sabitle.', 'Kök None ise deque([kok]) yerine boş deque kullan.'],
    why='BFS\'nin seviye bilgisiyle kullanımı birçok sorunun temelidir: sağdan görünüm, seviye ortalaması, zigzag gezinme, en kısa adım. Süre O(n), bellek en geniş seviye kadar.'))

ex.append(dict(t='code', id='mulakat-kaliplari-2-3', stage='Rehberli', diff=2,
    q='<p>Anadolu Market arama kutusu için <code>Trie</code> sınıfı yaz (iç içe sözlüklerle; kelime sonu işareti <code>"$"</code>):</p><ul><li><code>ekle(kelime)</code></li><li><code>var_mi(kelime)</code>: tam kelime ekli mi?</li><li><code>onek_var_mi(onek)</code>: bu önekle başlayan en az bir kelime var mı?</li><li><code>tamamla(onek, k=5)</code>: önekle başlayan kelimelerden alfabetik (Python <code>sorted</code> sırası) ilk <code>k</code> tanesi.</li></ul><p>Testler gerçek <code>products</code> tablosundaki ürün adlarını (Türkçe küçük harfe çevrilmiş) kullanır.</p>',
    guide=['self.kok = {} ile başla; ekle\'de her harf için setdefault(harf, {}) ile in, sonda "$" koy.', 'Öneki izleyen yardımcı bir _bul(onek) metodu yaz: düğümü ya da None döndürsün.', 'var_mi: düğüm var ve "$" içeriyor mu?', 'tamamla: önek düğümünden DFS ile kelimeleri topla, sorted ile sırala, ilk k\'yı al.'],
    example='kok = {}\nd = kok\nfor h in "kot":\n    d = d.setdefault(h, {})\nd["$"] = True\nprint(kok)\n',
    start='import veri\n\nclass Trie:\n    def __init__(self):\n        self.kok = {}\n\n    def ekle(self, kelime):\n        d = self.kok\n        # TODO: harf harf in, sonda "$" işareti koy\n\n    def var_mi(self, kelime):\n        return False\n\n    def onek_var_mi(self, onek):\n        return False\n\n    def tamamla(self, onek, k=5):\n        return []\n\ndef tr_kucuk(s):\n    return s.replace("İ", "i").replace("I", "ı").lower()\n',
    sol='import veri\n\nclass Trie:\n    def __init__(self):\n        self.kok = {}\n\n    def ekle(self, kelime):\n        d = self.kok\n        for h in kelime:\n            d = d.setdefault(h, {})\n        d["$"] = True\n\n    def _bul(self, onek):\n        d = self.kok\n        for h in onek:\n            if h not in d:\n                return None\n            d = d[h]\n        return d\n\n    def var_mi(self, kelime):\n        d = self._bul(kelime)\n        return d is not None and "$" in d\n\n    def onek_var_mi(self, onek):\n        return self._bul(onek) is not None\n\n    def tamamla(self, onek, k=5):\n        d = self._bul(onek)\n        if d is None:\n            return []\n        sonuc = []\n        yigin = [(d, onek)]\n        while yigin:\n            dugum, yol = yigin.pop()\n            for h, alt in dugum.items():\n                if h == "$":\n                    sonuc.append(yol)\n                else:\n                    yigin.append((alt, yol + h))\n        return sorted(sonuc)[:k]\n\ndef tr_kucuk(s):\n    return s.replace("İ", "i").replace("I", "ı").lower()\n',
    tests='t = Trie()\nfor u in veri.kayitlar("anadolu_market", "products"):\n    t.ekle(tr_kucuk(u["name"]))\nassert t.var_mi("kot pantolon") and not t.var_mi("kot"), "Önek tam kelime sayılmamalı"\nassert t.onek_var_mi("kot") and not t.onek_var_mi("kotx")\nassert t.tamamla("k") == ["kablosuz kulaklık", "kamp çadırı", "keten gömlek", "kot pantolon", "koşu bandı"], f"Gelen {t.tamamla(\'k\')}"\nassert t.tamamla("s", 3) == ["saatleri ayarlama enstitüsü", "seramik kupa seti", "spor ayakkabı"]\nassert t.tamamla("i̇") == [] and t.tamamla("ince") == ["ince memed"], "İ → i dönüşümüyle ince memed bulunmalı"\nassert t.tamamla("zzz") == []\nt.ekle("kot")\nassert t.tamamla("kot") == ["kot", "kot pantolon"], "Önek kendisi de kelimeyse sonuçta olmalı"\n',
    hints=['Bir düğümde "$" anahtarı kelime sonunu, diğer anahtarlar çocukları temsil eder.', 'tamamla: yığınla DFS yap, "$" görünce yolu sonuca ekle; en sonda sorted(...)[:k].'],
    why='Trie\'de önek sorgusu O(L)\'dir ve ürün sayısından bağımsızdır. Gerçek arama kutularında düğümlere popülerlik puanı eklenip ilk k öneri sıklığa göre seçilir; büyük ölçekte sıkıştırılmış trie (radix tree) ya da arama motorunun "completion suggester" özelliği kullanılır.'))

ex.append(dict(t='code', id='mulakat-kaliplari-2-4', stage='Rehberli', diff=2,
    q='<p>Düzenleme mesafesi (Levenshtein). <code>duzenleme_mesafesi(a, b)</code>: <code>a</code>\'yı <code>b</code>\'ye çeviren en az tek karakter ekleme, silme ya da değiştirme sayısı. Belleği O(len(b)) tut (yalnız iki satır). Ardından <code>en_yakin_sehir(yazilan, sehirler)</code>: mesafesi en küçük şehri döndürsün (eşitlikte listede önce gelen).</p>',
    guide=['Taban satırı: onceki = [0, 1, ..., len(b)] (boş metinden b\'nin ilk j harfine j ekleme).', 'Her i için simdiki = [i] ile başla (a\'nın ilk i harfini silmek).', 'Harfler eşitse çaprazdan (onceki[j-1]) kopyala; değilse 1 + min(sil, ekle, değiştir).', 'Satır bitince onceki = simdiki; sonuç onceki[-1].'],
    example='a, b = "kar", "kır"\nprint([x == y for x, y in zip(a, b)])\n',
    start='def duzenleme_mesafesi(a, b):\n    onceki = list(range(len(b) + 1))\n    for i in range(1, len(a) + 1):\n        simdiki = [i] + [0] * len(b)\n        # TODO: her j için hücreyi doldur\n        onceki = simdiki\n    return onceki[-1]\n\ndef en_yakin_sehir(yazilan, sehirler):\n    return sehirler[0]\n',
    sol='def duzenleme_mesafesi(a, b):\n    onceki = list(range(len(b) + 1))\n    for i in range(1, len(a) + 1):\n        simdiki = [i] + [0] * len(b)\n        for j in range(1, len(b) + 1):\n            if a[i - 1] == b[j - 1]:\n                simdiki[j] = onceki[j - 1]\n            else:\n                simdiki[j] = 1 + min(onceki[j], simdiki[j - 1], onceki[j - 1])\n        onceki = simdiki\n    return onceki[-1]\n\ndef en_yakin_sehir(yazilan, sehirler):\n    return min(sehirler, key=lambda s: duzenleme_mesafesi(yazilan, s))\n',
    tests='assert duzenleme_mesafesi("kitten", "sitting") == 3\nassert duzenleme_mesafesi("Eskisehir", "Eskişehir") == 1\nassert duzenleme_mesafesi("", "abc") == 3 and duzenleme_mesafesi("abc", "") == 3, "Boş metin taban durumları"\nassert duzenleme_mesafesi("Ankara", "Ankara") == 0\nassert duzenleme_mesafesi("Izmir", "İzmir") == 1\nassert duzenleme_mesafesi("Kayseeri", "Kayseri") == 1\nimport veri\nsehirler = sorted({c["city"] for c in veri.kayitlar("anadolu_market", "customers") if c["city"]})\nassert en_yakin_sehir("Istanbul", sehirler) == "İstanbul" and en_yakin_sehir("Eskisehr", sehirler) == "Eskişehir", "Gerçek müşteri şehirleriyle eşleşmeli"\n',
    hints=['Üç komşu: onceki[j] (a\'dan sil), simdiki[j - 1] (b\'ye ekle), onceki[j - 1] (değiştir).', 'simdiki[j] = 1 + min(onceki[j], simdiki[j - 1], onceki[j - 1])'],
    why='Tam 2B tablo O(n·m) bellek ister; her satır yalnız bir öncekine baktığı için iki satır yeter. Bu "tablodan satıra" optimizasyonu LCS, grid yolları ve sırt çantası problemlerinde de aynı şekilde uygulanır.'))

ex.append(dict(t='code', id='mulakat-kaliplari-2-5', stage='Kendin yaz', diff=2,
    q='<p><code>dongu_baslangici(bas)</code>: bağlı listede döngü varsa döngünün <b>başladığı düğümü</b>, yoksa <code>None</code> döndür. Ek bellek O(1) olsun (küme kullanma): Floyd\'un iki aşamalı yöntemi. <code>Dugum</code>, <code>listeden</code> hazır.</p>',
    start=LL + '\ndef dongu_baslangici(bas):\n    pass\n',
    sol=LL + '\ndef dongu_baslangici(bas):\n    yavas = hizli = bas\n    while hizli and hizli.sonraki:\n        yavas, hizli = yavas.sonraki, hizli.sonraki.sonraki\n        if yavas is hizli:\n            yavas = bas\n            while yavas is not hizli:\n                yavas, hizli = yavas.sonraki, hizli.sonraki\n            return yavas\n    return None\n',
    tests='def dugumler(bas, n):\n    r = []\n    for _ in range(n):\n        r.append(bas)\n        bas = bas.sonraki\n    return r\nfor uzunluk, giris in [(6, 2), (5, 0), (2, 1), (1, 0), (7, 6)]:\n    bas = listeden(list(range(uzunluk)))\n    d = dugumler(bas, uzunluk)\n    d[-1].sonraki = d[giris]\n    assert dongu_baslangici(bas) is d[giris], f"{uzunluk} düğümlü listede döngü {giris}. düğümde başlıyor"\nassert dongu_baslangici(listeden([1, 2, 3])) is None\nassert dongu_baslangici(None) is None\nassert "set(" not in __source__ and "visited" not in __source__, "O(1) bellek: küme kullanma"\n',
    hints=['Önce buluşma noktasını bul (hızlı iki, yavaş bir adım).', 'Buluşunca yavaşı başa al; ikisini de birer adım ilerlet, buluştukları yer döngü başı.'],
    why='Baştan döngü başına uzaklık a, döngü başından buluşmaya b, döngü uzunluğu c ise 2(a + b) = a + b + kc, yani a = kc − b. Bu yüzden baştan ve buluşma noktasından aynı hızla yürüyenler döngü başında karşılaşır.'))

ex.append(dict(t='code', id='mulakat-kaliplari-2-6', stage='Kendin yaz', diff=2,
    q='<p><code>bst_gecerli_mi(kok)</code>: ağaç geçerli bir ikili arama ağacıysa <code>True</code>. Kural: her düğümün sol alt ağacındaki <b>tüm</b> değerler o düğümden kesin küçük, sağ alt ağacındakiler kesin büyük (tekrar yok). Boş ağaç geçerlidir. <code>Agac</code> hazır.</p>',
    start=TREE + '\ndef bst_gecerli_mi(kok):\n    pass\n',
    sol=TREE + '\ndef bst_gecerli_mi(kok, alt=None, ust=None):\n    if kok is None:\n        return True\n    if (alt is not None and kok.deger <= alt) or (ust is not None and kok.deger >= ust):\n        return False\n    return bst_gecerli_mi(kok.sol, alt, kok.deger) and bst_gecerli_mi(kok.sag, kok.deger, ust)\n',
    tests='assert bst_gecerli_mi(Agac(8, Agac(3, Agac(1), Agac(6)), Agac(10, None, Agac(14))))\nassert bst_gecerli_mi(None)\nassert not bst_gecerli_mi(Agac(10, Agac(5, None, Agac(12)), Agac(15))), "12 sağ çocuk olarak 5\'ten büyük ama kökün (10) sol alt ağacında: geçersiz"\nassert not bst_gecerli_mi(Agac(5, Agac(5))), "Tekrar eden değer geçersiz"\nassert bst_gecerli_mi(Agac(-3, Agac(-10), Agac(0))), "Negatif ve sıfır değerler (falsy) doğru işlenmeli"\nassert not bst_gecerli_mi(Agac(0, None, Agac(-1)))\n',
    hints=['Her çağrıya (alt, üst) sınırlarını parametre olarak geçir.', 'Sınır yoksa None kullan; 0 değerini "sınır yok" sanma (is not None ile kontrol et).'],
    why='Sınır taşıma, her düğümü O(1)\'de tüm atalarına göre denetler; toplam O(n). Alternatif: in-order gezinme kesin artan mı diye bakmak. "Yalnız çocuklarla karşılaştırma" en sık verilen yanlış cevaptır.'))

ex.append(dict(t='code', id='mulakat-kaliplari-2-7', stage='Kendin yaz', diff=2,
    q='<p>Topolojik sıralama (Kahn). <code>topolojik_sirala(dugumler, kenarlar)</code>: <code>kenarlar</code> (a, b) çiftleri, "a, b\'den önce gelmeli" demektir. Her adımda hazır (giriş derecesi 0) düğümlerden <b>en küçüğünü</b> (Python karşılaştırması) seç (heapq). Döngü varsa <code>ValueError("döngü var")</code>. Testler Pusula İK\'nın gerçek <code>ik_departments</code> hiyerarşisini (üst departman → alt departman) kullanır.</p>',
    start='import heapq\nfrom collections import defaultdict\n\ndef topolojik_sirala(dugumler, kenarlar):\n    return sorted(dugumler)\n',
    sol='import heapq\nfrom collections import defaultdict\n\ndef topolojik_sirala(dugumler, kenarlar):\n    giris = {d: 0 for d in dugumler}\n    komsu = defaultdict(list)\n    for a, b in kenarlar:\n        komsu[a].append(b)\n        giris[b] += 1\n    hazir = [d for d, g in giris.items() if g == 0]\n    heapq.heapify(hazir)\n    sira = []\n    while hazir:\n        u = heapq.heappop(hazir)\n        sira.append(u)\n        for v in komsu[u]:\n            giris[v] -= 1\n            if giris[v] == 0:\n                heapq.heappush(hazir, v)\n    if len(sira) != len(giris):\n        raise ValueError("döngü var")\n    return sira\n',
    tests='import veri\nD = veri.kayitlar("pusula_ik", "ik_departments")\nad = {d["dept_id"]: d["name"] for d in D}\nkenar = [(ad[d["parent_id"]], d["name"]) for d in D if d["parent_id"] is not None]\nr = topolojik_sirala([d["name"] for d in D], kenar)\nassert r == ["Genel Müdürlük", "Finans", "Mağaza Operasyonları", "Lojistik", "Satış", "Kurumsal Satış", "Pazarlama", "Yazılım Geliştirme", "BT Altyapı", "Veri ve Analitik", "Çağrı Merkezi", "İnsan Kaynakları"], f"Gelen {r}"\nkonum = {n: i for i, n in enumerate(r)}\nassert all(konum[a] < konum[b] for a, b in kenar), "Her üst departman altından önce gelmeli"\nassert topolojik_sirala([3, 1, 2], [(3, 1)]) == [2, 3, 1], "Hazır olanlardan en küçüğü seçilmeli"\ntry:\n    topolojik_sirala(["ham", "temiz", "rapor"], [("ham", "temiz"), ("temiz", "rapor"), ("rapor", "ham")])\n    assert False, "Döngüde ValueError bekleniyordu"\nexcept ValueError:\n    pass\n',
    hints=['Giriş dereceleri sözlüğü + komşuluk listesi kur.', 'heapq ile hazır kuyruğu tut; çıkardığın düğümün komşularının derecesini azalt.', 'Sıradaki düğüm sayısı toplamdan azsa döngü vardır.'],
    why='Kahn algoritması O(V + E)\'dir (heap ile O(E + V log V)). Airflow ve dbt görev sırasını, pip bağımlılık kurulum sırasını, derleyiciler modül sırasını bu fikirle belirler; döngü tespiti de "dairesel bağımlılık" hatasının kaynağıdır.'))

ex.append(dict(t='code', id='mulakat-kaliplari-2-8', stage='Kendin yaz', diff=2,
    q='<p><code>aralik_ekle(araliklar, yeni)</code>: <code>araliklar</code> başlangıca göre sıralı ve çakışmayan kapalı aralıklar listesi [(bas, son), ...]. <code>yeni</code> aralığı ekle; çakışan ya da uç uca değen (<code>son == bas</code>) aralıkları birleştir; sıralı ve çakışmasız yeni listeyi döndür. Girdi listesini değiştirme. Süre O(n) olsun (yeniden sıralama yapma).</p>',
    start='def aralik_ekle(araliklar, yeni):\n    araliklar.append(yeni)\n    return sorted(araliklar)\n',
    sol='def aralik_ekle(araliklar, yeni):\n    sonuc = []\n    bas, son = yeni\n    i, n = 0, len(araliklar)\n    while i < n and araliklar[i][1] < bas:\n        sonuc.append(araliklar[i])\n        i += 1\n    while i < n and araliklar[i][0] <= son:\n        bas = min(bas, araliklar[i][0])\n        son = max(son, araliklar[i][1])\n        i += 1\n    sonuc.append((bas, son))\n    sonuc.extend(araliklar[i:])\n    return sonuc\n',
    tests='vardiya = [(9, 11), (13, 15), (16, 18), (20, 22)]\nkopya = list(vardiya)\nassert aralik_ekle(vardiya, (10, 13)) == [(9, 15), (16, 18), (20, 22)], f"Uç uca değen 13 de birleşmeli: {aralik_ekle(vardiya, (10, 13))}"\nassert vardiya == kopya, "Girdi listesi değişmemeli"\nassert aralik_ekle(vardiya, (11.5, 12)) == [(9, 11), (11.5, 12), (13, 15), (16, 18), (20, 22)]\nassert aralik_ekle(vardiya, (8, 23)) == [(8, 23)]\nassert aralik_ekle(vardiya, (1, 2)) == [(1, 2)] + vardiya and aralik_ekle(vardiya, (23, 24)) == vardiya + [(23, 24)]\nassert aralik_ekle([], (3, 4)) == [(3, 4)]\nassert "sort" not in __source__, "Liste zaten sıralı; yeniden sıralama O(n log n) olur"\n',
    hints=['Üç aşama: yeninin tamamen solundakiler, çakışanlar (birleştir), sağındakiler.', 'Çakışma koşulu: araliklar[i][0] <= son (uç uca değme dahil).'],
    why='Takvimde boş zaman bulma, kurye vardiyalarını birleştirme ve IP aralığı tabloları bu kalıbı kullanır. Liste sıralı olduğu için tek geçiş yeter; Python\'da büyük listelerde bisect ile başlangıç konumu O(log n)\'de de bulunabilir.'))

ex.append(dict(t='code', id='mulakat-kaliplari-2-9', stage='Kendin yaz', diff=1,
    q='<p>Yetki bayrakları (bit maskesi). <code>YETKI = {"oku": 1, "yaz": 2, "sil": 4, "onayla": 8}</code>. Yaz:</p><ul><li><code>maske_yap(*adlar)</code>: adların bayraklarını OR ile birleştir (bilinmeyen ad <code>KeyError</code>).</li><li><code>var_mi(maske, ad)</code>, <code>kaldir(maske, ad)</code> (yoksa değişmez).</li><li><code>adlar(maske)</code>: maskedeki yetki adları, <code>YETKI</code> sırasıyla.</li><li><code>tek_yetki_mi(maske)</code>: maskede tam olarak bir bit açık mı? (<code>bin</code>/<code>bit_count</code> kullanmadan: <code>x &amp; (x - 1)</code>).</li></ul>',
    start='YETKI = {"oku": 1, "yaz": 2, "sil": 4, "onayla": 8}\n\ndef maske_yap(*adlar):\n    return sum(YETKI[a] for a in adlar)\n\ndef var_mi(maske, ad):\n    pass\n\ndef kaldir(maske, ad):\n    return maske - YETKI[ad]\n\ndef adlar(maske):\n    return []\n\ndef tek_yetki_mi(maske):\n    pass\n',
    sol='YETKI = {"oku": 1, "yaz": 2, "sil": 4, "onayla": 8}\n\ndef maske_yap(*adlar):\n    m = 0\n    for a in adlar:\n        m |= YETKI[a]\n    return m\n\ndef var_mi(maske, ad):\n    return bool(maske & YETKI[ad])\n\ndef kaldir(maske, ad):\n    return maske & ~YETKI[ad]\n\ndef adlar(maske):\n    return [a for a, b in YETKI.items() if maske & b]\n\ndef tek_yetki_mi(maske):\n    return maske > 0 and maske & (maske - 1) == 0\n',
    tests='m = maske_yap("oku", "yaz", "oku")\nassert m == 3, "Aynı yetki iki kez verilince toplanmamalı (OR kullan): 1 | 2 | 1 = 3"\nassert var_mi(m, "yaz") is True and var_mi(m, "sil") is False\nassert kaldir(m, "yaz") == 1 and kaldir(m, "sil") == 3, "Olmayan yetkiyi kaldırmak maskeyi bozmamalı"\nassert adlar(maske_yap("onayla", "oku")) == ["oku", "onayla"]\nassert [tek_yetki_mi(x) for x in (0, 1, 2, 3, 8, 12)] == [False, True, True, False, True, False]\ntry:\n    maske_yap("yonet")\n    assert False, "Bilinmeyen yetki KeyError"\nexcept KeyError:\n    pass\nassert "bit_count" not in __source__ and "bin(" not in __source__\n',
    hints=['Açma: m |= bayrak; kontrol: m & bayrak; kapatma: m & ~bayrak.', 'Tek bit: x > 0 and x & (x - 1) == 0'],
    why='Bit maskeleri bir tamsayıda 64 bayrağa kadar yer kaplamadan saklar; Unix dosya izinleri (chmod 755), özellik bayrakları ve veritabanı rol tabloları böyle çalışır. Toplama ile OR farkı, aynı bayrak iki kez geldiğinde ortaya çıkan klasik hatadır.'))

ex.append(dict(t='code', id='mulakat-kaliplari-2-10', stage='Hata avı', kind='bug', diff=3,
    q='<p><b>Hatayı bul ve düzelt.</b> Kanat Havayolları\'nın rota planlayıcısı <code>en_kisa_rota(rotalar, bas, hedef)</code> bazı şehir çiftlerinde en kısa değil, ilk bulunan yolu öneriyor. Fonksiyon gerçek <code>hv_routes</code> kayıtlarından (yönlü kenarlar, ağırlık <code>distance_km</code>) en kısa <code>(km, [havalimanları])</code> demetini, ulaşılamıyorsa <code>None</code> döndürmeli. <code>bas == hedef</code> ise <code>(0, [bas])</code>.</p>',
    start='import heapq\nfrom collections import defaultdict\n\ndef en_kisa_rota(rotalar, bas, hedef):\n    graf = defaultdict(list)\n    for r in rotalar:\n        graf[r["origin"]].append((r["dest"], r["distance_km"]))\n    mesafe, onceki = {bas: 0}, {}\n    ziyaret = {bas}\n    kuyruk = [(0, bas)]\n    while kuyruk:\n        d, u = heapq.heappop(kuyruk)\n        if u == hedef:\n            yol = [u]\n            while yol[-1] != bas:\n                yol.append(onceki[yol[-1]])\n            return d, yol[::-1]\n        for v, w in graf[u]:\n            if v not in ziyaret:\n                ziyaret.add(v)\n                mesafe[v], onceki[v] = d + w, u\n                heapq.heappush(kuyruk, (d + w, v))\n    return None\n',
    sol='import heapq\nfrom collections import defaultdict\n\ndef en_kisa_rota(rotalar, bas, hedef):\n    graf = defaultdict(list)\n    for r in rotalar:\n        graf[r["origin"]].append((r["dest"], r["distance_km"]))\n    mesafe, onceki = {bas: 0}, {}\n    kuyruk = [(0, bas)]\n    while kuyruk:\n        d, u = heapq.heappop(kuyruk)\n        if u == hedef:\n            yol = [u]\n            while yol[-1] != bas:\n                yol.append(onceki[yol[-1]])\n            return d, yol[::-1]\n        if d > mesafe[u]:\n            continue\n        for v, w in graf[u]:\n            if d + w < mesafe.get(v, float("inf")):\n                mesafe[v], onceki[v] = d + w, u\n                heapq.heappush(kuyruk, (d + w, v))\n    return None\n',
    tests='import veri\nR = veri.kayitlar("kanat_havayollari", "hv_routes")\nassert en_kisa_rota(R, "BER", "ESB") == (2618, ["BER", "SAW", "AYT", "ESB"]), f"SAW-ADB-ESB (2634 km) değil SAW-AYT-ESB (2618 km) seçilmeli: {en_kisa_rota(R, \'BER\', \'ESB\')}"\nassert en_kisa_rota(R, "BER", "LHR") == (4938, ["BER", "SAW", "ADB", "IST", "LHR"])\nassert en_kisa_rota(R, "FRA", "BER") == (4288, ["FRA", "IST", "ADB", "SAW", "BER"])\nassert en_kisa_rota(R, "ADB", "FRA") == (1966, ["ADB", "FRA"]), "Direkt uçuş daha kısaysa aktarmasız"\nassert en_kisa_rota(R, "IST", "IST") == (0, ["IST"])\nassert en_kisa_rota(R + [{"origin": "IST", "dest": "XYZ", "distance_km": 1}], "XYZ", "IST") is None, "Ulaşılamayan hedef None"\n',
    hints=['Düğümü kuyruğa eklerken "ziyaret edildi" saymak, ilk bulunan mesafeyi kesinleşmiş kabul eder (BFS gibi davranır).', 'Ziyaret kümesini kaldır; daha kısa yol bulunduğunda mesafeyi güncelle (gevşetme) ve kuyruktan çıkan eski kayıtları if d > mesafe[u]: continue ile atla.'],
    why='Dijkstra\'da bir düğümün mesafesi ancak kuyruktan <i>çıkarken</i> kesinleşir. Eklerken kilitlemek, sonradan bulunan daha kısa yolu (BER-SAW-AYT-ESB) reddeder. Gerçek veride fark 16 km; büyük ağlarda ve yakıt maliyetinde ciddi bir fark.'))

ex.append(dict(t='code', id='mulakat-kaliplari-2-11', stage='Hata avı', kind='bug', diff=2,
    q='<p><b>Hatayı bul ve düzelt.</b> Depo robotu ızgarada yalnızca <b>sağa</b> ve <b>aşağı</b> gidebiliyor; <code>"#"</code> raf (geçilemez), <code>"."</code> boş hücre. <code>yol_sayisi(izgara)</code> sol üstten sağ alta kaç farklı yol olduğunu döndürmeli; başlangıç ya da bitiş raf ise 0. Bellek O(sütun sayısı) olmalı (tek satırlık dp). Mevcut kod engelli ızgaralarda fazla yol sayıyor.</p>',
    start='def yol_sayisi(izgara):\n    satir, sutun = len(izgara), len(izgara[0])\n    dp = [1] * sutun\n    for i in range(1, satir):\n        for j in range(1, sutun):\n            if izgara[i][j] == "#":\n                dp[j] = 0\n            else:\n                dp[j] += dp[j - 1]\n    return dp[-1]\n',
    sol='def yol_sayisi(izgara):\n    satir, sutun = len(izgara), len(izgara[0])\n    dp = [0] * sutun\n    dp[0] = 1 if izgara[0][0] == "." else 0\n    for i in range(satir):\n        for j in range(sutun):\n            if izgara[i][j] == "#":\n                dp[j] = 0\n            elif j > 0:\n                dp[j] += dp[j - 1]\n    return dp[-1]\n',
    tests='assert yol_sayisi(["...", "...", "..."]) == 6, "Engelsiz 3x3: C(4, 2) = 6"\nassert yol_sayisi(["...", ".#.", "..."]) == 2, f"Ortada raf varsa 2 yol, gelen {yol_sayisi([\'...\', \'.#.\', \'...\'])}"\nassert yol_sayisi([".#..", "....", "...."]) == 4, "İlk satırdaki raftan sonrası ilk satırdan ulaşılamaz"\nassert yol_sayisi(["...", "#..", "..."]) == 3, "İlk sütundaki raftan aşağısı ilk sütundan ulaşılamaz"\nassert yol_sayisi(["#.", ".."]) == 0 and yol_sayisi(["..", ".#"]) == 0, "Başlangıç ya da bitiş raf ise 0"\nassert yol_sayisi(["."]) == 1 and yol_sayisi(["....."]) == 1\n',
    hints=['İlk satır ve ilk sütun her zaman 1 değildir: bir raftan sonrası 0 olmalı.', 'dp\'yi 0 ile başlat, dp[0]\'ı başlangıç hücresine göre ayarla, i ve j\'yi 0\'dan gez; j > 0 ise soldan ekle.'],
    why='"İlk satır/sütun hep 1" kısayolu yalnız engelsiz ızgarada doğrudur. Taban durumlarını genel kuralın içinde (döngü 0\'dan, dp[j] = yukarı + sol) ele almak bu tür hataları önler. Tek satırlık dp, dp[j]\'nin güncellenmeden önceki değerinin "yukarıdaki hücre" olmasına dayanır.'))

ex.append(dict(t='code', id='mulakat-kaliplari-2-12', stage='Meydan okuma', diff=3,
    q='<p>Lezzet Kurye: <b>aynı anda en çok kaç kurye yoldaydı?</b> <code>en_yogun_an(araliklar)</code>: <code>(baslangic, bitis)</code> çiftleri (karşılaştırılabilir değerler, ör. "YYYY-AA-GG SS:DD:SS" metinleri) yarı açık aralıklardır: [baslangic, bitis). <code>(en_cok, an)</code> döndür; <code>an</code> bu sayıya <b>ilk</b> ulaşılan zaman. Boş girdide <code>(0, None)</code>. Süre O(n log n). Testler gerçek <code>lk_orders</code> tablosunda <code>picked_at</code> ve <code>delivered_at</code> dolu olan siparişleri kullanır.</p>',
    start='def en_yogun_an(araliklar):\n    olaylar = []\n    # TODO: her aralık için (baslangic, +1) ve (bitis, -1) olayı ekle, sırala, sayaçla tara\n    return 0, None\n',
    sol='def en_yogun_an(araliklar):\n    olaylar = []\n    for b, s in araliklar:\n        olaylar.append((b, 1))\n        olaylar.append((s, -1))\n    olaylar.sort()\n    simdi = en_cok = 0\n    an = None\n    for zaman, deg in olaylar:\n        simdi += deg\n        if simdi > en_cok:\n            en_cok, an = simdi, zaman\n    return en_cok, an\n',
    tests='assert en_yogun_an([]) == (0, None)\nassert en_yogun_an([(1, 3), (3, 5)]) == (1, 1), "Yarı açık: 3\'te biten ile 3\'te başlayan çakışmaz"\nassert en_yogun_an([(1, 5), (2, 6), (4, 7), (6, 8)]) == (3, 4)\nimport veri\nA = [(s["picked_at"], s["delivered_at"]) for s in veri.kayitlar("lezzet_kurye", "lk_orders") if s["picked_at"] and s["delivered_at"]]\nassert len(A) == 6820\nimport time\nt0 = time.perf_counter()\nr = en_yogun_an(A)\nassert r == (14, "2024-12-04 20:35:32"), f"Gerçek veride en yoğun an 14 kurye, 2024-12-04 20:35:32 olmalı; gelen {r}"\nassert time.perf_counter() - t0 < 1.0, "O(n²) çözüm çok yavaş; olayları sıralayıp tek geçişte tara"\n',
    hints=['Her aralık bir (zaman, +1) ve bir (zaman, -1) olayıdır.', 'Demetler sıralanınca aynı zamanda -1, +1\'den önce gelir: yarı açık aralık için tam istenen.', 'Sayaç önceki en yüksek değeri kesin aşınca anı kaydet (ilk ulaşılan an).'],
    why='Sweep line, "her an için say" yaklaşımını olay sayısına indirger: O(n log n). Aynı fikir toplantı odası sayısı, sunucu eşzamanlı bağlantı tepe noktası ve otopark kapasitesi hesaplarında kullanılır. Gerçek veride akşam yemeği tepesinde 14 kurye aynı anda yoldaydı.'))

ex.append(dict(t='code', id='mulakat-kaliplari-2-13', stage='Meydan okuma', diff=3,
    q='<p>Union-find ile <b>"İstanbul (IST) kapanırsa?"</b> analizi. <code>BirlesimBul</code> sınıfı yaz: <code>bul(x)</code> (yol sıkıştırmalı; ilk görülen öğeyi kendi kümesi yapar), <code>birlestir(a, b)</code> (boyuta göre: küçük küme büyüğe bağlanır; zaten aynı kümedeyse <code>False</code>, değilse <code>True</code>), <code>boyut(x)</code>. Sonra <code>kapaninca(rotalar, kapali)</code>: <code>kapali</code> havalimanına giren/çıkan rotaları yok sayarak rotaları <b>yönsüz</b> bağlantı kabul et ve kapalı dışındaki tüm havalimanlarını bağlı bileşenlere ayır. Dönüş: her bileşen alfabetik sıralı liste; bileşenler büyükten küçüğe, eşitlikte ilk elemana göre sıralı.</p>',
    start='class BirlesimBul:\n    def __init__(self):\n        self.ebeveyn = {}\n\n    def bul(self, x):\n        return x\n\n    def birlestir(self, a, b):\n        return True\n\n    def boyut(self, x):\n        return 1\n\ndef kapaninca(rotalar, kapali):\n    return []\n',
    sol='from collections import defaultdict\n\nclass BirlesimBul:\n    def __init__(self):\n        self.ebeveyn = {}\n        self.buyukluk = {}\n\n    def bul(self, x):\n        if x not in self.ebeveyn:\n            self.ebeveyn[x] = x\n            self.buyukluk[x] = 1\n        kok = x\n        while self.ebeveyn[kok] != kok:\n            kok = self.ebeveyn[kok]\n        while self.ebeveyn[x] != kok:\n            self.ebeveyn[x], x = kok, self.ebeveyn[x]\n        return kok\n\n    def birlestir(self, a, b):\n        ka, kb = self.bul(a), self.bul(b)\n        if ka == kb:\n            return False\n        if self.buyukluk[ka] < self.buyukluk[kb]:\n            ka, kb = kb, ka\n        self.ebeveyn[kb] = ka\n        self.buyukluk[ka] += self.buyukluk[kb]\n        return True\n\n    def boyut(self, x):\n        return self.buyukluk[self.bul(x)]\n\ndef kapaninca(rotalar, kapali):\n    bb = BirlesimBul()\n    for r in rotalar:\n        a, b = r["origin"], r["dest"]\n        for x in (a, b):\n            if x != kapali:\n                bb.bul(x)\n        if kapali not in (a, b):\n            bb.birlestir(a, b)\n    gruplar = defaultdict(list)\n    for x in list(bb.ebeveyn):\n        gruplar[bb.bul(x)].append(x)\n    return sorted((sorted(g) for g in gruplar.values()), key=lambda g: (-len(g), g[0]))\n',
    tests='bb = BirlesimBul()\nassert bb.birlestir("ali", "ayse") is True and bb.birlestir("ayse", "ali") is False, "Aynı kümedekiler yeniden birleşmemeli"\nbb.birlestir("veli", "can"); bb.birlestir("can", "ali")\nassert bb.bul("veli") == bb.bul("ayse") and bb.boyut("can") == 4 and bb.boyut("zeynep") == 1\nzincir = BirlesimBul()\nfor i in range(1, 2000):\n    zincir.birlestir(i, i - 1)\nassert zincir.boyut(0) == 2000 and zincir.bul(1999) == zincir.bul(0), "Uzun zincirde de çalışmalı (özyineleme yok)"\nimport veri\nR = veri.kayitlar("kanat_havayollari", "hv_routes")\nk = kapaninca(R, "IST")\nassert k[0] == ["ADB", "AYT", "BER", "DLM", "ESB", "FRA", "SAW", "TZX"], f"IST kapanınca SAW-ADB-ESB ağı birlikte kalmalı: {k[0]}"\nassert len(k) == 11 and k[1:] == [["ADA"], ["AMS"], ["BAK"], ["CDG"], ["DIY"], ["DXB"], ["ERZ"], ["GZT"], ["LHR"], ["VAN"]], f"Yalnız IST\'e bağlı 10 havalimanı tek başına kalmalı: {k[1:]}"\nassert len(kapaninca(R, "YOK")) == 1, "Hiçbir havalimanı kapanmazsa ağ tek parça"\n',
    hints=['bul: önce kökü bul, sonra yoldaki her düğümü doğrudan köke bağla (yinelemeli; özyineleme 2000\'lik zincirde sınırı zorlar).', 'birlestir: büyük kümenin kökünü yeni kök yap, boyutu topla.', 'Kapalı havalimanını hiç eklememek için her uç noktayı bul() ile kaydederken kontrol et.'],
    why='Union-find, bağlantıların teker teker geldiği durumlarda (ağ dayanıklılığı, hesap birleştirme, Kruskal) bileşenleri neredeyse sabit sürede günceller. Gerçek veride IST kapanınca 18 havalimanından 10\'u tamamen kopuyor: hub-and-spoke ağının tek arıza noktası sayıyla görünür.'))

ex.append(dict(t='code', id='mulakat-kaliplari-2-14', stage='Mini proje', diff=3,
    q='<p><b>Pusula İK organizasyon ağacı analizi</b> (gerçek <code>ik_employees</code>, 2 199 çalışan, <code>manager_id</code> ebeveyn). <code>OrgAgaci(calisanlar)</code> sınıfını yaz:</p><ul><li><code>yol(emp)</code>: çalışandan genel müdüre yönetici zinciri (çalışan dahil).</li><li><code>derinlik(emp)</code>: genel müdürün derinliği 0.</li><li><code>ortak_yonetici(a, b)</code>: en yakın ortak ata (LCA); biri diğerinin yöneticisiyse o.</li><li><code>alt_agac_boyutu(emp)</code>: çalışan dahil altındaki toplam kişi; <b>yinelemeli</b> (yığınla) hesapla.</li><li><code>en_kalabalik_ekip()</code>: en çok doğrudan raporu olan <code>(yonetici_id, sayi)</code>; eşitlikte küçük id.</li><li><code>seviye_dagilimi()</code>: {derinlik: kişi sayısı} sözlüğü.</li></ul><p>Bilinmeyen çalışan id\'sinde metotlar <code>KeyError</code> fırlatsın.</p>',
    start='import veri\nfrom collections import defaultdict, Counter\n\nclass OrgAgaci:\n    def __init__(self, calisanlar):\n        self.yonetici = {c["emp_id"]: c["manager_id"] for c in calisanlar}\n        # TODO: doğrudan raporlar sözlüğü\n\n    def yol(self, emp):\n        return [emp]\n\n    def derinlik(self, emp):\n        return 0\n\n    def ortak_yonetici(self, a, b):\n        return None\n\n    def alt_agac_boyutu(self, emp):\n        return 1\n\n    def en_kalabalik_ekip(self):\n        return None\n\n    def seviye_dagilimi(self):\n        return {}\n\ncalisanlar = veri.kayitlar("pusula_ik", "ik_employees")\n',
    sol='import veri\nfrom collections import defaultdict, Counter\n\nclass OrgAgaci:\n    def __init__(self, calisanlar):\n        self.yonetici = {c["emp_id"]: c["manager_id"] for c in calisanlar}\n        self.raporlar = defaultdict(list)\n        for e, m in self.yonetici.items():\n            if m is not None:\n                self.raporlar[m].append(e)\n\n    def yol(self, emp):\n        if emp not in self.yonetici:\n            raise KeyError(emp)\n        zincir = [emp]\n        while self.yonetici[zincir[-1]] is not None:\n            zincir.append(self.yonetici[zincir[-1]])\n        return zincir\n\n    def derinlik(self, emp):\n        return len(self.yol(emp)) - 1\n\n    def ortak_yonetici(self, a, b):\n        atalar = set(self.yol(a))\n        for x in self.yol(b):\n            if x in atalar:\n                return x\n        return None\n\n    def alt_agac_boyutu(self, emp):\n        if emp not in self.yonetici:\n            raise KeyError(emp)\n        sayi, yigin = 0, [emp]\n        while yigin:\n            x = yigin.pop()\n            sayi += 1\n            yigin.extend(self.raporlar[x])\n        return sayi\n\n    def en_kalabalik_ekip(self):\n        return min(((m, len(r)) for m, r in self.raporlar.items()), key=lambda t: (-t[1], t[0]))\n\n    def seviye_dagilimi(self):\n        return dict(Counter(self.derinlik(e) for e in self.yonetici))\n\ncalisanlar = veri.kayitlar("pusula_ik", "ik_employees")\n',
    tests='o = OrgAgaci(calisanlar)\nassert o.yol(48) == [48, 28, 5, 4, 1], f"Gelen {o.yol(48)}"\nassert o.derinlik(48) == 4 and o.derinlik(1) == 0\nassert o.ortak_yonetici(48, 54) == 1, "Farklı ana dallardaki çalışanların ortak yöneticisi genel müdür"\nassert o.ortak_yonetici(48, 55) == 4 and o.ortak_yonetici(48, 28) == 28 and o.ortak_yonetici(48, 48) == 48\nassert o.alt_agac_boyutu(1) == 2199 and o.alt_agac_boyutu(4) == 952 and o.alt_agac_boyutu(48) == 1, "Alt ağaç boyutları gerçek veriyle uyuşmalı"\nassert o.en_kalabalik_ekip() == (13, 122), f"Gelen {o.en_kalabalik_ekip()}"\nassert o.seviye_dagilimi() == {0: 1, 1: 5, 2: 23, 3: 1235, 4: 935}, f"Gelen {o.seviye_dagilimi()}"\nfor fn in (o.yol, o.alt_agac_boyutu, o.derinlik):\n    try:\n        fn(999999)\n        assert False, "Bilinmeyen id KeyError vermeli"\n    except KeyError:\n        pass\n',
    hints=['Kurucuda yönetici → doğrudan raporlar listesini (defaultdict(list)) bir kez kur.', 'LCA: a\'nın tüm atalarını kümeye koy, b\'den yukarı çıkarken kümede olan ilk düğüm cevaptır.', 'Alt ağaç: yığına emp\'i koy, her çıkarışta say ve raporlarını yığına ekle.'],
    why='İK analitiğinde yönetim açıklığı (span of control), katman sayısı ve "bu iki çalışanın ortak yöneticisi kim?" soruları bu ağaç işlemleriyle cevaplanır. Bir yönetici 122 doğrudan rapora sahip: tipik bir yönetim açıklığı uyarısı. Ebeveyn işaretçisiyle LCA O(derinlik), alt ağaç O(alt ağaç boyutu) sürer.'))

faq = [
    dict(q='Bu kalıpların hepsini ezberlemem gerekiyor mu?', a='Hayır. Her kalıbın "tanıma ipucu" ve 10-15 satırlık iskeletini bilmek yeterli: hızlı-yavaş işaretçi, (alt, üst) aralığıyla DFS, heap\'li Dijkstra, Kahn, union-find, olay sıralama, iki satırlık DP. Gerisi soruya uyarlamadır. Kalıp tablosunu her çözdüğün soruyla eşleştirerek pekiştir.'),
    dict(q='Mülakatta özyinelemeli mi yinelemeli mi yazmalıyım?', a='Ağaçlarda özyinelemeli çözüm genelde daha kısa ve okunurdur; önce onu yaz. Ardından Python\'un özyineleme sınırını (yaklaşık 1000) ve çok derin girdide yığınla yinelemeli sürümü önerebileceğini söyle.'),
    dict(q='Gerçek projede Dijkstra\'yı kendim mi yazmalıyım?', a='Çoğu zaman hayır: networkx (shortest_path, dijkstra_path) ya da veritabanı/rota servisleri kullanılır. Kendi yazacaksan negatif ağırlık olmadığından emin ol, eski kuyruk kayıtlarını atla ve testleri bilinen küçük graflarla yaz.'),
    dict(q='2B DP sorusunu nasıl tanırım?', a='İki dizi/metin ya da bir ızgara var ve "en az işlem", "en uzun ortak", "kaç farklı yol" soruluyorsa büyük olasılıkla 2B DP\'dir. dp[i][j]\'nin anlamını tek cümleyle yaz, taban satır/sütunu doldur, geçişi bul; sonra belleği iki satıra indirmeyi düşün.'),
]
mistakes = [
    dict(bad='def bst_mi(d):\n    if not d: return True\n    if d.sol and d.sol.deger >= d.deger: return False\n    if d.sag and d.sag.deger <= d.deger: return False\n    return bst_mi(d.sol) and bst_mi(d.sag)', good='def bst_mi(d, alt=None, ust=None):\n    if not d: return True\n    if (alt is not None and d.deger <= alt) or (ust is not None and d.deger >= ust): return False\n    return bst_mi(d.sol, alt, d.deger) and bst_mi(d.sag, d.deger, ust)', why='Yalnız çocuklarla karşılaştırmak, torunun ataya göre yanlış tarafta olduğu durumu kaçırır.'),
    dict(bad='if v not in ziyaret:\n    ziyaret.add(v)\n    heapq.heappush(kuyruk, (d + w, v))', good='if d + w < mesafe.get(v, float("inf")):\n    mesafe[v] = d + w\n    heapq.heappush(kuyruk, (d + w, v))', why='Dijkstra\'da düğüm eklenirken değil kuyruktan çıkarken kesinleşir; eklerken kilitlemek daha kısa yolları reddeder.'),
    dict(bad='olaylar.sort(key=lambda e: e[0])   # aynı zamanda +1 önce gelebilir', good='olaylar.sort()   # (zaman, -1) < (zaman, +1): önce bitiş', why='Aynı anda biten ve başlayan aralıklarda sıra, eşzamanlı sayıyı bir fazla gösterebilir; yarı açık aralık için bitiş önce işlenmeli.'),
    dict(bad='dp = [1] * sutun   # ilk satır hep 1', good='dp = [0] * sutun\ndp[0] = 1 if izgara[0][0] == "." else 0', why='Engelli ızgarada ilk satır ve sütundaki engelden sonrası ulaşılamaz; taban durumunu genel kurala bırak.'),
]

lesson = dict(id='mulakat-kaliplari-2', lv='orta', mod='Veri Yapıları ve Algoritmalar', min=65,
    title='Mülakat kalıpları II: bağlı liste, ağaç, trie, graf, aralık ve 2B DP',
    sum='Bağlı listede ters çevirme, Floyd ve birleştirme; ağaçta DFS/BFS, BST doğrulama ve LCA; trie ile otomatik tamamlama; Dijkstra, topolojik sıralama ve union-find; aralık ekleme ve sweep line; düzenleme mesafesi ve ızgara DP\'si; bit maskeleri ve kalıp tanıma tablosu. Örnekler Kanat Havayolları rotaları, Pusula İK hiyerarşisi ve Lezzet Kurye teslimatları üzerinde çalışır.',
    goals=['Bağlı liste sorularını sahte baş düğüm ve hızlı-yavaş işaretçi kalıplarıyla O(1) ek bellekle çözebilirim.',
           'Ağaçları DFS ve BFS ile gezip BST doğrulama, derinlik ve en yakın ortak ata sorularını çözebilirim.',
           'Trie, Dijkstra, topolojik sıralama ve union-find\'ı doğru problemde tanıyıp gerçek veride uygulayabilirim.',
           'Aralık birleştirme/ekleme ve sweep line ile zaman aralığı sorularını O(n log n)\'de çözebilirim.',
           '2B DP tablosunu kurup iki satıra indirerek düzenleme mesafesi ve ızgara yolu problemlerini çözebilirim.'],
    body=body, ex=ex, faq=faq, mistakes=mistakes)

write('/home/claude/py/v2/n5/mulakat-kaliplari-2.js', lesson, 'Orta: mulakat-kaliplari-2 (Mülakat kalıpları II)')
