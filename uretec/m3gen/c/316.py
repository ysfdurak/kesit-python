from string import Template

json_ornek = '{"kategori": "iade", "oncelik": 1}'

sablon_f = "Talebi sınıflandır. Örnek çıktı: " + json_ornek + "\nTalep: {talep}"
try:
    print(sablon_f.format(talep="Paketim gelmedi"))
except KeyError as e:
    print("KeyError:", e)

sablon_t = Template("Örnek çıktı: $ornek\nTalep: $talep\nMüşteri: $musteri")
print(sablon_t.safe_substitute(ornek=json_ornek, talep="Paketim gelmedi"))
try:
    sablon_t.substitute(ornek=json_ornek, talep="Paketim gelmedi")
except KeyError as e:
    print("KeyError:", e)
