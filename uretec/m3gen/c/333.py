from sklearn.datasets import load_iris
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import KFold, cross_val_score

X, y = load_iris(return_X_y=True)       # sınıflara göre SIRALI: 50 + 50 + 50
print(y[:3], y[-3:])
model = LogisticRegression(max_iter=1000)

print(cross_val_score(model, X, y, cv=KFold(3)).round(2).tolist())
print(cross_val_score(model, X, y, cv=3).round(2).tolist())
print(cross_val_score(model, X, y, cv=KFold(3, shuffle=True, random_state=0)).round(2).tolist())
