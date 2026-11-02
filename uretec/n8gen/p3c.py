import sys; sys.path.insert(0, '/home/claude/py/tools/pylib')
import os; os.environ['PP_VERI'] = '/home/claude/py/data'
from core3b import *
ns = {}
exec("import veri\n" + TR + KOK + NIYET + NIYET_MODEL, ns)
exec('''
m = niyet_modeli(NIYET_VERISI)
for t in ["28 numaralı siparişim nerede", "Kurye çok kaba davrandı, bir daha sipariş vermem", "Paramı geri alabilir miyim", "Teslimat ücretsiz mi", "İyi günler", "Yarın hava yağmurlu mu olacak", "İptal etmek istiyorum", "Siparişim geç geldi, iade istiyorum", "Kurye gelmedi param iade", "Eksik ürün geldi, paramı geri istiyorum", "Merhaba", "Bahşiş kuryeye mi gidiyor", "Yemek soğuktu", "kurye", "Premium kaç TL"]:
    p = m.predict_proba([t])[0]; o = sorted(zip(p, m.classes_), reverse=True)
    print(t, [(str(c), round(float(x),3)) for x, c in o[:2]])
''', ns)
