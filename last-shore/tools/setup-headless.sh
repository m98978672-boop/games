#!/usr/bin/env bash
# Готовит headless Chromium для тестов в «пустой» песочнице:
# 1) распаковывает браузер из @sparticuz/chromium,
# 2) собирает крошечные заглушки libnspr4/libnss3/libnssutil3 (их нет в системе),
#    экспортируя ровно те символы, которые просит бинарник.
set -e
DIR=/tmp/nssstub
BIN=/tmp/chromium
mkdir -p "$DIR"

if [ ! -x "$BIN" ]; then
  node -e "import('@sparticuz/chromium').then(m => (m.default||m).executablePath()).then(p => console.log('exe:', p))"
fi

python3 - <<'PY'
import subprocess, re, collections, json
out = subprocess.run(['objdump','-T','/tmp/chromium'], capture_output=True, text=True).stdout
syms = collections.defaultdict(set)
for line in out.splitlines():
    if '*UND*' not in line:
        continue
    name = line.split()[-1]
    m = re.search(r'\(([^)]+)\)', line)
    ver = m.group(1) if m else 'Base'
    if re.match(r'^(PR_|NSS_|NSSUTIL_|SEC|PK11|SSL_|CERT_|SECMOD_)', name):
        syms[ver].add(name)
names = sorted(set().union(*syms.values())) if syms else []
with open('/tmp/nssstub/stubs.c','w') as f:
    f.write('#include <stddef.h>\n')
    for n in names:
        f.write(f'void *{n}(void) {{ return NULL; }}\n')
def lib_for(n):
    if n.startswith('PR_'): return 'libnspr4.so'
    if n.startswith('NSSUTIL_'): return 'libnssutil3.so'
    return 'libnss3.so'
by_lib = collections.defaultdict(lambda: collections.defaultdict(set))
for ver, ss in syms.items():
    for n in ss:
        by_lib[lib_for(n)][ver].add(n)
for lib, vers in by_lib.items():
    with open('/tmp/nssstub/' + lib + '.map','w') as f:
        for ver, ss in sorted(vers.items()):
            if ver == 'Base':
                continue
            f.write(f'{ver} {{\n  global: ' + '; '.join(sorted(ss)) + ';\n};\n')
print('символов:', len(names))
PY

cd "$DIR"
for lib in libnspr4.so libnss3.so libnssutil3.so; do
  if [ -s "$lib.map" ]; then
    gcc -shared -fPIC -o "$lib" stubs.c -Wl,--version-script="$lib.map" -Wl,-soname,"$lib"
  else
    gcc -shared -fPIC -o "$lib" stubs.c -Wl,-soname,"$lib"
  fi
done

LD_LIBRARY_PATH="$DIR" "$BIN" --version
