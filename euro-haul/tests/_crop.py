import zlib, struct, sys
def read_png(path):
    data = open(path,'rb').read(); pos=8; idat=b''
    while pos < len(data):
        ln = struct.unpack('>I', data[pos:pos+4])[0]; typ=data[pos+4:pos+8]; body=data[pos+8:pos+8+ln]
        if typ==b'IHDR': w,h,bd,ct = struct.unpack('>IIBB', body[:10])
        elif typ==b'IDAT': idat += body
        pos += 12+ln
    raw = zlib.decompress(idat); stride=w*3; out=bytearray(w*h*3); prev=bytearray(stride)
    for y in range(h):
        f=raw[y*(stride+1)]; line=bytearray(raw[y*(stride+1)+1:(y+1)*(stride+1)])
        if f==1:
            for i in range(3,stride): line[i]=(line[i]+line[i-3])&255
        elif f==2:
            for i in range(stride): line[i]=(line[i]+prev[i])&255
        elif f==3:
            for i in range(stride):
                a=line[i-3] if i>=3 else 0
                line[i]=(line[i]+((a+prev[i])>>1))&255
        elif f==4:
            for i in range(stride):
                a=line[i-3] if i>=3 else 0; b=prev[i]; c=prev[i-3] if i>=3 else 0
                p=a+b-c; pa=abs(p-a); pb=abs(p-b); pc=abs(p-c)
                pr=a if (pa<=pb and pa<=pc) else (b if pb<=pc else c)
                line[i]=(line[i]+pr)&255
        out[y*stride:(y+1)*stride]=line; prev=line
    return w,h,out
def write_png(path,w,h,rgb):
    raw=bytearray(); stride=w*3
    for y in range(h): raw.append(0); raw+=rgb[y*stride:(y+1)*stride]
    def chunk(t,d): return struct.pack('>I',len(d))+t+d+struct.pack('>I',zlib.crc32(t+d)&0xffffffff)
    ihdr=struct.pack('>IIBBBBB',w,h,8,2,0,0,0)
    open(path,'wb').write(b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',ihdr)+chunk(b'IDAT',zlib.compress(bytes(raw),6))+chunk(b'IEND',b''))
src,dst,x0,y0,cw,ch,scale = sys.argv[1], sys.argv[2], *map(int, sys.argv[3:8])
w,h,px = read_png(src)
ow,oh = cw*scale, ch*scale
out=bytearray(ow*oh*3)
for y in range(oh):
    sy = min(h-1, y0 + y//scale)
    for x in range(ow):
        sx = min(w-1, x0 + x//scale)
        si=(sy*w+sx)*3; di=(y*ow+x)*3
        out[di:di+3]=px[si:si+3]
write_png(dst, ow, oh, out)
print('ok', ow, oh)
