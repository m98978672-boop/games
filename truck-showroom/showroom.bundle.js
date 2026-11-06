(()=>{var Ki={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},ji={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},Fu=0,ql=1,Ou=2;var bs=1,Qa=2,fr=3,Qi=0,Ke=1,De=2,fi=0,pr=1,Zl=2,$l=3,Jl=4,Bu=5;var Ss=100,ku=101,zu=102,Hu=103,Vu=104,Gu=200,Wu=201,Xu=202,Yu=203,Kl=204,jl=205,qu=206,Zu=207,$u=208,Ju=209,Ku=210,ju=211,Qu=212,td=213,ed=214,_a=0,xa=1,ya=2,js=3,va=4,ba=5,Sa=6,Ma=7,tc=0,nd=1,id=2,ii=0,Ql=1,th=2,eh=3,mr=4,nh=5,ih=6,sh=7;var rh=300,ts=301,Ms=302,gr=303,ec=304,Mo=306,Qs=1e3,li=1001,Ea=1002,an=1003,sd=1004;var Eo=1005;var Ve=1006,nc=1007;var es=1008;var Pn=1009,oh=1010,ah=1011,_r=1012,ic=1013,si=1014,Yn=1015,ri=1016,sc=1017,rc=1018,xr=1020,ch=35902,lh=35899,hh=1021,uh=1022,An=1023,hi=1026,ns=1027,oc=1028,ac=1029,is=1030,cc=1031;var lc=1033,wo=33776,To=33777,Ao=33778,Ro=33779,hc=35840,uc=35841,dc=35842,fc=35843,pc=36196,mc=37492,gc=37496,_c=37488,xc=37489,Co=37490,yc=37491,vc=37808,bc=37809,Sc=37810,Mc=37811,Ec=37812,wc=37813,Tc=37814,Ac=37815,Rc=37816,Cc=37817,Pc=37818,Ic=37819,Lc=37820,Dc=37821,Nc=36492,Uc=36494,Fc=36495,Oc=36283,Bc=36284,Po=36285,kc=36286;var qr=2300,wa=2301,ma=2302,Dl=2303,Nl=2400,Ul=2401,Fl=2402;var rd=3200;var Io=0,od=1,Ci="",$e="srgb",Zr="srgb-linear",$r="linear",Ae="srgb";var ga=7680;var ad=519,cd=512,ld=513,hd=514,zc=515,ud=516,dd=517,Hc=518,fd=519,pd=35044;var dh="300 es",ti=2e3,tr=2001;function Gf(i){for(let t=i.length-1;t>=0;--t)if(i[t]>=65535)return!0;return!1}function Wf(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function Jr(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function md(){let i=Jr("canvas");return i.style.display="block",i}var su={},er=null;function fh(...i){let t="THREE."+i.shift();er?er("log",t,...i):console.log(t,...i)}function gd(i){let t=i[0];if(typeof t=="string"&&t.startsWith("TSL:")){let e=i[1];e&&e.isStackTrace?i[0]+=" "+e.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function ne(...i){i=gd(i);let t="THREE."+i.shift();if(er)er("warn",t,...i);else{let e=i[0];e&&e.isStackTrace?console.warn(e.getError(t)):console.warn(t,...i)}}function re(...i){i=gd(i);let t="THREE."+i.shift();if(er)er("error",t,...i);else{let e=i[0];e&&e.isStackTrace?console.error(e.getError(t)):console.error(t,...i)}}function ms(...i){let t=i.join(" ");t in su||(su[t]=!0,ne(...i))}function _d(i,t,e){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(t,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}var xd={[_a]:xa,[ya]:Sa,[va]:Ma,[js]:ba,[xa]:_a,[Sa]:ya,[Ma]:va,[ba]:js},ei=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){let n=this._listeners;return n===void 0?!1:n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){let n=this._listeners;if(n===void 0)return;let s=n[t];if(s!==void 0){let r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){let e=this._listeners;if(e===void 0)return;let n=e[t.type];if(n!==void 0){t.target=this;let s=n.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,t);t.target=null}}},_n=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],ru=1234567,Gr=Math.PI/180,gs=180/Math.PI;function Es(){let i=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(_n[i&255]+_n[i>>8&255]+_n[i>>16&255]+_n[i>>24&255]+"-"+_n[t&255]+_n[t>>8&255]+"-"+_n[t>>16&15|64]+_n[t>>24&255]+"-"+_n[e&63|128]+_n[e>>8&255]+"-"+_n[e>>16&255]+_n[e>>24&255]+_n[n&255]+_n[n>>8&255]+_n[n>>16&255]+_n[n>>24&255]).toLowerCase()}function he(i,t,e){return Math.max(t,Math.min(e,i))}function ph(i,t){return(i%t+t)%t}function Xf(i,t,e,n,s){return n+(i-t)*(s-n)/(e-t)}function Yf(i,t,e){return i!==t?(e-i)/(t-i):0}function Wr(i,t,e){return(1-e)*i+e*t}function qf(i,t,e,n){return Wr(i,t,1-Math.exp(-e*n))}function Zf(i,t=1){return t-Math.abs(ph(i,t*2)-t)}function $f(i,t,e){return i<=t?0:i>=e?1:(i=(i-t)/(e-t),i*i*(3-2*i))}function Jf(i,t,e){return i<=t?0:i>=e?1:(i=(i-t)/(e-t),i*i*i*(i*(i*6-15)+10))}function Kf(i,t){return i+Math.floor(Math.random()*(t-i+1))}function jf(i,t){return i+Math.random()*(t-i)}function Qf(i){return i*(.5-Math.random())}function tp(i){i!==void 0&&(ru=i);let t=ru+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function ep(i){return i*Gr}function np(i){return i*gs}function ip(i){return i>0&&Number.isInteger(i)&&2**Math.round(Math.log2(i))===i}function sp(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function rp(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function op(i,t,e,n,s){let r=Math.cos,o=Math.sin,a=r(e/2),c=o(e/2),l=r((t+n)/2),h=o((t+n)/2),u=r((t-n)/2),d=o((t-n)/2),f=r((n-t)/2),_=o((n-t)/2);switch(s){case"XYX":i.set(a*h,c*u,c*d,a*l);break;case"YZY":i.set(c*d,a*h,c*u,a*l);break;case"ZXZ":i.set(c*u,c*d,a*h,a*l);break;case"XZX":i.set(a*h,c*_,c*f,a*l);break;case"YXY":i.set(c*f,a*h,c*_,a*l);break;case"ZYZ":i.set(c*_,c*f,a*h,a*l);break;default:ne("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function Js(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:case Uint8ClampedArray:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function wn(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var mh={DEG2RAD:Gr,RAD2DEG:gs,generateUUID:Es,clamp:he,euclideanModulo:ph,mapLinear:Xf,inverseLerp:Yf,lerp:Wr,damp:qf,pingpong:Zf,smoothstep:$f,smootherstep:Jf,randInt:Kf,randFloat:jf,randFloatSpread:Qf,seededRandom:tp,degToRad:ep,radToDeg:np,isPowerOfTwo:ip,ceilPowerOfTwo:sp,floorPowerOfTwo:rp,setQuaternionFromProperEuler:op,normalize:wn,denormalize:Js},bh=class bh{constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,n=this.y,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6],this.y=s[1]*e+s[4]*n+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=he(this.x,t.x,e.x),this.y=he(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=he(this.x,t,e),this.y=he(this.y,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(he(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(he(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let n=Math.cos(e),s=Math.sin(e),r=this.x-t.x,o=this.y-t.y;return this.x=r*n-o*s+t.x,this.y=r*s+o*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};bh.prototype.isVector2=!0;var pt=bh,yn=class{constructor(t=0,e=0,n=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=s}static slerpFlat(t,e,n,s,r,o,a){let c=n[s+0],l=n[s+1],h=n[s+2],u=n[s+3],d=r[o+0],f=r[o+1],_=r[o+2],g=r[o+3];if(u!==g||c!==d||l!==f||h!==_){let m=c*d+l*f+h*_+u*g;m<0&&(d=-d,f=-f,_=-_,g=-g,m=-m);let p=1-a;if(m<.9995){let y=Math.acos(m),S=Math.sin(y);p=Math.sin(p*y)/S,a=Math.sin(a*y)/S,c=c*p+d*a,l=l*p+f*a,h=h*p+_*a,u=u*p+g*a}else{c=c*p+d*a,l=l*p+f*a,h=h*p+_*a,u=u*p+g*a;let y=1/Math.sqrt(c*c+l*l+h*h+u*u);c*=y,l*=y,h*=y,u*=y}}t[e]=c,t[e+1]=l,t[e+2]=h,t[e+3]=u}static multiplyQuaternionsFlat(t,e,n,s,r,o){let a=n[s],c=n[s+1],l=n[s+2],h=n[s+3],u=r[o],d=r[o+1],f=r[o+2],_=r[o+3];return t[e]=a*_+h*u+c*f-l*d,t[e+1]=c*_+h*d+l*u-a*f,t[e+2]=l*_+h*f+a*d-c*u,t[e+3]=h*_-a*u-c*d-l*f,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,s){return this._x=t,this._y=e,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let n=t._x,s=t._y,r=t._z,o=t._order,a=Math.cos,c=Math.sin,l=a(n/2),h=a(s/2),u=a(r/2),d=c(n/2),f=c(s/2),_=c(r/2);switch(o){case"XYZ":this._x=d*h*u+l*f*_,this._y=l*f*u-d*h*_,this._z=l*h*_+d*f*u,this._w=l*h*u-d*f*_;break;case"YXZ":this._x=d*h*u+l*f*_,this._y=l*f*u-d*h*_,this._z=l*h*_-d*f*u,this._w=l*h*u+d*f*_;break;case"ZXY":this._x=d*h*u-l*f*_,this._y=l*f*u+d*h*_,this._z=l*h*_+d*f*u,this._w=l*h*u-d*f*_;break;case"ZYX":this._x=d*h*u-l*f*_,this._y=l*f*u+d*h*_,this._z=l*h*_-d*f*u,this._w=l*h*u+d*f*_;break;case"YZX":this._x=d*h*u+l*f*_,this._y=l*f*u+d*h*_,this._z=l*h*_-d*f*u,this._w=l*h*u-d*f*_;break;case"XZY":this._x=d*h*u-l*f*_,this._y=l*f*u-d*h*_,this._z=l*h*_+d*f*u,this._w=l*h*u+d*f*_;break;default:ne("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let n=e/2,s=Math.sin(n);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,n=e[0],s=e[4],r=e[8],o=e[1],a=e[5],c=e[9],l=e[2],h=e[6],u=e[10],d=n+a+u;if(d>0){let f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(h-c)*f,this._y=(r-l)*f,this._z=(o-s)*f}else if(n>a&&n>u){let f=2*Math.sqrt(1+n-a-u);this._w=(h-c)/f,this._x=.25*f,this._y=(s+o)/f,this._z=(r+l)/f}else if(a>u){let f=2*Math.sqrt(1+a-n-u);this._w=(r-l)/f,this._x=(s+o)/f,this._y=.25*f,this._z=(c+h)/f}else{let f=2*Math.sqrt(1+u-n-a);this._w=(o-s)/f,this._x=(r+l)/f,this._y=(c+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<1e-8?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(he(this.dot(t),-1,1)))}rotateTowards(t,e){let n=this.angleTo(t);if(n===0)return this;let s=Math.min(1,e/n);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let n=t._x,s=t._y,r=t._z,o=t._w,a=e._x,c=e._y,l=e._z,h=e._w;return this._x=n*h+o*a+s*l-r*c,this._y=s*h+o*c+r*a-n*l,this._z=r*h+o*l+n*c-s*a,this._w=o*h-n*a-s*c-r*l,this._onChangeCallback(),this}slerp(t,e){let n=t._x,s=t._y,r=t._z,o=t._w,a=this.dot(t);a<0&&(n=-n,s=-s,r=-r,o=-o,a=-a);let c=1-e;if(a<.9995){let l=Math.acos(a),h=Math.sin(l);c=Math.sin(c*l)/h,e=Math.sin(e*l)/h,this._x=this._x*c+n*e,this._y=this._y*c+s*e,this._z=this._z*c+r*e,this._w=this._w*c+o*e,this._onChangeCallback()}else this._x=this._x*c+n*e,this._y=this._y*c+s*e,this._z=this._z*c+r*e,this._w=this._w*c+o*e,this.normalize();return this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},Sh=class Sh{constructor(t=0,e=0,n=0){this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(ou.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(ou.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*s,this.y=r[1]*e+r[4]*n+r[7]*s,this.z=r[2]*e+r[5]*n+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=t.elements,o=1/(r[3]*e+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*s+r[12])*o,this.y=(r[1]*e+r[5]*n+r[9]*s+r[13])*o,this.z=(r[2]*e+r[6]*n+r[10]*s+r[14])*o,this}applyQuaternion(t){let e=this.x,n=this.y,s=this.z,r=t.x,o=t.y,a=t.z,c=t.w,l=2*(o*s-a*n),h=2*(a*e-r*s),u=2*(r*n-o*e);return this.x=e+c*l+o*u-a*h,this.y=n+c*h+a*l-r*u,this.z=s+c*u+r*h-o*l,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*s,this.y=r[1]*e+r[5]*n+r[9]*s,this.z=r[2]*e+r[6]*n+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=he(this.x,t.x,e.x),this.y=he(this.y,t.y,e.y),this.z=he(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=he(this.x,t,e),this.y=he(this.y,t,e),this.z=he(this.z,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(he(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let n=t.x,s=t.y,r=t.z,o=e.x,a=e.y,c=e.z;return this.x=s*c-r*a,this.y=r*o-n*c,this.z=n*a-s*o,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return ll.copy(this).projectOnVector(t),this.sub(ll)}reflect(t){return this.sub(ll.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(he(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y,s=this.z-t.z;return e*e+n*n+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){let s=Math.sin(e)*t;return this.x=s*Math.sin(n),this.y=Math.cos(e)*t,this.z=s*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};Sh.prototype.isVector3=!0;var D=Sh,ll=new D,ou=new yn,Mh=class Mh{constructor(t,e,n,s,r,o,a,c,l){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,o,a,c,l)}set(t,e,n,s,r,o,a,c,l){let h=this.elements;return h[0]=t,h[1]=s,h[2]=a,h[3]=e,h[4]=r,h[5]=c,h[6]=n,h[7]=o,h[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,o=n[0],a=n[3],c=n[6],l=n[1],h=n[4],u=n[7],d=n[2],f=n[5],_=n[8],g=s[0],m=s[3],p=s[6],y=s[1],S=s[4],v=s[7],M=s[2],E=s[5],A=s[8];return r[0]=o*g+a*y+c*M,r[3]=o*m+a*S+c*E,r[6]=o*p+a*v+c*A,r[1]=l*g+h*y+u*M,r[4]=l*m+h*S+u*E,r[7]=l*p+h*v+u*A,r[2]=d*g+f*y+_*M,r[5]=d*m+f*S+_*E,r[8]=d*p+f*v+_*A,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],c=t[6],l=t[7],h=t[8];return e*o*h-e*a*l-n*r*h+n*a*c+s*r*l-s*o*c}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],c=t[6],l=t[7],h=t[8],u=h*o-a*l,d=a*c-h*r,f=l*r-o*c,_=e*u+n*d+s*f;if(_===0)return this.set(0,0,0,0,0,0,0,0,0);let g=1/_;return t[0]=u*g,t[1]=(s*l-h*n)*g,t[2]=(a*n-s*o)*g,t[3]=d*g,t[4]=(h*e-s*c)*g,t[5]=(s*r-a*e)*g,t[6]=f*g,t[7]=(n*c-l*e)*g,t[8]=(o*e-n*r)*g,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,s,r,o,a){let c=Math.cos(r),l=Math.sin(r);return this.set(n*c,n*l,-n*(c*o+l*a)+o+t,-s*l,s*c,-s*(-l*o+c*a)+a+e,0,0,1),this}scale(t,e){return ms("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(hl.makeScale(t,e)),this}rotate(t){return ms("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(hl.makeRotation(-t)),this}translate(t,e){return ms("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(hl.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<9;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}};Mh.prototype.isMatrix3=!0;var le=Mh,hl=new le,au=new le().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),cu=new le().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function ap(){let i={enabled:!0,workingColorSpace:Zr,spaces:{},convert:function(s,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===Ae&&(s.r=Ei(s.r),s.g=Ei(s.g),s.b=Ei(s.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===Ae&&(s.r=Ks(s.r),s.g=Ks(s.g),s.b=Ks(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Ci?$r:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,o){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return ms("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return ms("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[Zr]:{primaries:t,whitePoint:n,transfer:$r,toXYZ:au,fromXYZ:cu,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:$e},outputColorSpaceConfig:{drawingBufferColorSpace:$e}},[$e]:{primaries:t,whitePoint:n,transfer:Ae,toXYZ:au,fromXYZ:cu,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:$e}}}),i}var xe=ap();function Ei(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Ks(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var Fs,Ta=class{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement=="undefined")return t.src;let n;if(t instanceof HTMLCanvasElement)n=t;else{Fs===void 0&&(Fs=Jr("canvas")),Fs.width=t.width,Fs.height=t.height;let s=Fs.getContext("2d");t instanceof ImageData?s.putImageData(t,0,0):s.drawImage(t,0,0,t.width,t.height),n=Fs}return n.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement!="undefined"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement!="undefined"&&t instanceof HTMLCanvasElement||typeof ImageBitmap!="undefined"&&t instanceof ImageBitmap){let e=Jr("canvas");e.width=t.width,e.height=t.height;let n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);let s=n.getImageData(0,0,t.width,t.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=Ei(r[o]/255)*255;return n.putImageData(s,0,0),e}else if(t.data){let e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(Ei(e[n]/255)*255):e[n]=Ei(e[n]);return{data:e,width:t.width,height:t.height}}else return ne("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},cp=0,nr=class{constructor(t=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:cp++}),this.uuid=Es(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let e=this.data;return typeof HTMLVideoElement!="undefined"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):typeof VideoFrame!="undefined"&&e instanceof VideoFrame?t.set(e.displayWidth,e.displayHeight,0):e!==null?t.set(e.width,e.height,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(ul(s[o].image)):r.push(ul(s[o]))}else r=ul(s);n.url=r}return e||(t.images[this.uuid]=n),n}};function ul(i){return typeof HTMLImageElement!="undefined"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement!="undefined"&&i instanceof HTMLCanvasElement||typeof ImageBitmap!="undefined"&&i instanceof ImageBitmap?Ta.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(ne("Texture: Unable to serialize Texture."),{})}var lp=0,dl=new D,Tn=class i extends ei{constructor(t=i.DEFAULT_IMAGE,e=i.DEFAULT_MAPPING,n=li,s=li,r=Ve,o=es,a=An,c=Pn,l=i.DEFAULT_ANISOTROPY,h=Ci){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:lp++}),this.uuid=Es(),this.name="",this.source=new nr(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=l,this.format=a,this.internalFormat=null,this.type=c,this.offset=new pt(0,0),this.repeat=new pt(1,1),this.center=new pt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new le,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(dl).x}get height(){return this.source.getSize(dl).y}get depth(){return this.source.getSize(dl).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let e in t){let n=t[e];if(n===void 0){ne(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){ne(`Texture.setValues(): property '${e}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==rh)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case Qs:t.x=t.x-Math.floor(t.x);break;case li:t.x=t.x<0?0:1;break;case Ea:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case Qs:t.y=t.y-Math.floor(t.y);break;case li:t.y=t.y<0?0:1;break;case Ea:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};Tn.DEFAULT_IMAGE=null;Tn.DEFAULT_MAPPING=rh;Tn.DEFAULT_ANISOTROPY=1;var Eh=class Eh{constructor(t=0,e=0,n=0,s=1){this.x=t,this.y=e,this.z=n,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=this.w,o=t.elements;return this.x=o[0]*e+o[4]*n+o[8]*s+o[12]*r,this.y=o[1]*e+o[5]*n+o[9]*s+o[13]*r,this.z=o[2]*e+o[6]*n+o[10]*s+o[14]*r,this.w=o[3]*e+o[7]*n+o[11]*s+o[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,s,r,c=t.elements,l=c[0],h=c[4],u=c[8],d=c[1],f=c[5],_=c[9],g=c[2],m=c[6],p=c[10];if(Math.abs(h-d)<.01&&Math.abs(u-g)<.01&&Math.abs(_-m)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+g)<.1&&Math.abs(_+m)<.1&&Math.abs(l+f+p-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let S=(l+1)/2,v=(f+1)/2,M=(p+1)/2,E=(h+d)/4,A=(u+g)/4,x=(_+m)/4;return S>v&&S>M?S<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(S),s=E/n,r=A/n):v>M?v<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(v),n=E/s,r=x/s):M<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(M),n=A/r,s=x/r),this.set(n,s,r,e),this}let y=Math.sqrt((m-_)*(m-_)+(u-g)*(u-g)+(d-h)*(d-h));return Math.abs(y)<.001&&(y=1),this.x=(m-_)/y,this.y=(u-g)/y,this.z=(d-h)/y,this.w=Math.acos((l+f+p-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=he(this.x,t.x,e.x),this.y=he(this.y,t.y,e.y),this.z=he(this.z,t.z,e.z),this.w=he(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=he(this.x,t,e),this.y=he(this.y,t,e),this.z=he(this.z,t,e),this.w=he(this.w,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(he(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};Eh.prototype.isVector4=!0;var Be=Eh,Aa=class extends ei{constructor(t=1,e=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Ve,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=n.depth,this.scissor=new Be(0,0,t,e),this.scissorTest=!1,this.viewport=new Be(0,0,t,e),this.textures=[];let s={width:t,height:e,depth:n.depth},r=new Tn(s),o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(t={}){let e={minFilter:Ve,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),t!==null&&t.renderTarget===null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,n=t.textures.length;e<n;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;let s=Object.assign({},t.textures[e].image);this.textures[e].source=new nr(s)}if(this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveColorBuffer=t.resolveColorBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,this.storeMultisampledColorBuffer=t.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=t.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=t.storeMultisampledStencilBuffer,t.depthTexture!==null)if(t.depthTexture.renderTarget===t){let e=t.depthTexture.clone();e.renderTarget=null,this.depthTexture=e}else this.depthTexture=t.depthTexture;return this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},Rn=class extends Aa{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}},Kr=class extends Tn{constructor(t=null,e=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=an,this.minFilter=an,this.wrapR=li,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var Ra=class extends Tn{constructor(t=null,e=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=an,this.minFilter=an,this.wrapR=li,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}};var ja=class ja{constructor(t,e,n,s,r,o,a,c,l,h,u,d,f,_,g,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,o,a,c,l,h,u,d,f,_,g,m)}set(t,e,n,s,r,o,a,c,l,h,u,d,f,_,g,m){let p=this.elements;return p[0]=t,p[4]=e,p[8]=n,p[12]=s,p[1]=r,p[5]=o,p[9]=a,p[13]=c,p[2]=l,p[6]=h,p[10]=u,p[14]=d,p[3]=f,p[7]=_,p[11]=g,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new ja().fromArray(this.elements)}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){let e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return this.determinantAffine()===0?(t.set(1,0,0),e.set(0,1,0),n.set(0,0,1),this):(t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();let e=this.elements,n=t.elements,s=1/Os.setFromMatrixColumn(t,0).length(),r=1/Os.setFromMatrixColumn(t,1).length(),o=1/Os.setFromMatrixColumn(t,2).length();return e[0]=n[0]*s,e[1]=n[1]*s,e[2]=n[2]*s,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*o,e[9]=n[9]*o,e[10]=n[10]*o,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,n=t.x,s=t.y,r=t.z,o=Math.cos(n),a=Math.sin(n),c=Math.cos(s),l=Math.sin(s),h=Math.cos(r),u=Math.sin(r);if(t.order==="XYZ"){let d=o*h,f=o*u,_=a*h,g=a*u;e[0]=c*h,e[4]=-c*u,e[8]=l,e[1]=f+_*l,e[5]=d-g*l,e[9]=-a*c,e[2]=g-d*l,e[6]=_+f*l,e[10]=o*c}else if(t.order==="YXZ"){let d=c*h,f=c*u,_=l*h,g=l*u;e[0]=d+g*a,e[4]=_*a-f,e[8]=o*l,e[1]=o*u,e[5]=o*h,e[9]=-a,e[2]=f*a-_,e[6]=g+d*a,e[10]=o*c}else if(t.order==="ZXY"){let d=c*h,f=c*u,_=l*h,g=l*u;e[0]=d-g*a,e[4]=-o*u,e[8]=_+f*a,e[1]=f+_*a,e[5]=o*h,e[9]=g-d*a,e[2]=-o*l,e[6]=a,e[10]=o*c}else if(t.order==="ZYX"){let d=o*h,f=o*u,_=a*h,g=a*u;e[0]=c*h,e[4]=_*l-f,e[8]=d*l+g,e[1]=c*u,e[5]=g*l+d,e[9]=f*l-_,e[2]=-l,e[6]=a*c,e[10]=o*c}else if(t.order==="YZX"){let d=o*c,f=o*l,_=a*c,g=a*l;e[0]=c*h,e[4]=g-d*u,e[8]=_*u+f,e[1]=u,e[5]=o*h,e[9]=-a*h,e[2]=-l*h,e[6]=f*u+_,e[10]=d-g*u}else if(t.order==="XZY"){let d=o*c,f=o*l,_=a*c,g=a*l;e[0]=c*h,e[4]=-u,e[8]=l*h,e[1]=d*u+g,e[5]=o*h,e[9]=f*u-_,e[2]=_*u-f,e[6]=a*h,e[10]=g*u+d}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(hp,t,up)}lookAt(t,e,n){let s=this.elements;return Nn.subVectors(t,e),Nn.lengthSq()===0&&(Nn.z=1),Nn.normalize(),Fi.crossVectors(n,Nn),Fi.lengthSq()===0&&(Math.abs(n.z)===1?Nn.x+=1e-4:Nn.z+=1e-4,Nn.normalize(),Fi.crossVectors(n,Nn)),Fi.normalize(),qo.crossVectors(Nn,Fi),s[0]=Fi.x,s[4]=qo.x,s[8]=Nn.x,s[1]=Fi.y,s[5]=qo.y,s[9]=Nn.y,s[2]=Fi.z,s[6]=qo.z,s[10]=Nn.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,o=n[0],a=n[4],c=n[8],l=n[12],h=n[1],u=n[5],d=n[9],f=n[13],_=n[2],g=n[6],m=n[10],p=n[14],y=n[3],S=n[7],v=n[11],M=n[15],E=s[0],A=s[4],x=s[8],w=s[12],C=s[1],L=s[5],P=s[9],O=s[13],F=s[2],X=s[6],q=s[10],N=s[14],Z=s[3],V=s[7],Y=s[11],J=s[15];return r[0]=o*E+a*C+c*F+l*Z,r[4]=o*A+a*L+c*X+l*V,r[8]=o*x+a*P+c*q+l*Y,r[12]=o*w+a*O+c*N+l*J,r[1]=h*E+u*C+d*F+f*Z,r[5]=h*A+u*L+d*X+f*V,r[9]=h*x+u*P+d*q+f*Y,r[13]=h*w+u*O+d*N+f*J,r[2]=_*E+g*C+m*F+p*Z,r[6]=_*A+g*L+m*X+p*V,r[10]=_*x+g*P+m*q+p*Y,r[14]=_*w+g*O+m*N+p*J,r[3]=y*E+S*C+v*F+M*Z,r[7]=y*A+S*L+v*X+M*V,r[11]=y*x+S*P+v*q+M*Y,r[15]=y*w+S*O+v*N+M*J,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[4],s=t[8],r=t[12],o=t[1],a=t[5],c=t[9],l=t[13],h=t[2],u=t[6],d=t[10],f=t[14],_=t[3],g=t[7],m=t[11],p=t[15],y=c*f-l*d,S=a*f-l*u,v=a*d-c*u,M=o*f-l*h,E=o*d-c*h,A=o*u-a*h;return e*(g*y-m*S+p*v)-n*(_*y-m*M+p*E)+s*(_*S-g*M+p*A)-r*(_*v-g*E+m*A)}determinantAffine(){let t=this.elements,e=t[0],n=t[4],s=t[8],r=t[1],o=t[5],a=t[9],c=t[2],l=t[6],h=t[10];return e*(o*h-a*l)-n*(r*h-a*c)+s*(r*l-o*c)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){let s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=n),this}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],c=t[6],l=t[7],h=t[8],u=t[9],d=t[10],f=t[11],_=t[12],g=t[13],m=t[14],p=t[15],y=e*a-n*o,S=e*c-s*o,v=e*l-r*o,M=n*c-s*a,E=n*l-r*a,A=s*l-r*c,x=h*g-u*_,w=h*m-d*_,C=h*p-f*_,L=u*m-d*g,P=u*p-f*g,O=d*p-f*m,F=y*O-S*P+v*L+M*C-E*w+A*x;if(F===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let X=1/F;return t[0]=(a*O-c*P+l*L)*X,t[1]=(s*P-n*O-r*L)*X,t[2]=(g*A-m*E+p*M)*X,t[3]=(d*E-u*A-f*M)*X,t[4]=(c*C-o*O-l*w)*X,t[5]=(e*O-s*C+r*w)*X,t[6]=(m*v-_*A-p*S)*X,t[7]=(h*A-d*v+f*S)*X,t[8]=(o*P-a*C+l*x)*X,t[9]=(n*C-e*P-r*x)*X,t[10]=(_*E-g*v+p*y)*X,t[11]=(u*v-h*E-f*y)*X,t[12]=(a*w-o*L-c*x)*X,t[13]=(e*L-n*w+s*x)*X,t[14]=(g*S-_*M-m*y)*X,t[15]=(h*M-u*S+d*y)*X,this}scale(t){let e=this.elements,n=t.x,s=t.y,r=t.z;return e[0]*=n,e[4]*=s,e[8]*=r,e[1]*=n,e[5]*=s,e[9]*=r,e[2]*=n,e[6]*=s,e[10]*=r,e[3]*=n,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,s))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let n=Math.cos(e),s=Math.sin(e),r=1-n,o=t.x,a=t.y,c=t.z,l=r*o,h=r*a;return this.set(l*o+n,l*a-s*c,l*c+s*a,0,l*a+s*c,h*a+n,h*c-s*o,0,l*c-s*a,h*c+s*o,r*c*c+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,s,r,o){return this.set(1,n,r,0,t,1,o,0,e,s,1,0,0,0,0,1),this}compose(t,e,n){let s=this.elements,r=e._x,o=e._y,a=e._z,c=e._w,l=r+r,h=o+o,u=a+a,d=r*l,f=r*h,_=r*u,g=o*h,m=o*u,p=a*u,y=c*l,S=c*h,v=c*u,M=n.x,E=n.y,A=n.z;return s[0]=(1-(g+p))*M,s[1]=(f+v)*M,s[2]=(_-S)*M,s[3]=0,s[4]=(f-v)*E,s[5]=(1-(d+p))*E,s[6]=(m+y)*E,s[7]=0,s[8]=(_+S)*A,s[9]=(m-y)*A,s[10]=(1-(d+g))*A,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,n){let s=this.elements;t.x=s[12],t.y=s[13],t.z=s[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),e.identity(),this;let o=Os.set(s[0],s[1],s[2]).length(),a=Os.set(s[4],s[5],s[6]).length(),c=Os.set(s[8],s[9],s[10]).length();r<0&&(o=-o),Kn.copy(this);let l=1/o,h=1/a,u=1/c;return Kn.elements[0]*=l,Kn.elements[1]*=l,Kn.elements[2]*=l,Kn.elements[4]*=h,Kn.elements[5]*=h,Kn.elements[6]*=h,Kn.elements[8]*=u,Kn.elements[9]*=u,Kn.elements[10]*=u,e.setFromRotationMatrix(Kn),n.x=o,n.y=a,n.z=c,this}makePerspective(t,e,n,s,r,o,a=ti,c=!1){let l=this.elements,h=2*r/(e-t),u=2*r/(n-s),d=(e+t)/(e-t),f=(n+s)/(n-s),_,g;if(c)_=r/(o-r),g=o*r/(o-r);else if(a===ti)_=-(o+r)/(o-r),g=-2*o*r/(o-r);else if(a===tr)_=-o/(o-r),g=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=h,l[4]=0,l[8]=d,l[12]=0,l[1]=0,l[5]=u,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=_,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(t,e,n,s,r,o,a=ti,c=!1){let l=this.elements,h=2/(e-t),u=2/(n-s),d=-(e+t)/(e-t),f=-(n+s)/(n-s),_,g;if(c)_=1/(o-r),g=o/(o-r);else if(a===ti)_=-2/(o-r),g=-(o+r)/(o-r);else if(a===tr)_=-1/(o-r),g=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=h,l[4]=0,l[8]=0,l[12]=d,l[1]=0,l[5]=u,l[9]=0,l[13]=f,l[2]=0,l[6]=0,l[10]=_,l[14]=g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<16;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}};ja.prototype.isMatrix4=!0;var Pe=ja,Os=new D,Kn=new Pe,hp=new D(0,0,0),up=new D(1,1,1),Fi=new D,qo=new D,Nn=new D,lu=new Pe,hu=new yn,ui=class i{constructor(t=0,e=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,s=this._order){return this._x=t,this._y=e,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){let s=t.elements,r=s[0],o=s[4],a=s[8],c=s[1],l=s[5],h=s[9],u=s[2],d=s[6],f=s[10];switch(e){case"XYZ":this._y=Math.asin(he(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(d,l),this._z=0);break;case"YXZ":this._x=Math.asin(-he(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(he(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-o,l)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-he(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-o,l));break;case"YZX":this._z=Math.asin(he(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-h,l),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-he(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,l),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,f),this._y=0);break;default:ne("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return lu.makeRotationFromQuaternion(t),this.setFromRotationMatrix(lu,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return hu.setFromEuler(this),this.setFromQuaternion(hu,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};ui.DEFAULT_ORDER="XYZ";var ir=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},dp=0,uu=new D,Bs=new yn,yi=new Pe,Zo=new D,Fr=new D,fp=new D,pp=new yn,du=new D(1,0,0),fu=new D(0,1,0),pu=new D(0,0,1),mu={type:"added"},mp={type:"removed"},ks={type:"childadded",child:null},fl={type:"childremoved",child:null},Je=class i extends ei{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:dp++}),this.uuid=Es(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let t=new D,e=new ui,n=new yn,s=new D(1,1,1);function r(){n.setFromEuler(e,!1)}function o(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Pe},normalMatrix:{value:new le}}),this.matrix=new Pe,this.matrixWorld=new Pe,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new ir,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Bs.setFromAxisAngle(t,e),this.quaternion.multiply(Bs),this}rotateOnWorldAxis(t,e){return Bs.setFromAxisAngle(t,e),this.quaternion.premultiply(Bs),this}rotateX(t){return this.rotateOnAxis(du,t)}rotateY(t){return this.rotateOnAxis(fu,t)}rotateZ(t){return this.rotateOnAxis(pu,t)}translateOnAxis(t,e){return uu.copy(t).applyQuaternion(this.quaternion),this.position.add(uu.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(du,t)}translateY(t){return this.translateOnAxis(fu,t)}translateZ(t){return this.translateOnAxis(pu,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(yi.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?Zo.copy(t):Zo.set(t,e,n);let s=this.parent;this.updateWorldMatrix(!0,!1),Fr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?yi.lookAt(Fr,Zo,this.up):yi.lookAt(Zo,Fr,this.up),this.quaternion.setFromRotationMatrix(yi),s&&(yi.extractRotation(s.matrixWorld),Bs.setFromRotationMatrix(yi),this.quaternion.premultiply(Bs.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(re("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(mu),ks.child=t,this.dispatchEvent(ks),ks.child=null):re("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(mp),fl.child=t,this.dispatchEvent(fl),fl.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),yi.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),yi.multiply(t.parent.matrixWorld)),t.applyMatrix4(yi),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(mu),ks.child=t,this.dispatchEvent(ks),ks.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,s=this.children.length;n<s;n++){let o=this.children[n].getObjectByProperty(t,e);if(o!==void 0)return o}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Fr,t,fp),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Fr,pp,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(t){t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let e=t.x,n=t.y,s=t.z,r=this.matrix.elements;r[12]+=e-r[0]*e-r[4]*n-r[8]*s,r[13]+=n-r[1]*e-r[5]*n-r[9]*s,r[14]+=s-r[2]*e-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e,n=!1){let s=this.parent;if(t===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),e===!0){let r=this.children;for(let o=0,a=r.length;o<a;o++)r[o].updateWorldMatrix(!1,!0,n)}}toJSON(t){let e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(a=>({...a})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(t),s.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(a,c){return a[c.uuid]===void 0&&(a[c.uuid]=c.toJSON(t)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let c=a.shapes;if(Array.isArray(c))for(let l=0,h=c.length;l<h;l++){let u=c[l];r(t.shapes,u)}else r(t.shapes,c)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let c=0,l=this.material.length;c<l;c++)a.push(r(t.materials,this.material[c]));s.material=a}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){let c=this.animations[a];s.animations.push(r(t.animations,c))}}if(e){let a=o(t.geometries),c=o(t.materials),l=o(t.textures),h=o(t.images),u=o(t.shapes),d=o(t.skeletons),f=o(t.animations),_=o(t.nodes);a.length>0&&(n.geometries=a),c.length>0&&(n.materials=c),l.length>0&&(n.textures=l),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),d.length>0&&(n.skeletons=d),f.length>0&&(n.animations=f),_.length>0&&(n.nodes=_)}return n.object=s,n;function o(a){let c=[];for(let l in a){let h=a[l];delete h.metadata,c.push(h)}return c}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){let s=t.children[n];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};Je.DEFAULT_UP=new D(0,1,0);Je.DEFAULT_MATRIX_AUTO_UPDATE=!0;Je.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var dn=class extends Je{constructor(){super(),this.isGroup=!0,this.type="Group"}},gp={type:"move"},sr=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new dn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new dn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new D,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new D),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new dn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new D,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new D,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let s=null,r=null,o=null,a=this._targetRay,c=this._grip,l=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(l&&t.hand){o=!0;for(let g of t.hand.values()){let m=e.getJointPose(g,n),p=this._getHandJoint(l,g);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}let h=l.joints["index-finger-tip"],u=l.joints["thumb-tip"],d=h.position.distanceTo(u.position),f=.02,_=.005;l.inputState.pinching&&d>f+_?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!l.inputState.pinching&&d<=f-_&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else c!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1,c.eventsEnabled&&c.dispatchEvent({type:"gripUpdated",data:t,target:this})));a!==null&&(s=e.getPose(t.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(gp)))}return a!==null&&(a.visible=s!==null),c!==null&&(c.visible=r!==null),l!==null&&(l.visible=o!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let n=new dn;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}},yd={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Oi={h:0,s:0,l:0},$o={h:0,s:0,l:0};function pl(i,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?i+(t-i)*6*e:e<1/2?t:e<2/3?i+(t-i)*6*(2/3-e):i}var te=class{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){let s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=$e){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,xe.colorSpaceToWorking(this,e),this}setRGB(t,e,n,s=xe.workingColorSpace){return this.r=t,this.g=e,this.b=n,xe.colorSpaceToWorking(this,s),this}setHSL(t,e,n,s=xe.workingColorSpace){if(t=ph(t,1),e=he(e,0,1),n=he(n,0,1),e===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+e):n+e-n*e,o=2*n-r;this.r=pl(o,r,t+1/3),this.g=pl(o,r,t),this.b=pl(o,r,t-1/3)}return xe.colorSpaceToWorking(this,s),this}setStyle(t,e=$e){function n(r){r!==void 0&&parseFloat(r)<1&&ne("Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r,o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:ne("Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){let r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(o===6)return this.setHex(parseInt(r,16),e);ne("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=$e){let n=yd[t.toLowerCase()];return n!==void 0?this.setHex(n,e):ne("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Ei(t.r),this.g=Ei(t.g),this.b=Ei(t.b),this}copyLinearToSRGB(t){return this.r=Ks(t.r),this.g=Ks(t.g),this.b=Ks(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=$e){return xe.workingToColorSpace(xn.copy(this),t),Math.round(he(xn.r*255,0,255))*65536+Math.round(he(xn.g*255,0,255))*256+Math.round(he(xn.b*255,0,255))}getHexString(t=$e){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=xe.workingColorSpace){xe.workingToColorSpace(xn.copy(this),e);let n=xn.r,s=xn.g,r=xn.b,o=Math.max(n,s,r),a=Math.min(n,s,r),c,l,h=(a+o)/2;if(a===o)c=0,l=0;else{let u=o-a;switch(l=h<=.5?u/(o+a):u/(2-o-a),o){case n:c=(s-r)/u+(s<r?6:0);break;case s:c=(r-n)/u+2;break;case r:c=(n-s)/u+4;break}c/=6}return t.h=c,t.s=l,t.l=h,t}getRGB(t,e=xe.workingColorSpace){return xe.workingToColorSpace(xn.copy(this),e),t.r=xn.r,t.g=xn.g,t.b=xn.b,t}getStyle(t=$e){xe.workingToColorSpace(xn.copy(this),t);let e=xn.r,n=xn.g,s=xn.b;return t!==$e?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(t,e,n){return this.getHSL(Oi),this.setHSL(Oi.h+t,Oi.s+e,Oi.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(Oi),t.getHSL($o);let n=Wr(Oi.h,$o.h,e),s=Wr(Oi.s,$o.s,e),r=Wr(Oi.l,$o.l,e);return this.setHSL(n,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,n=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*s,this.g=r[1]*e+r[4]*n+r[7]*s,this.b=r[2]*e+r[5]*n+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},xn=new te;te.NAMES=yd;var rr=class i{constructor(t,e=1,n=1e3){this.isFog=!0,this.name="",this.color=new te(t),this.near=e,this.far=n}clone(){return new i(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},Vi=class extends Je{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new ui,this.environmentIntensity=1,this.environmentRotation=new ui,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__!="undefined"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),e.object.backgroundBlurriness=this.backgroundBlurriness,e.object.backgroundIntensity=this.backgroundIntensity,e.object.backgroundRotation=this.backgroundRotation.toArray(),e.object.environmentIntensity=this.environmentIntensity,e.object.environmentRotation=this.environmentRotation.toArray(),e}},jn=new D,vi=new D,ml=new D,bi=new D,zs=new D,Hs=new D,gu=new D,gl=new D,_l=new D,xl=new D,yl=new Be,vl=new Be,bl=new Be,Hi=class i{constructor(t=new D,e=new D,n=new D){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,s){s.subVectors(n,e),jn.subVectors(t,e),s.cross(jn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,n,s,r){jn.subVectors(s,e),vi.subVectors(n,e),ml.subVectors(t,e);let o=jn.dot(jn),a=jn.dot(vi),c=jn.dot(ml),l=vi.dot(vi),h=vi.dot(ml),u=o*l-a*a;if(u===0)return r.set(0,0,0),null;let d=1/u,f=(l*c-a*h)*d,_=(o*h-a*c)*d;return r.set(1-f-_,_,f)}static containsPoint(t,e,n,s){return this.getBarycoord(t,e,n,s,bi)===null?!1:bi.x>=0&&bi.y>=0&&bi.x+bi.y<=1}static getInterpolation(t,e,n,s,r,o,a,c){return this.getBarycoord(t,e,n,s,bi)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,bi.x),c.addScaledVector(o,bi.y),c.addScaledVector(a,bi.z),c)}static getInterpolatedAttribute(t,e,n,s,r,o){return yl.setScalar(0),vl.setScalar(0),bl.setScalar(0),yl.fromBufferAttribute(t,e),vl.fromBufferAttribute(t,n),bl.fromBufferAttribute(t,s),o.setScalar(0),o.addScaledVector(yl,r.x),o.addScaledVector(vl,r.y),o.addScaledVector(bl,r.z),o}static isFrontFacing(t,e,n,s){return jn.subVectors(n,e),vi.subVectors(t,e),jn.cross(vi).dot(s)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,s){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,n,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return jn.subVectors(this.c,this.b),vi.subVectors(this.a,this.b),jn.cross(vi).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return i.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return i.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,s,r){return i.getInterpolation(t,this.a,this.b,this.c,e,n,s,r)}containsPoint(t){return i.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return i.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let n=this.a,s=this.b,r=this.c,o,a;zs.subVectors(s,n),Hs.subVectors(r,n),gl.subVectors(t,n);let c=zs.dot(gl),l=Hs.dot(gl);if(c<=0&&l<=0)return e.copy(n);_l.subVectors(t,s);let h=zs.dot(_l),u=Hs.dot(_l);if(h>=0&&u<=h)return e.copy(s);let d=c*u-h*l;if(d<=0&&c>=0&&h<=0)return o=c/(c-h),e.copy(n).addScaledVector(zs,o);xl.subVectors(t,r);let f=zs.dot(xl),_=Hs.dot(xl);if(_>=0&&f<=_)return e.copy(r);let g=f*l-c*_;if(g<=0&&l>=0&&_<=0)return a=l/(l-_),e.copy(n).addScaledVector(Hs,a);let m=h*_-f*u;if(m<=0&&u-h>=0&&f-_>=0)return gu.subVectors(r,s),a=(u-h)/(u-h+(f-_)),e.copy(s).addScaledVector(gu,a);let p=1/(m+g+d);return o=g*p,a=d*p,e.copy(n).addScaledVector(zs,o).addScaledVector(Hs,a)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},di=class{constructor(t=new D(1/0,1/0,1/0),e=new D(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(Qn.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(Qn.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let n=Qn.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let n=t.geometry;if(n!==void 0){let r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)t.isMesh===!0?t.getVertexPosition(o,Qn):Qn.fromBufferAttribute(r,o),Qn.applyMatrix4(t.matrixWorld),this.expandByPoint(Qn);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Jo.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Jo.copy(n.boundingBox)),Jo.applyMatrix4(t.matrixWorld),this.union(Jo)}let s=t.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,Qn),Qn.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Or),Ko.subVectors(this.max,Or),Vs.subVectors(t.a,Or),Gs.subVectors(t.b,Or),Ws.subVectors(t.c,Or),Bi.subVectors(Gs,Vs),ki.subVectors(Ws,Gs),hs.subVectors(Vs,Ws);let e=[0,-Bi.z,Bi.y,0,-ki.z,ki.y,0,-hs.z,hs.y,Bi.z,0,-Bi.x,ki.z,0,-ki.x,hs.z,0,-hs.x,-Bi.y,Bi.x,0,-ki.y,ki.x,0,-hs.y,hs.x,0];return!Sl(e,Vs,Gs,Ws,Ko)||(e=[1,0,0,0,1,0,0,0,1],!Sl(e,Vs,Gs,Ws,Ko))?!1:(jo.crossVectors(Bi,ki),e=[jo.x,jo.y,jo.z],Sl(e,Vs,Gs,Ws,Ko))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,Qn).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(Qn).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(Si[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),Si[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),Si[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),Si[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),Si[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),Si[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),Si[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),Si[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(Si),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}},Si=[new D,new D,new D,new D,new D,new D,new D,new D],Qn=new D,Jo=new di,Vs=new D,Gs=new D,Ws=new D,Bi=new D,ki=new D,hs=new D,Or=new D,Ko=new D,jo=new D,us=new D;function Sl(i,t,e,n,s){for(let r=0,o=i.length-3;r<=o;r+=3){us.fromArray(i,r);let a=s.x*Math.abs(us.x)+s.y*Math.abs(us.y)+s.z*Math.abs(us.z),c=t.dot(us),l=e.dot(us),h=n.dot(us);if(Math.max(-Math.max(c,l,h),Math.min(c,l,h))>a)return!1}return!0}var Ze=new D,Qo=new pt,_p=0,On=class extends ei{constructor(t,e,n=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:_p++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=pd,this.updateRanges=[],this.gpuType=Yn,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[n+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)Qo.fromBufferAttribute(this,e),Qo.applyMatrix3(t),this.setXY(e,Qo.x,Qo.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)Ze.fromBufferAttribute(this,e),Ze.applyMatrix3(t),this.setXYZ(e,Ze.x,Ze.y,Ze.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)Ze.fromBufferAttribute(this,e),Ze.applyMatrix4(t),this.setXYZ(e,Ze.x,Ze.y,Ze.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)Ze.fromBufferAttribute(this,e),Ze.applyNormalMatrix(t),this.setXYZ(e,Ze.x,Ze.y,Ze.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)Ze.fromBufferAttribute(this,e),Ze.transformDirection(t),this.setXYZ(e,Ze.x,Ze.y,Ze.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=Js(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=wn(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=Js(e,this.array)),e}setX(t,e){return this.normalized&&(e=wn(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=Js(e,this.array)),e}setY(t,e){return this.normalized&&(e=wn(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=Js(e,this.array)),e}setZ(t,e){return this.normalized&&(e=wn(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=Js(e,this.array)),e}setW(t,e){return this.normalized&&(e=wn(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=wn(e,this.array),n=wn(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,s){return t*=this.itemSize,this.normalized&&(e=wn(e,this.array),n=wn(n,this.array),s=wn(s,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t*=this.itemSize,this.normalized&&(e=wn(e,this.array),n=wn(n,this.array),s=wn(s,this.array),r=wn(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return t.name=this.name,t.usage=this.usage,t.gpuType=this.gpuType,t}dispose(){this.dispatchEvent({type:"dispose"})}};var jr=class extends On{constructor(t,e,n){super(new Uint16Array(t),e,n)}};var Qr=class extends On{constructor(t,e,n){super(new Uint32Array(t),e,n)}};var ye=class extends On{constructor(t,e,n){super(new Float32Array(t),e,n)}},xp=new di,Br=new D,Ml=new D,Gi=class{constructor(t=new D,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let n=this.center;e!==void 0?n.copy(e):xp.setFromPoints(t).getCenter(n);let s=0;for(let r=0,o=t.length;r<o;r++)s=Math.max(s,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Br.subVectors(t,this.center);let e=Br.lengthSq();if(e>this.radius*this.radius){let n=Math.sqrt(e),s=(n-this.radius)*.5;this.center.addScaledVector(Br,s/n),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Ml.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Br.copy(t.center).add(Ml)),this.expandByPoint(Br.copy(t.center).sub(Ml))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}},yp=0,Xn=new Pe,El=new Je,Xs=new D,Un=new di,kr=new di,on=new D,Ge=class i extends ei{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:yp++}),this.uuid=Es(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(Gf(t)?Qr:jr)(t,1):this.index=t,this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new le().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return Xn.makeRotationFromQuaternion(t),this.applyMatrix4(Xn),this}rotateX(t){return Xn.makeRotationX(t),this.applyMatrix4(Xn),this}rotateY(t){return Xn.makeRotationY(t),this.applyMatrix4(Xn),this}rotateZ(t){return Xn.makeRotationZ(t),this.applyMatrix4(Xn),this}translate(t,e,n){return Xn.makeTranslation(t,e,n),this.applyMatrix4(Xn),this}scale(t,e,n){return Xn.makeScale(t,e,n),this.applyMatrix4(Xn),this}lookAt(t){return El.lookAt(t),El.updateMatrix(),this.applyMatrix4(El.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Xs).negate(),this.translate(Xs.x,Xs.y,Xs.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let n=[];for(let s=0,r=t.length;s<r;s++){let o=t[s];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new ye(n,3))}else{let n=Math.min(t.length,e.count);for(let s=0;s<n;s++){let r=t[s];e.setXYZ(s,r.x,r.y,r.z||0)}t.length>e.count&&ne("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new di);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){re("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new D(-1/0,-1/0,-1/0),new D(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,s=e.length;n<s;n++){let r=e[n];Un.setFromBufferAttribute(r),this.morphTargetsRelative?(on.addVectors(this.boundingBox.min,Un.min),this.boundingBox.expandByPoint(on),on.addVectors(this.boundingBox.max,Un.max),this.boundingBox.expandByPoint(on)):(this.boundingBox.expandByPoint(Un.min),this.boundingBox.expandByPoint(Un.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&re('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Gi);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){re("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new D,1/0);return}if(t){let n=this.boundingSphere.center;if(Un.setFromBufferAttribute(t),e)for(let r=0,o=e.length;r<o;r++){let a=e[r];kr.setFromBufferAttribute(a),this.morphTargetsRelative?(on.addVectors(Un.min,kr.min),Un.expandByPoint(on),on.addVectors(Un.max,kr.max),Un.expandByPoint(on)):(Un.expandByPoint(kr.min),Un.expandByPoint(kr.max))}Un.getCenter(n);let s=0;for(let r=0,o=t.count;r<o;r++)on.fromBufferAttribute(t,r),s=Math.max(s,n.distanceToSquared(on));if(e)for(let r=0,o=e.length;r<o;r++){let a=e[r],c=this.morphTargetsRelative;for(let l=0,h=a.count;l<h;l++)on.fromBufferAttribute(a,l),c&&(Xs.fromBufferAttribute(t,l),on.add(Xs)),s=Math.max(s,n.distanceToSquared(on))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&re('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){re("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=e.position,s=e.normal,r=e.uv,o=this.getAttribute("tangent");(o===void 0||o.count!==n.count)&&(o=new On(new Float32Array(4*n.count),4),this.setAttribute("tangent",o));let a=[],c=[];for(let x=0;x<n.count;x++)a[x]=new D,c[x]=new D;let l=new D,h=new D,u=new D,d=new pt,f=new pt,_=new pt,g=new D,m=new D;function p(x,w,C){l.fromBufferAttribute(n,x),h.fromBufferAttribute(n,w),u.fromBufferAttribute(n,C),d.fromBufferAttribute(r,x),f.fromBufferAttribute(r,w),_.fromBufferAttribute(r,C),h.sub(l),u.sub(l),f.sub(d),_.sub(d);let L=1/(f.x*_.y-_.x*f.y);isFinite(L)&&(g.copy(h).multiplyScalar(_.y).addScaledVector(u,-f.y).multiplyScalar(L),m.copy(u).multiplyScalar(f.x).addScaledVector(h,-_.x).multiplyScalar(L),a[x].add(g),a[w].add(g),a[C].add(g),c[x].add(m),c[w].add(m),c[C].add(m))}let y=this.groups;y.length===0&&(y=[{start:0,count:t.count}]);for(let x=0,w=y.length;x<w;++x){let C=y[x],L=C.start,P=C.count;for(let O=L,F=L+P;O<F;O+=3)p(t.getX(O+0),t.getX(O+1),t.getX(O+2))}let S=new D,v=new D,M=new D,E=new D;function A(x){M.fromBufferAttribute(s,x),E.copy(M);let w=a[x];S.copy(w),S.sub(M.multiplyScalar(M.dot(w))).normalize(),v.crossVectors(E,w);let L=v.dot(c[x])<0?-1:1;o.setXYZW(x,S.x,S.y,S.z,L)}for(let x=0,w=y.length;x<w;++x){let C=y[x],L=C.start,P=C.count;for(let O=L,F=L+P;O<F;O+=3)A(t.getX(O+0)),A(t.getX(O+1)),A(t.getX(O+2))}this._transformed=!0}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==e.count)n=new On(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let d=0,f=n.count;d<f;d++)n.setXYZ(d,0,0,0);let s=new D,r=new D,o=new D,a=new D,c=new D,l=new D,h=new D,u=new D;if(t)for(let d=0,f=t.count;d<f;d+=3){let _=t.getX(d+0),g=t.getX(d+1),m=t.getX(d+2);s.fromBufferAttribute(e,_),r.fromBufferAttribute(e,g),o.fromBufferAttribute(e,m),h.subVectors(o,r),u.subVectors(s,r),h.cross(u),a.fromBufferAttribute(n,_),c.fromBufferAttribute(n,g),l.fromBufferAttribute(n,m),a.add(h),c.add(h),l.add(h),n.setXYZ(_,a.x,a.y,a.z),n.setXYZ(g,c.x,c.y,c.z),n.setXYZ(m,l.x,l.y,l.z)}else for(let d=0,f=e.count;d<f;d+=3)s.fromBufferAttribute(e,d+0),r.fromBufferAttribute(e,d+1),o.fromBufferAttribute(e,d+2),h.subVectors(o,r),u.subVectors(s,r),h.cross(u),n.setXYZ(d+0,h.x,h.y,h.z),n.setXYZ(d+1,h.x,h.y,h.z),n.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)on.fromBufferAttribute(t,e),on.normalize(),t.setXYZ(e,on.x,on.y,on.z)}toNonIndexed(){function t(a,c){let l=a.array,h=a.itemSize,u=a.normalized,d=new l.constructor(c.length*h),f=0,_=0;for(let g=0,m=c.length;g<m;g++){a.isInterleavedBufferAttribute?f=c[g]*a.data.stride+a.offset:f=c[g]*h;for(let p=0;p<h;p++)d[_++]=l[f++]}return new On(d,h,u)}if(this.index===null)return ne("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new i,n=this.index.array,s=this.attributes;for(let a in s){let c=s[a],l=t(c,n);e.setAttribute(a,l)}let r=this.morphAttributes;for(let a in r){let c=[],l=r[a];for(let h=0,u=l.length;h<u;h++){let d=l[h],f=t(d,n);c.push(f)}e.morphAttributes[a]=c}e.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,c=o.length;a<c;a++){let l=o[a];e.addGroup(l.start,l.count,l.materialIndex)}return e}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let c=this.parameters;for(let l in c)c[l]!==void 0&&(t[l]=c[l]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let n=this.attributes;for(let c in n){let l=n[c];t.data.attributes[c]=l.toJSON(t.data)}let s={},r=!1;for(let c in this.morphAttributes){let l=this.morphAttributes[c],h=[];for(let u=0,d=l.length;u<d;u++){let f=l[u];h.push(f.toJSON(t.data))}h.length>0&&(s[c]=h,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(t.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(t.data.boundingSphere=a.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let n=t.index;n!==null&&this.setIndex(n.clone());let s=t.attributes;for(let l in s){let h=s[l];this.setAttribute(l,h.clone(e))}let r=t.morphAttributes;for(let l in r){let h=[],u=r[l];for(let d=0,f=u.length;d<f;d++)h.push(u[d].clone(e));this.morphAttributes[l]=h}this.morphTargetsRelative=t.morphTargetsRelative;let o=t.groups;for(let l=0,h=o.length;l<h;l++){let u=o[l];this.addGroup(u.start,u.count,u.materialIndex)}let a=t.boundingBox;a!==null&&(this.boundingBox=a.clone());let c=t.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var wl=new D,vp=new D,bp=new le,Fn=class{constructor(t=new D(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,s){return this.normal.set(t,e,n),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){let s=wl.subVectors(n,e).cross(vp.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e,n=!0){let s=t.delta(wl),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let o=-(t.start.dot(this.normal)+this.constant)/r;return n===!0&&(o<0||o>1)?null:e.copy(t.start).addScaledVector(s,o)}intersectsLine(t){let e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let n=e||bp.getNormalMatrix(t),s=this.coplanarPoint(wl).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(t){return this.normal.fromArray(t.normal),this.constant=t.constant,this}},Sp=0,wi=class extends ei{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Sp++}),this.uuid=Es(),this.name="",this.type="Material",this.blending=pr,this.side=Qi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Kl,this.blendDst=jl,this.blendEquation=Ss,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new te(0,0,0),this.blendAlpha=0,this.depthFunc=js,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=ad,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=ga,this.stencilZFail=ga,this.stencilZPass=ga,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let n=t[e];if(n===void 0){ne(`Material: parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){ne(`Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let o=[];for(let a in r){let c=r[a];delete c.metadata,o.push(c)}return o}if(e){let r=s(t.textures),o=s(t.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}fromJSON(t,e){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new te().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.retroreflectivity!==void 0&&(this.retroreflectivity=t.retroreflectivity),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=t.iridescenceThicknessRange),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.clippingPlanes!==void 0&&(this.clippingPlanes=t.clippingPlanes.map(n=>new Fn().fromJSON(n))),t.clipIntersection!==void 0&&(this.clipIntersection=t.clipIntersection),t.clipShadows!==void 0&&(this.clipShadows=t.clipShadows),t.depthPacking!==void 0&&(this.depthPacking=t.depthPacking),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.linecap!==void 0&&(this.linecap=t.linecap),t.linejoin!==void 0&&(this.linejoin=t.linejoin),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=e[t.map]||null),t.matcap!==void 0&&(this.matcap=e[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=e[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=e[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=e[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let n=t.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new pt().fromArray(n)}return t.displacementMap!==void 0&&(this.displacementMap=e[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=e[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=e[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=e[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=e[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=e[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=e[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=e[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=e[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=e[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=e[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=e[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=e[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=e[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new pt().fromArray(t.clearcoatNormalScale)),t.iridescenceMap!==void 0&&(this.iridescenceMap=e[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=e[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=e[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=e[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=e[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=e[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=e[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,n=null;if(e!==null){let s=e.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}};var Mi=new D,Tl=new D,ta=new D,ea=new D,_s=class{constructor(t=new D,e=new D(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Mi)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=Mi.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(Mi.copy(this.origin).addScaledVector(this.direction,e),Mi.distanceToSquared(t))}distanceSqToSegment(t,e,n,s){Tl.copy(t).add(e).multiplyScalar(.5),ta.copy(e).sub(t).normalize(),ea.copy(this.origin).sub(Tl);let r=t.distanceTo(e)*.5,o=-this.direction.dot(ta),a=ea.dot(this.direction),c=-ea.dot(ta),l=ea.lengthSq(),h=Math.abs(1-o*o),u,d,f,_;if(h>0)if(u=o*c-a,d=o*a-c,_=r*h,u>=0)if(d>=-_)if(d<=_){let g=1/h;u*=g,d*=g,f=u*(u+o*d+2*a)+d*(o*u+d+2*c)+l}else d=r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*c)+l;else d=-r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*c)+l;else d<=-_?(u=Math.max(0,-(-o*r+a)),d=u>0?-r:Math.min(Math.max(-r,-c),r),f=-u*u+d*(d+2*c)+l):d<=_?(u=0,d=Math.min(Math.max(-r,-c),r),f=d*(d+2*c)+l):(u=Math.max(0,-(o*r+a)),d=u>0?r:Math.min(Math.max(-r,-c),r),f=-u*u+d*(d+2*c)+l);else d=o>0?-r:r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*c)+l;return n&&n.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(Tl).addScaledVector(ta,d),f}intersectSphere(t,e){if(t.radius<0)return null;Mi.subVectors(t.center,this.origin);let n=Mi.dot(this.direction),s=Mi.dot(Mi)-n*n,r=t.radius*t.radius;if(s>r)return null;let o=Math.sqrt(r-s),a=n-o,c=n+o;return c<0?null:a<0?this.at(c,e):this.at(a,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){let n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,s,r,o,a,c,l=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return l>=0?(n=(t.min.x-d.x)*l,s=(t.max.x-d.x)*l):(n=(t.max.x-d.x)*l,s=(t.min.x-d.x)*l),h>=0?(r=(t.min.y-d.y)*h,o=(t.max.y-d.y)*h):(r=(t.max.y-d.y)*h,o=(t.min.y-d.y)*h),n>o||r>s||((r>n||isNaN(n))&&(n=r),(o<s||isNaN(s))&&(s=o),u>=0?(a=(t.min.z-d.z)*u,c=(t.max.z-d.z)*u):(a=(t.max.z-d.z)*u,c=(t.min.z-d.z)*u),n>c||a>s)||((a>n||n!==n)&&(n=a),(c<s||s!==s)&&(s=c),s<0)?null:this.at(n>=0?n:s,e)}intersectsBox(t){return this.intersectBox(t,Mi)!==null}intersectTriangle(t,e,n,s,r){let o=this.origin,a=this.direction,c=a.x,l=a.y,h=a.z,u=t.x-o.x,d=t.y-o.y,f=t.z-o.z,_=e.x-o.x,g=e.y-o.y,m=e.z-o.z,p=n.x-o.x,y=n.y-o.y,S=n.z-o.z,v=Math.abs(c),M=Math.abs(l),E=Math.abs(h),A,x,w,C,L,P,O,F,X,q,N,Z;if(v>=M&&v>=E?(w=c,P=u,X=_,Z=p,c>=0?(A=l,x=h,C=d,L=f,O=g,F=m,q=y,N=S):(A=h,x=l,C=f,L=d,O=m,F=g,q=S,N=y)):M>=E?(w=l,P=d,X=g,Z=y,l>=0?(A=h,x=c,C=f,L=u,O=m,F=_,q=S,N=p):(A=c,x=h,C=u,L=f,O=_,F=m,q=p,N=S)):(w=h,P=f,X=m,Z=S,h>=0?(A=c,x=l,C=u,L=d,O=_,F=g,q=p,N=y):(A=l,x=c,C=d,L=u,O=g,F=_,q=y,N=p)),w===0)return null;let V=A/w,Y=x/w,J=1/w,Rt=C-V*P,bt=L-Y*P,ie=O-V*X,Lt=F-Y*X,oe=q-V*Z,et=N-Y*Z,W=oe*Lt-et*ie,ht=Rt*et-bt*oe,lt=ie*bt-Lt*Rt;if(s){if(W<0||ht<0||lt<0)return null}else if((W<0||ht<0||lt<0)&&(W>0||ht>0||lt>0))return null;let ut=W+ht+lt;if(ut===0)return null;let ot=J*(W*P+ht*X+lt*Z);return(ut>0?ot<0:ot>0)?null:this.at(ot/ut,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Ti=class extends wi{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new te(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ui,this.combine=tc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}},_u=new Pe,ds=new _s,na=new Gi,xu=new D,ia=new D,sa=new D,ra=new D,Al=new D,oa=new D,yu=new D,aa=new D,Dt=class extends Je{constructor(t=new Ge,e=new Ti){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(t,e){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;e.fromBufferAttribute(s,t);let a=this.morphTargetInfluences;if(r&&a){oa.set(0,0,0);for(let c=0,l=r.length;c<l;c++){let h=a[c],u=r[c];h!==0&&(Al.fromBufferAttribute(u,t),o?oa.addScaledVector(Al,h):oa.addScaledVector(Al.sub(e),h))}e.add(oa)}return e}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),na.copy(n.boundingSphere),na.applyMatrix4(r),ds.copy(t.ray).recast(t.near),!(na.containsPoint(ds.origin)===!1&&(ds.intersectSphere(na,xu)===null||ds.origin.distanceToSquared(xu)>(t.far-t.near)**2))&&(_u.copy(r).invert(),ds.copy(t.ray).applyMatrix4(_u),!(n.boundingBox!==null&&ds.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,ds)))}_computeIntersections(t,e,n){let s,r=this.geometry,o=this.material,a=r.index,c=r.attributes.position,l=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,d=r.groups,f=r.drawRange;if(a!==null)if(Array.isArray(o))for(let _=0,g=d.length;_<g;_++){let m=d[_],p=o[m.materialIndex],y=Math.max(m.start,f.start),S=Math.min(a.count,Math.min(m.start+m.count,f.start+f.count));for(let v=y,M=S;v<M;v+=3){let E=a.getX(v),A=a.getX(v+1),x=a.getX(v+2);s=ca(this,p,t,n,l,h,u,E,A,x),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{let _=Math.max(0,f.start),g=Math.min(a.count,f.start+f.count);for(let m=_,p=g;m<p;m+=3){let y=a.getX(m),S=a.getX(m+1),v=a.getX(m+2);s=ca(this,o,t,n,l,h,u,y,S,v),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}else if(c!==void 0)if(Array.isArray(o))for(let _=0,g=d.length;_<g;_++){let m=d[_],p=o[m.materialIndex],y=Math.max(m.start,f.start),S=Math.min(c.count,Math.min(m.start+m.count,f.start+f.count));for(let v=y,M=S;v<M;v+=3){let E=v,A=v+1,x=v+2;s=ca(this,p,t,n,l,h,u,E,A,x),s&&(s.faceIndex=Math.floor(v/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{let _=Math.max(0,f.start),g=Math.min(c.count,f.start+f.count);for(let m=_,p=g;m<p;m+=3){let y=m,S=m+1,v=m+2;s=ca(this,o,t,n,l,h,u,y,S,v),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}}};function Mp(i,t,e,n,s,r,o,a){let c;if(t.side===Ke?c=n.intersectTriangle(o,r,s,!0,a):c=n.intersectTriangle(s,r,o,t.side===Qi,a),c===null)return null;aa.copy(a),aa.applyMatrix4(i.matrixWorld);let l=e.ray.origin.distanceTo(aa);return l<e.near||l>e.far?null:{distance:l,point:aa.clone(),object:i}}function ca(i,t,e,n,s,r,o,a,c,l){i.getVertexPosition(a,ia),i.getVertexPosition(c,sa),i.getVertexPosition(l,ra);let h=Mp(i,t,e,n,ia,sa,ra,yu);if(h){let u=new D;Hi.getBarycoord(yu,ia,sa,ra,u),s&&(h.uv=Hi.getInterpolatedAttribute(s,a,c,l,u,new pt)),r&&(h.uv1=Hi.getInterpolatedAttribute(r,a,c,l,u,new pt)),o&&(h.normal=Hi.getInterpolatedAttribute(o,a,c,l,u,new D),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));let d={a,b:c,c:l,normal:new D,materialIndex:0};Hi.getNormal(ia,sa,ra,d.normal),h.face=d,h.barycoord=u}return h}var Wi=class extends Tn{constructor(t=null,e=1,n=1,s,r,o,a,c,l=an,h=an,u,d){super(null,o,a,c,l,h,s,r,u,d),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var to=class extends On{constructor(t,e,n,s=1){super(t,e,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){let t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}},Ys=new Pe,vu=new Pe,la=[],bu=new di,Ep=new Pe,zr=new Dt,Hr=new Gi,eo=class extends Dt{constructor(t,e,n){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new to(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,Ep)}computeBoundingBox(){let t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new di),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,Ys),bu.copy(t.boundingBox).applyMatrix4(Ys),this.boundingBox.union(bu)}computeBoundingSphere(){let t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new Gi),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,Ys),Hr.copy(t.boundingSphere).applyMatrix4(Ys),this.boundingSphere.union(Hr)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){return this.instanceColor===null?e.setRGB(1,1,1):e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){return e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){let n=e.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,o=t*r+1;for(let a=0;a<n.length;a++)n[a]=s[o+a]}raycast(t,e){let n=this.matrixWorld,s=this.count;if(zr.geometry=this.geometry,zr.material=this.material,zr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Hr.copy(this.boundingSphere),Hr.applyMatrix4(n),t.ray.intersectsSphere(Hr)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,Ys),vu.multiplyMatrices(n,Ys),zr.matrixWorld=vu,zr.raycast(t,la);for(let o=0,a=la.length;o<a;o++){let c=la[o];c.instanceId=r,c.object=this,e.push(c)}la.length=0}}setColorAt(t,e){return this.instanceColor===null&&(this.instanceColor=new to(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3),this}setMatrixAt(t,e){return e.toArray(this.instanceMatrix.array,t*16),this}setMorphAt(t,e){let n=e.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new Wi(new Float32Array(s*this.count),s,this.count,oc,Yn));let r=this.morphTexture.source.data.data,o=0;for(let l=0;l<n.length;l++)o+=n[l];let a=this.geometry.morphTargetsRelative?1:1-o,c=s*t;return r[c]=a,r.set(n,c+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},fs=new Gi,wp=new pt(.5,.5),ha=new D,or=class{constructor(t=new Fn,e=new Fn,n=new Fn,s=new Fn,r=new Fn,o=new Fn){this.planes=[t,e,n,s,r,o]}set(t,e,n,s,r,o){let a=this.planes;return a[0].copy(t),a[1].copy(e),a[2].copy(n),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(t){let e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=ti,n=!1){let s=this.planes,r=t.elements,o=r[0],a=r[1],c=r[2],l=r[3],h=r[4],u=r[5],d=r[6],f=r[7],_=r[8],g=r[9],m=r[10],p=r[11],y=r[12],S=r[13],v=r[14],M=r[15];if(s[0].setComponents(l-o,f-h,p-_,M-y).normalize(),s[1].setComponents(l+o,f+h,p+_,M+y).normalize(),s[2].setComponents(l+a,f+u,p+g,M+S).normalize(),s[3].setComponents(l-a,f-u,p-g,M-S).normalize(),n)s[4].setComponents(c,d,m,v).normalize(),s[5].setComponents(l-c,f-d,p-m,M-v).normalize();else if(s[4].setComponents(l-c,f-d,p-m,M-v).normalize(),e===ti)s[5].setComponents(l+c,f+d,p+m,M+v).normalize();else if(e===tr)s[5].setComponents(c,d,m,v).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),fs.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),fs.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(fs)}intersectsSprite(t){fs.center.set(0,0,0);let e=wp.distanceTo(t.center);return fs.radius=.7071067811865476+e,fs.applyMatrix4(t.matrixWorld),this.intersectsSphere(fs)}intersectsSphere(t){let e=this.planes,n=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(t){let e=this.planes;for(let n=0;n<6;n++){let s=e[n];if(ha.x=s.normal.x>0?t.max.x:t.min.x,ha.y=s.normal.y>0?t.max.y:t.min.y,ha.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(ha)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var no=class extends Tn{constructor(t=[],e=ts,n,s,r,o,a,c,l,h){super(t,e,n,s,r,o,a,c,l,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},io=class extends Tn{constructor(t,e,n,s,r,o,a,c,l){super(t,e,n,s,r,o,a,c,l),this.isCanvasTexture=!0,this.needsUpdate=!0}};var Xi=class extends Tn{constructor(t,e,n=si,s,r,o,a=an,c=an,l,h=hi,u=1){if(h!==hi&&h!==ns)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let d={width:t,height:e,depth:u};super(d,s,r,o,a,c,h,n,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new nr(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return e.compareFunction=this.compareFunction,e}},Ca=class extends Xi{constructor(t,e=si,n=ts,s,r,o=an,a=an,c,l=hi){let h={width:t,height:t,depth:1},u=[h,h,h,h,h,h];super(t,t,e,n,s,r,o,a,c,l),this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}},so=class extends Tn{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}},fn=class i extends Ge{constructor(t=1,e=1,n=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:s,heightSegments:r,depthSegments:o};let a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);let c=[],l=[],h=[],u=[],d=0,f=0;_("z","y","x",-1,-1,n,e,t,o,r,0),_("z","y","x",1,-1,n,e,-t,o,r,1),_("x","z","y",1,1,t,n,e,s,o,2),_("x","z","y",1,-1,t,n,-e,s,o,3),_("x","y","z",1,-1,t,e,n,s,r,4),_("x","y","z",-1,-1,t,e,-n,s,r,5),this.setIndex(c),this.setAttribute("position",new ye(l,3)),this.setAttribute("normal",new ye(h,3)),this.setAttribute("uv",new ye(u,2));function _(g,m,p,y,S,v,M,E,A,x,w){let C=v/A,L=M/x,P=v/2,O=M/2,F=E/2,X=A+1,q=x+1,N=0,Z=0,V=new D;for(let Y=0;Y<q;Y++){let J=Y*L-O;for(let Rt=0;Rt<X;Rt++){let bt=Rt*C-P;V[g]=bt*y,V[m]=J*S,V[p]=F,l.push(V.x,V.y,V.z),V[g]=0,V[m]=0,V[p]=E>0?1:-1,h.push(V.x,V.y,V.z),u.push(Rt/A),u.push(1-Y/x),N+=1}}for(let Y=0;Y<x;Y++)for(let J=0;J<A;J++){let Rt=d+J+X*Y,bt=d+J+X*(Y+1),ie=d+(J+1)+X*(Y+1),Lt=d+(J+1)+X*Y;c.push(Rt,bt,Lt),c.push(bt,ie,Lt),Z+=6}a.addGroup(f,Z,w),f+=Z,d+=N}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};var Ie=class i extends Ge{constructor(t=1,e=1,n=1,s=32,r=1,o=!1,a=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:c};let l=this;s=Math.floor(s),r=Math.floor(r);let h=[],u=[],d=[],f=[],_=0,g=[],m=n/2,p=0;y(),o===!1&&(t>0&&S(!0),e>0&&S(!1)),this.setIndex(h),this.setAttribute("position",new ye(u,3)),this.setAttribute("normal",new ye(d,3)),this.setAttribute("uv",new ye(f,2));function y(){let v=new D,M=new D,E=0,A=(e-t)/n;for(let x=0;x<=r;x++){let w=[],C=x/r,L=C*(e-t)+t;for(let P=0;P<=s;P++){let O=P/s,F=O*c+a,X=Math.sin(F),q=Math.cos(F);M.x=L*X,M.y=-C*n+m,M.z=L*q,u.push(M.x,M.y,M.z),v.set(X,A,q).normalize(),d.push(v.x,v.y,v.z),f.push(O,1-C),w.push(_++)}g.push(w)}for(let x=0;x<s;x++)for(let w=0;w<r;w++){let C=g[w][x],L=g[w+1][x],P=g[w+1][x+1],O=g[w][x+1];(t>0||w!==0)&&(h.push(C,L,O),E+=3),(e>0||w!==r-1)&&(h.push(L,P,O),E+=3)}l.addGroup(p,E,0),p+=E}function S(v){let M=_,E=new pt,A=new D,x=0,w=v===!0?t:e,C=v===!0?1:-1;for(let P=1;P<=s;P++)u.push(0,m*C,0),d.push(0,C,0),f.push(.5,.5),_++;let L=_;for(let P=0;P<=s;P++){let F=P/s*c+a,X=Math.cos(F),q=Math.sin(F);A.x=w*q,A.y=m*C,A.z=w*X,u.push(A.x,A.y,A.z),d.push(0,C,0),E.x=X*.5+.5,E.y=q*.5*C+.5,f.push(E.x,E.y),_++}for(let P=0;P<s;P++){let O=M+P,F=L+P;v===!0?h.push(F,F+1,O):h.push(F+1,F,O),x+=3}l.addGroup(p,x,v===!0?1:2),p+=x}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}};var Pa=class i extends Ge{constructor(t=[],e=[],n=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:n,detail:s};let r=[],o=[];a(s),l(n),h(),this.setAttribute("position",new ye(r,3)),this.setAttribute("normal",new ye(r.slice(),3)),this.setAttribute("uv",new ye(o,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function a(y){let S=new D,v=new D,M=new D;for(let E=0;E<e.length;E+=3)f(e[E+0],S),f(e[E+1],v),f(e[E+2],M),c(S,v,M,y)}function c(y,S,v,M){let E=M+1,A=[];for(let x=0;x<=E;x++){A[x]=[];let w=y.clone().lerp(v,x/E),C=S.clone().lerp(v,x/E),L=E-x;for(let P=0;P<=L;P++)P===0&&x===E?A[x][P]=w:A[x][P]=w.clone().lerp(C,P/L)}for(let x=0;x<E;x++)for(let w=0;w<2*(E-x)-1;w++){let C=Math.floor(w/2);w%2===0?(d(A[x][C+1]),d(A[x+1][C]),d(A[x][C])):(d(A[x][C+1]),d(A[x+1][C+1]),d(A[x+1][C]))}}function l(y){let S=new D;for(let v=0;v<r.length;v+=3)S.x=r[v+0],S.y=r[v+1],S.z=r[v+2],S.normalize().multiplyScalar(y),r[v+0]=S.x,r[v+1]=S.y,r[v+2]=S.z}function h(){let y=new D;for(let S=0;S<r.length;S+=3){y.x=r[S+0],y.y=r[S+1],y.z=r[S+2];let v=m(y)/2/Math.PI+.5,M=p(y)/Math.PI+.5;o.push(v,1-M)}_(),u()}function u(){for(let y=0;y<o.length;y+=6){let S=o[y+0],v=o[y+2],M=o[y+4],E=Math.max(S,v,M),A=Math.min(S,v,M);E>.9&&A<.1&&(S<.2&&(o[y+0]+=1),v<.2&&(o[y+2]+=1),M<.2&&(o[y+4]+=1))}}function d(y){r.push(y.x,y.y,y.z)}function f(y,S){let v=y*3;S.x=t[v+0],S.y=t[v+1],S.z=t[v+2]}function _(){let y=new D,S=new D,v=new D,M=new D,E=new pt,A=new pt,x=new pt;for(let w=0,C=0;w<r.length;w+=9,C+=6){y.set(r[w+0],r[w+1],r[w+2]),S.set(r[w+3],r[w+4],r[w+5]),v.set(r[w+6],r[w+7],r[w+8]),E.set(o[C+0],o[C+1]),A.set(o[C+2],o[C+3]),x.set(o[C+4],o[C+5]),M.copy(y).add(S).add(v).divideScalar(3);let L=m(M);g(E,C+0,y,L),g(A,C+2,S,L),g(x,C+4,v,L)}}function g(y,S,v,M){M<0&&y.x===1&&(o[S]=y.x-1),v.x===0&&v.z===0&&(o[S]=M/2/Math.PI+.5)}function m(y){return Math.atan2(y.z,-y.x)}function p(y){return Math.atan2(-y.y,Math.sqrt(y.x*y.x+y.z*y.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.vertices,t.indices,t.radius,t.detail)}},ar=class i extends Pa{constructor(t=1,e=0){let n=(1+Math.sqrt(5))/2,s=1/n,r=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-s,-n,0,-s,n,0,s,-n,0,s,n,-s,-n,0,-s,n,0,s,-n,0,s,n,0,-n,0,-s,n,0,-s,-n,0,s,n,0,s],o=[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9];super(r,o,t,e),this.type="DodecahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new i(t.radius,t.detail)}};var Bn=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){ne("Curve: .getPoint() not implemented.")}getPointAt(t,e){let n=this.getUtoTmapping(t);return this.getPoint(n,e)}getPoints(t=5){let e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return e}getSpacedPoints(t=5){let e=[];for(let n=0;n<=t;n++)e.push(this.getPointAt(n/t));return e}getLength(){let t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let e=[],n,s=this.getPoint(0),r=0;e.push(0);for(let o=1;o<=t;o++)n=this.getPoint(o/t),r+=n.distanceTo(s),e.push(r),s=n;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e=null){let n=this.getLengths(),s=0,r=n.length,o;e?o=e:o=t*n[r-1];let a=0,c=r-1,l;for(;a<=c;)if(s=Math.floor(a+(c-a)/2),l=n[s]-o,l<0)a=s+1;else if(l>0)c=s-1;else{c=s;break}if(s=c,n[s]===o)return s/(r-1);let h=n[s],d=n[s+1]-h,f=(o-h)/d;return(s+f)/(r-1)}getTangent(t,e){let s=t-1e-4,r=t+1e-4;s<0&&(s=0),r>1&&(r=1);let o=this.getPoint(s),a=this.getPoint(r),c=e||(o.isVector2?new pt:new D);return c.copy(a).sub(o).normalize(),c}getTangentAt(t,e){let n=this.getUtoTmapping(t);return this.getTangent(n,e)}computeFrenetFrames(t,e=!1){let n=new D,s=[],r=[],o=[],a=new D,c=new Pe;for(let f=0;f<=t;f++){let _=f/t;s[f]=this.getTangentAt(_,new D)}r[0]=new D,o[0]=new D;let l=Number.MAX_VALUE,h=Math.abs(s[0].x),u=Math.abs(s[0].y),d=Math.abs(s[0].z);h<=l&&(l=h,n.set(1,0,0)),u<=l&&(l=u,n.set(0,1,0)),d<=l&&n.set(0,0,1),a.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],a),o[0].crossVectors(s[0],r[0]);for(let f=1;f<=t;f++){if(r[f]=r[f-1].clone(),o[f]=o[f-1].clone(),a.crossVectors(s[f-1],s[f]),a.length()>Number.EPSILON){a.normalize();let _=Math.acos(he(s[f-1].dot(s[f]),-1,1));r[f].applyMatrix4(c.makeRotationAxis(a,_))}o[f].crossVectors(s[f],r[f])}if(e===!0){let f=Math.acos(he(r[0].dot(r[t]),-1,1));f/=t,s[0].dot(a.crossVectors(r[0],r[t]))>0&&(f=-f);for(let _=1;_<=t;_++)r[_].applyMatrix4(c.makeRotationAxis(s[_],f*_)),o[_].crossVectors(s[_],r[_])}return{tangents:s,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){let t={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}},cr=class extends Bn{constructor(t=0,e=0,n=1,s=1,r=0,o=Math.PI*2,a=!1,c=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=c}getPoint(t,e=new pt){let n=e,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(o?r=0:r=s),this.aClockwise===!0&&!o&&(r===s?r=-s:r=r-s);let a=this.aStartAngle+t*r,c=this.aX+this.xRadius*Math.cos(a),l=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),d=c-this.aX,f=l-this.aY;c=d*h-f*u+this.aX,l=d*u+f*h+this.aY}return n.set(c,l)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){let t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}},Ia=class extends cr{constructor(t,e,n,s,r,o){super(t,e,n,n,s,r,o),this.isArcCurve=!0,this.type="ArcCurve"}};function gh(){let i=0,t=0,e=0,n=0;function s(r,o,a,c){i=r,t=a,e=-3*r+3*o-2*a-c,n=2*r-2*o+a+c}return{initCatmullRom:function(r,o,a,c,l){s(o,a,l*(a-r),l*(c-o))},initNonuniformCatmullRom:function(r,o,a,c,l,h,u){let d=(o-r)/l-(a-r)/(l+h)+(a-o)/h,f=(a-o)/h-(c-o)/(h+u)+(c-a)/u;d*=h,f*=h,s(o,a,d,f)},calc:function(r){let o=r*r,a=o*r;return i+t*r+e*o+n*a}}}var Su=new D,Mu=new D,Rl=new gh,Cl=new gh,Pl=new gh,La=class extends Bn{constructor(t=[],e=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=n,this.tension=s}getPoint(t,e=new D){let n=e,s=this.points,r=s.length,o=(r-(this.closed?0:1))*t,a=Math.floor(o),c=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:c===0&&a===r-1&&(a=r-2,c=1);let l,h;this.closed||a>0?l=s[(a-1)%r]:(Mu.subVectors(s[0],s[1]).add(s[0]),l=Mu);let u=s[a%r],d=s[(a+1)%r];if(this.closed||a+2<r?h=s[(a+2)%r]:(Su.subVectors(s[r-1],s[r-2]).add(s[r-1]),h=Su),this.curveType==="centripetal"||this.curveType==="chordal"){let f=this.curveType==="chordal"?.5:.25,_=Math.pow(l.distanceToSquared(u),f),g=Math.pow(u.distanceToSquared(d),f),m=Math.pow(d.distanceToSquared(h),f);g<1e-4&&(g=1),_<1e-4&&(_=g),m<1e-4&&(m=g),Rl.initNonuniformCatmullRom(l.x,u.x,d.x,h.x,_,g,m),Cl.initNonuniformCatmullRom(l.y,u.y,d.y,h.y,_,g,m),Pl.initNonuniformCatmullRom(l.z,u.z,d.z,h.z,_,g,m)}else this.curveType==="catmullrom"&&(Rl.initCatmullRom(l.x,u.x,d.x,h.x,this.tension),Cl.initCatmullRom(l.y,u.y,d.y,h.y,this.tension),Pl.initCatmullRom(l.z,u.z,d.z,h.z,this.tension));return n.set(Rl.calc(c),Cl.calc(c),Pl.calc(c)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(s.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){let s=this.points[e];t.points.push(s.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(new D().fromArray(s))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}};function Eu(i,t,e,n,s){let r=(n-t)*.5,o=(s-e)*.5,a=i*i,c=i*a;return(2*e-2*n+r+o)*c+(-3*e+3*n-2*r-o)*a+r*i+e}function Tp(i,t){let e=1-i;return e*e*t}function Ap(i,t){return 2*(1-i)*i*t}function Rp(i,t){return i*i*t}function Xr(i,t,e,n){return Tp(i,t)+Ap(i,e)+Rp(i,n)}function Cp(i,t){let e=1-i;return e*e*e*t}function Pp(i,t){let e=1-i;return 3*e*e*i*t}function Ip(i,t){return 3*(1-i)*i*i*t}function Lp(i,t){return i*i*i*t}function Yr(i,t,e,n,s){return Cp(i,t)+Pp(i,e)+Ip(i,n)+Lp(i,s)}var ro=class extends Bn{constructor(t=new pt,e=new pt,n=new pt,s=new pt){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new pt){let n=e,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(Yr(t,s.x,r.x,o.x,a.x),Yr(t,s.y,r.y,o.y,a.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},Da=class extends Bn{constructor(t=new D,e=new D,n=new D,s=new D){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new D){let n=e,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(Yr(t,s.x,r.x,o.x,a.x),Yr(t,s.y,r.y,o.y,a.y),Yr(t,s.z,r.z,o.z,a.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},oo=class extends Bn{constructor(t=new pt,e=new pt){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new pt){let n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new pt){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Na=class extends Bn{constructor(t=new D,e=new D){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new D){let n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new D){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},ao=class extends Bn{constructor(t=new pt,e=new pt,n=new pt){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new pt){let n=e,s=this.v0,r=this.v1,o=this.v2;return n.set(Xr(t,s.x,r.x,o.x),Xr(t,s.y,r.y,o.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Ua=class extends Bn{constructor(t=new D,e=new D,n=new D){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new D){let n=e,s=this.v0,r=this.v1,o=this.v2;return n.set(Xr(t,s.x,r.x,o.x),Xr(t,s.y,r.y,o.y),Xr(t,s.z,r.z,o.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},co=class extends Bn{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new pt){let n=e,s=this.points,r=(s.length-1)*t,o=Math.floor(r),a=r-o,c=s[o===0?o:o-1],l=s[o],h=s[o>s.length-2?s.length-1:o+1],u=s[o>s.length-3?s.length-1:o+2];return n.set(Eu(a,c.x,l.x,h.x,u.x),Eu(a,c.y,l.y,h.y,u.y)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(s.clone())}return this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){let s=this.points[e];t.points.push(s.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(new pt().fromArray(s))}return this}},Ol=Object.freeze({__proto__:null,ArcCurve:Ia,CatmullRomCurve3:La,CubicBezierCurve:ro,CubicBezierCurve3:Da,EllipseCurve:cr,LineCurve:oo,LineCurve3:Na,QuadraticBezierCurve:ao,QuadraticBezierCurve3:Ua,SplineCurve:co}),Fa=class extends Bn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(t){this.curves.push(t)}closePath(){let t=this.curves[0].getPoint(0),e=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(e)){let n=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Ol[n](e,t))}return this}getPoint(t,e){let n=t*this.getLength(),s=this.getCurveLengths(),r=0;for(;r<s.length;){if(s[r]>=n){let o=s[r]-n,a=this.curves[r],c=a.getLength(),l=c===0?0:1-o/c;return a.getPointAt(l,e)}r++}return null}getLength(){let t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let t=[],e=0;for(let n=0,s=this.curves.length;n<s;n++)e+=this.curves[n].getLength(),t.push(e);return this.cacheLengths=t,t}getSpacedPoints(t=40){let e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return this.autoClose&&e.push(e[0]),e}getPoints(t=12){let e=[],n;for(let s=0,r=this.curves;s<r.length;s++){let o=r[s],a=o.isEllipseCurve?t*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?t*o.points.length:t,c=o.getPoints(a);for(let l=0;l<c.length;l++){let h=c[l];n&&n.equals(h)||(e.push(h),n=h)}}return this.autoClose&&e.length>1&&!e[e.length-1].equals(e[0])&&e.push(e[0]),e}copy(t){super.copy(t),this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){let s=t.curves[e];this.curves.push(s.clone())}return this.autoClose=t.autoClose,this}toJSON(){let t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let e=0,n=this.curves.length;e<n;e++){let s=this.curves[e];t.curves.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){let s=t.curves[e];this.curves.push(new Ol[s.type]().fromJSON(s))}return this}},xs=class extends Fa{constructor(t){super(),this.type="Path",this.currentPoint=new pt,t&&this.setFromPoints(t)}setFromPoints(t){this.moveTo(t[0].x,t[0].y);for(let e=1,n=t.length;e<n;e++)this.lineTo(t[e].x,t[e].y);return this}moveTo(t,e){return this.currentPoint.set(t,e),this}lineTo(t,e){let n=new oo(this.currentPoint.clone(),new pt(t,e));return this.curves.push(n),this.currentPoint.set(t,e),this}quadraticCurveTo(t,e,n,s){let r=new ao(this.currentPoint.clone(),new pt(t,e),new pt(n,s));return this.curves.push(r),this.currentPoint.set(n,s),this}bezierCurveTo(t,e,n,s,r,o){let a=new ro(this.currentPoint.clone(),new pt(t,e),new pt(n,s),new pt(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(t){let e=[this.currentPoint.clone()].concat(t),n=new co(e);return this.curves.push(n),this.currentPoint.copy(t[t.length-1]),this}arc(t,e,n,s,r,o){let a=this.currentPoint.x,c=this.currentPoint.y;return this.absarc(t+a,e+c,n,s,r,o),this}absarc(t,e,n,s,r,o){return this.absellipse(t,e,n,n,s,r,o),this}ellipse(t,e,n,s,r,o,a,c){let l=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(t+l,e+h,n,s,r,o,a,c),this}absellipse(t,e,n,s,r,o,a,c){let l=new cr(t,e,n,s,r,o,a,c);if(this.curves.length>0){let u=l.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(l);let h=l.getPoint(1);return this.currentPoint.copy(h),this}copy(t){return super.copy(t),this.currentPoint.copy(t.currentPoint),this}toJSON(){let t=super.toJSON();return t.currentPoint=this.currentPoint.toArray(),t}fromJSON(t){return super.fromJSON(t),this.currentPoint.fromArray(t.currentPoint),this}},lr=class extends xs{constructor(t){super(t),this.uuid=Es(),this.type="Shape",this.holes=[]}getPointsHoles(t){let e=[];for(let n=0,s=this.holes.length;n<s;n++)e[n]=this.holes[n].getPoints(t);return e}extractPoints(t){return{shape:this.getPoints(t),holes:this.getPointsHoles(t)}}copy(t){super.copy(t),this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){let s=t.holes[e];this.holes.push(s.clone())}return this}toJSON(){let t=super.toJSON();t.uuid=this.uuid,t.holes=[];for(let e=0,n=this.holes.length;e<n;e++){let s=this.holes[e];t.holes.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.uuid=t.uuid,this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){let s=t.holes[e];this.holes.push(new xs().fromJSON(s))}return this}};function Dp(i,t,e=2){let n=t&&t.length,s=n?t[0]*e:i.length,r=vd(i,0,s,e,!0),o=[];if(!r||r.next===r.prev)return o;let a,c,l;if(n&&(r=Bp(i,t,r,e)),i.length>80*e){a=i[0],c=i[1];let h=a,u=c;for(let d=e;d<s;d+=e){let f=i[d],_=i[d+1];f<a&&(a=f),_<c&&(c=_),f>h&&(h=f),_>u&&(u=_)}l=Math.max(h-a,u-c),l=l!==0?32767/l:0}return lo(r,o,e,a,c,l,0),o}function vd(i,t,e,n,s){let r;if(s===$p(i,t,e,n)>0)for(let o=t;o<e;o+=n)r=wu(o/n|0,i[o],i[o+1],r);else for(let o=e-n;o>=t;o-=n)r=wu(o/n|0,i[o],i[o+1],r);return r&&hr(r,r.next)&&(uo(r),r=r.next),r}function ys(i,t){if(!i)return i;t||(t=i);let e=i,n;do if(n=!1,!e.steiner&&(hr(e,e.next)||He(e.prev,e,e.next)===0)){if(uo(e),e=t=e.prev,e===e.next)break;n=!0}else e=e.next;while(n||e!==t);return t}function lo(i,t,e,n,s,r,o){if(!i)return;!o&&r&&Gp(i,n,s,r);let a=i;for(;i.prev!==i.next;){let c=i.prev,l=i.next;if(r?Up(i,n,s,r):Np(i)){t.push(c.i,i.i,l.i),uo(i),i=l.next,a=l.next;continue}if(i=l,i===a){o?o===1?(i=Fp(ys(i),t),lo(i,t,e,n,s,r,2)):o===2&&Op(i,t,e,n,s,r):lo(ys(i),t,e,n,s,r,1);break}}}function Np(i){let t=i.prev,e=i,n=i.next;if(He(t,e,n)>=0)return!1;let s=t.x,r=e.x,o=n.x,a=t.y,c=e.y,l=n.y,h=Math.min(s,r,o),u=Math.min(a,c,l),d=Math.max(s,r,o),f=Math.max(a,c,l),_=n.next;for(;_!==t;){if(_.x>=h&&_.x<=d&&_.y>=u&&_.y<=f&&Vr(s,a,r,c,o,l,_.x,_.y)&&He(_.prev,_,_.next)>=0)return!1;_=_.next}return!0}function Up(i,t,e,n){let s=i.prev,r=i,o=i.next;if(He(s,r,o)>=0)return!1;let a=s.x,c=r.x,l=o.x,h=s.y,u=r.y,d=o.y,f=Math.min(a,c,l),_=Math.min(h,u,d),g=Math.max(a,c,l),m=Math.max(h,u,d),p=Bl(f,_,t,e,n),y=Bl(g,m,t,e,n),S=i.prevZ,v=i.nextZ;for(;S&&S.z>=p&&v&&v.z<=y;){if(S.x>=f&&S.x<=g&&S.y>=_&&S.y<=m&&S!==s&&S!==o&&Vr(a,h,c,u,l,d,S.x,S.y)&&He(S.prev,S,S.next)>=0||(S=S.prevZ,v.x>=f&&v.x<=g&&v.y>=_&&v.y<=m&&v!==s&&v!==o&&Vr(a,h,c,u,l,d,v.x,v.y)&&He(v.prev,v,v.next)>=0))return!1;v=v.nextZ}for(;S&&S.z>=p;){if(S.x>=f&&S.x<=g&&S.y>=_&&S.y<=m&&S!==s&&S!==o&&Vr(a,h,c,u,l,d,S.x,S.y)&&He(S.prev,S,S.next)>=0)return!1;S=S.prevZ}for(;v&&v.z<=y;){if(v.x>=f&&v.x<=g&&v.y>=_&&v.y<=m&&v!==s&&v!==o&&Vr(a,h,c,u,l,d,v.x,v.y)&&He(v.prev,v,v.next)>=0)return!1;v=v.nextZ}return!0}function Fp(i,t){let e=i;do{let n=e.prev,s=e.next.next;!hr(n,s)&&Sd(n,e,e.next,s)&&ho(n,s)&&ho(s,n)&&(t.push(n.i,e.i,s.i),uo(e),uo(e.next),e=i=s),e=e.next}while(e!==i);return ys(e)}function Op(i,t,e,n,s,r){let o=i;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&Yp(o,a)){let c=Md(o,a);o=ys(o,o.next),c=ys(c,c.next),lo(o,t,e,n,s,r,0),lo(c,t,e,n,s,r,0);return}a=a.next}o=o.next}while(o!==i)}function Bp(i,t,e,n){let s=[];for(let r=0,o=t.length;r<o;r++){let a=t[r]*n,c=r<o-1?t[r+1]*n:i.length,l=vd(i,a,c,n,!1);l===l.next&&(l.steiner=!0),s.push(Xp(l))}s.sort(kp);for(let r=0;r<s.length;r++)e=zp(s[r],e);return e}function kp(i,t){let e=i.x-t.x;if(e===0&&(e=i.y-t.y,e===0)){let n=(i.next.y-i.y)/(i.next.x-i.x),s=(t.next.y-t.y)/(t.next.x-t.x);e=n-s}return e}function zp(i,t){let e=Hp(i,t);if(!e)return t;let n=Md(e,i);return ys(n,n.next),ys(e,e.next)}function Hp(i,t){let e=t,n=i.x,s=i.y,r=-1/0,o;if(hr(i,e))return e;do{if(hr(i,e.next))return e.next;if(s<=e.y&&s>=e.next.y&&e.next.y!==e.y){let u=e.x+(s-e.y)*(e.next.x-e.x)/(e.next.y-e.y);if(u<=n&&u>r&&(r=u,o=e.x<e.next.x?e:e.next,u===n))return o}e=e.next}while(e!==t);if(!o)return null;let a=o,c=o.x,l=o.y,h=1/0;e=o;do{if(n>=e.x&&e.x>=c&&n!==e.x&&bd(s<l?n:r,s,c,l,s<l?r:n,s,e.x,e.y)){let u=Math.abs(s-e.y)/(n-e.x);ho(e,i)&&(u<h||u===h&&(e.x>o.x||e.x===o.x&&Vp(o,e)))&&(o=e,h=u)}e=e.next}while(e!==a);return o}function Vp(i,t){return He(i.prev,i,t.prev)<0&&He(t.next,i,i.next)<0}function Gp(i,t,e,n){let s=i;do s.z===0&&(s.z=Bl(s.x,s.y,t,e,n)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==i);s.prevZ.nextZ=null,s.prevZ=null,Wp(s)}function Wp(i){let t,e=1;do{let n=i,s;i=null;let r=null;for(t=0;n;){t++;let o=n,a=0;for(let l=0;l<e&&(a++,o=o.nextZ,!!o);l++);let c=e;for(;a>0||c>0&&o;)a!==0&&(c===0||!o||n.z<=o.z)?(s=n,n=n.nextZ,a--):(s=o,o=o.nextZ,c--),r?r.nextZ=s:i=s,s.prevZ=r,r=s;n=o}r.nextZ=null,e*=2}while(t>1);return i}function Bl(i,t,e,n,s){return i=(i-e)*s|0,t=(t-n)*s|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,i|t<<1}function Xp(i){let t=i,e=i;do(t.x<e.x||t.x===e.x&&t.y<e.y)&&(e=t),t=t.next;while(t!==i);return e}function bd(i,t,e,n,s,r,o,a){return(s-o)*(t-a)>=(i-o)*(r-a)&&(i-o)*(n-a)>=(e-o)*(t-a)&&(e-o)*(r-a)>=(s-o)*(n-a)}function Vr(i,t,e,n,s,r,o,a){return!(i===o&&t===a)&&bd(i,t,e,n,s,r,o,a)}function Yp(i,t){return i.next.i!==t.i&&i.prev.i!==t.i&&!qp(i,t)&&(ho(i,t)&&ho(t,i)&&Zp(i,t)&&(He(i.prev,i,t.prev)||He(i,t.prev,t))||hr(i,t)&&He(i.prev,i,i.next)>0&&He(t.prev,t,t.next)>0)}function He(i,t,e){return(t.y-i.y)*(e.x-t.x)-(t.x-i.x)*(e.y-t.y)}function hr(i,t){return i.x===t.x&&i.y===t.y}function Sd(i,t,e,n){let s=da(He(i,t,e)),r=da(He(i,t,n)),o=da(He(e,n,i)),a=da(He(e,n,t));return!!(s!==r&&o!==a||s===0&&ua(i,e,t)||r===0&&ua(i,n,t)||o===0&&ua(e,i,n)||a===0&&ua(e,t,n))}function ua(i,t,e){return t.x<=Math.max(i.x,e.x)&&t.x>=Math.min(i.x,e.x)&&t.y<=Math.max(i.y,e.y)&&t.y>=Math.min(i.y,e.y)}function da(i){return i>0?1:i<0?-1:0}function qp(i,t){let e=i;do{if(e.i!==i.i&&e.next.i!==i.i&&e.i!==t.i&&e.next.i!==t.i&&Sd(e,e.next,i,t))return!0;e=e.next}while(e!==i);return!1}function ho(i,t){return He(i.prev,i,i.next)<0?He(i,t,i.next)>=0&&He(i,i.prev,t)>=0:He(i,t,i.prev)<0||He(i,i.next,t)<0}function Zp(i,t){let e=i,n=!1,s=(i.x+t.x)/2,r=(i.y+t.y)/2;do e.y>r!=e.next.y>r&&e.next.y!==e.y&&s<(e.next.x-e.x)*(r-e.y)/(e.next.y-e.y)+e.x&&(n=!n),e=e.next;while(e!==i);return n}function Md(i,t){let e=kl(i.i,i.x,i.y),n=kl(t.i,t.x,t.y),s=i.next,r=t.prev;return i.next=t,t.prev=i,e.next=s,s.prev=e,n.next=e,e.prev=n,r.next=n,n.prev=r,n}function wu(i,t,e,n){let s=kl(i,t,e);return n?(s.next=n.next,s.prev=n,n.next.prev=s,n.next=s):(s.prev=s,s.next=s),s}function uo(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function kl(i,t,e){return{i,x:t,y:e,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function $p(i,t,e,n){let s=0;for(let r=t,o=e-n;r<e;r+=n)s+=(i[o]-i[r])*(i[r+1]+i[o+1]),o=r;return s}var zl=class{static triangulate(t,e,n=2){return Dp(t,e,n)}},ps=class i{static area(t){let e=t.length,n=0;for(let s=e-1,r=0;r<e;s=r++)n+=t[s].x*t[r].y-t[r].x*t[s].y;return n*.5}static isClockWise(t){return i.area(t)<0}static triangulateShape(t,e){let n=[],s=[],r=[];Tu(t),Au(n,t);let o=t.length;e.forEach(Tu);for(let c=0;c<e.length;c++)s.push(o),o+=e[c].length,Au(n,e[c]);let a=zl.triangulate(n,s);for(let c=0;c<a.length;c+=3)r.push(a.slice(c,c+3));return r}};function Tu(i){let t=i.length;t>2&&i[t-1].equals(i[0])&&i.pop()}function Au(i,t){for(let e=0;e<t.length;e++)i.push(t[e].x),i.push(t[e].y)}var fo=class i extends Ge{constructor(t=new lr([new pt(.5,.5),new pt(-.5,.5),new pt(-.5,-.5),new pt(.5,-.5)]),e={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:t,options:e},t=Array.isArray(t)?t:[t];let n=this,s=[],r=[];for(let a=0,c=t.length;a<c;a++){let l=t[a];o(l)}this.setAttribute("position",new ye(s,3)),this.setAttribute("uv",new ye(r,2)),this.computeVertexNormals();function o(a){let c=[],l=e.curveSegments!==void 0?e.curveSegments:12,h=e.steps!==void 0?e.steps:1,u=e.depth!==void 0?e.depth:1,d=e.bevelEnabled!==void 0?e.bevelEnabled:!0,f=e.bevelThickness!==void 0?e.bevelThickness:.2,_=e.bevelSize!==void 0?e.bevelSize:f-.1,g=e.bevelOffset!==void 0?e.bevelOffset:0,m=e.bevelSegments!==void 0?e.bevelSegments:3,p=e.extrudePath,y=e.UVGenerator!==void 0?e.UVGenerator:Jp,S,v=!1,M,E,A,x;if(p){S=p.getSpacedPoints(h),v=!0,d=!1;let B=p.isCatmullRomCurve3?p.closed:!1;M=p.computeFrenetFrames(h,B),E=new D,A=new D,x=new D}d||(m=0,f=0,_=0,g=0);let w=a.extractPoints(l),C=w.shape,L=w.holes;if(!ps.isClockWise(C)){C=C.reverse();for(let B=0,$=L.length;B<$;B++){let it=L[B];ps.isClockWise(it)&&(L[B]=it.reverse())}}function O(B){let it=10000000000000001e-36,dt=B[0];for(let xt=1;xt<=B.length;xt++){let Ht=xt%B.length,mt=B[Ht],Bt=mt.x-dt.x,Tt=mt.y-dt.y,U=Bt*Bt+Tt*Tt,ce=Math.max(Math.abs(mt.x),Math.abs(mt.y),Math.abs(dt.x),Math.abs(dt.y)),Qt=it*ce*ce;if(U<=Qt){B.splice(Ht,1),xt--;continue}dt=mt}}O(C),L.forEach(O);let F=L.length,X=C;for(let B=0;B<F;B++){let $=L[B];C=C.concat($)}function q(B,$,it){return $||re("ExtrudeGeometry: vec does not exist"),B.clone().addScaledVector($,it)}let N=C.length;function Z(B,$,it){let dt,xt,Ht,mt=B.x-$.x,Bt=B.y-$.y,Tt=it.x-B.x,U=it.y-B.y,ce=mt*mt+Bt*Bt,Qt=mt*U-Bt*Tt;if(Math.abs(Qt)>Number.EPSILON){let R=Math.sqrt(ce),b=Math.sqrt(Tt*Tt+U*U),G=$.x-Bt/R,K=$.y+mt/R,rt=it.x-U/b,_t=it.y+Tt/b,vt=((rt-G)*U-(_t-K)*Tt)/(mt*U-Bt*Tt);dt=G+mt*vt-B.x,xt=K+Bt*vt-B.y;let st=dt*dt+xt*xt;if(st<=2)return new pt(dt,xt);Ht=Math.sqrt(st/2)}else{let R=!1;mt>Number.EPSILON?Tt>Number.EPSILON&&(R=!0):mt<-Number.EPSILON?Tt<-Number.EPSILON&&(R=!0):Math.sign(Bt)===Math.sign(U)&&(R=!0),R?(dt=-Bt,xt=mt,Ht=Math.sqrt(ce)):(dt=mt,xt=Bt,Ht=Math.sqrt(ce/2))}return new pt(dt/Ht,xt/Ht)}let V=[];for(let B=0,$=X.length,it=$-1,dt=B+1;B<$;B++,it++,dt++)it===$&&(it=0),dt===$&&(dt=0),V[B]=Z(X[B],X[it],X[dt]);let Y=[],J,Rt=V.concat();for(let B=0,$=F;B<$;B++){let it=L[B];J=[];for(let dt=0,xt=it.length,Ht=xt-1,mt=dt+1;dt<xt;dt++,Ht++,mt++)Ht===xt&&(Ht=0),mt===xt&&(mt=0),J[dt]=Z(it[dt],it[Ht],it[mt]);Y.push(J),Rt=Rt.concat(J)}let bt;if(m===0)bt=ps.triangulateShape(X,L);else{let B=[],$=[];for(let it=0;it<m;it++){let dt=it/m,xt=f*Math.cos(dt*Math.PI/2),Ht=_*Math.sin(dt*Math.PI/2)+g;for(let mt=0,Bt=X.length;mt<Bt;mt++){let Tt=q(X[mt],V[mt],Ht);ht(Tt.x,Tt.y,-xt),dt===0&&B.push(Tt)}for(let mt=0,Bt=F;mt<Bt;mt++){let Tt=L[mt];J=Y[mt];let U=[];for(let ce=0,Qt=Tt.length;ce<Qt;ce++){let R=q(Tt[ce],J[ce],Ht);ht(R.x,R.y,-xt),dt===0&&U.push(R)}dt===0&&$.push(U)}}bt=ps.triangulateShape(B,$)}let ie=bt.length,Lt=_+g;for(let B=0;B<N;B++){let $=d?q(C[B],Rt[B],Lt):C[B];v?(A.copy(M.normals[0]).multiplyScalar($.x),E.copy(M.binormals[0]).multiplyScalar($.y),x.copy(S[0]).add(A).add(E),ht(x.x,x.y,x.z)):ht($.x,$.y,0)}for(let B=1;B<=h;B++)for(let $=0;$<N;$++){let it=d?q(C[$],Rt[$],Lt):C[$];v?(A.copy(M.normals[B]).multiplyScalar(it.x),E.copy(M.binormals[B]).multiplyScalar(it.y),x.copy(S[B]).add(A).add(E),ht(x.x,x.y,x.z)):ht(it.x,it.y,u/h*B)}for(let B=m-1;B>=0;B--){let $=B/m,it=f*Math.cos($*Math.PI/2),dt=_*Math.sin($*Math.PI/2)+g;for(let xt=0,Ht=X.length;xt<Ht;xt++){let mt=q(X[xt],V[xt],dt);ht(mt.x,mt.y,u+it)}for(let xt=0,Ht=L.length;xt<Ht;xt++){let mt=L[xt];J=Y[xt];for(let Bt=0,Tt=mt.length;Bt<Tt;Bt++){let U=q(mt[Bt],J[Bt],dt);v?ht(U.x,U.y+S[h-1].y,S[h-1].x+it):ht(U.x,U.y,u+it)}}}oe(),et();function oe(){let B=s.length/3;if(d){let $=0,it=N*$;for(let dt=0;dt<ie;dt++){let xt=bt[dt];lt(xt[2]+it,xt[1]+it,xt[0]+it)}$=h+m*2,it=N*$;for(let dt=0;dt<ie;dt++){let xt=bt[dt];lt(xt[0]+it,xt[1]+it,xt[2]+it)}}else{for(let $=0;$<ie;$++){let it=bt[$];lt(it[2],it[1],it[0])}for(let $=0;$<ie;$++){let it=bt[$];lt(it[0]+N*h,it[1]+N*h,it[2]+N*h)}}n.addGroup(B,s.length/3-B,0)}function et(){let B=s.length/3,$=0;W(X,$),$+=X.length;for(let it=0,dt=L.length;it<dt;it++){let xt=L[it];W(xt,$),$+=xt.length}n.addGroup(B,s.length/3-B,1)}function W(B,$){let it=B.length;for(;--it>=0;){let dt=it,xt=it-1;xt<0&&(xt=B.length-1);for(let Ht=0,mt=h+m*2;Ht<mt;Ht++){let Bt=N*Ht,Tt=N*(Ht+1),U=$+dt+Bt,ce=$+xt+Bt,Qt=$+xt+Tt,R=$+dt+Tt;ut(U,ce,Qt,R)}}}function ht(B,$,it){c.push(B),c.push($),c.push(it)}function lt(B,$,it){ot(B),ot($),ot(it);let dt=s.length/3,xt=y.generateTopUV(n,s,dt-3,dt-2,dt-1);It(xt[0]),It(xt[1]),It(xt[2])}function ut(B,$,it,dt){ot(B),ot($),ot(dt),ot($),ot(it),ot(dt);let xt=s.length/3,Ht=y.generateSideWallUV(n,s,xt-6,xt-3,xt-2,xt-1);It(Ht[0]),It(Ht[1]),It(Ht[3]),It(Ht[1]),It(Ht[2]),It(Ht[3])}function ot(B){s.push(c[B*3+0]),s.push(c[B*3+1]),s.push(c[B*3+2])}function It(B){r.push(B.x),r.push(B.y)}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON(),e=this.parameters.shapes,n=this.parameters.options;return Kp(e,n,t)}static fromJSON(t,e){let n=[];for(let r=0,o=t.shapes.length;r<o;r++){let a=e[t.shapes[r]];n.push(a)}let s=t.options.extrudePath;return s!==void 0&&(t.options.extrudePath=new Ol[s.type]().fromJSON(s)),new i(n,t.options)}},Jp={generateTopUV:function(i,t,e,n,s){let r=t[e*3],o=t[e*3+1],a=t[n*3],c=t[n*3+1],l=t[s*3],h=t[s*3+1];return[new pt(r,o),new pt(a,c),new pt(l,h)]},generateSideWallUV:function(i,t,e,n,s,r){let o=t[e*3],a=t[e*3+1],c=t[e*3+2],l=t[n*3],h=t[n*3+1],u=t[n*3+2],d=t[s*3],f=t[s*3+1],_=t[s*3+2],g=t[r*3],m=t[r*3+1],p=t[r*3+2];return Math.abs(a-h)<Math.abs(o-l)?[new pt(o,1-c),new pt(l,1-u),new pt(d,1-_),new pt(g,1-p)]:[new pt(a,1-c),new pt(h,1-u),new pt(f,1-_),new pt(m,1-p)]}};function Kp(i,t,e){if(e.shapes=[],Array.isArray(i))for(let n=0,s=i.length;n<s;n++){let r=i[n];e.shapes.push(r.uuid)}else e.shapes.push(i.uuid);return e.options=Object.assign({},t),t.extrudePath!==void 0&&(e.options.extrudePath=t.extrudePath.toJSON()),e}var po=class i extends Ge{constructor(t=[new pt(0,-.5),new pt(.5,0),new pt(0,.5)],e=12,n=0,s=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:t,segments:e,phiStart:n,phiLength:s},e=Math.floor(e),s=he(s,0,Math.PI*2);let r=[],o=[],a=[],c=[],l=[],h=1/e,u=new D,d=new pt,f=new D,_=new D,g=new D,m=0,p=0;for(let y=0;y<=t.length-1;y++)switch(y){case 0:m=t[y+1].x-t[y].x,p=t[y+1].y-t[y].y,f.x=p*1,f.y=-m,f.z=p*0,g.copy(f),f.normalize(),c.push(f.x,f.y,f.z);break;case t.length-1:c.push(g.x,g.y,g.z);break;default:m=t[y+1].x-t[y].x,p=t[y+1].y-t[y].y,f.x=p*1,f.y=-m,f.z=p*0,_.copy(f),f.x+=g.x,f.y+=g.y,f.z+=g.z,f.normalize(),c.push(f.x,f.y,f.z),g.copy(_)}for(let y=0;y<=e;y++){let S=n+y*h*s,v=Math.sin(S),M=Math.cos(S);for(let E=0;E<=t.length-1;E++){u.x=t[E].x*v,u.y=t[E].y,u.z=t[E].x*M,o.push(u.x,u.y,u.z),d.x=y/e,d.y=E/(t.length-1),a.push(d.x,d.y);let A=c[3*E+0]*v,x=c[3*E+1],w=c[3*E+0]*M;l.push(A,x,w)}}for(let y=0;y<e;y++)for(let S=0;S<t.length-1;S++){let v=S+y*t.length,M=v,E=v+t.length,A=v+t.length+1,x=v+1;r.push(M,E,x),r.push(A,x,E)}this.setIndex(r),this.setAttribute("position",new ye(o,3)),this.setAttribute("uv",new ye(a,2)),this.setAttribute("normal",new ye(l,3))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.points,t.segments,t.phiStart,t.phiLength)}};var Cn=class i extends Ge{constructor(t=1,e=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:s};let r=t/2,o=e/2,a=Math.floor(n),c=Math.floor(s),l=a+1,h=c+1,u=t/a,d=e/c,f=[],_=[],g=[],m=[];for(let p=0;p<h;p++){let y=p*d-o;for(let S=0;S<l;S++){let v=S*u-r;_.push(v,-y,0),g.push(0,0,1),m.push(S/a),m.push(1-p/c)}}for(let p=0;p<c;p++)for(let y=0;y<a;y++){let S=y+l*p,v=y+l*(p+1),M=y+1+l*(p+1),E=y+1+l*p;f.push(S,v,E),f.push(v,M,E)}this.setIndex(f),this.setAttribute("position",new ye(_,3)),this.setAttribute("normal",new ye(g,3)),this.setAttribute("uv",new ye(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.widthSegments,t.heightSegments)}};var ni=class i extends Ge{constructor(t=1,e=32,n=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));let c=Math.min(o+a,Math.PI),l=0,h=[],u=new D,d=new D,f=[],_=[],g=[],m=[];for(let p=0;p<=n;p++){let y=[],S=p/n,v=o+S*a,M=t*Math.cos(v),E=Math.sqrt(t*t-M*M),A=0;p===0&&o===0?A=.5/e:p===n&&c===Math.PI&&(A=-.5/e);for(let x=0;x<=e;x++){let w=x/e,C=s+w*r;u.x=-E*Math.cos(C),u.y=M,u.z=E*Math.sin(C),_.push(u.x,u.y,u.z),d.copy(u).normalize(),g.push(d.x,d.y,d.z),m.push(w+A,1-S),y.push(l++)}h.push(y)}for(let p=0;p<n;p++)for(let y=0;y<e;y++){let S=h[p][y+1],v=h[p][y],M=h[p+1][y],E=h[p+1][y+1];(p!==0||o>0)&&f.push(S,v,E),(p!==n-1||c<Math.PI)&&f.push(v,M,E)}this.setIndex(f),this.setAttribute("position",new ye(_,3)),this.setAttribute("normal",new ye(g,3)),this.setAttribute("uv",new ye(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};var vn=class i extends Ge{constructor(t=1,e=.4,n=12,s=48,r=Math.PI*2,o=0,a=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:n,tubularSegments:s,arc:r,thetaStart:o,thetaLength:a},n=Math.floor(n),s=Math.floor(s);let c=[],l=[],h=[],u=[],d=new D,f=new D,_=new D;for(let g=0;g<=n;g++){let m=o+g/n*a;for(let p=0;p<=s;p++){let y=p/s*r;f.x=(t+e*Math.cos(m))*Math.cos(y),f.y=(t+e*Math.cos(m))*Math.sin(y),f.z=e*Math.sin(m),l.push(f.x,f.y,f.z),d.x=t*Math.cos(y),d.y=t*Math.sin(y),_.subVectors(f,d).normalize(),h.push(_.x,_.y,_.z),u.push(p/s),u.push(g/n)}}for(let g=1;g<=n;g++)for(let m=1;m<=s;m++){let p=(s+1)*g+m-1,y=(s+1)*(g-1)+m-1,S=(s+1)*(g-1)+m,v=(s+1)*g+m;c.push(p,y,v),c.push(y,S,v)}this.setIndex(c),this.setAttribute("position",new ye(l,3)),this.setAttribute("normal",new ye(h,3)),this.setAttribute("uv",new ye(u,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc,t.thetaStart,t.thetaLength)}};function ws(i){let t={};for(let e in i){t[e]={};for(let n in i[e]){let s=i[e][n];if(Ru(s))s.isRenderTargetTexture?(ne("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=s.clone();else if(Array.isArray(s))if(Ru(s[0])){let r=[];for(let o=0,a=s.length;o<a;o++)r[o]=s[o].clone();t[e][n]=r}else t[e][n]=s.slice();else t[e][n]=s}}return t}function bn(i){let t={};for(let e=0;e<i.length;e++){let n=ws(i[e]);for(let s in n)t[s]=n[s]}return t}function Ru(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function jp(i){let t=[];for(let e=0;e<i.length;e++)t.push(i[e].clone());return t}function _h(i){let t=i.getRenderTarget();return t===null?i.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:xe.workingColorSpace}var Ed={clone:ws,merge:bn},Qp=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,t0=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,kn=class extends wi{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Qp,this.fragmentShader=t0,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=ws(t.uniforms),this.uniformsGroups=jp(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let s in this.uniforms){let o=this.uniforms[s].value;o&&o.isTexture?e.uniforms[s]={type:"t",value:o.toJSON(t).uuid}:o&&o.isColor?e.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?e.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?e.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?e.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?e.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?e.uniforms[s]={type:"m4",value:o.toArray()}:e.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}fromJSON(t,e){if(super.fromJSON(t,e),t.uniforms!==void 0)for(let n in t.uniforms){let s=t.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=e[s.value]||null;break;case"c":this.uniforms[n].value=new te().setHex(s.value);break;case"v2":this.uniforms[n].value=new pt().fromArray(s.value);break;case"v3":this.uniforms[n].value=new D().fromArray(s.value);break;case"v4":this.uniforms[n].value=new Be().fromArray(s.value);break;case"m3":this.uniforms[n].value=new le().fromArray(s.value);break;case"m4":this.uniforms[n].value=new Pe().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(let n in t.extensions)this.extensions[n]=t.extensions[n];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}},Oa=class extends kn{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},Se=class extends wi{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new te(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new te(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Io,this.normalScale=new pt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ui,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}},Ai=class extends Se{constructor(t){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new pt(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return he(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(e){this.ior=(1+.4*e)/(1-.4*e)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new te(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new te(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new te(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(t)}get anisotropy(){return this._anisotropy}set anisotropy(t){this._anisotropy>0!=t>0&&this.version++,this._anisotropy=t}get clearcoat(){return this._clearcoat}set clearcoat(t){this._clearcoat>0!=t>0&&this.version++,this._clearcoat=t}get iridescence(){return this._iridescence}set iridescence(t){this._iridescence>0!=t>0&&this.version++,this._iridescence=t}get dispersion(){return this._dispersion}set dispersion(t){this._dispersion>0!=t>0&&this.version++,this._dispersion=t}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(t){this._retroreflectivity>0!=t>0&&this.version++,this._retroreflectivity=t}get sheen(){return this._sheen}set sheen(t){this._sheen>0!=t>0&&this.version++,this._sheen=t}get transmission(){return this._transmission}set transmission(t){this._transmission>0!=t>0&&this.version++,this._transmission=t}copy(t){return super.copy(t),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=t.anisotropy,this.anisotropyRotation=t.anisotropyRotation,this.anisotropyMap=t.anisotropyMap,this.clearcoat=t.clearcoat,this.clearcoatMap=t.clearcoatMap,this.clearcoatRoughness=t.clearcoatRoughness,this.clearcoatRoughnessMap=t.clearcoatRoughnessMap,this.clearcoatNormalMap=t.clearcoatNormalMap,this.clearcoatNormalScale.copy(t.clearcoatNormalScale),this.dispersion=t.dispersion,this.ior=t.ior,this.iridescence=t.iridescence,this.iridescenceMap=t.iridescenceMap,this.iridescenceIOR=t.iridescenceIOR,this.iridescenceThicknessRange=[...t.iridescenceThicknessRange],this.iridescenceThicknessMap=t.iridescenceThicknessMap,this.retroreflectivity=t.retroreflectivity,this.sheen=t.sheen,this.sheenColor.copy(t.sheenColor),this.sheenColorMap=t.sheenColorMap,this.sheenRoughness=t.sheenRoughness,this.sheenRoughnessMap=t.sheenRoughnessMap,this.transmission=t.transmission,this.transmissionMap=t.transmissionMap,this.thickness=t.thickness,this.thicknessMap=t.thicknessMap,this.attenuationDistance=t.attenuationDistance,this.attenuationColor.copy(t.attenuationColor),this.specularIntensity=t.specularIntensity,this.specularIntensityMap=t.specularIntensityMap,this.specularColor.copy(t.specularColor),this.specularColorMap=t.specularColorMap,this}};var mo=class extends wi{constructor(t){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new te(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new te(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Io,this.normalScale=new pt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new ui,this.combine=tc,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.envMapIntensity=t.envMapIntensity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}},Ba=class extends wi{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=rd,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},ka=class extends wi{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}};function qs(i,t){return!i||i.constructor===t?i:typeof t.BYTES_PER_ELEMENT=="number"?new t(i):Array.prototype.slice.call(i)}function Il(i){return i!==void 0&&i.inTangents!==void 0&&i.outTangents!==void 0}var Yi=class{constructor(t,e,n,s){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new e.constructor(n),this.sampleValues=e,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,n=this._cachedIndex,s=e[n],r=e[n-1];n:{t:{let o;e:{i:if(!(t<s)){for(let a=n+2;;){if(s===void 0){if(t<r)break i;return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(r=s,s=e[++n],t<s)break t}o=e.length;break e}if(!(t>=r)){let a=e[1];t<a&&(n=2,r=a);for(let c=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===c)break;if(s=r,r=e[--n-1],t>=r)break t}o=n,n=0;break e}break n}for(;n<o;){let a=n+o>>>1;t<e[a]?o=a:n=a+1}if(s=e[n],r=e[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,t,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=t*s;for(let o=0;o!==s;++o)e[o]=n[r+o];return e}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},za=class extends Yi{constructor(t,e,n,s){super(t,e,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Nl,endingEnd:Nl}}intervalChanged_(t,e,n){let s=this.parameterPositions,r=t-2,o=t+1,a=s[r],c=s[o];if(a===void 0)switch(this.getSettings_().endingStart){case Ul:r=t,a=2*e-n;break;case Fl:r=s.length-2,a=e+s[r]-s[r+1];break;default:r=t,a=n}if(c===void 0)switch(this.getSettings_().endingEnd){case Ul:o=t,c=2*n-e;break;case Fl:o=1,c=n+s[1]-s[0];break;default:o=t-1,c=e}let l=(n-e)*.5,h=this.valueSize;this._weightPrev=l/(e-a),this._weightNext=l/(c-n),this._offsetPrev=r*h,this._offsetNext=o*h}interpolate_(t,e,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=t*a,l=c-a,h=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,_=(n-e)/(s-e),g=_*_,m=g*_,p=-d*m+2*d*g-d*_,y=(1+d)*m+(-1.5-2*d)*g+(-.5+d)*_+1,S=(-1-f)*m+(1.5+f)*g+.5*_,v=f*m-f*g;for(let M=0;M!==a;++M)r[M]=p*o[h+M]+y*o[l+M]+S*o[c+M]+v*o[u+M];return r}},Ha=class extends Yi{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=t*a,l=c-a,h=(n-e)/(s-e),u=1-h;for(let d=0;d!==a;++d)r[d]=o[l+d]*u+o[c+d]*h;return r}},Va=class extends Yi{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t){return this.copySampleValue_(t-1)}},Ga=class extends Yi{interpolate_(t,e,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=t*a,l=c-a,h=this.inTangents,u=this.outTangents;if(!h||!u){let _=(n-e)/(s-e),g=1-_;for(let m=0;m!==a;++m)r[m]=o[l+m]*g+o[c+m]*_;return r}let d=a*2,f=t-1;for(let _=0;_!==a;++_){let g=o[l+_],m=o[c+_],p=f*d+_*2,y=u[p],S=u[p+1],v=t*d+_*2,M=h[v],E=h[v+1],A=n0(n,e,y,M,s);r[_]=wd(A,g,S,E,m)}return r}};function wd(i,t,e,n,s){let r=1-i;return r*r*r*t+3*r*r*i*e+3*r*i*i*n+i*i*i*s}function e0(i,t,e,n,s){let r=1-i;return 3*r*r*(e-t)+6*r*i*(n-e)+3*i*i*(s-n)}function n0(i,t,e,n,s){let r=(i-t)/(s-t);for(let o=0;o<8;o++){let a=wd(r,t,e,n,s)-i;if(Math.abs(a)<1e-10)break;let c=e0(r,t,e,n,s);if(Math.abs(c)<1e-10)break;r=Math.max(0,Math.min(1,r-a/c))}return r}var zn=class{constructor(t,e,n,s){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=qs(e,this.TimeBufferType),this.values=qs(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,n;if(e.toJSON!==this.toJSON)n=e.toJSON(t);else{n={name:t.name,times:qs(t.times,Array),values:qs(t.values,Array)};let s=t.getInterpolation();s!==t.DefaultInterpolation&&(n.interpolation=s),Il(t.settings)&&(n.settings={inTangents:qs(t.settings.inTangents,Array),outTangents:qs(t.settings.outTangents,Array)})}return n.type=t.ValueTypeName,n}InterpolantFactoryMethodDiscrete(t){return new Va(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new Ha(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new za(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodBezier(t){let e=new Ga(this.times,this.values,this.getValueSize(),t);return this.settings&&(e.inTangents=this.settings.inTangents,e.outTangents=this.settings.outTangents),e}setInterpolation(t){let e;switch(t){case qr:e=this.InterpolantFactoryMethodDiscrete;break;case wa:e=this.InterpolantFactoryMethodLinear;break;case ma:e=this.InterpolantFactoryMethodSmooth;break;case Dl:e=this.InterpolantFactoryMethodBezier;break}if(e===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return ne("KeyframeTrack:",n),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return qr;case this.InterpolantFactoryMethodLinear:return wa;case this.InterpolantFactoryMethodSmooth:return ma;case this.InterpolantFactoryMethodBezier:return Dl}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]+=t}return this}scale(t){if(t!==1){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]*=t;Il(this.settings)&&(Cu(this.settings.inTangents,t),Cu(this.settings.outTangents,t))}return this}trim(t,e){let n=this.times,s=n.length,r=0,o=s-1;for(;r!==s&&n[r]<t;)++r;for(;o!==-1&&n[o]>e;)--o;if(++o,r!==0||o!==s){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=n.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(re("KeyframeTrack: Invalid value size in track.",this),t=!1);let n=this.times,s=this.values,r=n.length;r===0&&(re("KeyframeTrack: Track is empty.",this),t=!1);let o=null;for(let a=0;a!==r;a++){let c=n[a];if(typeof c=="number"&&isNaN(c)){re("KeyframeTrack: Time is not a valid number.",this,a,c),t=!1;break}if(o!==null&&o>c){re("KeyframeTrack: Out of order keys.",this,a,c,o),t=!1;break}o=c}if(s!==void 0&&Wf(s))for(let a=0,c=s.length;a!==c;++a){let l=s[a];if(isNaN(l)){re("KeyframeTrack: Value is not a valid number.",this,a,l),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===ma,r=t.length-1,o=1;for(let a=1;a<r;++a){let c=!1,l=t[a],h=t[a+1];if(l!==h&&(a!==1||l!==t[0]))if(s)c=!0;else{let u=a*n,d=u-n,f=u+n;for(let _=0;_!==n;++_){let g=e[u+_];if(g!==e[d+_]||g!==e[f+_]){c=!0;break}}}if(c){if(a!==o){t[o]=t[a];let u=a*n,d=o*n;for(let f=0;f!==n;++f)e[d+f]=e[u+f]}++o}}if(r>0){t[o]=t[r];for(let a=r*n,c=o*n,l=0;l!==n;++l)e[c+l]=e[a+l];++o}return o!==t.length?(this.times=t.slice(0,o),this.values=e.slice(0,o*n)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),n=this.constructor,s=new n(this.name,t,e);return s.createInterpolant=this.createInterpolant,Il(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};function Cu(i,t){for(let e=0,n=i.length;e!==n;e+=2)i[e]*=t}zn.prototype.ValueTypeName="";zn.prototype.TimeBufferType=Float32Array;zn.prototype.ValueBufferType=Float32Array;zn.prototype.DefaultInterpolation=wa;var qi=class extends zn{constructor(t,e,n){super(t,e,n)}};qi.prototype.ValueTypeName="bool";qi.prototype.ValueBufferType=Array;qi.prototype.DefaultInterpolation=qr;qi.prototype.InterpolantFactoryMethodLinear=void 0;qi.prototype.InterpolantFactoryMethodSmooth=void 0;var Wa=class extends zn{constructor(t,e,n,s){super(t,e,n,s)}};Wa.prototype.ValueTypeName="color";var Xa=class extends zn{constructor(t,e,n,s){super(t,e,n,s)}};Xa.prototype.ValueTypeName="number";var Ya=class extends Yi{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=(n-e)/(s-e),l=t*a;for(let h=l+a;l!==h;l+=4)yn.slerpFlat(r,0,o,l-a,o,l,c);return r}},go=class extends zn{constructor(t,e,n,s){super(t,e,n,s)}InterpolantFactoryMethodLinear(t){return new Ya(this.times,this.values,this.getValueSize(),t)}};go.prototype.ValueTypeName="quaternion";go.prototype.InterpolantFactoryMethodSmooth=void 0;var Zi=class extends zn{constructor(t,e,n){super(t,e,n)}};Zi.prototype.ValueTypeName="string";Zi.prototype.ValueBufferType=Array;Zi.prototype.DefaultInterpolation=qr;Zi.prototype.InterpolantFactoryMethodLinear=void 0;Zi.prototype.InterpolantFactoryMethodSmooth=void 0;var qa=class extends zn{constructor(t,e,n,s){super(t,e,n,s)}};qa.prototype.ValueTypeName="vector";var Za=class{constructor(t,e,n){let s=this,r=!1,o=0,a=0,c,l=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=n,this._abortController=null,this.itemStart=function(h){a++,r===!1&&s.onStart!==void 0&&s.onStart(h,o,a),r=!0},this.itemEnd=function(h){o++,s.onProgress!==void 0&&s.onProgress(h,o,a),o===a&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),c?c(h):h},this.setURLModifier=function(h){return c=h,this},this.addHandler=function(h,u){return l.push(h,u),this},this.removeHandler=function(h){let u=l.indexOf(h);return u!==-1&&l.splice(u,2),this},this.getHandler=function(h){for(let u=0,d=l.length;u<d;u+=2){let f=l[u],_=l[u+1];if(f.global&&(f.lastIndex=0),f.test(h))return _}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},Td=new Za,$a=class{constructor(t){this.manager=t!==void 0?t:Td,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__!="undefined"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(t,e){let n=this;return new Promise(function(s,r){n.load(t,s,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}abort(){return this}};$a.DEFAULT_MATERIAL_NAME="__DEFAULT";var vs=class extends Je{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new te(t),this.intensity=e}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,e}},_o=class extends vs{constructor(t,e,n){super(t,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Je.DEFAULT_UP),this.updateMatrix(),this.groundColor=new te(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}toJSON(t){let e=super.toJSON(t);return e.object.groundColor=this.groundColor.getHex(),e}},Ll=new Pe,Pu=new D,Iu=new D,ur=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new pt(512,512),this.mapType=Pn,this.map=null,this.mapPass=null,this.matrix=new Pe,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new or,this._frameExtents=new pt(1,1),this._viewportCount=1,this._viewports=[new Be(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera;Pu.setFromMatrixPosition(t.matrixWorld),e.position.copy(Pu),Iu.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(Iu),e.updateMatrixWorld(),this._updateMatrix(e,this.matrix,this._frustum)}_updateMatrix(t,e,n,s){Ll.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),n.setFromProjectionMatrix(Ll,t.coordinateSystem,t.reversedDepth);let r=this._frameExtents,o=s?s.z/r.x:1,a=s?s.w/r.y:1,c=s?s.x/r.x:0,l=s?s.y/r.y:0;t.coordinateSystem===tr||t.reversedDepth?e.set(.5*o,0,0,.5*o+c,0,.5*a,0,.5*a+l,0,0,1,0,0,0,0,1):e.set(.5*o,0,0,.5*o+c,0,.5*a,0,.5*a+l,0,0,.5,.5,0,0,0,1),e.multiply(Ll)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return t.intensity=this.intensity,t.bias=this.bias,t.normalBias=this.normalBias,t.radius=this.radius,t.blurSamples=this.blurSamples,t.mapSize=this.mapSize.toArray(),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}},fa=new D,pa=new yn,ci=new D,xo=class extends Je{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Pe,this.projectionMatrix=new Pe,this.projectionMatrixInverse=new Pe,this.coordinateSystem=ti,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose(fa,pa,ci),ci.x===1&&ci.y===1&&ci.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(fa,pa,ci.set(1,1,1)).invert()}updateWorldMatrix(t,e,n=!1){super.updateWorldMatrix(t,e,n),this.matrixWorld.decompose(fa,pa,ci),ci.x===1&&ci.y===1&&ci.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(fa,pa,ci.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},zi=new D,Lu=new pt,Du=new pt,Qe=class extends xo{constructor(t=50,e=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=gs*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(Gr*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return gs*2*Math.atan(Math.tan(Gr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){zi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(zi.x,zi.y).multiplyScalar(-t/zi.z),zi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(zi.x,zi.y).multiplyScalar(-t/zi.z)}getViewSize(t,e){return this.getViewBounds(t,Lu,Du),e.subVectors(Du,Lu)}setViewOffset(t,e,n,s,r,o){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(Gr*.5*this.fov)/this.zoom,n=2*e,s=this.aspect*n,r=-.5*s,o=this.view;if(this.view!==null&&this.view.enabled){let c=o.fullWidth,l=o.fullHeight;r+=o.offsetX*s/c,e-=o.offsetY*n/l,s*=o.width/c,n*=o.height/l}let a=this.filmOffset;a!==0&&(r+=t*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-n,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}},Hl=class extends ur{constructor(){super(new Qe(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(t){let e=this.camera,n=gs*2*t.angle*this.focus,s=this.mapSize.width/this.mapSize.height*this.aspect,r=t.distance||e.far;(n!==e.fov||s!==e.aspect||r!==e.far)&&(e.fov=n,e.aspect=s,e.far=r,e.updateProjectionMatrix()),super.updateMatrices(t)}copy(t){return super.copy(t),this.focus=t.focus,this.aspect=t.aspect,this}toJSON(){let t=super.toJSON();return t.focus=this.focus,t.aspect=this.aspect,t}},yo=class extends vs{constructor(t,e,n=0,s=Math.PI/3,r=0,o=2){super(t,e),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(Je.DEFAULT_UP),this.updateMatrix(),this.target=new Je,this.distance=n,this.angle=s,this.penumbra=r,this.decay=o,this.map=null,this.shadow=new Hl}get power(){return this.intensity*Math.PI}set power(t){this.intensity=t/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.angle=t.angle,this.penumbra=t.penumbra,this.decay=t.decay,this.target=t.target.clone(),this.map=t.map,this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.distance=this.distance,e.object.angle=this.angle,e.object.decay=this.decay,e.object.penumbra=this.penumbra,e.object.target=this.target.uuid,this.map&&this.map.isTexture&&(e.object.map=this.map.toJSON(t).uuid),e.object.shadow=this.shadow.toJSON(),e}},Vl=class extends ur{constructor(){super(new Qe(90,1,.5,500)),this.isPointLightShadow=!0}},vo=class extends vs{constructor(t,e,n=0,s=2){super(t,e),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new Vl}get power(){return this.intensity*4*Math.PI}set power(t){this.intensity=t/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.decay=t.decay,this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.distance=this.distance,e.object.decay=this.decay,e.object.shadow=this.shadow.toJSON(),e}},dr=class extends xo{constructor(t=-1,e=1,n=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-t,o=n+t,a=s+e,c=s-e;if(this.view!==null&&this.view.enabled){let l=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=l*this.view.offsetX,o=r+l*this.view.width,a-=h*this.view.offsetY,c=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}},Gl=class extends ur{constructor(){super(new dr(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},$i=class extends vs{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Je.DEFAULT_UP),this.updateMatrix(),this.target=new Je,this.shadow=new Gl}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.shadow=this.shadow.toJSON(),e.object.target=this.target.uuid,e}};var Zs=-90,$s=1,Ja=class extends Je{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Qe(Zs,$s,t,e);s.layers=this.layers,this.add(s);let r=new Qe(Zs,$s,t,e);r.layers=this.layers,this.add(r);let o=new Qe(Zs,$s,t,e);o.layers=this.layers,this.add(o);let a=new Qe(Zs,$s,t,e);a.layers=this.layers,this.add(a);let c=new Qe(Zs,$s,t,e);c.layers=this.layers,this.add(c);let l=new Qe(Zs,$s,t,e);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[n,s,r,o,a,c]=e;for(let l of e)this.remove(l);if(t===ti)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(t===tr)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let l of e)this.add(l),l.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[r,o,a,c,l,h]=this.children,u=t.getRenderTarget(),d=t.getActiveCubeFace(),f=t.getActiveMipmapLevel(),_=t.xr.enabled;t.xr.enabled=!1;let g=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let m=!1;t.isWebGLRenderer===!0?m=t.state.buffers.depth.getReversed():m=t.reversedDepthBuffer,t.setRenderTarget(n,0,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,r),t.setRenderTarget(n,1,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,o),t.setRenderTarget(n,2,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,a),t.setRenderTarget(n,3,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,c),t.setRenderTarget(n,4,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,l),n.texture.generateMipmaps=g,t.setRenderTarget(n,5,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,h),t.setRenderTarget(u,d,f),t.xr.enabled=_,n.texture.needsPMREMUpdate=!0}},Ka=class extends Qe{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}};var xh="\\[\\]\\.:\\/",i0=new RegExp("["+xh+"]","g"),yh="[^"+xh+"]",s0="[^"+xh.replace("\\.","")+"]",r0=/((?:WC+[\/:])*)/.source.replace("WC",yh),o0=/(WCOD+)?/.source.replace("WCOD",s0),a0=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",yh),c0=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",yh),l0=new RegExp("^"+r0+o0+a0+c0+"$"),h0=["material","materials","bones","map"],Wl=class{constructor(t,e,n){let s=n||Oe.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,s)}getValue(t,e){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(t,e)}setValue(t,e){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].unbind()}},Oe=class i{constructor(t,e,n){this.path=e,this.parsedPath=n||i.parseTrackName(e),this.node=i.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,n){return t&&t.isAnimationObjectGroup?new i.Composite(t,e,n):new i(t,e,n)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(i0,"")}static parseTrackName(t){let e=l0.exec(t);if(e===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let n={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);h0.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return n}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let n=t.skeleton.getBoneByName(e);if(n!==void 0)return n}if(t.children){let n=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===e||a.uuid===e)return a;let c=n(a.children);if(c)return c}return null},s=n(t.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)t[e++]=n[s]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,n=e.objectName,s=e.propertyName,r=e.propertyIndex;if(t||(t=i.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){ne("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let l=e.objectIndex;switch(n){case"materials":if(!t.material){re("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){re("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){re("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let h=0;h<t.length;h++)if(t[h].name===l){l=h;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){re("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){re("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[n]===void 0){re("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[n]}if(l!==void 0){if(t[l]===void 0){re("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[l]}}let o=t[s];if(o===void 0){let l=e.nodeName;re("PropertyBinding: Trying to update property for track: "+l+"."+s+" but it wasn't found.",t);return}let a=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?a=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!t.geometry){re("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){re("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[r]!==void 0&&(r=t.morphTargetDictionary[r])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=s;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Oe.Composite=Wl;Oe.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Oe.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Oe.prototype.GetterByBindingType=[Oe.prototype._getValue_direct,Oe.prototype._getValue_array,Oe.prototype._getValue_arrayElement,Oe.prototype._getValue_toArray];Oe.prototype.SetterByBindingTypeAndVersioning=[[Oe.prototype._setValue_direct,Oe.prototype._setValue_direct_setNeedsUpdate,Oe.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Oe.prototype._setValue_array,Oe.prototype._setValue_array_setNeedsUpdate,Oe.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Oe.prototype._setValue_arrayElement,Oe.prototype._setValue_arrayElement_setNeedsUpdate,Oe.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Oe.prototype._setValue_fromArray,Oe.prototype._setValue_fromArray_setNeedsUpdate,Oe.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var R1=new Float32Array(1);var Nu=new Pe,Ri=class{constructor(t,e,n=0,s=1/0){this.ray=new _s(t,e),this.near=n,this.far=s,this.camera=null,this.layers=new ir,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,e){this.ray.set(t,e)}setFromCamera(t,e){e.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(e).sub(this.ray.origin).normalize(),this.camera=e):e.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,e.projectionMatrix.elements[14]).unproject(e),this.ray.direction.set(0,0,-1).transformDirection(e.matrixWorld),this.camera=e):re("Raycaster: Unsupported camera type: "+e.type)}setFromXRController(t){return Nu.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Nu),this}intersectObject(t,e=!0,n=[]){return Xl(t,this,n,e),n.sort(Uu),n}intersectObjects(t,e=!0,n=[]){for(let s=0,r=t.length;s<r;s++)Xl(t[s],this,n,e);return n.sort(Uu),n}};function Uu(i,t){return i.distance-t.distance}function Xl(i,t,e,n){let s=!0;if(i.layers.test(t.layers)&&i.raycast(t,e)===!1&&(s=!1),s===!0&&n===!0){let r=i.children;for(let o=0,a=r.length;o<a;o++)Xl(r[o],t,e,!0)}}var bo=class{constructor(t=!0){this.autoStart=t,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1,ne("Clock: This module has been deprecated. Please use THREE.Timer instead.")}start(){this.startTime=performance.now(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let t=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){let e=performance.now();t=(e-this.oldTime)/1e3,this.oldTime=e,this.elapsedTime+=t}return t}},Ji=class{constructor(t=1,e=0,n=0){this.radius=t,this.phi=e,this.theta=n}set(t,e,n){return this.radius=t,this.phi=e,this.theta=n,this}copy(t){return this.radius=t.radius,this.phi=t.phi,this.theta=t.theta,this}makeSafe(){return this.phi=he(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(t){return this.setFromCartesianCoords(t.x,t.y,t.z)}setFromCartesianCoords(t,e,n){return this.radius=Math.sqrt(t*t+e*e+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(t,n),this.phi=Math.acos(he(e/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}};var wh=class wh{constructor(t,e,n,s){this.elements=[1,0,0,1],t!==void 0&&this.set(t,e,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(t,e=0){for(let n=0;n<4;n++)this.elements[n]=t[n+e];return this}set(t,e,n,s){let r=this.elements;return r[0]=t,r[2]=e,r[1]=n,r[3]=s,this}};wh.prototype.isMatrix2=!0;var Yl=wh;var So=class extends ei{constructor(t,e=null){super(),this.object=t,this.domElement=e,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(t){this.domElement!==null&&this.disconnect(),this.domElement=t}disconnect(){}dispose(){}update(){}};function vh(i,t,e,n){let s=u0(n);switch(e){case hh:return i*t;case oc:return i*t/s.components*s.byteLength;case ac:return i*t/s.components*s.byteLength;case is:return i*t*2/s.components*s.byteLength;case cc:return i*t*2/s.components*s.byteLength;case uh:return i*t*3/s.components*s.byteLength;case An:return i*t*4/s.components*s.byteLength;case lc:return i*t*4/s.components*s.byteLength;case wo:case To:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case Ao:case Ro:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case uc:case fc:return Math.max(i,16)*Math.max(t,8)/4;case hc:case dc:return Math.max(i,8)*Math.max(t,8)/2;case pc:case mc:case _c:case xc:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case gc:case Co:case yc:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case vc:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case bc:return Math.floor((i+4)/5)*Math.floor((t+3)/4)*16;case Sc:return Math.floor((i+4)/5)*Math.floor((t+4)/5)*16;case Mc:return Math.floor((i+5)/6)*Math.floor((t+4)/5)*16;case Ec:return Math.floor((i+5)/6)*Math.floor((t+5)/6)*16;case wc:return Math.floor((i+7)/8)*Math.floor((t+4)/5)*16;case Tc:return Math.floor((i+7)/8)*Math.floor((t+5)/6)*16;case Ac:return Math.floor((i+7)/8)*Math.floor((t+7)/8)*16;case Rc:return Math.floor((i+9)/10)*Math.floor((t+4)/5)*16;case Cc:return Math.floor((i+9)/10)*Math.floor((t+5)/6)*16;case Pc:return Math.floor((i+9)/10)*Math.floor((t+7)/8)*16;case Ic:return Math.floor((i+9)/10)*Math.floor((t+9)/10)*16;case Lc:return Math.floor((i+11)/12)*Math.floor((t+9)/10)*16;case Dc:return Math.floor((i+11)/12)*Math.floor((t+11)/12)*16;case Nc:case Uc:case Fc:return Math.ceil(i/4)*Math.ceil(t/4)*16;case Oc:case Bc:return Math.ceil(i/4)*Math.ceil(t/4)*8;case Po:case kc:return Math.ceil(i/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function u0(i){switch(i){case Pn:case oh:return{byteLength:1,components:1};case _r:case ah:case ri:return{byteLength:2,components:1};case sc:case rc:return{byteLength:2,components:4};case si:case ic:case Yn:return{byteLength:4,components:1};case ch:case lh:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__!="undefined"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window!="undefined"&&(window.__THREE__?ne("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function Zd(){let i=null,t=!1,e=null,n=null;function s(r,o){n=i.requestAnimationFrame(s),e(r,o)}return{start:function(){t!==!0&&e!==null&&i!==null&&(n=i.requestAnimationFrame(s),t=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){i=r}}}function f0(i){let t=new WeakMap;function e(a,c){let l=a.array,h=a.usage,u=l.byteLength,d=i.createBuffer();i.bindBuffer(c,d),i.bufferData(c,l,h),a.onUploadCallback();let f;if(l instanceof Float32Array)f=i.FLOAT;else if(typeof Float16Array!="undefined"&&l instanceof Float16Array)f=i.HALF_FLOAT;else if(l instanceof Uint16Array)a.isFloat16BufferAttribute?f=i.HALF_FLOAT:f=i.UNSIGNED_SHORT;else if(l instanceof Int16Array)f=i.SHORT;else if(l instanceof Uint32Array)f=i.UNSIGNED_INT;else if(l instanceof Int32Array)f=i.INT;else if(l instanceof Int8Array)f=i.BYTE;else if(l instanceof Uint8Array)f=i.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)f=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:d,type:f,bytesPerElement:l.BYTES_PER_ELEMENT,version:a.version,size:u}}function n(a,c,l){let h=c.array,u=c.updateRanges;if(i.bindBuffer(l,a),u.length===0)i.bufferSubData(l,0,h);else{u.sort((f,_)=>f.start-_.start);let d=0;for(let f=1;f<u.length;f++){let _=u[d],g=u[f];g.start<=_.start+_.count+1?_.count=Math.max(_.count,g.start+g.count-_.start):(++d,u[d]=g)}u.length=d+1;for(let f=0,_=u.length;f<_;f++){let g=u[f];i.bufferSubData(l,g.start*h.BYTES_PER_ELEMENT,h,g.start,g.count)}c.clearUpdateRanges()}c.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),t.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);let c=t.get(a);c&&(i.deleteBuffer(c.buffer),t.delete(a))}function o(a,c){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let h=t.get(a);(!h||h.version<a.version)&&t.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let l=t.get(a);if(l===void 0)t.set(a,e(a,c));else if(l.version<a.version){if(l.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(l.buffer,a,c),l.version=a.version}}return{get:s,remove:r,update:o}}var p0=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,m0=`#ifdef USE_ALPHAHASH
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
#endif`,g0=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,_0=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,x0=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,y0=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,v0=`#ifdef USE_AOMAP
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
#endif`,b0=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,S0=`#ifdef USE_BATCHING
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
#endif`,M0=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,E0=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,w0=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,T0=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,A0=`#ifdef USE_IRIDESCENCE
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
#endif`,R0=`#ifdef USE_BUMPMAP
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
#endif`,C0=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,P0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,I0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,L0=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,D0=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,N0=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,U0=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,F0=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,O0=`#define PI 3.141592653589793
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
} // validated`,B0=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,k0=`vec3 transformedNormal = objectNormal;
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
#endif`,z0=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,H0=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,V0=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,G0=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,W0="gl_FragColor = linearToOutputTexel( gl_FragColor );",X0=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Y0=`#ifdef USE_ENVMAP
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
#endif`,q0=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,Z0=`#ifdef USE_ENVMAP
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
#endif`,$0=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,J0=`#ifdef USE_ENVMAP
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
#endif`,K0=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,j0=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Q0=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,tm=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,em=`#ifdef USE_GRADIENTMAP
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
}`,nm=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,im=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,sm=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,rm=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,om=`#ifdef USE_ENVMAP
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
#endif`,am=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,cm=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,lm=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,hm=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,um=`PhysicalMaterial material;
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
#endif`,dm=`uniform sampler2D dfgLUT;
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
}`,fm=`
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
#endif`,pm=`#if defined( RE_IndirectDiffuse )
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
#endif`,mm=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,gm=`#ifdef USE_LIGHT_PROBES_GRID
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
#endif`,_m=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,xm=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,ym=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,vm=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,bm=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Sm=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Mm=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Em=`#if defined( USE_POINTS_UV )
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
#endif`,wm=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Tm=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Am=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Rm=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Cm=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Pm=`#ifdef USE_MORPHTARGETS
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
#endif`,Im=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Lm=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,Dm=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,Nm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Um=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Fm=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,Om=`#ifdef USE_NORMALMAP
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
#endif`,Bm=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,km=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,zm=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Hm=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Vm=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Gm=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,Wm=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Xm=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Ym=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,qm=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Zm=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,$m=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Jm=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Km=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,jm=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,Qm=`float getShadowMask() {
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
}`,tg=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,eg=`#ifdef USE_SKINNING
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
#endif`,ng=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,ig=`#ifdef USE_SKINNING
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
#endif`,sg=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,rg=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,og=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,ag=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,cg=`#ifdef USE_TRANSMISSION
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
#endif`,lg=`#ifdef USE_TRANSMISSION
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
#endif`,hg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,ug=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,dg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,fg=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,pg=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,mg=`uniform sampler2D t2D;
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
}`,gg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,_g=`#ifdef ENVMAP_TYPE_CUBE
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
}`,xg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,yg=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,vg=`#include <common>
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
}`,bg=`#if DEPTH_PACKING == 3200
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
}`,Sg=`#define DISTANCE
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
}`,Mg=`#define DISTANCE
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
}`,Eg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,wg=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Tg=`uniform float scale;
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
}`,Ag=`uniform vec3 diffuse;
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
}`,Rg=`#include <common>
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
}`,Cg=`uniform vec3 diffuse;
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
}`,Pg=`#define LAMBERT
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
}`,Ig=`#define LAMBERT
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
}`,Lg=`#define MATCAP
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
}`,Dg=`#define MATCAP
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
}`,Ng=`#define NORMAL
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
}`,Ug=`#define NORMAL
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
}`,Fg=`#define PHONG
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
}`,Og=`#define PHONG
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
}`,Bg=`#define STANDARD
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
}`,kg=`#define STANDARD
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
}`,zg=`#define TOON
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
}`,Hg=`#define TOON
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
}`,Vg=`uniform float size;
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
}`,Gg=`uniform vec3 diffuse;
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
}`,Wg=`#include <common>
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
}`,Xg=`uniform vec3 color;
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
}`,Yg=`uniform float rotation;
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
}`,qg=`uniform vec3 diffuse;
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
}`,fe={alphahash_fragment:p0,alphahash_pars_fragment:m0,alphamap_fragment:g0,alphamap_pars_fragment:_0,alphatest_fragment:x0,alphatest_pars_fragment:y0,aomap_fragment:v0,aomap_pars_fragment:b0,batching_pars_vertex:S0,batching_vertex:M0,begin_vertex:E0,beginnormal_vertex:w0,bsdfs:T0,iridescence_fragment:A0,bumpmap_pars_fragment:R0,clipping_planes_fragment:C0,clipping_planes_pars_fragment:P0,clipping_planes_pars_vertex:I0,clipping_planes_vertex:L0,color_fragment:D0,color_pars_fragment:N0,color_pars_vertex:U0,color_vertex:F0,common:O0,cube_uv_reflection_fragment:B0,defaultnormal_vertex:k0,displacementmap_pars_vertex:z0,displacementmap_vertex:H0,emissivemap_fragment:V0,emissivemap_pars_fragment:G0,colorspace_fragment:W0,colorspace_pars_fragment:X0,envmap_fragment:Y0,envmap_common_pars_fragment:q0,envmap_pars_fragment:Z0,envmap_pars_vertex:$0,envmap_physical_pars_fragment:om,envmap_vertex:J0,fog_vertex:K0,fog_pars_vertex:j0,fog_fragment:Q0,fog_pars_fragment:tm,gradientmap_pars_fragment:em,lightmap_pars_fragment:nm,lights_lambert_fragment:im,lights_lambert_pars_fragment:sm,lights_pars_begin:rm,lights_toon_fragment:am,lights_toon_pars_fragment:cm,lights_phong_fragment:lm,lights_phong_pars_fragment:hm,lights_physical_fragment:um,lights_physical_pars_fragment:dm,lights_fragment_begin:fm,lights_fragment_maps:pm,lights_fragment_end:mm,lightprobes_pars_fragment:gm,logdepthbuf_fragment:_m,logdepthbuf_pars_fragment:xm,logdepthbuf_pars_vertex:ym,logdepthbuf_vertex:vm,map_fragment:bm,map_pars_fragment:Sm,map_particle_fragment:Mm,map_particle_pars_fragment:Em,metalnessmap_fragment:wm,metalnessmap_pars_fragment:Tm,morphinstance_vertex:Am,morphcolor_vertex:Rm,morphnormal_vertex:Cm,morphtarget_pars_vertex:Pm,morphtarget_vertex:Im,normal_fragment_begin:Lm,normal_fragment_maps:Dm,normal_pars_fragment:Nm,normal_pars_vertex:Um,normal_vertex:Fm,normalmap_pars_fragment:Om,clearcoat_normal_fragment_begin:Bm,clearcoat_normal_fragment_maps:km,clearcoat_pars_fragment:zm,iridescence_pars_fragment:Hm,opaque_fragment:Vm,packing:Gm,premultiplied_alpha_fragment:Wm,project_vertex:Xm,dithering_fragment:Ym,dithering_pars_fragment:qm,roughnessmap_fragment:Zm,roughnessmap_pars_fragment:$m,shadowmap_pars_fragment:Jm,shadowmap_pars_vertex:Km,shadowmap_vertex:jm,shadowmask_pars_fragment:Qm,skinbase_vertex:tg,skinning_pars_vertex:eg,skinning_vertex:ng,skinnormal_vertex:ig,specularmap_fragment:sg,specularmap_pars_fragment:rg,tonemapping_fragment:og,tonemapping_pars_fragment:ag,transmission_fragment:cg,transmission_pars_fragment:lg,uv_pars_fragment:hg,uv_pars_vertex:ug,uv_vertex:dg,worldpos_vertex:fg,background_vert:pg,background_frag:mg,backgroundCube_vert:gg,backgroundCube_frag:_g,cube_vert:xg,cube_frag:yg,depth_vert:vg,depth_frag:bg,distance_vert:Sg,distance_frag:Mg,equirect_vert:Eg,equirect_frag:wg,linedashed_vert:Tg,linedashed_frag:Ag,meshbasic_vert:Rg,meshbasic_frag:Cg,meshlambert_vert:Pg,meshlambert_frag:Ig,meshmatcap_vert:Lg,meshmatcap_frag:Dg,meshnormal_vert:Ng,meshnormal_frag:Ug,meshphong_vert:Fg,meshphong_frag:Og,meshphysical_vert:Bg,meshphysical_frag:kg,meshtoon_vert:zg,meshtoon_frag:Hg,points_vert:Vg,points_frag:Gg,shadow_vert:Wg,shadow_frag:Xg,sprite_vert:Yg,sprite_frag:qg},Nt={common:{diffuse:{value:new te(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new le},alphaMap:{value:null},alphaMapTransform:{value:new le},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new le}},envmap:{envMap:{value:null},envMapRotation:{value:new le},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new le}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new le}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new le},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new le},normalScale:{value:new pt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new le},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new le}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new le}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new le}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new te(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new D},probesMax:{value:new D},probesResolution:{value:new D}},points:{diffuse:{value:new te(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new le},alphaTest:{value:0},uvTransform:{value:new le}},sprite:{diffuse:{value:new te(16777215)},opacity:{value:1},center:{value:new pt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new le},alphaMap:{value:null},alphaMapTransform:{value:new le},alphaTest:{value:0}}},mi={basic:{uniforms:bn([Nt.common,Nt.specularmap,Nt.envmap,Nt.aomap,Nt.lightmap,Nt.fog]),vertexShader:fe.meshbasic_vert,fragmentShader:fe.meshbasic_frag},lambert:{uniforms:bn([Nt.common,Nt.specularmap,Nt.envmap,Nt.aomap,Nt.lightmap,Nt.emissivemap,Nt.bumpmap,Nt.normalmap,Nt.displacementmap,Nt.fog,Nt.lights,{emissive:{value:new te(0)},envMapIntensity:{value:1}}]),vertexShader:fe.meshlambert_vert,fragmentShader:fe.meshlambert_frag},phong:{uniforms:bn([Nt.common,Nt.specularmap,Nt.envmap,Nt.aomap,Nt.lightmap,Nt.emissivemap,Nt.bumpmap,Nt.normalmap,Nt.displacementmap,Nt.fog,Nt.lights,{emissive:{value:new te(0)},specular:{value:new te(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:fe.meshphong_vert,fragmentShader:fe.meshphong_frag},standard:{uniforms:bn([Nt.common,Nt.envmap,Nt.aomap,Nt.lightmap,Nt.emissivemap,Nt.bumpmap,Nt.normalmap,Nt.displacementmap,Nt.roughnessmap,Nt.metalnessmap,Nt.fog,Nt.lights,{emissive:{value:new te(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:fe.meshphysical_vert,fragmentShader:fe.meshphysical_frag},toon:{uniforms:bn([Nt.common,Nt.aomap,Nt.lightmap,Nt.emissivemap,Nt.bumpmap,Nt.normalmap,Nt.displacementmap,Nt.gradientmap,Nt.fog,Nt.lights,{emissive:{value:new te(0)}}]),vertexShader:fe.meshtoon_vert,fragmentShader:fe.meshtoon_frag},matcap:{uniforms:bn([Nt.common,Nt.bumpmap,Nt.normalmap,Nt.displacementmap,Nt.fog,{matcap:{value:null}}]),vertexShader:fe.meshmatcap_vert,fragmentShader:fe.meshmatcap_frag},points:{uniforms:bn([Nt.points,Nt.fog]),vertexShader:fe.points_vert,fragmentShader:fe.points_frag},dashed:{uniforms:bn([Nt.common,Nt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:fe.linedashed_vert,fragmentShader:fe.linedashed_frag},depth:{uniforms:bn([Nt.common,Nt.displacementmap]),vertexShader:fe.depth_vert,fragmentShader:fe.depth_frag},normal:{uniforms:bn([Nt.common,Nt.bumpmap,Nt.normalmap,Nt.displacementmap,{opacity:{value:1}}]),vertexShader:fe.meshnormal_vert,fragmentShader:fe.meshnormal_frag},sprite:{uniforms:bn([Nt.sprite,Nt.fog]),vertexShader:fe.sprite_vert,fragmentShader:fe.sprite_frag},background:{uniforms:{uvTransform:{value:new le},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:fe.background_vert,fragmentShader:fe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new le}},vertexShader:fe.backgroundCube_vert,fragmentShader:fe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:fe.cube_vert,fragmentShader:fe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:fe.equirect_vert,fragmentShader:fe.equirect_frag},distance:{uniforms:bn([Nt.common,Nt.displacementmap,{referencePosition:{value:new D},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:fe.distance_vert,fragmentShader:fe.distance_frag},shadow:{uniforms:bn([Nt.lights,Nt.fog,{color:{value:new te(0)},opacity:{value:1}}]),vertexShader:fe.shadow_vert,fragmentShader:fe.shadow_frag}};mi.physical={uniforms:bn([mi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new le},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new le},clearcoatNormalScale:{value:new pt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new le},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new le},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new le},sheen:{value:0},sheenColor:{value:new te(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new le},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new le},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new le},transmissionSamplerSize:{value:new pt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new le},attenuationDistance:{value:0},attenuationColor:{value:new te(0)},specularColor:{value:new te(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new le},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new le},anisotropyVector:{value:new pt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new le}}]),vertexShader:fe.meshphysical_vert,fragmentShader:fe.meshphysical_frag};var Vc={r:0,b:0,g:0},Zg=new Pe,$d=new le;$d.set(-1,0,0,0,1,0,0,0,1);function $g(i,t,e,n,s,r){let o=new te(0),a=s===!0?0:1,c,l,h=null,u=0,d=null;function f(y){let S=y.isScene===!0?y.background:null;if(S&&S.isTexture){let v=y.backgroundBlurriness>0;S=t.get(S,v)}return S}function _(y){let S=!1,v=f(y);v===null?m(o,a):v&&v.isColor&&(m(v,1),S=!0);let M=i.xr.getEnvironmentBlendMode();M==="additive"?e.buffers.color.setClear(0,0,0,1,r):M==="alpha-blend"&&e.buffers.color.setClear(0,0,0,0,r),(i.autoClear||S)&&(e.buffers.depth.setTest(!0),e.buffers.depth.setMask(!0),e.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function g(y,S){let v=f(S);v&&(v.isCubeTexture||v.mapping===Mo)?(l===void 0&&(l=new Dt(new fn(1,1,1),new kn({name:"BackgroundCubeMaterial",uniforms:ws(mi.backgroundCube.uniforms),vertexShader:mi.backgroundCube.vertexShader,fragmentShader:mi.backgroundCube.fragmentShader,side:Ke,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),l.geometry.deleteAttribute("uv"),l.onBeforeRender=function(M,E,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(l)),l.material.uniforms.envMap.value=v,l.material.uniforms.backgroundBlurriness.value=S.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(Zg.makeRotationFromEuler(S.backgroundRotation)).transpose(),v.isCubeTexture&&v.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply($d),l.material.toneMapped=xe.getTransfer(v.colorSpace)!==Ae,(h!==v||u!==v.version||d!==i.toneMapping)&&(l.material.needsUpdate=!0,h=v,u=v.version,d=i.toneMapping),l.layers.enableAll(),y.unshift(l,l.geometry,l.material,0,0,null)):v&&v.isTexture&&(c===void 0&&(c=new Dt(new Cn(2,2),new kn({name:"BackgroundMaterial",uniforms:ws(mi.background.uniforms),vertexShader:mi.background.vertexShader,fragmentShader:mi.background.fragmentShader,side:Qi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(c)),c.material.uniforms.t2D.value=v,c.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,c.material.toneMapped=xe.getTransfer(v.colorSpace)!==Ae,v.matrixAutoUpdate===!0&&v.updateMatrix(),c.material.uniforms.uvTransform.value.copy(v.matrix),(h!==v||u!==v.version||d!==i.toneMapping)&&(c.material.needsUpdate=!0,h=v,u=v.version,d=i.toneMapping),c.layers.enableAll(),y.unshift(c,c.geometry,c.material,0,0,null))}function m(y,S){y.getRGB(Vc,_h(i)),e.buffers.color.setClear(Vc.r,Vc.g,Vc.b,S,r)}function p(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(y,S=1){o.set(y),a=S,m(o,a)},getClearAlpha:function(){return a},setClearAlpha:function(y){a=y,m(o,a)},render:_,addToRenderList:g,dispose:p}}function Jg(i,t){let e=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=d(null),r=s,o=!1;function a(L,P,O,F,X){let q=!1,N=u(L,F,O,P);r!==N&&(r=N,l(r.object)),q=f(L,F,O,X),q&&_(L,F,O,X),X!==null&&t.update(X,i.ELEMENT_ARRAY_BUFFER),(q||o)&&(o=!1,v(L,P,O,F),X!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(X).buffer))}function c(){return i.createVertexArray()}function l(L){return i.bindVertexArray(L)}function h(L){return i.deleteVertexArray(L)}function u(L,P,O,F){let X=F.wireframe===!0,q=n[P.id];q===void 0&&(q={},n[P.id]=q);let N=L.isInstancedMesh===!0?L.id:0,Z=q[N];Z===void 0&&(Z={},q[N]=Z);let V=Z[O.id];V===void 0&&(V={},Z[O.id]=V);let Y=V[X];return Y===void 0&&(Y=d(c()),V[X]=Y),Y}function d(L){let P=[],O=[],F=[];for(let X=0;X<e;X++)P[X]=0,O[X]=0,F[X]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:P,enabledAttributes:O,attributeDivisors:F,object:L,attributes:{},index:null}}function f(L,P,O,F){let X=r.attributes,q=P.attributes,N=0,Z=O.getAttributes();for(let V in Z)if(Z[V].location>=0){let J=X[V],Rt=q[V];if(Rt===void 0&&(V==="instanceMatrix"&&L.instanceMatrix&&(Rt=L.instanceMatrix),V==="instanceColor"&&L.instanceColor&&(Rt=L.instanceColor)),J===void 0||J.attribute!==Rt||Rt&&J.data!==Rt.data)return!0;N++}return r.attributesNum!==N||r.index!==F}function _(L,P,O,F){let X={},q=P.attributes,N=0,Z=O.getAttributes();for(let V in Z)if(Z[V].location>=0){let J=q[V];J===void 0&&(V==="instanceMatrix"&&L.instanceMatrix&&(J=L.instanceMatrix),V==="instanceColor"&&L.instanceColor&&(J=L.instanceColor));let Rt={};Rt.attribute=J,J&&J.data&&(Rt.data=J.data),X[V]=Rt,N++}r.attributes=X,r.attributesNum=N,r.index=F}function g(){let L=r.newAttributes;for(let P=0,O=L.length;P<O;P++)L[P]=0}function m(L){p(L,0)}function p(L,P){let O=r.newAttributes,F=r.enabledAttributes,X=r.attributeDivisors;O[L]=1,F[L]===0&&(i.enableVertexAttribArray(L),F[L]=1),X[L]!==P&&(i.vertexAttribDivisor(L,P),X[L]=P)}function y(){let L=r.newAttributes,P=r.enabledAttributes;for(let O=0,F=P.length;O<F;O++)P[O]!==L[O]&&(i.disableVertexAttribArray(O),P[O]=0)}function S(L,P,O,F,X,q,N){N===!0?i.vertexAttribIPointer(L,P,O,X,q):i.vertexAttribPointer(L,P,O,F,X,q)}function v(L,P,O,F){g();let X=F.attributes,q=O.getAttributes(),N=P.defaultAttributeValues;for(let Z in q){let V=q[Z];if(V.location>=0){let Y=X[Z];if(Y===void 0&&(Z==="instanceMatrix"&&L.instanceMatrix&&(Y=L.instanceMatrix),Z==="instanceColor"&&L.instanceColor&&(Y=L.instanceColor)),Y!==void 0){let J=Y.normalized,Rt=Y.itemSize,bt=t.get(Y);if(bt===void 0)continue;let ie=bt.buffer,Lt=bt.type,oe=bt.bytesPerElement,et=Lt===i.INT||Lt===i.UNSIGNED_INT||Y.gpuType===ic;if(Y.isInterleavedBufferAttribute){let W=Y.data,ht=W.stride,lt=Y.offset;if(W.isInstancedInterleavedBuffer){for(let ut=0;ut<V.locationSize;ut++)p(V.location+ut,W.meshPerAttribute);L.isInstancedMesh!==!0&&F._maxInstanceCount===void 0&&(F._maxInstanceCount=W.meshPerAttribute*W.count)}else for(let ut=0;ut<V.locationSize;ut++)m(V.location+ut);i.bindBuffer(i.ARRAY_BUFFER,ie);for(let ut=0;ut<V.locationSize;ut++)S(V.location+ut,Rt/V.locationSize,Lt,J,ht*oe,(lt+Rt/V.locationSize*ut)*oe,et)}else{if(Y.isInstancedBufferAttribute){for(let W=0;W<V.locationSize;W++)p(V.location+W,Y.meshPerAttribute);L.isInstancedMesh!==!0&&F._maxInstanceCount===void 0&&(F._maxInstanceCount=Y.meshPerAttribute*Y.count)}else for(let W=0;W<V.locationSize;W++)m(V.location+W);i.bindBuffer(i.ARRAY_BUFFER,ie);for(let W=0;W<V.locationSize;W++)S(V.location+W,Rt/V.locationSize,Lt,J,Rt*oe,Rt/V.locationSize*W*oe,et)}}else if(N!==void 0){let J=N[Z];if(J!==void 0)switch(J.length){case 2:i.vertexAttrib2fv(V.location,J);break;case 3:i.vertexAttrib3fv(V.location,J);break;case 4:i.vertexAttrib4fv(V.location,J);break;default:i.vertexAttrib1fv(V.location,J)}}}}y()}function M(){w();for(let L in n){let P=n[L];for(let O in P){let F=P[O];for(let X in F){let q=F[X];for(let N in q)h(q[N].object),delete q[N];delete F[X]}}delete n[L]}}function E(L){if(n[L.id]===void 0)return;let P=n[L.id];for(let O in P){let F=P[O];for(let X in F){let q=F[X];for(let N in q)h(q[N].object),delete q[N];delete F[X]}}delete n[L.id]}function A(L){for(let P in n){let O=n[P];for(let F in O){let X=O[F];if(X[L.id]===void 0)continue;let q=X[L.id];for(let N in q)h(q[N].object),delete q[N];delete X[L.id]}}}function x(L){for(let P in n){let O=n[P],F=L.isInstancedMesh===!0?L.id:0,X=O[F];if(X!==void 0){for(let q in X){let N=X[q];for(let Z in N)h(N[Z].object),delete N[Z];delete X[q]}delete O[F],Object.keys(O).length===0&&delete n[P]}}}function w(){C(),o=!0,r!==s&&(r=s,l(r.object))}function C(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:w,resetDefaultState:C,dispose:M,releaseStatesOfGeometry:E,releaseStatesOfObject:x,releaseStatesOfProgram:A,initAttributes:g,enableAttribute:m,disableUnusedAttributes:y}}function Kg(i,t,e){let n;function s(c){n=c}function r(c,l){i.drawArrays(n,c,l),e.update(l,n,1)}function o(c,l,h){h!==0&&(i.drawArraysInstanced(n,c,l,h),e.update(l,n,h))}function a(c,l,h){if(h===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,l,0,h);let d=0;for(let f=0;f<h;f++)d+=l[f];e.update(d,n,1)}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a}function jg(i,t,e,n){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){let A=t.get("EXT_texture_filter_anisotropic");s=i.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(A){return!(A!==An&&n.convert(A)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(A){let x=A===ri&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(A!==Pn&&A!==Yn&&!x&&n.convert(A)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function c(A){if(A==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=e.precision!==void 0?e.precision:"highp",h=c(l);h!==l&&(ne("WebGLRenderer:",l,"not supported, using",h,"instead."),l=h);let u=e.logarithmicDepthBuffer===!0,d=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control");e.reversedDepthBuffer===!0&&d===!1&&ne("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let f=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),_=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),p=i.getParameter(i.MAX_VERTEX_ATTRIBS),y=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),S=i.getParameter(i.MAX_VARYING_VECTORS),v=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),M=i.getParameter(i.MAX_SAMPLES),E=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:a,precision:l,logarithmicDepthBuffer:u,reversedDepthBuffer:d,maxTextures:f,maxVertexTextures:_,maxTextureSize:g,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:y,maxVaryings:S,maxFragmentUniforms:v,maxSamples:M,samples:E}}function Qg(i){let t=this,e=null,n=0,s=!1,r=!1,o=new Fn,a=new le,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){let f=u.length!==0||d||n!==0||s;return s=d,n=u.length,f},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,d){e=h(u,d,0)},this.setState=function(u,d,f){let _=u.clippingPlanes,g=u.clipIntersection,m=u.clipShadows,p=i.get(u);if(!s||_===null||_.length===0||r&&!m)r?h(null):l();else{let y=r?0:n,S=y*4,v=p.clippingState||null;c.value=v,v=h(_,d,S,f);for(let M=0;M!==S;++M)v[M]=e[M];p.clippingState=v,this.numIntersection=g?this.numPlanes:0,this.numPlanes+=y}};function l(){c.value!==e&&(c.value=e,c.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function h(u,d,f,_){let g=u!==null?u.length:0,m=null;if(g!==0){if(m=c.value,_!==!0||m===null){let p=f+g*4,y=d.matrixWorldInverse;a.getNormalMatrix(y),(m===null||m.length<p)&&(m=new Float32Array(p));for(let S=0,v=f;S!==g;++S,v+=4)o.copy(u[S]).applyMatrix4(y,a),o.normal.toArray(m,v),m[v+3]=o.constant}c.value=m,c.needsUpdate=!0}return t.numPlanes=g,t.numIntersection=0,m}}var vr=4,t_=6,e_=20,n_=256,Lo=new dr,Ad=new te,Th=null,Ah=0,Rh=0,Ch=!1,i_=new D,Ts=new D,Sr=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(t,e=0,n=.1,s=100,r={}){let{size:o=256,position:a=i_}=r;Th=this._renderer.getRenderTarget(),Ah=this._renderer.getActiveCubeFace(),Rh=this._renderer.getActiveMipmapLevel(),Ch=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);let c=this._allocateTargets();return c.depthBuffer=!0,this._sceneToCubeUV(t,n,s,c,a),e>0&&this._blur(c,0,0,e),this._applyPMREM(c),this._cleanup(c),c}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Pd(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Cd(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodMeshes.length;t++)this._lodMeshes[t].geometry.dispose()}_cleanup(t){this._renderer.setRenderTarget(Th,Ah,Rh),this._renderer.xr.enabled=Ch,t.scissorTest=!1,yr(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===ts||t.mapping===Ms?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),Th=this._renderer.getRenderTarget(),Ah=this._renderer.getActiveCubeFace(),Rh=this._renderer.getActiveMipmapLevel(),Ch=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:Ve,minFilter:Ve,generateMipmaps:!1,type:ri,format:An,colorSpace:Zr,depthBuffer:!1},s=Rd(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Rd(t,e,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=s_(r)),this._blurMaterial=o_(r,t,e),this._ggxMaterial=r_(r,t,e)}return s}_compileMaterial(t){let e=new Dt(new Ge,t);this._renderer.compile(e,Lo)}_sceneToCubeUV(t,e,n,s,r){let c=new Qe(90,1,e,n),l=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],u=this._renderer,d=u.autoClear,f=u.toneMapping;u.getClearColor(Ad),u.toneMapping=ii,u.autoClear=!1,u.state.buffers.depth.getReversed()&&(u.setRenderTarget(s),u.clearDepth(),u.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new Dt(new fn,new Ti({name:"PMREM.Background",side:Ke,depthWrite:!1,depthTest:!1})));let g=this._backgroundBox,m=g.material,p=!1,y=t.background;y?y.isColor&&(m.color.copy(y),t.background=null,p=!0):(m.color.copy(Ad),p=!0);for(let S=0;S<6;S++){let v=S%3;v===0?(c.up.set(0,l[S],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x+h[S],r.y,r.z)):v===1?(c.up.set(0,0,l[S]),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y+h[S],r.z)):(c.up.set(0,l[S],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y,r.z+h[S]));let M=this._cubeSize;yr(s,v*M,S>2?M:0,M,M),u.setRenderTarget(s),p&&u.render(g,c),u.render(t,c)}u.toneMapping=f,u.autoClear=d,t.background=y}_textureToCubeUV(t,e){let n=this._renderer,s=t.mapping===ts||t.mapping===Ms;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Pd()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Cd());let r=s?this._cubemapMaterial:this._equirectMaterial,o=this._lodMeshes[0];o.material=r;let a=r.uniforms;a.envMap.value=t;let c=this._cubeSize;yr(e,0,0,3*c,2*c),n.setRenderTarget(e),n.render(o,Lo)}_applyPMREM(t){let e=this._renderer,n=e.autoClear;e.autoClear=!1;let s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(t,r-1,r);e.autoClear=n}_applyGGXFilter(t,e,n){let s=this._renderer,r=this._pingPongRenderTarget,o=this._ggxMaterial,a=this._lodMeshes[n];a.material=o;let c=o.uniforms,l=n/(this._lodMeshes.length-1),h=e/(this._lodMeshes.length-1),u=Math.sqrt(l*l-h*h),d=l*1.25,f=u*d,{_lodMax:_}=this,g=this._sizeLods[n],m=3*g*(n>_-vr?n-_+vr:0),p=4*(this._cubeSize-g);c.envMap.value=t.texture,c.roughness.value=f,c.mipInt.value=_-e,yr(r,m,p,3*g,2*g),s.setRenderTarget(r),s.render(a,Lo),c.envMap.value=r.texture,c.roughness.value=0,c.mipInt.value=_-n,yr(t,m,p,3*g,2*g),s.setRenderTarget(t),s.render(a,Lo)}_blur(t,e,n,s){let r=this._pingPongRenderTarget,o=Math.min(s,Math.PI)/Math.SQRT2;this._blurPass(t,r,e,n,o),this._blurPass(r,t,n,n,o)}_blurPass(t,e,n,s,r){let o=this._renderer,a=this._blurMaterial,c=this._lodMeshes[s];c.material=a;let l=a.uniforms;l.envMap.value=t.texture,l.sigma.value=r,l.mipInt.value=this._lodMax-n;let h=this._sizeLods[s],u=3*h*(s>this._lodMax-vr?s-this._lodMax+vr:0),d=4*(this._cubeSize-h);yr(e,u,d,3*h,2*h),o.setRenderTarget(e),o.render(c,Lo)}};function s_(i){let t=[],e=[],n=i,s=i-vr+1+t_;for(let r=0;r<s;r++){let o=Math.pow(2,n);t.push(o);let a=1/(o-2),c=-a,l=1+a,h=[c,c,l,c,l,l,c,c,l,l,c,l],u=6,d=6,f=3,_=new Float32Array(f*d*u),g=new Float32Array(f*d*u);for(let p=0;p<u;p++){let y=p%3*2/3-1,S=p>2?0:-1,v=[y,S,0,y+2/3,S,0,y+2/3,S+1,0,y,S,0,y+2/3,S+1,0,y,S+1,0];_.set(v,f*d*p);for(let M=0;M<d;M++){let E=h[M*2]*2-1,A=h[M*2+1]*2-1;p===0?Ts.set(1,A,E):p===1?Ts.set(-E,1,-A):p===2?Ts.set(-E,A,1):p===3?Ts.set(-1,A,-E):p===4?Ts.set(-E,-1,A):Ts.set(E,A,-1),Ts.toArray(g,(p*d+M)*f)}}let m=new Ge;m.setAttribute("position",new On(_,f)),m.setAttribute("outputDirection",new On(g,f)),e.push(new Dt(m,null)),n>vr&&n--}return{lodMeshes:e,sizeLods:t}}function Rd(i,t,e){let n=new Rn(i,t,e);return n.texture.mapping=Mo,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function yr(i,t,e,n,s){i.viewport.set(t,e,n,s),i.scissor.set(t,e,n,s)}function r_(i,t,e){return new kn({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:n_,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Yc(),fragmentShader:`

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
		`,blending:fi,depthTest:!1,depthWrite:!1})}function o_(i,t,e){return new kn({name:"SphericalGaussianBlur",defines:{SAMPLES:e_,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:Yc(),fragmentShader:`

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
		`,blending:fi,depthTest:!1,depthWrite:!1})}function Cd(){return new kn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Yc(),fragmentShader:`

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
		`,blending:fi,depthTest:!1,depthWrite:!1})}function Pd(){return new kn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Yc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:fi,depthTest:!1,depthWrite:!1})}function Yc(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var Wc=class extends Rn{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let n={width:t,height:t,depth:1},s=[n,n,n,n,n,n];this.texture=new no(s),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new fn(5,5,5),r=new kn({name:"CubemapFromEquirect",uniforms:ws(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Ke,blending:fi});r.uniforms.tEquirect.value=e;let o=new Dt(s,r),a=e.minFilter;return e.minFilter===es&&(e.minFilter=Ve),new Ja(1,10,this).update(t,o),e.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(t,e=!0,n=!0,s=!0){let r=t.getRenderTarget();for(let o=0;o<6;o++)t.setRenderTarget(this,o),t.clear(e,n,s);t.setRenderTarget(r)}};function a_(i){let t=new WeakMap,e=new WeakMap,n=null;function s(d,f=!1){return d==null?null:f?o(d):r(d)}function r(d){if(d&&d.isTexture){let f=d.mapping;if(f===gr||f===ec)if(t.has(d)){let _=t.get(d).texture;return a(_,d.mapping)}else{let _=d.image;if(_&&_.height>0){let g=new Wc(_.height);return g.fromEquirectangularTexture(i,d),t.set(d,g),d.addEventListener("dispose",l),a(g.texture,d.mapping)}else return null}}return d}function o(d){if(d&&d.isTexture){let f=d.mapping,_=f===gr||f===ec,g=f===ts||f===Ms;if(_||g){let m=e.get(d),p=m!==void 0?m.texture.pmremVersion:0;if(d.isRenderTargetTexture&&d.pmremVersion!==p)return n===null&&(n=new Sr(i)),m=_?n.fromEquirectangular(d,m):n.fromCubemap(d,m),m.texture.pmremVersion=d.pmremVersion,e.set(d,m),m.texture;if(m!==void 0)return m.texture;{let y=d.image;return _&&y&&y.height>0||g&&y&&c(y)?(n===null&&(n=new Sr(i)),m=_?n.fromEquirectangular(d):n.fromCubemap(d),m.texture.pmremVersion=d.pmremVersion,e.set(d,m),d.addEventListener("dispose",h),m.texture):null}}}return d}function a(d,f){return f===gr?d.mapping=ts:f===ec&&(d.mapping=Ms),d}function c(d){let f=0,_=6;for(let g=0;g<_;g++)d[g]!==void 0&&f++;return f===_}function l(d){let f=d.target;f.removeEventListener("dispose",l);let _=t.get(f);_!==void 0&&(t.delete(f),_.dispose())}function h(d){let f=d.target;f.removeEventListener("dispose",h);let _=e.get(f);_!==void 0&&(e.delete(f),_.dispose())}function u(){t=new WeakMap,e=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:u}}function c_(i){let t={};function e(n){if(t[n]!==void 0)return t[n];let s=i.getExtension(n);return t[n]=s,s}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){let s=e(n);return s===null&&ms("WebGLRenderer: "+n+" extension not supported."),s}}}function l_(i,t,e,n){let s={},r=new WeakMap;function o(u){let d=u.target;d.index!==null&&t.remove(d.index);for(let _ in d.attributes)t.remove(d.attributes[_]);d.removeEventListener("dispose",o),delete s[d.id];let f=r.get(d);f&&(t.remove(f),r.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,e.memory.geometries--}function a(u,d){return s[d.id]===!0||(d.addEventListener("dispose",o),s[d.id]=!0,e.memory.geometries++),d}function c(u){let d=u.attributes;for(let f in d)t.update(d[f],i.ARRAY_BUFFER)}function l(u){let d=[],f=u.index,_=u.attributes.position,g=0;if(_===void 0)return;if(f!==null){let y=f.array;g=f.version;for(let S=0,v=y.length;S<v;S+=3){let M=y[S+0],E=y[S+1],A=y[S+2];d.push(M,E,E,A,A,M)}}else{let y=_.array;g=_.version;for(let S=0,v=y.length/3-1;S<v;S+=3){let M=S+0,E=S+1,A=S+2;d.push(M,E,E,A,A,M)}}let m=new(_.count>=65535?Qr:jr)(d,1);m.version=g;let p=r.get(u);p&&t.remove(p),r.set(u,m)}function h(u){let d=r.get(u);if(d){let f=u.index;f!==null&&d.version<f.version&&l(u)}else l(u);return r.get(u)}return{get:a,update:c,getWireframeAttribute:h}}function h_(i,t,e){let n;function s(u){n=u}let r,o;function a(u){r=u.type,o=u.bytesPerElement}function c(u,d){i.drawElements(n,d,r,u*o),e.update(d,n,1)}function l(u,d,f){f!==0&&(i.drawElementsInstanced(n,d,r,u*o,f),e.update(d,n,f))}function h(u,d,f){if(f===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,d,0,r,u,0,f);let g=0;for(let m=0;m<f;m++)g+=d[m];e.update(g,n,1)}this.setMode=s,this.setIndex=a,this.render=c,this.renderInstances=l,this.renderMultiDraw=h}function u_(i){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(e.calls++,o){case i.TRIANGLES:e.triangles+=a*(r/3);break;case i.LINES:e.lines+=a*(r/2);break;case i.LINE_STRIP:e.lines+=a*(r-1);break;case i.LINE_LOOP:e.lines+=a*r;break;case i.POINTS:e.points+=a*r;break;default:re("WebGLInfo: Unknown draw mode:",o);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:n}}function d_(i,t,e){let n=new WeakMap,s=new Be;function r(o,a,c){let l=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,u=h!==void 0?h.length:0,d=n.get(a);if(d===void 0||d.count!==u){let w=function(){A.dispose(),n.delete(a),a.removeEventListener("dispose",w)};d!==void 0&&d.texture.dispose();let f=a.morphAttributes.position!==void 0,_=a.morphAttributes.normal!==void 0,g=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],p=a.morphAttributes.normal||[],y=a.morphAttributes.color||[],S=0;f===!0&&(S=1),_===!0&&(S=2),g===!0&&(S=3);let v=a.attributes.position.count*S,M=1;v>t.maxTextureSize&&(M=Math.ceil(v/t.maxTextureSize),v=t.maxTextureSize);let E=new Float32Array(v*M*4*u),A=new Kr(E,v,M,u);A.type=Yn,A.needsUpdate=!0;let x=S*4;for(let C=0;C<u;C++){let L=m[C],P=p[C],O=y[C],F=v*M*4*C;for(let X=0;X<L.count;X++){let q=X*x;f===!0&&(s.fromBufferAttribute(L,X),E[F+q+0]=s.x,E[F+q+1]=s.y,E[F+q+2]=s.z,E[F+q+3]=0),_===!0&&(s.fromBufferAttribute(P,X),E[F+q+4]=s.x,E[F+q+5]=s.y,E[F+q+6]=s.z,E[F+q+7]=0),g===!0&&(s.fromBufferAttribute(O,X),E[F+q+8]=s.x,E[F+q+9]=s.y,E[F+q+10]=s.z,E[F+q+11]=O.itemSize===4?s.w:1)}}d={count:u,texture:A,size:new pt(v,M)},n.set(a,d),a.addEventListener("dispose",w)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)c.getUniforms().setValue(i,"morphTexture",o.morphTexture,e);else{let f=0;for(let g=0;g<l.length;g++)f+=l[g];let _=a.morphTargetsRelative?1:1-f;c.getUniforms().setValue(i,"morphTargetBaseInfluence",_),c.getUniforms().setValue(i,"morphTargetInfluences",l)}c.getUniforms().setValue(i,"morphTargetsTexture",d.texture,e),c.getUniforms().setValue(i,"morphTargetsTextureSize",d.size)}return{update:r}}function f_(i,t,e,n,s){let r=new WeakMap;function o(l){let h=s.render.frame,u=l.geometry,d=t.get(l,u);if(r.get(d)!==h&&(t.update(d),r.set(d,h)),l.isInstancedMesh&&(l.hasEventListener("dispose",c)===!1&&l.addEventListener("dispose",c),r.get(l)!==h&&(e.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&e.update(l.instanceColor,i.ARRAY_BUFFER),r.set(l,h))),l.isSkinnedMesh){let f=l.skeleton;r.get(f)!==h&&(f.update(),r.set(f,h))}return d}function a(){r=new WeakMap}function c(l){let h=l.target;h.removeEventListener("dispose",c),n.releaseStatesOfObject(h),e.remove(h.instanceMatrix),h.instanceColor!==null&&e.remove(h.instanceColor)}return{update:o,dispose:a}}var p_={[Ql]:"LINEAR_TONE_MAPPING",[th]:"REINHARD_TONE_MAPPING",[eh]:"CINEON_TONE_MAPPING",[mr]:"ACES_FILMIC_TONE_MAPPING",[ih]:"AGX_TONE_MAPPING",[sh]:"NEUTRAL_TONE_MAPPING",[nh]:"CUSTOM_TONE_MAPPING"};function m_(i,t,e,n,s,r){let o=new Rn(t,e,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),a=null,c=null,l=new Ge;l.setAttribute("position",new ye([-1,3,0,-1,-1,0,3,-1,0],3)),l.setAttribute("uv",new ye([0,2,0,0,2,0],2));let h=new Oa({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),u=new Dt(l,h),d=new dr(-1,1,1,-1,0,1),f=null,_=null,g=!1,m,p=null,y=[],S=!1;this.setSize=function(v,M){o.setSize(v,M),a!==null&&a.setSize(v,M),c!==null&&c.setSize(v,M);for(let E=0;E<y.length;E++){let A=y[E];A.setSize&&A.setSize(v,M)}},this.setEffects=function(v){y=v,S=y.length>0&&y[0].isRenderPass===!0;let M=o.width,E=o.height;y.length>0&&a===null&&(a=new Rn(M,E,{type:ri,depthBuffer:!1,stencilBuffer:!1}),c=new Rn(M,E,{type:ri,depthBuffer:!1,stencilBuffer:!1}));for(let A=0;A<y.length;A++){let x=y[A];x.setSize&&x.setSize(M,E)}},this.begin=function(v,M){if(g||v.toneMapping===ii&&y.length===0)return!1;if(p=M,M!==null){let E=M.width,A=M.height;(o.width!==E||o.height!==A)&&this.setSize(E,A)}return S===!1&&v.setRenderTarget(o),m=v.toneMapping,v.toneMapping=ii,!0},this.hasRenderPass=function(){return S},this.end=function(v,M){v.toneMapping=m,g=!0;let E=o,A=a;for(let x=0;x<y.length;x++){let w=y[x];w.enabled!==!1&&(w.render(v,A,E,M),w.needsSwap!==!1&&(E=A,A=A===a?c:a))}if(f!==v.outputColorSpace||_!==v.toneMapping){f=v.outputColorSpace,_=v.toneMapping,h.defines={},xe.getTransfer(f)===Ae&&(h.defines.SRGB_TRANSFER="");let x=p_[_];x&&(h.defines[x]=""),h.needsUpdate=!0}h.uniforms.tDiffuse.value=E.texture,v.setRenderTarget(p),v.render(u,d),p=null,g=!1},this.isCompositing=function(){return g},this.dispose=function(){o.dispose(),a!==null&&a.dispose(),c!==null&&c.dispose(),l.dispose(),h.dispose()}}var Jd=new Tn,Lh=new Xi(1,1),Kd=new Kr,jd=new Ra,Qd=new no,Id=[],Ld=[],Dd=new Float32Array(16),Nd=new Float32Array(9),Ud=new Float32Array(4);function Mr(i,t,e){let n=i[0];if(n<=0||n>0)return i;let s=t*e,r=Id[s];if(r===void 0&&(r=new Float32Array(s),Id[s]=r),t!==0){n.toArray(r,0);for(let o=1,a=0;o!==t;++o)a+=e,i[o].toArray(r,a)}return r}function tn(i,t){if(i.length!==t.length)return!1;for(let e=0,n=i.length;e<n;e++)if(i[e]!==t[e])return!1;return!0}function en(i,t){for(let e=0,n=t.length;e<n;e++)i[e]=t[e]}function qc(i,t){let e=Ld[t];e===void 0&&(e=new Int32Array(t),Ld[t]=e);for(let n=0;n!==t;++n)e[n]=i.allocateTextureUnit();return e}function g_(i,t){let e=this.cache;e[0]!==t&&(i.uniform1f(this.addr,t),e[0]=t)}function __(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(tn(e,t))return;i.uniform2fv(this.addr,t),en(e,t)}}function x_(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(i.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(tn(e,t))return;i.uniform3fv(this.addr,t),en(e,t)}}function y_(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(tn(e,t))return;i.uniform4fv(this.addr,t),en(e,t)}}function v_(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(tn(e,t))return;i.uniformMatrix2fv(this.addr,!1,t),en(e,t)}else{if(tn(e,n))return;Ud.set(n),i.uniformMatrix2fv(this.addr,!1,Ud),en(e,n)}}function b_(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(tn(e,t))return;i.uniformMatrix3fv(this.addr,!1,t),en(e,t)}else{if(tn(e,n))return;Nd.set(n),i.uniformMatrix3fv(this.addr,!1,Nd),en(e,n)}}function S_(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(tn(e,t))return;i.uniformMatrix4fv(this.addr,!1,t),en(e,t)}else{if(tn(e,n))return;Dd.set(n),i.uniformMatrix4fv(this.addr,!1,Dd),en(e,n)}}function M_(i,t){let e=this.cache;e[0]!==t&&(i.uniform1i(this.addr,t),e[0]=t)}function E_(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(tn(e,t))return;i.uniform2iv(this.addr,t),en(e,t)}}function w_(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(tn(e,t))return;i.uniform3iv(this.addr,t),en(e,t)}}function T_(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(tn(e,t))return;i.uniform4iv(this.addr,t),en(e,t)}}function A_(i,t){let e=this.cache;e[0]!==t&&(i.uniform1ui(this.addr,t),e[0]=t)}function R_(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(tn(e,t))return;i.uniform2uiv(this.addr,t),en(e,t)}}function C_(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(tn(e,t))return;i.uniform3uiv(this.addr,t),en(e,t)}}function P_(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(tn(e,t))return;i.uniform4uiv(this.addr,t),en(e,t)}}function I_(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(Lh.compareFunction=e.isReversedDepthBuffer()?Hc:zc,r=Lh):r=Jd,e.setTexture2D(t||r,s)}function L_(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture3D(t||jd,s)}function D_(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTextureCube(t||Qd,s)}function N_(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture2DArray(t||Kd,s)}function U_(i){switch(i){case 5126:return g_;case 35664:return __;case 35665:return x_;case 35666:return y_;case 35674:return v_;case 35675:return b_;case 35676:return S_;case 5124:case 35670:return M_;case 35667:case 35671:return E_;case 35668:case 35672:return w_;case 35669:case 35673:return T_;case 5125:return A_;case 36294:return R_;case 36295:return C_;case 36296:return P_;case 35678:case 36198:case 36298:case 36306:case 35682:return I_;case 35679:case 36299:case 36307:return L_;case 35680:case 36300:case 36308:case 36293:return D_;case 36289:case 36303:case 36311:case 36292:return N_}}function F_(i,t){i.uniform1fv(this.addr,t)}function O_(i,t){let e=Mr(t,this.size,2);i.uniform2fv(this.addr,e)}function B_(i,t){let e=Mr(t,this.size,3);i.uniform3fv(this.addr,e)}function k_(i,t){let e=Mr(t,this.size,4);i.uniform4fv(this.addr,e)}function z_(i,t){let e=Mr(t,this.size,4);i.uniformMatrix2fv(this.addr,!1,e)}function H_(i,t){let e=Mr(t,this.size,9);i.uniformMatrix3fv(this.addr,!1,e)}function V_(i,t){let e=Mr(t,this.size,16);i.uniformMatrix4fv(this.addr,!1,e)}function G_(i,t){i.uniform1iv(this.addr,t)}function W_(i,t){i.uniform2iv(this.addr,t)}function X_(i,t){i.uniform3iv(this.addr,t)}function Y_(i,t){i.uniform4iv(this.addr,t)}function q_(i,t){i.uniform1uiv(this.addr,t)}function Z_(i,t){i.uniform2uiv(this.addr,t)}function $_(i,t){i.uniform3uiv(this.addr,t)}function J_(i,t){i.uniform4uiv(this.addr,t)}function K_(i,t,e){let n=this.cache,s=t.length,r=qc(e,s);tn(n,r)||(i.uniform1iv(this.addr,r),en(n,r));let o;this.type===i.SAMPLER_2D_SHADOW?o=Lh:o=Jd;for(let a=0;a!==s;++a)e.setTexture2D(t[a]||o,r[a])}function j_(i,t,e){let n=this.cache,s=t.length,r=qc(e,s);tn(n,r)||(i.uniform1iv(this.addr,r),en(n,r));for(let o=0;o!==s;++o)e.setTexture3D(t[o]||jd,r[o])}function Q_(i,t,e){let n=this.cache,s=t.length,r=qc(e,s);tn(n,r)||(i.uniform1iv(this.addr,r),en(n,r));for(let o=0;o!==s;++o)e.setTextureCube(t[o]||Qd,r[o])}function tx(i,t,e){let n=this.cache,s=t.length,r=qc(e,s);tn(n,r)||(i.uniform1iv(this.addr,r),en(n,r));for(let o=0;o!==s;++o)e.setTexture2DArray(t[o]||Kd,r[o])}function ex(i){switch(i){case 5126:return F_;case 35664:return O_;case 35665:return B_;case 35666:return k_;case 35674:return z_;case 35675:return H_;case 35676:return V_;case 5124:case 35670:return G_;case 35667:case 35671:return W_;case 35668:case 35672:return X_;case 35669:case 35673:return Y_;case 5125:return q_;case 36294:return Z_;case 36295:return $_;case 36296:return J_;case 35678:case 36198:case 36298:case 36306:case 35682:return K_;case 35679:case 36299:case 36307:return j_;case 35680:case 36300:case 36308:case 36293:return Q_;case 36289:case 36303:case 36311:case 36292:return tx}}var Dh=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=U_(e.type)}},Nh=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=ex(e.type)}},Uh=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){let s=this.seq;for(let r=0,o=s.length;r!==o;++r){let a=s[r];a.setValue(t,e[a.id],n)}}},Ph=/(\w+)(\])?(\[|\.)?/g;function Fd(i,t){i.seq.push(t),i.map[t.id]=t}function nx(i,t,e){let n=i.name,s=n.length;for(Ph.lastIndex=0;;){let r=Ph.exec(n),o=Ph.lastIndex,a=r[1],c=r[2]==="]",l=r[3];if(c&&(a=a|0),l===void 0||l==="["&&o+2===s){Fd(e,l===void 0?new Dh(a,i,t):new Nh(a,i,t));break}else{let u=e.map[a];u===void 0&&(u=new Uh(a),Fd(e,u)),e=u}}}var br=class{constructor(t,e){this.seq=[],this.map={};let n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let o=0;o<n;++o){let a=t.getActiveUniform(e,o),c=t.getUniformLocation(e,a.name);nx(a,c,this)}let s=[],r=[];for(let o of this.seq)o.type===t.SAMPLER_2D_SHADOW||o.type===t.SAMPLER_CUBE_SHADOW||o.type===t.SAMPLER_2D_ARRAY_SHADOW?s.push(o):r.push(o);s.length>0&&(this.seq=s.concat(r))}setValue(t,e,n,s){let r=this.map[e];r!==void 0&&r.setValue(t,n,s)}setOptional(t,e,n){let s=e[n];s!==void 0&&this.setValue(t,n,s)}static upload(t,e,n,s){for(let r=0,o=e.length;r!==o;++r){let a=e[r],c=n[a.id];c.needsUpdate!==!1&&a.setValue(t,c.value,s)}}static seqWithValue(t,e){let n=[];for(let s=0,r=t.length;s!==r;++s){let o=t[s];o.id in e&&n.push(o)}return n}};function Od(i,t,e){let n=i.createShader(t);return i.shaderSource(n,e),i.compileShader(n),n}var ix=37297,sx=0;function rx(i,t){let e=i.split(`
`),n=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let o=s;o<r;o++){let a=o+1;n.push(`${a===t?">":" "} ${a}: ${e[o]}`)}return n.join(`
`)}var Bd=new le;function ox(i){xe._getMatrix(Bd,xe.workingColorSpace,i);let t=`mat3( ${Bd.elements.map(e=>e.toFixed(4))} )`;switch(xe.getTransfer(i)){case $r:return[t,"LinearTransferOETF"];case Ae:return[t,"sRGBTransferOETF"];default:return ne("WebGLProgram: Unsupported color space: ",i),[t,"LinearTransferOETF"]}}function kd(i,t,e){let n=i.getShaderParameter(t,i.COMPILE_STATUS),r=(i.getShaderInfoLog(t)||"").trim();if(n&&r==="")return"";let o=/ERROR: 0:(\d+)/.exec(r);if(o){let a=parseInt(o[1]);return e.toUpperCase()+`

`+r+`

`+rx(i.getShaderSource(t),a)}else return r}function ax(i,t){let e=ox(t);return[`vec4 ${i}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}var cx={[Ql]:"Linear",[th]:"Reinhard",[eh]:"Cineon",[mr]:"ACESFilmic",[ih]:"AgX",[sh]:"Neutral",[nh]:"Custom"};function lx(i,t){let e=cx[t];return e===void 0?(ne("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}var Gc=new D;function hx(){xe.getLuminanceCoefficients(Gc);let i=Gc.x.toFixed(4),t=Gc.y.toFixed(4),e=Gc.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function ux(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(No).join(`
`)}function dx(i){let t=[];for(let e in i){let n=i[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function fx(i,t){let e={},n=i.getProgramParameter(t,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(t,s),o=r.name,a=1;r.type===i.FLOAT_MAT2&&(a=2),r.type===i.FLOAT_MAT3&&(a=3),r.type===i.FLOAT_MAT4&&(a=4),e[o]={type:r.type,location:i.getAttribLocation(t,o),locationSize:a}}return e}function No(i){return i!==""}function zd(i,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Hd(i,t){return i.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var px=/^[ \t]*#include +<([\w\d./]+)>/gm;function Fh(i){return i.replace(px,gx)}var mx=new Map;function gx(i,t){let e=fe[t];if(e===void 0){let n=mx.get(t);if(n!==void 0)e=fe[n],ne('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">")}return Fh(e)}var _x=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Vd(i){return i.replace(_x,xx)}function xx(i,t,e,n){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Gd(i){let t=`precision ${i.precision} float;
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
#define LOW_PRECISION`),t}var yx={[bs]:"SHADOWMAP_TYPE_PCF",[fr]:"SHADOWMAP_TYPE_VSM"};function vx(i){return yx[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var bx={[ts]:"ENVMAP_TYPE_CUBE",[Ms]:"ENVMAP_TYPE_CUBE",[Mo]:"ENVMAP_TYPE_CUBE_UV"};function Sx(i){return i.envMap===!1?"ENVMAP_TYPE_CUBE":bx[i.envMapMode]||"ENVMAP_TYPE_CUBE"}var Mx={[Ms]:"ENVMAP_MODE_REFRACTION"};function Ex(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":Mx[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}var wx={[tc]:"ENVMAP_BLENDING_MULTIPLY",[nd]:"ENVMAP_BLENDING_MIX",[id]:"ENVMAP_BLENDING_ADD"};function Tx(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":wx[i.combine]||"ENVMAP_BLENDING_NONE"}function Ax(i){let t=i.envMapCubeUVHeight;if(t===null)return null;let e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:n,maxMip:e}}function Rx(i,t,e,n){let s=i.getContext(),r=e.defines,o=e.vertexShader,a=e.fragmentShader,c=vx(e),l=Sx(e),h=Ex(e),u=Tx(e),d=Ax(e),f=ux(e),_=dx(r),g=s.createProgram(),m,p,y=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,_].filter(No).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,_].filter(No).join(`
`),p.length>0&&(p+=`
`)):(m=[Gd(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,_,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexNormals?"#define HAS_NORMAL":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+c:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(No).join(`
`),p=[Gd(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,_,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+l:"",e.envMap?"#define "+h:"",e.envMap?"#define "+u:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.retroreflection?"#define USE_RETROREFLECTION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas||e.batchingColor?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+c:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==ii?"#define TONE_MAPPING":"",e.toneMapping!==ii?fe.tonemapping_pars_fragment:"",e.toneMapping!==ii?lx("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",fe.colorspace_pars_fragment,ax("linearToOutputTexel",e.outputColorSpace),hx(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(No).join(`
`)),o=Fh(o),o=zd(o,e),o=Hd(o,e),a=Fh(a),a=zd(a,e),a=Hd(a,e),o=Vd(o),a=Vd(a),e.isRawShaderMaterial!==!0&&(y=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",e.glslVersion===dh?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===dh?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);let S=y+m+o,v=y+p+a,M=Od(s,s.VERTEX_SHADER,S),E=Od(s,s.FRAGMENT_SHADER,v);s.attachShader(g,M),s.attachShader(g,E),e.index0AttributeName!==void 0?s.bindAttribLocation(g,0,e.index0AttributeName):e.hasPositionAttribute===!0&&s.bindAttribLocation(g,0,"position"),s.linkProgram(g);function A(L){if(i.debug.checkShaderErrors){let P=s.getProgramInfoLog(g)||"",O=s.getShaderInfoLog(M)||"",F=s.getShaderInfoLog(E)||"",X=P.trim(),q=O.trim(),N=F.trim(),Z=!0,V=!0;if(s.getProgramParameter(g,s.LINK_STATUS)===!1)if(Z=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,g,M,E);else{let Y=kd(s,M,"vertex"),J=kd(s,E,"fragment");re("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(g,s.VALIDATE_STATUS)+`

Material Name: `+L.name+`
Material Type: `+L.type+`

Program Info Log: `+X+`
`+Y+`
`+J)}else X!==""?ne("WebGLProgram: Program Info Log:",X):(q===""||N==="")&&(V=!1);V&&(L.diagnostics={runnable:Z,programLog:X,vertexShader:{log:q,prefix:m},fragmentShader:{log:N,prefix:p}})}s.deleteShader(M),s.deleteShader(E),x=new br(s,g),w=fx(s,g)}let x;this.getUniforms=function(){return x===void 0&&A(this),x};let w;this.getAttributes=function(){return w===void 0&&A(this),w};let C=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return C===!1&&(C=s.getProgramParameter(g,ix)),C},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(g),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=sx++,this.cacheKey=t,this.usedTimes=1,this.program=g,this.vertexShader=M,this.fragmentShader=E,this}var Cx=0,Oh=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,e,n){let s=this._getShaderCacheForMaterial(t);return s.has(e)===!1&&(s.add(e),e.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){let e=this.shaderCache,n=e.get(t);return n===void 0&&(n=new Bh(t),e.set(t,n)),n}},Bh=class{constructor(t){this.id=Cx++,this.code=t,this.usedTimes=0}};function Px(i){return i===is||i===Co||i===Po}function Ix(i,t,e,n,s,r){let o=new ir,a=new Oh,c=new Set,l=[],h=new Map,u=n.logarithmicDepthBuffer,d=n.precision,f={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(x){return c.add(x),x===0?"uv":`uv${x}`}function g(x,w,C,L,P,O){let F=L.fog,X=P.geometry,q=x.isMeshStandardMaterial||x.isMeshLambertMaterial||x.isMeshPhongMaterial?L.environment:null,N=x.isMeshStandardMaterial||x.isMeshLambertMaterial&&!x.envMap||x.isMeshPhongMaterial&&!x.envMap,Z=t.get(x.envMap||q,N),V=Z&&Z.mapping===Mo?Z.image.height:null,Y=f[x.type];x.precision!==null&&(d=n.getMaxPrecision(x.precision),d!==x.precision&&ne("WebGLProgram.getParameters:",x.precision,"not supported, using",d,"instead."));let J=X.morphAttributes.position||X.morphAttributes.normal||X.morphAttributes.color,Rt=J!==void 0?J.length:0,bt=0;X.morphAttributes.position!==void 0&&(bt=1),X.morphAttributes.normal!==void 0&&(bt=2),X.morphAttributes.color!==void 0&&(bt=3);let ie,Lt,oe,et;if(Y){let ve=mi[Y];ie=ve.vertexShader,Lt=ve.fragmentShader}else{ie=x.vertexShader,Lt=x.fragmentShader;let ve=a.getVertexShaderStage(x),nt=a.getFragmentShaderStage(x);a.update(x,ve,nt),oe=ve.id,et=nt.id}let W=i.getRenderTarget(),ht=i.state.buffers.depth.getReversed(),lt=P.isInstancedMesh===!0,ut=P.isBatchedMesh===!0,ot=!!x.map,It=!!x.matcap,B=!!Z,$=!!x.aoMap,it=!!x.lightMap,dt=!!x.bumpMap&&x.wireframe===!1,xt=!!x.normalMap,Ht=!!x.displacementMap,mt=!!x.emissiveMap,Bt=!!x.metalnessMap,Tt=!!x.roughnessMap,U=x.anisotropy>0,ce=x.clearcoat>0,Qt=x.dispersion>0,R=x.retroreflectivity>0,b=x.iridescence>0,G=x.sheen>0,K=x.transmission>0,rt=U&&!!x.anisotropyMap,_t=ce&&!!x.clearcoatMap,vt=ce&&!!x.clearcoatNormalMap,st=ce&&!!x.clearcoatRoughnessMap,ct=b&&!!x.iridescenceMap,Ct=b&&!!x.iridescenceThicknessMap,Yt=G&&!!x.sheenColorMap,Mt=G&&!!x.sheenRoughnessMap,Et=!!x.specularMap,qt=!!x.specularColorMap,Jt=!!x.specularIntensityMap,ae=K&&!!x.transmissionMap,H=K&&!!x.thicknessMap,Pt=!!x.gradientMap,at=!!x.alphaMap,At=x.alphaTest>0,wt=!!x.alphaHash,ft=!!x.extensions,Xt=ii;x.toneMapped&&(W===null||W.isXRRenderTarget===!0)&&(Xt=i.toneMapping);let Gt={shaderID:Y,shaderType:x.type,shaderName:x.name,vertexShader:ie,fragmentShader:Lt,defines:x.defines,customVertexShaderID:oe,customFragmentShaderID:et,isRawShaderMaterial:x.isRawShaderMaterial===!0,glslVersion:x.glslVersion,precision:d,batching:ut,batchingColor:ut&&P._colorsTexture!==null,instancing:lt,instancingColor:lt&&P.instanceColor!==null,instancingMorph:lt&&P.morphTexture!==null,outputColorSpace:W===null?i.outputColorSpace:W.isXRRenderTarget===!0?W.texture.colorSpace:xe.workingColorSpace,alphaToCoverage:!!x.alphaToCoverage,map:ot,matcap:It,envMap:B,envMapMode:B&&Z.mapping,envMapCubeUVHeight:V,aoMap:$,lightMap:it,bumpMap:dt,normalMap:xt,displacementMap:Ht,emissiveMap:mt,normalMapObjectSpace:xt&&x.normalMapType===od,normalMapTangentSpace:xt&&x.normalMapType===Io,packedNormalMap:xt&&x.normalMapType===Io&&Px(x.normalMap.format),metalnessMap:Bt,roughnessMap:Tt,anisotropy:U,anisotropyMap:rt,clearcoat:ce,clearcoatMap:_t,clearcoatNormalMap:vt,clearcoatRoughnessMap:st,dispersion:Qt,retroreflection:R,iridescence:b,iridescenceMap:ct,iridescenceThicknessMap:Ct,sheen:G,sheenColorMap:Yt,sheenRoughnessMap:Mt,specularMap:Et,specularColorMap:qt,specularIntensityMap:Jt,transmission:K,transmissionMap:ae,thicknessMap:H,gradientMap:Pt,opaque:x.transparent===!1&&x.blending===pr&&x.alphaToCoverage===!1,alphaMap:at,alphaTest:At,alphaHash:wt,combine:x.combine,mapUv:ot&&_(x.map.channel),aoMapUv:$&&_(x.aoMap.channel),lightMapUv:it&&_(x.lightMap.channel),bumpMapUv:dt&&_(x.bumpMap.channel),normalMapUv:xt&&_(x.normalMap.channel),displacementMapUv:Ht&&_(x.displacementMap.channel),emissiveMapUv:mt&&_(x.emissiveMap.channel),metalnessMapUv:Bt&&_(x.metalnessMap.channel),roughnessMapUv:Tt&&_(x.roughnessMap.channel),anisotropyMapUv:rt&&_(x.anisotropyMap.channel),clearcoatMapUv:_t&&_(x.clearcoatMap.channel),clearcoatNormalMapUv:vt&&_(x.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:st&&_(x.clearcoatRoughnessMap.channel),iridescenceMapUv:ct&&_(x.iridescenceMap.channel),iridescenceThicknessMapUv:Ct&&_(x.iridescenceThicknessMap.channel),sheenColorMapUv:Yt&&_(x.sheenColorMap.channel),sheenRoughnessMapUv:Mt&&_(x.sheenRoughnessMap.channel),specularMapUv:Et&&_(x.specularMap.channel),specularColorMapUv:qt&&_(x.specularColorMap.channel),specularIntensityMapUv:Jt&&_(x.specularIntensityMap.channel),transmissionMapUv:ae&&_(x.transmissionMap.channel),thicknessMapUv:H&&_(x.thicknessMap.channel),alphaMapUv:at&&_(x.alphaMap.channel),vertexTangents:!!X.attributes.tangent&&(xt||U),vertexNormals:!!X.attributes.normal,vertexColors:x.vertexColors,vertexAlphas:x.vertexColors===!0&&!!X.attributes.color&&X.attributes.color.itemSize===4,pointsUvs:P.isPoints===!0&&!!X.attributes.uv&&(ot||at),fog:!!F,useFog:x.fog===!0,fogExp2:!!F&&F.isFogExp2,flatShading:x.wireframe===!1&&(x.flatShading===!0||X.attributes.normal===void 0&&xt===!1&&(x.isMeshLambertMaterial||x.isMeshPhongMaterial||x.isMeshStandardMaterial||x.isMeshPhysicalMaterial)),sizeAttenuation:x.sizeAttenuation===!0,logarithmicDepthBuffer:u,reversedDepthBuffer:ht,skinning:P.isSkinnedMesh===!0,hasPositionAttribute:X.attributes.position!==void 0,morphTargets:X.morphAttributes.position!==void 0,morphNormals:X.morphAttributes.normal!==void 0,morphColors:X.morphAttributes.color!==void 0,morphTargetsCount:Rt,morphTextureStride:bt,numSunLights:w.sun.length,numDirLights:w.directional.length,numPointLights:w.point.length,numSpotLights:w.spot.length,numSpotLightMaps:w.spotLightMap.length,numRectAreaLights:w.rectArea.length,numHemiLights:w.hemi.length,numSunLightShadows:w.sunShadowMap.length,numDirLightShadows:w.directionalShadowMap.length,numPointLightShadows:w.pointShadowMap.length,numSpotLightShadows:w.spotShadowMap.length,numSpotLightShadowsWithMaps:w.numSpotLightShadowsWithMaps,numLightProbes:w.numLightProbes,numLightProbeGrids:O.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:x.dithering,shadowMapEnabled:i.shadowMap.enabled&&C.length>0,shadowMapType:i.shadowMap.type,toneMapping:Xt,decodeVideoTexture:ot&&x.map.isVideoTexture===!0&&xe.getTransfer(x.map.colorSpace)===Ae,decodeVideoTextureEmissive:mt&&x.emissiveMap.isVideoTexture===!0&&xe.getTransfer(x.emissiveMap.colorSpace)===Ae,premultipliedAlpha:x.premultipliedAlpha,doubleSided:x.side===De,flipSided:x.side===Ke,useDepthPacking:x.depthPacking>=0,depthPacking:x.depthPacking||0,index0AttributeName:x.index0AttributeName,extensionClipCullDistance:ft&&x.extensions.clipCullDistance===!0&&e.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ft&&x.extensions.multiDraw===!0||ut)&&e.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:e.has("KHR_parallel_shader_compile"),customProgramCacheKey:x.customProgramCacheKey()};return Gt.vertexUv1s=c.has(1),Gt.vertexUv2s=c.has(2),Gt.vertexUv3s=c.has(3),c.clear(),Gt}function m(x){let w=[];if(x.shaderID?w.push(x.shaderID):(w.push(x.customVertexShaderID),w.push(x.customFragmentShaderID)),x.defines!==void 0)for(let C in x.defines)w.push(C),w.push(x.defines[C]);return x.isRawShaderMaterial===!1&&(p(w,x),y(w,x),w.push(i.outputColorSpace)),w.push(x.customProgramCacheKey),w.join()}function p(x,w){x.push(w.precision),x.push(w.outputColorSpace),x.push(w.envMapMode),x.push(w.envMapCubeUVHeight),x.push(w.mapUv),x.push(w.alphaMapUv),x.push(w.lightMapUv),x.push(w.aoMapUv),x.push(w.bumpMapUv),x.push(w.normalMapUv),x.push(w.displacementMapUv),x.push(w.emissiveMapUv),x.push(w.metalnessMapUv),x.push(w.roughnessMapUv),x.push(w.anisotropyMapUv),x.push(w.clearcoatMapUv),x.push(w.clearcoatNormalMapUv),x.push(w.clearcoatRoughnessMapUv),x.push(w.iridescenceMapUv),x.push(w.iridescenceThicknessMapUv),x.push(w.sheenColorMapUv),x.push(w.sheenRoughnessMapUv),x.push(w.specularMapUv),x.push(w.specularColorMapUv),x.push(w.specularIntensityMapUv),x.push(w.transmissionMapUv),x.push(w.thicknessMapUv),x.push(w.combine),x.push(w.fogExp2),x.push(w.sizeAttenuation),x.push(w.morphTargetsCount),x.push(w.morphAttributeCount),x.push(w.numSunLights),x.push(w.numDirLights),x.push(w.numPointLights),x.push(w.numSpotLights),x.push(w.numSpotLightMaps),x.push(w.numHemiLights),x.push(w.numRectAreaLights),x.push(w.numSunLightShadows),x.push(w.numDirLightShadows),x.push(w.numPointLightShadows),x.push(w.numSpotLightShadows),x.push(w.numSpotLightShadowsWithMaps),x.push(w.numLightProbes),x.push(w.shadowMapType),x.push(w.toneMapping),x.push(w.numClippingPlanes),x.push(w.numClipIntersection),x.push(w.depthPacking)}function y(x,w){o.disableAll(),w.instancing&&o.enable(0),w.instancingColor&&o.enable(1),w.instancingMorph&&o.enable(2),w.matcap&&o.enable(3),w.envMap&&o.enable(4),w.normalMapObjectSpace&&o.enable(5),w.normalMapTangentSpace&&o.enable(6),w.clearcoat&&o.enable(7),w.iridescence&&o.enable(8),w.alphaTest&&o.enable(9),w.vertexColors&&o.enable(10),w.vertexAlphas&&o.enable(11),w.vertexUv1s&&o.enable(12),w.vertexUv2s&&o.enable(13),w.vertexUv3s&&o.enable(14),w.vertexTangents&&o.enable(15),w.anisotropy&&o.enable(16),w.alphaHash&&o.enable(17),w.batching&&o.enable(18),w.dispersion&&o.enable(19),w.retroreflection&&o.enable(24),w.batchingColor&&o.enable(20),w.gradientMap&&o.enable(21),w.packedNormalMap&&o.enable(22),w.vertexNormals&&o.enable(23),x.push(o.mask),o.disableAll(),w.fog&&o.enable(0),w.useFog&&o.enable(1),w.flatShading&&o.enable(2),w.logarithmicDepthBuffer&&o.enable(3),w.reversedDepthBuffer&&o.enable(4),w.skinning&&o.enable(5),w.morphTargets&&o.enable(6),w.morphNormals&&o.enable(7),w.morphColors&&o.enable(8),w.premultipliedAlpha&&o.enable(9),w.shadowMapEnabled&&o.enable(10),w.doubleSided&&o.enable(11),w.flipSided&&o.enable(12),w.useDepthPacking&&o.enable(13),w.dithering&&o.enable(14),w.transmission&&o.enable(15),w.sheen&&o.enable(16),w.opaque&&o.enable(17),w.pointsUvs&&o.enable(18),w.decodeVideoTexture&&o.enable(19),w.decodeVideoTextureEmissive&&o.enable(20),w.alphaToCoverage&&o.enable(21),w.numLightProbeGrids>0&&o.enable(22),w.hasPositionAttribute&&o.enable(23),x.push(o.mask)}function S(x){let w=f[x.type],C;if(w){let L=mi[w];C=Ed.clone(L.uniforms)}else C=x.uniforms;return C}function v(x,w){let C=h.get(w);return C!==void 0?++C.usedTimes:(C=new Rx(i,w,x,s),l.push(C),h.set(w,C)),C}function M(x){if(--x.usedTimes===0){let w=l.indexOf(x);l[w]=l[l.length-1],l.pop(),h.delete(x.cacheKey),x.destroy()}}function E(x){a.remove(x)}function A(){a.dispose()}return{getParameters:g,getProgramCacheKey:m,getUniforms:S,acquireProgram:v,releaseProgram:M,releaseShaderCache:E,programs:l,dispose:A}}function Lx(){let i=new WeakMap;function t(o){return i.has(o)}function e(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function s(o,a,c){i.get(o)[a]=c}function r(){i=new WeakMap}return{has:t,get:e,remove:n,update:s,dispose:r}}function Dx(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.material.id!==t.material.id?i.material.id-t.material.id:i.materialVariant!==t.materialVariant?i.materialVariant-t.materialVariant:i.z!==t.z?i.z-t.z:i.id-t.id}function Wd(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.z!==t.z?t.z-i.z:i.id-t.id}function Xd(){let i=[],t=0,e=[],n=[],s=[];function r(){t=0,e.length=0,n.length=0,s.length=0}function o(d){let f=0;return d.isInstancedMesh&&(f+=2),d.isSkinnedMesh&&(f+=1),f}function a(d,f,_,g,m,p){let y=i[t];return y===void 0?(y={id:d.id,object:d,geometry:f,material:_,materialVariant:o(d),groupOrder:g,renderOrder:d.renderOrder,z:m,group:p},i[t]=y):(y.id=d.id,y.object=d,y.geometry=f,y.material=_,y.materialVariant=o(d),y.groupOrder=g,y.renderOrder=d.renderOrder,y.z=m,y.group=p),t++,y}function c(d,f,_,g,m,p,y){y.reversedDepth===!0&&(m=-m);let S=a(d,f,_,g,m,p);_.transmission>0?n.push(S):_.transparent===!0?s.push(S):e.push(S)}function l(d,f,_,g,m,p){let y=a(d,f,_,g,m,p);_.transmission>0?n.unshift(y):_.transparent===!0?s.unshift(y):e.unshift(y)}function h(d,f){e.length>1&&e.sort(d||Dx),n.length>1&&n.sort(f||Wd),s.length>1&&s.sort(f||Wd)}function u(){for(let d=t,f=i.length;d<f;d++){let _=i[d];if(_.id===null)break;_.id=null,_.object=null,_.geometry=null,_.material=null,_.group=null}}return{opaque:e,transmissive:n,transparent:s,init:r,push:c,unshift:l,finish:u,sort:h}}function Nx(){let i=new WeakMap;function t(n,s){let r=i.get(n),o;return r===void 0?(o=new Xd,i.set(n,[o])):s>=r.length?(o=new Xd,r.push(o)):o=r[s],o}function e(){i=new WeakMap}return{get:t,dispose:e}}function Ux(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={direction:new D,color:new te};break;case"SpotLight":e={position:new D,direction:new D,color:new te,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new D,color:new te,distance:0,decay:0};break;case"HemisphereLight":e={direction:new D,skyColor:new te,groundColor:new te};break;case"RectAreaLight":e={color:new te,position:new D,halfWidth:new D,halfHeight:new D};break}return i[t.id]=e,e}}}function Fx(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new pt};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new pt};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new pt,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[t.id]=e,e}}}var Ox=0;function Bx(i,t){return(t.castShadow?2:0)-(i.castShadow?2:0)+(t.map?1:0)-(i.map?1:0)}function kx(i){let t=new Ux,e=Fx(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)n.probe.push(new D);let s=new D,r=new Pe,o=new Pe;function a(l){let h=0,u=0,d=0;for(let P=0;P<9;P++)n.probe[P].set(0,0,0);let f=0,_=0,g=0,m=0,p=0,y=0,S=0,v=0,M=0,E=0,A=0,x=0,w=0,C=0;l.sort(Bx);for(let P=0,O=l.length;P<O;P++){let F=l[P],X=F.color,q=F.intensity,N=F.distance,Z=null;if(F.shadow&&F.shadow.map&&(F.shadow.map.texture.format===is?Z=F.shadow.map.texture:Z=F.shadow.map.depthTexture||F.shadow.map.texture),F.isAmbientLight)h+=X.r*q,u+=X.g*q,d+=X.b*q;else if(F.isLightProbe){for(let V=0;V<9;V++)n.probe[V].addScaledVector(F.sh.coefficients[V],q);C++}else if(F.isSunLight){let V=t.get(F);if(V.color.copy(F.color).multiplyScalar(F.intensity),F.castShadow){let Y=F.shadow,J=e.get(F);J.shadowIntensity=Y.intensity,J.shadowBias=Y.bias,J.shadowNormalBias=Y.normalBias,J.shadowRadius=Y.radius,J.shadowMapSize.copy(Y.mapSize).multiply(Y.getFrameExtents()),n.sunShadow[_]=J,n.sunShadowMap[_]=Z;let Rt=Y.getViewportCount();for(let bt=0;bt<Rt;bt++)n.sunShadowMatrix[g+bt]=Y.getMatrix(bt),n.sunShadowCascade[g+bt]=Y._cascadeData[bt];g+=Rt,_++}n.sun[f]=V,f++}else if(F.isDirectionalLight){let V=t.get(F);if(V.color.copy(F.color).multiplyScalar(F.intensity),F.castShadow){let Y=F.shadow,J=e.get(F);J.shadowIntensity=Y.intensity,J.shadowBias=Y.bias,J.shadowNormalBias=Y.normalBias,J.shadowRadius=Y.radius,J.shadowMapSize=Y.mapSize,n.directionalShadow[m]=J,n.directionalShadowMap[m]=Z,n.directionalShadowMatrix[m]=F.shadow.matrix,M++}n.directional[m]=V,m++}else if(F.isSpotLight){let V=t.get(F);V.position.setFromMatrixPosition(F.matrixWorld),V.color.copy(X).multiplyScalar(q),V.distance=N,V.coneCos=Math.cos(F.angle),V.penumbraCos=Math.cos(F.angle*(1-F.penumbra)),V.decay=F.decay,n.spot[y]=V;let Y=F.shadow;if(F.map&&(n.spotLightMap[x]=F.map,x++,Y.updateMatrices(F),F.castShadow&&w++),n.spotLightMatrix[y]=Y.matrix,F.castShadow){let J=e.get(F);J.shadowIntensity=Y.intensity,J.shadowBias=Y.bias,J.shadowNormalBias=Y.normalBias,J.shadowRadius=Y.radius,J.shadowMapSize=Y.mapSize,n.spotShadow[y]=J,n.spotShadowMap[y]=Z,A++}y++}else if(F.isRectAreaLight){let V=t.get(F);V.color.copy(X).multiplyScalar(q),V.halfWidth.set(F.width*.5,0,0),V.halfHeight.set(0,F.height*.5,0),n.rectArea[S]=V,S++}else if(F.isPointLight){let V=t.get(F);if(V.color.copy(F.color).multiplyScalar(F.intensity),V.distance=F.distance,V.decay=F.decay,F.castShadow){let Y=F.shadow,J=e.get(F);J.shadowIntensity=Y.intensity,J.shadowBias=Y.bias,J.shadowNormalBias=Y.normalBias,J.shadowRadius=Y.radius,J.shadowMapSize=Y.mapSize,J.shadowCameraNear=Y.camera.near,J.shadowCameraFar=Y.camera.far,n.pointShadow[p]=J,n.pointShadowMap[p]=Z,n.pointShadowMatrix[p]=F.shadow.matrix,E++}n.point[p]=V,p++}else if(F.isHemisphereLight){let V=t.get(F);V.skyColor.copy(F.color).multiplyScalar(q),V.groundColor.copy(F.groundColor).multiplyScalar(q),n.hemi[v]=V,v++}}S>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=Nt.LTC_FLOAT_1,n.rectAreaLTC2=Nt.LTC_FLOAT_2):(n.rectAreaLTC1=Nt.LTC_HALF_1,n.rectAreaLTC2=Nt.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=d;let L=n.hash;(L.sunLength!==f||L.directionalLength!==m||L.pointLength!==p||L.spotLength!==y||L.rectAreaLength!==S||L.hemiLength!==v||L.numSunShadows!==_||L.numDirectionalShadows!==M||L.numPointShadows!==E||L.numSpotShadows!==A||L.numSpotMaps!==x||L.numLightProbes!==C)&&(n.sun.length=f,n.directional.length=m,n.spot.length=y,n.rectArea.length=S,n.point.length=p,n.hemi.length=v,n.sunShadow.length=_,n.sunShadowMap.length=_,n.sunShadowMatrix.length=g,n.sunShadowCascade.length=g,n.directionalShadow.length=M,n.directionalShadowMap.length=M,n.directionalShadowMatrix.length=M,n.pointShadow.length=E,n.pointShadowMap.length=E,n.pointShadowMatrix.length=E,n.spotShadow.length=A,n.spotShadowMap.length=A,n.spotLightMatrix.length=A+x-w,n.spotLightMap.length=x,n.numSpotLightShadowsWithMaps=w,n.numLightProbes=C,L.sunLength=f,L.directionalLength=m,L.pointLength=p,L.spotLength=y,L.rectAreaLength=S,L.hemiLength=v,L.numSunShadows=_,L.numDirectionalShadows=M,L.numPointShadows=E,L.numSpotShadows=A,L.numSpotMaps=x,L.numLightProbes=C,n.version=Ox++)}function c(l,h){let u=0,d=0,f=0,_=0,g=0,m=0,p=h.matrixWorldInverse;for(let y=0,S=l.length;y<S;y++){let v=l[y];if(v.isSunLight){let M=n.sun[u];M.direction.setFromMatrixPosition(v.matrixWorld),M.direction.transformDirection(p),u++}else if(v.isDirectionalLight){let M=n.directional[d];M.direction.setFromMatrixPosition(v.matrixWorld),s.setFromMatrixPosition(v.target.matrixWorld),M.direction.sub(s),M.direction.transformDirection(p),d++}else if(v.isSpotLight){let M=n.spot[_];M.position.setFromMatrixPosition(v.matrixWorld),M.position.applyMatrix4(p),M.direction.setFromMatrixPosition(v.matrixWorld),s.setFromMatrixPosition(v.target.matrixWorld),M.direction.sub(s),M.direction.transformDirection(p),_++}else if(v.isRectAreaLight){let M=n.rectArea[g];M.position.setFromMatrixPosition(v.matrixWorld),M.position.applyMatrix4(p),o.identity(),r.copy(v.matrixWorld),r.premultiply(p),o.extractRotation(r),M.halfWidth.set(v.width*.5,0,0),M.halfHeight.set(0,v.height*.5,0),M.halfWidth.applyMatrix4(o),M.halfHeight.applyMatrix4(o),g++}else if(v.isPointLight){let M=n.point[f];M.position.setFromMatrixPosition(v.matrixWorld),M.position.applyMatrix4(p),f++}else if(v.isHemisphereLight){let M=n.hemi[m];M.direction.setFromMatrixPosition(v.matrixWorld),M.direction.transformDirection(p),m++}}}return{setup:a,setupView:c,state:n}}function Yd(i){let t=new kx(i),e=[],n=[],s=[];function r(d){u.camera=d,e.length=0,n.length=0,s.length=0}function o(d){e.push(d)}function a(d){n.push(d)}function c(d){s.push(d)}function l(){t.setup(e)}function h(d){t.setupView(e,d)}let u={lightsArray:e,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:u,setupLights:l,setupLightsView:h,pushLight:o,pushShadow:a,pushLightProbeGrid:c}}function zx(i){let t=new WeakMap;function e(s,r=0){let o=t.get(s),a;return o===void 0?(a=new Yd(i),t.set(s,[a])):r>=o.length?(a=new Yd(i),o.push(a)):a=o[r],a}function n(){t=new WeakMap}return{get:e,dispose:n}}var Hx=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Vx=`uniform sampler2D shadow_pass;
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
}`,Gx=[new D(1,0,0),new D(-1,0,0),new D(0,1,0),new D(0,-1,0),new D(0,0,1),new D(0,0,-1)],Wx=[new D(0,-1,0),new D(0,-1,0),new D(0,0,1),new D(0,0,-1),new D(0,-1,0),new D(0,-1,0)],qd=new Pe,Do=new D,Ih=new D;function Xx(i,t,e){let n=new or,s=new pt,r=new pt,o=new Be,a=new Ba,c=new ka,l={},h=e.maxTextureSize,u={[Qi]:Ke,[Ke]:Qi,[De]:De},d=new kn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new pt},radius:{value:4}},vertexShader:Hx,fragmentShader:Vx}),f=d.clone();f.defines.HORIZONTAL_PASS=1;let _=new Ge;_.setAttribute("position",new On(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let g=new Dt(_,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=bs;let p=this.type;this.render=function(E,A,x){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||E.length===0)return;this.type===Qa&&(ne("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=bs);let w=i.getRenderTarget(),C=i.getActiveCubeFace(),L=i.getActiveMipmapLevel(),P=i.state;P.setBlending(fi),P.buffers.depth.getReversed()===!0?P.buffers.color.setClear(0,0,0,0):P.buffers.color.setClear(1,1,1,1),P.buffers.depth.setTest(!0),P.setScissorTest(!1);let O=p!==this.type;O&&A.traverse(function(F){F.material&&(Array.isArray(F.material)?F.material.forEach(X=>X.needsUpdate=!0):F.material.needsUpdate=!0)});for(let F=0,X=E.length;F<X;F++){let q=E[F],N=q.shadow;if(N===void 0){ne("WebGLShadowMap:",q,"has no shadow.");continue}if(N.autoUpdate===!1&&N.needsUpdate===!1)continue;s.copy(N.mapSize);let Z=N.getFrameExtents();s.multiply(Z),r.copy(N.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/Z.x),s.x=r.x*Z.x,N.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/Z.y),s.y=r.y*Z.y,N.mapSize.y=r.y));let V=i.state.buffers.depth.getReversed();if(N.camera._reversedDepth=V,N.map===null||O===!0){if(N.map!==null&&(N.map.depthTexture!==null&&(N.map.depthTexture.dispose(),N.map.depthTexture=null),N.map.dispose()),this.type===fr){if(q.isPointLight){ne("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}N.map=new Rn(s.x,s.y,{format:is,type:ri,minFilter:Ve,magFilter:Ve,generateMipmaps:!1}),N.map.texture.name=q.name+".shadowMap",N.map.depthTexture=new Xi(s.x,s.y,Yn),N.map.depthTexture.name=q.name+".shadowMapDepth",N.map.depthTexture.format=hi,N.map.depthTexture.compareFunction=null,N.map.depthTexture.minFilter=an,N.map.depthTexture.magFilter=an}else q.isPointLight?(N.map=new Wc(s.x),N.map.depthTexture=new Ca(s.x,si)):(N.map=new Rn(s.x,s.y),N.map.depthTexture=new Xi(s.x,s.y,si)),N.map.depthTexture.name=q.name+".shadowMap",N.map.depthTexture.format=hi,this.type===bs?(N.map.depthTexture.compareFunction=V?Hc:zc,N.map.depthTexture.minFilter=Ve,N.map.depthTexture.magFilter=Ve):(N.map.depthTexture.compareFunction=null,N.map.depthTexture.minFilter=an,N.map.depthTexture.magFilter=an);N.camera.updateProjectionMatrix()}N.map.isWebGLCubeRenderTarget!==!0&&(N.map.width!==s.x||N.map.height!==s.y)&&N.map.setSize(s.x,s.y);let Y=N.map.isWebGLCubeRenderTarget?6:N.getViewportCount();q.isPointLight!==!0&&N.updateMatrices(q,x);for(let J=0;J<Y;J++){let Rt=N.getCamera(J);if(q.isPointLight){let bt=N.camera,ie=N.matrix,Lt=q.distance||bt.far;Lt!==bt.far&&(bt.far=Lt,bt.updateProjectionMatrix()),Do.setFromMatrixPosition(q.matrixWorld),bt.position.copy(Do),Ih.copy(bt.position),Ih.add(Gx[J]),bt.up.copy(Wx[J]),bt.lookAt(Ih),bt.updateMatrixWorld(),ie.makeTranslation(-Do.x,-Do.y,-Do.z),qd.multiplyMatrices(bt.projectionMatrix,bt.matrixWorldInverse),N._frustum.setFromProjectionMatrix(qd,bt.coordinateSystem,bt.reversedDepth)}if(N.map.isWebGLCubeRenderTarget)i.setRenderTarget(N.map,J),i.clear();else{J===0&&(i.setRenderTarget(N.map),i.clear());let bt=N.getViewport(J);o.set(r.x*bt.x,r.y*bt.y,r.x*bt.z,r.y*bt.w),P.viewport(o)}n=N.getFrustum(J),v(A,x,Rt,q,this.type)}N.isPointLightShadow!==!0&&this.type===fr&&y(N,x),N.needsUpdate=!1}p=this.type,m.needsUpdate=!1,i.setRenderTarget(w,C,L)};function y(E,A){let x=t.update(g);d.defines.VSM_SAMPLES!==E.blurSamples&&(d.defines.VSM_SAMPLES=E.blurSamples,f.defines.VSM_SAMPLES=E.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),E.mapPass===null?E.mapPass=new Rn(s.x,s.y,{format:is,type:ri}):(E.mapPass.width!==E.map.width||E.mapPass.height!==E.map.height)&&E.mapPass.setSize(E.map.width,E.map.height),d.uniforms.shadow_pass.value=E.map.depthTexture,d.uniforms.resolution.value.set(E.map.width,E.map.height),d.uniforms.radius.value=E.radius,i.setRenderTarget(E.mapPass),i.clear(),i.renderBufferDirect(A,null,x,d,g,null),f.uniforms.shadow_pass.value=E.mapPass.texture,f.uniforms.resolution.value.set(E.map.width,E.map.height),f.uniforms.radius.value=E.radius,i.setRenderTarget(E.map),i.clear(),i.renderBufferDirect(A,null,x,f,g,null)}function S(E,A,x,w){let C=null,L=x.isPointLight===!0?E.customDistanceMaterial:E.customDepthMaterial;if(L!==void 0)C=L;else if(C=x.isPointLight===!0?c:a,i.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0||A.alphaToCoverage===!0){let P=C.uuid,O=A.uuid,F=l[P];F===void 0&&(F={},l[P]=F);let X=F[O];X===void 0&&(X=C.clone(),F[O]=X,A.addEventListener("dispose",M)),C=X}if(C.visible=A.visible,C.wireframe=A.wireframe,w===fr?C.side=A.shadowSide!==null?A.shadowSide:A.side:C.side=A.shadowSide!==null?A.shadowSide:u[A.side],C.alphaMap=A.alphaMap,C.alphaTest=A.alphaToCoverage===!0?.5:A.alphaTest,C.map=A.map,C.clipShadows=A.clipShadows,C.clippingPlanes=A.clippingPlanes,C.clipIntersection=A.clipIntersection,C.displacementMap=A.displacementMap,C.displacementScale=A.displacementScale,C.displacementBias=A.displacementBias,C.wireframeLinewidth=A.wireframeLinewidth,C.linewidth=A.linewidth,x.isPointLight===!0&&C.isMeshDistanceMaterial===!0){let P=i.properties.get(C);P.light=x}return C}function v(E,A,x,w,C){if(E.visible===!1)return;if(E.layers.test(A.layers)&&(E.isMesh||E.isLine||E.isPoints)&&(E.castShadow||E.receiveShadow&&C===fr)&&(!E.frustumCulled||E.intersectsFrustum(n))){E.modelViewMatrix.multiplyMatrices(x.matrixWorldInverse,E.matrixWorld);let O=t.update(E),F=E.material;if(Array.isArray(F)){let X=O.groups;for(let q=0,N=X.length;q<N;q++){let Z=X[q],V=F[Z.materialIndex];if(V&&V.visible){let Y=S(E,V,w,C);E.onBeforeShadow(i,E,A,x,O,Y,Z),i.renderBufferDirect(x,null,O,Y,E,Z),E.onAfterShadow(i,E,A,x,O,Y,Z)}}}else if(F.visible){let X=S(E,F,w,C);E.onBeforeShadow(i,E,A,x,O,X,null),i.renderBufferDirect(x,null,O,X,E,null),E.onAfterShadow(i,E,A,x,O,X,null)}}let P=E.children;for(let O=0,F=P.length;O<F;O++)v(P[O],A,x,w,C)}function M(E){E.target.removeEventListener("dispose",M);for(let x in l){let w=l[x],C=E.target.uuid;C in w&&(w[C].dispose(),delete w[C])}}}function Yx(i,t){function e(){let H=!1,Pt=new Be,at=null,At=new Be(0,0,0,0);return{setMask:function(wt){at!==wt&&!H&&(i.colorMask(wt,wt,wt,wt),at=wt)},setLocked:function(wt){H=wt},setClear:function(wt,ft,Xt,Gt,ve){ve===!0&&(wt*=Gt,ft*=Gt,Xt*=Gt),Pt.set(wt,ft,Xt,Gt),At.equals(Pt)===!1&&(i.clearColor(wt,ft,Xt,Gt),At.copy(Pt))},reset:function(){H=!1,at=null,At.set(-1,0,0,0)}}}function n(){let H=!1,Pt=!1,at=null,At=null,wt=null;return{setReversed:function(ft){if(Pt!==ft){let Xt=t.get("EXT_clip_control");ft?Xt.clipControlEXT(Xt.LOWER_LEFT_EXT,Xt.ZERO_TO_ONE_EXT):Xt.clipControlEXT(Xt.LOWER_LEFT_EXT,Xt.NEGATIVE_ONE_TO_ONE_EXT),Pt=ft;let Gt=wt;wt=null,this.setClear(Gt)}},getReversed:function(){return Pt},setTest:function(ft){ft?W(i.DEPTH_TEST):ht(i.DEPTH_TEST)},setMask:function(ft){at!==ft&&!H&&(i.depthMask(ft),at=ft)},setFunc:function(ft){if(Pt&&(ft=xd[ft]),At!==ft){switch(ft){case _a:i.depthFunc(i.NEVER);break;case xa:i.depthFunc(i.ALWAYS);break;case ya:i.depthFunc(i.LESS);break;case js:i.depthFunc(i.LEQUAL);break;case va:i.depthFunc(i.EQUAL);break;case ba:i.depthFunc(i.GEQUAL);break;case Sa:i.depthFunc(i.GREATER);break;case Ma:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}At=ft}},setLocked:function(ft){H=ft},setClear:function(ft){wt!==ft&&(wt=ft,Pt&&(ft=1-ft),i.clearDepth(ft))},reset:function(){H=!1,at=null,At=null,wt=null,Pt=!1}}}function s(){let H=!1,Pt=null,at=null,At=null,wt=null,ft=null,Xt=null,Gt=null,ve=null;return{setTest:function(nt){H||(nt?W(i.STENCIL_TEST):ht(i.STENCIL_TEST))},setMask:function(nt){Pt!==nt&&!H&&(i.stencilMask(nt),Pt=nt)},setFunc:function(nt,St,ee){(at!==nt||At!==St||wt!==ee)&&(i.stencilFunc(nt,St,ee),at=nt,At=St,wt=ee)},setOp:function(nt,St,ee){(ft!==nt||Xt!==St||Gt!==ee)&&(i.stencilOp(nt,St,ee),ft=nt,Xt=St,Gt=ee)},setLocked:function(nt){H=nt},setClear:function(nt){ve!==nt&&(i.clearStencil(nt),ve=nt)},reset:function(){H=!1,Pt=null,at=null,At=null,wt=null,ft=null,Xt=null,Gt=null,ve=null}}}let r=new e,o=new n,a=new s,c=new WeakMap,l=new WeakMap,h={},u={},d={},f=new WeakMap,_=[],g=null,m=!1,p=null,y=null,S=null,v=null,M=null,E=null,A=null,x=new te(0,0,0),w=0,C=!1,L=null,P=null,O=null,F=null,X=null,q=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),N=!1,Z=0,V=i.getParameter(i.VERSION);V.indexOf("WebGL")!==-1?(Z=parseFloat(/^WebGL (\d)/.exec(V)[1]),N=Z>=1):V.indexOf("OpenGL ES")!==-1&&(Z=parseFloat(/^OpenGL ES (\d)/.exec(V)[1]),N=Z>=2);let Y=null,J={},Rt=i.getParameter(i.SCISSOR_BOX),bt=i.getParameter(i.VIEWPORT),ie=new Be().fromArray(Rt),Lt=new Be().fromArray(bt);function oe(H,Pt,at,At){let wt=new Uint8Array(4),ft=i.createTexture();i.bindTexture(H,ft),i.texParameteri(H,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(H,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Xt=0;Xt<at;Xt++)H===i.TEXTURE_3D||H===i.TEXTURE_2D_ARRAY?i.texImage3D(Pt,0,i.RGBA,1,1,At,0,i.RGBA,i.UNSIGNED_BYTE,wt):i.texImage2D(Pt+Xt,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,wt);return ft}let et={};et[i.TEXTURE_2D]=oe(i.TEXTURE_2D,i.TEXTURE_2D,1),et[i.TEXTURE_CUBE_MAP]=oe(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),et[i.TEXTURE_2D_ARRAY]=oe(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),et[i.TEXTURE_3D]=oe(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),W(i.DEPTH_TEST),o.setFunc(js),dt(!1),xt(ql),W(i.CULL_FACE),$(fi);function W(H){h[H]!==!0&&(i.enable(H),h[H]=!0)}function ht(H){h[H]!==!1&&(i.disable(H),h[H]=!1)}function lt(H,Pt){return d[H]!==Pt?(i.bindFramebuffer(H,Pt),d[H]=Pt,H===i.DRAW_FRAMEBUFFER&&(d[i.FRAMEBUFFER]=Pt),H===i.FRAMEBUFFER&&(d[i.DRAW_FRAMEBUFFER]=Pt),!0):!1}function ut(H,Pt){let at=_,At=!1;if(H){at=f.get(Pt),at===void 0&&(at=[],f.set(Pt,at));let wt=H.textures;if(at.length!==wt.length||at[0]!==i.COLOR_ATTACHMENT0){for(let ft=0,Xt=wt.length;ft<Xt;ft++)at[ft]=i.COLOR_ATTACHMENT0+ft;at.length=wt.length,At=!0}}else at[0]!==i.BACK&&(at[0]=i.BACK,At=!0);At&&i.drawBuffers(at)}function ot(H){return g!==H?(i.useProgram(H),g=H,!0):!1}let It={[Ss]:i.FUNC_ADD,[ku]:i.FUNC_SUBTRACT,[zu]:i.FUNC_REVERSE_SUBTRACT};It[Hu]=i.MIN,It[Vu]=i.MAX;let B={[Gu]:i.ZERO,[Wu]:i.ONE,[Xu]:i.SRC_COLOR,[Kl]:i.SRC_ALPHA,[Ku]:i.SRC_ALPHA_SATURATE,[$u]:i.DST_COLOR,[qu]:i.DST_ALPHA,[Yu]:i.ONE_MINUS_SRC_COLOR,[jl]:i.ONE_MINUS_SRC_ALPHA,[Ju]:i.ONE_MINUS_DST_COLOR,[Zu]:i.ONE_MINUS_DST_ALPHA,[ju]:i.CONSTANT_COLOR,[Qu]:i.ONE_MINUS_CONSTANT_COLOR,[td]:i.CONSTANT_ALPHA,[ed]:i.ONE_MINUS_CONSTANT_ALPHA};function $(H,Pt,at,At,wt,ft,Xt,Gt,ve,nt){if(H===fi){m===!0&&(ht(i.BLEND),m=!1);return}if(m===!1&&(W(i.BLEND),m=!0),H!==Bu){if(H!==p||nt!==C){if((y!==Ss||M!==Ss)&&(i.blendEquation(i.FUNC_ADD),y=Ss,M=Ss),nt)switch(H){case pr:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Zl:i.blendFunc(i.ONE,i.ONE);break;case $l:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Jl:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:re("WebGLState: Invalid blending: ",H);break}else switch(H){case pr:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Zl:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case $l:re("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Jl:re("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:re("WebGLState: Invalid blending: ",H);break}S=null,v=null,E=null,A=null,x.set(0,0,0),w=0,p=H,C=nt}return}wt=wt||Pt,ft=ft||at,Xt=Xt||At,(Pt!==y||wt!==M)&&(i.blendEquationSeparate(It[Pt],It[wt]),y=Pt,M=wt),(at!==S||At!==v||ft!==E||Xt!==A)&&(i.blendFuncSeparate(B[at],B[At],B[ft],B[Xt]),S=at,v=At,E=ft,A=Xt),(Gt.equals(x)===!1||ve!==w)&&(i.blendColor(Gt.r,Gt.g,Gt.b,ve),x.copy(Gt),w=ve),p=H,C=!1}function it(H,Pt){H.side===De?ht(i.CULL_FACE):W(i.CULL_FACE);let at=H.side===Ke;Pt&&(at=!at),dt(at),H.blending===pr&&H.transparent===!1?$(fi):$(H.blending,H.blendEquation,H.blendSrc,H.blendDst,H.blendEquationAlpha,H.blendSrcAlpha,H.blendDstAlpha,H.blendColor,H.blendAlpha,H.premultipliedAlpha),o.setFunc(H.depthFunc),o.setTest(H.depthTest),o.setMask(H.depthWrite),r.setMask(H.colorWrite);let At=H.stencilWrite;a.setTest(At),At&&(a.setMask(H.stencilWriteMask),a.setFunc(H.stencilFunc,H.stencilRef,H.stencilFuncMask),a.setOp(H.stencilFail,H.stencilZFail,H.stencilZPass)),mt(H.polygonOffset,H.polygonOffsetFactor,H.polygonOffsetUnits),H.alphaToCoverage===!0?W(i.SAMPLE_ALPHA_TO_COVERAGE):ht(i.SAMPLE_ALPHA_TO_COVERAGE)}function dt(H){L!==H&&(H?i.frontFace(i.CW):i.frontFace(i.CCW),L=H)}function xt(H){H!==Fu?(W(i.CULL_FACE),H!==P&&(H===ql?i.cullFace(i.BACK):H===Ou?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):ht(i.CULL_FACE),P=H}function Ht(H){H!==O&&(N&&i.lineWidth(H),O=H)}function mt(H,Pt,at){H?(W(i.POLYGON_OFFSET_FILL),(F!==Pt||X!==at)&&(F=Pt,X=at,o.getReversed()&&(Pt=-Pt),i.polygonOffset(Pt,at))):ht(i.POLYGON_OFFSET_FILL)}function Bt(H){H?W(i.SCISSOR_TEST):ht(i.SCISSOR_TEST)}function Tt(H){H===void 0&&(H=i.TEXTURE0+q-1),Y!==H&&(i.activeTexture(H),Y=H)}function U(H,Pt,at){at===void 0&&(Y===null?at=i.TEXTURE0+q-1:at=Y);let At=J[at];At===void 0&&(At={type:void 0,texture:void 0},J[at]=At),(At.type!==H||At.texture!==Pt)&&(Y!==at&&(i.activeTexture(at),Y=at),i.bindTexture(H,Pt||et[H]),At.type=H,At.texture=Pt)}function ce(){let H=J[Y];H!==void 0&&H.type!==void 0&&(i.bindTexture(H.type,null),H.type=void 0,H.texture=void 0)}function Qt(){try{i.compressedTexImage2D(...arguments)}catch(H){re("WebGLState:",H)}}function R(){try{i.compressedTexImage3D(...arguments)}catch(H){re("WebGLState:",H)}}function b(){try{i.texSubImage2D(...arguments)}catch(H){re("WebGLState:",H)}}function G(){try{i.texSubImage3D(...arguments)}catch(H){re("WebGLState:",H)}}function K(){try{i.compressedTexSubImage2D(...arguments)}catch(H){re("WebGLState:",H)}}function rt(){try{i.compressedTexSubImage3D(...arguments)}catch(H){re("WebGLState:",H)}}function _t(){try{i.texStorage2D(...arguments)}catch(H){re("WebGLState:",H)}}function vt(){try{i.texStorage3D(...arguments)}catch(H){re("WebGLState:",H)}}function st(){try{i.texImage2D(...arguments)}catch(H){re("WebGLState:",H)}}function ct(){try{i.texImage3D(...arguments)}catch(H){re("WebGLState:",H)}}function Ct(H){return u[H]!==void 0?u[H]:i.getParameter(H)}function Yt(H,Pt){u[H]!==Pt&&(i.pixelStorei(H,Pt),u[H]=Pt)}function Mt(H){ie.equals(H)===!1&&(i.scissor(H.x,H.y,H.z,H.w),ie.copy(H))}function Et(H){Lt.equals(H)===!1&&(i.viewport(H.x,H.y,H.z,H.w),Lt.copy(H))}function qt(H,Pt){let at=l.get(Pt);at===void 0&&(at=new WeakMap,l.set(Pt,at));let At=at.get(H);At===void 0&&(At=i.getUniformBlockIndex(Pt,H.name),at.set(H,At))}function Jt(H,Pt){let At=l.get(Pt).get(H);c.get(Pt)!==At&&(i.uniformBlockBinding(Pt,At,H.__bindingPointIndex),c.set(Pt,At))}function ae(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),o.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),h={},u={},Y=null,J={},d={},f=new WeakMap,_=[],g=null,m=!1,p=null,y=null,S=null,v=null,M=null,E=null,A=null,x=new te(0,0,0),w=0,C=!1,L=null,P=null,O=null,F=null,X=null,ie.set(0,0,i.canvas.width,i.canvas.height),Lt.set(0,0,i.canvas.width,i.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:W,disable:ht,bindFramebuffer:lt,drawBuffers:ut,useProgram:ot,setBlending:$,setMaterial:it,setFlipSided:dt,setCullFace:xt,setLineWidth:Ht,setPolygonOffset:mt,setScissorTest:Bt,activeTexture:Tt,bindTexture:U,unbindTexture:ce,compressedTexImage2D:Qt,compressedTexImage3D:R,texImage2D:st,texImage3D:ct,pixelStorei:Yt,getParameter:Ct,updateUBOMapping:qt,uniformBlockBinding:Jt,texStorage2D:_t,texStorage3D:vt,texSubImage2D:b,texSubImage3D:G,compressedTexSubImage2D:K,compressedTexSubImage3D:rt,scissor:Mt,viewport:Et,reset:ae}}function qx(i,t,e,n,s,r,o){let a=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator=="undefined"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new pt,h=new WeakMap,u=new Set,d,f=new WeakMap,_=!1;try{_=typeof OffscreenCanvas!="undefined"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(R,b){return _?new OffscreenCanvas(R,b):Jr("canvas")}function m(R,b,G){let K=1,rt=Qt(R);if((rt.width>G||rt.height>G)&&(K=G/Math.max(rt.width,rt.height)),K<1)if(typeof HTMLImageElement!="undefined"&&R instanceof HTMLImageElement||typeof HTMLCanvasElement!="undefined"&&R instanceof HTMLCanvasElement||typeof ImageBitmap!="undefined"&&R instanceof ImageBitmap||typeof VideoFrame!="undefined"&&R instanceof VideoFrame){let _t=Math.floor(K*rt.width),vt=Math.floor(K*rt.height);d===void 0&&(d=g(_t,vt));let st=b?g(_t,vt):d;return st.width=_t,st.height=vt,st.getContext("2d").drawImage(R,0,0,_t,vt),ne("WebGLRenderer: Texture has been resized from ("+rt.width+"x"+rt.height+") to ("+_t+"x"+vt+")."),st}else return"data"in R&&ne("WebGLRenderer: Image in DataTexture is too big ("+rt.width+"x"+rt.height+")."),R;return R}function p(R){return R.generateMipmaps}function y(R){i.generateMipmap(R)}function S(R){return R.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:R.isWebGL3DRenderTarget?i.TEXTURE_3D:R.isWebGLArrayRenderTarget||R.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function v(R,b,G,K,rt,_t=!1){if(R!==null){if(i[R]!==void 0)return i[R];ne("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+R+"'")}let vt;K&&(vt=t.get("EXT_texture_norm16"),vt||ne("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let st=b;if(b===i.RED&&(G===i.FLOAT&&(st=i.R32F),G===i.HALF_FLOAT&&(st=i.R16F),G===i.UNSIGNED_BYTE&&(st=i.R8),G===i.UNSIGNED_SHORT&&vt&&(st=vt.R16_EXT),G===i.SHORT&&vt&&(st=vt.R16_SNORM_EXT)),b===i.RED_INTEGER&&(G===i.UNSIGNED_BYTE&&(st=i.R8UI),G===i.UNSIGNED_SHORT&&(st=i.R16UI),G===i.UNSIGNED_INT&&(st=i.R32UI),G===i.BYTE&&(st=i.R8I),G===i.SHORT&&(st=i.R16I),G===i.INT&&(st=i.R32I)),b===i.RG&&(G===i.FLOAT&&(st=i.RG32F),G===i.HALF_FLOAT&&(st=i.RG16F),G===i.UNSIGNED_BYTE&&(st=i.RG8),G===i.UNSIGNED_SHORT&&vt&&(st=vt.RG16_EXT),G===i.SHORT&&vt&&(st=vt.RG16_SNORM_EXT)),b===i.RG_INTEGER&&(G===i.UNSIGNED_BYTE&&(st=i.RG8UI),G===i.UNSIGNED_SHORT&&(st=i.RG16UI),G===i.UNSIGNED_INT&&(st=i.RG32UI),G===i.BYTE&&(st=i.RG8I),G===i.SHORT&&(st=i.RG16I),G===i.INT&&(st=i.RG32I)),b===i.RGB_INTEGER&&(G===i.UNSIGNED_BYTE&&(st=i.RGB8UI),G===i.UNSIGNED_SHORT&&(st=i.RGB16UI),G===i.UNSIGNED_INT&&(st=i.RGB32UI),G===i.BYTE&&(st=i.RGB8I),G===i.SHORT&&(st=i.RGB16I),G===i.INT&&(st=i.RGB32I)),b===i.RGBA_INTEGER&&(G===i.UNSIGNED_BYTE&&(st=i.RGBA8UI),G===i.UNSIGNED_SHORT&&(st=i.RGBA16UI),G===i.UNSIGNED_INT&&(st=i.RGBA32UI),G===i.BYTE&&(st=i.RGBA8I),G===i.SHORT&&(st=i.RGBA16I),G===i.INT&&(st=i.RGBA32I)),b===i.RGB&&(G===i.UNSIGNED_SHORT&&vt&&(st=vt.RGB16_EXT),G===i.SHORT&&vt&&(st=vt.RGB16_SNORM_EXT),G===i.UNSIGNED_INT_5_9_9_9_REV&&(st=i.RGB9_E5),G===i.UNSIGNED_INT_10F_11F_11F_REV&&(st=i.R11F_G11F_B10F)),b===i.RGBA){let ct=_t?$r:xe.getTransfer(rt);G===i.FLOAT&&(st=i.RGBA32F),G===i.HALF_FLOAT&&(st=i.RGBA16F),G===i.UNSIGNED_BYTE&&(st=ct===Ae?i.SRGB8_ALPHA8:i.RGBA8),G===i.UNSIGNED_SHORT&&vt&&(st=vt.RGBA16_EXT),G===i.SHORT&&vt&&(st=vt.RGBA16_SNORM_EXT),G===i.UNSIGNED_SHORT_4_4_4_4&&(st=i.RGBA4),G===i.UNSIGNED_SHORT_5_5_5_1&&(st=i.RGB5_A1)}return(st===i.R16F||st===i.R32F||st===i.RG16F||st===i.RG32F||st===i.RGBA16F||st===i.RGBA32F)&&t.get("EXT_color_buffer_float"),st}function M(R,b){let G;return R?b===null||b===si||b===xr?G=i.DEPTH24_STENCIL8:b===Yn?G=i.DEPTH32F_STENCIL8:b===_r&&(G=i.DEPTH24_STENCIL8,ne("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):b===null||b===si||b===xr?G=i.DEPTH_COMPONENT24:b===Yn?G=i.DEPTH_COMPONENT32F:b===_r&&(G=i.DEPTH_COMPONENT16),G}function E(R,b){return p(R)===!0||R.isFramebufferTexture&&R.minFilter!==an&&R.minFilter!==Ve?Math.log2(Math.max(b.width,b.height))+1:R.mipmaps!==void 0&&R.mipmaps.length>0?R.mipmaps.length:R.isCompressedTexture&&Array.isArray(R.image)?b.mipmaps.length:1}function A(R){let b=R.target;b.removeEventListener("dispose",A),w(b),b.isVideoTexture&&h.delete(b),b.isHTMLTexture&&u.delete(b)}function x(R){let b=R.target;b.removeEventListener("dispose",x),L(b)}function w(R){let b=n.get(R);if(b.__webglInit===void 0)return;let G=R.source,K=f.get(G);if(K){let rt=K[b.__cacheKey];rt.usedTimes--,rt.usedTimes===0&&C(R),Object.keys(K).length===0&&f.delete(G)}n.remove(R)}function C(R){let b=n.get(R);i.deleteTexture(b.__webglTexture);let G=R.source,K=f.get(G);delete K[b.__cacheKey],o.memory.textures--}function L(R){let b=n.get(R);if(R.depthTexture&&(R.depthTexture.dispose(),n.remove(R.depthTexture)),R.isWebGLCubeRenderTarget)for(let K=0;K<6;K++){if(Array.isArray(b.__webglFramebuffer[K]))for(let rt=0;rt<b.__webglFramebuffer[K].length;rt++)i.deleteFramebuffer(b.__webglFramebuffer[K][rt]);else i.deleteFramebuffer(b.__webglFramebuffer[K]);b.__webglDepthbuffer&&i.deleteRenderbuffer(b.__webglDepthbuffer[K])}else{if(Array.isArray(b.__webglFramebuffer))for(let K=0;K<b.__webglFramebuffer.length;K++)i.deleteFramebuffer(b.__webglFramebuffer[K]);else i.deleteFramebuffer(b.__webglFramebuffer);if(b.__webglDepthbuffer&&i.deleteRenderbuffer(b.__webglDepthbuffer),b.__webglMultisampledFramebuffer&&i.deleteFramebuffer(b.__webglMultisampledFramebuffer),b.__webglColorRenderbuffer)for(let K=0;K<b.__webglColorRenderbuffer.length;K++)b.__webglColorRenderbuffer[K]&&i.deleteRenderbuffer(b.__webglColorRenderbuffer[K]);b.__webglDepthRenderbuffer&&i.deleteRenderbuffer(b.__webglDepthRenderbuffer)}let G=R.textures;for(let K=0,rt=G.length;K<rt;K++){let _t=n.get(G[K]);_t.__webglTexture&&(i.deleteTexture(_t.__webglTexture),o.memory.textures--),n.remove(G[K])}n.remove(R)}let P=0;function O(){P=0}function F(){return P}function X(R){P=R}function q(){let R=P;return R>=s.maxTextures&&ne("WebGLTextures: Trying to use "+(R+1)+" texture units while this GPU supports only "+s.maxTextures),P+=1,R}function N(R){let b=[];return b.push(R.wrapS),b.push(R.wrapT),b.push(R.wrapR||0),b.push(R.magFilter),b.push(R.minFilter),b.push(R.anisotropy),b.push(R.internalFormat),b.push(R.format),b.push(R.type),b.push(R.generateMipmaps),b.push(R.premultiplyAlpha),b.push(R.flipY),b.push(R.unpackAlignment),b.push(R.colorSpace),b.join()}function Z(R,b){let G=n.get(R);if(R.isVideoTexture&&U(R),R.isRenderTargetTexture===!1&&R.isExternalTexture!==!0&&R.version>0&&G.__version!==R.version){let K=R.image;if(K===null)ne("WebGLRenderer: Texture marked for update but no image data found.");else if(K.complete===!1)ne("WebGLRenderer: Texture marked for update but image is incomplete");else{ht(G,R,b);return}}else R.isExternalTexture&&(G.__webglTexture=R.sourceTexture?R.sourceTexture:null);e.bindTexture(i.TEXTURE_2D,G.__webglTexture,i.TEXTURE0+b)}function V(R,b){let G=n.get(R);if(R.isRenderTargetTexture===!1&&R.version>0&&G.__version!==R.version){ht(G,R,b);return}else R.isExternalTexture&&(G.__webglTexture=R.sourceTexture?R.sourceTexture:null);e.bindTexture(i.TEXTURE_2D_ARRAY,G.__webglTexture,i.TEXTURE0+b)}function Y(R,b){let G=n.get(R);if(R.isRenderTargetTexture===!1&&R.version>0&&G.__version!==R.version){ht(G,R,b);return}e.bindTexture(i.TEXTURE_3D,G.__webglTexture,i.TEXTURE0+b)}function J(R,b){let G=n.get(R);if(R.isCubeDepthTexture!==!0&&R.version>0&&G.__version!==R.version){lt(G,R,b);return}e.bindTexture(i.TEXTURE_CUBE_MAP,G.__webglTexture,i.TEXTURE0+b)}let Rt={[Qs]:i.REPEAT,[li]:i.CLAMP_TO_EDGE,[Ea]:i.MIRRORED_REPEAT},bt={[an]:i.NEAREST,[sd]:i.NEAREST_MIPMAP_NEAREST,[Eo]:i.NEAREST_MIPMAP_LINEAR,[Ve]:i.LINEAR,[nc]:i.LINEAR_MIPMAP_NEAREST,[es]:i.LINEAR_MIPMAP_LINEAR},ie={[cd]:i.NEVER,[fd]:i.ALWAYS,[ld]:i.LESS,[zc]:i.LEQUAL,[hd]:i.EQUAL,[Hc]:i.GEQUAL,[ud]:i.GREATER,[dd]:i.NOTEQUAL};function Lt(R,b){if(b.type===Yn&&t.has("OES_texture_float_linear")===!1&&(b.magFilter===Ve||b.magFilter===nc||b.magFilter===Eo||b.magFilter===es||b.minFilter===Ve||b.minFilter===nc||b.minFilter===Eo||b.minFilter===es)&&ne("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(R,i.TEXTURE_WRAP_S,Rt[b.wrapS]),i.texParameteri(R,i.TEXTURE_WRAP_T,Rt[b.wrapT]),(R===i.TEXTURE_3D||R===i.TEXTURE_2D_ARRAY)&&i.texParameteri(R,i.TEXTURE_WRAP_R,Rt[b.wrapR]),i.texParameteri(R,i.TEXTURE_MAG_FILTER,bt[b.magFilter]),i.texParameteri(R,i.TEXTURE_MIN_FILTER,bt[b.minFilter]),b.compareFunction&&(i.texParameteri(R,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(R,i.TEXTURE_COMPARE_FUNC,ie[b.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(b.magFilter===an||b.minFilter!==Eo&&b.minFilter!==es||b.type===Yn&&t.has("OES_texture_float_linear")===!1)return;if(b.anisotropy>1||n.get(b).__currentAnisotropy){let G=t.get("EXT_texture_filter_anisotropic");i.texParameterf(R,G.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(b.anisotropy,s.getMaxAnisotropy())),n.get(b).__currentAnisotropy=b.anisotropy}}}function oe(R,b){let G=!1;R.__webglInit===void 0&&(R.__webglInit=!0,b.addEventListener("dispose",A));let K=b.source,rt=f.get(K);rt===void 0&&(rt={},f.set(K,rt));let _t=N(b);if(_t!==R.__cacheKey){rt[_t]===void 0&&(rt[_t]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,G=!0),rt[_t].usedTimes++;let vt=rt[R.__cacheKey];vt!==void 0&&(rt[R.__cacheKey].usedTimes--,vt.usedTimes===0&&C(b)),R.__cacheKey=_t,R.__webglTexture=rt[_t].texture}return G}function et(R,b,G){return Math.floor(Math.floor(R/G)/b)}function W(R,b,G,K){let _t=R.updateRanges;if(_t.length===0)e.texSubImage2D(i.TEXTURE_2D,0,0,0,b.width,b.height,G,K,b.data);else{_t.sort((Yt,Mt)=>Yt.start-Mt.start);let vt=0;for(let Yt=1;Yt<_t.length;Yt++){let Mt=_t[vt],Et=_t[Yt],qt=Mt.start+Mt.count,Jt=et(Et.start,b.width,4),ae=et(Mt.start,b.width,4);Et.start<=qt+1&&Jt===ae&&et(Et.start+Et.count-1,b.width,4)===Jt?Mt.count=Math.max(Mt.count,Et.start+Et.count-Mt.start):(++vt,_t[vt]=Et)}_t.length=vt+1;let st=e.getParameter(i.UNPACK_ROW_LENGTH),ct=e.getParameter(i.UNPACK_SKIP_PIXELS),Ct=e.getParameter(i.UNPACK_SKIP_ROWS);e.pixelStorei(i.UNPACK_ROW_LENGTH,b.width);for(let Yt=0,Mt=_t.length;Yt<Mt;Yt++){let Et=_t[Yt],qt=Math.floor(Et.start/4),Jt=Math.ceil(Et.count/4),ae=qt%b.width,H=Math.floor(qt/b.width),Pt=Jt,at=1;e.pixelStorei(i.UNPACK_SKIP_PIXELS,ae),e.pixelStorei(i.UNPACK_SKIP_ROWS,H),e.texSubImage2D(i.TEXTURE_2D,0,ae,H,Pt,at,G,K,b.data)}R.clearUpdateRanges(),e.pixelStorei(i.UNPACK_ROW_LENGTH,st),e.pixelStorei(i.UNPACK_SKIP_PIXELS,ct),e.pixelStorei(i.UNPACK_SKIP_ROWS,Ct)}}function ht(R,b,G){let K=i.TEXTURE_2D;(b.isDataArrayTexture||b.isCompressedArrayTexture)&&(K=i.TEXTURE_2D_ARRAY),b.isData3DTexture&&(K=i.TEXTURE_3D);let rt=oe(R,b),_t=b.source;e.bindTexture(K,R.__webglTexture,i.TEXTURE0+G);let vt=n.get(_t);if(_t.version!==vt.__version||rt===!0){if(e.activeTexture(i.TEXTURE0+G),(typeof ImageBitmap!="undefined"&&b.image instanceof ImageBitmap)===!1){let at=xe.getPrimaries(xe.workingColorSpace),At=b.colorSpace===Ci?null:xe.getPrimaries(b.colorSpace),wt=b.colorSpace===Ci||at===At?i.NONE:i.BROWSER_DEFAULT_WEBGL;e.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,b.flipY),e.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),e.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,wt)}e.pixelStorei(i.UNPACK_ALIGNMENT,b.unpackAlignment);let ct=m(b.image,!1,s.maxTextureSize);ct=ce(b,ct);let Ct=r.convert(b.format,b.colorSpace),Yt=r.convert(b.type),Mt=v(b.internalFormat,Ct,Yt,b.normalized,b.colorSpace,b.isVideoTexture);Lt(K,b);let Et,qt=b.mipmaps,Jt=b.isVideoTexture!==!0,ae=vt.__version===void 0||rt===!0,H=_t.dataReady,Pt=E(b,ct);if(b.isDepthTexture)Mt=M(b.format===ns,b.type),ae&&(Jt?e.texStorage2D(i.TEXTURE_2D,1,Mt,ct.width,ct.height):e.texImage2D(i.TEXTURE_2D,0,Mt,ct.width,ct.height,0,Ct,Yt,null));else if(b.isDataTexture)if(qt.length>0){Jt&&ae&&e.texStorage2D(i.TEXTURE_2D,Pt,Mt,qt[0].width,qt[0].height);for(let at=0,At=qt.length;at<At;at++)Et=qt[at],Jt?H&&e.texSubImage2D(i.TEXTURE_2D,at,0,0,Et.width,Et.height,Ct,Yt,Et.data):e.texImage2D(i.TEXTURE_2D,at,Mt,Et.width,Et.height,0,Ct,Yt,Et.data);b.generateMipmaps=!1}else Jt?(ae&&e.texStorage2D(i.TEXTURE_2D,Pt,Mt,ct.width,ct.height),H&&W(b,ct,Ct,Yt)):e.texImage2D(i.TEXTURE_2D,0,Mt,ct.width,ct.height,0,Ct,Yt,ct.data);else if(b.isCompressedTexture)if(b.isCompressedArrayTexture){Jt&&ae&&e.texStorage3D(i.TEXTURE_2D_ARRAY,Pt,Mt,qt[0].width,qt[0].height,ct.depth);for(let at=0,At=qt.length;at<At;at++)if(Et=qt[at],b.format!==An)if(Ct!==null)if(Jt){if(H)if(b.layerUpdates.size>0){let wt=vh(Et.width,Et.height,b.format,b.type);for(let ft of b.layerUpdates){let Xt=Et.data.subarray(ft*wt/Et.data.BYTES_PER_ELEMENT,(ft+1)*wt/Et.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,at,0,0,ft,Et.width,Et.height,1,Ct,Xt)}}else e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,at,0,0,0,Et.width,Et.height,ct.depth,Ct,Et.data)}else e.compressedTexImage3D(i.TEXTURE_2D_ARRAY,at,Mt,Et.width,Et.height,ct.depth,0,Et.data,0,0);else ne("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Jt?H&&e.texSubImage3D(i.TEXTURE_2D_ARRAY,at,0,0,0,Et.width,Et.height,ct.depth,Ct,Yt,Et.data):e.texImage3D(i.TEXTURE_2D_ARRAY,at,Mt,Et.width,Et.height,ct.depth,0,Ct,Yt,Et.data);b.layerUpdates.size>0&&b.clearLayerUpdates()}else{Jt&&ae&&e.texStorage2D(i.TEXTURE_2D,Pt,Mt,qt[0].width,qt[0].height);for(let at=0,At=qt.length;at<At;at++)Et=qt[at],b.format!==An?Ct!==null?Jt?H&&e.compressedTexSubImage2D(i.TEXTURE_2D,at,0,0,Et.width,Et.height,Ct,Et.data):e.compressedTexImage2D(i.TEXTURE_2D,at,Mt,Et.width,Et.height,0,Et.data):ne("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Jt?H&&e.texSubImage2D(i.TEXTURE_2D,at,0,0,Et.width,Et.height,Ct,Yt,Et.data):e.texImage2D(i.TEXTURE_2D,at,Mt,Et.width,Et.height,0,Ct,Yt,Et.data)}else if(b.isDataArrayTexture)if(Jt){if(ae&&e.texStorage3D(i.TEXTURE_2D_ARRAY,Pt,Mt,ct.width,ct.height,ct.depth),H)if(b.layerUpdates.size>0){let at=vh(ct.width,ct.height,b.format,b.type);for(let At of b.layerUpdates){let wt=ct.data.subarray(At*at/ct.data.BYTES_PER_ELEMENT,(At+1)*at/ct.data.BYTES_PER_ELEMENT);e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,At,ct.width,ct.height,1,Ct,Yt,wt)}b.clearLayerUpdates()}else e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,ct.width,ct.height,ct.depth,Ct,Yt,ct.data)}else e.texImage3D(i.TEXTURE_2D_ARRAY,0,Mt,ct.width,ct.height,ct.depth,0,Ct,Yt,ct.data);else if(b.isData3DTexture)Jt?(ae&&e.texStorage3D(i.TEXTURE_3D,Pt,Mt,ct.width,ct.height,ct.depth),H&&e.texSubImage3D(i.TEXTURE_3D,0,0,0,0,ct.width,ct.height,ct.depth,Ct,Yt,ct.data)):e.texImage3D(i.TEXTURE_3D,0,Mt,ct.width,ct.height,ct.depth,0,Ct,Yt,ct.data);else if(b.isFramebufferTexture){if(ae)if(Jt)e.texStorage2D(i.TEXTURE_2D,Pt,Mt,ct.width,ct.height);else{let at=ct.width,At=ct.height;for(let wt=0;wt<Pt;wt++)e.texImage2D(i.TEXTURE_2D,wt,Mt,at,At,0,Ct,Yt,null),at>>=1,At>>=1}}else if(b.isHTMLTexture){if("texElementImage2D"in i){let at=i.canvas;if(at.hasAttribute("layoutsubtree")||at.setAttribute("layoutsubtree","true"),ct.parentNode!==at){at.appendChild(ct),u.add(b),at.onpaint=At=>{let wt=At.changedElements;for(let ft of u)wt.includes(ft.image)&&(ft.needsUpdate=!0)},at.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,ct);else{let wt=i.RGBA,ft=i.RGBA,Xt=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,wt,ft,Xt,ct)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(qt.length>0){if(Jt&&ae){let at=Qt(qt[0]);e.texStorage2D(i.TEXTURE_2D,Pt,Mt,at.width,at.height)}for(let at=0,At=qt.length;at<At;at++)Et=qt[at],Jt?H&&e.texSubImage2D(i.TEXTURE_2D,at,0,0,Ct,Yt,Et):e.texImage2D(i.TEXTURE_2D,at,Mt,Ct,Yt,Et);b.generateMipmaps=!1}else if(Jt){if(ae){let at=Qt(ct);e.texStorage2D(i.TEXTURE_2D,Pt,Mt,at.width,at.height)}H&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,Ct,Yt,ct)}else e.texImage2D(i.TEXTURE_2D,0,Mt,Ct,Yt,ct);p(b)&&y(K),vt.__version=_t.version,b.onUpdate&&b.onUpdate(b)}R.__version=b.version}function lt(R,b,G){if(b.image.length!==6)return;let K=oe(R,b),rt=b.source;e.bindTexture(i.TEXTURE_CUBE_MAP,R.__webglTexture,i.TEXTURE0+G);let _t=n.get(rt);if(rt.version!==_t.__version||K===!0){e.activeTexture(i.TEXTURE0+G);let vt=xe.getPrimaries(xe.workingColorSpace),st=b.colorSpace===Ci?null:xe.getPrimaries(b.colorSpace),ct=b.colorSpace===Ci||vt===st?i.NONE:i.BROWSER_DEFAULT_WEBGL;e.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,b.flipY),e.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),e.pixelStorei(i.UNPACK_ALIGNMENT,b.unpackAlignment),e.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ct);let Ct=b.isCompressedTexture||b.image[0].isCompressedTexture,Yt=b.image[0]&&b.image[0].isDataTexture,Mt=[];for(let ft=0;ft<6;ft++)!Ct&&!Yt?Mt[ft]=m(b.image[ft],!0,s.maxCubemapSize):Mt[ft]=Yt?b.image[ft].image:b.image[ft],Mt[ft]=ce(b,Mt[ft]);let Et=Mt[0],qt=r.convert(b.format,b.colorSpace),Jt=r.convert(b.type),ae=v(b.internalFormat,qt,Jt,b.normalized,b.colorSpace),H=b.isVideoTexture!==!0,Pt=_t.__version===void 0||K===!0,at=rt.dataReady,At=E(b,Et);Lt(i.TEXTURE_CUBE_MAP,b);let wt;if(Ct){H&&Pt&&e.texStorage2D(i.TEXTURE_CUBE_MAP,At,ae,Et.width,Et.height);for(let ft=0;ft<6;ft++){wt=Mt[ft].mipmaps;for(let Xt=0;Xt<wt.length;Xt++){let Gt=wt[Xt];b.format!==An?qt!==null?H?at&&e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ft,Xt,0,0,Gt.width,Gt.height,qt,Gt.data):e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ft,Xt,ae,Gt.width,Gt.height,0,Gt.data):ne("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):H?at&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ft,Xt,0,0,Gt.width,Gt.height,qt,Jt,Gt.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ft,Xt,ae,Gt.width,Gt.height,0,qt,Jt,Gt.data)}}}else{if(wt=b.mipmaps,H&&Pt){wt.length>0&&At++;let ft=Qt(Mt[0]);e.texStorage2D(i.TEXTURE_CUBE_MAP,At,ae,ft.width,ft.height)}for(let ft=0;ft<6;ft++)if(Yt){H?at&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ft,0,0,0,Mt[ft].width,Mt[ft].height,qt,Jt,Mt[ft].data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ft,0,ae,Mt[ft].width,Mt[ft].height,0,qt,Jt,Mt[ft].data);for(let Xt=0;Xt<wt.length;Xt++){let ve=wt[Xt].image[ft].image;H?at&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ft,Xt+1,0,0,ve.width,ve.height,qt,Jt,ve.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ft,Xt+1,ae,ve.width,ve.height,0,qt,Jt,ve.data)}}else{H?at&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ft,0,0,0,qt,Jt,Mt[ft]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ft,0,ae,qt,Jt,Mt[ft]);for(let Xt=0;Xt<wt.length;Xt++){let Gt=wt[Xt];H?at&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ft,Xt+1,0,0,qt,Jt,Gt.image[ft]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ft,Xt+1,ae,qt,Jt,Gt.image[ft])}}}p(b)&&y(i.TEXTURE_CUBE_MAP),_t.__version=rt.version,b.onUpdate&&b.onUpdate(b)}R.__version=b.version}function ut(R,b,G,K,rt,_t){let vt=r.convert(G.format,G.colorSpace),st=r.convert(G.type),ct=v(G.internalFormat,vt,st,G.normalized,G.colorSpace),Ct=n.get(b),Yt=n.get(G);if(Yt.__renderTarget=b,!Ct.__hasExternalTextures){let Mt=Math.max(1,b.width>>_t),Et=Math.max(1,b.height>>_t);rt===i.TEXTURE_3D||rt===i.TEXTURE_2D_ARRAY?e.texImage3D(rt,_t,ct,Mt,Et,b.depth,0,vt,st,null):e.texImage2D(rt,_t,ct,Mt,Et,0,vt,st,null)}e.bindFramebuffer(i.FRAMEBUFFER,R),Tt(b)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,K,rt,Yt.__webglTexture,0,Bt(b)):(rt===i.TEXTURE_2D||rt>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&rt<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,K,rt,Yt.__webglTexture,_t),e.bindFramebuffer(i.FRAMEBUFFER,null)}function ot(R,b,G){if(i.bindRenderbuffer(i.RENDERBUFFER,R),b.depthBuffer){let K=b.depthTexture,rt=K&&K.isDepthTexture?K.type:null,_t=M(b.stencilBuffer,rt),vt=b.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;Tt(b)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Bt(b),_t,b.width,b.height):G?i.renderbufferStorageMultisample(i.RENDERBUFFER,Bt(b),_t,b.width,b.height):i.renderbufferStorage(i.RENDERBUFFER,_t,b.width,b.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,vt,i.RENDERBUFFER,R)}else{let K=b.textures;for(let rt=0;rt<K.length;rt++){let _t=K[rt],vt=r.convert(_t.format,_t.colorSpace),st=r.convert(_t.type),ct=v(_t.internalFormat,vt,st,_t.normalized,_t.colorSpace);Tt(b)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Bt(b),ct,b.width,b.height):G?i.renderbufferStorageMultisample(i.RENDERBUFFER,Bt(b),ct,b.width,b.height):i.renderbufferStorage(i.RENDERBUFFER,ct,b.width,b.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function It(R,b,G){let K=b.isWebGLCubeRenderTarget===!0;if(e.bindFramebuffer(i.FRAMEBUFFER,R),!(b.depthTexture&&b.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let rt=n.get(b.depthTexture);if(rt.__renderTarget=b,(!rt.__webglTexture||b.depthTexture.image.width!==b.width||b.depthTexture.image.height!==b.height)&&(b.depthTexture.image.width=b.width,b.depthTexture.image.height=b.height,b.depthTexture.needsUpdate=!0),K){if(rt.__webglInit===void 0&&(rt.__webglInit=!0,b.depthTexture.addEventListener("dispose",A)),rt.__webglTexture===void 0){rt.__webglTexture=i.createTexture(),e.bindTexture(i.TEXTURE_CUBE_MAP,rt.__webglTexture),Lt(i.TEXTURE_CUBE_MAP,b.depthTexture);let Ct=r.convert(b.depthTexture.format),Yt=r.convert(b.depthTexture.type),Mt;b.depthTexture.format===hi?Mt=i.DEPTH_COMPONENT24:b.depthTexture.format===ns&&(Mt=i.DEPTH24_STENCIL8);for(let Et=0;Et<6;Et++)i.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Et,0,Mt,b.width,b.height,0,Ct,Yt,null)}}else Z(b.depthTexture,0);let _t=rt.__webglTexture,vt=Bt(b),st=K?i.TEXTURE_CUBE_MAP_POSITIVE_X+G:i.TEXTURE_2D,ct=b.depthTexture.format===ns?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(b.depthTexture.format===hi)Tt(b)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ct,st,_t,0,vt):i.framebufferTexture2D(i.FRAMEBUFFER,ct,st,_t,0);else if(b.depthTexture.format===ns)Tt(b)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ct,st,_t,0,vt):i.framebufferTexture2D(i.FRAMEBUFFER,ct,st,_t,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function B(R){let b=n.get(R),G=R.isWebGLCubeRenderTarget===!0;if(b.__boundDepthTexture!==R.depthTexture){let K=R.depthTexture;if(b.__depthDisposeCallback&&b.__depthDisposeCallback(),K){let rt=()=>{delete b.__boundDepthTexture,delete b.__depthDisposeCallback,K.removeEventListener("dispose",rt)};K.addEventListener("dispose",rt),b.__depthDisposeCallback=rt}b.__boundDepthTexture=K}if(R.depthTexture&&!b.__autoAllocateDepthBuffer)if(G)for(let K=0;K<6;K++)It(b.__webglFramebuffer[K],R,K);else{let K=R.texture.mipmaps;K&&K.length>0?It(b.__webglFramebuffer[0],R,0):It(b.__webglFramebuffer,R,0)}else if(G){b.__webglDepthbuffer=[];for(let K=0;K<6;K++)if(e.bindFramebuffer(i.FRAMEBUFFER,b.__webglFramebuffer[K]),b.__webglDepthbuffer[K]===void 0)b.__webglDepthbuffer[K]=i.createRenderbuffer(),ot(b.__webglDepthbuffer[K],R,!1);else{let rt=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,_t=b.__webglDepthbuffer[K];i.bindRenderbuffer(i.RENDERBUFFER,_t),i.framebufferRenderbuffer(i.FRAMEBUFFER,rt,i.RENDERBUFFER,_t)}}else{let K=R.texture.mipmaps;if(K&&K.length>0?e.bindFramebuffer(i.FRAMEBUFFER,b.__webglFramebuffer[0]):e.bindFramebuffer(i.FRAMEBUFFER,b.__webglFramebuffer),b.__webglDepthbuffer===void 0)b.__webglDepthbuffer=i.createRenderbuffer(),ot(b.__webglDepthbuffer,R,!1);else{let rt=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,_t=b.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,_t),i.framebufferRenderbuffer(i.FRAMEBUFFER,rt,i.RENDERBUFFER,_t)}}e.bindFramebuffer(i.FRAMEBUFFER,null)}function $(R,b,G){let K=n.get(R);b!==void 0&&ut(K.__webglFramebuffer,R,R.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),G!==void 0&&B(R)}function it(R){let b=R.texture,G=n.get(R),K=n.get(b);R.addEventListener("dispose",x);let rt=R.textures,_t=R.isWebGLCubeRenderTarget===!0,vt=rt.length>1;if(vt||(K.__webglTexture===void 0&&(K.__webglTexture=i.createTexture()),K.__version=b.version,o.memory.textures++),_t){G.__webglFramebuffer=[];for(let st=0;st<6;st++)if(b.mipmaps&&b.mipmaps.length>0){G.__webglFramebuffer[st]=[];for(let ct=0;ct<b.mipmaps.length;ct++)G.__webglFramebuffer[st][ct]=i.createFramebuffer()}else G.__webglFramebuffer[st]=i.createFramebuffer()}else{if(b.mipmaps&&b.mipmaps.length>0){G.__webglFramebuffer=[];for(let st=0;st<b.mipmaps.length;st++)G.__webglFramebuffer[st]=i.createFramebuffer()}else G.__webglFramebuffer=i.createFramebuffer();if(vt)for(let st=0,ct=rt.length;st<ct;st++){let Ct=n.get(rt[st]);Ct.__webglTexture===void 0&&(Ct.__webglTexture=i.createTexture(),o.memory.textures++)}if(R.samples>0&&Tt(R)===!1){G.__webglMultisampledFramebuffer=i.createFramebuffer(),G.__webglColorRenderbuffer=[],e.bindFramebuffer(i.FRAMEBUFFER,G.__webglMultisampledFramebuffer);for(let st=0;st<rt.length;st++){let ct=rt[st];G.__webglColorRenderbuffer[st]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,G.__webglColorRenderbuffer[st]);let Ct=r.convert(ct.format,ct.colorSpace),Yt=r.convert(ct.type),Mt=v(ct.internalFormat,Ct,Yt,ct.normalized,ct.colorSpace,R.isXRRenderTarget===!0),Et=Bt(R);i.renderbufferStorageMultisample(i.RENDERBUFFER,Et,Mt,R.width,R.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+st,i.RENDERBUFFER,G.__webglColorRenderbuffer[st])}i.bindRenderbuffer(i.RENDERBUFFER,null),R.depthBuffer&&(G.__webglDepthRenderbuffer=i.createRenderbuffer(),ot(G.__webglDepthRenderbuffer,R,!0)),e.bindFramebuffer(i.FRAMEBUFFER,null)}}if(_t){e.bindTexture(i.TEXTURE_CUBE_MAP,K.__webglTexture),Lt(i.TEXTURE_CUBE_MAP,b);for(let st=0;st<6;st++)if(b.mipmaps&&b.mipmaps.length>0)for(let ct=0;ct<b.mipmaps.length;ct++)ut(G.__webglFramebuffer[st][ct],R,b,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+st,ct);else ut(G.__webglFramebuffer[st],R,b,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+st,0);p(b)&&y(i.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(vt){for(let st=0,ct=rt.length;st<ct;st++){let Ct=rt[st],Yt=n.get(Ct),Mt=i.TEXTURE_2D;(R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(Mt=R.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(Mt,Yt.__webglTexture),Lt(Mt,Ct),ut(G.__webglFramebuffer,R,Ct,i.COLOR_ATTACHMENT0+st,Mt,0),p(Ct)&&y(Mt)}e.unbindTexture()}else{let st=i.TEXTURE_2D;if((R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(st=R.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(st,K.__webglTexture),Lt(st,b),b.mipmaps&&b.mipmaps.length>0)for(let ct=0;ct<b.mipmaps.length;ct++)ut(G.__webglFramebuffer[ct],R,b,i.COLOR_ATTACHMENT0,st,ct);else ut(G.__webglFramebuffer,R,b,i.COLOR_ATTACHMENT0,st,0);p(b)&&y(st),e.unbindTexture()}R.depthBuffer&&B(R)}function dt(R){let b=R.textures;for(let G=0,K=b.length;G<K;G++){let rt=b[G];if(p(rt)){let _t=S(R),vt=n.get(rt).__webglTexture;e.bindTexture(_t,vt),y(_t),e.unbindTexture()}}}let xt=[],Ht=[];function mt(R){if(R.samples>0){if(Tt(R)===!1){let b=R.textures,G=R.width,K=R.height,rt=i.COLOR_BUFFER_BIT,_t=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,vt=n.get(R),st=b.length>1;if(st)for(let Ct=0;Ct<b.length;Ct++)e.bindFramebuffer(i.FRAMEBUFFER,vt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ct,i.RENDERBUFFER,null),e.bindFramebuffer(i.FRAMEBUFFER,vt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ct,i.TEXTURE_2D,null,0);e.bindFramebuffer(i.READ_FRAMEBUFFER,vt.__webglMultisampledFramebuffer);let ct=R.texture.mipmaps;ct&&ct.length>0?e.bindFramebuffer(i.DRAW_FRAMEBUFFER,vt.__webglFramebuffer[0]):e.bindFramebuffer(i.DRAW_FRAMEBUFFER,vt.__webglFramebuffer);for(let Ct=0;Ct<b.length;Ct++){if(R.resolveDepthBuffer&&(R.depthBuffer&&(rt|=i.DEPTH_BUFFER_BIT),R.stencilBuffer&&R.resolveStencilBuffer&&(rt|=i.STENCIL_BUFFER_BIT)),st){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,vt.__webglColorRenderbuffer[Ct]);let Yt=n.get(b[Ct]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Yt,0)}i.blitFramebuffer(0,0,G,K,0,0,G,K,rt,i.NEAREST),c===!0&&(xt.length=0,Ht.length=0,xt.push(i.COLOR_ATTACHMENT0+Ct),R.depthBuffer&&R.storeMultisampledDepthBuffer===!1&&(xt.push(_t),Ht.push(_t),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,Ht)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,xt))}if(e.bindFramebuffer(i.READ_FRAMEBUFFER,null),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),st)for(let Ct=0;Ct<b.length;Ct++){e.bindFramebuffer(i.FRAMEBUFFER,vt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ct,i.RENDERBUFFER,vt.__webglColorRenderbuffer[Ct]);let Yt=n.get(b[Ct]).__webglTexture;e.bindFramebuffer(i.FRAMEBUFFER,vt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ct,i.TEXTURE_2D,Yt,0)}e.bindFramebuffer(i.DRAW_FRAMEBUFFER,vt.__webglMultisampledFramebuffer)}else if(R.depthBuffer&&R.storeMultisampledDepthBuffer===!1&&c){let b=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[b])}}}function Bt(R){return Math.min(s.maxSamples,R.samples)}function Tt(R){let b=n.get(R);return R.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&b.__useRenderToTexture!==!1}function U(R){let b=o.render.frame;h.get(R)!==b&&(h.set(R,b),R.update())}function ce(R,b){let G=R.colorSpace,K=R.format,rt=R.type;return R.isCompressedTexture===!0||R.isVideoTexture===!0||G!==Zr&&G!==Ci&&(xe.getTransfer(G)===Ae?(K!==An||rt!==Pn)&&ne("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):re("WebGLTextures: Unsupported texture color space:",G)),b}function Qt(R){return typeof HTMLImageElement!="undefined"&&R instanceof HTMLImageElement?(l.width=R.naturalWidth||R.width,l.height=R.naturalHeight||R.height):typeof VideoFrame!="undefined"&&R instanceof VideoFrame?(l.width=R.displayWidth,l.height=R.displayHeight):(l.width=R.width,l.height=R.height),l}this.allocateTextureUnit=q,this.resetTextureUnits=O,this.getTextureUnits=F,this.setTextureUnits=X,this.setTexture2D=Z,this.setTexture2DArray=V,this.setTexture3D=Y,this.setTextureCube=J,this.rebindTextures=$,this.setupRenderTarget=it,this.updateRenderTargetMipmap=dt,this.updateMultisampleRenderTarget=mt,this.setupDepthRenderbuffer=B,this.setupFrameBufferTexture=ut,this.useMultisampledRTT=Tt,this.isReversedDepthBuffer=function(){return e.buffers.depth.getReversed()}}function Zx(i,t){function e(n,s=Ci){let r,o=xe.getTransfer(s);if(n===Pn)return i.UNSIGNED_BYTE;if(n===sc)return i.UNSIGNED_SHORT_4_4_4_4;if(n===rc)return i.UNSIGNED_SHORT_5_5_5_1;if(n===ch)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===lh)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===oh)return i.BYTE;if(n===ah)return i.SHORT;if(n===_r)return i.UNSIGNED_SHORT;if(n===ic)return i.INT;if(n===si)return i.UNSIGNED_INT;if(n===Yn)return i.FLOAT;if(n===ri)return i.HALF_FLOAT;if(n===hh)return i.ALPHA;if(n===uh)return i.RGB;if(n===An)return i.RGBA;if(n===hi)return i.DEPTH_COMPONENT;if(n===ns)return i.DEPTH_STENCIL;if(n===oc)return i.RED;if(n===ac)return i.RED_INTEGER;if(n===is)return i.RG;if(n===cc)return i.RG_INTEGER;if(n===lc)return i.RGBA_INTEGER;if(n===wo||n===To||n===Ao||n===Ro)if(o===Ae)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===wo)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===To)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Ao)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Ro)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===wo)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===To)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Ao)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Ro)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===hc||n===uc||n===dc||n===fc)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===hc)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===uc)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===dc)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===fc)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===pc||n===mc||n===gc||n===_c||n===xc||n===Co||n===yc)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===pc||n===mc)return o===Ae?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===gc)return o===Ae?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===_c)return r.COMPRESSED_R11_EAC;if(n===xc)return r.COMPRESSED_SIGNED_R11_EAC;if(n===Co)return r.COMPRESSED_RG11_EAC;if(n===yc)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===vc||n===bc||n===Sc||n===Mc||n===Ec||n===wc||n===Tc||n===Ac||n===Rc||n===Cc||n===Pc||n===Ic||n===Lc||n===Dc)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===vc)return o===Ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===bc)return o===Ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Sc)return o===Ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Mc)return o===Ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Ec)return o===Ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===wc)return o===Ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Tc)return o===Ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Ac)return o===Ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Rc)return o===Ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Cc)return o===Ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Pc)return o===Ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Ic)return o===Ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Lc)return o===Ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Dc)return o===Ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Nc||n===Uc||n===Fc)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===Nc)return o===Ae?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Uc)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Fc)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Oc||n===Bc||n===Po||n===kc)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===Oc)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Bc)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Po)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===kc)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===xr?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:e}}var $x=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Jx=`
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

}`,kh=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){let n=new so(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=n}}getMesh(t){if(this.texture!==null&&this.mesh===null){let e=t.cameras[0].viewport,n=new kn({vertexShader:$x,fragmentShader:Jx,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new Dt(new Cn(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},zh=class extends ei{constructor(t,e){super();let n=this,s=null,r=1,o=null,a="local-floor",c=1,l=null,h=null,u=null,d=null,f=null,_=null,g=typeof XRWebGLBinding!="undefined",m=new kh,p={},y=e.getContextAttributes(),S=null,v=null,M=[],E=[],A=new pt,x=null,w=null,C=new Qe;C.viewport=new Be;let L=new Qe;L.viewport=new Be;let P=[C,L],O=new Ka,F=null,X=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(et){let W=M[et];return W===void 0&&(W=new sr,M[et]=W),W.getTargetRaySpace()},this.getControllerGrip=function(et){let W=M[et];return W===void 0&&(W=new sr,M[et]=W),W.getGripSpace()},this.getHand=function(et){let W=M[et];return W===void 0&&(W=new sr,M[et]=W),W.getHandSpace()};function q(et){let W=E.indexOf(et.inputSource);if(W===-1)return;let ht=M[W];ht!==void 0&&(ht.update(et.inputSource,et.frame,l||o),ht.dispatchEvent({type:et.type,data:et.inputSource}))}function N(){s.removeEventListener("select",q),s.removeEventListener("selectstart",q),s.removeEventListener("selectend",q),s.removeEventListener("squeeze",q),s.removeEventListener("squeezestart",q),s.removeEventListener("squeezeend",q),s.removeEventListener("end",N),s.removeEventListener("inputsourceschange",Z);for(let et=0;et<M.length;et++){let W=E[et];W!==null&&(E[et]=null,M[et].disconnect(W))}F=null,X=null,m.reset();for(let et in p)delete p[et];if(t.setRenderTarget(S),f=null,d=null,u=null,s=null,v=null,oe.stop(),n.isPresenting=!1,t.setPixelRatio(x),t.setSize(A.width,A.height,!1),w!==null){let et=w.camera;et.fov=w.fov,et.zoom=w.zoom,et.updateProjectionMatrix(),w=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(et){r=et,n.isPresenting===!0&&ne("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(et){a=et,n.isPresenting===!0&&ne("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||o},this.setReferenceSpace=function(et){l=et},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return u===null&&g&&(u=new XRWebGLBinding(s,e)),u},this.getFrame=function(){return _},this.getSession=function(){return s},this.setSession=async function(et){if(s=et,s!==null){if(S=t.getRenderTarget(),s.addEventListener("select",q),s.addEventListener("selectstart",q),s.addEventListener("selectend",q),s.addEventListener("squeeze",q),s.addEventListener("squeezestart",q),s.addEventListener("squeezeend",q),s.addEventListener("end",N),s.addEventListener("inputsourceschange",Z),y.xrCompatible!==!0&&await e.makeXRCompatible(),x=t.getPixelRatio(),t.getSize(A),g&&"createProjectionLayer"in XRWebGLBinding.prototype){let ht=null,lt=null,ut=null;y.depth&&(ut=y.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,ht=y.stencil?ns:hi,lt=y.stencil?xr:si);let ot={colorFormat:e.RGBA8,depthFormat:ut,scaleFactor:r};u=this.getBinding(),d=u.createProjectionLayer(ot),s.updateRenderState({layers:[d]}),t.setPixelRatio(1),t.setSize(d.textureWidth,d.textureHeight,!1),v=new Rn(d.textureWidth,d.textureHeight,{format:An,type:Pn,depthTexture:new Xi(d.textureWidth,d.textureHeight,lt,void 0,void 0,void 0,void 0,void 0,void 0,ht),stencilBuffer:y.stencil,colorSpace:t.outputColorSpace,samples:y.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}else{let ht={antialias:y.antialias,alpha:!0,depth:y.depth,stencil:y.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,e,ht),s.updateRenderState({baseLayer:f}),t.setPixelRatio(1),t.setSize(f.framebufferWidth,f.framebufferHeight,!1),v=new Rn(f.framebufferWidth,f.framebufferHeight,{format:An,type:Pn,colorSpace:t.outputColorSpace,stencilBuffer:y.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}v.isXRRenderTarget=!0,this.setFoveation(c),l=null,o=await s.requestReferenceSpace(a),oe.setContext(s),oe.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function Z(et){for(let W=0;W<et.removed.length;W++){let ht=et.removed[W],lt=E.indexOf(ht);lt>=0&&(E[lt]=null,M[lt].disconnect(ht))}for(let W=0;W<et.added.length;W++){let ht=et.added[W],lt=E.indexOf(ht);if(lt===-1){for(let ot=0;ot<M.length;ot++)if(ot>=E.length){E.push(ht),lt=ot;break}else if(E[ot]===null){E[ot]=ht,lt=ot;break}if(lt===-1)break}let ut=M[lt];ut&&ut.connect(ht)}}let V=new D,Y=new D;function J(et,W,ht){V.setFromMatrixPosition(W.matrixWorld),Y.setFromMatrixPosition(ht.matrixWorld);let lt=V.distanceTo(Y),ut=W.projectionMatrix.elements,ot=ht.projectionMatrix.elements,It=ut[14]/(ut[10]-1),B=ut[14]/(ut[10]+1),$=(ut[9]+1)/ut[5],it=(ut[9]-1)/ut[5],dt=(ut[8]-1)/ut[0],xt=(ot[8]+1)/ot[0],Ht=It*dt,mt=It*xt,Bt=lt/(-dt+xt),Tt=Bt*-dt;if(W.matrixWorld.decompose(et.position,et.quaternion,et.scale),et.translateX(Tt),et.translateZ(Bt),et.matrixWorld.compose(et.position,et.quaternion,et.scale),et.matrixWorldInverse.copy(et.matrixWorld).invert(),ut[10]===-1)et.projectionMatrix.copy(W.projectionMatrix),et.projectionMatrixInverse.copy(W.projectionMatrixInverse);else{let U=It+Bt,ce=B+Bt,Qt=Ht-Tt,R=mt+(lt-Tt),b=$*B/ce*U,G=it*B/ce*U;et.projectionMatrix.makePerspective(Qt,R,b,G,U,ce),et.projectionMatrixInverse.copy(et.projectionMatrix).invert()}}function Rt(et,W){W===null?et.matrixWorld.copy(et.matrix):et.matrixWorld.multiplyMatrices(W.matrixWorld,et.matrix),et.matrixWorldInverse.copy(et.matrixWorld).invert()}this.updateCamera=function(et){if(s===null)return;let W=et.near,ht=et.far;m.texture!==null&&(m.depthNear>0&&(W=m.depthNear),m.depthFar>0&&(ht=m.depthFar)),O.near=L.near=C.near=W,O.far=L.far=C.far=ht,(F!==O.near||X!==O.far)&&(s.updateRenderState({depthNear:O.near,depthFar:O.far}),F=O.near,X=O.far),O.layers.mask=et.layers.mask|6,C.layers.mask=O.layers.mask&-5,L.layers.mask=O.layers.mask&-3;let lt=et.parent,ut=O.cameras;Rt(O,lt);for(let ot=0;ot<ut.length;ot++)Rt(ut[ot],lt);ut.length===2?J(O,C,L):O.projectionMatrix.copy(C.projectionMatrix),w===null&&et.isPerspectiveCamera&&(w={camera:et,fov:et.fov,zoom:et.zoom}),bt(et,O,lt)};function bt(et,W,ht){ht===null?et.matrix.copy(W.matrixWorld):(et.matrix.copy(ht.matrixWorld),et.matrix.invert(),et.matrix.multiply(W.matrixWorld)),et.matrix.decompose(et.position,et.quaternion,et.scale),et.updateMatrixWorld(!0),et.projectionMatrix.copy(W.projectionMatrix),et.projectionMatrixInverse.copy(W.projectionMatrixInverse),et.isPerspectiveCamera&&(et.fov=gs*2*Math.atan(1/et.projectionMatrix.elements[5]),et.zoom=1)}this.getCamera=function(){return O},this.getFoveation=function(){if(!(d===null&&f===null))return c},this.setFoveation=function(et){c=et,d!==null&&(d.fixedFoveation=et),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=et)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(O)},this.getCameraTexture=function(et){return p[et]};let ie=null;function Lt(et,W){if(h=W.getViewerPose(l||o),_=W,h!==null){let ht=h.views;f!==null&&(t.setRenderTargetFramebuffer(v,f.framebuffer),t.setRenderTarget(v));let lt=!1;ht.length!==O.cameras.length&&(O.cameras.length=0,lt=!0);for(let B=0;B<ht.length;B++){let $=ht[B],it=null;if(f!==null)it=f.getViewport($);else{let xt=u.getViewSubImage(d,$);it=xt.viewport,B===0&&(t.setRenderTargetTextures(v,xt.colorTexture,xt.depthStencilTexture),t.setRenderTarget(v))}let dt=P[B];dt===void 0&&(dt=new Qe,dt.layers.enable(B),dt.viewport=new Be,P[B]=dt),dt.matrix.fromArray($.transform.matrix),dt.matrix.decompose(dt.position,dt.quaternion,dt.scale),dt.projectionMatrix.fromArray($.projectionMatrix),dt.projectionMatrixInverse.copy(dt.projectionMatrix).invert(),dt.viewport.set(it.x,it.y,it.width,it.height),B===0&&(O.matrix.copy(dt.matrix),O.matrix.decompose(O.position,O.quaternion,O.scale)),lt===!0&&O.cameras.push(dt)}let ut=s.enabledFeatures;if(ut&&ut.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&g){u=n.getBinding();let B=u.getDepthInformation(ht[0]);B&&B.isValid&&B.texture&&m.init(B,s.renderState)}if(ut&&ut.includes("camera-access")&&g){t.state.unbindTexture(),u=n.getBinding();for(let B=0;B<ht.length;B++){let $=ht[B].camera;if($){let it=p[$];it||(it=new so,p[$]=it);let dt=u.getCameraImage($);it.sourceTexture=dt}}}}for(let ht=0;ht<M.length;ht++){let lt=E[ht],ut=M[ht];lt!==null&&ut!==void 0&&ut.update(lt,W,l||o)}ie&&ie(et,W),W.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:W}),_=null}let oe=new Zd;oe.setAnimationLoop(Lt),this.setAnimationLoop=function(et){ie=et},this.dispose=function(){}}},Kx=new Pe,tf=new le;tf.set(-1,0,0,0,1,0,0,0,1);function jx(i,t){function e(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,_h(i)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function s(m,p,y,S,v){p.isNodeMaterial?p.uniformsNeedUpdate=!1:p.isMeshBasicMaterial?r(m,p):p.isMeshLambertMaterial?(r(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshToonMaterial?(r(m,p),u(m,p)):p.isMeshPhongMaterial?(r(m,p),h(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshStandardMaterial?(r(m,p),d(m,p),p.isMeshPhysicalMaterial&&f(m,p,v)):p.isMeshMatcapMaterial?(r(m,p),_(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),g(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(o(m,p),p.isLineDashedMaterial&&a(m,p)):p.isPointsMaterial?c(m,p,y,S):p.isSpriteMaterial?l(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,e(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,e(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===Ke&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,e(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===Ke&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,e(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,e(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,e(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);let y=t.get(p),S=y.envMap,v=y.envMapRotation;S&&(m.envMap.value=S,m.envMapRotation.value.setFromMatrix4(Kx.makeRotationFromEuler(v)).transpose(),S.isCubeTexture&&S.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(tf),m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,e(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,e(p.aoMap,m.aoMapTransform))}function o(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,e(p.map,m.mapTransform))}function a(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function c(m,p,y,S){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*y,m.scale.value=S*.5,p.map&&(m.map.value=p.map,e(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function l(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,e(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function h(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function u(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function d(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,e(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,e(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function f(m,p,y){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,e(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,e(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,e(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,e(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,e(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Ke&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.retroreflectivity>0&&(m.retroreflectivity.value=p.retroreflectivity),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,e(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,e(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=y.texture,m.transmissionSamplerSize.value.set(y.width,y.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,e(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,e(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,e(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,e(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,e(p.specularIntensityMap,m.specularIntensityMapTransform))}function _(m,p){p.matcap&&(m.matcap.value=p.matcap)}function g(m,p){let y=t.get(p).light;m.referencePosition.value.setFromMatrixPosition(y.matrixWorld),m.nearDistance.value=y.shadow.camera.near,m.farDistance.value=y.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function Qx(i,t,e,n){let s={},r={},o=[],a=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function c(v,M){let E=M.program;n.uniformBlockBinding(v,E)}function l(v,M){let E=s[v.id];E===void 0&&(m(v),E=h(v),s[v.id]=E,v.addEventListener("dispose",y));let A=M.program;n.updateUBOMapping(v,A);let x=t.render.frame;r[v.id]!==x&&(d(v),r[v.id]=x)}function h(v){let M=u();v.__bindingPointIndex=M;let E=i.createBuffer(),A=v.__size,x=v.usage;return i.bindBuffer(i.UNIFORM_BUFFER,E),i.bufferData(i.UNIFORM_BUFFER,A,x),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,M,E),E}function u(){for(let v=0;v<a;v++)if(o.indexOf(v)===-1)return o.push(v),v;return re("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(v){let M=s[v.id],E=v.uniforms,A=v.__cache;i.bindBuffer(i.UNIFORM_BUFFER,M);for(let x=0,w=E.length;x<w;x++){let C=E[x];if(Array.isArray(C))for(let L=0,P=C.length;L<P;L++)f(C[L],x,L,A);else f(C,x,0,A)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function f(v,M,E,A){if(g(v,M,E,A)===!0){let x=v.__offset,w=v.value;if(Array.isArray(w)){let C=0;for(let L=0;L<w.length;L++){let P=w[L],O=p(P);_(P,v.__data,C),typeof P!="number"&&typeof P!="boolean"&&!P.isMatrix3&&!ArrayBuffer.isView(P)&&(C+=O.storage/Float32Array.BYTES_PER_ELEMENT)}}else _(w,v.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,x,v.__data)}}function _(v,M,E){typeof v=="number"||typeof v=="boolean"?M[0]=v:v.isMatrix3?(M[0]=v.elements[0],M[1]=v.elements[1],M[2]=v.elements[2],M[3]=0,M[4]=v.elements[3],M[5]=v.elements[4],M[6]=v.elements[5],M[7]=0,M[8]=v.elements[6],M[9]=v.elements[7],M[10]=v.elements[8],M[11]=0):ArrayBuffer.isView(v)?M.set(new v.constructor(v.buffer,v.byteOffset,M.length)):v.toArray(M,E)}function g(v,M,E,A){let x=v.value,w=M+"_"+E;if(A[w]===void 0)return typeof x=="number"||typeof x=="boolean"?A[w]=x:ArrayBuffer.isView(x)?A[w]=x.slice():A[w]=x.clone(),!0;{let C=A[w];if(typeof x=="number"||typeof x=="boolean"){if(C!==x)return A[w]=x,!0}else{if(ArrayBuffer.isView(x))return!0;if(C.equals(x)===!1)return C.copy(x),!0}}return!1}function m(v){let M=v.uniforms,E=0,A=16;for(let w=0,C=M.length;w<C;w++){let L=Array.isArray(M[w])?M[w]:[M[w]];for(let P=0,O=L.length;P<O;P++){let F=L[P],X=Array.isArray(F.value)?F.value:[F.value];for(let q=0,N=X.length;q<N;q++){let Z=X[q],V=p(Z),Y=E%A,J=Y%V.boundary,Rt=Y+J;E+=J,Rt!==0&&A-Rt<V.storage&&(E+=A-Rt),F.__data=new Float32Array(V.storage/Float32Array.BYTES_PER_ELEMENT),F.__offset=E,E+=V.storage}}}let x=E%A;return x>0&&(E+=A-x),v.__size=E,v.__cache={},this}function p(v){let M={boundary:0,storage:0};return typeof v=="number"||typeof v=="boolean"?(M.boundary=4,M.storage=4):v.isVector2?(M.boundary=8,M.storage=8):v.isVector3||v.isColor?(M.boundary=16,M.storage=12):v.isVector4?(M.boundary=16,M.storage=16):v.isMatrix3?(M.boundary=48,M.storage=48):v.isMatrix4?(M.boundary=64,M.storage=64):v.isTexture?ne("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(v)?(M.boundary=16,M.storage=v.byteLength):ne("WebGLRenderer: Unsupported uniform value type.",v),M}function y(v){let M=v.target;M.removeEventListener("dispose",y);let E=o.indexOf(M.__bindingPointIndex);o.splice(E,1),i.deleteBuffer(s[M.id]),delete s[M.id],delete r[M.id]}function S(){for(let v in s)i.deleteBuffer(s[v]);o=[],s={},r={}}return{bind:c,update:l,dispose:S}}var ty=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),pi=null;function ey(){return pi===null&&(pi=new Wi(ty,16,16,is,ri),pi.name="DFG_LUT",pi.minFilter=Ve,pi.magFilter=Ve,pi.wrapS=li,pi.wrapT=li,pi.generateMipmaps=!1,pi.needsUpdate=!0),pi}var Xc=class{constructor(t={}){let{canvas:e=md(),context:n=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1,outputBufferType:f=Pn}=t;this.isWebGLRenderer=!0;let _;if(n!==null){if(typeof WebGLRenderingContext!="undefined"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");_=n.getContextAttributes().alpha}else _=o;let g=f,m=new Set([lc,cc,ac]),p=new Set([Pn,si,_r,xr,sc,rc]),y=new Uint32Array(4),S=new Int32Array(4),v=new D,M=null,E=null,A=[],x=[],w=null;this.domElement=e,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=ii,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let C=this,L=!1,P=null,O=null,F=null,X=null;this._outputColorSpace=$e;let q=0,N=0,Z=null,V=-1,Y=null,J=new Be,Rt=new Be,bt=null,ie=new te(0),Lt=0,oe=e.width,et=e.height,W=1,ht=null,lt=null,ut=new Be(0,0,oe,et),ot=new Be(0,0,oe,et),It=!1,B=new or,$=!1,it=!1,dt=new Pe,xt=new D,Ht=new Be,mt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Bt=!1;function Tt(){return Z===null?W:1}let U=n;function ce(T,z){return e.getContext(T,z)}let Qt,R,b,G,K,rt,_t,vt,st,ct,Ct,Yt,Mt,Et,qt,Jt,ae,H,Pt,at,At,wt,ft;try{let T={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${"186"}`),e.addEventListener("webglcontextlost",ve,!1),e.addEventListener("webglcontextrestored",nt,!1),e.addEventListener("webglcontextcreationerror",St,!1),U===null){let z="webgl2";if(U=ce(z,T),U===null)throw ce(z)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Xt()}catch(T){throw e.removeEventListener("webglcontextlost",ve,!1),e.removeEventListener("webglcontextrestored",nt,!1),e.removeEventListener("webglcontextcreationerror",St,!1),re("WebGLRenderer: "+T.message),T}function Xt(){Qt=new c_(U),Qt.init(),At=new Zx(U,Qt),R=new jg(U,Qt,t,At),b=new Yx(U,Qt),R.reversedDepthBuffer&&d&&b.buffers.depth.setReversed(!0),O=U.createFramebuffer(),F=U.createFramebuffer(),X=U.createFramebuffer(),G=new u_(U),K=new Lx,rt=new qx(U,Qt,b,K,R,At,G),_t=new a_(C),vt=new f0(U),wt=new Jg(U,vt),st=new l_(U,vt,G,wt),ct=new f_(U,st,vt,wt,G),H=new d_(U,R,rt),qt=new Qg(K),Ct=new Ix(C,_t,Qt,R,wt,qt),Yt=new jx(C,K),Mt=new Nx,Et=new zx(Qt),ae=new $g(C,_t,b,ct,_,c),Jt=new Xx(C,ct,R),ft=new Qx(U,G,R,b),Pt=new Kg(U,Qt,G),at=new h_(U,Qt,G),G.programs=Ct.programs,C.capabilities=R,C.extensions=Qt,C.properties=K,C.renderLists=Mt,C.shadowMap=Jt,C.state=b,C.info=G}g!==Pn&&(w=new m_(g,e.width,e.height,a,s,r));let Gt=new zh(C,U);this.xr=Gt,this.getContext=function(){return U},this.getContextAttributes=function(){return U.getContextAttributes()},this.forceContextLoss=function(){let T=Qt.get("WEBGL_lose_context");T&&T.loseContext()},this.forceContextRestore=function(){let T=Qt.get("WEBGL_lose_context");T&&T.restoreContext()},this.getPixelRatio=function(){return W},this.setPixelRatio=function(T){T!==void 0&&(W=T,this.setSize(oe,et,!1))},this.getSize=function(T){return T.set(oe,et)},this.setSize=function(T,z,tt=!0){if(Gt.isPresenting){ne("WebGLRenderer: Can't change size while VR device is presenting.");return}oe=T,et=z,e.width=Math.floor(T*W),e.height=Math.floor(z*W),tt===!0&&(e.style.width=T+"px",e.style.height=z+"px"),w!==null&&w.setSize(e.width,e.height),this.setViewport(0,0,T,z)},this.getDrawingBufferSize=function(T){return T.set(oe*W,et*W).floor()},this.setDrawingBufferSize=function(T,z,tt){oe=T,et=z,W=tt,e.width=Math.floor(T*tt),e.height=Math.floor(z*tt),this.setViewport(0,0,T,z)},this.setEffects=function(T){if(g===Pn){re("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(T){for(let z=0;z<T.length;z++)if(T[z].isOutputPass===!0){ne("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}w.setEffects(T||[])},this.getCurrentViewport=function(T){return T.copy(J)},this.getViewport=function(T){return T.copy(ut)},this.setViewport=function(T,z,tt,j){T.isVector4?ut.set(T.x,T.y,T.z,T.w):ut.set(T,z,tt,j),b.viewport(J.copy(ut).multiplyScalar(W).round())},this.getScissor=function(T){return T.copy(ot)},this.setScissor=function(T,z,tt,j){T.isVector4?ot.set(T.x,T.y,T.z,T.w):ot.set(T,z,tt,j),b.scissor(Rt.copy(ot).multiplyScalar(W).round())},this.getScissorTest=function(){return It},this.setScissorTest=function(T){b.setScissorTest(It=T)},this.setOpaqueSort=function(T){ht=T},this.setTransparentSort=function(T){lt=T},this.getClearColor=function(T){return T.copy(ae.getClearColor())},this.setClearColor=function(){ae.setClearColor(...arguments)},this.getClearAlpha=function(){return ae.getClearAlpha()},this.setClearAlpha=function(){ae.setClearAlpha(...arguments)},this.clear=function(T=!0,z=!0,tt=!0){let j=0;if(T){let Q=!1;if(Z!==null){let Ft=Z.texture.format;Q=m.has(Ft)}if(Q){let Ft=Z.texture.type,Wt=p.has(Ft),Ut=ae.getClearColor(),Zt=ae.getClearAlpha(),Kt=Ut.r,de=Ut.g,ge=Ut.b;Wt?(y[0]=Kt,y[1]=de,y[2]=ge,y[3]=Zt,U.clearBufferuiv(U.COLOR,0,y)):(S[0]=Kt,S[1]=de,S[2]=ge,S[3]=Zt,U.clearBufferiv(U.COLOR,0,S))}else j|=U.COLOR_BUFFER_BIT}z&&(j|=U.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),tt&&(j|=U.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),j!==0&&U.clear(j)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(T){T.setRenderer(this),P=T},this.dispose=function(){e.removeEventListener("webglcontextlost",ve,!1),e.removeEventListener("webglcontextrestored",nt,!1),e.removeEventListener("webglcontextcreationerror",St,!1),ae.dispose(),Mt.dispose(),Et.dispose(),K.dispose(),_t.dispose(),ct.dispose(),wt.dispose(),ft.dispose(),Ct.dispose(),Gt.dispose(),Gt.removeEventListener("sessionstart",oi),Gt.removeEventListener("sessionend",kt),se.stop()};function ve(T){T.preventDefault(),fh("WebGLRenderer: Context Lost."),L=!0}function nt(){fh("WebGLRenderer: Context Restored."),L=!1;let T=G.autoReset,z=Jt.enabled,tt=Jt.autoUpdate,j=Jt.needsUpdate,Q=Jt.type;Xt(),G.autoReset=T,Jt.enabled=z,Jt.autoUpdate=tt,Jt.needsUpdate=j,Jt.type=Q}function St(T){re("WebGLRenderer: A WebGL context could not be created. Reason: ",T.statusMessage)}function ee(T){let z=T.target;z.removeEventListener("dispose",ee),ue(z)}function ue(T){Ee(T),K.remove(T)}function Ee(T){let z=K.get(T).programs;z!==void 0&&(z.forEach(function(tt){Ct.releaseProgram(tt)}),T.isShaderMaterial&&Ct.releaseShaderCache(T))}this.renderBufferDirect=function(T,z,tt,j,Q,Ft){z===null&&(z=mt);let Wt=Q.isMesh&&Q.matrixWorld.determinantAffine()<0,Ut=Ls(T,z,tt,j,Q);b.setMaterial(j,Wt);let Zt=tt.index,Kt=1;if(j.wireframe===!0){if(Zt=st.getWireframeAttribute(tt),Zt===void 0)return;Kt=2}let de=tt.drawRange,ge=tt.attributes.position,$t=de.start*Kt,Te=(de.start+de.count)*Kt;Ft!==null&&($t=Math.max($t,Ft.start*Kt),Te=Math.min(Te,(Ft.start+Ft.count)*Kt)),Zt!==null?($t=Math.max($t,0),Te=Math.min(Te,Zt.count)):ge!=null&&($t=Math.max($t,0),Te=Math.min(Te,ge.count));let qe=Te-$t;if(qe<0||qe===1/0)return;wt.setup(Q,j,Ut,tt,Zt);let Fe,Le=Pt;if(Zt!==null&&(Fe=vt.get(Zt),Le=at,Le.setIndex(Fe)),Q.isMesh)j.wireframe===!0?(b.setLineWidth(j.wireframeLinewidth*Tt()),Le.setMode(U.LINES)):Le.setMode(U.TRIANGLES);else if(Q.isLine){let gn=j.linewidth;gn===void 0&&(gn=1),b.setLineWidth(gn*Tt()),Q.isLineSegments?Le.setMode(U.LINES):Q.isLineLoop?Le.setMode(U.LINE_LOOP):Le.setMode(U.LINE_STRIP)}else Q.isPoints?Le.setMode(U.POINTS):Q.isSprite&&Le.setMode(U.TRIANGLES);if(Q.isBatchedMesh)if(Qt.get("WEBGL_multi_draw"))Le.renderMultiDraw(Q._multiDrawStarts,Q._multiDrawCounts,Q._multiDrawCount);else{let gn=Q._multiDrawStarts,Vt=Q._multiDrawCounts,En=Q._multiDrawCount,be=Zt?vt.get(Zt).bytesPerElement:1,Wn=K.get(j).currentProgram.getUniforms();for(let ai=0;ai<En;ai++)Wn.setValue(U,"_gl_DrawID",ai),Le.render(gn[ai]/be,Vt[ai])}else if(Q.isInstancedMesh)Le.renderInstances($t,qe,Q.count);else if(tt.isInstancedBufferGeometry){let gn=tt._maxInstanceCount!==void 0?tt._maxInstanceCount:1/0,Vt=Math.min(tt.instanceCount,gn);Le.renderInstances($t,qe,Vt)}else Le.render($t,qe)};function cn(T,z,tt,j){P!==null&&T.isNodeMaterial&&P.setObject(j,T),$===!0&&qt.setState(T,tt,!1),T.transparent===!0&&T.side===De&&T.forceSinglePass===!1?(T.side=Ke,T.needsUpdate=!0,mn(T,z,j),T.side=Qi,T.needsUpdate=!0,mn(T,z,j),T.side=De):mn(T,z,j)}this.compile=function(T,z,tt=null){tt===null&&(tt=T),P!==null&&P.renderStart(T,z,tt),E=Et.get(tt),E.init(z),x.push(E),tt.traverseVisible(function(Q){Q.isLight&&Q.layers.test(z.layers)&&(E.pushLight(Q),Q.castShadow&&E.pushShadow(Q))}),T!==tt&&T.traverseVisible(function(Q){Q.isLight&&Q.layers.test(z.layers)&&(E.pushLight(Q),Q.castShadow&&E.pushShadow(Q))}),E.setupLights(),P!==null&&P.updateLights(E.state.lightsArray),it=this.localClippingEnabled,$=qt.init(this.clippingPlanes,it),$===!0&&qt.setGlobalState(this.clippingPlanes,z),P!==null&&Jt.render(E.state.shadowsArray,tt,z);let j=new Set;return T.traverse(function(Q){if(!(Q.isMesh||Q.isPoints||Q.isLine||Q.isSprite))return;let Ft=Q.material;if(Ft)if(Array.isArray(Ft))for(let Wt=0;Wt<Ft.length;Wt++){let Ut=Ft[Wt];cn(Ut,tt,z,Q),j.add(Ut)}else cn(Ft,tt,z,Q),j.add(Ft)}),E=x.pop(),P!==null&&P.renderEnd(),j},this.compileAsync=function(T,z,tt=null){let j=this.compile(T,z,tt);return new Promise(Q=>{function Ft(){if(j.forEach(function(Wt){let Zt=K.get(Wt).currentProgram;(Zt===void 0||Zt.isReady())&&j.delete(Wt)}),j.size===0){Q(T);return}setTimeout(Ft,10)}Qt.get("KHR_parallel_shader_compile")!==null?Ft():setTimeout(Ft,10)})};let ln=null;function Li(T){ln&&ln(T)}function oi(){se.stop()}function kt(){se.start()}let se=new Zd;se.setAnimationLoop(Li),typeof self!="undefined"&&se.setContext(self),this.setAnimationLoop=function(T){ln=T,Gt.setAnimationLoop(T),T===null?se.stop():se.start()},Gt.addEventListener("sessionstart",oi),Gt.addEventListener("sessionend",kt),this.render=function(T,z){if(z!==void 0&&z.isCamera!==!0){re("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(L===!0)return;P!==null&&P.renderStart(T,z);let tt=Gt.enabled===!0&&Gt.isPresenting===!0,j=w!==null&&(Z===null||tt)&&w.begin(C,Z);if(T.matrixWorldAutoUpdate===!0&&T.updateMatrixWorld(),z.parent===null&&z.matrixWorldAutoUpdate===!0&&z.updateMatrixWorld(),Gt.enabled===!0&&Gt.isPresenting===!0&&(w===null||w.isCompositing()===!1)&&(Gt.cameraAutoUpdate===!0&&Gt.updateCamera(z),z=Gt.getCamera()),T.isScene===!0&&T.onBeforeRender(C,T,z,Z),E=Et.get(T,x.length),E.init(z),E.state.textureUnits=rt.getTextureUnits(),x.push(E),dt.multiplyMatrices(z.projectionMatrix,z.matrixWorldInverse),B.setFromProjectionMatrix(dt,ti,z.reversedDepth),it=this.localClippingEnabled,$=qt.init(this.clippingPlanes,it),M=Mt.get(T,A.length),M.init(),A.push(M),Gt.enabled===!0&&Gt.isPresenting===!0){let Wt=C.xr.getDepthSensingMesh();Wt!==null&&Ue(Wt,z,-1/0,C.sortObjects)}Ue(T,z,0,C.sortObjects),M.finish(),P!==null&&P.updateLights(E.state.lightsArray),C.sortObjects===!0&&M.sort(ht,lt),Bt=Gt.enabled===!1||Gt.isPresenting===!1||Gt.hasDepthSensing()===!1,Bt&&ae.addToRenderList(M,T),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),$===!0&&qt.beginShadows();let Q=E.state.shadowsArray;if(Jt.render(Q,T,z),$===!0&&qt.endShadows(),(j&&w.hasRenderPass())===!1){let Wt=M.opaque,Ut=M.transmissive;if(E.setupLights(),z.isArrayCamera){let Zt=z.cameras;if(Ut.length>0)for(let Kt=0,de=Zt.length;Kt<de;Kt++){let ge=Zt[Kt];hn(Wt,Ut,T,ge)}Bt&&ae.render(T);for(let Kt=0,de=Zt.length;Kt<de;Kt++){let ge=Zt[Kt];je(M,T,ge,ge.viewport)}}else Ut.length>0&&hn(Wt,Ut,T,z),Bt&&ae.render(T),je(M,T,z)}Z!==null&&N===0&&(rt.updateMultisampleRenderTarget(Z),rt.updateRenderTargetMipmap(Z)),j&&w.end(C),T.isScene===!0&&T.onAfterRender(C,T,z),wt.resetDefaultState(),V=-1,Y=null,x.pop(),x.length>0?(E=x[x.length-1],rt.setTextureUnits(E.state.textureUnits),$===!0&&qt.setGlobalState(C.clippingPlanes,E.state.camera)):E=null,A.pop(),A.length>0?M=A[A.length-1]:M=null,P!==null&&P.renderEnd()};function Ue(T,z,tt,j){if(T.visible===!1)return;if(T.layers.test(z.layers)){if(T.isGroup)tt=T.renderOrder;else if(T.isLOD)T.autoUpdate===!0&&T.update(z);else if(T.isLightProbeGrid)E.pushLightProbeGrid(T);else if(T.isLight)E.pushLight(T),T.castShadow&&E.pushShadow(T);else if(T.isSprite){if(!T.frustumCulled||T.intersectsFrustum(B)){j&&Ht.setFromMatrixPosition(T.matrixWorld).applyMatrix4(dt);let Wt=ct.update(T),Ut=T.material;Ut.visible&&M.push(T,Wt,Ut,tt,Ht.z,null,z)}}else if((T.isMesh||T.isLine||T.isPoints)&&(!T.frustumCulled||T.intersectsFrustum(B))){let Wt=ct.update(T),Ut=T.material;if(j&&(T.boundingSphere!==void 0?(T.boundingSphere===null&&T.computeBoundingSphere(),Ht.copy(T.boundingSphere.center)):(Wt.boundingSphere===null&&Wt.computeBoundingSphere(),Ht.copy(Wt.boundingSphere.center)),Ht.applyMatrix4(T.matrixWorld).applyMatrix4(dt)),Array.isArray(Ut)){let Zt=Wt.groups;for(let Kt=0,de=Zt.length;Kt<de;Kt++){let ge=Zt[Kt],$t=Ut[ge.materialIndex];$t&&$t.visible&&M.push(T,Wt,$t,tt,Ht.z,ge,z)}}else Ut.visible&&M.push(T,Wt,Ut,tt,Ht.z,null,z)}}let Ft=T.children;for(let Wt=0,Ut=Ft.length;Wt<Ut;Wt++)Ue(Ft[Wt],z,tt,j)}function je(T,z,tt,j){let{opaque:Q,transmissive:Ft,transparent:Wt}=T;E.setupLightsView(tt),$===!0&&qt.setGlobalState(C.clippingPlanes,tt),j&&b.viewport(J.copy(j)),Q.length>0&&un(Q,z,tt),Ft.length>0&&un(Ft,z,tt),Wt.length>0&&un(Wt,z,tt),b.buffers.depth.setTest(!0),b.buffers.depth.setMask(!0),b.buffers.color.setMask(!0),b.setPolygonOffset(!1)}function hn(T,z,tt,j){if((tt.isScene===!0?tt.overrideMaterial:null)!==null)return;if(E.state.transmissionRenderTarget[j.id]===void 0){let $t=Qt.has("EXT_color_buffer_half_float")||Qt.has("EXT_color_buffer_float");E.state.transmissionRenderTarget[j.id]=new Rn(1,1,{generateMipmaps:!0,type:$t?ri:Pn,minFilter:es,samples:Math.max(4,R.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:xe.workingColorSpace})}let Ft=E.state.transmissionRenderTarget[j.id],Wt=j.viewport||J;Ft.setSize(Wt.z*C.transmissionResolutionScale,Wt.w*C.transmissionResolutionScale);let Ut=C.getRenderTarget(),Zt=C.getActiveCubeFace(),Kt=C.getActiveMipmapLevel();C.setRenderTarget(Ft),C.getClearColor(ie),Lt=C.getClearAlpha(),Lt<1&&C.setClearColor(16777215,.5),C.clear(),Bt&&ae.render(tt);let de=C.toneMapping;C.toneMapping=ii;let ge=j.viewport;if(j.viewport!==void 0&&(j.viewport=void 0),E.setupLightsView(j),$===!0&&qt.setGlobalState(C.clippingPlanes,j),un(T,tt,j),rt.updateMultisampleRenderTarget(Ft),rt.updateRenderTargetMipmap(Ft),Qt.has("WEBGL_multisampled_render_to_texture")===!1){let $t=!1;for(let Te=0,qe=z.length;Te<qe;Te++){let Fe=z[Te],{object:Le,geometry:gn,material:Vt,group:En}=Fe;if(Vt.side===De&&Le.layers.test(j.layers)){let be=Vt.side;Vt.side=Ke,Vt.needsUpdate=!0,rn(Le,tt,j,gn,Vt,En),Vt.side=be,Vt.needsUpdate=!0,$t=!0}}$t===!0&&(rt.updateMultisampleRenderTarget(Ft),rt.updateRenderTargetMipmap(Ft))}C.setRenderTarget(Ut,Zt,Kt),C.setClearColor(ie,Lt),ge!==void 0&&(j.viewport=ge),C.toneMapping=de}function un(T,z,tt){let j=z.isScene===!0?z.overrideMaterial:null;for(let Q=0,Ft=T.length;Q<Ft;Q++){let Wt=T[Q],{object:Ut,geometry:Zt,group:Kt}=Wt,de=Wt.material;de.allowOverride===!0&&j!==null&&(de=j),Ut.layers.test(tt.layers)&&rn(Ut,z,tt,Zt,de,Kt)}}function rn(T,z,tt,j,Q,Ft){P!==null&&Q.isNodeMaterial&&P.setObject(T,Q),T.onBeforeRender(C,z,tt,j,Q,Ft),T.modelViewMatrix.multiplyMatrices(tt.matrixWorldInverse,T.matrixWorld),T.normalMatrix.getNormalMatrix(T.modelViewMatrix),Q.onBeforeRender(C,z,tt,j,T,Ft),Q.transparent===!0&&Q.side===De&&Q.forceSinglePass===!1?(Q.side=Ke,Q.needsUpdate=!0,C.renderBufferDirect(tt,z,j,Q,T,Ft),Q.side=Qi,Q.needsUpdate=!0,C.renderBufferDirect(tt,z,j,Q,T,Ft),Q.side=De):C.renderBufferDirect(tt,z,j,Q,T,Ft),T.onAfterRender(C,z,tt,j,Q,Ft)}function mn(T,z,tt){z.isScene!==!0&&(z=mt);let j=K.get(T),Q=E.state.lights,Ft=E.state.shadowsArray,Wt=Q.state.version,Ut=Ct.getParameters(T,Q.state,Ft,z,tt,E.state.lightProbeGridArray),Zt=Ct.getProgramCacheKey(Ut),Kt=j.programs;j.environment=T.isMeshStandardMaterial||T.isMeshLambertMaterial||T.isMeshPhongMaterial?z.environment:null,j.fog=z.fog;let de=T.isMeshStandardMaterial||T.isMeshLambertMaterial&&!T.envMap||T.isMeshPhongMaterial&&!T.envMap;j.envMap=_t.get(T.envMap||j.environment,de),j.envMapRotation=j.environment!==null&&T.envMap===null?z.environmentRotation:T.envMapRotation,Kt===void 0&&(T.addEventListener("dispose",ee),Kt=new Map,j.programs=Kt);let ge=Kt.get(Zt);if(ge!==void 0){if(j.currentProgram===ge&&j.lightsStateVersion===Wt)return ze(T,Ut),ge}else Ut.uniforms=Ct.getUniforms(T),P!==null&&T.isNodeMaterial&&P.build(T,tt,Ut),T.onBeforeCompile(Ut,C),ge=Ct.acquireProgram(Ut,Zt),Kt.set(Zt,ge),j.uniforms=Ut.uniforms;let $t=j.uniforms;return(!T.isShaderMaterial&&!T.isRawShaderMaterial||T.clipping===!0)&&($t.clippingPlanes=qt.uniform),ze(T,Ut),j.needsLights=Ds(T),j.lightsStateVersion=Wt,j.needsLights&&($t.ambientLightColor.value=Q.state.ambient,$t.lightProbe.value=Q.state.probe,$t.sunLights.value=Q.state.sun,$t.sunLightShadows.value=Q.state.sunShadow,$t.directionalLights.value=Q.state.directional,$t.directionalLightShadows.value=Q.state.directionalShadow,$t.spotLights.value=Q.state.spot,$t.spotLightShadows.value=Q.state.spotShadow,$t.rectAreaLights.value=Q.state.rectArea,$t.ltc_1.value=Q.state.rectAreaLTC1,$t.ltc_2.value=Q.state.rectAreaLTC2,$t.pointLights.value=Q.state.point,$t.pointLightShadows.value=Q.state.pointShadow,$t.hemisphereLights.value=Q.state.hemi,$t.sunShadowMatrix.value=Q.state.sunShadowMatrix,$t.sunShadowCascade.value=Q.state.sunShadowCascade,$t.directionalShadowMatrix.value=Q.state.directionalShadowMatrix,$t.spotLightMatrix.value=Q.state.spotLightMatrix,$t.spotLightMap.value=Q.state.spotLightMap,$t.pointShadowMatrix.value=Q.state.pointShadowMatrix),j.lightProbeGrid=E.state.lightProbeGridArray.length>0,j.currentProgram=ge,j.uniformsList=null,ge}function we(T){if(T.uniformsList===null){let z=T.currentProgram.getUniforms();T.uniformsList=br.seqWithValue(z.seq,T.uniforms)}return T.uniformsList}function ze(T,z){let tt=K.get(T);tt.outputColorSpace=z.outputColorSpace,tt.batching=z.batching,tt.batchingColor=z.batchingColor,tt.instancing=z.instancing,tt.instancingColor=z.instancingColor,tt.instancingMorph=z.instancingMorph,tt.skinning=z.skinning,tt.morphTargets=z.morphTargets,tt.morphNormals=z.morphNormals,tt.morphColors=z.morphColors,tt.morphTargetsCount=z.morphTargetsCount,tt.numClippingPlanes=z.numClippingPlanes,tt.numIntersection=z.numClipIntersection,tt.vertexAlphas=z.vertexAlphas,tt.vertexTangents=z.vertexTangents,tt.toneMapping=z.toneMapping}function Is(T,z){if(T.length===0)return null;if(T.length===1)return T[0].texture!==null?T[0]:null;v.setFromMatrixPosition(z.matrixWorld);for(let tt=0,j=T.length;tt<j;tt++){let Q=T[tt];if(Q.texture!==null&&Q.boundingBox.containsPoint(v))return Q}return null}function Ls(T,z,tt,j,Q){z.isScene!==!0&&(z=mt),rt.resetTextureUnits();let Ft=z.fog,Wt=j.isMeshStandardMaterial||j.isMeshLambertMaterial||j.isMeshPhongMaterial?z.environment:null,Ut=Z===null?C.outputColorSpace:Z.isXRRenderTarget===!0?Z.texture.colorSpace:xe.workingColorSpace,Zt=j.isMeshStandardMaterial||j.isMeshLambertMaterial&&!j.envMap||j.isMeshPhongMaterial&&!j.envMap,Kt=_t.get(j.envMap||Wt,Zt),de=j.vertexColors===!0&&!!tt.attributes.color&&tt.attributes.color.itemSize===4,ge=!!tt.attributes.tangent&&(!!j.normalMap||j.anisotropy>0),$t=!!tt.morphAttributes.position,Te=!!tt.morphAttributes.normal,qe=!!tt.morphAttributes.color,Fe=ii;j.toneMapped&&(Z===null||Z.isXRRenderTarget===!0)&&(Fe=C.toneMapping);let Le=tt.morphAttributes.position||tt.morphAttributes.normal||tt.morphAttributes.color,gn=Le!==void 0?Le.length:0,Vt=K.get(j),En=E.state.lights;if($===!0&&(it===!0||T!==Y)){let Ne=T===Y&&j.id===V;qt.setState(j,T,Ne)}let be=!1;j.version===Vt.__version?(Vt.needsLights&&Vt.lightsStateVersion!==En.state.version||Vt.outputColorSpace!==Ut||Q.isBatchedMesh&&Vt.batching===!1||!Q.isBatchedMesh&&Vt.batching===!0||Q.isBatchedMesh&&Vt.batchingColor===!0&&Q._colorsTexture===null||Q.isBatchedMesh&&Vt.batchingColor===!1&&Q._colorsTexture!==null||Q.isInstancedMesh&&Vt.instancing===!1||!Q.isInstancedMesh&&Vt.instancing===!0||Q.isSkinnedMesh&&Vt.skinning===!1||!Q.isSkinnedMesh&&Vt.skinning===!0||Q.isInstancedMesh&&Vt.instancingColor===!0&&Q.instanceColor===null||Q.isInstancedMesh&&Vt.instancingColor===!1&&Q.instanceColor!==null||Q.isInstancedMesh&&Vt.instancingMorph===!0&&Q.morphTexture===null||Q.isInstancedMesh&&Vt.instancingMorph===!1&&Q.morphTexture!==null||Vt.envMap!==Kt||j.fog===!0&&Vt.fog!==Ft||Vt.numClippingPlanes!==void 0&&(Vt.numClippingPlanes!==qt.numPlanes||Vt.numIntersection!==qt.numIntersection)||Vt.vertexAlphas!==de||Vt.vertexTangents!==ge||Vt.morphTargets!==$t||Vt.morphNormals!==Te||Vt.morphColors!==qe||Vt.toneMapping!==Fe||Vt.morphTargetsCount!==gn||!!Vt.lightProbeGrid!=E.state.lightProbeGridArray.length>0)&&(be=!0):(be=!0,Vt.__version=j.version);let Wn=Vt.currentProgram;be===!0&&(Wn=mn(j,z,Q),P&&j.isNodeMaterial&&P.onUpdateProgram(j,Wn,Vt));let ai=!1,Di=!1,Ns=!1,Ce=Wn.getUniforms(),Ye=Vt.uniforms;if(b.useProgram(Wn.program)&&(ai=!0,Di=!0,Ns=!0),j.id!==V&&(V=j.id,Di=!0),Vt.needsLights){let Ne=Is(E.state.lightProbeGridArray,Q);Vt.lightProbeGrid!==Ne&&(Vt.lightProbeGrid=Ne,Di=!0)}if(ai||Y!==T){b.buffers.depth.getReversed()&&T.reversedDepth!==!0&&(T._reversedDepth=!0,T.updateProjectionMatrix()),Ce.setValue(U,"projectionMatrix",T.projectionMatrix),Ce.setValue(U,"viewMatrix",T.matrixWorldInverse);let Ui=Ce.map.cameraPosition;Ui!==void 0&&Ui.setValue(U,xt.setFromMatrixPosition(T.matrixWorld)),R.logarithmicDepthBuffer&&Ce.setValue(U,"logDepthBufFC",2/(Math.log(T.far+1)/Math.LN2)),(j.isMeshPhongMaterial||j.isMeshToonMaterial||j.isMeshLambertMaterial||j.isMeshBasicMaterial||j.isMeshStandardMaterial||j.isShaderMaterial)&&Ce.setValue(U,"isOrthographic",T.isOrthographicCamera===!0),Y!==T&&(Y=T,Di=!0,Ns=!0)}if(Vt.needsLights&&(En.state.sunShadowMap.length>0&&Ce.setValue(U,"sunShadowMap",En.state.sunShadowMap,rt),En.state.directionalShadowMap.length>0&&Ce.setValue(U,"directionalShadowMap",En.state.directionalShadowMap,rt),En.state.spotShadowMap.length>0&&Ce.setValue(U,"spotShadowMap",En.state.spotShadowMap,rt),En.state.pointShadowMap.length>0&&Ce.setValue(U,"pointShadowMap",En.state.pointShadowMap,rt)),Q.isSkinnedMesh){Ce.setOptional(U,Q,"bindMatrix"),Ce.setOptional(U,Q,"bindMatrixInverse");let Ne=Q.skeleton;Ne&&(Ne.boneTexture===null&&Ne.computeBoneTexture(),Ce.setValue(U,"boneTexture",Ne.boneTexture,rt))}Q.isBatchedMesh&&(Ce.setOptional(U,Q,"batchingTexture"),Ce.setValue(U,"batchingTexture",Q._matricesTexture,rt),Ce.setOptional(U,Q,"batchingIdTexture"),Ce.setValue(U,"batchingIdTexture",Q._indirectTexture,rt),Ce.setOptional(U,Q,"batchingColorTexture"),Q._colorsTexture!==null&&Ce.setValue(U,"batchingColorTexture",Q._colorsTexture,rt));let Ni=tt.morphAttributes;if((Ni.position!==void 0||Ni.normal!==void 0||Ni.color!==void 0)&&H.update(Q,tt,Wn),(Di||Vt.receiveShadow!==Q.receiveShadow)&&(Vt.receiveShadow=Q.receiveShadow,Ce.setValue(U,"receiveShadow",Q.receiveShadow)),(j.isMeshStandardMaterial||j.isMeshLambertMaterial||j.isMeshPhongMaterial)&&j.envMap===null&&z.environment!==null&&(Ye.envMapIntensity.value=z.environmentIntensity),Ye.dfgLUT!==void 0&&(Ye.dfgLUT.value=ey()),Di){if(Ce.setValue(U,"toneMappingExposure",C.toneMappingExposure),Vt.needsLights&&nu(Ye,Ns),Ft&&j.fog===!0&&Yt.refreshFogUniforms(Ye,Ft),Yt.refreshMaterialUniforms(Ye,j,W,et,E.state.transmissionRenderTarget[T.id]),Vt.needsLights&&Vt.lightProbeGrid){let Ne=Vt.lightProbeGrid;Ye.probesSH.value=Ne.texture,Ye.probesMin.value.copy(Ne.boundingBox.min),Ye.probesMax.value.copy(Ne.boundingBox.max),Ye.probesResolution.value.copy(Ne.resolution)}br.upload(U,we(Vt),Ye,rt)}if(j.isShaderMaterial&&j.uniformsNeedUpdate===!0&&(br.upload(U,we(Vt),Ye,rt),j.uniformsNeedUpdate=!1),j.isSpriteMaterial&&Ce.setValue(U,"center",Q.center),Ce.setValue(U,"modelViewMatrix",Q.modelViewMatrix),Ce.setValue(U,"normalMatrix",Q.normalMatrix),Ce.setValue(U,"modelMatrix",Q.matrixWorld),j.uniformsGroups!==void 0){let Ne=j.uniformsGroups;for(let Ui=0,Us=Ne.length;Ui<Us;Ui++){let iu=Ne[Ui];ft.update(iu,Wn),ft.bind(iu,Wn)}}return Wn}function nu(T,z){T.ambientLightColor.needsUpdate=z,T.lightProbe.needsUpdate=z,T.sunLights.needsUpdate=z,T.sunLightShadows.needsUpdate=z,T.directionalLights.needsUpdate=z,T.directionalLightShadows.needsUpdate=z,T.pointLights.needsUpdate=z,T.pointLightShadows.needsUpdate=z,T.spotLights.needsUpdate=z,T.spotLightShadows.needsUpdate=z,T.rectAreaLights.needsUpdate=z,T.hemisphereLights.needsUpdate=z}function Ds(T){return T.isMeshLambertMaterial||T.isMeshToonMaterial||T.isMeshPhongMaterial||T.isMeshStandardMaterial||T.isShadowMaterial||T.isShaderMaterial&&T.lights===!0}this.getActiveCubeFace=function(){return q},this.getActiveMipmapLevel=function(){return N},this.getRenderTarget=function(){return Z},this.setRenderTargetTextures=function(T,z,tt){let j=K.get(T);j.__autoAllocateDepthBuffer=T.resolveDepthBuffer===!1,j.__autoAllocateDepthBuffer===!1&&(j.__useRenderToTexture=!1),K.get(T.texture).__webglTexture=z,K.get(T.depthTexture).__webglTexture=j.__autoAllocateDepthBuffer?void 0:tt,j.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(T,z){let tt=K.get(T);tt.__webglFramebuffer=z,tt.__useDefaultFramebuffer=z===void 0},this.setRenderTarget=function(T,z=0,tt=0){Z=T,q=z,N=tt;let j=null,Q=!1,Ft=!1;if(T){let Ut=K.get(T);if(Ut.__useDefaultFramebuffer!==void 0){b.bindFramebuffer(U.FRAMEBUFFER,Ut.__webglFramebuffer),J.copy(T.viewport),Rt.copy(T.scissor),bt=T.scissorTest,b.viewport(J),b.scissor(Rt),b.setScissorTest(bt),V=-1;return}else if(Ut.__webglFramebuffer===void 0)rt.setupRenderTarget(T);else if(Ut.__hasExternalTextures)rt.rebindTextures(T,K.get(T.texture).__webglTexture,K.get(T.depthTexture).__webglTexture);else if(T.depthBuffer){let de=T.depthTexture;if(Ut.__boundDepthTexture!==de){if(de!==null&&K.has(de)&&(T.width!==de.image.width||T.height!==de.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");rt.setupDepthRenderbuffer(T)}}let Zt=T.texture;(Zt.isData3DTexture||Zt.isDataArrayTexture||Zt.isCompressedArrayTexture)&&(Ft=!0);let Kt=K.get(T).__webglFramebuffer;T.isWebGLCubeRenderTarget?(Array.isArray(Kt[z])?j=Kt[z][tt]:j=Kt[z],Q=!0):T.samples>0&&rt.useMultisampledRTT(T)===!1?j=K.get(T).__webglMultisampledFramebuffer:Array.isArray(Kt)?j=Kt[tt]:j=Kt,J.copy(T.viewport),Rt.copy(T.scissor),bt=T.scissorTest}else J.copy(ut).multiplyScalar(W).floor(),Rt.copy(ot).multiplyScalar(W).floor(),bt=It;if(tt!==0&&(j=O),b.bindFramebuffer(U.FRAMEBUFFER,j)&&b.drawBuffers(T,j),b.viewport(J),b.scissor(Rt),b.setScissorTest(bt),Q){let Ut=K.get(T.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_CUBE_MAP_POSITIVE_X+z,Ut.__webglTexture,tt)}else if(Ft){let Ut=z;for(let Zt=0;Zt<T.textures.length;Zt++){let Kt=K.get(T.textures[Zt]);U.framebufferTextureLayer(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0+Zt,Kt.__webglTexture,tt,Ut)}}else if(T!==null&&tt!==0){let Ut=K.get(T.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,Ut.__webglTexture,tt)}V=-1};function ls(T){let z=K.get(T);return(z.__readFormat!==T.format||z.__readType!==T.type)&&(z.__readFormat=T.format,z.__readType=T.type,z.__formatReadable=R.textureFormatReadable(T.format),z.__typeReadable=R.textureTypeReadable(T.type)),z}this.readRenderTargetPixels=function(T,z,tt,j,Q,Ft,Wt,Ut=0){if(!(T&&T.isWebGLRenderTarget)){re("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Zt=K.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&Wt!==void 0&&(Zt=Zt[Wt]),Zt){b.bindFramebuffer(U.FRAMEBUFFER,Zt);try{let Kt=T.textures[Ut],de=Kt.format,ge=Kt.type;T.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+Ut);let $t=ls(Kt);if($t.__formatReadable===!1){re("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if($t.__typeReadable===!1){re("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}z>=0&&z<=T.width-j&&tt>=0&&tt<=T.height-Q&&U.readPixels(z,tt,j,Q,At.convert(de),At.convert(ge),Ft)}finally{let Kt=Z!==null?K.get(Z).__webglFramebuffer:null;b.bindFramebuffer(U.FRAMEBUFFER,Kt)}}},this.readRenderTargetPixelsAsync=async function(T,z,tt,j,Q,Ft,Wt,Ut=0){if(!(T&&T.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Zt=K.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&Wt!==void 0&&(Zt=Zt[Wt]),Zt)if(z>=0&&z<=T.width-j&&tt>=0&&tt<=T.height-Q){b.bindFramebuffer(U.FRAMEBUFFER,Zt);let Kt=T.textures[Ut],de=Kt.format,ge=Kt.type;T.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+Ut);let $t=ls(Kt);if($t.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if($t.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let Te=U.createBuffer();U.bindBuffer(U.PIXEL_PACK_BUFFER,Te),U.bufferData(U.PIXEL_PACK_BUFFER,Ft.byteLength,U.STREAM_READ),U.readPixels(z,tt,j,Q,At.convert(de),At.convert(ge),0),U.bindBuffer(U.PIXEL_PACK_BUFFER,null);let qe=Z!==null?K.get(Z).__webglFramebuffer:null;b.bindFramebuffer(U.FRAMEBUFFER,qe);let Fe=U.fenceSync(U.SYNC_GPU_COMMANDS_COMPLETE,0);return U.flush(),await _d(U,Fe,4),U.bindBuffer(U.PIXEL_PACK_BUFFER,Te),U.getBufferSubData(U.PIXEL_PACK_BUFFER,0,Ft),U.bindBuffer(U.PIXEL_PACK_BUFFER,null),U.deleteBuffer(Te),U.deleteSync(Fe),Ft}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(T,z=null,tt=0){let j=Math.pow(2,-tt),Q=Math.floor(T.image.width*j),Ft=Math.floor(T.image.height*j),Wt=z!==null?z.x:0,Ut=z!==null?z.y:0;rt.setTexture2D(T,0),U.copyTexSubImage2D(U.TEXTURE_2D,tt,0,0,Wt,Ut,Q,Ft),b.unbindTexture()},this.copyTextureToTexture=function(T,z,tt=null,j=null,Q=0,Ft=0){let Wt,Ut,Zt,Kt,de,ge,$t,Te,qe,Fe=T.isCompressedTexture?T.mipmaps[Ft]:T.image;if(tt!==null)Wt=tt.max.x-tt.min.x,Ut=tt.max.y-tt.min.y,Zt=tt.isBox3?tt.max.z-tt.min.z:1,Kt=tt.min.x,de=tt.min.y,ge=tt.isBox3?tt.min.z:0;else{let Ye=Math.pow(2,-Q);Wt=Math.floor(Fe.width*Ye),Ut=Math.floor(Fe.height*Ye),T.isDataArrayTexture?Zt=Fe.depth:T.isData3DTexture?Zt=Math.floor(Fe.depth*Ye):Zt=1,Kt=0,de=0,ge=0}j!==null?($t=j.x,Te=j.y,qe=j.z):($t=0,Te=0,qe=0);let Le=At.convert(z.format),gn=At.convert(z.type),Vt;z.isData3DTexture?(rt.setTexture3D(z,0),Vt=U.TEXTURE_3D):z.isDataArrayTexture||z.isCompressedArrayTexture?(rt.setTexture2DArray(z,0),Vt=U.TEXTURE_2D_ARRAY):(rt.setTexture2D(z,0),Vt=U.TEXTURE_2D),b.activeTexture(U.TEXTURE0),b.pixelStorei(U.UNPACK_FLIP_Y_WEBGL,z.flipY),b.pixelStorei(U.UNPACK_PREMULTIPLY_ALPHA_WEBGL,z.premultiplyAlpha),b.pixelStorei(U.UNPACK_ALIGNMENT,z.unpackAlignment);let En=b.getParameter(U.UNPACK_ROW_LENGTH),be=b.getParameter(U.UNPACK_IMAGE_HEIGHT),Wn=b.getParameter(U.UNPACK_SKIP_PIXELS),ai=b.getParameter(U.UNPACK_SKIP_ROWS),Di=b.getParameter(U.UNPACK_SKIP_IMAGES);b.pixelStorei(U.UNPACK_ROW_LENGTH,Fe.width),b.pixelStorei(U.UNPACK_IMAGE_HEIGHT,Fe.height),b.pixelStorei(U.UNPACK_SKIP_PIXELS,Kt),b.pixelStorei(U.UNPACK_SKIP_ROWS,de),b.pixelStorei(U.UNPACK_SKIP_IMAGES,ge);let Ns=T.isDataArrayTexture||T.isData3DTexture,Ce=z.isDataArrayTexture||z.isData3DTexture;if(T.isDepthTexture){let Ye=K.get(T),Ni=K.get(z),Ne=K.get(Ye.__renderTarget),Ui=K.get(Ni.__renderTarget);b.bindFramebuffer(U.READ_FRAMEBUFFER,Ne.__webglFramebuffer),b.bindFramebuffer(U.DRAW_FRAMEBUFFER,Ui.__webglFramebuffer);for(let Us=0;Us<Zt;Us++)Ns&&(U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,K.get(T).__webglTexture,Q,ge+Us),U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,K.get(z).__webglTexture,Ft,qe+Us)),U.blitFramebuffer(Kt,de,Wt,Ut,$t,Te,Wt,Ut,U.DEPTH_BUFFER_BIT,U.NEAREST);b.bindFramebuffer(U.READ_FRAMEBUFFER,null),b.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else if(Q!==0||T.isRenderTargetTexture||K.has(T)){let Ye=K.get(T),Ni=K.get(z);b.bindFramebuffer(U.READ_FRAMEBUFFER,F),b.bindFramebuffer(U.DRAW_FRAMEBUFFER,X);for(let Ne=0;Ne<Zt;Ne++)Ns?U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,Ye.__webglTexture,Q,ge+Ne):U.framebufferTexture2D(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,Ye.__webglTexture,Q),Ce?U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,Ni.__webglTexture,Ft,qe+Ne):U.framebufferTexture2D(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,Ni.__webglTexture,Ft),Q!==0?U.blitFramebuffer(Kt,de,Wt,Ut,$t,Te,Wt,Ut,U.COLOR_BUFFER_BIT,U.NEAREST):Ce?U.copyTexSubImage3D(Vt,Ft,$t,Te,qe+Ne,Kt,de,Wt,Ut):U.copyTexSubImage2D(Vt,Ft,$t,Te,Kt,de,Wt,Ut);b.bindFramebuffer(U.READ_FRAMEBUFFER,null),b.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else Ce?T.isDataTexture||T.isData3DTexture?U.texSubImage3D(Vt,Ft,$t,Te,qe,Wt,Ut,Zt,Le,gn,Fe.data):z.isCompressedArrayTexture?U.compressedTexSubImage3D(Vt,Ft,$t,Te,qe,Wt,Ut,Zt,Le,Fe.data):U.texSubImage3D(Vt,Ft,$t,Te,qe,Wt,Ut,Zt,Le,gn,Fe):T.isDataTexture?U.texSubImage2D(U.TEXTURE_2D,Ft,$t,Te,Wt,Ut,Le,gn,Fe.data):T.isCompressedTexture?U.compressedTexSubImage2D(U.TEXTURE_2D,Ft,$t,Te,Fe.width,Fe.height,Le,Fe.data):U.texSubImage2D(U.TEXTURE_2D,Ft,$t,Te,Wt,Ut,Le,gn,Fe);b.pixelStorei(U.UNPACK_ROW_LENGTH,En),b.pixelStorei(U.UNPACK_IMAGE_HEIGHT,be),b.pixelStorei(U.UNPACK_SKIP_PIXELS,Wn),b.pixelStorei(U.UNPACK_SKIP_ROWS,ai),b.pixelStorei(U.UNPACK_SKIP_IMAGES,Di),Ft===0&&z.generateMipmaps&&U.generateMipmap(Vt),b.unbindTexture()},this.initRenderTarget=function(T){K.get(T).__webglFramebuffer===void 0&&rt.setupRenderTarget(T)},this.initTexture=function(T){T.isCubeTexture?rt.setTextureCube(T,0):T.isData3DTexture?rt.setTexture3D(T,0):T.isDataArrayTexture||T.isCompressedArrayTexture?rt.setTexture2DArray(T,0):rt.setTexture2D(T,0),b.unbindTexture()},this.resetState=function(){q=0,N=0,Z=null,b.reset(),wt.reset()},typeof __THREE_DEVTOOLS__!="undefined"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return ti}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=xe._getDrawingBufferColorSpace(t),e.unpackColorSpace=xe._getUnpackColorSpace()}};var Zc=class extends Vi{constructor(){super(),this.name="RoomEnvironment",this.position.y=-3.5;let t=new fn;t.deleteAttribute("uv");let e=new Se({side:Ke}),n=new Se,s=new vo(16777215,900,28,2);s.position.set(.418,16.199,.3),this.add(s);let r=new Dt(t,e);r.position.set(-.757,13.219,.717),r.scale.set(31.713,28.305,28.591),this.add(r);let o=new eo(t,n,6),a=new Je;a.position.set(-10.906,2.009,1.846),a.rotation.set(0,-.195,0),a.scale.set(2.328,7.905,4.651),a.updateMatrix(),o.setMatrixAt(0,a.matrix),a.position.set(-5.607,-.754,-.758),a.rotation.set(0,.994,0),a.scale.set(1.97,1.534,3.955),a.updateMatrix(),o.setMatrixAt(1,a.matrix),a.position.set(6.167,.857,7.803),a.rotation.set(0,.561,0),a.scale.set(3.927,6.285,3.687),a.updateMatrix(),o.setMatrixAt(2,a.matrix),a.position.set(-2.017,.018,6.124),a.rotation.set(0,.333,0),a.scale.set(2.002,4.566,2.064),a.updateMatrix(),o.setMatrixAt(3,a.matrix),a.position.set(2.291,-.756,-2.621),a.rotation.set(0,-.286,0),a.scale.set(1.546,1.552,1.496),a.updateMatrix(),o.setMatrixAt(4,a.matrix),a.position.set(-2.193,-.369,-5.547),a.rotation.set(0,.516,0),a.scale.set(3.875,3.487,2.986),a.updateMatrix(),o.setMatrixAt(5,a.matrix),this.add(o);let c=new Dt(t,Er(50));c.position.set(-16.116,14.37,8.208),c.scale.set(.1,2.428,2.739),this.add(c);let l=new Dt(t,Er(50));l.position.set(-16.109,18.021,-8.207),l.scale.set(.1,2.425,2.751),this.add(l);let h=new Dt(t,Er(17));h.position.set(14.904,12.198,-1.832),h.scale.set(.15,4.265,6.331),this.add(h);let u=new Dt(t,Er(43));u.position.set(-.462,8.89,14.52),u.scale.set(4.38,5.441,.088),this.add(u);let d=new Dt(t,Er(20));d.position.set(3.235,11.486,-12.541),d.scale.set(2.5,2,.1),this.add(d);let f=new Dt(t,Er(100));f.position.set(0,20,0),f.scale.set(1,.1,1),this.add(f)}dispose(){let t=new Set;this.traverse(e=>{e.isMesh&&(t.add(e.geometry),t.add(e.material))});for(let e of t)e.dispose()}};function Er(i){return new mo({color:0,emissive:16777215,emissiveIntensity:i})}var Uo=new D;function qn(i,t,e,n,s,r){let o=2*Math.PI*s/4,a=Math.max(r-2*s,0),c=Math.PI/4;Uo.copy(t),Uo[n]=0,Uo.normalize();let l=.5*o/(o+a),h=1-Uo.angleTo(i)/c;return Math.sign(Uo[e])===1?h*l:a/(o+a)+l+l*(1-h)}var $c=class i extends fn{constructor(t=1,e=1,n=1,s=2,r=.1){let o=s*2+1;if(r=Math.min(t/2,e/2,n/2,r),super(1,1,1,o,o,o),this.type="RoundedBoxGeometry",this.parameters={width:t,height:e,depth:n,segments:s,radius:r},o===1)return;let a=this.toNonIndexed();this.index=null,this.attributes.position=a.attributes.position,this.attributes.normal=a.attributes.normal,this.attributes.uv=a.attributes.uv;let c=new D,l=new D,h=new D(t,e,n).divideScalar(2).subScalar(r),u=this.attributes.position.array,d=this.attributes.normal.array,f=this.attributes.uv.array,_=u.length/6,g=new D,m=.5/o;for(let p=0,y=0;p<u.length;p+=3,y+=2)switch(c.fromArray(u,p),l.copy(c),l.x-=Math.sign(l.x)*m,l.y-=Math.sign(l.y)*m,l.z-=Math.sign(l.z)*m,l.normalize(),u[p+0]=h.x*Math.sign(c.x)+l.x*r,u[p+1]=h.y*Math.sign(c.y)+l.y*r,u[p+2]=h.z*Math.sign(c.z)+l.z*r,d[p+0]=l.x,d[p+1]=l.y,d[p+2]=l.z,Math.floor(p/_)){case 0:g.set(1,0,0),f[y+0]=qn(g,l,"z","y",r,n),f[y+1]=1-qn(g,l,"y","z",r,e);break;case 1:g.set(-1,0,0),f[y+0]=1-qn(g,l,"z","y",r,n),f[y+1]=1-qn(g,l,"y","z",r,e);break;case 2:g.set(0,1,0),f[y+0]=1-qn(g,l,"x","z",r,t),f[y+1]=qn(g,l,"z","x",r,n);break;case 3:g.set(0,-1,0),f[y+0]=1-qn(g,l,"x","z",r,t),f[y+1]=1-qn(g,l,"z","x",r,n);break;case 4:g.set(0,0,1),f[y+0]=1-qn(g,l,"x","y",r,t),f[y+1]=1-qn(g,l,"y","x",r,e);break;case 5:g.set(0,0,-1),f[y+0]=qn(g,l,"x","y",r,t),f[y+1]=1-qn(g,l,"y","x",r,e);break}}static fromJSON(t){return new i(t.width,t.height,t.depth,t.segments,t.radius)}};var Tr=typeof document!="undefined"&&typeof document.createElement=="function",me=Math.PI,rs=me*2,gt=me/2;var Hn=(i,t,e)=>Math.max(t,Math.min(e,i)),os=(i,t,e)=>i+(t-i)*e;function gi(i,t,e,{repeat:n=null,srgb:s=!0}={}){if(!Tr)return null;let r=document.createElement("canvas");r.width=i,r.height=t;let o=r.getContext("2d");e(o,i,t);let a=new io(r);return s&&(a.colorSpace=$e),a.wrapS=a.wrapT=Qs,n&&a.repeat.set(n[0],n[1]),a.needsUpdate=!0,a}function ef(i,t,e,n,s=.06,r=1){for(let o=0;o<n;o++){let a=Math.random()*255;i.fillStyle=`rgba(${a},${a},${a},${s})`,i.fillRect(Math.random()*t,Math.random()*e,r,r)}}function ny(i,t,e){i.fillStyle="#808080",i.fillRect(0,0,t,e),i.fillStyle="#c8c8c8";for(let n=-20;n<e+20;n+=22)for(let s=0;s<t;s+=20){let r=Math.floor(n/22)%2*10;i.save(),i.translate(s+r,n),i.rotate(.5),i.fillRect(-9,-4,18,8),i.restore()}i.fillStyle="#5a5a5a";for(let n=0;n<t;n+=22)i.fillRect(n,0,3,e)}function iy(i,t,e){i.fillStyle="#d8d8d8",i.fillRect(0,0,t,e),i.strokeStyle="rgba(255,255,255,0.35)",i.lineWidth=2;for(let n=0;n<t;n+=6)i.beginPath(),i.moveTo(n,0),i.lineTo(n,e),i.stroke();for(let n=0;n<e;n+=6)i.beginPath(),i.moveTo(0,n),i.lineTo(t,n),i.stroke();i.strokeStyle="rgba(0,0,0,0.18)",i.lineWidth=3;for(let n=0;n<t;n+=64)i.beginPath(),i.moveTo(n,0),i.lineTo(n,e),i.stroke();ef(i,t,e,2600,.05,2)}function sy(i,t,e){i.fillStyle="#a87542",i.fillRect(0,0,t,e);for(let n=0;n<26;n++){let s=n/26*e;i.fillStyle=n%2?"rgba(90,52,24,0.25)":"rgba(220,170,110,0.16)",i.fillRect(0,s,t,e/26-2),i.fillStyle="rgba(60,34,14,0.5)",i.fillRect(0,s+e/26-2,t,2)}for(let n=0;n<90;n++){i.strokeStyle=`rgba(70,40,18,${.05+Math.random()*.12})`,i.beginPath();let s=Math.random()*e;i.moveTo(0,s),i.bezierCurveTo(t*.3,s+6,t*.7,s-8,t,s+3),i.stroke()}}function ry(i,t,e){i.fillStyle="#b9bcc0",i.fillRect(0,0,t,e);for(let n=0;n<400;n++){i.strokeStyle=`rgba(255,255,255,${.02+Math.random()*.07})`,i.beginPath();let s=Math.random()*e;i.moveTo(0,s),i.lineTo(t,s+(Math.random()-.5)*3),i.stroke()}ef(i,t,e,1500,.03,1)}function Ar(i,t={}){let{bg:e="#12161b",fg:n="#f2ecdf",accent:s="#e8b45a",width:r=512,height:o=128,font:a="bold 54px Arial, sans-serif",sub:c="",subFont:l="bold 22px Arial, sans-serif",border:h=!0}=t;return gi(r,o,(u,d,f)=>{u.fillStyle=e,u.fillRect(0,0,d,f),h&&(u.strokeStyle=s,u.lineWidth=6,u.strokeRect(6,6,d-12,f-12)),u.fillStyle=s,u.fillRect(20,20,10,f-40),u.fillStyle=n,u.font=a,u.textBaseline="middle",u.fillText(i,48,c?f*.42:f*.52),c&&(u.fillStyle="rgba(242,236,223,0.7)",u.font=l,u.fillText(c,50,f*.72))})}function As(i){return gi(256,64,(t,e,n)=>{t.fillStyle="#f2f2ea",t.fillRect(0,0,e,n),t.fillStyle="#1b2634",t.fillRect(0,0,34,n),t.fillStyle="#f2f2ea",t.font="bold 13px Arial",t.fillText("RUS",4,n-12),t.fillStyle="#111",t.font="bold 40px Arial",t.textAlign="center",t.fillText(i,144,46),t.strokeStyle="#777",t.lineWidth=3,t.strokeRect(1,1,e-2,n-2)})}function nf(i=null){var o,a,c;let t=Math.min(8,(c=(a=(o=i==null?void 0:i.capabilities)==null?void 0:o.getMaxAnisotropy)==null?void 0:a.call(o))!=null?c:4),e={tread:gi(256,256,ny,{srgb:!1}),tarp:gi(512,512,iy,{repeat:[3,2]}),wood:gi(512,512,sy,{repeat:[1,4]}),metal:gi(512,512,ry,{repeat:[2,1]})};for(let l of Object.values(e))l&&(l.anisotropy=t);let n=l=>new Se(l),s=l=>new Ai(l);return{paint(l,h={}){var u,d,f,_,g;return s({color:l,metalness:(u=h.metalness)!=null?u:.45,roughness:(d=h.roughness)!=null?d:.32,clearcoat:(f=h.clearcoat)!=null?f:1,clearcoatRoughness:(_=h.clearcoatRoughness)!=null?_:.08,envMapIntensity:(g=h.envMapIntensity)!=null?g:1.05})},accent(l,h={}){var u,d;return s({color:l,metalness:(u=h.metalness)!=null?u:.3,roughness:(d=h.roughness)!=null?d:.34,clearcoat:.8,clearcoatRoughness:.12})},get chrome(){return n({color:15856629,metalness:1,roughness:.08,envMapIntensity:1.7})},get chromeDark(){return n({color:12041410,metalness:1,roughness:.22,envMapIntensity:1.3})},get steel(){return n({color:10133928,metalness:.92,roughness:.34,map:e.metal,envMapIntensity:1.1})},get darkSteel(){return n({color:2962490,metalness:.85,roughness:.45,envMapIntensity:.9})},get frame(){return n({color:1974823,metalness:.7,roughness:.6})},get plastic(){return n({color:1316892,metalness:.15,roughness:.72})},get plasticGray(){return n({color:3949901,metalness:.1,roughness:.82})},get plasticLight(){return n({color:12106940,metalness:.1,roughness:.6})},get rubber(){return n({color:1316376,roughness:.96,metalness:0,bumpMap:e.tread,bumpScale:.035})},get rubberTrim(){return n({color:2106151,roughness:.9,metalness:.05})},get glass(){return s({color:12574958,metalness:.1,roughness:.06,transparent:!0,opacity:.26,envMapIntensity:1.6,depthWrite:!1,side:De})},get glassDark(){return s({color:2767944,metalness:.2,roughness:.1,transparent:!0,opacity:.55,envMapIntensity:1.3,depthWrite:!1})},get mirror(){return n({color:14674158,metalness:1,roughness:.03,envMapIntensity:2})},get headlight(){return n({color:16645360,emissive:16774095,emissiveIntensity:.35,roughness:.12,metalness:.25})},get taillight(){return n({color:9313047,emissive:16722458,emissiveIntensity:.5,roughness:.25})},get amber(){return n({color:11822618,emissive:16751406,emissiveIntensity:.6,roughness:.3})},get reverseLight(){return n({color:14212306,emissive:14286832,emissiveIntensity:.15,roughness:.3})},get interiorDark(){return n({color:2237995,roughness:.82,metalness:.08})},get interiorMid(){return n({color:3356991,roughness:.75,metalness:.1})},get leather(){return n({color:2303530,roughness:.62,metalness:.05})},get leatherBeige(){return n({color:10982521,roughness:.68,metalness:.04})},get fabric(){return n({color:3883593,roughness:.95,metalness:.02})},get dashScreen(){return n({color:659220,emissive:1919843,emissiveIntensity:.55,roughness:.25})},get tarp(){return n({color:14672870,map:e.tarp,roughness:.92,metalness:.02})},get tarpDark(){return n({color:4015178,map:e.tarp,roughness:.94,metalness:.02})},get wood(){return n({color:12159570,map:e.wood,roughness:.86,metalness:.02})},get tank(){return n({color:14212834,metalness:.95,roughness:.18,envMapIntensity:1.5})},get tankWhite(){return n({color:15330798,metalness:.35,roughness:.3,envMapIntensity:1.1})},get orange(){return n({color:14182687,metalness:.25,roughness:.55})},get hazard(){return n({color:14715422,metalness:.2,roughness:.6})},get rope(){return n({color:7169109,roughness:.95})},get containerBlue(){return n({color:2579320,metalness:.55,roughness:.6})},get containerRed(){return n({color:9189930,metalness:.5,roughness:.62})},get containerGreen(){return n({color:4023623,metalness:.5,roughness:.6})},get concrete(){return n({color:10263700,roughness:.95})}}}function ke(i=null,t=""){let e=new dn;return e.name=t,i&&i.add(e),e}function Rr(i,t,e,n=0,s=0,r=0){let o=new Dt(t,e);return o.position.set(n,s,r),i==null||i.add(o),o}function I(i,t,e,n,s,r=0,o=0,a=0){return Rr(i,new fn(t,e,n),s,r,o,a)}function k(i,t,e,n,s,r=0,o=0,a=0,c=.05,l=2){let h=Math.min(c,Math.min(t,e,n)/2-5e-4);return Rr(i,new $c(t,e,n,l,Math.max(.001,h)),s,r,o,a)}function zt(i,t,e,n,s,r=0,o=0,a=0,c=20){return Rr(i,new Ie(t,e,n,c),s,r,o,a)}function Rs(i,t,e,n=0,s=0,r=0,o=16){return Rr(i,new ni(t,o,Math.max(6,o/2)),e,n,s,r)}function Sn(i,t,e,n,s=0,r=0,o=0,a=24,c=rs){return Rr(i,new vn(t,e,10,a,c),n,s,r,o)}function pn(i,t,e,n,s=0,r=0,o=0){return Rr(i,new Cn(t,e),n,s,r,o)}function oy(i,t={}){let{width:e=512,height:n=128,font:s=null}=t;return Ar(i.brand||"GARAGE",{width:e,height:n,bg:"rgba(0,0,0,0)",fg:"#f4f0e4",accent:i.accent||"#e8b45a",font:s||`bold ${Math.round(n*.52)}px Arial, sans-serif`,border:!1})}function Cr(i,t={}){let e=oy(i,t);return e?new Se({map:e,transparent:!0,roughness:.5,metalness:.1,depthWrite:!1,side:De,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-2}):null}function Pr(i,t={}){let{length:e=1,height:n=.05,depth:s=.02,x:r=0,y:o=0,z:a=0,axis:c="z",accentMat:l,chromeMat:h,chrome:u=!0}=t,d=c==="z"?I(i,s,n,e,l,r,o,a):I(i,e,n,s,l,r,o,a),f=null;return u&&h&&(f=c==="z"?I(i,s*.8,n*.28,e,h,r,o+n*.78,a):I(i,e,n*.28,s*.8,h,r,o+n*.78,a)),{accent:d,chrome:f}}function as(i,t={}){let{radius:e=.52,width:n=.32,style:s="truck",rimColor:r=14146270,tread:o=i.rubber,spokes:a=6,brakeDisc:c=!0}=t,l=new dn,h=new dn;h.rotation.z=gt,l.add(h);let u=n/2,d=e*.6,f=[new pt(d,-u),new pt(e*.88,-u*1.02),new pt(e*.985,-u*.78),new pt(e,-u*.42),new pt(e,u*.42),new pt(e*.985,u*.78),new pt(e*.88,u*1.02),new pt(d,u)],_=new po(f,40),g=new Dt(_,o);h.add(g);let m=new Dt(new Ie(d,d,n*.96,28,1,!0),i.rubberTrim);h.add(m);let p=e*.58,y=new Dt(new Ie(p,p,n*.9,30),wr(r));h.add(y);let S=new Dt(new vn(p*.99,e*.022,8,30),wr(r));S.rotation.x=gt,S.position.y=u*.86,h.add(S);let v=u*.9;if(s==="truck"){for(let E=0;E<10;E++){let A=E/10*rs,x=new Dt(new Ie(e*.075,e*.075,.012,8),i.plastic);x.position.set(Math.cos(A)*p*.68,v,Math.sin(A)*p*.68),h.add(x)}let M=new Dt(new Ie(e*.2,e*.23,.05,18),wr(r));M.position.y=v-.006,h.add(M);for(let E=0;E<6;E++){let A=E/6*rs,x=new Dt(new Ie(.022,.022,.024,6),i.chromeDark);x.position.set(Math.cos(A)*e*.13,v+.018,Math.sin(A)*e*.13),h.add(x)}}else{let M=wr(r);for(let x=0;x<a;x++){let w=x/a*rs,C=new Dt(new fn(e*.16,.05,p*.92),M);C.position.set(Math.cos(w)*p*.45,v-.02,Math.sin(w)*p*.45),C.rotation.y=-w,h.add(C)}let E=new Dt(new Ie(e*.17,e*.19,.032,20),wr(r));E.position.y=v-.004,h.add(E);for(let x=0;x<5;x++){let w=x/5*rs,C=new Dt(new Ie(.014,.014,.018,6),i.chromeDark);C.position.set(Math.cos(w)*e*.11,v+.012,Math.sin(w)*e*.11),h.add(C)}let A=new Dt(new Ie(e*.085,e*.085,.022,16),wr(1711650));A.position.y=v+.008,h.add(A)}if(c){let M=new Dt(new Ie(e*.52,e*.52,.035,28),i.darkSteel);M.position.y=-u*.2,h.add(M);let E=new Dt(new fn(e*.2,.09,e*.28),i.plasticGray);E.position.set(e*.35,-u*.2,e*.28),h.add(E)}return l.userData.radius=e,l}function wr(i){return new Se({color:i,metalness:.95,roughness:.26,envMapIntensity:1.2})}function Vn(i,t,e,n,s,r=8){let o=new D(...t),a=new D(...e),c=a.clone().sub(o),l=c.length(),h=new Ie(n,n,l,r),u=new Dt(h,s);return u.position.copy(o).add(a).multiplyScalar(.5),u.quaternion.setFromUnitVectors(new D(0,1,0),c.normalize()),i.add(u),u}function Cs(i=window,t=navigator){let e=f=>{var _;try{return!!((_=i.matchMedia)!=null&&_.call(i,f).matches)}catch{return!1}},n=((t==null?void 0:t.userAgent)||"").toLowerCase(),s=(t==null?void 0:t.maxTouchPoints)||0,r=e("(pointer: coarse)"),o=e("(hover: none)"),a=s>0||r||o,c=/android|iphone|ipad|ipod|mobile|windows phone|opera mini/.test(n),l=Math.min(i.innerWidth||1024,i.innerHeight||768),h=a&&(l<=620||/iphone|android.*mobile|mobile/.test(n)&&l<=900),u=a&&!h&&(l<=1100||/ipad|tablet/.test(n));return{touch:a,coarse:r,noHover:o,phone:h,tablet:u,desktop:!a&&!h,mobile:h||u,standalone:e("(display-mode: standalone)")||(t==null?void 0:t.standalone)===!0,reducedMotion:e("(prefers-reduced-motion: reduce)"),portrait:(i.innerHeight||0)>=(i.innerWidth||0),dpr:i.devicePixelRatio||1,cores:(t==null?void 0:t.hardwareConcurrency)||4,memory:(t==null?void 0:t.deviceMemory)||4}}function ay(i=Cs()){return i.phone||i.cores<=4||i.memory<=4}function sf(i,t={},e={}){var E;let n=e.win||(typeof window!="undefined"?window:null),s=(E=e.swipeMin)!=null?E:46,r=t.onSwipe,o=t.onDoubleTap,a=t.onPinch,c=t.onInteraction,l=0,h=0,u=0,d=!1,f=!1,_=0,g=0,m=A=>{let[x,w]=A;return Math.hypot(x.clientX-w.clientX,x.clientY-w.clientY)};function p(A){A.touches.length===1?(f=!1,l=A.touches[0].clientX,h=A.touches[0].clientY,u=performance.now(),d=!1):A.touches.length===2&&(f=!0,g=m(A.touches)),c==null||c()}function y(A){if(A.touches.length!==1||f)return;let x=A.touches[0].clientX-l,w=A.touches[0].clientY-h;Math.hypot(x,w)>10&&(d=!0)}function S(A){var P;if(f){A.touches.length===0&&(f=!1);return}let x=(P=A.changedTouches)==null?void 0:P[0];if(!x)return;let w=x.clientX-l,C=x.clientY-h,L=performance.now()-u;if(r&&L<550&&Math.abs(w)>s&&Math.abs(w)>Math.abs(C)*1.6){r(Math.sign(w));return}if(!d&&o){let O=performance.now();O-_<320?(o(),_=0):_=O}}function v(A){if(A.touches.length!==2||!g)return;let x=m(A.touches);Math.abs(x-g)>70&&(a==null||a(x>g?"out":"in"),g=x)}i.addEventListener("touchstart",p,{passive:!0}),i.addEventListener("touchmove",y,{passive:!0}),i.addEventListener("touchmove",v,{passive:!0}),i.addEventListener("touchend",S,{passive:!0});let M=A=>{var x;((x=A.touches)==null?void 0:x.length)>1&&A.preventDefault()};return i.addEventListener("gesturestart",A=>A.preventDefault(),{passive:!1}),()=>{i.removeEventListener("touchstart",p),i.removeEventListener("touchmove",y),i.removeEventListener("touchmove",v),i.removeEventListener("touchend",S),i.removeEventListener("gesturestart",M)}}function cs(i=8){var t;try{(t=navigator.vibrate)==null||t.call(navigator,i)}catch{}}function Hh(i=Cs(),t=60,e=window){var a,c;let n=((e==null?void 0:e.innerWidth)||1280)*((e==null?void 0:e.innerHeight)||720),s=ay(i),r=Math.min(i.dpr||1,s?1.35:2);n>26e5&&(r=Math.min(r,1.6)),t<40&&(r=Math.min(r,1));let o=!s&&((a=i.cores)!=null?a:4)>=8&&((c=i.memory)!=null?c:4)>=8;return{pixelRatio:r,shadows:!s&&(o||n<34e5),antialias:!s,powerPreference:s?"default":"high-performance"}}function rf(i,t={}){var r;if(!("DeviceMotionEvent"in window))return()=>{};let e=(r=t.threshold)!=null?r:22,n=0,s=o=>{let a=o.accelerationIncludingGravity;if(!a)return;Math.hypot(a.x||0,a.y||0,a.z||0)>e&&performance.now()-n>1200&&(n=performance.now(),i())};return window.addEventListener("devicemotion",s),()=>window.removeEventListener("devicemotion",s)}function of(i){let t=Cs(),e=Hh(t),n=new Xc({canvas:i,antialias:e.antialias,powerPreference:e.powerPreference,alpha:!1,preserveDrawingBuffer:!1});n.setPixelRatio(e.pixelRatio),n.outputColorSpace=$e,n.toneMapping=mr,n.toneMappingExposure=1.02,n.shadowMap.enabled=e.shadows||!t.mobile,n.shadowMap.type=t.mobile?bs:Qa;let s=new Vi;s.background=new te("#0b0d0c"),s.fog=new rr("#0b0d0c",42,120);let r=new Qe(38,1,.05,400);r.position.set(8,3.4,-9);let o=new _o(14674418,1448218,1.15);s.add(o);let a=new $i(16774370,2.6);a.position.set(7,13,-9),a.castShadow=!0,a.shadow.mapSize.set(2048,2048),a.shadow.camera.left=-16,a.shadow.camera.right=16,a.shadow.camera.top=16,a.shadow.camera.bottom=-16,a.shadow.camera.near=1,a.shadow.camera.far=46,a.shadow.bias=-6e-4,a.shadow.normalBias=.02,a.shadow.radius=2.5,s.add(a);let c=new $i(12376319,.85);c.position.set(-10,6,7),s.add(c);let l=new $i(16767400,1.5);l.position.set(-4,5,12),s.add(l);let h=new $i(10478847,.7);h.position.set(9,2.4,9),s.add(h);let u=[];for(let[N,Z,V]of[[-6,-6,16773336],[6,-6,14676991],[0,7.5,16770240]]){let Y=new yo(V,130,34,.55,.55,1.6);Y.position.set(N,11.5,Z),Y.target.position.set(0,1,0),s.add(Y,Y.target),u.push(Y)}let d=new Sr(n);d.compileEquirectangularShader();let f=null;try{if(Tr){let N=cy();N&&(N.mapping=gr,f=d.fromEquirectangular(N),s.environment=f.texture,N.dispose())}}catch(N){console.warn("env fallback",N)}if(!s.environment)try{s.environment=d.fromScene(new Zc,.04).texture}catch(N){console.warn("RoomEnvironment \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D",N)}s.environmentIntensity=.9;let _=new dn;s.add(_);let g=Tr?gi(1024,1024,(N,Z,V)=>{N.fillStyle="#14171a",N.fillRect(0,0,Z,V);let Y=Z/8;for(let J=0;J<8;J++)for(let Rt=0;Rt<8;Rt++)N.fillStyle=(Rt+J)%2?"#171a1e":"#111417",N.fillRect(Rt*Y,J*Y,Y,Y);N.strokeStyle="rgba(255,255,255,0.045)",N.lineWidth=2;for(let J=0;J<=8;J++)N.beginPath(),N.moveTo(J*Y,0),N.lineTo(J*Y,V),N.stroke(),N.beginPath(),N.moveTo(0,J*Y),N.lineTo(Z,J*Y),N.stroke();for(let J=0;J<9e3;J++)N.fillStyle=`rgba(255,255,255,${Math.random()*.02})`,N.fillRect(Math.random()*Z,Math.random()*V,2,2)},{repeat:[6,6]}):null,m=new Se({color:2764595,roughness:.32,metalness:.55,map:g,envMapIntensity:.65}),p=new Dt(new Cn(160,160),m);p.rotation.x=-Math.PI/2,p.receiveShadow=!0,_.add(p);let y=new Dt(new Ie(9.2,9.5,.1,72,1,!1),new Se({color:1843236,roughness:.2,metalness:.75,envMapIntensity:.9}));y.position.y=.05,y.receiveShadow=!0,_.add(y);let S=new Dt(new vn(9.32,.025,6,96),new Se({color:15250522,emissive:15250522,emissiveIntensity:1.3,roughness:.4}));S.rotation.x=Math.PI/2,S.position.y=.1,_.add(S);let v=Tr?gi(1024,512,(N,Z,V)=>{let Y=N.createLinearGradient(0,0,0,V);Y.addColorStop(0,"#161c20"),Y.addColorStop(.55,"#2a333a"),Y.addColorStop(.72,"#5d6a72"),Y.addColorStop(.88,"#39434a"),Y.addColorStop(1,"#151a1d"),N.fillStyle=Y,N.fillRect(0,0,Z,V);for(let J=0;J<9;J++){let Rt=40+J*112,bt=N.createLinearGradient(0,V*.2,0,V*.62);bt.addColorStop(0,"rgba(255,244,224,0.85)"),bt.addColorStop(1,"rgba(255,244,224,0)"),N.fillStyle=bt,N.fillRect(Rt,V*.2,62,V*.42)}for(let J=0;J<9;J++)N.fillStyle="rgba(10,12,14,0.55)",N.fillRect(20+J*112,V*.16,12,V*.68);N.fillStyle="rgba(232,180,90,0.35)",N.fillRect(0,V*.7,Z,3)}):null,M=new Ti({map:v,side:Ke,fog:!0}),E=new Dt(new Ie(46,46,26,48,1,!0),M);E.position.y=12,_.add(E);let A=new Dt(new ni(46,32,16,0,Math.PI*2,0,Math.PI/2),new Ti({color:1778215,side:Ke,fog:!0}));_.add(A);let x=new Se({color:2435888,roughness:.35,metalness:.85});for(let N=0;N<3;N++){let Z=new Dt(new vn(10.5+N*1.6,.07,6,120,Math.PI),x);Z.rotation.z=Math.PI,Z.position.y=.5,Z.rotation.x=0,Z.rotation.y=N*.35,_.add(Z)}let w=new Ti({color:3818056,transparent:!0,opacity:.6});for(let N=-6;N<=6;N++){let Z=new Dt(new Cn(.02,60),w);Z.rotation.x=-Math.PI/2,Z.position.set(N*3,.011,-26),_.add(Z)}let C={studio:{bg:"#0b0d0c",fog:["#0b0d0c",42,120],floor:2764595,floorRough:.32,floorMetal:.55,hemi:1.15,key:2.6,rim:1.5,env:.9,exposure:1.02,grid:!0},dark:{bg:"#050607",fog:["#050607",30,90],floor:856082,floorRough:.18,floorMetal:.8,hemi:.5,key:1.8,rim:2.6,env:.65,exposure:.92,grid:!0},show:{bg:"#101418",fog:["#101418",50,130],floor:3817542,floorRough:.5,floorMetal:.35,hemi:1.6,key:3.2,rim:1.2,env:1.05,exposure:1.06,grid:!0},garage:{bg:"#0e1112",fog:["#0e1112",38,105],floor:2369578,floorRough:.82,floorMetal:.15,hemi:.9,key:2.2,rim:.9,env:.7,exposure:1,grid:!1}},L="studio";function P(N){var V;let Z=C[N]||C.studio;L=N,s.background=new te(Z.bg),s.fog=new rr(Z.fog[0],Z.fog[1],Z.fog[2]),m.color.setHex(Z.floor),m.roughness=Z.floorRough,m.metalness=Z.floorMetal,o.intensity=Z.hemi,a.intensity=Z.key,l.intensity=Z.rim,s.environmentIntensity=Z.env,n.toneMappingExposure=Z.exposure,w.opacity=Z.grid?.6:.12,S.visible=N!=="garage";for(let Y of _.children)((V=Y.geometry)==null?void 0:V.type)==="TorusGeometry"&&Y!==S&&(Y.visible=N!=="garage")}function O(){let N=i.parentElement,Z=Math.max(320,(N==null?void 0:N.clientWidth)||i.clientWidth||900),V=Math.max(240,(N==null?void 0:N.clientHeight)||i.clientHeight||560),Y=Hh(Cs(),F);n.setPixelRatio(Y.pixelRatio),n.setSize(Z,V,!1),r.aspect=Z/V,r.fov=V>Z?Math.max(38,X(Z/V)):38,r.updateProjectionMatrix()}let F=60,X=N=>Math.min(60,38+(1-Math.min(1,N))*26);function q(N){F=N,N<32&&n.getPixelRatio()>1&&(n.setPixelRatio(Math.max(1,n.getPixelRatio()-.2)),n.setSize(i.clientWidth,i.clientHeight,!1))}return typeof ResizeObserver!="undefined"&&i.parentElement&&new ResizeObserver(()=>O()).observe(i.parentElement),window.addEventListener("resize",O),O(),{renderer:n,scene:s,camera:r,stage:_,profile:t,adaptQuality:q,lights:{hemi:o,key:a,fill:c,rim:l,rim2:h,spots:u},setPreset:P,resize:O,get preset(){return L}}}function cy(){return gi(2048,1024,(i,t,e)=>{let n=i.createLinearGradient(0,0,0,e);n.addColorStop(0,"#2a3339"),n.addColorStop(.45,"#1a2025"),n.addColorStop(.55,"#0d1114"),n.addColorStop(1,"#05080a"),i.fillStyle=n,i.fillRect(0,0,t,e);let s=(o,a,c,l,h,u=1)=>{let d=i.createRadialGradient(o,a,1,o,a,c);d.addColorStop(0,h),d.addColorStop(.55,h),d.addColorStop(1,"rgba(0,0,0,0)"),i.globalAlpha=u,i.fillStyle=d,i.beginPath(),i.ellipse(o,a,c,l,0,0,Math.PI*2),i.fill(),i.globalAlpha=1};for(let o=0;o<5;o++){let a=150+o*46,c=i.createLinearGradient(0,a,t,a);c.addColorStop(0,"rgba(255,244,225,0)"),c.addColorStop(.2,"rgba(255,246,230,0.85)"),c.addColorStop(.5,"rgba(255,250,240,1)"),c.addColorStop(.8,"rgba(255,246,230,0.85)"),c.addColorStop(1,"rgba(255,244,225,0)"),i.fillStyle=c,i.fillRect(0,a,t,14+o*2)}for(let o=0;o<3;o++){let a=360+o*40,c=i.createLinearGradient(0,a,t,a);c.addColorStop(0,"rgba(180,220,255,0)"),c.addColorStop(.55,"rgba(200,232,255,0.55)"),c.addColorStop(1,"rgba(180,220,255,0)"),i.fillStyle=c,i.fillRect(0,a,t,10)}s(t*.15,e*.42,190,120,"rgba(255,240,214,0.9)",.9),s(t*.62,e*.38,230,150,"rgba(214,238,255,0.85)",.85),s(t*.88,e*.46,160,100,"rgba(255,226,190,0.8)",.8);let r=i.createLinearGradient(0,e*.6,0,e);r.addColorStop(0,"rgba(60,70,78,0.5)"),r.addColorStop(1,"rgba(0,0,0,0)"),i.fillStyle=r,i.fillRect(0,e*.6,t,e*.4)},{srgb:!0})}function af(){let i=new Vi;i.background=new te("#0b0d0c");let t=new Qe(38,1.5,.05,400);return{renderer:{domElement:Tr?document.createElement("canvas"):null,capabilities:{getMaxAnisotropy:()=>1},shadowMap:{enabled:!1,type:0},outputColorSpace:$e,toneMapping:mr,toneMappingExposure:1,render(){},setPixelRatio(){},setSize(){},dispose(){}},scene:i,camera:t,lights:{},fallback:!0,profile:{mobile:!1,phone:!1,touch:!1},setPreset(){},resize(){},adaptQuality(){}}}var cf={type:"change"},Gh={type:"start"},hf={type:"end"},Jc=new _s,lf=new Fn,ly=Math.cos(70*mh.DEG2RAD),nn=new D,In=2*Math.PI,Re={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},Vh=1e-6,Kc=class extends So{constructor(t,e=null){super(t,e),this.state=Re.NONE,this.target=new D,this.cursor=new D,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:Ki.ROTATE,MIDDLE:Ki.DOLLY,RIGHT:Ki.PAN},this.touches={ONE:ji.ROTATE,TWO:ji.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle="auto",this._domElementKeyEvents=null,this._lastPosition=new D,this._lastQuaternion=new yn,this._lastTargetPosition=new D,this._quat=new yn().setFromUnitVectors(t.up,new D(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new Ji,this._sphericalDelta=new Ji,this._scale=1,this._panOffset=new D,this._rotateStart=new pt,this._rotateEnd=new pt,this._rotateDelta=new pt,this._panStart=new pt,this._panEnd=new pt,this._panDelta=new pt,this._dollyStart=new pt,this._dollyEnd=new pt,this._dollyDelta=new pt,this._dollyDirection=new D,this._mouse=new pt,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=uy.bind(this),this._onPointerDown=hy.bind(this),this._onPointerUp=dy.bind(this),this._onContextMenu=yy.bind(this),this._onMouseWheel=my.bind(this),this._onKeyDown=gy.bind(this),this._onTouchStart=_y.bind(this),this._onTouchMove=xy.bind(this),this._onMouseDown=fy.bind(this),this._onMouseMove=py.bind(this),this._interceptControlDown=vy.bind(this),this._interceptControlUp=by.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(t){this._cursorStyle=t,t==="grab"?this.domElement.style.cursor="grab":this.domElement.style.cursor="auto"}get cursorStyle(){return this._cursorStyle}connect(t){super.connect(t),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.state=Re.NONE,this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents();let t=this.domElement.getRootNode();t.removeEventListener("keydown",this._interceptControlDown,{capture:!0}),t.removeEventListener("keyup",this._interceptControlUp,{capture:!0}),this._controlActive=!1,this._pointers.length=0,this._pointerPositions={},this.domElement.style.touchAction="",this.domElement.style.cursor="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(t){t.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=t}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(cf),this.update(),this.state=Re.NONE}pan(t,e){this._pan(t,e),this.update()}dollyIn(t){this._dollyIn(t),this.update()}dollyOut(t){this._dollyOut(t),this.update()}rotateLeft(t){this._rotateLeft(t),this.update()}rotateUp(t){this._rotateUp(t),this.update()}update(t=null){let e=this.object.position;nn.copy(e).sub(this.target),nn.applyQuaternion(this._quat),this._spherical.setFromVector3(nn),this.autoRotate&&this.state===Re.NONE&&this._rotateLeft(this._getAutoRotationAngle(t)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(n)&&isFinite(s)&&(n<-Math.PI?n+=In:n>Math.PI&&(n-=In),s<-Math.PI?s+=In:s>Math.PI&&(s-=In),n<=s?this._spherical.theta=Math.max(n,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+s)/2?Math.max(n,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let o=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=o!=this._spherical.radius}if(nn.setFromSpherical(this._spherical),nn.applyQuaternion(this._quatInverse),e.copy(this.target).add(nn),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let o=null;if(this.object.isPerspectiveCamera){let a=nn.length();o=this._clampDistance(a*this._scale);let c=a-o;this.object.position.addScaledVector(this._dollyDirection,c),this.object.updateMatrixWorld(),r=!!c}else if(this.object.isOrthographicCamera){let a=new D(this._mouse.x,this._mouse.y,0);a.unproject(this.object);let c=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=c!==this.object.zoom;let l=new D(this._mouse.x,this._mouse.y,0);l.unproject(this.object),this.object.position.sub(l).add(a),this.object.updateMatrixWorld(),o=nn.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;o!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(o).add(this.object.position):(Jc.origin.copy(this.object.position),Jc.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(Jc.direction))<ly?this.object.lookAt(this.target):(lf.setFromNormalAndCoplanarPoint(this.object.up,this.target),Jc.intersectPlane(lf,this.target))))}else if(this.object.isOrthographicCamera){let o=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),o!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>Vh||8*(1-this._lastQuaternion.dot(this.object.quaternion))>Vh||this._lastTargetPosition.distanceToSquared(this.target)>Vh?(this.dispatchEvent(cf),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(t){return t!==null?In/60*this.autoRotateSpeed*t:In/60/60*this.autoRotateSpeed}_getZoomScale(t){let e=Math.abs(t*.01);return Math.pow(.95,this.zoomSpeed*e)}_rotateLeft(t){this._sphericalDelta.theta-=t}_rotateUp(t){this._sphericalDelta.phi-=t}_panLeft(t,e){nn.setFromMatrixColumn(e,0),nn.multiplyScalar(-t),this._panOffset.add(nn)}_panUp(t,e){this.screenSpacePanning===!0?nn.setFromMatrixColumn(e,1):(nn.setFromMatrixColumn(e,0),nn.crossVectors(this.object.up,nn)),nn.multiplyScalar(t),this._panOffset.add(nn)}_pan(t,e){let n=this.domElement;if(this.object.isPerspectiveCamera){let s=this.object.position;nn.copy(s).sub(this.target);let r=nn.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*t*r/n.clientHeight,this.object.matrix),this._panUp(2*e*r/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(t*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(e*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(t,e){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let n=this.domElement.getBoundingClientRect(),s=t-n.left,r=e-n.top,o=n.width,a=n.height;this._mouse.x=s/o*2-1,this._mouse.y=-(r/a)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(t){return Math.max(this.minDistance,Math.min(this.maxDistance,t))}_handleMouseDownRotate(t){this._rotateStart.set(t.clientX,t.clientY)}_handleMouseDownDolly(t){this._updateZoomParameters(t.clientX,t.clientX),this._dollyStart.set(t.clientX,t.clientY)}_handleMouseDownPan(t){this._panStart.set(t.clientX,t.clientY)}_handleMouseMoveRotate(t){this._rotateEnd.set(t.clientX,t.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let e=this.domElement;this._rotateLeft(In*this._rotateDelta.x/e.clientHeight),this._rotateUp(In*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(t){this._dollyEnd.set(t.clientX,t.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(t){this._panEnd.set(t.clientX,t.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(t){this._updateZoomParameters(t.clientX,t.clientY),t.deltaY<0?this._dollyIn(this._getZoomScale(t.deltaY)):t.deltaY>0&&this._dollyOut(this._getZoomScale(t.deltaY)),this.update()}_handleKeyDown(t){let e=!1;switch(t.code){case this.keys.UP:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateUp(In*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),e=!0;break;case this.keys.BOTTOM:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateUp(-In*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),e=!0;break;case this.keys.LEFT:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateLeft(In*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),e=!0;break;case this.keys.RIGHT:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateLeft(-In*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),e=!0;break}e&&(t.preventDefault(),this.update())}_handleTouchStartRotate(t){if(this._pointers.length===1)this._rotateStart.set(t.pageX,t.pageY);else{let e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._rotateStart.set(n,s)}}_handleTouchStartPan(t){if(this._pointers.length===1)this._panStart.set(t.pageX,t.pageY);else{let e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._panStart.set(n,s)}}_handleTouchStartDolly(t){let e=this._getSecondPointerPosition(t),n=t.pageX-e.x,s=t.pageY-e.y,r=Math.sqrt(n*n+s*s);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enablePan&&this._handleTouchStartPan(t)}_handleTouchStartDollyRotate(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enableRotate&&this._handleTouchStartRotate(t)}_handleTouchMoveRotate(t){if(this._pointers.length==1)this._rotateEnd.set(t.pageX,t.pageY);else{let n=this._getSecondPointerPosition(t),s=.5*(t.pageX+n.x),r=.5*(t.pageY+n.y);this._rotateEnd.set(s,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let e=this.domElement;this._rotateLeft(In*this._rotateDelta.x/e.clientHeight),this._rotateUp(In*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(t){if(this._pointers.length===1)this._panEnd.set(t.pageX,t.pageY);else{let e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._panEnd.set(n,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(t){let e=this._getSecondPointerPosition(t),n=t.pageX-e.x,s=t.pageY-e.y,r=Math.sqrt(n*n+s*s);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let o=(t.pageX+e.x)*.5,a=(t.pageY+e.y)*.5;this._updateZoomParameters(o,a)}_handleTouchMoveDollyPan(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enablePan&&this._handleTouchMovePan(t)}_handleTouchMoveDollyRotate(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enableRotate&&this._handleTouchMoveRotate(t)}_addPointer(t){this._pointers.push(t.pointerId)}_removePointer(t){delete this._pointerPositions[t.pointerId];for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId){this._pointers.splice(e,1);return}}_isTrackingPointer(t){for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId)return!0;return!1}_trackPointer(t){let e=this._pointerPositions[t.pointerId];e===void 0&&(e=new pt,this._pointerPositions[t.pointerId]=e),e.set(t.pageX,t.pageY)}_getSecondPointerPosition(t){let e=t.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[e]}_customWheelEvent(t){let e=t.deltaMode,n={clientX:t.clientX,clientY:t.clientY,deltaY:t.deltaY};switch(e){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100;break}return t.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}};function hy(i){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(i.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(i)&&(this._addPointer(i),i.pointerType==="touch"?this._onTouchStart(i):this._onMouseDown(i),this._cursorStyle==="grab"&&(this.domElement.style.cursor="grabbing")))}function uy(i){this.enabled!==!1&&(i.pointerType==="touch"?this._onTouchMove(i):this._onMouseMove(i))}function dy(i){switch(this._removePointer(i),this._pointers.length){case 0:this.domElement.releasePointerCapture(i.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(hf),this.state=Re.NONE,this._cursorStyle==="grab"&&(this.domElement.style.cursor="grab");break;case 1:let t=this._pointers[0],e=this._pointerPositions[t];this._onTouchStart({pointerId:t,pageX:e.x,pageY:e.y});break}}function fy(i){let t;switch(i.button){case 0:t=this.mouseButtons.LEFT;break;case 1:t=this.mouseButtons.MIDDLE;break;case 2:t=this.mouseButtons.RIGHT;break;default:t=-1}switch(t){case Ki.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(i),this.state=Re.DOLLY;break;case Ki.ROTATE:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=Re.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=Re.ROTATE}break;case Ki.PAN:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=Re.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=Re.PAN}break;default:this.state=Re.NONE}this.state!==Re.NONE&&this.dispatchEvent(Gh)}function py(i){switch(this.state){case Re.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(i);break;case Re.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(i);break;case Re.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(i);break}}function my(i){this.enabled===!1||this.enableZoom===!1||this.state!==Re.NONE||(i.preventDefault(),this.dispatchEvent(Gh),this._handleMouseWheel(this._customWheelEvent(i)),this.dispatchEvent(hf))}function gy(i){this.enabled!==!1&&this._handleKeyDown(i)}function _y(i){switch(this._trackPointer(i),this._pointers.length){case 1:switch(this.touches.ONE){case ji.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(i),this.state=Re.TOUCH_ROTATE;break;case ji.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(i),this.state=Re.TOUCH_PAN;break;default:this.state=Re.NONE}break;case 2:switch(this.touches.TWO){case ji.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(i),this.state=Re.TOUCH_DOLLY_PAN;break;case ji.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(i),this.state=Re.TOUCH_DOLLY_ROTATE;break;default:this.state=Re.NONE}break;default:this.state=Re.NONE}this.state!==Re.NONE&&this.dispatchEvent(Gh)}function xy(i){switch(this._trackPointer(i),this.state){case Re.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(i),this.update();break;case Re.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(i),this.update();break;case Re.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(i),this.update();break;case Re.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(i),this.update();break;default:this.state=Re.NONE}}function yy(i){this.enabled!==!1&&i.preventDefault()}function vy(i){i.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function by(i){i.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}var jc=class{constructor(t,e,n={}){this.camera=t,this.controls=new Kc(t,e);let s=!!n.touch;this.controls.enableDamping=!0,this.controls.dampingFactor=s?.12:.085,this.controls.minDistance=1.4,this.controls.maxDistance=46,this.controls.zoomToCursor=!0,this.controls.zoomSpeed=s?.95:.8,this.controls.rotateSpeed=s?.6:.9,this.controls.panSpeed=.85,this.controls.maxPolarAngle=Math.PI*.495,this.controls.screenSpacePanning=!0,this.controls.target.set(0,1.4,0),this.controls.enabled=!0,this.controls.autoRotateSpeed=.55,this.flying=null,this.current=null,this.look=new D,this.view=null}setView(t,{instant:e=!1}={}){this.view=t;let n=new D(...t.pos),s=new D(...t.target);if(t.seat){let o=s.clone().sub(n).normalize();s=n.clone().add(o.multiplyScalar(2.6)),t={...t,target:s.toArray()}}this.controls.enabled=!!t.orbit||!!t.seat,this.controls.maxPolarAngle=t.seat?Math.PI*.96:Math.PI*.495,this.controls.autoRotate=!!t.autoRotate&&!t.seat,this.controls.minDistance=t.seat?.35:1.4;let r=n.distanceTo(s);this.controls.maxDistance=Hn(r*2.4,6,60),e?(this.camera.position.copy(n),this.camera.fov=t.fov||40,this.camera.updateProjectionMatrix(),this.controls.target.copy(s),this.controls.update(),this.flying=null):this.flying={t:0,dur:t.seat?1.15:.95,fromPos:this.camera.position.clone(),fromTarget:this.controls.target.clone(),fromFov:this.camera.fov,toPos:n,toTarget:s,toFov:t.fov||40,view:t}}fly(t=0,e=0,n=0,s=.1){if(!t&&!e&&!n)return;let r=new D;this.camera.getWorldDirection(r);let o=new D().crossVectors(r,new D(0,1,0)).normalize(),a=r.multiplyScalar(t*s).add(o.multiplyScalar(e*s)).add(new D(0,n*s,0)),c=this.camera.position.clone().add(a);c.y=Hn(c.y,.35,26);let l=Math.hypot(c.x,c.z);if(l>46){let h=46/l;c.x*=h,c.z*=h}a.copy(c).sub(this.camera.position),this.camera.position.copy(c),this.controls.target.add(a),this.camera.position.y<1.2&&this.controls.target.y<1&&(this.controls.target.y=1.2),this.controls.autoRotate=!1,this.controls.update()}orbit(t,e){if(!this.controls.enabled)return;let n=this.controls.target,s=this.camera.position.clone().sub(n),r=new Ji().setFromVector3(s);r.theta-=t;let o=.14;r.phi=Hn(r.phi-e,o,this.controls.maxPolarAngle-.02),s.setFromSpherical(r),this.camera.position.copy(n).add(s),this.camera.lookAt(n),this.controls.update()}zoomBy(t){let e=this.controls.target,n=this.camera.position.clone().sub(e),s=Hn(n.length()/t,this.controls.minDistance,this.controls.maxDistance);n.setLength(s),this.camera.position.copy(e).add(n),this.camera.lookAt(e),this.controls.update()}panBy(t,e){let n=this.controls.target,s=new D().setFromMatrixColumn(this.camera.matrix,0),r=new D().setFromMatrixColumn(this.camera.matrix,1),o=this.camera.position.distanceTo(n)*.12,a=s.multiplyScalar(t*o).add(r.multiplyScalar(e*o));n.add(a),this.camera.position.add(a),this.camera.lookAt(n),this.controls.update()}focusOn(t,{distance:e=null}={}){let n=this.camera.position.clone(),s=n.clone().sub(t).normalize(),r=Hn(e!=null?e:n.distanceTo(t)*.62,1.6,this.controls.maxDistance),o=t.clone().add(s.multiplyScalar(r));this.flying={t:0,dur:.55,fromPos:n,fromTarget:this.controls.target.clone(),fromFov:this.camera.fov,toPos:o,toTarget:t.clone(),toFov:this.camera.fov,view:this.view}}update(t){var e;if(this.flying){let n=this.flying;n.t+=t;let s=Hn(n.t/n.dur,0,1),r=s<.5?4*s*s*s:1-Math.pow(-2*s+2,3)/2;this.camera.position.lerpVectors(n.fromPos,n.toPos,r),this.controls.target.lerpVectors(n.fromTarget,n.toTarget,r),this.camera.fov=n.fromFov+(n.toFov-n.fromFov)*r,this.camera.updateProjectionMatrix(),this.controls.update(),s>=1&&(this.flying=null,this.current=n.view,(e=n.view)!=null&&e.orbit&&(this.controls.autoRotate=!!n.view.autoRotate));return}this.controls.enabled&&this.controls.update(t)}lookAt(t,e,n){this.controls.target.set(t,e,n),this.controls.update()}get isSeated(){var t;return!!((t=this.view)!=null&&t.seat)}};var uf={scratch:"\u0446\u0430\u0440\u0430\u043F\u0438\u043D\u0430 \u0438 \u0441\u043A\u043E\u043B",dent:"\u0432\u043C\u044F\u0442\u0438\u043D\u0430",rust:"\u0440\u0436\u0430\u0432\u0447\u0438\u043D\u0430",crack:"\u0442\u0440\u0435\u0449\u0438\u043D\u0430"},df={f:{1:"\u043F\u0440\u0430\u0432\u0430\u044F","-1":"\u043B\u0435\u0432\u0430\u044F"},m:{1:"\u043F\u0440\u0430\u0432\u044B\u0439","-1":"\u043B\u0435\u0432\u044B\u0439"},n:{1:"\u043F\u0440\u0430\u0432\u043E\u0435","-1":"\u043B\u0435\u0432\u043E\u0435"}},ff={trucks:{name:"\u0434\u0432\u0435\u0440\u044C \u043A\u0430\u0431\u0438\u043D\u044B",gender:"f"},cars:{name:"\u0437\u0430\u0434\u043D\u0435\u0435 \u043A\u0440\u044B\u043B\u043E",gender:"n"},trailers:{name:"\u0431\u043E\u0440\u0442 \u043A\u0443\u0437\u043E\u0432\u0430",gender:"m"}};function Sy(i){let t=2166136261;for(let e=0;e<i.length;e++)t^=i.charCodeAt(e),t=Math.imul(t,16777619);return Math.abs(t)}function My(i){let t=(i||1)>>>0;return()=>(t=Math.imul(t,1664525)+1013904223>>>0,t/4294967296)}var jt=128;function Ey(){let i=new Uint8Array(jt*jt*4),t=(s,r,o,a,c,l)=>{let h=Math.round(s),u=Math.round(r);if(h<0||u<0||h>=jt||u>=jt||l<=0)return;let d=(u*jt+h)*4,f=Math.min(1,l),_=i[d+3]/255,g=f+_*(1-f);g<=0||(i[d]=Math.round((o*f+i[d]*_*(1-f))/g),i[d+1]=Math.round((a*f+i[d+1]*_*(1-f))/g),i[d+2]=Math.round((c*f+i[d+2]*_*(1-f))/g),i[d+3]=Math.round(g*255))},e=(s,r,o,a,c,l,h,u=1.5)=>{for(let d=Math.floor(r-o-u);d<=r+o+u;d++)for(let f=Math.floor(s-o-u);f<=s+o+u;f++){let _=Math.hypot(f-s,d-r);if(_<=o+u){let g=_<=o?1:1-(_-o)/u;t(f,d,a,c,l,h*g)}}};return{data:i,blend:t,disc:e,line:(s,r,o,a,c,l,h,u,d=1)=>{let f=Math.hypot(o-s,a-r),_=Math.max(2,Math.ceil(f*1.6));for(let g=0;g<=_;g++){let m=g/_;e(s+(o-s)*m,r+(a-r)*m,d/2,c,l,h,u,.7)}}}}function gf(i,t){let{disc:e,line:n}=i;for(let l=0;l<16;l++)e(jt*(.3+t()*.4),jt*(.32+t()*.36),9+t()*15,232,230,224,.03,9);let s=-.3+t()*.6,r=Math.cos(s),o=Math.sin(s),a=jt*.5,c=jt*.5;for(let l=0;l<6;l++){let h=(l-2.5)*(2.4+t()*3.6)+(t()-.5)*2.5,u=jt*(l===2?.34:.08+t()*.22),d=(t()-.5)*jt*.12,f=a+d*r-o*h,_=c+d*o+r*h,g=f-r*u*.5,m=_-o*u*.5,p=f+r*u*.5,y=_+o*u*.5,S=t(),v=()=>{if(S>.55){let M=.35+t()*.2;n(g,m,g+(p-g)*M,m+(y-m)*M,246,244,238,.3,.9),n(g+(p-g)*(M+.12),m+(y-m)*(M+.12),p,y,246,244,238,.24,.9)}else n(g,m,p,y,246,244,238,.26+t()*.2,.9)};n(g+1,m+1.1,p+1,y+1.1,24,22,20,.34,1.1),v()}for(let l=0;l<5;l++){let h=jt*(.34+t()*.32),u=jt*(.36+t()*.28);e(h,u,1.2+t()*2.8,92,86,78,.55,1),e(h-.5,u-.5,.8+t()*1.4,150,144,136,.4,1)}}function wy(i,t){let{disc:e,line:n}=i,s=jt*.5,r=jt*.52;for(let o=16;o>=1;o--)e(s-o*.25,r-o*.2,jt*.05+o*1.9,18,17,16,.032,6);for(let o=6;o>=1;o--)e(s+o*.6,r+o*.5,o*2.6,250,249,246,.022,5);for(let o=.9;o<2.1;o+=.06){let a=jt*.275;n(s+Math.cos(o)*a,r+Math.sin(o)*a*.78,s+Math.cos(o+.06)*a,r+Math.sin(o+.06)*a*.78,250,248,244,.14,2)}e(s-2,r-1,3.4,186,180,170,.7,1),e(s-2.8,r-1.6,1.5,232,230,224,.65,1)}function Ty(i,t){let{disc:e,line:n}=i;for(let s=0;s<40;s++){let r=jt*(.22+t()*.56),o=jt*(.22+t()*.56),a=.4+t()*.6;e(r,o,3+t()*12,108+a*70,52+a*30,20+a*14,.1+t()*.18,5)}for(let s=0;s<14;s++){let r=jt*(.25+t()*.5),o=jt*(.25+t()*.5);e(r,o,1.5+t()*3.4,74,34,12,.75,1.5)}for(let s=0;s<7;s++){let r=jt*(.25+t()*.5),o=jt*(.35+t()*.25);n(r,o,r+(t()-.5)*5,o+jt*(.08+t()*.14),112,58,24,.45,1.3)}}function Ay(i,t){let{line:e,disc:n}=i,s=jt*.44,r=jt*.46,o=(a,c,l,h,u)=>{if(u<=0||h<3)return;let d=a+Math.cos(l)*h,f=c+Math.sin(l)*h;e(a+1,c+1,d+1,f+1,22,30,36,.55,1.8),e(a,c,d,f,252,253,255,.75,1.1),o(d,f,l+(t()-.5)*.9,h*(.55+t()*.2),u-1),t()>.4&&o(d,f,l+(t()-.5)*1.7,h*.5,u-1)};for(let a=0;a<7;a++)o(s,r,a/7*Math.PI*2+t()*.4,jt*.14,3);n(s,r,2.4,250,252,255,.9,1)}var Ry={scratch:gf,dent:wy,rust:Ty,crack:Ay},Qc=new Map;function _f(i,t=1){let e=`${i}:${t%97}`;if(Qc.has(e))return Qc.get(e).data;let n=Ey();(Ry[i]||gf)(n,My(t));let s=new Wi(n.data,jt,jt,An);return s.colorSpace=$e,s.magFilter=Ve,s.minFilter=Ve,s.needsUpdate=!0,Qc.set(e,{data:n.data,tex:s}),n.data}function Cy(i,t=1){_f(i,t);let e=`${i}:${t%97}`;return Qc.get(e).tex}var Ir={dent:{bump:.0075,normal:2.3,rough:.52,metal:.14,mode:"rim"},scratch:{bump:.0035,normal:1.8,rough:.33,metal:.58,mode:"rim"},crack:{bump:.0045,normal:2.1,rough:.4,metal:.42,mode:"rim"},rust:{bump:.0055,normal:2.7,rough:.95,metal:.04,mode:"blister"}},pf=.002,Wh=new Map,Xh=new Map;function xf(i,t=1){let e=`${i}:${t%97}`;if(Wh.has(e))return Wh.get(e);let n=_f(i,t),s=new Float32Array(jt*jt),r=0;for(let c=0;c<jt*jt;c++){let l=n[c*4+3]/255;s[c]=l,l>r&&(r=l)}let o=r>.001?.95/r:1,a=new Float32Array(jt*jt);for(let c=0;c<jt;c++)for(let l=0;l<jt;l++){let h=0;for(let u=-1;u<=1;u++)for(let d=-1;d<=1;d++){let f=Math.min(jt-1,Math.max(0,l+d)),_=Math.min(jt-1,Math.max(0,c+u));h+=s[_*jt+f]}a[c*jt+l]=Math.min(1,h/9*o)}return Wh.set(e,a),a}function Py(i,t=1){let e=`${i}:${t%97}`;if(Xh.has(e))return Xh.get(e);let n=xf(i,t),r=(Ir[i]||Ir.dent).normal*3.4,o=new Uint8Array(jt*jt*4);for(let c=0;c<jt;c++)for(let l=0;l<jt;l++){let h=n[c*jt+Math.max(0,l-1)],u=n[c*jt+Math.min(jt-1,l+1)],d=n[Math.max(0,c-1)*jt+l],f=n[Math.min(jt-1,c+1)*jt+l],_=(h-u)*r,g=(d-f)*r,m=Math.hypot(_,g,1)||1,p=(c*jt+l)*4;o[p]=Math.round((_/m*.5+.5)*255),o[p+1]=Math.round((g/m*.5+.5)*255),o[p+2]=Math.round((1/m*.5+.5)*255),o[p+3]=255}let a=new Wi(o,jt,jt,An);return a.magFilter=Ve,a.minFilter=Ve,a.needsUpdate=!0,Xh.set(e,a),a}function Iy(i,t){let e=Math.imul(i+1,2654435761)^Math.imul(t+7,40503);return e=Math.imul(e^e>>>15,2246822507),e^=e>>>13,(e>>>0)%1e3/999}function Ly(i,t){let e=Math.max(.12,i.w||.4),n=Math.max(.1,i.h||.3),s=Math.max(14,Math.min(40,Math.round(e*46))),r=Math.max(12,Math.min(40,Math.round(n*46))),o=new Cn(e,n,s,r),a=o.attributes.position,c=o.attributes.uv,l=xf(t.kind,t.seed),h=Ir[t.kind]||Ir.dent,u=1/0,d=-1/0;for(let f=0;f<a.count;f++){let _=Math.min(jt-1,Math.max(0,Math.round(c.getX(f)*(jt-1)))),g=Math.min(jt-1,Math.max(0,Math.round(c.getY(f)*(jt-1)))),m=l[g*jt+_],p;h.mode==="blister"?p=pf+h.bump*m*(.25+1.1*Iy(f,t.seed)):p=pf+h.bump*4*m*(1-m),a.setZ(f,p),p<u&&(u=p),p>d&&(d=p)}return o.computeVertexNormals(),o.userData.relief=d-u,o.userData.damageKind=t.kind,o}var mf=["scratch","dent","rust","crack"],Dy=16;function Ny(i,t,e=0,n=0){let s=Sy(`${i.category||"trucks"}:${i.id}`),r=mf[(n+s%4)%mf.length],o=1+(s*3+n*5)%Dy,a=t||ff[i.category]||ff.trucks,c=e?(df[a.gender]||df.m)[e]:"";return{kind:r,seed:o,index:n,side:e,part:a.name,label:`${c?`${c} `:""}${a.name} \u2014 ${uf[r]}`,short:uf[r]}}function Uy(i){let t=Cy(i.kind,i.seed),e=Ir[i.kind]||Ir.dent,n=new Se({map:t,normalMap:Py(i.kind,i.seed),normalScale:new pt(e.normal,e.normal),color:16777215,transparent:!0,roughness:e.rough,metalness:e.metal,depthWrite:!1,side:De,polygonOffset:!0,polygonOffsetFactor:-3,polygonOffsetUnits:-3});return n.userData.damageKind=i.kind,n}function Fy(i,t,e,n,s){let r=Math.abs(e.x)>.9?new D(0,1,0):new D(1,0,0),o=new D().crossVectors(e,r).normalize(),a=new D().crossVectors(e,o).normalize(),c=new D(...t.pos),l=new Ri;l.far=2.2;let h=y=>{var S;return y.object.isMesh&&y.object.visible!==!1&&!y.object.userData.damage&&((S=y.object.material)==null?void 0:S.transparent)!==!0},u=(y,S)=>{let v=c.clone().addScaledVector(o,y*n*.34).addScaledVector(a,S*s*.34).addScaledVector(e,.14);return l.set(v,e.clone().negate()),l.intersectObject(i,!0).find(h)||null},d=u(0,0),f=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1],[2,0],[-2,0],[0,2],[0,-2]];if(!d){let y=null,S=1/0;for(let[v,M]of f){let E=u(v,M);if(!E)continue;let A=Math.abs(v)+Math.abs(M);A<S&&(y=E,S=A)}d=y}let _=!1;if(!d){let y=e.clone().negate(),S=new Ri;S.far=1.2;for(let[v,M]of f){let E=c.clone().addScaledVector(o,v*n*.34).addScaledVector(a,M*s*.34).addScaledVector(y,.05);S.set(E,e.clone());let A=S.intersectObject(i,!0).find(h);if(A){d=A,_=!0;break}}}let g=e;if(!d){let y=new Ri;y.far=3.2;let S=null,v=1/0,M=e;for(let E of[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1],[.7,.7,0],[-.7,.7,0],[.7,-.7,0],[-.7,-.7,0]]){let A=new D(...E).normalize(),x=c.clone().addScaledVector(A,.02);y.set(x,A.clone().negate());let w=y.intersectObject(i,!0).find(h);w&&w.distance<v&&(S=w,v=w.distance,M=A)}if(!S)return null;d=S,g=M}let m=d.point.clone().addScaledVector(g,.003),p=null;if(d.face&&d.object){let y=new le().getNormalMatrix(d.object.matrixWorld);p=d.face.normal.clone().applyMatrix3(y).normalize(),p.dot(g)<0&&p.negate()}return{point:m,dist:d.distance,normalWorld:p}}function Lr(i,t,e){var r;let n=ke(i,"damage");n.visible=!1;let s=e.map((o,a)=>{var _;let c=Ny(t,o.part,o.side||0,a),l=new Dt(Ly(o,c),Uy(c));l.position.set(...o.pos);let h=(_=o.rotY)!=null?_:o.side?o.side>0?gt:-gt:0;l.rotation.set(o.rotX||0,h,0),i.updateMatrixWorld(!0);let d=new D(0,0,1).applyEuler(l.rotation).normalize().clone().applyQuaternion(i.getWorldQuaternion(new yn)).normalize(),f=Fy(i,o,d,o.w||.4,o.h||.3);if(f){let g=i.worldToLocal(f.point.clone());if(l.position.copy(g),l.userData.snap=f.dist,f.normalWorld&&f.normalWorld.dot(d)>.72){let m=f.normalWorld.clone().applyQuaternion(i.getWorldQuaternion(new yn).invert()).normalize();l.quaternion.setFromUnitVectors(new D(0,0,1),m)}}return l.userData.anchor=o.pos.slice(),l.name=`damage-patch:${a}`,l.userData.damage=!0,l.userData.kind=c.kind,l.userData.label=c.label,n.add(l),{patch:l,spec:c,anchor:o,index:a}});return{group:n,list:s,spec:((r=s[0])==null?void 0:r.spec)||null,count:s.length}}var Oy=1.18;function yf(i,t,e={}){return i.paint(t,e)}function vf(i,t,e,n,s,r,o,a,c={}){let{flap:l=!0,lip:h=!0}=c,u=new dn,d=t.clone?t.clone():t;d.side=De;let f=new Dt(new Ie(e,e,n,26,1,!0,0,me),d);f.rotation.z=gt,u.add(f);let _=i.rubberTrim.clone?i.rubberTrim.clone():i.rubberTrim;_.side=De;let g=new Dt(new Ie(e-.045,e-.045,n*.92,22,1,!0,0,me),_);if(g.rotation.z=gt,u.add(g),h){let m=new Dt(new vn(e+.005,.028,7,30,me),t);m.rotation.y=a>0?-gt:gt,m.position.x=a*(n/2-.01),u.add(m)}if(l){let m=Math.max(.4,e*1.05),p=new Dt(new fn(n*.92,m,.032),i.rubberTrim);p.position.set(0,.02-m/2,e+.055),u.add(p);let y=new Dt(new fn(n*.9,.045,.05),i.darkSteel);y.position.set(0,.055,e+.02),u.add(y)}return u.position.set(s,r,o),u}function bf(i,t){var wt,ft,Xt,Gt,ve;let e=ke(null,`truck:${i.id}`),n=[],s=[],r=[],o=[],a=i.wheel||{radius:.535,width:.42,rimColor:"#d9dde0"},c=a.radius,l=i.style||"euro",h=i.roof||"high",u=l==="bonnet",d=l==="futuristic",f=l==="lowentry",_=((wt=i.cabHeight)!=null?wt:3.55)-.12,g=(ft=i.length)!=null?ft:6.2,m=i.chrome!==!1,p=1.27,y=yf(t,i.paint),S=yf(t,i.paint,{roughness:.4,metalness:.35}),v=t.accent(i.accent||"#e8b45a");s.push(y,S,v);let M=-g/2,E=g/2,A=u?(Xt=i.bonnet)!=null?Xt:2.1:0,x=M+(u?.55+A:.28),w=Hn((h==="mega"?2.75:2.35)+(u?-.1:0),1.9,2.95),C=x+w,L=2.5,P=f?.85:Oy,O=Math.max(_,P+1.55),F=x+(f?.75:1.25),X=E-.55,q=X-(i.heavy?1.45:1.32),N=i.heavy?X+1.35:null,Z=1.02,V=(q+X)/2-.62,Y=[q,X,N].filter(nt=>nt!=null&&nt<E+.1),J=ke(e,"chassis"),Rt=t.darkSteel;for(let nt of[-.48,.48])I(J,.12,.28,E-M-.35,Rt,nt,Z,(M+E)/2+.1);for(let nt=M+1.1;nt<E-.2;nt+=.85)I(J,.95,.16,.1,Rt,0,Z-.02,nt);I(J,1.05,.22,.16,t.darkSteel,0,Z-.02,E-.15);let bt=m?t.tank:t.plasticGray,ie=.31,Lt=Hn(g*.32,.9,1.7),oe=M+2.1+Lt/2;for(let nt of[-1,1]){let St=zt(J,ie,ie,Lt,bt,nt*.92,.72,oe,22);St.rotation.x=gt;let ee=Sn(J,ie+.012,.025,t.darkSteel,nt*.92,.72,oe,20);ee.rotation.y=gt;let ue=zt(J,.09,.09,.05,t.chromeDark,nt*.92,.72,oe+Lt/2-.16,12);ue.rotation.x=gt,r.push({pos:[nt*1.22,.9,oe],label:"\u0422\u043E\u043F\u043B\u0438\u0432\u043D\u044B\u0439 \u0431\u0430\u043A",side:`${nt>0?"\u0441\u043F\u0440\u0430\u0432\u0430":"\u0441\u043B\u0435\u0432\u0430"}`})}k(J,.52,.36,.62,t.plasticGray,-.92,.72,oe-Lt/2-.55),zt(J,.16,.16,.62,t.chromeDark,.9,.62,oe-Lt/2-.6,14).rotation.x=gt;let et=t.rubber;function W(nt,St,ee={}){var Ee,cn;let ue=as(t,{radius:c,width:(Ee=ee.width)!=null?Ee:a.width,style:"truck",rimColor:(cn=ee.rimColor)!=null?cn:a.rimColor,tread:et});return ue.position.set(nt,c,St),ee.flip&&(ue.rotation.y=me),e.add(ue),n.push(ue),ue}let ht=.98;for(let nt of[-1,1])W(nt*ht,F,{flip:nt<0,width:a.width});for(let nt of Y)for(let St of[-1,1])W(St*.74,nt,{width:.32,flip:St<0}),W(St*1.09,nt,{width:.32,flip:St<0});!i.thirdAxle&&Y.length>2&&(Y.length=2);for(let nt of[-1,1]){let St=vf(t,t.plasticGray,c+.065,.6,nt*ht,c+.02,F,nt);St.visible=i.fenders!==!1,e.add(St),Y.forEach((ee,ue)=>{let Ee=vf(t,t.plasticGray,c+.075,.8,nt*.92,c+.02,ee,nt,{flap:ue===Y.length-1});Ee.visible=i.fenders!==!1,e.add(Ee)})}let lt=ke(e,"cab"),ut=P+.72,ot=Math.min(O-.4,P+1.58),It=C,B=d?.42:f?.1:.22;for(let nt of[-1,1]){let St=nt*(p-.06);k(lt,.12,ut-P,w-.1,y,St,(P+ut)/2,(x+It)/2,.045),k(lt,.12,Math.max(.2,O-ot-.02),w-.1,y,St,(ot+O)/2+.01,(x+It)/2,.045),k(lt,.13,ot-ut,.17,y,St,(ot+ut)/2,x+.12,.04),k(lt,.13,ot-ut,.13,t.plastic,St,(ot+ut)/2,It-.12,.04),Pr(lt,{length:w*.82,height:.075,depth:.02,x:nt*(p+.012),y:ut+.16,z:(x+It)/2+.02,accentMat:v,chromeMat:t.chromeDark});let ee=Cr(i,{width:512,height:128});if(ee){let Ee=pn(lt,.56,.14,ee,nt*(p+.022),ut-.5,x+1.28);Ee.rotation.y=nt>0?gt:-gt}let ue=k(lt,.05,.06,.22,m?t.chrome:t.plasticGray,nt*(p+.02),ut-.2,x+1.05,.02);r.push({pos:[nt*(p+.05),ut-.2,x+1.05],label:"\u0414\u0432\u0435\u0440\u044C \u043A\u0430\u0431\u0438\u043D\u044B",side:nt>0?"\u0441\u043F\u0440\u0430\u0432\u0430":"\u0441\u043B\u0435\u0432\u0430"})}k(lt,L-.12,O-P-.04,.1,y,0,(P+O)/2,It-.02,.04),(h==="high"||h==="mega")&&I(lt,.92,.5,.03,t.glassDark,0,O-.62,It-.08);for(let nt of[-.9,-.3,.3,.9])I(lt,.04,O-P-.28,.05,t.plastic,nt,(P+O)/2+.04,It-.09);k(lt,L-.1,.14,w,t.plastic,0,P-.07,(x+It)/2,.04),k(lt,L-.04,.16,w-.02,y,0,O+.02,(x+It)/2,.06),k(lt,L-.3,.12,.5,y,0,O-.12,x+.16,.06);let $=ut-.12,it=ot+.06,dt=x+.06;k(lt,L-.14,$-P,.14,y,0,(P+$)/2,dt,.05),k(lt,L-.14,Math.max(.12,O-it),.2,y,0,(it+O)/2,dt+.05,.06);let xt=Math.max(.5,it-$),Ht=pn(lt,L-.26,xt,t.glass,0,($+it)/2,dt+.03);Ht.rotation.x=-.05;for(let nt of[-1,1]){let St=pn(lt,w-.42,ot-ut,t.glass,nt*(p-.005),(ut+ot)/2,(x+It)/2-.02);St.rotation.y=nt>0?-gt:gt}for(let nt of[-1,1]){if(d){let Li=k(lt,.12,.1,.22,t.plastic,nt*1.34,ot-.02,x+.24,.03),oi=I(lt,.02,.07,.12,t.glassDark,nt*1.41,ot-.02,x+.24),kt=I(lt,.12,.06,.06,t.plastic,nt*1.29,ot-.02,x+.2);r.push({pos:[nt*1.42,ot,x+.24],label:"\u041A\u0430\u043C\u0435\u0440\u0430 \u043E\u0431\u0437\u043E\u0440\u0430"});continue}let St=x+.16,ee=nt*(p+.34),ue=nt*(p+.17);I(lt,.36,.075,.075,m?t.chrome:t.plastic,ue,ot+.06,St),I(lt,.32,.07,.07,m?t.chrome:t.plastic,ue-nt*.02,ot-.5,St),I(lt,.055,.62,.055,m?t.chrome:t.plastic,nt*(p+.03),ot-.22,St),k(lt,.3,.5,.1,t.plastic,ee,ot-.15,St,.035);let Ee=I(lt,.26,.42,.014,t.mirror,ee,ot-.15,St+.052);Ee.name="mirror-glass";let cn=ot-.56;I(lt,.22,.05,.05,m?t.chrome:t.plastic,nt*(p+.22),cn+.16,St),k(lt,.24,.22,.09,t.plastic,ee,cn,St,.03);let ln=I(lt,.2,.16,.013,t.mirror,ee,cn,St+.047);ln.name="mirror-glass",r.push({pos:[ee+nt*.05,ot-.15,St+.06],label:"\u0417\u0435\u0440\u043A\u0430\u043B\u043E",side:nt>0?"\u0441\u043F\u0440\u0430\u0432\u0430":"\u0441\u043B\u0435\u0432\u0430"})}let mt=ke(e,"front"),Bt=u?M+.28:x-.1,Tt=t.chromeDark,U=P+.56,ce=(()=>{let nt=Ar(i.brand,{width:512,height:160,bg:"#14181c",fg:"#f4efe3",accent:i.accent||"#e8b45a",font:"bold 72px Arial, sans-serif",border:!1});return nt?new Se({map:nt,roughness:.4,metalness:.2,side:De}):t.chromeDark})();function Qt(nt,St,ee,ue,Ee,cn=4){I(mt,ee,.055,.08,Tt,nt,St+ue/2-.055/2,Ee),I(mt,ee,.055,.08,Tt,nt,St-ue/2+.055/2,Ee),I(mt,.055,ue,.08,Tt,nt-ee/2+.055/2,St,Ee),I(mt,.055,ue,.08,Tt,nt+ee/2-.055/2,St,Ee),I(mt,ee-2*.055,ue-2*.055,.05,t.plastic,nt,St,Ee+.03);let Li=ue-2*.055-.07;for(let oi=0;oi<cn;oi++){let kt=St+Li/2-(cn===1?0:oi*Li/(cn-1));I(mt,ee-2*.055-.03,.026,.03,Tt,nt,kt,Ee-.025)}}function R(nt,St,ee,ue=.46,Ee=.32){k(mt,ue+.06,Ee+.06,.05,t.rubberTrim,nt,St,ee+.03,.02),k(mt,ue,Ee,.04,t.plastic,nt,St,ee-.005,.02),k(mt,ue*.88,Ee*.5,.03,t.headlight,nt,St+Ee*.06,ee-.035,.01),I(mt,.018,Ee*.46,.02,t.chromeDark,nt,St+Ee*.06,ee-.052),I(mt,ue*.9,.016,.016,t.chromeDark,nt,St+Ee*.32,ee-.05),I(mt,ue*.72,.02,.018,t.headlight,nt,St-Ee*.36,ee-.042);let cn=I(mt,ue*.62,.035,.02,t.amber,nt,St-Ee*.44,ee-.045);o.push(cn)}if(u){(ve=(Gt=k(mt,2.2,.95,A,y,0,P+.48,M+.28+A/2,.16).geometry).dispose)==null||ve.call(Gt),k(mt,2.14,.55,.9,y,0,P+.92,x-.42,.18),Qt(0,P+.5,1.06,.52,Bt-.1,4),pn(mt,.5,.15,ce,0,P+.86,Bt-.12);for(let St of[-1,1])R(St*.86,U,Bt-.05,.4,.28);for(let St of[-1,1])zt(mt,.075,.085,2.3,t.chrome,St*1.16,P+1.35,x-.55,14),zt(mt,.09,.075,.18,t.chromeDark,St*1.16,P+2.52,x-.55,14),I(mt,.03,1.5,.28,t.chromeDark,St*1.16,P+.75,x-.55)}else if(k(mt,2.36,.78,.12,d?t.plasticGray:t.plastic,0,P+.38,Bt-.02,.05),I(mt,2.34,.03,.04,t.chrome,0,P+.76,Bt-.09),I(mt,2.34,.025,.03,t.rubberTrim,0,P+.02,Bt-.08),d){I(mt,2.2,.2,.02,v,0,P+.62,Bt-.1),I(mt,2.16,.075,.03,t.headlight,0,P+.62,Bt-.115);for(let St of[-1,1]){k(mt,.5,.2,.08,t.glassDark,St*.8,P+.28,Bt-.08,.05);let ee=zt(mt,.06,.06,.03,t.headlight,St*.8,P+.28,Bt-.125,18);ee.rotation.x=gt;let ue=I(mt,.34,.04,.02,t.amber,St*.8,P+.17,Bt-.12);o.push(ue)}let nt=zt(mt,.13,.13,.03,t.chrome,0,P+.38,Bt-.125,20);nt.rotation.x=gt}else{Qt(0,P+.3,1.26,.44,Bt-.1,4),pn(mt,.52,.16,ce,0,P+.63,Bt-.11);for(let nt of[-1,1])R(nt*.87,U,Bt-.05)}let b=M+.2,G=.88,K=i.chromeBumper?t.chrome:y,rt=u?M+.3:x-.02;k(mt,2.3,.46,.3,y,0,P-.16,rt,.05),k(mt,2.46,.44,.4,K,0,G,b,.09),k(mt,.62,.22,.03,t.plastic,0,G+.02,b-.19,.01),pn(mt,.52,.13,new Se({map:As("\u0410 001 \u0422\u0421"),roughness:.5,metalness:.1}),0,G+.02,b-.21),I(mt,2.3,.05,.02,t.chrome,0,G+.14,b-.205),I(mt,2.32,.03,.02,t.rubberTrim,0,G-.05,b-.205),k(mt,2.24,.18,.32,t.darkSteel,0,G-.3,b+.02,.05);for(let nt of[-1,1]){k(mt,.32,.42,.44,K,nt*1.15,G,b+.12,.12),I(mt,.16,.3,.62,t.darkSteel,nt*.44,P-.22,b+.36),I(mt,.4,.035,.2,t.rubberTrim,nt*.95,G+.235,b-.03),Sn(mt,.066,.014,t.rubberTrim,nt*.88,G-.13,b-.19,18);let St=zt(mt,.056,.056,.02,t.headlight,nt*.88,G-.13,b-.19,18);St.rotation.x=gt,I(mt,.06,.1,.06,t.darkSteel,nt*.32,G-.26,b-.18)}for(let nt of[-1,1]){let St=x+w*.55;I(e,.42,.05,.5,t.darkSteel,nt*(p-.16),.56,St),I(e,.42,.05,.5,t.darkSteel,nt*(p-.16),.9,St-.02),I(e,.4,.5,.03,t.plastic,nt*(p-.16),.75,St+.26)}let _t=ke(e,"roof"),vt=h==="mega"?.42:h==="high"?.24:.08;if(vt>0){k(_t,L-.18,vt+.1,w-.34,y,0,O+vt/2+.06,(x+It)/2-.08,.09);let nt=k(_t,L-.24,.36,.5,S,0,O+vt+.02,x+.26,.08);nt.rotation.x=-.35}if(i.deflectors)for(let nt of[-1,1]){let St=k(_t,.1,.5,1.15,S,nt*(p-.02),O+.24,It-.5,.05);St.rotation.x=-.22,St.rotation.z=nt*.04}vt>.1&&(k(_t,.62,.06,.62,t.plasticGray,.52,O+vt+.06,It-.75,.03),I(_t,.02,.34,.02,t.darkSteel,-.95,O+vt+.2,It-.55),r.push({pos:[.52,O+vt+.1,It-.75],label:"\u041B\u044E\u043A \u043A\u0430\u0431\u0438\u043D\u044B"}));for(let nt of[-.95,-.5,.5,.95]){let St=Rs(_t,.035,t.amber,nt,O+vt+.12,x+.48,8)}if(!d){let nt=k(_t,L-.3,.1,.22,S,0,O-.12,x-.06,.03);nt.rotation.x=.2}if(i.sideSkirts){let nt=oe-Lt/2-.06,St=Math.min(Y[0]-c-.42,oe+Lt/2+.22),ee=St-nt;if(ee>.4)for(let ue of[-1,1])k(e,.08,.72,ee,S,ue*1.22,.72,(nt+St)/2,.03),I(e,.09,.03,ee-.08,t.rubberTrim,ue*1.22,.37,(nt+St)/2),I(e,.085,.022,ee-.16,v,ue*1.225,.92,(nt+St)/2),I(e,.085,.5,.03,S,ue*1.22,.72,St+.01)}let st=ke(e,"fifth"),ct=1.24;k(st,1.5,.1,1.05,t.darkSteel,0,ct,V,.03);let Ct=k(st,.42,.12,.42,t.steel,0,ct+.04,V+.08,.02),Yt=zt(st,.035,.035,.8,t.chromeDark,-.72,ct-.1,V-.3,8);Yt.rotation.z=gt,r.push({pos:[0,ct+.15,V],label:"\u0421\u0435\u0434\u043B\u043E (\u043F\u044F\u0442\u043E\u0435 \u043A\u043E\u043B\u0435\u0441\u043E)"});for(let nt of[-1,1])I(e,.3,.16,.06,t.taillight,nt*.78,Z+.05,E-.06),I(e,.3,.08,.06,t.amber,nt*.78,Z+.2,E-.06),I(e,.06,.22,.06,t.reverseLight,nt*.6,Z+.05,E-.06);let Mt=As("\u0410 001 \u0422\u0421");Mt&&pn(e,.5,.13,new Se({map:Mt,roughness:.6}),0,.95,E-.08);let Et=By({M:t,unit:i,cabFront:x,cabRear:It,cabW:L,floorY:P,roofY:O,winBottom:ut,winTop:ot,style:l,roofType:h,paint:y,accent:v,anchors:r,isBonnet:u,isLowEntry:f});lt.add(Et.group);let qt={name:"\u0434\u0432\u0435\u0440\u044C \u043A\u0430\u0431\u0438\u043D\u044B",gender:"f"},Jt=p+.006,ae=Lr(e,{...i,category:"trucks"},[{part:qt,side:-1,pos:[-Jt,ut-.56,x+.98],w:.64,h:.42},{part:qt,side:1,pos:[Jt,ut-.56,x+.98],w:.64,h:.42},{part:{name:"\u0431\u043E\u043A\u043E\u0432\u0438\u043D\u0430 \u043A\u0430\u0431\u0438\u043D\u044B",gender:"f"},side:-1,pos:[-Jt,ut-.42,It-.62],w:.52,h:.34},{part:{name:"\u0431\u043E\u043A\u043E\u0432\u0438\u043D\u0430 \u043A\u0430\u0431\u0438\u043D\u044B",gender:"f"},side:1,pos:[Jt,ut-.42,It-.62],w:.52,h:.34},{part:{name:"\u043F\u0435\u0440\u0435\u0434\u043D\u0438\u0439 \u0431\u0430\u043C\u043F\u0435\u0440",gender:"m"},side:1,rotY:me,pos:[.5,.62,M+.01],w:.5,h:.26},{part:{name:"\u043F\u0435\u0440\u0435\u0434\u043D\u0438\u0439 \u0431\u0430\u043C\u043F\u0435\u0440",gender:"m"},side:-1,rotY:me,pos:[-.5,.62,M+.01],w:.5,h:.26},{part:{name:"\u043F\u043E\u0440\u043E\u0433 \u043A\u0430\u0431\u0438\u043D\u044B",gender:"m"},side:-1,pos:[-Jt,P-.06,x+.42],w:.5,h:.26},{part:{name:"\u0431\u043E\u043A\u043E\u0432\u0438\u043D\u0430 \u0431\u0430\u043A\u0430",gender:"f"},side:1,pos:[.92+ie+.004,.72,oe],w:.44,h:.28},{part:{name:"\u0431\u043E\u043A\u043E\u0432\u0438\u043D\u0430 \u0431\u0430\u043A\u0430",gender:"f"},side:-1,pos:[-(.92+ie+.004),.72,oe],w:.44,h:.28},{part:{name:"\u0437\u0430\u0434\u043D\u044F\u044F \u0441\u0442\u0435\u043D\u043A\u0430 \u043A\u0430\u0431\u0438\u043D\u044B",gender:"f"},side:1,rotY:0,pos:[.42,P+1.05,It+.03],w:.6,h:.46},{part:{name:"\u043A\u0440\u044B\u0448\u0430 \u043A\u0430\u0431\u0438\u043D\u044B",gender:"f"},side:0,rotX:-gt,rotY:0,pos:[.34,O+.015,It-.95],w:.7,h:.5},{part:{name:"\u0441\u0435\u0434\u043B\u043E",gender:"n"},side:0,rotX:-gt,rotY:0,pos:[.2,ct+.02,V],w:.5,h:.4},{part:{name:"\u0437\u0430\u0434\u043D\u044F\u044F \u0440\u0430\u043C\u0430",gender:"f"},side:-1,pos:[-.545,Z,E-.55],w:.46,h:.26},{part:{name:"\u0437\u0430\u0434\u043D\u044F\u044F \u0440\u0430\u043C\u0430",gender:"f"},side:1,pos:[.545,Z,E-.55],w:.46,h:.26},{part:{name:"\u0437\u0430\u0434\u043D\u0438\u0439 \u0431\u0440\u044B\u0437\u0433\u043E\u0432\u0438\u043A",gender:"m"},side:1,rotY:0,pos:[.5,.34,Y[Y.length-1]+c+.07],w:.5,h:.4}]);for(let nt of ae.list)r.push({pos:nt.patch.position.clone().toArray(),label:`\u041F\u043E\u0432\u0440\u0435\u0436\u0434\u0435\u043D\u0438\u0435: ${nt.spec.label}`,damage:!0});let H=P+1.02,at=[{id:"driver",label:"\u041C\u0435\u0441\u0442\u043E \u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044F",group:"interior",pos:[-.46+.06,P+1.16,x+1.3],target:[-.24,P+.12,x-2],fov:74,orbit:!1,seat:!0},{id:"passenger",label:"\u041C\u0435\u0441\u0442\u043E \u043F\u0430\u0441\u0441\u0430\u0436\u0438\u0440\u0430",group:"interior",pos:[.6,P+1.3,x+1.06],target:[-.45,P+.8,x-5],fov:70,orbit:!1,seat:!0}];return(h==="high"||h==="mega"||h==="sleeper")&&at.push({id:"bunk",label:"\u0421\u043F\u0430\u043B\u044C\u043D\u043E\u0435 \u043C\u0435\u0441\u0442\u043E",group:"interior",pos:[.3,P+1.66,C-.5],target:[-.34,P+1.02,x+1.1],fov:74,orbit:!0,seat:!0}),at.push({id:"exterior",label:"\u0421\u043D\u0430\u0440\u0443\u0436\u0438",group:"exterior",pos:[7.6,3.1,-8.2],target:[0,1.45,.4],fov:38,orbit:!0,autoRotate:!0}),at.push({id:"side",label:"\u0411\u043E\u0440\u0442",group:"exterior",pos:[10.5,1.9,.6],target:[0,1.5,.3],fov:34,orbit:!0}),at.push({id:"rear",label:"\u0421\u0437\u0430\u0434\u0438",group:"exterior",pos:[-5.6,3.2,8.4],target:[0,1.5,.6],fov:40,orbit:!0}),{root:e,wheels:n,paintMats:s,views:at,anchors:r,layout:{frontZ:M,rearEnd:E,cabFront:x,cabRear:It,roofY:O,floorY:P,fifthWheelZ:V,plateY:ct,rearAxle1:q,rearAxle2:X,wheelRadius:c,cabWidth:L},kind:"truck",damage:ae}}function By(i){let{M:t,cabFront:e,cabRear:n,cabW:s,floorY:r,roofY:o,winBottom:a,winTop:c,roofType:l,paint:h,accent:u,anchors:d,style:f,isLowEntry:_}=i,g=ke(null,"interior"),m=(e+n)/2,p=t.interiorDark,y=t.interiorMid,S=i.unit.luxury?t.leatherBeige:t.leather,v=s-.2,M=k(g,v,.03,n-e-.16,t.rubberTrim,0,r+.02,m,.02);k(g,v-.02,.05,n-e-.2,t.interiorMid,0,o-.09,m,.02);for(let W of[-1,1])k(g,.055,.7,n-e-.5,p,W*(s/2-.16),r+.42,m+.02,.02),k(g,.14,.1,.62,S,W*(s/2-.19),r+.62,e+1.02,.03),k(g,.03,.04,.16,t.chromeDark,W*(s/2-.23),r+.72,e+1,.01);k(g,v,o-r-.2,.06,y,0,(r+o)/2,n-.16,.03);let E=e+.3,A=r+.68,x=-.48,w=e+.56,C=i.unit.luxury?t.wood:t.chromeDark;k(g,v-.02,A-r,.3,p,0,(r+A)/2,e+.12,.04);let L=k(g,v-.02,.16,.52,t.plasticGray,0,A-.05,e+.34,.12);L.rotation.x=.05,k(g,v-.08,.045,.06,t.plasticGray,0,A+.05,e+.58,.03);let P=k(g,v-.04,.66,.12,t.interiorMid,0,r+.38,w-.05,.03);P.rotation.x=-.06;let O=k(g,v-.08,.34,.3,t.interiorDark,0,r+.18,e+.4,.05);O.rotation.x=.16,I(g,v-.12,.035,.03,C,0,r+.14,w+.01),I(g,v-.16,.012,.012,t.chromeDark,0,r+.09,w+.012),I(g,v-.16,.01,.01,t.plasticGray,0,r+.66,w+.01);let F=x-.02,X=r+.5,q=w+.02,N=k(g,.98,.09,.28,t.interiorDark,F,X+.28,q-.06,.05);N.rotation.x=.28,k(g,.94,.5,.09,t.plastic,F,X,q,.03);function Z(W,ht,lt,ut=9){let ot=zt(g,lt,lt,.02,t.plastic,W,ht,q+.06,24);ot.rotation.x=gt,Sn(g,lt+.004,.008,t.chromeDark,W,ht,q+.073,22);for(let $=0;$<=ut;$++){let it=-me*.78+$/ut*me*1.56,dt=I(g,lt*.05,lt*.15,.006,t.plasticLight,W+Math.cos(it)*lt*.8,ht+Math.sin(it)*lt*.8,q+.075);dt.rotation.z=it-gt}let It=I(g,lt*.045,lt*.78,.006,t.taillight,W+Math.cos(-me*.3)*lt*.39,ht+Math.sin(-me*.3)*lt*.39,q+.08);It.rotation.z=-me*.3-gt;let B=zt(g,lt*.1,lt*.1,.02,t.chromeDark,W,ht,q+.082,12);B.rotation.x=gt}Z(F-.19,X+.04,.115,9),Z(F+.19,X+.04,.105,9),Z(F,X-.18,.045,6),I(g,.13,.045,.02,t.dashScreen,F,X+.18,q+.075);let V=.08;k(g,.56,.64,.16,t.interiorDark,V,r+.4,w,.05),k(g,.48,.3,.03,t.plastic,V,r+.56,w+.075,.02),k(g,.42,.24,.02,t.dashScreen,V,r+.56,w+.092,.01),I(g,.46,.012,.012,t.chromeDark,V,r+.38,w+.09);for(let W of[-.13,.13]){k(g,.16,.07,.03,t.plastic,V+W,r+.72,w+.09,.015);for(let ht=-1;ht<=1;ht++)I(g,.012,.05,.012,t.chromeDark,V+W+ht*.045,r+.72,w+.105)}for(let W=0;W<3;W++){let ht=zt(g,.04,.04,.03,t.plastic,V-.13+W*.13,r+.36,w+.09,18);ht.rotation.x=gt;let lt=zt(g,.048,.048,.012,t.chromeDark,V-.13+W*.13,r+.36,w+.078,20);lt.rotation.x=gt,I(g,.008,.026,.008,t.plasticLight,V-.13+W*.13,r+.375,w+.105)}for(let W=0;W<5;W++)I(g,.064,.045,.02,t.plasticGray,V-.15+W*.075,r+.24,w+.085),I(g,.03,.008,.008,W===0?t.taillight:W===4?u:t.amber,V-.15+W*.075,r+.25,w+.097);k(g,.6,.24,.04,t.plasticGray,.78,r+.36,w+.02,.02),I(g,.52,.02,.02,t.plastic,.78,r+.45,w+.045),k(g,.14,.035,.03,t.chromeDark,.78,r+.37,w+.05,.01),k(g,.18,.08,.03,t.plastic,1.02,r+.66,w+.02,.02);for(let W=-1;W<=1;W++)I(g,.012,.055,.012,t.chromeDark,1.02+W*.05,r+.66,w+.04);k(g,.16,.08,.03,t.plastic,-1.02,r+.68,w+.02,.02);for(let W=-1;W<=1;W++)I(g,.012,.05,.012,t.chromeDark,-1.02+W*.045,r+.68,w+.04);let Y=ke(g,"steering");Y.position.set(x,r+.7,w+.15),Y.rotation.x=-.5,Sn(Y,.215,.03,t.leather,0,0,0,40);let J=k(Y,.17,.12,.07,t.plastic,0,0,.012,.035),Rt=zt(Y,.036,.036,.014,u,0,.01,.05,18);Rt.rotation.x=gt;for(let W of[0,me,-gt]){let ht=I(Y,.055,.15,.024,t.plasticGray,Math.cos(W)*.105,Math.sin(W)*.105,.004);ht.rotation.z=W-gt;let lt=I(Y,.03,.13,.008,t.chromeDark,Math.cos(W)*.105,Math.sin(W)*.105,.019);lt.rotation.z=W-gt}I(Y,.11,.02,.02,t.chromeDark,0,-.16,.01);let bt=k(g,.13,.12,.34,t.plastic,x,r+.54,w-.02,.04);bt.rotation.x=.45;for(let W of[-1,1]){let ht=zt(g,.014,.014,.16,t.chromeDark,x+W*.16,r+.7,w-.02,8);ht.rotation.z=gt,Rs(g,.026,t.plastic,x+W*.24,r+.7,w-.02,10)}let ie=zt(g,.028,.028,.02,u,.5,r+.3,w+.1,16);if(ie.rotation.x=gt,zt(g,.036,.036,.014,t.chromeDark,.5,r+.3,w+.088,18).rotation.x=gt,f==="euro"){let W=k(g,.1,.05,.14,t.plasticGray,.42,r+.2,w+.16,.02);I(g,.06,.012,.012,u,.42,r+.225,w+.225)}d.push({pos:[x,r+.8,w-.3],label:"\u0420\u0443\u043B\u044C \u0438 \u043F\u0440\u0438\u0431\u043E\u0440\u044B"}),d.push({pos:[V,r+.6,w+.1],label:"\u041C\u0443\u043B\u044C\u0442\u0438\u043C\u0435\u0434\u0438\u0430"});function Lt(W,ht,{recline:lt=.12,luxury:ut=!1}={}){let ot=ke(g),It=k(ot,.56,.16,.56,ut?S:t.fabric,0,r+.28,0,.05);for(let xt of[-1,1])k(ot,.09,.16,.54,ut?S:t.fabric,xt*.28,r+.33,0,.04);let B=k(ot,.54,.72,.16,ut?S:t.fabric,0,r+.66,.24,.06);B.rotation.x=lt;for(let xt of[-1,1]){let Ht=k(ot,.08,.62,.14,ut?S:t.fabric,xt*.26,r+.68,.24,.05);Ht.rotation.x=lt}let $=k(ot,.34,.2,.14,ut?S:t.fabric,0,r+1.14,.32,.06),it=zt(ot,.11,.13,.16,t.rubberTrim,0,r+.18,.02,14),dt=I(ot,.07,.72,.02,t.plasticGray,-.22,r+.72,.36);dt.rotation.x=lt,dt.rotation.z=-.12;for(let xt of[-1,1])I(ot,.02,.16,.02,t.chromeDark,xt*.11,r+1.02,.33);return ot.position.set(W,0,ht),ot}let oe=Lt(-.46,e+1.02,{recline:.14,luxury:!!i.unit.luxury});if(d.push({pos:[-.46,r+.62,e+1.02],label:"\u0421\u0438\u0434\u0435\u043D\u044C\u0435 \u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044F"}),Lt(.56,e+1,{recline:.1,luxury:!!i.unit.luxury}),l==="high"||l==="mega"||l==="sleeper"){let ht=n-.46-.1,lt=r+.96;k(g,v-.12,.1,.92,t.interiorMid,0,lt,ht,.02),k(g,v-.24,.16,.92-.08,t.leatherBeige,0,lt+.12,ht,.05),k(g,.46,.11,.3,t.plasticLight,-.28,lt+.24,n-.26,.04),k(g,v-.36,.07,.34,t.accent("#5a6b57"),.02,lt+.23,ht+.2,.03);for(let ut of[-1,1])k(g,.02,.52,.92-.1,t.fabric,ut*(v/2-.06),lt+.34,ht,.01);if(d.push({pos:[0,lt+.3,n-.35],label:"\u0421\u043F\u0430\u043B\u044C\u043D\u043E\u0435 \u043C\u0435\u0441\u0442\u043E"}),l==="mega"){k(g,v-.2,.09,1.3,t.interiorMid,0,r+1.86,n-.72,.02),k(g,v-.3,.12,1.2,t.leatherBeige,0,r+1.95,n-.72,.03);for(let ut of[-1,1])I(g,.03,.62,.03,t.steel,ut*.34,r+1.4,n-.16);for(let ut=0;ut<3;ut++)I(g,.72,.03,.03,t.steel,0,r+1.2+ut*.24,n-.16)}}if(l==="mega"||i.unit.luxury){let W=k(g,.5,.8,.55,t.interiorMid,-1,r+.55,n-.55,.04),ht=k(g,.42,.5,.5,t.plasticGray,1,r+.42,n-.5,.04);I(g,1.6,.05,.5,t.wood||t.plasticLight,0,r+.95,n-.5),d.push({pos:[1,r+.6,n-.5],label:"\u0425\u043E\u043B\u043E\u0434\u0438\u043B\u044C\u043D\u0438\u043A"})}k(g,.3,.06,.06,t.plasticLight,.6,o-.18,m,.02);let et=zt(g,.08,.08,.04,t.headlight,0,o-.12,m+.4,14);et.rotation.x=gt;for(let W of[-1,1]){let ht=k(g,.62,.16,.03,t.plasticLight,W*.5,c+.05,e+.22,.02);ht.rotation.x=-.25}for(let[W,ht]of[[-.64,.1],[-.44,.16],[-.22,.1]]){let lt=I(g,ht,.03,.16,t.steel,W,r+.16,e+.55);lt.rotation.x=.5}return k(g,.6,.025,.3,t.interiorMid,.55,A+.03,E-.04,.01),I(g,.56,.008,.008,t.chromeDark,.55,A+.045,E+.11),k(g,.4,.28,.4,t.interiorMid,.5,r+.3,e+1.7,.03),{group:g}}function ky(i){var C,L,P;let t=(C=i.length)!=null?C:4.7,e=(L=i.width)!=null?L:1.84,n=(P=i.height)!=null?P:1.44,s=i.style||"sedan",r=s==="coupe"||s==="sport",o=s==="van",a=s==="pickup",c=s==="suv"||a||s==="crossover",l=s==="micro",h=s==="wagon",u=-t/2,d=t/2,f=.26,_=n*(r?.78:o?.62:.66),g=n*(c?.58:o?.46:r?.66:.56),m=n*(c?.5:r?.58:.46),p=n*(c?.7:o?.62:r?.72:.62),y=u+t*(o?.2:c?.24:.27),S=u+t*(o?.3:c?.34:r?.3:.31),v=S+(n-g)*(o?.7:c?.85:1.05),M=d-t*(h?.05:o?.03:a?.36:c?.13:r?.4:.31),E=M+(n-p)*(o?.35:c?.5:r?1.6:.95),A=Math.min(E,d-.1),x=a?M+.16:null,w=a?p-.06:null;return{L:t,W:e,H:n,style:s,sport:r,wagon:h,van:o,pickup:a,suv:c,micro:l,front:u,rear:d,ground:f,belt:_,hoodY:g,deckY:p,noseY:m,hoodZ:y,wsBase:S,wsTopZ:v,roofRearZ:M,rearBaseZ:A,bedFrom:x,bedY:w}}function zy(i){let{front:t,rear:e,noseY:n,hoodY:s,hoodZ:r,wsBase:o,wsTopZ:a,roofRearZ:c,rearBaseZ:l,deckY:h,H:u}=i,d=[],f=(_,g,m,p=0)=>{for(let y=0;y<=m;y++){let S=y/m,v=os(_[0],g[0],S),M=os(_[1],g[1],S)+Math.sin(S*me)*p;d.push([v,M])}};return d.push([t,n]),f([t,n],[t+.05,n+.03],1),f([t+.05,n+.03],[r,s],4,.035),f([r,s],[o,s+.035],1),f([o,s+.035],[a,u-.015],1),f([a,u-.015],[c,u-.02],4,.015),f([c,u-.02],[l,h],3),f([l,h],[e,h-.02],2),d}function Hy(i,t,e){for(let n=0;n<i.length-1;n++){let[s,r]=i[n],[o,a]=i[n+1];if(t>=s&&t<=o||t>=o&&t<=s){let c=Math.abs(o-s)<1e-6?0:(t-s)/(o-s);return os(r,a,Hn(c,0,1))}}return e}function Vy(i,{root:t,paint:e,paintDark:n,black:s,belt:r,halfW:o,M:a}){let{roofRearZ:c,rear:l,bedY:h,L:u,W:d}=i,f=c+.12,_=l-.06,g=_-f,m=(f+_)/2,p=.42,y=h+p/2;I(t,d-.16,.06,g,a.plasticGray,0,h-.01,m);for(let S of[-1,1])k(t,.09,p,g,e,S*(o-.06),y,m,.02),I(t,.11,.035,g,n,S*(o-.06),h+p-.02,m);k(t,d-.1,p,.09,e,0,y,_,.02),I(t,d-.08,.035,.11,n,0,h+p-.02,_),k(t,d-.12,p+.08,.08,e,0,h+p/2+.02,f-.02,.02);for(let S=0;S<6;S++)I(t,d-.22,.012,.035,a.steel,0,h+.025,f+.18+S*(g-.3)/5);for(let S of[-1,1])k(t,.26,.1,.04,a.taillight,S*(o-.28),h-.02,_+.04,.02)}function Fo(i,t,e={}){var Ht,mt,Bt;let n=e.simple===!0,s=ky(i),{L:r,W:o,H:a,front:c,rear:l,belt:h,ground:u}=s,d=zy(s),f=(Ht=i.wheelRadius)!=null?Ht:.33,_=(mt=i.wheelWidth)!=null?mt:.23,g=(Bt=i.wheelbase)!=null?Bt:r*.58,m=o/2,p=i.paint||"#2f5d8a",y=i.accent||"#d8d5c8",S=ke(null,`car:${i.id}`),v=[],M=[],E=null,A=[],x=t.paint(p,{metalness:.5,roughness:.26}),w=new te(p).multiplyScalar(.78),C=t.paint(w,{metalness:.4,roughness:.42}),L=t.accent(y),P=t.chrome,O=t.plastic;A.push(x,C,L);let F=.09,X=m-F/2,q=[-g/2,g/2],N=u+.08,Z=h,V=s.wsBase+Math.max(.16,r*.035),Y=s.pickup?s.roofRearZ-.04:s.rearBaseZ-Math.max(.14,r*.03),J=os(V,Y,s.van?.34:.47),Rt=s.van||s.micro?.22:.09,bt=Tt=>Math.max(Z+.07,Hy(d,Tt,a)-.075),ie=[{z0:V,z1:J-Rt/2},{z0:J+Rt/2,z1:Y}].filter(Tt=>Tt.z1-Tt.z0>.24),Lt=new lr,oe=s.pickup?[...d.filter(([Tt])=>Tt<=s.roofRearZ+.001),[s.roofRearZ+.1,s.bedY+.02],[l-.06,s.bedY+.02]]:d,et=[[c,u],...oe,[l,u]],W=f+.05,ht=f+.02;Lt.moveTo(et[0][0],et[0][1]);for(let Tt=1;Tt<et.length-1;Tt++)Lt.lineTo(et[Tt][0],et[Tt][1]);Lt.lineTo(et[et.length-2][0],et[et.length-2][1]),Lt.lineTo(l,u);for(let Tt of[...q].sort((U,ce)=>ce-U)){Lt.lineTo(Tt+W,u),Lt.lineTo(Tt+W,ht);let U=16;for(let ce=1;ce<=U;ce++){let Qt=ce/U*me;Lt.lineTo(Tt+Math.cos(Qt)*W,ht+Math.sin(Qt)*W)}Lt.lineTo(Tt-W,ht),Lt.lineTo(Tt-W,u)}Lt.lineTo(c,u),Lt.closePath();for(let Tt of ie){let U=new xs,ce=8,Qt=[[Tt.z0,Z+.02]];for(let R=0;R<=ce;R++){let b=os(Tt.z0,Tt.z1,R/ce);Qt.push([b,bt(b)])}Qt.push([Tt.z1,Z+.02]),U.moveTo(Qt[0][0],Qt[0][1]);for(let R=1;R<Qt.length;R++)U.lineTo(Qt[R][0],Qt[R][1]);U.closePath(),Lt.holes.push(U)}if(n){for(let Tt of q)for(let U of[-1,1]){let ce=as(t,{radius:f,width:_,style:"car",rimColor:"#b9bfc4"});ce.position.set(U*(m-_*.55),f,Tt),U<0&&(ce.rotation.y=me),S.add(ce)}I(S,o*.9,.1,r*.9,O,0,.2,0)}else{let Qt=function(kt,se,Ue=0){let je=[];for(let[we,ze]of kt){let Is=Hn((ze-h)/Math.max(.2,a-h),0,1),Ls=(m-.015+Ue)*(1-.055*Is*Is);je.push(-Ls,ze,we,Ls,ze,we)}let hn=[];for(let we=0;we<kt.length-1;we++){let ze=we*2;hn.push(ze,ze+1,ze+2,ze+1,ze+3,ze+2)}let un=hn,rn=new Ge;rn.setAttribute("position",new ye(je,3)),rn.setIndex(un),rn.computeVertexNormals();let mn=se.clone?se.clone():se;mn.side=De,S.add(new Dt(rn,mn))},Tt=new fo(Lt,{depth:F,bevelEnabled:!0,bevelThickness:.01,bevelSize:.01,bevelSegments:1,curveSegments:10});Tt.rotateY(-gt),Tt.computeBoundingBox();let U=Tt.boundingBox,ce=m-U.max.x;Tt.translate(ce,0,0);for(let kt of[-1,1]){let se=new Dt(Tt,x);kt<0&&(se.scale.x=-1),se.castShadow=!0,S.add(se)}let R=(kt,se)=>Math.abs(kt-se)<1e-4,b=kt=>d.findIndex(([se])=>R(se,kt)),G=b(s.wsBase),K=b(s.wsTopZ),rt=b(s.roofRearZ),_t=b(s.rearBaseZ),vt=d.slice(0,G+1),st=d.slice(K,rt+1),ct=d.slice(_t);s.pickup?(Qt([...st,[s.roofRearZ+.16,s.bedY+.02]],x),Qt(vt,x),Vy(s,{root:S,paint:x,paintDark:C,black:O,belt:h,halfW:m,M:t})):(Qt(vt,x),Qt(st,x),Qt(ct,x));let Ct=new Ai({color:10470612,metalness:.08,roughness:.06,transparent:!0,opacity:.3,envMapIntensity:1.8,side:De,depthWrite:!1}),Yt=(kt,se,Ue,je,hn,un)=>{let rn=Ue-kt,mn=je-se,we=Math.hypot(rn,mn)||1,ze=0,Is=rn/we,Ls=-mn/we,nu=ze*un,Ds=Is*un,ls=Ls*un,T=new Ge,z=[-m*hn,se+Ds,kt+ls,m*hn,se+Ds,kt+ls,-m*hn,je+Ds,Ue+ls,m*hn,je+Ds,Ue+ls];T.setAttribute("position",new ye(z,3)),T.setIndex([0,1,2,1,3,2]),T.computeVertexNormals();let tt=new Dt(T,Ct);tt.renderOrder=2,S.add(tt)};Yt(s.wsBase+.02,s.hoodY-.045,s.wsTopZ+.015,a-.012,.965,.02),s.pickup?Yt(s.roofRearZ+.01,a-.02,s.roofRearZ+.14,s.deckY-.05,.925,.02):Yt(s.roofRearZ+.015,a-.012,s.rearBaseZ+.04,s.deckY-.05,.945,.02);for(let[kt,se,Ue,je,hn]of[[s.wsBase+.02,s.hoodY-.045,s.wsTopZ+.015,a-.012,.965],[s.roofRearZ+.015,a-.012,s.rearBaseZ+.04,s.deckY-.05,.945]])for(let un of[-1,1]){let rn=Ue-kt,mn=je-se,we=Math.hypot(rn,mn)||1,ze=I(S,.035,.035,we,O,un*m*hn,(se+je)/2,(kt+Ue)/2);ze.rotation.x=-Math.atan2(mn,Math.abs(rn)),ze.position.y+=.01}let Mt=new Dt(new Cn(o-.06,r-.16),t.plastic);Mt.rotation.x=-gt,Mt.position.y=u-.004,S.add(Mt);for(let kt of q)for(let se of[-1,1]){let Ue=as(t,{radius:f,width:_,style:"car",rimColor:s.sport?"#2b2f33":"#c3c9cd",tread:t.rubber,spokes:s.sport?5:6});Ue.position.set(se*(m-_*.52),f,kt),se<0&&(Ue.rotation.y=me),S.add(Ue),v.push(Ue);let je=new Dt(new vn(f+.06,.018,5,20,me),O);je.position.set(se*(m+.012),f+.02,kt);let hn=new Dt(new Ie(f+.055,f+.055,.2,16,1,!0,0,me),t.plastic);hn.rotation.z=gt,hn.position.set(se*(m-.16),f+.02,kt),S.add(hn),je.rotation.y=se>0?-gt:gt,S.add(je)}let Et=q[0]+f+.1,qt=q[1]-f-.1,Jt=Math.max(.34,qt-Et),ae=(Et+qt)/2;for(let kt of[-1,1])k(S,.055,.085,Jt,O,kt*(m+.001),u+.1,ae,.02),I(S,.02,.026,Jt,C,kt*(m+.012),h-.26,ae),I(S,.014,.016,Jt*.96,P,kt*(m+.012),h-.2,ae);for(let kt of ie)for(let se of[-1,1]){let Ue=[],je=[];for(let we=0;we<=8;we++){let ze=os(kt.z0,kt.z1,we/8);Ue.push(se*(m-.016),Z+.006,ze)}for(let we=0;we<=8;we++){let ze=os(kt.z0,kt.z1,we/8);Ue.push(se*(m-.016),bt(ze)+.012,ze)}let un=9;for(let we=0;we<un-1;we++)je.push(we,we+1,un+we,we+1,un+we+1,un+we);let rn=new Ge;rn.setAttribute("position",new ye(Ue,3)),rn.setIndex(je),rn.computeVertexNormals();let mn=new Dt(rn,t.glass);mn.name="side-glass",S.add(mn)}for(let kt of[-1,1]){let se=Math.max(.25,bt(J)-Z);I(S,.02,se,Rt,O,kt*(m+.004),Z+se/2,J)}let H=c+.075,Pt=s.noseY+.08,at=Math.max(.2,Pt-u+.04);k(S,o-.02,at,.11,x,0,u+at/2-.02,H,.03);let At=Math.max(.2,s.deckY-u+.02);k(S,o-.02,At,.11,x,0,u+At/2-.02,l-.055,.03);let wt=c-.004,ft=s.noseY-.11,Xt=Math.min(.3,Math.max(.12,ft-u-.16)),Gt=ft-Xt,ve=(ft+Gt)/2;k(S,o*.4,Xt+.035,.05,O,0,ve,wt-.03,.018);let nt=4;for(let kt=0;kt<nt;kt++){let se=nt===1?.5:kt/(nt-1);I(S,o*.36,.011,.012,P,0,Gt+.025+se*(Xt-.05),wt-.058)}let St=zt(S,Math.min(.052,Xt*.3),Math.min(.052,Xt*.3),.014,P,0,ve,wt-.06,20);St.rotation.x=gt;for(let kt of[-1,1]){k(S,o*.31,.095,.055,t.headlight,kt*m*.63,s.noseY-.055,wt-.018,.018),I(S,.25,.012,.016,P,kt*m*.63,s.noseY-.108,wt-.042),I(S,.1,.034,.042,t.amber,kt*m*.85,s.noseY-.105,wt-.02);let se=zt(S,.038,.038,.022,t.headlight,kt*m*.6,u+.14,wt-.03,10);se.rotation.x=gt}k(S,o*.99,.2,.24,C,0,u+.11,c-.1,.05),k(S,o*.66,.075,.06,O,0,u+.03,c-.16,.02);for(let kt of[-1,1])k(S,.38,.12,.08,t.taillight,kt*m*.66,s.deckY-.08,l+.03,.02),I(S,.18,.045,.03,t.reverseLight,kt*m*.56,s.deckY-.17,l+.045);let ee=As("\u041E 777 \u0410\u0410");if(ee){let kt=new Se({map:ee,roughness:.55}),se=Math.max(u+.4,s.deckY-.42);k(S,.45,.13,.03,O,0,se,l+.03,.012);let Ue=pn(S,.42,.11,kt,0,se,l+.047);Ue.renderOrder=1}if(k(S,o*.98,.22,.18,C,0,u+.16,l+.08,.05),s.sport){for(let kt of[-1,1]){let se=zt(S,.048,.048,.1,P,kt*.3,u+.08,l-.02,12);se.rotation.x=gt}k(S,o*.76,.03,.24,x,0,a+.13,s.roofRearZ-.12,.02);for(let kt of[-1,1])I(S,.035,.15,.1,O,kt*o*.27,a+.06,s.roofRearZ-.12)}let ue=s.wsBase+.06;for(let kt of[-1,1]){I(S,.14,.04,.05,O,kt*(m+.02),h+.05,ue),k(S,.15,.085,.1,x,kt*(m+.085),h+.07,ue,.03),I(S,.018,.055,.075,t.mirror,kt*(m+.155),h+.07,ue);for(let se of[V+.5,J+.02]){let Ue=Math.min(se,Y-.18);k(S,.03,.038,.15,P,kt*(m+.008),h-.12,Ue,.02)}}let Ee=Cr({...i,brand:i.brand||"ASTER",accent:y},{width:512,height:128,font:"bold 54px Arial, sans-serif"});if(Ee)for(let kt of[-1,1]){let se=pn(S,.54,.135,Ee,kt*(m+.03),u+.33,s.wsBase-.35);se.rotation.y=kt>0?-gt:gt}let cn=t.accent(y);for(let kt of[-1,1])Pr(S,{length:Math.max(.8,Y-V+.2),height:.03,depth:.016,x:kt*(m+.008),y:h-.055,z:(V+Y)/2,accentMat:cn,chromeMat:t.chrome});let ln=m+.012,Li=(V+J)/2,oi=(J+Y)/2;E=Lr(S,{...i,category:"cars"},[{part:{name:"\u043F\u0435\u0440\u0435\u0434\u043D\u044F\u044F \u0434\u0432\u0435\u0440\u044C",gender:"f"},side:-1,pos:[-ln,h-.2,Li],w:.54,h:.3},{part:{name:"\u043F\u0435\u0440\u0435\u0434\u043D\u044F\u044F \u0434\u0432\u0435\u0440\u044C",gender:"f"},side:1,pos:[ln,h-.2,Li],w:.54,h:.3},{part:{name:"\u0437\u0430\u0434\u043D\u044F\u044F \u0434\u0432\u0435\u0440\u044C",gender:"f"},side:-1,pos:[-ln,h-.45,oi],w:.46,h:.28},{part:{name:"\u0437\u0430\u0434\u043D\u044F\u044F \u0434\u0432\u0435\u0440\u044C",gender:"f"},side:1,pos:[ln,h-.45,oi],w:.46,h:.28},{part:{name:"\u043A\u0430\u043F\u043E\u0442",gender:"m"},side:0,rotX:-gt,rotY:0,pos:[.3,s.hoodY+.015,(c+s.wsBase)/2],w:.6,h:.44},{part:{name:"\u043A\u0440\u044B\u0448\u0430",gender:"f"},side:0,rotX:-gt,rotY:0,pos:[-.2,a+.012,s.wsTopZ+(s.roofRearZ-s.wsTopZ)*.42],w:.56,h:.4},{part:{name:"\u043A\u0440\u044B\u0448\u043A\u0430 \u0431\u0430\u0433\u0430\u0436\u043D\u0438\u043A\u0430",gender:"f"},side:0,rotX:-gt,rotY:0,pos:[.2,s.deckY+.015,(s.rearBaseZ+l)/2],w:.54,h:.4},{part:{name:"\u043F\u0435\u0440\u0435\u0434\u043D\u0438\u0439 \u0431\u0430\u043C\u043F\u0435\u0440",gender:"m"},side:1,rotY:me,pos:[.45,u+.2,c-.02],w:.5,h:.24},{part:{name:"\u0437\u0430\u0434\u043D\u0438\u0439 \u0431\u0430\u043C\u043F\u0435\u0440",gender:"m"},side:-1,rotY:0,pos:[-.42,u+.22,l+.02],w:.5,h:.24},{part:{name:"\u043F\u0435\u0440\u0435\u0434\u043D\u0435\u0435 \u043A\u0440\u044B\u043B\u043E",gender:"n"},side:-1,pos:[-ln,h-.15,q[0]+.04],w:.44,h:.16},{part:{name:"\u0437\u0430\u0434\u043D\u0435\u0435 \u043A\u0440\u044B\u043B\u043E",gender:"n"},side:1,pos:[ln,h-.15,q[1]-.04],w:.44,h:.16},{part:{name:"\u043F\u043E\u0440\u043E\u0433",gender:"m"},side:-1,pos:[-ln,u+.16,(q[0]+q[1])/2],w:.5,h:.22},{part:{name:"\u0431\u043E\u0440\u0442 \u043A\u0430\u043F\u043E\u0442\u0430",gender:"m"},side:1,pos:[ln,s.hoodY-.12,(c+s.wsBase)/2],w:.46,h:.26},{part:{name:"\u0437\u0430\u0434\u043D\u044F\u044F \u0441\u0442\u043E\u0439\u043A\u0430",gender:"f"},side:-1,pos:[-ln,h-.12,Y+.12],w:.24,h:.22},{part:{name:"\u043B\u044E\u0447\u043E\u043A \u0431\u0435\u043D\u0437\u043E\u0431\u0430\u043A\u0430",gender:"m"},side:1,pos:[ln,h-.44,Y+.34],w:.3,h:.24}]);for(let kt of E.list)M.push({pos:kt.patch.position.clone().toArray(),label:`\u041F\u043E\u0432\u0440\u0435\u0436\u0434\u0435\u043D\u0438\u0435: ${kt.spec.label}`,damage:!0});M.push({pos:[0,a+.06,s.roofRearZ-.35],label:"\u041A\u0440\u044B\u0448\u0430"}),M.push({pos:[X,h+.12,J],label:"\u0414\u0432\u0435\u0440\u044C \u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044F"}),M.push({pos:[0,ve,c],label:"\u0420\u0435\u0448\u0451\u0442\u043A\u0430 \u0438 \u0444\u0430\u0440\u044B"}),M.push({pos:[0,s.deckY-.15,l],label:"\u041A\u043E\u0440\u043C\u043E\u0432\u0430\u044F \u0447\u0430\u0441\u0442\u044C"});for(let kt of q)M.push({pos:[m,f,kt],label:"\u041A\u043E\u043B\u0435\u0441\u043E",side:"\u0441\u043F\u0440\u0430\u0432\u0430"});S.add(Gy({M:t,S:s,nodes:d,pick:bt,unit:i,halfW:m,sideT:F,belt:h,H:a,R:f,anchors:M,floorY:N}))}let lt=o-.3,ut=h+.3,ot=N+.42,B=(s.sport?Math.min(a-.12,ot+.24):a-(s.micro?.24:.3))-(h+.3),$=Math.min(s.wsTopZ+.44+.06,Math.max(s.rearBaseZ-.06-.32-.54,s.wsTopZ+.44-.34)),it=Math.min(s.wsTopZ+(s.sport?.42:s.van?.62:.52),$+.06),dt=[{id:"driver",label:"\u041C\u0435\u0441\u0442\u043E \u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044F",group:"interior",pos:[-lt*.22,h+ut*0+.3+B,it],target:[-lt*.27,ot+.07,s.wsTopZ-.24],fov:s.sport?64:70,orbit:!1,seat:!0},{id:"salon",label:"\u0421\u0430\u043B\u043E\u043D",group:"interior",pos:[0,Math.min(h+.3,a-.2),s.wsTopZ+Math.max(.42,(s.roofRearZ-s.wsTopZ)*.44)],target:[0,N+.38,s.wsTopZ-.55],fov:72,orbit:!0,seat:!0},{id:"exterior",label:"\u0421\u043D\u0430\u0440\u0443\u0436\u0438",group:"exterior",pos:[6.4,2.55,-7],target:[0,.72,.05],fov:32,orbit:!0,autoRotate:!0},{id:"side",label:"\u0421\u0431\u043E\u043A\u0443",group:"exterior",pos:[8.8,1.3,.15],target:[0,.72,0],fov:27,orbit:!0},{id:"rear",label:"\u0421\u0437\u0430\u0434\u0438",group:"exterior",pos:[-4.7,2.1,6.8],target:[0,.75,.1],fov:33,orbit:!0}],xt={frontZ:c,rearEnd:l,roofY:a,floorY:N,wheelRadius:f,belt:h,length:r,width:o,wsBase:s.wsBase,wsTopZ:s.wsTopZ,roofRearZ:s.roofRearZ,rearBaseZ:s.rearBaseZ};return{root:S,wheels:v,paintMats:A,views:dt,anchors:M,layout:xt,kind:"car",damage:E}}function Gy({M:i,S:t,nodes:e,pick:n,unit:s,halfW:r,sideT:o,belt:a,H:c,R:l,anchors:h,floorY:u}){let d=ke(null,"interior"),f=t.W-.16,_=t.wsBase+.02,g=t.rearBaseZ-.06,m=(_+g)/2,p=t.wsTopZ+.44,y=p-.8,S=g-.32,v=Math.min(p+.06,Math.max(S-.54,p-.34)),M=i.interiorDark,E=i.interiorMid,A=t.sport,x=A?i.leather:i.fabric,w=A?i.accent(s.accent||"#d8d5c8"):i.fabric;k(d,f+.05,.03,g-_+.7,i.rubberTrim,0,u,m+.1,.02);for(let ot of[-.34,.34])k(d,.44,.012,.44,i.fabric,ot,u+.025,_+.55,.01);for(let ot of[-1,1]){let It=ot*(f/2-.02);k(d,.04,Math.max(.24,a-u-.08),g-_+.3,M,It,u+.28,m,.02),k(d,.1,.055,.4,w,It-ot*.03,a-.1,v-.16,.02),k(d,.1,.07,.32,E,It-ot*.04,u+.4,v+.06,.02),I(d,.025,.028,.1,i.chromeDark,It-ot*.04,a-.18,v-.3);let B=zt(d,.05,.05,.018,i.plastic,It-ot*.04,u+.26,v-.52,10);B.rotation.z=gt}k(d,f-.08,.025,t.roofRearZ-t.wsTopZ+.1,i.interiorMid,0,c-.13,(t.wsTopZ+t.roofRearZ)/2,.02),k(d,.23,.2,g-_-.2,E,0,u+.11,m-.1,.04),s.seats>2&&k(d,f-.1,Math.max(.2,a-u-.14),.05,M,0,u+.32,g+.12,.02);let C=u+.44;k(d,f+.06,C-u+.1,.05,M,0,(u+C)/2-.05,_-.05,.02);let L=u+.42,P=y+.155,O=u+.06,F=L+.08-O,X=O+F/2,q=k(d,f,F+.03,.3,M,0,X,y,.05);q.rotation.x=-.05;let N=y+.005;k(d,f-.02,.035,.26,i.rubberTrim,0,L+.06,N,.016);let Z=-f*.27,V=L-.05;k(d,.46,.2,.055,i.plastic,Z,V,P+.012,.025);for(let[ot,It]of[-.112,.112].entries()){let B=Z+It,$=zt(d,.058,.058,.016,i.plastic,B,V,P+.045,22);$.rotation.x=gt,Sn(d,.058,.006,i.chromeDark,B,V,P+.054,22);for(let Ht=0;Ht<=6;Ht++){let mt=-me*.72+Ht/6*me*1.44,Bt=I(d,.0045,.011,.004,i.plasticLight,B+Math.cos(mt)*.045,V+Math.sin(mt)*.045,P+.056);Bt.rotation.z=mt-gt}let it=ot===0?-me*.28:me*.62,dt=I(d,.005,.038,.004,i.taillight,B+Math.cos(it)*.019,V+Math.sin(it)*.019,P+.059);dt.rotation.z=it-gt;let xt=zt(d,.007,.007,.012,i.chromeDark,B,V,P+.062,10);xt.rotation.x=gt}I(d,.05,.018,.008,i.dashScreen,Z,V+.03,P+.058),k(d,.38,.24,.02,i.plastic,.06,L-.06,P+.006,.02);let Y=k(d,.34,.2,.024,i.dashScreen,.06,L-.06,P+.022,.02);Y.rotation.x=-.08,I(d,.36,.01,.01,i.chromeDark,.06,L-.175,P+.03);for(let ot of[-1,1]){let It=ot===-1?f*.4:-f*.4;k(d,.13,.055,.03,i.plastic,It,L+.02,P+.006,.015);for(let B=-1;B<=1;B++)I(d,.01,.042,.012,i.chromeDark,It+B*.034,L+.02,P+.02)}for(let ot=0;ot<3;ot++){let It=zt(d,.017,.017,.016,i.plasticGray,.009999999999999995+ot*.05,L-.235,P+.03,14);It.rotation.x=gt,Sn(d,.019,.003,i.chromeDark,.06-.05+ot*.05,L-.235,P+.04,14)}for(let ot=0;ot<4;ot++)I(d,.022,.016,.01,i.plasticGray,.06-.06+ot*.04,L-.3,P+.03);k(d,.36,.12,.02,E,f*.26,L-.2,P+.004,.02),I(d,.13,.02,.02,i.chrome,f*.26,L-.16,P+.016),I(d,f-.12,.012,.012,i.chromeDark,0,L-.32,P+.012);let J=_-.02,Rt=y+.13,bt=Math.max(.24,Rt-J),ie=Math.min(L+.06,t.hoodY-.012);k(d,f+.02,.055,bt,M,0,ie-.028,(J+Rt)/2,.02),k(d,f+.04,Math.max(.1,ie-u-.05),.06,M,0,(u+ie)/2,J+.02,.02);for(let ot of[-1,1])k(d,.05,Math.max(.2,ie-u),bt+.12,E,ot*(f/2-.03),(u+ie)/2,(J+Rt)/2,.02);let Lt=ke(d,"steering");Lt.position.set(-f*.27,L-.11,y+.33),Lt.rotation.x=-.42,Sn(Lt,.175,.021,i.leather,0,0,0,36);let oe=k(Lt,.14,.1,.045,i.plastic,0,0,.012,.03);for(let ot of[0,me,-gt]){let It=I(Lt,.032,.12,.018,i.plasticGray,Math.cos(ot)*.085,Math.sin(ot)*.085,.006);It.rotation.z=ot-gt;let B=I(Lt,.014,.1,.006,i.chromeDark,Math.cos(ot)*.085,Math.sin(ot)*.085,.017);B.rotation.z=ot-gt}let et=zt(Lt,.024,.024,.008,i.accent(s.accent||"#d8d5c8"),0,0,.038,14);et.rotation.x=gt;let W=zt(d,.032,.048,.42,i.plastic,-f*.27,L-.06,y+.17,10);W.rotation.x=.6;let ht=zt(d,.016,.02,.17,i.chromeDark,.12,u+.22,y+.22,8);ht.rotation.x=-.28,Rs(d,.032,i.plastic,.12,u+.3,y+.25,8),k(d,.21,.1,.46,E,0,u+.24,(y+g)/2+.1,.03);for(let ot of[-.045,.045])zt(d,.028,.028,.02,i.rubberTrim,ot,u+.28,(y+g)/2-.04,10);for(let ot of[-f*.34,-f*.22]){let It=I(d,.055,.018,.09,i.steel,ot,u+.13,y-.24);It.rotation.x=.6}k(d,.19,.045,.03,i.plastic,0,c-.1,t.roofRearZ-.34,.02),I(d,.16,.036,.007,i.mirror,0,c-.1,t.roofRearZ-.358);for(let ot of[-1,1])k(d,.3,.045,.018,i.plasticLight,ot*.24,c-.14,t.wsTopZ+.2,.015);let lt=zt(d,.036,.036,.016,i.headlight,0,c-.122,m,8);lt.rotation.x=gt,k(d,.09,.04,.04,i.plastic,0,c-.14,t.wsTopZ+.3,.02);function ut(ot,It,{rear:B=!1,width:$=.47}={}){let it=ke(d);k(it,$,.09,.44,x,0,u+.25,0,.03);for(let Ht of[-1,1])k(it,.065,.12,.4,w,Ht*($/2-.008),u+.29,0,.03);let dt=B?.3:.16,xt=k(it,$-.02,.56,.13,x,0,u+.56,.19,.05);xt.rotation.x=dt;for(let Ht of[-1,1]){let mt=k(it,.055,.48,.1,w,Ht*($/2-.008),u+.58,.2,.04);mt.rotation.x=dt}if(k(it,$-.18,.13,.1,x,0,u+.89,.27,.03),!B){let Ht=I(it,.045,.54,.01,i.plasticGray,-$/2+.05,u+.58,.26);Ht.rotation.x=dt}return it.position.set(ot,0,It),it}if(ut(-f*.27,v),!A&&t.style!=="micro"&&ut(f*.27,v),h.push({pos:[-f*.27,u+.6,v],label:"\u0421\u0438\u0434\u0435\u043D\u044C\u0435 \u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044F"}),h.push({pos:[0,u+.52,y],label:"\u0422\u043E\u0440\u043F\u0435\u0434\u043E \u0438 \u0440\u0443\u043B\u044C"}),s.seats>2){let ot=S;if(s.seats>=5){k(d,f-.08,.11,.46,x,0,u+.27,ot,.04);for(let B of[-1,1])k(d,.08,.14,.44,w,B*(f/2-.07),u+.31,ot,.03);let It=k(d,f-.06,.5,.13,x,0,u+.58,ot+.25,.05);It.rotation.x=.26;for(let B of[-1,0,1])k(d,.14,.1,.08,x,B*(f*.26),u+.85,ot+.29,.02);h.push({pos:[0,u+.52,ot],label:"\u0417\u0430\u0434\u043D\u0438\u0439 \u0440\u044F\u0434"})}else ut(-f*.27,ot,{rear:!0}),ut(f*.27,ot,{rear:!0})}return d}var Ln=1.25;function _e(i,t=.65,e=.2){return new Se({color:i,roughness:t,metalness:e})}var Wy={TRAILGO:"#1b4f8a",COLDFLOW:"#0f6b70",STEELRIDE:"#cf5a13",AQUATEC:"#2f7d5a",BULKLINE:"#7d1a2e",FARMHAUL:"#5c6b3b",TIMBERLINE:"#5a3c25",PORTLINE:"#16233f",AUTOLINE:"#4b3c85",WATERTRAIL:"#3d8fc4",CLEARLINE:"#37a58c"};function Zn(i,t="#1b4f8a"){let e=String((i==null?void 0:i.brand)||"").split(/[\s-]/)[0].toUpperCase();return Wy[e]||t}function Sf(i,t,e,n,s,r,o){let a=new Ie(s,s,r,16,1,!0,0,me),c=o.clone();c.side=De;let l=new Dt(a,c);return l.rotation.z=gt,l.position.set(t,e,n),i.add(l),l}function el(i,{W:t,z:e,bottom:n,height:s,leafMat:r,liveryMat:o,M:a,leaves:c=2}){let l=(t-.14)/c;for(let h=0;h<c;h++){let u=-t/2+.07+l*(h+.5);k(i,l-.02,s,.09,r,u,n+s/2,e-.05,.015);for(let d of[-.26,.26]){let f=zt(i,.032,.032,s-.14,a.steel,u+d*(l/.9),n+s/2,e-.12,8)}for(let d=0;d<3;d++)I(i,.1,.13,.07,a.steel,u+(h===0?-l/2+.06:l/2-.06),n+.5+d*(s-1)/2,e-.1);I(i,.24,.05,.05,a.chrome,u+(h===0?l/2-.3:-l/2+.3),n+s*.45,e-.13)}I(i,.03,s-.05,.04,a.plastic,0,n+s/2,e-.1),I(i,t-.1,.1,.05,o,0,n+.06,e-.12),I(i,t-.1,.08,.05,o,0,n+s-.02,e-.12)}function tl(i,{length:t,height:e=.13,x:n=0,y:s=0,z:r=0,axis:o="z",side:a=1,seg:c=.55,colors:l=["#b02a21","#e8e4d8"]}={}){let h=Math.max(2,Math.round(t/c)),u=t/h,d=[],f=[],_=new te(l[0]),g=new te(l[1]),m=e/2;for(let v=0;v<h;v++){let M=-t/2+v*u,E=M+u,A=v%2?g:_,x=o==="z"?[[n,s-m,r+M],[n,s+m,r+M],[n,s+m,r+E],[n,s-m,r+M],[n,s+m,r+E],[n,s-m,r+E]]:[[n+M,s-m,r],[n+M,s+m,r],[n+E,s+m,r],[n+M,s-m,r],[n+E,s+m,r],[n+E,s-m,r]];for(let w of x)d.push(w[0]+(o==="z"?a*.014:0),w[1],w[2]+(o==="x"?a*.014:0)),f.push(A.r,A.g,A.b)}let p=new Ge;p.setAttribute("position",new ye(d,3)),p.setAttribute("color",new ye(f,3)),p.computeVertexNormals();let y=new Se({vertexColors:!0,roughness:.45,metalness:.15,side:De}),S=new Dt(p,y);return i.add(S),S}function Tf(i,t){var ut,ot,It;let e=ke(null,`trailer:${i.id}`),n=[],s=[],r=(ut=i.length)!=null?ut:13.6,o=(ot=i.width)!=null?ot:2.55,a=(It=i.height)!=null?It:2.75,c=i.type,l=r/2,h=-l,u=l,d=i.color||"#d5d8d3",f=_e(d,.72,.12),_=_e(new te(d).multiplyScalar(.86),.78,.12),g=t.darkSteel,m=c==="lowboy",p=m?.92:Ln,y=c==="lowboy"?4:c==="bdouble"?5:c==="dolly"||c==="boat"?2:3,S=ke(e,"frame");if(c==="dolly"){for(let B of[-1,1])Vn(S,[B*.55,Ln-.1,h+.2],[B*.02,Ln-.1,h+2.4],.07,g),I(S,.14,.24,r-2.2,g,B*.52,Ln-.12,.6);I(S,1.2,.22,.24,g,0,Ln-.1,h+2.4),I(S,.5,.18,2.4,t.steel,0,Ln-.14,h+1.4)}else if(m){I(S,1.1,.4,3.4,g,0,p+.16,h+1.7);for(let B of[-1,1])I(S,.14,.42,r-.4,g,B*(o/2-.32),p-.2,.2);for(let B=h+.6;B<u;B+=1.2)I(S,o-.6,.18,.12,g,0,p-.18,B)}else{for(let B of[-1,1])I(S,.16,.34,r-.5,g,B*(o/2-.22),p-.2,.2);for(let B=h+.8;B<u-.2;B+=1.15)I(S,o-.4,.16,.12,g,0,p-.22,B)}if(c!=="dolly"&&c!=="boat"){for(let B of[-1,1]){let $=k(S,.16,.9,.2,t.plasticGray,B*.85,Ln-.62,h+1.75,.02);I(S,.3,.06,.3,t.darkSteel,B*.85,Ln-1.1,h+1.75),Vn(S,[B*.85,Ln-.55,h+1.7],[B*.85,Ln-.18,h+2],.02,t.chromeDark)}k(S,1,.1,.8,g,0,Ln-.33,h+.5,.02),zt(S,.07,.07,.26,t.steel,0,Ln-.45,h+.5,12),s.push({pos:[0,Ln-.4,h+.5],label:"\u0421\u0446\u0435\u043F\u043D\u043E\u0439 \u0448\u043A\u0432\u043E\u0440\u0435\u043D\u044C"})}let v=c==="lowboy"?.48:c==="boat"?.32:.5,M=[];if(c==="bdouble")M.push(u-.7,u-1.55);else if(c==="dolly")M.push(1,1.85);else if(c==="boat")M.push(1,1.8);else for(let B=0;B<y;B++)M.push(u-.75-B*1.32);let E=c==="boat"?1.02:.94,A=c!=="boat"&&c!=="dolly",x=M[0];for(let B of M){zt(e,.09,.09,o-.35,t.darkSteel,0,v,B,10).rotation.z=gt;for(let $ of[-1,1])if(A)for(let it of[0,.34]){let dt=as(t,{radius:v,width:.3,style:"truck",rimColor:"#d2d5d7"});dt.position.set($*(E+it),v,B),$<0&&(dt.rotation.y=me),e.add(dt),n.push(dt)}else{let it=as(t,{radius:v,width:.26,style:"truck",rimColor:"#d2d5d7"});it.position.set($*E,v,B),$<0&&(it.rotation.y=me),e.add(it),n.push(it)}for(let $ of[-1,1]){let it=zt(e,.085,.085,.2,t.plasticGray,$*.5,v+.04,B+.24,10);it.rotation.x=gt}for(let $ of[-1,1])zt(e,.12,.15,.3,t.rubberTrim,$*(o/2-.45),p-.36,B,12);if(A)for(let $ of[-1,1])Sf(e,$*(E+.17),v,B,v+.13,.86,t.plastic);else for(let $ of[-1,1])Sf(e,$*E,v,B,v+.12,.46,t.plastic)}for(let B of[-1,1]){let $=M[M.length-1];k(e,.62,.62,.03,t.rubberTrim,B*(E+.17),v-.1,$-.72,.02),I(e,.1,.08,.06,t.steel,B*(E+.17),v+.5,$-.72)}let w=x-1.05,C=h+1.9,L=["curtain","van","reefer","tipper","livestock","sidetip","bdouble"].includes(c);if(c!=="boat"&&c!=="dolly"&&c!=="lowboy"&&w-C>1.2)for(let B of[-1,1]){let $=B*(o/2-.06);I(e,.06,.74,w-C,t.plasticGray,$,.82,(C+w)/2);for(let it=C+.4;it<w-.3;it+=1.5)I(e,.09,.76,.05,t.plastic,$,.82,it);I(e,.08,.05,w-C,t.plasticGray,$,.47,(C+w)/2),I(e,.07,.05,w-C,t.plastic,$,1.16,(C+w)/2),tl(e,{length:w-C-.1,height:.1,y:.74,z:(C+w)/2,x:B*(o/2-.015),side:B})}for(let B of[-1,1]){let $=zt(e,.16,.16,1.1,t.steel,B*.62,p-.55,h+2.9,14);$.rotation.x=gt;for(let it of[-.4,.4])I(e,.05,.06,.06,t.darkSteel,B*.62,p-.4,h+2.9+it)}let P=k(e,.95,.5,.55,t.plasticGray,.75,p-.62,h+2.35,.03);I(e,.9,.04,.5,t.steel,.75,p-.36,h+2.35);let O=ke(e,"rear");I(O,o-.12,.2,.18,t.darkSteel,0,p-.36,u-.04);let F=.62;k(O,o-.18,.16,.14,t.steel,0,F,u-.12,.03);for(let B of[-1,1]){let $=B*(o/2-.42);I(O,.12,p-F-.4,.1,t.darkSteel,$,(p+F)/2-.1,u-.14);let it=I(O,.08,.7,.08,t.darkSteel,$,F+.34,u-.3);it.rotation.x=.55}tl(O,{length:o-.4,height:.11,y:F,z:u-.2,axis:"x",side:-1});for(let B of[-1,1]){let $=B*(o/2-.33);I(O,.36,.4,.05,t.plastic,$,p-.56,u-.07),I(O,.2,.3,.035,t.taillight,$-B*.07,p-.56,u-.04),I(O,.09,.12,.035,t.amber,$+B*.1,p-.47,u-.04),I(O,.09,.12,.035,t.reverseLight,$+B*.1,p-.63,u-.04),I(O,.12,.06,.02,t.taillight,B*(o/2-.05),F+.12,u-.2)}I(O,.56,.17,.02,t.plastic,0,p-.62,u-.08);let X=As("\u0412\u041A 4471");X&&pn(O,.5,.13,new Se({map:X,roughness:.6}),0,p-.62,u-.1),I(O,.16,.05,.05,t.headlight,0,p-.5,u-.12);for(let B of[-1,1])for(let $=h+2.2;$<u-.6;$+=2.4)I(e,.09,.06,.03,t.plastic,B*(o/2-.02),p-.2,$),Rs(e,.026,t.amber,B*(o/2+.005),p-.2,$,6);let q=ke(e,"body"),N={M:t,unit:i,body:q,bodyMat:f,bodyMat2:_,W:o,H:a,L:r,halfL:l,zFront:h,zRear:u,deckY:p,R:v,anchors:s,frameMat:g,std:_e};switch(c){case"curtain":Xy(N);break;case"van":Mf(N);break;case"reefer":Yy(N);break;case"flatbed":qy(N);break;case"lowboy":Zy(N);break;case"tanker":Ef(N,!1);break;case"adr":Ef(N,!0);break;case"silo":$y(N);break;case"tipper":Jy(N);break;case"livestock":Ky(N);break;case"logging":jy(N);break;case"dolly":Qy(N);break;case"container":wf(N,!1);break;case"refcontainer":wf(N,!0);break;case"carrier":e1(N);break;case"bdouble":n1(N);break;case"boat":i1(N);break;case"glass":s1(N);break;case"crane":r1(N);break;case"sidetip":o1(N);break;default:Mf(N)}if(["curtain","van","reefer","tipper","livestock"].includes(c)){let B=_e(Zn(i),.5,.25),$=Cr(i,{width:512,height:128,font:"bold 64px Arial, sans-serif"});for(let it of[-1,1]){let dt=k(q,.03,.62,2.7,B,it*(o/2+.02),p+1.42,h+3.4,.04);if(dt.rotation.y=0,$){let xt=pn(q,2.3,.5,$,it*(o/2+.045),p+1.42,h+3.4);xt.rotation.y=it>0?-gt:gt}Pr(q,{length:3,height:.06,depth:.03,x:it*(o/2+.03),y:p+1.03,z:h+3.4,accentMat:B,chromeMat:t.chrome})}}let V=["curtain","van","reefer","tipper","livestock","container","refcontainer","bdouble","sidetip"],Y=["tanker","adr","silo"],J=V.includes(c),Rt=Y.includes(c),bt=c==="tipper"?.95:1.05,ie=(c==="dolly"?Ln:p)+.015,Lt=o/2+.05,oe=(B,$,it)=>({name:B,gender:$}),et=["\u0431\u043E\u0440\u0442 \u043A\u0443\u0437\u043E\u0432\u0430","\u0431\u043E\u0440\u0442 \u043A\u0443\u0437\u043E\u0432\u0430","\u0431\u043E\u0440\u0442 \u043A\u0443\u0437\u043E\u0432\u0430","\u0431\u043E\u0440\u0442 \u043A\u0443\u0437\u043E\u0432\u0430","\u0431\u043E\u0440\u0442 \u043A\u0443\u0437\u043E\u0432\u0430","\u0431\u043E\u0440\u0442 \u043A\u0443\u0437\u043E\u0432\u0430"],W;J?W=[{part:{name:"\u0431\u043E\u0440\u0442 \u043A\u0443\u0437\u043E\u0432\u0430",gender:"m"},side:-1,pos:[-Lt,p+bt,h+2.4],w:.82,h:.58},{part:{name:"\u0431\u043E\u0440\u0442 \u043A\u0443\u0437\u043E\u0432\u0430",gender:"m"},side:1,pos:[Lt,p+bt,h+2.4],w:.82,h:.58},{part:{name:"\u0431\u043E\u0440\u0442 \u043A\u0443\u0437\u043E\u0432\u0430",gender:"m"},side:-1,pos:[-Lt,p+bt-.5,0],w:.86,h:.5},{part:{name:"\u0431\u043E\u0440\u0442 \u043A\u0443\u0437\u043E\u0432\u0430",gender:"m"},side:1,pos:[Lt,p+bt+.35,0],w:.86,h:.5},{part:{name:"\u0431\u043E\u0440\u0442 \u043A\u0443\u0437\u043E\u0432\u0430",gender:"m"},side:-1,pos:[-Lt,p+bt+.3,u-3.2],w:.8,h:.52},{part:{name:"\u0431\u043E\u0440\u0442 \u043A\u0443\u0437\u043E\u0432\u0430",gender:"m"},side:1,pos:[Lt,p+bt-.45,u-3.2],w:.8,h:.52},{part:{name:"\u0437\u0430\u0434\u043D\u044F\u044F \u0434\u0432\u0435\u0440\u044C",gender:"f"},side:1,rotY:0,pos:[.62,p+1.15,u+.04],w:.66,h:.8},{part:{name:"\u043F\u0435\u0440\u0435\u0434\u043D\u044F\u044F \u0441\u0442\u0435\u043D\u043A\u0430",gender:"f"},side:-1,rotY:me,pos:[-.55,p+1.2,h-.04],w:.66,h:.8},{part:{name:"\u043A\u0440\u044B\u0448\u0430",gender:"f"},side:0,rotX:-gt,rotY:0,pos:[.4,p+a+.03,-.6],w:.9,h:.7},{part:{name:"\u044E\u0431\u043A\u0430",gender:"f"},side:-1,pos:[-(o/2-.01),.84,x-2.4],w:.5,h:.4},{part:{name:"\u044E\u0431\u043A\u0430",gender:"f"},side:1,pos:[o/2-.01,.84,x-2.4],w:.5,h:.4},{part:{name:"\u0437\u0430\u0434\u043D\u0438\u0439 \u043E\u0442\u0431\u043E\u0439\u043D\u0438\u043A",gender:"m"},side:1,rotY:0,pos:[.5,.64,u-.04],w:.5,h:.16},{part:{name:"\u0437\u0430\u0434\u043D\u0438\u0439 \u0444\u043E\u043D\u0430\u0440\u044C",gender:"m"},side:-1,rotY:0,pos:[-(o/2-.33),p-.56,u-.04],w:.34,h:.3},{part:{name:"\u044F\u0449\u0438\u043A",gender:"m"},side:1,pos:[1.23,p-.6,h+2.35],w:.44,h:.4},{part:{name:"\u0431\u0440\u044B\u0437\u0433\u043E\u0432\u0438\u043A",gender:"m"},side:-1,rotY:0,pos:[-(E+.17),.34,M[M.length-1]-.72],w:.5,h:.5}]:Rt?W=[{part:{name:"\u043A\u043E\u0440\u043C\u043E\u0432\u043E\u0439 \u0449\u0438\u0442",gender:"m"},side:1,rotY:0,pos:[.55,p-.1,u-.14],w:.62,h:.44},{part:{name:"\u043A\u043E\u0440\u043C\u043E\u0432\u043E\u0439 \u0449\u0438\u0442",gender:"m"},side:-1,rotY:0,pos:[-.55,p+.25,u-.14],w:.62,h:.4},{part:{name:"\u043F\u0435\u0440\u0435\u0434\u043D\u0438\u0439 \u0449\u0438\u0442",gender:"m"},side:1,rotY:me,pos:[.5,p-.1,h+.14],w:.6,h:.4},{part:{name:"\u043F\u0435\u0440\u0435\u0434\u043D\u0438\u0439 \u0449\u0438\u0442",gender:"m"},side:-1,rotY:me,pos:[-.5,p+.25,h+.14],w:.6,h:.4},{part:{name:"\u0440\u0430\u043C\u0430",gender:"f"},side:-1,pos:[-(o/2-.02),.86,h+2.6],w:.7,h:.34},{part:{name:"\u0440\u0430\u043C\u0430",gender:"f"},side:1,pos:[o/2-.02,.86,h+2.6],w:.7,h:.34},{part:{name:"\u0440\u0430\u043C\u0430",gender:"f"},side:-1,pos:[-(o/2-.02),.86,-.4],w:.7,h:.34},{part:{name:"\u0440\u0430\u043C\u0430",gender:"f"},side:1,pos:[o/2-.02,.86,-.4],w:.7,h:.34},{part:{name:"\u0440\u0430\u043C\u0430",gender:"f"},side:-1,pos:[-(o/2-.02),.86,u-2.6],w:.7,h:.34},{part:{name:"\u0440\u0430\u043C\u0430",gender:"f"},side:1,pos:[o/2-.02,.86,u-2.6],w:.7,h:.34},{part:{name:"\u0437\u0430\u0434\u043D\u0438\u0439 \u0444\u043E\u043D\u0430\u0440\u044C",gender:"m"},side:1,rotY:0,pos:[o/2-.33,p-.56,u-.04],w:.34,h:.3},{part:{name:"\u0437\u0430\u0434\u043D\u0438\u0439 \u0444\u043E\u043D\u0430\u0440\u044C",gender:"m"},side:-1,rotY:0,pos:[-(o/2-.33),p-.56,u-.04],w:.34,h:.3},{part:{name:"\u0437\u0430\u0434\u043D\u0438\u0439 \u043E\u0442\u0431\u043E\u0439\u043D\u0438\u043A",gender:"m"},side:1,rotY:0,pos:[.4,.64,u-.1],w:.5,h:.16},{part:{name:"\u0440\u0430\u043C\u0430",gender:"f"},side:-1,pos:[-(o/2-.02),.9,h+6.2],w:.66,h:.3},{part:{name:"\u0440\u0430\u043C\u0430",gender:"f"},side:1,pos:[o/2-.02,.9,h+6.2],w:.66,h:.3}]:W=[...[h+2.2,h+5.4,-.6,u-4.4,u-1.8].map(($,it)=>({part:{name:"\u043D\u0430\u0441\u0442\u0438\u043B \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u044B",gender:"m"},side:0,rotX:-gt,rotY:0,pos:[it%2?.5:-.5,ie+.01,$],w:.7,h:.5})),{part:{name:"\u0431\u043E\u0440\u0442 \u0440\u0430\u043C\u044B",gender:"m"},side:-1,pos:[-(o/2-.03),.9,h+2],w:.8,h:.3},{part:{name:"\u0431\u043E\u0440\u0442 \u0440\u0430\u043C\u044B",gender:"m"},side:1,pos:[o/2-.03,.9,h+2],w:.8,h:.3},{part:{name:"\u0431\u043E\u0440\u0442 \u0440\u0430\u043C\u044B",gender:"m"},side:-1,pos:[-(o/2-.03),.9,u-2.4],w:.8,h:.3},{part:{name:"\u0431\u043E\u0440\u0442 \u0440\u0430\u043C\u044B",gender:"m"},side:1,pos:[o/2-.03,.9,u-2.4],w:.8,h:.3},{part:{name:"\u043F\u0435\u0440\u0435\u0434\u043D\u0438\u0439 \u0449\u0438\u0442",gender:"m"},side:1,rotY:me,pos:[.5,p+.5,h+.06],w:.6,h:.5},{part:{name:"\u0437\u0430\u0434\u043D\u0438\u0439 \u043E\u0442\u0431\u043E\u0439\u043D\u0438\u043A",gender:"m"},side:-1,rotY:0,pos:[-.4,.64,u-.04],w:.5,h:.16},{part:{name:"\u0437\u0430\u0434\u043D\u0438\u0439 \u0444\u043E\u043D\u0430\u0440\u044C",gender:"m"},side:1,rotY:0,pos:[o/2-.33,p-.56,u-.04],w:.34,h:.3},{part:{name:"\u0431\u043E\u0440\u0442 \u0440\u0430\u043C\u044B",gender:"m"},side:-1,pos:[-(o/2-.03),.9,M[0]-1.4],w:.7,h:.26},{part:{name:"\u0431\u043E\u0440\u0442 \u0440\u0430\u043C\u044B",gender:"m"},side:1,pos:[o/2-.03,.9,M[0]-1.4],w:.7,h:.26},{part:{name:"\u043D\u0430\u0441\u0442\u0438\u043B \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u044B",gender:"m"},side:0,rotX:-gt,rotY:0,pos:[.4,ie+.01,u-3],w:.7,h:.5}];let ht=Lr(e,{...i,category:"trailers"},W);for(let B of ht.list)s.push({pos:B.patch.position.clone().toArray(),label:`\u041F\u043E\u0432\u0440\u0435\u0436\u0434\u0435\u043D\u0438\u0435: ${B.spec.label}`,damage:!0});return{root:e,wheels:n,paintMats:[f,_],views:[{id:"exterior",label:"\u0421\u043D\u0430\u0440\u0443\u0436\u0438",group:"exterior",pos:[12.5,5.2,-11.5],target:[0,1.6,.6],fov:38,orbit:!0,autoRotate:!0},{id:"side",label:"\u0421\u0431\u043E\u043A\u0443",group:"exterior",pos:[17.5,2.6,1],target:[0,1.7,.2],fov:32,orbit:!0},{id:"rear",label:"\u0421\u0437\u0430\u0434\u0438",group:"exterior",pos:[-6.5,4.2,13.5],target:[0,1.5,.4],fov:40,orbit:!0},{id:"front",label:"\u0421\u043F\u0435\u0440\u0435\u0434\u0438",group:"exterior",pos:[5,4,-14.5],target:[0,1.4,.4],fov:40,orbit:!0}],anchors:s,layout:{frontZ:h,rearEnd:u,roofY:p+a,deckY:p,axleZ:M,wheelRadius:v,width:o,length:r},kind:"trailer",damage:ht}}function Xy(i){var m,p;let{M:t,body:e,bodyMat:n,bodyMat2:s,W:r,H:o,L:a,halfL:c,zFront:l,deckY:h,unit:u}=i,d=h+o;k(e,r,.12,a-.1,t.wood,0,h+.06,0,.02),I(e,r-.12,.02,a-.3,t.wood,0,h+.13,0);let f=new Se({color:new te("#cfd3d0"),map:((m=t.tarp)==null?void 0:m.map)||null,roughness:.93,metalness:.02,side:De});for(let y of[-1,1]){let S=pn(e,a-.4,o-.1,f,y*(r/2+.005),h+o/2,0);S.rotation.y=y>0?-gt:gt;for(let v=l+.6;v<c-.4;v+=1.35)I(e,.05,o-.12,.03,t.plasticGray,y*(r/2+.03),h+o/2,v);I(e,.05,.12,a-.4,t.plasticGray,y*(r/2),h-.02,0),I(e,.09,.09,a-.2,t.steel,y*(r/2),d+.02,0)}let _=new Se({color:14672869,map:((p=t.tarp)==null?void 0:p.map)||null,roughness:.94});k(e,r+.04,.07,a-.2,_,0,d+.04,0,.02);for(let y=l+.8;y<c;y+=1.5)I(e,r,.05,.05,t.steel,0,d-.03,y);I(e,r-.04,o,.1,s,0,h+o/2,l+.12);for(let y of[-1,1])k(e,.1,o+.04,.14,t.plasticGray,y*(r/2-.02),h+o/2,l+.1,.02),k(e,.1,o+.04,.14,t.plasticGray,y*(r/2-.02),h+o/2,c-.12,.02);let g=_e(Zn(u),.55,.25);for(let y of[-1,1])I(e,.012,.26,a-1.4,g,y*(r/2+.03),h+.62,0),I(e,.01,.06,a-1.4,g,y*(r/2+.012),h+.9,0);el(e,{W:r,z:c-.02,bottom:h+.02,height:o-.08,leafMat:n,liveryMat:g,M:t,leaves:2});for(let y=l+1.2;y<c-.5;y+=3.2)for(let S of[-1,1])I(e,.06,o,.06,t.steel,S*(r/2-.06),h+o/2,y);i.anchors.push({pos:[0,h+.6,c-.2],label:"\u0417\u0430\u0434\u043D\u0438\u0435 \u0432\u043E\u0440\u043E\u0442\u0430"}),i.anchors.push({pos:[r/2+.06,h+1.4,0],label:"\u0411\u043E\u043A\u043E\u0432\u0430\u044F \u0448\u0442\u043E\u0440\u043A\u0430"})}function Mf(i){let{M:t,body:e,bodyMat:n,bodyMat2:s,W:r,H:o,L:a,zFront:c,zRear:l,deckY:h}=i,u=h+o;k(e,r,o,a-.3,n,0,h+o/2+.05,0,.06);for(let f=c+.5;f<l-.4;f+=.55)for(let _ of[-1,1])I(e,.03,o-.2,.05,s,_*(r/2+.005),h+o/2,f);for(let f=c+.5;f<l-.4;f+=.8)I(e,r-.1,.03,.06,s,0,u+.05,f);let d=_e(Zn(i.unit),.5,.3);for(let f of[-1,1])I(e,.012,.3,a-1.6,d,f*(r/2+.03),h+.55,0),I(e,.014,.06,a-1.2,t.steel,f*(r/2+.012),h+o*.62,0),k(e,.09,o+.06,.12,t.plasticGray,f*(r/2-.02),h+o/2,c+.14,.02),k(e,.09,o+.06,.12,t.plasticGray,f*(r/2-.02),h+o/2,l-.16,.02);el(e,{W:r,z:l-.03,bottom:h+.02,height:o-.08,leafMat:n,liveryMat:d,M:t,leaves:2}),i.anchors.push({pos:[0,h+.5,l-.2],label:"\u0414\u0432\u0435\u0440\u0438 \u0444\u0443\u0440\u0433\u043E\u043D\u0430"})}function Yy(i){let{M:t,body:e,bodyMat:n,bodyMat2:s,W:r,H:o,L:a,zFront:c,zRear:l,deckY:h}=i,u=h+o;k(e,r,o,a-.3,n,0,h+o/2+.05,0,.07);for(let g=c+.4;g<l-.3;g+=.9)for(let m of[-1,1])I(e,.02,o-.2,.05,s,m*(r/2+.005),h+o/2,g);let d=k(e,1.7,1.15,.55,t.plasticLight,0,h+o-.72,c+.2,.06);I(e,1.3,.9,.05,t.plastic,0,h+o-.72,c-.1);for(let g=-3;g<=3;g++)I(e,.06,.78,.03,t.plasticGray,g*.16,h+o-.72,c-.12);let f=zt(e,.3,.3,.1,t.plastic,0,h+o-1.35,c+.15,20);f.rotation.x=gt,k(e,.5,.5,.35,t.plasticGray,-.9,h+.55,c+.25,.04);let _=_e(Zn(i.unit),.5,.3);for(let g of[-1,1])I(e,.012,.34,a-1.8,_,g*(r/2+.03),h+.5,0),k(e,.09,o+.06,.12,t.plasticGray,g*(r/2-.02),h+o/2,c+.16,.02);el(e,{W:r,z:l-.02,bottom:h+.02,height:o-.08,leafMat:n,liveryMat:_,M:t,leaves:2}),i.anchors.push({pos:[0,h+o-.6,c-.2],label:"\u0425\u043E\u043B\u043E\u0434\u0438\u043B\u044C\u043D\u0430\u044F \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0430"})}function qy(i){let{M:t,body:e,W:n,L:s,zFront:r,zRear:o,deckY:a,unit:c}=i,l=_e(Zn(c,"#cf5a13"),.55,.25);k(e,n,.12,s-.2,t.steel,0,a+.06,0,.02);for(let f=-4;f<=4;f++)I(e,.1,.015,s-.5,t.darkSteel,f*.26,a+.13,0);for(let f of[-1,1]){let _=f*(n/2-.03);I(e,.08,.3,s-.3,t.steel,_,a+.28,0),I(e,.1,.05,s-.3,t.chromeDark,_,a+.44,0);for(let g of[r+1.2,-1.4,o-2.3])I(e,.14,.32,.16,t.darkSteel,_,a+.3,g);I(e,.012,.09,s-.8,l,f*(n/2+.012),a+.34,0);for(let g=r+1.6;g<o-1;g+=2.6)I(e,.05,.04,.12,t.amber,f*(n/2+.04),a+.36,g)}I(e,n,.9,.08,t.steel,0,a+.62,r+.22);for(let f of[-1,1])k(e,.1,1,.1,t.darkSteel,f*(n/2-.06),a+.66,r+.22,.02);for(let f of[r+1.5,-1.4,o-2.4])for(let _ of[-1,1]){let g=k(e,.14,1.05,.14,t.steel,_*(n/2-.1),a+.78,f,.02);g.rotation.z=_*.05,k(e,.26,.1,.26,t.darkSteel,_*(n/2-.1),a+1.3,f,.02)}let h=_e("#8a8f94",.42,.85),u=_e("#9c6a3c",.75,.5);[-3.6,0,3.4].forEach((f,_)=>{let m=zt(e,.74,.74,1.35,_===2?u:h,0,a+.16+.74,f,24);m.rotation.z=gt;for(let p of[-1,1])zt(e,.74*.55,.74*.55,.04,t.darkSteel,p*.69,a+.16+.74,f,20).rotation.z=gt;for(let p of[-1,1])I(e,1.5,.1,.16,t.wood,0,a+.12,f+p*.62);I(e,.06,.74*2+.1,.04,t.rope,.3,a+.16+.74,f+.72),I(e,.06,.74*2+.1,.04,t.rope,-.3,a+.16+.74,f+.72)}),k(e,.8,.5,.5,t.plasticGray,.62,a-.55,r+2.6,.03),i.anchors.push({pos:[0,a+1,-3.6],label:"\u0413\u0440\u0443\u0437: \u0440\u0443\u043B\u043E\u043D\u044B \u0441\u0442\u0430\u043B\u0438"})}function Zy(i){let{M:t,body:e,W:n,L:s,zFront:r,zRear:o,deckY:a,halfL:c}=i,l=a-.05;k(e,n,.16,s-4.4,t.steel,0,l,o-3.2,.02);for(let p=r+3.2;p<o-.6;p+=.9)I(e,n-.2,.06,.1,t.darkSteel,0,l-.08,p);k(e,n-.2,.9,3.2,t.steel,0,a+.4,r+1.9,.05),I(e,n-.4,.12,3.2,t.darkSteel,0,a+.86,r+1.9);let h=k(e,n-.3,.12,3.6,t.steel,0,l+.05,o+1.7,.03);h.rotation.x=-.12;for(let p of[-1,1])I(e,.06,.16,3.6,t.darkSteel,p*(n/2-.2),l+.12,o+1.7);let u=ke(e,"excavator");u.position.set(0,l+.08,o-3.4);let d=_e("#c9a227",.5,.3),f=_e("#1b1d1f",.85,.1);for(let p of[-1,1]){k(u,.52,.44,3,f,p*.72,.3,0,.1);for(let y=-2;y<=2;y++)zt(u,.2,.2,.53,t.steel,p*.72,.3,y*.6,12).rotation.z=gt}k(u,2.1,.3,2.4,t.darkSteel,0,.6,0,.04),k(u,1.7,.72,1.9,d,0,1.06,.2,.08),k(u,.8,.9,.9,d,-.55,1.5,-.55,.05),k(u,.62,.5,.62,t.glassDark,-.55,1.6,-.6,.03);let _=k(u,.3,.28,2.4,d,.1,1.6,.9,.04);_.rotation.x=-.55;let g=k(u,.22,.2,1.8,d,.1,1.95,2.6,.03);g.rotation.x=.5;let m=k(u,.75,.5,.7,_e("#4c4f52",.6,.4),.1,1.55,3.25,.05);i.anchors.push({pos:[0,l+1.4,o-3.4],label:"\u0413\u0440\u0443\u0437: \u0433\u0443\u0441\u0435\u043D\u0438\u0447\u043D\u044B\u0439 \u044D\u043A\u0441\u043A\u0430\u0432\u0430\u0442\u043E\u0440"})}function Ef(i,t){let{M:e,body:n,W:s,L:r,deckY:o,unit:a}=i,c=1,l=o+c+.18,h=t?_e("#e8e9e4",.4,.42):e.tank,u=_e(Zn(a,"#2f7d5a"),.5,.3),d=r-2.6,f=new Dt(new Ie(c,c,d,40,1,!1),h);f.rotation.x=gt,f.position.set(0,l,-.2),n.add(f);for(let m of[-1,1]){let p=new Dt(new ni(c,32,18,0,rs,0,gt),h);p.rotation.x=m>0?-gt:gt,p.position.set(0,l,m>0?d/2-.2:-d/2-.2),p.scale.z=.5,n.add(p);let y=Sn(n,c+.005,.035,e.steel,0,l,m>0?d/2-.24:-d/2+.24,40);y.rotation.y=0}for(let m of[-1.6,0,1.6])Sn(n,c+.01,.032,e.steel,0,l,m,40);for(let m of[-1,1])I(n,.02,.16,d-.6,u,m*(c+.004),l+.18,-.2);for(let m=-d/2+.3;m<d/2-.2;m+=.42)I(n,.72,.03,.3,e.steel,0,l+c+.03,m);for(let m of[-1,1]){for(let y of[-d/2+.5,0,d/2-.5])I(n,.05,.55,.05,e.darkSteel,m*.52,l+c+.3,y);let p=zt(n,.028,.028,d-1.2,e.steel,m*.52,l+c+.56,-.2,8);p.rotation.x=gt}for(let m=0;m<3;m++){let p=-d/3.2+m*(d/3.2);zt(n,.3,.34,.16,e.steel,0,l+c+.1,p,20),zt(n,.24,.26,.14,e.chromeDark,0,l+c+.2,p,20),zt(n,.29,.29,.06,e.chrome,0,l+c+.3,p,20);let y=Sn(n,.2,.025,e.chromeDark,0,l+c+.34,p,16);y.rotation.x=gt,I(n,.42,.035,.05,e.chrome,0,l+c+.34,p)}for(let m=0;m<5;m++)I(n,.42,.035,.04,e.steel,.52,o+.55+m*.4,d/2+.02);for(let m of[.3,.75])Vn(n,[m,o+.35,d/2+.02],[m,l+c-.05,d/2+.02],.024,e.steel);k(n,.9,.85,.32,e.plasticGray,-.55,o+.5,d/2+.06,.03),I(n,.78,.06,.03,e.chromeDark,-.55,o+.78,d/2+.22);let _=zt(n,.1,.1,.3,e.chrome,-.55,o+.05,d/2+.12,14);_.rotation.x=gt;let g=zt(n,.12,.12,.34,e.chrome,.35,o+.02,1.2,14);g.rotation.x=gt,k(n,.7,.5,.4,e.plasticGray,-.7,o-.35,1.4,.03);for(let m of[-d/2+.7,0,d/2-.7]){for(let p of[-1,1])I(n,.18,.46,.5,e.darkSteel,p*.8,o+.26,m);I(n,s-.5,.14,.6,e.darkSteel,0,o+.2,m)}if(t){let m=Ar("33 1203",{width:256,height:128,bg:"#e08a1e",fg:"#1a1a1a",accent:"#1a1a1a",font:"bold 54px Arial, sans-serif",border:!0});if(m){let p=new Se({map:m,roughness:.5});for(let y of[-1,1])for(let S of[-1.5,1.6]){let v=pn(n,.62,.3,p,y*(c+.02),l+.25,S);v.rotation.y=y>0?-gt:gt}}for(let p of[-1,1])I(n,.02,.1,d-1,e.hazard,p*(c+.006),l-.55,-.2)}i.anchors.push({pos:[0,l+c+.2,-d/3],label:"\u0413\u043E\u0440\u043B\u043E\u0432\u0438\u043D\u0430 \u043B\u044E\u043A\u0430"}),i.anchors.push({pos:[0,o+.1,1.1],label:"\u041D\u0438\u0436\u043D\u0438\u0439 \u043D\u0430\u043B\u0438\u0432"})}function $y(i){let{M:t,body:e,W:n,L:s,zFront:r,zRear:o,deckY:a,unit:c}=i,l=_e("#dfe3e4",.4,.35),h=_e(Zn(c,"#7d1a2e"),.5,.3),u=a+.25,d=1.85,f=1.06,_=[-s/4.4,s/4.4];for(let g of _){let m=new Dt(new Ie(f,f,d,28,1,!1),l);m.position.set(0,u+.55+d/2,g),e.add(m);let p=new Dt(new Ie(f,.2,.72,28,1,!1),l);p.position.set(0,u+.55-.36,g),e.add(p),zt(e,.16,.16,.3,t.chromeDark,0,u+.05,g,14);let y=new Dt(new ni(f,28,14,0,rs,0,gt),l);y.position.set(0,u+.55+d,g),y.scale.set(1,.42,1),e.add(y);for(let S of[.25,1,1.7])Sn(e,f+.008,.028,t.steel,0,u+.55+S,g,30);zt(e,.24,.26,.16,t.chromeDark,0,u+.55+d+.32,g,18),zt(e,.28,.28,.05,t.chrome,0,u+.55+d+.42,g,18),Sn(e,f+.004,.06,h,0,u+1.25,g,30);for(let S=0;S<4;S++)I(e,.34,.03,.03,t.steel,.42,u+.85+S*.38,g+f+.06);for(let S of[.26,.58])Vn(e,[S,u+.6,g+f+.06],[S,u+2.4,g+f+.06],.022,t.steel)}for(let g of[-1,1]){I(e,.14,.22,s-1.4,t.darkSteel,g*.92,u-.05,0);for(let m=r+1.4;m<o-1;m+=2.2)I(e,.12,.9,.12,t.darkSteel,g*.92,u-.55,m)}for(let g of[-3.4,0,3.4])I(e,n-.5,.14,.16,t.darkSteel,0,u-.02,g);for(let g of _)for(let m of[-.5,0,.5])I(e,n-.6,.12,.14,t.steel,0,u+.16,g+m);for(let g=-1.2;g<=1.2;g+=.4)I(e,n-.9,.04,.3,t.steel,0,u+.16,g);k(e,.92,.62,.72,t.plasticGray,0,a+.52,r+.75,.05),zt(e,.2,.2,.46,t.steel,.5,a+.56,r+.75,16).rotation.z=gt;for(let g=0;g<4;g++)I(e,.7,.03,.03,t.chromeDark,0,a+.3+g*.13,r+.42);Vn(e,[.42,a+.75,r+.8],[.42,u+1.5,r+2],.05,t.steel),Vn(e,[.42,u+1.5,r+2],[.42,u+1.5,o-1],.05,t.steel);for(let g=0;g<2;g++){let m=new Dt(new vn(.32,.05,8,16,me),t.rubberTrim);m.position.set(.2,a+.4,o-.7-g*.3),m.rotation.y=gt,e.add(m)}k(e,.8,.44,.5,t.plasticGray,-.6,a-.32,-1.2,.03),i.anchors.push({pos:[0,a+1.4,0],label:"\u0411\u0443\u043D\u043A\u0435\u0440-\u0446\u0438\u0441\u0442\u0435\u0440\u043D\u0430"}),i.anchors.push({pos:[0,a+.55,r+.8],label:"\u041A\u043E\u043C\u043F\u0440\u0435\u0441\u0441\u043E\u0440"})}function Jy(i){let{M:t,body:e,bodyMat:n,bodyMat2:s,W:r,H:o,L:a,zFront:c,zRear:l,deckY:h}=i,u=Math.max(o,1.7);k(e,r,.14,a-.3,t.darkSteel,0,h+.2,0,.02);for(let y of[-1,1]){k(e,.1,u,a-.3,n,y*(r/2-.05),h+.2+u/2,0,.02),I(e,.09,.1,a-.4,t.steel,y*(r/2-.03),h+.2+u,0);for(let S=c+.8;S<l-.3;S+=1)I(e,.03,u-.15,.12,s,y*(r/2),h+.2+u/2,S)}I(e,r-.1,u,.12,n,0,h+.2+u/2,c+.22);let d=k(e,r-.1,u-.15,.1,n,0,h+.2+u/2,l-.16,.02);I(e,r-.2,.06,.06,t.steel,0,h+.25+u,l-.12);for(let y of[-1,1])zt(e,.04,.04,.16,t.chromeDark,y*(r/2-.15),h+.25,l-.16,8);let f=k(e,.18,.9,.18,t.hazard,-.55,h+.75,c+1.2,.03),_=zt(e,.05,.05,1.1,t.chrome,-.55,h+1.55,c+1.4,12);_.rotation.x=-.32;let g=k(e,r,.06,a-.5,t.tarp,0,h+.2+u+.04,0,.02),m=_e(Zn(i.unit,"#b04a6a"),.55,.25);for(let y of[-1,1])I(e,.012,.26,a-1,m,y*(r/2+.006),h+.72,0);let p=_e("#6f6a63",.98,.02);for(let y=0;y<26;y++){let S=.12+Math.random()*.12,v=new Dt(new ar(S,0),p);v.position.set((Math.random()-.5)*(r-.5),h+.25+u+.02,(Math.random()-.5)*(a-1.2)),v.rotation.set(Math.random(),Math.random(),Math.random()),e.add(v)}i.anchors.push({pos:[0,h+u+.2,0],label:"\u0421\u0430\u043C\u043E\u0441\u0432\u0430\u043B\u044C\u043D\u044B\u0439 \u043A\u043E\u0432\u0448"})}function Ky(i){let{M:t,body:e,bodyMat:n,bodyMat2:s,W:r,H:o,L:a,zFront:c,zRear:l,deckY:h}=i,u=Math.max(o,2.6);for(let _ of[-1,1]){for(let g=c+.8;g<l-.4;g+=1.2)I(e,.1,u,.1,t.steel,_*(r/2-.1),h+u/2,g);I(e,.1,.1,a-.5,t.steel,_*(r/2-.1),h+u-.1,0),I(e,.1,.1,a-.5,t.darkSteel,_*(r/2-.1),h+u*.5,0)}let d=_e(Zn(i.unit,"#5c6b3b"),.6,.2);for(let _ of[-1,1]){k(e,.06,.75,a-.5,d,_*(r/2),h+.45,0,.02);for(let g=c+.6;g<l-.4;g+=.55)I(e,.05,u-.95,.05,t.steel,_*(r/2),h+.95+(u-.95)/2-.05,g);for(let g of[1.1,1.6,2.1])I(e,.07,.05,a-.4,t.steel,_*(r/2),h+g,0);for(let g=c+1.4;g<l-.8;g+=2.6)I(e,.05,.04,.12,t.amber,_*(r/2+.01),h+.85,g)}I(e,r-.2,.06,a-.5,t.steel,0,h+u*.5,0);for(let _=c+1;_<l-.5;_+=.8)I(e,r-.25,.04,.06,t.darkSteel,0,h+u*.5+.03,_);k(e,r,.08,a-.3,n,0,h+u+.05,0,.02);for(let _=0;_<6;_++)k(e,.62,.12,.62,t.plastic,0,h+u+.12,c+1.4+_*2,.03);for(let _ of[-1,1])I(e,.05,.34,a-.5,t.steel,_*(r/2),h+u-.12,0);let f=k(e,r-.3,.08,2,t.steel,0,h+.05,l+.8,.02);f.rotation.x=.14;for(let _ of[-1,1]){let g=k(e,.18,.18,1.4,t.steel,_*.75,h+.6,-2,.03)}i.anchors.push({pos:[0,h+u*.6,0],label:"\u0414\u0432\u0443\u0445\u044A\u044F\u0440\u0443\u0441\u043D\u044B\u0439 \u043E\u0442\u0441\u0435\u043A"})}function jy(i){let{M:t,body:e,W:n,L:s,zFront:r,zRear:o,deckY:a,halfL:c}=i;k(e,n-.3,.16,s-.4,t.darkSteel,0,a,0,.02);let l=[r+1.4,-1,o-2];for(let _ of l){for(let g of[-1,1]){let m=k(e,.12,1.5,.12,t.steel,g*(n/2-.15),a+.75,_,.02);m.rotation.z=g*.12,I(e,.5,.12,.14,t.darkSteel,g*(n/2-.3),a+.1,_)}I(e,n-.2,.1,.1,t.darkSteel,0,a+.1,_)}let h=_e("#6b4a2e",.95,.02),u=_e("#c9a06a",.9,.02),d=[],f=0;for(let _=0;_<4;_++){let g=4-Math.floor(_/2);for(let m=0;m<g;m++){let p=.19+Math.random()*.05,y=(m-(g-1)/2)*.47,S=a+.28+_*.4,v=.2+(Math.random()-.5)*.5,M=s-1.6,E=zt(e,p,p,M,h,y,S,v,12);E.rotation.x=gt;let A=zt(e,p*.98,p*.98,.03,u,y,S,v-M/2,12);A.rotation.x=gt;let x=zt(e,p*.98,p*.98,.03,u,y,S,v+M/2,12);x.rotation.x=gt,d.push(E)}}for(let _ of[r+1.4,-1,o-2]){I(e,n-.2,.03,.03,t.rope,0,a+1.7,_);for(let g of[-1,1])I(e,.03,1.5,.03,t.rope,g*(n/2-.18),a+.95,_)}i.anchors.push({pos:[0,a+1.2,0],label:"\u0428\u0442\u0430\u0431\u0435\u043B\u044C \u0431\u0440\u0451\u0432\u0435\u043D"})}function Qy(i){let{M:t,body:e,W:n,L:s,zFront:r,zRear:o,deckY:a}=i;I(e,.16,.16,s-2.6,t.darkSteel,0,a-.1,.5);for(let c of[-1,1])I(e,.14,.14,s-2.8,t.steel,c*.5,a-.14,.6);for(let c of[-1.2,.6,2.4,o-.3]){for(let l of[-1,1]){let h=k(e,.1,1.4,.1,t.steel,l*1,a+.6,c,.02);h.rotation.z=l*.15}I(e,n-.4,.12,.12,t.darkSteel,0,a-.05,c)}for(let c=0;c<3;c++){let l=zt(e,.24,.24,7,t.steel,-.6+c*.62,a+.4+c%2*.1,-.4,16);l.rotation.x=gt}k(e,.9,.1,.9,t.darkSteel,0,a-.3,r+2.6,.02),zt(e,.11,.13,.14,t.chrome,0,a-.24,r+2.6,14);for(let c of[-1,1])I(e,.2,.26,.05,t.plastic,c*.9,a-.34,o-.12),I(e,.13,.16,.035,t.taillight,c*.9,a-.32,o-.09),I(e,.5,.4,.03,t.rubberTrim,c*1,.32,o-.55);i.anchors.push({pos:[0,a+.8,1],label:"\u041A\u043E\u043D\u0438\u043A\u0438 \u0438 \u0442\u0440\u0443\u0431\u044B"})}function t1(i,{color:t="#275b78",reefer:e=!1}={}){let{M:n,body:s,W:r,zFront:o,zRear:a,deckY:c}=i,l=Math.min(r,2.44),h=2.55,u=12.2,d=_e(t,.7,.3),f=_e(new te(t).multiplyScalar(.8),.75,.3);k(s,l,h,u,d,0,c+.18+h/2,0,.04);for(let g=o+.9;g<a-.8;g+=.32)for(let m of[-1,1])I(s,.035,h-.18,.1,f,m*(l/2+.012),c+.18+h/2,g);I(s,l,.14,u,n.darkSteel,0,c+.12,0);for(let g of[-1,1]){I(s,.05,h-.2,.08,n.steel,g*.55,c+.18+h/2,a-.75);for(let m=0;m<4;m++)I(s,.06,.3,.06,n.chromeDark,g*.55,c+.4+m*.55,a-.7)}for(let g of[-1,1])for(let m of[-u/2+.35,u/2-.35])for(let p of[c+.2,c+.18+h-.12])I(s,.2,.16,.2,n.steel,g*(l/2-.08),p,m);k(s,l+.04,.1,u,f,0,c+.18+h+.03,0,.02);for(let g=-u/2+.6;g<u/2-.5;g+=.6)I(s,.05,.04,.5,n.steel,0,c+.18+h+.09,g);for(let g of[-.62,-.2,.2,.62]){let m=zt(s,.03,.03,h-.24,n.chromeDark,g,c+.18+h/2,a-.75,8);I(s,.16,.05,.08,n.chrome,g,c+1,a-.72)}let _=Ar("PORTLINE",{width:512,height:128,bg:"rgba(0,0,0,0)",fg:"#f4f2e8",accent:t,font:"bold 62px Arial, sans-serif",border:!1});if(_){let g=new Se({map:_,transparent:!0,roughness:.6});for(let m of[-1,1]){let p=pn(s,2.6,.65,g,m*(l/2+.05),c+.18+h/2+.3,.8);p.rotation.y=m>0?-gt:gt}}if(e){let g=_e("#0f6b70",.5,.3);for(let p of[-1,1])I(s,.02,.34,u-2.6,g,p*(l/2+.02),c+1.05,0);k(s,l-.3,1,.5,n.plasticLight,0,c+.18+h-.7,o+1,.05);for(let p=-3;p<=3;p++)I(s,.05,.7,.03,n.plasticGray,p*.14,c+.18+h-.7,o+.73);let m=zt(s,.28,.28,.08,n.plastic,0,c+.18+h-1.3,o+1,18);m.rotation.x=gt}return{w:l,h,l:u}}function wf(i,t){let{M:e,body:n,W:s,L:r,zFront:o,zRear:a,deckY:c,unit:l}=i;k(n,s-.1,.18,r-.6,e.darkSteel,0,c+.05,0,.02);for(let h of[-5.2,5.2])for(let u of[-1,1])I(n,.24,.14,.24,e.steel,u*(s/2-.3),c+.16,h),I(n,.1,.05,.1,e.chromeDark,u*(s/2-.3),c+.26,h);t1(i,{color:t?"#e8ebe6":l.color,reefer:t}),i.anchors.push({pos:[s/2,c+1.6,0],label:t?"\u0420\u0435\u0444-\u043A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440":"\u041A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440 40\u2032"}),i.anchors.push({pos:[s/2-.3,c+.2,-5.2],label:"Twist-lock \u0444\u0438\u0442\u0438\u043D\u0433"})}function e1(i){var _,g;let{M:t,body:e,W:n,L:s,zFront:r,zRear:o,deckY:a}=i,c=t.steel,l=t.darkSteel;for(let m of[-1,1])I(e,.12,.3,s-.6,l,m*(n/2-.2),a-.02,0);for(let m=r+.8;m<o-.3;m+=1.3)I(e,n-.3,.1,.1,l,0,a+.02,m);let h=a+3.3;for(let m of[r+1,r+6.3,o-1.2])for(let p of[-1,1])I(e,.14,3.4,.14,c,p*(n/2-.15),a+1.7,m);for(let m of[-1,1])I(e,.14,.16,s-1.2,l,m*(n/2-.15),h,0);for(let m=r+1.2;m<o-.8;m+=1.4)I(e,n-.3,.08,.1,l,0,h,m);for(let m of[-1,1]){let p=k(e,.12,1.2,.12,t.hazard,m*1.02,a+.8,r+3.5,.02);p.rotation.x=-.2}let u=["#2f5d8a","#c9402f","#e9ecec","#e0b528","#4f5844","#7a8086"],d=m=>({id:"carrier-car",name:"",brand:"",style:"sedan",paint:m,accent:"#d8d5c8",length:4.5,width:1.82,height:1.42,wheelbase:2.7,wheelRadius:.31,wheelWidth:.2}),f=0;for(let m of[r+2.6,r+7.4]){let p=u[f%u.length],y=Fo(d(p),t,{simple:!0});for(let S of y.paintMats)(_=S.color)==null||_.set(p);y.root.position.set(0,a+.06,m),e.add(y.root),f+=1}for(let m of[r+3.4,r+8.2]){let p=u[f%u.length],y=Fo(d(p),t,{simple:!0});for(let S of y.paintMats)(g=S.color)==null||g.set(p);y.root.position.set(0,h+.06,m),e.add(y.root),f+=1}for(let m of[o-.2]){let p=k(e,n-.6,.1,2.6,t.steel,0,a-.6,o+.9,.02);p.rotation.x=.2}i.anchors.push({pos:[n/2,h-.4,r+5],label:"\u0412\u0435\u0440\u0445\u043D\u044F\u044F \u043F\u0430\u043B\u0443\u0431\u0430"})}function n1(i){let{M:t,body:e,W:n,L:s,zFront:r,zRear:o,deckY:a}=i,c=s/2,l=k(e,n,2.7,7,_e("#d5d8d3",.7,.12),0,a+1.45,r+3.8,.05),h=k(e,n,2.7,6.4,_e("#d5d8d3",.7,.12),0,a+1.45,o-3.6,.05);I(e,.9,.3,2.2,t.darkSteel,0,a+.1,.4);for(let d of[-1,1])I(e,.12,.24,3.2,t.steel,d*.55,a+.05,.4);for(let d of[{z0:r+.6,z1:r+7.2},{z0:o-6.7,z1:o-.4}])for(let f=d.z0;f<d.z1;f+=.6)for(let _ of[-1,1])I(e,.03,2.5,.05,_e("#c2c6c2",.75,.1),_*(n/2+.006),a+1.45,f);for(let d of[1,1.8])for(let f of[-1,1])I(e,.1,.4,.1,t.steel,f*.8,a-.2,d);let u=_e(Zn(i.unit,"#1b4f8a"),.5,.3);for(let d of[-1,1])I(e,.012,.24,6.4,u,d*(n/2+.02),a+.62,r+3.8),I(e,.012,.24,5.8,u,d*(n/2+.02),a+.62,o-3.6),tl(e,{length:6.2,height:.1,y:.42,z:r+3.8,x:d*(n/2+.012),side:d}),tl(e,{length:5.6,height:.1,y:.42,z:o-3.6,x:d*(n/2+.012),side:d});el(e,{W:n,z:o-.06,bottom:a+.12,height:2.56,leafMat:_e("#d5d8d3",.7,.12),liveryMat:u,M:t,leaves:2}),i.anchors.push({pos:[0,a+.2,.4],label:"\u0421\u043E\u0435\u0434\u0438\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u0431\u0430\u043B\u043A\u0430"})}function i1(i){let{M:t,body:e,W:n,zFront:s,zRear:r,deckY:o}=i;for(let d of[-1,1]){let f=I(e,.12,.16,7,t.darkSteel,d*.85,o-.2,.2);for(let _=s+1.4;_<r-1.2;_+=.9){let g=zt(e,.11,.11,.4,t.rubberTrim,d*.85,o-.02,_,12);g.rotation.z=gt}}Vn(e,[-.4,o-.3,s+.5],[0,o-.3,s-1.1],.06,t.steel),Vn(e,[.4,o-.3,s+.5],[0,o-.3,s-1.1],.06,t.steel),zt(e,.09,.09,.3,t.steel,0,o-.5,s-1.25,10).rotation.x=gt,k(e,.3,.3,.4,t.chromeDark,0,o+.05,s+.9,.03);let a=_e("#f2f4f2",.25,.25),c=_e("#1f3d5c",.4,.3),l=new Dt(new ni(1,30,20),a);l.scale.set(.92,.62,2.35),l.position.set(0,o+.46,-.1),e.add(l);let h=Sn(e,.9,.045,_e(Zn(i.unit,"#3d8fc4"),.4,.35),0,o+.4,-.1,44);h.rotation.x=gt,h.scale.set(1,2.4,1),k(e,1.7,.08,4.3,c,0,o+.7,-.1,.16),k(e,1.28,.12,2.1,t.plasticLight,0,o+.74,.35,.1);for(let d of[-1,1])Vn(e,[d*.72,o+.74,-2],[d*.6,o+.78,-1.2],.025,t.chromeDark);k(e,.34,.62,.3,t.darkSteel,0,o+.5,2.2,.04);let u=k(e,1.5,.5,.08,t.glassDark,0,o+1,-2,.03);u.rotation.x=-.35,k(e,1.4,.25,.5,t.plasticLight,0,o+.8,-1.5,.05),k(e,.7,.25,.6,_e("#2d3440",.8,.05),0,o+.82,-.9,.05),k(e,.45,.7,.5,t.plastic,0,o+.9,2.3,.05),I(e,.3,.3,.1,t.plasticGray,0,o+.8,2.58),i.anchors.push({pos:[0,o+1,-.2],label:"\u041A\u0430\u0442\u0435\u0440 \u043D\u0430 \u0440\u043E\u043B\u0438\u043A\u0430\u0445"})}function s1(i){let{M:t,body:e,W:n,L:s,zFront:r,zRear:o,deckY:a}=i;for(let l=0;l<5;l++){let h=r+1.6+l*2.3;for(let u of[-1,1])Vn(e,[u*(n/2-.2),a,h],[0,a+3,h],.06,t.darkSteel),Vn(e,[u*(n/2-.2),a,h],[u*.6,a+1.6,h],.05,t.steel);I(e,n-.3,.1,.14,t.darkSteel,0,a+1.5,h)}let c=new Ai({color:10471872,metalness:.1,roughness:.05,transparent:!0,opacity:.55,side:De,envMapIntensity:1.4});for(let l=0;l<7;l++){let h=I(e,.04,2.3,s-4,c,-.5+l*.11,a+1.2,.2);h.rotation.z=.03}for(let l of[r+3,0,o-3.2])I(e,n-.2,.05,.08,t.rope,0,a+1,l);I(e,.9,.16,s-4.2,t.fabric,-.2,a+.12,.2),i.anchors.push({pos:[0,a+2.2,0],label:"\u041F\u0430\u043A\u0435\u0442 \u043B\u0438\u0441\u0442\u043E\u0432\u043E\u0433\u043E \u0441\u0442\u0435\u043A\u043B\u0430"})}function r1(i){let{M:t,body:e,W:n,L:s,zFront:r,zRear:o,deckY:a,halfL:c}=i;k(e,n,.16,s-.3,t.steel,0,a+.08,0,.02);for(let m=r+.6;m<o-.3;m+=.7)I(e,n-.2,.02,.06,t.darkSteel,0,a+.17,m);for(let m of[-1,1]){I(e,.07,.4,s-.4,t.steel,m*(n/2),a+.35,0);for(let p=r+.6;p<o-.3;p+=1.1)I(e,.06,.36,.05,t.darkSteel,m*(n/2),a+.36,p)}let l=_e("#c94a1e",.5,.3),h=r+1.7;zt(e,.55,.6,.3,t.darkSteel,0,a+.35,h,20);let u=zt(e,.34,.34,1.5,l,0,a+1.2,h,18),d=k(e,.28,.28,4.2,l,0,a+2.1,h+1.4,.05);d.rotation.x=.42;let f=k(e,.2,.2,2.4,l,0,a+2.55,h+3.6,.03);f.rotation.x=-.55;let _=zt(e,.06,.06,1.5,t.chrome,0,a+1.35,h+.65,10);_.rotation.x=1,Vn(e,[0,a+2.05,h+4.5],[0,a+1.25,h+4.5],.012,t.steel);let g=new Dt(new vn(.12,.03,6,12,me*1.4),t.steel);g.position.set(0,a+1.15,h+4.5),g.rotation.x=gt,e.add(g);for(let m of[-1,1]){let p=k(e,.9,.16,.22,t.darkSteel,m*(n/2+.2),a-.02,h-1.1,.02);I(e,.16,.9,.16,t.hazard,m*(n/2+.5),a-.45,h-1.1),I(e,.38,.06,.38,t.steel,m*(n/2+.5),a-.9,h-1.1)}for(let m=0;m<3;m++)k(e,1.1,1.2,1.2,t.wood,.2,a+.75,c-2.2-m*1.5,.02);i.anchors.push({pos:[0,a+2.2,h+1.4],label:"\u041A\u0440\u0430\u043D-\u043C\u0430\u043D\u0438\u043F\u0443\u043B\u044F\u0442\u043E\u0440"})}function o1(i){var m;let{M:t,body:e,bodyMat:n,bodyMat2:s,W:r,L:o,zFront:a,zRear:c,deckY:l,unit:h}=i,u=Math.max((m=h.height)!=null?m:1.8,1.6);k(e,r,.14,o-.3,t.darkSteel,0,l+.2,0,.02);let d=ke(e);d.position.set(-r/2+.12,l+.2,0),d.rotation.z=-.12;let f=n;k(d,r,u,o-.4,f,r/2,u/2,0,.03);for(let p of[-1,1]){I(d,.08,.1,o-.5,t.steel,r/2+p*(r/2-.02),u,0);for(let y=a+.8;y<c-.3;y+=1.1)I(d,.03,u-.15,.1,s,r/2+p*(r/2),u/2,y)}I(d,r,u,.1,n,r/2,u/2,a+.2),I(d,r,u,.1,n,r/2,u/2,c-.2);let _=_e(Zn(i.unit,"#37a58c"),.55,.25);for(let p of[-1,1])I(d,.012,.24,o-1,_,r/2+p*(r/2+.006),u*.55,0);for(let p of[a+1.5,c-1.5]){let y=zt(e,.09,.09,1.2,t.hazard,-r/2+.3,l+.7,p,12);y.rotation.z=.4}let g=_e("#8a7f6a",.98,.02);for(let p=0;p<20;p++){let y=.1+Math.random()*.1,S=new Dt(new ar(y,0),g);S.position.set((Math.random()-.2)*(r-.4),l+u+.1,(Math.random()-.5)*(o-1)),S.rotation.set(Math.random(),Math.random(),Math.random()),e.add(S)}i.anchors.push({pos:[0,l+u,0],label:"\u0411\u043E\u043A\u043E\u0432\u043E\u0439 \u0441\u0430\u043C\u043E\u0441\u0432\u0430\u043B"})}function nl(i,t){return i.category==="trucks"?bf(i,t):i.category==="trailers"?Tf(i,t):Fo(i,t)}var Af=[{id:"trucks",title:"\u0422\u042F\u0413\u0410\u0427\u0418",short:"\u0422\u044F\u0433\u0430\u0447\u0438",icon:"\u{1F69B}",count:10,hint:"10 \u043C\u043E\u0434\u0435\u043B\u0435\u0439 \xB7 \u0441\u0435\u0434\u0435\u043B\u044C\u043D\u044B\u0435 \u0442\u044F\u0433\u0430\u0447\u0438"},{id:"trailers",title:"\u041F\u0420\u0418\u0426\u0415\u041F\u042B",short:"\u041F\u0440\u0438\u0446\u0435\u043F\u044B",icon:"\u{1F4E6}",count:20,hint:"20 \u0442\u0438\u043F\u043E\u0432 \xB7 \u043E\u0442 \u0448\u0442\u043E\u0440\u043A\u0438 \u0434\u043E \u0446\u0438\u0441\u0442\u0435\u0440\u043D\u044B"},{id:"cars",title:"\u0410\u0412\u0422\u041E\u041C\u041E\u0411\u0418\u041B\u0418",short:"\u0410\u0432\u0442\u043E",icon:"\u{1F697}",count:10,hint:"10 \u043C\u043E\u0434\u0435\u043B\u0435\u0439 \xB7 \u043E\u0442 \u043C\u0438\u043A\u0440\u043E\u043A\u0430\u0440\u0430 \u0434\u043E \u0441\u043F\u043E\u0440\u0442\u043A\u0430\u0440\u0430"}],_i={night:"#1f2933",graphite:"#2f353b",black:"#101214",white:"#e9ecec",ivory:"#ddd6c3",silver:"#b9c0c6",gray:"#6f777e",red:"#a4241d",crimson:"#7d1a2e",orange:"#cf5a13",amber:"#d99a1e",yellow:"#e0b528",olive:"#5c6b3b",green:"#1f6b45",mint:"#37a58c",teal:"#0f6b70",blue:"#1b4f8a",navy:"#16233f",sky:"#3d8fc4",violet:"#4b3c85",purple:"#6d2a6b",rose:"#b04a6a",brown:"#5a3c25",copper:"#a35a2c",sand:"#c2a878"},Oo=[{id:"atlas-vision",name:"ATLAS Vision 4\xD72",brand:"ATLAS",model:"Vision",tagline:"\u041C\u0430\u0433\u0438\u0441\u0442\u0440\u0430\u043B\u044C\u043D\u044B\u0439 \u0442\u0440\u0443\u0434\u044F\u0433\u0430 \u0441 \u0432\u044B\u0441\u043E\u043A\u043E\u0439 \u043A\u0430\u0431\u0438\u043D\u043E\u0439",desc:"\u0421\u0430\u043C\u044B\u0439 \u043F\u043E\u043F\u0443\u043B\u044F\u0440\u043D\u044B\u0439 \u0442\u044F\u0433\u0430\u0447 \u0441\u0435\u0440\u0438\u0438: \u0432\u044B\u0441\u043E\u043A\u0430\u044F \u043A\u0430\u0431\u0438\u043D\u0430 \u0441 \u0434\u0432\u0443\u043C\u044F \u0441\u043F\u0430\u043B\u044C\u043D\u044B\u043C\u0438 \u043C\u0435\u0441\u0442\u0430\u043C\u0438, \u043E\u0431\u0442\u0435\u043A\u0430\u0435\u043C\u044B\u0439 \u043E\u0431\u0432\u0435\u0441 \u0438 12-\u0441\u0442\u0443\u043F\u0435\u043D\u0447\u0430\u0442\u0430\u044F \u043A\u043E\u0440\u043E\u0431\u043A\u0430. \u0421\u043E\u0437\u0434\u0430\u043D \u0434\u043B\u044F \u0434\u043B\u0438\u043D\u043D\u044B\u0445 \u0440\u0435\u0439\u0441\u043E\u0432 \u043F\u043E \u0442\u0440\u0430\u0441\u0441\u0435.",style:"euro",roof:"high",length:6.2,cabHeight:3.55,paint:_i.blue,accent:"#e8b45a",chrome:!0,fenders:!0,deflectors:!0,sideSkirts:!0,wheel:{radius:.535,width:.42,style:"truck",rimColor:"#d9dde0"},tags:["\u043C\u0430\u0433\u0438\u0441\u0442\u0440\u0430\u043B\u044C\u043D\u044B\u0439","4\xD72","\u0432\u044B\u0441\u043E\u043A\u0430\u044F \u043A\u0430\u0431\u0438\u043D\u0430"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","460 \u043B.\u0441."],["\u041A\u0440\u0443\u0442\u044F\u0449\u0438\u0439 \u043C\u043E\u043C\u0435\u043D\u0442","2 300 \u041D\xB7\u043C"],["\u041A\u043E\u0440\u043E\u0431\u043A\u0430 \u043F\u0435\u0440\u0435\u0434\u0430\u0447","12-\u0441\u0442. \u0430\u0432\u0442\u043E\u043C\u0430\u0442"],["\u041F\u0440\u0438\u0432\u043E\u0434","4\xD72"],["\u041F\u043E\u043B\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","18 000 \u043A\u0433"],["\u0411\u0430\u043A","1 200 \u043B"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","89 \u043A\u043C/\u0447"],["\u0426\u0435\u043D\u0430","8 900 000 \u20BD"]]},{id:"nordwind-aurora",name:"NORDWIND Aurora 6\xD72",brand:"NORDWIND",model:"Aurora",tagline:"\u0424\u043B\u0430\u0433\u043C\u0430\u043D \u0441 \u043A\u0430\u0431\u0438\u043D\u043E\u0439-\u043F\u0435\u043D\u0442\u0445\u0430\u0443\u0441\u043E\u043C",desc:"\u041A\u0430\u0431\u0438\u043D\u0430-\u043C\u0435\u0433\u0430 \u0441 \u0440\u043E\u0432\u043D\u044B\u043C \u043F\u043E\u043B\u043E\u043C, \u0445\u043E\u043B\u043E\u0434\u0438\u043B\u044C\u043D\u0438\u043A\u043E\u043C \u0438 \u0440\u0430\u0431\u043E\u0447\u0438\u043C \u0441\u0442\u043E\u043B\u043E\u043C. \u0422\u0440\u0438 \u043E\u0441\u0438, \u043F\u043E\u0434\u044A\u0451\u043C\u043D\u044B\u0439 \u043C\u043E\u0441\u0442 \u0438 \u0430\u044D\u0440\u043E\u0434\u0438\u043D\u0430\u043C\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u043F\u0430\u043A\u0435\u0442 \u0434\u043B\u044F \u044D\u043A\u043E\u043D\u043E\u043C\u0438\u0438 \u0442\u043E\u043F\u043B\u0438\u0432\u0430.",style:"euro",roof:"mega",length:6.6,cabHeight:4.05,paint:_i.white,accent:"#12908f",chrome:!0,fenders:!0,deflectors:!0,sideSkirts:!0,thirdAxle:!0,meta:"6\xD72",wheel:{radius:.535,width:.42,style:"truck",rimColor:"#c9d1d5"},tags:["\u043C\u0435\u0433\u0430-\u043A\u0430\u0431\u0438\u043D\u0430","6\xD72","\u0444\u043B\u0430\u0433\u043C\u0430\u043D"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","530 \u043B.\u0441."],["\u041A\u0440\u0443\u0442\u044F\u0449\u0438\u0439 \u043C\u043E\u043C\u0435\u043D\u0442","2 600 \u041D\xB7\u043C"],["\u041A\u043E\u0440\u043E\u0431\u043A\u0430 \u043F\u0435\u0440\u0435\u0434\u0430\u0447","12-\u0441\u0442. \u0430\u0432\u0442\u043E\u043C\u0430\u0442"],["\u041F\u0440\u0438\u0432\u043E\u0434","6\xD72 (\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u044B\u0439 \u043C\u043E\u0441\u0442)"],["\u041F\u043E\u043B\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","26 000 \u043A\u0433"],["\u0411\u0430\u043A","1 500 \u043B"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","89 \u043A\u043C/\u0447"],["\u0426\u0435\u043D\u0430","12 400 000 \u20BD"]]},{id:"vulcan-titan",name:"VULCAN Titan 6\xD74",brand:"VULCAN",model:"Titan",tagline:"\u041A\u043B\u0430\u0441\u0441\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u043A\u0430\u043F\u043E\u0442\u043D\u0438\u043A \u0434\u043B\u044F \u0442\u044F\u0436\u0451\u043B\u044B\u0445 \u0433\u0440\u0443\u0437\u043E\u0432",desc:"\u0414\u043B\u0438\u043D\u043D\u044B\u0439 \u043A\u0430\u043F\u043E\u0442, \u043E\u0433\u0440\u043E\u043C\u043D\u0430\u044F \u0445\u0440\u043E\u043C\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u0430\u044F \u0440\u0435\u0448\u0451\u0442\u043A\u0430 \u0438 \u0432\u044B\u0445\u043B\u043E\u043F\u043D\u044B\u0435 \u0442\u0440\u0443\u0431\u044B \u043F\u043E \u0431\u043E\u043A\u0430\u043C. \u0422\u044F\u0433\u0430\u0447 \u0434\u043B\u044F \u0442\u044F\u0436\u0435\u043B\u043E\u0432\u043E\u0437\u043D\u044B\u0445 \u043F\u043E\u043B\u0443\u043F\u0440\u0438\u0446\u0435\u043F\u043E\u0432 \u0438 \u0440\u0430\u0431\u043E\u0442\u044B \u0432 \u043A\u0430\u0440\u044C\u0435\u0440\u0435.",style:"bonnet",roof:"sleeper",length:7.6,cabHeight:3.5,bonnet:2.15,paint:_i.crimson,accent:"#cfd3d5",chrome:!0,fenders:!0,stacks:!0,chromeBumper:!0,wheel:{radius:.55,width:.46,style:"truck",rimColor:"#d8d2c4"},tags:["\u043A\u0430\u043F\u043E\u0442\u043D\u0438\u043A","6\xD74","\u0442\u044F\u0436\u0435\u043B\u043E\u0432\u043E\u0437"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","620 \u043B.\u0441."],["\u041A\u0440\u0443\u0442\u044F\u0449\u0438\u0439 \u043C\u043E\u043C\u0435\u043D\u0442","3 000 \u041D\xB7\u043C"],["\u041A\u043E\u0440\u043E\u0431\u043A\u0430 \u043F\u0435\u0440\u0435\u0434\u0430\u0447","16-\u0441\u0442. \u043C\u0435\u0445\u0430\u043D\u0438\u043A\u0430"],["\u041F\u0440\u0438\u0432\u043E\u0434","6\xD74"],["\u041F\u043E\u043B\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","33 000 \u043A\u0433"],["\u0411\u0430\u043A","1 000 \u043B"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","89 \u043A\u043C/\u0447"],["\u0426\u0435\u043D\u0430","14 700 000 \u20BD"]]},{id:"helios-spark",name:"HELIOS Spark",brand:"HELIOS",model:"Spark",tagline:"\u0413\u043E\u0440\u043E\u0434\u0441\u043A\u043E\u0439 \u0440\u0430\u0437\u0432\u043E\u0437\u043D\u043E\u0439 \u0442\u044F\u0433\u0430\u0447",desc:"\u041D\u0438\u0437\u043A\u0430\u044F \u0434\u043D\u0435\u0432\u043D\u0430\u044F \u043A\u0430\u0431\u0438\u043D\u0430, \u043A\u043E\u0440\u043E\u0442\u043A\u0430\u044F \u0431\u0430\u0437\u0430 \u0438 \u043E\u0431\u0437\u043E\u0440\u043D\u0430\u044F \u043F\u043E\u0441\u0430\u0434\u043A\u0430. \u0418\u0434\u0435\u0430\u043B\u0435\u043D \u0434\u043B\u044F \u0433\u043E\u0440\u043E\u0434\u0430: \u0440\u0430\u0437\u0432\u043E\u0437\u043A\u0430 \u043F\u043E \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u0430\u043C \u0438 \u0441\u043A\u043B\u0430\u0434\u0430\u043C.",style:"euro",roof:"day",length:4.7,cabHeight:2.85,paint:_i.orange,accent:"#f4f1e8",chrome:!1,fenders:!0,sideSkirts:!1,wheel:{radius:.505,width:.38,style:"truck",rimColor:"#cdd2d4"},tags:["\u0433\u043E\u0440\u043E\u0434\u0441\u043A\u043E\u0439","4\xD72","\u0434\u043D\u0435\u0432\u043D\u0430\u044F \u043A\u0430\u0431\u0438\u043D\u0430"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","320 \u043B.\u0441."],["\u041A\u0440\u0443\u0442\u044F\u0449\u0438\u0439 \u043C\u043E\u043C\u0435\u043D\u0442","1 600 \u041D\xB7\u043C"],["\u041A\u043E\u0440\u043E\u0431\u043A\u0430 \u043F\u0435\u0440\u0435\u0434\u0430\u0447","6-\u0441\u0442. \u0430\u0432\u0442\u043E\u043C\u0430\u0442"],["\u041F\u0440\u0438\u0432\u043E\u0434","4\xD72"],["\u041F\u043E\u043B\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","16 000 \u043A\u0433"],["\u0411\u0430\u043A","400 \u043B"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","85 \u043A\u043C/\u0447"],["\u0426\u0435\u043D\u0430","6 200 000 \u20BD"]]},{id:"orion-x",name:"ORION X",brand:"ORION",model:"X",tagline:"\u042D\u043B\u0435\u043A\u0442\u0440\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0442\u044F\u0433\u0430\u0447 \u0431\u0443\u0434\u0443\u0449\u0435\u0433\u043E",desc:"\u0413\u043B\u0430\u0434\u043A\u0438\u0439 \u043A\u0443\u0437\u043E\u0432 \u0431\u0435\u0437 \u0432\u044B\u0441\u0442\u0443\u043F\u0430\u044E\u0449\u0438\u0445 \u0437\u0435\u0440\u043A\u0430\u043B \u2014 \u0438\u0445 \u0437\u0430\u043C\u0435\u043D\u0438\u043B\u0438 \u043A\u0430\u043C\u0435\u0440\u044B. \u0411\u0430\u0442\u0430\u0440\u0435\u044F \u0432 \u0440\u0430\u043C\u0435, \u043E\u0433\u0440\u043E\u043C\u043D\u044B\u0439 \u0441\u0435\u043D\u0441\u043E\u0440\u043D\u044B\u0439 \u0434\u0438\u0441\u043F\u043B\u0435\u0439 \u0438 \u0441\u0432\u0435\u0442\u044F\u0449\u0430\u044F\u0441\u044F \u043F\u0435\u0440\u0435\u0434\u043D\u044F\u044F \u043F\u0430\u043D\u0435\u043B\u044C.",style:"futuristic",roof:"aero",length:6.4,cabHeight:3.75,paint:_i.silver,accent:"#25d0e0",chrome:!0,fenders:!0,deflectors:!0,sideSkirts:!0,led:!0,wheel:{radius:.53,width:.42,style:"truck",rimColor:"#2c3237"},tags:["\u044D\u043B\u0435\u043A\u0442\u0440\u043E\u0432\u043E\u0437","4\xD72","\u043A\u0430\u043C\u0435\u0440\u044B \u0432\u043C\u0435\u0441\u0442\u043E \u0437\u0435\u0440\u043A\u0430\u043B"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","480 \u043A\u0412\u0442 (~650 \u043B.\u0441.)"],["\u041A\u0440\u0443\u0442\u044F\u0449\u0438\u0439 \u043C\u043E\u043C\u0435\u043D\u0442","3 400 \u041D\xB7\u043C"],["\u041A\u043E\u0440\u043E\u0431\u043A\u0430 \u043F\u0435\u0440\u0435\u0434\u0430\u0447","2-\u0441\u0442. \u0440\u0435\u0434\u0443\u043A\u0442\u043E\u0440"],["\u041F\u0440\u0438\u0432\u043E\u0434","4\xD72"],["\u0411\u0430\u0442\u0430\u0440\u0435\u044F","620 \u043A\u0412\u0442\xB7\u0447"],["\u0417\u0430\u043F\u0430\u0441 \u0445\u043E\u0434\u0430","480 \u043A\u043C"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","90 \u043A\u043C/\u0447"],["\u0426\u0435\u043D\u0430","19 800 000 \u20BD"]]},{id:"meridian-grand",name:"MERIDIAN Grand",brand:"MERIDIAN",model:"Grand",tagline:"\u041F\u0440\u0435\u0434\u0441\u0442\u0430\u0432\u0438\u0442\u0435\u043B\u044C\u0441\u043A\u0438\u0439 \u0442\u044F\u0433\u0430\u0447 \u0441 \u043A\u0430\u0431\u0438\u043D\u043E\u0439-\u043B\u044E\u043A\u0441",desc:"\u041A\u043E\u0436\u0430\u043D\u044B\u0439 \u0441\u0430\u043B\u043E\u043D, \u043F\u0430\u043D\u043E\u0440\u0430\u043C\u043D\u043E\u0435 \u043E\u0441\u0442\u0435\u043A\u043B\u0435\u043D\u0438\u0435 \u0438 \u0431\u043E\u043B\u044C\u0448\u043E\u0439 \u0431\u043E\u043A\u043E\u0432\u043E\u0439 \u0434\u0435\u0444\u043B\u0435\u043A\u0442\u043E\u0440. \u0412\u043D\u0435\u0448\u043D\u0435 \u0441\u043F\u043E\u043A\u043E\u0439\u043D\u044B\u0439, \u0432\u043D\u0443\u0442\u0440\u0438 \u2014 \u043C\u0430\u043B\u0435\u043D\u044C\u043A\u0430\u044F \u0433\u043E\u0441\u0442\u0438\u043D\u0430\u044F.",style:"euro",roof:"high",length:6.4,cabHeight:3.7,paint:_i.ivory,accent:"#8c6d3f",chrome:!0,fenders:!0,deflectors:!0,sideSkirts:!0,luxury:!0,wheel:{radius:.535,width:.42,style:"truck",rimColor:"#e5e1d6"},tags:["\u043B\u044E\u043A\u0441","4\xD72","\u043F\u0430\u043D\u043E\u0440\u0430\u043C\u0430"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","500 \u043B.\u0441."],["\u041A\u0440\u0443\u0442\u044F\u0449\u0438\u0439 \u043C\u043E\u043C\u0435\u043D\u0442","2 450 \u041D\xB7\u043C"],["\u041A\u043E\u0440\u043E\u0431\u043A\u0430 \u043F\u0435\u0440\u0435\u0434\u0430\u0447","12-\u0441\u0442. \u0430\u0432\u0442\u043E\u043C\u0430\u0442"],["\u041F\u0440\u0438\u0432\u043E\u0434","4\xD72"],["\u041F\u043E\u043B\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","18 000 \u043A\u0433"],["\u0411\u0430\u043A","1 300 \u043B"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","89 \u043A\u043C/\u0447"],["\u0426\u0435\u043D\u0430","11 300 000 \u20BD"]]},{id:"kargo-standard",name:"KARGO Standard",brand:"KARGO",model:"Standard",tagline:"\u0420\u0430\u0431\u043E\u0447\u0430\u044F \u043B\u043E\u0448\u0430\u0434\u043A\u0430 \u0431\u0435\u0437 \u0438\u0437\u043B\u0438\u0448\u0435\u0441\u0442\u0432",desc:"\u041F\u0440\u043E\u0441\u0442\u0430\u044F \u043F\u043B\u043E\u0441\u043A\u0430\u044F \u043A\u0440\u044B\u0448\u0430, \u043C\u0438\u043D\u0438\u043C\u0443\u043C \u0445\u0440\u043E\u043C\u0430, \u0440\u0435\u043C\u043E\u043D\u0442\u043E\u043F\u0440\u0438\u0433\u043E\u0434\u043D\u043E\u0441\u0442\u044C \u0438 \u043D\u0430\u0434\u0451\u0436\u043D\u043E\u0441\u0442\u044C. \u0421\u0430\u043C\u044B\u0439 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B\u0439 \u0442\u044F\u0433\u0430\u0447 \u043A\u0430\u0442\u0430\u043B\u043E\u0433\u0430.",style:"euro",roof:"flat",length:5.9,cabHeight:3.05,paint:_i.green,accent:"#d8d5c8",chrome:!1,fenders:!0,deflectors:!1,sideSkirts:!1,wheel:{radius:.52,width:.4,style:"truck",rimColor:"#cfd2d3"},tags:["\u0431\u044E\u0434\u0436\u0435\u0442\u043D\u044B\u0439","4\xD72","\u043F\u043B\u043E\u0441\u043A\u0430\u044F \u043A\u0440\u044B\u0448\u0430"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","400 \u043B.\u0441."],["\u041A\u0440\u0443\u0442\u044F\u0449\u0438\u0439 \u043C\u043E\u043C\u0435\u043D\u0442","1 950 \u041D\xB7\u043C"],["\u041A\u043E\u0440\u043E\u0431\u043A\u0430 \u043F\u0435\u0440\u0435\u0434\u0430\u0447","12-\u0441\u0442. \u043C\u0435\u0445\u0430\u043D\u0438\u043A\u0430"],["\u041F\u0440\u0438\u0432\u043E\u0434","4\xD72"],["\u041F\u043E\u043B\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","18 000 \u043A\u0433"],["\u0411\u0430\u043A","900 \u043B"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","89 \u043A\u043C/\u0447"],["\u0426\u0435\u043D\u0430","5 400 000 \u20BD"]]},{id:"stellar-wave",name:"STELLAR Wave",brand:"STELLAR",model:"Wave",tagline:"\u041D\u0438\u0437\u043A\u043E\u043F\u043E\u043B\u044C\u043D\u044B\u0439 \u0442\u044F\u0433\u0430\u0447 \u0434\u043B\u044F \u0442\u044F\u0436\u0451\u043B\u043E\u0439 \u0441\u0446\u0435\u043F\u043A\u0438",desc:"\u041A\u0430\u0431\u0438\u043D\u0430 \u0441 \u043D\u0438\u0437\u043A\u0438\u043C \u0432\u0445\u043E\u0434\u043E\u043C \u0438 \u0440\u043E\u0432\u043D\u044B\u043C \u043F\u043E\u043B\u043E\u043C, \u043E\u0433\u0440\u043E\u043C\u043D\u043E\u0435 \u043B\u043E\u0431\u043E\u0432\u043E\u0435 \u0441\u0442\u0435\u043A\u043B\u043E \u0438 \u043E\u0431\u0437\u043E\u0440 \u043A\u0430\u043A \u0443 \u0430\u0432\u0442\u043E\u0431\u0443\u0441\u0430. \u0414\u043B\u044F \u0440\u0430\u0431\u043E\u0442\u044B \u0432 \u043F\u043E\u0440\u0442\u0443 \u0438 \u043D\u0430 \u043A\u043E\u043C\u0431\u0438\u043D\u0430\u0442\u0430\u0445.",style:"lowentry",roof:"bus",length:5.4,cabHeight:3,paint:_i.violet,accent:"#37a58c",chrome:!0,fenders:!0,deflectors:!1,sideSkirts:!0,wheel:{radius:.5,width:.4,style:"truck",rimColor:"#d2d6d8"},tags:["\u043D\u0438\u0437\u043A\u043E\u043F\u043E\u043B\u044C\u043D\u044B\u0439","\u043F\u043E\u0440\u0442","\u043F\u0430\u043D\u043E\u0440\u0430\u043C\u043D\u044B\u0439 \u043E\u0431\u0437\u043E\u0440"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","360 \u043B.\u0441."],["\u041A\u0440\u0443\u0442\u044F\u0449\u0438\u0439 \u043C\u043E\u043C\u0435\u043D\u0442","1 800 \u041D\xB7\u043C"],["\u041A\u043E\u0440\u043E\u0431\u043A\u0430 \u043F\u0435\u0440\u0435\u0434\u0430\u0447","6-\u0441\u0442. \u0430\u0432\u0442\u043E\u043C\u0430\u0442"],["\u041F\u0440\u0438\u0432\u043E\u0434","4\xD72"],["\u041F\u043E\u043B\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","19 000 \u043A\u0433"],["\u0411\u0430\u043A","600 \u043B"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","80 \u043A\u043C/\u0447"],["\u0426\u0435\u043D\u0430","7 100 000 \u20BD"]]},{id:"terra-worker",name:"TERRA Worker 8\xD74",brand:"TERRA",model:"Worker",tagline:"\u0422\u044F\u0436\u0451\u043B\u044B\u0439 \u043A\u0430\u0440\u044C\u0435\u0440\u043D\u044B\u0439 \u0442\u044F\u0433\u0430\u0447",desc:"\u0427\u0435\u0442\u044B\u0440\u0435 \u043E\u0441\u0438, \u0443\u0441\u0438\u043B\u0435\u043D\u043D\u0430\u044F \u0440\u0430\u043C\u0430, \u0441\u0442\u0430\u043B\u044C\u043D\u044B\u0435 \u0431\u0430\u043C\u043F\u0435\u0440\u044B \u0438 \u0437\u0430\u0449\u0438\u0442\u0430 \u0444\u0430\u0440. \u0421\u0435\u0440\u044C\u0451\u0437\u043D\u0430\u044F \u043C\u0430\u0448\u0438\u043D\u0430 \u0434\u043B\u044F \u0442\u044F\u0433\u0430\u0447\u0435\u0439-\u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C \u0438 \u043D\u0435\u0433\u0430\u0431\u0430\u0440\u0438\u0442\u0430.",style:"euro",roof:"high",length:8.4,cabHeight:3.6,paint:_i.black,accent:"#e07a1c",chrome:!1,fenders:!0,deflectors:!1,sideSkirts:!1,thirdAxle:!0,heavy:!0,wheel:{radius:.58,width:.5,style:"truck",rimColor:"#b9b4a6"},tags:["8\xD74","\u043A\u0430\u0440\u044C\u0435\u0440\u0430","\u0443\u0441\u0438\u043B\u0435\u043D\u043D\u0430\u044F \u0440\u0430\u043C\u0430"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","700 \u043B.\u0441."],["\u041A\u0440\u0443\u0442\u044F\u0449\u0438\u0439 \u043C\u043E\u043C\u0435\u043D\u0442","3 550 \u041D\xB7\u043C"],["\u041A\u043E\u0440\u043E\u0431\u043A\u0430 \u043F\u0435\u0440\u0435\u0434\u0430\u0447","16-\u0441\u0442. \u0430\u0432\u0442\u043E\u043C\u0430\u0442"],["\u041F\u0440\u0438\u0432\u043E\u0434","8\xD74"],["\u041F\u043E\u043B\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","41 000 \u043A\u0433"],["\u0411\u0430\u043A","1 100 \u043B"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","75 \u043A\u043C/\u0447"],["\u0426\u0435\u043D\u0430","17 900 000 \u20BD"]]},{id:"polaris-lite",name:"POLARIS Lite",brand:"POLARIS",model:"Lite",tagline:"\u041A\u043E\u043C\u043F\u0430\u043A\u0442\u043D\u044B\u0439 \u0442\u044F\u0433\u0430\u0447 \u0434\u043B\u044F \u0440\u0435\u0433\u0438\u043E\u043D\u0430\u043B\u043A\u0438",desc:"\u041A\u043E\u0440\u043E\u0442\u043A\u0430\u044F \u043A\u0430\u0431\u0438\u043D\u0430 \u0441 \u043E\u0434\u043D\u0438\u043C \u0441\u043F\u0430\u043B\u044C\u043D\u044B\u043C \u043C\u0435\u0441\u0442\u043E\u043C, \u043B\u0451\u0433\u043A\u0438\u0439 \u043A\u0443\u0437\u043E\u0432 \u0438 \u043C\u0430\u043B\u044B\u0439 \u0440\u0430\u0434\u0438\u0443\u0441 \u0440\u0430\u0437\u0432\u043E\u0440\u043E\u0442\u0430. \u0414\u043B\u044F \u0440\u0435\u0433\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0445 \u0440\u0435\u0439\u0441\u043E\u0432 \u043D\u0430 300\u2013500 \u043A\u043C.",style:"euro",roof:"low",length:5.2,cabHeight:3.2,paint:_i.red,accent:"#1f2933",chrome:!0,fenders:!0,deflectors:!0,sideSkirts:!0,wheel:{radius:.52,width:.4,style:"truck",rimColor:"#d5d8da"},tags:["\u0440\u0435\u0433\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0439","4\xD72","\u043A\u043E\u043C\u043F\u0430\u043A\u0442\u043D\u044B\u0439"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","380 \u043B.\u0441."],["\u041A\u0440\u0443\u0442\u044F\u0449\u0438\u0439 \u043C\u043E\u043C\u0435\u043D\u0442","1 750 \u041D\xB7\u043C"],["\u041A\u043E\u0440\u043E\u0431\u043A\u0430 \u043F\u0435\u0440\u0435\u0434\u0430\u0447","9-\u0441\u0442. \u0430\u0432\u0442\u043E\u043C\u0430\u0442"],["\u041F\u0440\u0438\u0432\u043E\u0434","4\xD72"],["\u041F\u043E\u043B\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","18 000 \u043A\u0433"],["\u0411\u0430\u043A","700 \u043B"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","89 \u043A\u043C/\u0447"],["\u0426\u0435\u043D\u0430","4 950 000 \u20BD"]]}],Bo=[{id:"curtain",name:"\u0428\u0442\u043E\u0440\u043D\u044B\u0439 \u043F\u043E\u043B\u0443\u043F\u0440\u0438\u0446\u0435\u043F",brand:"TRAILGO",type:"curtain",length:13.6,width:2.55,height:2.75,color:"#cfd3d0",tagline:"\u0423\u043D\u0438\u0432\u0435\u0440\u0441\u0430\u043B \u0434\u043B\u044F \u043F\u0430\u043B\u043B\u0435\u0442 \u0438 \u043A\u043E\u0440\u043E\u0431\u043E\u043A",desc:"\u0411\u043E\u043A\u043E\u0432\u044B\u0435 \u0448\u0442\u043E\u0440\u044B \u043D\u0430 \u0440\u043E\u043B\u0438\u043A\u0430\u0445, \u0440\u0430\u0437\u0434\u0432\u0438\u0436\u043D\u0430\u044F \u043A\u0440\u044B\u0448\u0430 \u0438 33 \u0435\u0432\u0440\u043E\u043F\u0430\u043B\u043B\u0435\u0442\u044B \u0432\u043D\u0443\u0442\u0440\u0438. \u0421\u0430\u043C\u044B\u0439 \u0440\u0430\u0441\u043F\u0440\u043E\u0441\u0442\u0440\u0430\u043D\u0451\u043D\u043D\u044B\u0439 \u0442\u0438\u043F \u0432 \u0415\u0432\u0440\u043E\u043F\u0435.",tags:["\u0443\u043D\u0438\u0432\u0435\u0440\u0441\u0430\u043B\u044C\u043D\u044B\u0439","3 \u043E\u0441\u0438","33 \u043F\u0430\u043B\u043B\u0435\u0442\u044B"],specs:[["\u0414\u043B\u0438\u043D\u0430","13,6 \u043C"],["\u0412\u043D\u0443\u0442\u0440\u0435\u043D\u043D\u0438\u0439 \u043E\u0431\u044A\u0451\u043C","92 \u043C\xB3"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","24 000 \u043A\u0433"],["\u041E\u0441\u0438","3"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","6 800 \u043A\u0433"],["\u0426\u0435\u043D\u0430","2 150 000 \u20BD"]]},{id:"van",name:"\u0418\u0437\u043E\u0442\u0435\u0440\u043C\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0444\u0443\u0440\u0433\u043E\u043D",brand:"TRAILGO",type:"van",length:13.6,width:2.55,height:2.8,color:"#e7e9e6",tagline:"\u0413\u0435\u0440\u043C\u0435\u0442\u0438\u0447\u043D\u044B\u0439 \u043A\u0443\u0437\u043E\u0432 \u0441 \u0436\u0451\u0441\u0442\u043A\u0438\u043C\u0438 \u0441\u0442\u0435\u043D\u043A\u0430\u043C\u0438",desc:"\u0426\u0435\u043B\u044C\u043D\u043E\u043C\u0435\u0442\u0430\u043B\u043B\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0444\u0443\u0440\u0433\u043E\u043D \u0441 \u0441\u044D\u043D\u0434\u0432\u0438\u0447-\u043F\u0430\u043D\u0435\u043B\u044F\u043C\u0438. \u0414\u0435\u0440\u0436\u0438\u0442 \u0442\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u0443 \u0438 \u0437\u0430\u0449\u0438\u0449\u0430\u0435\u0442 \u0433\u0440\u0443\u0437 \u043E\u0442 \u0432\u043B\u0430\u0433\u0438.",tags:["\u0438\u0437\u043E\u0442\u0435\u0440\u043C\u0430","3 \u043E\u0441\u0438","\u0436\u0451\u0441\u0442\u043A\u0438\u0435 \u0441\u0442\u0435\u043D\u043A\u0438"],specs:[["\u0414\u043B\u0438\u043D\u0430","13,6 \u043C"],["\u0412\u043D\u0443\u0442\u0440\u0435\u043D\u043D\u0438\u0439 \u043E\u0431\u044A\u0451\u043C","96 \u043C\xB3"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","26 000 \u043A\u0433"],["\u041E\u0441\u0438","3"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","7 200 \u043A\u0433"],["\u0426\u0435\u043D\u0430","2 400 000 \u20BD"]]},{id:"reefer",name:"\u0420\u0435\u0444-\u043F\u043E\u043B\u0443\u043F\u0440\u0438\u0446\u0435\u043F",brand:"COLDFLOW",type:"reefer",length:13.4,width:2.55,height:2.7,color:"#eef0ec",tagline:"\u0425\u043E\u043B\u043E\u0434\u0438\u043B\u044C\u043D\u0438\u043A \u043D\u0430 \u043A\u043E\u043B\u0451\u0441\u0430\u0445",desc:"\u0420\u0435\u0444\u0440\u0438\u0436\u0435\u0440\u0430\u0442\u043E\u0440 \u0441 \u0434\u0438\u0437\u0435\u043B\u044C-\u0433\u0435\u043D\u0435\u0440\u0430\u0442\u043E\u0440\u043E\u043C \u043D\u0430 \u043F\u0435\u0440\u0435\u0434\u043D\u0435\u0439 \u0441\u0442\u0435\u043D\u043A\u0435: \u043E\u0442 \u221225 \xB0C \u0434\u043E +25 \xB0C. \u0414\u043B\u044F \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u043E\u0432, \u043C\u0435\u0434\u0438\u043A\u0430\u043C\u0435\u043D\u0442\u043E\u0432 \u0438 \u0446\u0432\u0435\u0442\u043E\u0432.",tags:["\u0440\u0435\u0444","\u221225 \xB0C","3 \u043E\u0441\u0438"],specs:[["\u0414\u043B\u0438\u043D\u0430","13,4 \u043C"],["\u0412\u043D\u0443\u0442\u0440\u0435\u043D\u043D\u0438\u0439 \u043E\u0431\u044A\u0451\u043C","88 \u043C\xB3"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","22 000 \u043A\u0433"],["\u0422\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u0430","\u221225\u2026+25 \xB0C"],["\u041E\u0441\u0438","3"],["\u0426\u0435\u043D\u0430","3 800 000 \u20BD"]]},{id:"flatbed",name:"\u0411\u043E\u0440\u0442\u043E\u0432\u0430\u044F \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430",brand:"STEELRIDE",type:"flatbed",length:13.6,width:2.48,height:0,color:"#9aa0a4",tagline:"\u041E\u0442\u043A\u0440\u044B\u0442\u0430\u044F \u043F\u043B\u043E\u0449\u0430\u0434\u043A\u0430 \u0441\u043E \u0441\u0442\u043E\u0439\u043A\u0430\u043C\u0438",desc:"\u0420\u043E\u0432\u043D\u044B\u0439 \u0441\u0442\u0430\u043B\u044C\u043D\u043E\u0439 \u043F\u043E\u043B, \u043E\u0442\u043A\u0438\u0434\u043D\u044B\u0435 \u0431\u043E\u0440\u0442\u0430 \u0438 \u043A\u043E\u043D\u0438\u043A\u0438 \u043F\u043E\u0434 \u0433\u0440\u0443\u0437. \u0414\u043B\u044F \u0441\u0442\u0440\u043E\u0439\u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B\u043E\u0432 \u0438 \u0442\u0435\u0445\u043D\u0438\u043A\u0438.",tags:["\u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430","3 \u043E\u0441\u0438","\u043E\u0442\u043A\u0440\u044B\u0442\u0430\u044F"],specs:[["\u0414\u043B\u0438\u043D\u0430","13,6 \u043C"],["\u041F\u043B\u043E\u0449\u0430\u0434\u044C \u043F\u043E\u043B\u0430","33,7 \u043C\xB2"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","30 000 \u043A\u0433"],["\u041E\u0441\u0438","3"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","6 200 \u043A\u0433"],["\u0426\u0435\u043D\u0430","1 650 000 \u20BD"]]},{id:"lowboy",name:"\u041D\u0438\u0437\u043A\u043E\u0440\u0430\u043C\u043D\u044B\u0439 \u0442\u0440\u0430\u043B",brand:"STEELRIDE",type:"lowboy",length:15.2,width:3,height:.9,color:"#2f363c",tagline:"\u0414\u043B\u044F \u0442\u0435\u0445\u043D\u0438\u043A\u0438, \u043A\u0440\u0430\u043D\u043E\u0432 \u0438 \u043D\u0435\u0433\u0430\u0431\u0430\u0440\u0438\u0442\u0430",desc:"\u0417\u0430\u043D\u0438\u0436\u0435\u043D\u043D\u0430\u044F \u043F\u043E\u0433\u0440\u0443\u0437\u043E\u0447\u043D\u0430\u044F \u043F\u043B\u043E\u0449\u0430\u0434\u043A\u0430, \u0432\u044B\u0434\u0432\u0438\u0436\u043D\u043E\u0439 \u0442\u0440\u0430\u043F \u0438 4 \u043E\u0441\u0438. \u041F\u0435\u0440\u0435\u0432\u043E\u0437\u0438\u0442 \u044D\u043A\u0441\u043A\u0430\u0432\u0430\u0442\u043E\u0440\u044B \u0438 \u0431\u0443\u0440\u043E\u0432\u044B\u0435 \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0438.",tags:["\u0442\u0440\u0430\u043B","\u043D\u0435\u0433\u0430\u0431\u0430\u0440\u0438\u0442","4 \u043E\u0441\u0438"],specs:[["\u0414\u043B\u0438\u043D\u0430","15,2 \u043C"],["\u0412\u044B\u0441\u043E\u0442\u0430 \u043F\u043E\u043B\u0430","0,9 \u043C"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","48 000 \u043A\u0433"],["\u041E\u0441\u0438","4"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","14 500 \u043A\u0433"],["\u0426\u0435\u043D\u0430","5 100 000 \u20BD"]]},{id:"tanker",name:"\u0426\u0438\u0441\u0442\u0435\u0440\u043D\u0430 \u0434\u043B\u044F \u0436\u0438\u0434\u043A\u043E\u0441\u0442\u0435\u0439",brand:"AQUATEC",type:"tanker",length:13.2,width:2.5,height:3.1,color:"#dfe4e7",tagline:"\u0410\u043B\u044E\u043C\u0438\u043D\u0438\u0435\u0432\u0430\u044F \u0431\u043E\u0447\u043A\u0430 \u043D\u0430 33 000 \u043B",desc:"\u0422\u0440\u0438 \u0438\u0437\u043E\u043B\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0435 \u0441\u0435\u043A\u0446\u0438\u0438, \u043D\u0438\u0436\u043D\u0438\u0439 \u043D\u0430\u043B\u0438\u0432 \u0438 \u043F\u0430\u0440\u043E\u0432\u043E\u0439 \u043E\u0431\u043E\u0433\u0440\u0435\u0432. \u041F\u0438\u0449\u0435\u0432\u044B\u0435 \u0436\u0438\u0434\u043A\u043E\u0441\u0442\u0438, \u0442\u043E\u043F\u043B\u0438\u0432\u043E \u0438 \u0445\u0438\u043C\u0438\u044F.",tags:["\u0446\u0438\u0441\u0442\u0435\u0440\u043D\u0430","3 \u0441\u0435\u043A\u0446\u0438\u0438","\u043F\u0438\u0449\u0435\u0432\u0430\u044F"],specs:[["\u0414\u043B\u0438\u043D\u0430","13,2 \u043C"],["\u041E\u0431\u044A\u0451\u043C","33 000 \u043B"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","27 000 \u043A\u0433"],["\u041E\u0441\u0438","3"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","8 300 \u043A\u0433"],["\u0426\u0435\u043D\u0430","6 700 000 \u20BD"]]},{id:"silo",name:"\u0426\u0435\u043C\u0435\u043D\u0442\u043E\u0432\u043E\u0437-\u0441\u0438\u043B\u043E\u0441",brand:"BULKLINE",type:"silo",length:13,width:2.5,height:3.2,color:"#c9cdd0",tagline:"\u0421\u044B\u043F\u0443\u0447\u0438\u0435 \u0433\u0440\u0443\u0437\u044B \u043F\u043E\u0434 \u0434\u0430\u0432\u043B\u0435\u043D\u0438\u0435\u043C",desc:"\u0414\u0432\u0430 \u043A\u043E\u043D\u0438\u0447\u0435\u0441\u043A\u0438\u0445 \u0431\u0443\u043D\u043A\u0435\u0440\u0430, \u043A\u043E\u043C\u043F\u0440\u0435\u0441\u0441\u043E\u0440 \u0438 \u0430\u044D\u0440\u0430\u0446\u0438\u044F. \u0426\u0435\u043C\u0435\u043D\u0442, \u043C\u0443\u043A\u0430 \u0438 \u043C\u0438\u043D\u0435\u0440\u0430\u043B\u044C\u043D\u044B\u0439 \u043F\u043E\u0440\u043E\u0448\u043E\u043A \u0432\u044B\u0433\u0440\u0443\u0436\u0430\u044E\u0442\u0441\u044F \u0432\u043E\u0437\u0434\u0443\u0445\u043E\u043C.",tags:["\u0441\u044B\u043F\u0443\u0447\u0438\u0435","\u0430\u044D\u0440\u0430\u0446\u0438\u044F","\u043A\u043E\u043C\u043F\u0440\u0435\u0441\u0441\u043E\u0440"],specs:[["\u0414\u043B\u0438\u043D\u0430","13,0 \u043C"],["\u041E\u0431\u044A\u0451\u043C","38 \u043C\xB3"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","30 000 \u043A\u0433"],["\u041E\u0441\u0438","3"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","9 100 \u043A\u0433"],["\u0426\u0435\u043D\u0430","7 300 000 \u20BD"]]},{id:"tipper",name:"\u0421\u0430\u043C\u043E\u0441\u0432\u0430\u043B\u044C\u043D\u044B\u0439 \u043F\u043E\u043B\u0443\u043F\u0440\u0438\u0446\u0435\u043F",brand:"BULKLINE",type:"tipper",length:13.4,width:2.5,height:1.9,color:"#8f9498",tagline:"\u0420\u0430\u0437\u0433\u0440\u0443\u0437\u043A\u0430 \u043E\u043F\u0440\u043E\u043A\u0438\u0434\u044B\u0432\u0430\u043D\u0438\u0435\u043C",desc:"\u0421\u0442\u0430\u043B\u044C\u043D\u043E\u0439 \u043A\u043E\u0432\u0448 \u0441 \u0433\u0438\u0434\u0440\u043E\u0446\u0438\u043B\u0438\u043D\u0434\u0440\u043E\u043C, \u0437\u0430\u0434\u043D\u0438\u0439 \u0431\u043E\u0440\u0442 \u043D\u0430 \u043F\u0435\u0442\u043B\u044F\u0445. \u0429\u0435\u0431\u0435\u043D\u044C, \u043F\u0435\u0441\u043E\u043A, \u0433\u0440\u0443\u043D\u0442 \u0438 \u0437\u0435\u0440\u043D\u043E.",tags:["\u0441\u0430\u043C\u043E\u0441\u0432\u0430\u043B","\u0433\u0438\u0434\u0440\u0430\u0432\u043B\u0438\u043A\u0430","\u0449\u0435\u0431\u0435\u043D\u044C"],specs:[["\u0414\u043B\u0438\u043D\u0430","13,4 \u043C"],["\u041E\u0431\u044A\u0451\u043C","34 \u043C\xB3"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","32 000 \u043A\u0433"],["\u041E\u0441\u0438","3"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","11 200 \u043A\u0433"],["\u0426\u0435\u043D\u0430","4 400 000 \u20BD"]]},{id:"livestock",name:"\u0421\u043A\u043E\u0442\u043E\u0432\u043E\u0437",brand:"FARMHAUL",type:"livestock",length:13.2,width:2.55,height:2.9,color:"#e4e6df",tagline:"\u0414\u0432\u0443\u0445\u044A\u044F\u0440\u0443\u0441\u043D\u044B\u0439, \u0441 \u0432\u0435\u043D\u0442\u0438\u043B\u044F\u0446\u0438\u0435\u0439",desc:"\u0412\u0435\u043D\u0442\u0438\u043B\u0438\u0440\u0443\u0435\u043C\u044B\u0435 \u0431\u043E\u0440\u0442\u0430, \u043F\u043E\u0438\u043B\u043A\u0438 \u0438 \u043F\u043E\u0434\u044A\u0451\u043C\u043D\u044B\u0439 \u043F\u043E\u043B. \u041F\u0435\u0440\u0435\u0432\u043E\u0437\u043A\u0430 \u0441\u043A\u043E\u0442\u0430 \u0441 \u0441\u043E\u0431\u043B\u044E\u0434\u0435\u043D\u0438\u0435\u043C \u043D\u043E\u0440\u043C \u043F\u043B\u043E\u0442\u043D\u043E\u0441\u0442\u0438.",tags:["\u0441\u043A\u043E\u0442","2 \u044F\u0440\u0443\u0441\u0430","\u0432\u0435\u043D\u0442\u0438\u043B\u044F\u0446\u0438\u044F"],specs:[["\u0414\u043B\u0438\u043D\u0430","13,2 \u043C"],["\u041F\u043B\u043E\u0449\u0430\u0434\u044C","33 \u043C\xB2"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","20 000 \u043A\u0433"],["\u041E\u0441\u0438","3"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","8 900 \u043A\u0433"],["\u0426\u0435\u043D\u0430","3 300 000 \u20BD"]]},{id:"logging",name:"\u041B\u0435\u0441\u043E\u0432\u043E\u0437",brand:"TIMBERLINE",type:"logging",length:14,width:2.5,height:0,color:"#586066",tagline:"\u041A\u043E\u043D\u0438\u043A\u0438 \u0438 \u0441\u0442\u043E\u0439\u043A\u0438 \u043F\u043E\u0434 \u0431\u0440\u0451\u0432\u043D\u0430",desc:"\u041A\u043E\u043C\u043F\u043B\u0435\u043A\u0442 \u043A\u043E\u043D\u0438\u043A\u043E\u0432 \u0441 \u0432\u0435\u0440\u0442\u0438\u043A\u0430\u043B\u044C\u043D\u044B\u043C\u0438 \u0441\u0442\u043E\u0439\u043A\u0430\u043C\u0438 \u0438 \u0446\u0435\u043F\u044F\u043C\u0438. \u0411\u0440\u0451\u0432\u043D\u0430 \u0443\u043A\u043B\u0430\u0434\u044B\u0432\u0430\u044E\u0442\u0441\u044F \u0448\u0442\u0430\u0431\u0435\u043B\u0435\u043C \u0438 \u043A\u0440\u0435\u043F\u044F\u0442\u0441\u044F \u0441\u0432\u0435\u0440\u0445\u0443.",tags:["\u043B\u0435\u0441","\u043A\u043E\u043D\u0438\u043A\u0438","\u0431\u0440\u0451\u0432\u043D\u0430"],specs:[["\u0414\u043B\u0438\u043D\u0430","14,0 \u043C"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","29 000 \u043A\u0433"],["\u041E\u0441\u0438","3"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","7 800 \u043A\u0433"],["\u0426\u0435\u043D\u0430","2 900 000 \u20BD"]]},{id:"container",name:"\u041A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440\u043D\u0430\u044F \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430",brand:"PORTLINE",type:"container",length:13.6,width:2.45,height:2.6,color:"#275b78",tagline:"\u041F\u043E\u0434 40-\u0444\u0443\u0442\u043E\u0432\u044B\u0439 \u043A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440",desc:"\u0424\u0438\u0442\u0438\u043D\u0433\u0438 \u0438 twist-lock \u0437\u0430\u043C\u043A\u0438, \u0443\u0441\u0438\u043B\u0435\u043D\u043D\u0430\u044F \u0440\u0430\u043C\u0430. \u0412\u043E\u0437\u0438\u0442 \u043E\u0434\u0438\u043D 40\u2032 \u0438\u043B\u0438 \u0434\u0432\u0430 20\u2032 \u043A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440\u0430.",tags:["\u043A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440","40 \u0444\u0443\u0442\u043E\u0432","\u043F\u043E\u0440\u0442"],specs:[["\u0414\u043B\u0438\u043D\u0430","13,6 \u043C"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","32 000 \u043A\u0433"],["\u041E\u0441\u0438","3"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","8 100 \u043A\u0433"],["\u0426\u0435\u043D\u0430","2 700 000 \u20BD"]]},{id:"carrier",name:"\u0410\u0432\u0442\u043E\u0432\u043E\u0437-\u043F\u043E\u043B\u0443\u043F\u0440\u0438\u0446\u0435\u043F",brand:"AUTOLINE",type:"carrier",length:13.8,width:2.55,height:4,color:"#3d4449",tagline:"\u0414\u0432\u0430 \u044F\u0440\u0443\u0441\u0430, \u0434\u043E 8 \u043C\u0430\u0448\u0438\u043D",desc:"\u0412\u0435\u0440\u0445\u043D\u044F\u044F \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430 \u043D\u0430 \u043F\u043E\u0434\u044A\u0451\u043C\u043D\u0438\u043A\u0430\u0445, \u0441\u0442\u044F\u0436\u043D\u044B\u0435 \u0440\u0435\u043C\u043D\u0438 \u043D\u0430 \u043A\u043E\u043B\u0451\u0441\u0430. \u041F\u0435\u0440\u0435\u0432\u043E\u0437\u0438\u0442 \u043B\u0435\u0433\u043A\u043E\u0432\u044B\u0435 \u0430\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u0438 \u0441 \u0437\u0430\u0432\u043E\u0434\u0430.",tags:["\u0430\u0432\u0442\u043E\u0432\u043E\u0437","2 \u044F\u0440\u0443\u0441\u0430","8 \u043C\u0430\u0448\u0438\u043D"],specs:[["\u0414\u043B\u0438\u043D\u0430","13,8 \u043C"],["\u041C\u0430\u0448\u0438\u043D","\u0434\u043E 8"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","21 000 \u043A\u0433"],["\u041E\u0441\u0438","3"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","10 500 \u043A\u0433"],["\u0426\u0435\u043D\u0430","4 900 000 \u20BD"]]},{id:"dolly",name:"\u041F\u0440\u0438\u0446\u0435\u043F-\u0440\u043E\u0441\u043F\u0443\u0441\u043A",brand:"TIMBERLINE",type:"dolly",length:9.5,width:2.45,height:0,color:"#6d7160",tagline:"\u0414\u043B\u0438\u043D\u043D\u043E\u043C\u0435\u0440 \u0434\u043B\u044F \u043B\u0435\u0441\u0430 \u0438 \u0442\u0440\u0443\u0431",desc:"\u0414\u044B\u0448\u043B\u043E \u0441 \u0448\u0430\u0440\u043D\u0438\u0440\u043E\u043C, \u043A\u043E\u043D\u0438\u043A\u0438 \u0438 \u0442\u0435\u043B\u0435\u0441\u043A\u043E\u043F\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u0440\u0430\u043C\u0430. \u0421\u043E\u0431\u0438\u0440\u0430\u0435\u0442 \u0441\u0446\u0435\u043F\u043A\u0443 \u0438\u0437 \u0434\u0432\u0443\u0445 \u0437\u0432\u0435\u043D\u044C\u0435\u0432.",tags:["\u0440\u043E\u0441\u043F\u0443\u0441\u043A","\u0434\u043B\u0438\u043D\u043D\u043E\u043C\u0435\u0440","\u0442\u0440\u0443\u0431\u044B"],specs:[["\u0414\u043B\u0438\u043D\u0430","9,5 \u043C"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","22 000 \u043A\u0433"],["\u041E\u0441\u0438","2"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","4 200 \u043A\u0433"],["\u0426\u0435\u043D\u0430","1 250 000 \u20BD"]]},{id:"bdouble",name:"B-\u0434\u0432\u043E\u0439\u043D\u043E\u0439 \u043A\u043E\u043C\u043F\u043B\u0435\u043A\u0442",brand:"TRAILGO",type:"bdouble",length:15.5,width:2.5,height:2.7,color:"#d5d8d3",tagline:"\u0414\u0432\u0435 \u0441\u0435\u043A\u0446\u0438\u0438 \u043D\u0430 \u043E\u0434\u043D\u043E\u0439 \u0441\u0446\u0435\u043F\u043A\u0435",desc:"\u041F\u0435\u0440\u0435\u0434\u043D\u044F\u044F \u0438 \u0437\u0430\u0434\u043D\u044F\u044F \u0441\u0435\u043A\u0446\u0438\u0438 \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u044B \u0431\u0430\u043B\u043A\u043E\u0439 \u0438 \u0434\u043E\u043F. \u0442\u0435\u043B\u0435\u0436\u043A\u043E\u0439. \u0414\u0430\u0451\u0442 +35 % \u043E\u0431\u044A\u0451\u043C\u0430 \u043D\u0430 \u0434\u0430\u043B\u044C\u043D\u0438\u0445 \u043C\u0430\u0440\u0448\u0440\u0443\u0442\u0430\u0445.",tags:["B-double","2 \u0441\u0435\u043A\u0446\u0438\u0438","\u0430\u0432\u0442\u043E\u043F\u043E\u0435\u0437\u0434"],specs:[["\u0414\u043B\u0438\u043D\u0430","15,5 \u043C"],["\u0412\u043D\u0443\u0442\u0440\u0435\u043D\u043D\u0438\u0439 \u043E\u0431\u044A\u0451\u043C","115 \u043C\xB3"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","34 000 \u043A\u0433"],["\u041E\u0441\u0438","5"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","13 000 \u043A\u0433"],["\u0426\u0435\u043D\u0430","5 600 000 \u20BD"]]},{id:"boat",name:"\u041B\u043E\u0434\u043E\u0447\u043D\u044B\u0439 \u043F\u0440\u0438\u0446\u0435\u043F",brand:"WATERTRAIL",type:"boat",length:8.2,width:2.4,height:2.2,color:"#9fb3bd",tagline:"\u041B\u043E\u0436\u0435 \u0441 \u0440\u043E\u043B\u0438\u043A\u0430\u043C\u0438 \u043F\u043E\u0434 \u043A\u043E\u0440\u043F\u0443\u0441 \u043A\u0430\u0442\u0435\u0440\u0430",desc:"\u0420\u043E\u043B\u0438\u043A\u043E\u0432\u043E\u0435 \u043B\u043E\u0436\u0435, \u043B\u0435\u0431\u0451\u0434\u043A\u0430 \u0438 \u0433\u0435\u0440\u043C\u0435\u0442\u0438\u0447\u043D\u044B\u0435 \u0444\u043E\u043D\u0430\u0440\u0438. \u041B\u043E\u0434\u043A\u0430 \u0441\u043F\u0443\u0441\u043A\u0430\u0435\u0442\u0441\u044F \u043F\u0440\u044F\u043C\u043E \u0432 \u0432\u043E\u0434\u0443 \u043D\u0430 \u0441\u043B\u0438\u043F\u0435.",tags:["\u043A\u0430\u0442\u0435\u0440","\u0440\u043E\u043B\u0438\u043A\u0438","\u0441\u043F\u0443\u0441\u043A \u043D\u0430 \u0432\u043E\u0434\u0443"],specs:[["\u0414\u043B\u0438\u043D\u0430","8,2 \u043C"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","3 500 \u043A\u0433"],["\u041E\u0441\u0438","2"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","1 200 \u043A\u0433"],["\u0426\u0435\u043D\u0430","890 000 \u20BD"]]},{id:"glass",name:"\u0421\u0442\u0435\u043A\u043B\u043E\u0432\u043E\u0437",brand:"CLEARLINE",type:"glass",length:12.5,width:2.5,height:3,color:"#4a5660",tagline:"\u0421\u0442\u043E\u0439\u043A\u0438-\xAB\u0433\u0440\u0435\u0431\u0451\u043D\u043A\u0438\xBB \u043F\u043E\u0434 \u0441\u0442\u0435\u043A\u043B\u043E",desc:"\u0412\u0435\u0440\u0442\u0438\u043A\u0430\u043B\u044C\u043D\u044B\u0435 A-\u043E\u0431\u0440\u0430\u0437\u043D\u044B\u0435 \u0441\u0442\u043E\u0439\u043A\u0438, \u0432\u043E\u0439\u043B\u043E\u0447\u043D\u044B\u0435 \u043F\u0440\u043E\u043A\u043B\u0430\u0434\u043A\u0438 \u0438 \u0440\u0435\u043C\u043D\u0438. \u041F\u0435\u0440\u0435\u0432\u043E\u0437\u043A\u0430 \u043B\u0438\u0441\u0442\u043E\u0432\u043E\u0433\u043E \u0441\u0442\u0435\u043A\u043B\u0430 \u0438 \u0437\u0435\u0440\u043A\u0430\u043B.",tags:["\u0441\u0442\u0435\u043A\u043B\u043E","A-\u0441\u0442\u043E\u0439\u043A\u0438","\u0445\u0440\u0443\u043F\u043A\u043E\u0435"],specs:[["\u0414\u043B\u0438\u043D\u0430","12,5 \u043C"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","18 000 \u043A\u0433"],["\u041E\u0441\u0438","3"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","6 900 \u043A\u0433"],["\u0426\u0435\u043D\u0430","2 100 000 \u20BD"]]},{id:"adr",name:"\u0426\u0438\u0441\u0442\u0435\u0440\u043D\u0430 ADR",brand:"AQUATEC",type:"adr",length:13.2,width:2.5,height:3.15,color:"#e5e7e2",tagline:"\u041E\u043F\u0430\u0441\u043D\u044B\u0435 \u0433\u0440\u0443\u0437\u044B \u0441 \u043F\u043E\u043B\u043D\u043E\u0439 \u043C\u0430\u0440\u043A\u0438\u0440\u043E\u0432\u043A\u043E\u0439",desc:"\u0414\u0432\u043E\u0439\u043D\u044B\u0435 \u0441\u0442\u0435\u043D\u043A\u0438, \u0437\u043D\u0430\u043A\u0438 \u043E\u043F\u0430\u0441\u043D\u043E\u0441\u0442\u0438 \u0438 \u0437\u0430\u0437\u0435\u043C\u043B\u0435\u043D\u0438\u0435. \u0425\u0438\u043C\u0438\u044F, \u043A\u0438\u0441\u043B\u043E\u0442\u044B \u0438 \u0441\u0436\u0438\u0436\u0435\u043D\u043D\u044B\u0435 \u0433\u0430\u0437\u044B \u043F\u043E \u043D\u043E\u0440\u043C\u0430\u043C ADR.",tags:["ADR","\u043E\u043F\u0430\u0441\u043D\u044B\u0439 \u0433\u0440\u0443\u0437","\u0434\u0432\u043E\u0439\u043D\u044B\u0435 \u0441\u0442\u0435\u043D\u043A\u0438"],specs:[["\u0414\u043B\u0438\u043D\u0430","13,2 \u043C"],["\u041E\u0431\u044A\u0451\u043C","30 000 \u043B"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","25 000 \u043A\u0433"],["\u041E\u0441\u0438","3"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","9 600 \u043A\u0433"],["\u0426\u0435\u043D\u0430","8 200 000 \u20BD"]]},{id:"crane",name:"\u041F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430 \u0441 \u043A\u0440\u0430\u043D\u043E\u043C",brand:"STEELRIDE",type:"crane",length:13,width:2.5,height:1.1,color:"#8e9397",tagline:"\u0421\u0430\u043C\u043E\u043F\u043E\u0433\u0440\u0443\u0437\u043A\u0430 \u0432 \u043E\u0434\u043D\u0443 \u043C\u0430\u0448\u0438\u043D\u0443",desc:"\u041A\u0440\u0430\u043D-\u043C\u0430\u043D\u0438\u043F\u0443\u043B\u044F\u0442\u043E\u0440 \u0441 \u0432\u044B\u043B\u0435\u0442\u043E\u043C 8 \u043C \u0438 \u0433\u0438\u0434\u0440\u0430\u0432\u043B\u0438\u0447\u0435\u0441\u043A\u0438\u043C\u0438 \u043E\u043F\u043E\u0440\u0430\u043C\u0438. \u0421\u0430\u043C \u0433\u0440\u0443\u0437\u0438\u0442 \u0438 \u0432\u044B\u0433\u0440\u0443\u0436\u0430\u0435\u0442 \u043F\u0430\u043B\u043B\u0435\u0442\u044B \u0438 \u0431\u043B\u043E\u043A\u0438.",tags:["\u043A\u0440\u0430\u043D","\u0441\u0430\u043C\u043E\u043F\u043E\u0433\u0440\u0443\u0437\u043A\u0430","8 \u043C"],specs:[["\u0414\u043B\u0438\u043D\u0430","13,0 \u043C"],["\u0412\u044B\u043B\u0435\u0442 \u0441\u0442\u0440\u0435\u043B\u044B","8,0 \u043C"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","24 000 \u043A\u0433"],["\u041E\u0441\u0438","3"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","12 800 \u043A\u0433"],["\u0426\u0435\u043D\u0430","9 400 000 \u20BD"]]},{id:"sidetip",name:"\u041F\u043E\u043B\u0443\u043F\u0440\u0438\u0446\u0435\u043F-\u0441\u0430\u043C\u043E\u0441\u0432\u0430\u043B \u0432 \u0441\u0442\u043E\u0440\u043E\u043D\u0443",brand:"BULKLINE",type:"sidetip",length:12.8,width:2.5,height:1.8,color:"#6f7b82",tagline:"\u0421\u0432\u0430\u043B\u0438\u0432\u0430\u0435\u0442 \u0433\u0440\u0443\u0437 \u0432\u0431\u043E\u043A \u043D\u0430 \u043E\u0431\u043E\u0447\u0438\u043D\u0443",desc:"\u0411\u043E\u043A\u043E\u0432\u043E\u0435 \u043E\u043F\u0440\u043E\u043A\u0438\u0434\u044B\u0432\u0430\u043D\u0438\u0435 \u0431\u0435\u0437 \u0437\u0430\u0435\u0437\u0434\u0430 \u043D\u0430 \u044D\u0441\u0442\u0430\u043A\u0430\u0434\u0443. \u0423\u0434\u043E\u0431\u043D\u043E \u043D\u0430 \u0443\u0437\u043A\u0438\u0445 \u0441\u0442\u0440\u043E\u0439\u043F\u043B\u043E\u0449\u0430\u0434\u043A\u0430\u0445.",tags:["\u0431\u043E\u043A\u043E\u0432\u043E\u0439 \u0441\u0432\u0430\u043B","\u0441\u0442\u0440\u043E\u0439\u043A\u0430","3 \u043E\u0441\u0438"],specs:[["\u0414\u043B\u0438\u043D\u0430","12,8 \u043C"],["\u041E\u0431\u044A\u0451\u043C","30 \u043C\xB3"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","30 000 \u043A\u0433"],["\u041E\u0441\u0438","3"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","10 900 \u043A\u0433"],["\u0426\u0435\u043D\u0430","4 800 000 \u20BD"]]},{id:"refcontainer",name:"\u0420\u0435\u0444-\u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430 \u0441 \u043A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440\u043E\u043C",brand:"COLDFLOW",type:"refcontainer",length:13.6,width:2.45,height:2.9,color:"#e8ebe6",tagline:"40-\u0444\u0443\u0442\u043E\u0432\u044B\u0439 \u0440\u0435\u0444-\u043A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440 \u043D\u0430 \u0437\u0430\u043C\u043A\u0430\u0445",desc:"\u0422\u0435\u0440\u043C\u043E\u0438\u0437\u043E\u043B\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439 \u043A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440 \u0441 \u0445\u043E\u043B\u043E\u0434\u0438\u043B\u044C\u043D\u043E\u0439 \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u043E\u0439 \u043A\u0440\u0435\u043F\u0438\u0442\u0441\u044F \u043A \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0435 twist-lock \u0437\u0430\u043C\u043A\u0430\u043C\u0438.",tags:["\u0440\u0435\u0444-\u043A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440","\u043A\u043E\u043C\u0431\u0438\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439","40 \u0444\u0443\u0442\u043E\u0432"],specs:[["\u0414\u043B\u0438\u043D\u0430","13,6 \u043C"],["\u041E\u0431\u044A\u0451\u043C","76 \u043C\xB3"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","26 000 \u043A\u0433"],["\u041E\u0441\u0438","3"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","9 300 \u043A\u0433"],["\u0426\u0435\u043D\u0430","6 100 000 \u20BD"]]}],ko=[{id:"sedan",name:"Aster S",brand:"ASTER",model:"S",style:"sedan",tagline:"\u041A\u043B\u0430\u0441\u0441\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0433\u043E\u0440\u043E\u0434\u0441\u043A\u043E\u0439 \u0441\u0435\u0434\u0430\u043D",desc:"\u041F\u0440\u043E\u0441\u0442\u043E\u0440\u043D\u044B\u0439 \u0441\u0430\u043B\u043E\u043D, \u0431\u0430\u0433\u0430\u0436\u043D\u0438\u043A \u043D\u0430 480 \u043B \u0438 \u043C\u044F\u0433\u043A\u0430\u044F \u043F\u043E\u0434\u0432\u0435\u0441\u043A\u0430. \u0423\u043D\u0438\u0432\u0435\u0440\u0441\u0430\u043B\u044C\u043D\u044B\u0439 \u0430\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u044C \u043D\u0430 \u043A\u0430\u0436\u0434\u044B\u0439 \u0434\u0435\u043D\u044C.",paint:"#2f5d8a",accent:"#d8d5c8",length:4.78,width:1.84,height:1.44,wheelbase:2.82,wheelRadius:.33,wheelWidth:.23,seats:5,tags:["\u0441\u0435\u0434\u0430\u043D","\u043F\u0435\u0440\u0435\u0434\u043D\u0438\u0439 \u043F\u0440\u0438\u0432\u043E\u0434","5 \u043C\u0435\u0441\u0442"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","190 \u043B.\u0441."],["0\u2013100 \u043A\u043C/\u0447","8,4 \u0441"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","225 \u043A\u043C/\u0447"],["\u041F\u0440\u0438\u0432\u043E\u0434","\u043F\u0435\u0440\u0435\u0434\u043D\u0438\u0439"],["\u0420\u0430\u0441\u0445\u043E\u0434","6,7 \u043B/100 \u043A\u043C"],["\u041C\u0430\u0441\u0441\u0430","1 560 \u043A\u0433"],["\u0426\u0435\u043D\u0430","2 890 000 \u20BD"]]},{id:"wagon",name:"Aster SW",brand:"ASTER",model:"SW",style:"wagon",tagline:"\u041F\u0440\u0430\u043A\u0442\u0438\u0447\u043D\u044B\u0439 \u0443\u043D\u0438\u0432\u0435\u0440\u0441\u0430\u043B \u0441 \u0431\u043E\u043B\u044C\u0448\u0438\u043C \u0431\u0430\u0433\u0430\u0436\u043D\u0438\u043A\u043E\u043C",desc:"\u0422\u0430 \u0436\u0435 \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430, \u0447\u0442\u043E \u0443 \u0441\u0435\u0434\u0430\u043D\u0430, \u043D\u043E \u0441 \u043A\u0440\u044B\u0448\u0435\u0439 \u0434\u043E \u043A\u043E\u0440\u043C\u044B. \u0414\u043B\u044F \u0441\u0435\u043C\u044C\u0438, \u0441\u043E\u0431\u0430\u043A \u0438 \u0432\u0435\u043B\u043E\u0441\u0438\u043F\u0435\u0434\u043E\u0432.",paint:"#6b3f2a",accent:"#c9c2ae",length:4.86,width:1.85,height:1.5,wheelbase:2.82,wheelRadius:.34,wheelWidth:.235,seats:5,tags:["\u0443\u043D\u0438\u0432\u0435\u0440\u0441\u0430\u043B","\u043F\u043E\u043B\u043D\u044B\u0439 \u043F\u0440\u0438\u0432\u043E\u0434","5 \u043C\u0435\u0441\u0442"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","220 \u043B.\u0441."],["0\u2013100 \u043A\u043C/\u0447","7,6 \u0441"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","230 \u043A\u043C/\u0447"],["\u041F\u0440\u0438\u0432\u043E\u0434","\u043F\u043E\u043B\u043D\u044B\u0439"],["\u0420\u0430\u0441\u0445\u043E\u0434","7,4 \u043B/100 \u043A\u043C"],["\u041C\u0430\u0441\u0441\u0430","1 720 \u043A\u0433"],["\u0426\u0435\u043D\u0430","3 190 000 \u20BD"]]},{id:"hatch",name:"Vela City",brand:"VELA",model:"City",style:"hatch",tagline:"\u041A\u043E\u043C\u043F\u0430\u043A\u0442\u043D\u044B\u0439 \u0445\u044D\u0442\u0447\u0431\u0435\u043A \u0434\u043B\u044F \u043F\u0430\u0440\u043A\u043E\u0432\u043A\u0438 \u0432 \u0446\u0435\u043D\u0442\u0440\u0435",desc:"\u041A\u043E\u0440\u043E\u0442\u043A\u0438\u0439 \u0441\u0432\u0435\u0441, \u0432\u044B\u0441\u043E\u043A\u0430\u044F \u043F\u043E\u0441\u0430\u0434\u043A\u0430 \u0438 \u0440\u0430\u0437\u0432\u043E\u0440\u043E\u0442 \u0437\u0430 9,8 \u043C. \u0411\u0435\u043D\u0437\u0438\u043D\u043E\u0432\u044B\u0439 \u0442\u0443\u0440\u0431\u043E\u043C\u043E\u0442\u043E\u0440 1,4 \u043B.",paint:"#c9402f",accent:"#2b2f33",length:4.02,width:1.76,height:1.48,wheelbase:2.58,wheelRadius:.31,wheelWidth:.21,seats:5,tags:["\u0445\u044D\u0442\u0447\u0431\u0435\u043A","\u043F\u0435\u0440\u0435\u0434\u043D\u0438\u0439 \u043F\u0440\u0438\u0432\u043E\u0434","\u043A\u043E\u043C\u043F\u0430\u043A\u0442"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","135 \u043B.\u0441."],["0\u2013100 \u043A\u043C/\u0447","9,3 \u0441"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","205 \u043A\u043C/\u0447"],["\u041F\u0440\u0438\u0432\u043E\u0434","\u043F\u0435\u0440\u0435\u0434\u043D\u0438\u0439"],["\u0420\u0430\u0441\u0445\u043E\u0434","5,8 \u043B/100 \u043A\u043C"],["\u041C\u0430\u0441\u0441\u0430","1 240 \u043A\u0433"],["\u0426\u0435\u043D\u0430","1 890 000 \u20BD"]]},{id:"suv",name:"Terra Rover 4\xD74",brand:"TERRA",model:"Rover",style:"suv",tagline:"\u0411\u043E\u043B\u044C\u0448\u043E\u0439 \u043F\u043E\u043B\u043D\u043E\u043F\u0440\u0438\u0432\u043E\u0434\u043D\u044B\u0439 \u0432\u043D\u0435\u0434\u043E\u0440\u043E\u0436\u043D\u0438\u043A",desc:"\u041A\u043B\u0438\u0440\u0435\u043D\u0441 220 \u043C\u043C, \u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u043A\u0430 \u0437\u0430\u0434\u043D\u0435\u0433\u043E \u0434\u0438\u0444\u0444\u0435\u0440\u0435\u043D\u0446\u0438\u0430\u043B\u0430 \u0438 7 \u043C\u0435\u0441\u0442. \u0414\u043B\u044F \u0434\u0430\u0447\u0438, \u043E\u0445\u043E\u0442\u044B \u0438 \u043F\u043B\u043E\u0445\u0438\u0445 \u0434\u043E\u0440\u043E\u0433.",paint:"#4f5844",accent:"#1c1f1e",length:4.92,width:1.96,height:1.82,wheelbase:2.9,wheelRadius:.4,wheelWidth:.28,seats:7,tags:["\u0432\u043D\u0435\u0434\u043E\u0440\u043E\u0436\u043D\u0438\u043A","4\xD74","7 \u043C\u0435\u0441\u0442"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","265 \u043B.\u0441."],["0\u2013100 \u043A\u043C/\u0447","8,9 \u0441"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","210 \u043A\u043C/\u0447"],["\u041F\u0440\u0438\u0432\u043E\u0434","\u043F\u043E\u043B\u043D\u044B\u0439"],["\u0420\u0430\u0441\u0445\u043E\u0434","10,2 \u043B/100 \u043A\u043C"],["\u041C\u0430\u0441\u0441\u0430","2 160 \u043A\u0433"],["\u0426\u0435\u043D\u0430","4 750 000 \u20BD"]]},{id:"coupe",name:"Vela Coup\xE9",brand:"VELA",model:"Coup\xE9",style:"coupe",tagline:"\u041D\u0438\u0437\u043A\u0438\u0439 \u0434\u0432\u0443\u0445\u0434\u0432\u0435\u0440\u043D\u044B\u0439 \u0445\u0430\u0440\u0430\u043A\u0442\u0435\u0440",desc:"\u0421\u043F\u043E\u0439\u043B\u0435\u0440, \u0441\u043F\u043E\u0440\u0442\u0438\u0432\u043D\u044B\u0435 \u0441\u0438\u0434\u0435\u043D\u044C\u044F \u0438 2,0-\u043B\u0438\u0442\u0440\u043E\u0432\u044B\u0439 \u0442\u0443\u0440\u0431\u043E\u043C\u043E\u0442\u043E\u0440. \u0412\u0442\u043E\u0440\u043E\u0439 \u0440\u044F\u0434 \u2014 \u0434\u043B\u044F \u0432\u0435\u0449\u0435\u0439, \u0430 \u043D\u0435 \u0434\u043B\u044F \u043B\u044E\u0434\u0435\u0439.",paint:"#a3141c",accent:"#141719",length:4.62,width:1.9,height:1.32,wheelbase:2.74,wheelRadius:.35,wheelWidth:.26,seats:4,tags:["\u043A\u0443\u043F\u0435","\u0437\u0430\u0434\u043D\u0438\u0439 \u043F\u0440\u0438\u0432\u043E\u0434","2 \u0434\u0432\u0435\u0440\u0438"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","330 \u043B.\u0441."],["0\u2013100 \u043A\u043C/\u0447","5,1 \u0441"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","265 \u043A\u043C/\u0447"],["\u041F\u0440\u0438\u0432\u043E\u0434","\u0437\u0430\u0434\u043D\u0438\u0439"],["\u0420\u0430\u0441\u0445\u043E\u0434","8,9 \u043B/100 \u043A\u043C"],["\u041C\u0430\u0441\u0441\u0430","1 590 \u043A\u0433"],["\u0426\u0435\u043D\u0430","5 600 000 \u20BD"]]},{id:"pickup",name:"Terra Hauler",brand:"TERRA",model:"Hauler",style:"pickup",tagline:"\u041F\u0438\u043A\u0430\u043F \u0441 \u043A\u0443\u0437\u043E\u0432\u043E\u043C \u0438 \u0440\u0430\u043C\u043E\u0439",desc:"\u041A\u0443\u0437\u043E\u0432 1,5 \u043C \u0441 \u043A\u0440\u044B\u0448\u043A\u043E\u0439, \u043F\u0440\u0438\u0446\u0435\u043F \u0434\u043E 3,5 \u0442 \u0438 \u043F\u043E\u043D\u0438\u0436\u0430\u044E\u0449\u0430\u044F \u043F\u0435\u0440\u0435\u0434\u0430\u0447\u0430. \u0420\u0430\u0431\u043E\u0447\u0438\u0439 \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442 \u0438 \u0441\u0435\u043C\u0435\u0439\u043D\u0430\u044F \u043C\u0430\u0448\u0438\u043D\u0430.",paint:"#1d5b73",accent:"#c9c9c0",length:5.34,width:1.98,height:1.88,wheelbase:3.22,wheelRadius:.41,wheelWidth:.29,seats:5,tags:["\u043F\u0438\u043A\u0430\u043F","4\xD74","\u043F\u0440\u0438\u0446\u0435\u043F 3,5 \u0442"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","250 \u043B.\u0441."],["0\u2013100 \u043A\u043C/\u0447","9,1 \u0441"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","195 \u043A\u043C/\u0447"],["\u041F\u0440\u0438\u0432\u043E\u0434","\u043F\u043E\u043B\u043D\u044B\u0439"],["\u0420\u0430\u0441\u0445\u043E\u0434","11,5 \u043B/100 \u043A\u043C"],["\u041C\u0430\u0441\u0441\u0430","2 320 \u043A\u0433"],["\u0426\u0435\u043D\u0430","4 290 000 \u20BD"]]},{id:"van-life",name:"Kargo Vito Van",brand:"KARGO",model:"Vito",style:"van",tagline:"\u0426\u0435\u043B\u044C\u043D\u043E\u043C\u0435\u0442\u0430\u043B\u043B\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0444\u0443\u0440\u0433\u043E\u043D",desc:"\u0413\u0440\u0443\u0437\u043E\u0432\u043E\u0439 \u043E\u0442\u0441\u0435\u043A 6,5 \u043C\xB3, \u0441\u0434\u0432\u0438\u0436\u043D\u0430\u044F \u0434\u0432\u0435\u0440\u044C \u0438 \u043F\u0435\u0440\u0435\u0433\u043E\u0440\u043E\u0434\u043A\u0430. \u041A\u0443\u0440\u044C\u0435\u0440\u0441\u043A\u0438\u0439 \u0438 \u0441\u0435\u0440\u0432\u0438\u0441\u043D\u044B\u0439 \u0442\u0440\u0430\u043D\u0441\u043F\u043E\u0440\u0442.",paint:"#e6e8e3",accent:"#d94f2b",length:5.14,width:1.94,height:2.28,wheelbase:3.1,wheelRadius:.36,wheelWidth:.24,seats:3,tags:["\u0444\u0443\u0440\u0433\u043E\u043D","6,5 \u043C\xB3","\u043F\u0435\u0440\u0435\u0434\u043D\u0438\u0439 \u043F\u0440\u0438\u0432\u043E\u0434"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","150 \u043B.\u0441."],["0\u2013100 \u043A\u043C/\u0447","11,8 \u0441"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","175 \u043A\u043C/\u0447"],["\u041F\u0440\u0438\u0432\u043E\u0434","\u043F\u0435\u0440\u0435\u0434\u043D\u0438\u0439"],["\u0420\u0430\u0441\u0445\u043E\u0434","7,9 \u043B/100 \u043A\u043C"],["\u041C\u0430\u0441\u0441\u0430","1 980 \u043A\u0433"],["\u0426\u0435\u043D\u0430","3 450 000 \u20BD"]]},{id:"micro",name:"Vela Mini",brand:"VELA",model:"Mini",style:"micro",tagline:"\u041C\u0438\u043A\u0440\u043E\u043A\u0430\u0440 \u043D\u0430 4 \u043C\u0435\u0441\u0442\u0430",desc:"\u0414\u043B\u0438\u043D\u0430 \u0432\u0441\u0435\u0433\u043E 3,2 \u043C, \u0431\u0430\u0442\u0430\u0440\u0435\u044F \u043D\u0430 260 \u043A\u043C \u0438 \u043F\u0430\u0440\u043A\u043E\u0432\u043A\u0430 \u0432 \u043B\u044E\u0431\u0443\u044E \u0449\u0435\u043B\u044C. \u042D\u043B\u0435\u043A\u0442\u0440\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0433\u043E\u0440\u043E\u0434\u0441\u043A\u043E\u0439 \u043C\u0430\u043B\u044B\u0448.",paint:"#e0b528",accent:"#24363f",length:3.2,width:1.58,height:1.56,wheelbase:2,wheelRadius:.27,wheelWidth:.17,seats:4,tags:["\u043C\u0438\u043A\u0440\u043E\u043A\u0430\u0440","\u044D\u043B\u0435\u043A\u0442\u0440\u043E","260 \u043A\u043C"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","75 \u043B.\u0441."],["0\u2013100 \u043A\u043C/\u0447","12,5 \u0441"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","130 \u043A\u043C/\u0447"],["\u041F\u0440\u0438\u0432\u043E\u0434","\u0437\u0430\u0434\u043D\u0438\u0439"],["\u0411\u0430\u0442\u0430\u0440\u0435\u044F","32 \u043A\u0412\u0442\xB7\u0447"],["\u0417\u0430\u043F\u0430\u0441 \u0445\u043E\u0434\u0430","260 \u043A\u043C"],["\u0426\u0435\u043D\u0430","1 590 000 \u20BD"]]},{id:"crossover",name:"Aster Cross",brand:"ASTER",model:"Cross",style:"crossover",tagline:"\u0413\u043E\u0440\u043E\u0434\u0441\u043A\u043E\u0439 \u043A\u0440\u043E\u0441\u0441\u043E\u0432\u0435\u0440 \u0441 \u0432\u044B\u0441\u043E\u043A\u0438\u043C \u043A\u043B\u0438\u0440\u0435\u043D\u0441\u043E\u043C",desc:"\u0421\u0440\u0435\u0434\u043D\u0438\u0439 \u0440\u0430\u0437\u043C\u0435\u0440, \u044D\u043A\u043E\u043D\u043E\u043C\u0438\u0447\u043D\u044B\u0439 \u0433\u0438\u0431\u0440\u0438\u0434 \u0438 \u043F\u043E\u043B\u043D\u044B\u0439 \u043F\u0440\u0438\u0432\u043E\u0434 \u043D\u0430 \u0437\u0430\u0434\u043D\u044E\u044E \u043E\u0441\u044C. \u041A\u043E\u043C\u043F\u0440\u043E\u043C\u0438\u0441\u0441 \u043C\u0435\u0436\u0434\u0443 \u0441\u0435\u0434\u0430\u043D\u043E\u043C \u0438 SUV.",paint:"#7a8086",accent:"#252a2e",length:4.6,width:1.87,height:1.66,wheelbase:2.77,wheelRadius:.36,wheelWidth:.25,seats:5,tags:["\u043A\u0440\u043E\u0441\u0441\u043E\u0432\u0435\u0440","\u0433\u0438\u0431\u0440\u0438\u0434","5 \u043C\u0435\u0441\u0442"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","215 \u043B.\u0441."],["0\u2013100 \u043A\u043C/\u0447","8,1 \u0441"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","215 \u043A\u043C/\u0447"],["\u041F\u0440\u0438\u0432\u043E\u0434","\u043F\u043E\u043B\u043D\u044B\u0439"],["\u0420\u0430\u0441\u0445\u043E\u0434","5,4 \u043B/100 \u043A\u043C"],["\u041C\u0430\u0441\u0441\u0430","1 830 \u043A\u0433"],["\u0426\u0435\u043D\u0430","3 760 000 \u20BD"]]},{id:"sport",name:"Vela RS",brand:"VELA",model:"RS",style:"sport",tagline:"\u0422\u0440\u0435\u043A\u043E\u0432\u044B\u0439 \u0441\u043F\u043E\u0440\u0442\u043A\u0430\u0440 \u0441 V8",desc:"\u041A\u0430\u0440\u0431\u043E\u043D\u043E\u0432\u044B\u0435 \u0434\u0435\u0442\u0430\u043B\u0438, \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0435 \u0430\u043D\u0442\u0438\u043A\u0440\u044B\u043B\u043E \u0438 4,0-\u043B\u0438\u0442\u0440\u043E\u0432\u044B\u0439 V8. 3,2 \u0441 \u0434\u043E \u0441\u043E\u0442\u043D\u0438 \u0438 \u043D\u0430\u0441\u0442\u043E\u044F\u0449\u0438\u0439 \u0440\u0451\u0432.",paint:"#e08a16",accent:"#101214",length:4.58,width:2.02,height:1.22,wheelbase:2.66,wheelRadius:.36,wheelWidth:.31,seats:2,tags:["\u0441\u043F\u043E\u0440\u0442\u043A\u0430\u0440","V8","3,2 \u0441"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","620 \u043B.\u0441."],["0\u2013100 \u043A\u043C/\u0447","3,2 \u0441"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","318 \u043A\u043C/\u0447"],["\u041F\u0440\u0438\u0432\u043E\u0434","\u0437\u0430\u0434\u043D\u0438\u0439"],["\u0420\u0430\u0441\u0445\u043E\u0434","13,8 \u043B/100 \u043A\u043C"],["\u041C\u0430\u0441\u0441\u0430","1 480 \u043A\u0433"],["\u0426\u0435\u043D\u0430","18 900 000 \u20BD"]]}];for(let i of Oo)i.category="trucks";for(let i of Bo)i.category="trailers";for(let i of ko)i.category="cars";function Rf(i,t){let e=i==="trucks"?Oo:i==="trailers"?Bo:ko;return e.find(n=>n.id===t)||e[0]}var yt=i=>document.getElementById(i),Ii={trucks:Oo,trailers:Bo,cars:ko},a1=Object.fromEntries(Af.map(i=>[i.id,i])),c1=["#e9ecec","#b9c0c6","#2f5d8a","#16233f","#a4241d","#7d1a2e","#cf5a13","#e0b528","#1f6b45","#37a58c","#0f6b70","#4b3c85","#6d2a6b","#7a3b2a","#5a3c25","#c2a878","#2f353b","#101214"],Nf="garage3d-showroom-v1",Uf={exterior:"\u{1F310}",side:"\u25E7",rear:"\u25A3",front:"\u25CD",driver:"\u{1F9D1}\u200D\u2708\uFE0F",passenger:"\u{1FA91}",salon:"\u{1F698}",bunk:"\u{1F6CF}"},l1=new Set(["KeyW","KeyA","KeyS","KeyD","KeyQ","KeyE"]),Dn=new Set,h1=3.4,u1=2.8,Ot={cat:"trucks",id:"atlas-vision",view:"exterior",preset:"studio",color:null,fav:[],favOnly:!1,autoRotate:!0,search:"",compare:null,damage:!1},Yh=new Map;function d1(){return`${Ot.cat}:${Ot.id}`}function Yo(){let i=d1();return Yh.has(i)||Yh.set(i,new Set),Yh.get(i)}var Gn={};try{Gn=JSON.parse(localStorage.getItem(Nf)||"{}")||{}}catch{Gn={}}Gn.cat&&Ii[Gn.cat]&&(Ot.cat=Gn.cat);Gn.id&&(Ot.id=Gn.id);Ot.fav=Array.isArray(Gn.fav)?Gn.fav:[];Ot.preset=Gn.preset||"studio";var Nr=Gn.colors&&typeof Gn.colors=="object"?Gn.colors:{};function Wo(){try{localStorage.setItem(Nf,JSON.stringify({cat:Ot.cat,id:Ot.id,fav:Ot.fav,preset:Ot.preset,colors:Nr}))}catch{}}function sn(){return Rf(Ot.cat,Ot.id)}var Mn,Ff=!0;function f1(){try{let i=document.createElement("canvas");return!!(i.getContext("webgl2")||i.getContext("webgl"))}catch{return!1}}try{if(!f1())throw new Error("WebGL context is not available");Mn=of(yt("gl"))}catch(i){Ff=!1,Mn=af();let t=document.createElement("div");t.className="webgl-error",t.innerHTML="<b>3D \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u043E \u0432 \u044D\u0442\u043E\u043C \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435</b><span>\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0441\u043E\u0437\u0434\u0430\u0442\u044C WebGL-\u043A\u043E\u043D\u0442\u0435\u043A\u0441\u0442: \u0432\u043A\u043B\u044E\u0447\u0438\u0442\u0435 \u0430\u043F\u043F\u0430\u0440\u0430\u0442\u043D\u043E\u0435 \u0443\u0441\u043A\u043E\u0440\u0435\u043D\u0438\u0435. \u041A\u0430\u0442\u0430\u043B\u043E\u0433, \u0445\u0430\u0440\u0430\u043A\u0442\u0435\u0440\u0438\u0441\u0442\u0438\u043A\u0438 \u0438 \u0441\u043F\u0438\u0441\u043E\u043A \u0432\u0438\u0434\u043E\u0432 \u043D\u0438\u0436\u0435 \u0440\u0430\u0431\u043E\u0442\u0430\u044E\u0442 \u0438 \u0431\u0435\u0437 3D.</span>",yt("viewport").appendChild(t),yt("gl").classList.add("hidden"),console.warn("\u0413\u0410\u0420\u0410\u0416 3D: WebGL \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D, \u0432\u043A\u043B\u044E\u0447\u0451\u043D \u0440\u0435\u0436\u0438\u043C \u043A\u0430\u0442\u0430\u043B\u043E\u0433\u0430.",i)}var Jh=nf(Mn.renderer),Jn=Cs(),Xe=new jc(Mn.camera,yt("gl"),{touch:Jn.touch});typeof window!="undefined"&&(window.__garageCam=Xe);document.documentElement.classList.toggle("is-touch",Jn.touch);document.documentElement.classList.toggle("is-phone",Jn.phone);document.documentElement.classList.toggle("is-tablet",Jn.tablet);document.documentElement.classList.toggle("is-desktop",Jn.desktop);document.documentElement.classList.toggle("is-coarse",Jn.coarse);document.documentElement.classList.toggle("is-portrait",Jn.portrait);var Kh=()=>{let i=(window.innerHeight||0)>=(window.innerWidth||0);document.documentElement.classList.toggle("is-portrait",i),document.documentElement.classList.toggle("is-landscape",!i)};Kh();window.addEventListener("orientationchange",()=>setTimeout(Kh,120));window.addEventListener("resize",Kh);var Ur=Mn.scene,pe=null,xi=new Map;function jh(i){return`${i.category}:${i.id}`}function We(i){if(Array.isArray(i.views)&&i.views.length)return i.views;let t=jh(i);xi.has(t)||m1(i,nl(i,Jh));let e=xi.get(t);return i.views=e.views,i.anchors=e.anchors,i.views}function Of(i){let t=jh(i),e=xi.get(t);return e&&xi.delete(t),e}var p1=6;function m1(i,t){let e=jh(i);for(xi.has(e)&&xi.delete(e),xi.set(e,t);xi.size>p1;){let[n,s]=xi.entries().next().value;xi.delete(n),s.root.traverse(r=>{var o,a;(a=(o=r.geometry)==null?void 0:o.dispose)==null||a.call(o)})}}var rl=null,$h=!1,Ho=null,Pi=!0,Me=i=>{let t=yt("stage-live");t.textContent=i,t.classList.add("show"),clearTimeout(Me.t),Me.t=setTimeout(()=>t.classList.remove("show"),1800)};function g1(){pe&&(Ur.remove(pe.root),pe.root.traverse(i=>{var t,e,n;if(i.geometry&&((e=(t=i.geometry).dispose)==null||e.call(t)),i.material){let s=Array.isArray(i.material)?i.material:[i.material];for(let r of s)r&&r.__shared!==!0&&((n=r.dispose)==null||n.call(r))}}),pe=null)}function Xo(){var n,s,r,o;let i=((n=pe==null?void 0:pe.damage)==null?void 0:n.list)||[],t=Yo();i.forEach((a,c)=>{a.patch.visible=t.has(c)});let e=t.size>0;Ot.damage=e,(s=pe==null?void 0:pe.damage)!=null&&s.group&&(pe.damage.group.visible=e);for(let a of["damage-btn","damage-btn-2"])(r=yt(a))==null||r.classList.toggle("on",e);(o=yt("damage-btn"))==null||o.classList.toggle("active",e)}function ol(){if(!pe||!pe.damage){Me("\u0423 \u044D\u0442\u043E\u0439 \u043C\u043E\u0434\u0435\u043B\u0438 \u043D\u0435\u0442 \u043F\u043E\u0432\u0440\u0435\u0436\u0434\u0435\u043D\u0438\u0439");return}let i=Yo();i.size?(i.clear(),Me("\u0412\u0441\u0435 \u043F\u043E\u0432\u0440\u0435\u0436\u0434\u0435\u043D\u0438\u044F \u0443\u0431\u0440\u0430\u043D\u044B")):(pe.damage.list.forEach((t,e)=>i.add(e)),Me(`\u0414\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u044B \u0432\u0441\u0435 \u043F\u043E\u0432\u0440\u0435\u0436\u0434\u0435\u043D\u0438\u044F: ${i.size} \u0448\u0442.`)),Xo(),Ps(sn())}function _1(i){var s,r;if(!((r=(s=pe==null?void 0:pe.damage)==null?void 0:s.list)!=null&&r[i]))return;let t=Yo(),e=pe.damage.list[i],n=t.has(i);n?t.delete(i):t.add(i),Xo(),Ps(sn()),Me(n?`\u0423\u0431\u0440\u0430\u043D\u043E: ${e.spec.label}`:`\u0414\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u043E: ${e.spec.label}`)}function x1(){var s;let i=((s=pe==null?void 0:pe.damage)==null?void 0:s.list)||[],t=Yo(),e=i.map((r,o)=>o).filter(r=>!t.has(r));if(!e.length){Me("\u0412\u0441\u0435 \u043F\u044F\u0442\u043D\u0430 \u0443\u0436\u0435 \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u044B");return}let n=e[Math.floor(Math.random()*e.length)];t.add(n),Xo(),Ps(sn()),Me(`\u0414\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u043E: ${i[n].spec.label}`)}function Qh(i,{instant:t=!1,view:e=null}={}){$h=!0,yt("loader").classList.remove("hidden"),g1(),setTimeout(()=>{var a,c;let n=Of(i)||nl(i,Jh),s=Nr[i.id]||i.paint;for(let l of n.paintMats)l&&l.color&&l.color.set(s);Ur.add(n.root),pe=n,Xo();let r=0;n.root.traverse(l=>{var h;if(l.isMesh&&l.geometry){let u=l.geometry,d=u.index?u.index.count:((h=u.attributes.position)==null?void 0:h.count)||0;r+=d/3}}),yt("poly-badge").textContent=`${Math.round(r/1e3)}K \u043F\u043E\u043B\u0438\u0433\u043E\u043D\u043E\u0432`;let o=e||We(i).find(l=>l.id===(t?"exterior":Ot.view))||We(i)[0];if(Ot.view=o.id,Xe.controls.autoRotate=!!o.autoRotate&&Pi&&Ot.view==="exterior",Xe.setView(o,{instant:t}),zf(i),tu(i),yt("mode-badge").textContent=kf(i,o),yt("loader").classList.add("hidden"),$h=!1,Ps(i),(a=yt("compare-btn"))==null||a.classList.toggle("on",!!Ot.compare),(c=yt("compare-btn-2"))==null||c.classList.toggle("active",!!Ot.compare),Xo(),rl){let l=rl;rl=null,Qh(l.unit,l.opts)}},60)}function cl(i,t,{instant:e=!1}={}){Ot.cat=i,Ot.id=t,Wo();let n=sn();Dr(),Ps(n),tu(n);let s=`${n.category==="trailers"?"trailer":n.category==="cars"?"car":"truck"}:${n.id}`;if(!pe||pe.root.name!==s){if($h){rl={unit:n,opts:{instant:e}};return}Qh(n,{instant:e,view:We(n)[0]})}}var Bf={catalog:"panel-catalog",details:"panel-details"},Go=null;function Cf(i){var n,s;let t=Go===i?null:i;Go=t;for(let[r,o]of Object.entries(Bf)){let a=yt(o);if(!a)continue;a.classList.toggle("open",r===t);let c=yt(`${r}-toggle`);c&&c.setAttribute("aria-expanded",String(r===t))}(n=yt("backdrop"))==null||n.classList.toggle("show",!!t);let e=yt("light-pop");t&&e&&(e.classList.add("hidden"),(s=yt("light-btn"))==null||s.setAttribute("aria-expanded","false")),t==="catalog"&&setTimeout(()=>{var r;return(r=yt("search"))==null?void 0:r.focus({preventScroll:!0})},240)}function Vo(){var t,e,n;if(!Go)return!1;let i=Go;Go=null;for(let[s,r]of Object.entries(Bf))(t=yt(r))==null||t.classList.toggle("open",!1),(e=yt(`${s}-toggle`))==null||e.setAttribute("aria-expanded","false");return(n=yt("backdrop"))==null||n.classList.remove("show"),!!i}function y1(i){return i.category==="trucks"?"\u{1F69B}":i.category==="cars"?i.style==="sport"?"\u{1F3CE}":i.style==="van"?"\u{1F690}":i.style==="pickup"?"\u{1F6FB}":"\u{1F697}":{tanker:"\u{1F6E2}",adr:"\u2623",silo:"\u{1F3D7}",tipper:"\u{1F6A7}",livestock:"\u{1F404}",logging:"\u{1F332}",container:"\u{1F9F1}",refcontainer:"\u2744",carrier:"\u{1F697}",bdouble:"\u{1F69A}",boat:"\u26F5",glass:"\u{1FA9F}",crane:"\u{1F3D7}",sidetip:"\u{1F69B}",dolly:"\u{1FAB5}",lowboy:"\u{1F9BE}",reefer:"\u2744",curtain:"\u{1F3AD}",van:"\u{1F4E6}",flatbed:"\u25AD"}[i.type]||"\u{1F4E6}"}function Dr(){let i=yt("unit-list"),t=Ot.search.trim().toLowerCase(),e=Ii[Ot.cat].filter(s=>Ot.favOnly&&!Ot.fav.includes(s.id)?!1:t?[s.name,s.brand,s.tagline,s.type,...s.tags||[],...(s.specs||[]).flat()].join(" ").toLowerCase().includes(t):!0);if(i.innerHTML="",yt("cat-hint").textContent=a1[Ot.cat].hint+(Ot.favOnly?" \xB7 \u0442\u043E\u043B\u044C\u043A\u043E \u0438\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0435":""),yt("catalog-count").textContent=e.length,!e.length){i.innerHTML='<p class="mini" style="padding:14px">\u041D\u0438\u0447\u0435\u0433\u043E \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E. \u041E\u0447\u0438\u0441\u0442\u0438\u0442\u0435 \u043F\u043E\u0438\u0441\u043A \u0438\u043B\u0438 \u0438\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0435.</p>';return}e.forEach((s,r)=>{let o=document.createElement("button");o.className="unit"+(s.id===Ot.id&&s.category===Ot.cat?" active":""),o.setAttribute("role","option"),o.setAttribute("aria-selected",String(s.id===Ot.id));let a=Nr[s.id]||s.color||s.paint||"#888";o.innerHTML=`
      <span class="thumb">${y1(s)}</span>
      <span>
        <span class="u-name"><i class="swatch" style="background:${a}"></i>${s.name}</span>
        <span class="u-sub">${s.tagline||""}</span>
      </span>
      <span class="u-idx">${String(Ii[Ot.cat].indexOf(s)+1).padStart(2,"0")}</span>
      ${Ot.fav.includes(s.id)?'<span class="fav-dot">\u2605</span>':""}
    `,o.onclick=()=>{var c;if(s.id===Ot.id&&s.category===Ot.cat){al();return}cl(Ot.cat,s.id),(window.innerWidth<=900||(c=window.matchMedia)!=null&&c.call(window,"(max-width: 900px)").matches)&&Vo()},i.appendChild(o)});let n=i.querySelector(".unit.active");n&&typeof n.scrollIntoView=="function"&&n.scrollIntoView({block:"nearest"})}function Ps(i){yt("d-brand").textContent=`${i.brand||"\u2014"} \xB7 2026`,yt("d-name").textContent=i.name,yt("d-cat").textContent=i.category==="trucks"?"\u0422\u042F\u0413\u0410\u0427":i.category==="trailers"?"\u041F\u0420\u0418\u0426\u0415\u041F":"\u0410\u0412\u0422\u041E\u041C\u041E\u0411\u0418\u041B\u042C",yt("d-desc").textContent=i.desc||i.tagline||"",yt("unit-kind").textContent=(i.category==="trucks"?"\u0422\u042F\u0413\u0410\u0427":i.category==="trailers"?"\u041F\u0420\u0418\u0426\u0415\u041F":"\u0410\u0412\u0422\u041E\u041C\u041E\u0411\u0418\u041B\u042C")+(i.meta?` \xB7 ${i.meta}`:""),yt("unit-name").textContent=i.name,yt("unit-tagline").textContent=i.tagline||"";let t=yt("d-tags");t.innerHTML="";for(let u of i.tags||[]){let d=document.createElement("span");d.className="tag",d.textContent=u,t.appendChild(d)}let e=yt("spec-grid");e.innerHTML="";for(let[u,d]of i.specs||[]){let f=document.createElement("div");f.className="spec",f.innerHTML=`<span>${u}</span><b>${d}</b>`,e.appendChild(f)}let n=yt("paint-row");n.innerHTML="";let s=Nr[i.id]||i.paint||i.color;[...new Set([i.paint||i.color||"#e9ecec",...c1])].forEach(u=>{let d=document.createElement("button");d.className="paint-dot"+(u.toLowerCase()===String(s).toLowerCase()?" active":""),d.style.background=u,d.title=u,d.onclick=()=>v1(i,u),n.appendChild(d)});let o=yt("damage-row"),a=yt("damage-list"),c=yt("damage-count");if(o&&a){o.innerHTML="",a.innerHTML="";let u=pe&&pe.damage?pe.damage:null,d=Yo(),f=u?u.count||u.list.length:0;c&&(c.textContent=`${d.size} / ${f}`);let _=document.createElement("button");_.className="damage-btn"+(u&&d.size?" on":""),_.innerHTML=u?`<span class="damage-dot"></span><span class="damage-text">${d.size} \u0448\u0442. \xB7 ${f} \u043D\u0430 \u043A\u0443\u0437\u043E\u0432\u0435</span><span class="damage-key">X</span>`:'<span class="damage-text">\u041F\u043E\u0432\u0440\u0435\u0436\u0434\u0435\u043D\u0438\u044F \u043D\u0435 \u0437\u0430\u0434\u0430\u043D\u044B</span>',_.disabled=!u,_.onclick=()=>ol(),o.appendChild(_);let g=document.createElement("button");g.className="damage-btn damage-more",g.innerHTML='<span class="damage-text">\uFF0B \u0435\u0449\u0451 \u043E\u0434\u043D\u043E</span>',g.disabled=!u||d.size>=f,g.onclick=()=>x1(),o.appendChild(g),u&&u.list.forEach((m,p)=>{let y=document.createElement("button");y.className=`dmg-chip ${m.spec.kind}`+(d.has(p)?" on":""),y.dataset.index=String(p),y.dataset.kind=m.spec.kind,y.title=m.spec.label,y.innerHTML=`<span class="dmg-kind"></span><span class="dmg-name">${m.spec.label}</span>`,y.onclick=()=>_1(p),a.appendChild(y)})}let l=yt("anchor-row");if(l.innerHTML="",pe&&pe.anchors){let u=pe.anchors.filter(d=>!d.damage);yt("anchor-count").textContent=u.length,u.forEach(d=>{let f=document.createElement("button");f.className="anchor-btn",f.textContent=d.label+(d.side?` (${d.side})`:""),f.onclick=()=>S1(d),l.appendChild(f)})}else yt("anchor-count").textContent="0";let h=Ii[Ot.cat].findIndex(u=>u.id===i.id);yt("counter").textContent=`${h+1} / ${Ii[Ot.cat].length}`}function v1(i,t){if(Nr[i.id]=t,Wo(),pe)for(let e of pe.paintMats)e!=null&&e.color&&e.color.set(t);Dr(),Ps(i),Me(`\u0426\u0432\u0435\u0442: ${t.toUpperCase()}`)}function tu(i){let t=yt("dock-views");t.innerHTML="";let e=[{title:"\u0421\u041D\u0410\u0420\u0423\u0416\u0418",items:We(i).filter(n=>n.group==="exterior")},{title:"\u0412\u041D\u0423\u0422\u0420\u0418",items:We(i).filter(n=>n.group==="interior")}];for(let n of e){if(!n.items.length)continue;let s=document.createElement("span");s.className="eyebrow",s.textContent=n.title,t.appendChild(s);for(let r of n.items){let o=document.createElement("button");o.className="chip"+(r.id===Ot.view?" active":""),o.textContent=`${Uf[r.id]||""} ${r.label}`.trim(),o.dataset.view=r.id,o.onclick=()=>$n(r.id),t.appendChild(o)}}}function kf(i,t){return!t||t.group!=="interior"?"\u0421\u041D\u0410\u0420\u0423\u0416\u0418":t.id==="bunk"?"\u0421\u041F\u0410\u041B\u042C\u041D\u0418\u041A":i.category==="cars"?t.id==="salon"?"\u0418\u0417 \u0421\u0410\u041B\u041E\u041D\u0410":"\u0417\u0410 \u0420\u0423\u041B\u0401\u041C":t.id==="passenger"?"\u041C\u0415\u0421\u0422\u041E \u041F\u0410\u0421\u0421\u0410\u0416\u0418\u0420\u0410":"\u0412 \u041A\u0410\u0411\u0418\u041D\u0415"}function zf(i){let t=yt("view-switch");t.innerHTML="";let e=["exterior","side","rear","front","driver","passenger","salon","bunk"];[...We(i)].sort((s,r)=>e.indexOf(s.id)-e.indexOf(r.id)).forEach(s=>{let r=document.createElement("button");r.className="view-btn"+(s.group==="interior"?" interior":"")+(s.id===Ot.view?" active":""),r.dataset.view=s.id,r.innerHTML=`<span>${Uf[s.id]||"\u{1F4F7}"}</span>${s.label}`,r.onclick=()=>$n(s.id),t.appendChild(r)})}function b1(){let i=yt("navpad");if(!i)return;let t={up:()=>Xe.orbit(0,.075),down:()=>Xe.orbit(0,-.075),left:()=>Xe.orbit(-.1,0),right:()=>Xe.orbit(.1,0),zin:()=>Xe.zoomBy(1.05),zout:()=>Xe.zoomBy(1/1.05),reset:()=>eu()};i.querySelectorAll("[data-act]").forEach(e=>{let n=t[e.dataset.act];if(!n)return;let s=null,r=null,o=()=>{s&&(clearTimeout(s),s=null),r&&(cancelAnimationFrame(r),r=null),e.classList.remove("holding")},a=c=>{c.preventDefault(),e.dataset.act!=="reset"&&cs(5),n(),o(),e.classList.add("holding"),e.dataset.act!=="reset"&&(s=setTimeout(()=>{let l=()=>{n(),r=requestAnimationFrame(l)};l()},280))};e.addEventListener("pointerdown",a),e.addEventListener("pointerup",o),e.addEventListener("pointerleave",o),e.addEventListener("pointercancel",o),e.addEventListener("blur",o),e.addEventListener("keydown",c=>{(c.key==="Enter"||c.key===" ")&&(c.preventDefault(),n())})})}function $n(i){let t=sn(),e=We(t).find(n=>n.id===i)||We(t)[0];Ot.view=e.id,Xe.controls.autoRotate=!!e.autoRotate&&Pi,Xe.setView(e,{instant:!1}),document.querySelectorAll(".view-btn").forEach(n=>n.classList.toggle("active",n.dataset.view===i)),document.querySelectorAll("#dock-views .chip").forEach(n=>n.classList.toggle("active",n.dataset.view===i)),yt("mode-badge").textContent=kf(t,e),yt("orbit-btn").classList.toggle("active",!!e.autoRotate&&Pi),Wo()}function eu(){let i=sn(),t=We(i).find(e=>e.id===Ot.view)||We(i)[0];Xe.setView(t,{instant:!0}),Xe.controls.autoRotate=!!t.autoRotate&&Pi,Me(`\u041A\u0430\u043C\u0435\u0440\u0430: ${t.label||"\u0438\u0441\u0445\u043E\u0434\u043D\u044B\u0439 \u0432\u0438\u0434"}`),cs(8)}window.__garageReset=eu;function al(){let i=sn(),t=We(i);if(t.some(s=>s.group==="interior"&&s.id===Ot.view)){$n((t.find(s=>s.id==="exterior")||t[0]).id),Me("\u0412\u0438\u0434 \u0441\u043D\u0430\u0440\u0443\u0436\u0438");return}let n=t.find(s=>s.id==="driver")||t.find(s=>s.id==="salon")||t.find(s=>s.group==="interior");if(!n){Me("\u0423 \u043F\u0440\u0438\u0446\u0435\u043F\u043E\u0432 \u0441\u0430\u043B\u043E\u043D\u0430 \u043D\u0435\u0442 \u2014 \u043E\u0441\u043C\u043E\u0442\u0440 \u0442\u043E\u043B\u044C\u043A\u043E \u0441\u043D\u0430\u0440\u0443\u0436\u0438");return}$n(n.id),Me(n.id==="salon"?"\u0421\u043C\u043E\u0442\u0440\u0438\u043C \u0438\u0437 \u0441\u0430\u043B\u043E\u043D\u0430":"\u0421\u0430\u0434\u0438\u043C\u0441\u044F \u0432 \u043A\u0430\u0431\u0438\u043D\u0443")}function S1(i){let[t,e,n]=i.pos,s=(pe==null?void 0:pe.kind)==="car"?2.6:3.4,r=new D(t,e,n),o=new D(1,.55,-.9).normalize(),a={id:"anchor",label:i.label,group:"exterior",seat:!1,orbit:!0,fov:34,pos:[t+o.x*s,Math.max(e+o.y*s,.4),n+o.z*s],target:[t,e,n]};Xe.setView(a,{instant:!1}),yt("mode-badge").textContent="\u041E\u0421\u041C\u041E\u0422\u0420",Me(i.label+(i.side?` \xB7 ${i.side}`:"")),document.querySelectorAll(".view-btn").forEach(c=>c.classList.remove("active"))}function Pf(){let i=sn();if(Ot.compare)Ot.compare=null,Hf(),yt("compare-btn").classList.remove("on"),yt("compare-btn-2").classList.remove("active"),Me("\u0421\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u0435 \u0432\u044B\u043A\u043B\u044E\u0447\u0435\u043D\u043E");else{let e=Ii[Ot.cat],n=e.findIndex(r=>r.id===i.id),s=e[(n+1)%e.length];if(s.id===i.id){Me("\u0412 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438 \u043E\u0434\u043D\u0430 \u043C\u043E\u0434\u0435\u043B\u044C \u2014 \u0441\u0440\u0430\u0432\u043D\u0438\u0432\u0430\u0442\u044C \u043D\u0435 \u0441 \u0447\u0435\u043C");return}Ot.compare=s.id,M1(i,s),yt("compare-btn").classList.add("on"),yt("compare-btn-2").classList.add("active"),Me(`\u0420\u044F\u0434\u043E\u043C: ${s.name}`)}}function M1(i,t){Hf();let e=new dn,n={...t,category:i.category},s=Of(n)||nl(n,Jh),r=Nr[t.id]||t.paint;for(let a of s.paintMats)a!=null&&a.color&&a.color.set(r);let o=(i.category==="cars"?3.6:4.6)*(s.kind==="car"?1:1.15);s.root.position.set(o,0,0),s.root.rotation.y=-.4,e.add(s.root),Ur.add(e),Ho={group:e,built:s}}function Hf(){Ho&&(Ur.remove(Ho.group),Ho.group.traverse(i=>{var t,e;i.geometry&&((e=(t=i.geometry).dispose)==null||e.call(t))}),Ho=null)}function zo(i){let t=Ii[Ot.cat],e=t.findIndex(s=>s.id===Ot.id),n=t[(e+i+t.length)%t.length];cl(Ot.cat,n.id)}function qh(){let i=[...Oo.map(n=>["trucks",n.id]),...Bo.map(n=>["trailers",n.id]),...ko.map(n=>["cars",n.id])],[t,e]=i[Math.floor(Math.random()*i.length)];t!==Ot.cat&&(Ot.cat=t,document.querySelectorAll(".cat-tab").forEach(n=>{let s=n.dataset.cat===t;n.classList.toggle("active",s),n.setAttribute("aria-selected",String(s))})),cl(t,e),Me("\u0421\u043B\u0443\u0447\u0430\u0439\u043D\u044B\u0439 \u044D\u043A\u0441\u043F\u043E\u043D\u0430\u0442")}function E1(i){Ii[i]&&(Ot.cat=i,Ot.id=Ii[i][0].id,document.querySelectorAll(".cat-tab").forEach(t=>{let e=t.dataset.cat===i;t.classList.toggle("active",e),t.setAttribute("aria-selected",String(e))}),cl(i,Ot.id,{instant:!1}))}function If(){if(!Ff){Me("\u0421\u043A\u0440\u0438\u043D\u0448\u043E\u0442 \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D \u0431\u0435\u0437 3D");return}Mn.renderer.render(Ur,Mn.camera);let i=document.createElement("a"),t=sn();i.download=`garage3d-${t.id}-${Ot.view}.png`,i.href=Mn.renderer.domElement.toDataURL("image/png"),i.click(),Me("\u0421\u043A\u0440\u0438\u043D\u0448\u043E\u0442 \u0441\u043E\u0445\u0440\u0430\u043D\u0451\u043D")}function Lf(){var t,e;let i=document.documentElement;document.fullscreenElement?(e=document.exitFullscreen)==null||e.call(document):(t=i.requestFullscreen)==null||t.call(i).catch(()=>Me("\u041F\u043E\u043B\u043D\u044B\u0439 \u044D\u043A\u0440\u0430\u043D \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D"))}function Df(){let i=document.querySelector(".hud-top"),t=document.querySelector(".hud-bottom");if(!i||!t)return;let e=document.documentElement;e.style.setProperty("--hud-h",`${Math.round(i.getBoundingClientRect().height)||54}px`),e.style.setProperty("--dock-h",`${Math.round(t.getBoundingClientRect().height)||64}px`)}function w1(){document.querySelectorAll(".cat-tab").forEach(s=>{s.onclick=()=>E1(s.dataset.cat)}),document.querySelectorAll("#dock-env .chip").forEach(s=>{s.onclick=()=>{Ot.preset=s.dataset.preset,Mn.setPreset(Ot.preset),document.querySelectorAll("#dock-env .chip").forEach(r=>r.classList.toggle("active",r.dataset.preset===Ot.preset)),Wo(),Me(`\u0421\u0432\u0435\u0442: ${s.textContent}`)}}),yt("prev-btn").onclick=()=>zo(-1),yt("next-btn").onclick=()=>zo(1),yt("random-btn").onclick=qh,yt("shot-btn").onclick=If,yt("full-btn").onclick=Lf,yt("catalog-toggle").onclick=()=>Cf("catalog"),yt("details-toggle").onclick=()=>Cf("details"),yt("catalog-close").onclick=()=>Vo(),yt("details-close").onclick=()=>Vo(),yt("backdrop").onclick=()=>Vo(),yt("light-btn").onclick=s=>{s.stopPropagation();let r=yt("light-pop"),o=r.classList.contains("hidden");r.classList.toggle("hidden",!o),yt("light-btn").setAttribute("aria-expanded",String(o))},yt("light-pop").onclick=s=>s.stopPropagation(),document.addEventListener("click",()=>{var s,r;(s=yt("light-pop"))==null||s.classList.add("hidden"),(r=yt("light-btn"))==null||r.setAttribute("aria-expanded","false")}),yt("help-btn").onclick=()=>yt("help-modal").classList.remove("hidden"),yt("help-close").onclick=()=>yt("help-modal").classList.add("hidden"),yt("help-modal").onclick=s=>{s.target.id==="help-modal"&&yt("help-modal").classList.add("hidden")},yt("d-inside").onclick=()=>{let s=sn(),r=We(s).find(o=>o.id==="driver"||o.id==="salon");r?$n(r.id):Me("\u0423 \u044D\u0442\u043E\u0439 \u043C\u043E\u0434\u0435\u043B\u0438 \u043D\u0435\u0442 \u0441\u0430\u043B\u043E\u043D\u0430 \u2014 \u043F\u0440\u0438\u0446\u0435\u043F \u0442\u043E\u043B\u044C\u043A\u043E \u0441\u043D\u0430\u0440\u0443\u0436\u0438")},yt("d-outside").onclick=()=>$n("exterior"),yt("orbit-btn").onclick=()=>{let s=We(sn()).find(r=>r.id===Ot.view);Pi=!Pi,Xe.controls.autoRotate=Pi&&!!(s!=null&&s.autoRotate),yt("orbit-btn").classList.toggle("active",Pi),Me(Pi?"\u0410\u0432\u0442\u043E\u0432\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u0432\u043A\u043B\u044E\u0447\u0435\u043D\u043E":"\u0410\u0432\u0442\u043E\u0432\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u0432\u044B\u043A\u043B\u044E\u0447\u0435\u043D\u043E")},yt("reset-btn").onclick=()=>{let s=sn();$n(We(s)[0].id)},yt("look-btn").onclick=()=>{let s=sn(),r=We(s).find(a=>a.id===Ot.view);if(r!=null&&r.seat){$n(r.id),Me("\u0412\u0437\u0433\u043B\u044F\u0434 \u0432\u043F\u0435\u0440\u0451\u0434 \u2014 \u0442\u044F\u043D\u0438\u0442\u0435 \u043C\u044B\u0448\u044C\u044E, \u0447\u0442\u043E\u0431\u044B \u043E\u0441\u043C\u043E\u0442\u0440\u0435\u0442\u044C\u0441\u044F");return}let o=We(s).find(a=>a.id==="driver")||We(s).find(a=>a.group==="interior");if(!o){Me("\u0423 \u044D\u0442\u043E\u0439 \u043C\u043E\u0434\u0435\u043B\u0438 \u043D\u0435\u0442 \u0441\u0430\u043B\u043E\u043D\u0430 \u2014 \u043E\u0441\u043C\u043E\u0442\u0440 \u0442\u043E\u043B\u044C\u043A\u043E \u0441\u043D\u0430\u0440\u0443\u0436\u0438");return}$n(o.id),Me("\u0421\u0432\u043E\u0431\u043E\u0434\u043D\u044B\u0439 \u0432\u0437\u0433\u043B\u044F\u0434: \u0442\u044F\u043D\u0438\u0442\u0435 \u043C\u044B\u0448\u044C\u044E/\u043F\u0430\u043B\u044C\u0446\u0435\u043C")},yt("damage-btn").onclick=ol,yt("damage-btn-2").onclick=ol,yt("compare-btn").onclick=Pf,yt("compare-btn-2").onclick=Pf,yt("fav-filter").onclick=()=>{Ot.favOnly=!Ot.favOnly,yt("fav-filter").classList.toggle("on",Ot.favOnly),Dr(),Me(Ot.favOnly?"\u0422\u043E\u043B\u044C\u043A\u043E \u0438\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0435":"\u0412\u0441\u0435 \u043C\u043E\u0434\u0435\u043B\u0438")},yt("search").oninput=s=>{Ot.search=s.target.value,Dr()},b1();let i=yt("gl"),t=new Ri,e=null,n=s=>i.classList.toggle("is-dragging",s);i.addEventListener("pointerdown",()=>n(!0)),window.addEventListener("pointerup",()=>n(!1)),window.addEventListener("pointercancel",()=>n(!1)),i.addEventListener("dblclick",()=>{clearTimeout(e),al()}),i.addEventListener("click",s=>{if(s.detail>1)return;let r=i.getBoundingClientRect();if(!r.width||!r.height)return;let o=(s.clientX-r.left)/r.width*2-1,a=-((s.clientY-r.top)/r.height)*2+1;clearTimeout(e),e=setTimeout(()=>{if(!(pe!=null&&pe.root)||!Xe.controls.enabled)return;t.setFromCamera(new pt(o,a),Mn.camera);let c=t.intersectObject(pe.root,!0).find(d=>{var f;return d.object.isMesh&&d.object.visible!==!1&&((f=d.object.material)==null?void 0:f.transparent)!==!0});if(!c)return;let l=c.point.clone();Xe.focusOn(l);let h=null,u=1.1;for(let d of pe.anchors||[]){let f=l.distanceTo(new D(...d.pos));f<u&&(u=f,h=d.label)}cs(6),Me(h?`\u0424\u043E\u043A\u0443\u0441: ${h}`:"\u0424\u043E\u043A\u0443\u0441 \u043D\u0430 \u0434\u0435\u0442\u0430\u043B\u0438 \xB7 \u043A\u043D\u043E\u043F\u043A\u0430 \u2302 \u0432\u0435\u0440\u043D\u0451\u0442 \u0432\u0438\u0434")},220)}),Jn.touch&&(sf(yt("gl"),{onSwipe:s=>{cs(10),zo(s>0?1:-1),Me(s>0?"\u0421\u043B\u0435\u0434\u0443\u044E\u0449\u0430\u044F \u043C\u043E\u0434\u0435\u043B\u044C \u2192":"\u2190 \u041F\u0440\u0435\u0434\u044B\u0434\u0443\u0449\u0430\u044F \u043C\u043E\u0434\u0435\u043B\u044C")},onDoubleTap:()=>{cs(12),al()},onPinch:()=>{cs(6);let s=We(sn()).find(r=>r.id===Ot.view);s&&$n(s.id)}}),rf(()=>{Jn.phone&&(cs([14,40,14]),qh())},{threshold:26})),window.addEventListener("keydown",s=>{var r;if(s.target.tagName!=="INPUT"){if(l1.has(s.code)){Dn.add(s.code),s.preventDefault();return}if(s.key==="Shift"){Dn.add("ShiftLeft");return}if(s.key==="Control"||s.key==="Home"){eu();return}switch(s.key){case"ArrowRight":zo(1);break;case"ArrowLeft":zo(-1);break;case"+":case"=":case"\u044E":Xe.zoomBy(1.16);break;case"-":case"_":case"\u0436":Xe.zoomBy(1/1.16);break;case"r":case"R":case"\u043A":case"\u041A":qh();break;case"f":case"F":case"\u0430":case"\u0410":Lf();break;case"c":case"C":case"\u0441":case"\u0421":If();break;case"h":case"H":case"\u0440":case"\u0420":yt("help-modal").classList.toggle("hidden");break;case"i":case"I":case"\u0448":case"\u0428":al();break;case"x":case"X":case"\u0447":case"\u0427":ol();break;case"Escape":{yt("help-modal").classList.add("hidden"),(r=yt("light-pop"))==null||r.classList.add("hidden"),Vo();break}case" ":{s.preventDefault(),yt("orbit-btn").onclick();break}case"0":$n((We(sn()).find(o=>o.group==="exterior")||We(sn())[0]).id);break;case"1":case"2":case"3":case"4":case"5":{let o=Number(s.key),a=We(sn()).slice(0,5);a[o-1]&&$n(a[o-1].id);break}default:break}}}),window.addEventListener("keyup",s=>{Dn.delete(s.code),s.key==="Shift"&&Dn.delete("ShiftLeft")}),window.addEventListener("blur",()=>Dn.clear()),yt("d-name").ondblclick=()=>{let s=sn().id;Ot.fav=Ot.fav.includes(s)?Ot.fav.filter(r=>r!==s):[...Ot.fav,s],Wo(),Dr(),Me(Ot.fav.includes(s)?"\u0414\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u043E \u0432 \u0438\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0435 \u2605":"\u0423\u0431\u0440\u0430\u043D\u043E \u0438\u0437 \u0438\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0433\u043E")}}var T1=new bo,Zh=0,il=0,sl=0;function Vf(){var t;requestAnimationFrame(Vf);let i=Math.min(.06,T1.getDelta());if(Xe.update(i),Dn.size&&Xe){let e=Dn.has("ShiftLeft")||Dn.has("ShiftRight")?u1:1,n=h1*e*i,s=(Dn.has("KeyW")?1:0)-(Dn.has("KeyS")?1:0),r=(Dn.has("KeyD")?1:0)-(Dn.has("KeyA")?1:0),o=(Dn.has("KeyE")?1:0)-(Dn.has("KeyQ")?1:0);(s||r||o)&&Xe.fly(s,r,o,n)}if(Mn.renderer.render(Ur,Mn.camera),Zh+=1,il+=i,il>=1){let e=Zh/il;Zh=0,il=0,e<30?(sl+=1,sl>=2&&((t=Mn.adaptQuality)==null||t.call(Mn,e),sl=0)):sl=0}}function A1(){let i=document.querySelector(".stage-hint");i&&(i.innerHTML=Jn.touch?"<span><kbd>1 \u043F\u0430\u043B\u0435\u0446</kbd> \u0432\u0440\u0430\u0449\u0430\u0442\u044C</span><span><kbd>2 \u043F\u0430\u043B\u044C\u0446\u0430</kbd> \u0437\u0443\u043C</span><span><kbd>\u0422\u0430\u043F \u043F\u043E \u0434\u0435\u0442\u0430\u043B\u0438</kbd> \u0444\u043E\u043A\u0443\u0441</span><span><kbd>\u0421\u0432\u0430\u0439\u043F</kbd> \u043C\u043E\u0434\u0435\u043B\u044C</span><span><kbd>\u0414\u0432\u043E\u0439\u043D\u043E\u0439 \u0442\u0430\u043F</kbd> \u0441\u0430\u043B\u043E\u043D</span>":"<span><kbd>\u041B\u041A\u041C</kbd> \u0432\u0440\u0430\u0449\u0430\u0442\u044C</span><span><kbd>\u041A\u043E\u043B\u0435\u0441\u043E</kbd> \u0437\u0443\u043C \u043A \u043A\u0443\u0440\u0441\u043E\u0440\u0443</span><span><kbd>\u041A\u043B\u0438\u043A</kbd> \u0444\u043E\u043A\u0443\u0441 \u043D\u0430 \u0434\u0435\u0442\u0430\u043B\u0438</span><span><kbd>A D W S</kbd> \u043A\u0430\u043C\u0435\u0440\u0430</span><span><kbd>I</kbd> \u0441\u0430\u043B\u043E\u043D</span><span><kbd>\u2190 \u2192</kbd> \u043C\u043E\u0434\u0435\u043B\u044C</span>");let t=document.querySelector(".foot-note");t&&Jn.touch&&(t.textContent="40 \u043C\u043E\u0434\u0435\u043B\u0435\u0439 \xB7 10 / 20 / 10"),Mn.setPreset(Ot.preset),document.querySelectorAll("#dock-env .chip").forEach(n=>n.classList.toggle("active",n.dataset.preset===Ot.preset)),document.querySelectorAll(".cat-tab").forEach(n=>{let s=n.dataset.cat===Ot.cat;n.classList.toggle("active",s),n.setAttribute("aria-selected",String(s))}),w1(),Df(),window.addEventListener("resize",Df);let e=sn();Dr(),Ps(e),tu(e),zf(e),yt("mode-badge").textContent="\u0421\u041D\u0410\u0420\u0423\u0416\u0418",Qh(e,{instant:!0,view:We(e)[0]}),Vf(),setTimeout(()=>Me(Jn.touch?"\u0421\u0432\u0430\u0439\u043F \u2014 \u0434\u0440\u0443\u0433\u0430\u044F \u043C\u043E\u0434\u0435\u043B\u044C \xB7 \u0434\u0432\u043E\u0439\u043D\u043E\u0439 \u0442\u0430\u043F \u2014 \u0441\u0430\u043B\u043E\u043D":"\u041A\u0430\u0442\u0430\u043B\u043E\u0433 \u0438 \u043A\u0430\u0440\u0442\u043E\u0447\u043A\u0430 \u2014 \u043A\u043D\u043E\u043F\u043A\u0438 \u0441\u0432\u0435\u0440\u0445\u0443 \xB7 I \u2014 \u0441\u0430\u043B\u043E\u043D"),900)}A1();})();
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2026 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
