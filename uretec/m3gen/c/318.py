import json

def sahte_ozetleyici(metin, max_kelime=12):
    # Gerçekte LLM çağrısı olurdu; testte deterministik sahte yanıt
    duygu = "olumsuz" if "geç" in metin else "notr"
    return json.dumps({"ozet": " ".join(metin.split()[:max_kelime]),
                       "dil": "tr", "duygu": duygu})

VAKALAR = [
    ("Siparişim üç gün geç geldi ve kutu ezikti", "olumsuz"),
    ("Ürün açıklamadaki gibi", "notr"),
    ("Kargo geç kaldı ama ürün harika, çok memnunum", "olumlu"),
]

def test_sema():                       # her çıktı geçerli JSON ve doğru anahtarlar
    for metin, _ in VAKALAR:
        cikti = json.loads(sahte_ozetleyici(metin))
        assert set(cikti) == {"ozet", "dil", "duygu"}
        assert len(cikti["ozet"].split()) <= 12

def test_duygu(metin, beklenen):       # pytest'te @pytest.mark.parametrize ile
    gelen = json.loads(sahte_ozetleyici(metin))["duygu"]
    assert gelen == beklenen, f"{beklenen} beklendi, {gelen} geldi"

# pytest'in yaptığını taklit eden küçük koşucu
gecti, kaldi = 0, []
for fn, args in [(test_sema, ())] + [(test_duygu, v) for v in VAKALAR]:
    try:
        fn(*args)
        gecti += 1
    except AssertionError as e:
        kaldi.append(f"{fn.__name__}: {e}")
print(gecti, "geçti")
print(kaldi)
