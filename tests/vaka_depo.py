"""Depo vakası (vaka/depo/): sayfadaki çözüm kodu ve gizli denetimler CPython + pandas ile geçiyor mu?
python tests/vaka_depo.py"""
import json, os, re, subprocess, sys, tempfile
from pathlib import Path
d = Path(__file__).resolve().parents[1] / "vaka" / "depo"
html = (d / "index.html").read_text(encoding="utf-8")
al = lambda ad: json.loads(re.search(r"const " + ad + r'=("(?:[^"\\]|\\.)*")', html).group(1))
with tempfile.TemporaryDirectory() as t:
    (Path(t) / "toplama_temiz.csv").write_text(al("CSV"), encoding="utf-8")
    (Path(t) / "kod.py").write_text(al("COZUM") + "\n" + al("TEST"), encoding="utf-8")
    r = subprocess.run([sys.executable, "kod.py"], cwd=t, capture_output=True, text=True, encoding="utf-8")
assert r.returncode == 0, r.stderr
veri = json.loads(r.stdout.rsplit("__VAKA__", 1)[1])
bek = json.loads((d / "beklenen.json").read_text(encoding="utf-8"))["python"]
assert veri["denetim"] == bek["denetim"], veri["denetim"]
for k in ("eski", "yeni"):
    assert veri["grup"][k]["count"] == bek["grup"][k]["count"] and abs(veri["grup"][k]["mean"] - bek["grup"][k]["mean"]) < 1e-9
print(json.dumps({"vaka": "depo", "satir": veri["denetim"]["satir_sayisi"], "grup": veri["grup"]}, ensure_ascii=False))
