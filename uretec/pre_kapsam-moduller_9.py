def faiz_hesapla(anapara, yillik_oran, ay):
    """Basit faiz: anapara * oran * (ay / 12)"""
    return round(anapara * yillik_oran * ay / 12, 2)

def main():
    print("Ilgaz Bank mevduat hesabı")
    print("6 ay, 50.000 TL, %40:", faiz_hesapla(50000, 0.40, 6))

print("__name__ değeri:", __name__)
if __name__ == "__main__":
    main()