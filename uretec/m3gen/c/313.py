import numpy as np

belgeler = ["iade politikası", "kargo süreleri", "fatura düzeltme",
            "genel SSS (uzun)", "kampanya koşulları"]
E = np.array([
    [0.9, 0.1, 0.0],
    [0.1, 0.9, 0.1],
    [0.0, 0.2, 0.9],
    [3.0, 3.0, 0.3],   # normu büyük vektör
    [0.2, 0.1, 0.3],
])
sorgu = np.array([1.0, 0.2, 0.0])

ham = E @ sorgu
print([belgeler[i] for i in np.argsort(-ham)[:2]])

En = E / np.linalg.norm(E, axis=1, keepdims=True)
qn = sorgu / np.linalg.norm(sorgu)
kos = En @ qn
k = 2
aday = np.argpartition(-kos, k)[:k]          # sırasız ilk k
sirali = aday[np.argsort(-kos[aday])]       # yalnız k aday sıralanır
print([belgeler[i] for i in sirali], np.round(kos[sirali], 3).tolist())
