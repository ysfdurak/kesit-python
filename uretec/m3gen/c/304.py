def hava_durumu(sehir):
    return {"İzmir": "24°C, güneşli", "Ankara": "12°C, bulutlu"}.get(sehir, "bilinmiyor")

ARACLAR = {"hava_durumu": hava_durumu}

class SahteModel:
    def __init__(self):
        self.cagri = 0
    def create(self, messages):
        self.cagri += 1
        son = messages[-1]
        if isinstance(son["content"], str):          # kullanıcının sorusu
            return {"stop_reason": "tool_use", "content": [
                {"type": "text", "text": "Bakıyorum."},
                {"type": "tool_use", "id": "t1", "name": "hava_durumu", "input": {"sehir": "İzmir"}},
                {"type": "tool_use", "id": "t2", "name": "hava_durumu", "input": {"sehir": "Ankara"}}]}
        sonuc = {b["tool_use_id"]: b["content"] for b in son["content"]}
        return {"stop_reason": "end_turn", "content": [
            {"type": "text", "text": f"İzmir {sonuc['t1']}; Ankara {sonuc['t2']}."}]}

model = SahteModel()
mesajlar = [{"role": "user", "content": "İzmir ve Ankara'da hava nasıl?"}]
while True:
    yanit = model.create(mesajlar)
    mesajlar.append({"role": "assistant", "content": yanit["content"]})
    if yanit["stop_reason"] != "tool_use":
        break
    sonuc_bloklari = []
    for blok in yanit["content"]:
        if blok["type"] == "tool_use":
            cikti = ARACLAR[blok["name"]](**blok["input"])
            sonuc_bloklari.append({"type": "tool_result",
                                   "tool_use_id": blok["id"], "content": cikti})
    mesajlar.append({"role": "user", "content": sonuc_bloklari})

print(model.cagri, len(mesajlar))
print([m["role"] for m in mesajlar])
print(mesajlar[-1]["content"][0]["text"])
