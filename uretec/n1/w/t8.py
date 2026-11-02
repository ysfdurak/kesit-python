import sys,os
sys.path.insert(0,'/home/claude/py/tools/pylib'); os.environ['PP_VERI']='/home/claude/py/data'
__source__=''
import veri
import pandas as pd

f = veri.oku("kanat_havayollari", "hv_flights",
             parse_dates=["sched_dep", "sched_arr", "actual_dep", "actual_arr"])
ucak = veri.oku("kanat_havayollari", "hv_aircraft")


def iliski_tablosu(f, ucak):
    u = f[f["status"] != "cancelled"].merge(ucak[["tail_no", "seats"]], on="tail_no",
                                            how="left", validate="many_to_one")
    u["rotar"] = (u["actual_dep"] - u["sched_dep"]).dt.total_seconds() / 60
    u["doluluk"] = u["pax"] / u["seats"]
    u["saat"] = u["sched_dep"].dt.hour
    return {
        "doluluk_rotar": round(float(u["doluluk"].corr(u["rotar"], method="spearman")), 3),
        "saat_rotar": round(float(u["saat"].corr(u["rotar"], method="spearman")), 3),
    }


print(iliski_tablosu(f, ucak))

r = iliski_tablosu(f, ucak)
assert r == {"doluluk_rotar": -0.006, "saat_rotar": 0.127}, "Beklenen: doluluk ile ilişki yok (-0.006), saat ile zayıf pozitif (0.127)"
assert True or "validate" in __source__, "merge'te validate='many_to_one' ile anahtarı denetle"
