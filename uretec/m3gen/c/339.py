import pandas as pd

df = pd.DataFrame({
    "magaza": ["Konak", "Konak", "Konak", "Bornova", "Bornova"],
    "kategori": ["gıda", "temizlik", "kırtasiye", "gıda", "temizlik"],
    "ciro": [600, 300, 100, 450, 50],
})
df["magaza_toplam"] = df.groupby("magaza")["ciro"].transform("sum")
df["pay"] = (df["ciro"] / df["magaza_toplam"]).round(2)
print(df[["magaza", "kategori", "pay"]].to_string(index=False))

ozet = df.groupby("magaza")["ciro"].sum()
print(ozet.to_dict(), len(df), len(ozet))
