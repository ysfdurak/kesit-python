import shlex
print(shlex.split('x.exe /quiet TargetDir="C:\\Python 312" A=1', posix=False))
print(shlex.split('x.exe /quiet "C:\\Python 312" A=1', posix=False))
