import asyncio

class HizSiniri(Exception):
    pass

async def ozetle(belge):
    await asyncio.sleep(0.01)
    if belge == "b3":
        raise HizSiniri("429")
    if belge == "b5":
        raise ValueError("boş belge")
    return belge.upper()

async def main():
    belgeler = ["b1", "b2", "b3", "b4", "b5"]
    try:
        sonuclar = await asyncio.gather(*(ozetle(b) for b in belgeler))
    except HizSiniri as e:
        print("gather düştü:", type(e).__name__)
    sonuclar = await asyncio.gather(*(ozetle(b) for b in belgeler),
                                    return_exceptions=True)
    basarili = {b: s for b, s in zip(belgeler, sonuclar) if not isinstance(s, BaseException)}
    hatali = {b: type(s).__name__ for b, s in zip(belgeler, sonuclar) if isinstance(s, BaseException)}
    print(basarili)
    print(hatali)

asyncio.run(main())
