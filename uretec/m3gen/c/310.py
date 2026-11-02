import asyncio

etkin = en_fazla = 0

async def llm_cagir(i, sinir):
    global etkin, en_fazla
    async with sinir:
        etkin += 1
        en_fazla = max(en_fazla, etkin)
        await asyncio.sleep(0.01 * (5 - i % 5))   # farklı yanıt süreleri
        etkin -= 1
        return f"özet-{i}"

async def main(limit):
    global en_fazla
    en_fazla = 0
    sinir = asyncio.Semaphore(limit)          # döngü içinde oluşturulur
    sonuclar = await asyncio.gather(*(llm_cagir(i, sinir) for i in range(10)))
    print(limit, sonuclar[:3], len(sonuclar), "en fazla eşzamanlı:", en_fazla)

asyncio.run(main(3))
asyncio.run(main(100))
