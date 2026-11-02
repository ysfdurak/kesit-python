from contextlib import contextmanager

@contextmanager
def banka_islemi(hesap):
    print("işlem başladı, bakiye:", hesap["bakiye"])
    yedek = hesap["bakiye"]
    try:
        yield hesap
        print("işlem onaylandı, bakiye:", hesap["bakiye"])
    except Exception as e:
        hesap["bakiye"] = yedek
        print(f"hata ({e}); geri alındı, bakiye: {hesap['bakiye']}")

hesap = {"bakiye": 1000}

with banka_islemi(hesap) as h:
    h["bakiye"] -= 300

with banka_islemi(hesap) as h:
    h["bakiye"] -= 900
    if h["bakiye"] < 0:
        raise ValueError("yetersiz bakiye")

print("son bakiye:", hesap["bakiye"])