import sys; sys.path.insert(0, '/home/claude/py/tools/pylib')
import os; os.environ['PP_VERI'] = '/home/claude/py/data'
import veri, statistics
from collections import defaultdict, Counter

def ik_istatistik_belgeleri():
    izin = defaultdict(list)
    for r in veri.kayitlar("pusula_ik", "ik_leaves"):
        izin[r["leave_type"]].append(r["days"])
    belgeler = []
    for tur, gunler in sorted(izin.items()):
        belgeler.append({
            "id": f"ik-izin-{tur}",
            "metin": f"{tur.capitalize()} izin kayıtları: {len(gunler)} kayıt, ortalama {statistics.mean(gunler):.1f} gün, en uzun {max(gunler)} gün.",
            "meta": {"kaynak": "ik_leaves", "tur": "istatistik"},
        })
    return belgeler

for b in ik_istatistik_belgeleri(): print(b)
calis = Counter(r["work_mode"] for r in veri.kayitlar("pusula_ik", "ik_employees") if r["term_date"] is None)
print(calis)
eg = defaultdict(list)
for r in veri.kayitlar("pusula_ik", "ik_training"): eg[r["course"]].append(r["hours"])
for k,v in eg.items(): print(k, len(v), statistics.mean(v), min(v), max(v))
urun = veri.kayitlar("anadolu_market", "products")
for u in urun: print(u)
