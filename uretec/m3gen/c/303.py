def sahte_akis():
    yield {"type": "message_start", "usage": {"input_tokens": 42}}
    for parca in ["İade ", "süresi ", "14 ", "gündür."]:
        yield {"type": "content_block_delta",
               "delta": {"type": "text_delta", "text": parca}}
    yield {"type": "message_delta", "delta": {"stop_reason": "end_turn"},
           "usage": {"output_tokens": 9}}
    yield {"type": "message_stop"}

metin = []
girdi = cikti = 0
durma = None
for olay in sahte_akis():
    tur = olay["type"]
    if tur == "message_start":
        girdi = olay["usage"]["input_tokens"]
    elif tur == "content_block_delta" and olay["delta"]["type"] == "text_delta":
        parca = olay["delta"]["text"]
        metin.append(parca)
        print(parca, end="|", flush=True)   # ekrana anında yaz
    elif tur == "message_delta":
        durma = olay["delta"]["stop_reason"]
        cikti = olay["usage"]["output_tokens"]
print()
print("".join(metin))
print(durma, girdi, cikti)
