import sys; sys.path.insert(0, '/home/claude/py/tools/pylib')
import os; os.environ['PP_VERI'] = '/home/claude/py/data'
from core3b import *
code = "import veri\n" + TR + KOK + NIYET + SSS + SURE + NIYET_MODEL + PII + ENJ + ARAC + CEVAP + LLM + SSS_ARA + JSON_CEVAP + ASISTAN + DEGER + DEGERLENDIR
ns = {}
exec(code, ns)
exec('''
con = veri.baglan("lezzet_kurye", tablolar=["lk_orders", "lk_restaurants"])
belgeler = dict(SSS); belgeler["teslim-suresi"] = teslim_suresi_belgesi(veri.kayitlar("lezzet_kurye", "lk_orders"))
print(belgeler["teslim-suresi"])
m = niyet_modeli(NIYET_VERISI)
a = LezzetAsistani(con, m, SSSArama(belgeler), SahteLLM())
for o in DEGER_SETI:
    c = a.cevapla(o["mesaj"], o["musteri"])
    print(o["mesaj"], niyet_tahmin(m, giris_bariyeri(o["mesaj"])["mesaj"]), a.sss.ara(o["mesaj"]), "|", c.niyet, c.devret, c.metin, c.kaynaklar)
print(degerlendir(a, DEGER_SETI))
print(degerlendir(LezzetAsistani(con, m, SSSArama(belgeler), SahteLLM(bozuk=100)), DEGER_SETI))
''', ns)
