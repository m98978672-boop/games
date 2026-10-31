(()=>{var kc=0,tl=1,Hc=2;var En=1,Gc=2,is=3,Ri=0,He=1,ti=2,Pi=0,ln=1,el=2,il=3,nl=4,Vc=5;var Tn=100,Wc=101,Xc=102,qc=103,Yc=104,Zc=200,$c=201,Jc=202,Kc=203,sl=204,rl=205,Qc=206,jc=207,th=208,eh=209,ih=210,nh=211,sh=212,rh=213,oh=214,Ar=0,Cr=1,Rr=2,Yn=3,Pr=4,Ir=5,Lr=6,Dr=7,co=0,ah=1,lh=2,gi=0,ol=1,al=2,ll=3,cl=4,hl=5,ul=6,dl=7;var fl=300,cn=301,An=302,ho=303,uo=304,Os=306,_n=1e3,Si=1001,Nr=1002,Ce=1003,ch=1004;var zs=1005;var Se=1006,fo=1007;var Ii=1008;var Ze=1009,pl=1010,ml=1011,ns=1012,po=1013,xi=1014,oi=1015,_i=1016,mo=1017,go=1018,ss=1020,gl=35902,xl=35899,_l=1021,yl=1022,$e=1023,bi=1026,hn=1027,xo=1028,_o=1029,un=1030,yo=1031;var vo=1033,ks=33776,Hs=33777,Gs=33778,Vs=33779,Mo=35840,So=35841,bo=35842,wo=35843,Eo=36196,To=37492,Ao=37496,Co=37488,Ro=37489,Ws=37490,Po=37491,Io=37808,Lo=37809,Do=37810,No=37811,Uo=37812,Fo=37813,Bo=37814,Oo=37815,zo=37816,ko=37817,Ho=37818,Go=37819,Vo=37820,Wo=37821,Xo=36492,qo=36494,Yo=36495,Zo=36283,$o=36284,Xs=36285,Jo=36286;var ys=2300,Ur=2301,Er=2302,Xa=2303,qa=2400,Ya=2401,Za=2402;var hh=3200;var Ko=0,uh=1,Wi="",Qe="srgb",vs="srgb-linear",Ms="linear",ee="srgb";var Tr=7680;var dh=519,fh=512,ph=513,mh=514,Qo=515,gh=516,xh=517,jo=518,_h=519,yh=35044,Ge=35048;var vl="300 es",pi=2e3,Zn=2001;function bu(s){for(let t=s.length-1;t>=0;--t)if(s[t]>=65535)return!0;return!1}function wu(s){return ArrayBuffer.isView(s)&&!(s instanceof DataView)}function Ss(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function vh(){let s=Ss("canvas");return s.style.display="block",s}var cc={},$n=null;function Ml(...s){let t="THREE."+s.shift();$n?$n("log",t,...s):console.log(t,...s)}function Mh(s){let t=s[0];if(typeof t=="string"&&t.startsWith("TSL:")){let e=s[1];e&&e.isStackTrace?s[0]+=" "+e.getLocation():s[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return s}function It(...s){s=Mh(s);let t="THREE."+s.shift();if($n)$n("warn",t,...s);else{let e=s[0];e&&e.isStackTrace?console.warn(e.getError(t)):console.warn(t,...s)}}function Nt(...s){s=Mh(s);let t="THREE."+s.shift();if($n)$n("error",t,...s);else{let e=s[0];e&&e.isStackTrace?console.error(e.getError(t)):console.error(t,...s)}}function xn(...s){let t=s.join(" ");t in cc||(cc[t]=!0,It(...s))}function Sh(s,t,e){return new Promise(function(i,n){function r(){switch(s.clientWaitSync(t,s.SYNC_FLUSH_COMMANDS_BIT,0)){case s.WAIT_FAILED:n();break;case s.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:i()}}setTimeout(r,e)})}var bh={[Ar]:Cr,[Rr]:Lr,[Pr]:Dr,[Yn]:Ir,[Cr]:Ar,[Lr]:Rr,[Dr]:Pr,[Ir]:Yn},wi=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[t]===void 0&&(i[t]=[]),i[t].indexOf(e)===-1&&i[t].push(e)}hasEventListener(t,e){let i=this._listeners;return i===void 0?!1:i[t]!==void 0&&i[t].indexOf(e)!==-1}removeEventListener(t,e){let i=this._listeners;if(i===void 0)return;let n=i[t];if(n!==void 0){let r=n.indexOf(e);r!==-1&&n.splice(r,1)}}dispatchEvent(t){let e=this._listeners;if(e===void 0)return;let i=e[t.type];if(i!==void 0){t.target=this;let n=i.slice(0);for(let r=0,o=n.length;r<o;r++)n[r].call(this,t);t.target=null}}},Ue=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var Ma=Math.PI/180,Fr=180/Math.PI;function qs(){let s=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Ue[s&255]+Ue[s>>8&255]+Ue[s>>16&255]+Ue[s>>24&255]+"-"+Ue[t&255]+Ue[t>>8&255]+"-"+Ue[t>>16&15|64]+Ue[t>>24&255]+"-"+Ue[e&63|128]+Ue[e>>8&255]+"-"+Ue[e>>16&255]+Ue[e>>24&255]+Ue[i&255]+Ue[i>>8&255]+Ue[i>>16&255]+Ue[i>>24&255]).toLowerCase()}function Yt(s,t,e){return Math.max(t,Math.min(e,s))}function Eu(s,t){return(s%t+t)%t}function Sa(s,t,e){return(1-e)*s+e*t}function us(s,t){switch(t.constructor){case Float32Array:return s;case Uint32Array:return s/4294967295;case Uint16Array:return s/65535;case Uint8Array:case Uint8ClampedArray:return s/255;case Int32Array:return Math.max(s/2147483647,-1);case Int16Array:return Math.max(s/32767,-1);case Int8Array:return Math.max(s/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function We(s,t){switch(t.constructor){case Float32Array:return s;case Uint32Array:return Math.round(s*4294967295);case Uint16Array:return Math.round(s*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(s*255);case Int32Array:return Math.round(s*2147483647);case Int16Array:return Math.round(s*32767);case Int8Array:return Math.round(s*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var Tl=class Tl{constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,i=this.y,n=t.elements;return this.x=n[0]*e+n[3]*i+n[6],this.y=n[1]*e+n[4]*i+n[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Yt(this.x,t.x,e.x),this.y=Yt(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=Yt(this.x,t,e),this.y=Yt(this.y,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Yt(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let i=this.dot(t)/e;return Math.acos(Yt(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,i=this.y-t.y;return e*e+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let i=Math.cos(e),n=Math.sin(e),r=this.x-t.x,o=this.y-t.y;return this.x=r*i-o*n+t.x,this.y=r*n+o*i+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};Tl.prototype.isVector2=!0;var Gt=Tl,si=class{constructor(t=0,e=0,i=0,n=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=i,this._w=n}static slerpFlat(t,e,i,n,r,o,a){let l=i[n+0],c=i[n+1],h=i[n+2],d=i[n+3],u=r[o+0],p=r[o+1],g=r[o+2],_=r[o+3];if(d!==_||l!==u||c!==p||h!==g){let m=l*u+c*p+h*g+d*_;m<0&&(u=-u,p=-p,g=-g,_=-_,m=-m);let f=1-a;if(m<.9995){let v=Math.acos(m),C=Math.sin(v);f=Math.sin(f*v)/C,a=Math.sin(a*v)/C,l=l*f+u*a,c=c*f+p*a,h=h*f+g*a,d=d*f+_*a}else{l=l*f+u*a,c=c*f+p*a,h=h*f+g*a,d=d*f+_*a;let v=1/Math.sqrt(l*l+c*c+h*h+d*d);l*=v,c*=v,h*=v,d*=v}}t[e]=l,t[e+1]=c,t[e+2]=h,t[e+3]=d}static multiplyQuaternionsFlat(t,e,i,n,r,o){let a=i[n],l=i[n+1],c=i[n+2],h=i[n+3],d=r[o],u=r[o+1],p=r[o+2],g=r[o+3];return t[e]=a*g+h*d+l*p-c*u,t[e+1]=l*g+h*u+c*d-a*p,t[e+2]=c*g+h*p+a*u-l*d,t[e+3]=h*g-a*d-l*u-c*p,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,i,n){return this._x=t,this._y=e,this._z=i,this._w=n,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let i=t._x,n=t._y,r=t._z,o=t._order,a=Math.cos,l=Math.sin,c=a(i/2),h=a(n/2),d=a(r/2),u=l(i/2),p=l(n/2),g=l(r/2);switch(o){case"XYZ":this._x=u*h*d+c*p*g,this._y=c*p*d-u*h*g,this._z=c*h*g+u*p*d,this._w=c*h*d-u*p*g;break;case"YXZ":this._x=u*h*d+c*p*g,this._y=c*p*d-u*h*g,this._z=c*h*g-u*p*d,this._w=c*h*d+u*p*g;break;case"ZXY":this._x=u*h*d-c*p*g,this._y=c*p*d+u*h*g,this._z=c*h*g+u*p*d,this._w=c*h*d-u*p*g;break;case"ZYX":this._x=u*h*d-c*p*g,this._y=c*p*d+u*h*g,this._z=c*h*g-u*p*d,this._w=c*h*d+u*p*g;break;case"YZX":this._x=u*h*d+c*p*g,this._y=c*p*d+u*h*g,this._z=c*h*g-u*p*d,this._w=c*h*d-u*p*g;break;case"XZY":this._x=u*h*d-c*p*g,this._y=c*p*d-u*h*g,this._z=c*h*g+u*p*d,this._w=c*h*d+u*p*g;break;default:It("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let i=e/2,n=Math.sin(i);return this._x=t.x*n,this._y=t.y*n,this._z=t.z*n,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,i=e[0],n=e[4],r=e[8],o=e[1],a=e[5],l=e[9],c=e[2],h=e[6],d=e[10],u=i+a+d;if(u>0){let p=.5/Math.sqrt(u+1);this._w=.25/p,this._x=(h-l)*p,this._y=(r-c)*p,this._z=(o-n)*p}else if(i>a&&i>d){let p=2*Math.sqrt(1+i-a-d);this._w=(h-l)/p,this._x=.25*p,this._y=(n+o)/p,this._z=(r+c)/p}else if(a>d){let p=2*Math.sqrt(1+a-i-d);this._w=(r-c)/p,this._x=(n+o)/p,this._y=.25*p,this._z=(l+h)/p}else{let p=2*Math.sqrt(1+d-i-a);this._w=(o-n)/p,this._x=(r+c)/p,this._y=(l+h)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let i=t.dot(e)+1;return i<1e-8?(i=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=i):(this._x=0,this._y=-t.z,this._z=t.y,this._w=i)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=i),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(Yt(this.dot(t),-1,1)))}rotateTowards(t,e){let i=this.angleTo(t);if(i===0)return this;let n=Math.min(1,e/i);return this.slerp(t,n),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let i=t._x,n=t._y,r=t._z,o=t._w,a=e._x,l=e._y,c=e._z,h=e._w;return this._x=i*h+o*a+n*c-r*l,this._y=n*h+o*l+r*a-i*c,this._z=r*h+o*c+i*l-n*a,this._w=o*h-i*a-n*l-r*c,this._onChangeCallback(),this}slerp(t,e){let i=t._x,n=t._y,r=t._z,o=t._w,a=this.dot(t);a<0&&(i=-i,n=-n,r=-r,o=-o,a=-a);let l=1-e;if(a<.9995){let c=Math.acos(a),h=Math.sin(c);l=Math.sin(l*c)/h,e=Math.sin(e*c)/h,this._x=this._x*l+i*e,this._y=this._y*l+n*e,this._z=this._z*l+r*e,this._w=this._w*l+o*e,this._onChangeCallback()}else this._x=this._x*l+i*e,this._y=this._y*l+n*e,this._z=this._z*l+r*e,this._w=this._w*l+o*e,this.normalize();return this}slerpQuaternions(t,e,i){return this.copy(t).slerp(e,i)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),i=Math.random(),n=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(n*Math.sin(t),n*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},Al=class Al{constructor(t=0,e=0,i=0){this.x=t,this.y=e,this.z=i}set(t,e,i){return i===void 0&&(i=this.z),this.x=t,this.y=e,this.z=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(hc.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(hc.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,i=this.y,n=this.z,r=t.elements;return this.x=r[0]*e+r[3]*i+r[6]*n,this.y=r[1]*e+r[4]*i+r[7]*n,this.z=r[2]*e+r[5]*i+r[8]*n,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,i=this.y,n=this.z,r=t.elements,o=1/(r[3]*e+r[7]*i+r[11]*n+r[15]);return this.x=(r[0]*e+r[4]*i+r[8]*n+r[12])*o,this.y=(r[1]*e+r[5]*i+r[9]*n+r[13])*o,this.z=(r[2]*e+r[6]*i+r[10]*n+r[14])*o,this}applyQuaternion(t){let e=this.x,i=this.y,n=this.z,r=t.x,o=t.y,a=t.z,l=t.w,c=2*(o*n-a*i),h=2*(a*e-r*n),d=2*(r*i-o*e);return this.x=e+l*c+o*d-a*h,this.y=i+l*h+a*c-r*d,this.z=n+l*d+r*h-o*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,i=this.y,n=this.z,r=t.elements;return this.x=r[0]*e+r[4]*i+r[8]*n,this.y=r[1]*e+r[5]*i+r[9]*n,this.z=r[2]*e+r[6]*i+r[10]*n,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Yt(this.x,t.x,e.x),this.y=Yt(this.y,t.y,e.y),this.z=Yt(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=Yt(this.x,t,e),this.y=Yt(this.y,t,e),this.z=Yt(this.z,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Yt(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let i=t.x,n=t.y,r=t.z,o=e.x,a=e.y,l=e.z;return this.x=n*l-r*a,this.y=r*o-i*l,this.z=i*a-n*o,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let i=t.dot(this)/e;return this.copy(t).multiplyScalar(i)}projectOnPlane(t){return ba.copy(this).projectOnVector(t),this.sub(ba)}reflect(t){return this.sub(ba.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let i=this.dot(t)/e;return Math.acos(Yt(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,i=this.y-t.y,n=this.z-t.z;return e*e+i*i+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,i){let n=Math.sin(e)*t;return this.x=n*Math.sin(i),this.y=Math.cos(e)*t,this.z=n*Math.cos(i),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,i){return this.x=t*Math.sin(e),this.y=i,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),i=this.setFromMatrixColumn(t,1).length(),n=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=i,this.z=n,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,i=Math.sqrt(1-e*e);return this.x=i*Math.cos(t),this.y=e,this.z=i*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};Al.prototype.isVector3=!0;var O=Al,ba=new O,hc=new si,Cl=class Cl{constructor(t,e,i,n,r,o,a,l,c){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,i,n,r,o,a,l,c)}set(t,e,i,n,r,o,a,l,c){let h=this.elements;return h[0]=t,h[1]=n,h[2]=a,h[3]=e,h[4]=r,h[5]=l,h[6]=i,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],this}extractBasis(t,e,i){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let i=t.elements,n=e.elements,r=this.elements,o=i[0],a=i[3],l=i[6],c=i[1],h=i[4],d=i[7],u=i[2],p=i[5],g=i[8],_=n[0],m=n[3],f=n[6],v=n[1],C=n[4],M=n[7],b=n[2],S=n[5],T=n[8];return r[0]=o*_+a*v+l*b,r[3]=o*m+a*C+l*S,r[6]=o*f+a*M+l*T,r[1]=c*_+h*v+d*b,r[4]=c*m+h*C+d*S,r[7]=c*f+h*M+d*T,r[2]=u*_+p*v+g*b,r[5]=u*m+p*C+g*S,r[8]=u*f+p*M+g*T,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],i=t[1],n=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8];return e*o*h-e*a*c-i*r*h+i*a*l+n*r*c-n*o*l}invert(){let t=this.elements,e=t[0],i=t[1],n=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8],d=h*o-a*c,u=a*l-h*r,p=c*r-o*l,g=e*d+i*u+n*p;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let _=1/g;return t[0]=d*_,t[1]=(n*c-h*i)*_,t[2]=(a*i-n*o)*_,t[3]=u*_,t[4]=(h*e-n*l)*_,t[5]=(n*r-a*e)*_,t[6]=p*_,t[7]=(i*l-c*e)*_,t[8]=(o*e-i*r)*_,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,i,n,r,o,a){let l=Math.cos(r),c=Math.sin(r);return this.set(i*l,i*c,-i*(l*o+c*a)+o+t,-n*c,n*l,-n*(-c*o+l*a)+a+e,0,0,1),this}scale(t,e){return xn("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(wa.makeScale(t,e)),this}rotate(t){return xn("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(wa.makeRotation(-t)),this}translate(t,e){return xn("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(wa.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,i,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,i=t.elements;for(let n=0;n<9;n++)if(e[n]!==i[n])return!1;return!0}fromArray(t,e=0){for(let i=0;i<9;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){let i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t}clone(){return new this.constructor().fromArray(this.elements)}};Cl.prototype.isMatrix3=!0;var Ft=Cl,wa=new Ft,uc=new Ft().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),dc=new Ft().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Tu(){let s={enabled:!0,workingColorSpace:vs,spaces:{},convert:function(n,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===ee&&(n.r=Vi(n.r),n.g=Vi(n.g),n.b=Vi(n.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(n.applyMatrix3(this.spaces[r].toXYZ),n.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===ee&&(n.r=qn(n.r),n.g=qn(n.g),n.b=qn(n.b))),n},workingToColorSpace:function(n,r){return this.convert(n,this.workingColorSpace,r)},colorSpaceToWorking:function(n,r){return this.convert(n,r,this.workingColorSpace)},getPrimaries:function(n){return this.spaces[n].primaries},getTransfer:function(n){return n===Wi?Ms:this.spaces[n].transfer},getToneMappingMode:function(n){return this.spaces[n].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(n,r=this.workingColorSpace){return n.fromArray(this.spaces[r].luminanceCoefficients)},define:function(n){Object.assign(this.spaces,n)},_getMatrix:function(n,r,o){return n.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(n){return this.spaces[n].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(n=this.workingColorSpace){return this.spaces[n].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(n,r){return xn("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),s.workingToColorSpace(n,r)},toWorkingColorSpace:function(n,r){return xn("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),s.colorSpaceToWorking(n,r)}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],i=[.3127,.329];return s.define({[vs]:{primaries:t,whitePoint:i,transfer:Ms,toXYZ:uc,fromXYZ:dc,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:Qe},outputColorSpaceConfig:{drawingBufferColorSpace:Qe}},[Qe]:{primaries:t,whitePoint:i,transfer:ee,toXYZ:uc,fromXYZ:dc,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:Qe}}}),s}var qt=Tu();function Vi(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function qn(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}var Ln,Br=class{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let i;if(t instanceof HTMLCanvasElement)i=t;else{Ln===void 0&&(Ln=Ss("canvas")),Ln.width=t.width,Ln.height=t.height;let n=Ln.getContext("2d");t instanceof ImageData?n.putImageData(t,0,0):n.drawImage(t,0,0,t.width,t.height),i=Ln}return i.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=Ss("canvas");e.width=t.width,e.height=t.height;let i=e.getContext("2d");i.drawImage(t,0,0,t.width,t.height);let n=i.getImageData(0,0,t.width,t.height),r=n.data;for(let o=0;o<r.length;o++)r[o]=Vi(r[o]/255)*255;return i.putImageData(n,0,0),e}else if(t.data){let e=t.data.slice(0);for(let i=0;i<e.length;i++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[i]=Math.floor(Vi(e[i]/255)*255):e[i]=Vi(e[i]);return{data:e,width:t.width,height:t.height}}else return It("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},Au=0,Jn=class{constructor(t=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Au++}),this.uuid=qs(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let e=this.data;return typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):typeof VideoFrame<"u"&&e instanceof VideoFrame?t.set(e.displayWidth,e.displayHeight,0):e!==null?t.set(e.width,e.height,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let i={uuid:this.uuid,url:""},n=this.data;if(n!==null){let r;if(Array.isArray(n)){r=[];for(let o=0,a=n.length;o<a;o++)n[o].isDataTexture?r.push(Ea(n[o].image)):r.push(Ea(n[o]))}else r=Ea(n);i.url=r}return e||(t.images[this.uuid]=i),i}};function Ea(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?Br.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(It("Texture: Unable to serialize Texture."),{})}var Cu=0,Ta=new O,qe=class s extends wi{constructor(t=s.DEFAULT_IMAGE,e=s.DEFAULT_MAPPING,i=Si,n=Si,r=Se,o=Ii,a=$e,l=Ze,c=s.DEFAULT_ANISOTROPY,h=Wi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Cu++}),this.uuid=qs(),this.name="",this.source=new Jn(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=i,this.wrapT=n,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new Gt(0,0),this.repeat=new Gt(1,1),this.center=new Gt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ft,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Ta).x}get height(){return this.source.getSize(Ta).y}get depth(){return this.source.getSize(Ta).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let e in t){let i=t[e];if(i===void 0){It(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}let n=this[e];if(n===void 0){It(`Texture.setValues(): property '${e}' does not exist.`);continue}n&&i&&n.isVector2&&i.isVector2||n&&i&&n.isVector3&&i.isVector3||n&&i&&n.isMatrix3&&i.isMatrix3?n.copy(i):this[e]=i}}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),e||(t.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==fl)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case _n:t.x=t.x-Math.floor(t.x);break;case Si:t.x=t.x<0?0:1;break;case Nr:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case _n:t.y=t.y-Math.floor(t.y);break;case Si:t.y=t.y<0?0:1;break;case Nr:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};qe.DEFAULT_IMAGE=null;qe.DEFAULT_MAPPING=fl;qe.DEFAULT_ANISOTROPY=1;var Rl=class Rl{constructor(t=0,e=0,i=0,n=1){this.x=t,this.y=e,this.z=i,this.w=n}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,i,n){return this.x=t,this.y=e,this.z=i,this.w=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,i=this.y,n=this.z,r=this.w,o=t.elements;return this.x=o[0]*e+o[4]*i+o[8]*n+o[12]*r,this.y=o[1]*e+o[5]*i+o[9]*n+o[13]*r,this.z=o[2]*e+o[6]*i+o[10]*n+o[14]*r,this.w=o[3]*e+o[7]*i+o[11]*n+o[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,i,n,r,l=t.elements,c=l[0],h=l[4],d=l[8],u=l[1],p=l[5],g=l[9],_=l[2],m=l[6],f=l[10];if(Math.abs(h-u)<.01&&Math.abs(d-_)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+u)<.1&&Math.abs(d+_)<.1&&Math.abs(g+m)<.1&&Math.abs(c+p+f-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let C=(c+1)/2,M=(p+1)/2,b=(f+1)/2,S=(h+u)/4,T=(d+_)/4,x=(g+m)/4;return C>M&&C>b?C<.01?(i=0,n=.707106781,r=.707106781):(i=Math.sqrt(C),n=S/i,r=T/i):M>b?M<.01?(i=.707106781,n=0,r=.707106781):(n=Math.sqrt(M),i=S/n,r=x/n):b<.01?(i=.707106781,n=.707106781,r=0):(r=Math.sqrt(b),i=T/r,n=x/r),this.set(i,n,r,e),this}let v=Math.sqrt((m-g)*(m-g)+(d-_)*(d-_)+(u-h)*(u-h));return Math.abs(v)<.001&&(v=1),this.x=(m-g)/v,this.y=(d-_)/v,this.z=(u-h)/v,this.w=Math.acos((c+p+f-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Yt(this.x,t.x,e.x),this.y=Yt(this.y,t.y,e.y),this.z=Yt(this.z,t.z,e.z),this.w=Yt(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=Yt(this.x,t,e),this.y=Yt(this.y,t,e),this.z=Yt(this.z,t,e),this.w=Yt(this.w,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Yt(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this.w=t.w+(e.w-t.w)*i,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};Rl.prototype.isVector4=!0;var pe=Rl,Or=class extends wi{constructor(t=1,e=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Se,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=i.depth,this.scissor=new pe(0,0,t,e),this.scissorTest=!1,this.viewport=new pe(0,0,t,e),this.textures=[];let n={width:t,height:e,depth:i.depth},r=new qe(n),o=i.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveColorBuffer=i.resolveColorBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.storeMultisampledColorBuffer=i.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=i.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=i.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(t={}){let e={minFilter:Se,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),t!==null&&t.renderTarget===null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,i=1){if(this.width!==t||this.height!==e||this.depth!==i){this.width=t,this.height=e,this.depth=i;for(let n=0,r=this.textures.length;n<r;n++)this.textures[n].image.width=t,this.textures[n].image.height=e,this.textures[n].image.depth=i,this.textures[n].isData3DTexture!==!0&&(this.textures[n].isArrayTexture=this.textures[n].image.depth>1);this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,i=t.textures.length;e<i;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;let n=Object.assign({},t.textures[e].image);this.textures[e].source=new Jn(n)}if(this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveColorBuffer=t.resolveColorBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,this.storeMultisampledColorBuffer=t.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=t.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=t.storeMultisampledStencilBuffer,t.depthTexture!==null)if(t.depthTexture.renderTarget===t){let e=t.depthTexture.clone();e.renderTarget=null,this.depthTexture=e}else this.depthTexture=t.depthTexture;return this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},Ye=class extends Or{constructor(t=1,e=1,i={}){super(t,e,i),this.isWebGLRenderTarget=!0}},bs=class extends qe{constructor(t=null,e=1,i=1,n=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:i,depth:n},this.magFilter=Ce,this.minFilter=Ce,this.wrapR=Si,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var zr=class extends qe{constructor(t=null,e=1,i=1,n=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:i,depth:n},this.magFilter=Ce,this.minFilter=Ce,this.wrapR=Si,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}};var lo=class lo{constructor(t,e,i,n,r,o,a,l,c,h,d,u,p,g,_,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,i,n,r,o,a,l,c,h,d,u,p,g,_,m)}set(t,e,i,n,r,o,a,l,c,h,d,u,p,g,_,m){let f=this.elements;return f[0]=t,f[4]=e,f[8]=i,f[12]=n,f[1]=r,f[5]=o,f[9]=a,f[13]=l,f[2]=c,f[6]=h,f[10]=d,f[14]=u,f[3]=p,f[7]=g,f[11]=_,f[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new lo().fromArray(this.elements)}copy(t){let e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],e[9]=i[9],e[10]=i[10],e[11]=i[11],e[12]=i[12],e[13]=i[13],e[14]=i[14],e[15]=i[15],this}copyPosition(t){let e=this.elements,i=t.elements;return e[12]=i[12],e[13]=i[13],e[14]=i[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,i){return this.determinantAffine()===0?(t.set(1,0,0),e.set(0,1,0),i.set(0,0,1),this):(t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(t,e,i){return this.set(t.x,e.x,i.x,0,t.y,e.y,i.y,0,t.z,e.z,i.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();let e=this.elements,i=t.elements,n=1/Dn.setFromMatrixColumn(t,0).length(),r=1/Dn.setFromMatrixColumn(t,1).length(),o=1/Dn.setFromMatrixColumn(t,2).length();return e[0]=i[0]*n,e[1]=i[1]*n,e[2]=i[2]*n,e[3]=0,e[4]=i[4]*r,e[5]=i[5]*r,e[6]=i[6]*r,e[7]=0,e[8]=i[8]*o,e[9]=i[9]*o,e[10]=i[10]*o,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,i=t.x,n=t.y,r=t.z,o=Math.cos(i),a=Math.sin(i),l=Math.cos(n),c=Math.sin(n),h=Math.cos(r),d=Math.sin(r);if(t.order==="XYZ"){let u=o*h,p=o*d,g=a*h,_=a*d;e[0]=l*h,e[4]=-l*d,e[8]=c,e[1]=p+g*c,e[5]=u-_*c,e[9]=-a*l,e[2]=_-u*c,e[6]=g+p*c,e[10]=o*l}else if(t.order==="YXZ"){let u=l*h,p=l*d,g=c*h,_=c*d;e[0]=u+_*a,e[4]=g*a-p,e[8]=o*c,e[1]=o*d,e[5]=o*h,e[9]=-a,e[2]=p*a-g,e[6]=_+u*a,e[10]=o*l}else if(t.order==="ZXY"){let u=l*h,p=l*d,g=c*h,_=c*d;e[0]=u-_*a,e[4]=-o*d,e[8]=g+p*a,e[1]=p+g*a,e[5]=o*h,e[9]=_-u*a,e[2]=-o*c,e[6]=a,e[10]=o*l}else if(t.order==="ZYX"){let u=o*h,p=o*d,g=a*h,_=a*d;e[0]=l*h,e[4]=g*c-p,e[8]=u*c+_,e[1]=l*d,e[5]=_*c+u,e[9]=p*c-g,e[2]=-c,e[6]=a*l,e[10]=o*l}else if(t.order==="YZX"){let u=o*l,p=o*c,g=a*l,_=a*c;e[0]=l*h,e[4]=_-u*d,e[8]=g*d+p,e[1]=d,e[5]=o*h,e[9]=-a*h,e[2]=-c*h,e[6]=p*d+g,e[10]=u-_*d}else if(t.order==="XZY"){let u=o*l,p=o*c,g=a*l,_=a*c;e[0]=l*h,e[4]=-d,e[8]=c*h,e[1]=u*d+_,e[5]=o*h,e[9]=p*d-g,e[2]=g*d-p,e[6]=a*h,e[10]=_*d+u}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(Ru,t,Pu)}lookAt(t,e,i){let n=this.elements;return Je.subVectors(t,e),Je.lengthSq()===0&&(Je.z=1),Je.normalize(),$i.crossVectors(i,Je),$i.lengthSq()===0&&(Math.abs(i.z)===1?Je.x+=1e-4:Je.z+=1e-4,Je.normalize(),$i.crossVectors(i,Je)),$i.normalize(),er.crossVectors(Je,$i),n[0]=$i.x,n[4]=er.x,n[8]=Je.x,n[1]=$i.y,n[5]=er.y,n[9]=Je.y,n[2]=$i.z,n[6]=er.z,n[10]=Je.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let i=t.elements,n=e.elements,r=this.elements,o=i[0],a=i[4],l=i[8],c=i[12],h=i[1],d=i[5],u=i[9],p=i[13],g=i[2],_=i[6],m=i[10],f=i[14],v=i[3],C=i[7],M=i[11],b=i[15],S=n[0],T=n[4],x=n[8],w=n[12],A=n[1],I=n[5],L=n[9],D=n[13],P=n[2],N=n[6],G=n[10],k=n[14],q=n[3],H=n[7],Z=n[11],J=n[15];return r[0]=o*S+a*A+l*P+c*q,r[4]=o*T+a*I+l*N+c*H,r[8]=o*x+a*L+l*G+c*Z,r[12]=o*w+a*D+l*k+c*J,r[1]=h*S+d*A+u*P+p*q,r[5]=h*T+d*I+u*N+p*H,r[9]=h*x+d*L+u*G+p*Z,r[13]=h*w+d*D+u*k+p*J,r[2]=g*S+_*A+m*P+f*q,r[6]=g*T+_*I+m*N+f*H,r[10]=g*x+_*L+m*G+f*Z,r[14]=g*w+_*D+m*k+f*J,r[3]=v*S+C*A+M*P+b*q,r[7]=v*T+C*I+M*N+b*H,r[11]=v*x+C*L+M*G+b*Z,r[15]=v*w+C*D+M*k+b*J,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],i=t[4],n=t[8],r=t[12],o=t[1],a=t[5],l=t[9],c=t[13],h=t[2],d=t[6],u=t[10],p=t[14],g=t[3],_=t[7],m=t[11],f=t[15],v=l*p-c*u,C=a*p-c*d,M=a*u-l*d,b=o*p-c*h,S=o*u-l*h,T=o*d-a*h;return e*(_*v-m*C+f*M)-i*(g*v-m*b+f*S)+n*(g*C-_*b+f*T)-r*(g*M-_*S+m*T)}determinantAffine(){let t=this.elements,e=t[0],i=t[4],n=t[8],r=t[1],o=t[5],a=t[9],l=t[2],c=t[6],h=t[10];return e*(o*h-a*c)-i*(r*h-a*l)+n*(r*c-o*l)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,i){let n=this.elements;return t.isVector3?(n[12]=t.x,n[13]=t.y,n[14]=t.z):(n[12]=t,n[13]=e,n[14]=i),this}invert(){let t=this.elements,e=t[0],i=t[1],n=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8],d=t[9],u=t[10],p=t[11],g=t[12],_=t[13],m=t[14],f=t[15],v=e*a-i*o,C=e*l-n*o,M=e*c-r*o,b=i*l-n*a,S=i*c-r*a,T=n*c-r*l,x=h*_-d*g,w=h*m-u*g,A=h*f-p*g,I=d*m-u*_,L=d*f-p*_,D=u*f-p*m,P=v*D-C*L+M*I+b*A-S*w+T*x;if(P===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let N=1/P;return t[0]=(a*D-l*L+c*I)*N,t[1]=(n*L-i*D-r*I)*N,t[2]=(_*T-m*S+f*b)*N,t[3]=(u*S-d*T-p*b)*N,t[4]=(l*A-o*D-c*w)*N,t[5]=(e*D-n*A+r*w)*N,t[6]=(m*M-g*T-f*C)*N,t[7]=(h*T-u*M+p*C)*N,t[8]=(o*L-a*A+c*x)*N,t[9]=(i*A-e*L-r*x)*N,t[10]=(g*S-_*M+f*v)*N,t[11]=(d*M-h*S-p*v)*N,t[12]=(a*w-o*I-l*x)*N,t[13]=(e*I-i*w+n*x)*N,t[14]=(_*C-g*b-m*v)*N,t[15]=(h*b-d*C+u*v)*N,this}scale(t){let e=this.elements,i=t.x,n=t.y,r=t.z;return e[0]*=i,e[4]*=n,e[8]*=r,e[1]*=i,e[5]*=n,e[9]*=r,e[2]*=i,e[6]*=n,e[10]*=r,e[3]*=i,e[7]*=n,e[11]*=r,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],i=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],n=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,i,n))}makeTranslation(t,e,i){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,i,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),i=Math.sin(t);return this.set(1,0,0,0,0,e,-i,0,0,i,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,0,i,0,0,1,0,0,-i,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,0,i,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let i=Math.cos(e),n=Math.sin(e),r=1-i,o=t.x,a=t.y,l=t.z,c=r*o,h=r*a;return this.set(c*o+i,c*a-n*l,c*l+n*a,0,c*a+n*l,h*a+i,h*l-n*o,0,c*l-n*a,h*l+n*o,r*l*l+i,0,0,0,0,1),this}makeScale(t,e,i){return this.set(t,0,0,0,0,e,0,0,0,0,i,0,0,0,0,1),this}makeShear(t,e,i,n,r,o){return this.set(1,i,r,0,t,1,o,0,e,n,1,0,0,0,0,1),this}compose(t,e,i){let n=this.elements,r=e._x,o=e._y,a=e._z,l=e._w,c=r+r,h=o+o,d=a+a,u=r*c,p=r*h,g=r*d,_=o*h,m=o*d,f=a*d,v=l*c,C=l*h,M=l*d,b=i.x,S=i.y,T=i.z;return n[0]=(1-(_+f))*b,n[1]=(p+M)*b,n[2]=(g-C)*b,n[3]=0,n[4]=(p-M)*S,n[5]=(1-(u+f))*S,n[6]=(m+v)*S,n[7]=0,n[8]=(g+C)*T,n[9]=(m-v)*T,n[10]=(1-(u+_))*T,n[11]=0,n[12]=t.x,n[13]=t.y,n[14]=t.z,n[15]=1,this}decompose(t,e,i){let n=this.elements;t.x=n[12],t.y=n[13],t.z=n[14];let r=this.determinantAffine();if(r===0)return i.set(1,1,1),e.identity(),this;let o=Dn.set(n[0],n[1],n[2]).length(),a=Dn.set(n[4],n[5],n[6]).length(),l=Dn.set(n[8],n[9],n[10]).length();r<0&&(o=-o),hi.copy(this);let c=1/o,h=1/a,d=1/l;return hi.elements[0]*=c,hi.elements[1]*=c,hi.elements[2]*=c,hi.elements[4]*=h,hi.elements[5]*=h,hi.elements[6]*=h,hi.elements[8]*=d,hi.elements[9]*=d,hi.elements[10]*=d,e.setFromRotationMatrix(hi),i.x=o,i.y=a,i.z=l,this}makePerspective(t,e,i,n,r,o,a=pi,l=!1){let c=this.elements,h=2*r/(e-t),d=2*r/(i-n),u=(e+t)/(e-t),p=(i+n)/(i-n),g,_;if(l)g=r/(o-r),_=o*r/(o-r);else if(a===pi)g=-(o+r)/(o-r),_=-2*o*r/(o-r);else if(a===Zn)g=-o/(o-r),_=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=h,c[4]=0,c[8]=u,c[12]=0,c[1]=0,c[5]=d,c[9]=p,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=_,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,e,i,n,r,o,a=pi,l=!1){let c=this.elements,h=2/(e-t),d=2/(i-n),u=-(e+t)/(e-t),p=-(i+n)/(i-n),g,_;if(l)g=1/(o-r),_=o/(o-r);else if(a===pi)g=-2/(o-r),_=-(o+r)/(o-r);else if(a===Zn)g=-1/(o-r),_=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=h,c[4]=0,c[8]=0,c[12]=u,c[1]=0,c[5]=d,c[9]=0,c[13]=p,c[2]=0,c[6]=0,c[10]=g,c[14]=_,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){let e=this.elements,i=t.elements;for(let n=0;n<16;n++)if(e[n]!==i[n])return!1;return!0}fromArray(t,e=0){for(let i=0;i<16;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){let i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t[e+9]=i[9],t[e+10]=i[10],t[e+11]=i[11],t[e+12]=i[12],t[e+13]=i[13],t[e+14]=i[14],t[e+15]=i[15],t}};lo.prototype.isMatrix4=!0;var Kt=lo,Dn=new O,hi=new Kt,Ru=new O(0,0,0),Pu=new O(1,1,1),$i=new O,er=new O,Je=new O,fc=new Kt,pc=new si,mi=class s{constructor(t=0,e=0,i=0,n=s.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=i,this._order=n}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,i,n=this._order){return this._x=t,this._y=e,this._z=i,this._order=n,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,i=!0){let n=t.elements,r=n[0],o=n[4],a=n[8],l=n[1],c=n[5],h=n[9],d=n[2],u=n[6],p=n[10];switch(e){case"XYZ":this._y=Math.asin(Yt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,p),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(u,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Yt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-d,r),this._z=0);break;case"ZXY":this._x=Math.asin(Yt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-d,p),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Yt(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(u,p),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(Yt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-d,r)):(this._x=0,this._y=Math.atan2(a,p));break;case"XZY":this._z=Math.asin(-Yt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(u,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,p),this._y=0);break;default:It("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,i===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,i){return fc.makeRotationFromQuaternion(t),this.setFromRotationMatrix(fc,e,i)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return pc.setFromEuler(this),this.setFromQuaternion(pc,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};mi.DEFAULT_ORDER="XYZ";var Kn=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},Iu=0,mc=new O,Nn=new si,Oi=new Kt,ir=new O,ds=new O,Lu=new O,Du=new si,gc=new O(1,0,0),xc=new O(0,1,0),_c=new O(0,0,1),yc={type:"added"},Nu={type:"removed"},Un={type:"childadded",child:null},Aa={type:"childremoved",child:null},Re=class s extends wi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Iu++}),this.uuid=qs(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=s.DEFAULT_UP.clone();let t=new O,e=new mi,i=new si,n=new O(1,1,1);function r(){i.setFromEuler(e,!1)}function o(){e.setFromQuaternion(i,void 0,!1)}e._onChange(r),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:n},modelViewMatrix:{value:new Kt},normalMatrix:{value:new Ft}}),this.matrix=new Kt,this.matrixWorld=new Kt,this.matrixAutoUpdate=s.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=s.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Kn,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Nn.setFromAxisAngle(t,e),this.quaternion.multiply(Nn),this}rotateOnWorldAxis(t,e){return Nn.setFromAxisAngle(t,e),this.quaternion.premultiply(Nn),this}rotateX(t){return this.rotateOnAxis(gc,t)}rotateY(t){return this.rotateOnAxis(xc,t)}rotateZ(t){return this.rotateOnAxis(_c,t)}translateOnAxis(t,e){return mc.copy(t).applyQuaternion(this.quaternion),this.position.add(mc.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(gc,t)}translateY(t){return this.translateOnAxis(xc,t)}translateZ(t){return this.translateOnAxis(_c,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Oi.copy(this.matrixWorld).invert())}lookAt(t,e,i){t.isVector3?ir.copy(t):ir.set(t,e,i);let n=this.parent;this.updateWorldMatrix(!0,!1),ds.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Oi.lookAt(ds,ir,this.up):Oi.lookAt(ir,ds,this.up),this.quaternion.setFromRotationMatrix(Oi),n&&(Oi.extractRotation(n.matrixWorld),Nn.setFromRotationMatrix(Oi),this.quaternion.premultiply(Nn.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(Nt("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(yc),Un.child=t,this.dispatchEvent(Un),Un.child=null):Nt("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(Nu),Aa.child=t,this.dispatchEvent(Aa),Aa.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Oi.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Oi.multiply(t.parent.matrixWorld)),t.applyMatrix4(Oi),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(yc),Un.child=t,this.dispatchEvent(Un),Un.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let i=0,n=this.children.length;i<n;i++){let o=this.children[i].getObjectByProperty(t,e);if(o!==void 0)return o}}getObjectsByProperty(t,e,i=[]){this[t]===e&&i.push(this);let n=this.children;for(let r=0,o=n.length;r<o;r++)n[r].getObjectsByProperty(t,e,i);return i}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ds,t,Lu),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ds,Du,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(t){t(this);let e=this.children;for(let i=0,n=e.length;i<n;i++)e[i].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let i=0,n=e.length;i<n;i++)e[i].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let e=t.x,i=t.y,n=t.z,r=this.matrix.elements;r[12]+=e-r[0]*e-r[4]*i-r[8]*n,r[13]+=i-r[1]*e-r[5]*i-r[9]*n,r[14]+=n-r[2]*e-r[6]*i-r[10]*n}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let i=0,n=e.length;i<n;i++)e[i].updateMatrixWorld(t)}updateWorldMatrix(t,e,i=!1){let n=this.parent;if(t===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||i)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,i=!0),e===!0){let r=this.children;for(let o=0,a=r.length;o<a;o++)r[o].updateWorldMatrix(!1,!0,i)}}toJSON(t){let e=t===void 0||typeof t=="string",i={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let n={};n.uuid=this.uuid,n.type=this.type,n.name=this.name,n.castShadow=this.castShadow,n.receiveShadow=this.receiveShadow,n.visible=this.visible,n.frustumCulled=this.frustumCulled,n.renderOrder=this.renderOrder,n.static=this.static,n.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(n.userData=this.userData),n.layers=this.layers.mask,n.matrix=this.matrix.toArray(),n.up=this.up.toArray(),this.pivot!==null&&(n.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(n.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(n.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(n.type="InstancedMesh",n.count=this.count,n.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(n.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(n.type="BatchedMesh",n.perObjectFrustumCulled=this.perObjectFrustumCulled,n.sortObjects=this.sortObjects,n.drawRanges=this._drawRanges,n.reservedRanges=this._reservedRanges,n.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),n.instanceInfo=this._instanceInfo.map(a=>({...a})),n.availableInstanceIds=this._availableInstanceIds.slice(),n.availableGeometryIds=this._availableGeometryIds.slice(),n.nextIndexStart=this._nextIndexStart,n.nextVertexStart=this._nextVertexStart,n.geometryCount=this._geometryCount,n.maxInstanceCount=this._maxInstanceCount,n.maxVertexCount=this._maxVertexCount,n.maxIndexCount=this._maxIndexCount,n.geometryInitialized=this._geometryInitialized,n.matricesTexture=this._matricesTexture.toJSON(t),n.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(n.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(n.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(n.boundingBox=this.boundingBox.toJSON()));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?n.background=this.background.toJSON():this.background.isTexture&&(n.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(n.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){n.geometry=r(t.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let d=l[c];r(t.shapes,d)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(n.bindMode=this.bindMode,n.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),n.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(t.materials,this.material[l]));n.material=a}else n.material=r(t.materials,this.material);if(this.children.length>0){n.children=[];for(let a=0;a<this.children.length;a++)n.children.push(this.children[a].toJSON(t).object)}if(this.animations.length>0){n.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];n.animations.push(r(t.animations,l))}}if(e){let a=o(t.geometries),l=o(t.materials),c=o(t.textures),h=o(t.images),d=o(t.shapes),u=o(t.skeletons),p=o(t.animations),g=o(t.nodes);a.length>0&&(i.geometries=a),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),h.length>0&&(i.images=h),d.length>0&&(i.shapes=d),u.length>0&&(i.skeletons=u),p.length>0&&(i.animations=p),g.length>0&&(i.nodes=g)}return i.object=n,i;function o(a){let l=[];for(let c in a){let h=a[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let i=0;i<t.children.length;i++){let n=t.children[i];this.add(n.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};Re.DEFAULT_UP=new O(0,1,0);Re.DEFAULT_MATRIX_AUTO_UPDATE=!0;Re.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Xe=class extends Re{constructor(){super(),this.isGroup=!0,this.type="Group"}},Uu={type:"move"},Qn=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Xe,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Xe,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new O,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new O),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Xe,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new O,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new O,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let i of t.hand.values())this._getHandJoint(e,i)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,i){let n=null,r=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){o=!0;for(let _ of t.hand.values()){let m=e.getJointPose(_,i),f=this._getHandJoint(c,_);m!==null&&(f.matrix.fromArray(m.transform.matrix),f.matrix.decompose(f.position,f.rotation,f.scale),f.matrixWorldNeedsUpdate=!0,f.jointRadius=m.radius),f.visible=m!==null}let h=c.joints["index-finger-tip"],d=c.joints["thumb-tip"],u=h.position.distanceTo(d.position),p=.02,g=.005;c.inputState.pinching&&u>p+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&u<=p-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,i),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:t,target:this})));a!==null&&(n=e.getPose(t.targetRaySpace,i),n===null&&r!==null&&(n=r),n!==null&&(a.matrix.fromArray(n.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,n.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(n.linearVelocity)):a.hasLinearVelocity=!1,n.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(n.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Uu)))}return a!==null&&(a.visible=n!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let i=new Xe;i.matrixAutoUpdate=!1,i.visible=!1,t.joints[e.jointName]=i,t.add(i)}return t.joints[e.jointName]}},wh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ji={h:0,s:0,l:0},nr={h:0,s:0,l:0};function Ca(s,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?s+(t-s)*6*e:e<1/2?t:e<2/3?s+(t-s)*6*(2/3-e):s}var Mt=class{constructor(t,e,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,i)}set(t,e,i){if(e===void 0&&i===void 0){let n=t;n&&n.isColor?this.copy(n):typeof n=="number"?this.setHex(n):typeof n=="string"&&this.setStyle(n)}else this.setRGB(t,e,i);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=Qe){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,qt.colorSpaceToWorking(this,e),this}setRGB(t,e,i,n=qt.workingColorSpace){return this.r=t,this.g=e,this.b=i,qt.colorSpaceToWorking(this,n),this}setHSL(t,e,i,n=qt.workingColorSpace){if(t=Eu(t,1),e=Yt(e,0,1),i=Yt(i,0,1),e===0)this.r=this.g=this.b=i;else{let r=i<=.5?i*(1+e):i+e-i*e,o=2*i-r;this.r=Ca(o,r,t+1/3),this.g=Ca(o,r,t),this.b=Ca(o,r,t-1/3)}return qt.colorSpaceToWorking(this,n),this}setStyle(t,e=Qe){function i(r){r!==void 0&&parseFloat(r)<1&&It("Color: Alpha component of "+t+" will be ignored.")}let n;if(n=/^(\w+)\(([^\)]*)\)/.exec(t)){let r,o=n[1],a=n[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:It("Color: Unknown color model "+t)}}else if(n=/^\#([A-Fa-f\d]+)$/.exec(t)){let r=n[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(o===6)return this.setHex(parseInt(r,16),e);It("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=Qe){let i=wh[t.toLowerCase()];return i!==void 0?this.setHex(i,e):It("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Vi(t.r),this.g=Vi(t.g),this.b=Vi(t.b),this}copyLinearToSRGB(t){return this.r=qn(t.r),this.g=qn(t.g),this.b=qn(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=Qe){return qt.workingToColorSpace(Fe.copy(this),t),Math.round(Yt(Fe.r*255,0,255))*65536+Math.round(Yt(Fe.g*255,0,255))*256+Math.round(Yt(Fe.b*255,0,255))}getHexString(t=Qe){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=qt.workingColorSpace){qt.workingToColorSpace(Fe.copy(this),e);let i=Fe.r,n=Fe.g,r=Fe.b,o=Math.max(i,n,r),a=Math.min(i,n,r),l,c,h=(a+o)/2;if(a===o)l=0,c=0;else{let d=o-a;switch(c=h<=.5?d/(o+a):d/(2-o-a),o){case i:l=(n-r)/d+(n<r?6:0);break;case n:l=(r-i)/d+2;break;case r:l=(i-n)/d+4;break}l/=6}return t.h=l,t.s=c,t.l=h,t}getRGB(t,e=qt.workingColorSpace){return qt.workingToColorSpace(Fe.copy(this),e),t.r=Fe.r,t.g=Fe.g,t.b=Fe.b,t}getStyle(t=Qe){qt.workingToColorSpace(Fe.copy(this),t);let e=Fe.r,i=Fe.g,n=Fe.b;return t!==Qe?`color(${t} ${e.toFixed(3)} ${i.toFixed(3)} ${n.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(i*255)},${Math.round(n*255)})`}offsetHSL(t,e,i){return this.getHSL(Ji),this.setHSL(Ji.h+t,Ji.s+e,Ji.l+i)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,i){return this.r=t.r+(e.r-t.r)*i,this.g=t.g+(e.g-t.g)*i,this.b=t.b+(e.b-t.b)*i,this}lerpHSL(t,e){this.getHSL(Ji),t.getHSL(nr);let i=Sa(Ji.h,nr.h,e),n=Sa(Ji.s,nr.s,e),r=Sa(Ji.l,nr.l,e);return this.setHSL(i,n,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,i=this.g,n=this.b,r=t.elements;return this.r=r[0]*e+r[3]*i+r[6]*n,this.g=r[1]*e+r[4]*i+r[7]*n,this.b=r[2]*e+r[5]*i+r[8]*n,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Fe=new Mt;Mt.NAMES=wh;var ws=class extends Re{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new mi,this.environmentIntensity=1,this.environmentRotation=new mi,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),e.object.backgroundBlurriness=this.backgroundBlurriness,e.object.backgroundIntensity=this.backgroundIntensity,e.object.backgroundRotation=this.backgroundRotation.toArray(),e.object.environmentIntensity=this.environmentIntensity,e.object.environmentRotation=this.environmentRotation.toArray(),e}},ui=new O,zi=new O,Ra=new O,ki=new O,Fn=new O,Bn=new O,vc=new O,Pa=new O,Ia=new O,La=new O,Da=new pe,Na=new pe,Ua=new pe,tn=class s{constructor(t=new O,e=new O,i=new O){this.a=t,this.b=e,this.c=i}static getNormal(t,e,i,n){n.subVectors(i,e),ui.subVectors(t,e),n.cross(ui);let r=n.lengthSq();return r>0?n.multiplyScalar(1/Math.sqrt(r)):n.set(0,0,0)}static getBarycoord(t,e,i,n,r){ui.subVectors(n,e),zi.subVectors(i,e),Ra.subVectors(t,e);let o=ui.dot(ui),a=ui.dot(zi),l=ui.dot(Ra),c=zi.dot(zi),h=zi.dot(Ra),d=o*c-a*a;if(d===0)return r.set(0,0,0),null;let u=1/d,p=(c*l-a*h)*u,g=(o*h-a*l)*u;return r.set(1-p-g,g,p)}static containsPoint(t,e,i,n){return this.getBarycoord(t,e,i,n,ki)===null?!1:ki.x>=0&&ki.y>=0&&ki.x+ki.y<=1}static getInterpolation(t,e,i,n,r,o,a,l){return this.getBarycoord(t,e,i,n,ki)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,ki.x),l.addScaledVector(o,ki.y),l.addScaledVector(a,ki.z),l)}static getInterpolatedAttribute(t,e,i,n,r,o){return Da.setScalar(0),Na.setScalar(0),Ua.setScalar(0),Da.fromBufferAttribute(t,e),Na.fromBufferAttribute(t,i),Ua.fromBufferAttribute(t,n),o.setScalar(0),o.addScaledVector(Da,r.x),o.addScaledVector(Na,r.y),o.addScaledVector(Ua,r.z),o}static isFrontFacing(t,e,i,n){return ui.subVectors(i,e),zi.subVectors(t,e),ui.cross(zi).dot(n)<0}set(t,e,i){return this.a.copy(t),this.b.copy(e),this.c.copy(i),this}setFromPointsAndIndices(t,e,i,n){return this.a.copy(t[e]),this.b.copy(t[i]),this.c.copy(t[n]),this}setFromAttributeAndIndices(t,e,i,n){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,i),this.c.fromBufferAttribute(t,n),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return ui.subVectors(this.c,this.b),zi.subVectors(this.a,this.b),ui.cross(zi).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return s.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return s.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,i,n,r){return s.getInterpolation(t,this.a,this.b,this.c,e,i,n,r)}containsPoint(t){return s.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return s.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let i=this.a,n=this.b,r=this.c,o,a;Fn.subVectors(n,i),Bn.subVectors(r,i),Pa.subVectors(t,i);let l=Fn.dot(Pa),c=Bn.dot(Pa);if(l<=0&&c<=0)return e.copy(i);Ia.subVectors(t,n);let h=Fn.dot(Ia),d=Bn.dot(Ia);if(h>=0&&d<=h)return e.copy(n);let u=l*d-h*c;if(u<=0&&l>=0&&h<=0)return o=l/(l-h),e.copy(i).addScaledVector(Fn,o);La.subVectors(t,r);let p=Fn.dot(La),g=Bn.dot(La);if(g>=0&&p<=g)return e.copy(r);let _=p*c-l*g;if(_<=0&&c>=0&&g<=0)return a=c/(c-g),e.copy(i).addScaledVector(Bn,a);let m=h*g-p*d;if(m<=0&&d-h>=0&&p-g>=0)return vc.subVectors(r,n),a=(d-h)/(d-h+(p-g)),e.copy(n).addScaledVector(vc,a);let f=1/(m+_+u);return o=_*f,a=u*f,e.copy(i).addScaledVector(Fn,o).addScaledVector(Bn,a)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},Ei=class{constructor(t=new O(1/0,1/0,1/0),e=new O(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e+=3)this.expandByPoint(di.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,i=t.count;e<i;e++)this.expandByPoint(di.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let i=di.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(i),this.max.copy(t).add(i),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let i=t.geometry;if(i!==void 0){let r=i.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)t.isMesh===!0?t.getVertexPosition(o,di):di.fromBufferAttribute(r,o),di.applyMatrix4(t.matrixWorld),this.expandByPoint(di);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),sr.copy(t.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),sr.copy(i.boundingBox)),sr.applyMatrix4(t.matrixWorld),this.union(sr)}let n=t.children;for(let r=0,o=n.length;r<o;r++)this.expandByObject(n[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,di),di.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,i;return t.normal.x>0?(e=t.normal.x*this.min.x,i=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,i=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,i+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,i+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,i+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,i+=t.normal.z*this.min.z),e<=-t.constant&&i>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(fs),rr.subVectors(this.max,fs),On.subVectors(t.a,fs),zn.subVectors(t.b,fs),kn.subVectors(t.c,fs),Ki.subVectors(zn,On),Qi.subVectors(kn,zn),fn.subVectors(On,kn);let e=[0,-Ki.z,Ki.y,0,-Qi.z,Qi.y,0,-fn.z,fn.y,Ki.z,0,-Ki.x,Qi.z,0,-Qi.x,fn.z,0,-fn.x,-Ki.y,Ki.x,0,-Qi.y,Qi.x,0,-fn.y,fn.x,0];return!Fa(e,On,zn,kn,rr)||(e=[1,0,0,0,1,0,0,0,1],!Fa(e,On,zn,kn,rr))?!1:(or.crossVectors(Ki,Qi),e=[or.x,or.y,or.z],Fa(e,On,zn,kn,rr))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,di).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(di).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(Hi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),Hi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),Hi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),Hi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),Hi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),Hi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),Hi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),Hi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(Hi),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}},Hi=[new O,new O,new O,new O,new O,new O,new O,new O],di=new O,sr=new Ei,On=new O,zn=new O,kn=new O,Ki=new O,Qi=new O,fn=new O,fs=new O,rr=new O,or=new O,pn=new O;function Fa(s,t,e,i,n){for(let r=0,o=s.length-3;r<=o;r+=3){pn.fromArray(s,r);let a=n.x*Math.abs(pn.x)+n.y*Math.abs(pn.y)+n.z*Math.abs(pn.z),l=t.dot(pn),c=e.dot(pn),h=i.dot(pn);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>a)return!1}return!0}var Me=new O,ar=new Gt,Fu=0,re=class extends wi{constructor(t,e,i=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Fu++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=i,this.usage=yh,this.updateRanges=[],this.gpuType=oi,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,i){t*=this.itemSize,i*=e.itemSize;for(let n=0,r=this.itemSize;n<r;n++)this.array[t+n]=e.array[i+n];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,i=this.count;e<i;e++)ar.fromBufferAttribute(this,e),ar.applyMatrix3(t),this.setXY(e,ar.x,ar.y);else if(this.itemSize===3)for(let e=0,i=this.count;e<i;e++)Me.fromBufferAttribute(this,e),Me.applyMatrix3(t),this.setXYZ(e,Me.x,Me.y,Me.z);return this}applyMatrix4(t){for(let e=0,i=this.count;e<i;e++)Me.fromBufferAttribute(this,e),Me.applyMatrix4(t),this.setXYZ(e,Me.x,Me.y,Me.z);return this}applyNormalMatrix(t){for(let e=0,i=this.count;e<i;e++)Me.fromBufferAttribute(this,e),Me.applyNormalMatrix(t),this.setXYZ(e,Me.x,Me.y,Me.z);return this}transformDirection(t){for(let e=0,i=this.count;e<i;e++)Me.fromBufferAttribute(this,e),Me.transformDirection(t),this.setXYZ(e,Me.x,Me.y,Me.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let i=this.array[t*this.itemSize+e];return this.normalized&&(i=us(i,this.array)),i}setComponent(t,e,i){return this.normalized&&(i=We(i,this.array)),this.array[t*this.itemSize+e]=i,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=us(e,this.array)),e}setX(t,e){return this.normalized&&(e=We(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=us(e,this.array)),e}setY(t,e){return this.normalized&&(e=We(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=us(e,this.array)),e}setZ(t,e){return this.normalized&&(e=We(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=us(e,this.array)),e}setW(t,e){return this.normalized&&(e=We(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,i){return t*=this.itemSize,this.normalized&&(e=We(e,this.array),i=We(i,this.array)),this.array[t+0]=e,this.array[t+1]=i,this}setXYZ(t,e,i,n){return t*=this.itemSize,this.normalized&&(e=We(e,this.array),i=We(i,this.array),n=We(n,this.array)),this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=n,this}setXYZW(t,e,i,n,r){return t*=this.itemSize,this.normalized&&(e=We(e,this.array),i=We(i,this.array),n=We(n,this.array),r=We(r,this.array)),this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=n,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return t.name=this.name,t.usage=this.usage,t.gpuType=this.gpuType,t}dispose(){this.dispatchEvent({type:"dispose"})}};var Es=class extends re{constructor(t,e,i){super(new Uint16Array(t),e,i)}};var Ts=class extends re{constructor(t,e,i){super(new Uint32Array(t),e,i)}};var he=class extends re{constructor(t,e,i){super(new Float32Array(t),e,i)}},Bu=new Ei,ps=new O,Ba=new O,Ti=class{constructor(t=new O,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let i=this.center;e!==void 0?i.copy(e):Bu.setFromPoints(t).getCenter(i);let n=0;for(let r=0,o=t.length;r<o;r++)n=Math.max(n,i.distanceToSquared(t[r]));return this.radius=Math.sqrt(n),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let i=this.center.distanceToSquared(t);return e.copy(t),i>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;ps.subVectors(t,this.center);let e=ps.lengthSq();if(e>this.radius*this.radius){let i=Math.sqrt(e),n=(i-this.radius)*.5;this.center.addScaledVector(ps,n/i),this.radius+=n}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Ba.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(ps.copy(t.center).add(Ba)),this.expandByPoint(ps.copy(t.center).sub(Ba))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}},Ou=0,ni=new Kt,Oa=new Re,Hn=new O,Ke=new Ei,ms=new Ei,Ae=new O,ge=class s extends wi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Ou++}),this.uuid=qs(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(bu(t)?Ts:Es)(t,1):this.index=t,this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,i=0){this.groups.push({start:t,count:e,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let r=new Ft().getNormalMatrix(t);i.applyNormalMatrix(r),i.needsUpdate=!0}let n=this.attributes.tangent;return n!==void 0&&(n.transformDirection(t),n.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return ni.makeRotationFromQuaternion(t),this.applyMatrix4(ni),this}rotateX(t){return ni.makeRotationX(t),this.applyMatrix4(ni),this}rotateY(t){return ni.makeRotationY(t),this.applyMatrix4(ni),this}rotateZ(t){return ni.makeRotationZ(t),this.applyMatrix4(ni),this}translate(t,e,i){return ni.makeTranslation(t,e,i),this.applyMatrix4(ni),this}scale(t,e,i){return ni.makeScale(t,e,i),this.applyMatrix4(ni),this}lookAt(t){return Oa.lookAt(t),Oa.updateMatrix(),this.applyMatrix4(Oa.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Hn).negate(),this.translate(Hn.x,Hn.y,Hn.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let i=[];for(let n=0,r=t.length;n<r;n++){let o=t[n];i.push(o.x,o.y,o.z||0)}this.setAttribute("position",new he(i,3))}else{let i=Math.min(t.length,e.count);for(let n=0;n<i;n++){let r=t[n];e.setXYZ(n,r.x,r.y,r.z||0)}t.length>e.count&&It("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Ei);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Nt("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new O(-1/0,-1/0,-1/0),new O(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let i=0,n=e.length;i<n;i++){let r=e[i];Ke.setFromBufferAttribute(r),this.morphTargetsRelative?(Ae.addVectors(this.boundingBox.min,Ke.min),this.boundingBox.expandByPoint(Ae),Ae.addVectors(this.boundingBox.max,Ke.max),this.boundingBox.expandByPoint(Ae)):(this.boundingBox.expandByPoint(Ke.min),this.boundingBox.expandByPoint(Ke.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Nt('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Ti);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Nt("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new O,1/0);return}if(t){let i=this.boundingSphere.center;if(Ke.setFromBufferAttribute(t),e)for(let r=0,o=e.length;r<o;r++){let a=e[r];ms.setFromBufferAttribute(a),this.morphTargetsRelative?(Ae.addVectors(Ke.min,ms.min),Ke.expandByPoint(Ae),Ae.addVectors(Ke.max,ms.max),Ke.expandByPoint(Ae)):(Ke.expandByPoint(ms.min),Ke.expandByPoint(ms.max))}Ke.getCenter(i);let n=0;for(let r=0,o=t.count;r<o;r++)Ae.fromBufferAttribute(t,r),n=Math.max(n,i.distanceToSquared(Ae));if(e)for(let r=0,o=e.length;r<o;r++){let a=e[r],l=this.morphTargetsRelative;for(let c=0,h=a.count;c<h;c++)Ae.fromBufferAttribute(a,c),l&&(Hn.fromBufferAttribute(t,c),Ae.add(Hn)),n=Math.max(n,i.distanceToSquared(Ae))}this.boundingSphere.radius=Math.sqrt(n),isNaN(this.boundingSphere.radius)&&Nt('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){Nt("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=e.position,n=e.normal,r=e.uv,o=this.getAttribute("tangent");(o===void 0||o.count!==i.count)&&(o=new re(new Float32Array(4*i.count),4),this.setAttribute("tangent",o));let a=[],l=[];for(let x=0;x<i.count;x++)a[x]=new O,l[x]=new O;let c=new O,h=new O,d=new O,u=new Gt,p=new Gt,g=new Gt,_=new O,m=new O;function f(x,w,A){c.fromBufferAttribute(i,x),h.fromBufferAttribute(i,w),d.fromBufferAttribute(i,A),u.fromBufferAttribute(r,x),p.fromBufferAttribute(r,w),g.fromBufferAttribute(r,A),h.sub(c),d.sub(c),p.sub(u),g.sub(u);let I=1/(p.x*g.y-g.x*p.y);isFinite(I)&&(_.copy(h).multiplyScalar(g.y).addScaledVector(d,-p.y).multiplyScalar(I),m.copy(d).multiplyScalar(p.x).addScaledVector(h,-g.x).multiplyScalar(I),a[x].add(_),a[w].add(_),a[A].add(_),l[x].add(m),l[w].add(m),l[A].add(m))}let v=this.groups;v.length===0&&(v=[{start:0,count:t.count}]);for(let x=0,w=v.length;x<w;++x){let A=v[x],I=A.start,L=A.count;for(let D=I,P=I+L;D<P;D+=3)f(t.getX(D+0),t.getX(D+1),t.getX(D+2))}let C=new O,M=new O,b=new O,S=new O;function T(x){b.fromBufferAttribute(n,x),S.copy(b);let w=a[x];C.copy(w),C.sub(b.multiplyScalar(b.dot(w))).normalize(),M.crossVectors(S,w);let I=M.dot(l[x])<0?-1:1;o.setXYZW(x,C.x,C.y,C.z,I)}for(let x=0,w=v.length;x<w;++x){let A=v[x],I=A.start,L=A.count;for(let D=I,P=I+L;D<P;D+=3)T(t.getX(D+0)),T(t.getX(D+1)),T(t.getX(D+2))}this._transformed=!0}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==e.count)i=new re(new Float32Array(e.count*3),3),this.setAttribute("normal",i);else for(let u=0,p=i.count;u<p;u++)i.setXYZ(u,0,0,0);let n=new O,r=new O,o=new O,a=new O,l=new O,c=new O,h=new O,d=new O;if(t)for(let u=0,p=t.count;u<p;u+=3){let g=t.getX(u+0),_=t.getX(u+1),m=t.getX(u+2);n.fromBufferAttribute(e,g),r.fromBufferAttribute(e,_),o.fromBufferAttribute(e,m),h.subVectors(o,r),d.subVectors(n,r),h.cross(d),a.fromBufferAttribute(i,g),l.fromBufferAttribute(i,_),c.fromBufferAttribute(i,m),a.add(h),l.add(h),c.add(h),i.setXYZ(g,a.x,a.y,a.z),i.setXYZ(_,l.x,l.y,l.z),i.setXYZ(m,c.x,c.y,c.z)}else for(let u=0,p=e.count;u<p;u+=3)n.fromBufferAttribute(e,u+0),r.fromBufferAttribute(e,u+1),o.fromBufferAttribute(e,u+2),h.subVectors(o,r),d.subVectors(n,r),h.cross(d),i.setXYZ(u+0,h.x,h.y,h.z),i.setXYZ(u+1,h.x,h.y,h.z),i.setXYZ(u+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,i=t.count;e<i;e++)Ae.fromBufferAttribute(t,e),Ae.normalize(),t.setXYZ(e,Ae.x,Ae.y,Ae.z)}toNonIndexed(){function t(a,l){let c=a.array,h=a.itemSize,d=a.normalized,u=new c.constructor(l.length*h),p=0,g=0;for(let _=0,m=l.length;_<m;_++){a.isInterleavedBufferAttribute?p=l[_]*a.data.stride+a.offset:p=l[_]*h;for(let f=0;f<h;f++)u[g++]=c[p++]}return new re(u,h,d)}if(this.index===null)return It("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new s,i=this.index.array,n=this.attributes;for(let a in n){let l=n[a],c=t(l,i);e.setAttribute(a,c)}let r=this.morphAttributes;for(let a in r){let l=[],c=r[a];for(let h=0,d=c.length;h<d;h++){let u=c[h],p=t(u,i);l.push(p)}e.morphAttributes[a]=l}e.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let i=this.attributes;for(let l in i){let c=i[l];t.data.attributes[l]=c.toJSON(t.data)}let n={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let d=0,u=c.length;d<u;d++){let p=c[d];h.push(p.toJSON(t.data))}h.length>0&&(n[l]=h,r=!0)}r&&(t.data.morphAttributes=n,t.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(t.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(t.data.boundingSphere=a.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let i=t.index;i!==null&&this.setIndex(i.clone());let n=t.attributes;for(let c in n){let h=n[c];this.setAttribute(c,h.clone(e))}let r=t.morphAttributes;for(let c in r){let h=[],d=r[c];for(let u=0,p=d.length;u<p;u++)h.push(d[u].clone(e));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;let o=t.groups;for(let c=0,h=o.length;c<h;c++){let d=o[c];this.addGroup(d.start,d.count,d.materialIndex)}let a=t.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var za=new O,zu=new O,ku=new Ft,fi=class{constructor(t=new O(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,i,n){return this.normal.set(t,e,i),this.constant=n,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,i){let n=za.subVectors(i,e).cross(zu.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(n,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e,i=!0){let n=t.delta(za),r=this.normal.dot(n);if(r===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let o=-(t.start.dot(this.normal)+this.constant)/r;return i===!0&&(o<0||o>1)?null:e.copy(t.start).addScaledVector(n,o)}intersectsLine(t){let e=this.distanceToPoint(t.start),i=this.distanceToPoint(t.end);return e<0&&i>0||i<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let i=e||ku.getNormalMatrix(t),n=this.coplanarPoint(za).applyMatrix4(t),r=this.normal.applyMatrix3(i).normalize();return this.constant=-n.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(t){return this.normal.fromArray(t.normal),this.constant=t.constant,this}},Hu=0,Ai=class extends wi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Hu++}),this.uuid=qs(),this.name="",this.type="Material",this.blending=ln,this.side=Ri,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=sl,this.blendDst=rl,this.blendEquation=Tn,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Mt(0,0,0),this.blendAlpha=0,this.depthFunc=Yn,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=dh,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Tr,this.stencilZFail=Tr,this.stencilZPass=Tr,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let i=t[e];if(i===void 0){It(`Material: parameter '${e}' has value of undefined.`);continue}let n=this[e];if(n===void 0){It(`Material: '${e}' is not a property of THREE.${this.type}.`);continue}n&&n.isColor?n.set(i):n&&n.isVector2&&i&&i.isVector2||n&&n.isEuler&&i&&i.isEuler||n&&n.isVector3&&i&&i.isVector3?n.copy(i):this[e]=i}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,i.blending=this.blending,i.side=this.side,i.shadowSide=this.shadowSide,i.vertexColors=this.vertexColors,i.opacity=this.opacity,i.transparent=this.transparent,i.blendSrc=this.blendSrc,i.blendDst=this.blendDst,i.blendEquation=this.blendEquation,i.blendSrcAlpha=this.blendSrcAlpha,i.blendDstAlpha=this.blendDstAlpha,i.blendEquationAlpha=this.blendEquationAlpha,i.blendColor=this.blendColor.getHex(),i.blendAlpha=this.blendAlpha,i.depthFunc=this.depthFunc,i.depthTest=this.depthTest,i.depthWrite=this.depthWrite,i.colorWrite=this.colorWrite,i.clipIntersection=this.clipIntersection,i.clipShadows=this.clipShadows,i.stencilWriteMask=this.stencilWriteMask,i.stencilFunc=this.stencilFunc,i.stencilRef=this.stencilRef,i.stencilFuncMask=this.stencilFuncMask,i.stencilFail=this.stencilFail,i.stencilZFail=this.stencilZFail,i.stencilZPass=this.stencilZPass,i.stencilWrite=this.stencilWrite,i.polygonOffset=this.polygonOffset,i.polygonOffsetFactor=this.polygonOffsetFactor,i.polygonOffsetUnits=this.polygonOffsetUnits,i.dithering=this.dithering,i.alphaTest=this.alphaTest,i.alphaHash=this.alphaHash,i.alphaToCoverage=this.alphaToCoverage,i.premultipliedAlpha=this.premultipliedAlpha,i.forceSinglePass=this.forceSinglePass,i.allowOverride=this.allowOverride,i.visible=this.visible,i.toneMapped=this.toneMapped,i.name=this.name,this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(i.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(t).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(t).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(t).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(t).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(t).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(i.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(i.rotation=this.rotation),this.depthPacking!==void 0&&(i.depthPacking=this.depthPacking),this.linewidth!==void 0&&(i.linewidth=this.linewidth),this.linecap!==void 0&&(i.linecap=this.linecap),this.linejoin!==void 0&&(i.linejoin=this.linejoin),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.wireframe!==void 0&&(i.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(i.flatShading=this.flatShading),this.fog!==void 0&&(i.fog=this.fog),Object.keys(this.userData).length>0&&(i.userData=this.userData);function n(r){let o=[];for(let a in r){let l=r[a];delete l.metadata,o.push(l)}return o}if(e){let r=n(t.textures),o=n(t.images);r.length>0&&(i.textures=r),o.length>0&&(i.images=o)}return i}fromJSON(t,e){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new Mt().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.retroreflectivity!==void 0&&(this.retroreflectivity=t.retroreflectivity),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=t.iridescenceThicknessRange),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.clippingPlanes!==void 0&&(this.clippingPlanes=t.clippingPlanes.map(i=>new fi().fromJSON(i))),t.clipIntersection!==void 0&&(this.clipIntersection=t.clipIntersection),t.clipShadows!==void 0&&(this.clipShadows=t.clipShadows),t.depthPacking!==void 0&&(this.depthPacking=t.depthPacking),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.linecap!==void 0&&(this.linecap=t.linecap),t.linejoin!==void 0&&(this.linejoin=t.linejoin),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=e[t.map]||null),t.matcap!==void 0&&(this.matcap=e[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=e[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=e[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=e[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let i=t.normalScale;Array.isArray(i)===!1&&(i=[i,i]),this.normalScale=new Gt().fromArray(i)}return t.displacementMap!==void 0&&(this.displacementMap=e[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=e[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=e[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=e[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=e[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=e[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=e[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=e[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=e[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=e[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=e[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=e[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=e[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=e[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Gt().fromArray(t.clearcoatNormalScale)),t.iridescenceMap!==void 0&&(this.iridescenceMap=e[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=e[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=e[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=e[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=e[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=e[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=e[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,i=null;if(e!==null){let n=e.length;i=new Array(n);for(let r=0;r!==n;++r)i[r]=e[r].clone()}return this.clippingPlanes=i,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}};var Gi=new O,ka=new O,lr=new O,cr=new O,yn=class{constructor(t=new O,e=new O(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Gi)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let i=e.dot(this.direction);return i<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=Gi.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(Gi.copy(this.origin).addScaledVector(this.direction,e),Gi.distanceToSquared(t))}distanceSqToSegment(t,e,i,n){ka.copy(t).add(e).multiplyScalar(.5),lr.copy(e).sub(t).normalize(),cr.copy(this.origin).sub(ka);let r=t.distanceTo(e)*.5,o=-this.direction.dot(lr),a=cr.dot(this.direction),l=-cr.dot(lr),c=cr.lengthSq(),h=Math.abs(1-o*o),d,u,p,g;if(h>0)if(d=o*l-a,u=o*a-l,g=r*h,d>=0)if(u>=-g)if(u<=g){let _=1/h;d*=_,u*=_,p=d*(d+o*u+2*a)+u*(o*d+u+2*l)+c}else u=r,d=Math.max(0,-(o*u+a)),p=-d*d+u*(u+2*l)+c;else u=-r,d=Math.max(0,-(o*u+a)),p=-d*d+u*(u+2*l)+c;else u<=-g?(d=Math.max(0,-(-o*r+a)),u=d>0?-r:Math.min(Math.max(-r,-l),r),p=-d*d+u*(u+2*l)+c):u<=g?(d=0,u=Math.min(Math.max(-r,-l),r),p=u*(u+2*l)+c):(d=Math.max(0,-(o*r+a)),u=d>0?r:Math.min(Math.max(-r,-l),r),p=-d*d+u*(u+2*l)+c);else u=o>0?-r:r,d=Math.max(0,-(o*u+a)),p=-d*d+u*(u+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,d),n&&n.copy(ka).addScaledVector(lr,u),p}intersectSphere(t,e){if(t.radius<0)return null;Gi.subVectors(t.center,this.origin);let i=Gi.dot(this.direction),n=Gi.dot(Gi)-i*i,r=t.radius*t.radius;if(n>r)return null;let o=Math.sqrt(r-n),a=i-o,l=i+o;return l<0?null:a<0?this.at(l,e):this.at(a,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(t.normal)+t.constant)/e;return i>=0?i:null}intersectPlane(t,e){let i=this.distanceToPlane(t);return i===null?null:this.at(i,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let i,n,r,o,a,l,c=1/this.direction.x,h=1/this.direction.y,d=1/this.direction.z,u=this.origin;return c>=0?(i=(t.min.x-u.x)*c,n=(t.max.x-u.x)*c):(i=(t.max.x-u.x)*c,n=(t.min.x-u.x)*c),h>=0?(r=(t.min.y-u.y)*h,o=(t.max.y-u.y)*h):(r=(t.max.y-u.y)*h,o=(t.min.y-u.y)*h),i>o||r>n||((r>i||isNaN(i))&&(i=r),(o<n||isNaN(n))&&(n=o),d>=0?(a=(t.min.z-u.z)*d,l=(t.max.z-u.z)*d):(a=(t.max.z-u.z)*d,l=(t.min.z-u.z)*d),i>l||a>n)||((a>i||i!==i)&&(i=a),(l<n||n!==n)&&(n=l),n<0)?null:this.at(i>=0?i:n,e)}intersectsBox(t){return this.intersectBox(t,Gi)!==null}intersectTriangle(t,e,i,n,r){let o=this.origin,a=this.direction,l=a.x,c=a.y,h=a.z,d=t.x-o.x,u=t.y-o.y,p=t.z-o.z,g=e.x-o.x,_=e.y-o.y,m=e.z-o.z,f=i.x-o.x,v=i.y-o.y,C=i.z-o.z,M=Math.abs(l),b=Math.abs(c),S=Math.abs(h),T,x,w,A,I,L,D,P,N,G,k,q;if(M>=b&&M>=S?(w=l,L=d,N=g,q=f,l>=0?(T=c,x=h,A=u,I=p,D=_,P=m,G=v,k=C):(T=h,x=c,A=p,I=u,D=m,P=_,G=C,k=v)):b>=S?(w=c,L=u,N=_,q=v,c>=0?(T=h,x=l,A=p,I=d,D=m,P=g,G=C,k=f):(T=l,x=h,A=d,I=p,D=g,P=m,G=f,k=C)):(w=h,L=p,N=m,q=C,h>=0?(T=l,x=c,A=d,I=u,D=g,P=_,G=f,k=v):(T=c,x=l,A=u,I=d,D=_,P=g,G=v,k=f)),w===0)return null;let H=T/w,Z=x/w,J=1/w,rt=A-H*L,ot=I-Z*L,Bt=D-H*N,Dt=P-Z*N,Ut=G-H*q,$=k-Z*q,j=Ut*Dt-$*Bt,xt=rt*$-ot*Ut,Rt=Bt*ot-Dt*rt;if(n){if(j<0||xt<0||Rt<0)return null}else if((j<0||xt<0||Rt<0)&&(j>0||xt>0||Rt>0))return null;let dt=j+xt+Rt;if(dt===0)return null;let Ot=J*(j*L+xt*N+Rt*q);return(dt>0?Ot<0:Ot>0)?null:this.at(Ot/dt,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},ri=class extends Ai{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Mt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new mi,this.combine=co,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}},Mc=new Kt,mn=new yn,hr=new Ti,Sc=new O,ur=new O,dr=new O,fr=new O,Ha=new O,pr=new O,bc=new O,mr=new O,$t=class extends Re{constructor(t=new ge,e=new ri){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){let n=e[i[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=n.length;r<o;r++){let a=n[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(t,e){let i=this.geometry,n=i.attributes.position,r=i.morphAttributes.position,o=i.morphTargetsRelative;e.fromBufferAttribute(n,t);let a=this.morphTargetInfluences;if(r&&a){pr.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let h=a[l],d=r[l];h!==0&&(Ha.fromBufferAttribute(d,t),o?pr.addScaledVector(Ha,h):pr.addScaledVector(Ha.sub(e),h))}e.add(pr)}return e}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let i=this.geometry,n=this.material,r=this.matrixWorld;n!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),hr.copy(i.boundingSphere),hr.applyMatrix4(r),mn.copy(t.ray).recast(t.near),!(hr.containsPoint(mn.origin)===!1&&(mn.intersectSphere(hr,Sc)===null||mn.origin.distanceToSquared(Sc)>(t.far-t.near)**2))&&(Mc.copy(r).invert(),mn.copy(t.ray).applyMatrix4(Mc),!(i.boundingBox!==null&&mn.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(t,e,mn)))}_computeIntersections(t,e,i){let n,r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,d=r.attributes.normal,u=r.groups,p=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,_=u.length;g<_;g++){let m=u[g],f=o[m.materialIndex],v=Math.max(m.start,p.start),C=Math.min(a.count,Math.min(m.start+m.count,p.start+p.count));for(let M=v,b=C;M<b;M+=3){let S=a.getX(M),T=a.getX(M+1),x=a.getX(M+2);n=gr(this,f,t,i,c,h,d,S,T,x),n&&(n.faceIndex=Math.floor(M/3),n.face.materialIndex=m.materialIndex,e.push(n))}}else{let g=Math.max(0,p.start),_=Math.min(a.count,p.start+p.count);for(let m=g,f=_;m<f;m+=3){let v=a.getX(m),C=a.getX(m+1),M=a.getX(m+2);n=gr(this,o,t,i,c,h,d,v,C,M),n&&(n.faceIndex=Math.floor(m/3),e.push(n))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,_=u.length;g<_;g++){let m=u[g],f=o[m.materialIndex],v=Math.max(m.start,p.start),C=Math.min(l.count,Math.min(m.start+m.count,p.start+p.count));for(let M=v,b=C;M<b;M+=3){let S=M,T=M+1,x=M+2;n=gr(this,f,t,i,c,h,d,S,T,x),n&&(n.faceIndex=Math.floor(M/3),n.face.materialIndex=m.materialIndex,e.push(n))}}else{let g=Math.max(0,p.start),_=Math.min(l.count,p.start+p.count);for(let m=g,f=_;m<f;m+=3){let v=m,C=m+1,M=m+2;n=gr(this,o,t,i,c,h,d,v,C,M),n&&(n.faceIndex=Math.floor(m/3),e.push(n))}}}};function Gu(s,t,e,i,n,r,o,a){let l;if(t.side===He?l=i.intersectTriangle(o,r,n,!0,a):l=i.intersectTriangle(n,r,o,t.side===Ri,a),l===null)return null;mr.copy(a),mr.applyMatrix4(s.matrixWorld);let c=e.ray.origin.distanceTo(mr);return c<e.near||c>e.far?null:{distance:c,point:mr.clone(),object:s}}function gr(s,t,e,i,n,r,o,a,l,c){s.getVertexPosition(a,ur),s.getVertexPosition(l,dr),s.getVertexPosition(c,fr);let h=Gu(s,t,e,i,ur,dr,fr,bc);if(h){let d=new O;tn.getBarycoord(bc,ur,dr,fr,d),n&&(h.uv=tn.getInterpolatedAttribute(n,a,l,c,d,new Gt)),r&&(h.uv1=tn.getInterpolatedAttribute(r,a,l,c,d,new Gt)),o&&(h.normal=tn.getInterpolatedAttribute(o,a,l,c,d,new O),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));let u={a,b:l,c,normal:new O,materialIndex:0};tn.getNormal(ur,dr,fr,u.normal),h.face=u,h.barycoord=d}return h}var vn=class extends qe{constructor(t=null,e=1,i=1,n,r,o,a,l,c=Ce,h=Ce,d,u){super(null,o,a,l,c,h,n,r,d,u),this.isDataTexture=!0,this.image={data:t,width:e,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Mn=class extends re{constructor(t,e,i,n=1){super(t,e,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=n}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){let t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}},Gn=new Kt,wc=new Kt,xr=[],Ec=new Ei,Vu=new Kt,gs=new $t,xs=new Ti,Ci=class extends $t{constructor(t,e,i){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new Mn(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let n=0;n<i;n++)this.setMatrixAt(n,Vu)}computeBoundingBox(){let t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new Ei),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<e;i++)this.getMatrixAt(i,Gn),Ec.copy(t.boundingBox).applyMatrix4(Gn),this.boundingBox.union(Ec)}computeBoundingSphere(){let t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new Ti),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<e;i++)this.getMatrixAt(i,Gn),xs.copy(t.boundingSphere).applyMatrix4(Gn),this.boundingSphere.union(xs)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){return this.instanceColor===null?e.setRGB(1,1,1):e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){return e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){let i=e.morphTargetInfluences,n=this.morphTexture.source.data.data,r=i.length+1,o=t*r+1;for(let a=0;a<i.length;a++)i[a]=n[o+a]}raycast(t,e){let i=this.matrixWorld,n=this.count;if(gs.geometry=this.geometry,gs.material=this.material,gs.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),xs.copy(this.boundingSphere),xs.applyMatrix4(i),t.ray.intersectsSphere(xs)!==!1))for(let r=0;r<n;r++){this.getMatrixAt(r,Gn),wc.multiplyMatrices(i,Gn),gs.matrixWorld=wc,gs.raycast(t,xr);for(let o=0,a=xr.length;o<a;o++){let l=xr[o];l.instanceId=r,l.object=this,e.push(l)}xr.length=0}}setColorAt(t,e){return this.instanceColor===null&&(this.instanceColor=new Mn(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3),this}setMatrixAt(t,e){return e.toArray(this.instanceMatrix.array,t*16),this}setMorphAt(t,e){let i=e.morphTargetInfluences,n=i.length+1;this.morphTexture===null&&(this.morphTexture=new vn(new Float32Array(n*this.count),n,this.count,xo,oi));let r=this.morphTexture.source.data.data,o=0;for(let c=0;c<i.length;c++)o+=i[c];let a=this.geometry.morphTargetsRelative?1:1-o,l=n*t;return r[l]=a,r.set(i,l+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},gn=new Ti,Wu=new Gt(.5,.5),_r=new O,jn=class{constructor(t=new fi,e=new fi,i=new fi,n=new fi,r=new fi,o=new fi){this.planes=[t,e,i,n,r,o]}set(t,e,i,n,r,o){let a=this.planes;return a[0].copy(t),a[1].copy(e),a[2].copy(i),a[3].copy(n),a[4].copy(r),a[5].copy(o),this}copy(t){let e=this.planes;for(let i=0;i<6;i++)e[i].copy(t.planes[i]);return this}setFromProjectionMatrix(t,e=pi,i=!1){let n=this.planes,r=t.elements,o=r[0],a=r[1],l=r[2],c=r[3],h=r[4],d=r[5],u=r[6],p=r[7],g=r[8],_=r[9],m=r[10],f=r[11],v=r[12],C=r[13],M=r[14],b=r[15];if(n[0].setComponents(c-o,p-h,f-g,b-v).normalize(),n[1].setComponents(c+o,p+h,f+g,b+v).normalize(),n[2].setComponents(c+a,p+d,f+_,b+C).normalize(),n[3].setComponents(c-a,p-d,f-_,b-C).normalize(),i)n[4].setComponents(l,u,m,M).normalize(),n[5].setComponents(c-l,p-u,f-m,b-M).normalize();else if(n[4].setComponents(c-l,p-u,f-m,b-M).normalize(),e===pi)n[5].setComponents(c+l,p+u,f+m,b+M).normalize();else if(e===Zn)n[5].setComponents(l,u,m,M).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),gn.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),gn.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(gn)}intersectsSprite(t){gn.center.set(0,0,0);let e=Wu.distanceTo(t.center);return gn.radius=.7071067811865476+e,gn.applyMatrix4(t.matrixWorld),this.intersectsSphere(gn)}intersectsSphere(t){let e=this.planes,i=t.center,n=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(i)<n)return!1;return!0}intersectsBox(t){let e=this.planes;for(let i=0;i<6;i++){let n=e[i];if(_r.x=n.normal.x>0?t.max.x:t.min.x,_r.y=n.normal.y>0?t.max.y:t.min.y,_r.z=n.normal.z>0?t.max.z:t.min.z,n.distanceToPoint(_r)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let i=0;i<6;i++)if(e[i].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var en=class extends Ai{constructor(t){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Mt(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}},kr=new O,Hr=new O,Tc=new Kt,_s=new yn,yr=new Ti,Ga=new O,Ac=new O,Gr=class extends Re{constructor(t=new ge,e=new en){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){let t=this.geometry;if(t.index===null){let e=t.attributes.position,i=[0];for(let n=1,r=e.count;n<r;n++)kr.fromBufferAttribute(e,n-1),Hr.fromBufferAttribute(e,n),i[n]=i[n-1],i[n]+=kr.distanceTo(Hr);t.setAttribute("lineDistance",new he(i,1))}else It("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let i=this.geometry,n=this.matrixWorld,r=t.params.Line.threshold,o=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),yr.copy(i.boundingSphere),yr.applyMatrix4(n),yr.radius+=r,t.ray.intersectsSphere(yr)===!1)return;Tc.copy(n).invert(),_s.copy(t.ray).applyMatrix4(Tc);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=this.isLineSegments?2:1,h=i.index,u=i.attributes.position;if(h!==null){let p=Math.max(0,o.start),g=Math.min(h.count,o.start+o.count);for(let _=p,m=g-1;_<m;_+=c){let f=h.getX(_),v=h.getX(_+1),C=vr(this,t,_s,l,f,v,_);C&&e.push(C)}if(this.isLineLoop){let _=h.getX(g-1),m=h.getX(p),f=vr(this,t,_s,l,_,m,g-1);f&&e.push(f)}}else{let p=Math.max(0,o.start),g=Math.min(u.count,o.start+o.count);for(let _=p,m=g-1;_<m;_+=c){let f=vr(this,t,_s,l,_,_+1,_);f&&e.push(f)}if(this.isLineLoop){let _=vr(this,t,_s,l,g-1,p,g-1);_&&e.push(_)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){let n=e[i[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=n.length;r<o;r++){let a=n[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}};function vr(s,t,e,i,n,r,o){let a=s.geometry.attributes.position;if(kr.fromBufferAttribute(a,n),Hr.fromBufferAttribute(a,r),e.distanceSqToSegment(kr,Hr,Ga,Ac)>i)return;Ga.applyMatrix4(s.matrixWorld);let c=t.ray.origin.distanceTo(Ga);if(!(c<t.near||c>t.far))return{distance:c,point:Ac.clone().applyMatrix4(s.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:s}}var Cc=new O,Rc=new O,Sn=class extends Gr{constructor(t,e){super(t,e),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let t=this.geometry;if(t.index===null){let e=t.attributes.position,i=[];for(let n=0,r=e.count;n<r;n+=2)Cc.fromBufferAttribute(e,n),Rc.fromBufferAttribute(e,n+1),i[n]=n===0?0:i[n-1],i[n+1]=i[n]+Cc.distanceTo(Rc);t.setAttribute("lineDistance",new he(i,1))}else It("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}};var Vr=class extends Ai{constructor(t){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Mt(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}},Pc=new Kt,$a=new yn,Mr=new Ti,Sr=new O,As=class extends Re{constructor(t=new ge,e=new Vr){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let i=this.geometry,n=this.matrixWorld,r=t.params.Points.threshold,o=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Mr.copy(i.boundingSphere),Mr.applyMatrix4(n),Mr.radius+=r,t.ray.intersectsSphere(Mr)===!1)return;Pc.copy(n).invert(),$a.copy(t.ray).applyMatrix4(Pc);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=i.index,d=i.attributes.position;if(c!==null){let u=Math.max(0,o.start),p=Math.min(c.count,o.start+o.count);for(let g=u,_=p;g<_;g++){let m=c.getX(g);Sr.fromBufferAttribute(d,m),Ic(Sr,m,l,n,t,e,this)}}else{let u=Math.max(0,o.start),p=Math.min(d.count,o.start+o.count);for(let g=u,_=p;g<_;g++)Sr.fromBufferAttribute(d,g),Ic(Sr,g,l,n,t,e,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){let n=e[i[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=n.length;r<o;r++){let a=n[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}};function Ic(s,t,e,i,n,r,o){let a=$a.distanceSqToPoint(s);if(a<e){let l=new O;$a.closestPointToPoint(s,l),l.applyMatrix4(i);let c=n.ray.origin.distanceTo(l);if(c<n.near||c>n.far)return;r.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:t,face:null,faceIndex:null,barycoord:null,object:o})}}var Cs=class extends qe{constructor(t=[],e=cn,i,n,r,o,a,l,c,h){super(t,e,i,n,r,o,a,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}};var nn=class extends qe{constructor(t,e,i=xi,n,r,o,a=Ce,l=Ce,c,h=bi,d=1){if(h!==bi&&h!==hn)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let u={width:t,height:e,depth:d};super(u,n,r,o,a,l,h,i,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new Jn(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return e.compareFunction=this.compareFunction,e}},Wr=class extends nn{constructor(t,e=xi,i=cn,n,r,o=Ce,a=Ce,l,c=bi){let h={width:t,height:t,depth:1},d=[h,h,h,h,h,h];super(t,t,e,i,n,r,o,a,l,c),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}},Rs=class extends qe{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}},Pe=class s extends ge{constructor(t=1,e=1,i=1,n=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:i,widthSegments:n,heightSegments:r,depthSegments:o};let a=this;n=Math.floor(n),r=Math.floor(r),o=Math.floor(o);let l=[],c=[],h=[],d=[],u=0,p=0;g("z","y","x",-1,-1,i,e,t,o,r,0),g("z","y","x",1,-1,i,e,-t,o,r,1),g("x","z","y",1,1,t,i,e,n,o,2),g("x","z","y",1,-1,t,i,-e,n,o,3),g("x","y","z",1,-1,t,e,i,n,r,4),g("x","y","z",-1,-1,t,e,-i,n,r,5),this.setIndex(l),this.setAttribute("position",new he(c,3)),this.setAttribute("normal",new he(h,3)),this.setAttribute("uv",new he(d,2));function g(_,m,f,v,C,M,b,S,T,x,w){let A=M/T,I=b/x,L=M/2,D=b/2,P=S/2,N=T+1,G=x+1,k=0,q=0,H=new O;for(let Z=0;Z<G;Z++){let J=Z*I-D;for(let rt=0;rt<N;rt++){let ot=rt*A-L;H[_]=ot*v,H[m]=J*C,H[f]=P,c.push(H.x,H.y,H.z),H[_]=0,H[m]=0,H[f]=S>0?1:-1,h.push(H.x,H.y,H.z),d.push(rt/T),d.push(1-Z/x),k+=1}}for(let Z=0;Z<x;Z++)for(let J=0;J<T;J++){let rt=u+J+N*Z,ot=u+J+N*(Z+1),Bt=u+(J+1)+N*(Z+1),Dt=u+(J+1)+N*Z;l.push(rt,ot,Dt),l.push(ot,Bt,Dt),q+=6}a.addGroup(p,q,w),p+=q,u+=k}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};var sn=class s extends ge{constructor(t=1,e=1,i=1,n=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:i,radialSegments:n,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};let c=this;n=Math.floor(n),r=Math.floor(r);let h=[],d=[],u=[],p=[],g=0,_=[],m=i/2,f=0;v(),o===!1&&(t>0&&C(!0),e>0&&C(!1)),this.setIndex(h),this.setAttribute("position",new he(d,3)),this.setAttribute("normal",new he(u,3)),this.setAttribute("uv",new he(p,2));function v(){let M=new O,b=new O,S=0,T=(e-t)/i;for(let x=0;x<=r;x++){let w=[],A=x/r,I=A*(e-t)+t;for(let L=0;L<=n;L++){let D=L/n,P=D*l+a,N=Math.sin(P),G=Math.cos(P);b.x=I*N,b.y=-A*i+m,b.z=I*G,d.push(b.x,b.y,b.z),M.set(N,T,G).normalize(),u.push(M.x,M.y,M.z),p.push(D,1-A),w.push(g++)}_.push(w)}for(let x=0;x<n;x++)for(let w=0;w<r;w++){let A=_[w][x],I=_[w+1][x],L=_[w+1][x+1],D=_[w][x+1];(t>0||w!==0)&&(h.push(A,I,D),S+=3),(e>0||w!==r-1)&&(h.push(I,L,D),S+=3)}c.addGroup(f,S,0),f+=S}function C(M){let b=g,S=new Gt,T=new O,x=0,w=M===!0?t:e,A=M===!0?1:-1;for(let L=1;L<=n;L++)d.push(0,m*A,0),u.push(0,A,0),p.push(.5,.5),g++;let I=g;for(let L=0;L<=n;L++){let P=L/n*l+a,N=Math.cos(P),G=Math.sin(P);T.x=w*G,T.y=m*A,T.z=w*N,d.push(T.x,T.y,T.z),u.push(0,A,0),S.x=N*.5+.5,S.y=G*.5*A+.5,p.push(S.x,S.y),g++}for(let L=0;L<n;L++){let D=b+L,P=I+L;M===!0?h.push(P,P+1,D):h.push(P+1,P,D),x+=3}c.addGroup(f,x,M===!0?1:2),f+=x}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},bn=class s extends sn{constructor(t=1,e=1,i=32,n=1,r=!1,o=0,a=Math.PI*2){super(0,t,e,i,n,r,o,a),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:i,heightSegments:n,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(t){return new s(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Xr=class s extends ge{constructor(t=[],e=[],i=1,n=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:i,detail:n};let r=[],o=[];a(n),c(i),h(),this.setAttribute("position",new he(r,3)),this.setAttribute("normal",new he(r.slice(),3)),this.setAttribute("uv",new he(o,2)),n===0?this.computeVertexNormals():this.normalizeNormals();function a(v){let C=new O,M=new O,b=new O;for(let S=0;S<e.length;S+=3)p(e[S+0],C),p(e[S+1],M),p(e[S+2],b),l(C,M,b,v)}function l(v,C,M,b){let S=b+1,T=[];for(let x=0;x<=S;x++){T[x]=[];let w=v.clone().lerp(M,x/S),A=C.clone().lerp(M,x/S),I=S-x;for(let L=0;L<=I;L++)L===0&&x===S?T[x][L]=w:T[x][L]=w.clone().lerp(A,L/I)}for(let x=0;x<S;x++)for(let w=0;w<2*(S-x)-1;w++){let A=Math.floor(w/2);w%2===0?(u(T[x][A+1]),u(T[x+1][A]),u(T[x][A])):(u(T[x][A+1]),u(T[x+1][A+1]),u(T[x+1][A]))}}function c(v){let C=new O;for(let M=0;M<r.length;M+=3)C.x=r[M+0],C.y=r[M+1],C.z=r[M+2],C.normalize().multiplyScalar(v),r[M+0]=C.x,r[M+1]=C.y,r[M+2]=C.z}function h(){let v=new O;for(let C=0;C<r.length;C+=3){v.x=r[C+0],v.y=r[C+1],v.z=r[C+2];let M=m(v)/2/Math.PI+.5,b=f(v)/Math.PI+.5;o.push(M,1-b)}g(),d()}function d(){for(let v=0;v<o.length;v+=6){let C=o[v+0],M=o[v+2],b=o[v+4],S=Math.max(C,M,b),T=Math.min(C,M,b);S>.9&&T<.1&&(C<.2&&(o[v+0]+=1),M<.2&&(o[v+2]+=1),b<.2&&(o[v+4]+=1))}}function u(v){r.push(v.x,v.y,v.z)}function p(v,C){let M=v*3;C.x=t[M+0],C.y=t[M+1],C.z=t[M+2]}function g(){let v=new O,C=new O,M=new O,b=new O,S=new Gt,T=new Gt,x=new Gt;for(let w=0,A=0;w<r.length;w+=9,A+=6){v.set(r[w+0],r[w+1],r[w+2]),C.set(r[w+3],r[w+4],r[w+5]),M.set(r[w+6],r[w+7],r[w+8]),S.set(o[A+0],o[A+1]),T.set(o[A+2],o[A+3]),x.set(o[A+4],o[A+5]),b.copy(v).add(C).add(M).divideScalar(3);let I=m(b);_(S,A+0,v,I),_(T,A+2,C,I),_(x,A+4,M,I)}}function _(v,C,M,b){b<0&&v.x===1&&(o[C]=v.x-1),M.x===0&&M.z===0&&(o[C]=b/2/Math.PI+.5)}function m(v){return Math.atan2(v.z,-v.x)}function f(v){return Math.atan2(-v.y,Math.sqrt(v.x*v.x+v.z*v.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.vertices,t.indices,t.radius,t.detail)}},Ps=class s extends Xr{constructor(t=1,e=0){let i=(1+Math.sqrt(5))/2,n=1/i,r=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-n,-i,0,-n,i,0,n,-i,0,n,i,-n,-i,0,-n,i,0,n,-i,0,n,i,0,-i,0,-n,i,0,-n,-i,0,n,i,0,n],o=[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9];super(r,o,t,e),this.type="DodecahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new s(t.radius,t.detail)}};var Is=class s extends ge{constructor(t=1,e=1,i=1,n=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:i,heightSegments:n};let r=t/2,o=e/2,a=Math.floor(i),l=Math.floor(n),c=a+1,h=l+1,d=t/a,u=e/l,p=[],g=[],_=[],m=[];for(let f=0;f<h;f++){let v=f*u-o;for(let C=0;C<c;C++){let M=C*d-r;g.push(M,-v,0),_.push(0,0,1),m.push(C/a),m.push(1-f/l)}}for(let f=0;f<l;f++)for(let v=0;v<a;v++){let C=v+c*f,M=v+c*(f+1),b=v+1+c*(f+1),S=v+1+c*f;p.push(C,M,S),p.push(M,b,S)}this.setIndex(p),this.setAttribute("position",new he(g,3)),this.setAttribute("normal",new he(_,3)),this.setAttribute("uv",new he(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.width,t.height,t.widthSegments,t.heightSegments)}},wn=class s extends ge{constructor(t=.5,e=1,i=32,n=1,r=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:t,outerRadius:e,thetaSegments:i,phiSegments:n,thetaStart:r,thetaLength:o},i=Math.max(3,i),n=Math.max(1,n);let a=[],l=[],c=[],h=[],d=t,u=(e-t)/n,p=new O,g=new Gt;for(let _=0;_<=n;_++){for(let m=0;m<=i;m++){let f=r+m/i*o;p.x=d*Math.cos(f),p.y=d*Math.sin(f),l.push(p.x,p.y,p.z),c.push(0,0,1),g.x=(p.x/e+1)/2,g.y=(p.y/e+1)/2,h.push(g.x,g.y)}d+=u}for(let _=0;_<n;_++){let m=_*(i+1);for(let f=0;f<i;f++){let v=f+m,C=v,M=v+i+1,b=v+i+2,S=v+1;a.push(C,M,S),a.push(M,b,S)}}this.setIndex(a),this.setAttribute("position",new he(l,3)),this.setAttribute("normal",new he(c,3)),this.setAttribute("uv",new he(h,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}};var ts=class s extends ge{constructor(t=1,e=32,i=16,n=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:i,phiStart:n,phiLength:r,thetaStart:o,thetaLength:a},e=Math.max(3,Math.floor(e)),i=Math.max(2,Math.floor(i));let l=Math.min(o+a,Math.PI),c=0,h=[],d=new O,u=new O,p=[],g=[],_=[],m=[];for(let f=0;f<=i;f++){let v=[],C=f/i,M=o+C*a,b=t*Math.cos(M),S=Math.sqrt(t*t-b*b),T=0;f===0&&o===0?T=.5/e:f===i&&l===Math.PI&&(T=-.5/e);for(let x=0;x<=e;x++){let w=x/e,A=n+w*r;d.x=-S*Math.cos(A),d.y=b,d.z=S*Math.sin(A),g.push(d.x,d.y,d.z),u.copy(d).normalize(),_.push(u.x,u.y,u.z),m.push(w+T,1-C),v.push(c++)}h.push(v)}for(let f=0;f<i;f++)for(let v=0;v<e;v++){let C=h[f][v+1],M=h[f][v],b=h[f+1][v],S=h[f+1][v+1];(f!==0||o>0)&&p.push(C,M,S),(f!==i-1||l<Math.PI)&&p.push(M,b,S)}this.setIndex(p),this.setAttribute("position",new he(g,3)),this.setAttribute("normal",new he(_,3)),this.setAttribute("uv",new he(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};function Cn(s){let t={};for(let e in s){t[e]={};for(let i in s[e]){let n=s[e][i];if(Lc(n))n.isRenderTargetTexture?(It("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][i]=null):t[e][i]=n.clone();else if(Array.isArray(n))if(Lc(n[0])){let r=[];for(let o=0,a=n.length;o<a;o++)r[o]=n[o].clone();t[e][i]=r}else t[e][i]=n.slice();else t[e][i]=n}}return t}function Oe(s){let t={};for(let e=0;e<s.length;e++){let i=Cn(s[e]);for(let n in i)t[n]=i[n]}return t}function Lc(s){return s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)}function Xu(s){let t=[];for(let e=0;e<s.length;e++)t.push(s[e].clone());return t}function Sl(s){let t=s.getRenderTarget();return t===null?s.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:qt.workingColorSpace}var Eh={clone:Cn,merge:Oe},qu=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Yu=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,be=class extends Ai{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=qu,this.fragmentShader=Yu,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Cn(t.uniforms),this.uniformsGroups=Xu(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let n in this.uniforms){let o=this.uniforms[n].value;o&&o.isTexture?e.uniforms[n]={type:"t",value:o.toJSON(t).uuid}:o&&o.isColor?e.uniforms[n]={type:"c",value:o.getHex()}:o&&o.isVector2?e.uniforms[n]={type:"v2",value:o.toArray()}:o&&o.isVector3?e.uniforms[n]={type:"v3",value:o.toArray()}:o&&o.isVector4?e.uniforms[n]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?e.uniforms[n]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?e.uniforms[n]={type:"m4",value:o.toArray()}:e.uniforms[n]={value:o}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let i={};for(let n in this.extensions)this.extensions[n]===!0&&(i[n]=!0);return Object.keys(i).length>0&&(e.extensions=i),e}fromJSON(t,e){if(super.fromJSON(t,e),t.uniforms!==void 0)for(let i in t.uniforms){let n=t.uniforms[i];switch(this.uniforms[i]={},n.type){case"t":this.uniforms[i].value=e[n.value]||null;break;case"c":this.uniforms[i].value=new Mt().setHex(n.value);break;case"v2":this.uniforms[i].value=new Gt().fromArray(n.value);break;case"v3":this.uniforms[i].value=new O().fromArray(n.value);break;case"v4":this.uniforms[i].value=new pe().fromArray(n.value);break;case"m3":this.uniforms[i].value=new Ft().fromArray(n.value);break;case"m4":this.uniforms[i].value=new Kt().fromArray(n.value);break;default:this.uniforms[i].value=n.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(let i in t.extensions)this.extensions[i]=t.extensions[i];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}},qr=class extends be{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}};var Ie=class extends Ai{constructor(t){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Mt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Mt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Ko,this.normalScale=new Gt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new mi,this.combine=co,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.envMapIntensity=t.envMapIntensity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}},Yr=class extends Ai{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=hh,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},Zr=class extends Ai{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}};function Vn(s,t){return!s||s.constructor===t?s:typeof t.BYTES_PER_ELEMENT=="number"?new t(s):Array.prototype.slice.call(s)}function Va(s){return s!==void 0&&s.inTangents!==void 0&&s.outTangents!==void 0}var rn=class{constructor(t,e,i,n){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=n!==void 0?n:new e.constructor(i),this.sampleValues=e,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,i=this._cachedIndex,n=e[i],r=e[i-1];i:{t:{let o;e:{n:if(!(t<n)){for(let a=i+2;;){if(n===void 0){if(t<r)break n;return i=e.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===a)break;if(r=n,n=e[++i],t<n)break t}o=e.length;break e}if(!(t>=r)){let a=e[1];t<a&&(i=2,r=a);for(let l=i-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===l)break;if(n=r,r=e[--i-1],t>=r)break t}o=i,i=0;break e}break i}for(;i<o;){let a=i+o>>>1;t<e[a]?o=a:i=a+1}if(n=e[i],r=e[i-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===void 0)return i=e.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,r,n)}return this.interpolate_(i,r,t,n)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,i=this.sampleValues,n=this.valueSize,r=t*n;for(let o=0;o!==n;++o)e[o]=i[r+o];return e}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},$r=class extends rn{constructor(t,e,i,n){super(t,e,i,n),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:qa,endingEnd:qa}}intervalChanged_(t,e,i){let n=this.parameterPositions,r=t-2,o=t+1,a=n[r],l=n[o];if(a===void 0)switch(this.getSettings_().endingStart){case Ya:r=t,a=2*e-i;break;case Za:r=n.length-2,a=e+n[r]-n[r+1];break;default:r=t,a=i}if(l===void 0)switch(this.getSettings_().endingEnd){case Ya:o=t,l=2*i-e;break;case Za:o=1,l=i+n[1]-n[0];break;default:o=t-1,l=e}let c=(i-e)*.5,h=this.valueSize;this._weightPrev=c/(e-a),this._weightNext=c/(l-i),this._offsetPrev=r*h,this._offsetNext=o*h}interpolate_(t,e,i,n){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,h=this._offsetPrev,d=this._offsetNext,u=this._weightPrev,p=this._weightNext,g=(i-e)/(n-e),_=g*g,m=_*g,f=-u*m+2*u*_-u*g,v=(1+u)*m+(-1.5-2*u)*_+(-.5+u)*g+1,C=(-1-p)*m+(1.5+p)*_+.5*g,M=p*m-p*_;for(let b=0;b!==a;++b)r[b]=f*o[h+b]+v*o[c+b]+C*o[l+b]+M*o[d+b];return r}},Jr=class extends rn{constructor(t,e,i,n){super(t,e,i,n)}interpolate_(t,e,i,n){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,h=(i-e)/(n-e),d=1-h;for(let u=0;u!==a;++u)r[u]=o[c+u]*d+o[l+u]*h;return r}},Kr=class extends rn{constructor(t,e,i,n){super(t,e,i,n)}interpolate_(t){return this.copySampleValue_(t-1)}},Qr=class extends rn{interpolate_(t,e,i,n){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,h=this.inTangents,d=this.outTangents;if(!h||!d){let g=(i-e)/(n-e),_=1-g;for(let m=0;m!==a;++m)r[m]=o[c+m]*_+o[l+m]*g;return r}let u=a*2,p=t-1;for(let g=0;g!==a;++g){let _=o[c+g],m=o[l+g],f=p*u+g*2,v=d[f],C=d[f+1],M=t*u+g*2,b=h[M],S=h[M+1],T=$u(i,e,v,b,n);r[g]=Th(T,_,C,S,m)}return r}};function Th(s,t,e,i,n){let r=1-s;return r*r*r*t+3*r*r*s*e+3*r*s*s*i+s*s*s*n}function Zu(s,t,e,i,n){let r=1-s;return 3*r*r*(e-t)+6*r*s*(i-e)+3*s*s*(n-i)}function $u(s,t,e,i,n){let r=(s-t)/(n-t);for(let o=0;o<8;o++){let a=Th(r,t,e,i,n)-s;if(Math.abs(a)<1e-10)break;let l=Zu(r,t,e,i,n);if(Math.abs(l)<1e-10)break;r=Math.max(0,Math.min(1,r-a/l))}return r}var je=class{constructor(t,e,i,n){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=Vn(e,this.TimeBufferType),this.values=Vn(i,this.ValueBufferType),this.setInterpolation(n||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,i;if(e.toJSON!==this.toJSON)i=e.toJSON(t);else{i={name:t.name,times:Vn(t.times,Array),values:Vn(t.values,Array)};let n=t.getInterpolation();n!==t.DefaultInterpolation&&(i.interpolation=n),Va(t.settings)&&(i.settings={inTangents:Vn(t.settings.inTangents,Array),outTangents:Vn(t.settings.outTangents,Array)})}return i.type=t.ValueTypeName,i}InterpolantFactoryMethodDiscrete(t){return new Kr(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new Jr(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new $r(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodBezier(t){let e=new Qr(this.times,this.values,this.getValueSize(),t);return this.settings&&(e.inTangents=this.settings.inTangents,e.outTangents=this.settings.outTangents),e}setInterpolation(t){let e;switch(t){case ys:e=this.InterpolantFactoryMethodDiscrete;break;case Ur:e=this.InterpolantFactoryMethodLinear;break;case Er:e=this.InterpolantFactoryMethodSmooth;break;case Xa:e=this.InterpolantFactoryMethodBezier;break}if(e===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return It("KeyframeTrack:",i),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return ys;case this.InterpolantFactoryMethodLinear:return Ur;case this.InterpolantFactoryMethodSmooth:return Er;case this.InterpolantFactoryMethodBezier:return Xa}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let i=0,n=e.length;i!==n;++i)e[i]+=t}return this}scale(t){if(t!==1){let e=this.times;for(let i=0,n=e.length;i!==n;++i)e[i]*=t;Va(this.settings)&&(Dc(this.settings.inTangents,t),Dc(this.settings.outTangents,t))}return this}trim(t,e){let i=this.times,n=i.length,r=0,o=n-1;for(;r!==n&&i[r]<t;)++r;for(;o!==-1&&i[o]>e;)--o;if(++o,r!==0||o!==n){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=i.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(Nt("KeyframeTrack: Invalid value size in track.",this),t=!1);let i=this.times,n=this.values,r=i.length;r===0&&(Nt("KeyframeTrack: Track is empty.",this),t=!1);let o=null;for(let a=0;a!==r;a++){let l=i[a];if(typeof l=="number"&&isNaN(l)){Nt("KeyframeTrack: Time is not a valid number.",this,a,l),t=!1;break}if(o!==null&&o>l){Nt("KeyframeTrack: Out of order keys.",this,a,l,o),t=!1;break}o=l}if(n!==void 0&&wu(n))for(let a=0,l=n.length;a!==l;++a){let c=n[a];if(isNaN(c)){Nt("KeyframeTrack: Value is not a valid number.",this,a,c),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),i=this.getValueSize(),n=this.getInterpolation()===Er,r=t.length-1,o=1;for(let a=1;a<r;++a){let l=!1,c=t[a],h=t[a+1];if(c!==h&&(a!==1||c!==t[0]))if(n)l=!0;else{let d=a*i,u=d-i,p=d+i;for(let g=0;g!==i;++g){let _=e[d+g];if(_!==e[u+g]||_!==e[p+g]){l=!0;break}}}if(l){if(a!==o){t[o]=t[a];let d=a*i,u=o*i;for(let p=0;p!==i;++p)e[u+p]=e[d+p]}++o}}if(r>0){t[o]=t[r];for(let a=r*i,l=o*i,c=0;c!==i;++c)e[l+c]=e[a+c];++o}return o!==t.length?(this.times=t.slice(0,o),this.values=e.slice(0,o*i)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),i=this.constructor,n=new i(this.name,t,e);return n.createInterpolant=this.createInterpolant,Va(this.settings)&&(n.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),n}};function Dc(s,t){for(let e=0,i=s.length;e!==i;e+=2)s[e]*=t}je.prototype.ValueTypeName="";je.prototype.TimeBufferType=Float32Array;je.prototype.ValueBufferType=Float32Array;je.prototype.DefaultInterpolation=Ur;var on=class extends je{constructor(t,e,i){super(t,e,i)}};on.prototype.ValueTypeName="bool";on.prototype.ValueBufferType=Array;on.prototype.DefaultInterpolation=ys;on.prototype.InterpolantFactoryMethodLinear=void 0;on.prototype.InterpolantFactoryMethodSmooth=void 0;var jr=class extends je{constructor(t,e,i,n){super(t,e,i,n)}};jr.prototype.ValueTypeName="color";var to=class extends je{constructor(t,e,i,n){super(t,e,i,n)}};to.prototype.ValueTypeName="number";var eo=class extends rn{constructor(t,e,i,n){super(t,e,i,n)}interpolate_(t,e,i,n){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(i-e)/(n-e),c=t*a;for(let h=c+a;c!==h;c+=4)si.slerpFlat(r,0,o,c-a,o,c,l);return r}},Ls=class extends je{constructor(t,e,i,n){super(t,e,i,n)}InterpolantFactoryMethodLinear(t){return new eo(this.times,this.values,this.getValueSize(),t)}};Ls.prototype.ValueTypeName="quaternion";Ls.prototype.InterpolantFactoryMethodSmooth=void 0;var an=class extends je{constructor(t,e,i){super(t,e,i)}};an.prototype.ValueTypeName="string";an.prototype.ValueBufferType=Array;an.prototype.DefaultInterpolation=ys;an.prototype.InterpolantFactoryMethodLinear=void 0;an.prototype.InterpolantFactoryMethodSmooth=void 0;var io=class extends je{constructor(t,e,i,n){super(t,e,i,n)}};io.prototype.ValueTypeName="vector";var no=class{constructor(t,e,i){let n=this,r=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=i,this._abortController=null,this.itemStart=function(h){a++,r===!1&&n.onStart!==void 0&&n.onStart(h,o,a),r=!0},this.itemEnd=function(h){o++,n.onProgress!==void 0&&n.onProgress(h,o,a),o===a&&(r=!1,n.onLoad!==void 0&&n.onLoad())},this.itemError=function(h){n.onError!==void 0&&n.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,d){return c.push(h,d),this},this.removeHandler=function(h){let d=c.indexOf(h);return d!==-1&&c.splice(d,2),this},this.getHandler=function(h){for(let d=0,u=c.length;d<u;d+=2){let p=c[d],g=c[d+1];if(p.global&&(p.lastIndex=0),p.test(h))return g}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},Ah=new no,so=class{constructor(t){this.manager=t!==void 0?t:Ah,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(t,e){let i=this;return new Promise(function(n,r){i.load(t,n,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}abort(){return this}};so.DEFAULT_MATERIAL_NAME="__DEFAULT";var Ds=class extends Re{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new Mt(t),this.intensity=e}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,e}},Ns=class extends Ds{constructor(t,e,i){super(t,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Re.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Mt(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}toJSON(t){let e=super.toJSON(t);return e.object.groundColor=this.groundColor.getHex(),e}},Wa=new Kt,Nc=new O,Uc=new O,ro=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Gt(512,512),this.mapType=Ze,this.map=null,this.mapPass=null,this.matrix=new Kt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new jn,this._frameExtents=new Gt(1,1),this._viewportCount=1,this._viewports=[new pe(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera;Nc.setFromMatrixPosition(t.matrixWorld),e.position.copy(Nc),Uc.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(Uc),e.updateMatrixWorld(),this._updateMatrix(e,this.matrix,this._frustum)}_updateMatrix(t,e,i,n){Wa.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),i.setFromProjectionMatrix(Wa,t.coordinateSystem,t.reversedDepth);let r=this._frameExtents,o=n?n.z/r.x:1,a=n?n.w/r.y:1,l=n?n.x/r.x:0,c=n?n.y/r.y:0;t.coordinateSystem===Zn||t.reversedDepth?e.set(.5*o,0,0,.5*o+l,0,.5*a,0,.5*a+c,0,0,1,0,0,0,0,1):e.set(.5*o,0,0,.5*o+l,0,.5*a,0,.5*a+c,0,0,.5,.5,0,0,0,1),e.multiply(Wa)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return t.intensity=this.intensity,t.bias=this.bias,t.normalBias=this.normalBias,t.radius=this.radius,t.blurSamples=this.blurSamples,t.mapSize=this.mapSize.toArray(),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}},br=new O,wr=new si,Mi=new O,Us=class extends Re{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Kt,this.projectionMatrix=new Kt,this.projectionMatrixInverse=new Kt,this.coordinateSystem=pi,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose(br,wr,Mi),Mi.x===1&&Mi.y===1&&Mi.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(br,wr,Mi.set(1,1,1)).invert()}updateWorldMatrix(t,e,i=!1){super.updateWorldMatrix(t,e,i),this.matrixWorld.decompose(br,wr,Mi),Mi.x===1&&Mi.y===1&&Mi.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(br,wr,Mi.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},ji=new O,Fc=new Gt,Bc=new Gt,Be=class extends Us{constructor(t=50,e=1,i=.1,n=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=i,this.far=n,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=Fr*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(Ma*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return Fr*2*Math.atan(Math.tan(Ma*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,i){ji.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(ji.x,ji.y).multiplyScalar(-t/ji.z),ji.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(ji.x,ji.y).multiplyScalar(-t/ji.z)}getViewSize(t,e){return this.getViewBounds(t,Fc,Bc),e.subVectors(Bc,Fc)}setViewOffset(t,e,i,n,r,o){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=n,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(Ma*.5*this.fov)/this.zoom,i=2*e,n=this.aspect*i,r=-.5*n,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*n/l,e-=o.offsetY*i/c,n*=o.width/l,i*=o.height/c}let a=this.filmOffset;a!==0&&(r+=t*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+n,e,e-i,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}};var es=class extends Us{constructor(t=-1,e=1,i=1,n=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=i,this.bottom=n,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,i,n,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=n,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,n=(this.top+this.bottom)/2,r=i-t,o=i+t,a=n+e,l=n-e;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=h*this.view.offsetY,l=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}},Ja=class extends ro{constructor(){super(new es(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Fs=class extends Ds{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Re.DEFAULT_UP),this.updateMatrix(),this.target=new Re,this.shadow=new Ja}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.shadow=this.shadow.toJSON(),e.object.target=this.target.uuid,e}};var Wn=-90,Xn=1,oo=class extends Re{constructor(t,e,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let n=new Be(Wn,Xn,t,e);n.layers=this.layers,this.add(n);let r=new Be(Wn,Xn,t,e);r.layers=this.layers,this.add(r);let o=new Be(Wn,Xn,t,e);o.layers=this.layers,this.add(o);let a=new Be(Wn,Xn,t,e);a.layers=this.layers,this.add(a);let l=new Be(Wn,Xn,t,e);l.layers=this.layers,this.add(l);let c=new Be(Wn,Xn,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[i,n,r,o,a,l]=e;for(let c of e)this.remove(c);if(t===pi)i.up.set(0,1,0),i.lookAt(1,0,0),n.up.set(0,1,0),n.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===Zn)i.up.set(0,-1,0),i.lookAt(-1,0,0),n.up.set(0,-1,0),n.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:n}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[r,o,a,l,c,h]=this.children,d=t.getRenderTarget(),u=t.getActiveCubeFace(),p=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;let _=i.texture.generateMipmaps;i.texture.generateMipmaps=!1;let m=!1;t.isWebGLRenderer===!0?m=t.state.buffers.depth.getReversed():m=t.reversedDepthBuffer,t.setRenderTarget(i,0,n),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,r),t.setRenderTarget(i,1,n),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,o),t.setRenderTarget(i,2,n),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,a),t.setRenderTarget(i,3,n),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,l),t.setRenderTarget(i,4,n),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,c),i.texture.generateMipmaps=_,t.setRenderTarget(i,5,n),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,h),t.setRenderTarget(d,u,p),t.xr.enabled=g,i.texture.needsPMREMUpdate=!0}},ao=class extends Be{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}};var bl="\\[\\]\\.:\\/",Ju=new RegExp("["+bl+"]","g"),wl="[^"+bl+"]",Ku="[^"+bl.replace("\\.","")+"]",Qu=/((?:WC+[\/:])*)/.source.replace("WC",wl),ju=/(WCOD+)?/.source.replace("WCOD",Ku),td=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",wl),ed=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",wl),id=new RegExp("^"+Qu+ju+td+ed+"$"),nd=["material","materials","bones","map"],Ka=class{constructor(t,e,i){let n=i||de.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,n)}getValue(t,e){this.bind();let i=this._targetGroup.nCachedObjects_,n=this._bindings[i];n!==void 0&&n.getValue(t,e)}setValue(t,e){let i=this._bindings;for(let n=this._targetGroup.nCachedObjects_,r=i.length;n!==r;++n)i[n].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,i=t.length;e!==i;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,i=t.length;e!==i;++e)t[e].unbind()}},de=class s{constructor(t,e,i){this.path=e,this.parsedPath=i||s.parseTrackName(e),this.node=s.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,i){return t&&t.isAnimationObjectGroup?new s.Composite(t,e,i):new s(t,e,i)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(Ju,"")}static parseTrackName(t){let e=id.exec(t);if(e===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let i={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},n=i.nodeName&&i.nodeName.lastIndexOf(".");if(n!==void 0&&n!==-1){let r=i.nodeName.substring(n+1);nd.indexOf(r)!==-1&&(i.nodeName=i.nodeName.substring(0,n),i.objectName=r)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return i}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let i=t.skeleton.getBoneByName(e);if(i!==void 0)return i}if(t.children){let i=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===e||a.uuid===e)return a;let l=i(a.children);if(l)return l}return null},n=i(t.children);if(n)return n}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let i=this.resolvedProperty;for(let n=0,r=i.length;n!==r;++n)t[e++]=i[n]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let i=this.resolvedProperty;for(let n=0,r=i.length;n!==r;++n)i[n]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let i=this.resolvedProperty;for(let n=0,r=i.length;n!==r;++n)i[n]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let i=this.resolvedProperty;for(let n=0,r=i.length;n!==r;++n)i[n]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,i=e.objectName,n=e.propertyName,r=e.propertyIndex;if(t||(t=s.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){It("PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let c=e.objectIndex;switch(i){case"materials":if(!t.material){Nt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){Nt("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){Nt("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let h=0;h<t.length;h++)if(t[h].name===c){c=h;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){Nt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){Nt("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[i]===void 0){Nt("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[i]}if(c!==void 0){if(t[c]===void 0){Nt("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[c]}}let o=t[n];if(o===void 0){let c=e.nodeName;Nt("PropertyBinding: Trying to update property for track: "+c+"."+n+" but it wasn't found.",t);return}let a=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?a=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(n==="morphTargetInfluences"){if(!t.geometry){Nt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){Nt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[r]!==void 0&&(r=t.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=n;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};de.Composite=Ka;de.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};de.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};de.prototype.GetterByBindingType=[de.prototype._getValue_direct,de.prototype._getValue_array,de.prototype._getValue_arrayElement,de.prototype._getValue_toArray];de.prototype.SetterByBindingTypeAndVersioning=[[de.prototype._setValue_direct,de.prototype._setValue_direct_setNeedsUpdate,de.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[de.prototype._setValue_array,de.prototype._setValue_array_setNeedsUpdate,de.prototype._setValue_array_setMatrixWorldNeedsUpdate],[de.prototype._setValue_arrayElement,de.prototype._setValue_arrayElement_setNeedsUpdate,de.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[de.prototype._setValue_fromArray,de.prototype._setValue_fromArray_setNeedsUpdate,de.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var tg=new Float32Array(1);var Oc=new Kt,Bs=class{constructor(t,e,i=0,n=1/0){this.ray=new yn(t,e),this.near=i,this.far=n,this.camera=null,this.layers=new Kn,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,e){this.ray.set(t,e)}setFromCamera(t,e){e.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(e).sub(this.ray.origin).normalize(),this.camera=e):e.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,e.projectionMatrix.elements[14]).unproject(e),this.ray.direction.set(0,0,-1).transformDirection(e.matrixWorld),this.camera=e):Nt("Raycaster: Unsupported camera type: "+e.type)}setFromXRController(t){return Oc.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Oc),this}intersectObject(t,e=!0,i=[]){return Qa(t,this,i,e),i.sort(zc),i}intersectObjects(t,e=!0,i=[]){for(let n=0,r=t.length;n<r;n++)Qa(t[n],this,i,e);return i.sort(zc),i}};function zc(s,t){return s.distance-t.distance}function Qa(s,t,e,i){let n=!0;if(s.layers.test(t.layers)&&s.raycast(t,e)===!1&&(n=!1),n===!0&&i===!0){let r=s.children;for(let o=0,a=r.length;o<a;o++)Qa(r[o],t,e,!0)}}var Pl=class Pl{constructor(t,e,i,n){this.elements=[1,0,0,1],t!==void 0&&this.set(t,e,i,n)}identity(){return this.set(1,0,0,1),this}fromArray(t,e=0){for(let i=0;i<4;i++)this.elements[i]=t[i+e];return this}set(t,e,i,n){let r=this.elements;return r[0]=t,r[2]=e,r[1]=i,r[3]=n,this}};Pl.prototype.isMatrix2=!0;var ja=Pl;function El(s,t,e,i){let n=sd(i);switch(e){case _l:return s*t;case xo:return s*t/n.components*n.byteLength;case _o:return s*t/n.components*n.byteLength;case un:return s*t*2/n.components*n.byteLength;case yo:return s*t*2/n.components*n.byteLength;case yl:return s*t*3/n.components*n.byteLength;case $e:return s*t*4/n.components*n.byteLength;case vo:return s*t*4/n.components*n.byteLength;case ks:case Hs:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*8;case Gs:case Vs:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case So:case wo:return Math.max(s,16)*Math.max(t,8)/4;case Mo:case bo:return Math.max(s,8)*Math.max(t,8)/2;case Eo:case To:case Co:case Ro:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*8;case Ao:case Ws:case Po:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case Io:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case Lo:return Math.floor((s+4)/5)*Math.floor((t+3)/4)*16;case Do:return Math.floor((s+4)/5)*Math.floor((t+4)/5)*16;case No:return Math.floor((s+5)/6)*Math.floor((t+4)/5)*16;case Uo:return Math.floor((s+5)/6)*Math.floor((t+5)/6)*16;case Fo:return Math.floor((s+7)/8)*Math.floor((t+4)/5)*16;case Bo:return Math.floor((s+7)/8)*Math.floor((t+5)/6)*16;case Oo:return Math.floor((s+7)/8)*Math.floor((t+7)/8)*16;case zo:return Math.floor((s+9)/10)*Math.floor((t+4)/5)*16;case ko:return Math.floor((s+9)/10)*Math.floor((t+5)/6)*16;case Ho:return Math.floor((s+9)/10)*Math.floor((t+7)/8)*16;case Go:return Math.floor((s+9)/10)*Math.floor((t+9)/10)*16;case Vo:return Math.floor((s+11)/12)*Math.floor((t+9)/10)*16;case Wo:return Math.floor((s+11)/12)*Math.floor((t+11)/12)*16;case Xo:case qo:case Yo:return Math.ceil(s/4)*Math.ceil(t/4)*16;case Zo:case $o:return Math.ceil(s/4)*Math.ceil(t/4)*8;case Xs:case Jo:return Math.ceil(s/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function sd(s){switch(s){case Ze:case pl:return{byteLength:1,components:1};case ns:case ml:case _i:return{byteLength:2,components:1};case mo:case go:return{byteLength:2,components:4};case xi:case po:case oi:return{byteLength:4,components:1};case gl:case xl:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${s}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?It("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function $h(){let s=null,t=!1,e=null,i=null;function n(r,o){i=s.requestAnimationFrame(n),e(r,o)}return{start:function(){t!==!0&&e!==null&&s!==null&&(i=s.requestAnimationFrame(n),t=!0)},stop:function(){s!==null&&s.cancelAnimationFrame(i),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){s=r}}}function od(s){let t=new WeakMap;function e(a,l){let c=a.array,h=a.usage,d=c.byteLength,u=s.createBuffer();s.bindBuffer(l,u),s.bufferData(l,c,h),a.onUploadCallback();let p;if(c instanceof Float32Array)p=s.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)p=s.HALF_FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?p=s.HALF_FLOAT:p=s.UNSIGNED_SHORT;else if(c instanceof Int16Array)p=s.SHORT;else if(c instanceof Uint32Array)p=s.UNSIGNED_INT;else if(c instanceof Int32Array)p=s.INT;else if(c instanceof Int8Array)p=s.BYTE;else if(c instanceof Uint8Array)p=s.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)p=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:u,type:p,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:d}}function i(a,l,c){let h=l.array,d=l.updateRanges;if(s.bindBuffer(c,a),d.length===0)s.bufferSubData(c,0,h);else{d.sort((p,g)=>p.start-g.start);let u=0;for(let p=1;p<d.length;p++){let g=d[u],_=d[p];_.start<=g.start+g.count+1?g.count=Math.max(g.count,_.start+_.count-g.start):(++u,d[u]=_)}d.length=u+1;for(let p=0,g=d.length;p<g;p++){let _=d[p];s.bufferSubData(c,_.start*h.BYTES_PER_ELEMENT,h,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function n(a){return a.isInterleavedBufferAttribute&&(a=a.data),t.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);let l=t.get(a);l&&(s.deleteBuffer(l.buffer),t.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let h=t.get(a);(!h||h.version<a.version)&&t.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let c=t.get(a);if(c===void 0)t.set(a,e(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,a,l),c.version=a.version}}return{get:n,remove:r,update:o}}var ad=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,ld=`#ifdef USE_ALPHAHASH
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
#endif`,cd=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,hd=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,ud=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,dd=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,fd=`#ifdef USE_AOMAP
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
#endif`,pd=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,md=`#ifdef USE_BATCHING
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
#endif`,gd=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,xd=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,_d=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,yd=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,vd=`#ifdef USE_IRIDESCENCE
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
#endif`,Md=`#ifdef USE_BUMPMAP
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
#endif`,Sd=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,bd=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,wd=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Ed=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Td=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,Ad=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Cd=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Rd=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,Pd=`#define PI 3.141592653589793
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
} // validated`,Id=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,Ld=`vec3 transformedNormal = objectNormal;
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
#endif`,Dd=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Nd=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Ud=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Fd=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Bd="gl_FragColor = linearToOutputTexel( gl_FragColor );",Od=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,zd=`#ifdef USE_ENVMAP
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
#endif`,kd=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,Hd=`#ifdef USE_ENVMAP
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
#endif`,Gd=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Vd=`#ifdef USE_ENVMAP
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
#endif`,Wd=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Xd=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,qd=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Yd=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Zd=`#ifdef USE_GRADIENTMAP
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
}`,$d=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Jd=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Kd=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Qd=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,jd=`#ifdef USE_ENVMAP
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
#endif`,tf=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,ef=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,nf=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,sf=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,rf=`PhysicalMaterial material;
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
#endif`,of=`uniform sampler2D dfgLUT;
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
}`,af=`
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
#endif`,lf=`#if defined( RE_IndirectDiffuse )
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
#endif`,cf=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,hf=`#ifdef USE_LIGHT_PROBES_GRID
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
#endif`,uf=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,df=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,ff=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,pf=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,mf=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,gf=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,xf=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,_f=`#if defined( USE_POINTS_UV )
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
#endif`,yf=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,vf=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Mf=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Sf=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,bf=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,wf=`#ifdef USE_MORPHTARGETS
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
#endif`,Ef=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Tf=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,Af=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,Cf=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Rf=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Pf=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,If=`#ifdef USE_NORMALMAP
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
#endif`,Lf=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Df=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Nf=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Uf=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Ff=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Bf=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,Of=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,zf=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,kf=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Hf=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Gf=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Vf=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Wf=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Xf=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,qf=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,Yf=`float getShadowMask() {
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
}`,Zf=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,$f=`#ifdef USE_SKINNING
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
#endif`,Jf=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Kf=`#ifdef USE_SKINNING
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
#endif`,Qf=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,jf=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,tp=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,ep=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,ip=`#ifdef USE_TRANSMISSION
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
#endif`,np=`#ifdef USE_TRANSMISSION
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
#endif`,sp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,rp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,op=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,ap=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,lp=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,cp=`uniform sampler2D t2D;
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
}`,hp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,up=`#ifdef ENVMAP_TYPE_CUBE
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
}`,dp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,fp=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,pp=`#include <common>
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
}`,mp=`#if DEPTH_PACKING == 3200
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
}`,gp=`#define DISTANCE
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
}`,xp=`#define DISTANCE
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
}`,_p=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,yp=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,vp=`uniform float scale;
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
}`,Mp=`uniform vec3 diffuse;
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
}`,Sp=`#include <common>
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
}`,bp=`uniform vec3 diffuse;
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
}`,wp=`#define LAMBERT
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
}`,Ep=`#define LAMBERT
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
}`,Tp=`#define MATCAP
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
}`,Ap=`#define MATCAP
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
}`,Cp=`#define NORMAL
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
}`,Rp=`#define NORMAL
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
}`,Pp=`#define PHONG
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
}`,Ip=`#define PHONG
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
}`,Lp=`#define STANDARD
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
}`,Dp=`#define STANDARD
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
}`,Np=`#define TOON
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
}`,Up=`#define TOON
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
}`,Fp=`uniform float size;
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
}`,Bp=`uniform vec3 diffuse;
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
}`,Op=`#include <common>
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
}`,zp=`uniform vec3 color;
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
}`,kp=`uniform float rotation;
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
}`,Hp=`uniform vec3 diffuse;
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
}`,Vt={alphahash_fragment:ad,alphahash_pars_fragment:ld,alphamap_fragment:cd,alphamap_pars_fragment:hd,alphatest_fragment:ud,alphatest_pars_fragment:dd,aomap_fragment:fd,aomap_pars_fragment:pd,batching_pars_vertex:md,batching_vertex:gd,begin_vertex:xd,beginnormal_vertex:_d,bsdfs:yd,iridescence_fragment:vd,bumpmap_pars_fragment:Md,clipping_planes_fragment:Sd,clipping_planes_pars_fragment:bd,clipping_planes_pars_vertex:wd,clipping_planes_vertex:Ed,color_fragment:Td,color_pars_fragment:Ad,color_pars_vertex:Cd,color_vertex:Rd,common:Pd,cube_uv_reflection_fragment:Id,defaultnormal_vertex:Ld,displacementmap_pars_vertex:Dd,displacementmap_vertex:Nd,emissivemap_fragment:Ud,emissivemap_pars_fragment:Fd,colorspace_fragment:Bd,colorspace_pars_fragment:Od,envmap_fragment:zd,envmap_common_pars_fragment:kd,envmap_pars_fragment:Hd,envmap_pars_vertex:Gd,envmap_physical_pars_fragment:jd,envmap_vertex:Vd,fog_vertex:Wd,fog_pars_vertex:Xd,fog_fragment:qd,fog_pars_fragment:Yd,gradientmap_pars_fragment:Zd,lightmap_pars_fragment:$d,lights_lambert_fragment:Jd,lights_lambert_pars_fragment:Kd,lights_pars_begin:Qd,lights_toon_fragment:tf,lights_toon_pars_fragment:ef,lights_phong_fragment:nf,lights_phong_pars_fragment:sf,lights_physical_fragment:rf,lights_physical_pars_fragment:of,lights_fragment_begin:af,lights_fragment_maps:lf,lights_fragment_end:cf,lightprobes_pars_fragment:hf,logdepthbuf_fragment:uf,logdepthbuf_pars_fragment:df,logdepthbuf_pars_vertex:ff,logdepthbuf_vertex:pf,map_fragment:mf,map_pars_fragment:gf,map_particle_fragment:xf,map_particle_pars_fragment:_f,metalnessmap_fragment:yf,metalnessmap_pars_fragment:vf,morphinstance_vertex:Mf,morphcolor_vertex:Sf,morphnormal_vertex:bf,morphtarget_pars_vertex:wf,morphtarget_vertex:Ef,normal_fragment_begin:Tf,normal_fragment_maps:Af,normal_pars_fragment:Cf,normal_pars_vertex:Rf,normal_vertex:Pf,normalmap_pars_fragment:If,clearcoat_normal_fragment_begin:Lf,clearcoat_normal_fragment_maps:Df,clearcoat_pars_fragment:Nf,iridescence_pars_fragment:Uf,opaque_fragment:Ff,packing:Bf,premultiplied_alpha_fragment:Of,project_vertex:zf,dithering_fragment:kf,dithering_pars_fragment:Hf,roughnessmap_fragment:Gf,roughnessmap_pars_fragment:Vf,shadowmap_pars_fragment:Wf,shadowmap_pars_vertex:Xf,shadowmap_vertex:qf,shadowmask_pars_fragment:Yf,skinbase_vertex:Zf,skinning_pars_vertex:$f,skinning_vertex:Jf,skinnormal_vertex:Kf,specularmap_fragment:Qf,specularmap_pars_fragment:jf,tonemapping_fragment:tp,tonemapping_pars_fragment:ep,transmission_fragment:ip,transmission_pars_fragment:np,uv_pars_fragment:sp,uv_pars_vertex:rp,uv_vertex:op,worldpos_vertex:ap,background_vert:lp,background_frag:cp,backgroundCube_vert:hp,backgroundCube_frag:up,cube_vert:dp,cube_frag:fp,depth_vert:pp,depth_frag:mp,distance_vert:gp,distance_frag:xp,equirect_vert:_p,equirect_frag:yp,linedashed_vert:vp,linedashed_frag:Mp,meshbasic_vert:Sp,meshbasic_frag:bp,meshlambert_vert:wp,meshlambert_frag:Ep,meshmatcap_vert:Tp,meshmatcap_frag:Ap,meshnormal_vert:Cp,meshnormal_frag:Rp,meshphong_vert:Pp,meshphong_frag:Ip,meshphysical_vert:Lp,meshphysical_frag:Dp,meshtoon_vert:Np,meshtoon_frag:Up,points_vert:Fp,points_frag:Bp,shadow_vert:Op,shadow_frag:zp,sprite_vert:kp,sprite_frag:Hp},pt={common:{diffuse:{value:new Mt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ft},alphaMap:{value:null},alphaMapTransform:{value:new Ft},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ft}},envmap:{envMap:{value:null},envMapRotation:{value:new Ft},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ft}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ft}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ft},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ft},normalScale:{value:new Gt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ft},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ft}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ft}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ft}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Mt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new O},probesMax:{value:new O},probesResolution:{value:new O}},points:{diffuse:{value:new Mt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ft},alphaTest:{value:0},uvTransform:{value:new Ft}},sprite:{diffuse:{value:new Mt(16777215)},opacity:{value:1},center:{value:new Gt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ft},alphaMap:{value:null},alphaMapTransform:{value:new Ft},alphaTest:{value:0}}},Di={basic:{uniforms:Oe([pt.common,pt.specularmap,pt.envmap,pt.aomap,pt.lightmap,pt.fog]),vertexShader:Vt.meshbasic_vert,fragmentShader:Vt.meshbasic_frag},lambert:{uniforms:Oe([pt.common,pt.specularmap,pt.envmap,pt.aomap,pt.lightmap,pt.emissivemap,pt.bumpmap,pt.normalmap,pt.displacementmap,pt.fog,pt.lights,{emissive:{value:new Mt(0)},envMapIntensity:{value:1}}]),vertexShader:Vt.meshlambert_vert,fragmentShader:Vt.meshlambert_frag},phong:{uniforms:Oe([pt.common,pt.specularmap,pt.envmap,pt.aomap,pt.lightmap,pt.emissivemap,pt.bumpmap,pt.normalmap,pt.displacementmap,pt.fog,pt.lights,{emissive:{value:new Mt(0)},specular:{value:new Mt(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Vt.meshphong_vert,fragmentShader:Vt.meshphong_frag},standard:{uniforms:Oe([pt.common,pt.envmap,pt.aomap,pt.lightmap,pt.emissivemap,pt.bumpmap,pt.normalmap,pt.displacementmap,pt.roughnessmap,pt.metalnessmap,pt.fog,pt.lights,{emissive:{value:new Mt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Vt.meshphysical_vert,fragmentShader:Vt.meshphysical_frag},toon:{uniforms:Oe([pt.common,pt.aomap,pt.lightmap,pt.emissivemap,pt.bumpmap,pt.normalmap,pt.displacementmap,pt.gradientmap,pt.fog,pt.lights,{emissive:{value:new Mt(0)}}]),vertexShader:Vt.meshtoon_vert,fragmentShader:Vt.meshtoon_frag},matcap:{uniforms:Oe([pt.common,pt.bumpmap,pt.normalmap,pt.displacementmap,pt.fog,{matcap:{value:null}}]),vertexShader:Vt.meshmatcap_vert,fragmentShader:Vt.meshmatcap_frag},points:{uniforms:Oe([pt.points,pt.fog]),vertexShader:Vt.points_vert,fragmentShader:Vt.points_frag},dashed:{uniforms:Oe([pt.common,pt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Vt.linedashed_vert,fragmentShader:Vt.linedashed_frag},depth:{uniforms:Oe([pt.common,pt.displacementmap]),vertexShader:Vt.depth_vert,fragmentShader:Vt.depth_frag},normal:{uniforms:Oe([pt.common,pt.bumpmap,pt.normalmap,pt.displacementmap,{opacity:{value:1}}]),vertexShader:Vt.meshnormal_vert,fragmentShader:Vt.meshnormal_frag},sprite:{uniforms:Oe([pt.sprite,pt.fog]),vertexShader:Vt.sprite_vert,fragmentShader:Vt.sprite_frag},background:{uniforms:{uvTransform:{value:new Ft},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Vt.background_vert,fragmentShader:Vt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ft}},vertexShader:Vt.backgroundCube_vert,fragmentShader:Vt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Vt.cube_vert,fragmentShader:Vt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Vt.equirect_vert,fragmentShader:Vt.equirect_frag},distance:{uniforms:Oe([pt.common,pt.displacementmap,{referencePosition:{value:new O},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Vt.distance_vert,fragmentShader:Vt.distance_frag},shadow:{uniforms:Oe([pt.lights,pt.fog,{color:{value:new Mt(0)},opacity:{value:1}}]),vertexShader:Vt.shadow_vert,fragmentShader:Vt.shadow_frag}};Di.physical={uniforms:Oe([Di.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ft},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ft},clearcoatNormalScale:{value:new Gt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ft},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ft},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ft},sheen:{value:0},sheenColor:{value:new Mt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ft},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ft},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ft},transmissionSamplerSize:{value:new Gt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ft},attenuationDistance:{value:0},attenuationColor:{value:new Mt(0)},specularColor:{value:new Mt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ft},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ft},anisotropyVector:{value:new Gt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ft}}]),vertexShader:Vt.meshphysical_vert,fragmentShader:Vt.meshphysical_frag};var ta={r:0,b:0,g:0},Gp=new Kt,Jh=new Ft;Jh.set(-1,0,0,0,1,0,0,0,1);function Vp(s,t,e,i,n,r){let o=new Mt(0),a=n===!0?0:1,l,c,h=null,d=0,u=null;function p(v){let C=v.isScene===!0?v.background:null;if(C&&C.isTexture){let M=v.backgroundBlurriness>0;C=t.get(C,M)}return C}function g(v){let C=!1,M=p(v);M===null?m(o,a):M&&M.isColor&&(m(M,1),C=!0);let b=s.xr.getEnvironmentBlendMode();b==="additive"?e.buffers.color.setClear(0,0,0,1,r):b==="alpha-blend"&&e.buffers.color.setClear(0,0,0,0,r),(s.autoClear||C)&&(e.buffers.depth.setTest(!0),e.buffers.depth.setMask(!0),e.buffers.color.setMask(!0),s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil))}function _(v,C){let M=p(C);M&&(M.isCubeTexture||M.mapping===Os)?(c===void 0&&(c=new $t(new Pe(1,1,1),new be({name:"BackgroundCubeMaterial",uniforms:Cn(Di.backgroundCube.uniforms),vertexShader:Di.backgroundCube.vertexShader,fragmentShader:Di.backgroundCube.fragmentShader,side:He,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(b,S,T){this.matrixWorld.copyPosition(T.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(c)),c.material.uniforms.envMap.value=M,c.material.uniforms.backgroundBlurriness.value=C.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=C.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(Gp.makeRotationFromEuler(C.backgroundRotation)).transpose(),M.isCubeTexture&&M.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(Jh),c.material.toneMapped=qt.getTransfer(M.colorSpace)!==ee,(h!==M||d!==M.version||u!==s.toneMapping)&&(c.material.needsUpdate=!0,h=M,d=M.version,u=s.toneMapping),c.layers.enableAll(),v.unshift(c,c.geometry,c.material,0,0,null)):M&&M.isTexture&&(l===void 0&&(l=new $t(new Is(2,2),new be({name:"BackgroundMaterial",uniforms:Cn(Di.background.uniforms),vertexShader:Di.background.vertexShader,fragmentShader:Di.background.fragmentShader,side:Ri,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=M,l.material.uniforms.backgroundIntensity.value=C.backgroundIntensity,l.material.toneMapped=qt.getTransfer(M.colorSpace)!==ee,M.matrixAutoUpdate===!0&&M.updateMatrix(),l.material.uniforms.uvTransform.value.copy(M.matrix),(h!==M||d!==M.version||u!==s.toneMapping)&&(l.material.needsUpdate=!0,h=M,d=M.version,u=s.toneMapping),l.layers.enableAll(),v.unshift(l,l.geometry,l.material,0,0,null))}function m(v,C){v.getRGB(ta,Sl(s)),e.buffers.color.setClear(ta.r,ta.g,ta.b,C,r)}function f(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return o},setClearColor:function(v,C=1){o.set(v),a=C,m(o,a)},getClearAlpha:function(){return a},setClearAlpha:function(v){a=v,m(o,a)},render:g,addToRenderList:_,dispose:f}}function Wp(s,t){let e=s.getParameter(s.MAX_VERTEX_ATTRIBS),i={},n=u(null),r=n,o=!1;function a(I,L,D,P,N){let G=!1,k=d(I,P,D,L);r!==k&&(r=k,c(r.object)),G=p(I,P,D,N),G&&g(I,P,D,N),N!==null&&t.update(N,s.ELEMENT_ARRAY_BUFFER),(G||o)&&(o=!1,M(I,L,D,P),N!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,t.get(N).buffer))}function l(){return s.createVertexArray()}function c(I){return s.bindVertexArray(I)}function h(I){return s.deleteVertexArray(I)}function d(I,L,D,P){let N=P.wireframe===!0,G=i[L.id];G===void 0&&(G={},i[L.id]=G);let k=I.isInstancedMesh===!0?I.id:0,q=G[k];q===void 0&&(q={},G[k]=q);let H=q[D.id];H===void 0&&(H={},q[D.id]=H);let Z=H[N];return Z===void 0&&(Z=u(l()),H[N]=Z),Z}function u(I){let L=[],D=[],P=[];for(let N=0;N<e;N++)L[N]=0,D[N]=0,P[N]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:L,enabledAttributes:D,attributeDivisors:P,object:I,attributes:{},index:null}}function p(I,L,D,P){let N=r.attributes,G=L.attributes,k=0,q=D.getAttributes();for(let H in q)if(q[H].location>=0){let J=N[H],rt=G[H];if(rt===void 0&&(H==="instanceMatrix"&&I.instanceMatrix&&(rt=I.instanceMatrix),H==="instanceColor"&&I.instanceColor&&(rt=I.instanceColor)),J===void 0||J.attribute!==rt||rt&&J.data!==rt.data)return!0;k++}return r.attributesNum!==k||r.index!==P}function g(I,L,D,P){let N={},G=L.attributes,k=0,q=D.getAttributes();for(let H in q)if(q[H].location>=0){let J=G[H];J===void 0&&(H==="instanceMatrix"&&I.instanceMatrix&&(J=I.instanceMatrix),H==="instanceColor"&&I.instanceColor&&(J=I.instanceColor));let rt={};rt.attribute=J,J&&J.data&&(rt.data=J.data),N[H]=rt,k++}r.attributes=N,r.attributesNum=k,r.index=P}function _(){let I=r.newAttributes;for(let L=0,D=I.length;L<D;L++)I[L]=0}function m(I){f(I,0)}function f(I,L){let D=r.newAttributes,P=r.enabledAttributes,N=r.attributeDivisors;D[I]=1,P[I]===0&&(s.enableVertexAttribArray(I),P[I]=1),N[I]!==L&&(s.vertexAttribDivisor(I,L),N[I]=L)}function v(){let I=r.newAttributes,L=r.enabledAttributes;for(let D=0,P=L.length;D<P;D++)L[D]!==I[D]&&(s.disableVertexAttribArray(D),L[D]=0)}function C(I,L,D,P,N,G,k){k===!0?s.vertexAttribIPointer(I,L,D,N,G):s.vertexAttribPointer(I,L,D,P,N,G)}function M(I,L,D,P){_();let N=P.attributes,G=D.getAttributes(),k=L.defaultAttributeValues;for(let q in G){let H=G[q];if(H.location>=0){let Z=N[q];if(Z===void 0&&(q==="instanceMatrix"&&I.instanceMatrix&&(Z=I.instanceMatrix),q==="instanceColor"&&I.instanceColor&&(Z=I.instanceColor)),Z!==void 0){let J=Z.normalized,rt=Z.itemSize,ot=t.get(Z);if(ot===void 0)continue;let Bt=ot.buffer,Dt=ot.type,Ut=ot.bytesPerElement,$=Dt===s.INT||Dt===s.UNSIGNED_INT||Z.gpuType===po;if(Z.isInterleavedBufferAttribute){let j=Z.data,xt=j.stride,Rt=Z.offset;if(j.isInstancedInterleavedBuffer){for(let dt=0;dt<H.locationSize;dt++)f(H.location+dt,j.meshPerAttribute);I.isInstancedMesh!==!0&&P._maxInstanceCount===void 0&&(P._maxInstanceCount=j.meshPerAttribute*j.count)}else for(let dt=0;dt<H.locationSize;dt++)m(H.location+dt);s.bindBuffer(s.ARRAY_BUFFER,Bt);for(let dt=0;dt<H.locationSize;dt++)C(H.location+dt,rt/H.locationSize,Dt,J,xt*Ut,(Rt+rt/H.locationSize*dt)*Ut,$)}else{if(Z.isInstancedBufferAttribute){for(let j=0;j<H.locationSize;j++)f(H.location+j,Z.meshPerAttribute);I.isInstancedMesh!==!0&&P._maxInstanceCount===void 0&&(P._maxInstanceCount=Z.meshPerAttribute*Z.count)}else for(let j=0;j<H.locationSize;j++)m(H.location+j);s.bindBuffer(s.ARRAY_BUFFER,Bt);for(let j=0;j<H.locationSize;j++)C(H.location+j,rt/H.locationSize,Dt,J,rt*Ut,rt/H.locationSize*j*Ut,$)}}else if(k!==void 0){let J=k[q];if(J!==void 0)switch(J.length){case 2:s.vertexAttrib2fv(H.location,J);break;case 3:s.vertexAttrib3fv(H.location,J);break;case 4:s.vertexAttrib4fv(H.location,J);break;default:s.vertexAttrib1fv(H.location,J)}}}}v()}function b(){w();for(let I in i){let L=i[I];for(let D in L){let P=L[D];for(let N in P){let G=P[N];for(let k in G)h(G[k].object),delete G[k];delete P[N]}}delete i[I]}}function S(I){if(i[I.id]===void 0)return;let L=i[I.id];for(let D in L){let P=L[D];for(let N in P){let G=P[N];for(let k in G)h(G[k].object),delete G[k];delete P[N]}}delete i[I.id]}function T(I){for(let L in i){let D=i[L];for(let P in D){let N=D[P];if(N[I.id]===void 0)continue;let G=N[I.id];for(let k in G)h(G[k].object),delete G[k];delete N[I.id]}}}function x(I){for(let L in i){let D=i[L],P=I.isInstancedMesh===!0?I.id:0,N=D[P];if(N!==void 0){for(let G in N){let k=N[G];for(let q in k)h(k[q].object),delete k[q];delete N[G]}delete D[P],Object.keys(D).length===0&&delete i[L]}}}function w(){A(),o=!0,r!==n&&(r=n,c(r.object))}function A(){n.geometry=null,n.program=null,n.wireframe=!1}return{setup:a,reset:w,resetDefaultState:A,dispose:b,releaseStatesOfGeometry:S,releaseStatesOfObject:x,releaseStatesOfProgram:T,initAttributes:_,enableAttribute:m,disableUnusedAttributes:v}}function Xp(s,t,e){let i;function n(l){i=l}function r(l,c){s.drawArrays(i,l,c),e.update(c,i,1)}function o(l,c,h){h!==0&&(s.drawArraysInstanced(i,l,c,h),e.update(c,i,h))}function a(l,c,h){if(h===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,l,0,c,0,h);let u=0;for(let p=0;p<h;p++)u+=c[p];e.update(u,i,1)}this.setMode=n,this.render=r,this.renderInstances=o,this.renderMultiDraw=a}function qp(s,t,e,i){let n;function r(){if(n!==void 0)return n;if(t.has("EXT_texture_filter_anisotropic")===!0){let T=t.get("EXT_texture_filter_anisotropic");n=s.getParameter(T.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else n=0;return n}function o(T){return!(T!==$e&&i.convert(T)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(T){let x=T===_i&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(T!==Ze&&T!==oi&&!x&&i.convert(T)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE))}function l(T){if(T==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";T="mediump"}return T==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp",h=l(c);h!==c&&(It("WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let d=e.logarithmicDepthBuffer===!0,u=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control");e.reversedDepthBuffer===!0&&u===!1&&It("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let p=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),g=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=s.getParameter(s.MAX_TEXTURE_SIZE),m=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),f=s.getParameter(s.MAX_VERTEX_ATTRIBS),v=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),C=s.getParameter(s.MAX_VARYING_VECTORS),M=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),b=s.getParameter(s.MAX_SAMPLES),S=s.getParameter(s.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:d,reversedDepthBuffer:u,maxTextures:p,maxVertexTextures:g,maxTextureSize:_,maxCubemapSize:m,maxAttributes:f,maxVertexUniforms:v,maxVaryings:C,maxFragmentUniforms:M,maxSamples:b,samples:S}}function Yp(s){let t=this,e=null,i=0,n=!1,r=!1,o=new fi,a=new Ft,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(d,u){let p=d.length!==0||u||i!==0||n;return n=u,i=d.length,p},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(d,u){e=h(d,u,0)},this.setState=function(d,u,p){let g=d.clippingPlanes,_=d.clipIntersection,m=d.clipShadows,f=s.get(d);if(!n||g===null||g.length===0||r&&!m)r?h(null):c();else{let v=r?0:i,C=v*4,M=f.clippingState||null;l.value=M,M=h(g,u,C,p);for(let b=0;b!==C;++b)M[b]=e[b];f.clippingState=M,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=v}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=i>0),t.numPlanes=i,t.numIntersection=0}function h(d,u,p,g){let _=d!==null?d.length:0,m=null;if(_!==0){if(m=l.value,g!==!0||m===null){let f=p+_*4,v=u.matrixWorldInverse;a.getNormalMatrix(v),(m===null||m.length<f)&&(m=new Float32Array(f));for(let C=0,M=p;C!==_;++C,M+=4)o.copy(d[C]).applyMatrix4(v,a),o.normal.toArray(m,M),m[M+3]=o.constant}l.value=m,l.needsUpdate=!0}return t.numPlanes=_,t.numIntersection=0,m}}var os=4,Zp=6,$p=20,Jp=256,Ys=new es,Ch=new Mt,Il=null,Ll=0,Dl=0,Nl=!1,Kp=new O,Rn=new O,ia=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(t,e=0,i=.1,n=100,r={}){let{size:o=256,position:a=Kp}=r;Il=this._renderer.getRenderTarget(),Ll=this._renderer.getActiveCubeFace(),Dl=this._renderer.getActiveMipmapLevel(),Nl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(t,i,n,l,a),e>0&&this._blur(l,0,0,e),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Ih(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Ph(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodMeshes.length;t++)this._lodMeshes[t].geometry.dispose()}_cleanup(t){this._renderer.setRenderTarget(Il,Ll,Dl),this._renderer.xr.enabled=Nl,t.scissorTest=!1,rs(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===cn||t.mapping===An?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),Il=this._renderer.getRenderTarget(),Ll=this._renderer.getActiveCubeFace(),Dl=this._renderer.getActiveMipmapLevel(),Nl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=e||this._allocateTargets();return this._textureToCubeUV(t,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,i={magFilter:Se,minFilter:Se,generateMipmaps:!1,type:_i,format:$e,colorSpace:vs,depthBuffer:!1},n=Rh(t,e,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Rh(t,e,i);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=Qp(r)),this._blurMaterial=tm(r,t,e),this._ggxMaterial=jp(r,t,e)}return n}_compileMaterial(t){let e=new $t(new ge,t);this._renderer.compile(e,Ys)}_sceneToCubeUV(t,e,i,n,r){let l=new Be(90,1,e,i),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],d=this._renderer,u=d.autoClear,p=d.toneMapping;d.getClearColor(Ch),d.toneMapping=gi,d.autoClear=!1,d.state.buffers.depth.getReversed()&&(d.setRenderTarget(n),d.clearDepth(),d.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new $t(new Pe,new ri({name:"PMREM.Background",side:He,depthWrite:!1,depthTest:!1})));let _=this._backgroundBox,m=_.material,f=!1,v=t.background;v?v.isColor&&(m.color.copy(v),t.background=null,f=!0):(m.color.copy(Ch),f=!0);for(let C=0;C<6;C++){let M=C%3;M===0?(l.up.set(0,c[C],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+h[C],r.y,r.z)):M===1?(l.up.set(0,0,c[C]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+h[C],r.z)):(l.up.set(0,c[C],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+h[C]));let b=this._cubeSize;rs(n,M*b,C>2?b:0,b,b),d.setRenderTarget(n),f&&d.render(_,l),d.render(t,l)}d.toneMapping=p,d.autoClear=u,t.background=v}_textureToCubeUV(t,e){let i=this._renderer,n=t.mapping===cn||t.mapping===An;n?(this._cubemapMaterial===null&&(this._cubemapMaterial=Ih()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Ph());let r=n?this._cubemapMaterial:this._equirectMaterial,o=this._lodMeshes[0];o.material=r;let a=r.uniforms;a.envMap.value=t;let l=this._cubeSize;rs(e,0,0,3*l,2*l),i.setRenderTarget(e),i.render(o,Ys)}_applyPMREM(t){let e=this._renderer,i=e.autoClear;e.autoClear=!1;let n=this._lodMeshes.length;for(let r=1;r<n;r++)this._applyGGXFilter(t,r-1,r);e.autoClear=i}_applyGGXFilter(t,e,i){let n=this._renderer,r=this._pingPongRenderTarget,o=this._ggxMaterial,a=this._lodMeshes[i];a.material=o;let l=o.uniforms,c=i/(this._lodMeshes.length-1),h=e/(this._lodMeshes.length-1),d=Math.sqrt(c*c-h*h),u=c*1.25,p=d*u,{_lodMax:g}=this,_=this._sizeLods[i],m=3*_*(i>g-os?i-g+os:0),f=4*(this._cubeSize-_);l.envMap.value=t.texture,l.roughness.value=p,l.mipInt.value=g-e,rs(r,m,f,3*_,2*_),n.setRenderTarget(r),n.render(a,Ys),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=g-i,rs(t,m,f,3*_,2*_),n.setRenderTarget(t),n.render(a,Ys)}_blur(t,e,i,n){let r=this._pingPongRenderTarget,o=Math.min(n,Math.PI)/Math.SQRT2;this._blurPass(t,r,e,i,o),this._blurPass(r,t,i,i,o)}_blurPass(t,e,i,n,r){let o=this._renderer,a=this._blurMaterial,l=this._lodMeshes[n];l.material=a;let c=a.uniforms;c.envMap.value=t.texture,c.sigma.value=r,c.mipInt.value=this._lodMax-i;let h=this._sizeLods[n],d=3*h*(n>this._lodMax-os?n-this._lodMax+os:0),u=4*(this._cubeSize-h);rs(e,d,u,3*h,2*h),o.setRenderTarget(e),o.render(l,Ys)}};function Qp(s){let t=[],e=[],i=s,n=s-os+1+Zp;for(let r=0;r<n;r++){let o=Math.pow(2,i);t.push(o);let a=1/(o-2),l=-a,c=1+a,h=[l,l,c,l,c,c,l,l,c,c,l,c],d=6,u=6,p=3,g=new Float32Array(p*u*d),_=new Float32Array(p*u*d);for(let f=0;f<d;f++){let v=f%3*2/3-1,C=f>2?0:-1,M=[v,C,0,v+2/3,C,0,v+2/3,C+1,0,v,C,0,v+2/3,C+1,0,v,C+1,0];g.set(M,p*u*f);for(let b=0;b<u;b++){let S=h[b*2]*2-1,T=h[b*2+1]*2-1;f===0?Rn.set(1,T,S):f===1?Rn.set(-S,1,-T):f===2?Rn.set(-S,T,1):f===3?Rn.set(-1,T,-S):f===4?Rn.set(-S,-1,T):Rn.set(S,T,-1),Rn.toArray(_,(f*u+b)*p)}}let m=new ge;m.setAttribute("position",new re(g,p)),m.setAttribute("outputDirection",new re(_,p)),e.push(new $t(m,null)),i>os&&i--}return{lodMeshes:e,sizeLods:t}}function Rh(s,t,e){let i=new Ye(s,t,e);return i.texture.mapping=Os,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function rs(s,t,e,i,n){s.viewport.set(t,e,i,n),s.scissor.set(t,e,i,n)}function jp(s,t,e){return new be({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:Jp,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:ra(),fragmentShader:`

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
		`,blending:Pi,depthTest:!1,depthWrite:!1})}function tm(s,t,e){return new be({name:"SphericalGaussianBlur",defines:{SAMPLES:$p,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:ra(),fragmentShader:`

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
		`,blending:Pi,depthTest:!1,depthWrite:!1})}function Ph(){return new be({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:ra(),fragmentShader:`

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
		`,blending:Pi,depthTest:!1,depthWrite:!1})}function Ih(){return new be({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:ra(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Pi,depthTest:!1,depthWrite:!1})}function ra(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var na=class extends Ye{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let i={width:t,height:t,depth:1},n=[i,i,i,i,i,i];this.texture=new Cs(n),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},n=new Pe(5,5,5),r=new be({name:"CubemapFromEquirect",uniforms:Cn(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:He,blending:Pi});r.uniforms.tEquirect.value=e;let o=new $t(n,r),a=e.minFilter;return e.minFilter===Ii&&(e.minFilter=Se),new oo(1,10,this).update(t,o),e.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(t,e=!0,i=!0,n=!0){let r=t.getRenderTarget();for(let o=0;o<6;o++)t.setRenderTarget(this,o),t.clear(e,i,n);t.setRenderTarget(r)}};function em(s){let t=new WeakMap,e=new WeakMap,i=null;function n(u,p=!1){return u==null?null:p?o(u):r(u)}function r(u){if(u&&u.isTexture){let p=u.mapping;if(p===ho||p===uo)if(t.has(u)){let g=t.get(u).texture;return a(g,u.mapping)}else{let g=u.image;if(g&&g.height>0){let _=new na(g.height);return _.fromEquirectangularTexture(s,u),t.set(u,_),u.addEventListener("dispose",c),a(_.texture,u.mapping)}else return null}}return u}function o(u){if(u&&u.isTexture){let p=u.mapping,g=p===ho||p===uo,_=p===cn||p===An;if(g||_){let m=e.get(u),f=m!==void 0?m.texture.pmremVersion:0;if(u.isRenderTargetTexture&&u.pmremVersion!==f)return i===null&&(i=new ia(s)),m=g?i.fromEquirectangular(u,m):i.fromCubemap(u,m),m.texture.pmremVersion=u.pmremVersion,e.set(u,m),m.texture;if(m!==void 0)return m.texture;{let v=u.image;return g&&v&&v.height>0||_&&v&&l(v)?(i===null&&(i=new ia(s)),m=g?i.fromEquirectangular(u):i.fromCubemap(u),m.texture.pmremVersion=u.pmremVersion,e.set(u,m),u.addEventListener("dispose",h),m.texture):null}}}return u}function a(u,p){return p===ho?u.mapping=cn:p===uo&&(u.mapping=An),u}function l(u){let p=0,g=6;for(let _=0;_<g;_++)u[_]!==void 0&&p++;return p===g}function c(u){let p=u.target;p.removeEventListener("dispose",c);let g=t.get(p);g!==void 0&&(t.delete(p),g.dispose())}function h(u){let p=u.target;p.removeEventListener("dispose",h);let g=e.get(p);g!==void 0&&(e.delete(p),g.dispose())}function d(){t=new WeakMap,e=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:n,dispose:d}}function im(s){let t={};function e(i){if(t[i]!==void 0)return t[i];let n=s.getExtension(i);return t[i]=n,n}return{has:function(i){return e(i)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(i){let n=e(i);return n===null&&xn("WebGLRenderer: "+i+" extension not supported."),n}}}function nm(s,t,e,i){let n={},r=new WeakMap;function o(d){let u=d.target;u.index!==null&&t.remove(u.index);for(let g in u.attributes)t.remove(u.attributes[g]);u.removeEventListener("dispose",o),delete n[u.id];let p=r.get(u);p&&(t.remove(p),r.delete(u)),i.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,e.memory.geometries--}function a(d,u){return n[u.id]===!0||(u.addEventListener("dispose",o),n[u.id]=!0,e.memory.geometries++),u}function l(d){let u=d.attributes;for(let p in u)t.update(u[p],s.ARRAY_BUFFER)}function c(d){let u=[],p=d.index,g=d.attributes.position,_=0;if(g===void 0)return;if(p!==null){let v=p.array;_=p.version;for(let C=0,M=v.length;C<M;C+=3){let b=v[C+0],S=v[C+1],T=v[C+2];u.push(b,S,S,T,T,b)}}else{let v=g.array;_=g.version;for(let C=0,M=v.length/3-1;C<M;C+=3){let b=C+0,S=C+1,T=C+2;u.push(b,S,S,T,T,b)}}let m=new(g.count>=65535?Ts:Es)(u,1);m.version=_;let f=r.get(d);f&&t.remove(f),r.set(d,m)}function h(d){let u=r.get(d);if(u){let p=d.index;p!==null&&u.version<p.version&&c(d)}else c(d);return r.get(d)}return{get:a,update:l,getWireframeAttribute:h}}function sm(s,t,e){let i;function n(d){i=d}let r,o;function a(d){r=d.type,o=d.bytesPerElement}function l(d,u){s.drawElements(i,u,r,d*o),e.update(u,i,1)}function c(d,u,p){p!==0&&(s.drawElementsInstanced(i,u,r,d*o,p),e.update(u,i,p))}function h(d,u,p){if(p===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,u,0,r,d,0,p);let _=0;for(let m=0;m<p;m++)_+=u[m];e.update(_,i,1)}this.setMode=n,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=h}function rm(s){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,o,a){switch(e.calls++,o){case s.TRIANGLES:e.triangles+=a*(r/3);break;case s.LINES:e.lines+=a*(r/2);break;case s.LINE_STRIP:e.lines+=a*(r-1);break;case s.LINE_LOOP:e.lines+=a*r;break;case s.POINTS:e.points+=a*r;break;default:Nt("WebGLInfo: Unknown draw mode:",o);break}}function n(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:n,update:i}}function om(s,t,e){let i=new WeakMap,n=new pe;function r(o,a,l){let c=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,d=h!==void 0?h.length:0,u=i.get(a);if(u===void 0||u.count!==d){let w=function(){T.dispose(),i.delete(a),a.removeEventListener("dispose",w)};u!==void 0&&u.texture.dispose();let p=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,_=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],f=a.morphAttributes.normal||[],v=a.morphAttributes.color||[],C=0;p===!0&&(C=1),g===!0&&(C=2),_===!0&&(C=3);let M=a.attributes.position.count*C,b=1;M>t.maxTextureSize&&(b=Math.ceil(M/t.maxTextureSize),M=t.maxTextureSize);let S=new Float32Array(M*b*4*d),T=new bs(S,M,b,d);T.type=oi,T.needsUpdate=!0;let x=C*4;for(let A=0;A<d;A++){let I=m[A],L=f[A],D=v[A],P=M*b*4*A;for(let N=0;N<I.count;N++){let G=N*x;p===!0&&(n.fromBufferAttribute(I,N),S[P+G+0]=n.x,S[P+G+1]=n.y,S[P+G+2]=n.z,S[P+G+3]=0),g===!0&&(n.fromBufferAttribute(L,N),S[P+G+4]=n.x,S[P+G+5]=n.y,S[P+G+6]=n.z,S[P+G+7]=0),_===!0&&(n.fromBufferAttribute(D,N),S[P+G+8]=n.x,S[P+G+9]=n.y,S[P+G+10]=n.z,S[P+G+11]=D.itemSize===4?n.w:1)}}u={count:d,texture:T,size:new Gt(M,b)},i.set(a,u),a.addEventListener("dispose",w)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(s,"morphTexture",o.morphTexture,e);else{let p=0;for(let _=0;_<c.length;_++)p+=c[_];let g=a.morphTargetsRelative?1:1-p;l.getUniforms().setValue(s,"morphTargetBaseInfluence",g),l.getUniforms().setValue(s,"morphTargetInfluences",c)}l.getUniforms().setValue(s,"morphTargetsTexture",u.texture,e),l.getUniforms().setValue(s,"morphTargetsTextureSize",u.size)}return{update:r}}function am(s,t,e,i,n){let r=new WeakMap;function o(c){let h=n.render.frame,d=c.geometry,u=t.get(c,d);if(r.get(u)!==h&&(t.update(u),r.set(u,h)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==h&&(e.update(c.instanceMatrix,s.ARRAY_BUFFER),c.instanceColor!==null&&e.update(c.instanceColor,s.ARRAY_BUFFER),r.set(c,h))),c.isSkinnedMesh){let p=c.skeleton;r.get(p)!==h&&(p.update(),r.set(p,h))}return u}function a(){r=new WeakMap}function l(c){let h=c.target;h.removeEventListener("dispose",l),i.releaseStatesOfObject(h),e.remove(h.instanceMatrix),h.instanceColor!==null&&e.remove(h.instanceColor)}return{update:o,dispose:a}}var lm={[ol]:"LINEAR_TONE_MAPPING",[al]:"REINHARD_TONE_MAPPING",[ll]:"CINEON_TONE_MAPPING",[cl]:"ACES_FILMIC_TONE_MAPPING",[ul]:"AGX_TONE_MAPPING",[dl]:"NEUTRAL_TONE_MAPPING",[hl]:"CUSTOM_TONE_MAPPING"};function cm(s,t,e,i,n,r){let o=new Ye(t,e,{type:s,depthBuffer:n,stencilBuffer:r,samples:i?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),a=null,l=null,c=new ge;c.setAttribute("position",new he([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new he([0,2,0,0,2,0],2));let h=new qr({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),d=new $t(c,h),u=new es(-1,1,1,-1,0,1),p=null,g=null,_=!1,m,f=null,v=[],C=!1;this.setSize=function(M,b){o.setSize(M,b),a!==null&&a.setSize(M,b),l!==null&&l.setSize(M,b);for(let S=0;S<v.length;S++){let T=v[S];T.setSize&&T.setSize(M,b)}},this.setEffects=function(M){v=M,C=v.length>0&&v[0].isRenderPass===!0;let b=o.width,S=o.height;v.length>0&&a===null&&(a=new Ye(b,S,{type:_i,depthBuffer:!1,stencilBuffer:!1}),l=new Ye(b,S,{type:_i,depthBuffer:!1,stencilBuffer:!1}));for(let T=0;T<v.length;T++){let x=v[T];x.setSize&&x.setSize(b,S)}},this.begin=function(M,b){if(_||M.toneMapping===gi&&v.length===0)return!1;if(f=b,b!==null){let S=b.width,T=b.height;(o.width!==S||o.height!==T)&&this.setSize(S,T)}return C===!1&&M.setRenderTarget(o),m=M.toneMapping,M.toneMapping=gi,!0},this.hasRenderPass=function(){return C},this.end=function(M,b){M.toneMapping=m,_=!0;let S=o,T=a;for(let x=0;x<v.length;x++){let w=v[x];w.enabled!==!1&&(w.render(M,T,S,b),w.needsSwap!==!1&&(S=T,T=T===a?l:a))}if(p!==M.outputColorSpace||g!==M.toneMapping){p=M.outputColorSpace,g=M.toneMapping,h.defines={},qt.getTransfer(p)===ee&&(h.defines.SRGB_TRANSFER="");let x=lm[g];x&&(h.defines[x]=""),h.needsUpdate=!0}h.uniforms.tDiffuse.value=S.texture,M.setRenderTarget(f),M.render(d,u),f=null,_=!1},this.isCompositing=function(){return _},this.dispose=function(){o.dispose(),a!==null&&a.dispose(),l!==null&&l.dispose(),c.dispose(),h.dispose()}}var Kh=new qe,Bl=new nn(1,1),Qh=new bs,jh=new zr,tu=new Cs,Lh=[],Dh=[],Nh=new Float32Array(16),Uh=new Float32Array(9),Fh=new Float32Array(4);function ls(s,t,e){let i=s[0];if(i<=0||i>0)return s;let n=t*e,r=Lh[n];if(r===void 0&&(r=new Float32Array(n),Lh[n]=r),t!==0){i.toArray(r,0);for(let o=1,a=0;o!==t;++o)a+=e,s[o].toArray(r,a)}return r}function we(s,t){if(s.length!==t.length)return!1;for(let e=0,i=s.length;e<i;e++)if(s[e]!==t[e])return!1;return!0}function Ee(s,t){for(let e=0,i=t.length;e<i;e++)s[e]=t[e]}function oa(s,t){let e=Dh[t];e===void 0&&(e=new Int32Array(t),Dh[t]=e);for(let i=0;i!==t;++i)e[i]=s.allocateTextureUnit();return e}function hm(s,t){let e=this.cache;e[0]!==t&&(s.uniform1f(this.addr,t),e[0]=t)}function um(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(we(e,t))return;s.uniform2fv(this.addr,t),Ee(e,t)}}function dm(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(s.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(we(e,t))return;s.uniform3fv(this.addr,t),Ee(e,t)}}function fm(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(we(e,t))return;s.uniform4fv(this.addr,t),Ee(e,t)}}function pm(s,t){let e=this.cache,i=t.elements;if(i===void 0){if(we(e,t))return;s.uniformMatrix2fv(this.addr,!1,t),Ee(e,t)}else{if(we(e,i))return;Fh.set(i),s.uniformMatrix2fv(this.addr,!1,Fh),Ee(e,i)}}function mm(s,t){let e=this.cache,i=t.elements;if(i===void 0){if(we(e,t))return;s.uniformMatrix3fv(this.addr,!1,t),Ee(e,t)}else{if(we(e,i))return;Uh.set(i),s.uniformMatrix3fv(this.addr,!1,Uh),Ee(e,i)}}function gm(s,t){let e=this.cache,i=t.elements;if(i===void 0){if(we(e,t))return;s.uniformMatrix4fv(this.addr,!1,t),Ee(e,t)}else{if(we(e,i))return;Nh.set(i),s.uniformMatrix4fv(this.addr,!1,Nh),Ee(e,i)}}function xm(s,t){let e=this.cache;e[0]!==t&&(s.uniform1i(this.addr,t),e[0]=t)}function _m(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(we(e,t))return;s.uniform2iv(this.addr,t),Ee(e,t)}}function ym(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(we(e,t))return;s.uniform3iv(this.addr,t),Ee(e,t)}}function vm(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(we(e,t))return;s.uniform4iv(this.addr,t),Ee(e,t)}}function Mm(s,t){let e=this.cache;e[0]!==t&&(s.uniform1ui(this.addr,t),e[0]=t)}function Sm(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(we(e,t))return;s.uniform2uiv(this.addr,t),Ee(e,t)}}function bm(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(we(e,t))return;s.uniform3uiv(this.addr,t),Ee(e,t)}}function wm(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(we(e,t))return;s.uniform4uiv(this.addr,t),Ee(e,t)}}function Em(s,t,e){let i=this.cache,n=e.allocateTextureUnit();i[0]!==n&&(s.uniform1i(this.addr,n),i[0]=n);let r;this.type===s.SAMPLER_2D_SHADOW?(Bl.compareFunction=e.isReversedDepthBuffer()?jo:Qo,r=Bl):r=Kh,e.setTexture2D(t||r,n)}function Tm(s,t,e){let i=this.cache,n=e.allocateTextureUnit();i[0]!==n&&(s.uniform1i(this.addr,n),i[0]=n),e.setTexture3D(t||jh,n)}function Am(s,t,e){let i=this.cache,n=e.allocateTextureUnit();i[0]!==n&&(s.uniform1i(this.addr,n),i[0]=n),e.setTextureCube(t||tu,n)}function Cm(s,t,e){let i=this.cache,n=e.allocateTextureUnit();i[0]!==n&&(s.uniform1i(this.addr,n),i[0]=n),e.setTexture2DArray(t||Qh,n)}function Rm(s){switch(s){case 5126:return hm;case 35664:return um;case 35665:return dm;case 35666:return fm;case 35674:return pm;case 35675:return mm;case 35676:return gm;case 5124:case 35670:return xm;case 35667:case 35671:return _m;case 35668:case 35672:return ym;case 35669:case 35673:return vm;case 5125:return Mm;case 36294:return Sm;case 36295:return bm;case 36296:return wm;case 35678:case 36198:case 36298:case 36306:case 35682:return Em;case 35679:case 36299:case 36307:return Tm;case 35680:case 36300:case 36308:case 36293:return Am;case 36289:case 36303:case 36311:case 36292:return Cm}}function Pm(s,t){s.uniform1fv(this.addr,t)}function Im(s,t){let e=ls(t,this.size,2);s.uniform2fv(this.addr,e)}function Lm(s,t){let e=ls(t,this.size,3);s.uniform3fv(this.addr,e)}function Dm(s,t){let e=ls(t,this.size,4);s.uniform4fv(this.addr,e)}function Nm(s,t){let e=ls(t,this.size,4);s.uniformMatrix2fv(this.addr,!1,e)}function Um(s,t){let e=ls(t,this.size,9);s.uniformMatrix3fv(this.addr,!1,e)}function Fm(s,t){let e=ls(t,this.size,16);s.uniformMatrix4fv(this.addr,!1,e)}function Bm(s,t){s.uniform1iv(this.addr,t)}function Om(s,t){s.uniform2iv(this.addr,t)}function zm(s,t){s.uniform3iv(this.addr,t)}function km(s,t){s.uniform4iv(this.addr,t)}function Hm(s,t){s.uniform1uiv(this.addr,t)}function Gm(s,t){s.uniform2uiv(this.addr,t)}function Vm(s,t){s.uniform3uiv(this.addr,t)}function Wm(s,t){s.uniform4uiv(this.addr,t)}function Xm(s,t,e){let i=this.cache,n=t.length,r=oa(e,n);we(i,r)||(s.uniform1iv(this.addr,r),Ee(i,r));let o;this.type===s.SAMPLER_2D_SHADOW?o=Bl:o=Kh;for(let a=0;a!==n;++a)e.setTexture2D(t[a]||o,r[a])}function qm(s,t,e){let i=this.cache,n=t.length,r=oa(e,n);we(i,r)||(s.uniform1iv(this.addr,r),Ee(i,r));for(let o=0;o!==n;++o)e.setTexture3D(t[o]||jh,r[o])}function Ym(s,t,e){let i=this.cache,n=t.length,r=oa(e,n);we(i,r)||(s.uniform1iv(this.addr,r),Ee(i,r));for(let o=0;o!==n;++o)e.setTextureCube(t[o]||tu,r[o])}function Zm(s,t,e){let i=this.cache,n=t.length,r=oa(e,n);we(i,r)||(s.uniform1iv(this.addr,r),Ee(i,r));for(let o=0;o!==n;++o)e.setTexture2DArray(t[o]||Qh,r[o])}function $m(s){switch(s){case 5126:return Pm;case 35664:return Im;case 35665:return Lm;case 35666:return Dm;case 35674:return Nm;case 35675:return Um;case 35676:return Fm;case 5124:case 35670:return Bm;case 35667:case 35671:return Om;case 35668:case 35672:return zm;case 35669:case 35673:return km;case 5125:return Hm;case 36294:return Gm;case 36295:return Vm;case 36296:return Wm;case 35678:case 36198:case 36298:case 36306:case 35682:return Xm;case 35679:case 36299:case 36307:return qm;case 35680:case 36300:case 36308:case 36293:return Ym;case 36289:case 36303:case 36311:case 36292:return Zm}}var Ol=class{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.setValue=Rm(e.type)}},zl=class{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=$m(e.type)}},kl=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,i){let n=this.seq;for(let r=0,o=n.length;r!==o;++r){let a=n[r];a.setValue(t,e[a.id],i)}}},Ul=/(\w+)(\])?(\[|\.)?/g;function Bh(s,t){s.seq.push(t),s.map[t.id]=t}function Jm(s,t,e){let i=s.name,n=i.length;for(Ul.lastIndex=0;;){let r=Ul.exec(i),o=Ul.lastIndex,a=r[1],l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===n){Bh(e,c===void 0?new Ol(a,s,t):new zl(a,s,t));break}else{let d=e.map[a];d===void 0&&(d=new kl(a),Bh(e,d)),e=d}}}var as=class{constructor(t,e){this.seq=[],this.map={};let i=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let o=0;o<i;++o){let a=t.getActiveUniform(e,o),l=t.getUniformLocation(e,a.name);Jm(a,l,this)}let n=[],r=[];for(let o of this.seq)o.type===t.SAMPLER_2D_SHADOW||o.type===t.SAMPLER_CUBE_SHADOW||o.type===t.SAMPLER_2D_ARRAY_SHADOW?n.push(o):r.push(o);n.length>0&&(this.seq=n.concat(r))}setValue(t,e,i,n){let r=this.map[e];r!==void 0&&r.setValue(t,i,n)}setOptional(t,e,i){let n=e[i];n!==void 0&&this.setValue(t,i,n)}static upload(t,e,i,n){for(let r=0,o=e.length;r!==o;++r){let a=e[r],l=i[a.id];l.needsUpdate!==!1&&a.setValue(t,l.value,n)}}static seqWithValue(t,e){let i=[];for(let n=0,r=t.length;n!==r;++n){let o=t[n];o.id in e&&i.push(o)}return i}};function Oh(s,t,e){let i=s.createShader(t);return s.shaderSource(i,e),s.compileShader(i),i}var Km=37297,Qm=0;function jm(s,t){let e=s.split(`
`),i=[],n=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let o=n;o<r;o++){let a=o+1;i.push(`${a===t?">":" "} ${a}: ${e[o]}`)}return i.join(`
`)}var zh=new Ft;function t0(s){qt._getMatrix(zh,qt.workingColorSpace,s);let t=`mat3( ${zh.elements.map(e=>e.toFixed(4))} )`;switch(qt.getTransfer(s)){case Ms:return[t,"LinearTransferOETF"];case ee:return[t,"sRGBTransferOETF"];default:return It("WebGLProgram: Unsupported color space: ",s),[t,"LinearTransferOETF"]}}function kh(s,t,e){let i=s.getShaderParameter(t,s.COMPILE_STATUS),r=(s.getShaderInfoLog(t)||"").trim();if(i&&r==="")return"";let o=/ERROR: 0:(\d+)/.exec(r);if(o){let a=parseInt(o[1]);return e.toUpperCase()+`

`+r+`

`+jm(s.getShaderSource(t),a)}else return r}function e0(s,t){let e=t0(t);return[`vec4 ${s}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}var i0={[ol]:"Linear",[al]:"Reinhard",[ll]:"Cineon",[cl]:"ACESFilmic",[ul]:"AgX",[dl]:"Neutral",[hl]:"Custom"};function n0(s,t){let e=i0[t];return e===void 0?(It("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+s+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+s+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}var ea=new O;function s0(){qt.getLuminanceCoefficients(ea);let s=ea.x.toFixed(4),t=ea.y.toFixed(4),e=ea.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${s}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function r0(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter($s).join(`
`)}function o0(s){let t=[];for(let e in s){let i=s[e];i!==!1&&t.push("#define "+e+" "+i)}return t.join(`
`)}function a0(s,t){let e={},i=s.getProgramParameter(t,s.ACTIVE_ATTRIBUTES);for(let n=0;n<i;n++){let r=s.getActiveAttrib(t,n),o=r.name,a=1;r.type===s.FLOAT_MAT2&&(a=2),r.type===s.FLOAT_MAT3&&(a=3),r.type===s.FLOAT_MAT4&&(a=4),e[o]={type:r.type,location:s.getAttribLocation(t,o),locationSize:a}}return e}function $s(s){return s!==""}function Hh(s,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return s.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Gh(s,t){return s.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var l0=/^[ \t]*#include +<([\w\d./]+)>/gm;function Hl(s){return s.replace(l0,h0)}var c0=new Map;function h0(s,t){let e=Vt[t];if(e===void 0){let i=c0.get(t);if(i!==void 0)e=Vt[i],It('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,i);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">")}return Hl(e)}var u0=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Vh(s){return s.replace(u0,d0)}function d0(s,t,e,i){let n="";for(let r=parseInt(t);r<parseInt(e);r++)n+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return n}function Wh(s){let t=`precision ${s.precision} float;
	precision ${s.precision} int;
	precision ${s.precision} sampler2D;
	precision ${s.precision} samplerCube;
	precision ${s.precision} sampler3D;
	precision ${s.precision} sampler2DArray;
	precision ${s.precision} sampler2DShadow;
	precision ${s.precision} samplerCubeShadow;
	precision ${s.precision} sampler2DArrayShadow;
	precision ${s.precision} isampler2D;
	precision ${s.precision} isampler3D;
	precision ${s.precision} isamplerCube;
	precision ${s.precision} isampler2DArray;
	precision ${s.precision} usampler2D;
	precision ${s.precision} usampler3D;
	precision ${s.precision} usamplerCube;
	precision ${s.precision} usampler2DArray;
	`;return s.precision==="highp"?t+=`
#define HIGH_PRECISION`:s.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:s.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}var f0={[En]:"SHADOWMAP_TYPE_PCF",[is]:"SHADOWMAP_TYPE_VSM"};function p0(s){return f0[s.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var m0={[cn]:"ENVMAP_TYPE_CUBE",[An]:"ENVMAP_TYPE_CUBE",[Os]:"ENVMAP_TYPE_CUBE_UV"};function g0(s){return s.envMap===!1?"ENVMAP_TYPE_CUBE":m0[s.envMapMode]||"ENVMAP_TYPE_CUBE"}var x0={[An]:"ENVMAP_MODE_REFRACTION"};function _0(s){return s.envMap===!1?"ENVMAP_MODE_REFLECTION":x0[s.envMapMode]||"ENVMAP_MODE_REFLECTION"}var y0={[co]:"ENVMAP_BLENDING_MULTIPLY",[ah]:"ENVMAP_BLENDING_MIX",[lh]:"ENVMAP_BLENDING_ADD"};function v0(s){return s.envMap===!1?"ENVMAP_BLENDING_NONE":y0[s.combine]||"ENVMAP_BLENDING_NONE"}function M0(s){let t=s.envMapCubeUVHeight;if(t===null)return null;let e=Math.log2(t)-2,i=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:i,maxMip:e}}function S0(s,t,e,i){let n=s.getContext(),r=e.defines,o=e.vertexShader,a=e.fragmentShader,l=p0(e),c=g0(e),h=_0(e),d=v0(e),u=M0(e),p=r0(e),g=o0(r),_=n.createProgram(),m,f,v=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter($s).join(`
`),m.length>0&&(m+=`
`),f=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter($s).join(`
`),f.length>0&&(f+=`
`)):(m=[Wh(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexNormals?"#define HAS_NORMAL":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter($s).join(`
`),f=[Wh(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+h:"",e.envMap?"#define "+d:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.retroreflection?"#define USE_RETROREFLECTION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas||e.batchingColor?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==gi?"#define TONE_MAPPING":"",e.toneMapping!==gi?Vt.tonemapping_pars_fragment:"",e.toneMapping!==gi?n0("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",Vt.colorspace_pars_fragment,e0("linearToOutputTexel",e.outputColorSpace),s0(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter($s).join(`
`)),o=Hl(o),o=Hh(o,e),o=Gh(o,e),a=Hl(a),a=Hh(a,e),a=Gh(a,e),o=Vh(o),a=Vh(a),e.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,m=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,f=["#define varying in",e.glslVersion===vl?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===vl?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+f);let C=v+m+o,M=v+f+a,b=Oh(n,n.VERTEX_SHADER,C),S=Oh(n,n.FRAGMENT_SHADER,M);n.attachShader(_,b),n.attachShader(_,S),e.index0AttributeName!==void 0?n.bindAttribLocation(_,0,e.index0AttributeName):e.hasPositionAttribute===!0&&n.bindAttribLocation(_,0,"position"),n.linkProgram(_);function T(I){if(s.debug.checkShaderErrors){let L=n.getProgramInfoLog(_)||"",D=n.getShaderInfoLog(b)||"",P=n.getShaderInfoLog(S)||"",N=L.trim(),G=D.trim(),k=P.trim(),q=!0,H=!0;if(n.getProgramParameter(_,n.LINK_STATUS)===!1)if(q=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(n,_,b,S);else{let Z=kh(n,b,"vertex"),J=kh(n,S,"fragment");Nt("WebGLProgram: Shader Error "+n.getError()+" - VALIDATE_STATUS "+n.getProgramParameter(_,n.VALIDATE_STATUS)+`

Material Name: `+I.name+`
Material Type: `+I.type+`

Program Info Log: `+N+`
`+Z+`
`+J)}else N!==""?It("WebGLProgram: Program Info Log:",N):(G===""||k==="")&&(H=!1);H&&(I.diagnostics={runnable:q,programLog:N,vertexShader:{log:G,prefix:m},fragmentShader:{log:k,prefix:f}})}n.deleteShader(b),n.deleteShader(S),x=new as(n,_),w=a0(n,_)}let x;this.getUniforms=function(){return x===void 0&&T(this),x};let w;this.getAttributes=function(){return w===void 0&&T(this),w};let A=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return A===!1&&(A=n.getProgramParameter(_,Km)),A},this.destroy=function(){i.releaseStatesOfProgram(this),n.deleteProgram(_),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=Qm++,this.cacheKey=t,this.usedTimes=1,this.program=_,this.vertexShader=b,this.fragmentShader=S,this}var b0=0,Gl=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,e,i){let n=this._getShaderCacheForMaterial(t);return n.has(e)===!1&&(n.add(e),e.usedTimes++),n.has(i)===!1&&(n.add(i),i.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let i of e)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,i=e.get(t);return i===void 0&&(i=new Set,e.set(t,i)),i}_getShaderStage(t){let e=this.shaderCache,i=e.get(t);return i===void 0&&(i=new Vl(t),e.set(t,i)),i}},Vl=class{constructor(t){this.id=b0++,this.code=t,this.usedTimes=0}};function w0(s){return s===un||s===Ws||s===Xs}function E0(s,t,e,i,n,r){let o=new Kn,a=new Gl,l=new Set,c=[],h=new Map,d=i.logarithmicDepthBuffer,u=i.precision,p={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(x){return l.add(x),x===0?"uv":`uv${x}`}function _(x,w,A,I,L,D){let P=I.fog,N=L.geometry,G=x.isMeshStandardMaterial||x.isMeshLambertMaterial||x.isMeshPhongMaterial?I.environment:null,k=x.isMeshStandardMaterial||x.isMeshLambertMaterial&&!x.envMap||x.isMeshPhongMaterial&&!x.envMap,q=t.get(x.envMap||G,k),H=q&&q.mapping===Os?q.image.height:null,Z=p[x.type];x.precision!==null&&(u=i.getMaxPrecision(x.precision),u!==x.precision&&It("WebGLProgram.getParameters:",x.precision,"not supported, using",u,"instead."));let J=N.morphAttributes.position||N.morphAttributes.normal||N.morphAttributes.color,rt=J!==void 0?J.length:0,ot=0;N.morphAttributes.position!==void 0&&(ot=1),N.morphAttributes.normal!==void 0&&(ot=2),N.morphAttributes.color!==void 0&&(ot=3);let Bt,Dt,Ut,$;if(Z){let le=Di[Z];Bt=le.vertexShader,Dt=le.fragmentShader}else{Bt=x.vertexShader,Dt=x.fragmentShader;let le=a.getVertexShaderStage(x),jt=a.getFragmentShaderStage(x);a.update(x,le,jt),Ut=le.id,$=jt.id}let j=s.getRenderTarget(),xt=s.state.buffers.depth.getReversed(),Rt=L.isInstancedMesh===!0,dt=L.isBatchedMesh===!0,Ot=!!x.map,xe=!!x.matcap,kt=!!q,Zt=!!x.aoMap,ie=!!x.lightMap,Xt=!!x.bumpMap&&x.wireframe===!1,fe=!!x.normalMap,Te=!!x.displacementMap,Ve=!!x.emissiveMap,me=!!x.metalnessMap,ye=!!x.roughnessMap,B=x.anisotropy>0,De=x.clearcoat>0,ne=x.dispersion>0,R=x.retroreflectivity>0,y=x.iridescence>0,z=x.sheen>0,X=x.transmission>0,K=B&&!!x.anisotropyMap,st=De&&!!x.clearcoatMap,at=De&&!!x.clearcoatNormalMap,Q=De&&!!x.clearcoatRoughnessMap,et=y&&!!x.iridescenceMap,lt=y&&!!x.iridescenceThicknessMap,Tt=z&&!!x.sheenColorMap,ft=z&&!!x.sheenRoughnessMap,ct=!!x.specularMap,At=!!x.specularColorMap,Pt=!!x.specularIntensityMap,zt=X&&!!x.transmissionMap,F=X&&!!x.thicknessMap,ht=!!x.gradientMap,tt=!!x.alphaMap,ut=x.alphaTest>0,_t=!!x.alphaHash,nt=!!x.extensions,Ct=gi;x.toneMapped&&(j===null||j.isXRRenderTarget===!0)&&(Ct=s.toneMapping);let wt={shaderID:Z,shaderType:x.type,shaderName:x.name,vertexShader:Bt,fragmentShader:Dt,defines:x.defines,customVertexShaderID:Ut,customFragmentShaderID:$,isRawShaderMaterial:x.isRawShaderMaterial===!0,glslVersion:x.glslVersion,precision:u,batching:dt,batchingColor:dt&&L._colorsTexture!==null,instancing:Rt,instancingColor:Rt&&L.instanceColor!==null,instancingMorph:Rt&&L.morphTexture!==null,outputColorSpace:j===null?s.outputColorSpace:j.isXRRenderTarget===!0?j.texture.colorSpace:qt.workingColorSpace,alphaToCoverage:!!x.alphaToCoverage,map:Ot,matcap:xe,envMap:kt,envMapMode:kt&&q.mapping,envMapCubeUVHeight:H,aoMap:Zt,lightMap:ie,bumpMap:Xt,normalMap:fe,displacementMap:Te,emissiveMap:Ve,normalMapObjectSpace:fe&&x.normalMapType===uh,normalMapTangentSpace:fe&&x.normalMapType===Ko,packedNormalMap:fe&&x.normalMapType===Ko&&w0(x.normalMap.format),metalnessMap:me,roughnessMap:ye,anisotropy:B,anisotropyMap:K,clearcoat:De,clearcoatMap:st,clearcoatNormalMap:at,clearcoatRoughnessMap:Q,dispersion:ne,retroreflection:R,iridescence:y,iridescenceMap:et,iridescenceThicknessMap:lt,sheen:z,sheenColorMap:Tt,sheenRoughnessMap:ft,specularMap:ct,specularColorMap:At,specularIntensityMap:Pt,transmission:X,transmissionMap:zt,thicknessMap:F,gradientMap:ht,opaque:x.transparent===!1&&x.blending===ln&&x.alphaToCoverage===!1,alphaMap:tt,alphaTest:ut,alphaHash:_t,combine:x.combine,mapUv:Ot&&g(x.map.channel),aoMapUv:Zt&&g(x.aoMap.channel),lightMapUv:ie&&g(x.lightMap.channel),bumpMapUv:Xt&&g(x.bumpMap.channel),normalMapUv:fe&&g(x.normalMap.channel),displacementMapUv:Te&&g(x.displacementMap.channel),emissiveMapUv:Ve&&g(x.emissiveMap.channel),metalnessMapUv:me&&g(x.metalnessMap.channel),roughnessMapUv:ye&&g(x.roughnessMap.channel),anisotropyMapUv:K&&g(x.anisotropyMap.channel),clearcoatMapUv:st&&g(x.clearcoatMap.channel),clearcoatNormalMapUv:at&&g(x.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Q&&g(x.clearcoatRoughnessMap.channel),iridescenceMapUv:et&&g(x.iridescenceMap.channel),iridescenceThicknessMapUv:lt&&g(x.iridescenceThicknessMap.channel),sheenColorMapUv:Tt&&g(x.sheenColorMap.channel),sheenRoughnessMapUv:ft&&g(x.sheenRoughnessMap.channel),specularMapUv:ct&&g(x.specularMap.channel),specularColorMapUv:At&&g(x.specularColorMap.channel),specularIntensityMapUv:Pt&&g(x.specularIntensityMap.channel),transmissionMapUv:zt&&g(x.transmissionMap.channel),thicknessMapUv:F&&g(x.thicknessMap.channel),alphaMapUv:tt&&g(x.alphaMap.channel),vertexTangents:!!N.attributes.tangent&&(fe||B),vertexNormals:!!N.attributes.normal,vertexColors:x.vertexColors,vertexAlphas:x.vertexColors===!0&&!!N.attributes.color&&N.attributes.color.itemSize===4,pointsUvs:L.isPoints===!0&&!!N.attributes.uv&&(Ot||tt),fog:!!P,useFog:x.fog===!0,fogExp2:!!P&&P.isFogExp2,flatShading:x.wireframe===!1&&(x.flatShading===!0||N.attributes.normal===void 0&&fe===!1&&(x.isMeshLambertMaterial||x.isMeshPhongMaterial||x.isMeshStandardMaterial||x.isMeshPhysicalMaterial)),sizeAttenuation:x.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:xt,skinning:L.isSkinnedMesh===!0,hasPositionAttribute:N.attributes.position!==void 0,morphTargets:N.morphAttributes.position!==void 0,morphNormals:N.morphAttributes.normal!==void 0,morphColors:N.morphAttributes.color!==void 0,morphTargetsCount:rt,morphTextureStride:ot,numSunLights:w.sun.length,numDirLights:w.directional.length,numPointLights:w.point.length,numSpotLights:w.spot.length,numSpotLightMaps:w.spotLightMap.length,numRectAreaLights:w.rectArea.length,numHemiLights:w.hemi.length,numSunLightShadows:w.sunShadowMap.length,numDirLightShadows:w.directionalShadowMap.length,numPointLightShadows:w.pointShadowMap.length,numSpotLightShadows:w.spotShadowMap.length,numSpotLightShadowsWithMaps:w.numSpotLightShadowsWithMaps,numLightProbes:w.numLightProbes,numLightProbeGrids:D.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:x.dithering,shadowMapEnabled:s.shadowMap.enabled&&A.length>0,shadowMapType:s.shadowMap.type,toneMapping:Ct,decodeVideoTexture:Ot&&x.map.isVideoTexture===!0&&qt.getTransfer(x.map.colorSpace)===ee,decodeVideoTextureEmissive:Ve&&x.emissiveMap.isVideoTexture===!0&&qt.getTransfer(x.emissiveMap.colorSpace)===ee,premultipliedAlpha:x.premultipliedAlpha,doubleSided:x.side===ti,flipSided:x.side===He,useDepthPacking:x.depthPacking>=0,depthPacking:x.depthPacking||0,index0AttributeName:x.index0AttributeName,extensionClipCullDistance:nt&&x.extensions.clipCullDistance===!0&&e.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(nt&&x.extensions.multiDraw===!0||dt)&&e.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:e.has("KHR_parallel_shader_compile"),customProgramCacheKey:x.customProgramCacheKey()};return wt.vertexUv1s=l.has(1),wt.vertexUv2s=l.has(2),wt.vertexUv3s=l.has(3),l.clear(),wt}function m(x){let w=[];if(x.shaderID?w.push(x.shaderID):(w.push(x.customVertexShaderID),w.push(x.customFragmentShaderID)),x.defines!==void 0)for(let A in x.defines)w.push(A),w.push(x.defines[A]);return x.isRawShaderMaterial===!1&&(f(w,x),v(w,x),w.push(s.outputColorSpace)),w.push(x.customProgramCacheKey),w.join()}function f(x,w){x.push(w.precision),x.push(w.outputColorSpace),x.push(w.envMapMode),x.push(w.envMapCubeUVHeight),x.push(w.mapUv),x.push(w.alphaMapUv),x.push(w.lightMapUv),x.push(w.aoMapUv),x.push(w.bumpMapUv),x.push(w.normalMapUv),x.push(w.displacementMapUv),x.push(w.emissiveMapUv),x.push(w.metalnessMapUv),x.push(w.roughnessMapUv),x.push(w.anisotropyMapUv),x.push(w.clearcoatMapUv),x.push(w.clearcoatNormalMapUv),x.push(w.clearcoatRoughnessMapUv),x.push(w.iridescenceMapUv),x.push(w.iridescenceThicknessMapUv),x.push(w.sheenColorMapUv),x.push(w.sheenRoughnessMapUv),x.push(w.specularMapUv),x.push(w.specularColorMapUv),x.push(w.specularIntensityMapUv),x.push(w.transmissionMapUv),x.push(w.thicknessMapUv),x.push(w.combine),x.push(w.fogExp2),x.push(w.sizeAttenuation),x.push(w.morphTargetsCount),x.push(w.morphAttributeCount),x.push(w.numSunLights),x.push(w.numDirLights),x.push(w.numPointLights),x.push(w.numSpotLights),x.push(w.numSpotLightMaps),x.push(w.numHemiLights),x.push(w.numRectAreaLights),x.push(w.numSunLightShadows),x.push(w.numDirLightShadows),x.push(w.numPointLightShadows),x.push(w.numSpotLightShadows),x.push(w.numSpotLightShadowsWithMaps),x.push(w.numLightProbes),x.push(w.shadowMapType),x.push(w.toneMapping),x.push(w.numClippingPlanes),x.push(w.numClipIntersection),x.push(w.depthPacking)}function v(x,w){o.disableAll(),w.instancing&&o.enable(0),w.instancingColor&&o.enable(1),w.instancingMorph&&o.enable(2),w.matcap&&o.enable(3),w.envMap&&o.enable(4),w.normalMapObjectSpace&&o.enable(5),w.normalMapTangentSpace&&o.enable(6),w.clearcoat&&o.enable(7),w.iridescence&&o.enable(8),w.alphaTest&&o.enable(9),w.vertexColors&&o.enable(10),w.vertexAlphas&&o.enable(11),w.vertexUv1s&&o.enable(12),w.vertexUv2s&&o.enable(13),w.vertexUv3s&&o.enable(14),w.vertexTangents&&o.enable(15),w.anisotropy&&o.enable(16),w.alphaHash&&o.enable(17),w.batching&&o.enable(18),w.dispersion&&o.enable(19),w.retroreflection&&o.enable(24),w.batchingColor&&o.enable(20),w.gradientMap&&o.enable(21),w.packedNormalMap&&o.enable(22),w.vertexNormals&&o.enable(23),x.push(o.mask),o.disableAll(),w.fog&&o.enable(0),w.useFog&&o.enable(1),w.flatShading&&o.enable(2),w.logarithmicDepthBuffer&&o.enable(3),w.reversedDepthBuffer&&o.enable(4),w.skinning&&o.enable(5),w.morphTargets&&o.enable(6),w.morphNormals&&o.enable(7),w.morphColors&&o.enable(8),w.premultipliedAlpha&&o.enable(9),w.shadowMapEnabled&&o.enable(10),w.doubleSided&&o.enable(11),w.flipSided&&o.enable(12),w.useDepthPacking&&o.enable(13),w.dithering&&o.enable(14),w.transmission&&o.enable(15),w.sheen&&o.enable(16),w.opaque&&o.enable(17),w.pointsUvs&&o.enable(18),w.decodeVideoTexture&&o.enable(19),w.decodeVideoTextureEmissive&&o.enable(20),w.alphaToCoverage&&o.enable(21),w.numLightProbeGrids>0&&o.enable(22),w.hasPositionAttribute&&o.enable(23),x.push(o.mask)}function C(x){let w=p[x.type],A;if(w){let I=Di[w];A=Eh.clone(I.uniforms)}else A=x.uniforms;return A}function M(x,w){let A=h.get(w);return A!==void 0?++A.usedTimes:(A=new S0(s,w,x,n),c.push(A),h.set(w,A)),A}function b(x){if(--x.usedTimes===0){let w=c.indexOf(x);c[w]=c[c.length-1],c.pop(),h.delete(x.cacheKey),x.destroy()}}function S(x){a.remove(x)}function T(){a.dispose()}return{getParameters:_,getProgramCacheKey:m,getUniforms:C,acquireProgram:M,releaseProgram:b,releaseShaderCache:S,programs:c,dispose:T}}function T0(){let s=new WeakMap;function t(o){return s.has(o)}function e(o){let a=s.get(o);return a===void 0&&(a={},s.set(o,a)),a}function i(o){s.delete(o)}function n(o,a,l){s.get(o)[a]=l}function r(){s=new WeakMap}return{has:t,get:e,remove:i,update:n,dispose:r}}function A0(s,t){return s.groupOrder!==t.groupOrder?s.groupOrder-t.groupOrder:s.renderOrder!==t.renderOrder?s.renderOrder-t.renderOrder:s.material.id!==t.material.id?s.material.id-t.material.id:s.materialVariant!==t.materialVariant?s.materialVariant-t.materialVariant:s.z!==t.z?s.z-t.z:s.id-t.id}function Xh(s,t){return s.groupOrder!==t.groupOrder?s.groupOrder-t.groupOrder:s.renderOrder!==t.renderOrder?s.renderOrder-t.renderOrder:s.z!==t.z?t.z-s.z:s.id-t.id}function qh(){let s=[],t=0,e=[],i=[],n=[];function r(){t=0,e.length=0,i.length=0,n.length=0}function o(u){let p=0;return u.isInstancedMesh&&(p+=2),u.isSkinnedMesh&&(p+=1),p}function a(u,p,g,_,m,f){let v=s[t];return v===void 0?(v={id:u.id,object:u,geometry:p,material:g,materialVariant:o(u),groupOrder:_,renderOrder:u.renderOrder,z:m,group:f},s[t]=v):(v.id=u.id,v.object=u,v.geometry=p,v.material=g,v.materialVariant=o(u),v.groupOrder=_,v.renderOrder=u.renderOrder,v.z=m,v.group=f),t++,v}function l(u,p,g,_,m,f,v){v.reversedDepth===!0&&(m=-m);let C=a(u,p,g,_,m,f);g.transmission>0?i.push(C):g.transparent===!0?n.push(C):e.push(C)}function c(u,p,g,_,m,f){let v=a(u,p,g,_,m,f);g.transmission>0?i.unshift(v):g.transparent===!0?n.unshift(v):e.unshift(v)}function h(u,p){e.length>1&&e.sort(u||A0),i.length>1&&i.sort(p||Xh),n.length>1&&n.sort(p||Xh)}function d(){for(let u=t,p=s.length;u<p;u++){let g=s[u];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:e,transmissive:i,transparent:n,init:r,push:l,unshift:c,finish:d,sort:h}}function C0(){let s=new WeakMap;function t(i,n){let r=s.get(i),o;return r===void 0?(o=new qh,s.set(i,[o])):n>=r.length?(o=new qh,r.push(o)):o=r[n],o}function e(){s=new WeakMap}return{get:t,dispose:e}}function R0(){let s={};return{get:function(t){if(s[t.id]!==void 0)return s[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={direction:new O,color:new Mt};break;case"SpotLight":e={position:new O,direction:new O,color:new Mt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new O,color:new Mt,distance:0,decay:0};break;case"HemisphereLight":e={direction:new O,skyColor:new Mt,groundColor:new Mt};break;case"RectAreaLight":e={color:new Mt,position:new O,halfWidth:new O,halfHeight:new O};break}return s[t.id]=e,e}}}function P0(){let s={};return{get:function(t){if(s[t.id]!==void 0)return s[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Gt};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Gt};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Gt,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[t.id]=e,e}}}var I0=0;function L0(s,t){return(t.castShadow?2:0)-(s.castShadow?2:0)+(t.map?1:0)-(s.map?1:0)}function D0(s){let t=new R0,e=P0(),i={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new O);let n=new O,r=new Kt,o=new Kt;function a(c){let h=0,d=0,u=0;for(let L=0;L<9;L++)i.probe[L].set(0,0,0);let p=0,g=0,_=0,m=0,f=0,v=0,C=0,M=0,b=0,S=0,T=0,x=0,w=0,A=0;c.sort(L0);for(let L=0,D=c.length;L<D;L++){let P=c[L],N=P.color,G=P.intensity,k=P.distance,q=null;if(P.shadow&&P.shadow.map&&(P.shadow.map.texture.format===un?q=P.shadow.map.texture:q=P.shadow.map.depthTexture||P.shadow.map.texture),P.isAmbientLight)h+=N.r*G,d+=N.g*G,u+=N.b*G;else if(P.isLightProbe){for(let H=0;H<9;H++)i.probe[H].addScaledVector(P.sh.coefficients[H],G);A++}else if(P.isSunLight){let H=t.get(P);if(H.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){let Z=P.shadow,J=e.get(P);J.shadowIntensity=Z.intensity,J.shadowBias=Z.bias,J.shadowNormalBias=Z.normalBias,J.shadowRadius=Z.radius,J.shadowMapSize.copy(Z.mapSize).multiply(Z.getFrameExtents()),i.sunShadow[g]=J,i.sunShadowMap[g]=q;let rt=Z.getViewportCount();for(let ot=0;ot<rt;ot++)i.sunShadowMatrix[_+ot]=Z.getMatrix(ot),i.sunShadowCascade[_+ot]=Z._cascadeData[ot];_+=rt,g++}i.sun[p]=H,p++}else if(P.isDirectionalLight){let H=t.get(P);if(H.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){let Z=P.shadow,J=e.get(P);J.shadowIntensity=Z.intensity,J.shadowBias=Z.bias,J.shadowNormalBias=Z.normalBias,J.shadowRadius=Z.radius,J.shadowMapSize=Z.mapSize,i.directionalShadow[m]=J,i.directionalShadowMap[m]=q,i.directionalShadowMatrix[m]=P.shadow.matrix,b++}i.directional[m]=H,m++}else if(P.isSpotLight){let H=t.get(P);H.position.setFromMatrixPosition(P.matrixWorld),H.color.copy(N).multiplyScalar(G),H.distance=k,H.coneCos=Math.cos(P.angle),H.penumbraCos=Math.cos(P.angle*(1-P.penumbra)),H.decay=P.decay,i.spot[v]=H;let Z=P.shadow;if(P.map&&(i.spotLightMap[x]=P.map,x++,Z.updateMatrices(P),P.castShadow&&w++),i.spotLightMatrix[v]=Z.matrix,P.castShadow){let J=e.get(P);J.shadowIntensity=Z.intensity,J.shadowBias=Z.bias,J.shadowNormalBias=Z.normalBias,J.shadowRadius=Z.radius,J.shadowMapSize=Z.mapSize,i.spotShadow[v]=J,i.spotShadowMap[v]=q,T++}v++}else if(P.isRectAreaLight){let H=t.get(P);H.color.copy(N).multiplyScalar(G),H.halfWidth.set(P.width*.5,0,0),H.halfHeight.set(0,P.height*.5,0),i.rectArea[C]=H,C++}else if(P.isPointLight){let H=t.get(P);if(H.color.copy(P.color).multiplyScalar(P.intensity),H.distance=P.distance,H.decay=P.decay,P.castShadow){let Z=P.shadow,J=e.get(P);J.shadowIntensity=Z.intensity,J.shadowBias=Z.bias,J.shadowNormalBias=Z.normalBias,J.shadowRadius=Z.radius,J.shadowMapSize=Z.mapSize,J.shadowCameraNear=Z.camera.near,J.shadowCameraFar=Z.camera.far,i.pointShadow[f]=J,i.pointShadowMap[f]=q,i.pointShadowMatrix[f]=P.shadow.matrix,S++}i.point[f]=H,f++}else if(P.isHemisphereLight){let H=t.get(P);H.skyColor.copy(P.color).multiplyScalar(G),H.groundColor.copy(P.groundColor).multiplyScalar(G),i.hemi[M]=H,M++}}C>0&&(s.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=pt.LTC_FLOAT_1,i.rectAreaLTC2=pt.LTC_FLOAT_2):(i.rectAreaLTC1=pt.LTC_HALF_1,i.rectAreaLTC2=pt.LTC_HALF_2)),i.ambient[0]=h,i.ambient[1]=d,i.ambient[2]=u;let I=i.hash;(I.sunLength!==p||I.directionalLength!==m||I.pointLength!==f||I.spotLength!==v||I.rectAreaLength!==C||I.hemiLength!==M||I.numSunShadows!==g||I.numDirectionalShadows!==b||I.numPointShadows!==S||I.numSpotShadows!==T||I.numSpotMaps!==x||I.numLightProbes!==A)&&(i.sun.length=p,i.directional.length=m,i.spot.length=v,i.rectArea.length=C,i.point.length=f,i.hemi.length=M,i.sunShadow.length=g,i.sunShadowMap.length=g,i.sunShadowMatrix.length=_,i.sunShadowCascade.length=_,i.directionalShadow.length=b,i.directionalShadowMap.length=b,i.directionalShadowMatrix.length=b,i.pointShadow.length=S,i.pointShadowMap.length=S,i.pointShadowMatrix.length=S,i.spotShadow.length=T,i.spotShadowMap.length=T,i.spotLightMatrix.length=T+x-w,i.spotLightMap.length=x,i.numSpotLightShadowsWithMaps=w,i.numLightProbes=A,I.sunLength=p,I.directionalLength=m,I.pointLength=f,I.spotLength=v,I.rectAreaLength=C,I.hemiLength=M,I.numSunShadows=g,I.numDirectionalShadows=b,I.numPointShadows=S,I.numSpotShadows=T,I.numSpotMaps=x,I.numLightProbes=A,i.version=I0++)}function l(c,h){let d=0,u=0,p=0,g=0,_=0,m=0,f=h.matrixWorldInverse;for(let v=0,C=c.length;v<C;v++){let M=c[v];if(M.isSunLight){let b=i.sun[d];b.direction.setFromMatrixPosition(M.matrixWorld),b.direction.transformDirection(f),d++}else if(M.isDirectionalLight){let b=i.directional[u];b.direction.setFromMatrixPosition(M.matrixWorld),n.setFromMatrixPosition(M.target.matrixWorld),b.direction.sub(n),b.direction.transformDirection(f),u++}else if(M.isSpotLight){let b=i.spot[g];b.position.setFromMatrixPosition(M.matrixWorld),b.position.applyMatrix4(f),b.direction.setFromMatrixPosition(M.matrixWorld),n.setFromMatrixPosition(M.target.matrixWorld),b.direction.sub(n),b.direction.transformDirection(f),g++}else if(M.isRectAreaLight){let b=i.rectArea[_];b.position.setFromMatrixPosition(M.matrixWorld),b.position.applyMatrix4(f),o.identity(),r.copy(M.matrixWorld),r.premultiply(f),o.extractRotation(r),b.halfWidth.set(M.width*.5,0,0),b.halfHeight.set(0,M.height*.5,0),b.halfWidth.applyMatrix4(o),b.halfHeight.applyMatrix4(o),_++}else if(M.isPointLight){let b=i.point[p];b.position.setFromMatrixPosition(M.matrixWorld),b.position.applyMatrix4(f),p++}else if(M.isHemisphereLight){let b=i.hemi[m];b.direction.setFromMatrixPosition(M.matrixWorld),b.direction.transformDirection(f),m++}}}return{setup:a,setupView:l,state:i}}function Yh(s){let t=new D0(s),e=[],i=[],n=[];function r(u){d.camera=u,e.length=0,i.length=0,n.length=0}function o(u){e.push(u)}function a(u){i.push(u)}function l(u){n.push(u)}function c(){t.setup(e)}function h(u){t.setupView(e,u)}let d={lightsArray:e,shadowsArray:i,lightProbeGridArray:n,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:d,setupLights:c,setupLightsView:h,pushLight:o,pushShadow:a,pushLightProbeGrid:l}}function N0(s){let t=new WeakMap;function e(n,r=0){let o=t.get(n),a;return o===void 0?(a=new Yh(s),t.set(n,[a])):r>=o.length?(a=new Yh(s),o.push(a)):a=o[r],a}function i(){t=new WeakMap}return{get:e,dispose:i}}var U0=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,F0=`uniform sampler2D shadow_pass;
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
}`,B0=[new O(1,0,0),new O(-1,0,0),new O(0,1,0),new O(0,-1,0),new O(0,0,1),new O(0,0,-1)],O0=[new O(0,-1,0),new O(0,-1,0),new O(0,0,1),new O(0,0,-1),new O(0,-1,0),new O(0,-1,0)],Zh=new Kt,Zs=new O,Fl=new O;function z0(s,t,e){let i=new jn,n=new Gt,r=new Gt,o=new pe,a=new Yr,l=new Zr,c={},h=e.maxTextureSize,d={[Ri]:He,[He]:Ri,[ti]:ti},u=new be({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Gt},radius:{value:4}},vertexShader:U0,fragmentShader:F0}),p=u.clone();p.defines.HORIZONTAL_PASS=1;let g=new ge;g.setAttribute("position",new re(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let _=new $t(g,u),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=En;let f=this.type;this.render=function(S,T,x){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||S.length===0)return;this.type===Gc&&(It("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=En);let w=s.getRenderTarget(),A=s.getActiveCubeFace(),I=s.getActiveMipmapLevel(),L=s.state;L.setBlending(Pi),L.buffers.depth.getReversed()===!0?L.buffers.color.setClear(0,0,0,0):L.buffers.color.setClear(1,1,1,1),L.buffers.depth.setTest(!0),L.setScissorTest(!1);let D=f!==this.type;D&&T.traverse(function(P){P.material&&(Array.isArray(P.material)?P.material.forEach(N=>N.needsUpdate=!0):P.material.needsUpdate=!0)});for(let P=0,N=S.length;P<N;P++){let G=S[P],k=G.shadow;if(k===void 0){It("WebGLShadowMap:",G,"has no shadow.");continue}if(k.autoUpdate===!1&&k.needsUpdate===!1)continue;n.copy(k.mapSize);let q=k.getFrameExtents();n.multiply(q),r.copy(k.mapSize),(n.x>h||n.y>h)&&(n.x>h&&(r.x=Math.floor(h/q.x),n.x=r.x*q.x,k.mapSize.x=r.x),n.y>h&&(r.y=Math.floor(h/q.y),n.y=r.y*q.y,k.mapSize.y=r.y));let H=s.state.buffers.depth.getReversed();if(k.camera._reversedDepth=H,k.map===null||D===!0){if(k.map!==null&&(k.map.depthTexture!==null&&(k.map.depthTexture.dispose(),k.map.depthTexture=null),k.map.dispose()),this.type===is){if(G.isPointLight){It("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}k.map=new Ye(n.x,n.y,{format:un,type:_i,minFilter:Se,magFilter:Se,generateMipmaps:!1}),k.map.texture.name=G.name+".shadowMap",k.map.depthTexture=new nn(n.x,n.y,oi),k.map.depthTexture.name=G.name+".shadowMapDepth",k.map.depthTexture.format=bi,k.map.depthTexture.compareFunction=null,k.map.depthTexture.minFilter=Ce,k.map.depthTexture.magFilter=Ce}else G.isPointLight?(k.map=new na(n.x),k.map.depthTexture=new Wr(n.x,xi)):(k.map=new Ye(n.x,n.y),k.map.depthTexture=new nn(n.x,n.y,xi)),k.map.depthTexture.name=G.name+".shadowMap",k.map.depthTexture.format=bi,this.type===En?(k.map.depthTexture.compareFunction=H?jo:Qo,k.map.depthTexture.minFilter=Se,k.map.depthTexture.magFilter=Se):(k.map.depthTexture.compareFunction=null,k.map.depthTexture.minFilter=Ce,k.map.depthTexture.magFilter=Ce);k.camera.updateProjectionMatrix()}k.map.isWebGLCubeRenderTarget!==!0&&(k.map.width!==n.x||k.map.height!==n.y)&&k.map.setSize(n.x,n.y);let Z=k.map.isWebGLCubeRenderTarget?6:k.getViewportCount();G.isPointLight!==!0&&k.updateMatrices(G,x);for(let J=0;J<Z;J++){let rt=k.getCamera(J);if(G.isPointLight){let ot=k.camera,Bt=k.matrix,Dt=G.distance||ot.far;Dt!==ot.far&&(ot.far=Dt,ot.updateProjectionMatrix()),Zs.setFromMatrixPosition(G.matrixWorld),ot.position.copy(Zs),Fl.copy(ot.position),Fl.add(B0[J]),ot.up.copy(O0[J]),ot.lookAt(Fl),ot.updateMatrixWorld(),Bt.makeTranslation(-Zs.x,-Zs.y,-Zs.z),Zh.multiplyMatrices(ot.projectionMatrix,ot.matrixWorldInverse),k._frustum.setFromProjectionMatrix(Zh,ot.coordinateSystem,ot.reversedDepth)}if(k.map.isWebGLCubeRenderTarget)s.setRenderTarget(k.map,J),s.clear();else{J===0&&(s.setRenderTarget(k.map),s.clear());let ot=k.getViewport(J);o.set(r.x*ot.x,r.y*ot.y,r.x*ot.z,r.y*ot.w),L.viewport(o)}i=k.getFrustum(J),M(T,x,rt,G,this.type)}k.isPointLightShadow!==!0&&this.type===is&&v(k,x),k.needsUpdate=!1}f=this.type,m.needsUpdate=!1,s.setRenderTarget(w,A,I)};function v(S,T){let x=t.update(_);u.defines.VSM_SAMPLES!==S.blurSamples&&(u.defines.VSM_SAMPLES=S.blurSamples,p.defines.VSM_SAMPLES=S.blurSamples,u.needsUpdate=!0,p.needsUpdate=!0),S.mapPass===null?S.mapPass=new Ye(n.x,n.y,{format:un,type:_i}):(S.mapPass.width!==S.map.width||S.mapPass.height!==S.map.height)&&S.mapPass.setSize(S.map.width,S.map.height),u.uniforms.shadow_pass.value=S.map.depthTexture,u.uniforms.resolution.value.set(S.map.width,S.map.height),u.uniforms.radius.value=S.radius,s.setRenderTarget(S.mapPass),s.clear(),s.renderBufferDirect(T,null,x,u,_,null),p.uniforms.shadow_pass.value=S.mapPass.texture,p.uniforms.resolution.value.set(S.map.width,S.map.height),p.uniforms.radius.value=S.radius,s.setRenderTarget(S.map),s.clear(),s.renderBufferDirect(T,null,x,p,_,null)}function C(S,T,x,w){let A=null,I=x.isPointLight===!0?S.customDistanceMaterial:S.customDepthMaterial;if(I!==void 0)A=I;else if(A=x.isPointLight===!0?l:a,s.localClippingEnabled&&T.clipShadows===!0&&Array.isArray(T.clippingPlanes)&&T.clippingPlanes.length!==0||T.displacementMap&&T.displacementScale!==0||T.alphaMap&&T.alphaTest>0||T.map&&T.alphaTest>0||T.alphaToCoverage===!0){let L=A.uuid,D=T.uuid,P=c[L];P===void 0&&(P={},c[L]=P);let N=P[D];N===void 0&&(N=A.clone(),P[D]=N,T.addEventListener("dispose",b)),A=N}if(A.visible=T.visible,A.wireframe=T.wireframe,w===is?A.side=T.shadowSide!==null?T.shadowSide:T.side:A.side=T.shadowSide!==null?T.shadowSide:d[T.side],A.alphaMap=T.alphaMap,A.alphaTest=T.alphaToCoverage===!0?.5:T.alphaTest,A.map=T.map,A.clipShadows=T.clipShadows,A.clippingPlanes=T.clippingPlanes,A.clipIntersection=T.clipIntersection,A.displacementMap=T.displacementMap,A.displacementScale=T.displacementScale,A.displacementBias=T.displacementBias,A.wireframeLinewidth=T.wireframeLinewidth,A.linewidth=T.linewidth,x.isPointLight===!0&&A.isMeshDistanceMaterial===!0){let L=s.properties.get(A);L.light=x}return A}function M(S,T,x,w,A){if(S.visible===!1)return;if(S.layers.test(T.layers)&&(S.isMesh||S.isLine||S.isPoints)&&(S.castShadow||S.receiveShadow&&A===is)&&(!S.frustumCulled||S.intersectsFrustum(i))){S.modelViewMatrix.multiplyMatrices(x.matrixWorldInverse,S.matrixWorld);let D=t.update(S),P=S.material;if(Array.isArray(P)){let N=D.groups;for(let G=0,k=N.length;G<k;G++){let q=N[G],H=P[q.materialIndex];if(H&&H.visible){let Z=C(S,H,w,A);S.onBeforeShadow(s,S,T,x,D,Z,q),s.renderBufferDirect(x,null,D,Z,S,q),S.onAfterShadow(s,S,T,x,D,Z,q)}}}else if(P.visible){let N=C(S,P,w,A);S.onBeforeShadow(s,S,T,x,D,N,null),s.renderBufferDirect(x,null,D,N,S,null),S.onAfterShadow(s,S,T,x,D,N,null)}}let L=S.children;for(let D=0,P=L.length;D<P;D++)M(L[D],T,x,w,A)}function b(S){S.target.removeEventListener("dispose",b);for(let x in c){let w=c[x],A=S.target.uuid;A in w&&(w[A].dispose(),delete w[A])}}}function k0(s,t){function e(){let F=!1,ht=new pe,tt=null,ut=new pe(0,0,0,0);return{setMask:function(_t){tt!==_t&&!F&&(s.colorMask(_t,_t,_t,_t),tt=_t)},setLocked:function(_t){F=_t},setClear:function(_t,nt,Ct,wt,le){le===!0&&(_t*=wt,nt*=wt,Ct*=wt),ht.set(_t,nt,Ct,wt),ut.equals(ht)===!1&&(s.clearColor(_t,nt,Ct,wt),ut.copy(ht))},reset:function(){F=!1,tt=null,ut.set(-1,0,0,0)}}}function i(){let F=!1,ht=!1,tt=null,ut=null,_t=null;return{setReversed:function(nt){if(ht!==nt){let Ct=t.get("EXT_clip_control");nt?Ct.clipControlEXT(Ct.LOWER_LEFT_EXT,Ct.ZERO_TO_ONE_EXT):Ct.clipControlEXT(Ct.LOWER_LEFT_EXT,Ct.NEGATIVE_ONE_TO_ONE_EXT),ht=nt;let wt=_t;_t=null,this.setClear(wt)}},getReversed:function(){return ht},setTest:function(nt){nt?j(s.DEPTH_TEST):xt(s.DEPTH_TEST)},setMask:function(nt){tt!==nt&&!F&&(s.depthMask(nt),tt=nt)},setFunc:function(nt){if(ht&&(nt=bh[nt]),ut!==nt){switch(nt){case Ar:s.depthFunc(s.NEVER);break;case Cr:s.depthFunc(s.ALWAYS);break;case Rr:s.depthFunc(s.LESS);break;case Yn:s.depthFunc(s.LEQUAL);break;case Pr:s.depthFunc(s.EQUAL);break;case Ir:s.depthFunc(s.GEQUAL);break;case Lr:s.depthFunc(s.GREATER);break;case Dr:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}ut=nt}},setLocked:function(nt){F=nt},setClear:function(nt){_t!==nt&&(_t=nt,ht&&(nt=1-nt),s.clearDepth(nt))},reset:function(){F=!1,tt=null,ut=null,_t=null,ht=!1}}}function n(){let F=!1,ht=null,tt=null,ut=null,_t=null,nt=null,Ct=null,wt=null,le=null;return{setTest:function(jt){F||(jt?j(s.STENCIL_TEST):xt(s.STENCIL_TEST))},setMask:function(jt){ht!==jt&&!F&&(s.stencilMask(jt),ht=jt)},setFunc:function(jt,ci,yi){(tt!==jt||ut!==ci||_t!==yi)&&(s.stencilFunc(jt,ci,yi),tt=jt,ut=ci,_t=yi)},setOp:function(jt,ci,yi){(nt!==jt||Ct!==ci||wt!==yi)&&(s.stencilOp(jt,ci,yi),nt=jt,Ct=ci,wt=yi)},setLocked:function(jt){F=jt},setClear:function(jt){le!==jt&&(s.clearStencil(jt),le=jt)},reset:function(){F=!1,ht=null,tt=null,ut=null,_t=null,nt=null,Ct=null,wt=null,le=null}}}let r=new e,o=new i,a=new n,l=new WeakMap,c=new WeakMap,h={},d={},u={},p=new WeakMap,g=[],_=null,m=!1,f=null,v=null,C=null,M=null,b=null,S=null,T=null,x=new Mt(0,0,0),w=0,A=!1,I=null,L=null,D=null,P=null,N=null,G=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS),k=!1,q=0,H=s.getParameter(s.VERSION);H.indexOf("WebGL")!==-1?(q=parseFloat(/^WebGL (\d)/.exec(H)[1]),k=q>=1):H.indexOf("OpenGL ES")!==-1&&(q=parseFloat(/^OpenGL ES (\d)/.exec(H)[1]),k=q>=2);let Z=null,J={},rt=s.getParameter(s.SCISSOR_BOX),ot=s.getParameter(s.VIEWPORT),Bt=new pe().fromArray(rt),Dt=new pe().fromArray(ot);function Ut(F,ht,tt,ut){let _t=new Uint8Array(4),nt=s.createTexture();s.bindTexture(F,nt),s.texParameteri(F,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(F,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let Ct=0;Ct<tt;Ct++)F===s.TEXTURE_3D||F===s.TEXTURE_2D_ARRAY?s.texImage3D(ht,0,s.RGBA,1,1,ut,0,s.RGBA,s.UNSIGNED_BYTE,_t):s.texImage2D(ht+Ct,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,_t);return nt}let $={};$[s.TEXTURE_2D]=Ut(s.TEXTURE_2D,s.TEXTURE_2D,1),$[s.TEXTURE_CUBE_MAP]=Ut(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),$[s.TEXTURE_2D_ARRAY]=Ut(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),$[s.TEXTURE_3D]=Ut(s.TEXTURE_3D,s.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),j(s.DEPTH_TEST),o.setFunc(Yn),Xt(!1),fe(tl),j(s.CULL_FACE),Zt(Pi);function j(F){h[F]!==!0&&(s.enable(F),h[F]=!0)}function xt(F){h[F]!==!1&&(s.disable(F),h[F]=!1)}function Rt(F,ht){return u[F]!==ht?(s.bindFramebuffer(F,ht),u[F]=ht,F===s.DRAW_FRAMEBUFFER&&(u[s.FRAMEBUFFER]=ht),F===s.FRAMEBUFFER&&(u[s.DRAW_FRAMEBUFFER]=ht),!0):!1}function dt(F,ht){let tt=g,ut=!1;if(F){tt=p.get(ht),tt===void 0&&(tt=[],p.set(ht,tt));let _t=F.textures;if(tt.length!==_t.length||tt[0]!==s.COLOR_ATTACHMENT0){for(let nt=0,Ct=_t.length;nt<Ct;nt++)tt[nt]=s.COLOR_ATTACHMENT0+nt;tt.length=_t.length,ut=!0}}else tt[0]!==s.BACK&&(tt[0]=s.BACK,ut=!0);ut&&s.drawBuffers(tt)}function Ot(F){return _!==F?(s.useProgram(F),_=F,!0):!1}let xe={[Tn]:s.FUNC_ADD,[Wc]:s.FUNC_SUBTRACT,[Xc]:s.FUNC_REVERSE_SUBTRACT};xe[qc]=s.MIN,xe[Yc]=s.MAX;let kt={[Zc]:s.ZERO,[$c]:s.ONE,[Jc]:s.SRC_COLOR,[sl]:s.SRC_ALPHA,[ih]:s.SRC_ALPHA_SATURATE,[th]:s.DST_COLOR,[Qc]:s.DST_ALPHA,[Kc]:s.ONE_MINUS_SRC_COLOR,[rl]:s.ONE_MINUS_SRC_ALPHA,[eh]:s.ONE_MINUS_DST_COLOR,[jc]:s.ONE_MINUS_DST_ALPHA,[nh]:s.CONSTANT_COLOR,[sh]:s.ONE_MINUS_CONSTANT_COLOR,[rh]:s.CONSTANT_ALPHA,[oh]:s.ONE_MINUS_CONSTANT_ALPHA};function Zt(F,ht,tt,ut,_t,nt,Ct,wt,le,jt){if(F===Pi){m===!0&&(xt(s.BLEND),m=!1);return}if(m===!1&&(j(s.BLEND),m=!0),F!==Vc){if(F!==f||jt!==A){if((v!==Tn||b!==Tn)&&(s.blendEquation(s.FUNC_ADD),v=Tn,b=Tn),jt)switch(F){case ln:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case el:s.blendFunc(s.ONE,s.ONE);break;case il:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case nl:s.blendFuncSeparate(s.DST_COLOR,s.ONE_MINUS_SRC_ALPHA,s.ZERO,s.ONE);break;default:Nt("WebGLState: Invalid blending: ",F);break}else switch(F){case ln:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case el:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE,s.ONE,s.ONE);break;case il:Nt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case nl:Nt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Nt("WebGLState: Invalid blending: ",F);break}C=null,M=null,S=null,T=null,x.set(0,0,0),w=0,f=F,A=jt}return}_t=_t||ht,nt=nt||tt,Ct=Ct||ut,(ht!==v||_t!==b)&&(s.blendEquationSeparate(xe[ht],xe[_t]),v=ht,b=_t),(tt!==C||ut!==M||nt!==S||Ct!==T)&&(s.blendFuncSeparate(kt[tt],kt[ut],kt[nt],kt[Ct]),C=tt,M=ut,S=nt,T=Ct),(wt.equals(x)===!1||le!==w)&&(s.blendColor(wt.r,wt.g,wt.b,le),x.copy(wt),w=le),f=F,A=!1}function ie(F,ht){F.side===ti?xt(s.CULL_FACE):j(s.CULL_FACE);let tt=F.side===He;ht&&(tt=!tt),Xt(tt),F.blending===ln&&F.transparent===!1?Zt(Pi):Zt(F.blending,F.blendEquation,F.blendSrc,F.blendDst,F.blendEquationAlpha,F.blendSrcAlpha,F.blendDstAlpha,F.blendColor,F.blendAlpha,F.premultipliedAlpha),o.setFunc(F.depthFunc),o.setTest(F.depthTest),o.setMask(F.depthWrite),r.setMask(F.colorWrite);let ut=F.stencilWrite;a.setTest(ut),ut&&(a.setMask(F.stencilWriteMask),a.setFunc(F.stencilFunc,F.stencilRef,F.stencilFuncMask),a.setOp(F.stencilFail,F.stencilZFail,F.stencilZPass)),Ve(F.polygonOffset,F.polygonOffsetFactor,F.polygonOffsetUnits),F.alphaToCoverage===!0?j(s.SAMPLE_ALPHA_TO_COVERAGE):xt(s.SAMPLE_ALPHA_TO_COVERAGE)}function Xt(F){I!==F&&(F?s.frontFace(s.CW):s.frontFace(s.CCW),I=F)}function fe(F){F!==kc?(j(s.CULL_FACE),F!==L&&(F===tl?s.cullFace(s.BACK):F===Hc?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):xt(s.CULL_FACE),L=F}function Te(F){F!==D&&(k&&s.lineWidth(F),D=F)}function Ve(F,ht,tt){F?(j(s.POLYGON_OFFSET_FILL),(P!==ht||N!==tt)&&(P=ht,N=tt,o.getReversed()&&(ht=-ht),s.polygonOffset(ht,tt))):xt(s.POLYGON_OFFSET_FILL)}function me(F){F?j(s.SCISSOR_TEST):xt(s.SCISSOR_TEST)}function ye(F){F===void 0&&(F=s.TEXTURE0+G-1),Z!==F&&(s.activeTexture(F),Z=F)}function B(F,ht,tt){tt===void 0&&(Z===null?tt=s.TEXTURE0+G-1:tt=Z);let ut=J[tt];ut===void 0&&(ut={type:void 0,texture:void 0},J[tt]=ut),(ut.type!==F||ut.texture!==ht)&&(Z!==tt&&(s.activeTexture(tt),Z=tt),s.bindTexture(F,ht||$[F]),ut.type=F,ut.texture=ht)}function De(){let F=J[Z];F!==void 0&&F.type!==void 0&&(s.bindTexture(F.type,null),F.type=void 0,F.texture=void 0)}function ne(){try{s.compressedTexImage2D(...arguments)}catch(F){Nt("WebGLState:",F)}}function R(){try{s.compressedTexImage3D(...arguments)}catch(F){Nt("WebGLState:",F)}}function y(){try{s.texSubImage2D(...arguments)}catch(F){Nt("WebGLState:",F)}}function z(){try{s.texSubImage3D(...arguments)}catch(F){Nt("WebGLState:",F)}}function X(){try{s.compressedTexSubImage2D(...arguments)}catch(F){Nt("WebGLState:",F)}}function K(){try{s.compressedTexSubImage3D(...arguments)}catch(F){Nt("WebGLState:",F)}}function st(){try{s.texStorage2D(...arguments)}catch(F){Nt("WebGLState:",F)}}function at(){try{s.texStorage3D(...arguments)}catch(F){Nt("WebGLState:",F)}}function Q(){try{s.texImage2D(...arguments)}catch(F){Nt("WebGLState:",F)}}function et(){try{s.texImage3D(...arguments)}catch(F){Nt("WebGLState:",F)}}function lt(F){return d[F]!==void 0?d[F]:s.getParameter(F)}function Tt(F,ht){d[F]!==ht&&(s.pixelStorei(F,ht),d[F]=ht)}function ft(F){Bt.equals(F)===!1&&(s.scissor(F.x,F.y,F.z,F.w),Bt.copy(F))}function ct(F){Dt.equals(F)===!1&&(s.viewport(F.x,F.y,F.z,F.w),Dt.copy(F))}function At(F,ht){let tt=c.get(ht);tt===void 0&&(tt=new WeakMap,c.set(ht,tt));let ut=tt.get(F);ut===void 0&&(ut=s.getUniformBlockIndex(ht,F.name),tt.set(F,ut))}function Pt(F,ht){let ut=c.get(ht).get(F);l.get(ht)!==ut&&(s.uniformBlockBinding(ht,ut,F.__bindingPointIndex),l.set(ht,ut))}function zt(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),o.setReversed(!1),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),s.pixelStorei(s.PACK_ALIGNMENT,4),s.pixelStorei(s.UNPACK_ALIGNMENT,4),s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,!1),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,s.BROWSER_DEFAULT_WEBGL),s.pixelStorei(s.PACK_ROW_LENGTH,0),s.pixelStorei(s.PACK_SKIP_PIXELS,0),s.pixelStorei(s.PACK_SKIP_ROWS,0),s.pixelStorei(s.UNPACK_ROW_LENGTH,0),s.pixelStorei(s.UNPACK_IMAGE_HEIGHT,0),s.pixelStorei(s.UNPACK_SKIP_PIXELS,0),s.pixelStorei(s.UNPACK_SKIP_ROWS,0),s.pixelStorei(s.UNPACK_SKIP_IMAGES,0),h={},d={},Z=null,J={},u={},p=new WeakMap,g=[],_=null,m=!1,f=null,v=null,C=null,M=null,b=null,S=null,T=null,x=new Mt(0,0,0),w=0,A=!1,I=null,L=null,D=null,P=null,N=null,Bt.set(0,0,s.canvas.width,s.canvas.height),Dt.set(0,0,s.canvas.width,s.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:j,disable:xt,bindFramebuffer:Rt,drawBuffers:dt,useProgram:Ot,setBlending:Zt,setMaterial:ie,setFlipSided:Xt,setCullFace:fe,setLineWidth:Te,setPolygonOffset:Ve,setScissorTest:me,activeTexture:ye,bindTexture:B,unbindTexture:De,compressedTexImage2D:ne,compressedTexImage3D:R,texImage2D:Q,texImage3D:et,pixelStorei:Tt,getParameter:lt,updateUBOMapping:At,uniformBlockBinding:Pt,texStorage2D:st,texStorage3D:at,texSubImage2D:y,texSubImage3D:z,compressedTexSubImage2D:X,compressedTexSubImage3D:K,scissor:ft,viewport:ct,reset:zt}}function H0(s,t,e,i,n,r,o){let a=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Gt,h=new WeakMap,d=new Set,u,p=new WeakMap,g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function _(R,y){return g?new OffscreenCanvas(R,y):Ss("canvas")}function m(R,y,z){let X=1,K=ne(R);if((K.width>z||K.height>z)&&(X=z/Math.max(K.width,K.height)),X<1)if(typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&R instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&R instanceof ImageBitmap||typeof VideoFrame<"u"&&R instanceof VideoFrame){let st=Math.floor(X*K.width),at=Math.floor(X*K.height);u===void 0&&(u=_(st,at));let Q=y?_(st,at):u;return Q.width=st,Q.height=at,Q.getContext("2d").drawImage(R,0,0,st,at),It("WebGLRenderer: Texture has been resized from ("+K.width+"x"+K.height+") to ("+st+"x"+at+")."),Q}else return"data"in R&&It("WebGLRenderer: Image in DataTexture is too big ("+K.width+"x"+K.height+")."),R;return R}function f(R){return R.generateMipmaps}function v(R){s.generateMipmap(R)}function C(R){return R.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:R.isWebGL3DRenderTarget?s.TEXTURE_3D:R.isWebGLArrayRenderTarget||R.isCompressedArrayTexture?s.TEXTURE_2D_ARRAY:s.TEXTURE_2D}function M(R,y,z,X,K,st=!1){if(R!==null){if(s[R]!==void 0)return s[R];It("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+R+"'")}let at;X&&(at=t.get("EXT_texture_norm16"),at||It("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let Q=y;if(y===s.RED&&(z===s.FLOAT&&(Q=s.R32F),z===s.HALF_FLOAT&&(Q=s.R16F),z===s.UNSIGNED_BYTE&&(Q=s.R8),z===s.UNSIGNED_SHORT&&at&&(Q=at.R16_EXT),z===s.SHORT&&at&&(Q=at.R16_SNORM_EXT)),y===s.RED_INTEGER&&(z===s.UNSIGNED_BYTE&&(Q=s.R8UI),z===s.UNSIGNED_SHORT&&(Q=s.R16UI),z===s.UNSIGNED_INT&&(Q=s.R32UI),z===s.BYTE&&(Q=s.R8I),z===s.SHORT&&(Q=s.R16I),z===s.INT&&(Q=s.R32I)),y===s.RG&&(z===s.FLOAT&&(Q=s.RG32F),z===s.HALF_FLOAT&&(Q=s.RG16F),z===s.UNSIGNED_BYTE&&(Q=s.RG8),z===s.UNSIGNED_SHORT&&at&&(Q=at.RG16_EXT),z===s.SHORT&&at&&(Q=at.RG16_SNORM_EXT)),y===s.RG_INTEGER&&(z===s.UNSIGNED_BYTE&&(Q=s.RG8UI),z===s.UNSIGNED_SHORT&&(Q=s.RG16UI),z===s.UNSIGNED_INT&&(Q=s.RG32UI),z===s.BYTE&&(Q=s.RG8I),z===s.SHORT&&(Q=s.RG16I),z===s.INT&&(Q=s.RG32I)),y===s.RGB_INTEGER&&(z===s.UNSIGNED_BYTE&&(Q=s.RGB8UI),z===s.UNSIGNED_SHORT&&(Q=s.RGB16UI),z===s.UNSIGNED_INT&&(Q=s.RGB32UI),z===s.BYTE&&(Q=s.RGB8I),z===s.SHORT&&(Q=s.RGB16I),z===s.INT&&(Q=s.RGB32I)),y===s.RGBA_INTEGER&&(z===s.UNSIGNED_BYTE&&(Q=s.RGBA8UI),z===s.UNSIGNED_SHORT&&(Q=s.RGBA16UI),z===s.UNSIGNED_INT&&(Q=s.RGBA32UI),z===s.BYTE&&(Q=s.RGBA8I),z===s.SHORT&&(Q=s.RGBA16I),z===s.INT&&(Q=s.RGBA32I)),y===s.RGB&&(z===s.UNSIGNED_SHORT&&at&&(Q=at.RGB16_EXT),z===s.SHORT&&at&&(Q=at.RGB16_SNORM_EXT),z===s.UNSIGNED_INT_5_9_9_9_REV&&(Q=s.RGB9_E5),z===s.UNSIGNED_INT_10F_11F_11F_REV&&(Q=s.R11F_G11F_B10F)),y===s.RGBA){let et=st?Ms:qt.getTransfer(K);z===s.FLOAT&&(Q=s.RGBA32F),z===s.HALF_FLOAT&&(Q=s.RGBA16F),z===s.UNSIGNED_BYTE&&(Q=et===ee?s.SRGB8_ALPHA8:s.RGBA8),z===s.UNSIGNED_SHORT&&at&&(Q=at.RGBA16_EXT),z===s.SHORT&&at&&(Q=at.RGBA16_SNORM_EXT),z===s.UNSIGNED_SHORT_4_4_4_4&&(Q=s.RGBA4),z===s.UNSIGNED_SHORT_5_5_5_1&&(Q=s.RGB5_A1)}return(Q===s.R16F||Q===s.R32F||Q===s.RG16F||Q===s.RG32F||Q===s.RGBA16F||Q===s.RGBA32F)&&t.get("EXT_color_buffer_float"),Q}function b(R,y){let z;return R?y===null||y===xi||y===ss?z=s.DEPTH24_STENCIL8:y===oi?z=s.DEPTH32F_STENCIL8:y===ns&&(z=s.DEPTH24_STENCIL8,It("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):y===null||y===xi||y===ss?z=s.DEPTH_COMPONENT24:y===oi?z=s.DEPTH_COMPONENT32F:y===ns&&(z=s.DEPTH_COMPONENT16),z}function S(R,y){return f(R)===!0||R.isFramebufferTexture&&R.minFilter!==Ce&&R.minFilter!==Se?Math.log2(Math.max(y.width,y.height))+1:R.mipmaps!==void 0&&R.mipmaps.length>0?R.mipmaps.length:R.isCompressedTexture&&Array.isArray(R.image)?y.mipmaps.length:1}function T(R){let y=R.target;y.removeEventListener("dispose",T),w(y),y.isVideoTexture&&h.delete(y),y.isHTMLTexture&&d.delete(y)}function x(R){let y=R.target;y.removeEventListener("dispose",x),I(y)}function w(R){let y=i.get(R);if(y.__webglInit===void 0)return;let z=R.source,X=p.get(z);if(X){let K=X[y.__cacheKey];K.usedTimes--,K.usedTimes===0&&A(R),Object.keys(X).length===0&&p.delete(z)}i.remove(R)}function A(R){let y=i.get(R);s.deleteTexture(y.__webglTexture);let z=R.source,X=p.get(z);delete X[y.__cacheKey],o.memory.textures--}function I(R){let y=i.get(R);if(R.depthTexture&&(R.depthTexture.dispose(),i.remove(R.depthTexture)),R.isWebGLCubeRenderTarget)for(let X=0;X<6;X++){if(Array.isArray(y.__webglFramebuffer[X]))for(let K=0;K<y.__webglFramebuffer[X].length;K++)s.deleteFramebuffer(y.__webglFramebuffer[X][K]);else s.deleteFramebuffer(y.__webglFramebuffer[X]);y.__webglDepthbuffer&&s.deleteRenderbuffer(y.__webglDepthbuffer[X])}else{if(Array.isArray(y.__webglFramebuffer))for(let X=0;X<y.__webglFramebuffer.length;X++)s.deleteFramebuffer(y.__webglFramebuffer[X]);else s.deleteFramebuffer(y.__webglFramebuffer);if(y.__webglDepthbuffer&&s.deleteRenderbuffer(y.__webglDepthbuffer),y.__webglMultisampledFramebuffer&&s.deleteFramebuffer(y.__webglMultisampledFramebuffer),y.__webglColorRenderbuffer)for(let X=0;X<y.__webglColorRenderbuffer.length;X++)y.__webglColorRenderbuffer[X]&&s.deleteRenderbuffer(y.__webglColorRenderbuffer[X]);y.__webglDepthRenderbuffer&&s.deleteRenderbuffer(y.__webglDepthRenderbuffer)}let z=R.textures;for(let X=0,K=z.length;X<K;X++){let st=i.get(z[X]);st.__webglTexture&&(s.deleteTexture(st.__webglTexture),o.memory.textures--),i.remove(z[X])}i.remove(R)}let L=0;function D(){L=0}function P(){return L}function N(R){L=R}function G(){let R=L;return R>=n.maxTextures&&It("WebGLTextures: Trying to use "+(R+1)+" texture units while this GPU supports only "+n.maxTextures),L+=1,R}function k(R){let y=[];return y.push(R.wrapS),y.push(R.wrapT),y.push(R.wrapR||0),y.push(R.magFilter),y.push(R.minFilter),y.push(R.anisotropy),y.push(R.internalFormat),y.push(R.format),y.push(R.type),y.push(R.generateMipmaps),y.push(R.premultiplyAlpha),y.push(R.flipY),y.push(R.unpackAlignment),y.push(R.colorSpace),y.join()}function q(R,y){let z=i.get(R);if(R.isVideoTexture&&B(R),R.isRenderTargetTexture===!1&&R.isExternalTexture!==!0&&R.version>0&&z.__version!==R.version){let X=R.image;if(X===null)It("WebGLRenderer: Texture marked for update but no image data found.");else if(X.complete===!1)It("WebGLRenderer: Texture marked for update but image is incomplete");else{xt(z,R,y);return}}else R.isExternalTexture&&(z.__webglTexture=R.sourceTexture?R.sourceTexture:null);e.bindTexture(s.TEXTURE_2D,z.__webglTexture,s.TEXTURE0+y)}function H(R,y){let z=i.get(R);if(R.isRenderTargetTexture===!1&&R.version>0&&z.__version!==R.version){xt(z,R,y);return}else R.isExternalTexture&&(z.__webglTexture=R.sourceTexture?R.sourceTexture:null);e.bindTexture(s.TEXTURE_2D_ARRAY,z.__webglTexture,s.TEXTURE0+y)}function Z(R,y){let z=i.get(R);if(R.isRenderTargetTexture===!1&&R.version>0&&z.__version!==R.version){xt(z,R,y);return}e.bindTexture(s.TEXTURE_3D,z.__webglTexture,s.TEXTURE0+y)}function J(R,y){let z=i.get(R);if(R.isCubeDepthTexture!==!0&&R.version>0&&z.__version!==R.version){Rt(z,R,y);return}e.bindTexture(s.TEXTURE_CUBE_MAP,z.__webglTexture,s.TEXTURE0+y)}let rt={[_n]:s.REPEAT,[Si]:s.CLAMP_TO_EDGE,[Nr]:s.MIRRORED_REPEAT},ot={[Ce]:s.NEAREST,[ch]:s.NEAREST_MIPMAP_NEAREST,[zs]:s.NEAREST_MIPMAP_LINEAR,[Se]:s.LINEAR,[fo]:s.LINEAR_MIPMAP_NEAREST,[Ii]:s.LINEAR_MIPMAP_LINEAR},Bt={[fh]:s.NEVER,[_h]:s.ALWAYS,[ph]:s.LESS,[Qo]:s.LEQUAL,[mh]:s.EQUAL,[jo]:s.GEQUAL,[gh]:s.GREATER,[xh]:s.NOTEQUAL};function Dt(R,y){if(y.type===oi&&t.has("OES_texture_float_linear")===!1&&(y.magFilter===Se||y.magFilter===fo||y.magFilter===zs||y.magFilter===Ii||y.minFilter===Se||y.minFilter===fo||y.minFilter===zs||y.minFilter===Ii)&&It("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(R,s.TEXTURE_WRAP_S,rt[y.wrapS]),s.texParameteri(R,s.TEXTURE_WRAP_T,rt[y.wrapT]),(R===s.TEXTURE_3D||R===s.TEXTURE_2D_ARRAY)&&s.texParameteri(R,s.TEXTURE_WRAP_R,rt[y.wrapR]),s.texParameteri(R,s.TEXTURE_MAG_FILTER,ot[y.magFilter]),s.texParameteri(R,s.TEXTURE_MIN_FILTER,ot[y.minFilter]),y.compareFunction&&(s.texParameteri(R,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(R,s.TEXTURE_COMPARE_FUNC,Bt[y.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(y.magFilter===Ce||y.minFilter!==zs&&y.minFilter!==Ii||y.type===oi&&t.has("OES_texture_float_linear")===!1)return;if(y.anisotropy>1||i.get(y).__currentAnisotropy){let z=t.get("EXT_texture_filter_anisotropic");s.texParameterf(R,z.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(y.anisotropy,n.getMaxAnisotropy())),i.get(y).__currentAnisotropy=y.anisotropy}}}function Ut(R,y){let z=!1;R.__webglInit===void 0&&(R.__webglInit=!0,y.addEventListener("dispose",T));let X=y.source,K=p.get(X);K===void 0&&(K={},p.set(X,K));let st=k(y);if(st!==R.__cacheKey){K[st]===void 0&&(K[st]={texture:s.createTexture(),usedTimes:0},o.memory.textures++,z=!0),K[st].usedTimes++;let at=K[R.__cacheKey];at!==void 0&&(K[R.__cacheKey].usedTimes--,at.usedTimes===0&&A(y)),R.__cacheKey=st,R.__webglTexture=K[st].texture}return z}function $(R,y,z){return Math.floor(Math.floor(R/z)/y)}function j(R,y,z,X){let st=R.updateRanges;if(st.length===0)e.texSubImage2D(s.TEXTURE_2D,0,0,0,y.width,y.height,z,X,y.data);else{st.sort((Tt,ft)=>Tt.start-ft.start);let at=0;for(let Tt=1;Tt<st.length;Tt++){let ft=st[at],ct=st[Tt],At=ft.start+ft.count,Pt=$(ct.start,y.width,4),zt=$(ft.start,y.width,4);ct.start<=At+1&&Pt===zt&&$(ct.start+ct.count-1,y.width,4)===Pt?ft.count=Math.max(ft.count,ct.start+ct.count-ft.start):(++at,st[at]=ct)}st.length=at+1;let Q=e.getParameter(s.UNPACK_ROW_LENGTH),et=e.getParameter(s.UNPACK_SKIP_PIXELS),lt=e.getParameter(s.UNPACK_SKIP_ROWS);e.pixelStorei(s.UNPACK_ROW_LENGTH,y.width);for(let Tt=0,ft=st.length;Tt<ft;Tt++){let ct=st[Tt],At=Math.floor(ct.start/4),Pt=Math.ceil(ct.count/4),zt=At%y.width,F=Math.floor(At/y.width),ht=Pt,tt=1;e.pixelStorei(s.UNPACK_SKIP_PIXELS,zt),e.pixelStorei(s.UNPACK_SKIP_ROWS,F),e.texSubImage2D(s.TEXTURE_2D,0,zt,F,ht,tt,z,X,y.data)}R.clearUpdateRanges(),e.pixelStorei(s.UNPACK_ROW_LENGTH,Q),e.pixelStorei(s.UNPACK_SKIP_PIXELS,et),e.pixelStorei(s.UNPACK_SKIP_ROWS,lt)}}function xt(R,y,z){let X=s.TEXTURE_2D;(y.isDataArrayTexture||y.isCompressedArrayTexture)&&(X=s.TEXTURE_2D_ARRAY),y.isData3DTexture&&(X=s.TEXTURE_3D);let K=Ut(R,y),st=y.source;e.bindTexture(X,R.__webglTexture,s.TEXTURE0+z);let at=i.get(st);if(st.version!==at.__version||K===!0){if(e.activeTexture(s.TEXTURE0+z),(typeof ImageBitmap<"u"&&y.image instanceof ImageBitmap)===!1){let tt=qt.getPrimaries(qt.workingColorSpace),ut=y.colorSpace===Wi?null:qt.getPrimaries(y.colorSpace),_t=y.colorSpace===Wi||tt===ut?s.NONE:s.BROWSER_DEFAULT_WEBGL;e.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,y.flipY),e.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),e.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,_t)}e.pixelStorei(s.UNPACK_ALIGNMENT,y.unpackAlignment);let et=m(y.image,!1,n.maxTextureSize);et=De(y,et);let lt=r.convert(y.format,y.colorSpace),Tt=r.convert(y.type),ft=M(y.internalFormat,lt,Tt,y.normalized,y.colorSpace,y.isVideoTexture);Dt(X,y);let ct,At=y.mipmaps,Pt=y.isVideoTexture!==!0,zt=at.__version===void 0||K===!0,F=st.dataReady,ht=S(y,et);if(y.isDepthTexture)ft=b(y.format===hn,y.type),zt&&(Pt?e.texStorage2D(s.TEXTURE_2D,1,ft,et.width,et.height):e.texImage2D(s.TEXTURE_2D,0,ft,et.width,et.height,0,lt,Tt,null));else if(y.isDataTexture)if(At.length>0){Pt&&zt&&e.texStorage2D(s.TEXTURE_2D,ht,ft,At[0].width,At[0].height);for(let tt=0,ut=At.length;tt<ut;tt++)ct=At[tt],Pt?F&&e.texSubImage2D(s.TEXTURE_2D,tt,0,0,ct.width,ct.height,lt,Tt,ct.data):e.texImage2D(s.TEXTURE_2D,tt,ft,ct.width,ct.height,0,lt,Tt,ct.data);y.generateMipmaps=!1}else Pt?(zt&&e.texStorage2D(s.TEXTURE_2D,ht,ft,et.width,et.height),F&&j(y,et,lt,Tt)):e.texImage2D(s.TEXTURE_2D,0,ft,et.width,et.height,0,lt,Tt,et.data);else if(y.isCompressedTexture)if(y.isCompressedArrayTexture){Pt&&zt&&e.texStorage3D(s.TEXTURE_2D_ARRAY,ht,ft,At[0].width,At[0].height,et.depth);for(let tt=0,ut=At.length;tt<ut;tt++)if(ct=At[tt],y.format!==$e)if(lt!==null)if(Pt){if(F)if(y.layerUpdates.size>0){let _t=El(ct.width,ct.height,y.format,y.type);for(let nt of y.layerUpdates){let Ct=ct.data.subarray(nt*_t/ct.data.BYTES_PER_ELEMENT,(nt+1)*_t/ct.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,tt,0,0,nt,ct.width,ct.height,1,lt,Ct)}}else e.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,tt,0,0,0,ct.width,ct.height,et.depth,lt,ct.data)}else e.compressedTexImage3D(s.TEXTURE_2D_ARRAY,tt,ft,ct.width,ct.height,et.depth,0,ct.data,0,0);else It("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Pt?F&&e.texSubImage3D(s.TEXTURE_2D_ARRAY,tt,0,0,0,ct.width,ct.height,et.depth,lt,Tt,ct.data):e.texImage3D(s.TEXTURE_2D_ARRAY,tt,ft,ct.width,ct.height,et.depth,0,lt,Tt,ct.data);y.layerUpdates.size>0&&y.clearLayerUpdates()}else{Pt&&zt&&e.texStorage2D(s.TEXTURE_2D,ht,ft,At[0].width,At[0].height);for(let tt=0,ut=At.length;tt<ut;tt++)ct=At[tt],y.format!==$e?lt!==null?Pt?F&&e.compressedTexSubImage2D(s.TEXTURE_2D,tt,0,0,ct.width,ct.height,lt,ct.data):e.compressedTexImage2D(s.TEXTURE_2D,tt,ft,ct.width,ct.height,0,ct.data):It("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Pt?F&&e.texSubImage2D(s.TEXTURE_2D,tt,0,0,ct.width,ct.height,lt,Tt,ct.data):e.texImage2D(s.TEXTURE_2D,tt,ft,ct.width,ct.height,0,lt,Tt,ct.data)}else if(y.isDataArrayTexture)if(Pt){if(zt&&e.texStorage3D(s.TEXTURE_2D_ARRAY,ht,ft,et.width,et.height,et.depth),F)if(y.layerUpdates.size>0){let tt=El(et.width,et.height,y.format,y.type);for(let ut of y.layerUpdates){let _t=et.data.subarray(ut*tt/et.data.BYTES_PER_ELEMENT,(ut+1)*tt/et.data.BYTES_PER_ELEMENT);e.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,ut,et.width,et.height,1,lt,Tt,_t)}y.clearLayerUpdates()}else e.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,et.width,et.height,et.depth,lt,Tt,et.data)}else e.texImage3D(s.TEXTURE_2D_ARRAY,0,ft,et.width,et.height,et.depth,0,lt,Tt,et.data);else if(y.isData3DTexture)Pt?(zt&&e.texStorage3D(s.TEXTURE_3D,ht,ft,et.width,et.height,et.depth),F&&e.texSubImage3D(s.TEXTURE_3D,0,0,0,0,et.width,et.height,et.depth,lt,Tt,et.data)):e.texImage3D(s.TEXTURE_3D,0,ft,et.width,et.height,et.depth,0,lt,Tt,et.data);else if(y.isFramebufferTexture){if(zt)if(Pt)e.texStorage2D(s.TEXTURE_2D,ht,ft,et.width,et.height);else{let tt=et.width,ut=et.height;for(let _t=0;_t<ht;_t++)e.texImage2D(s.TEXTURE_2D,_t,ft,tt,ut,0,lt,Tt,null),tt>>=1,ut>>=1}}else if(y.isHTMLTexture){if("texElementImage2D"in s){let tt=s.canvas;if(tt.hasAttribute("layoutsubtree")||tt.setAttribute("layoutsubtree","true"),et.parentNode!==tt){tt.appendChild(et),d.add(y),tt.onpaint=ut=>{let _t=ut.changedElements;for(let nt of d)_t.includes(nt.image)&&(nt.needsUpdate=!0)},tt.requestPaint();return}if(s.texElementImage2D.length===3)s.texElementImage2D(s.TEXTURE_2D,s.RGBA8,et);else{let _t=s.RGBA,nt=s.RGBA,Ct=s.UNSIGNED_BYTE;s.texElementImage2D(s.TEXTURE_2D,0,_t,nt,Ct,et)}s.texParameteri(s.TEXTURE_2D,s.TEXTURE_MIN_FILTER,s.LINEAR),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_S,s.CLAMP_TO_EDGE),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_T,s.CLAMP_TO_EDGE)}}else if(At.length>0){if(Pt&&zt){let tt=ne(At[0]);e.texStorage2D(s.TEXTURE_2D,ht,ft,tt.width,tt.height)}for(let tt=0,ut=At.length;tt<ut;tt++)ct=At[tt],Pt?F&&e.texSubImage2D(s.TEXTURE_2D,tt,0,0,lt,Tt,ct):e.texImage2D(s.TEXTURE_2D,tt,ft,lt,Tt,ct);y.generateMipmaps=!1}else if(Pt){if(zt){let tt=ne(et);e.texStorage2D(s.TEXTURE_2D,ht,ft,tt.width,tt.height)}F&&e.texSubImage2D(s.TEXTURE_2D,0,0,0,lt,Tt,et)}else e.texImage2D(s.TEXTURE_2D,0,ft,lt,Tt,et);f(y)&&v(X),at.__version=st.version,y.onUpdate&&y.onUpdate(y)}R.__version=y.version}function Rt(R,y,z){if(y.image.length!==6)return;let X=Ut(R,y),K=y.source;e.bindTexture(s.TEXTURE_CUBE_MAP,R.__webglTexture,s.TEXTURE0+z);let st=i.get(K);if(K.version!==st.__version||X===!0){e.activeTexture(s.TEXTURE0+z);let at=qt.getPrimaries(qt.workingColorSpace),Q=y.colorSpace===Wi?null:qt.getPrimaries(y.colorSpace),et=y.colorSpace===Wi||at===Q?s.NONE:s.BROWSER_DEFAULT_WEBGL;e.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,y.flipY),e.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),e.pixelStorei(s.UNPACK_ALIGNMENT,y.unpackAlignment),e.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,et);let lt=y.isCompressedTexture||y.image[0].isCompressedTexture,Tt=y.image[0]&&y.image[0].isDataTexture,ft=[];for(let nt=0;nt<6;nt++)!lt&&!Tt?ft[nt]=m(y.image[nt],!0,n.maxCubemapSize):ft[nt]=Tt?y.image[nt].image:y.image[nt],ft[nt]=De(y,ft[nt]);let ct=ft[0],At=r.convert(y.format,y.colorSpace),Pt=r.convert(y.type),zt=M(y.internalFormat,At,Pt,y.normalized,y.colorSpace),F=y.isVideoTexture!==!0,ht=st.__version===void 0||X===!0,tt=K.dataReady,ut=S(y,ct);Dt(s.TEXTURE_CUBE_MAP,y);let _t;if(lt){F&&ht&&e.texStorage2D(s.TEXTURE_CUBE_MAP,ut,zt,ct.width,ct.height);for(let nt=0;nt<6;nt++){_t=ft[nt].mipmaps;for(let Ct=0;Ct<_t.length;Ct++){let wt=_t[Ct];y.format!==$e?At!==null?F?tt&&e.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+nt,Ct,0,0,wt.width,wt.height,At,wt.data):e.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+nt,Ct,zt,wt.width,wt.height,0,wt.data):It("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):F?tt&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+nt,Ct,0,0,wt.width,wt.height,At,Pt,wt.data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+nt,Ct,zt,wt.width,wt.height,0,At,Pt,wt.data)}}}else{if(_t=y.mipmaps,F&&ht){_t.length>0&&ut++;let nt=ne(ft[0]);e.texStorage2D(s.TEXTURE_CUBE_MAP,ut,zt,nt.width,nt.height)}for(let nt=0;nt<6;nt++)if(Tt){F?tt&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+nt,0,0,0,ft[nt].width,ft[nt].height,At,Pt,ft[nt].data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+nt,0,zt,ft[nt].width,ft[nt].height,0,At,Pt,ft[nt].data);for(let Ct=0;Ct<_t.length;Ct++){let le=_t[Ct].image[nt].image;F?tt&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+nt,Ct+1,0,0,le.width,le.height,At,Pt,le.data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+nt,Ct+1,zt,le.width,le.height,0,At,Pt,le.data)}}else{F?tt&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+nt,0,0,0,At,Pt,ft[nt]):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+nt,0,zt,At,Pt,ft[nt]);for(let Ct=0;Ct<_t.length;Ct++){let wt=_t[Ct];F?tt&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+nt,Ct+1,0,0,At,Pt,wt.image[nt]):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+nt,Ct+1,zt,At,Pt,wt.image[nt])}}}f(y)&&v(s.TEXTURE_CUBE_MAP),st.__version=K.version,y.onUpdate&&y.onUpdate(y)}R.__version=y.version}function dt(R,y,z,X,K,st){let at=r.convert(z.format,z.colorSpace),Q=r.convert(z.type),et=M(z.internalFormat,at,Q,z.normalized,z.colorSpace),lt=i.get(y),Tt=i.get(z);if(Tt.__renderTarget=y,!lt.__hasExternalTextures){let ft=Math.max(1,y.width>>st),ct=Math.max(1,y.height>>st);K===s.TEXTURE_3D||K===s.TEXTURE_2D_ARRAY?e.texImage3D(K,st,et,ft,ct,y.depth,0,at,Q,null):e.texImage2D(K,st,et,ft,ct,0,at,Q,null)}e.bindFramebuffer(s.FRAMEBUFFER,R),ye(y)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,X,K,Tt.__webglTexture,0,me(y)):(K===s.TEXTURE_2D||K>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&K<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,X,K,Tt.__webglTexture,st),e.bindFramebuffer(s.FRAMEBUFFER,null)}function Ot(R,y,z){if(s.bindRenderbuffer(s.RENDERBUFFER,R),y.depthBuffer){let X=y.depthTexture,K=X&&X.isDepthTexture?X.type:null,st=b(y.stencilBuffer,K),at=y.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;ye(y)?a.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,me(y),st,y.width,y.height):z?s.renderbufferStorageMultisample(s.RENDERBUFFER,me(y),st,y.width,y.height):s.renderbufferStorage(s.RENDERBUFFER,st,y.width,y.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,at,s.RENDERBUFFER,R)}else{let X=y.textures;for(let K=0;K<X.length;K++){let st=X[K],at=r.convert(st.format,st.colorSpace),Q=r.convert(st.type),et=M(st.internalFormat,at,Q,st.normalized,st.colorSpace);ye(y)?a.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,me(y),et,y.width,y.height):z?s.renderbufferStorageMultisample(s.RENDERBUFFER,me(y),et,y.width,y.height):s.renderbufferStorage(s.RENDERBUFFER,et,y.width,y.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function xe(R,y,z){let X=y.isWebGLCubeRenderTarget===!0;if(e.bindFramebuffer(s.FRAMEBUFFER,R),!(y.depthTexture&&y.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let K=i.get(y.depthTexture);if(K.__renderTarget=y,(!K.__webglTexture||y.depthTexture.image.width!==y.width||y.depthTexture.image.height!==y.height)&&(y.depthTexture.image.width=y.width,y.depthTexture.image.height=y.height,y.depthTexture.needsUpdate=!0),X){if(K.__webglInit===void 0&&(K.__webglInit=!0,y.depthTexture.addEventListener("dispose",T)),K.__webglTexture===void 0){K.__webglTexture=s.createTexture(),e.bindTexture(s.TEXTURE_CUBE_MAP,K.__webglTexture),Dt(s.TEXTURE_CUBE_MAP,y.depthTexture);let lt=r.convert(y.depthTexture.format),Tt=r.convert(y.depthTexture.type),ft;y.depthTexture.format===bi?ft=s.DEPTH_COMPONENT24:y.depthTexture.format===hn&&(ft=s.DEPTH24_STENCIL8);for(let ct=0;ct<6;ct++)s.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ct,0,ft,y.width,y.height,0,lt,Tt,null)}}else q(y.depthTexture,0);let st=K.__webglTexture,at=me(y),Q=X?s.TEXTURE_CUBE_MAP_POSITIVE_X+z:s.TEXTURE_2D,et=y.depthTexture.format===hn?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;if(y.depthTexture.format===bi)ye(y)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,et,Q,st,0,at):s.framebufferTexture2D(s.FRAMEBUFFER,et,Q,st,0);else if(y.depthTexture.format===hn)ye(y)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,et,Q,st,0,at):s.framebufferTexture2D(s.FRAMEBUFFER,et,Q,st,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function kt(R){let y=i.get(R),z=R.isWebGLCubeRenderTarget===!0;if(y.__boundDepthTexture!==R.depthTexture){let X=R.depthTexture;if(y.__depthDisposeCallback&&y.__depthDisposeCallback(),X){let K=()=>{delete y.__boundDepthTexture,delete y.__depthDisposeCallback,X.removeEventListener("dispose",K)};X.addEventListener("dispose",K),y.__depthDisposeCallback=K}y.__boundDepthTexture=X}if(R.depthTexture&&!y.__autoAllocateDepthBuffer)if(z)for(let X=0;X<6;X++)xe(y.__webglFramebuffer[X],R,X);else{let X=R.texture.mipmaps;X&&X.length>0?xe(y.__webglFramebuffer[0],R,0):xe(y.__webglFramebuffer,R,0)}else if(z){y.__webglDepthbuffer=[];for(let X=0;X<6;X++)if(e.bindFramebuffer(s.FRAMEBUFFER,y.__webglFramebuffer[X]),y.__webglDepthbuffer[X]===void 0)y.__webglDepthbuffer[X]=s.createRenderbuffer(),Ot(y.__webglDepthbuffer[X],R,!1);else{let K=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,st=y.__webglDepthbuffer[X];s.bindRenderbuffer(s.RENDERBUFFER,st),s.framebufferRenderbuffer(s.FRAMEBUFFER,K,s.RENDERBUFFER,st)}}else{let X=R.texture.mipmaps;if(X&&X.length>0?e.bindFramebuffer(s.FRAMEBUFFER,y.__webglFramebuffer[0]):e.bindFramebuffer(s.FRAMEBUFFER,y.__webglFramebuffer),y.__webglDepthbuffer===void 0)y.__webglDepthbuffer=s.createRenderbuffer(),Ot(y.__webglDepthbuffer,R,!1);else{let K=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,st=y.__webglDepthbuffer;s.bindRenderbuffer(s.RENDERBUFFER,st),s.framebufferRenderbuffer(s.FRAMEBUFFER,K,s.RENDERBUFFER,st)}}e.bindFramebuffer(s.FRAMEBUFFER,null)}function Zt(R,y,z){let X=i.get(R);y!==void 0&&dt(X.__webglFramebuffer,R,R.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),z!==void 0&&kt(R)}function ie(R){let y=R.texture,z=i.get(R),X=i.get(y);R.addEventListener("dispose",x);let K=R.textures,st=R.isWebGLCubeRenderTarget===!0,at=K.length>1;if(at||(X.__webglTexture===void 0&&(X.__webglTexture=s.createTexture()),X.__version=y.version,o.memory.textures++),st){z.__webglFramebuffer=[];for(let Q=0;Q<6;Q++)if(y.mipmaps&&y.mipmaps.length>0){z.__webglFramebuffer[Q]=[];for(let et=0;et<y.mipmaps.length;et++)z.__webglFramebuffer[Q][et]=s.createFramebuffer()}else z.__webglFramebuffer[Q]=s.createFramebuffer()}else{if(y.mipmaps&&y.mipmaps.length>0){z.__webglFramebuffer=[];for(let Q=0;Q<y.mipmaps.length;Q++)z.__webglFramebuffer[Q]=s.createFramebuffer()}else z.__webglFramebuffer=s.createFramebuffer();if(at)for(let Q=0,et=K.length;Q<et;Q++){let lt=i.get(K[Q]);lt.__webglTexture===void 0&&(lt.__webglTexture=s.createTexture(),o.memory.textures++)}if(R.samples>0&&ye(R)===!1){z.__webglMultisampledFramebuffer=s.createFramebuffer(),z.__webglColorRenderbuffer=[],e.bindFramebuffer(s.FRAMEBUFFER,z.__webglMultisampledFramebuffer);for(let Q=0;Q<K.length;Q++){let et=K[Q];z.__webglColorRenderbuffer[Q]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,z.__webglColorRenderbuffer[Q]);let lt=r.convert(et.format,et.colorSpace),Tt=r.convert(et.type),ft=M(et.internalFormat,lt,Tt,et.normalized,et.colorSpace,R.isXRRenderTarget===!0),ct=me(R);s.renderbufferStorageMultisample(s.RENDERBUFFER,ct,ft,R.width,R.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+Q,s.RENDERBUFFER,z.__webglColorRenderbuffer[Q])}s.bindRenderbuffer(s.RENDERBUFFER,null),R.depthBuffer&&(z.__webglDepthRenderbuffer=s.createRenderbuffer(),Ot(z.__webglDepthRenderbuffer,R,!0)),e.bindFramebuffer(s.FRAMEBUFFER,null)}}if(st){e.bindTexture(s.TEXTURE_CUBE_MAP,X.__webglTexture),Dt(s.TEXTURE_CUBE_MAP,y);for(let Q=0;Q<6;Q++)if(y.mipmaps&&y.mipmaps.length>0)for(let et=0;et<y.mipmaps.length;et++)dt(z.__webglFramebuffer[Q][et],R,y,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+Q,et);else dt(z.__webglFramebuffer[Q],R,y,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+Q,0);f(y)&&v(s.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(at){for(let Q=0,et=K.length;Q<et;Q++){let lt=K[Q],Tt=i.get(lt),ft=s.TEXTURE_2D;(R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(ft=R.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),e.bindTexture(ft,Tt.__webglTexture),Dt(ft,lt),dt(z.__webglFramebuffer,R,lt,s.COLOR_ATTACHMENT0+Q,ft,0),f(lt)&&v(ft)}e.unbindTexture()}else{let Q=s.TEXTURE_2D;if((R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(Q=R.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),e.bindTexture(Q,X.__webglTexture),Dt(Q,y),y.mipmaps&&y.mipmaps.length>0)for(let et=0;et<y.mipmaps.length;et++)dt(z.__webglFramebuffer[et],R,y,s.COLOR_ATTACHMENT0,Q,et);else dt(z.__webglFramebuffer,R,y,s.COLOR_ATTACHMENT0,Q,0);f(y)&&v(Q),e.unbindTexture()}R.depthBuffer&&kt(R)}function Xt(R){let y=R.textures;for(let z=0,X=y.length;z<X;z++){let K=y[z];if(f(K)){let st=C(R),at=i.get(K).__webglTexture;e.bindTexture(st,at),v(st),e.unbindTexture()}}}let fe=[],Te=[];function Ve(R){if(R.samples>0){if(ye(R)===!1){let y=R.textures,z=R.width,X=R.height,K=s.COLOR_BUFFER_BIT,st=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,at=i.get(R),Q=y.length>1;if(Q)for(let lt=0;lt<y.length;lt++)e.bindFramebuffer(s.FRAMEBUFFER,at.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+lt,s.RENDERBUFFER,null),e.bindFramebuffer(s.FRAMEBUFFER,at.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+lt,s.TEXTURE_2D,null,0);e.bindFramebuffer(s.READ_FRAMEBUFFER,at.__webglMultisampledFramebuffer);let et=R.texture.mipmaps;et&&et.length>0?e.bindFramebuffer(s.DRAW_FRAMEBUFFER,at.__webglFramebuffer[0]):e.bindFramebuffer(s.DRAW_FRAMEBUFFER,at.__webglFramebuffer);for(let lt=0;lt<y.length;lt++){if(R.resolveDepthBuffer&&(R.depthBuffer&&(K|=s.DEPTH_BUFFER_BIT),R.stencilBuffer&&R.resolveStencilBuffer&&(K|=s.STENCIL_BUFFER_BIT)),Q){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,at.__webglColorRenderbuffer[lt]);let Tt=i.get(y[lt]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,Tt,0)}s.blitFramebuffer(0,0,z,X,0,0,z,X,K,s.NEAREST),l===!0&&(fe.length=0,Te.length=0,fe.push(s.COLOR_ATTACHMENT0+lt),R.depthBuffer&&R.storeMultisampledDepthBuffer===!1&&(fe.push(st),Te.push(st),s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,Te)),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,fe))}if(e.bindFramebuffer(s.READ_FRAMEBUFFER,null),e.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),Q)for(let lt=0;lt<y.length;lt++){e.bindFramebuffer(s.FRAMEBUFFER,at.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+lt,s.RENDERBUFFER,at.__webglColorRenderbuffer[lt]);let Tt=i.get(y[lt]).__webglTexture;e.bindFramebuffer(s.FRAMEBUFFER,at.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+lt,s.TEXTURE_2D,Tt,0)}e.bindFramebuffer(s.DRAW_FRAMEBUFFER,at.__webglMultisampledFramebuffer)}else if(R.depthBuffer&&R.storeMultisampledDepthBuffer===!1&&l){let y=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[y])}}}function me(R){return Math.min(n.maxSamples,R.samples)}function ye(R){let y=i.get(R);return R.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&y.__useRenderToTexture!==!1}function B(R){let y=o.render.frame;h.get(R)!==y&&(h.set(R,y),R.update())}function De(R,y){let z=R.colorSpace,X=R.format,K=R.type;return R.isCompressedTexture===!0||R.isVideoTexture===!0||z!==vs&&z!==Wi&&(qt.getTransfer(z)===ee?(X!==$e||K!==Ze)&&It("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Nt("WebGLTextures: Unsupported texture color space:",z)),y}function ne(R){return typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement?(c.width=R.naturalWidth||R.width,c.height=R.naturalHeight||R.height):typeof VideoFrame<"u"&&R instanceof VideoFrame?(c.width=R.displayWidth,c.height=R.displayHeight):(c.width=R.width,c.height=R.height),c}this.allocateTextureUnit=G,this.resetTextureUnits=D,this.getTextureUnits=P,this.setTextureUnits=N,this.setTexture2D=q,this.setTexture2DArray=H,this.setTexture3D=Z,this.setTextureCube=J,this.rebindTextures=Zt,this.setupRenderTarget=ie,this.updateRenderTargetMipmap=Xt,this.updateMultisampleRenderTarget=Ve,this.setupDepthRenderbuffer=kt,this.setupFrameBufferTexture=dt,this.useMultisampledRTT=ye,this.isReversedDepthBuffer=function(){return e.buffers.depth.getReversed()}}function G0(s,t){function e(i,n=Wi){let r,o=qt.getTransfer(n);if(i===Ze)return s.UNSIGNED_BYTE;if(i===mo)return s.UNSIGNED_SHORT_4_4_4_4;if(i===go)return s.UNSIGNED_SHORT_5_5_5_1;if(i===gl)return s.UNSIGNED_INT_5_9_9_9_REV;if(i===xl)return s.UNSIGNED_INT_10F_11F_11F_REV;if(i===pl)return s.BYTE;if(i===ml)return s.SHORT;if(i===ns)return s.UNSIGNED_SHORT;if(i===po)return s.INT;if(i===xi)return s.UNSIGNED_INT;if(i===oi)return s.FLOAT;if(i===_i)return s.HALF_FLOAT;if(i===_l)return s.ALPHA;if(i===yl)return s.RGB;if(i===$e)return s.RGBA;if(i===bi)return s.DEPTH_COMPONENT;if(i===hn)return s.DEPTH_STENCIL;if(i===xo)return s.RED;if(i===_o)return s.RED_INTEGER;if(i===un)return s.RG;if(i===yo)return s.RG_INTEGER;if(i===vo)return s.RGBA_INTEGER;if(i===ks||i===Hs||i===Gs||i===Vs)if(o===ee)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===ks)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===Hs)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===Gs)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Vs)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===ks)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===Hs)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===Gs)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Vs)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Mo||i===So||i===bo||i===wo)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===Mo)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===So)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===bo)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===wo)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Eo||i===To||i===Ao||i===Co||i===Ro||i===Ws||i===Po)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(i===Eo||i===To)return o===ee?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===Ao)return o===ee?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(i===Co)return r.COMPRESSED_R11_EAC;if(i===Ro)return r.COMPRESSED_SIGNED_R11_EAC;if(i===Ws)return r.COMPRESSED_RG11_EAC;if(i===Po)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===Io||i===Lo||i===Do||i===No||i===Uo||i===Fo||i===Bo||i===Oo||i===zo||i===ko||i===Ho||i===Go||i===Vo||i===Wo)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(i===Io)return o===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Lo)return o===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Do)return o===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===No)return o===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===Uo)return o===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Fo)return o===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===Bo)return o===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===Oo)return o===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===zo)return o===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===ko)return o===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Ho)return o===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Go)return o===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===Vo)return o===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===Wo)return o===ee?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Xo||i===qo||i===Yo)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(i===Xo)return o===ee?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===qo)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===Yo)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===Zo||i===$o||i===Xs||i===Jo)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(i===Zo)return r.COMPRESSED_RED_RGTC1_EXT;if(i===$o)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Xs)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===Jo)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===ss?s.UNSIGNED_INT_24_8:s[i]!==void 0?s[i]:null}return{convert:e}}var V0=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,W0=`
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

}`,Wl=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){let i=new Rs(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=i}}getMesh(t){if(this.texture!==null&&this.mesh===null){let e=t.cameras[0].viewport,i=new be({vertexShader:V0,fragmentShader:W0,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new $t(new Is(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Xl=class extends wi{constructor(t,e){super();let i=this,n=null,r=1,o=null,a="local-floor",l=1,c=null,h=null,d=null,u=null,p=null,g=null,_=typeof XRWebGLBinding<"u",m=new Wl,f={},v=e.getContextAttributes(),C=null,M=null,b=[],S=[],T=new Gt,x=null,w=null,A=new Be;A.viewport=new pe;let I=new Be;I.viewport=new pe;let L=[A,I],D=new ao,P=null,N=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function($){let j=b[$];return j===void 0&&(j=new Qn,b[$]=j),j.getTargetRaySpace()},this.getControllerGrip=function($){let j=b[$];return j===void 0&&(j=new Qn,b[$]=j),j.getGripSpace()},this.getHand=function($){let j=b[$];return j===void 0&&(j=new Qn,b[$]=j),j.getHandSpace()};function G($){let j=S.indexOf($.inputSource);if(j===-1)return;let xt=b[j];xt!==void 0&&(xt.update($.inputSource,$.frame,c||o),xt.dispatchEvent({type:$.type,data:$.inputSource}))}function k(){n.removeEventListener("select",G),n.removeEventListener("selectstart",G),n.removeEventListener("selectend",G),n.removeEventListener("squeeze",G),n.removeEventListener("squeezestart",G),n.removeEventListener("squeezeend",G),n.removeEventListener("end",k),n.removeEventListener("inputsourceschange",q);for(let $=0;$<b.length;$++){let j=S[$];j!==null&&(S[$]=null,b[$].disconnect(j))}P=null,N=null,m.reset();for(let $ in f)delete f[$];if(t.setRenderTarget(C),p=null,u=null,d=null,n=null,M=null,Ut.stop(),i.isPresenting=!1,t.setPixelRatio(x),t.setSize(T.width,T.height,!1),w!==null){let $=w.camera;$.fov=w.fov,$.zoom=w.zoom,$.updateProjectionMatrix(),w=null}i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function($){r=$,i.isPresenting===!0&&It("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function($){a=$,i.isPresenting===!0&&It("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function($){c=$},this.getBaseLayer=function(){return u!==null?u:p},this.getBinding=function(){return d===null&&_&&(d=new XRWebGLBinding(n,e)),d},this.getFrame=function(){return g},this.getSession=function(){return n},this.setSession=async function($){if(n=$,n!==null){if(C=t.getRenderTarget(),n.addEventListener("select",G),n.addEventListener("selectstart",G),n.addEventListener("selectend",G),n.addEventListener("squeeze",G),n.addEventListener("squeezestart",G),n.addEventListener("squeezeend",G),n.addEventListener("end",k),n.addEventListener("inputsourceschange",q),v.xrCompatible!==!0&&await e.makeXRCompatible(),x=t.getPixelRatio(),t.getSize(T),_&&"createProjectionLayer"in XRWebGLBinding.prototype){let xt=null,Rt=null,dt=null;v.depth&&(dt=v.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,xt=v.stencil?hn:bi,Rt=v.stencil?ss:xi);let Ot={colorFormat:e.RGBA8,depthFormat:dt,scaleFactor:r};d=this.getBinding(),u=d.createProjectionLayer(Ot),n.updateRenderState({layers:[u]}),t.setPixelRatio(1),t.setSize(u.textureWidth,u.textureHeight,!1),M=new Ye(u.textureWidth,u.textureHeight,{format:$e,type:Ze,depthTexture:new nn(u.textureWidth,u.textureHeight,Rt,void 0,void 0,void 0,void 0,void 0,void 0,xt),stencilBuffer:v.stencil,colorSpace:t.outputColorSpace,samples:v.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1,storeMultisampledDepthBuffer:u.ignoreDepthValues===!1,storeMultisampledStencilBuffer:u.ignoreDepthValues===!1})}else{let xt={antialias:v.antialias,alpha:!0,depth:v.depth,stencil:v.stencil,framebufferScaleFactor:r};p=new XRWebGLLayer(n,e,xt),n.updateRenderState({baseLayer:p}),t.setPixelRatio(1),t.setSize(p.framebufferWidth,p.framebufferHeight,!1),M=new Ye(p.framebufferWidth,p.framebufferHeight,{format:$e,type:Ze,colorSpace:t.outputColorSpace,stencilBuffer:v.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1,storeMultisampledDepthBuffer:p.ignoreDepthValues===!1,storeMultisampledStencilBuffer:p.ignoreDepthValues===!1})}M.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await n.requestReferenceSpace(a),Ut.setContext(n),Ut.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(n!==null)return n.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function q($){for(let j=0;j<$.removed.length;j++){let xt=$.removed[j],Rt=S.indexOf(xt);Rt>=0&&(S[Rt]=null,b[Rt].disconnect(xt))}for(let j=0;j<$.added.length;j++){let xt=$.added[j],Rt=S.indexOf(xt);if(Rt===-1){for(let Ot=0;Ot<b.length;Ot++)if(Ot>=S.length){S.push(xt),Rt=Ot;break}else if(S[Ot]===null){S[Ot]=xt,Rt=Ot;break}if(Rt===-1)break}let dt=b[Rt];dt&&dt.connect(xt)}}let H=new O,Z=new O;function J($,j,xt){H.setFromMatrixPosition(j.matrixWorld),Z.setFromMatrixPosition(xt.matrixWorld);let Rt=H.distanceTo(Z),dt=j.projectionMatrix.elements,Ot=xt.projectionMatrix.elements,xe=dt[14]/(dt[10]-1),kt=dt[14]/(dt[10]+1),Zt=(dt[9]+1)/dt[5],ie=(dt[9]-1)/dt[5],Xt=(dt[8]-1)/dt[0],fe=(Ot[8]+1)/Ot[0],Te=xe*Xt,Ve=xe*fe,me=Rt/(-Xt+fe),ye=me*-Xt;if(j.matrixWorld.decompose($.position,$.quaternion,$.scale),$.translateX(ye),$.translateZ(me),$.matrixWorld.compose($.position,$.quaternion,$.scale),$.matrixWorldInverse.copy($.matrixWorld).invert(),dt[10]===-1)$.projectionMatrix.copy(j.projectionMatrix),$.projectionMatrixInverse.copy(j.projectionMatrixInverse);else{let B=xe+me,De=kt+me,ne=Te-ye,R=Ve+(Rt-ye),y=Zt*kt/De*B,z=ie*kt/De*B;$.projectionMatrix.makePerspective(ne,R,y,z,B,De),$.projectionMatrixInverse.copy($.projectionMatrix).invert()}}function rt($,j){j===null?$.matrixWorld.copy($.matrix):$.matrixWorld.multiplyMatrices(j.matrixWorld,$.matrix),$.matrixWorldInverse.copy($.matrixWorld).invert()}this.updateCamera=function($){if(n===null)return;let j=$.near,xt=$.far;m.texture!==null&&(m.depthNear>0&&(j=m.depthNear),m.depthFar>0&&(xt=m.depthFar)),D.near=I.near=A.near=j,D.far=I.far=A.far=xt,(P!==D.near||N!==D.far)&&(n.updateRenderState({depthNear:D.near,depthFar:D.far}),P=D.near,N=D.far),D.layers.mask=$.layers.mask|6,A.layers.mask=D.layers.mask&-5,I.layers.mask=D.layers.mask&-3;let Rt=$.parent,dt=D.cameras;rt(D,Rt);for(let Ot=0;Ot<dt.length;Ot++)rt(dt[Ot],Rt);dt.length===2?J(D,A,I):D.projectionMatrix.copy(A.projectionMatrix),w===null&&$.isPerspectiveCamera&&(w={camera:$,fov:$.fov,zoom:$.zoom}),ot($,D,Rt)};function ot($,j,xt){xt===null?$.matrix.copy(j.matrixWorld):($.matrix.copy(xt.matrixWorld),$.matrix.invert(),$.matrix.multiply(j.matrixWorld)),$.matrix.decompose($.position,$.quaternion,$.scale),$.updateMatrixWorld(!0),$.projectionMatrix.copy(j.projectionMatrix),$.projectionMatrixInverse.copy(j.projectionMatrixInverse),$.isPerspectiveCamera&&($.fov=Fr*2*Math.atan(1/$.projectionMatrix.elements[5]),$.zoom=1)}this.getCamera=function(){return D},this.getFoveation=function(){if(!(u===null&&p===null))return l},this.setFoveation=function($){l=$,u!==null&&(u.fixedFoveation=$),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=$)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(D)},this.getCameraTexture=function($){return f[$]};let Bt=null;function Dt($,j){if(h=j.getViewerPose(c||o),g=j,h!==null){let xt=h.views;p!==null&&(t.setRenderTargetFramebuffer(M,p.framebuffer),t.setRenderTarget(M));let Rt=!1;xt.length!==D.cameras.length&&(D.cameras.length=0,Rt=!0);for(let kt=0;kt<xt.length;kt++){let Zt=xt[kt],ie=null;if(p!==null)ie=p.getViewport(Zt);else{let fe=d.getViewSubImage(u,Zt);ie=fe.viewport,kt===0&&(t.setRenderTargetTextures(M,fe.colorTexture,fe.depthStencilTexture),t.setRenderTarget(M))}let Xt=L[kt];Xt===void 0&&(Xt=new Be,Xt.layers.enable(kt),Xt.viewport=new pe,L[kt]=Xt),Xt.matrix.fromArray(Zt.transform.matrix),Xt.matrix.decompose(Xt.position,Xt.quaternion,Xt.scale),Xt.projectionMatrix.fromArray(Zt.projectionMatrix),Xt.projectionMatrixInverse.copy(Xt.projectionMatrix).invert(),Xt.viewport.set(ie.x,ie.y,ie.width,ie.height),kt===0&&(D.matrix.copy(Xt.matrix),D.matrix.decompose(D.position,D.quaternion,D.scale)),Rt===!0&&D.cameras.push(Xt)}let dt=n.enabledFeatures;if(dt&&dt.includes("depth-sensing")&&n.depthUsage=="gpu-optimized"&&_){d=i.getBinding();let kt=d.getDepthInformation(xt[0]);kt&&kt.isValid&&kt.texture&&m.init(kt,n.renderState)}if(dt&&dt.includes("camera-access")&&_){t.state.unbindTexture(),d=i.getBinding();for(let kt=0;kt<xt.length;kt++){let Zt=xt[kt].camera;if(Zt){let ie=f[Zt];ie||(ie=new Rs,f[Zt]=ie);let Xt=d.getCameraImage(Zt);ie.sourceTexture=Xt}}}}for(let xt=0;xt<b.length;xt++){let Rt=S[xt],dt=b[xt];Rt!==null&&dt!==void 0&&dt.update(Rt,j,c||o)}Bt&&Bt($,j),j.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:j}),g=null}let Ut=new $h;Ut.setAnimationLoop(Dt),this.setAnimationLoop=function($){Bt=$},this.dispose=function(){}}},X0=new Kt,eu=new Ft;eu.set(-1,0,0,0,1,0,0,0,1);function q0(s,t){function e(m,f){m.matrixAutoUpdate===!0&&m.updateMatrix(),f.value.copy(m.matrix)}function i(m,f){f.color.getRGB(m.fogColor.value,Sl(s)),f.isFog?(m.fogNear.value=f.near,m.fogFar.value=f.far):f.isFogExp2&&(m.fogDensity.value=f.density)}function n(m,f,v,C,M){f.isNodeMaterial?f.uniformsNeedUpdate=!1:f.isMeshBasicMaterial?r(m,f):f.isMeshLambertMaterial?(r(m,f),f.envMap&&(m.envMapIntensity.value=f.envMapIntensity)):f.isMeshToonMaterial?(r(m,f),d(m,f)):f.isMeshPhongMaterial?(r(m,f),h(m,f),f.envMap&&(m.envMapIntensity.value=f.envMapIntensity)):f.isMeshStandardMaterial?(r(m,f),u(m,f),f.isMeshPhysicalMaterial&&p(m,f,M)):f.isMeshMatcapMaterial?(r(m,f),g(m,f)):f.isMeshDepthMaterial?r(m,f):f.isMeshDistanceMaterial?(r(m,f),_(m,f)):f.isMeshNormalMaterial?r(m,f):f.isLineBasicMaterial?(o(m,f),f.isLineDashedMaterial&&a(m,f)):f.isPointsMaterial?l(m,f,v,C):f.isSpriteMaterial?c(m,f):f.isShadowMaterial?(m.color.value.copy(f.color),m.opacity.value=f.opacity):f.isShaderMaterial&&(f.uniformsNeedUpdate=!1)}function r(m,f){m.opacity.value=f.opacity,f.color&&m.diffuse.value.copy(f.color),f.emissive&&m.emissive.value.copy(f.emissive).multiplyScalar(f.emissiveIntensity),f.map&&(m.map.value=f.map,e(f.map,m.mapTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,e(f.alphaMap,m.alphaMapTransform)),f.bumpMap&&(m.bumpMap.value=f.bumpMap,e(f.bumpMap,m.bumpMapTransform),m.bumpScale.value=f.bumpScale,f.side===He&&(m.bumpScale.value*=-1)),f.normalMap&&(m.normalMap.value=f.normalMap,e(f.normalMap,m.normalMapTransform),m.normalScale.value.copy(f.normalScale),f.side===He&&m.normalScale.value.negate()),f.displacementMap&&(m.displacementMap.value=f.displacementMap,e(f.displacementMap,m.displacementMapTransform),m.displacementScale.value=f.displacementScale,m.displacementBias.value=f.displacementBias),f.emissiveMap&&(m.emissiveMap.value=f.emissiveMap,e(f.emissiveMap,m.emissiveMapTransform)),f.specularMap&&(m.specularMap.value=f.specularMap,e(f.specularMap,m.specularMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest);let v=t.get(f),C=v.envMap,M=v.envMapRotation;C&&(m.envMap.value=C,m.envMapRotation.value.setFromMatrix4(X0.makeRotationFromEuler(M)).transpose(),C.isCubeTexture&&C.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(eu),m.reflectivity.value=f.reflectivity,m.ior.value=f.ior,m.refractionRatio.value=f.refractionRatio),f.lightMap&&(m.lightMap.value=f.lightMap,m.lightMapIntensity.value=f.lightMapIntensity,e(f.lightMap,m.lightMapTransform)),f.aoMap&&(m.aoMap.value=f.aoMap,m.aoMapIntensity.value=f.aoMapIntensity,e(f.aoMap,m.aoMapTransform))}function o(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,f.map&&(m.map.value=f.map,e(f.map,m.mapTransform))}function a(m,f){m.dashSize.value=f.dashSize,m.totalSize.value=f.dashSize+f.gapSize,m.scale.value=f.scale}function l(m,f,v,C){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.size.value=f.size*v,m.scale.value=C*.5,f.map&&(m.map.value=f.map,e(f.map,m.uvTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,e(f.alphaMap,m.alphaMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest)}function c(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.rotation.value=f.rotation,f.map&&(m.map.value=f.map,e(f.map,m.mapTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,e(f.alphaMap,m.alphaMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest)}function h(m,f){m.specular.value.copy(f.specular),m.shininess.value=Math.max(f.shininess,1e-4)}function d(m,f){f.gradientMap&&(m.gradientMap.value=f.gradientMap)}function u(m,f){m.metalness.value=f.metalness,f.metalnessMap&&(m.metalnessMap.value=f.metalnessMap,e(f.metalnessMap,m.metalnessMapTransform)),m.roughness.value=f.roughness,f.roughnessMap&&(m.roughnessMap.value=f.roughnessMap,e(f.roughnessMap,m.roughnessMapTransform)),f.envMap&&(m.envMapIntensity.value=f.envMapIntensity)}function p(m,f,v){m.ior.value=f.ior,f.sheen>0&&(m.sheenColor.value.copy(f.sheenColor).multiplyScalar(f.sheen),m.sheenRoughness.value=f.sheenRoughness,f.sheenColorMap&&(m.sheenColorMap.value=f.sheenColorMap,e(f.sheenColorMap,m.sheenColorMapTransform)),f.sheenRoughnessMap&&(m.sheenRoughnessMap.value=f.sheenRoughnessMap,e(f.sheenRoughnessMap,m.sheenRoughnessMapTransform))),f.clearcoat>0&&(m.clearcoat.value=f.clearcoat,m.clearcoatRoughness.value=f.clearcoatRoughness,f.clearcoatMap&&(m.clearcoatMap.value=f.clearcoatMap,e(f.clearcoatMap,m.clearcoatMapTransform)),f.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=f.clearcoatRoughnessMap,e(f.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),f.clearcoatNormalMap&&(m.clearcoatNormalMap.value=f.clearcoatNormalMap,e(f.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(f.clearcoatNormalScale),f.side===He&&m.clearcoatNormalScale.value.negate())),f.dispersion>0&&(m.dispersion.value=f.dispersion),f.retroreflectivity>0&&(m.retroreflectivity.value=f.retroreflectivity),f.iridescence>0&&(m.iridescence.value=f.iridescence,m.iridescenceIOR.value=f.iridescenceIOR,m.iridescenceThicknessMinimum.value=f.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=f.iridescenceThicknessRange[1],f.iridescenceMap&&(m.iridescenceMap.value=f.iridescenceMap,e(f.iridescenceMap,m.iridescenceMapTransform)),f.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=f.iridescenceThicknessMap,e(f.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),f.transmission>0&&(m.transmission.value=f.transmission,m.transmissionSamplerMap.value=v.texture,m.transmissionSamplerSize.value.set(v.width,v.height),f.transmissionMap&&(m.transmissionMap.value=f.transmissionMap,e(f.transmissionMap,m.transmissionMapTransform)),m.thickness.value=f.thickness,f.thicknessMap&&(m.thicknessMap.value=f.thicknessMap,e(f.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=f.attenuationDistance,m.attenuationColor.value.copy(f.attenuationColor)),f.anisotropy>0&&(m.anisotropyVector.value.set(f.anisotropy*Math.cos(f.anisotropyRotation),f.anisotropy*Math.sin(f.anisotropyRotation)),f.anisotropyMap&&(m.anisotropyMap.value=f.anisotropyMap,e(f.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=f.specularIntensity,m.specularColor.value.copy(f.specularColor),f.specularColorMap&&(m.specularColorMap.value=f.specularColorMap,e(f.specularColorMap,m.specularColorMapTransform)),f.specularIntensityMap&&(m.specularIntensityMap.value=f.specularIntensityMap,e(f.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,f){f.matcap&&(m.matcap.value=f.matcap)}function _(m,f){let v=t.get(f).light;m.referencePosition.value.setFromMatrixPosition(v.matrixWorld),m.nearDistance.value=v.shadow.camera.near,m.farDistance.value=v.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:n}}function Y0(s,t,e,i){let n={},r={},o=[],a=s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);function l(M,b){let S=b.program;i.uniformBlockBinding(M,S)}function c(M,b){let S=n[M.id];S===void 0&&(m(M),S=h(M),n[M.id]=S,M.addEventListener("dispose",v));let T=b.program;i.updateUBOMapping(M,T);let x=t.render.frame;r[M.id]!==x&&(u(M),r[M.id]=x)}function h(M){let b=d();M.__bindingPointIndex=b;let S=s.createBuffer(),T=M.__size,x=M.usage;return s.bindBuffer(s.UNIFORM_BUFFER,S),s.bufferData(s.UNIFORM_BUFFER,T,x),s.bindBuffer(s.UNIFORM_BUFFER,null),s.bindBufferBase(s.UNIFORM_BUFFER,b,S),S}function d(){for(let M=0;M<a;M++)if(o.indexOf(M)===-1)return o.push(M),M;return Nt("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(M){let b=n[M.id],S=M.uniforms,T=M.__cache;s.bindBuffer(s.UNIFORM_BUFFER,b);for(let x=0,w=S.length;x<w;x++){let A=S[x];if(Array.isArray(A))for(let I=0,L=A.length;I<L;I++)p(A[I],x,I,T);else p(A,x,0,T)}s.bindBuffer(s.UNIFORM_BUFFER,null)}function p(M,b,S,T){if(_(M,b,S,T)===!0){let x=M.__offset,w=M.value;if(Array.isArray(w)){let A=0;for(let I=0;I<w.length;I++){let L=w[I],D=f(L);g(L,M.__data,A),typeof L!="number"&&typeof L!="boolean"&&!L.isMatrix3&&!ArrayBuffer.isView(L)&&(A+=D.storage/Float32Array.BYTES_PER_ELEMENT)}}else g(w,M.__data,0);s.bufferSubData(s.UNIFORM_BUFFER,x,M.__data)}}function g(M,b,S){typeof M=="number"||typeof M=="boolean"?b[0]=M:M.isMatrix3?(b[0]=M.elements[0],b[1]=M.elements[1],b[2]=M.elements[2],b[3]=0,b[4]=M.elements[3],b[5]=M.elements[4],b[6]=M.elements[5],b[7]=0,b[8]=M.elements[6],b[9]=M.elements[7],b[10]=M.elements[8],b[11]=0):ArrayBuffer.isView(M)?b.set(new M.constructor(M.buffer,M.byteOffset,b.length)):M.toArray(b,S)}function _(M,b,S,T){let x=M.value,w=b+"_"+S;if(T[w]===void 0)return typeof x=="number"||typeof x=="boolean"?T[w]=x:ArrayBuffer.isView(x)?T[w]=x.slice():T[w]=x.clone(),!0;{let A=T[w];if(typeof x=="number"||typeof x=="boolean"){if(A!==x)return T[w]=x,!0}else{if(ArrayBuffer.isView(x))return!0;if(A.equals(x)===!1)return A.copy(x),!0}}return!1}function m(M){let b=M.uniforms,S=0,T=16;for(let w=0,A=b.length;w<A;w++){let I=Array.isArray(b[w])?b[w]:[b[w]];for(let L=0,D=I.length;L<D;L++){let P=I[L],N=Array.isArray(P.value)?P.value:[P.value];for(let G=0,k=N.length;G<k;G++){let q=N[G],H=f(q),Z=S%T,J=Z%H.boundary,rt=Z+J;S+=J,rt!==0&&T-rt<H.storage&&(S+=T-rt),P.__data=new Float32Array(H.storage/Float32Array.BYTES_PER_ELEMENT),P.__offset=S,S+=H.storage}}}let x=S%T;return x>0&&(S+=T-x),M.__size=S,M.__cache={},this}function f(M){let b={boundary:0,storage:0};return typeof M=="number"||typeof M=="boolean"?(b.boundary=4,b.storage=4):M.isVector2?(b.boundary=8,b.storage=8):M.isVector3||M.isColor?(b.boundary=16,b.storage=12):M.isVector4?(b.boundary=16,b.storage=16):M.isMatrix3?(b.boundary=48,b.storage=48):M.isMatrix4?(b.boundary=64,b.storage=64):M.isTexture?It("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(M)?(b.boundary=16,b.storage=M.byteLength):It("WebGLRenderer: Unsupported uniform value type.",M),b}function v(M){let b=M.target;b.removeEventListener("dispose",v);let S=o.indexOf(b.__bindingPointIndex);o.splice(S,1),s.deleteBuffer(n[b.id]),delete n[b.id],delete r[b.id]}function C(){for(let M in n)s.deleteBuffer(n[M]);o=[],n={},r={}}return{bind:l,update:c,dispose:C}}var Z0=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Li=null;function $0(){return Li===null&&(Li=new vn(Z0,16,16,un,_i),Li.name="DFG_LUT",Li.minFilter=Se,Li.magFilter=Se,Li.wrapS=Si,Li.wrapT=Si,Li.generateMipmaps=!1,Li.needsUpdate=!0),Li}var sa=class{constructor(t={}){let{canvas:e=vh(),context:i=null,depth:n=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:u=!1,outputBufferType:p=Ze}=t;this.isWebGLRenderer=!0;let g;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=i.getContextAttributes().alpha}else g=o;let _=p,m=new Set([vo,yo,_o]),f=new Set([Ze,xi,ns,ss,mo,go]),v=new Uint32Array(4),C=new Int32Array(4),M=new O,b=null,S=null,T=[],x=[],w=null;this.domElement=e,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=gi,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let A=this,I=!1,L=null,D=null,P=null,N=null;this._outputColorSpace=Qe;let G=0,k=0,q=null,H=-1,Z=null,J=new pe,rt=new pe,ot=null,Bt=new Mt(0),Dt=0,Ut=e.width,$=e.height,j=1,xt=null,Rt=null,dt=new pe(0,0,Ut,$),Ot=new pe(0,0,Ut,$),xe=!1,kt=new jn,Zt=!1,ie=!1,Xt=new Kt,fe=new O,Te=new pe,Ve={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},me=!1;function ye(){return q===null?j:1}let B=i;function De(E,U){return e.getContext(E,U)}let ne,R,y,z,X,K,st,at,Q,et,lt,Tt,ft,ct,At,Pt,zt,F,ht,tt,ut,_t,nt;try{let E={alpha:!0,depth:n,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:d};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${"186"}`),e.addEventListener("webglcontextlost",le,!1),e.addEventListener("webglcontextrestored",jt,!1),e.addEventListener("webglcontextcreationerror",ci,!1),B===null){let U="webgl2";if(B=De(U,E),B===null)throw De(U)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Ct()}catch(E){throw e.removeEventListener("webglcontextlost",le,!1),e.removeEventListener("webglcontextrestored",jt,!1),e.removeEventListener("webglcontextcreationerror",ci,!1),Nt("WebGLRenderer: "+E.message),E}function Ct(){ne=new im(B),ne.init(),ut=new G0(B,ne),R=new qp(B,ne,t,ut),y=new k0(B,ne),R.reversedDepthBuffer&&u&&y.buffers.depth.setReversed(!0),D=B.createFramebuffer(),P=B.createFramebuffer(),N=B.createFramebuffer(),z=new rm(B),X=new T0,K=new H0(B,ne,y,X,R,ut,z),st=new em(A),at=new od(B),_t=new Wp(B,at),Q=new nm(B,at,z,_t),et=new am(B,Q,at,_t,z),F=new om(B,R,K),At=new Yp(X),lt=new E0(A,st,ne,R,_t,At),Tt=new q0(A,X),ft=new C0,ct=new N0(ne),zt=new Vp(A,st,y,et,g,l),Pt=new z0(A,et,R),nt=new Y0(B,z,R,y),ht=new Xp(B,ne,z),tt=new sm(B,ne,z),z.programs=lt.programs,A.capabilities=R,A.extensions=ne,A.properties=X,A.renderLists=ft,A.shadowMap=Pt,A.state=y,A.info=z}_!==Ze&&(w=new cm(_,e.width,e.height,a,n,r));let wt=new Xl(A,B);this.xr=wt,this.getContext=function(){return B},this.getContextAttributes=function(){return B.getContextAttributes()},this.forceContextLoss=function(){let E=ne.get("WEBGL_lose_context");E&&E.loseContext()},this.forceContextRestore=function(){let E=ne.get("WEBGL_lose_context");E&&E.restoreContext()},this.getPixelRatio=function(){return j},this.setPixelRatio=function(E){E!==void 0&&(j=E,this.setSize(Ut,$,!1))},this.getSize=function(E){return E.set(Ut,$)},this.setSize=function(E,U,Y=!0){if(wt.isPresenting){It("WebGLRenderer: Can't change size while VR device is presenting.");return}Ut=E,$=U,e.width=Math.floor(E*j),e.height=Math.floor(U*j),Y===!0&&(e.style.width=E+"px",e.style.height=U+"px"),w!==null&&w.setSize(e.width,e.height),this.setViewport(0,0,E,U)},this.getDrawingBufferSize=function(E){return E.set(Ut*j,$*j).floor()},this.setDrawingBufferSize=function(E,U,Y){Ut=E,$=U,j=Y,e.width=Math.floor(E*Y),e.height=Math.floor(U*Y),this.setViewport(0,0,E,U)},this.setEffects=function(E){if(_===Ze){Nt("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(E){for(let U=0;U<E.length;U++)if(E[U].isOutputPass===!0){It("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}w.setEffects(E||[])},this.getCurrentViewport=function(E){return E.copy(J)},this.getViewport=function(E){return E.copy(dt)},this.setViewport=function(E,U,Y,V){E.isVector4?dt.set(E.x,E.y,E.z,E.w):dt.set(E,U,Y,V),y.viewport(J.copy(dt).multiplyScalar(j).round())},this.getScissor=function(E){return E.copy(Ot)},this.setScissor=function(E,U,Y,V){E.isVector4?Ot.set(E.x,E.y,E.z,E.w):Ot.set(E,U,Y,V),y.scissor(rt.copy(Ot).multiplyScalar(j).round())},this.getScissorTest=function(){return xe},this.setScissorTest=function(E){y.setScissorTest(xe=E)},this.setOpaqueSort=function(E){xt=E},this.setTransparentSort=function(E){Rt=E},this.getClearColor=function(E){return E.copy(zt.getClearColor())},this.setClearColor=function(){zt.setClearColor(...arguments)},this.getClearAlpha=function(){return zt.getClearAlpha()},this.setClearAlpha=function(){zt.setClearAlpha(...arguments)},this.clear=function(E=!0,U=!0,Y=!0){let V=0;if(E){let W=!1;if(q!==null){let gt=q.texture.format;W=m.has(gt)}if(W){let gt=q.texture.type,vt=f.has(gt),mt=zt.getClearColor(),St=zt.getClearAlpha(),Et=mt.r,Ht=mt.g,Wt=mt.b;vt?(v[0]=Et,v[1]=Ht,v[2]=Wt,v[3]=St,B.clearBufferuiv(B.COLOR,0,v)):(C[0]=Et,C[1]=Ht,C[2]=Wt,C[3]=St,B.clearBufferiv(B.COLOR,0,C))}else V|=B.COLOR_BUFFER_BIT}U&&(V|=B.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),Y&&(V|=B.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),V!==0&&B.clear(V)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(E){E.setRenderer(this),L=E},this.dispose=function(){e.removeEventListener("webglcontextlost",le,!1),e.removeEventListener("webglcontextrestored",jt,!1),e.removeEventListener("webglcontextcreationerror",ci,!1),zt.dispose(),ft.dispose(),ct.dispose(),X.dispose(),st.dispose(),et.dispose(),_t.dispose(),nt.dispose(),lt.dispose(),wt.dispose(),wt.removeEventListener("sessionstart",tc),wt.removeEventListener("sessionend",ec),dn.stop()};function le(E){E.preventDefault(),Ml("WebGLRenderer: Context Lost."),I=!0}function jt(){Ml("WebGLRenderer: Context Restored."),I=!1;let E=z.autoReset,U=Pt.enabled,Y=Pt.autoUpdate,V=Pt.needsUpdate,W=Pt.type;Ct(),z.autoReset=E,Pt.enabled=U,Pt.autoUpdate=Y,Pt.needsUpdate=V,Pt.type=W}function ci(E){Nt("WebGLRenderer: A WebGL context could not be created. Reason: ",E.statusMessage)}function yi(E){let U=E.target;U.removeEventListener("dispose",yi),gu(U)}function gu(E){xu(E),X.remove(E)}function xu(E){let U=X.get(E).programs;U!==void 0&&(U.forEach(function(Y){lt.releaseProgram(Y)}),E.isShaderMaterial&&lt.releaseShaderCache(E))}this.renderBufferDirect=function(E,U,Y,V,W,gt){U===null&&(U=Ve);let vt=W.isMesh&&W.matrixWorld.determinantAffine()<0,mt=vu(E,U,Y,V,W);y.setMaterial(V,vt);let St=Y.index,Et=1;if(V.wireframe===!0){if(St=Q.getWireframeAttribute(Y),St===void 0)return;Et=2}let Ht=Y.drawRange,Wt=Y.attributes.position,bt=Ht.start*Et,te=(Ht.start+Ht.count)*Et;gt!==null&&(bt=Math.max(bt,gt.start*Et),te=Math.min(te,(gt.start+gt.count)*Et)),St!==null?(bt=Math.max(bt,0),te=Math.min(te,St.count)):Wt!=null&&(bt=Math.max(bt,0),te=Math.min(te,Wt.count));let ve=te-bt;if(ve<0||ve===1/0)return;_t.setup(W,V,mt,Y,St);let ue,ae=ht;if(St!==null&&(ue=at.get(St),ae=tt,ae.setIndex(ue)),W.isMesh)V.wireframe===!0?(y.setLineWidth(V.wireframeLinewidth*ye()),ae.setMode(B.LINES)):ae.setMode(B.TRIANGLES);else if(W.isLine){let Ne=V.linewidth;Ne===void 0&&(Ne=1),y.setLineWidth(Ne*ye()),W.isLineSegments?ae.setMode(B.LINES):W.isLineLoop?ae.setMode(B.LINE_LOOP):ae.setMode(B.LINE_STRIP)}else W.isPoints?ae.setMode(B.POINTS):W.isSprite&&ae.setMode(B.TRIANGLES);if(W.isBatchedMesh)if(ne.get("WEBGL_multi_draw"))ae.renderMultiDraw(W._multiDrawStarts,W._multiDrawCounts,W._multiDrawCount);else{let Ne=W._multiDrawStarts,yt=W._multiDrawCounts,ke=W._multiDrawCount,Jt=St?at.get(St).bytesPerElement:1,ii=X.get(V).currentProgram.getUniforms();for(let vi=0;vi<ke;vi++)ii.setValue(B,"_gl_DrawID",vi),ae.render(Ne[vi]/Jt,yt[vi])}else if(W.isInstancedMesh)ae.renderInstances(bt,ve,W.count);else if(Y.isInstancedBufferGeometry){let Ne=Y._maxInstanceCount!==void 0?Y._maxInstanceCount:1/0,yt=Math.min(Y.instanceCount,Ne);ae.renderInstances(bt,ve,yt)}else ae.render(bt,ve)};function jl(E,U,Y,V){L!==null&&E.isNodeMaterial&&L.setObject(V,E),Zt===!0&&At.setState(E,Y,!1),E.transparent===!0&&E.side===ti&&E.forceSinglePass===!1?(E.side=He,E.needsUpdate=!0,tr(E,U,V),E.side=Ri,E.needsUpdate=!0,tr(E,U,V),E.side=ti):tr(E,U,V)}this.compile=function(E,U,Y=null){Y===null&&(Y=E),L!==null&&L.renderStart(E,U,Y),S=ct.get(Y),S.init(U),x.push(S),Y.traverseVisible(function(W){W.isLight&&W.layers.test(U.layers)&&(S.pushLight(W),W.castShadow&&S.pushShadow(W))}),E!==Y&&E.traverseVisible(function(W){W.isLight&&W.layers.test(U.layers)&&(S.pushLight(W),W.castShadow&&S.pushShadow(W))}),S.setupLights(),L!==null&&L.updateLights(S.state.lightsArray),ie=this.localClippingEnabled,Zt=At.init(this.clippingPlanes,ie),Zt===!0&&At.setGlobalState(this.clippingPlanes,U),L!==null&&Pt.render(S.state.shadowsArray,Y,U);let V=new Set;return E.traverse(function(W){if(!(W.isMesh||W.isPoints||W.isLine||W.isSprite))return;let gt=W.material;if(gt)if(Array.isArray(gt))for(let vt=0;vt<gt.length;vt++){let mt=gt[vt];jl(mt,Y,U,W),V.add(mt)}else jl(gt,Y,U,W),V.add(gt)}),S=x.pop(),L!==null&&L.renderEnd(),V},this.compileAsync=function(E,U,Y=null){let V=this.compile(E,U,Y);return new Promise(W=>{function gt(){if(V.forEach(function(vt){let St=X.get(vt).currentProgram;(St===void 0||St.isReady())&&V.delete(vt)}),V.size===0){W(E);return}setTimeout(gt,10)}ne.get("KHR_parallel_shader_compile")!==null?gt():setTimeout(gt,10)})};let ya=null;function _u(E){ya&&ya(E)}function tc(){dn.stop()}function ec(){dn.start()}let dn=new $h;dn.setAnimationLoop(_u),typeof self<"u"&&dn.setContext(self),this.setAnimationLoop=function(E){ya=E,wt.setAnimationLoop(E),E===null?dn.stop():dn.start()},wt.addEventListener("sessionstart",tc),wt.addEventListener("sessionend",ec),this.render=function(E,U){if(U!==void 0&&U.isCamera!==!0){Nt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(I===!0)return;L!==null&&L.renderStart(E,U);let Y=wt.enabled===!0&&wt.isPresenting===!0,V=w!==null&&(q===null||Y)&&w.begin(A,q);if(E.matrixWorldAutoUpdate===!0&&E.updateMatrixWorld(),U.parent===null&&U.matrixWorldAutoUpdate===!0&&U.updateMatrixWorld(),wt.enabled===!0&&wt.isPresenting===!0&&(w===null||w.isCompositing()===!1)&&(wt.cameraAutoUpdate===!0&&wt.updateCamera(U),U=wt.getCamera()),E.isScene===!0&&E.onBeforeRender(A,E,U,q),S=ct.get(E,x.length),S.init(U),S.state.textureUnits=K.getTextureUnits(),x.push(S),Xt.multiplyMatrices(U.projectionMatrix,U.matrixWorldInverse),kt.setFromProjectionMatrix(Xt,pi,U.reversedDepth),ie=this.localClippingEnabled,Zt=At.init(this.clippingPlanes,ie),b=ft.get(E,T.length),b.init(),T.push(b),wt.enabled===!0&&wt.isPresenting===!0){let vt=A.xr.getDepthSensingMesh();vt!==null&&va(vt,U,-1/0,A.sortObjects)}va(E,U,0,A.sortObjects),b.finish(),L!==null&&L.updateLights(S.state.lightsArray),A.sortObjects===!0&&b.sort(xt,Rt),me=wt.enabled===!1||wt.isPresenting===!1||wt.hasDepthSensing()===!1,me&&zt.addToRenderList(b,E),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),Zt===!0&&At.beginShadows();let W=S.state.shadowsArray;if(Pt.render(W,E,U),Zt===!0&&At.endShadows(),(V&&w.hasRenderPass())===!1){let vt=b.opaque,mt=b.transmissive;if(S.setupLights(),U.isArrayCamera){let St=U.cameras;if(mt.length>0)for(let Et=0,Ht=St.length;Et<Ht;Et++){let Wt=St[Et];nc(vt,mt,E,Wt)}me&&zt.render(E);for(let Et=0,Ht=St.length;Et<Ht;Et++){let Wt=St[Et];ic(b,E,Wt,Wt.viewport)}}else mt.length>0&&nc(vt,mt,E,U),me&&zt.render(E),ic(b,E,U)}q!==null&&k===0&&(K.updateMultisampleRenderTarget(q),K.updateRenderTargetMipmap(q)),V&&w.end(A),E.isScene===!0&&E.onAfterRender(A,E,U),_t.resetDefaultState(),H=-1,Z=null,x.pop(),x.length>0?(S=x[x.length-1],K.setTextureUnits(S.state.textureUnits),Zt===!0&&At.setGlobalState(A.clippingPlanes,S.state.camera)):S=null,T.pop(),T.length>0?b=T[T.length-1]:b=null,L!==null&&L.renderEnd()};function va(E,U,Y,V){if(E.visible===!1)return;if(E.layers.test(U.layers)){if(E.isGroup)Y=E.renderOrder;else if(E.isLOD)E.autoUpdate===!0&&E.update(U);else if(E.isLightProbeGrid)S.pushLightProbeGrid(E);else if(E.isLight)S.pushLight(E),E.castShadow&&S.pushShadow(E);else if(E.isSprite){if(!E.frustumCulled||E.intersectsFrustum(kt)){V&&Te.setFromMatrixPosition(E.matrixWorld).applyMatrix4(Xt);let vt=et.update(E),mt=E.material;mt.visible&&b.push(E,vt,mt,Y,Te.z,null,U)}}else if((E.isMesh||E.isLine||E.isPoints)&&(!E.frustumCulled||E.intersectsFrustum(kt))){let vt=et.update(E),mt=E.material;if(V&&(E.boundingSphere!==void 0?(E.boundingSphere===null&&E.computeBoundingSphere(),Te.copy(E.boundingSphere.center)):(vt.boundingSphere===null&&vt.computeBoundingSphere(),Te.copy(vt.boundingSphere.center)),Te.applyMatrix4(E.matrixWorld).applyMatrix4(Xt)),Array.isArray(mt)){let St=vt.groups;for(let Et=0,Ht=St.length;Et<Ht;Et++){let Wt=St[Et],bt=mt[Wt.materialIndex];bt&&bt.visible&&b.push(E,vt,bt,Y,Te.z,Wt,U)}}else mt.visible&&b.push(E,vt,mt,Y,Te.z,null,U)}}let gt=E.children;for(let vt=0,mt=gt.length;vt<mt;vt++)va(gt[vt],U,Y,V)}function ic(E,U,Y,V){let{opaque:W,transmissive:gt,transparent:vt}=E;S.setupLightsView(Y),Zt===!0&&At.setGlobalState(A.clippingPlanes,Y),V&&y.viewport(J.copy(V)),W.length>0&&js(W,U,Y),gt.length>0&&js(gt,U,Y),vt.length>0&&js(vt,U,Y),y.buffers.depth.setTest(!0),y.buffers.depth.setMask(!0),y.buffers.color.setMask(!0),y.setPolygonOffset(!1)}function nc(E,U,Y,V){if((Y.isScene===!0?Y.overrideMaterial:null)!==null)return;if(S.state.transmissionRenderTarget[V.id]===void 0){let bt=ne.has("EXT_color_buffer_half_float")||ne.has("EXT_color_buffer_float");S.state.transmissionRenderTarget[V.id]=new Ye(1,1,{generateMipmaps:!0,type:bt?_i:Ze,minFilter:Ii,samples:Math.max(4,R.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:qt.workingColorSpace})}let gt=S.state.transmissionRenderTarget[V.id],vt=V.viewport||J;gt.setSize(vt.z*A.transmissionResolutionScale,vt.w*A.transmissionResolutionScale);let mt=A.getRenderTarget(),St=A.getActiveCubeFace(),Et=A.getActiveMipmapLevel();A.setRenderTarget(gt),A.getClearColor(Bt),Dt=A.getClearAlpha(),Dt<1&&A.setClearColor(16777215,.5),A.clear(),me&&zt.render(Y);let Ht=A.toneMapping;A.toneMapping=gi;let Wt=V.viewport;if(V.viewport!==void 0&&(V.viewport=void 0),S.setupLightsView(V),Zt===!0&&At.setGlobalState(A.clippingPlanes,V),js(E,Y,V),K.updateMultisampleRenderTarget(gt),K.updateRenderTargetMipmap(gt),ne.has("WEBGL_multisampled_render_to_texture")===!1){let bt=!1;for(let te=0,ve=U.length;te<ve;te++){let ue=U[te],{object:ae,geometry:Ne,material:yt,group:ke}=ue;if(yt.side===ti&&ae.layers.test(V.layers)){let Jt=yt.side;yt.side=He,yt.needsUpdate=!0,sc(ae,Y,V,Ne,yt,ke),yt.side=Jt,yt.needsUpdate=!0,bt=!0}}bt===!0&&(K.updateMultisampleRenderTarget(gt),K.updateRenderTargetMipmap(gt))}A.setRenderTarget(mt,St,Et),A.setClearColor(Bt,Dt),Wt!==void 0&&(V.viewport=Wt),A.toneMapping=Ht}function js(E,U,Y){let V=U.isScene===!0?U.overrideMaterial:null;for(let W=0,gt=E.length;W<gt;W++){let vt=E[W],{object:mt,geometry:St,group:Et}=vt,Ht=vt.material;Ht.allowOverride===!0&&V!==null&&(Ht=V),mt.layers.test(Y.layers)&&sc(mt,U,Y,St,Ht,Et)}}function sc(E,U,Y,V,W,gt){L!==null&&W.isNodeMaterial&&L.setObject(E,W),E.onBeforeRender(A,U,Y,V,W,gt),E.modelViewMatrix.multiplyMatrices(Y.matrixWorldInverse,E.matrixWorld),E.normalMatrix.getNormalMatrix(E.modelViewMatrix),W.onBeforeRender(A,U,Y,V,E,gt),W.transparent===!0&&W.side===ti&&W.forceSinglePass===!1?(W.side=He,W.needsUpdate=!0,A.renderBufferDirect(Y,U,V,W,E,gt),W.side=Ri,W.needsUpdate=!0,A.renderBufferDirect(Y,U,V,W,E,gt),W.side=ti):A.renderBufferDirect(Y,U,V,W,E,gt),E.onAfterRender(A,U,Y,V,W,gt)}function tr(E,U,Y){U.isScene!==!0&&(U=Ve);let V=X.get(E),W=S.state.lights,gt=S.state.shadowsArray,vt=W.state.version,mt=lt.getParameters(E,W.state,gt,U,Y,S.state.lightProbeGridArray),St=lt.getProgramCacheKey(mt),Et=V.programs;V.environment=E.isMeshStandardMaterial||E.isMeshLambertMaterial||E.isMeshPhongMaterial?U.environment:null,V.fog=U.fog;let Ht=E.isMeshStandardMaterial||E.isMeshLambertMaterial&&!E.envMap||E.isMeshPhongMaterial&&!E.envMap;V.envMap=st.get(E.envMap||V.environment,Ht),V.envMapRotation=V.environment!==null&&E.envMap===null?U.environmentRotation:E.envMapRotation,Et===void 0&&(E.addEventListener("dispose",yi),Et=new Map,V.programs=Et);let Wt=Et.get(St);if(Wt!==void 0){if(V.currentProgram===Wt&&V.lightsStateVersion===vt)return oc(E,mt),Wt}else mt.uniforms=lt.getUniforms(E),L!==null&&E.isNodeMaterial&&L.build(E,Y,mt),E.onBeforeCompile(mt,A),Wt=lt.acquireProgram(mt,St),Et.set(St,Wt),V.uniforms=mt.uniforms;let bt=V.uniforms;return(!E.isShaderMaterial&&!E.isRawShaderMaterial||E.clipping===!0)&&(bt.clippingPlanes=At.uniform),oc(E,mt),V.needsLights=Su(E),V.lightsStateVersion=vt,V.needsLights&&(bt.ambientLightColor.value=W.state.ambient,bt.lightProbe.value=W.state.probe,bt.sunLights.value=W.state.sun,bt.sunLightShadows.value=W.state.sunShadow,bt.directionalLights.value=W.state.directional,bt.directionalLightShadows.value=W.state.directionalShadow,bt.spotLights.value=W.state.spot,bt.spotLightShadows.value=W.state.spotShadow,bt.rectAreaLights.value=W.state.rectArea,bt.ltc_1.value=W.state.rectAreaLTC1,bt.ltc_2.value=W.state.rectAreaLTC2,bt.pointLights.value=W.state.point,bt.pointLightShadows.value=W.state.pointShadow,bt.hemisphereLights.value=W.state.hemi,bt.sunShadowMatrix.value=W.state.sunShadowMatrix,bt.sunShadowCascade.value=W.state.sunShadowCascade,bt.directionalShadowMatrix.value=W.state.directionalShadowMatrix,bt.spotLightMatrix.value=W.state.spotLightMatrix,bt.spotLightMap.value=W.state.spotLightMap,bt.pointShadowMatrix.value=W.state.pointShadowMatrix),V.lightProbeGrid=S.state.lightProbeGridArray.length>0,V.currentProgram=Wt,V.uniformsList=null,Wt}function rc(E){if(E.uniformsList===null){let U=E.currentProgram.getUniforms();E.uniformsList=as.seqWithValue(U.seq,E.uniforms)}return E.uniformsList}function oc(E,U){let Y=X.get(E);Y.outputColorSpace=U.outputColorSpace,Y.batching=U.batching,Y.batchingColor=U.batchingColor,Y.instancing=U.instancing,Y.instancingColor=U.instancingColor,Y.instancingMorph=U.instancingMorph,Y.skinning=U.skinning,Y.morphTargets=U.morphTargets,Y.morphNormals=U.morphNormals,Y.morphColors=U.morphColors,Y.morphTargetsCount=U.morphTargetsCount,Y.numClippingPlanes=U.numClippingPlanes,Y.numIntersection=U.numClipIntersection,Y.vertexAlphas=U.vertexAlphas,Y.vertexTangents=U.vertexTangents,Y.toneMapping=U.toneMapping}function yu(E,U){if(E.length===0)return null;if(E.length===1)return E[0].texture!==null?E[0]:null;M.setFromMatrixPosition(U.matrixWorld);for(let Y=0,V=E.length;Y<V;Y++){let W=E[Y];if(W.texture!==null&&W.boundingBox.containsPoint(M))return W}return null}function vu(E,U,Y,V,W){U.isScene!==!0&&(U=Ve),K.resetTextureUnits();let gt=U.fog,vt=V.isMeshStandardMaterial||V.isMeshLambertMaterial||V.isMeshPhongMaterial?U.environment:null,mt=q===null?A.outputColorSpace:q.isXRRenderTarget===!0?q.texture.colorSpace:qt.workingColorSpace,St=V.isMeshStandardMaterial||V.isMeshLambertMaterial&&!V.envMap||V.isMeshPhongMaterial&&!V.envMap,Et=st.get(V.envMap||vt,St),Ht=V.vertexColors===!0&&!!Y.attributes.color&&Y.attributes.color.itemSize===4,Wt=!!Y.attributes.tangent&&(!!V.normalMap||V.anisotropy>0),bt=!!Y.morphAttributes.position,te=!!Y.morphAttributes.normal,ve=!!Y.morphAttributes.color,ue=gi;V.toneMapped&&(q===null||q.isXRRenderTarget===!0)&&(ue=A.toneMapping);let ae=Y.morphAttributes.position||Y.morphAttributes.normal||Y.morphAttributes.color,Ne=ae!==void 0?ae.length:0,yt=X.get(V),ke=S.state.lights;if(Zt===!0&&(ie===!0||E!==Z)){let ce=E===Z&&V.id===H;At.setState(V,E,ce)}let Jt=!1;V.version===yt.__version?(yt.needsLights&&yt.lightsStateVersion!==ke.state.version||yt.outputColorSpace!==mt||W.isBatchedMesh&&yt.batching===!1||!W.isBatchedMesh&&yt.batching===!0||W.isBatchedMesh&&yt.batchingColor===!0&&W._colorsTexture===null||W.isBatchedMesh&&yt.batchingColor===!1&&W._colorsTexture!==null||W.isInstancedMesh&&yt.instancing===!1||!W.isInstancedMesh&&yt.instancing===!0||W.isSkinnedMesh&&yt.skinning===!1||!W.isSkinnedMesh&&yt.skinning===!0||W.isInstancedMesh&&yt.instancingColor===!0&&W.instanceColor===null||W.isInstancedMesh&&yt.instancingColor===!1&&W.instanceColor!==null||W.isInstancedMesh&&yt.instancingMorph===!0&&W.morphTexture===null||W.isInstancedMesh&&yt.instancingMorph===!1&&W.morphTexture!==null||yt.envMap!==Et||V.fog===!0&&yt.fog!==gt||yt.numClippingPlanes!==void 0&&(yt.numClippingPlanes!==At.numPlanes||yt.numIntersection!==At.numIntersection)||yt.vertexAlphas!==Ht||yt.vertexTangents!==Wt||yt.morphTargets!==bt||yt.morphNormals!==te||yt.morphColors!==ve||yt.toneMapping!==ue||yt.morphTargetsCount!==Ne||!!yt.lightProbeGrid!=S.state.lightProbeGridArray.length>0)&&(Jt=!0):(Jt=!0,yt.__version=V.version);let ii=yt.currentProgram;Jt===!0&&(ii=tr(V,U,W),L&&V.isNodeMaterial&&L.onUpdateProgram(V,ii,yt));let vi=!1,qi=!1,Pn=!1,se=ii.getUniforms(),_e=yt.uniforms;if(y.useProgram(ii.program)&&(vi=!0,qi=!0,Pn=!0),V.id!==H&&(H=V.id,qi=!0),yt.needsLights){let ce=yu(S.state.lightProbeGridArray,W);yt.lightProbeGrid!==ce&&(yt.lightProbeGrid=ce,qi=!0)}if(vi||Z!==E){y.buffers.depth.getReversed()&&E.reversedDepth!==!0&&(E._reversedDepth=!0,E.updateProjectionMatrix()),se.setValue(B,"projectionMatrix",E.projectionMatrix),se.setValue(B,"viewMatrix",E.matrixWorldInverse);let Zi=se.map.cameraPosition;Zi!==void 0&&Zi.setValue(B,fe.setFromMatrixPosition(E.matrixWorld)),R.logarithmicDepthBuffer&&se.setValue(B,"logDepthBufFC",2/(Math.log(E.far+1)/Math.LN2)),(V.isMeshPhongMaterial||V.isMeshToonMaterial||V.isMeshLambertMaterial||V.isMeshBasicMaterial||V.isMeshStandardMaterial||V.isShaderMaterial)&&se.setValue(B,"isOrthographic",E.isOrthographicCamera===!0),Z!==E&&(Z=E,qi=!0,Pn=!0)}if(yt.needsLights&&(ke.state.sunShadowMap.length>0&&se.setValue(B,"sunShadowMap",ke.state.sunShadowMap,K),ke.state.directionalShadowMap.length>0&&se.setValue(B,"directionalShadowMap",ke.state.directionalShadowMap,K),ke.state.spotShadowMap.length>0&&se.setValue(B,"spotShadowMap",ke.state.spotShadowMap,K),ke.state.pointShadowMap.length>0&&se.setValue(B,"pointShadowMap",ke.state.pointShadowMap,K)),W.isSkinnedMesh){se.setOptional(B,W,"bindMatrix"),se.setOptional(B,W,"bindMatrixInverse");let ce=W.skeleton;ce&&(ce.boneTexture===null&&ce.computeBoneTexture(),se.setValue(B,"boneTexture",ce.boneTexture,K))}W.isBatchedMesh&&(se.setOptional(B,W,"batchingTexture"),se.setValue(B,"batchingTexture",W._matricesTexture,K),se.setOptional(B,W,"batchingIdTexture"),se.setValue(B,"batchingIdTexture",W._indirectTexture,K),se.setOptional(B,W,"batchingColorTexture"),W._colorsTexture!==null&&se.setValue(B,"batchingColorTexture",W._colorsTexture,K));let Yi=Y.morphAttributes;if((Yi.position!==void 0||Yi.normal!==void 0||Yi.color!==void 0)&&F.update(W,Y,ii),(qi||yt.receiveShadow!==W.receiveShadow)&&(yt.receiveShadow=W.receiveShadow,se.setValue(B,"receiveShadow",W.receiveShadow)),(V.isMeshStandardMaterial||V.isMeshLambertMaterial||V.isMeshPhongMaterial)&&V.envMap===null&&U.environment!==null&&(_e.envMapIntensity.value=U.environmentIntensity),_e.dfgLUT!==void 0&&(_e.dfgLUT.value=$0()),qi){if(se.setValue(B,"toneMappingExposure",A.toneMappingExposure),yt.needsLights&&Mu(_e,Pn),gt&&V.fog===!0&&Tt.refreshFogUniforms(_e,gt),Tt.refreshMaterialUniforms(_e,V,j,$,S.state.transmissionRenderTarget[E.id]),yt.needsLights&&yt.lightProbeGrid){let ce=yt.lightProbeGrid;_e.probesSH.value=ce.texture,_e.probesMin.value.copy(ce.boundingBox.min),_e.probesMax.value.copy(ce.boundingBox.max),_e.probesResolution.value.copy(ce.resolution)}as.upload(B,rc(yt),_e,K)}if(V.isShaderMaterial&&V.uniformsNeedUpdate===!0&&(as.upload(B,rc(yt),_e,K),V.uniformsNeedUpdate=!1),V.isSpriteMaterial&&se.setValue(B,"center",W.center),se.setValue(B,"modelViewMatrix",W.modelViewMatrix),se.setValue(B,"normalMatrix",W.normalMatrix),se.setValue(B,"modelMatrix",W.matrixWorld),V.uniformsGroups!==void 0){let ce=V.uniformsGroups;for(let Zi=0,In=ce.length;Zi<In;Zi++){let lc=ce[Zi];nt.update(lc,ii),nt.bind(lc,ii)}}return ii}function Mu(E,U){E.ambientLightColor.needsUpdate=U,E.lightProbe.needsUpdate=U,E.sunLights.needsUpdate=U,E.sunLightShadows.needsUpdate=U,E.directionalLights.needsUpdate=U,E.directionalLightShadows.needsUpdate=U,E.pointLights.needsUpdate=U,E.pointLightShadows.needsUpdate=U,E.spotLights.needsUpdate=U,E.spotLightShadows.needsUpdate=U,E.rectAreaLights.needsUpdate=U,E.hemisphereLights.needsUpdate=U}function Su(E){return E.isMeshLambertMaterial||E.isMeshToonMaterial||E.isMeshPhongMaterial||E.isMeshStandardMaterial||E.isShadowMaterial||E.isShaderMaterial&&E.lights===!0}this.getActiveCubeFace=function(){return G},this.getActiveMipmapLevel=function(){return k},this.getRenderTarget=function(){return q},this.setRenderTargetTextures=function(E,U,Y){let V=X.get(E);V.__autoAllocateDepthBuffer=E.resolveDepthBuffer===!1,V.__autoAllocateDepthBuffer===!1&&(V.__useRenderToTexture=!1),X.get(E.texture).__webglTexture=U,X.get(E.depthTexture).__webglTexture=V.__autoAllocateDepthBuffer?void 0:Y,V.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(E,U){let Y=X.get(E);Y.__webglFramebuffer=U,Y.__useDefaultFramebuffer=U===void 0},this.setRenderTarget=function(E,U=0,Y=0){q=E,G=U,k=Y;let V=null,W=!1,gt=!1;if(E){let mt=X.get(E);if(mt.__useDefaultFramebuffer!==void 0){y.bindFramebuffer(B.FRAMEBUFFER,mt.__webglFramebuffer),J.copy(E.viewport),rt.copy(E.scissor),ot=E.scissorTest,y.viewport(J),y.scissor(rt),y.setScissorTest(ot),H=-1;return}else if(mt.__webglFramebuffer===void 0)K.setupRenderTarget(E);else if(mt.__hasExternalTextures)K.rebindTextures(E,X.get(E.texture).__webglTexture,X.get(E.depthTexture).__webglTexture);else if(E.depthBuffer){let Ht=E.depthTexture;if(mt.__boundDepthTexture!==Ht){if(Ht!==null&&X.has(Ht)&&(E.width!==Ht.image.width||E.height!==Ht.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");K.setupDepthRenderbuffer(E)}}let St=E.texture;(St.isData3DTexture||St.isDataArrayTexture||St.isCompressedArrayTexture)&&(gt=!0);let Et=X.get(E).__webglFramebuffer;E.isWebGLCubeRenderTarget?(Array.isArray(Et[U])?V=Et[U][Y]:V=Et[U],W=!0):E.samples>0&&K.useMultisampledRTT(E)===!1?V=X.get(E).__webglMultisampledFramebuffer:Array.isArray(Et)?V=Et[Y]:V=Et,J.copy(E.viewport),rt.copy(E.scissor),ot=E.scissorTest}else J.copy(dt).multiplyScalar(j).floor(),rt.copy(Ot).multiplyScalar(j).floor(),ot=xe;if(Y!==0&&(V=D),y.bindFramebuffer(B.FRAMEBUFFER,V)&&y.drawBuffers(E,V),y.viewport(J),y.scissor(rt),y.setScissorTest(ot),W){let mt=X.get(E.texture);B.framebufferTexture2D(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_CUBE_MAP_POSITIVE_X+U,mt.__webglTexture,Y)}else if(gt){let mt=U;for(let St=0;St<E.textures.length;St++){let Et=X.get(E.textures[St]);B.framebufferTextureLayer(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0+St,Et.__webglTexture,Y,mt)}}else if(E!==null&&Y!==0){let mt=X.get(E.texture);B.framebufferTexture2D(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,mt.__webglTexture,Y)}H=-1};function ac(E){let U=X.get(E);return(U.__readFormat!==E.format||U.__readType!==E.type)&&(U.__readFormat=E.format,U.__readType=E.type,U.__formatReadable=R.textureFormatReadable(E.format),U.__typeReadable=R.textureTypeReadable(E.type)),U}this.readRenderTargetPixels=function(E,U,Y,V,W,gt,vt,mt=0){if(!(E&&E.isWebGLRenderTarget)){Nt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let St=X.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&vt!==void 0&&(St=St[vt]),St){y.bindFramebuffer(B.FRAMEBUFFER,St);try{let Et=E.textures[mt],Ht=Et.format,Wt=Et.type;E.textures.length>1&&B.readBuffer(B.COLOR_ATTACHMENT0+mt);let bt=ac(Et);if(bt.__formatReadable===!1){Nt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(bt.__typeReadable===!1){Nt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}U>=0&&U<=E.width-V&&Y>=0&&Y<=E.height-W&&B.readPixels(U,Y,V,W,ut.convert(Ht),ut.convert(Wt),gt)}finally{let Et=q!==null?X.get(q).__webglFramebuffer:null;y.bindFramebuffer(B.FRAMEBUFFER,Et)}}},this.readRenderTargetPixelsAsync=async function(E,U,Y,V,W,gt,vt,mt=0){if(!(E&&E.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let St=X.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&vt!==void 0&&(St=St[vt]),St)if(U>=0&&U<=E.width-V&&Y>=0&&Y<=E.height-W){y.bindFramebuffer(B.FRAMEBUFFER,St);let Et=E.textures[mt],Ht=Et.format,Wt=Et.type;E.textures.length>1&&B.readBuffer(B.COLOR_ATTACHMENT0+mt);let bt=ac(Et);if(bt.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(bt.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let te=B.createBuffer();B.bindBuffer(B.PIXEL_PACK_BUFFER,te),B.bufferData(B.PIXEL_PACK_BUFFER,gt.byteLength,B.STREAM_READ),B.readPixels(U,Y,V,W,ut.convert(Ht),ut.convert(Wt),0),B.bindBuffer(B.PIXEL_PACK_BUFFER,null);let ve=q!==null?X.get(q).__webglFramebuffer:null;y.bindFramebuffer(B.FRAMEBUFFER,ve);let ue=B.fenceSync(B.SYNC_GPU_COMMANDS_COMPLETE,0);return B.flush(),await Sh(B,ue,4),B.bindBuffer(B.PIXEL_PACK_BUFFER,te),B.getBufferSubData(B.PIXEL_PACK_BUFFER,0,gt),B.bindBuffer(B.PIXEL_PACK_BUFFER,null),B.deleteBuffer(te),B.deleteSync(ue),gt}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(E,U=null,Y=0){let V=Math.pow(2,-Y),W=Math.floor(E.image.width*V),gt=Math.floor(E.image.height*V),vt=U!==null?U.x:0,mt=U!==null?U.y:0;K.setTexture2D(E,0),B.copyTexSubImage2D(B.TEXTURE_2D,Y,0,0,vt,mt,W,gt),y.unbindTexture()},this.copyTextureToTexture=function(E,U,Y=null,V=null,W=0,gt=0){let vt,mt,St,Et,Ht,Wt,bt,te,ve,ue=E.isCompressedTexture?E.mipmaps[gt]:E.image;if(Y!==null)vt=Y.max.x-Y.min.x,mt=Y.max.y-Y.min.y,St=Y.isBox3?Y.max.z-Y.min.z:1,Et=Y.min.x,Ht=Y.min.y,Wt=Y.isBox3?Y.min.z:0;else{let _e=Math.pow(2,-W);vt=Math.floor(ue.width*_e),mt=Math.floor(ue.height*_e),E.isDataArrayTexture?St=ue.depth:E.isData3DTexture?St=Math.floor(ue.depth*_e):St=1,Et=0,Ht=0,Wt=0}V!==null?(bt=V.x,te=V.y,ve=V.z):(bt=0,te=0,ve=0);let ae=ut.convert(U.format),Ne=ut.convert(U.type),yt;U.isData3DTexture?(K.setTexture3D(U,0),yt=B.TEXTURE_3D):U.isDataArrayTexture||U.isCompressedArrayTexture?(K.setTexture2DArray(U,0),yt=B.TEXTURE_2D_ARRAY):(K.setTexture2D(U,0),yt=B.TEXTURE_2D),y.activeTexture(B.TEXTURE0),y.pixelStorei(B.UNPACK_FLIP_Y_WEBGL,U.flipY),y.pixelStorei(B.UNPACK_PREMULTIPLY_ALPHA_WEBGL,U.premultiplyAlpha),y.pixelStorei(B.UNPACK_ALIGNMENT,U.unpackAlignment);let ke=y.getParameter(B.UNPACK_ROW_LENGTH),Jt=y.getParameter(B.UNPACK_IMAGE_HEIGHT),ii=y.getParameter(B.UNPACK_SKIP_PIXELS),vi=y.getParameter(B.UNPACK_SKIP_ROWS),qi=y.getParameter(B.UNPACK_SKIP_IMAGES);y.pixelStorei(B.UNPACK_ROW_LENGTH,ue.width),y.pixelStorei(B.UNPACK_IMAGE_HEIGHT,ue.height),y.pixelStorei(B.UNPACK_SKIP_PIXELS,Et),y.pixelStorei(B.UNPACK_SKIP_ROWS,Ht),y.pixelStorei(B.UNPACK_SKIP_IMAGES,Wt);let Pn=E.isDataArrayTexture||E.isData3DTexture,se=U.isDataArrayTexture||U.isData3DTexture;if(E.isDepthTexture){let _e=X.get(E),Yi=X.get(U),ce=X.get(_e.__renderTarget),Zi=X.get(Yi.__renderTarget);y.bindFramebuffer(B.READ_FRAMEBUFFER,ce.__webglFramebuffer),y.bindFramebuffer(B.DRAW_FRAMEBUFFER,Zi.__webglFramebuffer);for(let In=0;In<St;In++)Pn&&(B.framebufferTextureLayer(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,X.get(E).__webglTexture,W,Wt+In),B.framebufferTextureLayer(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,X.get(U).__webglTexture,gt,ve+In)),B.blitFramebuffer(Et,Ht,vt,mt,bt,te,vt,mt,B.DEPTH_BUFFER_BIT,B.NEAREST);y.bindFramebuffer(B.READ_FRAMEBUFFER,null),y.bindFramebuffer(B.DRAW_FRAMEBUFFER,null)}else if(W!==0||E.isRenderTargetTexture||X.has(E)){let _e=X.get(E),Yi=X.get(U);y.bindFramebuffer(B.READ_FRAMEBUFFER,P),y.bindFramebuffer(B.DRAW_FRAMEBUFFER,N);for(let ce=0;ce<St;ce++)Pn?B.framebufferTextureLayer(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,_e.__webglTexture,W,Wt+ce):B.framebufferTexture2D(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,_e.__webglTexture,W),se?B.framebufferTextureLayer(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,Yi.__webglTexture,gt,ve+ce):B.framebufferTexture2D(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,Yi.__webglTexture,gt),W!==0?B.blitFramebuffer(Et,Ht,vt,mt,bt,te,vt,mt,B.COLOR_BUFFER_BIT,B.NEAREST):se?B.copyTexSubImage3D(yt,gt,bt,te,ve+ce,Et,Ht,vt,mt):B.copyTexSubImage2D(yt,gt,bt,te,Et,Ht,vt,mt);y.bindFramebuffer(B.READ_FRAMEBUFFER,null),y.bindFramebuffer(B.DRAW_FRAMEBUFFER,null)}else se?E.isDataTexture||E.isData3DTexture?B.texSubImage3D(yt,gt,bt,te,ve,vt,mt,St,ae,Ne,ue.data):U.isCompressedArrayTexture?B.compressedTexSubImage3D(yt,gt,bt,te,ve,vt,mt,St,ae,ue.data):B.texSubImage3D(yt,gt,bt,te,ve,vt,mt,St,ae,Ne,ue):E.isDataTexture?B.texSubImage2D(B.TEXTURE_2D,gt,bt,te,vt,mt,ae,Ne,ue.data):E.isCompressedTexture?B.compressedTexSubImage2D(B.TEXTURE_2D,gt,bt,te,ue.width,ue.height,ae,ue.data):B.texSubImage2D(B.TEXTURE_2D,gt,bt,te,vt,mt,ae,Ne,ue);y.pixelStorei(B.UNPACK_ROW_LENGTH,ke),y.pixelStorei(B.UNPACK_IMAGE_HEIGHT,Jt),y.pixelStorei(B.UNPACK_SKIP_PIXELS,ii),y.pixelStorei(B.UNPACK_SKIP_ROWS,vi),y.pixelStorei(B.UNPACK_SKIP_IMAGES,qi),gt===0&&U.generateMipmaps&&B.generateMipmap(yt),y.unbindTexture()},this.initRenderTarget=function(E){X.get(E).__webglFramebuffer===void 0&&K.setupRenderTarget(E)},this.initTexture=function(E){E.isCubeTexture?K.setTextureCube(E,0):E.isData3DTexture?K.setTexture3D(E,0):E.isDataArrayTexture||E.isCompressedArrayTexture?K.setTexture2DArray(E,0):K.setTexture2D(E,0),y.unbindTexture()},this.resetState=function(){G=0,k=0,q=null,y.reset(),_t.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return pi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=qt._getDrawingBufferColorSpace(t),e.unpackColorSpace=qt._getUnpackColorSpace()}};var Qt={size:576,gravity:9.81,waterDensity:1e3,dayLengthSec:180},aa={low:{id:"low",label:"\u041B\u0451\u0433\u043A\u043E\u0435",grid:144,maxPixelRatio:1.15,shadows:!1,shadowEvery:0,maxParticles:1100,treeCount:520,rockCount:180,substepsCap:6},medium:{id:"medium",label:"\u041E\u0431\u044B\u0447\u043D\u043E\u0435",grid:176,maxPixelRatio:1.6,shadows:!0,shadowEvery:3,maxParticles:2400,treeCount:920,rockCount:300,substepsCap:8},high:{id:"high",label:"\u0412\u044B\u0441\u043E\u043A\u043E\u0435",grid:208,maxPixelRatio:2,shadows:!0,shadowEvery:2,maxParticles:4200,treeCount:1400,rockCount:440,substepsCap:10}},ei={low_water:{id:"low_water",label:"\u041B\u0435\u0442\u043D\u044F\u044F \u043C\u0435\u0436\u0435\u043D\u044C",icon:"\u2600",inflowMult:.72,rainRate:0,sunIntensity:1.15,fogDensity:52e-5,next:{low_water:.25,normal:.55,rain:.2}},normal:{id:"normal",label:"\u041D\u043E\u0440\u043C\u0430\u043B\u044C\u043D\u044B\u0439 \u0441\u0442\u043E\u043A",icon:"\u25C8",inflowMult:1,rainRate:0,sunIntensity:1.04,fogDensity:66e-5,next:{low_water:.22,normal:.43,rain:.27,flood:.08}},rain:{id:"rain",label:"\u0414\u043E\u0436\u0434\u0435\u0432\u043E\u0439 \u043F\u0430\u0432\u043E\u0434\u043E\u043A",icon:"\u2602",inflowMult:1.52,rainRate:16e-5,sunIntensity:.58,fogDensity:.00105,next:{normal:.45,rain:.3,flood:.25}},flood:{id:"flood",label:"\u0412\u0435\u0441\u0435\u043D\u043D\u0435\u0435 \u043F\u043E\u043B\u043E\u0432\u043E\u0434\u044C\u0435",icon:"\u26A1",inflowMult:2.25,rainRate:34e-5,sunIntensity:.42,fogDensity:.00135,next:{rain:.55,normal:.45}}},la=[{id:"inspect",key:"1",name:"\u0413\u0438\u0434\u0440\u043E\u043F\u043E\u0441\u0442 / \u041E\u0441\u043C\u043E\u0442\u0440",short:"\u041E\u0441\u043C\u043E\u0442\u0440",icon:"\u{1F9ED}",costLabel:"\u0431\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u043E",desc:"\u0417\u0430\u043C\u0435\u0440 \u0433\u043B\u0443\u0431\u0438\u043D\u044B, \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u0438 \u0442\u0435\u0447\u0435\u043D\u0438\u044F, \u0447\u0438\u0441\u043B\u0430 \u0424\u0440\u0443\u0434\u0430, \u043E\u0442\u043C\u0435\u0442\u043E\u043A \u0434\u043D\u0430 \u0438 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0430 \u0437\u0430\u0442\u0432\u043E\u0440\u043E\u0432/\u0442\u0443\u0440\u0431\u0438\u043D."},{id:"canal_dig",key:"2",name:"\u042D\u043A\u0441\u043A\u0430\u0432\u0430\u0442\u043E\u0440 \u043A\u0430\u043D\u0430\u043B\u0430",short:"\u041A\u043E\u043F\u0430\u0442\u044C \u043A\u0430\u043D\u0430\u043B",icon:"\u26CF\uFE0F",costPerM3Soil:3.5,costPerM3Rock:16,costLabel:"3.5 \u20BD/\u043C\xB3 \u0433\u0440\u0443\u043D\u0442",desc:"\u041F\u0440\u043E\u0440\u044B\u0442\u044C \u0441\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439 \u043A\u0430\u043D\u0430\u043B \u0438\u043B\u0438 \u0443\u0433\u043B\u0443\u0431\u0438\u0442\u044C \u043E\u0442\u0432\u043E\u0434\u044F\u0449\u0435\u0435 \u0440\u0443\u0441\u043B\u043E. \u0417\u0430\u0436\u043C\u0438\u0442\u0435 Shift, \u0447\u0442\u043E\u0431\u044B \u0432\u0435\u0441\u0442\u0438 \u0438\u0434\u0435\u0430\u043B\u044C\u043D\u043E \u0440\u043E\u0432\u043D\u043E\u0435 \u0434\u043D\u043E \u0441 \u043F\u043B\u0430\u0432\u043D\u044B\u043C \u0443\u043A\u043B\u043E\u043D\u043E\u043C!"},{id:"canal_liner",key:"3",name:"\u0411\u0435\u0442\u043E\u043D\u043D\u0430\u044F \u043E\u0431\u043B\u0438\u0446\u043E\u0432\u043A\u0430 \u0440\u0443\u0441\u043B\u0430",short:"\u0411\u0435\u0442\u043E\u043D \u0440\u0443\u0441\u043B\u0430",icon:"\u{1F9F1}",costPerCell:65,costLabel:"65 \u20BD/\u0441\u0435\u043A\u0446\u0438\u044F",desc:"\u041E\u0431\u043B\u0438\u0446\u0435\u0432\u0430\u0442\u044C \u0434\u043D\u043E \u0438 \u043E\u0442\u043A\u043E\u0441\u044B \u043A\u0430\u043D\u0430\u043B\u0430 \u0433\u043B\u0430\u0434\u043A\u0438\u043C \u0431\u0435\u0442\u043E\u043D\u043E\u043C (n = 0.012): \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C \u043F\u043E\u0442\u043E\u043A\u0430 \u0432\u044B\u0448\u0435 \u0432 2.5 \u0440\u0430\u0437\u0430 \u0438 \u043D\u0443\u043B\u0435\u0432\u043E\u0439 \u0440\u0430\u0437\u043C\u044B\u0432 \u0431\u0435\u0440\u0435\u0433\u043E\u0432!"},{id:"earth_dam",key:"4",name:"\u0413\u0440\u0443\u043D\u0442\u043E\u0432\u0430\u044F \u0434\u0430\u043C\u0431\u0430 / \u043F\u0435\u0440\u0435\u043C\u044B\u0447\u043A\u0430",short:"\u0414\u0430\u043C\u0431\u0430 (\u0433\u0440\u0443\u043D\u0442)",icon:"\u26F0\uFE0F",costPerM3:5.5,costLabel:"5.5 \u20BD/\u043C\xB3 (\u0438\u0437 \u043E\u0442\u0432\u0430\u043B\u0430 -70%)",desc:"\u0414\u0435\u0448\u0451\u0432\u0430\u044F \u043D\u0430\u0441\u044B\u043F\u043D\u0430\u044F \u043F\u0435\u0440\u0435\u043C\u044B\u0447\u043A\u0430 \u0434\u043B\u044F \u043E\u0442\u0432\u043E\u0434\u0430 \u0440\u0435\u043A\u0438 \u0432 \u043E\u0431\u0445\u043E\u0434\u043D\u043E\u0439 \u043A\u0430\u043D\u0430\u043B \u0438\u043B\u0438 \u0437\u0430\u0449\u0438\u0442\u044B \u0433\u043E\u0440\u043E\u0434\u043E\u0432. \u0412\u043D\u0438\u043C\u0430\u043D\u0438\u0435: \u043F\u0440\u0438 \u043F\u0435\u0440\u0435\u043B\u0438\u0432\u0435 \u0447\u0435\u0440\u0435\u0437 \u0433\u0440\u0435\u0431\u0435\u043D\u044C \u0440\u0430\u0437\u043C\u044B\u0432\u0430\u0435\u0442\u0441\u044F!"},{id:"concrete_dam",key:"5",name:"\u0411\u0435\u0442\u043E\u043D\u043D\u0430\u044F \u043F\u043B\u043E\u0442\u0438\u043D\u0430",short:"\u041F\u043B\u043E\u0442\u0438\u043D\u0430",icon:"\u{1F3D7}\uFE0F",costPerM3:24,costLabel:"24 \u20BD/\u043C\xB3 \u0431\u0435\u0442\u043E\u043D\u0430",desc:"\u041C\u043E\u043D\u043E\u043B\u0438\u0442\u043D\u0430\u044F \u0433\u0440\u0430\u0432\u0438\u0442\u0430\u0446\u0438\u043E\u043D\u043D\u0430\u044F \u043F\u043B\u043E\u0442\u0438\u043D\u0430. \u0414\u0435\u0440\u0436\u0438\u0442 \u043E\u0433\u0440\u043E\u043C\u043D\u044B\u0439 \u043D\u0430\u043F\u043E\u0440 \u0432\u043E\u0434\u043E\u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0430 \u0438 \u043D\u0435 \u0440\u0430\u0437\u043C\u044B\u0432\u0430\u0435\u0442\u0441\u044F \u043F\u043E\u0442\u043E\u043A\u043E\u043C. \u041F\u043E\u0432\u0442\u043E\u0440\u043D\u044B\u0439 \u043F\u0440\u043E\u0445\u043E\u0434 \u043F\u043E\u0434\u043D\u0438\u043C\u0430\u0435\u0442 \u0433\u0440\u0435\u0431\u0435\u043D\u044C."},{id:"spillway",key:"6",name:"\u0412\u043E\u0434\u043E\u0441\u0431\u0440\u043E\u0441 \u0441 \u0437\u0430\u0442\u0432\u043E\u0440\u043E\u043C",short:"\u0412\u043E\u0434\u043E\u0441\u0431\u0440\u043E\u0441",icon:"\u{1F30A}",costFlat:4200,costLabel:"4 200 \u20BD",desc:"\u0420\u0435\u0433\u0443\u043B\u0438\u0440\u0443\u0435\u043C\u044B\u0439 \u0441\u0435\u0433\u043C\u0435\u043D\u0442\u043D\u044B\u0439 \u0437\u0430\u0442\u0432\u043E\u0440 \u0441 \u043D\u043E\u0441\u043A\u043E\u043C-\u0442\u0440\u0430\u043C\u043F\u043B\u0438\u043D\u043E\u043C: \u0441\u0431\u0440\u0430\u0441\u044B\u0432\u0430\u0435\u0442 \u043F\u0430\u0432\u043E\u0434\u043E\u043A \u044D\u0444\u0444\u0435\u043A\u0442\u043D\u043E\u0439 3D-\u0441\u0442\u0440\u0443\u0451\u0439 \u0438\u043B\u0438 \u043F\u0443\u0441\u043A\u0430\u0435\u0442 \u0432\u043E\u0434\u0443 \u0432 \u043A\u0430\u043D\u0430\u043B \u043F\u043E \u0440\u0430\u0441\u043F\u0438\u0441\u0430\u043D\u0438\u044E."},{id:"turbine_kaplan",key:"7",name:"\u0413\u042D\u0421 \u041A\u0430\u043F\u043B\u0430\u043D\u0430 (\u0440\u0443\u0441\u043B\u043E\u0432\u0430\u044F)",short:"\u041A\u0430\u043F\u043B\u0430\u043D 5 \u041C\u0412\u0442",icon:"\u2699\uFE0F",turbineType:"kaplan",costFlat:9500,costLabel:"9 500 \u20BD",desc:"\u041F\u043E\u0432\u043E\u0440\u043E\u0442\u043D\u043E-\u043B\u043E\u043F\u0430\u0441\u0442\u043D\u0430\u044F \u0442\u0443\u0440\u0431\u0438\u043D\u0430 \u0434\u043B\u044F \u043C\u0430\u043B\u044B\u0445 \u0438 \u0441\u0440\u0435\u0434\u043D\u0438\u0445 \u043D\u0430\u043F\u043E\u0440\u043E\u0432 (3\u201314 \u043C) \u0438 \u0431\u043E\u043B\u044C\u0448\u043E\u0433\u043E \u0440\u0430\u0441\u0445\u043E\u0434\u0430 \u0432\u043E\u0434\u044B. \u0418\u0434\u0435\u0430\u043B\u044C\u043D\u0430 \u0434\u043B\u044F \u043F\u0435\u0440\u0432\u043E\u0439 \u043F\u043B\u043E\u0442\u0438\u043D\u044B \u0438\u043B\u0438 \u043A\u0430\u043D\u0430\u043B\u0430!"},{id:"turbine_francis",key:"8",name:"\u0413\u042D\u0421 \u0424\u0440\u044D\u043D\u0441\u0438\u0441\u0430 (\u043D\u0430\u043F\u043E\u0440\u043D\u0430\u044F)",short:"\u0424\u0440\u044D\u043D\u0441\u0438\u0441 16 \u041C\u0412\u0442",icon:"\u26A1",turbineType:"francis",costFlat:24e3,costLabel:"24 000 \u20BD",desc:"\u041C\u043E\u0449\u043D\u044B\u0439 \u0440\u0430\u0434\u0438\u0430\u043B\u044C\u043D\u043E-\u043E\u0441\u0435\u0432\u043E\u0439 \u0433\u0438\u0434\u0440\u043E\u0430\u0433\u0440\u0435\u0433\u0430\u0442 \u0434\u043B\u044F \u0441\u0440\u0435\u0434\u043D\u0438\u0445 \u0438 \u0432\u044B\u0441\u043E\u043A\u0438\u0445 \u0431\u0435\u0442\u043E\u043D\u043D\u044B\u0445 \u043F\u043B\u043E\u0442\u0438\u043D (10\u201335 \u043C). \u0412\u044B\u0441\u043E\u043A\u0438\u0439 \u041A\u041F\u0414 93%."},{id:"turbine_pelton",key:"9",name:"\u0413\u042D\u0421 \u041F\u0435\u043B\u0442\u043E\u043D\u0430 (\u0434\u0435\u0440\u0438\u0432\u0430\u0446\u0438\u043E\u043D\u043D\u0430\u044F)",short:"\u041F\u0435\u043B\u0442\u043E\u043D 24 \u041C\u0412\u0442",icon:"\u{1F3D4}\uFE0F",turbineType:"pelton",costFlat:32e3,costLabel:"32 000 \u20BD",desc:"\u0412\u044B\u0441\u043E\u043A\u043E\u043D\u0430\u043F\u043E\u0440\u043D\u0430\u044F \u043A\u043E\u0432\u0448\u043E\u0432\u0430\u044F \u0442\u0443\u0440\u0431\u0438\u043D\u0430 (14\u201348 \u043C): \u0441\u0442\u0430\u0432\u0438\u0442\u0441\u044F \u043D\u0430 \u043A\u0440\u0443\u0442\u043E\u043C \u0441\u0431\u0440\u043E\u0441\u0435 \u0438\u0437 \u0434\u0435\u0440\u0438\u0432\u0430\u0446\u0438\u043E\u043D\u043D\u043E\u0433\u043E \u043A\u0430\u043D\u0430\u043B\u0430 \u0438\u043B\u0438 \u0443 \u0432\u044B\u0441\u043E\u043A\u043E\u0439 \u043F\u043B\u043E\u0442\u0438\u043D\u044B \u0432 \u043A\u0430\u043D\u044C\u043E\u043D\u0435."},{id:"powerline",key:"0",name:"\u041B\u042D\u041F 110 \u043A\u0412 \u043A \u0433\u043E\u0440\u043E\u0434\u0430\u043C",short:"\u041B\u042D\u041F \u043A \u0433\u043E\u0440\u043E\u0434\u0443",icon:"\u{1F5FC}",costPerMeter:14,costLabel:"14 \u20BD/\u043C \u043B\u0438\u043D\u0438\u0438",desc:"\u041A\u043B\u0438\u043A\u043D\u0438\u0442\u0435 \u043F\u043E \u0433\u043E\u0440\u043E\u0434\u0443 \u0438\u043B\u0438 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u0443\u0439\u0442\u0435 \u043F\u0430\u043D\u0435\u043B\u044C \u0441\u0435\u0442\u0438, \u0447\u0442\u043E\u0431\u044B \u043F\u0440\u043E\u0442\u044F\u043D\u0443\u0442\u044C \u043E\u043F\u043E\u0440\u044B \u041B\u042D\u041F \u043E\u0442 \u0432\u0430\u0448\u0435\u0439 \u0413\u042D\u0421 \u0438 \u043D\u0430\u0447\u0430\u0442\u044C \u043F\u0440\u043E\u0434\u0430\u0432\u0430\u0442\u044C \u044D\u043B\u0435\u043A\u0442\u0440\u043E\u044D\u043D\u0435\u0440\u0433\u0438\u044E."},{id:"demolish",key:"X",name:"\u0414\u0435\u043C\u043E\u043D\u0442\u0430\u0436 / \u0420\u0430\u0441\u0447\u0438\u0441\u0442\u043A\u0430",short:"\u0421\u043D\u043E\u0441",icon:"\u{1F9E8}",costFlat:250,costLabel:"250 \u20BD",desc:"\u0421\u043D\u0435\u0441\u0442\u0438 \u0433\u0438\u0434\u0440\u043E\u0430\u0433\u0440\u0435\u0433\u0430\u0442, \u0437\u0430\u0442\u0432\u043E\u0440 \u0438\u043B\u0438 \u0440\u0430\u0437\u043E\u0431\u0440\u0430\u0442\u044C \u0431\u0435\u0442\u043E\u043D\u043D\u044B\u0439 \u0431\u043B\u043E\u043A \u043F\u043B\u043E\u0442\u0438\u043D\u044B."}],iu={kaplan:{id:"kaplan",name:"\u041A\u0430\u043F\u043B\u0430\u043D\u0430 \u041F\u041B-6",ratedMW:6.5,minHead:2.2,optHead:8,maxHead:20,headSigma:11.5,maxArea:4.8,peakEta:.91,frictionK:18e-5,upkeepPerSec:10,cost:9500,color:3900150},francis:{id:"francis",name:"\u0424\u0440\u044D\u043D\u0441\u0438\u0441\u0430 \u0420\u041E-18",ratedMW:18,minHead:5,optHead:16.5,maxHead:42,headSigma:15.5,maxArea:6.2,peakEta:.935,frictionK:12e-5,upkeepPerSec:24,cost:24e3,color:16096779},pelton:{id:"pelton",name:"\u041F\u0435\u043B\u0442\u043E\u043D\u0430 \u041A-28",ratedMW:28,minHead:9,optHead:25,maxHead:60,headSigma:20,maxArea:5.2,peakEta:.925,frictionK:1e-4,upkeepPerSec:32,cost:32e3,color:1096065}},ai={startingCash:48e3,baseRatePerMWSec:340,irrigationBonusPerSec:95,overSupplyExportFactor:.38,loanChunk:25e3,loanInterestPerSec:45e-5,maxLoan:125e3};function ql(s){let t=(s%24+24)%24;return t>=0&&t<6?.58:t>=6&&t<10.5?1.62:t>=10.5&&t<17?1.05:t>=17&&t<22?2.35:.82}function nu(s){let t=(s%24+24)%24;return t>=0&&t<6?{label:"\u041D\u043E\u0447\u043D\u043E\u0439 \u043C\u0438\u043D\u0438\u043C\u0443\u043C (\u043A\u043E\u043F\u0438\u0442\u0435 \u0432\u043E\u0434\u0443)",cls:"offpeak"}:t>=6&&t<10.5?{label:"\u0423\u0442\u0440\u0435\u043D\u043D\u0438\u0439 \u043F\u0438\u043A \xD71.62",cls:"peak"}:t>=10.5&&t<17?{label:"\u0414\u043D\u0435\u0432\u043D\u043E\u0439 \u043F\u043E\u043B\u0443\u043F\u0438\u043A \xD71.05",cls:"mid"}:t>=17&&t<22?{label:"\u0412\u0435\u0447\u0435\u0440\u043D\u0438\u0439 \u0421\u0423\u041F\u0415\u0420-\u041F\u0418\u041A \xD72.35",cls:"superpeak"}:{label:"\u0421\u043F\u0430\u0434 \u043D\u0430\u0433\u0440\u0443\u0437\u043A\u0438 \xD70.82",cls:"offpeak"}}var cs=[{id:"posad",name:"\u0420\u0435\u0447\u043D\u043E\u0439 \u041F\u043E\u0441\u0430\u0434",subtitle:"\u0414\u0435\u0440\u0435\u0432\u043E\u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u0438 \u0440\u0435\u0447\u043D\u043E\u0439 \u043F\u043E\u0440\u0442",x:-118,z:162,plateauRadius:52,baseElevation:17.5,startPop:420,baseDemandMW:.35,demandPerBuilding:.075,tariffBonus:1,connectedAtStart:!0,accent:6333946,archetype:"town"},{id:"agro",name:"\u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u0430",subtitle:"\u041F\u043E\u043B\u044F, \u0442\u0435\u043F\u043B\u0438\u0446\u044B \u0438 \u043E\u0440\u043E\u0441\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u0443\u0437\u0435\u043B",x:168,z:86,plateauRadius:56,baseElevation:18,startPop:560,baseDemandMW:.45,demandPerBuilding:.085,tariffBonus:1.08,needsIrrigation:!0,irrigationTarget:{x:128,z:76,radius:34},connectedAtStart:!1,accent:3462041,archetype:"agro"},{id:"kamen",name:"\u041A\u0430\u043C\u0435\u043D\u043D\u043E\u0433\u043E\u0440\u0441\u043A",subtitle:"\u0413\u043E\u0440\u043D\u043E\u0440\u0443\u0434\u043D\u044B\u0439 \u043A\u043E\u043C\u0431\u0438\u043D\u0430\u0442 \u0438 \u0437\u0430\u0432\u043E\u0434\u044B",x:152,z:-136,plateauRadius:54,baseElevation:33.5,startPop:890,baseDemandMW:.85,demandPerBuilding:.14,tariffBonus:1.22,connectedAtStart:!1,accent:16498468,archetype:"industrial"},{id:"svetlograd",name:"\u0421\u0432\u0435\u0442\u043B\u043E\u0433\u0440\u0430\u0434",subtitle:"\u0421\u0442\u043E\u043B\u0438\u0446\u0430 \u0434\u043E\u043B\u0438\u043D\u044B \u0438 \u0442\u0435\u0445\u043D\u043E\u043F\u0430\u0440\u043A",x:-158,z:-24,plateauRadius:68,baseElevation:24.5,startPop:1650,baseDemandMW:1.25,demandPerBuilding:.18,tariffBonus:1.18,connectedAtStart:!1,accent:10980346,archetype:"metropolis"}],Ks=[{id:"first_watt",title:"\u041F\u0435\u0440\u0432\u044B\u0439 \u0442\u043E\u043A \u0432 \u0441\u0435\u0442\u0438!",desc:"\u0417\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u0435 \u043F\u0435\u0440\u0432\u0443\u044E \u0442\u0443\u0440\u0431\u0438\u043D\u0443 \u0438 \u0432\u044B\u0434\u0430\u0439\u0442\u0435 \u0445\u043E\u0442\u044F \u0431\u044B 0.5 \u041C\u0412\u0442 \u043C\u043E\u0449\u043D\u043E\u0441\u0442\u0438.",reward:1e4,check:s=>s.totalMW>=.5},{id:"custom_canal",title:"\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439 \u043A\u0430\u043D\u0430\u043B",desc:"\u041F\u0440\u043E\u043A\u043E\u043F\u0430\u0439\u0442\u0435 \u043D\u0435 \u043C\u0435\u043D\u0435\u0435 450 \u043C\xB3 \u0433\u0440\u0443\u043D\u0442\u0430 \u0434\u043B\u044F \u0434\u0435\u0440\u0438\u0432\u0430\u0446\u0438\u043E\u043D\u043D\u043E\u0433\u043E, \u043E\u0431\u0432\u043E\u0434\u043D\u043E\u0433\u043E \u0438\u043B\u0438 \u043E\u0440\u043E\u0441\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0433\u043E \u043A\u0430\u043D\u0430\u043B\u0430.",reward:12e3,check:s=>s.excavatedM3>=450},{id:"irrigation_done",title:"\u0416\u0438\u0432\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u0432\u043B\u0430\u0433\u0430 \u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u044B",desc:"\u041F\u043E\u0434\u0432\u0435\u0434\u0438\u0442\u0435 \u0432\u043E\u0434\u0443 \u0441\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u043C \u043A\u0430\u043D\u0430\u043B\u043E\u043C \u043A \u0432\u043E\u0434\u043E\u0437\u0430\u0431\u043E\u0440\u0443 \u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u044B.",reward:16e3,check:s=>s.agroIrrigated===!0},{id:"power_8mw",title:"\u041C\u0430\u043B\u0430\u044F \u044D\u043D\u0435\u0440\u0433\u0435\u0442\u0438\u043A\u0430 \u043F\u0440\u043E\u0439\u0434\u0435\u043D\u0430 (8 \u041C\u0412\u0442)",desc:"\u0414\u043E\u0441\u0442\u0438\u0433\u043D\u0438\u0442\u0435 \u0441\u0443\u043C\u043C\u0430\u0440\u043D\u043E\u0439 \u0433\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u0438 8 \u041C\u0412\u0442 \u043D\u0430 \u0432\u0430\u0448\u0438\u0445 \u0433\u0438\u0434\u0440\u043E\u0430\u0433\u0440\u0435\u0433\u0430\u0442\u0430\u0445.",reward:22e3,check:s=>s.totalMW>=8},{id:"all_cities_grid",title:"\u0415\u0434\u0438\u043D\u0430\u044F \u044D\u043D\u0435\u0440\u0433\u043E\u0441\u0438\u0441\u0442\u0435\u043C\u0430 \u0434\u043E\u043B\u0438\u043D\u044B",desc:"\u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0438\u0442\u0435 \u043B\u0438\u043D\u0438\u044F\u043C\u0438 \u041B\u042D\u041F \u0432\u0441\u0435 4 \u0433\u043E\u0440\u043E\u0434\u0430 \u0434\u043E\u043B\u0438\u043D\u044B \u0438 \u043F\u043E\u0434\u0430\u0439\u0442\u0435 \u0438\u043C \u043D\u0430\u043F\u0440\u044F\u0436\u0435\u043D\u0438\u0435.",reward:28e3,check:s=>s.connectedCities>=4&&s.totalMW>=4},{id:"growing_valley",title:"\u0411\u0443\u043C \u0433\u0440\u0430\u0434\u043E\u0441\u0442\u0440\u043E\u0438\u0442\u0435\u043B\u044C\u0441\u0442\u0432\u0430",desc:"\u041E\u0431\u0435\u0441\u043F\u0435\u0447\u044C\u0442\u0435 \u0433\u043E\u0440\u043E\u0434\u0430 \u044D\u043D\u0435\u0440\u0433\u0438\u0435\u0439 \u0442\u0430\u043A, \u0447\u0442\u043E\u0431\u044B \u0441\u043E\u0432\u043E\u043A\u0443\u043F\u043D\u043E\u0435 \u043D\u0430\u0441\u0435\u043B\u0435\u043D\u0438\u0435 \u0434\u043E\u043B\u0438\u043D\u044B \u043F\u0440\u0435\u0432\u044B\u0441\u0438\u043B\u043E 8 000 \u0436\u0438\u0442\u0435\u043B\u0435\u0439.",reward:38e3,check:s=>s.totalPopulation>=8e3},{id:"cascade_25mw",title:"\u0424\u043B\u0430\u0433\u043C\u0430\u043D \u0433\u0438\u0434\u0440\u043E\u044D\u043D\u0435\u0440\u0433\u0435\u0442\u0438\u043A\u0438 (25 \u041C\u0412\u0442)",desc:"\u0420\u0430\u0441\u043A\u0440\u0443\u0442\u0438\u0442\u0435 \u043A\u0430\u0441\u043A\u0430\u0434 \u0413\u042D\u0421 \u0434\u043E \u043C\u043E\u0449\u043D\u043E\u0441\u0442\u0438 25 \u041C\u0412\u0442!",reward:6e4,check:s=>s.totalMW>=25}];function su(s=navigator,t=window){let e=(s.maxTouchPoints||0)>0&&(/Android|iPhone|iPad|iPod|Mobile/i.test(s.userAgent||"")||t.matchMedia&&t.matchMedia("(pointer: coarse)").matches),i=s.deviceMemory>0&&s.deviceMemory<=4||s.hardwareConcurrency>0&&s.hardwareConcurrency<=4,n=!e&&!i&&(s.hardwareConcurrency||8)>=8;return{touch:!!e,weak:!!i,low:!!(e||i),recommendedQuality:e||i?"low":n?"high":"medium"}}function ru(s=window){try{let t=s.location&&s.location.search||"",e=new URLSearchParams(t);return e.get("safe")==="1"||e.get("safe")===""}catch{return!1}}var J0="2026-10-31 16:40",ca=null;function Yl(){if(ca)return ca;let s={webgl2:!1,webgl:!1,floatTex:!1,halfFloatTex:!1,vendor:"\u2014",renderer:"\u2014",reason:null};try{let t=document.createElement("canvas");t.width=16,t.height=16;let e=t.getContext("webgl2",{failIfMajorPerformanceCaveat:!1});if(e?(s.webgl2=!0,s.webgl=!0,s.floatTex=!!e.getExtension("EXT_color_buffer_float"),s.halfFloatTex=!0):(e=t.getContext("webgl",{failIfMajorPerformanceCaveat:!1})||t.getContext("experimental-webgl",{}),e&&(s.webgl=!0,s.floatTex=!!e.getExtension("OES_texture_float"),s.halfFloatTex=!!e.getExtension("OES_texture_half_float"))),!e)return s.reason="\u0411\u0440\u0430\u0443\u0437\u0435\u0440 \u043D\u0435 \u0432\u044B\u0434\u0430\u043B WebGL-\u043A\u043E\u043D\u0442\u0435\u043A\u0441\u0442 (\u0432\u044B\u043A\u043B\u044E\u0447\u0435\u043D\u043E \u0430\u043F\u043F\u0430\u0440\u0430\u0442\u043D\u043E\u0435 \u0443\u0441\u043A\u043E\u0440\u0435\u043D\u0438\u0435).",ca=s,s;let i=e.getExtension("WEBGL_debug_renderer_info");i?(s.vendor=e.getParameter(i.UNMASKED_VENDOR_WEBGL)||"\u2014",s.renderer=e.getParameter(i.UNMASKED_RENDERER_WEBGL)||"\u2014"):(s.vendor=e.getParameter(e.VENDOR)||"\u2014",s.renderer=e.getParameter(e.RENDERER)||"\u2014")}catch(t){s.reason=t.message}return ca=s,s}function ou(s={}){let t=Yl();return[`\u041A\u0410\u0421\u041A\u0410\u0414: \u0416\u0438\u0432\u0430\u044F \u0412\u043E\u0434\u0430 \xB7 \u0441\u0431\u043E\u0440\u043A\u0430 ${J0}`,`GPU: ${t.renderer} (${t.vendor})`,`WebGL2: ${t.webgl2?"\u0434\u0430":"\u043D\u0435\u0442"} \xB7 FloatTex: ${t.floatTex?"RGBA32F":t.halfFloatTex?"RGBA16F":"Uint8 fallback"}`,`\u041A\u0430\u0434\u0440: ${s.fps||0} FPS \xB7 \u0424\u0438\u0437\u0438\u043A\u0430 \u0432\u043E\u0434\u044B: ${(s.hydroMs||0).toFixed(2)} \u043C\u0441/\u043A\u0430\u0434\u0440`,`\u0421\u0435\u0442\u043A\u0430 \u0432\u043E\u0434\u044B: ${s.grid||"\u2014"} \xB7 \u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0435 \u0442\u0430\u0439\u043B\u044B 8\xD78: ${s.activeTiles||0}/${s.totalTiles||0} (\u043F\u0440\u043E\u043F\u0443\u0441\u043A \u0441\u0443\u0445\u0438\u0445 \u0441\u043A\u043B\u043E\u043D\u043E\u0432)`,`\u041F\u043E\u0434\u0448\u0430\u0433\u0438 CFL: ${s.substeps||0} \xB7 \u041C\u0430\u0441\u0441\u0430 \u0432\u043E\u0434\u044B: ${((s.waterVolumeM3||0)/1e3).toFixed(1)} \u0442\u044B\u0441. \u043C\xB3`,`Draw calls: ${s.drawCalls||0} \xB7 \u0422\u0440\u0435\u0443\u0433\u043E\u043B\u044C\u043D\u0438\u043A\u0438: ${s.triangles||0} \xB7 \u0418\u043D\u0441\u0442\u0430\u043D\u0441\u044B \u0437\u0434\u0430\u043D\u0438\u0439: ${s.cityBuildings||0}`,`\u042F\u0434\u0440\u043E \u044D\u043A\u043E\u043D\u043E\u043C\u0438\u043A\u0438: FixedClock 30 \u0413\u0446 (\u041F\u0435\u0440\u0435\u043F\u043B\u0451\u0442) \xB7 \u0422\u0435\u043D\u0438: ${s.shadows||"\u0432\u044B\u043A\u043B"}`].join(`
`)}function it(s,t,e){return s<t?t:s>e?e:s}function li(s,t,e){let i=it((e-s)/(t-s||1e-6),0,1);return i*i*(3-2*i)}function oe(s,t,e){return s+(t-s)*e}function Qs(s=20261031){let t=s>>>0||1;return()=>{t=t+1831565813|0;let e=Math.imul(t^t>>>15,1|t);return e=e+Math.imul(e^e>>>7,61|e)^e,((e^e>>>14)>>>0)/4294967296}}function ha(s,t){let e=Math.imul(s,374761393)+Math.imul(t,668265263);return e=Math.imul(e^e>>>13,1274126177),((e^e>>>16)>>>0)/4294967295}function au(s,t){let e=Math.floor(s),i=Math.floor(t),n=s-e,r=t-i,o=n*n*(3-2*n),a=r*r*(3-2*r),l=ha(e,i),c=ha(e+1,i),h=ha(e,i+1),d=ha(e+1,i+1);return oe(oe(l,c,o),oe(h,d,o),a)*2-1}function Zl(s,t,e=5,i=2.05,n=.5){let r=.5,o=1,a=0,l=0;for(let c=0;c<e;c++)a+=r*au(s*o,t*o),l+=r,o*=i,r*=n;return a/(l||1)}function lu(s,t,e=4){let i=.5,n=1,r=0,o=0;for(let a=0;a<e;a++){let l=1-Math.abs(au(s*n,t*n));r+=i*l*l,o+=i,n*=2.1,i*=.5}return r/(o||1)}function $l(s,t,e){let i=1/0,n=0,r=10,o=0,a=1,l=0,c=0;for(let d=0;d<e.length-1;d++)c+=Math.hypot(e[d+1].x-e[d].x,e[d+1].z-e[d].z);let h=0;for(let d=0;d<e.length-1;d++){let u=e[d],p=e[d+1],g=p.x-u.x,_=p.z-u.z,m=g*g+_*_||1e-6,f=Math.sqrt(m),v=it(((s-u.x)*g+(t-u.z)*_)/m,0,1),C=u.x+g*v,M=u.z+_*v,b=(s-C)*(s-C)+(t-M)*(t-M);b<i&&(i=b,n=oe(u.bed,p.bed,v),r=oe(u.width,p.width,v),o=g/f,a=_/f,l=(h+f*v)/(c||1)),h+=f}return{dist:Math.sqrt(i),bed:n,width:r,tx:o,tz:a,s:l}}var K0=[{x:-68,z:-282,bed:31.8,width:15},{x:-42,z:-242,bed:29.6,width:19},{x:-16,z:-202,bed:27.6,width:25},{x:4,z:-164,bed:25.8,width:20},{x:10,z:-132,bed:23.8,width:13},{x:12,z:-96,bed:20.8,width:15},{x:76,z:-50,bed:18.6,width:19},{x:104,z:20,bed:16.3,width:20},{x:68,z:84,bed:13.6,width:21},{x:2,z:92,bed:10.6,width:20},{x:-38,z:154,bed:8.3,width:23},{x:-20,z:226,bed:6.4,width:26},{x:8,z:288,bed:4.5,width:30}],Q0=[{x:112,z:-280,bed:36.5,width:10},{x:74,z:-244,bed:33.2,width:11},{x:30,z:-216,bed:29.8,width:12},{x:-12,z:-198,bed:27.5,width:14}];function cu(s,t){let{bedrock:e,soil:i,concrete:n,h:r,hu:o,hv:a,wetness:l}=t,c=Qt.size*.5,h=Qt.size/s;for(let d=0;d<s;d++){let u=-c+(d+.5)*h,p=it((288-u)/576,0,1);for(let g=0;g<s;g++){let _=-c+(g+.5)*h,m=d*s+g,f=Math.abs(_)/c,v=Math.pow(it((f-.52)/.48,0,1),1.85)*32,C=li(-130,-285,u)*(16+18*lu(_*.011+3.1,u*.011-1.7,4)),M=Zl(_*.0065+11.3,u*.0065+4.7,5)*7.5,b=Zl(_*.024-5.2,u*.024+8.9,3)*1.65,S=12+p*21+v+C+M+b,T=(u- -124)/42;if(Math.abs(T)<1.3){let rt=Math.exp(-T*T*1.9),ot=Math.abs(_-10),Bt=li(11,44,ot)*(1-li(68,128,ot));S+=rt*Bt*21.5}let x=1-li(14,42,Math.abs(_- -12)),w=li(-94,-68,u)*(1-li(62,90,u)),A=x*w;if(A>.001){let rt=oe(22.8,16.2,it((u- -80)/155,0,1));S=oe(S,rt,A*.78)}let I=0;for(let rt=0;rt<cs.length;rt++){let ot=cs[rt],Bt=Math.hypot(_-ot.x,u-ot.z),Dt=1-li(ot.plateauRadius*.68,ot.plateauRadius*1.28,Bt);Dt>.001&&(S=oe(S,ot.baseElevation,Dt*.94),I=Math.max(I,Dt))}let L=Math.hypot(_-128,u-76);if(L<34){let rt=1-li(12,34,L);S=oe(S,14.4,rt*.88)}let D=$l(_,u,K0),P=$l(_,u,Q0),N=0,G=0,k=0,q=0,H=D.width*.5;if(D.dist<H*3.6){let rt=1-li(H*.82,H*3.4,D.dist),ot=it(D.dist/H,0,1),Bt=D.bed+Math.pow(ot,2.2)*2.5;if(S=oe(S,Math.min(S,Bt+(1-rt)*5),rt),D.dist<H*1.08){S=Math.min(S,D.bed+Math.pow(D.dist/(H*1.08),2.4)*2.1);let Dt=D.bed+1.95;if(Dt>S+.05){N=Dt-S;let Ut=2.15;G=D.tx*Ut,k=D.tz*Ut,q=1}}}let Z=P.width*.5;if(P.dist<Z*3.2&&u<-184){let rt=1-li(Z*.8,Z*3,P.dist),ot=P.bed+Math.pow(it(P.dist/Z,0,1),2.1)*1.9;if(S=oe(S,Math.min(S,ot+(1-rt)*4),rt),P.dist<Z*1.06){S=Math.min(S,P.bed+Math.pow(P.dist/(Z*1.06),2.2)*1.6);let Bt=P.bed+1.25;Bt>S+.05&&Bt-S>N&&(N=Bt-S,G=P.tx*2.3,k=P.tz*2.3,q=1)}}let J=2.6+A*3.8+I*1.4-li(32,52,S)*2.1;Math.abs(u- -124)<38&&Math.abs(_-10)<48&&(J=Math.min(J,.45)),q&&(J=it(J*.35,.35,1.4)),J=it(J,.15,7.5),e[m]=Math.max(.5,S-J),i[m]=J,n[m]=0,r[m]=N,o[m]=N*G,a[m]=N*k,l[m]=N>.02?1:0}}}var ze=Qt.gravity,j0=Qt.waterDensity,ua=.014,hu=ua*ua*ua*ua,Ni=26,Lt=8,da=class{constructor(t=160){this.grid=t,this.count=t*t,this.dx=Qt.size/t,this.cellArea=this.dx*this.dx,this.bedrock=new Float32Array(this.count),this.soil=new Float32Array(this.count),this.concrete=new Float32Array(this.count),this.gateWall=new Float32Array(this.count),this.zb=new Float32Array(this.count),this.linedMask=new Uint8Array(this.count),this.earthDamMask=new Uint8Array(this.count),this.h=new Float32Array(this.count),this.hu=new Float32Array(this.count),this.hv=new Float32Array(this.count),this.dH=new Float32Array(this.count),this.dHU=new Float32Array(this.count),this.dHV=new Float32Array(this.count),this.u=new Float32Array(this.count),this.v=new Float32Array(this.count),this.vort=new Float32Array(this.count),this.sediment=new Float32Array(this.count),this.foam=new Float32Array(this.count),this.sedNext=new Float32Array(this.count),this.foamNext=new Float32Array(this.count),this.wetness=new Float32Array(this.count),this.tilesN=Math.ceil(t/Lt),this.totalTiles=this.tilesN*this.tilesN,this.tileWet=new Uint8Array(this.totalTiles),this.activeTiles=new Int32Array(this.totalTiles),this.activeTileCount=0,this.terrainDirty=!0,this.dirtyMinX=0,this.dirtyMinZ=0,this.dirtyMaxX=t-1,this.dirtyMaxZ=t-1,this.turbines=[],this.spillways=[],this.nextStructId=1,this.soilStockpileM3=0,this.totalExcavatedM3=0,this.inflowMult=1,this.rainRate=0,this.lastSubsteps=0,this.lastStepMs=0,this.totalWaterVolumeM3=0,this.simTime=0,this._erosionTick=0,this.jetEmitters=[],this.resetValley()}resetValley(){this.bedrock.fill(0),this.soil.fill(0),this.concrete.fill(0),this.gateWall.fill(0),this.linedMask.fill(0),this.earthDamMask.fill(0),this.h.fill(0),this.hu.fill(0),this.hv.fill(0),this.vort.fill(0),this.sediment.fill(0),this.foam.fill(0),this.wetness.fill(0),this.turbines=[],this.spillways=[],this.soilStockpileM3=0,this.totalExcavatedM3=0,cu(this.grid,this),this.recomputeZbRange(0,0,this.grid-1,this.grid-1),this._rebuildVelocitiesAll(),this._rebuildActiveTiles();for(let t=0;t<18;t++)this._substep(.045)}worldToGrid(t,e){let i=Qt.size*.5,n=Math.floor((t+i)/this.dx),r=Math.floor((e+i)/this.dx);return{gx:it(n,0,this.grid-1),gz:it(r,0,this.grid-1)}}gridToWorld(t,e){let i=Qt.size*.5;return{wx:-i+(t+.5)*this.dx,wz:-i+(e+.5)*this.dx}}recomputeZbRange(t,e,i,n){let r=this.grid,o=it(t,0,r-1),a=it(e,0,r-1),l=it(i,0,r-1),c=it(n,0,r-1);for(let h=a;h<=c;h++){let d=h*r;for(let u=o;u<=l;u++){let p=d+u;this.zb[p]=this.bedrock[p]+this.soil[p]+this.concrete[p]+this.gateWall[p]}}this.markTerrainDirty(o,a,l,c)}markTerrainDirty(t,e,i,n){this.terrainDirty?(t<this.dirtyMinX&&(this.dirtyMinX=t),e<this.dirtyMinZ&&(this.dirtyMinZ=e),i>this.dirtyMaxX&&(this.dirtyMaxX=i),n>this.dirtyMaxZ&&(this.dirtyMaxZ=n)):(this.terrainDirty=!0,this.dirtyMinX=t,this.dirtyMinZ=e,this.dirtyMaxX=i,this.dirtyMaxZ=n)}consumeTerrainDirty(){if(!this.terrainDirty)return null;let t={x0:it(this.dirtyMinX-1,0,this.grid-1),z0:it(this.dirtyMinZ-1,0,this.grid-1),x1:it(this.dirtyMaxX+1,0,this.grid-1),z1:it(this.dirtyMaxZ+1,0,this.grid-1)};return this.terrainDirty=!1,t}sampleAtWorld(t,e){let{gx:i,gz:n}=this.worldToGrid(t,e),r=n*this.grid+i,o=this.h[r],a=this.zb[r],l=this.u[r],c=this.v[r],h=Math.hypot(l,c),d=o>.03?h/Math.sqrt(ze*o):0;return{gx:i,gz:n,bed:a,bedrock:this.bedrock[r],soil:this.soil[r],concrete:this.concrete[r],lined:this.linedMask[r]===1,earthDam:this.earthDamMask[r]===1,depth:o,surface:a+o,u:l,v:c,speed:h,froude:d,vorticity:this.vort[r],sediment:this.sediment[r],foam:this.foam[r]}}excavateCanal(t,e,i,n,r,o,a=!1){let{gx:l,gz:c}=this.worldToGrid(t,e),h=Math.max(1,Math.ceil(i/this.dx)),d=0,u=0,p=0,g=it(l-h,1,this.grid-2),_=it(l+h,1,this.grid-2),m=it(c-h,1,this.grid-2),f=it(c+h,1,this.grid-2);for(let v=m;v<=f;v++)for(let C=g;C<=_;C++){let M=Math.hypot(C-l,v-c)*this.dx;if(M>i)continue;let b=v*this.grid+C;if(this.concrete[b]>.25||this.gateWall[b]>.1)continue;let S=it(M/(i||1),0,1),T=S<.55?1:Math.cos((S-.55)/.45*Math.PI*.5);if(T<=.02)continue;let x=this.bedrock[b]+this.soil[b],w=n*T;if(Number.isFinite(r)){let P=S>.55?(S-.55)*4.2:0,N=r+P;if(x<=N)continue;w=Math.min(n*1.8,x-N)}if(w<=.01)continue;let A=Math.min(this.soil[b],w),I=Math.max(0,w-A),L=Math.min(Math.max(0,this.bedrock[b]-1.2),I*.55),D=(A*3.5+L*16)*this.cellArea*.22;!a&&d+D>o||(this.soil[b]-=A,this.bedrock[b]-=L,this.earthDamMask[b]=0,(this.h[b]>.05||A>.05)&&(this.sediment[b]=Math.min(1.4,this.sediment[b]+.55)),d+=D,u+=A*this.cellArea,p+=L*this.cellArea)}return(u>0||p>0)&&(this.soilStockpileM3+=u,this.totalExcavatedM3+=u+p,this.recomputeZbRange(g,m,_,f),this._activateArea(g,m,_,f)),{cost:d,excavatedM3:u+p}}lineCanalConcrete(t,e,i,n,r=!1){let{gx:o,gz:a}=this.worldToGrid(t,e),l=Math.max(1,Math.ceil(i/this.dx)),c=0,h=0,d=it(o-l,1,this.grid-2),u=it(o+l,1,this.grid-2),p=it(a-l,1,this.grid-2),g=it(a+l,1,this.grid-2);for(let _=p;_<=g;_++)for(let m=d;m<=u;m++){if(Math.hypot(m-o,_-a)*this.dx>i)continue;let f=_*this.grid+m;if(this.linedMask[f]!==1){if(!r&&c+42>n)break;this.linedMask[f]=1,this.earthDamMask[f]=0,c+=42,h++}}return h>0&&this.markTerrainDirty(d,p,u,g),{cost:c,count:h}}buildEarthDam(t,e,i,n,r,o,a=!1){let{gx:l,gz:c}=this.worldToGrid(t,e),h=Math.max(1,Math.ceil(i/this.dx)),d=0,u=0,p=it(l-h,1,this.grid-2),g=it(l+h,1,this.grid-2),_=it(c-h,1,this.grid-2),m=it(c+h,1,this.grid-2);for(let f=_;f<=m;f++)for(let v=p;v<=g;v++){let C=Math.hypot(v-l,f-c)*this.dx;if(C>i)continue;let M=f*this.grid+v;if(this.concrete[M]>.2)continue;let b=Math.cos(C/(i||1)*Math.PI*.46),S=n*b;if(Number.isFinite(r)){let I=this.zb[M],L=r-C/(i||1)*1.4;if(I>=L)continue;S=Math.min(n*1.7,L-I)}if(S<=.02)continue;let T=S*this.cellArea,x=Math.min(this.soilStockpileM3,T),w=T-x,A=(x*1.5+w*5.5)*.22;!a&&d+A>o||(this.soilStockpileM3=Math.max(0,this.soilStockpileM3-x),this.soil[M]+=S,this.linedMask[M]=0,this.earthDamMask[M]=1,d+=A,u+=T)}return u>0&&(this.recomputeZbRange(p,_,g,m),this._activateArea(p,_,g,m)),{cost:d,addedM3:u}}buildConcreteDam(t,e,i,n,r,o=!1){let{gx:a,gz:l}=this.worldToGrid(t,e),c=Math.max(1,Math.ceil(i/this.dx)),h=0,d=0,u=it(a-c,1,this.grid-2),p=it(a+c,1,this.grid-2),g=it(l-c,1,this.grid-2),_=it(l+c,1,this.grid-2);for(let m=g;m<=_;m++)for(let f=u;f<=p;f++){let v=Math.hypot(f-a,m-l)*this.dx;if(v>i)continue;let C=m*this.grid+f;if(this.gateWall[C]>.05)continue;let M=v/(i||1),b=M<.62?n:n-(M-.62)*3.2,S=this.bedrock[C]+this.soil[C]+this.concrete[C];if(S>=b)continue;let T=Math.min(5,b-S),x=T*this.cellArea,w=x*24*.16;!o&&h+w>r||(this.concrete[C]+=T,this.earthDamMask[C]=0,this.linedMask[C]=1,h+=w,d+=x)}return d>0&&(this.recomputeZbRange(u,g,p,_),this._activateArea(u,g,p,_)),{cost:h,addedM3:d}}detectHydraulicDirection(t,e,i=null){if(typeof i=="number")return{dx:Math.cos(i),dz:Math.sin(i),yaw:i};let n=0,r=0,o=4;for(let h=-o;h<=o;h++)for(let d=-o;d<=o;d++){if(d===0&&h===0)continue;let u=it(t+d,0,this.grid-1),g=it(e+h,0,this.grid-1)*this.grid+u,_=this.bedrock[g]+this.soil[g]+this.h[g]*1.8,m=1/(d*d+h*h);n-=d*_*m,r-=h*_*m}let a=Math.hypot(n,r);if(a<.001)return{dx:0,dz:1,yaw:Math.PI*.5};let l=n/a,c=r/a;return{dx:l,dz:c,yaw:Math.atan2(c,l)}}placeSpillway(t,e,i,n,r=!1){if(!r&&n<4200)return{ok:!1,reason:"\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0441\u0440\u0435\u0434\u0441\u0442\u0432 (\u043D\u0443\u0436\u043D\u043E 4 200 \u20BD)"};let{gx:a,gz:l}=this.worldToGrid(t,e);if(a<4||a>this.grid-5||l<4||l>this.grid-5)return{ok:!1,reason:"\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u0431\u043B\u0438\u0437\u043A\u043E \u043A \u043A\u0440\u0430\u044E \u043A\u0430\u0440\u0442\u044B"};for(let f of this.turbines)if(Math.hypot(f.gx-a,f.gz-l)<3.5)return{ok:!1,reason:"\u041C\u0435\u0441\u0442\u043E \u0437\u0430\u043D\u044F\u0442\u043E \u0433\u0438\u0434\u0440\u043E\u0430\u0433\u0440\u0435\u0433\u0430\u0442\u043E\u043C"};for(let f of this.spillways)if(Math.hypot(f.gx-a,f.gz-l)<3)return{ok:!1,reason:"\u0420\u044F\u0434\u043E\u043C \u0443\u0436\u0435 \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D \u0432\u043E\u0434\u043E\u0441\u0431\u0440\u043E\u0441"};let c=this.detectHydraulicDirection(a,l,i),h=0,d=1/0,u=[];for(let f=-1;f<=1;f++)for(let v=-1;v<=1;v++){let C=a+v,b=(l+f)*this.grid+C;u.push(b),d=Math.min(d,this.bedrock[b]+this.soil[b])}for(let f=-3;f<=3;f++)for(let v=-3;v<=3;v++){let C=it(l+f,0,this.grid-1)*this.grid+it(a+v,0,this.grid-1);h=Math.max(h,this.zb[C])}let p=Math.max(d+1.5,h-7.5),g=Math.max(6.5,h-p+2);for(let f of u){let v=this.bedrock[f]+this.soil[f];this.concrete[f]=Math.max(.4,p-v),this.linedMask[f]=1,this.earthDamMask[f]=0}let _=this.gridToWorld(a,l),m={id:this.nextStructId++,kind:"spillway",gx:a,gz:l,wx:_.wx,wz:_.wz,dirX:c.dx,dirZ:c.dz,yaw:c.yaw,sillElev:p,wallHeight:g,openRatio:.35,autoRegulate:!0,targetHeadElev:p+g*.82,cells:u,currentFlowQ:0,jetSpeed:0};return this.spillways.push(m),this._syncSpillwayGateCells(m),this.recomputeZbRange(a-2,l-2,a+2,l+2),this._activateArea(a-3,l-3,a+3,l+3),{ok:!0,cost:4200,structure:m}}_syncSpillwayGateCells(t){let e=(1-it(t.openRatio,0,1))*t.wallHeight;for(let i=0;i<t.cells.length;i++){let n=t.cells[i];this.gateWall[n]=e,this.zb[n]=this.bedrock[n]+this.soil[n]+this.concrete[n]+e}this.markTerrainDirty(t.gx-2,t.gz-2,t.gx+2,t.gz+2)}placeTurbine(t,e,i,n,r,o=!1){let a=iu[t];if(!a)return{ok:!1,reason:"\u041D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u044B\u0439 \u0442\u0438\u043F \u0442\u0443\u0440\u0431\u0438\u043D\u044B"};if(!o&&r<a.cost)return{ok:!1,reason:`\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0441\u0440\u0435\u0434\u0441\u0442\u0432 (\u043D\u0443\u0436\u043D\u043E ${a.cost.toLocaleString("ru-RU")} \u20BD)`};let{gx:l,gz:c}=this.worldToGrid(e,i);if(l<6||l>this.grid-7||c<6||c>this.grid-7)return{ok:!1,reason:"\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u0431\u043B\u0438\u0437\u043A\u043E \u043A \u0433\u0440\u0430\u043D\u0438\u0446\u0435 \u0434\u043E\u043B\u0438\u043D\u044B"};for(let w of this.turbines)if(Math.hypot(w.gx-l,w.gz-c)<3.6)return{ok:!1,reason:"\u0417\u0434\u0435\u0441\u044C \u0443\u0436\u0435 \u0441\u0442\u043E\u0438\u0442 \u0433\u0438\u0434\u0440\u043E\u0430\u0433\u0440\u0435\u0433\u0430\u0442"};for(let w of this.spillways)if(Math.hypot(w.gx-l,w.gz-c)<3.2)return{ok:!1,reason:"\u041C\u0435\u0441\u0442\u043E \u0437\u0430\u043D\u044F\u0442\u043E \u0432\u043E\u0434\u043E\u0441\u0431\u0440\u043E\u0441\u043E\u043C"};let h=this.detectHydraulicDirection(l,c,n),d=Math.max(4,Math.ceil(14.5/this.dx)),u=it(Math.round(l-h.dx*d),2,this.grid-3),p=it(Math.round(c-h.dz*d),2,this.grid-3),g=it(Math.round(l+h.dx*d),2,this.grid-3),_=it(Math.round(c+h.dz*d),2,this.grid-3),m=0;for(let w=-3;w<=3;w++)for(let A=-3;A<=3;A++){let I=it(c+w,0,this.grid-1)*this.grid+it(l+A,0,this.grid-1);m=Math.max(m,this.zb[I])}let f=c*this.grid+l,v=this.bedrock[f]+this.soil[f],C=Math.max(v+11,m),M=[];for(let w=-1;w<=1;w++)for(let A=-1;A<=1;A++){let I=l+A,D=(c+w)*this.grid+I,P=this.bedrock[D]+this.soil[D],N=this.concrete[D];this.concrete[D]=Math.max(N,C-P),this.linedMask[D]=1,this.earthDamMask[D]=0,M.push({i:D,prevConcrete:N})}for(let w=-1;w<=1;w++)for(let A=-1;A<=1;A++){let I=(p+w)*this.grid+(u+A),L=(_+w)*this.grid+(g+A);this.concrete[I]>0&&(M.push({i:I,prevConcrete:this.concrete[I]}),this.concrete[I]=0),this.concrete[L]>0&&(M.push({i:L,prevConcrete:this.concrete[L]}),this.concrete[L]=0),this.linedMask[I]=1,this.linedMask[L]=1}let b=this.gridToWorld(l,c),S=this.gridToWorld(u,p),T=this.gridToWorld(g,_),x={id:this.nextStructId++,kind:"turbine",type:t,spec:a,gx:l,gz:c,wx:b.wx,wz:b.wz,crestY:C,dirX:h.dx,dirZ:h.dz,yaw:h.yaw,intakeGx:u,intakeGz:p,intakeWx:S.wx,intakeWz:S.wz,outfallGx:g,outfallGz:_,outfallWx:T.wx,outfallWz:T.wz,bodyCells:M,throttle:1,autoDispatch:!1,grossHead:0,netHead:0,flowQ:0,efficiency:0,powerMW:0,cavitation:0,condition:1,rotorPhase:0};return this.turbines.push(x),this.recomputeZbRange(Math.min(l,u,g)-2,Math.min(c,p,_)-2,Math.max(l,u,g)+2,Math.max(c,p,_)+2),this._activateArea(Math.min(l,u,g)-2,Math.min(c,p,_)-2,Math.max(l,u,g)+2,Math.max(c,p,_)+2),{ok:!0,cost:a.cost,structure:x}}demolishAt(t,e){let{gx:i,gz:n}=this.worldToGrid(t,e),r=this.turbines.findIndex(l=>Math.hypot(l.gx-i,l.gz-n)<=2.4);if(r>=0){let l=this.turbines[r];for(let c of l.bodyCells)this.concrete[c.i]=c.prevConcrete;return this.turbines.splice(r,1),this.recomputeZbRange(l.gx-2,l.gz-2,l.gx+2,l.gz+2),{removed:"turbine",refund:Math.round(l.spec.cost*.45)}}let o=this.spillways.findIndex(l=>Math.hypot(l.gx-i,l.gz-n)<=2.4);if(o>=0){let l=this.spillways[o];for(let c of l.cells)this.gateWall[c]=0,this.concrete[c]=0;return this.spillways.splice(o,1),this.recomputeZbRange(l.gx-2,l.gz-2,l.gx+2,l.gz+2),{removed:"spillway",refund:1800}}let a=0;for(let l=-1;l<=1;l++)for(let c=-1;c<=1;c++){let h=it(i+c,1,this.grid-2),u=it(n+l,1,this.grid-2)*this.grid+h;this.concrete[u]>0&&(a+=this.concrete[u],this.concrete[u]=Math.max(0,this.concrete[u]-4)),this.linedMask[u]=0}return a>0?(this.recomputeZbRange(i-2,n-2,i+2,n+2),{removed:"concrete",refund:0}):{removed:null,refund:0}}findStructureNear(t,e,i=14){let n=null,r=i;for(let o of this.turbines){let a=Math.hypot(o.wx-t,o.wz-e);a<r&&(r=a,n=o)}for(let o of this.spillways){let a=Math.hypot(o.wx-t,o.wz-e);a<r&&(r=a,n=o)}return n}step(t,e=8){let i=typeof performance<"u"?performance.now():Date.now();this.jetEmitters.length=0;let n=it(t,.001,.16);this._rebuildActiveTiles();let r=6.5,o=this.grid;for(let d=0;d<this.activeTileCount;d++){let u=this.activeTiles[d],p=u%this.tilesN*Lt,g=Math.floor(u/this.tilesN)*Lt,_=Math.min(o,p+Lt),m=Math.min(o,g+Lt);for(let f=g;f<m;f+=2){let v=f*o;for(let C=p;C<_;C+=2){let M=v+C,b=this.h[M];if(b>.02){let S=Math.abs(this.u[M])+Math.abs(this.v[M])+Math.sqrt(ze*b);S>r&&(r=S)}}}}let a=.43*this.dx/r,l=it(Math.ceil(n/a),1,e),c=Math.min(n/l,a);for(let d=0;d<l;d++)this._substep(c);this._stepSecondaryTransportAndErosion(c*l),this.lastSubsteps=l;let h=typeof performance<"u"?performance.now():Date.now();this.lastStepMs=h-i}_activateArea(t,e,i,n){let r=it(Math.floor(t/Lt)-1,0,this.tilesN-1),o=it(Math.floor(e/Lt)-1,0,this.tilesN-1),a=it(Math.floor(i/Lt)+1,0,this.tilesN-1),l=it(Math.floor(n/Lt)+1,0,this.tilesN-1);for(let c=o;c<=l;c++)for(let h=r;h<=a;h++)this.tileWet[c*this.tilesN+h]=1}_rebuildActiveTiles(){let t=this.grid,e=this.tilesN;this.tileWet.fill(0);let i=0;for(let r=0;r<e;r++){let o=r*Lt,a=Math.min(t,o+Lt);for(let l=0;l<e;l++){let c=l*Lt,h=Math.min(t,c+Lt),d=!1;for(let u=o;u<a;u++){let p=u*t;for(let g=c;g<h;g++){let _=this.h[p+g];_>.0015&&(d=!0,i+=_)}}if(d||this.rainRate>0)for(let u=-1;u<=1;u++){let p=r+u;if(!(p<0||p>=e))for(let g=-1;g<=1;g++){let _=l+g;_<0||_>=e||(this.tileWet[p*e+_]=1)}}}}this._activateArea(0,0,t-1,6);for(let r=0;r<this.turbines.length;r++){let o=this.turbines[r];this._activateArea(Math.min(o.intakeGx,o.outfallGx)-2,Math.min(o.intakeGz,o.outfallGz)-2,Math.max(o.intakeGx,o.outfallGx)+2,Math.max(o.intakeGz,o.outfallGz)+2)}let n=0;for(let r=0;r<this.totalTiles;r++)this.tileWet[r]&&(this.activeTiles[n++]=r);this.activeTileCount=n,this.totalWaterVolumeM3=i*this.cellArea}_substep(t){this.simTime+=t;let e=this.grid,i=1/this.dx,{h:n,hu:r,hv:o,zb:a,u:l,v:c,dH:h,dHU:d,dHV:u}=this;this._applyRiverBoundariesAndRain(t),this._stepTurbinesAndSpillways(t);for(let g=0;g<this.activeTileCount;g++){let _=this.activeTiles[g],m=_%this.tilesN*Lt,f=Math.floor(_/this.tilesN)*Lt,v=Math.min(e,m+Lt),C=Math.min(e,f+Lt);for(let M=f;M<C;M++){let b=M*e;for(let S=m;S<v;S++){let T=b+S;h[T]=0,d[T]=0,u[T]=0}}}for(let g=0;g<this.activeTileCount;g++){let _=this.activeTiles[g],m=Math.max(0,_%this.tilesN*Lt),f=Math.max(0,Math.floor(_/this.tilesN)*Lt),v=Math.min(e-1,m+Lt),C=Math.min(e-1,f+Lt);for(let M=f;M<C;M++){let b=M*e;for(let S=m;S<v;S++){let T=b+S;{let x=T+1,w=n[T],A=n[x];if(w>1e-5||A>1e-5){let I=a[T],L=a[x],D=I>L?I:L,P=Math.max(0,I+w-D),N=Math.max(0,L+A-D);if(P>1e-6||N>1e-6){let G=l[T],k=c[T],q=l[x],H=c[x],Z=P*G,J=P*k,rt=N*q,ot=N*H,Bt=Math.abs(G)+Math.sqrt(ze*P),Dt=Math.abs(q)+Math.sqrt(ze*N),Ut=Bt>Dt?Bt:Dt,$=.5*ze*P*P,j=.5*ze*N*N,xt=.5*(Z+rt-Ut*(N-P)),Rt=.5*(Z*G+$+rt*q+j-Ut*(rt-Z)),dt=.5*(Z*k+rt*H-Ut*(ot-J));h[T]-=xt,h[x]+=xt,d[T]-=Rt-$,d[x]+=Rt-j,u[T]-=dt,u[x]+=dt}}}{let x=T+e,w=n[T],A=n[x];if(w>1e-5||A>1e-5){let I=a[T],L=a[x],D=I>L?I:L,P=Math.max(0,I+w-D),N=Math.max(0,L+A-D);if(P>1e-6||N>1e-6){let G=l[T],k=c[T],q=l[x],H=c[x],Z=P*G,J=P*k,rt=N*q,ot=N*H,Bt=Math.abs(k)+Math.sqrt(ze*P),Dt=Math.abs(H)+Math.sqrt(ze*N),Ut=Bt>Dt?Bt:Dt,$=.5*ze*P*P,j=.5*ze*N*N,xt=.5*(J+ot-Ut*(N-P)),Rt=.5*(J*G+ot*q-Ut*(rt-Z)),dt=.5*(J*k+$+ot*H+j-Ut*(ot-J));h[T]-=xt,h[x]+=xt,d[T]-=Rt,d[x]+=Rt,u[T]-=dt-$,u[x]+=dt-j}}}}}}let p=t*i;for(let g=0;g<this.activeTileCount;g++){let _=this.activeTiles[g],m=Math.max(1,_%this.tilesN*Lt),f=Math.max(1,Math.floor(_/this.tilesN)*Lt),v=Math.min(e-1,_%this.tilesN*Lt+Lt),C=Math.min(e-1,Math.floor(_/this.tilesN)*Lt+Lt);for(let M=f;M<C;M++){let b=M*e;for(let S=m;S<v;S++){let T=b+S,x=n[T]+p*h[T];if(x<=1e-5){n[T]=0,r[T]=0,o[T]=0,l[T]=0,c[T]=0;continue}let w=r[T]+p*d[T],A=o[T]+p*u[T],I=x*x,L=I*I,D=Math.SQRT2*x/Math.sqrt(L+(L>hu?L:hu)),P=w*D,N=A*D,G=this.linedMask[T]?.012:this.soil[T]<.6?.026:.036,k=Math.hypot(P,N);if(k>1e-4){let q=x>.045?x:.045,Z=1/(1+t*ze*G*G*k/Math.pow(q,1.3333333));if(P*=Z,N*=Z,k*Z>Ni){let J=Ni/(k*Z);P*=J,N*=J}}n[T]=x,l[T]=P,c[T]=N,r[T]=x*P,o[T]=x*N}}}this._applyVorticityConfinement(t)}_applyRiverBoundariesAndRain(t){let e=this.grid,i=138*this.inflowMult,n=this.worldToGrid(-68,-278);this._injectSpring(n.gx,n.gz,2,i,.42,.91,t);let r=44*this.inflowMult,o=this.worldToGrid(112,-276);if(this._injectSpring(o.gx,o.gz,2,r,-.68,.73,t),this.rainRate>0){let c=this.rainRate*t,h=(this.simTime*60|0)&3,d=h&1,u=h>>1&1;for(let p=2+u;p<e-2;p+=2){let g=p*e;for(let _=2+d;_<e-2;_+=2)this.h[g+_]+=c*4}}let a=(e-2)*e,l=(e-1)*e;for(let c=1;c<e-1;c++){let h=a+c,d=this.zb[h];if(this.h[h]>.01){let u=Math.max(0,6.15-d);if(this.h[h]>u){let p=this.h[h]-u,g=Math.max(this.v[h],Math.sqrt(ze*this.h[h])*.72),_=Math.min(p,g*this.h[h]*t/this.dx);this.h[h]=Math.max(u,this.h[h]-_),this.v[h]=Math.max(this.v[h],g*.65),this.hv[h]=this.h[h]*this.v[h]}}this.h[l+c]=this.h[h]*.85,this.hu[l+c]=0,this.hv[l+c]=0}for(let c=0;c<e;c++)this.hu[c*e+1]=Math.max(0,this.hu[c*e+1]),this.hu[c*e+(e-2)]=Math.min(0,this.hu[c*e+(e-2)]),this.hv[1*e+c]=Math.max(0,this.hv[1*e+c])}_injectSpring(t,e,i,n,r,o,a){let l=0;for(let d=-i;d<=i;d++)for(let u=-i;u<=i;u++){let p=it(t+u,1,this.grid-2),g=it(e+d,1,this.grid-2);u*u+d*d<=i*i+1&&l++}if(!l)return;let c=n*a/(l*this.cellArea),h=2.5;for(let d=-i;d<=i;d++)for(let u=-i;u<=i;u++){if(u*u+d*d>i*i+1)continue;let p=it(t+u,1,this.grid-2),_=it(e+d,1,this.grid-2)*this.grid+p;this.h[_]+=c,this.hu[_]+=c*r*h,this.hv[_]+=c*o*h;let m=this.h[_];this.u[_]=this.hu[_]/m,this.v[_]=this.hv[_]/m}}_stepTurbinesAndSpillways(t){let e=this.grid;for(let i=0;i<this.spillways.length;i++){let n=this.spillways[i],r=it(Math.round(n.gx-n.dirX*3),1,e-2),a=it(Math.round(n.gz-n.dirZ*3),1,e-2)*e+r,l=this.zb[a]+this.h[a];if(n.autoRegulate){let d=l-n.targetHeadElev,u=it(.08+d*.28,0,1);Math.abs(u-n.openRatio)>.015&&(n.openRatio=oe(n.openRatio,u,it(t*2.5,0,1)),this._syncSpillwayGateCells(n))}let c=0,h=0;for(let d=0;d<n.cells.length;d++){let u=n.cells[d],p=this.h[u];if(p>.03){let g=Math.max(0,this.u[u]*n.dirX+this.v[u]*n.dirZ);c+=p*g*(this.dx/3),g>h&&(h=g),this.foam[u]=Math.min(1,this.foam[u]+.35)}}if(n.currentFlowQ=c,n.jetSpeed=h,c>1.2&&n.openRatio>.05){let d=n.gz*e+n.gx;this.jetEmitters.push({wx:n.wx+n.dirX*3.5,wy:this.zb[d]+Math.max(.3,this.h[d]*.6),wz:n.wz+n.dirZ*3.5,vx:n.dirX*Math.max(4.8,h*1.25),vy:1.4+h*.14,vz:n.dirZ*Math.max(4.8,h*1.25),intensity:it(c/35,.15,1.8),kind:"spillway"})}}for(let i=0;i<this.turbines.length;i++){let n=this.turbines[i],r=n.spec,o=0,a=0,l=0;for(let G=-1;G<=1;G++)for(let k=-1;k<=1;k++){let q=(n.intakeGz+G)*e+(n.intakeGx+k),H=this.h[q];H>.12&&(o+=this.zb[q]+H,a++,l+=(H-.08)*this.cellArea)}let c=0,h=0;for(let G=-1;G<=1;G++)for(let k=-1;k<=1;k++){let q=(n.outfallGz+G)*e+(n.outfallGx+k);c+=this.zb[q]+this.h[q],h++}if(a===0||l<=.05||n.throttle<=.005){n.grossHead=0,n.netHead=0,n.flowQ=0,n.efficiency=0,n.powerMW=0,n.cavitation=0;continue}let d=o/a,u=c/(h||1),p=Math.max(0,d-u);if(n.grossHead=p,p<r.minHead*.45){n.netHead=p,n.flowQ=0,n.efficiency=0,n.powerMW=0,n.cavitation=0;continue}let g=it((p-r.minHead*.35)/(r.optHead*.55),.12,1),_=n.throttle*g*r.maxArea*Math.sqrt(2*ze*p),m=l*.42/t,f=Math.min(_,m),v=r.frictionK*f*f,C=Math.max(0,p-v),M=(C-r.optHead)/r.headSigma,b=Math.exp(-.55*M*M),S=n.throttle<.28?.55+n.throttle/.28*.45:1,T=.65+.35*n.condition,x=it(r.peakEta*b*S*T,.18,r.peakEta),w=C>r.maxHead?(C-r.maxHead)/15:C<r.minHead?(r.minHead-C)/6:0;n.cavitation=it(w,0,1);let A=j0*ze*f*C*x*1e-6,I=Math.min(r.ratedMW*1.18,A);n.netHead=C,n.flowQ=f,n.efficiency=x,n.powerMW=I,n.rotorPhase=(n.rotorPhase+t*(2.5+I*1.35))%(Math.PI*2);let L=f*t,D=0;for(let G=-1;G<=1;G++)for(let k=-1;k<=1;k++){let q=(n.intakeGz+G)*e+(n.intakeGx+k),H=this.h[q];if(H>.12){let Z=(H-.08)*this.cellArea/l,J=Math.min(H-.05,L*Z/this.cellArea);this.h[q]-=J,this.hu[q]=this.h[q]*this.u[q],this.hv[q]=this.h[q]*this.v[q],D+=J*this.cellArea}}let P=D/(9*this.cellArea),N=it(2.2+Math.sqrt(2*ze*Math.max(.5,C))*.22,2,9.5);for(let G=-1;G<=1;G++)for(let k=-1;k<=1;k++){let q=(n.outfallGz+G)*e+(n.outfallGx+k);this.h[q]+=P,this.hu[q]+=P*n.dirX*N,this.hv[q]+=P*n.dirZ*N;let H=this.h[q];H>1e-4&&(this.u[q]=it(this.hu[q]/H,-Ni,Ni),this.v[q]=it(this.hv[q]/H,-Ni,Ni),this.hu[q]=H*this.u[q],this.hv[q]=H*this.v[q]),this.foam[q]=Math.min(1,this.foam[q]+.42)}if(f>2.5){let G=n.outfallGz*e+n.outfallGx;this.jetEmitters.push({wx:n.outfallWx,wy:this.zb[G]+this.h[G]+.2,wz:n.outfallWz,vx:n.dirX*N*.75,vy:1.15,vz:n.dirZ*N*.75,intensity:it(I/8,.2,1.35),kind:"tailrace"})}}}_applyVorticityConfinement(t){let e=this.grid,i=.5/this.dx,{h:n,u:r,v:o,hu:a,hv:l,vort:c}=this;for(let d=0;d<this.activeTileCount;d++){let u=this.activeTiles[d],p=Math.max(2,u%this.tilesN*Lt),g=Math.max(2,Math.floor(u/this.tilesN)*Lt),_=Math.min(e-2,u%this.tilesN*Lt+Lt),m=Math.min(e-2,Math.floor(u/this.tilesN)*Lt+Lt);for(let f=g;f<m;f++){let v=f*e;for(let C=p;C<_;C++){let M=v+C;if(n[M]<.18){c[M]=0;continue}let b=(o[M+1]-o[M-1])*i,S=(r[M+e]-r[M-e])*i;c[M]=b-S}}}let h=.34*this.dx*t;for(let d=0;d<this.activeTileCount;d++){let u=this.activeTiles[d],p=Math.max(2,u%this.tilesN*Lt),g=Math.max(2,Math.floor(u/this.tilesN)*Lt),_=Math.min(e-2,u%this.tilesN*Lt+Lt),m=Math.min(e-2,Math.floor(u/this.tilesN)*Lt+Lt);for(let f=g;f<m;f++){let v=f*e;for(let C=p;C<_;C++){let M=v+C,b=n[M],S=c[M];if(b<.25||Math.abs(S)<.015)continue;let T=Math.abs(c[M+1])-Math.abs(c[M-1]),x=Math.abs(c[M+e])-Math.abs(c[M-e]),w=Math.hypot(T,x)+1e-5,A=T/w,I=x/w,L=h*I*S,D=-h*A*S;r[M]=it(r[M]+L,-Ni,Ni),o[M]=it(o[M]+D,-Ni,Ni),a[M]=b*r[M],l[M]=b*o[M]}}}}_stepSecondaryTransportAndErosion(t){let e=this.grid,i=1/this.dx,{h:n,u:r,v:o,foam:a,foamNext:l,sediment:c,sedNext:h,wetness:d}=this;this._erosionTick++;let u=this._erosionTick%3===0,p=e,g=e,_=-1,m=-1;for(let f=0;f<this.activeTileCount;f++){let v=this.activeTiles[f],C=Math.max(1,v%this.tilesN*Lt),M=Math.max(1,Math.floor(v/this.tilesN)*Lt),b=Math.min(e-1,v%this.tilesN*Lt+Lt),S=Math.min(e-1,Math.floor(v/this.tilesN)*Lt+Lt);for(let T=M;T<S;T++){let x=T*e;for(let w=C;w<b;w++){let A=x+w,I=n[A],L=n[A-1]>.03||n[A+1]>.03||n[A-e]>.03||n[A+e]>.03;if(I>.02||L?d[A]=Math.min(1,d[A]+t*2.5):d[A]>0&&(d[A]=Math.max(0,d[A]-t*.08)),I<=.015){l[A]=a[A]*.75,h[A]=c[A]*.85;continue}let D=it(w-r[A]*t*i,.5,e-1.5),P=it(T-o[A]*t*i,.5,e-1.5),N=D|0,G=P|0,k=D-N,q=P-G,H=G*e+N,Z=H+1,J=H+e,rt=J+1,ot=oe(oe(a[H],a[Z],k),oe(a[J],a[rt],k),q),Bt=oe(oe(c[H],c[Z],k),oe(c[J],c[rt],k),q),Dt=r[A]*r[A]+o[A]*o[A],Ut=Math.sqrt(Dt),$=Ut/Math.sqrt(ze*Math.max(.08,I)),j=(r[A+1]-r[A-1]+(o[A+e]-o[A-e]))*.5*i,xt=$>.95&&j<-.12?Math.min(.65,-j*.45*t*8):0,Rt=Ut>3.6?(Ut-3.6)*.085*t:0;l[A]=it(ot*Math.exp(-t*.72)+xt+Rt,0,1);let dt=Bt*Math.exp(-t*.16);if(this.linedMask[A]===0&&this.concrete[A]<.05&&this.soil[A]>.02){let Ot=this.earthDamMask[A]===1,xe=Ot?1.85:3.9;if(Ut>xe){let kt=Ut-xe;if(dt=Math.min(1.5,dt+kt*(Ot?.45:.14)*t),u){let Zt=Ot?.095:.008,ie=Math.min(this.soil[A],kt*Zt*t*3);ie>.001&&(this.soil[A]-=ie,this.zb[A]=this.bedrock[A]+this.soil[A]+this.concrete[A]+this.gateWall[A],w<p&&(p=w),T<g&&(g=T),w>_&&(_=w),T>m&&(m=T))}}}h[A]=dt}}}for(let f=0;f<this.activeTileCount;f++){let v=this.activeTiles[f],C=Math.max(1,v%this.tilesN*Lt),M=Math.max(1,Math.floor(v/this.tilesN)*Lt),b=Math.min(e-1,v%this.tilesN*Lt+Lt),S=Math.min(e-1,Math.floor(v/this.tilesN)*Lt+Lt);for(let T=M;T<S;T++){let x=T*e;for(let w=C;w<b;w++){let A=x+w;a[A]=l[A],c[A]=h[A]}}}_>=p&&this.markTerrainDirty(p,g,_,m)}_rebuildVelocitiesAll(){for(let t=0;t<this.count;t++){let e=this.h[t];e<=1e-4?(this.u[t]=0,this.v[t]=0,this.hu[t]=0,this.hv[t]=0):(this.u[t]=this.hu[t]/e,this.v[t]=this.hv[t]/e)}}};var fa=class{constructor({step:t=1/30,maxSteps:e=4}={}){if(!Number.isFinite(t)||t<=0||t>1||!Number.isSafeInteger(e)||e<1)throw new Error("\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0435 \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u044B \u0447\u0430\u0441\u043E\u0432");this.step=t,this.maxSteps=e,this.accumulator=0,this.tick=0,this._advancing=!1}advance(t,e){if(!Number.isFinite(t)||t<0||!Number.isFinite(this.accumulator+t)||typeof e!="function")throw new Error("\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0439 \u0448\u0430\u0433 \u0447\u0430\u0441\u043E\u0432");if(this._advancing)throw new Error("\u0412\u043B\u043E\u0436\u0435\u043D\u043D\u044B\u0439 \u0432\u044B\u0437\u043E\u0432 \u0447\u0430\u0441\u043E\u0432");this.accumulator+=t;let i=0;this._advancing=!0;try{for(;this.accumulator+this.step*1e-9>=this.step&&i<this.maxSteps;)e(this.step,this.tick),this.accumulator=Math.max(0,this.accumulator-this.step),this.tick++,i++}finally{this._advancing=!1}return{steps:i,remaining:this.accumulator,tick:this.tick}}};var pa=class{constructor(t,e={}){this.hydro=t,this.callbacks=e,this.clock=new fa({step:1/30,maxSteps:6}),this.cash=ai.startingCash,this.loan=0,this.creative=!1,this.day=1,this.hour=8,this.weatherId="normal",this.weatherTimer=52,this._rng=Qs(987654),this.totalMW=0,this.connectedDemandMW=0,this.totalCityDemandMW=0,this.suppliedCityMW=0,this.exportedMW=0,this.spotMultiplier=ql(this.hour),this.incomePerSec=0,this.upkeepPerSec=0,this.netPerSec=0,this.totalEarned=0,this.totalMWhGenerated=0,this.agroIrrigated=!1,this.completedMilestones=new Set,this.cities=[],this.allBuildings=[],this.buildingsDirty=!0,this.powerLinesDirty=!0,this._initCities(),this._applyWeatherToHydro()}_initCities(){this.cities=[],this.allBuildings=[];for(let t=0;t<cs.length;t++){let e=cs[t],i=Qs(1e3+t*777),n=[];for(let a=1;a<=5;a++){let l=a*6+2,c=8.5+(a-1)*8.6;for(let h=0;h<l&&!(n.length>=58);h++){let d=h/l*Math.PI*2+a*.43+(i()-.5)*.16,u=c+(i()-.5)*2.2;if(u>e.plateauRadius*.92)continue;let p=e.x+Math.cos(d)*u,g=e.z+Math.sin(d)*u,_=this.hydro.sampleAtWorld(p,g);n.push({wx:p,wz:g,wy:_.bed,yaw:Math.round((d+Math.PI*.5)/(Math.PI*.5))*(Math.PI*.5)+(i()-.5)*.12,ring:a,occupied:!1,buildingIndex:-1})}}let r={...e,connected:!!e.connectedAtStart,population:e.startPop,level:1,levelName:"\u041F\u043E\u0441\u0451\u043B\u043E\u043A",satisfaction:.75,powerRatio:(e.connectedAtStart,0),currentDemandMW:e.baseDemandMW,suppliedMW:0,growthProgress:.15,isFlooded:!1,irrigated:!1,lots:n,buildingIndices:[],blackoutTimer:0},o=t===3?13:t===2?10:8;for(let a=0;a<o&&a<n.length;a++)this._spawnBuildingInCity(r,n[a],1,i);this._recalcCityTier(r),this.cities.push(r)}this.buildingsDirty=!0,this.powerLinesDirty=!0}_chooseBuildingKind(t,e,i,n){if(t.archetype==="agro"&&e>=3&&n()<.52)return"greenhouse";if(t.archetype==="industrial"&&e>=2&&n()<.42)return"factory";if(t.archetype==="metropolis"&&e<=2&&t.level>=3&&n()<.65)return"skyscraper";let r=4-Math.min(3,e)+i+n()*1.4;return r>=4.4?"skyscraper":r>=2.9?"apartment":r>=1.9&&n()<.35?"factory":r>=1.6?"townhouse":"cottage"}_spawnBuildingInCity(t,e,i=.05,n=this._rng){e.occupied=!0;let r=this._chooseBuildingKind(t,e.ring,t.level*.55,n),o=4.2,a=3.6,l=4.2;r==="cottage"?(o=3.8+n()*1.2,a=2.8+n()*1.1,l=3.8+n()*1.2):r==="townhouse"?(o=4.8+n()*1.5,a=5.4+n()*2.2,l=4.4+n()*1.2):r==="apartment"?(o=5.6+n()*1.8,a=10.5+n()*6.5,l=5.2+n()*1.6):r==="factory"?(o=7.4+n()*2.2,a=5.8+n()*2.4,l=6.2+n()*2):r==="greenhouse"?(o=6.8+n()*2,a=2.6+n()*.8,l=4.8+n()*1.4):r==="skyscraper"&&(o=6.4+n()*1.8,a=18+n()*13,l=6.4+n()*1.8);let c=this.hydro.sampleAtWorld(e.wx,e.wz),h=this.allBuildings.length,d={index:h,cityId:t.id,kind:r,wx:e.wx,wy:c.bed,wz:e.wz,yaw:e.yaw,sx:o,sy:a,sz:l,tier:t.level,anim:i,lit:1,tint:n()};return e.buildingIndex=h,this.allBuildings.push(d),t.buildingIndices.push(h),this.buildingsDirty=!0,d}_recalcCityTier(t){let e=t.buildingIndices.length;e>=42?(t.level=5,t.levelName="\u041C\u0435\u0433\u0430\u043F\u043E\u043B\u0438\u0441"):e>=30?(t.level=4,t.levelName="\u0418\u043D\u0434\u0443\u0441\u0442\u0440\u0438\u0430\u043B\u044C\u043D\u044B\u0439 \u0446\u0435\u043D\u0442\u0440"):e>=20?(t.level=3,t.levelName="\u041A\u0440\u0443\u043F\u043D\u044B\u0439 \u0433\u043E\u0440\u043E\u0434"):e>=13?(t.level=2,t.levelName="\u0413\u043E\u0440\u043E\u0434\u043E\u043A"):(t.level=1,t.levelName="\u041F\u043E\u0441\u0451\u043B\u043E\u043A")}connectCityGrid(t){let e=this.cities.find(n=>n.id===t);if(!e)return{ok:!1,reason:"\u0413\u043E\u0440\u043E\u0434 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D"};if(e.connected)return{ok:!1,reason:"\u0413\u043E\u0440\u043E\u0434 \u0443\u0436\u0435 \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0451\u043D \u043A \u044D\u043D\u0435\u0440\u0433\u043E\u0441\u0435\u0442\u0438"};let i=this.estimatePowerLineCost(e);return!this.creative&&this.cash<i?{ok:!1,reason:`\u041D\u0443\u0436\u043D\u043E ${i.toLocaleString("ru-RU")} \u20BD \u043D\u0430 \u0441\u0442\u0440\u043E\u0438\u0442\u0435\u043B\u044C\u0441\u0442\u0432\u043E \u041B\u042D\u041F`}:(this.creative||(this.cash-=i),e.connected=!0,this.powerLinesDirty=!0,this.callbacks.onNotify&&this.callbacks.onNotify(`\u26A1 \u041B\u042D\u041F 110 \u043A\u0412 \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u0430 \u043A \u0433. ${e.name}! \u0421\u043F\u0440\u043E\u0441 \u0441\u0435\u0442\u0438 \u0432\u044B\u0440\u043E\u0441.`,"good"),{ok:!0,cost:i,city:e})}estimatePowerLineCost(t){let e=Math.hypot(t.x-10,t.z- -110);for(let i of this.hydro.turbines){let n=Math.hypot(t.x-i.wx,t.z-i.wz);n<e&&(e=n)}return Math.max(1800,Math.round(e*14))}canAfford(t){return this.creative||this.cash>=t}spend(t){return this.creative||t<=0?!0:this.cash<t?!1:(this.cash-=t,!0)}earn(t){t>0&&(this.cash+=t,this.totalEarned+=t)}takeGreenLoan(){return this.loan>=ai.maxLoan?{ok:!1,reason:"\u041B\u0438\u043C\u0438\u0442 \u0437\u0435\u043B\u0451\u043D\u044B\u0445 \u043E\u0431\u043B\u0438\u0433\u0430\u0446\u0438\u0439 \u0438\u0441\u0447\u0435\u0440\u043F\u0430\u043D"}:(this.loan+=ai.loanChunk,this.cash+=ai.loanChunk,{ok:!0,amount:ai.loanChunk})}repayLoan(){if(this.loan<=0)return{ok:!1,reason:"\u041A\u0440\u0435\u0434\u0438\u0442\u043E\u0432 \u043D\u0435\u0442"};let t=Math.min(this.cash,Math.min(ai.loanChunk,this.loan));return t<=100?{ok:!1,reason:"\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0441\u0440\u0435\u0434\u0441\u0442\u0432 \u0434\u043B\u044F \u043F\u043E\u0433\u0430\u0448\u0435\u043D\u0438\u044F"}:(this.cash-=t,this.loan-=t,{ok:!0,amount:t})}setWeather(t){ei[t]&&(this.weatherId=t,this._applyWeatherToHydro())}_applyWeatherToHydro(){let t=ei[this.weatherId]||ei.normal;this.hydro.inflowMult=t.inflowMult,this.hydro.rainRate=t.rainRate}update(t){this.clock.advance(t,(i,n)=>this._simulateFixedStep(i,n));let e=!1;for(let i=0;i<this.allBuildings.length;i++){let n=this.allBuildings[i];n.anim<1&&(n.anim=Math.min(1,n.anim+t*1.4),e=!0)}e&&(this.buildingsDirty=!0)}_simulateFixedStep(t,e){let i=24/Qt.dayLengthSec;if(this.hour+=t*i,this.hour>=24&&(this.hour-=24,this.day+=1),this.weatherTimer-=t,this.weatherTimer<=0){this.weatherTimer=38+this._rng()*32;let f=ei[this.weatherId]||ei.normal,v=this._rng(),C=0;for(let[M,b]of Object.entries(f.next))if(C+=b,v<=C){if(M!==this.weatherId){this.weatherId=M,this._applyWeatherToHydro();let S=ei[M];this.callbacks.onNotify&&this.callbacks.onNotify(`${S.icon} \u0413\u0438\u0434\u0440\u043E\u043F\u0440\u043E\u0433\u043D\u043E\u0437: ${S.label} (\u043F\u0440\u0438\u0442\u043E\u043A \u0440\u0435\u043A \xD7${S.inflowMult.toFixed(2)})`,M==="flood"?"warn":"info")}break}}this.spotMultiplier=ql(this.hour);for(let f=0;f<this.hydro.turbines.length;f++){let v=this.hydro.turbines[f];if(v.autoDispatch){let C=this.spotMultiplier>=1.5?1:this.spotMultiplier<.7?.32:.72;v.throttle+=(C-v.throttle)*it(t*1.8,0,1)}v.cavitation>.25&&(v.condition=Math.max(.45,v.condition-v.cavitation*.0012*t))}let n=0,r=0;for(let f=0;f<this.hydro.turbines.length;f++){let v=this.hydro.turbines[f];n+=v.powerMW,r+=v.spec.upkeepPerSec}this.totalMW=n,this.totalMWhGenerated+=n*t/3600,e%10===0&&this._checkHydroCityInteractions();let o=this.hour,a=o>=17&&o<22.5?1.32:o>=6.5&&o<11?1.14:o<6?.74:1,l=0,c=0;for(let f=0;f<this.cities.length;f++){let v=this.cities[f],C=v.buildingIndices.length;v.currentDemandMW=(v.baseDemandMW+C*v.demandPerBuilding)*a,l+=v.currentDemandMW,v.connected&&(c+=v.currentDemandMW)}this.totalCityDemandMW=l,this.connectedDemandMW=c;let h=n,d=0,u=0;for(let f=0;f<this.cities.length;f++){let v=this.cities[f];if(!v.connected){v.suppliedMW=0,v.powerRatio=0,v.satisfaction=Math.max(.35,v.satisfaction-t*.01);continue}let C=Math.min(v.currentDemandMW,h);if(h=Math.max(0,h-C),v.suppliedMW=C,v.powerRatio=v.currentDemandMW>1e-4?it(C/v.currentDemandMW,0,1):1,d+=C,u+=v.suppliedMW*ai.baseRatePerMWSec*this.spotMultiplier*v.tariffBonus,v.powerRatio>=.55&&!v.isFlooded){v.blackoutTimer=0,v.satisfaction=Math.min(1,v.satisfaction+t*.05);let M=v.needsIrrigation&&v.irrigated?1.75:1,b=.35+.95*v.powerRatio;v.growthProgress+=t/14*b*M,v.growthProgress>=1&&(v.growthProgress-=1,this._growCityOneStep(v))}else v.satisfaction=Math.max(.15,v.satisfaction-t*(v.isFlooded?.08:.025)),n>.05&&v.powerRatio<.4&&(v.blackoutTimer+=t)}let p=Math.max(0,n-d),g=this.cities.some(f=>f.connected);this.exportedMW=g?p:0,this.exportedMW>0&&(u+=this.exportedMW*ai.baseRatePerMWSec*this.spotMultiplier*ai.overSupplyExportFactor),this.agroIrrigated&&(u+=ai.irrigationBonusPerSec);let _=this.loan*ai.loanInterestPerSec;this.suppliedCityMW=d,this.incomePerSec=u,this.upkeepPerSec=r+_,this.netPerSec=this.incomePerSec-this.upkeepPerSec;let m=this.netPerSec*t;m>=0?this.earn(m):this.creative||(this.cash=Math.max(0,this.cash+m)),e%15===0&&this._checkMilestones()}_checkHydroCityInteractions(){for(let t=0;t<this.cities.length;t++){let e=this.cities[t],i=0,n=Math.max(1,Math.floor(e.lots.length/8)),r=0;for(let a=0;a<e.lots.length;a+=n){let l=this.hydro.sampleAtWorld(e.lots[a].wx,e.lots[a].wz);r++,l.depth>.42&&i++}let o=e.isFlooded;if(e.isFlooded=r>0&&i/r>=.25,e.isFlooded&&!o&&this.callbacks.onNotify&&this.callbacks.onNotify(`! \u0412\u043D\u0438\u043C\u0430\u043D\u0438\u0435! \u041F\u043E\u0434\u0442\u043E\u043F\u043B\u0435\u043D\u044B \u0443\u043B\u0438\u0446\u044B \u0433. ${e.name}! \u041E\u0442\u043A\u0440\u043E\u0439\u0442\u0435 \u0432\u043E\u0434\u043E\u0441\u0431\u0440\u043E\u0441 \u0438\u043B\u0438 \u043D\u0430\u0441\u044B\u043F\u044C\u0442\u0435 \u0434\u0430\u043C\u0431\u0443!`,"danger"),e.needsIrrigation&&e.irrigationTarget){let a=e.irrigationTarget,l=!1,c=[[0,0],[-10,-6],[10,6],[-8,8],[8,-8]];for(let h=0;h<c.length;h++)if(this.hydro.sampleAtWorld(a.x+c[h][0],a.z+c[h][1]).depth>.16){l=!0;break}l&&!e.irrigated?(e.irrigated=!0,this.agroIrrigated=!0,this.callbacks.onNotify&&this.callbacks.onNotify("\u25C8 \u0412\u043E\u0434\u0430 \u043F\u0440\u0438\u0448\u043B\u0430 \u0432 \u043E\u0440\u043E\u0441\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u0431\u0430\u0441\u0441\u0435\u0439\u043D \u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u044B! \u041F\u043E\u043B\u044F \u0438 \u0442\u0435\u043F\u043B\u0438\u0446\u044B \u043F\u043E\u0448\u043B\u0438 \u0432 \u0431\u0443\u0440\u043D\u044B\u0439 \u0440\u043E\u0441\u0442!","good")):!l&&e.irrigated&&(e.irrigated=!1,this.agroIrrigated=!1)}}}_growCityOneStep(t){let e=t.lots.find(i=>!i.occupied);if(e){let i=this._spawnBuildingInCity(t,e,.05,this._rng),n=i.kind==="skyscraper"?260:i.kind==="apartment"?150:i.kind==="factory"?110:70;t.population+=n;let r=t.level;this._recalcCityTier(t),t.level>r&&this.callbacks.onNotify&&this.callbacks.onNotify(`\u2605 ${t.name} \u0432\u044B\u0440\u043E\u0441 \u0434\u043E \u0441\u0442\u0430\u0442\u0443\u0441\u0430 \xAB${t.levelName}\xBB (${t.population.toLocaleString("ru-RU")} \u0436\u0438\u0442.)!`,"good");return}for(let i=0;i<t.buildingIndices.length;i++){let n=this.allBuildings[t.buildingIndices[i]];if(n.kind==="cottage"||n.kind==="townhouse"){n.kind=t.archetype==="industrial"?"factory":"apartment",n.sy=Math.min(28,n.sy*2.1),n.sx*=1.15,n.sz*=1.15,n.anim=.35,t.population+=180,this.buildingsDirty=!0;return}if(n.kind==="apartment"&&n.sy<24){n.kind="skyscraper",n.sy=Math.min(34,n.sy*1.65),n.anim=.45,t.population+=240,this.buildingsDirty=!0;return}}}_checkMilestones(){let t=this.cities.reduce((n,r)=>n+r.population,0),e=this.cities.filter(n=>n.connected).length,i={totalMW:this.totalMW,excavatedM3:this.hydro.totalExcavatedM3,agroIrrigated:this.agroIrrigated,connectedCities:e,totalPopulation:t};for(let n=0;n<Ks.length;n++){let r=Ks[n];this.completedMilestones.has(r.id)||r.check(i)&&(this.completedMilestones.add(r.id),this.earn(r.reward),this.callbacks.onMilestone&&this.callbacks.onMilestone(r))}}getSummary(){let t=this.cities.reduce((i,n)=>i+n.population,0),e=nu(this.hour);return{cash:this.cash,loan:this.loan,day:this.day,hour:this.hour,weather:ei[this.weatherId]||ei.normal,spotMultiplier:this.spotMultiplier,periodLabel:e.label,periodClass:e.cls,totalMW:this.totalMW,connectedDemandMW:this.connectedDemandMW,totalCityDemandMW:this.totalCityDemandMW,suppliedCityMW:this.suppliedCityMW,exportedMW:this.exportedMW,incomePerSec:this.incomePerSec,upkeepPerSec:this.upkeepPerSec,netPerSec:this.netPerSec,totalPopulation:t,soilStockpileM3:this.hydro.soilStockpileM3,agroIrrigated:this.agroIrrigated}}};function uu(s=256){let t=new Uint8Array(s*s*4),e=Math.PI*2;for(let n=0;n<s;n++){let r=n/s;for(let o=0;o<s;o++){let a=o/s,l=Math.sin(a*e*3+r*e*2)*.35+Math.cos(a*e*5-r*e*4+1.1)*.25+Math.sin(a*e*9+r*e*7+2.4)*.18+Math.cos(a*e*14-r*e*11+.7)*.12,c=(Math.cos(a*e*3+r*e*2)*3*.35-Math.sin(a*e*5-r*e*4+1.1)*5*.25+Math.cos(a*e*9+r*e*7+2.4)*9*.18)/5.2,h=(Math.cos(a*e*3+r*e*2)*2*.35+Math.sin(a*e*5-r*e*4+1.1)*4*.25+Math.cos(a*e*9+r*e*7+2.4)*7*.18)/5.2,d=Math.abs(Math.sin(a*e*4+Math.sin(r*e*3)*.85)),u=Math.abs(Math.cos(r*e*4-Math.sin(a*e*3)*.85)),p=Math.pow(1-Math.min(1,(d+u)*.6),2.8),g=Math.sin(a*e*8)*Math.sin(r*e*8),_=Math.cos((a+r)*e*11)*Math.sin((a-r)*e*9),m=Math.max(0,Math.min(1,.52+g*.35+_*.28+l*.15)),f=(n*s+o)*4;t[f]=Math.max(0,Math.min(255,Math.round((c*.5+.5)*255))),t[f+1]=Math.max(0,Math.min(255,Math.round((h*.5+.5)*255))),t[f+2]=Math.max(0,Math.min(255,Math.round(p*255))),t[f+3]=Math.max(0,Math.min(255,Math.round(m*255)))}}let i=new vn(t,s,s,$e);return i.wrapS=_n,i.wrapT=_n,i.magFilter=Se,i.minFilter=Ii,i.generateMipmaps=!0,i.needsUpdate=!0,i}function du(s){let t={uTime:{value:0},uSunDir:{value:new O(.52,.74,.42).normalize()},uSunColor:{value:new Mt(16774364)},uSkyColor:{value:new Mt(7186664)},uFogColor:{value:new Mt(11061992)},uFogDensity:{value:66e-5},uShowContours:{value:0},uDetailTex:{value:s}};return new be({uniforms:t,vertexShader:`
      attribute vec4 aTerrainMeta; // x = soil, y = concrete, z = wetness, w = waterDepth
      varying vec3 vWorldPos;
      varying vec3 vNormalW;
      varying vec4 vMeta;

      void main() {
        vMeta = aTerrainMeta;
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPos = worldPos.xyz;
        vNormalW = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,fragmentShader:`
      uniform float uTime;
      uniform vec3 uSunDir;
      uniform vec3 uSunColor;
      uniform vec3 uSkyColor;
      uniform vec3 uFogColor;
      uniform float uFogDensity;
      uniform float uShowContours;
      uniform sampler2D uDetailTex;

      varying vec3 vWorldPos;
      varying vec3 vNormalW;
      varying vec4 vMeta;

      float hash21(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      void main() {
        vec3 N = normalize(vNormalW);
        float slope = 1.0 - clamp(N.y, 0.0, 1.0);
        float soil = vMeta.x;
        float concrete = vMeta.y;
        float wetness = clamp(vMeta.z, 0.0, 1.0);
        float subDepth = max(0.0, vMeta.w);

        float grain = hash21(floor(vWorldPos.xz * 2.4)) * 0.08 - 0.04;
        float strata = sin(vWorldPos.y * 2.3 + vWorldPos.x * 0.14) * 0.05;

        vec3 lushGrass = vec3(0.28, 0.51, 0.21) + grain * 0.5;
        vec3 alpineMeadow = vec3(0.41, 0.56, 0.26);
        vec3 claySoil = vec3(0.54, 0.40, 0.26) + grain;
        vec3 riverSand = vec3(0.62, 0.57, 0.47) + grain * 1.2;
        vec3 graniteRock = vec3(0.45, 0.44, 0.42) + strata + grain * 0.6;
        vec3 snowCap = vec3(0.92, 0.95, 0.98);

        float meadowMix = smoothstep(22.0, 44.0, vWorldPos.y);
        vec3 grassCol = mix(lushGrass, alpineMeadow, meadowMix);

        float bareSoil = clamp(smoothstep(0.27, 0.56, slope) + (1.0 - smoothstep(0.35, 1.4, soil)) * 0.58, 0.0, 1.0);
        vec3 groundCol = mix(grassCol, claySoil, bareSoil * 0.72);
        groundCol = mix(groundCol, riverSand, clamp(wetness * 0.72 + smoothstep(0.01, 0.25, subDepth) * 0.55, 0.0, 0.88));

        float rockMask = clamp(smoothstep(0.34, 0.62, slope) + (1.0 - smoothstep(0.2, 0.85, soil)) * 0.75, 0.0, 1.0);
        vec3 col = mix(groundCol, graniteRock, rockMask);

        float snowMask = smoothstep(52.0, 62.0, vWorldPos.y) * (1.0 - smoothstep(0.45, 0.75, slope));
        col = mix(col, snowCap, snowMask);

        if (concrete > 0.05) {
          float concMask = clamp(concrete * 2.5, 0.0, 1.0);
          float seamX = step(0.955, fract(vWorldPos.x * 0.25));
          float seamZ = step(0.955, fract(vWorldPos.z * 0.25));
          float seamY = step(0.935, fract(vWorldPos.y * 0.33));
          float joints = clamp(seamX + seamZ + seamY * 0.6, 0.0, 1.0);
          vec3 concCol = vec3(0.70, 0.72, 0.74) - joints * 0.13 + grain * 0.35;
          col = mix(col, concCol, concMask);
        }

        // \u041C\u043E\u043A\u0440\u044B\u0439 \u0431\u0435\u0440\u0435\u0433 \u0438 \u0432\u0430\u0442\u0435\u0440\u043B\u0438\u043D\u0438\u044F \u043F\u043B\u043E\u0442\u0438\u043D\u044B \u0444\u0438\u0437\u0438\u0447\u0435\u0441\u043A\u0438 \u0442\u0435\u043C\u043D\u0435\u044E\u0442 \u043E\u0442 \u0432\u043E\u0434\u044B!
        col *= mix(1.0, 0.62, wetness);

        float NdotL = max(0.0, dot(N, uSunDir));
        float hemi = 0.5 + 0.5 * N.y;
        vec3 lighting = uSunColor * (NdotL * 0.92) + uSkyColor * (0.28 + 0.28 * hemi);

        vec3 V = normalize(cameraPosition - vWorldPos);
        vec3 H = normalize(uSunDir + V);
        float wetSpec = pow(max(0.0, dot(N, H)), 42.0) * wetness * 0.34;
        vec3 litCol = col * lighting + uSunColor * wetSpec;

        if (uShowContours > 0.5) {
          float minor = abs(fract(vWorldPos.y * 0.5) - 0.5);
          float major = abs(fract(vWorldPos.y * 0.1) - 0.5);
          float lineMinor = 1.0 - smoothstep(0.015, 0.045, minor);
          float lineMajor = 1.0 - smoothstep(0.012, 0.032, major);
          litCol = mix(litCol, vec3(0.95, 0.86, 0.42), lineMinor * 0.30);
          litCol = mix(litCol, vec3(1.0, 0.96, 0.72), lineMajor * 0.70);
        }

        float dist = length(cameraPosition - vWorldPos);
        float fogF = 1.0 - exp(-pow(dist * uFogDensity, 1.65));
        litCol = mix(litCol, uFogColor, clamp(fogF, 0.0, 0.82));

        gl_FragColor = vec4(litCol, 1.0);
      }
    `})}function fu(s){let t={uTime:{value:0},uSunDir:{value:new O(.52,.74,.42).normalize()},uSunColor:{value:new Mt(16774624)},uSkyZenith:{value:new Mt(2647213)},uSkyHorizon:{value:new Mt(10931688)},uFogColor:{value:new Mt(11061992)},uFogDensity:{value:66e-5},uDetailTex:{value:s}};return new be({uniforms:t,transparent:!0,depthWrite:!0,side:Ri,vertexShader:`
      // aHydro1: x = depth, y = u, z = v, w = foam
      // aHydro2: x = sediment, y = vorticity, z = linedFlag, w = wetMask
      attribute vec4 aHydro1;
      attribute vec4 aHydro2;

      varying vec3 vWorldPos;
      varying vec3 vMacroNormal;
      varying vec4 vHydro1;
      varying vec4 vHydro2;

      void main() {
        vHydro1 = aHydro1;
        vHydro2 = aHydro2;
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPos = worldPos.xyz;
        vMacroNormal = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,fragmentShader:`
      uniform float uTime;
      uniform vec3 uSunDir;
      uniform vec3 uSunColor;
      uniform vec3 uSkyZenith;
      uniform vec3 uSkyHorizon;
      uniform vec3 uFogColor;
      uniform float uFogDensity;
      uniform sampler2D uDetailTex;

      varying vec3 vWorldPos;
      varying vec3 vMacroNormal;
      varying vec4 vHydro1;
      varying vec4 vHydro2;

      float hash21(vec2 p) {
        p = fract(p * vec2(234.51, 567.89));
        p += dot(p, p + 33.41);
        return fract(p.x * p.y);
      }

      void main() {
        float depth = vHydro1.x;
        if (depth <= 0.010 || vHydro2.w < 0.05) discard;

        vec2 vel = vHydro1.yz;
        float speed = length(vel);
        float foamVal = clamp(vHydro1.w, 0.0, 1.0);
        float sediment = clamp(vHydro2.x, 0.0, 1.4);
        float vort = vHydro2.y;
        float isConcreteBed = clamp(vHydro2.z, 0.0, 1.0);

        vec3 V = normalize(cameraPosition - vWorldPos);
        float dist = length(cameraPosition - vWorldPos);

        // --- 1. \u0414\u0432\u0443\u0445\u0444\u0430\u0437\u043D\u0430\u044F \u0430\u0434\u0432\u0435\u043A\u0446\u0438\u044F \u0432\u043E\u043B\u043D\u043E\u0432\u044B\u0445 \u043D\u043E\u0440\u043C\u0430\u043B\u0435\u0439 \u0441\u0442\u0440\u043E\u0433\u043E \u043F\u043E \u0440\u0435\u0430\u043B\u044C\u043D\u043E\u0439 \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u0438 (u, v) ---
        vec2 flowDir = speed > 0.02 ? (vel / speed) : vec2(0.0, 1.0);
        vec2 flowStep = vel * 0.052;
        float cycle = 1.15;
        float p0 = fract(uTime / cycle);
        float p1 = fract(uTime / cycle + 0.5);
        float blend = abs(2.0 * p0 - 1.0);

        vec2 baseUv = vWorldPos.xz * 0.082;
        vec4 s0 = texture2D(uDetailTex, baseUv - flowStep * (p0 * cycle));
        vec4 s1 = texture2D(uDetailTex, baseUv - flowStep * (p1 * cycle) + vec2(0.37, 0.61));
        vec4 waveSample = mix(s0, s1, blend);

        vec2 fineUv = vWorldPos.xz * 0.22 + vec2(vort * 0.07, -vort * 0.07);
        vec4 f0 = texture2D(uDetailTex, fineUv - flowStep * (p0 * cycle * 1.65));
        vec4 f1 = texture2D(uDetailTex, fineUv - flowStep * (p1 * cycle * 1.65) + vec2(0.53, 0.19));
        vec4 fineSample = mix(f0, f1, blend);

        float froude = speed / sqrt(9.81 * max(0.08, depth));
        float chopAmp = (0.17 + clamp(speed * 0.048 + froude * 0.12, 0.0, 0.45)) * (1.0 - smoothstep(170.0, 430.0, dist) * 0.65);

        vec2 dN = ((waveSample.xy * 2.0 - 1.0) * 0.68 + (fineSample.xy * 2.0 - 1.0) * 0.38) * chopAmp;
        vec3 N = normalize(vec3(vMacroNormal.x + dN.x, vMacroNormal.y, vMacroNormal.z + dN.y));

        // --- 2. \u041F\u0440\u0435\u043B\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u043F\u043E\u0434\u0432\u043E\u0434\u043D\u043E\u0433\u043E \u0434\u043D\u0430 \u043F\u043E \u0437\u0430\u043A\u043E\u043D\u0443 \u0421\u043D\u0435\u043B\u043B\u0438\u0443\u0441\u0430 + \u0441\u043E\u043B\u043D\u0435\u0447\u043D\u0430\u044F \u043A\u0430\u0443\u0441\u0442\u0438\u043A\u0430! ---
        float daySun = max(0.14, clamp(uSunDir.y + 0.18, 0.0, 1.0));
        vec2 refrXZ = vWorldPos.xz - N.xz * min(depth, 3.8) * 0.52;

        // \u0422\u0435\u043A\u0441\u0442\u0443\u0440\u0430 \u0440\u0435\u0447\u043D\u043E\u0439 \u0433\u0430\u043B\u044C\u043A\u0438 / \u043F\u0435\u0441\u043A\u0430 \u0438\u043B\u0438 \u0431\u0435\u0442\u043E\u043D\u043D\u044B\u0445 \u043F\u043B\u0438\u0442 \u043A\u0430\u043D\u0430\u043B\u0430 \u043D\u0430 \u043F\u0440\u0435\u043B\u043E\u043C\u043B\u0451\u043D\u043D\u043E\u043C \u0434\u043D\u0435
        float pebble = hash21(floor(refrXZ * 3.6)) * 0.16 - 0.08;
        float cobble = hash21(floor(refrXZ * 1.3)) * 0.12 - 0.06;
        vec3 gravelBed = vec3(0.48, 0.44, 0.36) + pebble + cobble;
        float slabJoint = clamp(step(0.95, fract(refrXZ.x * 0.25)) + step(0.95, fract(refrXZ.y * 0.25)), 0.0, 1.0);
        vec3 concBed = vec3(0.56, 0.59, 0.61) - slabJoint * 0.14 + pebble * 0.3;
        vec3 bedAlbedo = mix(gravelBed, concBed, isConcreteBed);

        // \u0414\u0432\u043E\u0439\u043D\u0430\u044F \u0442\u0430\u043D\u0446\u0443\u044E\u0449\u0430\u044F \u0441\u043E\u043B\u043D\u0435\u0447\u043D\u0430\u044F \u043A\u0430\u0443\u0441\u0442\u0438\u043A\u0430 \u043D\u0430 \u043F\u0440\u0435\u043B\u043E\u043C\u043B\u0451\u043D\u043D\u043E\u043C \u0434\u043D\u0435
        vec2 cUv1 = refrXZ * 0.115 + vec2(uTime * 0.042, uTime * 0.028);
        vec2 cUv2 = refrXZ * 0.145 - vec2(uTime * 0.033, -uTime * 0.036);
        float caust = (texture2D(uDetailTex, cUv1).b + texture2D(uDetailTex, cUv2).b) * 0.72 * exp(-depth * 0.32) * daySun;
        vec3 sunlitBed = bedAlbedo * (0.35 + 0.85 * daySun) + uSunColor * caust * 0.45;

        // --- 3. \u0417\u0430\u043A\u043E\u043D \u0411\u0443\u0433\u0435\u0440\u0430 \u2014 \u041B\u0430\u043C\u0431\u0435\u0440\u0442\u0430 \u2014 \u0411\u0435\u0440\u0430: \u0441\u043F\u0435\u043A\u0442\u0440\u0430\u043B\u044C\u043D\u043E\u0435 \u043F\u043E\u0433\u043B\u043E\u0449\u0435\u043D\u0438\u0435 \u0438 \u0446\u0432\u0435\u0442 \u0442\u043E\u043B\u0449\u0438 ---
        float viewCos = max(0.30, abs(dot(N, V)));
        float opticalPath = depth / viewCos;

        // \u0427\u0438\u0441\u0442\u0430\u044F \u0433\u043E\u0440\u043D\u0430\u044F \u0440\u0435\u043A\u0430: \u043A\u0440\u0430\u0441\u043D\u044B\u0439 \u043F\u043E\u0433\u043B\u043E\u0449\u0430\u0435\u0442\u0441\u044F \u043F\u0435\u0440\u0432\u044B\u043C -> \u0438\u0437\u0443\u043C\u0440\u0443\u0434\u043D\u043E-\u0431\u0438\u0440\u044E\u0437\u043E\u0432\u044B\u0439 \u043E\u0442\u0442\u0435\u043D\u043E\u043A -> \u0433\u043B\u0443\u0431\u043E\u043A\u0438\u0439 \u0441\u0430\u043F\u0444\u0438\u0440 \u0432\u043E\u0434\u043E\u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0430!
        vec3 sigmaPure = vec3(0.42, 0.095, 0.068);
        vec3 transmittance = exp(-sigmaPure * opticalPath);

        vec3 pureScatter = mix(vec3(0.04, 0.32, 0.35), vec3(0.018, 0.13, 0.22), smoothstep(1.5, 11.0, depth)) * (0.28 + 0.82 * daySun);
        vec3 mudScatter = vec3(0.49, 0.36, 0.20) * (0.30 + 0.75 * daySun);
        float mudMask = clamp(sediment * 0.72, 0.0, 0.88);
        vec3 inScatter = mix(pureScatter, mudScatter, mudMask);

        // \u0412 \u043C\u0443\u0442\u043D\u043E\u0439 \u0432\u043E\u0434\u0435 \u0434\u043D\u043E \u0431\u044B\u0441\u0442\u0440\u043E \u0441\u043A\u0440\u044B\u0432\u0430\u0435\u0442\u0441\u044F \u0432\u0437\u0432\u0435\u0441\u044C\u044E \u0438\u043B\u0430
        vec3 effTrans = transmittance * (1.0 - mudMask * 0.88);
        vec3 underwaterRadiance = sunlitBed * effTrans + inScatter * (1.0 - effTrans);

        // \u0411\u0438\u0440\u044E\u0437\u043E\u0432\u043E\u0435 \u043F\u0440\u043E\u0441\u0432\u0435\u0447\u0438\u0432\u0430\u043D\u0438\u0435 \u0431\u0435\u0433\u0443\u0449\u0438\u0445 \u0432\u043E\u043B\u043D \u043D\u0430 \u0441\u043E\u043B\u043D\u0446\u0435 (SSS)
        float sss = pow(clamp(dot(V, -uSunDir + N * 0.6), 0.0, 1.0), 3.0) * (1.0 - mudMask * 0.75);
        underwaterRadiance += vec3(0.05, 0.30, 0.28) * sss * max(0.0, uSunDir.y);

        // --- 4. \u0424\u0440\u0435\u043D\u0435\u043B\u0435\u0432\u0441\u043A\u0438\u0435 \u043E\u0442\u0440\u0430\u0436\u0435\u043D\u0438\u044F \u043D\u0435\u0431\u0430, \u0433\u043E\u0440 \u0438 \u0441\u043E\u043B\u043D\u0435\u0447\u043D\u044B\u0445 \u0431\u043B\u0438\u043A\u043E\u0432 ---
        float NdotV = max(0.0, dot(N, V));
        float fresnel = 0.025 + 0.88 * pow(1.0 - NdotV, 4.6);
        fresnel = clamp(fresnel, 0.025, 0.86);

        vec3 R = reflect(-V, N);
        float skyGrad = clamp(R.y * 0.5 + 0.5, 0.0, 1.0);
        float canyonReflect = 1.0 - smoothstep(0.0, 0.18, R.y) * 0.25;
        vec3 skyRefl = mix(uSkyHorizon, uSkyZenith, pow(skyGrad, 0.75)) * canyonReflect;

        vec3 H = normalize(uSunDir + V);
        float specCore = pow(max(0.0, dot(N, H)), 380.0) * 2.6;
        float specSparkle = pow(max(0.0, dot(N, H)), 52.0) * 0.28;
        vec3 sunSpec = uSunColor * (specCore + specSparkle) * smoothstep(-0.02, 0.12, uSunDir.y);

        // --- 5. \u0411\u0435\u043B\u0430\u044F \u043F\u0435\u043D\u0430 \u0431\u0443\u0440\u0443\u043D\u043E\u0432, \u0433\u0438\u0434\u0440\u0430\u0432\u043B\u0438\u0447\u0435\u0441\u043A\u043E\u0433\u043E \u043F\u0440\u044B\u0436\u043A\u0430 \u0438 \u0432\u043E\u0434\u043E\u0441\u0431\u0440\u043E\u0441\u0430 ---
        vec2 orthoDir = vec2(-flowDir.y, flowDir.x);
        vec2 anisoUv = vec2(dot(vWorldPos.xz, flowDir) * 0.075 - uTime * (0.26 + speed * 0.042),
                            dot(vWorldPos.xz, orthoDir) * 0.20);
        float lacePattern = texture2D(uDetailTex, anisoUv).a * 0.62
                          + texture2D(uDetailTex, anisoUv * 2.1 + vec2(0.31, -uTime * 0.08)).a * 0.38;

        float shoreMeniscus = (1.0 - smoothstep(0.015, 0.17, depth)) * clamp(speed * 0.24, 0.10, 0.68);
        float totalFoamDrive = clamp(foamVal * 1.18 + shoreMeniscus + clamp(froude - 1.10, 0.0, 0.65) * 0.58, 0.0, 1.0);
        float foamMask = smoothstep(0.36 - totalFoamDrive * 0.30, 0.76 - totalFoamDrive * 0.22, lacePattern * totalFoamDrive * 1.48);
        vec3 foamColor = vec3(0.95, 0.98, 1.0) * (0.35 + 0.68 * daySun);

        vec3 surfaceCol = mix(underwaterRadiance, skyRefl, fresnel) + sunSpec * (1.0 - foamMask * 0.7);
        vec3 finalCol = mix(surfaceCol, foamColor, foamMask);

        float distFog = 1.0 - exp(-pow(dist * uFogDensity, 1.65));
        finalCol = mix(finalCol, uFogColor, clamp(distFog, 0.0, 0.82));

        // \u041C\u044F\u0433\u043A\u0438\u0439 \u043C\u0438\u043B\u043B\u0438\u043C\u0435\u0442\u0440\u043E\u0432\u044B\u0439 \u0443\u0440\u0435\u0437 \u0432\u043E\u0434\u044B \u043D\u0430 \u0441\u0430\u043C\u043E\u043C \u0431\u0435\u0440\u0435\u0433\u0443, \u0433\u043B\u0443\u0431\u0436\u0435 \u2014 \u043F\u043E\u043B\u043D\u043E\u0446\u0435\u043D\u043D\u0430\u044F \u043F\u0440\u0435\u043B\u043E\u043C\u043B\u044F\u044E\u0449\u0430\u044F \u0442\u043E\u043B\u0449\u0430!
        float edgeAlpha = smoothstep(0.010, 0.075, depth);
        gl_FragColor = vec4(finalCol, edgeAlpha);
      }
    `})}function pu(){return new be({uniforms:{uSunDir:{value:new O(.5,.7,.4).normalize()},uSunColor:{value:new Mt(16774364)},uSkyColor:{value:new Mt(8369128)},uNightFactor:{value:0},uFogColor:{value:new Mt(11061992)},uFogDensity:{value:66e-5}},vertexShader:`
      attribute float aPowered;
      varying vec3 vWorldPos;
      varying vec3 vLocalPos;
      varying vec3 vNormalW;
      varying vec3 vColor;
      varying float vPowered;

      void main() {
        vLocalPos = position; // x,z in [-0.5..0.5], y in [0..1]
        vPowered = aPowered;
        #ifdef USE_INSTANCING_COLOR
          vColor = instanceColor;
        #else
          vColor = vec3(0.75);
        #endif
        vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        vNormalW = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,fragmentShader:`
      uniform vec3 uSunDir;
      uniform vec3 uSunColor;
      uniform vec3 uSkyColor;
      uniform float uNightFactor;
      uniform vec3 uFogColor;
      uniform float uFogDensity;

      varying vec3 vWorldPos;
      varying vec3 vLocalPos;
      varying vec3 vNormalW;
      varying vec3 vColor;
      varying float vPowered;

      float hash21(vec2 p) {
        p = fract(p * vec2(127.1, 311.7));
        p += dot(p, p + 34.2);
        return fract(p.x * p.y);
      }

      void main() {
        vec3 N = normalize(vNormalW);
        float NdotL = max(0.0, dot(N, uSunDir));
        vec3 litWall = vColor * (uSunColor * NdotL * 0.85 + uSkyColor * (0.30 + 0.25 * max(0.0, N.y)));

        // \u0411\u043E\u043A\u043E\u0432\u044B\u0435 \u0441\u0442\u0435\u043D\u044B \u0441 \u0441\u0435\u0442\u043A\u043E\u0439 \u043E\u043A\u043E\u043D \u043F\u043E \u044D\u0442\u0430\u0436\u0430\u043C (\u0448\u0430\u0433 \u044D\u0442\u0430\u0436\u0430 ~2.8 \u043C \u0432 \u043C\u0438\u0440\u043E\u0432\u044B\u0445 \u043A\u043E\u043E\u0440\u0434\u0438\u043D\u0430\u0442\u0430\u0445!)
        if (abs(N.y) < 0.45) {
          float uCoord = abs(N.x) > 0.5 ? vWorldPos.z : vWorldPos.x;
          vec2 winGrid = vec2(uCoord * 0.52, vWorldPos.y * 0.36);
          vec2 cell = floor(winGrid);
          vec2 f = fract(winGrid);
          float inWin = step(0.20, f.x) * step(f.x, 0.80) * step(0.24, f.y) * step(f.y, 0.78);
          inWin *= step(0.08, vLocalPos.y) * step(vLocalPos.y, 0.94);

          if (inWin > 0.5) {
            float rnd = hash21(cell);
            // \u0414\u043D\u0451\u043C \u043E\u043A\u043D\u0430 \u043E\u0442\u0440\u0430\u0436\u0430\u044E\u0442 \u043D\u0435\u0431\u043E, \u0430 \u0432\u0435\u0447\u0435\u0440\u043E\u043C \u0438 \u043D\u043E\u0447\u044C\u044E \u0437\u0430\u0436\u0438\u0433\u0430\u044E\u0442\u0441\u044F \u043E\u0442 \u044D\u043D\u0435\u0440\u0433\u0438\u0438 \u0432\u0430\u0448\u0435\u0439 \u0413\u042D\u0421!
            vec3 dayGlass = mix(vec3(0.18, 0.28, 0.38), uSkyColor * 0.85, 0.45);
            float onProb = vPowered > 0.5 ? 0.76 : 0.08; // \u0431\u0435\u0437 \u044D\u043D\u0435\u0440\u0433\u0438\u0438 \u0413\u042D\u0421 \u0433\u043E\u0440\u0438\u0442 \u043B\u0438\u0448\u044C \u0440\u0435\u0434\u043A\u0438\u0439 \u0434\u0435\u0436\u0443\u0440\u043D\u044B\u0439 \u0441\u0432\u0435\u0442!
            float windowLit = step(1.0 - onProb, rnd) * uNightFactor;
            vec3 warmLamp = mix(vec3(1.0, 0.80, 0.42), vec3(0.68, 0.90, 1.0), step(0.78, rnd));
            litWall = mix(dayGlass, warmLamp * (vPowered > 0.5 ? 1.35 : 0.45), windowLit);
          }
        }

        float dist = length(cameraPosition - vWorldPos);
        float fogF = 1.0 - exp(-pow(dist * uFogDensity, 1.65));
        litWall = mix(litWall, uFogColor, clamp(fogF, 0.0, 0.82));

        gl_FragColor = vec4(litWall, 1.0);
      }
    `})}var Le=new Kt,Ui=new O,Xi=new si,Fi=new O,hs=new mi,Bi=new Mt,ma=class{constructor(t,e,i,n){if(this.scene=t,this.hydro=e,this.economy=i,this.profile=n,this.detailTex=uu(256),this.hemiLight=new Ns(9356799,4017973,.72),this.scene.add(this.hemiLight),this.sunLight=new Fs(16774107,1.45),this.sunLight.position.set(180,260,140),n.shadows){this.sunLight.castShadow=!0,this.sunLight.shadow.mapSize.set(1536,1536),this.sunLight.shadow.camera.near=40,this.sunLight.shadow.camera.far=760;let r=295;this.sunLight.shadow.camera.left=-r,this.sunLight.shadow.camera.right=r,this.sunLight.shadow.camera.top=r,this.sunLight.shadow.camera.bottom=-r,this.sunLight.shadow.bias=-8e-4}this.scene.add(this.sunLight),this.skyColorZenith=new Mt(2647213),this.skyColorHorizon=new Mt(10931688),this.fogColor=new Mt(10931688),this.scene.background=this.fogColor.clone(),this._buildTerrainMesh(),this._buildWaterMesh(),this._buildNatureInstances(),this._buildCityInstancedPools(),this.structuresGroup=new Xe,this.scene.add(this.structuresGroup),this.structMeshes=new Map,this._buildPowerLinePools(),this._buildCursorPreview(),this._buildIrrigationBeacon()}_buildTerrainMesh(){let t=this.hydro.grid,e=t*t,i=this.hydro.dx,n=Qt.size*.5,r=new ge,o=new Float32Array(e*3),a=new Float32Array(e*3),l=new Float32Array(e*4);for(let g=0;g<t;g++){let _=-n+(g+.5)*i;for(let m=0;m<t;m++){let f=-n+(m+.5)*i,v=g*t+m,C=v*3;o[C]=f,o[C+1]=this.hydro.zb[v],o[C+2]=_,a[C+1]=1}}let c=new Uint32Array((t-1)*(t-1)*6),h=0;for(let g=0;g<t-1;g++)for(let _=0;_<t-1;_++){let m=g*t+_,f=m+1,v=m+t,C=v+1;c[h++]=m,c[h++]=v,c[h++]=f,c[h++]=f,c[h++]=v,c[h++]=C}r.setIndex(new re(c,1)),this.terrainPosAttr=new re(o,3),this.terrainPosAttr.setUsage(Ge),this.terrainNormAttr=new re(a,3),this.terrainNormAttr.setUsage(Ge),this.terrainMetaAttr=new re(l,4),this.terrainMetaAttr.setUsage(Ge),r.setAttribute("position",this.terrainPosAttr),r.setAttribute("normal",this.terrainNormAttr),r.setAttribute("aTerrainMeta",this.terrainMetaAttr),this.terrainMat=du(this.detailTex),this.terrainMesh=new $t(r,this.terrainMat),this.terrainMesh.receiveShadow=!!this.profile.shadows,this.terrainMesh.castShadow=!!this.profile.shadows,this.terrainMesh.matrixAutoUpdate=!1,this.terrainMesh.updateMatrix(),this.scene.add(this.terrainMesh);let d=new Ie({color:2764597}),u=new Pe(Qt.size,26,Qt.size),p=new $t(u,d);p.position.set(0,-12.6,0),p.matrixAutoUpdate=!1,p.updateMatrix(),this.scene.add(p),this.updateTerrainGeometryRect(0,0,t-1,t-1)}_buildWaterMesh(){let t=this.hydro.grid,e=t*t,i=this.hydro.dx,n=Qt.size*.5,r=new ge,o=new Float32Array(e*3),a=new Float32Array(e*3),l=new Float32Array(e*4),c=new Float32Array(e*4);for(let h=0;h<t;h++){let d=-n+(h+.5)*i;for(let u=0;u<t;u++){let p=-n+(u+.5)*i,g=h*t+u,_=g*3;o[_]=p,o[_+1]=this.hydro.zb[g]+this.hydro.h[g],o[_+2]=d,a[_+1]=1}}r.setIndex(this.terrainMesh.geometry.getIndex()),this.waterPosAttr=new re(o,3),this.waterPosAttr.setUsage(Ge),this.waterNormAttr=new re(a,3),this.waterNormAttr.setUsage(Ge),this.waterH1Attr=new re(l,4),this.waterH1Attr.setUsage(Ge),this.waterH2Attr=new re(c,4),this.waterH2Attr.setUsage(Ge),r.setAttribute("position",this.waterPosAttr),r.setAttribute("normal",this.waterNormAttr),r.setAttribute("aHydro1",this.waterH1Attr),r.setAttribute("aHydro2",this.waterH2Attr),this.waterMat=fu(this.detailTex),this.waterMesh=new $t(r,this.waterMat),this.waterMesh.renderOrder=2,this.waterMesh.matrixAutoUpdate=!1,this.waterMesh.updateMatrix(),this.scene.add(this.waterMesh)}_buildNatureInstances(){let t=Qs(424242),e=this.profile.treeCount,i=this.profile.rockCount,n=new sn(.22,.38,2.2,5);n.translate(0,1.1,0);let r=new bn(1.85,5.6,6);r.translate(0,4.4,0);let o=new Ie({color:6045736}),a=new Ie({color:16777215});this.treeTrunks=new Ci(n,o,e),this.treeCrowns=new Ci(r,a,e),this.treeCrowns.castShadow=!!this.profile.shadows,this.treeSlots=[];let l=0,c=0;for(;l<e&&c<e*8;){c++;let p=(t()-.5)*(Qt.size-24),g=(t()-.5)*(Qt.size-24),_=this.hydro.sampleAtWorld(p,g);if(_.depth>.02||_.bed>51||_.bed<7.5||_.soil<.75)continue;let m=!1;for(let v of this.economy.cities)if(Math.hypot(p-v.x,g-v.z)<v.plateauRadius*1.08){m=!0;break}if(m)continue;let f=.72+t()*.75;Ui.set(p,_.bed-.15,g),hs.set(0,t()*Math.PI*2,0),Xi.setFromEuler(hs),Fi.set(f,f*(.9+t()*.35),f),Le.compose(Ui,Xi,Fi),this.treeTrunks.setMatrixAt(l,Le),this.treeCrowns.setMatrixAt(l,Le),Bi.setHSL(.29+(t()-.5)*.06,.46+t()*.16,.24+t()*.11),this.treeCrowns.setColorAt(l,Bi),this.treeSlots.push({index:l,wx:p,wz:g,baseBed:_.bed,alive:!0}),l++}this.treeTrunks.count=l,this.treeCrowns.count=l,this.treeTrunks.instanceMatrix.needsUpdate=!0,this.treeCrowns.instanceMatrix.needsUpdate=!0,this.treeCrowns.instanceColor&&(this.treeCrowns.instanceColor.needsUpdate=!0),this.treeTrunks.matrixAutoUpdate=!1,this.treeCrowns.matrixAutoUpdate=!1,this.scene.add(this.treeTrunks),this.scene.add(this.treeCrowns);let h=new Ps(1.3,0),d=new Ie({color:8092020});this.rockInstances=new Ci(h,d,i),this.rockSlots=[];let u=0;for(let p=0;p<i*5&&u<i;p++){let g=(t()-.5)*(Qt.size-18),_=(t()-.5)*(Qt.size-18),m=this.hydro.sampleAtWorld(g,_);if(m.depth>.4)continue;let f=!1;for(let v of this.economy.cities)if(Math.hypot(g-v.x,_-v.z)<v.plateauRadius){f=!0;break}f||(Ui.set(g,m.bed+.2,_),hs.set(t()*3,t()*3,t()*3),Xi.setFromEuler(hs),Fi.set(.6+t()*1.4,.45+t()*.9,.6+t()*1.4),Le.compose(Ui,Xi,Fi),this.rockSlots.push({index:u,wx:g,wz:_,baseBed:m.bed,alive:!0}),this.rockInstances.setMatrixAt(u++,Le))}this.rockInstances.count=u,this.rockInstances.instanceMatrix.needsUpdate=!0,this.rockInstances.matrixAutoUpdate=!1,this.scene.add(this.rockInstances)}_buildCityInstancedPools(){let e=new Pe(1,1,1);e.translate(0,.5,0),this.cityPoweredArr=new Float32Array(320),this.cityPoweredAttr=new Mn(this.cityPoweredArr,1),this.cityPoweredAttr.setUsage(Ge),e.setAttribute("aPowered",this.cityPoweredAttr);let i=new bn(.76,.42,4);i.rotateY(Math.PI*.25),i.translate(0,.21,0),this.cityBodyMat=pu();let n=new Ie({color:16777215});this.cityBodies=new Ci(e,this.cityBodyMat,320),this.cityRoofs=new Ci(i,n,320),this.cityBodies.castShadow=!!this.profile.shadows,this.cityBodies.receiveShadow=!!this.profile.shadows,this.cityBodies.matrixAutoUpdate=!1,this.cityRoofs.matrixAutoUpdate=!1,this.scene.add(this.cityBodies),this.scene.add(this.cityRoofs);for(let r of this.economy.cities){let o=new wn(4,r.plateauRadius*.85,32);o.rotateX(-Math.PI*.5);let a=new Ie({color:r.archetype==="agro"?7307075:5659491,transparent:!0,opacity:.42}),l=new $t(o,a),c=this.hydro.sampleAtWorld(r.x,r.z).bed;l.position.set(r.x,c+.08,r.z),l.matrixAutoUpdate=!1,l.updateMatrix(),this.scene.add(l)}}_buildPowerLinePools(){let e=new sn(.18,.95,11.5,4);e.translate(0,5.75,0);let i=new Ie({color:10135218});this.pylonMesh=new Ci(e,i,180),this.pylonMesh.count=0,this.pylonMesh.matrixAutoUpdate=!1,this.scene.add(this.pylonMesh);let n=new ge;this.wirePositions=new Float32Array(2160),this.wireAttr=new re(this.wirePositions,3),n.setAttribute("position",this.wireAttr),this.wireMat=new en({color:16769154,transparent:!0,opacity:.85}),this.wireLines=new Sn(n,this.wireMat),this.wireLines.frustumCulled=!1,this.scene.add(this.wireLines)}_buildCursorPreview(){this.cursorGroup=new Xe,this.cursorGroup.visible=!1;let t=new wn(.88,1,36);t.rotateX(-Math.PI*.5),this.cursorRingMat=new ri({color:3718648,side:ti,transparent:!0,opacity:.85,depthTest:!1}),this.cursorRing=new $t(t,this.cursorRingMat),this.cursorGroup.add(this.cursorRing),this.flowArrow=new Xe;let e=new $t(new Pe(14,.8,1.6),new ri({color:2282478,transparent:!0,opacity:.8})),i=new $t(new bn(2.8,5.5,12),new ri({color:3462041,transparent:!0,opacity:.9}));i.rotation.z=-Math.PI*.5,i.position.x=9;let n=new $t(new ts(2.1,12,12),new ri({color:3900150,transparent:!0,opacity:.85}));n.position.x=-9,this.flowArrow.add(e,i,n),this.flowArrow.visible=!1,this.cursorGroup.add(this.flowArrow),this.scene.add(this.cursorGroup)}_buildIrrigationBeacon(){let t=new wn(9.5,11.2,28);t.rotateX(-Math.PI*.5),this.irrRingMat=new ri({color:3462041,side:ti,transparent:!0,opacity:.55});let e=this.hydro.sampleAtWorld(128,76).bed;this.irrBeacon=new $t(t,this.irrRingMat),this.irrBeacon.position.set(128,e+.35,76),this.scene.add(this.irrBeacon)}updateTerrainGeometryRect(t,e,i,n){let r=this.hydro.grid,o=this.hydro.dx,a=this.terrainPosAttr.array,l=this.terrainNormAttr.array,c=this.terrainMetaAttr.array,{zb:h,soil:d,concrete:u,wetness:p,h:g,linedMask:_}=this.hydro;for(let b=e;b<=n;b++){let S=b*r;for(let T=t;T<=i;T++){let x=S+T;a[x*3+1]=h[x];let w=x*4;c[w]=d[x],c[w+1]=u[x]+(_[x]?.5:0),c[w+2]=p[x],c[w+3]=g[x]}}let m=it(t-1,0,r-1),f=it(e-1,0,r-1),v=it(i+1,0,r-1),C=it(n+1,0,r-1),M=2*o;for(let b=f;b<=C;b++){let S=Math.max(0,b-1)*r,T=Math.min(r-1,b+1)*r,x=b*r;for(let w=m;w<=v;w++){let A=Math.max(0,w-1),I=Math.min(r-1,w+1),L=(h[x+I]-h[x+A])/M,D=(h[T+w]-h[S+w])/M,P=Math.hypot(L,1,D),N=(x+w)*3;l[N]=-L/P,l[N+1]=1/P,l[N+2]=-D/P}}if(this.terrainPosAttr.needsUpdate=!0,this.terrainNormAttr.needsUpdate=!0,this.terrainMetaAttr.needsUpdate=!0,this.treeSlots&&i-t<r-2){let b=Qt.size*.5,S=-b+t*o-2,T=-b+(i+1)*o+2,x=-b+e*o-2,w=-b+(n+1)*o+2,A=!1;for(let I=0;I<this.treeSlots.length;I++){let L=this.treeSlots[I];if(L.alive&&L.wx>=S&&L.wx<=T&&L.wz>=x&&L.wz<=w){let D=this.hydro.sampleAtWorld(L.wx,L.wz);(Math.abs(D.bed-L.baseBed)>.35||D.concrete>.1||D.lined)&&(L.alive=!1,Le.makeScale(0,0,0),this.treeTrunks.setMatrixAt(L.index,Le),this.treeCrowns.setMatrixAt(L.index,Le),A=!0)}}if(A&&(this.treeTrunks.instanceMatrix.needsUpdate=!0,this.treeCrowns.instanceMatrix.needsUpdate=!0),this.rockSlots){let I=!1;for(let L=0;L<this.rockSlots.length;L++){let D=this.rockSlots[L];if(D.alive&&D.wx>=S&&D.wx<=T&&D.wz>=x&&D.wz<=w){let P=this.hydro.sampleAtWorld(D.wx,D.wz);(Math.abs(P.bed-D.baseBed)>.3||P.concrete>.1||P.lined)&&(D.alive=!1,Le.makeScale(0,0,0),this.rockInstances.setMatrixAt(D.index,Le),I=!0)}}I&&(this.rockInstances.instanceMatrix.needsUpdate=!0)}}}updateWaterAndWetness(t){let e=this.hydro.grid,i=2*this.hydro.dx,{zb:n,h:r,u:o,v:a,foam:l,sediment:c,vort:h,wetness:d,soil:u,concrete:p,linedMask:g}=this.hydro,_=this.waterPosAttr.array,m=this.waterNormAttr.array,f=this.waterH1Attr.array,v=this.waterH2Attr.array,C=this.terrainMetaAttr.array;for(let M=0;M<e;M++){let b=M*e;for(let S=0;S<e;S++){let T=b+S,x=r[T],w=T*3,A=T*4;if(C[A]=u[T],C[A+1]=p[T]+(g[T]?.5:0),C[A+2]=d[T],C[A+3]=x,x>.014)_[w+1]=n[T]+x,f[A]=x,f[A+1]=o[T],f[A+2]=a[T],f[A+3]=l[T],v[A]=c[T],v[A+1]=h[T],v[A+2]=p[T]>.05||g[T]?1:0,v[A+3]=1;else{let I=0,L=0;if(S>0&&r[T-1]>.014&&(I+=n[T-1]+r[T-1],L++),S<e-1&&r[T+1]>.014&&(I+=n[T+1]+r[T+1],L++),M>0&&r[T-e]>.014&&(I+=n[T-e]+r[T-e],L++),M<e-1&&r[T+e]>.014&&(I+=n[T+e]+r[T+e],L++),L>0){let D=I/L;_[w+1]=Math.min(n[T]+.025,D),f[A]=0,f[A+1]=0,f[A+2]=0,f[A+3]=0,v[A+3]=1}else _[w+1]=n[T]-.55,f[A]=0,v[A+3]=0}}}for(let M=0;M<this.hydro.activeTileCount;M++){let b=this.hydro.activeTiles[M],S=Math.max(1,b%this.hydro.tilesN*8),T=Math.max(1,Math.floor(b/this.hydro.tilesN)*8),x=Math.min(e-2,S+8),w=Math.min(e-2,T+8);for(let A=T;A<=w;A++){let I=A*e;for(let L=S;L<=x;L++){let D=I+L;if(r[D]<=.014)continue;let P=_[(D-1)*3+1],N=_[(D+1)*3+1],G=_[(D-e)*3+1],k=_[(D+e)*3+1],q=it((N-P)/i,-.65,.65),H=it((k-G)/i,-.65,.65),Z=Math.hypot(q,1,H),J=D*3;m[J]=-q/Z,m[J+1]=1/Z,m[J+2]=-H/Z}}}this.waterPosAttr.needsUpdate=!0,this.waterNormAttr.needsUpdate=!0,this.waterH1Attr.needsUpdate=!0,this.waterH2Attr.needsUpdate=!0,this.terrainMetaAttr.needsUpdate=!0,this.waterMat.uniforms.uTime.value=t,this.terrainMat.uniforms.uTime.value=t}syncCityInstances(){let t=this.economy.allBuildings,e=new Map;for(let n of this.economy.cities)e.set(n.id,n);let i=Math.min(t.length,this.cityBodies.instanceMatrix.count);for(let n=0;n<i;n++){let r=t[n],o=e.get(r.cityId),a=o&&o.connected&&o.powerRatio>=.45,l=r.sy*Math.max(.08,r.anim);Ui.set(r.wx,r.wy-.25,r.wz),hs.set(0,r.yaw,0),Xi.setFromEuler(hs),Fi.set(r.sx,l,r.sz),Le.compose(Ui,Xi,Fi),this.cityBodies.setMatrixAt(n,Le),this.cityPoweredArr[n]=a?1:0,r.kind==="skyscraper"?Bi.setHSL(.56+r.tint*.06,.32,.56):r.kind==="factory"?Bi.setHex(9272173):r.kind==="greenhouse"?Bi.setHex(11004093):r.kind==="apartment"?Bi.setHSL(.08+r.tint*.08,.24,.72):Bi.setHSL(.09+r.tint*.05,.38,.66),this.cityBodies.setColorAt(n,Bi),r.kind==="cottage"||r.kind==="townhouse"?(Ui.set(r.wx,r.wy-.25+l,r.wz),Fi.set(r.sx*1.08,1.8+r.sy*.18,r.sz*1.08),Le.compose(Ui,Xi,Fi),Bi.setHex(r.kind==="cottage"?10370860:6899002)):Le.makeScale(0,0,0),this.cityRoofs.setMatrixAt(n,Le),this.cityRoofs.setColorAt(n,Bi)}this.cityBodies.count=i,this.cityRoofs.count=i,this.cityBodies.instanceMatrix.needsUpdate=!0,this.cityRoofs.instanceMatrix.needsUpdate=!0,this.cityPoweredAttr.needsUpdate=!0,this.cityBodies.instanceColor&&(this.cityBodies.instanceColor.needsUpdate=!0),this.cityRoofs.instanceColor&&(this.cityRoofs.instanceColor.needsUpdate=!0)}syncHydroStructures(){let t=new Set;for(let e of this.hydro.turbines){t.add(`t_${e.id}`);let i=this.structMeshes.get(`t_${e.id}`);i||(i=this._createTurbinePowerhouseMesh(e),this.structMeshes.set(`t_${e.id}`,i),this.structuresGroup.add(i),this.economy.powerLinesDirty=!0);let n=i.userData.rotor;n&&(n.rotation.y=e.rotorPhase);let r=i.userData.statusLamp;r&&r.material.color.setHex(e.powerMW>.1?3462041:16096779)}for(let e of this.hydro.spillways){t.add(`s_${e.id}`);let i=this.structMeshes.get(`s_${e.id}`);i||(i=this._createSpillwayMesh(e),this.structMeshes.set(`s_${e.id}`,i),this.structuresGroup.add(i));let n=i.userData.gateLeaf;n&&(n.position.y=e.sillElev+e.wallHeight*.5+e.openRatio*(e.wallHeight*.78))}for(let[e,i]of this.structMeshes.entries())t.has(e)||(this.structuresGroup.remove(i),this.structMeshes.delete(e),this.economy.powerLinesDirty=!0);this.economy.powerLinesDirty&&(this._rebuildPowerLines(),this.economy.powerLinesDirty=!1)}_createTurbinePowerhouseMesh(t){let e=new Xe;e.position.set(t.wx,0,t.wz),e.rotation.y=-t.yaw;let i=t.crestY,n=new $t(new Pe(9.2,6.2,8.6),new Ie({color:14870768}));n.position.set(0,i+3.1,0),n.castShadow=!!this.profile.shadows;let r=new $t(new Pe(9.8,.9,9.2),new Ie({color:t.spec.color}));r.position.set(0,i+6.4,0);let o=new Xe;o.position.set(0,i+7.4,0);let a=new $t(new sn(1.3,1.3,1.2,10),new Ie({color:1976635})),l=new $t(new Pe(5.2,.35,.9),new Ie({color:t.spec.color})),c=l.clone();c.rotation.y=Math.PI*.5,o.add(a,l,c);let h=new $t(new Pe(2.6,2.8,2.4),new Ie({color:4674921}));h.position.set(-2.2,i+1.4,5.2);let d=new $t(new ts(.65,8,8),new ri({color:16096779}));return d.position.set(3.2,i+7.5,0),e.add(n,r,o,h,d),e.userData.rotor=o,e.userData.statusLamp=d,e}_createSpillwayMesh(t){let e=new Xe;e.position.set(t.wx,0,t.wz),e.rotation.y=-t.yaw;let i=new Ie({color:9741240}),n=new $t(new Pe(8.5,t.wallHeight+4.5,1.5),i);n.position.set(0,t.sillElev+(t.wallHeight+4.5)*.5-1,-4.4);let r=n.clone();r.position.z=4.4;let o=new $t(new Pe(2.2,1.2,10.4),i);o.position.set(0,t.sillElev+t.wallHeight+3.8,0);let a=new $t(new Pe(1.1,t.wallHeight,7.6),new Ie({color:14251782}));a.position.set(0,t.sillElev+t.wallHeight*.5,0);let l=new $t(new Pe(4.2,1.4,7.6),i);return l.rotation.z=.24,l.position.set(4.6,t.sillElev+.4,0),e.add(n,r,o,a,l),e.userData.gateLeaf=a,e}_rebuildPowerLines(){let t=this.hydro.turbines.length>0?{x:this.hydro.turbines[0].wx,z:this.hydro.turbines[0].wz}:{x:10,z:-118},e=0,i=0,n=this.pylonMesh.instanceMatrix.count;for(let r of this.economy.cities){if(!r.connected)continue;let o=t,a=Math.hypot(r.x-o.x,r.z-o.z);for(let h of this.hydro.turbines){let d=Math.hypot(r.x-h.wx,r.z-h.wz);d<a&&(a=d,o={x:h.wx,z:h.wz})}let l=it(Math.ceil(a/42),2,12),c=null;for(let h=0;h<=l&&!(e>=n);h++){let d=h/l,u=o.x+(r.x-o.x)*d,p=o.z+(r.z-o.z)*d,g=this.hydro.sampleAtWorld(u,p).bed;Ui.set(u,g,p),Xi.identity(),Fi.set(1,1,1),Le.compose(Ui,Xi,Fi),this.pylonMesh.setMatrixAt(e++,Le);let _=g+11.2;c&&i+6<=this.wirePositions.length&&(this.wirePositions[i++]=c.x,this.wirePositions[i++]=c.y,this.wirePositions[i++]=c.z,this.wirePositions[i++]=u,this.wirePositions[i++]=_,this.wirePositions[i++]=p),c={x:u,y:_,z:p}}}for(let r=i;r<this.wirePositions.length;r++)this.wirePositions[r]=0;this.pylonMesh.count=e,this.pylonMesh.instanceMatrix.needsUpdate=!0,this.wireAttr.needsUpdate=!0}updateAtmosphere(t,e){let i=(t-6)/24*Math.PI*2,n=Math.sin(i),r=Math.cos(i),o=new O(r*.78,Math.max(-.35,n),.48).normalize(),a=it((n+.16)/.65,0,1),l=Math.exp(-Math.pow((n-.08)/.18,2)),c=new Mt(594982),h=new Mt(2450347),d=new Mt(1254978),u=new Mt(10406632),p=new Mt(15900519);this.skyColorZenith.copy(c).lerp(h,a),this.skyColorHorizon.copy(d).lerp(u,a).lerp(p,l*.62),this.fogColor.copy(this.skyColorHorizon);let g=new Mt(3889292).lerp(new Mt(16774626),a).lerp(new Mt(16755038),l*.75);this.sunLight.position.copy(o).multiplyScalar(320),this.sunLight.color.copy(g),this.sunLight.intensity=(.18+1.32*a)*e.sunIntensity,this.hemiLight.intensity=.25+.55*a,this.scene.background.copy(this.fogColor);let _=n>-.05?o:new O(-o.x,.35,-o.z).normalize();if(this.terrainMat.uniforms.uSunDir.value.copy(_),this.terrainMat.uniforms.uSunColor.value.copy(g).multiplyScalar(.32+.78*a),this.terrainMat.uniforms.uSkyColor.value.copy(this.skyColorZenith).lerp(new Mt(16777215),.35),this.terrainMat.uniforms.uFogColor.value.copy(this.fogColor),this.terrainMat.uniforms.uFogDensity.value=e.fogDensity,this.waterMat.uniforms.uSunDir.value.copy(_),this.waterMat.uniforms.uSunColor.value.copy(g).multiplyScalar(a),this.waterMat.uniforms.uSkyZenith.value.copy(this.skyColorZenith),this.waterMat.uniforms.uSkyHorizon.value.copy(this.skyColorHorizon),this.waterMat.uniforms.uFogColor.value.copy(this.fogColor),this.waterMat.uniforms.uFogDensity.value=e.fogDensity,this.cityBodyMat&&(this.cityBodyMat.uniforms.uSunDir.value.copy(_),this.cityBodyMat.uniforms.uSunColor.value.copy(g).multiplyScalar(.28+.82*a),this.cityBodyMat.uniforms.uSkyColor.value.copy(this.skyColorZenith).lerp(new Mt(16777215),.35),this.cityBodyMat.uniforms.uNightFactor.value=it(1-(n+.05)/.28,0,1),this.cityBodyMat.uniforms.uFogColor.value.copy(this.fogColor),this.cityBodyMat.uniforms.uFogDensity.value=e.fogDensity),this.irrBeacon&&(this.irrBeacon.visible=!this.economy.agroIrrigated,this.irrBeacon.visible)){let m=1+Math.sin(performance.now()*.004)*.08;this.irrBeacon.scale.set(m,1,m)}return{isNight:n<.06,dayFactor:a}}updateCursor(t,e,i,n,r,o){if(this.cursorGroup.visible=o,!o)return;let a=this.hydro.sampleAtWorld(t,e),l=Math.max(a.bed,a.surface)+.35;this.cursorGroup.position.set(t,l,e),this.cursorRing.scale.set(i,i,1);let c=n==="spillway"||n.startsWith("turbine_");if(this.flowArrow.visible=c,c){let{gx:h,gz:d}=this.hydro.worldToGrid(t,e),u=this.hydro.detectHydraulicDirection(h,d,r);this.flowArrow.rotation.y=-u.yaw,this.cursorRingMat.color.setHex(3462041)}else n==="canal_dig"?this.cursorRingMat.color.setHex(3718648):n==="concrete_dam"||n==="earth_dam"?this.cursorRingMat.color.setHex(16498468):n==="demolish"?this.cursorRingMat.color.setHex(15680580):this.cursorRingMat.color.setHex(10980346)}};var ga=class{constructor(t,e=2400){this.max=e,this.head=0,this.positions=new Float32Array(this.max*3),this.velocities=new Float32Array(this.max*3),this.life=new Float32Array(this.max),this.maxLife=new Float32Array(this.max),this.sizes=new Float32Array(this.max),this.kinds=new Uint8Array(this.max);let i=new ge;this.posAttr=new re(this.positions,3),this.posAttr.setUsage(Ge),this.sizeAttr=new re(this.sizes,1),this.sizeAttr.setUsage(Ge),this.alphaAttr=new re(new Float32Array(this.max),1),this.alphaAttr.setUsage(Ge),i.setAttribute("position",this.posAttr),i.setAttribute("aSize",this.sizeAttr),i.setAttribute("aAlpha",this.alphaAttr);let n=new be({transparent:!0,depthWrite:!1,blending:ln,uniforms:{uLight:{value:1},uPixelRatio:{value:Math.min(window.devicePixelRatio||1,2)}},vertexShader:`
        attribute float aSize;
        attribute float aAlpha;
        uniform float uPixelRatio;
        varying float vAlpha;

        void main() {
          vAlpha = aAlpha;
          if (aAlpha <= 0.005) {
            gl_Position = vec4(2.0, 2.0, 2.0, 1.0);
            gl_PointSize = 0.0;
            return;
          }
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mv;
          gl_PointSize = clamp((aSize * 210.0 * uPixelRatio) / max(1.0, -mv.z), 1.5, 44.0);
        }
      `,fragmentShader:`
        uniform float uLight;
        varying float vAlpha;

        void main() {
          vec2 p = gl_PointCoord * 2.0 - 1.0;
          float r2 = dot(p, p);
          if (r2 > 1.0) discard;
          float soft = pow(1.0 - r2, 1.6);
          vec3 col = vec3(0.92, 0.96, 1.0) * (0.45 + 0.55 * uLight);
          gl_FragColor = vec4(col, vAlpha * soft);
        }
      `});this.points=new As(i,n),this.points.frustumCulled=!1,this.points.matrixAutoUpdate=!1,t.add(this.points);let r=360;this.rainCount=r;let o=new Float32Array(r*6);this.rainSeeds=new Float32Array(r*3);for(let l=0;l<r;l++)this.rainSeeds[l*3]=(Math.random()-.5)*180,this.rainSeeds[l*3+1]=Math.random()*70,this.rainSeeds[l*3+2]=(Math.random()-.5)*180;let a=new ge;this.rainAttr=new re(o,3),this.rainAttr.setUsage(Ge),a.setAttribute("position",this.rainAttr),this.rainMat=new en({color:13624575,transparent:!0,opacity:.35,depthWrite:!1}),this.rainLines=new Sn(a,this.rainMat),this.rainLines.visible=!1,this.rainLines.frustumCulled=!1,t.add(this.rainLines)}spawn(t,e,i,n,r,o,a,l,c=1){let h=this.head;this.head=(this.head+1)%this.max;let d=h*3;this.positions[d]=t,this.positions[d+1]=e,this.positions[d+2]=i,this.velocities[d]=n,this.velocities[d+1]=r,this.velocities[d+2]=o,this.life[h]=l,this.maxLife[h]=l,this.sizes[h]=a,this.kinds[h]=c}spawnDigSplash(t,e,i,n=12){for(let r=0;r<n;r++){let o=Math.random()*Math.PI*2,a=1.5+Math.random()*4;this.spawn(t+(Math.random()-.5)*3,e+.5,i+(Math.random()-.5)*3,Math.cos(o)*a,2.5+Math.random()*4.5,Math.sin(o)*a,1.1+Math.random()*.8,.55+Math.random()*.35,1)}}update(t,e,i,n=1,r=0){this.points.material.uniforms.uLight.value=n;let o=e.jetEmitters;for(let c=0;c<o.length;c++){let h=o[c],d=h.kind==="spillway"?Math.ceil(5*h.intensity):Math.ceil(3*h.intensity);for(let u=0;u<d;u++){let p=h.kind==="spillway"?2.4:3.2;this.spawn(h.wx+(Math.random()-.5)*p,h.wy+Math.random()*.6,h.wz+(Math.random()-.5)*p,h.vx*(.85+Math.random()*.3)+(Math.random()-.5)*1.4,h.vy+(Math.random()-.3)*1.6,h.vz*(.85+Math.random()*.3)+(Math.random()-.5)*1.4,h.kind==="spillway"?1.6+Math.random()*1.5:1.3+Math.random()*1.1,.95+Math.random()*.55,1)}Math.random()<.65&&this.spawn(h.wx+h.vx*.5+(Math.random()-.5)*5,h.wy-.5,h.wz+h.vz*.5+(Math.random()-.5)*5,(Math.random()-.5)*1.2,1.4+Math.random()*1.8,(Math.random()-.5)*1.2,3.4+Math.random()*2.6,1.5+Math.random()*.9,2)}let a=this.alphaAttr.array,l=!1;for(let c=0;c<this.max;c++){let h=this.kinds[c];if(h===0){a[c]=0;continue}if(this.life[c]-=t,this.life[c]<=0){this.kinds[c]=0,a[c]=0;continue}l=!0;let d=c*3;h===1?(this.velocities[d]*=1-t*.35,this.velocities[d+1]-=Qt.gravity*t*.92,this.velocities[d+2]*=1-t*.35):(this.velocities[d]*=1-t*1.2,this.velocities[d+1]=Math.max(.3,this.velocities[d+1]-t*.9),this.velocities[d+2]*=1-t*1.2,this.sizes[c]+=t*1.4);let u=this.positions[d]+this.velocities[d]*t,p=this.positions[d+1]+this.velocities[d+1]*t,g=this.positions[d+2]+this.velocities[d+2]*t;if(this.positions[d]=u,this.positions[d+1]=p,this.positions[d+2]=g,h===1&&Math.abs(u)<Qt.size*.49&&Math.abs(g)<Qt.size*.49){let m=e.worldToGrid(u,g),f=m.gz*e.grid+m.gx,v=e.zb[f]+e.h[f];if(p<=v){e.foam[f]=Math.min(1,e.foam[f]+.35),this.kinds[c]=0,a[c]=0;continue}}let _=this.life[c]/(this.maxLife[c]||1);a[c]=h===1?Math.min(.78,_*1.2):Math.sin(_*Math.PI)*.24}if((l||o.length>0)&&(this.posAttr.needsUpdate=!0,this.sizeAttr.needsUpdate=!0,this.alphaAttr.needsUpdate=!0),r>.05){this.rainLines.visible=!0,this.rainMat.opacity=Math.min(.45,r*.35);let c=this.rainAttr.array,h=performance.now()*.065%70;for(let d=0;d<this.rainCount;d++){let u=d*3,p=i.x+this.rainSeeds[u],g=this.rainSeeds[u+1]-h;g<0&&(g+=70),g+=i.y*.3+6;let _=i.z+this.rainSeeds[u+2],m=d*6;c[m]=p,c[m+1]=g,c[m+2]=_,c[m+3]=p+.6,c[m+4]=g-3.6,c[m+5]=_+.4}this.rainAttr.needsUpdate=!0}else this.rainLines.visible=!1}};var xa=class{constructor(t,e){this.camera=t,this.dom=e,this.target=new O(14,22,-45),this.goalTarget=this.target.clone(),this.yaw=-.52,this.pitch=.68,this.distance=205,this.goalYaw=this.yaw,this.goalPitch=this.pitch,this.goalDist=this.distance,this.keys=new Set,this.isOrbiting=!1,this.isPanning=!1,this.lastX=0,this.lastY=0,this.touches=new Map,this.prevPinchDist=0,this._bindEvents(),this.update(.016,20)}_bindEvents(){window.addEventListener("keydown",e=>{e.target&&(e.target.tagName==="INPUT"||e.target.tagName==="SELECT")||this.keys.add(e.code)}),window.addEventListener("keyup",e=>{this.keys.delete(e.code)}),window.addEventListener("blur",()=>this.keys.clear()),this.dom.addEventListener("contextmenu",e=>e.preventDefault()),this.dom.addEventListener("mousedown",e=>{e.button===2?(this.isOrbiting=!0,this.lastX=e.clientX,this.lastY=e.clientY):e.button===1&&(this.isPanning=!0,this.lastX=e.clientX,this.lastY=e.clientY)}),window.addEventListener("mousemove",e=>{if(this.isOrbiting){let i=e.clientX-this.lastX,n=e.clientY-this.lastY;this.lastX=e.clientX,this.lastY=e.clientY,this.goalYaw-=i*.0055,this.goalPitch=it(this.goalPitch+n*.0048,.16,1.38)}else if(this.isPanning){let i=e.clientX-this.lastX,n=e.clientY-this.lastY;this.lastX=e.clientX,this.lastY=e.clientY,this._panByPixels(i,n)}}),window.addEventListener("mouseup",e=>{e.button===2&&(this.isOrbiting=!1),e.button===1&&(this.isPanning=!1)}),this.dom.addEventListener("wheel",e=>{e.preventDefault();let i=e.deltaY>0?1.12:.89;this.goalDist=it(this.goalDist*i,26,470)},{passive:!1}),this.dom.addEventListener("touchstart",e=>{for(let i of e.changedTouches)this.touches.set(i.identifier,{x:i.clientX,y:i.clientY});if(this.touches.size===2){let i=[...this.touches.values()];this.prevPinchDist=Math.hypot(i[0].x-i[1].x,i[0].y-i[1].y)}},{passive:!0}),this.dom.addEventListener("touchmove",e=>{if(this.touches.size>=2){let i=[...this.touches.values()],n=(i[0].x+i[1].x)*.5,r=(i[0].y+i[1].y)*.5;for(let h of e.changedTouches)this.touches.set(h.identifier,{x:h.clientX,y:h.clientY});let o=[...this.touches.values()],a=(o[0].x+o[1].x)*.5,l=(o[0].y+o[1].y)*.5;this._panByPixels(a-n,l-r);let c=Math.hypot(o[0].x-o[1].x,o[0].y-o[1].y);this.prevPinchDist>10&&c>10&&(this.goalDist=it(this.goalDist*(this.prevPinchDist/c),28,470)),this.prevPinchDist=c}},{passive:!0});let t=e=>{for(let i of e.changedTouches)this.touches.delete(i.identifier)};this.dom.addEventListener("touchend",t,{passive:!0}),this.dom.addEventListener("touchcancel",t,{passive:!0})}_panByPixels(t,e){let i=this.distance*.0017,n=Math.sin(this.yaw),r=Math.cos(this.yaw);this.goalTarget.x-=(r*t+n*e)*i,this.goalTarget.z-=(-n*t+r*e)*i;let o=Qt.size*.48;this.goalTarget.x=it(this.goalTarget.x,-o,o),this.goalTarget.z=it(this.goalTarget.z,-o,o)}flyTo(t,e,i=125,n=20){let r=Qt.size*.48;this.goalTarget.set(it(t,-r,r),n,it(e,-r,r)),this.goalDist=it(i,30,440)}update(t,e=18){let i=(55+this.distance*.55)*t,n=Math.sin(this.yaw),r=Math.cos(this.yaw),o=0,a=0;if((this.keys.has("KeyW")||this.keys.has("ArrowUp"))&&(o+=1),(this.keys.has("KeyS")||this.keys.has("ArrowDown"))&&(o-=1),(this.keys.has("KeyD")||this.keys.has("ArrowRight"))&&(a+=1),(this.keys.has("KeyA")||this.keys.has("ArrowLeft"))&&(a-=1),o!==0||a!==0){let d=Math.hypot(o,a);o/=d,a/=d,this.goalTarget.x+=(-n*o+r*a)*i,this.goalTarget.z+=(-r*o-n*a)*i;let u=Qt.size*.48;this.goalTarget.x=it(this.goalTarget.x,-u,u),this.goalTarget.z=it(this.goalTarget.z,-u,u)}this.keys.has("KeyQ")&&(this.goalYaw+=1.55*t),this.keys.has("KeyE")&&(this.goalYaw-=1.55*t),this.goalTarget.y=oe(this.goalTarget.y,Math.max(8,e+2),it(t*5,0,1));let l=it(t*10.5,.05,1);this.yaw=oe(this.yaw,this.goalYaw,l),this.pitch=oe(this.pitch,this.goalPitch,l),this.distance=oe(this.distance,this.goalDist,l),this.target.lerp(this.goalTarget,l);let c=Math.cos(this.pitch)*this.distance,h=Math.sin(this.pitch)*this.distance;this.camera.position.set(this.target.x+Math.sin(this.yaw)*c,Math.max(e+4.5,this.target.y+h),this.target.z+Math.cos(this.yaw)*c),this.camera.lookAt(this.target)}};var _a=class{constructor(){this.ctx=null,this.muted=!1,this.initialized=!1,this.waterGain=null,this.waterFilter=null,this.turbineGain=null,this.turbineOsc=null}unlock(){if(this.initialized||this.muted)return;let t=window.AudioContext||window.webkitAudioContext;if(t)try{this.ctx=new t,this.ctx.state==="suspended"&&this.ctx.resume();let e=this.ctx.sampleRate*2,i=this.ctx.createBuffer(1,e,this.ctx.sampleRate),n=i.getChannelData(0),r=0,o=0,a=0;for(let h=0;h<e;h++){let d=Math.random()*2-1;r=.997*r+d*.029,o=.985*o+d*.032,a=.95*a+d*.048,n[h]=it((r+o+a+d*.04)*1.8,-1,1)}let l=this.ctx.createBufferSource();l.buffer=i,l.loop=!0,this.waterFilter=this.ctx.createBiquadFilter(),this.waterFilter.type="lowpass",this.waterFilter.frequency.value=620,this.waterGain=this.ctx.createGain(),this.waterGain.gain.value=.04,l.connect(this.waterFilter),this.waterFilter.connect(this.waterGain),this.waterGain.connect(this.ctx.destination),l.start(),this.turbineOsc=this.ctx.createOscillator(),this.turbineOsc.type="triangle",this.turbineOsc.frequency.value=98;let c=this.ctx.createBiquadFilter();c.type="lowpass",c.frequency.value=190,this.turbineGain=this.ctx.createGain(),this.turbineGain.gain.value=0,this.turbineOsc.connect(c),c.connect(this.turbineGain),this.turbineGain.connect(this.ctx.destination),this.turbineOsc.start(),this.initialized=!0}catch{}}toggleMute(){return this.muted=!this.muted,!this.muted&&!this.initialized&&this.unlock(),this.ctx&&this.initialized&&this.muted&&(this.waterGain.gain.setTargetAtTime(0,this.ctx.currentTime,.08),this.turbineGain.gain.setTargetAtTime(0,this.ctx.currentTime,.08)),this.muted}updateContinuous(t,e,i){if(!this.initialized||this.muted||!this.ctx||this.ctx.state==="suspended")return;let n=it(1-(t-45)/290,.18,1),r=it(.03+n*.06+e/140*.14,0,.22),o=it(420+n*520+e*12,350,2400),a=this.ctx.currentTime;this.waterGain.gain.setTargetAtTime(r,a,.12),this.waterFilter.frequency.setTargetAtTime(o,a,.12);let l=i>.1?it(.012+i/30*.045,0,.065)*n:0;this.turbineGain.gain.setTargetAtTime(l,a,.15),this.turbineOsc.frequency.setTargetAtTime(92+Math.min(35,i*.9),a,.2)}playTone(t=440,e=.12,i="sine",n=.08){if(!(!this.initialized||this.muted||!this.ctx))try{let r=this.ctx.currentTime,o=this.ctx.createOscillator(),a=this.ctx.createGain();o.type=i,o.frequency.setValueAtTime(t,r),a.gain.setValueAtTime(n,r),a.gain.exponentialRampToValueAtTime(8e-4,r+e),o.connect(a),a.connect(this.ctx.destination),o.start(r),o.stop(r+e+.02)}catch{}}playBuild(){this.playTone(210,.09,"triangle",.07),setTimeout(()=>this.playTone(315,.11,"sine",.06),45)}playDig(){this.playTone(135+Math.random()*35,.07,"sawtooth",.035)}playMilestone(){this.playTone(523.25,.16,"sine",.09),setTimeout(()=>this.playTone(659.25,.18,"sine",.09),110),setTimeout(()=>this.playTone(783.99,.28,"sine",.1),220)}};var mu={inspect:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#38bdf8" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M11 8v6M8 11h6"/></svg>',canal_dig:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#22d3ee" stroke-width="2"><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/><path d="M2 21h20"/></svg>',canal_liner:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#cbd5e1" stroke-width="2"><path d="M3 7l4 10h10l4-10"/><path d="M7 12h10"/></svg>',earth_dam:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#d97706" stroke-width="2"><path d="M2 19L9 7h6l7 12H2z"/><path d="M6 19l4-7h4l4 7"/></svg>',concrete_dam:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#f8fafc" stroke-width="2"><path d="M4 20L7 5h10l3 15H4z"/><path d="M6 10h12M5 15h14"/></svg>',spillway:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M4 5v14M20 5v14M4 9h16"/><path d="M8 13c2 3 6 3 8 6" stroke="#67e8f9"/></svg>',turbine_kaplan:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#60a5fa" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v6M12 16v6M2 12h6M16 12h6"/></svg>',turbine_francis:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fbbf24" stroke-width="2"><polygon points="13 2 4 14 11 14 10 22 20 10 13 10 13 2"/></svg>',turbine_pelton:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#34d399" stroke-width="2"><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1"/></svg>',powerline:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fde047" stroke-width="2"><path d="M12 3L7 21M12 3l5 18M6 9h12M8 14h8"/></svg>',demolish:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#f87171" stroke-width="2"><path d="M5 5l14 14M19 5L5 19"/></svg>'};var Jl=["normal","rain","flood","low_water"],Kl=[0,1,2,5],Ql=class{constructor(){this.canvas=document.getElementById("scene"),this.device=su();let t=ru(),e=this._loadSetting("quality",null),i=t?"low":e||this.device.recommendedQuality;this.profile=aa[i]||aa.medium,this.audio=new _a,this._initRenderer(),this.scene=new ws,this.camera=new Be(46,window.innerWidth/window.innerHeight,1.5,1600),this.camCtrl=new xa(this.camera,this.canvas),this.hydro=new da(this.profile.grid),this.economy=new pa(this.hydro,{onNotify:(n,r)=>this.notify(n,r),onMilestone:n=>{this.audio.playMilestone(),this.notify(`\u2605 \u0413\u0440\u0430\u043D\u0442 \u041C\u0438\u043D\u044D\u043D\u0435\u0440\u0433\u043E \xAB${n.title}\xBB: +${n.reward.toLocaleString("ru-RU")} \u20BD!`,"good")}}),this.worldView=new ma(this.scene,this.hydro,this.economy,this.profile),this.spray=new ga(this.scene,this.profile.maxParticles),this.renderer.compile(this.scene,this.camera),this.activeToolId="canal_dig",this.brushRadius=8.5,this.manualYaw=null,this.showContours=!1,this.speedIndex=1,this.selectedStruct=null,this.pointerDown=!1,this.lastBrushWorld=null,this.lockedGradeElev=null,this.hoverWorld=null,this.showDiag=!1,this.fps=60,this._fpsFrames=0,this._fpsAccum=0,this._frameCount=0,this._uiRefreshAccum=0,this._lastTime=performance.now(),this._initUI(),this._bindWorldInput(),this._onResize(),window.addEventListener("resize",()=>this._onResize()),this.notify("\u2248 \u0414\u043E\u0431\u0440\u043E \u043F\u043E\u0436\u0430\u043B\u043E\u0432\u0430\u0442\u044C \u0432 \u0434\u043E\u043B\u0438\u043D\u0443 \u0440. \u0411\u044B\u0441\u0442\u0440\u0438\u0446\u0430! \u041F\u0435\u0440\u0435\u0433\u043E\u0440\u043E\u0434\u0438\u0442\u0435 \u0442\u0435\u0441\u043D\u0438\u043D\u0443 \u043F\u043B\u043E\u0442\u0438\u043D\u043E\u0439 \u0438\u043B\u0438 \u0441\u0440\u0435\u0436\u044C\u0442\u0435 \u0438\u0437\u043B\u0443\u0447\u0438\u043D\u0443 \u0441\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u043C \u043A\u0430\u043D\u0430\u043B\u043E\u043C!","info"),requestAnimationFrame(n=>this._loop(n))}_loadSetting(t,e){try{return localStorage.getItem(`cascade.${t}`)||e}catch{return e}}_saveSetting(t,e){try{localStorage.setItem(`cascade.${t}`,e)}catch{}}_initRenderer(){let t=[{antialias:this.profile.id!=="low",powerPreference:"high-performance"},{antialias:!1,powerPreference:"default"},{antialias:!1,failIfMajorPerformanceCaveat:!1}],e=null;for(let n of t)try{if(this.renderer=new sa({canvas:this.canvas,antialias:n.antialias,powerPreference:n.powerPreference,alpha:!1}),this.renderer&&this.renderer.getContext())break}catch(r){e=r,this.renderer=null}if(!this.renderer){let n=Yl(),r=document.getElementById("nogl-modal"),o=document.getElementById("nogl-reason");throw r&&r.classList.remove("hidden"),o&&(o.textContent=n.reason||e&&e.message||"WebGL \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D"),new Error("WebGL context unavailable")}let i=Math.min(window.devicePixelRatio||1,this.profile.maxPixelRatio);this.renderer.setPixelRatio(i),this.renderer.setSize(window.innerWidth,window.innerHeight),this.renderer.shadowMap.enabled=!!this.profile.shadows,this.renderer.shadowMap.type=En,this.renderer.shadowMap.autoUpdate=!1,this.renderer.shadowMap.needsUpdate=!0}_onResize(){let t=window.innerWidth,e=window.innerHeight;this.camera.aspect=t/Math.max(1,e),this.camera.updateProjectionMatrix();let i=Math.min(window.devicePixelRatio||1,this.profile.maxPixelRatio);this.renderer.setPixelRatio(i),this.renderer.setSize(t,e)}raycastValley(t,e){let i=this.canvas.getBoundingClientRect(),n=(t-i.left)/i.width*2-1,r=-((e-i.top)/i.height)*2+1,o=this._raycaster||(this._raycaster=new Bs);o.setFromCamera({x:n,y:r},this.camera);let a=o.ray.origin,l=o.ray.direction;if(l.y>=-.01)return null;let c=Math.max(2,(a.y-72)/-l.y),h=Math.min(1100,(a.y- -2)/-l.y);if(h<=c)return null;let d=64,u=(h-c)/d,p=c,g=Qt.size*.495;for(let _=1;_<=d;_++){let m=c+_*u,f=a.x+l.x*m,v=a.y+l.y*m,C=a.z+l.z*m;if(Math.abs(f)>g||Math.abs(C)>g){p=m;continue}let b=this.hydro.sampleAtWorld(f,C).bed;if(v<=b){let S=p,T=m;for(let w=0;w<5;w++){let A=(S+T)*.5,I=a.x+l.x*A,L=a.y+l.y*A,D=a.z+l.z*A,P=this.hydro.sampleAtWorld(I,D);L<=P.bed?T=A:S=A}let x=(S+T)*.5;return{wx:it(a.x+l.x*x,-g,g),wy:a.y+l.y*x,wz:it(a.z+l.z*x,-g,g)}}p=m}return null}_initUI(){let t=document.getElementById("hotbar");t.innerHTML="";for(let l of la){let c=document.createElement("button");c.className=`tool-slot${l.id===this.activeToolId?" active":""}`,c.dataset.tool=l.id,c.innerHTML=`
        <span class="tool-key">[${l.key}]</span>
        <span class="tool-icon">${mu[l.id]||"\u25C8"}</span>
        <span class="tool-name">${l.short}</span>
        <span class="tool-price">${l.costLabel}</span>
      `,c.addEventListener("click",()=>{this.audio.unlock(),this.selectTool(l.id)}),t.appendChild(c)}this._updateToolHint(),document.querySelectorAll(".size-btn[data-size]").forEach(l=>{l.addEventListener("click",()=>{this.brushRadius=parseFloat(l.dataset.size),document.querySelectorAll(".size-btn[data-size]").forEach(c=>c.classList.remove("active")),l.classList.add("active")})}),document.getElementById("btn-rotate").addEventListener("click",()=>this.rotatePlacement()),document.getElementById("btn-speed").addEventListener("click",()=>this.cycleSpeed()),document.getElementById("btn-contours").addEventListener("click",()=>this.toggleContours()),document.getElementById("btn-weather-cycle").addEventListener("click",()=>{let l=(Jl.indexOf(this.economy.weatherId)+1)%Jl.length,c=Jl[l];this.economy.setWeather(c);let h=ei[c];this.notify(`${h.icon} \u0412\u043A\u043B\u044E\u0447\u0451\u043D \u0440\u0435\u0436\u0438\u043C: ${h.label} (\u043F\u0440\u0438\u0442\u043E\u043A \xD7${h.inflowMult.toFixed(2)})`,"info"),this._refreshHUD()});let e=document.getElementById("btn-creative");e.addEventListener("click",()=>{this.economy.creative=!this.economy.creative,e.classList.toggle("active",this.economy.creative),this.notify(this.economy.creative?"\u{1F6E0}\uFE0F \u0420\u0435\u0436\u0438\u043C \xAB\u0418\u043D\u0436\u0435\u043D\u0435\u0440\u043D\u044B\u0439 \u043A\u0440\u0435\u0430\u0442\u0438\u0432\xBB \u0432\u043A\u043B\u044E\u0447\u0451\u043D: \u0441\u0442\u0440\u043E\u0439\u043A\u0430 \u0438 \u043A\u0430\u043D\u0430\u043B\u044B \u0431\u0435\u0437 \u043E\u0433\u0440\u0430\u043D\u0438\u0447\u0435\u043D\u0438\u0439 \u0431\u044E\u0434\u0436\u0435\u0442\u0430!":"\u{1F4BC} \u0412\u043E\u0437\u0432\u0440\u0430\u0449\u0451\u043D \u044D\u043A\u043E\u043D\u043E\u043C\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0440\u0435\u0436\u0438\u043C \u0441 \u0431\u044E\u0434\u0436\u0435\u0442\u043E\u043C.","info"),this._refreshHUD()});let i=document.getElementById("btn-quality");i.textContent=`\u2699 ${this.profile.label}`,i.addEventListener("click",()=>{let l=["low","medium","high"],c=l[(l.indexOf(this.profile.id)+1)%l.length];this._saveSetting("quality",c),this.profile=aa[c],i.textContent=`\u2699 ${this.profile.label}`,this.renderer.shadowMap.enabled=!!this.profile.shadows,this.renderer.shadowMap.needsUpdate=!0,this._onResize(),this.notify(`\u0413\u0440\u0430\u0444\u0438\u043A\u0430 \u043F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0435\u043D\u0430: ${this.profile.label} (\u043F\u043E\u043B\u043D\u0430\u044F \u0441\u043C\u0435\u043D\u0430 \u0441\u0435\u0442\u043A\u0438 \u0432\u043E\u0434\u044B \u2014 \u043F\u043E\u0441\u043B\u0435 \u043F\u0435\u0440\u0435\u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u044B)`,"info")});let n=document.getElementById("btn-mute");n.addEventListener("click",()=>{let l=this.audio.toggleMute();n.textContent=l?"\u2715 \u0411\u0435\u0437 \u0437\u0432\u0443\u043A\u0430":"\u266A \u0417\u0432\u0443\u043A"});let r=document.getElementById("help-modal");document.getElementById("btn-help").addEventListener("click",()=>r.classList.toggle("hidden")),document.getElementById("help-close").addEventListener("click",()=>r.classList.add("hidden")),document.getElementById("help-start-btn").addEventListener("click",()=>{this.audio.unlock(),r.classList.add("hidden")}),document.querySelectorAll(".lm-btn").forEach(l=>{l.addEventListener("click",()=>{let[c,h,d]=l.dataset.fly.split(",").map(Number),u=this.hydro.sampleAtWorld(c,h).bed;this.camCtrl.flyTo(c,h,d,u)})});let o=document.getElementById("panel-body"),a=document.getElementById("btn-toggle-panel");a.addEventListener("click",()=>{let l=o.classList.toggle("hidden");a.textContent=l?"\u25B8":"\u25BE"}),document.getElementById("btn-loan").addEventListener("click",()=>{let l=this.economy.takeGreenLoan();l.ok?this.notify(`\u{1F4B5} \u0412\u044B\u043F\u0443\u0449\u0435\u043D\u044B \u0437\u0435\u043B\u0451\u043D\u044B\u0435 \u043E\u0431\u043B\u0438\u0433\u0430\u0446\u0438\u0438 \u0413\u042D\u0421: +${l.amount.toLocaleString("ru-RU")} \u20BD`,"good"):this.notify(l.reason,"warn"),this._refreshHUD()}),document.getElementById("btn-repay").addEventListener("click",()=>{let l=this.economy.repayLoan();l.ok?this.notify(`\u041F\u043E\u0433\u0430\u0448\u0435\u043D\u0430 \u0447\u0430\u0441\u0442\u044C \u043E\u0431\u043B\u0438\u0433\u0430\u0446\u0438\u0439: -${l.amount.toLocaleString("ru-RU")} \u20BD`,"info"):this.notify(l.reason,"warn"),this._refreshHUD()}),document.getElementById("insp-close").addEventListener("click",()=>{this.selectedStruct=null,document.getElementById("struct-inspector").classList.add("hidden")}),document.getElementById("insp-slider").addEventListener("input",l=>{if(!this.selectedStruct)return;let c=Number(l.target.value)/100;this.selectedStruct.kind==="turbine"?(this.selectedStruct.throttle=c,this.selectedStruct.autoDispatch=!1,document.getElementById("insp-auto").checked=!1):(this.selectedStruct.openRatio=c,this.selectedStruct.autoRegulate=!1,document.getElementById("insp-auto").checked=!1,this.hydro._syncSpillwayGateCells(this.selectedStruct)),this._refreshInspector()}),document.getElementById("insp-auto").addEventListener("change",l=>{if(!this.selectedStruct)return;let c=l.target.checked;this.selectedStruct.kind==="turbine"?this.selectedStruct.autoDispatch=c:this.selectedStruct.autoRegulate=c,this._refreshInspector()}),window.addEventListener("keydown",l=>{if(l.target&&(l.target.tagName==="INPUT"||l.target.tagName==="SELECT"))return;if(l.code==="F3"){l.preventDefault(),this.showDiag=!this.showDiag,document.getElementById("diag-panel").classList.toggle("hidden",!this.showDiag);return}let c=l.key.toUpperCase();for(let h of la)if(h.key===c){this.selectTool(h.id);return}l.code==="KeyV"||l.code==="Space"?(l.preventDefault(),this.cycleSpeed()):l.code==="KeyC"?this.toggleContours():l.code==="KeyR"?this.rotatePlacement():l.code==="KeyK"?e.click():l.code==="KeyM"?n.click():l.code==="KeyH"&&r.classList.toggle("hidden")}),this._renderCityCards(),this._refreshHUD()}selectTool(t){this.activeToolId=t,document.querySelectorAll(".tool-slot").forEach(e=>{e.classList.toggle("active",e.dataset.tool===t)}),this._updateToolHint()}_updateToolHint(){let t=la.find(i=>i.id===this.activeToolId),e=document.getElementById("tool-hint");t&&e&&(e.textContent=`\u25B8 ${t.name}: ${t.desc}`)}rotatePlacement(){this.manualYaw===null?this.manualYaw=0:this.manualYaw+=Math.PI*.25,this.manualYaw>Math.PI*2&&(this.manualYaw=null),this.notify(this.manualYaw===null?"\u21BB \u0410\u0432\u0442\u043E-\u043E\u0440\u0438\u0435\u043D\u0442\u0430\u0446\u0438\u044F \u0441\u0442\u0432\u043E\u0440\u0430 \u043F\u043E \u0443\u043A\u043B\u043E\u043D\u0443 \u0432\u043E\u0434\u044B \u0432\u043A\u043B\u044E\u0447\u0435\u043D\u0430":`\u21BB \u0420\u0443\u0447\u043D\u043E\u0439 \u0443\u0433\u043E\u043B \u0441\u0442\u0432\u043E\u0440\u0430: ${Math.round(this.manualYaw*180/Math.PI)}\xB0`,"info")}cycleSpeed(){this.speedIndex=(this.speedIndex+1)%Kl.length;let t=Kl[this.speedIndex],e=document.getElementById("btn-speed");e.textContent=t===0?"\u23F8 \u041F\u0430\u0443\u0437\u0430":`\u25B6 \xD7${t}`,e.classList.toggle("active",t>1)}toggleContours(){this.showContours=!this.showContours,this.worldView.terrainMat.uniforms.uShowContours.value=this.showContours?1:0,document.getElementById("btn-contours").classList.toggle("active",this.showContours)}_bindWorldInput(){this.canvas.addEventListener("pointerdown",t=>{if(this.audio.unlock(),t.button!==0||this.camCtrl.touches.size>=2)return;let e=this.raycastValley(t.clientX,t.clientY);if(!e)return;let i=this.hydro.findStructureNear(e.wx,e.wz,12);if(i&&(this.activeToolId==="inspect"||t.altKey)){this.selectedStruct=i,document.getElementById("struct-inspector").classList.remove("hidden"),this._refreshInspector();return}if(this.activeToolId==="spillway"||this.activeToolId.startsWith("turbine_")||this.activeToolId==="powerline"||this.activeToolId==="demolish"||this.activeToolId==="inspect"){this._applySingleClickTool(e.wx,e.wz);return}this.pointerDown=!0,this.lastBrushWorld={wx:e.wx,wz:e.wz};let n=this.hydro.sampleAtWorld(e.wx,e.wz);this.activeToolId==="canal_dig"?this.lockedGradeElev=t.shiftKey?n.bed-1.8:null:this.activeToolId==="concrete_dam"?this.lockedGradeElev=Math.max(n.bed,n.surface)+5.2:this.activeToolId==="earth_dam"?this.lockedGradeElev=Math.max(n.bed,n.surface)+4:this.lockedGradeElev=null,this._applyContinuousStrokePoint(e.wx,e.wz,0)}),window.addEventListener("pointermove",t=>{let e=this.raycastValley(t.clientX,t.clientY);if(this.hoverWorld=e,e?(this.worldView.updateCursor(e.wx,e.wz,this.brushRadius,this.activeToolId,this.manualYaw,!0),this._updateProbeBar(e.wx,e.wz)):this.worldView.updateCursor(0,0,this.brushRadius,this.activeToolId,this.manualYaw,!1),!this.pointerDown||!e||!this.lastBrushWorld||this.camCtrl.touches.size>=2)return;let i=e.wx-this.lastBrushWorld.wx,n=e.wz-this.lastBrushWorld.wz,r=Math.hypot(i,n),o=Math.max(2.2,this.brushRadius*.35);if(r<o)return;let a=Math.min(20,Math.ceil(r/o));for(let l=1;l<=a;l++){let c=l/a,h=oe(this.lastBrushWorld.wx,e.wx,c),d=oe(this.lastBrushWorld.wz,e.wz,c);this.activeToolId==="canal_dig"&&this.lockedGradeElev!==null&&(this.lockedGradeElev-=r/a*.005),this._applyContinuousStrokePoint(h,d,l)}this.lastBrushWorld={wx:e.wx,wz:e.wz}}),window.addEventListener("pointerup",()=>{this.pointerDown=!1,this.lastBrushWorld=null,this.lockedGradeElev=null})}_applyContinuousStrokePoint(t,e,i){let n=this.economy.cash,r=this.economy.creative;if(this.activeToolId==="canal_dig"){let o=this.hydro.excavateCanal(t,e,this.brushRadius,1.35,this.lockedGradeElev,n,r);if(o.excavatedM3>0){if(this.economy.spend(o.cost),i===0){this.audio.playDig();let a=this.hydro.sampleAtWorld(t,e);this.spray.spawnDigSplash(t,a.bed,e,8)}}else!r&&n<35&&i===0&&this.notify("\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0441\u0440\u0435\u0434\u0441\u0442\u0432 \u043D\u0430 \u0437\u0435\u043C\u043B\u044F\u043D\u044B\u0435 \u0440\u0430\u0431\u043E\u0442\u044B!","warn")}else if(this.activeToolId==="canal_liner"){let o=this.hydro.lineCanalConcrete(t,e,this.brushRadius,n,r);o.count>0&&(this.economy.spend(o.cost),i===0&&this.audio.playBuild())}else if(this.activeToolId==="earth_dam"){let o=this.hydro.buildEarthDam(t,e,this.brushRadius,1.8,this.lockedGradeElev,n,r);o.addedM3>0&&(this.economy.spend(o.cost),i===0&&this.audio.playDig())}else if(this.activeToolId==="concrete_dam"){let o=this.lockedGradeElev??this.hydro.sampleAtWorld(t,e).bed+5,a=this.hydro.buildConcreteDam(t,e,this.brushRadius,o,n,r);a.addedM3>0?(this.economy.spend(a.cost),i===0&&this.audio.playBuild()):!r&&n<150&&i===0&&this.notify("\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0431\u0435\u0442\u043E\u043D\u0430/\u0441\u0440\u0435\u0434\u0441\u0442\u0432 (\u043C\u043E\u0436\u043D\u043E \u0432\u044B\u043F\u0443\u0441\u0442\u0438\u0442\u044C \u0437\u0435\u043B\u0451\u043D\u044B\u0435 \u043E\u0431\u043B\u0438\u0433\u0430\u0446\u0438\u0438 \u0441\u043F\u0440\u0430\u0432\u0430!)","warn")}}_applySingleClickTool(t,e){let i=this.economy.cash,n=this.economy.creative;if(this.activeToolId==="inspect"){let r=this.hydro.findStructureNear(t,e,15);r&&(this.selectedStruct=r,document.getElementById("struct-inspector").classList.remove("hidden"),this._refreshInspector());return}if(this.activeToolId==="spillway"){let r=this.hydro.placeSpillway(t,e,this.manualYaw,i,n);if(!r.ok){this.notify(r.reason,"warn");return}this.economy.spend(r.cost),this.audio.playBuild(),this.selectedStruct=r.structure,document.getElementById("struct-inspector").classList.remove("hidden"),this._refreshInspector(),this.notify("\u{1F30A} \u0423\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D \u0432\u043E\u0434\u043E\u0441\u0431\u0440\u043E\u0441 \u0441 \u0441\u0435\u0433\u043C\u0435\u043D\u0442\u043D\u044B\u043C \u0437\u0430\u0442\u0432\u043E\u0440\u043E\u043C \u0438 \u0430\u0432\u0442\u043E\u0437\u0430\u0449\u0438\u0442\u043E\u0439 \u043E\u0442 \u043F\u0435\u0440\u0435\u043B\u0438\u0432\u0430!","good");return}if(this.activeToolId.startsWith("turbine_")){let r=this.activeToolId.replace("turbine_",""),o=this.hydro.placeTurbine(r,t,e,this.manualYaw,i,n);if(!o.ok){this.notify(o.reason,"warn");return}this.economy.spend(o.cost),this.audio.playBuild(),this.selectedStruct=o.structure,document.getElementById("struct-inspector").classList.remove("hidden"),this._refreshInspector(),this.notify(`\u26A1 \u0421\u043C\u043E\u043D\u0442\u0438\u0440\u043E\u0432\u0430\u043D \u0433\u0438\u0434\u0440\u043E\u0430\u0433\u0440\u0435\u0433\u0430\u0442 ${o.structure.spec.name}! \u041A\u043E\u043F\u0438\u0442\u0435 \u043D\u0430\u043F\u043E\u0440 \u0432\u0435\u0440\u0445\u043D\u0435\u0433\u043E \u0431\u044C\u0435\u0444\u0430.`,"good");return}if(this.activeToolId==="powerline"){let r=null,o=95;for(let l of this.economy.cities){let c=Math.hypot(l.x-t,l.z-e);c<o&&(o=c,r=l)}if(!r){this.notify("\u041A\u043B\u0438\u043A\u043D\u0438\u0442\u0435 \u0431\u043B\u0438\u0436\u0435 \u043A \u0433\u043E\u0440\u043E\u0434\u0443 (\u0438\u043B\u0438 \u043D\u0430\u0436\u043C\u0438\u0442\u0435 \xAB\u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u041B\u042D\u041F\xBB \u0432 \u043A\u0430\u0440\u0442\u043E\u0447\u043A\u0435 \u0433\u043E\u0440\u043E\u0434\u0430 \u0441\u043F\u0440\u0430\u0432\u0430)","info");return}let a=this.economy.connectCityGrid(r.id);a.ok?this.audio.playBuild():this.notify(a.reason,"warn"),this._renderCityCards();return}if(this.activeToolId==="demolish"){let r=this.hydro.demolishAt(t,e);r.removed&&(this.economy.earn(r.refund),this.audio.playDig(),this.selectedStruct&&!this.hydro.turbines.includes(this.selectedStruct)&&!this.hydro.spillways.includes(this.selectedStruct)&&(this.selectedStruct=null,document.getElementById("struct-inspector").classList.add("hidden")),this.notify(r.refund>0?`\u0414\u0435\u043C\u043E\u043D\u0442\u0430\u0436 \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D (\u0432\u043E\u0437\u0432\u0440\u0430\u0442 +${r.refund.toLocaleString("ru-RU")} \u20BD)`:"\u0423\u0447\u0430\u0441\u0442\u043E\u043A \u0440\u0430\u0441\u0447\u0438\u0449\u0435\u043D","info"))}}_updateProbeBar(t,e){let i=this.hydro.sampleAtWorld(t,e),n=document.getElementById("probe-readout");if(!n)return;let r=i.depth<.03?"\u0441\u0443\u0445\u043E":i.froude>1?"\u0431\u0443\u0440\u043D\u044B\u0439 Fr>1":"\u0441\u043F\u043E\u043A\u043E\u0439\u043D\u044B\u0439",o=i.concrete>.2?"\u0411\u0435\u0442\u043E\u043D \u043F\u043B\u043E\u0442\u0438\u043D\u044B":i.lined?"\u0411\u0435\u0442\u043E\u043D \u043A\u0430\u043D\u0430\u043B\u0430":i.earthDam?"\u041D\u0430\u0441\u044B\u043F\u044C \u0434\u0430\u043C\u0431\u044B":"\u0413\u0440\u0443\u043D\u0442/\u0421\u043A\u0430\u043B\u0430";n.textContent=`\u0414\u043D\u043E: ${i.bed.toFixed(1)} \u043C (${o}) \xB7 \u0412\u043E\u0434\u0430: ${i.depth>.02?i.surface.toFixed(1)+" \u043C":"\u2014"} \xB7 \u0413\u043B\u0443\u0431.: ${i.depth.toFixed(2)} \u043C \xB7 V: ${i.speed.toFixed(2)} \u043C/\u0441 (${r})`}_renderCityCards(){let t=document.getElementById("cities-list");if(t){t.innerHTML="";for(let e of this.economy.cities){let i=document.createElement("div");i.className=`city-card${e.isFlooded?" flooded":""}`,i.id=`city-card-${e.id}`;let n=this.economy.estimatePowerLineCost(e),r=Math.round(e.growthProgress*100),o=e.connected?`\u26A1 ${e.suppliedMW.toFixed(2)} / ${e.currentDemandMW.toFixed(2)} \u041C\u0412\u0442`:`\u041D\u0435 \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0451\u043D (\u0441\u043F\u0440\u043E\u0441 ${e.currentDemandMW.toFixed(2)} \u041C\u0412\u0442)`,a="";e.isFlooded?a='<div class="city-note warn">! \u041A\u0432\u0430\u0440\u0442\u0430\u043B\u044B \u043F\u043E\u0434\u0442\u043E\u043F\u043B\u0435\u043D\u044B! \u0420\u043E\u0441\u0442 \u043E\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D</div>':e.needsIrrigation&&(a=e.irrigated?'<div class="city-note">\u25C8 \u041E\u0440\u043E\u0441\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u043A\u0430\u043D\u0430\u043B \u0430\u043A\u0442\u0438\u0432\u0435\u043D (+95 \u20BD/\u0441, \u0440\u043E\u0441\u0442 \xD71.75)</div>':'<div class="city-note warn">\u25C8 \u041F\u043E\u0434\u0432\u0435\u0434\u0438\u0442\u0435 \u043A\u0430\u043D\u0430\u043B \u043A \u0437\u0435\u043B\u0451\u043D\u043E\u043C\u0443 \u043A\u043E\u043B\u044C\u0446\u0443 (+95 \u20BD/\u0441)</div>'),i.innerHTML=`
        <div class="city-top">
          <span class="city-name" data-flycity="${e.id}">\u25B8 ${e.name}</span>
          <span class="city-badge">${e.levelName} \xB7 ${e.buildingIndices.length} \u0437\u0434.</span>
        </div>
        <div class="city-meta">
          <span>\u041D\u0430\u0441.: ${e.population.toLocaleString("ru-RU")}</span>
          <span>${o}</span>
        </div>
        <div class="progress-track" title="\u041F\u0440\u043E\u0433\u0440\u0435\u0441\u0441 \u0441\u0430\u043C\u043E\u0441\u0442\u043E\u044F\u0442\u0435\u043B\u044C\u043D\u043E\u0439 \u0437\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u043D\u043E\u0432\u043E\u0433\u043E \u043A\u0432\u0430\u0440\u0442\u0430\u043B\u0430">
          <div class="progress-fill" style="width:${r}%"></div>
        </div>
        ${a}
        ${e.connected?"":`<div class="city-actions"><button class="connect-btn" data-connect="${e.id}">\u26A1 \u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u041B\u042D\u041F (${n.toLocaleString("ru-RU")} \u20BD)</button></div>`}
      `,t.appendChild(i)}t.querySelectorAll("[data-flycity]").forEach(e=>{e.addEventListener("click",()=>{let i=this.economy.cities.find(n=>n.id===e.dataset.flycity);i&&this.camCtrl.flyTo(i.x,i.z,118,i.baseElevation)})}),t.querySelectorAll("[data-connect]").forEach(e=>{e.addEventListener("click",()=>{let i=this.economy.connectCityGrid(e.dataset.connect);i.ok?this.audio.playBuild():this.notify(i.reason,"warn"),this._renderCityCards(),this._refreshHUD()})})}}_refreshHUD(){let t=this.economy.getSummary();document.getElementById("hud-cash").textContent=this.economy.creative?"\u221E \u041A\u0420\u0415\u0410\u0422\u0418\u0412":`${Math.round(t.cash).toLocaleString("ru-RU")} \u20BD`;let e=t.netPerSec>=0?"+":"",i=document.getElementById("hud-net");i.textContent=`${e}${Math.round(t.netPerSec).toLocaleString("ru-RU")} \u20BD/\u0441`,i.style.color=t.netPerSec>=0?"#4ade80":"#f87171",document.getElementById("hud-mw").textContent=`${t.totalMW.toFixed(2)} \u041C\u0412\u0442`,document.getElementById("hud-demand").textContent=`\u0421\u0435\u0442\u044C: ${t.suppliedCityMW.toFixed(2)} / ${t.connectedDemandMW.toFixed(2)} \u041C\u0412\u0442`;let n=Math.floor(t.hour),r=Math.floor((t.hour-n)*60);document.getElementById("hud-clock").textContent=`\u0414\u0435\u043D\u044C ${t.day} \xB7 ${String(n).padStart(2,"0")}:${String(r).padStart(2,"0")}`,document.getElementById("hud-tariff").textContent=t.periodLabel;let o=document.getElementById("chip-tariff");o.className=`stat-chip stat-tariff ${t.periodClass}`,document.getElementById("hud-weather").textContent=`${t.weather.icon} ${t.weather.label}`,document.getElementById("hud-stockpile").textContent=`\u041E\u0442\u0432\u0430\u043B \u0433\u0440\u0443\u043D\u0442\u0430: ${Math.round(t.soilStockpileM3).toLocaleString("ru-RU")} \u043C\xB3`,document.getElementById("hud-pop-total").textContent=`\u041D\u0430\u0441\u0435\u043B\u0435\u043D\u0438\u0435 \u0434\u043E\u043B\u0438\u043D\u044B: ${t.totalPopulation.toLocaleString("ru-RU")} \u0436\u0438\u0442.`,document.getElementById("hud-loan").textContent=`\u0414\u043E\u043B\u0433 \u043F\u043E \u043E\u0431\u043B\u0438\u0433\u0430\u0446\u0438\u044F\u043C: ${Math.round(t.loan).toLocaleString("ru-RU")} \u20BD`;let a=Ks.find(l=>!this.economy.completedMilestones.has(l.id));a?(document.getElementById("ms-title").textContent=`${a.title} (+${a.reward.toLocaleString("ru-RU")} \u20BD)`,document.getElementById("ms-desc").textContent=a.desc):(document.getElementById("ms-title").textContent="\u0412\u0441\u0435 \u0433\u043E\u0441\u0443\u0434\u0430\u0440\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0435 \u0433\u0440\u0430\u043D\u0442\u044B \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u044B!",document.getElementById("ms-desc").textContent="\u0412\u0430\u0448 \u043A\u0430\u0441\u043A\u0430\u0434 \u0413\u042D\u0421 \u0441\u0442\u0430\u043B \u044D\u043D\u0435\u0440\u0433\u0435\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u043C \u0441\u0435\u0440\u0434\u0446\u0435\u043C \u0434\u043E\u043B\u0438\u043D\u044B."),this._renderCityCards(),this.selectedStruct&&this._refreshInspector()}_refreshInspector(){let t=this.selectedStruct;if(!t)return;let e=document.getElementById("insp-title"),i=document.getElementById("insp-metrics"),n=document.getElementById("insp-slider"),r=document.getElementById("insp-slider-label"),o=document.getElementById("insp-auto"),a=document.getElementById("insp-auto-label");if(t.kind==="turbine"){e.textContent=`\u2699\uFE0F ${t.spec.name} (#${t.id})`,i.innerHTML=`
        <span>\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C: <b>${t.powerMW.toFixed(2)} \u041C\u0412\u0442</b></span>
        <span>\u041D\u0430\u043F\u043E\u0440 \u0447\u0438\u0441\u0442.: <b>${t.netHead.toFixed(1)} \u043C</b></span>
        <span>\u0420\u0430\u0441\u0445\u043E\u0434 Q: <b>${t.flowQ.toFixed(1)} \u043C\xB3/\u0441</b></span>
        <span>\u041A\u041F\u0414 \u03B7: <b>${Math.round(t.efficiency*100)}%</b></span>
        <span>\u0420\u0435\u0441\u0443\u0440\u0441: <b>${Math.round(t.condition*100)}%</b></span>
        <span>\u041A\u0430\u0432\u0438\u0442\u0430\u0446\u0438\u044F: <b>${t.cavitation>.2?"\u26A0\uFE0F \u0435\u0441\u0442\u044C":"\u043D\u043E\u0440\u043C\u0430"}</b></span>
      `;let l=Math.round(t.throttle*100);n.value=l,r.textContent=`\u041E\u0442\u043A\u0440\u044B\u0442\u0438\u0435 \u043D\u0430\u043F\u0440\u0430\u0432\u043B\u044F\u044E\u0449\u0435\u0433\u043E \u0430\u043F\u043F\u0430\u0440\u0430\u0442\u0430: ${l}%`,o.checked=!!t.autoDispatch,a.textContent="\u0410\u0432\u0442\u043E-\u0434\u0438\u0441\u043F\u0435\u0442\u0447\u0435\u0440 \u043F\u043E \u043F\u0438\u043A\u0430\u043C \u044D\u043D\u0435\u0440\u0433\u043E\u0440\u044B\u043D\u043A\u0430 (\u043A\u043E\u043F\u0438\u0442\u044C \u043D\u043E\u0447\u044C\u044E)"}else{e.textContent=`\u{1F30A} \u0412\u043E\u0434\u043E\u0441\u0431\u0440\u043E\u0441 \u0441 \u0442\u0440\u0430\u043C\u043F\u043B\u0438\u043D\u043E\u043C (#${t.id})`,i.innerHTML=`
        <span>\u0421\u0431\u0440\u043E\u0441 Q: <b>${t.currentFlowQ.toFixed(1)} \u043C\xB3/\u0441</b></span>
        <span>\u0421\u043A\u043E\u0440\u043E\u0441\u0442\u044C \u0441\u0442\u0440\u0443\u0438: <b>${t.jetSpeed.toFixed(1)} \u043C/\u0441</b></span>
        <span>\u041E\u0442\u043C\u0435\u0442\u043A\u0430 \u043F\u043E\u0440\u043E\u0433\u0430: <b>${t.sillElev.toFixed(1)} \u043C</b></span>
        <span>\u0423\u0441\u0442\u0430\u0432\u043A\u0430 \u0431\u044C\u0435\u0444\u0430: <b>${t.targetHeadElev.toFixed(1)} \u043C</b></span>
      `;let l=Math.round(t.openRatio*100);n.value=l,r.textContent=`\u041F\u043E\u0434\u044A\u0451\u043C \u0441\u0435\u0433\u043C\u0435\u043D\u0442\u043D\u043E\u0433\u043E \u0437\u0430\u0442\u0432\u043E\u0440\u0430: ${l}%`,o.checked=!!t.autoRegulate,a.textContent="\u0410\u0432\u0442\u043E-\u0441\u0431\u0440\u043E\u0441 \u043F\u0430\u0432\u043E\u0434\u043A\u0430 \u043F\u0440\u0438 \u043F\u0435\u0440\u0435\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u0438 \u0432\u0435\u0440\u0445\u043D\u0435\u0433\u043E \u0431\u044C\u0435\u0444\u0430"}}notify(t,e="info"){let i=document.getElementById("toast-stack");if(!i)return;let n=document.createElement("div");for(n.className=`toast ${e}`,n.textContent=t,i.prepend(n);i.children.length>4;)i.lastElementChild.remove();setTimeout(()=>{n.parentNode&&n.remove()},5200)}_loop(t){requestAnimationFrame(d=>this._loop(d));let e=Math.min(.08,Math.max(.001,(t-this._lastTime)/1e3));this._lastTime=t,this._frameCount++,this._fpsFrames++,this._fpsAccum+=e,this._fpsAccum>=.5&&(this.fps=Math.round(this._fpsFrames/this._fpsAccum),this._fpsFrames=0,this._fpsAccum=0);let i=Kl[this.speedIndex];if(i>0){let d=i<=2?1:2,u=e*i/d;for(let p=0;p<d;p++)this.hydro.step(u,this.profile.substepsCap);this.economy.update(e*i)}let n=this.hydro.sampleAtWorld(this.camCtrl.goalTarget.x,this.camCtrl.goalTarget.z).bed;this.camCtrl.update(e,n);let r=ei[this.economy.weatherId]||ei.normal,{isNight:o,dayFactor:a}=this.worldView.updateAtmosphere(this.economy.hour,r),l=this.hydro.consumeTerrainDirty();l&&(this.worldView.updateTerrainGeometryRect(l.x0,l.z0,l.x1,l.z1),this.renderer.shadowMap.enabled&&(this.renderer.shadowMap.needsUpdate=!0)),this.worldView.updateWaterAndWetness(this.hydro.simTime),this.worldView.syncHydroStructures(),(this.economy.buildingsDirty||this._frameCount%12===0)&&(this.worldView.syncCityInstances(),this.economy.buildingsDirty=!1,this.renderer.shadowMap.enabled&&this.profile.shadowEvery>0&&this._frameCount%30===0&&(this.renderer.shadowMap.needsUpdate=!0));let c=this.economy.weatherId==="flood"?1:this.economy.weatherId==="rain"?.6:0;this.spray.update(e*Math.max(1,Math.min(2,i)),this.hydro,this.camCtrl.target,a,c);let h=0;for(let d of this.hydro.spillways)h+=d.currentFlowQ;if(this.audio.updateContinuous(this.camCtrl.distance,h,this.economy.totalMW),this.renderer.shadowMap.enabled&&this.profile.shadowEvery>0&&this._frameCount%this.profile.shadowEvery===0&&(this.renderer.shadowMap.needsUpdate=!0),this.renderer.render(this.scene,this.camera),this._uiRefreshAccum+=e,this._uiRefreshAccum>=.25&&(this._uiRefreshAccum=0,this._refreshHUD(),this.showDiag)){let d=document.getElementById("diag-panel");d.textContent=ou({fps:this.fps,hydroMs:this.hydro.lastStepMs,grid:`${this.hydro.grid}\xD7${this.hydro.grid}`,activeTiles:this.hydro.activeTileCount,totalTiles:this.hydro.totalTiles,substeps:this.hydro.lastSubsteps,waterVolumeM3:this.hydro.totalWaterVolumeM3,drawCalls:this.renderer.info.render.calls,triangles:this.renderer.info.render.triangles,cityBuildings:this.economy.allBuildings.length,shadows:this.renderer.shadowMap.enabled?`\u0432\u043A\u043B (1/${this.profile.shadowEvery} \u043A\u0430\u0434\u0440\u0430)`:"\u0432\u044B\u043A\u043B"})}}};window.addEventListener("DOMContentLoaded",()=>{window.__game=new Ql});})();
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2026 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
