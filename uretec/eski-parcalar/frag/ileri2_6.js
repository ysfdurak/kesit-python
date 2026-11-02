(function (W) {
'use strict';
const L = W.PY_LESSONS = W.PY_LESSONS || [];
L.push(
{ id: 'paketleme-dagitim', lv: 'ileri', mod: 'Üretime Hazırlık', min: 36,
    title: 'Paketleme ve dağıtım: pyproject, CLI, sürümleme, wheel ve Docker',
    sum: 'Kodunu kurulabilir bir pakete dönüştür: pyproject.toml, src düzeni, argparse ile CLI, entry point, semver, wheel/sdist, pip install -e ve Docker\'a kısa bakış.',
    goals: ['pyproject.toml ve src düzeniyle kurulabilir paket iskeleti kurabilirim', 'argparse ile alt komutlu, test edilebilir bir CLI yazabilirim', 'Entry point ile paketimi terminal komutu olarak sunabilirim', 'Semantik sürümlemeyi uygular ve sürümleri karşılaştırabilirim', 'wheel/sdist üretimi, editable kurulum ve Docker imajının temel mantığını açıklayabilirim'],
    body: `<h2>Neden önemli?</h2>
<p>"Bilgisayarımda çalışıyor" cümlesi, kurumsal yazılımda bir hata raporudur. Anadolu Bank\'ta yazdığın kredi skoru modülü üç farklı ekibin projesinde, bir zamanlanmış görevde ve bir Docker konteynerinde çalışacaksa; kodu <b>paket</b> olarak kurulabilir, sürümlenebilir ve komut satırından çağrılabilir yapman gerekir. Bu ders modern Python paketleme standardını (PEP 517/518/621) ve dağıtım zincirini anlatır. Pyodide\'de <code>pip</code> ve derleme araçları yok; bu yüzden yapılandırma dosyalarını gösterim olarak okuyacak, CLI ve sürümleme mantığını ise gerçekten çalıştıracağız.</p>

<h2>pyproject.toml ve src düzeni</h2>
<p><code>pyproject.toml</code>, paketin tek yapılandırma dosyasıdır: ad, sürüm, bağımlılıklar, derleme aracı ve araç ayarları (ruff, mypy, pytest). <b>src düzeni</b> (src layout) paketi <code>src/paket_adi/</code> altına koyar; böylece testler kurulmamış kaynak klasörü yerine kurulu paketi içe aktarır ve "yerelde çalışıyor, kurulunca çalışmıyor" hatası erken yakalanır.</p>
<pre class="py">PYPROJECT = '''
[build-system]
requires = ["setuptools&gt;=69", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "anadolu-skor"
version = "1.2.0"
description = "Anadolu Bank kredi skoru araçları"
requires-python = "&gt;=3.11"
dependencies = ["httpx&gt;=0.27", "pydantic&gt;=2"]

[project.optional-dependencies]
dev = ["pytest", "ruff", "mypy"]

[project.scripts]
anadolu-skor = "anadolu_skor.cli:main"

[tool.setuptools.packages.find]
where = ["src"]
'''
import tomllib
cfg = tomllib.loads(PYPROJECT)
print(cfg['project']['name'], cfg['project']['version'])
print('bağımlılıklar:', cfg['project']['dependencies'])
print('komut:', cfg['project']['scripts'])
</pre>
<div class="tbl-wrap"><table><tr><th>Dosya / klasör</th><th>Görevi</th></tr><tr><td>pyproject.toml</td><td>Paket üst verisi, bağımlılıklar, araç ayarları</td></tr><tr><td>src/anadolu_skor/__init__.py</td><td>Paket kökü; <code>__version__</code> burada</td></tr><tr><td>src/anadolu_skor/cli.py</td><td>Komut satırı giriş noktası</td></tr><tr><td>tests/</td><td>pytest testleri (paketin dışında)</td></tr><tr><td>README.md, LICENSE, CHANGELOG.md</td><td>Belgeleme ve lisans; README PyPI sayfası olur</td></tr><tr><td>dist/</td><td>Üretilen wheel ve sdist (git\'e girmez)</td></tr></table></div>
<div class="note"><b>requirements.txt ile farkı</b><code>dependencies</code> paketin ihtiyaç duyduğu <i>aralıkları</i> söyler (<code>httpx&gt;=0.27</code>). <code>requirements.txt</code> ya da lock dosyası (pip-tools, uv, poetry) ise belirli bir ortamda kurulan <i>tam sürümleri</i> sabitler. Kütüphane yazıyorsan geniş aralık; uygulama dağıtıyorsan lock dosyası.</div>

<h2>argparse ile CLI</h2>
<p>Paket bir komut sunuyorsa giriş noktası <code>main(argv=None)</code> imzalı olmalı: <code>parse_args(argv)</code> listeyi parametre alır; böylece test, <code>sys.argv</code>\'ye dokunmadan <code>main(['skor', '--gelir', '5000'])</code> çağırabilir. Alt komutlar (<code>skor</code>, <code>rapor</code>) için <code>add_subparsers</code> kullan ve her alt komuta <code>set_defaults(func=...)</code> ile işlev bağla.</p>
<pre class="py">import argparse, json

def skor_hesapla(gelir: float, gecikme: int) -&gt; int:
    return int(max(300, min(900, gelir / 100 - gecikme * 40)))

def cmd_skor(args):
    s = skor_hesapla(args.gelir, args.gecikme)
    if args.json:
        print(json.dumps({'gelir': args.gelir, 'gecikme': args.gecikme, 'skor': s}))
    else:
        print(f'Skor: {s}')
    return 0 if s &gt;= 500 else 2            # çıkış kodu: 2 = riskli

def cmd_surum(args):
    print('anadolu-skor 1.2.0'); return 0

def build_parser():
    p = argparse.ArgumentParser(prog='anadolu-skor', description='Kredi skoru araçları')
    p.add_argument('-v', '--verbose', action='store_true')
    sub = p.add_subparsers(dest='komut', required=True)
    s = sub.add_parser('skor', help='skor hesapla')
    s.add_argument('--gelir', type=float, required=True)
    s.add_argument('--gecikme', type=int, default=0)
    s.add_argument('--json', action='store_true')
    s.set_defaults(func=cmd_skor)
    sub.add_parser('surum', help='sürümü yaz').set_defaults(func=cmd_surum)
    return p

def main(argv=None) -&gt; int:
    args = build_parser().parse_args(argv)
    return args.func(args)

print('çıkış:', main(['skor', '--gelir', '60000', '--gecikme', '1']))
print('çıkış:', main(['skor', '--gelir', '20000', '--gecikme', '3', '--json']))
print('çıkış:', main(['surum']))
</pre>
<div class="tip"><b>Çıkış kodu</b><code>main</code> int döndürsün, <code>if __name__ == '__main__': raise SystemExit(main())</code> ile çağrılsın. 0 başarı, 1 genel hata, 2 kullanım hatası geleneği cron ve CI\'da "iş başarısız" sinyalini ücretsiz verir. Hata mesajları <code>stderr</code>\'a, veri <code>stdout</code>\'a: böylece çıktı boruyla başka komuta aktarılabilir.</div>

<h2>Entry point ve editable kurulum</h2>
<p><code>[project.scripts]</code> altındaki <code>anadolu-skor = "anadolu_skor.cli:main"</code> satırı, kurulumda <code>anadolu-skor</code> adlı bir çalıştırılabilir üretir; bu dosya <code>main()</code>\'i çağırıp dönüş değerini çıkış koduna çevirir. Geliştirme sırasında <code>pip install -e .</code> (editable) paketi kopyalamak yerine kaynağa bağlar: kodu değiştirince yeniden kurmadan etkisi görülür.</p>
<div class="steps-list"><ol><li><code>python -m venv .venv &amp;&amp; source .venv/bin/activate</code></li><li><code>pip install -e ".[dev]"</code> → paket + geliştirme bağımlılıkları</li><li><code>anadolu-skor skor --gelir 50000</code> → entry point çalışır</li><li><code>pytest</code> → testler kurulu paketi içe aktarır</li><li><code>python -m build</code> → <code>dist/anadolu_skor-1.2.0-py3-none-any.whl</code> ve <code>.tar.gz</code></li><li><code>twine upload dist/*</code> (ya da şirket içi depo: Artifactory, Nexus, devpi)</li></ol></div>

<h2>Sürümleme: semver</h2>
<p>Semantik sürümleme <code>MAJOR.MINOR.PATCH</code>: PATCH hata düzeltmesi (geriye uyumlu), MINOR yeni özellik (geriye uyumlu), MAJOR kırıcı değişiklik. Ön sürüm ekleri (<code>1.3.0rc1</code>) sıralamada final sürümün önüne gelir. Bağımlılık belirtirken <code>&gt;=1.2,&lt;2</code> (ya da <code>~=1.2</code>) kalıbı, kırıcı değişikliği dışarıda bırakır. Sürümü tek yerde tut: <code>pyproject.toml</code>\'da ya da <code>__init__.py</code>\'de (<code>dynamic = ["version"]</code> ile diğerinden okunur).</p>
<pre class="py">import re
from functools import total_ordering

@total_ordering
class Surum:
    _rx = re.compile(r'^(\\d+)\\.(\\d+)\\.(\\d+)(?:rc(\\d+))?$')

    def __init__(self, metin):
        m = self._rx.match(metin)
        if not m:
            raise ValueError(f'geçersiz sürüm: {metin!r}')
        self.major, self.minor, self.patch = (int(m[i]) for i in (1, 2, 3))
        self.rc = int(m[4]) if m[4] else None

    def _anahtar(self):
        # rc'li sürüm aynı numaralı finalden küçük: (.., 0, rc) &lt; (.., 1, 0)
        return (self.major, self.minor, self.patch, 0 if self.rc is not None else 1, self.rc or 0)

    def __eq__(self, o): return self._anahtar() == o._anahtar()
    def __lt__(self, o): return self._anahtar() &lt; o._anahtar()
    def __repr__(self):
        return f'{self.major}.{self.minor}.{self.patch}' + (f'rc{self.rc}' if self.rc is not None else '')

    def uyumlu(self, diger):
        """~= uyumu: aynı major, en az bu sürüm."""
        return self.major == diger.major and diger &gt;= self

print(sorted(Surum(s) for s in ['1.10.0', '1.2.0', '1.2.0rc1', '2.0.0', '1.9.3']))
print(Surum('1.2.0').uyumlu(Surum('1.9.3')), Surum('1.2.0').uyumlu(Surum('2.0.0')))
</pre>
<div class="warn"><b>Sürüm metni sıralaması</b><code>'1.10.0' &lt; '1.9.0'</code> metin olarak doğrudur ama sürüm olarak yanlıştır. Her zaman sayısal parçalara ayır ya da <code>packaging.version.Version</code> kullan.</div>

<h2>wheel, sdist ve Docker</h2>
<p><b>sdist</b> (source distribution) kaynak kodun arşividir; kurulumda derlenir. <b>wheel</b> önceden derlenmiş, doğrudan kopyalanan biçimdir; saf Python paketlerde <code>py3-none-any</code>, C uzantılılarda platforma özel etiket taşır. Kurumsal depolara wheel yüklemek kurulumu hızlandırır ve derleme araçları gerektirmez.</p>
<p>Docker, paketi işletim sistemi ve Python sürümüyle birlikte paketler. Tipik <code>Dockerfile</code> iki aşamalıdır: ilk aşamada wheel üretilir, ikinci aşamada yalnızca wheel kurulur; böylece derleme araçları son imaja girmez ve imaj küçük kalır.</p>
<pre class="py">DOCKERFILE = '''
FROM python:3.12-slim AS build
WORKDIR /src
COPY . .
RUN pip install --no-cache-dir build &amp;&amp; python -m build --wheel

FROM python:3.12-slim
COPY --from=build /src/dist/*.whl /tmp/
RUN pip install --no-cache-dir /tmp/*.whl &amp;&amp; rm /tmp/*.whl
USER 1000
ENTRYPOINT ["anadolu-skor"]
CMD ["--help"]
'''
asamalar = [s for s in DOCKERFILE.splitlines() if s.startswith('FROM')]
print('aşama sayısı:', len(asamalar))
for s in asamalar:
    print(' ', s)
</pre>

<section class="deep"><span class="eyebrow">Uzmanlaş</span>
<h3>Kurumsal dağıtım zinciri</h3>
<p>Olgun ekiplerde paket sürümü git etiketinden türetilir (<code>setuptools-scm</code> ya da <code>hatch-vcs</code>): <code>v1.2.0</code> etiketi atılınca CI wheel üretir, testleri koşar, şirket içi PyPI\'ye yükler ve Docker imajını aynı etiketle kayıt defterine (registry) iter. Elle sürüm numarası yazmak ve "unuttum" hataları böylece biter. CHANGELOG, "Keep a Changelog" biçiminde tutulur ve her MINOR/MAJOR sürümde kırıcı değişiklikler açıkça yazılır.</p>
<p>Bağımlılık güvenliği: lock dosyası tekrarlanabilir kurulum sağlar; <code>pip-audit</code> bilinen zafiyetleri tarar; Dependabot/Renovate güncellemeleri otomatik PR olarak açar. Docker imajında <code>root</code> olmayan kullanıcı, sabitlenmiş temel imaj etiketi ve <code>--no-cache-dir</code> standarttır.</p>
<p>Alternatif araç zincirleri: <code>uv</code> (çok hızlı pip/venv/lock), <code>poetry</code> ve <code>hatch</code> (bağımlılık + derleme + yayın tek araç). Hepsi aynı <code>pyproject.toml</code> standardına dayanır; ekip hangisini seçerse seçsin bu dersteki kavramlar değişmez.</p>
</section>`,
    ex: [
      { t: 'code', id: 'paketleme-dagitim-1',
        q: '<p><code>argparse</code> ile <code>build_parser()</code> ve <code>main(argv=None) -> int</code> yaz. Program adı <code>anadolu-market</code>. Alt komutlar: <code>kdv</code> (<code>--tutar</code> float zorunlu, <code>--oran</code> float varsayılan 0.20) KDV dahil tutarı <code>f\'{x:.2f}\'</code> biçiminde yazdırıp 0 döndürsün; <code>sehirler</code> (<code>--sayi</code> int varsayılan 3) <code>[\'İstanbul\', \'Ankara\', \'İzmir\', \'Bursa\', \'Antalya\']</code> listesinin ilk <code>sayi</code> elemanını her satıra bir tane yazdırıp 0 döndürsün. Alt komut zorunlu olsun.</p>',
        start: 'import argparse\n\nSEHIRLER = [\'İstanbul\', \'Ankara\', \'İzmir\', \'Bursa\', \'Antalya\']\n\ndef build_parser():\n    pass\n\ndef main(argv=None):\n    pass\n',
        sol: 'import argparse\n\nSEHIRLER = [\'İstanbul\', \'Ankara\', \'İzmir\', \'Bursa\', \'Antalya\']\n\ndef cmd_kdv(args):\n    print(f\'{args.tutar * (1 + args.oran):.2f}\')\n    return 0\n\ndef cmd_sehirler(args):\n    for s in SEHIRLER[:args.sayi]:\n        print(s)\n    return 0\n\ndef build_parser():\n    p = argparse.ArgumentParser(prog=\'anadolu-market\')\n    sub = p.add_subparsers(dest=\'komut\', required=True)\n    k = sub.add_parser(\'kdv\')\n    k.add_argument(\'--tutar\', type=float, required=True)\n    k.add_argument(\'--oran\', type=float, default=0.20)\n    k.set_defaults(func=cmd_kdv)\n    s = sub.add_parser(\'sehirler\')\n    s.add_argument(\'--sayi\', type=int, default=3)\n    s.set_defaults(func=cmd_sehirler)\n    return p\n\ndef main(argv=None):\n    args = build_parser().parse_args(argv)\n    return args.func(args)\n',
        tests: 'import io, contextlib\ndef calistir(argv):\n    buf = io.StringIO()\n    with contextlib.redirect_stdout(buf):\n        kod = main(argv)\n    return kod, buf.getvalue()\nkod, out = calistir([\'kdv\', \'--tutar\', \'100\'])\nassert kod == 0 and out.strip() == \'120.00\', f"kdv varsayılan oran: {out!r}"\nkod, out = calistir([\'kdv\', \'--tutar\', \'50\', \'--oran\', \'0.1\'])\nassert out.strip() == \'55.00\', "kdv özel oran"\nkod, out = calistir([\'sehirler\'])\nassert out.strip().splitlines() == [\'İstanbul\', \'Ankara\', \'İzmir\'], "sehirler varsayılan 3"\nkod, out = calistir([\'sehirler\', \'--sayi\', \'1\'])\nassert out.strip() == \'İstanbul\', "sehirler --sayi 1"\np = build_parser()\nassert p.prog == \'anadolu-market\', "prog adı"\ntry:\n    with contextlib.redirect_stderr(io.StringIO()):\n        p.parse_args([])\n    assert False, "Alt komut zorunlu olmalı"\nexcept SystemExit:\n    pass\n',
        hints: ['add_subparsers(dest=\'komut\', required=True).', 'Her alt komuta set_defaults(func=...) ile işlev bağla; main args.func(args) döndürsün.'],
        why: 'parse_args(argv) ile CLI saf bir fonksiyon gibi test edilir; alt komut + set_defaults kalıbı komut sayısı arttıkça if zincirini önler.' },
      { t: 'mc', q: '<code>pip install -e .</code> komutunun etkisi nedir?',
        o: ['Paketi site-packages\'a kopyalar', 'Paketi kaynak klasöre bağlar; kod değişikliği kurulum yenilemeden görünür', 'Yalnızca bağımlılıkları kurar, paketi kurmaz', 'Paketi wheel olarak derleyip dist/ klasörüne yazar'],
        a: 1, why: 'Editable kurulum paketi kopyalamak yerine kaynağa işaret eder; geliştirme sırasında her değişiklikte yeniden kurma gerekmez. Wheel üretimi python -m build işidir.' },
      { t: 'code', id: 'paketleme-dagitim-3',
        q: '<p><code>Surum</code> sınıfı yaz: <code>Surum(\'1.2.3\')</code> ya da <code>Surum(\'1.2.3rc1\')</code> ayrıştırsın (geçersizse <code>ValueError</code>); <code>major, minor, patch, rc</code> öznitelikleri (rc yoksa None). Karşılaştırma: rc\'li sürüm aynı numaralı finalden küçük, rc\'ler kendi aralarında sayıyla sıralanır. <code>__eq__</code>, <code>__lt__</code> (ve total_ordering) ile <code>sorted</code> çalışsın. <code>str(s)</code> orijinal biçimi versin. Ek metot <code>yukselt(seviye)</code>: <code>\'major\'|\'minor\'|\'patch\'</code> için yeni (rc\'siz) Surum döndürsün; major artınca minor ve patch sıfırlanır, minor artınca patch sıfırlanır.</p>',
        start: 'import re\nfrom functools import total_ordering\n\n@total_ordering\nclass Surum:\n    pass\n',
        sol: 'import re\nfrom functools import total_ordering\n\n@total_ordering\nclass Surum:\n    _rx = re.compile(r\'^(\\d+)\\.(\\d+)\\.(\\d+)(?:rc(\\d+))?$\')\n\n    def __init__(self, metin):\n        m = self._rx.match(metin)\n        if not m:\n            raise ValueError(f\'geçersiz sürüm: {metin!r}\')\n        self.major, self.minor, self.patch = int(m[1]), int(m[2]), int(m[3])\n        self.rc = int(m[4]) if m[4] else None\n\n    def _anahtar(self):\n        return (self.major, self.minor, self.patch, 0 if self.rc is not None else 1, self.rc or 0)\n\n    def __eq__(self, o):\n        return isinstance(o, Surum) and self._anahtar() == o._anahtar()\n\n    def __lt__(self, o):\n        return self._anahtar() < o._anahtar()\n\n    def __hash__(self):\n        return hash(self._anahtar())\n\n    def __str__(self):\n        s = f\'{self.major}.{self.minor}.{self.patch}\'\n        return s + (f\'rc{self.rc}\' if self.rc is not None else \'\')\n\n    def yukselt(self, seviye):\n        if seviye == \'major\':\n            return Surum(f\'{self.major + 1}.0.0\')\n        if seviye == \'minor\':\n            return Surum(f\'{self.major}.{self.minor + 1}.0\')\n        if seviye == \'patch\':\n            return Surum(f\'{self.major}.{self.minor}.{self.patch + 1}\')\n        raise ValueError(seviye)\n',
        tests: 's = Surum(\'1.2.3rc1\')\nassert (s.major, s.minor, s.patch, s.rc) == (1, 2, 3, 1), "Ayrıştırma"\nassert Surum(\'2.0.0\').rc is None, "rc yoksa None"\nassert str(Surum(\'1.10.0\')) == \'1.10.0\' and str(s) == \'1.2.3rc1\', "__str__"\nsirali = [str(x) for x in sorted(Surum(v) for v in [\'1.10.0\', \'1.2.0\', \'1.2.0rc2\', \'1.2.0rc1\', \'2.0.0\', \'1.9.3\'])]\nassert sirali == [\'1.2.0rc1\', \'1.2.0rc2\', \'1.2.0\', \'1.9.3\', \'1.10.0\', \'2.0.0\'], f"Sıralama yanlış: {sirali}"\nassert Surum(\'1.2.0\') == Surum(\'1.2.0\') and Surum(\'1.2.0\') >= Surum(\'1.2.0rc9\'), "Eşitlik ve >="\nassert str(Surum(\'1.2.3\').yukselt(\'major\')) == \'2.0.0\', "major yükseltme"\nassert str(Surum(\'1.2.3\').yukselt(\'minor\')) == \'1.3.0\', "minor yükseltme"\nassert str(Surum(\'1.2.3rc1\').yukselt(\'patch\')) == \'1.2.4\', "patch yükseltme rc\'yi düşürmeli"\nfor kotu in (\'1.2\', \'v1.2.3\', \'1.2.3-beta\', \'a.b.c\'):\n    try:\n        Surum(kotu); assert False, f"{kotu} ValueError vermeli"\n    except ValueError:\n        pass\n',
        hints: ['Regex: ^(\\d+)\\.(\\d+)\\.(\\d+)(?:rc(\\d+))?$', 'Sıralama anahtarı: (major, minor, patch, 0 rc varsa / 1 final, rc_no).'],
        why: 'Sürümü sayısal parçalara ayırmak metin sıralaması hatasını önler; rc için ek bayrak, ön sürümü finalden önce konumlandırır.' },
      { t: 'code', id: 'paketleme-dagitim-4',
        q: '<p>Bağımlılık belirtimi çözümleyici. <code>uyumlu_mu(belirtim: str, surum: str) -> bool</code>: belirtim <code>\'&gt;=1.2,&lt;2\'</code> gibi virgülle ayrılmış koşullardan oluşur; operatörler <code>&gt;=, &lt;=, &gt;, &lt;, ==, !=</code>. Sürümler <code>\'1.2\'</code> ya da <code>\'1.2.3\'</code> biçiminde; eksik parçalar 0 sayılır (<code>1.2 == 1.2.0</code>). Tüm koşullar sağlanıyorsa True. Boş belirtim her sürümle uyumludur.</p>',
        start: 'import operator\n\ndef uyumlu_mu(belirtim, surum):\n    pass\n',
        sol: 'import operator, re\n\n_OPS = {\'>=\': operator.ge, \'<=\': operator.le, \'>\': operator.gt, \'<\': operator.lt, \'==\': operator.eq, \'!=\': operator.ne}\n\ndef _parcala(v):\n    p = [int(x) for x in v.strip().split(\'.\')]\n    while len(p) < 3:\n        p.append(0)\n    return tuple(p)\n\ndef uyumlu_mu(belirtim, surum):\n    hedef = _parcala(surum)\n    for kosul in filter(None, (k.strip() for k in belirtim.split(\',\'))):\n        m = re.match(r\'^(>=|<=|==|!=|>|<)\\s*([\\d.]+)$\', kosul)\n        if not m:\n            raise ValueError(f\'geçersiz koşul: {kosul!r}\')\n        if not _OPS[m[1]](hedef, _parcala(m[2])):\n            return False\n    return True\n',
        tests: 'assert uyumlu_mu(\'>=1.2,<2\', \'1.9.3\'), "1.9.3 aralıkta"\nassert not uyumlu_mu(\'>=1.2,<2\', \'2.0.0\'), "2.0.0 üst sınır dışı"\nassert not uyumlu_mu(\'>=1.2,<2\', \'1.1.9\'), "1.1.9 alt sınır dışı"\nassert uyumlu_mu(\'==1.2\', \'1.2.0\'), "1.2 == 1.2.0"\nassert uyumlu_mu(\'!=1.2.3\', \'1.2.4\') and not uyumlu_mu(\'!=1.2.3\', \'1.2.3\'), "!="\nassert uyumlu_mu(\'>1.10\', \'1.11.0\') and not uyumlu_mu(\'>1.10\', \'1.9.9\'), "1.10 > 1.9 sayısal karşılaştırma"\nassert uyumlu_mu(\'\', \'0.0.1\'), "Boş belirtim her şeyle uyumlu"\nassert uyumlu_mu(\' >= 1.0 , <= 1.5 \', \'1.5\'), "Boşluklar tolere edilmeli"\n',
        hints: ['Sürümü tuple\'a çevir, eksik parçaları 0 ile doldur; tuple karşılaştırması sayısaldır.', 'operator modülündeki ge/le/gt/lt/eq/ne fonksiyonlarını sözlükte eşle.'],
        why: 'pip\'in yaptığı işin sade hali: her koşul bağımsız değerlendirilir, hepsi sağlanmalı. Tuple karşılaştırması 1.10 > 1.9 sorununu çözer.' },
      { t: 'mc', q: 'Bir kütüphane <code>1.4.2</code> sürümünde. Geriye uyumlu yeni bir fonksiyon eklendi. Semver\'e göre yeni sürüm ne olmalı?',
        o: ['2.0.0', '1.4.3', '1.5.0', '1.4.2.1'],
        a: 2, why: 'Geriye uyumlu yeni özellik MINOR artışıdır: 1.5.0 (PATCH sıfırlanır). 1.4.3 hata düzeltmesi, 2.0.0 kırıcı değişiklik içindir.' },
      { t: 'code', id: 'paketleme-dagitim-6',
        q: '<p>pyproject doğrulayıcı. <code>pyproject_kontrol(metin: str) -> list[str]</code>: TOML metnini <code>tomllib.loads</code> ile ayrıştırıp şu sorunları listelesin (sorun yoksa boş liste): <code>\'build-system eksik\'</code>; <code>\'project.name eksik\'</code>; <code>\'project.version geçersiz\'</code> (yoksa ya da <code>X.Y.Z</code> biçiminde değilse); <code>\'project.requires-python eksik\'</code>; her <code>project.scripts</code> girdisi <code>\'modul.yol:fonksiyon\'</code> biçiminde değilse <code>f\'scripts.{ad} geçersiz\'</code>. Sorunlar bu sırayla listelensin.</p>',
        start: 'import tomllib, re\n\ndef pyproject_kontrol(metin):\n    pass\n',
        sol: 'import tomllib, re\n\ndef pyproject_kontrol(metin):\n    cfg = tomllib.loads(metin)\n    sorunlar = []\n    if \'build-system\' not in cfg:\n        sorunlar.append(\'build-system eksik\')\n    proje = cfg.get(\'project\', {})\n    if \'name\' not in proje:\n        sorunlar.append(\'project.name eksik\')\n    if not re.fullmatch(r\'\\d+\\.\\d+\\.\\d+\', str(proje.get(\'version\', \'\'))):\n        sorunlar.append(\'project.version geçersiz\')\n    if \'requires-python\' not in proje:\n        sorunlar.append(\'project.requires-python eksik\')\n    for ad, hedef in proje.get(\'scripts\', {}).items():\n        if not re.fullmatch(r\'[A-Za-z_][\\w.]*:[A-Za-z_]\\w*\', str(hedef)):\n            sorunlar.append(f\'scripts.{ad} geçersiz\')\n    return sorunlar\n',
        tests: 'iyi = \'\'\'\n[build-system]\nrequires = ["setuptools"]\n[project]\nname = "anadolu-skor"\nversion = "1.2.0"\nrequires-python = ">=3.11"\n[project.scripts]\nanadolu-skor = "anadolu_skor.cli:main"\n\'\'\'\nassert pyproject_kontrol(iyi) == [], "Geçerli dosyada sorun olmamalı"\nkotu = \'\'\'\n[project]\nversion = "1.2"\n[project.scripts]\nx = "anadolu_skor.cli"\ny = "paket.mod:main"\n\'\'\'\nassert pyproject_kontrol(kotu) == [\'build-system eksik\', \'project.name eksik\', \'project.version geçersiz\', \'project.requires-python eksik\', \'scripts.x geçersiz\'], f"Sorun listesi: {pyproject_kontrol(kotu)}"\nassert pyproject_kontrol(\'[build-system]\\nrequires=[]\\n\') == [\'project.name eksik\', \'project.version geçersiz\', \'project.requires-python eksik\'], "project tablosu yoksa"\n',
        hints: ['tomllib.loads sözlük döndürür; cfg.get(\'project\', {}) ile güvenli eriş.', 'Entry point biçimi için re.fullmatch(r\'[\\w.]+:\\w+\', hedef).'],
        why: 'CI\'da böyle bir kontrol, "yanlış entry point ile yayınlanan paket" gibi pahalı hataları yayından önce yakalar.' },
      { t: 'code', id: 'paketleme-dagitim-7',
        q: '<p>Çıkış kodu ve stderr disiplini. <code>main(argv) -> int</code>: tek argüman <code>--dosya YOL</code> alır. Dosya yoksa <code>sys.stderr</code>\'a <code>f\'hata: {yol} bulunamadı\'</code> yazıp 1 döndürür. Varsa satır sayısını <code>stdout</code>\'a yazıp 0 döndürür. Argüman eksikse argparse\'ın kendi davranışı (SystemExit 2) kalsın.</p>',
        start: 'import argparse, sys\nfrom pathlib import Path\n\ndef main(argv=None):\n    pass\n',
        sol: 'import argparse, sys\nfrom pathlib import Path\n\ndef main(argv=None):\n    p = argparse.ArgumentParser(prog=\'satir-say\')\n    p.add_argument(\'--dosya\', required=True)\n    args = p.parse_args(argv)\n    yol = Path(args.dosya)\n    if not yol.exists():\n        print(f\'hata: {args.dosya} bulunamadı\', file=sys.stderr)\n        return 1\n    print(len(yol.read_text(encoding=\'utf-8\').splitlines()))\n    return 0\n',
        tests: 'import io, contextlib, tempfile\nd = Path(tempfile.mkdtemp())\n(d / \'a.txt\').write_text(\'x\\ny\\nz\\n\', encoding=\'utf-8\')\nout, err = io.StringIO(), io.StringIO()\nwith contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):\n    kod = main([\'--dosya\', str(d / \'a.txt\')])\nassert kod == 0 and out.getvalue().strip() == \'3\' and err.getvalue() == \'\', "Var olan dosya: 3 satır, stderr boş"\nout, err = io.StringIO(), io.StringIO()\nwith contextlib.redirect_stdout(out), contextlib.redirect_stderr(err):\n    kod = main([\'--dosya\', str(d / \'yok.txt\')])\nassert kod == 1 and out.getvalue() == \'\' and \'bulunamadı\' in err.getvalue(), "Olmayan dosya: kod 1, mesaj stderr\'da"\ntry:\n    with contextlib.redirect_stderr(io.StringIO()):\n        main([])\n    assert False, "Eksik argüman SystemExit vermeli"\nexcept SystemExit as e:\n    assert e.code == 2, "argparse kullanım hatası kodu 2"\n',
        hints: ['print(..., file=sys.stderr) ile hata akışına yaz.', 'Dönüş değeri çıkış kodudur; raise SystemExit(main()) dış katmanda yapılır.'],
        why: 'Veri stdout\'a, hata stderr\'a ve anlamlı çıkış kodu: cron, CI ve boru hatları bu sözleşmeye dayanır.' }
    ],
    faq: [
      { q: 'setup.py hâlâ gerekli mi?', a: 'Hayır. PEP 621 ile pyproject.toml tek dosya yeter; setuptools, hatch, flit, poetry hepsi okur. Eski projelerde setup.py görürsen onu pyproject\'e taşımak iyi bir ilk görevdir.' },
      { q: 'click/typer yerine argparse mi?', a: 'argparse standart kütüphanede, bağımlılık eklemez; küçük ve orta CLI için yeter. Çok alt komutlu, renkli, otomatik tamamlamalı araçlarda typer (tip ipuçlarından CLI üretir) daha hızlı geliştirilir.' },
      { q: 'Şirket içi paket deposu nasıl olur?', a: 'Artifactory, Nexus, devpi ya da bulut sağlayıcı depoları PyPI protokolünü konuşur; pip --index-url ile yönlendirilir. CI, etiketlenen sürümü buraya twine ile yükler.' }
    ],
    mistakes: [
      { bad: 'def main():\n    args = parser.parse_args()  # sys.argv\'ye bağlı', good: 'def main(argv=None):\n    args = parser.parse_args(argv)', why: 'argv parametresi olmadan CLI yalnızca alt süreç olarak test edilebilir; listeyle çağrı birim testi mümkün kılar.' },
      { bad: 'if \'1.10.0\' > \'1.9.0\': ...  # False!', good: 'from packaging.version import Version\nif Version(\'1.10.0\') > Version(\'1.9.0\'): ...', why: 'Metin karşılaştırması karakter karakterdir; sürümler sayısal parçalarla karşılaştırılmalı.' },
      { bad: 'dependencies = ["httpx==0.27.0", "pydantic==2.6.1"]  # kütüphanede', good: 'dependencies = ["httpx>=0.27,<1", "pydantic>=2,<3"]', why: 'Kütüphane bağımlılığını tam sabitlemek, kullanıcıların diğer paketleriyle çakışma yaratır; sabitleme uygulamanın lock dosyasında olur.' },
      { bad: 'print(\'hata: dosya yok\')\nreturn 0', good: 'print(\'hata: dosya yok\', file=sys.stderr)\nreturn 1', why: 'Hata stdout\'a ve kod 0 ile dönerse cron ve CI işi başarılı sanır; veri boruları bozulur.' }
    ]
  }
);
})(window);
