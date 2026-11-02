import sys, os; sys.path.insert(0,'/home/claude/py/tools/pylib'); os.environ['PP_VERI']='/home/claude/py/data'
import veri, zlib, re, numpy as np, math
from collections import Counter, defaultdict
def tr_kucuk(s): return s.replace("I","ı").replace("İ","i").lower()
def sahte_embedding(metin, boyut=256):
    v = np.zeros(boyut)
    for kelime in re.findall(r"\w+", tr_kucuk(metin)):
        k = f" {kelime} "
        for i in range(len(k) - 2):
            v[zlib.crc32(k[i:i+3].encode()) % boyut] += 1
    n = np.linalg.norm(v)
    return v / n if n else v
r = veri.kayitlar("lezzet_kurye","lk_ratings")
g = defaultdict(list)
for x in r:
    if x['comment']: g[x['comment']].append(x['food_score'])
yorumlar = sorted(g)
M = np.array([sahte_embedding(y) for y in yorumlar])
for q in ["kurye geç geldi", "yemek soğuktu", "porsiyon az", "çok lezzetli"]:
    s = M @ sahte_embedding(q)
    idx = np.argsort(-s, kind='stable')[:3]
    print(q, [(yorumlar[i], round(float(s[i]),3), len(g[yorumlar[i]]), round(sum(g[yorumlar[i]])/len(g[yorumlar[i]]),2)) for i in idx])
for q in ["Kurye kapıyı çarptı ve bağırdı", "Ambalaj yırtıktı", "Biraz geç geldi", "Güzeldi teşekkürler"]:
    print(q, round(float((M@sahte_embedding(q)).max()),3))
print(np.round(M@M.T,2)[:3])
