def islem_no(baslangic=1000):
    n = baslangic
    while True:
        yield f"TRX-{n}"
        n += 1

uretici = islem_no()
for _ in range(3):
    print(next(uretici))

# break ile dur
for no in islem_no(2000):
    if no.endswith("3"):
        print("durduk:", no)
        break