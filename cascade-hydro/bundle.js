(()=>{var gh=0,Rl=1,xh=2;var Hn=1,yh=2,Ms=3,Xi=0,si=1,Xe=2,qi=0,wn=1,Il=2,Pl=3,Ll=4,vh=5;var Gn=100,_h=101,Mh=102,Sh=103,bh=104,wh=200,Eh=201,Th=202,Ah=203,Dl=204,Nl=205,Ch=206,Rh=207,Ih=208,Ph=209,Lh=210,Dh=211,Nh=212,Uh=213,Fh=214,Kr=0,jr=1,to=2,us=3,eo=4,io=5,no=6,so=7,ar=0,Bh=1,zh=2,Ii=0,Ul=1,Fl=2,Bl=3,zl=4,Ol=5,kl=6,Hl=7;var Gl=300,En=301,Vn=302,No=303,Uo=304,lr=306,Bn=1e3,Oi=1001,ro=1002,We=1003,Oh=1004;var cr=1005;var ke=1006,Fo=1007;var Yi=1008;var li=1009,Vl=1010,Wl=1011,Ss=1012,Bo=1013,Pi=1014,Si=1015,Li=1016,zo=1017,Oo=1018,bs=1020,Xl=35902,ql=35899,Yl=1021,$l=1022,ri=1023,ki=1026,Tn=1027,ko=1028,Ho=1029,An=1030,Go=1031;var Vo=1033,hr=33776,dr=33777,ur=33778,fr=33779,Wo=35840,Xo=35841,qo=35842,Yo=35843,$o=36196,Zo=37492,Qo=37496,Jo=37488,Ko=37489,pr=37490,jo=37491,ta=37808,ea=37809,ia=37810,na=37811,sa=37812,ra=37813,oa=37814,aa=37815,la=37816,ca=37817,ha=37818,da=37819,ua=37820,fa=37821,pa=36492,ma=36494,ga=36495,xa=36283,ya=36284,mr=36285,va=36286;var zs=2300,oo=2301,Qr=2302,_l=2303,Ml=2400,Sl=2401,bl=2402;var kh=3200;var ws=0,Hh=1,sn="",ii="srgb",Os="srgb-linear",ks="linear",ge="srgb";var Jr=7680;var Gh=519,Vh=512,Wh=513,Xh=514,_a=515,qh=516,Yh=517,Ma=518,$h=519,Zh=35044,je=35048;var Zl="300 es",Ri=2e3,fs=2001;function jd(r){for(let t=r.length-1;t>=0;--t)if(r[t]>=65535)return!0;return!1}function tu(r){return ArrayBuffer.isView(r)&&!(r instanceof DataView)}function Hs(r){return document.createElementNS("http://www.w3.org/1999/xhtml",r)}function Qh(){let r=Hs("canvas");return r.style.display="block",r}var Oc={},ps=null;function Ql(...r){let t="THREE."+r.shift();ps?ps("log",t,...r):console.log(t,...r)}function Jh(r){let t=r[0];if(typeof t=="string"&&t.startsWith("TSL:")){let e=r[1];e&&e.isStackTrace?r[0]+=" "+e.getLocation():r[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return r}function Gt(...r){r=Jh(r);let t="THREE."+r.shift();if(ps)ps("warn",t,...r);else{let e=r[0];e&&e.isStackTrace?console.warn(e.getError(t)):console.warn(t,...r)}}function Wt(...r){r=Jh(r);let t="THREE."+r.shift();if(ps)ps("error",t,...r);else{let e=r[0];e&&e.isStackTrace?console.error(e.getError(t)):console.error(t,...r)}}function Fn(...r){let t=r.join(" ");t in Oc||(Oc[t]=!0,Gt(...r))}function Kh(r,t,e){return new Promise(function(i,n){function s(){switch(r.clientWaitSync(t,r.SYNC_FLUSH_COMMANDS_BIT,0)){case r.WAIT_FAILED:n();break;case r.TIMEOUT_EXPIRED:setTimeout(s,e);break;default:i()}}setTimeout(s,e)})}var jh={[Kr]:jr,[to]:no,[eo]:so,[us]:io,[jr]:Kr,[no]:to,[so]:eo,[io]:us},Hi=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[t]===void 0&&(i[t]=[]),i[t].indexOf(e)===-1&&i[t].push(e)}hasEventListener(t,e){let i=this._listeners;return i===void 0?!1:i[t]!==void 0&&i[t].indexOf(e)!==-1}removeEventListener(t,e){let i=this._listeners;if(i===void 0)return;let n=i[t];if(n!==void 0){let s=n.indexOf(e);s!==-1&&n.splice(s,1)}}dispatchEvent(t){let e=this._listeners;if(e===void 0)return;let i=e[t.type];if(i!==void 0){t.target=this;let n=i.slice(0);for(let s=0,o=n.length;s<o;s++)n[s].call(this,t);t.target=null}}},Qe=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var Qa=Math.PI/180,ao=180/Math.PI;function gr(){let r=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Qe[r&255]+Qe[r>>8&255]+Qe[r>>16&255]+Qe[r>>24&255]+"-"+Qe[t&255]+Qe[t>>8&255]+"-"+Qe[t>>16&15|64]+Qe[t>>24&255]+"-"+Qe[e&63|128]+Qe[e>>8&255]+"-"+Qe[e>>16&255]+Qe[e>>24&255]+Qe[i&255]+Qe[i>>8&255]+Qe[i>>16&255]+Qe[i>>24&255]).toLowerCase()}function re(r,t,e){return Math.max(t,Math.min(e,r))}function eu(r,t){return(r%t+t)%t}function Ja(r,t,e){return(1-e)*r+e*t}function Is(r,t){switch(t.constructor){case Float32Array:return r;case Uint32Array:return r/4294967295;case Uint16Array:return r/65535;case Uint8Array:case Uint8ClampedArray:return r/255;case Int32Array:return Math.max(r/2147483647,-1);case Int16Array:return Math.max(r/32767,-1);case Int8Array:return Math.max(r/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function oi(r,t){switch(t.constructor){case Float32Array:return r;case Uint32Array:return Math.round(r*4294967295);case Uint16Array:return Math.round(r*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(r*255);case Int32Array:return Math.round(r*2147483647);case Int16Array:return Math.round(r*32767);case Int8Array:return Math.round(r*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var ec=class ec{constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,i=this.y,n=t.elements;return this.x=n[0]*e+n[3]*i+n[6],this.y=n[1]*e+n[4]*i+n[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=re(this.x,t.x,e.x),this.y=re(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=re(this.x,t,e),this.y=re(this.y,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(re(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let i=this.dot(t)/e;return Math.acos(re(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,i=this.y-t.y;return e*e+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let i=Math.cos(e),n=Math.sin(e),s=this.x-t.x,o=this.y-t.y;return this.x=s*i-o*n+t.x,this.y=s*n+o*i+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};ec.prototype.isVector2=!0;var Zt=ec,fi=class{constructor(t=0,e=0,i=0,n=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=i,this._w=n}static slerpFlat(t,e,i,n,s,o,a){let c=i[n+0],l=i[n+1],h=i[n+2],u=i[n+3],d=s[o+0],f=s[o+1],g=s[o+2],y=s[o+3];if(u!==y||c!==d||l!==f||h!==g){let p=c*d+l*f+h*g+u*y;p<0&&(d=-d,f=-f,g=-g,y=-y,p=-p);let m=1-a;if(p<.9995){let _=Math.acos(p),M=Math.sin(_);m=Math.sin(m*_)/M,a=Math.sin(a*_)/M,c=c*m+d*a,l=l*m+f*a,h=h*m+g*a,u=u*m+y*a}else{c=c*m+d*a,l=l*m+f*a,h=h*m+g*a,u=u*m+y*a;let _=1/Math.sqrt(c*c+l*l+h*h+u*u);c*=_,l*=_,h*=_,u*=_}}t[e]=c,t[e+1]=l,t[e+2]=h,t[e+3]=u}static multiplyQuaternionsFlat(t,e,i,n,s,o){let a=i[n],c=i[n+1],l=i[n+2],h=i[n+3],u=s[o],d=s[o+1],f=s[o+2],g=s[o+3];return t[e]=a*g+h*u+c*f-l*d,t[e+1]=c*g+h*d+l*u-a*f,t[e+2]=l*g+h*f+a*d-c*u,t[e+3]=h*g-a*u-c*d-l*f,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,i,n){return this._x=t,this._y=e,this._z=i,this._w=n,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let i=t._x,n=t._y,s=t._z,o=t._order,a=Math.cos,c=Math.sin,l=a(i/2),h=a(n/2),u=a(s/2),d=c(i/2),f=c(n/2),g=c(s/2);switch(o){case"XYZ":this._x=d*h*u+l*f*g,this._y=l*f*u-d*h*g,this._z=l*h*g+d*f*u,this._w=l*h*u-d*f*g;break;case"YXZ":this._x=d*h*u+l*f*g,this._y=l*f*u-d*h*g,this._z=l*h*g-d*f*u,this._w=l*h*u+d*f*g;break;case"ZXY":this._x=d*h*u-l*f*g,this._y=l*f*u+d*h*g,this._z=l*h*g+d*f*u,this._w=l*h*u-d*f*g;break;case"ZYX":this._x=d*h*u-l*f*g,this._y=l*f*u+d*h*g,this._z=l*h*g-d*f*u,this._w=l*h*u+d*f*g;break;case"YZX":this._x=d*h*u+l*f*g,this._y=l*f*u+d*h*g,this._z=l*h*g-d*f*u,this._w=l*h*u-d*f*g;break;case"XZY":this._x=d*h*u-l*f*g,this._y=l*f*u-d*h*g,this._z=l*h*g+d*f*u,this._w=l*h*u+d*f*g;break;default:Gt("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let i=e/2,n=Math.sin(i);return this._x=t.x*n,this._y=t.y*n,this._z=t.z*n,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,i=e[0],n=e[4],s=e[8],o=e[1],a=e[5],c=e[9],l=e[2],h=e[6],u=e[10],d=i+a+u;if(d>0){let f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(h-c)*f,this._y=(s-l)*f,this._z=(o-n)*f}else if(i>a&&i>u){let f=2*Math.sqrt(1+i-a-u);this._w=(h-c)/f,this._x=.25*f,this._y=(n+o)/f,this._z=(s+l)/f}else if(a>u){let f=2*Math.sqrt(1+a-i-u);this._w=(s-l)/f,this._x=(n+o)/f,this._y=.25*f,this._z=(c+h)/f}else{let f=2*Math.sqrt(1+u-i-a);this._w=(o-n)/f,this._x=(s+l)/f,this._y=(c+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let i=t.dot(e)+1;return i<1e-8?(i=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=i):(this._x=0,this._y=-t.z,this._z=t.y,this._w=i)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=i),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(re(this.dot(t),-1,1)))}rotateTowards(t,e){let i=this.angleTo(t);if(i===0)return this;let n=Math.min(1,e/i);return this.slerp(t,n),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let i=t._x,n=t._y,s=t._z,o=t._w,a=e._x,c=e._y,l=e._z,h=e._w;return this._x=i*h+o*a+n*l-s*c,this._y=n*h+o*c+s*a-i*l,this._z=s*h+o*l+i*c-n*a,this._w=o*h-i*a-n*c-s*l,this._onChangeCallback(),this}slerp(t,e){let i=t._x,n=t._y,s=t._z,o=t._w,a=this.dot(t);a<0&&(i=-i,n=-n,s=-s,o=-o,a=-a);let c=1-e;if(a<.9995){let l=Math.acos(a),h=Math.sin(l);c=Math.sin(c*l)/h,e=Math.sin(e*l)/h,this._x=this._x*c+i*e,this._y=this._y*c+n*e,this._z=this._z*c+s*e,this._w=this._w*c+o*e,this._onChangeCallback()}else this._x=this._x*c+i*e,this._y=this._y*c+n*e,this._z=this._z*c+s*e,this._w=this._w*c+o*e,this.normalize();return this}slerpQuaternions(t,e,i){return this.copy(t).slerp(e,i)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),i=Math.random(),n=Math.sqrt(1-i),s=Math.sqrt(i);return this.set(n*Math.sin(t),n*Math.cos(t),s*Math.sin(e),s*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},ic=class ic{constructor(t=0,e=0,i=0){this.x=t,this.y=e,this.z=i}set(t,e,i){return i===void 0&&(i=this.z),this.x=t,this.y=e,this.z=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(kc.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(kc.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,i=this.y,n=this.z,s=t.elements;return this.x=s[0]*e+s[3]*i+s[6]*n,this.y=s[1]*e+s[4]*i+s[7]*n,this.z=s[2]*e+s[5]*i+s[8]*n,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,i=this.y,n=this.z,s=t.elements,o=1/(s[3]*e+s[7]*i+s[11]*n+s[15]);return this.x=(s[0]*e+s[4]*i+s[8]*n+s[12])*o,this.y=(s[1]*e+s[5]*i+s[9]*n+s[13])*o,this.z=(s[2]*e+s[6]*i+s[10]*n+s[14])*o,this}applyQuaternion(t){let e=this.x,i=this.y,n=this.z,s=t.x,o=t.y,a=t.z,c=t.w,l=2*(o*n-a*i),h=2*(a*e-s*n),u=2*(s*i-o*e);return this.x=e+c*l+o*u-a*h,this.y=i+c*h+a*l-s*u,this.z=n+c*u+s*h-o*l,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,i=this.y,n=this.z,s=t.elements;return this.x=s[0]*e+s[4]*i+s[8]*n,this.y=s[1]*e+s[5]*i+s[9]*n,this.z=s[2]*e+s[6]*i+s[10]*n,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=re(this.x,t.x,e.x),this.y=re(this.y,t.y,e.y),this.z=re(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=re(this.x,t,e),this.y=re(this.y,t,e),this.z=re(this.z,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(re(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let i=t.x,n=t.y,s=t.z,o=e.x,a=e.y,c=e.z;return this.x=n*c-s*a,this.y=s*o-i*c,this.z=i*a-n*o,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let i=t.dot(this)/e;return this.copy(t).multiplyScalar(i)}projectOnPlane(t){return Ka.copy(this).projectOnVector(t),this.sub(Ka)}reflect(t){return this.sub(Ka.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let i=this.dot(t)/e;return Math.acos(re(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,i=this.y-t.y,n=this.z-t.z;return e*e+i*i+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,i){let n=Math.sin(e)*t;return this.x=n*Math.sin(i),this.y=Math.cos(e)*t,this.z=n*Math.cos(i),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,i){return this.x=t*Math.sin(e),this.y=i,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),i=this.setFromMatrixColumn(t,1).length(),n=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=i,this.z=n,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,i=Math.sqrt(1-e*e);return this.x=i*Math.cos(t),this.y=e,this.z=i*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};ic.prototype.isVector3=!0;var k=ic,Ka=new k,kc=new fi,nc=class nc{constructor(t,e,i,n,s,o,a,c,l){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,i,n,s,o,a,c,l)}set(t,e,i,n,s,o,a,c,l){let h=this.elements;return h[0]=t,h[1]=n,h[2]=a,h[3]=e,h[4]=s,h[5]=c,h[6]=i,h[7]=o,h[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],this}extractBasis(t,e,i){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let i=t.elements,n=e.elements,s=this.elements,o=i[0],a=i[3],c=i[6],l=i[1],h=i[4],u=i[7],d=i[2],f=i[5],g=i[8],y=n[0],p=n[3],m=n[6],_=n[1],M=n[4],v=n[7],w=n[2],S=n[5],T=n[8];return s[0]=o*y+a*_+c*w,s[3]=o*p+a*M+c*S,s[6]=o*m+a*v+c*T,s[1]=l*y+h*_+u*w,s[4]=l*p+h*M+u*S,s[7]=l*m+h*v+u*T,s[2]=d*y+f*_+g*w,s[5]=d*p+f*M+g*S,s[8]=d*m+f*v+g*T,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],i=t[1],n=t[2],s=t[3],o=t[4],a=t[5],c=t[6],l=t[7],h=t[8];return e*o*h-e*a*l-i*s*h+i*a*c+n*s*l-n*o*c}invert(){let t=this.elements,e=t[0],i=t[1],n=t[2],s=t[3],o=t[4],a=t[5],c=t[6],l=t[7],h=t[8],u=h*o-a*l,d=a*c-h*s,f=l*s-o*c,g=e*u+i*d+n*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let y=1/g;return t[0]=u*y,t[1]=(n*l-h*i)*y,t[2]=(a*i-n*o)*y,t[3]=d*y,t[4]=(h*e-n*c)*y,t[5]=(n*s-a*e)*y,t[6]=f*y,t[7]=(i*c-l*e)*y,t[8]=(o*e-i*s)*y,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,i,n,s,o,a){let c=Math.cos(s),l=Math.sin(s);return this.set(i*c,i*l,-i*(c*o+l*a)+o+t,-n*l,n*c,-n*(-l*o+c*a)+a+e,0,0,1),this}scale(t,e){return Fn("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(ja.makeScale(t,e)),this}rotate(t){return Fn("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(ja.makeRotation(-t)),this}translate(t,e){return Fn("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(ja.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,i,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,i=t.elements;for(let n=0;n<9;n++)if(e[n]!==i[n])return!1;return!0}fromArray(t,e=0){for(let i=0;i<9;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){let i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t}clone(){return new this.constructor().fromArray(this.elements)}};nc.prototype.isMatrix3=!0;var Yt=nc,ja=new Yt,Hc=new Yt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Gc=new Yt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function iu(){let r={enabled:!0,workingColorSpace:Os,spaces:{},convert:function(n,s,o){return this.enabled===!1||s===o||!s||!o||(this.spaces[s].transfer===ge&&(n.r=nn(n.r),n.g=nn(n.g),n.b=nn(n.b)),this.spaces[s].primaries!==this.spaces[o].primaries&&(n.applyMatrix3(this.spaces[s].toXYZ),n.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===ge&&(n.r=ds(n.r),n.g=ds(n.g),n.b=ds(n.b))),n},workingToColorSpace:function(n,s){return this.convert(n,this.workingColorSpace,s)},colorSpaceToWorking:function(n,s){return this.convert(n,s,this.workingColorSpace)},getPrimaries:function(n){return this.spaces[n].primaries},getTransfer:function(n){return n===sn?ks:this.spaces[n].transfer},getToneMappingMode:function(n){return this.spaces[n].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(n,s=this.workingColorSpace){return n.fromArray(this.spaces[s].luminanceCoefficients)},define:function(n){Object.assign(this.spaces,n)},_getMatrix:function(n,s,o){return n.copy(this.spaces[s].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(n){return this.spaces[n].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(n=this.workingColorSpace){return this.spaces[n].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(n,s){return Fn("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),r.workingToColorSpace(n,s)},toWorkingColorSpace:function(n,s){return Fn("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),r.colorSpaceToWorking(n,s)}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],i=[.3127,.329];return r.define({[Os]:{primaries:t,whitePoint:i,transfer:ks,toXYZ:Hc,fromXYZ:Gc,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:ii},outputColorSpaceConfig:{drawingBufferColorSpace:ii}},[ii]:{primaries:t,whitePoint:i,transfer:ge,toXYZ:Hc,fromXYZ:Gc,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:ii}}}),r}var se=iu();function nn(r){return r<.04045?r*.0773993808:Math.pow(r*.9478672986+.0521327014,2.4)}function ds(r){return r<.0031308?r*12.92:1.055*Math.pow(r,.41666)-.055}var Jn,lo=class{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let i;if(t instanceof HTMLCanvasElement)i=t;else{Jn===void 0&&(Jn=Hs("canvas")),Jn.width=t.width,Jn.height=t.height;let n=Jn.getContext("2d");t instanceof ImageData?n.putImageData(t,0,0):n.drawImage(t,0,0,t.width,t.height),i=Jn}return i.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=Hs("canvas");e.width=t.width,e.height=t.height;let i=e.getContext("2d");i.drawImage(t,0,0,t.width,t.height);let n=i.getImageData(0,0,t.width,t.height),s=n.data;for(let o=0;o<s.length;o++)s[o]=nn(s[o]/255)*255;return i.putImageData(n,0,0),e}else if(t.data){let e=t.data.slice(0);for(let i=0;i<e.length;i++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[i]=Math.floor(nn(e[i]/255)*255):e[i]=nn(e[i]);return{data:e,width:t.width,height:t.height}}else return Gt("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},nu=0,ms=class{constructor(t=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:nu++}),this.uuid=gr(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let e=this.data;return typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):typeof VideoFrame<"u"&&e instanceof VideoFrame?t.set(e.displayWidth,e.displayHeight,0):e!==null?t.set(e.width,e.height,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let i={uuid:this.uuid,url:""},n=this.data;if(n!==null){let s;if(Array.isArray(n)){s=[];for(let o=0,a=n.length;o<a;o++)n[o].isDataTexture?s.push(tl(n[o].image)):s.push(tl(n[o]))}else s=tl(n);i.url=s}return e||(t.images[this.uuid]=i),i}};function tl(r){return typeof HTMLImageElement<"u"&&r instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&r instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&r instanceof ImageBitmap?lo.getDataURL(r):r.data?{data:Array.from(r.data),width:r.width,height:r.height,type:r.data.constructor.name}:(Gt("Texture: Unable to serialize Texture."),{})}var su=0,el=new k,ni=class r extends Hi{constructor(t=r.DEFAULT_IMAGE,e=r.DEFAULT_MAPPING,i=Oi,n=Oi,s=ke,o=Yi,a=ri,c=li,l=r.DEFAULT_ANISOTROPY,h=sn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:su++}),this.uuid=gr(),this.name="",this.source=new ms(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=i,this.wrapT=n,this.magFilter=s,this.minFilter=o,this.anisotropy=l,this.format=a,this.internalFormat=null,this.type=c,this.offset=new Zt(0,0),this.repeat=new Zt(1,1),this.center=new Zt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Yt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(el).x}get height(){return this.source.getSize(el).y}get depth(){return this.source.getSize(el).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let e in t){let i=t[e];if(i===void 0){Gt(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}let n=this[e];if(n===void 0){Gt(`Texture.setValues(): property '${e}' does not exist.`);continue}n&&i&&n.isVector2&&i.isVector2||n&&i&&n.isVector3&&i.isVector3||n&&i&&n.isMatrix3&&i.isMatrix3?n.copy(i):this[e]=i}}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),e||(t.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==Gl)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case Bn:t.x=t.x-Math.floor(t.x);break;case Oi:t.x=t.x<0?0:1;break;case ro:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case Bn:t.y=t.y-Math.floor(t.y);break;case Oi:t.y=t.y<0?0:1;break;case ro:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};ni.DEFAULT_IMAGE=null;ni.DEFAULT_MAPPING=Gl;ni.DEFAULT_ANISOTROPY=1;var sc=class sc{constructor(t=0,e=0,i=0,n=1){this.x=t,this.y=e,this.z=i,this.w=n}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,i,n){return this.x=t,this.y=e,this.z=i,this.w=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,i=this.y,n=this.z,s=this.w,o=t.elements;return this.x=o[0]*e+o[4]*i+o[8]*n+o[12]*s,this.y=o[1]*e+o[5]*i+o[9]*n+o[13]*s,this.z=o[2]*e+o[6]*i+o[10]*n+o[14]*s,this.w=o[3]*e+o[7]*i+o[11]*n+o[15]*s,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,i,n,s,c=t.elements,l=c[0],h=c[4],u=c[8],d=c[1],f=c[5],g=c[9],y=c[2],p=c[6],m=c[10];if(Math.abs(h-d)<.01&&Math.abs(u-y)<.01&&Math.abs(g-p)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+y)<.1&&Math.abs(g+p)<.1&&Math.abs(l+f+m-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let M=(l+1)/2,v=(f+1)/2,w=(m+1)/2,S=(h+d)/4,T=(u+y)/4,x=(g+p)/4;return M>v&&M>w?M<.01?(i=0,n=.707106781,s=.707106781):(i=Math.sqrt(M),n=S/i,s=T/i):v>w?v<.01?(i=.707106781,n=0,s=.707106781):(n=Math.sqrt(v),i=S/n,s=x/n):w<.01?(i=.707106781,n=.707106781,s=0):(s=Math.sqrt(w),i=T/s,n=x/s),this.set(i,n,s,e),this}let _=Math.sqrt((p-g)*(p-g)+(u-y)*(u-y)+(d-h)*(d-h));return Math.abs(_)<.001&&(_=1),this.x=(p-g)/_,this.y=(u-y)/_,this.z=(d-h)/_,this.w=Math.acos((l+f+m-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=re(this.x,t.x,e.x),this.y=re(this.y,t.y,e.y),this.z=re(this.z,t.z,e.z),this.w=re(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=re(this.x,t,e),this.y=re(this.y,t,e),this.z=re(this.z,t,e),this.w=re(this.w,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(re(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this.w=t.w+(e.w-t.w)*i,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};sc.prototype.isVector4=!0;var Pe=sc,co=class extends Hi{constructor(t=1,e=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:ke,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=i.depth,this.scissor=new Pe(0,0,t,e),this.scissorTest=!1,this.viewport=new Pe(0,0,t,e),this.textures=[];let n={width:t,height:e,depth:i.depth},s=new ni(n),o=i.count;for(let a=0;a<o;a++)this.textures[a]=s.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveColorBuffer=i.resolveColorBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.storeMultisampledColorBuffer=i.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=i.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=i.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(t={}){let e={minFilter:ke,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),t!==null&&t.renderTarget===null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,i=1){if(this.width!==t||this.height!==e||this.depth!==i){this.width=t,this.height=e,this.depth=i;for(let n=0,s=this.textures.length;n<s;n++)this.textures[n].image.width=t,this.textures[n].image.height=e,this.textures[n].image.depth=i,this.textures[n].isData3DTexture!==!0&&(this.textures[n].isArrayTexture=this.textures[n].image.depth>1);this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,i=t.textures.length;e<i;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;let n=Object.assign({},t.textures[e].image);this.textures[e].source=new ms(n)}if(this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveColorBuffer=t.resolveColorBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,this.storeMultisampledColorBuffer=t.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=t.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=t.storeMultisampledStencilBuffer,t.depthTexture!==null)if(t.depthTexture.renderTarget===t){let e=t.depthTexture.clone();e.renderTarget=null,this.depthTexture=e}else this.depthTexture=t.depthTexture;return this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},ai=class extends co{constructor(t=1,e=1,i={}){super(t,e,i),this.isWebGLRenderTarget=!0}},Gs=class extends ni{constructor(t=null,e=1,i=1,n=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:i,depth:n},this.magFilter=We,this.minFilter=We,this.wrapR=Oi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var ho=class extends ni{constructor(t=null,e=1,i=1,n=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:i,depth:n},this.magFilter=We,this.minFilter=We,this.wrapR=Oi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}};var Do=class Do{constructor(t,e,i,n,s,o,a,c,l,h,u,d,f,g,y,p){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,i,n,s,o,a,c,l,h,u,d,f,g,y,p)}set(t,e,i,n,s,o,a,c,l,h,u,d,f,g,y,p){let m=this.elements;return m[0]=t,m[4]=e,m[8]=i,m[12]=n,m[1]=s,m[5]=o,m[9]=a,m[13]=c,m[2]=l,m[6]=h,m[10]=u,m[14]=d,m[3]=f,m[7]=g,m[11]=y,m[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Do().fromArray(this.elements)}copy(t){let e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],e[9]=i[9],e[10]=i[10],e[11]=i[11],e[12]=i[12],e[13]=i[13],e[14]=i[14],e[15]=i[15],this}copyPosition(t){let e=this.elements,i=t.elements;return e[12]=i[12],e[13]=i[13],e[14]=i[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,i){return this.determinantAffine()===0?(t.set(1,0,0),e.set(0,1,0),i.set(0,0,1),this):(t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(t,e,i){return this.set(t.x,e.x,i.x,0,t.y,e.y,i.y,0,t.z,e.z,i.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();let e=this.elements,i=t.elements,n=1/Kn.setFromMatrixColumn(t,0).length(),s=1/Kn.setFromMatrixColumn(t,1).length(),o=1/Kn.setFromMatrixColumn(t,2).length();return e[0]=i[0]*n,e[1]=i[1]*n,e[2]=i[2]*n,e[3]=0,e[4]=i[4]*s,e[5]=i[5]*s,e[6]=i[6]*s,e[7]=0,e[8]=i[8]*o,e[9]=i[9]*o,e[10]=i[10]*o,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,i=t.x,n=t.y,s=t.z,o=Math.cos(i),a=Math.sin(i),c=Math.cos(n),l=Math.sin(n),h=Math.cos(s),u=Math.sin(s);if(t.order==="XYZ"){let d=o*h,f=o*u,g=a*h,y=a*u;e[0]=c*h,e[4]=-c*u,e[8]=l,e[1]=f+g*l,e[5]=d-y*l,e[9]=-a*c,e[2]=y-d*l,e[6]=g+f*l,e[10]=o*c}else if(t.order==="YXZ"){let d=c*h,f=c*u,g=l*h,y=l*u;e[0]=d+y*a,e[4]=g*a-f,e[8]=o*l,e[1]=o*u,e[5]=o*h,e[9]=-a,e[2]=f*a-g,e[6]=y+d*a,e[10]=o*c}else if(t.order==="ZXY"){let d=c*h,f=c*u,g=l*h,y=l*u;e[0]=d-y*a,e[4]=-o*u,e[8]=g+f*a,e[1]=f+g*a,e[5]=o*h,e[9]=y-d*a,e[2]=-o*l,e[6]=a,e[10]=o*c}else if(t.order==="ZYX"){let d=o*h,f=o*u,g=a*h,y=a*u;e[0]=c*h,e[4]=g*l-f,e[8]=d*l+y,e[1]=c*u,e[5]=y*l+d,e[9]=f*l-g,e[2]=-l,e[6]=a*c,e[10]=o*c}else if(t.order==="YZX"){let d=o*c,f=o*l,g=a*c,y=a*l;e[0]=c*h,e[4]=y-d*u,e[8]=g*u+f,e[1]=u,e[5]=o*h,e[9]=-a*h,e[2]=-l*h,e[6]=f*u+g,e[10]=d-y*u}else if(t.order==="XZY"){let d=o*c,f=o*l,g=a*c,y=a*l;e[0]=c*h,e[4]=-u,e[8]=l*h,e[1]=d*u+y,e[5]=o*h,e[9]=f*u-g,e[2]=g*u-f,e[6]=a*h,e[10]=y*u+d}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(ru,t,ou)}lookAt(t,e,i){let n=this.elements;return di.subVectors(t,e),di.lengthSq()===0&&(di.z=1),di.normalize(),hn.crossVectors(i,di),hn.lengthSq()===0&&(Math.abs(i.z)===1?di.x+=1e-4:di.z+=1e-4,di.normalize(),hn.crossVectors(i,di)),hn.normalize(),Tr.crossVectors(di,hn),n[0]=hn.x,n[4]=Tr.x,n[8]=di.x,n[1]=hn.y,n[5]=Tr.y,n[9]=di.y,n[2]=hn.z,n[6]=Tr.z,n[10]=di.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let i=t.elements,n=e.elements,s=this.elements,o=i[0],a=i[4],c=i[8],l=i[12],h=i[1],u=i[5],d=i[9],f=i[13],g=i[2],y=i[6],p=i[10],m=i[14],_=i[3],M=i[7],v=i[11],w=i[15],S=n[0],T=n[4],x=n[8],E=n[12],C=n[1],R=n[5],L=n[9],D=n[13],I=n[2],F=n[6],z=n[10],G=n[14],K=n[3],N=n[7],$=n[11],Q=n[15];return s[0]=o*S+a*C+c*I+l*K,s[4]=o*T+a*R+c*F+l*N,s[8]=o*x+a*L+c*z+l*$,s[12]=o*E+a*D+c*G+l*Q,s[1]=h*S+u*C+d*I+f*K,s[5]=h*T+u*R+d*F+f*N,s[9]=h*x+u*L+d*z+f*$,s[13]=h*E+u*D+d*G+f*Q,s[2]=g*S+y*C+p*I+m*K,s[6]=g*T+y*R+p*F+m*N,s[10]=g*x+y*L+p*z+m*$,s[14]=g*E+y*D+p*G+m*Q,s[3]=_*S+M*C+v*I+w*K,s[7]=_*T+M*R+v*F+w*N,s[11]=_*x+M*L+v*z+w*$,s[15]=_*E+M*D+v*G+w*Q,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],i=t[4],n=t[8],s=t[12],o=t[1],a=t[5],c=t[9],l=t[13],h=t[2],u=t[6],d=t[10],f=t[14],g=t[3],y=t[7],p=t[11],m=t[15],_=c*f-l*d,M=a*f-l*u,v=a*d-c*u,w=o*f-l*h,S=o*d-c*h,T=o*u-a*h;return e*(y*_-p*M+m*v)-i*(g*_-p*w+m*S)+n*(g*M-y*w+m*T)-s*(g*v-y*S+p*T)}determinantAffine(){let t=this.elements,e=t[0],i=t[4],n=t[8],s=t[1],o=t[5],a=t[9],c=t[2],l=t[6],h=t[10];return e*(o*h-a*l)-i*(s*h-a*c)+n*(s*l-o*c)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,i){let n=this.elements;return t.isVector3?(n[12]=t.x,n[13]=t.y,n[14]=t.z):(n[12]=t,n[13]=e,n[14]=i),this}invert(){let t=this.elements,e=t[0],i=t[1],n=t[2],s=t[3],o=t[4],a=t[5],c=t[6],l=t[7],h=t[8],u=t[9],d=t[10],f=t[11],g=t[12],y=t[13],p=t[14],m=t[15],_=e*a-i*o,M=e*c-n*o,v=e*l-s*o,w=i*c-n*a,S=i*l-s*a,T=n*l-s*c,x=h*y-u*g,E=h*p-d*g,C=h*m-f*g,R=u*p-d*y,L=u*m-f*y,D=d*m-f*p,I=_*D-M*L+v*R+w*C-S*E+T*x;if(I===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let F=1/I;return t[0]=(a*D-c*L+l*R)*F,t[1]=(n*L-i*D-s*R)*F,t[2]=(y*T-p*S+m*w)*F,t[3]=(d*S-u*T-f*w)*F,t[4]=(c*C-o*D-l*E)*F,t[5]=(e*D-n*C+s*E)*F,t[6]=(p*v-g*T-m*M)*F,t[7]=(h*T-d*v+f*M)*F,t[8]=(o*L-a*C+l*x)*F,t[9]=(i*C-e*L-s*x)*F,t[10]=(g*S-y*v+m*_)*F,t[11]=(u*v-h*S-f*_)*F,t[12]=(a*E-o*R-c*x)*F,t[13]=(e*R-i*E+n*x)*F,t[14]=(y*M-g*w-p*_)*F,t[15]=(h*w-u*M+d*_)*F,this}scale(t){let e=this.elements,i=t.x,n=t.y,s=t.z;return e[0]*=i,e[4]*=n,e[8]*=s,e[1]*=i,e[5]*=n,e[9]*=s,e[2]*=i,e[6]*=n,e[10]*=s,e[3]*=i,e[7]*=n,e[11]*=s,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],i=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],n=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,i,n))}makeTranslation(t,e,i){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,i,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),i=Math.sin(t);return this.set(1,0,0,0,0,e,-i,0,0,i,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,0,i,0,0,1,0,0,-i,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,0,i,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let i=Math.cos(e),n=Math.sin(e),s=1-i,o=t.x,a=t.y,c=t.z,l=s*o,h=s*a;return this.set(l*o+i,l*a-n*c,l*c+n*a,0,l*a+n*c,h*a+i,h*c-n*o,0,l*c-n*a,h*c+n*o,s*c*c+i,0,0,0,0,1),this}makeScale(t,e,i){return this.set(t,0,0,0,0,e,0,0,0,0,i,0,0,0,0,1),this}makeShear(t,e,i,n,s,o){return this.set(1,i,s,0,t,1,o,0,e,n,1,0,0,0,0,1),this}compose(t,e,i){let n=this.elements,s=e._x,o=e._y,a=e._z,c=e._w,l=s+s,h=o+o,u=a+a,d=s*l,f=s*h,g=s*u,y=o*h,p=o*u,m=a*u,_=c*l,M=c*h,v=c*u,w=i.x,S=i.y,T=i.z;return n[0]=(1-(y+m))*w,n[1]=(f+v)*w,n[2]=(g-M)*w,n[3]=0,n[4]=(f-v)*S,n[5]=(1-(d+m))*S,n[6]=(p+_)*S,n[7]=0,n[8]=(g+M)*T,n[9]=(p-_)*T,n[10]=(1-(d+y))*T,n[11]=0,n[12]=t.x,n[13]=t.y,n[14]=t.z,n[15]=1,this}decompose(t,e,i){let n=this.elements;t.x=n[12],t.y=n[13],t.z=n[14];let s=this.determinantAffine();if(s===0)return i.set(1,1,1),e.identity(),this;let o=Kn.set(n[0],n[1],n[2]).length(),a=Kn.set(n[4],n[5],n[6]).length(),c=Kn.set(n[8],n[9],n[10]).length();s<0&&(o=-o),Ei.copy(this);let l=1/o,h=1/a,u=1/c;return Ei.elements[0]*=l,Ei.elements[1]*=l,Ei.elements[2]*=l,Ei.elements[4]*=h,Ei.elements[5]*=h,Ei.elements[6]*=h,Ei.elements[8]*=u,Ei.elements[9]*=u,Ei.elements[10]*=u,e.setFromRotationMatrix(Ei),i.x=o,i.y=a,i.z=c,this}makePerspective(t,e,i,n,s,o,a=Ri,c=!1){let l=this.elements,h=2*s/(e-t),u=2*s/(i-n),d=(e+t)/(e-t),f=(i+n)/(i-n),g,y;if(c)g=s/(o-s),y=o*s/(o-s);else if(a===Ri)g=-(o+s)/(o-s),y=-2*o*s/(o-s);else if(a===fs)g=-o/(o-s),y=-o*s/(o-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=h,l[4]=0,l[8]=d,l[12]=0,l[1]=0,l[5]=u,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=g,l[14]=y,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(t,e,i,n,s,o,a=Ri,c=!1){let l=this.elements,h=2/(e-t),u=2/(i-n),d=-(e+t)/(e-t),f=-(i+n)/(i-n),g,y;if(c)g=1/(o-s),y=o/(o-s);else if(a===Ri)g=-2/(o-s),y=-(o+s)/(o-s);else if(a===fs)g=-1/(o-s),y=-s/(o-s);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=h,l[4]=0,l[8]=0,l[12]=d,l[1]=0,l[5]=u,l[9]=0,l[13]=f,l[2]=0,l[6]=0,l[10]=g,l[14]=y,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(t){let e=this.elements,i=t.elements;for(let n=0;n<16;n++)if(e[n]!==i[n])return!1;return!0}fromArray(t,e=0){for(let i=0;i<16;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){let i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t[e+9]=i[9],t[e+10]=i[10],t[e+11]=i[11],t[e+12]=i[12],t[e+13]=i[13],t[e+14]=i[14],t[e+15]=i[15],t}};Do.prototype.isMatrix4=!0;var ue=Do,Kn=new k,Ei=new ue,ru=new k(0,0,0),ou=new k(1,1,1),hn=new k,Tr=new k,di=new k,Vc=new ue,Wc=new fi,pi=class r{constructor(t=0,e=0,i=0,n=r.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=i,this._order=n}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,i,n=this._order){return this._x=t,this._y=e,this._z=i,this._order=n,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,i=!0){let n=t.elements,s=n[0],o=n[4],a=n[8],c=n[1],l=n[5],h=n[9],u=n[2],d=n[6],f=n[10];switch(e){case"XYZ":this._y=Math.asin(re(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-o,s)):(this._x=Math.atan2(d,l),this._z=0);break;case"YXZ":this._x=Math.asin(-re(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-u,s),this._z=0);break;case"ZXY":this._x=Math.asin(re(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-o,l)):(this._y=0,this._z=Math.atan2(c,s));break;case"ZYX":this._y=Math.asin(-re(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(c,s)):(this._x=0,this._z=Math.atan2(-o,l));break;case"YZX":this._z=Math.asin(re(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-h,l),this._y=Math.atan2(-u,s)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-re(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,l),this._y=Math.atan2(a,s)):(this._x=Math.atan2(-h,f),this._y=0);break;default:Gt("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,i===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,i){return Vc.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Vc,e,i)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Wc.setFromEuler(this),this.setFromQuaternion(Wc,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};pi.DEFAULT_ORDER="XYZ";var gs=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},au=0,Xc=new k,jn=new fi,Ji=new ue,Ar=new k,Ps=new k,lu=new k,cu=new fi,qc=new k(1,0,0),Yc=new k(0,1,0),$c=new k(0,0,1),Zc={type:"added"},hu={type:"removed"},ts={type:"childadded",child:null},il={type:"childremoved",child:null},ze=class r extends Hi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:au++}),this.uuid=gr(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=r.DEFAULT_UP.clone();let t=new k,e=new pi,i=new fi,n=new k(1,1,1);function s(){i.setFromEuler(e,!1)}function o(){e.setFromQuaternion(i,void 0,!1)}e._onChange(s),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:n},modelViewMatrix:{value:new ue},normalMatrix:{value:new Yt}}),this.matrix=new ue,this.matrixWorld=new ue,this.matrixAutoUpdate=r.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=r.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new gs,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return jn.setFromAxisAngle(t,e),this.quaternion.multiply(jn),this}rotateOnWorldAxis(t,e){return jn.setFromAxisAngle(t,e),this.quaternion.premultiply(jn),this}rotateX(t){return this.rotateOnAxis(qc,t)}rotateY(t){return this.rotateOnAxis(Yc,t)}rotateZ(t){return this.rotateOnAxis($c,t)}translateOnAxis(t,e){return Xc.copy(t).applyQuaternion(this.quaternion),this.position.add(Xc.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(qc,t)}translateY(t){return this.translateOnAxis(Yc,t)}translateZ(t){return this.translateOnAxis($c,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Ji.copy(this.matrixWorld).invert())}lookAt(t,e,i){t.isVector3?Ar.copy(t):Ar.set(t,e,i);let n=this.parent;this.updateWorldMatrix(!0,!1),Ps.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Ji.lookAt(Ps,Ar,this.up):Ji.lookAt(Ar,Ps,this.up),this.quaternion.setFromRotationMatrix(Ji),n&&(Ji.extractRotation(n.matrixWorld),jn.setFromRotationMatrix(Ji),this.quaternion.premultiply(jn.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(Wt("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Zc),ts.child=t,this.dispatchEvent(ts),ts.child=null):Wt("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(hu),il.child=t,this.dispatchEvent(il),il.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Ji.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Ji.multiply(t.parent.matrixWorld)),t.applyMatrix4(Ji),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Zc),ts.child=t,this.dispatchEvent(ts),ts.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let i=0,n=this.children.length;i<n;i++){let o=this.children[i].getObjectByProperty(t,e);if(o!==void 0)return o}}getObjectsByProperty(t,e,i=[]){this[t]===e&&i.push(this);let n=this.children;for(let s=0,o=n.length;s<o;s++)n[s].getObjectsByProperty(t,e,i);return i}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ps,t,lu),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ps,cu,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(t){t(this);let e=this.children;for(let i=0,n=e.length;i<n;i++)e[i].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let i=0,n=e.length;i<n;i++)e[i].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let e=t.x,i=t.y,n=t.z,s=this.matrix.elements;s[12]+=e-s[0]*e-s[4]*i-s[8]*n,s[13]+=i-s[1]*e-s[5]*i-s[9]*n,s[14]+=n-s[2]*e-s[6]*i-s[10]*n}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let i=0,n=e.length;i<n;i++)e[i].updateMatrixWorld(t)}updateWorldMatrix(t,e,i=!1){let n=this.parent;if(t===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||i)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,i=!0),e===!0){let s=this.children;for(let o=0,a=s.length;o<a;o++)s[o].updateWorldMatrix(!1,!0,i)}}toJSON(t){let e=t===void 0||typeof t=="string",i={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let n={};n.uuid=this.uuid,n.type=this.type,n.name=this.name,n.castShadow=this.castShadow,n.receiveShadow=this.receiveShadow,n.visible=this.visible,n.frustumCulled=this.frustumCulled,n.renderOrder=this.renderOrder,n.static=this.static,n.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(n.userData=this.userData),n.layers=this.layers.mask,n.matrix=this.matrix.toArray(),n.up=this.up.toArray(),this.pivot!==null&&(n.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(n.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(n.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(n.type="InstancedMesh",n.count=this.count,n.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(n.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(n.type="BatchedMesh",n.perObjectFrustumCulled=this.perObjectFrustumCulled,n.sortObjects=this.sortObjects,n.drawRanges=this._drawRanges,n.reservedRanges=this._reservedRanges,n.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),n.instanceInfo=this._instanceInfo.map(a=>({...a})),n.availableInstanceIds=this._availableInstanceIds.slice(),n.availableGeometryIds=this._availableGeometryIds.slice(),n.nextIndexStart=this._nextIndexStart,n.nextVertexStart=this._nextVertexStart,n.geometryCount=this._geometryCount,n.maxInstanceCount=this._maxInstanceCount,n.maxVertexCount=this._maxVertexCount,n.maxIndexCount=this._maxIndexCount,n.geometryInitialized=this._geometryInitialized,n.matricesTexture=this._matricesTexture.toJSON(t),n.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(n.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(n.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(n.boundingBox=this.boundingBox.toJSON()));function s(a,c){return a[c.uuid]===void 0&&(a[c.uuid]=c.toJSON(t)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?n.background=this.background.toJSON():this.background.isTexture&&(n.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(n.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){n.geometry=s(t.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let c=a.shapes;if(Array.isArray(c))for(let l=0,h=c.length;l<h;l++){let u=c[l];s(t.shapes,u)}else s(t.shapes,c)}}if(this.isSkinnedMesh&&(n.bindMode=this.bindMode,n.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(t.skeletons,this.skeleton),n.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let c=0,l=this.material.length;c<l;c++)a.push(s(t.materials,this.material[c]));n.material=a}else n.material=s(t.materials,this.material);if(this.children.length>0){n.children=[];for(let a=0;a<this.children.length;a++)n.children.push(this.children[a].toJSON(t).object)}if(this.animations.length>0){n.animations=[];for(let a=0;a<this.animations.length;a++){let c=this.animations[a];n.animations.push(s(t.animations,c))}}if(e){let a=o(t.geometries),c=o(t.materials),l=o(t.textures),h=o(t.images),u=o(t.shapes),d=o(t.skeletons),f=o(t.animations),g=o(t.nodes);a.length>0&&(i.geometries=a),c.length>0&&(i.materials=c),l.length>0&&(i.textures=l),h.length>0&&(i.images=h),u.length>0&&(i.shapes=u),d.length>0&&(i.skeletons=d),f.length>0&&(i.animations=f),g.length>0&&(i.nodes=g)}return i.object=n,i;function o(a){let c=[];for(let l in a){let h=a[l];delete h.metadata,c.push(h)}return c}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let i=0;i<t.children.length;i++){let n=t.children[i];this.add(n.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};ze.DEFAULT_UP=new k(0,1,0);ze.DEFAULT_MATRIX_AUTO_UPDATE=!0;ze.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Ce=class extends ze{constructor(){super(),this.isGroup=!0,this.type="Group"}},du={type:"move"},xs=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Ce,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Ce,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new k,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new k),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Ce,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new k,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new k,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let i of t.hand.values())this._getHandJoint(e,i)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,i){let n=null,s=null,o=null,a=this._targetRay,c=this._grip,l=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(l&&t.hand){o=!0;for(let y of t.hand.values()){let p=e.getJointPose(y,i),m=this._getHandJoint(l,y);p!==null&&(m.matrix.fromArray(p.transform.matrix),m.matrix.decompose(m.position,m.rotation,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=p.radius),m.visible=p!==null}let h=l.joints["index-finger-tip"],u=l.joints["thumb-tip"],d=h.position.distanceTo(u.position),f=.02,g=.005;l.inputState.pinching&&d>f+g?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!l.inputState.pinching&&d<=f-g&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else c!==null&&t.gripSpace&&(s=e.getPose(t.gripSpace,i),s!==null&&(c.matrix.fromArray(s.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,s.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(s.linearVelocity)):c.hasLinearVelocity=!1,s.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(s.angularVelocity)):c.hasAngularVelocity=!1,c.eventsEnabled&&c.dispatchEvent({type:"gripUpdated",data:t,target:this})));a!==null&&(n=e.getPose(t.targetRaySpace,i),n===null&&s!==null&&(n=s),n!==null&&(a.matrix.fromArray(n.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,n.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(n.linearVelocity)):a.hasLinearVelocity=!1,n.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(n.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(du)))}return a!==null&&(a.visible=n!==null),c!==null&&(c.visible=s!==null),l!==null&&(l.visible=o!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let i=new Ce;i.matrixAutoUpdate=!1,i.visible=!1,t.joints[e.jointName]=i,t.add(i)}return t.joints[e.jointName]}},td={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},dn={h:0,s:0,l:0},Cr={h:0,s:0,l:0};function nl(r,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?r+(t-r)*6*e:e<1/2?t:e<2/3?r+(t-r)*6*(2/3-e):r}var ft=class{constructor(t,e,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,i)}set(t,e,i){if(e===void 0&&i===void 0){let n=t;n&&n.isColor?this.copy(n):typeof n=="number"?this.setHex(n):typeof n=="string"&&this.setStyle(n)}else this.setRGB(t,e,i);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=ii){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,se.colorSpaceToWorking(this,e),this}setRGB(t,e,i,n=se.workingColorSpace){return this.r=t,this.g=e,this.b=i,se.colorSpaceToWorking(this,n),this}setHSL(t,e,i,n=se.workingColorSpace){if(t=eu(t,1),e=re(e,0,1),i=re(i,0,1),e===0)this.r=this.g=this.b=i;else{let s=i<=.5?i*(1+e):i+e-i*e,o=2*i-s;this.r=nl(o,s,t+1/3),this.g=nl(o,s,t),this.b=nl(o,s,t-1/3)}return se.colorSpaceToWorking(this,n),this}setStyle(t,e=ii){function i(s){s!==void 0&&parseFloat(s)<1&&Gt("Color: Alpha component of "+t+" will be ignored.")}let n;if(n=/^(\w+)\(([^\)]*)\)/.exec(t)){let s,o=n[1],a=n[2];switch(o){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,e);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,e);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,e);break;default:Gt("Color: Unknown color model "+t)}}else if(n=/^\#([A-Fa-f\d]+)$/.exec(t)){let s=n[1],o=s.length;if(o===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,e);if(o===6)return this.setHex(parseInt(s,16),e);Gt("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=ii){let i=td[t.toLowerCase()];return i!==void 0?this.setHex(i,e):Gt("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=nn(t.r),this.g=nn(t.g),this.b=nn(t.b),this}copyLinearToSRGB(t){return this.r=ds(t.r),this.g=ds(t.g),this.b=ds(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=ii){return se.workingToColorSpace(Je.copy(this),t),Math.round(re(Je.r*255,0,255))*65536+Math.round(re(Je.g*255,0,255))*256+Math.round(re(Je.b*255,0,255))}getHexString(t=ii){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=se.workingColorSpace){se.workingToColorSpace(Je.copy(this),e);let i=Je.r,n=Je.g,s=Je.b,o=Math.max(i,n,s),a=Math.min(i,n,s),c,l,h=(a+o)/2;if(a===o)c=0,l=0;else{let u=o-a;switch(l=h<=.5?u/(o+a):u/(2-o-a),o){case i:c=(n-s)/u+(n<s?6:0);break;case n:c=(s-i)/u+2;break;case s:c=(i-n)/u+4;break}c/=6}return t.h=c,t.s=l,t.l=h,t}getRGB(t,e=se.workingColorSpace){return se.workingToColorSpace(Je.copy(this),e),t.r=Je.r,t.g=Je.g,t.b=Je.b,t}getStyle(t=ii){se.workingToColorSpace(Je.copy(this),t);let e=Je.r,i=Je.g,n=Je.b;return t!==ii?`color(${t} ${e.toFixed(3)} ${i.toFixed(3)} ${n.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(i*255)},${Math.round(n*255)})`}offsetHSL(t,e,i){return this.getHSL(dn),this.setHSL(dn.h+t,dn.s+e,dn.l+i)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,i){return this.r=t.r+(e.r-t.r)*i,this.g=t.g+(e.g-t.g)*i,this.b=t.b+(e.b-t.b)*i,this}lerpHSL(t,e){this.getHSL(dn),t.getHSL(Cr);let i=Ja(dn.h,Cr.h,e),n=Ja(dn.s,Cr.s,e),s=Ja(dn.l,Cr.l,e);return this.setHSL(i,n,s),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,i=this.g,n=this.b,s=t.elements;return this.r=s[0]*e+s[3]*i+s[6]*n,this.g=s[1]*e+s[4]*i+s[7]*n,this.b=s[2]*e+s[5]*i+s[8]*n,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Je=new ft;ft.NAMES=td;var Vs=class extends ze{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new pi,this.environmentIntensity=1,this.environmentRotation=new pi,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),e.object.backgroundBlurriness=this.backgroundBlurriness,e.object.backgroundIntensity=this.backgroundIntensity,e.object.backgroundRotation=this.backgroundRotation.toArray(),e.object.environmentIntensity=this.environmentIntensity,e.object.environmentRotation=this.environmentRotation.toArray(),e}},Ti=new k,Ki=new k,sl=new k,ji=new k,es=new k,is=new k,Qc=new k,rl=new k,ol=new k,al=new k,ll=new Pe,cl=new Pe,hl=new Pe,mn=class r{constructor(t=new k,e=new k,i=new k){this.a=t,this.b=e,this.c=i}static getNormal(t,e,i,n){n.subVectors(i,e),Ti.subVectors(t,e),n.cross(Ti);let s=n.lengthSq();return s>0?n.multiplyScalar(1/Math.sqrt(s)):n.set(0,0,0)}static getBarycoord(t,e,i,n,s){Ti.subVectors(n,e),Ki.subVectors(i,e),sl.subVectors(t,e);let o=Ti.dot(Ti),a=Ti.dot(Ki),c=Ti.dot(sl),l=Ki.dot(Ki),h=Ki.dot(sl),u=o*l-a*a;if(u===0)return s.set(0,0,0),null;let d=1/u,f=(l*c-a*h)*d,g=(o*h-a*c)*d;return s.set(1-f-g,g,f)}static containsPoint(t,e,i,n){return this.getBarycoord(t,e,i,n,ji)===null?!1:ji.x>=0&&ji.y>=0&&ji.x+ji.y<=1}static getInterpolation(t,e,i,n,s,o,a,c){return this.getBarycoord(t,e,i,n,ji)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(s,ji.x),c.addScaledVector(o,ji.y),c.addScaledVector(a,ji.z),c)}static getInterpolatedAttribute(t,e,i,n,s,o){return ll.setScalar(0),cl.setScalar(0),hl.setScalar(0),ll.fromBufferAttribute(t,e),cl.fromBufferAttribute(t,i),hl.fromBufferAttribute(t,n),o.setScalar(0),o.addScaledVector(ll,s.x),o.addScaledVector(cl,s.y),o.addScaledVector(hl,s.z),o}static isFrontFacing(t,e,i,n){return Ti.subVectors(i,e),Ki.subVectors(t,e),Ti.cross(Ki).dot(n)<0}set(t,e,i){return this.a.copy(t),this.b.copy(e),this.c.copy(i),this}setFromPointsAndIndices(t,e,i,n){return this.a.copy(t[e]),this.b.copy(t[i]),this.c.copy(t[n]),this}setFromAttributeAndIndices(t,e,i,n){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,i),this.c.fromBufferAttribute(t,n),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return Ti.subVectors(this.c,this.b),Ki.subVectors(this.a,this.b),Ti.cross(Ki).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return r.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return r.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,i,n,s){return r.getInterpolation(t,this.a,this.b,this.c,e,i,n,s)}containsPoint(t){return r.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return r.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let i=this.a,n=this.b,s=this.c,o,a;es.subVectors(n,i),is.subVectors(s,i),rl.subVectors(t,i);let c=es.dot(rl),l=is.dot(rl);if(c<=0&&l<=0)return e.copy(i);ol.subVectors(t,n);let h=es.dot(ol),u=is.dot(ol);if(h>=0&&u<=h)return e.copy(n);let d=c*u-h*l;if(d<=0&&c>=0&&h<=0)return o=c/(c-h),e.copy(i).addScaledVector(es,o);al.subVectors(t,s);let f=es.dot(al),g=is.dot(al);if(g>=0&&f<=g)return e.copy(s);let y=f*l-c*g;if(y<=0&&l>=0&&g<=0)return a=l/(l-g),e.copy(i).addScaledVector(is,a);let p=h*g-f*u;if(p<=0&&u-h>=0&&f-g>=0)return Qc.subVectors(s,n),a=(u-h)/(u-h+(f-g)),e.copy(n).addScaledVector(Qc,a);let m=1/(p+y+d);return o=y*m,a=d*m,e.copy(i).addScaledVector(es,o).addScaledVector(is,a)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},Gi=class{constructor(t=new k(1/0,1/0,1/0),e=new k(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e+=3)this.expandByPoint(Ai.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,i=t.count;e<i;e++)this.expandByPoint(Ai.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let i=Ai.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(i),this.max.copy(t).add(i),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let i=t.geometry;if(i!==void 0){let s=i.getAttribute("position");if(e===!0&&s!==void 0&&t.isInstancedMesh!==!0)for(let o=0,a=s.count;o<a;o++)t.isMesh===!0?t.getVertexPosition(o,Ai):Ai.fromBufferAttribute(s,o),Ai.applyMatrix4(t.matrixWorld),this.expandByPoint(Ai);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Rr.copy(t.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),Rr.copy(i.boundingBox)),Rr.applyMatrix4(t.matrixWorld),this.union(Rr)}let n=t.children;for(let s=0,o=n.length;s<o;s++)this.expandByObject(n[s],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,Ai),Ai.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,i;return t.normal.x>0?(e=t.normal.x*this.min.x,i=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,i=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,i+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,i+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,i+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,i+=t.normal.z*this.min.z),e<=-t.constant&&i>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Ls),Ir.subVectors(this.max,Ls),ns.subVectors(t.a,Ls),ss.subVectors(t.b,Ls),rs.subVectors(t.c,Ls),un.subVectors(ss,ns),fn.subVectors(rs,ss),Ln.subVectors(ns,rs);let e=[0,-un.z,un.y,0,-fn.z,fn.y,0,-Ln.z,Ln.y,un.z,0,-un.x,fn.z,0,-fn.x,Ln.z,0,-Ln.x,-un.y,un.x,0,-fn.y,fn.x,0,-Ln.y,Ln.x,0];return!dl(e,ns,ss,rs,Ir)||(e=[1,0,0,0,1,0,0,0,1],!dl(e,ns,ss,rs,Ir))?!1:(Pr.crossVectors(un,fn),e=[Pr.x,Pr.y,Pr.z],dl(e,ns,ss,rs,Ir))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,Ai).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(Ai).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(tn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),tn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),tn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),tn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),tn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),tn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),tn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),tn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(tn),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}},tn=[new k,new k,new k,new k,new k,new k,new k,new k],Ai=new k,Rr=new Gi,ns=new k,ss=new k,rs=new k,un=new k,fn=new k,Ln=new k,Ls=new k,Ir=new k,Pr=new k,Dn=new k;function dl(r,t,e,i,n){for(let s=0,o=r.length-3;s<=o;s+=3){Dn.fromArray(r,s);let a=n.x*Math.abs(Dn.x)+n.y*Math.abs(Dn.y)+n.z*Math.abs(Dn.z),c=t.dot(Dn),l=e.dot(Dn),h=i.dot(Dn);if(Math.max(-Math.max(c,l,h),Math.min(c,l,h))>a)return!1}return!0}var Be=new k,Lr=new Zt,uu=0,he=class extends Hi{constructor(t,e,i=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:uu++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=i,this.usage=Zh,this.updateRanges=[],this.gpuType=Si,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,i){t*=this.itemSize,i*=e.itemSize;for(let n=0,s=this.itemSize;n<s;n++)this.array[t+n]=e.array[i+n];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,i=this.count;e<i;e++)Lr.fromBufferAttribute(this,e),Lr.applyMatrix3(t),this.setXY(e,Lr.x,Lr.y);else if(this.itemSize===3)for(let e=0,i=this.count;e<i;e++)Be.fromBufferAttribute(this,e),Be.applyMatrix3(t),this.setXYZ(e,Be.x,Be.y,Be.z);return this}applyMatrix4(t){for(let e=0,i=this.count;e<i;e++)Be.fromBufferAttribute(this,e),Be.applyMatrix4(t),this.setXYZ(e,Be.x,Be.y,Be.z);return this}applyNormalMatrix(t){for(let e=0,i=this.count;e<i;e++)Be.fromBufferAttribute(this,e),Be.applyNormalMatrix(t),this.setXYZ(e,Be.x,Be.y,Be.z);return this}transformDirection(t){for(let e=0,i=this.count;e<i;e++)Be.fromBufferAttribute(this,e),Be.transformDirection(t),this.setXYZ(e,Be.x,Be.y,Be.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let i=this.array[t*this.itemSize+e];return this.normalized&&(i=Is(i,this.array)),i}setComponent(t,e,i){return this.normalized&&(i=oi(i,this.array)),this.array[t*this.itemSize+e]=i,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=Is(e,this.array)),e}setX(t,e){return this.normalized&&(e=oi(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=Is(e,this.array)),e}setY(t,e){return this.normalized&&(e=oi(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=Is(e,this.array)),e}setZ(t,e){return this.normalized&&(e=oi(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=Is(e,this.array)),e}setW(t,e){return this.normalized&&(e=oi(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,i){return t*=this.itemSize,this.normalized&&(e=oi(e,this.array),i=oi(i,this.array)),this.array[t+0]=e,this.array[t+1]=i,this}setXYZ(t,e,i,n){return t*=this.itemSize,this.normalized&&(e=oi(e,this.array),i=oi(i,this.array),n=oi(n,this.array)),this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=n,this}setXYZW(t,e,i,n,s){return t*=this.itemSize,this.normalized&&(e=oi(e,this.array),i=oi(i,this.array),n=oi(n,this.array),s=oi(s,this.array)),this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=n,this.array[t+3]=s,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return t.name=this.name,t.usage=this.usage,t.gpuType=this.gpuType,t}dispose(){this.dispatchEvent({type:"dispose"})}};var Ws=class extends he{constructor(t,e,i){super(new Uint16Array(t),e,i)}};var Xs=class extends he{constructor(t,e,i){super(new Uint32Array(t),e,i)}};var ee=class extends he{constructor(t,e,i){super(new Float32Array(t),e,i)}},fu=new Gi,Ds=new k,ul=new k,Vi=class{constructor(t=new k,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let i=this.center;e!==void 0?i.copy(e):fu.setFromPoints(t).getCenter(i);let n=0;for(let s=0,o=t.length;s<o;s++)n=Math.max(n,i.distanceToSquared(t[s]));return this.radius=Math.sqrt(n),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let i=this.center.distanceToSquared(t);return e.copy(t),i>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Ds.subVectors(t,this.center);let e=Ds.lengthSq();if(e>this.radius*this.radius){let i=Math.sqrt(e),n=(i-this.radius)*.5;this.center.addScaledVector(Ds,n/i),this.radius+=n}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(ul.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Ds.copy(t.center).add(ul)),this.expandByPoint(Ds.copy(t.center).sub(ul))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}},pu=0,_i=new ue,fl=new ze,os=new k,ui=new Gi,Ns=new Gi,Ve=new k,xe=class r extends Hi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:pu++}),this.uuid=gr(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(jd(t)?Xs:Ws)(t,1):this.index=t,this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,i=0){this.groups.push({start:t,count:e,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let s=new Yt().getNormalMatrix(t);i.applyNormalMatrix(s),i.needsUpdate=!0}let n=this.attributes.tangent;return n!==void 0&&(n.transformDirection(t),n.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return _i.makeRotationFromQuaternion(t),this.applyMatrix4(_i),this}rotateX(t){return _i.makeRotationX(t),this.applyMatrix4(_i),this}rotateY(t){return _i.makeRotationY(t),this.applyMatrix4(_i),this}rotateZ(t){return _i.makeRotationZ(t),this.applyMatrix4(_i),this}translate(t,e,i){return _i.makeTranslation(t,e,i),this.applyMatrix4(_i),this}scale(t,e,i){return _i.makeScale(t,e,i),this.applyMatrix4(_i),this}lookAt(t){return fl.lookAt(t),fl.updateMatrix(),this.applyMatrix4(fl.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(os).negate(),this.translate(os.x,os.y,os.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let i=[];for(let n=0,s=t.length;n<s;n++){let o=t[n];i.push(o.x,o.y,o.z||0)}this.setAttribute("position",new ee(i,3))}else{let i=Math.min(t.length,e.count);for(let n=0;n<i;n++){let s=t[n];e.setXYZ(n,s.x,s.y,s.z||0)}t.length>e.count&&Gt("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Gi);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Wt("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new k(-1/0,-1/0,-1/0),new k(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let i=0,n=e.length;i<n;i++){let s=e[i];ui.setFromBufferAttribute(s),this.morphTargetsRelative?(Ve.addVectors(this.boundingBox.min,ui.min),this.boundingBox.expandByPoint(Ve),Ve.addVectors(this.boundingBox.max,ui.max),this.boundingBox.expandByPoint(Ve)):(this.boundingBox.expandByPoint(ui.min),this.boundingBox.expandByPoint(ui.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Wt('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Vi);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Wt("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new k,1/0);return}if(t){let i=this.boundingSphere.center;if(ui.setFromBufferAttribute(t),e)for(let s=0,o=e.length;s<o;s++){let a=e[s];Ns.setFromBufferAttribute(a),this.morphTargetsRelative?(Ve.addVectors(ui.min,Ns.min),ui.expandByPoint(Ve),Ve.addVectors(ui.max,Ns.max),ui.expandByPoint(Ve)):(ui.expandByPoint(Ns.min),ui.expandByPoint(Ns.max))}ui.getCenter(i);let n=0;for(let s=0,o=t.count;s<o;s++)Ve.fromBufferAttribute(t,s),n=Math.max(n,i.distanceToSquared(Ve));if(e)for(let s=0,o=e.length;s<o;s++){let a=e[s],c=this.morphTargetsRelative;for(let l=0,h=a.count;l<h;l++)Ve.fromBufferAttribute(a,l),c&&(os.fromBufferAttribute(t,l),Ve.add(os)),n=Math.max(n,i.distanceToSquared(Ve))}this.boundingSphere.radius=Math.sqrt(n),isNaN(this.boundingSphere.radius)&&Wt('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){Wt("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=e.position,n=e.normal,s=e.uv,o=this.getAttribute("tangent");(o===void 0||o.count!==i.count)&&(o=new he(new Float32Array(4*i.count),4),this.setAttribute("tangent",o));let a=[],c=[];for(let x=0;x<i.count;x++)a[x]=new k,c[x]=new k;let l=new k,h=new k,u=new k,d=new Zt,f=new Zt,g=new Zt,y=new k,p=new k;function m(x,E,C){l.fromBufferAttribute(i,x),h.fromBufferAttribute(i,E),u.fromBufferAttribute(i,C),d.fromBufferAttribute(s,x),f.fromBufferAttribute(s,E),g.fromBufferAttribute(s,C),h.sub(l),u.sub(l),f.sub(d),g.sub(d);let R=1/(f.x*g.y-g.x*f.y);isFinite(R)&&(y.copy(h).multiplyScalar(g.y).addScaledVector(u,-f.y).multiplyScalar(R),p.copy(u).multiplyScalar(f.x).addScaledVector(h,-g.x).multiplyScalar(R),a[x].add(y),a[E].add(y),a[C].add(y),c[x].add(p),c[E].add(p),c[C].add(p))}let _=this.groups;_.length===0&&(_=[{start:0,count:t.count}]);for(let x=0,E=_.length;x<E;++x){let C=_[x],R=C.start,L=C.count;for(let D=R,I=R+L;D<I;D+=3)m(t.getX(D+0),t.getX(D+1),t.getX(D+2))}let M=new k,v=new k,w=new k,S=new k;function T(x){w.fromBufferAttribute(n,x),S.copy(w);let E=a[x];M.copy(E),M.sub(w.multiplyScalar(w.dot(E))).normalize(),v.crossVectors(S,E);let R=v.dot(c[x])<0?-1:1;o.setXYZW(x,M.x,M.y,M.z,R)}for(let x=0,E=_.length;x<E;++x){let C=_[x],R=C.start,L=C.count;for(let D=R,I=R+L;D<I;D+=3)T(t.getX(D+0)),T(t.getX(D+1)),T(t.getX(D+2))}this._transformed=!0}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==e.count)i=new he(new Float32Array(e.count*3),3),this.setAttribute("normal",i);else for(let d=0,f=i.count;d<f;d++)i.setXYZ(d,0,0,0);let n=new k,s=new k,o=new k,a=new k,c=new k,l=new k,h=new k,u=new k;if(t)for(let d=0,f=t.count;d<f;d+=3){let g=t.getX(d+0),y=t.getX(d+1),p=t.getX(d+2);n.fromBufferAttribute(e,g),s.fromBufferAttribute(e,y),o.fromBufferAttribute(e,p),h.subVectors(o,s),u.subVectors(n,s),h.cross(u),a.fromBufferAttribute(i,g),c.fromBufferAttribute(i,y),l.fromBufferAttribute(i,p),a.add(h),c.add(h),l.add(h),i.setXYZ(g,a.x,a.y,a.z),i.setXYZ(y,c.x,c.y,c.z),i.setXYZ(p,l.x,l.y,l.z)}else for(let d=0,f=e.count;d<f;d+=3)n.fromBufferAttribute(e,d+0),s.fromBufferAttribute(e,d+1),o.fromBufferAttribute(e,d+2),h.subVectors(o,s),u.subVectors(n,s),h.cross(u),i.setXYZ(d+0,h.x,h.y,h.z),i.setXYZ(d+1,h.x,h.y,h.z),i.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,i=t.count;e<i;e++)Ve.fromBufferAttribute(t,e),Ve.normalize(),t.setXYZ(e,Ve.x,Ve.y,Ve.z)}toNonIndexed(){function t(a,c){let l=a.array,h=a.itemSize,u=a.normalized,d=new l.constructor(c.length*h),f=0,g=0;for(let y=0,p=c.length;y<p;y++){a.isInterleavedBufferAttribute?f=c[y]*a.data.stride+a.offset:f=c[y]*h;for(let m=0;m<h;m++)d[g++]=l[f++]}return new he(d,h,u)}if(this.index===null)return Gt("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new r,i=this.index.array,n=this.attributes;for(let a in n){let c=n[a],l=t(c,i);e.setAttribute(a,l)}let s=this.morphAttributes;for(let a in s){let c=[],l=s[a];for(let h=0,u=l.length;h<u;h++){let d=l[h],f=t(d,i);c.push(f)}e.morphAttributes[a]=c}e.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,c=o.length;a<c;a++){let l=o[a];e.addGroup(l.start,l.count,l.materialIndex)}return e}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let c=this.parameters;for(let l in c)c[l]!==void 0&&(t[l]=c[l]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let i=this.attributes;for(let c in i){let l=i[c];t.data.attributes[c]=l.toJSON(t.data)}let n={},s=!1;for(let c in this.morphAttributes){let l=this.morphAttributes[c],h=[];for(let u=0,d=l.length;u<d;u++){let f=l[u];h.push(f.toJSON(t.data))}h.length>0&&(n[c]=h,s=!0)}s&&(t.data.morphAttributes=n,t.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(t.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(t.data.boundingSphere=a.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let i=t.index;i!==null&&this.setIndex(i.clone());let n=t.attributes;for(let l in n){let h=n[l];this.setAttribute(l,h.clone(e))}let s=t.morphAttributes;for(let l in s){let h=[],u=s[l];for(let d=0,f=u.length;d<f;d++)h.push(u[d].clone(e));this.morphAttributes[l]=h}this.morphTargetsRelative=t.morphTargetsRelative;let o=t.groups;for(let l=0,h=o.length;l<h;l++){let u=o[l];this.addGroup(u.start,u.count,u.materialIndex)}let a=t.boundingBox;a!==null&&(this.boundingBox=a.clone());let c=t.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var pl=new k,mu=new k,gu=new Yt,Ci=class{constructor(t=new k(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,i,n){return this.normal.set(t,e,i),this.constant=n,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,i){let n=pl.subVectors(i,e).cross(mu.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(n,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e,i=!0){let n=t.delta(pl),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let o=-(t.start.dot(this.normal)+this.constant)/s;return i===!0&&(o<0||o>1)?null:e.copy(t.start).addScaledVector(n,o)}intersectsLine(t){let e=this.distanceToPoint(t.start),i=this.distanceToPoint(t.end);return e<0&&i>0||i<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let i=e||gu.getNormalMatrix(t),n=this.coplanarPoint(pl).applyMatrix4(t),s=this.normal.applyMatrix3(i).normalize();return this.constant=-n.dot(s),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(t){return this.normal.fromArray(t.normal),this.constant=t.constant,this}},xu=0,Mi=class extends Hi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:xu++}),this.uuid=gr(),this.name="",this.type="Material",this.blending=wn,this.side=Xi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Dl,this.blendDst=Nl,this.blendEquation=Gn,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new ft(0,0,0),this.blendAlpha=0,this.depthFunc=us,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Gh,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Jr,this.stencilZFail=Jr,this.stencilZPass=Jr,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let i=t[e];if(i===void 0){Gt(`Material: parameter '${e}' has value of undefined.`);continue}let n=this[e];if(n===void 0){Gt(`Material: '${e}' is not a property of THREE.${this.type}.`);continue}n&&n.isColor?n.set(i):n&&n.isVector2&&i&&i.isVector2||n&&n.isEuler&&i&&i.isEuler||n&&n.isVector3&&i&&i.isVector3?n.copy(i):this[e]=i}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,i.blending=this.blending,i.side=this.side,i.shadowSide=this.shadowSide,i.vertexColors=this.vertexColors,i.opacity=this.opacity,i.transparent=this.transparent,i.blendSrc=this.blendSrc,i.blendDst=this.blendDst,i.blendEquation=this.blendEquation,i.blendSrcAlpha=this.blendSrcAlpha,i.blendDstAlpha=this.blendDstAlpha,i.blendEquationAlpha=this.blendEquationAlpha,i.blendColor=this.blendColor.getHex(),i.blendAlpha=this.blendAlpha,i.depthFunc=this.depthFunc,i.depthTest=this.depthTest,i.depthWrite=this.depthWrite,i.colorWrite=this.colorWrite,i.clipIntersection=this.clipIntersection,i.clipShadows=this.clipShadows,i.stencilWriteMask=this.stencilWriteMask,i.stencilFunc=this.stencilFunc,i.stencilRef=this.stencilRef,i.stencilFuncMask=this.stencilFuncMask,i.stencilFail=this.stencilFail,i.stencilZFail=this.stencilZFail,i.stencilZPass=this.stencilZPass,i.stencilWrite=this.stencilWrite,i.polygonOffset=this.polygonOffset,i.polygonOffsetFactor=this.polygonOffsetFactor,i.polygonOffsetUnits=this.polygonOffsetUnits,i.dithering=this.dithering,i.alphaTest=this.alphaTest,i.alphaHash=this.alphaHash,i.alphaToCoverage=this.alphaToCoverage,i.premultipliedAlpha=this.premultipliedAlpha,i.forceSinglePass=this.forceSinglePass,i.allowOverride=this.allowOverride,i.visible=this.visible,i.toneMapped=this.toneMapped,i.name=this.name,this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(i.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(t).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(t).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(t).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(t).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(t).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(i.clippingPlanes=this.clippingPlanes.map(s=>s.toJSON())),this.rotation!==void 0&&(i.rotation=this.rotation),this.depthPacking!==void 0&&(i.depthPacking=this.depthPacking),this.linewidth!==void 0&&(i.linewidth=this.linewidth),this.linecap!==void 0&&(i.linecap=this.linecap),this.linejoin!==void 0&&(i.linejoin=this.linejoin),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.wireframe!==void 0&&(i.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(i.flatShading=this.flatShading),this.fog!==void 0&&(i.fog=this.fog),Object.keys(this.userData).length>0&&(i.userData=this.userData);function n(s){let o=[];for(let a in s){let c=s[a];delete c.metadata,o.push(c)}return o}if(e){let s=n(t.textures),o=n(t.images);s.length>0&&(i.textures=s),o.length>0&&(i.images=o)}return i}fromJSON(t,e){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new ft().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.retroreflectivity!==void 0&&(this.retroreflectivity=t.retroreflectivity),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=t.iridescenceThicknessRange),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.clippingPlanes!==void 0&&(this.clippingPlanes=t.clippingPlanes.map(i=>new Ci().fromJSON(i))),t.clipIntersection!==void 0&&(this.clipIntersection=t.clipIntersection),t.clipShadows!==void 0&&(this.clipShadows=t.clipShadows),t.depthPacking!==void 0&&(this.depthPacking=t.depthPacking),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.linecap!==void 0&&(this.linecap=t.linecap),t.linejoin!==void 0&&(this.linejoin=t.linejoin),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=e[t.map]||null),t.matcap!==void 0&&(this.matcap=e[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=e[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=e[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=e[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let i=t.normalScale;Array.isArray(i)===!1&&(i=[i,i]),this.normalScale=new Zt().fromArray(i)}return t.displacementMap!==void 0&&(this.displacementMap=e[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=e[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=e[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=e[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=e[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=e[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=e[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=e[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=e[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=e[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=e[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=e[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=e[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=e[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Zt().fromArray(t.clearcoatNormalScale)),t.iridescenceMap!==void 0&&(this.iridescenceMap=e[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=e[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=e[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=e[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=e[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=e[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=e[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,i=null;if(e!==null){let n=e.length;i=new Array(n);for(let s=0;s!==n;++s)i[s]=e[s].clone()}return this.clippingPlanes=i,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}};var en=new k,ml=new k,Dr=new k,Nr=new k,zn=class{constructor(t=new k,e=new k(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,en)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let i=e.dot(this.direction);return i<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=en.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(en.copy(this.origin).addScaledVector(this.direction,e),en.distanceToSquared(t))}distanceSqToSegment(t,e,i,n){ml.copy(t).add(e).multiplyScalar(.5),Dr.copy(e).sub(t).normalize(),Nr.copy(this.origin).sub(ml);let s=t.distanceTo(e)*.5,o=-this.direction.dot(Dr),a=Nr.dot(this.direction),c=-Nr.dot(Dr),l=Nr.lengthSq(),h=Math.abs(1-o*o),u,d,f,g;if(h>0)if(u=o*c-a,d=o*a-c,g=s*h,u>=0)if(d>=-g)if(d<=g){let y=1/h;u*=y,d*=y,f=u*(u+o*d+2*a)+d*(o*u+d+2*c)+l}else d=s,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*c)+l;else d=-s,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*c)+l;else d<=-g?(u=Math.max(0,-(-o*s+a)),d=u>0?-s:Math.min(Math.max(-s,-c),s),f=-u*u+d*(d+2*c)+l):d<=g?(u=0,d=Math.min(Math.max(-s,-c),s),f=d*(d+2*c)+l):(u=Math.max(0,-(o*s+a)),d=u>0?s:Math.min(Math.max(-s,-c),s),f=-u*u+d*(d+2*c)+l);else d=o>0?-s:s,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*c)+l;return i&&i.copy(this.origin).addScaledVector(this.direction,u),n&&n.copy(ml).addScaledVector(Dr,d),f}intersectSphere(t,e){if(t.radius<0)return null;en.subVectors(t.center,this.origin);let i=en.dot(this.direction),n=en.dot(en)-i*i,s=t.radius*t.radius;if(n>s)return null;let o=Math.sqrt(s-n),a=i-o,c=i+o;return c<0?null:a<0?this.at(c,e):this.at(a,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(t.normal)+t.constant)/e;return i>=0?i:null}intersectPlane(t,e){let i=this.distanceToPlane(t);return i===null?null:this.at(i,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let i,n,s,o,a,c,l=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return l>=0?(i=(t.min.x-d.x)*l,n=(t.max.x-d.x)*l):(i=(t.max.x-d.x)*l,n=(t.min.x-d.x)*l),h>=0?(s=(t.min.y-d.y)*h,o=(t.max.y-d.y)*h):(s=(t.max.y-d.y)*h,o=(t.min.y-d.y)*h),i>o||s>n||((s>i||isNaN(i))&&(i=s),(o<n||isNaN(n))&&(n=o),u>=0?(a=(t.min.z-d.z)*u,c=(t.max.z-d.z)*u):(a=(t.max.z-d.z)*u,c=(t.min.z-d.z)*u),i>c||a>n)||((a>i||i!==i)&&(i=a),(c<n||n!==n)&&(n=c),n<0)?null:this.at(i>=0?i:n,e)}intersectsBox(t){return this.intersectBox(t,en)!==null}intersectTriangle(t,e,i,n,s){let o=this.origin,a=this.direction,c=a.x,l=a.y,h=a.z,u=t.x-o.x,d=t.y-o.y,f=t.z-o.z,g=e.x-o.x,y=e.y-o.y,p=e.z-o.z,m=i.x-o.x,_=i.y-o.y,M=i.z-o.z,v=Math.abs(c),w=Math.abs(l),S=Math.abs(h),T,x,E,C,R,L,D,I,F,z,G,K;if(v>=w&&v>=S?(E=c,L=u,F=g,K=m,c>=0?(T=l,x=h,C=d,R=f,D=y,I=p,z=_,G=M):(T=h,x=l,C=f,R=d,D=p,I=y,z=M,G=_)):w>=S?(E=l,L=d,F=y,K=_,l>=0?(T=h,x=c,C=f,R=u,D=p,I=g,z=M,G=m):(T=c,x=h,C=u,R=f,D=g,I=p,z=m,G=M)):(E=h,L=f,F=p,K=M,h>=0?(T=c,x=l,C=u,R=d,D=g,I=y,z=m,G=_):(T=l,x=c,C=d,R=u,D=y,I=g,z=_,G=m)),E===0)return null;let N=T/E,$=x/E,Q=1/E,ot=C-N*L,st=R-$*L,It=D-N*F,ut=I-$*F,Pt=z-N*K,q=G-$*K,Y=Pt*ut-q*It,ct=ot*q-st*Pt,vt=It*st-ut*ot;if(n){if(Y<0||ct<0||vt<0)return null}else if((Y<0||ct<0||vt<0)&&(Y>0||ct>0||vt>0))return null;let lt=Y+ct+vt;if(lt===0)return null;let kt=Q*(Y*L+ct*F+vt*K);return(lt>0?kt<0:kt>0)?null:this.at(kt/lt,s)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},be=class extends Mi{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new ft(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new pi,this.combine=ar,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}},Jc=new ue,Nn=new zn,Ur=new Vi,Kc=new k,Fr=new k,Br=new k,zr=new k,gl=new k,Or=new k,jc=new k,kr=new k,wt=class extends ze{constructor(t=new xe,e=new be){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){let n=e[i[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=n.length;s<o;s++){let a=n[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}getVertexPosition(t,e){let i=this.geometry,n=i.attributes.position,s=i.morphAttributes.position,o=i.morphTargetsRelative;e.fromBufferAttribute(n,t);let a=this.morphTargetInfluences;if(s&&a){Or.set(0,0,0);for(let c=0,l=s.length;c<l;c++){let h=a[c],u=s[c];h!==0&&(gl.fromBufferAttribute(u,t),o?Or.addScaledVector(gl,h):Or.addScaledVector(gl.sub(e),h))}e.add(Or)}return e}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let i=this.geometry,n=this.material,s=this.matrixWorld;n!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Ur.copy(i.boundingSphere),Ur.applyMatrix4(s),Nn.copy(t.ray).recast(t.near),!(Ur.containsPoint(Nn.origin)===!1&&(Nn.intersectSphere(Ur,Kc)===null||Nn.origin.distanceToSquared(Kc)>(t.far-t.near)**2))&&(Jc.copy(s).invert(),Nn.copy(t.ray).applyMatrix4(Jc),!(i.boundingBox!==null&&Nn.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(t,e,Nn)))}_computeIntersections(t,e,i){let n,s=this.geometry,o=this.material,a=s.index,c=s.attributes.position,l=s.attributes.uv,h=s.attributes.uv1,u=s.attributes.normal,d=s.groups,f=s.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,y=d.length;g<y;g++){let p=d[g],m=o[p.materialIndex],_=Math.max(p.start,f.start),M=Math.min(a.count,Math.min(p.start+p.count,f.start+f.count));for(let v=_,w=M;v<w;v+=3){let S=a.getX(v),T=a.getX(v+1),x=a.getX(v+2);n=Hr(this,m,t,i,l,h,u,S,T,x),n&&(n.faceIndex=Math.floor(v/3),n.face.materialIndex=p.materialIndex,e.push(n))}}else{let g=Math.max(0,f.start),y=Math.min(a.count,f.start+f.count);for(let p=g,m=y;p<m;p+=3){let _=a.getX(p),M=a.getX(p+1),v=a.getX(p+2);n=Hr(this,o,t,i,l,h,u,_,M,v),n&&(n.faceIndex=Math.floor(p/3),e.push(n))}}else if(c!==void 0)if(Array.isArray(o))for(let g=0,y=d.length;g<y;g++){let p=d[g],m=o[p.materialIndex],_=Math.max(p.start,f.start),M=Math.min(c.count,Math.min(p.start+p.count,f.start+f.count));for(let v=_,w=M;v<w;v+=3){let S=v,T=v+1,x=v+2;n=Hr(this,m,t,i,l,h,u,S,T,x),n&&(n.faceIndex=Math.floor(v/3),n.face.materialIndex=p.materialIndex,e.push(n))}}else{let g=Math.max(0,f.start),y=Math.min(c.count,f.start+f.count);for(let p=g,m=y;p<m;p+=3){let _=p,M=p+1,v=p+2;n=Hr(this,o,t,i,l,h,u,_,M,v),n&&(n.faceIndex=Math.floor(p/3),e.push(n))}}}};function yu(r,t,e,i,n,s,o,a){let c;if(t.side===si?c=i.intersectTriangle(o,s,n,!0,a):c=i.intersectTriangle(n,s,o,t.side===Xi,a),c===null)return null;kr.copy(a),kr.applyMatrix4(r.matrixWorld);let l=e.ray.origin.distanceTo(kr);return l<e.near||l>e.far?null:{distance:l,point:kr.clone(),object:r}}function Hr(r,t,e,i,n,s,o,a,c,l){r.getVertexPosition(a,Fr),r.getVertexPosition(c,Br),r.getVertexPosition(l,zr);let h=yu(r,t,e,i,Fr,Br,zr,jc);if(h){let u=new k;mn.getBarycoord(jc,Fr,Br,zr,u),n&&(h.uv=mn.getInterpolatedAttribute(n,a,c,l,u,new Zt)),s&&(h.uv1=mn.getInterpolatedAttribute(s,a,c,l,u,new Zt)),o&&(h.normal=mn.getInterpolatedAttribute(o,a,c,l,u,new k),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));let d={a,b:c,c:l,normal:new k,materialIndex:0};mn.getNormal(Fr,Br,zr,d.normal),h.face=d,h.barycoord=u}return h}var gn=class extends ni{constructor(t=null,e=1,i=1,n,s,o,a,c,l=We,h=We,u,d){super(null,o,a,c,l,h,n,s,u,d),this.isDataTexture=!0,this.image={data:t,width:e,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Wi=class extends he{constructor(t,e,i,n=1){super(t,e,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=n}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){let t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}},as=new ue,th=new ue,Gr=[],eh=new Gi,vu=new ue,Us=new wt,Fs=new Vi,fe=class extends wt{constructor(t,e,i){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new Wi(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let n=0;n<i;n++)this.setMatrixAt(n,vu)}computeBoundingBox(){let t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new Gi),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<e;i++)this.getMatrixAt(i,as),eh.copy(t.boundingBox).applyMatrix4(as),this.boundingBox.union(eh)}computeBoundingSphere(){let t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new Vi),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<e;i++)this.getMatrixAt(i,as),Fs.copy(t.boundingSphere).applyMatrix4(as),this.boundingSphere.union(Fs)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){return this.instanceColor===null?e.setRGB(1,1,1):e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){return e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){let i=e.morphTargetInfluences,n=this.morphTexture.source.data.data,s=i.length+1,o=t*s+1;for(let a=0;a<i.length;a++)i[a]=n[o+a]}raycast(t,e){let i=this.matrixWorld,n=this.count;if(Us.geometry=this.geometry,Us.material=this.material,Us.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Fs.copy(this.boundingSphere),Fs.applyMatrix4(i),t.ray.intersectsSphere(Fs)!==!1))for(let s=0;s<n;s++){this.getMatrixAt(s,as),th.multiplyMatrices(i,as),Us.matrixWorld=th,Us.raycast(t,Gr);for(let o=0,a=Gr.length;o<a;o++){let c=Gr[o];c.instanceId=s,c.object=this,e.push(c)}Gr.length=0}}setColorAt(t,e){return this.instanceColor===null&&(this.instanceColor=new Wi(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3),this}setMatrixAt(t,e){return e.toArray(this.instanceMatrix.array,t*16),this}setMorphAt(t,e){let i=e.morphTargetInfluences,n=i.length+1;this.morphTexture===null&&(this.morphTexture=new gn(new Float32Array(n*this.count),n,this.count,ko,Si));let s=this.morphTexture.source.data.data,o=0;for(let l=0;l<i.length;l++)o+=i[l];let a=this.geometry.morphTargetsRelative?1:1-o,c=n*t;return s[c]=a,s.set(i,c+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Un=new Vi,_u=new Zt(.5,.5),Vr=new k,ys=class{constructor(t=new Ci,e=new Ci,i=new Ci,n=new Ci,s=new Ci,o=new Ci){this.planes=[t,e,i,n,s,o]}set(t,e,i,n,s,o){let a=this.planes;return a[0].copy(t),a[1].copy(e),a[2].copy(i),a[3].copy(n),a[4].copy(s),a[5].copy(o),this}copy(t){let e=this.planes;for(let i=0;i<6;i++)e[i].copy(t.planes[i]);return this}setFromProjectionMatrix(t,e=Ri,i=!1){let n=this.planes,s=t.elements,o=s[0],a=s[1],c=s[2],l=s[3],h=s[4],u=s[5],d=s[6],f=s[7],g=s[8],y=s[9],p=s[10],m=s[11],_=s[12],M=s[13],v=s[14],w=s[15];if(n[0].setComponents(l-o,f-h,m-g,w-_).normalize(),n[1].setComponents(l+o,f+h,m+g,w+_).normalize(),n[2].setComponents(l+a,f+u,m+y,w+M).normalize(),n[3].setComponents(l-a,f-u,m-y,w-M).normalize(),i)n[4].setComponents(c,d,p,v).normalize(),n[5].setComponents(l-c,f-d,m-p,w-v).normalize();else if(n[4].setComponents(l-c,f-d,m-p,w-v).normalize(),e===Ri)n[5].setComponents(l+c,f+d,m+p,w+v).normalize();else if(e===fs)n[5].setComponents(c,d,p,v).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),Un.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),Un.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(Un)}intersectsSprite(t){Un.center.set(0,0,0);let e=_u.distanceTo(t.center);return Un.radius=.7071067811865476+e,Un.applyMatrix4(t.matrixWorld),this.intersectsSphere(Un)}intersectsSphere(t){let e=this.planes,i=t.center,n=-t.radius;for(let s=0;s<6;s++)if(e[s].distanceToPoint(i)<n)return!1;return!0}intersectsBox(t){let e=this.planes;for(let i=0;i<6;i++){let n=e[i];if(Vr.x=n.normal.x>0?t.max.x:t.min.x,Vr.y=n.normal.y>0?t.max.y:t.min.y,Vr.z=n.normal.z>0?t.max.z:t.min.z,n.distanceToPoint(Vr)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let i=0;i<6;i++)if(e[i].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var xn=class extends Mi{constructor(t){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new ft(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}},uo=new k,fo=new k,ih=new ue,Bs=new zn,Wr=new Vi,xl=new k,nh=new k,po=class extends ze{constructor(t=new xe,e=new xn){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){let t=this.geometry;if(t.index===null){let e=t.attributes.position,i=[0];for(let n=1,s=e.count;n<s;n++)uo.fromBufferAttribute(e,n-1),fo.fromBufferAttribute(e,n),i[n]=i[n-1],i[n]+=uo.distanceTo(fo);t.setAttribute("lineDistance",new ee(i,1))}else Gt("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let i=this.geometry,n=this.matrixWorld,s=t.params.Line.threshold,o=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Wr.copy(i.boundingSphere),Wr.applyMatrix4(n),Wr.radius+=s,t.ray.intersectsSphere(Wr)===!1)return;ih.copy(n).invert(),Bs.copy(t.ray).applyMatrix4(ih);let a=s/((this.scale.x+this.scale.y+this.scale.z)/3),c=a*a,l=this.isLineSegments?2:1,h=i.index,d=i.attributes.position;if(h!==null){let f=Math.max(0,o.start),g=Math.min(h.count,o.start+o.count);for(let y=f,p=g-1;y<p;y+=l){let m=h.getX(y),_=h.getX(y+1),M=Xr(this,t,Bs,c,m,_,y);M&&e.push(M)}if(this.isLineLoop){let y=h.getX(g-1),p=h.getX(f),m=Xr(this,t,Bs,c,y,p,g-1);m&&e.push(m)}}else{let f=Math.max(0,o.start),g=Math.min(d.count,o.start+o.count);for(let y=f,p=g-1;y<p;y+=l){let m=Xr(this,t,Bs,c,y,y+1,y);m&&e.push(m)}if(this.isLineLoop){let y=Xr(this,t,Bs,c,g-1,f,g-1);y&&e.push(y)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){let n=e[i[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=n.length;s<o;s++){let a=n[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}};function Xr(r,t,e,i,n,s,o){let a=r.geometry.attributes.position;if(uo.fromBufferAttribute(a,n),fo.fromBufferAttribute(a,s),e.distanceSqToSegment(uo,fo,xl,nh)>i)return;xl.applyMatrix4(r.matrixWorld);let l=t.ray.origin.distanceTo(xl);if(!(l<t.near||l>t.far))return{distance:l,point:nh.clone().applyMatrix4(r.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:r}}var sh=new k,rh=new k,On=class extends po{constructor(t,e){super(t,e),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let t=this.geometry;if(t.index===null){let e=t.attributes.position,i=[];for(let n=0,s=e.count;n<s;n+=2)sh.fromBufferAttribute(e,n),rh.fromBufferAttribute(e,n+1),i[n]=n===0?0:i[n-1],i[n+1]=i[n]+sh.distanceTo(rh);t.setAttribute("lineDistance",new ee(i,1))}else Gt("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}};var mo=class extends Mi{constructor(t){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new ft(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}},oh=new ue,wl=new zn,qr=new Vi,Yr=new k,qs=class extends ze{constructor(t=new xe,e=new mo){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let i=this.geometry,n=this.matrixWorld,s=t.params.Points.threshold,o=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),qr.copy(i.boundingSphere),qr.applyMatrix4(n),qr.radius+=s,t.ray.intersectsSphere(qr)===!1)return;oh.copy(n).invert(),wl.copy(t.ray).applyMatrix4(oh);let a=s/((this.scale.x+this.scale.y+this.scale.z)/3),c=a*a,l=i.index,u=i.attributes.position;if(l!==null){let d=Math.max(0,o.start),f=Math.min(l.count,o.start+o.count);for(let g=d,y=f;g<y;g++){let p=l.getX(g);Yr.fromBufferAttribute(u,p),ah(Yr,p,c,n,t,e,this)}}else{let d=Math.max(0,o.start),f=Math.min(u.count,o.start+o.count);for(let g=d,y=f;g<y;g++)Yr.fromBufferAttribute(u,g),ah(Yr,g,c,n,t,e,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){let n=e[i[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=n.length;s<o;s++){let a=n[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}};function ah(r,t,e,i,n,s,o){let a=wl.distanceSqToPoint(r);if(a<e){let c=new k;wl.closestPointToPoint(r,c),c.applyMatrix4(i);let l=n.ray.origin.distanceTo(c);if(l<n.near||l>n.far)return;s.push({distance:l,distanceToRay:Math.sqrt(a),point:c,index:t,face:null,faceIndex:null,barycoord:null,object:o})}}var Ys=class extends ni{constructor(t=[],e=En,i,n,s,o,a,c,l,h){super(t,e,i,n,s,o,a,c,l,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},mi=class extends ni{constructor(t,e,i,n,s,o,a,c,l){super(t,e,i,n,s,o,a,c,l),this.isCanvasTexture=!0,this.needsUpdate=!0}};var yn=class extends ni{constructor(t,e,i=Pi,n,s,o,a=We,c=We,l,h=ki,u=1){if(h!==ki&&h!==Tn)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let d={width:t,height:e,depth:u};super(d,n,s,o,a,c,h,i,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new ms(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return e.compareFunction=this.compareFunction,e}},go=class extends yn{constructor(t,e=Pi,i=En,n,s,o=We,a=We,c,l=ki){let h={width:t,height:t,depth:1},u=[h,h,h,h,h,h];super(t,t,e,i,n,s,o,a,c,l),this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}},$s=class extends ni{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}},Vt=class r extends xe{constructor(t=1,e=1,i=1,n=1,s=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:i,widthSegments:n,heightSegments:s,depthSegments:o};let a=this;n=Math.floor(n),s=Math.floor(s),o=Math.floor(o);let c=[],l=[],h=[],u=[],d=0,f=0;g("z","y","x",-1,-1,i,e,t,o,s,0),g("z","y","x",1,-1,i,e,-t,o,s,1),g("x","z","y",1,1,t,i,e,n,o,2),g("x","z","y",1,-1,t,i,-e,n,o,3),g("x","y","z",1,-1,t,e,i,n,s,4),g("x","y","z",-1,-1,t,e,-i,n,s,5),this.setIndex(c),this.setAttribute("position",new ee(l,3)),this.setAttribute("normal",new ee(h,3)),this.setAttribute("uv",new ee(u,2));function g(y,p,m,_,M,v,w,S,T,x,E){let C=v/T,R=w/x,L=v/2,D=w/2,I=S/2,F=T+1,z=x+1,G=0,K=0,N=new k;for(let $=0;$<z;$++){let Q=$*R-D;for(let ot=0;ot<F;ot++){let st=ot*C-L;N[y]=st*_,N[p]=Q*M,N[m]=I,l.push(N.x,N.y,N.z),N[y]=0,N[p]=0,N[m]=S>0?1:-1,h.push(N.x,N.y,N.z),u.push(ot/T),u.push(1-$/x),G+=1}}for(let $=0;$<x;$++)for(let Q=0;Q<T;Q++){let ot=d+Q+F*$,st=d+Q+F*($+1),It=d+(Q+1)+F*($+1),ut=d+(Q+1)+F*$;c.push(ot,st,ut),c.push(st,It,ut),K+=6}a.addGroup(f,K,E),f+=K,d+=G}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new r(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};var Zs=class r extends xe{constructor(t=1,e=32,i=0,n=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:t,segments:e,thetaStart:i,thetaLength:n},e=Math.max(3,e);let s=[],o=[],a=[],c=[],l=new k,h=new Zt;o.push(0,0,0),a.push(0,0,1),c.push(.5,.5);for(let u=0,d=3;u<=e;u++,d+=3){let f=i+u/e*n;l.x=t*Math.cos(f),l.y=t*Math.sin(f),o.push(l.x,l.y,l.z),a.push(0,0,1),h.x=(o[d]/t+1)/2,h.y=(o[d+1]/t+1)/2,c.push(h.x,h.y)}for(let u=1;u<=e;u++)s.push(u,u+1,0);this.setIndex(s),this.setAttribute("position",new ee(o,3)),this.setAttribute("normal",new ee(a,3)),this.setAttribute("uv",new ee(c,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new r(t.radius,t.segments,t.thetaStart,t.thetaLength)}},Ne=class r extends xe{constructor(t=1,e=1,i=1,n=32,s=1,o=!1,a=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:i,radialSegments:n,heightSegments:s,openEnded:o,thetaStart:a,thetaLength:c};let l=this;n=Math.floor(n),s=Math.floor(s);let h=[],u=[],d=[],f=[],g=0,y=[],p=i/2,m=0;_(),o===!1&&(t>0&&M(!0),e>0&&M(!1)),this.setIndex(h),this.setAttribute("position",new ee(u,3)),this.setAttribute("normal",new ee(d,3)),this.setAttribute("uv",new ee(f,2));function _(){let v=new k,w=new k,S=0,T=(e-t)/i;for(let x=0;x<=s;x++){let E=[],C=x/s,R=C*(e-t)+t;for(let L=0;L<=n;L++){let D=L/n,I=D*c+a,F=Math.sin(I),z=Math.cos(I);w.x=R*F,w.y=-C*i+p,w.z=R*z,u.push(w.x,w.y,w.z),v.set(F,T,z).normalize(),d.push(v.x,v.y,v.z),f.push(D,1-C),E.push(g++)}y.push(E)}for(let x=0;x<n;x++)for(let E=0;E<s;E++){let C=y[E][x],R=y[E+1][x],L=y[E+1][x+1],D=y[E][x+1];(t>0||E!==0)&&(h.push(C,R,D),S+=3),(e>0||E!==s-1)&&(h.push(R,L,D),S+=3)}l.addGroup(m,S,0),m+=S}function M(v){let w=g,S=new Zt,T=new k,x=0,E=v===!0?t:e,C=v===!0?1:-1;for(let L=1;L<=n;L++)u.push(0,p*C,0),d.push(0,C,0),f.push(.5,.5),g++;let R=g;for(let L=0;L<=n;L++){let I=L/n*c+a,F=Math.cos(I),z=Math.sin(I);T.x=E*z,T.y=p*C,T.z=E*F,u.push(T.x,T.y,T.z),d.push(0,C,0),S.x=F*.5+.5,S.y=z*.5*C+.5,f.push(S.x,S.y),g++}for(let L=0;L<n;L++){let D=w+L,I=R+L;v===!0?h.push(I,I+1,D):h.push(I+1,I,D),x+=3}l.addGroup(m,x,v===!0?1:2),m+=x}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new r(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},gi=class r extends Ne{constructor(t=1,e=1,i=32,n=1,s=!1,o=0,a=Math.PI*2){super(0,t,e,i,n,s,o,a),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:i,heightSegments:n,openEnded:s,thetaStart:o,thetaLength:a}}static fromJSON(t){return new r(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},vs=class r extends xe{constructor(t=[],e=[],i=1,n=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:i,detail:n};let s=[],o=[];a(n),l(i),h(),this.setAttribute("position",new ee(s,3)),this.setAttribute("normal",new ee(s.slice(),3)),this.setAttribute("uv",new ee(o,2)),n===0?this.computeVertexNormals():this.normalizeNormals();function a(_){let M=new k,v=new k,w=new k;for(let S=0;S<e.length;S+=3)f(e[S+0],M),f(e[S+1],v),f(e[S+2],w),c(M,v,w,_)}function c(_,M,v,w){let S=w+1,T=[];for(let x=0;x<=S;x++){T[x]=[];let E=_.clone().lerp(v,x/S),C=M.clone().lerp(v,x/S),R=S-x;for(let L=0;L<=R;L++)L===0&&x===S?T[x][L]=E:T[x][L]=E.clone().lerp(C,L/R)}for(let x=0;x<S;x++)for(let E=0;E<2*(S-x)-1;E++){let C=Math.floor(E/2);E%2===0?(d(T[x][C+1]),d(T[x+1][C]),d(T[x][C])):(d(T[x][C+1]),d(T[x+1][C+1]),d(T[x+1][C]))}}function l(_){let M=new k;for(let v=0;v<s.length;v+=3)M.x=s[v+0],M.y=s[v+1],M.z=s[v+2],M.normalize().multiplyScalar(_),s[v+0]=M.x,s[v+1]=M.y,s[v+2]=M.z}function h(){let _=new k;for(let M=0;M<s.length;M+=3){_.x=s[M+0],_.y=s[M+1],_.z=s[M+2];let v=p(_)/2/Math.PI+.5,w=m(_)/Math.PI+.5;o.push(v,1-w)}g(),u()}function u(){for(let _=0;_<o.length;_+=6){let M=o[_+0],v=o[_+2],w=o[_+4],S=Math.max(M,v,w),T=Math.min(M,v,w);S>.9&&T<.1&&(M<.2&&(o[_+0]+=1),v<.2&&(o[_+2]+=1),w<.2&&(o[_+4]+=1))}}function d(_){s.push(_.x,_.y,_.z)}function f(_,M){let v=_*3;M.x=t[v+0],M.y=t[v+1],M.z=t[v+2]}function g(){let _=new k,M=new k,v=new k,w=new k,S=new Zt,T=new Zt,x=new Zt;for(let E=0,C=0;E<s.length;E+=9,C+=6){_.set(s[E+0],s[E+1],s[E+2]),M.set(s[E+3],s[E+4],s[E+5]),v.set(s[E+6],s[E+7],s[E+8]),S.set(o[C+0],o[C+1]),T.set(o[C+2],o[C+3]),x.set(o[C+4],o[C+5]),w.copy(_).add(M).add(v).divideScalar(3);let R=p(w);y(S,C+0,_,R),y(T,C+2,M,R),y(x,C+4,v,R)}}function y(_,M,v,w){w<0&&_.x===1&&(o[M]=_.x-1),v.x===0&&v.z===0&&(o[M]=w/2/Math.PI+.5)}function p(_){return Math.atan2(_.z,-_.x)}function m(_){return Math.atan2(-_.y,Math.sqrt(_.x*_.x+_.z*_.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new r(t.vertices,t.indices,t.radius,t.detail)}},kn=class r extends vs{constructor(t=1,e=0){let i=(1+Math.sqrt(5))/2,n=1/i,s=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-n,-i,0,-n,i,0,n,-i,0,n,i,-n,-i,0,-n,i,0,n,-i,0,n,i,0,-i,0,-n,i,0,-n,-i,0,n,i,0,n],o=[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9];super(s,o,t,e),this.type="DodecahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new r(t.radius,t.detail)}};var Qs=class r extends vs{constructor(t=1,e=0){let i=(1+Math.sqrt(5))/2,n=[-1,i,0,1,i,0,-1,-i,0,1,-i,0,0,-1,i,0,1,i,0,-1,-i,0,1,-i,i,0,-1,i,0,1,-i,0,-1,-i,0,1],s=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(n,s,t,e),this.type="IcosahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new r(t.radius,t.detail)}};var Js=class r extends vs{constructor(t=1,e=0){let i=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],n=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(i,n,t,e),this.type="OctahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new r(t.radius,t.detail)}},Ks=class r extends xe{constructor(t=1,e=1,i=1,n=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:i,heightSegments:n};let s=t/2,o=e/2,a=Math.floor(i),c=Math.floor(n),l=a+1,h=c+1,u=t/a,d=e/c,f=[],g=[],y=[],p=[];for(let m=0;m<h;m++){let _=m*d-o;for(let M=0;M<l;M++){let v=M*u-s;g.push(v,-_,0),y.push(0,0,1),p.push(M/a),p.push(1-m/c)}}for(let m=0;m<c;m++)for(let _=0;_<a;_++){let M=_+l*m,v=_+l*(m+1),w=_+1+l*(m+1),S=_+1+l*m;f.push(M,v,S),f.push(v,w,S)}this.setIndex(f),this.setAttribute("position",new ee(g,3)),this.setAttribute("normal",new ee(y,3)),this.setAttribute("uv",new ee(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new r(t.width,t.height,t.widthSegments,t.heightSegments)}},vn=class r extends xe{constructor(t=.5,e=1,i=32,n=1,s=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:t,outerRadius:e,thetaSegments:i,phiSegments:n,thetaStart:s,thetaLength:o},i=Math.max(3,i),n=Math.max(1,n);let a=[],c=[],l=[],h=[],u=t,d=(e-t)/n,f=new k,g=new Zt;for(let y=0;y<=n;y++){for(let p=0;p<=i;p++){let m=s+p/i*o;f.x=u*Math.cos(m),f.y=u*Math.sin(m),c.push(f.x,f.y,f.z),l.push(0,0,1),g.x=(f.x/e+1)/2,g.y=(f.y/e+1)/2,h.push(g.x,g.y)}u+=d}for(let y=0;y<n;y++){let p=y*(i+1);for(let m=0;m<i;m++){let _=m+p,M=_,v=_+i+1,w=_+i+2,S=_+1;a.push(M,v,S),a.push(v,w,S)}}this.setIndex(a),this.setAttribute("position",new ee(c,3)),this.setAttribute("normal",new ee(l,3)),this.setAttribute("uv",new ee(h,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new r(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}};var _n=class r extends xe{constructor(t=1,e=32,i=16,n=0,s=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:i,phiStart:n,phiLength:s,thetaStart:o,thetaLength:a},e=Math.max(3,Math.floor(e)),i=Math.max(2,Math.floor(i));let c=Math.min(o+a,Math.PI),l=0,h=[],u=new k,d=new k,f=[],g=[],y=[],p=[];for(let m=0;m<=i;m++){let _=[],M=m/i,v=o+M*a,w=t*Math.cos(v),S=Math.sqrt(t*t-w*w),T=0;m===0&&o===0?T=.5/e:m===i&&c===Math.PI&&(T=-.5/e);for(let x=0;x<=e;x++){let E=x/e,C=n+E*s;u.x=-S*Math.cos(C),u.y=w,u.z=S*Math.sin(C),g.push(u.x,u.y,u.z),d.copy(u).normalize(),y.push(d.x,d.y,d.z),p.push(E+T,1-M),_.push(l++)}h.push(_)}for(let m=0;m<i;m++)for(let _=0;_<e;_++){let M=h[m][_+1],v=h[m][_],w=h[m+1][_],S=h[m+1][_+1];(m!==0||o>0)&&f.push(M,v,S),(m!==i-1||c<Math.PI)&&f.push(v,w,S)}this.setIndex(f),this.setAttribute("position",new ee(g,3)),this.setAttribute("normal",new ee(y,3)),this.setAttribute("uv",new ee(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new r(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};var js=class r extends xe{constructor(t=1,e=.4,i=12,n=48,s=Math.PI*2,o=0,a=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:i,tubularSegments:n,arc:s,thetaStart:o,thetaLength:a},i=Math.floor(i),n=Math.floor(n);let c=[],l=[],h=[],u=[],d=new k,f=new k,g=new k;for(let y=0;y<=i;y++){let p=o+y/i*a;for(let m=0;m<=n;m++){let _=m/n*s;f.x=(t+e*Math.cos(p))*Math.cos(_),f.y=(t+e*Math.cos(p))*Math.sin(_),f.z=e*Math.sin(p),l.push(f.x,f.y,f.z),d.x=t*Math.cos(_),d.y=t*Math.sin(_),g.subVectors(f,d).normalize(),h.push(g.x,g.y,g.z),u.push(m/n),u.push(y/i)}}for(let y=1;y<=i;y++)for(let p=1;p<=n;p++){let m=(n+1)*y+p-1,_=(n+1)*(y-1)+p-1,M=(n+1)*(y-1)+p,v=(n+1)*y+p;c.push(m,_,v),c.push(_,M,v)}this.setIndex(c),this.setAttribute("position",new ee(l,3)),this.setAttribute("normal",new ee(h,3)),this.setAttribute("uv",new ee(u,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new r(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc,t.thetaStart,t.thetaLength)}};function Wn(r){let t={};for(let e in r){t[e]={};for(let i in r[e]){let n=r[e][i];if(lh(n))n.isRenderTargetTexture?(Gt("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][i]=null):t[e][i]=n.clone();else if(Array.isArray(n))if(lh(n[0])){let s=[];for(let o=0,a=n.length;o<a;o++)s[o]=n[o].clone();t[e][i]=s}else t[e][i]=n.slice();else t[e][i]=n}}return t}function ti(r){let t={};for(let e=0;e<r.length;e++){let i=Wn(r[e]);for(let n in i)t[n]=i[n]}return t}function lh(r){return r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)}function Mu(r){let t=[];for(let e=0;e<r.length;e++)t.push(r[e].clone());return t}function Jl(r){let t=r.getRenderTarget();return t===null?r.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:se.workingColorSpace}var ed={clone:Wn,merge:ti},Su=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,bu=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Oe=class extends Mi{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Su,this.fragmentShader=bu,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Wn(t.uniforms),this.uniformsGroups=Mu(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let n in this.uniforms){let o=this.uniforms[n].value;o&&o.isTexture?e.uniforms[n]={type:"t",value:o.toJSON(t).uuid}:o&&o.isColor?e.uniforms[n]={type:"c",value:o.getHex()}:o&&o.isVector2?e.uniforms[n]={type:"v2",value:o.toArray()}:o&&o.isVector3?e.uniforms[n]={type:"v3",value:o.toArray()}:o&&o.isVector4?e.uniforms[n]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?e.uniforms[n]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?e.uniforms[n]={type:"m4",value:o.toArray()}:e.uniforms[n]={value:o}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let i={};for(let n in this.extensions)this.extensions[n]===!0&&(i[n]=!0);return Object.keys(i).length>0&&(e.extensions=i),e}fromJSON(t,e){if(super.fromJSON(t,e),t.uniforms!==void 0)for(let i in t.uniforms){let n=t.uniforms[i];switch(this.uniforms[i]={},n.type){case"t":this.uniforms[i].value=e[n.value]||null;break;case"c":this.uniforms[i].value=new ft().setHex(n.value);break;case"v2":this.uniforms[i].value=new Zt().fromArray(n.value);break;case"v3":this.uniforms[i].value=new k().fromArray(n.value);break;case"v4":this.uniforms[i].value=new Pe().fromArray(n.value);break;case"m3":this.uniforms[i].value=new Yt().fromArray(n.value);break;case"m4":this.uniforms[i].value=new ue().fromArray(n.value);break;default:this.uniforms[i].value=n.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(let i in t.extensions)this.extensions[i]=t.extensions[i];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}},xo=class extends Oe{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},xi=class extends Mi{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new ft(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new ft(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=ws,this.normalScale=new Zt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new pi,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}};var tr=class extends Mi{constructor(t){super(),this.isMeshPhongMaterial=!0,this.type="MeshPhongMaterial",this.color=new ft(16777215),this.specular=new ft(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new ft(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=ws,this.normalScale=new Zt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new pi,this.combine=ar,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.specular.copy(t.specular),this.shininess=t.shininess,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.envMapIntensity=t.envMapIntensity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}};var de=class extends Mi{constructor(t){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new ft(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new ft(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=ws,this.normalScale=new Zt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new pi,this.combine=ar,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.envMapIntensity=t.envMapIntensity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}},yo=class extends Mi{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=kh,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},vo=class extends Mi{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}};function ls(r,t){return!r||r.constructor===t?r:typeof t.BYTES_PER_ELEMENT=="number"?new t(r):Array.prototype.slice.call(r)}function yl(r){return r!==void 0&&r.inTangents!==void 0&&r.outTangents!==void 0}var Mn=class{constructor(t,e,i,n){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=n!==void 0?n:new e.constructor(i),this.sampleValues=e,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,i=this._cachedIndex,n=e[i],s=e[i-1];i:{t:{let o;e:{n:if(!(t<n)){for(let a=i+2;;){if(n===void 0){if(t<s)break n;return i=e.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===a)break;if(s=n,n=e[++i],t<n)break t}o=e.length;break e}if(!(t>=s)){let a=e[1];t<a&&(i=2,s=a);for(let c=i-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===c)break;if(n=s,s=e[--i-1],t>=s)break t}o=i,i=0;break e}break i}for(;i<o;){let a=i+o>>>1;t<e[a]?o=a:i=a+1}if(n=e[i],s=e[i-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===void 0)return i=e.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,s,n)}return this.interpolate_(i,s,t,n)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,i=this.sampleValues,n=this.valueSize,s=t*n;for(let o=0;o!==n;++o)e[o]=i[s+o];return e}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},_o=class extends Mn{constructor(t,e,i,n){super(t,e,i,n),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Ml,endingEnd:Ml}}intervalChanged_(t,e,i){let n=this.parameterPositions,s=t-2,o=t+1,a=n[s],c=n[o];if(a===void 0)switch(this.getSettings_().endingStart){case Sl:s=t,a=2*e-i;break;case bl:s=n.length-2,a=e+n[s]-n[s+1];break;default:s=t,a=i}if(c===void 0)switch(this.getSettings_().endingEnd){case Sl:o=t,c=2*i-e;break;case bl:o=1,c=i+n[1]-n[0];break;default:o=t-1,c=e}let l=(i-e)*.5,h=this.valueSize;this._weightPrev=l/(e-a),this._weightNext=l/(c-i),this._offsetPrev=s*h,this._offsetNext=o*h}interpolate_(t,e,i,n){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=t*a,l=c-a,h=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,g=(i-e)/(n-e),y=g*g,p=y*g,m=-d*p+2*d*y-d*g,_=(1+d)*p+(-1.5-2*d)*y+(-.5+d)*g+1,M=(-1-f)*p+(1.5+f)*y+.5*g,v=f*p-f*y;for(let w=0;w!==a;++w)s[w]=m*o[h+w]+_*o[l+w]+M*o[c+w]+v*o[u+w];return s}},Mo=class extends Mn{constructor(t,e,i,n){super(t,e,i,n)}interpolate_(t,e,i,n){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=t*a,l=c-a,h=(i-e)/(n-e),u=1-h;for(let d=0;d!==a;++d)s[d]=o[l+d]*u+o[c+d]*h;return s}},So=class extends Mn{constructor(t,e,i,n){super(t,e,i,n)}interpolate_(t){return this.copySampleValue_(t-1)}},bo=class extends Mn{interpolate_(t,e,i,n){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=t*a,l=c-a,h=this.inTangents,u=this.outTangents;if(!h||!u){let g=(i-e)/(n-e),y=1-g;for(let p=0;p!==a;++p)s[p]=o[l+p]*y+o[c+p]*g;return s}let d=a*2,f=t-1;for(let g=0;g!==a;++g){let y=o[l+g],p=o[c+g],m=f*d+g*2,_=u[m],M=u[m+1],v=t*d+g*2,w=h[v],S=h[v+1],T=Eu(i,e,_,w,n);s[g]=id(T,y,M,S,p)}return s}};function id(r,t,e,i,n){let s=1-r;return s*s*s*t+3*s*s*r*e+3*s*r*r*i+r*r*r*n}function wu(r,t,e,i,n){let s=1-r;return 3*s*s*(e-t)+6*s*r*(i-e)+3*r*r*(n-i)}function Eu(r,t,e,i,n){let s=(r-t)/(n-t);for(let o=0;o<8;o++){let a=id(s,t,e,i,n)-r;if(Math.abs(a)<1e-10)break;let c=wu(s,t,e,i,n);if(Math.abs(c)<1e-10)break;s=Math.max(0,Math.min(1,s-a/c))}return s}var yi=class{constructor(t,e,i,n){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=ls(e,this.TimeBufferType),this.values=ls(i,this.ValueBufferType),this.setInterpolation(n||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,i;if(e.toJSON!==this.toJSON)i=e.toJSON(t);else{i={name:t.name,times:ls(t.times,Array),values:ls(t.values,Array)};let n=t.getInterpolation();n!==t.DefaultInterpolation&&(i.interpolation=n),yl(t.settings)&&(i.settings={inTangents:ls(t.settings.inTangents,Array),outTangents:ls(t.settings.outTangents,Array)})}return i.type=t.ValueTypeName,i}InterpolantFactoryMethodDiscrete(t){return new So(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new Mo(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new _o(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodBezier(t){let e=new bo(this.times,this.values,this.getValueSize(),t);return this.settings&&(e.inTangents=this.settings.inTangents,e.outTangents=this.settings.outTangents),e}setInterpolation(t){let e;switch(t){case zs:e=this.InterpolantFactoryMethodDiscrete;break;case oo:e=this.InterpolantFactoryMethodLinear;break;case Qr:e=this.InterpolantFactoryMethodSmooth;break;case _l:e=this.InterpolantFactoryMethodBezier;break}if(e===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return Gt("KeyframeTrack:",i),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return zs;case this.InterpolantFactoryMethodLinear:return oo;case this.InterpolantFactoryMethodSmooth:return Qr;case this.InterpolantFactoryMethodBezier:return _l}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let i=0,n=e.length;i!==n;++i)e[i]+=t}return this}scale(t){if(t!==1){let e=this.times;for(let i=0,n=e.length;i!==n;++i)e[i]*=t;yl(this.settings)&&(ch(this.settings.inTangents,t),ch(this.settings.outTangents,t))}return this}trim(t,e){let i=this.times,n=i.length,s=0,o=n-1;for(;s!==n&&i[s]<t;)++s;for(;o!==-1&&i[o]>e;)--o;if(++o,s!==0||o!==n){s>=o&&(o=Math.max(o,1),s=o-1);let a=this.getValueSize();this.times=i.slice(s,o),this.values=this.values.slice(s*a,o*a)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(Wt("KeyframeTrack: Invalid value size in track.",this),t=!1);let i=this.times,n=this.values,s=i.length;s===0&&(Wt("KeyframeTrack: Track is empty.",this),t=!1);let o=null;for(let a=0;a!==s;a++){let c=i[a];if(typeof c=="number"&&isNaN(c)){Wt("KeyframeTrack: Time is not a valid number.",this,a,c),t=!1;break}if(o!==null&&o>c){Wt("KeyframeTrack: Out of order keys.",this,a,c,o),t=!1;break}o=c}if(n!==void 0&&tu(n))for(let a=0,c=n.length;a!==c;++a){let l=n[a];if(isNaN(l)){Wt("KeyframeTrack: Value is not a valid number.",this,a,l),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),i=this.getValueSize(),n=this.getInterpolation()===Qr,s=t.length-1,o=1;for(let a=1;a<s;++a){let c=!1,l=t[a],h=t[a+1];if(l!==h&&(a!==1||l!==t[0]))if(n)c=!0;else{let u=a*i,d=u-i,f=u+i;for(let g=0;g!==i;++g){let y=e[u+g];if(y!==e[d+g]||y!==e[f+g]){c=!0;break}}}if(c){if(a!==o){t[o]=t[a];let u=a*i,d=o*i;for(let f=0;f!==i;++f)e[d+f]=e[u+f]}++o}}if(s>0){t[o]=t[s];for(let a=s*i,c=o*i,l=0;l!==i;++l)e[c+l]=e[a+l];++o}return o!==t.length?(this.times=t.slice(0,o),this.values=e.slice(0,o*i)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),i=this.constructor,n=new i(this.name,t,e);return n.createInterpolant=this.createInterpolant,yl(this.settings)&&(n.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),n}};function ch(r,t){for(let e=0,i=r.length;e!==i;e+=2)r[e]*=t}yi.prototype.ValueTypeName="";yi.prototype.TimeBufferType=Float32Array;yi.prototype.ValueBufferType=Float32Array;yi.prototype.DefaultInterpolation=oo;var Sn=class extends yi{constructor(t,e,i){super(t,e,i)}};Sn.prototype.ValueTypeName="bool";Sn.prototype.ValueBufferType=Array;Sn.prototype.DefaultInterpolation=zs;Sn.prototype.InterpolantFactoryMethodLinear=void 0;Sn.prototype.InterpolantFactoryMethodSmooth=void 0;var wo=class extends yi{constructor(t,e,i,n){super(t,e,i,n)}};wo.prototype.ValueTypeName="color";var Eo=class extends yi{constructor(t,e,i,n){super(t,e,i,n)}};Eo.prototype.ValueTypeName="number";var To=class extends Mn{constructor(t,e,i,n){super(t,e,i,n)}interpolate_(t,e,i,n){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=(i-e)/(n-e),l=t*a;for(let h=l+a;l!==h;l+=4)fi.slerpFlat(s,0,o,l-a,o,l,c);return s}},er=class extends yi{constructor(t,e,i,n){super(t,e,i,n)}InterpolantFactoryMethodLinear(t){return new To(this.times,this.values,this.getValueSize(),t)}};er.prototype.ValueTypeName="quaternion";er.prototype.InterpolantFactoryMethodSmooth=void 0;var bn=class extends yi{constructor(t,e,i){super(t,e,i)}};bn.prototype.ValueTypeName="string";bn.prototype.ValueBufferType=Array;bn.prototype.DefaultInterpolation=zs;bn.prototype.InterpolantFactoryMethodLinear=void 0;bn.prototype.InterpolantFactoryMethodSmooth=void 0;var Ao=class extends yi{constructor(t,e,i,n){super(t,e,i,n)}};Ao.prototype.ValueTypeName="vector";var Co=class{constructor(t,e,i){let n=this,s=!1,o=0,a=0,c,l=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=i,this._abortController=null,this.itemStart=function(h){a++,s===!1&&n.onStart!==void 0&&n.onStart(h,o,a),s=!0},this.itemEnd=function(h){o++,n.onProgress!==void 0&&n.onProgress(h,o,a),o===a&&(s=!1,n.onLoad!==void 0&&n.onLoad())},this.itemError=function(h){n.onError!==void 0&&n.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),c?c(h):h},this.setURLModifier=function(h){return c=h,this},this.addHandler=function(h,u){return l.push(h,u),this},this.removeHandler=function(h){let u=l.indexOf(h);return u!==-1&&l.splice(u,2),this},this.getHandler=function(h){for(let u=0,d=l.length;u<d;u+=2){let f=l[u],g=l[u+1];if(f.global&&(f.lastIndex=0),f.test(h))return g}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},nd=new Co,Ro=class{constructor(t){this.manager=t!==void 0?t:nd,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(t,e){let i=this;return new Promise(function(n,s){i.load(t,n,e,s)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}abort(){return this}};Ro.DEFAULT_MATERIAL_NAME="__DEFAULT";var ir=class extends ze{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new ft(t),this.intensity=e}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,e}},nr=class extends ir{constructor(t,e,i){super(t,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(ze.DEFAULT_UP),this.updateMatrix(),this.groundColor=new ft(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}toJSON(t){let e=super.toJSON(t);return e.object.groundColor=this.groundColor.getHex(),e}},vl=new ue,hh=new k,dh=new k,Io=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Zt(512,512),this.mapType=li,this.map=null,this.mapPass=null,this.matrix=new ue,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new ys,this._frameExtents=new Zt(1,1),this._viewportCount=1,this._viewports=[new Pe(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera;hh.setFromMatrixPosition(t.matrixWorld),e.position.copy(hh),dh.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(dh),e.updateMatrixWorld(),this._updateMatrix(e,this.matrix,this._frustum)}_updateMatrix(t,e,i,n){vl.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),i.setFromProjectionMatrix(vl,t.coordinateSystem,t.reversedDepth);let s=this._frameExtents,o=n?n.z/s.x:1,a=n?n.w/s.y:1,c=n?n.x/s.x:0,l=n?n.y/s.y:0;t.coordinateSystem===fs||t.reversedDepth?e.set(.5*o,0,0,.5*o+c,0,.5*a,0,.5*a+l,0,0,1,0,0,0,0,1):e.set(.5*o,0,0,.5*o+c,0,.5*a,0,.5*a+l,0,0,.5,.5,0,0,0,1),e.multiply(vl)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return t.intensity=this.intensity,t.bias=this.bias,t.normalBias=this.normalBias,t.radius=this.radius,t.blurSamples=this.blurSamples,t.mapSize=this.mapSize.toArray(),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}},$r=new k,Zr=new fi,zi=new k,sr=class extends ze{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ue,this.projectionMatrix=new ue,this.projectionMatrixInverse=new ue,this.coordinateSystem=Ri,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose($r,Zr,zi),zi.x===1&&zi.y===1&&zi.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose($r,Zr,zi.set(1,1,1)).invert()}updateWorldMatrix(t,e,i=!1){super.updateWorldMatrix(t,e,i),this.matrixWorld.decompose($r,Zr,zi),zi.x===1&&zi.y===1&&zi.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose($r,Zr,zi.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},pn=new k,uh=new Zt,fh=new Zt,Ke=class extends sr{constructor(t=50,e=1,i=.1,n=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=i,this.far=n,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=ao*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(Qa*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return ao*2*Math.atan(Math.tan(Qa*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,i){pn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(pn.x,pn.y).multiplyScalar(-t/pn.z),pn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(pn.x,pn.y).multiplyScalar(-t/pn.z)}getViewSize(t,e){return this.getViewBounds(t,uh,fh),e.subVectors(fh,uh)}setViewOffset(t,e,i,n,s,o){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=n,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(Qa*.5*this.fov)/this.zoom,i=2*e,n=this.aspect*i,s=-.5*n,o=this.view;if(this.view!==null&&this.view.enabled){let c=o.fullWidth,l=o.fullHeight;s+=o.offsetX*n/c,e-=o.offsetY*i/l,n*=o.width/c,i*=o.height/l}let a=this.filmOffset;a!==0&&(s+=t*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+n,e,e-i,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}};var _s=class extends sr{constructor(t=-1,e=1,i=1,n=-1,s=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=i,this.bottom=n,this.near=s,this.far=o,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,i,n,s,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=n,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,n=(this.top+this.bottom)/2,s=i-t,o=i+t,a=n+e,c=n-e;if(this.view!==null&&this.view.enabled){let l=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=l*this.view.offsetX,o=s+l*this.view.width,a-=h*this.view.offsetY,c=a-h*this.view.height}this.projectionMatrix.makeOrthographic(s,o,a,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}},El=class extends Io{constructor(){super(new _s(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},rr=class extends ir{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(ze.DEFAULT_UP),this.updateMatrix(),this.target=new ze,this.shadow=new El}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.shadow=this.shadow.toJSON(),e.object.target=this.target.uuid,e}};var cs=-90,hs=1,Po=class extends ze{constructor(t,e,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let n=new Ke(cs,hs,t,e);n.layers=this.layers,this.add(n);let s=new Ke(cs,hs,t,e);s.layers=this.layers,this.add(s);let o=new Ke(cs,hs,t,e);o.layers=this.layers,this.add(o);let a=new Ke(cs,hs,t,e);a.layers=this.layers,this.add(a);let c=new Ke(cs,hs,t,e);c.layers=this.layers,this.add(c);let l=new Ke(cs,hs,t,e);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[i,n,s,o,a,c]=e;for(let l of e)this.remove(l);if(t===Ri)i.up.set(0,1,0),i.lookAt(1,0,0),n.up.set(0,1,0),n.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(t===fs)i.up.set(0,-1,0),i.lookAt(-1,0,0),n.up.set(0,-1,0),n.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let l of e)this.add(l),l.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:n}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[s,o,a,c,l,h]=this.children,u=t.getRenderTarget(),d=t.getActiveCubeFace(),f=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;let y=i.texture.generateMipmaps;i.texture.generateMipmaps=!1;let p=!1;t.isWebGLRenderer===!0?p=t.state.buffers.depth.getReversed():p=t.reversedDepthBuffer,t.setRenderTarget(i,0,n),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,s),t.setRenderTarget(i,1,n),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,o),t.setRenderTarget(i,2,n),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,a),t.setRenderTarget(i,3,n),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,c),t.setRenderTarget(i,4,n),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,l),i.texture.generateMipmaps=y,t.setRenderTarget(i,5,n),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,h),t.setRenderTarget(u,d,f),t.xr.enabled=g,i.texture.needsPMREMUpdate=!0}},Lo=class extends Ke{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}};var Kl="\\[\\]\\.:\\/",Tu=new RegExp("["+Kl+"]","g"),jl="[^"+Kl+"]",Au="[^"+Kl.replace("\\.","")+"]",Cu=/((?:WC+[\/:])*)/.source.replace("WC",jl),Ru=/(WCOD+)?/.source.replace("WCOD",Au),Iu=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",jl),Pu=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",jl),Lu=new RegExp("^"+Cu+Ru+Iu+Pu+"$"),Du=["material","materials","bones","map"],Tl=class{constructor(t,e,i){let n=i||Ae.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,n)}getValue(t,e){this.bind();let i=this._targetGroup.nCachedObjects_,n=this._bindings[i];n!==void 0&&n.getValue(t,e)}setValue(t,e){let i=this._bindings;for(let n=this._targetGroup.nCachedObjects_,s=i.length;n!==s;++n)i[n].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,i=t.length;e!==i;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,i=t.length;e!==i;++e)t[e].unbind()}},Ae=class r{constructor(t,e,i){this.path=e,this.parsedPath=i||r.parseTrackName(e),this.node=r.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,i){return t&&t.isAnimationObjectGroup?new r.Composite(t,e,i):new r(t,e,i)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(Tu,"")}static parseTrackName(t){let e=Lu.exec(t);if(e===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let i={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},n=i.nodeName&&i.nodeName.lastIndexOf(".");if(n!==void 0&&n!==-1){let s=i.nodeName.substring(n+1);Du.indexOf(s)!==-1&&(i.nodeName=i.nodeName.substring(0,n),i.objectName=s)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return i}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let i=t.skeleton.getBoneByName(e);if(i!==void 0)return i}if(t.children){let i=function(s){for(let o=0;o<s.length;o++){let a=s[o];if(a.name===e||a.uuid===e)return a;let c=i(a.children);if(c)return c}return null},n=i(t.children);if(n)return n}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let i=this.resolvedProperty;for(let n=0,s=i.length;n!==s;++n)t[e++]=i[n]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let i=this.resolvedProperty;for(let n=0,s=i.length;n!==s;++n)i[n]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let i=this.resolvedProperty;for(let n=0,s=i.length;n!==s;++n)i[n]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let i=this.resolvedProperty;for(let n=0,s=i.length;n!==s;++n)i[n]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,i=e.objectName,n=e.propertyName,s=e.propertyIndex;if(t||(t=r.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){Gt("PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let l=e.objectIndex;switch(i){case"materials":if(!t.material){Wt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){Wt("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){Wt("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let h=0;h<t.length;h++)if(t[h].name===l){l=h;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){Wt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){Wt("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[i]===void 0){Wt("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[i]}if(l!==void 0){if(t[l]===void 0){Wt("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[l]}}let o=t[n];if(o===void 0){let l=e.nodeName;Wt("PropertyBinding: Trying to update property for track: "+l+"."+n+" but it wasn't found.",t);return}let a=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?a=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(s!==void 0){if(n==="morphTargetInfluences"){if(!t.geometry){Wt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){Wt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[s]!==void 0&&(s=t.morphTargetDictionary[s])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=s}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=n;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Ae.Composite=Tl;Ae.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Ae.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Ae.prototype.GetterByBindingType=[Ae.prototype._getValue_direct,Ae.prototype._getValue_array,Ae.prototype._getValue_arrayElement,Ae.prototype._getValue_toArray];Ae.prototype.SetterByBindingTypeAndVersioning=[[Ae.prototype._setValue_direct,Ae.prototype._setValue_direct_setNeedsUpdate,Ae.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Ae.prototype._setValue_array,Ae.prototype._setValue_array_setNeedsUpdate,Ae.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Ae.prototype._setValue_arrayElement,Ae.prototype._setValue_arrayElement_setNeedsUpdate,Ae.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Ae.prototype._setValue_fromArray,Ae.prototype._setValue_fromArray_setNeedsUpdate,Ae.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var zg=new Float32Array(1);var ph=new ue,or=class{constructor(t,e,i=0,n=1/0){this.ray=new zn(t,e),this.near=i,this.far=n,this.camera=null,this.layers=new gs,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,e){this.ray.set(t,e)}setFromCamera(t,e){e.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(e).sub(this.ray.origin).normalize(),this.camera=e):e.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,e.projectionMatrix.elements[14]).unproject(e),this.ray.direction.set(0,0,-1).transformDirection(e.matrixWorld),this.camera=e):Wt("Raycaster: Unsupported camera type: "+e.type)}setFromXRController(t){return ph.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(ph),this}intersectObject(t,e=!0,i=[]){return Al(t,this,i,e),i.sort(mh),i}intersectObjects(t,e=!0,i=[]){for(let n=0,s=t.length;n<s;n++)Al(t[n],this,i,e);return i.sort(mh),i}};function mh(r,t){return r.distance-t.distance}function Al(r,t,e,i){let n=!0;if(r.layers.test(t.layers)&&r.raycast(t,e)===!1&&(n=!1),n===!0&&i===!0){let s=r.children;for(let o=0,a=s.length;o<a;o++)Al(s[o],t,e,!0)}}var rc=class rc{constructor(t,e,i,n){this.elements=[1,0,0,1],t!==void 0&&this.set(t,e,i,n)}identity(){return this.set(1,0,0,1),this}fromArray(t,e=0){for(let i=0;i<4;i++)this.elements[i]=t[i+e];return this}set(t,e,i,n){let s=this.elements;return s[0]=t,s[2]=e,s[1]=i,s[3]=n,this}};rc.prototype.isMatrix2=!0;var Cl=rc;function tc(r,t,e,i){let n=Nu(i);switch(e){case Yl:return r*t;case ko:return r*t/n.components*n.byteLength;case Ho:return r*t/n.components*n.byteLength;case An:return r*t*2/n.components*n.byteLength;case Go:return r*t*2/n.components*n.byteLength;case $l:return r*t*3/n.components*n.byteLength;case ri:return r*t*4/n.components*n.byteLength;case Vo:return r*t*4/n.components*n.byteLength;case hr:case dr:return Math.floor((r+3)/4)*Math.floor((t+3)/4)*8;case ur:case fr:return Math.floor((r+3)/4)*Math.floor((t+3)/4)*16;case Xo:case Yo:return Math.max(r,16)*Math.max(t,8)/4;case Wo:case qo:return Math.max(r,8)*Math.max(t,8)/2;case $o:case Zo:case Jo:case Ko:return Math.floor((r+3)/4)*Math.floor((t+3)/4)*8;case Qo:case pr:case jo:return Math.floor((r+3)/4)*Math.floor((t+3)/4)*16;case ta:return Math.floor((r+3)/4)*Math.floor((t+3)/4)*16;case ea:return Math.floor((r+4)/5)*Math.floor((t+3)/4)*16;case ia:return Math.floor((r+4)/5)*Math.floor((t+4)/5)*16;case na:return Math.floor((r+5)/6)*Math.floor((t+4)/5)*16;case sa:return Math.floor((r+5)/6)*Math.floor((t+5)/6)*16;case ra:return Math.floor((r+7)/8)*Math.floor((t+4)/5)*16;case oa:return Math.floor((r+7)/8)*Math.floor((t+5)/6)*16;case aa:return Math.floor((r+7)/8)*Math.floor((t+7)/8)*16;case la:return Math.floor((r+9)/10)*Math.floor((t+4)/5)*16;case ca:return Math.floor((r+9)/10)*Math.floor((t+5)/6)*16;case ha:return Math.floor((r+9)/10)*Math.floor((t+7)/8)*16;case da:return Math.floor((r+9)/10)*Math.floor((t+9)/10)*16;case ua:return Math.floor((r+11)/12)*Math.floor((t+9)/10)*16;case fa:return Math.floor((r+11)/12)*Math.floor((t+11)/12)*16;case pa:case ma:case ga:return Math.ceil(r/4)*Math.ceil(t/4)*16;case xa:case ya:return Math.ceil(r/4)*Math.ceil(t/4)*8;case mr:case va:return Math.ceil(r/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function Nu(r){switch(r){case li:case Vl:return{byteLength:1,components:1};case Ss:case Wl:case Li:return{byteLength:2,components:1};case zo:case Oo:return{byteLength:2,components:4};case Pi:case Bo:case Si:return{byteLength:4,components:1};case Xl:case ql:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${r}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?Gt("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function Ed(){let r=null,t=!1,e=null,i=null;function n(s,o){i=r.requestAnimationFrame(n),e(s,o)}return{start:function(){t!==!0&&e!==null&&r!==null&&(i=r.requestAnimationFrame(n),t=!0)},stop:function(){r!==null&&r.cancelAnimationFrame(i),t=!1},setAnimationLoop:function(s){e=s},setContext:function(s){r=s}}}function Fu(r){let t=new WeakMap;function e(a,c){let l=a.array,h=a.usage,u=l.byteLength,d=r.createBuffer();r.bindBuffer(c,d),r.bufferData(c,l,h),a.onUploadCallback();let f;if(l instanceof Float32Array)f=r.FLOAT;else if(typeof Float16Array<"u"&&l instanceof Float16Array)f=r.HALF_FLOAT;else if(l instanceof Uint16Array)a.isFloat16BufferAttribute?f=r.HALF_FLOAT:f=r.UNSIGNED_SHORT;else if(l instanceof Int16Array)f=r.SHORT;else if(l instanceof Uint32Array)f=r.UNSIGNED_INT;else if(l instanceof Int32Array)f=r.INT;else if(l instanceof Int8Array)f=r.BYTE;else if(l instanceof Uint8Array)f=r.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)f=r.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:d,type:f,bytesPerElement:l.BYTES_PER_ELEMENT,version:a.version,size:u}}function i(a,c,l){let h=c.array,u=c.updateRanges;if(r.bindBuffer(l,a),u.length===0)r.bufferSubData(l,0,h);else{u.sort((f,g)=>f.start-g.start);let d=0;for(let f=1;f<u.length;f++){let g=u[d],y=u[f];y.start<=g.start+g.count+1?g.count=Math.max(g.count,y.start+y.count-g.start):(++d,u[d]=y)}u.length=d+1;for(let f=0,g=u.length;f<g;f++){let y=u[f];r.bufferSubData(l,y.start*h.BYTES_PER_ELEMENT,h,y.start,y.count)}c.clearUpdateRanges()}c.onUploadCallback()}function n(a){return a.isInterleavedBufferAttribute&&(a=a.data),t.get(a)}function s(a){a.isInterleavedBufferAttribute&&(a=a.data);let c=t.get(a);c&&(r.deleteBuffer(c.buffer),t.delete(a))}function o(a,c){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let h=t.get(a);(!h||h.version<a.version)&&t.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let l=t.get(a);if(l===void 0)t.set(a,e(a,c));else if(l.version<a.version){if(l.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(l.buffer,a,c),l.version=a.version}}return{get:n,remove:s,update:o}}var Bu=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,zu=`#ifdef USE_ALPHAHASH
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
#endif`,Ou=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,ku=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Hu=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Gu=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Vu=`#ifdef USE_AOMAP
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
#endif`,Wu=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Xu=`#ifdef USE_BATCHING
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
#endif`,qu=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Yu=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,$u=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Zu=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,Qu=`#ifdef USE_IRIDESCENCE
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
#endif`,Ju=`#ifdef USE_BUMPMAP
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
#endif`,Ku=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,ju=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,tf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,ef=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,nf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,sf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,rf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,of=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,af=`#define PI 3.141592653589793
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
} // validated`,lf=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,cf=`vec3 transformedNormal = objectNormal;
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
#endif`,hf=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,df=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,uf=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,ff=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,pf="gl_FragColor = linearToOutputTexel( gl_FragColor );",mf=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,gf=`#ifdef USE_ENVMAP
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
#endif`,xf=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,yf=`#ifdef USE_ENVMAP
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
#endif`,vf=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,_f=`#ifdef USE_ENVMAP
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
#endif`,Mf=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Sf=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,bf=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,wf=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Ef=`#ifdef USE_GRADIENTMAP
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
}`,Tf=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Af=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Cf=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Rf=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,If=`#ifdef USE_ENVMAP
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
#endif`,Pf=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Lf=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Df=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Nf=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Uf=`PhysicalMaterial material;
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
#endif`,Ff=`uniform sampler2D dfgLUT;
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
}`,Bf=`
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
#endif`,zf=`#if defined( RE_IndirectDiffuse )
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
#endif`,Of=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,kf=`#ifdef USE_LIGHT_PROBES_GRID
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
#endif`,Hf=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Gf=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Vf=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Wf=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Xf=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,qf=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Yf=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,$f=`#if defined( USE_POINTS_UV )
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
#endif`,Zf=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Qf=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Jf=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Kf=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,jf=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,tp=`#ifdef USE_MORPHTARGETS
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
#endif`,ep=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,ip=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,np=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,sp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,rp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,op=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,ap=`#ifdef USE_NORMALMAP
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
#endif`,lp=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,cp=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,hp=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,dp=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,up=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,fp=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,pp=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,mp=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,gp=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,xp=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,yp=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,vp=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,_p=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Mp=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Sp=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,bp=`float getShadowMask() {
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
}`,wp=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Ep=`#ifdef USE_SKINNING
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
#endif`,Tp=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Ap=`#ifdef USE_SKINNING
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
#endif`,Cp=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Rp=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Ip=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Pp=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,Lp=`#ifdef USE_TRANSMISSION
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
#endif`,Dp=`#ifdef USE_TRANSMISSION
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
#endif`,Np=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Up=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Fp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Bp=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,zp=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Op=`uniform sampler2D t2D;
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
}`,kp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Hp=`#ifdef ENVMAP_TYPE_CUBE
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
}`,Gp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Vp=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Wp=`#include <common>
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
}`,Xp=`#if DEPTH_PACKING == 3200
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
}`,qp=`#define DISTANCE
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
}`,Yp=`#define DISTANCE
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
}`,$p=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Zp=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Qp=`uniform float scale;
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
}`,Jp=`uniform vec3 diffuse;
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
}`,Kp=`#include <common>
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
}`,jp=`uniform vec3 diffuse;
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
}`,tm=`#define LAMBERT
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
}`,em=`#define LAMBERT
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
}`,im=`#define MATCAP
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
}`,nm=`#define MATCAP
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
}`,sm=`#define NORMAL
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
}`,rm=`#define NORMAL
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
}`,om=`#define PHONG
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
}`,am=`#define PHONG
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
}`,lm=`#define STANDARD
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
}`,cm=`#define STANDARD
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
}`,hm=`#define TOON
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
}`,dm=`#define TOON
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
}`,um=`uniform float size;
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
}`,fm=`uniform vec3 diffuse;
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
}`,pm=`#include <common>
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
}`,mm=`uniform vec3 color;
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
}`,gm=`uniform float rotation;
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
}`,xm=`uniform vec3 diffuse;
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
}`,te={alphahash_fragment:Bu,alphahash_pars_fragment:zu,alphamap_fragment:Ou,alphamap_pars_fragment:ku,alphatest_fragment:Hu,alphatest_pars_fragment:Gu,aomap_fragment:Vu,aomap_pars_fragment:Wu,batching_pars_vertex:Xu,batching_vertex:qu,begin_vertex:Yu,beginnormal_vertex:$u,bsdfs:Zu,iridescence_fragment:Qu,bumpmap_pars_fragment:Ju,clipping_planes_fragment:Ku,clipping_planes_pars_fragment:ju,clipping_planes_pars_vertex:tf,clipping_planes_vertex:ef,color_fragment:nf,color_pars_fragment:sf,color_pars_vertex:rf,color_vertex:of,common:af,cube_uv_reflection_fragment:lf,defaultnormal_vertex:cf,displacementmap_pars_vertex:hf,displacementmap_vertex:df,emissivemap_fragment:uf,emissivemap_pars_fragment:ff,colorspace_fragment:pf,colorspace_pars_fragment:mf,envmap_fragment:gf,envmap_common_pars_fragment:xf,envmap_pars_fragment:yf,envmap_pars_vertex:vf,envmap_physical_pars_fragment:If,envmap_vertex:_f,fog_vertex:Mf,fog_pars_vertex:Sf,fog_fragment:bf,fog_pars_fragment:wf,gradientmap_pars_fragment:Ef,lightmap_pars_fragment:Tf,lights_lambert_fragment:Af,lights_lambert_pars_fragment:Cf,lights_pars_begin:Rf,lights_toon_fragment:Pf,lights_toon_pars_fragment:Lf,lights_phong_fragment:Df,lights_phong_pars_fragment:Nf,lights_physical_fragment:Uf,lights_physical_pars_fragment:Ff,lights_fragment_begin:Bf,lights_fragment_maps:zf,lights_fragment_end:Of,lightprobes_pars_fragment:kf,logdepthbuf_fragment:Hf,logdepthbuf_pars_fragment:Gf,logdepthbuf_pars_vertex:Vf,logdepthbuf_vertex:Wf,map_fragment:Xf,map_pars_fragment:qf,map_particle_fragment:Yf,map_particle_pars_fragment:$f,metalnessmap_fragment:Zf,metalnessmap_pars_fragment:Qf,morphinstance_vertex:Jf,morphcolor_vertex:Kf,morphnormal_vertex:jf,morphtarget_pars_vertex:tp,morphtarget_vertex:ep,normal_fragment_begin:ip,normal_fragment_maps:np,normal_pars_fragment:sp,normal_pars_vertex:rp,normal_vertex:op,normalmap_pars_fragment:ap,clearcoat_normal_fragment_begin:lp,clearcoat_normal_fragment_maps:cp,clearcoat_pars_fragment:hp,iridescence_pars_fragment:dp,opaque_fragment:up,packing:fp,premultiplied_alpha_fragment:pp,project_vertex:mp,dithering_fragment:gp,dithering_pars_fragment:xp,roughnessmap_fragment:yp,roughnessmap_pars_fragment:vp,shadowmap_pars_fragment:_p,shadowmap_pars_vertex:Mp,shadowmap_vertex:Sp,shadowmask_pars_fragment:bp,skinbase_vertex:wp,skinning_pars_vertex:Ep,skinning_vertex:Tp,skinnormal_vertex:Ap,specularmap_fragment:Cp,specularmap_pars_fragment:Rp,tonemapping_fragment:Ip,tonemapping_pars_fragment:Pp,transmission_fragment:Lp,transmission_pars_fragment:Dp,uv_pars_fragment:Np,uv_pars_vertex:Up,uv_vertex:Fp,worldpos_vertex:Bp,background_vert:zp,background_frag:Op,backgroundCube_vert:kp,backgroundCube_frag:Hp,cube_vert:Gp,cube_frag:Vp,depth_vert:Wp,depth_frag:Xp,distance_vert:qp,distance_frag:Yp,equirect_vert:$p,equirect_frag:Zp,linedashed_vert:Qp,linedashed_frag:Jp,meshbasic_vert:Kp,meshbasic_frag:jp,meshlambert_vert:tm,meshlambert_frag:em,meshmatcap_vert:im,meshmatcap_frag:nm,meshnormal_vert:sm,meshnormal_frag:rm,meshphong_vert:om,meshphong_frag:am,meshphysical_vert:lm,meshphysical_frag:cm,meshtoon_vert:hm,meshtoon_frag:dm,points_vert:um,points_frag:fm,shadow_vert:pm,shadow_frag:mm,sprite_vert:gm,sprite_frag:xm},Mt={common:{diffuse:{value:new ft(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Yt},alphaMap:{value:null},alphaMapTransform:{value:new Yt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Yt}},envmap:{envMap:{value:null},envMapRotation:{value:new Yt},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Yt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Yt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Yt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Yt},normalScale:{value:new Zt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Yt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Yt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Yt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Yt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new ft(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new k},probesMax:{value:new k},probesResolution:{value:new k}},points:{diffuse:{value:new ft(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Yt},alphaTest:{value:0},uvTransform:{value:new Yt}},sprite:{diffuse:{value:new ft(16777215)},opacity:{value:1},center:{value:new Zt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Yt},alphaMap:{value:null},alphaMapTransform:{value:new Yt},alphaTest:{value:0}}},Zi={basic:{uniforms:ti([Mt.common,Mt.specularmap,Mt.envmap,Mt.aomap,Mt.lightmap,Mt.fog]),vertexShader:te.meshbasic_vert,fragmentShader:te.meshbasic_frag},lambert:{uniforms:ti([Mt.common,Mt.specularmap,Mt.envmap,Mt.aomap,Mt.lightmap,Mt.emissivemap,Mt.bumpmap,Mt.normalmap,Mt.displacementmap,Mt.fog,Mt.lights,{emissive:{value:new ft(0)},envMapIntensity:{value:1}}]),vertexShader:te.meshlambert_vert,fragmentShader:te.meshlambert_frag},phong:{uniforms:ti([Mt.common,Mt.specularmap,Mt.envmap,Mt.aomap,Mt.lightmap,Mt.emissivemap,Mt.bumpmap,Mt.normalmap,Mt.displacementmap,Mt.fog,Mt.lights,{emissive:{value:new ft(0)},specular:{value:new ft(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:te.meshphong_vert,fragmentShader:te.meshphong_frag},standard:{uniforms:ti([Mt.common,Mt.envmap,Mt.aomap,Mt.lightmap,Mt.emissivemap,Mt.bumpmap,Mt.normalmap,Mt.displacementmap,Mt.roughnessmap,Mt.metalnessmap,Mt.fog,Mt.lights,{emissive:{value:new ft(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:te.meshphysical_vert,fragmentShader:te.meshphysical_frag},toon:{uniforms:ti([Mt.common,Mt.aomap,Mt.lightmap,Mt.emissivemap,Mt.bumpmap,Mt.normalmap,Mt.displacementmap,Mt.gradientmap,Mt.fog,Mt.lights,{emissive:{value:new ft(0)}}]),vertexShader:te.meshtoon_vert,fragmentShader:te.meshtoon_frag},matcap:{uniforms:ti([Mt.common,Mt.bumpmap,Mt.normalmap,Mt.displacementmap,Mt.fog,{matcap:{value:null}}]),vertexShader:te.meshmatcap_vert,fragmentShader:te.meshmatcap_frag},points:{uniforms:ti([Mt.points,Mt.fog]),vertexShader:te.points_vert,fragmentShader:te.points_frag},dashed:{uniforms:ti([Mt.common,Mt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:te.linedashed_vert,fragmentShader:te.linedashed_frag},depth:{uniforms:ti([Mt.common,Mt.displacementmap]),vertexShader:te.depth_vert,fragmentShader:te.depth_frag},normal:{uniforms:ti([Mt.common,Mt.bumpmap,Mt.normalmap,Mt.displacementmap,{opacity:{value:1}}]),vertexShader:te.meshnormal_vert,fragmentShader:te.meshnormal_frag},sprite:{uniforms:ti([Mt.sprite,Mt.fog]),vertexShader:te.sprite_vert,fragmentShader:te.sprite_frag},background:{uniforms:{uvTransform:{value:new Yt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:te.background_vert,fragmentShader:te.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Yt}},vertexShader:te.backgroundCube_vert,fragmentShader:te.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:te.cube_vert,fragmentShader:te.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:te.equirect_vert,fragmentShader:te.equirect_frag},distance:{uniforms:ti([Mt.common,Mt.displacementmap,{referencePosition:{value:new k},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:te.distance_vert,fragmentShader:te.distance_frag},shadow:{uniforms:ti([Mt.lights,Mt.fog,{color:{value:new ft(0)},opacity:{value:1}}]),vertexShader:te.shadow_vert,fragmentShader:te.shadow_frag}};Zi.physical={uniforms:ti([Zi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Yt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Yt},clearcoatNormalScale:{value:new Zt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Yt},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Yt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Yt},sheen:{value:0},sheenColor:{value:new ft(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Yt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Yt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Yt},transmissionSamplerSize:{value:new Zt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Yt},attenuationDistance:{value:0},attenuationColor:{value:new ft(0)},specularColor:{value:new ft(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Yt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Yt},anisotropyVector:{value:new Zt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Yt}}]),vertexShader:te.meshphysical_vert,fragmentShader:te.meshphysical_frag};var Sa={r:0,b:0,g:0},ym=new ue,Td=new Yt;Td.set(-1,0,0,0,1,0,0,0,1);function vm(r,t,e,i,n,s){let o=new ft(0),a=n===!0?0:1,c,l,h=null,u=0,d=null;function f(_){let M=_.isScene===!0?_.background:null;if(M&&M.isTexture){let v=_.backgroundBlurriness>0;M=t.get(M,v)}return M}function g(_){let M=!1,v=f(_);v===null?p(o,a):v&&v.isColor&&(p(v,1),M=!0);let w=r.xr.getEnvironmentBlendMode();w==="additive"?e.buffers.color.setClear(0,0,0,1,s):w==="alpha-blend"&&e.buffers.color.setClear(0,0,0,0,s),(r.autoClear||M)&&(e.buffers.depth.setTest(!0),e.buffers.depth.setMask(!0),e.buffers.color.setMask(!0),r.clear(r.autoClearColor,r.autoClearDepth,r.autoClearStencil))}function y(_,M){let v=f(M);v&&(v.isCubeTexture||v.mapping===lr)?(l===void 0&&(l=new wt(new Vt(1,1,1),new Oe({name:"BackgroundCubeMaterial",uniforms:Wn(Zi.backgroundCube.uniforms),vertexShader:Zi.backgroundCube.vertexShader,fragmentShader:Zi.backgroundCube.fragmentShader,side:si,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),l.geometry.deleteAttribute("uv"),l.onBeforeRender=function(w,S,T){this.matrixWorld.copyPosition(T.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(l)),l.material.uniforms.envMap.value=v,l.material.uniforms.backgroundBlurriness.value=M.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(ym.makeRotationFromEuler(M.backgroundRotation)).transpose(),v.isCubeTexture&&v.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(Td),l.material.toneMapped=se.getTransfer(v.colorSpace)!==ge,(h!==v||u!==v.version||d!==r.toneMapping)&&(l.material.needsUpdate=!0,h=v,u=v.version,d=r.toneMapping),l.layers.enableAll(),_.unshift(l,l.geometry,l.material,0,0,null)):v&&v.isTexture&&(c===void 0&&(c=new wt(new Ks(2,2),new Oe({name:"BackgroundMaterial",uniforms:Wn(Zi.background.uniforms),vertexShader:Zi.background.vertexShader,fragmentShader:Zi.background.fragmentShader,side:Xi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(c)),c.material.uniforms.t2D.value=v,c.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,c.material.toneMapped=se.getTransfer(v.colorSpace)!==ge,v.matrixAutoUpdate===!0&&v.updateMatrix(),c.material.uniforms.uvTransform.value.copy(v.matrix),(h!==v||u!==v.version||d!==r.toneMapping)&&(c.material.needsUpdate=!0,h=v,u=v.version,d=r.toneMapping),c.layers.enableAll(),_.unshift(c,c.geometry,c.material,0,0,null))}function p(_,M){_.getRGB(Sa,Jl(r)),e.buffers.color.setClear(Sa.r,Sa.g,Sa.b,M,s)}function m(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(_,M=1){o.set(_),a=M,p(o,a)},getClearAlpha:function(){return a},setClearAlpha:function(_){a=_,p(o,a)},render:g,addToRenderList:y,dispose:m}}function _m(r,t){let e=r.getParameter(r.MAX_VERTEX_ATTRIBS),i={},n=d(null),s=n,o=!1;function a(R,L,D,I,F){let z=!1,G=u(R,I,D,L);s!==G&&(s=G,l(s.object)),z=f(R,I,D,F),z&&g(R,I,D,F),F!==null&&t.update(F,r.ELEMENT_ARRAY_BUFFER),(z||o)&&(o=!1,v(R,L,D,I),F!==null&&r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,t.get(F).buffer))}function c(){return r.createVertexArray()}function l(R){return r.bindVertexArray(R)}function h(R){return r.deleteVertexArray(R)}function u(R,L,D,I){let F=I.wireframe===!0,z=i[L.id];z===void 0&&(z={},i[L.id]=z);let G=R.isInstancedMesh===!0?R.id:0,K=z[G];K===void 0&&(K={},z[G]=K);let N=K[D.id];N===void 0&&(N={},K[D.id]=N);let $=N[F];return $===void 0&&($=d(c()),N[F]=$),$}function d(R){let L=[],D=[],I=[];for(let F=0;F<e;F++)L[F]=0,D[F]=0,I[F]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:L,enabledAttributes:D,attributeDivisors:I,object:R,attributes:{},index:null}}function f(R,L,D,I){let F=s.attributes,z=L.attributes,G=0,K=D.getAttributes();for(let N in K)if(K[N].location>=0){let Q=F[N],ot=z[N];if(ot===void 0&&(N==="instanceMatrix"&&R.instanceMatrix&&(ot=R.instanceMatrix),N==="instanceColor"&&R.instanceColor&&(ot=R.instanceColor)),Q===void 0||Q.attribute!==ot||ot&&Q.data!==ot.data)return!0;G++}return s.attributesNum!==G||s.index!==I}function g(R,L,D,I){let F={},z=L.attributes,G=0,K=D.getAttributes();for(let N in K)if(K[N].location>=0){let Q=z[N];Q===void 0&&(N==="instanceMatrix"&&R.instanceMatrix&&(Q=R.instanceMatrix),N==="instanceColor"&&R.instanceColor&&(Q=R.instanceColor));let ot={};ot.attribute=Q,Q&&Q.data&&(ot.data=Q.data),F[N]=ot,G++}s.attributes=F,s.attributesNum=G,s.index=I}function y(){let R=s.newAttributes;for(let L=0,D=R.length;L<D;L++)R[L]=0}function p(R){m(R,0)}function m(R,L){let D=s.newAttributes,I=s.enabledAttributes,F=s.attributeDivisors;D[R]=1,I[R]===0&&(r.enableVertexAttribArray(R),I[R]=1),F[R]!==L&&(r.vertexAttribDivisor(R,L),F[R]=L)}function _(){let R=s.newAttributes,L=s.enabledAttributes;for(let D=0,I=L.length;D<I;D++)L[D]!==R[D]&&(r.disableVertexAttribArray(D),L[D]=0)}function M(R,L,D,I,F,z,G){G===!0?r.vertexAttribIPointer(R,L,D,F,z):r.vertexAttribPointer(R,L,D,I,F,z)}function v(R,L,D,I){y();let F=I.attributes,z=D.getAttributes(),G=L.defaultAttributeValues;for(let K in z){let N=z[K];if(N.location>=0){let $=F[K];if($===void 0&&(K==="instanceMatrix"&&R.instanceMatrix&&($=R.instanceMatrix),K==="instanceColor"&&R.instanceColor&&($=R.instanceColor)),$!==void 0){let Q=$.normalized,ot=$.itemSize,st=t.get($);if(st===void 0)continue;let It=st.buffer,ut=st.type,Pt=st.bytesPerElement,q=ut===r.INT||ut===r.UNSIGNED_INT||$.gpuType===Bo;if($.isInterleavedBufferAttribute){let Y=$.data,ct=Y.stride,vt=$.offset;if(Y.isInstancedInterleavedBuffer){for(let lt=0;lt<N.locationSize;lt++)m(N.location+lt,Y.meshPerAttribute);R.isInstancedMesh!==!0&&I._maxInstanceCount===void 0&&(I._maxInstanceCount=Y.meshPerAttribute*Y.count)}else for(let lt=0;lt<N.locationSize;lt++)p(N.location+lt);r.bindBuffer(r.ARRAY_BUFFER,It);for(let lt=0;lt<N.locationSize;lt++)M(N.location+lt,ot/N.locationSize,ut,Q,ct*Pt,(vt+ot/N.locationSize*lt)*Pt,q)}else{if($.isInstancedBufferAttribute){for(let Y=0;Y<N.locationSize;Y++)m(N.location+Y,$.meshPerAttribute);R.isInstancedMesh!==!0&&I._maxInstanceCount===void 0&&(I._maxInstanceCount=$.meshPerAttribute*$.count)}else for(let Y=0;Y<N.locationSize;Y++)p(N.location+Y);r.bindBuffer(r.ARRAY_BUFFER,It);for(let Y=0;Y<N.locationSize;Y++)M(N.location+Y,ot/N.locationSize,ut,Q,ot*Pt,ot/N.locationSize*Y*Pt,q)}}else if(G!==void 0){let Q=G[K];if(Q!==void 0)switch(Q.length){case 2:r.vertexAttrib2fv(N.location,Q);break;case 3:r.vertexAttrib3fv(N.location,Q);break;case 4:r.vertexAttrib4fv(N.location,Q);break;default:r.vertexAttrib1fv(N.location,Q)}}}}_()}function w(){E();for(let R in i){let L=i[R];for(let D in L){let I=L[D];for(let F in I){let z=I[F];for(let G in z)h(z[G].object),delete z[G];delete I[F]}}delete i[R]}}function S(R){if(i[R.id]===void 0)return;let L=i[R.id];for(let D in L){let I=L[D];for(let F in I){let z=I[F];for(let G in z)h(z[G].object),delete z[G];delete I[F]}}delete i[R.id]}function T(R){for(let L in i){let D=i[L];for(let I in D){let F=D[I];if(F[R.id]===void 0)continue;let z=F[R.id];for(let G in z)h(z[G].object),delete z[G];delete F[R.id]}}}function x(R){for(let L in i){let D=i[L],I=R.isInstancedMesh===!0?R.id:0,F=D[I];if(F!==void 0){for(let z in F){let G=F[z];for(let K in G)h(G[K].object),delete G[K];delete F[z]}delete D[I],Object.keys(D).length===0&&delete i[L]}}}function E(){C(),o=!0,s!==n&&(s=n,l(s.object))}function C(){n.geometry=null,n.program=null,n.wireframe=!1}return{setup:a,reset:E,resetDefaultState:C,dispose:w,releaseStatesOfGeometry:S,releaseStatesOfObject:x,releaseStatesOfProgram:T,initAttributes:y,enableAttribute:p,disableUnusedAttributes:_}}function Mm(r,t,e){let i;function n(c){i=c}function s(c,l){r.drawArrays(i,c,l),e.update(l,i,1)}function o(c,l,h){h!==0&&(r.drawArraysInstanced(i,c,l,h),e.update(l,i,h))}function a(c,l,h){if(h===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,c,0,l,0,h);let d=0;for(let f=0;f<h;f++)d+=l[f];e.update(d,i,1)}this.setMode=n,this.render=s,this.renderInstances=o,this.renderMultiDraw=a}function Sm(r,t,e,i){let n;function s(){if(n!==void 0)return n;if(t.has("EXT_texture_filter_anisotropic")===!0){let T=t.get("EXT_texture_filter_anisotropic");n=r.getParameter(T.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else n=0;return n}function o(T){return!(T!==ri&&i.convert(T)!==r.getParameter(r.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(T){let x=T===Li&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(T!==li&&T!==Si&&!x&&i.convert(T)!==r.getParameter(r.IMPLEMENTATION_COLOR_READ_TYPE))}function c(T){if(T==="highp"){if(r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.HIGH_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.HIGH_FLOAT).precision>0)return"highp";T="mediump"}return T==="mediump"&&r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.MEDIUM_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=e.precision!==void 0?e.precision:"highp",h=c(l);h!==l&&(Gt("WebGLRenderer:",l,"not supported, using",h,"instead."),l=h);let u=e.logarithmicDepthBuffer===!0,d=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control");e.reversedDepthBuffer===!0&&d===!1&&Gt("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let f=r.getParameter(r.MAX_TEXTURE_IMAGE_UNITS),g=r.getParameter(r.MAX_VERTEX_TEXTURE_IMAGE_UNITS),y=r.getParameter(r.MAX_TEXTURE_SIZE),p=r.getParameter(r.MAX_CUBE_MAP_TEXTURE_SIZE),m=r.getParameter(r.MAX_VERTEX_ATTRIBS),_=r.getParameter(r.MAX_VERTEX_UNIFORM_VECTORS),M=r.getParameter(r.MAX_VARYING_VECTORS),v=r.getParameter(r.MAX_FRAGMENT_UNIFORM_VECTORS),w=r.getParameter(r.MAX_SAMPLES),S=r.getParameter(r.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:a,precision:l,logarithmicDepthBuffer:u,reversedDepthBuffer:d,maxTextures:f,maxVertexTextures:g,maxTextureSize:y,maxCubemapSize:p,maxAttributes:m,maxVertexUniforms:_,maxVaryings:M,maxFragmentUniforms:v,maxSamples:w,samples:S}}function bm(r){let t=this,e=null,i=0,n=!1,s=!1,o=new Ci,a=new Yt,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){let f=u.length!==0||d||i!==0||n;return n=d,i=u.length,f},this.beginShadows=function(){s=!0,h(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(u,d){e=h(u,d,0)},this.setState=function(u,d,f){let g=u.clippingPlanes,y=u.clipIntersection,p=u.clipShadows,m=r.get(u);if(!n||g===null||g.length===0||s&&!p)s?h(null):l();else{let _=s?0:i,M=_*4,v=m.clippingState||null;c.value=v,v=h(g,d,M,f);for(let w=0;w!==M;++w)v[w]=e[w];m.clippingState=v,this.numIntersection=y?this.numPlanes:0,this.numPlanes+=_}};function l(){c.value!==e&&(c.value=e,c.needsUpdate=i>0),t.numPlanes=i,t.numIntersection=0}function h(u,d,f,g){let y=u!==null?u.length:0,p=null;if(y!==0){if(p=c.value,g!==!0||p===null){let m=f+y*4,_=d.matrixWorldInverse;a.getNormalMatrix(_),(p===null||p.length<m)&&(p=new Float32Array(m));for(let M=0,v=f;M!==y;++M,v+=4)o.copy(u[M]).applyMatrix4(_,a),o.normal.toArray(p,v),p[v+3]=o.constant}c.value=p,c.needsUpdate=!0}return t.numPlanes=y,t.numIntersection=0,p}}var Ts=4,wm=6,Em=20,Tm=256,xr=new _s,sd=new ft,oc=null,ac=0,lc=0,cc=!1,Am=new k,Xn=new k,wa=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(t,e=0,i=.1,n=100,s={}){let{size:o=256,position:a=Am}=s;oc=this._renderer.getRenderTarget(),ac=this._renderer.getActiveCubeFace(),lc=this._renderer.getActiveMipmapLevel(),cc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);let c=this._allocateTargets();return c.depthBuffer=!0,this._sceneToCubeUV(t,i,n,c,a),e>0&&this._blur(c,0,0,e),this._applyPMREM(c),this._cleanup(c),c}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=ad(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=od(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodMeshes.length;t++)this._lodMeshes[t].geometry.dispose()}_cleanup(t){this._renderer.setRenderTarget(oc,ac,lc),this._renderer.xr.enabled=cc,t.scissorTest=!1,Es(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===En||t.mapping===Vn?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),oc=this._renderer.getRenderTarget(),ac=this._renderer.getActiveCubeFace(),lc=this._renderer.getActiveMipmapLevel(),cc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=e||this._allocateTargets();return this._textureToCubeUV(t,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,i={magFilter:ke,minFilter:ke,generateMipmaps:!1,type:Li,format:ri,colorSpace:Os,depthBuffer:!1},n=rd(t,e,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=rd(t,e,i);let{_lodMax:s}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=Cm(s)),this._blurMaterial=Im(s,t,e),this._ggxMaterial=Rm(s,t,e)}return n}_compileMaterial(t){let e=new wt(new xe,t);this._renderer.compile(e,xr)}_sceneToCubeUV(t,e,i,n,s){let c=new Ke(90,1,e,i),l=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],u=this._renderer,d=u.autoClear,f=u.toneMapping;u.getClearColor(sd),u.toneMapping=Ii,u.autoClear=!1,u.state.buffers.depth.getReversed()&&(u.setRenderTarget(n),u.clearDepth(),u.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new wt(new Vt,new be({name:"PMREM.Background",side:si,depthWrite:!1,depthTest:!1})));let y=this._backgroundBox,p=y.material,m=!1,_=t.background;_?_.isColor&&(p.color.copy(_),t.background=null,m=!0):(p.color.copy(sd),m=!0);for(let M=0;M<6;M++){let v=M%3;v===0?(c.up.set(0,l[M],0),c.position.set(s.x,s.y,s.z),c.lookAt(s.x+h[M],s.y,s.z)):v===1?(c.up.set(0,0,l[M]),c.position.set(s.x,s.y,s.z),c.lookAt(s.x,s.y+h[M],s.z)):(c.up.set(0,l[M],0),c.position.set(s.x,s.y,s.z),c.lookAt(s.x,s.y,s.z+h[M]));let w=this._cubeSize;Es(n,v*w,M>2?w:0,w,w),u.setRenderTarget(n),m&&u.render(y,c),u.render(t,c)}u.toneMapping=f,u.autoClear=d,t.background=_}_textureToCubeUV(t,e){let i=this._renderer,n=t.mapping===En||t.mapping===Vn;n?(this._cubemapMaterial===null&&(this._cubemapMaterial=ad()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=od());let s=n?this._cubemapMaterial:this._equirectMaterial,o=this._lodMeshes[0];o.material=s;let a=s.uniforms;a.envMap.value=t;let c=this._cubeSize;Es(e,0,0,3*c,2*c),i.setRenderTarget(e),i.render(o,xr)}_applyPMREM(t){let e=this._renderer,i=e.autoClear;e.autoClear=!1;let n=this._lodMeshes.length;for(let s=1;s<n;s++)this._applyGGXFilter(t,s-1,s);e.autoClear=i}_applyGGXFilter(t,e,i){let n=this._renderer,s=this._pingPongRenderTarget,o=this._ggxMaterial,a=this._lodMeshes[i];a.material=o;let c=o.uniforms,l=i/(this._lodMeshes.length-1),h=e/(this._lodMeshes.length-1),u=Math.sqrt(l*l-h*h),d=l*1.25,f=u*d,{_lodMax:g}=this,y=this._sizeLods[i],p=3*y*(i>g-Ts?i-g+Ts:0),m=4*(this._cubeSize-y);c.envMap.value=t.texture,c.roughness.value=f,c.mipInt.value=g-e,Es(s,p,m,3*y,2*y),n.setRenderTarget(s),n.render(a,xr),c.envMap.value=s.texture,c.roughness.value=0,c.mipInt.value=g-i,Es(t,p,m,3*y,2*y),n.setRenderTarget(t),n.render(a,xr)}_blur(t,e,i,n){let s=this._pingPongRenderTarget,o=Math.min(n,Math.PI)/Math.SQRT2;this._blurPass(t,s,e,i,o),this._blurPass(s,t,i,i,o)}_blurPass(t,e,i,n,s){let o=this._renderer,a=this._blurMaterial,c=this._lodMeshes[n];c.material=a;let l=a.uniforms;l.envMap.value=t.texture,l.sigma.value=s,l.mipInt.value=this._lodMax-i;let h=this._sizeLods[n],u=3*h*(n>this._lodMax-Ts?n-this._lodMax+Ts:0),d=4*(this._cubeSize-h);Es(e,u,d,3*h,2*h),o.setRenderTarget(e),o.render(c,xr)}};function Cm(r){let t=[],e=[],i=r,n=r-Ts+1+wm;for(let s=0;s<n;s++){let o=Math.pow(2,i);t.push(o);let a=1/(o-2),c=-a,l=1+a,h=[c,c,l,c,l,l,c,c,l,l,c,l],u=6,d=6,f=3,g=new Float32Array(f*d*u),y=new Float32Array(f*d*u);for(let m=0;m<u;m++){let _=m%3*2/3-1,M=m>2?0:-1,v=[_,M,0,_+2/3,M,0,_+2/3,M+1,0,_,M,0,_+2/3,M+1,0,_,M+1,0];g.set(v,f*d*m);for(let w=0;w<d;w++){let S=h[w*2]*2-1,T=h[w*2+1]*2-1;m===0?Xn.set(1,T,S):m===1?Xn.set(-S,1,-T):m===2?Xn.set(-S,T,1):m===3?Xn.set(-1,T,-S):m===4?Xn.set(-S,-1,T):Xn.set(S,T,-1),Xn.toArray(y,(m*d+w)*f)}}let p=new xe;p.setAttribute("position",new he(g,f)),p.setAttribute("outputDirection",new he(y,f)),e.push(new wt(p,null)),i>Ts&&i--}return{lodMeshes:e,sizeLods:t}}function rd(r,t,e){let i=new ai(r,t,e);return i.texture.mapping=lr,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Es(r,t,e,i,n){r.viewport.set(t,e,i,n),r.scissor.set(t,e,i,n)}function Rm(r,t,e){return new Oe({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:Tm,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${r}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Aa(),fragmentShader:`

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
		`,blending:qi,depthTest:!1,depthWrite:!1})}function Im(r,t,e){return new Oe({name:"SphericalGaussianBlur",defines:{SAMPLES:Em,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${r}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:Aa(),fragmentShader:`

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
		`,blending:qi,depthTest:!1,depthWrite:!1})}function od(){return new Oe({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Aa(),fragmentShader:`

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
		`,blending:qi,depthTest:!1,depthWrite:!1})}function ad(){return new Oe({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Aa(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:qi,depthTest:!1,depthWrite:!1})}function Aa(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var Ea=class extends ai{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let i={width:t,height:t,depth:1},n=[i,i,i,i,i,i];this.texture=new Ys(n),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},n=new Vt(5,5,5),s=new Oe({name:"CubemapFromEquirect",uniforms:Wn(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:si,blending:qi});s.uniforms.tEquirect.value=e;let o=new wt(n,s),a=e.minFilter;return e.minFilter===Yi&&(e.minFilter=ke),new Po(1,10,this).update(t,o),e.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(t,e=!0,i=!0,n=!0){let s=t.getRenderTarget();for(let o=0;o<6;o++)t.setRenderTarget(this,o),t.clear(e,i,n);t.setRenderTarget(s)}};function Pm(r){let t=new WeakMap,e=new WeakMap,i=null;function n(d,f=!1){return d==null?null:f?o(d):s(d)}function s(d){if(d&&d.isTexture){let f=d.mapping;if(f===No||f===Uo)if(t.has(d)){let g=t.get(d).texture;return a(g,d.mapping)}else{let g=d.image;if(g&&g.height>0){let y=new Ea(g.height);return y.fromEquirectangularTexture(r,d),t.set(d,y),d.addEventListener("dispose",l),a(y.texture,d.mapping)}else return null}}return d}function o(d){if(d&&d.isTexture){let f=d.mapping,g=f===No||f===Uo,y=f===En||f===Vn;if(g||y){let p=e.get(d),m=p!==void 0?p.texture.pmremVersion:0;if(d.isRenderTargetTexture&&d.pmremVersion!==m)return i===null&&(i=new wa(r)),p=g?i.fromEquirectangular(d,p):i.fromCubemap(d,p),p.texture.pmremVersion=d.pmremVersion,e.set(d,p),p.texture;if(p!==void 0)return p.texture;{let _=d.image;return g&&_&&_.height>0||y&&_&&c(_)?(i===null&&(i=new wa(r)),p=g?i.fromEquirectangular(d):i.fromCubemap(d),p.texture.pmremVersion=d.pmremVersion,e.set(d,p),d.addEventListener("dispose",h),p.texture):null}}}return d}function a(d,f){return f===No?d.mapping=En:f===Uo&&(d.mapping=Vn),d}function c(d){let f=0,g=6;for(let y=0;y<g;y++)d[y]!==void 0&&f++;return f===g}function l(d){let f=d.target;f.removeEventListener("dispose",l);let g=t.get(f);g!==void 0&&(t.delete(f),g.dispose())}function h(d){let f=d.target;f.removeEventListener("dispose",h);let g=e.get(f);g!==void 0&&(e.delete(f),g.dispose())}function u(){t=new WeakMap,e=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:n,dispose:u}}function Lm(r){let t={};function e(i){if(t[i]!==void 0)return t[i];let n=r.getExtension(i);return t[i]=n,n}return{has:function(i){return e(i)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(i){let n=e(i);return n===null&&Fn("WebGLRenderer: "+i+" extension not supported."),n}}}function Dm(r,t,e,i){let n={},s=new WeakMap;function o(u){let d=u.target;d.index!==null&&t.remove(d.index);for(let g in d.attributes)t.remove(d.attributes[g]);d.removeEventListener("dispose",o),delete n[d.id];let f=s.get(d);f&&(t.remove(f),s.delete(d)),i.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,e.memory.geometries--}function a(u,d){return n[d.id]===!0||(d.addEventListener("dispose",o),n[d.id]=!0,e.memory.geometries++),d}function c(u){let d=u.attributes;for(let f in d)t.update(d[f],r.ARRAY_BUFFER)}function l(u){let d=[],f=u.index,g=u.attributes.position,y=0;if(g===void 0)return;if(f!==null){let _=f.array;y=f.version;for(let M=0,v=_.length;M<v;M+=3){let w=_[M+0],S=_[M+1],T=_[M+2];d.push(w,S,S,T,T,w)}}else{let _=g.array;y=g.version;for(let M=0,v=_.length/3-1;M<v;M+=3){let w=M+0,S=M+1,T=M+2;d.push(w,S,S,T,T,w)}}let p=new(g.count>=65535?Xs:Ws)(d,1);p.version=y;let m=s.get(u);m&&t.remove(m),s.set(u,p)}function h(u){let d=s.get(u);if(d){let f=u.index;f!==null&&d.version<f.version&&l(u)}else l(u);return s.get(u)}return{get:a,update:c,getWireframeAttribute:h}}function Nm(r,t,e){let i;function n(u){i=u}let s,o;function a(u){s=u.type,o=u.bytesPerElement}function c(u,d){r.drawElements(i,d,s,u*o),e.update(d,i,1)}function l(u,d,f){f!==0&&(r.drawElementsInstanced(i,d,s,u*o,f),e.update(d,i,f))}function h(u,d,f){if(f===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,d,0,s,u,0,f);let y=0;for(let p=0;p<f;p++)y+=d[p];e.update(y,i,1)}this.setMode=n,this.setIndex=a,this.render=c,this.renderInstances=l,this.renderMultiDraw=h}function Um(r){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function i(s,o,a){switch(e.calls++,o){case r.TRIANGLES:e.triangles+=a*(s/3);break;case r.LINES:e.lines+=a*(s/2);break;case r.LINE_STRIP:e.lines+=a*(s-1);break;case r.LINE_LOOP:e.lines+=a*s;break;case r.POINTS:e.points+=a*s;break;default:Wt("WebGLInfo: Unknown draw mode:",o);break}}function n(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:n,update:i}}function Fm(r,t,e){let i=new WeakMap,n=new Pe;function s(o,a,c){let l=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,u=h!==void 0?h.length:0,d=i.get(a);if(d===void 0||d.count!==u){let E=function(){T.dispose(),i.delete(a),a.removeEventListener("dispose",E)};d!==void 0&&d.texture.dispose();let f=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,y=a.morphAttributes.color!==void 0,p=a.morphAttributes.position||[],m=a.morphAttributes.normal||[],_=a.morphAttributes.color||[],M=0;f===!0&&(M=1),g===!0&&(M=2),y===!0&&(M=3);let v=a.attributes.position.count*M,w=1;v>t.maxTextureSize&&(w=Math.ceil(v/t.maxTextureSize),v=t.maxTextureSize);let S=new Float32Array(v*w*4*u),T=new Gs(S,v,w,u);T.type=Si,T.needsUpdate=!0;let x=M*4;for(let C=0;C<u;C++){let R=p[C],L=m[C],D=_[C],I=v*w*4*C;for(let F=0;F<R.count;F++){let z=F*x;f===!0&&(n.fromBufferAttribute(R,F),S[I+z+0]=n.x,S[I+z+1]=n.y,S[I+z+2]=n.z,S[I+z+3]=0),g===!0&&(n.fromBufferAttribute(L,F),S[I+z+4]=n.x,S[I+z+5]=n.y,S[I+z+6]=n.z,S[I+z+7]=0),y===!0&&(n.fromBufferAttribute(D,F),S[I+z+8]=n.x,S[I+z+9]=n.y,S[I+z+10]=n.z,S[I+z+11]=D.itemSize===4?n.w:1)}}d={count:u,texture:T,size:new Zt(v,w)},i.set(a,d),a.addEventListener("dispose",E)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)c.getUniforms().setValue(r,"morphTexture",o.morphTexture,e);else{let f=0;for(let y=0;y<l.length;y++)f+=l[y];let g=a.morphTargetsRelative?1:1-f;c.getUniforms().setValue(r,"morphTargetBaseInfluence",g),c.getUniforms().setValue(r,"morphTargetInfluences",l)}c.getUniforms().setValue(r,"morphTargetsTexture",d.texture,e),c.getUniforms().setValue(r,"morphTargetsTextureSize",d.size)}return{update:s}}function Bm(r,t,e,i,n){let s=new WeakMap;function o(l){let h=n.render.frame,u=l.geometry,d=t.get(l,u);if(s.get(d)!==h&&(t.update(d),s.set(d,h)),l.isInstancedMesh&&(l.hasEventListener("dispose",c)===!1&&l.addEventListener("dispose",c),s.get(l)!==h&&(e.update(l.instanceMatrix,r.ARRAY_BUFFER),l.instanceColor!==null&&e.update(l.instanceColor,r.ARRAY_BUFFER),s.set(l,h))),l.isSkinnedMesh){let f=l.skeleton;s.get(f)!==h&&(f.update(),s.set(f,h))}return d}function a(){s=new WeakMap}function c(l){let h=l.target;h.removeEventListener("dispose",c),i.releaseStatesOfObject(h),e.remove(h.instanceMatrix),h.instanceColor!==null&&e.remove(h.instanceColor)}return{update:o,dispose:a}}var zm={[Ul]:"LINEAR_TONE_MAPPING",[Fl]:"REINHARD_TONE_MAPPING",[Bl]:"CINEON_TONE_MAPPING",[zl]:"ACES_FILMIC_TONE_MAPPING",[kl]:"AGX_TONE_MAPPING",[Hl]:"NEUTRAL_TONE_MAPPING",[Ol]:"CUSTOM_TONE_MAPPING"};function Om(r,t,e,i,n,s){let o=new ai(t,e,{type:r,depthBuffer:n,stencilBuffer:s,samples:i?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),a=null,c=null,l=new xe;l.setAttribute("position",new ee([-1,3,0,-1,-1,0,3,-1,0],3)),l.setAttribute("uv",new ee([0,2,0,0,2,0],2));let h=new xo({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),u=new wt(l,h),d=new _s(-1,1,1,-1,0,1),f=null,g=null,y=!1,p,m=null,_=[],M=!1;this.setSize=function(v,w){o.setSize(v,w),a!==null&&a.setSize(v,w),c!==null&&c.setSize(v,w);for(let S=0;S<_.length;S++){let T=_[S];T.setSize&&T.setSize(v,w)}},this.setEffects=function(v){_=v,M=_.length>0&&_[0].isRenderPass===!0;let w=o.width,S=o.height;_.length>0&&a===null&&(a=new ai(w,S,{type:Li,depthBuffer:!1,stencilBuffer:!1}),c=new ai(w,S,{type:Li,depthBuffer:!1,stencilBuffer:!1}));for(let T=0;T<_.length;T++){let x=_[T];x.setSize&&x.setSize(w,S)}},this.begin=function(v,w){if(y||v.toneMapping===Ii&&_.length===0)return!1;if(m=w,w!==null){let S=w.width,T=w.height;(o.width!==S||o.height!==T)&&this.setSize(S,T)}return M===!1&&v.setRenderTarget(o),p=v.toneMapping,v.toneMapping=Ii,!0},this.hasRenderPass=function(){return M},this.end=function(v,w){v.toneMapping=p,y=!0;let S=o,T=a;for(let x=0;x<_.length;x++){let E=_[x];E.enabled!==!1&&(E.render(v,T,S,w),E.needsSwap!==!1&&(S=T,T=T===a?c:a))}if(f!==v.outputColorSpace||g!==v.toneMapping){f=v.outputColorSpace,g=v.toneMapping,h.defines={},se.getTransfer(f)===ge&&(h.defines.SRGB_TRANSFER="");let x=zm[g];x&&(h.defines[x]=""),h.needsUpdate=!0}h.uniforms.tDiffuse.value=S.texture,v.setRenderTarget(m),v.render(u,d),m=null,y=!1},this.isCompositing=function(){return y},this.dispose=function(){o.dispose(),a!==null&&a.dispose(),c!==null&&c.dispose(),l.dispose(),h.dispose()}}var Ad=new ni,uc=new yn(1,1),Cd=new Gs,Rd=new ho,Id=new Ys,ld=[],cd=[],hd=new Float32Array(16),dd=new Float32Array(9),ud=new Float32Array(4);function Cs(r,t,e){let i=r[0];if(i<=0||i>0)return r;let n=t*e,s=ld[n];if(s===void 0&&(s=new Float32Array(n),ld[n]=s),t!==0){i.toArray(s,0);for(let o=1,a=0;o!==t;++o)a+=e,r[o].toArray(s,a)}return s}function He(r,t){if(r.length!==t.length)return!1;for(let e=0,i=r.length;e<i;e++)if(r[e]!==t[e])return!1;return!0}function Ge(r,t){for(let e=0,i=t.length;e<i;e++)r[e]=t[e]}function Ca(r,t){let e=cd[t];e===void 0&&(e=new Int32Array(t),cd[t]=e);for(let i=0;i!==t;++i)e[i]=r.allocateTextureUnit();return e}function km(r,t){let e=this.cache;e[0]!==t&&(r.uniform1f(this.addr,t),e[0]=t)}function Hm(r,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(r.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(He(e,t))return;r.uniform2fv(this.addr,t),Ge(e,t)}}function Gm(r,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(r.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(r.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(He(e,t))return;r.uniform3fv(this.addr,t),Ge(e,t)}}function Vm(r,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(r.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(He(e,t))return;r.uniform4fv(this.addr,t),Ge(e,t)}}function Wm(r,t){let e=this.cache,i=t.elements;if(i===void 0){if(He(e,t))return;r.uniformMatrix2fv(this.addr,!1,t),Ge(e,t)}else{if(He(e,i))return;ud.set(i),r.uniformMatrix2fv(this.addr,!1,ud),Ge(e,i)}}function Xm(r,t){let e=this.cache,i=t.elements;if(i===void 0){if(He(e,t))return;r.uniformMatrix3fv(this.addr,!1,t),Ge(e,t)}else{if(He(e,i))return;dd.set(i),r.uniformMatrix3fv(this.addr,!1,dd),Ge(e,i)}}function qm(r,t){let e=this.cache,i=t.elements;if(i===void 0){if(He(e,t))return;r.uniformMatrix4fv(this.addr,!1,t),Ge(e,t)}else{if(He(e,i))return;hd.set(i),r.uniformMatrix4fv(this.addr,!1,hd),Ge(e,i)}}function Ym(r,t){let e=this.cache;e[0]!==t&&(r.uniform1i(this.addr,t),e[0]=t)}function $m(r,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(r.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(He(e,t))return;r.uniform2iv(this.addr,t),Ge(e,t)}}function Zm(r,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(r.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(He(e,t))return;r.uniform3iv(this.addr,t),Ge(e,t)}}function Qm(r,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(r.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(He(e,t))return;r.uniform4iv(this.addr,t),Ge(e,t)}}function Jm(r,t){let e=this.cache;e[0]!==t&&(r.uniform1ui(this.addr,t),e[0]=t)}function Km(r,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(r.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(He(e,t))return;r.uniform2uiv(this.addr,t),Ge(e,t)}}function jm(r,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(r.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(He(e,t))return;r.uniform3uiv(this.addr,t),Ge(e,t)}}function t0(r,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(r.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(He(e,t))return;r.uniform4uiv(this.addr,t),Ge(e,t)}}function e0(r,t,e){let i=this.cache,n=e.allocateTextureUnit();i[0]!==n&&(r.uniform1i(this.addr,n),i[0]=n);let s;this.type===r.SAMPLER_2D_SHADOW?(uc.compareFunction=e.isReversedDepthBuffer()?Ma:_a,s=uc):s=Ad,e.setTexture2D(t||s,n)}function i0(r,t,e){let i=this.cache,n=e.allocateTextureUnit();i[0]!==n&&(r.uniform1i(this.addr,n),i[0]=n),e.setTexture3D(t||Rd,n)}function n0(r,t,e){let i=this.cache,n=e.allocateTextureUnit();i[0]!==n&&(r.uniform1i(this.addr,n),i[0]=n),e.setTextureCube(t||Id,n)}function s0(r,t,e){let i=this.cache,n=e.allocateTextureUnit();i[0]!==n&&(r.uniform1i(this.addr,n),i[0]=n),e.setTexture2DArray(t||Cd,n)}function r0(r){switch(r){case 5126:return km;case 35664:return Hm;case 35665:return Gm;case 35666:return Vm;case 35674:return Wm;case 35675:return Xm;case 35676:return qm;case 5124:case 35670:return Ym;case 35667:case 35671:return $m;case 35668:case 35672:return Zm;case 35669:case 35673:return Qm;case 5125:return Jm;case 36294:return Km;case 36295:return jm;case 36296:return t0;case 35678:case 36198:case 36298:case 36306:case 35682:return e0;case 35679:case 36299:case 36307:return i0;case 35680:case 36300:case 36308:case 36293:return n0;case 36289:case 36303:case 36311:case 36292:return s0}}function o0(r,t){r.uniform1fv(this.addr,t)}function a0(r,t){let e=Cs(t,this.size,2);r.uniform2fv(this.addr,e)}function l0(r,t){let e=Cs(t,this.size,3);r.uniform3fv(this.addr,e)}function c0(r,t){let e=Cs(t,this.size,4);r.uniform4fv(this.addr,e)}function h0(r,t){let e=Cs(t,this.size,4);r.uniformMatrix2fv(this.addr,!1,e)}function d0(r,t){let e=Cs(t,this.size,9);r.uniformMatrix3fv(this.addr,!1,e)}function u0(r,t){let e=Cs(t,this.size,16);r.uniformMatrix4fv(this.addr,!1,e)}function f0(r,t){r.uniform1iv(this.addr,t)}function p0(r,t){r.uniform2iv(this.addr,t)}function m0(r,t){r.uniform3iv(this.addr,t)}function g0(r,t){r.uniform4iv(this.addr,t)}function x0(r,t){r.uniform1uiv(this.addr,t)}function y0(r,t){r.uniform2uiv(this.addr,t)}function v0(r,t){r.uniform3uiv(this.addr,t)}function _0(r,t){r.uniform4uiv(this.addr,t)}function M0(r,t,e){let i=this.cache,n=t.length,s=Ca(e,n);He(i,s)||(r.uniform1iv(this.addr,s),Ge(i,s));let o;this.type===r.SAMPLER_2D_SHADOW?o=uc:o=Ad;for(let a=0;a!==n;++a)e.setTexture2D(t[a]||o,s[a])}function S0(r,t,e){let i=this.cache,n=t.length,s=Ca(e,n);He(i,s)||(r.uniform1iv(this.addr,s),Ge(i,s));for(let o=0;o!==n;++o)e.setTexture3D(t[o]||Rd,s[o])}function b0(r,t,e){let i=this.cache,n=t.length,s=Ca(e,n);He(i,s)||(r.uniform1iv(this.addr,s),Ge(i,s));for(let o=0;o!==n;++o)e.setTextureCube(t[o]||Id,s[o])}function w0(r,t,e){let i=this.cache,n=t.length,s=Ca(e,n);He(i,s)||(r.uniform1iv(this.addr,s),Ge(i,s));for(let o=0;o!==n;++o)e.setTexture2DArray(t[o]||Cd,s[o])}function E0(r){switch(r){case 5126:return o0;case 35664:return a0;case 35665:return l0;case 35666:return c0;case 35674:return h0;case 35675:return d0;case 35676:return u0;case 5124:case 35670:return f0;case 35667:case 35671:return p0;case 35668:case 35672:return m0;case 35669:case 35673:return g0;case 5125:return x0;case 36294:return y0;case 36295:return v0;case 36296:return _0;case 35678:case 36198:case 36298:case 36306:case 35682:return M0;case 35679:case 36299:case 36307:return S0;case 35680:case 36300:case 36308:case 36293:return b0;case 36289:case 36303:case 36311:case 36292:return w0}}var fc=class{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.setValue=r0(e.type)}},pc=class{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=E0(e.type)}},mc=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,i){let n=this.seq;for(let s=0,o=n.length;s!==o;++s){let a=n[s];a.setValue(t,e[a.id],i)}}},hc=/(\w+)(\])?(\[|\.)?/g;function fd(r,t){r.seq.push(t),r.map[t.id]=t}function T0(r,t,e){let i=r.name,n=i.length;for(hc.lastIndex=0;;){let s=hc.exec(i),o=hc.lastIndex,a=s[1],c=s[2]==="]",l=s[3];if(c&&(a=a|0),l===void 0||l==="["&&o+2===n){fd(e,l===void 0?new fc(a,r,t):new pc(a,r,t));break}else{let u=e.map[a];u===void 0&&(u=new mc(a),fd(e,u)),e=u}}}var As=class{constructor(t,e){this.seq=[],this.map={};let i=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let o=0;o<i;++o){let a=t.getActiveUniform(e,o),c=t.getUniformLocation(e,a.name);T0(a,c,this)}let n=[],s=[];for(let o of this.seq)o.type===t.SAMPLER_2D_SHADOW||o.type===t.SAMPLER_CUBE_SHADOW||o.type===t.SAMPLER_2D_ARRAY_SHADOW?n.push(o):s.push(o);n.length>0&&(this.seq=n.concat(s))}setValue(t,e,i,n){let s=this.map[e];s!==void 0&&s.setValue(t,i,n)}setOptional(t,e,i){let n=e[i];n!==void 0&&this.setValue(t,i,n)}static upload(t,e,i,n){for(let s=0,o=e.length;s!==o;++s){let a=e[s],c=i[a.id];c.needsUpdate!==!1&&a.setValue(t,c.value,n)}}static seqWithValue(t,e){let i=[];for(let n=0,s=t.length;n!==s;++n){let o=t[n];o.id in e&&i.push(o)}return i}};function pd(r,t,e){let i=r.createShader(t);return r.shaderSource(i,e),r.compileShader(i),i}var A0=37297,C0=0;function R0(r,t){let e=r.split(`
`),i=[],n=Math.max(t-6,0),s=Math.min(t+6,e.length);for(let o=n;o<s;o++){let a=o+1;i.push(`${a===t?">":" "} ${a}: ${e[o]}`)}return i.join(`
`)}var md=new Yt;function I0(r){se._getMatrix(md,se.workingColorSpace,r);let t=`mat3( ${md.elements.map(e=>e.toFixed(4))} )`;switch(se.getTransfer(r)){case ks:return[t,"LinearTransferOETF"];case ge:return[t,"sRGBTransferOETF"];default:return Gt("WebGLProgram: Unsupported color space: ",r),[t,"LinearTransferOETF"]}}function gd(r,t,e){let i=r.getShaderParameter(t,r.COMPILE_STATUS),s=(r.getShaderInfoLog(t)||"").trim();if(i&&s==="")return"";let o=/ERROR: 0:(\d+)/.exec(s);if(o){let a=parseInt(o[1]);return e.toUpperCase()+`

`+s+`

`+R0(r.getShaderSource(t),a)}else return s}function P0(r,t){let e=I0(t);return[`vec4 ${r}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}var L0={[Ul]:"Linear",[Fl]:"Reinhard",[Bl]:"Cineon",[zl]:"ACESFilmic",[kl]:"AgX",[Hl]:"Neutral",[Ol]:"Custom"};function D0(r,t){let e=L0[t];return e===void 0?(Gt("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+r+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+r+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}var ba=new k;function N0(){se.getLuminanceCoefficients(ba);let r=ba.x.toFixed(4),t=ba.y.toFixed(4),e=ba.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${r}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function U0(r){return[r.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",r.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(vr).join(`
`)}function F0(r){let t=[];for(let e in r){let i=r[e];i!==!1&&t.push("#define "+e+" "+i)}return t.join(`
`)}function B0(r,t){let e={},i=r.getProgramParameter(t,r.ACTIVE_ATTRIBUTES);for(let n=0;n<i;n++){let s=r.getActiveAttrib(t,n),o=s.name,a=1;s.type===r.FLOAT_MAT2&&(a=2),s.type===r.FLOAT_MAT3&&(a=3),s.type===r.FLOAT_MAT4&&(a=4),e[o]={type:s.type,location:r.getAttribLocation(t,o),locationSize:a}}return e}function vr(r){return r!==""}function xd(r,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return r.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function yd(r,t){return r.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var z0=/^[ \t]*#include +<([\w\d./]+)>/gm;function gc(r){return r.replace(z0,k0)}var O0=new Map;function k0(r,t){let e=te[t];if(e===void 0){let i=O0.get(t);if(i!==void 0)e=te[i],Gt('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,i);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">")}return gc(e)}var H0=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function vd(r){return r.replace(H0,G0)}function G0(r,t,e,i){let n="";for(let s=parseInt(t);s<parseInt(e);s++)n+=i.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return n}function _d(r){let t=`precision ${r.precision} float;
	precision ${r.precision} int;
	precision ${r.precision} sampler2D;
	precision ${r.precision} samplerCube;
	precision ${r.precision} sampler3D;
	precision ${r.precision} sampler2DArray;
	precision ${r.precision} sampler2DShadow;
	precision ${r.precision} samplerCubeShadow;
	precision ${r.precision} sampler2DArrayShadow;
	precision ${r.precision} isampler2D;
	precision ${r.precision} isampler3D;
	precision ${r.precision} isamplerCube;
	precision ${r.precision} isampler2DArray;
	precision ${r.precision} usampler2D;
	precision ${r.precision} usampler3D;
	precision ${r.precision} usamplerCube;
	precision ${r.precision} usampler2DArray;
	`;return r.precision==="highp"?t+=`
#define HIGH_PRECISION`:r.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:r.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}var V0={[Hn]:"SHADOWMAP_TYPE_PCF",[Ms]:"SHADOWMAP_TYPE_VSM"};function W0(r){return V0[r.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var X0={[En]:"ENVMAP_TYPE_CUBE",[Vn]:"ENVMAP_TYPE_CUBE",[lr]:"ENVMAP_TYPE_CUBE_UV"};function q0(r){return r.envMap===!1?"ENVMAP_TYPE_CUBE":X0[r.envMapMode]||"ENVMAP_TYPE_CUBE"}var Y0={[Vn]:"ENVMAP_MODE_REFRACTION"};function $0(r){return r.envMap===!1?"ENVMAP_MODE_REFLECTION":Y0[r.envMapMode]||"ENVMAP_MODE_REFLECTION"}var Z0={[ar]:"ENVMAP_BLENDING_MULTIPLY",[Bh]:"ENVMAP_BLENDING_MIX",[zh]:"ENVMAP_BLENDING_ADD"};function Q0(r){return r.envMap===!1?"ENVMAP_BLENDING_NONE":Z0[r.combine]||"ENVMAP_BLENDING_NONE"}function J0(r){let t=r.envMapCubeUVHeight;if(t===null)return null;let e=Math.log2(t)-2,i=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:i,maxMip:e}}function K0(r,t,e,i){let n=r.getContext(),s=e.defines,o=e.vertexShader,a=e.fragmentShader,c=W0(e),l=q0(e),h=$0(e),u=Q0(e),d=J0(e),f=U0(e),g=F0(s),y=n.createProgram(),p,m,_=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(p=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(vr).join(`
`),p.length>0&&(p+=`
`),m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(vr).join(`
`),m.length>0&&(m+=`
`)):(p=[_d(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexNormals?"#define HAS_NORMAL":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+c:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(vr).join(`
`),m=[_d(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+l:"",e.envMap?"#define "+h:"",e.envMap?"#define "+u:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.retroreflection?"#define USE_RETROREFLECTION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas||e.batchingColor?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+c:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==Ii?"#define TONE_MAPPING":"",e.toneMapping!==Ii?te.tonemapping_pars_fragment:"",e.toneMapping!==Ii?D0("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",te.colorspace_pars_fragment,P0("linearToOutputTexel",e.outputColorSpace),N0(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(vr).join(`
`)),o=gc(o),o=xd(o,e),o=yd(o,e),a=gc(a),a=xd(a,e),a=yd(a,e),o=vd(o),a=vd(a),e.isRawShaderMaterial!==!0&&(_=`#version 300 es
`,p=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+p,m=["#define varying in",e.glslVersion===Zl?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===Zl?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);let M=_+p+o,v=_+m+a,w=pd(n,n.VERTEX_SHADER,M),S=pd(n,n.FRAGMENT_SHADER,v);n.attachShader(y,w),n.attachShader(y,S),e.index0AttributeName!==void 0?n.bindAttribLocation(y,0,e.index0AttributeName):e.hasPositionAttribute===!0&&n.bindAttribLocation(y,0,"position"),n.linkProgram(y);function T(R){if(r.debug.checkShaderErrors){let L=n.getProgramInfoLog(y)||"",D=n.getShaderInfoLog(w)||"",I=n.getShaderInfoLog(S)||"",F=L.trim(),z=D.trim(),G=I.trim(),K=!0,N=!0;if(n.getProgramParameter(y,n.LINK_STATUS)===!1)if(K=!1,typeof r.debug.onShaderError=="function")r.debug.onShaderError(n,y,w,S);else{let $=gd(n,w,"vertex"),Q=gd(n,S,"fragment");Wt("WebGLProgram: Shader Error "+n.getError()+" - VALIDATE_STATUS "+n.getProgramParameter(y,n.VALIDATE_STATUS)+`

Material Name: `+R.name+`
Material Type: `+R.type+`

Program Info Log: `+F+`
`+$+`
`+Q)}else F!==""?Gt("WebGLProgram: Program Info Log:",F):(z===""||G==="")&&(N=!1);N&&(R.diagnostics={runnable:K,programLog:F,vertexShader:{log:z,prefix:p},fragmentShader:{log:G,prefix:m}})}n.deleteShader(w),n.deleteShader(S),x=new As(n,y),E=B0(n,y)}let x;this.getUniforms=function(){return x===void 0&&T(this),x};let E;this.getAttributes=function(){return E===void 0&&T(this),E};let C=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return C===!1&&(C=n.getProgramParameter(y,A0)),C},this.destroy=function(){i.releaseStatesOfProgram(this),n.deleteProgram(y),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=C0++,this.cacheKey=t,this.usedTimes=1,this.program=y,this.vertexShader=w,this.fragmentShader=S,this}var j0=0,xc=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,e,i){let n=this._getShaderCacheForMaterial(t);return n.has(e)===!1&&(n.add(e),e.usedTimes++),n.has(i)===!1&&(n.add(i),i.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let i of e)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,i=e.get(t);return i===void 0&&(i=new Set,e.set(t,i)),i}_getShaderStage(t){let e=this.shaderCache,i=e.get(t);return i===void 0&&(i=new yc(t),e.set(t,i)),i}},yc=class{constructor(t){this.id=j0++,this.code=t,this.usedTimes=0}};function tg(r){return r===An||r===pr||r===mr}function eg(r,t,e,i,n,s){let o=new gs,a=new xc,c=new Set,l=[],h=new Map,u=i.logarithmicDepthBuffer,d=i.precision,f={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(x){return c.add(x),x===0?"uv":`uv${x}`}function y(x,E,C,R,L,D){let I=R.fog,F=L.geometry,z=x.isMeshStandardMaterial||x.isMeshLambertMaterial||x.isMeshPhongMaterial?R.environment:null,G=x.isMeshStandardMaterial||x.isMeshLambertMaterial&&!x.envMap||x.isMeshPhongMaterial&&!x.envMap,K=t.get(x.envMap||z,G),N=K&&K.mapping===lr?K.image.height:null,$=f[x.type];x.precision!==null&&(d=i.getMaxPrecision(x.precision),d!==x.precision&&Gt("WebGLProgram.getParameters:",x.precision,"not supported, using",d,"instead."));let Q=F.morphAttributes.position||F.morphAttributes.normal||F.morphAttributes.color,ot=Q!==void 0?Q.length:0,st=0;F.morphAttributes.position!==void 0&&(st=1),F.morphAttributes.normal!==void 0&&(st=2),F.morphAttributes.color!==void 0&&(st=3);let It,ut,Pt,q;if($){let Me=Zi[$];It=Me.vertexShader,ut=Me.fragmentShader}else{It=x.vertexShader,ut=x.fragmentShader;let Me=a.getVertexShaderStage(x),pe=a.getFragmentShaderStage(x);a.update(x,Me,pe),Pt=Me.id,q=pe.id}let Y=r.getRenderTarget(),ct=r.state.buffers.depth.getReversed(),vt=L.isInstancedMesh===!0,lt=L.isBatchedMesh===!0,kt=!!x.map,le=!!x.matcap,Xt=!!K,ht=!!x.aoMap,at=!!x.lightMap,Lt=!!x.bumpMap&&x.wireframe===!1,Kt=!!x.normalMap,qt=!!x.displacementMap,$t=!!x.emissiveMap,Ot=!!x.metalnessMap,Qt=!!x.roughnessMap,B=x.anisotropy>0,De=x.clearcoat>0,ce=x.dispersion>0,P=x.retroreflectivity>0,b=x.iridescence>0,V=x.sheen>0,Z=x.transmission>0,tt=B&&!!x.anisotropyMap,dt=De&&!!x.clearcoatMap,pt=De&&!!x.clearcoatNormalMap,et=De&&!!x.clearcoatRoughnessMap,nt=b&&!!x.iridescenceMap,mt=b&&!!x.iridescenceThicknessMap,Ut=V&&!!x.sheenColorMap,_t=V&&!!x.sheenRoughnessMap,gt=!!x.specularMap,Ft=!!x.specularColorMap,Ht=!!x.specularIntensityMap,Jt=Z&&!!x.transmissionMap,H=Z&&!!x.thicknessMap,xt=!!x.gradientMap,it=!!x.alphaMap,yt=x.alphaTest>0,Et=!!x.alphaHash,rt=!!x.extensions,zt=Ii;x.toneMapped&&(Y===null||Y.isXRRenderTarget===!0)&&(zt=r.toneMapping);let Dt={shaderID:$,shaderType:x.type,shaderName:x.name,vertexShader:It,fragmentShader:ut,defines:x.defines,customVertexShaderID:Pt,customFragmentShaderID:q,isRawShaderMaterial:x.isRawShaderMaterial===!0,glslVersion:x.glslVersion,precision:d,batching:lt,batchingColor:lt&&L._colorsTexture!==null,instancing:vt,instancingColor:vt&&L.instanceColor!==null,instancingMorph:vt&&L.morphTexture!==null,outputColorSpace:Y===null?r.outputColorSpace:Y.isXRRenderTarget===!0?Y.texture.colorSpace:se.workingColorSpace,alphaToCoverage:!!x.alphaToCoverage,map:kt,matcap:le,envMap:Xt,envMapMode:Xt&&K.mapping,envMapCubeUVHeight:N,aoMap:ht,lightMap:at,bumpMap:Lt,normalMap:Kt,displacementMap:qt,emissiveMap:$t,normalMapObjectSpace:Kt&&x.normalMapType===Hh,normalMapTangentSpace:Kt&&x.normalMapType===ws,packedNormalMap:Kt&&x.normalMapType===ws&&tg(x.normalMap.format),metalnessMap:Ot,roughnessMap:Qt,anisotropy:B,anisotropyMap:tt,clearcoat:De,clearcoatMap:dt,clearcoatNormalMap:pt,clearcoatRoughnessMap:et,dispersion:ce,retroreflection:P,iridescence:b,iridescenceMap:nt,iridescenceThicknessMap:mt,sheen:V,sheenColorMap:Ut,sheenRoughnessMap:_t,specularMap:gt,specularColorMap:Ft,specularIntensityMap:Ht,transmission:Z,transmissionMap:Jt,thicknessMap:H,gradientMap:xt,opaque:x.transparent===!1&&x.blending===wn&&x.alphaToCoverage===!1,alphaMap:it,alphaTest:yt,alphaHash:Et,combine:x.combine,mapUv:kt&&g(x.map.channel),aoMapUv:ht&&g(x.aoMap.channel),lightMapUv:at&&g(x.lightMap.channel),bumpMapUv:Lt&&g(x.bumpMap.channel),normalMapUv:Kt&&g(x.normalMap.channel),displacementMapUv:qt&&g(x.displacementMap.channel),emissiveMapUv:$t&&g(x.emissiveMap.channel),metalnessMapUv:Ot&&g(x.metalnessMap.channel),roughnessMapUv:Qt&&g(x.roughnessMap.channel),anisotropyMapUv:tt&&g(x.anisotropyMap.channel),clearcoatMapUv:dt&&g(x.clearcoatMap.channel),clearcoatNormalMapUv:pt&&g(x.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:et&&g(x.clearcoatRoughnessMap.channel),iridescenceMapUv:nt&&g(x.iridescenceMap.channel),iridescenceThicknessMapUv:mt&&g(x.iridescenceThicknessMap.channel),sheenColorMapUv:Ut&&g(x.sheenColorMap.channel),sheenRoughnessMapUv:_t&&g(x.sheenRoughnessMap.channel),specularMapUv:gt&&g(x.specularMap.channel),specularColorMapUv:Ft&&g(x.specularColorMap.channel),specularIntensityMapUv:Ht&&g(x.specularIntensityMap.channel),transmissionMapUv:Jt&&g(x.transmissionMap.channel),thicknessMapUv:H&&g(x.thicknessMap.channel),alphaMapUv:it&&g(x.alphaMap.channel),vertexTangents:!!F.attributes.tangent&&(Kt||B),vertexNormals:!!F.attributes.normal,vertexColors:x.vertexColors,vertexAlphas:x.vertexColors===!0&&!!F.attributes.color&&F.attributes.color.itemSize===4,pointsUvs:L.isPoints===!0&&!!F.attributes.uv&&(kt||it),fog:!!I,useFog:x.fog===!0,fogExp2:!!I&&I.isFogExp2,flatShading:x.wireframe===!1&&(x.flatShading===!0||F.attributes.normal===void 0&&Kt===!1&&(x.isMeshLambertMaterial||x.isMeshPhongMaterial||x.isMeshStandardMaterial||x.isMeshPhysicalMaterial)),sizeAttenuation:x.sizeAttenuation===!0,logarithmicDepthBuffer:u,reversedDepthBuffer:ct,skinning:L.isSkinnedMesh===!0,hasPositionAttribute:F.attributes.position!==void 0,morphTargets:F.morphAttributes.position!==void 0,morphNormals:F.morphAttributes.normal!==void 0,morphColors:F.morphAttributes.color!==void 0,morphTargetsCount:ot,morphTextureStride:st,numSunLights:E.sun.length,numDirLights:E.directional.length,numPointLights:E.point.length,numSpotLights:E.spot.length,numSpotLightMaps:E.spotLightMap.length,numRectAreaLights:E.rectArea.length,numHemiLights:E.hemi.length,numSunLightShadows:E.sunShadowMap.length,numDirLightShadows:E.directionalShadowMap.length,numPointLightShadows:E.pointShadowMap.length,numSpotLightShadows:E.spotShadowMap.length,numSpotLightShadowsWithMaps:E.numSpotLightShadowsWithMaps,numLightProbes:E.numLightProbes,numLightProbeGrids:D.length,numClippingPlanes:s.numPlanes,numClipIntersection:s.numIntersection,dithering:x.dithering,shadowMapEnabled:r.shadowMap.enabled&&C.length>0,shadowMapType:r.shadowMap.type,toneMapping:zt,decodeVideoTexture:kt&&x.map.isVideoTexture===!0&&se.getTransfer(x.map.colorSpace)===ge,decodeVideoTextureEmissive:$t&&x.emissiveMap.isVideoTexture===!0&&se.getTransfer(x.emissiveMap.colorSpace)===ge,premultipliedAlpha:x.premultipliedAlpha,doubleSided:x.side===Xe,flipSided:x.side===si,useDepthPacking:x.depthPacking>=0,depthPacking:x.depthPacking||0,index0AttributeName:x.index0AttributeName,extensionClipCullDistance:rt&&x.extensions.clipCullDistance===!0&&e.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(rt&&x.extensions.multiDraw===!0||lt)&&e.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:e.has("KHR_parallel_shader_compile"),customProgramCacheKey:x.customProgramCacheKey()};return Dt.vertexUv1s=c.has(1),Dt.vertexUv2s=c.has(2),Dt.vertexUv3s=c.has(3),c.clear(),Dt}function p(x){let E=[];if(x.shaderID?E.push(x.shaderID):(E.push(x.customVertexShaderID),E.push(x.customFragmentShaderID)),x.defines!==void 0)for(let C in x.defines)E.push(C),E.push(x.defines[C]);return x.isRawShaderMaterial===!1&&(m(E,x),_(E,x),E.push(r.outputColorSpace)),E.push(x.customProgramCacheKey),E.join()}function m(x,E){x.push(E.precision),x.push(E.outputColorSpace),x.push(E.envMapMode),x.push(E.envMapCubeUVHeight),x.push(E.mapUv),x.push(E.alphaMapUv),x.push(E.lightMapUv),x.push(E.aoMapUv),x.push(E.bumpMapUv),x.push(E.normalMapUv),x.push(E.displacementMapUv),x.push(E.emissiveMapUv),x.push(E.metalnessMapUv),x.push(E.roughnessMapUv),x.push(E.anisotropyMapUv),x.push(E.clearcoatMapUv),x.push(E.clearcoatNormalMapUv),x.push(E.clearcoatRoughnessMapUv),x.push(E.iridescenceMapUv),x.push(E.iridescenceThicknessMapUv),x.push(E.sheenColorMapUv),x.push(E.sheenRoughnessMapUv),x.push(E.specularMapUv),x.push(E.specularColorMapUv),x.push(E.specularIntensityMapUv),x.push(E.transmissionMapUv),x.push(E.thicknessMapUv),x.push(E.combine),x.push(E.fogExp2),x.push(E.sizeAttenuation),x.push(E.morphTargetsCount),x.push(E.morphAttributeCount),x.push(E.numSunLights),x.push(E.numDirLights),x.push(E.numPointLights),x.push(E.numSpotLights),x.push(E.numSpotLightMaps),x.push(E.numHemiLights),x.push(E.numRectAreaLights),x.push(E.numSunLightShadows),x.push(E.numDirLightShadows),x.push(E.numPointLightShadows),x.push(E.numSpotLightShadows),x.push(E.numSpotLightShadowsWithMaps),x.push(E.numLightProbes),x.push(E.shadowMapType),x.push(E.toneMapping),x.push(E.numClippingPlanes),x.push(E.numClipIntersection),x.push(E.depthPacking)}function _(x,E){o.disableAll(),E.instancing&&o.enable(0),E.instancingColor&&o.enable(1),E.instancingMorph&&o.enable(2),E.matcap&&o.enable(3),E.envMap&&o.enable(4),E.normalMapObjectSpace&&o.enable(5),E.normalMapTangentSpace&&o.enable(6),E.clearcoat&&o.enable(7),E.iridescence&&o.enable(8),E.alphaTest&&o.enable(9),E.vertexColors&&o.enable(10),E.vertexAlphas&&o.enable(11),E.vertexUv1s&&o.enable(12),E.vertexUv2s&&o.enable(13),E.vertexUv3s&&o.enable(14),E.vertexTangents&&o.enable(15),E.anisotropy&&o.enable(16),E.alphaHash&&o.enable(17),E.batching&&o.enable(18),E.dispersion&&o.enable(19),E.retroreflection&&o.enable(24),E.batchingColor&&o.enable(20),E.gradientMap&&o.enable(21),E.packedNormalMap&&o.enable(22),E.vertexNormals&&o.enable(23),x.push(o.mask),o.disableAll(),E.fog&&o.enable(0),E.useFog&&o.enable(1),E.flatShading&&o.enable(2),E.logarithmicDepthBuffer&&o.enable(3),E.reversedDepthBuffer&&o.enable(4),E.skinning&&o.enable(5),E.morphTargets&&o.enable(6),E.morphNormals&&o.enable(7),E.morphColors&&o.enable(8),E.premultipliedAlpha&&o.enable(9),E.shadowMapEnabled&&o.enable(10),E.doubleSided&&o.enable(11),E.flipSided&&o.enable(12),E.useDepthPacking&&o.enable(13),E.dithering&&o.enable(14),E.transmission&&o.enable(15),E.sheen&&o.enable(16),E.opaque&&o.enable(17),E.pointsUvs&&o.enable(18),E.decodeVideoTexture&&o.enable(19),E.decodeVideoTextureEmissive&&o.enable(20),E.alphaToCoverage&&o.enable(21),E.numLightProbeGrids>0&&o.enable(22),E.hasPositionAttribute&&o.enable(23),x.push(o.mask)}function M(x){let E=f[x.type],C;if(E){let R=Zi[E];C=ed.clone(R.uniforms)}else C=x.uniforms;return C}function v(x,E){let C=h.get(E);return C!==void 0?++C.usedTimes:(C=new K0(r,E,x,n),l.push(C),h.set(E,C)),C}function w(x){if(--x.usedTimes===0){let E=l.indexOf(x);l[E]=l[l.length-1],l.pop(),h.delete(x.cacheKey),x.destroy()}}function S(x){a.remove(x)}function T(){a.dispose()}return{getParameters:y,getProgramCacheKey:p,getUniforms:M,acquireProgram:v,releaseProgram:w,releaseShaderCache:S,programs:l,dispose:T}}function ig(){let r=new WeakMap;function t(o){return r.has(o)}function e(o){let a=r.get(o);return a===void 0&&(a={},r.set(o,a)),a}function i(o){r.delete(o)}function n(o,a,c){r.get(o)[a]=c}function s(){r=new WeakMap}return{has:t,get:e,remove:i,update:n,dispose:s}}function ng(r,t){return r.groupOrder!==t.groupOrder?r.groupOrder-t.groupOrder:r.renderOrder!==t.renderOrder?r.renderOrder-t.renderOrder:r.material.id!==t.material.id?r.material.id-t.material.id:r.materialVariant!==t.materialVariant?r.materialVariant-t.materialVariant:r.z!==t.z?r.z-t.z:r.id-t.id}function Md(r,t){return r.groupOrder!==t.groupOrder?r.groupOrder-t.groupOrder:r.renderOrder!==t.renderOrder?r.renderOrder-t.renderOrder:r.z!==t.z?t.z-r.z:r.id-t.id}function Sd(){let r=[],t=0,e=[],i=[],n=[];function s(){t=0,e.length=0,i.length=0,n.length=0}function o(d){let f=0;return d.isInstancedMesh&&(f+=2),d.isSkinnedMesh&&(f+=1),f}function a(d,f,g,y,p,m){let _=r[t];return _===void 0?(_={id:d.id,object:d,geometry:f,material:g,materialVariant:o(d),groupOrder:y,renderOrder:d.renderOrder,z:p,group:m},r[t]=_):(_.id=d.id,_.object=d,_.geometry=f,_.material=g,_.materialVariant=o(d),_.groupOrder=y,_.renderOrder=d.renderOrder,_.z=p,_.group=m),t++,_}function c(d,f,g,y,p,m,_){_.reversedDepth===!0&&(p=-p);let M=a(d,f,g,y,p,m);g.transmission>0?i.push(M):g.transparent===!0?n.push(M):e.push(M)}function l(d,f,g,y,p,m){let _=a(d,f,g,y,p,m);g.transmission>0?i.unshift(_):g.transparent===!0?n.unshift(_):e.unshift(_)}function h(d,f){e.length>1&&e.sort(d||ng),i.length>1&&i.sort(f||Md),n.length>1&&n.sort(f||Md)}function u(){for(let d=t,f=r.length;d<f;d++){let g=r[d];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:e,transmissive:i,transparent:n,init:s,push:c,unshift:l,finish:u,sort:h}}function sg(){let r=new WeakMap;function t(i,n){let s=r.get(i),o;return s===void 0?(o=new Sd,r.set(i,[o])):n>=s.length?(o=new Sd,s.push(o)):o=s[n],o}function e(){r=new WeakMap}return{get:t,dispose:e}}function rg(){let r={};return{get:function(t){if(r[t.id]!==void 0)return r[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={direction:new k,color:new ft};break;case"SpotLight":e={position:new k,direction:new k,color:new ft,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new k,color:new ft,distance:0,decay:0};break;case"HemisphereLight":e={direction:new k,skyColor:new ft,groundColor:new ft};break;case"RectAreaLight":e={color:new ft,position:new k,halfWidth:new k,halfHeight:new k};break}return r[t.id]=e,e}}}function og(){let r={};return{get:function(t){if(r[t.id]!==void 0)return r[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Zt};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Zt};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Zt,shadowCameraNear:1,shadowCameraFar:1e3};break}return r[t.id]=e,e}}}var ag=0;function lg(r,t){return(t.castShadow?2:0)-(r.castShadow?2:0)+(t.map?1:0)-(r.map?1:0)}function cg(r){let t=new rg,e=og(),i={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)i.probe.push(new k);let n=new k,s=new ue,o=new ue;function a(l){let h=0,u=0,d=0;for(let L=0;L<9;L++)i.probe[L].set(0,0,0);let f=0,g=0,y=0,p=0,m=0,_=0,M=0,v=0,w=0,S=0,T=0,x=0,E=0,C=0;l.sort(lg);for(let L=0,D=l.length;L<D;L++){let I=l[L],F=I.color,z=I.intensity,G=I.distance,K=null;if(I.shadow&&I.shadow.map&&(I.shadow.map.texture.format===An?K=I.shadow.map.texture:K=I.shadow.map.depthTexture||I.shadow.map.texture),I.isAmbientLight)h+=F.r*z,u+=F.g*z,d+=F.b*z;else if(I.isLightProbe){for(let N=0;N<9;N++)i.probe[N].addScaledVector(I.sh.coefficients[N],z);C++}else if(I.isSunLight){let N=t.get(I);if(N.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){let $=I.shadow,Q=e.get(I);Q.shadowIntensity=$.intensity,Q.shadowBias=$.bias,Q.shadowNormalBias=$.normalBias,Q.shadowRadius=$.radius,Q.shadowMapSize.copy($.mapSize).multiply($.getFrameExtents()),i.sunShadow[g]=Q,i.sunShadowMap[g]=K;let ot=$.getViewportCount();for(let st=0;st<ot;st++)i.sunShadowMatrix[y+st]=$.getMatrix(st),i.sunShadowCascade[y+st]=$._cascadeData[st];y+=ot,g++}i.sun[f]=N,f++}else if(I.isDirectionalLight){let N=t.get(I);if(N.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){let $=I.shadow,Q=e.get(I);Q.shadowIntensity=$.intensity,Q.shadowBias=$.bias,Q.shadowNormalBias=$.normalBias,Q.shadowRadius=$.radius,Q.shadowMapSize=$.mapSize,i.directionalShadow[p]=Q,i.directionalShadowMap[p]=K,i.directionalShadowMatrix[p]=I.shadow.matrix,w++}i.directional[p]=N,p++}else if(I.isSpotLight){let N=t.get(I);N.position.setFromMatrixPosition(I.matrixWorld),N.color.copy(F).multiplyScalar(z),N.distance=G,N.coneCos=Math.cos(I.angle),N.penumbraCos=Math.cos(I.angle*(1-I.penumbra)),N.decay=I.decay,i.spot[_]=N;let $=I.shadow;if(I.map&&(i.spotLightMap[x]=I.map,x++,$.updateMatrices(I),I.castShadow&&E++),i.spotLightMatrix[_]=$.matrix,I.castShadow){let Q=e.get(I);Q.shadowIntensity=$.intensity,Q.shadowBias=$.bias,Q.shadowNormalBias=$.normalBias,Q.shadowRadius=$.radius,Q.shadowMapSize=$.mapSize,i.spotShadow[_]=Q,i.spotShadowMap[_]=K,T++}_++}else if(I.isRectAreaLight){let N=t.get(I);N.color.copy(F).multiplyScalar(z),N.halfWidth.set(I.width*.5,0,0),N.halfHeight.set(0,I.height*.5,0),i.rectArea[M]=N,M++}else if(I.isPointLight){let N=t.get(I);if(N.color.copy(I.color).multiplyScalar(I.intensity),N.distance=I.distance,N.decay=I.decay,I.castShadow){let $=I.shadow,Q=e.get(I);Q.shadowIntensity=$.intensity,Q.shadowBias=$.bias,Q.shadowNormalBias=$.normalBias,Q.shadowRadius=$.radius,Q.shadowMapSize=$.mapSize,Q.shadowCameraNear=$.camera.near,Q.shadowCameraFar=$.camera.far,i.pointShadow[m]=Q,i.pointShadowMap[m]=K,i.pointShadowMatrix[m]=I.shadow.matrix,S++}i.point[m]=N,m++}else if(I.isHemisphereLight){let N=t.get(I);N.skyColor.copy(I.color).multiplyScalar(z),N.groundColor.copy(I.groundColor).multiplyScalar(z),i.hemi[v]=N,v++}}M>0&&(r.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=Mt.LTC_FLOAT_1,i.rectAreaLTC2=Mt.LTC_FLOAT_2):(i.rectAreaLTC1=Mt.LTC_HALF_1,i.rectAreaLTC2=Mt.LTC_HALF_2)),i.ambient[0]=h,i.ambient[1]=u,i.ambient[2]=d;let R=i.hash;(R.sunLength!==f||R.directionalLength!==p||R.pointLength!==m||R.spotLength!==_||R.rectAreaLength!==M||R.hemiLength!==v||R.numSunShadows!==g||R.numDirectionalShadows!==w||R.numPointShadows!==S||R.numSpotShadows!==T||R.numSpotMaps!==x||R.numLightProbes!==C)&&(i.sun.length=f,i.directional.length=p,i.spot.length=_,i.rectArea.length=M,i.point.length=m,i.hemi.length=v,i.sunShadow.length=g,i.sunShadowMap.length=g,i.sunShadowMatrix.length=y,i.sunShadowCascade.length=y,i.directionalShadow.length=w,i.directionalShadowMap.length=w,i.directionalShadowMatrix.length=w,i.pointShadow.length=S,i.pointShadowMap.length=S,i.pointShadowMatrix.length=S,i.spotShadow.length=T,i.spotShadowMap.length=T,i.spotLightMatrix.length=T+x-E,i.spotLightMap.length=x,i.numSpotLightShadowsWithMaps=E,i.numLightProbes=C,R.sunLength=f,R.directionalLength=p,R.pointLength=m,R.spotLength=_,R.rectAreaLength=M,R.hemiLength=v,R.numSunShadows=g,R.numDirectionalShadows=w,R.numPointShadows=S,R.numSpotShadows=T,R.numSpotMaps=x,R.numLightProbes=C,i.version=ag++)}function c(l,h){let u=0,d=0,f=0,g=0,y=0,p=0,m=h.matrixWorldInverse;for(let _=0,M=l.length;_<M;_++){let v=l[_];if(v.isSunLight){let w=i.sun[u];w.direction.setFromMatrixPosition(v.matrixWorld),w.direction.transformDirection(m),u++}else if(v.isDirectionalLight){let w=i.directional[d];w.direction.setFromMatrixPosition(v.matrixWorld),n.setFromMatrixPosition(v.target.matrixWorld),w.direction.sub(n),w.direction.transformDirection(m),d++}else if(v.isSpotLight){let w=i.spot[g];w.position.setFromMatrixPosition(v.matrixWorld),w.position.applyMatrix4(m),w.direction.setFromMatrixPosition(v.matrixWorld),n.setFromMatrixPosition(v.target.matrixWorld),w.direction.sub(n),w.direction.transformDirection(m),g++}else if(v.isRectAreaLight){let w=i.rectArea[y];w.position.setFromMatrixPosition(v.matrixWorld),w.position.applyMatrix4(m),o.identity(),s.copy(v.matrixWorld),s.premultiply(m),o.extractRotation(s),w.halfWidth.set(v.width*.5,0,0),w.halfHeight.set(0,v.height*.5,0),w.halfWidth.applyMatrix4(o),w.halfHeight.applyMatrix4(o),y++}else if(v.isPointLight){let w=i.point[f];w.position.setFromMatrixPosition(v.matrixWorld),w.position.applyMatrix4(m),f++}else if(v.isHemisphereLight){let w=i.hemi[p];w.direction.setFromMatrixPosition(v.matrixWorld),w.direction.transformDirection(m),p++}}}return{setup:a,setupView:c,state:i}}function bd(r){let t=new cg(r),e=[],i=[],n=[];function s(d){u.camera=d,e.length=0,i.length=0,n.length=0}function o(d){e.push(d)}function a(d){i.push(d)}function c(d){n.push(d)}function l(){t.setup(e)}function h(d){t.setupView(e,d)}let u={lightsArray:e,shadowsArray:i,lightProbeGridArray:n,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:s,state:u,setupLights:l,setupLightsView:h,pushLight:o,pushShadow:a,pushLightProbeGrid:c}}function hg(r){let t=new WeakMap;function e(n,s=0){let o=t.get(n),a;return o===void 0?(a=new bd(r),t.set(n,[a])):s>=o.length?(a=new bd(r),o.push(a)):a=o[s],a}function i(){t=new WeakMap}return{get:e,dispose:i}}var dg=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,ug=`uniform sampler2D shadow_pass;
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
}`,fg=[new k(1,0,0),new k(-1,0,0),new k(0,1,0),new k(0,-1,0),new k(0,0,1),new k(0,0,-1)],pg=[new k(0,-1,0),new k(0,-1,0),new k(0,0,1),new k(0,0,-1),new k(0,-1,0),new k(0,-1,0)],wd=new ue,yr=new k,dc=new k;function mg(r,t,e){let i=new ys,n=new Zt,s=new Zt,o=new Pe,a=new yo,c=new vo,l={},h=e.maxTextureSize,u={[Xi]:si,[si]:Xi,[Xe]:Xe},d=new Oe({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Zt},radius:{value:4}},vertexShader:dg,fragmentShader:ug}),f=d.clone();f.defines.HORIZONTAL_PASS=1;let g=new xe;g.setAttribute("position",new he(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let y=new wt(g,d),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Hn;let m=this.type;this.render=function(S,T,x){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||S.length===0)return;this.type===yh&&(Gt("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Hn);let E=r.getRenderTarget(),C=r.getActiveCubeFace(),R=r.getActiveMipmapLevel(),L=r.state;L.setBlending(qi),L.buffers.depth.getReversed()===!0?L.buffers.color.setClear(0,0,0,0):L.buffers.color.setClear(1,1,1,1),L.buffers.depth.setTest(!0),L.setScissorTest(!1);let D=m!==this.type;D&&T.traverse(function(I){I.material&&(Array.isArray(I.material)?I.material.forEach(F=>F.needsUpdate=!0):I.material.needsUpdate=!0)});for(let I=0,F=S.length;I<F;I++){let z=S[I],G=z.shadow;if(G===void 0){Gt("WebGLShadowMap:",z,"has no shadow.");continue}if(G.autoUpdate===!1&&G.needsUpdate===!1)continue;n.copy(G.mapSize);let K=G.getFrameExtents();n.multiply(K),s.copy(G.mapSize),(n.x>h||n.y>h)&&(n.x>h&&(s.x=Math.floor(h/K.x),n.x=s.x*K.x,G.mapSize.x=s.x),n.y>h&&(s.y=Math.floor(h/K.y),n.y=s.y*K.y,G.mapSize.y=s.y));let N=r.state.buffers.depth.getReversed();if(G.camera._reversedDepth=N,G.map===null||D===!0){if(G.map!==null&&(G.map.depthTexture!==null&&(G.map.depthTexture.dispose(),G.map.depthTexture=null),G.map.dispose()),this.type===Ms){if(z.isPointLight){Gt("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}G.map=new ai(n.x,n.y,{format:An,type:Li,minFilter:ke,magFilter:ke,generateMipmaps:!1}),G.map.texture.name=z.name+".shadowMap",G.map.depthTexture=new yn(n.x,n.y,Si),G.map.depthTexture.name=z.name+".shadowMapDepth",G.map.depthTexture.format=ki,G.map.depthTexture.compareFunction=null,G.map.depthTexture.minFilter=We,G.map.depthTexture.magFilter=We}else z.isPointLight?(G.map=new Ea(n.x),G.map.depthTexture=new go(n.x,Pi)):(G.map=new ai(n.x,n.y),G.map.depthTexture=new yn(n.x,n.y,Pi)),G.map.depthTexture.name=z.name+".shadowMap",G.map.depthTexture.format=ki,this.type===Hn?(G.map.depthTexture.compareFunction=N?Ma:_a,G.map.depthTexture.minFilter=ke,G.map.depthTexture.magFilter=ke):(G.map.depthTexture.compareFunction=null,G.map.depthTexture.minFilter=We,G.map.depthTexture.magFilter=We);G.camera.updateProjectionMatrix()}G.map.isWebGLCubeRenderTarget!==!0&&(G.map.width!==n.x||G.map.height!==n.y)&&G.map.setSize(n.x,n.y);let $=G.map.isWebGLCubeRenderTarget?6:G.getViewportCount();z.isPointLight!==!0&&G.updateMatrices(z,x);for(let Q=0;Q<$;Q++){let ot=G.getCamera(Q);if(z.isPointLight){let st=G.camera,It=G.matrix,ut=z.distance||st.far;ut!==st.far&&(st.far=ut,st.updateProjectionMatrix()),yr.setFromMatrixPosition(z.matrixWorld),st.position.copy(yr),dc.copy(st.position),dc.add(fg[Q]),st.up.copy(pg[Q]),st.lookAt(dc),st.updateMatrixWorld(),It.makeTranslation(-yr.x,-yr.y,-yr.z),wd.multiplyMatrices(st.projectionMatrix,st.matrixWorldInverse),G._frustum.setFromProjectionMatrix(wd,st.coordinateSystem,st.reversedDepth)}if(G.map.isWebGLCubeRenderTarget)r.setRenderTarget(G.map,Q),r.clear();else{Q===0&&(r.setRenderTarget(G.map),r.clear());let st=G.getViewport(Q);o.set(s.x*st.x,s.y*st.y,s.x*st.z,s.y*st.w),L.viewport(o)}i=G.getFrustum(Q),v(T,x,ot,z,this.type)}G.isPointLightShadow!==!0&&this.type===Ms&&_(G,x),G.needsUpdate=!1}m=this.type,p.needsUpdate=!1,r.setRenderTarget(E,C,R)};function _(S,T){let x=t.update(y);d.defines.VSM_SAMPLES!==S.blurSamples&&(d.defines.VSM_SAMPLES=S.blurSamples,f.defines.VSM_SAMPLES=S.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),S.mapPass===null?S.mapPass=new ai(n.x,n.y,{format:An,type:Li}):(S.mapPass.width!==S.map.width||S.mapPass.height!==S.map.height)&&S.mapPass.setSize(S.map.width,S.map.height),d.uniforms.shadow_pass.value=S.map.depthTexture,d.uniforms.resolution.value.set(S.map.width,S.map.height),d.uniforms.radius.value=S.radius,r.setRenderTarget(S.mapPass),r.clear(),r.renderBufferDirect(T,null,x,d,y,null),f.uniforms.shadow_pass.value=S.mapPass.texture,f.uniforms.resolution.value.set(S.map.width,S.map.height),f.uniforms.radius.value=S.radius,r.setRenderTarget(S.map),r.clear(),r.renderBufferDirect(T,null,x,f,y,null)}function M(S,T,x,E){let C=null,R=x.isPointLight===!0?S.customDistanceMaterial:S.customDepthMaterial;if(R!==void 0)C=R;else if(C=x.isPointLight===!0?c:a,r.localClippingEnabled&&T.clipShadows===!0&&Array.isArray(T.clippingPlanes)&&T.clippingPlanes.length!==0||T.displacementMap&&T.displacementScale!==0||T.alphaMap&&T.alphaTest>0||T.map&&T.alphaTest>0||T.alphaToCoverage===!0){let L=C.uuid,D=T.uuid,I=l[L];I===void 0&&(I={},l[L]=I);let F=I[D];F===void 0&&(F=C.clone(),I[D]=F,T.addEventListener("dispose",w)),C=F}if(C.visible=T.visible,C.wireframe=T.wireframe,E===Ms?C.side=T.shadowSide!==null?T.shadowSide:T.side:C.side=T.shadowSide!==null?T.shadowSide:u[T.side],C.alphaMap=T.alphaMap,C.alphaTest=T.alphaToCoverage===!0?.5:T.alphaTest,C.map=T.map,C.clipShadows=T.clipShadows,C.clippingPlanes=T.clippingPlanes,C.clipIntersection=T.clipIntersection,C.displacementMap=T.displacementMap,C.displacementScale=T.displacementScale,C.displacementBias=T.displacementBias,C.wireframeLinewidth=T.wireframeLinewidth,C.linewidth=T.linewidth,x.isPointLight===!0&&C.isMeshDistanceMaterial===!0){let L=r.properties.get(C);L.light=x}return C}function v(S,T,x,E,C){if(S.visible===!1)return;if(S.layers.test(T.layers)&&(S.isMesh||S.isLine||S.isPoints)&&(S.castShadow||S.receiveShadow&&C===Ms)&&(!S.frustumCulled||S.intersectsFrustum(i))){S.modelViewMatrix.multiplyMatrices(x.matrixWorldInverse,S.matrixWorld);let D=t.update(S),I=S.material;if(Array.isArray(I)){let F=D.groups;for(let z=0,G=F.length;z<G;z++){let K=F[z],N=I[K.materialIndex];if(N&&N.visible){let $=M(S,N,E,C);S.onBeforeShadow(r,S,T,x,D,$,K),r.renderBufferDirect(x,null,D,$,S,K),S.onAfterShadow(r,S,T,x,D,$,K)}}}else if(I.visible){let F=M(S,I,E,C);S.onBeforeShadow(r,S,T,x,D,F,null),r.renderBufferDirect(x,null,D,F,S,null),S.onAfterShadow(r,S,T,x,D,F,null)}}let L=S.children;for(let D=0,I=L.length;D<I;D++)v(L[D],T,x,E,C)}function w(S){S.target.removeEventListener("dispose",w);for(let x in l){let E=l[x],C=S.target.uuid;C in E&&(E[C].dispose(),delete E[C])}}}function gg(r,t){function e(){let H=!1,xt=new Pe,it=null,yt=new Pe(0,0,0,0);return{setMask:function(Et){it!==Et&&!H&&(r.colorMask(Et,Et,Et,Et),it=Et)},setLocked:function(Et){H=Et},setClear:function(Et,rt,zt,Dt,Me){Me===!0&&(Et*=Dt,rt*=Dt,zt*=Dt),xt.set(Et,rt,zt,Dt),yt.equals(xt)===!1&&(r.clearColor(Et,rt,zt,Dt),yt.copy(xt))},reset:function(){H=!1,it=null,yt.set(-1,0,0,0)}}}function i(){let H=!1,xt=!1,it=null,yt=null,Et=null;return{setReversed:function(rt){if(xt!==rt){let zt=t.get("EXT_clip_control");rt?zt.clipControlEXT(zt.LOWER_LEFT_EXT,zt.ZERO_TO_ONE_EXT):zt.clipControlEXT(zt.LOWER_LEFT_EXT,zt.NEGATIVE_ONE_TO_ONE_EXT),xt=rt;let Dt=Et;Et=null,this.setClear(Dt)}},getReversed:function(){return xt},setTest:function(rt){rt?Y(r.DEPTH_TEST):ct(r.DEPTH_TEST)},setMask:function(rt){it!==rt&&!H&&(r.depthMask(rt),it=rt)},setFunc:function(rt){if(xt&&(rt=jh[rt]),yt!==rt){switch(rt){case Kr:r.depthFunc(r.NEVER);break;case jr:r.depthFunc(r.ALWAYS);break;case to:r.depthFunc(r.LESS);break;case us:r.depthFunc(r.LEQUAL);break;case eo:r.depthFunc(r.EQUAL);break;case io:r.depthFunc(r.GEQUAL);break;case no:r.depthFunc(r.GREATER);break;case so:r.depthFunc(r.NOTEQUAL);break;default:r.depthFunc(r.LEQUAL)}yt=rt}},setLocked:function(rt){H=rt},setClear:function(rt){Et!==rt&&(Et=rt,xt&&(rt=1-rt),r.clearDepth(rt))},reset:function(){H=!1,it=null,yt=null,Et=null,xt=!1}}}function n(){let H=!1,xt=null,it=null,yt=null,Et=null,rt=null,zt=null,Dt=null,Me=null;return{setTest:function(pe){H||(pe?Y(r.STENCIL_TEST):ct(r.STENCIL_TEST))},setMask:function(pe){xt!==pe&&!H&&(r.stencilMask(pe),xt=pe)},setFunc:function(pe,wi,Fi){(it!==pe||yt!==wi||Et!==Fi)&&(r.stencilFunc(pe,wi,Fi),it=pe,yt=wi,Et=Fi)},setOp:function(pe,wi,Fi){(rt!==pe||zt!==wi||Dt!==Fi)&&(r.stencilOp(pe,wi,Fi),rt=pe,zt=wi,Dt=Fi)},setLocked:function(pe){H=pe},setClear:function(pe){Me!==pe&&(r.clearStencil(pe),Me=pe)},reset:function(){H=!1,xt=null,it=null,yt=null,Et=null,rt=null,zt=null,Dt=null,Me=null}}}let s=new e,o=new i,a=new n,c=new WeakMap,l=new WeakMap,h={},u={},d={},f=new WeakMap,g=[],y=null,p=!1,m=null,_=null,M=null,v=null,w=null,S=null,T=null,x=new ft(0,0,0),E=0,C=!1,R=null,L=null,D=null,I=null,F=null,z=r.getParameter(r.MAX_COMBINED_TEXTURE_IMAGE_UNITS),G=!1,K=0,N=r.getParameter(r.VERSION);N.indexOf("WebGL")!==-1?(K=parseFloat(/^WebGL (\d)/.exec(N)[1]),G=K>=1):N.indexOf("OpenGL ES")!==-1&&(K=parseFloat(/^OpenGL ES (\d)/.exec(N)[1]),G=K>=2);let $=null,Q={},ot=r.getParameter(r.SCISSOR_BOX),st=r.getParameter(r.VIEWPORT),It=new Pe().fromArray(ot),ut=new Pe().fromArray(st);function Pt(H,xt,it,yt){let Et=new Uint8Array(4),rt=r.createTexture();r.bindTexture(H,rt),r.texParameteri(H,r.TEXTURE_MIN_FILTER,r.NEAREST),r.texParameteri(H,r.TEXTURE_MAG_FILTER,r.NEAREST);for(let zt=0;zt<it;zt++)H===r.TEXTURE_3D||H===r.TEXTURE_2D_ARRAY?r.texImage3D(xt,0,r.RGBA,1,1,yt,0,r.RGBA,r.UNSIGNED_BYTE,Et):r.texImage2D(xt+zt,0,r.RGBA,1,1,0,r.RGBA,r.UNSIGNED_BYTE,Et);return rt}let q={};q[r.TEXTURE_2D]=Pt(r.TEXTURE_2D,r.TEXTURE_2D,1),q[r.TEXTURE_CUBE_MAP]=Pt(r.TEXTURE_CUBE_MAP,r.TEXTURE_CUBE_MAP_POSITIVE_X,6),q[r.TEXTURE_2D_ARRAY]=Pt(r.TEXTURE_2D_ARRAY,r.TEXTURE_2D_ARRAY,1,1),q[r.TEXTURE_3D]=Pt(r.TEXTURE_3D,r.TEXTURE_3D,1,1),s.setClear(0,0,0,1),o.setClear(1),a.setClear(0),Y(r.DEPTH_TEST),o.setFunc(us),Lt(!1),Kt(Rl),Y(r.CULL_FACE),ht(qi);function Y(H){h[H]!==!0&&(r.enable(H),h[H]=!0)}function ct(H){h[H]!==!1&&(r.disable(H),h[H]=!1)}function vt(H,xt){return d[H]!==xt?(r.bindFramebuffer(H,xt),d[H]=xt,H===r.DRAW_FRAMEBUFFER&&(d[r.FRAMEBUFFER]=xt),H===r.FRAMEBUFFER&&(d[r.DRAW_FRAMEBUFFER]=xt),!0):!1}function lt(H,xt){let it=g,yt=!1;if(H){it=f.get(xt),it===void 0&&(it=[],f.set(xt,it));let Et=H.textures;if(it.length!==Et.length||it[0]!==r.COLOR_ATTACHMENT0){for(let rt=0,zt=Et.length;rt<zt;rt++)it[rt]=r.COLOR_ATTACHMENT0+rt;it.length=Et.length,yt=!0}}else it[0]!==r.BACK&&(it[0]=r.BACK,yt=!0);yt&&r.drawBuffers(it)}function kt(H){return y!==H?(r.useProgram(H),y=H,!0):!1}let le={[Gn]:r.FUNC_ADD,[_h]:r.FUNC_SUBTRACT,[Mh]:r.FUNC_REVERSE_SUBTRACT};le[Sh]=r.MIN,le[bh]=r.MAX;let Xt={[wh]:r.ZERO,[Eh]:r.ONE,[Th]:r.SRC_COLOR,[Dl]:r.SRC_ALPHA,[Lh]:r.SRC_ALPHA_SATURATE,[Ih]:r.DST_COLOR,[Ch]:r.DST_ALPHA,[Ah]:r.ONE_MINUS_SRC_COLOR,[Nl]:r.ONE_MINUS_SRC_ALPHA,[Ph]:r.ONE_MINUS_DST_COLOR,[Rh]:r.ONE_MINUS_DST_ALPHA,[Dh]:r.CONSTANT_COLOR,[Nh]:r.ONE_MINUS_CONSTANT_COLOR,[Uh]:r.CONSTANT_ALPHA,[Fh]:r.ONE_MINUS_CONSTANT_ALPHA};function ht(H,xt,it,yt,Et,rt,zt,Dt,Me,pe){if(H===qi){p===!0&&(ct(r.BLEND),p=!1);return}if(p===!1&&(Y(r.BLEND),p=!0),H!==vh){if(H!==m||pe!==C){if((_!==Gn||w!==Gn)&&(r.blendEquation(r.FUNC_ADD),_=Gn,w=Gn),pe)switch(H){case wn:r.blendFuncSeparate(r.ONE,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case Il:r.blendFunc(r.ONE,r.ONE);break;case Pl:r.blendFuncSeparate(r.ZERO,r.ONE_MINUS_SRC_COLOR,r.ZERO,r.ONE);break;case Ll:r.blendFuncSeparate(r.DST_COLOR,r.ONE_MINUS_SRC_ALPHA,r.ZERO,r.ONE);break;default:Wt("WebGLState: Invalid blending: ",H);break}else switch(H){case wn:r.blendFuncSeparate(r.SRC_ALPHA,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case Il:r.blendFuncSeparate(r.SRC_ALPHA,r.ONE,r.ONE,r.ONE);break;case Pl:Wt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Ll:Wt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Wt("WebGLState: Invalid blending: ",H);break}M=null,v=null,S=null,T=null,x.set(0,0,0),E=0,m=H,C=pe}return}Et=Et||xt,rt=rt||it,zt=zt||yt,(xt!==_||Et!==w)&&(r.blendEquationSeparate(le[xt],le[Et]),_=xt,w=Et),(it!==M||yt!==v||rt!==S||zt!==T)&&(r.blendFuncSeparate(Xt[it],Xt[yt],Xt[rt],Xt[zt]),M=it,v=yt,S=rt,T=zt),(Dt.equals(x)===!1||Me!==E)&&(r.blendColor(Dt.r,Dt.g,Dt.b,Me),x.copy(Dt),E=Me),m=H,C=!1}function at(H,xt){H.side===Xe?ct(r.CULL_FACE):Y(r.CULL_FACE);let it=H.side===si;xt&&(it=!it),Lt(it),H.blending===wn&&H.transparent===!1?ht(qi):ht(H.blending,H.blendEquation,H.blendSrc,H.blendDst,H.blendEquationAlpha,H.blendSrcAlpha,H.blendDstAlpha,H.blendColor,H.blendAlpha,H.premultipliedAlpha),o.setFunc(H.depthFunc),o.setTest(H.depthTest),o.setMask(H.depthWrite),s.setMask(H.colorWrite);let yt=H.stencilWrite;a.setTest(yt),yt&&(a.setMask(H.stencilWriteMask),a.setFunc(H.stencilFunc,H.stencilRef,H.stencilFuncMask),a.setOp(H.stencilFail,H.stencilZFail,H.stencilZPass)),$t(H.polygonOffset,H.polygonOffsetFactor,H.polygonOffsetUnits),H.alphaToCoverage===!0?Y(r.SAMPLE_ALPHA_TO_COVERAGE):ct(r.SAMPLE_ALPHA_TO_COVERAGE)}function Lt(H){R!==H&&(H?r.frontFace(r.CW):r.frontFace(r.CCW),R=H)}function Kt(H){H!==gh?(Y(r.CULL_FACE),H!==L&&(H===Rl?r.cullFace(r.BACK):H===xh?r.cullFace(r.FRONT):r.cullFace(r.FRONT_AND_BACK))):ct(r.CULL_FACE),L=H}function qt(H){H!==D&&(G&&r.lineWidth(H),D=H)}function $t(H,xt,it){H?(Y(r.POLYGON_OFFSET_FILL),(I!==xt||F!==it)&&(I=xt,F=it,o.getReversed()&&(xt=-xt),r.polygonOffset(xt,it))):ct(r.POLYGON_OFFSET_FILL)}function Ot(H){H?Y(r.SCISSOR_TEST):ct(r.SCISSOR_TEST)}function Qt(H){H===void 0&&(H=r.TEXTURE0+z-1),$!==H&&(r.activeTexture(H),$=H)}function B(H,xt,it){it===void 0&&($===null?it=r.TEXTURE0+z-1:it=$);let yt=Q[it];yt===void 0&&(yt={type:void 0,texture:void 0},Q[it]=yt),(yt.type!==H||yt.texture!==xt)&&($!==it&&(r.activeTexture(it),$=it),r.bindTexture(H,xt||q[H]),yt.type=H,yt.texture=xt)}function De(){let H=Q[$];H!==void 0&&H.type!==void 0&&(r.bindTexture(H.type,null),H.type=void 0,H.texture=void 0)}function ce(){try{r.compressedTexImage2D(...arguments)}catch(H){Wt("WebGLState:",H)}}function P(){try{r.compressedTexImage3D(...arguments)}catch(H){Wt("WebGLState:",H)}}function b(){try{r.texSubImage2D(...arguments)}catch(H){Wt("WebGLState:",H)}}function V(){try{r.texSubImage3D(...arguments)}catch(H){Wt("WebGLState:",H)}}function Z(){try{r.compressedTexSubImage2D(...arguments)}catch(H){Wt("WebGLState:",H)}}function tt(){try{r.compressedTexSubImage3D(...arguments)}catch(H){Wt("WebGLState:",H)}}function dt(){try{r.texStorage2D(...arguments)}catch(H){Wt("WebGLState:",H)}}function pt(){try{r.texStorage3D(...arguments)}catch(H){Wt("WebGLState:",H)}}function et(){try{r.texImage2D(...arguments)}catch(H){Wt("WebGLState:",H)}}function nt(){try{r.texImage3D(...arguments)}catch(H){Wt("WebGLState:",H)}}function mt(H){return u[H]!==void 0?u[H]:r.getParameter(H)}function Ut(H,xt){u[H]!==xt&&(r.pixelStorei(H,xt),u[H]=xt)}function _t(H){It.equals(H)===!1&&(r.scissor(H.x,H.y,H.z,H.w),It.copy(H))}function gt(H){ut.equals(H)===!1&&(r.viewport(H.x,H.y,H.z,H.w),ut.copy(H))}function Ft(H,xt){let it=l.get(xt);it===void 0&&(it=new WeakMap,l.set(xt,it));let yt=it.get(H);yt===void 0&&(yt=r.getUniformBlockIndex(xt,H.name),it.set(H,yt))}function Ht(H,xt){let yt=l.get(xt).get(H);c.get(xt)!==yt&&(r.uniformBlockBinding(xt,yt,H.__bindingPointIndex),c.set(xt,yt))}function Jt(){r.disable(r.BLEND),r.disable(r.CULL_FACE),r.disable(r.DEPTH_TEST),r.disable(r.POLYGON_OFFSET_FILL),r.disable(r.SCISSOR_TEST),r.disable(r.STENCIL_TEST),r.disable(r.SAMPLE_ALPHA_TO_COVERAGE),r.blendEquation(r.FUNC_ADD),r.blendFunc(r.ONE,r.ZERO),r.blendFuncSeparate(r.ONE,r.ZERO,r.ONE,r.ZERO),r.blendColor(0,0,0,0),r.colorMask(!0,!0,!0,!0),r.clearColor(0,0,0,0),r.depthMask(!0),r.depthFunc(r.LESS),o.setReversed(!1),r.clearDepth(1),r.stencilMask(4294967295),r.stencilFunc(r.ALWAYS,0,4294967295),r.stencilOp(r.KEEP,r.KEEP,r.KEEP),r.clearStencil(0),r.cullFace(r.BACK),r.frontFace(r.CCW),r.polygonOffset(0,0),r.activeTexture(r.TEXTURE0),r.bindFramebuffer(r.FRAMEBUFFER,null),r.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),r.bindFramebuffer(r.READ_FRAMEBUFFER,null),r.useProgram(null),r.lineWidth(1),r.scissor(0,0,r.canvas.width,r.canvas.height),r.viewport(0,0,r.canvas.width,r.canvas.height),r.pixelStorei(r.PACK_ALIGNMENT,4),r.pixelStorei(r.UNPACK_ALIGNMENT,4),r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,!1),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,r.BROWSER_DEFAULT_WEBGL),r.pixelStorei(r.PACK_ROW_LENGTH,0),r.pixelStorei(r.PACK_SKIP_PIXELS,0),r.pixelStorei(r.PACK_SKIP_ROWS,0),r.pixelStorei(r.UNPACK_ROW_LENGTH,0),r.pixelStorei(r.UNPACK_IMAGE_HEIGHT,0),r.pixelStorei(r.UNPACK_SKIP_PIXELS,0),r.pixelStorei(r.UNPACK_SKIP_ROWS,0),r.pixelStorei(r.UNPACK_SKIP_IMAGES,0),h={},u={},$=null,Q={},d={},f=new WeakMap,g=[],y=null,p=!1,m=null,_=null,M=null,v=null,w=null,S=null,T=null,x=new ft(0,0,0),E=0,C=!1,R=null,L=null,D=null,I=null,F=null,It.set(0,0,r.canvas.width,r.canvas.height),ut.set(0,0,r.canvas.width,r.canvas.height),s.reset(),o.reset(),a.reset()}return{buffers:{color:s,depth:o,stencil:a},enable:Y,disable:ct,bindFramebuffer:vt,drawBuffers:lt,useProgram:kt,setBlending:ht,setMaterial:at,setFlipSided:Lt,setCullFace:Kt,setLineWidth:qt,setPolygonOffset:$t,setScissorTest:Ot,activeTexture:Qt,bindTexture:B,unbindTexture:De,compressedTexImage2D:ce,compressedTexImage3D:P,texImage2D:et,texImage3D:nt,pixelStorei:Ut,getParameter:mt,updateUBOMapping:Ft,uniformBlockBinding:Ht,texStorage2D:dt,texStorage3D:pt,texSubImage2D:b,texSubImage3D:V,compressedTexSubImage2D:Z,compressedTexSubImage3D:tt,scissor:_t,viewport:gt,reset:Jt}}function xg(r,t,e,i,n,s,o){let a=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new Zt,h=new WeakMap,u=new Set,d,f=new WeakMap,g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function y(P,b){return g?new OffscreenCanvas(P,b):Hs("canvas")}function p(P,b,V){let Z=1,tt=ce(P);if((tt.width>V||tt.height>V)&&(Z=V/Math.max(tt.width,tt.height)),Z<1)if(typeof HTMLImageElement<"u"&&P instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&P instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&P instanceof ImageBitmap||typeof VideoFrame<"u"&&P instanceof VideoFrame){let dt=Math.floor(Z*tt.width),pt=Math.floor(Z*tt.height);d===void 0&&(d=y(dt,pt));let et=b?y(dt,pt):d;return et.width=dt,et.height=pt,et.getContext("2d").drawImage(P,0,0,dt,pt),Gt("WebGLRenderer: Texture has been resized from ("+tt.width+"x"+tt.height+") to ("+dt+"x"+pt+")."),et}else return"data"in P&&Gt("WebGLRenderer: Image in DataTexture is too big ("+tt.width+"x"+tt.height+")."),P;return P}function m(P){return P.generateMipmaps}function _(P){r.generateMipmap(P)}function M(P){return P.isWebGLCubeRenderTarget?r.TEXTURE_CUBE_MAP:P.isWebGL3DRenderTarget?r.TEXTURE_3D:P.isWebGLArrayRenderTarget||P.isCompressedArrayTexture?r.TEXTURE_2D_ARRAY:r.TEXTURE_2D}function v(P,b,V,Z,tt,dt=!1){if(P!==null){if(r[P]!==void 0)return r[P];Gt("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+P+"'")}let pt;Z&&(pt=t.get("EXT_texture_norm16"),pt||Gt("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let et=b;if(b===r.RED&&(V===r.FLOAT&&(et=r.R32F),V===r.HALF_FLOAT&&(et=r.R16F),V===r.UNSIGNED_BYTE&&(et=r.R8),V===r.UNSIGNED_SHORT&&pt&&(et=pt.R16_EXT),V===r.SHORT&&pt&&(et=pt.R16_SNORM_EXT)),b===r.RED_INTEGER&&(V===r.UNSIGNED_BYTE&&(et=r.R8UI),V===r.UNSIGNED_SHORT&&(et=r.R16UI),V===r.UNSIGNED_INT&&(et=r.R32UI),V===r.BYTE&&(et=r.R8I),V===r.SHORT&&(et=r.R16I),V===r.INT&&(et=r.R32I)),b===r.RG&&(V===r.FLOAT&&(et=r.RG32F),V===r.HALF_FLOAT&&(et=r.RG16F),V===r.UNSIGNED_BYTE&&(et=r.RG8),V===r.UNSIGNED_SHORT&&pt&&(et=pt.RG16_EXT),V===r.SHORT&&pt&&(et=pt.RG16_SNORM_EXT)),b===r.RG_INTEGER&&(V===r.UNSIGNED_BYTE&&(et=r.RG8UI),V===r.UNSIGNED_SHORT&&(et=r.RG16UI),V===r.UNSIGNED_INT&&(et=r.RG32UI),V===r.BYTE&&(et=r.RG8I),V===r.SHORT&&(et=r.RG16I),V===r.INT&&(et=r.RG32I)),b===r.RGB_INTEGER&&(V===r.UNSIGNED_BYTE&&(et=r.RGB8UI),V===r.UNSIGNED_SHORT&&(et=r.RGB16UI),V===r.UNSIGNED_INT&&(et=r.RGB32UI),V===r.BYTE&&(et=r.RGB8I),V===r.SHORT&&(et=r.RGB16I),V===r.INT&&(et=r.RGB32I)),b===r.RGBA_INTEGER&&(V===r.UNSIGNED_BYTE&&(et=r.RGBA8UI),V===r.UNSIGNED_SHORT&&(et=r.RGBA16UI),V===r.UNSIGNED_INT&&(et=r.RGBA32UI),V===r.BYTE&&(et=r.RGBA8I),V===r.SHORT&&(et=r.RGBA16I),V===r.INT&&(et=r.RGBA32I)),b===r.RGB&&(V===r.UNSIGNED_SHORT&&pt&&(et=pt.RGB16_EXT),V===r.SHORT&&pt&&(et=pt.RGB16_SNORM_EXT),V===r.UNSIGNED_INT_5_9_9_9_REV&&(et=r.RGB9_E5),V===r.UNSIGNED_INT_10F_11F_11F_REV&&(et=r.R11F_G11F_B10F)),b===r.RGBA){let nt=dt?ks:se.getTransfer(tt);V===r.FLOAT&&(et=r.RGBA32F),V===r.HALF_FLOAT&&(et=r.RGBA16F),V===r.UNSIGNED_BYTE&&(et=nt===ge?r.SRGB8_ALPHA8:r.RGBA8),V===r.UNSIGNED_SHORT&&pt&&(et=pt.RGBA16_EXT),V===r.SHORT&&pt&&(et=pt.RGBA16_SNORM_EXT),V===r.UNSIGNED_SHORT_4_4_4_4&&(et=r.RGBA4),V===r.UNSIGNED_SHORT_5_5_5_1&&(et=r.RGB5_A1)}return(et===r.R16F||et===r.R32F||et===r.RG16F||et===r.RG32F||et===r.RGBA16F||et===r.RGBA32F)&&t.get("EXT_color_buffer_float"),et}function w(P,b){let V;return P?b===null||b===Pi||b===bs?V=r.DEPTH24_STENCIL8:b===Si?V=r.DEPTH32F_STENCIL8:b===Ss&&(V=r.DEPTH24_STENCIL8,Gt("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):b===null||b===Pi||b===bs?V=r.DEPTH_COMPONENT24:b===Si?V=r.DEPTH_COMPONENT32F:b===Ss&&(V=r.DEPTH_COMPONENT16),V}function S(P,b){return m(P)===!0||P.isFramebufferTexture&&P.minFilter!==We&&P.minFilter!==ke?Math.log2(Math.max(b.width,b.height))+1:P.mipmaps!==void 0&&P.mipmaps.length>0?P.mipmaps.length:P.isCompressedTexture&&Array.isArray(P.image)?b.mipmaps.length:1}function T(P){let b=P.target;b.removeEventListener("dispose",T),E(b),b.isVideoTexture&&h.delete(b),b.isHTMLTexture&&u.delete(b)}function x(P){let b=P.target;b.removeEventListener("dispose",x),R(b)}function E(P){let b=i.get(P);if(b.__webglInit===void 0)return;let V=P.source,Z=f.get(V);if(Z){let tt=Z[b.__cacheKey];tt.usedTimes--,tt.usedTimes===0&&C(P),Object.keys(Z).length===0&&f.delete(V)}i.remove(P)}function C(P){let b=i.get(P);r.deleteTexture(b.__webglTexture);let V=P.source,Z=f.get(V);delete Z[b.__cacheKey],o.memory.textures--}function R(P){let b=i.get(P);if(P.depthTexture&&(P.depthTexture.dispose(),i.remove(P.depthTexture)),P.isWebGLCubeRenderTarget)for(let Z=0;Z<6;Z++){if(Array.isArray(b.__webglFramebuffer[Z]))for(let tt=0;tt<b.__webglFramebuffer[Z].length;tt++)r.deleteFramebuffer(b.__webglFramebuffer[Z][tt]);else r.deleteFramebuffer(b.__webglFramebuffer[Z]);b.__webglDepthbuffer&&r.deleteRenderbuffer(b.__webglDepthbuffer[Z])}else{if(Array.isArray(b.__webglFramebuffer))for(let Z=0;Z<b.__webglFramebuffer.length;Z++)r.deleteFramebuffer(b.__webglFramebuffer[Z]);else r.deleteFramebuffer(b.__webglFramebuffer);if(b.__webglDepthbuffer&&r.deleteRenderbuffer(b.__webglDepthbuffer),b.__webglMultisampledFramebuffer&&r.deleteFramebuffer(b.__webglMultisampledFramebuffer),b.__webglColorRenderbuffer)for(let Z=0;Z<b.__webglColorRenderbuffer.length;Z++)b.__webglColorRenderbuffer[Z]&&r.deleteRenderbuffer(b.__webglColorRenderbuffer[Z]);b.__webglDepthRenderbuffer&&r.deleteRenderbuffer(b.__webglDepthRenderbuffer)}let V=P.textures;for(let Z=0,tt=V.length;Z<tt;Z++){let dt=i.get(V[Z]);dt.__webglTexture&&(r.deleteTexture(dt.__webglTexture),o.memory.textures--),i.remove(V[Z])}i.remove(P)}let L=0;function D(){L=0}function I(){return L}function F(P){L=P}function z(){let P=L;return P>=n.maxTextures&&Gt("WebGLTextures: Trying to use "+(P+1)+" texture units while this GPU supports only "+n.maxTextures),L+=1,P}function G(P){let b=[];return b.push(P.wrapS),b.push(P.wrapT),b.push(P.wrapR||0),b.push(P.magFilter),b.push(P.minFilter),b.push(P.anisotropy),b.push(P.internalFormat),b.push(P.format),b.push(P.type),b.push(P.generateMipmaps),b.push(P.premultiplyAlpha),b.push(P.flipY),b.push(P.unpackAlignment),b.push(P.colorSpace),b.join()}function K(P,b){let V=i.get(P);if(P.isVideoTexture&&B(P),P.isRenderTargetTexture===!1&&P.isExternalTexture!==!0&&P.version>0&&V.__version!==P.version){let Z=P.image;if(Z===null)Gt("WebGLRenderer: Texture marked for update but no image data found.");else if(Z.complete===!1)Gt("WebGLRenderer: Texture marked for update but image is incomplete");else{ct(V,P,b);return}}else P.isExternalTexture&&(V.__webglTexture=P.sourceTexture?P.sourceTexture:null);e.bindTexture(r.TEXTURE_2D,V.__webglTexture,r.TEXTURE0+b)}function N(P,b){let V=i.get(P);if(P.isRenderTargetTexture===!1&&P.version>0&&V.__version!==P.version){ct(V,P,b);return}else P.isExternalTexture&&(V.__webglTexture=P.sourceTexture?P.sourceTexture:null);e.bindTexture(r.TEXTURE_2D_ARRAY,V.__webglTexture,r.TEXTURE0+b)}function $(P,b){let V=i.get(P);if(P.isRenderTargetTexture===!1&&P.version>0&&V.__version!==P.version){ct(V,P,b);return}e.bindTexture(r.TEXTURE_3D,V.__webglTexture,r.TEXTURE0+b)}function Q(P,b){let V=i.get(P);if(P.isCubeDepthTexture!==!0&&P.version>0&&V.__version!==P.version){vt(V,P,b);return}e.bindTexture(r.TEXTURE_CUBE_MAP,V.__webglTexture,r.TEXTURE0+b)}let ot={[Bn]:r.REPEAT,[Oi]:r.CLAMP_TO_EDGE,[ro]:r.MIRRORED_REPEAT},st={[We]:r.NEAREST,[Oh]:r.NEAREST_MIPMAP_NEAREST,[cr]:r.NEAREST_MIPMAP_LINEAR,[ke]:r.LINEAR,[Fo]:r.LINEAR_MIPMAP_NEAREST,[Yi]:r.LINEAR_MIPMAP_LINEAR},It={[Vh]:r.NEVER,[$h]:r.ALWAYS,[Wh]:r.LESS,[_a]:r.LEQUAL,[Xh]:r.EQUAL,[Ma]:r.GEQUAL,[qh]:r.GREATER,[Yh]:r.NOTEQUAL};function ut(P,b){if(b.type===Si&&t.has("OES_texture_float_linear")===!1&&(b.magFilter===ke||b.magFilter===Fo||b.magFilter===cr||b.magFilter===Yi||b.minFilter===ke||b.minFilter===Fo||b.minFilter===cr||b.minFilter===Yi)&&Gt("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),r.texParameteri(P,r.TEXTURE_WRAP_S,ot[b.wrapS]),r.texParameteri(P,r.TEXTURE_WRAP_T,ot[b.wrapT]),(P===r.TEXTURE_3D||P===r.TEXTURE_2D_ARRAY)&&r.texParameteri(P,r.TEXTURE_WRAP_R,ot[b.wrapR]),r.texParameteri(P,r.TEXTURE_MAG_FILTER,st[b.magFilter]),r.texParameteri(P,r.TEXTURE_MIN_FILTER,st[b.minFilter]),b.compareFunction&&(r.texParameteri(P,r.TEXTURE_COMPARE_MODE,r.COMPARE_REF_TO_TEXTURE),r.texParameteri(P,r.TEXTURE_COMPARE_FUNC,It[b.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(b.magFilter===We||b.minFilter!==cr&&b.minFilter!==Yi||b.type===Si&&t.has("OES_texture_float_linear")===!1)return;if(b.anisotropy>1||i.get(b).__currentAnisotropy){let V=t.get("EXT_texture_filter_anisotropic");r.texParameterf(P,V.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(b.anisotropy,n.getMaxAnisotropy())),i.get(b).__currentAnisotropy=b.anisotropy}}}function Pt(P,b){let V=!1;P.__webglInit===void 0&&(P.__webglInit=!0,b.addEventListener("dispose",T));let Z=b.source,tt=f.get(Z);tt===void 0&&(tt={},f.set(Z,tt));let dt=G(b);if(dt!==P.__cacheKey){tt[dt]===void 0&&(tt[dt]={texture:r.createTexture(),usedTimes:0},o.memory.textures++,V=!0),tt[dt].usedTimes++;let pt=tt[P.__cacheKey];pt!==void 0&&(tt[P.__cacheKey].usedTimes--,pt.usedTimes===0&&C(b)),P.__cacheKey=dt,P.__webglTexture=tt[dt].texture}return V}function q(P,b,V){return Math.floor(Math.floor(P/V)/b)}function Y(P,b,V,Z){let dt=P.updateRanges;if(dt.length===0)e.texSubImage2D(r.TEXTURE_2D,0,0,0,b.width,b.height,V,Z,b.data);else{dt.sort((Ut,_t)=>Ut.start-_t.start);let pt=0;for(let Ut=1;Ut<dt.length;Ut++){let _t=dt[pt],gt=dt[Ut],Ft=_t.start+_t.count,Ht=q(gt.start,b.width,4),Jt=q(_t.start,b.width,4);gt.start<=Ft+1&&Ht===Jt&&q(gt.start+gt.count-1,b.width,4)===Ht?_t.count=Math.max(_t.count,gt.start+gt.count-_t.start):(++pt,dt[pt]=gt)}dt.length=pt+1;let et=e.getParameter(r.UNPACK_ROW_LENGTH),nt=e.getParameter(r.UNPACK_SKIP_PIXELS),mt=e.getParameter(r.UNPACK_SKIP_ROWS);e.pixelStorei(r.UNPACK_ROW_LENGTH,b.width);for(let Ut=0,_t=dt.length;Ut<_t;Ut++){let gt=dt[Ut],Ft=Math.floor(gt.start/4),Ht=Math.ceil(gt.count/4),Jt=Ft%b.width,H=Math.floor(Ft/b.width),xt=Ht,it=1;e.pixelStorei(r.UNPACK_SKIP_PIXELS,Jt),e.pixelStorei(r.UNPACK_SKIP_ROWS,H),e.texSubImage2D(r.TEXTURE_2D,0,Jt,H,xt,it,V,Z,b.data)}P.clearUpdateRanges(),e.pixelStorei(r.UNPACK_ROW_LENGTH,et),e.pixelStorei(r.UNPACK_SKIP_PIXELS,nt),e.pixelStorei(r.UNPACK_SKIP_ROWS,mt)}}function ct(P,b,V){let Z=r.TEXTURE_2D;(b.isDataArrayTexture||b.isCompressedArrayTexture)&&(Z=r.TEXTURE_2D_ARRAY),b.isData3DTexture&&(Z=r.TEXTURE_3D);let tt=Pt(P,b),dt=b.source;e.bindTexture(Z,P.__webglTexture,r.TEXTURE0+V);let pt=i.get(dt);if(dt.version!==pt.__version||tt===!0){if(e.activeTexture(r.TEXTURE0+V),(typeof ImageBitmap<"u"&&b.image instanceof ImageBitmap)===!1){let it=se.getPrimaries(se.workingColorSpace),yt=b.colorSpace===sn?null:se.getPrimaries(b.colorSpace),Et=b.colorSpace===sn||it===yt?r.NONE:r.BROWSER_DEFAULT_WEBGL;e.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,b.flipY),e.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),e.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,Et)}e.pixelStorei(r.UNPACK_ALIGNMENT,b.unpackAlignment);let nt=p(b.image,!1,n.maxTextureSize);nt=De(b,nt);let mt=s.convert(b.format,b.colorSpace),Ut=s.convert(b.type),_t=v(b.internalFormat,mt,Ut,b.normalized,b.colorSpace,b.isVideoTexture);ut(Z,b);let gt,Ft=b.mipmaps,Ht=b.isVideoTexture!==!0,Jt=pt.__version===void 0||tt===!0,H=dt.dataReady,xt=S(b,nt);if(b.isDepthTexture)_t=w(b.format===Tn,b.type),Jt&&(Ht?e.texStorage2D(r.TEXTURE_2D,1,_t,nt.width,nt.height):e.texImage2D(r.TEXTURE_2D,0,_t,nt.width,nt.height,0,mt,Ut,null));else if(b.isDataTexture)if(Ft.length>0){Ht&&Jt&&e.texStorage2D(r.TEXTURE_2D,xt,_t,Ft[0].width,Ft[0].height);for(let it=0,yt=Ft.length;it<yt;it++)gt=Ft[it],Ht?H&&e.texSubImage2D(r.TEXTURE_2D,it,0,0,gt.width,gt.height,mt,Ut,gt.data):e.texImage2D(r.TEXTURE_2D,it,_t,gt.width,gt.height,0,mt,Ut,gt.data);b.generateMipmaps=!1}else Ht?(Jt&&e.texStorage2D(r.TEXTURE_2D,xt,_t,nt.width,nt.height),H&&Y(b,nt,mt,Ut)):e.texImage2D(r.TEXTURE_2D,0,_t,nt.width,nt.height,0,mt,Ut,nt.data);else if(b.isCompressedTexture)if(b.isCompressedArrayTexture){Ht&&Jt&&e.texStorage3D(r.TEXTURE_2D_ARRAY,xt,_t,Ft[0].width,Ft[0].height,nt.depth);for(let it=0,yt=Ft.length;it<yt;it++)if(gt=Ft[it],b.format!==ri)if(mt!==null)if(Ht){if(H)if(b.layerUpdates.size>0){let Et=tc(gt.width,gt.height,b.format,b.type);for(let rt of b.layerUpdates){let zt=gt.data.subarray(rt*Et/gt.data.BYTES_PER_ELEMENT,(rt+1)*Et/gt.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,it,0,0,rt,gt.width,gt.height,1,mt,zt)}}else e.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,it,0,0,0,gt.width,gt.height,nt.depth,mt,gt.data)}else e.compressedTexImage3D(r.TEXTURE_2D_ARRAY,it,_t,gt.width,gt.height,nt.depth,0,gt.data,0,0);else Gt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ht?H&&e.texSubImage3D(r.TEXTURE_2D_ARRAY,it,0,0,0,gt.width,gt.height,nt.depth,mt,Ut,gt.data):e.texImage3D(r.TEXTURE_2D_ARRAY,it,_t,gt.width,gt.height,nt.depth,0,mt,Ut,gt.data);b.layerUpdates.size>0&&b.clearLayerUpdates()}else{Ht&&Jt&&e.texStorage2D(r.TEXTURE_2D,xt,_t,Ft[0].width,Ft[0].height);for(let it=0,yt=Ft.length;it<yt;it++)gt=Ft[it],b.format!==ri?mt!==null?Ht?H&&e.compressedTexSubImage2D(r.TEXTURE_2D,it,0,0,gt.width,gt.height,mt,gt.data):e.compressedTexImage2D(r.TEXTURE_2D,it,_t,gt.width,gt.height,0,gt.data):Gt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ht?H&&e.texSubImage2D(r.TEXTURE_2D,it,0,0,gt.width,gt.height,mt,Ut,gt.data):e.texImage2D(r.TEXTURE_2D,it,_t,gt.width,gt.height,0,mt,Ut,gt.data)}else if(b.isDataArrayTexture)if(Ht){if(Jt&&e.texStorage3D(r.TEXTURE_2D_ARRAY,xt,_t,nt.width,nt.height,nt.depth),H)if(b.layerUpdates.size>0){let it=tc(nt.width,nt.height,b.format,b.type);for(let yt of b.layerUpdates){let Et=nt.data.subarray(yt*it/nt.data.BYTES_PER_ELEMENT,(yt+1)*it/nt.data.BYTES_PER_ELEMENT);e.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,yt,nt.width,nt.height,1,mt,Ut,Et)}b.clearLayerUpdates()}else e.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,0,nt.width,nt.height,nt.depth,mt,Ut,nt.data)}else e.texImage3D(r.TEXTURE_2D_ARRAY,0,_t,nt.width,nt.height,nt.depth,0,mt,Ut,nt.data);else if(b.isData3DTexture)Ht?(Jt&&e.texStorage3D(r.TEXTURE_3D,xt,_t,nt.width,nt.height,nt.depth),H&&e.texSubImage3D(r.TEXTURE_3D,0,0,0,0,nt.width,nt.height,nt.depth,mt,Ut,nt.data)):e.texImage3D(r.TEXTURE_3D,0,_t,nt.width,nt.height,nt.depth,0,mt,Ut,nt.data);else if(b.isFramebufferTexture){if(Jt)if(Ht)e.texStorage2D(r.TEXTURE_2D,xt,_t,nt.width,nt.height);else{let it=nt.width,yt=nt.height;for(let Et=0;Et<xt;Et++)e.texImage2D(r.TEXTURE_2D,Et,_t,it,yt,0,mt,Ut,null),it>>=1,yt>>=1}}else if(b.isHTMLTexture){if("texElementImage2D"in r){let it=r.canvas;if(it.hasAttribute("layoutsubtree")||it.setAttribute("layoutsubtree","true"),nt.parentNode!==it){it.appendChild(nt),u.add(b),it.onpaint=yt=>{let Et=yt.changedElements;for(let rt of u)Et.includes(rt.image)&&(rt.needsUpdate=!0)},it.requestPaint();return}if(r.texElementImage2D.length===3)r.texElementImage2D(r.TEXTURE_2D,r.RGBA8,nt);else{let Et=r.RGBA,rt=r.RGBA,zt=r.UNSIGNED_BYTE;r.texElementImage2D(r.TEXTURE_2D,0,Et,rt,zt,nt)}r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MIN_FILTER,r.LINEAR),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_S,r.CLAMP_TO_EDGE),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_T,r.CLAMP_TO_EDGE)}}else if(Ft.length>0){if(Ht&&Jt){let it=ce(Ft[0]);e.texStorage2D(r.TEXTURE_2D,xt,_t,it.width,it.height)}for(let it=0,yt=Ft.length;it<yt;it++)gt=Ft[it],Ht?H&&e.texSubImage2D(r.TEXTURE_2D,it,0,0,mt,Ut,gt):e.texImage2D(r.TEXTURE_2D,it,_t,mt,Ut,gt);b.generateMipmaps=!1}else if(Ht){if(Jt){let it=ce(nt);e.texStorage2D(r.TEXTURE_2D,xt,_t,it.width,it.height)}H&&e.texSubImage2D(r.TEXTURE_2D,0,0,0,mt,Ut,nt)}else e.texImage2D(r.TEXTURE_2D,0,_t,mt,Ut,nt);m(b)&&_(Z),pt.__version=dt.version,b.onUpdate&&b.onUpdate(b)}P.__version=b.version}function vt(P,b,V){if(b.image.length!==6)return;let Z=Pt(P,b),tt=b.source;e.bindTexture(r.TEXTURE_CUBE_MAP,P.__webglTexture,r.TEXTURE0+V);let dt=i.get(tt);if(tt.version!==dt.__version||Z===!0){e.activeTexture(r.TEXTURE0+V);let pt=se.getPrimaries(se.workingColorSpace),et=b.colorSpace===sn?null:se.getPrimaries(b.colorSpace),nt=b.colorSpace===sn||pt===et?r.NONE:r.BROWSER_DEFAULT_WEBGL;e.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,b.flipY),e.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),e.pixelStorei(r.UNPACK_ALIGNMENT,b.unpackAlignment),e.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,nt);let mt=b.isCompressedTexture||b.image[0].isCompressedTexture,Ut=b.image[0]&&b.image[0].isDataTexture,_t=[];for(let rt=0;rt<6;rt++)!mt&&!Ut?_t[rt]=p(b.image[rt],!0,n.maxCubemapSize):_t[rt]=Ut?b.image[rt].image:b.image[rt],_t[rt]=De(b,_t[rt]);let gt=_t[0],Ft=s.convert(b.format,b.colorSpace),Ht=s.convert(b.type),Jt=v(b.internalFormat,Ft,Ht,b.normalized,b.colorSpace),H=b.isVideoTexture!==!0,xt=dt.__version===void 0||Z===!0,it=tt.dataReady,yt=S(b,gt);ut(r.TEXTURE_CUBE_MAP,b);let Et;if(mt){H&&xt&&e.texStorage2D(r.TEXTURE_CUBE_MAP,yt,Jt,gt.width,gt.height);for(let rt=0;rt<6;rt++){Et=_t[rt].mipmaps;for(let zt=0;zt<Et.length;zt++){let Dt=Et[zt];b.format!==ri?Ft!==null?H?it&&e.compressedTexSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+rt,zt,0,0,Dt.width,Dt.height,Ft,Dt.data):e.compressedTexImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+rt,zt,Jt,Dt.width,Dt.height,0,Dt.data):Gt("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):H?it&&e.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+rt,zt,0,0,Dt.width,Dt.height,Ft,Ht,Dt.data):e.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+rt,zt,Jt,Dt.width,Dt.height,0,Ft,Ht,Dt.data)}}}else{if(Et=b.mipmaps,H&&xt){Et.length>0&&yt++;let rt=ce(_t[0]);e.texStorage2D(r.TEXTURE_CUBE_MAP,yt,Jt,rt.width,rt.height)}for(let rt=0;rt<6;rt++)if(Ut){H?it&&e.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+rt,0,0,0,_t[rt].width,_t[rt].height,Ft,Ht,_t[rt].data):e.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+rt,0,Jt,_t[rt].width,_t[rt].height,0,Ft,Ht,_t[rt].data);for(let zt=0;zt<Et.length;zt++){let Me=Et[zt].image[rt].image;H?it&&e.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+rt,zt+1,0,0,Me.width,Me.height,Ft,Ht,Me.data):e.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+rt,zt+1,Jt,Me.width,Me.height,0,Ft,Ht,Me.data)}}else{H?it&&e.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+rt,0,0,0,Ft,Ht,_t[rt]):e.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+rt,0,Jt,Ft,Ht,_t[rt]);for(let zt=0;zt<Et.length;zt++){let Dt=Et[zt];H?it&&e.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+rt,zt+1,0,0,Ft,Ht,Dt.image[rt]):e.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+rt,zt+1,Jt,Ft,Ht,Dt.image[rt])}}}m(b)&&_(r.TEXTURE_CUBE_MAP),dt.__version=tt.version,b.onUpdate&&b.onUpdate(b)}P.__version=b.version}function lt(P,b,V,Z,tt,dt){let pt=s.convert(V.format,V.colorSpace),et=s.convert(V.type),nt=v(V.internalFormat,pt,et,V.normalized,V.colorSpace),mt=i.get(b),Ut=i.get(V);if(Ut.__renderTarget=b,!mt.__hasExternalTextures){let _t=Math.max(1,b.width>>dt),gt=Math.max(1,b.height>>dt);tt===r.TEXTURE_3D||tt===r.TEXTURE_2D_ARRAY?e.texImage3D(tt,dt,nt,_t,gt,b.depth,0,pt,et,null):e.texImage2D(tt,dt,nt,_t,gt,0,pt,et,null)}e.bindFramebuffer(r.FRAMEBUFFER,P),Qt(b)?a.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,Z,tt,Ut.__webglTexture,0,Ot(b)):(tt===r.TEXTURE_2D||tt>=r.TEXTURE_CUBE_MAP_POSITIVE_X&&tt<=r.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&r.framebufferTexture2D(r.FRAMEBUFFER,Z,tt,Ut.__webglTexture,dt),e.bindFramebuffer(r.FRAMEBUFFER,null)}function kt(P,b,V){if(r.bindRenderbuffer(r.RENDERBUFFER,P),b.depthBuffer){let Z=b.depthTexture,tt=Z&&Z.isDepthTexture?Z.type:null,dt=w(b.stencilBuffer,tt),pt=b.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT;Qt(b)?a.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,Ot(b),dt,b.width,b.height):V?r.renderbufferStorageMultisample(r.RENDERBUFFER,Ot(b),dt,b.width,b.height):r.renderbufferStorage(r.RENDERBUFFER,dt,b.width,b.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,pt,r.RENDERBUFFER,P)}else{let Z=b.textures;for(let tt=0;tt<Z.length;tt++){let dt=Z[tt],pt=s.convert(dt.format,dt.colorSpace),et=s.convert(dt.type),nt=v(dt.internalFormat,pt,et,dt.normalized,dt.colorSpace);Qt(b)?a.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,Ot(b),nt,b.width,b.height):V?r.renderbufferStorageMultisample(r.RENDERBUFFER,Ot(b),nt,b.width,b.height):r.renderbufferStorage(r.RENDERBUFFER,nt,b.width,b.height)}}r.bindRenderbuffer(r.RENDERBUFFER,null)}function le(P,b,V){let Z=b.isWebGLCubeRenderTarget===!0;if(e.bindFramebuffer(r.FRAMEBUFFER,P),!(b.depthTexture&&b.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let tt=i.get(b.depthTexture);if(tt.__renderTarget=b,(!tt.__webglTexture||b.depthTexture.image.width!==b.width||b.depthTexture.image.height!==b.height)&&(b.depthTexture.image.width=b.width,b.depthTexture.image.height=b.height,b.depthTexture.needsUpdate=!0),Z){if(tt.__webglInit===void 0&&(tt.__webglInit=!0,b.depthTexture.addEventListener("dispose",T)),tt.__webglTexture===void 0){tt.__webglTexture=r.createTexture(),e.bindTexture(r.TEXTURE_CUBE_MAP,tt.__webglTexture),ut(r.TEXTURE_CUBE_MAP,b.depthTexture);let mt=s.convert(b.depthTexture.format),Ut=s.convert(b.depthTexture.type),_t;b.depthTexture.format===ki?_t=r.DEPTH_COMPONENT24:b.depthTexture.format===Tn&&(_t=r.DEPTH24_STENCIL8);for(let gt=0;gt<6;gt++)r.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+gt,0,_t,b.width,b.height,0,mt,Ut,null)}}else K(b.depthTexture,0);let dt=tt.__webglTexture,pt=Ot(b),et=Z?r.TEXTURE_CUBE_MAP_POSITIVE_X+V:r.TEXTURE_2D,nt=b.depthTexture.format===Tn?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT;if(b.depthTexture.format===ki)Qt(b)?a.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,nt,et,dt,0,pt):r.framebufferTexture2D(r.FRAMEBUFFER,nt,et,dt,0);else if(b.depthTexture.format===Tn)Qt(b)?a.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,nt,et,dt,0,pt):r.framebufferTexture2D(r.FRAMEBUFFER,nt,et,dt,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function Xt(P){let b=i.get(P),V=P.isWebGLCubeRenderTarget===!0;if(b.__boundDepthTexture!==P.depthTexture){let Z=P.depthTexture;if(b.__depthDisposeCallback&&b.__depthDisposeCallback(),Z){let tt=()=>{delete b.__boundDepthTexture,delete b.__depthDisposeCallback,Z.removeEventListener("dispose",tt)};Z.addEventListener("dispose",tt),b.__depthDisposeCallback=tt}b.__boundDepthTexture=Z}if(P.depthTexture&&!b.__autoAllocateDepthBuffer)if(V)for(let Z=0;Z<6;Z++)le(b.__webglFramebuffer[Z],P,Z);else{let Z=P.texture.mipmaps;Z&&Z.length>0?le(b.__webglFramebuffer[0],P,0):le(b.__webglFramebuffer,P,0)}else if(V){b.__webglDepthbuffer=[];for(let Z=0;Z<6;Z++)if(e.bindFramebuffer(r.FRAMEBUFFER,b.__webglFramebuffer[Z]),b.__webglDepthbuffer[Z]===void 0)b.__webglDepthbuffer[Z]=r.createRenderbuffer(),kt(b.__webglDepthbuffer[Z],P,!1);else{let tt=P.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,dt=b.__webglDepthbuffer[Z];r.bindRenderbuffer(r.RENDERBUFFER,dt),r.framebufferRenderbuffer(r.FRAMEBUFFER,tt,r.RENDERBUFFER,dt)}}else{let Z=P.texture.mipmaps;if(Z&&Z.length>0?e.bindFramebuffer(r.FRAMEBUFFER,b.__webglFramebuffer[0]):e.bindFramebuffer(r.FRAMEBUFFER,b.__webglFramebuffer),b.__webglDepthbuffer===void 0)b.__webglDepthbuffer=r.createRenderbuffer(),kt(b.__webglDepthbuffer,P,!1);else{let tt=P.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,dt=b.__webglDepthbuffer;r.bindRenderbuffer(r.RENDERBUFFER,dt),r.framebufferRenderbuffer(r.FRAMEBUFFER,tt,r.RENDERBUFFER,dt)}}e.bindFramebuffer(r.FRAMEBUFFER,null)}function ht(P,b,V){let Z=i.get(P);b!==void 0&&lt(Z.__webglFramebuffer,P,P.texture,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,0),V!==void 0&&Xt(P)}function at(P){let b=P.texture,V=i.get(P),Z=i.get(b);P.addEventListener("dispose",x);let tt=P.textures,dt=P.isWebGLCubeRenderTarget===!0,pt=tt.length>1;if(pt||(Z.__webglTexture===void 0&&(Z.__webglTexture=r.createTexture()),Z.__version=b.version,o.memory.textures++),dt){V.__webglFramebuffer=[];for(let et=0;et<6;et++)if(b.mipmaps&&b.mipmaps.length>0){V.__webglFramebuffer[et]=[];for(let nt=0;nt<b.mipmaps.length;nt++)V.__webglFramebuffer[et][nt]=r.createFramebuffer()}else V.__webglFramebuffer[et]=r.createFramebuffer()}else{if(b.mipmaps&&b.mipmaps.length>0){V.__webglFramebuffer=[];for(let et=0;et<b.mipmaps.length;et++)V.__webglFramebuffer[et]=r.createFramebuffer()}else V.__webglFramebuffer=r.createFramebuffer();if(pt)for(let et=0,nt=tt.length;et<nt;et++){let mt=i.get(tt[et]);mt.__webglTexture===void 0&&(mt.__webglTexture=r.createTexture(),o.memory.textures++)}if(P.samples>0&&Qt(P)===!1){V.__webglMultisampledFramebuffer=r.createFramebuffer(),V.__webglColorRenderbuffer=[],e.bindFramebuffer(r.FRAMEBUFFER,V.__webglMultisampledFramebuffer);for(let et=0;et<tt.length;et++){let nt=tt[et];V.__webglColorRenderbuffer[et]=r.createRenderbuffer(),r.bindRenderbuffer(r.RENDERBUFFER,V.__webglColorRenderbuffer[et]);let mt=s.convert(nt.format,nt.colorSpace),Ut=s.convert(nt.type),_t=v(nt.internalFormat,mt,Ut,nt.normalized,nt.colorSpace,P.isXRRenderTarget===!0),gt=Ot(P);r.renderbufferStorageMultisample(r.RENDERBUFFER,gt,_t,P.width,P.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+et,r.RENDERBUFFER,V.__webglColorRenderbuffer[et])}r.bindRenderbuffer(r.RENDERBUFFER,null),P.depthBuffer&&(V.__webglDepthRenderbuffer=r.createRenderbuffer(),kt(V.__webglDepthRenderbuffer,P,!0)),e.bindFramebuffer(r.FRAMEBUFFER,null)}}if(dt){e.bindTexture(r.TEXTURE_CUBE_MAP,Z.__webglTexture),ut(r.TEXTURE_CUBE_MAP,b);for(let et=0;et<6;et++)if(b.mipmaps&&b.mipmaps.length>0)for(let nt=0;nt<b.mipmaps.length;nt++)lt(V.__webglFramebuffer[et][nt],P,b,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+et,nt);else lt(V.__webglFramebuffer[et],P,b,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+et,0);m(b)&&_(r.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(pt){for(let et=0,nt=tt.length;et<nt;et++){let mt=tt[et],Ut=i.get(mt),_t=r.TEXTURE_2D;(P.isWebGL3DRenderTarget||P.isWebGLArrayRenderTarget)&&(_t=P.isWebGL3DRenderTarget?r.TEXTURE_3D:r.TEXTURE_2D_ARRAY),e.bindTexture(_t,Ut.__webglTexture),ut(_t,mt),lt(V.__webglFramebuffer,P,mt,r.COLOR_ATTACHMENT0+et,_t,0),m(mt)&&_(_t)}e.unbindTexture()}else{let et=r.TEXTURE_2D;if((P.isWebGL3DRenderTarget||P.isWebGLArrayRenderTarget)&&(et=P.isWebGL3DRenderTarget?r.TEXTURE_3D:r.TEXTURE_2D_ARRAY),e.bindTexture(et,Z.__webglTexture),ut(et,b),b.mipmaps&&b.mipmaps.length>0)for(let nt=0;nt<b.mipmaps.length;nt++)lt(V.__webglFramebuffer[nt],P,b,r.COLOR_ATTACHMENT0,et,nt);else lt(V.__webglFramebuffer,P,b,r.COLOR_ATTACHMENT0,et,0);m(b)&&_(et),e.unbindTexture()}P.depthBuffer&&Xt(P)}function Lt(P){let b=P.textures;for(let V=0,Z=b.length;V<Z;V++){let tt=b[V];if(m(tt)){let dt=M(P),pt=i.get(tt).__webglTexture;e.bindTexture(dt,pt),_(dt),e.unbindTexture()}}}let Kt=[],qt=[];function $t(P){if(P.samples>0){if(Qt(P)===!1){let b=P.textures,V=P.width,Z=P.height,tt=r.COLOR_BUFFER_BIT,dt=P.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,pt=i.get(P),et=b.length>1;if(et)for(let mt=0;mt<b.length;mt++)e.bindFramebuffer(r.FRAMEBUFFER,pt.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+mt,r.RENDERBUFFER,null),e.bindFramebuffer(r.FRAMEBUFFER,pt.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+mt,r.TEXTURE_2D,null,0);e.bindFramebuffer(r.READ_FRAMEBUFFER,pt.__webglMultisampledFramebuffer);let nt=P.texture.mipmaps;nt&&nt.length>0?e.bindFramebuffer(r.DRAW_FRAMEBUFFER,pt.__webglFramebuffer[0]):e.bindFramebuffer(r.DRAW_FRAMEBUFFER,pt.__webglFramebuffer);for(let mt=0;mt<b.length;mt++){if(P.resolveDepthBuffer&&(P.depthBuffer&&(tt|=r.DEPTH_BUFFER_BIT),P.stencilBuffer&&P.resolveStencilBuffer&&(tt|=r.STENCIL_BUFFER_BIT)),et){r.framebufferRenderbuffer(r.READ_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.RENDERBUFFER,pt.__webglColorRenderbuffer[mt]);let Ut=i.get(b[mt]).__webglTexture;r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,Ut,0)}r.blitFramebuffer(0,0,V,Z,0,0,V,Z,tt,r.NEAREST),c===!0&&(Kt.length=0,qt.length=0,Kt.push(r.COLOR_ATTACHMENT0+mt),P.depthBuffer&&P.storeMultisampledDepthBuffer===!1&&(Kt.push(dt),qt.push(dt),r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,qt)),r.invalidateFramebuffer(r.READ_FRAMEBUFFER,Kt))}if(e.bindFramebuffer(r.READ_FRAMEBUFFER,null),e.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),et)for(let mt=0;mt<b.length;mt++){e.bindFramebuffer(r.FRAMEBUFFER,pt.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+mt,r.RENDERBUFFER,pt.__webglColorRenderbuffer[mt]);let Ut=i.get(b[mt]).__webglTexture;e.bindFramebuffer(r.FRAMEBUFFER,pt.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+mt,r.TEXTURE_2D,Ut,0)}e.bindFramebuffer(r.DRAW_FRAMEBUFFER,pt.__webglMultisampledFramebuffer)}else if(P.depthBuffer&&P.storeMultisampledDepthBuffer===!1&&c){let b=P.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT;r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,[b])}}}function Ot(P){return Math.min(n.maxSamples,P.samples)}function Qt(P){let b=i.get(P);return P.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&b.__useRenderToTexture!==!1}function B(P){let b=o.render.frame;h.get(P)!==b&&(h.set(P,b),P.update())}function De(P,b){let V=P.colorSpace,Z=P.format,tt=P.type;return P.isCompressedTexture===!0||P.isVideoTexture===!0||V!==Os&&V!==sn&&(se.getTransfer(V)===ge?(Z!==ri||tt!==li)&&Gt("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Wt("WebGLTextures: Unsupported texture color space:",V)),b}function ce(P){return typeof HTMLImageElement<"u"&&P instanceof HTMLImageElement?(l.width=P.naturalWidth||P.width,l.height=P.naturalHeight||P.height):typeof VideoFrame<"u"&&P instanceof VideoFrame?(l.width=P.displayWidth,l.height=P.displayHeight):(l.width=P.width,l.height=P.height),l}this.allocateTextureUnit=z,this.resetTextureUnits=D,this.getTextureUnits=I,this.setTextureUnits=F,this.setTexture2D=K,this.setTexture2DArray=N,this.setTexture3D=$,this.setTextureCube=Q,this.rebindTextures=ht,this.setupRenderTarget=at,this.updateRenderTargetMipmap=Lt,this.updateMultisampleRenderTarget=$t,this.setupDepthRenderbuffer=Xt,this.setupFrameBufferTexture=lt,this.useMultisampledRTT=Qt,this.isReversedDepthBuffer=function(){return e.buffers.depth.getReversed()}}function yg(r,t){function e(i,n=sn){let s,o=se.getTransfer(n);if(i===li)return r.UNSIGNED_BYTE;if(i===zo)return r.UNSIGNED_SHORT_4_4_4_4;if(i===Oo)return r.UNSIGNED_SHORT_5_5_5_1;if(i===Xl)return r.UNSIGNED_INT_5_9_9_9_REV;if(i===ql)return r.UNSIGNED_INT_10F_11F_11F_REV;if(i===Vl)return r.BYTE;if(i===Wl)return r.SHORT;if(i===Ss)return r.UNSIGNED_SHORT;if(i===Bo)return r.INT;if(i===Pi)return r.UNSIGNED_INT;if(i===Si)return r.FLOAT;if(i===Li)return r.HALF_FLOAT;if(i===Yl)return r.ALPHA;if(i===$l)return r.RGB;if(i===ri)return r.RGBA;if(i===ki)return r.DEPTH_COMPONENT;if(i===Tn)return r.DEPTH_STENCIL;if(i===ko)return r.RED;if(i===Ho)return r.RED_INTEGER;if(i===An)return r.RG;if(i===Go)return r.RG_INTEGER;if(i===Vo)return r.RGBA_INTEGER;if(i===hr||i===dr||i===ur||i===fr)if(o===ge)if(s=t.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(i===hr)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===dr)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===ur)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===fr)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=t.get("WEBGL_compressed_texture_s3tc"),s!==null){if(i===hr)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===dr)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===ur)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===fr)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Wo||i===Xo||i===qo||i===Yo)if(s=t.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(i===Wo)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Xo)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===qo)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Yo)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===$o||i===Zo||i===Qo||i===Jo||i===Ko||i===pr||i===jo)if(s=t.get("WEBGL_compressed_texture_etc"),s!==null){if(i===$o||i===Zo)return o===ge?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(i===Qo)return o===ge?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC;if(i===Jo)return s.COMPRESSED_R11_EAC;if(i===Ko)return s.COMPRESSED_SIGNED_R11_EAC;if(i===pr)return s.COMPRESSED_RG11_EAC;if(i===jo)return s.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===ta||i===ea||i===ia||i===na||i===sa||i===ra||i===oa||i===aa||i===la||i===ca||i===ha||i===da||i===ua||i===fa)if(s=t.get("WEBGL_compressed_texture_astc"),s!==null){if(i===ta)return o===ge?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===ea)return o===ge?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===ia)return o===ge?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===na)return o===ge?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===sa)return o===ge?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===ra)return o===ge?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===oa)return o===ge?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===aa)return o===ge?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===la)return o===ge?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===ca)return o===ge?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===ha)return o===ge?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===da)return o===ge?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===ua)return o===ge?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===fa)return o===ge?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===pa||i===ma||i===ga)if(s=t.get("EXT_texture_compression_bptc"),s!==null){if(i===pa)return o===ge?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===ma)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===ga)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===xa||i===ya||i===mr||i===va)if(s=t.get("EXT_texture_compression_rgtc"),s!==null){if(i===xa)return s.COMPRESSED_RED_RGTC1_EXT;if(i===ya)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===mr)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===va)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===bs?r.UNSIGNED_INT_24_8:r[i]!==void 0?r[i]:null}return{convert:e}}var vg=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,_g=`
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

}`,vc=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){let i=new $s(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=i}}getMesh(t){if(this.texture!==null&&this.mesh===null){let e=t.cameras[0].viewport,i=new Oe({vertexShader:vg,fragmentShader:_g,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new wt(new Ks(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},_c=class extends Hi{constructor(t,e){super();let i=this,n=null,s=1,o=null,a="local-floor",c=1,l=null,h=null,u=null,d=null,f=null,g=null,y=typeof XRWebGLBinding<"u",p=new vc,m={},_=e.getContextAttributes(),M=null,v=null,w=[],S=[],T=new Zt,x=null,E=null,C=new Ke;C.viewport=new Pe;let R=new Ke;R.viewport=new Pe;let L=[C,R],D=new Lo,I=null,F=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(q){let Y=w[q];return Y===void 0&&(Y=new xs,w[q]=Y),Y.getTargetRaySpace()},this.getControllerGrip=function(q){let Y=w[q];return Y===void 0&&(Y=new xs,w[q]=Y),Y.getGripSpace()},this.getHand=function(q){let Y=w[q];return Y===void 0&&(Y=new xs,w[q]=Y),Y.getHandSpace()};function z(q){let Y=S.indexOf(q.inputSource);if(Y===-1)return;let ct=w[Y];ct!==void 0&&(ct.update(q.inputSource,q.frame,l||o),ct.dispatchEvent({type:q.type,data:q.inputSource}))}function G(){n.removeEventListener("select",z),n.removeEventListener("selectstart",z),n.removeEventListener("selectend",z),n.removeEventListener("squeeze",z),n.removeEventListener("squeezestart",z),n.removeEventListener("squeezeend",z),n.removeEventListener("end",G),n.removeEventListener("inputsourceschange",K);for(let q=0;q<w.length;q++){let Y=S[q];Y!==null&&(S[q]=null,w[q].disconnect(Y))}I=null,F=null,p.reset();for(let q in m)delete m[q];if(t.setRenderTarget(M),f=null,d=null,u=null,n=null,v=null,Pt.stop(),i.isPresenting=!1,t.setPixelRatio(x),t.setSize(T.width,T.height,!1),E!==null){let q=E.camera;q.fov=E.fov,q.zoom=E.zoom,q.updateProjectionMatrix(),E=null}i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(q){s=q,i.isPresenting===!0&&Gt("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(q){a=q,i.isPresenting===!0&&Gt("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||o},this.setReferenceSpace=function(q){l=q},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return u===null&&y&&(u=new XRWebGLBinding(n,e)),u},this.getFrame=function(){return g},this.getSession=function(){return n},this.setSession=async function(q){if(n=q,n!==null){if(M=t.getRenderTarget(),n.addEventListener("select",z),n.addEventListener("selectstart",z),n.addEventListener("selectend",z),n.addEventListener("squeeze",z),n.addEventListener("squeezestart",z),n.addEventListener("squeezeend",z),n.addEventListener("end",G),n.addEventListener("inputsourceschange",K),_.xrCompatible!==!0&&await e.makeXRCompatible(),x=t.getPixelRatio(),t.getSize(T),y&&"createProjectionLayer"in XRWebGLBinding.prototype){let ct=null,vt=null,lt=null;_.depth&&(lt=_.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,ct=_.stencil?Tn:ki,vt=_.stencil?bs:Pi);let kt={colorFormat:e.RGBA8,depthFormat:lt,scaleFactor:s};u=this.getBinding(),d=u.createProjectionLayer(kt),n.updateRenderState({layers:[d]}),t.setPixelRatio(1),t.setSize(d.textureWidth,d.textureHeight,!1),v=new ai(d.textureWidth,d.textureHeight,{format:ri,type:li,depthTexture:new yn(d.textureWidth,d.textureHeight,vt,void 0,void 0,void 0,void 0,void 0,void 0,ct),stencilBuffer:_.stencil,colorSpace:t.outputColorSpace,samples:_.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}else{let ct={antialias:_.antialias,alpha:!0,depth:_.depth,stencil:_.stencil,framebufferScaleFactor:s};f=new XRWebGLLayer(n,e,ct),n.updateRenderState({baseLayer:f}),t.setPixelRatio(1),t.setSize(f.framebufferWidth,f.framebufferHeight,!1),v=new ai(f.framebufferWidth,f.framebufferHeight,{format:ri,type:li,colorSpace:t.outputColorSpace,stencilBuffer:_.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}v.isXRRenderTarget=!0,this.setFoveation(c),l=null,o=await n.requestReferenceSpace(a),Pt.setContext(n),Pt.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(n!==null)return n.environmentBlendMode},this.getDepthTexture=function(){return p.getDepthTexture()};function K(q){for(let Y=0;Y<q.removed.length;Y++){let ct=q.removed[Y],vt=S.indexOf(ct);vt>=0&&(S[vt]=null,w[vt].disconnect(ct))}for(let Y=0;Y<q.added.length;Y++){let ct=q.added[Y],vt=S.indexOf(ct);if(vt===-1){for(let kt=0;kt<w.length;kt++)if(kt>=S.length){S.push(ct),vt=kt;break}else if(S[kt]===null){S[kt]=ct,vt=kt;break}if(vt===-1)break}let lt=w[vt];lt&&lt.connect(ct)}}let N=new k,$=new k;function Q(q,Y,ct){N.setFromMatrixPosition(Y.matrixWorld),$.setFromMatrixPosition(ct.matrixWorld);let vt=N.distanceTo($),lt=Y.projectionMatrix.elements,kt=ct.projectionMatrix.elements,le=lt[14]/(lt[10]-1),Xt=lt[14]/(lt[10]+1),ht=(lt[9]+1)/lt[5],at=(lt[9]-1)/lt[5],Lt=(lt[8]-1)/lt[0],Kt=(kt[8]+1)/kt[0],qt=le*Lt,$t=le*Kt,Ot=vt/(-Lt+Kt),Qt=Ot*-Lt;if(Y.matrixWorld.decompose(q.position,q.quaternion,q.scale),q.translateX(Qt),q.translateZ(Ot),q.matrixWorld.compose(q.position,q.quaternion,q.scale),q.matrixWorldInverse.copy(q.matrixWorld).invert(),lt[10]===-1)q.projectionMatrix.copy(Y.projectionMatrix),q.projectionMatrixInverse.copy(Y.projectionMatrixInverse);else{let B=le+Ot,De=Xt+Ot,ce=qt-Qt,P=$t+(vt-Qt),b=ht*Xt/De*B,V=at*Xt/De*B;q.projectionMatrix.makePerspective(ce,P,b,V,B,De),q.projectionMatrixInverse.copy(q.projectionMatrix).invert()}}function ot(q,Y){Y===null?q.matrixWorld.copy(q.matrix):q.matrixWorld.multiplyMatrices(Y.matrixWorld,q.matrix),q.matrixWorldInverse.copy(q.matrixWorld).invert()}this.updateCamera=function(q){if(n===null)return;let Y=q.near,ct=q.far;p.texture!==null&&(p.depthNear>0&&(Y=p.depthNear),p.depthFar>0&&(ct=p.depthFar)),D.near=R.near=C.near=Y,D.far=R.far=C.far=ct,(I!==D.near||F!==D.far)&&(n.updateRenderState({depthNear:D.near,depthFar:D.far}),I=D.near,F=D.far),D.layers.mask=q.layers.mask|6,C.layers.mask=D.layers.mask&-5,R.layers.mask=D.layers.mask&-3;let vt=q.parent,lt=D.cameras;ot(D,vt);for(let kt=0;kt<lt.length;kt++)ot(lt[kt],vt);lt.length===2?Q(D,C,R):D.projectionMatrix.copy(C.projectionMatrix),E===null&&q.isPerspectiveCamera&&(E={camera:q,fov:q.fov,zoom:q.zoom}),st(q,D,vt)};function st(q,Y,ct){ct===null?q.matrix.copy(Y.matrixWorld):(q.matrix.copy(ct.matrixWorld),q.matrix.invert(),q.matrix.multiply(Y.matrixWorld)),q.matrix.decompose(q.position,q.quaternion,q.scale),q.updateMatrixWorld(!0),q.projectionMatrix.copy(Y.projectionMatrix),q.projectionMatrixInverse.copy(Y.projectionMatrixInverse),q.isPerspectiveCamera&&(q.fov=ao*2*Math.atan(1/q.projectionMatrix.elements[5]),q.zoom=1)}this.getCamera=function(){return D},this.getFoveation=function(){if(!(d===null&&f===null))return c},this.setFoveation=function(q){c=q,d!==null&&(d.fixedFoveation=q),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=q)},this.hasDepthSensing=function(){return p.texture!==null},this.getDepthSensingMesh=function(){return p.getMesh(D)},this.getCameraTexture=function(q){return m[q]};let It=null;function ut(q,Y){if(h=Y.getViewerPose(l||o),g=Y,h!==null){let ct=h.views;f!==null&&(t.setRenderTargetFramebuffer(v,f.framebuffer),t.setRenderTarget(v));let vt=!1;ct.length!==D.cameras.length&&(D.cameras.length=0,vt=!0);for(let Xt=0;Xt<ct.length;Xt++){let ht=ct[Xt],at=null;if(f!==null)at=f.getViewport(ht);else{let Kt=u.getViewSubImage(d,ht);at=Kt.viewport,Xt===0&&(t.setRenderTargetTextures(v,Kt.colorTexture,Kt.depthStencilTexture),t.setRenderTarget(v))}let Lt=L[Xt];Lt===void 0&&(Lt=new Ke,Lt.layers.enable(Xt),Lt.viewport=new Pe,L[Xt]=Lt),Lt.matrix.fromArray(ht.transform.matrix),Lt.matrix.decompose(Lt.position,Lt.quaternion,Lt.scale),Lt.projectionMatrix.fromArray(ht.projectionMatrix),Lt.projectionMatrixInverse.copy(Lt.projectionMatrix).invert(),Lt.viewport.set(at.x,at.y,at.width,at.height),Xt===0&&(D.matrix.copy(Lt.matrix),D.matrix.decompose(D.position,D.quaternion,D.scale)),vt===!0&&D.cameras.push(Lt)}let lt=n.enabledFeatures;if(lt&&lt.includes("depth-sensing")&&n.depthUsage=="gpu-optimized"&&y){u=i.getBinding();let Xt=u.getDepthInformation(ct[0]);Xt&&Xt.isValid&&Xt.texture&&p.init(Xt,n.renderState)}if(lt&&lt.includes("camera-access")&&y){t.state.unbindTexture(),u=i.getBinding();for(let Xt=0;Xt<ct.length;Xt++){let ht=ct[Xt].camera;if(ht){let at=m[ht];at||(at=new $s,m[ht]=at);let Lt=u.getCameraImage(ht);at.sourceTexture=Lt}}}}for(let ct=0;ct<w.length;ct++){let vt=S[ct],lt=w[ct];vt!==null&&lt!==void 0&&lt.update(vt,Y,l||o)}It&&It(q,Y),Y.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:Y}),g=null}let Pt=new Ed;Pt.setAnimationLoop(ut),this.setAnimationLoop=function(q){It=q},this.dispose=function(){}}},Mg=new ue,Pd=new Yt;Pd.set(-1,0,0,0,1,0,0,0,1);function Sg(r,t){function e(p,m){p.matrixAutoUpdate===!0&&p.updateMatrix(),m.value.copy(p.matrix)}function i(p,m){m.color.getRGB(p.fogColor.value,Jl(r)),m.isFog?(p.fogNear.value=m.near,p.fogFar.value=m.far):m.isFogExp2&&(p.fogDensity.value=m.density)}function n(p,m,_,M,v){m.isNodeMaterial?m.uniformsNeedUpdate=!1:m.isMeshBasicMaterial?s(p,m):m.isMeshLambertMaterial?(s(p,m),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)):m.isMeshToonMaterial?(s(p,m),u(p,m)):m.isMeshPhongMaterial?(s(p,m),h(p,m),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)):m.isMeshStandardMaterial?(s(p,m),d(p,m),m.isMeshPhysicalMaterial&&f(p,m,v)):m.isMeshMatcapMaterial?(s(p,m),g(p,m)):m.isMeshDepthMaterial?s(p,m):m.isMeshDistanceMaterial?(s(p,m),y(p,m)):m.isMeshNormalMaterial?s(p,m):m.isLineBasicMaterial?(o(p,m),m.isLineDashedMaterial&&a(p,m)):m.isPointsMaterial?c(p,m,_,M):m.isSpriteMaterial?l(p,m):m.isShadowMaterial?(p.color.value.copy(m.color),p.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function s(p,m){p.opacity.value=m.opacity,m.color&&p.diffuse.value.copy(m.color),m.emissive&&p.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(p.map.value=m.map,e(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,e(m.alphaMap,p.alphaMapTransform)),m.bumpMap&&(p.bumpMap.value=m.bumpMap,e(m.bumpMap,p.bumpMapTransform),p.bumpScale.value=m.bumpScale,m.side===si&&(p.bumpScale.value*=-1)),m.normalMap&&(p.normalMap.value=m.normalMap,e(m.normalMap,p.normalMapTransform),p.normalScale.value.copy(m.normalScale),m.side===si&&p.normalScale.value.negate()),m.displacementMap&&(p.displacementMap.value=m.displacementMap,e(m.displacementMap,p.displacementMapTransform),p.displacementScale.value=m.displacementScale,p.displacementBias.value=m.displacementBias),m.emissiveMap&&(p.emissiveMap.value=m.emissiveMap,e(m.emissiveMap,p.emissiveMapTransform)),m.specularMap&&(p.specularMap.value=m.specularMap,e(m.specularMap,p.specularMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest);let _=t.get(m),M=_.envMap,v=_.envMapRotation;M&&(p.envMap.value=M,p.envMapRotation.value.setFromMatrix4(Mg.makeRotationFromEuler(v)).transpose(),M.isCubeTexture&&M.isRenderTargetTexture===!1&&p.envMapRotation.value.premultiply(Pd),p.reflectivity.value=m.reflectivity,p.ior.value=m.ior,p.refractionRatio.value=m.refractionRatio),m.lightMap&&(p.lightMap.value=m.lightMap,p.lightMapIntensity.value=m.lightMapIntensity,e(m.lightMap,p.lightMapTransform)),m.aoMap&&(p.aoMap.value=m.aoMap,p.aoMapIntensity.value=m.aoMapIntensity,e(m.aoMap,p.aoMapTransform))}function o(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,m.map&&(p.map.value=m.map,e(m.map,p.mapTransform))}function a(p,m){p.dashSize.value=m.dashSize,p.totalSize.value=m.dashSize+m.gapSize,p.scale.value=m.scale}function c(p,m,_,M){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.size.value=m.size*_,p.scale.value=M*.5,m.map&&(p.map.value=m.map,e(m.map,p.uvTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,e(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function l(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.rotation.value=m.rotation,m.map&&(p.map.value=m.map,e(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,e(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function h(p,m){p.specular.value.copy(m.specular),p.shininess.value=Math.max(m.shininess,1e-4)}function u(p,m){m.gradientMap&&(p.gradientMap.value=m.gradientMap)}function d(p,m){p.metalness.value=m.metalness,m.metalnessMap&&(p.metalnessMap.value=m.metalnessMap,e(m.metalnessMap,p.metalnessMapTransform)),p.roughness.value=m.roughness,m.roughnessMap&&(p.roughnessMap.value=m.roughnessMap,e(m.roughnessMap,p.roughnessMapTransform)),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)}function f(p,m,_){p.ior.value=m.ior,m.sheen>0&&(p.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),p.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(p.sheenColorMap.value=m.sheenColorMap,e(m.sheenColorMap,p.sheenColorMapTransform)),m.sheenRoughnessMap&&(p.sheenRoughnessMap.value=m.sheenRoughnessMap,e(m.sheenRoughnessMap,p.sheenRoughnessMapTransform))),m.clearcoat>0&&(p.clearcoat.value=m.clearcoat,p.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(p.clearcoatMap.value=m.clearcoatMap,e(m.clearcoatMap,p.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,e(m.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(p.clearcoatNormalMap.value=m.clearcoatNormalMap,e(m.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===si&&p.clearcoatNormalScale.value.negate())),m.dispersion>0&&(p.dispersion.value=m.dispersion),m.retroreflectivity>0&&(p.retroreflectivity.value=m.retroreflectivity),m.iridescence>0&&(p.iridescence.value=m.iridescence,p.iridescenceIOR.value=m.iridescenceIOR,p.iridescenceThicknessMinimum.value=m.iridescenceThicknessRange[0],p.iridescenceThicknessMaximum.value=m.iridescenceThicknessRange[1],m.iridescenceMap&&(p.iridescenceMap.value=m.iridescenceMap,e(m.iridescenceMap,p.iridescenceMapTransform)),m.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=m.iridescenceThicknessMap,e(m.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),m.transmission>0&&(p.transmission.value=m.transmission,p.transmissionSamplerMap.value=_.texture,p.transmissionSamplerSize.value.set(_.width,_.height),m.transmissionMap&&(p.transmissionMap.value=m.transmissionMap,e(m.transmissionMap,p.transmissionMapTransform)),p.thickness.value=m.thickness,m.thicknessMap&&(p.thicknessMap.value=m.thicknessMap,e(m.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=m.attenuationDistance,p.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(p.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(p.anisotropyMap.value=m.anisotropyMap,e(m.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=m.specularIntensity,p.specularColor.value.copy(m.specularColor),m.specularColorMap&&(p.specularColorMap.value=m.specularColorMap,e(m.specularColorMap,p.specularColorMapTransform)),m.specularIntensityMap&&(p.specularIntensityMap.value=m.specularIntensityMap,e(m.specularIntensityMap,p.specularIntensityMapTransform))}function g(p,m){m.matcap&&(p.matcap.value=m.matcap)}function y(p,m){let _=t.get(m).light;p.referencePosition.value.setFromMatrixPosition(_.matrixWorld),p.nearDistance.value=_.shadow.camera.near,p.farDistance.value=_.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:n}}function bg(r,t,e,i){let n={},s={},o=[],a=r.getParameter(r.MAX_UNIFORM_BUFFER_BINDINGS);function c(v,w){let S=w.program;i.uniformBlockBinding(v,S)}function l(v,w){let S=n[v.id];S===void 0&&(p(v),S=h(v),n[v.id]=S,v.addEventListener("dispose",_));let T=w.program;i.updateUBOMapping(v,T);let x=t.render.frame;s[v.id]!==x&&(d(v),s[v.id]=x)}function h(v){let w=u();v.__bindingPointIndex=w;let S=r.createBuffer(),T=v.__size,x=v.usage;return r.bindBuffer(r.UNIFORM_BUFFER,S),r.bufferData(r.UNIFORM_BUFFER,T,x),r.bindBuffer(r.UNIFORM_BUFFER,null),r.bindBufferBase(r.UNIFORM_BUFFER,w,S),S}function u(){for(let v=0;v<a;v++)if(o.indexOf(v)===-1)return o.push(v),v;return Wt("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(v){let w=n[v.id],S=v.uniforms,T=v.__cache;r.bindBuffer(r.UNIFORM_BUFFER,w);for(let x=0,E=S.length;x<E;x++){let C=S[x];if(Array.isArray(C))for(let R=0,L=C.length;R<L;R++)f(C[R],x,R,T);else f(C,x,0,T)}r.bindBuffer(r.UNIFORM_BUFFER,null)}function f(v,w,S,T){if(y(v,w,S,T)===!0){let x=v.__offset,E=v.value;if(Array.isArray(E)){let C=0;for(let R=0;R<E.length;R++){let L=E[R],D=m(L);g(L,v.__data,C),typeof L!="number"&&typeof L!="boolean"&&!L.isMatrix3&&!ArrayBuffer.isView(L)&&(C+=D.storage/Float32Array.BYTES_PER_ELEMENT)}}else g(E,v.__data,0);r.bufferSubData(r.UNIFORM_BUFFER,x,v.__data)}}function g(v,w,S){typeof v=="number"||typeof v=="boolean"?w[0]=v:v.isMatrix3?(w[0]=v.elements[0],w[1]=v.elements[1],w[2]=v.elements[2],w[3]=0,w[4]=v.elements[3],w[5]=v.elements[4],w[6]=v.elements[5],w[7]=0,w[8]=v.elements[6],w[9]=v.elements[7],w[10]=v.elements[8],w[11]=0):ArrayBuffer.isView(v)?w.set(new v.constructor(v.buffer,v.byteOffset,w.length)):v.toArray(w,S)}function y(v,w,S,T){let x=v.value,E=w+"_"+S;if(T[E]===void 0)return typeof x=="number"||typeof x=="boolean"?T[E]=x:ArrayBuffer.isView(x)?T[E]=x.slice():T[E]=x.clone(),!0;{let C=T[E];if(typeof x=="number"||typeof x=="boolean"){if(C!==x)return T[E]=x,!0}else{if(ArrayBuffer.isView(x))return!0;if(C.equals(x)===!1)return C.copy(x),!0}}return!1}function p(v){let w=v.uniforms,S=0,T=16;for(let E=0,C=w.length;E<C;E++){let R=Array.isArray(w[E])?w[E]:[w[E]];for(let L=0,D=R.length;L<D;L++){let I=R[L],F=Array.isArray(I.value)?I.value:[I.value];for(let z=0,G=F.length;z<G;z++){let K=F[z],N=m(K),$=S%T,Q=$%N.boundary,ot=$+Q;S+=Q,ot!==0&&T-ot<N.storage&&(S+=T-ot),I.__data=new Float32Array(N.storage/Float32Array.BYTES_PER_ELEMENT),I.__offset=S,S+=N.storage}}}let x=S%T;return x>0&&(S+=T-x),v.__size=S,v.__cache={},this}function m(v){let w={boundary:0,storage:0};return typeof v=="number"||typeof v=="boolean"?(w.boundary=4,w.storage=4):v.isVector2?(w.boundary=8,w.storage=8):v.isVector3||v.isColor?(w.boundary=16,w.storage=12):v.isVector4?(w.boundary=16,w.storage=16):v.isMatrix3?(w.boundary=48,w.storage=48):v.isMatrix4?(w.boundary=64,w.storage=64):v.isTexture?Gt("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(v)?(w.boundary=16,w.storage=v.byteLength):Gt("WebGLRenderer: Unsupported uniform value type.",v),w}function _(v){let w=v.target;w.removeEventListener("dispose",_);let S=o.indexOf(w.__bindingPointIndex);o.splice(S,1),r.deleteBuffer(n[w.id]),delete n[w.id],delete s[w.id]}function M(){for(let v in n)r.deleteBuffer(n[v]);o=[],n={},s={}}return{bind:c,update:l,dispose:M}}var wg=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),$i=null;function Eg(){return $i===null&&($i=new gn(wg,16,16,An,Li),$i.name="DFG_LUT",$i.minFilter=ke,$i.magFilter=ke,$i.wrapS=Oi,$i.wrapT=Oi,$i.generateMipmaps=!1,$i.needsUpdate=!0),$i}var Ta=class{constructor(t={}){let{canvas:e=Qh(),context:i=null,depth:n=!0,stencil:s=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1,outputBufferType:f=li}=t;this.isWebGLRenderer=!0;let g;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=i.getContextAttributes().alpha}else g=o;let y=f,p=new Set([Vo,Go,Ho]),m=new Set([li,Pi,Ss,bs,zo,Oo]),_=new Uint32Array(4),M=new Int32Array(4),v=new k,w=null,S=null,T=[],x=[],E=null;this.domElement=e,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Ii,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let C=this,R=!1,L=null,D=null,I=null,F=null;this._outputColorSpace=ii;let z=0,G=0,K=null,N=-1,$=null,Q=new Pe,ot=new Pe,st=null,It=new ft(0),ut=0,Pt=e.width,q=e.height,Y=1,ct=null,vt=null,lt=new Pe(0,0,Pt,q),kt=new Pe(0,0,Pt,q),le=!1,Xt=new ys,ht=!1,at=!1,Lt=new ue,Kt=new k,qt=new Pe,$t={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Ot=!1;function Qt(){return K===null?Y:1}let B=i;function De(A,O){return e.getContext(A,O)}let ce,P,b,V,Z,tt,dt,pt,et,nt,mt,Ut,_t,gt,Ft,Ht,Jt,H,xt,it,yt,Et,rt;try{let A={alpha:!0,depth:n,stencil:s,antialias:a,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${"186"}`),e.addEventListener("webglcontextlost",Me,!1),e.addEventListener("webglcontextrestored",pe,!1),e.addEventListener("webglcontextcreationerror",wi,!1),B===null){let O="webgl2";if(B=De(O,A),B===null)throw De(O)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}zt()}catch(A){throw e.removeEventListener("webglcontextlost",Me,!1),e.removeEventListener("webglcontextrestored",pe,!1),e.removeEventListener("webglcontextcreationerror",wi,!1),Wt("WebGLRenderer: "+A.message),A}function zt(){ce=new Lm(B),ce.init(),yt=new yg(B,ce),P=new Sm(B,ce,t,yt),b=new gg(B,ce),P.reversedDepthBuffer&&d&&b.buffers.depth.setReversed(!0),D=B.createFramebuffer(),I=B.createFramebuffer(),F=B.createFramebuffer(),V=new Um(B),Z=new ig,tt=new xg(B,ce,b,Z,P,yt,V),dt=new Pm(C),pt=new Fu(B),Et=new _m(B,pt),et=new Dm(B,pt,V,Et),nt=new Bm(B,et,pt,Et,V),H=new Fm(B,P,tt),Ft=new bm(Z),mt=new eg(C,dt,ce,P,Et,Ft),Ut=new Sg(C,Z),_t=new sg,gt=new hg(ce),Jt=new vm(C,dt,b,nt,g,c),Ht=new mg(C,nt,P),rt=new bg(B,V,P,b),xt=new Mm(B,ce,V),it=new Nm(B,ce,V),V.programs=mt.programs,C.capabilities=P,C.extensions=ce,C.properties=Z,C.renderLists=_t,C.shadowMap=Ht,C.state=b,C.info=V}y!==li&&(E=new Om(y,e.width,e.height,a,n,s));let Dt=new _c(C,B);this.xr=Dt,this.getContext=function(){return B},this.getContextAttributes=function(){return B.getContextAttributes()},this.forceContextLoss=function(){let A=ce.get("WEBGL_lose_context");A&&A.loseContext()},this.forceContextRestore=function(){let A=ce.get("WEBGL_lose_context");A&&A.restoreContext()},this.getPixelRatio=function(){return Y},this.setPixelRatio=function(A){A!==void 0&&(Y=A,this.setSize(Pt,q,!1))},this.getSize=function(A){return A.set(Pt,q)},this.setSize=function(A,O,j=!0){if(Dt.isPresenting){Gt("WebGLRenderer: Can't change size while VR device is presenting.");return}Pt=A,q=O,e.width=Math.floor(A*Y),e.height=Math.floor(O*Y),j===!0&&(e.style.width=A+"px",e.style.height=O+"px"),E!==null&&E.setSize(e.width,e.height),this.setViewport(0,0,A,O)},this.getDrawingBufferSize=function(A){return A.set(Pt*Y,q*Y).floor()},this.setDrawingBufferSize=function(A,O,j){Pt=A,q=O,Y=j,e.width=Math.floor(A*j),e.height=Math.floor(O*j),this.setViewport(0,0,A,O)},this.setEffects=function(A){if(y===li){Wt("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(A){for(let O=0;O<A.length;O++)if(A[O].isOutputPass===!0){Gt("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}E.setEffects(A||[])},this.getCurrentViewport=function(A){return A.copy(Q)},this.getViewport=function(A){return A.copy(lt)},this.setViewport=function(A,O,j,W){A.isVector4?lt.set(A.x,A.y,A.z,A.w):lt.set(A,O,j,W),b.viewport(Q.copy(lt).multiplyScalar(Y).round())},this.getScissor=function(A){return A.copy(kt)},this.setScissor=function(A,O,j,W){A.isVector4?kt.set(A.x,A.y,A.z,A.w):kt.set(A,O,j,W),b.scissor(ot.copy(kt).multiplyScalar(Y).round())},this.getScissorTest=function(){return le},this.setScissorTest=function(A){b.setScissorTest(le=A)},this.setOpaqueSort=function(A){ct=A},this.setTransparentSort=function(A){vt=A},this.getClearColor=function(A){return A.copy(Jt.getClearColor())},this.setClearColor=function(){Jt.setClearColor(...arguments)},this.getClearAlpha=function(){return Jt.getClearAlpha()},this.setClearAlpha=function(){Jt.setClearAlpha(...arguments)},this.clear=function(A=!0,O=!0,j=!0){let W=0;if(A){let X=!1;if(K!==null){let bt=K.texture.format;X=p.has(bt)}if(X){let bt=K.texture.type,At=m.has(bt),St=Jt.getClearColor(),Ct=Jt.getClearAlpha(),Nt=St.r,jt=St.g,ie=St.b;At?(_[0]=Nt,_[1]=jt,_[2]=ie,_[3]=Ct,B.clearBufferuiv(B.COLOR,0,_)):(M[0]=Nt,M[1]=jt,M[2]=ie,M[3]=Ct,B.clearBufferiv(B.COLOR,0,M))}else W|=B.COLOR_BUFFER_BIT}O&&(W|=B.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),j&&(W|=B.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),W!==0&&B.clear(W)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(A){A.setRenderer(this),L=A},this.dispose=function(){e.removeEventListener("webglcontextlost",Me,!1),e.removeEventListener("webglcontextrestored",pe,!1),e.removeEventListener("webglcontextcreationerror",wi,!1),Jt.dispose(),_t.dispose(),gt.dispose(),Z.dispose(),dt.dispose(),nt.dispose(),Et.dispose(),rt.dispose(),mt.dispose(),Dt.dispose(),Dt.removeEventListener("sessionstart",Ic),Dt.removeEventListener("sessionend",Pc),Pn.stop()};function Me(A){A.preventDefault(),Ql("WebGLRenderer: Context Lost."),R=!0}function pe(){Ql("WebGLRenderer: Context Restored."),R=!1;let A=V.autoReset,O=Ht.enabled,j=Ht.autoUpdate,W=Ht.needsUpdate,X=Ht.type;zt(),V.autoReset=A,Ht.enabled=O,Ht.autoUpdate=j,Ht.needsUpdate=W,Ht.type=X}function wi(A){Wt("WebGLRenderer: A WebGL context could not be created. Reason: ",A.statusMessage)}function Fi(A){let O=A.target;O.removeEventListener("dispose",Fi),qd(O)}function qd(A){Yd(A),Z.remove(A)}function Yd(A){let O=Z.get(A).programs;O!==void 0&&(O.forEach(function(j){mt.releaseProgram(j)}),A.isShaderMaterial&&mt.releaseShaderCache(A))}this.renderBufferDirect=function(A,O,j,W,X,bt){O===null&&(O=$t);let At=X.isMesh&&X.matrixWorld.determinantAffine()<0,St=Qd(A,O,j,W,X);b.setMaterial(W,At);let Ct=j.index,Nt=1;if(W.wireframe===!0){if(Ct=et.getWireframeAttribute(j),Ct===void 0)return;Nt=2}let jt=j.drawRange,ie=j.attributes.position,Rt=jt.start*Nt,me=(jt.start+jt.count)*Nt;bt!==null&&(Rt=Math.max(Rt,bt.start*Nt),me=Math.min(me,(bt.start+bt.count)*Nt)),Ct!==null?(Rt=Math.max(Rt,0),me=Math.min(me,Ct.count)):ie!=null&&(Rt=Math.max(Rt,0),me=Math.min(me,ie.count));let Fe=me-Rt;if(Fe<0||Fe===1/0)return;Et.setup(X,W,St,j,Ct);let Te,ve=xt;if(Ct!==null&&(Te=pt.get(Ct),ve=it,ve.setIndex(Te)),X.isMesh)W.wireframe===!0?(b.setLineWidth(W.wireframeLinewidth*Qt()),ve.setMode(B.LINES)):ve.setMode(B.TRIANGLES);else if(X.isLine){let Ze=W.linewidth;Ze===void 0&&(Ze=1),b.setLineWidth(Ze*Qt()),X.isLineSegments?ve.setMode(B.LINES):X.isLineLoop?ve.setMode(B.LINE_LOOP):ve.setMode(B.LINE_STRIP)}else X.isPoints?ve.setMode(B.POINTS):X.isSprite&&ve.setMode(B.TRIANGLES);if(X.isBatchedMesh)if(ce.get("WEBGL_multi_draw"))ve.renderMultiDraw(X._multiDrawStarts,X._multiDrawCounts,X._multiDrawCount);else{let Ze=X._multiDrawStarts,Tt=X._multiDrawCounts,ei=X._multiDrawCount,oe=Ct?pt.get(Ct).bytesPerElement:1,vi=Z.get(W).currentProgram.getUniforms();for(let Bi=0;Bi<ei;Bi++)vi.setValue(B,"_gl_DrawID",Bi),ve.render(Ze[Bi]/oe,Tt[Bi])}else if(X.isInstancedMesh)ve.renderInstances(Rt,Fe,X.count);else if(j.isInstancedBufferGeometry){let Ze=j._maxInstanceCount!==void 0?j._maxInstanceCount:1/0,Tt=Math.min(j.instanceCount,Ze);ve.renderInstances(Rt,Fe,Tt)}else ve.render(Rt,Fe)};function Rc(A,O,j,W){L!==null&&A.isNodeMaterial&&L.setObject(W,A),ht===!0&&Ft.setState(A,j,!1),A.transparent===!0&&A.side===Xe&&A.forceSinglePass===!1?(A.side=si,A.needsUpdate=!0,Er(A,O,W),A.side=Xi,A.needsUpdate=!0,Er(A,O,W),A.side=Xe):Er(A,O,W)}this.compile=function(A,O,j=null){j===null&&(j=A),L!==null&&L.renderStart(A,O,j),S=gt.get(j),S.init(O),x.push(S),j.traverseVisible(function(X){X.isLight&&X.layers.test(O.layers)&&(S.pushLight(X),X.castShadow&&S.pushShadow(X))}),A!==j&&A.traverseVisible(function(X){X.isLight&&X.layers.test(O.layers)&&(S.pushLight(X),X.castShadow&&S.pushShadow(X))}),S.setupLights(),L!==null&&L.updateLights(S.state.lightsArray),at=this.localClippingEnabled,ht=Ft.init(this.clippingPlanes,at),ht===!0&&Ft.setGlobalState(this.clippingPlanes,O),L!==null&&Ht.render(S.state.shadowsArray,j,O);let W=new Set;return A.traverse(function(X){if(!(X.isMesh||X.isPoints||X.isLine||X.isSprite))return;let bt=X.material;if(bt)if(Array.isArray(bt))for(let At=0;At<bt.length;At++){let St=bt[At];Rc(St,j,O,X),W.add(St)}else Rc(bt,j,O,X),W.add(bt)}),S=x.pop(),L!==null&&L.renderEnd(),W},this.compileAsync=function(A,O,j=null){let W=this.compile(A,O,j);return new Promise(X=>{function bt(){if(W.forEach(function(At){let Ct=Z.get(At).currentProgram;(Ct===void 0||Ct.isReady())&&W.delete(At)}),W.size===0){X(A);return}setTimeout(bt,10)}ce.get("KHR_parallel_shader_compile")!==null?bt():setTimeout(bt,10)})};let $a=null;function $d(A){$a&&$a(A)}function Ic(){Pn.stop()}function Pc(){Pn.start()}let Pn=new Ed;Pn.setAnimationLoop($d),typeof self<"u"&&Pn.setContext(self),this.setAnimationLoop=function(A){$a=A,Dt.setAnimationLoop(A),A===null?Pn.stop():Pn.start()},Dt.addEventListener("sessionstart",Ic),Dt.addEventListener("sessionend",Pc),this.render=function(A,O){if(O!==void 0&&O.isCamera!==!0){Wt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(R===!0)return;L!==null&&L.renderStart(A,O);let j=Dt.enabled===!0&&Dt.isPresenting===!0,W=E!==null&&(K===null||j)&&E.begin(C,K);if(A.matrixWorldAutoUpdate===!0&&A.updateMatrixWorld(),O.parent===null&&O.matrixWorldAutoUpdate===!0&&O.updateMatrixWorld(),Dt.enabled===!0&&Dt.isPresenting===!0&&(E===null||E.isCompositing()===!1)&&(Dt.cameraAutoUpdate===!0&&Dt.updateCamera(O),O=Dt.getCamera()),A.isScene===!0&&A.onBeforeRender(C,A,O,K),S=gt.get(A,x.length),S.init(O),S.state.textureUnits=tt.getTextureUnits(),x.push(S),Lt.multiplyMatrices(O.projectionMatrix,O.matrixWorldInverse),Xt.setFromProjectionMatrix(Lt,Ri,O.reversedDepth),at=this.localClippingEnabled,ht=Ft.init(this.clippingPlanes,at),w=_t.get(A,T.length),w.init(),T.push(w),Dt.enabled===!0&&Dt.isPresenting===!0){let At=C.xr.getDepthSensingMesh();At!==null&&Za(At,O,-1/0,C.sortObjects)}Za(A,O,0,C.sortObjects),w.finish(),L!==null&&L.updateLights(S.state.lightsArray),C.sortObjects===!0&&w.sort(ct,vt),Ot=Dt.enabled===!1||Dt.isPresenting===!1||Dt.hasDepthSensing()===!1,Ot&&Jt.addToRenderList(w,A),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),ht===!0&&Ft.beginShadows();let X=S.state.shadowsArray;if(Ht.render(X,A,O),ht===!0&&Ft.endShadows(),(W&&E.hasRenderPass())===!1){let At=w.opaque,St=w.transmissive;if(S.setupLights(),O.isArrayCamera){let Ct=O.cameras;if(St.length>0)for(let Nt=0,jt=Ct.length;Nt<jt;Nt++){let ie=Ct[Nt];Dc(At,St,A,ie)}Ot&&Jt.render(A);for(let Nt=0,jt=Ct.length;Nt<jt;Nt++){let ie=Ct[Nt];Lc(w,A,ie,ie.viewport)}}else St.length>0&&Dc(At,St,A,O),Ot&&Jt.render(A),Lc(w,A,O)}K!==null&&G===0&&(tt.updateMultisampleRenderTarget(K),tt.updateRenderTargetMipmap(K)),W&&E.end(C),A.isScene===!0&&A.onAfterRender(C,A,O),Et.resetDefaultState(),N=-1,$=null,x.pop(),x.length>0?(S=x[x.length-1],tt.setTextureUnits(S.state.textureUnits),ht===!0&&Ft.setGlobalState(C.clippingPlanes,S.state.camera)):S=null,T.pop(),T.length>0?w=T[T.length-1]:w=null,L!==null&&L.renderEnd()};function Za(A,O,j,W){if(A.visible===!1)return;if(A.layers.test(O.layers)){if(A.isGroup)j=A.renderOrder;else if(A.isLOD)A.autoUpdate===!0&&A.update(O);else if(A.isLightProbeGrid)S.pushLightProbeGrid(A);else if(A.isLight)S.pushLight(A),A.castShadow&&S.pushShadow(A);else if(A.isSprite){if(!A.frustumCulled||A.intersectsFrustum(Xt)){W&&qt.setFromMatrixPosition(A.matrixWorld).applyMatrix4(Lt);let At=nt.update(A),St=A.material;St.visible&&w.push(A,At,St,j,qt.z,null,O)}}else if((A.isMesh||A.isLine||A.isPoints)&&(!A.frustumCulled||A.intersectsFrustum(Xt))){let At=nt.update(A),St=A.material;if(W&&(A.boundingSphere!==void 0?(A.boundingSphere===null&&A.computeBoundingSphere(),qt.copy(A.boundingSphere.center)):(At.boundingSphere===null&&At.computeBoundingSphere(),qt.copy(At.boundingSphere.center)),qt.applyMatrix4(A.matrixWorld).applyMatrix4(Lt)),Array.isArray(St)){let Ct=At.groups;for(let Nt=0,jt=Ct.length;Nt<jt;Nt++){let ie=Ct[Nt],Rt=St[ie.materialIndex];Rt&&Rt.visible&&w.push(A,At,Rt,j,qt.z,ie,O)}}else St.visible&&w.push(A,At,St,j,qt.z,null,O)}}let bt=A.children;for(let At=0,St=bt.length;At<St;At++)Za(bt[At],O,j,W)}function Lc(A,O,j,W){let{opaque:X,transmissive:bt,transparent:At}=A;S.setupLightsView(j),ht===!0&&Ft.setGlobalState(C.clippingPlanes,j),W&&b.viewport(Q.copy(W)),X.length>0&&wr(X,O,j),bt.length>0&&wr(bt,O,j),At.length>0&&wr(At,O,j),b.buffers.depth.setTest(!0),b.buffers.depth.setMask(!0),b.buffers.color.setMask(!0),b.setPolygonOffset(!1)}function Dc(A,O,j,W){if((j.isScene===!0?j.overrideMaterial:null)!==null)return;if(S.state.transmissionRenderTarget[W.id]===void 0){let Rt=ce.has("EXT_color_buffer_half_float")||ce.has("EXT_color_buffer_float");S.state.transmissionRenderTarget[W.id]=new ai(1,1,{generateMipmaps:!0,type:Rt?Li:li,minFilter:Yi,samples:Math.max(4,P.samples),stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:se.workingColorSpace})}let bt=S.state.transmissionRenderTarget[W.id],At=W.viewport||Q;bt.setSize(At.z*C.transmissionResolutionScale,At.w*C.transmissionResolutionScale);let St=C.getRenderTarget(),Ct=C.getActiveCubeFace(),Nt=C.getActiveMipmapLevel();C.setRenderTarget(bt),C.getClearColor(It),ut=C.getClearAlpha(),ut<1&&C.setClearColor(16777215,.5),C.clear(),Ot&&Jt.render(j);let jt=C.toneMapping;C.toneMapping=Ii;let ie=W.viewport;if(W.viewport!==void 0&&(W.viewport=void 0),S.setupLightsView(W),ht===!0&&Ft.setGlobalState(C.clippingPlanes,W),wr(A,j,W),tt.updateMultisampleRenderTarget(bt),tt.updateRenderTargetMipmap(bt),ce.has("WEBGL_multisampled_render_to_texture")===!1){let Rt=!1;for(let me=0,Fe=O.length;me<Fe;me++){let Te=O[me],{object:ve,geometry:Ze,material:Tt,group:ei}=Te;if(Tt.side===Xe&&ve.layers.test(W.layers)){let oe=Tt.side;Tt.side=si,Tt.needsUpdate=!0,Nc(ve,j,W,Ze,Tt,ei),Tt.side=oe,Tt.needsUpdate=!0,Rt=!0}}Rt===!0&&(tt.updateMultisampleRenderTarget(bt),tt.updateRenderTargetMipmap(bt))}C.setRenderTarget(St,Ct,Nt),C.setClearColor(It,ut),ie!==void 0&&(W.viewport=ie),C.toneMapping=jt}function wr(A,O,j){let W=O.isScene===!0?O.overrideMaterial:null;for(let X=0,bt=A.length;X<bt;X++){let At=A[X],{object:St,geometry:Ct,group:Nt}=At,jt=At.material;jt.allowOverride===!0&&W!==null&&(jt=W),St.layers.test(j.layers)&&Nc(St,O,j,Ct,jt,Nt)}}function Nc(A,O,j,W,X,bt){L!==null&&X.isNodeMaterial&&L.setObject(A,X),A.onBeforeRender(C,O,j,W,X,bt),A.modelViewMatrix.multiplyMatrices(j.matrixWorldInverse,A.matrixWorld),A.normalMatrix.getNormalMatrix(A.modelViewMatrix),X.onBeforeRender(C,O,j,W,A,bt),X.transparent===!0&&X.side===Xe&&X.forceSinglePass===!1?(X.side=si,X.needsUpdate=!0,C.renderBufferDirect(j,O,W,X,A,bt),X.side=Xi,X.needsUpdate=!0,C.renderBufferDirect(j,O,W,X,A,bt),X.side=Xe):C.renderBufferDirect(j,O,W,X,A,bt),A.onAfterRender(C,O,j,W,X,bt)}function Er(A,O,j){O.isScene!==!0&&(O=$t);let W=Z.get(A),X=S.state.lights,bt=S.state.shadowsArray,At=X.state.version,St=mt.getParameters(A,X.state,bt,O,j,S.state.lightProbeGridArray),Ct=mt.getProgramCacheKey(St),Nt=W.programs;W.environment=A.isMeshStandardMaterial||A.isMeshLambertMaterial||A.isMeshPhongMaterial?O.environment:null,W.fog=O.fog;let jt=A.isMeshStandardMaterial||A.isMeshLambertMaterial&&!A.envMap||A.isMeshPhongMaterial&&!A.envMap;W.envMap=dt.get(A.envMap||W.environment,jt),W.envMapRotation=W.environment!==null&&A.envMap===null?O.environmentRotation:A.envMapRotation,Nt===void 0&&(A.addEventListener("dispose",Fi),Nt=new Map,W.programs=Nt);let ie=Nt.get(Ct);if(ie!==void 0){if(W.currentProgram===ie&&W.lightsStateVersion===At)return Fc(A,St),ie}else St.uniforms=mt.getUniforms(A),L!==null&&A.isNodeMaterial&&L.build(A,j,St),A.onBeforeCompile(St,C),ie=mt.acquireProgram(St,Ct),Nt.set(Ct,ie),W.uniforms=St.uniforms;let Rt=W.uniforms;return(!A.isShaderMaterial&&!A.isRawShaderMaterial||A.clipping===!0)&&(Rt.clippingPlanes=Ft.uniform),Fc(A,St),W.needsLights=Kd(A),W.lightsStateVersion=At,W.needsLights&&(Rt.ambientLightColor.value=X.state.ambient,Rt.lightProbe.value=X.state.probe,Rt.sunLights.value=X.state.sun,Rt.sunLightShadows.value=X.state.sunShadow,Rt.directionalLights.value=X.state.directional,Rt.directionalLightShadows.value=X.state.directionalShadow,Rt.spotLights.value=X.state.spot,Rt.spotLightShadows.value=X.state.spotShadow,Rt.rectAreaLights.value=X.state.rectArea,Rt.ltc_1.value=X.state.rectAreaLTC1,Rt.ltc_2.value=X.state.rectAreaLTC2,Rt.pointLights.value=X.state.point,Rt.pointLightShadows.value=X.state.pointShadow,Rt.hemisphereLights.value=X.state.hemi,Rt.sunShadowMatrix.value=X.state.sunShadowMatrix,Rt.sunShadowCascade.value=X.state.sunShadowCascade,Rt.directionalShadowMatrix.value=X.state.directionalShadowMatrix,Rt.spotLightMatrix.value=X.state.spotLightMatrix,Rt.spotLightMap.value=X.state.spotLightMap,Rt.pointShadowMatrix.value=X.state.pointShadowMatrix),W.lightProbeGrid=S.state.lightProbeGridArray.length>0,W.currentProgram=ie,W.uniformsList=null,ie}function Uc(A){if(A.uniformsList===null){let O=A.currentProgram.getUniforms();A.uniformsList=As.seqWithValue(O.seq,A.uniforms)}return A.uniformsList}function Fc(A,O){let j=Z.get(A);j.outputColorSpace=O.outputColorSpace,j.batching=O.batching,j.batchingColor=O.batchingColor,j.instancing=O.instancing,j.instancingColor=O.instancingColor,j.instancingMorph=O.instancingMorph,j.skinning=O.skinning,j.morphTargets=O.morphTargets,j.morphNormals=O.morphNormals,j.morphColors=O.morphColors,j.morphTargetsCount=O.morphTargetsCount,j.numClippingPlanes=O.numClippingPlanes,j.numIntersection=O.numClipIntersection,j.vertexAlphas=O.vertexAlphas,j.vertexTangents=O.vertexTangents,j.toneMapping=O.toneMapping}function Zd(A,O){if(A.length===0)return null;if(A.length===1)return A[0].texture!==null?A[0]:null;v.setFromMatrixPosition(O.matrixWorld);for(let j=0,W=A.length;j<W;j++){let X=A[j];if(X.texture!==null&&X.boundingBox.containsPoint(v))return X}return null}function Qd(A,O,j,W,X){O.isScene!==!0&&(O=$t),tt.resetTextureUnits();let bt=O.fog,At=W.isMeshStandardMaterial||W.isMeshLambertMaterial||W.isMeshPhongMaterial?O.environment:null,St=K===null?C.outputColorSpace:K.isXRRenderTarget===!0?K.texture.colorSpace:se.workingColorSpace,Ct=W.isMeshStandardMaterial||W.isMeshLambertMaterial&&!W.envMap||W.isMeshPhongMaterial&&!W.envMap,Nt=dt.get(W.envMap||At,Ct),jt=W.vertexColors===!0&&!!j.attributes.color&&j.attributes.color.itemSize===4,ie=!!j.attributes.tangent&&(!!W.normalMap||W.anisotropy>0),Rt=!!j.morphAttributes.position,me=!!j.morphAttributes.normal,Fe=!!j.morphAttributes.color,Te=Ii;W.toneMapped&&(K===null||K.isXRRenderTarget===!0)&&(Te=C.toneMapping);let ve=j.morphAttributes.position||j.morphAttributes.normal||j.morphAttributes.color,Ze=ve!==void 0?ve.length:0,Tt=Z.get(W),ei=S.state.lights;if(ht===!0&&(at===!0||A!==$)){let Se=A===$&&W.id===N;Ft.setState(W,A,Se)}let oe=!1;W.version===Tt.__version?(Tt.needsLights&&Tt.lightsStateVersion!==ei.state.version||Tt.outputColorSpace!==St||X.isBatchedMesh&&Tt.batching===!1||!X.isBatchedMesh&&Tt.batching===!0||X.isBatchedMesh&&Tt.batchingColor===!0&&X._colorsTexture===null||X.isBatchedMesh&&Tt.batchingColor===!1&&X._colorsTexture!==null||X.isInstancedMesh&&Tt.instancing===!1||!X.isInstancedMesh&&Tt.instancing===!0||X.isSkinnedMesh&&Tt.skinning===!1||!X.isSkinnedMesh&&Tt.skinning===!0||X.isInstancedMesh&&Tt.instancingColor===!0&&X.instanceColor===null||X.isInstancedMesh&&Tt.instancingColor===!1&&X.instanceColor!==null||X.isInstancedMesh&&Tt.instancingMorph===!0&&X.morphTexture===null||X.isInstancedMesh&&Tt.instancingMorph===!1&&X.morphTexture!==null||Tt.envMap!==Nt||W.fog===!0&&Tt.fog!==bt||Tt.numClippingPlanes!==void 0&&(Tt.numClippingPlanes!==Ft.numPlanes||Tt.numIntersection!==Ft.numIntersection)||Tt.vertexAlphas!==jt||Tt.vertexTangents!==ie||Tt.morphTargets!==Rt||Tt.morphNormals!==me||Tt.morphColors!==Fe||Tt.toneMapping!==Te||Tt.morphTargetsCount!==Ze||!!Tt.lightProbeGrid!=S.state.lightProbeGridArray.length>0)&&(oe=!0):(oe=!0,Tt.__version=W.version);let vi=Tt.currentProgram;oe===!0&&(vi=Er(W,O,X),L&&W.isNodeMaterial&&L.onUpdateProgram(W,vi,Tt));let Bi=!1,an=!1,Zn=!1,ye=vi.getUniforms(),Ue=Tt.uniforms;if(b.useProgram(vi.program)&&(Bi=!0,an=!0,Zn=!0),W.id!==N&&(N=W.id,an=!0),Tt.needsLights){let Se=Zd(S.state.lightProbeGridArray,X);Tt.lightProbeGrid!==Se&&(Tt.lightProbeGrid=Se,an=!0)}if(Bi||$!==A){b.buffers.depth.getReversed()&&A.reversedDepth!==!0&&(A._reversedDepth=!0,A.updateProjectionMatrix()),ye.setValue(B,"projectionMatrix",A.projectionMatrix),ye.setValue(B,"viewMatrix",A.matrixWorldInverse);let cn=ye.map.cameraPosition;cn!==void 0&&cn.setValue(B,Kt.setFromMatrixPosition(A.matrixWorld)),P.logarithmicDepthBuffer&&ye.setValue(B,"logDepthBufFC",2/(Math.log(A.far+1)/Math.LN2)),(W.isMeshPhongMaterial||W.isMeshToonMaterial||W.isMeshLambertMaterial||W.isMeshBasicMaterial||W.isMeshStandardMaterial||W.isShaderMaterial)&&ye.setValue(B,"isOrthographic",A.isOrthographicCamera===!0),$!==A&&($=A,an=!0,Zn=!0)}if(Tt.needsLights&&(ei.state.sunShadowMap.length>0&&ye.setValue(B,"sunShadowMap",ei.state.sunShadowMap,tt),ei.state.directionalShadowMap.length>0&&ye.setValue(B,"directionalShadowMap",ei.state.directionalShadowMap,tt),ei.state.spotShadowMap.length>0&&ye.setValue(B,"spotShadowMap",ei.state.spotShadowMap,tt),ei.state.pointShadowMap.length>0&&ye.setValue(B,"pointShadowMap",ei.state.pointShadowMap,tt)),X.isSkinnedMesh){ye.setOptional(B,X,"bindMatrix"),ye.setOptional(B,X,"bindMatrixInverse");let Se=X.skeleton;Se&&(Se.boneTexture===null&&Se.computeBoneTexture(),ye.setValue(B,"boneTexture",Se.boneTexture,tt))}X.isBatchedMesh&&(ye.setOptional(B,X,"batchingTexture"),ye.setValue(B,"batchingTexture",X._matricesTexture,tt),ye.setOptional(B,X,"batchingIdTexture"),ye.setValue(B,"batchingIdTexture",X._indirectTexture,tt),ye.setOptional(B,X,"batchingColorTexture"),X._colorsTexture!==null&&ye.setValue(B,"batchingColorTexture",X._colorsTexture,tt));let ln=j.morphAttributes;if((ln.position!==void 0||ln.normal!==void 0||ln.color!==void 0)&&H.update(X,j,vi),(an||Tt.receiveShadow!==X.receiveShadow)&&(Tt.receiveShadow=X.receiveShadow,ye.setValue(B,"receiveShadow",X.receiveShadow)),(W.isMeshStandardMaterial||W.isMeshLambertMaterial||W.isMeshPhongMaterial)&&W.envMap===null&&O.environment!==null&&(Ue.envMapIntensity.value=O.environmentIntensity),Ue.dfgLUT!==void 0&&(Ue.dfgLUT.value=Eg()),an){if(ye.setValue(B,"toneMappingExposure",C.toneMappingExposure),Tt.needsLights&&Jd(Ue,Zn),bt&&W.fog===!0&&Ut.refreshFogUniforms(Ue,bt),Ut.refreshMaterialUniforms(Ue,W,Y,q,S.state.transmissionRenderTarget[A.id]),Tt.needsLights&&Tt.lightProbeGrid){let Se=Tt.lightProbeGrid;Ue.probesSH.value=Se.texture,Ue.probesMin.value.copy(Se.boundingBox.min),Ue.probesMax.value.copy(Se.boundingBox.max),Ue.probesResolution.value.copy(Se.resolution)}As.upload(B,Uc(Tt),Ue,tt)}if(W.isShaderMaterial&&W.uniformsNeedUpdate===!0&&(As.upload(B,Uc(Tt),Ue,tt),W.uniformsNeedUpdate=!1),W.isSpriteMaterial&&ye.setValue(B,"center",X.center),ye.setValue(B,"modelViewMatrix",X.modelViewMatrix),ye.setValue(B,"normalMatrix",X.normalMatrix),ye.setValue(B,"modelMatrix",X.matrixWorld),W.uniformsGroups!==void 0){let Se=W.uniformsGroups;for(let cn=0,Qn=Se.length;cn<Qn;cn++){let zc=Se[cn];rt.update(zc,vi),rt.bind(zc,vi)}}return vi}function Jd(A,O){A.ambientLightColor.needsUpdate=O,A.lightProbe.needsUpdate=O,A.sunLights.needsUpdate=O,A.sunLightShadows.needsUpdate=O,A.directionalLights.needsUpdate=O,A.directionalLightShadows.needsUpdate=O,A.pointLights.needsUpdate=O,A.pointLightShadows.needsUpdate=O,A.spotLights.needsUpdate=O,A.spotLightShadows.needsUpdate=O,A.rectAreaLights.needsUpdate=O,A.hemisphereLights.needsUpdate=O}function Kd(A){return A.isMeshLambertMaterial||A.isMeshToonMaterial||A.isMeshPhongMaterial||A.isMeshStandardMaterial||A.isShadowMaterial||A.isShaderMaterial&&A.lights===!0}this.getActiveCubeFace=function(){return z},this.getActiveMipmapLevel=function(){return G},this.getRenderTarget=function(){return K},this.setRenderTargetTextures=function(A,O,j){let W=Z.get(A);W.__autoAllocateDepthBuffer=A.resolveDepthBuffer===!1,W.__autoAllocateDepthBuffer===!1&&(W.__useRenderToTexture=!1),Z.get(A.texture).__webglTexture=O,Z.get(A.depthTexture).__webglTexture=W.__autoAllocateDepthBuffer?void 0:j,W.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(A,O){let j=Z.get(A);j.__webglFramebuffer=O,j.__useDefaultFramebuffer=O===void 0},this.setRenderTarget=function(A,O=0,j=0){K=A,z=O,G=j;let W=null,X=!1,bt=!1;if(A){let St=Z.get(A);if(St.__useDefaultFramebuffer!==void 0){b.bindFramebuffer(B.FRAMEBUFFER,St.__webglFramebuffer),Q.copy(A.viewport),ot.copy(A.scissor),st=A.scissorTest,b.viewport(Q),b.scissor(ot),b.setScissorTest(st),N=-1;return}else if(St.__webglFramebuffer===void 0)tt.setupRenderTarget(A);else if(St.__hasExternalTextures)tt.rebindTextures(A,Z.get(A.texture).__webglTexture,Z.get(A.depthTexture).__webglTexture);else if(A.depthBuffer){let jt=A.depthTexture;if(St.__boundDepthTexture!==jt){if(jt!==null&&Z.has(jt)&&(A.width!==jt.image.width||A.height!==jt.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");tt.setupDepthRenderbuffer(A)}}let Ct=A.texture;(Ct.isData3DTexture||Ct.isDataArrayTexture||Ct.isCompressedArrayTexture)&&(bt=!0);let Nt=Z.get(A).__webglFramebuffer;A.isWebGLCubeRenderTarget?(Array.isArray(Nt[O])?W=Nt[O][j]:W=Nt[O],X=!0):A.samples>0&&tt.useMultisampledRTT(A)===!1?W=Z.get(A).__webglMultisampledFramebuffer:Array.isArray(Nt)?W=Nt[j]:W=Nt,Q.copy(A.viewport),ot.copy(A.scissor),st=A.scissorTest}else Q.copy(lt).multiplyScalar(Y).floor(),ot.copy(kt).multiplyScalar(Y).floor(),st=le;if(j!==0&&(W=D),b.bindFramebuffer(B.FRAMEBUFFER,W)&&b.drawBuffers(A,W),b.viewport(Q),b.scissor(ot),b.setScissorTest(st),X){let St=Z.get(A.texture);B.framebufferTexture2D(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_CUBE_MAP_POSITIVE_X+O,St.__webglTexture,j)}else if(bt){let St=O;for(let Ct=0;Ct<A.textures.length;Ct++){let Nt=Z.get(A.textures[Ct]);B.framebufferTextureLayer(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0+Ct,Nt.__webglTexture,j,St)}}else if(A!==null&&j!==0){let St=Z.get(A.texture);B.framebufferTexture2D(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,St.__webglTexture,j)}N=-1};function Bc(A){let O=Z.get(A);return(O.__readFormat!==A.format||O.__readType!==A.type)&&(O.__readFormat=A.format,O.__readType=A.type,O.__formatReadable=P.textureFormatReadable(A.format),O.__typeReadable=P.textureTypeReadable(A.type)),O}this.readRenderTargetPixels=function(A,O,j,W,X,bt,At,St=0){if(!(A&&A.isWebGLRenderTarget)){Wt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ct=Z.get(A).__webglFramebuffer;if(A.isWebGLCubeRenderTarget&&At!==void 0&&(Ct=Ct[At]),Ct){b.bindFramebuffer(B.FRAMEBUFFER,Ct);try{let Nt=A.textures[St],jt=Nt.format,ie=Nt.type;A.textures.length>1&&B.readBuffer(B.COLOR_ATTACHMENT0+St);let Rt=Bc(Nt);if(Rt.__formatReadable===!1){Wt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Rt.__typeReadable===!1){Wt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}O>=0&&O<=A.width-W&&j>=0&&j<=A.height-X&&B.readPixels(O,j,W,X,yt.convert(jt),yt.convert(ie),bt)}finally{let Nt=K!==null?Z.get(K).__webglFramebuffer:null;b.bindFramebuffer(B.FRAMEBUFFER,Nt)}}},this.readRenderTargetPixelsAsync=async function(A,O,j,W,X,bt,At,St=0){if(!(A&&A.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ct=Z.get(A).__webglFramebuffer;if(A.isWebGLCubeRenderTarget&&At!==void 0&&(Ct=Ct[At]),Ct)if(O>=0&&O<=A.width-W&&j>=0&&j<=A.height-X){b.bindFramebuffer(B.FRAMEBUFFER,Ct);let Nt=A.textures[St],jt=Nt.format,ie=Nt.type;A.textures.length>1&&B.readBuffer(B.COLOR_ATTACHMENT0+St);let Rt=Bc(Nt);if(Rt.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Rt.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let me=B.createBuffer();B.bindBuffer(B.PIXEL_PACK_BUFFER,me),B.bufferData(B.PIXEL_PACK_BUFFER,bt.byteLength,B.STREAM_READ),B.readPixels(O,j,W,X,yt.convert(jt),yt.convert(ie),0),B.bindBuffer(B.PIXEL_PACK_BUFFER,null);let Fe=K!==null?Z.get(K).__webglFramebuffer:null;b.bindFramebuffer(B.FRAMEBUFFER,Fe);let Te=B.fenceSync(B.SYNC_GPU_COMMANDS_COMPLETE,0);return B.flush(),await Kh(B,Te,4),B.bindBuffer(B.PIXEL_PACK_BUFFER,me),B.getBufferSubData(B.PIXEL_PACK_BUFFER,0,bt),B.bindBuffer(B.PIXEL_PACK_BUFFER,null),B.deleteBuffer(me),B.deleteSync(Te),bt}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(A,O=null,j=0){let W=Math.pow(2,-j),X=Math.floor(A.image.width*W),bt=Math.floor(A.image.height*W),At=O!==null?O.x:0,St=O!==null?O.y:0;tt.setTexture2D(A,0),B.copyTexSubImage2D(B.TEXTURE_2D,j,0,0,At,St,X,bt),b.unbindTexture()},this.copyTextureToTexture=function(A,O,j=null,W=null,X=0,bt=0){let At,St,Ct,Nt,jt,ie,Rt,me,Fe,Te=A.isCompressedTexture?A.mipmaps[bt]:A.image;if(j!==null)At=j.max.x-j.min.x,St=j.max.y-j.min.y,Ct=j.isBox3?j.max.z-j.min.z:1,Nt=j.min.x,jt=j.min.y,ie=j.isBox3?j.min.z:0;else{let Ue=Math.pow(2,-X);At=Math.floor(Te.width*Ue),St=Math.floor(Te.height*Ue),A.isDataArrayTexture?Ct=Te.depth:A.isData3DTexture?Ct=Math.floor(Te.depth*Ue):Ct=1,Nt=0,jt=0,ie=0}W!==null?(Rt=W.x,me=W.y,Fe=W.z):(Rt=0,me=0,Fe=0);let ve=yt.convert(O.format),Ze=yt.convert(O.type),Tt;O.isData3DTexture?(tt.setTexture3D(O,0),Tt=B.TEXTURE_3D):O.isDataArrayTexture||O.isCompressedArrayTexture?(tt.setTexture2DArray(O,0),Tt=B.TEXTURE_2D_ARRAY):(tt.setTexture2D(O,0),Tt=B.TEXTURE_2D),b.activeTexture(B.TEXTURE0),b.pixelStorei(B.UNPACK_FLIP_Y_WEBGL,O.flipY),b.pixelStorei(B.UNPACK_PREMULTIPLY_ALPHA_WEBGL,O.premultiplyAlpha),b.pixelStorei(B.UNPACK_ALIGNMENT,O.unpackAlignment);let ei=b.getParameter(B.UNPACK_ROW_LENGTH),oe=b.getParameter(B.UNPACK_IMAGE_HEIGHT),vi=b.getParameter(B.UNPACK_SKIP_PIXELS),Bi=b.getParameter(B.UNPACK_SKIP_ROWS),an=b.getParameter(B.UNPACK_SKIP_IMAGES);b.pixelStorei(B.UNPACK_ROW_LENGTH,Te.width),b.pixelStorei(B.UNPACK_IMAGE_HEIGHT,Te.height),b.pixelStorei(B.UNPACK_SKIP_PIXELS,Nt),b.pixelStorei(B.UNPACK_SKIP_ROWS,jt),b.pixelStorei(B.UNPACK_SKIP_IMAGES,ie);let Zn=A.isDataArrayTexture||A.isData3DTexture,ye=O.isDataArrayTexture||O.isData3DTexture;if(A.isDepthTexture){let Ue=Z.get(A),ln=Z.get(O),Se=Z.get(Ue.__renderTarget),cn=Z.get(ln.__renderTarget);b.bindFramebuffer(B.READ_FRAMEBUFFER,Se.__webglFramebuffer),b.bindFramebuffer(B.DRAW_FRAMEBUFFER,cn.__webglFramebuffer);for(let Qn=0;Qn<Ct;Qn++)Zn&&(B.framebufferTextureLayer(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,Z.get(A).__webglTexture,X,ie+Qn),B.framebufferTextureLayer(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,Z.get(O).__webglTexture,bt,Fe+Qn)),B.blitFramebuffer(Nt,jt,At,St,Rt,me,At,St,B.DEPTH_BUFFER_BIT,B.NEAREST);b.bindFramebuffer(B.READ_FRAMEBUFFER,null),b.bindFramebuffer(B.DRAW_FRAMEBUFFER,null)}else if(X!==0||A.isRenderTargetTexture||Z.has(A)){let Ue=Z.get(A),ln=Z.get(O);b.bindFramebuffer(B.READ_FRAMEBUFFER,I),b.bindFramebuffer(B.DRAW_FRAMEBUFFER,F);for(let Se=0;Se<Ct;Se++)Zn?B.framebufferTextureLayer(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,Ue.__webglTexture,X,ie+Se):B.framebufferTexture2D(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,Ue.__webglTexture,X),ye?B.framebufferTextureLayer(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,ln.__webglTexture,bt,Fe+Se):B.framebufferTexture2D(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,ln.__webglTexture,bt),X!==0?B.blitFramebuffer(Nt,jt,At,St,Rt,me,At,St,B.COLOR_BUFFER_BIT,B.NEAREST):ye?B.copyTexSubImage3D(Tt,bt,Rt,me,Fe+Se,Nt,jt,At,St):B.copyTexSubImage2D(Tt,bt,Rt,me,Nt,jt,At,St);b.bindFramebuffer(B.READ_FRAMEBUFFER,null),b.bindFramebuffer(B.DRAW_FRAMEBUFFER,null)}else ye?A.isDataTexture||A.isData3DTexture?B.texSubImage3D(Tt,bt,Rt,me,Fe,At,St,Ct,ve,Ze,Te.data):O.isCompressedArrayTexture?B.compressedTexSubImage3D(Tt,bt,Rt,me,Fe,At,St,Ct,ve,Te.data):B.texSubImage3D(Tt,bt,Rt,me,Fe,At,St,Ct,ve,Ze,Te):A.isDataTexture?B.texSubImage2D(B.TEXTURE_2D,bt,Rt,me,At,St,ve,Ze,Te.data):A.isCompressedTexture?B.compressedTexSubImage2D(B.TEXTURE_2D,bt,Rt,me,Te.width,Te.height,ve,Te.data):B.texSubImage2D(B.TEXTURE_2D,bt,Rt,me,At,St,ve,Ze,Te);b.pixelStorei(B.UNPACK_ROW_LENGTH,ei),b.pixelStorei(B.UNPACK_IMAGE_HEIGHT,oe),b.pixelStorei(B.UNPACK_SKIP_PIXELS,vi),b.pixelStorei(B.UNPACK_SKIP_ROWS,Bi),b.pixelStorei(B.UNPACK_SKIP_IMAGES,an),bt===0&&O.generateMipmaps&&B.generateMipmap(Tt),b.unbindTexture()},this.initRenderTarget=function(A){Z.get(A).__webglFramebuffer===void 0&&tt.setupRenderTarget(A)},this.initTexture=function(A){A.isCubeTexture?tt.setTextureCube(A,0):A.isData3DTexture?tt.setTexture3D(A,0):A.isDataArrayTexture||A.isCompressedArrayTexture?tt.setTexture2DArray(A,0):tt.setTexture2D(A,0),b.unbindTexture()},this.resetState=function(){z=0,G=0,K=null,b.reset(),Et.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Ri}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=se._getDrawingBufferColorSpace(t),e.unpackColorSpace=se._getUnpackColorSpace()}};var Cn={compact:{id:"compact",name:"\u0423\u0449\u0435\u043B\u044C\u0435 0.8 \xD7 0.8 \u043A\u043C",shortLabel:"0.8 \xD7 0.8 \u043A\u043C",areaKm2:.59,size:768,horizScale:1,elevScale:1,flowScale:1,powerScale:1,snowLineY:58,minZoom:22,maxZoom:720,defaultDist:235,brushSizes:[6,9.5,16,25],desc:"\u0414\u0435\u0442\u0430\u043B\u044C\u043D\u044B\u0439 \u0438\u043D\u0436\u0435\u043D\u0435\u0440\u043D\u044B\u0439 \u0441\u0442\u0432\u043E\u0440 1:1 \u0434\u043B\u044F \u0442\u043E\u0447\u043D\u043E\u0439 \u043F\u0440\u043E\u0440\u0430\u0431\u043E\u0442\u043A\u0438 \u0443\u0437\u043B\u043E\u0432 \u0413\u042D\u0421 \u0438 \u043A\u0430\u043D\u0430\u043B\u043E\u0432."},km5:{id:"km5",name:"\u0411\u0430\u0441\u0441\u0435\u0439\u043D 5 \xD7 5 \u043A\u043C",shortLabel:"5 \xD7 5 \u043A\u043C (25 \u043A\u043C\xB2)",areaKm2:25,size:5e3,horizScale:6.510416666666667,elevScale:2.35,flowScale:6.2,powerScale:6.5,snowLineY:122,minZoom:48,maxZoom:4600,defaultDist:1180,brushSizes:[36,62,104,165],desc:"\u0420\u0435\u0433\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0439 \u0440\u0435\u0447\u043D\u043E\u0439 \u0431\u0430\u0441\u0441\u0435\u0439\u043D 25 \u043A\u043C\xB2 \u0441\u043E \u0441\u043D\u0435\u0436\u043D\u044B\u043C\u0438 \u043F\u0438\u043A\u0430\u043C\u0438, \u0441\u0443\u0434\u043E\u0445\u043E\u0434\u0441\u0442\u0432\u043E\u043C \u0438 8 \u0433\u043E\u0440\u043E\u0434\u0430\u043C\u0438."},km10:{id:"km10",name:"\u041C\u0435\u0433\u0430-\u043A\u0430\u0441\u043A\u0430\u0434 10 \xD7 10 \u043A\u043C",shortLabel:"10 \xD7 10 \u043A\u043C (100 \u043A\u043C\xB2)",areaKm2:100,size:1e4,horizScale:13.020833333333334,elevScale:3.35,flowScale:13.5,powerScale:15,snowLineY:176,minZoom:75,maxZoom:9200,defaultDist:2250,brushSizes:[72,124,208,330],desc:"\u0413\u0438\u0433\u0430\u043D\u0442\u0441\u043A\u0438\u0439 \u0441\u0438\u0431\u0438\u0440\u0441\u043A\u0438\u0439 \u043A\u0430\u0441\u043A\u0430\u0434 100 \u043A\u043C\xB2 \u043C\u0430\u0441\u0448\u0442\u0430\u0431\u0430 \u0410\u043D\u0433\u0430\u0440\u044B \u0438 \u0415\u043D\u0438\u0441\u0435\u044F \u0441 \u043B\u0435\u0434\u043D\u0438\u043A\u0430\u043C\u0438 \u0438 \u043C\u0435\u0433\u0430-\u0413\u042D\u0421."}},U={scaleId:"km5",size:5e3,horizScale:5e3/768,elevScale:2.35,flowScale:6.2,powerScale:6.5,snowLineY:122,minZoom:48,maxZoom:4600,defaultDist:1180,brushSizes:[36,62,104,165],gravity:9.81,waterDensity:1e3,dayLengthSec:185},_e={pourRateM3PerSec:480,cofferdamInstantRatio:.62,rockAggregateDiscount:.38,highDamHeadThreshold:10.5,maxUnreinforcedHead:17.5,substationCost:6800,navLockCost:11500,fishEcoCost:7200,baseGridLossNoSub:.16,gridLossWithSub:.03,damHeightTiers:[{id:"low",label:"\u042F\u0440\u0443\u0441 +6\u043C",baseAddHeight:6.2,addHeight:14.5},{id:"mid",label:"\u042F\u0440\u0443\u0441 +11\u043C",baseAddHeight:11.2,addHeight:26.3},{id:"high",label:"\u042F\u0440\u0443\u0441 +17\u043C",baseAddHeight:17,addHeight:40}]},Tg=[{id:"posad",name:"\u0420\u0435\u0447\u043D\u043E\u0439 \u041F\u043E\u0441\u0430\u0434",subtitle:"\u041B\u0435\u0441\u043E\u043F\u0435\u0440\u0435\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u0438 \u043F\u0440\u0438\u0440\u0435\u0447\u043D\u0430\u044F \u0441\u043B\u043E\u0431\u043E\u0434\u0430",baseX:-158,baseZ:224,baseRadius:52,baseElev:17.5,startPop:640,baseDemandMW:.38,demandPerBuilding:.075,tariffBonus:1,connectedAtStart:!0,accent:6333946,archetype:"town"},{id:"agro",name:"\u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u0430",subtitle:"\u041E\u0440\u043E\u0448\u0430\u0435\u043C\u044B\u0435 \u043F\u043E\u043B\u044F, \u044D\u043B\u0435\u0432\u0430\u0442\u043E\u0440\u044B \u0438 \u0442\u0435\u043F\u043B\u0438\u0446\u044B",baseX:222,baseZ:112,baseRadius:58,baseElev:18.2,startPop:820,baseDemandMW:.52,demandPerBuilding:.085,tariffBonus:1.12,needsIrrigation:!0,baseIrrTarget:{x:168,z:98,radius:38},connectedAtStart:!1,accent:3462041,archetype:"agro"},{id:"sever",name:"\u0421\u0435\u0432\u0435\u0440\u043E\u0431\u043E\u0440\u0441\u043A",subtitle:"\u0413\u0438\u0434\u0440\u043E\u043C\u0435\u0442\u0435\u043E\u0446\u0435\u043D\u0442\u0440 \u0420\u043E\u0441\u0433\u0438\u0434\u0440\u043E\u043C\u0435\u0442\u0430 \u0438 \u0412\u042D\u0421",baseX:-214,baseZ:-218,baseRadius:48,baseElev:35,startPop:590,baseDemandMW:.45,demandPerBuilding:.09,tariffBonus:1.15,connectedAtStart:!1,accent:3003583,archetype:"science"},{id:"kamen",name:"\u041A\u0430\u043C\u0435\u043D\u043D\u043E\u0433\u043E\u0440\u0441\u043A",subtitle:"\u0413\u043E\u0440\u043D\u043E-\u043E\u0431\u043E\u0433\u0430\u0442\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u0438 \u043C\u0430\u0448\u0438\u043D\u043E\u0441\u0442\u0440\u043E\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u0443\u0437\u0435\u043B",baseX:208,baseZ:-182,baseRadius:54,baseElev:34,startPop:1120,baseDemandMW:.92,demandPerBuilding:.145,tariffBonus:1.24,connectedAtStart:!1,accent:16498468,archetype:"industrial"},{id:"svetlograd",name:"\u0421\u0432\u0435\u0442\u043B\u043E\u0433\u0440\u0430\u0434",subtitle:"\u041C\u0435\u0433\u0430\u043F\u043E\u043B\u0438\u0441 \u0434\u043E\u043B\u0438\u043D\u044B, \u043D\u0435\u0431\u043E\u0441\u043A\u0440\u0451\u0431\u044B \u0438 \u0413\u043E\u0440\u0432\u043E\u0434\u043E\u043A\u0430\u043D\u0430\u043B",baseX:-222,baseZ:-16,baseRadius:66,baseElev:24.8,startPop:2150,baseDemandMW:1.38,demandPerBuilding:.19,tariffBonus:1.22,connectedAtStart:!1,accent:10980346,archetype:"metropolis"},{id:"alumingrad",name:"\u0410\u043B\u044E\u043C\u0438\u043D\u0433\u0440\u0430\u0434",subtitle:"\u042D\u043D\u0435\u0440\u0433\u043E\u0451\u043C\u043A\u0438\u0439 \u0430\u043B\u044E\u043C\u0438\u043D\u0438\u0435\u0432\u044B\u0439 \u044D\u043B\u0435\u043A\u0442\u0440\u043E\u043B\u0438\u0437\u043D\u044B\u0439 \u0437\u0430\u0432\u043E\u0434",baseX:246,baseZ:-38,baseRadius:52,baseElev:26.2,startPop:1340,baseDemandMW:1.65,demandPerBuilding:.22,tariffBonus:1.38,specialContract:"smelter",connectedAtStart:!1,accent:16347926,archetype:"smelter"},{id:"kremniy",name:"\u041A\u0440\u0435\u043C\u043D\u0438\u0435\u0432\u044B\u0439 \u041F\u043B\u0451\u0441",subtitle:"\u0413\u0438\u043F\u0435\u0440\u0441\u043A\u0435\u0439\u043B \u0426\u041E\u0414 \u0418\u0418 \u0438 \u043A\u0432\u0430\u043D\u0442\u043E\u0432\u044B\u0439 \u043A\u0430\u043C\u043F\u0443\u0441",baseX:-124,baseZ:-112,baseRadius:44,baseElev:29.4,startPop:780,baseDemandMW:1.25,demandPerBuilding:.2,tariffBonus:1.44,specialContract:"datacenter",connectedAtStart:!1,accent:3718648,archetype:"datacenter"},{id:"ustport",name:"\u0423\u0441\u0442\u044C-\u041F\u043E\u0440\u0442",subtitle:"\u0420\u0435\u0447\u043D\u043E\u0435 \u043F\u0430\u0440\u043E\u0445\u043E\u0434\u0441\u0442\u0432\u043E, \u0441\u0443\u0434\u043E\u0432\u0435\u0440\u0444\u044C \u0438 \u043C\u0430\u0440\u0438\u043D\u0430",baseX:118,baseZ:274,baseRadius:54,baseElev:12.6,startPop:980,baseDemandMW:.68,demandPerBuilding:.11,tariffBonus:1.18,specialContract:"port",connectedAtStart:!1,accent:440020,archetype:"port"}],Ye=[],Mc=[{id:0,name:"\u0414\u0435\u0440\u0435\u0432\u044F\u043D\u043D\u044B\u0439 \u043A\u043E\u0442\u0442\u0435\u0434\u0436",cat:"res",shape:"gable",hMin:4.5,hMax:7,w:6.2,d:6.8,style:0},{id:1,name:"\u041A\u0438\u0440\u043F\u0438\u0447\u043D\u044B\u0439 \u0434\u0443\u043F\u043B\u0435\u043A\u0441",cat:"res",shape:"gable",hMin:6,hMax:8.8,w:7.5,d:8.2,style:1},{id:2,name:"\u0410\u043B\u044C\u043F\u0438\u0439\u0441\u043A\u043E\u0435 \u0448\u0430\u043B\u0435",cat:"res",shape:"gable",hMin:5.5,hMax:8.2,w:7.8,d:7.4,style:2},{id:3,name:"\u0422\u0430\u0443\u043D\u0445\u0430\u0443\u0441 \u0441 \u0442\u0435\u0440\u0440\u0430\u0441\u043E\u0439",cat:"res",shape:"flat",hMin:7.5,hMax:10.5,w:11,d:7,style:3},{id:4,name:"\u041A\u043B\u0430\u0441\u0441\u0438\u0447\u0435\u0441\u043A\u0430\u044F 5-\u044D\u0442\u0430\u0436\u043A\u0430",cat:"mid",shape:"gable",hMin:14,hMax:17.5,w:15,d:9.2,style:4},{id:5,name:"\u041F\u0430\u043D\u0435\u043B\u044C\u043D\u044B\u0439 9-\u044D\u0442\u0430\u0436\u043D\u044B\u0439 \u0434\u043E\u043C",cat:"mid",shape:"flat",hMin:24,hMax:29,w:17.5,d:10.2,style:5},{id:6,name:"\u041C\u043E\u043D\u043E\u043B\u0438\u0442\u043D\u044B\u0439 \u0416\u041A 16 \u044D\u0442\u0430\u0436\u0435\u0439",cat:"high",shape:"step",hMin:38,hMax:48,w:13.5,d:13.5,style:6},{id:7,name:"\u0421\u0442\u0435\u043A\u043B\u044F\u043D\u043D\u0430\u044F \u0431\u0438\u0437\u043D\u0435\u0441-\u0431\u0430\u0448\u043D\u044F",cat:"high",shape:"tower",hMin:52,hMax:72,w:14.5,d:14.5,style:7},{id:8,name:"\u041D\u0435\u0431\u043E\u0441\u043A\u0440\u0451\u0431 \u0441\u043E \u0448\u043F\u0438\u043B\u0435\u043C",cat:"high",shape:"spire",hMin:68,hMax:96,w:15.5,d:15.5,style:8},{id:9,name:"\u041E\u0431\u0449\u0435\u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u0448\u043A\u043E\u043B\u0430",cat:"civ",shape:"flat",hMin:11.5,hMax:14.5,w:18,d:12.5,style:9},{id:10,name:"\u041A\u043B\u0438\u043D\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u0431\u043E\u043B\u044C\u043D\u0438\u0446\u0430",cat:"civ",shape:"step",hMin:18,hMax:24,w:17,d:13,style:10},{id:11,name:"\u0413\u043E\u0440\u043E\u0434\u0441\u043A\u0430\u044F \u0440\u0430\u0442\u0443\u0448\u0430 \u0441 \u0431\u0430\u0448\u043D\u0435\u0439",cat:"civ",shape:"spire",hMin:22,hMax:30,w:14,d:12,style:11},{id:12,name:"\u0410\u0440\u043E\u0447\u043D\u044B\u0439 \u0442\u0435\u043F\u043B\u0438\u0447\u043D\u044B\u0439 \u0431\u043B\u043E\u043A",cat:"agro",shape:"arch",hMin:4.2,hMax:5.8,w:16.5,d:9.5,style:12},{id:13,name:"\u0417\u0435\u0440\u043D\u043E\u0432\u043E\u0439 \u044D\u043B\u0435\u0432\u0430\u0442\u043E\u0440 (\u0441\u0438\u043B\u043E\u0441)",cat:"agro",shape:"cyl",hMin:18,hMax:26,w:9.5,d:9.5,style:13},{id:14,name:"\u0410\u0433\u0440\u043E\u0444\u0435\u0440\u043C\u0430 \u0438 \u0430\u043C\u0431\u0430\u0440",cat:"agro",shape:"gable",hMin:6.8,hMax:9.2,w:14.5,d:9.8,style:14},{id:15,name:"\u041B\u0435\u0441\u043E\u043F\u0438\u043B\u044C\u043D\u044B\u0439 \u043A\u043E\u043C\u0431\u0438\u043D\u0430\u0442",cat:"ind",shape:"gable",hMin:7.5,hMax:10.5,w:16,d:11,style:15},{id:16,name:"\u041C\u0430\u0448\u0438\u043D\u043E\u0441\u0442\u0440\u043E\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u0446\u0435\u0445",cat:"ind",shape:"flat",hMin:10.5,hMax:14.5,w:19,d:13.5,style:16},{id:17,name:"\u041A\u043E\u0440\u043F\u0443\u0441 \u044D\u043B\u0435\u043A\u0442\u0440\u043E\u043B\u0438\u0437\u0430 Al",cat:"smlt",shape:"flat",hMin:11.5,hMax:15,w:24,d:11.5,style:17},{id:18,name:"\u041B\u0438\u0442\u0435\u0439\u043D\u043E-\u043F\u0440\u043E\u043A\u0430\u0442\u043D\u044B\u0439 \u0446\u0435\u0445",cat:"smlt",shape:"step",hMin:15,hMax:21,w:18.5,d:14,style:18},{id:19,name:"\u0413\u0438\u043F\u0435\u0440\u0431\u043E\u043B\u043E\u0438\u0434\u043D\u0430\u044F \u0433\u0440\u0430\u0434\u0438\u0440\u043D\u044F",cat:"ind",shape:"cool",hMin:24,hMax:34,w:13.5,d:13.5,style:19},{id:20,name:"\u041C\u043E\u0434\u0443\u043B\u044C \u0426\u041E\u0414 \u0418\u0418 (\u0421\u0435\u0440\u0432\u0435\u0440\u043D\u0430\u044F)",cat:"dc",shape:"flat",hMin:10,hMax:13.5,w:20,d:14,style:20},{id:21,name:"\u041A\u0432\u0430\u043D\u0442\u043E\u0432\u044B\u0439 \u043B\u0430\u0431-\u043A\u043E\u0440\u043F\u0443\u0441",cat:"dc",shape:"tower",hMin:24,hMax:36,w:13,d:13,style:21},{id:22,name:"\u041F\u043E\u0440\u0442\u043E\u0432\u044B\u0439 \u0442\u0435\u0440\u043C\u0438\u043D\u0430\u043B-\u0441\u043A\u043B\u0430\u0434",cat:"port",shape:"arch",hMin:8.5,hMax:11.5,w:21,d:11.5,style:22},{id:23,name:"\u041A\u0443\u0440\u043E\u0440\u0442\u043D\u044B\u0439 \u0433\u0440\u0430\u043D\u0434-\u043E\u0442\u0435\u043B\u044C",cat:"port",shape:"step",hMin:22,hMax:34,w:16,d:11.5,style:23},{id:24,name:"\u041F\u0430\u0432\u0438\u043B\u044C\u043E\u043D \u044F\u0445\u0442-\u043A\u043B\u0443\u0431\u0430",cat:"port",shape:"gable",hMin:6.5,hMax:9,w:12,d:10,style:24},{id:25,name:"\u0421\u0442\u0430\u043D\u0446\u0438\u044F \u0413\u043E\u0440\u0432\u043E\u0434\u043E\u043A\u0430\u043D\u0430\u043B\u0430",cat:"util",shape:"cyl",hMin:8.5,hMax:12,w:12.5,d:12.5,style:25},{id:26,name:"\u041D\u0430\u0441\u043E\u0441\u043D\u0430\u044F \u0441\u0442\u0430\u043D\u0446\u0438\u044F \u043E\u0440\u043E\u0448\u0435\u043D\u0438\u044F",cat:"agro",shape:"flat",hMin:6,hMax:8.5,w:10.5,d:9,style:26},{id:27,name:"\u041D\u0430\u0443\u0447\u043D\u044B\u0439 \u0446\u0435\u043D\u0442\u0440 \u0420\u043E\u0441\u0433\u0438\u0434\u0440\u043E\u043C\u0435\u0442\u0430",cat:"sci",shape:"spire",hMin:14,hMax:20,w:11.5,d:11.5,style:27},{id:28,name:"\u0422\u043E\u0440\u0433\u043E\u0432\u043E-\u0432\u044B\u0441\u0442\u0430\u0432\u043E\u0447\u043D\u044B\u0439 \u0445\u043E\u043B\u043B",cat:"mid",shape:"arch",hMin:10,hMax:14,w:18.5,d:15,style:28},{id:29,name:"\u041B\u043E\u0433\u0438\u0441\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0445\u0430\u0431",cat:"ind",shape:"flat",hMin:9,hMax:12,w:22,d:13,style:29},{id:30,name:"\u0421\u043F\u0430\u0441\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0435 \u0434\u0435\u043F\u043E \u041C\u0427\u0421",cat:"civ",shape:"flat",hMin:8.5,hMax:11.5,w:13.5,d:11,style:30},{id:31,name:"\u041D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u043E\u043D\u043D\u044B\u0439 \u043C\u0430\u044F\u043A \u043C\u044B\u0441\u0430",cat:"port",shape:"spire",hMin:20,hMax:28,w:6.8,d:6.8,style:31}],bi={bystritsa:{id:"bystritsa",name:"\u0411\u0430\u0441\u0441\u0435\u0439\u043D \xAB\u0411\u043E\u043B\u044C\u0448\u0430\u044F \u0411\u044B\u0441\u0442\u0440\u0438\u0446\u0430\xBB",badge:"\u0420\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0443\u0435\u0442\u0441\u044F \xB7 \u041F\u043E\u043B\u043D\u044B\u0439 \u0446\u0438\u043A\u043B",areaLabel:"3 \u0440\u0435\u043A\u0438 \xB7 8 \u0433\u043E\u0440\u043E\u0434\u043E\u0432 \xB7 \u041B\u0435\u0434\u043D\u0438\u043A\u0438",headLabel:"\u041A\u0430\u0441\u043A\u0430\u0434\u043D\u044B\u0439 \u043A\u0430\u043D\u044C\u043E\u043D + \u043F\u043E\u0439\u043C\u0430",baseMainQ:162,baseCreekQ:54,baseWestQ:36,mainInflowQ:162,creekInflowQ:54,westCreekQ:36,desc:"\u0413\u0440\u0430\u043D\u0438\u0442\u043D\u0430\u044F \u0442\u0435\u0441\u043D\u0438\u043D\u0430 \xAB\u0412\u043E\u0440\u043E\u0442\u0430 \u0413\u0440\u043E\u043C\u0430\xBB, \u0441\u043D\u0435\u0436\u043D\u044B\u0435 \u0432\u0435\u0440\u0448\u0438\u043D\u044B \u043F\u0438\u0442\u0430\u043D\u0438\u044F \u0440\u0435\u043A, \u0434\u0435\u0440\u0438\u0432\u0430\u0446\u0438\u043E\u043D\u043D\u043E\u0435 \u043F\u043B\u0430\u0442\u043E \xAB\u041F\u043E\u0434\u043A\u043E\u0432\u0430\xBB, \u0410\u043B\u044E\u043C\u0438\u043D\u0438\u0435\u0432\u044B\u0439 \u0437\u0430\u0432\u043E\u0434, \u0426\u041E\u0414 \u0418\u0418 \u0438 \u0441\u0443\u0434\u043E\u0445\u043E\u0434\u043D\u043E\u0435 \u0443\u0441\u0442\u044C\u0435.",baseLandmarks:[{label:"\u25B2 \u0421\u0442\u0432\u043E\u0440 \xAB\u0412\u043E\u0440\u043E\u0442\u0430 \u0413\u0440\u043E\u043C\u0430\xBB",x:12,z:-158,dist:142},{label:"\u25C6 \u0414\u0435\u0440\u0438\u0432\u0430\u0446\u0438\u043E\u043D\u043D\u043E\u0435 \u043F\u043B\u0430\u0442\u043E",x:-18,z:-12,dist:185},{label:"\u25C9 \u041E\u0440\u043E\u0448\u0435\u043D\u0438\u0435 \u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u044B",x:168,z:98,dist:155},{label:"\u2693 \u0423\u0441\u0442\u044C-\u041F\u043E\u0440\u0442 \u0438 \u0414\u0435\u043B\u044C\u0442\u0430",x:48,z:278,dist:195}],landmarks:[]},rapids:{id:"rapids",name:"\u041A\u0430\u0441\u043A\u0430\u0434 \xAB\u0421\u0435\u0432\u0435\u0440\u043D\u044B\u0435 \u041F\u043E\u0440\u043E\u0433\u0438\xBB",badge:"\u0421\u0432\u0435\u0440\u0445\u043D\u0430\u043F\u043E\u0440 \xB7 \u0413\u0410\u042D\u0421 \u0438 \u0424\u0440\u044D\u043D\u0441\u0438\u0441",areaLabel:"\u0414\u0432\u043E\u0439\u043D\u043E\u0439 \u043A\u0430\u043D\u044C\u043E\u043D \xB7 \u0421\u043D\u0435\u0436\u043D\u044B\u0435 \u0445\u0440\u0435\u0431\u0442\u044B",headLabel:"\u041C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u044B\u0439 \u043D\u0430\u043F\u043E\u0440",baseMainQ:176,baseCreekQ:66,baseWestQ:44,mainInflowQ:176,creekInflowQ:66,westCreekQ:44,desc:"\u0414\u0432\u0430 \u0433\u043B\u0443\u0431\u043E\u043A\u0438\u0445 \u0441\u043A\u0430\u043B\u044C\u043D\u044B\u0445 \u0443\u0449\u0435\u043B\u044C\u044F \u043F\u043E\u0434\u0440\u044F\u0434 \u0441 \u0432\u044B\u0441\u043E\u043A\u0438\u043C \u043F\u0435\u0440\u0435\u043F\u0430\u0434\u043E\u043C \u0432\u044B\u0441\u043E\u0442 \u0438 \u043E\u0431\u0438\u043B\u044C\u043D\u044B\u043C \u043B\u0435\u0434\u043D\u0438\u043A\u043E\u0432\u044B\u043C \u0442\u0430\u044F\u043D\u0438\u0435\u043C \u0434\u043D\u0451\u043C. \u0418\u0434\u0435\u0430\u043B\u044C\u043D\u0430 \u0434\u043B\u044F \u043A\u0430\u0441\u043A\u0430\u0434\u0430 \u0413\u042D\u0421 \u0438 \u0413\u0410\u042D\u0421.",baseLandmarks:[{label:"\u25B2 \u0412\u0435\u0440\u0445\u043D\u0438\u0439 \u043A\u0430\u043D\u044C\u043E\u043D \u21161",x:-18,z:-248,dist:145},{label:"\u25B2 \u041D\u0438\u0436\u043D\u0438\u0435 \u041F\u043E\u0440\u043E\u0433\u0438 \u21162",x:22,z:-98,dist:148},{label:"\u25C6 \u041F\u0440\u043E\u043C\u0437\u043E\u043D\u0430 \u0410\u043B\u044E\u043C\u0438\u043D\u0433\u0440\u0430\u0434\u0430",x:246,z:-38,dist:175},{label:"\u25C9 \u0422\u0435\u0440\u0440\u0430\u0441\u0430 \u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u044B",x:168,z:98,dist:155}],landmarks:[]},delta:{id:"delta",name:"\u041F\u043E\u0439\u043C\u0430 \xAB\u0412\u0435\u043B\u0438\u043A\u0430\u044F \u0414\u0435\u043B\u044C\u0442\u0430\xBB",badge:"\u0421\u0443\u0434\u043E\u0445\u043E\u0434\u0441\u0442\u0432\u043E, \u0448\u043B\u044E\u0437\u044B \u0438 \u043F\u0430\u0432\u043E\u0434\u043A\u0438",areaLabel:"\u0428\u0438\u0440\u043E\u043A\u0430\u044F \u0440\u0435\u043A\u0430 \xB7 \u041C\u044F\u0433\u043A\u0438\u0435 \u0433\u0440\u0443\u043D\u0442\u044B",headLabel:"\u0411\u043E\u043B\u044C\u0448\u043E\u0439 \u0440\u0430\u0441\u0445\u043E\u0434 Q \u0438 \u0444\u043B\u043E\u0442",baseMainQ:205,baseCreekQ:62,baseWestQ:50,mainInflowQ:205,creekInflowQ:62,westCreekQ:50,desc:"\u041C\u043E\u0433\u0443\u0447\u0430\u044F \u0441\u0443\u0434\u043E\u0445\u043E\u0434\u043D\u0430\u044F \u0440\u0435\u043A\u0430 \u0432 \u0448\u0438\u0440\u043E\u043A\u043E\u0439 \u043F\u043E\u0439\u043C\u0435: \u0438\u043D\u0442\u0435\u043D\u0441\u0438\u0432\u043D\u043E\u0435 \u0438\u0441\u043F\u0430\u0440\u0435\u043D\u0438\u0435 \u0441 \u0437\u0435\u0440\u043A\u0430\u043B\u0430, \u0444\u0438\u043B\u044C\u0442\u0440\u0430\u0446\u0438\u044F \u043F\u043E\u0434 \u043F\u043B\u043E\u0442\u0438\u043D\u0430\u043C\u0438, \u043A\u0430\u0440\u0430\u0432\u0430\u043D\u044B \u0431\u0430\u0440\u0436, \u043F\u043E\u0440\u0442\u044B \u0438 \u0440\u044B\u0431\u0445\u043E\u0437\u044B.",baseLandmarks:[{label:"\u25B2 \u0413\u043B\u0430\u0432\u043D\u044B\u0439 \u0441\u0442\u0432\u043E\u0440 \u0438 \u0428\u043B\u044E\u0437",x:8,z:-152,dist:162},{label:"\u25C6 \u0422\u0440\u0430\u0441\u0441\u0430 \u0441\u043F\u0440\u044F\u043C\u043B\u0435\u043D\u0438\u044F",x:-16,z:-6,dist:190},{label:"\u25C9 \u041F\u043E\u043B\u044F \u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u044B",x:168,z:98,dist:155},{label:"\u2693 \u0428\u0438\u0440\u043E\u043A\u0430\u044F \u0434\u0435\u043B\u044C\u0442\u0430",x:-12,z:268,dist:205}],landmarks:[]}},Ra={low:{id:"low",label:"\u0411\u044B\u0441\u0442\u0440\u043E\u0435",grid:168,maxPixelRatio:1.15,shadows:!1,shadowEvery:0,maxParticles:1400,treeCount:950,rockCount:320,substepsCap:6},medium:{id:"medium",label:"\u0421\u0431\u0430\u043B\u0430\u043D\u0441\u0438\u0440.",grid:208,maxPixelRatio:1.6,shadows:!0,shadowEvery:3,maxParticles:3e3,treeCount:1950,rockCount:560,substepsCap:8},high:{id:"high",label:"\u0423\u043B\u044C\u0442\u0440\u0430",grid:248,maxPixelRatio:2,shadows:!0,shadowEvery:2,maxParticles:5200,treeCount:3100,rockCount:840,substepsCap:10}},qe={low_water:{id:"low_water",label:"\u0416\u0430\u0440\u043A\u0430\u044F \u043C\u0435\u0436\u0435\u043D\u044C",icon:"\u2600",inflowMult:.76,rainRate:0,rainMmPerHour:0,baseTempC:25.5,relHumidity:.36,windSpeedMs:3.4,sunIntensity:1.18,fogDensity:38e-5,next:{low_water:.25,normal:.55,rain:.2}},normal:{id:"normal",label:"\u041D\u043E\u0440\u043C\u0430\u043B\u044C\u043D\u044B\u0439 \u0441\u0442\u043E\u043A",icon:"\u25C8",inflowMult:1,rainRate:0,rainMmPerHour:0,baseTempC:17.5,relHumidity:.56,windSpeedMs:4.6,sunIntensity:1.05,fogDensity:48e-5,next:{low_water:.22,normal:.43,rain:.27,flood:.08}},rain:{id:"rain",label:"\u0426\u0438\u043A\u043B\u043E\u043D \u0438 \u043B\u0438\u0432\u0435\u043D\u044C",icon:"\u2248",inflowMult:1.48,rainRate:16e-5,rainMmPerHour:14.5,baseTempC:12,relHumidity:.88,windSpeedMs:7.8,sunIntensity:.58,fogDensity:76e-5,next:{normal:.45,rain:.3,flood:.25}},flood:{id:"flood",label:"\u0412\u0435\u0441\u0435\u043D\u043D\u0435\u0435 \u043F\u043E\u043B\u043E\u0432\u043E\u0434\u044C\u0435",icon:"\u25C8",inflowMult:2.22,rainRate:32e-5,rainMmPerHour:29,baseTempC:15,relHumidity:.82,windSpeedMs:10.5,sunIntensity:.46,fogDensity:95e-5,next:{rain:.55,normal:.45}}},Mr=[{id:"inspect",key:"1",name:"\u0413\u0438\u0434\u0440\u043E\u043F\u043E\u0441\u0442 / \u0418\u043D\u0441\u043F\u0435\u043A\u0446\u0438\u044F \u0413\u042D\u0421",short:"\u041E\u0441\u043C\u043E\u0442\u0440",costLabel:"\u0431\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u043E",desc:"\u0417\u0430\u043C\u0435\u0440 \u0433\u043B\u0443\u0431\u0438\u043D\u044B, \u0447\u0438\u0441\u043B\u0430 \u0424\u0440\u0443\u0434\u0430, \u0444\u0438\u043B\u044C\u0442\u0440\u0430\u0446\u0438\u0438, \u041A\u041F\u0414 \u0442\u0443\u0440\u0431\u0438\u043D, \u0432\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0435 \u043D\u043E\u0447\u043D\u043E\u0439 \u0437\u0430\u043A\u0430\u0447\u043A\u0438 \u0413\u0410\u042D\u0421 \u0438 \u0443\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u0437\u0430\u0442\u0432\u043E\u0440\u0430\u043C\u0438."},{id:"canal_dig",key:"2",name:"\u042D\u043A\u0441\u043A\u0430\u0432\u0430\u0442\u043E\u0440 \u0434\u0435\u0440\u0438\u0432\u0430\u0446\u0438\u043E\u043D\u043D\u043E\u0433\u043E \u043A\u0430\u043D\u0430\u043B\u0430",short:"\u041A\u043E\u043F\u0430\u0442\u044C \u043A\u0430\u043D\u0430\u043B",costPerM3Soil:3.4,costPerM3Rock:14.5,costLabel:"\u0433\u0440\u0443\u043D\u0442 + \u0449\u0435\u0431\u0435\u043D\u044C",desc:"\u041F\u0440\u043E\u043A\u043B\u0430\u0434\u043A\u0430 \u0441\u0443\u0434\u043E\u0445\u043E\u0434\u043D\u044B\u0445, \u0434\u0435\u0440\u0438\u0432\u0430\u0446\u0438\u043E\u043D\u043D\u044B\u0445 \u0438 \u043E\u0440\u043E\u0441\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0445 \u043A\u0430\u043D\u0430\u043B\u043E\u0432 (\u0434\u0430\u0451\u0442 \u0449\u0435\u0431\u0435\u043D\u044C \u043D\u0430 \u044D\u043A\u0441\u043F\u043E\u0440\u0442 \u0438 \u0441\u043A\u0438\u0434\u043A\u0443 -38% \u043D\u0430 \u0431\u0435\u0442\u043E\u043D!). Shift \u2014 \u0440\u043E\u0432\u043D\u044B\u0439 \u0443\u043A\u043B\u043E\u043D."},{id:"canal_liner",key:"3",name:"\u0416/\u0411 \u043E\u0431\u043B\u0438\u0446\u043E\u0432\u043A\u0430 \u0438 \u043F\u0430\u0440\u0430\u043F\u0435\u0442\u044B \u043A\u0430\u043D\u0430\u043B\u0430",short:"\u0416/\u0411 \u043B\u043E\u0442\u043E\u043A",costPerCell:58,costLabel:"58 \u20BD/\u0441\u0435\u043A\u0446\u0438\u044F",desc:"\u0423\u043A\u043B\u0430\u0434\u043A\u0430 \u0433\u0438\u0434\u0440\u043E\u0442\u0435\u0445\u043D\u0438\u0447\u0435\u0441\u043A\u043E\u0433\u043E \u0431\u0435\u0442\u043E\u043D\u0430 \u041240 (n = 0.012): \u043D\u0443\u043B\u0435\u0432\u0430\u044F \u0438\u043D\u0444\u0438\u043B\u044C\u0442\u0440\u0430\u0446\u0438\u044F \u0432 \u0433\u0440\u0443\u043D\u0442 \u0438 \u0440\u0430\u0437\u0433\u043E\u043D \u043F\u043E\u0442\u043E\u043A\u0430 \u0432 2.5 \u0440\u0430\u0437\u0430!"},{id:"earth_dam",key:"4",name:"\u0413\u0440\u0443\u043D\u0442\u043E\u0432\u0430\u044F \u043F\u043B\u043E\u0442\u0438\u043D\u0430 / \u041F\u0435\u0440\u0435\u043C\u044B\u0447\u043A\u0430",short:"\u041F\u0435\u0440\u0435\u043C\u044B\u0447\u043A\u0430",costPerM3:5.2,costLabel:"-70% \u0438\u0437 \u043E\u0442\u0432\u0430\u043B\u0430",desc:"\u041D\u0430\u0441\u044B\u043F\u043D\u0430\u044F \u0434\u0430\u043C\u0431\u0430 \u0438\u0437 \u0441\u0443\u0433\u043B\u0438\u043D\u043A\u0430 \u0438 \u043A\u0430\u043C\u043D\u044F \u0434\u043B\u044F \u043E\u0442\u0436\u0438\u043C\u0430 \u0440\u0435\u043A\u0438 \u0438\u043B\u0438 \u043E\u0431\u0432\u0430\u043B\u043E\u0432\u0430\u043D\u0438\u044F \u0431\u0435\u0440\u0435\u0433\u043E\u0432. \u041F\u0440\u0438 \u043F\u0435\u0440\u0435\u043B\u0438\u0432\u0435 \u0447\u0435\u0440\u0435\u0437 \u0433\u0440\u0435\u0431\u0435\u043D\u044C \u0440\u0430\u0437\u043C\u044B\u0432\u0430\u0435\u0442\u0441\u044F!"},{id:"concrete_dam",key:"5",name:"\u0413\u0440\u0430\u0432\u0438\u0442\u0430\u0446\u0438\u043E\u043D\u043D\u0430\u044F 3D-\u043F\u043B\u043E\u0442\u0438\u043D\u0430",short:"3D \u041F\u043B\u043E\u0442\u0438\u043D\u0430",costPerM3:22,costLabel:"3 \u044D\u0442\u0430\u043F\u0430 + \u043A\u0440\u0430\u043D\u044B",desc:"\u0412\u043E\u0437\u0432\u043E\u0434\u0438\u0442\u0441\u044F \u043F\u043E\u044D\u0442\u0430\u043F\u043D\u043E \u0431\u0430\u0448\u0435\u043D\u043D\u044B\u043C\u0438 \u043A\u0440\u0430\u043D\u0430\u043C\u0438: \u0448\u043F\u0443\u043D\u0442 \u2192 \u0430\u0440\u043C\u043E\u043A\u0430\u0440\u043A\u0430\u0441 \u2192 \u043C\u043E\u043D\u043E\u043B\u0438\u0442! \u041F\u0440\u0438 \u043F\u0435\u0440\u0435\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u0438 \u0447\u0435\u0440\u0435\u0437 \u0433\u0440\u0435\u0431\u0435\u043D\u044C \u0438\u0434\u0451\u0442 3D-\u043F\u0435\u0440\u0435\u043B\u0438\u0432 \u0432\u043E\u0434\u044B."},{id:"foundation",key:"6",name:"\u0426\u0435\u043C\u0435\u043D\u0442\u0430\u0446\u0438\u043E\u043D\u043D\u0430\u044F \u0437\u0430\u0432\u0435\u0441\u0430 \u0438 \u041A\u043E\u043D\u0442\u0440\u0444\u043E\u0440\u0441\u044B",short:"\u041A\u043E\u043D\u0442\u0440\u0444\u043E\u0440\u0441",costPerCell:135,costLabel:"135 \u20BD/\u0431\u043B\u043E\u043A",desc:"\u0413\u043B\u0443\u0431\u0438\u043D\u043D\u0430\u044F \u0446\u0435\u043C\u0435\u043D\u0442\u0430\u0446\u0438\u044F \u0441\u043A\u0430\u043B\u044B \u0438 \u043D\u0430\u043A\u043B\u043E\u043D\u043D\u044B\u0435 3D-\u043A\u043E\u043D\u0442\u0440\u0444\u043E\u0440\u0441\u044B: \u043E\u0441\u0442\u0430\u043D\u0430\u0432\u043B\u0438\u0432\u0430\u0435\u0442 \u0444\u0438\u043B\u044C\u0442\u0440\u0430\u0446\u0438\u044E \u0414\u0430\u0440\u0441\u0438 \u043F\u043E\u0434 \u043F\u043B\u043E\u0442\u0438\u043D\u043E\u0439 \u0438 \u0434\u0435\u0440\u0436\u0438\u0442 \u0432\u044B\u0441\u043E\u043A\u0438\u0439 \u043D\u0430\u043F\u043E\u0440."},{id:"spillway",key:"7",name:"\u042D\u043A\u0441\u043F\u043B\u0443\u0430\u0442\u0430\u0446\u0438\u043E\u043D\u043D\u044B\u0439 \u0432\u043E\u0434\u043E\u0441\u0431\u0440\u043E\u0441",short:"\u0412\u043E\u0434\u043E\u0441\u0431\u0440\u043E\u0441",costFlat:4400,costLabel:"4 400 \u20BD",desc:"\u0421\u0435\u0433\u043C\u0435\u043D\u0442\u043D\u044B\u0439 \u0437\u0430\u0442\u0432\u043E\u0440 \u0441 3D-\u0432\u043E\u0434\u043E\u0441\u043B\u0438\u0432\u043D\u044B\u043C \u043B\u043E\u0442\u043A\u043E\u043C \u0438 \u043D\u043E\u0441\u043A\u043E\u043C-\u0442\u0440\u0430\u043C\u043F\u043B\u0438\u043D\u043E\u043C: \u0443\u043F\u0440\u0430\u0432\u043B\u044F\u0435\u043C\u044B\u0439 \u043F\u0440\u043E\u043F\u0443\u0441\u043A \u043F\u0430\u0432\u043E\u0434\u043A\u0430 \u0441 \u0430\u043D\u0438\u043C\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u043E\u0439 \u043F\u0435\u043B\u0435\u043D\u043E\u0439 \u0432\u043E\u0434\u044B."},{id:"turbine_kaplan",key:"8",name:"\u0420\u0443\u0441\u043B\u043E\u0432\u0430\u044F \u0413\u042D\u0421 \u041A\u0430\u043F\u043B\u0430\u043D\u0430 (\u041F\u041B)",short:"\u0413\u042D\u0421 \u041A\u0430\u043F\u043B\u0430\u043D",turbineType:"kaplan",costFlat:9500,costLabel:"9 500 \u20BD",desc:"\u041F\u043E\u0432\u043E\u0440\u043E\u0442\u043D\u043E-\u043B\u043E\u043F\u0430\u0441\u0442\u043D\u0430\u044F \u0442\u0443\u0440\u0431\u0438\u043D\u0430 \u0434\u043B\u044F \u043C\u0430\u043B\u044B\u0445 \u0438 \u0441\u0440\u0435\u0434\u043D\u0438\u0445 \u043D\u0430\u043F\u043E\u0440\u043E\u0432. \u041C\u0430\u0448\u0438\u043D\u043D\u044B\u0439 \u0437\u0430\u043B \u0441\u0442\u0440\u043E\u0433\u043E \u0443 \u043F\u043E\u0434\u043D\u043E\u0436\u0438\u044F \u043F\u043B\u043E\u0442\u0438\u043D\u044B \u0432 \u043D\u0438\u0436\u043D\u0435\u043C \u0431\u044C\u0435\u0444\u0435!"},{id:"turbine_francis",key:"9",name:"\u041F\u0440\u0438\u043F\u043B\u043E\u0442\u0438\u043D\u043D\u0430\u044F \u0413\u042D\u0421 \u0424\u0440\u044D\u043D\u0441\u0438\u0441\u0430 (\u0420\u041E)",short:"\u0413\u042D\u0421 \u0424\u0440\u044D\u043D\u0441\u0438\u0441",turbineType:"francis",costFlat:23500,costLabel:"23 500 \u20BD",desc:"\u0420\u0430\u0434\u0438\u0430\u043B\u044C\u043D\u043E-\u043E\u0441\u0435\u0432\u043E\u0439 \u0430\u0433\u0440\u0435\u0433\u0430\u0442 (\u041A\u041F\u0414 94%) \u0441\u043E \u0441\u0442\u0430\u043B\u044C\u043D\u044B\u043C\u0438 \u043D\u0430\u043F\u043E\u0440\u043D\u044B\u043C\u0438 \u0432\u043E\u0434\u043E\u0432\u043E\u0434\u0430\u043C\u0438, \u0430\u0432\u0430\u043D\u043A\u0430\u043C\u0435\u0440\u043E\u0439 \u0438 \u043E\u0441\u0442\u0435\u043A\u043B\u0451\u043D\u043D\u044B\u043C \u043C\u0430\u0448\u0437\u0430\u043B\u043E\u043C \u0432 \u043D\u0438\u0436\u043D\u0435\u043C \u0431\u044C\u0435\u0444\u0435."},{id:"turbine_pelton",key:"0",name:"\u0412\u044B\u0441\u043E\u043A\u043E\u043D\u0430\u043F\u043E\u0440\u043D\u0430\u044F \u0413\u042D\u0421 / \u0413\u0410\u042D\u0421",short:"\u0413\u042D\u0421 / \u0413\u0410\u042D\u0421",turbineType:"pelton",costFlat:32e3,costLabel:"32 000 \u20BD \xB7 \u0413\u0410\u042D\u0421",desc:"\u0412\u044B\u0441\u043E\u043A\u043E\u043D\u0430\u043F\u043E\u0440\u043D\u044B\u0439 \u0430\u0433\u0440\u0435\u0433\u0430\u0442 \u0441 \u0440\u0435\u0436\u0438\u043C\u043E\u043C \u043E\u0431\u0440\u0430\u0442\u0438\u043C\u043E\u0439 \u0413\u0410\u042D\u0421: \u043D\u043E\u0447\u044C\u044E \u043F\u043E \u0434\u0435\u0448\u0451\u0432\u043E\u043C\u0443 \u0442\u0430\u0440\u0438\u0444\u0443 \u0437\u0430\u043A\u0430\u0447\u0438\u0432\u0430\u0435\u0442 \u0432\u043E\u0434\u0443 \u043E\u0431\u0440\u0430\u0442\u043D\u043E \u0432 \u0432\u043E\u0434\u043E\u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435!"},{id:"nav_lock",key:"L",name:"\u0421\u0443\u0434\u043E\u0445\u043E\u0434\u043D\u044B\u0439 \u0448\u043B\u044E\u0437 \u0438 \u0433\u0440\u0443\u0437\u043E\u0432\u043E\u0439 \u043F\u0440\u0438\u0447\u0430\u043B",short:"\u0428\u043B\u044E\u0437 / \u0424\u043B\u043E\u0442",costFlat:11500,costLabel:"11 500 \u20BD (+\u043F\u043E\u0448\u043B\u0438\u043D\u044B)",desc:"\u041A\u0430\u043C\u0435\u0440\u0430 \u0448\u043B\u044E\u0437\u043E\u0432\u0430\u043D\u0438\u044F \u0441 \u0432\u043E\u0440\u043E\u0442\u0430\u043C\u0438: \u043F\u0440\u043E\u043F\u0443\u0441\u043A\u0430\u0435\u0442 \u0441\u0443\u0445\u043E\u0433\u0440\u0443\u0437\u044B, \u0442\u0430\u043D\u043A\u0435\u0440\u044B \u0438 \u0442\u0435\u043F\u043B\u043E\u0445\u043E\u0434\u044B \u0447\u0435\u0440\u0435\u0437 \u0433\u0438\u0434\u0440\u043E\u0443\u0437\u0435\u043B \u0438 \u043F\u0440\u0438\u043D\u043E\u0441\u0438\u0442 \u0441\u0442\u0430\u0431\u0438\u043B\u044C\u043D\u044B\u0435 \u0444\u0440\u0430\u0445\u0442\u043E\u0432\u044B\u0435 \u0441\u0431\u043E\u0440\u044B!"},{id:"fish_eco",key:"F",name:"\u0420\u044B\u0431\u0445\u043E\u0437, \u0440\u044B\u0431\u043E\u0445\u043E\u0434 \u0438 \u044F\u0445\u0442-\u043C\u0430\u0440\u0438\u043D\u0430",short:"\u0420\u044B\u0431\u0445\u043E\u0437 / \u042D\u043A\u043E",costFlat:7200,costLabel:"7 200 \u20BD (+\u0442\u0443\u0440\u0438\u0437\u043C)",desc:"\u041F\u043E\u043D\u0442\u043E\u043D\u043D\u044B\u0435 \u0444\u043E\u0440\u0435\u043B\u0435\u0432\u044B\u0435 \u0441\u0430\u0434\u043A\u0438 \u0438 \u0442\u0443\u0440\u0438\u0441\u0442\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u043F\u0440\u0438\u0441\u0442\u0430\u043D\u044C \u043D\u0430 \u0432\u043E\u0434\u043E\u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435: \u0434\u043E\u0445\u043E\u0434 \u043E\u0442 \u0430\u043A\u0432\u0430\u043A\u0443\u043B\u044C\u0442\u0443\u0440\u044B \u0438 \u044D\u043A\u043E-\u0442\u0443\u0440\u0438\u0437\u043C\u0430 \u0432 \u0447\u0438\u0441\u0442\u043E\u0439 \u0432\u043E\u0434\u0435!"},{id:"powerline",key:"P",name:"\u041E\u0420\u0423 110/220 \u043A\u0412 \u0438 \u041B\u042D\u041F \u043A \u0433\u043E\u0440\u043E\u0434\u0430\u043C",short:"\u041E\u0420\u0423 / \u041B\u042D\u041F",costPerMeter:13,costLabel:"6 800 \u20BD \u041E\u0420\u0423 / \u041B\u042D\u041F",desc:"\u041A\u043B\u0438\u043A \u043F\u043E \u0433\u043E\u0440\u043E\u0434\u0443 \u2014 \u0442\u044F\u043D\u0435\u0442 \u043C\u0430\u0433\u0438\u0441\u0442\u0440\u0430\u043B\u044C\u043D\u0443\u044E \u041B\u042D\u041F. \u041A\u043B\u0438\u043A \u043D\u0430 \u0441\u0443\u0445\u043E\u043C \u0431\u0435\u0440\u0435\u0433\u0443 \u0443 \u0413\u042D\u0421 \u2014 \u0441\u0442\u0440\u043E\u0438\u0442 3D-\u043F\u043E\u0434\u0441\u0442\u0430\u043D\u0446\u0438\u044E \u041E\u0420\u0423 (\u0441\u043D\u0438\u0436\u0430\u0435\u0442 \u043F\u043E\u0442\u0435\u0440\u0438 \u0441 16% \u0434\u043E 3%)!"},{id:"demolish",key:"X",name:"\u0414\u0435\u043C\u043E\u043D\u0442\u0430\u0436 \u0441\u043E\u043E\u0440\u0443\u0436\u0435\u043D\u0438\u044F",short:"\u0421\u043D\u043E\u0441",costFlat:250,costLabel:"250 \u20BD",desc:"\u0414\u0435\u043C\u043E\u043D\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0433\u0438\u0434\u0440\u043E\u0430\u0433\u0440\u0435\u0433\u0430\u0442, \u0432\u043E\u0434\u043E\u0441\u0431\u0440\u043E\u0441, \u0448\u043B\u044E\u0437, \u0440\u044B\u0431\u0445\u043E\u0437, \u043F\u043E\u0434\u0441\u0442\u0430\u043D\u0446\u0438\u044E \u0438\u043B\u0438 \u0440\u0430\u0437\u043E\u0431\u0440\u0430\u0442\u044C \u0441\u0435\u043A\u0446\u0438\u044E \u043F\u043B\u043E\u0442\u0438\u043D\u044B."}],Ag={kaplan:{id:"kaplan",baseName:"\u041A\u0430\u043F\u043B\u0430\u043D\u0430 \u041F\u041B",baseRatedMW:8,baseMinHead:2,baseOptHead:8,baseMaxHead:22,baseHeadSigma:12.5,baseMaxArea:5.4,peakEta:.92,frictionK:15e-5,upkeepPerSec:10,cost:9500,reversible:!1,color:3900150},francis:{id:"francis",baseName:"\u0424\u0440\u044D\u043D\u0441\u0438\u0441\u0430 \u0420\u041E",baseRatedMW:22,baseMinHead:4.8,baseOptHead:16,baseMaxHead:46,baseHeadSigma:16.5,baseMaxArea:6.8,peakEta:.94,frictionK:1e-4,upkeepPerSec:22,cost:23500,reversible:!0,color:16096779},pelton:{id:"pelton",baseName:"\u0413\u0410\u042D\u0421 / \u041F\u0435\u043B\u0442\u043E\u043D",baseRatedMW:36,baseMinHead:8,baseOptHead:24.5,baseMaxHead:66,baseHeadSigma:22,baseMaxArea:6,peakEta:.93,frictionK:8e-5,upkeepPerSec:30,cost:32e3,reversible:!0,color:1096065}},_r={kaplan:{},francis:{},pelton:{}},we={startingCash:68e3,baseRatePerMWSec:345,industrialPPAMultiplier:1.28,capacityPaymentPerMWSec:18,pumpedNightBuyFactor:.34,navLockTollPerSec:95,municipalWaterPerKPopSec:11.5,irrigationBonusPerSec:135,fishFarmIncomePerSec:88,ecoTourismPerMarinaSec:46,aggregateSellPricePerM3:10.5,carbonCreditPerMWSec:22,floodProtectionBonusSec:95,overSupplyExportFactor:.42,loanChunk:3e4,loanInterestPerSec:4e-4,maxLoan:18e4};function Sc(r){let t=(r%24+24)%24;return t>=0&&t<6?.56:t>=6&&t<10.5?1.65:t>=10.5&&t<17?1.06:t>=17&&t<22?2.38:.8}function Ld(r){let t=(r%24+24)%24;return t>=0&&t<6?{label:"\u041D\u043E\u0447\u044C \xD70.56 (\u0437\u0430\u043A\u0430\u0447\u043A\u0430 \u0413\u0410\u042D\u0421)",cls:"offpeak"}:t>=6&&t<10.5?{label:"\u0423\u0442\u0440\u0435\u043D\u043D\u0438\u0439 \u043F\u0438\u043A \xD71.65",cls:"peak"}:t>=10.5&&t<17?{label:"\u0414\u043D\u0435\u0432\u043D\u043E\u0439 \u043F\u043E\u043B\u0443\u043F\u0438\u043A \xD71.06",cls:"mid"}:t>=17&&t<22?{label:"\u0412\u0435\u0447\u0435\u0440\u043D\u0438\u0439 \u0421\u0423\u041F\u0415\u0420-\u041F\u0418\u041A \xD72.38",cls:"superpeak"}:{label:"\u0421\u043F\u0430\u0434 \u043D\u0430\u0433\u0440\u0443\u0437\u043A\u0438 \xD70.80",cls:"offpeak"}}function Ia(r="km5"){let t=Cn[r]||Cn.km5;U.scaleId=t.id,U.size=t.size,U.horizScale=t.horizScale,U.elevScale=t.elevScale,U.flowScale=t.flowScale,U.powerScale=t.powerScale,U.snowLineY=t.snowLineY,U.minZoom=t.minZoom,U.maxZoom=t.maxZoom,U.defaultDist=t.defaultDist,U.brushSizes=t.brushSizes.slice();let e=t.elevScale;_e.highDamHeadThreshold=+(10.5*e).toFixed(1),_e.maxUnreinforcedHead=+(17.5*e).toFixed(1);for(let i of _e.damHeightTiers)i.addHeight=+(i.baseAddHeight*e).toFixed(1),i.label=`\u042F\u0440\u0443\u0441 +${Math.round(i.addHeight)}\u043C`;for(let i of Object.values(bi))i.mainInflowQ=Math.round(i.baseMainQ*t.flowScale),i.creekInflowQ=Math.round(i.baseCreekQ*t.flowScale),i.westCreekQ=Math.round(i.baseWestQ*t.flowScale),i.areaLabel=`${t.shortLabel} \xB7 3 \u0440\u0435\u043A\u0438 \xB7 8 \u0433\u043E\u0440\u043E\u0434\u043E\u0432`,i.headLabel=`\u0421\u0442\u043E\u043A \u0440\u0435\u043A: ~${i.mainInflowQ+i.creekInflowQ+i.westCreekQ} \u043C\xB3/\u0441`,i.landmarks=i.baseLandmarks.map(n=>({label:n.label,x:+(n.x*t.horizScale).toFixed(1),z:+(n.z*t.horizScale).toFixed(1),dist:Math.round(n.dist*Math.pow(t.horizScale,.78))}));for(let[i,n]of Object.entries(Ag)){let s=Math.round(n.baseRatedMW*t.powerScale),o=_r[i];o.id=n.id,o.name=`${n.baseName}-${s}`,o.ratedMW=s,o.minHead=+(n.baseMinHead*e).toFixed(1),o.optHead=+(n.baseOptHead*e).toFixed(1),o.maxHead=+(n.baseMaxHead*e).toFixed(1),o.headSigma=+(n.baseHeadSigma*e).toFixed(1),o.maxArea=+(n.baseMaxArea*(t.flowScale/Math.sqrt(e))).toFixed(2),o.peakEta=n.peakEta,o.frictionK=n.frictionK/(t.flowScale*t.flowScale)*e,o.upkeepPerSec=n.upkeepPerSec,o.cost=n.cost,o.reversible=n.reversible,o.color=n.color}for(let i of Mr)if(i.turbineType&&_r[i.turbineType]){let n=_r[i.turbineType];i.turbineType==="kaplan"?i.short=`\u041A\u0430\u043F\u043B\u0430\u043D ${n.ratedMW}\u041C\u0412\u0442`:i.turbineType==="francis"?i.short=`\u0424\u0440\u044D\u043D\u0441\u0438\u0441 ${n.ratedMW}\u041C\u0412\u0442`:i.short=`\u0413\u0410\u042D\u0421 ${n.ratedMW}\u041C\u0412\u0442`}Ye.length=0;for(let i of Tg){let n={id:i.id,name:i.name,subtitle:i.subtitle,x:+(i.baseX*t.horizScale).toFixed(1),z:+(i.baseZ*t.horizScale).toFixed(1),plateauRadius:+(i.baseRadius*t.horizScale).toFixed(1),baseElevation:+(i.baseElev*e).toFixed(2),startPop:Math.round(i.startPop*Math.sqrt(t.horizScale)),baseDemandMW:+(i.baseDemandMW*t.powerScale).toFixed(2),demandPerBuilding:+(i.demandPerBuilding*t.powerScale).toFixed(3),tariffBonus:i.tariffBonus,needsIrrigation:!!i.needsIrrigation,specialContract:i.specialContract||null,connectedAtStart:i.connectedAtStart,accent:i.accent,archetype:i.archetype};i.baseIrrTarget&&(n.irrigationTarget={x:+(i.baseIrrTarget.x*t.horizScale).toFixed(1),z:+(i.baseIrrTarget.z*t.horizScale).toFixed(1),radius:+(i.baseIrrTarget.radius*t.horizScale).toFixed(1)}),Ye.push(n)}return t}Ia("km5");var Sr=[{id:"first_watt",title:"\u041F\u0435\u0440\u0432\u044B\u0439 \u043F\u0440\u043E\u043C\u044B\u0448\u043B\u0435\u043D\u043D\u044B\u0439 \u0442\u043E\u043A \u0413\u042D\u0421!",desc:"\u041F\u043E\u0441\u0442\u0440\u043E\u0439\u0442\u0435 \u043F\u043B\u043E\u0442\u0438\u043D\u0443, \u0437\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u0435 \u043F\u0440\u0438\u043F\u043B\u043E\u0442\u0438\u043D\u043D\u0443\u044E \u0413\u042D\u0421 \u0432 \u043D\u0438\u0436\u043D\u0435\u043C \u0431\u044C\u0435\u0444\u0435 \u0438 \u0432\u044B\u0434\u0430\u0439\u0442\u0435 \u043C\u043E\u0449\u043D\u043E\u0441\u0442\u044C \u0432 \u0441\u0435\u0442\u044C.",reward:12e3,check:r=>r.totalMW>=.45*U.powerScale},{id:"reinforced_dam",title:"\u0418\u043D\u0436\u0435\u043D\u0435\u0440\u043D\u0430\u044F \u0437\u0430\u0449\u0438\u0442\u0430 \u0438 \u041E\u0420\u0423",desc:"\u0423\u043A\u0440\u0435\u043F\u0438\u0442\u0435 \u043F\u043B\u043E\u0442\u0438\u043D\u0443 \u043C\u0438\u043D\u0438\u043C\u0443\u043C 6 \u0431\u043B\u043E\u043A\u0430\u043C\u0438 \u043A\u043E\u043D\u0442\u0440\u0444\u043E\u0440\u0441\u043E\u0432/\u0446\u0435\u043C\u0435\u043D\u0442\u0430\u0446\u0438\u0438 \u0438\u043B\u0438 \u043F\u043E\u0441\u0442\u0440\u043E\u0439\u0442\u0435 \u043F\u043E\u0434\u0441\u0442\u0430\u043D\u0446\u0438\u044E \u041E\u0420\u0423.",reward:14e3,check:r=>r.reinforcedCells>=6||r.substations>=1},{id:"custom_canal",title:"\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u0432\u043E\u0434\u043D\u0430\u044F \u0430\u0440\u0442\u0435\u0440\u0438\u044F",desc:"\u041F\u0440\u043E\u043A\u043E\u043F\u0430\u0439\u0442\u0435 \u044D\u043A\u0441\u043A\u0430\u0432\u0430\u0442\u043E\u0440\u043E\u043C \u0434\u0435\u0440\u0438\u0432\u0430\u0446\u0438\u043E\u043D\u043D\u044B\u0439, \u0441\u0443\u0434\u043E\u0445\u043E\u0434\u043D\u044B\u0439 \u0438\u043B\u0438 \u043E\u0440\u043E\u0441\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u043A\u0430\u043D\u0430\u043B.",reward:15e3,check:r=>r.excavatedNormM3>=500},{id:"nav_or_fish",title:"\u041A\u043E\u043C\u043F\u043B\u0435\u043A\u0441\u043D\u044B\u0439 \u0433\u0438\u0434\u0440\u043E\u0443\u0437\u0435\u043B: \u0424\u043B\u043E\u0442 \u0438 \u0411\u0438\u043E\u0440\u0435\u0441\u0443\u0440\u0441\u044B",desc:"\u041F\u043E\u0441\u0442\u0440\u043E\u0439\u0442\u0435 \u0441\u0443\u0434\u043E\u0445\u043E\u0434\u043D\u044B\u0439 \u0448\u043B\u044E\u0437 [L] \u0434\u043B\u044F \u043F\u0440\u043E\u043F\u0443\u0441\u043A\u0430 \u043A\u043E\u0440\u0430\u0431\u043B\u0435\u0439 \u0438\u043B\u0438 \u0440\u044B\u0431\u0445\u043E\u0437/\u043C\u0430\u0440\u0438\u043D\u0443 [F] \u043D\u0430 \u0432\u043E\u0434\u043E\u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435.",reward:19e3,check:r=>r.navLocks>=1||r.fishFarms>=1},{id:"irrigation_done",title:"\u0416\u0438\u0432\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u0432\u043B\u0430\u0433\u0430 \u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u044B",desc:"\u041F\u043E\u0434\u0432\u0435\u0434\u0438\u0442\u0435 \u0432\u043E\u0434\u0443 \u0441\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u043C \u043A\u0430\u043D\u0430\u043B\u043E\u043C \u043A \u043E\u0440\u043E\u0441\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u043C\u0443 \u043A\u043E\u043B\u044C\u0446\u0443 \u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u044B.",reward:22e3,check:r=>r.agroIrrigated===!0},{id:"industrial_giants",title:"\u041A\u043E\u043D\u0442\u0440\u0430\u043A\u0442 \u0441 \u0410\u043B\u044E\u043C\u0438\u043D\u0433\u0440\u0430\u0434\u043E\u043C \u0438 \u0426\u041E\u0414 \u0418\u0418",desc:"\u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0438\u0442\u0435 \u043A \u044D\u043D\u0435\u0440\u0433\u043E\u043A\u043E\u043B\u044C\u0446\u0443 \u043C\u0438\u043D\u0438\u043C\u0443\u043C 5 \u0433\u043E\u0440\u043E\u0434\u043E\u0432 \u0438 \u0432\u044B\u0434\u0430\u0439\u0442\u0435 \u043F\u0440\u043E\u043C\u044B\u0448\u043B\u0435\u043D\u043D\u0443\u044E \u043C\u043E\u0449\u043D\u043E\u0441\u0442\u044C.",reward:32e3,check:r=>r.connectedCities>=5&&r.totalMW>=6*U.powerScale},{id:"all_cities_grid",title:"\u0415\u0434\u0438\u043D\u0430\u044F \u044D\u043D\u0435\u0440\u0433\u043E\u0441\u0438\u0441\u0442\u0435\u043C\u0430 \u0432\u0441\u0435\u0445 8 \u0433\u043E\u0440\u043E\u0434\u043E\u0432",desc:"\u041E\u0431\u044A\u0435\u0434\u0438\u043D\u0438\u0442\u0435 \u041B\u042D\u041F \u0432\u0441\u0435 8 \u0433\u043E\u0440\u043E\u0434\u043E\u0432 \u0438 \u043F\u0440\u043E\u043C\u043A\u043B\u0430\u0441\u0442\u0435\u0440\u043E\u0432 \u0431\u0430\u0441\u0441\u0435\u0439\u043D\u0430!",reward:46e3,check:r=>r.connectedCities>=8&&r.totalMW>=10*U.powerScale},{id:"megacascade_master",title:"\u0424\u043B\u0430\u0433\u043C\u0430\u043D \u043D\u0430\u0446\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u043E\u0439 \u0433\u0438\u0434\u0440\u043E\u044D\u043D\u0435\u0440\u0433\u0435\u0442\u0438\u043A\u0438",desc:"\u0412\u044B\u0432\u0435\u0434\u0438\u0442\u0435 \u043A\u0430\u0441\u043A\u0430\u0434 \u0413\u042D\u0421/\u0413\u0410\u042D\u0421 \u043D\u0430 \u043F\u0440\u043E\u0435\u043A\u0442\u043D\u0443\u044E \u043F\u0438\u043A\u043E\u0432\u0443\u044E \u043C\u043E\u0449\u043D\u043E\u0441\u0442\u044C!",reward:75e3,check:r=>r.totalMW>=26*U.powerScale}];function Dd(r=navigator,t=window){let e=(r.maxTouchPoints||0)>0&&(/Android|iPhone|iPad|iPod|Mobile/i.test(r.userAgent||"")||t.matchMedia&&t.matchMedia("(pointer: coarse)").matches),i=r.deviceMemory>0&&r.deviceMemory<=4||r.hardwareConcurrency>0&&r.hardwareConcurrency<=4,n=!e&&!i&&(r.hardwareConcurrency||8)>=8;return{touch:!!e,weak:!!i,low:!!(e||i),recommendedQuality:e||i?"low":n?"high":"medium"}}function Nd(r=window){try{let t=r.location&&r.location.search||"",e=new URLSearchParams(t);return e.get("safe")==="1"||e.get("safe")===""}catch{return!1}}var Cg="2026-10-31 18:22",Pa=null;function bc(){if(Pa)return Pa;let r={webgl2:!1,webgl:!1,floatTex:!1,halfFloatTex:!1,vendor:"\u2014",renderer:"\u2014",reason:null};try{let t=document.createElement("canvas");t.width=16,t.height=16;let e=t.getContext("webgl2",{failIfMajorPerformanceCaveat:!1});if(e?(r.webgl2=!0,r.webgl=!0,r.floatTex=!!e.getExtension("EXT_color_buffer_float"),r.halfFloatTex=!0):(e=t.getContext("webgl",{failIfMajorPerformanceCaveat:!1})||t.getContext("experimental-webgl",{}),e&&(r.webgl=!0,r.floatTex=!!e.getExtension("OES_texture_float"),r.halfFloatTex=!!e.getExtension("OES_texture_half_float"))),!e)return r.reason="\u0411\u0440\u0430\u0443\u0437\u0435\u0440 \u043D\u0435 \u0432\u044B\u0434\u0430\u043B WebGL-\u043A\u043E\u043D\u0442\u0435\u043A\u0441\u0442 (\u0432\u044B\u043A\u043B\u044E\u0447\u0435\u043D\u043E \u0430\u043F\u043F\u0430\u0440\u0430\u0442\u043D\u043E\u0435 \u0443\u0441\u043A\u043E\u0440\u0435\u043D\u0438\u0435).",Pa=r,r;let i=e.getExtension("WEBGL_debug_renderer_info");i?(r.vendor=e.getParameter(i.UNMASKED_VENDOR_WEBGL)||"\u2014",r.renderer=e.getParameter(i.UNMASKED_RENDERER_WEBGL)||"\u2014"):(r.vendor=e.getParameter(e.VENDOR)||"\u2014",r.renderer=e.getParameter(e.RENDERER)||"\u2014")}catch(t){r.reason=t.message}return Pa=r,r}function Ud(r={}){let t=bc();return[`\u041A\u0410\u0421\u041A\u0410\u0414: \u0416\u0438\u0432\u0430\u044F \u0412\u043E\u0434\u0430 \xB7 \u0441\u0431\u043E\u0440\u043A\u0430 ${Cg}`,`GPU: ${t.renderer} (${t.vendor})`,`WebGL2: ${t.webgl2?"\u0434\u0430":"\u043D\u0435\u0442"} \xB7 FloatTex: ${t.floatTex?"RGBA32F":t.halfFloatTex?"RGBA16F":"Uint8 fallback"}`,`\u041A\u0430\u0434\u0440: ${r.fps||0} FPS \xB7 \u0424\u0438\u0437\u0438\u043A\u0430 \u0432\u043E\u0434\u044B: ${(r.hydroMs||0).toFixed(2)} \u043C\u0441/\u043A\u0430\u0434\u0440`,`\u0421\u0435\u0442\u043A\u0430 \u0432\u043E\u0434\u044B: ${r.grid||"\u2014"} \xB7 \u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0435 \u0442\u0430\u0439\u043B\u044B 8\xD78: ${r.activeTiles||0}/${r.totalTiles||0} (\u043F\u0440\u043E\u043F\u0443\u0441\u043A \u0441\u0443\u0445\u0438\u0445 \u0441\u043A\u043B\u043E\u043D\u043E\u0432)`,`\u041F\u043E\u0434\u0448\u0430\u0433\u0438 CFL: ${r.substeps||0} \xB7 \u041C\u0430\u0441\u0441\u0430 \u0432\u043E\u0434\u044B: ${((r.waterVolumeM3||0)/1e3).toFixed(1)} \u0442\u044B\u0441. \u043C\xB3`,`Draw calls: ${r.drawCalls||0} \xB7 \u0422\u0440\u0435\u0443\u0433\u043E\u043B\u044C\u043D\u0438\u043A\u0438: ${r.triangles||0} \xB7 \u0418\u043D\u0441\u0442\u0430\u043D\u0441\u044B \u0437\u0434\u0430\u043D\u0438\u0439: ${r.cityBuildings||0}`,`\u042F\u0434\u0440\u043E \u044D\u043A\u043E\u043D\u043E\u043C\u0438\u043A\u0438: FixedClock 30 \u0413\u0446 (\u041F\u0435\u0440\u0435\u043F\u043B\u0451\u0442) \xB7 \u0422\u0435\u043D\u0438: ${r.shadows||"\u0432\u044B\u043A\u043B"}`].join(`
`)}function J(r,t,e){return r<t?t:r>e?e:r}function ci(r,t,e){let i=J((e-r)/(t-r||1e-6),0,1);return i*i*(3-2*i)}function ne(r,t,e){return r+(t-r)*e}function Yn(r=20261031){let t=r>>>0||1;return()=>{t=t+1831565813|0;let e=Math.imul(t^t>>>15,1|t);return e=e+Math.imul(e^e>>>7,61|e)^e,((e^e>>>14)>>>0)/4294967296}}function La(r,t){let e=Math.imul(r,374761393)+Math.imul(t,668265263);return e=Math.imul(e^e>>>13,1274126177),((e^e>>>16)>>>0)/4294967295}function Fd(r,t){let e=Math.floor(r),i=Math.floor(t),n=r-e,s=t-i,o=n*n*(3-2*n),a=s*s*(3-2*s),c=La(e,i),l=La(e+1,i),h=La(e,i+1),u=La(e+1,i+1);return ne(ne(c,l,o),ne(h,u,o),a)*2-1}function wc(r,t,e=5,i=2.05,n=.5){let s=.5,o=1,a=0,c=0;for(let l=0;l<e;l++)a+=s*Fd(r*o,t*o),c+=s,o*=i,s*=n;return a/(c||1)}function Ec(r,t,e=4){let i=.5,n=1,s=0,o=0;for(let a=0;a<e;a++){let c=1-Math.abs(Fd(r*n,t*n));s+=i*c*c,o+=i,n*=2.1,i*=.5}return s/(o||1)}function Da(r,t,e){let i=1/0,n=0,s=10,o=0,a=1,c=0,l=0;for(let u=0;u<e.length-1;u++)l+=Math.hypot(e[u+1].x-e[u].x,e[u+1].z-e[u].z);let h=0;for(let u=0;u<e.length-1;u++){let d=e[u],f=e[u+1],g=f.x-d.x,y=f.z-d.z,p=g*g+y*y||1e-6,m=Math.sqrt(p),_=J(((r-d.x)*g+(t-d.z)*y)/p,0,1),M=d.x+g*_,v=d.z+y*_,w=(r-M)*(r-M)+(t-v)*(t-v);w<i&&(i=w,n=ne(d.bed,f.bed,_),s=ne(d.width,f.width,_),o=g/m,a=y/m,c=(h+m*_)/(l||1)),h+=m}return{dist:Math.sqrt(i),bed:n,width:s,tx:o,tz:a,s:c}}var Rs={bystritsa:{main:[{x:-92,z:-376,bed:35.4,width:17},{x:-58,z:-322,bed:32.8,width:21},{x:-22,z:-262,bed:30,width:29},{x:4,z:-206,bed:27.6,width:22},{x:12,z:-158,bed:25,width:14},{x:16,z:-112,bed:21.6,width:18},{x:96,z:-56,bed:19,width:21},{x:134,z:32,bed:16.4,width:22},{x:88,z:108,bed:13.6,width:23},{x:4,z:122,bed:10.8,width:23},{x:-46,z:198,bed:8.4,width:26},{x:-16,z:294,bed:6.3,width:31},{x:12,z:384,bed:4.4,width:36}],eastCreek:[{x:152,z:-374,bed:40.5,width:11},{x:102,z:-324,bed:36.6,width:12},{x:44,z:-286,bed:32.8,width:14},{x:-16,z:-258,bed:29.8,width:16}],westCreek:[{x:-374,z:68,bed:27.5,width:10},{x:-268,z:96,bed:21.8,width:11},{x:-146,z:132,bed:14.8,width:12},{x:-46,z:194,bed:8.5,width:14}],gorges:[{x:12,z:-158,spanZ:48,strength:25}],seedOffset:0,widthScale:1,soilBonus:0},rapids:{main:[{x:-108,z:-376,bed:42.5,width:16},{x:-64,z:-312,bed:38.2,width:24},{x:-18,z:-248,bed:33.4,width:13},{x:6,z:-182,bed:28,width:25},{x:22,z:-98,bed:22,width:14},{x:118,z:-22,bed:17.8,width:20},{x:128,z:58,bed:15.6,width:21},{x:52,z:132,bed:11.4,width:23},{x:-38,z:208,bed:8.1,width:26},{x:-10,z:302,bed:6,width:30},{x:16,z:384,bed:4.3,width:34}],eastCreek:[{x:168,z:-374,bed:46,width:11},{x:96,z:-316,bed:40.5,width:13},{x:-12,z:-268,bed:35,width:15}],westCreek:[{x:-374,z:74,bed:30,width:10},{x:-220,z:120,bed:19.5,width:12},{x:-38,z:204,bed:8.2,width:14}],gorges:[{x:-18,z:-248,spanZ:44,strength:27},{x:22,z:-98,spanZ:42,strength:23.5}],seedOffset:37.4,widthScale:.96,soilBonus:-.5},delta:{main:[{x:-78,z:-376,bed:30.2,width:22},{x:-36,z:-292,bed:27.6,width:28},{x:8,z:-152,bed:22.8,width:19},{x:28,z:-96,bed:19.8,width:25},{x:112,z:-34,bed:17.5,width:27},{x:132,z:42,bed:15.8,width:28},{x:76,z:118,bed:12.8,width:29},{x:-8,z:146,bed:10.2,width:31},{x:-44,z:224,bed:7.8,width:34},{x:-8,z:312,bed:5.9,width:38},{x:14,z:384,bed:4.3,width:44}],eastCreek:[{x:158,z:-374,bed:34.5,width:13},{x:84,z:-296,bed:29.8,width:15},{x:-8,z:-232,bed:25.6,width:17}],westCreek:[{x:-374,z:82,bed:24,width:12},{x:-212,z:144,bed:14.5,width:14},{x:-44,z:218,bed:8,width:17}],gorges:[{x:8,z:-152,spanZ:52,strength:17}],seedOffset:91.2,widthScale:1.24,soilBonus:2.2}},l_=Rs.bystritsa.main,c_=Rs.bystritsa.eastCreek;function $n(r="bystritsa"){let t=Rs[r]||Rs.bystritsa,e=U.horizScale,i=U.elevScale,n=s=>({x:s.x*e,z:s.z*e,bed:s.bed*i,width:s.width*e*t.widthScale});return{main:t.main.map(n),eastCreek:t.eastCreek.map(n),westCreek:t.westCreek.map(n),gorges:t.gorges.map(s=>({x:s.x*e,z:s.z*e,spanZ:s.spanZ*e,strength:s.strength*i}))}}function Rn(r,t,e="bystritsa",i=0,n=r){let s=Rs[e]||Rs.bystritsa,{bedrock:o,soil:a,concrete:c,h:l,hu:h,hv:u,wetness:d}=t,f=U.size*.5,g=U.size/r,y=U.horizScale,p=U.elevScale,m=s.seedOffset,_=Math.pow(p,.72),M=Math.pow(p,.35),v=J(i,0,r),w=J(n,0,r);for(let S=v;S<w;S++){let T=-f+(S+.5)*g,x=T/y,E=J((384-x)/768,0,1);for(let C=0;C<r;C++){let R=-f+(C+.5)*g,L=R/y,D=S*r+C,I=Math.abs(L)/384,F=Math.pow(J((I-.52)/.48,0,1),1.78)*42,z=ci(-140,-380,x)*(20+25*Ec(L*.009+3.1+m,x*.009-1.7,4)),G=wc(L*.0052+11.3+m,x*.0052+4.7,5)*8.6,K=wc(L*.021-5.2+m,x*.021+8.9,3)*1.9,N=y>1.5?Ec(R*.0011+m,T*.0011-4.2,3)*6.5*ci(.35,.92,I):0,$=12+E*(e==="rapids"?28:e==="delta"?18.5:23.8)+F+z+G+K+N,Q=!1;for(let qt=0;qt<s.gorges.length;qt++){let $t=s.gorges[qt],Ot=(x-$t.z)/$t.spanZ;if(Math.abs(Ot)<1.35){let Qt=Math.exp(-Ot*Ot*1.9),B=Math.abs(L-$t.x),De=ci(12,48,B)*(1-ci(78,152,B));$+=Qt*De*$t.strength,Math.abs(x-$t.z)<$t.spanZ*.9&&B<58&&(Q=!0)}}let ot=1-ci(18,52,Math.abs(L- -16)),st=ci(-118,-84,x)*(1-ci(82,118,x)),It=ot*st;if(It>.001){let qt=ne(23.8,16.4,J((x- -98)/205,0,1));$=ne($,qt,It*.8)}let ut=$*p,Pt=0;for(let qt=0;qt<Ye.length;qt++){let $t=Ye[qt],Ot=Math.hypot(R-$t.x,T-$t.z),Qt=1-ci($t.plateauRadius*.68,$t.plateauRadius*1.26,Ot);Qt>.001&&(ut=ne(ut,$t.baseElevation,Qt*.95),Pt=Math.max(Pt,Qt))}let q=Math.hypot(L-168,x-98);if(q<40){let qt=1-ci(14,40,q);ut=ne(ut,14.2*p,qt*.9)}let Y=Da(L,x,s.main),ct=Da(L,x,s.eastCreek),vt=Da(L,x,s.westCreek),lt=0,kt=0,le=0,Xt=0,ht=Y.width*.5*s.widthScale;if(Y.dist<ht*3.6){let qt=1-ci(ht*.82,ht*3.4,Y.dist),$t=J(Y.dist/ht,0,1),Ot=(Y.bed+Math.pow($t,2.2)*2.6)*p;if(ut=ne(ut,Math.min(ut,Ot+(1-qt)*5.2*p),qt),Y.dist<ht*1.12){ut=Math.min(ut,(Y.bed+Math.pow(Y.dist/(ht*1.12),2.4)*2.15)*p);let Qt=Y.bed*p+2.15*_;if(Qt>ut+.05){lt=Qt-ut;let B=2.25*M;kt=Y.tx*B,le=Y.tz*B,Xt=1}}}let at=ct.width*.5*s.widthScale;if(ct.dist<at*3.2&&x<-228){let qt=1-ci(at*.8,at*3,ct.dist),$t=(ct.bed+Math.pow(J(ct.dist/at,0,1),2.1)*1.9)*p;if(ut=ne(ut,Math.min(ut,$t+(1-qt)*4.2*p),qt),ct.dist<at*1.1){ut=Math.min(ut,(ct.bed+Math.pow(ct.dist/(at*1.1),2.2)*1.6)*p);let Ot=ct.bed*p+1.38*_;if(Ot>ut+.05&&Ot-ut>lt){lt=Ot-ut;let Qt=2.35*M;kt=ct.tx*Qt,le=ct.tz*Qt,Xt=1}}}let Lt=vt.width*.5*s.widthScale;if(vt.dist<Lt*3.1&&L<-32&&x>42&&x<228){let qt=1-ci(Lt*.8,Lt*2.9,vt.dist),$t=(vt.bed+Math.pow(J(vt.dist/Lt,0,1),2.1)*1.8)*p;if(ut=ne(ut,Math.min(ut,$t+(1-qt)*3.8*p),qt),vt.dist<Lt*1.1){ut=Math.min(ut,(vt.bed+Math.pow(vt.dist/(Lt*1.1),2.2)*1.5)*p);let Ot=vt.bed*p+1.2*_;if(Ot>ut+.05&&Ot-ut>lt){lt=Ot-ut;let Qt=2.1*M;kt=vt.tx*Qt,le=vt.tz*Qt,Xt=1}}}let Kt=(2.7+s.soilBonus+It*4+Pt*1.6-ci(34*p,58*p,ut)*2.2)*Math.pow(p,.65);Q&&(Kt=Math.min(Kt,.45*p)),Xt&&(Kt=J(Kt*.36,.35,1.8*p)),Kt=J(Kt,.15,14*p),o[D]=Math.max(.5,ut-Kt),a[D]=Kt,c[D]=0,l[D]=lt,h[D]=lt*kt,u[D]=lt*le,d[D]=lt>.02?1:0}}}var Re=U.gravity,Bd=U.waterDensity,Na=.014,zd=Na*Na*Na*Na,Bt=8,Ua=class{constructor(t=208,e="bystritsa",i=!1){this.grid=t,this.presetId=e,this.count=t*t,this.dx=U.size/t,this.cellArea=this.dx*this.dx,this.bedrock=new Float32Array(this.count),this.soil=new Float32Array(this.count),this.soilSaturation=new Float32Array(this.count),this.concrete=new Float32Array(this.count),this.targetConcrete=new Float32Array(this.count),this.formworkWall=new Float32Array(this.count),this.buildProgress=new Float32Array(this.count),this.gateWall=new Float32Array(this.count),this.zb=new Float32Array(this.count),this.linedMask=new Uint8Array(this.count),this.earthDamMask=new Uint8Array(this.count),this.foundationMask=new Uint8Array(this.count),this.buttressYaw=new Float32Array(this.count),this.h=new Float32Array(this.count),this.hu=new Float32Array(this.count),this.hv=new Float32Array(this.count),this.dH=new Float32Array(this.count),this.dHU=new Float32Array(this.count),this.dHV=new Float32Array(this.count),this.u=new Float32Array(this.count),this.v=new Float32Array(this.count),this.vort=new Float32Array(this.count),this.sediment=new Float32Array(this.count),this.foam=new Float32Array(this.count),this.sedNext=new Float32Array(this.count),this.foamNext=new Float32Array(this.count),this.wetness=new Float32Array(this.count),this.tilesN=Math.ceil(t/Bt),this.totalTiles=this.tilesN*this.tilesN,this.tileWet=new Uint8Array(this.totalTiles),this.activeTiles=new Int32Array(this.totalTiles),this.activeTileCount=0,this.wetCellCount=0,this.terrainDirty=!0,this.dirtyMinX=0,this.dirtyMinZ=0,this.dirtyMaxX=t-1,this.dirtyMaxZ=t-1,this.engineeredDirty=!0,this.activeBuildCells=[],this.activeBuildSet=new Uint8Array(this.count),this.activeBuildSites=[],this.turbines=[],this.spillways=[],this.substations=[],this.navLocks=[],this.fishFarms=[],this.nextStructId=1,this.overflowEdges=[],this.soilStockpileM3=0,this.rockStockpileM3=0,this.totalExcavatedM3=0,this.excavatedNormM3=0,this.damCellCount=0,this.reinforcedCellCount=0,this.maxDamStress=0,this.totalSeepageQ=0,this.pendingPourVolumeM3=0,this.inflowMult=1,this.rainRate=0,this.currentEvapRateMps=0,this.currentSnowmeltBonusQ=0,this.currentWithdrawQ=0,this.isOffPeakNight=!1,this.lastRiverInflowQ=0,this.lastRainAddedQ=0,this.lastInfiltrationQ=0,this.lastMouthOutflowQ=0,this.lastCrestOverflowQ=0,this.lastPumpedUpQ=0,this.lastPumpedConsumeMW=0,this.meanReservoirTurbidity=.05,this.lastSubsteps=0,this.lastStepMs=0,this.totalWaterVolumeM3=0,this.simTime=0,this._erosionTick=0,this.jetEmitters=[],this._syncScaleGeometry(),i||this.resetValley(e)}_syncScaleGeometry(){this.dx=U.size/this.grid,this.cellArea=this.dx*this.dx;let t=768/this.grid*(768/this.grid);this.volPriceNorm=t/(this.cellArea*U.elevScale),this.maxFlowSpeed=26*Math.sqrt(U.elevScale)}_clearArrays(){this._syncScaleGeometry(),this.bedrock.fill(0),this.soil.fill(0),this.soilSaturation.fill(.25),this.concrete.fill(0),this.targetConcrete.fill(0),this.formworkWall.fill(0),this.buildProgress.fill(1),this.gateWall.fill(0),this.linedMask.fill(0),this.earthDamMask.fill(0),this.foundationMask.fill(0),this.buttressYaw.fill(0),this.h.fill(0),this.hu.fill(0),this.hv.fill(0),this.vort.fill(0),this.sediment.fill(0),this.foam.fill(0),this.wetness.fill(0),this.activeBuildCells=[],this.activeBuildSet.fill(0),this.activeBuildSites=[],this.turbines=[],this.spillways=[],this.substations=[],this.navLocks=[],this.fishFarms=[],this.overflowEdges=[],this.soilStockpileM3=0,this.rockStockpileM3=0,this.totalExcavatedM3=0,this.excavatedNormM3=0,this.damCellCount=0,this.reinforcedCellCount=0,this.maxDamStress=0,this.totalSeepageQ=0,this.pendingPourVolumeM3=0,this.lastCrestOverflowQ=0,this.lastPumpedUpQ=0,this.lastPumpedConsumeMW=0,this.engineeredDirty=!0}resetValley(t=this.presetId){this.presetId=t,this._clearArrays(),Rn(this.grid,this,t,0,this.grid),this.finalizeValleySetup(18)}finalizeValleySetup(t=18){for(let i=0;i<this.count;i++)this.soilSaturation[i]=this.h[i]>.02?1:.28;this.recomputeZbRange(0,0,this.grid-1,this.grid-1),this._rebuildVelocitiesAll(),this._rebuildActiveTiles();let e=Math.min(.055,.35*this.dx/(14*Math.sqrt(U.elevScale)));for(let i=0;i<t;i++)this._substep(e);this._detectCrestOverflows(),this.engineeredDirty=!0}worldToGrid(t,e){let i=U.size*.5,n=Math.floor((t+i)/this.dx),s=Math.floor((e+i)/this.dx);return{gx:J(n,0,this.grid-1),gz:J(s,0,this.grid-1)}}gridToWorld(t,e){let i=U.size*.5;return{wx:-i+(t+.5)*this.dx,wz:-i+(e+.5)*this.dx}}recomputeZbRange(t,e,i,n){let s=this.grid,o=J(t,0,s-1),a=J(e,0,s-1),c=J(i,0,s-1),l=J(n,0,s-1);for(let h=a;h<=l;h++){let u=h*s;for(let d=o;d<=c;d++){let f=u+d,g=Math.max(this.concrete[f],this.formworkWall[f]);this.zb[f]=this.bedrock[f]+this.soil[f]+g+this.gateWall[f]}}this.markTerrainDirty(o,a,c,l)}markTerrainDirty(t,e,i,n){this.terrainDirty?(t<this.dirtyMinX&&(this.dirtyMinX=t),e<this.dirtyMinZ&&(this.dirtyMinZ=e),i>this.dirtyMaxX&&(this.dirtyMaxX=i),n>this.dirtyMaxZ&&(this.dirtyMaxZ=n)):(this.terrainDirty=!0,this.dirtyMinX=t,this.dirtyMinZ=e,this.dirtyMaxX=i,this.dirtyMaxZ=n)}consumeTerrainDirty(){if(!this.terrainDirty)return null;let t={x0:J(this.dirtyMinX-1,0,this.grid-1),z0:J(this.dirtyMinZ-1,0,this.grid-1),x1:J(this.dirtyMaxX+1,0,this.grid-1),z1:J(this.dirtyMaxZ+1,0,this.grid-1)};return this.terrainDirty=!1,t}sampleAtWorld(t,e){let{gx:i,gz:n}=this.worldToGrid(t,e),s=n*this.grid+i,o=this.h[s],a=this.zb[s],c=this.u[s],l=this.v[s],h=Math.hypot(c,l),u=o>.03?h/Math.sqrt(Re*o):0;return{gx:i,gz:n,bed:a,bedrock:this.bedrock[s],soil:this.soil[s],saturation:this.soilSaturation[s],concrete:this.concrete[s],targetConcrete:this.targetConcrete[s],buildProgress:this.buildProgress[s],lined:this.linedMask[s]===1,earthDam:this.earthDamMask[s]===1,reinforced:this.foundationMask[s]===1,depth:o,surface:a+o,u:c,v:l,speed:h,froude:u,vorticity:this.vort[s],sediment:this.sediment[s],foam:this.foam[s]}}excavateCanal(t,e,i,n,s,o,a=!1){let{gx:c,gz:l}=this.worldToGrid(t,e),h=Math.max(1,Math.ceil(i/this.dx)),u=n*U.elevScale,d=0,f=0,g=0,y=J(c-h,1,this.grid-2),p=J(c+h,1,this.grid-2),m=J(l-h,1,this.grid-2),_=J(l+h,1,this.grid-2);for(let M=m;M<=_;M++)for(let v=y;v<=p;v++){let w=Math.hypot(v-c,M-l)*this.dx;if(w>i)continue;let S=M*this.grid+v;if(this.concrete[S]>.25||this.targetConcrete[S]>.25||this.gateWall[S]>.1)continue;let T=J(w/(i||1),0,1),x=T<.56?1:Math.cos((T-.56)/.44*Math.PI*.5);if(x<=.02)continue;let E=this.bedrock[S]+this.soil[S],C=u*x;if(Number.isFinite(s)){let F=T>.56?(T-.56)*4.2*U.elevScale:0,z=s+F;if(E<=z)continue;C=Math.min(u*1.85,E-z)}if(C<=.01)continue;let R=Math.min(this.soil[S],C),L=Math.max(0,C-R),D=Math.min(Math.max(0,this.bedrock[S]-1.2),L*.62),I=(R*3.4+D*14.5)*this.cellArea*this.volPriceNorm*.21;!a&&d+I>o||(this.soil[S]-=R,this.bedrock[S]-=D,this.earthDamMask[S]=0,(this.h[S]>.05||R>.05)&&(this.sediment[S]=Math.min(1.4,this.sediment[S]+.5)),d+=I,f+=R*this.cellArea,g+=D*this.cellArea)}if(f>0||g>0){this.soilStockpileM3+=f,this.rockStockpileM3+=g*1.15;let M=f+g;this.totalExcavatedM3+=M,this.excavatedNormM3+=M*this.volPriceNorm,this.recomputeZbRange(y,m,p,_),this._activateArea(y,m,p,_)}return{cost:d,excavatedM3:f+g,rockM3:g}}lineCanalConcrete(t,e,i,n,s=!1){let{gx:o,gz:a}=this.worldToGrid(t,e),c=Math.max(1,Math.ceil(i/this.dx)),l=0,h=0,u=3.5/this.volPriceNorm,d=J(o-c,1,this.grid-2),f=J(o+c,1,this.grid-2),g=J(a-c,1,this.grid-2),y=J(a+c,1,this.grid-2);for(let p=g;p<=y;p++)for(let m=d;m<=f;m++){if(Math.hypot(m-o,p-a)*this.dx>i)continue;let _=p*this.grid+m;if(this.linedMask[_]===1)continue;let M=Math.min(this.rockStockpileM3,u),v=M>u*.3?58*(1-_e.rockAggregateDiscount):58;if(!s&&l+v>n)break;this.rockStockpileM3=Math.max(0,this.rockStockpileM3-M),this.linedMask[_]=1,this.soilSaturation[_]=1,this.earthDamMask[_]=0,l+=v,h++}return h>0&&(this.markTerrainDirty(d,g,f,y),this.engineeredDirty=!0),{cost:l,count:h}}buildEarthDam(t,e,i,n,s,o,a=!1){let{gx:c,gz:l}=this.worldToGrid(t,e),h=Math.max(1,Math.ceil(i/this.dx)),u=n*U.elevScale,d=0,f=0,g=J(c-h,1,this.grid-2),y=J(c+h,1,this.grid-2),p=J(l-h,1,this.grid-2),m=J(l+h,1,this.grid-2);for(let _=p;_<=m;_++)for(let M=g;M<=y;M++){let v=Math.hypot(M-c,_-l)*this.dx;if(v>i)continue;let w=_*this.grid+M;if(this.concrete[w]>.2||this.targetConcrete[w]>.2)continue;let S=Math.cos(v/(i||1)*Math.PI*.46),T=u*S;if(Number.isFinite(s)){let L=this.zb[w],D=s-v/(i||1)*1.4*U.elevScale;if(L>=D)continue;T=Math.min(u*1.75,D-L)}if(T<=.02)continue;let x=T*this.cellArea,E=Math.min(this.soilStockpileM3,x),C=x-E,R=(E*1.4+C*5.2)*this.volPriceNorm*.22;!a&&d+R>o||(this.soilStockpileM3=Math.max(0,this.soilStockpileM3-E),this.soil[w]+=T,this.linedMask[w]=0,this.earthDamMask[w]=1,d+=R,f+=x)}return f>0&&(this.recomputeZbRange(g,p,y,m),this._activateArea(g,p,y,m)),{cost:d,addedM3:f}}buildConcreteDam(t,e,i,n,s,o=!1,a=!1){let{gx:c,gz:l}=this.worldToGrid(t,e),h=Math.max(1,Math.ceil(i*.85/this.dx)),u=0,d=0,f=o||a,g=5.6*U.elevScale,y=J(c-h,1,this.grid-2),p=J(c+h,1,this.grid-2),m=J(l-h,1,this.grid-2),_=J(l+h,1,this.grid-2);for(let M=m;M<=_;M++)for(let v=y;v<=p;v++){if(Math.hypot(v-c,M-l)*this.dx>i*.85)continue;let S=M*this.grid+v;if(this.gateWall[S]>.05)continue;let T=this.bedrock[S]+this.soil[S],x=Math.max(this.concrete[S],this.targetConcrete[S]),E=T+x,C=3.2*U.elevScale;if(Number.isFinite(n)){if(E>=n)continue;C=Math.min(g,n-E)}if(C<=.03)continue;let R=C*this.cellArea,L=Math.min(this.rockStockpileM3,R*.55),D=R>0?L/(R*.55)*_e.rockAggregateDiscount:0,I=this.h[S]>2.2*U.elevScale?1.25:1,F=R*this.volPriceNorm*22*.155*(1-D)*I;if(!o&&u+F>s)continue;this.rockStockpileM3=Math.max(0,this.rockStockpileM3-L);let z=x>1.2,G=x+C;this.targetConcrete[S]=G,this.earthDamMask[S]=0,this.linedMask[S]=1,f?(this.concrete[S]=G,this.formworkWall[S]=0,this.buildProgress[S]=1):(this.formworkWall[S]=Math.max(this.formworkWall[S],this.concrete[S]+C*_e.cofferdamInstantRatio),this.buildProgress[S]=J(this.concrete[S]/Math.max(.5,G),.06,.92),this.activeBuildSet[S]||(this.activeBuildSet[S]=1,this.activeBuildCells.push(S))),!z&&G>1.2&&this.damCellCount++,u+=F,d+=R}if(d>0){if(!f&&(this.pendingPourVolumeM3+=d,this.activeBuildSites.length<6)){let M=this.gridToWorld(c,l),v=l*this.grid+c;this.activeBuildSites.push({wx:M.wx,wz:M.wz,wy:this.bedrock[v]+this.soil[v]+Math.max(this.concrete[v],this.formworkWall[v]),progress:this.buildProgress[v]})}this.recomputeZbRange(y,m,p,_),this._activateArea(y,m,p,_),this.engineeredDirty=!0}return{cost:u,addedM3:d}}reinforceFoundation(t,e,i,n,s=!1){let{gx:o,gz:a}=this.worldToGrid(t,e),c=Math.max(1,Math.ceil(i*.85/this.dx)),l=0,h=0,u=5/this.volPriceNorm,d=J(o-c,1,this.grid-2),f=J(o+c,1,this.grid-2),g=J(a-c,1,this.grid-2),y=J(a+c,1,this.grid-2),p=this.detectHydraulicDirection(o,a,null);for(let m=g;m<=y;m++)for(let _=d;_<=f;_++){if(Math.hypot(_-o,m-a)*this.dx>i*.85)continue;let M=m*this.grid+_;if(this.foundationMask[M]===1)continue;let v=Math.min(this.rockStockpileM3,u),w=v>u*.3?135*(1-_e.rockAggregateDiscount):135;if(!s&&l+w>n)break;this.rockStockpileM3=Math.max(0,this.rockStockpileM3-v);let S=this.soil[M]*.85;this.soil[M]-=S,this.bedrock[M]+=S,this.concrete[M]<.8&&this.targetConcrete[M]<.8&&(this.concrete[M]=.85,this.targetConcrete[M]=.85,this.buildProgress[M]=1),this.foundationMask[M]=1,this.buttressYaw[M]=p.yaw,this.earthDamMask[M]=0,this.linedMask[M]=1,this.reinforcedCellCount++,l+=w,h++}return h>0&&(this.recomputeZbRange(d,g,f,y),this.engineeredDirty=!0),{cost:l,count:h}}placeSubstation(t,e,i,n=!1){let s=_e.substationCost;if(!n&&i<s)return{ok:!1,reason:`\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0441\u0440\u0435\u0434\u0441\u0442\u0432 \u043D\u0430 \u041E\u0420\u0423 110 \u043A\u0412 (\u043D\u0443\u0436\u043D\u043E ${s.toLocaleString("ru-RU")} \u20BD)`};let o=this.sampleAtWorld(t,e);if(o.depth>.35*U.elevScale)return{ok:!1,reason:"\u041F\u043E\u0434\u0441\u0442\u0430\u043D\u0446\u0438\u044E \u041E\u0420\u0423 \u043D\u0443\u0436\u043D\u043E \u0441\u0442\u0440\u043E\u0438\u0442\u044C \u043D\u0430 \u0441\u0443\u0445\u043E\u043C \u0431\u0435\u0440\u0435\u0433\u0443 \u0432\u044B\u0448\u0435 \u0432\u043E\u0434\u044B!"};for(let f of this.substations)if(Math.hypot(f.wx-t,f.wz-e)<28*U.horizScale)return{ok:!1,reason:"\u0420\u044F\u0434\u043E\u043C \u0443\u0436\u0435 \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442 \u043F\u043E\u0434\u0441\u0442\u0430\u043D\u0446\u0438\u044F \u041E\u0420\u0423"};let{gx:a,gz:c}=this.worldToGrid(t,e),l=o.bed+.5,h=c*this.grid+a,u=this.bedrock[h]+this.soil[h];this.concrete[h]=Math.max(this.concrete[h],Math.max(.3,l-u)),this.targetConcrete[h]=Math.max(this.targetConcrete[h],this.concrete[h]),this.linedMask[h]=1,this.recomputeZbRange(a-1,c-1,a+1,c+1);let d={id:this.nextStructId++,kind:"substation",gx:a,gz:c,wx:t,wz:e,wy:l};return this.substations.push(d),this.engineeredDirty=!0,{ok:!0,cost:s,structure:d}}placeNavigationLock(t,e,i,n,s=!1){let o=_e.navLockCost;if(!s&&n<o)return{ok:!1,reason:`\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0441\u0440\u0435\u0434\u0441\u0442\u0432 \u043D\u0430 \u0441\u0443\u0434\u043E\u0445\u043E\u0434\u043D\u044B\u0439 \u0448\u043B\u044E\u0437 (\u043D\u0443\u0436\u043D\u043E ${o.toLocaleString("ru-RU")} \u20BD)`};let{gx:a,gz:c}=this.worldToGrid(t,e);if(a<4||a>this.grid-5||c<4||c>this.grid-5)return{ok:!1,reason:"\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u0431\u043B\u0438\u0437\u043A\u043E \u043A \u043A\u0440\u0430\u044E \u043A\u0430\u0440\u0442\u044B"};for(let d of this.navLocks)if(Math.hypot(d.gx-a,d.gz-c)<4)return{ok:!1,reason:"\u0420\u044F\u0434\u043E\u043C \u0443\u0436\u0435 \u043F\u043E\u0441\u0442\u0440\u043E\u0435\u043D \u0441\u0443\u0434\u043E\u0445\u043E\u0434\u043D\u044B\u0439 \u0448\u043B\u044E\u0437"};let l=this.detectHydraulicDirection(a,c,i),h=this.sampleAtWorld(t,e),u={id:this.nextStructId++,kind:"nav_lock",gx:a,gz:c,wx:t,wz:e,wy:Math.max(h.bed,h.surface),baseY:h.bedrock+h.soil,yaw:l.yaw,dirX:l.dx,dirZ:l.dz,cyclePhase:0,shipsPassed:0};return this.navLocks.push(u),this.engineeredDirty=!0,{ok:!0,cost:o,structure:u}}placeFishEcoFarm(t,e,i,n=!1){let s=_e.fishEcoCost;if(!n&&i<s)return{ok:!1,reason:`\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0441\u0440\u0435\u0434\u0441\u0442\u0432 \u043D\u0430 \u0440\u044B\u0431\u0445\u043E\u0437/\u043C\u0430\u0440\u0438\u043D\u0443 (\u043D\u0443\u0436\u043D\u043E ${s.toLocaleString("ru-RU")} \u20BD)`};let o=this.sampleAtWorld(t,e);if(o.depth<.35)return{ok:!1,reason:"\u0420\u044B\u0431\u0445\u043E\u0437 \u0438 \u044F\u0445\u0442-\u043C\u0430\u0440\u0438\u043D\u0443 \u043D\u0443\u0436\u043D\u043E \u0440\u0430\u0437\u043C\u0435\u0449\u0430\u0442\u044C \u043D\u0430 \u0432\u043E\u0434\u0435 (\u0432 \u0440\u0435\u043A\u0435 \u0438\u043B\u0438 \u0432\u043E\u0434\u043E\u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435)!"};for(let c of this.fishFarms)if(Math.hypot(c.wx-t,c.wz-e)<26*U.horizScale)return{ok:!1,reason:"\u0417\u0434\u0435\u0441\u044C \u0443\u0436\u0435 \u0441\u0442\u043E\u044F\u0442 \u0441\u0430\u0434\u043A\u0438 \u0440\u044B\u0431\u0445\u043E\u0437\u0430"};let a={id:this.nextStructId++,kind:"fish_farm",gx:o.gx,gz:o.gz,wx:t,wz:e,wy:o.surface};return this.fishFarms.push(a),this.engineeredDirty=!0,{ok:!0,cost:s,structure:a}}detectHydraulicDirection(t,e,i=null){if(typeof i=="number")return{dx:Math.cos(i),dz:Math.sin(i),yaw:i};let n=0,s=0,o=4;for(let h=-o;h<=o;h++)for(let u=-o;u<=o;u++){if(u===0&&h===0)continue;let d=J(t+u,0,this.grid-1),g=J(e+h,0,this.grid-1)*this.grid+d,y=this.bedrock[g]+this.soil[g]+this.h[g]*2.1,p=1/(u*u+h*h);n-=u*y*p,s-=h*y*p}let a=Math.hypot(n,s);if(a<.001)return{dx:0,dz:1,yaw:Math.PI*.5};let c=n/a,l=s/a;return{dx:c,dz:l,yaw:Math.atan2(l,c)}}placeSpillway(t,e,i,n,s=!1){if(!s&&n<4400)return{ok:!1,reason:"\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0441\u0440\u0435\u0434\u0441\u0442\u0432 (\u043D\u0443\u0436\u043D\u043E 4 400 \u20BD)"};let{gx:a,gz:c}=this.worldToGrid(t,e);if(a<4||a>this.grid-5||c<4||c>this.grid-5)return{ok:!1,reason:"\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u0431\u043B\u0438\u0437\u043A\u043E \u043A \u043A\u0440\u0430\u044E \u043A\u0430\u0440\u0442\u044B"};for(let S of this.turbines)if(Math.hypot(S.gx-a,S.gz-c)<3)return{ok:!1,reason:"\u041C\u0435\u0441\u0442\u043E \u0437\u0430\u043D\u044F\u0442\u043E \u0433\u0438\u0434\u0440\u043E\u0430\u0433\u0440\u0435\u0433\u0430\u0442\u043E\u043C"};for(let S of this.spillways)if(Math.hypot(S.gx-a,S.gz-c)<2.8)return{ok:!1,reason:"\u0420\u044F\u0434\u043E\u043C \u0443\u0436\u0435 \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D \u0432\u043E\u0434\u043E\u0441\u0431\u0440\u043E\u0441"};let l=this.detectHydraulicDirection(a,c,i),h=0,u=1/0,d=[];for(let S=-1;S<=1;S++)for(let T=-1;T<=1;T++){let x=a+T,C=(c+S)*this.grid+x;d.push(C),u=Math.min(u,this.bedrock[C]+this.soil[C])}for(let S=-2;S<=2;S++)for(let T=-2;T<=2;T++){let x=J(c+S,0,this.grid-1)*this.grid+J(a+T,0,this.grid-1),E=Math.max(this.concrete[x],this.targetConcrete[x]);E>1&&(h=Math.max(h,this.bedrock[x]+this.soil[x]+E))}let f=u+8.5*U.elevScale,g=h>u+3?h:f,y=u+Math.max(1.2*U.elevScale,(g-u)*.36),p=Math.max(3.5*U.elevScale,g-y);for(let S of d){let T=this.bedrock[S]+this.soil[S];this.concrete[S]=Math.max(.5,y-T),this.targetConcrete[S]=this.concrete[S],this.formworkWall[S]=0,this.buildProgress[S]=1,this.linedMask[S]=1,this.earthDamMask[S]=0}let m=this.gridToWorld(a,c),_=J(Math.round(a+l.dx*3),1,this.grid-2),M=J(Math.round(c+l.dz*3),1,this.grid-2),v=this.bedrock[M*this.grid+_]+this.soil[M*this.grid+_],w={id:this.nextStructId++,kind:"spillway",gx:a,gz:c,wx:m.wx,wz:m.wz,dirX:l.dx,dirZ:l.dz,yaw:l.yaw,sillElev:y,crestElev:g,downBedY:v,wallHeight:p,openRatio:.35,autoRegulate:!0,targetHeadElev:g-1.2*U.elevScale,currentFlowQ:0,jetSpeed:0,cells:d};return this.spillways.push(w),this._syncSpillwayGateCells(w),this._activateArea(a-3,c-3,a+3,c+3),this.engineeredDirty=!0,{ok:!0,cost:4400,structure:w}}_syncSpillwayGateCells(t){let e=(1-J(t.openRatio,0,1))*t.wallHeight;for(let i=0;i<t.cells.length;i++){let n=t.cells[i];this.gateWall[n]=e,this.zb[n]=this.bedrock[n]+this.soil[n]+Math.max(this.concrete[n],this.formworkWall[n])+e}this.markTerrainDirty(t.gx-2,t.gz-2,t.gx+2,t.gz+2)}placeTurbine(t,e,i,n,s,o=!1){let a=_r[t];if(!a)return{ok:!1,reason:"\u041D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u044B\u0439 \u0442\u0438\u043F \u0442\u0443\u0440\u0431\u0438\u043D\u044B"};if(!o&&s<a.cost)return{ok:!1,reason:`\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0441\u0440\u0435\u0434\u0441\u0442\u0432 (\u043D\u0443\u0436\u043D\u043E ${a.cost.toLocaleString("ru-RU")} \u20BD)`};let{gx:c,gz:l}=this.worldToGrid(e,i);if(c<5||c>this.grid-6||l<5||l>this.grid-6)return{ok:!1,reason:"\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u0431\u043B\u0438\u0437\u043A\u043E \u043A \u0433\u0440\u0430\u043D\u0438\u0446\u0435 \u0431\u0430\u0441\u0441\u0435\u0439\u043D\u0430"};for(let z of this.turbines)if(Math.hypot(z.gx-c,z.gz-l)<3)return{ok:!1,reason:"\u0417\u0434\u0435\u0441\u044C \u0443\u0436\u0435 \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D \u0433\u0438\u0434\u0440\u043E\u0430\u0433\u0440\u0435\u0433\u0430\u0442"};for(let z of this.spillways)if(Math.hypot(z.gx-c,z.gz-l)<2.8)return{ok:!1,reason:"\u041C\u0435\u0441\u0442\u043E \u0437\u0430\u043D\u044F\u0442\u043E \u0432\u043E\u0434\u043E\u0441\u0431\u0440\u043E\u0441\u043E\u043C"};let h=this.detectHydraulicDirection(c,l,n),u=J(Math.round(15*U.horizScale/this.dx),3,5),d=J(Math.round(c-h.dx*u),2,this.grid-3),f=J(Math.round(l-h.dz*u),2,this.grid-3),g=J(Math.round(c+h.dx*u),2,this.grid-3),y=J(Math.round(l+h.dz*u),2,this.grid-3),p=l*this.grid+c,m=this.bedrock[p]+this.soil[p],_=0;for(let z=-2;z<=2;z++)for(let G=-2;G<=2;G++){let K=J(l+z,0,this.grid-1)*this.grid+J(c+G,0,this.grid-1),N=Math.max(this.concrete[K],this.targetConcrete[K]);N>1.2&&(_=Math.max(_,this.bedrock[K]+this.soil[K]+N))}let M=_>m+1.5?_:m+5.8*U.elevScale,v=[],w=-h.dz,S=h.dx;for(let z=-1;z<=1;z++){let G=J(Math.round(c+w*z),1,this.grid-2),N=J(Math.round(l+S*z),1,this.grid-2)*this.grid+G,$=this.bedrock[N]+this.soil[N];if($>M+2)continue;let Q=this.concrete[N],ot=Math.max(Q,Math.max(.6,M-$));this.concrete[N]=ot,this.targetConcrete[N]=Math.max(this.targetConcrete[N],ot),this.formworkWall[N]=0,this.buildProgress[N]=1,this.linedMask[N]=1,this.earthDamMask[N]=0,v.push({i:N,prevConcrete:Q})}for(let z=-1;z<=1;z++)for(let G=-1;G<=1;G++){let K=(f+z)*this.grid+(d+G),N=(y+z)*this.grid+(g+G);(this.concrete[K]>0||this.targetConcrete[K]>0)&&(v.push({i:K,prevConcrete:this.concrete[K]}),this.concrete[K]=0,this.targetConcrete[K]=0,this.formworkWall[K]=0),(this.concrete[N]>0||this.targetConcrete[N]>0)&&(v.push({i:N,prevConcrete:this.concrete[N]}),this.concrete[N]=0,this.targetConcrete[N]=0,this.formworkWall[N]=0),this.linedMask[K]=1,this.linedMask[N]=1}let T=this.gridToWorld(c,l),x=this.gridToWorld(d,f),E=this.gridToWorld(g,y),C=this.bedrock[f*this.grid+d]+this.soil[f*this.grid+d],R=this.bedrock[y*this.grid+g]+this.soil[y*this.grid+g],L=T.wx+h.dx*(this.dx*(u*.58)),D=T.wz+h.dz*(this.dx*(u*.58)),I=Math.min(m,R),F={id:this.nextStructId++,kind:"turbine",type:t,spec:a,gx:c,gz:l,wx:T.wx,wz:T.wz,hallWx:L,hallWz:D,hallBaseY:I,crestY:M,baseY:m,dirX:h.dx,dirZ:h.dz,yaw:h.yaw,intakeGx:d,intakeGz:f,intakeWx:x.wx,intakeWz:x.wz,intakeBedY:C,outfallGx:g,outfallGz:y,outfallWx:E.wx,outfallWz:E.wz,outfallBedY:R,bodyCells:v,throttle:1,autoDispatch:!1,pumpedStorage:t==="pelton",isPumpingNow:!1,pumpConsumeMW:0,grossHead:0,netHead:0,flowQ:0,efficiency:0,powerMW:0,cavitation:0,trashLoad:0,condition:1,rotorPhase:0};return this.turbines.push(F),this.recomputeZbRange(Math.min(c,d,g)-2,Math.min(l,f,y)-2,Math.max(c,d,g)+2,Math.max(l,f,y)+2),this._activateArea(Math.min(c,d,g)-2,Math.min(l,f,y)-2,Math.max(c,d,g)+2,Math.max(l,f,y)+2),this.engineeredDirty=!0,{ok:!0,cost:a.cost,structure:F}}demolishAt(t,e){let{gx:i,gz:n}=this.worldToGrid(t,e),s=this.turbines.findIndex(u=>Math.hypot(u.gx-i,u.gz-n)<=2.6||Math.hypot(u.hallWx-t,u.hallWz-e)<=2.2*this.dx);if(s>=0){let u=this.turbines[s];for(let d of u.bodyCells)this.concrete[d.i]=d.prevConcrete,this.targetConcrete[d.i]=d.prevConcrete,this.formworkWall[d.i]=0;return this.turbines.splice(s,1),this.recomputeZbRange(u.gx-3,u.gz-3,u.gx+3,u.gz+3),this.engineeredDirty=!0,{removed:"turbine",refund:Math.round(u.spec.cost*.45)}}let o=this.spillways.findIndex(u=>Math.hypot(u.gx-i,u.gz-n)<=2.6);if(o>=0){let u=this.spillways[o];for(let d of u.cells)this.gateWall[d]=0,this.concrete[d]=0,this.targetConcrete[d]=0,this.formworkWall[d]=0;return this.spillways.splice(o,1),this.recomputeZbRange(u.gx-2,u.gz-2,u.gx+2,u.gz+2),this.engineeredDirty=!0,{removed:"spillway",refund:1900}}let a=this.navLocks.findIndex(u=>Math.hypot(u.gx-i,u.gz-n)<=2.8);if(a>=0)return this.navLocks.splice(a,1),this.engineeredDirty=!0,{removed:"nav_lock",refund:Math.round(_e.navLockCost*.45)};let c=this.fishFarms.findIndex(u=>Math.hypot(u.gx-i,u.gz-n)<=2.8);if(c>=0)return this.fishFarms.splice(c,1),this.engineeredDirty=!0,{removed:"fish_farm",refund:Math.round(_e.fishEcoCost*.45)};let l=this.substations.findIndex(u=>Math.hypot(u.gx-i,u.gz-n)<=2.8);if(l>=0)return this.substations.splice(l,1),this.engineeredDirty=!0,{removed:"substation",refund:Math.round(_e.substationCost*.45)};let h=0;for(let u=-1;u<=1;u++)for(let d=-1;d<=1;d++){let f=J(i+d,1,this.grid-2),y=J(n+u,1,this.grid-2)*this.grid+f;(this.concrete[y]>0||this.targetConcrete[y]>0||this.foundationMask[y])&&(h+=Math.max(this.concrete[y],this.targetConcrete[y])+1,this.concrete[y]=Math.max(0,this.concrete[y]-5*U.elevScale),this.targetConcrete[y]=this.concrete[y],this.formworkWall[y]=0,this.buildProgress[y]=1,this.concrete[y]<=.1&&this.foundationMask[y]&&(this.foundationMask[y]=0,this.reinforcedCellCount=Math.max(0,this.reinforcedCellCount-1))),this.linedMask[y]=0}return h>0?(this.recomputeZbRange(i-2,n-2,i+2,n+2),this.engineeredDirty=!0,{removed:"concrete",refund:0}):{removed:null,refund:0}}findStructureNear(t,e,i=null){let n=i!==null?i:Math.max(16,this.dx*3.2),s=null,o=n;for(let a of this.turbines){let c=Math.min(Math.hypot(a.wx-t,a.wz-e),Math.hypot(a.hallWx-t,a.hallWz-e));c<o&&(o=c,s=a)}for(let a of this.spillways){let c=Math.hypot(a.wx-t,a.wz-e);c<o&&(o=c,s=a)}return s}step(t,e=8){let i=typeof performance<"u"?performance.now():Date.now();this.jetEmitters.length=0;let n=J(t,.001,.16);this.activeBuildCells.length>0&&this._stepConstructionQueue(n),this._rebuildActiveTiles();let s=6.5*Math.sqrt(U.elevScale),o=this.grid;for(let d=0;d<this.activeTileCount;d++){let f=this.activeTiles[d],g=f%this.tilesN*Bt,y=Math.floor(f/this.tilesN)*Bt,p=Math.min(o,g+Bt),m=Math.min(o,y+Bt);for(let _=y;_<m;_+=2){let M=_*o;for(let v=g;v<p;v+=2){let w=M+v,S=this.h[w];if(S>.02){let T=Math.abs(this.u[w])+Math.abs(this.v[w])+Math.sqrt(Re*S);T>s&&(s=T)}}}}let a=.43*this.dx/s,c=J(Math.ceil(n/a),1,e),l=Math.min(n/c,a);this._accumMouthVol=0,this._accumRainVol=0,this._accumInflowVol=0,this._accumPumpVol=0,this._accumPumpMW=0;for(let d=0;d<c;d++)this._substep(l);let h=Math.max(1e-4,l*c);this.lastMouthOutflowQ=this._accumMouthVol/h,this.lastRainAddedQ=this._accumRainVol/h,this.lastRiverInflowQ=this._accumInflowVol/h,this.lastPumpedUpQ=this._accumPumpVol/h,this.lastPumpedConsumeMW=this._accumPumpMW/c,this._stepSecondaryTransportAndErosion(h),this._erosionTick%2===0&&this._detectCrestOverflows(),this.lastSubsteps=c;let u=typeof performance<"u"?performance.now():Date.now();this.lastStepMs=u-i}_detectCrestOverflows(){let t=this.grid,e=[],i=1.65*U.elevScale,n=0;for(let s=0;s<this.activeTileCount;s++){let o=this.activeTiles[s],a=Math.max(2,o%this.tilesN*Bt),c=Math.max(2,Math.floor(o/this.tilesN)*Bt),l=Math.min(t-2,o%this.tilesN*Bt+Bt),h=Math.min(t-2,Math.floor(o/this.tilesN)*Bt+Bt);for(let u=c;u<h;u++){let d=u*t;for(let f=a;f<l;f++){let g=d+f,y=this.h[g];if(y<.08||!(this.concrete[g]>1.2||this.formworkWall[g]>1.2||this.earthDamMask[g]===1)&&y<.35)continue;let m=this.zb[g],_=m+y,M=0,v=0,w=0,S=m,T=(x,E,C)=>{let R=this.zb[x]+this.h[x],L=m-this.zb[x],D=_-R;L>i&&D>i*.75&&L>M&&(M=L,v=E,w=C,S=R)};if(T(g+t,0,1),T(g-t,0,-1),T(g+1,1,0),T(g-1,-1,0),M>i){let x=.385*this.dx*Math.sqrt(2*Re)*Math.pow(y,1.5);n+=x;let E=(u+w)*t+(f+v);if(this.foam[E]=Math.min(1,this.foam[E]+.65),e.length<280){let C=this.gridToWorld(f,u);e.push({wx:C.wx+v*this.dx*.42,wz:C.wz+w*this.dx*.42,crestY:_-.1,toeY:S,dropH:Math.max(1.8,_-S),dirX:v,dirZ:w,yaw:Math.atan2(w,v),width:this.dx*1.12,headH:y}),e.length%3===0&&this.jetEmitters.push({wx:C.wx+v*this.dx*.6,wy:m+y*.3,wz:C.wz+w*this.dx*.6,vx:v*(2.6+Math.sqrt(Re*y)*.9),vy:.4,vz:w*(2.6+Math.sqrt(Re*y)*.9),intensity:J(y/1.5,.25,1.4),kind:"spillway"})}}}}}this.overflowEdges=e,this.lastCrestOverflowQ=n}_stepConstructionQueue(t){let e=this.grid,i=this.activeBuildCells.length;if(i===0){this.pendingPourVolumeM3=0,this.activeBuildSites.length=0;return}let n=_e.pourRateM3PerSec/this.volPriceNorm,s=Math.max(.95*U.elevScale*t,n*t/(Math.min(i,28)*this.cellArea)),o=e,a=e,c=-1,l=-1,h=0,u=[],d=[];for(let f=0;f<i;f++){let g=this.activeBuildCells[f],y=this.targetConcrete[g],p=this.concrete[g];if(y<=p+.01){this.concrete[g]=y,this.formworkWall[g]=0,this.buildProgress[g]=1,this.activeBuildSet[g]=0;continue}let m=g%e,_=g/e|0,v=(this.h[g]>.6?Math.hypot(this.u[g],this.v[g]):0)>3.5*Math.sqrt(U.elevScale)?.45:1;p=Math.min(y,p+s*v),this.concrete[g]=p;let w=J(p/Math.max(.4,y),.05,1);if(this.buildProgress[g]=w,p>=y-.015)this.concrete[g]=y,this.formworkWall[g]=0,this.buildProgress[g]=1,this.activeBuildSet[g]=0;else if(this.formworkWall[g]=Math.max(p,this.formworkWall[g]),u.push(g),h+=(y-p)*this.cellArea,d.length<6&&f%Math.max(1,Math.floor(i/4))===0){let T=this.gridToWorld(m,_);d.push({wx:T.wx,wz:T.wz,wy:this.bedrock[g]+this.soil[g]+Math.max(p,this.formworkWall[g]),progress:w})}let S=Math.max(this.concrete[g],this.formworkWall[g]);this.zb[g]=this.bedrock[g]+this.soil[g]+S+this.gateWall[g],m<o&&(o=m),_<a&&(a=_),m>c&&(c=m),_>l&&(l=_)}this.activeBuildCells=u,this.activeBuildSites=d,this.pendingPourVolumeM3=h,this.engineeredDirty=!0,c>=o&&this.markTerrainDirty(o,a,c,l)}_activateArea(t,e,i,n){let s=J(Math.floor(t/Bt)-1,0,this.tilesN-1),o=J(Math.floor(e/Bt)-1,0,this.tilesN-1),a=J(Math.floor(i/Bt)+1,0,this.tilesN-1),c=J(Math.floor(n/Bt)+1,0,this.tilesN-1);for(let l=o;l<=c;l++)for(let h=s;h<=a;h++)this.tileWet[l*this.tilesN+h]=1}_rebuildActiveTiles(){let t=this.grid,e=this.tilesN;this.tileWet.fill(0);let i=0,n=0,s=0;for(let a=0;a<e;a++){let c=a*Bt,l=Math.min(t,c+Bt);for(let h=0;h<e;h++){let u=h*Bt,d=Math.min(t,u+Bt),f=!1;for(let g=c;g<l;g++){let y=g*t;for(let p=u;p<d;p++){let m=y+p,_=this.h[m];_>.002&&(f=!0,i+=_,_>.05&&(n++,s+=this.sediment[m]))}}if(f||this.rainRate>0)for(let g=-1;g<=1;g++){let y=a+g;if(!(y<0||y>=e))for(let p=-1;p<=1;p++){let m=h+p;m<0||m>=e||(this.tileWet[y*e+m]=1)}}}}this._activateArea(0,0,t-1,6),this._activateArea(0,Math.floor(t*.55),6,Math.floor(t*.72));for(let a=0;a<this.turbines.length;a++){let c=this.turbines[a];this._activateArea(Math.min(c.intakeGx,c.outfallGx)-2,Math.min(c.intakeGz,c.outfallGz)-2,Math.max(c.intakeGx,c.outfallGx)+2,Math.max(c.intakeGz,c.outfallGz)+2)}let o=0;for(let a=0;a<this.totalTiles;a++)this.tileWet[a]&&(this.activeTiles[o++]=a);this.activeTileCount=o,this.wetCellCount=n,this.meanReservoirTurbidity=n>0?s/n:.04,this.totalWaterVolumeM3=i*this.cellArea}_substep(t){this.simTime+=t;let e=this.grid,i=1/this.dx,n=this.maxFlowSpeed,{h:s,hu:o,hv:a,zb:c,u:l,v:h,dH:u,dHU:d,dHV:f}=this;this._applyRiverBoundariesAndRain(t),this._stepTurbinesAndSpillways(t);for(let g=0;g<this.activeTileCount;g++){let y=this.activeTiles[g],p=y%this.tilesN*Bt,m=Math.floor(y/this.tilesN)*Bt,_=Math.min(e,p+Bt),M=Math.min(e,m+Bt);for(let v=m;v<M;v++){let w=v*e;for(let S=p;S<_;S++){let T=w+S;u[T]=0,d[T]=0,f[T]=0}}}for(let g=0;g<this.activeTileCount;g++){let y=this.activeTiles[g],p=Math.max(0,y%this.tilesN*Bt),m=Math.max(0,Math.floor(y/this.tilesN)*Bt),_=Math.min(e-1,p+Bt),M=Math.min(e-1,m+Bt);for(let v=m;v<M;v++){let w=v*e;for(let S=p;S<_;S++){let T=w+S;{let x=T+1,E=s[T],C=s[x];if(E>1e-5||C>1e-5){let R=c[T],L=c[x],D=R>L?R:L,I=Math.max(0,R+E-D),F=Math.max(0,L+C-D);if(I>1e-6||F>1e-6){let z=l[T],G=h[T],K=l[x],N=h[x],$=I*z,Q=I*G,ot=F*K,st=F*N,It=Math.abs(z)+Math.sqrt(Re*I),ut=Math.abs(K)+Math.sqrt(Re*F),Pt=It>ut?It:ut,q=.5*Re*I*I,Y=.5*Re*F*F,ct=.5*($+ot-Pt*(F-I)),vt=.5*($*z+q+ot*K+Y-Pt*(ot-$)),lt=.5*($*G+ot*N-Pt*(st-Q)),kt=.5*Re*(E*E-I*I),le=.5*Re*(C*C-F*F);S>=1&&(u[T]-=ct*i,d[T]-=(vt-kt)*i,f[T]-=lt*i),S+1<e-1&&(u[x]+=ct*i,d[x]+=(vt-le)*i,f[x]+=lt*i)}}}{let x=T+e,E=s[T],C=s[x];if(E>1e-5||C>1e-5){let R=c[T],L=c[x],D=R>L?R:L,I=Math.max(0,R+E-D),F=Math.max(0,L+C-D);if(I>1e-6||F>1e-6){let z=l[T],G=h[T],K=l[x],N=h[x],$=I*z,Q=I*G,ot=F*K,st=F*N,It=Math.abs(G)+Math.sqrt(Re*I),ut=Math.abs(N)+Math.sqrt(Re*F),Pt=It>ut?It:ut,q=.5*Re*I*I,Y=.5*Re*F*F,ct=.5*(Q+st-Pt*(F-I)),vt=.5*($*G+ot*N-Pt*(ot-$)),lt=.5*(Q*G+q+st*N+Y-Pt*(st-Q)),kt=.5*Re*(E*E-I*I),le=.5*Re*(C*C-F*F);v>=1&&(u[T]-=ct*i,d[T]-=vt*i,f[T]-=(lt-kt)*i),v+1<e-1&&(u[x]+=ct*i,d[x]+=vt*i,f[x]+=(lt-le)*i)}}}}}}for(let g=0;g<this.activeTileCount;g++){let y=this.activeTiles[g],p=Math.max(1,y%this.tilesN*Bt),m=Math.max(1,Math.floor(y/this.tilesN)*Bt),_=Math.min(e-1,y%this.tilesN*Bt+Bt),M=Math.min(e-1,Math.floor(y/this.tilesN)*Bt+Bt);for(let v=m;v<M;v++){let w=v*e;for(let S=p;S<_;S++){let T=w+S,x=s[T]+t*u[T];if(x<=1e-4){s[T]=0,o[T]=0,a[T]=0,l[T]=0,h[T]=0;continue}let E=o[T]+t*d[T],C=a[T]+t*f[T],R=x*x,L=R*R,D=Math.sqrt(L+(zd>L?zd:L)),I=Math.SQRT2*x/D,F=E*I,z=C*I,G=Math.hypot(F,z);if(G>1e-4){let K=this.linedMask[T]?.012:this.soil[T]<.5?.029:.036,N=Re*K*K/Math.pow(Math.max(.08,x),1.3333),$=1/(1+t*N*G);F*=$,z*=$;let Q=G*$;if(Q>n){let ot=n/Q;F*=ot,z*=ot}}s[T]=x,l[T]=F,h[T]=z,o[T]=x*F,a[T]=x*z}}}this._applyVorticityConfinement(t)}_applyRiverBoundariesAndRain(t){let e=this.grid,i=bi[this.presetId]||bi.bystritsa,n=$n(this.presetId),s=this.dx*1.6,o=n.main[0],a=this.worldToGrid(o.x,o.z+s),c=i.mainInflowQ*this.inflowMult+this.currentSnowmeltBonusQ*.7;this._injectSpring(a.gx,a.gz,2,c,.42,.91,t);let l=n.eastCreek[0],h=this.worldToGrid(l.x,l.z+s),u=i.creekInflowQ*this.inflowMult+this.currentSnowmeltBonusQ*.3;this._injectSpring(h.gx,h.gz,2,u,-.68,.73,t);let d=n.westCreek[0],f=this.worldToGrid(d.x+s,d.z),g=i.westCreekQ*this.inflowMult;if(this._injectSpring(f.gx,f.gz,2,g,.92,.38,t),this._accumInflowVol+=(i.mainInflowQ+i.creekInflowQ+i.westCreekQ)*this.inflowMult*t,this.rainRate>0){let M=this.rainRate*U.elevScale*t,v=(this.simTime*60|0)&3,w=v&1,S=v>>1&1,T=0;for(let x=2+S;x<e-2;x+=2){let E=x*e;for(let C=2+w;C<e-2;C+=2)this.h[E+C]+=M*4,T++}this._accumRainVol+=T*(M*4)*this.cellArea}let y=(e-2)*e,p=(e-1)*e,m=6.15*U.elevScale,_=0;for(let M=1;M<e-1;M++){let v=y+M,w=this.zb[v];if(this.h[v]>.01){let S=Math.max(0,m-w);if(this.h[v]>S){let T=this.h[v]-S,x=Math.max(this.v[v],Math.sqrt(Re*this.h[v])*.72),E=Math.min(T,x*this.h[v]*t/this.dx);this.h[v]=Math.max(S,this.h[v]-E),_+=E*this.cellArea,this.v[v]=Math.max(this.v[v],x*.65),this.hv[v]=this.h[v]*this.v[v]}}this.h[p+M]=this.h[v]*.85,this.hu[p+M]=0,this.hv[p+M]=0}this._accumMouthVol+=_;for(let M=0;M<e;M++)this.hu[M*e+1]=Math.max(0,this.hu[M*e+1]),this.hu[M*e+(e-2)]=Math.min(0,this.hu[M*e+(e-2)]),this.hv[1*e+M]=Math.max(0,this.hv[1*e+M])}_injectSpring(t,e,i,n,s,o,a){let c=0;for(let u=-i;u<=i;u++)for(let d=-i;d<=i;d++)d*d+u*u<=i*i+1&&c++;if(!c)return;let l=n*a/(c*this.cellArea),h=2.5*Math.pow(U.elevScale,.35);for(let u=-i;u<=i;u++)for(let d=-i;d<=i;d++){if(d*d+u*u>i*i+1)continue;let f=J(t+d,1,this.grid-2),y=J(e+u,1,this.grid-2)*this.grid+f;this.h[y]+=l,this.hu[y]+=l*s*h,this.hv[y]+=l*o*h;let p=this.h[y];this.u[y]=this.hu[y]/p,this.v[y]=this.hv[y]/p}}_stepTurbinesAndSpillways(t){let e=this.grid,i=this.maxFlowSpeed;for(let n=0;n<this.spillways.length;n++){let s=this.spillways[n],o=J(Math.round(s.gx-s.dirX*3),1,e-2),c=J(Math.round(s.gz-s.dirZ*3),1,e-2)*e+o,l=this.zb[c]+this.h[c];if(s.autoRegulate){let d=(l-s.targetHeadElev)/U.elevScale,f=J(.08+d*.28,0,1);Math.abs(f-s.openRatio)>.015&&(s.openRatio=ne(s.openRatio,f,J(t*2.5,0,1)),this._syncSpillwayGateCells(s))}let h=0,u=0;for(let d=0;d<s.cells.length;d++){let f=s.cells[d],g=this.h[f];if(g>.03){let y=Math.max(0,this.u[f]*s.dirX+this.v[f]*s.dirZ);h+=g*y*(this.dx/3),y>u&&(u=y),this.foam[f]=Math.min(1,this.foam[f]+.42)}}if(s.currentFlowQ=h,s.jetSpeed=u,h>1.2*U.flowScale*.2&&s.openRatio>.04){let d=s.gz*e+s.gx;this.jetEmitters.push({wx:s.wx+s.dirX*this.dx*1.1,wy:this.zb[d]+Math.max(.4,this.h[d]*.6),wz:s.wz+s.dirZ*this.dx*1.1,vx:s.dirX*Math.max(5.2,u*1.25),vy:1.5+u*.14,vz:s.dirZ*Math.max(5.2,u*1.25),intensity:J(h/(35*U.flowScale),.25,1.9),kind:"spillway"})}}for(let n=0;n<this.turbines.length;n++){let s=this.turbines[n],o=s.spec;s.isPumpingNow=!1,s.pumpConsumeMW=0;let a=0,c=0,l=0,h=0;for(let Q=-1;Q<=1;Q++)for(let ot=-1;ot<=1;ot++){let st=(s.intakeGz+Q)*e+(s.intakeGx+ot),It=this.h[st];It>.12&&(a+=this.zb[st]+It,c++,l+=(It-.08)*this.cellArea,h+=this.sediment[st])}let u=0,d=0,f=0;for(let Q=-1;Q<=1;Q++)for(let ot=-1;ot<=1;ot++){let st=(s.outfallGz+Q)*e+(s.outfallGx+ot);u+=this.zb[st]+this.h[st],d++,this.h[st]>.25&&(f+=(this.h[st]-.2)*this.cellArea)}let g=c>0?a/c:s.intakeBedY,y=u/(d||1),p=Math.max(0,g-y);if(s.grossHead=p,s.pumpedStorage&&o.reversible&&this.isOffPeakNight&&f>2*this.cellArea&&p<o.maxHead*.92){let Q=Math.max(3*U.elevScale,p),ot=Math.min(o.maxArea*2.1*Math.sqrt(Re*U.elevScale),f*.25/t),st=Bd*Re*ot*Q/.84*1e-6,It=ot*t,ut=0;for(let q=-1;q<=1;q++)for(let Y=-1;Y<=1;Y++){let ct=(s.outfallGz+q)*e+(s.outfallGx+Y);if(this.h[ct]>.25){let vt=Math.min(this.h[ct]-.2,It/9/this.cellArea);this.h[ct]-=vt,ut+=vt*this.cellArea}}let Pt=ut/(9*this.cellArea);for(let q=-1;q<=1;q++)for(let Y=-1;Y<=1;Y++){let ct=(s.intakeGz+q)*e+(s.intakeGx+Y);this.h[ct]+=Pt}s.isPumpingNow=!0,s.pumpConsumeMW=st,s.flowQ=-ot,s.powerMW=0,s.efficiency=.84,s.rotorPhase=(s.rotorPhase-t*5.2)%(Math.PI*2),this._accumPumpVol+=ut,this._accumPumpMW+=st;continue}if(c===0||l<=.05||s.throttle<=.005){s.netHead=0,s.flowQ=0,s.efficiency=0,s.powerMW=0,s.cavitation=0;continue}let m=h/c;if(s.autoDispatch?s.trashLoad=Math.max(0,s.trashLoad-t*.02):m>.25&&(s.trashLoad=Math.min(.28,s.trashLoad+(m-.25)*.004*t)),p<o.minHead*.45){s.netHead=p,s.flowQ=0,s.efficiency=0,s.powerMW=0,s.cavitation=0;continue}let _=1-s.trashLoad,M=J((p-o.minHead*.35)/(o.optHead*.55),.14,1),v=s.throttle*M*_*o.maxArea*Math.sqrt(2*Re*p),w=l*.42/t,S=Math.min(v,w),T=o.frictionK*S*S+s.trashLoad*1.4*U.elevScale,x=Math.max(0,p-T),E=(x-o.optHead)/o.headSigma,C=Math.exp(-.55*E*E),R=s.throttle<.28?.55+s.throttle/.28*.45:1,L=.65+.35*s.condition,D=J(o.peakEta*C*R*L,.18,o.peakEta),I=x>o.maxHead?(x-o.maxHead)/(15*U.elevScale):x<o.minHead?(o.minHead-x)/(6*U.elevScale):0;s.cavitation=J(I,0,1);let F=Bd*Re*S*x*D*1e-6,z=Math.min(o.ratedMW*1.18,F);s.netHead=x,s.flowQ=S,s.efficiency=D,s.powerMW=z,s.rotorPhase=(s.rotorPhase+t*(2.6+z/U.powerScale*1.35))%(Math.PI*2);let G=S*t,K=0;for(let Q=-1;Q<=1;Q++)for(let ot=-1;ot<=1;ot++){let st=(s.intakeGz+Q)*e+(s.intakeGx+ot),It=this.h[st];if(It>.12){let ut=(It-.08)*this.cellArea/l,Pt=Math.min(It-.05,G*ut/this.cellArea);this.h[st]-=Pt,this.hu[st]=this.h[st]*this.u[st],this.hv[st]=this.h[st]*this.v[st],K+=Pt*this.cellArea}}let N=K/(9*this.cellArea),$=J(2.2+Math.sqrt(2*Re*Math.max(.5,x))*.22,2,i*.45);for(let Q=-1;Q<=1;Q++)for(let ot=-1;ot<=1;ot++){let st=(s.outfallGz+Q)*e+(s.outfallGx+ot);this.h[st]+=N,this.hu[st]+=N*s.dirX*$,this.hv[st]+=N*s.dirZ*$;let It=this.h[st];It>1e-4&&(this.u[st]=J(this.hu[st]/It,-i,i),this.v[st]=J(this.hv[st]/It,-i,i),this.hu[st]=It*this.u[st],this.hv[st]=It*this.v[st]),this.foam[st]=Math.min(1,this.foam[st]+.45)}if(S>2.5*U.flowScale*.25){let Q=s.outfallGz*e+s.outfallGx;this.jetEmitters.push({wx:s.outfallWx,wy:this.zb[Q]+this.h[Q]+.2,wz:s.outfallWz,vx:s.dirX*$*.75,vy:1.15,vz:s.dirZ*$*.75,intensity:J(z/U.powerScale/8,.2,1.35),kind:"tailrace"})}}}_applyVorticityConfinement(t){let e=this.grid,i=.5/this.dx,n=this.maxFlowSpeed,{h:s,u:o,v:a,hu:c,hv:l,vort:h}=this;for(let d=0;d<this.activeTileCount;d++){let f=this.activeTiles[d],g=Math.max(2,f%this.tilesN*Bt),y=Math.max(2,Math.floor(f/this.tilesN)*Bt),p=Math.min(e-2,f%this.tilesN*Bt+Bt),m=Math.min(e-2,Math.floor(f/this.tilesN)*Bt+Bt);for(let _=y;_<m;_++){let M=_*e;for(let v=g;v<p;v++){let w=M+v;if(s[w]<.18){h[w]=0;continue}let S=(a[w+1]-a[w-1])*i,T=(o[w+e]-o[w-e])*i;h[w]=S-T}}}let u=.34*this.dx*t;for(let d=0;d<this.activeTileCount;d++){let f=this.activeTiles[d],g=Math.max(2,f%this.tilesN*Bt),y=Math.max(2,Math.floor(f/this.tilesN)*Bt),p=Math.min(e-2,f%this.tilesN*Bt+Bt),m=Math.min(e-2,Math.floor(f/this.tilesN)*Bt+Bt);for(let _=y;_<m;_++){let M=_*e;for(let v=g;v<p;v++){let w=M+v,S=s[w],T=h[w];if(S<.25||Math.abs(T)<.015)continue;let x=Math.abs(h[w+1])-Math.abs(h[w-1]),E=Math.abs(h[w+e])-Math.abs(h[w-e]),C=Math.hypot(x,E)+1e-5,R=x/C,L=E/C,D=u*L*T,I=-u*R*T;o[w]=J(o[w]+D,-n,n),a[w]=J(a[w]+I,-n,n),c[w]=S*o[w],l[w]=S*a[w]}}}}_stepSecondaryTransportAndErosion(t){let e=this.grid,i=1/this.dx,{h:n,hu:s,hv:o,u:a,v:c,foam:l,foamNext:h,sediment:u,sedNext:d,wetness:f,soilSaturation:g}=this;this._erosionTick++;let y=this._erosionTick%3===0,p=this._erosionTick%6===0,m=e,_=e,M=-1,v=-1,w=0,S=0,T=0,x=this.currentEvapRateMps*t,E=38*U.elevScale;for(let C=0;C<this.activeTileCount;C++){let R=this.activeTiles[C],L=Math.max(1,R%this.tilesN*Bt),D=Math.max(1,Math.floor(R/this.tilesN)*Bt),I=Math.min(e-1,R%this.tilesN*Bt+Bt),F=Math.min(e-1,Math.floor(R/this.tilesN)*Bt+Bt);for(let z=D;z<F;z++){let G=z*e;for(let K=L;K<I;K++){let N=G+K,$=n[N];if($>.02){let Ot=x;if(this.linedMask[N]===0&&this.concrete[N]<.1&&g[N]<.995){let Qt=1-g[N],B=Math.min($*.12,Qt*85e-5*t);Ot+=B,T+=B*this.cellArea,g[N]=Math.min(1,g[N]+t*.045)}Ot>0&&$>Ot+.005&&($-=Ot,n[N]=$,s[N]=$*a[N],o[N]=$*c[N])}else g[N]>.25&&(g[N]=Math.max(.25,g[N]-t*.006));if(p&&this.concrete[N]>4.5*U.elevScale&&z>2&&z<e-3&&K>2&&K<e-3){let Ot=Math.max(n[N-e*2],n[N-2],n[N+2],n[N+e*2]);if(Ot>2.5*U.elevScale){let Qt=this.foundationMask[N]?E:_e.maxUnreinforcedHead,B=J(Ot/Qt*100,0,125);if(B>w&&(w=B),!this.foundationMask[N]&&this.soil[N]>1*U.elevScale&&Ot>_e.highDamHeadThreshold){let De=(Ot-_e.highDamHeadThreshold)/U.elevScale*.09*U.flowScale;S+=De}}}let Q=n[N-1]>.03||n[N+1]>.03||n[N-e]>.03||n[N+e]>.03;if($>.02||Q?f[N]=Math.min(1,f[N]+t*2.5):f[N]>0&&(f[N]=Math.max(0,f[N]-t*.08)),$<=.015){h[N]=l[N]*.75,d[N]=u[N]*.85;continue}let ot=J(K-a[N]*t*i,.5,e-1.5),st=J(z-c[N]*t*i,.5,e-1.5),It=ot|0,ut=st|0,Pt=ot-It,q=st-ut,Y=ut*e+It,ct=Y+1,vt=Y+e,lt=vt+1,kt=ne(ne(l[Y],l[ct],Pt),ne(l[vt],l[lt],Pt),q),le=ne(ne(u[Y],u[ct],Pt),ne(u[vt],u[lt],Pt),q),Xt=a[N]*a[N]+c[N]*c[N],ht=Math.sqrt(Xt),at=ht/Math.sqrt(Re*Math.max(.08,$)),Lt=(a[N+1]-a[N-1]+(c[N+e]-c[N-e]))*.5*i,Kt=at>.95&&Lt<-.08?Math.min(.65,-Lt*.55*t*8):0,qt=ht>3.6*Math.pow(U.elevScale,.35)?(ht-3.6)*.085*t:0;h[N]=J(kt*Math.exp(-t*.7)+Kt+qt,0,1);let $t=le*Math.exp(-t*.16);if(this.linedMask[N]===0&&this.concrete[N]<.05&&this.soil[N]>.02){let Ot=this.earthDamMask[N]===1,Qt=(Ot?1.85:4)*Math.pow(U.elevScale,.35);if(ht>Qt){let B=ht-Qt;if($t=Math.min(1.5,$t+B*(Ot?.45:.14)*t),y){let De=Ot?.095:.008,ce=Math.min(this.soil[N],B*De*t*3);ce>.001&&(this.soil[N]-=ce,this.zb[N]=this.bedrock[N]+this.soil[N]+Math.max(this.concrete[N],this.formworkWall[N])+this.gateWall[N],K<m&&(m=K),z<_&&(_=z),K>M&&(M=K),z>v&&(v=z))}}}d[N]=$t}}}this.lastInfiltrationQ=ne(this.lastInfiltrationQ,T/Math.max(1e-4,t),.3),p&&(this.maxDamStress=ne(this.maxDamStress,w,.35),this.totalSeepageQ=ne(this.totalSeepageQ,S,.35));for(let C=0;C<this.activeTileCount;C++){let R=this.activeTiles[C],L=Math.max(1,R%this.tilesN*Bt),D=Math.max(1,Math.floor(R/this.tilesN)*Bt),I=Math.min(e-1,R%this.tilesN*Bt+Bt),F=Math.min(e-1,Math.floor(R/this.tilesN)*Bt+Bt);for(let z=D;z<F;z++){let G=z*e;for(let K=L;K<I;K++){let N=G+K;l[N]=h[N],u[N]=d[N]}}}M>=m&&this.markTerrainDirty(m,_,M,v)}_rebuildVelocitiesAll(){for(let t=0;t<this.count;t++){let e=this.h[t];e<=1e-4?(this.u[t]=0,this.v[t]=0,this.hu[t]=0,this.hv[t]=0):(this.u[t]=this.hu[t]/e,this.v[t]=this.hv[t]/e)}}};var Fa=class{constructor({step:t=1/30,maxSteps:e=4}={}){if(!Number.isFinite(t)||t<=0||t>1||!Number.isSafeInteger(e)||e<1)throw new Error("\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0435 \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u044B \u0447\u0430\u0441\u043E\u0432");this.step=t,this.maxSteps=e,this.accumulator=0,this.tick=0,this._advancing=!1}advance(t,e){if(!Number.isFinite(t)||t<0||!Number.isFinite(this.accumulator+t)||typeof e!="function")throw new Error("\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0439 \u0448\u0430\u0433 \u0447\u0430\u0441\u043E\u0432");if(this._advancing)throw new Error("\u0412\u043B\u043E\u0436\u0435\u043D\u043D\u044B\u0439 \u0432\u044B\u0437\u043E\u0432 \u0447\u0430\u0441\u043E\u0432");this.accumulator+=t;let i=0;this._advancing=!0;try{for(;this.accumulator+this.step*1e-9>=this.step&&i<this.maxSteps;)e(this.step,this.tick),this.accumulator=Math.max(0,this.accumulator-this.step),this.tick++,i++}finally{this._advancing=!1}return{steps:i,remaining:this.accumulator,tick:this.tick}}};var Ba=class{constructor(){this.reset()}reset(){this.inflowRiversQ=0,this.snowmeltQ=0,this.precipDirectQ=0,this.groundwaterBaseQ=0,this.pumpedReturnQ=0,this.evaporationQ=0,this.infiltrationQ=0,this.damSeepageQ=0,this.waterSupplyWithdrawQ=0,this.mouthOutflowQ=0,this.turbineWorkingQ=0,this.spillwayAndOverflowQ=0,this.cumArrivedM3=0,this.cumPrecipM3=0,this.cumSnowmeltM3=0,this.cumEvaporatedM3=0,this.cumInfiltratedM3=0,this.cumConsumedM3=0,this.cumMouthOutM3=0,this.cumTurbinePassedM3=0,this.cumSpilledM3=0,this.airTempC=18,this.mountainTempC=4,this.relHumidity=.55,this.windSpeedMs=4.5,this.vaporDeficitKPa=.85,this.wetSurfaceAreaM2=0,this.wetSurfaceHectares=0,this.evapMmPerDay=0,this.snowMeltVisualOffset=0,this.prevVolumeM3=0,this.dVdT=0}_satVaporPressureKPa(t){return .6108*Math.exp(17.27*t/(t+237.3))}step(t,e,i,n,s=1,o=!1){if(t<=0)return;let a=qe[n]||qe.normal,c=Math.sin((i-9.5)/24*Math.PI*2),l=J(Math.sin((i-6)/24*Math.PI*2),0,1);this.airTempC=a.baseTempC+6.4*c,this.mountainTempC=this.airTempC-11.5,this.relHumidity=J(a.relHumidity-.14*c,.2,.98),this.windSpeedMs=a.windSpeedMs*(.85+.3*l),this.wetSurfaceAreaM2=e.wetCellCount*e.cellArea,this.wetSurfaceHectares=this.wetSurfaceAreaM2/1e4;let h=this._satVaporPressureKPa(this.airTempC),u=h*this.relHumidity;this.vaporDeficitKPa=Math.max(.02,h-u),this.evapMmPerDay=(.42+.34*this.windSpeedMs)*this.vaporDeficitKPa*(.55+1.15*l);let d=this.evapMmPerDay*.001/U.dayLengthSec*2.4;this.evaporationQ=d*this.wetSurfaceAreaM2;let f=Math.max(0,this.mountainTempC+3.5*l);this.snowmeltQ=f*(3.2*U.flowScale)*(.35+.85*l),this.snowMeltVisualOffset=J((this.mountainTempC+2)*1.4,-6,16),this.groundwaterBaseQ=8.5*U.flowScale*(a.id==="low_water"?.85:1.12),this.precipDirectQ=e.lastRainAddedQ||0,this.inflowRiversQ=e.lastRiverInflowQ||0,this.infiltrationQ=e.lastInfiltrationQ||0,this.damSeepageQ=e.totalSeepageQ||0,this.mouthOutflowQ=e.lastMouthOutflowQ||0,this.pumpedReturnQ=e.lastPumpedUpQ||0;let g=0;for(let m=0;m<e.turbines.length;m++)e.turbines[m].flowQ>0&&(g+=e.turbines[m].flowQ);let y=e.lastCrestOverflowQ||0;for(let m=0;m<e.spillways.length;m++)y+=e.spillways[m].currentFlowQ||0;this.turbineWorkingQ=g,this.spillwayAndOverflowQ=y,this.waterSupplyWithdrawQ=(s*1.35+(o?6.8:0))*Math.pow(U.flowScale,.75),e.currentEvapRateMps=d,e.currentSnowmeltBonusQ=this.snowmeltQ+this.groundwaterBaseQ,e.currentWithdrawQ=this.waterSupplyWithdrawQ;let p=this.inflowRiversQ+this.snowmeltQ+this.groundwaterBaseQ+this.precipDirectQ;this.cumArrivedM3+=p*t,this.cumPrecipM3+=this.precipDirectQ*t,this.cumSnowmeltM3+=this.snowmeltQ*t,this.cumEvaporatedM3+=this.evaporationQ*t,this.cumInfiltratedM3+=(this.infiltrationQ+this.damSeepageQ)*t,this.cumConsumedM3+=this.waterSupplyWithdrawQ*t,this.cumMouthOutM3+=this.mouthOutflowQ*t,this.cumTurbinePassedM3+=this.turbineWorkingQ*t,this.cumSpilledM3+=this.spillwayAndOverflowQ*t,this.prevVolumeM3>0&&(this.dVdT=(e.totalWaterVolumeM3-this.prevVolumeM3)/Math.max(.05,t)),this.prevVolumeM3=e.totalWaterVolumeM3}getReport(t,e){let i=this.inflowRiversQ+this.snowmeltQ+this.groundwaterBaseQ+this.precipDirectQ,n=this.mouthOutflowQ+this.evaporationQ+this.infiltrationQ+this.damSeepageQ+this.waterSupplyWithdrawQ,s=Math.max(.01,this.turbineWorkingQ+this.spillwayAndOverflowQ),o=this.turbineWorkingQ+this.spillwayAndOverflowQ>.5?Math.round(this.turbineWorkingQ/s*100):0,a=(e%24+24)%24,c="";return this.precipDirectQ>5?c="\u0421\u0435\u0439\u0447\u0430\u0441 \u0446\u0438\u043A\u043B\u043E\u043D: \u043A\u0430\u043F\u043B\u0438 \u0434\u043E\u0436\u0434\u044F \u0434\u0430\u044E\u0442 \u043F\u0440\u044F\u043C\u043E\u0439 \u0441\u043A\u043B\u043E\u043D\u043E\u0432\u044B\u0439 \u0441\u0442\u043E\u043A \u0432 \u0440\u0435\u043A\u0438, \u0432\u043B\u0430\u0436\u043D\u043E\u0441\u0442\u044C \u0432\u044B\u0441\u043E\u043A\u0430\u044F \u2014 \u0438\u0441\u043F\u0430\u0440\u0435\u043D\u0438\u0435 \u0441 \u0437\u0435\u0440\u043A\u0430\u043B\u0430 \u043C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u043E.":a>=11&&a<=17.5?c="\u0414\u043D\u0435\u0432\u043D\u043E\u0439 \u043F\u0440\u043E\u0433\u0440\u0435\u0432: \u0441\u043E\u043B\u043D\u0446\u0435 \u0440\u0430\u0441\u0442\u0430\u043F\u043B\u0438\u0432\u0430\u0435\u0442 \u0433\u043E\u0440\u043D\u044B\u0435 \u0441\u043D\u0435\u0436\u043D\u0438\u043A\u0438 (+\u043F\u0440\u0438\u0442\u043E\u043A \u0441\u0432\u0435\u0440\u0445\u0443), \u043D\u043E \u043E\u0434\u043D\u043E\u0432\u0440\u0435\u043C\u0435\u043D\u043D\u043E \u0443\u0441\u0438\u043B\u0438\u0432\u0430\u0435\u0442 \u0438\u0441\u043F\u0430\u0440\u0435\u043D\u0438\u0435 \u0441 \u0448\u0438\u0440\u043E\u043A\u043E\u0433\u043E \u0437\u0435\u0440\u043A\u0430\u043B\u0430 \u0432\u043E\u0434\u043E\u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0430.":a>=0&&a<6?c="\u041D\u043E\u0447\u043D\u043E\u0435 \u043E\u0445\u043B\u0430\u0436\u0434\u0435\u043D\u0438\u0435: \u043B\u0435\u0434\u043D\u0438\u043A\u0438 \u0432 \u0433\u043E\u0440\u0430\u0445 \u043F\u043E\u0434\u043C\u0451\u0440\u0437\u043B\u0438, \u0438\u0441\u043F\u0430\u0440\u0435\u043D\u0438\u0435 \u0443\u043F\u0430\u043B\u043E \u2014 \u0438\u0434\u0435\u0430\u043B\u044C\u043D\u043E\u0435 \u043E\u043A\u043D\u043E \u0434\u043B\u044F \u043D\u0430\u043A\u043E\u043F\u043B\u0435\u043D\u0438\u044F \u0431\u044C\u0435\u0444\u0430 \u0438 \u0437\u0430\u043A\u0430\u0447\u043A\u0438 \u0413\u0410\u042D\u0421!":c="\u041F\u0438\u043A\u043E\u0432\u044B\u0435 \u0447\u0430\u0441\u044B \u044D\u043D\u0435\u0440\u0433\u043E\u0441\u0438\u0441\u0442\u0435\u043C\u044B: \u043D\u0430\u043A\u043E\u043F\u043B\u0435\u043D\u043D\u044B\u0439 \u043E\u0431\u044A\u0451\u043C \u0432\u043E\u0434\u043E\u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0430 \u0441\u0440\u0430\u0431\u0430\u0442\u044B\u0432\u0430\u0435\u0442\u0441\u044F \u0447\u0435\u0440\u0435\u0437 \u043D\u0430\u043F\u043E\u0440\u043D\u044B\u0435 \u0432\u043E\u0434\u043E\u0432\u043E\u0434\u044B \u0413\u042D\u0421 \u0434\u043B\u044F \u043C\u0430\u043A\u0441\u0438\u043C\u0443\u043C\u0430 \u0432\u044B\u0440\u0443\u0447\u043A\u0438.",{airTempC:this.airTempC,mountainTempC:this.mountainTempC,relHumidityPct:Math.round(this.relHumidity*100),windSpeedMs:this.windSpeedMs,evapMmPerDay:this.evapMmPerDay,wetAreaHa:this.wetSurfaceHectares,totalVolumeM3:t.totalWaterVolumeM3,netDeltaQ:i-n,hydroUtilizationPct:o,whenWhySummary:c,inTotalQ:i,inRiversQ:this.inflowRiversQ,inSnowmeltQ:this.snowmeltQ,inPrecipQ:this.precipDirectQ,inGroundwaterQ:this.groundwaterBaseQ,inPumpedGAESQ:this.pumpedReturnQ,outTotalQ:n,outMouthQ:this.mouthOutflowQ,outEvapQ:this.evaporationQ,outInfiltQ:this.infiltrationQ,outSeepageQ:this.damSeepageQ,outCitiesAgroQ:this.waterSupplyWithdrawQ,nodeTurbineQ:this.turbineWorkingQ,nodeSpillOverflowQ:this.spillwayAndOverflowQ,cumArrivedK:this.cumArrivedM3/1e3,cumPrecipK:this.cumPrecipM3/1e3,cumSnowmeltK:this.cumSnowmeltM3/1e3,cumEvaporatedK:this.cumEvaporatedM3/1e3,cumInfiltratedK:this.cumInfiltratedM3/1e3,cumConsumedK:this.cumConsumedM3/1e3,cumMouthOutK:this.cumMouthOutM3/1e3,cumTurbineK:this.cumTurbinePassedM3/1e3,cumSpilledK:this.cumSpilledM3/1e3}}};function Di(r,t=4,e=!0){return r.wrapS=Bn,r.wrapT=Bn,r.magFilter=ke,r.minFilter=Yi,r.generateMipmaps=!0,r.anisotropy=t,e&&"colorSpace"in r&&(r.colorSpace=ii),r.needsUpdate=!0,r}function on(r,t=r){let e=document.createElement("canvas");return e.width=r,e.height=t,e}function $e(r,t,e=17){let i=Math.sin(r*127.1+t*311.7+e*74.7)*43758.5453123;return i-Math.floor(i)}function br(r,t,e,i){let n=r*e,s=t*e,o=Math.floor(n),a=Math.floor(s),c=n-o,l=s-a,h=8,u=8;for(let d=-1;d<=1;d++)for(let f=-1;f<=1;f++){let g=((o+f)%e+e)%e,y=((a+d)%e+e)%e,p=f+.14+.72*$e(g,y,i)-c,m=d+.14+.72*$e(g,y,i+31)-l,_=Math.hypot(p,m);_<h?(u=h,h=_):_<u&&(u=_)}return{d1:h,edge:u-h}}function Od(r=512){let t=new Uint8Array(r*r*4),e=Math.PI*2;for(let n=0;n<r;n++){let s=n/r;for(let o=0;o<r;o++){let a=o/r,c=e*(3*a+2*s),l=e*(-5*a+4*s)+1.1,h=e*(8*a-6*s)+2.4,u=e*(13*a+9*s)-.7,d=e*(-17*a-12*s)+1.9,f=e*(24*a-19*s)+.4,g=.3*Math.cos(c)*3+.22*Math.cos(l)*-5+.16*Math.cos(h)*8+.11*Math.cos(u)*13+.07*Math.cos(d)*-17+.045*Math.cos(f)*24,y=.3*Math.cos(c)*2+.22*Math.cos(l)*4+.16*Math.cos(h)*-6+.11*Math.cos(u)*9+.07*Math.cos(d)*-12+.045*Math.cos(f)*-19,p=Math.max(-1,Math.min(1,g*.21)),m=Math.max(-1,Math.min(1,y*.21)),_=br(a,s,8,11),M=br(a,s,16,43),v=Math.pow(Math.max(0,1-_.edge*2.55),3.6),w=Math.pow(Math.max(0,1-M.edge*2.85),4),S=Math.min(1,v*.76+w*.62),T=br(a,s,13,89),x=br(a,s,26,137),E=Math.pow(Math.max(0,1-T.edge*3.1),2.4),C=Math.pow(Math.max(0,1-x.d1*1.9),3),R=.5+.5*Math.sin(e*(6*a+2*s)+Math.sin(e*4*s)*1.5),L=Math.min(1,E*.72+C*.34+E*R*.28),D=(n*r+o)*4;t[D]=Math.round((p*.5+.5)*255),t[D+1]=Math.round((m*.5+.5)*255),t[D+2]=Math.round(S*255),t[D+3]=Math.round(L*255)}}let i=new gn(t,r,r,ri);return Di(i,8,!1)}function Rg(r=4){let i=new Uint8Array(524288),n=Math.PI*2;for(let o=0;o<512;o++){let a=o/512;for(let c=0;c<256;c++){let l=c/256,h=.5+.5*Math.sin(n*9*l+Math.sin(n*3*a)*1.1),u=.5+.5*Math.sin(n*19*l-n*2*a),d=br(l,a*2%1,10,61),f=Math.pow(Math.max(0,1-d.edge*2.6),2.1),g=Math.min(1,.32+h*.32+u*.18+f*.45),y=Math.min(1,.58+h*.24+f*.3),p=(o*256+c)*4;i[p]=Math.round((.72+.28*g)*255),i[p+1]=Math.round((.89+.11*g)*255),i[p+2]=Math.round((.96+.04*g)*255),i[p+3]=Math.round(y*255)}}let s=new gn(i,256,512,ri);return Di(s,r,!0)}function Ig(r=4){let e=on(256),i=e.getContext("2d"),n=on(256),s=n.getContext("2d");i.fillStyle="#adb6c1",i.fillRect(0,0,256,256),s.fillStyle="#808080",s.fillRect(0,0,256,256);let o=8,a=4,c=256/o,l=256/a;for(let g=0;g<o;g++){let y=g%2*(l*.5);for(let p=-1;p<=a;p++){let m=p*l+y,_=g*c,M=164+Math.round(($e(p+10,g,5)-.5)*24);i.fillStyle=`rgb(${M}, ${M+4}, ${M+9})`,i.fillRect(m+1,_+1,l-2,c-2),i.fillStyle="rgba(42, 52, 66, 0.78)",s.fillStyle="#262626";for(let v of[.2,.8])for(let w of[.28,.72])i.beginPath(),i.arc(m+l*v,_+c*w,2.1,0,Math.PI*2),i.fill(),s.beginPath(),s.arc(m+l*v,_+c*w,2.4,0,Math.PI*2),s.fill()}i.fillStyle="rgba(54, 65, 80, 0.68)",i.fillRect(0,g*c-1,256,2),s.fillStyle="#383838",s.fillRect(0,g*c-1,256,2.5)}let h=i.getImageData(0,0,256,256),u=s.getImageData(0,0,256,256),d=h.data,f=u.data;for(let g=0;g<256;g++)for(let y=0;y<256;y++){let p=($e(y,g,99)-.5)*18,m=Math.sin(y/256*Math.PI*10)*5,_=(g*256+y)*4;d[_]=Math.max(0,Math.min(255,d[_]+p-m*.4)),d[_+1]=Math.max(0,Math.min(255,d[_+1]+p)),d[_+2]=Math.max(0,Math.min(255,d[_+2]+p+m*.3));let M=Math.max(0,Math.min(255,f[_]+p*1.4));f[_]=M,f[_+1]=M,f[_+2]=M}return i.putImageData(h,0,0),s.putImageData(u,0,0),{map:Di(new mi(e),r,!0),bumpMap:Di(new mi(n),r,!1)}}function Pg(r=4){let e=on(128),i=e.getContext("2d");i.fillStyle="#9a683a",i.fillRect(0,0,128,128);for(let n=0;n<8;n++){let s=n*16,o=136+Math.round($e(n,3,19)*34);i.fillStyle=`rgb(${o+22}, ${o-8}, ${o-46})`,i.fillRect(0,s+1,128,14)}i.strokeStyle="#475569",i.lineWidth=3;for(let n=8;n<128;n+=16)i.beginPath(),i.moveTo(n,0),i.lineTo(n,128),i.stroke(),i.beginPath(),i.moveTo(0,n),i.lineTo(128,n),i.stroke();return i.fillStyle="#eab308",i.fillRect(0,0,128,5),i.fillRect(0,123,128,5),Di(new mi(e),r,!0)}function Lg(r=4){let e=on(128),i=e.getContext("2d"),n=i.createLinearGradient(0,0,128,0);n.addColorStop(0,"#5a6b7d"),n.addColorStop(.32,"#9eb0c2"),n.addColorStop(.52,"#cfdbe6"),n.addColorStop(.75,"#7c8ea2"),n.addColorStop(1,"#5a6b7d"),i.fillStyle=n,i.fillRect(0,0,128,128);for(let s=16;s<128;s+=32){i.fillStyle="rgba(26, 36, 48, 0.65)",i.fillRect(0,s,128,3),i.fillStyle="rgba(226, 232, 240, 0.72)";for(let o=8;o<128;o+=16)i.beginPath(),i.arc(o,s+6,1.9,0,Math.PI*2),i.fill()}return Di(new mi(e),r,!0)}function Dg(r=4){let e=on(128),i=e.getContext("2d");i.fillStyle="#b8bcc4",i.fillRect(0,0,128,128);for(let n=0;n<128;n+=16){i.fillStyle="rgba(30, 41, 59, 0.35)",i.fillRect(0,n,128,2);let s=n/16%2*8;for(let o=0;o<128;o+=16){let a=166+Math.round($e(o,n,71)*38);i.fillStyle=`rgb(${a}, ${a}, ${a+4})`,i.fillRect((o+s)%128,n+2,14,13)}}return Di(new mi(e),r,!0)}function Ng(r=4){let e=on(128),i=e.getContext("2d");i.fillStyle="#2d5e3c",i.fillRect(0,0,128,128);for(let l=0;l<420;l++){let h=$e(l,1,13)*128,u=$e(l,2,29)*128,d=74+Math.round($e(l,3,47)*66);i.fillStyle=`rgb(${Math.round(d*.46)}, ${d}, ${Math.round(d*.56)})`,i.fillRect(h,u,4,8)}let n=on(64),s=n.getContext("2d");s.fillStyle="#5c4028",s.fillRect(0,0,64,64);for(let l=0;l<64;l+=4){let h=54+Math.round($e(l,7,91)*38);s.fillStyle=`rgb(${h+24}, ${h}, ${h-16})`,s.fillRect(l,0,3,64)}let o=on(128),a=o.getContext("2d"),c=a.createImageData(128,128);for(let l=0;l<128;l++)for(let h=0;h<128;h++){let u=(l*128+h)*4,d=($e(h>>1,l>>1,3)-.5)*44,f=($e(h,l,7)-.5)*26,g=$e(h>>4,l>>4,27)>.74?1:0,y=138+d+f;c.data[u]=Math.max(0,Math.min(255,y-g*22)),c.data[u+1]=Math.max(0,Math.min(255,y+g*19)),c.data[u+2]=Math.max(0,Math.min(255,y-4-g*28)),c.data[u+3]=255}return a.putImageData(c,0,0),{foliage:Di(new mi(e),r,!0),bark:Di(new mi(n),r,!0),rock:Di(new mi(o),r,!0)}}function Ug(r=4){let i=on(512),n=i.getContext("2d"),s=[[214,198,178],[192,114,88],[218,224,232],[156,176,198],[182,168,152],[134,168,188],[226,212,184],[164,172,182]];for(let o=0;o<8;o++)for(let a=0;a<8;a++){let c=o*8+a,l=a*64,h=o*64,u=s[(a+o*3)%s.length],d=Math.round(($e(a,o,19)-.5)*36),f=Math.max(45,Math.min(245,u[0]+d)),g=Math.max(45,Math.min(245,u[1]+d)),y=Math.max(45,Math.min(245,u[2]+d));if(n.fillStyle=`rgb(${f},${g},${y})`,n.fillRect(l,h,64,64),n.fillStyle="rgba(20, 30, 44, 0.24)",o===0||o===1)for(let p=0;p<64;p+=8){n.fillRect(l,h+p,64,1);let m=p/8%2*8;for(let _=m;_<64;_+=16)n.fillRect(l+_,h+p,1,8)}else if(o===2||o===3){n.fillStyle="rgba(56, 148, 218, 0.35)";for(let p=4;p<64;p+=12)for(let m=4;m<64;m+=10)n.fillRect(l+m,h+p,7,8)}else if(o===4)for(let p=0;p<64;p+=6)n.fillRect(l+p,h,2,64);else if(o===5)for(let p=0;p<64;p+=6)n.fillRect(l,h+p,64,1.5);else{for(let p=0;p<64;p+=16)n.fillRect(l,h+p,64,2);for(let p=0;p<64;p+=16)n.fillRect(l+p,h,2,64)}}return Di(new mi(i),r,!0)}var In=[{family:"rock_strata",label:"\u0413\u043E\u0440\u043D\u044B\u0435 \u043F\u043E\u0440\u043E\u0434\u044B \u0438 \u0441\u0442\u0440\u0430\u0442\u044B",count:54,baseH:.07,sat:.12,lMin:.32,lMax:.72},{family:"soils_pebbles",label:"\u0413\u0440\u0443\u043D\u0442\u044B, \u0433\u0430\u043B\u044C\u043A\u0430 \u0438 \u043F\u043B\u044F\u0436\u0438",count:54,baseH:.09,sat:.28,lMin:.28,lMax:.68},{family:"hydro_concrete",label:"\u0413\u0438\u0434\u0440\u043E\u0442\u0435\u0445\u043D\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u0431\u0435\u0442\u043E\u043D\u044B \u0438 \u0431\u0443\u0442",count:54,baseH:.58,sat:.08,lMin:.46,lMax:.84},{family:"city_facades",label:"\u0410\u0440\u0445\u0438\u0442\u0435\u043A\u0442\u0443\u0440\u043D\u044B\u0435 \u0444\u0430\u0441\u0430\u0434\u044B \u0438 \u0441\u0442\u0435\u043A\u043B\u043E",count:72,baseH:.11,sat:.24,lMin:.48,lMax:.88},{family:"roofs_metals",label:"\u041A\u0440\u043E\u0432\u043B\u0438, \u0441\u0442\u0430\u043B\u044C \u0438 \u0432\u043E\u0434\u043E\u0432\u043E\u0434\u044B",count:54,baseH:.03,sat:.34,lMin:.3,lMax:.76},{family:"flora_agro",label:"\u0425\u0432\u043E\u044F, \u043B\u0443\u0433\u0430 \u0438 \u0430\u0433\u0440\u043E-\u043A\u0443\u043B\u044C\u0442\u0443\u0440\u044B",count:54,baseH:.31,sat:.42,lMin:.24,lMax:.62},{family:"water_optics",label:"\u041E\u043F\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u043E\u0442\u0442\u0435\u043D\u043A\u0438 \u0432\u043E\u0434\u044B \u0438 \u043B\u044C\u0434\u0430",count:45,baseH:.52,sat:.58,lMin:.26,lMax:.82},{family:"fleet_machinery",label:"\u0420\u0435\u0447\u043D\u043E\u0439 \u0444\u043B\u043E\u0442, \u043F\u043E\u0435\u0437\u0434\u0430 \u0438 \u043A\u0440\u0430\u043D\u044B",count:45,baseH:.14,sat:.64,lMin:.36,lMax:.78}],rn=(()=>{let r=[],t=new ft,e=0;for(let i=0;i<In.length;i++){let n=In[i];for(let s=0;s<n.count;s++){let o=s/Math.max(1,n.count-1),a=($e(i+1,s+3,77)-.5)*(n.family==="city_facades"?.85:.22),c=((n.baseH+a)%1+1)%1,l=Math.max(.03,Math.min(.88,n.sat+($e(s,i,19)-.5)*.24)),h=n.lMin+(n.lMax-n.lMin)*o;t.setHSL(c,l,h),r.push({id:e,family:n.family,familyLabel:n.label,name:`${n.label} #${s+1}`,atlasTile:e*7%64,hex:t.getHex(),r:t.r,g:t.g,b:t.b,roughness:+(.25+.68*$e(e,5,31)).toFixed(2)}),e++}}return r})();function Qi(r,t=0){let e=0;for(let i=0;i<In.length;i++){if(In[i].family===r){let n=e+(t%In[i].count+In[i].count)%In[i].count;return rn[n]}e+=In[i].count}return rn[(t%rn.length+rn.length)%rn.length]}function za(r){let t=r?Math.min(8,r.capabilities.getMaxAnisotropy()):4,e=Od(512),i=Rg(t),n=Ig(t),s=Pg(t),o=Lg(t),a=Dg(t),c=Ug(t),l=Ng(t);return{waterDetail:e,overflowCascade:i,concreteMap:n.map,concreteBump:n.bumpMap,rebarFormwork:s,steel:o,roof:a,facadeAtlas:c,foliage:l.foliage,bark:l.bark,rock:l.rock,shadeCatalogCount:rn.length}}var Oa=[{id:"spotEnergy",label:"\u0421\u043F\u043E\u0442\u043E\u0432\u044B\u0439 \u0440\u044B\u043D\u043E\u043A \u041E\u0420\u042D\u041C (\u043F\u0438\u043A\u0438 \u041C\u0412\u0442\xB7\u0447)",color:"#fbbf24"},{id:"industrialPPA",label:"\u041F\u0440\u044F\u043C\u044B\u0435 \u043A\u043E\u043D\u0442\u0440\u0430\u043A\u0442\u044B (\u0410\u043B\u044E\u043C\u0438\u043D\u0438\u0439 + \u0426\u041E\u0414 \u0418\u0418)",color:"#38bdf8"},{id:"capacityMarket",label:"\u041C\u0430\u043D\u0435\u0432\u0440\u0435\u043D\u043D\u0430\u044F \u043C\u043E\u0449\u043D\u043E\u0441\u0442\u044C \u0410\u0420\u0427\u041C (50 \u0413\u0446)",color:"#a78bfa"},{id:"gaesArbitrage",label:"\u0426\u0435\u043D\u043E\u0432\u043E\u0439 \u0430\u0440\u0431\u0438\u0442\u0440\u0430\u0436 \u0413\u0410\u042D\u0421 (\u043D\u043E\u0447\u044C \u2192 \u043F\u0438\u043A)",color:"#2dd4bf"},{id:"navigationLocks",label:"\u0421\u0443\u0434\u043E\u0445\u043E\u0434\u043D\u044B\u0435 \u0448\u043B\u044E\u0437\u044B \u0438 \u0440\u0435\u0447\u043D\u043E\u0439 \u0444\u043B\u043E\u0442",color:"#60a5fa"},{id:"waterSupply",label:"\u0413\u043E\u0440\u0432\u043E\u0434\u043E\u043A\u0430\u043D\u0430\u043B \u0438 \u0442\u0435\u0445\u0432\u043E\u0434\u043E\u0441\u043D\u0430\u0431\u0436\u0435\u043D\u0438\u0435",color:"#34d399"},{id:"agroIrrigation",label:"\u0410\u0433\u0440\u043E-\u0438\u0440\u0440\u0438\u0433\u0430\u0446\u0438\u044F \u043F\u043E\u043B\u0435\u0439 \u0438 \u0442\u0435\u043F\u043B\u0438\u0446",color:"#84cc16"},{id:"aquaculture",label:"\u0424\u043E\u0440\u0435\u043B\u0435\u0432\u044B\u0435 \u0440\u044B\u0431\u0445\u043E\u0437\u044B \u0438 \u0430\u043A\u0432\u0430\u043A\u0443\u043B\u044C\u0442\u0443\u0440\u0430",color:"#fb923c"},{id:"ecoTourism",label:"\u042F\u0445\u0442-\u043C\u0430\u0440\u0438\u043D\u044B \u0438 \u043A\u0440\u0443\u0438\u0437\u043D\u044B\u0439 \u044D\u043A\u043E-\u0442\u0443\u0440\u0438\u0437\u043C",color:"#f472b6"},{id:"aggregateSales",label:"\u042D\u043A\u0441\u043F\u043E\u0440\u0442 \u0433\u0440\u0430\u043D\u0438\u0442\u043D\u043E\u0433\u043E \u0449\u0435\u0431\u043D\u044F \u0441 \u0432\u044B\u0435\u043C\u043E\u043A",color:"#cbd5e1"},{id:"carbonCredits",label:"\u0417\u0435\u043B\u0451\u043D\u044B\u0435 \u0443\u0433\u043B\u0435\u0440\u043E\u0434\u043D\u044B\u0435 \u0441\u0435\u0440\u0442\u0438\u0444\u0438\u043A\u0430\u0442\u044B CO\u2082",color:"#4ade80"},{id:"floodControl",label:"\u041F\u0440\u0435\u043C\u0438\u044F \u041C\u0427\u0421 \u0437\u0430 \u0441\u0440\u0435\u0437\u043A\u0443 \u043F\u0430\u0432\u043E\u0434\u043A\u043E\u0432",color:"#f87171"}],ka=class{constructor(t,e={}){this.hydro=t,this.callbacks=e,this.clock=new Fa({step:1/30,maxSteps:6}),this._rng=Yn(987654),this.hydrology=new Ba,this.resetEconomy()}resetEconomy(){this.cash=we.startingCash,this.loan=0,this.creative=!1,this.day=1,this.hour=8.5,this.weatherId="normal",this.weatherTimer=54,this.totalMW=0,this.pumpedConsumeMW=0,this.netDeliveredMW=0,this.gridLossPct=0,this.connectedDemandMW=0,this.totalCityDemandMW=0,this.suppliedCityMW=0,this.exportedMW=0,this.spotMultiplier=Sc(this.hour),this.incomePerSec=0,this.upkeepPerSec=0,this.netPerSec=0,this.totalEarned=0,this.totalMWhGenerated=0,this.totalCO2SavedTons=0,this.agroIrrigated=!1,this._seepageWarnCooldown=0,this._gaesStoredMWh=0,this.revenueRates={},this.revenueTotals={};for(let t of Oa)this.revenueRates[t.id]=0,this.revenueTotals[t.id]=0;this.completedMilestones=new Set,this.hydrology.reset(),this.cities=[],this.allBuildings=[],this.buildingsDirty=!0,this.powerLinesDirty=!0,this._initCities(),this._applyWeatherToHydro()}_initCities(){this.cities=[],this.allBuildings=[];let t=U.horizScale;for(let e=0;e<Ye.length;e++){let i=Ye[e],n=Yn(1e3+e*777),s=[];for(let c=1;c<=6;c++){let l=c*6+4,h=(8.5+(c-1)*8.4)*t;for(let u=0;u<l&&!(s.length>=78);u++){let d=u/l*Math.PI*2+c*.43+(n()-.5)*.16,f=h+(n()-.5)*2.2*t;if(f>i.plateauRadius*.92)continue;let g=i.x+Math.cos(d)*f,y=i.z+Math.sin(d)*f;if(Math.abs(g)>U.half*.94||Math.abs(y)>U.half*.94)continue;let p=this.hydro.sampleAtWorld(g,y);p.depth>.25||s.push({wx:g,wz:y,wy:p.bed,yaw:Math.round((d+Math.PI*.5)/(Math.PI*.5))*(Math.PI*.5)+(n()-.5)*.12,ring:c,occupied:!1,buildingIndex:-1})}}let o={...i,connected:!!i.connectedAtStart,population:i.startPop,level:1,levelName:"\u041F\u043E\u0441\u0451\u043B\u043E\u043A",satisfaction:.78,powerRatio:0,currentDemandMW:i.baseDemandMW,suppliedMW:0,growthProgress:.18,isFlooded:!1,irrigated:!1,lots:s,buildingIndices:[],blackoutTimer:0},a=i.archetype==="metropolis"?16:i.archetype==="industrial"||i.archetype==="smelter"?13:10;for(let c=0;c<a&&c<s.length;c++)this._spawnBuildingInCity(o,s[c],1,n);this._recalcCityTier(o),this.cities.push(o)}this.buildingsDirty=!0,this.powerLinesDirty=!0}_chooseBuildingArchetype(t,e,i){let s={civic:["res","mid","high","civ","util","sci"],industry:["ind","mid","res","util","civ"],agro:["agro","res","util"],alpine:["res","civ","sci","port"],smelter:["smlt","ind","util","mid"],tech:["dc","sci","high","mid","civ"],port:["port","mid","res","ind","civ"]}[t.archetype]||["res","mid","civ"],o=Mc.filter(a=>s.includes(a.cat));if(o.length===0)return Mc[0];if(e<=2&&t.level>=2){let a=o.filter(c=>c.hMax>=22||c.shape==="spire"||c.shape==="tower"||c.cat==="dc");if(a.length>0&&i()<.65)return a[Math.floor(i()*a.length)]}return o[Math.floor(i()*o.length)]}_spawnBuildingInCity(t,e,i=.05,n=this._rng){e.occupied=!0;let s=this._chooseBuildingArchetype(t,e.ring,n),o=Math.pow(U.horizScale,.56),a=Math.pow(U.elevScale,.68),c=s.w*(.86+n()*.28)*o,l=s.d*(.86+n()*.28)*o,h=(s.hMin+n()*(s.hMax-s.hMin))*a,u=Qi("city_facades",Math.floor(n()*1e3)+this.allBuildings.length*7),d=Qi("roofs_metals",Math.floor(n()*1e3)+this.allBuildings.length*13),f=s.shape==="cyl"||s.shape==="cool"?"silo":s.shape==="arch"||s.shape==="spire"?"dome":s.shape==="gable"?"gable":"flat",g={res:28,mid:135,high:380,civ:45,agro:22,ind:32,smlt:40,dc:26,port:48,util:18,sci:34},y=this.hydro.sampleAtWorld(e.wx,e.wz),p=this.allBuildings.length,m={index:p,cityId:t.id,kind:s.id,label:s.name,roofType:f,styleId:s.style+(n()<.45?32:0),shadeHex:u.hex,shadeR:u.r,shadeG:u.g,shadeB:u.b,roofR:d.r,roofG:d.g,roofB:d.b,wx:e.wx,wy:y.bed,wz:e.wz,yaw:e.yaw,sx:c,sy:h,sz:l,popGain:g[s.cat]||40,tier:t.level,anim:i,lit:1,tint:n()};return e.buildingIndex=p,this.allBuildings.push(m),t.buildingIndices.push(p),this.buildingsDirty=!0,m}_recalcCityTier(t){let e=t.buildingIndices.length;e>=46?(t.level=5,t.levelName="\u041C\u0435\u0433\u0430\u043F\u043E\u043B\u0438\u0441"):e>=32?(t.level=4,t.levelName="\u041A\u0440\u0443\u043F\u043D\u044B\u0439 \u0443\u0437\u0435\u043B"):e>=21?(t.level=3,t.levelName="\u0420\u0430\u0437\u0432\u0438\u0442\u044B\u0439 \u0433\u043E\u0440\u043E\u0434"):e>=13?(t.level=2,t.levelName="\u0413\u043E\u0440\u043E\u0434\u043E\u043A"):(t.level=1,t.levelName="\u041F\u043E\u0441\u0451\u043B\u043E\u043A")}connectCityGrid(t){let e=this.cities.find(n=>n.id===t);if(!e)return{ok:!1,reason:"\u0413\u043E\u0440\u043E\u0434 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D"};if(e.connected)return{ok:!1,reason:"\u0413\u043E\u0440\u043E\u0434 \u0443\u0436\u0435 \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0451\u043D \u043A \u044D\u043D\u0435\u0440\u0433\u043E\u0441\u0435\u0442\u0438"};let i=this.estimatePowerLineCost(e);return!this.creative&&this.cash<i?{ok:!1,reason:`\u041D\u0443\u0436\u043D\u043E ${i.toLocaleString("ru-RU")} \u20BD \u043D\u0430 \u0441\u0442\u0440\u043E\u0438\u0442\u0435\u043B\u044C\u0441\u0442\u0432\u043E \u041B\u042D\u041F`}:(this.creative||(this.cash-=i),e.connected=!0,this.powerLinesDirty=!0,this.callbacks.onNotify&&this.callbacks.onNotify(`\u2726 \u041C\u0430\u0433\u0438\u0441\u0442\u0440\u0430\u043B\u044C \u041B\u042D\u041F \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u0430 \u043A: ${e.name}!`,"good"),{ok:!0,cost:i,city:e})}estimatePowerLineCost(t){let e=Math.hypot(t.x-12*U.horizScale,t.z- -152*U.horizScale);for(let n of this.hydro.substations){let s=Math.hypot(t.x-n.wx,t.z-n.wz);s<e&&(e=s)}for(let n of this.hydro.turbines){let s=Math.hypot(t.x-n.wx,t.z-n.wz);s<e&&(e=s)}let i=e/U.horizScale;return Math.max(1900,Math.round(i*13.5))}sellAggregateBatch(){let t=this.hydro.rockStockpileM3*this.hydro.volPriceNorm;if(t<40)return{ok:!1,reason:"\u041D\u0430 \u0441\u043A\u043B\u0430\u0434\u0435 \u043C\u0430\u043B\u043E \u0449\u0435\u0431\u043D\u044F \u2014 \u043F\u0440\u043E\u0440\u043E\u0439\u0442\u0435 \u043A\u0430\u043D\u0430\u043B \u0438\u043B\u0438 \u0441\u043A\u0430\u043B\u044C\u043D\u0443\u044E \u0432\u044B\u0435\u043C\u043A\u0443!"};let e=.65,i=this.hydro.rockStockpileM3*e,n=t*e;this.hydro.rockStockpileM3-=i;let s=Math.round(n*we.aggregateSellPricePerM3*3.2);return this.earn(s),this.revenueTotals.aggregateSales+=s,{ok:!0,soldM3:Math.round(i),revenue:s}}canAfford(t){return this.creative||this.cash>=t}spend(t){return this.creative||t<=0?!0:this.cash<t?!1:(this.cash-=t,!0)}earn(t){t>0&&(this.cash+=t,this.totalEarned+=t)}takeGreenLoan(){return this.loan>=we.maxLoan?{ok:!1,reason:"\u041B\u0438\u043C\u0438\u0442 \u0437\u0435\u043B\u0451\u043D\u044B\u0445 \u043E\u0431\u043B\u0438\u0433\u0430\u0446\u0438\u0439 \u0438\u0441\u0447\u0435\u0440\u043F\u0430\u043D"}:(this.loan+=we.loanChunk,this.cash+=we.loanChunk,{ok:!0,amount:we.loanChunk})}repayLoan(){if(this.loan<=0)return{ok:!1,reason:"\u041A\u0440\u0435\u0434\u0438\u0442\u043E\u0432 \u043D\u0435\u0442"};let t=Math.min(this.cash,Math.min(we.loanChunk,this.loan));return t<=100?{ok:!1,reason:"\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0441\u0440\u0435\u0434\u0441\u0442\u0432 \u0434\u043B\u044F \u043F\u043E\u0433\u0430\u0448\u0435\u043D\u0438\u044F"}:(this.cash-=t,this.loan-=t,{ok:!0,amount:t})}setWeather(t){qe[t]&&(this.weatherId=t,this._applyWeatherToHydro())}_applyWeatherToHydro(){let t=qe[this.weatherId]||qe.normal;this.hydro.inflowMult=t.inflowMult,this.hydro.rainRate=t.rainRate}update(t){this.clock.advance(t,(i,n)=>this._simulateFixedStep(i,n));let e=!1;for(let i=0;i<this.allBuildings.length;i++){let n=this.allBuildings[i];n.anim<1&&(n.anim=Math.min(1,n.anim+t*1.4),e=!0)}e&&(this.buildingsDirty=!0)}_simulateFixedStep(t,e){let i=24/U.dayLengthSec;if(this.hour+=t*i,this.hour>=24&&(this.hour-=24,this.day+=1),this._seepageWarnCooldown>0&&(this._seepageWarnCooldown-=t),this.weatherTimer-=t,this.weatherTimer<=0){this.weatherTimer=42+this._rng()*34;let ht=qe[this.weatherId]||qe.normal,at=this._rng(),Lt=0;for(let[Kt,qt]of Object.entries(ht.next))if(Lt+=qt,at<=Lt){if(Kt!==this.weatherId){this.weatherId=Kt,this._applyWeatherToHydro();let $t=qe[Kt];this.callbacks.onNotify&&this.callbacks.onNotify(`${$t.icon} \u0413\u0438\u0434\u0440\u043E\u043F\u0440\u043E\u0433\u043D\u043E\u0437: ${$t.label} (\u043F\u0440\u0438\u0442\u043E\u043A \u0440\u0435\u043A \xD7${$t.inflowMult.toFixed(2)})`,Kt==="flood"?"warn":"info")}break}}this.spotMultiplier=Sc(this.hour),this.hydro.isOffPeakNight=this.hour>=.2&&this.hour<5.8;let n=this.cities.filter(ht=>ht.connected).length;this.hydrology.step(t,this.hydro,this.hour,this.weatherId,n,this.agroIrrigated);for(let ht=0;ht<this.hydro.turbines.length;ht++){let at=this.hydro.turbines[ht];if(at.autoDispatch&&!at.isPumpingNow){let Lt=this.spotMultiplier>=1.45?1:this.spotMultiplier<.7?.28:.76;at.throttle+=(Lt-at.throttle)*J(t*1.8,0,1)}at.cavitation>.25&&(at.condition=Math.max(.45,at.condition-at.cavitation*.0012*t))}let s=0,o=0,a=0,c=0;for(let ht=0;ht<this.hydro.turbines.length;ht++){let at=this.hydro.turbines[ht];s+=at.powerMW,o+=at.pumpConsumeMW||0,(at.grossHead>at.spec.minHead*.5||at.isPumpingNow)&&(a+=at.spec.ratedMW),c+=at.spec.upkeepPerSec}c+=this.hydro.substations.length*4,c+=this.hydro.navLocks.length*3,c+=this.hydro.fishFarms.length*2,this.totalMW=s,this.pumpedConsumeMW=o;let l=s*t/3600;this.totalMWhGenerated+=l,this.totalCO2SavedTons+=l*.82*120;let h=1/Math.pow(U.powerScale,.72),d=this.hydro.substations.length>0?_e.gridLossWithSub:s>3*U.powerScale?_e.baseGridLossNoSub:.06;this.gridLossPct=Math.round(d*100);let f=s*(1-d);this.netDeliveredMW=f,this.hydro.totalSeepageQ>2.2*U.flowScale&&this._seepageWarnCooldown<=0&&(this._seepageWarnCooldown=38,this.callbacks.onNotify&&this.callbacks.onNotify("\u25B2 \u0424\u0438\u043B\u044C\u0442\u0440\u0430\u0446\u0438\u044F \u0414\u0430\u0440\u0441\u0438 \u043F\u043E\u0434 \u043F\u043E\u0434\u043E\u0448\u0432\u043E\u0439 \u0432\u044B\u0441\u043E\u043A\u043E\u0439 \u043F\u043B\u043E\u0442\u0438\u043D\u044B! \u0423\u043A\u0440\u0435\u043F\u0438\u0442\u0435 \u0441\u0442\u0432\u043E\u0440 \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u043E\u043C [6] \u041A\u043E\u043D\u0442\u0440\u0444\u043E\u0440\u0441 / \u0426\u0435\u043C\u0435\u043D\u0442\u0430\u0446\u0438\u044F.","warn")),e%10===0&&this._checkHydroCityInteractions();let g=this.hour,y=g>=17&&g<22.5?1.32:g>=6.5&&g<11?1.15:g<6?.74:1,p=0,m=0;for(let ht=0;ht<this.cities.length;ht++){let at=this.cities[ht],Lt=at.buildingIndices.length;at.currentDemandMW=(at.baseDemandMW+Lt*at.demandPerBuilding)*y,p+=at.currentDemandMW,at.connected&&(m+=at.currentDemandMW)}this.totalCityDemandMW=p,this.connectedDemandMW=m;let _=f,M=0,v=0,w=0,S=!1;for(let ht=0;ht<this.cities.length;ht++){let at=this.cities[ht];if(at.isFlooded&&(S=!0),!at.connected){at.suppliedMW=0,at.powerRatio=0,at.satisfaction=Math.max(.35,at.satisfaction-t*.01);continue}let Lt=Math.min(at.currentDemandMW,_);if(_=Math.max(0,_-Lt),at.suppliedMW=Lt,at.powerRatio=at.currentDemandMW>1e-4?J(Lt/at.currentDemandMW,0,1):1,M+=Lt,at.archetype==="smelter"||at.archetype==="tech"||at.archetype==="industrial"?w+=Lt*h*we.baseRatePerMWSec*(.85+.45*this.spotMultiplier)*at.tariffBonus*we.industrialPPAMultiplier:v+=Lt*h*we.baseRatePerMWSec*this.spotMultiplier*at.tariffBonus,at.powerRatio>=.55&&!at.isFlooded){at.blackoutTimer=0,at.satisfaction=Math.min(1,at.satisfaction+t*.05);let qt=at.needsIrrigation&&at.irrigated?1.82:1,$t=.38+.96*at.powerRatio;at.growthProgress+=t/14*$t*qt,at.growthProgress>=1&&(at.growthProgress-=1,this._growCityOneStep(at))}else at.satisfaction=Math.max(.15,at.satisfaction-t*(at.isFlooded?.08:.025)),s>.05&&at.powerRatio<.4&&(at.blackoutTimer+=t)}let T=Math.max(0,f-M),x=this.cities.some(ht=>ht.connected);this.exportedMW=x?T:0,this.exportedMW>0&&(v+=this.exportedMW*h*we.baseRatePerMWSec*this.spotMultiplier*we.overSupplyExportFactor);let E=x?a*h*we.capacityPaymentPerMWSec:0,C=0;if(o>.05)this._gaesStoredMWh+=o*h*t*.84,c+=o*h*we.baseRatePerMWSec*we.pumpedNightBuyFactor;else if(this._gaesStoredMWh>.01&&this.spotMultiplier>=1.35&&s>.5){let ht=Math.min(this._gaesStoredMWh,s*h*t*.65);this._gaesStoredMWh-=ht,C=ht/t*we.baseRatePerMWSec*1.48}let R=this.cities.some(ht=>ht.archetype==="port"&&ht.connected),L=J(this.hydrology.wetSurfaceHectares/Math.max(1.5,4*U.horizScale),.35,1.8),D=(this.hydro.navLocks.length*we.navLockTollPerSec+(R?32:8))*L;for(let ht=0;ht<this.hydro.navLocks.length;ht++)this.hydro.navLocks[ht].cyclePhase=(this.hydro.navLocks[ht].cyclePhase+t*.18)%1;let I=this.cities.reduce((ht,at)=>ht+(at.connected?at.population:0),0)/1e3,F=this.hydro.damCellCount>4,z=(F?1:.35)*I*we.municipalWaterPerKPopSec,G=this.cities.find(ht=>ht.archetype==="agro"),K=G?1+G.level*.28:1,N=this.agroIrrigated?we.irrigationBonusPerSec*K:0,$=J(1.18-this.hydro.meanReservoirTurbidity*.85,.45,1.25),Q=this.hydro.fishFarms.length*we.fishFarmIncomePerSec*$,ot=this.cities.find(ht=>ht.archetype==="resort"),st=ot&&ot.connected?2.1:1,It=F?J(this.hydrology.wetSurfaceHectares/(8*U.horizScale*U.horizScale),.25,2.5):.15,ut=we.ecoTourismPerMarinaSec*It*st+this.hydro.fishFarms.length*14,Pt=0,q=450/this.hydro.volPriceNorm;if(this.hydro.rockStockpileM3>q){let ht=Math.min(this.hydro.rockStockpileM3-q,8.5/this.hydro.volPriceNorm*t);this.hydro.rockStockpileM3-=ht,Pt=ht*this.hydro.volPriceNorm/t*we.aggregateSellPricePerM3}let Y=s*h*we.carbonCreditPerMWSec,vt=(this.weatherId==="rain"||this.weatherId==="flood")&&F&&!S?we.floodProtectionBonusSec*(this.weatherId==="flood"?1.65:1):0,lt=this.revenueRates;lt.spotEnergy=v,lt.industrialPPA=w,lt.capacityMarket=E,lt.gaesArbitrage=C,lt.navigationLocks=D,lt.waterSupply=z,lt.agroIrrigation=N,lt.aquaculture=Q,lt.ecoTourism=ut,lt.aggregateSales=Pt,lt.carbonCredits=Y,lt.floodControl=vt;let kt=0;for(let ht of Oa){let at=lt[ht.id]||0;kt+=at,this.revenueTotals[ht.id]+=at*t}let le=this.loan*we.loanInterestPerSec;this.suppliedCityMW=M,this.incomePerSec=kt,this.upkeepPerSec=c+le,this.netPerSec=this.incomePerSec-this.upkeepPerSec;let Xt=this.netPerSec*t;Xt>=0?this.earn(Xt):this.creative||(this.cash=Math.max(0,this.cash+Xt)),e%15===0&&this._checkMilestones()}_checkHydroCityInteractions(){let t=U.horizScale;for(let e=0;e<this.cities.length;e++){let i=this.cities[e],n=0,s=Math.max(1,Math.floor(i.lots.length/8)),o=0;for(let c=0;c<i.lots.length;c+=s){let l=this.hydro.sampleAtWorld(i.lots[c].wx,i.lots[c].wz);o++,l.depth>.48*U.elevScale&&n++}let a=i.isFlooded;if(i.isFlooded=o>0&&n/o>=.25,i.isFlooded&&!a&&this.callbacks.onNotify&&this.callbacks.onNotify(`! \u0412\u043D\u0438\u043C\u0430\u043D\u0438\u0435! \u041F\u043E\u0434\u0442\u043E\u043F\u043B\u0435\u043D\u044B \u043A\u0432\u0430\u0440\u0442\u0430\u043B\u044B \u0433. ${i.name}! \u041E\u0442\u043A\u0440\u043E\u0439\u0442\u0435 \u0432\u043E\u0434\u043E\u0441\u0431\u0440\u043E\u0441 \u0438\u043B\u0438 \u0443\u043A\u0440\u0435\u043F\u0438\u0442\u0435 \u0431\u0435\u0440\u0435\u0433!`,"danger"),i.needsIrrigation&&i.irrigationTarget){let c=i.irrigationTarget,l=!1,h=12*t,u=[[0,0],[-h,-h*.7],[h,h*.7],[-h*.8,h*.8],[h*.8,-h*.8]];for(let d=0;d<u.length;d++)if(this.hydro.sampleAtWorld(c.x+u[d][0],c.z+u[d][1]).depth>.16){l=!0;break}l&&!i.irrigated?(i.irrigated=!0,this.agroIrrigated=!0,this.callbacks.onNotify&&this.callbacks.onNotify("\u25C8 \u0412\u043E\u0434\u0430 \u043F\u0440\u0438\u0448\u043B\u0430 \u0432 \u043E\u0440\u043E\u0441\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u0431\u0430\u0441\u0441\u0435\u0439\u043D \u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u044B! \u0424\u0435\u0440\u043C\u044B \u0438 \u044D\u043B\u0435\u0432\u0430\u0442\u043E\u0440\u044B \u043F\u043E\u0448\u043B\u0438 \u0432 \u0440\u043E\u0441\u0442!","good")):!l&&i.irrigated&&(i.irrigated=!1,this.agroIrrigated=!1)}}}_growCityOneStep(t){let e=t.lots.find(n=>!n.occupied);if(e){let n=this._spawnBuildingInCity(t,e,.05,this._rng);t.population+=n.popGain||95;let s=t.level;this._recalcCityTier(t),t.level>s&&this.callbacks.onNotify&&this.callbacks.onNotify(`\u2605 ${t.name} \u0432\u044B\u0440\u043E\u0441 \u0434\u043E \u0441\u0442\u0430\u0442\u0443\u0441\u0430 \xAB${t.levelName}\xBB (${t.population.toLocaleString("ru-RU")} \u0436\u0438\u0442.)!`,"good");return}let i=Math.pow(U.elevScale,.78);for(let n=0;n<t.buildingIndices.length;n++){let s=this.allBuildings[t.buildingIndices[n]];if(s.sy<18*i){s.sy=Math.min(36*i,s.sy*1.55),s.sx*=1.12,s.sz*=1.12,s.styleId=9,s.roofType="flat",s.anim=.35,t.population+=210,this.buildingsDirty=!0;return}}}_checkMilestones(){let t=this.cities.reduce((n,s)=>n+s.population,0),e=this.cities.filter(n=>n.connected).length,i={totalMW:this.totalMW,excavatedNormM3:this.hydro.excavatedNormM3,agroIrrigated:this.agroIrrigated,connectedCities:e,totalPopulation:t,reinforcedCells:this.hydro.reinforcedCellCount,substations:this.hydro.substations.length,navLocks:this.hydro.navLocks.length,fishFarms:this.hydro.fishFarms.length};for(let n=0;n<Sr.length;n++){let s=Sr[n];this.completedMilestones.has(s.id)||s.check(i)&&(this.completedMilestones.add(s.id),this.earn(s.reward),this.callbacks.onMilestone&&this.callbacks.onMilestone(s))}}getSummary(){let t=this.cities.reduce((i,n)=>i+n.population,0),e=Ld(this.hour);return{cash:this.cash,loan:this.loan,day:this.day,hour:this.hour,weather:qe[this.weatherId]||qe.normal,spotMultiplier:this.spotMultiplier,periodLabel:e.label,periodClass:e.cls,totalMW:this.totalMW,pumpedConsumeMW:this.pumpedConsumeMW,netDeliveredMW:this.netDeliveredMW,gridLossPct:this.gridLossPct,connectedDemandMW:this.connectedDemandMW,totalCityDemandMW:this.totalCityDemandMW,suppliedCityMW:this.suppliedCityMW,exportedMW:this.exportedMW,incomePerSec:this.incomePerSec,upkeepPerSec:this.upkeepPerSec,netPerSec:this.netPerSec,totalPopulation:t,totalBuildings:this.allBuildings.length,co2SavedTons:this.totalCO2SavedTons,soilStockpileM3:this.hydro.soilStockpileM3,rockStockpileM3:this.hydro.rockStockpileM3,pendingPourM3:this.hydro.pendingPourVolumeM3,maxDamStress:this.hydro.maxDamStress,seepageQ:this.hydro.totalSeepageQ,agroIrrigated:this.agroIrrigated,substationsCount:this.hydro.substations.length,navLocksCount:this.hydro.navLocks.length,fishFarmsCount:this.hydro.fishFarms.length,revenueRates:this.revenueRates,revenueTotals:this.revenueTotals,waterReport:this.hydrology.getReport(this.hydro,this.hour)}}};function Fg(){let r=[{group:"hydro_optics",groupLabel:"\u0413\u0438\u0434\u0440\u043E\u0434\u0438\u043D\u0430\u043C\u0438\u043A\u0430, 3D-\u043F\u0435\u0440\u0435\u043B\u0438\u0432\u044B \u0438 \u043E\u043F\u0442\u0438\u043A\u0430 \u0432\u043E\u0434\u044B",items:["\u0412\u043E\u0434\u043E\u043F\u0430\u0434\u043D\u0430\u044F \u043F\u0435\u043B\u0435\u043D\u0430 \u043F\u0435\u0440\u0435\u043B\u0438\u0432\u0430 \u043F\u043B\u043E\u0442\u0438\u043D\u044B (\u0431\u044B\u0441\u0442\u0440\u0430\u044F)","\u0412\u043E\u0434\u043E\u043F\u0430\u0434\u043D\u0430\u044F \u043F\u0435\u043B\u0435\u043D\u0430 \u043F\u0435\u0440\u0435\u043B\u0438\u0432\u0430 (\u0441\u0440\u0435\u0434\u043D\u0438\u0439 \u043D\u0430\u043F\u043E\u0440)","\u0422\u043E\u043D\u043A\u0430\u044F \u043F\u0435\u0440\u0435\u043B\u0438\u0432\u043D\u0430\u044F \u043A\u0440\u043E\u043C\u043A\u0430 \u0433\u0440\u0435\u0431\u043D\u044F","\u0421\u0442\u0440\u0443\u044F \u043E\u0442\u043A\u0440\u044B\u0442\u043E\u0433\u043E \u043B\u043E\u0442\u043A\u0430 \u0432\u043E\u0434\u043E\u0441\u0431\u0440\u043E\u0441\u0430","\u0422\u0440\u0430\u043C\u043F\u043B\u0438\u043D\u043D\u044B\u0439 \u043E\u0442\u0440\u044B\u0432 \u043F\u043E\u0442\u043E\u043A\u0430 \u0441 \u043D\u043E\u0441\u043A\u0430 \u0432\u043E\u0434\u043E\u0441\u0431\u0440\u043E\u0441\u0430","\u041A\u0438\u043F\u044F\u0449\u0438\u0439 \u0433\u0438\u0434\u0440\u0430\u0432\u043B\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u043F\u0440\u044B\u0436\u043E\u043A \u0432\u043D\u0438\u0437\u0443 \u043F\u043B\u043E\u0442\u0438\u043D\u044B","\u0414\u043B\u0438\u043D\u043D\u043E\u0432\u043E\u043B\u043D\u043E\u0432\u0430\u044F \u0432\u0435\u0442\u0440\u043E\u0432\u0430\u044F \u0437\u044B\u0431\u044C \u0432\u043E\u0434\u043E\u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0430","\u041A\u043E\u0440\u043E\u0442\u043A\u0430\u044F \u043A\u0430\u043F\u0438\u043B\u043B\u044F\u0440\u043D\u0430\u044F \u0440\u044F\u0431\u044C \u0440\u0435\u0447\u043D\u043E\u0433\u043E \u043F\u043B\u0451\u0441\u0430","\u041F\u043E\u043F\u0435\u0440\u0435\u0447\u043D\u0430\u044F \u0438\u043D\u0442\u0435\u0440\u0444\u0435\u0440\u0435\u043D\u0446\u0438\u044F \u0432\u043E\u043B\u043D \u0432 \u043A\u0430\u043D\u044C\u043E\u043D\u0435","\u0414\u0432\u043E\u0439\u043D\u0430\u044F \u0441\u043E\u043B\u043D\u0435\u0447\u043D\u0430\u044F \u043A\u0430\u0443\u0441\u0442\u0438\u043A\u0430 \u043C\u0435\u043B\u043A\u043E\u0432\u043E\u0434\u044C\u044F (\u0441\u043B\u043E\u0439 A)","\u0414\u0432\u043E\u0439\u043D\u0430\u044F \u0441\u043E\u043B\u043D\u0435\u0447\u043D\u0430\u044F \u043A\u0430\u0443\u0441\u0442\u0438\u043A\u0430 \u043C\u0435\u043B\u043A\u043E\u0432\u043E\u0434\u044C\u044F (\u0441\u043B\u043E\u0439 B)","\u041A\u0440\u0443\u0436\u0435\u0432\u043D\u0430\u044F \u043F\u0435\u043D\u0430 \u043D\u0430\u043A\u0430\u0442\u0430 \u043D\u0430 \u0431\u0435\u0440\u0435\u0433","\u0412\u0438\u0445\u0440\u0435\u0432\u0430\u044F \u0434\u043E\u0440\u043E\u0436\u043A\u0430 \u041A\u0430\u0440\u043C\u0430\u043D\u0430 \u0437\u0430 \u0443\u0441\u0442\u043E\u044F\u043C\u0438","\u0411\u0435\u043B\u044B\u0439 \u043F\u0435\u043D\u043D\u044B\u0439 \u0432\u0430\u043B \u043F\u0435\u0440\u0435\u043A\u0430\u0442\u0430 \u0433\u043E\u0440\u043D\u043E\u0439 \u0440\u0435\u043A\u0438","\u0411\u0443\u0440\u0443\u043D \u043E\u0442\u0432\u043E\u0434\u044F\u0449\u0435\u0433\u043E \u043A\u0430\u043D\u0430\u043B\u0430 \u0442\u0443\u0440\u0431\u0438\u043D\u044B \u041A\u0430\u043F\u043B\u0430\u043D\u0430","\u0412\u044B\u0441\u043E\u043A\u043E\u043D\u0430\u043F\u043E\u0440\u043D\u044B\u0439 \u0432\u044B\u0431\u0440\u043E\u0441 \u0442\u0443\u0440\u0431\u0438\u043D\u044B \u0424\u0440\u044D\u043D\u0441\u0438\u0441\u0430","\u041D\u043E\u0447\u043D\u043E\u0439 \u043E\u0431\u0440\u0430\u0442\u043D\u044B\u0439 \u0432\u043E\u0434\u043E\u0432\u043E\u0440\u043E\u0442 \u0432\u0441\u0430\u0441\u044B\u0432\u0430\u043D\u0438\u044F \u0413\u0410\u042D\u0421","\u0420\u0430\u0434\u0443\u0436\u043D\u0430\u044F \u0432\u043E\u0434\u044F\u043D\u0430\u044F \u043F\u044B\u043B\u044C \u0443 \u043E\u0441\u043D\u043E\u0432\u0430\u043D\u0438\u044F \u0432\u043E\u0434\u043E\u043F\u0430\u0434\u0430","\u0420\u0430\u0437\u043C\u044B\u0432 \u0433\u0440\u0443\u043D\u0442\u043E\u0432\u043E\u0439 \u043F\u0435\u0440\u0435\u043C\u044B\u0447\u043A\u0438 \u043F\u0430\u0432\u043E\u0434\u043A\u043E\u043C","\u041E\u0441\u0435\u0434\u0430\u043D\u0438\u0435 \u0438\u043B\u0438\u0441\u0442\u043E\u0433\u043E \u0448\u043B\u0435\u0439\u0444\u0430 \u0432 \u0442\u0438\u0445\u043E\u043C \u0437\u0430\u043B\u0438\u0432\u0435","\u0411\u043B\u0438\u043A \u0434\u043E\u0440\u043E\u0436\u043A\u0438 \u0441\u043E\u043B\u043D\u0446\u0430 \u043F\u043E \u0437\u0430\u043A\u043E\u043D\u0430\u043C \u0424\u0440\u0435\u043D\u0435\u043B\u044F","\u041B\u0443\u043D\u043D\u0430\u044F \u0441\u0435\u0440\u0435\u0431\u0440\u0438\u0441\u0442\u0430\u044F \u0434\u043E\u0440\u043E\u0436\u043A\u0430 \u043D\u0430 \u0432\u043E\u0434\u0435 \u043D\u043E\u0447\u044C\u044E","\u0412\u043E\u043B\u043D\u043E\u0432\u043E\u0435 \u043A\u0430\u0447\u0430\u043D\u0438\u0435 \u043F\u043E\u0432\u0435\u0440\u0445\u043D\u043E\u0441\u0442\u0438 \u043F\u0440\u0438 \u043B\u0438\u0432\u043D\u0435","\u041A\u0440\u0443\u0433\u0438 \u043E\u0442 \u043A\u0430\u043F\u0435\u043B\u044C \u0448\u0442\u043E\u0440\u043C\u043E\u0432\u043E\u0433\u043E \u0434\u043E\u0436\u0434\u044F","\u041F\u0443\u043B\u044C\u0441\u0430\u0446\u0438\u044F \u0440\u043E\u0434\u043D\u0438\u043A\u043E\u0432\u043E\u0433\u043E \u043A\u043B\u044E\u0447\u0430 \u0432 \u0432\u0435\u0440\u0445\u043E\u0432\u044C\u0435 \u0411\u044B\u0441\u0442\u0440\u0438\u0446\u044B","\u0422\u0430\u043B\u044B\u0439 \u043F\u043E\u0442\u043E\u043A \u043B\u0435\u0434\u043D\u0438\u043A\u043E\u0432\u043E\u0433\u043E \u0440\u0443\u0447\u044C\u044F \u0421\u0435\u0440\u0435\u0431\u0440\u044F\u043D\u043A\u0438","\u0421\u0442\u0440\u0435\u043C\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u0441\u043B\u0438\u0432 \u0433\u043E\u0440\u043D\u043E\u0433\u043E \u0440\u0443\u0447\u044C\u044F \u0413\u0440\u0435\u043C\u0443\u0447\u0435\u0433\u043E","\u041F\u043E\u0434\u044A\u0451\u043C \u0437\u0435\u0440\u043A\u0430\u043B\u0430 \u0432\u0435\u0440\u0445\u043D\u0435\u0433\u043E \u0431\u044C\u0435\u0444\u0430 \u043F\u0440\u0438 \u043D\u0430\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u0438","\u0421\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u0437\u0435\u0440\u043A\u0430\u043B\u0430 \u0431\u044C\u0435\u0444\u0430 \u0432 \u0432\u0435\u0447\u0435\u0440\u043D\u0438\u0439 \u043F\u0438\u043A","\u0424\u0438\u043B\u044C\u0442\u0440\u0430\u0446\u0438\u043E\u043D\u043D\u044B\u0435 \u0441\u0442\u0440\u0443\u0439\u043A\u0438 \u043F\u043E\u0434 \u043D\u0435\u0446\u0435\u043C\u0435\u043D\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u043E\u0439 \u0434\u0430\u043C\u0431\u043E\u0439","\u041D\u0430\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u0435 \u043E\u0440\u043E\u0441\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0433\u043E \u043A\u0430\u043D\u0430\u043B\u0430 \u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u044B","\u0421\u0432\u043E\u0431\u043E\u0434\u043D\u044B\u0439 \u043D\u0430\u043A\u0430\u0442 \u0443\u0441\u0442\u044C\u044F \u0440\u0435\u043A\u0438 \u0432 \u044E\u0436\u043D\u044B\u0439 \u0437\u0430\u043B\u0438\u0432"]},{group:"hydro_plant",groupLabel:"\u041C\u0435\u0445\u0430\u043D\u0438\u0437\u043C\u044B \u0413\u042D\u0421, \u0413\u0410\u042D\u0421 \u0438 \u043F\u043E\u0434\u0441\u0442\u0430\u043D\u0446\u0438\u0439 \u041E\u0420\u0423",items:["\u0412\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u0440\u0430\u0431\u043E\u0447\u0435\u0433\u043E \u043A\u043E\u043B\u0435\u0441\u0430 \u041A\u0430\u043F\u043B\u0430\u043D\u0430 (\u043D\u043E\u043C\u0438\u043D\u0430\u043B)","\u0412\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u0440\u0430\u0431\u043E\u0447\u0435\u0433\u043E \u043A\u043E\u043B\u0435\u0441\u0430 \u041A\u0430\u043F\u043B\u0430\u043D\u0430 (\u0444\u043E\u0440\u0441\u0430\u0436)","\u0412\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u0440\u0430\u0434\u0438\u0430\u043B\u044C\u043D\u043E-\u043E\u0441\u0435\u0432\u043E\u0439 \u0442\u0443\u0440\u0431\u0438\u043D\u044B \u0424\u0440\u044D\u043D\u0441\u0438\u0441\u0430","\u0422\u0443\u0440\u0431\u0438\u043D\u043D\u044B\u0439 \u0445\u043E\u0434 \u043E\u0431\u0440\u0430\u0442\u0438\u043C\u043E\u0439 \u0433\u0438\u0434\u0440\u043E\u043C\u0430\u0448\u0438\u043D\u044B \u0413\u0410\u042D\u0421","\u0420\u0435\u0432\u0435\u0440\u0441\u0438\u0432\u043D\u043E\u0435 \u0432\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u043D\u0430\u0441\u043E\u0441\u0430 \u0413\u0410\u042D\u0421 (\u0437\u0430\u043A\u0430\u0447\u043A\u0430 \u043D\u043E\u0447\u044C\u044E)","\u041F\u0443\u043B\u044C\u0441\u0430\u0446\u0438\u044F \u0438\u043D\u0434\u0438\u043A\u0430\u0442\u043E\u0440\u0430 \u043C\u043E\u0449\u043D\u043E\u0441\u0442\u0438 \u043D\u0430 \u043A\u0440\u044B\u0448\u0435 \u043C\u0430\u0448\u0437\u0430\u043B\u0430","\u0425\u043E\u0434 \u043C\u043E\u0441\u0442\u043E\u0432\u043E\u0433\u043E \u043A\u043E\u0437\u043B\u043E\u0432\u043E\u0433\u043E \u043A\u0440\u0430\u043D\u0430 \u043F\u043E \u0433\u0440\u0435\u0431\u043D\u044E \u0413\u042D\u0421","\u041F\u043E\u0434\u044A\u0451\u043C \u043A\u0440\u044E\u043A\u0430 \u043A\u043E\u0437\u043B\u043E\u0432\u043E\u0433\u043E \u043A\u0440\u0430\u043D\u0430 \u043D\u0430\u0434 \u0448\u0430\u0445\u0442\u043E\u0439 \u0442\u0443\u0440\u0431\u0438\u043D\u044B","\u041F\u043B\u0430\u0432\u043D\u043E\u0435 \u043E\u0442\u043A\u0440\u044B\u0442\u0438\u0435 \u0441\u0435\u0433\u043C\u0435\u043D\u0442\u043D\u043E\u0433\u043E \u0437\u0430\u0442\u0432\u043E\u0440\u0430 \u0432\u043E\u0434\u043E\u0441\u0431\u0440\u043E\u0441\u0430","\u0410\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u043E\u0435 \u043F\u0440\u0438\u043A\u0440\u044B\u0442\u0438\u0435 \u0437\u0430\u0442\u0432\u043E\u0440\u0430 \u043F\u043E \u0443\u0440\u043E\u0432\u043D\u044E \u0412\u0411","\u0425\u043E\u0434 \u0433\u0440\u0430\u0431\u043B\u0435\u0439 \u0441\u043E\u0440\u043E\u043E\u0447\u0438\u0441\u0442\u043D\u043E\u0439 \u043C\u0430\u0448\u0438\u043D\u044B \u0432\u043E\u0434\u043E\u043F\u0440\u0438\u0451\u043C\u043D\u0438\u043A\u0430","\u041C\u0438\u043A\u0440\u043E-\u0432\u0438\u0431\u0440\u0430\u0446\u0438\u044F \u0441\u0442\u0430\u043B\u044C\u043D\u044B\u0445 \u043D\u0430\u043F\u043E\u0440\u043D\u044B\u0445 \u0432\u043E\u0434\u043E\u0432\u043E\u0434\u043E\u0432","\u0421\u0431\u0440\u043E\u0441 \u0430\u044D\u0440\u0430\u0446\u0438\u043E\u043D\u043D\u044B\u0445 \u043F\u0443\u0437\u044B\u0440\u0435\u0439 \u0432 \u043E\u0442\u0441\u0430\u0441\u044B\u0432\u0430\u044E\u0449\u0435\u0439 \u0442\u0440\u0443\u0431\u0435","\u0422\u0435\u043F\u043B\u043E\u0432\u043E\u0435 \u0434\u0440\u043E\u0436\u0430\u043D\u0438\u0435 \u043D\u0430\u0434 \u0442\u0440\u0430\u043D\u0441\u0444\u043E\u0440\u043C\u0430\u0442\u043E\u0440\u0430\u043C\u0438 220 \u043A\u0412","\u041A\u043E\u0440\u043E\u043D\u043D\u043E\u0435 \u0441\u0432\u0435\u0447\u0435\u043D\u0438\u0435 \u0433\u0438\u0440\u043B\u044F\u043D\u0434 \u0438\u0437\u043E\u043B\u044F\u0442\u043E\u0440\u043E\u0432 \u041E\u0420\u0423","\u041F\u0440\u043E\u0432\u0438\u0441 \u043F\u0440\u043E\u0432\u043E\u0434\u043E\u0432 \u041B\u042D\u041F \u0441 \u0432\u0435\u0442\u0440\u043E\u0432\u044B\u043C \u0440\u0430\u0441\u043A\u0430\u0447\u0438\u0432\u0430\u043D\u0438\u0435\u043C","\u0411\u0435\u0433\u0443\u0449\u0438\u0439 \u0438\u043C\u043F\u0443\u043B\u044C\u0441 \u043D\u0430\u0433\u0440\u0443\u0437\u043A\u0438 \u043F\u043E \u043C\u0430\u0433\u0438\u0441\u0442\u0440\u0430\u043B\u0438 \u041B\u042D\u041F","\u0410\u0432\u0430\u0440\u0438\u0439\u043D\u044B\u0439 \u043A\u0440\u0430\u0441\u043D\u044B\u0439 \u043C\u0430\u044F\u043A \u043A\u0430\u0432\u0438\u0442\u0430\u0446\u0438\u0438 \u0433\u0438\u0434\u0440\u043E\u0430\u0433\u0440\u0435\u0433\u0430\u0442\u0430","\u0417\u0435\u043B\u0451\u043D\u044B\u0439 \u043C\u0430\u044F\u043A \u0441\u0438\u043D\u0445\u0440\u043E\u043D\u0438\u0437\u0430\u0446\u0438\u0438 \u0441 \u0441\u0435\u0442\u044C\u044E 50,00 \u0413\u0446","\u0411\u0438\u0440\u044E\u0437\u043E\u0432\u044B\u0439 \u0438\u043D\u0434\u0438\u043A\u0430\u0442\u043E\u0440 \u043D\u043E\u0447\u043D\u043E\u0433\u043E \u043D\u0430\u043A\u043E\u043F\u043B\u0435\u043D\u0438\u044F \u0413\u0410\u042D\u0421","\u041E\u0441\u0432\u0435\u0449\u0435\u043D\u0438\u0435 \u0430\u0440\u043E\u0447\u043D\u044B\u0445 \u043E\u043A\u043E\u043D \u043C\u0430\u0448\u0438\u043D\u043D\u043E\u0433\u043E \u0437\u0430\u043B\u0430 \u0413\u042D\u0421","\u041F\u0440\u043E\u0436\u0435\u043A\u0442\u043E\u0440\u044B \u043F\u043E\u0434\u0441\u0432\u0435\u0442\u043A\u0438 \u043D\u0438\u0437\u043E\u0432\u043E\u0439 \u0433\u0440\u0430\u043D\u0438 \u043F\u043B\u043E\u0442\u0438\u043D\u044B","\u0420\u0430\u0431\u043E\u0442\u0430 \u0434\u0440\u0435\u043D\u0430\u0436\u043D\u044B\u0445 \u043D\u0430\u0441\u043E\u0441\u043E\u0432 \u043F\u043E\u0442\u0435\u0440\u043D\u044B \u043F\u043B\u043E\u0442\u0438\u043D\u044B","\u041A\u043E\u043D\u0442\u0440\u043E\u043B\u044C\u043D\u044B\u0439 \u043C\u0430\u044F\u0442\u043D\u0438\u043A-\u043E\u0442\u0432\u0435\u0441 \u043F\u0440\u043E\u0433\u0438\u0431\u0430 \u0432\u044B\u0441\u043E\u043A\u043E\u0439 \u043F\u043B\u043E\u0442\u0438\u043D\u044B","\u041F\u043E\u0432\u043E\u0440\u043E\u0442 \u0440\u0430\u0437\u044A\u0435\u0434\u0438\u043D\u0438\u0442\u0435\u043B\u0435\u0439 \u0448\u0438\u043D\u043D\u043E\u0433\u043E \u043C\u043E\u0441\u0442\u0430 \u041E\u0420\u0423","\u0412\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u0432\u0435\u043D\u0442\u0438\u043B\u044F\u0442\u043E\u0440\u043E\u0432 \u043C\u0430\u0441\u043B\u044F\u043D\u043E\u0433\u043E \u043E\u0445\u043B\u0430\u0436\u0434\u0435\u043D\u0438\u044F \u0422\u0420\u0414\u041D","\u0421\u0442\u0432\u043E\u0440\u0447\u0430\u0442\u044B\u0439 \u043A\u043B\u0430\u043F\u0430\u043D \u0445\u043E\u043B\u043E\u0441\u0442\u043E\u0433\u043E \u0432\u044B\u043F\u0443\u0441\u043A\u0430 \u0432\u043E\u0434\u044B","\u0413\u0430\u0441\u0438\u0442\u0435\u043B\u044C \u044D\u043D\u0435\u0440\u0433\u0438\u0438 \u0432 \u0432\u043E\u0434\u043E\u0431\u043E\u0439\u043D\u043E\u043C \u043A\u043E\u043B\u043E\u0434\u0446\u0435"]},{group:"fleet_locks",groupLabel:"\u0420\u0435\u0447\u043D\u043E\u0439 \u0444\u043B\u043E\u0442, \u044F\u0445\u0442\u044B \u0438 \u0441\u0443\u0434\u043E\u0445\u043E\u0434\u043D\u044B\u0435 \u0448\u043B\u044E\u0437\u044B",items:["\u0420\u0435\u0439\u0441 \u0440\u0443\u0434\u043E\u0432\u043E\u0437\u0430 \xAB\u0415\u043D\u0438\u0441\u0435\u0439\xBB \u043F\u043E \u0433\u043B\u0430\u0432\u043D\u043E\u043C\u0443 \u0444\u0430\u0440\u0432\u0430\u0442\u0435\u0440\u0443","\u0425\u043E\u0434 \u043D\u0435\u0444\u0442\u0435\u043D\u0430\u043B\u0438\u0432\u043D\u043E\u0433\u043E \u0442\u0430\u043D\u043A\u0435\u0440\u0430 \u0432 \u042E\u0436\u043D\u0443\u044E \u0413\u0430\u0432\u0430\u043D\u044C","\u0411\u0443\u043A\u0441\u0438\u0440-\u0442\u043E\u043B\u043A\u0430\u0447 \u0441 \u0431\u0430\u0440\u0436\u0435\u0439 \u0433\u0440\u0430\u043D\u0438\u0442\u043D\u043E\u0433\u043E \u0449\u0435\u0431\u043D\u044F","\u0411\u0435\u043B\u043E\u0441\u043D\u0435\u0436\u043D\u044B\u0439 \u043A\u0440\u0443\u0438\u0437\u043D\u044B\u0439 \u0442\u0435\u043F\u043B\u043E\u0445\u043E\u0434 \u043F\u043E \u0432\u043E\u0434\u043E\u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0443","\u041F\u0430\u0440\u0443\u0441\u043D\u0430\u044F \u0440\u0435\u0433\u0430\u0442\u0430 \u044F\u0445\u0442 \u0443 \u041B\u0430\u0437\u0443\u0440\u043D\u043E\u0433\u043E \u0411\u0435\u0440\u0435\u0433\u0430 (\u0433\u0430\u043B\u0441 \u043B\u0435\u0432\u044B\u0439)","\u041F\u0430\u0440\u0443\u0441\u043D\u0430\u044F \u0440\u0435\u0433\u0430\u0442\u0430 \u044F\u0445\u0442 (\u0433\u0430\u043B\u0441 \u043F\u0440\u0430\u0432\u044B\u0439 \u0441 \u043A\u0440\u0435\u043D\u043E\u043C)","\u0421\u043A\u043E\u0440\u043E\u0441\u0442\u043D\u043E\u0439 \u043A\u0430\u0442\u0435\u0440 \u0433\u0438\u0434\u0440\u043E\u043B\u043E\u0433\u0438\u0447\u0435\u0441\u043A\u043E\u0439 \u0438\u043D\u0441\u043F\u0435\u043A\u0446\u0438\u0438","\u0420\u044B\u0431\u043E\u043B\u043E\u0432\u043D\u044B\u0439 \u0441\u0435\u0439\u043D\u0435\u0440 \u0443 \u0441\u0430\u0434\u043A\u043E\u0432 \u0444\u043E\u0440\u0435\u043B\u0435\u0432\u043E\u0433\u043E \u0445\u043E\u0437\u044F\u0439\u0441\u0442\u0432\u0430","\u0421\u0430\u043C\u043E\u0445\u043E\u0434\u043D\u0430\u044F \u0437\u0435\u0440\u043D\u043E\u0432\u0430\u044F \u0431\u0430\u0440\u0436\u0430 \u0438\u0437 \u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u044B","\u041F\u0430\u0440\u043E\u043C\u043D\u0430\u044F \u043F\u0435\u0440\u0435\u043F\u0440\u0430\u0432\u0430 \u043C\u0435\u0436\u0434\u0443 \u0431\u0435\u0440\u0435\u0433\u0430\u043C\u0438 \u043F\u043B\u0451\u0441\u0430","\u0411\u043E\u0440\u0442\u043E\u0432\u0430\u044F \u043A\u0430\u0447\u043A\u0430 \u0441\u0443\u0445\u043E\u0433\u0440\u0443\u0437\u0430 \u043D\u0430 \u0432\u043E\u043B\u043D\u0435","\u041A\u0438\u043B\u0435\u0432\u0430\u044F \u043A\u0430\u0447\u043A\u0430 \u043A\u0430\u0442\u0435\u0440\u0430 \u043D\u0430 \u0431\u044B\u0441\u0442\u0440\u043E\u0442\u043E\u043A\u0435","\u0420\u0430\u0441\u0442\u0432\u043E\u0440\u0435\u043D\u0438\u0435 \u0432\u0435\u0440\u0445\u043D\u0438\u0445 \u0434\u0432\u0443\u0441\u0442\u0432\u043E\u0440\u0447\u0430\u0442\u044B\u0445 \u0432\u043E\u0440\u043E\u0442 \u0448\u043B\u044E\u0437\u0430","\u0420\u0430\u0441\u0442\u0432\u043E\u0440\u0435\u043D\u0438\u0435 \u043D\u0438\u0436\u043D\u0438\u0445 \u0432\u043E\u0440\u043E\u0442 \u0441\u0443\u0434\u043E\u0445\u043E\u0434\u043D\u043E\u0433\u043E \u0448\u043B\u044E\u0437\u0430","\u041F\u043E\u0434\u044A\u0451\u043C \u0437\u0435\u0440\u043A\u0430\u043B\u0430 \u0432\u043E\u0434\u044B \u0432 \u043A\u0430\u043C\u0435\u0440\u0435 \u0448\u043B\u044E\u0437\u0430 \u0441 \u0441\u0443\u0434\u043D\u043E\u043C","\u0421\u043F\u0443\u0441\u043A \u0432\u043E\u0434\u044B \u0438\u0437 \u043A\u0430\u043C\u0435\u0440\u044B \u0448\u043B\u044E\u0437\u0430 \u0432 \u043D\u0438\u0436\u043D\u0438\u0439 \u0431\u044C\u0435\u0444","\u0421\u0432\u0435\u0442\u043E\u0444\u043E\u0440 \u0448\u043B\u044E\u0437\u043E\u0432\u0430\u043D\u0438\u044F (\u043A\u0440\u0430\u0441\u043D\u044B\u0439 / \u0437\u0435\u043B\u0451\u043D\u044B\u0439 \u0441\u0442\u0432\u043E\u0440)","\u041F\u0435\u043D\u043D\u044B\u0439 \u0431\u0443\u0440\u0443\u043D \u0437\u0430 \u043A\u043E\u0440\u043C\u043E\u0432\u044B\u043C \u0432\u0438\u043D\u0442\u043E\u043C \u0441\u0443\u0445\u043E\u0433\u0440\u0443\u0437\u0430","\u0423\u0441\u044B \u043D\u043E\u0441\u043E\u0432\u043E\u0439 \u0432\u043E\u043B\u043D\u044B \u043A\u0440\u0443\u0438\u0437\u043D\u043E\u0433\u043E \u043B\u0430\u0439\u043D\u0435\u0440\u0430","\u041F\u043E\u043A\u0430\u0447\u0438\u0432\u0430\u043D\u0438\u0435 \u0448\u0432\u0430\u0440\u0442\u043E\u0432\u044B\u0445 \u043F\u043E\u043D\u0442\u043E\u043D\u043E\u0432 \u044F\u0445\u0442-\u043C\u0430\u0440\u0438\u043D\u044B","\u0412\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u0441\u0443\u0434\u043E\u0432\u043E\u0433\u043E \u043D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u043E\u043D\u043D\u043E\u0433\u043E \u0440\u0430\u0434\u0430\u0440\u0430","\u0422\u043E\u043F\u043E\u0432\u044B\u0435 \u0438 \u0431\u043E\u0440\u0442\u043E\u0432\u044B\u0435 \u043E\u0433\u043D\u0438 \u0441\u0443\u0434\u043E\u0432 \u043D\u043E\u0447\u044C\u044E","\u041F\u043B\u0430\u0432\u0443\u0447\u0438\u0439 \u0437\u0435\u043C\u0441\u043D\u0430\u0440\u044F\u0434 \u0443\u0433\u043B\u0443\u0431\u043B\u0435\u043D\u0438\u044F \u0441\u0443\u0434\u043E\u0432\u043E\u0433\u043E \u0445\u043E\u0434\u0430","\u041A\u0430\u0447\u0430\u043D\u0438\u0435 \u043A\u0440\u0430\u0441\u043D\u044B\u0445 \u0438 \u0431\u0435\u043B\u044B\u0445 \u0431\u0430\u043A\u0435\u043D\u043E\u0432 \u0444\u0430\u0440\u0432\u0430\u0442\u0435\u0440\u0430","\u0411\u0443\u043A\u0441\u0438\u0440\u043E\u0432\u043A\u0430 \u043F\u043B\u0430\u0432\u0443\u0447\u0435\u0433\u043E \u043A\u0440\u0430\u043D\u0430 \u043A \u0441\u0442\u0432\u043E\u0440\u0443 \u0441\u0442\u0440\u043E\u0439\u043A\u0438","\u0412\u044B\u0433\u0440\u0443\u0437\u043A\u0430 \u043A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440\u043E\u0432 \u0432 \u043F\u043E\u0440\u0442\u0443 \u042E\u0436\u043D\u0430\u044F \u0413\u0430\u0432\u0430\u043D\u044C","\u041F\u0440\u043E\u0433\u0443\u043B\u043E\u0447\u043D\u044B\u0439 \u043A\u0430\u0442\u0430\u043C\u0430\u0440\u0430\u043D \u0443 \u043A\u0443\u0440\u043E\u0440\u0442\u043D\u043E\u0439 \u043D\u0430\u0431\u0435\u0440\u0435\u0436\u043D\u043E\u0439","\u041B\u043E\u0434\u043A\u0430 \u044D\u043A\u043E\u043B\u043E\u0433\u0430-\u0433\u0438\u0434\u0440\u043E\u0431\u0438\u043E\u043B\u043E\u0433\u0430 \u0432 \u0437\u0430\u043B\u0438\u0432\u0435"]},{group:"construction_mining",groupLabel:"\u0421\u0442\u0440\u043E\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u0442\u0435\u0445\u043D\u0438\u043A\u0430, \u043A\u0440\u0430\u043D\u044B \u0438 \u043A\u0430\u0440\u044C\u0435\u0440\u044B",items:["\u041F\u043E\u0432\u043E\u0440\u043E\u0442 \u0441\u0442\u0440\u0435\u043B\u044B \u0431\u0430\u0448\u0435\u043D\u043D\u043E\u0433\u043E \u043A\u0440\u0430\u043D\u0430 \u041A\u0411-504 (\u043B\u0435\u0432\u044B\u0439)","\u041F\u043E\u0432\u043E\u0440\u043E\u0442 \u0441\u0442\u0440\u0435\u043B\u044B \u0431\u0430\u0448\u0435\u043D\u043D\u043E\u0433\u043E \u043A\u0440\u0430\u043D\u0430 \u041A\u0411-504 (\u043F\u0440\u0430\u0432\u044B\u0439)","\u041F\u0435\u0440\u0435\u043C\u0435\u0449\u0435\u043D\u0438\u0435 \u0433\u0440\u0443\u0437\u043E\u0432\u043E\u0439 \u043A\u0430\u0440\u0435\u0442\u043A\u0438 \u043F\u043E \u0441\u0442\u0440\u0435\u043B\u0435 \u043A\u0440\u0430\u043D\u0430","\u0421\u043F\u0443\u0441\u043A \u0431\u0430\u0434\u044C\u0438 \u0441 \u0433\u0438\u0434\u0440\u043E\u0442\u0435\u0445\u043D\u0438\u0447\u0435\u0441\u043A\u0438\u043C \u0431\u0435\u0442\u043E\u043D\u043E\u043C \u0432 \u0431\u043B\u043E\u043A","\u041F\u043E\u0441\u043B\u043E\u0439\u043D\u044B\u0439 \u0440\u043E\u0441\u0442 \u043C\u043E\u043D\u043E\u043B\u0438\u0442\u043D\u043E\u0439 \u0441\u0435\u043A\u0446\u0438\u0438 \u043F\u043B\u043E\u0442\u0438\u043D\u044B","\u041C\u043E\u043D\u0442\u0430\u0436 \u0441\u0442\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u0448\u043F\u0443\u043D\u0442\u0430 \u043F\u0435\u0440\u0435\u043C\u044B\u0447\u043A\u0438 \u041B\u0430\u0440\u0441\u0435\u043D\u0430","\u0421\u0431\u043E\u0440\u043A\u0430 \u0430\u0440\u043C\u0430\u0442\u0443\u0440\u043D\u043E\u0433\u043E \u043F\u0440\u043E\u0441\u0442\u0440\u0430\u043D\u0441\u0442\u0432\u0435\u043D\u043D\u043E\u0433\u043E \u043A\u0430\u0440\u043A\u0430\u0441\u0430","\u0421\u043D\u044F\u0442\u0438\u0435 \u0449\u0438\u0442\u043E\u0432\u043E\u0439 \u043E\u043F\u0430\u043B\u0443\u0431\u043A\u0438 \u0441\u043E \u0437\u0440\u0435\u043B\u043E\u0433\u043E \u0431\u0435\u0442\u043E\u043D\u0430","\u0426\u0438\u043A\u043B \u043A\u043E\u043F\u043A\u0438 \u0433\u0443\u0441\u0435\u043D\u0438\u0447\u043D\u043E\u0433\u043E \u044D\u043A\u0441\u043A\u0430\u0432\u0430\u0442\u043E\u0440\u0430 \u0432 \u043A\u0430\u043D\u0430\u043B\u0435","\u041F\u043E\u0432\u043E\u0440\u043E\u0442 \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u044B \u044D\u043A\u0441\u043A\u0430\u0432\u0430\u0442\u043E\u0440\u0430 \u043D\u0430 \u043F\u043E\u0433\u0440\u0443\u0437\u043A\u0443","\u0420\u0435\u0439\u0441 \u043A\u0430\u0440\u044C\u0435\u0440\u043D\u043E\u0433\u043E \u0441\u0430\u043C\u043E\u0441\u0432\u0430\u043B\u0430 \u0411\u0435\u043B\u0410\u0417 \u0441 \u043F\u043E\u0440\u043E\u0434\u043E\u0439","\u041F\u043E\u0434\u044A\u0451\u043C \u043A\u0443\u0437\u043E\u0432\u0430 \u0441\u0430\u043C\u043E\u0441\u0432\u0430\u043B\u0430 \u043D\u0430 \u043E\u0442\u0432\u0430\u043B\u0435 \u0449\u0435\u0431\u043D\u044F","\u0412\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u0433\u0440\u0443\u0448\u0438 \u0430\u0432\u0442\u043E\u0431\u0435\u0442\u043E\u043D\u043E\u0441\u043C\u0435\u0441\u0438\u0442\u0435\u043B\u044F \u043D\u0430 \u043F\u043E\u0434\u044A\u0435\u0437\u0434\u0435","\u041F\u043E\u0434\u0430\u0447\u0430 \u0441\u043C\u0435\u0441\u0438 \u0441\u0442\u0440\u0435\u043B\u043E\u0439 \u0430\u0432\u0442\u043E\u0431\u0435\u0442\u043E\u043D\u043E\u043D\u0430\u0441\u043E\u0441\u0430","\u041F\u043B\u0430\u043D\u0438\u0440\u043E\u0432\u043A\u0430 \u0437\u0435\u043C\u043B\u044F\u043D\u043E\u0439 \u0434\u0430\u043C\u0431\u044B \u043E\u0442\u0432\u0430\u043B\u043E\u043C \u0431\u0443\u043B\u044C\u0434\u043E\u0437\u0435\u0440\u0430","\u0412\u0438\u0431\u0440\u043E\u043A\u0430\u0442\u043E\u043A \u043D\u0430 \u0443\u043A\u0430\u0442\u043A\u0435 \u044F\u0434\u0440\u0430 \u0433\u0440\u0443\u043D\u0442\u043E\u0432\u043E\u0439 \u043F\u043B\u043E\u0442\u0438\u043D\u044B","\u0411\u0443\u0440\u043E\u0432\u043E\u0439 \u0441\u0442\u0430\u043D\u043E\u043A \u0446\u0435\u043C\u0435\u043D\u0442\u0430\u0446\u0438\u043E\u043D\u043D\u043E\u0439 \u0437\u0430\u0432\u0435\u0441\u044B \u0441\u043A\u0430\u043B\u044B","\u0414\u0440\u043E\u0431\u0438\u043B\u044C\u043D\u043E-\u0441\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u043E\u0447\u043D\u044B\u0439 \u0433\u0440\u043E\u0445\u043E\u0442 \u0433\u0440\u0430\u043D\u0438\u0442\u043D\u043E\u0433\u043E \u0449\u0435\u0431\u043D\u044F","\u041B\u0435\u043D\u0442\u043E\u0447\u043D\u044B\u0439 \u043A\u043E\u043D\u0432\u0435\u0439\u0435\u0440 \u043F\u043E\u0434\u0430\u0447\u0438 \u0437\u0430\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044F \u0411\u0421\u0423","\u041F\u0430\u0440 \u0438 \u043F\u044B\u043B\u044C \u0431\u0435\u0442\u043E\u043D\u043E\u0441\u043C\u0435\u0441\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0433\u043E \u0443\u0437\u043B\u0430","\u041E\u0440\u0430\u043D\u0436\u0435\u0432\u044B\u0435 \u043F\u0440\u043E\u0431\u043B\u0435\u0441\u043A\u043E\u0432\u044B\u0435 \u043C\u0430\u044F\u0447\u043A\u0438 \u043A\u043E\u043B\u043E\u043D\u043D\u044B \u0441\u043F\u0435\u0446\u0442\u0435\u0445\u043D\u0438\u043A\u0438","\u041F\u0440\u043E\u0436\u0435\u043A\u0442\u043E\u0440\u044B \u043D\u043E\u0447\u043D\u043E\u0439 \u0441\u043C\u0435\u043D\u044B \u043D\u0430 \u0441\u0442\u0440\u043E\u0439\u043F\u043B\u043E\u0449\u0430\u0434\u043A\u0435 \u0413\u042D\u0421","\u0418\u043D\u044A\u0435\u043A\u0446\u0438\u044F \u0446\u0435\u043C\u0435\u043D\u0442\u043D\u043E\u0433\u043E \u043C\u043E\u043B\u043E\u043A\u0430 \u0432 \u0442\u0440\u0435\u0449\u0438\u043D\u044B \u043E\u0441\u043D\u043E\u0432\u0430\u043D\u0438\u044F","\u0423\u043A\u043B\u0430\u0434\u043A\u0430 \u0436\u0435\u043B\u0435\u0437\u043E\u0431\u0435\u0442\u043E\u043D\u043D\u044B\u0445 \u043F\u043B\u0438\u0442 \u043E\u0431\u043B\u0438\u0446\u043E\u0432\u043A\u0438 \u043A\u0430\u043D\u0430\u043B\u0430","\u0420\u0430\u0431\u043E\u0442\u0430 \u0432\u043E\u0434\u043E\u043E\u0442\u043B\u0438\u0432\u043D\u043E\u0439 \u043F\u043E\u043C\u043F\u044B \u0432 \u043A\u043E\u0442\u043B\u043E\u0432\u0430\u043D\u0435 \u043C\u0430\u0448\u0437\u0430\u043B\u0430","\u0413\u0435\u043E\u0434\u0435\u0437\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u043B\u0430\u0437\u0435\u0440\u043D\u044B\u0439 \u0441\u0442\u0432\u043E\u0440 \u043D\u0430 \u0431\u0435\u0440\u0435\u0433\u043E\u0432\u043E\u043C \u0443\u0441\u0442\u043E\u0435"]},{group:"rail_road_traffic",groupLabel:"\u041F\u043E\u0435\u0437\u0434\u0430 \u0438 \u0430\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u044C\u043D\u043E\u0435 \u0434\u0432\u0438\u0436\u0435\u043D\u0438\u0435 \u0434\u043E\u043B\u0438\u043D\u044B",items:["\u0413\u0440\u0443\u0437\u043E\u0432\u043E\u0439 \u044D\u043B\u0435\u043A\u0442\u0440\u043E\u0432\u043E\u0437 \u0441 \u0430\u043B\u044E\u043C\u0438\u043D\u0438\u0435\u043C \u0438\u0437 \u0410\u043B\u044E\u043C\u0433\u0440\u0430\u0434\u0430","\u0416\u0435\u043B\u0435\u0437\u043D\u043E\u0434\u043E\u0440\u043E\u0436\u043D\u044B\u0439 \u0441\u043E\u0441\u0442\u0430\u0432 \u0441 \u0445\u043E\u043F\u043F\u0435\u0440\u0430\u043C\u0438 \u0437\u0435\u0440\u043D\u0430","\u0421\u043A\u043E\u0440\u043E\u0441\u0442\u043D\u043E\u0439 \u043F\u0430\u0441\u0441\u0430\u0436\u0438\u0440\u0441\u043A\u0438\u0439 \u044D\u043A\u0441\u043F\u0440\u0435\u0441\u0441 \xAB\u041A\u0430\u0441\u043A\u0430\u0434\xBB","\u041C\u0430\u043D\u0435\u0432\u0440\u043E\u0432\u044B\u0439 \u0442\u0435\u043F\u043B\u043E\u0432\u043E\u0437 \u0432 \u043F\u043E\u0440\u0442\u0443 \u042E\u0436\u043D\u0430\u044F \u0413\u0430\u0432\u0430\u043D\u044C","\u041F\u043E\u0442\u043E\u043A \u043B\u0435\u0433\u043A\u043E\u0432\u044B\u0445 \u0430\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u0435\u0439 \u043F\u043E \u043D\u0430\u0431\u0435\u0440\u0435\u0436\u043D\u043E\u0439 \u0421\u0442\u0440\u0435\u043B\u043A\u0438","\u0413\u0440\u0443\u0437\u043E\u0432\u0438\u043A\u0438-\u0449\u0435\u0431\u043D\u0435\u0432\u043E\u0437\u044B \u043D\u0430 \u0433\u043E\u0440\u043D\u043E\u043C \u0441\u0435\u0440\u043F\u0430\u043D\u0442\u0438\u043D\u0435","\u0410\u0432\u0442\u043E\u0446\u0438\u0441\u0442\u0435\u0440\u043D\u044B \u0438 \u0444\u0443\u0440\u0433\u043E\u043D\u044B \u0441\u043D\u0430\u0431\u0436\u0435\u043D\u0438\u044F \u0422\u0435\u0445\u043D\u043E\u043F\u0430\u0440\u043A\u0430","\u0420\u0435\u0439\u0441\u043E\u0432\u044B\u0435 \u044D\u043B\u0435\u043A\u0442\u0440\u043E\u0431\u0443\u0441\u044B \u043C\u0435\u0436\u0434\u0443 \u0433\u043E\u0440\u043E\u0434\u0430\u043C\u0438 \u0434\u043E\u043B\u0438\u043D\u044B","\u0422\u0440\u0430\u043A\u0442\u043E\u0440\u044B \u0441 \u043F\u0440\u0438\u0446\u0435\u043F\u0430\u043C\u0438 \u0432\u0434\u043E\u043B\u044C \u043F\u043E\u043B\u0435\u0439 \u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u044B","\u0410\u0432\u0430\u0440\u0438\u0439\u043D\u0430\u044F \u0431\u0440\u0438\u0433\u0430\u0434\u0430 \u044D\u043B\u0435\u043A\u0442\u0440\u043E\u0441\u0435\u0442\u0435\u0439 \u043D\u0430 \u0442\u0440\u0430\u0441\u0441\u0435 \u041B\u042D\u041F","\u0417\u0430\u0436\u0438\u0433\u0430\u043D\u0438\u0435 \u0431\u043B\u0438\u0436\u043D\u0435\u0433\u043E \u0441\u0432\u0435\u0442\u0430 \u0444\u0430\u0440 \u0430\u0432\u0442\u043E\u0442\u0440\u0430\u0444\u0438\u043A\u0430 \u0432 \u0441\u0443\u043C\u0435\u0440\u043A\u0430\u0445","\u041A\u0440\u0430\u0441\u043D\u044B\u0435 \u0441\u0442\u043E\u043F-\u0441\u0438\u0433\u043D\u0430\u043B\u044B \u043A\u043E\u043B\u043E\u043D\u043D\u044B \u043D\u0430 \u043F\u043E\u0434\u044A\u0451\u043C\u0430\u0445","\u041F\u0435\u0440\u0435\u0435\u0437\u0434\u043D\u043E\u0439 \u0441\u0435\u043C\u0430\u0444\u043E\u0440 \u0443 \u0436\u0435\u043B\u0435\u0437\u043D\u043E\u0434\u043E\u0440\u043E\u0436\u043D\u043E\u0439 \u0432\u0435\u0442\u043A\u0438","\u0414\u0432\u0438\u0436\u0435\u043D\u0438\u0435 \u0430\u0432\u0442\u043E\u043A\u043E\u043B\u043E\u043D\u043D\u044B \u043F\u043E \u0433\u0440\u0435\u0431\u043D\u044E \u043F\u043E\u0441\u0442\u0440\u043E\u0435\u043D\u043D\u043E\u0439 \u043F\u043B\u043E\u0442\u0438\u043D\u044B","\u041A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440\u043E\u0432\u043E\u0437\u044B \u0443 \u0441\u043A\u043B\u0430\u0434\u0441\u043A\u0438\u0445 \u0442\u0435\u0440\u043C\u0438\u043D\u0430\u043B\u043E\u0432 \u0433\u0430\u0432\u0430\u043D\u0438","\u0421\u043F\u0435\u0446\u043C\u0430\u0448\u0438\u043D\u0430 \u0438\u043D\u0441\u043F\u0435\u043A\u0446\u0438\u0438 \u043F\u043B\u043E\u0442\u0438\u043D \u0433\u0438\u0434\u0440\u043E\u0443\u0437\u043B\u0430","\u0422\u0443\u0440\u0438\u0441\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u0430\u0432\u0442\u043E\u0431\u0443\u0441\u044B \u0432 \u041B\u0430\u0437\u0443\u0440\u043D\u044B\u0439 \u0411\u0435\u0440\u0435\u0433","\u041B\u0435\u0441\u043E\u0432\u043E\u0437\u044B \u043D\u0430 \u0441\u0435\u0432\u0435\u0440\u043D\u043E\u0439 \u0442\u0430\u0451\u0436\u043D\u043E\u0439 \u0434\u043E\u0440\u043E\u0433\u0435","\u041C\u0438\u0433\u0430\u043D\u0438\u0435 \u0443\u043A\u0430\u0437\u0430\u0442\u0435\u043B\u0435\u0439 \u043D\u0430 \u0442\u0440\u0430\u043D\u0441\u043F\u043E\u0440\u0442\u043D\u044B\u0445 \u0440\u0430\u0437\u0432\u044F\u0437\u043A\u0430\u0445","\u041E\u0442\u0440\u0430\u0436\u0435\u043D\u0438\u0435 \u0444\u0430\u0440 \u043C\u0430\u0448\u0438\u043D \u043D\u0430 \u043C\u043E\u043A\u0440\u043E\u043C \u0430\u0441\u0444\u0430\u043B\u044C\u0442\u0435 \u0432 \u0434\u043E\u0436\u0434\u044C","\u0422\u0435\u043F\u043B\u043E\u0432\u043E\u0439 \u0441\u043B\u0435\u0434 \u043B\u043E\u043A\u043E\u043C\u043E\u0442\u0438\u0432\u0430 \u043D\u0430 \u0445\u043E\u043B\u043E\u0434\u043D\u043E\u043C \u043F\u0435\u0440\u0435\u0432\u0430\u043B\u0435","\u041F\u043B\u0430\u0432\u043D\u043E\u0435 \u0442\u043E\u0440\u043C\u043E\u0436\u0435\u043D\u0438\u0435 \u043F\u043E\u0435\u0437\u0434\u0430 \u0443 \u0441\u0442\u0430\u043D\u0446\u0438\u0438 \u041C\u0435\u0433\u0430\u043F\u043E\u043B\u0438\u0441\u0430","\u0420\u0430\u0437\u0433\u043E\u043D \u044D\u043A\u0441\u043F\u0440\u0435\u0441\u0441\u0430 \u043D\u0430 \u043F\u0440\u044F\u043C\u043E\u043C \u0443\u0447\u0430\u0441\u0442\u043A\u0435 \u0434\u043E\u043B\u0438\u043D\u044B","\u0412\u0441\u0442\u0440\u0435\u0447\u043D\u044B\u0439 \u0440\u0430\u0437\u044A\u0435\u0437\u0434 \u0441\u043E\u0441\u0442\u0430\u0432\u043E\u0432 \u043D\u0430 \u0434\u0432\u0443\u0445\u043F\u0443\u0442\u043A\u0435","\u0420\u0430\u0431\u043E\u0442\u0430 \u043F\u043E\u0440\u0442\u043E\u0432\u043E\u0433\u043E \u0430\u0432\u0442\u043E\u043F\u043E\u0433\u0440\u0443\u0437\u0447\u0438\u043A\u0430 \u043D\u0430 \u043F\u0440\u0438\u0447\u0430\u043B\u0435","\u041F\u0430\u0442\u0440\u0443\u043B\u044C\u043D\u0430\u044F \u043C\u0430\u0448\u0438\u043D\u0430 \u041C\u0427\u0421 \u0432 \u043F\u0430\u0432\u043E\u0434\u043A\u043E\u0432\u044B\u0439 \u0441\u0435\u0437\u043E\u043D"]},{group:"renewables_radars",groupLabel:"\u0412\u0435\u0442\u0440\u043E\u043F\u0430\u0440\u043A\u0438 \u0412\u042D\u0421, \u0442\u0440\u0435\u043A\u0435\u0440\u044B \u0421\u042D\u0421, \u0440\u0430\u0434\u0430\u0440\u044B \u0438 \u043C\u0430\u044F\u043A",items:["\u0412\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u0440\u043E\u0442\u043E\u0440\u0430 \u0412\u042D\u0421-1 \u043D\u0430 \u0437\u0430\u043F\u0430\u0434\u043D\u043E\u043C \u0445\u0440\u0435\u0431\u0442\u0435","\u0412\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u0440\u043E\u0442\u043E\u0440\u0430 \u0412\u042D\u0421-2 \u0441\u043E \u0441\u0434\u0432\u0438\u0433\u043E\u043C \u0444\u0430\u0437\u044B 120\xB0","\u0412\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u0440\u043E\u0442\u043E\u0440\u0430 \u0412\u042D\u0421-3 \u0441 \u0443\u0441\u043A\u043E\u0440\u0435\u043D\u0438\u0435\u043C \u043F\u0440\u0438 \u0446\u0438\u043A\u043B\u043E\u043D\u0435","\u0420\u044B\u0441\u043A\u0430\u043D\u0438\u0435 \u0433\u043E\u043D\u0434\u043E\u043B\u044B \u0432\u0435\u0442\u0440\u044F\u043A\u0430 \u043F\u043E \u043D\u0430\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u044E \u0432\u0435\u0442\u0440\u0430","\u0423\u0442\u0440\u0435\u043D\u043D\u0438\u0439 \u0440\u0430\u0437\u0432\u043E\u0440\u043E\u0442 \u0441\u043E\u043B\u043D\u0435\u0447\u043D\u044B\u0445 \u043F\u0430\u043D\u0435\u043B\u0435\u0439 \u0421\u042D\u0421 \u043D\u0430 \u0432\u043E\u0441\u0442\u043E\u043A","\u0414\u043D\u0435\u0432\u043D\u043E\u0435 \u0437\u0435\u043D\u0438\u0442\u043D\u043E\u0435 \u0441\u043B\u0435\u0436\u0435\u043D\u0438\u0435 \u0442\u0440\u0435\u043A\u0435\u0440\u043E\u0432 \u0421\u042D\u0421","\u0412\u0435\u0447\u0435\u0440\u043D\u0438\u0439 \u043D\u0430\u043A\u043B\u043E\u043D \u043F\u0430\u043D\u0435\u043B\u0435\u0439 \u0421\u042D\u0421 \u043A \u0437\u0430\u043A\u0430\u0442\u043D\u043E\u043C\u0443 \u0441\u043E\u043B\u043D\u0446\u0443","\u041D\u043E\u0447\u043D\u0430\u044F \u043F\u0430\u0440\u043A\u043E\u0432\u043A\u0430 \u0441\u0442\u043E\u043B\u043E\u0432 \u0421\u042D\u0421 \u0432 \u0433\u043E\u0440\u0438\u0437\u043E\u043D\u0442","\u0411\u043B\u0438\u043A \u0441\u043E\u043B\u043D\u0435\u0447\u043D\u043E\u0433\u043E \u0437\u0430\u0439\u0447\u0438\u043A\u0430 \u043D\u0430 \u043A\u0440\u0435\u043C\u043D\u0438\u0435\u0432\u044B\u0445 \u044F\u0447\u0435\u0439\u043A\u0430\u0445 \u0421\u042D\u0421","\u041A\u0440\u0443\u0433\u043E\u0432\u043E\u0435 \u0432\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u043B\u0443\u0447\u0430 \u043F\u043E\u0440\u0442\u043E\u0432\u043E\u0433\u043E \u043C\u0430\u044F\u043A\u0430 \u043D\u043E\u0447\u044C\u044E","\u0412\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u0430\u043D\u0442\u0435\u043D\u043D\u044B \u0434\u043E\u043F\u043B\u0435\u0440\u043E\u0432\u0441\u043A\u043E\u0433\u043E \u043C\u0435\u0442\u0435\u043E\u0440\u0430\u0434\u0430\u0440\u0430","\u041A\u0430\u0447\u0430\u043D\u0438\u0435 \u0447\u0430\u0448\u0435\u043A \u0430\u043D\u0435\u043C\u043E\u043C\u0435\u0442\u0440\u0430 \u0433\u043E\u0440\u043D\u043E\u0439 \u043C\u0435\u0442\u0435\u043E\u0441\u0442\u0430\u043D\u0446\u0438\u0438","\u041F\u0443\u043B\u044C\u0441\u0430\u0446\u0438\u044F \u043A\u0440\u0430\u0441\u043D\u044B\u0445 \u043E\u0433\u043D\u0435\u0439 \u0417\u041E\u041C \u043D\u0430 \u043C\u0430\u0447\u0442\u0430\u0445 \u0412\u042D\u0421","\u0421\u0438\u043D\u0445\u0440\u043E\u043D\u043D\u0430\u044F \u0432\u0441\u043F\u044B\u0448\u043A\u0430 \u043E\u0433\u043D\u0435\u0439 \u0431\u0435\u0437\u043E\u043F\u0430\u0441\u043D\u043E\u0441\u0442\u0438 \u043D\u0435\u0431\u043E\u0441\u043A\u0440\u0451\u0431\u043E\u0432","\u041F\u043E\u0432\u043E\u0440\u043E\u0442 \u043F\u0430\u0440\u0430\u0431\u043E\u043B\u0438\u0447\u0435\u0441\u043A\u043E\u0439 \u0430\u043D\u0442\u0435\u043D\u043D\u044B \u043A\u043E\u0441\u043C\u043E\u0441\u0432\u044F\u0437\u0438 \u0426\u041E\u0414","\u0418\u043D\u0434\u0438\u043A\u0430\u0442\u043E\u0440 \u0437\u0430\u0440\u044F\u0434\u0430 \u0430\u043A\u043A\u0443\u043C\u0443\u043B\u044F\u0442\u043E\u0440\u043D\u043E\u0433\u043E \u0431\u0443\u0444\u0435\u0440\u0430 \u0421\u042D\u0421","\u041F\u043B\u0430\u0432\u043D\u044B\u0439 \u0445\u043E\u043B\u043E\u0441\u0442\u043E\u0439 \u0445\u043E\u0434 \u0412\u042D\u0421 \u0432 \u0448\u0442\u0438\u043B\u0435\u0432\u0443\u044E \u043C\u0435\u0436\u0435\u043D\u044C","\u0428\u0442\u043E\u0440\u043C\u043E\u0432\u043E\u0435 \u0434\u0435\u043C\u043F\u0444\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u043B\u043E\u043F\u0430\u0441\u0442\u0435\u0439 \u043F\u0440\u0438 \u0443\u0440\u0430\u0433\u0430\u043D\u0435","\u0421\u0432\u0435\u0442\u043E\u0434\u0438\u043E\u0434\u043D\u043E\u0435 \u043A\u043E\u043B\u044C\u0446\u043E \u043D\u0430 \u0431\u0430\u0448\u043D\u0435 \u043C\u0435\u0442\u0435\u043E\u043A\u043E\u043C\u043F\u043B\u0435\u043A\u0441\u0430","\u0422\u0435\u043B\u0435\u043C\u0435\u0442\u0440\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0438\u043C\u043F\u0443\u043B\u044C\u0441 \u0433\u0438\u0434\u0440\u043E\u043F\u043E\u0441\u0442\u0430 \u043D\u0430 \u0440\u0435\u043A\u0435","\u0420\u0430\u0431\u043E\u0442\u0430 \u0433\u0435\u043B\u0438\u043E\u043A\u043E\u043B\u043B\u0435\u043A\u0442\u043E\u0440\u043E\u0432 \u044D\u043A\u043E-\u043A\u0432\u0430\u0440\u0442\u0430\u043B\u0430","\u0412\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u0434\u0435\u0444\u043B\u0435\u043A\u0442\u043E\u0440\u043E\u0432 \u0432\u0435\u043D\u0442\u0438\u043B\u044F\u0446\u0438\u0438 \u043F\u043E\u0434\u0441\u0442\u0430\u043D\u0446\u0438\u0439","\u041F\u0440\u043E\u0431\u043B\u0435\u0441\u043A\u043E\u0432\u044B\u0439 \u0431\u0443\u0439 \u043C\u0435\u0442\u0435\u043E\u0441\u0442\u0430\u043D\u0446\u0438\u0438 \u043D\u0430 \u0432\u043E\u0434\u043E\u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435","\u041B\u0430\u0437\u0435\u0440\u043D\u044B\u0439 \u043B\u0438\u0434\u0430\u0440 \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044F \u043E\u0431\u043B\u0430\u0447\u043D\u043E\u0441\u0442\u0438 \u043D\u0430 \u043F\u0438\u043A\u0435"]},{group:"industry_agro",groupLabel:"\u0417\u0430\u0432\u043E\u0434\u044B, \u0433\u0440\u0430\u0434\u0438\u0440\u043D\u0438, \u0426\u041E\u0414 \u0418\u0418 \u0438 \u0430\u0433\u0440\u043E\u0438\u0440\u0440\u0438\u0433\u0430\u0446\u0438\u044F",items:["\u041A\u043B\u0443\u0431\u044F\u0449\u0438\u0439\u0441\u044F \u0441\u0442\u043E\u043B\u0431 \u043F\u0430\u0440\u0430 \u0433\u0440\u0430\u0434\u0438\u0440\u043D\u0438 \u21161","\u041A\u043B\u0443\u0431\u044F\u0449\u0438\u0439\u0441\u044F \u0441\u0442\u043E\u043B\u0431 \u043F\u0430\u0440\u0430 \u0433\u0440\u0430\u0434\u0438\u0440\u043D\u0438 \u21162","\u0420\u0430\u0441\u0441\u0435\u0438\u0432\u0430\u043D\u0438\u0435 \u043F\u0430\u0440\u043E\u0432\u043E\u0433\u043E \u0448\u043B\u0435\u0439\u0444\u0430 \u0433\u0440\u0430\u0434\u0438\u0440\u0435\u043D \u043F\u043E \u0432\u0435\u0442\u0440\u0443","\u0414\u044B\u043C\u043A\u0430 \u043B\u0438\u0442\u0435\u0439\u043D\u043E\u0433\u043E \u043A\u043E\u0440\u043F\u0443\u0441\u0430 \u0410\u043B\u044E\u043C\u0433\u0440\u0430\u0434\u0430","\u041E\u0440\u0430\u043D\u0436\u0435\u0432\u044B\u0439 \u043E\u0442\u0441\u0432\u0435\u0442 \u043A\u043E\u0432\u0448\u0430 \u0436\u0438\u0434\u043A\u043E\u0433\u043E \u043C\u0435\u0442\u0430\u043B\u043B\u0430 \u0432 \u0446\u0435\u0445\u0443","\u0411\u0435\u0433\u0443\u0449\u0430\u044F \u0431\u0438\u0440\u044E\u0437\u043E\u0432\u0430\u044F \u043C\u0430\u0442\u0440\u0438\u0446\u0430 \u0441\u0442\u043E\u0435\u043A \u0426\u041E\u0414 \u0418\u0418 (\u0437\u0430\u043B \u0410)","\u0411\u0435\u0433\u0443\u0449\u0430\u044F \u0431\u0438\u0440\u044E\u0437\u043E\u0432\u0430\u044F \u043C\u0430\u0442\u0440\u0438\u0446\u0430 \u0441\u0442\u043E\u0435\u043A \u0426\u041E\u0414 \u0418\u0418 (\u0437\u0430\u043B \u0411)","\u0412\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u0447\u0438\u043B\u043B\u0435\u0440\u043E\u0432 \u0441\u0443\u0445\u043E\u0433\u043E \u043E\u0445\u043B\u0430\u0436\u0434\u0435\u043D\u0438\u044F \u0441\u0443\u043F\u0435\u0440\u043A\u043E\u043C\u043F\u044C\u044E\u0442\u0435\u0440\u0430","\u041A\u0440\u0443\u0433\u043E\u0432\u043E\u0435 \u0434\u0432\u0438\u0436\u0435\u043D\u0438\u0435 \u0434\u043E\u0436\u0434\u0435\u0432\u0430\u043B\u043A\u0438 \xAB\u0424\u0440\u0435\u0433\u0430\u0442\xBB \u043D\u0430 \u043F\u043E\u043B\u0435 \u21161","\u041A\u0440\u0443\u0433\u043E\u0432\u043E\u0435 \u0434\u0432\u0438\u0436\u0435\u043D\u0438\u0435 \u0434\u043E\u0436\u0434\u0435\u0432\u0430\u043B\u043A\u0438 \xAB\u0424\u0440\u0435\u0433\u0430\u0442\xBB \u043D\u0430 \u043F\u043E\u043B\u0435 \u21162","\u0412\u0435\u0435\u0440 \u0440\u0430\u0441\u043F\u044B\u043B\u0430 \u0432\u043E\u0434\u044B \u043E\u0440\u043E\u0441\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0439 \u043F\u0443\u0448\u043A\u0438 \u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u044B","\u041F\u043E\u0434\u044A\u0451\u043C \u043D\u043E\u0440\u0438\u0438 \u0437\u0435\u0440\u043D\u043E\u0432\u043E\u0433\u043E \u044D\u043B\u0435\u0432\u0430\u0442\u043E\u0440\u0430 \u043D\u0430 \u043F\u043E\u0433\u0440\u0443\u0437\u043A\u0435","\u0422\u0451\u043F\u043B\u043E\u0435 \u0444\u0438\u0442\u043E-\u0441\u0432\u0435\u0447\u0435\u043D\u0438\u0435 \u0442\u0435\u043F\u043B\u0438\u0447\u043D\u043E\u0433\u043E \u043A\u043E\u043C\u043F\u043B\u0435\u043A\u0441\u0430 \u043D\u043E\u0447\u044C\u044E","\u041E\u0442\u043A\u0440\u044B\u0442\u0438\u0435 \u0444\u0440\u0430\u043C\u0443\u0433 \u043F\u0440\u043E\u0432\u0435\u0442\u0440\u0438\u0432\u0430\u043D\u0438\u044F \u0442\u0435\u043F\u043B\u0438\u0446 \u0432 \u043F\u043E\u043B\u0434\u0435\u043D\u044C","\u0425\u043E\u0434 \u043F\u043E\u0440\u0442\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u043A\u0440\u0430\u043D\u0430 \xAB\u0410\u043B\u044C\u0431\u0430\u0442\u0440\u043E\u0441\xBB \u0432 \u042E\u0436\u043D\u043E\u0439 \u0413\u0430\u0432\u0430\u043D\u0438","\u041F\u043E\u0432\u043E\u0440\u043E\u0442 \u0441\u0442\u0440\u0435\u043B\u044B \u043F\u043E\u0440\u0442\u043E\u0432\u043E\u0433\u043E \u043F\u0435\u0440\u0435\u0433\u0440\u0443\u0436\u0430\u0442\u0435\u043B\u044F \u0441 \u0433\u0440\u0443\u0437\u043E\u043C","\u0412\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u0430\u044D\u0440\u0430\u0442\u043E\u0440\u043E\u0432 \u0432\u043E\u0434\u044B \u0432 \u0444\u043E\u0440\u0435\u043B\u0435\u0432\u044B\u0445 \u0441\u0430\u0434\u043A\u0430\u0445","\u0410\u0432\u0442\u043E\u043A\u043E\u0440\u043C\u0443\u0448\u043A\u0430 \u0440\u044B\u0431\u043E\u0432\u043E\u0434\u043D\u043E\u0433\u043E \u043F\u043E\u043D\u0442\u043E\u043D\u0430 \u043D\u0430 \u043F\u043B\u0451\u0441\u0435","\u041F\u0443\u043B\u044C\u0441\u0430\u0446\u0438\u044F \u043D\u0430\u0441\u043E\u0441\u043D\u043E\u0439 \u0441\u0442\u0430\u043D\u0446\u0438\u0438 \u0413\u043E\u0440\u0432\u043E\u0434\u043E\u043A\u0430\u043D\u0430\u043B\u0430","\u041C\u0435\u0434\u043B\u0435\u043D\u043D\u043E\u0435 \u0432\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u0441\u043A\u0440\u0435\u0431\u043A\u0430 \u0440\u0430\u0434\u0438\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u043E\u0442\u0441\u0442\u043E\u0439\u043D\u0438\u043A\u0430","\u041A\u043E\u043D\u0432\u0435\u0439\u0435\u0440 \u043E\u0442\u0433\u0440\u0443\u0437\u043A\u0438 \u0433\u043B\u0438\u043D\u043E\u0437\u0451\u043C\u0430 \u043D\u0430 \u043F\u0440\u043E\u043C\u043F\u043B\u043E\u0449\u0430\u0434\u043A\u0435","\u0424\u0430\u043A\u0435\u043B \u0434\u043E\u0436\u0438\u0433\u0430 \u0442\u0435\u0445\u043D\u043E\u043B\u043E\u0433\u0438\u0447\u0435\u0441\u043A\u043E\u0433\u043E \u0433\u0430\u0437\u0430 \u043F\u0440\u043E\u043C\u0437\u043E\u043D\u044B","\u0420\u0430\u0431\u043E\u0442\u0430 \u043A\u043E\u0437\u043B\u043E\u0432\u043E\u0433\u043E \u043A\u0440\u0430\u043D\u0430 \u0441\u043A\u043B\u0430\u0434\u0430 \u0433\u043E\u0442\u043E\u0432\u043E\u0439 \u043F\u0440\u043E\u0434\u0443\u043A\u0446\u0438\u0438","\u041F\u043E\u0434\u0441\u0432\u0435\u0442\u043A\u0430 \u043B\u043E\u0433\u043E\u0442\u0438\u043F\u0430 \u0422\u0435\u0445\u043D\u043E\u043F\u0430\u0440\u043A\u0430 \u0418\u0418 \u043D\u043E\u0447\u044C\u044E","\u041F\u0435\u0440\u0435\u043B\u0438\u0432 \u0447\u0438\u0441\u0442\u043E\u0439 \u0432\u043E\u0434\u044B \u043D\u0430 \u0444\u0438\u043B\u044C\u0442\u0440\u0430\u0445 \u0432\u043E\u0434\u043E\u043F\u043E\u0434\u0433\u043E\u0442\u043E\u0432\u043A\u0438","\u0428\u0432\u0430\u0440\u0442\u043E\u0432\u043A\u0430 \u0431\u0430\u0440\u0436\u0438 \u0443 \u043F\u0440\u0438\u0447\u0430\u043B\u044C\u043D\u043E\u0439 \u0441\u0442\u0435\u043D\u043A\u0438 \u044D\u043B\u0435\u0432\u0430\u0442\u043E\u0440\u0430"]},{group:"wildlife_fauna",groupLabel:"\u041F\u0442\u0438\u0446\u044B \u0432 \u043D\u0435\u0431\u0435 \u0438 \u0440\u044B\u0431\u0430 \u0432 \u0440\u0435\u043A\u0430\u0445/\u0432\u043E\u0434\u043E\u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435",items:["\u041F\u0430\u0440\u0435\u043D\u0438\u0435 \u0431\u0435\u0440\u043A\u0443\u0442\u0430 \u0432 \u0432\u043E\u0441\u0445\u043E\u0434\u044F\u0449\u0435\u043C \u0442\u0435\u0440\u043C\u0438\u043A\u0435 \u043D\u0430\u0434 \u0443\u0449\u0435\u043B\u044C\u0435\u043C","\u0421\u043F\u0438\u0440\u0430\u043B\u044C \u043F\u0430\u0440\u044B \u0433\u043E\u0440\u043D\u044B\u0445 \u043E\u0440\u043B\u043E\u0432 \u043D\u0430\u0434 \u0441\u0435\u0432\u0435\u0440\u043D\u044B\u043C \u043F\u0438\u043A\u043E\u043C","\u041A\u043B\u0438\u043D \u043F\u0435\u0440\u0435\u043B\u0451\u0442\u043D\u044B\u0445 \u0443\u0442\u043E\u043A \u0432\u0434\u043E\u043B\u044C \u0440\u0443\u0441\u043B\u0430 \u0411\u044B\u0441\u0442\u0440\u0438\u0446\u044B","\u041A\u0440\u0443\u0436\u0435\u043D\u0438\u0435 \u0441\u0442\u0430\u0438 \u0431\u0435\u043B\u044B\u0445 \u0447\u0430\u0435\u043A \u043D\u0430\u0434 \u0432\u043E\u0434\u043E\u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435\u043C","\u041F\u0438\u043A\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u0447\u0430\u0439\u043A\u0438 \u043A \u0432\u043E\u0434\u0435 \u0443 \u043D\u0438\u0436\u043D\u0435\u0433\u043E \u0431\u044C\u0435\u0444\u0430 \u0413\u042D\u0421","\u0421\u0442\u0440\u0435\u043C\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u043F\u043E\u043B\u0451\u0442 \u043B\u0430\u0441\u0442\u043E\u0447\u0435\u043A \u0432\u0434\u043E\u043B\u044C \u0433\u0440\u0435\u0431\u043D\u044F \u043F\u043B\u043E\u0442\u0438\u043D\u044B","\u0412\u0437\u043C\u0430\u0445\u0438 \u043A\u0440\u044B\u043B\u044C\u0435\u0432 \u043F\u0442\u0438\u0446 \u0441 \u0438\u043D\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043B\u044C\u043D\u043E\u0439 \u0444\u0430\u0437\u043E\u0439","\u041F\u043B\u0430\u0432\u043D\u043E\u0435 \u043F\u043B\u0430\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u043F\u0442\u0438\u0446 \u043D\u0430 \u0440\u0430\u0441\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043D\u044B\u0445 \u043A\u0440\u044B\u043B\u044C\u044F\u0445","\u041A\u043E\u0441\u044F\u043A \u0440\u0430\u0434\u0443\u0436\u043D\u043E\u0439 \u0444\u043E\u0440\u0435\u043B\u0438 \u0432 \u0447\u0438\u0441\u0442\u043E\u043C \u0441\u0430\u0434\u043A\u0435 \u0440\u044B\u0431\u0445\u043E\u0437\u0430","\u0412\u044B\u043F\u0440\u044B\u0433\u0438\u0432\u0430\u043D\u0438\u0435 \u043B\u043E\u0441\u043E\u0441\u044F \u043D\u0430\u0434 \u0432\u043E\u0434\u043E\u0439 \u0441 \u0431\u0440\u044B\u0437\u0433\u0430\u043C\u0438","\u0425\u043E\u0434 \u043F\u0440\u043E\u0445\u043E\u0434\u043D\u043E\u0439 \u0440\u044B\u0431\u044B \u043A \u0440\u044B\u0431\u043E\u0445\u043E\u0434\u0443 \u0433\u0438\u0434\u0440\u043E\u0443\u0437\u043B\u0430","\u041A\u0440\u0443\u0436\u0435\u043D\u0438\u0435 \u043C\u0430\u043B\u044C\u043A\u043E\u0432 \u043D\u0430 \u043F\u0440\u043E\u0433\u0440\u0435\u0442\u043E\u043C \u0441\u043E\u043B\u043D\u0435\u0447\u043D\u043E\u043C \u043C\u0435\u043B\u043A\u043E\u0432\u043E\u0434\u044C\u0435","\u0423\u0445\u043E\u0434 \u043A\u043E\u0441\u044F\u043A\u0430 \u0440\u044B\u0431\u044B \u043D\u0430 \u0433\u043B\u0443\u0431\u0438\u043D\u0443 \u0432 \u043F\u043E\u043B\u0443\u0434\u0435\u043D\u043D\u044B\u0439 \u0437\u043D\u043E\u0439","\u0412\u0435\u0447\u0435\u0440\u043D\u0438\u0439 \u0436\u043E\u0440 \u0440\u044B\u0431\u044B \u0441 \u043A\u0440\u0443\u0433\u0430\u043C\u0438 \u043D\u0430 \u0442\u0438\u0445\u043E\u0439 \u0433\u043B\u0430\u0434\u0438","\u0421\u0442\u0430\u044F \u0431\u0435\u043B\u044B\u0445 \u0446\u0430\u043F\u0435\u043B\u044C \u0443 \u043A\u0430\u043C\u044B\u0448\u043E\u0432\u044B\u0445 \u0437\u0430\u0432\u043E\u0434\u0435\u0439 \u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u044B","\u041F\u043E\u043B\u0451\u0442 \u043A\u043E\u0440\u0448\u0443\u043D\u0430 \u043D\u0430\u0434 \u0437\u043E\u043B\u043E\u0442\u0438\u0441\u0442\u044B\u043C\u0438 \u043F\u043E\u043B\u044F\u043C\u0438 \u043F\u0448\u0435\u043D\u0438\u0446\u044B","\u0421\u043A\u043E\u043F\u043B\u0435\u043D\u0438\u0435 \u0447\u0430\u0435\u043A \u0437\u0430 \u043A\u043E\u0440\u043C\u043E\u0439 \u0440\u044B\u0431\u043E\u043B\u043E\u0432\u043D\u043E\u0433\u043E \u0441\u0435\u0439\u043D\u0435\u0440\u0430","\u041F\u0435\u0440\u0435\u043B\u0451\u0442 \u0441\u0442\u0430\u0438 \u0441\u043A\u0432\u043E\u0440\u0446\u043E\u0432 \u043C\u0435\u0436\u0434\u0443 \u0440\u043E\u0449\u0430\u043C\u0438 \u0434\u043E\u043B\u0438\u043D\u044B","\u041F\u043B\u0430\u0432\u043D\u043E\u0435 \u0441\u043C\u0435\u0449\u0435\u043D\u0438\u0435 \u0446\u0435\u043D\u0442\u0440\u0430 \u043F\u0442\u0438\u0447\u044C\u0438\u0445 \u0441\u0442\u0430\u0439 \u043F\u043E \u0432\u0435\u0442\u0440\u0443","\u041E\u0442\u0440\u0430\u0436\u0435\u043D\u0438\u0435 \u0441\u0438\u043B\u0443\u044D\u0442\u043E\u0432 \u043F\u0442\u0438\u0446 \u0432 \u0437\u0435\u0440\u043A\u0430\u043B\u044C\u043D\u043E\u0439 \u0432\u043E\u0434\u0435 \u0448\u0442\u0438\u043B\u044F","\u0414\u0432\u0438\u0436\u0435\u043D\u0438\u0435 \u043E\u0441\u0435\u0442\u0440\u043E\u0432\u044B\u0445 \u0443 \u043F\u0440\u0438\u0434\u043E\u043D\u043D\u044B\u0445 \u0433\u0430\u043B\u0435\u0447\u043D\u0438\u043A\u043E\u0432","\u0412\u0441\u043F\u043B\u0435\u0441\u043A \u043A\u0440\u0443\u043F\u043D\u043E\u0433\u043E \u0442\u0430\u0439\u043C\u0435\u043D\u044F \u0432 \u0433\u043E\u0440\u043D\u043E\u043C \u043F\u0435\u0440\u0435\u043A\u0430\u0442\u0435","\u0423\u0442\u0440\u0435\u043D\u043D\u0438\u0439 \u0432\u044B\u043B\u0435\u0442 \u043F\u0442\u0438\u0446 \u0441 \u043B\u0435\u0441\u043D\u044B\u0445 \u0442\u0435\u0440\u0440\u0430\u0441 \u043D\u0430 \u0440\u0430\u0441\u0441\u0432\u0435\u0442\u0435","\u0412\u043E\u0437\u0432\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u0441\u0442\u0430\u0439 \u043D\u0430 \u043D\u043E\u0447\u0451\u0432\u043A\u0443 \u0432 \u0445\u0432\u043E\u0439\u043D\u044B\u0439 \u0431\u043E\u0440","\u041F\u0430\u0442\u0440\u0443\u043B\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u0431\u0430\u043A\u043B\u0430\u043D\u043E\u0432 \u0443 \u043F\u0440\u0438\u0447\u0430\u043B\u043E\u0432 \u042E\u0436\u043D\u043E\u0439 \u0413\u0430\u0432\u0430\u043D\u0438","\u0418\u0433\u0440\u0430 \u0434\u0435\u043B\u044C\u0444\u0438\u043D\u043E\u0432/\u0442\u044E\u043B\u0435\u043D\u0435\u0439 \u043D\u0430 \u043C\u043E\u0440\u0441\u043A\u043E\u0439 \u043A\u0440\u043E\u043C\u043A\u0435 \u0443\u0441\u0442\u044C\u044F"]},{group:"flora_wind",groupLabel:"\u041B\u0435\u0441\u043D\u043E\u0439 \u043C\u0430\u0441\u0441\u0438\u0432, \u043F\u043E\u043B\u044F \u0438 \u0432\u0435\u0442\u0440\u043E\u0432\u0430\u044F \u043F\u043B\u0430\u0441\u0442\u0438\u043A\u0430",items:["\u041F\u043E\u043A\u0430\u0447\u0438\u0432\u0430\u043D\u0438\u0435 \u0432\u0435\u0440\u0445\u0443\u0448\u0435\u043A \u0441\u0438\u0431\u0438\u0440\u0441\u043A\u0438\u0445 \u0435\u043B\u0435\u0439 \u043D\u0430 \u0432\u0435\u0442\u0440\u0443","\u0423\u043F\u0440\u0443\u0433\u0438\u0439 \u043D\u0430\u043A\u043B\u043E\u043D \u043A\u043E\u0440\u0430\u0431\u0435\u043B\u044C\u043D\u044B\u0445 \u0441\u043E\u0441\u0435\u043D \u043D\u0430 \u0445\u0440\u0435\u0431\u0442\u0430\u0445","\u0422\u0440\u0435\u043F\u0435\u0442 \u043A\u0440\u043E\u043D \u043F\u0440\u0438\u0431\u0440\u0435\u0436\u043D\u044B\u0445 \u0438\u0432 \u0443 \u043A\u0440\u043E\u043C\u043A\u0438 \u0432\u043E\u0434\u044B","\u0411\u0435\u0433\u0443\u0449\u0430\u044F \u0432\u0435\u0442\u0440\u043E\u0432\u0430\u044F \u0432\u043E\u043B\u043D\u0430 \u043F\u043E \u043F\u0448\u0435\u043D\u0438\u0447\u043D\u044B\u043C \u043F\u043E\u043B\u044F\u043C","\u0421\u0438\u043D\u0445\u0440\u043E\u043D\u043D\u044B\u0439 \u043F\u043E\u0432\u043E\u0440\u043E\u0442 \u0448\u043B\u044F\u043F\u043E\u043A \u043F\u043E\u0434\u0441\u043E\u043B\u043D\u0443\u0445\u043E\u0432 \u0437\u0430 \u0441\u043E\u043B\u043D\u0446\u0435\u043C","\u0428\u0442\u043E\u0440\u043C\u043E\u0432\u043E\u0439 \u0438\u0437\u0433\u0438\u0431 \u043B\u0435\u0441\u0430 \u043F\u0440\u0438 \u043F\u0440\u0438\u0445\u043E\u0434\u0435 \u0446\u0438\u043A\u043B\u043E\u043D\u0430","\u041B\u0451\u0433\u043A\u043E\u0435 \u0434\u044B\u0445\u0430\u043D\u0438\u0435 \u0445\u0432\u043E\u0438 \u0432 \u0442\u0438\u0445\u0443\u044E \u043B\u0435\u0442\u043D\u044E\u044E \u043C\u0435\u0436\u0435\u043D\u044C","\u041A\u043E\u043B\u044B\u0445\u0430\u043D\u0438\u0435 \u043A\u0430\u043C\u044B\u0448\u0430 \u0438 \u0440\u043E\u0433\u043E\u0437\u0430 \u043D\u0430 \u043E\u0442\u043C\u0435\u043B\u044F\u0445 \u0437\u0430\u043B\u0438\u0432\u0430","\u0421\u043C\u0435\u043D\u0430 \u043E\u0442\u0442\u0435\u043D\u043A\u0430 \u0432\u043B\u0430\u0436\u043D\u043E\u0441\u0442\u0438 \u0431\u0435\u0440\u0435\u0433\u043E\u0432\u043E\u0439 \u0442\u0440\u0430\u0432\u044B \u0443 \u0432\u043E\u0434\u044B","\u041F\u043E\u0442\u0435\u043C\u043D\u0435\u043D\u0438\u0435 \u043F\u0440\u0438\u0431\u0440\u0435\u0436\u043D\u043E\u0439 \u0433\u0430\u043B\u044C\u043A\u0438 \u043F\u0440\u0438 \u043D\u0430\u043A\u0430\u0442\u0435 \u0432\u043E\u043B\u043D\u044B","\u0412\u044B\u0441\u044B\u0445\u0430\u043D\u0438\u0435 \u043C\u043E\u043A\u0440\u043E\u0433\u043E \u0431\u0435\u0440\u0435\u0433\u0430 \u043D\u0430 \u043F\u043E\u043B\u0443\u0434\u0435\u043D\u043D\u043E\u043C \u0441\u043E\u043B\u043D\u0446\u0435","\u0418\u0437\u0443\u043C\u0440\u0443\u0434\u043D\u043E\u0435 \u043E\u0437\u0435\u043B\u0435\u043D\u0435\u043D\u0438\u0435 \u043F\u043E\u043B\u0435\u0439 \u043F\u0440\u0438 \u043F\u043E\u0434\u0430\u0447\u0435 \u0438\u0440\u0440\u0438\u0433\u0430\u0446\u0438\u0438","\u041F\u043B\u0430\u0432\u043D\u044B\u0439 \u0440\u043E\u0441\u0442 \u043C\u043E\u043B\u043E\u0434\u044B\u0445 \u0434\u0435\u0440\u0435\u0432\u044C\u0435\u0432 \u0432\u043E\u043A\u0440\u0443\u0433 \u044D\u043A\u043E-\u043F\u043E\u0441\u0451\u043B\u043A\u043E\u0432","\u0422\u0435\u043D\u0438 \u043A\u0430\u0447\u0430\u044E\u0449\u0438\u0445\u0441\u044F \u043A\u0440\u043E\u043D \u043D\u0430 \u0442\u0440\u0430\u0432\u044F\u043D\u0438\u0441\u0442\u044B\u0445 \u0441\u043A\u043B\u043E\u043D\u0430\u0445","\u0410\u043B\u044C\u043F\u0438\u0439\u0441\u043A\u043E\u0435 \u0440\u0430\u0437\u043D\u043E\u0442\u0440\u0430\u0432\u044C\u0435 \u043D\u0430 \u0441\u0443\u0431\u0430\u043B\u044C\u043F\u0438\u0439\u0441\u043A\u0438\u0445 \u043B\u0443\u0433\u0430\u0445","\u041C\u043E\u0445\u043E\u0432\u044B\u0435 \u043A\u0443\u0440\u0442\u0438\u043D\u044B \u043D\u0430 \u0432\u043B\u0430\u0436\u043D\u044B\u0445 \u0441\u043A\u0430\u043B\u0430\u0445 \u043A\u0430\u043D\u044C\u043E\u043D\u0430","\u041A\u0443\u0441\u0442\u0430\u0440\u043D\u0438\u043A\u043E\u0432\u044B\u0439 \u043F\u043E\u044F\u0441 \u0432\u0434\u043E\u043B\u044C \u0440\u0443\u0447\u044C\u044F \u0413\u0440\u0435\u043C\u0443\u0447\u0435\u0433\u043E","\u041F\u0430\u0440\u043A\u043E\u0432\u0430\u044F \u0430\u043B\u043B\u0435\u044F \u0432\u0434\u043E\u043B\u044C \u043D\u0430\u0431\u0435\u0440\u0435\u0436\u043D\u043E\u0439 \u041B\u0430\u0437\u0443\u0440\u043D\u043E\u0433\u043E \u0411\u0435\u0440\u0435\u0433\u0430","\u0417\u0430\u0449\u0438\u0442\u043D\u0430\u044F \u043B\u0435\u0441\u043E\u043F\u043E\u043B\u043E\u0441\u0430 \u0432\u0434\u043E\u043B\u044C \u043F\u043E\u043B\u0435\u0439 \u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u044B","\u041E\u0442\u0440\u0430\u0436\u0435\u043D\u0438\u0435 \u0437\u0435\u043B\u0451\u043D\u043E\u0433\u043E \u0431\u043E\u0440\u0430 \u0432 \u0438\u0437\u0443\u043C\u0440\u0443\u0434\u043D\u043E\u0439 \u0433\u043B\u0430\u0434\u0438 \u0437\u0430\u0432\u043E\u0434\u0438","\u0412\u0435\u0442\u0440\u043E\u0432\u0430\u044F \u0440\u044F\u0431\u044C \u043A\u043B\u0435\u0432\u0435\u0440\u043D\u044B\u0445 \u043B\u0443\u0433\u043E\u0432 \u0443 \u0444\u0435\u0440\u043C","\u0421\u0435\u0440\u0435\u0431\u0440\u0438\u0441\u0442\u044B\u0439 \u043E\u0442\u043B\u0438\u0432 \u043E\u043B\u0438\u0432\u043A\u043E\u0432\u044B\u0445/\u0438\u0432\u043E\u0432\u044B\u0445 \u0440\u043E\u0449 \u043D\u0430 \u043F\u043E\u0440\u044B\u0432\u0435","\u0423\u0432\u043B\u0430\u0436\u043D\u0435\u043D\u0438\u0435 \u043F\u043E\u0447\u0432\u044B \u043F\u043E\u0439\u043C\u044B \u043F\u043E\u0441\u043B\u0435 \u0432\u0435\u0441\u0435\u043D\u043D\u0435\u0433\u043E \u043F\u0430\u0432\u043E\u0434\u043A\u0430","\u041A\u043E\u043D\u0442\u0440\u0430\u0441\u0442 \u0441\u0443\u0445\u0438\u0445 \u044E\u0436\u043D\u044B\u0445 \u0438 \u0432\u043B\u0430\u0436\u043D\u044B\u0445 \u0441\u0435\u0432\u0435\u0440\u043D\u044B\u0445 \u0441\u043A\u043B\u043E\u043D\u043E\u0432","\u0421\u0430\u0434\u043E\u0432\u044B\u0435 \u0434\u0435\u0440\u0435\u0432\u044C\u044F \u0443 \u043A\u043E\u0442\u0442\u0435\u0434\u0436\u0435\u0439 \u043F\u043E\u0441\u0451\u043B\u043A\u0430 \u0420\u0435\u0447\u043D\u043E\u0439","\u041A\u0435\u0434\u0440\u043E\u0432\u044B\u0439 \u0441\u0442\u043B\u0430\u043D\u0438\u043A \u0443 \u043D\u0438\u0436\u043D\u0435\u0439 \u0433\u0440\u0430\u043D\u0438\u0446\u044B \u0441\u043D\u0435\u0433\u043E\u0432","\u041F\u043B\u0430\u0432\u043D\u044B\u0439 \u043F\u0435\u0440\u0435\u0445\u043E\u0434 \u0442\u0443\u043D\u0434\u0440\u044B \u0432 \u0441\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u0433\u0440\u0435\u0431\u0435\u043D\u044C","\u0421\u043E\u043B\u043D\u0435\u0447\u043D\u044B\u0435 \u043F\u043E\u043B\u044F\u043D\u044B \u0432 \u0440\u0430\u0437\u0440\u0435\u0436\u0435\u043D\u043D\u043E\u043C \u0441\u043E\u0441\u043D\u043E\u0432\u043E\u043C \u043B\u0435\u0441\u0443"]},{group:"sky_climate",groupLabel:"\u0410\u0442\u043C\u043E\u0441\u0444\u0435\u0440\u0430, \u043E\u0431\u043B\u0430\u043A\u0430, \u043B\u0435\u0434\u043D\u0438\u043A\u0438 \u0438 \u0441\u043C\u0435\u043D\u0430 \u0441\u0443\u0442\u043E\u043A",items:["\u0421\u0443\u0442\u043E\u0447\u043D\u043E\u0435 \u0434\u0432\u0438\u0436\u0435\u043D\u0438\u0435 \u0441\u043E\u043B\u043D\u0446\u0430 \u0441 \u0432\u043E\u0441\u0442\u043E\u043A\u0430 \u043D\u0430 \u0437\u0430\u043F\u0430\u0434","\u0412\u043E\u0441\u0445\u043E\u0434 \u0441 \u0442\u0451\u043F\u043B\u044B\u043C \u0437\u043E\u043B\u043E\u0442\u0438\u0441\u0442\u043E-\u0440\u043E\u0437\u043E\u0432\u044B\u043C \u0441\u0432\u0435\u0442\u043E\u043C \u0433\u043E\u0440","\u0417\u0435\u043D\u0438\u0442\u043D\u043E\u0435 \u043F\u043E\u043B\u0443\u0434\u0435\u043D\u043D\u043E\u0435 \u043E\u0441\u0432\u0435\u0449\u0435\u043D\u0438\u0435 \u0432\u044B\u0441\u043E\u043A\u043E\u0439 \u0447\u0451\u0442\u043A\u043E\u0441\u0442\u0438","\u0411\u0430\u0433\u0440\u044F\u043D\u044B\u0439 \u0430\u043B\u044C\u043F\u0438\u0439\u0441\u043A\u0438\u0439 \u0437\u0430\u043A\u0430\u0442 \u043D\u0430 \u0441\u043D\u0435\u0436\u043D\u044B\u0445 \u043F\u0438\u043A\u0430\u0445","\u0421\u0438\u043D\u044F\u044F \u0431\u0430\u0440\u0445\u0430\u0442\u043D\u0430\u044F \u043D\u043E\u0447\u044C \u0441 \u043B\u0443\u043D\u043D\u044B\u043C \u0441\u0432\u0435\u0442\u043E\u043C","\u0414\u0440\u0435\u0439\u0444 \u043E\u0431\u044A\u0451\u043C\u043D\u044B\u0445 \u043A\u0443\u0447\u0435\u0432\u044B\u0445 \u043E\u0431\u043B\u0430\u043A\u043E\u0432 \u043D\u0430\u0434 \u0434\u043E\u043B\u0438\u043D\u043E\u0439","\u0411\u0435\u0433\u0443\u0449\u0438\u0435 \u043C\u044F\u0433\u043A\u0438\u0435 \u0442\u0435\u043D\u0438 \u043E\u0431\u043B\u0430\u043A\u043E\u0432 \u043F\u043E \u0433\u043E\u0440\u0430\u043C \u0438 \u0432\u043E\u0434\u0435","\u0421\u0433\u0443\u0449\u0435\u043D\u0438\u0435 \u0433\u0440\u043E\u0437\u043E\u0432\u043E\u0439 \u043E\u0431\u043B\u0430\u0447\u043D\u043E\u0441\u0442\u0438 \u043F\u0435\u0440\u0435\u0434 \u043F\u0430\u0432\u043E\u0434\u043A\u043E\u043C","\u0414\u043D\u0435\u0432\u043D\u043E\u0435 \u043E\u0442\u0441\u0442\u0443\u043F\u043B\u0435\u043D\u0438\u0435 \u043A\u0440\u043E\u043C\u043A\u0438 \u0433\u043E\u0440\u043D\u044B\u0445 \u0441\u043D\u0435\u0436\u043D\u0438\u043A\u043E\u0432 (\u0442\u0430\u044F\u043D\u0438\u0435)","\u041D\u043E\u0447\u043D\u043E\u0435 \u043F\u0440\u043E\u043C\u0435\u0440\u0437\u0430\u043D\u0438\u0435 \u0438 \u043A\u0440\u0438\u0441\u0442\u0430\u043B\u043B\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0431\u043B\u0435\u0441\u043A \u043B\u0435\u0434\u043D\u0438\u043A\u0430","\u041A\u043E\u0441\u044B\u0435 \u0441\u0435\u0440\u0435\u0431\u0440\u0438\u0441\u0442\u044B\u0435 \u043D\u0438\u0442\u0438 \u0434\u043E\u0436\u0434\u044F \u043F\u0440\u0438 \u0446\u0438\u043A\u043B\u043E\u043D\u0435","\u0423\u0441\u0438\u043B\u0435\u043D\u0438\u0435 \u0430\u0442\u043C\u043E\u0441\u0444\u0435\u0440\u043D\u043E\u0439 \u043F\u0435\u0440\u0441\u043F\u0435\u043A\u0442\u0438\u0432\u044B \u0438 \u0434\u044B\u043C\u043A\u0438 \u0432\u0434\u0430\u043B\u0438","\u0423\u0442\u0440\u0435\u043D\u043D\u0438\u0439 \u0442\u0443\u043C\u0430\u043D \u0432 \u0433\u043B\u0443\u0431\u043E\u043A\u043E\u043C \u0443\u0449\u0435\u043B\u044C\u0435 \u0411\u044B\u0441\u0442\u0440\u0438\u0446\u044B","\u0420\u0430\u0441\u0441\u0435\u0438\u0432\u0430\u043D\u0438\u0435 \u0442\u0443\u043C\u0430\u043D\u0430 \u043F\u0435\u0440\u0432\u044B\u043C\u0438 \u043B\u0443\u0447\u0430\u043C\u0438 \u0441\u043E\u043B\u043D\u0446\u0430","\u0412\u0435\u0442\u0440\u043E\u0432\u043E\u0439 \u0441\u043D\u043E\u0441 \u0434\u043E\u0436\u0434\u0435\u0432\u043E\u0439 \u043F\u0435\u043B\u0435\u043D\u044B \u043F\u043E \u043F\u043E\u0440\u044B\u0432\u0430\u043C","\u0418\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0435 \u0446\u0432\u0435\u0442\u043E\u0432\u043E\u0439 \u0442\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u044B \u043D\u0435\u0431\u0430 \u043F\u043E \u0447\u0430\u0441\u0430\u043C","\u0410\u0434\u0430\u043F\u0442\u0438\u0432\u043D\u0430\u044F \u043F\u043B\u043E\u0442\u043D\u043E\u0441\u0442\u044C \u0442\u0443\u043C\u0430\u043D\u0430 \u043F\u043E\u0434 \u043C\u0430\u0441\u0448\u0442\u0430\u0431 10\xD710 \u043A\u043C","\u041C\u0435\u0440\u0446\u0430\u043D\u0438\u0435 \u044F\u0440\u043A\u0438\u0445 \u0437\u0432\u0451\u0437\u0434 \u043D\u0430 \u043D\u043E\u0447\u043D\u043E\u043C \u043D\u0435\u0431\u043E\u0441\u0432\u043E\u0434\u0435","\u041E\u0440\u0435\u043E\u043B \u0441\u043E\u043B\u043D\u0435\u0447\u043D\u043E\u0439 \u043A\u043E\u0440\u043E\u043D\u044B \u043D\u0430\u0434 \u0433\u0440\u0435\u0431\u043D\u0435\u043C \u0445\u0440\u0435\u0431\u0442\u0430","\u0412\u043B\u0430\u0436\u043D\u044B\u0439 \u0431\u043B\u0435\u0441\u043A \u0441\u043A\u0430\u043B \u0438 \u043A\u0440\u044B\u0448 \u0432\u043E \u0432\u0440\u0435\u043C\u044F \u0434\u043E\u0436\u0434\u044F","\u0411\u044B\u0441\u0442\u0440\u043E\u0435 \u043F\u0440\u043E\u044F\u0441\u043D\u0435\u043D\u0438\u0435 \u043D\u0435\u0431\u0430 \u043F\u043E\u0441\u043B\u0435 \u043F\u0440\u043E\u0445\u043E\u0436\u0434\u0435\u043D\u0438\u044F \u0444\u0440\u043E\u043D\u0442\u0430","\u0421\u0443\u0445\u043E\u0439 \u0437\u043E\u043B\u043E\u0442\u0438\u0441\u0442\u044B\u0439 \u0437\u043D\u043E\u0439 \u0432 \u043F\u0435\u0440\u0438\u043E\u0434 \u043B\u0435\u0442\u043D\u0435\u0439 \u043C\u0435\u0436\u0435\u043D\u0438","\u0425\u043E\u043B\u043E\u0434\u043D\u044B\u0435 \u0441\u0438\u043D\u0438\u0435 \u0442\u0435\u043D\u0438 \u0432 \u0441\u0435\u0432\u0435\u0440\u043D\u044B\u0445 \u0446\u0438\u0440\u043A\u0430\u0445 \u043B\u0435\u0434\u043D\u0438\u043A\u043E\u0432","\u041C\u044F\u0433\u043A\u043E\u0435 \u0440\u0430\u0441\u0441\u0435\u044F\u043D\u043D\u043E\u0435 \u043E\u0441\u0432\u0435\u0449\u0435\u043D\u0438\u0435 \u043F\u0430\u0441\u043C\u0443\u0440\u043D\u043E\u0433\u043E \u0434\u043D\u044F","\u0414\u0438\u043D\u0430\u043C\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0442\u0435\u043D\u0435\u0432\u043E\u0439 \u043A\u0430\u0441\u043A\u0430\u0434 \u0437\u0430 \u0444\u043E\u043A\u0443\u0441\u043E\u043C \u043A\u0430\u043C\u0435\u0440\u044B","\u041F\u043B\u0430\u0432\u043D\u0430\u044F \u0430\u0434\u0430\u043F\u0442\u0430\u0446\u0438\u044F \u044D\u043A\u0441\u043F\u043E\u0437\u0438\u0446\u0438\u0438 ACES Filmic","\u0421\u043D\u0435\u0436\u043D\u0430\u044F \u043F\u043E\u0437\u0451\u043C\u043A\u0430 \u043D\u0430 \u0441\u0430\u043C\u044B\u0445 \u0432\u044B\u0441\u043E\u043A\u0438\u0445 \u043F\u0438\u043A\u0430\u0445 >300 \u043C","\u0422\u0435\u0440\u043C\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u0434\u044B\u043C\u043A\u0430 \u043D\u0430\u0434 \u043F\u0440\u043E\u0433\u0440\u0435\u0442\u044B\u043C \u043F\u043B\u0430\u0442\u043E \u043C\u0435\u0433\u0430\u043F\u043E\u043B\u0438\u0441\u0430"]},{group:"urban_life",groupLabel:"\u0420\u043E\u0441\u0442 8 \u0433\u043E\u0440\u043E\u0434\u043E\u0432 \u0438 32 \u0430\u0440\u0445\u0438\u0442\u0435\u043A\u0442\u0443\u0440\u043D\u044B\u0445 \u0442\u0438\u043F\u043E\u0432",items:["\u041F\u0440\u0443\u0436\u0438\u043D\u043D\u044B\u0439 \u043F\u043E\u0434\u044A\u0451\u043C \u043D\u043E\u0432\u043E\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0438\u0437 \u0444\u0443\u043D\u0434\u0430\u043C\u0435\u043D\u0442\u0430","\u041F\u043E\u044D\u0442\u0430\u043F\u043D\u043E\u0435 \u0437\u0430\u0436\u0438\u0433\u0430\u043D\u0438\u0435 \u043E\u043A\u043E\u043D \u0436\u0438\u043B\u044B\u0445 \u0431\u0430\u0448\u0435\u043D \u0432 19:00","\u041F\u043B\u0430\u0432\u043D\u043E\u0435 \u0433\u0430\u0448\u0435\u043D\u0438\u0435 \u0447\u0430\u0441\u0442\u0438 \u043E\u043A\u043E\u043D \u043F\u043E\u0441\u043B\u0435 \u043F\u043E\u043B\u0443\u043D\u043E\u0447\u0438","\u0423\u0442\u0440\u0435\u043D\u043D\u0435\u0435 \u043F\u0440\u043E\u0431\u0443\u0436\u0434\u0435\u043D\u0438\u0435 \u043A\u0432\u0430\u0440\u0442\u0430\u043B\u043E\u0432 \u043F\u0435\u0440\u0435\u0434 \u0440\u0430\u0441\u0441\u0432\u0435\u0442\u043E\u043C","\u041C\u0433\u043D\u043E\u0432\u0435\u043D\u043D\u043E\u0435 \u043F\u0440\u0438\u0442\u0443\u0445\u0430\u043D\u0438\u0435 \u043A\u0432\u0430\u0440\u0442\u0430\u043B\u0430 \u043F\u0440\u0438 \u0434\u0435\u0444\u0438\u0446\u0438\u0442\u0435 \u041C\u0412\u0442","\u042F\u0440\u043A\u0430\u044F \u0432\u0441\u043F\u044B\u0448\u043A\u0430 \u0438\u043B\u043B\u044E\u043C\u0438\u043D\u0430\u0446\u0438\u0438 \u043F\u0440\u0438 \u043F\u0443\u0441\u043A\u0435 \u043D\u043E\u0432\u043E\u0439 \u041B\u042D\u041F","\u0422\u0451\u043F\u043B\u044B\u0439 \u0441\u0432\u0435\u0442 \u043C\u0430\u043D\u0441\u0430\u0440\u0434 \u0430\u043B\u044C\u043F\u0438\u0439\u0441\u043A\u0438\u0445 \u0448\u0430\u043B\u0435","\u0425\u043E\u043B\u043E\u0434\u043D\u044B\u0439 \u043E\u0444\u0438\u0441\u043D\u044B\u0439 \u0441\u0432\u0435\u0442 \u0441\u0442\u0435\u043A\u043B\u044F\u043D\u043D\u044B\u0445 \u043D\u0435\u0431\u043E\u0441\u043A\u0440\u0451\u0431\u043E\u0432","\u041D\u0435\u043E\u043D\u043E\u0432\u0430\u044F \u043F\u043E\u0434\u0441\u0432\u0435\u0442\u043A\u0430 \u043E\u0442\u0435\u043B\u0435\u0439 \u041B\u0430\u0437\u0443\u0440\u043D\u043E\u0433\u043E \u0411\u0435\u0440\u0435\u0433\u0430","\u041F\u0440\u043E\u0436\u0435\u043A\u0442\u043E\u0440\u044B \u0447\u0430\u0448\u0438 \u0433\u043E\u0440\u043E\u0434\u0441\u043A\u043E\u0433\u043E \u0441\u0442\u0430\u0434\u0438\u043E\u043D\u0430 \u0432\u0435\u0447\u0435\u0440\u043E\u043C","\u041F\u043E\u0434\u0441\u0432\u0435\u0442\u043A\u0430 \u043A\u0443\u043F\u043E\u043B\u0430 \u043E\u0431\u0441\u0435\u0440\u0432\u0430\u0442\u043E\u0440\u0438\u0438 \u0438 \u0440\u0430\u0442\u0443\u0448\u0438","\u041E\u0433\u043D\u0438 \u043F\u043E\u0440\u0442\u043E\u0432\u044B\u0445 \u0441\u043A\u043B\u0430\u0434\u043E\u0432 \u0438 \u0442\u0435\u0440\u043C\u0438\u043D\u0430\u043B\u043E\u0432 \u0433\u0430\u0432\u0430\u043D\u0438","\u0420\u0435\u043A\u043E\u043D\u0441\u0442\u0440\u0443\u043A\u0446\u0438\u044F \u043A\u043E\u0442\u0442\u0435\u0434\u0436\u0430 \u0432 \u043C\u043D\u043E\u0433\u043E\u044D\u0442\u0430\u0436\u043D\u044B\u0439 \u0434\u043E\u043C","\u041D\u0430\u0434\u0441\u0442\u0440\u043E\u0439\u043A\u0430 \u0432\u044B\u0441\u043E\u0442\u043D\u043E\u0439 \u0434\u043E\u043C\u0438\u043D\u0430\u043D\u0442\u044B \u0432 \u0446\u0435\u043D\u0442\u0440\u0435 \u0421\u0442\u0440\u0435\u043B\u043A\u0438","\u0421\u0432\u0435\u0442\u043E\u0432\u0430\u044F \u0438\u043D\u0434\u0438\u043A\u0430\u0446\u0438\u044F \u0431\u043E\u043B\u044C\u043D\u0438\u0446\u044B \u0438 \u044D\u043A\u0441\u0442\u0440\u0435\u043D\u043D\u044B\u0445 \u0441\u043B\u0443\u0436\u0431","\u0423\u043B\u0438\u0447\u043D\u044B\u0435 \u0444\u043E\u043D\u0430\u0440\u0438 \u0432\u0434\u043E\u043B\u044C \u0433\u043B\u0430\u0432\u043D\u044B\u0445 \u043F\u0440\u043E\u0441\u043F\u0435\u043A\u0442\u043E\u0432 \u0433\u043E\u0440\u043E\u0434\u043E\u0432","\u041F\u0440\u0430\u0437\u0434\u043D\u0438\u0447\u043D\u0430\u044F \u0438\u043B\u043B\u044E\u043C\u0438\u043D\u0430\u0446\u0438\u044F \u043F\u0440\u0438 \u0432\u0437\u044F\u0442\u0438\u0438 \u0432\u0435\u0445\u0438 \u0440\u0430\u0437\u0432\u0438\u0442\u0438\u044F","\u041E\u0442\u0440\u0430\u0436\u0435\u043D\u0438\u0435 \u043D\u043E\u0447\u043D\u044B\u0445 \u043E\u0433\u043D\u0435\u0439 \u0433\u043E\u0440\u043E\u0434\u0430 \u0432 \u0440\u0435\u0447\u043D\u043E\u043C \u043F\u043B\u0451\u0441\u0435","\u041F\u0440\u0435\u0434\u0443\u043F\u0440\u0435\u0436\u0434\u0430\u044E\u0449\u0430\u044F \u043F\u0443\u043B\u044C\u0441\u0430\u0446\u0438\u044F \u043F\u0440\u0438 \u043F\u043E\u0434\u0442\u043E\u043F\u043B\u0435\u043D\u0438\u0438 \u043D\u0438\u0437\u0438\u043D","\u0420\u043E\u0441\u0442 \u0442\u0435\u043F\u043B\u0438\u0447\u043D\u044B\u0445 \u0440\u044F\u0434\u043E\u0432 \u043F\u0440\u0438 \u043F\u0440\u0438\u0445\u043E\u0434\u0435 \u0432\u043E\u0434\u044B \u0432 \u043A\u0430\u043D\u0430\u043B","\u041E\u0436\u0438\u0432\u043B\u0435\u043D\u0438\u0435 \u044F\u0445\u0442\u0435\u043D\u043D\u044B\u0445 \u043F\u0440\u0438\u0447\u0430\u043B\u043E\u0432 \u0443 \u043A\u0443\u0440\u043E\u0440\u0442\u043D\u043E\u0433\u043E \u0433\u043E\u0440\u043E\u0434\u0430","\u0417\u0430\u043F\u0443\u0441\u043A \u043D\u043E\u0432\u044B\u0445 \u0446\u0435\u0445\u043E\u0432 \u0410\u043B\u044E\u043C\u0433\u0440\u0430\u0434\u0430 \u043E\u0442 \u0447\u0438\u0441\u0442\u043E\u0439 \u0413\u042D\u0421","\u0420\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u0438\u0435 \u043A\u0430\u043C\u043F\u0443\u0441\u0430 \u0422\u0435\u0445\u043D\u043E\u043F\u0430\u0440\u043A\u0430 \u0418\u0418 \u043D\u0430 \u043F\u043B\u0430\u0442\u043E","\u0413\u0443\u0434\u0435\u043D\u0438\u0435 \u0442\u0440\u0430\u043D\u0441\u0444\u043E\u0440\u043C\u0430\u0442\u043E\u0440\u043D\u044B\u0445 \u0431\u0443\u0434\u043E\u043A \u043C\u0438\u043A\u0440\u043E\u0440\u0430\u0439\u043E\u043D\u043E\u0432","\u0424\u043B\u044E\u0433\u0435\u0440\u044B \u0438 \u0448\u043F\u0438\u043B\u0438 \u043D\u0430 \u043A\u0440\u044B\u0448\u0430\u0445 \u0438\u0441\u0442\u043E\u0440\u0438\u0447\u0435\u0441\u043A\u043E\u0433\u043E \u0446\u0435\u043D\u0442\u0440\u0430","\u0417\u0435\u043B\u0451\u043D\u044B\u0435 \u043A\u0440\u044B\u0448\u0438 \u0438 \u0442\u0435\u0440\u0440\u0430\u0441\u044B \u0441\u043E\u0432\u0440\u0435\u043C\u0435\u043D\u043D\u044B\u0445 \u0416\u041A","\u0421\u0432\u0435\u0442\u043E\u0432\u044B\u0435 \u0442\u0430\u0431\u043B\u043E \u0434\u0438\u0441\u043F\u0435\u0442\u0447\u0435\u0440\u0441\u043A\u043E\u0439 \u0433\u0438\u0434\u0440\u043E\u043A\u0430\u0441\u043A\u0430\u0434\u0430","\u041F\u0430\u043D\u043E\u0440\u0430\u043C\u043D\u044B\u0439 \u043B\u0438\u0444\u0442 \u043D\u0430 \u0441\u043C\u043E\u0442\u0440\u043E\u0432\u043E\u0439 \u0431\u0430\u0448\u043D\u0435 \u043C\u0435\u0433\u0430\u043F\u043E\u043B\u0438\u0441\u0430"]}],t=[],e=1;for(let i=0;i<r.length;i++){let n=r[i];for(let s=0;s<n.items.length;s++)t.push({id:e,code:`${n.group}_${String(s+1).padStart(2,"0")}`,group:n.group,groupLabel:n.groupLabel,title:n.items[s],freqHz:+(.08+e*17%45*.055).toFixed(3),phaseOffset:+(e*1.6180339%1*Math.PI*2).toFixed(3)}),e++}return t}var Ga=Fg(),Ha=class{constructor(t,e,i,n){this.scene=t,this.hydro=e,this.economy=i,this.textures=n,this.group=new Ce,this.scene.add(this.group),this._dummy=new ze,this._color=new ft,this._time=0,this.ships=[],this.vehicles=[],this.windTurbines=[],this.solarTrackers=[],this.steamPuffs=[],this.sprinklers=[],this.birds=[],this.fishes=[],this.clouds=[],this._buildInstancedBatches(),this.rebuildWorldActors()}_buildInstancedBatches(){this.maxShips=56;let t=new Vt(1,1,1),e=new xi({roughness:.46,metalness:.25});this.shipHullIM=new fe(t,e,this.maxShips),this.shipHullIM.castShadow=!0,this.shipHullIM.frustumCulled=!1;let i=new gi(.55,1,4),n=new xi({color:16317180,roughness:.35,metalness:.1});this.shipSuperIM=new fe(i,n,this.maxShips),this.shipSuperIM.frustumCulled=!1,this.maxVehicles=96;let s=new Vt(1,1,1),o=new xi({roughness:.42,metalness:.32});this.vehicleIM=new fe(s,o,this.maxVehicles),this.vehicleIM.castShadow=!0,this.vehicleIM.frustumCulled=!1;let a=new Vt(.92,.35,.18);this.headlightMat=new be({color:16774084}),this.headlightIM=new fe(a,this.headlightMat,this.maxVehicles),this.headlightIM.frustumCulled=!1,this.maxWind=24;let c=new Ne(.32,.68,1,8);c.translate(0,.5,0);let l=new xi({color:15857145,roughness:.38,metalness:.28});this.windTowerIM=new fe(c,l,this.maxWind),this.windTowerIM.castShadow=!0,this.windTowerIM.frustumCulled=!1;let h=new Vt(.14,1,.04);h.translate(0,.5,0);let u=new xe,d=[],f=[],g=h.attributes.position,y=h.attributes.normal,p=h.index,m=new k,_=new k;for(let R=0;R<3;R++){let L=R*Math.PI*2/3,D=Math.cos(L),I=Math.sin(L);for(let F=0;F<p.count;F++){let z=p.getX(F);m.fromBufferAttribute(g,z),_.fromBufferAttribute(y,z),d.push(m.x*D-m.y*I,m.x*I+m.y*D,m.z),f.push(_.x*D-_.y*I,_.x*I+_.y*D,_.z)}}u.setAttribute("position",new ee(d,3)),u.setAttribute("normal",new ee(f,3)),h.dispose(),this.windRotorIM=new fe(u,l,this.maxWind),this.windRotorIM.castShadow=!0,this.windRotorIM.frustumCulled=!1,this.maxSolar=36;let M=new Vt(1,.08,.68),v=new xi({color:1920728,roughness:.22,metalness:.72,emissive:728909,emissiveIntensity:.25});this.solarIM=new fe(M,v,this.maxSolar),this.solarIM.frustumCulled=!1,this.maxPuffs=84;let w=new Qs(.65,1);this.puffMat=new de({color:15857145,transparent:!0,opacity:.46,depthWrite:!1}),this.puffIM=new fe(w,this.puffMat,this.maxPuffs),this.puffIM.frustumCulled=!1,this.maxBirds=72;let S=new gi(.55,.22,3);S.scale(2.4,.25,.85);let T=new de({color:16317180});this.birdIM=new fe(S,T,this.maxBirds),this.birdIM.frustumCulled=!1,this.maxFish=64;let x=new Js(.5,0);x.scale(.35,.28,1.35);let E=new xi({color:9741240,roughness:.2,metalness:.75});this.fishIM=new fe(x,E,this.maxFish),this.fishIM.frustumCulled=!1,this.maxClouds=34;let C=new kn(1,1);C.scale(1.9,.48,1.25),this.cloudMat=new de({color:16777215,transparent:!0,opacity:.68,depthWrite:!1}),this.cloudIM=new fe(C,this.cloudMat,this.maxClouds),this.cloudIM.frustumCulled=!1,this.group.add(this.shipHullIM,this.shipSuperIM,this.vehicleIM,this.headlightIM,this.windTowerIM,this.windRotorIM,this.solarIM,this.puffIM,this.birdIM,this.fishIM,this.cloudIM)}rebuildWorldActors(){let t=Yn(202603),e=U.horizScale,i=U.elevScale,n=Math.pow(e,.62),o=$n(this.hydro.presetId).main;this.ships=[];for(let h=0;h<this.maxShips;h++){let u=h%5,d=Qi("fleet_machinery",h*5+1);this.ships.push({kind:u,t:(h/this.maxShips+t()*.08)%1,dir:h%2===0?1:-1,speed:(.014+t()*.014)*(u===4?1.25:.85),laneOffset:(t()-.5)*14*e*.45,length:(u<=2?12.5:u===3?14:5.6)*n,beam:(u<=2?3.2:u===3?3.5:1.9)*n,height:(u===4?1.4:2.3)*n,mastH:(u===4?5.8:2.4)*n,phase:t()*Math.PI*2,color:new ft(d.r,d.g,d.b)})}this.vehicles=[];let a=[];for(let h=0;h<Ye.length;h++){let u=Ye[h],d=Ye[(h+1)%Ye.length];a.push({ax:u.x,az:u.z,bx:d.x,bz:d.z,isRail:h%3===0})}for(let h=0;h<this.maxVehicles;h++){let u=a[h%a.length],d=u.isRail&&h%6<4,f=Qi("fleet_machinery",h*3+7);this.vehicles.push({route:u,isTrain:d,trainSlot:h%4,t:(Math.floor(h/4)*.13+(d?h%4*.016:t()))%1,dir:h%2===0?1:-1,speed:d?.036:.028+t()*.025,sx:(d?2.8:2.1)*n,sy:(d?2.6:1.5)*n,sz:(d?7.8:4.2)*n,color:new ft(f.r,f.g,f.b)})}this.windTurbines=[];for(let h=0;h<this.maxWind;h++){let d=(h%2===0?-1:1)*(225+h%6*22+t()*12)*e,f=(-285+Math.floor(h/2)*46+t()*14)*e;if(Math.abs(d)>U.half*.94||Math.abs(f)>U.half*.94)continue;let g=this.hydro.sampleAtWorld(d,f);if(g.depth>.2)continue;let y=(22+h%3*4)*n;this.windTurbines.push({wx:d,wy:g.bed,wz:f,towerH:y,bladeLen:y*.46,yaw:.35+Math.sin(h)*.22,phase:t()*Math.PI*2,speedMult:.85+t()*.35})}this.windTowerIM.count=this.windTurbines.length,this.windRotorIM.count=this.windTurbines.length;for(let h=0;h<this.windTurbines.length;h++){let u=this.windTurbines[h];this._dummy.position.set(u.wx,u.wy,u.wz),this._dummy.rotation.set(0,u.yaw,0),this._dummy.scale.set(n*1.1,u.towerH,n*1.1),this._dummy.updateMatrix(),this.windTowerIM.setMatrixAt(h,this._dummy.matrix)}this.windTowerIM.instanceMatrix.needsUpdate=!0,this.solarTrackers=[];let c=Ye.find(h=>h.archetype==="tech")||Ye[0];for(let h=0;h<this.maxSolar;h++){let u=Math.floor(h/6),d=h%6,f=c.x+(d-2.5)*9.5*n+42*e,g=c.z+(u-2.5)*8.5*n+36*e;if(Math.abs(f)>U.half*.93||Math.abs(g)>U.half*.93)continue;let y=this.hydro.sampleAtWorld(f,g);y.depth>.2||this.solarTrackers.push({wx:f,wy:y.bed+1.4*n,wz:g,scale:5.2*n})}this.solarIM.count=this.solarTrackers.length,this.steamPuffs=[];let l=Ye.filter(h=>h.archetype==="industrial"||h.archetype==="smelter");for(let h=0;h<this.maxPuffs;h++){let u=l[h%Math.max(1,l.length)]||Ye[0],d=h*2.39996%(Math.PI*2),f=(8+h%5*7)*e,g=u.x+Math.cos(d)*f,y=u.z+Math.sin(d)*f,p=this.hydro.sampleAtWorld(g,y);this.steamPuffs.push({baseX:g,baseY:p.bed+10*Math.pow(i,.78),baseZ:y,phase:(h/this.maxPuffs+t()*.2)%1,speed:.14+t()*.1,size:(3.2+t()*2.5)*n})}this.puffIM.count=this.steamPuffs.length,this.birds=[];for(let h=0;h<this.maxBirds;h++){let u=h<18,d=o[h%o.length];this.birds.push({cx:d.x+(t()-.5)*180*e,cz:d.z+(t()-.5)*180*e,alt:(u?95:34)*i+t()*26*i,orbitR:(u?58:28)*e*(.65+t()*.7),omega:(u?.22:.46)*(h%2===0?1:-1),phase:t()*Math.PI*2,flapFreq:u?3.2:7.8,scale:(u?2.4:1.35)*n,color:u?new ft(6045747):new ft(16317180)}),this.birdIM.setColorAt(h,this.birds[h].color)}this.birdIM.count=this.birds.length,this.birdIM.instanceColor&&(this.birdIM.instanceColor.needsUpdate=!0),this.fishes=[];for(let h=0;h<this.maxFish;h++)this.fishes.push({t:t(),speed:.018+t()*.022,phase:t()*Math.PI*2,jumpPhase:t()*12,offset:(t()-.5)*10*e*.5,scale:(.85+t()*.5)*n});this.clouds=[];for(let h=0;h<this.maxClouds;h++)this.clouds.push({wx:(t()-.5)*U.size*1.15,wy:(165+t()*55)*i,wz:(t()-.5)*U.size*1.15,sx:(38+t()*34)*e,sy:(11+t()*8)*i,sz:(28+t()*26)*e,drift:.75+t()*.55});this.cloudIM.count=this.clouds.length}_sampleRiverPoint(t){let e=$n(this.hydro.presetId).main,i=J(t,.02,.98)*(e.length-1),n=Math.min(e.length-2,Math.floor(i)),s=i-n,o=e[n],a=e[n+1],c=ne(o.x,a.x,s),l=ne(o.z,a.z,s),h=a.x-o.x,u=a.z-o.z,d=Math.atan2(h,u);return{wx:c,wz:l,yaw:d,nx:Math.cos(d),nz:-Math.sin(d)}}update(t,e,i,n){this._time+=t;let s=this._time,o=U.horizScale,a=Math.pow(o,.62),c=this.economy.weatherId==="flood"?2.1:this.economy.weatherId==="rain"?1.5:1,l=i<.26,h=0;for(let _=0;_<this.ships.length;_++){let M=this.ships[_];M.t+=M.dir*M.speed*t*.45,M.t>.96&&(M.t=.96,M.dir=-1),M.t<.08&&(M.t=.08,M.dir=1);let v=this._sampleRiverPoint(M.t),w=v.wx+v.nx*M.laneOffset,S=v.wz+v.nz*M.laneOffset,T=this.hydro.sampleAtWorld(w,S);if(T.depth<.65||T.concrete>2.5){M.dir*=-1;continue}let x=Math.sin(s*2.1+M.phase)*(M.kind===4?.14:.045)*c,E=Math.cos(s*1.7+M.phase)*.03,C=M.dir>0?v.yaw:v.yaw+Math.PI,R=T.surface+M.height*.18;this._dummy.position.set(w,R,S),this._dummy.rotation.set(E,C,x),this._dummy.scale.set(M.beam,M.height,M.length),this._dummy.updateMatrix(),this.shipHullIM.setMatrixAt(h,this._dummy.matrix),this.shipHullIM.setColorAt(h,M.color),this._dummy.position.set(w,R+M.height*.5+M.mastH*.42,S),this._dummy.rotation.set(E,C,x*1.25),this._dummy.scale.set(M.kind===4?M.beam*.25:M.beam*.72,M.mastH,M.kind===4?M.length*.55:M.length*.35),this._dummy.updateMatrix(),this.shipSuperIM.setMatrixAt(h,this._dummy.matrix),h++}this.shipHullIM.count=h,this.shipSuperIM.count=h,this.shipHullIM.instanceMatrix.needsUpdate=!0,this.shipSuperIM.instanceMatrix.needsUpdate=!0,this.shipHullIM.instanceColor&&(this.shipHullIM.instanceColor.needsUpdate=!0);let u=0,d=0;for(let _=0;_<this.vehicles.length;_++){let M=this.vehicles[_];M.t=(M.t+M.dir*M.speed*t+1)%1;let v=M.route,w=Math.sin(M.t*Math.PI)*26*o,S=ne(v.ax,v.bx,M.t)+w*.35,T=ne(v.az,v.bz,M.t)-w*.25;if(Math.abs(S)>U.half*.95||Math.abs(T)>U.half*.95)continue;let x=this.hydro.sampleAtWorld(S,T),E=x.depth>.3?x.surface+2.8*a:x.bed+M.sy*.52,C=Math.atan2(v.bx-v.ax,v.bz-v.az)+(M.dir<0?Math.PI:0);this._dummy.position.set(S,E,T),this._dummy.rotation.set(0,C,0),this._dummy.scale.set(M.sx,M.sy,M.sz),this._dummy.updateMatrix(),this.vehicleIM.setMatrixAt(u,this._dummy.matrix),this.vehicleIM.setColorAt(u,M.color),u++,l&&(this._dummy.position.set(S+Math.sin(C)*M.sz*.54,E,T+Math.cos(C)*M.sz*.54),this._dummy.rotation.set(0,C,0),this._dummy.scale.set(M.sx*.8,M.sy*.35,.4*a),this._dummy.updateMatrix(),this.headlightIM.setMatrixAt(d++,this._dummy.matrix))}this.vehicleIM.count=u,this.headlightIM.count=d,this.vehicleIM.instanceMatrix.needsUpdate=!0,this.vehicleIM.instanceColor&&(this.vehicleIM.instanceColor.needsUpdate=!0),d>0&&(this.headlightIM.instanceMatrix.needsUpdate=!0);for(let _=0;_<this.windTurbines.length;_++){let M=this.windTurbines[_];M.phase=(M.phase+t*1.9*M.speedMult*c)%(Math.PI*2),this._dummy.position.set(M.wx+Math.sin(M.yaw)*.5*a,M.wy+M.towerH,M.wz+Math.cos(M.yaw)*.5*a),this._dummy.rotation.set(0,M.yaw,M.phase),this._dummy.scale.set(M.bladeLen,M.bladeLen,M.bladeLen),this._dummy.updateMatrix(),this.windRotorIM.setMatrixAt(_,this._dummy.matrix)}this.windTurbines.length>0&&(this.windRotorIM.instanceMatrix.needsUpdate=!0);let f=i>.05?J((e-12.5)*.11,-.75,.75):0,g=i>.05?.42:.05;for(let _=0;_<this.solarTrackers.length;_++){let M=this.solarTrackers[_];this._dummy.position.set(M.wx,M.wy,M.wz),this._dummy.rotation.set(g,.15,f),this._dummy.scale.set(M.scale,M.scale,M.scale),this._dummy.updateMatrix(),this.solarIM.setMatrixAt(_,this._dummy.matrix)}this.solarTrackers.length>0&&(this.solarIM.instanceMatrix.needsUpdate=!0);for(let _=0;_<this.steamPuffs.length;_++){let M=this.steamPuffs[_];M.phase=(M.phase+t*M.speed)%1;let v=M.phase,w=v*26*a,S=v*14*a*c,T=M.size*(.55+v*1.65)*(1-v*.35);this._dummy.position.set(M.baseX+S,M.baseY+w,M.baseZ+v*5*a),this._dummy.rotation.set(v*2,v*1.5,0),this._dummy.scale.set(T,T*.82,T),this._dummy.updateMatrix(),this.puffIM.setMatrixAt(_,this._dummy.matrix)}this.puffIM.instanceMatrix.needsUpdate=!0;for(let _=0;_<this.birds.length;_++){let M=this.birds[_],v=s*M.omega+M.phase,w=M.cx+Math.cos(v)*M.orbitR,S=M.cz+Math.sin(v)*M.orbitR*.78,T=Math.sin(s*M.flapFreq+M.phase),x=M.alt+Math.sin(v*2)*3.5*U.elevScale+T*.25,E=v+(M.omega>0?Math.PI*.5:-Math.PI*.5);this._dummy.position.set(w,x,S),this._dummy.rotation.set(.08*T,-E,.28*Math.sign(M.omega)),this._dummy.scale.set(M.scale,M.scale*(.65+.55*Math.abs(T)),M.scale),this._dummy.updateMatrix(),this.birdIM.setMatrixAt(_,this._dummy.matrix)}this.birdIM.instanceMatrix.needsUpdate=!0;let y=0;for(let _=0;_<this.fishes.length;_++){let M=this.fishes[_];M.t=(M.t+M.speed*t*.25)%.95;let v=this._sampleRiverPoint(.08+M.t*.86),w=v.wx+v.nx*M.offset+Math.sin(s*2.4+M.phase)*1.8*a,S=v.wz+v.nz*M.offset,T=this.hydro.sampleAtWorld(w,S);if(T.depth<.45)continue;let x=Math.sin(s*1.65+M.jumpPhase*3.1),E=x>.9?(x-.9)*14*a:-.22*a;this._dummy.position.set(w,T.surface+E,S),this._dummy.rotation.set(E>0?-.45:0,v.yaw+Math.sin(s*6+M.phase)*.22,0),this._dummy.scale.set(M.scale,M.scale,M.scale),this._dummy.updateMatrix(),this.fishIM.setMatrixAt(y++,this._dummy.matrix)}this.fishIM.count=y,y>0&&(this.fishIM.instanceMatrix.needsUpdate=!0);let p=U.size*1.2;this.cloudMat.opacity=this.economy.weatherId==="flood"?.85:l?.34:.68;let m=l?.28:this.economy.weatherId==="flood"?.58:.98;this.cloudMat.color.setRGB(m,m*1.01,m*1.05);for(let _=0;_<this.clouds.length;_++){let M=this.clouds[_];M.wx+=t*4.5*o*M.drift*c*.35,M.wx>p*.5&&(M.wx-=p),this._dummy.position.set(M.wx,M.wy,M.wz),this._dummy.rotation.set(0,_*.7,0),this._dummy.scale.set(M.sx,M.sy,M.sz),this._dummy.updateMatrix(),this.cloudIM.setMatrixAt(_,this._dummy.matrix)}this.cloudIM.instanceMatrix.needsUpdate=!0}getActiveStats(){return{totalRegisteredAnimations:Ga.length,shipsActive:this.shipHullIM.count,vehiclesActive:this.vehicleIM.count,windTurbines:this.windTurbines.length,solarTrackers:this.solarTrackers.length,birdsAndFish:this.birdIM.count+this.fishIM.count}}};function kd(r,t=null){let e={uTime:{value:0},uSunDir:{value:new k(.52,.74,.42).normalize()},uSunColor:{value:new ft(16774364)},uSkyColor:{value:new ft(7186664)},uFogColor:{value:new ft(11061992)},uFogDensity:{value:12e-5},uShowContours:{value:0},uSnowLine:{value:122},uMeltOffset:{value:0},uElevScale:{value:2.35},uHorizScale:{value:6.51},uDetailTex:{value:r},uConcreteTex:{value:t||r},uHasConcreteTex:{value:t?1:0}};return new Oe({uniforms:e,extensions:{derivatives:!0},vertexShader:`
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
      uniform float uSnowLine;
      uniform float uMeltOffset;
      uniform float uElevScale;
      uniform float uHorizScale;
      uniform sampler2D uDetailTex;
      uniform sampler2D uConcreteTex;
      uniform float uHasConcreteTex;

      varying vec3 vWorldPos;
      varying vec3 vNormalW;
      varying vec4 vMeta;

      float hash21(vec2 p) {
        p = fract(p * vec2(127.1, 311.7));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      float vnoise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        float a = hash21(i);
        float b = hash21(i + vec2(1.0, 0.0));
        float c = hash21(i + vec2(0.0, 1.0));
        float d = hash21(i + vec2(1.0, 1.0));
        return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
      }

      float fbm3(vec2 p) {
        float v = 0.0;
        v += 0.52 * vnoise(p);
        v += 0.31 * vnoise(p * 2.13 + vec2(7.3, 3.1));
        v += 0.17 * vnoise(p * 4.47 - vec2(2.9, 9.4));
        return v;
      }

      void main() {
        vec3 Ngeom = normalize(vNormalW);
        float slope = 1.0 - clamp(Ngeom.y, 0.0, 1.0);
        float soil = vMeta.x;
        float concrete = vMeta.y;
        float wetness = clamp(vMeta.z, 0.0, 1.0);
        float subDepth = max(0.0, vMeta.w);

        float camDist = length(cameraPosition - vWorldPos);
        float invScale = 1.0 / max(1.0, pow(uHorizScale, 0.55));
        vec2 uvMacro = vWorldPos.xz * (0.024 * invScale);
        vec2 uvMid   = vWorldPos.xz * (0.14 * invScale);
        vec2 uvFine  = vWorldPos.xz * (0.72 * invScale);

        float nMacro = fbm3(uvMacro);
        float nMid   = fbm3(uvMid);
        float nFine  = vnoise(uvFine);

        // --- 1. \u0421\u043B\u043E\u0438\u0441\u0442\u044B\u0435 \u043F\u043E\u0440\u043E\u0434\u044B (\u0440\u043E\u0437\u043E\u0432\u044B\u0439 \u0433\u0440\u0430\u043D\u0438\u0442, \u0441\u0435\u0440\u044B\u0439 \u0433\u043D\u0435\u0439\u0441, \u0431\u0430\u0437\u0430\u043B\u044C\u0442, \u043A\u0432\u0430\u0440\u0446\u0435\u0432\u044B\u0435 \u0436\u0438\u043B\u044B, \u043B\u0438\u0448\u0430\u0439\u043D\u0438\u043A) ---
        vec3 triW = pow(abs(Ngeom), vec3(4.0));
        triW /= max(0.001, triW.x + triW.y + triW.z);

        float strataY = vWorldPos.y * (0.52 / max(1.0, uElevScale * 0.7)) + nMacro * 3.8;
        float strata = sin(strataY * 3.1) * 0.5 + 0.5;
        float strataSharp = smoothstep(0.22, 0.78, strata);
        float triGrain = fbm3(vWorldPos.zy * 0.28 * invScale) * triW.x
                       + fbm3(vWorldPos.xz * 0.28 * invScale) * triW.y
                       + fbm3(vWorldPos.xy * 0.28 * invScale) * triW.z;
        float fissure = smoothstep(0.70, 0.90, abs(triGrain * 2.0 - 1.0));

        vec3 graniteWarm = vec3(0.49, 0.44, 0.40);
        vec3 gneissCool  = vec3(0.30, 0.33, 0.38);
        vec3 basaltDark  = vec3(0.20, 0.22, 0.26);
        vec3 rockCol = mix(gneissCool, graniteWarm, strataSharp);
        rockCol = mix(rockCol, basaltDark, smoothstep(0.62, 0.92, nMacro) * 0.45);
        rockCol *= (0.80 + 0.38 * triGrain);
        rockCol *= (1.0 - fissure * 0.36);

        float lichenMask = smoothstep(0.58, 0.80, nMid) * (1.0 - smoothstep(0.30, 0.62, slope));
        rockCol = mix(rockCol, vec3(0.40, 0.49, 0.31), lichenMask * 0.52);

        // --- 2. \u041F\u043E\u0439\u043C\u0435\u043D\u043D\u044B\u0435 \u043B\u0443\u0433\u0430, \u043A\u043B\u0435\u0432\u0435\u0440, \u0430\u0433\u0440\u043E-\u043F\u043E\u043B\u044F, \u043F\u0435\u0441\u0447\u0430\u043D\u044B\u0435 \u043A\u043E\u0441\u044B \u0438 \u0434\u043E\u043D\u043D\u0430\u044F \u0433\u0430\u043B\u044C\u043A\u0430 ---
        vec3 lushGrass   = vec3(0.20, 0.43, 0.17);
        vec3 cloverGrass = vec3(0.29, 0.51, 0.21);
        vec3 alpineHerb  = vec3(0.43, 0.47, 0.24);
        vec3 goldenCrop  = vec3(0.56, 0.50, 0.23);

        float altNorm = vWorldPos.y / max(1.0, uElevScale);
        float meadowAlt = smoothstep(14.0, 44.0, altNorm);
        vec3 grassCol = mix(lushGrass, cloverGrass, smoothstep(0.32, 0.70, nMacro));
        grassCol = mix(grassCol, alpineHerb, meadowAlt * 0.68);

        // \u0412\u043E\u0437\u0434\u0435\u043B\u0430\u043D\u043D\u044B\u0435 \u043F\u043E\u043B\u043E\u0441\u044B \u0441\u0435\u043B\u044C\u0445\u043E\u0437\u043F\u043E\u043B\u0435\u0439 \u043D\u0430 \u0432\u043E\u0441\u0442\u043E\u0447\u043D\u044B\u0445 \u0442\u0435\u0440\u0440\u0430\u0441\u0430\u0445 \u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u044B
        float agroZone = smoothstep(60.0 * uHorizScale, 150.0 * uHorizScale, vWorldPos.x)
                       * (1.0 - smoothstep(140.0 * uHorizScale, 280.0 * uHorizScale, abs(vWorldPos.z - 80.0 * uHorizScale)))
                       * (1.0 - smoothstep(0.08, 0.22, slope));
        float cropStripe = step(0.5, fract((vWorldPos.x + vWorldPos.z * 0.4) * 0.045 * invScale));
        grassCol = mix(grassCol, mix(cloverGrass * 1.08, goldenCrop, cropStripe), agroZone * 0.62);
        grassCol += (nFine - 0.5) * 0.06;

        vec3 clayLoam = mix(vec3(0.43, 0.32, 0.21), vec3(0.55, 0.43, 0.29), nMid);
        float cobblePattern = smoothstep(0.34, 0.74, vnoise(vWorldPos.xz * 2.2 * invScale));
        vec3 riverGravel = mix(vec3(0.39, 0.37, 0.33), vec3(0.59, 0.55, 0.48), cobblePattern);
        vec3 sandyShoal  = vec3(0.66, 0.60, 0.46);

        float rockMask = clamp(smoothstep(0.33, 0.57, slope) + (1.0 - smoothstep(0.30, 1.35, soil)), 0.0, 1.0);
        float bareCutMask = clamp(smoothstep(0.18, 0.40, slope) * (1.0 - rockMask), 0.0, 1.0);
        float gravelMask = clamp(smoothstep(0.15, 0.72, wetness) * (1.0 - smoothstep(0.42, 0.70, slope)), 0.0, 1.0);
        float shoalMask  = clamp((1.0 - smoothstep(0.0, 2.2, altNorm - 11.0)) * (1.0 - slope * 3.0) * wetness, 0.0, 0.65);

        vec3 naturalCol = mix(grassCol, clayLoam, bareCutMask * 0.78);
        naturalCol = mix(naturalCol, riverGravel, gravelMask * 0.85);
        naturalCol = mix(naturalCol, sandyShoal, shoalMask);
        naturalCol = mix(naturalCol, rockCol, rockMask);

        // --- 3. \u0410\u043B\u044C\u043F\u0438\u0439\u0441\u043A\u0438\u0435 \u0441\u043D\u0435\u0436\u043D\u0438\u043A\u0438 \u0438 \u0433\u043E\u043B\u0443\u0431\u043E\u0432\u0430\u0442\u044B\u0439 \u0433\u043B\u0435\u0442\u0447\u0435\u0440\u043D\u044B\u0439 \u0444\u0438\u0440\u043D \u043D\u0430 \u0432\u0435\u0440\u0448\u0438\u043D\u0430\u0445 (\u0442\u0430\u044E\u0442 \u0434\u043D\u0451\u043C!) ---
        float dynSnowLine = uSnowLine + uMeltOffset + (nMacro - 0.5) * 18.0 * max(1.0, uElevScale * 0.6);
        float snowMask = smoothstep(dynSnowLine - 8.0, dynSnowLine + 14.0, vWorldPos.y)
                       * (1.0 - smoothstep(0.52, 0.82, slope));
        vec3 snowPure = mix(vec3(0.84, 0.91, 0.98), vec3(0.97, 0.98, 1.0), nMid);
        naturalCol = mix(naturalCol, snowPure, snowMask);

        // --- 4. \u0413\u0438\u0434\u0440\u043E\u0442\u0435\u0445\u043D\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0431\u0435\u0442\u043E\u043D \u043F\u043B\u043E\u0442\u0438\u043D \u0438 \u043E\u0431\u043B\u0438\u0446\u043E\u0432\u0430\u043D\u043D\u044B\u0445 \u043A\u0430\u043D\u0430\u043B\u043E\u0432 ---
        float concMask = smoothstep(0.05, 0.34, concrete);
        vec3 concSample = vec3(0.68, 0.71, 0.75);
        if (uHasConcreteTex > 0.5 && concMask > 0.01) {
          vec3 cx = texture2D(uConcreteTex, vWorldPos.zy * 0.11).rgb;
          vec3 cy = texture2D(uConcreteTex, vWorldPos.xz * 0.11).rgb;
          vec3 cz = texture2D(uConcreteTex, vWorldPos.xy * 0.11).rgb;
          concSample = cx * triW.x + cy * triW.y + cz * triW.z;
        }
        float algaeZone = wetness * (1.0 - smoothstep(1.2, 4.5, subDepth)) * concMask;
        concSample = mix(concSample, vec3(0.24, 0.35, 0.24), algaeZone * 0.46);

        vec3 col = mix(naturalCol, concSample, concMask);
        float wetDarken = mix(1.0, 0.58, wetness * (1.0 - concMask * 0.32) * (1.0 - snowMask));
        col *= wetDarken;

        // --- 5. \u042D\u043A\u0440\u0430\u043D\u043D\u044B\u0439 \u043C\u0438\u043A\u0440\u043E\u0440\u0435\u043B\u044C\u0435\u0444 \u043D\u043E\u0440\u043C\u0430\u043B\u0435\u0439 (dFdx/dFdy) ---
        float bumpFade = 1.0 - smoothstep(120.0 * uHorizScale, 420.0 * uHorizScale, camDist);
        float microHeight = mix(nFine * 0.42 + nMid * 0.58, triGrain * 0.72 + strataSharp * 0.28, rockMask);
        microHeight = mix(microHeight, cobblePattern, gravelMask * 0.65);

        vec3 dPosX = dFdx(vWorldPos);
        vec3 dPosY = dFdy(vWorldPos);
        float dHx = dFdx(microHeight) * bumpFade;
        float dHy = dFdy(microHeight) * bumpFade;

        vec3 r1 = cross(dPosY, Ngeom);
        vec3 r2 = cross(Ngeom, dPosX);
        float det = dot(dPosX, r1);
        vec3 surfGrad = sign(det) * (dHx * r1 + dHy * r2);
        float bumpStrength = mix(0.28, 0.58, rockMask);
        vec3 N = normalize(abs(det) > 1e-7 ? (abs(det) * Ngeom - bumpStrength * surfGrad) : Ngeom);

        // --- 6. \u041E\u0441\u0432\u0435\u0449\u0435\u043D\u0438\u0435 + \u0431\u0435\u0433\u0443\u0449\u0438\u0435 \u0442\u0435\u043D\u0438 \u043A\u0443\u0447\u0435\u0432\u044B\u0445 \u043E\u0431\u043B\u0430\u043A\u043E\u0432 \u043F\u043E \u0434\u043E\u043B\u0438\u043D\u0435 ---
        vec2 cloudUv = vWorldPos.xz * (0.0018 / max(1.0, uHorizScale * 0.35)) + vec2(uTime * 0.0065, uTime * 0.0038);
        float cloudNoise = fbm3(cloudUv);
        float cloudShadow = 1.0 - smoothstep(0.54, 0.78, cloudNoise) * 0.28;

        float NdotL = max(0.0, dot(N, uSunDir)) * cloudShadow;
        float hemi = 0.5 + 0.5 * N.y;
        float cavityAO = mix(0.84, 1.06, clamp(microHeight, 0.0, 1.0));
        vec3 bounceLight = vec3(0.24, 0.21, 0.16) * (1.0 - N.y) * 0.24;
        vec3 lighting = (uSunColor * (NdotL * 0.96) + uSkyColor * (0.29 + 0.30 * hemi) + bounceLight) * cavityAO;

        vec3 V = normalize(cameraPosition - vWorldPos);
        vec3 H = normalize(uSunDir + V);
        float wetSpec = pow(max(0.0, dot(N, H)), 56.0) * (wetness * 0.44 + snowMask * 0.30) * cloudShadow;
        vec3 litCol = col * lighting + uSunColor * wetSpec;

        // \u0410\u0434\u0430\u043F\u0442\u0438\u0432\u043D\u044B\u0435 \u0433\u0435\u043E\u0434\u0435\u0437\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u0438\u0437\u043E\u043B\u0438\u043D\u0438\u0438 \u0432\u044B\u0441\u043E\u0442 (\u043C\u0430\u0441\u0448\u0442\u0430\u0431\u0438\u0440\u0443\u044E\u0442\u0441\u044F \u043F\u043E\u0434 0.8 / 5 / 10 \u043A\u043C!)
        if (uShowContours > 0.5) {
          float minorStep = 2.0 * uElevScale;
          float majorStep = 10.0 * uElevScale;
          float minor = abs(fract(vWorldPos.y / minorStep) - 0.5);
          float major = abs(fract(vWorldPos.y / majorStep) - 0.5);
          float lineMinor = 1.0 - smoothstep(0.014, 0.044, minor);
          float lineMajor = 1.0 - smoothstep(0.011, 0.032, major);
          litCol = mix(litCol, vec3(0.95, 0.86, 0.42), lineMinor * 0.32);
          litCol = mix(litCol, vec3(1.0, 0.97, 0.74), lineMajor * 0.72);
        }

        float fogF = 1.0 - exp(-pow(camDist * uFogDensity, 1.62));
        litCol = mix(litCol, uFogColor, clamp(fogF, 0.0, 0.82));

        gl_FragColor = vec4(litCol, 1.0);
      }
    `})}function Hd(r){let t={uTime:{value:0},uSunDir:{value:new k(.52,.74,.42).normalize()},uSunColor:{value:new ft(16774624)},uSkyZenith:{value:new ft(2647213)},uSkyHorizon:{value:new ft(10931688)},uFogColor:{value:new ft(11061992)},uFogDensity:{value:12e-5},uHorizScale:{value:6.51},uElevScale:{value:2.35},uDetailTex:{value:r}};return new Oe({uniforms:t,transparent:!0,depthWrite:!0,side:Xi,vertexShader:`
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
      uniform float uHorizScale;
      uniform float uElevScale;
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

      float vnoise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash21(i), hash21(i + vec2(1.0, 0.0)), u.x),
          mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
          u.y
        );
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
        float uvScale = 1.0 / max(1.0, pow(uHorizScale, 0.62));
        float optDepth = depth / max(1.0, pow(uElevScale, 0.68));

        // --- 1. 3-\u043E\u043A\u0442\u0430\u0432\u043D\u0430\u044F \u0430\u0434\u0432\u0435\u043A\u0446\u0438\u044F \u0432\u043E\u043B\u043D: \u043A\u0440\u0443\u043F\u043D\u0430\u044F \u0432\u0435\u0442\u0440\u043E\u0432\u0430\u044F \u0437\u044B\u0431\u044C \u0431\u044C\u0435\u0444\u0430 + \u0440\u0435\u0447\u043D\u0430\u044F \u0441\u0442\u0440\u0443\u044F + \u043C\u0438\u043A\u0440\u043E-\u0440\u044F\u0431\u044C ---
        vec2 flowDir = speed > 0.02 ? (vel / speed) : vec2(0.0, 1.0);
        vec2 flowStep = vel * (0.048 * uvScale);
        float cycle = 1.24;
        float p0 = fract(uTime / cycle);
        float p1 = fract(uTime / cycle + 0.5);
        float blend = abs(2.0 * p0 - 1.0);

        vec2 swellUv = vWorldPos.xz * (0.026 * uvScale) + vec2(uTime * 0.014, -uTime * 0.011);
        vec4 swellSample = texture2D(uDetailTex, swellUv);

        vec2 baseUv = vWorldPos.xz * (0.084 * uvScale);
        vec4 s0 = texture2D(uDetailTex, baseUv - flowStep * (p0 * cycle));
        vec4 s1 = texture2D(uDetailTex, baseUv - flowStep * (p1 * cycle) + vec2(0.37, 0.61));
        vec4 waveSample = mix(s0, s1, blend);

        vec2 fineUv = vWorldPos.xz * (0.26 * uvScale) + vec2(vort * 0.08, -vort * 0.08);
        vec4 f0 = texture2D(uDetailTex, fineUv - flowStep * (p0 * cycle * 1.7));
        vec4 f1 = texture2D(uDetailTex, fineUv - flowStep * (p1 * cycle * 1.7) + vec2(0.53, 0.19));
        vec4 fineSample = mix(f0, f1, blend);

        float froude = speed / sqrt(9.81 * max(0.08, depth));
        float distFade = 1.0 - smoothstep(260.0 * uHorizScale, 920.0 * uHorizScale, dist) * 0.62;
        float chopAmp = (0.21 + clamp(speed * 0.048 + froude * 0.14, 0.0, 0.52)) * distFade;

        vec2 dN = (
          (swellSample.xy * 2.0 - 1.0) * 0.38 +
          (waveSample.xy * 2.0 - 1.0) * 0.62 +
          (fineSample.xy * 2.0 - 1.0) * 0.42
        ) * chopAmp;
        vec3 N = normalize(vec3(vMacroNormal.x + dN.x, vMacroNormal.y, vMacroNormal.z + dN.y));

        // --- 2. \u041F\u0440\u0435\u043B\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u043F\u043E\u0434\u0432\u043E\u0434\u043D\u043E\u0433\u043E \u0440\u0443\u0441\u043B\u0430 \u043F\u043E \u0437\u0430\u043A\u043E\u043D\u0443 \u0421\u043D\u0435\u043B\u043B\u0438\u0443\u0441\u0430 (n = 1.333) + \u0434\u0432\u043E\u0439\u043D\u0430\u044F \u043A\u0430\u0443\u0441\u0442\u0438\u043A\u0430 \u0412\u043E\u0440\u043E\u043D\u043E\u0433\u043E ---
        float daySun = max(0.14, clamp(uSunDir.y + 0.18, 0.0, 1.0));
        vec2 refrXZ = vWorldPos.xz - N.xz * min(optDepth, 4.2) * (0.58 / max(0.25, uvScale));

        float cobbleA = vnoise(refrXZ * 2.4 * uvScale);
        float cobbleB = vnoise(refrXZ * 6.2 * uvScale);
        vec3 gravelBed = mix(vec3(0.40, 0.37, 0.30), vec3(0.62, 0.57, 0.47), cobbleA * 0.65 + cobbleB * 0.35);

        float slabJoint = clamp(step(0.95, fract(refrXZ.x * 0.24 * uvScale)) + step(0.95, fract(refrXZ.y * 0.24 * uvScale)), 0.0, 1.0);
        vec3 concBed = vec3(0.56, 0.60, 0.64) - slabJoint * 0.14 + (cobbleB - 0.5) * 0.08;
        vec3 bedAlbedo = mix(gravelBed, concBed, isConcreteBed);

        vec2 cUv1 = refrXZ * (0.095 * uvScale) + vec2(uTime * 0.036, uTime * 0.025);
        vec2 cUv2 = refrXZ * (0.145 * uvScale) - vec2(uTime * 0.029, -uTime * 0.032);
        float caust = (texture2D(uDetailTex, cUv1).b + texture2D(uDetailTex, cUv2).b) * 0.88 * exp(-optDepth * 0.27) * daySun;
        vec3 sunlitBed = bedAlbedo * (0.36 + 0.86 * daySun) + uSunColor * caust * 0.58;

        // --- 3. \u0417\u0430\u043A\u043E\u043D \u0411\u0443\u0433\u0435\u0440\u0430 \u2014 \u041B\u0430\u043C\u0431\u0435\u0440\u0442\u0430 \u2014 \u0411\u0435\u0440\u0430 (\u043A\u0440\u0438\u0441\u0442\u0430\u043B\u044C\u043D\u0430\u044F \u043E\u0442\u043C\u0435\u043B\u044C -> \u0431\u0438\u0440\u044E\u0437\u0430 \u0433\u043E\u0440\u043D\u043E\u0439 \u0440\u0435\u043A\u0438 -> \u0441\u0430\u043F\u0444\u0438\u0440 \u0432\u043E\u0434\u043E\u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0430) ---
        float viewCos = max(0.28, abs(dot(N, V)));
        float opticalPath = optDepth / viewCos;

        vec3 sigmaPure = vec3(0.42, 0.088, 0.058);
        vec3 transmittance = exp(-sigmaPure * opticalPath);

        vec3 shallowTurquoise = vec3(0.032, 0.38, 0.42);
        vec3 deepSapphire     = vec3(0.012, 0.11, 0.24);
        vec3 pureScatter = mix(shallowTurquoise, deepSapphire, smoothstep(1.2, 13.5, optDepth)) * (0.30 + 0.85 * daySun);
        vec3 mudScatter = vec3(0.49, 0.36, 0.21) * (0.30 + 0.75 * daySun);
        float mudMask = clamp(sediment * 0.70, 0.0, 0.88);
        vec3 inScatter = mix(pureScatter, mudScatter, mudMask);

        vec3 effTrans = transmittance * (1.0 - mudMask * 0.88);
        vec3 underwaterRadiance = sunlitBed * effTrans + inScatter * (1.0 - effTrans);

        // \u041F\u043E\u0434\u043F\u043E\u0432\u0435\u0440\u0445\u043D\u043E\u0441\u0442\u043D\u043E\u0435 \u0438\u0437\u0443\u043C\u0440\u0443\u0434\u043D\u043E\u0435 \u0441\u0432\u0435\u0447\u0435\u043D\u0438\u0435 \u0433\u0440\u0435\u0431\u043D\u0435\u0439 \u0432\u043E\u043B\u043D \u043D\u0430 \u0441\u043E\u043B\u043D\u0446\u0435 (SSS)
        float sss = pow(clamp(dot(V, -uSunDir + N * 0.65), 0.0, 1.0), 3.0) * (1.0 - mudMask * 0.75);
        underwaterRadiance += vec3(0.05, 0.36, 0.33) * sss * max(0.0, uSunDir.y);

        // --- 4. \u0422\u043E\u0447\u043D\u044B\u0439 \u0437\u0430\u043A\u043E\u043D \u0424\u0440\u0435\u043D\u0435\u043B\u044F \u0428\u043B\u0438\u043A\u0430 (R0 = 0.0204 \u0434\u043B\u044F \u043F\u0440\u0435\u0441\u043D\u043E\u0439 \u0432\u043E\u0434\u044B n = 1.333) \u0438 \u0434\u0432\u043E\u0439\u043D\u043E\u0439 \u0431\u043B\u0438\u043A \u0421\u043E\u043B\u043D\u0446\u0430 ---
        float NdotV = max(0.0, dot(N, V));
        float fresnel = clamp(0.0204 + 0.92 * pow(1.0 - NdotV, 4.8), 0.0204, 0.89);

        vec3 R = reflect(-V, N);
        float skyGrad = clamp(R.y * 0.5 + 0.5, 0.0, 1.0);
        float canyonReflect = 1.0 - smoothstep(0.0, 0.22, R.y) * 0.24;
        vec3 skyRefl = mix(uSkyHorizon, uSkyZenith, pow(skyGrad, 0.72)) * canyonReflect;

        vec3 H = normalize(uSunDir + V);
        float specCore = pow(max(0.0, dot(N, H)), 480.0) * 3.1;
        float specGlitter = pow(max(0.0, dot(N, H)), 64.0) * 0.34;
        vec3 sunSpec = uSunColor * (specCore + specGlitter) * smoothstep(-0.02, 0.12, uSunDir.y);

        // --- 5. \u0410\u043D\u0438\u0437\u043E\u0442\u0440\u043E\u043F\u043D\u0430\u044F \u043A\u0440\u0443\u0436\u0435\u0432\u043D\u0430\u044F \u043F\u0435\u043D\u0430 \u043F\u043E\u0440\u043E\u0433\u043E\u0432, \u0432\u043E\u0434\u043E\u0431\u043E\u0439\u043D\u044B\u0445 \u043A\u043E\u043B\u043E\u0434\u0446\u0435\u0432 \u0438 \u043C\u0435\u043D\u0438\u0441\u043A\u0430 \u0431\u0435\u0440\u0435\u0433\u0430 ---
        vec2 orthoDir = vec2(-flowDir.y, flowDir.x);
        vec2 anisoUv = vec2(
          dot(vWorldPos.xz, flowDir) * (0.075 * uvScale) - uTime * (0.28 + speed * 0.048 * uvScale),
          dot(vWorldPos.xz, orthoDir) * (0.19 * uvScale)
        );
        float lacePattern = texture2D(uDetailTex, anisoUv).a * 0.64
                          + texture2D(uDetailTex, anisoUv * 2.2 + vec2(0.31, -uTime * 0.09)).a * 0.36;

        float shoreMeniscus = (1.0 - smoothstep(0.015, 0.22, optDepth)) * clamp(speed * 0.25, 0.12, 0.72);
        float totalFoamDrive = clamp(foamVal * 1.25 + shoreMeniscus + clamp(froude - 1.05, 0.0, 0.72) * 0.62, 0.0, 1.0);
        float foamMask = smoothstep(0.35 - totalFoamDrive * 0.30, 0.74 - totalFoamDrive * 0.22, lacePattern * totalFoamDrive * 1.56);
        vec3 foamColor = vec3(0.96, 0.985, 1.0) * (0.38 + 0.66 * daySun);

        vec3 surfaceCol = mix(underwaterRadiance, skyRefl, fresnel) + sunSpec * (1.0 - foamMask * 0.72);
        vec3 finalCol = mix(surfaceCol, foamColor, foamMask);

        float distFog = 1.0 - exp(-pow(dist * uFogDensity, 1.62));
        finalCol = mix(finalCol, uFogColor, clamp(distFog, 0.0, 0.82));

        float edgeAlpha = smoothstep(0.010, 0.070, optDepth);
        gl_FragColor = vec4(finalCol, edgeAlpha);
      }
    `})}function Gd(r){return new Oe({transparent:!0,depthWrite:!1,side:Xe,uniforms:{uTime:{value:0},uSunFactor:{value:1},uOverflowTex:{value:r},uFogColor:{value:new ft(11061992)},uFogDensity:{value:12e-5}},vertexShader:`
      varying vec2 vUv;
      varying vec3 vWorldPos;

      void main() {
        vUv = uv;
        #ifdef USE_INSTANCING
          vec4 wp = modelMatrix * instanceMatrix * vec4(position, 1.0);
        #else
          vec4 wp = modelMatrix * vec4(position, 1.0);
        #endif
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,fragmentShader:`
      uniform float uTime;
      uniform float uSunFactor;
      uniform sampler2D uOverflowTex;
      uniform vec3 uFogColor;
      uniform float uFogDensity;

      varying vec2 vUv;
      varying vec3 vWorldPos;

      void main() {
        // \u0412\u043E\u0434\u0430 \u0440\u0430\u0437\u0433\u043E\u043D\u044F\u0435\u0442\u0441\u044F \u043F\u043E\u0434 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435\u043C \u0433\u0440\u0430\u0432\u0438\u0442\u0430\u0446\u0438\u0438 g \u043F\u0440\u0438 \u043F\u0430\u0434\u0435\u043D\u0438\u0438 \u0441\u0432\u0435\u0440\u0445\u0443 \u0432\u043D\u0438\u0437 (vUv.y: 0 -> 1)
        vec2 uvFast = vec2(vUv.x * 1.4, vUv.y * 1.6 - uTime * 2.85);
        vec2 uvFine = vec2(vUv.x * 2.7 + 0.33, vUv.y * 2.4 - uTime * 4.10);

        vec4 s1 = texture2D(uOverflowTex, uvFast);
        vec4 s2 = texture2D(uOverflowTex, uvFine);

        // \u041D\u0430 \u0433\u0440\u0435\u0431\u043D\u0435 (vUv.y ~ 0) \u0432\u043E\u0434\u0430 \u0438\u0437\u0443\u043C\u0440\u0443\u0434\u043D\u043E-\u0433\u043E\u043B\u0443\u0431\u0430\u044F, \u043A \u043E\u0441\u043D\u043E\u0432\u0430\u043D\u0438\u044E \u0430\u044D\u0440\u0438\u0440\u0443\u0435\u0442\u0441\u044F \u0432 \u043A\u0438\u043F\u044F\u0449\u0443\u044E \u0431\u0435\u043B\u0443\u044E \u043F\u0435\u043D\u0443!
        float aeration = smoothstep(0.08, 0.88, vUv.y);
        vec3 crestAqua = vec3(0.16, 0.62, 0.76);
        vec3 whiteFoam = vec3(0.95, 0.985, 1.0);
        vec3 col = mix(crestAqua, whiteFoam, clamp(aeration * 0.68 + (s1.r * 0.5 + s2.r * 0.5) * 0.45, 0.0, 1.0));
        col *= (0.42 + 0.64 * uSunFactor);

        // \u041C\u044F\u0433\u043A\u0438\u0435 \u043A\u0440\u0430\u044F \u0441\u0442\u0440\u0443\u0438 \u0441\u043B\u0435\u0432\u0430/\u0441\u043F\u0440\u0430\u0432\u0430 \u0438 \u043F\u043B\u0430\u0432\u043D\u044B\u0439 \u0432\u0445\u043E\u0434 \u0432 \u043D\u0438\u0436\u043D\u0438\u0439 \u0431\u044C\u0435\u0444
        float sideFade = smoothstep(0.0, 0.14, vUv.x) * (1.0 - smoothstep(0.86, 1.0, vUv.x));
        float tipFade = smoothstep(0.0, 0.08, vUv.y) * (1.0 - smoothstep(0.90, 1.0, vUv.y));
        float alpha = clamp((s1.a * 0.58 + s2.a * 0.48) * sideFade * tipFade * 1.18, 0.0, 0.94);

        float dist = length(cameraPosition - vWorldPos);
        float fogF = 1.0 - exp(-pow(dist * uFogDensity, 1.62));
        col = mix(col, uFogColor, clamp(fogF, 0.0, 0.82));

        gl_FragColor = vec4(col, alpha);
      }
    `})}function Vd(r=null,t=null){return new Oe({uniforms:{uSunDir:{value:new k(.5,.7,.4).normalize()},uSunColor:{value:new ft(16774364)},uSkyColor:{value:new ft(8369128)},uNightFactor:{value:0},uFogColor:{value:new ft(11061992)},uFogDensity:{value:12e-5},uRoofTex:{value:r},uHasRoofTex:{value:r?1:0},uFacadeAtlas:{value:t||r},uHasAtlas:{value:t?1:0}},vertexShader:`
      attribute float aPowered;
      attribute float aStyleId;
      varying vec3 vWorldPos;
      varying vec3 vLocalPos;
      varying vec3 vNormalW;
      varying vec3 vColor;
      varying float vPowered;
      varying float vStyleId;

      void main() {
        vLocalPos = position;
        vPowered = aPowered;
        vStyleId = aStyleId;
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
      uniform sampler2D uRoofTex;
      uniform float uHasRoofTex;
      uniform sampler2D uFacadeAtlas;
      uniform float uHasAtlas;

      varying vec3 vWorldPos;
      varying vec3 vLocalPos;
      varying vec3 vNormalW;
      varying vec3 vColor;
      varying float vPowered;
      varying float vStyleId;

      float hash21(vec2 p) {
        p = fract(p * vec2(127.1, 311.7));
        p += dot(p, p + 34.2);
        return fract(p.x * p.y);
      }

      void main() {
        vec3 N = normalize(vNormalW);
        float NdotL = max(0.0, dot(N, uSunDir));
        vec3 baseAlbedo = vColor;

        // \u0412\u044B\u0431\u043E\u0440\u043A\u0430 \u0442\u0430\u0439\u043B\u0430 \u0438\u0437 8\xD78 \u041C\u0435\u0433\u0430-\u0430\u0442\u043B\u0430\u0441\u0430 \u0444\u0430\u0441\u0430\u0434\u043E\u0432 \u043F\u043E \u0438\u043D\u0434\u0435\u043A\u0441\u0443 \u0441\u0442\u0438\u043B\u044F \u0437\u0434\u0430\u043D\u0438\u044F (64 \u0444\u0430\u043A\u0442\u0443\u0440\u044B!)
        if (uHasAtlas > 0.5 && N.y <= 0.55) {
          float tileIdx = mod(floor(vStyleId + 0.5), 64.0);
          vec2 tileOrigin = vec2(mod(tileIdx, 8.0), floor(tileIdx / 8.0)) / 8.0;
          float uWall = abs(N.x) > 0.5 ? vWorldPos.z : vWorldPos.x;
          vec2 localTileUv = fract(vec2(uWall * 0.14, vWorldPos.y * 0.14)) * (0.84 / 8.0) + (0.08 / 8.0);
          vec3 atlasTex = texture2D(uFacadeAtlas, tileOrigin + localTileUv).rgb;
          baseAlbedo = mix(baseAlbedo, baseAlbedo * (0.62 + 0.72 * atlasTex), 0.65);
        }

        if (N.y > 0.55) {
          float roofEdge = max(abs(vLocalPos.x), abs(vLocalPos.z));
          float parapet = smoothstep(0.41, 0.46, roofEdge);
          vec3 roofGrain = uHasRoofTex > 0.5 ? texture2D(uRoofTex, vWorldPos.xz * 0.25).rgb : vec3(0.55);
          baseAlbedo = mix(roofGrain * mix(vec3(0.68), vColor, 0.42), vColor * 0.88, parapet);
        } else {
          float plinth = 1.0 - smoothstep(0.05, 0.11, vLocalPos.y);
          float cornice = smoothstep(0.93, 0.96, vLocalPos.y);
          float cornerTrim = smoothstep(0.42, 0.47, max(abs(vLocalPos.x), abs(vLocalPos.z)));
          float floorBand = step(0.91, fract(vWorldPos.y * 0.34));
          baseAlbedo *= (1.0 - plinth * 0.24 - floorBand * 0.08 + cornice * 0.12 + cornerTrim * 0.08);
        }

        vec3 litWall = baseAlbedo * (uSunColor * NdotL * 0.88 + uSkyColor * (0.30 + 0.26 * max(0.0, N.y)));

        // \u0414\u0435\u0442\u0430\u043B\u0438\u0437\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0435 \u043E\u043A\u043D\u0430 \u0441 \u043F\u0435\u0440\u0435\u043F\u043B\u0451\u0442\u0430\u043C\u0438 (\u043A\u0440\u043E\u043C\u0435 \u0433\u043B\u0443\u0445\u0438\u0445 \u0441\u0438\u043B\u043E\u0441\u043E\u0432/\u0433\u0440\u0430\u0434\u0438\u0440\u0435\u043D style 13, 19)
        bool hasWindows = abs(vStyleId - 13.0) > 0.4 && abs(vStyleId - 19.0) > 0.4;
        if (hasWindows && abs(N.y) < 0.45) {
          float uCoord = abs(N.x) > 0.5 ? vWorldPos.z : vWorldPos.x;
          vec2 winGrid = vec2(uCoord * 0.52, vWorldPos.y * 0.34);
          vec2 cell = floor(winGrid);
          vec2 f = fract(winGrid);

          float inWin = step(0.18, f.x) * step(f.x, 0.82) * step(0.22, f.y) * step(f.y, 0.80);
          inWin *= step(0.09, vLocalPos.y) * step(vLocalPos.y, 0.93);
          inWin *= (1.0 - smoothstep(0.43, 0.47, max(abs(vLocalPos.x), abs(vLocalPos.z))));

          if (inWin > 0.5) {
            float frame = 1.0 - (step(0.23, f.x) * step(f.x, 0.77) * step(0.27, f.y) * step(f.y, 0.75));
            float mullion = 1.0 - smoothstep(0.0, 0.035, abs(f.x - 0.5));
            float frameMask = clamp(frame + mullion * 0.65, 0.0, 1.0);

            float rnd = hash21(cell + vStyleId * 3.1);
            float tintRnd = hash21(cell + 19.7);
            vec3 dayGlass = mix(vec3(0.13, 0.24, 0.36), uSkyColor * 0.94, 0.40 + f.y * 0.28);

            float onProb = vPowered > 0.5 ? 0.78 : 0.06;
            float windowLit = step(1.0 - onProb, rnd) * uNightFactor;
            // \u0414\u043B\u044F \u0426\u041E\u0414 \u0418\u0418 (style 20,21) \u2014 \u0431\u0438\u0440\u044E\u0437\u043E\u0432\u044B\u0435 \u0441\u0435\u0440\u0432\u0435\u0440\u043D\u044B\u0435 \u0441\u0442\u043E\u0439\u043A\u0438, \u0434\u043B\u044F \u043E\u0441\u0442\u0430\u043B\u044C\u043D\u044B\u0445 \u2014 \u0442\u0451\u043F\u043B\u044B\u0435 \u043B\u0430\u043C\u043F\u044B!
            vec3 nightHue = (abs(vStyleId - 20.0) < 1.2)
              ? vec3(0.25, 0.92, 1.0)
              : mix(vec3(1.0, 0.81, 0.44), vec3(0.72, 0.91, 1.0), step(0.76, tintRnd));
            vec3 paneCol = mix(dayGlass, nightHue * (vPowered > 0.5 ? 1.40 : 0.42), windowLit);
            litWall = mix(paneCol, vec3(0.16, 0.19, 0.23), frameMask * 0.75);
          }
        }

        float dist = length(cameraPosition - vWorldPos);
        float fogF = 1.0 - exp(-pow(dist * uFogDensity, 1.62));
        litWall = mix(litWall, uFogColor, clamp(fogF, 0.0, 0.82));

        gl_FragColor = vec4(litWall, 1.0);
      }
    `})}var ae=new ue,Ie=new k,Le=new fi,Ee=new k,hi=new pi,Ni=new ft;function Bg(){let r=new gi(1.95,3.8,7);r.translate(0,3.5,0);let t=new gi(1.42,3.3,7);t.translate(0,5.5,0);let e=r.attributes.position.array,i=r.attributes.normal.array,n=r.attributes.uv.array,s=r.index.array,o=t.attributes.position.array,a=t.attributes.normal.array,c=t.attributes.uv.array,l=t.index.array,h=e.length/3,u=new Float32Array(e.length+o.length);u.set(e,0),u.set(o,e.length);let d=new Float32Array(i.length+a.length);d.set(i,0),d.set(a,i.length);let f=new Float32Array(n.length+c.length);f.set(n,0),f.set(c,n.length);let g=new Uint16Array(s.length+l.length);g.set(s,0);for(let p=0;p<l.length;p++)g[s.length+p]=l[p]+h;let y=new xe;return y.setAttribute("position",new he(u,3)),y.setAttribute("normal",new he(d,3)),y.setAttribute("uv",new he(f,2)),y.setIndex(new he(g,1)),r.dispose(),t.dispose(),y}function Wd(){let e=[],i=[],n=[],s=[];for(let a=0;a<2;a++){let c=a===0?1:-1,l=e.length/3;for(let h=0;h<=8;h++){let u=h/8,d=-.12+.38*u+.56*u*u,f=.04*Math.sin(u*Math.PI*.5)-u*u,g=.16*(1-.35*u)*c,y=.38+1.12*u,p=-2*u,m=Math.hypot(y,p)||1,_=-p/m*c,M=y/m*c;for(let v=0;v<=2;v++){let w=v/2-.5;e.push(d+_*Math.abs(g),f+M*Math.abs(g),w),i.push(_,M,0),n.push(v/2,u*1.35)}}for(let h=0;h<8;h++)for(let u=0;u<2;u++){let d=l+h*3+u,f=d+1,g=d+3,y=g+1;a===0?s.push(d,g,f,f,g,y):s.push(d,f,g,f,y,g)}}let o=new xe;return o.setAttribute("position",new ee(e,3)),o.setAttribute("normal",new ee(i,3)),o.setAttribute("uv",new ee(n,2)),o.setIndex(s),o}var Va=class{constructor(t,e,i,n,s=null,o=null){this.scene=t,this.hydro=e,this.economy=i,this.profile=n,this.textures=o||za(s),this.detailTex=this.textures.waterDetail,this.hemiLight=new nr(9356799,4017973,.74),this.scene.add(this.hemiLight),this.sunLight=new rr(16774107,1.48),this.sunLight.position.set(220,310,170),this.scene.add(this.sunLight.target),n.shadows&&(this.sunLight.castShadow=!0,this.sunLight.shadow.mapSize.set(2048,2048),this.sunLight.shadow.bias=-6e-4),this.scene.add(this.sunLight),this._syncShadowFrustum(),this.skyColorZenith=new ft(2647213),this.skyColorHorizon=new ft(10931688),this.fogColor=new ft(10931688),this.scene.background=this.fogColor.clone(),this._buildTerrainMesh(),this._buildWaterMesh(),this._buildOverflow3DPools(),this._buildNatureInstances(),this.cityDisksGroup=new Ce,this.scene.add(this.cityDisksGroup),this._buildCityInstancedPools(),this._rebuildCityDisks(),this._buildVolumetricConstructionPools(),this.structuresGroup=new Ce,this.scene.add(this.structuresGroup),this.structMeshes=new Map,this._buildPowerLinePools(),this.livingWorld=new Ha(this.scene,this.hydro,this.economy,this.textures),this._buildCursorPreview(),this._buildIrrigationBeacon(),this._buildTutorialBeacon()}_syncShadowFrustum(){if(!this.profile.shadows)return;let t=J(420*Math.pow(U.horizScale,.55),395,1650);this.sunLight.shadow.camera.near=40,this.sunLight.shadow.camera.far=t*3.8,this.sunLight.shadow.camera.left=-t,this.sunLight.shadow.camera.right=t,this.sunLight.shadow.camera.top=t,this.sunLight.shadow.camera.bottom=-t,this.sunLight.shadow.camera.updateProjectionMatrix()}rebuildForNewValley(){let t=this.hydro.grid,e=this.hydro.dx,i=U.size*.5,n=this.terrainPosAttr.array,s=this.waterPosAttr.array;for(let a=0;a<t;a++){let c=-i+(a+.5)*e;for(let l=0;l<t;l++){let h=-i+(l+.5)*e,u=(a*t+l)*3;n[u]=h,n[u+2]=c,s[u]=h,s[u+2]=c}}this.terrainMesh.geometry.boundingSphere=null,this.waterMesh.geometry.boundingSphere=null,this.skirtMesh&&(this.skirtMesh.scale.set(U.size,32*U.elevScale,U.size),this.skirtMesh.position.set(0,-15.6*U.elevScale,0),this.skirtMesh.updateMatrix()),this.terrainMat.uniforms.uHorizScale.value=U.horizScale,this.terrainMat.uniforms.uElevScale.value=U.elevScale,this.terrainMat.uniforms.uSnowLine.value=U.snowLineY,this.waterMat.uniforms.uHorizScale.value=U.horizScale,this.waterMat.uniforms.uElevScale.value=U.elevScale,this._syncShadowFrustum(),this.updateTerrainGeometryRect(0,0,t-1,t-1),this._populateNatureInstances(),this._rebuildCityDisks();for(let[,a]of this.structMeshes.entries())this.structuresGroup.remove(a);this.structMeshes.clear();let o=this.economy.cities.find(a=>a.archetype==="agro");if(this.irrBeacon&&o&&o.irrigationTarget){let a=o.irrigationTarget.x,c=o.irrigationTarget.z,l=this.hydro.sampleAtWorld(a,c).bed,h=Math.pow(U.horizScale,.65);this.irrBeacon.position.set(a,l+.45*U.elevScale,c),this.irrBeacon.userData.baseScale=h}this.livingWorld&&this.livingWorld.rebuildWorldActors(),this.hydro.engineeredDirty=!0,this.economy.buildingsDirty=!0,this.economy.powerLinesDirty=!0,this.syncEngineeredVolumes(),this.syncCityInstances(),this.syncHydroStructures(),this.updateOverflowWater3D(0)}_buildTerrainMesh(){let t=this.hydro.grid,e=t*t,i=this.hydro.dx,n=U.size*.5,s=new xe,o=new Float32Array(e*3),a=new Float32Array(e*3),c=new Float32Array(e*4);for(let f=0;f<t;f++){let g=-n+(f+.5)*i;for(let y=0;y<t;y++){let p=-n+(y+.5)*i,m=f*t+y,_=m*3;o[_]=p,o[_+1]=this.hydro.zb[m],o[_+2]=g,a[_+1]=1}}let l=new Uint32Array((t-1)*(t-1)*6),h=0;for(let f=0;f<t-1;f++)for(let g=0;g<t-1;g++){let y=f*t+g,p=y+1,m=y+t,_=m+1;l[h++]=y,l[h++]=m,l[h++]=p,l[h++]=p,l[h++]=m,l[h++]=_}s.setIndex(new he(l,1)),this.terrainPosAttr=new he(o,3),this.terrainPosAttr.setUsage(je),this.terrainNormAttr=new he(a,3),this.terrainNormAttr.setUsage(je),this.terrainMetaAttr=new he(c,4),this.terrainMetaAttr.setUsage(je),s.setAttribute("position",this.terrainPosAttr),s.setAttribute("normal",this.terrainNormAttr),s.setAttribute("aTerrainMeta",this.terrainMetaAttr),this.terrainMat=kd(this.detailTex,this.textures.concreteMap),this.terrainMesh=new wt(s,this.terrainMat),this.terrainMesh.receiveShadow=!!this.profile.shadows,this.terrainMesh.castShadow=!!this.profile.shadows,this.terrainMesh.frustumCulled=!1,this.terrainMesh.matrixAutoUpdate=!1,this.terrainMesh.updateMatrix(),this.scene.add(this.terrainMesh);let u=new de({color:2501684,map:this.textures.rock}),d=new Vt(1,1,1);this.skirtMesh=new wt(d,u),this.skirtMesh.scale.set(U.size,32*U.elevScale,U.size),this.skirtMesh.position.set(0,-15.6*U.elevScale,0),this.skirtMesh.frustumCulled=!1,this.skirtMesh.matrixAutoUpdate=!1,this.skirtMesh.updateMatrix(),this.scene.add(this.skirtMesh),this.updateTerrainGeometryRect(0,0,t-1,t-1)}_buildWaterMesh(){let t=this.hydro.grid,e=t*t,i=this.hydro.dx,n=U.size*.5,s=new xe,o=new Float32Array(e*3),a=new Float32Array(e*3),c=new Float32Array(e*4),l=new Float32Array(e*4);for(let h=0;h<t;h++){let u=-n+(h+.5)*i;for(let d=0;d<t;d++){let f=-n+(d+.5)*i,g=h*t+d,y=g*3;o[y]=f,o[y+1]=this.hydro.zb[g]+this.hydro.h[g],o[y+2]=u,a[y+1]=1}}s.setIndex(this.terrainMesh.geometry.getIndex()),this.waterPosAttr=new he(o,3),this.waterPosAttr.setUsage(je),this.waterNormAttr=new he(a,3),this.waterNormAttr.setUsage(je),this.waterH1Attr=new he(c,4),this.waterH1Attr.setUsage(je),this.waterH2Attr=new he(l,4),this.waterH2Attr.setUsage(je),s.setAttribute("position",this.waterPosAttr),s.setAttribute("normal",this.waterNormAttr),s.setAttribute("aHydro1",this.waterH1Attr),s.setAttribute("aHydro2",this.waterH2Attr),this.waterMat=Hd(this.detailTex),this.waterMesh=new wt(s,this.waterMat),this.waterMesh.renderOrder=2,this.waterMesh.frustumCulled=!1,this.waterMesh.matrixAutoUpdate=!1,this.waterMesh.updateMatrix(),this.scene.add(this.waterMesh)}_buildOverflow3DPools(){this.overflowWaterMat=Gd(this.textures.overflowCascade);let t=Wd();this.maxOverflows=300,this.overflowNappeIM=new fe(t,this.overflowWaterMat,this.maxOverflows),this.overflowNappeIM.count=0,this.overflowNappeIM.renderOrder=3,this.overflowNappeIM.frustumCulled=!1,this.scene.add(this.overflowNappeIM);let e=new Ne(.65,.85,1,10);e.rotateX(Math.PI*.5),this.plungeRollerMat=new be({color:16055295,map:this.textures.overflowCascade,transparent:!0,opacity:.82,depthWrite:!1}),this.plungeRollerIM=new fe(e,this.plungeRollerMat,this.maxOverflows),this.plungeRollerIM.count=0,this.plungeRollerIM.renderOrder=4,this.plungeRollerIM.frustumCulled=!1,this.scene.add(this.plungeRollerIM)}updateOverflowWater3D(t){this.overflowWaterMat.uniforms.uTime.value=t;let e=this.hydro.overflowEdges||[],i=Math.min(e.length,this.maxOverflows);for(let n=0;n<i;n++){let s=e[n],o=1+Math.sin(t*9.5+n*1.3)*.06,a=Math.max(this.hydro.dx*.65,s.dropH*.42);Ie.set(s.wx,s.crestY,s.wz),hi.set(0,-s.yaw,0),Le.setFromEuler(hi),Ee.set(a*o,s.dropH,s.width*1.08),ae.compose(Ie,Le,Ee),this.overflowNappeIM.setMatrixAt(n,ae);let c=s.wx+s.dirX*a*.82,l=s.wz+s.dirZ*a*.82,h=J(.8+s.headH*.9,.8,4.5)*Math.pow(U.horizScale,.45)*o;Ie.set(c,s.toeY+h*.25,l),hi.set(0,-s.yaw,t*4.5+n),Le.setFromEuler(hi),Ee.set(h,s.width*1.12,h),ae.compose(Ie,Le,Ee),this.plungeRollerIM.setMatrixAt(n,ae)}this.overflowNappeIM.count=i,this.plungeRollerIM.count=i,i>0&&(this.overflowNappeIM.instanceMatrix.needsUpdate=!0,this.plungeRollerIM.instanceMatrix.needsUpdate=!0)}_buildNatureInstances(){let t=this.profile.treeCount,e=this.profile.rockCount,i=new Ne(.2,.38,2.3,6);i.translate(0,1.15,0);let n=Bg(),s=new de({map:this.textures.bark}),o=new de({color:16777215,map:this.textures.foliage});this.treeTrunks=new fe(i,s,t),this.treeCrowns=new fe(n,o,t),this.treeCrowns.castShadow=!!this.profile.shadows,this.treeTrunks.frustumCulled=!1,this.treeCrowns.frustumCulled=!1,this.treeTrunks.matrixAutoUpdate=!1,this.treeCrowns.matrixAutoUpdate=!1,this.scene.add(this.treeTrunks),this.scene.add(this.treeCrowns);let a=new kn(1.35,1),c=new de({color:16777215,map:this.textures.rock});this.rockInstances=new fe(a,c,e),this.rockInstances.castShadow=!!this.profile.shadows,this.rockInstances.frustumCulled=!1,this.rockInstances.matrixAutoUpdate=!1,this.scene.add(this.rockInstances),this._populateNatureInstances()}_populateNatureInstances(){let t=Yn(424242),e=this.profile.treeCount,i=this.profile.rockCount,n=Math.pow(U.horizScale,.56),s=U.snowLineY*.78,o=6.8*U.elevScale;this.treeSlots=[];let a=0,c=0;for(;a<e&&c<e*9;){c++;let h=(t()-.5)*(U.size*.96),u=(t()-.5)*(U.size*.96),d=this.hydro.sampleAtWorld(h,u);if(d.depth>.03||d.bed>s||d.bed<o||d.soil<.65*U.elevScale)continue;let f=!1;for(let p of this.economy.cities)if(Math.hypot(h-p.x,u-p.z)<p.plateauRadius*1.05){f=!0;break}if(f)continue;let g=(.74+t()*.82)*n;Ie.set(h,d.bed-.15,u),hi.set(0,t()*Math.PI*2,0),Le.setFromEuler(hi),Ee.set(g,g*(.92+t()*.38),g),ae.compose(Ie,Le,Ee),this.treeTrunks.setMatrixAt(a,ae),this.treeCrowns.setMatrixAt(a,ae);let y=Qi("flora_agro",a+Math.floor(t()*50));Ni.setRGB(y.r*1.25,y.g*1.25,y.b*1.25),this.treeCrowns.setColorAt(a,Ni),this.treeSlots.push({index:a,wx:h,wz:u,baseBed:d.bed,alive:!0}),a++}this.treeTrunks.count=a,this.treeCrowns.count=a,this.treeTrunks.instanceMatrix.needsUpdate=!0,this.treeCrowns.instanceMatrix.needsUpdate=!0,this.treeCrowns.instanceColor&&(this.treeCrowns.instanceColor.needsUpdate=!0),this.rockSlots=[];let l=0;for(let h=0;h<i*6&&l<i;h++){let u=(t()-.5)*(U.size*.96),d=(t()-.5)*(U.size*.96),f=this.hydro.sampleAtWorld(u,d);if(f.depth>.5)continue;let g=!1;for(let p of this.economy.cities)if(Math.hypot(u-p.x,d-p.z)<p.plateauRadius){g=!0;break}if(g)continue;Ie.set(u,f.bed+.18,d),hi.set(t()*3,t()*3,t()*3),Le.setFromEuler(hi),Ee.set((.65+t()*1.5)*n,(.45+t()*.95)*n,(.65+t()*1.5)*n),ae.compose(Ie,Le,Ee);let y=Qi("rock_strata",l*3);Ni.setRGB(y.r*1.35,y.g*1.35,y.b*1.35),this.rockInstances.setColorAt(l,Ni),this.rockSlots.push({index:l,wx:u,wz:d,baseBed:f.bed,alive:!0}),this.rockInstances.setMatrixAt(l++,ae)}this.rockInstances.count=l,this.rockInstances.instanceMatrix.needsUpdate=!0,this.rockInstances.instanceColor&&(this.rockInstances.instanceColor.needsUpdate=!0)}_buildCityInstancedPools(){let e=new Vt(1,1,1);e.translate(0,.5,0),this.cityPoweredArr=new Float32Array(720),this.cityStyleArr=new Float32Array(720),this.cityPoweredAttr=new Wi(this.cityPoweredArr,1),this.cityPoweredAttr.setUsage(je),this.cityStyleAttr=new Wi(this.cityStyleArr,1),this.cityStyleAttr.setUsage(je),e.setAttribute("aPowered",this.cityPoweredAttr),e.setAttribute("aStyleId",this.cityStyleAttr);let i=new Ne(.42,.52,1,12);i.translate(0,.5,0),this.siloPoweredArr=new Float32Array(720),this.siloStyleArr=new Float32Array(720),this.siloPoweredAttr=new Wi(this.siloPoweredArr,1),this.siloStyleAttr=new Wi(this.siloStyleArr,1),i.setAttribute("aPowered",this.siloPoweredAttr),i.setAttribute("aStyleId",this.siloStyleAttr);let n=new gi(.76,.44,4);n.rotateY(Math.PI*.25),n.translate(0,.22,0);let s=new _n(.52,12,8,0,Math.PI*2,0,Math.PI*.5);this.cityBodyMat=Vd(this.textures.roof,this.textures.facadeAtlas);let o=new de({color:16777215,map:this.textures.roof}),a=new xi({color:14870768,roughness:.28,metalness:.48});this.cityBodies=new fe(e,this.cityBodyMat,720),this.citySilos=new fe(i,this.cityBodyMat,720),this.cityRoofs=new fe(n,o,720),this.cityDomes=new fe(s,a,720),this.cityBodies.castShadow=!!this.profile.shadows,this.cityBodies.receiveShadow=!!this.profile.shadows,this.citySilos.castShadow=!!this.profile.shadows,this.cityBodies.frustumCulled=!1,this.citySilos.frustumCulled=!1,this.cityRoofs.frustumCulled=!1,this.cityDomes.frustumCulled=!1,this.scene.add(this.cityBodies,this.citySilos,this.cityRoofs,this.cityDomes)}_rebuildCityDisks(){for(;this.cityDisksGroup.children.length>0;)this.cityDisksGroup.remove(this.cityDisksGroup.children[0]);for(let t of this.economy.cities){let e=new vn(4.5*U.horizScale,t.plateauRadius*.88,40);e.rotateX(-Math.PI*.5);let i=t.archetype==="agro"?7307075:t.archetype==="resort"?9143664:6054764,n=new de({color:i,map:this.textures.concreteMap,transparent:!0,opacity:.44}),s=new wt(e,n),o=this.hydro.sampleAtWorld(t.x,t.z).bed;s.position.set(t.x,o+.12*U.elevScale,t.z),s.frustumCulled=!1,s.matrixAutoUpdate=!1,s.updateMatrix(),this.cityDisksGroup.add(s)}}_buildVolumetricConstructionPools(){let t=new tr({color:14541802,map:this.textures.concreteMap,bumpMap:this.textures.concreteBump,bumpScale:.35,shininess:14}),e=new de({color:16777215,map:this.textures.rebarFormwork}),i=new Vt(1,1,1);i.translate(0,.5,0),this.damMonolithMesh=new fe(i,t,2600),this.damMonolithMesh.count=0,this.damMonolithMesh.castShadow=!!this.profile.shadows,this.damMonolithMesh.receiveShadow=!!this.profile.shadows,this.damMonolithMesh.frustumCulled=!1,this.damMonolithMesh.matrixAutoUpdate=!1,this.scene.add(this.damMonolithMesh);let n=new Vt(1.06,1,1.06);n.translate(0,.5,0),this.scaffoldingMesh=new fe(n,e,1400),this.scaffoldingMesh.count=0,this.scaffoldingMesh.castShadow=!!this.profile.shadows,this.scaffoldingMesh.frustumCulled=!1,this.scaffoldingMesh.matrixAutoUpdate=!1,this.scene.add(this.scaffoldingMesh);let s=new Ne(.32,.92,1,4);s.rotateY(Math.PI*.25),s.translate(0,.5,.25),this.buttressMesh=new fe(s,t,1600),this.buttressMesh.count=0,this.buttressMesh.castShadow=!!this.profile.shadows,this.buttressMesh.receiveShadow=!!this.profile.shadows,this.buttressMesh.frustumCulled=!1,this.buttressMesh.matrixAutoUpdate=!1,this.scene.add(this.buttressMesh);let o=new Vt(1,1,1);o.translate(0,.5,0),this.canalCurbMesh=new fe(o,t,2e3),this.canalCurbMesh.count=0,this.canalCurbMesh.receiveShadow=!!this.profile.shadows,this.canalCurbMesh.frustumCulled=!1,this.canalCurbMesh.matrixAutoUpdate=!1,this.scene.add(this.canalCurbMesh),this.cranes=[];for(let a=0;a<6;a++){let c=this._createTowerCraneMesh(a);c.visible=!1,this.scene.add(c),this.cranes.push(c)}}_createTowerCraneMesh(t){let e=new Ce,i=new de({color:16096779,map:this.textures.steel}),n=new de({color:3359061,map:this.textures.concreteMap}),s=new wt(new Vt(4.2,1.2,4.2),n);s.position.y=.6,e.add(s);let o=new wt(new Vt(1.35,19,1.35),i);o.position.y=10.1,o.castShadow=!!this.profile.shadows,e.add(o);let a=new Ce;a.position.y=19.6;let c=new wt(new Vt(2.1,2.2,2.1),i);c.position.set(.6,.8,0);let l=new wt(new Vt(21,.95,1.05),i);l.position.set(4.5,1.4,0),l.castShadow=!!this.profile.shadows;let h=new wt(new gi(.9,3.4,4),i);h.position.set(0,3.4,0);let u=new wt(new Vt(3.4,1.8,2),n);u.position.set(-4.8,.9,0);let d=new Ce;d.position.set(10.5,1,0);let f=new wt(new Ne(.08,.08,9.5,5),new be({color:13358561}));f.position.y=-4.75;let g=new wt(new Ne(.95,.55,1.8,8),n);return g.position.y=-9.6,d.add(f,g),a.add(c,l,h,u,d),e.add(a),e.userData.slew=a,e.userData.hoist=d,e.userData.seed=t*1.7,e}syncEngineeredVolumes(){if(!this.hydro.engineeredDirty)return;this.hydro.engineeredDirty=!1;let t=this.hydro.grid,e=this.hydro.dx,i=U.size*.5,{bedrock:n,soil:s,concrete:o,targetConcrete:a,foundationMask:c,buttressYaw:l,linedMask:h,gateWall:u}=this.hydro,d=0,f=0,g=0,y=0,p=this.damMonolithMesh.instanceMatrix.count,m=this.scaffoldingMesh.instanceMatrix.count,_=this.buttressMesh.instanceMatrix.count,M=this.canalCurbMesh.instanceMatrix.count;for(let v=1;v<t-1;v++){let w=-i+(v+.5)*e,S=v*t;for(let T=1;T<t-1;T++){let x=S+T,E=o[x],C=a[x],R=c[x]===1,L=h[x]===1;if(E<.9&&C<.9&&!R&&!L)continue;let D=-i+(T+.5)*e,I=n[x]+s[x];if(E>=1.35&&u[x]<.05&&d<p){Ie.set(D,I-.35,w),Le.identity(),Ee.set(e*.96,E+.52,e*.96),ae.compose(Ie,Le,Ee),this.damMonolithMesh.setMatrixAt(d,ae);let F=Qi("hydro_concrete",T*7+v*13);Ni.setRGB(F.r*1.28,F.g*1.28,F.b*1.28),this.damMonolithMesh.setColorAt(d,Ni),d++}if(C>E+.08&&f<m){let F=I+E*.85,z=Math.max(1.2,C-E*.85+.65);Ie.set(D,F,w),Le.identity(),Ee.set(e*1.02,z,e*1.02),ae.compose(Ie,Le,Ee),this.scaffoldingMesh.setMatrixAt(f++,ae)}if(R&&g<_){let F=Math.max(2.6*U.elevScale,Math.max(E,C)*.92+1.4);Ie.set(D,I-.6,w),hi.set(0,-l[x]+Math.PI*.5,0),Le.setFromEuler(hi),Ee.set(e*.88,F,e*1.38),ae.compose(Ie,Le,Ee),this.buttressMesh.setMatrixAt(g++,ae)}L&&E<1.1&&C<1.1&&y<M&&(!h[x-1]||!h[x+1]||!h[x-t]||!h[x+t])&&(Ie.set(D,I-.15,w),Le.identity(),Ee.set(e*.92,.72*U.elevScale,e*.92),ae.compose(Ie,Le,Ee),this.canalCurbMesh.setMatrixAt(y++,ae))}}this.damMonolithMesh.count=d,this.scaffoldingMesh.count=f,this.buttressMesh.count=g,this.canalCurbMesh.count=y,this.damMonolithMesh.instanceMatrix.needsUpdate=!0,this.damMonolithMesh.instanceColor&&(this.damMonolithMesh.instanceColor.needsUpdate=!0),this.scaffoldingMesh.instanceMatrix.needsUpdate=!0,this.buttressMesh.instanceMatrix.needsUpdate=!0,this.canalCurbMesh.instanceMatrix.needsUpdate=!0}animateConstructionCranes(t){let e=this.hydro.activeBuildSites,i=Math.pow(U.horizScale,.56);for(let n=0;n<this.cranes.length;n++){let s=this.cranes[n];if(n<e.length){let o=e[n];s.visible=!0,s.scale.setScalar(i),s.position.set(o.wx+5.5*i,o.wy-.5,o.wz-4.5*i);let a=t*.85+s.userData.seed;s.userData.slew.rotation.y=Math.sin(a)*1.15,s.userData.hoist.position.x=8.5+Math.cos(a*1.4)*5.2}else s.visible=!1}}_buildPowerLinePools(){let e=new Ne(.22,1.05,12.8,4);e.translate(0,6.4,0);let i=new de({color:11187906,map:this.textures.steel});this.pylonMesh=new fe(e,i,420),this.pylonMesh.count=0,this.pylonMesh.frustumCulled=!1,this.pylonMesh.matrixAutoUpdate=!1,this.scene.add(this.pylonMesh);let n=new Vt(4.6,.28,.35);n.translate(0,11.4,0),this.pylonArmMesh=new fe(n,i,420),this.pylonArmMesh.count=0,this.pylonArmMesh.frustumCulled=!1,this.pylonArmMesh.matrixAutoUpdate=!1,this.scene.add(this.pylonArmMesh);let s=new xe;this.wirePositions=new Float32Array(420*24),this.wireAttr=new he(this.wirePositions,3),s.setAttribute("position",this.wireAttr),this.wireMat=new xn({color:16769154,transparent:!0,opacity:.88}),this.wireLines=new On(s,this.wireMat),this.wireLines.frustumCulled=!1,this.scene.add(this.wireLines)}_buildCursorPreview(){this.cursorGroup=new Ce,this.cursorGroup.visible=!1;let t=new vn(.88,1,36);t.rotateX(-Math.PI*.5),this.cursorRingMat=new be({color:3718648,side:Xe,transparent:!0,opacity:.85,depthTest:!1}),this.cursorRing=new wt(t,this.cursorRingMat),this.cursorGroup.add(this.cursorRing);let e=new Ne(.82,1,1,20,1,!0);e.translate(0,.5,0),this.ghostVolumeMat=new be({color:16498468,transparent:!0,opacity:.24,side:Xe,depthWrite:!1}),this.ghostVolume=new wt(e,this.ghostVolumeMat),this.ghostVolume.visible=!1,this.cursorGroup.add(this.ghostVolume),this.flowArrow=new Ce;let i=new wt(new Vt(15,.85,1.7),new be({color:2282478,transparent:!0,opacity:.82})),n=new wt(new gi(2.9,5.8,12),new be({color:3462041,transparent:!0,opacity:.92}));n.rotation.z=-Math.PI*.5,n.position.x=9.5;let s=new wt(new _n(2.2,12,12),new be({color:3900150,transparent:!0,opacity:.86}));s.position.x=-9.5,this.flowArrow.add(i,n,s),this.flowArrow.visible=!1,this.cursorGroup.add(this.flowArrow),this.scene.add(this.cursorGroup)}_buildIrrigationBeacon(){let t=new vn(10.5,12.6,32);t.rotateX(-Math.PI*.5),this.irrRingMat=new be({color:3462041,side:Xe,transparent:!0,opacity:.58});let e=this.economy.cities.find(o=>o.archetype==="agro"),i=e&&e.irrigationTarget?e.irrigationTarget.x:168*U.horizScale,n=e&&e.irrigationTarget?e.irrigationTarget.z:98*U.horizScale,s=this.hydro.sampleAtWorld(i,n).bed;this.irrBeacon=new wt(t,this.irrRingMat),this.irrBeacon.position.set(i,s+.45*U.elevScale,n),this.irrBeacon.userData.baseScale=Math.pow(U.horizScale,.65),this.scene.add(this.irrBeacon)}_buildTutorialBeacon(){this.tutorialBeacon=new Ce,this.tutorialBeacon.visible=!1;let t=new wt(new vn(9,11.4,36),new be({color:2282478,side:Xe,transparent:!0,opacity:.82}));t.rotateX(-Math.PI*.5);let e=new wt(new Ne(1.4,4.5,36,16,1,!0),new be({color:3718648,side:Xe,transparent:!0,opacity:.22,depthWrite:!1}));e.position.y=18;let i=new wt(new gi(3.4,6.8,6),new be({color:16638023}));i.rotation.x=Math.PI,i.position.y=22,this.tutorialBeacon.add(t,e,i),this.tutorialBeacon.userData.pointer=i,this.scene.add(this.tutorialBeacon)}setTutorialTarget(t,e,i=!0){if(!this.tutorialBeacon||(this.tutorialBeacon.visible=i,!i))return;let n=this.hydro.sampleAtWorld(t,e);this.tutorialBeacon.position.set(t,Math.max(n.bed,n.surface)+.45,e)}updateTerrainGeometryRect(t,e,i,n){let s=this.hydro.grid,o=this.hydro.dx,a=this.terrainPosAttr.array,c=this.terrainNormAttr.array,l=this.terrainMetaAttr.array,{zb:h,soil:u,concrete:d,formworkWall:f,wetness:g,h:y,linedMask:p}=this.hydro;for(let S=e;S<=n;S++){let T=S*s;for(let x=t;x<=i;x++){let E=T+x;a[E*3+1]=h[E];let C=E*4;l[C]=u[E],l[C+1]=Math.max(d[E],f[E]*.5)+(p[E]?.5:0),l[C+2]=g[E],l[C+3]=y[E]}}let m=J(t-1,0,s-1),_=J(e-1,0,s-1),M=J(i+1,0,s-1),v=J(n+1,0,s-1),w=2*o;for(let S=_;S<=v;S++){let T=Math.max(0,S-1)*s,x=Math.min(s-1,S+1)*s,E=S*s;for(let C=m;C<=M;C++){let R=Math.max(0,C-1),L=Math.min(s-1,C+1),D=(h[E+L]-h[E+R])/w,I=(h[x+C]-h[T+C])/w,F=Math.hypot(D,1,I),z=(E+C)*3;c[z]=-D/F,c[z+1]=1/F,c[z+2]=-I/F}}if(this.terrainPosAttr.needsUpdate=!0,this.terrainNormAttr.needsUpdate=!0,this.terrainMetaAttr.needsUpdate=!0,this.treeSlots&&i-t<s-2){let S=U.size*.5,T=-S+t*o-2,x=-S+(i+1)*o+2,E=-S+e*o-2,C=-S+(n+1)*o+2,R=!1;for(let L=0;L<this.treeSlots.length;L++){let D=this.treeSlots[L];if(D.alive&&D.wx>=T&&D.wx<=x&&D.wz>=E&&D.wz<=C){let I=this.hydro.sampleAtWorld(D.wx,D.wz);(Math.abs(I.bed-D.baseBed)>.35||I.concrete>.1||I.targetConcrete>.1||I.lined)&&(D.alive=!1,ae.makeScale(0,0,0),this.treeTrunks.setMatrixAt(D.index,ae),this.treeCrowns.setMatrixAt(D.index,ae),R=!0)}}if(R&&(this.treeTrunks.instanceMatrix.needsUpdate=!0,this.treeCrowns.instanceMatrix.needsUpdate=!0),this.rockSlots){let L=!1;for(let D=0;D<this.rockSlots.length;D++){let I=this.rockSlots[D];if(I.alive&&I.wx>=T&&I.wx<=x&&I.wz>=E&&I.wz<=C){let F=this.hydro.sampleAtWorld(I.wx,I.wz);(Math.abs(F.bed-I.baseBed)>.3||F.concrete>.1||F.targetConcrete>.1||F.lined)&&(I.alive=!1,ae.makeScale(0,0,0),this.rockInstances.setMatrixAt(I.index,ae),L=!0)}}L&&(this.rockInstances.instanceMatrix.needsUpdate=!0)}}}updateWaterAndWetness(t){let e=this.hydro.grid,i=2*this.hydro.dx,{zb:n,h:s,u:o,v:a,foam:c,sediment:l,vort:h,wetness:u,soil:d,concrete:f,formworkWall:g,linedMask:y}=this.hydro,p=this.waterPosAttr.array,m=this.waterNormAttr.array,_=this.waterH1Attr.array,M=this.waterH2Attr.array,v=this.terrainMetaAttr.array;for(let w=0;w<e;w++){let S=w*e;for(let T=0;T<e;T++){let x=S+T,E=s[x],C=x*3,R=x*4;if(v[R]=d[x],v[R+1]=Math.max(f[x],g[x]*.5)+(y[x]?.5:0),v[R+2]=u[x],v[R+3]=E,E>.014)p[C+1]=n[x]+E,_[R]=E,_[R+1]=o[x],_[R+2]=a[x],_[R+3]=c[x],M[R]=l[x],M[R+1]=h[x],M[R+2]=f[x]>.05||y[x]?1:0,M[R+3]=1;else{let L=0,D=0;if(T>0&&s[x-1]>.014&&(L+=n[x-1]+s[x-1],D++),T<e-1&&s[x+1]>.014&&(L+=n[x+1]+s[x+1],D++),w>0&&s[x-e]>.014&&(L+=n[x-e]+s[x-e],D++),w<e-1&&s[x+e]>.014&&(L+=n[x+e]+s[x+e],D++),D>0){let I=L/D;p[C+1]=Math.min(n[x]+.025,I),_[R]=0,_[R+1]=0,_[R+2]=0,_[R+3]=0,M[R+3]=1}else p[C+1]=n[x]-.65*U.elevScale,_[R]=0,M[R+3]=0}}}for(let w=0;w<this.hydro.activeTileCount;w++){let S=this.hydro.activeTiles[w],T=Math.max(1,S%this.hydro.tilesN*8),x=Math.max(1,Math.floor(S/this.hydro.tilesN)*8),E=Math.min(e-2,T+8),C=Math.min(e-2,x+8);for(let R=x;R<=C;R++){let L=R*e;for(let D=T;D<=E;D++){let I=L+D;if(s[I]<=.014)continue;let F=p[(I-1)*3+1],z=p[(I+1)*3+1],G=p[(I-e)*3+1],K=p[(I+e)*3+1],N=J((z-F)/i,-.65,.65),$=J((K-G)/i,-.65,.65),Q=Math.hypot(N,1,$),ot=I*3;m[ot]=-N/Q,m[ot+1]=1/Q,m[ot+2]=-$/Q}}}this.waterPosAttr.needsUpdate=!0,this.waterNormAttr.needsUpdate=!0,this.waterH1Attr.needsUpdate=!0,this.waterH2Attr.needsUpdate=!0,this.terrainMetaAttr.needsUpdate=!0,this.waterMat.uniforms.uTime.value=t,this.terrainMat.uniforms.uTime.value=t,this.terrainMat.uniforms.uMeltOffset.value=this.economy.hydrology?this.economy.hydrology.snowMeltVisualOffset:0,this.updateOverflowWater3D(t)}syncCityInstances(){let t=this.economy.allBuildings,e=new Map;for(let c of this.economy.cities)e.set(c.id,c);let i=this.cityBodies.instanceMatrix.count,n=0,s=0,o=0,a=0;for(let c=0;c<t.length&&c<i;c++){let l=t[c],h=e.get(l.cityId),u=h&&h.connected&&h.powerRatio>=.45?1:0,d=l.sy*Math.max(.08,l.anim);if(Ie.set(l.wx,l.wy-.25,l.wz),hi.set(0,l.yaw,0),Le.setFromEuler(hi),Ni.setRGB(l.shadeR||.72,l.shadeG||.74,l.shadeB||.78),l.roofType==="silo")Ee.set(l.sx,d,l.sz),ae.compose(Ie,Le,Ee),this.citySilos.setMatrixAt(s,ae),this.citySilos.setColorAt(s,Ni),this.siloPoweredArr[s]=u,this.siloStyleArr[s]=l.styleId||13,s++;else if(Ee.set(l.sx,d,l.sz),ae.compose(Ie,Le,Ee),this.cityBodies.setMatrixAt(n,ae),this.cityBodies.setColorAt(n,Ni),this.cityPoweredArr[n]=u,this.cityStyleArr[n]=l.styleId||0,n++,l.roofType==="gable"&&o<i)Ie.set(l.wx,l.wy-.25+d,l.wz),Ee.set(l.sx*1.08,1.8*Math.pow(U.elevScale,.7)+d*.16,l.sz*1.08),ae.compose(Ie,Le,Ee),Ni.setRGB(l.roofR||.68,l.roofG||.34,l.roofB||.26),this.cityRoofs.setMatrixAt(o,ae),this.cityRoofs.setColorAt(o,Ni),o++;else if(l.roofType==="dome"&&a<i){Ie.set(l.wx,l.wy-.25+d,l.wz);let f=Math.min(l.sx,l.sz)*.78;Ee.set(f,f*.75,f),ae.compose(Ie,Le,Ee),this.cityDomes.setMatrixAt(a++,ae)}}this.cityBodies.count=n,this.citySilos.count=s,this.cityRoofs.count=o,this.cityDomes.count=a,this.cityBodies.instanceMatrix.needsUpdate=!0,this.cityPoweredAttr.needsUpdate=!0,this.cityStyleAttr.needsUpdate=!0,this.cityBodies.instanceColor&&(this.cityBodies.instanceColor.needsUpdate=!0),s>0&&(this.citySilos.instanceMatrix.needsUpdate=!0,this.siloPoweredAttr.needsUpdate=!0,this.siloStyleAttr.needsUpdate=!0,this.citySilos.instanceColor&&(this.citySilos.instanceColor.needsUpdate=!0)),o>0&&(this.cityRoofs.instanceMatrix.needsUpdate=!0,this.cityRoofs.instanceColor&&(this.cityRoofs.instanceColor.needsUpdate=!0)),a>0&&(this.cityDomes.instanceMatrix.needsUpdate=!0)}syncHydroStructures(t=0){let e=new Set;for(let i of this.hydro.turbines){e.add(`t_${i.id}`);let n=this.structMeshes.get(`t_${i.id}`);n||(n=this._createTurbinePowerhouseMesh(i),this.structMeshes.set(`t_${i.id}`,n),this.structuresGroup.add(n),this.economy.powerLinesDirty=!0);let s=n.userData.rotor;s&&(s.rotation.y=i.rotorPhase);let o=n.userData.gantryTrolley;o&&(o.position.z=Math.sin(t*.45+i.id)*n.userData.gantryTravel);let a=n.userData.statusLamp;a&&(i.isPumpingNow?a.material.color.setHex(2282478):i.cavitation>.45?a.material.color.setHex(15680580):a.material.color.setHex(i.powerMW>.1?3462041:16096779))}for(let i of this.hydro.spillways){e.add(`s_${i.id}`);let n=this.structMeshes.get(`s_${i.id}`);n||(n=this._createSpillwayMesh(i),this.structMeshes.set(`s_${i.id}`,n),this.structuresGroup.add(n));let s=n.userData.gateLeaf;s&&(s.position.y=i.sillElev+i.wallHeight*.5+i.openRatio*(i.wallHeight*.8));let o=n.userData.chuteWater,a=n.userData.skiJump,c=i.currentFlowQ>.35&&i.openRatio>.03;if(o&&(o.visible=c,c)){let l=J(.35+i.openRatio*1.45,.35,2.2);o.scale.y=l}if(a&&(a.visible=c,c)){let l=n.userData.baseThrow*(.7+J(i.jetSpeed/12,.15,1.1));a.scale.x=l}}for(let i of this.hydro.navLocks){e.add(`l_${i.id}`);let n=this.structMeshes.get(`l_${i.id}`);n||(n=this._createNavLockMesh(i),this.structMeshes.set(`l_${i.id}`,n),this.structuresGroup.add(n));let s=i.cyclePhase||0,o=s<.25?Math.sin(s/.25*Math.PI)*.95:0;if(n.userData.gateLeft&&(n.userData.gateLeft.rotation.y=o),n.userData.gateRight&&(n.userData.gateRight.rotation.y=-o),n.userData.chamberWater){let a=Math.sin(s*Math.PI*2)*1.8*U.elevScale;n.userData.chamberWater.position.y=i.baseY+2.4*U.elevScale+a}}for(let i of this.hydro.fishFarms){e.add(`f_${i.id}`);let n=this.structMeshes.get(`f_${i.id}`);n||(n=this._createFishFarmMesh(i),this.structMeshes.set(`f_${i.id}`,n),this.structuresGroup.add(n));let s=this.hydro.sampleAtWorld(i.wx,i.wz);n.position.y=Math.max(s.bed,s.surface),n.userData.aerator&&(n.userData.aerator.rotation.y=t*4.5)}for(let i of this.hydro.substations){e.add(`u_${i.id}`);let n=this.structMeshes.get(`u_${i.id}`);n||(n=this._createSubstationMesh(i),this.structMeshes.set(`u_${i.id}`,n),this.structuresGroup.add(n),this.economy.powerLinesDirty=!0)}for(let[i,n]of this.structMeshes.entries())e.has(i)||(this.structuresGroup.remove(n),this.structMeshes.delete(i),this.economy.powerLinesDirty=!0);this.economy.powerLinesDirty&&(this._rebuildPowerLines(),this.economy.powerLinesDirty=!1)}_createTurbinePowerhouseMesh(t){let e=new Ce;e.position.set(t.wx,0,t.wz),e.rotation.y=-t.yaw;let i=Math.pow(U.horizScale,.52),n=new de({color:14870768,map:this.textures.concreteMap}),s=new de({color:9741240,map:this.textures.concreteMap}),o=new xi({color:13358561,map:this.textures.steel,roughness:.36,metalness:.68}),a=new de({color:t.spec.color,map:this.textures.steel}),c=new de({color:16096779,map:this.textures.steel}),l=new be({color:16771235}),h=Math.min(t.baseY,t.outfallBedY),u=h+1.1*U.elevScale,d=Math.max(u+5.2*i,t.crestY),f=Math.max(5*i,d-h),g=Math.max(8.8*i,Math.hypot(t.hallWx-t.wx,t.hallWz-t.wz)),y=new wt(new Vt(6.8*i,f,12.6*i),n);y.position.set(-1.2*i,h+f*.5,0),y.castShadow=!!this.profile.shadows,y.receiveShadow=!!this.profile.shadows;let p=Math.max(4.8*i,f*.72),m=new wt(new Vt(.6*i,p,9.6*i),new de({color:1976635,map:this.textures.steel}));m.position.set(-4.7*i,d-p*.52,0);for(let q of[-4.8,0,4.8]){let Y=new wt(new Vt(2.4*i,p+1.8*i,1.1*i),s);Y.position.set(-4.5*i,d-p*.45+.6*i,q*i),e.add(Y)}let _=new Ce;_.position.set(-1.2*i,d,0);let M=new wt(new Vt(.6*i,3.8*i,.6*i),c);M.position.set(-1.8*i,1.9*i,0);let v=M.clone();v.position.x=1.8*i;let w=new wt(new Vt(4.6*i,.85*i,2.2*i),c);w.position.set(0,3.9*i,0),_.add(M,v,w);let S=(t.type==="francis"?1.25:t.type==="pelton"?1.05:1.38)*i,T=new k(-.5*i,d-2.2*i,0),x=new k(g-2.6*i,u+1.8*i,0),E=new k().subVectors(x,T),C=Math.max(2.5,E.length()),R=new fi().setFromUnitVectors(new k(0,1,0),E.clone().normalize());for(let q of[-2.4*i,2.4*i]){let Y=new wt(new Ne(S,S,C,14),o);Y.position.copy(T).addScaledVector(E,.5),Y.position.z=q,Y.quaternion.copy(R),Y.castShadow=!!this.profile.shadows,e.add(Y);for(let ct of[.25,.55,.82]){let vt=new wt(new Ne(S*1.18,S*1.18,.42*i,14),a);vt.position.copy(T).addScaledVector(E,ct),vt.position.z=q,vt.quaternion.copy(R),e.add(vt)}}let L=9.4*i,D=6.6*i,I=13.2*i,F=4.6*i,z=new wt(new Vt(L+2.4*i,F,I+.6*i),s);z.position.set(g+.8*i,u-F*.5+.6*i,0),z.receiveShadow=!!this.profile.shadows;for(let q of[-2.8*i,2.8*i]){let Y=new wt(new Vt(1.4*i,2.5*i,3.8*i),new be({color:729657}));Y.position.set(g+L*.5+1.5*i,u-.8*i,q),e.add(Y)}let G=new wt(new Vt(L,D,I),n);G.position.set(g,u+D*.5,0),G.castShadow=!!this.profile.shadows,G.receiveShadow=!!this.profile.shadows;for(let q=-2;q<=2;q++){let Y=new wt(new Vt(.25*i,D*.62,1.45*i),l);Y.position.set(g+L*.5+.05*i,u+D*.54,q*2.3*i),e.add(Y)}let K=new wt(new Vt(L+.8*i,.85*i,I+.8*i),a);K.position.set(g,u+D+.35*i,0);let N=new Ce;N.position.set(g,u+D+1.15*i,0);let $=new wt(new Ne(1.35*i,1.35*i,1.1*i,12),o),Q=new wt(new Vt(5.2*i,.35*i,.85*i),a),ot=Q.clone();ot.rotation.y=Math.PI*.5,N.add($,Q,ot);let st=u+1.2*i,It=new wt(new Vt(2.6*i,2.8*i,3.2*i),o);It.position.set(g-L*.35,st+1.4*i,I*.5+2*i);let ut=new wt(new Ne(.18*i,.32*i,6.2*i,4),o);ut.position.set(g,u+D+3.1*i,I*.38);let Pt=new wt(new _n(.68*i,8,8),new be({color:16096779}));return Pt.position.set(g+L*.38,u+D+1.5*i,I*.38),e.add(y,m,_,z,G,K,N,It,ut,Pt),e.userData.rotor=N,e.userData.gantryTrolley=_,e.userData.gantryTravel=3.8*i,e.userData.statusLamp=Pt,e}_createSpillwayMesh(t){let e=new Ce;e.position.set(t.wx,0,t.wz),e.rotation.y=-t.yaw;let i=Math.pow(U.horizScale,.5),n=new de({color:13358561,map:this.textures.concreteMap}),s=new de({color:14251782,map:this.textures.steel}),o=t.wallHeight+4.8*U.elevScale,a=Math.max(7.6*i,this.hydro.dx*1.6),c=new wt(new Vt(10.5*i,o,1.5*i),n);c.position.set(1.2*i,t.sillElev+o*.5-1,-a*.55),c.castShadow=!!this.profile.shadows;let l=c.clone();l.position.z=a*.55;let h=new wt(new Vt(2.8*i,1.3*i,a*1.28),n);h.position.set(0,t.sillElev+o-.5,0);let u=new wt(new Vt(1.2*i,t.wallHeight,a*.96),s);u.position.set(0,t.sillElev+t.wallHeight*.5,0);let d=Math.max(2,t.sillElev-(t.downBedY||t.sillElev-4)),f=Math.max(8*i,d*1.15),g=-Math.atan2(d*.55,f),y=new wt(new Vt(f,1.2*i,a),n);y.rotation.z=g,y.position.set(f*.45,t.sillElev-d*.28,0);let p=new wt(new Vt(f*1.02,1*i,a*.92),this.overflowWaterMat);p.rotation.z=g,p.position.set(f*.45,t.sillElev-d*.28+.95*i,0),p.renderOrder=3,p.visible=!1;let m=new wt(Wd(),this.overflowWaterMat),_=f*.92,M=t.sillElev-d*.52+.8*i,v=Math.max(2.2,M-(t.downBedY||M-4)),w=Math.max(6*i,v*.95);return m.position.set(_,M,0),m.scale.set(w,v,a*.9),m.renderOrder=3,m.visible=!1,e.add(c,l,h,u,y,p,m),e.userData.gateLeaf=u,e.userData.chuteWater=p,e.userData.skiJump=m,e.userData.baseThrow=w,e}_createNavLockMesh(t){let e=new Ce;e.position.set(t.wx,0,t.wz),e.rotation.y=-t.yaw;let i=Math.pow(U.horizScale,.55),n=new de({color:14212841,map:this.textures.concreteMap}),s=new de({color:1920728,map:this.textures.steel}),o=22*i,a=7.4*i,c=6.8*U.elevScale,l=new wt(new Vt(o,c,1.6*i),n);l.position.set(0,t.baseY+c*.5,-a*.5);let h=l.clone();h.position.z=a*.5;let u=new wt(new Vt(o*.92,.8,a*.84),new be({color:959977,transparent:!0,opacity:.78}));u.position.set(0,t.baseY+c*.45,0);let d=new wt(new Vt(.6*i,c*.88,a*.46),s);d.position.set(o*.45,t.baseY+c*.46,-a*.24);let f=d.clone();return f.position.z=a*.24,e.add(l,h,u,d,f),e.userData.gateLeft=d,e.userData.gateRight=f,e.userData.chamberWater=u,e}_createFishFarmMesh(t){let e=new Ce;e.position.set(t.wx,t.wy,t.wz);let i=Math.pow(U.horizScale,.55),n=new de({color:16347926}),s=new be({color:481669,transparent:!0,opacity:.65}),o=new de({color:14870768,map:this.textures.roof}),a=[[-4.2,-3.5],[4.2,-3.5],[-4.2,3.5],[4.2,3.5]];for(let[h,u]of a){let d=new wt(new js(3.1*i,.28*i,6,18),n);d.rotation.x=Math.PI*.5,d.position.set(h*i,.25*i,u*i);let f=new wt(new Zs(2.9*i,16),s);f.rotation.x=-Math.PI*.5,f.position.set(h*i,.18*i,u*i),e.add(d,f)}let c=new wt(new Vt(13*i,.35*i,1.8*i),o);c.position.y=.35*i;let l=new wt(new Vt(2.6*i,.45*i,.55*i),new be({color:3718648}));return l.position.set(0,.85*i,0),e.add(c,l),e.userData.aerator=l,e}_createSubstationMesh(t){let e=new Ce;e.position.set(t.wx,t.wy,t.wz);let i=Math.pow(U.horizScale,.52),n=new de({color:13358561,map:this.textures.concreteMap}),s=new de({color:9741240,map:this.textures.steel}),o=new de({color:3718648}),a=new wt(new Vt(16.5*i,1*i,14.5*i),n);a.position.y=-.3*i,e.add(a);for(let l of[-3.6,3.6]){let h=new wt(new Vt(3.8*i,3.8*i,4.6*i),s);h.position.set(l*i,2*i,0),h.castShadow=!!this.profile.shadows,e.add(h);for(let u of[-1.2,0,1.2]){let d=new wt(new Ne(.18*i,.26*i,2.1*i,6),o);d.position.set(l*i,4.8*i,u*i),e.add(d)}}for(let l of[-5.2,5.2]){let h=new wt(new Ne(.22*i,.42*i,11.5*i,4),s);h.position.set(-5.8*i,5.75*i,l*i);let u=h.clone();u.position.x=5.8*i;let d=new wt(new Vt(12.8*i,.45*i,.45*i),s);d.position.set(0,11.2*i,l*i),e.add(h,u,d)}let c=new wt(new _n(.65*i,8,8),new be({color:3718648}));return c.position.set(0,12.2*i,5.2*i),e.add(c),e}_rebuildPowerLines(){let t=U.horizScale,e=Math.pow(t,.56),i=this.hydro.substations.length>0?{x:this.hydro.substations[0].wx,z:this.hydro.substations[0].wz}:this.hydro.turbines.length>0?{x:this.hydro.turbines[0].wx,z:this.hydro.turbines[0].wz}:{x:12*t,z:-152*t},n=0,s=0,o=this.pylonMesh.instanceMatrix.count,a=[];for(let l of this.hydro.substations)for(let h of this.hydro.turbines)Math.hypot(h.wx-l.wx,h.wz-l.wz)<220*t&&a.push({x0:h.wx,z0:h.wz,x1:l.wx,z1:l.wz});for(let l of this.economy.cities){if(!l.connected)continue;let h=i,u=Math.hypot(l.x-h.x,l.z-h.z);for(let d of this.hydro.substations){let f=Math.hypot(l.x-d.wx,l.z-d.wz);f<u&&(u=f,h={x:d.wx,z:d.wz})}for(let d of this.hydro.turbines){let f=Math.hypot(l.x-d.wx,l.z-d.wz);f<u&&(u=f,h={x:d.wx,z:d.wz})}a.push({x0:h.x,z0:h.z,x1:l.x,z1:l.z})}let c=52*t;for(let l of a){let h=Math.hypot(l.x1-l.x0,l.z1-l.z0),u=J(Math.ceil(h/c),2,18),d=Math.atan2(l.x1-l.x0,l.z1-l.z0),f=null;for(let g=0;g<=u&&!(n>=o);g++){let y=g/u,p=l.x0+(l.x1-l.x0)*y,m=l.z0+(l.z1-l.z0)*y,_=this.hydro.sampleAtWorld(p,m),M=Math.max(_.bed,_.surface);Ie.set(p,M,m),hi.set(0,d,0),Le.setFromEuler(hi),Ee.set(e,e,e),ae.compose(Ie,Le,Ee),this.pylonMesh.setMatrixAt(n,ae),this.pylonArmMesh.setMatrixAt(n,ae),n++;let v=M+12.1*e;if(f&&s+12<=this.wirePositions.length){let w=(f.x+p)*.5,S=(f.z+m)*.5,T=(f.y+v)*.5-2.1*e;this.wirePositions[s++]=f.x,this.wirePositions[s++]=f.y,this.wirePositions[s++]=f.z,this.wirePositions[s++]=w,this.wirePositions[s++]=T,this.wirePositions[s++]=S,this.wirePositions[s++]=w,this.wirePositions[s++]=T,this.wirePositions[s++]=S,this.wirePositions[s++]=p,this.wirePositions[s++]=v,this.wirePositions[s++]=m}f={x:p,y:v,z:m}}}for(let l=s;l<this.wirePositions.length;l++)this.wirePositions[l]=0;this.pylonMesh.count=n,this.pylonArmMesh.count=n,this.pylonMesh.instanceMatrix.needsUpdate=!0,this.pylonArmMesh.instanceMatrix.needsUpdate=!0,this.wireAttr.needsUpdate=!0}updateAtmosphere(t,e,i=null,n=.016){let s=(t-6)/24*Math.PI*2,o=Math.sin(s),a=Math.cos(s),c=new k(a*.78,Math.max(-.35,o),.48).normalize(),l=J((o+.16)/.65,0,1),h=Math.exp(-Math.pow((o-.08)/.18,2)),u=new ft(594982),d=new ft(2450347),f=new ft(1254978),g=new ft(10406632),y=new ft(15900519);this.skyColorZenith.copy(u).lerp(d,l),this.skyColorHorizon.copy(f).lerp(g,l).lerp(y,h*.62),this.fogColor.copy(this.skyColorHorizon);let p=new ft(3889292).lerp(new ft(16774626),l).lerp(new ft(16755038),h*.75),m=e.fogDensity/Math.pow(U.horizScale,.84),_=i?i.x:0,M=i?i.z:0,v=480*Math.pow(U.horizScale,.55);this.sunLight.target.position.set(_,0,M),this.sunLight.position.set(_+c.x*v,Math.max(120,c.y*v),M+c.z*v),this.sunLight.color.copy(p),this.sunLight.intensity=(.18+1.34*l)*e.sunIntensity,this.hemiLight.intensity=.26+.56*l,this.scene.background.copy(this.fogColor);let w=o>-.05?c:new k(-c.x,.35,-c.z).normalize();this.terrainMat.uniforms.uSunDir.value.copy(w),this.terrainMat.uniforms.uSunColor.value.copy(p).multiplyScalar(.32+.78*l),this.terrainMat.uniforms.uSkyColor.value.copy(this.skyColorZenith).lerp(new ft(16777215),.35),this.terrainMat.uniforms.uFogColor.value.copy(this.fogColor),this.terrainMat.uniforms.uFogDensity.value=m,this.waterMat.uniforms.uSunDir.value.copy(w),this.waterMat.uniforms.uSunColor.value.copy(p).multiplyScalar(l),this.waterMat.uniforms.uSkyZenith.value.copy(this.skyColorZenith),this.waterMat.uniforms.uSkyHorizon.value.copy(this.skyColorHorizon),this.waterMat.uniforms.uFogColor.value.copy(this.fogColor),this.waterMat.uniforms.uFogDensity.value=m,this.overflowWaterMat&&(this.overflowWaterMat.uniforms.uSunFactor.value=.25+.75*l,this.overflowWaterMat.uniforms.uFogColor.value.copy(this.fogColor),this.overflowWaterMat.uniforms.uFogDensity.value=m),this.cityBodyMat&&(this.cityBodyMat.uniforms.uSunDir.value.copy(w),this.cityBodyMat.uniforms.uSunColor.value.copy(p).multiplyScalar(.28+.82*l),this.cityBodyMat.uniforms.uSkyColor.value.copy(this.skyColorZenith).lerp(new ft(16777215),.35),this.cityBodyMat.uniforms.uNightFactor.value=J(1-(o+.05)/.28,0,1),this.cityBodyMat.uniforms.uFogColor.value.copy(this.fogColor),this.cityBodyMat.uniforms.uFogDensity.value=m),this.livingWorld&&n>0&&this.livingWorld.update(n,t,l,w);let S=typeof performance<"u"?performance.now():Date.now();if(this.irrBeacon&&(this.irrBeacon.visible=!this.economy.agroIrrigated,this.irrBeacon.visible)){let x=(this.irrBeacon.userData.baseScale||1)*(1+Math.sin(S*.004)*.08);this.irrBeacon.scale.set(x,1,x)}if(this.tutorialBeacon&&this.tutorialBeacon.visible){let T=Math.pow(U.horizScale,.56),x=T*(1+Math.sin(S*.0055)*.1);this.tutorialBeacon.scale.set(x,T,x),this.tutorialBeacon.userData.pointer.position.y=21+Math.sin(S*.006)*2.8,this.tutorialBeacon.userData.pointer.rotation.y=S*.0022}return{isNight:o<.06,dayFactor:l}}updateCursor(t,e,i,n,s,o=6.2,a=!0){if(this.cursorGroup.visible=a,!a)return;let c=this.hydro.sampleAtWorld(t,e),l=Math.max(c.bed,c.surface)+.35*U.elevScale;this.cursorGroup.position.set(t,l,e),this.cursorRing.scale.set(i,i,1);let h=n==="spillway"||n==="nav_lock"||n.startsWith("turbine_");this.flowArrow.visible=h;let u=n==="concrete_dam"||n==="earth_dam"||n==="foundation";if(this.ghostVolume.visible=u,u){let d=(n==="concrete_dam"?o:n==="earth_dam"?4.2:6)*U.elevScale;this.ghostVolume.scale.set(i,d,i),this.ghostVolumeMat.color.setHex(n==="foundation"?16096779:16498468)}if(h){let{gx:d,gz:f}=this.hydro.worldToGrid(t,e),g=this.hydro.detectHydraulicDirection(d,f,s),y=Math.pow(U.horizScale,.55);this.flowArrow.scale.setScalar(y),this.flowArrow.rotation.y=-g.yaw,this.cursorRingMat.color.setHex(3462041)}else n==="canal_dig"||n==="fish_eco"?this.cursorRingMat.color.setHex(3718648):n==="concrete_dam"||n==="earth_dam"||n==="foundation"?this.cursorRingMat.color.setHex(16498468):n==="demolish"?this.cursorRingMat.color.setHex(15680580):this.cursorRingMat.color.setHex(10980346)}};var Wa=class{constructor(t,e=2800){this.max=e,this.head=0,this.positions=new Float32Array(this.max*3),this.velocities=new Float32Array(this.max*3),this.life=new Float32Array(this.max),this.maxLife=new Float32Array(this.max),this.sizes=new Float32Array(this.max),this.kinds=new Uint8Array(this.max);let i=new xe;this.posAttr=new he(this.positions,3),this.posAttr.setUsage(je),this.sizeAttr=new he(this.sizes,1),this.sizeAttr.setUsage(je),this.alphaAttr=new he(new Float32Array(this.max),1),this.alphaAttr.setUsage(je),i.setAttribute("position",this.posAttr),i.setAttribute("aSize",this.sizeAttr),i.setAttribute("aAlpha",this.alphaAttr);let n=new Oe({transparent:!0,depthWrite:!1,blending:wn,uniforms:{uLight:{value:1},uPixelRatio:{value:Math.min(typeof window<"u"&&window.devicePixelRatio||1,2)}},vertexShader:`
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
          gl_PointSize = clamp((aSize * 225.0 * uPixelRatio) / max(1.0, -mv.z), 1.5, 48.0);
        }
      `,fragmentShader:`
        uniform float uLight;
        varying float vAlpha;

        void main() {
          vec2 p = gl_PointCoord * 2.0 - 1.0;
          float r2 = dot(p, p);
          if (r2 > 1.0) discard;
          float soft = pow(1.0 - r2, 1.6);
          vec3 col = vec3(0.93, 0.97, 1.0) * (0.45 + 0.55 * uLight);
          gl_FragColor = vec4(col, vAlpha * soft);
        }
      `});this.points=new qs(i,n),this.points.frustumCulled=!1,this.points.matrixAutoUpdate=!1,t.add(this.points);let s=380;this.rainCount=s;let o=new Float32Array(s*6);this.rainSeeds=new Float32Array(s*3);for(let c=0;c<s;c++)this.rainSeeds[c*3]=(Math.random()-.5)*210,this.rainSeeds[c*3+1]=Math.random()*80,this.rainSeeds[c*3+2]=(Math.random()-.5)*210;let a=new xe;this.rainAttr=new he(o,3),this.rainAttr.setUsage(je),a.setAttribute("position",this.rainAttr),this.rainMat=new xn({color:13624575,transparent:!0,opacity:.36,depthWrite:!1}),this.rainLines=new On(a,this.rainMat),this.rainLines.visible=!1,this.rainLines.frustumCulled=!1,t.add(this.rainLines)}spawn(t,e,i,n,s,o,a,c,l=1){let h=this.head;this.head=(this.head+1)%this.max;let u=h*3;this.positions[u]=t,this.positions[u+1]=e,this.positions[u+2]=i,this.velocities[u]=n,this.velocities[u+1]=s,this.velocities[u+2]=o,this.life[h]=c,this.maxLife[h]=c,this.sizes[h]=a,this.kinds[h]=l}spawnDigSplash(t,e,i,n=12){let s=Math.pow(U.horizScale,.55);for(let o=0;o<n;o++){let a=Math.random()*Math.PI*2,c=(1.5+Math.random()*4)*s*.65;this.spawn(t+(Math.random()-.5)*3*s,e+.5*U.elevScale,i+(Math.random()-.5)*3*s,Math.cos(a)*c,(2.5+Math.random()*4.5)*Math.sqrt(U.elevScale),Math.sin(a)*c,(1.1+Math.random()*.8)*s,.55+Math.random()*.35,1)}}update(t,e,i,n=1,s=0){this.points.material.uniforms.uLight.value=n;let o=Math.pow(U.horizScale,.52),a=e.jetEmitters;for(let h=0;h<a.length;h++){let u=a[h],d=u.kind==="spillway"?Math.ceil(4*u.intensity):Math.ceil(3*u.intensity);for(let f=0;f<d;f++){let g=(u.kind==="spillway"?2.4:3.2)*o;this.spawn(u.wx+(Math.random()-.5)*g,u.wy+Math.random()*.6*o,u.wz+(Math.random()-.5)*g,u.vx*(.85+Math.random()*.3)+(Math.random()-.5)*1.4*o,u.vy+(Math.random()-.3)*1.6,u.vz*(.85+Math.random()*.3)+(Math.random()-.5)*1.4*o,(u.kind==="spillway"?1.6+Math.random()*1.5:1.3+Math.random()*1.1)*o,.95+Math.random()*.55,1)}Math.random()<.65&&this.spawn(u.wx+u.vx*.5+(Math.random()-.5)*5*o,u.wy-.5,u.wz+u.vz*.5+(Math.random()-.5)*5*o,(Math.random()-.5)*1.2*o,(1.4+Math.random()*1.8)*Math.sqrt(U.elevScale),(Math.random()-.5)*1.2*o,(3.4+Math.random()*2.6)*o,1.5+Math.random()*.9,2)}let c=this.alphaAttr.array,l=!1;for(let h=0;h<this.max;h++){let u=this.kinds[h];if(u===0){c[h]=0;continue}if(this.life[h]-=t,this.life[h]<=0){this.kinds[h]=0,c[h]=0;continue}l=!0;let d=h*3;u===1?(this.velocities[d]*=1-t*.35,this.velocities[d+1]-=U.gravity*t*.92,this.velocities[d+2]*=1-t*.35):(this.velocities[d]*=1-t*1.2,this.velocities[d+1]=Math.max(.3,this.velocities[d+1]-t*.9),this.velocities[d+2]*=1-t*1.2,this.sizes[h]+=t*1.4*o);let f=this.positions[d]+this.velocities[d]*t,g=this.positions[d+1]+this.velocities[d+1]*t,y=this.positions[d+2]+this.velocities[d+2]*t;if(this.positions[d]=f,this.positions[d+1]=g,this.positions[d+2]=y,u===1&&Math.abs(f)<U.size*.49&&Math.abs(y)<U.size*.49){let m=e.worldToGrid(f,y),_=m.gz*e.grid+m.gx,M=e.zb[_]+e.h[_];if(g<=M){e.foam[_]=Math.min(1,e.foam[_]+.35),this.kinds[h]=0,c[h]=0;continue}}let p=this.life[h]/(this.maxLife[h]||1);c[h]=u===1?Math.min(.78,p*1.2):Math.sin(p*Math.PI)*.24}if((l||a.length>0)&&(this.posAttr.needsUpdate=!0,this.sizeAttr.needsUpdate=!0,this.alphaAttr.needsUpdate=!0),s>.05){this.rainLines.visible=!0,this.rainMat.opacity=Math.min(.45,s*.35);let h=this.rainAttr.array,u=typeof performance<"u"?performance.now():Date.now(),d=Math.pow(U.horizScale,.55),f=u*.065%(70*d);for(let g=0;g<this.rainCount;g++){let y=g*3,p=i.x+this.rainSeeds[y]*d,m=this.rainSeeds[y+1]*d-f;m<0&&(m+=70*d),m+=i.y*.3+6*d;let _=i.z+this.rainSeeds[y+2]*d,M=g*6;h[M]=p,h[M+1]=m,h[M+2]=_,h[M+3]=p+.6*d,h[M+4]=m-3.8*d,h[M+5]=_+.4*d}this.rainAttr.needsUpdate=!0}else this.rainLines.visible=!1}};var Xa=class{constructor(t,e){this.camera=t,this.dom=e,this.target=new k(14*U.horizScale,28*U.elevScale,-64*U.horizScale),this.goalTarget=this.target.clone(),this.yaw=-.54,this.pitch=.67,this.distance=U.defaultDist||248,this.goalYaw=this.yaw,this.goalPitch=this.pitch,this.goalDist=this.distance,this.keys=new Set,this.isOrbiting=!1,this.isPanning=!1,this.lastX=0,this.lastY=0,this.userMoved=!1,this.touches=new Map,this.prevPinchDist=0,this.syncToWorldScale(),this._bindEvents(),this.update(.016,22*U.elevScale)}syncToWorldScale(){this.camera.near=U.size>=5e3?4.5:1.5,this.camera.far=Math.max(3600,U.size*2.85),this.camera.updateProjectionMatrix(),this.goalDist=J(this.goalDist,U.minZoom,U.maxZoom)}_bindEvents(){window.addEventListener("keydown",e=>{e.target&&(e.target.tagName==="INPUT"||e.target.tagName==="SELECT")||this.keys.add(e.code)}),window.addEventListener("keyup",e=>{this.keys.delete(e.code)}),window.addEventListener("blur",()=>this.keys.clear()),this.dom.addEventListener("contextmenu",e=>e.preventDefault()),this.dom.addEventListener("mousedown",e=>{e.button===2?(this.isOrbiting=!0,this.lastX=e.clientX,this.lastY=e.clientY):e.button===1&&(this.isPanning=!0,this.lastX=e.clientX,this.lastY=e.clientY)}),window.addEventListener("mousemove",e=>{if(this.isOrbiting){let i=e.clientX-this.lastX,n=e.clientY-this.lastY;this.lastX=e.clientX,this.lastY=e.clientY,this.goalYaw-=i*.0055,this.goalPitch=J(this.goalPitch+n*.0048,.14,1.4),this.userMoved=!0}else if(this.isPanning){let i=e.clientX-this.lastX,n=e.clientY-this.lastY;this.lastX=e.clientX,this.lastY=e.clientY,this._panByPixels(i,n),this.userMoved=!0}}),window.addEventListener("mouseup",e=>{e.button===2&&(this.isOrbiting=!1),e.button===1&&(this.isPanning=!1)}),this.dom.addEventListener("wheel",e=>{e.preventDefault();let i=e.deltaY>0?1.14:.88;this.goalDist=J(this.goalDist*i,U.minZoom,U.maxZoom),this.userMoved=!0},{passive:!1}),this.dom.addEventListener("touchstart",e=>{for(let i of e.changedTouches)this.touches.set(i.identifier,{x:i.clientX,y:i.clientY});if(this.touches.size===2){let i=[...this.touches.values()];this.prevPinchDist=Math.hypot(i[0].x-i[1].x,i[0].y-i[1].y)}},{passive:!0}),this.dom.addEventListener("touchmove",e=>{if(this.touches.size>=2){let i=[...this.touches.values()],n=(i[0].x+i[1].x)*.5,s=(i[0].y+i[1].y)*.5;for(let h of e.changedTouches)this.touches.set(h.identifier,{x:h.clientX,y:h.clientY});let o=[...this.touches.values()],a=(o[0].x+o[1].x)*.5,c=(o[0].y+o[1].y)*.5;this._panByPixels(a-n,c-s);let l=Math.hypot(o[0].x-o[1].x,o[0].y-o[1].y);this.prevPinchDist>10&&l>10&&(this.goalDist=J(this.goalDist*(this.prevPinchDist/l),U.minZoom,U.maxZoom)),this.prevPinchDist=l,this.userMoved=!0}},{passive:!0});let t=e=>{for(let i of e.changedTouches)this.touches.delete(i.identifier)};this.dom.addEventListener("touchend",t,{passive:!0}),this.dom.addEventListener("touchcancel",t,{passive:!0})}_panByPixels(t,e){let i=this.distance*.00175,n=Math.sin(this.yaw),s=Math.cos(this.yaw);this.goalTarget.x-=(s*t+n*e)*i,this.goalTarget.z-=(-n*t+s*e)*i;let o=U.size*.485;this.goalTarget.x=J(this.goalTarget.x,-o,o),this.goalTarget.z=J(this.goalTarget.z,-o,o)}flyTo(t,e,i=U.defaultDist,n=20){let s=U.size*.485;this.goalTarget.set(J(t,-s,s),n,J(e,-s,s)),this.goalDist=J(i,U.minZoom,U.maxZoom)}updatePreviewOrbit(t,e=22){this.goalYaw+=t*.1,this.goalPitch=.62,this.goalDist=J(U.defaultDist*1.18,U.minZoom,U.maxZoom),this.update(t,e)}update(t,e=18){let i=(36*Math.sqrt(U.horizScale)+this.distance*.68)*t,n=Math.sin(this.yaw),s=Math.cos(this.yaw),o=0,a=0;if((this.keys.has("KeyW")||this.keys.has("ArrowUp"))&&(o+=1),(this.keys.has("KeyS")||this.keys.has("ArrowDown"))&&(o-=1),(this.keys.has("KeyD")||this.keys.has("ArrowRight"))&&(a+=1),(this.keys.has("KeyA")||this.keys.has("ArrowLeft"))&&(a+=1),o!==0||a!==0){let u=Math.hypot(o,a);o/=u,a/=u,this.goalTarget.x+=(-n*o+s*a)*i,this.goalTarget.z+=(-s*o-n*a)*i;let d=U.size*.485;this.goalTarget.x=J(this.goalTarget.x,-d,d),this.goalTarget.z=J(this.goalTarget.z,-d,d),this.userMoved=!0}this.keys.has("KeyQ")&&(this.goalYaw+=1.55*t,this.userMoved=!0),this.keys.has("KeyE")&&(this.goalYaw-=1.55*t,this.userMoved=!0),this.goalTarget.y=ne(this.goalTarget.y,Math.max(8,e+2.5),J(t*5,0,1));let c=J(t*10.5,.05,1);this.yaw=ne(this.yaw,this.goalYaw,c),this.pitch=ne(this.pitch,this.goalPitch,c),this.distance=ne(this.distance,this.goalDist,c),this.target.lerp(this.goalTarget,c);let l=Math.cos(this.pitch)*this.distance,h=Math.sin(this.pitch)*this.distance;this.camera.position.set(this.target.x+Math.sin(this.yaw)*l,Math.max(e+5.5,this.target.y+h),this.target.z+Math.cos(this.yaw)*l),this.camera.lookAt(this.target)}};var qa=class{constructor(){this.ctx=null,this.muted=!1,this.initialized=!1,this.waterGain=null,this.waterFilter=null,this.turbineGain=null,this.turbineOsc=null}unlock(){if(this.initialized||this.muted)return;let t=window.AudioContext||window.webkitAudioContext;if(t)try{this.ctx=new t,this.ctx.state==="suspended"&&this.ctx.resume();let e=this.ctx.sampleRate*2,i=this.ctx.createBuffer(1,e,this.ctx.sampleRate),n=i.getChannelData(0),s=0,o=0,a=0;for(let h=0;h<e;h++){let u=Math.random()*2-1;s=.997*s+u*.029,o=.985*o+u*.032,a=.95*a+u*.048,n[h]=J((s+o+a+u*.04)*1.8,-1,1)}let c=this.ctx.createBufferSource();c.buffer=i,c.loop=!0,this.waterFilter=this.ctx.createBiquadFilter(),this.waterFilter.type="lowpass",this.waterFilter.frequency.value=620,this.waterGain=this.ctx.createGain(),this.waterGain.gain.value=.04,c.connect(this.waterFilter),this.waterFilter.connect(this.waterGain),this.waterGain.connect(this.ctx.destination),c.start(),this.turbineOsc=this.ctx.createOscillator(),this.turbineOsc.type="triangle",this.turbineOsc.frequency.value=98;let l=this.ctx.createBiquadFilter();l.type="lowpass",l.frequency.value=190,this.turbineGain=this.ctx.createGain(),this.turbineGain.gain.value=0,this.turbineOsc.connect(l),l.connect(this.turbineGain),this.turbineGain.connect(this.ctx.destination),this.turbineOsc.start(),this.initialized=!0}catch{}}toggleMute(){return this.muted=!this.muted,!this.muted&&!this.initialized&&this.unlock(),this.ctx&&this.initialized&&this.muted&&(this.waterGain.gain.setTargetAtTime(0,this.ctx.currentTime,.08),this.turbineGain.gain.setTargetAtTime(0,this.ctx.currentTime,.08)),this.muted}updateContinuous(t,e,i){if(!this.initialized||this.muted||!this.ctx||this.ctx.state==="suspended")return;let n=J(1-(t-45)/290,.18,1),s=J(.03+n*.06+e/140*.14,0,.22),o=J(420+n*520+e*12,350,2400),a=this.ctx.currentTime;this.waterGain.gain.setTargetAtTime(s,a,.12),this.waterFilter.frequency.setTargetAtTime(o,a,.12);let c=i>.1?J(.012+i/30*.045,0,.065)*n:0;this.turbineGain.gain.setTargetAtTime(c,a,.15),this.turbineOsc.frequency.setTargetAtTime(92+Math.min(35,i*.9),a,.2)}playTone(t=440,e=.12,i="sine",n=.08){if(!(!this.initialized||this.muted||!this.ctx))try{let s=this.ctx.currentTime,o=this.ctx.createOscillator(),a=this.ctx.createGain();o.type=i,o.frequency.setValueAtTime(t,s),a.gain.setValueAtTime(n,s),a.gain.exponentialRampToValueAtTime(8e-4,s+e),o.connect(a),a.connect(this.ctx.destination),o.start(s),o.stop(s+e+.02)}catch{}}playBuild(){this.playTone(210,.09,"triangle",.07),setTimeout(()=>this.playTone(315,.11,"sine",.06),45)}playDig(){this.playTone(135+Math.random()*35,.07,"sawtooth",.035)}playMilestone(){this.playTone(523.25,.16,"sine",.09),setTimeout(()=>this.playTone(659.25,.18,"sine",.09),110),setTimeout(()=>this.playTone(783.99,.28,"sine",.1),220)}};var Ya=class{constructor(t){this.game=t,this.active=!1,this.completed=!1,this.stepIndex=0,this.visitedGorge=!1,this.cardEl=document.getElementById("tutorial-card"),this.stepBadgeEl=document.getElementById("tut-step-badge"),this.titleEl=document.getElementById("tut-title"),this.bodyEl=document.getElementById("tut-body"),this.progFillEl=document.getElementById("tut-prog-fill"),this.progTextEl=document.getElementById("tut-prog-text"),this.rewardEl=document.getElementById("tut-reward"),this._bindButtons()}_getGorgeCoords(){let t=this.game.hydro.presetId||"bystritsa",i=$n(t).gorges[0]||{x:12*U.horizScale,z:-158*U.horizScale};return{x:i.x,z:i.z}}_getSteps(){let t=this._getGorgeCoords(),e=U.horizScale,i=Math.pow(e,.68),n=U.powerScale;return[{id:"recon",title:"\u0420\u0430\u0437\u0432\u0435\u0434\u043A\u0430 \u0443\u0449\u0435\u043B\u044C\u044F \u0438 \u0433\u0435\u043E\u0434\u0435\u0437\u0438\u044F",toolId:"inspect",reward:2e3,target:{x:t.x,z:t.z,dist:128*i},body:"\u041F\u0435\u0440\u0435\u043B\u0435\u0442\u0438\u0442\u0435 \u043A \u0441\u043A\u0430\u043B\u044C\u043D\u043E\u043C\u0443 \u0443\u0449\u0435\u043B\u044C\u044E \u043A\u043D\u043E\u043F\u043A\u043E\u0439 <b>\xAB\u2316 \u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u043C\u0435\u0441\u0442\u043E\xBB</b> (\u0438\u043B\u0438 \u043A\u043B\u0430\u0432\u0438\u0448\u0430\u043C\u0438 <code>WASD</code> + \u043A\u043E\u043B\u0435\u0441\u043E \u043C\u044B\u0448\u0438) \u0438 \u0432\u043A\u043B\u044E\u0447\u0438\u0442\u0435 \u0438\u0437\u043E\u043B\u0438\u043D\u0438\u0438 \u0432\u044B\u0441\u043E\u0442 <b>[\u2261 \u0412\u044B\u0441\u043E\u0442\u044B]</b> (<code>C</code>), \u0447\u0442\u043E\u0431\u044B \u0443\u0432\u0438\u0434\u0435\u0442\u044C \u043A\u0430\u043C\u0435\u043D\u043D\u044B\u0435 \u0449\u0451\u043A\u0438 \u043A\u0430\u043D\u044C\u043E\u043D\u0430.",progress:()=>{Math.hypot(this.game.camCtrl.target.x-t.x,this.game.camCtrl.target.z-t.z)<98*e&&(this.visitedGorge=!0);let o=(this.visitedGorge?.6:0)+(this.game.showContours?.4:0);return{ratio:J(o,0,1),label:this.visitedGorge?this.game.showContours?"\u0421\u0442\u0432\u043E\u0440 \u0438\u0437\u0443\u0447\u0435\u043D!":"\u0412\u043A\u043B\u044E\u0447\u0438\u0442\u0435 \u0438\u0437\u043E\u043B\u0438\u043D\u0438\u0438 [C] \u0438\u043B\u0438 \u043D\u0430\u0436\u043C\u0438\u0442\u0435 \xAB\u0414\u0430\u043B\u0435\u0435\xBB":"\u041D\u0430\u0432\u0435\u0434\u0438\u0442\u0435 \u043A\u0430\u043C\u0435\u0440\u0443 \u043D\u0430 \u0443\u0449\u0435\u043B\u044C\u0435 \xAB\u0412\u043E\u0440\u043E\u0442\u0430 \u0413\u0440\u043E\u043C\u0430\xBB",done:this.visitedGorge&&this.game.showContours}}},{id:"volumetric_dam",title:"\u041E\u0431\u044A\u0451\u043C\u043D\u0430\u044F 3D-\u043F\u043B\u043E\u0442\u0438\u043D\u0430 \u0438 \u043F\u0435\u0440\u0435\u043B\u0438\u0432",toolId:"concrete_dam",reward:5e3,target:{x:t.x,z:t.z,dist:124*i},body:"\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 <b>[5] 3D \u041F\u043B\u043E\u0442\u0438\u043D\u0430</b>, \u0443\u043A\u0430\u0436\u0438\u0442\u0435 \u044F\u0440\u0443\u0441 \u0432\u044B\u0441\u043E\u0442\u044B \u0438 \u043F\u0440\u043E\u0442\u044F\u043D\u0438\u0442\u0435 \u041B\u041A\u041C \u043E\u0442 \u043B\u0435\u0432\u043E\u0439 \u0441\u043A\u0430\u043B\u044B \u0443\u0449\u0435\u043B\u044C\u044F \u043A \u043F\u0440\u0430\u0432\u043E\u0439. \u041F\u0440\u0438 \u043D\u0430\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u0438 \u0432\u043E\u0434\u043E\u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0430 \u0432\u044B \u0443\u0432\u0438\u0434\u0438\u0442\u0435 \u0436\u0438\u0432\u043E\u0439 3D-\u043F\u0435\u0440\u0435\u043B\u0438\u0432 \u0432\u043E\u0434\u044B \u0447\u0435\u0440\u0435\u0437 \u0433\u0440\u0435\u0431\u0435\u043D\u044C!",progress:()=>{let s=this.game.hydro.damCellCount;return{ratio:J(s/6,0,1),label:`\u0412\u043E\u0437\u0432\u0435\u0434\u0435\u043D\u043E \u043E\u0431\u044A\u0451\u043C\u043D\u044B\u0445 \u0441\u0435\u043A\u0446\u0438\u0439 \u043F\u043B\u043E\u0442\u0438\u043D\u044B: ${Math.min(s,6)} / 6`,done:s>=6}}},{id:"buttress_spillway",title:"\u041A\u043E\u043D\u0442\u0440\u0444\u043E\u0440\u0441\u044B \u0438 3D-\u0432\u043E\u0434\u043E\u0441\u0431\u0440\u043E\u0441",toolId:"foundation",reward:4500,target:{x:t.x,z:t.z+8*e,dist:122*i},body:"\u0412\u044B\u0441\u043E\u043A\u0438\u0439 \u043D\u0430\u043F\u043E\u0440 \u0432\u044B\u0437\u044B\u0432\u0430\u0435\u0442 \u0444\u0438\u043B\u044C\u0442\u0440\u0430\u0446\u0438\u044E \u0414\u0430\u0440\u0441\u0438 \u043F\u043E\u0434 \u043E\u0441\u043D\u043E\u0432\u0430\u043D\u0438\u0435\u043C! \u0423\u043A\u0440\u0435\u043F\u0438\u0442\u0435 \u043F\u043B\u043E\u0442\u0438\u043D\u0443 \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u043E\u043C <b>[6] \u041A\u043E\u043D\u0442\u0440\u0444\u043E\u0440\u0441</b> \u0438 \u0432\u0440\u0435\u0436\u044C\u0442\u0435 \u0441\u0431\u043E\u043A\u0443 <b>[7] \u0412\u043E\u0434\u043E\u0441\u0431\u0440\u043E\u0441</b> \u0441 3D-\u043B\u043E\u0442\u043A\u043E\u043C \u0438 \u043D\u043E\u0441\u043A\u043E\u043C-\u0442\u0440\u0430\u043C\u043F\u043B\u0438\u043D\u043E\u043C.",progress:()=>{let s=this.game.hydro.reinforcedCellCount,o=this.game.hydro.spillways.length;return{ratio:J(Math.min(1,s/3)*.5+(o>0?.5:0),0,1),label:`\u041A\u043E\u043D\u0442\u0440\u0444\u043E\u0440\u0441\u044B: ${Math.min(s,3)}/3 \xB7 \u0412\u043E\u0434\u043E\u0441\u0431\u0440\u043E\u0441: ${o}/1`,done:s>=3&&o>=1}}},{id:"turbine_launch",title:"\u041F\u0440\u0438\u043F\u043B\u043E\u0442\u0438\u043D\u043D\u0430\u044F \u0413\u042D\u0421 \u0432 \u043D\u0438\u0436\u043D\u0435\u043C \u0431\u044C\u0435\u0444\u0435",toolId:"turbine_kaplan",reward:6500,target:{x:t.x,z:t.z,dist:118*i},body:"\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 <b>[8] \u041A\u0430\u043F\u043B\u0430\u043D</b>, <b>[9] \u0424\u0440\u044D\u043D\u0441\u0438\u0441</b> \u0438\u043B\u0438 <b>[0] \u0413\u0410\u042D\u0421</b> \u0438 \u043A\u043B\u0438\u043A\u043D\u0438\u0442\u0435 \u043F\u043E \u043F\u043B\u043E\u0442\u0438\u043D\u0435: \u0432\u043E\u0434\u043E\u043F\u0440\u0438\u0451\u043C\u043D\u0438\u043A \u0432\u0441\u0442\u0430\u043D\u0435\u0442 \u0432 \u0432\u0435\u0440\u0445\u043D\u0435\u043C \u0431\u044C\u0435\u0444\u0435, \u0441\u0442\u0430\u043B\u044C\u043D\u044B\u0435 \u0432\u043E\u0434\u043E\u0432\u043E\u0434\u044B \u043F\u043E\u0439\u0434\u0443\u0442 \u0432\u043D\u0438\u0437, \u0430 \u043C\u0430\u0448\u0437\u0430\u043B \u0430\u043A\u043A\u0443\u0440\u0430\u0442\u043D\u043E \u0440\u0430\u0437\u043C\u0435\u0441\u0442\u0438\u0442\u0441\u044F \u0443 \u043F\u043E\u0434\u043D\u043E\u0436\u0438\u044F \u0432 \u043D\u0438\u0436\u043D\u0435\u043C \u0431\u044C\u0435\u0444\u0435!",progress:()=>{let s=this.game.hydro.turbines.length>0,o=+(.35*n).toFixed(1),a=Math.max(this.game.economy.totalMW,this.game.economy.pumpedConsumeMW);return{ratio:J((s?.45:0)+Math.min(.55,a/Math.max(.1,o)*.55),0,1),label:s?`\u0412\u044B\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u0413\u042D\u0421: ${a.toFixed(1)} / ${o} \u041C\u0412\u0442`:"\u0423\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u0435 \u0433\u0438\u0434\u0440\u043E\u0430\u0433\u0440\u0435\u0433\u0430\u0442 \u0432 \u0441\u0442\u0432\u043E\u0440 \u043F\u043B\u043E\u0442\u0438\u043D\u044B",done:s&&a>=o}}},{id:"substation_grid",title:"\u041E\u0420\u0423 220 \u043A\u0412, \u0448\u043B\u044E\u0437\u044B \u0438 8 \u0433\u043E\u0440\u043E\u0434\u043E\u0432",toolId:"powerline",reward:5500,target:{x:t.x+36*e,z:t.z+16*e,dist:145*i},body:"\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 <b>[P] \u041E\u0420\u0423 / \u041B\u042D\u041F</b> \u0438 \u043A\u043B\u0438\u043A\u043D\u0438\u0442\u0435 \u043D\u0430 \u0441\u0443\u0445\u043E\u043C \u0431\u0435\u0440\u0435\u0433\u0443 \u0440\u044F\u0434\u043E\u043C \u0441 \u0413\u042D\u0421, \u0447\u0442\u043E\u0431\u044B \u0432\u043E\u0437\u0432\u0435\u0441\u0442\u0438 <b>3D-\u043F\u043E\u0434\u0441\u0442\u0430\u043D\u0446\u0438\u044E \u041E\u0420\u0423</b> (\u0441\u043D\u0438\u0436\u0430\u0435\u0442 \u043F\u043E\u0442\u0435\u0440\u0438 \u0441 16% \u0434\u043E 3%), \u0437\u0430\u0442\u0435\u043C \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0438\u0442\u0435 \u0435\u0449\u0451 \u043E\u0434\u0438\u043D \u0433\u043E\u0440\u043E\u0434 \u0441\u043F\u0440\u0430\u0432\u0430 (\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440 \u0410\u043B\u044E\u043C\u0433\u0440\u0430\u0434 \u0438\u043B\u0438 \u0422\u0435\u0445\u043D\u043E\u043F\u0430\u0440\u043A \u0418\u0418)!",progress:()=>{let s=this.game.hydro.substations.length,o=this.game.economy.cities.filter(c=>c.connected).length;return{ratio:J((s>0?.5:0)+(o>=2?.5:0),0,1),label:`\u041F\u043E\u0434\u0441\u0442\u0430\u043D\u0446\u0438\u044F \u041E\u0420\u0423: ${Math.min(1,s)}/1 \xB7 \u0413\u043E\u0440\u043E\u0434\u043E\u0432 \u0432 \u0441\u0435\u0442\u0438: ${o}/2`,done:s>=1||o>=2}}},{id:"custom_canal",title:"\u0421\u0432\u043E\u0439 \u043A\u0430\u043D\u0430\u043B, \u0448\u043B\u044E\u0437 [L] \u0438\u043B\u0438 \u0440\u044B\u0431\u0445\u043E\u0437 [F]",toolId:"canal_dig",reward:6500,target:{x:146*e,z:72*e,dist:140*i},body:"\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 <b>[2] \u041A\u0430\u043D\u0430\u043B</b> (\u0441 <code>Shift</code> \u0434\u043B\u044F \u0440\u043E\u0432\u043D\u043E\u0433\u043E \u0434\u043D\u0430!) \u0438 \u043F\u0440\u043E\u0440\u043E\u0439\u0442\u0435 \u0440\u0443\u0441\u043B\u043E \u043A \u0437\u0435\u043B\u0451\u043D\u043E\u043C\u0443 \u043A\u043E\u043B\u044C\u0446\u0443 \u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u044B \u2014 \u043B\u0438\u0431\u043E \u043F\u043E\u0441\u0442\u0440\u043E\u0439\u0442\u0435 <b>[L] \u0428\u043B\u044E\u0437</b> / <b>[F] \u0420\u044B\u0431\u0445\u043E\u0437</b> \u0434\u043B\u044F \u043D\u043E\u0432\u044B\u0445 \u0438\u0441\u0442\u043E\u0447\u043D\u0438\u043A\u043E\u0432 \u0434\u043E\u0445\u043E\u0434\u0430!",progress:()=>{let s=this.game.hydro.excavatedNormM3,o=this.game.hydro.navLocks.length+this.game.hydro.fishFarms.length,a=o>0?1:J(s/220,0,1);return{ratio:a,label:o>0?"\u041F\u043E\u0441\u0442\u0440\u043E\u0435\u043D \u0448\u043B\u044E\u0437 / \u0440\u044B\u0431\u0445\u043E\u0437!":`\u041F\u0440\u043E\u0433\u0440\u0435\u0441\u0441 \u0437\u0435\u043C\u043B\u044F\u043D\u044B\u0445 \u0440\u0430\u0431\u043E\u0442 \u043A\u0430\u043D\u0430\u043B\u0430: ${Math.round(a*100)}%`,done:o>0||s>=220}}},{id:"spot_dispatch",title:"\u042D\u043D\u0435\u0440\u0433\u043E\u0440\u044B\u043D\u043E\u043A, \u0413\u0410\u042D\u0421 \u0438 \u0432\u043E\u0434\u043D\u044B\u0439 \u0431\u0430\u043B\u0430\u043D\u0441",toolId:"inspect",reward:4e3,target:{x:t.x,z:t.z,dist:115*i},body:"\u0418\u0437\u0443\u0447\u0438\u0442\u0435 \u0432\u043A\u043B\u0430\u0434\u043A\u0443 <b>\xAB\u0412\u043E\u0434\u0430 \u0438 12 \u0434\u043E\u0445\u043E\u0434\u043E\u0432\xBB</b> \u0441\u043F\u0440\u0430\u0432\u0430, \u0430 \u0437\u0430\u0442\u0435\u043C \u0432\u044B\u0431\u0435\u0440\u0438\u0442\u0435 <b>[1] \u041E\u0441\u043C\u043E\u0442\u0440</b>, \u043A\u043B\u0438\u043A\u043D\u0438\u0442\u0435 \u043F\u043E \u043C\u0430\u0448\u0437\u0430\u043B\u0443 \u0413\u042D\u0421 \u0438 \u0432\u043A\u043B\u044E\u0447\u0438\u0442\u0435 <b>\xAB\u0410\u0432\u0442\u043E-\u0434\u0438\u0441\u043F\u0435\u0442\u0447\u0435\u0440\xBB</b> \u0438\u043B\u0438 <b>\xAB\u041D\u043E\u0447\u043D\u0443\u044E \u0437\u0430\u043A\u0430\u0447\u043A\u0443 \u0413\u0410\u042D\u0421\xBB</b>!",progress:()=>{let s=this.game.hydro.turbines.some(o=>o.autoDispatch||o.pumpedStorage);return{ratio:s?1:.2,label:s?"\u0418\u043D\u0442\u0435\u043B\u043B\u0435\u043A\u0442\u0443\u0430\u043B\u044C\u043D\u044B\u0439 \u0440\u0435\u0436\u0438\u043C \u0413\u042D\u0421/\u0413\u0410\u042D\u0421 \u0430\u043A\u0442\u0438\u0432\u0435\u043D!":"\u041E\u0442\u043A\u0440\u043E\u0439\u0442\u0435 \u0438\u043D\u0441\u043F\u0435\u043A\u0442\u043E\u0440 \u0413\u042D\u0421 \u0438 \u0432\u043A\u043B\u044E\u0447\u0438\u0442\u0435 \u0410\u0432\u0442\u043E-\u0434\u0438\u0441\u043F\u0435\u0442\u0447\u0435\u0440 / \u0413\u0410\u042D\u0421",done:s}}},{id:"master_diploma",title:"\u041F\u043E\u0432\u0435\u043B\u0438\u0442\u0435\u043B\u044C \u0440\u0435\u0447\u043D\u043E\u0433\u043E \u0431\u0430\u0441\u0441\u0435\u0439\u043D\u0430!",toolId:"turbine_francis",reward:12e3,target:{x:168*e,z:98*e,dist:165*i},body:`\u0424\u0438\u043D\u0430\u043B\u044C\u043D\u044B\u0439 \u044D\u043A\u0437\u0430\u043C\u0435\u043D: \u0434\u043E\u0432\u0435\u0434\u0438\u0442\u0435 \u0432\u044B\u0440\u0430\u0431\u043E\u0442\u043A\u0443 \u043A\u0430\u0441\u043A\u0430\u0434\u0430 \u0434\u043E <b>${(1.4*n).toFixed(0)} \u041C\u0412\u0442</b> \u0418\u041B\u0418 \u043F\u043E\u0434\u0430\u0439\u0442\u0435 \u0432\u043E\u0434\u0443 \u043A\u0430\u043D\u0430\u043B\u043E\u043C \u0432 \u043E\u0440\u043E\u0441\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u0431\u0430\u0441\u0441\u0435\u0439\u043D <b>\u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u044B</b>!`,progress:()=>{let s=1.4*n,o=this.game.economy.totalMW,a=this.game.economy.agroIrrigated;return{ratio:a?1:J(o/s,0,1),label:a?"\u041E\u0440\u043E\u0448\u0435\u043D\u0438\u0435 \u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u044B \u0437\u0430\u043F\u0443\u0449\u0435\u043D\u043E!":`\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C \u0413\u042D\u0421: ${o.toFixed(1)} / ${s.toFixed(0)} \u041C\u0412\u0442`,done:a||o>=s}}}]}_bindButtons(){let t=document.getElementById("tut-btn-fly"),e=document.getElementById("tut-btn-equip"),i=document.getElementById("tut-btn-skip"),n=document.getElementById("tut-close"),s=document.getElementById("btn-tutorial");t&&t.addEventListener("click",()=>{let o=this._getSteps()[this.stepIndex];if(!o)return;let a=this.game.hydro.sampleAtWorld(o.target.x,o.target.z).bed;this.game.camCtrl.flyTo(o.target.x,o.target.z,o.target.dist,a),o.id==="recon"&&(this.visitedGorge=!0)}),e&&e.addEventListener("click",()=>{let o=this._getSteps()[this.stepIndex];o&&(o.id==="recon"&&!this.game.showContours&&this.game.toggleContours(),o.toolId&&this.game.selectTool(o.toolId))}),i&&i.addEventListener("click",()=>{this._advanceStep(!0)}),n&&n.addEventListener("click",()=>{this.stop()}),s&&s.addEventListener("click",()=>{this.active?this.stop():(this.completed&&(this.stepIndex=0),this.start(this.stepIndex))})}start(t=0){this.active=!0,this.completed=!1,this.stepIndex=t,this.cardEl&&this.cardEl.classList.remove("hidden");let e=document.getElementById("btn-tutorial");e&&e.classList.add("active"),this._renderCurrentStep(!0)}stop(){this.active=!1,this.cardEl&&this.cardEl.classList.add("hidden");let t=document.getElementById("btn-tutorial");t&&t.classList.remove("active"),this._clearToolHighlight(),this.game.worldView.setTutorialTarget(0,0,!1)}_clearToolHighlight(){document.querySelectorAll(".tool-slot.tut-pulse").forEach(t=>t.classList.remove("tut-pulse"))}_renderCurrentStep(t=!1){let e=this._getSteps(),i=e[this.stepIndex];if(!i){this._finishAll();return}if(this.stepBadgeEl.textContent=`\u041E\u0411\u0423\u0427\u0415\u041D\u0418\u0415 \xB7 \u0428\u0410\u0413 ${this.stepIndex+1} \u0418\u0417 ${e.length}`,this.titleEl.textContent=i.title,this.bodyEl.innerHTML=i.body,this.rewardEl.textContent=`\u041F\u0440\u0435\u043C\u0438\u044F: +${i.reward.toLocaleString("ru-RU")} \u20BD`,this._clearToolHighlight(),i.toolId){let n=document.querySelector(`.tool-slot[data-tool="${i.toolId}"]`);n&&n.classList.add("tut-pulse")}if(this.game.worldView.setTutorialTarget(i.target.x,i.target.z,!0),t&&this.stepIndex===0){let n=this.game.hydro.sampleAtWorld(i.target.x,i.target.z).bed;this.game.camCtrl.flyTo(i.target.x,i.target.z,i.target.dist*1.12,n)}this.update()}_advanceStep(t=!1){let e=this._getSteps(),i=e[this.stepIndex];i&&!t&&(this.game.economy.earn(i.reward),this.game.audio.playMilestone(),this.game.notify(`\u2726 \u0428\u0430\u0433 \u043E\u0431\u0443\u0447\u0435\u043D\u0438\u044F \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D: \xAB${i.title}\xBB (+${i.reward.toLocaleString("ru-RU")} \u20BD)!`,"good")),this.stepIndex++,this.stepIndex>=e.length?this._finishAll():this._renderCurrentStep(!1)}_finishAll(){this.completed=!0,this.active=!1,this._clearToolHighlight(),this.game.worldView.setTutorialTarget(0,0,!1),this.cardEl&&this.cardEl.classList.add("hidden");let t=document.getElementById("btn-tutorial");t&&t.classList.remove("active"),this.game.notify("\u2605 \u041F\u043E\u0437\u0434\u0440\u0430\u0432\u043B\u044F\u0435\u043C! \u0412\u044B \u043E\u043A\u043E\u043D\u0447\u0438\u043B\u0438 \u0428\u043A\u043E\u043B\u0443 \u0413\u043B\u0430\u0432\u043D\u043E\u0433\u043E \u0413\u0438\u0434\u0440\u043E\u0441\u0442\u0440\u043E\u0438\u0442\u0435\u043B\u044F \u0438 \u043E\u0441\u0432\u043E\u0438\u043B\u0438 \u0432\u0435\u0441\u044C \u043A\u0430\u0441\u043A\u0430\u0434!","good");try{localStorage.setItem("cascade.tutorialDone","1")}catch{}}update(){if(!this.active)return;let e=this._getSteps()[this.stepIndex];if(!e)return;let i=e.progress();this.progFillEl&&(this.progFillEl.style.width=`${Math.round(i.ratio*100)}%`),this.progTextEl&&(this.progTextEl.textContent=i.label),i.done&&this._advanceStep(!1)}};var Xd={inspect:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#38bdf8" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M11 8v6M8 11h6"/></svg>',canal_dig:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#22d3ee" stroke-width="2"><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/><path d="M2 21h20"/></svg>',canal_liner:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#cbd5e1" stroke-width="2"><path d="M2 7h3l3 10h8l3-10h3"/><path d="M7 13h10"/><path d="M5 19h14" stroke="#38bdf8"/></svg>',earth_dam:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#d97706" stroke-width="2"><path d="M2 19L9 7h6l7 12H2z"/><path d="M6 19l4-7h4l4 7"/></svg>',concrete_dam:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#f8fafc" stroke-width="2"><path d="M3 20L6 5h12l3 15H3z"/><path d="M5 10h14M4 15h16M12 5v15" stroke="#94a3b8" stroke-width="1.5"/></svg>',foundation:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M4 20V6h6l10 14H4z"/><path d="M7 20v3M12 20v3M17 20v3" stroke="#fbbf24"/><path d="M4 12h9"/></svg>',spillway:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M4 5v14M20 5v14M4 9h16"/><path d="M7 11c2 4 5 5 10 8" stroke="#67e8f9"/><path d="M6 15c2 2 5 3 8 4" stroke="#bae6fd"/></svg>',turbine_kaplan:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#60a5fa" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v6M12 16v6M2 12h6M16 12h6"/></svg>',turbine_francis:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fbbf24" stroke-width="2"><polygon points="13 2 4 14 11 14 10 22 20 10 13 10 13 2"/></svg>',turbine_pelton:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#34d399" stroke-width="2"><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1"/></svg>',nav_lock:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M3 16l3 4h12l3-4H3z"/><path d="M7 16v-5h10v5M12 7v4"/><path d="M2 21c3-1 5 1 8 0s5-1 8 0 4 0 4 0" stroke="#7dd3fc"/></svg>',fish_eco:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#2dd4bf" stroke-width="2"><path d="M3 12c3-5 10-6 15-1-5 5-12 4-15 1z"/><path d="M18 11l4-3v6l-4-3z"/><circle cx="8" cy="11.5" r="1" fill="#2dd4bf"/></svg>',powerline:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fde047" stroke-width="2"><path d="M12 3L7 21M12 3l5 18M5 9h14M7 14h10"/></svg>',demolish:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#f87171" stroke-width="2"><path d="M5 5l14 14M19 5L5 19"/></svg>'};var Tc=["normal","rain","flood","low_water"],Ac=[0,1,2,5];function Ui(){return new Promise(r=>requestAnimationFrame(()=>r()))}var Cc=class{constructor(){this.canvas=document.getElementById("scene"),this.device=Dd();let t=Nd(),e=this._loadSetting("quality",null),i=t?"low":e||this.device.recommendedQuality;this.profile=Ra[i]||Ra.medium,this.selectedScaleId="km5",Ia(this.selectedScaleId),this.selectedPresetId="bystritsa",this.selectedMode="standard",this.activeSideTab="cities",this.isInPreGameLoader=!0,this.isLoadingMap=!0,this.ready=!1,this.audio=new qa,this._initRenderer(),this.scene=new Vs,this.camera=new Ke(46,window.innerWidth/window.innerHeight,2,28500),this.camCtrl=new Xa(this.camera,this.canvas),this.activeToolId="concrete_dam",this.brushSizeIndex=1,this.brushRadius=U.brushSizes[1],this.damTierIndex=1,this.manualYaw=null,this.showContours=!1,this.speedIndex=1,this.selectedStruct=null,this.pointerDown=!1,this.lastBrushWorld=null,this.lockedGradeElev=null,this.hoverWorld=null,this.showDiag=!1,this.fps=60,this._fpsFrames=0,this._fpsAccum=0,this._frameCount=0,this._uiRefreshAccum=0,this._lastTime=performance.now(),this._onResize(),window.addEventListener("resize",()=>this._onResize()),this._bindLoaderUI(),this._bootAsync()}_setLoaderProgress(t,e){let i=document.getElementById("loader-bar-fill"),n=document.getElementById("loader-stage"),s=document.getElementById("loader-pct");i&&(i.style.width=`${t}%`),n&&(n.textContent=e),s&&(s.textContent=`${Math.round(t)}%`)}_syncScaleLabelsInUI(){let t=Cn[this.selectedScaleId]||Cn.km5,e=document.getElementById("hud-scale-badge");e&&(e.textContent=t.short);let i=document.getElementById("scen-meta-bystritsa"),n=document.getElementById("scen-meta-rapids"),s=document.getElementById("scen-meta-delta");i&&(i.textContent=`${t.short} \xB7 ${t.areaKm2} \xB7 3 \u0440\u0435\u043A\u0438 \u0438 \u043B\u0435\u0434\u043D\u0438\u043A\u0438`),n&&(n.textContent=`${t.short} \xB7 ${t.areaKm2} \xB7 \u0414\u0432\u043E\u0439\u043D\u043E\u0439 \u043A\u0430\u043D\u044C\u043E\u043D \u0413\u0410\u042D\u0421`),s&&(s.textContent=`${t.short} \xB7 ${t.areaKm2} \xB7 \u0421\u0443\u0434\u043E\u0445\u043E\u0434\u043D\u043E\u0435 \u0440\u0443\u0441\u043B\u043E`);for(let o=0;o<3;o++){let a=document.getElementById(`brush-btn-${o}`);a&&(a.textContent=`${Math.round(U.brushSizes[o]*2)}\u043C`);let c=document.getElementById(`tier-btn-${o}`),l=Math.round((_e.damHeightTiers[o]?.addHeight||11)*U.elevScale);c&&(c.textContent=`+${l}\u043C`)}this.brushRadius=U.brushSizes[this.brushSizeIndex]||U.brushSizes[1]}_bindLoaderUI(){let t=document.getElementById("btn-enter-valley"),e=document.getElementById("pill-mode-std"),i=document.getElementById("pill-mode-cre"),n=document.getElementById("chk-start-tutorial");n&&this._loadSetting("tutorialDone","")==="1"&&(n.checked=!1),document.querySelectorAll(".scale-card").forEach(o=>{o.addEventListener("click",()=>{if(this.isLoadingMap)return;let a=o.dataset.scale;!a||a===this.selectedScaleId||(this.selectedScaleId=a,Ia(a),this.camCtrl.syncToWorldScale(),this._syncScaleLabelsInUI(),document.querySelectorAll(".scale-card").forEach(c=>c.classList.remove("active")),o.classList.add("active"),this.loadValleyMapAsync(this.selectedPresetId))})}),document.querySelectorAll(".scenario-card").forEach(o=>{o.addEventListener("click",()=>{if(this.isLoadingMap)return;let a=o.dataset.preset;!a||a===this.selectedPresetId||(document.querySelectorAll(".scenario-card").forEach(c=>c.classList.remove("active")),o.classList.add("active"),this.loadValleyMapAsync(a))})});let s=o=>{this.selectedMode=o,e.classList.toggle("active",o==="standard"),i.classList.toggle("active",o==="creative")};e.addEventListener("click",()=>s("standard")),i.addEventListener("click",()=>s("creative")),t.addEventListener("click",()=>{this.isLoadingMap||(this.audio.unlock(),this.enterValley())})}async _bootAsync(){let t=document.getElementById("btn-enter-valley");t&&(t.disabled=!0,t.textContent="\u0413\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u044F \u0431\u0430\u0441\u0441\u0435\u0439\u043D\u0430\u2026"),this._syncScaleLabelsInUI(),this._setLoaderProgress(10,"\u0421\u0438\u043D\u0442\u0435\u0437 \u0442\u0435\u043A\u0441\u0442\u0443\u0440\u044B \u0432\u043E\u0434\u044B 512\xD7512, \u043C\u0435\u0433\u0430-\u0430\u0442\u043B\u0430\u0441\u0430 64 \u0444\u0430\u0441\u0430\u0434\u043E\u0432 \u0438 432 \u043F\u0440\u0435\u0441\u0435\u0442\u043E\u0432 \u043E\u0442\u0442\u0435\u043D\u043A\u043E\u0432\u2026"),await Ui(),this.textures=za(this.renderer);let e=Cn[this.selectedScaleId];this._setLoaderProgress(24,`\u0412\u044B\u0434\u0435\u043B\u0435\u043D\u0438\u0435 \u043F\u0430\u043C\u044F\u0442\u0438 \u0443\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u0439 \u0421\u0435\u043D-\u0412\u0435\u043D\u0430\u043D\u0430 (${e.label})\u2026`),await Ui(),this.hydro=new Ua(this.profile.grid,this.selectedPresetId,!0);let i=this.hydro.grid,n=Math.floor(i/3),s=Math.floor(i*2/3);this._setLoaderProgress(40,"\u0413\u0435\u043E\u0434\u0435\u0437\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u0441\u044A\u0451\u043C\u043A\u0430 \u043B\u0435\u0434\u043D\u0438\u043A\u043E\u0432\u044B\u0445 \u0445\u0440\u0435\u0431\u0442\u043E\u0432 \u0438 \u0441\u043A\u0430\u043B\u044C\u043D\u044B\u0445 \u0443\u0449\u0435\u043B\u0438\u0439 (1/3)\u2026"),await Ui(),Rn(i,this.hydro,this.selectedPresetId,0,n),this._setLoaderProgress(56,"\u0424\u043E\u0440\u043C\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u0442\u0435\u0440\u0440\u0430\u0441 \u043F\u043E\u0434 8 \u0433\u043E\u0440\u043E\u0434\u043E\u0432 \u0438 \u0434\u0435\u0440\u0438\u0432\u0430\u0446\u0438\u043E\u043D\u043D\u043E\u0433\u043E \u043F\u043B\u0430\u0442\u043E (2/3)\u2026"),await Ui(),Rn(i,this.hydro,this.selectedPresetId,n,s),this._setLoaderProgress(72,"\u041D\u0430\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u0435 \u0440\u0435\u043A \xAB\u0411\u044B\u0441\u0442\u0440\u0438\u0446\u0430\xBB, \xAB\u0421\u0435\u0440\u0435\u0431\u0440\u044F\u043D\u043A\u0430\xBB \u0438 \xAB\u0413\u0440\u0435\u043C\u0443\u0447\u0438\u0439\xBB (3/3)\u2026"),await Ui(),Rn(i,this.hydro,this.selectedPresetId,s,i),this.hydro.finalizeValleySetup(18),this._setLoaderProgress(86,"\u0417\u0430\u043F\u0443\u0441\u043A 8 \u0433\u043E\u0440\u043E\u0434\u043E\u0432 (32 \u0442\u0438\u043F\u0430 \u0437\u0434\u0430\u043D\u0438\u0439), \u043D\u0430\u0443\u0447\u043D\u043E\u0433\u043E \u0431\u0430\u043B\u0430\u043D\u0441\u0430 \u0432\u043E\u0434\u044B \u0438 300 \u0430\u043D\u0438\u043C\u0430\u0446\u0438\u0439\u2026"),await Ui(),this.economy=new ka(this.hydro,{onNotify:(a,c)=>this.notify(a,c),onMilestone:a=>{this.audio.playMilestone(),this.notify(`\u2605 \u0413\u0440\u0430\u043D\u0442 \u041C\u0438\u043D\u044D\u043D\u0435\u0440\u0433\u043E \xAB${a.title}\xBB: +${a.reward.toLocaleString("ru-RU")} \u20BD!`,"good")}}),this.worldView=new Va(this.scene,this.hydro,this.economy,this.profile,this.renderer,this.textures),this.spray=new Wa(this.scene,this.profile.maxParticles),this.tutorial=new Ya(this),this._setLoaderProgress(96,"\u041F\u0440\u0435\u0434\u043A\u043E\u043C\u043F\u0438\u043B\u044F\u0446\u0438\u044F WebGL-\u0448\u0435\u0439\u0434\u0435\u0440\u043E\u0432 \u0432\u043E\u0434\u044B, 3D-\u043F\u0435\u0440\u0435\u043B\u0438\u0432\u0430 \u0438 \u043C\u0435\u0433\u0430-\u0430\u0442\u043B\u0430\u0441\u0430 \u0433\u043E\u0440\u043E\u0434\u043E\u0432\u2026"),await Ui(),this.renderer.compile(this.scene,this.camera),this._initUI(),this._populateWorldCatalogTab(),this._bindWorldInput(),this._rebuildLandmarksBar(),this.worldView.syncCityInstances(),this.worldView.syncEngineeredVolumes(),this._setLoaderProgress(100,`\u0411\u0430\u0441\u0441\u0435\u0439\u043D \xAB${bi[this.selectedPresetId].name}\xBB (${e.short}, ${e.areaKm2}) \u0433\u043E\u0442\u043E\u0432!`),this.isLoadingMap=!1,this.ready=!0;let o=document.getElementById("map-loader");o&&o.classList.add("ready-preview"),t&&(t.disabled=!1,t.textContent=`\u25B6 \u0412\u043E\u0439\u0442\u0438 \u0432 \u0431\u0430\u0441\u0441\u0435\u0439\u043D (${e.short}) \u0438 \u043D\u0430\u0447\u0430\u0442\u044C \u0441\u0442\u0440\u043E\u0438\u0442\u0435\u043B\u044C\u0441\u0442\u0432\u043E`),this._lastTime=performance.now(),requestAnimationFrame(a=>this._loop(a)),window.location.search.includes("autostart=1")&&this.enterValley()}async loadValleyMapAsync(t){this.isLoadingMap=!0,this.selectedPresetId=t;let e=Cn[this.selectedScaleId],i=document.getElementById("btn-enter-valley");i&&(i.disabled=!0,i.textContent=`\u0413\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u044F \u043A\u0430\u0440\u0442\u044B ${e.short}\u2026`),this._setLoaderProgress(18,`\u041F\u0435\u0440\u0435\u0441\u0442\u0440\u043E\u0439\u043A\u0430 \u0431\u0430\u0441\u0441\u0435\u0439\u043D\u0430 \xAB${bi[t].name}\xBB (${e.label})\u2026`),await Ui(),this.hydro.presetId=t,this.hydro._clearArrays();let n=this.hydro.grid,s=Math.floor(n/2);this._setLoaderProgress(48,"\u0421\u043A\u0443\u043B\u044C\u043F\u0442\u0443\u0440\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u0445\u0440\u0435\u0431\u0442\u043E\u0432, \u0443\u0449\u0435\u043B\u0438\u0439 \u0438 \u0442\u0435\u0440\u0440\u0430\u0441 8 \u0433\u043E\u0440\u043E\u0434\u043E\u0432 (1/2)\u2026"),await Ui(),Rn(n,this.hydro,t,0,s),this._setLoaderProgress(76,"\u041D\u0430\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u0435 \u0440\u0443\u0441\u0435\u043B \u0440\u0435\u043A \u0438 \u043F\u0440\u043E\u0433\u0440\u0435\u0432 \u0433\u0438\u0434\u0440\u043E\u0434\u0438\u043D\u0430\u043C\u0438\u043A\u0438 \u0421\u0435\u043D-\u0412\u0435\u043D\u0430\u043D\u0430 (2/2)\u2026"),await Ui(),Rn(n,this.hydro,t,s,n),this.hydro.finalizeValleySetup(18),this._setLoaderProgress(92,"\u0420\u0430\u0437\u043C\u0435\u0449\u0435\u043D\u0438\u0435 8 \u0433\u043E\u0440\u043E\u0434\u043E\u0432, \u0444\u043B\u043E\u0442\u0430, \u043F\u043E\u0435\u0437\u0434\u043E\u0432, \u0412\u042D\u0421, \u0421\u042D\u0421, \u043F\u0442\u0438\u0446 \u0438 \u043B\u0435\u0441\u043E\u0432\u2026"),await Ui(),this.economy.resetEconomy(),this.worldView.rebuildForNewValley(),this.camCtrl.syncToWorldScale(),this._syncScaleLabelsInUI(),this._rebuildLandmarksBar(),this.selectedStruct=null,document.getElementById("struct-inspector").classList.add("hidden"),this._refreshHUD(),this._setLoaderProgress(100,`\u041A\u0430\u0440\u0442\u0430 \xAB${bi[t].name}\xBB (${e.short}) \u0433\u043E\u0442\u043E\u0432\u0430!`),this.isLoadingMap=!1,i&&(i.disabled=!1,i.textContent=`\u25B6 \u0412\u043E\u0439\u0442\u0438 \u0432 \u0431\u0430\u0441\u0441\u0435\u0439\u043D (${e.short}) \u0438 \u043D\u0430\u0447\u0430\u0442\u044C \u0441\u0442\u0440\u043E\u0438\u0442\u0435\u043B\u044C\u0441\u0442\u0432\u043E`)}enterValley(){this.isInPreGameLoader=!1;let t=document.getElementById("map-loader");t&&t.classList.add("hidden");let e=this.selectedMode==="creative";this.economy.creative=e,document.getElementById("btn-creative").classList.toggle("active",e);let i=bi[this.selectedPresetId].landmarks[0],n=this.hydro.sampleAtWorld(i.x,i.z).bed;this.camCtrl.flyTo(i.x,i.z+25*U.horizScale,i.dist,n);let s=document.getElementById("chk-start-tutorial");if(s&&s.checked)this.tutorial.start(0);else{this.tutorial.stop();let o=Cn[this.selectedScaleId];this.notify(`\u2248 \u0411\u0430\u0441\u0441\u0435\u0439\u043D \xAB${bi[this.selectedPresetId].name}\xBB (${o.short}) \u043E\u0442\u043A\u0440\u044B\u0442! \u0412\u043E\u0434\u043D\u044B\u0439 \u0431\u0430\u043B\u0430\u043D\u0441 \u0438 12 \u0434\u043E\u0445\u043E\u0434\u043E\u0432 \u2014 \u0432 \u043F\u0430\u043D\u0435\u043B\u0438 \u0441\u043F\u0440\u0430\u0432\u0430.`,"info")}this._refreshHUD()}openMapLoader(){this.isInPreGameLoader=!0;let t=document.getElementById("map-loader");t&&(t.classList.remove("hidden"),t.classList.add("ready-preview"))}_rebuildLandmarksBar(){let t=document.getElementById("landmarks-bar");if(!t)return;t.innerHTML="";let e=bi[this.selectedPresetId]||bi.bystritsa;for(let i of e.landmarks){let n=document.createElement("button");n.className="lm-btn",n.textContent=i.label,n.addEventListener("click",()=>{let s=this.hydro.sampleAtWorld(i.x,i.z).bed;this.camCtrl.flyTo(i.x,i.z,i.dist,s)}),t.appendChild(n)}}_loadSetting(t,e){try{return localStorage.getItem(`cascade.${t}`)||e}catch{return e}}_saveSetting(t,e){try{localStorage.setItem(`cascade.${t}`,e)}catch{}}_initRenderer(){let t=[{antialias:this.profile.id!=="low",powerPreference:"high-performance"},{antialias:!1,powerPreference:"default"},{antialias:!1,failIfMajorPerformanceCaveat:!1}],e=null;for(let n of t)try{if(this.renderer=new Ta({canvas:this.canvas,antialias:n.antialias,powerPreference:n.powerPreference,alpha:!1}),this.renderer&&this.renderer.getContext())break}catch(s){e=s,this.renderer=null}if(!this.renderer){let n=bc(),s=document.getElementById("nogl-modal"),o=document.getElementById("nogl-reason");throw s&&s.classList.remove("hidden"),o&&(o.textContent=n.reason||e&&e.message||"WebGL \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D"),new Error("WebGL context unavailable")}let i=Math.min(window.devicePixelRatio||1,this.profile.maxPixelRatio);this.renderer.setPixelRatio(i),this.renderer.setSize(window.innerWidth,window.innerHeight),this.renderer.shadowMap.enabled=!!this.profile.shadows,this.renderer.shadowMap.type=Hn,this.renderer.shadowMap.autoUpdate=!1,this.renderer.shadowMap.needsUpdate=!0}_onResize(){let t=window.innerWidth,e=window.innerHeight;this.camera.aspect=t/Math.max(1,e),this.camera.updateProjectionMatrix();let i=Math.min(window.devicePixelRatio||1,this.profile.maxPixelRatio);this.renderer.setPixelRatio(i),this.renderer.setSize(t,e)}raycastValley(t,e){let i=this.canvas.getBoundingClientRect(),n=(t-i.left)/i.width*2-1,s=-((e-i.top)/i.height)*2+1,o=this._raycaster||(this._raycaster=new or);o.setFromCamera({x:n,y:s},this.camera);let a=o.ray.origin,c=o.ray.direction;if(c.y>=-.01)return null;let l=148*U.elevScale,h=Math.max(2200,U.size*2.65),u=Math.max(2,(a.y-l)/-c.y),d=Math.min(h,(a.y- -6)/-c.y);if(d<=u)return null;let f=96,g=(d-u)/f,y=u,p=U.size*.496;for(let m=1;m<=f;m++){let _=u+m*g,M=a.x+c.x*_,v=a.y+c.y*_,w=a.z+c.z*_;if(Math.abs(M)>p||Math.abs(w)>p){y=_;continue}let S=this.hydro.sampleAtWorld(M,w);if(v<=S.bed){let T=y,x=_;for(let C=0;C<6;C++){let R=(T+x)*.5,L=a.x+c.x*R,D=a.y+c.y*R,I=a.z+c.z*R,F=this.hydro.sampleAtWorld(L,I);D<=F.bed?x=R:T=R}let E=(T+x)*.5;return{wx:J(a.x+c.x*E,-p,p),wy:a.y+c.y*E,wz:J(a.z+c.z*E,-p,p)}}y=_}return null}_initUI(){let t=document.getElementById("hotbar");t.innerHTML="";for(let l of Mr){let h=document.createElement("button");h.className=`tool-slot${l.id===this.activeToolId?" active":""}`,h.dataset.tool=l.id,h.innerHTML=`
        <span class="tool-key">[${l.key}]</span>
        <span class="tool-icon">${Xd[l.id]||"\u25C8"}</span>
        <span class="tool-name">${l.short}</span>
        <span class="tool-price">${l.costLabel}</span>
      `,h.addEventListener("click",()=>{this.audio.unlock(),this.selectTool(l.id)}),t.appendChild(h)}this._updateToolHint(),document.querySelectorAll(".side-tab").forEach(l=>{l.addEventListener("click",()=>{let h=l.dataset.tab;this.activeSideTab=h,document.querySelectorAll(".side-tab").forEach(u=>u.classList.toggle("active",u===l)),["cities","water","revenue","world"].forEach(u=>{let d=document.getElementById(`tab-pane-${u}`);d&&d.classList.toggle("hidden",u!==h)}),this._refreshHUD()})});let e=document.getElementById("btn-sell-aggregate");e&&e.addEventListener("click",()=>{let l=this.economy.sellAggregateBatch();l.ok?(this.audio.playMilestone(),this.notify(`\u25B2 \u041E\u0442\u0433\u0440\u0443\u0436\u0435\u043D\u0430 \u0431\u0430\u0440\u0436\u0430 \u0433\u0440\u0430\u043D\u0438\u0442\u043D\u043E\u0433\u043E \u0449\u0435\u0431\u043D\u044F (${l.soldM3.toLocaleString("ru-RU")} \u043C\xB3): +${l.revenue.toLocaleString("ru-RU")} \u20BD!`,"good"),this._refreshHUD()):this.notify(l.reason,"warn")}),document.querySelectorAll(".size-btn[data-size-idx]").forEach(l=>{l.addEventListener("click",()=>{this.brushSizeIndex=parseInt(l.dataset.sizeIdx,10)||0,this.brushRadius=U.brushSizes[this.brushSizeIndex],document.querySelectorAll(".size-btn[data-size-idx]").forEach(h=>h.classList.remove("active")),l.classList.add("active")})}),document.querySelectorAll(".tier-btn[data-tier]").forEach(l=>{l.addEventListener("click",()=>{this.damTierIndex=parseInt(l.dataset.tier,10)||0,document.querySelectorAll(".tier-btn[data-tier]").forEach(u=>u.classList.remove("active")),l.classList.add("active");let h=Math.round((_e.damHeightTiers[this.damTierIndex]?.addHeight||11)*U.elevScale);this.notify(`\u25B2 \u0412\u044B\u0431\u0440\u0430\u043D \u043F\u0440\u043E\u0444\u0438\u043B\u044C 3D-\u043F\u043B\u043E\u0442\u0438\u043D\u044B: +${h} \u043C \u043A \u043E\u0441\u043D\u043E\u0432\u0430\u043D\u0438\u044E`,"info")})}),document.getElementById("btn-rotate").addEventListener("click",()=>this.rotatePlacement()),document.getElementById("btn-speed").addEventListener("click",()=>this.cycleSpeed()),document.getElementById("btn-open-loader").addEventListener("click",()=>this.openMapLoader()),document.getElementById("btn-contours").addEventListener("click",()=>this.toggleContours()),document.getElementById("btn-weather-cycle").addEventListener("click",()=>{let l=(Tc.indexOf(this.economy.weatherId)+1)%Tc.length,h=Tc[l];this.economy.setWeather(h);let u=qe[h];this.notify(`${u.icon} \u041C\u0435\u0442\u0435\u043E\u0440\u0435\u0436\u0438\u043C: ${u.label} (\u043F\u0440\u0438\u0442\u043E\u043A \u0440\u0435\u043A \xD7${u.inflowMult.toFixed(2)})`,"info"),this._refreshHUD()});let i=document.getElementById("btn-creative");i.addEventListener("click",()=>{this.economy.creative=!this.economy.creative,i.classList.toggle("active",this.economy.creative),this.notify(this.economy.creative?"\u2605 \u0420\u0435\u0436\u0438\u043C \xAB\u0418\u043D\u0436\u0435\u043D\u0435\u0440\u043D\u044B\u0439 \u043A\u0440\u0435\u0430\u0442\u0438\u0432\xBB \u0432\u043A\u043B\u044E\u0447\u0451\u043D: \u043C\u0433\u043D\u043E\u0432\u0435\u043D\u043D\u0430\u044F \u0441\u0442\u0440\u043E\u0439\u043A\u0430 \u0438 \u0431\u0435\u0441\u043A\u043E\u043D\u0435\u0447\u043D\u044B\u0439 \u0431\u044E\u0434\u0436\u0435\u0442!":"\u25C8 \u0412\u043A\u043B\u044E\u0447\u0451\u043D \u0438\u043D\u0436\u0435\u043D\u0435\u0440\u043D\u044B\u0439 \u0440\u0435\u0436\u0438\u043C: 3-\u044D\u0442\u0430\u043F\u043D\u043E\u0435 \u0431\u0435\u0442\u043E\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u043A\u0440\u0430\u043D\u0430\u043C\u0438 \u0438 \u0440\u0435\u0430\u043B\u044C\u043D\u044B\u0439 \u0431\u044E\u0434\u0436\u0435\u0442.","info"),this._refreshHUD()});let n=document.getElementById("btn-quality");n.textContent=`\u2699 ${this.profile.label}`,n.addEventListener("click",()=>{let l=["low","medium","high"],h=l[(l.indexOf(this.profile.id)+1)%l.length];this._saveSetting("quality",h),this.profile=Ra[h],n.textContent=`\u2699 ${this.profile.label}`,this.renderer.shadowMap.enabled=!!this.profile.shadows,this.renderer.shadowMap.needsUpdate=!0,this._onResize(),this.notify(`\u0413\u0440\u0430\u0444\u0438\u043A\u0430 \u043F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0435\u043D\u0430: ${this.profile.label}`,"info")});let s=document.getElementById("btn-mute");s.addEventListener("click",()=>{let l=this.audio.toggleMute();s.textContent=l?"\u2715 \u0411\u0435\u0437 \u0437\u0432\u0443\u043A\u0430":"\u266A \u0417\u0432\u0443\u043A"});let o=document.getElementById("help-modal");document.getElementById("btn-help").addEventListener("click",()=>o.classList.toggle("hidden")),document.getElementById("help-close").addEventListener("click",()=>o.classList.add("hidden")),document.getElementById("help-start-btn").addEventListener("click",()=>{this.audio.unlock(),o.classList.add("hidden")});let a=document.getElementById("panel-body"),c=document.getElementById("btn-toggle-panel");c.addEventListener("click",()=>{let l=a.classList.toggle("hidden");c.textContent=l?"\u25B8":"\u25BE"}),document.getElementById("btn-loan").addEventListener("click",()=>{let l=this.economy.takeGreenLoan();l.ok?this.notify(`+ \u0412\u044B\u043F\u0443\u0449\u0435\u043D\u044B \u0437\u0435\u043B\u0451\u043D\u044B\u0435 \u043E\u0431\u043B\u0438\u0433\u0430\u0446\u0438\u0438 \u0413\u042D\u0421: +${l.amount.toLocaleString("ru-RU")} \u20BD`,"good"):this.notify(l.reason,"warn"),this._refreshHUD()}),document.getElementById("btn-repay").addEventListener("click",()=>{let l=this.economy.repayLoan();l.ok?this.notify(`\u041F\u043E\u0433\u0430\u0448\u0435\u043D\u0430 \u0447\u0430\u0441\u0442\u044C \u043E\u0431\u043B\u0438\u0433\u0430\u0446\u0438\u0439: -${l.amount.toLocaleString("ru-RU")} \u20BD`,"info"):this.notify(l.reason,"warn"),this._refreshHUD()}),document.getElementById("insp-close").addEventListener("click",()=>{this.selectedStruct=null,document.getElementById("struct-inspector").classList.add("hidden")}),document.getElementById("insp-slider").addEventListener("input",l=>{if(!this.selectedStruct)return;let h=Number(l.target.value)/100;this.selectedStruct.kind==="turbine"?(this.selectedStruct.throttle=h,this.selectedStruct.autoDispatch=!1,document.getElementById("insp-auto").checked=!1):(this.selectedStruct.openRatio=h,this.selectedStruct.autoRegulate=!1,document.getElementById("insp-auto").checked=!1,this.hydro._syncSpillwayGateCells(this.selectedStruct)),this._refreshInspector()}),document.getElementById("insp-auto").addEventListener("change",l=>{if(!this.selectedStruct)return;let h=l.target.checked;this.selectedStruct.kind==="turbine"?this.selectedStruct.autoDispatch=h:this.selectedStruct.autoRegulate=h,this._refreshInspector()}),document.getElementById("insp-gaes").addEventListener("change",l=>{this.selectedStruct&&this.selectedStruct.kind==="turbine"&&(this.selectedStruct.pumpedStorage=l.target.checked,this.notify(l.target.checked?"\u2248 \u0412\u043A\u043B\u044E\u0447\u0451\u043D \u043E\u0431\u0440\u0430\u0442\u0438\u043C\u044B\u0439 \u0440\u0435\u0436\u0438\u043C \u0413\u0410\u042D\u0421: \u043D\u043E\u0447\u044C\u044E (00:00\u201306:00) \u0430\u0433\u0440\u0435\u0433\u0430\u0442 \u0437\u0430\u043A\u0430\u0447\u0430\u0435\u0442 \u0432\u043E\u0434\u0443 \u0432 \u0432\u0435\u0440\u0445\u043D\u0438\u0439 \u0431\u044C\u0435\u0444!":"\u0420\u0435\u0436\u0438\u043C \u043D\u043E\u0447\u043D\u043E\u0439 \u0437\u0430\u043A\u0430\u0447\u043A\u0438 \u0413\u0410\u042D\u0421 \u043E\u0442\u043A\u043B\u044E\u0447\u0451\u043D.","info"),this._refreshInspector())}),document.getElementById("insp-clean-btn").addEventListener("click",()=>{this.selectedStruct&&this.selectedStruct.kind==="turbine"&&(this.selectedStruct.trashLoad=0,this.audio.playBuild(),this.notify("\u0421\u043E\u0440\u043E\u0443\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u044E\u0449\u0430\u044F \u0440\u0435\u0448\u0451\u0442\u043A\u0430 \u0432\u043E\u0434\u043E\u043F\u0440\u0438\u0451\u043C\u043D\u0438\u043A\u0430 \u043F\u0440\u043E\u043C\u044B\u0442\u0430!","good"),this._refreshInspector())}),window.addEventListener("keydown",l=>{if(this.isInPreGameLoader||l.target&&(l.target.tagName==="INPUT"||l.target.tagName==="SELECT"))return;if(l.code==="F3"){l.preventDefault(),this.showDiag=!this.showDiag,document.getElementById("diag-panel").classList.toggle("hidden",!this.showDiag);return}let h=l.key.toUpperCase();for(let u of Mr)if(u.key===h){this.selectTool(u.id);return}l.code==="KeyV"||l.code==="Space"?(l.preventDefault(),this.cycleSpeed()):l.code==="KeyC"?this.toggleContours():l.code==="KeyR"?this.rotatePlacement():l.code==="KeyT"?document.getElementById("btn-tutorial").click():l.code==="KeyK"?i.click():l.code==="KeyM"?s.click():l.code==="KeyH"&&o.classList.toggle("hidden")}),this._renderCityCards(),this._refreshHUD()}_populateWorldCatalogTab(){let t=document.getElementById("anim-groups-list"),e=document.getElementById("tex-families-list");if(t){let i=new Map;for(let s of Ga)i.set(s.groupLabel,(i.get(s.groupLabel)||0)+1);let n="";for(let[s,o]of i.entries())n+=`<div class="wb-row"><span>${s}</span><strong>${o} \u0430\u043D\u0438\u043C.</strong></div>`;n+=`<div class="wb-row total"><span>\u0412\u0441\u0435\u0433\u043E \u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0445 \u0430\u043D\u0438\u043C\u0430\u0446\u0438\u0439</span><strong>${Ga.length}</strong></div>`,t.innerHTML=n}if(e){let i=new Map;for(let s of rn)i.set(s.familyLabel,(i.get(s.familyLabel)||0)+1);let n="";for(let[s,o]of i.entries())n+=`<div class="wb-row"><span>${s}</span><strong>${o} \u043F\u0440\u0435\u0441\u0435\u0442\u0430</strong></div>`;n+=`<div class="wb-row total"><span>\u0412\u0441\u0435\u0433\u043E \u0442\u0435\u043A\u0441\u0442\u0443\u0440 \u0438 \u043E\u0442\u0442\u0435\u043D\u043A\u043E\u0432</span><strong>${rn.length}</strong></div>`,e.innerHTML=n}}selectTool(t){this.activeToolId=t,document.querySelectorAll(".tool-slot").forEach(e=>{e.classList.toggle("active",e.dataset.tool===t)}),this._updateToolHint()}_updateToolHint(){let t=Mr.find(i=>i.id===this.activeToolId),e=document.getElementById("tool-hint");t&&e&&(e.textContent=`\u25B8 ${t.name}: ${t.desc}`)}rotatePlacement(){this.manualYaw===null?this.manualYaw=0:this.manualYaw+=Math.PI*.25,this.manualYaw>Math.PI*2&&(this.manualYaw=null),this.notify(this.manualYaw===null?"\u21BB \u0410\u0432\u0442\u043E-\u043E\u0440\u0438\u0435\u043D\u0442\u0430\u0446\u0438\u044F \u0441\u0442\u0432\u043E\u0440\u0430 \u043F\u043E \u0443\u043A\u043B\u043E\u043D\u0443 \u0432\u043E\u0434\u044B \u0432\u043A\u043B\u044E\u0447\u0435\u043D\u0430":`\u21BB \u0420\u0443\u0447\u043D\u043E\u0439 \u0443\u0433\u043E\u043B \u0441\u0442\u0432\u043E\u0440\u0430: ${Math.round(this.manualYaw*180/Math.PI)}\xB0`,"info")}cycleSpeed(){this.speedIndex=(this.speedIndex+1)%Ac.length;let t=Ac[this.speedIndex],e=document.getElementById("btn-speed");e.textContent=t===0?"\u23F8 \u041F\u0430\u0443\u0437\u0430":`\u25B6 \xD7${t}`,e.classList.toggle("active",t>1)}toggleContours(){this.showContours=!this.showContours,this.worldView.terrainMat.uniforms.uShowContours.value=this.showContours?1:0,document.getElementById("btn-contours").classList.toggle("active",this.showContours)}_bindWorldInput(){this.canvas.addEventListener("pointerdown",t=>{if(this.isInPreGameLoader||(this.audio.unlock(),t.button!==0)||this.camCtrl.touches.size>=2)return;let e=this.raycastValley(t.clientX,t.clientY);if(!e)return;let i=this.hydro.findStructureNear(e.wx,e.wz);if(i&&(this.activeToolId==="inspect"||t.altKey)){this.selectedStruct=i,document.getElementById("struct-inspector").classList.remove("hidden"),this._refreshInspector();return}if(this.activeToolId==="spillway"||this.activeToolId.startsWith("turbine_")||this.activeToolId==="nav_lock"||this.activeToolId==="fish_eco"||this.activeToolId==="powerline"||this.activeToolId==="demolish"||this.activeToolId==="inspect"){this._applySingleClickTool(e.wx,e.wz);return}this.pointerDown=!0,this.lastBrushWorld={wx:e.wx,wz:e.wz};let n=this.hydro.sampleAtWorld(e.wx,e.wz),s=(_e.damHeightTiers[this.damTierIndex]?.addHeight||11.2)*U.elevScale;this.activeToolId==="canal_dig"?this.lockedGradeElev=t.shiftKey?n.bed-1.9*U.elevScale:null:this.activeToolId==="concrete_dam"?this.lockedGradeElev=Math.max(n.bed,n.surface)+s:this.activeToolId==="earth_dam"?this.lockedGradeElev=Math.max(n.bed,n.surface)+4.2*U.elevScale:this.lockedGradeElev=null,this._applyContinuousStrokePoint(e.wx,e.wz,0)}),window.addEventListener("pointermove",t=>{if(this.isInPreGameLoader)return;let e=this.raycastValley(t.clientX,t.clientY);this.hoverWorld=e;let i=_e.damHeightTiers[this.damTierIndex]?.addHeight||11.2;if(e?(this.worldView.updateCursor(e.wx,e.wz,this.brushRadius,this.activeToolId,this.manualYaw,i,!0),this._updateProbeBar(e.wx,e.wz)):this.worldView.updateCursor(0,0,this.brushRadius,this.activeToolId,this.manualYaw,i,!1),!this.pointerDown||!e||!this.lastBrushWorld||this.camCtrl.touches.size>=2)return;let n=e.wx-this.lastBrushWorld.wx,s=e.wz-this.lastBrushWorld.wz,o=Math.hypot(n,s),a=Math.max(this.hydro.dx*.55,this.brushRadius*.35);if(o<a)return;let c=Math.min(20,Math.ceil(o/a));for(let l=1;l<=c;l++){let h=l/c,u=ne(this.lastBrushWorld.wx,e.wx,h),d=ne(this.lastBrushWorld.wz,e.wz,h);this.activeToolId==="canal_dig"&&this.lockedGradeElev!==null&&(this.lockedGradeElev-=o/c*.004),this._applyContinuousStrokePoint(u,d,l)}this.lastBrushWorld={wx:e.wx,wz:e.wz}}),window.addEventListener("pointerup",()=>{this.pointerDown=!1,this.lastBrushWorld=null,this.lockedGradeElev=null})}_applyContinuousStrokePoint(t,e,i){let n=this.economy.cash,s=this.economy.creative;if(this.activeToolId==="canal_dig"){let o=this.hydro.excavateCanal(t,e,this.brushRadius,1.45,this.lockedGradeElev,n,s);if(o.excavatedM3>0){if(this.economy.spend(o.cost),i===0){this.audio.playDig();let a=this.hydro.sampleAtWorld(t,e);this.spray.spawnDigSplash(t,a.bed,e,8)}}else!s&&n<40&&i===0&&this.notify("\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0441\u0440\u0435\u0434\u0441\u0442\u0432 \u043D\u0430 \u0437\u0435\u043C\u043B\u044F\u043D\u044B\u0435 \u0440\u0430\u0431\u043E\u0442\u044B!","warn")}else if(this.activeToolId==="canal_liner"){let o=this.hydro.lineCanalConcrete(t,e,this.brushRadius,n,s);o.count>0&&(this.economy.spend(o.cost),i===0&&this.audio.playBuild())}else if(this.activeToolId==="earth_dam"){let o=this.hydro.buildEarthDam(t,e,this.brushRadius,1.85,this.lockedGradeElev,n,s);o.addedM3>0&&(this.economy.spend(o.cost),i===0&&this.audio.playDig())}else if(this.activeToolId==="concrete_dam"){let o=(_e.damHeightTiers[this.damTierIndex]?.addHeight||11.2)*U.elevScale,a=this.lockedGradeElev??this.hydro.sampleAtWorld(t,e).bed+o,c=this.hydro.buildConcreteDam(t,e,this.brushRadius,a,n,s,!1);c.addedM3>0?(this.economy.spend(c.cost),i===0&&this.audio.playBuild()):!s&&n<180&&i===0&&this.notify("\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0441\u0440\u0435\u0434\u0441\u0442\u0432 \u043D\u0430 \u0431\u0435\u0442\u043E\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 (\u043C\u043E\u0436\u043D\u043E \u0432\u044B\u043F\u0443\u0441\u0442\u0438\u0442\u044C \u0437\u0435\u043B\u0451\u043D\u044B\u0435 \u043E\u0431\u043B\u0438\u0433\u0430\u0446\u0438\u0438 \u0441\u043F\u0440\u0430\u0432\u0430!)","warn")}else if(this.activeToolId==="foundation"){let o=this.hydro.reinforceFoundation(t,e,this.brushRadius,n,s);o.count>0?(this.economy.spend(o.cost),i===0&&this.audio.playBuild()):!s&&n<140&&i===0&&this.notify("\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0441\u0440\u0435\u0434\u0441\u0442\u0432 \u043D\u0430 \u0441\u043A\u0430\u043B\u044C\u043D\u0443\u044E \u0446\u0435\u043C\u0435\u043D\u0442\u0430\u0446\u0438\u044E \u0438 3D-\u043A\u043E\u043D\u0442\u0440\u0444\u043E\u0440\u0441\u044B!","warn")}}_applySingleClickTool(t,e){let i=this.economy.cash,n=this.economy.creative;if(this.activeToolId==="inspect"){let s=this.hydro.findStructureNear(t,e);s&&(this.selectedStruct=s,document.getElementById("struct-inspector").classList.remove("hidden"),this._refreshInspector());return}if(this.activeToolId==="spillway"){let s=this.hydro.placeSpillway(t,e,this.manualYaw,i,n);if(!s.ok){this.notify(s.reason,"warn");return}this.economy.spend(s.cost),this.audio.playBuild(),this.selectedStruct=s.structure,document.getElementById("struct-inspector").classList.remove("hidden"),this._refreshInspector(),this.notify("\u2248 \u0421\u043C\u043E\u043D\u0442\u0438\u0440\u043E\u0432\u0430\u043D 3D-\u0432\u043E\u0434\u043E\u0441\u0431\u0440\u043E\u0441 \u0441 \u0441\u0435\u0433\u043C\u0435\u043D\u0442\u043D\u044B\u043C \u0437\u0430\u0442\u0432\u043E\u0440\u043E\u043C \u0438 \u0442\u0440\u0430\u043C\u043F\u043B\u0438\u043D\u043E\u043C!","good");return}if(this.activeToolId.startsWith("turbine_")){let s=this.activeToolId.replace("turbine_",""),o=this.hydro.placeTurbine(s,t,e,this.manualYaw,i,n);if(!o.ok){this.notify(o.reason,"warn");return}this.economy.spend(o.cost),this.audio.playBuild(),this.selectedStruct=o.structure,document.getElementById("struct-inspector").classList.remove("hidden"),this._refreshInspector(),this.notify(`\u2726 \u041F\u043E\u0441\u0442\u0440\u043E\u0435\u043D\u0430 \u043F\u0440\u0438\u043F\u043B\u043E\u0442\u0438\u043D\u043D\u0430\u044F ${o.structure.spec.name}: \u0432\u043E\u0434\u043E\u043F\u0440\u0438\u0451\u043C\u043D\u0438\u043A \u043D\u0430\u0432\u0435\u0440\u0445\u0443, \u043C\u0430\u0448\u0437\u0430\u043B \u0432 \u043D\u0438\u0436\u043D\u0435\u043C \u0431\u044C\u0435\u0444\u0435!`,"good");return}if(this.activeToolId==="nav_lock"){let s=this.hydro.placeNavigationLock(t,e,this.manualYaw,i,n);if(!s.ok){this.notify(s.reason,"warn");return}this.economy.spend(s.cost),this.audio.playBuild(),this.notify("\u2726 \u041E\u0442\u043A\u0440\u044B\u0442 \u0441\u0443\u0434\u043E\u0445\u043E\u0434\u043D\u044B\u0439 \u0448\u043B\u044E\u0437! \u0420\u0435\u0447\u043D\u043E\u0439 \u0444\u043B\u043E\u0442 \u043D\u0430\u0447\u0430\u043B \u043F\u0440\u0438\u043D\u043E\u0441\u0438\u0442\u044C \u043D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u043E\u043D\u043D\u044B\u0439 \u0441\u0431\u043E\u0440.","good"),this._refreshHUD();return}if(this.activeToolId==="fish_eco"){let s=this.hydro.placeFishEcoFarm(t,e,i,n);if(!s.ok){this.notify(s.reason,"warn");return}this.economy.spend(s.cost),this.audio.playBuild(),this.notify("\u2726 \u0420\u0430\u0437\u0432\u0451\u0440\u043D\u0443\u0442\u044B \u0441\u0430\u0434\u043A\u0438 \u0444\u043E\u0440\u0435\u043B\u0435\u0432\u043E\u0433\u043E \u0445\u043E\u0437\u044F\u0439\u0441\u0442\u0432\u0430 \u0438 \u044F\u0445\u0442-\u043C\u0430\u0440\u0438\u043D\u0430 (+\u0434\u043E\u0445\u043E\u0434 \u0430\u043A\u0432\u0430\u043A\u0443\u043B\u044C\u0442\u0443\u0440\u044B \u0438 \u0442\u0443\u0440\u0438\u0437\u043C\u0430)!","good"),this._refreshHUD();return}if(this.activeToolId==="powerline"){let s=null,o=92*U.horizScale;for(let c of this.economy.cities){let l=Math.hypot(c.x-t,c.z-e);l<o&&(o=l,s=c)}if(s){let c=this.economy.connectCityGrid(s.id);c.ok?this.audio.playBuild():this.notify(c.reason,"warn"),this._renderCityCards();return}let a=this.hydro.placeSubstation(t,e,i,n);if(!a.ok){this.notify(a.reason,"warn");return}this.economy.spend(a.cost),this.economy.powerLinesDirty=!0,this.audio.playBuild(),this.notify("\u2726 \u041F\u043E\u0441\u0442\u0440\u043E\u0435\u043D\u0430 \u0443\u0437\u043B\u043E\u0432\u0430\u044F 3D-\u043F\u043E\u0434\u0441\u0442\u0430\u043D\u0446\u0438\u044F \u041E\u0420\u0423 220 \u043A\u0412! \u041F\u043E\u0442\u0435\u0440\u0438 \u043F\u0435\u0440\u0435\u0434\u0430\u0447\u0438 \u0441\u043D\u0438\u0436\u0435\u043D\u044B \u0441 16% \u0434\u043E 3%!","good"),this._refreshHUD();return}if(this.activeToolId==="demolish"){let s=this.hydro.demolishAt(t,e);s.removed&&(this.economy.earn(s.refund),this.audio.playDig(),this.selectedStruct&&!this.hydro.turbines.includes(this.selectedStruct)&&!this.hydro.spillways.includes(this.selectedStruct)&&(this.selectedStruct=null,document.getElementById("struct-inspector").classList.add("hidden")),this.notify(s.refund>0?`\u0414\u0435\u043C\u043E\u043D\u0442\u0430\u0436 \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D (\u0432\u043E\u0437\u0432\u0440\u0430\u0442 +${s.refund.toLocaleString("ru-RU")} \u20BD)`:"\u0421\u0435\u043A\u0446\u0438\u044F \u0440\u0430\u0441\u0447\u0438\u0449\u0435\u043D\u0430","info"))}}_updateProbeBar(t,e){let i=this.hydro.sampleAtWorld(t,e),n=document.getElementById("probe-readout");if(!n)return;let s="";i.targetConcrete>i.concrete+.08?s=` \xB7 \u0421\u0442\u0440\u043E\u0439\u043A\u0430 ${Math.round(i.buildProgress*100)}%`:i.reinforced&&(s=" \xB7 [\u041A\u043E\u043D\u0442\u0440\u0444\u043E\u0440\u0441]");let o=i.concrete>.8?"3D-\u041C\u043E\u043D\u043E\u043B\u0438\u0442 \u043F\u043B\u043E\u0442\u0438\u043D\u044B":i.lined?"\u0416/\u0411 \u043B\u043E\u0442\u043E\u043A \u043A\u0430\u043D\u0430\u043B\u0430":i.earthDam?"\u041D\u0430\u0441\u044B\u043F\u044C \u0434\u0430\u043C\u0431\u044B":i.soil<.75*U.elevScale?"\u0413\u0440\u0430\u043D\u0438\u0442":`\u0413\u0440\u0443\u043D\u0442 (\u0432\u043B\u0430\u0436\u043D. ${Math.round(i.saturation*100)}%)`,a=i.depth<.03?"\u0441\u0443\u0445\u043E":i.froude>1?"Fr>1 \u0431\u0443\u0440\u043D\u044B\u0439":"\u0441\u043F\u043E\u043A\u043E\u0439\u043D\u044B\u0439";n.textContent=`\u0414\u043D\u043E: ${i.bed.toFixed(1)} \u043C (${o})${s} \xB7 \u0412\u043E\u0434\u0430: ${i.depth>.02?i.surface.toFixed(1)+" \u043C":"\u2014"} \xB7 H: ${i.depth.toFixed(2)} \u043C \xB7 V: ${i.speed.toFixed(2)} \u043C/\u0441 (${a})`}_renderCityCards(){let t=document.getElementById("cities-list");if(!t)return;t.innerHTML="";for(let i of this.economy.cities){let n=document.createElement("div");n.className=`city-card${i.isFlooded?" flooded":""}`,n.id=`city-card-${i.id}`;let s=this.economy.estimatePowerLineCost(i),o=Math.round(i.growthProgress*100),a=i.connected?`\u25C8 ${i.suppliedMW.toFixed(1)} / ${i.currentDemandMW.toFixed(1)} \u041C\u0412\u0442`:`\u041D\u0435 \u0432 \u0441\u0435\u0442\u0438 (\u0441\u043F\u0440\u043E\u0441 ${i.currentDemandMW.toFixed(1)} \u041C\u0412\u0442)`,c="";i.isFlooded?c='<div class="city-note warn">! \u041A\u0432\u0430\u0440\u0442\u0430\u043B\u044B \u043F\u043E\u0434\u0442\u043E\u043F\u043B\u0435\u043D\u044B! \u0420\u043E\u0441\u0442 \u043E\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D</div>':i.needsIrrigation?c=i.irrigated?'<div class="city-note">\u25C8 \u041A\u0430\u043D\u0430\u043B \u043E\u0440\u043E\u0448\u0435\u043D\u0438\u044F \u0430\u043A\u0442\u0438\u0432\u0435\u043D (\u0440\u043E\u0441\u0442 \xD71.82 + \u0434\u043E\u0445\u043E\u0434 \u0438\u0440\u0440\u0438\u0433\u0430\u0446\u0438\u0438)</div>':'<div class="city-note warn">\u25C8 \u041F\u043E\u0434\u0432\u0435\u0434\u0438\u0442\u0435 \u043A\u0430\u043D\u0430\u043B \u043A \u0437\u0435\u043B\u0451\u043D\u043E\u043C\u0443 \u043A\u043E\u043B\u044C\u0446\u0443 \u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u044B</div>':(i.archetype==="smelter"||i.archetype==="tech")&&(c=`<div class="city-note">\u2605 \u041F\u0440\u044F\u043C\u043E\u0439 \u043F\u0440\u043E\u043C\u043A\u043E\u043D\u0442\u0440\u0430\u043A\u0442 PPA \xD7${i.tariffBonus.toFixed(2)}</div>`),n.innerHTML=`
        <div class="city-top">
          <span class="city-name" data-flycity="${i.id}">\u25B8 ${i.name}</span>
          <span class="city-badge">${i.levelName} \xB7 ${i.buildingIndices.length} \u0437\u0434.</span>
        </div>
        <div class="city-meta">
          <span>\u041D\u0430\u0441.: ${i.population.toLocaleString("ru-RU")}</span>
          <span>${a}</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width:${o}%"></div>
        </div>
        ${c}
        ${i.connected?"":`<div class="city-actions"><button class="connect-btn" data-connect="${i.id}">\u25C8 \u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u041B\u042D\u041F (${s.toLocaleString("ru-RU")} \u20BD)</button></div>`}
      `,t.appendChild(n)}let e=135*Math.pow(U.horizScale,.72);t.querySelectorAll("[data-flycity]").forEach(i=>{i.addEventListener("click",()=>{let n=this.economy.cities.find(s=>s.id===i.dataset.flycity);n&&this.camCtrl.flyTo(n.x,n.z,e,n.baseElevation)})}),t.querySelectorAll("[data-connect]").forEach(i=>{i.addEventListener("click",()=>{let n=this.economy.connectCityGrid(i.dataset.connect);n.ok?this.audio.playBuild():this.notify(n.reason,"warn"),this._renderCityCards(),this._refreshHUD()})})}_renderWaterBalanceTab(t){let e=document.getElementById("wb-why-note"),i=document.getElementById("wb-meteo-strip"),n=document.getElementById("wb-in-table"),s=document.getElementById("wb-out-table"),o=document.getElementById("wb-node-table");if(!n||!t)return;e&&(e.textContent=t.whenWhySummary),i&&(i.textContent=`\u0414\u043E\u043B\u0438\u043D\u0430: ${t.airTempC>=0?"+":""}${t.airTempC.toFixed(1)}\xB0C \xB7 \u041B\u0435\u0434\u043D\u0438\u043A\u0438: ${t.mountainTempC>=0?"+":""}${t.mountainTempC.toFixed(1)}\xB0C \xB7 \u0412\u043B\u0430\u0436\u043D.: ${t.relHumidityPct}% \xB7 \u0417\u0435\u0440\u043A\u0430\u043B\u043E: ${t.wetAreaHa.toFixed(1)} \u0433\u0430`);let a=l=>`${l.toFixed(1)} \u043C\xB3/\u0441`;n.innerHTML=`
      <div class="wb-row"><span>\u0418\u0441\u0442\u043E\u043A\u0438 3 \u0440\u0435\u043A (\u0432\u0435\u0440\u0445\u043E\u0432\u044C\u044F)</span><strong>+${a(t.inRiversQ)}</strong></div>
      <div class="wb-row"><span>\u0422\u0430\u044F\u043D\u0438\u0435 \u0433\u043E\u0440\u043D\u044B\u0445 \u043B\u0435\u0434\u043D\u0438\u043A\u043E\u0432 (\u0434\u043D\u0451\u043C)</span><strong>+${a(t.inSnowmeltQ)} (${t.cumSnowmeltK.toFixed(0)} \u0442\u044B\u0441.\u043C\xB3)</strong></div>
      <div class="wb-row"><span>\u041D\u0430\u043A\u0430\u043F\u0430\u043B\u043E \u0434\u043E\u0436\u0434\u044F \u043D\u0430 \u0432\u043E\u0434\u043E\u0441\u0431\u043E\u0440</span><strong>+${a(t.inPrecipQ)} (${t.cumPrecipK.toFixed(0)} \u0442\u044B\u0441.\u043C\xB3)</strong></div>
      <div class="wb-row"><span>\u041F\u043E\u0434\u0437\u0435\u043C\u043D\u044B\u0435 \u0440\u043E\u0434\u043D\u0438\u043A\u0438 \u043A\u0430\u043D\u044C\u043E\u043D\u0430</span><strong>+${a(t.inGroundwaterQ)}</strong></div>
      <div class="wb-row"><span>\u041D\u043E\u0447\u043D\u043E\u0439 \u0432\u043E\u0437\u0432\u0440\u0430\u0442 \u0413\u0410\u042D\u0421 \u0432 \u0412\u0411</span><strong>+${a(t.inPumpedGAESQ)}</strong></div>
      <div class="wb-row total"><span>\u0412\u0441\u0435\u0433\u043E \u043F\u0440\u0438\u0448\u043B\u043E \u0432 \u0431\u0430\u0441\u0441\u0435\u0439\u043D</span><strong>+${a(t.inTotalQ)} (${t.cumArrivedK.toFixed(0)} \u0442\u044B\u0441.\u043C\xB3)</strong></div>
    `,s.innerHTML=`
      <div class="wb-row"><span>\u0418\u0441\u043F\u0430\u0440\u0438\u043B\u043E\u0441\u044C \u0441 \u0437\u0435\u0440\u043A\u0430\u043B\u0430 (${t.evapMmPerDay.toFixed(1)} \u043C\u043C/\u0441\u0443\u0442)</span><strong>-${a(t.outEvapQ)} (${t.cumEvaporatedK.toFixed(1)} \u0442\u044B\u0441.\u043C\xB3)</strong></div>
      <div class="wb-row"><span>\u0412\u043F\u0438\u0442\u0430\u043B\u043E\u0441\u044C \u0432 \u0441\u0443\u0445\u043E\u0439 \u0433\u0440\u0443\u043D\u0442 (\u0425\u043E\u0440\u0442\u043E\u043D)</span><strong>-${a(t.outInfiltQ)}</strong></div>
      <div class="wb-row"><span>\u0424\u0438\u043B\u044C\u0442\u0440\u0430\u0446\u0438\u044F \u0414\u0430\u0440\u0441\u0438 \u043F\u043E\u0434 \u043F\u043B\u043E\u0442\u0438\u043D\u043E\u0439</span><strong>-${a(t.outSeepageQ)}</strong></div>
      <div class="wb-row"><span>\u0412\u043E\u0434\u043E\u0437\u0430\u0431\u043E\u0440 \u0433\u043E\u0440\u043E\u0434\u043E\u0432 \u0438 \u043F\u043E\u043B\u0435\u0439</span><strong>-${a(t.outCitiesAgroQ)} (${t.cumConsumedK.toFixed(0)} \u0442\u044B\u0441.\u043C\xB3)</strong></div>
      <div class="wb-row"><span>\u0421\u0432\u043E\u0431\u043E\u0434\u043D\u044B\u0439 \u0441\u0442\u043E\u043A \u0443\u0441\u0442\u044C\u044F \u0432 \u043C\u043E\u0440\u0435</span><strong>-${a(t.outMouthQ)} (${t.cumMouthOutK.toFixed(0)} \u0442\u044B\u0441.\u043C\xB3)</strong></div>
      <div class="wb-row total"><span>\u0418\u0442\u043E\u0433\u043E \u0443\u0448\u043B\u043E \u0438\u0437 \u0431\u0430\u0441\u0441\u0435\u0439\u043D\u0430</span><strong>-${a(t.outTotalQ)}</strong></div>
    `;let c=t.totalVolumeM3/1e6;o.innerHTML=`
      <div class="wb-row"><span>\u0427\u0435\u0440\u0435\u0437 \u0442\u0443\u0440\u0431\u0438\u043D\u044B \u0413\u042D\u0421 (\u043F\u043E\u043B\u0435\u0437\u043D\u0430\u044F \u0440\u0430\u0431\u043E\u0442\u0430)</span><strong>${a(t.nodeTurbineQ)}</strong></div>
      <div class="wb-row"><span>3D-\u043F\u0435\u0440\u0435\u043B\u0438\u0432 \u043F\u043B\u043E\u0442\u0438\u043D + \u0432\u043E\u0434\u043E\u0441\u0431\u0440\u043E\u0441</span><strong>${a(t.nodeSpillOverflowQ)}</strong></div>
      <div class="wb-row"><span>\u041A\u041F\u0414 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u044F \u0441\u0442\u043E\u043A\u0430 \u0433\u0438\u0434\u0440\u043E\u0443\u0437\u043B\u043E\u043C</span><strong>${t.hydroUtilizationPct}%</strong></div>
      <div class="wb-row total"><span>\u0417\u0430\u043F\u0430\u0441 \u0432\u043E\u0434\u044B \u0432 \u0431\u0430\u0441\u0441\u0435\u0439\u043D\u0435 \u0441\u0435\u0439\u0447\u0430\u0441</span><strong>${c>=1?c.toFixed(2)+" \u043C\u043B\u043D \u043C\xB3":(t.totalVolumeM3/1e3).toFixed(0)+" \u0442\u044B\u0441. \u043C\xB3"}</strong></div>
    `}_renderRevenueTab(t){let e=document.getElementById("revenue-streams-list");if(!e)return;let i="";for(let n of Oa){let s=t.revenueRates[n.id]||0,o=t.revenueTotals[n.id]||0;i+=`
        <div class="wb-row">
          <span style="color:${s>1?"#f1f5f9":"#94a3b8"}">\u25CF ${n.label}</span>
          <strong style="color:${s>1?n.color:"#64748b"}">+${Math.round(s)} \u20BD/\u0441 (${Math.round(o).toLocaleString("ru-RU")} \u20BD)</strong>
        </div>
      `}i+=`
      <div class="wb-row total">
        <span>\u0421\u0443\u043C\u043C\u0430\u0440\u043D\u0430\u044F \u0432\u044B\u0440\u0443\u0447\u043A\u0430 (12 \u0441\u0442\u0430\u0442\u0435\u0439)</span>
        <strong>+${Math.round(t.incomePerSec).toLocaleString("ru-RU")} \u20BD/\u0441</strong>
      </div>
    `,e.innerHTML=i}_refreshHUD(){if(!this.economy)return;let t=this.economy.getSummary(),e=t.waterReport;document.getElementById("hud-cash").textContent=this.economy.creative?"\u221E \u041A\u0420\u0415\u0410\u0422\u0418\u0412":`${Math.round(t.cash).toLocaleString("ru-RU")} \u20BD`;let i=t.netPerSec>=0?"+":"",n=document.getElementById("hud-net");n.textContent=`${i}${Math.round(t.netPerSec).toLocaleString("ru-RU")} \u20BD/\u0441`,n.style.color=t.netPerSec>=0?"#4ade80":"#f87171";let s=t.pumpedConsumeMW>.1?` (\u0413\u0410\u042D\u0421 -${t.pumpedConsumeMW.toFixed(1)})`:"";document.getElementById("hud-mw").textContent=`${t.totalMW.toFixed(1)} \u041C\u0412\u0442${s}`,document.getElementById("hud-demand").textContent=`\u0421\u0435\u0442\u044C: ${t.suppliedCityMW.toFixed(1)}/${t.connectedDemandMW.toFixed(1)} \xB7 \u041F\u043E\u0442\u0435\u0440\u0438 ${t.gridLossPct}%`;let o=Math.floor(t.hour),a=Math.floor((t.hour-o)*60);document.getElementById("hud-clock").textContent=`\u0414\u0435\u043D\u044C ${t.day} \xB7 ${String(o).padStart(2,"0")}:${String(a).padStart(2,"0")}`,document.getElementById("hud-tariff").textContent=t.periodLabel,document.getElementById("chip-tariff").className=`stat-chip stat-tariff ${t.periodClass}`,document.getElementById("hud-weather").textContent=t.pendingPourM3>5?`\u25B2 \u0411\u0435\u0442\u043E\u043D: ${Math.round(t.pendingPourM3*this.hydro.volPriceNorm)} \u0443\u0441\u043B.\u043C\xB3`:`${t.weather.icon} ${t.weather.label}`,document.getElementById("hud-stockpile").textContent=`\u041F\u0440\u0438\u0442\u043E\u043A +${Math.round(e.inTotalQ)} \xB7 \u0418\u0441\u043F\u0430\u0440. -${e.outEvapQ.toFixed(1)} \u043C\xB3/\u0441`,document.getElementById("hud-pop-total").textContent=`8 \u0433\u043E\u0440\u043E\u0434\u043E\u0432 (${t.totalBuildings} \u0437\u0434.) \xB7 ${t.totalPopulation.toLocaleString("ru-RU")} \u0436\u0438\u0442.`,document.getElementById("hud-loan").textContent=`\u0414\u043E\u043B\u0433 \u043F\u043E \u043E\u0431\u043B\u0438\u0433\u0430\u0446\u0438\u044F\u043C: ${Math.round(t.loan).toLocaleString("ru-RU")} \u20BD`;let c=document.getElementById("dam-health-banner"),l=document.getElementById("hud-dam-status"),h=this.hydro.overflowEdges.length;t.pendingPourM3>5?(c.className="dam-health-banner warn",l.textContent="\u0411\u0430\u0448\u0435\u043D\u043D\u044B\u0435 \u043A\u0440\u0430\u043D\u044B \u0431\u0435\u0442\u043E\u043D\u0438\u0440\u0443\u044E\u0442 \u0441\u0442\u0432\u043E\u0440 \u043F\u043B\u043E\u0442\u0438\u043D\u044B\u2026"):t.seepageQ>1.8*U.flowScale||t.maxDamStress>78?(c.className="dam-health-banner warn",l.textContent=`\u041D\u0430\u0433\u0440\u0443\u0437\u043A\u0430 ${Math.round(t.maxDamStress)}% \xB7 \u0424\u0438\u043B\u044C\u0442\u0440\u0430\u0446\u0438\u044F \u0414\u0430\u0440\u0441\u0438! \u0421\u0442\u0430\u0432\u044C\u0442\u0435 [6] \u041A\u043E\u043D\u0442\u0440\u0444\u043E\u0440\u0441`):h>0?(c.className="dam-health-banner",l.textContent=`3D-\u043F\u0435\u0440\u0435\u043B\u0438\u0432 \u0430\u043A\u0442\u0438\u0432\u0435\u043D (${h} \u0441\u0442\u0440\u0443\u0439) \xB7 \u0428\u043B\u044E\u0437\u044B: ${t.navLocksCount} \xB7 \u0420\u044B\u0431\u0445\u043E\u0437\u044B: ${t.fishFarmsCount}`):(c.className="dam-health-banner",l.textContent=`\u041F\u043B\u043E\u0442\u0438\u043D\u0430 ${Math.round(t.maxDamStress)}% \xB7 \u041E\u0420\u0423: ${t.substationsCount} \xB7 \u0428\u043B\u044E\u0437\u044B: ${t.navLocksCount} \xB7 \u0420\u044B\u0431\u0445\u043E\u0437\u044B: ${t.fishFarmsCount}`);let u=Sr.find(d=>!this.economy.completedMilestones.has(d.id));u?(document.getElementById("ms-title").textContent=`${u.title} (+${u.reward.toLocaleString("ru-RU")} \u20BD)`,document.getElementById("ms-desc").textContent=u.desc):(document.getElementById("ms-title").textContent="\u0412\u0441\u0435 \u0433\u043E\u0441\u0443\u0434\u0430\u0440\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0435 \u0433\u0440\u0430\u043D\u0442\u044B \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u044B!",document.getElementById("ms-desc").textContent="\u0412\u0430\u0448 \u043A\u0430\u0441\u043A\u0430\u0434 \u0413\u042D\u0421/\u0413\u0410\u042D\u0421 \u0441\u0442\u0430\u043B \u044D\u0442\u0430\u043B\u043E\u043D\u043E\u043C \u0433\u0438\u0434\u0440\u043E\u044D\u043D\u0435\u0440\u0433\u0435\u0442\u0438\u043A\u0438."),this.activeSideTab==="cities"?this._renderCityCards():this.activeSideTab==="water"?this._renderWaterBalanceTab(e):this.activeSideTab==="revenue"&&this._renderRevenueTab(t),this.selectedStruct&&this._refreshInspector()}_refreshInspector(){let t=this.selectedStruct;if(!t)return;let e=document.getElementById("insp-title"),i=document.getElementById("insp-metrics"),n=document.getElementById("insp-slider"),s=document.getElementById("insp-slider-label"),o=document.getElementById("insp-auto"),a=document.getElementById("insp-auto-label"),c=document.getElementById("insp-gaes-row"),l=document.getElementById("insp-gaes"),h=document.getElementById("insp-clean-btn");if(t.kind==="turbine"){e.textContent=`\u2699 ${t.spec.name} (#${t.id})`;let u=Math.round((t.trashLoad||0)*100),d=t.isPumpingNow?`<b style="color:#22d3ee">\u0417\u0430\u043A\u0430\u0447\u043A\u0430 \u0413\u0410\u042D\u0421 (-${t.pumpConsumeMW.toFixed(1)} \u041C\u0412\u0442)</b>`:`<b>${t.powerMW.toFixed(2)} \u041C\u0412\u0442</b>`;i.innerHTML=`
        <span>\u0420\u0435\u0436\u0438\u043C: ${d}</span>
        <span>\u041D\u0430\u043F\u043E\u0440 \u0447\u0438\u0441\u0442.: <b>${t.netHead.toFixed(1)} \u043C</b></span>
        <span>\u0420\u0430\u0441\u0445\u043E\u0434 Q: <b>${Math.abs(t.flowQ).toFixed(1)} \u043C\xB3/\u0441</b></span>
        <span>\u041A\u041F\u0414 \u03B7: <b>${Math.round(t.efficiency*100)}%</b></span>
        <span>\u0420\u0435\u0448\u0451\u0442\u043A\u0430: <b>${u>4?`\u0437\u0430\u0441\u043E\u0440 ${u}%`:"\u0447\u0438\u0441\u0442\u0430\u044F"}</b></span>
        <span>\u041A\u0430\u0432\u0438\u0442\u0430\u0446\u0438\u044F: <b>${t.cavitation>.2?"\u25B2 \u0435\u0441\u0442\u044C":"\u043D\u043E\u0440\u043C\u0430"}</b></span>
      `;let f=Math.round(t.throttle*100);n.value=f,s.textContent=`\u041E\u0442\u043A\u0440\u044B\u0442\u0438\u0435 \u043D\u0430\u043F\u0440\u0430\u0432\u043B\u044F\u044E\u0449\u0435\u0433\u043E \u0430\u043F\u043F\u0430\u0440\u0430\u0442\u0430: ${f}%`,o.checked=!!t.autoDispatch,a.textContent="\u0410\u0432\u0442\u043E-\u0434\u0438\u0441\u043F\u0435\u0442\u0447\u0435\u0440 \u043F\u043E \u043F\u0438\u043A\u0430\u043C \u041E\u0420\u042D\u041C + \u0441\u043E\u0440\u043E\u043E\u0447\u0438\u0441\u0442\u043A\u0430",c&&c.classList.toggle("hidden",!t.spec.reversible),l&&(l.checked=!!t.pumpedStorage),h.classList.toggle("hidden",u<=2)}else{e.textContent=`\u2248 3D-\u0412\u043E\u0434\u043E\u0441\u0431\u0440\u043E\u0441 \u0441 \u0442\u0440\u0430\u043C\u043F\u043B\u0438\u043D\u043E\u043C (#${t.id})`,i.innerHTML=`
        <span>\u0421\u0431\u0440\u043E\u0441 Q: <b>${t.currentFlowQ.toFixed(1)} \u043C\xB3/\u0441</b></span>
        <span>\u0421\u043A\u043E\u0440\u043E\u0441\u0442\u044C \u0441\u0442\u0440\u0443\u0438: <b>${t.jetSpeed.toFixed(1)} \u043C/\u0441</b></span>
        <span>\u041E\u0442\u043C\u0435\u0442\u043A\u0430 \u043F\u043E\u0440\u043E\u0433\u0430: <b>${t.sillElev.toFixed(1)} \u043C</b></span>
        <span>\u0423\u0441\u0442\u0430\u0432\u043A\u0430 \u0431\u044C\u0435\u0444\u0430: <b>${t.targetHeadElev.toFixed(1)} \u043C</b></span>
      `;let u=Math.round(t.openRatio*100);n.value=u,s.textContent=`\u041F\u043E\u0434\u044A\u0451\u043C \u0441\u0435\u0433\u043C\u0435\u043D\u0442\u043D\u043E\u0433\u043E \u0437\u0430\u0442\u0432\u043E\u0440\u0430: ${u}%`,o.checked=!!t.autoRegulate,a.textContent="\u0410\u0432\u0442\u043E-\u0441\u0431\u0440\u043E\u0441 \u043F\u0430\u0432\u043E\u0434\u043A\u0430 \u043F\u0440\u0438 \u043F\u0435\u0440\u0435\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u0438 \u0431\u044C\u0435\u0444\u0430",c&&c.classList.add("hidden"),h.classList.add("hidden")}}notify(t,e="info"){let i=document.getElementById("toast-stack");if(!i)return;let n=document.createElement("div");for(n.className=`toast ${e}`,n.textContent=t,i.prepend(n);i.children.length>4;)i.lastElementChild.remove();setTimeout(()=>{n.parentNode&&n.remove()},5200)}_loop(t){requestAnimationFrame(u=>this._loop(u));let e=Math.min(.08,Math.max(.001,(t-this._lastTime)/1e3));if(this._lastTime=t,this._frameCount++,this._fpsFrames++,this._fpsAccum+=e,this._fpsAccum>=.5&&(this.fps=Math.round(this._fpsFrames/this._fpsAccum),this._fpsFrames=0,this._fpsAccum=0),this.isInPreGameLoader){this.hydro.step(e*.75,4);let u=this.hydro.sampleAtWorld(this.camCtrl.goalTarget.x,this.camCtrl.goalTarget.z).bed;this.camCtrl.updatePreviewOrbit(e,u);let d=qe[this.economy.weatherId]||qe.normal;this.worldView.updateAtmosphere(this.economy.hour,d,this.camCtrl.target,e),this.worldView.updateWaterAndWetness(this.hydro.simTime),this.renderer.shadowMap.enabled&&this._frameCount%6===0&&(this.renderer.shadowMap.needsUpdate=!0),this.renderer.render(this.scene,this.camera);return}let i=Ac[this.speedIndex];if(i>0){let u=i<=2?1:2,d=e*i/u;for(let f=0;f<u;f++)this.hydro.step(d,this.profile.substepsCap);this.economy.update(e*i)}let n=this.hydro.sampleAtWorld(this.camCtrl.goalTarget.x,this.camCtrl.goalTarget.z).bed;this.camCtrl.update(e,n);let s=qe[this.economy.weatherId]||qe.normal,o=e*Math.max(0,Math.min(2.5,i)),{dayFactor:a}=this.worldView.updateAtmosphere(this.economy.hour,s,this.camCtrl.target,o),c=this.hydro.consumeTerrainDirty();c&&(this.worldView.updateTerrainGeometryRect(c.x0,c.z0,c.x1,c.z1),this.renderer.shadowMap.enabled&&(this.renderer.shadowMap.needsUpdate=!0)),this.worldView.updateWaterAndWetness(this.hydro.simTime),this.worldView.syncEngineeredVolumes(),this.worldView.animateConstructionCranes(this.hydro.simTime),this.worldView.syncHydroStructures(this.hydro.simTime),(this.economy.buildingsDirty||this._frameCount%12===0)&&(this.worldView.syncCityInstances(),this.economy.buildingsDirty=!1,this.renderer.shadowMap.enabled&&this.profile.shadowEvery>0&&this._frameCount%30===0&&(this.renderer.shadowMap.needsUpdate=!0));let l=this.economy.weatherId==="flood"?1:this.economy.weatherId==="rain"?.6:0;this.spray.update(e*Math.max(1,Math.min(2,i)),this.hydro,this.camCtrl.target,a,l);let h=this.hydro.lastCrestOverflowQ||0;for(let u of this.hydro.spillways)h+=u.currentFlowQ;if(this.audio.updateContinuous(this.camCtrl.distance,h,this.economy.totalMW),this.renderer.shadowMap.enabled&&this.profile.shadowEvery>0&&this._frameCount%this.profile.shadowEvery===0&&(this.renderer.shadowMap.needsUpdate=!0),this.renderer.render(this.scene,this.camera),this._uiRefreshAccum+=e,this._uiRefreshAccum>=.25&&(this._uiRefreshAccum=0,this.tutorial.update(),this._refreshHUD(),this.showDiag)){let u=document.getElementById("diag-panel");u.textContent=Ud({fps:this.fps,hydroMs:this.hydro.lastStepMs,grid:`${this.hydro.grid}\xD7${this.hydro.grid} (${U.size}\xD7${U.size}\u043C)`,activeTiles:this.hydro.activeTileCount,totalTiles:this.hydro.totalTiles,substeps:this.hydro.lastSubsteps,waterVolumeM3:this.hydro.totalWaterVolumeM3,drawCalls:this.renderer.info.render.calls,triangles:this.renderer.info.render.triangles,cityBuildings:this.economy.allBuildings.length,shadows:this.renderer.shadowMap.enabled?`\u0432\u043A\u043B (1/${this.profile.shadowEvery} \u043A\u0430\u0434\u0440\u0430)`:"\u0432\u044B\u043A\u043B"})}}};window.addEventListener("DOMContentLoaded",()=>{window.__game=new Cc});})();
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2026 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
