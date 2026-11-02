import math                      # 1) modülü tümüyle al, math. öneki ile kullan
print(math.ceil(1234.1))

from math import sqrt, floor     # 2) yalnızca istenen adları al
print(sqrt(144), floor(7.9))

import statistics as st          # 3) kısa takma ad (alias)
print(st.mean([120, 85, 230]))

from random import randint as rastgele_tam   # 4) ada takma ad
print(type(rastgele_tam(1, 6)))