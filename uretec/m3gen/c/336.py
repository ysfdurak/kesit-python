import numpy as np

musteri = np.array([[1.0, 2.0], [4.0, 6.0], [0.0, 0.0]])   # 3 müşteri, 2 özellik
merkez = np.array([[0.0, 0.0], [3.0, 4.0]])                # 2 küme merkezi

d_dongu = np.zeros((3, 2))
for i in range(3):
    for j in range(2):
        d_dongu[i, j] = np.sqrt(((musteri[i] - merkez[j]) ** 2).sum())

fark = musteri[:, None, :] - merkez[None, :, :]
print(fark.shape)
d_vek = np.sqrt((fark ** 2).sum(axis=-1))
print(np.allclose(d_dongu, d_vek))
print(d_vek.round(2).tolist())
print(d_vek.argmin(axis=1).tolist())
