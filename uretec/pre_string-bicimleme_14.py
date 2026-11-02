musteri = "Ayşe Yılmaz"
hesap_no = "TR33 0006 1005 1978 6457 8413 26"
bakiye = 12500.5
baslik = f"""{'ILGAZ BANK':^40}
{'Hesap Özeti':^40}
{'=' * 40}
Müşteri : {musteri}
IBAN    : {hesap_no}
Bakiye  : {bakiye:,.2f} TL
{'=' * 40}"""
print(baslik)