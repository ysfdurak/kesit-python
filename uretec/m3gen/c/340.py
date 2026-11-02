import pandas as pd

gunler = pd.date_range("2024-03-04", periods=10, freq="D")   # 4 Mart 2024 Pazartesi
satis = pd.Series(range(1, 11), index=gunler)

h = satis.resample("W").agg(["sum", "count"])
print([d.strftime("%d.%m") for d in h.index], h["sum"].tolist(), h["count"].tolist())

h2 = satis.resample("W-MON", label="left", closed="left").sum()
print([d.strftime("%d.%m") for d in h2.index], h2.tolist())
