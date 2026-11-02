(function (W) { const A = W.PY_ARENA = W.PY_ARENA || []; A.push(
 { id: 'a-t1', title: 'Toplam', track: 'Python dili', diff: 'Kolay', pts: 10, mode: 'stdin', statement: '<p>x</p>', input: '', output: '', samples: [{ in: '3\n1 2 3\n', out: '6\n' }], hidden: [{ in: '1\n5\n', out: '5' }, { in: '2\n-1 1\n', out: '0' }, { in: '3\n0 0 0\n', out: '0' }, { gen: 'import random\nrandom.seed(1)\nn=100000\nprint(n)\nprint(*[random.randint(1,9) for _ in range(n)])' }], start: 'n = int(input())\n', sol: 'n = int(input())\nprint(sum(map(int, input().split())))\n' },
 { id: 'a-t2', title: 'f', track: 'Algoritmalar', diff: 'Orta', pts: 30, mode: 'func', statement: '<p>x</p>', start: 'def f(x):\n    pass\n', sol: 'def f(x):\n    return x*2\n', tests: 'assert f(2)==4' }
);
const Q = W.PY_INTERVIEW = W.PY_INTERVIEW || []; Q.push({ id: 'm-t1', roles: ['genel'], lv: 'orta', topic: 'x', kind: 'kod-okuma', q: 'q', a: 'a', code: 'def ekle(x, l=[]):\n    l.append(x)\n    return l\nprint(ekle(1), ekle(2))\n', out: '[1, 2] [1, 2]' });
const M = W.PY_MISTAKES = W.PY_MISTAKES || []; M.push({ id: 'h-t1', topic: 'x', lv: 'temel', title: 't', bad: 'print(1+"a")', bad_err: 'TypeError', good: 'print(str(1)+"a")', good_out: '1a', why: 'w' });
})(window);
