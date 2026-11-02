import pandas as pd

talep = pd.Series([10, 12, 30, 11, 13],
                  index=pd.date_range("2024-05-01", periods=5), name="talep")
df = talep.to_frame()
df["ort3_sizinti"] = talep.rolling(3, min_periods=1).mean().round(1)
df["ort3_dogru"] = talep.shift(1).rolling(3, min_periods=1).mean().round(1)
print(df.to_string())
