def logla(fonk):
    def sarici(*args, **kwargs):
        print(f"-> {fonk.__name__} çağrıldı, args={args}")
        sonuc = fonk(*args, **kwargs)
        print(f"<- {fonk.__name__} bitti, sonuç={sonuc}")
        return sonuc
    return sarici

def transfer(kaynak, hedef, tutar):
    return f"{kaynak}->{hedef}: {tutar}"

transfer = logla(transfer)      # elle sarmalama
print(transfer("TR1", "TR2", 500))