import re, sys
p = sys.argv[1]; s = open(p).read()
def f(m): return m.group(0).replace('{{', '{').replace('}}', '}')
s2 = re.sub(r'pre\("""(.*?)"""\)', f, s, flags=re.S)
print('değişti' if s2 != s else 'aynı'); open(p, 'w').write(s2)
