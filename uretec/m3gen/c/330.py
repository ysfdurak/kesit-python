gecmis = [
    {"role": "user", "content": "Siparişim nerede?", "t": 300},
    {"role": "assistant", "content": [{"type": "tool_use", "id": "a1"}], "t": 200},
    {"role": "user", "content": [{"type": "tool_result", "tool_use_id": "a1"}], "t": 1500},
    {"role": "assistant", "content": "Kargoda, yarın gelir.", "t": 100},
    {"role": "user", "content": "İade edebilir miyim?", "t": 80},
    {"role": "assistant", "content": "Evet, 14 gün içinde.", "t": 120},
    {"role": "user", "content": "Kargo ücretini kim öder?", "t": 60},
]

def tur(m):
    icerik = m["content"]
    return m["role"] + ":" + (icerik[0]["type"] if isinstance(icerik, list) else "metin")

def toplam(ms):
    return sum(m["t"] for m in ms)

def saf_kirp(ms, butce):
    ms = list(ms)
    while toplam(ms) > butce:
        ms.pop(0)
    return ms

def guvenli_kirp(ms, butce):
    ms = list(ms)
    def basi_gecerli():
        return ms[0]["role"] == "user" and isinstance(ms[0]["content"], str)
    while len(ms) > 1 and (toplam(ms) > butce or not basi_gecerli()):
        ms.pop(0)
    return ms

print(toplam(gecmis))
for fn in (saf_kirp, guvenli_kirp):
    k = fn(gecmis, 2000)
    print(fn.__name__, len(k), toplam(k), tur(k[0]))
