(()=>{var Ei={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},Ti={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},qh=0,oc=1,Yh=2;var zr=1,pa=2,Us=3,wi=0,Ue=1,Ce=2,Wn=0,Fs=1,ac=2,lc=3,cc=4,Zh=5;var Yi=100,Jh=101,$h=102,Kh=103,jh=104,Qh=200,tu=201,eu=202,nu=203,hc=204,uc=205,iu=206,su=207,ru=208,ou=209,au=210,lu=211,cu=212,hu=213,uu=214,Lo=0,Do=1,No=2,ys=3,Uo=4,Fo=5,Oo=6,Bo=7,ma=0,du=1,fu=2,Ln=0,dc=1,fc=2,pc=3,Hr=4,mc=5,gc=6,_c=7;var xc=300,Ai=301,Zi=302,Os=303,ga=304,Vr=306,vs=1e3,kn=1001,ko=1002,Ve=1003,pu=1004;var Gr=1005;var Xe=1006,_a=1007;var Ri=1008;var rn=1009,yc=1010,vc=1011,Bs=1012,xa=1013,Dn=1014,Sn=1015,Nn=1016,ya=1017,va=1018,ks=1020,bc=35902,Sc=35899,Mc=1021,Ec=1022,Mn=1023,zn=1026,Ci=1027,ba=1028,Sa=1029,Pi=1030,Ma=1031;var Ea=1033,Wr=33776,Xr=33777,qr=33778,Yr=33779,Ta=35840,wa=35841,Aa=35842,Ra=35843,Ca=36196,Pa=37492,Ia=37496,La=37488,Da=37489,Zr=37490,Na=37491,Ua=37808,Fa=37809,Oa=37810,Ba=37811,ka=37812,za=37813,Ha=37814,Va=37815,Ga=37816,Wa=37817,Xa=37818,qa=37819,Ya=37820,Za=37821,Ja=36492,$a=36494,Ka=36495,ja=36283,Qa=36284,Jr=36285,tl=36286;var cr=2300,zo=2301,Po=2302,Yl=2303,Zl=2400,Jl=2401,$l=2402;var mu=3200;var $r=0,gu=1,oi="",Ge="srgb",hr="srgb-linear",ur="linear",fe="srgb";var Io=7680;var _u=519,xu=512,yu=513,vu=514,el=515,bu=516,Su=517,nl=518,Mu=519,Eu=35044;var Tc="300 es",Pn=2e3,bs=2001;function Xd(i){for(let t=i.length-1;t>=0;--t)if(i[t]>=65535)return!0;return!1}function qd(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function dr(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Tu(){let i=dr("canvas");return i.style.display="block",i}var gh={},Ss=null;function wc(...i){let t="THREE."+i.shift();Ss?Ss("log",t,...i):console.log(t,...i)}function wu(i){let t=i[0];if(typeof t=="string"&&t.startsWith("TSL:")){let e=i[1];e&&e.isStackTrace?i[0]+=" "+e.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function Jt(...i){i=wu(i);let t="THREE."+i.shift();if(Ss)Ss("warn",t,...i);else{let e=i[0];e&&e.isStackTrace?console.warn(e.getError(t)):console.warn(t,...i)}}function Qt(...i){i=wu(i);let t="THREE."+i.shift();if(Ss)Ss("error",t,...i);else{let e=i[0];e&&e.isStackTrace?console.error(e.getError(t)):console.error(t,...i)}}function Vi(...i){let t=i.join(" ");t in gh||(gh[t]=!0,Jt(...i))}function Au(i,t,e){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(t,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}var Ru={[Lo]:Do,[No]:Oo,[Uo]:Bo,[ys]:Fo,[Do]:Lo,[Oo]:No,[Bo]:Uo,[Fo]:ys},In=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){let n=this._listeners;return n===void 0?!1:n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){let n=this._listeners;if(n===void 0)return;let s=n[t];if(s!==void 0){let r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){let e=this._listeners;if(e===void 0)return;let n=e[t.type];if(n!==void 0){t.target=this;let s=n.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,t);t.target=null}}},Ze=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],_h=1234567,rr=Math.PI/180,Gi=180/Math.PI;function Ji(){let i=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Ze[i&255]+Ze[i>>8&255]+Ze[i>>16&255]+Ze[i>>24&255]+"-"+Ze[t&255]+Ze[t>>8&255]+"-"+Ze[t>>16&15|64]+Ze[t>>24&255]+"-"+Ze[e&63|128]+Ze[e>>8&255]+"-"+Ze[e>>16&255]+Ze[e>>24&255]+Ze[n&255]+Ze[n>>8&255]+Ze[n>>16&255]+Ze[n>>24&255]).toLowerCase()}function se(i,t,e){return Math.max(t,Math.min(e,i))}function Ac(i,t){return(i%t+t)%t}function Yd(i,t,e,n,s){return n+(i-t)*(s-n)/(e-t)}function Zd(i,t,e){return i!==t?(e-i)/(t-i):0}function or(i,t,e){return(1-e)*i+e*t}function Jd(i,t,e,n){return or(i,t,1-Math.exp(-e*n))}function $d(i,t=1){return t-Math.abs(Ac(i,t*2)-t)}function Kd(i,t,e){return i<=t?0:i>=e?1:(i=(i-t)/(e-t),i*i*(3-2*i))}function jd(i,t,e){return i<=t?0:i>=e?1:(i=(i-t)/(e-t),i*i*i*(i*(i*6-15)+10))}function Qd(i,t){return i+Math.floor(Math.random()*(t-i+1))}function tf(i,t){return i+Math.random()*(t-i)}function ef(i){return i*(.5-Math.random())}function nf(i){i!==void 0&&(_h=i);let t=_h+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function sf(i){return i*rr}function rf(i){return i*Gi}function of(i){return i>0&&Number.isInteger(i)&&2**Math.round(Math.log2(i))===i}function af(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function lf(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function cf(i,t,e,n,s){let r=Math.cos,o=Math.sin,a=r(e/2),l=o(e/2),c=r((t+n)/2),h=o((t+n)/2),u=r((t-n)/2),d=o((t-n)/2),f=r((n-t)/2),g=o((n-t)/2);switch(s){case"XYX":i.set(a*h,l*u,l*d,a*c);break;case"YZY":i.set(l*d,a*h,l*u,a*c);break;case"ZXZ":i.set(l*u,l*d,a*h,a*c);break;case"XZX":i.set(a*h,l*g,l*f,a*c);break;case"YXY":i.set(l*f,a*h,l*g,a*c);break;case"ZYZ":i.set(l*g,l*f,a*h,a*c);break;default:Jt("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function _s(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:case Uint8ClampedArray:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function tn(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var Rc={DEG2RAD:rr,RAD2DEG:Gi,generateUUID:Ji,clamp:se,euclideanModulo:Ac,mapLinear:Yd,inverseLerp:Zd,lerp:or,damp:Jd,pingpong:$d,smoothstep:Kd,smootherstep:jd,randInt:Qd,randFloat:tf,randFloatSpread:ef,seededRandom:nf,degToRad:sf,radToDeg:rf,isPowerOfTwo:of,ceilPowerOfTwo:af,floorPowerOfTwo:lf,setQuaternionFromProperEuler:cf,normalize:tn,denormalize:_s},Nc=class Nc{constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,n=this.y,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6],this.y=s[1]*e+s[4]*n+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=se(this.x,t.x,e.x),this.y=se(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=se(this.x,t,e),this.y=se(this.y,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(se(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(se(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let n=Math.cos(e),s=Math.sin(e),r=this.x-t.x,o=this.y-t.y;return this.x=r*n-o*s+t.x,this.y=r*s+o*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};Nc.prototype.isVector2=!0;var ct=Nc,dn=class{constructor(t=0,e=0,n=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=s}static slerpFlat(t,e,n,s,r,o,a){let l=n[s+0],c=n[s+1],h=n[s+2],u=n[s+3],d=r[o+0],f=r[o+1],g=r[o+2],x=r[o+3];if(u!==x||l!==d||c!==f||h!==g){let m=l*d+c*f+h*g+u*x;m<0&&(d=-d,f=-f,g=-g,x=-x,m=-m);let p=1-a;if(m<.9995){let b=Math.acos(m),M=Math.sin(b);p=Math.sin(p*b)/M,a=Math.sin(a*b)/M,l=l*p+d*a,c=c*p+f*a,h=h*p+g*a,u=u*p+x*a}else{l=l*p+d*a,c=c*p+f*a,h=h*p+g*a,u=u*p+x*a;let b=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=b,c*=b,h*=b,u*=b}}t[e]=l,t[e+1]=c,t[e+2]=h,t[e+3]=u}static multiplyQuaternionsFlat(t,e,n,s,r,o){let a=n[s],l=n[s+1],c=n[s+2],h=n[s+3],u=r[o],d=r[o+1],f=r[o+2],g=r[o+3];return t[e]=a*g+h*u+l*f-c*d,t[e+1]=l*g+h*d+c*u-a*f,t[e+2]=c*g+h*f+a*d-l*u,t[e+3]=h*g-a*u-l*d-c*f,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,s){return this._x=t,this._y=e,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let n=t._x,s=t._y,r=t._z,o=t._order,a=Math.cos,l=Math.sin,c=a(n/2),h=a(s/2),u=a(r/2),d=l(n/2),f=l(s/2),g=l(r/2);switch(o){case"XYZ":this._x=d*h*u+c*f*g,this._y=c*f*u-d*h*g,this._z=c*h*g+d*f*u,this._w=c*h*u-d*f*g;break;case"YXZ":this._x=d*h*u+c*f*g,this._y=c*f*u-d*h*g,this._z=c*h*g-d*f*u,this._w=c*h*u+d*f*g;break;case"ZXY":this._x=d*h*u-c*f*g,this._y=c*f*u+d*h*g,this._z=c*h*g+d*f*u,this._w=c*h*u-d*f*g;break;case"ZYX":this._x=d*h*u-c*f*g,this._y=c*f*u+d*h*g,this._z=c*h*g-d*f*u,this._w=c*h*u+d*f*g;break;case"YZX":this._x=d*h*u+c*f*g,this._y=c*f*u+d*h*g,this._z=c*h*g-d*f*u,this._w=c*h*u-d*f*g;break;case"XZY":this._x=d*h*u-c*f*g,this._y=c*f*u-d*h*g,this._z=c*h*g+d*f*u,this._w=c*h*u+d*f*g;break;default:Jt("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let n=e/2,s=Math.sin(n);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,n=e[0],s=e[4],r=e[8],o=e[1],a=e[5],l=e[9],c=e[2],h=e[6],u=e[10],d=n+a+u;if(d>0){let f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(h-l)*f,this._y=(r-c)*f,this._z=(o-s)*f}else if(n>a&&n>u){let f=2*Math.sqrt(1+n-a-u);this._w=(h-l)/f,this._x=.25*f,this._y=(s+o)/f,this._z=(r+c)/f}else if(a>u){let f=2*Math.sqrt(1+a-n-u);this._w=(r-c)/f,this._x=(s+o)/f,this._y=.25*f,this._z=(l+h)/f}else{let f=2*Math.sqrt(1+u-n-a);this._w=(o-s)/f,this._x=(r+c)/f,this._y=(l+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<1e-8?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(se(this.dot(t),-1,1)))}rotateTowards(t,e){let n=this.angleTo(t);if(n===0)return this;let s=Math.min(1,e/n);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let n=t._x,s=t._y,r=t._z,o=t._w,a=e._x,l=e._y,c=e._z,h=e._w;return this._x=n*h+o*a+s*c-r*l,this._y=s*h+o*l+r*a-n*c,this._z=r*h+o*c+n*l-s*a,this._w=o*h-n*a-s*l-r*c,this._onChangeCallback(),this}slerp(t,e){let n=t._x,s=t._y,r=t._z,o=t._w,a=this.dot(t);a<0&&(n=-n,s=-s,r=-r,o=-o,a=-a);let l=1-e;if(a<.9995){let c=Math.acos(a),h=Math.sin(c);l=Math.sin(l*c)/h,e=Math.sin(e*c)/h,this._x=this._x*l+n*e,this._y=this._y*l+s*e,this._z=this._z*l+r*e,this._w=this._w*l+o*e,this._onChangeCallback()}else this._x=this._x*l+n*e,this._y=this._y*l+s*e,this._z=this._z*l+r*e,this._w=this._w*l+o*e,this.normalize();return this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},Uc=class Uc{constructor(t=0,e=0,n=0){this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(xh.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(xh.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*s,this.y=r[1]*e+r[4]*n+r[7]*s,this.z=r[2]*e+r[5]*n+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=t.elements,o=1/(r[3]*e+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*s+r[12])*o,this.y=(r[1]*e+r[5]*n+r[9]*s+r[13])*o,this.z=(r[2]*e+r[6]*n+r[10]*s+r[14])*o,this}applyQuaternion(t){let e=this.x,n=this.y,s=this.z,r=t.x,o=t.y,a=t.z,l=t.w,c=2*(o*s-a*n),h=2*(a*e-r*s),u=2*(r*n-o*e);return this.x=e+l*c+o*u-a*h,this.y=n+l*h+a*c-r*u,this.z=s+l*u+r*h-o*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*s,this.y=r[1]*e+r[5]*n+r[9]*s,this.z=r[2]*e+r[6]*n+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=se(this.x,t.x,e.x),this.y=se(this.y,t.y,e.y),this.z=se(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=se(this.x,t,e),this.y=se(this.y,t,e),this.z=se(this.z,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(se(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let n=t.x,s=t.y,r=t.z,o=e.x,a=e.y,l=e.z;return this.x=s*l-r*a,this.y=r*o-n*l,this.z=n*a-s*o,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return Ml.copy(this).projectOnVector(t),this.sub(Ml)}reflect(t){return this.sub(Ml.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(se(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y,s=this.z-t.z;return e*e+n*n+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){let s=Math.sin(e)*t;return this.x=s*Math.sin(n),this.y=Math.cos(e)*t,this.z=s*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};Uc.prototype.isVector3=!0;var D=Uc,Ml=new D,xh=new dn,Fc=class Fc{constructor(t,e,n,s,r,o,a,l,c){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,o,a,l,c)}set(t,e,n,s,r,o,a,l,c){let h=this.elements;return h[0]=t,h[1]=s,h[2]=a,h[3]=e,h[4]=r,h[5]=l,h[6]=n,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],h=n[4],u=n[7],d=n[2],f=n[5],g=n[8],x=s[0],m=s[3],p=s[6],b=s[1],M=s[4],y=s[7],T=s[2],S=s[5],R=s[8];return r[0]=o*x+a*b+l*T,r[3]=o*m+a*M+l*S,r[6]=o*p+a*y+l*R,r[1]=c*x+h*b+u*T,r[4]=c*m+h*M+u*S,r[7]=c*p+h*y+u*R,r[2]=d*x+f*b+g*T,r[5]=d*m+f*M+g*S,r[8]=d*p+f*y+g*R,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8];return e*o*h-e*a*c-n*r*h+n*a*l+s*r*c-s*o*l}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8],u=h*o-a*c,d=a*l-h*r,f=c*r-o*l,g=e*u+n*d+s*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let x=1/g;return t[0]=u*x,t[1]=(s*c-h*n)*x,t[2]=(a*n-s*o)*x,t[3]=d*x,t[4]=(h*e-s*l)*x,t[5]=(s*r-a*e)*x,t[6]=f*x,t[7]=(n*l-c*e)*x,t[8]=(o*e-n*r)*x,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,s,r,o,a){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*o+c*a)+o+t,-s*c,s*l,-s*(-c*o+l*a)+a+e,0,0,1),this}scale(t,e){return Vi("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(El.makeScale(t,e)),this}rotate(t){return Vi("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(El.makeRotation(-t)),this}translate(t,e){return Vi("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(El.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<9;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}};Fc.prototype.isMatrix3=!0;var ne=Fc,El=new ne,yh=new ne().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),vh=new ne().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function hf(){let i={enabled:!0,workingColorSpace:hr,spaces:{},convert:function(s,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===fe&&(s.r=ni(s.r),s.g=ni(s.g),s.b=ni(s.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===fe&&(s.r=xs(s.r),s.g=xs(s.g),s.b=xs(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===oi?ur:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,o){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return Vi("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return Vi("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[hr]:{primaries:t,whitePoint:n,transfer:ur,toXYZ:yh,fromXYZ:vh,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:Ge},outputColorSpaceConfig:{drawingBufferColorSpace:Ge}},[Ge]:{primaries:t,whitePoint:n,transfer:fe,toXYZ:yh,fromXYZ:vh,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:Ge}}}),i}var le=hf();function ni(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function xs(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var is,Ho=class{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement=="undefined")return t.src;let n;if(t instanceof HTMLCanvasElement)n=t;else{is===void 0&&(is=dr("canvas")),is.width=t.width,is.height=t.height;let s=is.getContext("2d");t instanceof ImageData?s.putImageData(t,0,0):s.drawImage(t,0,0,t.width,t.height),n=is}return n.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement!="undefined"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement!="undefined"&&t instanceof HTMLCanvasElement||typeof ImageBitmap!="undefined"&&t instanceof ImageBitmap){let e=dr("canvas");e.width=t.width,e.height=t.height;let n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);let s=n.getImageData(0,0,t.width,t.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=ni(r[o]/255)*255;return n.putImageData(s,0,0),e}else if(t.data){let e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(ni(e[n]/255)*255):e[n]=ni(e[n]);return{data:e,width:t.width,height:t.height}}else return Jt("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},uf=0,Ms=class{constructor(t=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:uf++}),this.uuid=Ji(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let e=this.data;return typeof HTMLVideoElement!="undefined"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):typeof VideoFrame!="undefined"&&e instanceof VideoFrame?t.set(e.displayWidth,e.displayHeight,0):e!==null?t.set(e.width,e.height,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(Tl(s[o].image)):r.push(Tl(s[o]))}else r=Tl(s);n.url=r}return e||(t.images[this.uuid]=n),n}};function Tl(i){return typeof HTMLImageElement!="undefined"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement!="undefined"&&i instanceof HTMLCanvasElement||typeof ImageBitmap!="undefined"&&i instanceof ImageBitmap?Ho.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(Jt("Texture: Unable to serialize Texture."),{})}var df=0,wl=new D,en=class i extends In{constructor(t=i.DEFAULT_IMAGE,e=i.DEFAULT_MAPPING,n=kn,s=kn,r=Xe,o=Ri,a=Mn,l=rn,c=i.DEFAULT_ANISOTROPY,h=oi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:df++}),this.uuid=Ji(),this.name="",this.source=new Ms(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new ct(0,0),this.repeat=new ct(1,1),this.center=new ct(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ne,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(wl).x}get height(){return this.source.getSize(wl).y}get depth(){return this.source.getSize(wl).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let e in t){let n=t[e];if(n===void 0){Jt(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){Jt(`Texture.setValues(): property '${e}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==xc)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case vs:t.x=t.x-Math.floor(t.x);break;case kn:t.x=t.x<0?0:1;break;case ko:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case vs:t.y=t.y-Math.floor(t.y);break;case kn:t.y=t.y<0?0:1;break;case ko:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};en.DEFAULT_IMAGE=null;en.DEFAULT_MAPPING=xc;en.DEFAULT_ANISOTROPY=1;var Oc=class Oc{constructor(t=0,e=0,n=0,s=1){this.x=t,this.y=e,this.z=n,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=this.w,o=t.elements;return this.x=o[0]*e+o[4]*n+o[8]*s+o[12]*r,this.y=o[1]*e+o[5]*n+o[9]*s+o[13]*r,this.z=o[2]*e+o[6]*n+o[10]*s+o[14]*r,this.w=o[3]*e+o[7]*n+o[11]*s+o[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,s,r,l=t.elements,c=l[0],h=l[4],u=l[8],d=l[1],f=l[5],g=l[9],x=l[2],m=l[6],p=l[10];if(Math.abs(h-d)<.01&&Math.abs(u-x)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+x)<.1&&Math.abs(g+m)<.1&&Math.abs(c+f+p-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let M=(c+1)/2,y=(f+1)/2,T=(p+1)/2,S=(h+d)/4,R=(u+x)/4,_=(g+m)/4;return M>y&&M>T?M<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(M),s=S/n,r=R/n):y>T?y<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(y),n=S/s,r=_/s):T<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(T),n=R/r,s=_/r),this.set(n,s,r,e),this}let b=Math.sqrt((m-g)*(m-g)+(u-x)*(u-x)+(d-h)*(d-h));return Math.abs(b)<.001&&(b=1),this.x=(m-g)/b,this.y=(u-x)/b,this.z=(d-h)/b,this.w=Math.acos((c+f+p-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=se(this.x,t.x,e.x),this.y=se(this.y,t.y,e.y),this.z=se(this.z,t.z,e.z),this.w=se(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=se(this.x,t,e),this.y=se(this.y,t,e),this.z=se(this.z,t,e),this.w=se(this.w,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(se(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};Oc.prototype.isVector4=!0;var Ee=Oc,Vo=class extends In{constructor(t=1,e=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Xe,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=n.depth,this.scissor=new Ee(0,0,t,e),this.scissorTest=!1,this.viewport=new Ee(0,0,t,e),this.textures=[];let s={width:t,height:e,depth:n.depth},r=new en(s),o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(t={}){let e={minFilter:Xe,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),t!==null&&t.renderTarget===null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,n=t.textures.length;e<n;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;let s=Object.assign({},t.textures[e].image);this.textures[e].source=new Ms(s)}if(this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveColorBuffer=t.resolveColorBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,this.storeMultisampledColorBuffer=t.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=t.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=t.storeMultisampledStencilBuffer,t.depthTexture!==null)if(t.depthTexture.renderTarget===t){let e=t.depthTexture.clone();e.renderTarget=null,this.depthTexture=e}else this.depthTexture=t.depthTexture;return this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},nn=class extends Vo{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}},fr=class extends en{constructor(t=null,e=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=Ve,this.minFilter=Ve,this.wrapR=kn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var Go=class extends en{constructor(t=null,e=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=Ve,this.minFilter=Ve,this.wrapR=kn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}};var fa=class fa{constructor(t,e,n,s,r,o,a,l,c,h,u,d,f,g,x,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,o,a,l,c,h,u,d,f,g,x,m)}set(t,e,n,s,r,o,a,l,c,h,u,d,f,g,x,m){let p=this.elements;return p[0]=t,p[4]=e,p[8]=n,p[12]=s,p[1]=r,p[5]=o,p[9]=a,p[13]=l,p[2]=c,p[6]=h,p[10]=u,p[14]=d,p[3]=f,p[7]=g,p[11]=x,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new fa().fromArray(this.elements)}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){let e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return this.determinantAffine()===0?(t.set(1,0,0),e.set(0,1,0),n.set(0,0,1),this):(t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();let e=this.elements,n=t.elements,s=1/ss.setFromMatrixColumn(t,0).length(),r=1/ss.setFromMatrixColumn(t,1).length(),o=1/ss.setFromMatrixColumn(t,2).length();return e[0]=n[0]*s,e[1]=n[1]*s,e[2]=n[2]*s,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*o,e[9]=n[9]*o,e[10]=n[10]*o,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,n=t.x,s=t.y,r=t.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),u=Math.sin(r);if(t.order==="XYZ"){let d=o*h,f=o*u,g=a*h,x=a*u;e[0]=l*h,e[4]=-l*u,e[8]=c,e[1]=f+g*c,e[5]=d-x*c,e[9]=-a*l,e[2]=x-d*c,e[6]=g+f*c,e[10]=o*l}else if(t.order==="YXZ"){let d=l*h,f=l*u,g=c*h,x=c*u;e[0]=d+x*a,e[4]=g*a-f,e[8]=o*c,e[1]=o*u,e[5]=o*h,e[9]=-a,e[2]=f*a-g,e[6]=x+d*a,e[10]=o*l}else if(t.order==="ZXY"){let d=l*h,f=l*u,g=c*h,x=c*u;e[0]=d-x*a,e[4]=-o*u,e[8]=g+f*a,e[1]=f+g*a,e[5]=o*h,e[9]=x-d*a,e[2]=-o*c,e[6]=a,e[10]=o*l}else if(t.order==="ZYX"){let d=o*h,f=o*u,g=a*h,x=a*u;e[0]=l*h,e[4]=g*c-f,e[8]=d*c+x,e[1]=l*u,e[5]=x*c+d,e[9]=f*c-g,e[2]=-c,e[6]=a*l,e[10]=o*l}else if(t.order==="YZX"){let d=o*l,f=o*c,g=a*l,x=a*c;e[0]=l*h,e[4]=x-d*u,e[8]=g*u+f,e[1]=u,e[5]=o*h,e[9]=-a*h,e[2]=-c*h,e[6]=f*u+g,e[10]=d-x*u}else if(t.order==="XZY"){let d=o*l,f=o*c,g=a*l,x=a*c;e[0]=l*h,e[4]=-u,e[8]=c*h,e[1]=d*u+x,e[5]=o*h,e[9]=f*u-g,e[2]=g*u-f,e[6]=a*h,e[10]=x*u+d}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(ff,t,pf)}lookAt(t,e,n){let s=this.elements;return ln.subVectors(t,e),ln.lengthSq()===0&&(ln.z=1),ln.normalize(),ui.crossVectors(n,ln),ui.lengthSq()===0&&(Math.abs(n.z)===1?ln.x+=1e-4:ln.z+=1e-4,ln.normalize(),ui.crossVectors(n,ln)),ui.normalize(),ao.crossVectors(ln,ui),s[0]=ui.x,s[4]=ao.x,s[8]=ln.x,s[1]=ui.y,s[5]=ao.y,s[9]=ln.y,s[2]=ui.z,s[6]=ao.z,s[10]=ln.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],h=n[1],u=n[5],d=n[9],f=n[13],g=n[2],x=n[6],m=n[10],p=n[14],b=n[3],M=n[7],y=n[11],T=n[15],S=s[0],R=s[4],_=s[8],w=s[12],P=s[1],I=s[5],A=s[9],U=s[13],L=s[2],k=s[6],W=s[10],z=s[14],Q=s[3],N=s[7],V=s[11],Y=s[15];return r[0]=o*S+a*P+l*L+c*Q,r[4]=o*R+a*I+l*k+c*N,r[8]=o*_+a*A+l*W+c*V,r[12]=o*w+a*U+l*z+c*Y,r[1]=h*S+u*P+d*L+f*Q,r[5]=h*R+u*I+d*k+f*N,r[9]=h*_+u*A+d*W+f*V,r[13]=h*w+u*U+d*z+f*Y,r[2]=g*S+x*P+m*L+p*Q,r[6]=g*R+x*I+m*k+p*N,r[10]=g*_+x*A+m*W+p*V,r[14]=g*w+x*U+m*z+p*Y,r[3]=b*S+M*P+y*L+T*Q,r[7]=b*R+M*I+y*k+T*N,r[11]=b*_+M*A+y*W+T*V,r[15]=b*w+M*U+y*z+T*Y,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[4],s=t[8],r=t[12],o=t[1],a=t[5],l=t[9],c=t[13],h=t[2],u=t[6],d=t[10],f=t[14],g=t[3],x=t[7],m=t[11],p=t[15],b=l*f-c*d,M=a*f-c*u,y=a*d-l*u,T=o*f-c*h,S=o*d-l*h,R=o*u-a*h;return e*(x*b-m*M+p*y)-n*(g*b-m*T+p*S)+s*(g*M-x*T+p*R)-r*(g*y-x*S+m*R)}determinantAffine(){let t=this.elements,e=t[0],n=t[4],s=t[8],r=t[1],o=t[5],a=t[9],l=t[2],c=t[6],h=t[10];return e*(o*h-a*c)-n*(r*h-a*l)+s*(r*c-o*l)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){let s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=n),this}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8],u=t[9],d=t[10],f=t[11],g=t[12],x=t[13],m=t[14],p=t[15],b=e*a-n*o,M=e*l-s*o,y=e*c-r*o,T=n*l-s*a,S=n*c-r*a,R=s*c-r*l,_=h*x-u*g,w=h*m-d*g,P=h*p-f*g,I=u*m-d*x,A=u*p-f*x,U=d*p-f*m,L=b*U-M*A+y*I+T*P-S*w+R*_;if(L===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let k=1/L;return t[0]=(a*U-l*A+c*I)*k,t[1]=(s*A-n*U-r*I)*k,t[2]=(x*R-m*S+p*T)*k,t[3]=(d*S-u*R-f*T)*k,t[4]=(l*P-o*U-c*w)*k,t[5]=(e*U-s*P+r*w)*k,t[6]=(m*y-g*R-p*M)*k,t[7]=(h*R-d*y+f*M)*k,t[8]=(o*A-a*P+c*_)*k,t[9]=(n*P-e*A-r*_)*k,t[10]=(g*S-x*y+p*b)*k,t[11]=(u*y-h*S-f*b)*k,t[12]=(a*w-o*I-l*_)*k,t[13]=(e*I-n*w+s*_)*k,t[14]=(x*M-g*T-m*b)*k,t[15]=(h*T-u*M+d*b)*k,this}scale(t){let e=this.elements,n=t.x,s=t.y,r=t.z;return e[0]*=n,e[4]*=s,e[8]*=r,e[1]*=n,e[5]*=s,e[9]*=r,e[2]*=n,e[6]*=s,e[10]*=r,e[3]*=n,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,s))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let n=Math.cos(e),s=Math.sin(e),r=1-n,o=t.x,a=t.y,l=t.z,c=r*o,h=r*a;return this.set(c*o+n,c*a-s*l,c*l+s*a,0,c*a+s*l,h*a+n,h*l-s*o,0,c*l-s*a,h*l+s*o,r*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,s,r,o){return this.set(1,n,r,0,t,1,o,0,e,s,1,0,0,0,0,1),this}compose(t,e,n){let s=this.elements,r=e._x,o=e._y,a=e._z,l=e._w,c=r+r,h=o+o,u=a+a,d=r*c,f=r*h,g=r*u,x=o*h,m=o*u,p=a*u,b=l*c,M=l*h,y=l*u,T=n.x,S=n.y,R=n.z;return s[0]=(1-(x+p))*T,s[1]=(f+y)*T,s[2]=(g-M)*T,s[3]=0,s[4]=(f-y)*S,s[5]=(1-(d+p))*S,s[6]=(m+b)*S,s[7]=0,s[8]=(g+M)*R,s[9]=(m-b)*R,s[10]=(1-(d+x))*R,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,n){let s=this.elements;t.x=s[12],t.y=s[13],t.z=s[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),e.identity(),this;let o=ss.set(s[0],s[1],s[2]).length(),a=ss.set(s[4],s[5],s[6]).length(),l=ss.set(s[8],s[9],s[10]).length();r<0&&(o=-o),An.copy(this);let c=1/o,h=1/a,u=1/l;return An.elements[0]*=c,An.elements[1]*=c,An.elements[2]*=c,An.elements[4]*=h,An.elements[5]*=h,An.elements[6]*=h,An.elements[8]*=u,An.elements[9]*=u,An.elements[10]*=u,e.setFromRotationMatrix(An),n.x=o,n.y=a,n.z=l,this}makePerspective(t,e,n,s,r,o,a=Pn,l=!1){let c=this.elements,h=2*r/(e-t),u=2*r/(n-s),d=(e+t)/(e-t),f=(n+s)/(n-s),g,x;if(l)g=r/(o-r),x=o*r/(o-r);else if(a===Pn)g=-(o+r)/(o-r),x=-2*o*r/(o-r);else if(a===bs)g=-o/(o-r),x=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=h,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=x,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,e,n,s,r,o,a=Pn,l=!1){let c=this.elements,h=2/(e-t),u=2/(n-s),d=-(e+t)/(e-t),f=-(n+s)/(n-s),g,x;if(l)g=1/(o-r),x=o/(o-r);else if(a===Pn)g=-2/(o-r),x=-(o+r)/(o-r);else if(a===bs)g=-1/(o-r),x=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=h,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=g,c[14]=x,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<16;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}};fa.prototype.isMatrix4=!0;var xe=fa,ss=new D,An=new xe,ff=new D(0,0,0),pf=new D(1,1,1),ui=new D,ao=new D,ln=new D,bh=new xe,Sh=new dn,Hn=class i{constructor(t=0,e=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,s=this._order){return this._x=t,this._y=e,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){let s=t.elements,r=s[0],o=s[4],a=s[8],l=s[1],c=s[5],h=s[9],u=s[2],d=s[6],f=s[10];switch(e){case"XYZ":this._y=Math.asin(se(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-se(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(se(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-se(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(se(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-se(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,f),this._y=0);break;default:Jt("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return bh.makeRotationFromQuaternion(t),this.setFromRotationMatrix(bh,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Sh.setFromEuler(this),this.setFromQuaternion(Sh,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Hn.DEFAULT_ORDER="XYZ";var pr=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},mf=0,Mh=new D,rs=new dn,Kn=new xe,lo=new D,js=new D,gf=new D,_f=new dn,Eh=new D(1,0,0),Th=new D(0,1,0),wh=new D(0,0,1),Ah={type:"added"},xf={type:"removed"},os={type:"childadded",child:null},Al={type:"childremoved",child:null},De=class i extends In{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:mf++}),this.uuid=Ji(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let t=new D,e=new Hn,n=new dn,s=new D(1,1,1);function r(){n.setFromEuler(e,!1)}function o(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new xe},normalMatrix:{value:new ne}}),this.matrix=new xe,this.matrixWorld=new xe,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new pr,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return rs.setFromAxisAngle(t,e),this.quaternion.multiply(rs),this}rotateOnWorldAxis(t,e){return rs.setFromAxisAngle(t,e),this.quaternion.premultiply(rs),this}rotateX(t){return this.rotateOnAxis(Eh,t)}rotateY(t){return this.rotateOnAxis(Th,t)}rotateZ(t){return this.rotateOnAxis(wh,t)}translateOnAxis(t,e){return Mh.copy(t).applyQuaternion(this.quaternion),this.position.add(Mh.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Eh,t)}translateY(t){return this.translateOnAxis(Th,t)}translateZ(t){return this.translateOnAxis(wh,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Kn.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?lo.copy(t):lo.set(t,e,n);let s=this.parent;this.updateWorldMatrix(!0,!1),js.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Kn.lookAt(js,lo,this.up):Kn.lookAt(lo,js,this.up),this.quaternion.setFromRotationMatrix(Kn),s&&(Kn.extractRotation(s.matrixWorld),rs.setFromRotationMatrix(Kn),this.quaternion.premultiply(rs.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(Qt("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Ah),os.child=t,this.dispatchEvent(os),os.child=null):Qt("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(xf),Al.child=t,this.dispatchEvent(Al),Al.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Kn.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Kn.multiply(t.parent.matrixWorld)),t.applyMatrix4(Kn),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Ah),os.child=t,this.dispatchEvent(os),os.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,s=this.children.length;n<s;n++){let o=this.children[n].getObjectByProperty(t,e);if(o!==void 0)return o}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(js,t,gf),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(js,_f,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(t){t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let e=t.x,n=t.y,s=t.z,r=this.matrix.elements;r[12]+=e-r[0]*e-r[4]*n-r[8]*s,r[13]+=n-r[1]*e-r[5]*n-r[9]*s,r[14]+=s-r[2]*e-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e,n=!1){let s=this.parent;if(t===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),e===!0){let r=this.children;for(let o=0,a=r.length;o<a;o++)r[o].updateWorldMatrix(!1,!0,n)}}toJSON(t){let e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(a=>({...a})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(t),s.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let u=l[c];r(t.shapes,u)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(t.materials,this.material[l]));s.material=a}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];s.animations.push(r(t.animations,l))}}if(e){let a=o(t.geometries),l=o(t.materials),c=o(t.textures),h=o(t.images),u=o(t.shapes),d=o(t.skeletons),f=o(t.animations),g=o(t.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),d.length>0&&(n.skeletons=d),f.length>0&&(n.animations=f),g.length>0&&(n.nodes=g)}return n.object=s,n;function o(a){let l=[];for(let c in a){let h=a[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){let s=t.children[n];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};De.DEFAULT_UP=new D(0,1,0);De.DEFAULT_MATRIX_AUTO_UPDATE=!0;De.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var We=class extends De{constructor(){super(),this.isGroup=!0,this.type="Group"}},yf={type:"move"},Es=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new We,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new We,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new D,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new D),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new We,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new D,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new D,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let s=null,r=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){o=!0;for(let x of t.hand.values()){let m=e.getJointPose(x,n),p=this._getHandJoint(c,x);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}let h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],d=h.position.distanceTo(u.position),f=.02,g=.005;c.inputState.pinching&&d>f+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&d<=f-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:t,target:this})));a!==null&&(s=e.getPose(t.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(yf)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let n=new We;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}},Cu={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},di={h:0,s:0,l:0},co={h:0,s:0,l:0};function Rl(i,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?i+(t-i)*6*e:e<1/2?t:e<2/3?i+(t-i)*6*(2/3-e):i}var $t=class{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){let s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=Ge){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,le.colorSpaceToWorking(this,e),this}setRGB(t,e,n,s=le.workingColorSpace){return this.r=t,this.g=e,this.b=n,le.colorSpaceToWorking(this,s),this}setHSL(t,e,n,s=le.workingColorSpace){if(t=Ac(t,1),e=se(e,0,1),n=se(n,0,1),e===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+e):n+e-n*e,o=2*n-r;this.r=Rl(o,r,t+1/3),this.g=Rl(o,r,t),this.b=Rl(o,r,t-1/3)}return le.colorSpaceToWorking(this,s),this}setStyle(t,e=Ge){function n(r){r!==void 0&&parseFloat(r)<1&&Jt("Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r,o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:Jt("Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){let r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(o===6)return this.setHex(parseInt(r,16),e);Jt("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=Ge){let n=Cu[t.toLowerCase()];return n!==void 0?this.setHex(n,e):Jt("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=ni(t.r),this.g=ni(t.g),this.b=ni(t.b),this}copyLinearToSRGB(t){return this.r=xs(t.r),this.g=xs(t.g),this.b=xs(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=Ge){return le.workingToColorSpace(Je.copy(this),t),Math.round(se(Je.r*255,0,255))*65536+Math.round(se(Je.g*255,0,255))*256+Math.round(se(Je.b*255,0,255))}getHexString(t=Ge){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=le.workingColorSpace){le.workingToColorSpace(Je.copy(this),e);let n=Je.r,s=Je.g,r=Je.b,o=Math.max(n,s,r),a=Math.min(n,s,r),l,c,h=(a+o)/2;if(a===o)l=0,c=0;else{let u=o-a;switch(c=h<=.5?u/(o+a):u/(2-o-a),o){case n:l=(s-r)/u+(s<r?6:0);break;case s:l=(r-n)/u+2;break;case r:l=(n-s)/u+4;break}l/=6}return t.h=l,t.s=c,t.l=h,t}getRGB(t,e=le.workingColorSpace){return le.workingToColorSpace(Je.copy(this),e),t.r=Je.r,t.g=Je.g,t.b=Je.b,t}getStyle(t=Ge){le.workingToColorSpace(Je.copy(this),t);let e=Je.r,n=Je.g,s=Je.b;return t!==Ge?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(t,e,n){return this.getHSL(di),this.setHSL(di.h+t,di.s+e,di.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(di),t.getHSL(co);let n=or(di.h,co.h,e),s=or(di.s,co.s,e),r=or(di.l,co.l,e);return this.setHSL(n,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,n=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*s,this.g=r[1]*e+r[4]*n+r[7]*s,this.b=r[2]*e+r[5]*n+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Je=new $t;$t.NAMES=Cu;var Ts=class i{constructor(t,e=1,n=1e3){this.isFog=!0,this.name="",this.color=new $t(t),this.near=e,this.far=n}clone(){return new i(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},Wi=class extends De{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Hn,this.environmentIntensity=1,this.environmentRotation=new Hn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__!="undefined"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),e.object.backgroundBlurriness=this.backgroundBlurriness,e.object.backgroundIntensity=this.backgroundIntensity,e.object.backgroundRotation=this.backgroundRotation.toArray(),e.object.environmentIntensity=this.environmentIntensity,e.object.environmentRotation=this.environmentRotation.toArray(),e}},Rn=new D,jn=new D,Cl=new D,Qn=new D,as=new D,ls=new D,Rh=new D,Pl=new D,Il=new D,Ll=new D,Dl=new Ee,Nl=new Ee,Ul=new Ee,gi=class i{constructor(t=new D,e=new D,n=new D){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,s){s.subVectors(n,e),Rn.subVectors(t,e),s.cross(Rn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,n,s,r){Rn.subVectors(s,e),jn.subVectors(n,e),Cl.subVectors(t,e);let o=Rn.dot(Rn),a=Rn.dot(jn),l=Rn.dot(Cl),c=jn.dot(jn),h=jn.dot(Cl),u=o*c-a*a;if(u===0)return r.set(0,0,0),null;let d=1/u,f=(c*l-a*h)*d,g=(o*h-a*l)*d;return r.set(1-f-g,g,f)}static containsPoint(t,e,n,s){return this.getBarycoord(t,e,n,s,Qn)===null?!1:Qn.x>=0&&Qn.y>=0&&Qn.x+Qn.y<=1}static getInterpolation(t,e,n,s,r,o,a,l){return this.getBarycoord(t,e,n,s,Qn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Qn.x),l.addScaledVector(o,Qn.y),l.addScaledVector(a,Qn.z),l)}static getInterpolatedAttribute(t,e,n,s,r,o){return Dl.setScalar(0),Nl.setScalar(0),Ul.setScalar(0),Dl.fromBufferAttribute(t,e),Nl.fromBufferAttribute(t,n),Ul.fromBufferAttribute(t,s),o.setScalar(0),o.addScaledVector(Dl,r.x),o.addScaledVector(Nl,r.y),o.addScaledVector(Ul,r.z),o}static isFrontFacing(t,e,n,s){return Rn.subVectors(n,e),jn.subVectors(t,e),Rn.cross(jn).dot(s)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,s){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,n,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return Rn.subVectors(this.c,this.b),jn.subVectors(this.a,this.b),Rn.cross(jn).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return i.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return i.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,s,r){return i.getInterpolation(t,this.a,this.b,this.c,e,n,s,r)}containsPoint(t){return i.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return i.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let n=this.a,s=this.b,r=this.c,o,a;as.subVectors(s,n),ls.subVectors(r,n),Pl.subVectors(t,n);let l=as.dot(Pl),c=ls.dot(Pl);if(l<=0&&c<=0)return e.copy(n);Il.subVectors(t,s);let h=as.dot(Il),u=ls.dot(Il);if(h>=0&&u<=h)return e.copy(s);let d=l*u-h*c;if(d<=0&&l>=0&&h<=0)return o=l/(l-h),e.copy(n).addScaledVector(as,o);Ll.subVectors(t,r);let f=as.dot(Ll),g=ls.dot(Ll);if(g>=0&&f<=g)return e.copy(r);let x=f*c-l*g;if(x<=0&&c>=0&&g<=0)return a=c/(c-g),e.copy(n).addScaledVector(ls,a);let m=h*g-f*u;if(m<=0&&u-h>=0&&f-g>=0)return Rh.subVectors(r,s),a=(u-h)/(u-h+(f-g)),e.copy(s).addScaledVector(Rh,a);let p=1/(m+x+d);return o=x*p,a=d*p,e.copy(n).addScaledVector(as,o).addScaledVector(ls,a)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},Vn=class{constructor(t=new D(1/0,1/0,1/0),e=new D(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(Cn.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(Cn.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let n=Cn.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let n=t.geometry;if(n!==void 0){let r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)t.isMesh===!0?t.getVertexPosition(o,Cn):Cn.fromBufferAttribute(r,o),Cn.applyMatrix4(t.matrixWorld),this.expandByPoint(Cn);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),ho.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),ho.copy(n.boundingBox)),ho.applyMatrix4(t.matrixWorld),this.union(ho)}let s=t.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,Cn),Cn.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Qs),uo.subVectors(this.max,Qs),cs.subVectors(t.a,Qs),hs.subVectors(t.b,Qs),us.subVectors(t.c,Qs),fi.subVectors(hs,cs),pi.subVectors(us,hs),Oi.subVectors(cs,us);let e=[0,-fi.z,fi.y,0,-pi.z,pi.y,0,-Oi.z,Oi.y,fi.z,0,-fi.x,pi.z,0,-pi.x,Oi.z,0,-Oi.x,-fi.y,fi.x,0,-pi.y,pi.x,0,-Oi.y,Oi.x,0];return!Fl(e,cs,hs,us,uo)||(e=[1,0,0,0,1,0,0,0,1],!Fl(e,cs,hs,us,uo))?!1:(fo.crossVectors(fi,pi),e=[fo.x,fo.y,fo.z],Fl(e,cs,hs,us,uo))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,Cn).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(Cn).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(ti[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),ti[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),ti[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),ti[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),ti[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),ti[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),ti[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),ti[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(ti),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}},ti=[new D,new D,new D,new D,new D,new D,new D,new D],Cn=new D,ho=new Vn,cs=new D,hs=new D,us=new D,fi=new D,pi=new D,Oi=new D,Qs=new D,uo=new D,fo=new D,Bi=new D;function Fl(i,t,e,n,s){for(let r=0,o=i.length-3;r<=o;r+=3){Bi.fromArray(i,r);let a=s.x*Math.abs(Bi.x)+s.y*Math.abs(Bi.y)+s.z*Math.abs(Bi.z),l=t.dot(Bi),c=e.dot(Bi),h=n.dot(Bi);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>a)return!1}return!0}var Le=new D,po=new ct,vf=0,un=class extends In{constructor(t,e,n=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:vf++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=Eu,this.updateRanges=[],this.gpuType=Sn,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[n+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)po.fromBufferAttribute(this,e),po.applyMatrix3(t),this.setXY(e,po.x,po.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)Le.fromBufferAttribute(this,e),Le.applyMatrix3(t),this.setXYZ(e,Le.x,Le.y,Le.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)Le.fromBufferAttribute(this,e),Le.applyMatrix4(t),this.setXYZ(e,Le.x,Le.y,Le.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)Le.fromBufferAttribute(this,e),Le.applyNormalMatrix(t),this.setXYZ(e,Le.x,Le.y,Le.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)Le.fromBufferAttribute(this,e),Le.transformDirection(t),this.setXYZ(e,Le.x,Le.y,Le.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=_s(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=tn(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=_s(e,this.array)),e}setX(t,e){return this.normalized&&(e=tn(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=_s(e,this.array)),e}setY(t,e){return this.normalized&&(e=tn(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=_s(e,this.array)),e}setZ(t,e){return this.normalized&&(e=tn(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=_s(e,this.array)),e}setW(t,e){return this.normalized&&(e=tn(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=tn(e,this.array),n=tn(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,s){return t*=this.itemSize,this.normalized&&(e=tn(e,this.array),n=tn(n,this.array),s=tn(s,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t*=this.itemSize,this.normalized&&(e=tn(e,this.array),n=tn(n,this.array),s=tn(s,this.array),r=tn(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return t.name=this.name,t.usage=this.usage,t.gpuType=this.gpuType,t}dispose(){this.dispatchEvent({type:"dispose"})}};var mr=class extends un{constructor(t,e,n){super(new Uint16Array(t),e,n)}};var gr=class extends un{constructor(t,e,n){super(new Uint32Array(t),e,n)}};var he=class extends un{constructor(t,e,n){super(new Float32Array(t),e,n)}},bf=new Vn,tr=new D,Ol=new D,_i=class{constructor(t=new D,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let n=this.center;e!==void 0?n.copy(e):bf.setFromPoints(t).getCenter(n);let s=0;for(let r=0,o=t.length;r<o;r++)s=Math.max(s,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;tr.subVectors(t,this.center);let e=tr.lengthSq();if(e>this.radius*this.radius){let n=Math.sqrt(e),s=(n-this.radius)*.5;this.center.addScaledVector(tr,s/n),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Ol.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(tr.copy(t.center).add(Ol)),this.expandByPoint(tr.copy(t.center).sub(Ol))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}},Sf=0,vn=new xe,Bl=new De,ds=new D,cn=new Vn,er=new Vn,ze=new D,Ne=class i extends In{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Sf++}),this.uuid=Ji(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(Xd(t)?gr:mr)(t,1):this.index=t,this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new ne().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return vn.makeRotationFromQuaternion(t),this.applyMatrix4(vn),this}rotateX(t){return vn.makeRotationX(t),this.applyMatrix4(vn),this}rotateY(t){return vn.makeRotationY(t),this.applyMatrix4(vn),this}rotateZ(t){return vn.makeRotationZ(t),this.applyMatrix4(vn),this}translate(t,e,n){return vn.makeTranslation(t,e,n),this.applyMatrix4(vn),this}scale(t,e,n){return vn.makeScale(t,e,n),this.applyMatrix4(vn),this}lookAt(t){return Bl.lookAt(t),Bl.updateMatrix(),this.applyMatrix4(Bl.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(ds).negate(),this.translate(ds.x,ds.y,ds.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let n=[];for(let s=0,r=t.length;s<r;s++){let o=t[s];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new he(n,3))}else{let n=Math.min(t.length,e.count);for(let s=0;s<n;s++){let r=t[s];e.setXYZ(s,r.x,r.y,r.z||0)}t.length>e.count&&Jt("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Vn);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Qt("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new D(-1/0,-1/0,-1/0),new D(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,s=e.length;n<s;n++){let r=e[n];cn.setFromBufferAttribute(r),this.morphTargetsRelative?(ze.addVectors(this.boundingBox.min,cn.min),this.boundingBox.expandByPoint(ze),ze.addVectors(this.boundingBox.max,cn.max),this.boundingBox.expandByPoint(ze)):(this.boundingBox.expandByPoint(cn.min),this.boundingBox.expandByPoint(cn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Qt('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new _i);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Qt("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new D,1/0);return}if(t){let n=this.boundingSphere.center;if(cn.setFromBufferAttribute(t),e)for(let r=0,o=e.length;r<o;r++){let a=e[r];er.setFromBufferAttribute(a),this.morphTargetsRelative?(ze.addVectors(cn.min,er.min),cn.expandByPoint(ze),ze.addVectors(cn.max,er.max),cn.expandByPoint(ze)):(cn.expandByPoint(er.min),cn.expandByPoint(er.max))}cn.getCenter(n);let s=0;for(let r=0,o=t.count;r<o;r++)ze.fromBufferAttribute(t,r),s=Math.max(s,n.distanceToSquared(ze));if(e)for(let r=0,o=e.length;r<o;r++){let a=e[r],l=this.morphTargetsRelative;for(let c=0,h=a.count;c<h;c++)ze.fromBufferAttribute(a,c),l&&(ds.fromBufferAttribute(t,c),ze.add(ds)),s=Math.max(s,n.distanceToSquared(ze))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Qt('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){Qt("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=e.position,s=e.normal,r=e.uv,o=this.getAttribute("tangent");(o===void 0||o.count!==n.count)&&(o=new un(new Float32Array(4*n.count),4),this.setAttribute("tangent",o));let a=[],l=[];for(let _=0;_<n.count;_++)a[_]=new D,l[_]=new D;let c=new D,h=new D,u=new D,d=new ct,f=new ct,g=new ct,x=new D,m=new D;function p(_,w,P){c.fromBufferAttribute(n,_),h.fromBufferAttribute(n,w),u.fromBufferAttribute(n,P),d.fromBufferAttribute(r,_),f.fromBufferAttribute(r,w),g.fromBufferAttribute(r,P),h.sub(c),u.sub(c),f.sub(d),g.sub(d);let I=1/(f.x*g.y-g.x*f.y);isFinite(I)&&(x.copy(h).multiplyScalar(g.y).addScaledVector(u,-f.y).multiplyScalar(I),m.copy(u).multiplyScalar(f.x).addScaledVector(h,-g.x).multiplyScalar(I),a[_].add(x),a[w].add(x),a[P].add(x),l[_].add(m),l[w].add(m),l[P].add(m))}let b=this.groups;b.length===0&&(b=[{start:0,count:t.count}]);for(let _=0,w=b.length;_<w;++_){let P=b[_],I=P.start,A=P.count;for(let U=I,L=I+A;U<L;U+=3)p(t.getX(U+0),t.getX(U+1),t.getX(U+2))}let M=new D,y=new D,T=new D,S=new D;function R(_){T.fromBufferAttribute(s,_),S.copy(T);let w=a[_];M.copy(w),M.sub(T.multiplyScalar(T.dot(w))).normalize(),y.crossVectors(S,w);let I=y.dot(l[_])<0?-1:1;o.setXYZW(_,M.x,M.y,M.z,I)}for(let _=0,w=b.length;_<w;++_){let P=b[_],I=P.start,A=P.count;for(let U=I,L=I+A;U<L;U+=3)R(t.getX(U+0)),R(t.getX(U+1)),R(t.getX(U+2))}this._transformed=!0}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==e.count)n=new un(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let d=0,f=n.count;d<f;d++)n.setXYZ(d,0,0,0);let s=new D,r=new D,o=new D,a=new D,l=new D,c=new D,h=new D,u=new D;if(t)for(let d=0,f=t.count;d<f;d+=3){let g=t.getX(d+0),x=t.getX(d+1),m=t.getX(d+2);s.fromBufferAttribute(e,g),r.fromBufferAttribute(e,x),o.fromBufferAttribute(e,m),h.subVectors(o,r),u.subVectors(s,r),h.cross(u),a.fromBufferAttribute(n,g),l.fromBufferAttribute(n,x),c.fromBufferAttribute(n,m),a.add(h),l.add(h),c.add(h),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(x,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let d=0,f=e.count;d<f;d+=3)s.fromBufferAttribute(e,d+0),r.fromBufferAttribute(e,d+1),o.fromBufferAttribute(e,d+2),h.subVectors(o,r),u.subVectors(s,r),h.cross(u),n.setXYZ(d+0,h.x,h.y,h.z),n.setXYZ(d+1,h.x,h.y,h.z),n.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)ze.fromBufferAttribute(t,e),ze.normalize(),t.setXYZ(e,ze.x,ze.y,ze.z)}toNonIndexed(){function t(a,l){let c=a.array,h=a.itemSize,u=a.normalized,d=new c.constructor(l.length*h),f=0,g=0;for(let x=0,m=l.length;x<m;x++){a.isInterleavedBufferAttribute?f=l[x]*a.data.stride+a.offset:f=l[x]*h;for(let p=0;p<h;p++)d[g++]=c[f++]}return new un(d,h,u)}if(this.index===null)return Jt("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new i,n=this.index.array,s=this.attributes;for(let a in s){let l=s[a],c=t(l,n);e.setAttribute(a,c)}let r=this.morphAttributes;for(let a in r){let l=[],c=r[a];for(let h=0,u=c.length;h<u;h++){let d=c[h],f=t(d,n);l.push(f)}e.morphAttributes[a]=l}e.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let n=this.attributes;for(let l in n){let c=n[l];t.data.attributes[l]=c.toJSON(t.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let u=0,d=c.length;u<d;u++){let f=c[u];h.push(f.toJSON(t.data))}h.length>0&&(s[l]=h,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(t.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(t.data.boundingSphere=a.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let n=t.index;n!==null&&this.setIndex(n.clone());let s=t.attributes;for(let c in s){let h=s[c];this.setAttribute(c,h.clone(e))}let r=t.morphAttributes;for(let c in r){let h=[],u=r[c];for(let d=0,f=u.length;d<f;d++)h.push(u[d].clone(e));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;let o=t.groups;for(let c=0,h=o.length;c<h;c++){let u=o[c];this.addGroup(u.start,u.count,u.materialIndex)}let a=t.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var kl=new D,Mf=new D,Ef=new ne,hn=class{constructor(t=new D(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,s){return this.normal.set(t,e,n),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){let s=kl.subVectors(n,e).cross(Mf.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e,n=!0){let s=t.delta(kl),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let o=-(t.start.dot(this.normal)+this.constant)/r;return n===!0&&(o<0||o>1)?null:e.copy(t.start).addScaledVector(s,o)}intersectsLine(t){let e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let n=e||Ef.getNormalMatrix(t),s=this.coplanarPoint(kl).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(t){return this.normal.fromArray(t.normal),this.constant=t.constant,this}},Tf=0,ii=class extends In{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Tf++}),this.uuid=Ji(),this.name="",this.type="Material",this.blending=Fs,this.side=wi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=hc,this.blendDst=uc,this.blendEquation=Yi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new $t(0,0,0),this.blendAlpha=0,this.depthFunc=ys,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=_u,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Io,this.stencilZFail=Io,this.stencilZPass=Io,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let n=t[e];if(n===void 0){Jt(`Material: parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){Jt(`Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let o=[];for(let a in r){let l=r[a];delete l.metadata,o.push(l)}return o}if(e){let r=s(t.textures),o=s(t.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}fromJSON(t,e){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new $t().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.retroreflectivity!==void 0&&(this.retroreflectivity=t.retroreflectivity),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=t.iridescenceThicknessRange),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.clippingPlanes!==void 0&&(this.clippingPlanes=t.clippingPlanes.map(n=>new hn().fromJSON(n))),t.clipIntersection!==void 0&&(this.clipIntersection=t.clipIntersection),t.clipShadows!==void 0&&(this.clipShadows=t.clipShadows),t.depthPacking!==void 0&&(this.depthPacking=t.depthPacking),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.linecap!==void 0&&(this.linecap=t.linecap),t.linejoin!==void 0&&(this.linejoin=t.linejoin),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=e[t.map]||null),t.matcap!==void 0&&(this.matcap=e[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=e[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=e[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=e[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let n=t.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new ct().fromArray(n)}return t.displacementMap!==void 0&&(this.displacementMap=e[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=e[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=e[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=e[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=e[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=e[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=e[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=e[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=e[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=e[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=e[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=e[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=e[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=e[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new ct().fromArray(t.clearcoatNormalScale)),t.iridescenceMap!==void 0&&(this.iridescenceMap=e[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=e[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=e[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=e[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=e[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=e[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=e[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,n=null;if(e!==null){let s=e.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}};var ei=new D,zl=new D,mo=new D,go=new D,ws=class{constructor(t=new D,e=new D(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,ei)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=ei.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(ei.copy(this.origin).addScaledVector(this.direction,e),ei.distanceToSquared(t))}distanceSqToSegment(t,e,n,s){zl.copy(t).add(e).multiplyScalar(.5),mo.copy(e).sub(t).normalize(),go.copy(this.origin).sub(zl);let r=t.distanceTo(e)*.5,o=-this.direction.dot(mo),a=go.dot(this.direction),l=-go.dot(mo),c=go.lengthSq(),h=Math.abs(1-o*o),u,d,f,g;if(h>0)if(u=o*l-a,d=o*a-l,g=r*h,u>=0)if(d>=-g)if(d<=g){let x=1/h;u*=x,d*=x,f=u*(u+o*d+2*a)+d*(o*u+d+2*l)+c}else d=r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;else d=-r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;else d<=-g?(u=Math.max(0,-(-o*r+a)),d=u>0?-r:Math.min(Math.max(-r,-l),r),f=-u*u+d*(d+2*l)+c):d<=g?(u=0,d=Math.min(Math.max(-r,-l),r),f=d*(d+2*l)+c):(u=Math.max(0,-(o*r+a)),d=u>0?r:Math.min(Math.max(-r,-l),r),f=-u*u+d*(d+2*l)+c);else d=o>0?-r:r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(zl).addScaledVector(mo,d),f}intersectSphere(t,e){if(t.radius<0)return null;ei.subVectors(t.center,this.origin);let n=ei.dot(this.direction),s=ei.dot(ei)-n*n,r=t.radius*t.radius;if(s>r)return null;let o=Math.sqrt(r-s),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,e):this.at(a,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){let n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,s,r,o,a,l,c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(t.min.x-d.x)*c,s=(t.max.x-d.x)*c):(n=(t.max.x-d.x)*c,s=(t.min.x-d.x)*c),h>=0?(r=(t.min.y-d.y)*h,o=(t.max.y-d.y)*h):(r=(t.max.y-d.y)*h,o=(t.min.y-d.y)*h),n>o||r>s||((r>n||isNaN(n))&&(n=r),(o<s||isNaN(s))&&(s=o),u>=0?(a=(t.min.z-d.z)*u,l=(t.max.z-d.z)*u):(a=(t.max.z-d.z)*u,l=(t.min.z-d.z)*u),n>l||a>s)||((a>n||n!==n)&&(n=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,e)}intersectsBox(t){return this.intersectBox(t,ei)!==null}intersectTriangle(t,e,n,s,r){let o=this.origin,a=this.direction,l=a.x,c=a.y,h=a.z,u=t.x-o.x,d=t.y-o.y,f=t.z-o.z,g=e.x-o.x,x=e.y-o.y,m=e.z-o.z,p=n.x-o.x,b=n.y-o.y,M=n.z-o.z,y=Math.abs(l),T=Math.abs(c),S=Math.abs(h),R,_,w,P,I,A,U,L,k,W,z,Q;if(y>=T&&y>=S?(w=l,A=u,k=g,Q=p,l>=0?(R=c,_=h,P=d,I=f,U=x,L=m,W=b,z=M):(R=h,_=c,P=f,I=d,U=m,L=x,W=M,z=b)):T>=S?(w=c,A=d,k=x,Q=b,c>=0?(R=h,_=l,P=f,I=u,U=m,L=g,W=M,z=p):(R=l,_=h,P=u,I=f,U=g,L=m,W=p,z=M)):(w=h,A=f,k=m,Q=M,h>=0?(R=l,_=c,P=u,I=d,U=g,L=x,W=p,z=b):(R=c,_=l,P=d,I=u,U=x,L=g,W=b,z=p)),w===0)return null;let N=R/w,V=_/w,Y=1/w,yt=P-N*A,_t=I-V*A,te=U-N*k,qt=L-V*k,Kt=W-N*Q,et=z-V*Q,st=Kt*qt-et*te,St=yt*et-_t*Kt,wt=te*_t-qt*yt;if(s){if(st<0||St<0||wt<0)return null}else if((st<0||St<0||wt<0)&&(st>0||St>0||wt>0))return null;let Mt=st+St+wt;if(Mt===0)return null;let Dt=Y*(st*A+St*k+wt*Q);return(Mt>0?Dt<0:Dt>0)?null:this.at(Dt/Mt,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},si=class extends ii{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new $t(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Hn,this.combine=ma,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}},Ch=new xe,ki=new ws,_o=new _i,Ph=new D,xo=new D,yo=new D,vo=new D,Hl=new D,bo=new D,Ih=new D,So=new D,Lt=class extends De{constructor(t=new Ne,e=new si){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(t,e){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;e.fromBufferAttribute(s,t);let a=this.morphTargetInfluences;if(r&&a){bo.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let h=a[l],u=r[l];h!==0&&(Hl.fromBufferAttribute(u,t),o?bo.addScaledVector(Hl,h):bo.addScaledVector(Hl.sub(e),h))}e.add(bo)}return e}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),_o.copy(n.boundingSphere),_o.applyMatrix4(r),ki.copy(t.ray).recast(t.near),!(_o.containsPoint(ki.origin)===!1&&(ki.intersectSphere(_o,Ph)===null||ki.origin.distanceToSquared(Ph)>(t.far-t.near)**2))&&(Ch.copy(r).invert(),ki.copy(t.ray).applyMatrix4(Ch),!(n.boundingBox!==null&&ki.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,ki)))}_computeIntersections(t,e,n){let s,r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,d=r.groups,f=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,x=d.length;g<x;g++){let m=d[g],p=o[m.materialIndex],b=Math.max(m.start,f.start),M=Math.min(a.count,Math.min(m.start+m.count,f.start+f.count));for(let y=b,T=M;y<T;y+=3){let S=a.getX(y),R=a.getX(y+1),_=a.getX(y+2);s=Mo(this,p,t,n,c,h,u,S,R,_),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{let g=Math.max(0,f.start),x=Math.min(a.count,f.start+f.count);for(let m=g,p=x;m<p;m+=3){let b=a.getX(m),M=a.getX(m+1),y=a.getX(m+2);s=Mo(this,o,t,n,c,h,u,b,M,y),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,x=d.length;g<x;g++){let m=d[g],p=o[m.materialIndex],b=Math.max(m.start,f.start),M=Math.min(l.count,Math.min(m.start+m.count,f.start+f.count));for(let y=b,T=M;y<T;y+=3){let S=y,R=y+1,_=y+2;s=Mo(this,p,t,n,c,h,u,S,R,_),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{let g=Math.max(0,f.start),x=Math.min(l.count,f.start+f.count);for(let m=g,p=x;m<p;m+=3){let b=m,M=m+1,y=m+2;s=Mo(this,o,t,n,c,h,u,b,M,y),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}}};function wf(i,t,e,n,s,r,o,a){let l;if(t.side===Ue?l=n.intersectTriangle(o,r,s,!0,a):l=n.intersectTriangle(s,r,o,t.side===wi,a),l===null)return null;So.copy(a),So.applyMatrix4(i.matrixWorld);let c=e.ray.origin.distanceTo(So);return c<e.near||c>e.far?null:{distance:c,point:So.clone(),object:i}}function Mo(i,t,e,n,s,r,o,a,l,c){i.getVertexPosition(a,xo),i.getVertexPosition(l,yo),i.getVertexPosition(c,vo);let h=wf(i,t,e,n,xo,yo,vo,Ih);if(h){let u=new D;gi.getBarycoord(Ih,xo,yo,vo,u),s&&(h.uv=gi.getInterpolatedAttribute(s,a,l,c,u,new ct)),r&&(h.uv1=gi.getInterpolatedAttribute(r,a,l,c,u,new ct)),o&&(h.normal=gi.getInterpolatedAttribute(o,a,l,c,u,new D),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));let d={a,b:l,c,normal:new D,materialIndex:0};gi.getNormal(xo,yo,vo,d.normal),h.face=d,h.barycoord=u}return h}var _r=class extends en{constructor(t=null,e=1,n=1,s,r,o,a,l,c=Ve,h=Ve,u,d){super(null,o,a,l,c,h,s,r,u,d),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var xr=class extends un{constructor(t,e,n,s=1){super(t,e,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){let t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}},fs=new xe,Lh=new xe,Eo=[],Dh=new Vn,Af=new xe,nr=new Lt,ir=new _i,yr=class extends Lt{constructor(t,e,n){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new xr(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,Af)}computeBoundingBox(){let t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new Vn),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,fs),Dh.copy(t.boundingBox).applyMatrix4(fs),this.boundingBox.union(Dh)}computeBoundingSphere(){let t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new _i),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,fs),ir.copy(t.boundingSphere).applyMatrix4(fs),this.boundingSphere.union(ir)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){return this.instanceColor===null?e.setRGB(1,1,1):e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){return e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){let n=e.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,o=t*r+1;for(let a=0;a<n.length;a++)n[a]=s[o+a]}raycast(t,e){let n=this.matrixWorld,s=this.count;if(nr.geometry=this.geometry,nr.material=this.material,nr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),ir.copy(this.boundingSphere),ir.applyMatrix4(n),t.ray.intersectsSphere(ir)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,fs),Lh.multiplyMatrices(n,fs),nr.matrixWorld=Lh,nr.raycast(t,Eo);for(let o=0,a=Eo.length;o<a;o++){let l=Eo[o];l.instanceId=r,l.object=this,e.push(l)}Eo.length=0}}setColorAt(t,e){return this.instanceColor===null&&(this.instanceColor=new xr(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3),this}setMatrixAt(t,e){return e.toArray(this.instanceMatrix.array,t*16),this}setMorphAt(t,e){let n=e.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new _r(new Float32Array(s*this.count),s,this.count,ba,Sn));let r=this.morphTexture.source.data.data,o=0;for(let c=0;c<n.length;c++)o+=n[c];let a=this.geometry.morphTargetsRelative?1:1-o,l=s*t;return r[l]=a,r.set(n,l+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},zi=new _i,Rf=new ct(.5,.5),To=new D,As=class{constructor(t=new hn,e=new hn,n=new hn,s=new hn,r=new hn,o=new hn){this.planes=[t,e,n,s,r,o]}set(t,e,n,s,r,o){let a=this.planes;return a[0].copy(t),a[1].copy(e),a[2].copy(n),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(t){let e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=Pn,n=!1){let s=this.planes,r=t.elements,o=r[0],a=r[1],l=r[2],c=r[3],h=r[4],u=r[5],d=r[6],f=r[7],g=r[8],x=r[9],m=r[10],p=r[11],b=r[12],M=r[13],y=r[14],T=r[15];if(s[0].setComponents(c-o,f-h,p-g,T-b).normalize(),s[1].setComponents(c+o,f+h,p+g,T+b).normalize(),s[2].setComponents(c+a,f+u,p+x,T+M).normalize(),s[3].setComponents(c-a,f-u,p-x,T-M).normalize(),n)s[4].setComponents(l,d,m,y).normalize(),s[5].setComponents(c-l,f-d,p-m,T-y).normalize();else if(s[4].setComponents(c-l,f-d,p-m,T-y).normalize(),e===Pn)s[5].setComponents(c+l,f+d,p+m,T+y).normalize();else if(e===bs)s[5].setComponents(l,d,m,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),zi.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),zi.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(zi)}intersectsSprite(t){zi.center.set(0,0,0);let e=Rf.distanceTo(t.center);return zi.radius=.7071067811865476+e,zi.applyMatrix4(t.matrixWorld),this.intersectsSphere(zi)}intersectsSphere(t){let e=this.planes,n=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(t){let e=this.planes;for(let n=0;n<6;n++){let s=e[n];if(To.x=s.normal.x>0?t.max.x:t.min.x,To.y=s.normal.y>0?t.max.y:t.min.y,To.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(To)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var vr=class extends en{constructor(t=[],e=Ai,n,s,r,o,a,l,c,h){super(t,e,n,s,r,o,a,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},br=class extends en{constructor(t,e,n,s,r,o,a,l,c){super(t,e,n,s,r,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}};var xi=class extends en{constructor(t,e,n=Dn,s,r,o,a=Ve,l=Ve,c,h=zn,u=1){if(h!==zn&&h!==Ci)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let d={width:t,height:e,depth:u};super(d,s,r,o,a,l,h,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new Ms(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return e.compareFunction=this.compareFunction,e}},Wo=class extends xi{constructor(t,e=Dn,n=Ai,s,r,o=Ve,a=Ve,l,c=zn){let h={width:t,height:t,depth:1},u=[h,h,h,h,h,h];super(t,t,e,n,s,r,o,a,l,c),this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}},Sr=class extends en{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}},sn=class i extends Ne{constructor(t=1,e=1,n=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:s,heightSegments:r,depthSegments:o};let a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);let l=[],c=[],h=[],u=[],d=0,f=0;g("z","y","x",-1,-1,n,e,t,o,r,0),g("z","y","x",1,-1,n,e,-t,o,r,1),g("x","z","y",1,1,t,n,e,s,o,2),g("x","z","y",1,-1,t,n,-e,s,o,3),g("x","y","z",1,-1,t,e,n,s,r,4),g("x","y","z",-1,-1,t,e,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new he(c,3)),this.setAttribute("normal",new he(h,3)),this.setAttribute("uv",new he(u,2));function g(x,m,p,b,M,y,T,S,R,_,w){let P=y/R,I=T/_,A=y/2,U=T/2,L=S/2,k=R+1,W=_+1,z=0,Q=0,N=new D;for(let V=0;V<W;V++){let Y=V*I-U;for(let yt=0;yt<k;yt++){let _t=yt*P-A;N[x]=_t*b,N[m]=Y*M,N[p]=L,c.push(N.x,N.y,N.z),N[x]=0,N[m]=0,N[p]=S>0?1:-1,h.push(N.x,N.y,N.z),u.push(yt/R),u.push(1-V/_),z+=1}}for(let V=0;V<_;V++)for(let Y=0;Y<R;Y++){let yt=d+Y+k*V,_t=d+Y+k*(V+1),te=d+(Y+1)+k*(V+1),qt=d+(Y+1)+k*V;l.push(yt,_t,qt),l.push(_t,te,qt),Q+=6}a.addGroup(f,Q,w),f+=Q,d+=z}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};var ye=class i extends Ne{constructor(t=1,e=1,n=1,s=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};let c=this;s=Math.floor(s),r=Math.floor(r);let h=[],u=[],d=[],f=[],g=0,x=[],m=n/2,p=0;b(),o===!1&&(t>0&&M(!0),e>0&&M(!1)),this.setIndex(h),this.setAttribute("position",new he(u,3)),this.setAttribute("normal",new he(d,3)),this.setAttribute("uv",new he(f,2));function b(){let y=new D,T=new D,S=0,R=(e-t)/n;for(let _=0;_<=r;_++){let w=[],P=_/r,I=P*(e-t)+t;for(let A=0;A<=s;A++){let U=A/s,L=U*l+a,k=Math.sin(L),W=Math.cos(L);T.x=I*k,T.y=-P*n+m,T.z=I*W,u.push(T.x,T.y,T.z),y.set(k,R,W).normalize(),d.push(y.x,y.y,y.z),f.push(U,1-P),w.push(g++)}x.push(w)}for(let _=0;_<s;_++)for(let w=0;w<r;w++){let P=x[w][_],I=x[w+1][_],A=x[w+1][_+1],U=x[w][_+1];(t>0||w!==0)&&(h.push(P,I,U),S+=3),(e>0||w!==r-1)&&(h.push(I,A,U),S+=3)}c.addGroup(p,S,0),p+=S}function M(y){let T=g,S=new ct,R=new D,_=0,w=y===!0?t:e,P=y===!0?1:-1;for(let A=1;A<=s;A++)u.push(0,m*P,0),d.push(0,P,0),f.push(.5,.5),g++;let I=g;for(let A=0;A<=s;A++){let L=A/s*l+a,k=Math.cos(L),W=Math.sin(L);R.x=w*W,R.y=m*P,R.z=w*k,u.push(R.x,R.y,R.z),d.push(0,P,0),S.x=k*.5+.5,S.y=W*.5*P+.5,f.push(S.x,S.y),g++}for(let A=0;A<s;A++){let U=T+A,L=I+A;y===!0?h.push(L,L+1,U):h.push(L+1,L,U),_+=3}c.addGroup(p,_,y===!0?1:2),p+=_}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}};var Xo=class i extends Ne{constructor(t=[],e=[],n=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:n,detail:s};let r=[],o=[];a(s),c(n),h(),this.setAttribute("position",new he(r,3)),this.setAttribute("normal",new he(r.slice(),3)),this.setAttribute("uv",new he(o,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function a(b){let M=new D,y=new D,T=new D;for(let S=0;S<e.length;S+=3)f(e[S+0],M),f(e[S+1],y),f(e[S+2],T),l(M,y,T,b)}function l(b,M,y,T){let S=T+1,R=[];for(let _=0;_<=S;_++){R[_]=[];let w=b.clone().lerp(y,_/S),P=M.clone().lerp(y,_/S),I=S-_;for(let A=0;A<=I;A++)A===0&&_===S?R[_][A]=w:R[_][A]=w.clone().lerp(P,A/I)}for(let _=0;_<S;_++)for(let w=0;w<2*(S-_)-1;w++){let P=Math.floor(w/2);w%2===0?(d(R[_][P+1]),d(R[_+1][P]),d(R[_][P])):(d(R[_][P+1]),d(R[_+1][P+1]),d(R[_+1][P]))}}function c(b){let M=new D;for(let y=0;y<r.length;y+=3)M.x=r[y+0],M.y=r[y+1],M.z=r[y+2],M.normalize().multiplyScalar(b),r[y+0]=M.x,r[y+1]=M.y,r[y+2]=M.z}function h(){let b=new D;for(let M=0;M<r.length;M+=3){b.x=r[M+0],b.y=r[M+1],b.z=r[M+2];let y=m(b)/2/Math.PI+.5,T=p(b)/Math.PI+.5;o.push(y,1-T)}g(),u()}function u(){for(let b=0;b<o.length;b+=6){let M=o[b+0],y=o[b+2],T=o[b+4],S=Math.max(M,y,T),R=Math.min(M,y,T);S>.9&&R<.1&&(M<.2&&(o[b+0]+=1),y<.2&&(o[b+2]+=1),T<.2&&(o[b+4]+=1))}}function d(b){r.push(b.x,b.y,b.z)}function f(b,M){let y=b*3;M.x=t[y+0],M.y=t[y+1],M.z=t[y+2]}function g(){let b=new D,M=new D,y=new D,T=new D,S=new ct,R=new ct,_=new ct;for(let w=0,P=0;w<r.length;w+=9,P+=6){b.set(r[w+0],r[w+1],r[w+2]),M.set(r[w+3],r[w+4],r[w+5]),y.set(r[w+6],r[w+7],r[w+8]),S.set(o[P+0],o[P+1]),R.set(o[P+2],o[P+3]),_.set(o[P+4],o[P+5]),T.copy(b).add(M).add(y).divideScalar(3);let I=m(T);x(S,P+0,b,I),x(R,P+2,M,I),x(_,P+4,y,I)}}function x(b,M,y,T){T<0&&b.x===1&&(o[M]=b.x-1),y.x===0&&y.z===0&&(o[M]=T/2/Math.PI+.5)}function m(b){return Math.atan2(b.z,-b.x)}function p(b){return Math.atan2(-b.y,Math.sqrt(b.x*b.x+b.z*b.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.vertices,t.indices,t.radius,t.detail)}},Rs=class i extends Xo{constructor(t=1,e=0){let n=(1+Math.sqrt(5))/2,s=1/n,r=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-s,-n,0,-s,n,0,s,-n,0,s,n,-s,-n,0,-s,n,0,s,-n,0,s,n,0,-n,0,-s,n,0,-s,-n,0,s,n,0,s],o=[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9];super(r,o,t,e),this.type="DodecahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new i(t.radius,t.detail)}};var fn=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){Jt("Curve: .getPoint() not implemented.")}getPointAt(t,e){let n=this.getUtoTmapping(t);return this.getPoint(n,e)}getPoints(t=5){let e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return e}getSpacedPoints(t=5){let e=[];for(let n=0;n<=t;n++)e.push(this.getPointAt(n/t));return e}getLength(){let t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let e=[],n,s=this.getPoint(0),r=0;e.push(0);for(let o=1;o<=t;o++)n=this.getPoint(o/t),r+=n.distanceTo(s),e.push(r),s=n;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e=null){let n=this.getLengths(),s=0,r=n.length,o;e?o=e:o=t*n[r-1];let a=0,l=r-1,c;for(;a<=l;)if(s=Math.floor(a+(l-a)/2),c=n[s]-o,c<0)a=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,n[s]===o)return s/(r-1);let h=n[s],d=n[s+1]-h,f=(o-h)/d;return(s+f)/(r-1)}getTangent(t,e){let s=t-1e-4,r=t+1e-4;s<0&&(s=0),r>1&&(r=1);let o=this.getPoint(s),a=this.getPoint(r),l=e||(o.isVector2?new ct:new D);return l.copy(a).sub(o).normalize(),l}getTangentAt(t,e){let n=this.getUtoTmapping(t);return this.getTangent(n,e)}computeFrenetFrames(t,e=!1){let n=new D,s=[],r=[],o=[],a=new D,l=new xe;for(let f=0;f<=t;f++){let g=f/t;s[f]=this.getTangentAt(g,new D)}r[0]=new D,o[0]=new D;let c=Number.MAX_VALUE,h=Math.abs(s[0].x),u=Math.abs(s[0].y),d=Math.abs(s[0].z);h<=c&&(c=h,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),d<=c&&n.set(0,0,1),a.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],a),o[0].crossVectors(s[0],r[0]);for(let f=1;f<=t;f++){if(r[f]=r[f-1].clone(),o[f]=o[f-1].clone(),a.crossVectors(s[f-1],s[f]),a.length()>Number.EPSILON){a.normalize();let g=Math.acos(se(s[f-1].dot(s[f]),-1,1));r[f].applyMatrix4(l.makeRotationAxis(a,g))}o[f].crossVectors(s[f],r[f])}if(e===!0){let f=Math.acos(se(r[0].dot(r[t]),-1,1));f/=t,s[0].dot(a.crossVectors(r[0],r[t]))>0&&(f=-f);for(let g=1;g<=t;g++)r[g].applyMatrix4(l.makeRotationAxis(s[g],f*g)),o[g].crossVectors(s[g],r[g])}return{tangents:s,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){let t={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}},Cs=class extends fn{constructor(t=0,e=0,n=1,s=1,r=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(t,e=new ct){let n=e,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(o?r=0:r=s),this.aClockwise===!0&&!o&&(r===s?r=-s:r=r-s);let a=this.aStartAngle+t*r,l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),d=l-this.aX,f=c-this.aY;l=d*h-f*u+this.aX,c=d*u+f*h+this.aY}return n.set(l,c)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){let t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}},qo=class extends Cs{constructor(t,e,n,s,r,o){super(t,e,n,n,s,r,o),this.isArcCurve=!0,this.type="ArcCurve"}};function Cc(){let i=0,t=0,e=0,n=0;function s(r,o,a,l){i=r,t=a,e=-3*r+3*o-2*a-l,n=2*r-2*o+a+l}return{initCatmullRom:function(r,o,a,l,c){s(o,a,c*(a-r),c*(l-o))},initNonuniformCatmullRom:function(r,o,a,l,c,h,u){let d=(o-r)/c-(a-r)/(c+h)+(a-o)/h,f=(a-o)/h-(l-o)/(h+u)+(l-a)/u;d*=h,f*=h,s(o,a,d,f)},calc:function(r){let o=r*r,a=o*r;return i+t*r+e*o+n*a}}}var Nh=new D,Uh=new D,Vl=new Cc,Gl=new Cc,Wl=new Cc,Yo=class extends fn{constructor(t=[],e=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=n,this.tension=s}getPoint(t,e=new D){let n=e,s=this.points,r=s.length,o=(r-(this.closed?0:1))*t,a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:l===0&&a===r-1&&(a=r-2,l=1);let c,h;this.closed||a>0?c=s[(a-1)%r]:(Uh.subVectors(s[0],s[1]).add(s[0]),c=Uh);let u=s[a%r],d=s[(a+1)%r];if(this.closed||a+2<r?h=s[(a+2)%r]:(Nh.subVectors(s[r-1],s[r-2]).add(s[r-1]),h=Nh),this.curveType==="centripetal"||this.curveType==="chordal"){let f=this.curveType==="chordal"?.5:.25,g=Math.pow(c.distanceToSquared(u),f),x=Math.pow(u.distanceToSquared(d),f),m=Math.pow(d.distanceToSquared(h),f);x<1e-4&&(x=1),g<1e-4&&(g=x),m<1e-4&&(m=x),Vl.initNonuniformCatmullRom(c.x,u.x,d.x,h.x,g,x,m),Gl.initNonuniformCatmullRom(c.y,u.y,d.y,h.y,g,x,m),Wl.initNonuniformCatmullRom(c.z,u.z,d.z,h.z,g,x,m)}else this.curveType==="catmullrom"&&(Vl.initCatmullRom(c.x,u.x,d.x,h.x,this.tension),Gl.initCatmullRom(c.y,u.y,d.y,h.y,this.tension),Wl.initCatmullRom(c.z,u.z,d.z,h.z,this.tension));return n.set(Vl.calc(l),Gl.calc(l),Wl.calc(l)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(s.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){let s=this.points[e];t.points.push(s.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(new D().fromArray(s))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}};function Fh(i,t,e,n,s){let r=(n-t)*.5,o=(s-e)*.5,a=i*i,l=i*a;return(2*e-2*n+r+o)*l+(-3*e+3*n-2*r-o)*a+r*i+e}function Cf(i,t){let e=1-i;return e*e*t}function Pf(i,t){return 2*(1-i)*i*t}function If(i,t){return i*i*t}function ar(i,t,e,n){return Cf(i,t)+Pf(i,e)+If(i,n)}function Lf(i,t){let e=1-i;return e*e*e*t}function Df(i,t){let e=1-i;return 3*e*e*i*t}function Nf(i,t){return 3*(1-i)*i*i*t}function Uf(i,t){return i*i*i*t}function lr(i,t,e,n,s){return Lf(i,t)+Df(i,e)+Nf(i,n)+Uf(i,s)}var Mr=class extends fn{constructor(t=new ct,e=new ct,n=new ct,s=new ct){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new ct){let n=e,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(lr(t,s.x,r.x,o.x,a.x),lr(t,s.y,r.y,o.y,a.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},Zo=class extends fn{constructor(t=new D,e=new D,n=new D,s=new D){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new D){let n=e,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(lr(t,s.x,r.x,o.x,a.x),lr(t,s.y,r.y,o.y,a.y),lr(t,s.z,r.z,o.z,a.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},Er=class extends fn{constructor(t=new ct,e=new ct){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new ct){let n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new ct){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Jo=class extends fn{constructor(t=new D,e=new D){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new D){let n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new D){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Tr=class extends fn{constructor(t=new ct,e=new ct,n=new ct){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new ct){let n=e,s=this.v0,r=this.v1,o=this.v2;return n.set(ar(t,s.x,r.x,o.x),ar(t,s.y,r.y,o.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},$o=class extends fn{constructor(t=new D,e=new D,n=new D){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new D){let n=e,s=this.v0,r=this.v1,o=this.v2;return n.set(ar(t,s.x,r.x,o.x),ar(t,s.y,r.y,o.y),ar(t,s.z,r.z,o.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},wr=class extends fn{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new ct){let n=e,s=this.points,r=(s.length-1)*t,o=Math.floor(r),a=r-o,l=s[o===0?o:o-1],c=s[o],h=s[o>s.length-2?s.length-1:o+1],u=s[o>s.length-3?s.length-1:o+2];return n.set(Fh(a,l.x,c.x,h.x,u.x),Fh(a,l.y,c.y,h.y,u.y)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(s.clone())}return this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){let s=this.points[e];t.points.push(s.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(new ct().fromArray(s))}return this}},Kl=Object.freeze({__proto__:null,ArcCurve:qo,CatmullRomCurve3:Yo,CubicBezierCurve:Mr,CubicBezierCurve3:Zo,EllipseCurve:Cs,LineCurve:Er,LineCurve3:Jo,QuadraticBezierCurve:Tr,QuadraticBezierCurve3:$o,SplineCurve:wr}),Ko=class extends fn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(t){this.curves.push(t)}closePath(){let t=this.curves[0].getPoint(0),e=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(e)){let n=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Kl[n](e,t))}return this}getPoint(t,e){let n=t*this.getLength(),s=this.getCurveLengths(),r=0;for(;r<s.length;){if(s[r]>=n){let o=s[r]-n,a=this.curves[r],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,e)}r++}return null}getLength(){let t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let t=[],e=0;for(let n=0,s=this.curves.length;n<s;n++)e+=this.curves[n].getLength(),t.push(e);return this.cacheLengths=t,t}getSpacedPoints(t=40){let e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return this.autoClose&&e.push(e[0]),e}getPoints(t=12){let e=[],n;for(let s=0,r=this.curves;s<r.length;s++){let o=r[s],a=o.isEllipseCurve?t*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?t*o.points.length:t,l=o.getPoints(a);for(let c=0;c<l.length;c++){let h=l[c];n&&n.equals(h)||(e.push(h),n=h)}}return this.autoClose&&e.length>1&&!e[e.length-1].equals(e[0])&&e.push(e[0]),e}copy(t){super.copy(t),this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){let s=t.curves[e];this.curves.push(s.clone())}return this.autoClose=t.autoClose,this}toJSON(){let t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let e=0,n=this.curves.length;e<n;e++){let s=this.curves[e];t.curves.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){let s=t.curves[e];this.curves.push(new Kl[s.type]().fromJSON(s))}return this}},yi=class extends Ko{constructor(t){super(),this.type="Path",this.currentPoint=new ct,t&&this.setFromPoints(t)}setFromPoints(t){this.moveTo(t[0].x,t[0].y);for(let e=1,n=t.length;e<n;e++)this.lineTo(t[e].x,t[e].y);return this}moveTo(t,e){return this.currentPoint.set(t,e),this}lineTo(t,e){let n=new Er(this.currentPoint.clone(),new ct(t,e));return this.curves.push(n),this.currentPoint.set(t,e),this}quadraticCurveTo(t,e,n,s){let r=new Tr(this.currentPoint.clone(),new ct(t,e),new ct(n,s));return this.curves.push(r),this.currentPoint.set(n,s),this}bezierCurveTo(t,e,n,s,r,o){let a=new Mr(this.currentPoint.clone(),new ct(t,e),new ct(n,s),new ct(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(t){let e=[this.currentPoint.clone()].concat(t),n=new wr(e);return this.curves.push(n),this.currentPoint.copy(t[t.length-1]),this}arc(t,e,n,s,r,o){let a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(t+a,e+l,n,s,r,o),this}absarc(t,e,n,s,r,o){return this.absellipse(t,e,n,n,s,r,o),this}ellipse(t,e,n,s,r,o,a,l){let c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(t+c,e+h,n,s,r,o,a,l),this}absellipse(t,e,n,s,r,o,a,l){let c=new Cs(t,e,n,s,r,o,a,l);if(this.curves.length>0){let u=c.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(c);let h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(t){return super.copy(t),this.currentPoint.copy(t.currentPoint),this}toJSON(){let t=super.toJSON();return t.currentPoint=this.currentPoint.toArray(),t}fromJSON(t){return super.fromJSON(t),this.currentPoint.fromArray(t.currentPoint),this}},Ps=class extends yi{constructor(t){super(t),this.uuid=Ji(),this.type="Shape",this.holes=[]}getPointsHoles(t){let e=[];for(let n=0,s=this.holes.length;n<s;n++)e[n]=this.holes[n].getPoints(t);return e}extractPoints(t){return{shape:this.getPoints(t),holes:this.getPointsHoles(t)}}copy(t){super.copy(t),this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){let s=t.holes[e];this.holes.push(s.clone())}return this}toJSON(){let t=super.toJSON();t.uuid=this.uuid,t.holes=[];for(let e=0,n=this.holes.length;e<n;e++){let s=this.holes[e];t.holes.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.uuid=t.uuid,this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){let s=t.holes[e];this.holes.push(new yi().fromJSON(s))}return this}};function Ff(i,t,e=2){let n=t&&t.length,s=n?t[0]*e:i.length,r=Pu(i,0,s,e,!0),o=[];if(!r||r.next===r.prev)return o;let a,l,c;if(n&&(r=Hf(i,t,r,e)),i.length>80*e){a=i[0],l=i[1];let h=a,u=l;for(let d=e;d<s;d+=e){let f=i[d],g=i[d+1];f<a&&(a=f),g<l&&(l=g),f>h&&(h=f),g>u&&(u=g)}c=Math.max(h-a,u-l),c=c!==0?32767/c:0}return Ar(r,o,e,a,l,c,0),o}function Pu(i,t,e,n,s){let r;if(s===jf(i,t,e,n)>0)for(let o=t;o<e;o+=n)r=Oh(o/n|0,i[o],i[o+1],r);else for(let o=e-n;o>=t;o-=n)r=Oh(o/n|0,i[o],i[o+1],r);return r&&Is(r,r.next)&&(Cr(r),r=r.next),r}function Xi(i,t){if(!i)return i;t||(t=i);let e=i,n;do if(n=!1,!e.steiner&&(Is(e,e.next)||Te(e.prev,e,e.next)===0)){if(Cr(e),e=t=e.prev,e===e.next)break;n=!0}else e=e.next;while(n||e!==t);return t}function Ar(i,t,e,n,s,r,o){if(!i)return;!o&&r&&qf(i,n,s,r);let a=i;for(;i.prev!==i.next;){let l=i.prev,c=i.next;if(r?Bf(i,n,s,r):Of(i)){t.push(l.i,i.i,c.i),Cr(i),i=c.next,a=c.next;continue}if(i=c,i===a){o?o===1?(i=kf(Xi(i),t),Ar(i,t,e,n,s,r,2)):o===2&&zf(i,t,e,n,s,r):Ar(Xi(i),t,e,n,s,r,1);break}}}function Of(i){let t=i.prev,e=i,n=i.next;if(Te(t,e,n)>=0)return!1;let s=t.x,r=e.x,o=n.x,a=t.y,l=e.y,c=n.y,h=Math.min(s,r,o),u=Math.min(a,l,c),d=Math.max(s,r,o),f=Math.max(a,l,c),g=n.next;for(;g!==t;){if(g.x>=h&&g.x<=d&&g.y>=u&&g.y<=f&&sr(s,a,r,l,o,c,g.x,g.y)&&Te(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function Bf(i,t,e,n){let s=i.prev,r=i,o=i.next;if(Te(s,r,o)>=0)return!1;let a=s.x,l=r.x,c=o.x,h=s.y,u=r.y,d=o.y,f=Math.min(a,l,c),g=Math.min(h,u,d),x=Math.max(a,l,c),m=Math.max(h,u,d),p=jl(f,g,t,e,n),b=jl(x,m,t,e,n),M=i.prevZ,y=i.nextZ;for(;M&&M.z>=p&&y&&y.z<=b;){if(M.x>=f&&M.x<=x&&M.y>=g&&M.y<=m&&M!==s&&M!==o&&sr(a,h,l,u,c,d,M.x,M.y)&&Te(M.prev,M,M.next)>=0||(M=M.prevZ,y.x>=f&&y.x<=x&&y.y>=g&&y.y<=m&&y!==s&&y!==o&&sr(a,h,l,u,c,d,y.x,y.y)&&Te(y.prev,y,y.next)>=0))return!1;y=y.nextZ}for(;M&&M.z>=p;){if(M.x>=f&&M.x<=x&&M.y>=g&&M.y<=m&&M!==s&&M!==o&&sr(a,h,l,u,c,d,M.x,M.y)&&Te(M.prev,M,M.next)>=0)return!1;M=M.prevZ}for(;y&&y.z<=b;){if(y.x>=f&&y.x<=x&&y.y>=g&&y.y<=m&&y!==s&&y!==o&&sr(a,h,l,u,c,d,y.x,y.y)&&Te(y.prev,y,y.next)>=0)return!1;y=y.nextZ}return!0}function kf(i,t){let e=i;do{let n=e.prev,s=e.next.next;!Is(n,s)&&Lu(n,e,e.next,s)&&Rr(n,s)&&Rr(s,n)&&(t.push(n.i,e.i,s.i),Cr(e),Cr(e.next),e=i=s),e=e.next}while(e!==i);return Xi(e)}function zf(i,t,e,n,s,r){let o=i;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&Jf(o,a)){let l=Du(o,a);o=Xi(o,o.next),l=Xi(l,l.next),Ar(o,t,e,n,s,r,0),Ar(l,t,e,n,s,r,0);return}a=a.next}o=o.next}while(o!==i)}function Hf(i,t,e,n){let s=[];for(let r=0,o=t.length;r<o;r++){let a=t[r]*n,l=r<o-1?t[r+1]*n:i.length,c=Pu(i,a,l,n,!1);c===c.next&&(c.steiner=!0),s.push(Zf(c))}s.sort(Vf);for(let r=0;r<s.length;r++)e=Gf(s[r],e);return e}function Vf(i,t){let e=i.x-t.x;if(e===0&&(e=i.y-t.y,e===0)){let n=(i.next.y-i.y)/(i.next.x-i.x),s=(t.next.y-t.y)/(t.next.x-t.x);e=n-s}return e}function Gf(i,t){let e=Wf(i,t);if(!e)return t;let n=Du(e,i);return Xi(n,n.next),Xi(e,e.next)}function Wf(i,t){let e=t,n=i.x,s=i.y,r=-1/0,o;if(Is(i,e))return e;do{if(Is(i,e.next))return e.next;if(s<=e.y&&s>=e.next.y&&e.next.y!==e.y){let u=e.x+(s-e.y)*(e.next.x-e.x)/(e.next.y-e.y);if(u<=n&&u>r&&(r=u,o=e.x<e.next.x?e:e.next,u===n))return o}e=e.next}while(e!==t);if(!o)return null;let a=o,l=o.x,c=o.y,h=1/0;e=o;do{if(n>=e.x&&e.x>=l&&n!==e.x&&Iu(s<c?n:r,s,l,c,s<c?r:n,s,e.x,e.y)){let u=Math.abs(s-e.y)/(n-e.x);Rr(e,i)&&(u<h||u===h&&(e.x>o.x||e.x===o.x&&Xf(o,e)))&&(o=e,h=u)}e=e.next}while(e!==a);return o}function Xf(i,t){return Te(i.prev,i,t.prev)<0&&Te(t.next,i,i.next)<0}function qf(i,t,e,n){let s=i;do s.z===0&&(s.z=jl(s.x,s.y,t,e,n)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==i);s.prevZ.nextZ=null,s.prevZ=null,Yf(s)}function Yf(i){let t,e=1;do{let n=i,s;i=null;let r=null;for(t=0;n;){t++;let o=n,a=0;for(let c=0;c<e&&(a++,o=o.nextZ,!!o);c++);let l=e;for(;a>0||l>0&&o;)a!==0&&(l===0||!o||n.z<=o.z)?(s=n,n=n.nextZ,a--):(s=o,o=o.nextZ,l--),r?r.nextZ=s:i=s,s.prevZ=r,r=s;n=o}r.nextZ=null,e*=2}while(t>1);return i}function jl(i,t,e,n,s){return i=(i-e)*s|0,t=(t-n)*s|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,i|t<<1}function Zf(i){let t=i,e=i;do(t.x<e.x||t.x===e.x&&t.y<e.y)&&(e=t),t=t.next;while(t!==i);return e}function Iu(i,t,e,n,s,r,o,a){return(s-o)*(t-a)>=(i-o)*(r-a)&&(i-o)*(n-a)>=(e-o)*(t-a)&&(e-o)*(r-a)>=(s-o)*(n-a)}function sr(i,t,e,n,s,r,o,a){return!(i===o&&t===a)&&Iu(i,t,e,n,s,r,o,a)}function Jf(i,t){return i.next.i!==t.i&&i.prev.i!==t.i&&!$f(i,t)&&(Rr(i,t)&&Rr(t,i)&&Kf(i,t)&&(Te(i.prev,i,t.prev)||Te(i,t.prev,t))||Is(i,t)&&Te(i.prev,i,i.next)>0&&Te(t.prev,t,t.next)>0)}function Te(i,t,e){return(t.y-i.y)*(e.x-t.x)-(t.x-i.x)*(e.y-t.y)}function Is(i,t){return i.x===t.x&&i.y===t.y}function Lu(i,t,e,n){let s=Ao(Te(i,t,e)),r=Ao(Te(i,t,n)),o=Ao(Te(e,n,i)),a=Ao(Te(e,n,t));return!!(s!==r&&o!==a||s===0&&wo(i,e,t)||r===0&&wo(i,n,t)||o===0&&wo(e,i,n)||a===0&&wo(e,t,n))}function wo(i,t,e){return t.x<=Math.max(i.x,e.x)&&t.x>=Math.min(i.x,e.x)&&t.y<=Math.max(i.y,e.y)&&t.y>=Math.min(i.y,e.y)}function Ao(i){return i>0?1:i<0?-1:0}function $f(i,t){let e=i;do{if(e.i!==i.i&&e.next.i!==i.i&&e.i!==t.i&&e.next.i!==t.i&&Lu(e,e.next,i,t))return!0;e=e.next}while(e!==i);return!1}function Rr(i,t){return Te(i.prev,i,i.next)<0?Te(i,t,i.next)>=0&&Te(i,i.prev,t)>=0:Te(i,t,i.prev)<0||Te(i,i.next,t)<0}function Kf(i,t){let e=i,n=!1,s=(i.x+t.x)/2,r=(i.y+t.y)/2;do e.y>r!=e.next.y>r&&e.next.y!==e.y&&s<(e.next.x-e.x)*(r-e.y)/(e.next.y-e.y)+e.x&&(n=!n),e=e.next;while(e!==i);return n}function Du(i,t){let e=Ql(i.i,i.x,i.y),n=Ql(t.i,t.x,t.y),s=i.next,r=t.prev;return i.next=t,t.prev=i,e.next=s,s.prev=e,n.next=e,e.prev=n,r.next=n,n.prev=r,n}function Oh(i,t,e,n){let s=Ql(i,t,e);return n?(s.next=n.next,s.prev=n,n.next.prev=s,n.next=s):(s.prev=s,s.next=s),s}function Cr(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function Ql(i,t,e){return{i,x:t,y:e,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function jf(i,t,e,n){let s=0;for(let r=t,o=e-n;r<e;r+=n)s+=(i[o]-i[r])*(i[r+1]+i[o+1]),o=r;return s}var tc=class{static triangulate(t,e,n=2){return Ff(t,e,n)}},Hi=class i{static area(t){let e=t.length,n=0;for(let s=e-1,r=0;r<e;s=r++)n+=t[s].x*t[r].y-t[r].x*t[s].y;return n*.5}static isClockWise(t){return i.area(t)<0}static triangulateShape(t,e){let n=[],s=[],r=[];Bh(t),kh(n,t);let o=t.length;e.forEach(Bh);for(let l=0;l<e.length;l++)s.push(o),o+=e[l].length,kh(n,e[l]);let a=tc.triangulate(n,s);for(let l=0;l<a.length;l+=3)r.push(a.slice(l,l+3));return r}};function Bh(i){let t=i.length;t>2&&i[t-1].equals(i[0])&&i.pop()}function kh(i,t){for(let e=0;e<t.length;e++)i.push(t[e].x),i.push(t[e].y)}var Pr=class i extends Ne{constructor(t=new Ps([new ct(.5,.5),new ct(-.5,.5),new ct(-.5,-.5),new ct(.5,-.5)]),e={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:t,options:e},t=Array.isArray(t)?t:[t];let n=this,s=[],r=[];for(let a=0,l=t.length;a<l;a++){let c=t[a];o(c)}this.setAttribute("position",new he(s,3)),this.setAttribute("uv",new he(r,2)),this.computeVertexNormals();function o(a){let l=[],c=e.curveSegments!==void 0?e.curveSegments:12,h=e.steps!==void 0?e.steps:1,u=e.depth!==void 0?e.depth:1,d=e.bevelEnabled!==void 0?e.bevelEnabled:!0,f=e.bevelThickness!==void 0?e.bevelThickness:.2,g=e.bevelSize!==void 0?e.bevelSize:f-.1,x=e.bevelOffset!==void 0?e.bevelOffset:0,m=e.bevelSegments!==void 0?e.bevelSegments:3,p=e.extrudePath,b=e.UVGenerator!==void 0?e.UVGenerator:Qf,M,y=!1,T,S,R,_;if(p){M=p.getSpacedPoints(h),y=!0,d=!1;let ot=p.isCatmullRomCurve3?p.closed:!1;T=p.computeFrenetFrames(h,ot),S=new D,R=new D,_=new D}d||(m=0,f=0,g=0,x=0);let w=a.extractPoints(c),P=w.shape,I=w.holes;if(!Hi.isClockWise(P)){P=P.reverse();for(let ot=0,ht=I.length;ot<ht;ot++){let rt=I[ot];Hi.isClockWise(rt)&&(I[ot]=rt.reverse())}}function U(ot){let rt=10000000000000001e-36,lt=ot[0];for(let xt=1;xt<=ot.length;xt++){let kt=xt%ot.length,bt=ot[kt],Wt=bt.x-lt.x,Zt=bt.y-lt.y,F=Wt*Wt+Zt*Zt,ee=Math.max(Math.abs(bt.x),Math.abs(bt.y),Math.abs(lt.x),Math.abs(lt.y)),ie=rt*ee*ee;if(F<=ie){ot.splice(kt,1),xt--;continue}lt=bt}}U(P),I.forEach(U);let L=I.length,k=P;for(let ot=0;ot<L;ot++){let ht=I[ot];P=P.concat(ht)}function W(ot,ht,rt){return ht||Qt("ExtrudeGeometry: vec does not exist"),ot.clone().addScaledVector(ht,rt)}let z=P.length;function Q(ot,ht,rt){let lt,xt,kt,bt=ot.x-ht.x,Wt=ot.y-ht.y,Zt=rt.x-ot.x,F=rt.y-ot.y,ee=bt*bt+Wt*Wt,ie=bt*F-Wt*Zt;if(Math.abs(ie)>Number.EPSILON){let C=Math.sqrt(ee),v=Math.sqrt(Zt*Zt+F*F),G=ht.x-Wt/C,B=ht.y+bt/C,X=rt.x-F/v,at=rt.y+Zt/v,ft=((X-G)*F-(at-B)*Zt)/(bt*F-Wt*Zt);lt=G+bt*ft-ot.x,xt=B+Wt*ft-ot.y;let $=lt*lt+xt*xt;if($<=2)return new ct(lt,xt);kt=Math.sqrt($/2)}else{let C=!1;bt>Number.EPSILON?Zt>Number.EPSILON&&(C=!0):bt<-Number.EPSILON?Zt<-Number.EPSILON&&(C=!0):Math.sign(Wt)===Math.sign(F)&&(C=!0),C?(lt=-Wt,xt=bt,kt=Math.sqrt(ee)):(lt=bt,xt=Wt,kt=Math.sqrt(ee/2))}return new ct(lt/kt,xt/kt)}let N=[];for(let ot=0,ht=k.length,rt=ht-1,lt=ot+1;ot<ht;ot++,rt++,lt++)rt===ht&&(rt=0),lt===ht&&(lt=0),N[ot]=Q(k[ot],k[rt],k[lt]);let V=[],Y,yt=N.concat();for(let ot=0,ht=L;ot<ht;ot++){let rt=I[ot];Y=[];for(let lt=0,xt=rt.length,kt=xt-1,bt=lt+1;lt<xt;lt++,kt++,bt++)kt===xt&&(kt=0),bt===xt&&(bt=0),Y[lt]=Q(rt[lt],rt[kt],rt[bt]);V.push(Y),yt=yt.concat(Y)}let _t;if(m===0)_t=Hi.triangulateShape(k,I);else{let ot=[],ht=[];for(let rt=0;rt<m;rt++){let lt=rt/m,xt=f*Math.cos(lt*Math.PI/2),kt=g*Math.sin(lt*Math.PI/2)+x;for(let bt=0,Wt=k.length;bt<Wt;bt++){let Zt=W(k[bt],N[bt],kt);St(Zt.x,Zt.y,-xt),lt===0&&ot.push(Zt)}for(let bt=0,Wt=L;bt<Wt;bt++){let Zt=I[bt];Y=V[bt];let F=[];for(let ee=0,ie=Zt.length;ee<ie;ee++){let C=W(Zt[ee],Y[ee],kt);St(C.x,C.y,-xt),lt===0&&F.push(C)}lt===0&&ht.push(F)}}_t=Hi.triangulateShape(ot,ht)}let te=_t.length,qt=g+x;for(let ot=0;ot<z;ot++){let ht=d?W(P[ot],yt[ot],qt):P[ot];y?(R.copy(T.normals[0]).multiplyScalar(ht.x),S.copy(T.binormals[0]).multiplyScalar(ht.y),_.copy(M[0]).add(R).add(S),St(_.x,_.y,_.z)):St(ht.x,ht.y,0)}for(let ot=1;ot<=h;ot++)for(let ht=0;ht<z;ht++){let rt=d?W(P[ht],yt[ht],qt):P[ht];y?(R.copy(T.normals[ot]).multiplyScalar(rt.x),S.copy(T.binormals[ot]).multiplyScalar(rt.y),_.copy(M[ot]).add(R).add(S),St(_.x,_.y,_.z)):St(rt.x,rt.y,u/h*ot)}for(let ot=m-1;ot>=0;ot--){let ht=ot/m,rt=f*Math.cos(ht*Math.PI/2),lt=g*Math.sin(ht*Math.PI/2)+x;for(let xt=0,kt=k.length;xt<kt;xt++){let bt=W(k[xt],N[xt],lt);St(bt.x,bt.y,u+rt)}for(let xt=0,kt=I.length;xt<kt;xt++){let bt=I[xt];Y=V[xt];for(let Wt=0,Zt=bt.length;Wt<Zt;Wt++){let F=W(bt[Wt],Y[Wt],lt);y?St(F.x,F.y+M[h-1].y,M[h-1].x+rt):St(F.x,F.y,u+rt)}}}Kt(),et();function Kt(){let ot=s.length/3;if(d){let ht=0,rt=z*ht;for(let lt=0;lt<te;lt++){let xt=_t[lt];wt(xt[2]+rt,xt[1]+rt,xt[0]+rt)}ht=h+m*2,rt=z*ht;for(let lt=0;lt<te;lt++){let xt=_t[lt];wt(xt[0]+rt,xt[1]+rt,xt[2]+rt)}}else{for(let ht=0;ht<te;ht++){let rt=_t[ht];wt(rt[2],rt[1],rt[0])}for(let ht=0;ht<te;ht++){let rt=_t[ht];wt(rt[0]+z*h,rt[1]+z*h,rt[2]+z*h)}}n.addGroup(ot,s.length/3-ot,0)}function et(){let ot=s.length/3,ht=0;st(k,ht),ht+=k.length;for(let rt=0,lt=I.length;rt<lt;rt++){let xt=I[rt];st(xt,ht),ht+=xt.length}n.addGroup(ot,s.length/3-ot,1)}function st(ot,ht){let rt=ot.length;for(;--rt>=0;){let lt=rt,xt=rt-1;xt<0&&(xt=ot.length-1);for(let kt=0,bt=h+m*2;kt<bt;kt++){let Wt=z*kt,Zt=z*(kt+1),F=ht+lt+Wt,ee=ht+xt+Wt,ie=ht+xt+Zt,C=ht+lt+Zt;Mt(F,ee,ie,C)}}}function St(ot,ht,rt){l.push(ot),l.push(ht),l.push(rt)}function wt(ot,ht,rt){Dt(ot),Dt(ht),Dt(rt);let lt=s.length/3,xt=b.generateTopUV(n,s,lt-3,lt-2,lt-1);jt(xt[0]),jt(xt[1]),jt(xt[2])}function Mt(ot,ht,rt,lt){Dt(ot),Dt(ht),Dt(lt),Dt(ht),Dt(rt),Dt(lt);let xt=s.length/3,kt=b.generateSideWallUV(n,s,xt-6,xt-3,xt-2,xt-1);jt(kt[0]),jt(kt[1]),jt(kt[3]),jt(kt[1]),jt(kt[2]),jt(kt[3])}function Dt(ot){s.push(l[ot*3+0]),s.push(l[ot*3+1]),s.push(l[ot*3+2])}function jt(ot){r.push(ot.x),r.push(ot.y)}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON(),e=this.parameters.shapes,n=this.parameters.options;return tp(e,n,t)}static fromJSON(t,e){let n=[];for(let r=0,o=t.shapes.length;r<o;r++){let a=e[t.shapes[r]];n.push(a)}let s=t.options.extrudePath;return s!==void 0&&(t.options.extrudePath=new Kl[s.type]().fromJSON(s)),new i(n,t.options)}},Qf={generateTopUV:function(i,t,e,n,s){let r=t[e*3],o=t[e*3+1],a=t[n*3],l=t[n*3+1],c=t[s*3],h=t[s*3+1];return[new ct(r,o),new ct(a,l),new ct(c,h)]},generateSideWallUV:function(i,t,e,n,s,r){let o=t[e*3],a=t[e*3+1],l=t[e*3+2],c=t[n*3],h=t[n*3+1],u=t[n*3+2],d=t[s*3],f=t[s*3+1],g=t[s*3+2],x=t[r*3],m=t[r*3+1],p=t[r*3+2];return Math.abs(a-h)<Math.abs(o-c)?[new ct(o,1-l),new ct(c,1-u),new ct(d,1-g),new ct(x,1-p)]:[new ct(a,1-l),new ct(h,1-u),new ct(f,1-g),new ct(m,1-p)]}};function tp(i,t,e){if(e.shapes=[],Array.isArray(i))for(let n=0,s=i.length;n<s;n++){let r=i[n];e.shapes.push(r.uuid)}else e.shapes.push(i.uuid);return e.options=Object.assign({},t),t.extrudePath!==void 0&&(e.options.extrudePath=t.extrudePath.toJSON()),e}var Ir=class i extends Ne{constructor(t=[new ct(0,-.5),new ct(.5,0),new ct(0,.5)],e=12,n=0,s=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:t,segments:e,phiStart:n,phiLength:s},e=Math.floor(e),s=se(s,0,Math.PI*2);let r=[],o=[],a=[],l=[],c=[],h=1/e,u=new D,d=new ct,f=new D,g=new D,x=new D,m=0,p=0;for(let b=0;b<=t.length-1;b++)switch(b){case 0:m=t[b+1].x-t[b].x,p=t[b+1].y-t[b].y,f.x=p*1,f.y=-m,f.z=p*0,x.copy(f),f.normalize(),l.push(f.x,f.y,f.z);break;case t.length-1:l.push(x.x,x.y,x.z);break;default:m=t[b+1].x-t[b].x,p=t[b+1].y-t[b].y,f.x=p*1,f.y=-m,f.z=p*0,g.copy(f),f.x+=x.x,f.y+=x.y,f.z+=x.z,f.normalize(),l.push(f.x,f.y,f.z),x.copy(g)}for(let b=0;b<=e;b++){let M=n+b*h*s,y=Math.sin(M),T=Math.cos(M);for(let S=0;S<=t.length-1;S++){u.x=t[S].x*y,u.y=t[S].y,u.z=t[S].x*T,o.push(u.x,u.y,u.z),d.x=b/e,d.y=S/(t.length-1),a.push(d.x,d.y);let R=l[3*S+0]*y,_=l[3*S+1],w=l[3*S+0]*T;c.push(R,_,w)}}for(let b=0;b<e;b++)for(let M=0;M<t.length-1;M++){let y=M+b*t.length,T=y,S=y+t.length,R=y+t.length+1,_=y+1;r.push(T,S,_),r.push(R,_,S)}this.setIndex(r),this.setAttribute("position",new he(o,3)),this.setAttribute("uv",new he(a,2)),this.setAttribute("normal",new he(c,3))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.points,t.segments,t.phiStart,t.phiLength)}};var bn=class i extends Ne{constructor(t=1,e=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:s};let r=t/2,o=e/2,a=Math.floor(n),l=Math.floor(s),c=a+1,h=l+1,u=t/a,d=e/l,f=[],g=[],x=[],m=[];for(let p=0;p<h;p++){let b=p*d-o;for(let M=0;M<c;M++){let y=M*u-r;g.push(y,-b,0),x.push(0,0,1),m.push(M/a),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let b=0;b<a;b++){let M=b+c*p,y=b+c*(p+1),T=b+1+c*(p+1),S=b+1+c*p;f.push(M,y,S),f.push(y,T,S)}this.setIndex(f),this.setAttribute("position",new he(g,3)),this.setAttribute("normal",new he(x,3)),this.setAttribute("uv",new he(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.widthSegments,t.heightSegments)}};var Gn=class i extends Ne{constructor(t=1,e=32,n=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));let l=Math.min(o+a,Math.PI),c=0,h=[],u=new D,d=new D,f=[],g=[],x=[],m=[];for(let p=0;p<=n;p++){let b=[],M=p/n,y=o+M*a,T=t*Math.cos(y),S=Math.sqrt(t*t-T*T),R=0;p===0&&o===0?R=.5/e:p===n&&l===Math.PI&&(R=-.5/e);for(let _=0;_<=e;_++){let w=_/e,P=s+w*r;u.x=-S*Math.cos(P),u.y=T,u.z=S*Math.sin(P),g.push(u.x,u.y,u.z),d.copy(u).normalize(),x.push(d.x,d.y,d.z),m.push(w+R,1-M),b.push(c++)}h.push(b)}for(let p=0;p<n;p++)for(let b=0;b<e;b++){let M=h[p][b+1],y=h[p][b],T=h[p+1][b],S=h[p+1][b+1];(p!==0||o>0)&&f.push(M,y,S),(p!==n-1||l<Math.PI)&&f.push(y,T,S)}this.setIndex(f),this.setAttribute("position",new he(g,3)),this.setAttribute("normal",new he(x,3)),this.setAttribute("uv",new he(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};var qe=class i extends Ne{constructor(t=1,e=.4,n=12,s=48,r=Math.PI*2,o=0,a=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:n,tubularSegments:s,arc:r,thetaStart:o,thetaLength:a},n=Math.floor(n),s=Math.floor(s);let l=[],c=[],h=[],u=[],d=new D,f=new D,g=new D;for(let x=0;x<=n;x++){let m=o+x/n*a;for(let p=0;p<=s;p++){let b=p/s*r;f.x=(t+e*Math.cos(m))*Math.cos(b),f.y=(t+e*Math.cos(m))*Math.sin(b),f.z=e*Math.sin(m),c.push(f.x,f.y,f.z),d.x=t*Math.cos(b),d.y=t*Math.sin(b),g.subVectors(f,d).normalize(),h.push(g.x,g.y,g.z),u.push(p/s),u.push(x/n)}}for(let x=1;x<=n;x++)for(let m=1;m<=s;m++){let p=(s+1)*x+m-1,b=(s+1)*(x-1)+m-1,M=(s+1)*(x-1)+m,y=(s+1)*x+m;l.push(p,b,y),l.push(b,M,y)}this.setIndex(l),this.setAttribute("position",new he(c,3)),this.setAttribute("normal",new he(h,3)),this.setAttribute("uv",new he(u,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc,t.thetaStart,t.thetaLength)}};function $i(i){let t={};for(let e in i){t[e]={};for(let n in i[e]){let s=i[e][n];if(zh(s))s.isRenderTargetTexture?(Jt("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=s.clone();else if(Array.isArray(s))if(zh(s[0])){let r=[];for(let o=0,a=s.length;o<a;o++)r[o]=s[o].clone();t[e][n]=r}else t[e][n]=s.slice();else t[e][n]=s}}return t}function $e(i){let t={};for(let e=0;e<i.length;e++){let n=$i(i[e]);for(let s in n)t[s]=n[s]}return t}function zh(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function ep(i){let t=[];for(let e=0;e<i.length;e++)t.push(i[e].clone());return t}function Pc(i){let t=i.getRenderTarget();return t===null?i.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:le.workingColorSpace}var Nu={clone:$i,merge:$e},np=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,ip=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,pn=class extends ii{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=np,this.fragmentShader=ip,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=$i(t.uniforms),this.uniformsGroups=ep(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let s in this.uniforms){let o=this.uniforms[s].value;o&&o.isTexture?e.uniforms[s]={type:"t",value:o.toJSON(t).uuid}:o&&o.isColor?e.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?e.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?e.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?e.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?e.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?e.uniforms[s]={type:"m4",value:o.toArray()}:e.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}fromJSON(t,e){if(super.fromJSON(t,e),t.uniforms!==void 0)for(let n in t.uniforms){let s=t.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=e[s.value]||null;break;case"c":this.uniforms[n].value=new $t().setHex(s.value);break;case"v2":this.uniforms[n].value=new ct().fromArray(s.value);break;case"v3":this.uniforms[n].value=new D().fromArray(s.value);break;case"v4":this.uniforms[n].value=new Ee().fromArray(s.value);break;case"m3":this.uniforms[n].value=new ne().fromArray(s.value);break;case"m4":this.uniforms[n].value=new xe().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(let n in t.extensions)this.extensions[n]=t.extensions[n];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}},jo=class extends pn{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},pe=class extends ii{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new $t(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new $t(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=$r,this.normalScale=new ct(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Hn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}},ri=class extends pe{constructor(t){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new ct(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return se(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(e){this.ior=(1+.4*e)/(1-.4*e)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new $t(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new $t(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new $t(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(t)}get anisotropy(){return this._anisotropy}set anisotropy(t){this._anisotropy>0!=t>0&&this.version++,this._anisotropy=t}get clearcoat(){return this._clearcoat}set clearcoat(t){this._clearcoat>0!=t>0&&this.version++,this._clearcoat=t}get iridescence(){return this._iridescence}set iridescence(t){this._iridescence>0!=t>0&&this.version++,this._iridescence=t}get dispersion(){return this._dispersion}set dispersion(t){this._dispersion>0!=t>0&&this.version++,this._dispersion=t}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(t){this._retroreflectivity>0!=t>0&&this.version++,this._retroreflectivity=t}get sheen(){return this._sheen}set sheen(t){this._sheen>0!=t>0&&this.version++,this._sheen=t}get transmission(){return this._transmission}set transmission(t){this._transmission>0!=t>0&&this.version++,this._transmission=t}copy(t){return super.copy(t),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=t.anisotropy,this.anisotropyRotation=t.anisotropyRotation,this.anisotropyMap=t.anisotropyMap,this.clearcoat=t.clearcoat,this.clearcoatMap=t.clearcoatMap,this.clearcoatRoughness=t.clearcoatRoughness,this.clearcoatRoughnessMap=t.clearcoatRoughnessMap,this.clearcoatNormalMap=t.clearcoatNormalMap,this.clearcoatNormalScale.copy(t.clearcoatNormalScale),this.dispersion=t.dispersion,this.ior=t.ior,this.iridescence=t.iridescence,this.iridescenceMap=t.iridescenceMap,this.iridescenceIOR=t.iridescenceIOR,this.iridescenceThicknessRange=[...t.iridescenceThicknessRange],this.iridescenceThicknessMap=t.iridescenceThicknessMap,this.retroreflectivity=t.retroreflectivity,this.sheen=t.sheen,this.sheenColor.copy(t.sheenColor),this.sheenColorMap=t.sheenColorMap,this.sheenRoughness=t.sheenRoughness,this.sheenRoughnessMap=t.sheenRoughnessMap,this.transmission=t.transmission,this.transmissionMap=t.transmissionMap,this.thickness=t.thickness,this.thicknessMap=t.thicknessMap,this.attenuationDistance=t.attenuationDistance,this.attenuationColor.copy(t.attenuationColor),this.specularIntensity=t.specularIntensity,this.specularIntensityMap=t.specularIntensityMap,this.specularColor.copy(t.specularColor),this.specularColorMap=t.specularColorMap,this}};var Lr=class extends ii{constructor(t){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new $t(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new $t(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=$r,this.normalScale=new ct(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Hn,this.combine=ma,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.envMapIntensity=t.envMapIntensity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}},Qo=class extends ii{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=mu,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},ta=class extends ii{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}};function ps(i,t){return!i||i.constructor===t?i:typeof t.BYTES_PER_ELEMENT=="number"?new t(i):Array.prototype.slice.call(i)}function Xl(i){return i!==void 0&&i.inTangents!==void 0&&i.outTangents!==void 0}var vi=class{constructor(t,e,n,s){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new e.constructor(n),this.sampleValues=e,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,n=this._cachedIndex,s=e[n],r=e[n-1];n:{t:{let o;e:{i:if(!(t<s)){for(let a=n+2;;){if(s===void 0){if(t<r)break i;return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(r=s,s=e[++n],t<s)break t}o=e.length;break e}if(!(t>=r)){let a=e[1];t<a&&(n=2,r=a);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=e[--n-1],t>=r)break t}o=n,n=0;break e}break n}for(;n<o;){let a=n+o>>>1;t<e[a]?o=a:n=a+1}if(s=e[n],r=e[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,t,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=t*s;for(let o=0;o!==s;++o)e[o]=n[r+o];return e}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},ea=class extends vi{constructor(t,e,n,s){super(t,e,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Zl,endingEnd:Zl}}intervalChanged_(t,e,n){let s=this.parameterPositions,r=t-2,o=t+1,a=s[r],l=s[o];if(a===void 0)switch(this.getSettings_().endingStart){case Jl:r=t,a=2*e-n;break;case $l:r=s.length-2,a=e+s[r]-s[r+1];break;default:r=t,a=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Jl:o=t,l=2*n-e;break;case $l:o=1,l=n+s[1]-s[0];break;default:o=t-1,l=e}let c=(n-e)*.5,h=this.valueSize;this._weightPrev=c/(e-a),this._weightNext=c/(l-n),this._offsetPrev=r*h,this._offsetNext=o*h}interpolate_(t,e,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,h=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,g=(n-e)/(s-e),x=g*g,m=x*g,p=-d*m+2*d*x-d*g,b=(1+d)*m+(-1.5-2*d)*x+(-.5+d)*g+1,M=(-1-f)*m+(1.5+f)*x+.5*g,y=f*m-f*x;for(let T=0;T!==a;++T)r[T]=p*o[h+T]+b*o[c+T]+M*o[l+T]+y*o[u+T];return r}},na=class extends vi{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,h=(n-e)/(s-e),u=1-h;for(let d=0;d!==a;++d)r[d]=o[c+d]*u+o[l+d]*h;return r}},ia=class extends vi{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t){return this.copySampleValue_(t-1)}},sa=class extends vi{interpolate_(t,e,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,h=this.inTangents,u=this.outTangents;if(!h||!u){let g=(n-e)/(s-e),x=1-g;for(let m=0;m!==a;++m)r[m]=o[c+m]*x+o[l+m]*g;return r}let d=a*2,f=t-1;for(let g=0;g!==a;++g){let x=o[c+g],m=o[l+g],p=f*d+g*2,b=u[p],M=u[p+1],y=t*d+g*2,T=h[y],S=h[y+1],R=rp(n,e,b,T,s);r[g]=Uu(R,x,M,S,m)}return r}};function Uu(i,t,e,n,s){let r=1-i;return r*r*r*t+3*r*r*i*e+3*r*i*i*n+i*i*i*s}function sp(i,t,e,n,s){let r=1-i;return 3*r*r*(e-t)+6*r*i*(n-e)+3*i*i*(s-n)}function rp(i,t,e,n,s){let r=(i-t)/(s-t);for(let o=0;o<8;o++){let a=Uu(r,t,e,n,s)-i;if(Math.abs(a)<1e-10)break;let l=sp(r,t,e,n,s);if(Math.abs(l)<1e-10)break;r=Math.max(0,Math.min(1,r-a/l))}return r}var mn=class{constructor(t,e,n,s){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=ps(e,this.TimeBufferType),this.values=ps(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,n;if(e.toJSON!==this.toJSON)n=e.toJSON(t);else{n={name:t.name,times:ps(t.times,Array),values:ps(t.values,Array)};let s=t.getInterpolation();s!==t.DefaultInterpolation&&(n.interpolation=s),Xl(t.settings)&&(n.settings={inTangents:ps(t.settings.inTangents,Array),outTangents:ps(t.settings.outTangents,Array)})}return n.type=t.ValueTypeName,n}InterpolantFactoryMethodDiscrete(t){return new ia(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new na(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new ea(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodBezier(t){let e=new sa(this.times,this.values,this.getValueSize(),t);return this.settings&&(e.inTangents=this.settings.inTangents,e.outTangents=this.settings.outTangents),e}setInterpolation(t){let e;switch(t){case cr:e=this.InterpolantFactoryMethodDiscrete;break;case zo:e=this.InterpolantFactoryMethodLinear;break;case Po:e=this.InterpolantFactoryMethodSmooth;break;case Yl:e=this.InterpolantFactoryMethodBezier;break}if(e===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return Jt("KeyframeTrack:",n),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return cr;case this.InterpolantFactoryMethodLinear:return zo;case this.InterpolantFactoryMethodSmooth:return Po;case this.InterpolantFactoryMethodBezier:return Yl}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]+=t}return this}scale(t){if(t!==1){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]*=t;Xl(this.settings)&&(Hh(this.settings.inTangents,t),Hh(this.settings.outTangents,t))}return this}trim(t,e){let n=this.times,s=n.length,r=0,o=s-1;for(;r!==s&&n[r]<t;)++r;for(;o!==-1&&n[o]>e;)--o;if(++o,r!==0||o!==s){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=n.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(Qt("KeyframeTrack: Invalid value size in track.",this),t=!1);let n=this.times,s=this.values,r=n.length;r===0&&(Qt("KeyframeTrack: Track is empty.",this),t=!1);let o=null;for(let a=0;a!==r;a++){let l=n[a];if(typeof l=="number"&&isNaN(l)){Qt("KeyframeTrack: Time is not a valid number.",this,a,l),t=!1;break}if(o!==null&&o>l){Qt("KeyframeTrack: Out of order keys.",this,a,l,o),t=!1;break}o=l}if(s!==void 0&&qd(s))for(let a=0,l=s.length;a!==l;++a){let c=s[a];if(isNaN(c)){Qt("KeyframeTrack: Value is not a valid number.",this,a,c),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===Po,r=t.length-1,o=1;for(let a=1;a<r;++a){let l=!1,c=t[a],h=t[a+1];if(c!==h&&(a!==1||c!==t[0]))if(s)l=!0;else{let u=a*n,d=u-n,f=u+n;for(let g=0;g!==n;++g){let x=e[u+g];if(x!==e[d+g]||x!==e[f+g]){l=!0;break}}}if(l){if(a!==o){t[o]=t[a];let u=a*n,d=o*n;for(let f=0;f!==n;++f)e[d+f]=e[u+f]}++o}}if(r>0){t[o]=t[r];for(let a=r*n,l=o*n,c=0;c!==n;++c)e[l+c]=e[a+c];++o}return o!==t.length?(this.times=t.slice(0,o),this.values=e.slice(0,o*n)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),n=this.constructor,s=new n(this.name,t,e);return s.createInterpolant=this.createInterpolant,Xl(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};function Hh(i,t){for(let e=0,n=i.length;e!==n;e+=2)i[e]*=t}mn.prototype.ValueTypeName="";mn.prototype.TimeBufferType=Float32Array;mn.prototype.ValueBufferType=Float32Array;mn.prototype.DefaultInterpolation=zo;var bi=class extends mn{constructor(t,e,n){super(t,e,n)}};bi.prototype.ValueTypeName="bool";bi.prototype.ValueBufferType=Array;bi.prototype.DefaultInterpolation=cr;bi.prototype.InterpolantFactoryMethodLinear=void 0;bi.prototype.InterpolantFactoryMethodSmooth=void 0;var ra=class extends mn{constructor(t,e,n,s){super(t,e,n,s)}};ra.prototype.ValueTypeName="color";var oa=class extends mn{constructor(t,e,n,s){super(t,e,n,s)}};oa.prototype.ValueTypeName="number";var aa=class extends vi{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(n-e)/(s-e),c=t*a;for(let h=c+a;c!==h;c+=4)dn.slerpFlat(r,0,o,c-a,o,c,l);return r}},Dr=class extends mn{constructor(t,e,n,s){super(t,e,n,s)}InterpolantFactoryMethodLinear(t){return new aa(this.times,this.values,this.getValueSize(),t)}};Dr.prototype.ValueTypeName="quaternion";Dr.prototype.InterpolantFactoryMethodSmooth=void 0;var Si=class extends mn{constructor(t,e,n){super(t,e,n)}};Si.prototype.ValueTypeName="string";Si.prototype.ValueBufferType=Array;Si.prototype.DefaultInterpolation=cr;Si.prototype.InterpolantFactoryMethodLinear=void 0;Si.prototype.InterpolantFactoryMethodSmooth=void 0;var la=class extends mn{constructor(t,e,n,s){super(t,e,n,s)}};la.prototype.ValueTypeName="vector";var ca=class{constructor(t,e,n){let s=this,r=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=n,this._abortController=null,this.itemStart=function(h){a++,r===!1&&s.onStart!==void 0&&s.onStart(h,o,a),r=!0},this.itemEnd=function(h){o++,s.onProgress!==void 0&&s.onProgress(h,o,a),o===a&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){let u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,d=c.length;u<d;u+=2){let f=c[u],g=c[u+1];if(f.global&&(f.lastIndex=0),f.test(h))return g}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},Fu=new ca,ha=class{constructor(t){this.manager=t!==void 0?t:Fu,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__!="undefined"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(t,e){let n=this;return new Promise(function(s,r){n.load(t,s,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}abort(){return this}};ha.DEFAULT_MATERIAL_NAME="__DEFAULT";var qi=class extends De{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new $t(t),this.intensity=e}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,e}},Nr=class extends qi{constructor(t,e,n){super(t,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(De.DEFAULT_UP),this.updateMatrix(),this.groundColor=new $t(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}toJSON(t){let e=super.toJSON(t);return e.object.groundColor=this.groundColor.getHex(),e}},ql=new xe,Vh=new D,Gh=new D,Ls=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new ct(512,512),this.mapType=rn,this.map=null,this.mapPass=null,this.matrix=new xe,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new As,this._frameExtents=new ct(1,1),this._viewportCount=1,this._viewports=[new Ee(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera;Vh.setFromMatrixPosition(t.matrixWorld),e.position.copy(Vh),Gh.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(Gh),e.updateMatrixWorld(),this._updateMatrix(e,this.matrix,this._frustum)}_updateMatrix(t,e,n,s){ql.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),n.setFromProjectionMatrix(ql,t.coordinateSystem,t.reversedDepth);let r=this._frameExtents,o=s?s.z/r.x:1,a=s?s.w/r.y:1,l=s?s.x/r.x:0,c=s?s.y/r.y:0;t.coordinateSystem===bs||t.reversedDepth?e.set(.5*o,0,0,.5*o+l,0,.5*a,0,.5*a+c,0,0,1,0,0,0,0,1):e.set(.5*o,0,0,.5*o+l,0,.5*a,0,.5*a+c,0,0,.5,.5,0,0,0,1),e.multiply(ql)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return t.intensity=this.intensity,t.bias=this.bias,t.normalBias=this.normalBias,t.radius=this.radius,t.blurSamples=this.blurSamples,t.mapSize=this.mapSize.toArray(),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}},Ro=new D,Co=new dn,Bn=new D,Ur=class extends De{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new xe,this.projectionMatrix=new xe,this.projectionMatrixInverse=new xe,this.coordinateSystem=Pn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose(Ro,Co,Bn),Bn.x===1&&Bn.y===1&&Bn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ro,Co,Bn.set(1,1,1)).invert()}updateWorldMatrix(t,e,n=!1){super.updateWorldMatrix(t,e,n),this.matrixWorld.decompose(Ro,Co,Bn),Bn.x===1&&Bn.y===1&&Bn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ro,Co,Bn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},mi=new D,Wh=new ct,Xh=new ct,He=class extends Ur{constructor(t=50,e=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=Gi*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(rr*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return Gi*2*Math.atan(Math.tan(rr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){mi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(mi.x,mi.y).multiplyScalar(-t/mi.z),mi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(mi.x,mi.y).multiplyScalar(-t/mi.z)}getViewSize(t,e){return this.getViewBounds(t,Wh,Xh),e.subVectors(Xh,Wh)}setViewOffset(t,e,n,s,r,o){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(rr*.5*this.fov)/this.zoom,n=2*e,s=this.aspect*n,r=-.5*s,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*s/l,e-=o.offsetY*n/c,s*=o.width/l,n*=o.height/c}let a=this.filmOffset;a!==0&&(r+=t*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-n,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}},ec=class extends Ls{constructor(){super(new He(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(t){let e=this.camera,n=Gi*2*t.angle*this.focus,s=this.mapSize.width/this.mapSize.height*this.aspect,r=t.distance||e.far;(n!==e.fov||s!==e.aspect||r!==e.far)&&(e.fov=n,e.aspect=s,e.far=r,e.updateProjectionMatrix()),super.updateMatrices(t)}copy(t){return super.copy(t),this.focus=t.focus,this.aspect=t.aspect,this}toJSON(){let t=super.toJSON();return t.focus=this.focus,t.aspect=this.aspect,t}},Fr=class extends qi{constructor(t,e,n=0,s=Math.PI/3,r=0,o=2){super(t,e),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(De.DEFAULT_UP),this.updateMatrix(),this.target=new De,this.distance=n,this.angle=s,this.penumbra=r,this.decay=o,this.map=null,this.shadow=new ec}get power(){return this.intensity*Math.PI}set power(t){this.intensity=t/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.angle=t.angle,this.penumbra=t.penumbra,this.decay=t.decay,this.target=t.target.clone(),this.map=t.map,this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.distance=this.distance,e.object.angle=this.angle,e.object.decay=this.decay,e.object.penumbra=this.penumbra,e.object.target=this.target.uuid,this.map&&this.map.isTexture&&(e.object.map=this.map.toJSON(t).uuid),e.object.shadow=this.shadow.toJSON(),e}},nc=class extends Ls{constructor(){super(new He(90,1,.5,500)),this.isPointLightShadow=!0}},Or=class extends qi{constructor(t,e,n=0,s=2){super(t,e),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new nc}get power(){return this.intensity*4*Math.PI}set power(t){this.intensity=t/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.decay=t.decay,this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.distance=this.distance,e.object.decay=this.decay,e.object.shadow=this.shadow.toJSON(),e}},Ds=class extends Ur{constructor(t=-1,e=1,n=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-t,o=n+t,a=s+e,l=s-e;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=h*this.view.offsetY,l=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}},ic=class extends Ls{constructor(){super(new Ds(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Mi=class extends qi{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(De.DEFAULT_UP),this.updateMatrix(),this.target=new De,this.shadow=new ic}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.shadow=this.shadow.toJSON(),e.object.target=this.target.uuid,e}};var ms=-90,gs=1,ua=class extends De{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new He(ms,gs,t,e);s.layers=this.layers,this.add(s);let r=new He(ms,gs,t,e);r.layers=this.layers,this.add(r);let o=new He(ms,gs,t,e);o.layers=this.layers,this.add(o);let a=new He(ms,gs,t,e);a.layers=this.layers,this.add(a);let l=new He(ms,gs,t,e);l.layers=this.layers,this.add(l);let c=new He(ms,gs,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[n,s,r,o,a,l]=e;for(let c of e)this.remove(c);if(t===Pn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===bs)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[r,o,a,l,c,h]=this.children,u=t.getRenderTarget(),d=t.getActiveCubeFace(),f=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;let x=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let m=!1;t.isWebGLRenderer===!0?m=t.state.buffers.depth.getReversed():m=t.reversedDepthBuffer,t.setRenderTarget(n,0,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,r),t.setRenderTarget(n,1,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,o),t.setRenderTarget(n,2,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,a),t.setRenderTarget(n,3,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,l),t.setRenderTarget(n,4,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,c),n.texture.generateMipmaps=x,t.setRenderTarget(n,5,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,h),t.setRenderTarget(u,d,f),t.xr.enabled=g,n.texture.needsPMREMUpdate=!0}},da=class extends He{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}};var Ic="\\[\\]\\.:\\/",op=new RegExp("["+Ic+"]","g"),Lc="[^"+Ic+"]",ap="[^"+Ic.replace("\\.","")+"]",lp=/((?:WC+[\/:])*)/.source.replace("WC",Lc),cp=/(WCOD+)?/.source.replace("WCOD",ap),hp=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Lc),up=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Lc),dp=new RegExp("^"+lp+cp+hp+up+"$"),fp=["material","materials","bones","map"],sc=class{constructor(t,e,n){let s=n||Me.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,s)}getValue(t,e){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(t,e)}setValue(t,e){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].unbind()}},Me=class i{constructor(t,e,n){this.path=e,this.parsedPath=n||i.parseTrackName(e),this.node=i.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,n){return t&&t.isAnimationObjectGroup?new i.Composite(t,e,n):new i(t,e,n)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(op,"")}static parseTrackName(t){let e=dp.exec(t);if(e===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let n={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);fp.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return n}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let n=t.skeleton.getBoneByName(e);if(n!==void 0)return n}if(t.children){let n=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===e||a.uuid===e)return a;let l=n(a.children);if(l)return l}return null},s=n(t.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)t[e++]=n[s]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,n=e.objectName,s=e.propertyName,r=e.propertyIndex;if(t||(t=i.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){Jt("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=e.objectIndex;switch(n){case"materials":if(!t.material){Qt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){Qt("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){Qt("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let h=0;h<t.length;h++)if(t[h].name===c){c=h;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){Qt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){Qt("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[n]===void 0){Qt("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[n]}if(c!==void 0){if(t[c]===void 0){Qt("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[c]}}let o=t[s];if(o===void 0){let c=e.nodeName;Qt("PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",t);return}let a=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?a=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!t.geometry){Qt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){Qt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[r]!==void 0&&(r=t.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Me.Composite=sc;Me.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Me.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Me.prototype.GetterByBindingType=[Me.prototype._getValue_direct,Me.prototype._getValue_array,Me.prototype._getValue_arrayElement,Me.prototype._getValue_toArray];Me.prototype.SetterByBindingTypeAndVersioning=[[Me.prototype._setValue_direct,Me.prototype._setValue_direct_setNeedsUpdate,Me.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Me.prototype._setValue_array,Me.prototype._setValue_array_setNeedsUpdate,Me.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Me.prototype._setValue_arrayElement,Me.prototype._setValue_arrayElement_setNeedsUpdate,Me.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Me.prototype._setValue_fromArray,Me.prototype._setValue_fromArray_setNeedsUpdate,Me.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var ny=new Float32Array(1);var Br=class{constructor(t=!0){this.autoStart=t,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1,Jt("Clock: This module has been deprecated. Please use THREE.Timer instead.")}start(){this.startTime=performance.now(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let t=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){let e=performance.now();t=(e-this.oldTime)/1e3,this.oldTime=e,this.elapsedTime+=t}return t}},Ns=class{constructor(t=1,e=0,n=0){this.radius=t,this.phi=e,this.theta=n}set(t,e,n){return this.radius=t,this.phi=e,this.theta=n,this}copy(t){return this.radius=t.radius,this.phi=t.phi,this.theta=t.theta,this}makeSafe(){return this.phi=se(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(t){return this.setFromCartesianCoords(t.x,t.y,t.z)}setFromCartesianCoords(t,e,n){return this.radius=Math.sqrt(t*t+e*e+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(t,n),this.phi=Math.acos(se(e/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}};var Bc=class Bc{constructor(t,e,n,s){this.elements=[1,0,0,1],t!==void 0&&this.set(t,e,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(t,e=0){for(let n=0;n<4;n++)this.elements[n]=t[n+e];return this}set(t,e,n,s){let r=this.elements;return r[0]=t,r[2]=e,r[1]=n,r[3]=s,this}};Bc.prototype.isMatrix2=!0;var rc=Bc;var kr=class extends In{constructor(t,e=null){super(),this.object=t,this.domElement=e,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(t){this.domElement!==null&&this.disconnect(),this.domElement=t}disconnect(){}dispose(){}update(){}};function Dc(i,t,e,n){let s=pp(n);switch(e){case Mc:return i*t;case ba:return i*t/s.components*s.byteLength;case Sa:return i*t/s.components*s.byteLength;case Pi:return i*t*2/s.components*s.byteLength;case Ma:return i*t*2/s.components*s.byteLength;case Ec:return i*t*3/s.components*s.byteLength;case Mn:return i*t*4/s.components*s.byteLength;case Ea:return i*t*4/s.components*s.byteLength;case Wr:case Xr:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case qr:case Yr:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case wa:case Ra:return Math.max(i,16)*Math.max(t,8)/4;case Ta:case Aa:return Math.max(i,8)*Math.max(t,8)/2;case Ca:case Pa:case La:case Da:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case Ia:case Zr:case Na:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Ua:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Fa:return Math.floor((i+4)/5)*Math.floor((t+3)/4)*16;case Oa:return Math.floor((i+4)/5)*Math.floor((t+4)/5)*16;case Ba:return Math.floor((i+5)/6)*Math.floor((t+4)/5)*16;case ka:return Math.floor((i+5)/6)*Math.floor((t+5)/6)*16;case za:return Math.floor((i+7)/8)*Math.floor((t+4)/5)*16;case Ha:return Math.floor((i+7)/8)*Math.floor((t+5)/6)*16;case Va:return Math.floor((i+7)/8)*Math.floor((t+7)/8)*16;case Ga:return Math.floor((i+9)/10)*Math.floor((t+4)/5)*16;case Wa:return Math.floor((i+9)/10)*Math.floor((t+5)/6)*16;case Xa:return Math.floor((i+9)/10)*Math.floor((t+7)/8)*16;case qa:return Math.floor((i+9)/10)*Math.floor((t+9)/10)*16;case Ya:return Math.floor((i+11)/12)*Math.floor((t+9)/10)*16;case Za:return Math.floor((i+11)/12)*Math.floor((t+11)/12)*16;case Ja:case $a:case Ka:return Math.ceil(i/4)*Math.ceil(t/4)*16;case ja:case Qa:return Math.ceil(i/4)*Math.ceil(t/4)*8;case Jr:case tl:return Math.ceil(i/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function pp(i){switch(i){case rn:case yc:return{byteLength:1,components:1};case Bs:case vc:case Nn:return{byteLength:2,components:1};case ya:case va:return{byteLength:2,components:4};case Dn:case xa:case Sn:return{byteLength:4,components:1};case bc:case Sc:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__!="undefined"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window!="undefined"&&(window.__THREE__?Jt("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function sd(){let i=null,t=!1,e=null,n=null;function s(r,o){n=i.requestAnimationFrame(s),e(r,o)}return{start:function(){t!==!0&&e!==null&&i!==null&&(n=i.requestAnimationFrame(s),t=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){i=r}}}function gp(i){let t=new WeakMap;function e(a,l){let c=a.array,h=a.usage,u=c.byteLength,d=i.createBuffer();i.bindBuffer(l,d),i.bufferData(l,c,h),a.onUploadCallback();let f;if(c instanceof Float32Array)f=i.FLOAT;else if(typeof Float16Array!="undefined"&&c instanceof Float16Array)f=i.HALF_FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?f=i.HALF_FLOAT:f=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=i.SHORT;else if(c instanceof Uint32Array)f=i.UNSIGNED_INT;else if(c instanceof Int32Array)f=i.INT;else if(c instanceof Int8Array)f=i.BYTE;else if(c instanceof Uint8Array)f=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:u}}function n(a,l,c){let h=l.array,u=l.updateRanges;if(i.bindBuffer(c,a),u.length===0)i.bufferSubData(c,0,h);else{u.sort((f,g)=>f.start-g.start);let d=0;for(let f=1;f<u.length;f++){let g=u[d],x=u[f];x.start<=g.start+g.count+1?g.count=Math.max(g.count,x.start+x.count-g.start):(++d,u[d]=x)}u.length=d+1;for(let f=0,g=u.length;f<g;f++){let x=u[f];i.bufferSubData(c,x.start*h.BYTES_PER_ELEMENT,h,x.start,x.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),t.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);let l=t.get(a);l&&(i.deleteBuffer(l.buffer),t.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let h=t.get(a);(!h||h.version<a.version)&&t.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let c=t.get(a);if(c===void 0)t.set(a,e(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,a,l),c.version=a.version}}return{get:s,remove:r,update:o}}var _p=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,xp=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,yp=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,vp=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,bp=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Sp=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Mp=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Ep=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Tp=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,wp=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Ap=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Rp=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Cp=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Pp=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Ip=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Lp=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Dp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Np=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Up=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Fp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,Op=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Bp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,kp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,zp=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Hp=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Vp=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,Gp=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Wp=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Xp=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,qp=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Yp="gl_FragColor = linearToOutputTexel( gl_FragColor );",Zp=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Jp=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,$p=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,Kp=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,jp=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Qp=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,t0=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,e0=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,n0=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,i0=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,s0=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,r0=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,o0=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,a0=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,l0=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,c0=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,h0=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,u0=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,d0=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,f0=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,p0=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,m0=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,g0=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,_0=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,x0=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,y0=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,v0=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,b0=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,S0=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,M0=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,E0=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,T0=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,w0=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,A0=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,R0=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,C0=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,P0=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,I0=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,L0=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,D0=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,N0=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,U0=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,F0=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,O0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,B0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,k0=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,z0=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,H0=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,V0=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,G0=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,W0=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,X0=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,q0=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,Y0=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Z0=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,J0=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,$0=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,K0=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,j0=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Q0=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,tm=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,em=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,nm=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,im=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,sm=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,rm=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,om=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,am=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,lm=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,cm=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,hm=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,um=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,dm=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,fm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,pm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,mm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,gm=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,_m=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,xm=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,ym=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,vm=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,bm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Sm=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Mm=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Em=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Tm=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,wm=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,Am=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Rm=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Cm=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Pm=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Im=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Lm=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Dm=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Nm=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Um=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Fm=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Om=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Bm=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,km=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,zm=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Hm=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Vm=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Gm=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Wm=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Xm=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,qm=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Ym=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Zm=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Jm=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,$m=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,oe={alphahash_fragment:_p,alphahash_pars_fragment:xp,alphamap_fragment:yp,alphamap_pars_fragment:vp,alphatest_fragment:bp,alphatest_pars_fragment:Sp,aomap_fragment:Mp,aomap_pars_fragment:Ep,batching_pars_vertex:Tp,batching_vertex:wp,begin_vertex:Ap,beginnormal_vertex:Rp,bsdfs:Cp,iridescence_fragment:Pp,bumpmap_pars_fragment:Ip,clipping_planes_fragment:Lp,clipping_planes_pars_fragment:Dp,clipping_planes_pars_vertex:Np,clipping_planes_vertex:Up,color_fragment:Fp,color_pars_fragment:Op,color_pars_vertex:Bp,color_vertex:kp,common:zp,cube_uv_reflection_fragment:Hp,defaultnormal_vertex:Vp,displacementmap_pars_vertex:Gp,displacementmap_vertex:Wp,emissivemap_fragment:Xp,emissivemap_pars_fragment:qp,colorspace_fragment:Yp,colorspace_pars_fragment:Zp,envmap_fragment:Jp,envmap_common_pars_fragment:$p,envmap_pars_fragment:Kp,envmap_pars_vertex:jp,envmap_physical_pars_fragment:c0,envmap_vertex:Qp,fog_vertex:t0,fog_pars_vertex:e0,fog_fragment:n0,fog_pars_fragment:i0,gradientmap_pars_fragment:s0,lightmap_pars_fragment:r0,lights_lambert_fragment:o0,lights_lambert_pars_fragment:a0,lights_pars_begin:l0,lights_toon_fragment:h0,lights_toon_pars_fragment:u0,lights_phong_fragment:d0,lights_phong_pars_fragment:f0,lights_physical_fragment:p0,lights_physical_pars_fragment:m0,lights_fragment_begin:g0,lights_fragment_maps:_0,lights_fragment_end:x0,lightprobes_pars_fragment:y0,logdepthbuf_fragment:v0,logdepthbuf_pars_fragment:b0,logdepthbuf_pars_vertex:S0,logdepthbuf_vertex:M0,map_fragment:E0,map_pars_fragment:T0,map_particle_fragment:w0,map_particle_pars_fragment:A0,metalnessmap_fragment:R0,metalnessmap_pars_fragment:C0,morphinstance_vertex:P0,morphcolor_vertex:I0,morphnormal_vertex:L0,morphtarget_pars_vertex:D0,morphtarget_vertex:N0,normal_fragment_begin:U0,normal_fragment_maps:F0,normal_pars_fragment:O0,normal_pars_vertex:B0,normal_vertex:k0,normalmap_pars_fragment:z0,clearcoat_normal_fragment_begin:H0,clearcoat_normal_fragment_maps:V0,clearcoat_pars_fragment:G0,iridescence_pars_fragment:W0,opaque_fragment:X0,packing:q0,premultiplied_alpha_fragment:Y0,project_vertex:Z0,dithering_fragment:J0,dithering_pars_fragment:$0,roughnessmap_fragment:K0,roughnessmap_pars_fragment:j0,shadowmap_pars_fragment:Q0,shadowmap_pars_vertex:tm,shadowmap_vertex:em,shadowmask_pars_fragment:nm,skinbase_vertex:im,skinning_pars_vertex:sm,skinning_vertex:rm,skinnormal_vertex:om,specularmap_fragment:am,specularmap_pars_fragment:lm,tonemapping_fragment:cm,tonemapping_pars_fragment:hm,transmission_fragment:um,transmission_pars_fragment:dm,uv_pars_fragment:fm,uv_pars_vertex:pm,uv_vertex:mm,worldpos_vertex:gm,background_vert:_m,background_frag:xm,backgroundCube_vert:ym,backgroundCube_frag:vm,cube_vert:bm,cube_frag:Sm,depth_vert:Mm,depth_frag:Em,distance_vert:Tm,distance_frag:wm,equirect_vert:Am,equirect_frag:Rm,linedashed_vert:Cm,linedashed_frag:Pm,meshbasic_vert:Im,meshbasic_frag:Lm,meshlambert_vert:Dm,meshlambert_frag:Nm,meshmatcap_vert:Um,meshmatcap_frag:Fm,meshnormal_vert:Om,meshnormal_frag:Bm,meshphong_vert:km,meshphong_frag:zm,meshphysical_vert:Hm,meshphysical_frag:Vm,meshtoon_vert:Gm,meshtoon_frag:Wm,points_vert:Xm,points_frag:qm,shadow_vert:Ym,shadow_frag:Zm,sprite_vert:Jm,sprite_frag:$m},Ct={common:{diffuse:{value:new $t(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ne},alphaMap:{value:null},alphaMapTransform:{value:new ne},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ne}},envmap:{envMap:{value:null},envMapRotation:{value:new ne},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ne}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ne}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ne},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ne},normalScale:{value:new ct(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ne},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ne}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ne}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ne}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new $t(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new D},probesMax:{value:new D},probesResolution:{value:new D}},points:{diffuse:{value:new $t(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ne},alphaTest:{value:0},uvTransform:{value:new ne}},sprite:{diffuse:{value:new $t(16777215)},opacity:{value:1},center:{value:new ct(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ne},alphaMap:{value:null},alphaMapTransform:{value:new ne},alphaTest:{value:0}}},qn={basic:{uniforms:$e([Ct.common,Ct.specularmap,Ct.envmap,Ct.aomap,Ct.lightmap,Ct.fog]),vertexShader:oe.meshbasic_vert,fragmentShader:oe.meshbasic_frag},lambert:{uniforms:$e([Ct.common,Ct.specularmap,Ct.envmap,Ct.aomap,Ct.lightmap,Ct.emissivemap,Ct.bumpmap,Ct.normalmap,Ct.displacementmap,Ct.fog,Ct.lights,{emissive:{value:new $t(0)},envMapIntensity:{value:1}}]),vertexShader:oe.meshlambert_vert,fragmentShader:oe.meshlambert_frag},phong:{uniforms:$e([Ct.common,Ct.specularmap,Ct.envmap,Ct.aomap,Ct.lightmap,Ct.emissivemap,Ct.bumpmap,Ct.normalmap,Ct.displacementmap,Ct.fog,Ct.lights,{emissive:{value:new $t(0)},specular:{value:new $t(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:oe.meshphong_vert,fragmentShader:oe.meshphong_frag},standard:{uniforms:$e([Ct.common,Ct.envmap,Ct.aomap,Ct.lightmap,Ct.emissivemap,Ct.bumpmap,Ct.normalmap,Ct.displacementmap,Ct.roughnessmap,Ct.metalnessmap,Ct.fog,Ct.lights,{emissive:{value:new $t(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:oe.meshphysical_vert,fragmentShader:oe.meshphysical_frag},toon:{uniforms:$e([Ct.common,Ct.aomap,Ct.lightmap,Ct.emissivemap,Ct.bumpmap,Ct.normalmap,Ct.displacementmap,Ct.gradientmap,Ct.fog,Ct.lights,{emissive:{value:new $t(0)}}]),vertexShader:oe.meshtoon_vert,fragmentShader:oe.meshtoon_frag},matcap:{uniforms:$e([Ct.common,Ct.bumpmap,Ct.normalmap,Ct.displacementmap,Ct.fog,{matcap:{value:null}}]),vertexShader:oe.meshmatcap_vert,fragmentShader:oe.meshmatcap_frag},points:{uniforms:$e([Ct.points,Ct.fog]),vertexShader:oe.points_vert,fragmentShader:oe.points_frag},dashed:{uniforms:$e([Ct.common,Ct.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:oe.linedashed_vert,fragmentShader:oe.linedashed_frag},depth:{uniforms:$e([Ct.common,Ct.displacementmap]),vertexShader:oe.depth_vert,fragmentShader:oe.depth_frag},normal:{uniforms:$e([Ct.common,Ct.bumpmap,Ct.normalmap,Ct.displacementmap,{opacity:{value:1}}]),vertexShader:oe.meshnormal_vert,fragmentShader:oe.meshnormal_frag},sprite:{uniforms:$e([Ct.sprite,Ct.fog]),vertexShader:oe.sprite_vert,fragmentShader:oe.sprite_frag},background:{uniforms:{uvTransform:{value:new ne},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:oe.background_vert,fragmentShader:oe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ne}},vertexShader:oe.backgroundCube_vert,fragmentShader:oe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:oe.cube_vert,fragmentShader:oe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:oe.equirect_vert,fragmentShader:oe.equirect_frag},distance:{uniforms:$e([Ct.common,Ct.displacementmap,{referencePosition:{value:new D},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:oe.distance_vert,fragmentShader:oe.distance_frag},shadow:{uniforms:$e([Ct.lights,Ct.fog,{color:{value:new $t(0)},opacity:{value:1}}]),vertexShader:oe.shadow_vert,fragmentShader:oe.shadow_frag}};qn.physical={uniforms:$e([qn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ne},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ne},clearcoatNormalScale:{value:new ct(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ne},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ne},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ne},sheen:{value:0},sheenColor:{value:new $t(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ne},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ne},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ne},transmissionSamplerSize:{value:new ct},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ne},attenuationDistance:{value:0},attenuationColor:{value:new $t(0)},specularColor:{value:new $t(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ne},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ne},anisotropyVector:{value:new ct},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ne}}]),vertexShader:oe.meshphysical_vert,fragmentShader:oe.meshphysical_frag};var il={r:0,b:0,g:0},Km=new xe,rd=new ne;rd.set(-1,0,0,0,1,0,0,0,1);function jm(i,t,e,n,s,r){let o=new $t(0),a=s===!0?0:1,l,c,h=null,u=0,d=null;function f(b){let M=b.isScene===!0?b.background:null;if(M&&M.isTexture){let y=b.backgroundBlurriness>0;M=t.get(M,y)}return M}function g(b){let M=!1,y=f(b);y===null?m(o,a):y&&y.isColor&&(m(y,1),M=!0);let T=i.xr.getEnvironmentBlendMode();T==="additive"?e.buffers.color.setClear(0,0,0,1,r):T==="alpha-blend"&&e.buffers.color.setClear(0,0,0,0,r),(i.autoClear||M)&&(e.buffers.depth.setTest(!0),e.buffers.depth.setMask(!0),e.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function x(b,M){let y=f(M);y&&(y.isCubeTexture||y.mapping===Vr)?(c===void 0&&(c=new Lt(new sn(1,1,1),new pn({name:"BackgroundCubeMaterial",uniforms:$i(qn.backgroundCube.uniforms),vertexShader:qn.backgroundCube.vertexShader,fragmentShader:qn.backgroundCube.fragmentShader,side:Ue,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(T,S,R){this.matrixWorld.copyPosition(R.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=y,c.material.uniforms.backgroundBlurriness.value=M.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(Km.makeRotationFromEuler(M.backgroundRotation)).transpose(),y.isCubeTexture&&y.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(rd),c.material.toneMapped=le.getTransfer(y.colorSpace)!==fe,(h!==y||u!==y.version||d!==i.toneMapping)&&(c.material.needsUpdate=!0,h=y,u=y.version,d=i.toneMapping),c.layers.enableAll(),b.unshift(c,c.geometry,c.material,0,0,null)):y&&y.isTexture&&(l===void 0&&(l=new Lt(new bn(2,2),new pn({name:"BackgroundMaterial",uniforms:$i(qn.background.uniforms),vertexShader:qn.background.vertexShader,fragmentShader:qn.background.fragmentShader,side:wi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=y,l.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,l.material.toneMapped=le.getTransfer(y.colorSpace)!==fe,y.matrixAutoUpdate===!0&&y.updateMatrix(),l.material.uniforms.uvTransform.value.copy(y.matrix),(h!==y||u!==y.version||d!==i.toneMapping)&&(l.material.needsUpdate=!0,h=y,u=y.version,d=i.toneMapping),l.layers.enableAll(),b.unshift(l,l.geometry,l.material,0,0,null))}function m(b,M){b.getRGB(il,Pc(i)),e.buffers.color.setClear(il.r,il.g,il.b,M,r)}function p(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return o},setClearColor:function(b,M=1){o.set(b),a=M,m(o,a)},getClearAlpha:function(){return a},setClearAlpha:function(b){a=b,m(o,a)},render:g,addToRenderList:x,dispose:p}}function Qm(i,t){let e=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=d(null),r=s,o=!1;function a(I,A,U,L,k){let W=!1,z=u(I,L,U,A);r!==z&&(r=z,c(r.object)),W=f(I,L,U,k),W&&g(I,L,U,k),k!==null&&t.update(k,i.ELEMENT_ARRAY_BUFFER),(W||o)&&(o=!1,y(I,A,U,L),k!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(k).buffer))}function l(){return i.createVertexArray()}function c(I){return i.bindVertexArray(I)}function h(I){return i.deleteVertexArray(I)}function u(I,A,U,L){let k=L.wireframe===!0,W=n[A.id];W===void 0&&(W={},n[A.id]=W);let z=I.isInstancedMesh===!0?I.id:0,Q=W[z];Q===void 0&&(Q={},W[z]=Q);let N=Q[U.id];N===void 0&&(N={},Q[U.id]=N);let V=N[k];return V===void 0&&(V=d(l()),N[k]=V),V}function d(I){let A=[],U=[],L=[];for(let k=0;k<e;k++)A[k]=0,U[k]=0,L[k]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:A,enabledAttributes:U,attributeDivisors:L,object:I,attributes:{},index:null}}function f(I,A,U,L){let k=r.attributes,W=A.attributes,z=0,Q=U.getAttributes();for(let N in Q)if(Q[N].location>=0){let Y=k[N],yt=W[N];if(yt===void 0&&(N==="instanceMatrix"&&I.instanceMatrix&&(yt=I.instanceMatrix),N==="instanceColor"&&I.instanceColor&&(yt=I.instanceColor)),Y===void 0||Y.attribute!==yt||yt&&Y.data!==yt.data)return!0;z++}return r.attributesNum!==z||r.index!==L}function g(I,A,U,L){let k={},W=A.attributes,z=0,Q=U.getAttributes();for(let N in Q)if(Q[N].location>=0){let Y=W[N];Y===void 0&&(N==="instanceMatrix"&&I.instanceMatrix&&(Y=I.instanceMatrix),N==="instanceColor"&&I.instanceColor&&(Y=I.instanceColor));let yt={};yt.attribute=Y,Y&&Y.data&&(yt.data=Y.data),k[N]=yt,z++}r.attributes=k,r.attributesNum=z,r.index=L}function x(){let I=r.newAttributes;for(let A=0,U=I.length;A<U;A++)I[A]=0}function m(I){p(I,0)}function p(I,A){let U=r.newAttributes,L=r.enabledAttributes,k=r.attributeDivisors;U[I]=1,L[I]===0&&(i.enableVertexAttribArray(I),L[I]=1),k[I]!==A&&(i.vertexAttribDivisor(I,A),k[I]=A)}function b(){let I=r.newAttributes,A=r.enabledAttributes;for(let U=0,L=A.length;U<L;U++)A[U]!==I[U]&&(i.disableVertexAttribArray(U),A[U]=0)}function M(I,A,U,L,k,W,z){z===!0?i.vertexAttribIPointer(I,A,U,k,W):i.vertexAttribPointer(I,A,U,L,k,W)}function y(I,A,U,L){x();let k=L.attributes,W=U.getAttributes(),z=A.defaultAttributeValues;for(let Q in W){let N=W[Q];if(N.location>=0){let V=k[Q];if(V===void 0&&(Q==="instanceMatrix"&&I.instanceMatrix&&(V=I.instanceMatrix),Q==="instanceColor"&&I.instanceColor&&(V=I.instanceColor)),V!==void 0){let Y=V.normalized,yt=V.itemSize,_t=t.get(V);if(_t===void 0)continue;let te=_t.buffer,qt=_t.type,Kt=_t.bytesPerElement,et=qt===i.INT||qt===i.UNSIGNED_INT||V.gpuType===xa;if(V.isInterleavedBufferAttribute){let st=V.data,St=st.stride,wt=V.offset;if(st.isInstancedInterleavedBuffer){for(let Mt=0;Mt<N.locationSize;Mt++)p(N.location+Mt,st.meshPerAttribute);I.isInstancedMesh!==!0&&L._maxInstanceCount===void 0&&(L._maxInstanceCount=st.meshPerAttribute*st.count)}else for(let Mt=0;Mt<N.locationSize;Mt++)m(N.location+Mt);i.bindBuffer(i.ARRAY_BUFFER,te);for(let Mt=0;Mt<N.locationSize;Mt++)M(N.location+Mt,yt/N.locationSize,qt,Y,St*Kt,(wt+yt/N.locationSize*Mt)*Kt,et)}else{if(V.isInstancedBufferAttribute){for(let st=0;st<N.locationSize;st++)p(N.location+st,V.meshPerAttribute);I.isInstancedMesh!==!0&&L._maxInstanceCount===void 0&&(L._maxInstanceCount=V.meshPerAttribute*V.count)}else for(let st=0;st<N.locationSize;st++)m(N.location+st);i.bindBuffer(i.ARRAY_BUFFER,te);for(let st=0;st<N.locationSize;st++)M(N.location+st,yt/N.locationSize,qt,Y,yt*Kt,yt/N.locationSize*st*Kt,et)}}else if(z!==void 0){let Y=z[Q];if(Y!==void 0)switch(Y.length){case 2:i.vertexAttrib2fv(N.location,Y);break;case 3:i.vertexAttrib3fv(N.location,Y);break;case 4:i.vertexAttrib4fv(N.location,Y);break;default:i.vertexAttrib1fv(N.location,Y)}}}}b()}function T(){w();for(let I in n){let A=n[I];for(let U in A){let L=A[U];for(let k in L){let W=L[k];for(let z in W)h(W[z].object),delete W[z];delete L[k]}}delete n[I]}}function S(I){if(n[I.id]===void 0)return;let A=n[I.id];for(let U in A){let L=A[U];for(let k in L){let W=L[k];for(let z in W)h(W[z].object),delete W[z];delete L[k]}}delete n[I.id]}function R(I){for(let A in n){let U=n[A];for(let L in U){let k=U[L];if(k[I.id]===void 0)continue;let W=k[I.id];for(let z in W)h(W[z].object),delete W[z];delete k[I.id]}}}function _(I){for(let A in n){let U=n[A],L=I.isInstancedMesh===!0?I.id:0,k=U[L];if(k!==void 0){for(let W in k){let z=k[W];for(let Q in z)h(z[Q].object),delete z[Q];delete k[W]}delete U[L],Object.keys(U).length===0&&delete n[A]}}}function w(){P(),o=!0,r!==s&&(r=s,c(r.object))}function P(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:w,resetDefaultState:P,dispose:T,releaseStatesOfGeometry:S,releaseStatesOfObject:_,releaseStatesOfProgram:R,initAttributes:x,enableAttribute:m,disableUnusedAttributes:b}}function tg(i,t,e){let n;function s(l){n=l}function r(l,c){i.drawArrays(n,l,c),e.update(c,n,1)}function o(l,c,h){h!==0&&(i.drawArraysInstanced(n,l,c,h),e.update(c,n,h))}function a(l,c,h){if(h===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,h);let d=0;for(let f=0;f<h;f++)d+=c[f];e.update(d,n,1)}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a}function eg(i,t,e,n){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){let R=t.get("EXT_texture_filter_anisotropic");s=i.getParameter(R.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(R){return!(R!==Mn&&n.convert(R)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(R){let _=R===Nn&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(R!==rn&&R!==Sn&&!_&&n.convert(R)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function l(R){if(R==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";R="mediump"}return R==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp",h=l(c);h!==c&&(Jt("WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let u=e.logarithmicDepthBuffer===!0,d=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control");e.reversedDepthBuffer===!0&&d===!1&&Jt("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let f=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),x=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),p=i.getParameter(i.MAX_VERTEX_ATTRIBS),b=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),M=i.getParameter(i.MAX_VARYING_VECTORS),y=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),T=i.getParameter(i.MAX_SAMPLES),S=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:u,reversedDepthBuffer:d,maxTextures:f,maxVertexTextures:g,maxTextureSize:x,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:b,maxVaryings:M,maxFragmentUniforms:y,maxSamples:T,samples:S}}function ng(i){let t=this,e=null,n=0,s=!1,r=!1,o=new hn,a=new ne,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){let f=u.length!==0||d||n!==0||s;return s=d,n=u.length,f},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,d){e=h(u,d,0)},this.setState=function(u,d,f){let g=u.clippingPlanes,x=u.clipIntersection,m=u.clipShadows,p=i.get(u);if(!s||g===null||g.length===0||r&&!m)r?h(null):c();else{let b=r?0:n,M=b*4,y=p.clippingState||null;l.value=y,y=h(g,d,M,f);for(let T=0;T!==M;++T)y[T]=e[T];p.clippingState=y,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=b}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function h(u,d,f,g){let x=u!==null?u.length:0,m=null;if(x!==0){if(m=l.value,g!==!0||m===null){let p=f+x*4,b=d.matrixWorldInverse;a.getNormalMatrix(b),(m===null||m.length<p)&&(m=new Float32Array(p));for(let M=0,y=f;M!==x;++M,y+=4)o.copy(u[M]).applyMatrix4(b,a),o.normal.toArray(m,y),m[y+3]=o.constant}l.value=m,l.needsUpdate=!0}return t.numPlanes=x,t.numIntersection=0,m}}var Hs=4,ig=6,sg=20,rg=256,Kr=new Ds,Ou=new $t,kc=null,zc=0,Hc=0,Vc=!1,og=new D,Ki=new D,Gs=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(t,e=0,n=.1,s=100,r={}){let{size:o=256,position:a=og}=r;kc=this._renderer.getRenderTarget(),zc=this._renderer.getActiveCubeFace(),Hc=this._renderer.getActiveMipmapLevel(),Vc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(t,n,s,l,a),e>0&&this._blur(l,0,0,e),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=zu(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=ku(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodMeshes.length;t++)this._lodMeshes[t].geometry.dispose()}_cleanup(t){this._renderer.setRenderTarget(kc,zc,Hc),this._renderer.xr.enabled=Vc,t.scissorTest=!1,zs(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===Ai||t.mapping===Zi?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),kc=this._renderer.getRenderTarget(),zc=this._renderer.getActiveCubeFace(),Hc=this._renderer.getActiveMipmapLevel(),Vc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:Xe,minFilter:Xe,generateMipmaps:!1,type:Nn,format:Mn,colorSpace:hr,depthBuffer:!1},s=Bu(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Bu(t,e,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=ag(r)),this._blurMaterial=cg(r,t,e),this._ggxMaterial=lg(r,t,e)}return s}_compileMaterial(t){let e=new Lt(new Ne,t);this._renderer.compile(e,Kr)}_sceneToCubeUV(t,e,n,s,r){let l=new He(90,1,e,n),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],u=this._renderer,d=u.autoClear,f=u.toneMapping;u.getClearColor(Ou),u.toneMapping=Ln,u.autoClear=!1,u.state.buffers.depth.getReversed()&&(u.setRenderTarget(s),u.clearDepth(),u.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new Lt(new sn,new si({name:"PMREM.Background",side:Ue,depthWrite:!1,depthTest:!1})));let x=this._backgroundBox,m=x.material,p=!1,b=t.background;b?b.isColor&&(m.color.copy(b),t.background=null,p=!0):(m.color.copy(Ou),p=!0);for(let M=0;M<6;M++){let y=M%3;y===0?(l.up.set(0,c[M],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+h[M],r.y,r.z)):y===1?(l.up.set(0,0,c[M]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+h[M],r.z)):(l.up.set(0,c[M],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+h[M]));let T=this._cubeSize;zs(s,y*T,M>2?T:0,T,T),u.setRenderTarget(s),p&&u.render(x,l),u.render(t,l)}u.toneMapping=f,u.autoClear=d,t.background=b}_textureToCubeUV(t,e){let n=this._renderer,s=t.mapping===Ai||t.mapping===Zi;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=zu()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=ku());let r=s?this._cubemapMaterial:this._equirectMaterial,o=this._lodMeshes[0];o.material=r;let a=r.uniforms;a.envMap.value=t;let l=this._cubeSize;zs(e,0,0,3*l,2*l),n.setRenderTarget(e),n.render(o,Kr)}_applyPMREM(t){let e=this._renderer,n=e.autoClear;e.autoClear=!1;let s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(t,r-1,r);e.autoClear=n}_applyGGXFilter(t,e,n){let s=this._renderer,r=this._pingPongRenderTarget,o=this._ggxMaterial,a=this._lodMeshes[n];a.material=o;let l=o.uniforms,c=n/(this._lodMeshes.length-1),h=e/(this._lodMeshes.length-1),u=Math.sqrt(c*c-h*h),d=c*1.25,f=u*d,{_lodMax:g}=this,x=this._sizeLods[n],m=3*x*(n>g-Hs?n-g+Hs:0),p=4*(this._cubeSize-x);l.envMap.value=t.texture,l.roughness.value=f,l.mipInt.value=g-e,zs(r,m,p,3*x,2*x),s.setRenderTarget(r),s.render(a,Kr),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=g-n,zs(t,m,p,3*x,2*x),s.setRenderTarget(t),s.render(a,Kr)}_blur(t,e,n,s){let r=this._pingPongRenderTarget,o=Math.min(s,Math.PI)/Math.SQRT2;this._blurPass(t,r,e,n,o),this._blurPass(r,t,n,n,o)}_blurPass(t,e,n,s,r){let o=this._renderer,a=this._blurMaterial,l=this._lodMeshes[s];l.material=a;let c=a.uniforms;c.envMap.value=t.texture,c.sigma.value=r,c.mipInt.value=this._lodMax-n;let h=this._sizeLods[s],u=3*h*(s>this._lodMax-Hs?s-this._lodMax+Hs:0),d=4*(this._cubeSize-h);zs(e,u,d,3*h,2*h),o.setRenderTarget(e),o.render(l,Kr)}};function ag(i){let t=[],e=[],n=i,s=i-Hs+1+ig;for(let r=0;r<s;r++){let o=Math.pow(2,n);t.push(o);let a=1/(o-2),l=-a,c=1+a,h=[l,l,c,l,c,c,l,l,c,c,l,c],u=6,d=6,f=3,g=new Float32Array(f*d*u),x=new Float32Array(f*d*u);for(let p=0;p<u;p++){let b=p%3*2/3-1,M=p>2?0:-1,y=[b,M,0,b+2/3,M,0,b+2/3,M+1,0,b,M,0,b+2/3,M+1,0,b,M+1,0];g.set(y,f*d*p);for(let T=0;T<d;T++){let S=h[T*2]*2-1,R=h[T*2+1]*2-1;p===0?Ki.set(1,R,S):p===1?Ki.set(-S,1,-R):p===2?Ki.set(-S,R,1):p===3?Ki.set(-1,R,-S):p===4?Ki.set(-S,-1,R):Ki.set(S,R,-1),Ki.toArray(x,(p*d+T)*f)}}let m=new Ne;m.setAttribute("position",new un(g,f)),m.setAttribute("outputDirection",new un(x,f)),e.push(new Lt(m,null)),n>Hs&&n--}return{lodMeshes:e,sizeLods:t}}function Bu(i,t,e){let n=new nn(i,t,e);return n.texture.mapping=Vr,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function zs(i,t,e,n,s){i.viewport.set(t,e,n,s),i.scissor.set(t,e,n,s)}function lg(i,t,e){return new pn({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:rg,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:al(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:Wn,depthTest:!1,depthWrite:!1})}function cg(i,t,e){return new pn({name:"SphericalGaussianBlur",defines:{SAMPLES:sg,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:al(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:Wn,depthTest:!1,depthWrite:!1})}function ku(){return new pn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:al(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Wn,depthTest:!1,depthWrite:!1})}function zu(){return new pn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:al(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Wn,depthTest:!1,depthWrite:!1})}function al(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var rl=class extends nn{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let n={width:t,height:t,depth:1},s=[n,n,n,n,n,n];this.texture=new vr(s),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new sn(5,5,5),r=new pn({name:"CubemapFromEquirect",uniforms:$i(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Ue,blending:Wn});r.uniforms.tEquirect.value=e;let o=new Lt(s,r),a=e.minFilter;return e.minFilter===Ri&&(e.minFilter=Xe),new ua(1,10,this).update(t,o),e.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(t,e=!0,n=!0,s=!0){let r=t.getRenderTarget();for(let o=0;o<6;o++)t.setRenderTarget(this,o),t.clear(e,n,s);t.setRenderTarget(r)}};function hg(i){let t=new WeakMap,e=new WeakMap,n=null;function s(d,f=!1){return d==null?null:f?o(d):r(d)}function r(d){if(d&&d.isTexture){let f=d.mapping;if(f===Os||f===ga)if(t.has(d)){let g=t.get(d).texture;return a(g,d.mapping)}else{let g=d.image;if(g&&g.height>0){let x=new rl(g.height);return x.fromEquirectangularTexture(i,d),t.set(d,x),d.addEventListener("dispose",c),a(x.texture,d.mapping)}else return null}}return d}function o(d){if(d&&d.isTexture){let f=d.mapping,g=f===Os||f===ga,x=f===Ai||f===Zi;if(g||x){let m=e.get(d),p=m!==void 0?m.texture.pmremVersion:0;if(d.isRenderTargetTexture&&d.pmremVersion!==p)return n===null&&(n=new Gs(i)),m=g?n.fromEquirectangular(d,m):n.fromCubemap(d,m),m.texture.pmremVersion=d.pmremVersion,e.set(d,m),m.texture;if(m!==void 0)return m.texture;{let b=d.image;return g&&b&&b.height>0||x&&b&&l(b)?(n===null&&(n=new Gs(i)),m=g?n.fromEquirectangular(d):n.fromCubemap(d),m.texture.pmremVersion=d.pmremVersion,e.set(d,m),d.addEventListener("dispose",h),m.texture):null}}}return d}function a(d,f){return f===Os?d.mapping=Ai:f===ga&&(d.mapping=Zi),d}function l(d){let f=0,g=6;for(let x=0;x<g;x++)d[x]!==void 0&&f++;return f===g}function c(d){let f=d.target;f.removeEventListener("dispose",c);let g=t.get(f);g!==void 0&&(t.delete(f),g.dispose())}function h(d){let f=d.target;f.removeEventListener("dispose",h);let g=e.get(f);g!==void 0&&(e.delete(f),g.dispose())}function u(){t=new WeakMap,e=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:u}}function ug(i){let t={};function e(n){if(t[n]!==void 0)return t[n];let s=i.getExtension(n);return t[n]=s,s}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){let s=e(n);return s===null&&Vi("WebGLRenderer: "+n+" extension not supported."),s}}}function dg(i,t,e,n){let s={},r=new WeakMap;function o(u){let d=u.target;d.index!==null&&t.remove(d.index);for(let g in d.attributes)t.remove(d.attributes[g]);d.removeEventListener("dispose",o),delete s[d.id];let f=r.get(d);f&&(t.remove(f),r.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,e.memory.geometries--}function a(u,d){return s[d.id]===!0||(d.addEventListener("dispose",o),s[d.id]=!0,e.memory.geometries++),d}function l(u){let d=u.attributes;for(let f in d)t.update(d[f],i.ARRAY_BUFFER)}function c(u){let d=[],f=u.index,g=u.attributes.position,x=0;if(g===void 0)return;if(f!==null){let b=f.array;x=f.version;for(let M=0,y=b.length;M<y;M+=3){let T=b[M+0],S=b[M+1],R=b[M+2];d.push(T,S,S,R,R,T)}}else{let b=g.array;x=g.version;for(let M=0,y=b.length/3-1;M<y;M+=3){let T=M+0,S=M+1,R=M+2;d.push(T,S,S,R,R,T)}}let m=new(g.count>=65535?gr:mr)(d,1);m.version=x;let p=r.get(u);p&&t.remove(p),r.set(u,m)}function h(u){let d=r.get(u);if(d){let f=u.index;f!==null&&d.version<f.version&&c(u)}else c(u);return r.get(u)}return{get:a,update:l,getWireframeAttribute:h}}function fg(i,t,e){let n;function s(u){n=u}let r,o;function a(u){r=u.type,o=u.bytesPerElement}function l(u,d){i.drawElements(n,d,r,u*o),e.update(d,n,1)}function c(u,d,f){f!==0&&(i.drawElementsInstanced(n,d,r,u*o,f),e.update(d,n,f))}function h(u,d,f){if(f===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,d,0,r,u,0,f);let x=0;for(let m=0;m<f;m++)x+=d[m];e.update(x,n,1)}this.setMode=s,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=h}function pg(i){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(e.calls++,o){case i.TRIANGLES:e.triangles+=a*(r/3);break;case i.LINES:e.lines+=a*(r/2);break;case i.LINE_STRIP:e.lines+=a*(r-1);break;case i.LINE_LOOP:e.lines+=a*r;break;case i.POINTS:e.points+=a*r;break;default:Qt("WebGLInfo: Unknown draw mode:",o);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:n}}function mg(i,t,e){let n=new WeakMap,s=new Ee;function r(o,a,l){let c=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,u=h!==void 0?h.length:0,d=n.get(a);if(d===void 0||d.count!==u){let w=function(){R.dispose(),n.delete(a),a.removeEventListener("dispose",w)};d!==void 0&&d.texture.dispose();let f=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,x=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],p=a.morphAttributes.normal||[],b=a.morphAttributes.color||[],M=0;f===!0&&(M=1),g===!0&&(M=2),x===!0&&(M=3);let y=a.attributes.position.count*M,T=1;y>t.maxTextureSize&&(T=Math.ceil(y/t.maxTextureSize),y=t.maxTextureSize);let S=new Float32Array(y*T*4*u),R=new fr(S,y,T,u);R.type=Sn,R.needsUpdate=!0;let _=M*4;for(let P=0;P<u;P++){let I=m[P],A=p[P],U=b[P],L=y*T*4*P;for(let k=0;k<I.count;k++){let W=k*_;f===!0&&(s.fromBufferAttribute(I,k),S[L+W+0]=s.x,S[L+W+1]=s.y,S[L+W+2]=s.z,S[L+W+3]=0),g===!0&&(s.fromBufferAttribute(A,k),S[L+W+4]=s.x,S[L+W+5]=s.y,S[L+W+6]=s.z,S[L+W+7]=0),x===!0&&(s.fromBufferAttribute(U,k),S[L+W+8]=s.x,S[L+W+9]=s.y,S[L+W+10]=s.z,S[L+W+11]=U.itemSize===4?s.w:1)}}d={count:u,texture:R,size:new ct(y,T)},n.set(a,d),a.addEventListener("dispose",w)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",o.morphTexture,e);else{let f=0;for(let x=0;x<c.length;x++)f+=c[x];let g=a.morphTargetsRelative?1:1-f;l.getUniforms().setValue(i,"morphTargetBaseInfluence",g),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",d.texture,e),l.getUniforms().setValue(i,"morphTargetsTextureSize",d.size)}return{update:r}}function gg(i,t,e,n,s){let r=new WeakMap;function o(c){let h=s.render.frame,u=c.geometry,d=t.get(c,u);if(r.get(d)!==h&&(t.update(d),r.set(d,h)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==h&&(e.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&e.update(c.instanceColor,i.ARRAY_BUFFER),r.set(c,h))),c.isSkinnedMesh){let f=c.skeleton;r.get(f)!==h&&(f.update(),r.set(f,h))}return d}function a(){r=new WeakMap}function l(c){let h=c.target;h.removeEventListener("dispose",l),n.releaseStatesOfObject(h),e.remove(h.instanceMatrix),h.instanceColor!==null&&e.remove(h.instanceColor)}return{update:o,dispose:a}}var _g={[dc]:"LINEAR_TONE_MAPPING",[fc]:"REINHARD_TONE_MAPPING",[pc]:"CINEON_TONE_MAPPING",[Hr]:"ACES_FILMIC_TONE_MAPPING",[gc]:"AGX_TONE_MAPPING",[_c]:"NEUTRAL_TONE_MAPPING",[mc]:"CUSTOM_TONE_MAPPING"};function xg(i,t,e,n,s,r){let o=new nn(t,e,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),a=null,l=null,c=new Ne;c.setAttribute("position",new he([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new he([0,2,0,0,2,0],2));let h=new jo({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),u=new Lt(c,h),d=new Ds(-1,1,1,-1,0,1),f=null,g=null,x=!1,m,p=null,b=[],M=!1;this.setSize=function(y,T){o.setSize(y,T),a!==null&&a.setSize(y,T),l!==null&&l.setSize(y,T);for(let S=0;S<b.length;S++){let R=b[S];R.setSize&&R.setSize(y,T)}},this.setEffects=function(y){b=y,M=b.length>0&&b[0].isRenderPass===!0;let T=o.width,S=o.height;b.length>0&&a===null&&(a=new nn(T,S,{type:Nn,depthBuffer:!1,stencilBuffer:!1}),l=new nn(T,S,{type:Nn,depthBuffer:!1,stencilBuffer:!1}));for(let R=0;R<b.length;R++){let _=b[R];_.setSize&&_.setSize(T,S)}},this.begin=function(y,T){if(x||y.toneMapping===Ln&&b.length===0)return!1;if(p=T,T!==null){let S=T.width,R=T.height;(o.width!==S||o.height!==R)&&this.setSize(S,R)}return M===!1&&y.setRenderTarget(o),m=y.toneMapping,y.toneMapping=Ln,!0},this.hasRenderPass=function(){return M},this.end=function(y,T){y.toneMapping=m,x=!0;let S=o,R=a;for(let _=0;_<b.length;_++){let w=b[_];w.enabled!==!1&&(w.render(y,R,S,T),w.needsSwap!==!1&&(S=R,R=R===a?l:a))}if(f!==y.outputColorSpace||g!==y.toneMapping){f=y.outputColorSpace,g=y.toneMapping,h.defines={},le.getTransfer(f)===fe&&(h.defines.SRGB_TRANSFER="");let _=_g[g];_&&(h.defines[_]=""),h.needsUpdate=!0}h.uniforms.tDiffuse.value=S.texture,y.setRenderTarget(p),y.render(u,d),p=null,x=!1},this.isCompositing=function(){return x},this.dispose=function(){o.dispose(),a!==null&&a.dispose(),l!==null&&l.dispose(),c.dispose(),h.dispose()}}var od=new en,Xc=new xi(1,1),ad=new fr,ld=new Go,cd=new vr,Hu=[],Vu=[],Gu=new Float32Array(16),Wu=new Float32Array(9),Xu=new Float32Array(4);function Ws(i,t,e){let n=i[0];if(n<=0||n>0)return i;let s=t*e,r=Hu[s];if(r===void 0&&(r=new Float32Array(s),Hu[s]=r),t!==0){n.toArray(r,0);for(let o=1,a=0;o!==t;++o)a+=e,i[o].toArray(r,a)}return r}function Oe(i,t){if(i.length!==t.length)return!1;for(let e=0,n=i.length;e<n;e++)if(i[e]!==t[e])return!1;return!0}function Be(i,t){for(let e=0,n=t.length;e<n;e++)i[e]=t[e]}function ll(i,t){let e=Vu[t];e===void 0&&(e=new Int32Array(t),Vu[t]=e);for(let n=0;n!==t;++n)e[n]=i.allocateTextureUnit();return e}function yg(i,t){let e=this.cache;e[0]!==t&&(i.uniform1f(this.addr,t),e[0]=t)}function vg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Oe(e,t))return;i.uniform2fv(this.addr,t),Be(e,t)}}function bg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(i.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Oe(e,t))return;i.uniform3fv(this.addr,t),Be(e,t)}}function Sg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Oe(e,t))return;i.uniform4fv(this.addr,t),Be(e,t)}}function Mg(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(Oe(e,t))return;i.uniformMatrix2fv(this.addr,!1,t),Be(e,t)}else{if(Oe(e,n))return;Xu.set(n),i.uniformMatrix2fv(this.addr,!1,Xu),Be(e,n)}}function Eg(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(Oe(e,t))return;i.uniformMatrix3fv(this.addr,!1,t),Be(e,t)}else{if(Oe(e,n))return;Wu.set(n),i.uniformMatrix3fv(this.addr,!1,Wu),Be(e,n)}}function Tg(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(Oe(e,t))return;i.uniformMatrix4fv(this.addr,!1,t),Be(e,t)}else{if(Oe(e,n))return;Gu.set(n),i.uniformMatrix4fv(this.addr,!1,Gu),Be(e,n)}}function wg(i,t){let e=this.cache;e[0]!==t&&(i.uniform1i(this.addr,t),e[0]=t)}function Ag(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Oe(e,t))return;i.uniform2iv(this.addr,t),Be(e,t)}}function Rg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Oe(e,t))return;i.uniform3iv(this.addr,t),Be(e,t)}}function Cg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Oe(e,t))return;i.uniform4iv(this.addr,t),Be(e,t)}}function Pg(i,t){let e=this.cache;e[0]!==t&&(i.uniform1ui(this.addr,t),e[0]=t)}function Ig(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Oe(e,t))return;i.uniform2uiv(this.addr,t),Be(e,t)}}function Lg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Oe(e,t))return;i.uniform3uiv(this.addr,t),Be(e,t)}}function Dg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Oe(e,t))return;i.uniform4uiv(this.addr,t),Be(e,t)}}function Ng(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(Xc.compareFunction=e.isReversedDepthBuffer()?nl:el,r=Xc):r=od,e.setTexture2D(t||r,s)}function Ug(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture3D(t||ld,s)}function Fg(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTextureCube(t||cd,s)}function Og(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture2DArray(t||ad,s)}function Bg(i){switch(i){case 5126:return yg;case 35664:return vg;case 35665:return bg;case 35666:return Sg;case 35674:return Mg;case 35675:return Eg;case 35676:return Tg;case 5124:case 35670:return wg;case 35667:case 35671:return Ag;case 35668:case 35672:return Rg;case 35669:case 35673:return Cg;case 5125:return Pg;case 36294:return Ig;case 36295:return Lg;case 36296:return Dg;case 35678:case 36198:case 36298:case 36306:case 35682:return Ng;case 35679:case 36299:case 36307:return Ug;case 35680:case 36300:case 36308:case 36293:return Fg;case 36289:case 36303:case 36311:case 36292:return Og}}function kg(i,t){i.uniform1fv(this.addr,t)}function zg(i,t){let e=Ws(t,this.size,2);i.uniform2fv(this.addr,e)}function Hg(i,t){let e=Ws(t,this.size,3);i.uniform3fv(this.addr,e)}function Vg(i,t){let e=Ws(t,this.size,4);i.uniform4fv(this.addr,e)}function Gg(i,t){let e=Ws(t,this.size,4);i.uniformMatrix2fv(this.addr,!1,e)}function Wg(i,t){let e=Ws(t,this.size,9);i.uniformMatrix3fv(this.addr,!1,e)}function Xg(i,t){let e=Ws(t,this.size,16);i.uniformMatrix4fv(this.addr,!1,e)}function qg(i,t){i.uniform1iv(this.addr,t)}function Yg(i,t){i.uniform2iv(this.addr,t)}function Zg(i,t){i.uniform3iv(this.addr,t)}function Jg(i,t){i.uniform4iv(this.addr,t)}function $g(i,t){i.uniform1uiv(this.addr,t)}function Kg(i,t){i.uniform2uiv(this.addr,t)}function jg(i,t){i.uniform3uiv(this.addr,t)}function Qg(i,t){i.uniform4uiv(this.addr,t)}function t_(i,t,e){let n=this.cache,s=t.length,r=ll(e,s);Oe(n,r)||(i.uniform1iv(this.addr,r),Be(n,r));let o;this.type===i.SAMPLER_2D_SHADOW?o=Xc:o=od;for(let a=0;a!==s;++a)e.setTexture2D(t[a]||o,r[a])}function e_(i,t,e){let n=this.cache,s=t.length,r=ll(e,s);Oe(n,r)||(i.uniform1iv(this.addr,r),Be(n,r));for(let o=0;o!==s;++o)e.setTexture3D(t[o]||ld,r[o])}function n_(i,t,e){let n=this.cache,s=t.length,r=ll(e,s);Oe(n,r)||(i.uniform1iv(this.addr,r),Be(n,r));for(let o=0;o!==s;++o)e.setTextureCube(t[o]||cd,r[o])}function i_(i,t,e){let n=this.cache,s=t.length,r=ll(e,s);Oe(n,r)||(i.uniform1iv(this.addr,r),Be(n,r));for(let o=0;o!==s;++o)e.setTexture2DArray(t[o]||ad,r[o])}function s_(i){switch(i){case 5126:return kg;case 35664:return zg;case 35665:return Hg;case 35666:return Vg;case 35674:return Gg;case 35675:return Wg;case 35676:return Xg;case 5124:case 35670:return qg;case 35667:case 35671:return Yg;case 35668:case 35672:return Zg;case 35669:case 35673:return Jg;case 5125:return $g;case 36294:return Kg;case 36295:return jg;case 36296:return Qg;case 35678:case 36198:case 36298:case 36306:case 35682:return t_;case 35679:case 36299:case 36307:return e_;case 35680:case 36300:case 36308:case 36293:return n_;case 36289:case 36303:case 36311:case 36292:return i_}}var qc=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=Bg(e.type)}},Yc=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=s_(e.type)}},Zc=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){let s=this.seq;for(let r=0,o=s.length;r!==o;++r){let a=s[r];a.setValue(t,e[a.id],n)}}},Gc=/(\w+)(\])?(\[|\.)?/g;function qu(i,t){i.seq.push(t),i.map[t.id]=t}function r_(i,t,e){let n=i.name,s=n.length;for(Gc.lastIndex=0;;){let r=Gc.exec(n),o=Gc.lastIndex,a=r[1],l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===s){qu(e,c===void 0?new qc(a,i,t):new Yc(a,i,t));break}else{let u=e.map[a];u===void 0&&(u=new Zc(a),qu(e,u)),e=u}}}var Vs=class{constructor(t,e){this.seq=[],this.map={};let n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let o=0;o<n;++o){let a=t.getActiveUniform(e,o),l=t.getUniformLocation(e,a.name);r_(a,l,this)}let s=[],r=[];for(let o of this.seq)o.type===t.SAMPLER_2D_SHADOW||o.type===t.SAMPLER_CUBE_SHADOW||o.type===t.SAMPLER_2D_ARRAY_SHADOW?s.push(o):r.push(o);s.length>0&&(this.seq=s.concat(r))}setValue(t,e,n,s){let r=this.map[e];r!==void 0&&r.setValue(t,n,s)}setOptional(t,e,n){let s=e[n];s!==void 0&&this.setValue(t,n,s)}static upload(t,e,n,s){for(let r=0,o=e.length;r!==o;++r){let a=e[r],l=n[a.id];l.needsUpdate!==!1&&a.setValue(t,l.value,s)}}static seqWithValue(t,e){let n=[];for(let s=0,r=t.length;s!==r;++s){let o=t[s];o.id in e&&n.push(o)}return n}};function Yu(i,t,e){let n=i.createShader(t);return i.shaderSource(n,e),i.compileShader(n),n}var o_=37297,a_=0;function l_(i,t){let e=i.split(`
`),n=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let o=s;o<r;o++){let a=o+1;n.push(`${a===t?">":" "} ${a}: ${e[o]}`)}return n.join(`
`)}var Zu=new ne;function c_(i){le._getMatrix(Zu,le.workingColorSpace,i);let t=`mat3( ${Zu.elements.map(e=>e.toFixed(4))} )`;switch(le.getTransfer(i)){case ur:return[t,"LinearTransferOETF"];case fe:return[t,"sRGBTransferOETF"];default:return Jt("WebGLProgram: Unsupported color space: ",i),[t,"LinearTransferOETF"]}}function Ju(i,t,e){let n=i.getShaderParameter(t,i.COMPILE_STATUS),r=(i.getShaderInfoLog(t)||"").trim();if(n&&r==="")return"";let o=/ERROR: 0:(\d+)/.exec(r);if(o){let a=parseInt(o[1]);return e.toUpperCase()+`

`+r+`

`+l_(i.getShaderSource(t),a)}else return r}function h_(i,t){let e=c_(t);return[`vec4 ${i}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}var u_={[dc]:"Linear",[fc]:"Reinhard",[pc]:"Cineon",[Hr]:"ACESFilmic",[gc]:"AgX",[_c]:"Neutral",[mc]:"Custom"};function d_(i,t){let e=u_[t];return e===void 0?(Jt("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}var sl=new D;function f_(){le.getLuminanceCoefficients(sl);let i=sl.x.toFixed(4),t=sl.y.toFixed(4),e=sl.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function p_(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Qr).join(`
`)}function m_(i){let t=[];for(let e in i){let n=i[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function g_(i,t){let e={},n=i.getProgramParameter(t,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(t,s),o=r.name,a=1;r.type===i.FLOAT_MAT2&&(a=2),r.type===i.FLOAT_MAT3&&(a=3),r.type===i.FLOAT_MAT4&&(a=4),e[o]={type:r.type,location:i.getAttribLocation(t,o),locationSize:a}}return e}function Qr(i){return i!==""}function $u(i,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Ku(i,t){return i.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var __=/^[ \t]*#include +<([\w\d./]+)>/gm;function Jc(i){return i.replace(__,y_)}var x_=new Map;function y_(i,t){let e=oe[t];if(e===void 0){let n=x_.get(t);if(n!==void 0)e=oe[n],Jt('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">")}return Jc(e)}var v_=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function ju(i){return i.replace(v_,b_)}function b_(i,t,e,n){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Qu(i){let t=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?t+=`
#define HIGH_PRECISION`:i.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}var S_={[zr]:"SHADOWMAP_TYPE_PCF",[Us]:"SHADOWMAP_TYPE_VSM"};function M_(i){return S_[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var E_={[Ai]:"ENVMAP_TYPE_CUBE",[Zi]:"ENVMAP_TYPE_CUBE",[Vr]:"ENVMAP_TYPE_CUBE_UV"};function T_(i){return i.envMap===!1?"ENVMAP_TYPE_CUBE":E_[i.envMapMode]||"ENVMAP_TYPE_CUBE"}var w_={[Zi]:"ENVMAP_MODE_REFRACTION"};function A_(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":w_[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}var R_={[ma]:"ENVMAP_BLENDING_MULTIPLY",[du]:"ENVMAP_BLENDING_MIX",[fu]:"ENVMAP_BLENDING_ADD"};function C_(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":R_[i.combine]||"ENVMAP_BLENDING_NONE"}function P_(i){let t=i.envMapCubeUVHeight;if(t===null)return null;let e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:n,maxMip:e}}function I_(i,t,e,n){let s=i.getContext(),r=e.defines,o=e.vertexShader,a=e.fragmentShader,l=M_(e),c=T_(e),h=A_(e),u=C_(e),d=P_(e),f=p_(e),g=m_(r),x=s.createProgram(),m,p,b=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(Qr).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(Qr).join(`
`),p.length>0&&(p+=`
`)):(m=[Qu(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexNormals?"#define HAS_NORMAL":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Qr).join(`
`),p=[Qu(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+h:"",e.envMap?"#define "+u:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.retroreflection?"#define USE_RETROREFLECTION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas||e.batchingColor?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==Ln?"#define TONE_MAPPING":"",e.toneMapping!==Ln?oe.tonemapping_pars_fragment:"",e.toneMapping!==Ln?d_("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",oe.colorspace_pars_fragment,h_("linearToOutputTexel",e.outputColorSpace),f_(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(Qr).join(`
`)),o=Jc(o),o=$u(o,e),o=Ku(o,e),a=Jc(a),a=$u(a,e),a=Ku(a,e),o=ju(o),a=ju(a),e.isRawShaderMaterial!==!0&&(b=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",e.glslVersion===Tc?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===Tc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);let M=b+m+o,y=b+p+a,T=Yu(s,s.VERTEX_SHADER,M),S=Yu(s,s.FRAGMENT_SHADER,y);s.attachShader(x,T),s.attachShader(x,S),e.index0AttributeName!==void 0?s.bindAttribLocation(x,0,e.index0AttributeName):e.hasPositionAttribute===!0&&s.bindAttribLocation(x,0,"position"),s.linkProgram(x);function R(I){if(i.debug.checkShaderErrors){let A=s.getProgramInfoLog(x)||"",U=s.getShaderInfoLog(T)||"",L=s.getShaderInfoLog(S)||"",k=A.trim(),W=U.trim(),z=L.trim(),Q=!0,N=!0;if(s.getProgramParameter(x,s.LINK_STATUS)===!1)if(Q=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,x,T,S);else{let V=Ju(s,T,"vertex"),Y=Ju(s,S,"fragment");Qt("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(x,s.VALIDATE_STATUS)+`

Material Name: `+I.name+`
Material Type: `+I.type+`

Program Info Log: `+k+`
`+V+`
`+Y)}else k!==""?Jt("WebGLProgram: Program Info Log:",k):(W===""||z==="")&&(N=!1);N&&(I.diagnostics={runnable:Q,programLog:k,vertexShader:{log:W,prefix:m},fragmentShader:{log:z,prefix:p}})}s.deleteShader(T),s.deleteShader(S),_=new Vs(s,x),w=g_(s,x)}let _;this.getUniforms=function(){return _===void 0&&R(this),_};let w;this.getAttributes=function(){return w===void 0&&R(this),w};let P=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return P===!1&&(P=s.getProgramParameter(x,o_)),P},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(x),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=a_++,this.cacheKey=t,this.usedTimes=1,this.program=x,this.vertexShader=T,this.fragmentShader=S,this}var L_=0,$c=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,e,n){let s=this._getShaderCacheForMaterial(t);return s.has(e)===!1&&(s.add(e),e.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){let e=this.shaderCache,n=e.get(t);return n===void 0&&(n=new Kc(t),e.set(t,n)),n}},Kc=class{constructor(t){this.id=L_++,this.code=t,this.usedTimes=0}};function D_(i){return i===Pi||i===Zr||i===Jr}function N_(i,t,e,n,s,r){let o=new pr,a=new $c,l=new Set,c=[],h=new Map,u=n.logarithmicDepthBuffer,d=n.precision,f={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(_){return l.add(_),_===0?"uv":`uv${_}`}function x(_,w,P,I,A,U){let L=I.fog,k=A.geometry,W=_.isMeshStandardMaterial||_.isMeshLambertMaterial||_.isMeshPhongMaterial?I.environment:null,z=_.isMeshStandardMaterial||_.isMeshLambertMaterial&&!_.envMap||_.isMeshPhongMaterial&&!_.envMap,Q=t.get(_.envMap||W,z),N=Q&&Q.mapping===Vr?Q.image.height:null,V=f[_.type];_.precision!==null&&(d=n.getMaxPrecision(_.precision),d!==_.precision&&Jt("WebGLProgram.getParameters:",_.precision,"not supported, using",d,"instead."));let Y=k.morphAttributes.position||k.morphAttributes.normal||k.morphAttributes.color,yt=Y!==void 0?Y.length:0,_t=0;k.morphAttributes.position!==void 0&&(_t=1),k.morphAttributes.normal!==void 0&&(_t=2),k.morphAttributes.color!==void 0&&(_t=3);let te,qt,Kt,et;if(V){let ve=qn[V];te=ve.vertexShader,qt=ve.fragmentShader}else{te=_.vertexShader,qt=_.fragmentShader;let ve=a.getVertexShaderStage(_),ue=a.getFragmentShaderStage(_);a.update(_,ve,ue),Kt=ve.id,et=ue.id}let st=i.getRenderTarget(),St=i.state.buffers.depth.getReversed(),wt=A.isInstancedMesh===!0,Mt=A.isBatchedMesh===!0,Dt=!!_.map,jt=!!_.matcap,ot=!!Q,ht=!!_.aoMap,rt=!!_.lightMap,lt=!!_.bumpMap&&_.wireframe===!1,xt=!!_.normalMap,kt=!!_.displacementMap,bt=!!_.emissiveMap,Wt=!!_.metalnessMap,Zt=!!_.roughnessMap,F=_.anisotropy>0,ee=_.clearcoat>0,ie=_.dispersion>0,C=_.retroreflectivity>0,v=_.iridescence>0,G=_.sheen>0,B=_.transmission>0,X=F&&!!_.anisotropyMap,at=ee&&!!_.clearcoatMap,ft=ee&&!!_.clearcoatNormalMap,$=ee&&!!_.clearcoatRoughnessMap,nt=v&&!!_.iridescenceMap,pt=v&&!!_.iridescenceThicknessMap,Et=G&&!!_.sheenColorMap,gt=G&&!!_.sheenRoughnessMap,mt=!!_.specularMap,Ot=!!_.specularColorMap,tt=!!_.specularIntensityMap,vt=B&&!!_.transmissionMap,O=B&&!!_.thicknessMap,dt=!!_.gradientMap,it=!!_.alphaMap,Tt=_.alphaTest>0,Rt=!!_.alphaHash,ut=!!_.extensions,Xt=Ln;_.toneMapped&&(st===null||st.isXRRenderTarget===!0)&&(Xt=i.toneMapping);let Vt={shaderID:V,shaderType:_.type,shaderName:_.name,vertexShader:te,fragmentShader:qt,defines:_.defines,customVertexShaderID:Kt,customFragmentShaderID:et,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:d,batching:Mt,batchingColor:Mt&&A._colorsTexture!==null,instancing:wt,instancingColor:wt&&A.instanceColor!==null,instancingMorph:wt&&A.morphTexture!==null,outputColorSpace:st===null?i.outputColorSpace:st.isXRRenderTarget===!0?st.texture.colorSpace:le.workingColorSpace,alphaToCoverage:!!_.alphaToCoverage,map:Dt,matcap:jt,envMap:ot,envMapMode:ot&&Q.mapping,envMapCubeUVHeight:N,aoMap:ht,lightMap:rt,bumpMap:lt,normalMap:xt,displacementMap:kt,emissiveMap:bt,normalMapObjectSpace:xt&&_.normalMapType===gu,normalMapTangentSpace:xt&&_.normalMapType===$r,packedNormalMap:xt&&_.normalMapType===$r&&D_(_.normalMap.format),metalnessMap:Wt,roughnessMap:Zt,anisotropy:F,anisotropyMap:X,clearcoat:ee,clearcoatMap:at,clearcoatNormalMap:ft,clearcoatRoughnessMap:$,dispersion:ie,retroreflection:C,iridescence:v,iridescenceMap:nt,iridescenceThicknessMap:pt,sheen:G,sheenColorMap:Et,sheenRoughnessMap:gt,specularMap:mt,specularColorMap:Ot,specularIntensityMap:tt,transmission:B,transmissionMap:vt,thicknessMap:O,gradientMap:dt,opaque:_.transparent===!1&&_.blending===Fs&&_.alphaToCoverage===!1,alphaMap:it,alphaTest:Tt,alphaHash:Rt,combine:_.combine,mapUv:Dt&&g(_.map.channel),aoMapUv:ht&&g(_.aoMap.channel),lightMapUv:rt&&g(_.lightMap.channel),bumpMapUv:lt&&g(_.bumpMap.channel),normalMapUv:xt&&g(_.normalMap.channel),displacementMapUv:kt&&g(_.displacementMap.channel),emissiveMapUv:bt&&g(_.emissiveMap.channel),metalnessMapUv:Wt&&g(_.metalnessMap.channel),roughnessMapUv:Zt&&g(_.roughnessMap.channel),anisotropyMapUv:X&&g(_.anisotropyMap.channel),clearcoatMapUv:at&&g(_.clearcoatMap.channel),clearcoatNormalMapUv:ft&&g(_.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:$&&g(_.clearcoatRoughnessMap.channel),iridescenceMapUv:nt&&g(_.iridescenceMap.channel),iridescenceThicknessMapUv:pt&&g(_.iridescenceThicknessMap.channel),sheenColorMapUv:Et&&g(_.sheenColorMap.channel),sheenRoughnessMapUv:gt&&g(_.sheenRoughnessMap.channel),specularMapUv:mt&&g(_.specularMap.channel),specularColorMapUv:Ot&&g(_.specularColorMap.channel),specularIntensityMapUv:tt&&g(_.specularIntensityMap.channel),transmissionMapUv:vt&&g(_.transmissionMap.channel),thicknessMapUv:O&&g(_.thicknessMap.channel),alphaMapUv:it&&g(_.alphaMap.channel),vertexTangents:!!k.attributes.tangent&&(xt||F),vertexNormals:!!k.attributes.normal,vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!k.attributes.color&&k.attributes.color.itemSize===4,pointsUvs:A.isPoints===!0&&!!k.attributes.uv&&(Dt||it),fog:!!L,useFog:_.fog===!0,fogExp2:!!L&&L.isFogExp2,flatShading:_.wireframe===!1&&(_.flatShading===!0||k.attributes.normal===void 0&&xt===!1&&(_.isMeshLambertMaterial||_.isMeshPhongMaterial||_.isMeshStandardMaterial||_.isMeshPhysicalMaterial)),sizeAttenuation:_.sizeAttenuation===!0,logarithmicDepthBuffer:u,reversedDepthBuffer:St,skinning:A.isSkinnedMesh===!0,hasPositionAttribute:k.attributes.position!==void 0,morphTargets:k.morphAttributes.position!==void 0,morphNormals:k.morphAttributes.normal!==void 0,morphColors:k.morphAttributes.color!==void 0,morphTargetsCount:yt,morphTextureStride:_t,numSunLights:w.sun.length,numDirLights:w.directional.length,numPointLights:w.point.length,numSpotLights:w.spot.length,numSpotLightMaps:w.spotLightMap.length,numRectAreaLights:w.rectArea.length,numHemiLights:w.hemi.length,numSunLightShadows:w.sunShadowMap.length,numDirLightShadows:w.directionalShadowMap.length,numPointLightShadows:w.pointShadowMap.length,numSpotLightShadows:w.spotShadowMap.length,numSpotLightShadowsWithMaps:w.numSpotLightShadowsWithMaps,numLightProbes:w.numLightProbes,numLightProbeGrids:U.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:_.dithering,shadowMapEnabled:i.shadowMap.enabled&&P.length>0,shadowMapType:i.shadowMap.type,toneMapping:Xt,decodeVideoTexture:Dt&&_.map.isVideoTexture===!0&&le.getTransfer(_.map.colorSpace)===fe,decodeVideoTextureEmissive:bt&&_.emissiveMap.isVideoTexture===!0&&le.getTransfer(_.emissiveMap.colorSpace)===fe,premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===Ce,flipSided:_.side===Ue,useDepthPacking:_.depthPacking>=0,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionClipCullDistance:ut&&_.extensions.clipCullDistance===!0&&e.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ut&&_.extensions.multiDraw===!0||Mt)&&e.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:e.has("KHR_parallel_shader_compile"),customProgramCacheKey:_.customProgramCacheKey()};return Vt.vertexUv1s=l.has(1),Vt.vertexUv2s=l.has(2),Vt.vertexUv3s=l.has(3),l.clear(),Vt}function m(_){let w=[];if(_.shaderID?w.push(_.shaderID):(w.push(_.customVertexShaderID),w.push(_.customFragmentShaderID)),_.defines!==void 0)for(let P in _.defines)w.push(P),w.push(_.defines[P]);return _.isRawShaderMaterial===!1&&(p(w,_),b(w,_),w.push(i.outputColorSpace)),w.push(_.customProgramCacheKey),w.join()}function p(_,w){_.push(w.precision),_.push(w.outputColorSpace),_.push(w.envMapMode),_.push(w.envMapCubeUVHeight),_.push(w.mapUv),_.push(w.alphaMapUv),_.push(w.lightMapUv),_.push(w.aoMapUv),_.push(w.bumpMapUv),_.push(w.normalMapUv),_.push(w.displacementMapUv),_.push(w.emissiveMapUv),_.push(w.metalnessMapUv),_.push(w.roughnessMapUv),_.push(w.anisotropyMapUv),_.push(w.clearcoatMapUv),_.push(w.clearcoatNormalMapUv),_.push(w.clearcoatRoughnessMapUv),_.push(w.iridescenceMapUv),_.push(w.iridescenceThicknessMapUv),_.push(w.sheenColorMapUv),_.push(w.sheenRoughnessMapUv),_.push(w.specularMapUv),_.push(w.specularColorMapUv),_.push(w.specularIntensityMapUv),_.push(w.transmissionMapUv),_.push(w.thicknessMapUv),_.push(w.combine),_.push(w.fogExp2),_.push(w.sizeAttenuation),_.push(w.morphTargetsCount),_.push(w.morphAttributeCount),_.push(w.numSunLights),_.push(w.numDirLights),_.push(w.numPointLights),_.push(w.numSpotLights),_.push(w.numSpotLightMaps),_.push(w.numHemiLights),_.push(w.numRectAreaLights),_.push(w.numSunLightShadows),_.push(w.numDirLightShadows),_.push(w.numPointLightShadows),_.push(w.numSpotLightShadows),_.push(w.numSpotLightShadowsWithMaps),_.push(w.numLightProbes),_.push(w.shadowMapType),_.push(w.toneMapping),_.push(w.numClippingPlanes),_.push(w.numClipIntersection),_.push(w.depthPacking)}function b(_,w){o.disableAll(),w.instancing&&o.enable(0),w.instancingColor&&o.enable(1),w.instancingMorph&&o.enable(2),w.matcap&&o.enable(3),w.envMap&&o.enable(4),w.normalMapObjectSpace&&o.enable(5),w.normalMapTangentSpace&&o.enable(6),w.clearcoat&&o.enable(7),w.iridescence&&o.enable(8),w.alphaTest&&o.enable(9),w.vertexColors&&o.enable(10),w.vertexAlphas&&o.enable(11),w.vertexUv1s&&o.enable(12),w.vertexUv2s&&o.enable(13),w.vertexUv3s&&o.enable(14),w.vertexTangents&&o.enable(15),w.anisotropy&&o.enable(16),w.alphaHash&&o.enable(17),w.batching&&o.enable(18),w.dispersion&&o.enable(19),w.retroreflection&&o.enable(24),w.batchingColor&&o.enable(20),w.gradientMap&&o.enable(21),w.packedNormalMap&&o.enable(22),w.vertexNormals&&o.enable(23),_.push(o.mask),o.disableAll(),w.fog&&o.enable(0),w.useFog&&o.enable(1),w.flatShading&&o.enable(2),w.logarithmicDepthBuffer&&o.enable(3),w.reversedDepthBuffer&&o.enable(4),w.skinning&&o.enable(5),w.morphTargets&&o.enable(6),w.morphNormals&&o.enable(7),w.morphColors&&o.enable(8),w.premultipliedAlpha&&o.enable(9),w.shadowMapEnabled&&o.enable(10),w.doubleSided&&o.enable(11),w.flipSided&&o.enable(12),w.useDepthPacking&&o.enable(13),w.dithering&&o.enable(14),w.transmission&&o.enable(15),w.sheen&&o.enable(16),w.opaque&&o.enable(17),w.pointsUvs&&o.enable(18),w.decodeVideoTexture&&o.enable(19),w.decodeVideoTextureEmissive&&o.enable(20),w.alphaToCoverage&&o.enable(21),w.numLightProbeGrids>0&&o.enable(22),w.hasPositionAttribute&&o.enable(23),_.push(o.mask)}function M(_){let w=f[_.type],P;if(w){let I=qn[w];P=Nu.clone(I.uniforms)}else P=_.uniforms;return P}function y(_,w){let P=h.get(w);return P!==void 0?++P.usedTimes:(P=new I_(i,w,_,s),c.push(P),h.set(w,P)),P}function T(_){if(--_.usedTimes===0){let w=c.indexOf(_);c[w]=c[c.length-1],c.pop(),h.delete(_.cacheKey),_.destroy()}}function S(_){a.remove(_)}function R(){a.dispose()}return{getParameters:x,getProgramCacheKey:m,getUniforms:M,acquireProgram:y,releaseProgram:T,releaseShaderCache:S,programs:c,dispose:R}}function U_(){let i=new WeakMap;function t(o){return i.has(o)}function e(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function s(o,a,l){i.get(o)[a]=l}function r(){i=new WeakMap}return{has:t,get:e,remove:n,update:s,dispose:r}}function F_(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.material.id!==t.material.id?i.material.id-t.material.id:i.materialVariant!==t.materialVariant?i.materialVariant-t.materialVariant:i.z!==t.z?i.z-t.z:i.id-t.id}function td(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.z!==t.z?t.z-i.z:i.id-t.id}function ed(){let i=[],t=0,e=[],n=[],s=[];function r(){t=0,e.length=0,n.length=0,s.length=0}function o(d){let f=0;return d.isInstancedMesh&&(f+=2),d.isSkinnedMesh&&(f+=1),f}function a(d,f,g,x,m,p){let b=i[t];return b===void 0?(b={id:d.id,object:d,geometry:f,material:g,materialVariant:o(d),groupOrder:x,renderOrder:d.renderOrder,z:m,group:p},i[t]=b):(b.id=d.id,b.object=d,b.geometry=f,b.material=g,b.materialVariant=o(d),b.groupOrder=x,b.renderOrder=d.renderOrder,b.z=m,b.group=p),t++,b}function l(d,f,g,x,m,p,b){b.reversedDepth===!0&&(m=-m);let M=a(d,f,g,x,m,p);g.transmission>0?n.push(M):g.transparent===!0?s.push(M):e.push(M)}function c(d,f,g,x,m,p){let b=a(d,f,g,x,m,p);g.transmission>0?n.unshift(b):g.transparent===!0?s.unshift(b):e.unshift(b)}function h(d,f){e.length>1&&e.sort(d||F_),n.length>1&&n.sort(f||td),s.length>1&&s.sort(f||td)}function u(){for(let d=t,f=i.length;d<f;d++){let g=i[d];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:e,transmissive:n,transparent:s,init:r,push:l,unshift:c,finish:u,sort:h}}function O_(){let i=new WeakMap;function t(n,s){let r=i.get(n),o;return r===void 0?(o=new ed,i.set(n,[o])):s>=r.length?(o=new ed,r.push(o)):o=r[s],o}function e(){i=new WeakMap}return{get:t,dispose:e}}function B_(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={direction:new D,color:new $t};break;case"SpotLight":e={position:new D,direction:new D,color:new $t,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new D,color:new $t,distance:0,decay:0};break;case"HemisphereLight":e={direction:new D,skyColor:new $t,groundColor:new $t};break;case"RectAreaLight":e={color:new $t,position:new D,halfWidth:new D,halfHeight:new D};break}return i[t.id]=e,e}}}function k_(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ct};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ct};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ct,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[t.id]=e,e}}}var z_=0;function H_(i,t){return(t.castShadow?2:0)-(i.castShadow?2:0)+(t.map?1:0)-(i.map?1:0)}function V_(i){let t=new B_,e=k_(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new D);let s=new D,r=new xe,o=new xe;function a(c){let h=0,u=0,d=0;for(let A=0;A<9;A++)n.probe[A].set(0,0,0);let f=0,g=0,x=0,m=0,p=0,b=0,M=0,y=0,T=0,S=0,R=0,_=0,w=0,P=0;c.sort(H_);for(let A=0,U=c.length;A<U;A++){let L=c[A],k=L.color,W=L.intensity,z=L.distance,Q=null;if(L.shadow&&L.shadow.map&&(L.shadow.map.texture.format===Pi?Q=L.shadow.map.texture:Q=L.shadow.map.depthTexture||L.shadow.map.texture),L.isAmbientLight)h+=k.r*W,u+=k.g*W,d+=k.b*W;else if(L.isLightProbe){for(let N=0;N<9;N++)n.probe[N].addScaledVector(L.sh.coefficients[N],W);P++}else if(L.isSunLight){let N=t.get(L);if(N.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){let V=L.shadow,Y=e.get(L);Y.shadowIntensity=V.intensity,Y.shadowBias=V.bias,Y.shadowNormalBias=V.normalBias,Y.shadowRadius=V.radius,Y.shadowMapSize.copy(V.mapSize).multiply(V.getFrameExtents()),n.sunShadow[g]=Y,n.sunShadowMap[g]=Q;let yt=V.getViewportCount();for(let _t=0;_t<yt;_t++)n.sunShadowMatrix[x+_t]=V.getMatrix(_t),n.sunShadowCascade[x+_t]=V._cascadeData[_t];x+=yt,g++}n.sun[f]=N,f++}else if(L.isDirectionalLight){let N=t.get(L);if(N.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){let V=L.shadow,Y=e.get(L);Y.shadowIntensity=V.intensity,Y.shadowBias=V.bias,Y.shadowNormalBias=V.normalBias,Y.shadowRadius=V.radius,Y.shadowMapSize=V.mapSize,n.directionalShadow[m]=Y,n.directionalShadowMap[m]=Q,n.directionalShadowMatrix[m]=L.shadow.matrix,T++}n.directional[m]=N,m++}else if(L.isSpotLight){let N=t.get(L);N.position.setFromMatrixPosition(L.matrixWorld),N.color.copy(k).multiplyScalar(W),N.distance=z,N.coneCos=Math.cos(L.angle),N.penumbraCos=Math.cos(L.angle*(1-L.penumbra)),N.decay=L.decay,n.spot[b]=N;let V=L.shadow;if(L.map&&(n.spotLightMap[_]=L.map,_++,V.updateMatrices(L),L.castShadow&&w++),n.spotLightMatrix[b]=V.matrix,L.castShadow){let Y=e.get(L);Y.shadowIntensity=V.intensity,Y.shadowBias=V.bias,Y.shadowNormalBias=V.normalBias,Y.shadowRadius=V.radius,Y.shadowMapSize=V.mapSize,n.spotShadow[b]=Y,n.spotShadowMap[b]=Q,R++}b++}else if(L.isRectAreaLight){let N=t.get(L);N.color.copy(k).multiplyScalar(W),N.halfWidth.set(L.width*.5,0,0),N.halfHeight.set(0,L.height*.5,0),n.rectArea[M]=N,M++}else if(L.isPointLight){let N=t.get(L);if(N.color.copy(L.color).multiplyScalar(L.intensity),N.distance=L.distance,N.decay=L.decay,L.castShadow){let V=L.shadow,Y=e.get(L);Y.shadowIntensity=V.intensity,Y.shadowBias=V.bias,Y.shadowNormalBias=V.normalBias,Y.shadowRadius=V.radius,Y.shadowMapSize=V.mapSize,Y.shadowCameraNear=V.camera.near,Y.shadowCameraFar=V.camera.far,n.pointShadow[p]=Y,n.pointShadowMap[p]=Q,n.pointShadowMatrix[p]=L.shadow.matrix,S++}n.point[p]=N,p++}else if(L.isHemisphereLight){let N=t.get(L);N.skyColor.copy(L.color).multiplyScalar(W),N.groundColor.copy(L.groundColor).multiplyScalar(W),n.hemi[y]=N,y++}}M>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=Ct.LTC_FLOAT_1,n.rectAreaLTC2=Ct.LTC_FLOAT_2):(n.rectAreaLTC1=Ct.LTC_HALF_1,n.rectAreaLTC2=Ct.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=d;let I=n.hash;(I.sunLength!==f||I.directionalLength!==m||I.pointLength!==p||I.spotLength!==b||I.rectAreaLength!==M||I.hemiLength!==y||I.numSunShadows!==g||I.numDirectionalShadows!==T||I.numPointShadows!==S||I.numSpotShadows!==R||I.numSpotMaps!==_||I.numLightProbes!==P)&&(n.sun.length=f,n.directional.length=m,n.spot.length=b,n.rectArea.length=M,n.point.length=p,n.hemi.length=y,n.sunShadow.length=g,n.sunShadowMap.length=g,n.sunShadowMatrix.length=x,n.sunShadowCascade.length=x,n.directionalShadow.length=T,n.directionalShadowMap.length=T,n.directionalShadowMatrix.length=T,n.pointShadow.length=S,n.pointShadowMap.length=S,n.pointShadowMatrix.length=S,n.spotShadow.length=R,n.spotShadowMap.length=R,n.spotLightMatrix.length=R+_-w,n.spotLightMap.length=_,n.numSpotLightShadowsWithMaps=w,n.numLightProbes=P,I.sunLength=f,I.directionalLength=m,I.pointLength=p,I.spotLength=b,I.rectAreaLength=M,I.hemiLength=y,I.numSunShadows=g,I.numDirectionalShadows=T,I.numPointShadows=S,I.numSpotShadows=R,I.numSpotMaps=_,I.numLightProbes=P,n.version=z_++)}function l(c,h){let u=0,d=0,f=0,g=0,x=0,m=0,p=h.matrixWorldInverse;for(let b=0,M=c.length;b<M;b++){let y=c[b];if(y.isSunLight){let T=n.sun[u];T.direction.setFromMatrixPosition(y.matrixWorld),T.direction.transformDirection(p),u++}else if(y.isDirectionalLight){let T=n.directional[d];T.direction.setFromMatrixPosition(y.matrixWorld),s.setFromMatrixPosition(y.target.matrixWorld),T.direction.sub(s),T.direction.transformDirection(p),d++}else if(y.isSpotLight){let T=n.spot[g];T.position.setFromMatrixPosition(y.matrixWorld),T.position.applyMatrix4(p),T.direction.setFromMatrixPosition(y.matrixWorld),s.setFromMatrixPosition(y.target.matrixWorld),T.direction.sub(s),T.direction.transformDirection(p),g++}else if(y.isRectAreaLight){let T=n.rectArea[x];T.position.setFromMatrixPosition(y.matrixWorld),T.position.applyMatrix4(p),o.identity(),r.copy(y.matrixWorld),r.premultiply(p),o.extractRotation(r),T.halfWidth.set(y.width*.5,0,0),T.halfHeight.set(0,y.height*.5,0),T.halfWidth.applyMatrix4(o),T.halfHeight.applyMatrix4(o),x++}else if(y.isPointLight){let T=n.point[f];T.position.setFromMatrixPosition(y.matrixWorld),T.position.applyMatrix4(p),f++}else if(y.isHemisphereLight){let T=n.hemi[m];T.direction.setFromMatrixPosition(y.matrixWorld),T.direction.transformDirection(p),m++}}}return{setup:a,setupView:l,state:n}}function nd(i){let t=new V_(i),e=[],n=[],s=[];function r(d){u.camera=d,e.length=0,n.length=0,s.length=0}function o(d){e.push(d)}function a(d){n.push(d)}function l(d){s.push(d)}function c(){t.setup(e)}function h(d){t.setupView(e,d)}let u={lightsArray:e,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:u,setupLights:c,setupLightsView:h,pushLight:o,pushShadow:a,pushLightProbeGrid:l}}function G_(i){let t=new WeakMap;function e(s,r=0){let o=t.get(s),a;return o===void 0?(a=new nd(i),t.set(s,[a])):r>=o.length?(a=new nd(i),o.push(a)):a=o[r],a}function n(){t=new WeakMap}return{get:e,dispose:n}}var W_=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,X_=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,q_=[new D(1,0,0),new D(-1,0,0),new D(0,1,0),new D(0,-1,0),new D(0,0,1),new D(0,0,-1)],Y_=[new D(0,-1,0),new D(0,-1,0),new D(0,0,1),new D(0,0,-1),new D(0,-1,0),new D(0,-1,0)],id=new xe,jr=new D,Wc=new D;function Z_(i,t,e){let n=new As,s=new ct,r=new ct,o=new Ee,a=new Qo,l=new ta,c={},h=e.maxTextureSize,u={[wi]:Ue,[Ue]:wi,[Ce]:Ce},d=new pn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ct},radius:{value:4}},vertexShader:W_,fragmentShader:X_}),f=d.clone();f.defines.HORIZONTAL_PASS=1;let g=new Ne;g.setAttribute("position",new un(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let x=new Lt(g,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=zr;let p=this.type;this.render=function(S,R,_){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||S.length===0)return;this.type===pa&&(Jt("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=zr);let w=i.getRenderTarget(),P=i.getActiveCubeFace(),I=i.getActiveMipmapLevel(),A=i.state;A.setBlending(Wn),A.buffers.depth.getReversed()===!0?A.buffers.color.setClear(0,0,0,0):A.buffers.color.setClear(1,1,1,1),A.buffers.depth.setTest(!0),A.setScissorTest(!1);let U=p!==this.type;U&&R.traverse(function(L){L.material&&(Array.isArray(L.material)?L.material.forEach(k=>k.needsUpdate=!0):L.material.needsUpdate=!0)});for(let L=0,k=S.length;L<k;L++){let W=S[L],z=W.shadow;if(z===void 0){Jt("WebGLShadowMap:",W,"has no shadow.");continue}if(z.autoUpdate===!1&&z.needsUpdate===!1)continue;s.copy(z.mapSize);let Q=z.getFrameExtents();s.multiply(Q),r.copy(z.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/Q.x),s.x=r.x*Q.x,z.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/Q.y),s.y=r.y*Q.y,z.mapSize.y=r.y));let N=i.state.buffers.depth.getReversed();if(z.camera._reversedDepth=N,z.map===null||U===!0){if(z.map!==null&&(z.map.depthTexture!==null&&(z.map.depthTexture.dispose(),z.map.depthTexture=null),z.map.dispose()),this.type===Us){if(W.isPointLight){Jt("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}z.map=new nn(s.x,s.y,{format:Pi,type:Nn,minFilter:Xe,magFilter:Xe,generateMipmaps:!1}),z.map.texture.name=W.name+".shadowMap",z.map.depthTexture=new xi(s.x,s.y,Sn),z.map.depthTexture.name=W.name+".shadowMapDepth",z.map.depthTexture.format=zn,z.map.depthTexture.compareFunction=null,z.map.depthTexture.minFilter=Ve,z.map.depthTexture.magFilter=Ve}else W.isPointLight?(z.map=new rl(s.x),z.map.depthTexture=new Wo(s.x,Dn)):(z.map=new nn(s.x,s.y),z.map.depthTexture=new xi(s.x,s.y,Dn)),z.map.depthTexture.name=W.name+".shadowMap",z.map.depthTexture.format=zn,this.type===zr?(z.map.depthTexture.compareFunction=N?nl:el,z.map.depthTexture.minFilter=Xe,z.map.depthTexture.magFilter=Xe):(z.map.depthTexture.compareFunction=null,z.map.depthTexture.minFilter=Ve,z.map.depthTexture.magFilter=Ve);z.camera.updateProjectionMatrix()}z.map.isWebGLCubeRenderTarget!==!0&&(z.map.width!==s.x||z.map.height!==s.y)&&z.map.setSize(s.x,s.y);let V=z.map.isWebGLCubeRenderTarget?6:z.getViewportCount();W.isPointLight!==!0&&z.updateMatrices(W,_);for(let Y=0;Y<V;Y++){let yt=z.getCamera(Y);if(W.isPointLight){let _t=z.camera,te=z.matrix,qt=W.distance||_t.far;qt!==_t.far&&(_t.far=qt,_t.updateProjectionMatrix()),jr.setFromMatrixPosition(W.matrixWorld),_t.position.copy(jr),Wc.copy(_t.position),Wc.add(q_[Y]),_t.up.copy(Y_[Y]),_t.lookAt(Wc),_t.updateMatrixWorld(),te.makeTranslation(-jr.x,-jr.y,-jr.z),id.multiplyMatrices(_t.projectionMatrix,_t.matrixWorldInverse),z._frustum.setFromProjectionMatrix(id,_t.coordinateSystem,_t.reversedDepth)}if(z.map.isWebGLCubeRenderTarget)i.setRenderTarget(z.map,Y),i.clear();else{Y===0&&(i.setRenderTarget(z.map),i.clear());let _t=z.getViewport(Y);o.set(r.x*_t.x,r.y*_t.y,r.x*_t.z,r.y*_t.w),A.viewport(o)}n=z.getFrustum(Y),y(R,_,yt,W,this.type)}z.isPointLightShadow!==!0&&this.type===Us&&b(z,_),z.needsUpdate=!1}p=this.type,m.needsUpdate=!1,i.setRenderTarget(w,P,I)};function b(S,R){let _=t.update(x);d.defines.VSM_SAMPLES!==S.blurSamples&&(d.defines.VSM_SAMPLES=S.blurSamples,f.defines.VSM_SAMPLES=S.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),S.mapPass===null?S.mapPass=new nn(s.x,s.y,{format:Pi,type:Nn}):(S.mapPass.width!==S.map.width||S.mapPass.height!==S.map.height)&&S.mapPass.setSize(S.map.width,S.map.height),d.uniforms.shadow_pass.value=S.map.depthTexture,d.uniforms.resolution.value.set(S.map.width,S.map.height),d.uniforms.radius.value=S.radius,i.setRenderTarget(S.mapPass),i.clear(),i.renderBufferDirect(R,null,_,d,x,null),f.uniforms.shadow_pass.value=S.mapPass.texture,f.uniforms.resolution.value.set(S.map.width,S.map.height),f.uniforms.radius.value=S.radius,i.setRenderTarget(S.map),i.clear(),i.renderBufferDirect(R,null,_,f,x,null)}function M(S,R,_,w){let P=null,I=_.isPointLight===!0?S.customDistanceMaterial:S.customDepthMaterial;if(I!==void 0)P=I;else if(P=_.isPointLight===!0?l:a,i.localClippingEnabled&&R.clipShadows===!0&&Array.isArray(R.clippingPlanes)&&R.clippingPlanes.length!==0||R.displacementMap&&R.displacementScale!==0||R.alphaMap&&R.alphaTest>0||R.map&&R.alphaTest>0||R.alphaToCoverage===!0){let A=P.uuid,U=R.uuid,L=c[A];L===void 0&&(L={},c[A]=L);let k=L[U];k===void 0&&(k=P.clone(),L[U]=k,R.addEventListener("dispose",T)),P=k}if(P.visible=R.visible,P.wireframe=R.wireframe,w===Us?P.side=R.shadowSide!==null?R.shadowSide:R.side:P.side=R.shadowSide!==null?R.shadowSide:u[R.side],P.alphaMap=R.alphaMap,P.alphaTest=R.alphaToCoverage===!0?.5:R.alphaTest,P.map=R.map,P.clipShadows=R.clipShadows,P.clippingPlanes=R.clippingPlanes,P.clipIntersection=R.clipIntersection,P.displacementMap=R.displacementMap,P.displacementScale=R.displacementScale,P.displacementBias=R.displacementBias,P.wireframeLinewidth=R.wireframeLinewidth,P.linewidth=R.linewidth,_.isPointLight===!0&&P.isMeshDistanceMaterial===!0){let A=i.properties.get(P);A.light=_}return P}function y(S,R,_,w,P){if(S.visible===!1)return;if(S.layers.test(R.layers)&&(S.isMesh||S.isLine||S.isPoints)&&(S.castShadow||S.receiveShadow&&P===Us)&&(!S.frustumCulled||S.intersectsFrustum(n))){S.modelViewMatrix.multiplyMatrices(_.matrixWorldInverse,S.matrixWorld);let U=t.update(S),L=S.material;if(Array.isArray(L)){let k=U.groups;for(let W=0,z=k.length;W<z;W++){let Q=k[W],N=L[Q.materialIndex];if(N&&N.visible){let V=M(S,N,w,P);S.onBeforeShadow(i,S,R,_,U,V,Q),i.renderBufferDirect(_,null,U,V,S,Q),S.onAfterShadow(i,S,R,_,U,V,Q)}}}else if(L.visible){let k=M(S,L,w,P);S.onBeforeShadow(i,S,R,_,U,k,null),i.renderBufferDirect(_,null,U,k,S,null),S.onAfterShadow(i,S,R,_,U,k,null)}}let A=S.children;for(let U=0,L=A.length;U<L;U++)y(A[U],R,_,w,P)}function T(S){S.target.removeEventListener("dispose",T);for(let _ in c){let w=c[_],P=S.target.uuid;P in w&&(w[P].dispose(),delete w[P])}}}function J_(i,t){function e(){let O=!1,dt=new Ee,it=null,Tt=new Ee(0,0,0,0);return{setMask:function(Rt){it!==Rt&&!O&&(i.colorMask(Rt,Rt,Rt,Rt),it=Rt)},setLocked:function(Rt){O=Rt},setClear:function(Rt,ut,Xt,Vt,ve){ve===!0&&(Rt*=Vt,ut*=Vt,Xt*=Vt),dt.set(Rt,ut,Xt,Vt),Tt.equals(dt)===!1&&(i.clearColor(Rt,ut,Xt,Vt),Tt.copy(dt))},reset:function(){O=!1,it=null,Tt.set(-1,0,0,0)}}}function n(){let O=!1,dt=!1,it=null,Tt=null,Rt=null;return{setReversed:function(ut){if(dt!==ut){let Xt=t.get("EXT_clip_control");ut?Xt.clipControlEXT(Xt.LOWER_LEFT_EXT,Xt.ZERO_TO_ONE_EXT):Xt.clipControlEXT(Xt.LOWER_LEFT_EXT,Xt.NEGATIVE_ONE_TO_ONE_EXT),dt=ut;let Vt=Rt;Rt=null,this.setClear(Vt)}},getReversed:function(){return dt},setTest:function(ut){ut?st(i.DEPTH_TEST):St(i.DEPTH_TEST)},setMask:function(ut){it!==ut&&!O&&(i.depthMask(ut),it=ut)},setFunc:function(ut){if(dt&&(ut=Ru[ut]),Tt!==ut){switch(ut){case Lo:i.depthFunc(i.NEVER);break;case Do:i.depthFunc(i.ALWAYS);break;case No:i.depthFunc(i.LESS);break;case ys:i.depthFunc(i.LEQUAL);break;case Uo:i.depthFunc(i.EQUAL);break;case Fo:i.depthFunc(i.GEQUAL);break;case Oo:i.depthFunc(i.GREATER);break;case Bo:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}Tt=ut}},setLocked:function(ut){O=ut},setClear:function(ut){Rt!==ut&&(Rt=ut,dt&&(ut=1-ut),i.clearDepth(ut))},reset:function(){O=!1,it=null,Tt=null,Rt=null,dt=!1}}}function s(){let O=!1,dt=null,it=null,Tt=null,Rt=null,ut=null,Xt=null,Vt=null,ve=null;return{setTest:function(ue){O||(ue?st(i.STENCIL_TEST):St(i.STENCIL_TEST))},setMask:function(ue){dt!==ue&&!O&&(i.stencilMask(ue),dt=ue)},setFunc:function(ue,wn,Fn){(it!==ue||Tt!==wn||Rt!==Fn)&&(i.stencilFunc(ue,wn,Fn),it=ue,Tt=wn,Rt=Fn)},setOp:function(ue,wn,Fn){(ut!==ue||Xt!==wn||Vt!==Fn)&&(i.stencilOp(ue,wn,Fn),ut=ue,Xt=wn,Vt=Fn)},setLocked:function(ue){O=ue},setClear:function(ue){ve!==ue&&(i.clearStencil(ue),ve=ue)},reset:function(){O=!1,dt=null,it=null,Tt=null,Rt=null,ut=null,Xt=null,Vt=null,ve=null}}}let r=new e,o=new n,a=new s,l=new WeakMap,c=new WeakMap,h={},u={},d={},f=new WeakMap,g=[],x=null,m=!1,p=null,b=null,M=null,y=null,T=null,S=null,R=null,_=new $t(0,0,0),w=0,P=!1,I=null,A=null,U=null,L=null,k=null,W=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),z=!1,Q=0,N=i.getParameter(i.VERSION);N.indexOf("WebGL")!==-1?(Q=parseFloat(/^WebGL (\d)/.exec(N)[1]),z=Q>=1):N.indexOf("OpenGL ES")!==-1&&(Q=parseFloat(/^OpenGL ES (\d)/.exec(N)[1]),z=Q>=2);let V=null,Y={},yt=i.getParameter(i.SCISSOR_BOX),_t=i.getParameter(i.VIEWPORT),te=new Ee().fromArray(yt),qt=new Ee().fromArray(_t);function Kt(O,dt,it,Tt){let Rt=new Uint8Array(4),ut=i.createTexture();i.bindTexture(O,ut),i.texParameteri(O,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(O,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Xt=0;Xt<it;Xt++)O===i.TEXTURE_3D||O===i.TEXTURE_2D_ARRAY?i.texImage3D(dt,0,i.RGBA,1,1,Tt,0,i.RGBA,i.UNSIGNED_BYTE,Rt):i.texImage2D(dt+Xt,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,Rt);return ut}let et={};et[i.TEXTURE_2D]=Kt(i.TEXTURE_2D,i.TEXTURE_2D,1),et[i.TEXTURE_CUBE_MAP]=Kt(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),et[i.TEXTURE_2D_ARRAY]=Kt(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),et[i.TEXTURE_3D]=Kt(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),st(i.DEPTH_TEST),o.setFunc(ys),lt(!1),xt(oc),st(i.CULL_FACE),ht(Wn);function st(O){h[O]!==!0&&(i.enable(O),h[O]=!0)}function St(O){h[O]!==!1&&(i.disable(O),h[O]=!1)}function wt(O,dt){return d[O]!==dt?(i.bindFramebuffer(O,dt),d[O]=dt,O===i.DRAW_FRAMEBUFFER&&(d[i.FRAMEBUFFER]=dt),O===i.FRAMEBUFFER&&(d[i.DRAW_FRAMEBUFFER]=dt),!0):!1}function Mt(O,dt){let it=g,Tt=!1;if(O){it=f.get(dt),it===void 0&&(it=[],f.set(dt,it));let Rt=O.textures;if(it.length!==Rt.length||it[0]!==i.COLOR_ATTACHMENT0){for(let ut=0,Xt=Rt.length;ut<Xt;ut++)it[ut]=i.COLOR_ATTACHMENT0+ut;it.length=Rt.length,Tt=!0}}else it[0]!==i.BACK&&(it[0]=i.BACK,Tt=!0);Tt&&i.drawBuffers(it)}function Dt(O){return x!==O?(i.useProgram(O),x=O,!0):!1}let jt={[Yi]:i.FUNC_ADD,[Jh]:i.FUNC_SUBTRACT,[$h]:i.FUNC_REVERSE_SUBTRACT};jt[Kh]=i.MIN,jt[jh]=i.MAX;let ot={[Qh]:i.ZERO,[tu]:i.ONE,[eu]:i.SRC_COLOR,[hc]:i.SRC_ALPHA,[au]:i.SRC_ALPHA_SATURATE,[ru]:i.DST_COLOR,[iu]:i.DST_ALPHA,[nu]:i.ONE_MINUS_SRC_COLOR,[uc]:i.ONE_MINUS_SRC_ALPHA,[ou]:i.ONE_MINUS_DST_COLOR,[su]:i.ONE_MINUS_DST_ALPHA,[lu]:i.CONSTANT_COLOR,[cu]:i.ONE_MINUS_CONSTANT_COLOR,[hu]:i.CONSTANT_ALPHA,[uu]:i.ONE_MINUS_CONSTANT_ALPHA};function ht(O,dt,it,Tt,Rt,ut,Xt,Vt,ve,ue){if(O===Wn){m===!0&&(St(i.BLEND),m=!1);return}if(m===!1&&(st(i.BLEND),m=!0),O!==Zh){if(O!==p||ue!==P){if((b!==Yi||T!==Yi)&&(i.blendEquation(i.FUNC_ADD),b=Yi,T=Yi),ue)switch(O){case Fs:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case ac:i.blendFunc(i.ONE,i.ONE);break;case lc:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case cc:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:Qt("WebGLState: Invalid blending: ",O);break}else switch(O){case Fs:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case ac:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case lc:Qt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case cc:Qt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Qt("WebGLState: Invalid blending: ",O);break}M=null,y=null,S=null,R=null,_.set(0,0,0),w=0,p=O,P=ue}return}Rt=Rt||dt,ut=ut||it,Xt=Xt||Tt,(dt!==b||Rt!==T)&&(i.blendEquationSeparate(jt[dt],jt[Rt]),b=dt,T=Rt),(it!==M||Tt!==y||ut!==S||Xt!==R)&&(i.blendFuncSeparate(ot[it],ot[Tt],ot[ut],ot[Xt]),M=it,y=Tt,S=ut,R=Xt),(Vt.equals(_)===!1||ve!==w)&&(i.blendColor(Vt.r,Vt.g,Vt.b,ve),_.copy(Vt),w=ve),p=O,P=!1}function rt(O,dt){O.side===Ce?St(i.CULL_FACE):st(i.CULL_FACE);let it=O.side===Ue;dt&&(it=!it),lt(it),O.blending===Fs&&O.transparent===!1?ht(Wn):ht(O.blending,O.blendEquation,O.blendSrc,O.blendDst,O.blendEquationAlpha,O.blendSrcAlpha,O.blendDstAlpha,O.blendColor,O.blendAlpha,O.premultipliedAlpha),o.setFunc(O.depthFunc),o.setTest(O.depthTest),o.setMask(O.depthWrite),r.setMask(O.colorWrite);let Tt=O.stencilWrite;a.setTest(Tt),Tt&&(a.setMask(O.stencilWriteMask),a.setFunc(O.stencilFunc,O.stencilRef,O.stencilFuncMask),a.setOp(O.stencilFail,O.stencilZFail,O.stencilZPass)),bt(O.polygonOffset,O.polygonOffsetFactor,O.polygonOffsetUnits),O.alphaToCoverage===!0?st(i.SAMPLE_ALPHA_TO_COVERAGE):St(i.SAMPLE_ALPHA_TO_COVERAGE)}function lt(O){I!==O&&(O?i.frontFace(i.CW):i.frontFace(i.CCW),I=O)}function xt(O){O!==qh?(st(i.CULL_FACE),O!==A&&(O===oc?i.cullFace(i.BACK):O===Yh?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):St(i.CULL_FACE),A=O}function kt(O){O!==U&&(z&&i.lineWidth(O),U=O)}function bt(O,dt,it){O?(st(i.POLYGON_OFFSET_FILL),(L!==dt||k!==it)&&(L=dt,k=it,o.getReversed()&&(dt=-dt),i.polygonOffset(dt,it))):St(i.POLYGON_OFFSET_FILL)}function Wt(O){O?st(i.SCISSOR_TEST):St(i.SCISSOR_TEST)}function Zt(O){O===void 0&&(O=i.TEXTURE0+W-1),V!==O&&(i.activeTexture(O),V=O)}function F(O,dt,it){it===void 0&&(V===null?it=i.TEXTURE0+W-1:it=V);let Tt=Y[it];Tt===void 0&&(Tt={type:void 0,texture:void 0},Y[it]=Tt),(Tt.type!==O||Tt.texture!==dt)&&(V!==it&&(i.activeTexture(it),V=it),i.bindTexture(O,dt||et[O]),Tt.type=O,Tt.texture=dt)}function ee(){let O=Y[V];O!==void 0&&O.type!==void 0&&(i.bindTexture(O.type,null),O.type=void 0,O.texture=void 0)}function ie(){try{i.compressedTexImage2D(...arguments)}catch(O){Qt("WebGLState:",O)}}function C(){try{i.compressedTexImage3D(...arguments)}catch(O){Qt("WebGLState:",O)}}function v(){try{i.texSubImage2D(...arguments)}catch(O){Qt("WebGLState:",O)}}function G(){try{i.texSubImage3D(...arguments)}catch(O){Qt("WebGLState:",O)}}function B(){try{i.compressedTexSubImage2D(...arguments)}catch(O){Qt("WebGLState:",O)}}function X(){try{i.compressedTexSubImage3D(...arguments)}catch(O){Qt("WebGLState:",O)}}function at(){try{i.texStorage2D(...arguments)}catch(O){Qt("WebGLState:",O)}}function ft(){try{i.texStorage3D(...arguments)}catch(O){Qt("WebGLState:",O)}}function $(){try{i.texImage2D(...arguments)}catch(O){Qt("WebGLState:",O)}}function nt(){try{i.texImage3D(...arguments)}catch(O){Qt("WebGLState:",O)}}function pt(O){return u[O]!==void 0?u[O]:i.getParameter(O)}function Et(O,dt){u[O]!==dt&&(i.pixelStorei(O,dt),u[O]=dt)}function gt(O){te.equals(O)===!1&&(i.scissor(O.x,O.y,O.z,O.w),te.copy(O))}function mt(O){qt.equals(O)===!1&&(i.viewport(O.x,O.y,O.z,O.w),qt.copy(O))}function Ot(O,dt){let it=c.get(dt);it===void 0&&(it=new WeakMap,c.set(dt,it));let Tt=it.get(O);Tt===void 0&&(Tt=i.getUniformBlockIndex(dt,O.name),it.set(O,Tt))}function tt(O,dt){let Tt=c.get(dt).get(O);l.get(dt)!==Tt&&(i.uniformBlockBinding(dt,Tt,O.__bindingPointIndex),l.set(dt,Tt))}function vt(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),o.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),h={},u={},V=null,Y={},d={},f=new WeakMap,g=[],x=null,m=!1,p=null,b=null,M=null,y=null,T=null,S=null,R=null,_=new $t(0,0,0),w=0,P=!1,I=null,A=null,U=null,L=null,k=null,te.set(0,0,i.canvas.width,i.canvas.height),qt.set(0,0,i.canvas.width,i.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:st,disable:St,bindFramebuffer:wt,drawBuffers:Mt,useProgram:Dt,setBlending:ht,setMaterial:rt,setFlipSided:lt,setCullFace:xt,setLineWidth:kt,setPolygonOffset:bt,setScissorTest:Wt,activeTexture:Zt,bindTexture:F,unbindTexture:ee,compressedTexImage2D:ie,compressedTexImage3D:C,texImage2D:$,texImage3D:nt,pixelStorei:Et,getParameter:pt,updateUBOMapping:Ot,uniformBlockBinding:tt,texStorage2D:at,texStorage3D:ft,texSubImage2D:v,texSubImage3D:G,compressedTexSubImage2D:B,compressedTexSubImage3D:X,scissor:gt,viewport:mt,reset:vt}}function $_(i,t,e,n,s,r,o){let a=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator=="undefined"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new ct,h=new WeakMap,u=new Set,d,f=new WeakMap,g=!1;try{g=typeof OffscreenCanvas!="undefined"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function x(C,v){return g?new OffscreenCanvas(C,v):dr("canvas")}function m(C,v,G){let B=1,X=ie(C);if((X.width>G||X.height>G)&&(B=G/Math.max(X.width,X.height)),B<1)if(typeof HTMLImageElement!="undefined"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement!="undefined"&&C instanceof HTMLCanvasElement||typeof ImageBitmap!="undefined"&&C instanceof ImageBitmap||typeof VideoFrame!="undefined"&&C instanceof VideoFrame){let at=Math.floor(B*X.width),ft=Math.floor(B*X.height);d===void 0&&(d=x(at,ft));let $=v?x(at,ft):d;return $.width=at,$.height=ft,$.getContext("2d").drawImage(C,0,0,at,ft),Jt("WebGLRenderer: Texture has been resized from ("+X.width+"x"+X.height+") to ("+at+"x"+ft+")."),$}else return"data"in C&&Jt("WebGLRenderer: Image in DataTexture is too big ("+X.width+"x"+X.height+")."),C;return C}function p(C){return C.generateMipmaps}function b(C){i.generateMipmap(C)}function M(C){return C.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:C.isWebGL3DRenderTarget?i.TEXTURE_3D:C.isWebGLArrayRenderTarget||C.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function y(C,v,G,B,X,at=!1){if(C!==null){if(i[C]!==void 0)return i[C];Jt("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let ft;B&&(ft=t.get("EXT_texture_norm16"),ft||Jt("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let $=v;if(v===i.RED&&(G===i.FLOAT&&($=i.R32F),G===i.HALF_FLOAT&&($=i.R16F),G===i.UNSIGNED_BYTE&&($=i.R8),G===i.UNSIGNED_SHORT&&ft&&($=ft.R16_EXT),G===i.SHORT&&ft&&($=ft.R16_SNORM_EXT)),v===i.RED_INTEGER&&(G===i.UNSIGNED_BYTE&&($=i.R8UI),G===i.UNSIGNED_SHORT&&($=i.R16UI),G===i.UNSIGNED_INT&&($=i.R32UI),G===i.BYTE&&($=i.R8I),G===i.SHORT&&($=i.R16I),G===i.INT&&($=i.R32I)),v===i.RG&&(G===i.FLOAT&&($=i.RG32F),G===i.HALF_FLOAT&&($=i.RG16F),G===i.UNSIGNED_BYTE&&($=i.RG8),G===i.UNSIGNED_SHORT&&ft&&($=ft.RG16_EXT),G===i.SHORT&&ft&&($=ft.RG16_SNORM_EXT)),v===i.RG_INTEGER&&(G===i.UNSIGNED_BYTE&&($=i.RG8UI),G===i.UNSIGNED_SHORT&&($=i.RG16UI),G===i.UNSIGNED_INT&&($=i.RG32UI),G===i.BYTE&&($=i.RG8I),G===i.SHORT&&($=i.RG16I),G===i.INT&&($=i.RG32I)),v===i.RGB_INTEGER&&(G===i.UNSIGNED_BYTE&&($=i.RGB8UI),G===i.UNSIGNED_SHORT&&($=i.RGB16UI),G===i.UNSIGNED_INT&&($=i.RGB32UI),G===i.BYTE&&($=i.RGB8I),G===i.SHORT&&($=i.RGB16I),G===i.INT&&($=i.RGB32I)),v===i.RGBA_INTEGER&&(G===i.UNSIGNED_BYTE&&($=i.RGBA8UI),G===i.UNSIGNED_SHORT&&($=i.RGBA16UI),G===i.UNSIGNED_INT&&($=i.RGBA32UI),G===i.BYTE&&($=i.RGBA8I),G===i.SHORT&&($=i.RGBA16I),G===i.INT&&($=i.RGBA32I)),v===i.RGB&&(G===i.UNSIGNED_SHORT&&ft&&($=ft.RGB16_EXT),G===i.SHORT&&ft&&($=ft.RGB16_SNORM_EXT),G===i.UNSIGNED_INT_5_9_9_9_REV&&($=i.RGB9_E5),G===i.UNSIGNED_INT_10F_11F_11F_REV&&($=i.R11F_G11F_B10F)),v===i.RGBA){let nt=at?ur:le.getTransfer(X);G===i.FLOAT&&($=i.RGBA32F),G===i.HALF_FLOAT&&($=i.RGBA16F),G===i.UNSIGNED_BYTE&&($=nt===fe?i.SRGB8_ALPHA8:i.RGBA8),G===i.UNSIGNED_SHORT&&ft&&($=ft.RGBA16_EXT),G===i.SHORT&&ft&&($=ft.RGBA16_SNORM_EXT),G===i.UNSIGNED_SHORT_4_4_4_4&&($=i.RGBA4),G===i.UNSIGNED_SHORT_5_5_5_1&&($=i.RGB5_A1)}return($===i.R16F||$===i.R32F||$===i.RG16F||$===i.RG32F||$===i.RGBA16F||$===i.RGBA32F)&&t.get("EXT_color_buffer_float"),$}function T(C,v){let G;return C?v===null||v===Dn||v===ks?G=i.DEPTH24_STENCIL8:v===Sn?G=i.DEPTH32F_STENCIL8:v===Bs&&(G=i.DEPTH24_STENCIL8,Jt("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):v===null||v===Dn||v===ks?G=i.DEPTH_COMPONENT24:v===Sn?G=i.DEPTH_COMPONENT32F:v===Bs&&(G=i.DEPTH_COMPONENT16),G}function S(C,v){return p(C)===!0||C.isFramebufferTexture&&C.minFilter!==Ve&&C.minFilter!==Xe?Math.log2(Math.max(v.width,v.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?v.mipmaps.length:1}function R(C){let v=C.target;v.removeEventListener("dispose",R),w(v),v.isVideoTexture&&h.delete(v),v.isHTMLTexture&&u.delete(v)}function _(C){let v=C.target;v.removeEventListener("dispose",_),I(v)}function w(C){let v=n.get(C);if(v.__webglInit===void 0)return;let G=C.source,B=f.get(G);if(B){let X=B[v.__cacheKey];X.usedTimes--,X.usedTimes===0&&P(C),Object.keys(B).length===0&&f.delete(G)}n.remove(C)}function P(C){let v=n.get(C);i.deleteTexture(v.__webglTexture);let G=C.source,B=f.get(G);delete B[v.__cacheKey],o.memory.textures--}function I(C){let v=n.get(C);if(C.depthTexture&&(C.depthTexture.dispose(),n.remove(C.depthTexture)),C.isWebGLCubeRenderTarget)for(let B=0;B<6;B++){if(Array.isArray(v.__webglFramebuffer[B]))for(let X=0;X<v.__webglFramebuffer[B].length;X++)i.deleteFramebuffer(v.__webglFramebuffer[B][X]);else i.deleteFramebuffer(v.__webglFramebuffer[B]);v.__webglDepthbuffer&&i.deleteRenderbuffer(v.__webglDepthbuffer[B])}else{if(Array.isArray(v.__webglFramebuffer))for(let B=0;B<v.__webglFramebuffer.length;B++)i.deleteFramebuffer(v.__webglFramebuffer[B]);else i.deleteFramebuffer(v.__webglFramebuffer);if(v.__webglDepthbuffer&&i.deleteRenderbuffer(v.__webglDepthbuffer),v.__webglMultisampledFramebuffer&&i.deleteFramebuffer(v.__webglMultisampledFramebuffer),v.__webglColorRenderbuffer)for(let B=0;B<v.__webglColorRenderbuffer.length;B++)v.__webglColorRenderbuffer[B]&&i.deleteRenderbuffer(v.__webglColorRenderbuffer[B]);v.__webglDepthRenderbuffer&&i.deleteRenderbuffer(v.__webglDepthRenderbuffer)}let G=C.textures;for(let B=0,X=G.length;B<X;B++){let at=n.get(G[B]);at.__webglTexture&&(i.deleteTexture(at.__webglTexture),o.memory.textures--),n.remove(G[B])}n.remove(C)}let A=0;function U(){A=0}function L(){return A}function k(C){A=C}function W(){let C=A;return C>=s.maxTextures&&Jt("WebGLTextures: Trying to use "+(C+1)+" texture units while this GPU supports only "+s.maxTextures),A+=1,C}function z(C){let v=[];return v.push(C.wrapS),v.push(C.wrapT),v.push(C.wrapR||0),v.push(C.magFilter),v.push(C.minFilter),v.push(C.anisotropy),v.push(C.internalFormat),v.push(C.format),v.push(C.type),v.push(C.generateMipmaps),v.push(C.premultiplyAlpha),v.push(C.flipY),v.push(C.unpackAlignment),v.push(C.colorSpace),v.join()}function Q(C,v){let G=n.get(C);if(C.isVideoTexture&&F(C),C.isRenderTargetTexture===!1&&C.isExternalTexture!==!0&&C.version>0&&G.__version!==C.version){let B=C.image;if(B===null)Jt("WebGLRenderer: Texture marked for update but no image data found.");else if(B.complete===!1)Jt("WebGLRenderer: Texture marked for update but image is incomplete");else{St(G,C,v);return}}else C.isExternalTexture&&(G.__webglTexture=C.sourceTexture?C.sourceTexture:null);e.bindTexture(i.TEXTURE_2D,G.__webglTexture,i.TEXTURE0+v)}function N(C,v){let G=n.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&G.__version!==C.version){St(G,C,v);return}else C.isExternalTexture&&(G.__webglTexture=C.sourceTexture?C.sourceTexture:null);e.bindTexture(i.TEXTURE_2D_ARRAY,G.__webglTexture,i.TEXTURE0+v)}function V(C,v){let G=n.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&G.__version!==C.version){St(G,C,v);return}e.bindTexture(i.TEXTURE_3D,G.__webglTexture,i.TEXTURE0+v)}function Y(C,v){let G=n.get(C);if(C.isCubeDepthTexture!==!0&&C.version>0&&G.__version!==C.version){wt(G,C,v);return}e.bindTexture(i.TEXTURE_CUBE_MAP,G.__webglTexture,i.TEXTURE0+v)}let yt={[vs]:i.REPEAT,[kn]:i.CLAMP_TO_EDGE,[ko]:i.MIRRORED_REPEAT},_t={[Ve]:i.NEAREST,[pu]:i.NEAREST_MIPMAP_NEAREST,[Gr]:i.NEAREST_MIPMAP_LINEAR,[Xe]:i.LINEAR,[_a]:i.LINEAR_MIPMAP_NEAREST,[Ri]:i.LINEAR_MIPMAP_LINEAR},te={[xu]:i.NEVER,[Mu]:i.ALWAYS,[yu]:i.LESS,[el]:i.LEQUAL,[vu]:i.EQUAL,[nl]:i.GEQUAL,[bu]:i.GREATER,[Su]:i.NOTEQUAL};function qt(C,v){if(v.type===Sn&&t.has("OES_texture_float_linear")===!1&&(v.magFilter===Xe||v.magFilter===_a||v.magFilter===Gr||v.magFilter===Ri||v.minFilter===Xe||v.minFilter===_a||v.minFilter===Gr||v.minFilter===Ri)&&Jt("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(C,i.TEXTURE_WRAP_S,yt[v.wrapS]),i.texParameteri(C,i.TEXTURE_WRAP_T,yt[v.wrapT]),(C===i.TEXTURE_3D||C===i.TEXTURE_2D_ARRAY)&&i.texParameteri(C,i.TEXTURE_WRAP_R,yt[v.wrapR]),i.texParameteri(C,i.TEXTURE_MAG_FILTER,_t[v.magFilter]),i.texParameteri(C,i.TEXTURE_MIN_FILTER,_t[v.minFilter]),v.compareFunction&&(i.texParameteri(C,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(C,i.TEXTURE_COMPARE_FUNC,te[v.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(v.magFilter===Ve||v.minFilter!==Gr&&v.minFilter!==Ri||v.type===Sn&&t.has("OES_texture_float_linear")===!1)return;if(v.anisotropy>1||n.get(v).__currentAnisotropy){let G=t.get("EXT_texture_filter_anisotropic");i.texParameterf(C,G.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(v.anisotropy,s.getMaxAnisotropy())),n.get(v).__currentAnisotropy=v.anisotropy}}}function Kt(C,v){let G=!1;C.__webglInit===void 0&&(C.__webglInit=!0,v.addEventListener("dispose",R));let B=v.source,X=f.get(B);X===void 0&&(X={},f.set(B,X));let at=z(v);if(at!==C.__cacheKey){X[at]===void 0&&(X[at]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,G=!0),X[at].usedTimes++;let ft=X[C.__cacheKey];ft!==void 0&&(X[C.__cacheKey].usedTimes--,ft.usedTimes===0&&P(v)),C.__cacheKey=at,C.__webglTexture=X[at].texture}return G}function et(C,v,G){return Math.floor(Math.floor(C/G)/v)}function st(C,v,G,B){let at=C.updateRanges;if(at.length===0)e.texSubImage2D(i.TEXTURE_2D,0,0,0,v.width,v.height,G,B,v.data);else{at.sort((Et,gt)=>Et.start-gt.start);let ft=0;for(let Et=1;Et<at.length;Et++){let gt=at[ft],mt=at[Et],Ot=gt.start+gt.count,tt=et(mt.start,v.width,4),vt=et(gt.start,v.width,4);mt.start<=Ot+1&&tt===vt&&et(mt.start+mt.count-1,v.width,4)===tt?gt.count=Math.max(gt.count,mt.start+mt.count-gt.start):(++ft,at[ft]=mt)}at.length=ft+1;let $=e.getParameter(i.UNPACK_ROW_LENGTH),nt=e.getParameter(i.UNPACK_SKIP_PIXELS),pt=e.getParameter(i.UNPACK_SKIP_ROWS);e.pixelStorei(i.UNPACK_ROW_LENGTH,v.width);for(let Et=0,gt=at.length;Et<gt;Et++){let mt=at[Et],Ot=Math.floor(mt.start/4),tt=Math.ceil(mt.count/4),vt=Ot%v.width,O=Math.floor(Ot/v.width),dt=tt,it=1;e.pixelStorei(i.UNPACK_SKIP_PIXELS,vt),e.pixelStorei(i.UNPACK_SKIP_ROWS,O),e.texSubImage2D(i.TEXTURE_2D,0,vt,O,dt,it,G,B,v.data)}C.clearUpdateRanges(),e.pixelStorei(i.UNPACK_ROW_LENGTH,$),e.pixelStorei(i.UNPACK_SKIP_PIXELS,nt),e.pixelStorei(i.UNPACK_SKIP_ROWS,pt)}}function St(C,v,G){let B=i.TEXTURE_2D;(v.isDataArrayTexture||v.isCompressedArrayTexture)&&(B=i.TEXTURE_2D_ARRAY),v.isData3DTexture&&(B=i.TEXTURE_3D);let X=Kt(C,v),at=v.source;e.bindTexture(B,C.__webglTexture,i.TEXTURE0+G);let ft=n.get(at);if(at.version!==ft.__version||X===!0){if(e.activeTexture(i.TEXTURE0+G),(typeof ImageBitmap!="undefined"&&v.image instanceof ImageBitmap)===!1){let it=le.getPrimaries(le.workingColorSpace),Tt=v.colorSpace===oi?null:le.getPrimaries(v.colorSpace),Rt=v.colorSpace===oi||it===Tt?i.NONE:i.BROWSER_DEFAULT_WEBGL;e.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,v.flipY),e.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),e.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Rt)}e.pixelStorei(i.UNPACK_ALIGNMENT,v.unpackAlignment);let nt=m(v.image,!1,s.maxTextureSize);nt=ee(v,nt);let pt=r.convert(v.format,v.colorSpace),Et=r.convert(v.type),gt=y(v.internalFormat,pt,Et,v.normalized,v.colorSpace,v.isVideoTexture);qt(B,v);let mt,Ot=v.mipmaps,tt=v.isVideoTexture!==!0,vt=ft.__version===void 0||X===!0,O=at.dataReady,dt=S(v,nt);if(v.isDepthTexture)gt=T(v.format===Ci,v.type),vt&&(tt?e.texStorage2D(i.TEXTURE_2D,1,gt,nt.width,nt.height):e.texImage2D(i.TEXTURE_2D,0,gt,nt.width,nt.height,0,pt,Et,null));else if(v.isDataTexture)if(Ot.length>0){tt&&vt&&e.texStorage2D(i.TEXTURE_2D,dt,gt,Ot[0].width,Ot[0].height);for(let it=0,Tt=Ot.length;it<Tt;it++)mt=Ot[it],tt?O&&e.texSubImage2D(i.TEXTURE_2D,it,0,0,mt.width,mt.height,pt,Et,mt.data):e.texImage2D(i.TEXTURE_2D,it,gt,mt.width,mt.height,0,pt,Et,mt.data);v.generateMipmaps=!1}else tt?(vt&&e.texStorage2D(i.TEXTURE_2D,dt,gt,nt.width,nt.height),O&&st(v,nt,pt,Et)):e.texImage2D(i.TEXTURE_2D,0,gt,nt.width,nt.height,0,pt,Et,nt.data);else if(v.isCompressedTexture)if(v.isCompressedArrayTexture){tt&&vt&&e.texStorage3D(i.TEXTURE_2D_ARRAY,dt,gt,Ot[0].width,Ot[0].height,nt.depth);for(let it=0,Tt=Ot.length;it<Tt;it++)if(mt=Ot[it],v.format!==Mn)if(pt!==null)if(tt){if(O)if(v.layerUpdates.size>0){let Rt=Dc(mt.width,mt.height,v.format,v.type);for(let ut of v.layerUpdates){let Xt=mt.data.subarray(ut*Rt/mt.data.BYTES_PER_ELEMENT,(ut+1)*Rt/mt.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,it,0,0,ut,mt.width,mt.height,1,pt,Xt)}}else e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,it,0,0,0,mt.width,mt.height,nt.depth,pt,mt.data)}else e.compressedTexImage3D(i.TEXTURE_2D_ARRAY,it,gt,mt.width,mt.height,nt.depth,0,mt.data,0,0);else Jt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else tt?O&&e.texSubImage3D(i.TEXTURE_2D_ARRAY,it,0,0,0,mt.width,mt.height,nt.depth,pt,Et,mt.data):e.texImage3D(i.TEXTURE_2D_ARRAY,it,gt,mt.width,mt.height,nt.depth,0,pt,Et,mt.data);v.layerUpdates.size>0&&v.clearLayerUpdates()}else{tt&&vt&&e.texStorage2D(i.TEXTURE_2D,dt,gt,Ot[0].width,Ot[0].height);for(let it=0,Tt=Ot.length;it<Tt;it++)mt=Ot[it],v.format!==Mn?pt!==null?tt?O&&e.compressedTexSubImage2D(i.TEXTURE_2D,it,0,0,mt.width,mt.height,pt,mt.data):e.compressedTexImage2D(i.TEXTURE_2D,it,gt,mt.width,mt.height,0,mt.data):Jt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):tt?O&&e.texSubImage2D(i.TEXTURE_2D,it,0,0,mt.width,mt.height,pt,Et,mt.data):e.texImage2D(i.TEXTURE_2D,it,gt,mt.width,mt.height,0,pt,Et,mt.data)}else if(v.isDataArrayTexture)if(tt){if(vt&&e.texStorage3D(i.TEXTURE_2D_ARRAY,dt,gt,nt.width,nt.height,nt.depth),O)if(v.layerUpdates.size>0){let it=Dc(nt.width,nt.height,v.format,v.type);for(let Tt of v.layerUpdates){let Rt=nt.data.subarray(Tt*it/nt.data.BYTES_PER_ELEMENT,(Tt+1)*it/nt.data.BYTES_PER_ELEMENT);e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,Tt,nt.width,nt.height,1,pt,Et,Rt)}v.clearLayerUpdates()}else e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,nt.width,nt.height,nt.depth,pt,Et,nt.data)}else e.texImage3D(i.TEXTURE_2D_ARRAY,0,gt,nt.width,nt.height,nt.depth,0,pt,Et,nt.data);else if(v.isData3DTexture)tt?(vt&&e.texStorage3D(i.TEXTURE_3D,dt,gt,nt.width,nt.height,nt.depth),O&&e.texSubImage3D(i.TEXTURE_3D,0,0,0,0,nt.width,nt.height,nt.depth,pt,Et,nt.data)):e.texImage3D(i.TEXTURE_3D,0,gt,nt.width,nt.height,nt.depth,0,pt,Et,nt.data);else if(v.isFramebufferTexture){if(vt)if(tt)e.texStorage2D(i.TEXTURE_2D,dt,gt,nt.width,nt.height);else{let it=nt.width,Tt=nt.height;for(let Rt=0;Rt<dt;Rt++)e.texImage2D(i.TEXTURE_2D,Rt,gt,it,Tt,0,pt,Et,null),it>>=1,Tt>>=1}}else if(v.isHTMLTexture){if("texElementImage2D"in i){let it=i.canvas;if(it.hasAttribute("layoutsubtree")||it.setAttribute("layoutsubtree","true"),nt.parentNode!==it){it.appendChild(nt),u.add(v),it.onpaint=Tt=>{let Rt=Tt.changedElements;for(let ut of u)Rt.includes(ut.image)&&(ut.needsUpdate=!0)},it.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,nt);else{let Rt=i.RGBA,ut=i.RGBA,Xt=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,Rt,ut,Xt,nt)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(Ot.length>0){if(tt&&vt){let it=ie(Ot[0]);e.texStorage2D(i.TEXTURE_2D,dt,gt,it.width,it.height)}for(let it=0,Tt=Ot.length;it<Tt;it++)mt=Ot[it],tt?O&&e.texSubImage2D(i.TEXTURE_2D,it,0,0,pt,Et,mt):e.texImage2D(i.TEXTURE_2D,it,gt,pt,Et,mt);v.generateMipmaps=!1}else if(tt){if(vt){let it=ie(nt);e.texStorage2D(i.TEXTURE_2D,dt,gt,it.width,it.height)}O&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,pt,Et,nt)}else e.texImage2D(i.TEXTURE_2D,0,gt,pt,Et,nt);p(v)&&b(B),ft.__version=at.version,v.onUpdate&&v.onUpdate(v)}C.__version=v.version}function wt(C,v,G){if(v.image.length!==6)return;let B=Kt(C,v),X=v.source;e.bindTexture(i.TEXTURE_CUBE_MAP,C.__webglTexture,i.TEXTURE0+G);let at=n.get(X);if(X.version!==at.__version||B===!0){e.activeTexture(i.TEXTURE0+G);let ft=le.getPrimaries(le.workingColorSpace),$=v.colorSpace===oi?null:le.getPrimaries(v.colorSpace),nt=v.colorSpace===oi||ft===$?i.NONE:i.BROWSER_DEFAULT_WEBGL;e.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,v.flipY),e.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,v.premultiplyAlpha),e.pixelStorei(i.UNPACK_ALIGNMENT,v.unpackAlignment),e.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,nt);let pt=v.isCompressedTexture||v.image[0].isCompressedTexture,Et=v.image[0]&&v.image[0].isDataTexture,gt=[];for(let ut=0;ut<6;ut++)!pt&&!Et?gt[ut]=m(v.image[ut],!0,s.maxCubemapSize):gt[ut]=Et?v.image[ut].image:v.image[ut],gt[ut]=ee(v,gt[ut]);let mt=gt[0],Ot=r.convert(v.format,v.colorSpace),tt=r.convert(v.type),vt=y(v.internalFormat,Ot,tt,v.normalized,v.colorSpace),O=v.isVideoTexture!==!0,dt=at.__version===void 0||B===!0,it=X.dataReady,Tt=S(v,mt);qt(i.TEXTURE_CUBE_MAP,v);let Rt;if(pt){O&&dt&&e.texStorage2D(i.TEXTURE_CUBE_MAP,Tt,vt,mt.width,mt.height);for(let ut=0;ut<6;ut++){Rt=gt[ut].mipmaps;for(let Xt=0;Xt<Rt.length;Xt++){let Vt=Rt[Xt];v.format!==Mn?Ot!==null?O?it&&e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ut,Xt,0,0,Vt.width,Vt.height,Ot,Vt.data):e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ut,Xt,vt,Vt.width,Vt.height,0,Vt.data):Jt("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):O?it&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ut,Xt,0,0,Vt.width,Vt.height,Ot,tt,Vt.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ut,Xt,vt,Vt.width,Vt.height,0,Ot,tt,Vt.data)}}}else{if(Rt=v.mipmaps,O&&dt){Rt.length>0&&Tt++;let ut=ie(gt[0]);e.texStorage2D(i.TEXTURE_CUBE_MAP,Tt,vt,ut.width,ut.height)}for(let ut=0;ut<6;ut++)if(Et){O?it&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ut,0,0,0,gt[ut].width,gt[ut].height,Ot,tt,gt[ut].data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ut,0,vt,gt[ut].width,gt[ut].height,0,Ot,tt,gt[ut].data);for(let Xt=0;Xt<Rt.length;Xt++){let ve=Rt[Xt].image[ut].image;O?it&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ut,Xt+1,0,0,ve.width,ve.height,Ot,tt,ve.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ut,Xt+1,vt,ve.width,ve.height,0,Ot,tt,ve.data)}}else{O?it&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ut,0,0,0,Ot,tt,gt[ut]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ut,0,vt,Ot,tt,gt[ut]);for(let Xt=0;Xt<Rt.length;Xt++){let Vt=Rt[Xt];O?it&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ut,Xt+1,0,0,Ot,tt,Vt.image[ut]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ut,Xt+1,vt,Ot,tt,Vt.image[ut])}}}p(v)&&b(i.TEXTURE_CUBE_MAP),at.__version=X.version,v.onUpdate&&v.onUpdate(v)}C.__version=v.version}function Mt(C,v,G,B,X,at){let ft=r.convert(G.format,G.colorSpace),$=r.convert(G.type),nt=y(G.internalFormat,ft,$,G.normalized,G.colorSpace),pt=n.get(v),Et=n.get(G);if(Et.__renderTarget=v,!pt.__hasExternalTextures){let gt=Math.max(1,v.width>>at),mt=Math.max(1,v.height>>at);X===i.TEXTURE_3D||X===i.TEXTURE_2D_ARRAY?e.texImage3D(X,at,nt,gt,mt,v.depth,0,ft,$,null):e.texImage2D(X,at,nt,gt,mt,0,ft,$,null)}e.bindFramebuffer(i.FRAMEBUFFER,C),Zt(v)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,B,X,Et.__webglTexture,0,Wt(v)):(X===i.TEXTURE_2D||X>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&X<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,B,X,Et.__webglTexture,at),e.bindFramebuffer(i.FRAMEBUFFER,null)}function Dt(C,v,G){if(i.bindRenderbuffer(i.RENDERBUFFER,C),v.depthBuffer){let B=v.depthTexture,X=B&&B.isDepthTexture?B.type:null,at=T(v.stencilBuffer,X),ft=v.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;Zt(v)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Wt(v),at,v.width,v.height):G?i.renderbufferStorageMultisample(i.RENDERBUFFER,Wt(v),at,v.width,v.height):i.renderbufferStorage(i.RENDERBUFFER,at,v.width,v.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,ft,i.RENDERBUFFER,C)}else{let B=v.textures;for(let X=0;X<B.length;X++){let at=B[X],ft=r.convert(at.format,at.colorSpace),$=r.convert(at.type),nt=y(at.internalFormat,ft,$,at.normalized,at.colorSpace);Zt(v)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Wt(v),nt,v.width,v.height):G?i.renderbufferStorageMultisample(i.RENDERBUFFER,Wt(v),nt,v.width,v.height):i.renderbufferStorage(i.RENDERBUFFER,nt,v.width,v.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function jt(C,v,G){let B=v.isWebGLCubeRenderTarget===!0;if(e.bindFramebuffer(i.FRAMEBUFFER,C),!(v.depthTexture&&v.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let X=n.get(v.depthTexture);if(X.__renderTarget=v,(!X.__webglTexture||v.depthTexture.image.width!==v.width||v.depthTexture.image.height!==v.height)&&(v.depthTexture.image.width=v.width,v.depthTexture.image.height=v.height,v.depthTexture.needsUpdate=!0),B){if(X.__webglInit===void 0&&(X.__webglInit=!0,v.depthTexture.addEventListener("dispose",R)),X.__webglTexture===void 0){X.__webglTexture=i.createTexture(),e.bindTexture(i.TEXTURE_CUBE_MAP,X.__webglTexture),qt(i.TEXTURE_CUBE_MAP,v.depthTexture);let pt=r.convert(v.depthTexture.format),Et=r.convert(v.depthTexture.type),gt;v.depthTexture.format===zn?gt=i.DEPTH_COMPONENT24:v.depthTexture.format===Ci&&(gt=i.DEPTH24_STENCIL8);for(let mt=0;mt<6;mt++)i.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+mt,0,gt,v.width,v.height,0,pt,Et,null)}}else Q(v.depthTexture,0);let at=X.__webglTexture,ft=Wt(v),$=B?i.TEXTURE_CUBE_MAP_POSITIVE_X+G:i.TEXTURE_2D,nt=v.depthTexture.format===Ci?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(v.depthTexture.format===zn)Zt(v)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,nt,$,at,0,ft):i.framebufferTexture2D(i.FRAMEBUFFER,nt,$,at,0);else if(v.depthTexture.format===Ci)Zt(v)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,nt,$,at,0,ft):i.framebufferTexture2D(i.FRAMEBUFFER,nt,$,at,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function ot(C){let v=n.get(C),G=C.isWebGLCubeRenderTarget===!0;if(v.__boundDepthTexture!==C.depthTexture){let B=C.depthTexture;if(v.__depthDisposeCallback&&v.__depthDisposeCallback(),B){let X=()=>{delete v.__boundDepthTexture,delete v.__depthDisposeCallback,B.removeEventListener("dispose",X)};B.addEventListener("dispose",X),v.__depthDisposeCallback=X}v.__boundDepthTexture=B}if(C.depthTexture&&!v.__autoAllocateDepthBuffer)if(G)for(let B=0;B<6;B++)jt(v.__webglFramebuffer[B],C,B);else{let B=C.texture.mipmaps;B&&B.length>0?jt(v.__webglFramebuffer[0],C,0):jt(v.__webglFramebuffer,C,0)}else if(G){v.__webglDepthbuffer=[];for(let B=0;B<6;B++)if(e.bindFramebuffer(i.FRAMEBUFFER,v.__webglFramebuffer[B]),v.__webglDepthbuffer[B]===void 0)v.__webglDepthbuffer[B]=i.createRenderbuffer(),Dt(v.__webglDepthbuffer[B],C,!1);else{let X=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,at=v.__webglDepthbuffer[B];i.bindRenderbuffer(i.RENDERBUFFER,at),i.framebufferRenderbuffer(i.FRAMEBUFFER,X,i.RENDERBUFFER,at)}}else{let B=C.texture.mipmaps;if(B&&B.length>0?e.bindFramebuffer(i.FRAMEBUFFER,v.__webglFramebuffer[0]):e.bindFramebuffer(i.FRAMEBUFFER,v.__webglFramebuffer),v.__webglDepthbuffer===void 0)v.__webglDepthbuffer=i.createRenderbuffer(),Dt(v.__webglDepthbuffer,C,!1);else{let X=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,at=v.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,at),i.framebufferRenderbuffer(i.FRAMEBUFFER,X,i.RENDERBUFFER,at)}}e.bindFramebuffer(i.FRAMEBUFFER,null)}function ht(C,v,G){let B=n.get(C);v!==void 0&&Mt(B.__webglFramebuffer,C,C.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),G!==void 0&&ot(C)}function rt(C){let v=C.texture,G=n.get(C),B=n.get(v);C.addEventListener("dispose",_);let X=C.textures,at=C.isWebGLCubeRenderTarget===!0,ft=X.length>1;if(ft||(B.__webglTexture===void 0&&(B.__webglTexture=i.createTexture()),B.__version=v.version,o.memory.textures++),at){G.__webglFramebuffer=[];for(let $=0;$<6;$++)if(v.mipmaps&&v.mipmaps.length>0){G.__webglFramebuffer[$]=[];for(let nt=0;nt<v.mipmaps.length;nt++)G.__webglFramebuffer[$][nt]=i.createFramebuffer()}else G.__webglFramebuffer[$]=i.createFramebuffer()}else{if(v.mipmaps&&v.mipmaps.length>0){G.__webglFramebuffer=[];for(let $=0;$<v.mipmaps.length;$++)G.__webglFramebuffer[$]=i.createFramebuffer()}else G.__webglFramebuffer=i.createFramebuffer();if(ft)for(let $=0,nt=X.length;$<nt;$++){let pt=n.get(X[$]);pt.__webglTexture===void 0&&(pt.__webglTexture=i.createTexture(),o.memory.textures++)}if(C.samples>0&&Zt(C)===!1){G.__webglMultisampledFramebuffer=i.createFramebuffer(),G.__webglColorRenderbuffer=[],e.bindFramebuffer(i.FRAMEBUFFER,G.__webglMultisampledFramebuffer);for(let $=0;$<X.length;$++){let nt=X[$];G.__webglColorRenderbuffer[$]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,G.__webglColorRenderbuffer[$]);let pt=r.convert(nt.format,nt.colorSpace),Et=r.convert(nt.type),gt=y(nt.internalFormat,pt,Et,nt.normalized,nt.colorSpace,C.isXRRenderTarget===!0),mt=Wt(C);i.renderbufferStorageMultisample(i.RENDERBUFFER,mt,gt,C.width,C.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+$,i.RENDERBUFFER,G.__webglColorRenderbuffer[$])}i.bindRenderbuffer(i.RENDERBUFFER,null),C.depthBuffer&&(G.__webglDepthRenderbuffer=i.createRenderbuffer(),Dt(G.__webglDepthRenderbuffer,C,!0)),e.bindFramebuffer(i.FRAMEBUFFER,null)}}if(at){e.bindTexture(i.TEXTURE_CUBE_MAP,B.__webglTexture),qt(i.TEXTURE_CUBE_MAP,v);for(let $=0;$<6;$++)if(v.mipmaps&&v.mipmaps.length>0)for(let nt=0;nt<v.mipmaps.length;nt++)Mt(G.__webglFramebuffer[$][nt],C,v,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+$,nt);else Mt(G.__webglFramebuffer[$],C,v,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+$,0);p(v)&&b(i.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(ft){for(let $=0,nt=X.length;$<nt;$++){let pt=X[$],Et=n.get(pt),gt=i.TEXTURE_2D;(C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(gt=C.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(gt,Et.__webglTexture),qt(gt,pt),Mt(G.__webglFramebuffer,C,pt,i.COLOR_ATTACHMENT0+$,gt,0),p(pt)&&b(gt)}e.unbindTexture()}else{let $=i.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&($=C.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture($,B.__webglTexture),qt($,v),v.mipmaps&&v.mipmaps.length>0)for(let nt=0;nt<v.mipmaps.length;nt++)Mt(G.__webglFramebuffer[nt],C,v,i.COLOR_ATTACHMENT0,$,nt);else Mt(G.__webglFramebuffer,C,v,i.COLOR_ATTACHMENT0,$,0);p(v)&&b($),e.unbindTexture()}C.depthBuffer&&ot(C)}function lt(C){let v=C.textures;for(let G=0,B=v.length;G<B;G++){let X=v[G];if(p(X)){let at=M(C),ft=n.get(X).__webglTexture;e.bindTexture(at,ft),b(at),e.unbindTexture()}}}let xt=[],kt=[];function bt(C){if(C.samples>0){if(Zt(C)===!1){let v=C.textures,G=C.width,B=C.height,X=i.COLOR_BUFFER_BIT,at=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ft=n.get(C),$=v.length>1;if($)for(let pt=0;pt<v.length;pt++)e.bindFramebuffer(i.FRAMEBUFFER,ft.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+pt,i.RENDERBUFFER,null),e.bindFramebuffer(i.FRAMEBUFFER,ft.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+pt,i.TEXTURE_2D,null,0);e.bindFramebuffer(i.READ_FRAMEBUFFER,ft.__webglMultisampledFramebuffer);let nt=C.texture.mipmaps;nt&&nt.length>0?e.bindFramebuffer(i.DRAW_FRAMEBUFFER,ft.__webglFramebuffer[0]):e.bindFramebuffer(i.DRAW_FRAMEBUFFER,ft.__webglFramebuffer);for(let pt=0;pt<v.length;pt++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(X|=i.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(X|=i.STENCIL_BUFFER_BIT)),$){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,ft.__webglColorRenderbuffer[pt]);let Et=n.get(v[pt]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Et,0)}i.blitFramebuffer(0,0,G,B,0,0,G,B,X,i.NEAREST),l===!0&&(xt.length=0,kt.length=0,xt.push(i.COLOR_ATTACHMENT0+pt),C.depthBuffer&&C.storeMultisampledDepthBuffer===!1&&(xt.push(at),kt.push(at),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,kt)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,xt))}if(e.bindFramebuffer(i.READ_FRAMEBUFFER,null),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),$)for(let pt=0;pt<v.length;pt++){e.bindFramebuffer(i.FRAMEBUFFER,ft.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+pt,i.RENDERBUFFER,ft.__webglColorRenderbuffer[pt]);let Et=n.get(v[pt]).__webglTexture;e.bindFramebuffer(i.FRAMEBUFFER,ft.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+pt,i.TEXTURE_2D,Et,0)}e.bindFramebuffer(i.DRAW_FRAMEBUFFER,ft.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.storeMultisampledDepthBuffer===!1&&l){let v=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[v])}}}function Wt(C){return Math.min(s.maxSamples,C.samples)}function Zt(C){let v=n.get(C);return C.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&v.__useRenderToTexture!==!1}function F(C){let v=o.render.frame;h.get(C)!==v&&(h.set(C,v),C.update())}function ee(C,v){let G=C.colorSpace,B=C.format,X=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||G!==hr&&G!==oi&&(le.getTransfer(G)===fe?(B!==Mn||X!==rn)&&Jt("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Qt("WebGLTextures: Unsupported texture color space:",G)),v}function ie(C){return typeof HTMLImageElement!="undefined"&&C instanceof HTMLImageElement?(c.width=C.naturalWidth||C.width,c.height=C.naturalHeight||C.height):typeof VideoFrame!="undefined"&&C instanceof VideoFrame?(c.width=C.displayWidth,c.height=C.displayHeight):(c.width=C.width,c.height=C.height),c}this.allocateTextureUnit=W,this.resetTextureUnits=U,this.getTextureUnits=L,this.setTextureUnits=k,this.setTexture2D=Q,this.setTexture2DArray=N,this.setTexture3D=V,this.setTextureCube=Y,this.rebindTextures=ht,this.setupRenderTarget=rt,this.updateRenderTargetMipmap=lt,this.updateMultisampleRenderTarget=bt,this.setupDepthRenderbuffer=ot,this.setupFrameBufferTexture=Mt,this.useMultisampledRTT=Zt,this.isReversedDepthBuffer=function(){return e.buffers.depth.getReversed()}}function K_(i,t){function e(n,s=oi){let r,o=le.getTransfer(s);if(n===rn)return i.UNSIGNED_BYTE;if(n===ya)return i.UNSIGNED_SHORT_4_4_4_4;if(n===va)return i.UNSIGNED_SHORT_5_5_5_1;if(n===bc)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Sc)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===yc)return i.BYTE;if(n===vc)return i.SHORT;if(n===Bs)return i.UNSIGNED_SHORT;if(n===xa)return i.INT;if(n===Dn)return i.UNSIGNED_INT;if(n===Sn)return i.FLOAT;if(n===Nn)return i.HALF_FLOAT;if(n===Mc)return i.ALPHA;if(n===Ec)return i.RGB;if(n===Mn)return i.RGBA;if(n===zn)return i.DEPTH_COMPONENT;if(n===Ci)return i.DEPTH_STENCIL;if(n===ba)return i.RED;if(n===Sa)return i.RED_INTEGER;if(n===Pi)return i.RG;if(n===Ma)return i.RG_INTEGER;if(n===Ea)return i.RGBA_INTEGER;if(n===Wr||n===Xr||n===qr||n===Yr)if(o===fe)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Wr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Xr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===qr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Yr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Wr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Xr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===qr)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Yr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Ta||n===wa||n===Aa||n===Ra)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Ta)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===wa)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Aa)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Ra)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Ca||n===Pa||n===Ia||n===La||n===Da||n===Zr||n===Na)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Ca||n===Pa)return o===fe?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Ia)return o===fe?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===La)return r.COMPRESSED_R11_EAC;if(n===Da)return r.COMPRESSED_SIGNED_R11_EAC;if(n===Zr)return r.COMPRESSED_RG11_EAC;if(n===Na)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===Ua||n===Fa||n===Oa||n===Ba||n===ka||n===za||n===Ha||n===Va||n===Ga||n===Wa||n===Xa||n===qa||n===Ya||n===Za)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Ua)return o===fe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Fa)return o===fe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Oa)return o===fe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Ba)return o===fe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===ka)return o===fe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===za)return o===fe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Ha)return o===fe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Va)return o===fe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Ga)return o===fe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Wa)return o===fe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Xa)return o===fe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===qa)return o===fe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Ya)return o===fe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Za)return o===fe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Ja||n===$a||n===Ka)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===Ja)return o===fe?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===$a)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Ka)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===ja||n===Qa||n===Jr||n===tl)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===ja)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Qa)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Jr)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===tl)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===ks?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:e}}var j_=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Q_=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,jc=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){let n=new Sr(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=n}}getMesh(t){if(this.texture!==null&&this.mesh===null){let e=t.cameras[0].viewport,n=new pn({vertexShader:j_,fragmentShader:Q_,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new Lt(new bn(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Qc=class extends In{constructor(t,e){super();let n=this,s=null,r=1,o=null,a="local-floor",l=1,c=null,h=null,u=null,d=null,f=null,g=null,x=typeof XRWebGLBinding!="undefined",m=new jc,p={},b=e.getContextAttributes(),M=null,y=null,T=[],S=[],R=new ct,_=null,w=null,P=new He;P.viewport=new Ee;let I=new He;I.viewport=new Ee;let A=[P,I],U=new da,L=null,k=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(et){let st=T[et];return st===void 0&&(st=new Es,T[et]=st),st.getTargetRaySpace()},this.getControllerGrip=function(et){let st=T[et];return st===void 0&&(st=new Es,T[et]=st),st.getGripSpace()},this.getHand=function(et){let st=T[et];return st===void 0&&(st=new Es,T[et]=st),st.getHandSpace()};function W(et){let st=S.indexOf(et.inputSource);if(st===-1)return;let St=T[st];St!==void 0&&(St.update(et.inputSource,et.frame,c||o),St.dispatchEvent({type:et.type,data:et.inputSource}))}function z(){s.removeEventListener("select",W),s.removeEventListener("selectstart",W),s.removeEventListener("selectend",W),s.removeEventListener("squeeze",W),s.removeEventListener("squeezestart",W),s.removeEventListener("squeezeend",W),s.removeEventListener("end",z),s.removeEventListener("inputsourceschange",Q);for(let et=0;et<T.length;et++){let st=S[et];st!==null&&(S[et]=null,T[et].disconnect(st))}L=null,k=null,m.reset();for(let et in p)delete p[et];if(t.setRenderTarget(M),f=null,d=null,u=null,s=null,y=null,Kt.stop(),n.isPresenting=!1,t.setPixelRatio(_),t.setSize(R.width,R.height,!1),w!==null){let et=w.camera;et.fov=w.fov,et.zoom=w.zoom,et.updateProjectionMatrix(),w=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(et){r=et,n.isPresenting===!0&&Jt("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(et){a=et,n.isPresenting===!0&&Jt("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(et){c=et},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return u===null&&x&&(u=new XRWebGLBinding(s,e)),u},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(et){if(s=et,s!==null){if(M=t.getRenderTarget(),s.addEventListener("select",W),s.addEventListener("selectstart",W),s.addEventListener("selectend",W),s.addEventListener("squeeze",W),s.addEventListener("squeezestart",W),s.addEventListener("squeezeend",W),s.addEventListener("end",z),s.addEventListener("inputsourceschange",Q),b.xrCompatible!==!0&&await e.makeXRCompatible(),_=t.getPixelRatio(),t.getSize(R),x&&"createProjectionLayer"in XRWebGLBinding.prototype){let St=null,wt=null,Mt=null;b.depth&&(Mt=b.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,St=b.stencil?Ci:zn,wt=b.stencil?ks:Dn);let Dt={colorFormat:e.RGBA8,depthFormat:Mt,scaleFactor:r};u=this.getBinding(),d=u.createProjectionLayer(Dt),s.updateRenderState({layers:[d]}),t.setPixelRatio(1),t.setSize(d.textureWidth,d.textureHeight,!1),y=new nn(d.textureWidth,d.textureHeight,{format:Mn,type:rn,depthTexture:new xi(d.textureWidth,d.textureHeight,wt,void 0,void 0,void 0,void 0,void 0,void 0,St),stencilBuffer:b.stencil,colorSpace:t.outputColorSpace,samples:b.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}else{let St={antialias:b.antialias,alpha:!0,depth:b.depth,stencil:b.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,e,St),s.updateRenderState({baseLayer:f}),t.setPixelRatio(1),t.setSize(f.framebufferWidth,f.framebufferHeight,!1),y=new nn(f.framebufferWidth,f.framebufferHeight,{format:Mn,type:rn,colorSpace:t.outputColorSpace,stencilBuffer:b.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await s.requestReferenceSpace(a),Kt.setContext(s),Kt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function Q(et){for(let st=0;st<et.removed.length;st++){let St=et.removed[st],wt=S.indexOf(St);wt>=0&&(S[wt]=null,T[wt].disconnect(St))}for(let st=0;st<et.added.length;st++){let St=et.added[st],wt=S.indexOf(St);if(wt===-1){for(let Dt=0;Dt<T.length;Dt++)if(Dt>=S.length){S.push(St),wt=Dt;break}else if(S[Dt]===null){S[Dt]=St,wt=Dt;break}if(wt===-1)break}let Mt=T[wt];Mt&&Mt.connect(St)}}let N=new D,V=new D;function Y(et,st,St){N.setFromMatrixPosition(st.matrixWorld),V.setFromMatrixPosition(St.matrixWorld);let wt=N.distanceTo(V),Mt=st.projectionMatrix.elements,Dt=St.projectionMatrix.elements,jt=Mt[14]/(Mt[10]-1),ot=Mt[14]/(Mt[10]+1),ht=(Mt[9]+1)/Mt[5],rt=(Mt[9]-1)/Mt[5],lt=(Mt[8]-1)/Mt[0],xt=(Dt[8]+1)/Dt[0],kt=jt*lt,bt=jt*xt,Wt=wt/(-lt+xt),Zt=Wt*-lt;if(st.matrixWorld.decompose(et.position,et.quaternion,et.scale),et.translateX(Zt),et.translateZ(Wt),et.matrixWorld.compose(et.position,et.quaternion,et.scale),et.matrixWorldInverse.copy(et.matrixWorld).invert(),Mt[10]===-1)et.projectionMatrix.copy(st.projectionMatrix),et.projectionMatrixInverse.copy(st.projectionMatrixInverse);else{let F=jt+Wt,ee=ot+Wt,ie=kt-Zt,C=bt+(wt-Zt),v=ht*ot/ee*F,G=rt*ot/ee*F;et.projectionMatrix.makePerspective(ie,C,v,G,F,ee),et.projectionMatrixInverse.copy(et.projectionMatrix).invert()}}function yt(et,st){st===null?et.matrixWorld.copy(et.matrix):et.matrixWorld.multiplyMatrices(st.matrixWorld,et.matrix),et.matrixWorldInverse.copy(et.matrixWorld).invert()}this.updateCamera=function(et){if(s===null)return;let st=et.near,St=et.far;m.texture!==null&&(m.depthNear>0&&(st=m.depthNear),m.depthFar>0&&(St=m.depthFar)),U.near=I.near=P.near=st,U.far=I.far=P.far=St,(L!==U.near||k!==U.far)&&(s.updateRenderState({depthNear:U.near,depthFar:U.far}),L=U.near,k=U.far),U.layers.mask=et.layers.mask|6,P.layers.mask=U.layers.mask&-5,I.layers.mask=U.layers.mask&-3;let wt=et.parent,Mt=U.cameras;yt(U,wt);for(let Dt=0;Dt<Mt.length;Dt++)yt(Mt[Dt],wt);Mt.length===2?Y(U,P,I):U.projectionMatrix.copy(P.projectionMatrix),w===null&&et.isPerspectiveCamera&&(w={camera:et,fov:et.fov,zoom:et.zoom}),_t(et,U,wt)};function _t(et,st,St){St===null?et.matrix.copy(st.matrixWorld):(et.matrix.copy(St.matrixWorld),et.matrix.invert(),et.matrix.multiply(st.matrixWorld)),et.matrix.decompose(et.position,et.quaternion,et.scale),et.updateMatrixWorld(!0),et.projectionMatrix.copy(st.projectionMatrix),et.projectionMatrixInverse.copy(st.projectionMatrixInverse),et.isPerspectiveCamera&&(et.fov=Gi*2*Math.atan(1/et.projectionMatrix.elements[5]),et.zoom=1)}this.getCamera=function(){return U},this.getFoveation=function(){if(!(d===null&&f===null))return l},this.setFoveation=function(et){l=et,d!==null&&(d.fixedFoveation=et),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=et)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(U)},this.getCameraTexture=function(et){return p[et]};let te=null;function qt(et,st){if(h=st.getViewerPose(c||o),g=st,h!==null){let St=h.views;f!==null&&(t.setRenderTargetFramebuffer(y,f.framebuffer),t.setRenderTarget(y));let wt=!1;St.length!==U.cameras.length&&(U.cameras.length=0,wt=!0);for(let ot=0;ot<St.length;ot++){let ht=St[ot],rt=null;if(f!==null)rt=f.getViewport(ht);else{let xt=u.getViewSubImage(d,ht);rt=xt.viewport,ot===0&&(t.setRenderTargetTextures(y,xt.colorTexture,xt.depthStencilTexture),t.setRenderTarget(y))}let lt=A[ot];lt===void 0&&(lt=new He,lt.layers.enable(ot),lt.viewport=new Ee,A[ot]=lt),lt.matrix.fromArray(ht.transform.matrix),lt.matrix.decompose(lt.position,lt.quaternion,lt.scale),lt.projectionMatrix.fromArray(ht.projectionMatrix),lt.projectionMatrixInverse.copy(lt.projectionMatrix).invert(),lt.viewport.set(rt.x,rt.y,rt.width,rt.height),ot===0&&(U.matrix.copy(lt.matrix),U.matrix.decompose(U.position,U.quaternion,U.scale)),wt===!0&&U.cameras.push(lt)}let Mt=s.enabledFeatures;if(Mt&&Mt.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&x){u=n.getBinding();let ot=u.getDepthInformation(St[0]);ot&&ot.isValid&&ot.texture&&m.init(ot,s.renderState)}if(Mt&&Mt.includes("camera-access")&&x){t.state.unbindTexture(),u=n.getBinding();for(let ot=0;ot<St.length;ot++){let ht=St[ot].camera;if(ht){let rt=p[ht];rt||(rt=new Sr,p[ht]=rt);let lt=u.getCameraImage(ht);rt.sourceTexture=lt}}}}for(let St=0;St<T.length;St++){let wt=S[St],Mt=T[St];wt!==null&&Mt!==void 0&&Mt.update(wt,st,c||o)}te&&te(et,st),st.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:st}),g=null}let Kt=new sd;Kt.setAnimationLoop(qt),this.setAnimationLoop=function(et){te=et},this.dispose=function(){}}},tx=new xe,hd=new ne;hd.set(-1,0,0,0,1,0,0,0,1);function ex(i,t){function e(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,Pc(i)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function s(m,p,b,M,y){p.isNodeMaterial?p.uniformsNeedUpdate=!1:p.isMeshBasicMaterial?r(m,p):p.isMeshLambertMaterial?(r(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshToonMaterial?(r(m,p),u(m,p)):p.isMeshPhongMaterial?(r(m,p),h(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshStandardMaterial?(r(m,p),d(m,p),p.isMeshPhysicalMaterial&&f(m,p,y)):p.isMeshMatcapMaterial?(r(m,p),g(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),x(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(o(m,p),p.isLineDashedMaterial&&a(m,p)):p.isPointsMaterial?l(m,p,b,M):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,e(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,e(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===Ue&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,e(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===Ue&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,e(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,e(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,e(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);let b=t.get(p),M=b.envMap,y=b.envMapRotation;M&&(m.envMap.value=M,m.envMapRotation.value.setFromMatrix4(tx.makeRotationFromEuler(y)).transpose(),M.isCubeTexture&&M.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(hd),m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,e(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,e(p.aoMap,m.aoMapTransform))}function o(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,e(p.map,m.mapTransform))}function a(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,b,M){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*b,m.scale.value=M*.5,p.map&&(m.map.value=p.map,e(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,e(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function h(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function u(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function d(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,e(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,e(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function f(m,p,b){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,e(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,e(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,e(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,e(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,e(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Ue&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.retroreflectivity>0&&(m.retroreflectivity.value=p.retroreflectivity),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,e(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,e(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=b.texture,m.transmissionSamplerSize.value.set(b.width,b.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,e(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,e(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,e(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,e(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,e(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function x(m,p){let b=t.get(p).light;m.referencePosition.value.setFromMatrixPosition(b.matrixWorld),m.nearDistance.value=b.shadow.camera.near,m.farDistance.value=b.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function nx(i,t,e,n){let s={},r={},o=[],a=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(y,T){let S=T.program;n.uniformBlockBinding(y,S)}function c(y,T){let S=s[y.id];S===void 0&&(m(y),S=h(y),s[y.id]=S,y.addEventListener("dispose",b));let R=T.program;n.updateUBOMapping(y,R);let _=t.render.frame;r[y.id]!==_&&(d(y),r[y.id]=_)}function h(y){let T=u();y.__bindingPointIndex=T;let S=i.createBuffer(),R=y.__size,_=y.usage;return i.bindBuffer(i.UNIFORM_BUFFER,S),i.bufferData(i.UNIFORM_BUFFER,R,_),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,T,S),S}function u(){for(let y=0;y<a;y++)if(o.indexOf(y)===-1)return o.push(y),y;return Qt("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(y){let T=s[y.id],S=y.uniforms,R=y.__cache;i.bindBuffer(i.UNIFORM_BUFFER,T);for(let _=0,w=S.length;_<w;_++){let P=S[_];if(Array.isArray(P))for(let I=0,A=P.length;I<A;I++)f(P[I],_,I,R);else f(P,_,0,R)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function f(y,T,S,R){if(x(y,T,S,R)===!0){let _=y.__offset,w=y.value;if(Array.isArray(w)){let P=0;for(let I=0;I<w.length;I++){let A=w[I],U=p(A);g(A,y.__data,P),typeof A!="number"&&typeof A!="boolean"&&!A.isMatrix3&&!ArrayBuffer.isView(A)&&(P+=U.storage/Float32Array.BYTES_PER_ELEMENT)}}else g(w,y.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,_,y.__data)}}function g(y,T,S){typeof y=="number"||typeof y=="boolean"?T[0]=y:y.isMatrix3?(T[0]=y.elements[0],T[1]=y.elements[1],T[2]=y.elements[2],T[3]=0,T[4]=y.elements[3],T[5]=y.elements[4],T[6]=y.elements[5],T[7]=0,T[8]=y.elements[6],T[9]=y.elements[7],T[10]=y.elements[8],T[11]=0):ArrayBuffer.isView(y)?T.set(new y.constructor(y.buffer,y.byteOffset,T.length)):y.toArray(T,S)}function x(y,T,S,R){let _=y.value,w=T+"_"+S;if(R[w]===void 0)return typeof _=="number"||typeof _=="boolean"?R[w]=_:ArrayBuffer.isView(_)?R[w]=_.slice():R[w]=_.clone(),!0;{let P=R[w];if(typeof _=="number"||typeof _=="boolean"){if(P!==_)return R[w]=_,!0}else{if(ArrayBuffer.isView(_))return!0;if(P.equals(_)===!1)return P.copy(_),!0}}return!1}function m(y){let T=y.uniforms,S=0,R=16;for(let w=0,P=T.length;w<P;w++){let I=Array.isArray(T[w])?T[w]:[T[w]];for(let A=0,U=I.length;A<U;A++){let L=I[A],k=Array.isArray(L.value)?L.value:[L.value];for(let W=0,z=k.length;W<z;W++){let Q=k[W],N=p(Q),V=S%R,Y=V%N.boundary,yt=V+Y;S+=Y,yt!==0&&R-yt<N.storage&&(S+=R-yt),L.__data=new Float32Array(N.storage/Float32Array.BYTES_PER_ELEMENT),L.__offset=S,S+=N.storage}}}let _=S%R;return _>0&&(S+=R-_),y.__size=S,y.__cache={},this}function p(y){let T={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(T.boundary=4,T.storage=4):y.isVector2?(T.boundary=8,T.storage=8):y.isVector3||y.isColor?(T.boundary=16,T.storage=12):y.isVector4?(T.boundary=16,T.storage=16):y.isMatrix3?(T.boundary=48,T.storage=48):y.isMatrix4?(T.boundary=64,T.storage=64):y.isTexture?Jt("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(y)?(T.boundary=16,T.storage=y.byteLength):Jt("WebGLRenderer: Unsupported uniform value type.",y),T}function b(y){let T=y.target;T.removeEventListener("dispose",b);let S=o.indexOf(T.__bindingPointIndex);o.splice(S,1),i.deleteBuffer(s[T.id]),delete s[T.id],delete r[T.id]}function M(){for(let y in s)i.deleteBuffer(s[y]);o=[],s={},r={}}return{bind:l,update:c,dispose:M}}var ix=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Xn=null;function sx(){return Xn===null&&(Xn=new _r(ix,16,16,Pi,Nn),Xn.name="DFG_LUT",Xn.minFilter=Xe,Xn.magFilter=Xe,Xn.wrapS=kn,Xn.wrapT=kn,Xn.generateMipmaps=!1,Xn.needsUpdate=!0),Xn}var ol=class{constructor(t={}){let{canvas:e=Tu(),context:n=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1,outputBufferType:f=rn}=t;this.isWebGLRenderer=!0;let g;if(n!==null){if(typeof WebGLRenderingContext!="undefined"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=n.getContextAttributes().alpha}else g=o;let x=f,m=new Set([Ea,Ma,Sa]),p=new Set([rn,Dn,Bs,ks,ya,va]),b=new Uint32Array(4),M=new Int32Array(4),y=new D,T=null,S=null,R=[],_=[],w=null;this.domElement=e,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Ln,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let P=this,I=!1,A=null,U=null,L=null,k=null;this._outputColorSpace=Ge;let W=0,z=0,Q=null,N=-1,V=null,Y=new Ee,yt=new Ee,_t=null,te=new $t(0),qt=0,Kt=e.width,et=e.height,st=1,St=null,wt=null,Mt=new Ee(0,0,Kt,et),Dt=new Ee(0,0,Kt,et),jt=!1,ot=new As,ht=!1,rt=!1,lt=new xe,xt=new D,kt=new Ee,bt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Wt=!1;function Zt(){return Q===null?st:1}let F=n;function ee(E,H){return e.getContext(E,H)}let ie,C,v,G,B,X,at,ft,$,nt,pt,Et,gt,mt,Ot,tt,vt,O,dt,it,Tt,Rt,ut;try{let E={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${"186"}`),e.addEventListener("webglcontextlost",ve,!1),e.addEventListener("webglcontextrestored",ue,!1),e.addEventListener("webglcontextcreationerror",wn,!1),F===null){let H="webgl2";if(F=ee(H,E),F===null)throw ee(H)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Xt()}catch(E){throw e.removeEventListener("webglcontextlost",ve,!1),e.removeEventListener("webglcontextrestored",ue,!1),e.removeEventListener("webglcontextcreationerror",wn,!1),Qt("WebGLRenderer: "+E.message),E}function Xt(){ie=new ug(F),ie.init(),Tt=new K_(F,ie),C=new eg(F,ie,t,Tt),v=new J_(F,ie),C.reversedDepthBuffer&&d&&v.buffers.depth.setReversed(!0),U=F.createFramebuffer(),L=F.createFramebuffer(),k=F.createFramebuffer(),G=new pg(F),B=new U_,X=new $_(F,ie,v,B,C,Tt,G),at=new hg(P),ft=new gp(F),Rt=new Qm(F,ft),$=new dg(F,ft,G,Rt),nt=new gg(F,$,ft,Rt,G),O=new mg(F,C,X),Ot=new ng(B),pt=new N_(P,at,ie,C,Rt,Ot),Et=new ex(P,B),gt=new O_,mt=new G_(ie),vt=new jm(P,at,v,nt,g,l),tt=new Z_(P,nt,C),ut=new nx(F,G,C,v),dt=new tg(F,ie,G),it=new fg(F,ie,G),G.programs=pt.programs,P.capabilities=C,P.extensions=ie,P.properties=B,P.renderLists=gt,P.shadowMap=tt,P.state=v,P.info=G}x!==rn&&(w=new xg(x,e.width,e.height,a,s,r));let Vt=new Qc(P,F);this.xr=Vt,this.getContext=function(){return F},this.getContextAttributes=function(){return F.getContextAttributes()},this.forceContextLoss=function(){let E=ie.get("WEBGL_lose_context");E&&E.loseContext()},this.forceContextRestore=function(){let E=ie.get("WEBGL_lose_context");E&&E.restoreContext()},this.getPixelRatio=function(){return st},this.setPixelRatio=function(E){E!==void 0&&(st=E,this.setSize(Kt,et,!1))},this.getSize=function(E){return E.set(Kt,et)},this.setSize=function(E,H,j=!0){if(Vt.isPresenting){Jt("WebGLRenderer: Can't change size while VR device is presenting.");return}Kt=E,et=H,e.width=Math.floor(E*st),e.height=Math.floor(H*st),j===!0&&(e.style.width=E+"px",e.style.height=H+"px"),w!==null&&w.setSize(e.width,e.height),this.setViewport(0,0,E,H)},this.getDrawingBufferSize=function(E){return E.set(Kt*st,et*st).floor()},this.setDrawingBufferSize=function(E,H,j){Kt=E,et=H,st=j,e.width=Math.floor(E*j),e.height=Math.floor(H*j),this.setViewport(0,0,E,H)},this.setEffects=function(E){if(x===rn){Qt("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(E){for(let H=0;H<E.length;H++)if(E[H].isOutputPass===!0){Jt("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}w.setEffects(E||[])},this.getCurrentViewport=function(E){return E.copy(Y)},this.getViewport=function(E){return E.copy(Mt)},this.setViewport=function(E,H,j,Z){E.isVector4?Mt.set(E.x,E.y,E.z,E.w):Mt.set(E,H,j,Z),v.viewport(Y.copy(Mt).multiplyScalar(st).round())},this.getScissor=function(E){return E.copy(Dt)},this.setScissor=function(E,H,j,Z){E.isVector4?Dt.set(E.x,E.y,E.z,E.w):Dt.set(E,H,j,Z),v.scissor(yt.copy(Dt).multiplyScalar(st).round())},this.getScissorTest=function(){return jt},this.setScissorTest=function(E){v.setScissorTest(jt=E)},this.setOpaqueSort=function(E){St=E},this.setTransparentSort=function(E){wt=E},this.getClearColor=function(E){return E.copy(vt.getClearColor())},this.setClearColor=function(){vt.setClearColor(...arguments)},this.getClearAlpha=function(){return vt.getClearAlpha()},this.setClearAlpha=function(){vt.setClearAlpha(...arguments)},this.clear=function(E=!0,H=!0,j=!0){let Z=0;if(E){let J=!1;if(Q!==null){let It=Q.texture.format;J=m.has(It)}if(J){let It=Q.texture.type,Ft=p.has(It),Pt=vt.getClearColor(),zt=vt.getClearAlpha(),Gt=Pt.r,re=Pt.g,ae=Pt.b;Ft?(b[0]=Gt,b[1]=re,b[2]=ae,b[3]=zt,F.clearBufferuiv(F.COLOR,0,b)):(M[0]=Gt,M[1]=re,M[2]=ae,M[3]=zt,F.clearBufferiv(F.COLOR,0,M))}else Z|=F.COLOR_BUFFER_BIT}H&&(Z|=F.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),j&&(Z|=F.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),Z!==0&&F.clear(Z)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(E){E.setRenderer(this),A=E},this.dispose=function(){e.removeEventListener("webglcontextlost",ve,!1),e.removeEventListener("webglcontextrestored",ue,!1),e.removeEventListener("webglcontextcreationerror",wn,!1),vt.dispose(),gt.dispose(),mt.dispose(),B.dispose(),at.dispose(),nt.dispose(),Rt.dispose(),ut.dispose(),pt.dispose(),Vt.dispose(),Vt.removeEventListener("sessionstart",ah),Vt.removeEventListener("sessionend",lh),Fi.stop()};function ve(E){E.preventDefault(),wc("WebGLRenderer: Context Lost."),I=!0}function ue(){wc("WebGLRenderer: Context Restored."),I=!1;let E=G.autoReset,H=tt.enabled,j=tt.autoUpdate,Z=tt.needsUpdate,J=tt.type;Xt(),G.autoReset=E,tt.enabled=H,tt.autoUpdate=j,tt.needsUpdate=Z,tt.type=J}function wn(E){Qt("WebGLRenderer: A WebGL context could not be created. Reason: ",E.statusMessage)}function Fn(E){let H=E.target;H.removeEventListener("dispose",Fn),Bd(H)}function Bd(E){kd(E),B.remove(E)}function kd(E){let H=B.get(E).programs;H!==void 0&&(H.forEach(function(j){pt.releaseProgram(j)}),E.isShaderMaterial&&pt.releaseShaderCache(E))}this.renderBufferDirect=function(E,H,j,Z,J,It){H===null&&(H=bt);let Ft=J.isMesh&&J.matrixWorld.determinantAffine()<0,Pt=Vd(E,H,j,Z,J);v.setMaterial(Z,Ft);let zt=j.index,Gt=1;if(Z.wireframe===!0){if(zt=$.getWireframeAttribute(j),zt===void 0)return;Gt=2}let re=j.drawRange,ae=j.attributes.position,Ht=re.start*Gt,de=(re.start+re.count)*Gt;It!==null&&(Ht=Math.max(Ht,It.start*Gt),de=Math.min(de,(It.start+It.count)*Gt)),zt!==null?(Ht=Math.max(Ht,0),de=Math.min(de,zt.count)):ae!=null&&(Ht=Math.max(Ht,0),de=Math.min(de,ae.count));let Ie=de-Ht;if(Ie<0||Ie===1/0)return;Rt.setup(J,Z,Pt,j,zt);let Se,_e=dt;if(zt!==null&&(Se=ft.get(zt),_e=it,_e.setIndex(Se)),J.isMesh)Z.wireframe===!0?(v.setLineWidth(Z.wireframeLinewidth*Zt()),_e.setMode(F.LINES)):_e.setMode(F.TRIANGLES);else if(J.isLine){let Ye=Z.linewidth;Ye===void 0&&(Ye=1),v.setLineWidth(Ye*Zt()),J.isLineSegments?_e.setMode(F.LINES):J.isLineLoop?_e.setMode(F.LINE_LOOP):_e.setMode(F.LINE_STRIP)}else J.isPoints?_e.setMode(F.POINTS):J.isSprite&&_e.setMode(F.TRIANGLES);if(J.isBatchedMesh)if(ie.get("WEBGL_multi_draw"))_e.renderMultiDraw(J._multiDrawStarts,J._multiDrawCounts,J._multiDrawCount);else{let Ye=J._multiDrawStarts,Nt=J._multiDrawCounts,Qe=J._multiDrawCount,ce=zt?ft.get(zt).bytesPerElement:1,yn=B.get(Z).currentProgram.getUniforms();for(let On=0;On<Qe;On++)yn.setValue(F,"_gl_DrawID",On),_e.render(Ye[On]/ce,Nt[On])}else if(J.isInstancedMesh)_e.renderInstances(Ht,Ie,J.count);else if(j.isInstancedBufferGeometry){let Ye=j._maxInstanceCount!==void 0?j._maxInstanceCount:1/0,Nt=Math.min(j.instanceCount,Ye);_e.renderInstances(Ht,Ie,Nt)}else _e.render(Ht,Ie)};function oh(E,H,j,Z){A!==null&&E.isNodeMaterial&&A.setObject(Z,E),ht===!0&&Ot.setState(E,j,!1),E.transparent===!0&&E.side===Ce&&E.forceSinglePass===!1?(E.side=Ue,E.needsUpdate=!0,oo(E,H,Z),E.side=wi,E.needsUpdate=!0,oo(E,H,Z),E.side=Ce):oo(E,H,Z)}this.compile=function(E,H,j=null){j===null&&(j=E),A!==null&&A.renderStart(E,H,j),S=mt.get(j),S.init(H),_.push(S),j.traverseVisible(function(J){J.isLight&&J.layers.test(H.layers)&&(S.pushLight(J),J.castShadow&&S.pushShadow(J))}),E!==j&&E.traverseVisible(function(J){J.isLight&&J.layers.test(H.layers)&&(S.pushLight(J),J.castShadow&&S.pushShadow(J))}),S.setupLights(),A!==null&&A.updateLights(S.state.lightsArray),rt=this.localClippingEnabled,ht=Ot.init(this.clippingPlanes,rt),ht===!0&&Ot.setGlobalState(this.clippingPlanes,H),A!==null&&tt.render(S.state.shadowsArray,j,H);let Z=new Set;return E.traverse(function(J){if(!(J.isMesh||J.isPoints||J.isLine||J.isSprite))return;let It=J.material;if(It)if(Array.isArray(It))for(let Ft=0;Ft<It.length;Ft++){let Pt=It[Ft];oh(Pt,j,H,J),Z.add(Pt)}else oh(It,j,H,J),Z.add(It)}),S=_.pop(),A!==null&&A.renderEnd(),Z},this.compileAsync=function(E,H,j=null){let Z=this.compile(E,H,j);return new Promise(J=>{function It(){if(Z.forEach(function(Ft){let zt=B.get(Ft).currentProgram;(zt===void 0||zt.isReady())&&Z.delete(Ft)}),Z.size===0){J(E);return}setTimeout(It,10)}ie.get("KHR_parallel_shader_compile")!==null?It():setTimeout(It,10)})};let bl=null;function zd(E){bl&&bl(E)}function ah(){Fi.stop()}function lh(){Fi.start()}let Fi=new sd;Fi.setAnimationLoop(zd),typeof self!="undefined"&&Fi.setContext(self),this.setAnimationLoop=function(E){bl=E,Vt.setAnimationLoop(E),E===null?Fi.stop():Fi.start()},Vt.addEventListener("sessionstart",ah),Vt.addEventListener("sessionend",lh),this.render=function(E,H){if(H!==void 0&&H.isCamera!==!0){Qt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(I===!0)return;A!==null&&A.renderStart(E,H);let j=Vt.enabled===!0&&Vt.isPresenting===!0,Z=w!==null&&(Q===null||j)&&w.begin(P,Q);if(E.matrixWorldAutoUpdate===!0&&E.updateMatrixWorld(),H.parent===null&&H.matrixWorldAutoUpdate===!0&&H.updateMatrixWorld(),Vt.enabled===!0&&Vt.isPresenting===!0&&(w===null||w.isCompositing()===!1)&&(Vt.cameraAutoUpdate===!0&&Vt.updateCamera(H),H=Vt.getCamera()),E.isScene===!0&&E.onBeforeRender(P,E,H,Q),S=mt.get(E,_.length),S.init(H),S.state.textureUnits=X.getTextureUnits(),_.push(S),lt.multiplyMatrices(H.projectionMatrix,H.matrixWorldInverse),ot.setFromProjectionMatrix(lt,Pn,H.reversedDepth),rt=this.localClippingEnabled,ht=Ot.init(this.clippingPlanes,rt),T=gt.get(E,R.length),T.init(),R.push(T),Vt.enabled===!0&&Vt.isPresenting===!0){let Ft=P.xr.getDepthSensingMesh();Ft!==null&&Sl(Ft,H,-1/0,P.sortObjects)}Sl(E,H,0,P.sortObjects),T.finish(),A!==null&&A.updateLights(S.state.lightsArray),P.sortObjects===!0&&T.sort(St,wt),Wt=Vt.enabled===!1||Vt.isPresenting===!1||Vt.hasDepthSensing()===!1,Wt&&vt.addToRenderList(T,E),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),ht===!0&&Ot.beginShadows();let J=S.state.shadowsArray;if(tt.render(J,E,H),ht===!0&&Ot.endShadows(),(Z&&w.hasRenderPass())===!1){let Ft=T.opaque,Pt=T.transmissive;if(S.setupLights(),H.isArrayCamera){let zt=H.cameras;if(Pt.length>0)for(let Gt=0,re=zt.length;Gt<re;Gt++){let ae=zt[Gt];hh(Ft,Pt,E,ae)}Wt&&vt.render(E);for(let Gt=0,re=zt.length;Gt<re;Gt++){let ae=zt[Gt];ch(T,E,ae,ae.viewport)}}else Pt.length>0&&hh(Ft,Pt,E,H),Wt&&vt.render(E),ch(T,E,H)}Q!==null&&z===0&&(X.updateMultisampleRenderTarget(Q),X.updateRenderTargetMipmap(Q)),Z&&w.end(P),E.isScene===!0&&E.onAfterRender(P,E,H),Rt.resetDefaultState(),N=-1,V=null,_.pop(),_.length>0?(S=_[_.length-1],X.setTextureUnits(S.state.textureUnits),ht===!0&&Ot.setGlobalState(P.clippingPlanes,S.state.camera)):S=null,R.pop(),R.length>0?T=R[R.length-1]:T=null,A!==null&&A.renderEnd()};function Sl(E,H,j,Z){if(E.visible===!1)return;if(E.layers.test(H.layers)){if(E.isGroup)j=E.renderOrder;else if(E.isLOD)E.autoUpdate===!0&&E.update(H);else if(E.isLightProbeGrid)S.pushLightProbeGrid(E);else if(E.isLight)S.pushLight(E),E.castShadow&&S.pushShadow(E);else if(E.isSprite){if(!E.frustumCulled||E.intersectsFrustum(ot)){Z&&kt.setFromMatrixPosition(E.matrixWorld).applyMatrix4(lt);let Ft=nt.update(E),Pt=E.material;Pt.visible&&T.push(E,Ft,Pt,j,kt.z,null,H)}}else if((E.isMesh||E.isLine||E.isPoints)&&(!E.frustumCulled||E.intersectsFrustum(ot))){let Ft=nt.update(E),Pt=E.material;if(Z&&(E.boundingSphere!==void 0?(E.boundingSphere===null&&E.computeBoundingSphere(),kt.copy(E.boundingSphere.center)):(Ft.boundingSphere===null&&Ft.computeBoundingSphere(),kt.copy(Ft.boundingSphere.center)),kt.applyMatrix4(E.matrixWorld).applyMatrix4(lt)),Array.isArray(Pt)){let zt=Ft.groups;for(let Gt=0,re=zt.length;Gt<re;Gt++){let ae=zt[Gt],Ht=Pt[ae.materialIndex];Ht&&Ht.visible&&T.push(E,Ft,Ht,j,kt.z,ae,H)}}else Pt.visible&&T.push(E,Ft,Pt,j,kt.z,null,H)}}let It=E.children;for(let Ft=0,Pt=It.length;Ft<Pt;Ft++)Sl(It[Ft],H,j,Z)}function ch(E,H,j,Z){let{opaque:J,transmissive:It,transparent:Ft}=E;S.setupLightsView(j),ht===!0&&Ot.setGlobalState(P.clippingPlanes,j),Z&&v.viewport(Y.copy(Z)),J.length>0&&ro(J,H,j),It.length>0&&ro(It,H,j),Ft.length>0&&ro(Ft,H,j),v.buffers.depth.setTest(!0),v.buffers.depth.setMask(!0),v.buffers.color.setMask(!0),v.setPolygonOffset(!1)}function hh(E,H,j,Z){if((j.isScene===!0?j.overrideMaterial:null)!==null)return;if(S.state.transmissionRenderTarget[Z.id]===void 0){let Ht=ie.has("EXT_color_buffer_half_float")||ie.has("EXT_color_buffer_float");S.state.transmissionRenderTarget[Z.id]=new nn(1,1,{generateMipmaps:!0,type:Ht?Nn:rn,minFilter:Ri,samples:Math.max(4,C.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:le.workingColorSpace})}let It=S.state.transmissionRenderTarget[Z.id],Ft=Z.viewport||Y;It.setSize(Ft.z*P.transmissionResolutionScale,Ft.w*P.transmissionResolutionScale);let Pt=P.getRenderTarget(),zt=P.getActiveCubeFace(),Gt=P.getActiveMipmapLevel();P.setRenderTarget(It),P.getClearColor(te),qt=P.getClearAlpha(),qt<1&&P.setClearColor(16777215,.5),P.clear(),Wt&&vt.render(j);let re=P.toneMapping;P.toneMapping=Ln;let ae=Z.viewport;if(Z.viewport!==void 0&&(Z.viewport=void 0),S.setupLightsView(Z),ht===!0&&Ot.setGlobalState(P.clippingPlanes,Z),ro(E,j,Z),X.updateMultisampleRenderTarget(It),X.updateRenderTargetMipmap(It),ie.has("WEBGL_multisampled_render_to_texture")===!1){let Ht=!1;for(let de=0,Ie=H.length;de<Ie;de++){let Se=H[de],{object:_e,geometry:Ye,material:Nt,group:Qe}=Se;if(Nt.side===Ce&&_e.layers.test(Z.layers)){let ce=Nt.side;Nt.side=Ue,Nt.needsUpdate=!0,uh(_e,j,Z,Ye,Nt,Qe),Nt.side=ce,Nt.needsUpdate=!0,Ht=!0}}Ht===!0&&(X.updateMultisampleRenderTarget(It),X.updateRenderTargetMipmap(It))}P.setRenderTarget(Pt,zt,Gt),P.setClearColor(te,qt),ae!==void 0&&(Z.viewport=ae),P.toneMapping=re}function ro(E,H,j){let Z=H.isScene===!0?H.overrideMaterial:null;for(let J=0,It=E.length;J<It;J++){let Ft=E[J],{object:Pt,geometry:zt,group:Gt}=Ft,re=Ft.material;re.allowOverride===!0&&Z!==null&&(re=Z),Pt.layers.test(j.layers)&&uh(Pt,H,j,zt,re,Gt)}}function uh(E,H,j,Z,J,It){A!==null&&J.isNodeMaterial&&A.setObject(E,J),E.onBeforeRender(P,H,j,Z,J,It),E.modelViewMatrix.multiplyMatrices(j.matrixWorldInverse,E.matrixWorld),E.normalMatrix.getNormalMatrix(E.modelViewMatrix),J.onBeforeRender(P,H,j,Z,E,It),J.transparent===!0&&J.side===Ce&&J.forceSinglePass===!1?(J.side=Ue,J.needsUpdate=!0,P.renderBufferDirect(j,H,Z,J,E,It),J.side=wi,J.needsUpdate=!0,P.renderBufferDirect(j,H,Z,J,E,It),J.side=Ce):P.renderBufferDirect(j,H,Z,J,E,It),E.onAfterRender(P,H,j,Z,J,It)}function oo(E,H,j){H.isScene!==!0&&(H=bt);let Z=B.get(E),J=S.state.lights,It=S.state.shadowsArray,Ft=J.state.version,Pt=pt.getParameters(E,J.state,It,H,j,S.state.lightProbeGridArray),zt=pt.getProgramCacheKey(Pt),Gt=Z.programs;Z.environment=E.isMeshStandardMaterial||E.isMeshLambertMaterial||E.isMeshPhongMaterial?H.environment:null,Z.fog=H.fog;let re=E.isMeshStandardMaterial||E.isMeshLambertMaterial&&!E.envMap||E.isMeshPhongMaterial&&!E.envMap;Z.envMap=at.get(E.envMap||Z.environment,re),Z.envMapRotation=Z.environment!==null&&E.envMap===null?H.environmentRotation:E.envMapRotation,Gt===void 0&&(E.addEventListener("dispose",Fn),Gt=new Map,Z.programs=Gt);let ae=Gt.get(zt);if(ae!==void 0){if(Z.currentProgram===ae&&Z.lightsStateVersion===Ft)return fh(E,Pt),ae}else Pt.uniforms=pt.getUniforms(E),A!==null&&E.isNodeMaterial&&A.build(E,j,Pt),E.onBeforeCompile(Pt,P),ae=pt.acquireProgram(Pt,zt),Gt.set(zt,ae),Z.uniforms=Pt.uniforms;let Ht=Z.uniforms;return(!E.isShaderMaterial&&!E.isRawShaderMaterial||E.clipping===!0)&&(Ht.clippingPlanes=Ot.uniform),fh(E,Pt),Z.needsLights=Wd(E),Z.lightsStateVersion=Ft,Z.needsLights&&(Ht.ambientLightColor.value=J.state.ambient,Ht.lightProbe.value=J.state.probe,Ht.sunLights.value=J.state.sun,Ht.sunLightShadows.value=J.state.sunShadow,Ht.directionalLights.value=J.state.directional,Ht.directionalLightShadows.value=J.state.directionalShadow,Ht.spotLights.value=J.state.spot,Ht.spotLightShadows.value=J.state.spotShadow,Ht.rectAreaLights.value=J.state.rectArea,Ht.ltc_1.value=J.state.rectAreaLTC1,Ht.ltc_2.value=J.state.rectAreaLTC2,Ht.pointLights.value=J.state.point,Ht.pointLightShadows.value=J.state.pointShadow,Ht.hemisphereLights.value=J.state.hemi,Ht.sunShadowMatrix.value=J.state.sunShadowMatrix,Ht.sunShadowCascade.value=J.state.sunShadowCascade,Ht.directionalShadowMatrix.value=J.state.directionalShadowMatrix,Ht.spotLightMatrix.value=J.state.spotLightMatrix,Ht.spotLightMap.value=J.state.spotLightMap,Ht.pointShadowMatrix.value=J.state.pointShadowMatrix),Z.lightProbeGrid=S.state.lightProbeGridArray.length>0,Z.currentProgram=ae,Z.uniformsList=null,ae}function dh(E){if(E.uniformsList===null){let H=E.currentProgram.getUniforms();E.uniformsList=Vs.seqWithValue(H.seq,E.uniforms)}return E.uniformsList}function fh(E,H){let j=B.get(E);j.outputColorSpace=H.outputColorSpace,j.batching=H.batching,j.batchingColor=H.batchingColor,j.instancing=H.instancing,j.instancingColor=H.instancingColor,j.instancingMorph=H.instancingMorph,j.skinning=H.skinning,j.morphTargets=H.morphTargets,j.morphNormals=H.morphNormals,j.morphColors=H.morphColors,j.morphTargetsCount=H.morphTargetsCount,j.numClippingPlanes=H.numClippingPlanes,j.numIntersection=H.numClipIntersection,j.vertexAlphas=H.vertexAlphas,j.vertexTangents=H.vertexTangents,j.toneMapping=H.toneMapping}function Hd(E,H){if(E.length===0)return null;if(E.length===1)return E[0].texture!==null?E[0]:null;y.setFromMatrixPosition(H.matrixWorld);for(let j=0,Z=E.length;j<Z;j++){let J=E[j];if(J.texture!==null&&J.boundingBox.containsPoint(y))return J}return null}function Vd(E,H,j,Z,J){H.isScene!==!0&&(H=bt),X.resetTextureUnits();let It=H.fog,Ft=Z.isMeshStandardMaterial||Z.isMeshLambertMaterial||Z.isMeshPhongMaterial?H.environment:null,Pt=Q===null?P.outputColorSpace:Q.isXRRenderTarget===!0?Q.texture.colorSpace:le.workingColorSpace,zt=Z.isMeshStandardMaterial||Z.isMeshLambertMaterial&&!Z.envMap||Z.isMeshPhongMaterial&&!Z.envMap,Gt=at.get(Z.envMap||Ft,zt),re=Z.vertexColors===!0&&!!j.attributes.color&&j.attributes.color.itemSize===4,ae=!!j.attributes.tangent&&(!!Z.normalMap||Z.anisotropy>0),Ht=!!j.morphAttributes.position,de=!!j.morphAttributes.normal,Ie=!!j.morphAttributes.color,Se=Ln;Z.toneMapped&&(Q===null||Q.isXRRenderTarget===!0)&&(Se=P.toneMapping);let _e=j.morphAttributes.position||j.morphAttributes.normal||j.morphAttributes.color,Ye=_e!==void 0?_e.length:0,Nt=B.get(Z),Qe=S.state.lights;if(ht===!0&&(rt===!0||E!==V)){let be=E===V&&Z.id===N;Ot.setState(Z,E,be)}let ce=!1;Z.version===Nt.__version?(Nt.needsLights&&Nt.lightsStateVersion!==Qe.state.version||Nt.outputColorSpace!==Pt||J.isBatchedMesh&&Nt.batching===!1||!J.isBatchedMesh&&Nt.batching===!0||J.isBatchedMesh&&Nt.batchingColor===!0&&J._colorsTexture===null||J.isBatchedMesh&&Nt.batchingColor===!1&&J._colorsTexture!==null||J.isInstancedMesh&&Nt.instancing===!1||!J.isInstancedMesh&&Nt.instancing===!0||J.isSkinnedMesh&&Nt.skinning===!1||!J.isSkinnedMesh&&Nt.skinning===!0||J.isInstancedMesh&&Nt.instancingColor===!0&&J.instanceColor===null||J.isInstancedMesh&&Nt.instancingColor===!1&&J.instanceColor!==null||J.isInstancedMesh&&Nt.instancingMorph===!0&&J.morphTexture===null||J.isInstancedMesh&&Nt.instancingMorph===!1&&J.morphTexture!==null||Nt.envMap!==Gt||Z.fog===!0&&Nt.fog!==It||Nt.numClippingPlanes!==void 0&&(Nt.numClippingPlanes!==Ot.numPlanes||Nt.numIntersection!==Ot.numIntersection)||Nt.vertexAlphas!==re||Nt.vertexTangents!==ae||Nt.morphTargets!==Ht||Nt.morphNormals!==de||Nt.morphColors!==Ie||Nt.toneMapping!==Se||Nt.morphTargetsCount!==Ye||!!Nt.lightProbeGrid!=S.state.lightProbeGridArray.length>0)&&(ce=!0):(ce=!0,Nt.__version=Z.version);let yn=Nt.currentProgram;ce===!0&&(yn=oo(Z,H,J),A&&Z.isNodeMaterial&&A.onUpdateProgram(Z,yn,Nt));let On=!1,li=!1,es=!1,ge=yn.getUniforms(),Re=Nt.uniforms;if(v.useProgram(yn.program)&&(On=!0,li=!0,es=!0),Z.id!==N&&(N=Z.id,li=!0),Nt.needsLights){let be=Hd(S.state.lightProbeGridArray,J);Nt.lightProbeGrid!==be&&(Nt.lightProbeGrid=be,li=!0)}if(On||V!==E){v.buffers.depth.getReversed()&&E.reversedDepth!==!0&&(E._reversedDepth=!0,E.updateProjectionMatrix()),ge.setValue(F,"projectionMatrix",E.projectionMatrix),ge.setValue(F,"viewMatrix",E.matrixWorldInverse);let hi=ge.map.cameraPosition;hi!==void 0&&hi.setValue(F,xt.setFromMatrixPosition(E.matrixWorld)),C.logarithmicDepthBuffer&&ge.setValue(F,"logDepthBufFC",2/(Math.log(E.far+1)/Math.LN2)),(Z.isMeshPhongMaterial||Z.isMeshToonMaterial||Z.isMeshLambertMaterial||Z.isMeshBasicMaterial||Z.isMeshStandardMaterial||Z.isShaderMaterial)&&ge.setValue(F,"isOrthographic",E.isOrthographicCamera===!0),V!==E&&(V=E,li=!0,es=!0)}if(Nt.needsLights&&(Qe.state.sunShadowMap.length>0&&ge.setValue(F,"sunShadowMap",Qe.state.sunShadowMap,X),Qe.state.directionalShadowMap.length>0&&ge.setValue(F,"directionalShadowMap",Qe.state.directionalShadowMap,X),Qe.state.spotShadowMap.length>0&&ge.setValue(F,"spotShadowMap",Qe.state.spotShadowMap,X),Qe.state.pointShadowMap.length>0&&ge.setValue(F,"pointShadowMap",Qe.state.pointShadowMap,X)),J.isSkinnedMesh){ge.setOptional(F,J,"bindMatrix"),ge.setOptional(F,J,"bindMatrixInverse");let be=J.skeleton;be&&(be.boneTexture===null&&be.computeBoneTexture(),ge.setValue(F,"boneTexture",be.boneTexture,X))}J.isBatchedMesh&&(ge.setOptional(F,J,"batchingTexture"),ge.setValue(F,"batchingTexture",J._matricesTexture,X),ge.setOptional(F,J,"batchingIdTexture"),ge.setValue(F,"batchingIdTexture",J._indirectTexture,X),ge.setOptional(F,J,"batchingColorTexture"),J._colorsTexture!==null&&ge.setValue(F,"batchingColorTexture",J._colorsTexture,X));let ci=j.morphAttributes;if((ci.position!==void 0||ci.normal!==void 0||ci.color!==void 0)&&O.update(J,j,yn),(li||Nt.receiveShadow!==J.receiveShadow)&&(Nt.receiveShadow=J.receiveShadow,ge.setValue(F,"receiveShadow",J.receiveShadow)),(Z.isMeshStandardMaterial||Z.isMeshLambertMaterial||Z.isMeshPhongMaterial)&&Z.envMap===null&&H.environment!==null&&(Re.envMapIntensity.value=H.environmentIntensity),Re.dfgLUT!==void 0&&(Re.dfgLUT.value=sx()),li){if(ge.setValue(F,"toneMappingExposure",P.toneMappingExposure),Nt.needsLights&&Gd(Re,es),It&&Z.fog===!0&&Et.refreshFogUniforms(Re,It),Et.refreshMaterialUniforms(Re,Z,st,et,S.state.transmissionRenderTarget[E.id]),Nt.needsLights&&Nt.lightProbeGrid){let be=Nt.lightProbeGrid;Re.probesSH.value=be.texture,Re.probesMin.value.copy(be.boundingBox.min),Re.probesMax.value.copy(be.boundingBox.max),Re.probesResolution.value.copy(be.resolution)}Vs.upload(F,dh(Nt),Re,X)}if(Z.isShaderMaterial&&Z.uniformsNeedUpdate===!0&&(Vs.upload(F,dh(Nt),Re,X),Z.uniformsNeedUpdate=!1),Z.isSpriteMaterial&&ge.setValue(F,"center",J.center),ge.setValue(F,"modelViewMatrix",J.modelViewMatrix),ge.setValue(F,"normalMatrix",J.normalMatrix),ge.setValue(F,"modelMatrix",J.matrixWorld),Z.uniformsGroups!==void 0){let be=Z.uniformsGroups;for(let hi=0,ns=be.length;hi<ns;hi++){let mh=be[hi];ut.update(mh,yn),ut.bind(mh,yn)}}return yn}function Gd(E,H){E.ambientLightColor.needsUpdate=H,E.lightProbe.needsUpdate=H,E.sunLights.needsUpdate=H,E.sunLightShadows.needsUpdate=H,E.directionalLights.needsUpdate=H,E.directionalLightShadows.needsUpdate=H,E.pointLights.needsUpdate=H,E.pointLightShadows.needsUpdate=H,E.spotLights.needsUpdate=H,E.spotLightShadows.needsUpdate=H,E.rectAreaLights.needsUpdate=H,E.hemisphereLights.needsUpdate=H}function Wd(E){return E.isMeshLambertMaterial||E.isMeshToonMaterial||E.isMeshPhongMaterial||E.isMeshStandardMaterial||E.isShadowMaterial||E.isShaderMaterial&&E.lights===!0}this.getActiveCubeFace=function(){return W},this.getActiveMipmapLevel=function(){return z},this.getRenderTarget=function(){return Q},this.setRenderTargetTextures=function(E,H,j){let Z=B.get(E);Z.__autoAllocateDepthBuffer=E.resolveDepthBuffer===!1,Z.__autoAllocateDepthBuffer===!1&&(Z.__useRenderToTexture=!1),B.get(E.texture).__webglTexture=H,B.get(E.depthTexture).__webglTexture=Z.__autoAllocateDepthBuffer?void 0:j,Z.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(E,H){let j=B.get(E);j.__webglFramebuffer=H,j.__useDefaultFramebuffer=H===void 0},this.setRenderTarget=function(E,H=0,j=0){Q=E,W=H,z=j;let Z=null,J=!1,It=!1;if(E){let Pt=B.get(E);if(Pt.__useDefaultFramebuffer!==void 0){v.bindFramebuffer(F.FRAMEBUFFER,Pt.__webglFramebuffer),Y.copy(E.viewport),yt.copy(E.scissor),_t=E.scissorTest,v.viewport(Y),v.scissor(yt),v.setScissorTest(_t),N=-1;return}else if(Pt.__webglFramebuffer===void 0)X.setupRenderTarget(E);else if(Pt.__hasExternalTextures)X.rebindTextures(E,B.get(E.texture).__webglTexture,B.get(E.depthTexture).__webglTexture);else if(E.depthBuffer){let re=E.depthTexture;if(Pt.__boundDepthTexture!==re){if(re!==null&&B.has(re)&&(E.width!==re.image.width||E.height!==re.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");X.setupDepthRenderbuffer(E)}}let zt=E.texture;(zt.isData3DTexture||zt.isDataArrayTexture||zt.isCompressedArrayTexture)&&(It=!0);let Gt=B.get(E).__webglFramebuffer;E.isWebGLCubeRenderTarget?(Array.isArray(Gt[H])?Z=Gt[H][j]:Z=Gt[H],J=!0):E.samples>0&&X.useMultisampledRTT(E)===!1?Z=B.get(E).__webglMultisampledFramebuffer:Array.isArray(Gt)?Z=Gt[j]:Z=Gt,Y.copy(E.viewport),yt.copy(E.scissor),_t=E.scissorTest}else Y.copy(Mt).multiplyScalar(st).floor(),yt.copy(Dt).multiplyScalar(st).floor(),_t=jt;if(j!==0&&(Z=U),v.bindFramebuffer(F.FRAMEBUFFER,Z)&&v.drawBuffers(E,Z),v.viewport(Y),v.scissor(yt),v.setScissorTest(_t),J){let Pt=B.get(E.texture);F.framebufferTexture2D(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_CUBE_MAP_POSITIVE_X+H,Pt.__webglTexture,j)}else if(It){let Pt=H;for(let zt=0;zt<E.textures.length;zt++){let Gt=B.get(E.textures[zt]);F.framebufferTextureLayer(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0+zt,Gt.__webglTexture,j,Pt)}}else if(E!==null&&j!==0){let Pt=B.get(E.texture);F.framebufferTexture2D(F.FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,Pt.__webglTexture,j)}N=-1};function ph(E){let H=B.get(E);return(H.__readFormat!==E.format||H.__readType!==E.type)&&(H.__readFormat=E.format,H.__readType=E.type,H.__formatReadable=C.textureFormatReadable(E.format),H.__typeReadable=C.textureTypeReadable(E.type)),H}this.readRenderTargetPixels=function(E,H,j,Z,J,It,Ft,Pt=0){if(!(E&&E.isWebGLRenderTarget)){Qt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let zt=B.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&Ft!==void 0&&(zt=zt[Ft]),zt){v.bindFramebuffer(F.FRAMEBUFFER,zt);try{let Gt=E.textures[Pt],re=Gt.format,ae=Gt.type;E.textures.length>1&&F.readBuffer(F.COLOR_ATTACHMENT0+Pt);let Ht=ph(Gt);if(Ht.__formatReadable===!1){Qt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Ht.__typeReadable===!1){Qt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}H>=0&&H<=E.width-Z&&j>=0&&j<=E.height-J&&F.readPixels(H,j,Z,J,Tt.convert(re),Tt.convert(ae),It)}finally{let Gt=Q!==null?B.get(Q).__webglFramebuffer:null;v.bindFramebuffer(F.FRAMEBUFFER,Gt)}}},this.readRenderTargetPixelsAsync=async function(E,H,j,Z,J,It,Ft,Pt=0){if(!(E&&E.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let zt=B.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&Ft!==void 0&&(zt=zt[Ft]),zt)if(H>=0&&H<=E.width-Z&&j>=0&&j<=E.height-J){v.bindFramebuffer(F.FRAMEBUFFER,zt);let Gt=E.textures[Pt],re=Gt.format,ae=Gt.type;E.textures.length>1&&F.readBuffer(F.COLOR_ATTACHMENT0+Pt);let Ht=ph(Gt);if(Ht.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Ht.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let de=F.createBuffer();F.bindBuffer(F.PIXEL_PACK_BUFFER,de),F.bufferData(F.PIXEL_PACK_BUFFER,It.byteLength,F.STREAM_READ),F.readPixels(H,j,Z,J,Tt.convert(re),Tt.convert(ae),0),F.bindBuffer(F.PIXEL_PACK_BUFFER,null);let Ie=Q!==null?B.get(Q).__webglFramebuffer:null;v.bindFramebuffer(F.FRAMEBUFFER,Ie);let Se=F.fenceSync(F.SYNC_GPU_COMMANDS_COMPLETE,0);return F.flush(),await Au(F,Se,4),F.bindBuffer(F.PIXEL_PACK_BUFFER,de),F.getBufferSubData(F.PIXEL_PACK_BUFFER,0,It),F.bindBuffer(F.PIXEL_PACK_BUFFER,null),F.deleteBuffer(de),F.deleteSync(Se),It}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(E,H=null,j=0){let Z=Math.pow(2,-j),J=Math.floor(E.image.width*Z),It=Math.floor(E.image.height*Z),Ft=H!==null?H.x:0,Pt=H!==null?H.y:0;X.setTexture2D(E,0),F.copyTexSubImage2D(F.TEXTURE_2D,j,0,0,Ft,Pt,J,It),v.unbindTexture()},this.copyTextureToTexture=function(E,H,j=null,Z=null,J=0,It=0){let Ft,Pt,zt,Gt,re,ae,Ht,de,Ie,Se=E.isCompressedTexture?E.mipmaps[It]:E.image;if(j!==null)Ft=j.max.x-j.min.x,Pt=j.max.y-j.min.y,zt=j.isBox3?j.max.z-j.min.z:1,Gt=j.min.x,re=j.min.y,ae=j.isBox3?j.min.z:0;else{let Re=Math.pow(2,-J);Ft=Math.floor(Se.width*Re),Pt=Math.floor(Se.height*Re),E.isDataArrayTexture?zt=Se.depth:E.isData3DTexture?zt=Math.floor(Se.depth*Re):zt=1,Gt=0,re=0,ae=0}Z!==null?(Ht=Z.x,de=Z.y,Ie=Z.z):(Ht=0,de=0,Ie=0);let _e=Tt.convert(H.format),Ye=Tt.convert(H.type),Nt;H.isData3DTexture?(X.setTexture3D(H,0),Nt=F.TEXTURE_3D):H.isDataArrayTexture||H.isCompressedArrayTexture?(X.setTexture2DArray(H,0),Nt=F.TEXTURE_2D_ARRAY):(X.setTexture2D(H,0),Nt=F.TEXTURE_2D),v.activeTexture(F.TEXTURE0),v.pixelStorei(F.UNPACK_FLIP_Y_WEBGL,H.flipY),v.pixelStorei(F.UNPACK_PREMULTIPLY_ALPHA_WEBGL,H.premultiplyAlpha),v.pixelStorei(F.UNPACK_ALIGNMENT,H.unpackAlignment);let Qe=v.getParameter(F.UNPACK_ROW_LENGTH),ce=v.getParameter(F.UNPACK_IMAGE_HEIGHT),yn=v.getParameter(F.UNPACK_SKIP_PIXELS),On=v.getParameter(F.UNPACK_SKIP_ROWS),li=v.getParameter(F.UNPACK_SKIP_IMAGES);v.pixelStorei(F.UNPACK_ROW_LENGTH,Se.width),v.pixelStorei(F.UNPACK_IMAGE_HEIGHT,Se.height),v.pixelStorei(F.UNPACK_SKIP_PIXELS,Gt),v.pixelStorei(F.UNPACK_SKIP_ROWS,re),v.pixelStorei(F.UNPACK_SKIP_IMAGES,ae);let es=E.isDataArrayTexture||E.isData3DTexture,ge=H.isDataArrayTexture||H.isData3DTexture;if(E.isDepthTexture){let Re=B.get(E),ci=B.get(H),be=B.get(Re.__renderTarget),hi=B.get(ci.__renderTarget);v.bindFramebuffer(F.READ_FRAMEBUFFER,be.__webglFramebuffer),v.bindFramebuffer(F.DRAW_FRAMEBUFFER,hi.__webglFramebuffer);for(let ns=0;ns<zt;ns++)es&&(F.framebufferTextureLayer(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,B.get(E).__webglTexture,J,ae+ns),F.framebufferTextureLayer(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,B.get(H).__webglTexture,It,Ie+ns)),F.blitFramebuffer(Gt,re,Ft,Pt,Ht,de,Ft,Pt,F.DEPTH_BUFFER_BIT,F.NEAREST);v.bindFramebuffer(F.READ_FRAMEBUFFER,null),v.bindFramebuffer(F.DRAW_FRAMEBUFFER,null)}else if(J!==0||E.isRenderTargetTexture||B.has(E)){let Re=B.get(E),ci=B.get(H);v.bindFramebuffer(F.READ_FRAMEBUFFER,L),v.bindFramebuffer(F.DRAW_FRAMEBUFFER,k);for(let be=0;be<zt;be++)es?F.framebufferTextureLayer(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,Re.__webglTexture,J,ae+be):F.framebufferTexture2D(F.READ_FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,Re.__webglTexture,J),ge?F.framebufferTextureLayer(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,ci.__webglTexture,It,Ie+be):F.framebufferTexture2D(F.DRAW_FRAMEBUFFER,F.COLOR_ATTACHMENT0,F.TEXTURE_2D,ci.__webglTexture,It),J!==0?F.blitFramebuffer(Gt,re,Ft,Pt,Ht,de,Ft,Pt,F.COLOR_BUFFER_BIT,F.NEAREST):ge?F.copyTexSubImage3D(Nt,It,Ht,de,Ie+be,Gt,re,Ft,Pt):F.copyTexSubImage2D(Nt,It,Ht,de,Gt,re,Ft,Pt);v.bindFramebuffer(F.READ_FRAMEBUFFER,null),v.bindFramebuffer(F.DRAW_FRAMEBUFFER,null)}else ge?E.isDataTexture||E.isData3DTexture?F.texSubImage3D(Nt,It,Ht,de,Ie,Ft,Pt,zt,_e,Ye,Se.data):H.isCompressedArrayTexture?F.compressedTexSubImage3D(Nt,It,Ht,de,Ie,Ft,Pt,zt,_e,Se.data):F.texSubImage3D(Nt,It,Ht,de,Ie,Ft,Pt,zt,_e,Ye,Se):E.isDataTexture?F.texSubImage2D(F.TEXTURE_2D,It,Ht,de,Ft,Pt,_e,Ye,Se.data):E.isCompressedTexture?F.compressedTexSubImage2D(F.TEXTURE_2D,It,Ht,de,Se.width,Se.height,_e,Se.data):F.texSubImage2D(F.TEXTURE_2D,It,Ht,de,Ft,Pt,_e,Ye,Se);v.pixelStorei(F.UNPACK_ROW_LENGTH,Qe),v.pixelStorei(F.UNPACK_IMAGE_HEIGHT,ce),v.pixelStorei(F.UNPACK_SKIP_PIXELS,yn),v.pixelStorei(F.UNPACK_SKIP_ROWS,On),v.pixelStorei(F.UNPACK_SKIP_IMAGES,li),It===0&&H.generateMipmaps&&F.generateMipmap(Nt),v.unbindTexture()},this.initRenderTarget=function(E){B.get(E).__webglFramebuffer===void 0&&X.setupRenderTarget(E)},this.initTexture=function(E){E.isCubeTexture?X.setTextureCube(E,0):E.isData3DTexture?X.setTexture3D(E,0):E.isDataArrayTexture||E.isCompressedArrayTexture?X.setTexture2DArray(E,0):X.setTexture2D(E,0),v.unbindTexture()},this.resetState=function(){W=0,z=0,Q=null,v.reset(),Rt.reset()},typeof __THREE_DEVTOOLS__!="undefined"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Pn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=le._getDrawingBufferColorSpace(t),e.unpackColorSpace=le._getUnpackColorSpace()}};var cl=class extends Wi{constructor(){super(),this.name="RoomEnvironment",this.position.y=-3.5;let t=new sn;t.deleteAttribute("uv");let e=new pe({side:Ue}),n=new pe,s=new Or(16777215,900,28,2);s.position.set(.418,16.199,.3),this.add(s);let r=new Lt(t,e);r.position.set(-.757,13.219,.717),r.scale.set(31.713,28.305,28.591),this.add(r);let o=new yr(t,n,6),a=new De;a.position.set(-10.906,2.009,1.846),a.rotation.set(0,-.195,0),a.scale.set(2.328,7.905,4.651),a.updateMatrix(),o.setMatrixAt(0,a.matrix),a.position.set(-5.607,-.754,-.758),a.rotation.set(0,.994,0),a.scale.set(1.97,1.534,3.955),a.updateMatrix(),o.setMatrixAt(1,a.matrix),a.position.set(6.167,.857,7.803),a.rotation.set(0,.561,0),a.scale.set(3.927,6.285,3.687),a.updateMatrix(),o.setMatrixAt(2,a.matrix),a.position.set(-2.017,.018,6.124),a.rotation.set(0,.333,0),a.scale.set(2.002,4.566,2.064),a.updateMatrix(),o.setMatrixAt(3,a.matrix),a.position.set(2.291,-.756,-2.621),a.rotation.set(0,-.286,0),a.scale.set(1.546,1.552,1.496),a.updateMatrix(),o.setMatrixAt(4,a.matrix),a.position.set(-2.193,-.369,-5.547),a.rotation.set(0,.516,0),a.scale.set(3.875,3.487,2.986),a.updateMatrix(),o.setMatrixAt(5,a.matrix),this.add(o);let l=new Lt(t,Xs(50));l.position.set(-16.116,14.37,8.208),l.scale.set(.1,2.428,2.739),this.add(l);let c=new Lt(t,Xs(50));c.position.set(-16.109,18.021,-8.207),c.scale.set(.1,2.425,2.751),this.add(c);let h=new Lt(t,Xs(17));h.position.set(14.904,12.198,-1.832),h.scale.set(.15,4.265,6.331),this.add(h);let u=new Lt(t,Xs(43));u.position.set(-.462,8.89,14.52),u.scale.set(4.38,5.441,.088),this.add(u);let d=new Lt(t,Xs(20));d.position.set(3.235,11.486,-12.541),d.scale.set(2.5,2,.1),this.add(d);let f=new Lt(t,Xs(100));f.position.set(0,20,0),f.scale.set(1,.1,1),this.add(f)}dispose(){let t=new Set;this.traverse(e=>{e.isMesh&&(t.add(e.geometry),t.add(e.material))});for(let e of t)e.dispose()}};function Xs(i){return new Lr({color:0,emissive:16777215,emissiveIntensity:i})}var to=new D;function En(i,t,e,n,s,r){let o=2*Math.PI*s/4,a=Math.max(r-2*s,0),l=Math.PI/4;to.copy(t),to[n]=0,to.normalize();let c=.5*o/(o+a),h=1-to.angleTo(i)/l;return Math.sign(to[e])===1?h*c:a/(o+a)+c+c*(1-h)}var hl=class i extends sn{constructor(t=1,e=1,n=1,s=2,r=.1){let o=s*2+1;if(r=Math.min(t/2,e/2,n/2,r),super(1,1,1,o,o,o),this.type="RoundedBoxGeometry",this.parameters={width:t,height:e,depth:n,segments:s,radius:r},o===1)return;let a=this.toNonIndexed();this.index=null,this.attributes.position=a.attributes.position,this.attributes.normal=a.attributes.normal,this.attributes.uv=a.attributes.uv;let l=new D,c=new D,h=new D(t,e,n).divideScalar(2).subScalar(r),u=this.attributes.position.array,d=this.attributes.normal.array,f=this.attributes.uv.array,g=u.length/6,x=new D,m=.5/o;for(let p=0,b=0;p<u.length;p+=3,b+=2)switch(l.fromArray(u,p),c.copy(l),c.x-=Math.sign(c.x)*m,c.y-=Math.sign(c.y)*m,c.z-=Math.sign(c.z)*m,c.normalize(),u[p+0]=h.x*Math.sign(l.x)+c.x*r,u[p+1]=h.y*Math.sign(l.y)+c.y*r,u[p+2]=h.z*Math.sign(l.z)+c.z*r,d[p+0]=c.x,d[p+1]=c.y,d[p+2]=c.z,Math.floor(p/g)){case 0:x.set(1,0,0),f[b+0]=En(x,c,"z","y",r,n),f[b+1]=1-En(x,c,"y","z",r,e);break;case 1:x.set(-1,0,0),f[b+0]=1-En(x,c,"z","y",r,n),f[b+1]=1-En(x,c,"y","z",r,e);break;case 2:x.set(0,1,0),f[b+0]=1-En(x,c,"x","z",r,t),f[b+1]=En(x,c,"z","x",r,n);break;case 3:x.set(0,-1,0),f[b+0]=1-En(x,c,"x","z",r,t),f[b+1]=1-En(x,c,"z","x",r,n);break;case 4:x.set(0,0,1),f[b+0]=1-En(x,c,"x","y",r,t),f[b+1]=1-En(x,c,"y","x",r,e);break;case 5:x.set(0,0,-1),f[b+0]=En(x,c,"x","y",r,t),f[b+1]=1-En(x,c,"y","x",r,e);break}}static fromJSON(t){return new i(t.width,t.height,t.depth,t.segments,t.radius)}};var eo=typeof document!="undefined"&&typeof document.createElement=="function",we=Math.PI,on=we*2,At=we/2,ud=i=>i*we/180,Ii=(i,t,e)=>Math.max(t,Math.min(e,i)),Li=(i,t,e)=>i+(t-i)*e;function Yn(i,t,e,{repeat:n=null,srgb:s=!0}={}){if(!eo)return null;let r=document.createElement("canvas");r.width=i,r.height=t;let o=r.getContext("2d");e(o,i,t);let a=new br(r);return s&&(a.colorSpace=Ge),a.wrapS=a.wrapT=vs,n&&a.repeat.set(n[0],n[1]),a.needsUpdate=!0,a}function dd(i,t,e,n,s=.06,r=1){for(let o=0;o<n;o++){let a=Math.random()*255;i.fillStyle=`rgba(${a},${a},${a},${s})`,i.fillRect(Math.random()*t,Math.random()*e,r,r)}}function rx(i,t,e){i.fillStyle="#808080",i.fillRect(0,0,t,e),i.fillStyle="#c8c8c8";for(let n=-20;n<e+20;n+=22)for(let s=0;s<t;s+=20){let r=Math.floor(n/22)%2*10;i.save(),i.translate(s+r,n),i.rotate(.5),i.fillRect(-9,-4,18,8),i.restore()}i.fillStyle="#5a5a5a";for(let n=0;n<t;n+=22)i.fillRect(n,0,3,e)}function ox(i,t,e){i.fillStyle="#d8d8d8",i.fillRect(0,0,t,e),i.strokeStyle="rgba(255,255,255,0.35)",i.lineWidth=2;for(let n=0;n<t;n+=6)i.beginPath(),i.moveTo(n,0),i.lineTo(n,e),i.stroke();for(let n=0;n<e;n+=6)i.beginPath(),i.moveTo(0,n),i.lineTo(t,n),i.stroke();i.strokeStyle="rgba(0,0,0,0.18)",i.lineWidth=3;for(let n=0;n<t;n+=64)i.beginPath(),i.moveTo(n,0),i.lineTo(n,e),i.stroke();dd(i,t,e,2600,.05,2)}function ax(i,t,e){i.fillStyle="#a87542",i.fillRect(0,0,t,e);for(let n=0;n<26;n++){let s=n/26*e;i.fillStyle=n%2?"rgba(90,52,24,0.25)":"rgba(220,170,110,0.16)",i.fillRect(0,s,t,e/26-2),i.fillStyle="rgba(60,34,14,0.5)",i.fillRect(0,s+e/26-2,t,2)}for(let n=0;n<90;n++){i.strokeStyle=`rgba(70,40,18,${.05+Math.random()*.12})`,i.beginPath();let s=Math.random()*e;i.moveTo(0,s),i.bezierCurveTo(t*.3,s+6,t*.7,s-8,t,s+3),i.stroke()}}function lx(i,t,e){i.fillStyle="#b9bcc0",i.fillRect(0,0,t,e);for(let n=0;n<400;n++){i.strokeStyle=`rgba(255,255,255,${.02+Math.random()*.07})`,i.beginPath();let s=Math.random()*e;i.moveTo(0,s),i.lineTo(t,s+(Math.random()-.5)*3),i.stroke()}dd(i,t,e,1500,.03,1)}function Di(i,t={}){let{bg:e="#12161b",fg:n="#f2ecdf",accent:s="#e8b45a",width:r=512,height:o=128,font:a="bold 54px Arial, sans-serif",sub:l="",subFont:c="bold 22px Arial, sans-serif",border:h=!0}=t;return Yn(r,o,(u,d,f)=>{u.fillStyle=e,u.fillRect(0,0,d,f),h&&(u.strokeStyle=s,u.lineWidth=6,u.strokeRect(6,6,d-12,f-12)),u.fillStyle=s,u.fillRect(20,20,10,f-40),u.fillStyle=n,u.font=a,u.textBaseline="middle",u.fillText(i,48,l?f*.42:f*.52),l&&(u.fillStyle="rgba(242,236,223,0.7)",u.font=c,u.fillText(l,50,f*.72))})}function Ys(i){return Yn(256,64,(t,e,n)=>{t.fillStyle="#f2f2ea",t.fillRect(0,0,e,n),t.fillStyle="#1b2634",t.fillRect(0,0,34,n),t.fillStyle="#f2f2ea",t.font="bold 13px Arial",t.fillText("RUS",4,n-12),t.fillStyle="#111",t.font="bold 40px Arial",t.textAlign="center",t.fillText(i,144,46),t.strokeStyle="#777",t.lineWidth=3,t.strokeRect(1,1,e-2,n-2)})}function fd(i=null){var o,a,l;let t=Math.min(8,(l=(a=(o=i==null?void 0:i.capabilities)==null?void 0:o.getMaxAnisotropy)==null?void 0:a.call(o))!=null?l:4),e={tread:Yn(256,256,rx,{srgb:!1}),tarp:Yn(512,512,ox,{repeat:[3,2]}),wood:Yn(512,512,ax,{repeat:[1,4]}),metal:Yn(512,512,lx,{repeat:[2,1]})};for(let c of Object.values(e))c&&(c.anisotropy=t);let n=c=>new pe(c),s=c=>new ri(c);return{paint(c,h={}){var u,d,f,g,x;return s({color:c,metalness:(u=h.metalness)!=null?u:.45,roughness:(d=h.roughness)!=null?d:.32,clearcoat:(f=h.clearcoat)!=null?f:1,clearcoatRoughness:(g=h.clearcoatRoughness)!=null?g:.08,envMapIntensity:(x=h.envMapIntensity)!=null?x:1.05})},accent(c,h={}){var u,d;return s({color:c,metalness:(u=h.metalness)!=null?u:.3,roughness:(d=h.roughness)!=null?d:.34,clearcoat:.8,clearcoatRoughness:.12})},get chrome(){return n({color:15856629,metalness:1,roughness:.08,envMapIntensity:1.7})},get chromeDark(){return n({color:12041410,metalness:1,roughness:.22,envMapIntensity:1.3})},get steel(){return n({color:10133928,metalness:.92,roughness:.34,map:e.metal,envMapIntensity:1.1})},get darkSteel(){return n({color:2962490,metalness:.85,roughness:.45,envMapIntensity:.9})},get frame(){return n({color:1974823,metalness:.7,roughness:.6})},get plastic(){return n({color:1316892,metalness:.15,roughness:.72})},get plasticGray(){return n({color:3949901,metalness:.1,roughness:.82})},get plasticLight(){return n({color:12106940,metalness:.1,roughness:.6})},get rubber(){return n({color:1316376,roughness:.96,metalness:0,bumpMap:e.tread,bumpScale:.035})},get rubberTrim(){return n({color:2106151,roughness:.9,metalness:.05})},get glass(){return s({color:12574958,metalness:.1,roughness:.06,transparent:!0,opacity:.26,envMapIntensity:1.6,depthWrite:!1,side:Ce})},get glassDark(){return s({color:2767944,metalness:.2,roughness:.1,transparent:!0,opacity:.55,envMapIntensity:1.3,depthWrite:!1})},get mirror(){return n({color:14674158,metalness:1,roughness:.03,envMapIntensity:2})},get headlight(){return n({color:16645360,emissive:16774095,emissiveIntensity:.35,roughness:.12,metalness:.25})},get taillight(){return n({color:9313047,emissive:16722458,emissiveIntensity:.5,roughness:.25})},get amber(){return n({color:11822618,emissive:16751406,emissiveIntensity:.6,roughness:.3})},get reverseLight(){return n({color:14212306,emissive:14286832,emissiveIntensity:.15,roughness:.3})},get interiorDark(){return n({color:2237995,roughness:.82,metalness:.08})},get interiorMid(){return n({color:3356991,roughness:.75,metalness:.1})},get leather(){return n({color:2303530,roughness:.62,metalness:.05})},get leatherBeige(){return n({color:10982521,roughness:.68,metalness:.04})},get fabric(){return n({color:3883593,roughness:.95,metalness:.02})},get dashScreen(){return n({color:659220,emissive:1919843,emissiveIntensity:.55,roughness:.25})},get tarp(){return n({color:14672870,map:e.tarp,roughness:.92,metalness:.02})},get tarpDark(){return n({color:4015178,map:e.tarp,roughness:.94,metalness:.02})},get wood(){return n({color:12159570,map:e.wood,roughness:.86,metalness:.02})},get tank(){return n({color:14212834,metalness:.95,roughness:.18,envMapIntensity:1.5})},get tankWhite(){return n({color:15330798,metalness:.35,roughness:.3,envMapIntensity:1.1})},get orange(){return n({color:14182687,metalness:.25,roughness:.55})},get hazard(){return n({color:14715422,metalness:.2,roughness:.6})},get rope(){return n({color:7169109,roughness:.95})},get containerBlue(){return n({color:2579320,metalness:.55,roughness:.6})},get containerRed(){return n({color:9189930,metalness:.5,roughness:.62})},get containerGreen(){return n({color:4023623,metalness:.5,roughness:.6})},get concrete(){return n({color:10263700,roughness:.95})}}}function Ae(i=null,t=""){let e=new We;return e.name=t,i&&i.add(e),e}function Zs(i,t,e,n=0,s=0,r=0){let o=new Lt(t,e);return o.position.set(n,s,r),i==null||i.add(o),o}function q(i,t,e,n,s,r=0,o=0,a=0){return Zs(i,new sn(t,e,n),s,r,o,a)}function K(i,t,e,n,s,r=0,o=0,a=0,l=.05,c=2){let h=Math.min(l,Math.min(t,e,n)/2-5e-4);return Zs(i,new hl(t,e,n,c,Math.max(.001,h)),s,r,o,a)}function Yt(i,t,e,n,s,r=0,o=0,a=0,l=20){return Zs(i,new ye(t,e,n,l),s,r,o,a)}function Qi(i,t,e,n=0,s=0,r=0,o=16){return Zs(i,new Gn(t,o,Math.max(6,o/2)),e,n,s,r)}function Zn(i,t,e,n,s=0,r=0,o=0,a=24,l=on){return Zs(i,new qe(t,e,10,a,l),n,s,r,o)}function Ke(i,t,e,n,s=0,r=0,o=0){return Zs(i,new bn(t,e),n,s,r,o)}function Ni(i,t={}){let{radius:e=.52,width:n=.32,style:s="truck",rimColor:r=14146270,tread:o=i.rubber,spokes:a=6,brakeDisc:l=!0}=t,c=new We,h=new We;h.rotation.z=At,c.add(h);let u=n/2,d=e*.6,f=[new ct(d,-u),new ct(e*.88,-u*1.02),new ct(e*.985,-u*.78),new ct(e,-u*.42),new ct(e,u*.42),new ct(e*.985,u*.78),new ct(e*.88,u*1.02),new ct(d,u)],g=new Ir(f,40),x=new Lt(g,o);h.add(x);let m=new Lt(new ye(d,d,n*.96,28,1,!0),i.rubberTrim);h.add(m);let p=e*.58,b=new Lt(new ye(p,p,n*.9,30),qs(r));h.add(b);let M=new Lt(new qe(p*.99,e*.022,8,30),qs(r));M.rotation.x=At,M.position.y=u*.86,h.add(M);let y=u*.9;if(s==="truck"){for(let S=0;S<10;S++){let R=S/10*on,_=new Lt(new ye(e*.075,e*.075,.012,8),i.plastic);_.position.set(Math.cos(R)*p*.68,y,Math.sin(R)*p*.68),h.add(_)}let T=new Lt(new ye(e*.2,e*.23,.09,18),qs(r));T.position.y=y+.02,h.add(T);for(let S=0;S<6;S++){let R=S/6*on,_=new Lt(new ye(.022,.022,.05,6),i.chromeDark);_.position.set(Math.cos(R)*e*.13,y+.05,Math.sin(R)*e*.13),h.add(_)}}else{let T=qs(r);for(let _=0;_<a;_++){let w=_/a*on,P=new Lt(new sn(e*.16,.05,p*.92),T);P.position.set(Math.cos(w)*p*.45,y-.02,Math.sin(w)*p*.45),P.rotation.y=-w,h.add(P)}let S=new Lt(new ye(e*.17,e*.19,.06,20),qs(r));S.position.y=y,h.add(S);for(let _=0;_<5;_++){let w=_/5*on,P=new Lt(new ye(.014,.014,.04,6),i.chromeDark);P.position.set(Math.cos(w)*e*.11,y+.04,Math.sin(w)*e*.11),h.add(P)}let R=new Lt(new ye(e*.085,e*.085,.035,16),qs(1711650));R.position.y=y+.05,h.add(R)}if(l){let T=new Lt(new ye(e*.52,e*.52,.035,28),i.darkSteel);T.position.y=-u*.2,h.add(T);let S=new Lt(new sn(e*.2,.09,e*.28),i.plasticGray);S.position.set(e*.35,-u*.2,e*.28),h.add(S)}return c.userData.radius=e,c}function qs(i){return new pe({color:i,metalness:.95,roughness:.26,envMapIntensity:1.2})}function Tn(i,t,e,n,s,r=8){let o=new D(...t),a=new D(...e),l=a.clone().sub(o),c=l.length(),h=new ye(n,n,c,r),u=new Lt(h,s);return u.position.copy(o).add(a).multiplyScalar(.5),u.quaternion.setFromUnitVectors(new D(0,1,0),l.normalize()),i.add(u),u}function pd(i){let t=new ol({canvas:i,antialias:!0,powerPreference:"high-performance",alpha:!1,preserveDrawingBuffer:!1});t.setPixelRatio(Math.min(window.devicePixelRatio||1,1.8)),t.outputColorSpace=Ge,t.toneMapping=Hr,t.toneMappingExposure=1.02,t.shadowMap.enabled=!0,t.shadowMap.type=pa;let e=new Wi;e.background=new $t("#0b0d0c"),e.fog=new Ts("#0b0d0c",42,120);let n=new He(38,1,.05,400);n.position.set(8,3.4,-9);let s=new Nr(14674418,1448218,1.15);e.add(s);let r=new Mi(16774370,2.6);r.position.set(7,13,-9),r.castShadow=!0,r.shadow.mapSize.set(2048,2048),r.shadow.camera.left=-16,r.shadow.camera.right=16,r.shadow.camera.top=16,r.shadow.camera.bottom=-16,r.shadow.camera.near=1,r.shadow.camera.far=46,r.shadow.bias=-6e-4,r.shadow.normalBias=.02,r.shadow.radius=2.5,e.add(r);let o=new Mi(12376319,.85);o.position.set(-10,6,7),e.add(o);let a=new Mi(16767400,1.5);a.position.set(-4,5,12),e.add(a);let l=new Mi(10478847,.7);l.position.set(9,2.4,9),e.add(l);let c=[];for(let[A,U,L]of[[-6,-6,16773336],[6,-6,14676991],[0,7.5,16770240]]){let k=new Fr(L,130,34,.55,.55,1.6);k.position.set(A,11.5,U),k.target.position.set(0,1,0),e.add(k,k.target),c.push(k)}let h=new Gs(t);h.compileEquirectangularShader();let u=null;try{if(eo){let A=cx();A&&(A.mapping=Os,u=h.fromEquirectangular(A),e.environment=u.texture,A.dispose())}}catch(A){console.warn("env fallback",A)}if(!e.environment)try{e.environment=h.fromScene(new cl,.04).texture}catch(A){console.warn("RoomEnvironment \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D",A)}e.environmentIntensity=.9;let d=new We;e.add(d);let f=eo?Yn(1024,1024,(A,U,L)=>{A.fillStyle="#14171a",A.fillRect(0,0,U,L);let k=U/8;for(let W=0;W<8;W++)for(let z=0;z<8;z++)A.fillStyle=(z+W)%2?"#171a1e":"#111417",A.fillRect(z*k,W*k,k,k);A.strokeStyle="rgba(255,255,255,0.045)",A.lineWidth=2;for(let W=0;W<=8;W++)A.beginPath(),A.moveTo(W*k,0),A.lineTo(W*k,L),A.stroke(),A.beginPath(),A.moveTo(0,W*k),A.lineTo(U,W*k),A.stroke();for(let W=0;W<9e3;W++)A.fillStyle=`rgba(255,255,255,${Math.random()*.02})`,A.fillRect(Math.random()*U,Math.random()*L,2,2)},{repeat:[6,6]}):null,g=new pe({color:2764595,roughness:.32,metalness:.55,map:f,envMapIntensity:.65}),x=new Lt(new bn(160,160),g);x.rotation.x=-Math.PI/2,x.receiveShadow=!0,d.add(x);let m=new Lt(new ye(9.2,9.5,.1,72,1,!1),new pe({color:1843236,roughness:.2,metalness:.75,envMapIntensity:.9}));m.position.y=.05,m.receiveShadow=!0,d.add(m);let p=new Lt(new qe(9.32,.025,6,96),new pe({color:15250522,emissive:15250522,emissiveIntensity:1.3,roughness:.4}));p.rotation.x=Math.PI/2,p.position.y=.1,d.add(p);let b=eo?Yn(1024,512,(A,U,L)=>{let k=A.createLinearGradient(0,0,0,L);k.addColorStop(0,"#161c20"),k.addColorStop(.55,"#2a333a"),k.addColorStop(.72,"#5d6a72"),k.addColorStop(.88,"#39434a"),k.addColorStop(1,"#151a1d"),A.fillStyle=k,A.fillRect(0,0,U,L);for(let W=0;W<9;W++){let z=40+W*112,Q=A.createLinearGradient(0,L*.2,0,L*.62);Q.addColorStop(0,"rgba(255,244,224,0.85)"),Q.addColorStop(1,"rgba(255,244,224,0)"),A.fillStyle=Q,A.fillRect(z,L*.2,62,L*.42)}for(let W=0;W<9;W++)A.fillStyle="rgba(10,12,14,0.55)",A.fillRect(20+W*112,L*.16,12,L*.68);A.fillStyle="rgba(232,180,90,0.35)",A.fillRect(0,L*.7,U,3)}):null,M=new si({map:b,side:Ue,fog:!0}),y=new Lt(new ye(46,46,26,48,1,!0),M);y.position.y=12,d.add(y);let T=new Lt(new Gn(46,32,16,0,Math.PI*2,0,Math.PI/2),new si({color:1778215,side:Ue,fog:!0}));d.add(T);let S=new pe({color:2435888,roughness:.35,metalness:.85});for(let A=0;A<3;A++){let U=new Lt(new qe(10.5+A*1.6,.07,6,120,Math.PI),S);U.rotation.z=Math.PI,U.position.y=.5,U.rotation.x=0,U.rotation.y=A*.35,d.add(U)}let R=new si({color:3818056,transparent:!0,opacity:.6});for(let A=-6;A<=6;A++){let U=new Lt(new bn(.02,60),R);U.rotation.x=-Math.PI/2,U.position.set(A*3,.011,-26),d.add(U)}let _={studio:{bg:"#0b0d0c",fog:["#0b0d0c",42,120],floor:2764595,floorRough:.32,floorMetal:.55,hemi:1.15,key:2.6,rim:1.5,env:.9,exposure:1.02,grid:!0},dark:{bg:"#050607",fog:["#050607",30,90],floor:856082,floorRough:.18,floorMetal:.8,hemi:.5,key:1.8,rim:2.6,env:.65,exposure:.92,grid:!0},show:{bg:"#101418",fog:["#101418",50,130],floor:3817542,floorRough:.5,floorMetal:.35,hemi:1.6,key:3.2,rim:1.2,env:1.05,exposure:1.06,grid:!0},garage:{bg:"#0e1112",fog:["#0e1112",38,105],floor:2369578,floorRough:.82,floorMetal:.15,hemi:.9,key:2.2,rim:.9,env:.7,exposure:1,grid:!1}},w="studio";function P(A){var L;let U=_[A]||_.studio;w=A,e.background=new $t(U.bg),e.fog=new Ts(U.fog[0],U.fog[1],U.fog[2]),g.color.setHex(U.floor),g.roughness=U.floorRough,g.metalness=U.floorMetal,s.intensity=U.hemi,r.intensity=U.key,a.intensity=U.rim,e.environmentIntensity=U.env,t.toneMappingExposure=U.exposure,R.opacity=U.grid?.6:.12,p.visible=A!=="garage";for(let k of d.children)((L=k.geometry)==null?void 0:L.type)==="TorusGeometry"&&k!==p&&(k.visible=A!=="garage")}function I(){let A=i.parentElement,U=Math.max(320,(A==null?void 0:A.clientWidth)||i.clientWidth||900),L=Math.max(240,(A==null?void 0:A.clientHeight)||i.clientHeight||560);t.setSize(U,L,!1),n.aspect=U/L,n.updateProjectionMatrix()}return typeof ResizeObserver!="undefined"&&i.parentElement&&new ResizeObserver(()=>I()).observe(i.parentElement),window.addEventListener("resize",I),I(),{renderer:t,scene:e,camera:n,stage:d,lights:{hemi:s,key:r,fill:o,rim:a,rim2:l,spots:c},setPreset:P,resize:I,get preset(){return w}}}function cx(){return Yn(2048,1024,(i,t,e)=>{let n=i.createLinearGradient(0,0,0,e);n.addColorStop(0,"#2a3339"),n.addColorStop(.45,"#1a2025"),n.addColorStop(.55,"#0d1114"),n.addColorStop(1,"#05080a"),i.fillStyle=n,i.fillRect(0,0,t,e);let s=(o,a,l,c,h,u=1)=>{let d=i.createRadialGradient(o,a,1,o,a,l);d.addColorStop(0,h),d.addColorStop(.55,h),d.addColorStop(1,"rgba(0,0,0,0)"),i.globalAlpha=u,i.fillStyle=d,i.beginPath(),i.ellipse(o,a,l,c,0,0,Math.PI*2),i.fill(),i.globalAlpha=1};for(let o=0;o<5;o++){let a=150+o*46,l=i.createLinearGradient(0,a,t,a);l.addColorStop(0,"rgba(255,244,225,0)"),l.addColorStop(.2,"rgba(255,246,230,0.85)"),l.addColorStop(.5,"rgba(255,250,240,1)"),l.addColorStop(.8,"rgba(255,246,230,0.85)"),l.addColorStop(1,"rgba(255,244,225,0)"),i.fillStyle=l,i.fillRect(0,a,t,14+o*2)}for(let o=0;o<3;o++){let a=360+o*40,l=i.createLinearGradient(0,a,t,a);l.addColorStop(0,"rgba(180,220,255,0)"),l.addColorStop(.55,"rgba(200,232,255,0.55)"),l.addColorStop(1,"rgba(180,220,255,0)"),i.fillStyle=l,i.fillRect(0,a,t,10)}s(t*.15,e*.42,190,120,"rgba(255,240,214,0.9)",.9),s(t*.62,e*.38,230,150,"rgba(214,238,255,0.85)",.85),s(t*.88,e*.46,160,100,"rgba(255,226,190,0.8)",.8);let r=i.createLinearGradient(0,e*.6,0,e);r.addColorStop(0,"rgba(60,70,78,0.5)"),r.addColorStop(1,"rgba(0,0,0,0)"),i.fillStyle=r,i.fillRect(0,e*.6,t,e*.4)},{srgb:!0})}var md={type:"change"},eh={type:"start"},_d={type:"end"},ul=new ws,gd=new hn,hx=Math.cos(70*Rc.DEG2RAD),ke=new D,an=2*Math.PI,me={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},th=1e-6,dl=class extends kr{constructor(t,e=null){super(t,e),this.state=me.NONE,this.target=new D,this.cursor=new D,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:Ei.ROTATE,MIDDLE:Ei.DOLLY,RIGHT:Ei.PAN},this.touches={ONE:Ti.ROTATE,TWO:Ti.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle="auto",this._domElementKeyEvents=null,this._lastPosition=new D,this._lastQuaternion=new dn,this._lastTargetPosition=new D,this._quat=new dn().setFromUnitVectors(t.up,new D(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new Ns,this._sphericalDelta=new Ns,this._scale=1,this._panOffset=new D,this._rotateStart=new ct,this._rotateEnd=new ct,this._rotateDelta=new ct,this._panStart=new ct,this._panEnd=new ct,this._panDelta=new ct,this._dollyStart=new ct,this._dollyEnd=new ct,this._dollyDelta=new ct,this._dollyDirection=new D,this._mouse=new ct,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=dx.bind(this),this._onPointerDown=ux.bind(this),this._onPointerUp=fx.bind(this),this._onContextMenu=vx.bind(this),this._onMouseWheel=gx.bind(this),this._onKeyDown=_x.bind(this),this._onTouchStart=xx.bind(this),this._onTouchMove=yx.bind(this),this._onMouseDown=px.bind(this),this._onMouseMove=mx.bind(this),this._interceptControlDown=bx.bind(this),this._interceptControlUp=Sx.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(t){this._cursorStyle=t,t==="grab"?this.domElement.style.cursor="grab":this.domElement.style.cursor="auto"}get cursorStyle(){return this._cursorStyle}connect(t){super.connect(t),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.state=me.NONE,this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents();let t=this.domElement.getRootNode();t.removeEventListener("keydown",this._interceptControlDown,{capture:!0}),t.removeEventListener("keyup",this._interceptControlUp,{capture:!0}),this._controlActive=!1,this._pointers.length=0,this._pointerPositions={},this.domElement.style.touchAction="",this.domElement.style.cursor="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(t){t.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=t}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(md),this.update(),this.state=me.NONE}pan(t,e){this._pan(t,e),this.update()}dollyIn(t){this._dollyIn(t),this.update()}dollyOut(t){this._dollyOut(t),this.update()}rotateLeft(t){this._rotateLeft(t),this.update()}rotateUp(t){this._rotateUp(t),this.update()}update(t=null){let e=this.object.position;ke.copy(e).sub(this.target),ke.applyQuaternion(this._quat),this._spherical.setFromVector3(ke),this.autoRotate&&this.state===me.NONE&&this._rotateLeft(this._getAutoRotationAngle(t)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(n)&&isFinite(s)&&(n<-Math.PI?n+=an:n>Math.PI&&(n-=an),s<-Math.PI?s+=an:s>Math.PI&&(s-=an),n<=s?this._spherical.theta=Math.max(n,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+s)/2?Math.max(n,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let o=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=o!=this._spherical.radius}if(ke.setFromSpherical(this._spherical),ke.applyQuaternion(this._quatInverse),e.copy(this.target).add(ke),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let o=null;if(this.object.isPerspectiveCamera){let a=ke.length();o=this._clampDistance(a*this._scale);let l=a-o;this.object.position.addScaledVector(this._dollyDirection,l),this.object.updateMatrixWorld(),r=!!l}else if(this.object.isOrthographicCamera){let a=new D(this._mouse.x,this._mouse.y,0);a.unproject(this.object);let l=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=l!==this.object.zoom;let c=new D(this._mouse.x,this._mouse.y,0);c.unproject(this.object),this.object.position.sub(c).add(a),this.object.updateMatrixWorld(),o=ke.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;o!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(o).add(this.object.position):(ul.origin.copy(this.object.position),ul.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(ul.direction))<hx?this.object.lookAt(this.target):(gd.setFromNormalAndCoplanarPoint(this.object.up,this.target),ul.intersectPlane(gd,this.target))))}else if(this.object.isOrthographicCamera){let o=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),o!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>th||8*(1-this._lastQuaternion.dot(this.object.quaternion))>th||this._lastTargetPosition.distanceToSquared(this.target)>th?(this.dispatchEvent(md),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(t){return t!==null?an/60*this.autoRotateSpeed*t:an/60/60*this.autoRotateSpeed}_getZoomScale(t){let e=Math.abs(t*.01);return Math.pow(.95,this.zoomSpeed*e)}_rotateLeft(t){this._sphericalDelta.theta-=t}_rotateUp(t){this._sphericalDelta.phi-=t}_panLeft(t,e){ke.setFromMatrixColumn(e,0),ke.multiplyScalar(-t),this._panOffset.add(ke)}_panUp(t,e){this.screenSpacePanning===!0?ke.setFromMatrixColumn(e,1):(ke.setFromMatrixColumn(e,0),ke.crossVectors(this.object.up,ke)),ke.multiplyScalar(t),this._panOffset.add(ke)}_pan(t,e){let n=this.domElement;if(this.object.isPerspectiveCamera){let s=this.object.position;ke.copy(s).sub(this.target);let r=ke.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*t*r/n.clientHeight,this.object.matrix),this._panUp(2*e*r/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(t*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(e*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(t,e){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let n=this.domElement.getBoundingClientRect(),s=t-n.left,r=e-n.top,o=n.width,a=n.height;this._mouse.x=s/o*2-1,this._mouse.y=-(r/a)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(t){return Math.max(this.minDistance,Math.min(this.maxDistance,t))}_handleMouseDownRotate(t){this._rotateStart.set(t.clientX,t.clientY)}_handleMouseDownDolly(t){this._updateZoomParameters(t.clientX,t.clientX),this._dollyStart.set(t.clientX,t.clientY)}_handleMouseDownPan(t){this._panStart.set(t.clientX,t.clientY)}_handleMouseMoveRotate(t){this._rotateEnd.set(t.clientX,t.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let e=this.domElement;this._rotateLeft(an*this._rotateDelta.x/e.clientHeight),this._rotateUp(an*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(t){this._dollyEnd.set(t.clientX,t.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(t){this._panEnd.set(t.clientX,t.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(t){this._updateZoomParameters(t.clientX,t.clientY),t.deltaY<0?this._dollyIn(this._getZoomScale(t.deltaY)):t.deltaY>0&&this._dollyOut(this._getZoomScale(t.deltaY)),this.update()}_handleKeyDown(t){let e=!1;switch(t.code){case this.keys.UP:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateUp(an*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),e=!0;break;case this.keys.BOTTOM:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateUp(-an*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),e=!0;break;case this.keys.LEFT:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateLeft(an*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),e=!0;break;case this.keys.RIGHT:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateLeft(-an*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),e=!0;break}e&&(t.preventDefault(),this.update())}_handleTouchStartRotate(t){if(this._pointers.length===1)this._rotateStart.set(t.pageX,t.pageY);else{let e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._rotateStart.set(n,s)}}_handleTouchStartPan(t){if(this._pointers.length===1)this._panStart.set(t.pageX,t.pageY);else{let e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._panStart.set(n,s)}}_handleTouchStartDolly(t){let e=this._getSecondPointerPosition(t),n=t.pageX-e.x,s=t.pageY-e.y,r=Math.sqrt(n*n+s*s);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enablePan&&this._handleTouchStartPan(t)}_handleTouchStartDollyRotate(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enableRotate&&this._handleTouchStartRotate(t)}_handleTouchMoveRotate(t){if(this._pointers.length==1)this._rotateEnd.set(t.pageX,t.pageY);else{let n=this._getSecondPointerPosition(t),s=.5*(t.pageX+n.x),r=.5*(t.pageY+n.y);this._rotateEnd.set(s,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let e=this.domElement;this._rotateLeft(an*this._rotateDelta.x/e.clientHeight),this._rotateUp(an*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(t){if(this._pointers.length===1)this._panEnd.set(t.pageX,t.pageY);else{let e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._panEnd.set(n,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(t){let e=this._getSecondPointerPosition(t),n=t.pageX-e.x,s=t.pageY-e.y,r=Math.sqrt(n*n+s*s);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let o=(t.pageX+e.x)*.5,a=(t.pageY+e.y)*.5;this._updateZoomParameters(o,a)}_handleTouchMoveDollyPan(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enablePan&&this._handleTouchMovePan(t)}_handleTouchMoveDollyRotate(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enableRotate&&this._handleTouchMoveRotate(t)}_addPointer(t){this._pointers.push(t.pointerId)}_removePointer(t){delete this._pointerPositions[t.pointerId];for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId){this._pointers.splice(e,1);return}}_isTrackingPointer(t){for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId)return!0;return!1}_trackPointer(t){let e=this._pointerPositions[t.pointerId];e===void 0&&(e=new ct,this._pointerPositions[t.pointerId]=e),e.set(t.pageX,t.pageY)}_getSecondPointerPosition(t){let e=t.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[e]}_customWheelEvent(t){let e=t.deltaMode,n={clientX:t.clientX,clientY:t.clientY,deltaY:t.deltaY};switch(e){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100;break}return t.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}};function ux(i){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(i.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(i)&&(this._addPointer(i),i.pointerType==="touch"?this._onTouchStart(i):this._onMouseDown(i),this._cursorStyle==="grab"&&(this.domElement.style.cursor="grabbing")))}function dx(i){this.enabled!==!1&&(i.pointerType==="touch"?this._onTouchMove(i):this._onMouseMove(i))}function fx(i){switch(this._removePointer(i),this._pointers.length){case 0:this.domElement.releasePointerCapture(i.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(_d),this.state=me.NONE,this._cursorStyle==="grab"&&(this.domElement.style.cursor="grab");break;case 1:let t=this._pointers[0],e=this._pointerPositions[t];this._onTouchStart({pointerId:t,pageX:e.x,pageY:e.y});break}}function px(i){let t;switch(i.button){case 0:t=this.mouseButtons.LEFT;break;case 1:t=this.mouseButtons.MIDDLE;break;case 2:t=this.mouseButtons.RIGHT;break;default:t=-1}switch(t){case Ei.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(i),this.state=me.DOLLY;break;case Ei.ROTATE:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=me.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=me.ROTATE}break;case Ei.PAN:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=me.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=me.PAN}break;default:this.state=me.NONE}this.state!==me.NONE&&this.dispatchEvent(eh)}function mx(i){switch(this.state){case me.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(i);break;case me.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(i);break;case me.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(i);break}}function gx(i){this.enabled===!1||this.enableZoom===!1||this.state!==me.NONE||(i.preventDefault(),this.dispatchEvent(eh),this._handleMouseWheel(this._customWheelEvent(i)),this.dispatchEvent(_d))}function _x(i){this.enabled!==!1&&this._handleKeyDown(i)}function xx(i){switch(this._trackPointer(i),this._pointers.length){case 1:switch(this.touches.ONE){case Ti.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(i),this.state=me.TOUCH_ROTATE;break;case Ti.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(i),this.state=me.TOUCH_PAN;break;default:this.state=me.NONE}break;case 2:switch(this.touches.TWO){case Ti.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(i),this.state=me.TOUCH_DOLLY_PAN;break;case Ti.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(i),this.state=me.TOUCH_DOLLY_ROTATE;break;default:this.state=me.NONE}break;default:this.state=me.NONE}this.state!==me.NONE&&this.dispatchEvent(eh)}function yx(i){switch(this._trackPointer(i),this.state){case me.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(i),this.update();break;case me.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(i),this.update();break;case me.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(i),this.update();break;case me.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(i),this.update();break;default:this.state=me.NONE}}function vx(i){this.enabled!==!1&&i.preventDefault()}function bx(i){i.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function Sx(i){i.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}var fl=class{constructor(t,e){this.camera=t,this.controls=new dl(t,e),this.controls.enableDamping=!0,this.controls.dampingFactor=.075,this.controls.minDistance=1.4,this.controls.maxDistance=46,this.controls.maxPolarAngle=Math.PI*.495,this.controls.screenSpacePanning=!0,this.controls.target.set(0,1.4,0),this.controls.enabled=!0,this.controls.autoRotateSpeed=.55,this.flying=null,this.current=null,this.look=new D,this.view=null}setView(t,{instant:e=!1}={}){this.view=t;let n=new D(...t.pos),s=new D(...t.target);if(t.seat){let r=s.clone().sub(n).normalize();s=n.clone().add(r.multiplyScalar(2.6)),t={...t,target:s.toArray()}}this.controls.enabled=!!t.orbit||!!t.seat,this.controls.maxPolarAngle=t.seat?Math.PI*.96:Math.PI*.495,this.controls.autoRotate=!!t.autoRotate&&!t.seat,this.controls.minDistance=t.seat?.35:1.4,e?(this.camera.position.copy(n),this.camera.fov=t.fov||40,this.camera.updateProjectionMatrix(),this.controls.target.copy(s),this.controls.update(),this.flying=null):this.flying={t:0,dur:t.seat?1.15:.95,fromPos:this.camera.position.clone(),fromTarget:this.controls.target.clone(),fromFov:this.camera.fov,toPos:n,toTarget:s,toFov:t.fov||40,view:t}}update(t){if(this.flying){let e=this.flying;e.t+=t;let n=Ii(e.t/e.dur,0,1),s=n<.5?4*n*n*n:1-Math.pow(-2*n+2,3)/2;this.camera.position.lerpVectors(e.fromPos,e.toPos,s),this.controls.target.lerpVectors(e.fromTarget,e.toTarget,s),this.camera.fov=e.fromFov+(e.toFov-e.fromFov)*s,this.camera.updateProjectionMatrix(),this.controls.update(),n>=1&&(this.flying=null,this.current=e.view,e.view.orbit&&(this.controls.autoRotate=!!e.view.autoRotate));return}this.controls.enabled&&this.controls.update()}lookAt(t,e,n){this.controls.target.set(t,e,n),this.controls.update()}get isSeated(){var t;return!!((t=this.view)!=null&&t.seat)}};var Mx=1.18;function xd(i,t,e={}){return i.paint(t,e)}function yd(i,t,e,n,s,r,o,a){let l=new We,c=new Lt(new qe(e,Math.max(.035,n*.055),6,24,we),t);c.rotation.y=a>0?-At:At,l.add(c);let h=new Lt(new ye(e-.03,e-.03,n*.8,18,1,!0,0,we),t);return h.rotation.z=At,h.material=t.clone?t.clone():t,h.material.side=Ce,l.add(h),l.position.set(s,r,o),l}function vd(i,t){var pt,Et,gt,mt,Ot;let e=Ae(null,`truck:${i.id}`),n=[],s=[],r=[],o=[],a=i.wheel||{radius:.535,width:.42,rimColor:"#d9dde0"},l=a.radius,c=i.style||"euro",h=i.roof||"high",u=c==="bonnet",d=c==="futuristic",f=c==="lowentry",g=(pt=i.cabHeight)!=null?pt:3.55,x=(Et=i.length)!=null?Et:6.2,m=i.chrome!==!1,p=1.27,b=xd(t,i.paint),M=xd(t,i.paint,{roughness:.4,metalness:.35}),y=t.accent(i.accent||"#e8b45a");s.push(b,M,y);let T=-x/2,S=x/2,R=u?(gt=i.bonnet)!=null?gt:2.1:0,_=T+(u?.55+R:.28),w=Ii((h==="mega"?2.75:2.35)+(u?-.1:0),1.9,2.95),P=_+w,I=2.5,A=f?.85:Mx,U=Math.max(g,A+1.55),L=_+(f?.75:1.25),k=S-.55,W=k-(i.heavy?1.45:1.32),z=i.heavy?k+1.35:null,Q=1.02,N=(W+k)/2-.62,V=[W,k,z].filter(tt=>tt!=null&&tt<S+.1),Y=Ae(e,"chassis"),yt=t.darkSteel;for(let tt of[-.48,.48])q(Y,.12,.28,S-T-.35,yt,tt,Q,(T+S)/2+.1);for(let tt=T+1.1;tt<S-.2;tt+=.85)q(Y,.95,.16,.1,yt,0,Q-.02,tt);q(Y,1.05,.22,.16,t.darkSteel,0,Q-.02,S-.15);let _t=m?t.tank:t.plasticGray,te=.31,qt=Ii(x*.32,.9,1.7),Kt=T+2.1+qt/2;for(let tt of[-1,1]){let vt=Yt(Y,te,te,qt,_t,tt*.92,.72,Kt,22);vt.rotation.x=At;let O=Zn(Y,te+.012,.025,t.darkSteel,tt*.92,.72,Kt,20);O.rotation.y=At;let dt=Yt(Y,.09,.09,.05,t.chromeDark,tt*.92,.72,Kt+qt/2-.16,12);dt.rotation.x=At,r.push({pos:[tt*1.22,.9,Kt],label:"\u0422\u043E\u043F\u043B\u0438\u0432\u043D\u044B\u0439 \u0431\u0430\u043A",side:`${tt>0?"\u0441\u043F\u0440\u0430\u0432\u0430":"\u0441\u043B\u0435\u0432\u0430"}`})}K(Y,.52,.36,.62,t.plasticGray,-.92,.72,Kt-qt/2-.55),Yt(Y,.16,.16,.62,t.chromeDark,.9,.62,Kt-qt/2-.6,14).rotation.x=At;let et=t.rubber;function st(tt,vt,O={}){var it,Tt;let dt=Ni(t,{radius:l,width:(it=O.width)!=null?it:a.width,style:"truck",rimColor:(Tt=O.rimColor)!=null?Tt:a.rimColor,tread:et});return dt.position.set(tt,l,vt),O.flip&&(dt.rotation.y=we),e.add(dt),n.push(dt),dt}let St=.98;for(let tt of[-1,1])st(tt*St,L,{flip:tt<0,width:a.width});for(let tt of V)for(let vt of[-1,1])st(vt*.74,tt,{width:.32,flip:vt<0}),st(vt*1.09,tt,{width:.32,flip:vt<0});!i.thirdAxle&&V.length>2&&(V.length=2);for(let tt of[-1,1]){let vt=yd(t,t.plasticGray,l+.05,.5,tt*St,l+.02,L,tt);vt.visible=i.fenders!==!1,e.add(vt);for(let O of V){let dt=yd(t,t.plasticGray,l+.06,1.02,tt*.92,l+.02,O,tt);dt.visible=i.fenders!==!1,e.add(dt)}for(let O of[L-.42,V[0]-.55])q(e,.42,.5,.04,t.rubberTrim,tt*(O<0?St:.92),l-.22,O)}let wt=Ae(e,"cab"),Mt=A+.72,Dt=Math.min(U-.4,A+1.58),jt=P,ot=d?.42:f?.1:.22;for(let tt of[-1,1]){let vt=tt*(p-.06);K(wt,.12,Mt-A,w-.1,b,vt,(A+Mt)/2,(_+jt)/2,.045),K(wt,.12,Math.max(.2,U-Dt-.02),w-.1,b,vt,(Dt+U)/2+.01,(_+jt)/2,.045),K(wt,.13,Dt-Mt,.17,b,vt,(Dt+Mt)/2,_+.12,.04),K(wt,.13,Dt-Mt,.13,t.plastic,vt,(Dt+Mt)/2,jt-.12,.04),q(wt,.02,.075,w*.82,y,tt*(p+.012),Mt+.16,(_+jt)/2+.02);let O=K(wt,.05,.06,.22,m?t.chrome:t.plasticGray,tt*(p+.02),Mt-.2,_+1.05,.02);r.push({pos:[tt*(p+.05),Mt-.2,_+1.05],label:"\u0414\u0432\u0435\u0440\u044C \u043A\u0430\u0431\u0438\u043D\u044B",side:tt>0?"\u0441\u043F\u0440\u0430\u0432\u0430":"\u0441\u043B\u0435\u0432\u0430"})}K(wt,I-.12,U-A-.04,.1,b,0,(A+U)/2,jt-.02,.04),(h==="high"||h==="mega")&&q(wt,.92,.5,.03,t.glassDark,0,U-.62,jt-.08);for(let tt of[-.9,-.3,.3,.9])q(wt,.04,U-A-.28,.05,t.plastic,tt,(A+U)/2+.04,jt-.09);K(wt,I-.1,.14,w,t.plastic,0,A-.07,(_+jt)/2,.04),K(wt,I-.04,.16,w-.02,b,0,U+.02,(_+jt)/2,.06),K(wt,I-.3,.12,.5,b,0,U-.12,_+.16,.06);let ht=Mt-.12,rt=Dt+.06,lt=_+.06;K(wt,I-.14,ht-A,.14,b,0,(A+ht)/2,lt,.05),K(wt,I-.14,Math.max(.12,U-rt),.2,b,0,(rt+U)/2,lt+.05,.06);let xt=Math.max(.5,rt-ht),kt=Ke(wt,I-.26,xt,t.glass,0,(ht+rt)/2,lt+.03);kt.rotation.x=-.05;for(let tt of[-1,1]){let vt=Ke(wt,w-.42,Dt-Mt,t.glass,tt*(p-.005),(Mt+Dt)/2,(_+jt)/2-.02);vt.rotation.y=tt>0?-At:At}for(let tt of[-1,1]){if(d){let it=K(wt,.12,.1,.22,t.plastic,tt*1.34,Dt-.02,_+.24,.03),Tt=q(wt,.02,.07,.12,t.glassDark,tt*1.41,Dt-.02,_+.24),Rt=q(wt,.12,.06,.06,t.plastic,tt*1.29,Dt-.02,_+.2);r.push({pos:[tt*1.42,Dt,_+.24],label:"\u041A\u0430\u043C\u0435\u0440\u0430 \u043E\u0431\u0437\u043E\u0440\u0430"});continue}let vt=q(wt,.34,.06,.06,m?t.chrome:t.plastic,tt*(p+.16),Dt+.12,_+.16),O=q(wt,.28,.05,.05,m?t.chrome:t.plastic,tt*(p+.14),Mt+.2,_+.16),dt=K(wt,.13,.72,.24,t.plastic,tt*(p+.36),Dt-.18,_+.16,.04);q(wt,.02,.56,.18,t.mirror,tt*(p+.43),Dt-.18,_+.16),q(wt,.015,.16,.16,t.glassDark,tt*(p+.425),Mt+.06,_+.16),r.push({pos:[tt*(p+.45),Dt,_+.16],label:"\u0417\u0435\u0440\u043A\u0430\u043B\u043E",side:tt>0?"\u0441\u043F\u0440\u0430\u0432\u0430":"\u0441\u043B\u0435\u0432\u0430"})}let bt=Ae(e,"front");if(u){(Ot=(mt=K(bt,2.2,.95,R,b,0,A+.48,T+.28+R/2,.16).geometry).dispose)==null||Ot.call(mt),K(bt,2.14,.55,.9,b,0,A+.92,_-.42,.18),q(bt,1.9,.72,.1,m?t.chrome:t.plasticGray,0,A+.34,T+.02);for(let vt=-3;vt<=3;vt++)q(bt,1.8,.06,.05,t.chromeDark,0,A+.34+vt*.11,T-.03);for(let vt of[-1,1])K(bt,.34,.3,.1,t.chrome,vt*.86,A+.34,T-.02,.04);for(let vt of[-1,1]){let O=Yt(bt,.075,.085,2.3,t.chrome,vt*1.16,A+1.35,_-.55,14),dt=Yt(bt,.09,.075,.18,t.chromeDark,vt*1.16,A+2.52,_-.55,14),it=q(bt,.03,1.5,.28,t.chromeDark,vt*1.16,A+.75,_-.55)}}else if(K(bt,2.34,d?.9:.62,.16,d?t.plasticGray:t.plastic,0,A+.42,_-.02,.05),d){let tt=q(bt,2.3,.1,.03,t.headlight,0,A+.78,_-.11),vt=q(bt,2.32,.22,.02,y,0,A+.78,_-.12);vt.material=y;let O=Yt(bt,.16,.16,.04,t.chrome,0,A+.42,_-.12,20);O.rotation.x=At}else{let tt=m?t.chrome:t.plasticGray;q(bt,1.5,.4,.06,t.plastic,0,A+.42,_-.1);for(let dt=-2;dt<=2;dt++)q(bt,1.44,.045,.03,tt,0,A+.42+dt*.085,_-.14);let vt=Di(i.brand,{width:512,height:160,bg:"#14181c",fg:"#f4efe3",accent:i.accent||"#e8b45a",font:"bold 72px Arial, sans-serif",border:!1});if(vt){let dt=Ke(bt,.66,.2,new pe({map:vt,roughness:.4,metalness:.2}),0,A+.42,_-.155)}let O=Yt(bt,.19,.19,.03,t.chrome,0,A+.42,_-.15,24);O.rotation.x=At}let Wt=.62,Zt=T+.06;K(bt,2.5,.42,.34,i.chromeBumper||m?t.chrome:t.plasticGray,0,Wt,Zt,.05),!m&&!i.chromeBumper&&q(bt,2.3,.12,.02,t.plastic,0,Wt-.12,Zt-.18);for(let tt of[-1,1]){let vt=Yt(bt,.075,.075,.04,t.headlight,tt*.85,Wt-.1,Zt-.18,14);vt.rotation.x=At}for(let tt of[-1,1]){let vt=K(bt,.5,.24,.08,t.headlight,tt*.72,A+.02,_-.12,.03),O=q(bt,.42,.06,.03,t.chrome,tt*.72,A-.02,_-.17),dt=q(bt,.34,.06,.03,t.amber,tt*.72,A+.13,_-.17);o.push(dt)}for(let tt of[-1,1]){let vt=_+w*.55;q(e,.42,.05,.5,t.darkSteel,tt*(p-.16),.56,vt),q(e,.42,.05,.5,t.darkSteel,tt*(p-.16),.9,vt-.02),q(e,.4,.5,.03,t.plastic,tt*(p-.16),.75,vt+.26)}let F=Ae(e,"roof"),ee=h==="mega"?.42:h==="high"?.24:.08;if(ee>0){K(F,I-.18,ee+.1,w-.34,b,0,U+ee/2+.06,(_+jt)/2-.08,.09);let tt=K(F,I-.24,.36,.5,M,0,U+ee+.02,_+.26,.08);tt.rotation.x=-.35}if(i.deflectors)for(let tt of[-1,1]){let vt=K(F,.1,.5,1.15,M,tt*(p-.02),U+.24,jt-.5,.05);vt.rotation.x=-.22,vt.rotation.z=tt*.04}ee>.1&&(K(F,.62,.06,.62,t.plasticGray,.52,U+ee+.06,jt-.75,.03),q(F,.02,.34,.02,t.darkSteel,-.95,U+ee+.2,jt-.55),r.push({pos:[.52,U+ee+.1,jt-.75],label:"\u041B\u044E\u043A \u043A\u0430\u0431\u0438\u043D\u044B"}));for(let tt of[-.95,-.5,.5,.95]){let vt=Qi(F,.035,t.amber,tt,U+ee+.12,_+.48,8)}if(!d){let tt=K(F,I-.3,.1,.22,M,0,U-.12,_-.06,.03);tt.rotation.x=.2}if(i.sideSkirts)for(let tt of[-1,1])K(e,.08,.72,w+(S-P)*.62,M,tt*1.22,.72,P+(S-P)*.3,.03);let ie=Ae(e,"fifth"),C=1.24;K(ie,1.5,.1,1.05,t.darkSteel,0,C,N,.03);let v=K(ie,.42,.12,.42,t.steel,0,C+.04,N+.08,.02),G=Yt(ie,.035,.035,.8,t.chromeDark,-.72,C-.1,N-.3,8);G.rotation.z=At,r.push({pos:[0,C+.15,N],label:"\u0421\u0435\u0434\u043B\u043E (\u043F\u044F\u0442\u043E\u0435 \u043A\u043E\u043B\u0435\u0441\u043E)"});for(let tt of[-1,1])q(e,.3,.16,.06,t.taillight,tt*.78,Q+.05,S-.06),q(e,.3,.08,.06,t.amber,tt*.78,Q+.2,S-.06),q(e,.06,.22,.06,t.reverseLight,tt*.6,Q+.05,S-.06);let B=Ys("\u0410 001 \u0422\u0421");B&&Ke(e,.5,.13,new pe({map:B,roughness:.6}),0,.95,S-.08);let X=Ex({M:t,unit:i,cabFront:_,cabRear:jt,cabW:I,floorY:A,roofY:U,winBottom:Mt,winTop:Dt,style:c,roofType:h,paint:b,accent:y,anchors:r,isBonnet:u,isLowEntry:f});wt.add(X.group);let at=A+1.02,$=[{id:"driver",label:"\u041C\u0435\u0441\u0442\u043E \u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044F",group:"interior",pos:[-.46,A+1.24,_+.84],target:[-.16,A+.9,_-14],fov:72,orbit:!1,seat:!0},{id:"passenger",label:"\u041C\u0435\u0441\u0442\u043E \u043F\u0430\u0441\u0441\u0430\u0436\u0438\u0440\u0430",group:"interior",pos:[.58,A+1.2,_+1],target:[-.35,A+.86,_-5],fov:70,orbit:!1,seat:!0}];return(h==="high"||h==="mega"||h==="sleeper")&&$.push({id:"bunk",label:"\u0421\u043F\u0430\u043B\u044C\u043D\u043E\u0435 \u043C\u0435\u0441\u0442\u043E",group:"interior",pos:[.32,A+1.34,P-.62],target:[-.3,A+.95,_+1.2],fov:74,orbit:!0,seat:!0}),$.push({id:"exterior",label:"\u0421\u043D\u0430\u0440\u0443\u0436\u0438",group:"exterior",pos:[7.6,3.1,-8.2],target:[0,1.45,.4],fov:38,orbit:!0,autoRotate:!0}),$.push({id:"side",label:"\u0411\u043E\u0440\u0442",group:"exterior",pos:[10.5,1.9,.6],target:[0,1.5,.3],fov:34,orbit:!0}),$.push({id:"rear",label:"\u0421\u0437\u0430\u0434\u0438",group:"exterior",pos:[-5.6,3.2,8.4],target:[0,1.5,.6],fov:40,orbit:!0}),{root:e,wheels:n,paintMats:s,views:$,anchors:r,layout:{frontZ:T,rearEnd:S,cabFront:_,cabRear:jt,roofY:U,floorY:A,fifthWheelZ:N,plateY:C,rearAxle1:W,rearAxle2:k,wheelRadius:l,cabWidth:I},kind:"truck"}}function Ex(i){let{M:t,cabFront:e,cabRear:n,cabW:s,floorY:r,roofY:o,winBottom:a,winTop:l,roofType:c,paint:h,accent:u,anchors:d,style:f,isLowEntry:g}=i,x=Ae(null,"interior"),m=(e+n)/2,p=t.interiorDark,b=t.interiorMid,M=i.unit.luxury?t.leatherBeige:t.leather,y=s-.2,T=K(x,y,.03,n-e-.16,t.rubberTrim,0,r+.02,m,.02);K(x,y-.02,.05,n-e-.2,t.interiorMid,0,o-.09,m,.02);for(let N of[-1,1])K(x,.055,.7,n-e-.5,p,N*(s/2-.16),r+.42,m+.02,.02),K(x,.14,.1,.62,M,N*(s/2-.19),r+.62,e+1.02,.03),K(x,.03,.04,.16,t.chromeDark,N*(s/2-.23),r+.72,e+1,.01);K(x,y,o-r-.2,.06,b,0,(r+o)/2,n-.16,.03);let S=e+.28,R=r+.82,_=K(x,y-.02,.46,.62,p,0,r+.55,S,.08);_.rotation.x=.08,K(x,y-.06,.14,.78,b,0,R+.02,S+.12,.06);let w=K(x,.62,.3,.24,p,-.46,R+.06,S-.12,.05);w.rotation.x=-.2,K(x,.44,.5,.28,b,.08,r+.62,S+.34,.04);let P=K(x,.34,.24,.03,t.dashScreen,.08,r+.92,S+.2,.02);P.rotation.x=-.12;for(let N=-1;N<=1;N++)q(x,.035,.02,.02,t.chromeDark,.08+N*.09,r+.78,S+.34);for(let N of[-1,1]){let V=K(x,.16,.09,.03,t.plastic,N*.78,R+.06,S-.02,.02);for(let Y=-1;Y<=1;Y++)q(x,.012,.07,.01,t.chromeDark,N*.78+Y*.045,R+.06,S-.04)}for(let[N,V]of[[-.6,.105],[-.32,.105]]){let Y=Yt(x,V,V,.02,t.plastic,N,R+.1,S-.24,24);Y.rotation.x=At;let yt=Zn(x,V,.008,t.chromeDark,N,R+.1,S-.25,20);yt.rotation.x=0;let _t=q(x,.012,V*1.1,.006,t.taillight,N,R+.1+V*.25,S-.255);_t.rotation.z=.6}let I=Ae(x,"steering");I.position.set(-.48,R+.12,S-.34),I.rotation.x=-.42;let A=Zn(I,.215,.023,t.leather,0,0,0,40);A.rotation.x=0;let U=Yt(I,.065,.07,.07,t.plastic,0,0,.02,20);U.rotation.x=At;for(let N=0;N<3;N++){let V=ud(90)+N*(on/3),Y=q(I,.04,.2,.025,t.plasticGray,Math.cos(V)*.1,Math.sin(V)*.1,0);Y.rotation.z=V-At}let L=Yt(I,.032,.032,.012,u,0,0,.06,16);L.rotation.x=At;let k=Yt(x,.045,.06,.55,t.plastic,-.48,R-.12,S-.2,12);if(k.rotation.x=.5,f==="euro"||f==="futuristic"){let N=Yt(x,.02,.025,.3,t.chromeDark,.42,R+.02,S+.12,8);N.rotation.x=-.5,Qi(x,.045,t.plastic,.42,R+.16,S+.24,10)}d.push({pos:[-.48,R+.16,S-.4],label:"\u0420\u0443\u043B\u044C \u0438 \u043F\u0440\u0438\u0431\u043E\u0440\u044B"}),d.push({pos:[.08,r+.95,S+.15],label:"\u041C\u0443\u043B\u044C\u0442\u0438\u043C\u0435\u0434\u0438\u0430"});function W(N,V,{recline:Y=.12,luxury:yt=!1}={}){let _t=Ae(x),te=K(_t,.56,.16,.56,yt?M:t.fabric,0,r+.28,0,.05);for(let St of[-1,1])K(_t,.09,.16,.54,yt?M:t.fabric,St*.28,r+.33,0,.04);let qt=K(_t,.54,.72,.16,yt?M:t.fabric,0,r+.66,.24,.06);qt.rotation.x=Y;for(let St of[-1,1]){let wt=K(_t,.08,.62,.14,yt?M:t.fabric,St*.26,r+.68,.24,.05);wt.rotation.x=Y}let Kt=K(_t,.34,.2,.14,yt?M:t.fabric,0,r+1.14,.32,.06),et=Yt(_t,.11,.13,.16,t.rubberTrim,0,r+.18,.02,14),st=q(_t,.07,.72,.02,t.plasticGray,-.22,r+.72,.36);st.rotation.x=Y,st.rotation.z=-.12;for(let St of[-1,1])q(_t,.02,.16,.02,t.chromeDark,St*.11,r+1.02,.33);return _t.position.set(N,0,V),_t}let z=W(-.46,e+1.02,{recline:.14,luxury:!!i.unit.luxury});if(d.push({pos:[-.46,r+.62,e+1.02],label:"\u0421\u0438\u0434\u0435\u043D\u044C\u0435 \u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044F"}),W(.56,e+1,{recline:.1,luxury:!!i.unit.luxury}),c==="high"||c==="mega"||c==="sleeper"){let V=n-.46-.1,Y=r+.96;K(x,y-.12,.1,.92,t.interiorMid,0,Y,V,.02),K(x,y-.24,.16,.92-.08,t.leatherBeige,0,Y+.12,V,.05),K(x,.46,.11,.3,t.plasticLight,-.28,Y+.24,n-.26,.04),K(x,y-.36,.07,.34,t.accent("#5a6b57"),.02,Y+.23,V+.2,.03);for(let yt of[-1,1])K(x,.02,.52,.92-.1,t.fabric,yt*(y/2-.06),Y+.34,V,.01);if(d.push({pos:[0,Y+.3,n-.35],label:"\u0421\u043F\u0430\u043B\u044C\u043D\u043E\u0435 \u043C\u0435\u0441\u0442\u043E"}),c==="mega"){K(x,y-.2,.09,1.3,t.interiorMid,0,r+1.86,n-.72,.02),K(x,y-.3,.12,1.2,t.leatherBeige,0,r+1.95,n-.72,.03);for(let yt of[-1,1])q(x,.03,.62,.03,t.steel,yt*.34,r+1.4,n-.16);for(let yt=0;yt<3;yt++)q(x,.72,.03,.03,t.steel,0,r+1.2+yt*.24,n-.16)}}if(c==="mega"||i.unit.luxury){let N=K(x,.5,.8,.55,t.interiorMid,-1,r+.55,n-.55,.04),V=K(x,.42,.5,.5,t.plasticGray,1,r+.42,n-.5,.04);q(x,1.6,.05,.5,t.wood||t.plasticLight,0,r+.95,n-.5),d.push({pos:[1,r+.6,n-.5],label:"\u0425\u043E\u043B\u043E\u0434\u0438\u043B\u044C\u043D\u0438\u043A"})}K(x,.3,.06,.06,t.plasticLight,.6,o-.18,m,.02);let Q=Yt(x,.08,.08,.04,t.headlight,0,o-.12,m+.4,14);Q.rotation.x=At;for(let N of[-1,1]){let V=K(x,.62,.16,.03,t.plasticLight,N*.5,l+.05,e+.22,.02);V.rotation.x=-.25}for(let[N,V]of[[-.64,.1],[-.44,.16],[-.22,.1]]){let Y=q(x,V,.03,.16,t.steel,N,r+.16,e+.55);Y.rotation.x=.5}return K(x,.6,.03,.3,t.plastic,.55,R+.03,S-.12,.01),K(x,.4,.28,.4,t.interiorMid,.5,r+.3,e+1.7,.03),{group:x}}function Tx(i){var S,R,_;let t=(S=i.length)!=null?S:4.7,e=(R=i.width)!=null?R:1.84,n=(_=i.height)!=null?_:1.44,s=i.style||"sedan",r=s==="coupe"||s==="sport",o=s==="van",a=s==="suv"||s==="pickup"||s==="crossover",l=s==="micro",c=s==="wagon",h=-t/2,u=t/2,d=.26,f=n*(r?.72:o?.62:.66),g=n*(a?.58:o?.46:r?.5:.56),x=n*(a?.5:.46),m=n*(a?.7:.62),p=h+t*(o?.2:a?.24:.27),b=h+t*(o?.3:a?.34:r?.3:.31),M=b+(n-g)*(o?.7:a?.85:1.05),y=u-t*(c?.05:o?.03:a?.13:r?.4:.31),T=y+(n-m)*(o?.35:a?.5:r?1.6:.95);return{L:t,W:e,H:n,style:s,sport:r,wagon:c,van:o,suv:a,micro:l,front:h,rear:u,ground:d,belt:f,hoodY:g,deckY:m,noseY:x,hoodZ:p,wsBase:b,wsTopZ:M,roofRearZ:y,rearBaseZ:T}}function wx(i){let{front:t,rear:e,noseY:n,hoodY:s,hoodZ:r,wsBase:o,wsTopZ:a,roofRearZ:l,rearBaseZ:c,deckY:h,H:u}=i,d=[],f=(g,x,m,p=0)=>{for(let b=0;b<=m;b++){let M=b/m,y=Li(g[0],x[0],M),T=Li(g[1],x[1],M)+Math.sin(M*we)*p;d.push([y,T])}};return d.push([t,n]),f([t,n],[t+.05,n+.03],1),f([t+.05,n+.03],[r,s],4,.035),f([r,s],[o,s+.035],1),f([o,s+.035],[a,u-.015],1),f([a,u-.015],[l,u-.02],4,.015),f([l,u-.02],[c,h],3),f([c,h],[e,h-.02],2),d}function Ax(i,t,e){for(let n=0;n<i.length-1;n++){let[s,r]=i[n],[o,a]=i[n+1];if(t>=s&&t<=o||t>=o&&t<=s){let l=Math.abs(o-s)<1e-6?0:(t-s)/(o-s);return Li(r,a,Ii(l,0,1))}}return e}function no(i,t,e={}){var jt,ot,ht;let n=e.simple===!0,s=Tx(i),{L:r,W:o,H:a,front:l,rear:c,belt:h,ground:u}=s,d=wx(s),f=(jt=i.wheelRadius)!=null?jt:.33,g=(ot=i.wheelWidth)!=null?ot:.23,x=(ht=i.wheelbase)!=null?ht:r*.58,m=o/2,p=i.paint||"#2f5d8a",b=i.accent||"#d8d5c8",M=Ae(null,`car:${i.id}`),y=[],T=[],S=[],R=t.paint(p,{metalness:.5,roughness:.26}),_=new $t(p).multiplyScalar(.78),w=t.paint(_,{metalness:.4,roughness:.42}),P=t.accent(b),I=t.chrome,A=t.plastic;S.push(R,w,P);let U=.09,L=m-U/2,k=[-x/2,x/2],W=u+.08,z=h,Q=s.wsBase+Math.max(.16,r*.035),N=s.rearBaseZ-Math.max(.14,r*.03),V=Li(Q,N,s.van?.34:.47),Y=s.van||s.micro?.22:.09,yt=rt=>Math.max(z+.07,Ax(d,rt,a)-.075),_t=[{z0:Q,z1:V-Y/2},{z0:V+Y/2,z1:N}].filter(rt=>rt.z1-rt.z0>.24),te=new Ps,qt=[[l,u],...d,[c,u]];te.moveTo(qt[0][0],qt[0][1]);for(let rt=1;rt<qt.length;rt++)te.lineTo(qt[rt][0],qt[rt][1]);te.closePath();for(let rt of k){let lt=new yi;lt.absarc(rt,f+.02,f+.05,0,on,!1),te.holes.push(lt)}for(let rt of _t){let lt=new yi,xt=8,kt=[[rt.z0,z+.02]];for(let bt=0;bt<=xt;bt++){let Wt=Li(rt.z0,rt.z1,bt/xt);kt.push([Wt,yt(Wt)])}kt.push([rt.z1,z+.02]),lt.moveTo(kt[0][0],kt[0][1]);for(let bt=1;bt<kt.length;bt++)lt.lineTo(kt[bt][0],kt[bt][1]);lt.closePath(),te.holes.push(lt)}if(n){for(let rt of k)for(let lt of[-1,1]){let xt=Ni(t,{radius:f,width:g,style:"car",rimColor:"#b9bfc4"});xt.position.set(lt*(m-g*.55),f,rt),lt<0&&(xt.rotation.y=we),M.add(xt)}q(M,o*.9,.1,r*.9,A,0,.2,0)}else{let kt=function(B,X,at=0){let ft=[];for(let[gt,mt]of B){let Ot=Ii((mt-h)/Math.max(.2,a-h),0,1),tt=(m-.015+at)*(1-.055*Ot*Ot);ft.push(-tt,mt,gt,tt,mt,gt)}let $=[];for(let gt=0;gt<B.length-1;gt++){let mt=gt*2;$.push(mt,mt+1,mt+2,mt+1,mt+3,mt+2)}let nt=$,pt=new Ne;pt.setAttribute("position",new he(ft,3)),pt.setIndex(nt),pt.computeVertexNormals();let Et=X.clone?X.clone():X;Et.side=Ce,M.add(new Lt(pt,Et))},rt=new Pr(te,{depth:U,bevelEnabled:!0,bevelThickness:.01,bevelSize:.01,bevelSegments:1,curveSegments:10});rt.rotateY(-At),rt.computeBoundingBox();let lt=rt.boundingBox,xt=m-lt.max.x;rt.translate(xt,0,0);for(let B of[-1,1]){let X=new Lt(rt,R);B<0&&(X.scale.x=-1),X.castShadow=!0,M.add(X)}kt(d,R);let bt=new ri({color:2373186,metalness:.35,roughness:.08,transparent:!0,opacity:.62,envMapIntensity:1.8,side:Ce,depthWrite:!1}),Wt=(B,X,at,ft,$,nt)=>{let pt=at-B,Et=ft-X,gt=Math.hypot(pt,Et)||1,mt=0,Ot=pt/gt,tt=-Et/gt,vt=mt*nt,O=Ot*nt,dt=tt*nt,it=new Ne,Tt=[-m*$,X+O,B+dt,m*$,X+O,B+dt,-m*$,ft+O,at+dt,m*$,ft+O,at+dt];it.setAttribute("position",new he(Tt,3)),it.setIndex([0,1,2,1,3,2]),it.computeVertexNormals();let Rt=new Lt(it,bt);Rt.renderOrder=2,M.add(Rt)};Wt(s.wsBase-.06,s.hoodY+.02,s.wsTopZ-.03,a-.04,.9,.09),Wt(s.roofRearZ+.04,a-.05,s.rearBaseZ+.02,s.deckY+.02,.88,.09);for(let[B,X,at,ft,$]of[[s.wsBase-.06,s.hoodY+.02,s.wsTopZ-.03,a-.04,.9],[s.roofRearZ+.04,a-.05,s.rearBaseZ+.02,s.deckY+.02,.88]])for(let nt of[-1,1]){let pt=at-B,Et=ft-X,gt=Math.hypot(pt,Et)||1,mt=q(M,.035,.035,gt,A,nt*m*$,(X+ft)/2,(B+at)/2);mt.rotation.x=-Math.atan2(Et,Math.abs(pt)),mt.position.y+=.01}let Zt=new Lt(new bn(o-.06,r-.16),t.plastic);Zt.rotation.x=-At,Zt.position.y=u-.004,M.add(Zt);for(let B of k)for(let X of[-1,1]){let at=Ni(t,{radius:f,width:g,style:"car",rimColor:s.sport?"#2b2f33":"#c3c9cd",tread:t.rubber,spokes:s.sport?5:6});at.position.set(X*(m-g*.52),f,B),X<0&&(at.rotation.y=we),M.add(at),y.push(at);let ft=new Lt(new qe(f+.06,.018,5,20,we),A);ft.position.set(X*(m+.004),f+.02,B);let $=new Lt(new ye(f+.055,f+.055,.2,16,1,!0,0,we),t.plastic);$.rotation.z=At,$.position.set(X*(m-.16),f+.02,B),M.add($),ft.rotation.y=X>0?-At:At,M.add(ft)}for(let B of[-1,1])K(M,.07,.1,x*.78,A,B*(m+.002),u+.13,0,.02),q(M,.02,.028,x*.92,w,B*(m+.013),h-.26,0),q(M,.015,.018,x*.9,I,B*(m+.013),h-.2,0);for(let B of _t)for(let X of[-1,1]){let at=[],ft=[];for(let Et=0;Et<=8;Et++){let gt=Li(B.z0,B.z1,Et/8);at.push(X*(L-.035),z+.015,gt)}for(let Et=0;Et<=8;Et++){let gt=Li(B.z0,B.z1,Et/8);at.push(X*(L-.035),yt(gt)-.012,gt)}let nt=9;for(let Et=0;Et<nt-1;Et++)ft.push(Et,Et+1,nt+Et,Et+1,nt+Et+1,nt+Et);let pt=new Ne;pt.setAttribute("position",new he(at,3)),pt.setIndex(ft),pt.computeVertexNormals(),M.add(new Lt(pt,t.glass))}for(let B of[-1,1]){let X=Math.max(.25,yt(V)-z);q(M,.02,X,Y,A,B*(m+.004),z+X/2,V)}let F=l+.004,ee=(u+s.noseY)/2+.02;K(M,o*.42,Math.max(.12,s.noseY-ee-.06),.08,A,0,ee,F-.02,.02);for(let B=-3;B<=3;B++)q(M,o*.38,.013,.015,I,0,ee+B*.022,F-.06);let ie=Yt(M,.058,.058,.018,I,0,ee,F-.075,20);ie.rotation.x=At;for(let B of[-1,1]){K(M,.34,.09,.1,t.headlight,B*m*.68,s.noseY-.02,l+.06,.03),q(M,.26,.016,.02,I,B*m*.68,s.noseY-.075,l+.02),q(M,.13,.04,.05,t.amber,B*m*.84,s.noseY-.09,l+.04);let X=Yt(M,.042,.042,.025,t.headlight,B*m*.6,u+.18,l-.008,10);X.rotation.x=At}K(M,o*.98,.24,.22,w,0,u+.13,l+.08,.06),K(M,o*.58,.1,.05,A,0,u+.05,l+.02,.02);for(let B of[-1,1])K(M,.38,.12,.1,t.taillight,B*m*.66,s.deckY-.08,c-.01,.02),q(M,.18,.045,.03,t.reverseLight,B*m*.56,s.deckY-.17,c+.01);let C=Ys("\u041E 777 \u0410\u0410");if(C&&Ke(M,.42,.11,new pe({map:C,roughness:.55}),0,s.deckY-.3,c+.012),K(M,o*.98,.22,.16,w,0,u+.16,c-.06,.05),s.sport){for(let B of[-1,1]){let X=Yt(M,.048,.048,.1,I,B*.3,u+.08,c-.02,12);X.rotation.x=At}K(M,o*.76,.03,.24,R,0,a+.13,s.roofRearZ-.12,.02);for(let B of[-1,1])q(M,.035,.15,.1,A,B*o*.27,a+.06,s.roofRearZ-.12)}let v=s.wsBase+.06;for(let B of[-1,1]){q(M,.14,.04,.05,A,B*(m+.02),h+.05,v),K(M,.15,.085,.1,R,B*(m+.085),h+.07,v,.03),q(M,.018,.055,.075,t.mirror,B*(m+.155),h+.07,v);for(let X of[Q+.5,V+.02]){let at=Math.min(X,N-.18);K(M,.03,.038,.15,I,B*(m+.008),h-.12,at,.02)}}let G=Di(i.brand||"ASTER",{width:256,height:64,bg:"rgba(0,0,0,0)",fg:"#f4f0e4",accent:b,font:"bold 40px Arial, sans-serif",border:!1});if(G){let B=new pe({map:G,transparent:!0,roughness:.5});for(let X of[-1,1]){let at=Ke(M,.52,.13,B,X*(m+.03),u+.33,s.wsBase-.35);at.rotation.y=X>0?-At:At}}T.push({pos:[0,a+.06,s.roofRearZ-.35],label:"\u041A\u0440\u044B\u0448\u0430"}),T.push({pos:[L,h+.12,V],label:"\u0414\u0432\u0435\u0440\u044C \u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044F"}),T.push({pos:[0,ee,l],label:"\u0420\u0435\u0448\u0451\u0442\u043A\u0430 \u0438 \u0444\u0430\u0440\u044B"}),T.push({pos:[0,s.deckY-.15,c],label:"\u041A\u043E\u0440\u043C\u043E\u0432\u0430\u044F \u0447\u0430\u0441\u0442\u044C"});for(let B of k)T.push({pos:[m,f,B],label:"\u041A\u043E\u043B\u0435\u0441\u043E",side:"\u0441\u043F\u0440\u0430\u0432\u0430"});M.add(Rx({M:t,S:s,nodes:d,pick:yt,unit:i,halfW:m,sideT:U,belt:h,H:a,R:f,anchors:T,floorY:W}))}let Kt=o-.3,et=h+.3,st=a-(s.sport?.24:s.micro?.26:.3),St=st-(h+.3),wt=s.sport?Math.min(s.roofRearZ-.5,s.wsTopZ+.62):s.wsTopZ+(s.van?.62:s.suv?.58:.46),Mt=[{id:"driver",label:"\u041C\u0435\u0441\u0442\u043E \u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044F",group:"interior",pos:[-Kt*.22,h+et*0+.3+St,wt],target:[-.06,st-(s.sport?.34:.3),s.wsBase-7],fov:68,orbit:!1,seat:!0},{id:"salon",label:"\u0421\u0430\u043B\u043E\u043D",group:"interior",pos:[Kt*.16,h+.18,s.rearBaseZ-.72],target:[-.14,h-.02,s.wsBase-1.6],fov:74,orbit:!0,seat:!0},{id:"exterior",label:"\u0421\u043D\u0430\u0440\u0443\u0436\u0438",group:"exterior",pos:[6.4,2.55,-7],target:[0,.72,.05],fov:32,orbit:!0,autoRotate:!0},{id:"side",label:"\u0421\u0431\u043E\u043A\u0443",group:"exterior",pos:[8.8,1.3,.15],target:[0,.72,0],fov:27,orbit:!0},{id:"rear",label:"\u0421\u0437\u0430\u0434\u0438",group:"exterior",pos:[-4.7,2.1,6.8],target:[0,.75,.1],fov:33,orbit:!0}];return{root:M,wheels:y,paintMats:S,views:Mt,anchors:T,layout:{frontZ:l,rearEnd:c,roofY:a,floorY:W,wheelRadius:f,belt:h,length:r,width:o},kind:"car"}}function Rx({M:i,S:t,nodes:e,pick:n,unit:s,halfW:r,sideT:o,belt:a,H:l,R:c,anchors:h,floorY:u}){let d=Ae(null,"interior"),f=t.W-.3,g=t.wsBase+.02,x=t.rearBaseZ-.06,m=(g+x)/2,p=t.wsTopZ+.36,b=p-.62,M=p+.12,y=i.interiorDark,T=i.interiorMid,S=t.sport,R=S?i.leather:i.fabric,_=S?i.accent(s.accent||"#d8d5c8"):i.fabric;K(d,f+.05,.03,x-g+.7,i.rubberTrim,0,u,m+.1,.02);for(let N of[-.34,.34])K(d,.44,.012,.44,i.fabric,N,u+.025,g+.55,.01);for(let N of[-1,1]){let V=N*(f/2-.02);K(d,.04,Math.max(.24,a-u-.08),x-g+.3,y,V,u+.28,m,.02),K(d,.1,.055,.4,_,V-N*.03,a-.1,M-.16,.02),K(d,.1,.07,.32,T,V-N*.04,u+.4,M+.06,.02),q(d,.025,.028,.1,i.chromeDark,V-N*.04,a-.18,M-.3);let Y=Yt(d,.05,.05,.018,i.plastic,V-N*.04,u+.26,M-.52,10);Y.rotation.z=At}K(d,f-.08,.025,t.roofRearZ-t.wsTopZ+.1,i.interiorMid,0,l-.13,(t.wsTopZ+t.roofRearZ)/2,.02),K(d,.23,.2,x-g-.2,T,0,u+.11,m-.1,.04),s.seats>2&&K(d,f-.1,Math.max(.2,a-u-.14),.05,y,0,u+.32,x+.12,.02);let w=u+.42;K(d,f,.32,.42,y,0,u+.33,b,.06),K(d,f-.05,.12,.54,T,0,w+.02,b+.08,.05);let P=K(d,.44,.15,.24,y,-f*.27,w+.04,b-.14,.04);P.rotation.x=-.16;for(let N of[-f*.32,-f*.22]){let V=Yt(d,.07,.07,.018,i.plastic,N,w+.065,b-.2,18);V.rotation.x=At,Zn(d,.068,.005,i.chromeDark,N,w+.065,b-.204,16);let Y=q(d,.005,.075,.004,i.taillight,N,w+.09,b-.206);Y.rotation.z=.7}let I=K(d,.3,.19,.022,i.dashScreen,.07,w+.03,b-.04,.02);I.rotation.x=-.1;for(let N of[-1,1]){K(d,.12,.055,.028,i.plastic,N*.37,w+.055,b-.1,.02);for(let V=-1;V<=1;V++)q(d,.009,.045,.01,i.chromeDark,N*.37+V*.032,w+.055,b-.115)}let A=Ae(d,"steering");A.position.set(-f*.27,w+.08,b-.22),A.rotation.x=-.42,Zn(A,.175,.02,i.leather,0,0,0,34);let U=Yt(A,.055,.06,.05,i.plastic,0,0,.02,16);U.rotation.x=At;for(let N=0;N<3;N++){let V=At+N*(on/3),Y=q(A,.03,.15,.016,i.plasticGray,Math.cos(V)*.08,Math.sin(V)*.08,.012);Y.rotation.z=V-At}let L=Yt(A,.025,.025,.01,i.accent(s.accent||"#d8d5c8"),0,0,.045,12);L.rotation.x=At;let k=Yt(d,.032,.048,.42,i.plastic,-f*.27,w-0,b-.03,10);k.rotation.x=.6;let W=Yt(d,.016,.02,.17,i.chromeDark,.12,u+.22,b+.22,8);W.rotation.x=-.28,Qi(d,.032,i.plastic,.12,u+.3,b+.25,8),K(d,.21,.1,.46,T,0,u+.24,(b+x)/2+.1,.03);for(let N of[-.045,.045])Yt(d,.028,.028,.02,i.rubberTrim,N,u+.28,(b+x)/2-.04,10);for(let N of[-f*.34,-f*.22]){let V=q(d,.055,.018,.09,i.steel,N,u+.13,b-.24);V.rotation.x=.6}K(d,.19,.045,.03,i.plastic,0,l-.1,t.roofRearZ-.34,.02),q(d,.16,.036,.007,i.mirror,0,l-.1,t.roofRearZ-.358);for(let N of[-1,1])K(d,.3,.045,.018,i.plasticLight,N*.24,l-.14,t.wsTopZ+.2,.015);let z=Yt(d,.036,.036,.016,i.headlight,0,l-.122,m,8);z.rotation.x=At,K(d,.09,.04,.04,i.plastic,0,l-.14,t.wsTopZ+.3,.02);function Q(N,V,{rear:Y=!1,width:yt=.47}={}){let _t=Ae(d);K(_t,yt,.09,.44,R,0,u+.25,0,.03);for(let Kt of[-1,1])K(_t,.065,.12,.4,_,Kt*(yt/2-.008),u+.29,0,.03);let te=Y?.3:.16,qt=K(_t,yt-.02,.56,.13,R,0,u+.56,.19,.05);qt.rotation.x=te;for(let Kt of[-1,1]){let et=K(_t,.055,.48,.1,_,Kt*(yt/2-.008),u+.58,.2,.04);et.rotation.x=te}if(K(_t,yt-.18,.13,.1,R,0,u+.89,.27,.03),!Y){let Kt=q(_t,.045,.54,.01,i.plasticGray,-yt/2+.05,u+.58,.26);Kt.rotation.x=te}return _t.position.set(N,0,V),_t}if(Q(-f*.27,M),!S&&t.style!=="micro"&&Q(f*.27,M),h.push({pos:[-f*.27,u+.6,M],label:"\u0421\u0438\u0434\u0435\u043D\u044C\u0435 \u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044F"}),h.push({pos:[0,u+.52,b],label:"\u0422\u043E\u0440\u043F\u0435\u0434\u043E \u0438 \u0440\u0443\u043B\u044C"}),s.seats>2){let N=x-.5;if(s.seats>=5){K(d,f-.08,.11,.46,R,0,u+.27,N,.04);for(let Y of[-1,1])K(d,.08,.14,.44,_,Y*(f/2-.07),u+.31,N,.03);let V=K(d,f-.06,.5,.13,R,0,u+.58,N+.25,.05);V.rotation.x=.26;for(let Y of[-1,0,1])K(d,.14,.1,.08,R,Y*(f*.26),u+.85,N+.29,.02);h.push({pos:[0,u+.52,N],label:"\u0417\u0430\u0434\u043D\u0438\u0439 \u0440\u044F\u0434"})}else Q(-f*.27,N,{rear:!0}),Q(f*.27,N,{rear:!0})}return d}var gn=1.25;function Pe(i,t=.65,e=.2){return new pe({color:i,roughness:t,metalness:e})}function Ed(i,t){var L,k,W;let e=Ae(null,`trailer:${i.id}`),n=[],s=[],r=(L=i.length)!=null?L:13.6,o=(k=i.width)!=null?k:2.55,a=(W=i.height)!=null?W:2.75,l=i.type,c=r/2,h=-c,u=c,d=i.color||"#d5d8d3",f=Pe(d,.72,.12),g=Pe(new $t(d).multiplyScalar(.86),.78,.12),x=t.darkSteel,m=l==="lowboy",p=m?.92:gn,b=l==="lowboy"?4:l==="bdouble"?5:l==="dolly"||l==="boat"?2:3,M=Ae(e,"frame");if(l==="dolly"){for(let z of[-1,1])Tn(M,[z*.55,gn-.1,h+.2],[z*.02,gn-.1,h+2.4],.07,x),q(M,.14,.24,r-2.2,x,z*.52,gn-.12,.6);q(M,1.2,.22,.24,x,0,gn-.1,h+2.4),q(M,.5,.18,2.4,t.steel,0,gn-.14,h+1.4)}else if(m){q(M,1.1,.4,3.4,x,0,p+.16,h+1.7);for(let z of[-1,1])q(M,.14,.42,r-.4,x,z*(o/2-.32),p-.2,.2);for(let z=h+.6;z<u;z+=1.2)q(M,o-.6,.18,.12,x,0,p-.18,z)}else{for(let z of[-1,1])q(M,.16,.34,r-.5,x,z*(o/2-.22),p-.2,.2);for(let z=h+.8;z<u-.2;z+=1.15)q(M,o-.4,.16,.12,x,0,p-.22,z)}if(l!=="dolly"&&l!=="boat"){for(let z of[-1,1]){let Q=K(M,.16,.9,.2,t.plasticGray,z*.85,gn-.62,h+1.75,.02);q(M,.3,.06,.3,t.darkSteel,z*.85,gn-1.1,h+1.75),Tn(M,[z*.85,gn-.55,h+1.7],[z*.85,gn-.18,h+2],.02,t.chromeDark)}K(M,1,.1,.8,x,0,gn-.33,h+.5,.02),Yt(M,.07,.07,.26,t.steel,0,gn-.45,h+.5,12),s.push({pos:[0,gn-.4,h+.5],label:"\u0421\u0446\u0435\u043F\u043D\u043E\u0439 \u0448\u043A\u0432\u043E\u0440\u0435\u043D\u044C"})}let y=l==="lowboy"?.48:l==="boat"?.32:.5,T=[];if(l==="bdouble")T.push(u-.7,u-1.55);else if(l==="dolly")T.push(1,1.85);else if(l==="boat")T.push(1,1.8);else for(let z=0;z<b;z++)T.push(u-.75-z*1.32);let S=l==="boat"?1.02:.94;for(let z of T){Yt(e,.09,.09,o-.35,t.darkSteel,0,y,z,10).rotation.z=At;for(let Q of[-1,1])if(l==="boat"||l==="dolly"){let N=Ni(t,{radius:y,width:.26,style:"truck",rimColor:"#d2d5d7"});N.position.set(Q*S,y,z),Q<0&&(N.rotation.y=we),e.add(N),n.push(N)}else for(let N of[0,.34]){let V=Ni(t,{radius:y,width:.3,style:"truck",rimColor:"#d2d5d7"});V.position.set(Q*(S+N),y,z),Q<0&&(V.rotation.y=we),e.add(V),n.push(V)}if(l!=="boat"&&l!=="dolly")for(let Q of[-1,1]){let N=new Lt(new ye(y+.12,y+.12,1.5,18,1,!0,0,we),t.plastic);N.material.side=Ce,N.rotation.z=At,N.rotation.y=At,N.position.set(Q*(S+.17),y+.04,z),N.scale.y=1.9,e.add(N)}}for(let z of[-1,1]){let Q=T[T.length-1];q(e,.55,.5,.04,t.rubberTrim,z*(S+.17),y-.18,Q-.62),l!=="boat"&&l!=="dolly"&&l!=="lowboy"&&q(e,.05,.12,r*.42,t.steel,z*(o/2-.18),.62,u-3.4)}let R=Ae(e,"rear"),_=p+(l==="flatbed"||l==="logging"||l==="dolly"?.12:.2);q(R,o-.1,.16,.16,t.steel,0,p-.32,u-.02);for(let z of[-1,1])q(R,.22,.16,.06,t.taillight,z*(o/2-.34),p-.42,u-.05),q(R,.22,.1,.06,t.amber,z*(o/2-.34),p-.28,u-.05),q(R,.1,.16,.06,t.reverseLight,z*(o/2-.58),p-.42,u-.05),q(R,.06,.04,.1,t.headlight,z*.42,p-.24,u-.06);let w=Ys("\u0412\u041A 4471");w&&Ke(R,.5,.13,new pe({map:w,roughness:.6}),0,p-.5,u-.1),K(R,o-.2,.16,.16,l==="adr"||l==="tanker"?t.hazard:t.steel,0,.55,u-.12,.03);for(let z of[-1,1])for(let Q=h+2.2;Q<u-.6;Q+=2.4)Qi(e,.032,t.amber,z*(o/2+.005),p+.02,Q,6);let P=Ae(e,"body"),I={M:t,unit:i,body:P,bodyMat:f,bodyMat2:g,W:o,H:a,L:r,halfL:c,zFront:h,zRear:u,deckY:p,R:y,anchors:s,frameMat:x,std:Pe};switch(l){case"curtain":Cx(I);break;case"van":bd(I);break;case"reefer":Px(I);break;case"flatbed":Ix(I);break;case"lowboy":Lx(I);break;case"tanker":Sd(I,!1);break;case"adr":Sd(I,!0);break;case"silo":Dx(I);break;case"tipper":Nx(I);break;case"livestock":Ux(I);break;case"logging":Fx(I);break;case"dolly":Ox(I);break;case"container":Md(I,!1);break;case"refcontainer":Md(I,!0);break;case"carrier":kx(I);break;case"bdouble":zx(I);break;case"boat":Hx(I);break;case"glass":Vx(I);break;case"crane":Gx(I);break;case"sidetip":Wx(I);break;default:bd(I)}if(["curtain","van","reefer","tipper","livestock"].includes(l)){let z=Di(i.brand,{width:512,height:128,bg:"rgba(0,0,0,0)",fg:"#f7f4ea",accent:"#e8b45a",font:"bold 64px Arial, sans-serif",border:!1});if(z){let Q=new pe({map:z,transparent:!0,roughness:.5});for(let N of[-1,1]){let V=Ke(P,2.4,.6,Q,N*(o/2+.02),p+1.35,h+3);V.rotation.y=N>0?-At:At}}}return{root:e,wheels:n,paintMats:[f,g],views:[{id:"exterior",label:"\u0421\u043D\u0430\u0440\u0443\u0436\u0438",group:"exterior",pos:[12.5,5.2,-11.5],target:[0,1.6,.6],fov:38,orbit:!0,autoRotate:!0},{id:"side",label:"\u0421\u0431\u043E\u043A\u0443",group:"exterior",pos:[17.5,2.6,1],target:[0,1.7,.2],fov:32,orbit:!0},{id:"rear",label:"\u0421\u0437\u0430\u0434\u0438",group:"exterior",pos:[-6.5,4.2,13.5],target:[0,1.5,.4],fov:40,orbit:!0},{id:"front",label:"\u0421\u043F\u0435\u0440\u0435\u0434\u0438",group:"exterior",pos:[5,4,-14.5],target:[0,1.4,.4],fov:40,orbit:!0}],anchors:s,layout:{frontZ:h,rearEnd:u,roofY:p+a,deckY:p,axleZ:T,wheelRadius:y,width:o,length:r},kind:"trailer"}}function Cx(i){var x,m;let{M:t,body:e,bodyMat:n,bodyMat2:s,W:r,H:o,L:a,halfL:l,zFront:c,deckY:h,unit:u}=i,d=h+o;K(e,r,.12,a-.1,t.wood,0,h+.06,0,.02),q(e,r-.12,.02,a-.3,t.wood,0,h+.13,0);let f=new pe({color:new $t("#cfd3d0"),map:((x=t.tarp)==null?void 0:x.map)||null,roughness:.93,metalness:.02,side:Ce});for(let p of[-1,1]){let b=Ke(e,a-.4,o-.1,f,p*(r/2+.005),h+o/2,0);b.rotation.y=p>0?-At:At;for(let M=c+.6;M<l-.4;M+=1.35)q(e,.05,o-.12,.03,t.plasticGray,p*(r/2+.03),h+o/2,M);q(e,.05,.12,a-.4,t.plasticGray,p*(r/2),h-.02,0),q(e,.09,.09,a-.2,t.steel,p*(r/2),d+.02,0)}let g=new pe({color:14672869,map:((m=t.tarp)==null?void 0:m.map)||null,roughness:.94});K(e,r+.04,.07,a-.2,g,0,d+.04,0,.02);for(let p=c+.8;p<l;p+=1.5)q(e,r,.05,.05,t.steel,0,d-.03,p);q(e,r-.04,o,.1,s,0,h+o/2,c+.12),q(e,r-.06,o-.05,.1,n,0,h+o/2,l-.14);for(let p of[-1,1])q(e,.12,o-.3,.05,t.steel,p*(r/2-1.1),h+o/2,l-.08),q(e,.05,.5,.06,t.chromeDark,p*(r/2-1.1),h+.75,l-.05);for(let p=c+1.2;p<l-.5;p+=3.2)for(let b of[-1,1])q(e,.06,o,.06,t.steel,b*(r/2-.06),h+o/2,p);i.anchors.push({pos:[0,h+.6,l-.2],label:"\u0417\u0430\u0434\u043D\u0438\u0435 \u0432\u043E\u0440\u043E\u0442\u0430"}),i.anchors.push({pos:[r/2+.06,h+1.4,0],label:"\u0411\u043E\u043A\u043E\u0432\u0430\u044F \u0448\u0442\u043E\u0440\u043A\u0430"})}function bd(i){let{M:t,body:e,bodyMat:n,bodyMat2:s,W:r,H:o,L:a,zFront:l,zRear:c,deckY:h}=i,u=h+o;K(e,r,o,a-.3,n,0,h+o/2+.05,0,.06);for(let d=l+.5;d<c-.4;d+=.55)for(let f of[-1,1])q(e,.03,o-.2,.05,s,f*(r/2+.005),h+o/2,d);for(let d=l+.5;d<c-.4;d+=.8)q(e,r-.1,.03,.06,s,0,u+.05,d);for(let d of[-1,1]){let f=K(e,r/2-.1,o-.22,.08,n,d*(r/4-.02),h+o/2,c-.16,.02);q(e,.05,.6,.05,t.chromeDark,d*(r/4-.02)-d*.35+d*.05,h+1,c-.1);for(let g=h+.4;g<u-.2;g+=.55)q(e,.08,.12,.06,t.steel,d*.05,g,c-.11)}q(e,.03,o-.2,.02,t.plastic,0,h+o/2,c-.1),i.anchors.push({pos:[0,h+.5,c-.2],label:"\u0414\u0432\u0435\u0440\u0438 \u0444\u0443\u0440\u0433\u043E\u043D\u0430"})}function Px(i){let{M:t,body:e,bodyMat:n,bodyMat2:s,W:r,H:o,L:a,zFront:l,zRear:c,deckY:h}=i,u=h+o;K(e,r,o,a-.3,n,0,h+o/2+.05,0,.07);for(let g=l+.4;g<c-.3;g+=.9)for(let x of[-1,1])q(e,.02,o-.2,.05,s,x*(r/2+.005),h+o/2,g);let d=K(e,1.7,1.15,.55,t.plasticLight,0,h+o-.72,l+.2,.06);q(e,1.3,.9,.05,t.plastic,0,h+o-.72,l-.1);for(let g=-3;g<=3;g++)q(e,.06,.78,.03,t.plasticGray,g*.16,h+o-.72,l-.12);let f=Yt(e,.3,.3,.1,t.plastic,0,h+o-1.35,l+.15,20);f.rotation.x=At,K(e,.5,.5,.35,t.plasticGray,-.9,h+.55,l+.25,.04);for(let g of[-1,1]){q(e,.06,o-.2,.05,t.chromeDark,g*(r/2-.06),h+o/2,c-.06);for(let x=h+.4;x<u-.2;x+=.55)q(e,.08,.12,.06,t.steel,g*.05,x,c-.11)}i.anchors.push({pos:[0,h+o-.6,l-.2],label:"\u0425\u043E\u043B\u043E\u0434\u0438\u043B\u044C\u043D\u0430\u044F \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0430"})}function Ix(i){let{M:t,body:e,W:n,L:s,zFront:r,zRear:o,deckY:a,halfL:l}=i;K(e,n,.12,s-.2,t.steel,0,a+.06,0,.02);for(let c=r+.4;c<o-.2;c+=.6)q(e,n-.2,.02,.06,t.darkSteel,0,a+.13,c);for(let c of[-1,1]){q(e,.07,.38,s-.3,t.steel,c*(n/2),a+.3,0),q(e,.05,.06,s-.3,t.chromeDark,c*(n/2),a+.5,0);for(let h=r+.4;h<o-.2;h+=1.2)q(e,.06,.34,.05,t.darkSteel,c*(n/2),a+.32,h)}q(e,n,.34,.07,t.steel,0,a+.3,r+.25);for(let c of[r+1,l-2,l-.6])for(let h of[-1,1])q(e,.1,1.3,.1,t.darkSteel,h*(n/2-.1),a+.7,c),Tn(e,[h*(n/2-.1),a+1.3,c],[h*.2,a+1.34,c],.04,t.steel);for(let c=0;c<5;c++){let h=a+.32+c*.16,u=Yt(e,.13,.13,s-2.6,t.steel,-.35+c%2*.55,h,-.4,14);u.rotation.x=At}for(let c of[r+2.2,l-3]){q(e,n-.3,.02,.07,t.rope,0,a+.9,c);for(let h of[-1,1])q(e,.03,.85,.03,t.rope,h*(n/2-.2),a+.55,c)}i.anchors.push({pos:[0,a+.9,-.4],label:"\u0413\u0440\u0443\u0437: \u0441\u0442\u0430\u043B\u044C\u043D\u044B\u0435 \u0442\u0440\u0443\u0431\u044B"})}function Lx(i){let{M:t,body:e,W:n,L:s,zFront:r,zRear:o,deckY:a,halfL:l}=i,c=a-.05;K(e,n,.16,s-4.4,t.steel,0,c,o-3.2,.02);for(let p=r+3.2;p<o-.6;p+=.9)q(e,n-.2,.06,.1,t.darkSteel,0,c-.08,p);K(e,n-.2,.9,3.2,t.steel,0,a+.4,r+1.9,.05),q(e,n-.4,.12,3.2,t.darkSteel,0,a+.86,r+1.9);let h=K(e,n-.3,.12,3.6,t.steel,0,c+.05,o+1.7,.03);h.rotation.x=-.12;for(let p of[-1,1])q(e,.06,.16,3.6,t.darkSteel,p*(n/2-.2),c+.12,o+1.7);let u=Ae(e,"excavator");u.position.set(0,c+.08,o-3.4);let d=Pe("#c9a227",.5,.3),f=Pe("#1b1d1f",.85,.1);for(let p of[-1,1]){K(u,.52,.44,3,f,p*.72,.3,0,.1);for(let b=-2;b<=2;b++)Yt(u,.2,.2,.53,t.steel,p*.72,.3,b*.6,12).rotation.z=At}K(u,2.1,.3,2.4,t.darkSteel,0,.6,0,.04),K(u,1.7,.72,1.9,d,0,1.06,.2,.08),K(u,.8,.9,.9,d,-.55,1.5,-.55,.05),K(u,.62,.5,.62,t.glassDark,-.55,1.6,-.6,.03);let g=K(u,.3,.28,2.4,d,.1,1.6,.9,.04);g.rotation.x=-.55;let x=K(u,.22,.2,1.8,d,.1,1.95,2.6,.03);x.rotation.x=.5;let m=K(u,.75,.5,.7,Pe("#4c4f52",.6,.4),.1,1.55,3.25,.05);i.anchors.push({pos:[0,c+1.4,o-3.4],label:"\u0413\u0440\u0443\u0437: \u0433\u0443\u0441\u0435\u043D\u0438\u0447\u043D\u044B\u0439 \u044D\u043A\u0441\u043A\u0430\u0432\u0430\u0442\u043E\u0440"})}function Sd(i,t){let{M:e,body:n,W:s,L:r,zFront:o,zRear:a,deckY:l,unit:c}=i,h=1.02,u=l+h+.16,d=t?Pe("#e8e9e4",.4,.4):e.tank,f=r-2.4,g=new ye(h,h,f,36,1,!1),x=new Lt(g,d);x.rotation.x=At,x.position.set(0,u,-.2),n.add(x);for(let p of[-1,1]){let b=new Lt(new Gn(h,32,16,0,on,0,At),d);b.rotation.x=p>0?-At:At,b.position.set(0,u,p>0?f/2-.2:-f/2-.2),b.scale.z=.55,n.add(b)}for(let p=0;p<4;p++){let b=Zn(n,h+.01,.03,e.steel,0,u,-f/2+.5+p*(f-1)/3,32);b.rotation.y=0}for(let p=0;p<3;p++){let b=Yt(n,.26,.3,.18,e.chromeDark,0,u+h+.06,-f/3+p*(f/3),20),M=Yt(n,.3,.3,.05,e.chrome,0,u+h+.16,-f/3+p*(f/3),20),y=q(n,.5,.04,.06,e.steel,0,u+h+.2,-f/3+p*(f/3))}for(let p=0;p<5;p++)q(n,.5,.04,.04,e.steel,.6,l+.5+p*.42,a-.35);for(let p of[-1,1])Tn(n,[.85,l+.3,a-.35],[.85,u+h-.1,a-.35],.025,e.steel),Tn(n,[.36,l+.3,a-.35],[.36,u+h-.1,a-.35],.025,e.steel);for(let p of[-f/2+.6,0,f/2-.6]){for(let b of[-1,1])q(n,.16,.5,.5,e.darkSteel,b*.8,l+.25,p);q(n,s-.4,.16,.6,e.darkSteel,0,l+.2,p)}let m=Yt(n,.12,.12,.4,e.chrome,0,l+.1,.8,14);if(m.rotation.x=At,t){let p=Di("33 1203",{width:256,height:128,bg:"#e08a1e",fg:"#1a1a1a",accent:"#1a1a1a",font:"bold 54px Arial, sans-serif",border:!0});if(p){let b=new pe({map:p,roughness:.5});for(let y of[-1,1]){let T=Ke(n,.62,.3,b,y*(h+.02),u+.25,-1.5);T.rotation.y=y>0?-At:At;let S=Ke(n,.62,.3,b,y*(h+.02),u+.25,1.6);S.rotation.y=y>0?-At:At}let M=Ke(n,.62,.3,b,0,u-.1,f/2+.18)}q(n,s-.2,.1,.04,e.hazard,0,l+.42,a-.1)}i.anchors.push({pos:[0,u+h+.2,-f/3],label:"\u0413\u043E\u0440\u043B\u043E\u0432\u0438\u043D\u0430 \u043B\u044E\u043A\u0430"}),i.anchors.push({pos:[0,l+.1,1.1],label:"\u041D\u0438\u0436\u043D\u0438\u0439 \u043D\u0430\u043B\u0438\u0432"})}function Dx(i){let{M:t,body:e,W:n,L:s,zFront:r,zRear:o,deckY:a}=i,l=Pe("#d3d7d9",.45,.35),c=a+.2;for(let h=0;h<2;h++){let u=-s/4+.2+h*(s/2-.4),d=new Lt(new ye(.62,1.05,2.1,24,1,!1),l);d.position.set(0,c+1.05,u),e.add(d);let f=new Lt(new Gn(.92,24,12,0,on,0,At),l);f.position.set(0,c+2.1,u),f.scale.set(.68,.5,1.1),e.add(f),Yt(e,.22,.26,.14,t.chromeDark,0,c+2.42,u,16);for(let g=0;g<3;g++){let x=Zn(e,1-g*.12,.03,t.steel,0,c+.5+g*.65,u,24);x.rotation.y=0}}for(let h of[-1,1])for(let u=r+1.2;u<o;u+=2.4)q(e,.1,1.8,.1,t.darkSteel,h*.95,c+.9,u);K(e,.9,.6,.7,t.plasticGray,0,a+.5,r+.8,.06),Yt(e,.22,.22,.5,t.steel,.45,a+.55,r+.8,16).rotation.z=At,Tn(e,[.4,a+.7,r+.8],[.4,a+1.9,r+1.9],.05,t.steel);for(let h=0;h<2;h++){let u=new Lt(new qe(.35,.05,8,16,we),t.rubberTrim);u.position.set(.15,a+.35,o-.6-h*.35),u.rotation.y=At,e.add(u)}i.anchors.push({pos:[0,a+1.2,0],label:"\u0411\u0443\u043D\u043A\u0435\u0440-\u0446\u0438\u0441\u0442\u0435\u0440\u043D\u0430"}),i.anchors.push({pos:[0,a+.55,r+.8],label:"\u041A\u043E\u043C\u043F\u0440\u0435\u0441\u0441\u043E\u0440"})}function Nx(i){let{M:t,body:e,bodyMat:n,bodyMat2:s,W:r,H:o,L:a,zFront:l,zRear:c,deckY:h}=i,u=Math.max(o,1.7);K(e,r,.14,a-.3,t.darkSteel,0,h+.2,0,.02);for(let p of[-1,1]){K(e,.1,u,a-.3,n,p*(r/2-.05),h+.2+u/2,0,.02),q(e,.09,.1,a-.4,t.steel,p*(r/2-.03),h+.2+u,0);for(let b=l+.8;b<c-.3;b+=1)q(e,.03,u-.15,.12,s,p*(r/2),h+.2+u/2,b)}q(e,r-.1,u,.12,n,0,h+.2+u/2,l+.22);let d=K(e,r-.1,u-.15,.1,n,0,h+.2+u/2,c-.16,.02);q(e,r-.2,.06,.06,t.steel,0,h+.25+u,c-.12);for(let p of[-1,1])Yt(e,.04,.04,.16,t.chromeDark,p*(r/2-.15),h+.25,c-.16,8);let f=K(e,.18,.9,.18,t.hazard,-.55,h+.75,l+1.2,.03),g=Yt(e,.05,.05,1.1,t.chrome,-.55,h+1.55,l+1.4,12);g.rotation.x=-.32;let x=K(e,r,.06,a-.5,t.tarp,0,h+.2+u+.04,0,.02),m=Pe("#6f6a63",.98,.02);for(let p=0;p<26;p++){let b=.12+Math.random()*.12,M=new Lt(new Rs(b,0),m);M.position.set((Math.random()-.5)*(r-.5),h+.25+u+.02,(Math.random()-.5)*(a-1.2)),M.rotation.set(Math.random(),Math.random(),Math.random()),e.add(M)}i.anchors.push({pos:[0,h+u+.2,0],label:"\u0421\u0430\u043C\u043E\u0441\u0432\u0430\u043B\u044C\u043D\u044B\u0439 \u043A\u043E\u0432\u0448"})}function Ux(i){let{M:t,body:e,bodyMat:n,bodyMat2:s,W:r,H:o,L:a,zFront:l,zRear:c,deckY:h}=i,u=Math.max(o,2.6);for(let f of[-1,1]){for(let g=l+.8;g<c-.4;g+=1.2)q(e,.1,u,.1,t.steel,f*(r/2-.1),h+u/2,g);q(e,.1,.1,a-.5,t.steel,f*(r/2-.1),h+u-.1,0),q(e,.1,.1,a-.5,t.darkSteel,f*(r/2-.1),h+u*.5,0)}for(let f of[-1,1]){for(let g=l+.6;g<c-.4;g+=.14)q(e,.04,u-.3,.03,s,f*(r/2),h+u/2,g);for(let g of[.4,.9,1.4,1.9])q(e,.07,.05,a-.4,t.steel,f*(r/2),h+g,0)}q(e,r-.2,.06,a-.5,t.steel,0,h+u*.5,0);for(let f=l+1;f<c-.5;f+=.8)q(e,r-.25,.04,.06,t.darkSteel,0,h+u*.5+.03,f);K(e,r,.08,a-.3,n,0,h+u+.05,0,.02);for(let f=0;f<6;f++)K(e,.7,.18,.7,t.plasticGray,0,h+u+.16,l+1.4+f*2,.03);let d=K(e,r-.3,.08,2,t.steel,0,h+.05,c+.8,.02);d.rotation.x=.14;for(let f of[-1,1]){let g=K(e,.18,.18,1.4,t.steel,f*.75,h+.6,-2,.03)}i.anchors.push({pos:[0,h+u*.6,0],label:"\u0414\u0432\u0443\u0445\u044A\u044F\u0440\u0443\u0441\u043D\u044B\u0439 \u043E\u0442\u0441\u0435\u043A"})}function Fx(i){let{M:t,body:e,W:n,L:s,zFront:r,zRear:o,deckY:a,halfL:l}=i;K(e,n-.3,.16,s-.4,t.darkSteel,0,a,0,.02);let c=[r+1.4,-1,o-2];for(let g of c){for(let x of[-1,1]){let m=K(e,.12,1.5,.12,t.steel,x*(n/2-.15),a+.75,g,.02);m.rotation.z=x*.12,q(e,.5,.12,.14,t.darkSteel,x*(n/2-.3),a+.1,g)}q(e,n-.2,.1,.1,t.darkSteel,0,a+.1,g)}let h=Pe("#6b4a2e",.95,.02),u=Pe("#c9a06a",.9,.02),d=[],f=0;for(let g=0;g<4;g++){let x=4-Math.floor(g/2);for(let m=0;m<x;m++){let p=.19+Math.random()*.05,b=(m-(x-1)/2)*.47,M=a+.28+g*.4,y=.2+(Math.random()-.5)*.5,T=s-1.6,S=Yt(e,p,p,T,h,b,M,y,12);S.rotation.x=At;let R=Yt(e,p*.98,p*.98,.03,u,b,M,y-T/2,12);R.rotation.x=At;let _=Yt(e,p*.98,p*.98,.03,u,b,M,y+T/2,12);_.rotation.x=At,d.push(S)}}for(let g of[r+1.4,-1,o-2]){q(e,n-.2,.03,.03,t.rope,0,a+1.7,g);for(let x of[-1,1])q(e,.03,1.5,.03,t.rope,x*(n/2-.18),a+.95,g)}i.anchors.push({pos:[0,a+1.2,0],label:"\u0428\u0442\u0430\u0431\u0435\u043B\u044C \u0431\u0440\u0451\u0432\u0435\u043D"})}function Ox(i){let{M:t,body:e,W:n,L:s,zFront:r,zRear:o,deckY:a}=i;q(e,.16,.16,s-2.6,t.darkSteel,0,a-.1,.5);for(let l of[-1,1])q(e,.14,.14,s-2.8,t.steel,l*.5,a-.14,.6);for(let l of[-1.2,.6,2.4,o-.3]){for(let c of[-1,1]){let h=K(e,.1,1.4,.1,t.steel,c*1,a+.6,l,.02);h.rotation.z=c*.15}q(e,n-.4,.12,.12,t.darkSteel,0,a-.05,l)}for(let l=0;l<3;l++){let c=Yt(e,.24,.24,7,t.steel,-.6+l*.62,a+.4+l%2*.1,-.4,16);c.rotation.x=At}i.anchors.push({pos:[0,a+.8,1],label:"\u041A\u043E\u043D\u0438\u043A\u0438 \u0438 \u0442\u0440\u0443\u0431\u044B"})}function Bx(i,{color:t="#275b78",reefer:e=!1}={}){let{M:n,body:s,W:r,zFront:o,zRear:a,deckY:l}=i,c=Math.min(r,2.44),h=2.55,u=12.2,d=Pe(t,.7,.3),f=Pe(new $t(t).multiplyScalar(.8),.75,.3);K(s,c,h,u,d,0,l+.18+h/2,0,.04);for(let x=o+.9;x<a-.8;x+=.32)for(let m of[-1,1])q(s,.035,h-.18,.1,f,m*(c/2+.012),l+.18+h/2,x);q(s,c,.14,u,n.darkSteel,0,l+.12,0);for(let x of[-1,1]){q(s,.05,h-.2,.08,n.steel,x*.55,l+.18+h/2,a-.75);for(let m=0;m<4;m++)q(s,.06,.3,.06,n.chromeDark,x*.55,l+.4+m*.55,a-.7)}for(let x of[-1,1])for(let m of[-u/2+.4,u/2-.4])q(s,.16,.16,.16,n.steel,x*(c/2-.1),l+.1,m);let g=Di("PORTLINE",{width:512,height:128,bg:"rgba(0,0,0,0)",fg:"#f4f2e8",accent:t,font:"bold 62px Arial, sans-serif",border:!1});if(g){let x=new pe({map:g,transparent:!0,roughness:.6});for(let m of[-1,1]){let p=Ke(s,2.6,.65,x,m*(c/2+.05),l+.18+h/2+.3,.8);p.rotation.y=m>0?-At:At}}if(e){K(s,c-.3,1,.5,n.plasticLight,0,l+.18+h-.7,o+1,.05);for(let m=-3;m<=3;m++)q(s,.05,.7,.03,n.plasticGray,m*.14,l+.18+h-.7,o+.73);let x=Yt(s,.28,.28,.08,n.plastic,0,l+.18+h-1.3,o+1,18);x.rotation.x=At}return{w:c,h,l:u}}function Md(i,t){let{M:e,body:n,W:s,L:r,zFront:o,zRear:a,deckY:l,unit:c}=i;K(n,s-.1,.18,r-.6,e.darkSteel,0,l+.05,0,.02);for(let h of[-5.2,5.2])for(let u of[-1,1])q(n,.24,.14,.24,e.steel,u*(s/2-.3),l+.16,h),q(n,.1,.05,.1,e.chromeDark,u*(s/2-.3),l+.26,h);Bx(i,{color:t?"#e8ebe6":c.color,reefer:t}),i.anchors.push({pos:[s/2,l+1.6,0],label:t?"\u0420\u0435\u0444-\u043A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440":"\u041A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440 40\u2032"}),i.anchors.push({pos:[s/2-.3,l+.2,-5.2],label:"Twist-lock \u0444\u0438\u0442\u0438\u043D\u0433"})}function kx(i){let{M:t,body:e,W:n,L:s,zFront:r,zRear:o,deckY:a}=i,l=t.steel,c=t.darkSteel;for(let g of[-1,1])q(e,.12,.3,s-.6,c,g*(n/2-.2),a-.02,0);for(let g=r+.8;g<o-.3;g+=1.3)q(e,n-.3,.1,.1,c,0,a+.02,g);let h=a+3.3;for(let g of[r+1,r+6.3,o-1.2])for(let x of[-1,1])q(e,.14,3.4,.14,l,x*(n/2-.15),a+1.7,g);for(let g of[-1,1])q(e,.14,.16,s-1.2,c,g*(n/2-.15),h,0);for(let g=r+1.2;g<o-.8;g+=1.4)q(e,n-.3,.08,.1,c,0,h,g);for(let g of[-1,1]){let x=K(e,.12,1.2,.12,t.hazard,g*1.02,a+.8,r+3.5,.02);x.rotation.x=-.2}let u=["#2f5d8a","#c9402f","#e9ecec","#e0b528","#4f5844","#7a8086"],d=0;for(let g of[r+2,r+5,r+8]){for(let x=0;x<1;x++){let m=no({id:"carrier-car",name:"",brand:"",style:"sedan",paint:u[d%u.length],accent:"#d8d5c8",length:4.4,width:1.8,height:1.4,wheelbase:2.6,wheelRadius:.31,wheelWidth:.2},t,{simple:!0,wheels:!1});m.root.position.set(0,a+.08,g),m.root.rotation.y=we/2,e.add(m.root);let p=d<3?h+.08:a+.08}d++}let f=3;for(let g of[r+2.4,r+5.6,r+8.6]){let x=no({id:"carrier-car2",name:"",brand:"",style:"sedan",paint:u[f%u.length],accent:"#d8d5c8",length:4.4,width:1.8,height:1.4,wheelbase:2.6,wheelRadius:.31,wheelWidth:.2},t,{simple:!0,wheels:!1});x.root.position.set(0,h+.1,g),x.root.rotation.y=we/2,e.add(x.root),f++}for(let g of[o-.2]){let x=K(e,n-.6,.1,2.6,t.steel,0,a-.6,o+.9,.02);x.rotation.x=.2}i.anchors.push({pos:[n/2,h-.4,r+5],label:"\u0412\u0435\u0440\u0445\u043D\u044F\u044F \u043F\u0430\u043B\u0443\u0431\u0430"})}function zx(i){let{M:t,body:e,W:n,L:s,zFront:r,zRear:o,deckY:a}=i,l=s/2,c=K(e,n,2.7,7,Pe("#d5d8d3",.7,.12),0,a+1.45,r+3.8,.05),h=K(e,n,2.7,6.4,Pe("#d5d8d3",.7,.12),0,a+1.45,o-3.6,.05);q(e,.9,.3,2.2,t.darkSteel,0,a+.1,.4);for(let u of[-1,1])q(e,.12,.24,3.2,t.steel,u*.55,a+.05,.4);for(let u of[{z0:r+.6,z1:r+7.2},{z0:o-6.7,z1:o-.4}])for(let d=u.z0;d<u.z1;d+=.6)for(let f of[-1,1])q(e,.03,2.5,.05,Pe("#c2c6c2",.75,.1),f*(n/2+.006),a+1.45,d);for(let u of[1,1.8])for(let d of[-1,1])q(e,.1,.4,.1,t.steel,d*.8,a-.2,u);for(let u of[-1,1])q(e,.02,.12,6.4,t.hazard,u*(n/2+.02),a+.35,r+3.8),q(e,.02,.12,5.8,t.hazard,u*(n/2+.02),a+.35,o-3.6);i.anchors.push({pos:[0,a+.2,.4],label:"\u0421\u043E\u0435\u0434\u0438\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u0431\u0430\u043B\u043A\u0430"})}function Hx(i){let{M:t,body:e,W:n,zFront:s,zRear:r,deckY:o}=i;for(let d of[-1,1]){let f=q(e,.12,.16,7,t.darkSteel,d*.85,o-.2,.2);for(let g=s+1.4;g<r-1.2;g+=.9){let x=Yt(e,.11,.11,.4,t.rubberTrim,d*.85,o-.02,g,12);x.rotation.z=At}}Tn(e,[-.4,o-.3,s+.5],[0,o-.3,s-1.1],.06,t.steel),Tn(e,[.4,o-.3,s+.5],[0,o-.3,s-1.1],.06,t.steel),Yt(e,.09,.09,.3,t.steel,0,o-.5,s-1.25,10).rotation.x=At,K(e,.3,.3,.4,t.chromeDark,0,o+.05,s+.9,.03);let a=Pe("#f2f4f2",.25,.25),l=Pe("#1f3d5c",.4,.3),c=new Lt(new ye(1,.45,4.8,20,1,!1,0,on,0,At),a);c.rotation.x=At,c.rotation.z=At,c.scale.set(1,.72,1),c.position.set(0,o+.5,-.2),e.add(c);let h=new Lt(new qe(.9,.08,8,24,we),l);h.rotation.x=At,h.position.set(0,o+.52,-.2),h.scale.set(1,1,.72),e.add(h);let u=K(e,1.5,.5,.08,t.glassDark,0,o+1,-2,.03);u.rotation.x=-.35,K(e,1.4,.25,.5,t.plasticLight,0,o+.8,-1.5,.05),K(e,.7,.25,.6,Pe("#2d3440",.8,.05),0,o+.82,-.9,.05),K(e,.45,.7,.5,t.plastic,0,o+.9,2.3,.05),q(e,.3,.3,.1,t.plasticGray,0,o+.8,2.58),i.anchors.push({pos:[0,o+1,-.2],label:"\u041A\u0430\u0442\u0435\u0440 \u043D\u0430 \u0440\u043E\u043B\u0438\u043A\u0430\u0445"})}function Vx(i){let{M:t,body:e,W:n,L:s,zFront:r,zRear:o,deckY:a}=i;for(let c=0;c<5;c++){let h=r+1.6+c*2.3;for(let u of[-1,1])Tn(e,[u*(n/2-.2),a,h],[0,a+3,h],.06,t.darkSteel),Tn(e,[u*(n/2-.2),a,h],[u*.6,a+1.6,h],.05,t.steel);q(e,n-.3,.1,.14,t.darkSteel,0,a+1.5,h)}let l=new ri({color:10471872,metalness:.1,roughness:.05,transparent:!0,opacity:.55,side:Ce,envMapIntensity:1.4});for(let c=0;c<7;c++){let h=q(e,.04,2.3,s-4,l,-.5+c*.11,a+1.2,.2);h.rotation.z=.03}for(let c of[r+3,0,o-3.2])q(e,n-.2,.05,.08,t.rope,0,a+1,c);q(e,.9,.16,s-4.2,t.fabric,-.2,a+.12,.2),i.anchors.push({pos:[0,a+2.2,0],label:"\u041F\u0430\u043A\u0435\u0442 \u043B\u0438\u0441\u0442\u043E\u0432\u043E\u0433\u043E \u0441\u0442\u0435\u043A\u043B\u0430"})}function Gx(i){let{M:t,body:e,W:n,L:s,zFront:r,zRear:o,deckY:a,halfL:l}=i;K(e,n,.16,s-.3,t.steel,0,a+.08,0,.02);for(let m=r+.6;m<o-.3;m+=.7)q(e,n-.2,.02,.06,t.darkSteel,0,a+.17,m);for(let m of[-1,1]){q(e,.07,.4,s-.4,t.steel,m*(n/2),a+.35,0);for(let p=r+.6;p<o-.3;p+=1.1)q(e,.06,.36,.05,t.darkSteel,m*(n/2),a+.36,p)}let c=Pe("#c94a1e",.5,.3),h=r+1.7;Yt(e,.55,.6,.3,t.darkSteel,0,a+.35,h,20);let u=Yt(e,.34,.34,1.5,c,0,a+1.2,h,18),d=K(e,.28,.28,4.2,c,0,a+2.1,h+1.4,.05);d.rotation.x=.42;let f=K(e,.2,.2,2.4,c,0,a+2.55,h+3.6,.03);f.rotation.x=-.55;let g=Yt(e,.06,.06,1.5,t.chrome,0,a+1.35,h+.65,10);g.rotation.x=1,Tn(e,[0,a+2.05,h+4.5],[0,a+1.25,h+4.5],.012,t.steel);let x=new Lt(new qe(.12,.03,6,12,we*1.4),t.steel);x.position.set(0,a+1.15,h+4.5),x.rotation.x=At,e.add(x);for(let m of[-1,1]){let p=K(e,.9,.16,.22,t.darkSteel,m*(n/2+.2),a-.02,h-1.1,.02);q(e,.16,.9,.16,t.hazard,m*(n/2+.5),a-.45,h-1.1),q(e,.38,.06,.38,t.steel,m*(n/2+.5),a-.9,h-1.1)}for(let m=0;m<3;m++)K(e,1.1,1.2,1.2,t.wood,.2,a+.75,l-2.2-m*1.5,.02);i.anchors.push({pos:[0,a+2.2,h+1.4],label:"\u041A\u0440\u0430\u043D-\u043C\u0430\u043D\u0438\u043F\u0443\u043B\u044F\u0442\u043E\u0440"})}function Wx(i){var x;let{M:t,body:e,bodyMat:n,bodyMat2:s,W:r,L:o,zFront:a,zRear:l,deckY:c,unit:h}=i,u=Math.max((x=h.height)!=null?x:1.8,1.6);K(e,r,.14,o-.3,t.darkSteel,0,c+.2,0,.02);let d=Ae(e);d.position.set(-r/2+.12,c+.2,0),d.rotation.z=-.12;let f=n;K(d,r,u,o-.4,f,r/2,u/2,0,.03);for(let m of[-1,1]){q(d,.08,.1,o-.5,t.steel,r/2+m*(r/2-.02),u,0);for(let p=a+.8;p<l-.3;p+=1.1)q(d,.03,u-.15,.1,s,r/2+m*(r/2),u/2,p)}q(d,r,u,.1,n,r/2,u/2,a+.2),q(d,r,u,.1,n,r/2,u/2,l-.2);for(let m of[a+1.5,l-1.5]){let p=Yt(e,.09,.09,1.2,t.hazard,-r/2+.3,c+.7,m,12);p.rotation.z=.4}let g=Pe("#8a7f6a",.98,.02);for(let m=0;m<20;m++){let p=.1+Math.random()*.1,b=new Lt(new Rs(p,0),g);b.position.set((Math.random()-.2)*(r-.4),c+u+.1,(Math.random()-.5)*(o-1)),b.rotation.set(Math.random(),Math.random(),Math.random()),e.add(b)}i.anchors.push({pos:[0,c+u,0],label:"\u0411\u043E\u043A\u043E\u0432\u043E\u0439 \u0441\u0430\u043C\u043E\u0441\u0432\u0430\u043B"})}function nh(i,t){return i.category==="trucks"?vd(i,t):i.category==="trailers"?Ed(i,t):no(i,t)}var Td=[{id:"trucks",title:"\u0422\u042F\u0413\u0410\u0427\u0418",short:"\u0422\u044F\u0433\u0430\u0447\u0438",icon:"\u{1F69B}",count:10,hint:"10 \u043C\u043E\u0434\u0435\u043B\u0435\u0439 \xB7 \u0441\u0435\u0434\u0435\u043B\u044C\u043D\u044B\u0435 \u0442\u044F\u0433\u0430\u0447\u0438"},{id:"trailers",title:"\u041F\u0420\u0418\u0426\u0415\u041F\u042B",short:"\u041F\u0440\u0438\u0446\u0435\u043F\u044B",icon:"\u{1F4E6}",count:20,hint:"20 \u0442\u0438\u043F\u043E\u0432 \xB7 \u043E\u0442 \u0448\u0442\u043E\u0440\u043A\u0438 \u0434\u043E \u0446\u0438\u0441\u0442\u0435\u0440\u043D\u044B"},{id:"cars",title:"\u0410\u0412\u0422\u041E\u041C\u041E\u0411\u0418\u041B\u0418",short:"\u0410\u0432\u0442\u043E",icon:"\u{1F697}",count:10,hint:"10 \u043C\u043E\u0434\u0435\u043B\u0435\u0439 \xB7 \u043E\u0442 \u043C\u0438\u043A\u0440\u043E\u043A\u0430\u0440\u0430 \u0434\u043E \u0441\u043F\u043E\u0440\u0442\u043A\u0430\u0440\u0430"}],Jn={night:"#1f2933",graphite:"#2f353b",black:"#101214",white:"#e9ecec",ivory:"#ddd6c3",silver:"#b9c0c6",gray:"#6f777e",red:"#a4241d",crimson:"#7d1a2e",orange:"#cf5a13",amber:"#d99a1e",yellow:"#e0b528",olive:"#5c6b3b",green:"#1f6b45",mint:"#37a58c",teal:"#0f6b70",blue:"#1b4f8a",navy:"#16233f",sky:"#3d8fc4",violet:"#4b3c85",purple:"#6d2a6b",rose:"#b04a6a",brown:"#5a3c25",copper:"#a35a2c",sand:"#c2a878"},pl=[{id:"atlas-vision",name:"ATLAS Vision 4\xD72",brand:"ATLAS",model:"Vision",tagline:"\u041C\u0430\u0433\u0438\u0441\u0442\u0440\u0430\u043B\u044C\u043D\u044B\u0439 \u0442\u0440\u0443\u0434\u044F\u0433\u0430 \u0441 \u0432\u044B\u0441\u043E\u043A\u043E\u0439 \u043A\u0430\u0431\u0438\u043D\u043E\u0439",desc:"\u0421\u0430\u043C\u044B\u0439 \u043F\u043E\u043F\u0443\u043B\u044F\u0440\u043D\u044B\u0439 \u0442\u044F\u0433\u0430\u0447 \u0441\u0435\u0440\u0438\u0438: \u0432\u044B\u0441\u043E\u043A\u0430\u044F \u043A\u0430\u0431\u0438\u043D\u0430 \u0441 \u0434\u0432\u0443\u043C\u044F \u0441\u043F\u0430\u043B\u044C\u043D\u044B\u043C\u0438 \u043C\u0435\u0441\u0442\u0430\u043C\u0438, \u043E\u0431\u0442\u0435\u043A\u0430\u0435\u043C\u044B\u0439 \u043E\u0431\u0432\u0435\u0441 \u0438 12-\u0441\u0442\u0443\u043F\u0435\u043D\u0447\u0430\u0442\u0430\u044F \u043A\u043E\u0440\u043E\u0431\u043A\u0430. \u0421\u043E\u0437\u0434\u0430\u043D \u0434\u043B\u044F \u0434\u043B\u0438\u043D\u043D\u044B\u0445 \u0440\u0435\u0439\u0441\u043E\u0432 \u043F\u043E \u0442\u0440\u0430\u0441\u0441\u0435.",style:"euro",roof:"high",length:6.2,cabHeight:3.55,paint:Jn.blue,accent:"#e8b45a",chrome:!0,fenders:!0,deflectors:!0,sideSkirts:!0,wheel:{radius:.535,width:.42,style:"truck",rimColor:"#d9dde0"},tags:["\u043C\u0430\u0433\u0438\u0441\u0442\u0440\u0430\u043B\u044C\u043D\u044B\u0439","4\xD72","\u0432\u044B\u0441\u043E\u043A\u0430\u044F \u043A\u0430\u0431\u0438\u043D\u0430"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","460 \u043B.\u0441."],["\u041A\u0440\u0443\u0442\u044F\u0449\u0438\u0439 \u043C\u043E\u043C\u0435\u043D\u0442","2 300 \u041D\xB7\u043C"],["\u041A\u043E\u0440\u043E\u0431\u043A\u0430 \u043F\u0435\u0440\u0435\u0434\u0430\u0447","12-\u0441\u0442. \u0430\u0432\u0442\u043E\u043C\u0430\u0442"],["\u041F\u0440\u0438\u0432\u043E\u0434","4\xD72"],["\u041F\u043E\u043B\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","18 000 \u043A\u0433"],["\u0411\u0430\u043A","1 200 \u043B"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","89 \u043A\u043C/\u0447"],["\u0426\u0435\u043D\u0430","8 900 000 \u20BD"]]},{id:"nordwind-aurora",name:"NORDWIND Aurora 6\xD72",brand:"NORDWIND",model:"Aurora",tagline:"\u0424\u043B\u0430\u0433\u043C\u0430\u043D \u0441 \u043A\u0430\u0431\u0438\u043D\u043E\u0439-\u043F\u0435\u043D\u0442\u0445\u0430\u0443\u0441\u043E\u043C",desc:"\u041A\u0430\u0431\u0438\u043D\u0430-\u043C\u0435\u0433\u0430 \u0441 \u0440\u043E\u0432\u043D\u044B\u043C \u043F\u043E\u043B\u043E\u043C, \u0445\u043E\u043B\u043E\u0434\u0438\u043B\u044C\u043D\u0438\u043A\u043E\u043C \u0438 \u0440\u0430\u0431\u043E\u0447\u0438\u043C \u0441\u0442\u043E\u043B\u043E\u043C. \u0422\u0440\u0438 \u043E\u0441\u0438, \u043F\u043E\u0434\u044A\u0451\u043C\u043D\u044B\u0439 \u043C\u043E\u0441\u0442 \u0438 \u0430\u044D\u0440\u043E\u0434\u0438\u043D\u0430\u043C\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u043F\u0430\u043A\u0435\u0442 \u0434\u043B\u044F \u044D\u043A\u043E\u043D\u043E\u043C\u0438\u0438 \u0442\u043E\u043F\u043B\u0438\u0432\u0430.",style:"euro",roof:"mega",length:6.6,cabHeight:4.05,paint:Jn.white,accent:"#12908f",chrome:!0,fenders:!0,deflectors:!0,sideSkirts:!0,thirdAxle:!0,meta:"6\xD72",wheel:{radius:.535,width:.42,style:"truck",rimColor:"#c9d1d5"},tags:["\u043C\u0435\u0433\u0430-\u043A\u0430\u0431\u0438\u043D\u0430","6\xD72","\u0444\u043B\u0430\u0433\u043C\u0430\u043D"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","530 \u043B.\u0441."],["\u041A\u0440\u0443\u0442\u044F\u0449\u0438\u0439 \u043C\u043E\u043C\u0435\u043D\u0442","2 600 \u041D\xB7\u043C"],["\u041A\u043E\u0440\u043E\u0431\u043A\u0430 \u043F\u0435\u0440\u0435\u0434\u0430\u0447","12-\u0441\u0442. \u0430\u0432\u0442\u043E\u043C\u0430\u0442"],["\u041F\u0440\u0438\u0432\u043E\u0434","6\xD72 (\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u044B\u0439 \u043C\u043E\u0441\u0442)"],["\u041F\u043E\u043B\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","26 000 \u043A\u0433"],["\u0411\u0430\u043A","1 500 \u043B"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","89 \u043A\u043C/\u0447"],["\u0426\u0435\u043D\u0430","12 400 000 \u20BD"]]},{id:"vulcan-titan",name:"VULCAN Titan 6\xD74",brand:"VULCAN",model:"Titan",tagline:"\u041A\u043B\u0430\u0441\u0441\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u043A\u0430\u043F\u043E\u0442\u043D\u0438\u043A \u0434\u043B\u044F \u0442\u044F\u0436\u0451\u043B\u044B\u0445 \u0433\u0440\u0443\u0437\u043E\u0432",desc:"\u0414\u043B\u0438\u043D\u043D\u044B\u0439 \u043A\u0430\u043F\u043E\u0442, \u043E\u0433\u0440\u043E\u043C\u043D\u0430\u044F \u0445\u0440\u043E\u043C\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u0430\u044F \u0440\u0435\u0448\u0451\u0442\u043A\u0430 \u0438 \u0432\u044B\u0445\u043B\u043E\u043F\u043D\u044B\u0435 \u0442\u0440\u0443\u0431\u044B \u043F\u043E \u0431\u043E\u043A\u0430\u043C. \u0422\u044F\u0433\u0430\u0447 \u0434\u043B\u044F \u0442\u044F\u0436\u0435\u043B\u043E\u0432\u043E\u0437\u043D\u044B\u0445 \u043F\u043E\u043B\u0443\u043F\u0440\u0438\u0446\u0435\u043F\u043E\u0432 \u0438 \u0440\u0430\u0431\u043E\u0442\u044B \u0432 \u043A\u0430\u0440\u044C\u0435\u0440\u0435.",style:"bonnet",roof:"sleeper",length:7.6,cabHeight:3.5,bonnet:2.15,paint:Jn.crimson,accent:"#cfd3d5",chrome:!0,fenders:!0,stacks:!0,chromeBumper:!0,wheel:{radius:.55,width:.46,style:"truck",rimColor:"#d8d2c4"},tags:["\u043A\u0430\u043F\u043E\u0442\u043D\u0438\u043A","6\xD74","\u0442\u044F\u0436\u0435\u043B\u043E\u0432\u043E\u0437"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","620 \u043B.\u0441."],["\u041A\u0440\u0443\u0442\u044F\u0449\u0438\u0439 \u043C\u043E\u043C\u0435\u043D\u0442","3 000 \u041D\xB7\u043C"],["\u041A\u043E\u0440\u043E\u0431\u043A\u0430 \u043F\u0435\u0440\u0435\u0434\u0430\u0447","16-\u0441\u0442. \u043C\u0435\u0445\u0430\u043D\u0438\u043A\u0430"],["\u041F\u0440\u0438\u0432\u043E\u0434","6\xD74"],["\u041F\u043E\u043B\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","33 000 \u043A\u0433"],["\u0411\u0430\u043A","1 000 \u043B"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","89 \u043A\u043C/\u0447"],["\u0426\u0435\u043D\u0430","14 700 000 \u20BD"]]},{id:"helios-spark",name:"HELIOS Spark",brand:"HELIOS",model:"Spark",tagline:"\u0413\u043E\u0440\u043E\u0434\u0441\u043A\u043E\u0439 \u0440\u0430\u0437\u0432\u043E\u0437\u043D\u043E\u0439 \u0442\u044F\u0433\u0430\u0447",desc:"\u041D\u0438\u0437\u043A\u0430\u044F \u0434\u043D\u0435\u0432\u043D\u0430\u044F \u043A\u0430\u0431\u0438\u043D\u0430, \u043A\u043E\u0440\u043E\u0442\u043A\u0430\u044F \u0431\u0430\u0437\u0430 \u0438 \u043E\u0431\u0437\u043E\u0440\u043D\u0430\u044F \u043F\u043E\u0441\u0430\u0434\u043A\u0430. \u0418\u0434\u0435\u0430\u043B\u0435\u043D \u0434\u043B\u044F \u0433\u043E\u0440\u043E\u0434\u0430: \u0440\u0430\u0437\u0432\u043E\u0437\u043A\u0430 \u043F\u043E \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u0430\u043C \u0438 \u0441\u043A\u043B\u0430\u0434\u0430\u043C.",style:"euro",roof:"day",length:4.7,cabHeight:2.85,paint:Jn.orange,accent:"#f4f1e8",chrome:!1,fenders:!0,sideSkirts:!1,wheel:{radius:.505,width:.38,style:"truck",rimColor:"#cdd2d4"},tags:["\u0433\u043E\u0440\u043E\u0434\u0441\u043A\u043E\u0439","4\xD72","\u0434\u043D\u0435\u0432\u043D\u0430\u044F \u043A\u0430\u0431\u0438\u043D\u0430"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","320 \u043B.\u0441."],["\u041A\u0440\u0443\u0442\u044F\u0449\u0438\u0439 \u043C\u043E\u043C\u0435\u043D\u0442","1 600 \u041D\xB7\u043C"],["\u041A\u043E\u0440\u043E\u0431\u043A\u0430 \u043F\u0435\u0440\u0435\u0434\u0430\u0447","6-\u0441\u0442. \u0430\u0432\u0442\u043E\u043C\u0430\u0442"],["\u041F\u0440\u0438\u0432\u043E\u0434","4\xD72"],["\u041F\u043E\u043B\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","16 000 \u043A\u0433"],["\u0411\u0430\u043A","400 \u043B"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","85 \u043A\u043C/\u0447"],["\u0426\u0435\u043D\u0430","6 200 000 \u20BD"]]},{id:"orion-x",name:"ORION X",brand:"ORION",model:"X",tagline:"\u042D\u043B\u0435\u043A\u0442\u0440\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0442\u044F\u0433\u0430\u0447 \u0431\u0443\u0434\u0443\u0449\u0435\u0433\u043E",desc:"\u0413\u043B\u0430\u0434\u043A\u0438\u0439 \u043A\u0443\u0437\u043E\u0432 \u0431\u0435\u0437 \u0432\u044B\u0441\u0442\u0443\u043F\u0430\u044E\u0449\u0438\u0445 \u0437\u0435\u0440\u043A\u0430\u043B \u2014 \u0438\u0445 \u0437\u0430\u043C\u0435\u043D\u0438\u043B\u0438 \u043A\u0430\u043C\u0435\u0440\u044B. \u0411\u0430\u0442\u0430\u0440\u0435\u044F \u0432 \u0440\u0430\u043C\u0435, \u043E\u0433\u0440\u043E\u043C\u043D\u044B\u0439 \u0441\u0435\u043D\u0441\u043E\u0440\u043D\u044B\u0439 \u0434\u0438\u0441\u043F\u043B\u0435\u0439 \u0438 \u0441\u0432\u0435\u0442\u044F\u0449\u0430\u044F\u0441\u044F \u043F\u0435\u0440\u0435\u0434\u043D\u044F\u044F \u043F\u0430\u043D\u0435\u043B\u044C.",style:"futuristic",roof:"aero",length:6.4,cabHeight:3.75,paint:Jn.silver,accent:"#25d0e0",chrome:!0,fenders:!0,deflectors:!0,sideSkirts:!0,led:!0,wheel:{radius:.53,width:.42,style:"truck",rimColor:"#2c3237"},tags:["\u044D\u043B\u0435\u043A\u0442\u0440\u043E\u0432\u043E\u0437","4\xD72","\u043A\u0430\u043C\u0435\u0440\u044B \u0432\u043C\u0435\u0441\u0442\u043E \u0437\u0435\u0440\u043A\u0430\u043B"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","480 \u043A\u0412\u0442 (~650 \u043B.\u0441.)"],["\u041A\u0440\u0443\u0442\u044F\u0449\u0438\u0439 \u043C\u043E\u043C\u0435\u043D\u0442","3 400 \u041D\xB7\u043C"],["\u041A\u043E\u0440\u043E\u0431\u043A\u0430 \u043F\u0435\u0440\u0435\u0434\u0430\u0447","2-\u0441\u0442. \u0440\u0435\u0434\u0443\u043A\u0442\u043E\u0440"],["\u041F\u0440\u0438\u0432\u043E\u0434","4\xD72"],["\u0411\u0430\u0442\u0430\u0440\u0435\u044F","620 \u043A\u0412\u0442\xB7\u0447"],["\u0417\u0430\u043F\u0430\u0441 \u0445\u043E\u0434\u0430","480 \u043A\u043C"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","90 \u043A\u043C/\u0447"],["\u0426\u0435\u043D\u0430","19 800 000 \u20BD"]]},{id:"meridian-grand",name:"MERIDIAN Grand",brand:"MERIDIAN",model:"Grand",tagline:"\u041F\u0440\u0435\u0434\u0441\u0442\u0430\u0432\u0438\u0442\u0435\u043B\u044C\u0441\u043A\u0438\u0439 \u0442\u044F\u0433\u0430\u0447 \u0441 \u043A\u0430\u0431\u0438\u043D\u043E\u0439-\u043B\u044E\u043A\u0441",desc:"\u041A\u043E\u0436\u0430\u043D\u044B\u0439 \u0441\u0430\u043B\u043E\u043D, \u043F\u0430\u043D\u043E\u0440\u0430\u043C\u043D\u043E\u0435 \u043E\u0441\u0442\u0435\u043A\u043B\u0435\u043D\u0438\u0435 \u0438 \u0431\u043E\u043B\u044C\u0448\u043E\u0439 \u0431\u043E\u043A\u043E\u0432\u043E\u0439 \u0434\u0435\u0444\u043B\u0435\u043A\u0442\u043E\u0440. \u0412\u043D\u0435\u0448\u043D\u0435 \u0441\u043F\u043E\u043A\u043E\u0439\u043D\u044B\u0439, \u0432\u043D\u0443\u0442\u0440\u0438 \u2014 \u043C\u0430\u043B\u0435\u043D\u044C\u043A\u0430\u044F \u0433\u043E\u0441\u0442\u0438\u043D\u0430\u044F.",style:"euro",roof:"high",length:6.4,cabHeight:3.7,paint:Jn.ivory,accent:"#8c6d3f",chrome:!0,fenders:!0,deflectors:!0,sideSkirts:!0,luxury:!0,wheel:{radius:.535,width:.42,style:"truck",rimColor:"#e5e1d6"},tags:["\u043B\u044E\u043A\u0441","4\xD72","\u043F\u0430\u043D\u043E\u0440\u0430\u043C\u0430"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","500 \u043B.\u0441."],["\u041A\u0440\u0443\u0442\u044F\u0449\u0438\u0439 \u043C\u043E\u043C\u0435\u043D\u0442","2 450 \u041D\xB7\u043C"],["\u041A\u043E\u0440\u043E\u0431\u043A\u0430 \u043F\u0435\u0440\u0435\u0434\u0430\u0447","12-\u0441\u0442. \u0430\u0432\u0442\u043E\u043C\u0430\u0442"],["\u041F\u0440\u0438\u0432\u043E\u0434","4\xD72"],["\u041F\u043E\u043B\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","18 000 \u043A\u0433"],["\u0411\u0430\u043A","1 300 \u043B"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","89 \u043A\u043C/\u0447"],["\u0426\u0435\u043D\u0430","11 300 000 \u20BD"]]},{id:"kargo-standard",name:"KARGO Standard",brand:"KARGO",model:"Standard",tagline:"\u0420\u0430\u0431\u043E\u0447\u0430\u044F \u043B\u043E\u0448\u0430\u0434\u043A\u0430 \u0431\u0435\u0437 \u0438\u0437\u043B\u0438\u0448\u0435\u0441\u0442\u0432",desc:"\u041F\u0440\u043E\u0441\u0442\u0430\u044F \u043F\u043B\u043E\u0441\u043A\u0430\u044F \u043A\u0440\u044B\u0448\u0430, \u043C\u0438\u043D\u0438\u043C\u0443\u043C \u0445\u0440\u043E\u043C\u0430, \u0440\u0435\u043C\u043E\u043D\u0442\u043E\u043F\u0440\u0438\u0433\u043E\u0434\u043D\u043E\u0441\u0442\u044C \u0438 \u043D\u0430\u0434\u0451\u0436\u043D\u043E\u0441\u0442\u044C. \u0421\u0430\u043C\u044B\u0439 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B\u0439 \u0442\u044F\u0433\u0430\u0447 \u043A\u0430\u0442\u0430\u043B\u043E\u0433\u0430.",style:"euro",roof:"flat",length:5.9,cabHeight:3.05,paint:Jn.green,accent:"#d8d5c8",chrome:!1,fenders:!0,deflectors:!1,sideSkirts:!1,wheel:{radius:.52,width:.4,style:"truck",rimColor:"#cfd2d3"},tags:["\u0431\u044E\u0434\u0436\u0435\u0442\u043D\u044B\u0439","4\xD72","\u043F\u043B\u043E\u0441\u043A\u0430\u044F \u043A\u0440\u044B\u0448\u0430"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","400 \u043B.\u0441."],["\u041A\u0440\u0443\u0442\u044F\u0449\u0438\u0439 \u043C\u043E\u043C\u0435\u043D\u0442","1 950 \u041D\xB7\u043C"],["\u041A\u043E\u0440\u043E\u0431\u043A\u0430 \u043F\u0435\u0440\u0435\u0434\u0430\u0447","12-\u0441\u0442. \u043C\u0435\u0445\u0430\u043D\u0438\u043A\u0430"],["\u041F\u0440\u0438\u0432\u043E\u0434","4\xD72"],["\u041F\u043E\u043B\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","18 000 \u043A\u0433"],["\u0411\u0430\u043A","900 \u043B"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","89 \u043A\u043C/\u0447"],["\u0426\u0435\u043D\u0430","5 400 000 \u20BD"]]},{id:"stellar-wave",name:"STELLAR Wave",brand:"STELLAR",model:"Wave",tagline:"\u041D\u0438\u0437\u043A\u043E\u043F\u043E\u043B\u044C\u043D\u044B\u0439 \u0442\u044F\u0433\u0430\u0447 \u0434\u043B\u044F \u0442\u044F\u0436\u0451\u043B\u043E\u0439 \u0441\u0446\u0435\u043F\u043A\u0438",desc:"\u041A\u0430\u0431\u0438\u043D\u0430 \u0441 \u043D\u0438\u0437\u043A\u0438\u043C \u0432\u0445\u043E\u0434\u043E\u043C \u0438 \u0440\u043E\u0432\u043D\u044B\u043C \u043F\u043E\u043B\u043E\u043C, \u043E\u0433\u0440\u043E\u043C\u043D\u043E\u0435 \u043B\u043E\u0431\u043E\u0432\u043E\u0435 \u0441\u0442\u0435\u043A\u043B\u043E \u0438 \u043E\u0431\u0437\u043E\u0440 \u043A\u0430\u043A \u0443 \u0430\u0432\u0442\u043E\u0431\u0443\u0441\u0430. \u0414\u043B\u044F \u0440\u0430\u0431\u043E\u0442\u044B \u0432 \u043F\u043E\u0440\u0442\u0443 \u0438 \u043D\u0430 \u043A\u043E\u043C\u0431\u0438\u043D\u0430\u0442\u0430\u0445.",style:"lowentry",roof:"bus",length:5.4,cabHeight:3,paint:Jn.violet,accent:"#37a58c",chrome:!0,fenders:!0,deflectors:!1,sideSkirts:!0,wheel:{radius:.5,width:.4,style:"truck",rimColor:"#d2d6d8"},tags:["\u043D\u0438\u0437\u043A\u043E\u043F\u043E\u043B\u044C\u043D\u044B\u0439","\u043F\u043E\u0440\u0442","\u043F\u0430\u043D\u043E\u0440\u0430\u043C\u043D\u044B\u0439 \u043E\u0431\u0437\u043E\u0440"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","360 \u043B.\u0441."],["\u041A\u0440\u0443\u0442\u044F\u0449\u0438\u0439 \u043C\u043E\u043C\u0435\u043D\u0442","1 800 \u041D\xB7\u043C"],["\u041A\u043E\u0440\u043E\u0431\u043A\u0430 \u043F\u0435\u0440\u0435\u0434\u0430\u0447","6-\u0441\u0442. \u0430\u0432\u0442\u043E\u043C\u0430\u0442"],["\u041F\u0440\u0438\u0432\u043E\u0434","4\xD72"],["\u041F\u043E\u043B\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","19 000 \u043A\u0433"],["\u0411\u0430\u043A","600 \u043B"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","80 \u043A\u043C/\u0447"],["\u0426\u0435\u043D\u0430","7 100 000 \u20BD"]]},{id:"terra-worker",name:"TERRA Worker 8\xD74",brand:"TERRA",model:"Worker",tagline:"\u0422\u044F\u0436\u0451\u043B\u044B\u0439 \u043A\u0430\u0440\u044C\u0435\u0440\u043D\u044B\u0439 \u0442\u044F\u0433\u0430\u0447",desc:"\u0427\u0435\u0442\u044B\u0440\u0435 \u043E\u0441\u0438, \u0443\u0441\u0438\u043B\u0435\u043D\u043D\u0430\u044F \u0440\u0430\u043C\u0430, \u0441\u0442\u0430\u043B\u044C\u043D\u044B\u0435 \u0431\u0430\u043C\u043F\u0435\u0440\u044B \u0438 \u0437\u0430\u0449\u0438\u0442\u0430 \u0444\u0430\u0440. \u0421\u0435\u0440\u044C\u0451\u0437\u043D\u0430\u044F \u043C\u0430\u0448\u0438\u043D\u0430 \u0434\u043B\u044F \u0442\u044F\u0433\u0430\u0447\u0435\u0439-\u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C \u0438 \u043D\u0435\u0433\u0430\u0431\u0430\u0440\u0438\u0442\u0430.",style:"euro",roof:"high",length:8.4,cabHeight:3.6,paint:Jn.black,accent:"#e07a1c",chrome:!1,fenders:!0,deflectors:!1,sideSkirts:!1,thirdAxle:!0,heavy:!0,wheel:{radius:.58,width:.5,style:"truck",rimColor:"#b9b4a6"},tags:["8\xD74","\u043A\u0430\u0440\u044C\u0435\u0440\u0430","\u0443\u0441\u0438\u043B\u0435\u043D\u043D\u0430\u044F \u0440\u0430\u043C\u0430"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","700 \u043B.\u0441."],["\u041A\u0440\u0443\u0442\u044F\u0449\u0438\u0439 \u043C\u043E\u043C\u0435\u043D\u0442","3 550 \u041D\xB7\u043C"],["\u041A\u043E\u0440\u043E\u0431\u043A\u0430 \u043F\u0435\u0440\u0435\u0434\u0430\u0447","16-\u0441\u0442. \u0430\u0432\u0442\u043E\u043C\u0430\u0442"],["\u041F\u0440\u0438\u0432\u043E\u0434","8\xD74"],["\u041F\u043E\u043B\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","41 000 \u043A\u0433"],["\u0411\u0430\u043A","1 100 \u043B"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","75 \u043A\u043C/\u0447"],["\u0426\u0435\u043D\u0430","17 900 000 \u20BD"]]},{id:"polaris-lite",name:"POLARIS Lite",brand:"POLARIS",model:"Lite",tagline:"\u041A\u043E\u043C\u043F\u0430\u043A\u0442\u043D\u044B\u0439 \u0442\u044F\u0433\u0430\u0447 \u0434\u043B\u044F \u0440\u0435\u0433\u0438\u043E\u043D\u0430\u043B\u043A\u0438",desc:"\u041A\u043E\u0440\u043E\u0442\u043A\u0430\u044F \u043A\u0430\u0431\u0438\u043D\u0430 \u0441 \u043E\u0434\u043D\u0438\u043C \u0441\u043F\u0430\u043B\u044C\u043D\u044B\u043C \u043C\u0435\u0441\u0442\u043E\u043C, \u043B\u0451\u0433\u043A\u0438\u0439 \u043A\u0443\u0437\u043E\u0432 \u0438 \u043C\u0430\u043B\u044B\u0439 \u0440\u0430\u0434\u0438\u0443\u0441 \u0440\u0430\u0437\u0432\u043E\u0440\u043E\u0442\u0430. \u0414\u043B\u044F \u0440\u0435\u0433\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0445 \u0440\u0435\u0439\u0441\u043E\u0432 \u043D\u0430 300\u2013500 \u043A\u043C.",style:"euro",roof:"low",length:5.2,cabHeight:3.2,paint:Jn.red,accent:"#1f2933",chrome:!0,fenders:!0,deflectors:!0,sideSkirts:!0,wheel:{radius:.52,width:.4,style:"truck",rimColor:"#d5d8da"},tags:["\u0440\u0435\u0433\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0439","4\xD72","\u043A\u043E\u043C\u043F\u0430\u043A\u0442\u043D\u044B\u0439"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","380 \u043B.\u0441."],["\u041A\u0440\u0443\u0442\u044F\u0449\u0438\u0439 \u043C\u043E\u043C\u0435\u043D\u0442","1 750 \u041D\xB7\u043C"],["\u041A\u043E\u0440\u043E\u0431\u043A\u0430 \u043F\u0435\u0440\u0435\u0434\u0430\u0447","9-\u0441\u0442. \u0430\u0432\u0442\u043E\u043C\u0430\u0442"],["\u041F\u0440\u0438\u0432\u043E\u0434","4\xD72"],["\u041F\u043E\u043B\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","18 000 \u043A\u0433"],["\u0411\u0430\u043A","700 \u043B"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","89 \u043A\u043C/\u0447"],["\u0426\u0435\u043D\u0430","4 950 000 \u20BD"]]}],ml=[{id:"curtain",name:"\u0428\u0442\u043E\u0440\u043D\u044B\u0439 \u043F\u043E\u043B\u0443\u043F\u0440\u0438\u0446\u0435\u043F",brand:"TRAILGO",type:"curtain",length:13.6,width:2.55,height:2.75,color:"#cfd3d0",tagline:"\u0423\u043D\u0438\u0432\u0435\u0440\u0441\u0430\u043B \u0434\u043B\u044F \u043F\u0430\u043B\u043B\u0435\u0442 \u0438 \u043A\u043E\u0440\u043E\u0431\u043E\u043A",desc:"\u0411\u043E\u043A\u043E\u0432\u044B\u0435 \u0448\u0442\u043E\u0440\u044B \u043D\u0430 \u0440\u043E\u043B\u0438\u043A\u0430\u0445, \u0440\u0430\u0437\u0434\u0432\u0438\u0436\u043D\u0430\u044F \u043A\u0440\u044B\u0448\u0430 \u0438 33 \u0435\u0432\u0440\u043E\u043F\u0430\u043B\u043B\u0435\u0442\u044B \u0432\u043D\u0443\u0442\u0440\u0438. \u0421\u0430\u043C\u044B\u0439 \u0440\u0430\u0441\u043F\u0440\u043E\u0441\u0442\u0440\u0430\u043D\u0451\u043D\u043D\u044B\u0439 \u0442\u0438\u043F \u0432 \u0415\u0432\u0440\u043E\u043F\u0435.",tags:["\u0443\u043D\u0438\u0432\u0435\u0440\u0441\u0430\u043B\u044C\u043D\u044B\u0439","3 \u043E\u0441\u0438","33 \u043F\u0430\u043B\u043B\u0435\u0442\u044B"],specs:[["\u0414\u043B\u0438\u043D\u0430","13,6 \u043C"],["\u0412\u043D\u0443\u0442\u0440\u0435\u043D\u043D\u0438\u0439 \u043E\u0431\u044A\u0451\u043C","92 \u043C\xB3"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","24 000 \u043A\u0433"],["\u041E\u0441\u0438","3"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","6 800 \u043A\u0433"],["\u0426\u0435\u043D\u0430","2 150 000 \u20BD"]]},{id:"van",name:"\u0418\u0437\u043E\u0442\u0435\u0440\u043C\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0444\u0443\u0440\u0433\u043E\u043D",brand:"TRAILGO",type:"van",length:13.6,width:2.55,height:2.8,color:"#e7e9e6",tagline:"\u0413\u0435\u0440\u043C\u0435\u0442\u0438\u0447\u043D\u044B\u0439 \u043A\u0443\u0437\u043E\u0432 \u0441 \u0436\u0451\u0441\u0442\u043A\u0438\u043C\u0438 \u0441\u0442\u0435\u043D\u043A\u0430\u043C\u0438",desc:"\u0426\u0435\u043B\u044C\u043D\u043E\u043C\u0435\u0442\u0430\u043B\u043B\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0444\u0443\u0440\u0433\u043E\u043D \u0441 \u0441\u044D\u043D\u0434\u0432\u0438\u0447-\u043F\u0430\u043D\u0435\u043B\u044F\u043C\u0438. \u0414\u0435\u0440\u0436\u0438\u0442 \u0442\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u0443 \u0438 \u0437\u0430\u0449\u0438\u0449\u0430\u0435\u0442 \u0433\u0440\u0443\u0437 \u043E\u0442 \u0432\u043B\u0430\u0433\u0438.",tags:["\u0438\u0437\u043E\u0442\u0435\u0440\u043C\u0430","3 \u043E\u0441\u0438","\u0436\u0451\u0441\u0442\u043A\u0438\u0435 \u0441\u0442\u0435\u043D\u043A\u0438"],specs:[["\u0414\u043B\u0438\u043D\u0430","13,6 \u043C"],["\u0412\u043D\u0443\u0442\u0440\u0435\u043D\u043D\u0438\u0439 \u043E\u0431\u044A\u0451\u043C","96 \u043C\xB3"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","26 000 \u043A\u0433"],["\u041E\u0441\u0438","3"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","7 200 \u043A\u0433"],["\u0426\u0435\u043D\u0430","2 400 000 \u20BD"]]},{id:"reefer",name:"\u0420\u0435\u0444-\u043F\u043E\u043B\u0443\u043F\u0440\u0438\u0446\u0435\u043F",brand:"COLDFLOW",type:"reefer",length:13.4,width:2.55,height:2.7,color:"#eef0ec",tagline:"\u0425\u043E\u043B\u043E\u0434\u0438\u043B\u044C\u043D\u0438\u043A \u043D\u0430 \u043A\u043E\u043B\u0451\u0441\u0430\u0445",desc:"\u0420\u0435\u0444\u0440\u0438\u0436\u0435\u0440\u0430\u0442\u043E\u0440 \u0441 \u0434\u0438\u0437\u0435\u043B\u044C-\u0433\u0435\u043D\u0435\u0440\u0430\u0442\u043E\u0440\u043E\u043C \u043D\u0430 \u043F\u0435\u0440\u0435\u0434\u043D\u0435\u0439 \u0441\u0442\u0435\u043D\u043A\u0435: \u043E\u0442 \u221225 \xB0C \u0434\u043E +25 \xB0C. \u0414\u043B\u044F \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u043E\u0432, \u043C\u0435\u0434\u0438\u043A\u0430\u043C\u0435\u043D\u0442\u043E\u0432 \u0438 \u0446\u0432\u0435\u0442\u043E\u0432.",tags:["\u0440\u0435\u0444","\u221225 \xB0C","3 \u043E\u0441\u0438"],specs:[["\u0414\u043B\u0438\u043D\u0430","13,4 \u043C"],["\u0412\u043D\u0443\u0442\u0440\u0435\u043D\u043D\u0438\u0439 \u043E\u0431\u044A\u0451\u043C","88 \u043C\xB3"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","22 000 \u043A\u0433"],["\u0422\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u0430","\u221225\u2026+25 \xB0C"],["\u041E\u0441\u0438","3"],["\u0426\u0435\u043D\u0430","3 800 000 \u20BD"]]},{id:"flatbed",name:"\u0411\u043E\u0440\u0442\u043E\u0432\u0430\u044F \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430",brand:"STEELRIDE",type:"flatbed",length:13.6,width:2.48,height:0,color:"#9aa0a4",tagline:"\u041E\u0442\u043A\u0440\u044B\u0442\u0430\u044F \u043F\u043B\u043E\u0449\u0430\u0434\u043A\u0430 \u0441\u043E \u0441\u0442\u043E\u0439\u043A\u0430\u043C\u0438",desc:"\u0420\u043E\u0432\u043D\u044B\u0439 \u0441\u0442\u0430\u043B\u044C\u043D\u043E\u0439 \u043F\u043E\u043B, \u043E\u0442\u043A\u0438\u0434\u043D\u044B\u0435 \u0431\u043E\u0440\u0442\u0430 \u0438 \u043A\u043E\u043D\u0438\u043A\u0438 \u043F\u043E\u0434 \u0433\u0440\u0443\u0437. \u0414\u043B\u044F \u0441\u0442\u0440\u043E\u0439\u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B\u043E\u0432 \u0438 \u0442\u0435\u0445\u043D\u0438\u043A\u0438.",tags:["\u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430","3 \u043E\u0441\u0438","\u043E\u0442\u043A\u0440\u044B\u0442\u0430\u044F"],specs:[["\u0414\u043B\u0438\u043D\u0430","13,6 \u043C"],["\u041F\u043B\u043E\u0449\u0430\u0434\u044C \u043F\u043E\u043B\u0430","33,7 \u043C\xB2"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","30 000 \u043A\u0433"],["\u041E\u0441\u0438","3"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","6 200 \u043A\u0433"],["\u0426\u0435\u043D\u0430","1 650 000 \u20BD"]]},{id:"lowboy",name:"\u041D\u0438\u0437\u043A\u043E\u0440\u0430\u043C\u043D\u044B\u0439 \u0442\u0440\u0430\u043B",brand:"STEELRIDE",type:"lowboy",length:15.2,width:3,height:.9,color:"#2f363c",tagline:"\u0414\u043B\u044F \u0442\u0435\u0445\u043D\u0438\u043A\u0438, \u043A\u0440\u0430\u043D\u043E\u0432 \u0438 \u043D\u0435\u0433\u0430\u0431\u0430\u0440\u0438\u0442\u0430",desc:"\u0417\u0430\u043D\u0438\u0436\u0435\u043D\u043D\u0430\u044F \u043F\u043E\u0433\u0440\u0443\u0437\u043E\u0447\u043D\u0430\u044F \u043F\u043B\u043E\u0449\u0430\u0434\u043A\u0430, \u0432\u044B\u0434\u0432\u0438\u0436\u043D\u043E\u0439 \u0442\u0440\u0430\u043F \u0438 4 \u043E\u0441\u0438. \u041F\u0435\u0440\u0435\u0432\u043E\u0437\u0438\u0442 \u044D\u043A\u0441\u043A\u0430\u0432\u0430\u0442\u043E\u0440\u044B \u0438 \u0431\u0443\u0440\u043E\u0432\u044B\u0435 \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0438.",tags:["\u0442\u0440\u0430\u043B","\u043D\u0435\u0433\u0430\u0431\u0430\u0440\u0438\u0442","4 \u043E\u0441\u0438"],specs:[["\u0414\u043B\u0438\u043D\u0430","15,2 \u043C"],["\u0412\u044B\u0441\u043E\u0442\u0430 \u043F\u043E\u043B\u0430","0,9 \u043C"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","48 000 \u043A\u0433"],["\u041E\u0441\u0438","4"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","14 500 \u043A\u0433"],["\u0426\u0435\u043D\u0430","5 100 000 \u20BD"]]},{id:"tanker",name:"\u0426\u0438\u0441\u0442\u0435\u0440\u043D\u0430 \u0434\u043B\u044F \u0436\u0438\u0434\u043A\u043E\u0441\u0442\u0435\u0439",brand:"AQUATEC",type:"tanker",length:13.2,width:2.5,height:3.1,color:"#dfe4e7",tagline:"\u0410\u043B\u044E\u043C\u0438\u043D\u0438\u0435\u0432\u0430\u044F \u0431\u043E\u0447\u043A\u0430 \u043D\u0430 33 000 \u043B",desc:"\u0422\u0440\u0438 \u0438\u0437\u043E\u043B\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0435 \u0441\u0435\u043A\u0446\u0438\u0438, \u043D\u0438\u0436\u043D\u0438\u0439 \u043D\u0430\u043B\u0438\u0432 \u0438 \u043F\u0430\u0440\u043E\u0432\u043E\u0439 \u043E\u0431\u043E\u0433\u0440\u0435\u0432. \u041F\u0438\u0449\u0435\u0432\u044B\u0435 \u0436\u0438\u0434\u043A\u043E\u0441\u0442\u0438, \u0442\u043E\u043F\u043B\u0438\u0432\u043E \u0438 \u0445\u0438\u043C\u0438\u044F.",tags:["\u0446\u0438\u0441\u0442\u0435\u0440\u043D\u0430","3 \u0441\u0435\u043A\u0446\u0438\u0438","\u043F\u0438\u0449\u0435\u0432\u0430\u044F"],specs:[["\u0414\u043B\u0438\u043D\u0430","13,2 \u043C"],["\u041E\u0431\u044A\u0451\u043C","33 000 \u043B"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","27 000 \u043A\u0433"],["\u041E\u0441\u0438","3"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","8 300 \u043A\u0433"],["\u0426\u0435\u043D\u0430","6 700 000 \u20BD"]]},{id:"silo",name:"\u0426\u0435\u043C\u0435\u043D\u0442\u043E\u0432\u043E\u0437-\u0441\u0438\u043B\u043E\u0441",brand:"BULKLINE",type:"silo",length:13,width:2.5,height:3.2,color:"#c9cdd0",tagline:"\u0421\u044B\u043F\u0443\u0447\u0438\u0435 \u0433\u0440\u0443\u0437\u044B \u043F\u043E\u0434 \u0434\u0430\u0432\u043B\u0435\u043D\u0438\u0435\u043C",desc:"\u0414\u0432\u0430 \u043A\u043E\u043D\u0438\u0447\u0435\u0441\u043A\u0438\u0445 \u0431\u0443\u043D\u043A\u0435\u0440\u0430, \u043A\u043E\u043C\u043F\u0440\u0435\u0441\u0441\u043E\u0440 \u0438 \u0430\u044D\u0440\u0430\u0446\u0438\u044F. \u0426\u0435\u043C\u0435\u043D\u0442, \u043C\u0443\u043A\u0430 \u0438 \u043C\u0438\u043D\u0435\u0440\u0430\u043B\u044C\u043D\u044B\u0439 \u043F\u043E\u0440\u043E\u0448\u043E\u043A \u0432\u044B\u0433\u0440\u0443\u0436\u0430\u044E\u0442\u0441\u044F \u0432\u043E\u0437\u0434\u0443\u0445\u043E\u043C.",tags:["\u0441\u044B\u043F\u0443\u0447\u0438\u0435","\u0430\u044D\u0440\u0430\u0446\u0438\u044F","\u043A\u043E\u043C\u043F\u0440\u0435\u0441\u0441\u043E\u0440"],specs:[["\u0414\u043B\u0438\u043D\u0430","13,0 \u043C"],["\u041E\u0431\u044A\u0451\u043C","38 \u043C\xB3"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","30 000 \u043A\u0433"],["\u041E\u0441\u0438","3"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","9 100 \u043A\u0433"],["\u0426\u0435\u043D\u0430","7 300 000 \u20BD"]]},{id:"tipper",name:"\u0421\u0430\u043C\u043E\u0441\u0432\u0430\u043B\u044C\u043D\u044B\u0439 \u043F\u043E\u043B\u0443\u043F\u0440\u0438\u0446\u0435\u043F",brand:"BULKLINE",type:"tipper",length:13.4,width:2.5,height:1.9,color:"#8f9498",tagline:"\u0420\u0430\u0437\u0433\u0440\u0443\u0437\u043A\u0430 \u043E\u043F\u0440\u043E\u043A\u0438\u0434\u044B\u0432\u0430\u043D\u0438\u0435\u043C",desc:"\u0421\u0442\u0430\u043B\u044C\u043D\u043E\u0439 \u043A\u043E\u0432\u0448 \u0441 \u0433\u0438\u0434\u0440\u043E\u0446\u0438\u043B\u0438\u043D\u0434\u0440\u043E\u043C, \u0437\u0430\u0434\u043D\u0438\u0439 \u0431\u043E\u0440\u0442 \u043D\u0430 \u043F\u0435\u0442\u043B\u044F\u0445. \u0429\u0435\u0431\u0435\u043D\u044C, \u043F\u0435\u0441\u043E\u043A, \u0433\u0440\u0443\u043D\u0442 \u0438 \u0437\u0435\u0440\u043D\u043E.",tags:["\u0441\u0430\u043C\u043E\u0441\u0432\u0430\u043B","\u0433\u0438\u0434\u0440\u0430\u0432\u043B\u0438\u043A\u0430","\u0449\u0435\u0431\u0435\u043D\u044C"],specs:[["\u0414\u043B\u0438\u043D\u0430","13,4 \u043C"],["\u041E\u0431\u044A\u0451\u043C","34 \u043C\xB3"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","32 000 \u043A\u0433"],["\u041E\u0441\u0438","3"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","11 200 \u043A\u0433"],["\u0426\u0435\u043D\u0430","4 400 000 \u20BD"]]},{id:"livestock",name:"\u0421\u043A\u043E\u0442\u043E\u0432\u043E\u0437",brand:"FARMHAUL",type:"livestock",length:13.2,width:2.55,height:2.9,color:"#e4e6df",tagline:"\u0414\u0432\u0443\u0445\u044A\u044F\u0440\u0443\u0441\u043D\u044B\u0439, \u0441 \u0432\u0435\u043D\u0442\u0438\u043B\u044F\u0446\u0438\u0435\u0439",desc:"\u0412\u0435\u043D\u0442\u0438\u043B\u0438\u0440\u0443\u0435\u043C\u044B\u0435 \u0431\u043E\u0440\u0442\u0430, \u043F\u043E\u0438\u043B\u043A\u0438 \u0438 \u043F\u043E\u0434\u044A\u0451\u043C\u043D\u044B\u0439 \u043F\u043E\u043B. \u041F\u0435\u0440\u0435\u0432\u043E\u0437\u043A\u0430 \u0441\u043A\u043E\u0442\u0430 \u0441 \u0441\u043E\u0431\u043B\u044E\u0434\u0435\u043D\u0438\u0435\u043C \u043D\u043E\u0440\u043C \u043F\u043B\u043E\u0442\u043D\u043E\u0441\u0442\u0438.",tags:["\u0441\u043A\u043E\u0442","2 \u044F\u0440\u0443\u0441\u0430","\u0432\u0435\u043D\u0442\u0438\u043B\u044F\u0446\u0438\u044F"],specs:[["\u0414\u043B\u0438\u043D\u0430","13,2 \u043C"],["\u041F\u043B\u043E\u0449\u0430\u0434\u044C","33 \u043C\xB2"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","20 000 \u043A\u0433"],["\u041E\u0441\u0438","3"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","8 900 \u043A\u0433"],["\u0426\u0435\u043D\u0430","3 300 000 \u20BD"]]},{id:"logging",name:"\u041B\u0435\u0441\u043E\u0432\u043E\u0437",brand:"TIMBERLINE",type:"logging",length:14,width:2.5,height:0,color:"#586066",tagline:"\u041A\u043E\u043D\u0438\u043A\u0438 \u0438 \u0441\u0442\u043E\u0439\u043A\u0438 \u043F\u043E\u0434 \u0431\u0440\u0451\u0432\u043D\u0430",desc:"\u041A\u043E\u043C\u043F\u043B\u0435\u043A\u0442 \u043A\u043E\u043D\u0438\u043A\u043E\u0432 \u0441 \u0432\u0435\u0440\u0442\u0438\u043A\u0430\u043B\u044C\u043D\u044B\u043C\u0438 \u0441\u0442\u043E\u0439\u043A\u0430\u043C\u0438 \u0438 \u0446\u0435\u043F\u044F\u043C\u0438. \u0411\u0440\u0451\u0432\u043D\u0430 \u0443\u043A\u043B\u0430\u0434\u044B\u0432\u0430\u044E\u0442\u0441\u044F \u0448\u0442\u0430\u0431\u0435\u043B\u0435\u043C \u0438 \u043A\u0440\u0435\u043F\u044F\u0442\u0441\u044F \u0441\u0432\u0435\u0440\u0445\u0443.",tags:["\u043B\u0435\u0441","\u043A\u043E\u043D\u0438\u043A\u0438","\u0431\u0440\u0451\u0432\u043D\u0430"],specs:[["\u0414\u043B\u0438\u043D\u0430","14,0 \u043C"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","29 000 \u043A\u0433"],["\u041E\u0441\u0438","3"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","7 800 \u043A\u0433"],["\u0426\u0435\u043D\u0430","2 900 000 \u20BD"]]},{id:"container",name:"\u041A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440\u043D\u0430\u044F \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430",brand:"PORTLINE",type:"container",length:13.6,width:2.45,height:2.6,color:"#275b78",tagline:"\u041F\u043E\u0434 40-\u0444\u0443\u0442\u043E\u0432\u044B\u0439 \u043A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440",desc:"\u0424\u0438\u0442\u0438\u043D\u0433\u0438 \u0438 twist-lock \u0437\u0430\u043C\u043A\u0438, \u0443\u0441\u0438\u043B\u0435\u043D\u043D\u0430\u044F \u0440\u0430\u043C\u0430. \u0412\u043E\u0437\u0438\u0442 \u043E\u0434\u0438\u043D 40\u2032 \u0438\u043B\u0438 \u0434\u0432\u0430 20\u2032 \u043A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440\u0430.",tags:["\u043A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440","40 \u0444\u0443\u0442\u043E\u0432","\u043F\u043E\u0440\u0442"],specs:[["\u0414\u043B\u0438\u043D\u0430","13,6 \u043C"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","32 000 \u043A\u0433"],["\u041E\u0441\u0438","3"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","8 100 \u043A\u0433"],["\u0426\u0435\u043D\u0430","2 700 000 \u20BD"]]},{id:"carrier",name:"\u0410\u0432\u0442\u043E\u0432\u043E\u0437-\u043F\u043E\u043B\u0443\u043F\u0440\u0438\u0446\u0435\u043F",brand:"AUTOLINE",type:"carrier",length:13.8,width:2.55,height:4,color:"#3d4449",tagline:"\u0414\u0432\u0430 \u044F\u0440\u0443\u0441\u0430, \u0434\u043E 8 \u043C\u0430\u0448\u0438\u043D",desc:"\u0412\u0435\u0440\u0445\u043D\u044F\u044F \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430 \u043D\u0430 \u043F\u043E\u0434\u044A\u0451\u043C\u043D\u0438\u043A\u0430\u0445, \u0441\u0442\u044F\u0436\u043D\u044B\u0435 \u0440\u0435\u043C\u043D\u0438 \u043D\u0430 \u043A\u043E\u043B\u0451\u0441\u0430. \u041F\u0435\u0440\u0435\u0432\u043E\u0437\u0438\u0442 \u043B\u0435\u0433\u043A\u043E\u0432\u044B\u0435 \u0430\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u0438 \u0441 \u0437\u0430\u0432\u043E\u0434\u0430.",tags:["\u0430\u0432\u0442\u043E\u0432\u043E\u0437","2 \u044F\u0440\u0443\u0441\u0430","8 \u043C\u0430\u0448\u0438\u043D"],specs:[["\u0414\u043B\u0438\u043D\u0430","13,8 \u043C"],["\u041C\u0430\u0448\u0438\u043D","\u0434\u043E 8"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","21 000 \u043A\u0433"],["\u041E\u0441\u0438","3"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","10 500 \u043A\u0433"],["\u0426\u0435\u043D\u0430","4 900 000 \u20BD"]]},{id:"dolly",name:"\u041F\u0440\u0438\u0446\u0435\u043F-\u0440\u043E\u0441\u043F\u0443\u0441\u043A",brand:"TIMBERLINE",type:"dolly",length:9.5,width:2.45,height:0,color:"#6d7160",tagline:"\u0414\u043B\u0438\u043D\u043D\u043E\u043C\u0435\u0440 \u0434\u043B\u044F \u043B\u0435\u0441\u0430 \u0438 \u0442\u0440\u0443\u0431",desc:"\u0414\u044B\u0448\u043B\u043E \u0441 \u0448\u0430\u0440\u043D\u0438\u0440\u043E\u043C, \u043A\u043E\u043D\u0438\u043A\u0438 \u0438 \u0442\u0435\u043B\u0435\u0441\u043A\u043E\u043F\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u0440\u0430\u043C\u0430. \u0421\u043E\u0431\u0438\u0440\u0430\u0435\u0442 \u0441\u0446\u0435\u043F\u043A\u0443 \u0438\u0437 \u0434\u0432\u0443\u0445 \u0437\u0432\u0435\u043D\u044C\u0435\u0432.",tags:["\u0440\u043E\u0441\u043F\u0443\u0441\u043A","\u0434\u043B\u0438\u043D\u043D\u043E\u043C\u0435\u0440","\u0442\u0440\u0443\u0431\u044B"],specs:[["\u0414\u043B\u0438\u043D\u0430","9,5 \u043C"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","22 000 \u043A\u0433"],["\u041E\u0441\u0438","2"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","4 200 \u043A\u0433"],["\u0426\u0435\u043D\u0430","1 250 000 \u20BD"]]},{id:"bdouble",name:"B-\u0434\u0432\u043E\u0439\u043D\u043E\u0439 \u043A\u043E\u043C\u043F\u043B\u0435\u043A\u0442",brand:"TRAILGO",type:"bdouble",length:15.5,width:2.5,height:2.7,color:"#d5d8d3",tagline:"\u0414\u0432\u0435 \u0441\u0435\u043A\u0446\u0438\u0438 \u043D\u0430 \u043E\u0434\u043D\u043E\u0439 \u0441\u0446\u0435\u043F\u043A\u0435",desc:"\u041F\u0435\u0440\u0435\u0434\u043D\u044F\u044F \u0438 \u0437\u0430\u0434\u043D\u044F\u044F \u0441\u0435\u043A\u0446\u0438\u0438 \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u044B \u0431\u0430\u043B\u043A\u043E\u0439 \u0438 \u0434\u043E\u043F. \u0442\u0435\u043B\u0435\u0436\u043A\u043E\u0439. \u0414\u0430\u0451\u0442 +35 % \u043E\u0431\u044A\u0451\u043C\u0430 \u043D\u0430 \u0434\u0430\u043B\u044C\u043D\u0438\u0445 \u043C\u0430\u0440\u0448\u0440\u0443\u0442\u0430\u0445.",tags:["B-double","2 \u0441\u0435\u043A\u0446\u0438\u0438","\u0430\u0432\u0442\u043E\u043F\u043E\u0435\u0437\u0434"],specs:[["\u0414\u043B\u0438\u043D\u0430","15,5 \u043C"],["\u0412\u043D\u0443\u0442\u0440\u0435\u043D\u043D\u0438\u0439 \u043E\u0431\u044A\u0451\u043C","115 \u043C\xB3"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","34 000 \u043A\u0433"],["\u041E\u0441\u0438","5"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","13 000 \u043A\u0433"],["\u0426\u0435\u043D\u0430","5 600 000 \u20BD"]]},{id:"boat",name:"\u041B\u043E\u0434\u043E\u0447\u043D\u044B\u0439 \u043F\u0440\u0438\u0446\u0435\u043F",brand:"WATERTRAIL",type:"boat",length:8.2,width:2.4,height:2.2,color:"#9fb3bd",tagline:"\u041B\u043E\u0436\u0435 \u0441 \u0440\u043E\u043B\u0438\u043A\u0430\u043C\u0438 \u043F\u043E\u0434 \u043A\u043E\u0440\u043F\u0443\u0441 \u043A\u0430\u0442\u0435\u0440\u0430",desc:"\u0420\u043E\u043B\u0438\u043A\u043E\u0432\u043E\u0435 \u043B\u043E\u0436\u0435, \u043B\u0435\u0431\u0451\u0434\u043A\u0430 \u0438 \u0433\u0435\u0440\u043C\u0435\u0442\u0438\u0447\u043D\u044B\u0435 \u0444\u043E\u043D\u0430\u0440\u0438. \u041B\u043E\u0434\u043A\u0430 \u0441\u043F\u0443\u0441\u043A\u0430\u0435\u0442\u0441\u044F \u043F\u0440\u044F\u043C\u043E \u0432 \u0432\u043E\u0434\u0443 \u043D\u0430 \u0441\u043B\u0438\u043F\u0435.",tags:["\u043A\u0430\u0442\u0435\u0440","\u0440\u043E\u043B\u0438\u043A\u0438","\u0441\u043F\u0443\u0441\u043A \u043D\u0430 \u0432\u043E\u0434\u0443"],specs:[["\u0414\u043B\u0438\u043D\u0430","8,2 \u043C"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","3 500 \u043A\u0433"],["\u041E\u0441\u0438","2"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","1 200 \u043A\u0433"],["\u0426\u0435\u043D\u0430","890 000 \u20BD"]]},{id:"glass",name:"\u0421\u0442\u0435\u043A\u043B\u043E\u0432\u043E\u0437",brand:"CLEARLINE",type:"glass",length:12.5,width:2.5,height:3,color:"#4a5660",tagline:"\u0421\u0442\u043E\u0439\u043A\u0438-\xAB\u0433\u0440\u0435\u0431\u0451\u043D\u043A\u0438\xBB \u043F\u043E\u0434 \u0441\u0442\u0435\u043A\u043B\u043E",desc:"\u0412\u0435\u0440\u0442\u0438\u043A\u0430\u043B\u044C\u043D\u044B\u0435 A-\u043E\u0431\u0440\u0430\u0437\u043D\u044B\u0435 \u0441\u0442\u043E\u0439\u043A\u0438, \u0432\u043E\u0439\u043B\u043E\u0447\u043D\u044B\u0435 \u043F\u0440\u043E\u043A\u043B\u0430\u0434\u043A\u0438 \u0438 \u0440\u0435\u043C\u043D\u0438. \u041F\u0435\u0440\u0435\u0432\u043E\u0437\u043A\u0430 \u043B\u0438\u0441\u0442\u043E\u0432\u043E\u0433\u043E \u0441\u0442\u0435\u043A\u043B\u0430 \u0438 \u0437\u0435\u0440\u043A\u0430\u043B.",tags:["\u0441\u0442\u0435\u043A\u043B\u043E","A-\u0441\u0442\u043E\u0439\u043A\u0438","\u0445\u0440\u0443\u043F\u043A\u043E\u0435"],specs:[["\u0414\u043B\u0438\u043D\u0430","12,5 \u043C"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","18 000 \u043A\u0433"],["\u041E\u0441\u0438","3"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","6 900 \u043A\u0433"],["\u0426\u0435\u043D\u0430","2 100 000 \u20BD"]]},{id:"adr",name:"\u0426\u0438\u0441\u0442\u0435\u0440\u043D\u0430 ADR",brand:"AQUATEC",type:"adr",length:13.2,width:2.5,height:3.15,color:"#e5e7e2",tagline:"\u041E\u043F\u0430\u0441\u043D\u044B\u0435 \u0433\u0440\u0443\u0437\u044B \u0441 \u043F\u043E\u043B\u043D\u043E\u0439 \u043C\u0430\u0440\u043A\u0438\u0440\u043E\u0432\u043A\u043E\u0439",desc:"\u0414\u0432\u043E\u0439\u043D\u044B\u0435 \u0441\u0442\u0435\u043D\u043A\u0438, \u0437\u043D\u0430\u043A\u0438 \u043E\u043F\u0430\u0441\u043D\u043E\u0441\u0442\u0438 \u0438 \u0437\u0430\u0437\u0435\u043C\u043B\u0435\u043D\u0438\u0435. \u0425\u0438\u043C\u0438\u044F, \u043A\u0438\u0441\u043B\u043E\u0442\u044B \u0438 \u0441\u0436\u0438\u0436\u0435\u043D\u043D\u044B\u0435 \u0433\u0430\u0437\u044B \u043F\u043E \u043D\u043E\u0440\u043C\u0430\u043C ADR.",tags:["ADR","\u043E\u043F\u0430\u0441\u043D\u044B\u0439 \u0433\u0440\u0443\u0437","\u0434\u0432\u043E\u0439\u043D\u044B\u0435 \u0441\u0442\u0435\u043D\u043A\u0438"],specs:[["\u0414\u043B\u0438\u043D\u0430","13,2 \u043C"],["\u041E\u0431\u044A\u0451\u043C","30 000 \u043B"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","25 000 \u043A\u0433"],["\u041E\u0441\u0438","3"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","9 600 \u043A\u0433"],["\u0426\u0435\u043D\u0430","8 200 000 \u20BD"]]},{id:"crane",name:"\u041F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430 \u0441 \u043A\u0440\u0430\u043D\u043E\u043C",brand:"STEELRIDE",type:"crane",length:13,width:2.5,height:1.1,color:"#8e9397",tagline:"\u0421\u0430\u043C\u043E\u043F\u043E\u0433\u0440\u0443\u0437\u043A\u0430 \u0432 \u043E\u0434\u043D\u0443 \u043C\u0430\u0448\u0438\u043D\u0443",desc:"\u041A\u0440\u0430\u043D-\u043C\u0430\u043D\u0438\u043F\u0443\u043B\u044F\u0442\u043E\u0440 \u0441 \u0432\u044B\u043B\u0435\u0442\u043E\u043C 8 \u043C \u0438 \u0433\u0438\u0434\u0440\u0430\u0432\u043B\u0438\u0447\u0435\u0441\u043A\u0438\u043C\u0438 \u043E\u043F\u043E\u0440\u0430\u043C\u0438. \u0421\u0430\u043C \u0433\u0440\u0443\u0437\u0438\u0442 \u0438 \u0432\u044B\u0433\u0440\u0443\u0436\u0430\u0435\u0442 \u043F\u0430\u043B\u043B\u0435\u0442\u044B \u0438 \u0431\u043B\u043E\u043A\u0438.",tags:["\u043A\u0440\u0430\u043D","\u0441\u0430\u043C\u043E\u043F\u043E\u0433\u0440\u0443\u0437\u043A\u0430","8 \u043C"],specs:[["\u0414\u043B\u0438\u043D\u0430","13,0 \u043C"],["\u0412\u044B\u043B\u0435\u0442 \u0441\u0442\u0440\u0435\u043B\u044B","8,0 \u043C"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","24 000 \u043A\u0433"],["\u041E\u0441\u0438","3"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","12 800 \u043A\u0433"],["\u0426\u0435\u043D\u0430","9 400 000 \u20BD"]]},{id:"sidetip",name:"\u041F\u043E\u043B\u0443\u043F\u0440\u0438\u0446\u0435\u043F-\u0441\u0430\u043C\u043E\u0441\u0432\u0430\u043B \u0432 \u0441\u0442\u043E\u0440\u043E\u043D\u0443",brand:"BULKLINE",type:"sidetip",length:12.8,width:2.5,height:1.8,color:"#6f7b82",tagline:"\u0421\u0432\u0430\u043B\u0438\u0432\u0430\u0435\u0442 \u0433\u0440\u0443\u0437 \u0432\u0431\u043E\u043A \u043D\u0430 \u043E\u0431\u043E\u0447\u0438\u043D\u0443",desc:"\u0411\u043E\u043A\u043E\u0432\u043E\u0435 \u043E\u043F\u0440\u043E\u043A\u0438\u0434\u044B\u0432\u0430\u043D\u0438\u0435 \u0431\u0435\u0437 \u0437\u0430\u0435\u0437\u0434\u0430 \u043D\u0430 \u044D\u0441\u0442\u0430\u043A\u0430\u0434\u0443. \u0423\u0434\u043E\u0431\u043D\u043E \u043D\u0430 \u0443\u0437\u043A\u0438\u0445 \u0441\u0442\u0440\u043E\u0439\u043F\u043B\u043E\u0449\u0430\u0434\u043A\u0430\u0445.",tags:["\u0431\u043E\u043A\u043E\u0432\u043E\u0439 \u0441\u0432\u0430\u043B","\u0441\u0442\u0440\u043E\u0439\u043A\u0430","3 \u043E\u0441\u0438"],specs:[["\u0414\u043B\u0438\u043D\u0430","12,8 \u043C"],["\u041E\u0431\u044A\u0451\u043C","30 \u043C\xB3"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","30 000 \u043A\u0433"],["\u041E\u0441\u0438","3"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","10 900 \u043A\u0433"],["\u0426\u0435\u043D\u0430","4 800 000 \u20BD"]]},{id:"refcontainer",name:"\u0420\u0435\u0444-\u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430 \u0441 \u043A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440\u043E\u043C",brand:"COLDFLOW",type:"refcontainer",length:13.6,width:2.45,height:2.9,color:"#e8ebe6",tagline:"40-\u0444\u0443\u0442\u043E\u0432\u044B\u0439 \u0440\u0435\u0444-\u043A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440 \u043D\u0430 \u0437\u0430\u043C\u043A\u0430\u0445",desc:"\u0422\u0435\u0440\u043C\u043E\u0438\u0437\u043E\u043B\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439 \u043A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440 \u0441 \u0445\u043E\u043B\u043E\u0434\u0438\u043B\u044C\u043D\u043E\u0439 \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u043E\u0439 \u043A\u0440\u0435\u043F\u0438\u0442\u0441\u044F \u043A \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0435 twist-lock \u0437\u0430\u043C\u043A\u0430\u043C\u0438.",tags:["\u0440\u0435\u0444-\u043A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440","\u043A\u043E\u043C\u0431\u0438\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439","40 \u0444\u0443\u0442\u043E\u0432"],specs:[["\u0414\u043B\u0438\u043D\u0430","13,6 \u043C"],["\u041E\u0431\u044A\u0451\u043C","76 \u043C\xB3"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","26 000 \u043A\u0433"],["\u041E\u0441\u0438","3"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","9 300 \u043A\u0433"],["\u0426\u0435\u043D\u0430","6 100 000 \u20BD"]]}],gl=[{id:"sedan",name:"Aster S",brand:"ASTER",model:"S",style:"sedan",tagline:"\u041A\u043B\u0430\u0441\u0441\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0433\u043E\u0440\u043E\u0434\u0441\u043A\u043E\u0439 \u0441\u0435\u0434\u0430\u043D",desc:"\u041F\u0440\u043E\u0441\u0442\u043E\u0440\u043D\u044B\u0439 \u0441\u0430\u043B\u043E\u043D, \u0431\u0430\u0433\u0430\u0436\u043D\u0438\u043A \u043D\u0430 480 \u043B \u0438 \u043C\u044F\u0433\u043A\u0430\u044F \u043F\u043E\u0434\u0432\u0435\u0441\u043A\u0430. \u0423\u043D\u0438\u0432\u0435\u0440\u0441\u0430\u043B\u044C\u043D\u044B\u0439 \u0430\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u044C \u043D\u0430 \u043A\u0430\u0436\u0434\u044B\u0439 \u0434\u0435\u043D\u044C.",paint:"#2f5d8a",accent:"#d8d5c8",length:4.78,width:1.84,height:1.44,wheelbase:2.82,wheelRadius:.33,wheelWidth:.23,seats:5,tags:["\u0441\u0435\u0434\u0430\u043D","\u043F\u0435\u0440\u0435\u0434\u043D\u0438\u0439 \u043F\u0440\u0438\u0432\u043E\u0434","5 \u043C\u0435\u0441\u0442"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","190 \u043B.\u0441."],["0\u2013100 \u043A\u043C/\u0447","8,4 \u0441"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","225 \u043A\u043C/\u0447"],["\u041F\u0440\u0438\u0432\u043E\u0434","\u043F\u0435\u0440\u0435\u0434\u043D\u0438\u0439"],["\u0420\u0430\u0441\u0445\u043E\u0434","6,7 \u043B/100 \u043A\u043C"],["\u041C\u0430\u0441\u0441\u0430","1 560 \u043A\u0433"],["\u0426\u0435\u043D\u0430","2 890 000 \u20BD"]]},{id:"wagon",name:"Aster SW",brand:"ASTER",model:"SW",style:"wagon",tagline:"\u041F\u0440\u0430\u043A\u0442\u0438\u0447\u043D\u044B\u0439 \u0443\u043D\u0438\u0432\u0435\u0440\u0441\u0430\u043B \u0441 \u0431\u043E\u043B\u044C\u0448\u0438\u043C \u0431\u0430\u0433\u0430\u0436\u043D\u0438\u043A\u043E\u043C",desc:"\u0422\u0430 \u0436\u0435 \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430, \u0447\u0442\u043E \u0443 \u0441\u0435\u0434\u0430\u043D\u0430, \u043D\u043E \u0441 \u043A\u0440\u044B\u0448\u0435\u0439 \u0434\u043E \u043A\u043E\u0440\u043C\u044B. \u0414\u043B\u044F \u0441\u0435\u043C\u044C\u0438, \u0441\u043E\u0431\u0430\u043A \u0438 \u0432\u0435\u043B\u043E\u0441\u0438\u043F\u0435\u0434\u043E\u0432.",paint:"#6b3f2a",accent:"#c9c2ae",length:4.86,width:1.85,height:1.5,wheelbase:2.82,wheelRadius:.34,wheelWidth:.235,seats:5,tags:["\u0443\u043D\u0438\u0432\u0435\u0440\u0441\u0430\u043B","\u043F\u043E\u043B\u043D\u044B\u0439 \u043F\u0440\u0438\u0432\u043E\u0434","5 \u043C\u0435\u0441\u0442"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","220 \u043B.\u0441."],["0\u2013100 \u043A\u043C/\u0447","7,6 \u0441"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","230 \u043A\u043C/\u0447"],["\u041F\u0440\u0438\u0432\u043E\u0434","\u043F\u043E\u043B\u043D\u044B\u0439"],["\u0420\u0430\u0441\u0445\u043E\u0434","7,4 \u043B/100 \u043A\u043C"],["\u041C\u0430\u0441\u0441\u0430","1 720 \u043A\u0433"],["\u0426\u0435\u043D\u0430","3 190 000 \u20BD"]]},{id:"hatch",name:"Vela City",brand:"VELA",model:"City",style:"hatch",tagline:"\u041A\u043E\u043C\u043F\u0430\u043A\u0442\u043D\u044B\u0439 \u0445\u044D\u0442\u0447\u0431\u0435\u043A \u0434\u043B\u044F \u043F\u0430\u0440\u043A\u043E\u0432\u043A\u0438 \u0432 \u0446\u0435\u043D\u0442\u0440\u0435",desc:"\u041A\u043E\u0440\u043E\u0442\u043A\u0438\u0439 \u0441\u0432\u0435\u0441, \u0432\u044B\u0441\u043E\u043A\u0430\u044F \u043F\u043E\u0441\u0430\u0434\u043A\u0430 \u0438 \u0440\u0430\u0437\u0432\u043E\u0440\u043E\u0442 \u0437\u0430 9,8 \u043C. \u0411\u0435\u043D\u0437\u0438\u043D\u043E\u0432\u044B\u0439 \u0442\u0443\u0440\u0431\u043E\u043C\u043E\u0442\u043E\u0440 1,4 \u043B.",paint:"#c9402f",accent:"#2b2f33",length:4.02,width:1.76,height:1.48,wheelbase:2.58,wheelRadius:.31,wheelWidth:.21,seats:5,tags:["\u0445\u044D\u0442\u0447\u0431\u0435\u043A","\u043F\u0435\u0440\u0435\u0434\u043D\u0438\u0439 \u043F\u0440\u0438\u0432\u043E\u0434","\u043A\u043E\u043C\u043F\u0430\u043A\u0442"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","135 \u043B.\u0441."],["0\u2013100 \u043A\u043C/\u0447","9,3 \u0441"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","205 \u043A\u043C/\u0447"],["\u041F\u0440\u0438\u0432\u043E\u0434","\u043F\u0435\u0440\u0435\u0434\u043D\u0438\u0439"],["\u0420\u0430\u0441\u0445\u043E\u0434","5,8 \u043B/100 \u043A\u043C"],["\u041C\u0430\u0441\u0441\u0430","1 240 \u043A\u0433"],["\u0426\u0435\u043D\u0430","1 890 000 \u20BD"]]},{id:"suv",name:"Terra Rover 4\xD74",brand:"TERRA",model:"Rover",style:"suv",tagline:"\u0411\u043E\u043B\u044C\u0448\u043E\u0439 \u043F\u043E\u043B\u043D\u043E\u043F\u0440\u0438\u0432\u043E\u0434\u043D\u044B\u0439 \u0432\u043D\u0435\u0434\u043E\u0440\u043E\u0436\u043D\u0438\u043A",desc:"\u041A\u043B\u0438\u0440\u0435\u043D\u0441 220 \u043C\u043C, \u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u043A\u0430 \u0437\u0430\u0434\u043D\u0435\u0433\u043E \u0434\u0438\u0444\u0444\u0435\u0440\u0435\u043D\u0446\u0438\u0430\u043B\u0430 \u0438 7 \u043C\u0435\u0441\u0442. \u0414\u043B\u044F \u0434\u0430\u0447\u0438, \u043E\u0445\u043E\u0442\u044B \u0438 \u043F\u043B\u043E\u0445\u0438\u0445 \u0434\u043E\u0440\u043E\u0433.",paint:"#4f5844",accent:"#1c1f1e",length:4.92,width:1.96,height:1.82,wheelbase:2.9,wheelRadius:.4,wheelWidth:.28,seats:7,tags:["\u0432\u043D\u0435\u0434\u043E\u0440\u043E\u0436\u043D\u0438\u043A","4\xD74","7 \u043C\u0435\u0441\u0442"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","265 \u043B.\u0441."],["0\u2013100 \u043A\u043C/\u0447","8,9 \u0441"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","210 \u043A\u043C/\u0447"],["\u041F\u0440\u0438\u0432\u043E\u0434","\u043F\u043E\u043B\u043D\u044B\u0439"],["\u0420\u0430\u0441\u0445\u043E\u0434","10,2 \u043B/100 \u043A\u043C"],["\u041C\u0430\u0441\u0441\u0430","2 160 \u043A\u0433"],["\u0426\u0435\u043D\u0430","4 750 000 \u20BD"]]},{id:"coupe",name:"Vela Coup\xE9",brand:"VELA",model:"Coup\xE9",style:"coupe",tagline:"\u041D\u0438\u0437\u043A\u0438\u0439 \u0434\u0432\u0443\u0445\u0434\u0432\u0435\u0440\u043D\u044B\u0439 \u0445\u0430\u0440\u0430\u043A\u0442\u0435\u0440",desc:"\u0421\u043F\u043E\u0439\u043B\u0435\u0440, \u0441\u043F\u043E\u0440\u0442\u0438\u0432\u043D\u044B\u0435 \u0441\u0438\u0434\u0435\u043D\u044C\u044F \u0438 2,0-\u043B\u0438\u0442\u0440\u043E\u0432\u044B\u0439 \u0442\u0443\u0440\u0431\u043E\u043C\u043E\u0442\u043E\u0440. \u0412\u0442\u043E\u0440\u043E\u0439 \u0440\u044F\u0434 \u2014 \u0434\u043B\u044F \u0432\u0435\u0449\u0435\u0439, \u0430 \u043D\u0435 \u0434\u043B\u044F \u043B\u044E\u0434\u0435\u0439.",paint:"#a3141c",accent:"#141719",length:4.62,width:1.9,height:1.32,wheelbase:2.74,wheelRadius:.35,wheelWidth:.26,seats:4,tags:["\u043A\u0443\u043F\u0435","\u0437\u0430\u0434\u043D\u0438\u0439 \u043F\u0440\u0438\u0432\u043E\u0434","2 \u0434\u0432\u0435\u0440\u0438"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","330 \u043B.\u0441."],["0\u2013100 \u043A\u043C/\u0447","5,1 \u0441"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","265 \u043A\u043C/\u0447"],["\u041F\u0440\u0438\u0432\u043E\u0434","\u0437\u0430\u0434\u043D\u0438\u0439"],["\u0420\u0430\u0441\u0445\u043E\u0434","8,9 \u043B/100 \u043A\u043C"],["\u041C\u0430\u0441\u0441\u0430","1 590 \u043A\u0433"],["\u0426\u0435\u043D\u0430","5 600 000 \u20BD"]]},{id:"pickup",name:"Terra Hauler",brand:"TERRA",model:"Hauler",style:"pickup",tagline:"\u041F\u0438\u043A\u0430\u043F \u0441 \u043A\u0443\u0437\u043E\u0432\u043E\u043C \u0438 \u0440\u0430\u043C\u043E\u0439",desc:"\u041A\u0443\u0437\u043E\u0432 1,5 \u043C \u0441 \u043A\u0440\u044B\u0448\u043A\u043E\u0439, \u043F\u0440\u0438\u0446\u0435\u043F \u0434\u043E 3,5 \u0442 \u0438 \u043F\u043E\u043D\u0438\u0436\u0430\u044E\u0449\u0430\u044F \u043F\u0435\u0440\u0435\u0434\u0430\u0447\u0430. \u0420\u0430\u0431\u043E\u0447\u0438\u0439 \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442 \u0438 \u0441\u0435\u043C\u0435\u0439\u043D\u0430\u044F \u043C\u0430\u0448\u0438\u043D\u0430.",paint:"#1d5b73",accent:"#c9c9c0",length:5.34,width:1.98,height:1.88,wheelbase:3.22,wheelRadius:.41,wheelWidth:.29,seats:5,tags:["\u043F\u0438\u043A\u0430\u043F","4\xD74","\u043F\u0440\u0438\u0446\u0435\u043F 3,5 \u0442"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","250 \u043B.\u0441."],["0\u2013100 \u043A\u043C/\u0447","9,1 \u0441"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","195 \u043A\u043C/\u0447"],["\u041F\u0440\u0438\u0432\u043E\u0434","\u043F\u043E\u043B\u043D\u044B\u0439"],["\u0420\u0430\u0441\u0445\u043E\u0434","11,5 \u043B/100 \u043A\u043C"],["\u041C\u0430\u0441\u0441\u0430","2 320 \u043A\u0433"],["\u0426\u0435\u043D\u0430","4 290 000 \u20BD"]]},{id:"van-life",name:"Kargo Vito Van",brand:"KARGO",model:"Vito",style:"van",tagline:"\u0426\u0435\u043B\u044C\u043D\u043E\u043C\u0435\u0442\u0430\u043B\u043B\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0444\u0443\u0440\u0433\u043E\u043D",desc:"\u0413\u0440\u0443\u0437\u043E\u0432\u043E\u0439 \u043E\u0442\u0441\u0435\u043A 6,5 \u043C\xB3, \u0441\u0434\u0432\u0438\u0436\u043D\u0430\u044F \u0434\u0432\u0435\u0440\u044C \u0438 \u043F\u0435\u0440\u0435\u0433\u043E\u0440\u043E\u0434\u043A\u0430. \u041A\u0443\u0440\u044C\u0435\u0440\u0441\u043A\u0438\u0439 \u0438 \u0441\u0435\u0440\u0432\u0438\u0441\u043D\u044B\u0439 \u0442\u0440\u0430\u043D\u0441\u043F\u043E\u0440\u0442.",paint:"#e6e8e3",accent:"#d94f2b",length:5.14,width:1.94,height:2.28,wheelbase:3.1,wheelRadius:.36,wheelWidth:.24,seats:3,tags:["\u0444\u0443\u0440\u0433\u043E\u043D","6,5 \u043C\xB3","\u043F\u0435\u0440\u0435\u0434\u043D\u0438\u0439 \u043F\u0440\u0438\u0432\u043E\u0434"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","150 \u043B.\u0441."],["0\u2013100 \u043A\u043C/\u0447","11,8 \u0441"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","175 \u043A\u043C/\u0447"],["\u041F\u0440\u0438\u0432\u043E\u0434","\u043F\u0435\u0440\u0435\u0434\u043D\u0438\u0439"],["\u0420\u0430\u0441\u0445\u043E\u0434","7,9 \u043B/100 \u043A\u043C"],["\u041C\u0430\u0441\u0441\u0430","1 980 \u043A\u0433"],["\u0426\u0435\u043D\u0430","3 450 000 \u20BD"]]},{id:"micro",name:"Vela Mini",brand:"VELA",model:"Mini",style:"micro",tagline:"\u041C\u0438\u043A\u0440\u043E\u043A\u0430\u0440 \u043D\u0430 4 \u043C\u0435\u0441\u0442\u0430",desc:"\u0414\u043B\u0438\u043D\u0430 \u0432\u0441\u0435\u0433\u043E 3,2 \u043C, \u0431\u0430\u0442\u0430\u0440\u0435\u044F \u043D\u0430 260 \u043A\u043C \u0438 \u043F\u0430\u0440\u043A\u043E\u0432\u043A\u0430 \u0432 \u043B\u044E\u0431\u0443\u044E \u0449\u0435\u043B\u044C. \u042D\u043B\u0435\u043A\u0442\u0440\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0433\u043E\u0440\u043E\u0434\u0441\u043A\u043E\u0439 \u043C\u0430\u043B\u044B\u0448.",paint:"#e0b528",accent:"#24363f",length:3.2,width:1.58,height:1.56,wheelbase:2,wheelRadius:.27,wheelWidth:.17,seats:4,tags:["\u043C\u0438\u043A\u0440\u043E\u043A\u0430\u0440","\u044D\u043B\u0435\u043A\u0442\u0440\u043E","260 \u043A\u043C"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","75 \u043B.\u0441."],["0\u2013100 \u043A\u043C/\u0447","12,5 \u0441"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","130 \u043A\u043C/\u0447"],["\u041F\u0440\u0438\u0432\u043E\u0434","\u0437\u0430\u0434\u043D\u0438\u0439"],["\u0411\u0430\u0442\u0430\u0440\u0435\u044F","32 \u043A\u0412\u0442\xB7\u0447"],["\u0417\u0430\u043F\u0430\u0441 \u0445\u043E\u0434\u0430","260 \u043A\u043C"],["\u0426\u0435\u043D\u0430","1 590 000 \u20BD"]]},{id:"crossover",name:"Aster Cross",brand:"ASTER",model:"Cross",style:"crossover",tagline:"\u0413\u043E\u0440\u043E\u0434\u0441\u043A\u043E\u0439 \u043A\u0440\u043E\u0441\u0441\u043E\u0432\u0435\u0440 \u0441 \u0432\u044B\u0441\u043E\u043A\u0438\u043C \u043A\u043B\u0438\u0440\u0435\u043D\u0441\u043E\u043C",desc:"\u0421\u0440\u0435\u0434\u043D\u0438\u0439 \u0440\u0430\u0437\u043C\u0435\u0440, \u044D\u043A\u043E\u043D\u043E\u043C\u0438\u0447\u043D\u044B\u0439 \u0433\u0438\u0431\u0440\u0438\u0434 \u0438 \u043F\u043E\u043B\u043D\u044B\u0439 \u043F\u0440\u0438\u0432\u043E\u0434 \u043D\u0430 \u0437\u0430\u0434\u043D\u044E\u044E \u043E\u0441\u044C. \u041A\u043E\u043C\u043F\u0440\u043E\u043C\u0438\u0441\u0441 \u043C\u0435\u0436\u0434\u0443 \u0441\u0435\u0434\u0430\u043D\u043E\u043C \u0438 SUV.",paint:"#7a8086",accent:"#252a2e",length:4.6,width:1.87,height:1.66,wheelbase:2.77,wheelRadius:.36,wheelWidth:.25,seats:5,tags:["\u043A\u0440\u043E\u0441\u0441\u043E\u0432\u0435\u0440","\u0433\u0438\u0431\u0440\u0438\u0434","5 \u043C\u0435\u0441\u0442"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","215 \u043B.\u0441."],["0\u2013100 \u043A\u043C/\u0447","8,1 \u0441"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","215 \u043A\u043C/\u0447"],["\u041F\u0440\u0438\u0432\u043E\u0434","\u043F\u043E\u043B\u043D\u044B\u0439"],["\u0420\u0430\u0441\u0445\u043E\u0434","5,4 \u043B/100 \u043A\u043C"],["\u041C\u0430\u0441\u0441\u0430","1 830 \u043A\u0433"],["\u0426\u0435\u043D\u0430","3 760 000 \u20BD"]]},{id:"sport",name:"Vela RS",brand:"VELA",model:"RS",style:"sport",tagline:"\u0422\u0440\u0435\u043A\u043E\u0432\u044B\u0439 \u0441\u043F\u043E\u0440\u0442\u043A\u0430\u0440 \u0441 V8",desc:"\u041A\u0430\u0440\u0431\u043E\u043D\u043E\u0432\u044B\u0435 \u0434\u0435\u0442\u0430\u043B\u0438, \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0435 \u0430\u043D\u0442\u0438\u043A\u0440\u044B\u043B\u043E \u0438 4,0-\u043B\u0438\u0442\u0440\u043E\u0432\u044B\u0439 V8. 3,2 \u0441 \u0434\u043E \u0441\u043E\u0442\u043D\u0438 \u0438 \u043D\u0430\u0441\u0442\u043E\u044F\u0449\u0438\u0439 \u0440\u0451\u0432.",paint:"#e08a16",accent:"#101214",length:4.58,width:2.02,height:1.22,wheelbase:2.66,wheelRadius:.36,wheelWidth:.31,seats:2,tags:["\u0441\u043F\u043E\u0440\u0442\u043A\u0430\u0440","V8","3,2 \u0441"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","620 \u043B.\u0441."],["0\u2013100 \u043A\u043C/\u0447","3,2 \u0441"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","318 \u043A\u043C/\u0447"],["\u041F\u0440\u0438\u0432\u043E\u0434","\u0437\u0430\u0434\u043D\u0438\u0439"],["\u0420\u0430\u0441\u0445\u043E\u0434","13,8 \u043B/100 \u043A\u043C"],["\u041C\u0430\u0441\u0441\u0430","1 480 \u043A\u0433"],["\u0426\u0435\u043D\u0430","18 900 000 \u20BD"]]}];function wd(i,t){let e=i==="trucks"?pl:i==="trailers"?ml:gl;return e.find(n=>n.id===t)||e[0]}var Bt=i=>document.getElementById(i),ai={trucks:pl,trailers:ml,cars:gl},Xx=Object.fromEntries(Td.map(i=>[i.id,i])),qx=["#e9ecec","#b9c0c6","#2f5d8a","#16233f","#a4241d","#7d1a2e","#cf5a13","#e0b528","#1f6b45","#37a58c","#0f6b70","#4b3c85","#6d2a6b","#7a3b2a","#5a3c25","#c2a878","#2f353b","#101214"],Id="garage3d-showroom-v1",Ld={exterior:"\u{1F310}",side:"\u25E7",rear:"\u25A3",front:"\u25CD",driver:"\u{1F9D1}\u200D\u2708\uFE0F",passenger:"\u{1FA91}",salon:"\u{1F698}",bunk:"\u{1F6CF}"},Ut={cat:"trucks",id:"atlas-vision",view:"exterior",preset:"studio",color:null,fav:[],favOnly:!1,autoRotate:!0,search:"",compare:null},xn={};try{xn=JSON.parse(localStorage.getItem(Id)||"{}")||{}}catch{xn={}}xn.cat&&ai[xn.cat]&&(Ut.cat=xn.cat);xn.id&&(Ut.id=xn.id);Ut.fav=Array.isArray(xn.fav)?xn.fav:[];Ut.preset=xn.preset||"studio";var $s=xn.colors&&typeof xn.colors=="object"?xn.colors:{};function so(){try{localStorage.setItem(Id,JSON.stringify({cat:Ut.cat,id:Ut.id,fav:Ut.fav,preset:Ut.preset,colors:$s}))}catch{}}function _n(){return wd(Ut.cat,Ut.id)}var Un;try{Un=pd(Bt("gl"))}catch(i){let t=document.createElement("div");throw t.className="webgl-error",t.innerHTML="<b>\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0432\u043A\u043B\u044E\u0447\u0438\u0442\u044C 3D</b><span>\u0411\u0440\u0430\u0443\u0437\u0435\u0440 \u043D\u0435 \u0434\u0430\u043B \u0434\u043E\u0441\u0442\u0443\u043F \u043A WebGL. \u0412\u043A\u043B\u044E\u0447\u0438\u0442\u0435 \u0430\u043F\u043F\u0430\u0440\u0430\u0442\u043D\u043E\u0435 \u0443\u0441\u043A\u043E\u0440\u0435\u043D\u0438\u0435 \u0438\u043B\u0438 \u043E\u0442\u043A\u0440\u043E\u0439\u0442\u0435 \u0448\u043E\u0443\u0440\u0443\u043C \u0432 \u0434\u0440\u0443\u0433\u043E\u043C \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435.</span>",Bt("viewport").appendChild(t),Bt("loader").classList.add("hidden"),i}var Dd=fd(Un.renderer),ts=new fl(Un.camera,Bt("gl")),Ks=Un.scene,je=null,xl=null,ih=!1,io=null,Ui=!0,Fe=i=>{let t=Bt("stage-live");t.textContent=i,t.classList.add("show"),clearTimeout(Fe.t),Fe.t=setTimeout(()=>t.classList.remove("show"),1800)};function Yx(){je&&(Ks.remove(je.root),je.root.traverse(i=>{var t,e,n;if(i.geometry&&((e=(t=i.geometry).dispose)==null||e.call(t)),i.material){let s=Array.isArray(i.material)?i.material:[i.material];for(let r of s)r&&r.__shared!==!0&&((n=r.dispose)==null||n.call(r))}}),je=null)}function rh(i,{instant:t=!1,view:e=null}={}){ih=!0,Bt("loader").classList.remove("hidden"),Yx(),setTimeout(()=>{var a,l;let n=nh(i,Dd),s=$s[i.id]||i.paint;for(let c of n.paintMats)c&&c.color&&c.color.set(s);Ks.add(n.root),je=n;let r=0;n.root.traverse(c=>{var h;if(c.isMesh&&c.geometry){let u=c.geometry,d=u.index?u.index.count:((h=u.attributes.position)==null?void 0:h.count)||0;r+=d/3}}),Bt("poly-badge").textContent=`${Math.round(r/1e3)}K \u043F\u043E\u043B\u0438\u0433\u043E\u043D\u043E\u0432`;let o=e||i.views.find(c=>c.id===(t?"exterior":Ut.view))||i.views[0];if(Ut.view=o.id,ts.controls.autoRotate=!!o.autoRotate&&Ui&&Ut.view==="exterior",ts.setView(o,{instant:t}),Ud(i),Bt("loader").classList.add("hidden"),ih=!1,vl(i),(a=Bt("compare-btn"))==null||a.classList.toggle("on",!!Ut.compare),(l=Bt("compare-btn-2"))==null||l.classList.toggle("active",!!Ut.compare),xl){let c=xl;xl=null,rh(c.unit,c.opts)}},60)}function yl(i,t,{instant:e=!1}={}){Ut.cat=i,Ut.id=t,so();let n=_n();Js(),vl(n),Nd(n);let s=`${n.category==="trailers"?"trailer":n.category==="cars"?"car":"truck"}:${n.id}`;if(!je||je.root.name!==s){if(ih){xl={unit:n,opts:{instant:e}};return}rh(n,{instant:e,view:n.views[0]})}}function Zx(i){return i.category==="trucks"?"\u{1F69B}":i.category==="cars"?i.style==="sport"?"\u{1F3CE}":i.style==="van"?"\u{1F690}":i.style==="pickup"?"\u{1F6FB}":"\u{1F697}":{tanker:"\u{1F6E2}",adr:"\u2623",silo:"\u{1F3D7}",tipper:"\u{1F6A7}",livestock:"\u{1F404}",logging:"\u{1F332}",container:"\u{1F9F1}",refcontainer:"\u2744",carrier:"\u{1F697}",bdouble:"\u{1F69A}",boat:"\u26F5",glass:"\u{1FA9F}",crane:"\u{1F3D7}",sidetip:"\u{1F69B}",dolly:"\u{1FAB5}",lowboy:"\u{1F9BE}",reefer:"\u2744",curtain:"\u{1F3AD}",van:"\u{1F4E6}",flatbed:"\u25AD"}[i.type]||"\u{1F4E6}"}function Js(){let i=Bt("unit-list"),t=Ut.search.trim().toLowerCase(),e=ai[Ut.cat].filter(s=>Ut.favOnly&&!Ut.fav.includes(s.id)?!1:t?[s.name,s.brand,s.tagline,s.type,...s.tags||[],...(s.specs||[]).flat()].join(" ").toLowerCase().includes(t):!0);if(i.innerHTML="",Bt("cat-hint").textContent=Xx[Ut.cat].hint+(Ut.favOnly?" \xB7 \u0442\u043E\u043B\u044C\u043A\u043E \u0438\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0435":""),Bt("catalog-count").textContent=e.length,!e.length){i.innerHTML='<p class="mini" style="padding:14px">\u041D\u0438\u0447\u0435\u0433\u043E \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E. \u041E\u0447\u0438\u0441\u0442\u0438\u0442\u0435 \u043F\u043E\u0438\u0441\u043A \u0438\u043B\u0438 \u0438\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0435.</p>';return}e.forEach((s,r)=>{let o=document.createElement("button");o.className="unit"+(s.id===Ut.id&&s.category===Ut.cat?" active":""),o.setAttribute("role","option"),o.setAttribute("aria-selected",String(s.id===Ut.id));let a=$s[s.id]||s.color||s.paint||"#888";o.innerHTML=`
      <span class="thumb">${Zx(s)}</span>
      <span>
        <span class="u-name"><i class="swatch" style="background:${a}"></i>${s.name}</span>
        <span class="u-sub">${s.tagline||""}</span>
      </span>
      <span class="u-idx">${String(ai[Ut.cat].indexOf(s)+1).padStart(2,"0")}</span>
      ${Ut.fav.includes(s.id)?'<span class="fav-dot">\u2605</span>':""}
    `,o.onclick=()=>{if(s.id===Ut.id&&s.category===Ut.cat){sh();return}yl(s.category,s.id)},i.appendChild(o)});let n=i.querySelector(".unit.active");n&&n.scrollIntoView({block:"nearest"})}function vl(i){Bt("d-brand").textContent=`${i.brand||"\u2014"} \xB7 2026`,Bt("d-name").textContent=i.name,Bt("d-cat").textContent=i.category==="trucks"?"\u0422\u042F\u0413\u0410\u0427":i.category==="trailers"?"\u041F\u0420\u0418\u0426\u0415\u041F":"\u0410\u0412\u0422\u041E\u041C\u041E\u0411\u0418\u041B\u042C",Bt("d-desc").textContent=i.desc||i.tagline||"",Bt("unit-kind").textContent=(i.category==="trucks"?"\u0422\u042F\u0413\u0410\u0427":i.category==="trailers"?"\u041F\u0420\u0418\u0426\u0415\u041F":"\u0410\u0412\u0422\u041E\u041C\u041E\u0411\u0418\u041B\u042C")+(i.meta?` \xB7 ${i.meta}`:""),Bt("unit-name").textContent=i.name,Bt("unit-tagline").textContent=i.tagline||"";let t=Bt("d-tags");t.innerHTML="";for(let l of i.tags||[]){let c=document.createElement("span");c.className="tag",c.textContent=l,t.appendChild(c)}let e=Bt("spec-grid");e.innerHTML="";for(let[l,c]of i.specs||[]){let h=document.createElement("div");h.className="spec",h.innerHTML=`<span>${l}</span><b>${c}</b>`,e.appendChild(h)}let n=Bt("paint-row");n.innerHTML="";let s=$s[i.id]||i.paint||i.color;[...new Set([i.paint||i.color||"#e9ecec",...qx])].forEach(l=>{let c=document.createElement("button");c.className="paint-dot"+(l.toLowerCase()===String(s).toLowerCase()?" active":""),c.style.background=l,c.title=l,c.onclick=()=>Jx(i,l),n.appendChild(c)});let o=Bt("anchor-row");o.innerHTML="",je&&je.anchors?(Bt("anchor-count").textContent=je.anchors.length,je.anchors.forEach(l=>{let c=document.createElement("button");c.className="anchor-btn",c.textContent=l.label+(l.side?` (${l.side})`:""),c.onclick=()=>$x(l),o.appendChild(c)})):Bt("anchor-count").textContent="0";let a=ai[Ut.cat].findIndex(l=>l.id===i.id);Bt("counter").textContent=`${a+1} / ${ai[Ut.cat].length}`}function Jx(i,t){if($s[i.id]=t,so(),je)for(let e of je.paintMats)e!=null&&e.color&&e.color.set(t);Js(),vl(i),Fe(`\u0426\u0432\u0435\u0442: ${t.toUpperCase()}`)}function Nd(i){let t=Bt("dock-views");t.innerHTML="";let e=[{title:"\u0421\u041D\u0410\u0420\u0423\u0416\u0418",items:i.views.filter(n=>n.group==="exterior")},{title:"\u0412\u041D\u0423\u0422\u0420\u0418",items:i.views.filter(n=>n.group==="interior")}];for(let n of e){if(!n.items.length)continue;let s=document.createElement("span");s.className="eyebrow",s.textContent=n.title,t.appendChild(s);for(let r of n.items){let o=document.createElement("button");o.className="chip"+(r.id===Ut.view?" active":""),o.textContent=`${Ld[r.id]||""} ${r.label}`.trim(),o.dataset.view=r.id,o.onclick=()=>$n(r.id),t.appendChild(o)}}}function Ud(i){let t=Bt("view-switch");t.innerHTML="";let e=["exterior","side","rear","front","driver","passenger","salon","bunk"];[...i.views].sort((s,r)=>e.indexOf(s.id)-e.indexOf(r.id)).forEach(s=>{let r=document.createElement("button");r.className="view-btn"+(s.group==="interior"?" interior":"")+(s.id===Ut.view?" active":""),r.dataset.view=s.id,r.innerHTML=`<span>${Ld[s.id]||"\u{1F4F7}"}</span>${s.label}`,r.onclick=()=>$n(s.id),t.appendChild(r)})}function $n(i){let t=_n(),e=t.views.find(n=>n.id===i)||t.views[0];Ut.view=i,ts.controls.autoRotate=!!e.autoRotate&&Ui,ts.setView(e,{instant:!1}),document.querySelectorAll(".view-btn").forEach(n=>n.classList.toggle("active",n.dataset.view===i)),document.querySelectorAll("#dock-views .chip").forEach(n=>n.classList.toggle("active",n.dataset.view===i)),Bt("mode-badge").textContent=e.group==="interior"?"\u0412 \u0421\u0410\u041B\u041E\u041D\u0415":"\u0421\u041D\u0410\u0420\u0423\u0416\u0418",Bt("orbit-btn").classList.toggle("active",!!e.autoRotate&&Ui),so()}function sh(){let i=_n(),t=i.views.some(n=>n.group==="interior"&&n.id===Ut.view),e=t?"exterior":i.views.find(n=>n.id==="driver")?"driver":"exterior";$n(e),Fe(t?"\u0412\u0438\u0434 \u0441\u043D\u0430\u0440\u0443\u0436\u0438":"\u0421\u0430\u0434\u0438\u043C\u0441\u044F \u0432 \u0441\u0430\u043B\u043E\u043D")}function $x(i){let[t,e,n]=i.pos,s=(je==null?void 0:je.kind)==="car"?2.6:3.4,r=new D(t,e,n),o=new D(1,.55,-.9).normalize(),a={id:"anchor",label:i.label,group:"exterior",seat:!1,orbit:!0,fov:34,pos:[t+o.x*s,Math.max(e+o.y*s,.4),n+o.z*s],target:[t,e,n]};ts.setView(a,{instant:!1}),Bt("mode-badge").textContent="\u041E\u0421\u041C\u041E\u0422\u0420",Fe(i.label+(i.side?` \xB7 ${i.side}`:"")),document.querySelectorAll(".view-btn").forEach(l=>l.classList.remove("active"))}function Ad(){let i=_n();if(Ut.compare)Ut.compare=null,Fd(),Bt("compare-btn").classList.remove("on"),Bt("compare-btn-2").classList.remove("active"),Fe("\u0421\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u0435 \u0432\u044B\u043A\u043B\u044E\u0447\u0435\u043D\u043E");else{let e=ai[Ut.cat],n=e.findIndex(r=>r.id===i.id),s=e[(n+1)%e.length];if(s.id===i.id){Fe("\u0412 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438 \u043E\u0434\u043D\u0430 \u043C\u043E\u0434\u0435\u043B\u044C \u2014 \u0441\u0440\u0430\u0432\u043D\u0438\u0432\u0430\u0442\u044C \u043D\u0435 \u0441 \u0447\u0435\u043C");return}Ut.compare=s.id,Kx(i,s),Bt("compare-btn").classList.add("on"),Bt("compare-btn-2").classList.add("active"),Fe(`\u0420\u044F\u0434\u043E\u043C: ${s.name}`)}}function Kx(i,t){Fd();let e=new We,n=nh({...t,category:i.category},Dd),s=$s[t.id]||t.paint;for(let o of n.paintMats)o!=null&&o.color&&o.color.set(s);let r=(i.category==="cars"?3.6:4.6)*(n.kind==="car"?1:1.15);n.root.position.set(r,0,0),n.root.rotation.y=-.4,e.add(n.root),Ks.add(e),io={group:e,built:n}}function Fd(){io&&(Ks.remove(io.group),io.group.traverse(i=>{var t,e;i.geometry&&((e=(t=i.geometry).dispose)==null||e.call(t))}),io=null)}function _l(i){let t=ai[Ut.cat],e=t.findIndex(s=>s.id===Ut.id),n=t[(e+i+t.length)%t.length];yl(Ut.cat,n.id)}function Rd(){let i=[...pl.map(n=>["trucks",n.id]),...ml.map(n=>["trailers",n.id]),...gl.map(n=>["cars",n.id])],[t,e]=i[Math.floor(Math.random()*i.length)];t!==Ut.cat&&(Ut.cat=t,document.querySelectorAll(".cat-tab").forEach(n=>{let s=n.dataset.cat===t;n.classList.toggle("active",s),n.setAttribute("aria-selected",String(s))})),yl(t,e),Fe("\u0421\u043B\u0443\u0447\u0430\u0439\u043D\u044B\u0439 \u044D\u043A\u0441\u043F\u043E\u043D\u0430\u0442")}function jx(i){ai[i]&&(Ut.cat=i,Ut.id=ai[i][0].id,document.querySelectorAll(".cat-tab").forEach(t=>{let e=t.dataset.cat===i;t.classList.toggle("active",e),t.setAttribute("aria-selected",String(e))}),yl(i,Ut.id,{instant:!1}))}function Cd(){Un.renderer.render(Ks,Un.camera);let i=document.createElement("a"),t=_n();i.download=`garage3d-${t.id}-${Ut.view}.png`,i.href=Un.renderer.domElement.toDataURL("image/png"),i.click(),Fe("\u0421\u043A\u0440\u0438\u043D\u0448\u043E\u0442 \u0441\u043E\u0445\u0440\u0430\u043D\u0451\u043D")}function Pd(){var t,e;let i=document.documentElement;document.fullscreenElement?(e=document.exitFullscreen)==null||e.call(document):(t=i.requestFullscreen)==null||t.call(i).catch(()=>Fe("\u041F\u043E\u043B\u043D\u044B\u0439 \u044D\u043A\u0440\u0430\u043D \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D"))}function Qx(){document.querySelectorAll(".cat-tab").forEach(i=>{i.onclick=()=>jx(i.dataset.cat)}),document.querySelectorAll("#dock-env .chip").forEach(i=>{i.onclick=()=>{Ut.preset=i.dataset.preset,Un.setPreset(Ut.preset),document.querySelectorAll("#dock-env .chip").forEach(t=>t.classList.toggle("active",t.dataset.preset===Ut.preset)),so(),Fe(`\u0421\u0432\u0435\u0442: ${i.textContent}`)}}),Bt("prev-btn").onclick=()=>_l(-1),Bt("next-btn").onclick=()=>_l(1),Bt("random-btn").onclick=Rd,Bt("shot-btn").onclick=Cd,Bt("full-btn").onclick=Pd,Bt("help-btn").onclick=()=>Bt("help-modal").classList.remove("hidden"),Bt("help-close").onclick=()=>Bt("help-modal").classList.add("hidden"),Bt("help-modal").onclick=i=>{i.target.id==="help-modal"&&Bt("help-modal").classList.add("hidden")},Bt("d-inside").onclick=()=>{let t=_n().views.find(e=>e.id==="driver"||e.id==="salon");t?$n(t.id):Fe("\u0423 \u044D\u0442\u043E\u0439 \u043C\u043E\u0434\u0435\u043B\u0438 \u043D\u0435\u0442 \u0441\u0430\u043B\u043E\u043D\u0430 \u2014 \u043F\u0440\u0438\u0446\u0435\u043F \u0442\u043E\u043B\u044C\u043A\u043E \u0441\u043D\u0430\u0440\u0443\u0436\u0438")},Bt("d-outside").onclick=()=>$n("exterior"),Bt("orbit-btn").onclick=()=>{let i=_n().views.find(t=>t.id===Ut.view);Ui=!Ui,ts.controls.autoRotate=Ui&&!!(i!=null&&i.autoRotate),Bt("orbit-btn").classList.toggle("active",Ui),Fe(Ui?"\u0410\u0432\u0442\u043E\u0432\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u0432\u043A\u043B\u044E\u0447\u0435\u043D\u043E":"\u0410\u0432\u0442\u043E\u0432\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u0432\u044B\u043A\u043B\u044E\u0447\u0435\u043D\u043E")},Bt("reset-btn").onclick=()=>{let i=_n();$n(i.views[0].id)},Bt("look-btn").onclick=()=>{let i=_n(),t=i.views.find(n=>n.id===Ut.view);if(t!=null&&t.seat){$n(t.id),Fe("\u0412\u0437\u0433\u043B\u044F\u0434 \u0432\u043F\u0435\u0440\u0451\u0434 \u2014 \u0442\u044F\u043D\u0438\u0442\u0435 \u043C\u044B\u0448\u044C\u044E, \u0447\u0442\u043E\u0431\u044B \u043E\u0441\u043C\u043E\u0442\u0440\u0435\u0442\u044C\u0441\u044F");return}let e=i.views.find(n=>n.id==="driver")||i.views.find(n=>n.group==="interior");if(!e){Fe("\u0423 \u044D\u0442\u043E\u0439 \u043C\u043E\u0434\u0435\u043B\u0438 \u043D\u0435\u0442 \u0441\u0430\u043B\u043E\u043D\u0430 \u2014 \u043E\u0441\u043C\u043E\u0442\u0440 \u0442\u043E\u043B\u044C\u043A\u043E \u0441\u043D\u0430\u0440\u0443\u0436\u0438");return}$n(e.id),Fe("\u0421\u0432\u043E\u0431\u043E\u0434\u043D\u044B\u0439 \u0432\u0437\u0433\u043B\u044F\u0434: \u0442\u044F\u043D\u0438\u0442\u0435 \u043C\u044B\u0448\u044C\u044E/\u043F\u0430\u043B\u044C\u0446\u0435\u043C")},Bt("compare-btn").onclick=Ad,Bt("compare-btn-2").onclick=Ad,Bt("fav-filter").onclick=()=>{Ut.favOnly=!Ut.favOnly,Bt("fav-filter").classList.toggle("on",Ut.favOnly),Js(),Fe(Ut.favOnly?"\u0422\u043E\u043B\u044C\u043A\u043E \u0438\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0435":"\u0412\u0441\u0435 \u043C\u043E\u0434\u0435\u043B\u0438")},Bt("search").oninput=i=>{Ut.search=i.target.value,Js()},Bt("gl").addEventListener("dblclick",sh),window.addEventListener("keydown",i=>{if(i.target.tagName!=="INPUT")switch(i.key){case"ArrowRight":_l(1);break;case"ArrowLeft":_l(-1);break;case"r":case"R":case"\u043A":case"\u041A":Rd();break;case"f":case"F":case"\u0430":case"\u0410":Pd();break;case"c":case"C":case"\u0441":case"\u0421":Cd();break;case"h":case"H":case"\u0440":case"\u0420":Bt("help-modal").classList.toggle("hidden");break;case"i":case"I":case"\u0448":case"\u0428":sh();break;case"Escape":Bt("help-modal").classList.add("hidden");break;case" ":{i.preventDefault(),Bt("orbit-btn").onclick();break}case"0":$n(_n().views[0].id);break;case"1":case"2":case"3":case"4":case"5":{let t=Number(i.key),e=_n().views.slice(0,5);e[t-1]&&$n(e[t-1].id);break}default:break}}),Bt("d-name").ondblclick=()=>{let i=_n().id;Ut.fav=Ut.fav.includes(i)?Ut.fav.filter(t=>t!==i):[...Ut.fav,i],so(),Js(),Fe(Ut.fav.includes(i)?"\u0414\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u043E \u0432 \u0438\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0435 \u2605":"\u0423\u0431\u0440\u0430\u043D\u043E \u0438\u0437 \u0438\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0433\u043E")}}var ty=new Br;function Od(){requestAnimationFrame(Od);let i=Math.min(.06,ty.getDelta());ts.update(i),Un.renderer.render(Ks,Un.camera)}function ey(){Un.setPreset(Ut.preset),document.querySelectorAll("#dock-env .chip").forEach(t=>t.classList.toggle("active",t.dataset.preset===Ut.preset)),document.querySelectorAll(".cat-tab").forEach(t=>{let e=t.dataset.cat===Ut.cat;t.classList.toggle("active",e),t.setAttribute("aria-selected",String(e))}),Qx();let i=_n();Js(),vl(i),Nd(i),Ud(i),Bt("mode-badge").textContent="\u0421\u041D\u0410\u0420\u0423\u0416\u0418",rh(i,{instant:!0,view:i.views[0]}),Od(),setTimeout(()=>Fe("\u041C\u044B\u0448\u044C \u2014 \u0432\u0440\u0430\u0449\u0430\u0442\u044C \xB7 I \u2014 \u0441\u0435\u0441\u0442\u044C \u0432 \u0441\u0430\u043B\u043E\u043D"),900)}ey();})();
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2026 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
