x = 1234.5678
print(format(x, ",.2f"))
print(format(x, ">15.1f"))

ondalik = 3
print(f"{x:.{ondalik}f}")          # f-string içinde iç içe belirteç

sablon = "Sayın {ad}, {tarih} itibarıyla bakiyeniz {bakiye:,.2f} TL'dir."
print(sablon.format(ad="Ayşe Yılmaz", tarih="28.10.2026", bakiye=12500.5))
print("{0} - {1} - {0}".format("A", "B"))