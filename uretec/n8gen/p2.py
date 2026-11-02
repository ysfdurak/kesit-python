import sys; sys.path.insert(0, '/home/claude/py/tools/pylib')
import os; os.environ['PP_VERI'] = '/home/claude/py/data'
import veri, re
from collections import Counter
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, f1_score, classification_report
y = [r for r in veri.kayitlar("lezzet_kurye", "lk_ratings") if r["comment"]]
def etiket(r):
    o = (r["food_score"] + r["courier_score"]) / 2
    return "olumlu" if o >= 4 else ("olumsuz" if o < 3 else "notr")
X = [r["comment"] for r in y]; Y = [etiket(r) for r in y]
print(len(X), Counter(Y))
Xtr, Xte, ytr, yte = train_test_split(X, Y, test_size=0.25, random_state=42, stratify=Y)
def tr_kucuk(s): return s.replace("I","ı").replace("İ","i").lower()
m = make_pipeline(TfidfVectorizer(preprocessor=tr_kucuk), LogisticRegression(max_iter=1000))
m.fit(Xtr, ytr)
p = m.predict(Xte)
print(accuracy_score(yte, p), f1_score(yte, p, average="macro"), Counter(yte).most_common(1)[0][1]/len(yte))
print(classification_report(yte, p, zero_division=0))
print(m.predict(["Yemek buz gibiydi", "Kurye kibar ve hızlıydı", "Çok beklettiler", "Lezzetliydi ama soğuktu"]))
# char ngram
m2 = make_pipeline(TfidfVectorizer(analyzer="char_wb", ngram_range=(2,4), preprocessor=tr_kucuk), LogisticRegression(max_iter=1000)).fit(Xtr, ytr)
p2 = m2.predict(Xte); print(accuracy_score(yte, p2))
print(m2.predict(["Yemek buz gibiydi", "Kurye kibar ve hızlıydı", "Çok beklettiler", "Lezzetliydi ama soğuktu"]))
# per-text majority upper bound
d = {}
for a,b in zip(X,Y): d.setdefault(a, Counter())[b]+=1
for k,v in d.items(): print(k, dict(v), m.predict([k])[0])
