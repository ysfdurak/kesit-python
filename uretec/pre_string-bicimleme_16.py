print("Şube".ljust(10, ".") + "|")
print("İzmir".rjust(10) + "|")
print("Çağrı".center(11, "*") + "|")
print(len("İzmir"), len("Izmir"))
print(len("Şirin Öztürk"), len("Sirin Ozturk"))
for sehir in ["İstanbul", "Çorum", "Iğdır", "Muş"]:
    print(sehir.ljust(10) + "|" + str(len(sehir)).rjust(3))