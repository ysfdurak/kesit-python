basvurular = [
    {"ad": "Ayşe", "gelir": 25000, "kara_liste": False},
    {"ad": "Mehmet", "gelir": 9000, "kara_liste": False},
    {"ad": "Zeynep", "gelir": 40000, "kara_liste": True},
]
print(any(b["kara_liste"] for b in basvurular))
print(all(b["gelir"] >= 10000 for b in basvurular))
print(all(b["ad"] for b in basvurular))   # boş ad yok mu?
print(any([]), all([]))                     # boş kaynakta: False, True