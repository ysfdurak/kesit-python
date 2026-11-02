def logla(fonk):
    def sarici(*args, **kwargs):
        print(f"-> {fonk.__name__}")
        return fonk(*args, **kwargs)
    return sarici

@logla
def bakiye_sorgu(hesap):
    return 12500

print(bakiye_sorgu("TR1"))
print(bakiye_sorgu.__name__)   # sarici! asıl adı kayboldu