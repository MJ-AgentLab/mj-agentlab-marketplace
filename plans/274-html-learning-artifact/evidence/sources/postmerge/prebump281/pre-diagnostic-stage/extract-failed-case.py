import pathlib,re,sys
root=pathlib.Path(sys.argv[1]);raw=(root/'linux-job.log').read_bytes();lines=raw.splitlines(keepends=True)
start=next(i for i,line in enumerate(lines) if b'not ok 328 - actual browser measures' in line)
end=next(i for i in range(start+1,len(lines)) if b'# Subtest:' in lines[i])
(root/'linux-failing-case-328.raw.txt').write_bytes(b''.join(lines[start:end]))
print('Preserved original failing TAP case lines without changing original bytes.')
