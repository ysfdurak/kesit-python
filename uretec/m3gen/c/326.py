import json

yanitlar = [
    {"stop_reason": "end_turn", "text": '{"urun": "Kettle", "puan": 4}'},
    {"stop_reason": "max_tokens", "text": '{"urun": "Blender", "ozellikler": ["800W", "cam hazn'},
    {"stop_reason": "refusal", "text": ""},
]

for y in yanitlar:
    if y["stop_reason"] == "max_tokens":
        print("kesildi -> max_tokens'ı artır ya da çıktıyı kısalt")
    elif y["stop_reason"] != "end_turn":
        print("beklenmeyen durma:", y["stop_reason"])
    else:
        print(json.loads(y["text"]))

try:
    json.loads(yanitlar[1]["text"])     # kontrol etmeden ayrıştırmak
except json.JSONDecodeError as e:
    print(type(e).__name__, "-", e.msg)
