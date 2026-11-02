import math, random, statistics

# math: matematik
print(math.ceil(2.1), math.floor(2.9), round(2.5), round(3.5))
print(math.sqrt(2), math.pi)

# statistics: temel istatistik
bakiyeler = [1200, 4500, 980, 4500, 13000]
print("ortalama:", statistics.mean(bakiyeler))
print("medyan:", statistics.median(bakiyeler))
print("mod:", statistics.mode(bakiyeler))

# random: rastgelelik, seed ile tekrarlanabilir
random.seed(42)
print(random.randint(1, 100))
print(random.choice(["İstanbul", "Ankara", "İzmir"]))
print(random.sample(range(1000, 2000), 3))