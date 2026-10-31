(()=>{var yh=0,Il=1,vh=2;var Wn=1,Mh=2,_s=3,Ii=0,Ze=1,Ve=2,qi=0,wn=1,Pl=2,Ll=3,Dl=4,_h=5;var Xn=100,Sh=101,bh=102,wh=103,Eh=104,Th=200,Ah=201,Ch=202,Rh=203,Nl=204,Fl=205,Ih=206,Ph=207,Lh=208,Dh=209,Nh=210,Fh=211,Uh=212,Bh=213,zh=214,Kr=0,Jr=1,jr=2,fs=3,to=4,eo=5,io=6,no=7,or=0,kh=1,Oh=2,Pi=0,Ul=1,Bl=2,zl=3,kl=4,Ol=5,Hl=6,Gl=7;var Vl=300,En=301,Yn=302,Do=303,No=304,ar=306,kn=1e3,Oi=1001,so=1002,qe=1003,Hh=1004;var lr=1005;var Ge=1006,Fo=1007;var $i=1008;var hi=1009,Wl=1010,Xl=1011,Ss=1012,Uo=1013,Li=1014,Si=1015,Di=1016,Bo=1017,zo=1018,bs=1020,Yl=35902,ql=35899,$l=1021,Zl=1022,ri=1023,Hi=1026,Tn=1027,ko=1028,Oo=1029,An=1030,Ho=1031;var Go=1033,cr=33776,hr=33777,dr=33778,ur=33779,Vo=35840,Wo=35841,Xo=35842,Yo=35843,qo=36196,$o=37492,Zo=37496,Qo=37488,Ko=37489,fr=37490,Jo=37491,jo=37808,ta=37809,ea=37810,ia=37811,na=37812,sa=37813,ra=37814,oa=37815,aa=37816,la=37817,ca=37818,ha=37819,da=37820,ua=37821,fa=36492,pa=36494,ma=36495,ga=36283,xa=36284,pr=36285,ya=36286;var zs=2300,ro=2301,Zr=2302,_l=2303,Sl=2400,bl=2401,wl=2402;var Gh=3200;var ws=0,Vh=1,rn="",ni="srgb",ks="srgb-linear",Os="linear",ve="srgb";var Qr=7680;var Wh=519,Xh=512,Yh=513,qh=514,va=515,$h=516,Zh=517,Ma=518,Qh=519,Kh=35044,Fe=35048;var Ql="300 es",Ri=2e3,ps=2001;function au(r){for(let t=r.length-1;t>=0;--t)if(r[t]>=65535)return!0;return!1}function lu(r){return ArrayBuffer.isView(r)&&!(r instanceof DataView)}function Hs(r){return document.createElementNS("http://www.w3.org/1999/xhtml",r)}function Jh(){let r=Hs("canvas");return r.style.display="block",r}var Hc={},ms=null;function Kl(...r){let t="THREE."+r.shift();ms?ms("log",t,...r):console.log(t,...r)}function jh(r){let t=r[0];if(typeof t=="string"&&t.startsWith("TSL:")){let e=r[1];e&&e.isStackTrace?r[0]+=" "+e.getLocation():r[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return r}function Vt(...r){r=jh(r);let t="THREE."+r.shift();if(ms)ms("warn",t,...r);else{let e=r[0];e&&e.isStackTrace?console.warn(e.getError(t)):console.warn(t,...r)}}function Xt(...r){r=jh(r);let t="THREE."+r.shift();if(ms)ms("error",t,...r);else{let e=r[0];e&&e.isStackTrace?console.error(e.getError(t)):console.error(t,...r)}}function zn(...r){let t=r.join(" ");t in Hc||(Hc[t]=!0,Vt(...r))}function td(r,t,e){return new Promise(function(i,n){function s(){switch(r.clientWaitSync(t,r.SYNC_FLUSH_COMMANDS_BIT,0)){case r.WAIT_FAILED:n();break;case r.TIMEOUT_EXPIRED:setTimeout(s,e);break;default:i()}}setTimeout(s,e)})}var ed={[Kr]:Jr,[jr]:io,[to]:no,[fs]:eo,[Jr]:Kr,[io]:jr,[no]:to,[eo]:fs},Gi=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[t]===void 0&&(i[t]=[]),i[t].indexOf(e)===-1&&i[t].push(e)}hasEventListener(t,e){let i=this._listeners;return i===void 0?!1:i[t]!==void 0&&i[t].indexOf(e)!==-1}removeEventListener(t,e){let i=this._listeners;if(i===void 0)return;let n=i[t];if(n!==void 0){let s=n.indexOf(e);s!==-1&&n.splice(s,1)}}dispatchEvent(t){let e=this._listeners;if(e===void 0)return;let i=e[t.type];if(i!==void 0){t.target=this;let n=i.slice(0);for(let s=0,o=n.length;s<o;s++)n[s].call(this,t);t.target=null}}},Je=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var Ka=Math.PI/180,oo=180/Math.PI;function mr(){let r=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Je[r&255]+Je[r>>8&255]+Je[r>>16&255]+Je[r>>24&255]+"-"+Je[t&255]+Je[t>>8&255]+"-"+Je[t>>16&15|64]+Je[t>>24&255]+"-"+Je[e&63|128]+Je[e>>8&255]+"-"+Je[e>>16&255]+Je[e>>24&255]+Je[i&255]+Je[i>>8&255]+Je[i>>16&255]+Je[i>>24&255]).toLowerCase()}function ce(r,t,e){return Math.max(t,Math.min(e,r))}function cu(r,t){return(r%t+t)%t}function Ja(r,t,e){return(1-e)*r+e*t}function Is(r,t){switch(t.constructor){case Float32Array:return r;case Uint32Array:return r/4294967295;case Uint16Array:return r/65535;case Uint8Array:case Uint8ClampedArray:return r/255;case Int32Array:return Math.max(r/2147483647,-1);case Int16Array:return Math.max(r/32767,-1);case Int8Array:return Math.max(r/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function li(r,t){switch(t.constructor){case Float32Array:return r;case Uint32Array:return Math.round(r*4294967295);case Uint16Array:return Math.round(r*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(r*255);case Int32Array:return Math.round(r*2147483647);case Int16Array:return Math.round(r*32767);case Int8Array:return Math.round(r*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var ic=class ic{constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,i=this.y,n=t.elements;return this.x=n[0]*e+n[3]*i+n[6],this.y=n[1]*e+n[4]*i+n[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=ce(this.x,t.x,e.x),this.y=ce(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=ce(this.x,t,e),this.y=ce(this.y,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(ce(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let i=this.dot(t)/e;return Math.acos(ce(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,i=this.y-t.y;return e*e+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let i=Math.cos(e),n=Math.sin(e),s=this.x-t.x,o=this.y-t.y;return this.x=s*i-o*n+t.x,this.y=s*n+o*i+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};ic.prototype.isVector2=!0;var Kt=ic,fi=class{constructor(t=0,e=0,i=0,n=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=i,this._w=n}static slerpFlat(t,e,i,n,s,o,a){let l=i[n+0],c=i[n+1],h=i[n+2],u=i[n+3],d=s[o+0],f=s[o+1],g=s[o+2],y=s[o+3];if(u!==y||l!==d||c!==f||h!==g){let p=l*d+c*f+h*g+u*y;p<0&&(d=-d,f=-f,g=-g,y=-y,p=-p);let m=1-a;if(p<.9995){let x=Math.acos(p),S=Math.sin(x);m=Math.sin(m*x)/S,a=Math.sin(a*x)/S,l=l*m+d*a,c=c*m+f*a,h=h*m+g*a,u=u*m+y*a}else{l=l*m+d*a,c=c*m+f*a,h=h*m+g*a,u=u*m+y*a;let x=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=x,c*=x,h*=x,u*=x}}t[e]=l,t[e+1]=c,t[e+2]=h,t[e+3]=u}static multiplyQuaternionsFlat(t,e,i,n,s,o){let a=i[n],l=i[n+1],c=i[n+2],h=i[n+3],u=s[o],d=s[o+1],f=s[o+2],g=s[o+3];return t[e]=a*g+h*u+l*f-c*d,t[e+1]=l*g+h*d+c*u-a*f,t[e+2]=c*g+h*f+a*d-l*u,t[e+3]=h*g-a*u-l*d-c*f,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,i,n){return this._x=t,this._y=e,this._z=i,this._w=n,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let i=t._x,n=t._y,s=t._z,o=t._order,a=Math.cos,l=Math.sin,c=a(i/2),h=a(n/2),u=a(s/2),d=l(i/2),f=l(n/2),g=l(s/2);switch(o){case"XYZ":this._x=d*h*u+c*f*g,this._y=c*f*u-d*h*g,this._z=c*h*g+d*f*u,this._w=c*h*u-d*f*g;break;case"YXZ":this._x=d*h*u+c*f*g,this._y=c*f*u-d*h*g,this._z=c*h*g-d*f*u,this._w=c*h*u+d*f*g;break;case"ZXY":this._x=d*h*u-c*f*g,this._y=c*f*u+d*h*g,this._z=c*h*g+d*f*u,this._w=c*h*u-d*f*g;break;case"ZYX":this._x=d*h*u-c*f*g,this._y=c*f*u+d*h*g,this._z=c*h*g-d*f*u,this._w=c*h*u+d*f*g;break;case"YZX":this._x=d*h*u+c*f*g,this._y=c*f*u+d*h*g,this._z=c*h*g-d*f*u,this._w=c*h*u-d*f*g;break;case"XZY":this._x=d*h*u-c*f*g,this._y=c*f*u-d*h*g,this._z=c*h*g+d*f*u,this._w=c*h*u+d*f*g;break;default:Vt("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let i=e/2,n=Math.sin(i);return this._x=t.x*n,this._y=t.y*n,this._z=t.z*n,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,i=e[0],n=e[4],s=e[8],o=e[1],a=e[5],l=e[9],c=e[2],h=e[6],u=e[10],d=i+a+u;if(d>0){let f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(h-l)*f,this._y=(s-c)*f,this._z=(o-n)*f}else if(i>a&&i>u){let f=2*Math.sqrt(1+i-a-u);this._w=(h-l)/f,this._x=.25*f,this._y=(n+o)/f,this._z=(s+c)/f}else if(a>u){let f=2*Math.sqrt(1+a-i-u);this._w=(s-c)/f,this._x=(n+o)/f,this._y=.25*f,this._z=(l+h)/f}else{let f=2*Math.sqrt(1+u-i-a);this._w=(o-n)/f,this._x=(s+c)/f,this._y=(l+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let i=t.dot(e)+1;return i<1e-8?(i=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=i):(this._x=0,this._y=-t.z,this._z=t.y,this._w=i)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=i),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(ce(this.dot(t),-1,1)))}rotateTowards(t,e){let i=this.angleTo(t);if(i===0)return this;let n=Math.min(1,e/i);return this.slerp(t,n),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let i=t._x,n=t._y,s=t._z,o=t._w,a=e._x,l=e._y,c=e._z,h=e._w;return this._x=i*h+o*a+n*c-s*l,this._y=n*h+o*l+s*a-i*c,this._z=s*h+o*c+i*l-n*a,this._w=o*h-i*a-n*l-s*c,this._onChangeCallback(),this}slerp(t,e){let i=t._x,n=t._y,s=t._z,o=t._w,a=this.dot(t);a<0&&(i=-i,n=-n,s=-s,o=-o,a=-a);let l=1-e;if(a<.9995){let c=Math.acos(a),h=Math.sin(c);l=Math.sin(l*c)/h,e=Math.sin(e*c)/h,this._x=this._x*l+i*e,this._y=this._y*l+n*e,this._z=this._z*l+s*e,this._w=this._w*l+o*e,this._onChangeCallback()}else this._x=this._x*l+i*e,this._y=this._y*l+n*e,this._z=this._z*l+s*e,this._w=this._w*l+o*e,this.normalize();return this}slerpQuaternions(t,e,i){return this.copy(t).slerp(e,i)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),i=Math.random(),n=Math.sqrt(1-i),s=Math.sqrt(i);return this.set(n*Math.sin(t),n*Math.cos(t),s*Math.sin(e),s*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},nc=class nc{constructor(t=0,e=0,i=0){this.x=t,this.y=e,this.z=i}set(t,e,i){return i===void 0&&(i=this.z),this.x=t,this.y=e,this.z=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(Gc.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(Gc.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,i=this.y,n=this.z,s=t.elements;return this.x=s[0]*e+s[3]*i+s[6]*n,this.y=s[1]*e+s[4]*i+s[7]*n,this.z=s[2]*e+s[5]*i+s[8]*n,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,i=this.y,n=this.z,s=t.elements,o=1/(s[3]*e+s[7]*i+s[11]*n+s[15]);return this.x=(s[0]*e+s[4]*i+s[8]*n+s[12])*o,this.y=(s[1]*e+s[5]*i+s[9]*n+s[13])*o,this.z=(s[2]*e+s[6]*i+s[10]*n+s[14])*o,this}applyQuaternion(t){let e=this.x,i=this.y,n=this.z,s=t.x,o=t.y,a=t.z,l=t.w,c=2*(o*n-a*i),h=2*(a*e-s*n),u=2*(s*i-o*e);return this.x=e+l*c+o*u-a*h,this.y=i+l*h+a*c-s*u,this.z=n+l*u+s*h-o*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,i=this.y,n=this.z,s=t.elements;return this.x=s[0]*e+s[4]*i+s[8]*n,this.y=s[1]*e+s[5]*i+s[9]*n,this.z=s[2]*e+s[6]*i+s[10]*n,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=ce(this.x,t.x,e.x),this.y=ce(this.y,t.y,e.y),this.z=ce(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=ce(this.x,t,e),this.y=ce(this.y,t,e),this.z=ce(this.z,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(ce(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let i=t.x,n=t.y,s=t.z,o=e.x,a=e.y,l=e.z;return this.x=n*l-s*a,this.y=s*o-i*l,this.z=i*a-n*o,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let i=t.dot(this)/e;return this.copy(t).multiplyScalar(i)}projectOnPlane(t){return ja.copy(this).projectOnVector(t),this.sub(ja)}reflect(t){return this.sub(ja.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let i=this.dot(t)/e;return Math.acos(ce(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,i=this.y-t.y,n=this.z-t.z;return e*e+i*i+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,i){let n=Math.sin(e)*t;return this.x=n*Math.sin(i),this.y=Math.cos(e)*t,this.z=n*Math.cos(i),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,i){return this.x=t*Math.sin(e),this.y=i,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),i=this.setFromMatrixColumn(t,1).length(),n=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=i,this.z=n,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,i=Math.sqrt(1-e*e);return this.x=i*Math.cos(t),this.y=e,this.z=i*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};nc.prototype.isVector3=!0;var O=nc,ja=new O,Gc=new fi,sc=class sc{constructor(t,e,i,n,s,o,a,l,c){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,i,n,s,o,a,l,c)}set(t,e,i,n,s,o,a,l,c){let h=this.elements;return h[0]=t,h[1]=n,h[2]=a,h[3]=e,h[4]=s,h[5]=l,h[6]=i,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],this}extractBasis(t,e,i){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let i=t.elements,n=e.elements,s=this.elements,o=i[0],a=i[3],l=i[6],c=i[1],h=i[4],u=i[7],d=i[2],f=i[5],g=i[8],y=n[0],p=n[3],m=n[6],x=n[1],S=n[4],M=n[7],b=n[2],_=n[5],w=n[8];return s[0]=o*y+a*x+l*b,s[3]=o*p+a*S+l*_,s[6]=o*m+a*M+l*w,s[1]=c*y+h*x+u*b,s[4]=c*p+h*S+u*_,s[7]=c*m+h*M+u*w,s[2]=d*y+f*x+g*b,s[5]=d*p+f*S+g*_,s[8]=d*m+f*M+g*w,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],i=t[1],n=t[2],s=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8];return e*o*h-e*a*c-i*s*h+i*a*l+n*s*c-n*o*l}invert(){let t=this.elements,e=t[0],i=t[1],n=t[2],s=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8],u=h*o-a*c,d=a*l-h*s,f=c*s-o*l,g=e*u+i*d+n*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let y=1/g;return t[0]=u*y,t[1]=(n*c-h*i)*y,t[2]=(a*i-n*o)*y,t[3]=d*y,t[4]=(h*e-n*l)*y,t[5]=(n*s-a*e)*y,t[6]=f*y,t[7]=(i*l-c*e)*y,t[8]=(o*e-i*s)*y,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,i,n,s,o,a){let l=Math.cos(s),c=Math.sin(s);return this.set(i*l,i*c,-i*(l*o+c*a)+o+t,-n*c,n*l,-n*(-c*o+l*a)+a+e,0,0,1),this}scale(t,e){return zn("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(tl.makeScale(t,e)),this}rotate(t){return zn("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(tl.makeRotation(-t)),this}translate(t,e){return zn("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(tl.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,i,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,i=t.elements;for(let n=0;n<9;n++)if(e[n]!==i[n])return!1;return!0}fromArray(t,e=0){for(let i=0;i<9;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){let i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t}clone(){return new this.constructor().fromArray(this.elements)}};sc.prototype.isMatrix3=!0;var Zt=sc,tl=new Zt,Vc=new Zt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Wc=new Zt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function hu(){let r={enabled:!0,workingColorSpace:ks,spaces:{},convert:function(n,s,o){return this.enabled===!1||s===o||!s||!o||(this.spaces[s].transfer===ve&&(n.r=sn(n.r),n.g=sn(n.g),n.b=sn(n.b)),this.spaces[s].primaries!==this.spaces[o].primaries&&(n.applyMatrix3(this.spaces[s].toXYZ),n.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===ve&&(n.r=us(n.r),n.g=us(n.g),n.b=us(n.b))),n},workingToColorSpace:function(n,s){return this.convert(n,this.workingColorSpace,s)},colorSpaceToWorking:function(n,s){return this.convert(n,s,this.workingColorSpace)},getPrimaries:function(n){return this.spaces[n].primaries},getTransfer:function(n){return n===rn?Os:this.spaces[n].transfer},getToneMappingMode:function(n){return this.spaces[n].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(n,s=this.workingColorSpace){return n.fromArray(this.spaces[s].luminanceCoefficients)},define:function(n){Object.assign(this.spaces,n)},_getMatrix:function(n,s,o){return n.copy(this.spaces[s].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(n){return this.spaces[n].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(n=this.workingColorSpace){return this.spaces[n].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(n,s){return zn("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),r.workingToColorSpace(n,s)},toWorkingColorSpace:function(n,s){return zn("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),r.colorSpaceToWorking(n,s)}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],i=[.3127,.329];return r.define({[ks]:{primaries:t,whitePoint:i,transfer:Os,toXYZ:Vc,fromXYZ:Wc,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:ni},outputColorSpaceConfig:{drawingBufferColorSpace:ni}},[ni]:{primaries:t,whitePoint:i,transfer:ve,toXYZ:Vc,fromXYZ:Wc,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:ni}}}),r}var le=hu();function sn(r){return r<.04045?r*.0773993808:Math.pow(r*.9478672986+.0521327014,2.4)}function us(r){return r<.0031308?r*12.92:1.055*Math.pow(r,.41666)-.055}var Jn,ao=class{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let i;if(t instanceof HTMLCanvasElement)i=t;else{Jn===void 0&&(Jn=Hs("canvas")),Jn.width=t.width,Jn.height=t.height;let n=Jn.getContext("2d");t instanceof ImageData?n.putImageData(t,0,0):n.drawImage(t,0,0,t.width,t.height),i=Jn}return i.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=Hs("canvas");e.width=t.width,e.height=t.height;let i=e.getContext("2d");i.drawImage(t,0,0,t.width,t.height);let n=i.getImageData(0,0,t.width,t.height),s=n.data;for(let o=0;o<s.length;o++)s[o]=sn(s[o]/255)*255;return i.putImageData(n,0,0),e}else if(t.data){let e=t.data.slice(0);for(let i=0;i<e.length;i++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[i]=Math.floor(sn(e[i]/255)*255):e[i]=sn(e[i]);return{data:e,width:t.width,height:t.height}}else return Vt("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},du=0,gs=class{constructor(t=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:du++}),this.uuid=mr(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let e=this.data;return typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):typeof VideoFrame<"u"&&e instanceof VideoFrame?t.set(e.displayWidth,e.displayHeight,0):e!==null?t.set(e.width,e.height,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let i={uuid:this.uuid,url:""},n=this.data;if(n!==null){let s;if(Array.isArray(n)){s=[];for(let o=0,a=n.length;o<a;o++)n[o].isDataTexture?s.push(el(n[o].image)):s.push(el(n[o]))}else s=el(n);i.url=s}return e||(t.images[this.uuid]=i),i}};function el(r){return typeof HTMLImageElement<"u"&&r instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&r instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&r instanceof ImageBitmap?ao.getDataURL(r):r.data?{data:Array.from(r.data),width:r.width,height:r.height,type:r.data.constructor.name}:(Vt("Texture: Unable to serialize Texture."),{})}var uu=0,il=new O,si=class r extends Gi{constructor(t=r.DEFAULT_IMAGE,e=r.DEFAULT_MAPPING,i=Oi,n=Oi,s=Ge,o=$i,a=ri,l=hi,c=r.DEFAULT_ANISOTROPY,h=rn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:uu++}),this.uuid=mr(),this.name="",this.source=new gs(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=i,this.wrapT=n,this.magFilter=s,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new Kt(0,0),this.repeat=new Kt(1,1),this.center=new Kt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Zt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(il).x}get height(){return this.source.getSize(il).y}get depth(){return this.source.getSize(il).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let e in t){let i=t[e];if(i===void 0){Vt(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}let n=this[e];if(n===void 0){Vt(`Texture.setValues(): property '${e}' does not exist.`);continue}n&&i&&n.isVector2&&i.isVector2||n&&i&&n.isVector3&&i.isVector3||n&&i&&n.isMatrix3&&i.isMatrix3?n.copy(i):this[e]=i}}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),e||(t.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==Vl)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case kn:t.x=t.x-Math.floor(t.x);break;case Oi:t.x=t.x<0?0:1;break;case so:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case kn:t.y=t.y-Math.floor(t.y);break;case Oi:t.y=t.y<0?0:1;break;case so:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};si.DEFAULT_IMAGE=null;si.DEFAULT_MAPPING=Vl;si.DEFAULT_ANISOTROPY=1;var rc=class rc{constructor(t=0,e=0,i=0,n=1){this.x=t,this.y=e,this.z=i,this.w=n}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,i,n){return this.x=t,this.y=e,this.z=i,this.w=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,i=this.y,n=this.z,s=this.w,o=t.elements;return this.x=o[0]*e+o[4]*i+o[8]*n+o[12]*s,this.y=o[1]*e+o[5]*i+o[9]*n+o[13]*s,this.z=o[2]*e+o[6]*i+o[10]*n+o[14]*s,this.w=o[3]*e+o[7]*i+o[11]*n+o[15]*s,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,i,n,s,l=t.elements,c=l[0],h=l[4],u=l[8],d=l[1],f=l[5],g=l[9],y=l[2],p=l[6],m=l[10];if(Math.abs(h-d)<.01&&Math.abs(u-y)<.01&&Math.abs(g-p)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+y)<.1&&Math.abs(g+p)<.1&&Math.abs(c+f+m-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let S=(c+1)/2,M=(f+1)/2,b=(m+1)/2,_=(h+d)/4,w=(u+y)/4,v=(g+p)/4;return S>M&&S>b?S<.01?(i=0,n=.707106781,s=.707106781):(i=Math.sqrt(S),n=_/i,s=w/i):M>b?M<.01?(i=.707106781,n=0,s=.707106781):(n=Math.sqrt(M),i=_/n,s=v/n):b<.01?(i=.707106781,n=.707106781,s=0):(s=Math.sqrt(b),i=w/s,n=v/s),this.set(i,n,s,e),this}let x=Math.sqrt((p-g)*(p-g)+(u-y)*(u-y)+(d-h)*(d-h));return Math.abs(x)<.001&&(x=1),this.x=(p-g)/x,this.y=(u-y)/x,this.z=(d-h)/x,this.w=Math.acos((c+f+m-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=ce(this.x,t.x,e.x),this.y=ce(this.y,t.y,e.y),this.z=ce(this.z,t.z,e.z),this.w=ce(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=ce(this.x,t,e),this.y=ce(this.y,t,e),this.z=ce(this.z,t,e),this.w=ce(this.w,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(ce(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this.w=t.w+(e.w-t.w)*i,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};rc.prototype.isVector4=!0;var De=rc,lo=class extends Gi{constructor(t=1,e=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Ge,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=i.depth,this.scissor=new De(0,0,t,e),this.scissorTest=!1,this.viewport=new De(0,0,t,e),this.textures=[];let n={width:t,height:e,depth:i.depth},s=new si(n),o=i.count;for(let a=0;a<o;a++)this.textures[a]=s.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveColorBuffer=i.resolveColorBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.storeMultisampledColorBuffer=i.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=i.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=i.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(t={}){let e={minFilter:Ge,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),t!==null&&t.renderTarget===null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,i=1){if(this.width!==t||this.height!==e||this.depth!==i){this.width=t,this.height=e,this.depth=i;for(let n=0,s=this.textures.length;n<s;n++)this.textures[n].image.width=t,this.textures[n].image.height=e,this.textures[n].image.depth=i,this.textures[n].isData3DTexture!==!0&&(this.textures[n].isArrayTexture=this.textures[n].image.depth>1);this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,i=t.textures.length;e<i;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;let n=Object.assign({},t.textures[e].image);this.textures[e].source=new gs(n)}if(this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveColorBuffer=t.resolveColorBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,this.storeMultisampledColorBuffer=t.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=t.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=t.storeMultisampledStencilBuffer,t.depthTexture!==null)if(t.depthTexture.renderTarget===t){let e=t.depthTexture.clone();e.renderTarget=null,this.depthTexture=e}else this.depthTexture=t.depthTexture;return this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},ci=class extends lo{constructor(t=1,e=1,i={}){super(t,e,i),this.isWebGLRenderTarget=!0}},Gs=class extends si{constructor(t=null,e=1,i=1,n=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:i,depth:n},this.magFilter=qe,this.minFilter=qe,this.wrapR=Oi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var co=class extends si{constructor(t=null,e=1,i=1,n=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:i,depth:n},this.magFilter=qe,this.minFilter=qe,this.wrapR=Oi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}};var Lo=class Lo{constructor(t,e,i,n,s,o,a,l,c,h,u,d,f,g,y,p){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,i,n,s,o,a,l,c,h,u,d,f,g,y,p)}set(t,e,i,n,s,o,a,l,c,h,u,d,f,g,y,p){let m=this.elements;return m[0]=t,m[4]=e,m[8]=i,m[12]=n,m[1]=s,m[5]=o,m[9]=a,m[13]=l,m[2]=c,m[6]=h,m[10]=u,m[14]=d,m[3]=f,m[7]=g,m[11]=y,m[15]=p,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Lo().fromArray(this.elements)}copy(t){let e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],e[9]=i[9],e[10]=i[10],e[11]=i[11],e[12]=i[12],e[13]=i[13],e[14]=i[14],e[15]=i[15],this}copyPosition(t){let e=this.elements,i=t.elements;return e[12]=i[12],e[13]=i[13],e[14]=i[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,i){return this.determinantAffine()===0?(t.set(1,0,0),e.set(0,1,0),i.set(0,0,1),this):(t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(t,e,i){return this.set(t.x,e.x,i.x,0,t.y,e.y,i.y,0,t.z,e.z,i.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();let e=this.elements,i=t.elements,n=1/jn.setFromMatrixColumn(t,0).length(),s=1/jn.setFromMatrixColumn(t,1).length(),o=1/jn.setFromMatrixColumn(t,2).length();return e[0]=i[0]*n,e[1]=i[1]*n,e[2]=i[2]*n,e[3]=0,e[4]=i[4]*s,e[5]=i[5]*s,e[6]=i[6]*s,e[7]=0,e[8]=i[8]*o,e[9]=i[9]*o,e[10]=i[10]*o,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,i=t.x,n=t.y,s=t.z,o=Math.cos(i),a=Math.sin(i),l=Math.cos(n),c=Math.sin(n),h=Math.cos(s),u=Math.sin(s);if(t.order==="XYZ"){let d=o*h,f=o*u,g=a*h,y=a*u;e[0]=l*h,e[4]=-l*u,e[8]=c,e[1]=f+g*c,e[5]=d-y*c,e[9]=-a*l,e[2]=y-d*c,e[6]=g+f*c,e[10]=o*l}else if(t.order==="YXZ"){let d=l*h,f=l*u,g=c*h,y=c*u;e[0]=d+y*a,e[4]=g*a-f,e[8]=o*c,e[1]=o*u,e[5]=o*h,e[9]=-a,e[2]=f*a-g,e[6]=y+d*a,e[10]=o*l}else if(t.order==="ZXY"){let d=l*h,f=l*u,g=c*h,y=c*u;e[0]=d-y*a,e[4]=-o*u,e[8]=g+f*a,e[1]=f+g*a,e[5]=o*h,e[9]=y-d*a,e[2]=-o*c,e[6]=a,e[10]=o*l}else if(t.order==="ZYX"){let d=o*h,f=o*u,g=a*h,y=a*u;e[0]=l*h,e[4]=g*c-f,e[8]=d*c+y,e[1]=l*u,e[5]=y*c+d,e[9]=f*c-g,e[2]=-c,e[6]=a*l,e[10]=o*l}else if(t.order==="YZX"){let d=o*l,f=o*c,g=a*l,y=a*c;e[0]=l*h,e[4]=y-d*u,e[8]=g*u+f,e[1]=u,e[5]=o*h,e[9]=-a*h,e[2]=-c*h,e[6]=f*u+g,e[10]=d-y*u}else if(t.order==="XZY"){let d=o*l,f=o*c,g=a*l,y=a*c;e[0]=l*h,e[4]=-u,e[8]=c*h,e[1]=d*u+y,e[5]=o*h,e[9]=f*u-g,e[2]=g*u-f,e[6]=a*h,e[10]=y*u+d}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(fu,t,pu)}lookAt(t,e,i){let n=this.elements;return di.subVectors(t,e),di.lengthSq()===0&&(di.z=1),di.normalize(),dn.crossVectors(i,di),dn.lengthSq()===0&&(Math.abs(i.z)===1?di.x+=1e-4:di.z+=1e-4,di.normalize(),dn.crossVectors(i,di)),dn.normalize(),Er.crossVectors(di,dn),n[0]=dn.x,n[4]=Er.x,n[8]=di.x,n[1]=dn.y,n[5]=Er.y,n[9]=di.y,n[2]=dn.z,n[6]=Er.z,n[10]=di.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let i=t.elements,n=e.elements,s=this.elements,o=i[0],a=i[4],l=i[8],c=i[12],h=i[1],u=i[5],d=i[9],f=i[13],g=i[2],y=i[6],p=i[10],m=i[14],x=i[3],S=i[7],M=i[11],b=i[15],_=n[0],w=n[4],v=n[8],T=n[12],C=n[1],R=n[5],P=n[9],N=n[13],I=n[2],U=n[6],B=n[10],G=n[14],Q=n[3],F=n[7],$=n[11],K=n[15];return s[0]=o*_+a*C+l*I+c*Q,s[4]=o*w+a*R+l*U+c*F,s[8]=o*v+a*P+l*B+c*$,s[12]=o*T+a*N+l*G+c*K,s[1]=h*_+u*C+d*I+f*Q,s[5]=h*w+u*R+d*U+f*F,s[9]=h*v+u*P+d*B+f*$,s[13]=h*T+u*N+d*G+f*K,s[2]=g*_+y*C+p*I+m*Q,s[6]=g*w+y*R+p*U+m*F,s[10]=g*v+y*P+p*B+m*$,s[14]=g*T+y*N+p*G+m*K,s[3]=x*_+S*C+M*I+b*Q,s[7]=x*w+S*R+M*U+b*F,s[11]=x*v+S*P+M*B+b*$,s[15]=x*T+S*N+M*G+b*K,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],i=t[4],n=t[8],s=t[12],o=t[1],a=t[5],l=t[9],c=t[13],h=t[2],u=t[6],d=t[10],f=t[14],g=t[3],y=t[7],p=t[11],m=t[15],x=l*f-c*d,S=a*f-c*u,M=a*d-l*u,b=o*f-c*h,_=o*d-l*h,w=o*u-a*h;return e*(y*x-p*S+m*M)-i*(g*x-p*b+m*_)+n*(g*S-y*b+m*w)-s*(g*M-y*_+p*w)}determinantAffine(){let t=this.elements,e=t[0],i=t[4],n=t[8],s=t[1],o=t[5],a=t[9],l=t[2],c=t[6],h=t[10];return e*(o*h-a*c)-i*(s*h-a*l)+n*(s*c-o*l)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,i){let n=this.elements;return t.isVector3?(n[12]=t.x,n[13]=t.y,n[14]=t.z):(n[12]=t,n[13]=e,n[14]=i),this}invert(){let t=this.elements,e=t[0],i=t[1],n=t[2],s=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8],u=t[9],d=t[10],f=t[11],g=t[12],y=t[13],p=t[14],m=t[15],x=e*a-i*o,S=e*l-n*o,M=e*c-s*o,b=i*l-n*a,_=i*c-s*a,w=n*c-s*l,v=h*y-u*g,T=h*p-d*g,C=h*m-f*g,R=u*p-d*y,P=u*m-f*y,N=d*m-f*p,I=x*N-S*P+M*R+b*C-_*T+w*v;if(I===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let U=1/I;return t[0]=(a*N-l*P+c*R)*U,t[1]=(n*P-i*N-s*R)*U,t[2]=(y*w-p*_+m*b)*U,t[3]=(d*_-u*w-f*b)*U,t[4]=(l*C-o*N-c*T)*U,t[5]=(e*N-n*C+s*T)*U,t[6]=(p*M-g*w-m*S)*U,t[7]=(h*w-d*M+f*S)*U,t[8]=(o*P-a*C+c*v)*U,t[9]=(i*C-e*P-s*v)*U,t[10]=(g*_-y*M+m*x)*U,t[11]=(u*M-h*_-f*x)*U,t[12]=(a*T-o*R-l*v)*U,t[13]=(e*R-i*T+n*v)*U,t[14]=(y*S-g*b-p*x)*U,t[15]=(h*b-u*S+d*x)*U,this}scale(t){let e=this.elements,i=t.x,n=t.y,s=t.z;return e[0]*=i,e[4]*=n,e[8]*=s,e[1]*=i,e[5]*=n,e[9]*=s,e[2]*=i,e[6]*=n,e[10]*=s,e[3]*=i,e[7]*=n,e[11]*=s,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],i=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],n=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,i,n))}makeTranslation(t,e,i){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,i,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),i=Math.sin(t);return this.set(1,0,0,0,0,e,-i,0,0,i,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,0,i,0,0,1,0,0,-i,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,0,i,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let i=Math.cos(e),n=Math.sin(e),s=1-i,o=t.x,a=t.y,l=t.z,c=s*o,h=s*a;return this.set(c*o+i,c*a-n*l,c*l+n*a,0,c*a+n*l,h*a+i,h*l-n*o,0,c*l-n*a,h*l+n*o,s*l*l+i,0,0,0,0,1),this}makeScale(t,e,i){return this.set(t,0,0,0,0,e,0,0,0,0,i,0,0,0,0,1),this}makeShear(t,e,i,n,s,o){return this.set(1,i,s,0,t,1,o,0,e,n,1,0,0,0,0,1),this}compose(t,e,i){let n=this.elements,s=e._x,o=e._y,a=e._z,l=e._w,c=s+s,h=o+o,u=a+a,d=s*c,f=s*h,g=s*u,y=o*h,p=o*u,m=a*u,x=l*c,S=l*h,M=l*u,b=i.x,_=i.y,w=i.z;return n[0]=(1-(y+m))*b,n[1]=(f+M)*b,n[2]=(g-S)*b,n[3]=0,n[4]=(f-M)*_,n[5]=(1-(d+m))*_,n[6]=(p+x)*_,n[7]=0,n[8]=(g+S)*w,n[9]=(p-x)*w,n[10]=(1-(d+y))*w,n[11]=0,n[12]=t.x,n[13]=t.y,n[14]=t.z,n[15]=1,this}decompose(t,e,i){let n=this.elements;t.x=n[12],t.y=n[13],t.z=n[14];let s=this.determinantAffine();if(s===0)return i.set(1,1,1),e.identity(),this;let o=jn.set(n[0],n[1],n[2]).length(),a=jn.set(n[4],n[5],n[6]).length(),l=jn.set(n[8],n[9],n[10]).length();s<0&&(o=-o),Ei.copy(this);let c=1/o,h=1/a,u=1/l;return Ei.elements[0]*=c,Ei.elements[1]*=c,Ei.elements[2]*=c,Ei.elements[4]*=h,Ei.elements[5]*=h,Ei.elements[6]*=h,Ei.elements[8]*=u,Ei.elements[9]*=u,Ei.elements[10]*=u,e.setFromRotationMatrix(Ei),i.x=o,i.y=a,i.z=l,this}makePerspective(t,e,i,n,s,o,a=Ri,l=!1){let c=this.elements,h=2*s/(e-t),u=2*s/(i-n),d=(e+t)/(e-t),f=(i+n)/(i-n),g,y;if(l)g=s/(o-s),y=o*s/(o-s);else if(a===Ri)g=-(o+s)/(o-s),y=-2*o*s/(o-s);else if(a===ps)g=-o/(o-s),y=-o*s/(o-s);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=h,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=y,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,e,i,n,s,o,a=Ri,l=!1){let c=this.elements,h=2/(e-t),u=2/(i-n),d=-(e+t)/(e-t),f=-(i+n)/(i-n),g,y;if(l)g=1/(o-s),y=o/(o-s);else if(a===Ri)g=-2/(o-s),y=-(o+s)/(o-s);else if(a===ps)g=-1/(o-s),y=-s/(o-s);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=h,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=g,c[14]=y,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){let e=this.elements,i=t.elements;for(let n=0;n<16;n++)if(e[n]!==i[n])return!1;return!0}fromArray(t,e=0){for(let i=0;i<16;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){let i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t[e+9]=i[9],t[e+10]=i[10],t[e+11]=i[11],t[e+12]=i[12],t[e+13]=i[13],t[e+14]=i[14],t[e+15]=i[15],t}};Lo.prototype.isMatrix4=!0;var ge=Lo,jn=new O,Ei=new ge,fu=new O(0,0,0),pu=new O(1,1,1),dn=new O,Er=new O,di=new O,Xc=new ge,Yc=new fi,pi=class r{constructor(t=0,e=0,i=0,n=r.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=i,this._order=n}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,i,n=this._order){return this._x=t,this._y=e,this._z=i,this._order=n,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,i=!0){let n=t.elements,s=n[0],o=n[4],a=n[8],l=n[1],c=n[5],h=n[9],u=n[2],d=n[6],f=n[10];switch(e){case"XYZ":this._y=Math.asin(ce(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-o,s)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-ce(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,s),this._z=0);break;case"ZXY":this._x=Math.asin(ce(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,s));break;case"ZYX":this._y=Math.asin(-ce(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(l,s)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(ce(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,s)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-ce(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(a,s)):(this._x=Math.atan2(-h,f),this._y=0);break;default:Vt("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,i===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,i){return Xc.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Xc,e,i)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Yc.setFromEuler(this),this.setFromQuaternion(Yc,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};pi.DEFAULT_ORDER="XYZ";var xs=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},mu=0,qc=new O,ts=new fi,Ji=new ge,Tr=new O,Ps=new O,gu=new O,xu=new fi,$c=new O(1,0,0),Zc=new O(0,1,0),Qc=new O(0,0,1),Kc={type:"added"},yu={type:"removed"},es={type:"childadded",child:null},nl={type:"childremoved",child:null},Be=class r extends Gi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:mu++}),this.uuid=mr(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=r.DEFAULT_UP.clone();let t=new O,e=new pi,i=new fi,n=new O(1,1,1);function s(){i.setFromEuler(e,!1)}function o(){e.setFromQuaternion(i,void 0,!1)}e._onChange(s),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:n},modelViewMatrix:{value:new ge},normalMatrix:{value:new Zt}}),this.matrix=new ge,this.matrixWorld=new ge,this.matrixAutoUpdate=r.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=r.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new xs,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return ts.setFromAxisAngle(t,e),this.quaternion.multiply(ts),this}rotateOnWorldAxis(t,e){return ts.setFromAxisAngle(t,e),this.quaternion.premultiply(ts),this}rotateX(t){return this.rotateOnAxis($c,t)}rotateY(t){return this.rotateOnAxis(Zc,t)}rotateZ(t){return this.rotateOnAxis(Qc,t)}translateOnAxis(t,e){return qc.copy(t).applyQuaternion(this.quaternion),this.position.add(qc.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis($c,t)}translateY(t){return this.translateOnAxis(Zc,t)}translateZ(t){return this.translateOnAxis(Qc,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Ji.copy(this.matrixWorld).invert())}lookAt(t,e,i){t.isVector3?Tr.copy(t):Tr.set(t,e,i);let n=this.parent;this.updateWorldMatrix(!0,!1),Ps.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Ji.lookAt(Ps,Tr,this.up):Ji.lookAt(Tr,Ps,this.up),this.quaternion.setFromRotationMatrix(Ji),n&&(Ji.extractRotation(n.matrixWorld),ts.setFromRotationMatrix(Ji),this.quaternion.premultiply(ts.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(Xt("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Kc),es.child=t,this.dispatchEvent(es),es.child=null):Xt("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(yu),nl.child=t,this.dispatchEvent(nl),nl.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Ji.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Ji.multiply(t.parent.matrixWorld)),t.applyMatrix4(Ji),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Kc),es.child=t,this.dispatchEvent(es),es.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let i=0,n=this.children.length;i<n;i++){let o=this.children[i].getObjectByProperty(t,e);if(o!==void 0)return o}}getObjectsByProperty(t,e,i=[]){this[t]===e&&i.push(this);let n=this.children;for(let s=0,o=n.length;s<o;s++)n[s].getObjectsByProperty(t,e,i);return i}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ps,t,gu),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ps,xu,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(t){t(this);let e=this.children;for(let i=0,n=e.length;i<n;i++)e[i].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let i=0,n=e.length;i<n;i++)e[i].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let e=t.x,i=t.y,n=t.z,s=this.matrix.elements;s[12]+=e-s[0]*e-s[4]*i-s[8]*n,s[13]+=i-s[1]*e-s[5]*i-s[9]*n,s[14]+=n-s[2]*e-s[6]*i-s[10]*n}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let i=0,n=e.length;i<n;i++)e[i].updateMatrixWorld(t)}updateWorldMatrix(t,e,i=!1){let n=this.parent;if(t===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||i)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,i=!0),e===!0){let s=this.children;for(let o=0,a=s.length;o<a;o++)s[o].updateWorldMatrix(!1,!0,i)}}toJSON(t){let e=t===void 0||typeof t=="string",i={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let n={};n.uuid=this.uuid,n.type=this.type,n.name=this.name,n.castShadow=this.castShadow,n.receiveShadow=this.receiveShadow,n.visible=this.visible,n.frustumCulled=this.frustumCulled,n.renderOrder=this.renderOrder,n.static=this.static,n.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(n.userData=this.userData),n.layers=this.layers.mask,n.matrix=this.matrix.toArray(),n.up=this.up.toArray(),this.pivot!==null&&(n.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(n.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(n.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(n.type="InstancedMesh",n.count=this.count,n.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(n.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(n.type="BatchedMesh",n.perObjectFrustumCulled=this.perObjectFrustumCulled,n.sortObjects=this.sortObjects,n.drawRanges=this._drawRanges,n.reservedRanges=this._reservedRanges,n.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),n.instanceInfo=this._instanceInfo.map(a=>({...a})),n.availableInstanceIds=this._availableInstanceIds.slice(),n.availableGeometryIds=this._availableGeometryIds.slice(),n.nextIndexStart=this._nextIndexStart,n.nextVertexStart=this._nextVertexStart,n.geometryCount=this._geometryCount,n.maxInstanceCount=this._maxInstanceCount,n.maxVertexCount=this._maxVertexCount,n.maxIndexCount=this._maxIndexCount,n.geometryInitialized=this._geometryInitialized,n.matricesTexture=this._matricesTexture.toJSON(t),n.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(n.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(n.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(n.boundingBox=this.boundingBox.toJSON()));function s(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?n.background=this.background.toJSON():this.background.isTexture&&(n.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(n.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){n.geometry=s(t.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let u=l[c];s(t.shapes,u)}else s(t.shapes,l)}}if(this.isSkinnedMesh&&(n.bindMode=this.bindMode,n.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(s(t.skeletons,this.skeleton),n.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(s(t.materials,this.material[l]));n.material=a}else n.material=s(t.materials,this.material);if(this.children.length>0){n.children=[];for(let a=0;a<this.children.length;a++)n.children.push(this.children[a].toJSON(t).object)}if(this.animations.length>0){n.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];n.animations.push(s(t.animations,l))}}if(e){let a=o(t.geometries),l=o(t.materials),c=o(t.textures),h=o(t.images),u=o(t.shapes),d=o(t.skeletons),f=o(t.animations),g=o(t.nodes);a.length>0&&(i.geometries=a),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),h.length>0&&(i.images=h),u.length>0&&(i.shapes=u),d.length>0&&(i.skeletons=d),f.length>0&&(i.animations=f),g.length>0&&(i.nodes=g)}return i.object=n,i;function o(a){let l=[];for(let c in a){let h=a[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let i=0;i<t.children.length;i++){let n=t.children[i];this.add(n.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};Be.DEFAULT_UP=new O(0,1,0);Be.DEFAULT_MATRIX_AUTO_UPDATE=!0;Be.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var we=class extends Be{constructor(){super(),this.isGroup=!0,this.type="Group"}},vu={type:"move"},ys=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new we,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new we,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new O,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new O),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new we,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new O,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new O,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let i of t.hand.values())this._getHandJoint(e,i)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,i){let n=null,s=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){o=!0;for(let y of t.hand.values()){let p=e.getJointPose(y,i),m=this._getHandJoint(c,y);p!==null&&(m.matrix.fromArray(p.transform.matrix),m.matrix.decompose(m.position,m.rotation,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=p.radius),m.visible=p!==null}let h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],d=h.position.distanceTo(u.position),f=.02,g=.005;c.inputState.pinching&&d>f+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&d<=f-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(s=e.getPose(t.gripSpace,i),s!==null&&(l.matrix.fromArray(s.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,s.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(s.linearVelocity)):l.hasLinearVelocity=!1,s.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(s.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:t,target:this})));a!==null&&(n=e.getPose(t.targetRaySpace,i),n===null&&s!==null&&(n=s),n!==null&&(a.matrix.fromArray(n.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,n.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(n.linearVelocity)):a.hasLinearVelocity=!1,n.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(n.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(vu)))}return a!==null&&(a.visible=n!==null),l!==null&&(l.visible=s!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let i=new we;i.matrixAutoUpdate=!1,i.visible=!1,t.joints[e.jointName]=i,t.add(i)}return t.joints[e.jointName]}},id={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},un={h:0,s:0,l:0},Ar={h:0,s:0,l:0};function sl(r,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?r+(t-r)*6*e:e<1/2?t:e<2/3?r+(t-r)*6*(2/3-e):r}var dt=class{constructor(t,e,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,i)}set(t,e,i){if(e===void 0&&i===void 0){let n=t;n&&n.isColor?this.copy(n):typeof n=="number"?this.setHex(n):typeof n=="string"&&this.setStyle(n)}else this.setRGB(t,e,i);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=ni){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,le.colorSpaceToWorking(this,e),this}setRGB(t,e,i,n=le.workingColorSpace){return this.r=t,this.g=e,this.b=i,le.colorSpaceToWorking(this,n),this}setHSL(t,e,i,n=le.workingColorSpace){if(t=cu(t,1),e=ce(e,0,1),i=ce(i,0,1),e===0)this.r=this.g=this.b=i;else{let s=i<=.5?i*(1+e):i+e-i*e,o=2*i-s;this.r=sl(o,s,t+1/3),this.g=sl(o,s,t),this.b=sl(o,s,t-1/3)}return le.colorSpaceToWorking(this,n),this}setStyle(t,e=ni){function i(s){s!==void 0&&parseFloat(s)<1&&Vt("Color: Alpha component of "+t+" will be ignored.")}let n;if(n=/^(\w+)\(([^\)]*)\)/.exec(t)){let s,o=n[1],a=n[2];switch(o){case"rgb":case"rgba":if(s=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setRGB(Math.min(255,parseInt(s[1],10))/255,Math.min(255,parseInt(s[2],10))/255,Math.min(255,parseInt(s[3],10))/255,e);if(s=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setRGB(Math.min(100,parseInt(s[1],10))/100,Math.min(100,parseInt(s[2],10))/100,Math.min(100,parseInt(s[3],10))/100,e);break;case"hsl":case"hsla":if(s=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(s[4]),this.setHSL(parseFloat(s[1])/360,parseFloat(s[2])/100,parseFloat(s[3])/100,e);break;default:Vt("Color: Unknown color model "+t)}}else if(n=/^\#([A-Fa-f\d]+)$/.exec(t)){let s=n[1],o=s.length;if(o===3)return this.setRGB(parseInt(s.charAt(0),16)/15,parseInt(s.charAt(1),16)/15,parseInt(s.charAt(2),16)/15,e);if(o===6)return this.setHex(parseInt(s,16),e);Vt("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=ni){let i=id[t.toLowerCase()];return i!==void 0?this.setHex(i,e):Vt("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=sn(t.r),this.g=sn(t.g),this.b=sn(t.b),this}copyLinearToSRGB(t){return this.r=us(t.r),this.g=us(t.g),this.b=us(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=ni){return le.workingToColorSpace(je.copy(this),t),Math.round(ce(je.r*255,0,255))*65536+Math.round(ce(je.g*255,0,255))*256+Math.round(ce(je.b*255,0,255))}getHexString(t=ni){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=le.workingColorSpace){le.workingToColorSpace(je.copy(this),e);let i=je.r,n=je.g,s=je.b,o=Math.max(i,n,s),a=Math.min(i,n,s),l,c,h=(a+o)/2;if(a===o)l=0,c=0;else{let u=o-a;switch(c=h<=.5?u/(o+a):u/(2-o-a),o){case i:l=(n-s)/u+(n<s?6:0);break;case n:l=(s-i)/u+2;break;case s:l=(i-n)/u+4;break}l/=6}return t.h=l,t.s=c,t.l=h,t}getRGB(t,e=le.workingColorSpace){return le.workingToColorSpace(je.copy(this),e),t.r=je.r,t.g=je.g,t.b=je.b,t}getStyle(t=ni){le.workingToColorSpace(je.copy(this),t);let e=je.r,i=je.g,n=je.b;return t!==ni?`color(${t} ${e.toFixed(3)} ${i.toFixed(3)} ${n.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(i*255)},${Math.round(n*255)})`}offsetHSL(t,e,i){return this.getHSL(un),this.setHSL(un.h+t,un.s+e,un.l+i)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,i){return this.r=t.r+(e.r-t.r)*i,this.g=t.g+(e.g-t.g)*i,this.b=t.b+(e.b-t.b)*i,this}lerpHSL(t,e){this.getHSL(un),t.getHSL(Ar);let i=Ja(un.h,Ar.h,e),n=Ja(un.s,Ar.s,e),s=Ja(un.l,Ar.l,e);return this.setHSL(i,n,s),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,i=this.g,n=this.b,s=t.elements;return this.r=s[0]*e+s[3]*i+s[6]*n,this.g=s[1]*e+s[4]*i+s[7]*n,this.b=s[2]*e+s[5]*i+s[8]*n,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},je=new dt;dt.NAMES=id;var Vs=class extends Be{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new pi,this.environmentIntensity=1,this.environmentRotation=new pi,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),e.object.backgroundBlurriness=this.backgroundBlurriness,e.object.backgroundIntensity=this.backgroundIntensity,e.object.backgroundRotation=this.backgroundRotation.toArray(),e.object.environmentIntensity=this.environmentIntensity,e.object.environmentRotation=this.environmentRotation.toArray(),e}},Ti=new O,ji=new O,rl=new O,tn=new O,is=new O,ns=new O,Jc=new O,ol=new O,al=new O,ll=new O,cl=new De,hl=new De,dl=new De,gn=class r{constructor(t=new O,e=new O,i=new O){this.a=t,this.b=e,this.c=i}static getNormal(t,e,i,n){n.subVectors(i,e),Ti.subVectors(t,e),n.cross(Ti);let s=n.lengthSq();return s>0?n.multiplyScalar(1/Math.sqrt(s)):n.set(0,0,0)}static getBarycoord(t,e,i,n,s){Ti.subVectors(n,e),ji.subVectors(i,e),rl.subVectors(t,e);let o=Ti.dot(Ti),a=Ti.dot(ji),l=Ti.dot(rl),c=ji.dot(ji),h=ji.dot(rl),u=o*c-a*a;if(u===0)return s.set(0,0,0),null;let d=1/u,f=(c*l-a*h)*d,g=(o*h-a*l)*d;return s.set(1-f-g,g,f)}static containsPoint(t,e,i,n){return this.getBarycoord(t,e,i,n,tn)===null?!1:tn.x>=0&&tn.y>=0&&tn.x+tn.y<=1}static getInterpolation(t,e,i,n,s,o,a,l){return this.getBarycoord(t,e,i,n,tn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(s,tn.x),l.addScaledVector(o,tn.y),l.addScaledVector(a,tn.z),l)}static getInterpolatedAttribute(t,e,i,n,s,o){return cl.setScalar(0),hl.setScalar(0),dl.setScalar(0),cl.fromBufferAttribute(t,e),hl.fromBufferAttribute(t,i),dl.fromBufferAttribute(t,n),o.setScalar(0),o.addScaledVector(cl,s.x),o.addScaledVector(hl,s.y),o.addScaledVector(dl,s.z),o}static isFrontFacing(t,e,i,n){return Ti.subVectors(i,e),ji.subVectors(t,e),Ti.cross(ji).dot(n)<0}set(t,e,i){return this.a.copy(t),this.b.copy(e),this.c.copy(i),this}setFromPointsAndIndices(t,e,i,n){return this.a.copy(t[e]),this.b.copy(t[i]),this.c.copy(t[n]),this}setFromAttributeAndIndices(t,e,i,n){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,i),this.c.fromBufferAttribute(t,n),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return Ti.subVectors(this.c,this.b),ji.subVectors(this.a,this.b),Ti.cross(ji).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return r.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return r.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,i,n,s){return r.getInterpolation(t,this.a,this.b,this.c,e,i,n,s)}containsPoint(t){return r.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return r.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let i=this.a,n=this.b,s=this.c,o,a;is.subVectors(n,i),ns.subVectors(s,i),ol.subVectors(t,i);let l=is.dot(ol),c=ns.dot(ol);if(l<=0&&c<=0)return e.copy(i);al.subVectors(t,n);let h=is.dot(al),u=ns.dot(al);if(h>=0&&u<=h)return e.copy(n);let d=l*u-h*c;if(d<=0&&l>=0&&h<=0)return o=l/(l-h),e.copy(i).addScaledVector(is,o);ll.subVectors(t,s);let f=is.dot(ll),g=ns.dot(ll);if(g>=0&&f<=g)return e.copy(s);let y=f*c-l*g;if(y<=0&&c>=0&&g<=0)return a=c/(c-g),e.copy(i).addScaledVector(ns,a);let p=h*g-f*u;if(p<=0&&u-h>=0&&f-g>=0)return Jc.subVectors(s,n),a=(u-h)/(u-h+(f-g)),e.copy(n).addScaledVector(Jc,a);let m=1/(p+y+d);return o=y*m,a=d*m,e.copy(i).addScaledVector(is,o).addScaledVector(ns,a)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},Vi=class{constructor(t=new O(1/0,1/0,1/0),e=new O(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e+=3)this.expandByPoint(Ai.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,i=t.count;e<i;e++)this.expandByPoint(Ai.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let i=Ai.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(i),this.max.copy(t).add(i),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let i=t.geometry;if(i!==void 0){let s=i.getAttribute("position");if(e===!0&&s!==void 0&&t.isInstancedMesh!==!0)for(let o=0,a=s.count;o<a;o++)t.isMesh===!0?t.getVertexPosition(o,Ai):Ai.fromBufferAttribute(s,o),Ai.applyMatrix4(t.matrixWorld),this.expandByPoint(Ai);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Cr.copy(t.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),Cr.copy(i.boundingBox)),Cr.applyMatrix4(t.matrixWorld),this.union(Cr)}let n=t.children;for(let s=0,o=n.length;s<o;s++)this.expandByObject(n[s],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,Ai),Ai.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,i;return t.normal.x>0?(e=t.normal.x*this.min.x,i=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,i=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,i+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,i+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,i+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,i+=t.normal.z*this.min.z),e<=-t.constant&&i>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Ls),Rr.subVectors(this.max,Ls),ss.subVectors(t.a,Ls),rs.subVectors(t.b,Ls),os.subVectors(t.c,Ls),fn.subVectors(rs,ss),pn.subVectors(os,rs),Nn.subVectors(ss,os);let e=[0,-fn.z,fn.y,0,-pn.z,pn.y,0,-Nn.z,Nn.y,fn.z,0,-fn.x,pn.z,0,-pn.x,Nn.z,0,-Nn.x,-fn.y,fn.x,0,-pn.y,pn.x,0,-Nn.y,Nn.x,0];return!ul(e,ss,rs,os,Rr)||(e=[1,0,0,0,1,0,0,0,1],!ul(e,ss,rs,os,Rr))?!1:(Ir.crossVectors(fn,pn),e=[Ir.x,Ir.y,Ir.z],ul(e,ss,rs,os,Rr))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,Ai).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(Ai).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(en[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),en[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),en[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),en[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),en[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),en[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),en[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),en[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(en),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}},en=[new O,new O,new O,new O,new O,new O,new O,new O],Ai=new O,Cr=new Vi,ss=new O,rs=new O,os=new O,fn=new O,pn=new O,Nn=new O,Ls=new O,Rr=new O,Ir=new O,Fn=new O;function ul(r,t,e,i,n){for(let s=0,o=r.length-3;s<=o;s+=3){Fn.fromArray(r,s);let a=n.x*Math.abs(Fn.x)+n.y*Math.abs(Fn.y)+n.z*Math.abs(Fn.z),l=t.dot(Fn),c=e.dot(Fn),h=i.dot(Fn);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>a)return!1}return!0}var Oe=new O,Pr=new Kt,Mu=0,te=class extends Gi{constructor(t,e,i=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Mu++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=i,this.usage=Kh,this.updateRanges=[],this.gpuType=Si,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,i){t*=this.itemSize,i*=e.itemSize;for(let n=0,s=this.itemSize;n<s;n++)this.array[t+n]=e.array[i+n];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,i=this.count;e<i;e++)Pr.fromBufferAttribute(this,e),Pr.applyMatrix3(t),this.setXY(e,Pr.x,Pr.y);else if(this.itemSize===3)for(let e=0,i=this.count;e<i;e++)Oe.fromBufferAttribute(this,e),Oe.applyMatrix3(t),this.setXYZ(e,Oe.x,Oe.y,Oe.z);return this}applyMatrix4(t){for(let e=0,i=this.count;e<i;e++)Oe.fromBufferAttribute(this,e),Oe.applyMatrix4(t),this.setXYZ(e,Oe.x,Oe.y,Oe.z);return this}applyNormalMatrix(t){for(let e=0,i=this.count;e<i;e++)Oe.fromBufferAttribute(this,e),Oe.applyNormalMatrix(t),this.setXYZ(e,Oe.x,Oe.y,Oe.z);return this}transformDirection(t){for(let e=0,i=this.count;e<i;e++)Oe.fromBufferAttribute(this,e),Oe.transformDirection(t),this.setXYZ(e,Oe.x,Oe.y,Oe.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let i=this.array[t*this.itemSize+e];return this.normalized&&(i=Is(i,this.array)),i}setComponent(t,e,i){return this.normalized&&(i=li(i,this.array)),this.array[t*this.itemSize+e]=i,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=Is(e,this.array)),e}setX(t,e){return this.normalized&&(e=li(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=Is(e,this.array)),e}setY(t,e){return this.normalized&&(e=li(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=Is(e,this.array)),e}setZ(t,e){return this.normalized&&(e=li(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=Is(e,this.array)),e}setW(t,e){return this.normalized&&(e=li(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,i){return t*=this.itemSize,this.normalized&&(e=li(e,this.array),i=li(i,this.array)),this.array[t+0]=e,this.array[t+1]=i,this}setXYZ(t,e,i,n){return t*=this.itemSize,this.normalized&&(e=li(e,this.array),i=li(i,this.array),n=li(n,this.array)),this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=n,this}setXYZW(t,e,i,n,s){return t*=this.itemSize,this.normalized&&(e=li(e,this.array),i=li(i,this.array),n=li(n,this.array),s=li(s,this.array)),this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=n,this.array[t+3]=s,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return t.name=this.name,t.usage=this.usage,t.gpuType=this.gpuType,t}dispose(){this.dispatchEvent({type:"dispose"})}};var Ws=class extends te{constructor(t,e,i){super(new Uint16Array(t),e,i)}};var Xs=class extends te{constructor(t,e,i){super(new Uint32Array(t),e,i)}};var re=class extends te{constructor(t,e,i){super(new Float32Array(t),e,i)}},_u=new Vi,Ds=new O,fl=new O,Wi=class{constructor(t=new O,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let i=this.center;e!==void 0?i.copy(e):_u.setFromPoints(t).getCenter(i);let n=0;for(let s=0,o=t.length;s<o;s++)n=Math.max(n,i.distanceToSquared(t[s]));return this.radius=Math.sqrt(n),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let i=this.center.distanceToSquared(t);return e.copy(t),i>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Ds.subVectors(t,this.center);let e=Ds.lengthSq();if(e>this.radius*this.radius){let i=Math.sqrt(e),n=(i-this.radius)*.5;this.center.addScaledVector(Ds,n/i),this.radius+=n}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(fl.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Ds.copy(t.center).add(fl)),this.expandByPoint(Ds.copy(t.center).sub(fl))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}},Su=0,yi=new ge,pl=new Be,as=new O,ui=new Vi,Ns=new Vi,Ye=new O,me=class r extends Gi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Su++}),this.uuid=mr(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(au(t)?Xs:Ws)(t,1):this.index=t,this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,i=0){this.groups.push({start:t,count:e,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let s=new Zt().getNormalMatrix(t);i.applyNormalMatrix(s),i.needsUpdate=!0}let n=this.attributes.tangent;return n!==void 0&&(n.transformDirection(t),n.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return yi.makeRotationFromQuaternion(t),this.applyMatrix4(yi),this}rotateX(t){return yi.makeRotationX(t),this.applyMatrix4(yi),this}rotateY(t){return yi.makeRotationY(t),this.applyMatrix4(yi),this}rotateZ(t){return yi.makeRotationZ(t),this.applyMatrix4(yi),this}translate(t,e,i){return yi.makeTranslation(t,e,i),this.applyMatrix4(yi),this}scale(t,e,i){return yi.makeScale(t,e,i),this.applyMatrix4(yi),this}lookAt(t){return pl.lookAt(t),pl.updateMatrix(),this.applyMatrix4(pl.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(as).negate(),this.translate(as.x,as.y,as.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let i=[];for(let n=0,s=t.length;n<s;n++){let o=t[n];i.push(o.x,o.y,o.z||0)}this.setAttribute("position",new re(i,3))}else{let i=Math.min(t.length,e.count);for(let n=0;n<i;n++){let s=t[n];e.setXYZ(n,s.x,s.y,s.z||0)}t.length>e.count&&Vt("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Vi);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Xt("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new O(-1/0,-1/0,-1/0),new O(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let i=0,n=e.length;i<n;i++){let s=e[i];ui.setFromBufferAttribute(s),this.morphTargetsRelative?(Ye.addVectors(this.boundingBox.min,ui.min),this.boundingBox.expandByPoint(Ye),Ye.addVectors(this.boundingBox.max,ui.max),this.boundingBox.expandByPoint(Ye)):(this.boundingBox.expandByPoint(ui.min),this.boundingBox.expandByPoint(ui.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Xt('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Wi);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Xt("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new O,1/0);return}if(t){let i=this.boundingSphere.center;if(ui.setFromBufferAttribute(t),e)for(let s=0,o=e.length;s<o;s++){let a=e[s];Ns.setFromBufferAttribute(a),this.morphTargetsRelative?(Ye.addVectors(ui.min,Ns.min),ui.expandByPoint(Ye),Ye.addVectors(ui.max,Ns.max),ui.expandByPoint(Ye)):(ui.expandByPoint(Ns.min),ui.expandByPoint(Ns.max))}ui.getCenter(i);let n=0;for(let s=0,o=t.count;s<o;s++)Ye.fromBufferAttribute(t,s),n=Math.max(n,i.distanceToSquared(Ye));if(e)for(let s=0,o=e.length;s<o;s++){let a=e[s],l=this.morphTargetsRelative;for(let c=0,h=a.count;c<h;c++)Ye.fromBufferAttribute(a,c),l&&(as.fromBufferAttribute(t,c),Ye.add(as)),n=Math.max(n,i.distanceToSquared(Ye))}this.boundingSphere.radius=Math.sqrt(n),isNaN(this.boundingSphere.radius)&&Xt('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){Xt("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=e.position,n=e.normal,s=e.uv,o=this.getAttribute("tangent");(o===void 0||o.count!==i.count)&&(o=new te(new Float32Array(4*i.count),4),this.setAttribute("tangent",o));let a=[],l=[];for(let v=0;v<i.count;v++)a[v]=new O,l[v]=new O;let c=new O,h=new O,u=new O,d=new Kt,f=new Kt,g=new Kt,y=new O,p=new O;function m(v,T,C){c.fromBufferAttribute(i,v),h.fromBufferAttribute(i,T),u.fromBufferAttribute(i,C),d.fromBufferAttribute(s,v),f.fromBufferAttribute(s,T),g.fromBufferAttribute(s,C),h.sub(c),u.sub(c),f.sub(d),g.sub(d);let R=1/(f.x*g.y-g.x*f.y);isFinite(R)&&(y.copy(h).multiplyScalar(g.y).addScaledVector(u,-f.y).multiplyScalar(R),p.copy(u).multiplyScalar(f.x).addScaledVector(h,-g.x).multiplyScalar(R),a[v].add(y),a[T].add(y),a[C].add(y),l[v].add(p),l[T].add(p),l[C].add(p))}let x=this.groups;x.length===0&&(x=[{start:0,count:t.count}]);for(let v=0,T=x.length;v<T;++v){let C=x[v],R=C.start,P=C.count;for(let N=R,I=R+P;N<I;N+=3)m(t.getX(N+0),t.getX(N+1),t.getX(N+2))}let S=new O,M=new O,b=new O,_=new O;function w(v){b.fromBufferAttribute(n,v),_.copy(b);let T=a[v];S.copy(T),S.sub(b.multiplyScalar(b.dot(T))).normalize(),M.crossVectors(_,T);let R=M.dot(l[v])<0?-1:1;o.setXYZW(v,S.x,S.y,S.z,R)}for(let v=0,T=x.length;v<T;++v){let C=x[v],R=C.start,P=C.count;for(let N=R,I=R+P;N<I;N+=3)w(t.getX(N+0)),w(t.getX(N+1)),w(t.getX(N+2))}this._transformed=!0}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==e.count)i=new te(new Float32Array(e.count*3),3),this.setAttribute("normal",i);else for(let d=0,f=i.count;d<f;d++)i.setXYZ(d,0,0,0);let n=new O,s=new O,o=new O,a=new O,l=new O,c=new O,h=new O,u=new O;if(t)for(let d=0,f=t.count;d<f;d+=3){let g=t.getX(d+0),y=t.getX(d+1),p=t.getX(d+2);n.fromBufferAttribute(e,g),s.fromBufferAttribute(e,y),o.fromBufferAttribute(e,p),h.subVectors(o,s),u.subVectors(n,s),h.cross(u),a.fromBufferAttribute(i,g),l.fromBufferAttribute(i,y),c.fromBufferAttribute(i,p),a.add(h),l.add(h),c.add(h),i.setXYZ(g,a.x,a.y,a.z),i.setXYZ(y,l.x,l.y,l.z),i.setXYZ(p,c.x,c.y,c.z)}else for(let d=0,f=e.count;d<f;d+=3)n.fromBufferAttribute(e,d+0),s.fromBufferAttribute(e,d+1),o.fromBufferAttribute(e,d+2),h.subVectors(o,s),u.subVectors(n,s),h.cross(u),i.setXYZ(d+0,h.x,h.y,h.z),i.setXYZ(d+1,h.x,h.y,h.z),i.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,i=t.count;e<i;e++)Ye.fromBufferAttribute(t,e),Ye.normalize(),t.setXYZ(e,Ye.x,Ye.y,Ye.z)}toNonIndexed(){function t(a,l){let c=a.array,h=a.itemSize,u=a.normalized,d=new c.constructor(l.length*h),f=0,g=0;for(let y=0,p=l.length;y<p;y++){a.isInterleavedBufferAttribute?f=l[y]*a.data.stride+a.offset:f=l[y]*h;for(let m=0;m<h;m++)d[g++]=c[f++]}return new te(d,h,u)}if(this.index===null)return Vt("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new r,i=this.index.array,n=this.attributes;for(let a in n){let l=n[a],c=t(l,i);e.setAttribute(a,c)}let s=this.morphAttributes;for(let a in s){let l=[],c=s[a];for(let h=0,u=c.length;h<u;h++){let d=c[h],f=t(d,i);l.push(f)}e.morphAttributes[a]=l}e.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let i=this.attributes;for(let l in i){let c=i[l];t.data.attributes[l]=c.toJSON(t.data)}let n={},s=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let u=0,d=c.length;u<d;u++){let f=c[u];h.push(f.toJSON(t.data))}h.length>0&&(n[l]=h,s=!0)}s&&(t.data.morphAttributes=n,t.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(t.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(t.data.boundingSphere=a.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let i=t.index;i!==null&&this.setIndex(i.clone());let n=t.attributes;for(let c in n){let h=n[c];this.setAttribute(c,h.clone(e))}let s=t.morphAttributes;for(let c in s){let h=[],u=s[c];for(let d=0,f=u.length;d<f;d++)h.push(u[d].clone(e));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;let o=t.groups;for(let c=0,h=o.length;c<h;c++){let u=o[c];this.addGroup(u.start,u.count,u.materialIndex)}let a=t.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var ml=new O,bu=new O,wu=new Zt,Ci=class{constructor(t=new O(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,i,n){return this.normal.set(t,e,i),this.constant=n,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,i){let n=ml.subVectors(i,e).cross(bu.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(n,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e,i=!0){let n=t.delta(ml),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let o=-(t.start.dot(this.normal)+this.constant)/s;return i===!0&&(o<0||o>1)?null:e.copy(t.start).addScaledVector(n,o)}intersectsLine(t){let e=this.distanceToPoint(t.start),i=this.distanceToPoint(t.end);return e<0&&i>0||i<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let i=e||wu.getNormalMatrix(t),n=this.coplanarPoint(ml).applyMatrix4(t),s=this.normal.applyMatrix3(i).normalize();return this.constant=-n.dot(s),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(t){return this.normal.fromArray(t.normal),this.constant=t.constant,this}},Eu=0,vi=class extends Gi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Eu++}),this.uuid=mr(),this.name="",this.type="Material",this.blending=wn,this.side=Ii,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Nl,this.blendDst=Fl,this.blendEquation=Xn,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new dt(0,0,0),this.blendAlpha=0,this.depthFunc=fs,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Wh,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Qr,this.stencilZFail=Qr,this.stencilZPass=Qr,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let i=t[e];if(i===void 0){Vt(`Material: parameter '${e}' has value of undefined.`);continue}let n=this[e];if(n===void 0){Vt(`Material: '${e}' is not a property of THREE.${this.type}.`);continue}n&&n.isColor?n.set(i):n&&n.isVector2&&i&&i.isVector2||n&&n.isEuler&&i&&i.isEuler||n&&n.isVector3&&i&&i.isVector3?n.copy(i):this[e]=i}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,i.blending=this.blending,i.side=this.side,i.shadowSide=this.shadowSide,i.vertexColors=this.vertexColors,i.opacity=this.opacity,i.transparent=this.transparent,i.blendSrc=this.blendSrc,i.blendDst=this.blendDst,i.blendEquation=this.blendEquation,i.blendSrcAlpha=this.blendSrcAlpha,i.blendDstAlpha=this.blendDstAlpha,i.blendEquationAlpha=this.blendEquationAlpha,i.blendColor=this.blendColor.getHex(),i.blendAlpha=this.blendAlpha,i.depthFunc=this.depthFunc,i.depthTest=this.depthTest,i.depthWrite=this.depthWrite,i.colorWrite=this.colorWrite,i.clipIntersection=this.clipIntersection,i.clipShadows=this.clipShadows,i.stencilWriteMask=this.stencilWriteMask,i.stencilFunc=this.stencilFunc,i.stencilRef=this.stencilRef,i.stencilFuncMask=this.stencilFuncMask,i.stencilFail=this.stencilFail,i.stencilZFail=this.stencilZFail,i.stencilZPass=this.stencilZPass,i.stencilWrite=this.stencilWrite,i.polygonOffset=this.polygonOffset,i.polygonOffsetFactor=this.polygonOffsetFactor,i.polygonOffsetUnits=this.polygonOffsetUnits,i.dithering=this.dithering,i.alphaTest=this.alphaTest,i.alphaHash=this.alphaHash,i.alphaToCoverage=this.alphaToCoverage,i.premultipliedAlpha=this.premultipliedAlpha,i.forceSinglePass=this.forceSinglePass,i.allowOverride=this.allowOverride,i.visible=this.visible,i.toneMapped=this.toneMapped,i.name=this.name,this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(i.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(t).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(t).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(t).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(t).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(t).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(i.clippingPlanes=this.clippingPlanes.map(s=>s.toJSON())),this.rotation!==void 0&&(i.rotation=this.rotation),this.depthPacking!==void 0&&(i.depthPacking=this.depthPacking),this.linewidth!==void 0&&(i.linewidth=this.linewidth),this.linecap!==void 0&&(i.linecap=this.linecap),this.linejoin!==void 0&&(i.linejoin=this.linejoin),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.wireframe!==void 0&&(i.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(i.flatShading=this.flatShading),this.fog!==void 0&&(i.fog=this.fog),Object.keys(this.userData).length>0&&(i.userData=this.userData);function n(s){let o=[];for(let a in s){let l=s[a];delete l.metadata,o.push(l)}return o}if(e){let s=n(t.textures),o=n(t.images);s.length>0&&(i.textures=s),o.length>0&&(i.images=o)}return i}fromJSON(t,e){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new dt().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.retroreflectivity!==void 0&&(this.retroreflectivity=t.retroreflectivity),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=t.iridescenceThicknessRange),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.clippingPlanes!==void 0&&(this.clippingPlanes=t.clippingPlanes.map(i=>new Ci().fromJSON(i))),t.clipIntersection!==void 0&&(this.clipIntersection=t.clipIntersection),t.clipShadows!==void 0&&(this.clipShadows=t.clipShadows),t.depthPacking!==void 0&&(this.depthPacking=t.depthPacking),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.linecap!==void 0&&(this.linecap=t.linecap),t.linejoin!==void 0&&(this.linejoin=t.linejoin),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=e[t.map]||null),t.matcap!==void 0&&(this.matcap=e[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=e[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=e[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=e[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let i=t.normalScale;Array.isArray(i)===!1&&(i=[i,i]),this.normalScale=new Kt().fromArray(i)}return t.displacementMap!==void 0&&(this.displacementMap=e[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=e[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=e[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=e[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=e[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=e[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=e[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=e[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=e[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=e[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=e[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=e[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=e[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=e[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Kt().fromArray(t.clearcoatNormalScale)),t.iridescenceMap!==void 0&&(this.iridescenceMap=e[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=e[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=e[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=e[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=e[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=e[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=e[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,i=null;if(e!==null){let n=e.length;i=new Array(n);for(let s=0;s!==n;++s)i[s]=e[s].clone()}return this.clippingPlanes=i,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}};var nn=new O,gl=new O,Lr=new O,Dr=new O,On=class{constructor(t=new O,e=new O(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,nn)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let i=e.dot(this.direction);return i<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=nn.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(nn.copy(this.origin).addScaledVector(this.direction,e),nn.distanceToSquared(t))}distanceSqToSegment(t,e,i,n){gl.copy(t).add(e).multiplyScalar(.5),Lr.copy(e).sub(t).normalize(),Dr.copy(this.origin).sub(gl);let s=t.distanceTo(e)*.5,o=-this.direction.dot(Lr),a=Dr.dot(this.direction),l=-Dr.dot(Lr),c=Dr.lengthSq(),h=Math.abs(1-o*o),u,d,f,g;if(h>0)if(u=o*l-a,d=o*a-l,g=s*h,u>=0)if(d>=-g)if(d<=g){let y=1/h;u*=y,d*=y,f=u*(u+o*d+2*a)+d*(o*u+d+2*l)+c}else d=s,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;else d=-s,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;else d<=-g?(u=Math.max(0,-(-o*s+a)),d=u>0?-s:Math.min(Math.max(-s,-l),s),f=-u*u+d*(d+2*l)+c):d<=g?(u=0,d=Math.min(Math.max(-s,-l),s),f=d*(d+2*l)+c):(u=Math.max(0,-(o*s+a)),d=u>0?s:Math.min(Math.max(-s,-l),s),f=-u*u+d*(d+2*l)+c);else d=o>0?-s:s,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,u),n&&n.copy(gl).addScaledVector(Lr,d),f}intersectSphere(t,e){if(t.radius<0)return null;nn.subVectors(t.center,this.origin);let i=nn.dot(this.direction),n=nn.dot(nn)-i*i,s=t.radius*t.radius;if(n>s)return null;let o=Math.sqrt(s-n),a=i-o,l=i+o;return l<0?null:a<0?this.at(l,e):this.at(a,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(t.normal)+t.constant)/e;return i>=0?i:null}intersectPlane(t,e){let i=this.distanceToPlane(t);return i===null?null:this.at(i,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let i,n,s,o,a,l,c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(i=(t.min.x-d.x)*c,n=(t.max.x-d.x)*c):(i=(t.max.x-d.x)*c,n=(t.min.x-d.x)*c),h>=0?(s=(t.min.y-d.y)*h,o=(t.max.y-d.y)*h):(s=(t.max.y-d.y)*h,o=(t.min.y-d.y)*h),i>o||s>n||((s>i||isNaN(i))&&(i=s),(o<n||isNaN(n))&&(n=o),u>=0?(a=(t.min.z-d.z)*u,l=(t.max.z-d.z)*u):(a=(t.max.z-d.z)*u,l=(t.min.z-d.z)*u),i>l||a>n)||((a>i||i!==i)&&(i=a),(l<n||n!==n)&&(n=l),n<0)?null:this.at(i>=0?i:n,e)}intersectsBox(t){return this.intersectBox(t,nn)!==null}intersectTriangle(t,e,i,n,s){let o=this.origin,a=this.direction,l=a.x,c=a.y,h=a.z,u=t.x-o.x,d=t.y-o.y,f=t.z-o.z,g=e.x-o.x,y=e.y-o.y,p=e.z-o.z,m=i.x-o.x,x=i.y-o.y,S=i.z-o.z,M=Math.abs(l),b=Math.abs(c),_=Math.abs(h),w,v,T,C,R,P,N,I,U,B,G,Q;if(M>=b&&M>=_?(T=l,P=u,U=g,Q=m,l>=0?(w=c,v=h,C=d,R=f,N=y,I=p,B=x,G=S):(w=h,v=c,C=f,R=d,N=p,I=y,B=S,G=x)):b>=_?(T=c,P=d,U=y,Q=x,c>=0?(w=h,v=l,C=f,R=u,N=p,I=g,B=S,G=m):(w=l,v=h,C=u,R=f,N=g,I=p,B=m,G=S)):(T=h,P=f,U=p,Q=S,h>=0?(w=l,v=c,C=u,R=d,N=g,I=y,B=m,G=x):(w=c,v=l,C=d,R=u,N=y,I=g,B=x,G=m)),T===0)return null;let F=w/T,$=v/T,K=1/T,at=C-F*P,rt=R-$*P,It=N-F*U,ut=I-$*U,Pt=B-F*Q,q=G-$*Q,Z=Pt*ut-q*It,ct=at*q-rt*Pt,vt=It*rt-ut*at;if(n){if(Z<0||ct<0||vt<0)return null}else if((Z<0||ct<0||vt<0)&&(Z>0||ct>0||vt>0))return null;let lt=Z+ct+vt;if(lt===0)return null;let Ht=K*(Z*P+ct*U+vt*Q);return(lt>0?Ht<0:Ht>0)?null:this.at(Ht/lt,s)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Se=class extends vi{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new dt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new pi,this.combine=or,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}},jc=new ge,Un=new On,Nr=new Wi,th=new O,Fr=new O,Ur=new O,Br=new O,xl=new O,zr=new O,eh=new O,kr=new O,Mt=class extends Be{constructor(t=new me,e=new Se){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){let n=e[i[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=n.length;s<o;s++){let a=n[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}getVertexPosition(t,e){let i=this.geometry,n=i.attributes.position,s=i.morphAttributes.position,o=i.morphTargetsRelative;e.fromBufferAttribute(n,t);let a=this.morphTargetInfluences;if(s&&a){zr.set(0,0,0);for(let l=0,c=s.length;l<c;l++){let h=a[l],u=s[l];h!==0&&(xl.fromBufferAttribute(u,t),o?zr.addScaledVector(xl,h):zr.addScaledVector(xl.sub(e),h))}e.add(zr)}return e}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let i=this.geometry,n=this.material,s=this.matrixWorld;n!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Nr.copy(i.boundingSphere),Nr.applyMatrix4(s),Un.copy(t.ray).recast(t.near),!(Nr.containsPoint(Un.origin)===!1&&(Un.intersectSphere(Nr,th)===null||Un.origin.distanceToSquared(th)>(t.far-t.near)**2))&&(jc.copy(s).invert(),Un.copy(t.ray).applyMatrix4(jc),!(i.boundingBox!==null&&Un.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(t,e,Un)))}_computeIntersections(t,e,i){let n,s=this.geometry,o=this.material,a=s.index,l=s.attributes.position,c=s.attributes.uv,h=s.attributes.uv1,u=s.attributes.normal,d=s.groups,f=s.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,y=d.length;g<y;g++){let p=d[g],m=o[p.materialIndex],x=Math.max(p.start,f.start),S=Math.min(a.count,Math.min(p.start+p.count,f.start+f.count));for(let M=x,b=S;M<b;M+=3){let _=a.getX(M),w=a.getX(M+1),v=a.getX(M+2);n=Or(this,m,t,i,c,h,u,_,w,v),n&&(n.faceIndex=Math.floor(M/3),n.face.materialIndex=p.materialIndex,e.push(n))}}else{let g=Math.max(0,f.start),y=Math.min(a.count,f.start+f.count);for(let p=g,m=y;p<m;p+=3){let x=a.getX(p),S=a.getX(p+1),M=a.getX(p+2);n=Or(this,o,t,i,c,h,u,x,S,M),n&&(n.faceIndex=Math.floor(p/3),e.push(n))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,y=d.length;g<y;g++){let p=d[g],m=o[p.materialIndex],x=Math.max(p.start,f.start),S=Math.min(l.count,Math.min(p.start+p.count,f.start+f.count));for(let M=x,b=S;M<b;M+=3){let _=M,w=M+1,v=M+2;n=Or(this,m,t,i,c,h,u,_,w,v),n&&(n.faceIndex=Math.floor(M/3),n.face.materialIndex=p.materialIndex,e.push(n))}}else{let g=Math.max(0,f.start),y=Math.min(l.count,f.start+f.count);for(let p=g,m=y;p<m;p+=3){let x=p,S=p+1,M=p+2;n=Or(this,o,t,i,c,h,u,x,S,M),n&&(n.faceIndex=Math.floor(p/3),e.push(n))}}}};function Tu(r,t,e,i,n,s,o,a){let l;if(t.side===Ze?l=i.intersectTriangle(o,s,n,!0,a):l=i.intersectTriangle(n,s,o,t.side===Ii,a),l===null)return null;kr.copy(a),kr.applyMatrix4(r.matrixWorld);let c=e.ray.origin.distanceTo(kr);return c<e.near||c>e.far?null:{distance:c,point:kr.clone(),object:r}}function Or(r,t,e,i,n,s,o,a,l,c){r.getVertexPosition(a,Fr),r.getVertexPosition(l,Ur),r.getVertexPosition(c,Br);let h=Tu(r,t,e,i,Fr,Ur,Br,eh);if(h){let u=new O;gn.getBarycoord(eh,Fr,Ur,Br,u),n&&(h.uv=gn.getInterpolatedAttribute(n,a,l,c,u,new Kt)),s&&(h.uv1=gn.getInterpolatedAttribute(s,a,l,c,u,new Kt)),o&&(h.normal=gn.getInterpolatedAttribute(o,a,l,c,u,new O),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));let d={a,b:l,c,normal:new O,materialIndex:0};gn.getNormal(Fr,Ur,Br,d.normal),h.face=d,h.barycoord=u}return h}var xn=class extends si{constructor(t=null,e=1,i=1,n,s,o,a,l,c=qe,h=qe,u,d){super(null,o,a,l,c,h,n,s,u,d),this.isDataTexture=!0,this.image={data:t,width:e,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Mi=class extends te{constructor(t,e,i,n=1){super(t,e,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=n}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){let t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}},ls=new ge,ih=new ge,Hr=[],nh=new Vi,Au=new ge,Fs=new Mt,Us=new Wi,oe=class extends Mt{constructor(t,e,i){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new Mi(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let n=0;n<i;n++)this.setMatrixAt(n,Au)}computeBoundingBox(){let t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new Vi),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<e;i++)this.getMatrixAt(i,ls),nh.copy(t.boundingBox).applyMatrix4(ls),this.boundingBox.union(nh)}computeBoundingSphere(){let t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new Wi),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<e;i++)this.getMatrixAt(i,ls),Us.copy(t.boundingSphere).applyMatrix4(ls),this.boundingSphere.union(Us)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){return this.instanceColor===null?e.setRGB(1,1,1):e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){return e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){let i=e.morphTargetInfluences,n=this.morphTexture.source.data.data,s=i.length+1,o=t*s+1;for(let a=0;a<i.length;a++)i[a]=n[o+a]}raycast(t,e){let i=this.matrixWorld,n=this.count;if(Fs.geometry=this.geometry,Fs.material=this.material,Fs.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Us.copy(this.boundingSphere),Us.applyMatrix4(i),t.ray.intersectsSphere(Us)!==!1))for(let s=0;s<n;s++){this.getMatrixAt(s,ls),ih.multiplyMatrices(i,ls),Fs.matrixWorld=ih,Fs.raycast(t,Hr);for(let o=0,a=Hr.length;o<a;o++){let l=Hr[o];l.instanceId=s,l.object=this,e.push(l)}Hr.length=0}}setColorAt(t,e){return this.instanceColor===null&&(this.instanceColor=new Mi(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3),this}setMatrixAt(t,e){return e.toArray(this.instanceMatrix.array,t*16),this}setMorphAt(t,e){let i=e.morphTargetInfluences,n=i.length+1;this.morphTexture===null&&(this.morphTexture=new xn(new Float32Array(n*this.count),n,this.count,ko,Si));let s=this.morphTexture.source.data.data,o=0;for(let c=0;c<i.length;c++)o+=i[c];let a=this.geometry.morphTargetsRelative?1:1-o,l=n*t;return s[l]=a,s.set(i,l+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Bn=new Wi,Cu=new Kt(.5,.5),Gr=new O,vs=class{constructor(t=new Ci,e=new Ci,i=new Ci,n=new Ci,s=new Ci,o=new Ci){this.planes=[t,e,i,n,s,o]}set(t,e,i,n,s,o){let a=this.planes;return a[0].copy(t),a[1].copy(e),a[2].copy(i),a[3].copy(n),a[4].copy(s),a[5].copy(o),this}copy(t){let e=this.planes;for(let i=0;i<6;i++)e[i].copy(t.planes[i]);return this}setFromProjectionMatrix(t,e=Ri,i=!1){let n=this.planes,s=t.elements,o=s[0],a=s[1],l=s[2],c=s[3],h=s[4],u=s[5],d=s[6],f=s[7],g=s[8],y=s[9],p=s[10],m=s[11],x=s[12],S=s[13],M=s[14],b=s[15];if(n[0].setComponents(c-o,f-h,m-g,b-x).normalize(),n[1].setComponents(c+o,f+h,m+g,b+x).normalize(),n[2].setComponents(c+a,f+u,m+y,b+S).normalize(),n[3].setComponents(c-a,f-u,m-y,b-S).normalize(),i)n[4].setComponents(l,d,p,M).normalize(),n[5].setComponents(c-l,f-d,m-p,b-M).normalize();else if(n[4].setComponents(c-l,f-d,m-p,b-M).normalize(),e===Ri)n[5].setComponents(c+l,f+d,m+p,b+M).normalize();else if(e===ps)n[5].setComponents(l,d,p,M).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),Bn.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),Bn.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(Bn)}intersectsSprite(t){Bn.center.set(0,0,0);let e=Cu.distanceTo(t.center);return Bn.radius=.7071067811865476+e,Bn.applyMatrix4(t.matrixWorld),this.intersectsSphere(Bn)}intersectsSphere(t){let e=this.planes,i=t.center,n=-t.radius;for(let s=0;s<6;s++)if(e[s].distanceToPoint(i)<n)return!1;return!0}intersectsBox(t){let e=this.planes;for(let i=0;i<6;i++){let n=e[i];if(Gr.x=n.normal.x>0?t.max.x:t.min.x,Gr.y=n.normal.y>0?t.max.y:t.min.y,Gr.z=n.normal.z>0?t.max.z:t.min.z,n.distanceToPoint(Gr)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let i=0;i<6;i++)if(e[i].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var yn=class extends vi{constructor(t){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new dt(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}},ho=new O,uo=new O,sh=new ge,Bs=new On,Vr=new Wi,yl=new O,rh=new O,fo=class extends Be{constructor(t=new me,e=new yn){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){let t=this.geometry;if(t.index===null){let e=t.attributes.position,i=[0];for(let n=1,s=e.count;n<s;n++)ho.fromBufferAttribute(e,n-1),uo.fromBufferAttribute(e,n),i[n]=i[n-1],i[n]+=ho.distanceTo(uo);t.setAttribute("lineDistance",new re(i,1))}else Vt("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let i=this.geometry,n=this.matrixWorld,s=t.params.Line.threshold,o=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Vr.copy(i.boundingSphere),Vr.applyMatrix4(n),Vr.radius+=s,t.ray.intersectsSphere(Vr)===!1)return;sh.copy(n).invert(),Bs.copy(t.ray).applyMatrix4(sh);let a=s/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=this.isLineSegments?2:1,h=i.index,d=i.attributes.position;if(h!==null){let f=Math.max(0,o.start),g=Math.min(h.count,o.start+o.count);for(let y=f,p=g-1;y<p;y+=c){let m=h.getX(y),x=h.getX(y+1),S=Wr(this,t,Bs,l,m,x,y);S&&e.push(S)}if(this.isLineLoop){let y=h.getX(g-1),p=h.getX(f),m=Wr(this,t,Bs,l,y,p,g-1);m&&e.push(m)}}else{let f=Math.max(0,o.start),g=Math.min(d.count,o.start+o.count);for(let y=f,p=g-1;y<p;y+=c){let m=Wr(this,t,Bs,l,y,y+1,y);m&&e.push(m)}if(this.isLineLoop){let y=Wr(this,t,Bs,l,g-1,f,g-1);y&&e.push(y)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){let n=e[i[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=n.length;s<o;s++){let a=n[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}};function Wr(r,t,e,i,n,s,o){let a=r.geometry.attributes.position;if(ho.fromBufferAttribute(a,n),uo.fromBufferAttribute(a,s),e.distanceSqToSegment(ho,uo,yl,rh)>i)return;yl.applyMatrix4(r.matrixWorld);let c=t.ray.origin.distanceTo(yl);if(!(c<t.near||c>t.far))return{distance:c,point:rh.clone().applyMatrix4(r.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:r}}var oh=new O,ah=new O,Hn=class extends fo{constructor(t,e){super(t,e),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let t=this.geometry;if(t.index===null){let e=t.attributes.position,i=[];for(let n=0,s=e.count;n<s;n+=2)oh.fromBufferAttribute(e,n),ah.fromBufferAttribute(e,n+1),i[n]=n===0?0:i[n-1],i[n+1]=i[n]+oh.distanceTo(ah);t.setAttribute("lineDistance",new re(i,1))}else Vt("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}};var po=class extends vi{constructor(t){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new dt(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}},lh=new ge,El=new On,Xr=new Wi,Yr=new O,Ys=class extends Be{constructor(t=new me,e=new po){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let i=this.geometry,n=this.matrixWorld,s=t.params.Points.threshold,o=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Xr.copy(i.boundingSphere),Xr.applyMatrix4(n),Xr.radius+=s,t.ray.intersectsSphere(Xr)===!1)return;lh.copy(n).invert(),El.copy(t.ray).applyMatrix4(lh);let a=s/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=i.index,u=i.attributes.position;if(c!==null){let d=Math.max(0,o.start),f=Math.min(c.count,o.start+o.count);for(let g=d,y=f;g<y;g++){let p=c.getX(g);Yr.fromBufferAttribute(u,p),ch(Yr,p,l,n,t,e,this)}}else{let d=Math.max(0,o.start),f=Math.min(u.count,o.start+o.count);for(let g=d,y=f;g<y;g++)Yr.fromBufferAttribute(u,g),ch(Yr,g,l,n,t,e,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){let n=e[i[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let s=0,o=n.length;s<o;s++){let a=n[s].name||String(s);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=s}}}}};function ch(r,t,e,i,n,s,o){let a=El.distanceSqToPoint(r);if(a<e){let l=new O;El.closestPointToPoint(r,l),l.applyMatrix4(i);let c=n.ray.origin.distanceTo(l);if(c<n.near||c>n.far)return;s.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:t,face:null,faceIndex:null,barycoord:null,object:o})}}var qs=class extends si{constructor(t=[],e=En,i,n,s,o,a,l,c,h){super(t,e,i,n,s,o,a,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},mi=class extends si{constructor(t,e,i,n,s,o,a,l,c){super(t,e,i,n,s,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}};var vn=class extends si{constructor(t,e,i=Li,n,s,o,a=qe,l=qe,c,h=Hi,u=1){if(h!==Hi&&h!==Tn)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let d={width:t,height:e,depth:u};super(d,n,s,o,a,l,h,i,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new gs(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return e.compareFunction=this.compareFunction,e}},mo=class extends vn{constructor(t,e=Li,i=En,n,s,o=qe,a=qe,l,c=Hi){let h={width:t,height:t,depth:1},u=[h,h,h,h,h,h];super(t,t,e,i,n,s,o,a,l,c),this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}},$s=class extends si{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}},kt=class r extends me{constructor(t=1,e=1,i=1,n=1,s=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:i,widthSegments:n,heightSegments:s,depthSegments:o};let a=this;n=Math.floor(n),s=Math.floor(s),o=Math.floor(o);let l=[],c=[],h=[],u=[],d=0,f=0;g("z","y","x",-1,-1,i,e,t,o,s,0),g("z","y","x",1,-1,i,e,-t,o,s,1),g("x","z","y",1,1,t,i,e,n,o,2),g("x","z","y",1,-1,t,i,-e,n,o,3),g("x","y","z",1,-1,t,e,i,n,s,4),g("x","y","z",-1,-1,t,e,-i,n,s,5),this.setIndex(l),this.setAttribute("position",new re(c,3)),this.setAttribute("normal",new re(h,3)),this.setAttribute("uv",new re(u,2));function g(y,p,m,x,S,M,b,_,w,v,T){let C=M/w,R=b/v,P=M/2,N=b/2,I=_/2,U=w+1,B=v+1,G=0,Q=0,F=new O;for(let $=0;$<B;$++){let K=$*R-N;for(let at=0;at<U;at++){let rt=at*C-P;F[y]=rt*x,F[p]=K*S,F[m]=I,c.push(F.x,F.y,F.z),F[y]=0,F[p]=0,F[m]=_>0?1:-1,h.push(F.x,F.y,F.z),u.push(at/w),u.push(1-$/v),G+=1}}for(let $=0;$<v;$++)for(let K=0;K<w;K++){let at=d+K+U*$,rt=d+K+U*($+1),It=d+(K+1)+U*($+1),ut=d+(K+1)+U*$;l.push(at,rt,ut),l.push(rt,It,ut),Q+=6}a.addGroup(f,Q,T),f+=Q,d+=G}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new r(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};var Zs=class r extends me{constructor(t=1,e=32,i=0,n=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:t,segments:e,thetaStart:i,thetaLength:n},e=Math.max(3,e);let s=[],o=[],a=[],l=[],c=new O,h=new Kt;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let u=0,d=3;u<=e;u++,d+=3){let f=i+u/e*n;c.x=t*Math.cos(f),c.y=t*Math.sin(f),o.push(c.x,c.y,c.z),a.push(0,0,1),h.x=(o[d]/t+1)/2,h.y=(o[d+1]/t+1)/2,l.push(h.x,h.y)}for(let u=1;u<=e;u++)s.push(u,u+1,0);this.setIndex(s),this.setAttribute("position",new re(o,3)),this.setAttribute("normal",new re(a,3)),this.setAttribute("uv",new re(l,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new r(t.radius,t.segments,t.thetaStart,t.thetaLength)}},Ce=class r extends me{constructor(t=1,e=1,i=1,n=32,s=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:i,radialSegments:n,heightSegments:s,openEnded:o,thetaStart:a,thetaLength:l};let c=this;n=Math.floor(n),s=Math.floor(s);let h=[],u=[],d=[],f=[],g=0,y=[],p=i/2,m=0;x(),o===!1&&(t>0&&S(!0),e>0&&S(!1)),this.setIndex(h),this.setAttribute("position",new re(u,3)),this.setAttribute("normal",new re(d,3)),this.setAttribute("uv",new re(f,2));function x(){let M=new O,b=new O,_=0,w=(e-t)/i;for(let v=0;v<=s;v++){let T=[],C=v/s,R=C*(e-t)+t;for(let P=0;P<=n;P++){let N=P/n,I=N*l+a,U=Math.sin(I),B=Math.cos(I);b.x=R*U,b.y=-C*i+p,b.z=R*B,u.push(b.x,b.y,b.z),M.set(U,w,B).normalize(),d.push(M.x,M.y,M.z),f.push(N,1-C),T.push(g++)}y.push(T)}for(let v=0;v<n;v++)for(let T=0;T<s;T++){let C=y[T][v],R=y[T+1][v],P=y[T+1][v+1],N=y[T][v+1];(t>0||T!==0)&&(h.push(C,R,N),_+=3),(e>0||T!==s-1)&&(h.push(R,P,N),_+=3)}c.addGroup(m,_,0),m+=_}function S(M){let b=g,_=new Kt,w=new O,v=0,T=M===!0?t:e,C=M===!0?1:-1;for(let P=1;P<=n;P++)u.push(0,p*C,0),d.push(0,C,0),f.push(.5,.5),g++;let R=g;for(let P=0;P<=n;P++){let I=P/n*l+a,U=Math.cos(I),B=Math.sin(I);w.x=T*B,w.y=p*C,w.z=T*U,u.push(w.x,w.y,w.z),d.push(0,C,0),_.x=U*.5+.5,_.y=B*.5*C+.5,f.push(_.x,_.y),g++}for(let P=0;P<n;P++){let N=b+P,I=R+P;M===!0?h.push(I,I+1,N):h.push(I+1,I,N),v+=3}c.addGroup(m,v,M===!0?1:2),m+=v}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new r(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},_i=class r extends Ce{constructor(t=1,e=1,i=32,n=1,s=!1,o=0,a=Math.PI*2){super(0,t,e,i,n,s,o,a),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:i,heightSegments:n,openEnded:s,thetaStart:o,thetaLength:a}}static fromJSON(t){return new r(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Qs=class r extends me{constructor(t=[],e=[],i=1,n=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:i,detail:n};let s=[],o=[];a(n),c(i),h(),this.setAttribute("position",new re(s,3)),this.setAttribute("normal",new re(s.slice(),3)),this.setAttribute("uv",new re(o,2)),n===0?this.computeVertexNormals():this.normalizeNormals();function a(x){let S=new O,M=new O,b=new O;for(let _=0;_<e.length;_+=3)f(e[_+0],S),f(e[_+1],M),f(e[_+2],b),l(S,M,b,x)}function l(x,S,M,b){let _=b+1,w=[];for(let v=0;v<=_;v++){w[v]=[];let T=x.clone().lerp(M,v/_),C=S.clone().lerp(M,v/_),R=_-v;for(let P=0;P<=R;P++)P===0&&v===_?w[v][P]=T:w[v][P]=T.clone().lerp(C,P/R)}for(let v=0;v<_;v++)for(let T=0;T<2*(_-v)-1;T++){let C=Math.floor(T/2);T%2===0?(d(w[v][C+1]),d(w[v+1][C]),d(w[v][C])):(d(w[v][C+1]),d(w[v+1][C+1]),d(w[v+1][C]))}}function c(x){let S=new O;for(let M=0;M<s.length;M+=3)S.x=s[M+0],S.y=s[M+1],S.z=s[M+2],S.normalize().multiplyScalar(x),s[M+0]=S.x,s[M+1]=S.y,s[M+2]=S.z}function h(){let x=new O;for(let S=0;S<s.length;S+=3){x.x=s[S+0],x.y=s[S+1],x.z=s[S+2];let M=p(x)/2/Math.PI+.5,b=m(x)/Math.PI+.5;o.push(M,1-b)}g(),u()}function u(){for(let x=0;x<o.length;x+=6){let S=o[x+0],M=o[x+2],b=o[x+4],_=Math.max(S,M,b),w=Math.min(S,M,b);_>.9&&w<.1&&(S<.2&&(o[x+0]+=1),M<.2&&(o[x+2]+=1),b<.2&&(o[x+4]+=1))}}function d(x){s.push(x.x,x.y,x.z)}function f(x,S){let M=x*3;S.x=t[M+0],S.y=t[M+1],S.z=t[M+2]}function g(){let x=new O,S=new O,M=new O,b=new O,_=new Kt,w=new Kt,v=new Kt;for(let T=0,C=0;T<s.length;T+=9,C+=6){x.set(s[T+0],s[T+1],s[T+2]),S.set(s[T+3],s[T+4],s[T+5]),M.set(s[T+6],s[T+7],s[T+8]),_.set(o[C+0],o[C+1]),w.set(o[C+2],o[C+3]),v.set(o[C+4],o[C+5]),b.copy(x).add(S).add(M).divideScalar(3);let R=p(b);y(_,C+0,x,R),y(w,C+2,S,R),y(v,C+4,M,R)}}function y(x,S,M,b){b<0&&x.x===1&&(o[S]=x.x-1),M.x===0&&M.z===0&&(o[S]=b/2/Math.PI+.5)}function p(x){return Math.atan2(x.z,-x.x)}function m(x){return Math.atan2(-x.y,Math.sqrt(x.x*x.x+x.z*x.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new r(t.vertices,t.indices,t.radius,t.detail)}},Gn=class r extends Qs{constructor(t=1,e=0){let i=(1+Math.sqrt(5))/2,n=1/i,s=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-n,-i,0,-n,i,0,n,-i,0,n,i,-n,-i,0,-n,i,0,n,-i,0,n,i,0,-i,0,-n,i,0,-n,-i,0,n,i,0,n],o=[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9];super(s,o,t,e),this.type="DodecahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new r(t.radius,t.detail)}};var Ks=class r extends Qs{constructor(t=1,e=0){let i=(1+Math.sqrt(5))/2,n=[-1,i,0,1,i,0,-1,-i,0,1,-i,0,0,-1,i,0,1,i,0,-1,-i,0,1,-i,i,0,-1,i,0,1,-i,0,-1,-i,0,1],s=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(n,s,t,e),this.type="IcosahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new r(t.radius,t.detail)}};var Vn=class r extends me{constructor(t=1,e=1,i=1,n=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:i,heightSegments:n};let s=t/2,o=e/2,a=Math.floor(i),l=Math.floor(n),c=a+1,h=l+1,u=t/a,d=e/l,f=[],g=[],y=[],p=[];for(let m=0;m<h;m++){let x=m*d-o;for(let S=0;S<c;S++){let M=S*u-s;g.push(M,-x,0),y.push(0,0,1),p.push(S/a),p.push(1-m/l)}}for(let m=0;m<l;m++)for(let x=0;x<a;x++){let S=x+c*m,M=x+c*(m+1),b=x+1+c*(m+1),_=x+1+c*m;f.push(S,M,_),f.push(M,b,_)}this.setIndex(f),this.setAttribute("position",new re(g,3)),this.setAttribute("normal",new re(y,3)),this.setAttribute("uv",new re(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new r(t.width,t.height,t.widthSegments,t.heightSegments)}},Mn=class r extends me{constructor(t=.5,e=1,i=32,n=1,s=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:t,outerRadius:e,thetaSegments:i,phiSegments:n,thetaStart:s,thetaLength:o},i=Math.max(3,i),n=Math.max(1,n);let a=[],l=[],c=[],h=[],u=t,d=(e-t)/n,f=new O,g=new Kt;for(let y=0;y<=n;y++){for(let p=0;p<=i;p++){let m=s+p/i*o;f.x=u*Math.cos(m),f.y=u*Math.sin(m),l.push(f.x,f.y,f.z),c.push(0,0,1),g.x=(f.x/e+1)/2,g.y=(f.y/e+1)/2,h.push(g.x,g.y)}u+=d}for(let y=0;y<n;y++){let p=y*(i+1);for(let m=0;m<i;m++){let x=m+p,S=x,M=x+i+1,b=x+i+2,_=x+1;a.push(S,M,_),a.push(M,b,_)}}this.setIndex(a),this.setAttribute("position",new re(l,3)),this.setAttribute("normal",new re(c,3)),this.setAttribute("uv",new re(h,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new r(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}};var Xi=class r extends me{constructor(t=1,e=32,i=16,n=0,s=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:i,phiStart:n,phiLength:s,thetaStart:o,thetaLength:a},e=Math.max(3,Math.floor(e)),i=Math.max(2,Math.floor(i));let l=Math.min(o+a,Math.PI),c=0,h=[],u=new O,d=new O,f=[],g=[],y=[],p=[];for(let m=0;m<=i;m++){let x=[],S=m/i,M=o+S*a,b=t*Math.cos(M),_=Math.sqrt(t*t-b*b),w=0;m===0&&o===0?w=.5/e:m===i&&l===Math.PI&&(w=-.5/e);for(let v=0;v<=e;v++){let T=v/e,C=n+T*s;u.x=-_*Math.cos(C),u.y=b,u.z=_*Math.sin(C),g.push(u.x,u.y,u.z),d.copy(u).normalize(),y.push(d.x,d.y,d.z),p.push(T+w,1-S),x.push(c++)}h.push(x)}for(let m=0;m<i;m++)for(let x=0;x<e;x++){let S=h[m][x+1],M=h[m][x],b=h[m+1][x],_=h[m+1][x+1];(m!==0||o>0)&&f.push(S,M,_),(m!==i-1||l<Math.PI)&&f.push(M,b,_)}this.setIndex(f),this.setAttribute("position",new re(g,3)),this.setAttribute("normal",new re(y,3)),this.setAttribute("uv",new re(p,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new r(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};var Js=class r extends me{constructor(t=1,e=.4,i=12,n=48,s=Math.PI*2,o=0,a=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:i,tubularSegments:n,arc:s,thetaStart:o,thetaLength:a},i=Math.floor(i),n=Math.floor(n);let l=[],c=[],h=[],u=[],d=new O,f=new O,g=new O;for(let y=0;y<=i;y++){let p=o+y/i*a;for(let m=0;m<=n;m++){let x=m/n*s;f.x=(t+e*Math.cos(p))*Math.cos(x),f.y=(t+e*Math.cos(p))*Math.sin(x),f.z=e*Math.sin(p),c.push(f.x,f.y,f.z),d.x=t*Math.cos(x),d.y=t*Math.sin(x),g.subVectors(f,d).normalize(),h.push(g.x,g.y,g.z),u.push(m/n),u.push(y/i)}}for(let y=1;y<=i;y++)for(let p=1;p<=n;p++){let m=(n+1)*y+p-1,x=(n+1)*(y-1)+p-1,S=(n+1)*(y-1)+p,M=(n+1)*y+p;l.push(m,x,M),l.push(x,S,M)}this.setIndex(l),this.setAttribute("position",new re(c,3)),this.setAttribute("normal",new re(h,3)),this.setAttribute("uv",new re(u,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new r(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc,t.thetaStart,t.thetaLength)}};function qn(r){let t={};for(let e in r){t[e]={};for(let i in r[e]){let n=r[e][i];if(hh(n))n.isRenderTargetTexture?(Vt("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][i]=null):t[e][i]=n.clone();else if(Array.isArray(n))if(hh(n[0])){let s=[];for(let o=0,a=n.length;o<a;o++)s[o]=n[o].clone();t[e][i]=s}else t[e][i]=n.slice();else t[e][i]=n}}return t}function ei(r){let t={};for(let e=0;e<r.length;e++){let i=qn(r[e]);for(let n in i)t[n]=i[n]}return t}function hh(r){return r&&(r.isColor||r.isMatrix3||r.isMatrix4||r.isVector2||r.isVector3||r.isVector4||r.isTexture||r.isQuaternion)}function Ru(r){let t=[];for(let e=0;e<r.length;e++)t.push(r[e].clone());return t}function Jl(r){let t=r.getRenderTarget();return t===null?r.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:le.workingColorSpace}var nd={clone:qn,merge:ei},Iu=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Pu=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Ne=class extends vi{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Iu,this.fragmentShader=Pu,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=qn(t.uniforms),this.uniformsGroups=Ru(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let n in this.uniforms){let o=this.uniforms[n].value;o&&o.isTexture?e.uniforms[n]={type:"t",value:o.toJSON(t).uuid}:o&&o.isColor?e.uniforms[n]={type:"c",value:o.getHex()}:o&&o.isVector2?e.uniforms[n]={type:"v2",value:o.toArray()}:o&&o.isVector3?e.uniforms[n]={type:"v3",value:o.toArray()}:o&&o.isVector4?e.uniforms[n]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?e.uniforms[n]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?e.uniforms[n]={type:"m4",value:o.toArray()}:e.uniforms[n]={value:o}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let i={};for(let n in this.extensions)this.extensions[n]===!0&&(i[n]=!0);return Object.keys(i).length>0&&(e.extensions=i),e}fromJSON(t,e){if(super.fromJSON(t,e),t.uniforms!==void 0)for(let i in t.uniforms){let n=t.uniforms[i];switch(this.uniforms[i]={},n.type){case"t":this.uniforms[i].value=e[n.value]||null;break;case"c":this.uniforms[i].value=new dt().setHex(n.value);break;case"v2":this.uniforms[i].value=new Kt().fromArray(n.value);break;case"v3":this.uniforms[i].value=new O().fromArray(n.value);break;case"v4":this.uniforms[i].value=new De().fromArray(n.value);break;case"m3":this.uniforms[i].value=new Zt().fromArray(n.value);break;case"m4":this.uniforms[i].value=new ge().fromArray(n.value);break;default:this.uniforms[i].value=n.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(let i in t.extensions)this.extensions[i]=t.extensions[i];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}},go=class extends Ne{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},Yi=class extends vi{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new dt(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new dt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=ws,this.normalScale=new Kt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new pi,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}};var js=class extends vi{constructor(t){super(),this.isMeshPhongMaterial=!0,this.type="MeshPhongMaterial",this.color=new dt(16777215),this.specular=new dt(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new dt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=ws,this.normalScale=new Kt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new pi,this.combine=or,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.specular.copy(t.specular),this.shininess=t.shininess,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.envMapIntensity=t.envMapIntensity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}};var ne=class extends vi{constructor(t){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new dt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new dt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=ws,this.normalScale=new Kt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new pi,this.combine=or,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.envMapIntensity=t.envMapIntensity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}},xo=class extends vi{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Gh,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},yo=class extends vi{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}};function cs(r,t){return!r||r.constructor===t?r:typeof t.BYTES_PER_ELEMENT=="number"?new t(r):Array.prototype.slice.call(r)}function vl(r){return r!==void 0&&r.inTangents!==void 0&&r.outTangents!==void 0}var _n=class{constructor(t,e,i,n){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=n!==void 0?n:new e.constructor(i),this.sampleValues=e,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,i=this._cachedIndex,n=e[i],s=e[i-1];i:{t:{let o;e:{n:if(!(t<n)){for(let a=i+2;;){if(n===void 0){if(t<s)break n;return i=e.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===a)break;if(s=n,n=e[++i],t<n)break t}o=e.length;break e}if(!(t>=s)){let a=e[1];t<a&&(i=2,s=a);for(let l=i-2;;){if(s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===l)break;if(n=s,s=e[--i-1],t>=s)break t}o=i,i=0;break e}break i}for(;i<o;){let a=i+o>>>1;t<e[a]?o=a:i=a+1}if(n=e[i],s=e[i-1],s===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===void 0)return i=e.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,s,n)}return this.interpolate_(i,s,t,n)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,i=this.sampleValues,n=this.valueSize,s=t*n;for(let o=0;o!==n;++o)e[o]=i[s+o];return e}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},vo=class extends _n{constructor(t,e,i,n){super(t,e,i,n),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Sl,endingEnd:Sl}}intervalChanged_(t,e,i){let n=this.parameterPositions,s=t-2,o=t+1,a=n[s],l=n[o];if(a===void 0)switch(this.getSettings_().endingStart){case bl:s=t,a=2*e-i;break;case wl:s=n.length-2,a=e+n[s]-n[s+1];break;default:s=t,a=i}if(l===void 0)switch(this.getSettings_().endingEnd){case bl:o=t,l=2*i-e;break;case wl:o=1,l=i+n[1]-n[0];break;default:o=t-1,l=e}let c=(i-e)*.5,h=this.valueSize;this._weightPrev=c/(e-a),this._weightNext=c/(l-i),this._offsetPrev=s*h,this._offsetNext=o*h}interpolate_(t,e,i,n){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,h=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,g=(i-e)/(n-e),y=g*g,p=y*g,m=-d*p+2*d*y-d*g,x=(1+d)*p+(-1.5-2*d)*y+(-.5+d)*g+1,S=(-1-f)*p+(1.5+f)*y+.5*g,M=f*p-f*y;for(let b=0;b!==a;++b)s[b]=m*o[h+b]+x*o[c+b]+S*o[l+b]+M*o[u+b];return s}},Mo=class extends _n{constructor(t,e,i,n){super(t,e,i,n)}interpolate_(t,e,i,n){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,h=(i-e)/(n-e),u=1-h;for(let d=0;d!==a;++d)s[d]=o[c+d]*u+o[l+d]*h;return s}},_o=class extends _n{constructor(t,e,i,n){super(t,e,i,n)}interpolate_(t){return this.copySampleValue_(t-1)}},So=class extends _n{interpolate_(t,e,i,n){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,h=this.inTangents,u=this.outTangents;if(!h||!u){let g=(i-e)/(n-e),y=1-g;for(let p=0;p!==a;++p)s[p]=o[c+p]*y+o[l+p]*g;return s}let d=a*2,f=t-1;for(let g=0;g!==a;++g){let y=o[c+g],p=o[l+g],m=f*d+g*2,x=u[m],S=u[m+1],M=t*d+g*2,b=h[M],_=h[M+1],w=Du(i,e,x,b,n);s[g]=sd(w,y,S,_,p)}return s}};function sd(r,t,e,i,n){let s=1-r;return s*s*s*t+3*s*s*r*e+3*s*r*r*i+r*r*r*n}function Lu(r,t,e,i,n){let s=1-r;return 3*s*s*(e-t)+6*s*r*(i-e)+3*r*r*(n-i)}function Du(r,t,e,i,n){let s=(r-t)/(n-t);for(let o=0;o<8;o++){let a=sd(s,t,e,i,n)-r;if(Math.abs(a)<1e-10)break;let l=Lu(s,t,e,i,n);if(Math.abs(l)<1e-10)break;s=Math.max(0,Math.min(1,s-a/l))}return s}var gi=class{constructor(t,e,i,n){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=cs(e,this.TimeBufferType),this.values=cs(i,this.ValueBufferType),this.setInterpolation(n||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,i;if(e.toJSON!==this.toJSON)i=e.toJSON(t);else{i={name:t.name,times:cs(t.times,Array),values:cs(t.values,Array)};let n=t.getInterpolation();n!==t.DefaultInterpolation&&(i.interpolation=n),vl(t.settings)&&(i.settings={inTangents:cs(t.settings.inTangents,Array),outTangents:cs(t.settings.outTangents,Array)})}return i.type=t.ValueTypeName,i}InterpolantFactoryMethodDiscrete(t){return new _o(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new Mo(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new vo(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodBezier(t){let e=new So(this.times,this.values,this.getValueSize(),t);return this.settings&&(e.inTangents=this.settings.inTangents,e.outTangents=this.settings.outTangents),e}setInterpolation(t){let e;switch(t){case zs:e=this.InterpolantFactoryMethodDiscrete;break;case ro:e=this.InterpolantFactoryMethodLinear;break;case Zr:e=this.InterpolantFactoryMethodSmooth;break;case _l:e=this.InterpolantFactoryMethodBezier;break}if(e===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return Vt("KeyframeTrack:",i),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return zs;case this.InterpolantFactoryMethodLinear:return ro;case this.InterpolantFactoryMethodSmooth:return Zr;case this.InterpolantFactoryMethodBezier:return _l}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let i=0,n=e.length;i!==n;++i)e[i]+=t}return this}scale(t){if(t!==1){let e=this.times;for(let i=0,n=e.length;i!==n;++i)e[i]*=t;vl(this.settings)&&(dh(this.settings.inTangents,t),dh(this.settings.outTangents,t))}return this}trim(t,e){let i=this.times,n=i.length,s=0,o=n-1;for(;s!==n&&i[s]<t;)++s;for(;o!==-1&&i[o]>e;)--o;if(++o,s!==0||o!==n){s>=o&&(o=Math.max(o,1),s=o-1);let a=this.getValueSize();this.times=i.slice(s,o),this.values=this.values.slice(s*a,o*a)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(Xt("KeyframeTrack: Invalid value size in track.",this),t=!1);let i=this.times,n=this.values,s=i.length;s===0&&(Xt("KeyframeTrack: Track is empty.",this),t=!1);let o=null;for(let a=0;a!==s;a++){let l=i[a];if(typeof l=="number"&&isNaN(l)){Xt("KeyframeTrack: Time is not a valid number.",this,a,l),t=!1;break}if(o!==null&&o>l){Xt("KeyframeTrack: Out of order keys.",this,a,l,o),t=!1;break}o=l}if(n!==void 0&&lu(n))for(let a=0,l=n.length;a!==l;++a){let c=n[a];if(isNaN(c)){Xt("KeyframeTrack: Value is not a valid number.",this,a,c),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),i=this.getValueSize(),n=this.getInterpolation()===Zr,s=t.length-1,o=1;for(let a=1;a<s;++a){let l=!1,c=t[a],h=t[a+1];if(c!==h&&(a!==1||c!==t[0]))if(n)l=!0;else{let u=a*i,d=u-i,f=u+i;for(let g=0;g!==i;++g){let y=e[u+g];if(y!==e[d+g]||y!==e[f+g]){l=!0;break}}}if(l){if(a!==o){t[o]=t[a];let u=a*i,d=o*i;for(let f=0;f!==i;++f)e[d+f]=e[u+f]}++o}}if(s>0){t[o]=t[s];for(let a=s*i,l=o*i,c=0;c!==i;++c)e[l+c]=e[a+c];++o}return o!==t.length?(this.times=t.slice(0,o),this.values=e.slice(0,o*i)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),i=this.constructor,n=new i(this.name,t,e);return n.createInterpolant=this.createInterpolant,vl(this.settings)&&(n.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),n}};function dh(r,t){for(let e=0,i=r.length;e!==i;e+=2)r[e]*=t}gi.prototype.ValueTypeName="";gi.prototype.TimeBufferType=Float32Array;gi.prototype.ValueBufferType=Float32Array;gi.prototype.DefaultInterpolation=ro;var Sn=class extends gi{constructor(t,e,i){super(t,e,i)}};Sn.prototype.ValueTypeName="bool";Sn.prototype.ValueBufferType=Array;Sn.prototype.DefaultInterpolation=zs;Sn.prototype.InterpolantFactoryMethodLinear=void 0;Sn.prototype.InterpolantFactoryMethodSmooth=void 0;var bo=class extends gi{constructor(t,e,i,n){super(t,e,i,n)}};bo.prototype.ValueTypeName="color";var wo=class extends gi{constructor(t,e,i,n){super(t,e,i,n)}};wo.prototype.ValueTypeName="number";var Eo=class extends _n{constructor(t,e,i,n){super(t,e,i,n)}interpolate_(t,e,i,n){let s=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(i-e)/(n-e),c=t*a;for(let h=c+a;c!==h;c+=4)fi.slerpFlat(s,0,o,c-a,o,c,l);return s}},tr=class extends gi{constructor(t,e,i,n){super(t,e,i,n)}InterpolantFactoryMethodLinear(t){return new Eo(this.times,this.values,this.getValueSize(),t)}};tr.prototype.ValueTypeName="quaternion";tr.prototype.InterpolantFactoryMethodSmooth=void 0;var bn=class extends gi{constructor(t,e,i){super(t,e,i)}};bn.prototype.ValueTypeName="string";bn.prototype.ValueBufferType=Array;bn.prototype.DefaultInterpolation=zs;bn.prototype.InterpolantFactoryMethodLinear=void 0;bn.prototype.InterpolantFactoryMethodSmooth=void 0;var To=class extends gi{constructor(t,e,i,n){super(t,e,i,n)}};To.prototype.ValueTypeName="vector";var Ao=class{constructor(t,e,i){let n=this,s=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=i,this._abortController=null,this.itemStart=function(h){a++,s===!1&&n.onStart!==void 0&&n.onStart(h,o,a),s=!0},this.itemEnd=function(h){o++,n.onProgress!==void 0&&n.onProgress(h,o,a),o===a&&(s=!1,n.onLoad!==void 0&&n.onLoad())},this.itemError=function(h){n.onError!==void 0&&n.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){let u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,d=c.length;u<d;u+=2){let f=c[u],g=c[u+1];if(f.global&&(f.lastIndex=0),f.test(h))return g}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},rd=new Ao,Co=class{constructor(t){this.manager=t!==void 0?t:rd,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(t,e){let i=this;return new Promise(function(n,s){i.load(t,n,e,s)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}abort(){return this}};Co.DEFAULT_MATERIAL_NAME="__DEFAULT";var er=class extends Be{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new dt(t),this.intensity=e}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,e}},ir=class extends er{constructor(t,e,i){super(t,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Be.DEFAULT_UP),this.updateMatrix(),this.groundColor=new dt(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}toJSON(t){let e=super.toJSON(t);return e.object.groundColor=this.groundColor.getHex(),e}},Ml=new ge,uh=new O,fh=new O,Ro=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Kt(512,512),this.mapType=hi,this.map=null,this.mapPass=null,this.matrix=new ge,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new vs,this._frameExtents=new Kt(1,1),this._viewportCount=1,this._viewports=[new De(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera;uh.setFromMatrixPosition(t.matrixWorld),e.position.copy(uh),fh.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(fh),e.updateMatrixWorld(),this._updateMatrix(e,this.matrix,this._frustum)}_updateMatrix(t,e,i,n){Ml.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),i.setFromProjectionMatrix(Ml,t.coordinateSystem,t.reversedDepth);let s=this._frameExtents,o=n?n.z/s.x:1,a=n?n.w/s.y:1,l=n?n.x/s.x:0,c=n?n.y/s.y:0;t.coordinateSystem===ps||t.reversedDepth?e.set(.5*o,0,0,.5*o+l,0,.5*a,0,.5*a+c,0,0,1,0,0,0,0,1):e.set(.5*o,0,0,.5*o+l,0,.5*a,0,.5*a+c,0,0,.5,.5,0,0,0,1),e.multiply(Ml)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return t.intensity=this.intensity,t.bias=this.bias,t.normalBias=this.normalBias,t.radius=this.radius,t.blurSamples=this.blurSamples,t.mapSize=this.mapSize.toArray(),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}},qr=new O,$r=new fi,ki=new O,nr=class extends Be{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ge,this.projectionMatrix=new ge,this.projectionMatrixInverse=new ge,this.coordinateSystem=Ri,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose(qr,$r,ki),ki.x===1&&ki.y===1&&ki.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(qr,$r,ki.set(1,1,1)).invert()}updateWorldMatrix(t,e,i=!1){super.updateWorldMatrix(t,e,i),this.matrixWorld.decompose(qr,$r,ki),ki.x===1&&ki.y===1&&ki.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(qr,$r,ki.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},mn=new O,ph=new Kt,mh=new Kt,ti=class extends nr{constructor(t=50,e=1,i=.1,n=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=i,this.far=n,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=oo*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(Ka*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return oo*2*Math.atan(Math.tan(Ka*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,i){mn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(mn.x,mn.y).multiplyScalar(-t/mn.z),mn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(mn.x,mn.y).multiplyScalar(-t/mn.z)}getViewSize(t,e){return this.getViewBounds(t,ph,mh),e.subVectors(mh,ph)}setViewOffset(t,e,i,n,s,o){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=n,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(Ka*.5*this.fov)/this.zoom,i=2*e,n=this.aspect*i,s=-.5*n,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;s+=o.offsetX*n/l,e-=o.offsetY*i/c,n*=o.width/l,i*=o.height/c}let a=this.filmOffset;a!==0&&(s+=t*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(s,s+n,e,e-i,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}};var Ms=class extends nr{constructor(t=-1,e=1,i=1,n=-1,s=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=i,this.bottom=n,this.near=s,this.far=o,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,i,n,s,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=n,this.view.width=s,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,n=(this.top+this.bottom)/2,s=i-t,o=i+t,a=n+e,l=n-e;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;s+=c*this.view.offsetX,o=s+c*this.view.width,a-=h*this.view.offsetY,l=a-h*this.view.height}this.projectionMatrix.makeOrthographic(s,o,a,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}},Tl=class extends Ro{constructor(){super(new Ms(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},sr=class extends er{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Be.DEFAULT_UP),this.updateMatrix(),this.target=new Be,this.shadow=new Tl}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.shadow=this.shadow.toJSON(),e.object.target=this.target.uuid,e}};var hs=-90,ds=1,Io=class extends Be{constructor(t,e,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let n=new ti(hs,ds,t,e);n.layers=this.layers,this.add(n);let s=new ti(hs,ds,t,e);s.layers=this.layers,this.add(s);let o=new ti(hs,ds,t,e);o.layers=this.layers,this.add(o);let a=new ti(hs,ds,t,e);a.layers=this.layers,this.add(a);let l=new ti(hs,ds,t,e);l.layers=this.layers,this.add(l);let c=new ti(hs,ds,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[i,n,s,o,a,l]=e;for(let c of e)this.remove(c);if(t===Ri)i.up.set(0,1,0),i.lookAt(1,0,0),n.up.set(0,1,0),n.lookAt(-1,0,0),s.up.set(0,0,-1),s.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===ps)i.up.set(0,-1,0),i.lookAt(-1,0,0),n.up.set(0,-1,0),n.lookAt(1,0,0),s.up.set(0,0,1),s.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:n}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[s,o,a,l,c,h]=this.children,u=t.getRenderTarget(),d=t.getActiveCubeFace(),f=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;let y=i.texture.generateMipmaps;i.texture.generateMipmaps=!1;let p=!1;t.isWebGLRenderer===!0?p=t.state.buffers.depth.getReversed():p=t.reversedDepthBuffer,t.setRenderTarget(i,0,n),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,s),t.setRenderTarget(i,1,n),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,o),t.setRenderTarget(i,2,n),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,a),t.setRenderTarget(i,3,n),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,l),t.setRenderTarget(i,4,n),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,c),i.texture.generateMipmaps=y,t.setRenderTarget(i,5,n),p&&t.autoClear===!1&&t.clearDepth(),t.render(e,h),t.setRenderTarget(u,d,f),t.xr.enabled=g,i.texture.needsPMREMUpdate=!0}},Po=class extends ti{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}};var jl="\\[\\]\\.:\\/",Nu=new RegExp("["+jl+"]","g"),tc="[^"+jl+"]",Fu="[^"+jl.replace("\\.","")+"]",Uu=/((?:WC+[\/:])*)/.source.replace("WC",tc),Bu=/(WCOD+)?/.source.replace("WCOD",Fu),zu=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",tc),ku=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",tc),Ou=new RegExp("^"+Uu+Bu+zu+ku+"$"),Hu=["material","materials","bones","map"],Al=class{constructor(t,e,i){let n=i||Pe.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,n)}getValue(t,e){this.bind();let i=this._targetGroup.nCachedObjects_,n=this._bindings[i];n!==void 0&&n.getValue(t,e)}setValue(t,e){let i=this._bindings;for(let n=this._targetGroup.nCachedObjects_,s=i.length;n!==s;++n)i[n].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,i=t.length;e!==i;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,i=t.length;e!==i;++e)t[e].unbind()}},Pe=class r{constructor(t,e,i){this.path=e,this.parsedPath=i||r.parseTrackName(e),this.node=r.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,i){return t&&t.isAnimationObjectGroup?new r.Composite(t,e,i):new r(t,e,i)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(Nu,"")}static parseTrackName(t){let e=Ou.exec(t);if(e===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let i={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},n=i.nodeName&&i.nodeName.lastIndexOf(".");if(n!==void 0&&n!==-1){let s=i.nodeName.substring(n+1);Hu.indexOf(s)!==-1&&(i.nodeName=i.nodeName.substring(0,n),i.objectName=s)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return i}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let i=t.skeleton.getBoneByName(e);if(i!==void 0)return i}if(t.children){let i=function(s){for(let o=0;o<s.length;o++){let a=s[o];if(a.name===e||a.uuid===e)return a;let l=i(a.children);if(l)return l}return null},n=i(t.children);if(n)return n}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let i=this.resolvedProperty;for(let n=0,s=i.length;n!==s;++n)t[e++]=i[n]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let i=this.resolvedProperty;for(let n=0,s=i.length;n!==s;++n)i[n]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let i=this.resolvedProperty;for(let n=0,s=i.length;n!==s;++n)i[n]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let i=this.resolvedProperty;for(let n=0,s=i.length;n!==s;++n)i[n]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,i=e.objectName,n=e.propertyName,s=e.propertyIndex;if(t||(t=r.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){Vt("PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let c=e.objectIndex;switch(i){case"materials":if(!t.material){Xt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){Xt("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){Xt("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let h=0;h<t.length;h++)if(t[h].name===c){c=h;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){Xt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){Xt("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[i]===void 0){Xt("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[i]}if(c!==void 0){if(t[c]===void 0){Xt("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[c]}}let o=t[n];if(o===void 0){let c=e.nodeName;Xt("PropertyBinding: Trying to update property for track: "+c+"."+n+" but it wasn't found.",t);return}let a=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?a=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(s!==void 0){if(n==="morphTargetInfluences"){if(!t.geometry){Xt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){Xt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[s]!==void 0&&(s=t.morphTargetDictionary[s])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=s}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=n;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Pe.Composite=Al;Pe.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Pe.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Pe.prototype.GetterByBindingType=[Pe.prototype._getValue_direct,Pe.prototype._getValue_array,Pe.prototype._getValue_arrayElement,Pe.prototype._getValue_toArray];Pe.prototype.SetterByBindingTypeAndVersioning=[[Pe.prototype._setValue_direct,Pe.prototype._setValue_direct_setNeedsUpdate,Pe.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Pe.prototype._setValue_array,Pe.prototype._setValue_array_setNeedsUpdate,Pe.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Pe.prototype._setValue_arrayElement,Pe.prototype._setValue_arrayElement_setNeedsUpdate,Pe.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Pe.prototype._setValue_fromArray,Pe.prototype._setValue_fromArray_setNeedsUpdate,Pe.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Yg=new Float32Array(1);var gh=new ge,rr=class{constructor(t,e,i=0,n=1/0){this.ray=new On(t,e),this.near=i,this.far=n,this.camera=null,this.layers=new xs,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,e){this.ray.set(t,e)}setFromCamera(t,e){e.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(e).sub(this.ray.origin).normalize(),this.camera=e):e.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,e.projectionMatrix.elements[14]).unproject(e),this.ray.direction.set(0,0,-1).transformDirection(e.matrixWorld),this.camera=e):Xt("Raycaster: Unsupported camera type: "+e.type)}setFromXRController(t){return gh.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(gh),this}intersectObject(t,e=!0,i=[]){return Cl(t,this,i,e),i.sort(xh),i}intersectObjects(t,e=!0,i=[]){for(let n=0,s=t.length;n<s;n++)Cl(t[n],this,i,e);return i.sort(xh),i}};function xh(r,t){return r.distance-t.distance}function Cl(r,t,e,i){let n=!0;if(r.layers.test(t.layers)&&r.raycast(t,e)===!1&&(n=!1),n===!0&&i===!0){let s=r.children;for(let o=0,a=s.length;o<a;o++)Cl(s[o],t,e,!0)}}var oc=class oc{constructor(t,e,i,n){this.elements=[1,0,0,1],t!==void 0&&this.set(t,e,i,n)}identity(){return this.set(1,0,0,1),this}fromArray(t,e=0){for(let i=0;i<4;i++)this.elements[i]=t[i+e];return this}set(t,e,i,n){let s=this.elements;return s[0]=t,s[2]=e,s[1]=i,s[3]=n,this}};oc.prototype.isMatrix2=!0;var Rl=oc;function ec(r,t,e,i){let n=Gu(i);switch(e){case $l:return r*t;case ko:return r*t/n.components*n.byteLength;case Oo:return r*t/n.components*n.byteLength;case An:return r*t*2/n.components*n.byteLength;case Ho:return r*t*2/n.components*n.byteLength;case Zl:return r*t*3/n.components*n.byteLength;case ri:return r*t*4/n.components*n.byteLength;case Go:return r*t*4/n.components*n.byteLength;case cr:case hr:return Math.floor((r+3)/4)*Math.floor((t+3)/4)*8;case dr:case ur:return Math.floor((r+3)/4)*Math.floor((t+3)/4)*16;case Wo:case Yo:return Math.max(r,16)*Math.max(t,8)/4;case Vo:case Xo:return Math.max(r,8)*Math.max(t,8)/2;case qo:case $o:case Qo:case Ko:return Math.floor((r+3)/4)*Math.floor((t+3)/4)*8;case Zo:case fr:case Jo:return Math.floor((r+3)/4)*Math.floor((t+3)/4)*16;case jo:return Math.floor((r+3)/4)*Math.floor((t+3)/4)*16;case ta:return Math.floor((r+4)/5)*Math.floor((t+3)/4)*16;case ea:return Math.floor((r+4)/5)*Math.floor((t+4)/5)*16;case ia:return Math.floor((r+5)/6)*Math.floor((t+4)/5)*16;case na:return Math.floor((r+5)/6)*Math.floor((t+5)/6)*16;case sa:return Math.floor((r+7)/8)*Math.floor((t+4)/5)*16;case ra:return Math.floor((r+7)/8)*Math.floor((t+5)/6)*16;case oa:return Math.floor((r+7)/8)*Math.floor((t+7)/8)*16;case aa:return Math.floor((r+9)/10)*Math.floor((t+4)/5)*16;case la:return Math.floor((r+9)/10)*Math.floor((t+5)/6)*16;case ca:return Math.floor((r+9)/10)*Math.floor((t+7)/8)*16;case ha:return Math.floor((r+9)/10)*Math.floor((t+9)/10)*16;case da:return Math.floor((r+11)/12)*Math.floor((t+9)/10)*16;case ua:return Math.floor((r+11)/12)*Math.floor((t+11)/12)*16;case fa:case pa:case ma:return Math.ceil(r/4)*Math.ceil(t/4)*16;case ga:case xa:return Math.ceil(r/4)*Math.ceil(t/4)*8;case pr:case ya:return Math.ceil(r/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function Gu(r){switch(r){case hi:case Wl:return{byteLength:1,components:1};case Ss:case Xl:case Di:return{byteLength:2,components:1};case Bo:case zo:return{byteLength:2,components:4};case Li:case Uo:case Si:return{byteLength:4,components:1};case Yl:case ql:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${r}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?Vt("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function Ad(){let r=null,t=!1,e=null,i=null;function n(s,o){i=r.requestAnimationFrame(n),e(s,o)}return{start:function(){t!==!0&&e!==null&&r!==null&&(i=r.requestAnimationFrame(n),t=!0)},stop:function(){r!==null&&r.cancelAnimationFrame(i),t=!1},setAnimationLoop:function(s){e=s},setContext:function(s){r=s}}}function Wu(r){let t=new WeakMap;function e(a,l){let c=a.array,h=a.usage,u=c.byteLength,d=r.createBuffer();r.bindBuffer(l,d),r.bufferData(l,c,h),a.onUploadCallback();let f;if(c instanceof Float32Array)f=r.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)f=r.HALF_FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?f=r.HALF_FLOAT:f=r.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=r.SHORT;else if(c instanceof Uint32Array)f=r.UNSIGNED_INT;else if(c instanceof Int32Array)f=r.INT;else if(c instanceof Int8Array)f=r.BYTE;else if(c instanceof Uint8Array)f=r.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=r.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:u}}function i(a,l,c){let h=l.array,u=l.updateRanges;if(r.bindBuffer(c,a),u.length===0)r.bufferSubData(c,0,h);else{u.sort((f,g)=>f.start-g.start);let d=0;for(let f=1;f<u.length;f++){let g=u[d],y=u[f];y.start<=g.start+g.count+1?g.count=Math.max(g.count,y.start+y.count-g.start):(++d,u[d]=y)}u.length=d+1;for(let f=0,g=u.length;f<g;f++){let y=u[f];r.bufferSubData(c,y.start*h.BYTES_PER_ELEMENT,h,y.start,y.count)}l.clearUpdateRanges()}l.onUploadCallback()}function n(a){return a.isInterleavedBufferAttribute&&(a=a.data),t.get(a)}function s(a){a.isInterleavedBufferAttribute&&(a=a.data);let l=t.get(a);l&&(r.deleteBuffer(l.buffer),t.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let h=t.get(a);(!h||h.version<a.version)&&t.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let c=t.get(a);if(c===void 0)t.set(a,e(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,a,l),c.version=a.version}}return{get:n,remove:s,update:o}}var Xu=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Yu=`#ifdef USE_ALPHAHASH
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
#endif`,qu=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,$u=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Zu=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Qu=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Ku=`#ifdef USE_AOMAP
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
#endif`,Ju=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,ju=`#ifdef USE_BATCHING
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
#endif`,tf=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,ef=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,nf=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,sf=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,rf=`#ifdef USE_IRIDESCENCE
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
#endif`,of=`#ifdef USE_BUMPMAP
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
#endif`,af=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,lf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,cf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,hf=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,df=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,uf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,ff=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,pf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,mf=`#define PI 3.141592653589793
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
} // validated`,gf=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,xf=`vec3 transformedNormal = objectNormal;
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
#endif`,yf=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,vf=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Mf=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,_f=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Sf="gl_FragColor = linearToOutputTexel( gl_FragColor );",bf=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,wf=`#ifdef USE_ENVMAP
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
#endif`,Ef=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,Tf=`#ifdef USE_ENVMAP
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
#endif`,Af=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Cf=`#ifdef USE_ENVMAP
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
#endif`,Rf=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,If=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Pf=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Lf=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Df=`#ifdef USE_GRADIENTMAP
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
}`,Nf=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Ff=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Uf=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Bf=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,zf=`#ifdef USE_ENVMAP
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
#endif`,kf=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Of=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Hf=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Gf=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Vf=`PhysicalMaterial material;
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
#endif`,Wf=`uniform sampler2D dfgLUT;
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
}`,Xf=`
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
#endif`,Yf=`#if defined( RE_IndirectDiffuse )
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
#endif`,qf=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,$f=`#ifdef USE_LIGHT_PROBES_GRID
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
#endif`,Zf=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Qf=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Kf=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Jf=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,jf=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,tp=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,ep=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,ip=`#if defined( USE_POINTS_UV )
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
#endif`,np=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,sp=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,rp=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,op=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,ap=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,lp=`#ifdef USE_MORPHTARGETS
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
#endif`,cp=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,hp=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,dp=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,up=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,fp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,pp=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,mp=`#ifdef USE_NORMALMAP
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
#endif`,gp=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,xp=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,yp=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,vp=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Mp=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,_p=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,Sp=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,bp=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,wp=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Ep=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Tp=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Ap=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Cp=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Rp=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Ip=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,Pp=`float getShadowMask() {
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
}`,Lp=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Dp=`#ifdef USE_SKINNING
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
#endif`,Np=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Fp=`#ifdef USE_SKINNING
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
#endif`,Up=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Bp=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,zp=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,kp=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,Op=`#ifdef USE_TRANSMISSION
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
#endif`,Hp=`#ifdef USE_TRANSMISSION
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
#endif`,Gp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Vp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Wp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Xp=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,Yp=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,qp=`uniform sampler2D t2D;
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
}`,$p=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Zp=`#ifdef ENVMAP_TYPE_CUBE
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
}`,Qp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Kp=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Jp=`#include <common>
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
}`,jp=`#if DEPTH_PACKING == 3200
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
}`,tm=`#define DISTANCE
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
}`,em=`#define DISTANCE
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
}`,im=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,nm=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,sm=`uniform float scale;
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
}`,rm=`uniform vec3 diffuse;
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
}`,om=`#include <common>
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
}`,am=`uniform vec3 diffuse;
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
}`,lm=`#define LAMBERT
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
}`,cm=`#define LAMBERT
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
}`,hm=`#define MATCAP
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
}`,dm=`#define MATCAP
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
}`,um=`#define NORMAL
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
}`,fm=`#define NORMAL
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
}`,pm=`#define PHONG
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
}`,mm=`#define PHONG
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
}`,gm=`#define STANDARD
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
}`,xm=`#define STANDARD
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
}`,ym=`#define TOON
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
}`,vm=`#define TOON
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
}`,Mm=`uniform float size;
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
}`,_m=`uniform vec3 diffuse;
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
}`,Sm=`#include <common>
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
}`,bm=`uniform vec3 color;
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
}`,wm=`uniform float rotation;
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
}`,Em=`uniform vec3 diffuse;
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
}`,se={alphahash_fragment:Xu,alphahash_pars_fragment:Yu,alphamap_fragment:qu,alphamap_pars_fragment:$u,alphatest_fragment:Zu,alphatest_pars_fragment:Qu,aomap_fragment:Ku,aomap_pars_fragment:Ju,batching_pars_vertex:ju,batching_vertex:tf,begin_vertex:ef,beginnormal_vertex:nf,bsdfs:sf,iridescence_fragment:rf,bumpmap_pars_fragment:of,clipping_planes_fragment:af,clipping_planes_pars_fragment:lf,clipping_planes_pars_vertex:cf,clipping_planes_vertex:hf,color_fragment:df,color_pars_fragment:uf,color_pars_vertex:ff,color_vertex:pf,common:mf,cube_uv_reflection_fragment:gf,defaultnormal_vertex:xf,displacementmap_pars_vertex:yf,displacementmap_vertex:vf,emissivemap_fragment:Mf,emissivemap_pars_fragment:_f,colorspace_fragment:Sf,colorspace_pars_fragment:bf,envmap_fragment:wf,envmap_common_pars_fragment:Ef,envmap_pars_fragment:Tf,envmap_pars_vertex:Af,envmap_physical_pars_fragment:zf,envmap_vertex:Cf,fog_vertex:Rf,fog_pars_vertex:If,fog_fragment:Pf,fog_pars_fragment:Lf,gradientmap_pars_fragment:Df,lightmap_pars_fragment:Nf,lights_lambert_fragment:Ff,lights_lambert_pars_fragment:Uf,lights_pars_begin:Bf,lights_toon_fragment:kf,lights_toon_pars_fragment:Of,lights_phong_fragment:Hf,lights_phong_pars_fragment:Gf,lights_physical_fragment:Vf,lights_physical_pars_fragment:Wf,lights_fragment_begin:Xf,lights_fragment_maps:Yf,lights_fragment_end:qf,lightprobes_pars_fragment:$f,logdepthbuf_fragment:Zf,logdepthbuf_pars_fragment:Qf,logdepthbuf_pars_vertex:Kf,logdepthbuf_vertex:Jf,map_fragment:jf,map_pars_fragment:tp,map_particle_fragment:ep,map_particle_pars_fragment:ip,metalnessmap_fragment:np,metalnessmap_pars_fragment:sp,morphinstance_vertex:rp,morphcolor_vertex:op,morphnormal_vertex:ap,morphtarget_pars_vertex:lp,morphtarget_vertex:cp,normal_fragment_begin:hp,normal_fragment_maps:dp,normal_pars_fragment:up,normal_pars_vertex:fp,normal_vertex:pp,normalmap_pars_fragment:mp,clearcoat_normal_fragment_begin:gp,clearcoat_normal_fragment_maps:xp,clearcoat_pars_fragment:yp,iridescence_pars_fragment:vp,opaque_fragment:Mp,packing:_p,premultiplied_alpha_fragment:Sp,project_vertex:bp,dithering_fragment:wp,dithering_pars_fragment:Ep,roughnessmap_fragment:Tp,roughnessmap_pars_fragment:Ap,shadowmap_pars_fragment:Cp,shadowmap_pars_vertex:Rp,shadowmap_vertex:Ip,shadowmask_pars_fragment:Pp,skinbase_vertex:Lp,skinning_pars_vertex:Dp,skinning_vertex:Np,skinnormal_vertex:Fp,specularmap_fragment:Up,specularmap_pars_fragment:Bp,tonemapping_fragment:zp,tonemapping_pars_fragment:kp,transmission_fragment:Op,transmission_pars_fragment:Hp,uv_pars_fragment:Gp,uv_pars_vertex:Vp,uv_vertex:Wp,worldpos_vertex:Xp,background_vert:Yp,background_frag:qp,backgroundCube_vert:$p,backgroundCube_frag:Zp,cube_vert:Qp,cube_frag:Kp,depth_vert:Jp,depth_frag:jp,distance_vert:tm,distance_frag:em,equirect_vert:im,equirect_frag:nm,linedashed_vert:sm,linedashed_frag:rm,meshbasic_vert:om,meshbasic_frag:am,meshlambert_vert:lm,meshlambert_frag:cm,meshmatcap_vert:hm,meshmatcap_frag:dm,meshnormal_vert:um,meshnormal_frag:fm,meshphong_vert:pm,meshphong_frag:mm,meshphysical_vert:gm,meshphysical_frag:xm,meshtoon_vert:ym,meshtoon_frag:vm,points_vert:Mm,points_frag:_m,shadow_vert:Sm,shadow_frag:bm,sprite_vert:wm,sprite_frag:Em},St={common:{diffuse:{value:new dt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Zt},alphaMap:{value:null},alphaMapTransform:{value:new Zt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Zt}},envmap:{envMap:{value:null},envMapRotation:{value:new Zt},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Zt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Zt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Zt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Zt},normalScale:{value:new Kt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Zt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Zt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Zt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Zt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new dt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new O},probesMax:{value:new O},probesResolution:{value:new O}},points:{diffuse:{value:new dt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Zt},alphaTest:{value:0},uvTransform:{value:new Zt}},sprite:{diffuse:{value:new dt(16777215)},opacity:{value:1},center:{value:new Kt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Zt},alphaMap:{value:null},alphaMapTransform:{value:new Zt},alphaTest:{value:0}}},Qi={basic:{uniforms:ei([St.common,St.specularmap,St.envmap,St.aomap,St.lightmap,St.fog]),vertexShader:se.meshbasic_vert,fragmentShader:se.meshbasic_frag},lambert:{uniforms:ei([St.common,St.specularmap,St.envmap,St.aomap,St.lightmap,St.emissivemap,St.bumpmap,St.normalmap,St.displacementmap,St.fog,St.lights,{emissive:{value:new dt(0)},envMapIntensity:{value:1}}]),vertexShader:se.meshlambert_vert,fragmentShader:se.meshlambert_frag},phong:{uniforms:ei([St.common,St.specularmap,St.envmap,St.aomap,St.lightmap,St.emissivemap,St.bumpmap,St.normalmap,St.displacementmap,St.fog,St.lights,{emissive:{value:new dt(0)},specular:{value:new dt(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:se.meshphong_vert,fragmentShader:se.meshphong_frag},standard:{uniforms:ei([St.common,St.envmap,St.aomap,St.lightmap,St.emissivemap,St.bumpmap,St.normalmap,St.displacementmap,St.roughnessmap,St.metalnessmap,St.fog,St.lights,{emissive:{value:new dt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:se.meshphysical_vert,fragmentShader:se.meshphysical_frag},toon:{uniforms:ei([St.common,St.aomap,St.lightmap,St.emissivemap,St.bumpmap,St.normalmap,St.displacementmap,St.gradientmap,St.fog,St.lights,{emissive:{value:new dt(0)}}]),vertexShader:se.meshtoon_vert,fragmentShader:se.meshtoon_frag},matcap:{uniforms:ei([St.common,St.bumpmap,St.normalmap,St.displacementmap,St.fog,{matcap:{value:null}}]),vertexShader:se.meshmatcap_vert,fragmentShader:se.meshmatcap_frag},points:{uniforms:ei([St.points,St.fog]),vertexShader:se.points_vert,fragmentShader:se.points_frag},dashed:{uniforms:ei([St.common,St.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:se.linedashed_vert,fragmentShader:se.linedashed_frag},depth:{uniforms:ei([St.common,St.displacementmap]),vertexShader:se.depth_vert,fragmentShader:se.depth_frag},normal:{uniforms:ei([St.common,St.bumpmap,St.normalmap,St.displacementmap,{opacity:{value:1}}]),vertexShader:se.meshnormal_vert,fragmentShader:se.meshnormal_frag},sprite:{uniforms:ei([St.sprite,St.fog]),vertexShader:se.sprite_vert,fragmentShader:se.sprite_frag},background:{uniforms:{uvTransform:{value:new Zt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:se.background_vert,fragmentShader:se.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Zt}},vertexShader:se.backgroundCube_vert,fragmentShader:se.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:se.cube_vert,fragmentShader:se.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:se.equirect_vert,fragmentShader:se.equirect_frag},distance:{uniforms:ei([St.common,St.displacementmap,{referencePosition:{value:new O},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:se.distance_vert,fragmentShader:se.distance_frag},shadow:{uniforms:ei([St.lights,St.fog,{color:{value:new dt(0)},opacity:{value:1}}]),vertexShader:se.shadow_vert,fragmentShader:se.shadow_frag}};Qi.physical={uniforms:ei([Qi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Zt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Zt},clearcoatNormalScale:{value:new Kt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Zt},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Zt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Zt},sheen:{value:0},sheenColor:{value:new dt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Zt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Zt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Zt},transmissionSamplerSize:{value:new Kt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Zt},attenuationDistance:{value:0},attenuationColor:{value:new dt(0)},specularColor:{value:new dt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Zt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Zt},anisotropyVector:{value:new Kt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Zt}}]),vertexShader:se.meshphysical_vert,fragmentShader:se.meshphysical_frag};var _a={r:0,b:0,g:0},Tm=new ge,Cd=new Zt;Cd.set(-1,0,0,0,1,0,0,0,1);function Am(r,t,e,i,n,s){let o=new dt(0),a=n===!0?0:1,l,c,h=null,u=0,d=null;function f(x){let S=x.isScene===!0?x.background:null;if(S&&S.isTexture){let M=x.backgroundBlurriness>0;S=t.get(S,M)}return S}function g(x){let S=!1,M=f(x);M===null?p(o,a):M&&M.isColor&&(p(M,1),S=!0);let b=r.xr.getEnvironmentBlendMode();b==="additive"?e.buffers.color.setClear(0,0,0,1,s):b==="alpha-blend"&&e.buffers.color.setClear(0,0,0,0,s),(r.autoClear||S)&&(e.buffers.depth.setTest(!0),e.buffers.depth.setMask(!0),e.buffers.color.setMask(!0),r.clear(r.autoClearColor,r.autoClearDepth,r.autoClearStencil))}function y(x,S){let M=f(S);M&&(M.isCubeTexture||M.mapping===ar)?(c===void 0&&(c=new Mt(new kt(1,1,1),new Ne({name:"BackgroundCubeMaterial",uniforms:qn(Qi.backgroundCube.uniforms),vertexShader:Qi.backgroundCube.vertexShader,fragmentShader:Qi.backgroundCube.fragmentShader,side:Ze,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(b,_,w){this.matrixWorld.copyPosition(w.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(c)),c.material.uniforms.envMap.value=M,c.material.uniforms.backgroundBlurriness.value=S.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(Tm.makeRotationFromEuler(S.backgroundRotation)).transpose(),M.isCubeTexture&&M.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(Cd),c.material.toneMapped=le.getTransfer(M.colorSpace)!==ve,(h!==M||u!==M.version||d!==r.toneMapping)&&(c.material.needsUpdate=!0,h=M,u=M.version,d=r.toneMapping),c.layers.enableAll(),x.unshift(c,c.geometry,c.material,0,0,null)):M&&M.isTexture&&(l===void 0&&(l=new Mt(new Vn(2,2),new Ne({name:"BackgroundMaterial",uniforms:qn(Qi.background.uniforms),vertexShader:Qi.background.vertexShader,fragmentShader:Qi.background.fragmentShader,side:Ii,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=M,l.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,l.material.toneMapped=le.getTransfer(M.colorSpace)!==ve,M.matrixAutoUpdate===!0&&M.updateMatrix(),l.material.uniforms.uvTransform.value.copy(M.matrix),(h!==M||u!==M.version||d!==r.toneMapping)&&(l.material.needsUpdate=!0,h=M,u=M.version,d=r.toneMapping),l.layers.enableAll(),x.unshift(l,l.geometry,l.material,0,0,null))}function p(x,S){x.getRGB(_a,Jl(r)),e.buffers.color.setClear(_a.r,_a.g,_a.b,S,s)}function m(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return o},setClearColor:function(x,S=1){o.set(x),a=S,p(o,a)},getClearAlpha:function(){return a},setClearAlpha:function(x){a=x,p(o,a)},render:g,addToRenderList:y,dispose:m}}function Cm(r,t){let e=r.getParameter(r.MAX_VERTEX_ATTRIBS),i={},n=d(null),s=n,o=!1;function a(R,P,N,I,U){let B=!1,G=u(R,I,N,P);s!==G&&(s=G,c(s.object)),B=f(R,I,N,U),B&&g(R,I,N,U),U!==null&&t.update(U,r.ELEMENT_ARRAY_BUFFER),(B||o)&&(o=!1,M(R,P,N,I),U!==null&&r.bindBuffer(r.ELEMENT_ARRAY_BUFFER,t.get(U).buffer))}function l(){return r.createVertexArray()}function c(R){return r.bindVertexArray(R)}function h(R){return r.deleteVertexArray(R)}function u(R,P,N,I){let U=I.wireframe===!0,B=i[P.id];B===void 0&&(B={},i[P.id]=B);let G=R.isInstancedMesh===!0?R.id:0,Q=B[G];Q===void 0&&(Q={},B[G]=Q);let F=Q[N.id];F===void 0&&(F={},Q[N.id]=F);let $=F[U];return $===void 0&&($=d(l()),F[U]=$),$}function d(R){let P=[],N=[],I=[];for(let U=0;U<e;U++)P[U]=0,N[U]=0,I[U]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:P,enabledAttributes:N,attributeDivisors:I,object:R,attributes:{},index:null}}function f(R,P,N,I){let U=s.attributes,B=P.attributes,G=0,Q=N.getAttributes();for(let F in Q)if(Q[F].location>=0){let K=U[F],at=B[F];if(at===void 0&&(F==="instanceMatrix"&&R.instanceMatrix&&(at=R.instanceMatrix),F==="instanceColor"&&R.instanceColor&&(at=R.instanceColor)),K===void 0||K.attribute!==at||at&&K.data!==at.data)return!0;G++}return s.attributesNum!==G||s.index!==I}function g(R,P,N,I){let U={},B=P.attributes,G=0,Q=N.getAttributes();for(let F in Q)if(Q[F].location>=0){let K=B[F];K===void 0&&(F==="instanceMatrix"&&R.instanceMatrix&&(K=R.instanceMatrix),F==="instanceColor"&&R.instanceColor&&(K=R.instanceColor));let at={};at.attribute=K,K&&K.data&&(at.data=K.data),U[F]=at,G++}s.attributes=U,s.attributesNum=G,s.index=I}function y(){let R=s.newAttributes;for(let P=0,N=R.length;P<N;P++)R[P]=0}function p(R){m(R,0)}function m(R,P){let N=s.newAttributes,I=s.enabledAttributes,U=s.attributeDivisors;N[R]=1,I[R]===0&&(r.enableVertexAttribArray(R),I[R]=1),U[R]!==P&&(r.vertexAttribDivisor(R,P),U[R]=P)}function x(){let R=s.newAttributes,P=s.enabledAttributes;for(let N=0,I=P.length;N<I;N++)P[N]!==R[N]&&(r.disableVertexAttribArray(N),P[N]=0)}function S(R,P,N,I,U,B,G){G===!0?r.vertexAttribIPointer(R,P,N,U,B):r.vertexAttribPointer(R,P,N,I,U,B)}function M(R,P,N,I){y();let U=I.attributes,B=N.getAttributes(),G=P.defaultAttributeValues;for(let Q in B){let F=B[Q];if(F.location>=0){let $=U[Q];if($===void 0&&(Q==="instanceMatrix"&&R.instanceMatrix&&($=R.instanceMatrix),Q==="instanceColor"&&R.instanceColor&&($=R.instanceColor)),$!==void 0){let K=$.normalized,at=$.itemSize,rt=t.get($);if(rt===void 0)continue;let It=rt.buffer,ut=rt.type,Pt=rt.bytesPerElement,q=ut===r.INT||ut===r.UNSIGNED_INT||$.gpuType===Uo;if($.isInterleavedBufferAttribute){let Z=$.data,ct=Z.stride,vt=$.offset;if(Z.isInstancedInterleavedBuffer){for(let lt=0;lt<F.locationSize;lt++)m(F.location+lt,Z.meshPerAttribute);R.isInstancedMesh!==!0&&I._maxInstanceCount===void 0&&(I._maxInstanceCount=Z.meshPerAttribute*Z.count)}else for(let lt=0;lt<F.locationSize;lt++)p(F.location+lt);r.bindBuffer(r.ARRAY_BUFFER,It);for(let lt=0;lt<F.locationSize;lt++)S(F.location+lt,at/F.locationSize,ut,K,ct*Pt,(vt+at/F.locationSize*lt)*Pt,q)}else{if($.isInstancedBufferAttribute){for(let Z=0;Z<F.locationSize;Z++)m(F.location+Z,$.meshPerAttribute);R.isInstancedMesh!==!0&&I._maxInstanceCount===void 0&&(I._maxInstanceCount=$.meshPerAttribute*$.count)}else for(let Z=0;Z<F.locationSize;Z++)p(F.location+Z);r.bindBuffer(r.ARRAY_BUFFER,It);for(let Z=0;Z<F.locationSize;Z++)S(F.location+Z,at/F.locationSize,ut,K,at*Pt,at/F.locationSize*Z*Pt,q)}}else if(G!==void 0){let K=G[Q];if(K!==void 0)switch(K.length){case 2:r.vertexAttrib2fv(F.location,K);break;case 3:r.vertexAttrib3fv(F.location,K);break;case 4:r.vertexAttrib4fv(F.location,K);break;default:r.vertexAttrib1fv(F.location,K)}}}}x()}function b(){T();for(let R in i){let P=i[R];for(let N in P){let I=P[N];for(let U in I){let B=I[U];for(let G in B)h(B[G].object),delete B[G];delete I[U]}}delete i[R]}}function _(R){if(i[R.id]===void 0)return;let P=i[R.id];for(let N in P){let I=P[N];for(let U in I){let B=I[U];for(let G in B)h(B[G].object),delete B[G];delete I[U]}}delete i[R.id]}function w(R){for(let P in i){let N=i[P];for(let I in N){let U=N[I];if(U[R.id]===void 0)continue;let B=U[R.id];for(let G in B)h(B[G].object),delete B[G];delete U[R.id]}}}function v(R){for(let P in i){let N=i[P],I=R.isInstancedMesh===!0?R.id:0,U=N[I];if(U!==void 0){for(let B in U){let G=U[B];for(let Q in G)h(G[Q].object),delete G[Q];delete U[B]}delete N[I],Object.keys(N).length===0&&delete i[P]}}}function T(){C(),o=!0,s!==n&&(s=n,c(s.object))}function C(){n.geometry=null,n.program=null,n.wireframe=!1}return{setup:a,reset:T,resetDefaultState:C,dispose:b,releaseStatesOfGeometry:_,releaseStatesOfObject:v,releaseStatesOfProgram:w,initAttributes:y,enableAttribute:p,disableUnusedAttributes:x}}function Rm(r,t,e){let i;function n(l){i=l}function s(l,c){r.drawArrays(i,l,c),e.update(c,i,1)}function o(l,c,h){h!==0&&(r.drawArraysInstanced(i,l,c,h),e.update(c,i,h))}function a(l,c,h){if(h===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,l,0,c,0,h);let d=0;for(let f=0;f<h;f++)d+=c[f];e.update(d,i,1)}this.setMode=n,this.render=s,this.renderInstances=o,this.renderMultiDraw=a}function Im(r,t,e,i){let n;function s(){if(n!==void 0)return n;if(t.has("EXT_texture_filter_anisotropic")===!0){let w=t.get("EXT_texture_filter_anisotropic");n=r.getParameter(w.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else n=0;return n}function o(w){return!(w!==ri&&i.convert(w)!==r.getParameter(r.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(w){let v=w===Di&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(w!==hi&&w!==Si&&!v&&i.convert(w)!==r.getParameter(r.IMPLEMENTATION_COLOR_READ_TYPE))}function l(w){if(w==="highp"){if(r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.HIGH_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.HIGH_FLOAT).precision>0)return"highp";w="mediump"}return w==="mediump"&&r.getShaderPrecisionFormat(r.VERTEX_SHADER,r.MEDIUM_FLOAT).precision>0&&r.getShaderPrecisionFormat(r.FRAGMENT_SHADER,r.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp",h=l(c);h!==c&&(Vt("WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let u=e.logarithmicDepthBuffer===!0,d=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control");e.reversedDepthBuffer===!0&&d===!1&&Vt("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let f=r.getParameter(r.MAX_TEXTURE_IMAGE_UNITS),g=r.getParameter(r.MAX_VERTEX_TEXTURE_IMAGE_UNITS),y=r.getParameter(r.MAX_TEXTURE_SIZE),p=r.getParameter(r.MAX_CUBE_MAP_TEXTURE_SIZE),m=r.getParameter(r.MAX_VERTEX_ATTRIBS),x=r.getParameter(r.MAX_VERTEX_UNIFORM_VECTORS),S=r.getParameter(r.MAX_VARYING_VECTORS),M=r.getParameter(r.MAX_FRAGMENT_UNIFORM_VECTORS),b=r.getParameter(r.MAX_SAMPLES),_=r.getParameter(r.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:s,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:u,reversedDepthBuffer:d,maxTextures:f,maxVertexTextures:g,maxTextureSize:y,maxCubemapSize:p,maxAttributes:m,maxVertexUniforms:x,maxVaryings:S,maxFragmentUniforms:M,maxSamples:b,samples:_}}function Pm(r){let t=this,e=null,i=0,n=!1,s=!1,o=new Ci,a=new Zt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){let f=u.length!==0||d||i!==0||n;return n=d,i=u.length,f},this.beginShadows=function(){s=!0,h(null)},this.endShadows=function(){s=!1},this.setGlobalState=function(u,d){e=h(u,d,0)},this.setState=function(u,d,f){let g=u.clippingPlanes,y=u.clipIntersection,p=u.clipShadows,m=r.get(u);if(!n||g===null||g.length===0||s&&!p)s?h(null):c();else{let x=s?0:i,S=x*4,M=m.clippingState||null;l.value=M,M=h(g,d,S,f);for(let b=0;b!==S;++b)M[b]=e[b];m.clippingState=M,this.numIntersection=y?this.numPlanes:0,this.numPlanes+=x}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=i>0),t.numPlanes=i,t.numIntersection=0}function h(u,d,f,g){let y=u!==null?u.length:0,p=null;if(y!==0){if(p=l.value,g!==!0||p===null){let m=f+y*4,x=d.matrixWorldInverse;a.getNormalMatrix(x),(p===null||p.length<m)&&(p=new Float32Array(m));for(let S=0,M=f;S!==y;++S,M+=4)o.copy(u[S]).applyMatrix4(x,a),o.normal.toArray(p,M),p[M+3]=o.constant}l.value=p,l.needsUpdate=!0}return t.numPlanes=y,t.numIntersection=0,p}}var Ts=4,Lm=6,Dm=20,Nm=256,gr=new Ms,od=new dt,ac=null,lc=0,cc=0,hc=!1,Fm=new O,$n=new O,ba=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(t,e=0,i=.1,n=100,s={}){let{size:o=256,position:a=Fm}=s;ac=this._renderer.getRenderTarget(),lc=this._renderer.getActiveCubeFace(),cc=this._renderer.getActiveMipmapLevel(),hc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(t,i,n,l,a),e>0&&this._blur(l,0,0,e),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=cd(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=ld(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodMeshes.length;t++)this._lodMeshes[t].geometry.dispose()}_cleanup(t){this._renderer.setRenderTarget(ac,lc,cc),this._renderer.xr.enabled=hc,t.scissorTest=!1,Es(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===En||t.mapping===Yn?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),ac=this._renderer.getRenderTarget(),lc=this._renderer.getActiveCubeFace(),cc=this._renderer.getActiveMipmapLevel(),hc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=e||this._allocateTargets();return this._textureToCubeUV(t,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,i={magFilter:Ge,minFilter:Ge,generateMipmaps:!1,type:Di,format:ri,colorSpace:ks,depthBuffer:!1},n=ad(t,e,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=ad(t,e,i);let{_lodMax:s}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=Um(s)),this._blurMaterial=zm(s,t,e),this._ggxMaterial=Bm(s,t,e)}return n}_compileMaterial(t){let e=new Mt(new me,t);this._renderer.compile(e,gr)}_sceneToCubeUV(t,e,i,n,s){let l=new ti(90,1,e,i),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],u=this._renderer,d=u.autoClear,f=u.toneMapping;u.getClearColor(od),u.toneMapping=Pi,u.autoClear=!1,u.state.buffers.depth.getReversed()&&(u.setRenderTarget(n),u.clearDepth(),u.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new Mt(new kt,new Se({name:"PMREM.Background",side:Ze,depthWrite:!1,depthTest:!1})));let y=this._backgroundBox,p=y.material,m=!1,x=t.background;x?x.isColor&&(p.color.copy(x),t.background=null,m=!0):(p.color.copy(od),m=!0);for(let S=0;S<6;S++){let M=S%3;M===0?(l.up.set(0,c[S],0),l.position.set(s.x,s.y,s.z),l.lookAt(s.x+h[S],s.y,s.z)):M===1?(l.up.set(0,0,c[S]),l.position.set(s.x,s.y,s.z),l.lookAt(s.x,s.y+h[S],s.z)):(l.up.set(0,c[S],0),l.position.set(s.x,s.y,s.z),l.lookAt(s.x,s.y,s.z+h[S]));let b=this._cubeSize;Es(n,M*b,S>2?b:0,b,b),u.setRenderTarget(n),m&&u.render(y,l),u.render(t,l)}u.toneMapping=f,u.autoClear=d,t.background=x}_textureToCubeUV(t,e){let i=this._renderer,n=t.mapping===En||t.mapping===Yn;n?(this._cubemapMaterial===null&&(this._cubemapMaterial=cd()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=ld());let s=n?this._cubemapMaterial:this._equirectMaterial,o=this._lodMeshes[0];o.material=s;let a=s.uniforms;a.envMap.value=t;let l=this._cubeSize;Es(e,0,0,3*l,2*l),i.setRenderTarget(e),i.render(o,gr)}_applyPMREM(t){let e=this._renderer,i=e.autoClear;e.autoClear=!1;let n=this._lodMeshes.length;for(let s=1;s<n;s++)this._applyGGXFilter(t,s-1,s);e.autoClear=i}_applyGGXFilter(t,e,i){let n=this._renderer,s=this._pingPongRenderTarget,o=this._ggxMaterial,a=this._lodMeshes[i];a.material=o;let l=o.uniforms,c=i/(this._lodMeshes.length-1),h=e/(this._lodMeshes.length-1),u=Math.sqrt(c*c-h*h),d=c*1.25,f=u*d,{_lodMax:g}=this,y=this._sizeLods[i],p=3*y*(i>g-Ts?i-g+Ts:0),m=4*(this._cubeSize-y);l.envMap.value=t.texture,l.roughness.value=f,l.mipInt.value=g-e,Es(s,p,m,3*y,2*y),n.setRenderTarget(s),n.render(a,gr),l.envMap.value=s.texture,l.roughness.value=0,l.mipInt.value=g-i,Es(t,p,m,3*y,2*y),n.setRenderTarget(t),n.render(a,gr)}_blur(t,e,i,n){let s=this._pingPongRenderTarget,o=Math.min(n,Math.PI)/Math.SQRT2;this._blurPass(t,s,e,i,o),this._blurPass(s,t,i,i,o)}_blurPass(t,e,i,n,s){let o=this._renderer,a=this._blurMaterial,l=this._lodMeshes[n];l.material=a;let c=a.uniforms;c.envMap.value=t.texture,c.sigma.value=s,c.mipInt.value=this._lodMax-i;let h=this._sizeLods[n],u=3*h*(n>this._lodMax-Ts?n-this._lodMax+Ts:0),d=4*(this._cubeSize-h);Es(e,u,d,3*h,2*h),o.setRenderTarget(e),o.render(l,gr)}};function Um(r){let t=[],e=[],i=r,n=r-Ts+1+Lm;for(let s=0;s<n;s++){let o=Math.pow(2,i);t.push(o);let a=1/(o-2),l=-a,c=1+a,h=[l,l,c,l,c,c,l,l,c,c,l,c],u=6,d=6,f=3,g=new Float32Array(f*d*u),y=new Float32Array(f*d*u);for(let m=0;m<u;m++){let x=m%3*2/3-1,S=m>2?0:-1,M=[x,S,0,x+2/3,S,0,x+2/3,S+1,0,x,S,0,x+2/3,S+1,0,x,S+1,0];g.set(M,f*d*m);for(let b=0;b<d;b++){let _=h[b*2]*2-1,w=h[b*2+1]*2-1;m===0?$n.set(1,w,_):m===1?$n.set(-_,1,-w):m===2?$n.set(-_,w,1):m===3?$n.set(-1,w,-_):m===4?$n.set(-_,-1,w):$n.set(_,w,-1),$n.toArray(y,(m*d+b)*f)}}let p=new me;p.setAttribute("position",new te(g,f)),p.setAttribute("outputDirection",new te(y,f)),e.push(new Mt(p,null)),i>Ts&&i--}return{lodMeshes:e,sizeLods:t}}function ad(r,t,e){let i=new ci(r,t,e);return i.texture.mapping=ar,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function Es(r,t,e,i,n){r.viewport.set(t,e,i,n),r.scissor.set(t,e,i,n)}function Bm(r,t,e){return new Ne({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:Nm,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${r}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Ta(),fragmentShader:`

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
		`,blending:qi,depthTest:!1,depthWrite:!1})}function zm(r,t,e){return new Ne({name:"SphericalGaussianBlur",defines:{SAMPLES:Dm,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${r}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:Ta(),fragmentShader:`

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
		`,blending:qi,depthTest:!1,depthWrite:!1})}function ld(){return new Ne({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Ta(),fragmentShader:`

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
		`,blending:qi,depthTest:!1,depthWrite:!1})}function cd(){return new Ne({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Ta(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:qi,depthTest:!1,depthWrite:!1})}function Ta(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var wa=class extends ci{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let i={width:t,height:t,depth:1},n=[i,i,i,i,i,i];this.texture=new qs(n),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},n=new kt(5,5,5),s=new Ne({name:"CubemapFromEquirect",uniforms:qn(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:Ze,blending:qi});s.uniforms.tEquirect.value=e;let o=new Mt(n,s),a=e.minFilter;return e.minFilter===$i&&(e.minFilter=Ge),new Io(1,10,this).update(t,o),e.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(t,e=!0,i=!0,n=!0){let s=t.getRenderTarget();for(let o=0;o<6;o++)t.setRenderTarget(this,o),t.clear(e,i,n);t.setRenderTarget(s)}};function km(r){let t=new WeakMap,e=new WeakMap,i=null;function n(d,f=!1){return d==null?null:f?o(d):s(d)}function s(d){if(d&&d.isTexture){let f=d.mapping;if(f===Do||f===No)if(t.has(d)){let g=t.get(d).texture;return a(g,d.mapping)}else{let g=d.image;if(g&&g.height>0){let y=new wa(g.height);return y.fromEquirectangularTexture(r,d),t.set(d,y),d.addEventListener("dispose",c),a(y.texture,d.mapping)}else return null}}return d}function o(d){if(d&&d.isTexture){let f=d.mapping,g=f===Do||f===No,y=f===En||f===Yn;if(g||y){let p=e.get(d),m=p!==void 0?p.texture.pmremVersion:0;if(d.isRenderTargetTexture&&d.pmremVersion!==m)return i===null&&(i=new ba(r)),p=g?i.fromEquirectangular(d,p):i.fromCubemap(d,p),p.texture.pmremVersion=d.pmremVersion,e.set(d,p),p.texture;if(p!==void 0)return p.texture;{let x=d.image;return g&&x&&x.height>0||y&&x&&l(x)?(i===null&&(i=new ba(r)),p=g?i.fromEquirectangular(d):i.fromCubemap(d),p.texture.pmremVersion=d.pmremVersion,e.set(d,p),d.addEventListener("dispose",h),p.texture):null}}}return d}function a(d,f){return f===Do?d.mapping=En:f===No&&(d.mapping=Yn),d}function l(d){let f=0,g=6;for(let y=0;y<g;y++)d[y]!==void 0&&f++;return f===g}function c(d){let f=d.target;f.removeEventListener("dispose",c);let g=t.get(f);g!==void 0&&(t.delete(f),g.dispose())}function h(d){let f=d.target;f.removeEventListener("dispose",h);let g=e.get(f);g!==void 0&&(e.delete(f),g.dispose())}function u(){t=new WeakMap,e=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:n,dispose:u}}function Om(r){let t={};function e(i){if(t[i]!==void 0)return t[i];let n=r.getExtension(i);return t[i]=n,n}return{has:function(i){return e(i)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(i){let n=e(i);return n===null&&zn("WebGLRenderer: "+i+" extension not supported."),n}}}function Hm(r,t,e,i){let n={},s=new WeakMap;function o(u){let d=u.target;d.index!==null&&t.remove(d.index);for(let g in d.attributes)t.remove(d.attributes[g]);d.removeEventListener("dispose",o),delete n[d.id];let f=s.get(d);f&&(t.remove(f),s.delete(d)),i.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,e.memory.geometries--}function a(u,d){return n[d.id]===!0||(d.addEventListener("dispose",o),n[d.id]=!0,e.memory.geometries++),d}function l(u){let d=u.attributes;for(let f in d)t.update(d[f],r.ARRAY_BUFFER)}function c(u){let d=[],f=u.index,g=u.attributes.position,y=0;if(g===void 0)return;if(f!==null){let x=f.array;y=f.version;for(let S=0,M=x.length;S<M;S+=3){let b=x[S+0],_=x[S+1],w=x[S+2];d.push(b,_,_,w,w,b)}}else{let x=g.array;y=g.version;for(let S=0,M=x.length/3-1;S<M;S+=3){let b=S+0,_=S+1,w=S+2;d.push(b,_,_,w,w,b)}}let p=new(g.count>=65535?Xs:Ws)(d,1);p.version=y;let m=s.get(u);m&&t.remove(m),s.set(u,p)}function h(u){let d=s.get(u);if(d){let f=u.index;f!==null&&d.version<f.version&&c(u)}else c(u);return s.get(u)}return{get:a,update:l,getWireframeAttribute:h}}function Gm(r,t,e){let i;function n(u){i=u}let s,o;function a(u){s=u.type,o=u.bytesPerElement}function l(u,d){r.drawElements(i,d,s,u*o),e.update(d,i,1)}function c(u,d,f){f!==0&&(r.drawElementsInstanced(i,d,s,u*o,f),e.update(d,i,f))}function h(u,d,f){if(f===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,d,0,s,u,0,f);let y=0;for(let p=0;p<f;p++)y+=d[p];e.update(y,i,1)}this.setMode=n,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=h}function Vm(r){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function i(s,o,a){switch(e.calls++,o){case r.TRIANGLES:e.triangles+=a*(s/3);break;case r.LINES:e.lines+=a*(s/2);break;case r.LINE_STRIP:e.lines+=a*(s-1);break;case r.LINE_LOOP:e.lines+=a*s;break;case r.POINTS:e.points+=a*s;break;default:Xt("WebGLInfo: Unknown draw mode:",o);break}}function n(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:n,update:i}}function Wm(r,t,e){let i=new WeakMap,n=new De;function s(o,a,l){let c=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,u=h!==void 0?h.length:0,d=i.get(a);if(d===void 0||d.count!==u){let T=function(){w.dispose(),i.delete(a),a.removeEventListener("dispose",T)};d!==void 0&&d.texture.dispose();let f=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,y=a.morphAttributes.color!==void 0,p=a.morphAttributes.position||[],m=a.morphAttributes.normal||[],x=a.morphAttributes.color||[],S=0;f===!0&&(S=1),g===!0&&(S=2),y===!0&&(S=3);let M=a.attributes.position.count*S,b=1;M>t.maxTextureSize&&(b=Math.ceil(M/t.maxTextureSize),M=t.maxTextureSize);let _=new Float32Array(M*b*4*u),w=new Gs(_,M,b,u);w.type=Si,w.needsUpdate=!0;let v=S*4;for(let C=0;C<u;C++){let R=p[C],P=m[C],N=x[C],I=M*b*4*C;for(let U=0;U<R.count;U++){let B=U*v;f===!0&&(n.fromBufferAttribute(R,U),_[I+B+0]=n.x,_[I+B+1]=n.y,_[I+B+2]=n.z,_[I+B+3]=0),g===!0&&(n.fromBufferAttribute(P,U),_[I+B+4]=n.x,_[I+B+5]=n.y,_[I+B+6]=n.z,_[I+B+7]=0),y===!0&&(n.fromBufferAttribute(N,U),_[I+B+8]=n.x,_[I+B+9]=n.y,_[I+B+10]=n.z,_[I+B+11]=N.itemSize===4?n.w:1)}}d={count:u,texture:w,size:new Kt(M,b)},i.set(a,d),a.addEventListener("dispose",T)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(r,"morphTexture",o.morphTexture,e);else{let f=0;for(let y=0;y<c.length;y++)f+=c[y];let g=a.morphTargetsRelative?1:1-f;l.getUniforms().setValue(r,"morphTargetBaseInfluence",g),l.getUniforms().setValue(r,"morphTargetInfluences",c)}l.getUniforms().setValue(r,"morphTargetsTexture",d.texture,e),l.getUniforms().setValue(r,"morphTargetsTextureSize",d.size)}return{update:s}}function Xm(r,t,e,i,n){let s=new WeakMap;function o(c){let h=n.render.frame,u=c.geometry,d=t.get(c,u);if(s.get(d)!==h&&(t.update(d),s.set(d,h)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),s.get(c)!==h&&(e.update(c.instanceMatrix,r.ARRAY_BUFFER),c.instanceColor!==null&&e.update(c.instanceColor,r.ARRAY_BUFFER),s.set(c,h))),c.isSkinnedMesh){let f=c.skeleton;s.get(f)!==h&&(f.update(),s.set(f,h))}return d}function a(){s=new WeakMap}function l(c){let h=c.target;h.removeEventListener("dispose",l),i.releaseStatesOfObject(h),e.remove(h.instanceMatrix),h.instanceColor!==null&&e.remove(h.instanceColor)}return{update:o,dispose:a}}var Ym={[Ul]:"LINEAR_TONE_MAPPING",[Bl]:"REINHARD_TONE_MAPPING",[zl]:"CINEON_TONE_MAPPING",[kl]:"ACES_FILMIC_TONE_MAPPING",[Hl]:"AGX_TONE_MAPPING",[Gl]:"NEUTRAL_TONE_MAPPING",[Ol]:"CUSTOM_TONE_MAPPING"};function qm(r,t,e,i,n,s){let o=new ci(t,e,{type:r,depthBuffer:n,stencilBuffer:s,samples:i?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),a=null,l=null,c=new me;c.setAttribute("position",new re([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new re([0,2,0,0,2,0],2));let h=new go({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),u=new Mt(c,h),d=new Ms(-1,1,1,-1,0,1),f=null,g=null,y=!1,p,m=null,x=[],S=!1;this.setSize=function(M,b){o.setSize(M,b),a!==null&&a.setSize(M,b),l!==null&&l.setSize(M,b);for(let _=0;_<x.length;_++){let w=x[_];w.setSize&&w.setSize(M,b)}},this.setEffects=function(M){x=M,S=x.length>0&&x[0].isRenderPass===!0;let b=o.width,_=o.height;x.length>0&&a===null&&(a=new ci(b,_,{type:Di,depthBuffer:!1,stencilBuffer:!1}),l=new ci(b,_,{type:Di,depthBuffer:!1,stencilBuffer:!1}));for(let w=0;w<x.length;w++){let v=x[w];v.setSize&&v.setSize(b,_)}},this.begin=function(M,b){if(y||M.toneMapping===Pi&&x.length===0)return!1;if(m=b,b!==null){let _=b.width,w=b.height;(o.width!==_||o.height!==w)&&this.setSize(_,w)}return S===!1&&M.setRenderTarget(o),p=M.toneMapping,M.toneMapping=Pi,!0},this.hasRenderPass=function(){return S},this.end=function(M,b){M.toneMapping=p,y=!0;let _=o,w=a;for(let v=0;v<x.length;v++){let T=x[v];T.enabled!==!1&&(T.render(M,w,_,b),T.needsSwap!==!1&&(_=w,w=w===a?l:a))}if(f!==M.outputColorSpace||g!==M.toneMapping){f=M.outputColorSpace,g=M.toneMapping,h.defines={},le.getTransfer(f)===ve&&(h.defines.SRGB_TRANSFER="");let v=Ym[g];v&&(h.defines[v]=""),h.needsUpdate=!0}h.uniforms.tDiffuse.value=_.texture,M.setRenderTarget(m),M.render(u,d),m=null,y=!1},this.isCompositing=function(){return y},this.dispose=function(){o.dispose(),a!==null&&a.dispose(),l!==null&&l.dispose(),c.dispose(),h.dispose()}}var Rd=new si,fc=new vn(1,1),Id=new Gs,Pd=new co,Ld=new qs,hd=[],dd=[],ud=new Float32Array(16),fd=new Float32Array(9),pd=new Float32Array(4);function Cs(r,t,e){let i=r[0];if(i<=0||i>0)return r;let n=t*e,s=hd[n];if(s===void 0&&(s=new Float32Array(n),hd[n]=s),t!==0){i.toArray(s,0);for(let o=1,a=0;o!==t;++o)a+=e,r[o].toArray(s,a)}return s}function We(r,t){if(r.length!==t.length)return!1;for(let e=0,i=r.length;e<i;e++)if(r[e]!==t[e])return!1;return!0}function Xe(r,t){for(let e=0,i=t.length;e<i;e++)r[e]=t[e]}function Aa(r,t){let e=dd[t];e===void 0&&(e=new Int32Array(t),dd[t]=e);for(let i=0;i!==t;++i)e[i]=r.allocateTextureUnit();return e}function $m(r,t){let e=this.cache;e[0]!==t&&(r.uniform1f(this.addr,t),e[0]=t)}function Zm(r,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(r.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(We(e,t))return;r.uniform2fv(this.addr,t),Xe(e,t)}}function Qm(r,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(r.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(r.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(We(e,t))return;r.uniform3fv(this.addr,t),Xe(e,t)}}function Km(r,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(r.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(We(e,t))return;r.uniform4fv(this.addr,t),Xe(e,t)}}function Jm(r,t){let e=this.cache,i=t.elements;if(i===void 0){if(We(e,t))return;r.uniformMatrix2fv(this.addr,!1,t),Xe(e,t)}else{if(We(e,i))return;pd.set(i),r.uniformMatrix2fv(this.addr,!1,pd),Xe(e,i)}}function jm(r,t){let e=this.cache,i=t.elements;if(i===void 0){if(We(e,t))return;r.uniformMatrix3fv(this.addr,!1,t),Xe(e,t)}else{if(We(e,i))return;fd.set(i),r.uniformMatrix3fv(this.addr,!1,fd),Xe(e,i)}}function t0(r,t){let e=this.cache,i=t.elements;if(i===void 0){if(We(e,t))return;r.uniformMatrix4fv(this.addr,!1,t),Xe(e,t)}else{if(We(e,i))return;ud.set(i),r.uniformMatrix4fv(this.addr,!1,ud),Xe(e,i)}}function e0(r,t){let e=this.cache;e[0]!==t&&(r.uniform1i(this.addr,t),e[0]=t)}function i0(r,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(r.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(We(e,t))return;r.uniform2iv(this.addr,t),Xe(e,t)}}function n0(r,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(r.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(We(e,t))return;r.uniform3iv(this.addr,t),Xe(e,t)}}function s0(r,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(r.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(We(e,t))return;r.uniform4iv(this.addr,t),Xe(e,t)}}function r0(r,t){let e=this.cache;e[0]!==t&&(r.uniform1ui(this.addr,t),e[0]=t)}function o0(r,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(r.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(We(e,t))return;r.uniform2uiv(this.addr,t),Xe(e,t)}}function a0(r,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(r.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(We(e,t))return;r.uniform3uiv(this.addr,t),Xe(e,t)}}function l0(r,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(r.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(We(e,t))return;r.uniform4uiv(this.addr,t),Xe(e,t)}}function c0(r,t,e){let i=this.cache,n=e.allocateTextureUnit();i[0]!==n&&(r.uniform1i(this.addr,n),i[0]=n);let s;this.type===r.SAMPLER_2D_SHADOW?(fc.compareFunction=e.isReversedDepthBuffer()?Ma:va,s=fc):s=Rd,e.setTexture2D(t||s,n)}function h0(r,t,e){let i=this.cache,n=e.allocateTextureUnit();i[0]!==n&&(r.uniform1i(this.addr,n),i[0]=n),e.setTexture3D(t||Pd,n)}function d0(r,t,e){let i=this.cache,n=e.allocateTextureUnit();i[0]!==n&&(r.uniform1i(this.addr,n),i[0]=n),e.setTextureCube(t||Ld,n)}function u0(r,t,e){let i=this.cache,n=e.allocateTextureUnit();i[0]!==n&&(r.uniform1i(this.addr,n),i[0]=n),e.setTexture2DArray(t||Id,n)}function f0(r){switch(r){case 5126:return $m;case 35664:return Zm;case 35665:return Qm;case 35666:return Km;case 35674:return Jm;case 35675:return jm;case 35676:return t0;case 5124:case 35670:return e0;case 35667:case 35671:return i0;case 35668:case 35672:return n0;case 35669:case 35673:return s0;case 5125:return r0;case 36294:return o0;case 36295:return a0;case 36296:return l0;case 35678:case 36198:case 36298:case 36306:case 35682:return c0;case 35679:case 36299:case 36307:return h0;case 35680:case 36300:case 36308:case 36293:return d0;case 36289:case 36303:case 36311:case 36292:return u0}}function p0(r,t){r.uniform1fv(this.addr,t)}function m0(r,t){let e=Cs(t,this.size,2);r.uniform2fv(this.addr,e)}function g0(r,t){let e=Cs(t,this.size,3);r.uniform3fv(this.addr,e)}function x0(r,t){let e=Cs(t,this.size,4);r.uniform4fv(this.addr,e)}function y0(r,t){let e=Cs(t,this.size,4);r.uniformMatrix2fv(this.addr,!1,e)}function v0(r,t){let e=Cs(t,this.size,9);r.uniformMatrix3fv(this.addr,!1,e)}function M0(r,t){let e=Cs(t,this.size,16);r.uniformMatrix4fv(this.addr,!1,e)}function _0(r,t){r.uniform1iv(this.addr,t)}function S0(r,t){r.uniform2iv(this.addr,t)}function b0(r,t){r.uniform3iv(this.addr,t)}function w0(r,t){r.uniform4iv(this.addr,t)}function E0(r,t){r.uniform1uiv(this.addr,t)}function T0(r,t){r.uniform2uiv(this.addr,t)}function A0(r,t){r.uniform3uiv(this.addr,t)}function C0(r,t){r.uniform4uiv(this.addr,t)}function R0(r,t,e){let i=this.cache,n=t.length,s=Aa(e,n);We(i,s)||(r.uniform1iv(this.addr,s),Xe(i,s));let o;this.type===r.SAMPLER_2D_SHADOW?o=fc:o=Rd;for(let a=0;a!==n;++a)e.setTexture2D(t[a]||o,s[a])}function I0(r,t,e){let i=this.cache,n=t.length,s=Aa(e,n);We(i,s)||(r.uniform1iv(this.addr,s),Xe(i,s));for(let o=0;o!==n;++o)e.setTexture3D(t[o]||Pd,s[o])}function P0(r,t,e){let i=this.cache,n=t.length,s=Aa(e,n);We(i,s)||(r.uniform1iv(this.addr,s),Xe(i,s));for(let o=0;o!==n;++o)e.setTextureCube(t[o]||Ld,s[o])}function L0(r,t,e){let i=this.cache,n=t.length,s=Aa(e,n);We(i,s)||(r.uniform1iv(this.addr,s),Xe(i,s));for(let o=0;o!==n;++o)e.setTexture2DArray(t[o]||Id,s[o])}function D0(r){switch(r){case 5126:return p0;case 35664:return m0;case 35665:return g0;case 35666:return x0;case 35674:return y0;case 35675:return v0;case 35676:return M0;case 5124:case 35670:return _0;case 35667:case 35671:return S0;case 35668:case 35672:return b0;case 35669:case 35673:return w0;case 5125:return E0;case 36294:return T0;case 36295:return A0;case 36296:return C0;case 35678:case 36198:case 36298:case 36306:case 35682:return R0;case 35679:case 36299:case 36307:return I0;case 35680:case 36300:case 36308:case 36293:return P0;case 36289:case 36303:case 36311:case 36292:return L0}}var pc=class{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.setValue=f0(e.type)}},mc=class{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=D0(e.type)}},gc=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,i){let n=this.seq;for(let s=0,o=n.length;s!==o;++s){let a=n[s];a.setValue(t,e[a.id],i)}}},dc=/(\w+)(\])?(\[|\.)?/g;function md(r,t){r.seq.push(t),r.map[t.id]=t}function N0(r,t,e){let i=r.name,n=i.length;for(dc.lastIndex=0;;){let s=dc.exec(i),o=dc.lastIndex,a=s[1],l=s[2]==="]",c=s[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===n){md(e,c===void 0?new pc(a,r,t):new mc(a,r,t));break}else{let u=e.map[a];u===void 0&&(u=new gc(a),md(e,u)),e=u}}}var As=class{constructor(t,e){this.seq=[],this.map={};let i=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let o=0;o<i;++o){let a=t.getActiveUniform(e,o),l=t.getUniformLocation(e,a.name);N0(a,l,this)}let n=[],s=[];for(let o of this.seq)o.type===t.SAMPLER_2D_SHADOW||o.type===t.SAMPLER_CUBE_SHADOW||o.type===t.SAMPLER_2D_ARRAY_SHADOW?n.push(o):s.push(o);n.length>0&&(this.seq=n.concat(s))}setValue(t,e,i,n){let s=this.map[e];s!==void 0&&s.setValue(t,i,n)}setOptional(t,e,i){let n=e[i];n!==void 0&&this.setValue(t,i,n)}static upload(t,e,i,n){for(let s=0,o=e.length;s!==o;++s){let a=e[s],l=i[a.id];l.needsUpdate!==!1&&a.setValue(t,l.value,n)}}static seqWithValue(t,e){let i=[];for(let n=0,s=t.length;n!==s;++n){let o=t[n];o.id in e&&i.push(o)}return i}};function gd(r,t,e){let i=r.createShader(t);return r.shaderSource(i,e),r.compileShader(i),i}var F0=37297,U0=0;function B0(r,t){let e=r.split(`
`),i=[],n=Math.max(t-6,0),s=Math.min(t+6,e.length);for(let o=n;o<s;o++){let a=o+1;i.push(`${a===t?">":" "} ${a}: ${e[o]}`)}return i.join(`
`)}var xd=new Zt;function z0(r){le._getMatrix(xd,le.workingColorSpace,r);let t=`mat3( ${xd.elements.map(e=>e.toFixed(4))} )`;switch(le.getTransfer(r)){case Os:return[t,"LinearTransferOETF"];case ve:return[t,"sRGBTransferOETF"];default:return Vt("WebGLProgram: Unsupported color space: ",r),[t,"LinearTransferOETF"]}}function yd(r,t,e){let i=r.getShaderParameter(t,r.COMPILE_STATUS),s=(r.getShaderInfoLog(t)||"").trim();if(i&&s==="")return"";let o=/ERROR: 0:(\d+)/.exec(s);if(o){let a=parseInt(o[1]);return e.toUpperCase()+`

`+s+`

`+B0(r.getShaderSource(t),a)}else return s}function k0(r,t){let e=z0(t);return[`vec4 ${r}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}var O0={[Ul]:"Linear",[Bl]:"Reinhard",[zl]:"Cineon",[kl]:"ACESFilmic",[Hl]:"AgX",[Gl]:"Neutral",[Ol]:"Custom"};function H0(r,t){let e=O0[t];return e===void 0?(Vt("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+r+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+r+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}var Sa=new O;function G0(){le.getLuminanceCoefficients(Sa);let r=Sa.x.toFixed(4),t=Sa.y.toFixed(4),e=Sa.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${r}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function V0(r){return[r.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",r.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(yr).join(`
`)}function W0(r){let t=[];for(let e in r){let i=r[e];i!==!1&&t.push("#define "+e+" "+i)}return t.join(`
`)}function X0(r,t){let e={},i=r.getProgramParameter(t,r.ACTIVE_ATTRIBUTES);for(let n=0;n<i;n++){let s=r.getActiveAttrib(t,n),o=s.name,a=1;s.type===r.FLOAT_MAT2&&(a=2),s.type===r.FLOAT_MAT3&&(a=3),s.type===r.FLOAT_MAT4&&(a=4),e[o]={type:s.type,location:r.getAttribLocation(t,o),locationSize:a}}return e}function yr(r){return r!==""}function vd(r,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return r.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Md(r,t){return r.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var Y0=/^[ \t]*#include +<([\w\d./]+)>/gm;function xc(r){return r.replace(Y0,$0)}var q0=new Map;function $0(r,t){let e=se[t];if(e===void 0){let i=q0.get(t);if(i!==void 0)e=se[i],Vt('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,i);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">")}return xc(e)}var Z0=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function _d(r){return r.replace(Z0,Q0)}function Q0(r,t,e,i){let n="";for(let s=parseInt(t);s<parseInt(e);s++)n+=i.replace(/\[\s*i\s*\]/g,"[ "+s+" ]").replace(/UNROLLED_LOOP_INDEX/g,s);return n}function Sd(r){let t=`precision ${r.precision} float;
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
#define LOW_PRECISION`),t}var K0={[Wn]:"SHADOWMAP_TYPE_PCF",[_s]:"SHADOWMAP_TYPE_VSM"};function J0(r){return K0[r.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var j0={[En]:"ENVMAP_TYPE_CUBE",[Yn]:"ENVMAP_TYPE_CUBE",[ar]:"ENVMAP_TYPE_CUBE_UV"};function tg(r){return r.envMap===!1?"ENVMAP_TYPE_CUBE":j0[r.envMapMode]||"ENVMAP_TYPE_CUBE"}var eg={[Yn]:"ENVMAP_MODE_REFRACTION"};function ig(r){return r.envMap===!1?"ENVMAP_MODE_REFLECTION":eg[r.envMapMode]||"ENVMAP_MODE_REFLECTION"}var ng={[or]:"ENVMAP_BLENDING_MULTIPLY",[kh]:"ENVMAP_BLENDING_MIX",[Oh]:"ENVMAP_BLENDING_ADD"};function sg(r){return r.envMap===!1?"ENVMAP_BLENDING_NONE":ng[r.combine]||"ENVMAP_BLENDING_NONE"}function rg(r){let t=r.envMapCubeUVHeight;if(t===null)return null;let e=Math.log2(t)-2,i=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:i,maxMip:e}}function og(r,t,e,i){let n=r.getContext(),s=e.defines,o=e.vertexShader,a=e.fragmentShader,l=J0(e),c=tg(e),h=ig(e),u=sg(e),d=rg(e),f=V0(e),g=W0(s),y=n.createProgram(),p,m,x=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(p=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(yr).join(`
`),p.length>0&&(p+=`
`),m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(yr).join(`
`),m.length>0&&(m+=`
`)):(p=[Sd(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexNormals?"#define HAS_NORMAL":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(yr).join(`
`),m=[Sd(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+h:"",e.envMap?"#define "+u:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.retroreflection?"#define USE_RETROREFLECTION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas||e.batchingColor?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==Pi?"#define TONE_MAPPING":"",e.toneMapping!==Pi?se.tonemapping_pars_fragment:"",e.toneMapping!==Pi?H0("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",se.colorspace_pars_fragment,k0("linearToOutputTexel",e.outputColorSpace),G0(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(yr).join(`
`)),o=xc(o),o=vd(o,e),o=Md(o,e),a=xc(a),a=vd(a,e),a=Md(a,e),o=_d(o),a=_d(a),e.isRawShaderMaterial!==!0&&(x=`#version 300 es
`,p=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+p,m=["#define varying in",e.glslVersion===Ql?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===Ql?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);let S=x+p+o,M=x+m+a,b=gd(n,n.VERTEX_SHADER,S),_=gd(n,n.FRAGMENT_SHADER,M);n.attachShader(y,b),n.attachShader(y,_),e.index0AttributeName!==void 0?n.bindAttribLocation(y,0,e.index0AttributeName):e.hasPositionAttribute===!0&&n.bindAttribLocation(y,0,"position"),n.linkProgram(y);function w(R){if(r.debug.checkShaderErrors){let P=n.getProgramInfoLog(y)||"",N=n.getShaderInfoLog(b)||"",I=n.getShaderInfoLog(_)||"",U=P.trim(),B=N.trim(),G=I.trim(),Q=!0,F=!0;if(n.getProgramParameter(y,n.LINK_STATUS)===!1)if(Q=!1,typeof r.debug.onShaderError=="function")r.debug.onShaderError(n,y,b,_);else{let $=yd(n,b,"vertex"),K=yd(n,_,"fragment");Xt("WebGLProgram: Shader Error "+n.getError()+" - VALIDATE_STATUS "+n.getProgramParameter(y,n.VALIDATE_STATUS)+`

Material Name: `+R.name+`
Material Type: `+R.type+`

Program Info Log: `+U+`
`+$+`
`+K)}else U!==""?Vt("WebGLProgram: Program Info Log:",U):(B===""||G==="")&&(F=!1);F&&(R.diagnostics={runnable:Q,programLog:U,vertexShader:{log:B,prefix:p},fragmentShader:{log:G,prefix:m}})}n.deleteShader(b),n.deleteShader(_),v=new As(n,y),T=X0(n,y)}let v;this.getUniforms=function(){return v===void 0&&w(this),v};let T;this.getAttributes=function(){return T===void 0&&w(this),T};let C=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return C===!1&&(C=n.getProgramParameter(y,F0)),C},this.destroy=function(){i.releaseStatesOfProgram(this),n.deleteProgram(y),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=U0++,this.cacheKey=t,this.usedTimes=1,this.program=y,this.vertexShader=b,this.fragmentShader=_,this}var ag=0,yc=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,e,i){let n=this._getShaderCacheForMaterial(t);return n.has(e)===!1&&(n.add(e),e.usedTimes++),n.has(i)===!1&&(n.add(i),i.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let i of e)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,i=e.get(t);return i===void 0&&(i=new Set,e.set(t,i)),i}_getShaderStage(t){let e=this.shaderCache,i=e.get(t);return i===void 0&&(i=new vc(t),e.set(t,i)),i}},vc=class{constructor(t){this.id=ag++,this.code=t,this.usedTimes=0}};function lg(r){return r===An||r===fr||r===pr}function cg(r,t,e,i,n,s){let o=new xs,a=new yc,l=new Set,c=[],h=new Map,u=i.logarithmicDepthBuffer,d=i.precision,f={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(v){return l.add(v),v===0?"uv":`uv${v}`}function y(v,T,C,R,P,N){let I=R.fog,U=P.geometry,B=v.isMeshStandardMaterial||v.isMeshLambertMaterial||v.isMeshPhongMaterial?R.environment:null,G=v.isMeshStandardMaterial||v.isMeshLambertMaterial&&!v.envMap||v.isMeshPhongMaterial&&!v.envMap,Q=t.get(v.envMap||B,G),F=Q&&Q.mapping===ar?Q.image.height:null,$=f[v.type];v.precision!==null&&(d=i.getMaxPrecision(v.precision),d!==v.precision&&Vt("WebGLProgram.getParameters:",v.precision,"not supported, using",d,"instead."));let K=U.morphAttributes.position||U.morphAttributes.normal||U.morphAttributes.color,at=K!==void 0?K.length:0,rt=0;U.morphAttributes.position!==void 0&&(rt=1),U.morphAttributes.normal!==void 0&&(rt=2),U.morphAttributes.color!==void 0&&(rt=3);let It,ut,Pt,q;if($){let Te=Qi[$];It=Te.vertexShader,ut=Te.fragmentShader}else{It=v.vertexShader,ut=v.fragmentShader;let Te=a.getVertexShaderStage(v),xe=a.getFragmentShaderStage(v);a.update(v,Te,xe),Pt=Te.id,q=xe.id}let Z=r.getRenderTarget(),ct=r.state.buffers.depth.getReversed(),vt=P.isInstancedMesh===!0,lt=P.isBatchedMesh===!0,Ht=!!v.map,fe=!!v.matcap,Wt=!!Q,ht=!!v.aoMap,it=!!v.lightMap,Lt=!!v.bumpMap&&v.wireframe===!1,jt=!!v.normalMap,Yt=!!v.displacementMap,qt=!!v.emissiveMap,Ot=!!v.metalnessMap,Qt=!!v.roughnessMap,z=v.anisotropy>0,Ue=v.clearcoat>0,pe=v.dispersion>0,D=v.retroreflectivity>0,E=v.iridescence>0,V=v.sheen>0,J=v.transmission>0,tt=z&&!!v.anisotropyMap,ft=Ue&&!!v.clearcoatMap,pt=Ue&&!!v.clearcoatNormalMap,et=Ue&&!!v.clearcoatRoughnessMap,st=E&&!!v.iridescenceMap,mt=E&&!!v.iridescenceThicknessMap,Ft=V&&!!v.sheenColorMap,_t=V&&!!v.sheenRoughnessMap,gt=!!v.specularMap,Ut=!!v.specularColorMap,Gt=!!v.specularIntensityMap,Jt=J&&!!v.transmissionMap,H=J&&!!v.thicknessMap,xt=!!v.gradientMap,nt=!!v.alphaMap,yt=v.alphaTest>0,Et=!!v.alphaHash,ot=!!v.extensions,zt=Pi;v.toneMapped&&(Z===null||Z.isXRRenderTarget===!0)&&(zt=r.toneMapping);let Dt={shaderID:$,shaderType:v.type,shaderName:v.name,vertexShader:It,fragmentShader:ut,defines:v.defines,customVertexShaderID:Pt,customFragmentShaderID:q,isRawShaderMaterial:v.isRawShaderMaterial===!0,glslVersion:v.glslVersion,precision:d,batching:lt,batchingColor:lt&&P._colorsTexture!==null,instancing:vt,instancingColor:vt&&P.instanceColor!==null,instancingMorph:vt&&P.morphTexture!==null,outputColorSpace:Z===null?r.outputColorSpace:Z.isXRRenderTarget===!0?Z.texture.colorSpace:le.workingColorSpace,alphaToCoverage:!!v.alphaToCoverage,map:Ht,matcap:fe,envMap:Wt,envMapMode:Wt&&Q.mapping,envMapCubeUVHeight:F,aoMap:ht,lightMap:it,bumpMap:Lt,normalMap:jt,displacementMap:Yt,emissiveMap:qt,normalMapObjectSpace:jt&&v.normalMapType===Vh,normalMapTangentSpace:jt&&v.normalMapType===ws,packedNormalMap:jt&&v.normalMapType===ws&&lg(v.normalMap.format),metalnessMap:Ot,roughnessMap:Qt,anisotropy:z,anisotropyMap:tt,clearcoat:Ue,clearcoatMap:ft,clearcoatNormalMap:pt,clearcoatRoughnessMap:et,dispersion:pe,retroreflection:D,iridescence:E,iridescenceMap:st,iridescenceThicknessMap:mt,sheen:V,sheenColorMap:Ft,sheenRoughnessMap:_t,specularMap:gt,specularColorMap:Ut,specularIntensityMap:Gt,transmission:J,transmissionMap:Jt,thicknessMap:H,gradientMap:xt,opaque:v.transparent===!1&&v.blending===wn&&v.alphaToCoverage===!1,alphaMap:nt,alphaTest:yt,alphaHash:Et,combine:v.combine,mapUv:Ht&&g(v.map.channel),aoMapUv:ht&&g(v.aoMap.channel),lightMapUv:it&&g(v.lightMap.channel),bumpMapUv:Lt&&g(v.bumpMap.channel),normalMapUv:jt&&g(v.normalMap.channel),displacementMapUv:Yt&&g(v.displacementMap.channel),emissiveMapUv:qt&&g(v.emissiveMap.channel),metalnessMapUv:Ot&&g(v.metalnessMap.channel),roughnessMapUv:Qt&&g(v.roughnessMap.channel),anisotropyMapUv:tt&&g(v.anisotropyMap.channel),clearcoatMapUv:ft&&g(v.clearcoatMap.channel),clearcoatNormalMapUv:pt&&g(v.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:et&&g(v.clearcoatRoughnessMap.channel),iridescenceMapUv:st&&g(v.iridescenceMap.channel),iridescenceThicknessMapUv:mt&&g(v.iridescenceThicknessMap.channel),sheenColorMapUv:Ft&&g(v.sheenColorMap.channel),sheenRoughnessMapUv:_t&&g(v.sheenRoughnessMap.channel),specularMapUv:gt&&g(v.specularMap.channel),specularColorMapUv:Ut&&g(v.specularColorMap.channel),specularIntensityMapUv:Gt&&g(v.specularIntensityMap.channel),transmissionMapUv:Jt&&g(v.transmissionMap.channel),thicknessMapUv:H&&g(v.thicknessMap.channel),alphaMapUv:nt&&g(v.alphaMap.channel),vertexTangents:!!U.attributes.tangent&&(jt||z),vertexNormals:!!U.attributes.normal,vertexColors:v.vertexColors,vertexAlphas:v.vertexColors===!0&&!!U.attributes.color&&U.attributes.color.itemSize===4,pointsUvs:P.isPoints===!0&&!!U.attributes.uv&&(Ht||nt),fog:!!I,useFog:v.fog===!0,fogExp2:!!I&&I.isFogExp2,flatShading:v.wireframe===!1&&(v.flatShading===!0||U.attributes.normal===void 0&&jt===!1&&(v.isMeshLambertMaterial||v.isMeshPhongMaterial||v.isMeshStandardMaterial||v.isMeshPhysicalMaterial)),sizeAttenuation:v.sizeAttenuation===!0,logarithmicDepthBuffer:u,reversedDepthBuffer:ct,skinning:P.isSkinnedMesh===!0,hasPositionAttribute:U.attributes.position!==void 0,morphTargets:U.morphAttributes.position!==void 0,morphNormals:U.morphAttributes.normal!==void 0,morphColors:U.morphAttributes.color!==void 0,morphTargetsCount:at,morphTextureStride:rt,numSunLights:T.sun.length,numDirLights:T.directional.length,numPointLights:T.point.length,numSpotLights:T.spot.length,numSpotLightMaps:T.spotLightMap.length,numRectAreaLights:T.rectArea.length,numHemiLights:T.hemi.length,numSunLightShadows:T.sunShadowMap.length,numDirLightShadows:T.directionalShadowMap.length,numPointLightShadows:T.pointShadowMap.length,numSpotLightShadows:T.spotShadowMap.length,numSpotLightShadowsWithMaps:T.numSpotLightShadowsWithMaps,numLightProbes:T.numLightProbes,numLightProbeGrids:N.length,numClippingPlanes:s.numPlanes,numClipIntersection:s.numIntersection,dithering:v.dithering,shadowMapEnabled:r.shadowMap.enabled&&C.length>0,shadowMapType:r.shadowMap.type,toneMapping:zt,decodeVideoTexture:Ht&&v.map.isVideoTexture===!0&&le.getTransfer(v.map.colorSpace)===ve,decodeVideoTextureEmissive:qt&&v.emissiveMap.isVideoTexture===!0&&le.getTransfer(v.emissiveMap.colorSpace)===ve,premultipliedAlpha:v.premultipliedAlpha,doubleSided:v.side===Ve,flipSided:v.side===Ze,useDepthPacking:v.depthPacking>=0,depthPacking:v.depthPacking||0,index0AttributeName:v.index0AttributeName,extensionClipCullDistance:ot&&v.extensions.clipCullDistance===!0&&e.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ot&&v.extensions.multiDraw===!0||lt)&&e.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:e.has("KHR_parallel_shader_compile"),customProgramCacheKey:v.customProgramCacheKey()};return Dt.vertexUv1s=l.has(1),Dt.vertexUv2s=l.has(2),Dt.vertexUv3s=l.has(3),l.clear(),Dt}function p(v){let T=[];if(v.shaderID?T.push(v.shaderID):(T.push(v.customVertexShaderID),T.push(v.customFragmentShaderID)),v.defines!==void 0)for(let C in v.defines)T.push(C),T.push(v.defines[C]);return v.isRawShaderMaterial===!1&&(m(T,v),x(T,v),T.push(r.outputColorSpace)),T.push(v.customProgramCacheKey),T.join()}function m(v,T){v.push(T.precision),v.push(T.outputColorSpace),v.push(T.envMapMode),v.push(T.envMapCubeUVHeight),v.push(T.mapUv),v.push(T.alphaMapUv),v.push(T.lightMapUv),v.push(T.aoMapUv),v.push(T.bumpMapUv),v.push(T.normalMapUv),v.push(T.displacementMapUv),v.push(T.emissiveMapUv),v.push(T.metalnessMapUv),v.push(T.roughnessMapUv),v.push(T.anisotropyMapUv),v.push(T.clearcoatMapUv),v.push(T.clearcoatNormalMapUv),v.push(T.clearcoatRoughnessMapUv),v.push(T.iridescenceMapUv),v.push(T.iridescenceThicknessMapUv),v.push(T.sheenColorMapUv),v.push(T.sheenRoughnessMapUv),v.push(T.specularMapUv),v.push(T.specularColorMapUv),v.push(T.specularIntensityMapUv),v.push(T.transmissionMapUv),v.push(T.thicknessMapUv),v.push(T.combine),v.push(T.fogExp2),v.push(T.sizeAttenuation),v.push(T.morphTargetsCount),v.push(T.morphAttributeCount),v.push(T.numSunLights),v.push(T.numDirLights),v.push(T.numPointLights),v.push(T.numSpotLights),v.push(T.numSpotLightMaps),v.push(T.numHemiLights),v.push(T.numRectAreaLights),v.push(T.numSunLightShadows),v.push(T.numDirLightShadows),v.push(T.numPointLightShadows),v.push(T.numSpotLightShadows),v.push(T.numSpotLightShadowsWithMaps),v.push(T.numLightProbes),v.push(T.shadowMapType),v.push(T.toneMapping),v.push(T.numClippingPlanes),v.push(T.numClipIntersection),v.push(T.depthPacking)}function x(v,T){o.disableAll(),T.instancing&&o.enable(0),T.instancingColor&&o.enable(1),T.instancingMorph&&o.enable(2),T.matcap&&o.enable(3),T.envMap&&o.enable(4),T.normalMapObjectSpace&&o.enable(5),T.normalMapTangentSpace&&o.enable(6),T.clearcoat&&o.enable(7),T.iridescence&&o.enable(8),T.alphaTest&&o.enable(9),T.vertexColors&&o.enable(10),T.vertexAlphas&&o.enable(11),T.vertexUv1s&&o.enable(12),T.vertexUv2s&&o.enable(13),T.vertexUv3s&&o.enable(14),T.vertexTangents&&o.enable(15),T.anisotropy&&o.enable(16),T.alphaHash&&o.enable(17),T.batching&&o.enable(18),T.dispersion&&o.enable(19),T.retroreflection&&o.enable(24),T.batchingColor&&o.enable(20),T.gradientMap&&o.enable(21),T.packedNormalMap&&o.enable(22),T.vertexNormals&&o.enable(23),v.push(o.mask),o.disableAll(),T.fog&&o.enable(0),T.useFog&&o.enable(1),T.flatShading&&o.enable(2),T.logarithmicDepthBuffer&&o.enable(3),T.reversedDepthBuffer&&o.enable(4),T.skinning&&o.enable(5),T.morphTargets&&o.enable(6),T.morphNormals&&o.enable(7),T.morphColors&&o.enable(8),T.premultipliedAlpha&&o.enable(9),T.shadowMapEnabled&&o.enable(10),T.doubleSided&&o.enable(11),T.flipSided&&o.enable(12),T.useDepthPacking&&o.enable(13),T.dithering&&o.enable(14),T.transmission&&o.enable(15),T.sheen&&o.enable(16),T.opaque&&o.enable(17),T.pointsUvs&&o.enable(18),T.decodeVideoTexture&&o.enable(19),T.decodeVideoTextureEmissive&&o.enable(20),T.alphaToCoverage&&o.enable(21),T.numLightProbeGrids>0&&o.enable(22),T.hasPositionAttribute&&o.enable(23),v.push(o.mask)}function S(v){let T=f[v.type],C;if(T){let R=Qi[T];C=nd.clone(R.uniforms)}else C=v.uniforms;return C}function M(v,T){let C=h.get(T);return C!==void 0?++C.usedTimes:(C=new og(r,T,v,n),c.push(C),h.set(T,C)),C}function b(v){if(--v.usedTimes===0){let T=c.indexOf(v);c[T]=c[c.length-1],c.pop(),h.delete(v.cacheKey),v.destroy()}}function _(v){a.remove(v)}function w(){a.dispose()}return{getParameters:y,getProgramCacheKey:p,getUniforms:S,acquireProgram:M,releaseProgram:b,releaseShaderCache:_,programs:c,dispose:w}}function hg(){let r=new WeakMap;function t(o){return r.has(o)}function e(o){let a=r.get(o);return a===void 0&&(a={},r.set(o,a)),a}function i(o){r.delete(o)}function n(o,a,l){r.get(o)[a]=l}function s(){r=new WeakMap}return{has:t,get:e,remove:i,update:n,dispose:s}}function dg(r,t){return r.groupOrder!==t.groupOrder?r.groupOrder-t.groupOrder:r.renderOrder!==t.renderOrder?r.renderOrder-t.renderOrder:r.material.id!==t.material.id?r.material.id-t.material.id:r.materialVariant!==t.materialVariant?r.materialVariant-t.materialVariant:r.z!==t.z?r.z-t.z:r.id-t.id}function bd(r,t){return r.groupOrder!==t.groupOrder?r.groupOrder-t.groupOrder:r.renderOrder!==t.renderOrder?r.renderOrder-t.renderOrder:r.z!==t.z?t.z-r.z:r.id-t.id}function wd(){let r=[],t=0,e=[],i=[],n=[];function s(){t=0,e.length=0,i.length=0,n.length=0}function o(d){let f=0;return d.isInstancedMesh&&(f+=2),d.isSkinnedMesh&&(f+=1),f}function a(d,f,g,y,p,m){let x=r[t];return x===void 0?(x={id:d.id,object:d,geometry:f,material:g,materialVariant:o(d),groupOrder:y,renderOrder:d.renderOrder,z:p,group:m},r[t]=x):(x.id=d.id,x.object=d,x.geometry=f,x.material=g,x.materialVariant=o(d),x.groupOrder=y,x.renderOrder=d.renderOrder,x.z=p,x.group=m),t++,x}function l(d,f,g,y,p,m,x){x.reversedDepth===!0&&(p=-p);let S=a(d,f,g,y,p,m);g.transmission>0?i.push(S):g.transparent===!0?n.push(S):e.push(S)}function c(d,f,g,y,p,m){let x=a(d,f,g,y,p,m);g.transmission>0?i.unshift(x):g.transparent===!0?n.unshift(x):e.unshift(x)}function h(d,f){e.length>1&&e.sort(d||dg),i.length>1&&i.sort(f||bd),n.length>1&&n.sort(f||bd)}function u(){for(let d=t,f=r.length;d<f;d++){let g=r[d];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:e,transmissive:i,transparent:n,init:s,push:l,unshift:c,finish:u,sort:h}}function ug(){let r=new WeakMap;function t(i,n){let s=r.get(i),o;return s===void 0?(o=new wd,r.set(i,[o])):n>=s.length?(o=new wd,s.push(o)):o=s[n],o}function e(){r=new WeakMap}return{get:t,dispose:e}}function fg(){let r={};return{get:function(t){if(r[t.id]!==void 0)return r[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={direction:new O,color:new dt};break;case"SpotLight":e={position:new O,direction:new O,color:new dt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new O,color:new dt,distance:0,decay:0};break;case"HemisphereLight":e={direction:new O,skyColor:new dt,groundColor:new dt};break;case"RectAreaLight":e={color:new dt,position:new O,halfWidth:new O,halfHeight:new O};break}return r[t.id]=e,e}}}function pg(){let r={};return{get:function(t){if(r[t.id]!==void 0)return r[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Kt};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Kt};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Kt,shadowCameraNear:1,shadowCameraFar:1e3};break}return r[t.id]=e,e}}}var mg=0;function gg(r,t){return(t.castShadow?2:0)-(r.castShadow?2:0)+(t.map?1:0)-(r.map?1:0)}function xg(r){let t=new fg,e=pg(),i={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new O);let n=new O,s=new ge,o=new ge;function a(c){let h=0,u=0,d=0;for(let P=0;P<9;P++)i.probe[P].set(0,0,0);let f=0,g=0,y=0,p=0,m=0,x=0,S=0,M=0,b=0,_=0,w=0,v=0,T=0,C=0;c.sort(gg);for(let P=0,N=c.length;P<N;P++){let I=c[P],U=I.color,B=I.intensity,G=I.distance,Q=null;if(I.shadow&&I.shadow.map&&(I.shadow.map.texture.format===An?Q=I.shadow.map.texture:Q=I.shadow.map.depthTexture||I.shadow.map.texture),I.isAmbientLight)h+=U.r*B,u+=U.g*B,d+=U.b*B;else if(I.isLightProbe){for(let F=0;F<9;F++)i.probe[F].addScaledVector(I.sh.coefficients[F],B);C++}else if(I.isSunLight){let F=t.get(I);if(F.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){let $=I.shadow,K=e.get(I);K.shadowIntensity=$.intensity,K.shadowBias=$.bias,K.shadowNormalBias=$.normalBias,K.shadowRadius=$.radius,K.shadowMapSize.copy($.mapSize).multiply($.getFrameExtents()),i.sunShadow[g]=K,i.sunShadowMap[g]=Q;let at=$.getViewportCount();for(let rt=0;rt<at;rt++)i.sunShadowMatrix[y+rt]=$.getMatrix(rt),i.sunShadowCascade[y+rt]=$._cascadeData[rt];y+=at,g++}i.sun[f]=F,f++}else if(I.isDirectionalLight){let F=t.get(I);if(F.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){let $=I.shadow,K=e.get(I);K.shadowIntensity=$.intensity,K.shadowBias=$.bias,K.shadowNormalBias=$.normalBias,K.shadowRadius=$.radius,K.shadowMapSize=$.mapSize,i.directionalShadow[p]=K,i.directionalShadowMap[p]=Q,i.directionalShadowMatrix[p]=I.shadow.matrix,b++}i.directional[p]=F,p++}else if(I.isSpotLight){let F=t.get(I);F.position.setFromMatrixPosition(I.matrixWorld),F.color.copy(U).multiplyScalar(B),F.distance=G,F.coneCos=Math.cos(I.angle),F.penumbraCos=Math.cos(I.angle*(1-I.penumbra)),F.decay=I.decay,i.spot[x]=F;let $=I.shadow;if(I.map&&(i.spotLightMap[v]=I.map,v++,$.updateMatrices(I),I.castShadow&&T++),i.spotLightMatrix[x]=$.matrix,I.castShadow){let K=e.get(I);K.shadowIntensity=$.intensity,K.shadowBias=$.bias,K.shadowNormalBias=$.normalBias,K.shadowRadius=$.radius,K.shadowMapSize=$.mapSize,i.spotShadow[x]=K,i.spotShadowMap[x]=Q,w++}x++}else if(I.isRectAreaLight){let F=t.get(I);F.color.copy(U).multiplyScalar(B),F.halfWidth.set(I.width*.5,0,0),F.halfHeight.set(0,I.height*.5,0),i.rectArea[S]=F,S++}else if(I.isPointLight){let F=t.get(I);if(F.color.copy(I.color).multiplyScalar(I.intensity),F.distance=I.distance,F.decay=I.decay,I.castShadow){let $=I.shadow,K=e.get(I);K.shadowIntensity=$.intensity,K.shadowBias=$.bias,K.shadowNormalBias=$.normalBias,K.shadowRadius=$.radius,K.shadowMapSize=$.mapSize,K.shadowCameraNear=$.camera.near,K.shadowCameraFar=$.camera.far,i.pointShadow[m]=K,i.pointShadowMap[m]=Q,i.pointShadowMatrix[m]=I.shadow.matrix,_++}i.point[m]=F,m++}else if(I.isHemisphereLight){let F=t.get(I);F.skyColor.copy(I.color).multiplyScalar(B),F.groundColor.copy(I.groundColor).multiplyScalar(B),i.hemi[M]=F,M++}}S>0&&(r.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=St.LTC_FLOAT_1,i.rectAreaLTC2=St.LTC_FLOAT_2):(i.rectAreaLTC1=St.LTC_HALF_1,i.rectAreaLTC2=St.LTC_HALF_2)),i.ambient[0]=h,i.ambient[1]=u,i.ambient[2]=d;let R=i.hash;(R.sunLength!==f||R.directionalLength!==p||R.pointLength!==m||R.spotLength!==x||R.rectAreaLength!==S||R.hemiLength!==M||R.numSunShadows!==g||R.numDirectionalShadows!==b||R.numPointShadows!==_||R.numSpotShadows!==w||R.numSpotMaps!==v||R.numLightProbes!==C)&&(i.sun.length=f,i.directional.length=p,i.spot.length=x,i.rectArea.length=S,i.point.length=m,i.hemi.length=M,i.sunShadow.length=g,i.sunShadowMap.length=g,i.sunShadowMatrix.length=y,i.sunShadowCascade.length=y,i.directionalShadow.length=b,i.directionalShadowMap.length=b,i.directionalShadowMatrix.length=b,i.pointShadow.length=_,i.pointShadowMap.length=_,i.pointShadowMatrix.length=_,i.spotShadow.length=w,i.spotShadowMap.length=w,i.spotLightMatrix.length=w+v-T,i.spotLightMap.length=v,i.numSpotLightShadowsWithMaps=T,i.numLightProbes=C,R.sunLength=f,R.directionalLength=p,R.pointLength=m,R.spotLength=x,R.rectAreaLength=S,R.hemiLength=M,R.numSunShadows=g,R.numDirectionalShadows=b,R.numPointShadows=_,R.numSpotShadows=w,R.numSpotMaps=v,R.numLightProbes=C,i.version=mg++)}function l(c,h){let u=0,d=0,f=0,g=0,y=0,p=0,m=h.matrixWorldInverse;for(let x=0,S=c.length;x<S;x++){let M=c[x];if(M.isSunLight){let b=i.sun[u];b.direction.setFromMatrixPosition(M.matrixWorld),b.direction.transformDirection(m),u++}else if(M.isDirectionalLight){let b=i.directional[d];b.direction.setFromMatrixPosition(M.matrixWorld),n.setFromMatrixPosition(M.target.matrixWorld),b.direction.sub(n),b.direction.transformDirection(m),d++}else if(M.isSpotLight){let b=i.spot[g];b.position.setFromMatrixPosition(M.matrixWorld),b.position.applyMatrix4(m),b.direction.setFromMatrixPosition(M.matrixWorld),n.setFromMatrixPosition(M.target.matrixWorld),b.direction.sub(n),b.direction.transformDirection(m),g++}else if(M.isRectAreaLight){let b=i.rectArea[y];b.position.setFromMatrixPosition(M.matrixWorld),b.position.applyMatrix4(m),o.identity(),s.copy(M.matrixWorld),s.premultiply(m),o.extractRotation(s),b.halfWidth.set(M.width*.5,0,0),b.halfHeight.set(0,M.height*.5,0),b.halfWidth.applyMatrix4(o),b.halfHeight.applyMatrix4(o),y++}else if(M.isPointLight){let b=i.point[f];b.position.setFromMatrixPosition(M.matrixWorld),b.position.applyMatrix4(m),f++}else if(M.isHemisphereLight){let b=i.hemi[p];b.direction.setFromMatrixPosition(M.matrixWorld),b.direction.transformDirection(m),p++}}}return{setup:a,setupView:l,state:i}}function Ed(r){let t=new xg(r),e=[],i=[],n=[];function s(d){u.camera=d,e.length=0,i.length=0,n.length=0}function o(d){e.push(d)}function a(d){i.push(d)}function l(d){n.push(d)}function c(){t.setup(e)}function h(d){t.setupView(e,d)}let u={lightsArray:e,shadowsArray:i,lightProbeGridArray:n,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:s,state:u,setupLights:c,setupLightsView:h,pushLight:o,pushShadow:a,pushLightProbeGrid:l}}function yg(r){let t=new WeakMap;function e(n,s=0){let o=t.get(n),a;return o===void 0?(a=new Ed(r),t.set(n,[a])):s>=o.length?(a=new Ed(r),o.push(a)):a=o[s],a}function i(){t=new WeakMap}return{get:e,dispose:i}}var vg=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Mg=`uniform sampler2D shadow_pass;
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
}`,_g=[new O(1,0,0),new O(-1,0,0),new O(0,1,0),new O(0,-1,0),new O(0,0,1),new O(0,0,-1)],Sg=[new O(0,-1,0),new O(0,-1,0),new O(0,0,1),new O(0,0,-1),new O(0,-1,0),new O(0,-1,0)],Td=new ge,xr=new O,uc=new O;function bg(r,t,e){let i=new vs,n=new Kt,s=new Kt,o=new De,a=new xo,l=new yo,c={},h=e.maxTextureSize,u={[Ii]:Ze,[Ze]:Ii,[Ve]:Ve},d=new Ne({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Kt},radius:{value:4}},vertexShader:vg,fragmentShader:Mg}),f=d.clone();f.defines.HORIZONTAL_PASS=1;let g=new me;g.setAttribute("position",new te(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let y=new Mt(g,d),p=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Wn;let m=this.type;this.render=function(_,w,v){if(p.enabled===!1||p.autoUpdate===!1&&p.needsUpdate===!1||_.length===0)return;this.type===Mh&&(Vt("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Wn);let T=r.getRenderTarget(),C=r.getActiveCubeFace(),R=r.getActiveMipmapLevel(),P=r.state;P.setBlending(qi),P.buffers.depth.getReversed()===!0?P.buffers.color.setClear(0,0,0,0):P.buffers.color.setClear(1,1,1,1),P.buffers.depth.setTest(!0),P.setScissorTest(!1);let N=m!==this.type;N&&w.traverse(function(I){I.material&&(Array.isArray(I.material)?I.material.forEach(U=>U.needsUpdate=!0):I.material.needsUpdate=!0)});for(let I=0,U=_.length;I<U;I++){let B=_[I],G=B.shadow;if(G===void 0){Vt("WebGLShadowMap:",B,"has no shadow.");continue}if(G.autoUpdate===!1&&G.needsUpdate===!1)continue;n.copy(G.mapSize);let Q=G.getFrameExtents();n.multiply(Q),s.copy(G.mapSize),(n.x>h||n.y>h)&&(n.x>h&&(s.x=Math.floor(h/Q.x),n.x=s.x*Q.x,G.mapSize.x=s.x),n.y>h&&(s.y=Math.floor(h/Q.y),n.y=s.y*Q.y,G.mapSize.y=s.y));let F=r.state.buffers.depth.getReversed();if(G.camera._reversedDepth=F,G.map===null||N===!0){if(G.map!==null&&(G.map.depthTexture!==null&&(G.map.depthTexture.dispose(),G.map.depthTexture=null),G.map.dispose()),this.type===_s){if(B.isPointLight){Vt("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}G.map=new ci(n.x,n.y,{format:An,type:Di,minFilter:Ge,magFilter:Ge,generateMipmaps:!1}),G.map.texture.name=B.name+".shadowMap",G.map.depthTexture=new vn(n.x,n.y,Si),G.map.depthTexture.name=B.name+".shadowMapDepth",G.map.depthTexture.format=Hi,G.map.depthTexture.compareFunction=null,G.map.depthTexture.minFilter=qe,G.map.depthTexture.magFilter=qe}else B.isPointLight?(G.map=new wa(n.x),G.map.depthTexture=new mo(n.x,Li)):(G.map=new ci(n.x,n.y),G.map.depthTexture=new vn(n.x,n.y,Li)),G.map.depthTexture.name=B.name+".shadowMap",G.map.depthTexture.format=Hi,this.type===Wn?(G.map.depthTexture.compareFunction=F?Ma:va,G.map.depthTexture.minFilter=Ge,G.map.depthTexture.magFilter=Ge):(G.map.depthTexture.compareFunction=null,G.map.depthTexture.minFilter=qe,G.map.depthTexture.magFilter=qe);G.camera.updateProjectionMatrix()}G.map.isWebGLCubeRenderTarget!==!0&&(G.map.width!==n.x||G.map.height!==n.y)&&G.map.setSize(n.x,n.y);let $=G.map.isWebGLCubeRenderTarget?6:G.getViewportCount();B.isPointLight!==!0&&G.updateMatrices(B,v);for(let K=0;K<$;K++){let at=G.getCamera(K);if(B.isPointLight){let rt=G.camera,It=G.matrix,ut=B.distance||rt.far;ut!==rt.far&&(rt.far=ut,rt.updateProjectionMatrix()),xr.setFromMatrixPosition(B.matrixWorld),rt.position.copy(xr),uc.copy(rt.position),uc.add(_g[K]),rt.up.copy(Sg[K]),rt.lookAt(uc),rt.updateMatrixWorld(),It.makeTranslation(-xr.x,-xr.y,-xr.z),Td.multiplyMatrices(rt.projectionMatrix,rt.matrixWorldInverse),G._frustum.setFromProjectionMatrix(Td,rt.coordinateSystem,rt.reversedDepth)}if(G.map.isWebGLCubeRenderTarget)r.setRenderTarget(G.map,K),r.clear();else{K===0&&(r.setRenderTarget(G.map),r.clear());let rt=G.getViewport(K);o.set(s.x*rt.x,s.y*rt.y,s.x*rt.z,s.y*rt.w),P.viewport(o)}i=G.getFrustum(K),M(w,v,at,B,this.type)}G.isPointLightShadow!==!0&&this.type===_s&&x(G,v),G.needsUpdate=!1}m=this.type,p.needsUpdate=!1,r.setRenderTarget(T,C,R)};function x(_,w){let v=t.update(y);d.defines.VSM_SAMPLES!==_.blurSamples&&(d.defines.VSM_SAMPLES=_.blurSamples,f.defines.VSM_SAMPLES=_.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),_.mapPass===null?_.mapPass=new ci(n.x,n.y,{format:An,type:Di}):(_.mapPass.width!==_.map.width||_.mapPass.height!==_.map.height)&&_.mapPass.setSize(_.map.width,_.map.height),d.uniforms.shadow_pass.value=_.map.depthTexture,d.uniforms.resolution.value.set(_.map.width,_.map.height),d.uniforms.radius.value=_.radius,r.setRenderTarget(_.mapPass),r.clear(),r.renderBufferDirect(w,null,v,d,y,null),f.uniforms.shadow_pass.value=_.mapPass.texture,f.uniforms.resolution.value.set(_.map.width,_.map.height),f.uniforms.radius.value=_.radius,r.setRenderTarget(_.map),r.clear(),r.renderBufferDirect(w,null,v,f,y,null)}function S(_,w,v,T){let C=null,R=v.isPointLight===!0?_.customDistanceMaterial:_.customDepthMaterial;if(R!==void 0)C=R;else if(C=v.isPointLight===!0?l:a,r.localClippingEnabled&&w.clipShadows===!0&&Array.isArray(w.clippingPlanes)&&w.clippingPlanes.length!==0||w.displacementMap&&w.displacementScale!==0||w.alphaMap&&w.alphaTest>0||w.map&&w.alphaTest>0||w.alphaToCoverage===!0){let P=C.uuid,N=w.uuid,I=c[P];I===void 0&&(I={},c[P]=I);let U=I[N];U===void 0&&(U=C.clone(),I[N]=U,w.addEventListener("dispose",b)),C=U}if(C.visible=w.visible,C.wireframe=w.wireframe,T===_s?C.side=w.shadowSide!==null?w.shadowSide:w.side:C.side=w.shadowSide!==null?w.shadowSide:u[w.side],C.alphaMap=w.alphaMap,C.alphaTest=w.alphaToCoverage===!0?.5:w.alphaTest,C.map=w.map,C.clipShadows=w.clipShadows,C.clippingPlanes=w.clippingPlanes,C.clipIntersection=w.clipIntersection,C.displacementMap=w.displacementMap,C.displacementScale=w.displacementScale,C.displacementBias=w.displacementBias,C.wireframeLinewidth=w.wireframeLinewidth,C.linewidth=w.linewidth,v.isPointLight===!0&&C.isMeshDistanceMaterial===!0){let P=r.properties.get(C);P.light=v}return C}function M(_,w,v,T,C){if(_.visible===!1)return;if(_.layers.test(w.layers)&&(_.isMesh||_.isLine||_.isPoints)&&(_.castShadow||_.receiveShadow&&C===_s)&&(!_.frustumCulled||_.intersectsFrustum(i))){_.modelViewMatrix.multiplyMatrices(v.matrixWorldInverse,_.matrixWorld);let N=t.update(_),I=_.material;if(Array.isArray(I)){let U=N.groups;for(let B=0,G=U.length;B<G;B++){let Q=U[B],F=I[Q.materialIndex];if(F&&F.visible){let $=S(_,F,T,C);_.onBeforeShadow(r,_,w,v,N,$,Q),r.renderBufferDirect(v,null,N,$,_,Q),_.onAfterShadow(r,_,w,v,N,$,Q)}}}else if(I.visible){let U=S(_,I,T,C);_.onBeforeShadow(r,_,w,v,N,U,null),r.renderBufferDirect(v,null,N,U,_,null),_.onAfterShadow(r,_,w,v,N,U,null)}}let P=_.children;for(let N=0,I=P.length;N<I;N++)M(P[N],w,v,T,C)}function b(_){_.target.removeEventListener("dispose",b);for(let v in c){let T=c[v],C=_.target.uuid;C in T&&(T[C].dispose(),delete T[C])}}}function wg(r,t){function e(){let H=!1,xt=new De,nt=null,yt=new De(0,0,0,0);return{setMask:function(Et){nt!==Et&&!H&&(r.colorMask(Et,Et,Et,Et),nt=Et)},setLocked:function(Et){H=Et},setClear:function(Et,ot,zt,Dt,Te){Te===!0&&(Et*=Dt,ot*=Dt,zt*=Dt),xt.set(Et,ot,zt,Dt),yt.equals(xt)===!1&&(r.clearColor(Et,ot,zt,Dt),yt.copy(xt))},reset:function(){H=!1,nt=null,yt.set(-1,0,0,0)}}}function i(){let H=!1,xt=!1,nt=null,yt=null,Et=null;return{setReversed:function(ot){if(xt!==ot){let zt=t.get("EXT_clip_control");ot?zt.clipControlEXT(zt.LOWER_LEFT_EXT,zt.ZERO_TO_ONE_EXT):zt.clipControlEXT(zt.LOWER_LEFT_EXT,zt.NEGATIVE_ONE_TO_ONE_EXT),xt=ot;let Dt=Et;Et=null,this.setClear(Dt)}},getReversed:function(){return xt},setTest:function(ot){ot?Z(r.DEPTH_TEST):ct(r.DEPTH_TEST)},setMask:function(ot){nt!==ot&&!H&&(r.depthMask(ot),nt=ot)},setFunc:function(ot){if(xt&&(ot=ed[ot]),yt!==ot){switch(ot){case Kr:r.depthFunc(r.NEVER);break;case Jr:r.depthFunc(r.ALWAYS);break;case jr:r.depthFunc(r.LESS);break;case fs:r.depthFunc(r.LEQUAL);break;case to:r.depthFunc(r.EQUAL);break;case eo:r.depthFunc(r.GEQUAL);break;case io:r.depthFunc(r.GREATER);break;case no:r.depthFunc(r.NOTEQUAL);break;default:r.depthFunc(r.LEQUAL)}yt=ot}},setLocked:function(ot){H=ot},setClear:function(ot){Et!==ot&&(Et=ot,xt&&(ot=1-ot),r.clearDepth(ot))},reset:function(){H=!1,nt=null,yt=null,Et=null,xt=!1}}}function n(){let H=!1,xt=null,nt=null,yt=null,Et=null,ot=null,zt=null,Dt=null,Te=null;return{setTest:function(xe){H||(xe?Z(r.STENCIL_TEST):ct(r.STENCIL_TEST))},setMask:function(xe){xt!==xe&&!H&&(r.stencilMask(xe),xt=xe)},setFunc:function(xe,wi,Bi){(nt!==xe||yt!==wi||Et!==Bi)&&(r.stencilFunc(xe,wi,Bi),nt=xe,yt=wi,Et=Bi)},setOp:function(xe,wi,Bi){(ot!==xe||zt!==wi||Dt!==Bi)&&(r.stencilOp(xe,wi,Bi),ot=xe,zt=wi,Dt=Bi)},setLocked:function(xe){H=xe},setClear:function(xe){Te!==xe&&(r.clearStencil(xe),Te=xe)},reset:function(){H=!1,xt=null,nt=null,yt=null,Et=null,ot=null,zt=null,Dt=null,Te=null}}}let s=new e,o=new i,a=new n,l=new WeakMap,c=new WeakMap,h={},u={},d={},f=new WeakMap,g=[],y=null,p=!1,m=null,x=null,S=null,M=null,b=null,_=null,w=null,v=new dt(0,0,0),T=0,C=!1,R=null,P=null,N=null,I=null,U=null,B=r.getParameter(r.MAX_COMBINED_TEXTURE_IMAGE_UNITS),G=!1,Q=0,F=r.getParameter(r.VERSION);F.indexOf("WebGL")!==-1?(Q=parseFloat(/^WebGL (\d)/.exec(F)[1]),G=Q>=1):F.indexOf("OpenGL ES")!==-1&&(Q=parseFloat(/^OpenGL ES (\d)/.exec(F)[1]),G=Q>=2);let $=null,K={},at=r.getParameter(r.SCISSOR_BOX),rt=r.getParameter(r.VIEWPORT),It=new De().fromArray(at),ut=new De().fromArray(rt);function Pt(H,xt,nt,yt){let Et=new Uint8Array(4),ot=r.createTexture();r.bindTexture(H,ot),r.texParameteri(H,r.TEXTURE_MIN_FILTER,r.NEAREST),r.texParameteri(H,r.TEXTURE_MAG_FILTER,r.NEAREST);for(let zt=0;zt<nt;zt++)H===r.TEXTURE_3D||H===r.TEXTURE_2D_ARRAY?r.texImage3D(xt,0,r.RGBA,1,1,yt,0,r.RGBA,r.UNSIGNED_BYTE,Et):r.texImage2D(xt+zt,0,r.RGBA,1,1,0,r.RGBA,r.UNSIGNED_BYTE,Et);return ot}let q={};q[r.TEXTURE_2D]=Pt(r.TEXTURE_2D,r.TEXTURE_2D,1),q[r.TEXTURE_CUBE_MAP]=Pt(r.TEXTURE_CUBE_MAP,r.TEXTURE_CUBE_MAP_POSITIVE_X,6),q[r.TEXTURE_2D_ARRAY]=Pt(r.TEXTURE_2D_ARRAY,r.TEXTURE_2D_ARRAY,1,1),q[r.TEXTURE_3D]=Pt(r.TEXTURE_3D,r.TEXTURE_3D,1,1),s.setClear(0,0,0,1),o.setClear(1),a.setClear(0),Z(r.DEPTH_TEST),o.setFunc(fs),Lt(!1),jt(Il),Z(r.CULL_FACE),ht(qi);function Z(H){h[H]!==!0&&(r.enable(H),h[H]=!0)}function ct(H){h[H]!==!1&&(r.disable(H),h[H]=!1)}function vt(H,xt){return d[H]!==xt?(r.bindFramebuffer(H,xt),d[H]=xt,H===r.DRAW_FRAMEBUFFER&&(d[r.FRAMEBUFFER]=xt),H===r.FRAMEBUFFER&&(d[r.DRAW_FRAMEBUFFER]=xt),!0):!1}function lt(H,xt){let nt=g,yt=!1;if(H){nt=f.get(xt),nt===void 0&&(nt=[],f.set(xt,nt));let Et=H.textures;if(nt.length!==Et.length||nt[0]!==r.COLOR_ATTACHMENT0){for(let ot=0,zt=Et.length;ot<zt;ot++)nt[ot]=r.COLOR_ATTACHMENT0+ot;nt.length=Et.length,yt=!0}}else nt[0]!==r.BACK&&(nt[0]=r.BACK,yt=!0);yt&&r.drawBuffers(nt)}function Ht(H){return y!==H?(r.useProgram(H),y=H,!0):!1}let fe={[Xn]:r.FUNC_ADD,[Sh]:r.FUNC_SUBTRACT,[bh]:r.FUNC_REVERSE_SUBTRACT};fe[wh]=r.MIN,fe[Eh]=r.MAX;let Wt={[Th]:r.ZERO,[Ah]:r.ONE,[Ch]:r.SRC_COLOR,[Nl]:r.SRC_ALPHA,[Nh]:r.SRC_ALPHA_SATURATE,[Lh]:r.DST_COLOR,[Ih]:r.DST_ALPHA,[Rh]:r.ONE_MINUS_SRC_COLOR,[Fl]:r.ONE_MINUS_SRC_ALPHA,[Dh]:r.ONE_MINUS_DST_COLOR,[Ph]:r.ONE_MINUS_DST_ALPHA,[Fh]:r.CONSTANT_COLOR,[Uh]:r.ONE_MINUS_CONSTANT_COLOR,[Bh]:r.CONSTANT_ALPHA,[zh]:r.ONE_MINUS_CONSTANT_ALPHA};function ht(H,xt,nt,yt,Et,ot,zt,Dt,Te,xe){if(H===qi){p===!0&&(ct(r.BLEND),p=!1);return}if(p===!1&&(Z(r.BLEND),p=!0),H!==_h){if(H!==m||xe!==C){if((x!==Xn||b!==Xn)&&(r.blendEquation(r.FUNC_ADD),x=Xn,b=Xn),xe)switch(H){case wn:r.blendFuncSeparate(r.ONE,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case Pl:r.blendFunc(r.ONE,r.ONE);break;case Ll:r.blendFuncSeparate(r.ZERO,r.ONE_MINUS_SRC_COLOR,r.ZERO,r.ONE);break;case Dl:r.blendFuncSeparate(r.DST_COLOR,r.ONE_MINUS_SRC_ALPHA,r.ZERO,r.ONE);break;default:Xt("WebGLState: Invalid blending: ",H);break}else switch(H){case wn:r.blendFuncSeparate(r.SRC_ALPHA,r.ONE_MINUS_SRC_ALPHA,r.ONE,r.ONE_MINUS_SRC_ALPHA);break;case Pl:r.blendFuncSeparate(r.SRC_ALPHA,r.ONE,r.ONE,r.ONE);break;case Ll:Xt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Dl:Xt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Xt("WebGLState: Invalid blending: ",H);break}S=null,M=null,_=null,w=null,v.set(0,0,0),T=0,m=H,C=xe}return}Et=Et||xt,ot=ot||nt,zt=zt||yt,(xt!==x||Et!==b)&&(r.blendEquationSeparate(fe[xt],fe[Et]),x=xt,b=Et),(nt!==S||yt!==M||ot!==_||zt!==w)&&(r.blendFuncSeparate(Wt[nt],Wt[yt],Wt[ot],Wt[zt]),S=nt,M=yt,_=ot,w=zt),(Dt.equals(v)===!1||Te!==T)&&(r.blendColor(Dt.r,Dt.g,Dt.b,Te),v.copy(Dt),T=Te),m=H,C=!1}function it(H,xt){H.side===Ve?ct(r.CULL_FACE):Z(r.CULL_FACE);let nt=H.side===Ze;xt&&(nt=!nt),Lt(nt),H.blending===wn&&H.transparent===!1?ht(qi):ht(H.blending,H.blendEquation,H.blendSrc,H.blendDst,H.blendEquationAlpha,H.blendSrcAlpha,H.blendDstAlpha,H.blendColor,H.blendAlpha,H.premultipliedAlpha),o.setFunc(H.depthFunc),o.setTest(H.depthTest),o.setMask(H.depthWrite),s.setMask(H.colorWrite);let yt=H.stencilWrite;a.setTest(yt),yt&&(a.setMask(H.stencilWriteMask),a.setFunc(H.stencilFunc,H.stencilRef,H.stencilFuncMask),a.setOp(H.stencilFail,H.stencilZFail,H.stencilZPass)),qt(H.polygonOffset,H.polygonOffsetFactor,H.polygonOffsetUnits),H.alphaToCoverage===!0?Z(r.SAMPLE_ALPHA_TO_COVERAGE):ct(r.SAMPLE_ALPHA_TO_COVERAGE)}function Lt(H){R!==H&&(H?r.frontFace(r.CW):r.frontFace(r.CCW),R=H)}function jt(H){H!==yh?(Z(r.CULL_FACE),H!==P&&(H===Il?r.cullFace(r.BACK):H===vh?r.cullFace(r.FRONT):r.cullFace(r.FRONT_AND_BACK))):ct(r.CULL_FACE),P=H}function Yt(H){H!==N&&(G&&r.lineWidth(H),N=H)}function qt(H,xt,nt){H?(Z(r.POLYGON_OFFSET_FILL),(I!==xt||U!==nt)&&(I=xt,U=nt,o.getReversed()&&(xt=-xt),r.polygonOffset(xt,nt))):ct(r.POLYGON_OFFSET_FILL)}function Ot(H){H?Z(r.SCISSOR_TEST):ct(r.SCISSOR_TEST)}function Qt(H){H===void 0&&(H=r.TEXTURE0+B-1),$!==H&&(r.activeTexture(H),$=H)}function z(H,xt,nt){nt===void 0&&($===null?nt=r.TEXTURE0+B-1:nt=$);let yt=K[nt];yt===void 0&&(yt={type:void 0,texture:void 0},K[nt]=yt),(yt.type!==H||yt.texture!==xt)&&($!==nt&&(r.activeTexture(nt),$=nt),r.bindTexture(H,xt||q[H]),yt.type=H,yt.texture=xt)}function Ue(){let H=K[$];H!==void 0&&H.type!==void 0&&(r.bindTexture(H.type,null),H.type=void 0,H.texture=void 0)}function pe(){try{r.compressedTexImage2D(...arguments)}catch(H){Xt("WebGLState:",H)}}function D(){try{r.compressedTexImage3D(...arguments)}catch(H){Xt("WebGLState:",H)}}function E(){try{r.texSubImage2D(...arguments)}catch(H){Xt("WebGLState:",H)}}function V(){try{r.texSubImage3D(...arguments)}catch(H){Xt("WebGLState:",H)}}function J(){try{r.compressedTexSubImage2D(...arguments)}catch(H){Xt("WebGLState:",H)}}function tt(){try{r.compressedTexSubImage3D(...arguments)}catch(H){Xt("WebGLState:",H)}}function ft(){try{r.texStorage2D(...arguments)}catch(H){Xt("WebGLState:",H)}}function pt(){try{r.texStorage3D(...arguments)}catch(H){Xt("WebGLState:",H)}}function et(){try{r.texImage2D(...arguments)}catch(H){Xt("WebGLState:",H)}}function st(){try{r.texImage3D(...arguments)}catch(H){Xt("WebGLState:",H)}}function mt(H){return u[H]!==void 0?u[H]:r.getParameter(H)}function Ft(H,xt){u[H]!==xt&&(r.pixelStorei(H,xt),u[H]=xt)}function _t(H){It.equals(H)===!1&&(r.scissor(H.x,H.y,H.z,H.w),It.copy(H))}function gt(H){ut.equals(H)===!1&&(r.viewport(H.x,H.y,H.z,H.w),ut.copy(H))}function Ut(H,xt){let nt=c.get(xt);nt===void 0&&(nt=new WeakMap,c.set(xt,nt));let yt=nt.get(H);yt===void 0&&(yt=r.getUniformBlockIndex(xt,H.name),nt.set(H,yt))}function Gt(H,xt){let yt=c.get(xt).get(H);l.get(xt)!==yt&&(r.uniformBlockBinding(xt,yt,H.__bindingPointIndex),l.set(xt,yt))}function Jt(){r.disable(r.BLEND),r.disable(r.CULL_FACE),r.disable(r.DEPTH_TEST),r.disable(r.POLYGON_OFFSET_FILL),r.disable(r.SCISSOR_TEST),r.disable(r.STENCIL_TEST),r.disable(r.SAMPLE_ALPHA_TO_COVERAGE),r.blendEquation(r.FUNC_ADD),r.blendFunc(r.ONE,r.ZERO),r.blendFuncSeparate(r.ONE,r.ZERO,r.ONE,r.ZERO),r.blendColor(0,0,0,0),r.colorMask(!0,!0,!0,!0),r.clearColor(0,0,0,0),r.depthMask(!0),r.depthFunc(r.LESS),o.setReversed(!1),r.clearDepth(1),r.stencilMask(4294967295),r.stencilFunc(r.ALWAYS,0,4294967295),r.stencilOp(r.KEEP,r.KEEP,r.KEEP),r.clearStencil(0),r.cullFace(r.BACK),r.frontFace(r.CCW),r.polygonOffset(0,0),r.activeTexture(r.TEXTURE0),r.bindFramebuffer(r.FRAMEBUFFER,null),r.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),r.bindFramebuffer(r.READ_FRAMEBUFFER,null),r.useProgram(null),r.lineWidth(1),r.scissor(0,0,r.canvas.width,r.canvas.height),r.viewport(0,0,r.canvas.width,r.canvas.height),r.pixelStorei(r.PACK_ALIGNMENT,4),r.pixelStorei(r.UNPACK_ALIGNMENT,4),r.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,!1),r.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),r.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,r.BROWSER_DEFAULT_WEBGL),r.pixelStorei(r.PACK_ROW_LENGTH,0),r.pixelStorei(r.PACK_SKIP_PIXELS,0),r.pixelStorei(r.PACK_SKIP_ROWS,0),r.pixelStorei(r.UNPACK_ROW_LENGTH,0),r.pixelStorei(r.UNPACK_IMAGE_HEIGHT,0),r.pixelStorei(r.UNPACK_SKIP_PIXELS,0),r.pixelStorei(r.UNPACK_SKIP_ROWS,0),r.pixelStorei(r.UNPACK_SKIP_IMAGES,0),h={},u={},$=null,K={},d={},f=new WeakMap,g=[],y=null,p=!1,m=null,x=null,S=null,M=null,b=null,_=null,w=null,v=new dt(0,0,0),T=0,C=!1,R=null,P=null,N=null,I=null,U=null,It.set(0,0,r.canvas.width,r.canvas.height),ut.set(0,0,r.canvas.width,r.canvas.height),s.reset(),o.reset(),a.reset()}return{buffers:{color:s,depth:o,stencil:a},enable:Z,disable:ct,bindFramebuffer:vt,drawBuffers:lt,useProgram:Ht,setBlending:ht,setMaterial:it,setFlipSided:Lt,setCullFace:jt,setLineWidth:Yt,setPolygonOffset:qt,setScissorTest:Ot,activeTexture:Qt,bindTexture:z,unbindTexture:Ue,compressedTexImage2D:pe,compressedTexImage3D:D,texImage2D:et,texImage3D:st,pixelStorei:Ft,getParameter:mt,updateUBOMapping:Ut,uniformBlockBinding:Gt,texStorage2D:ft,texStorage3D:pt,texSubImage2D:E,texSubImage3D:V,compressedTexSubImage2D:J,compressedTexSubImage3D:tt,scissor:_t,viewport:gt,reset:Jt}}function Eg(r,t,e,i,n,s,o){let a=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Kt,h=new WeakMap,u=new Set,d,f=new WeakMap,g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function y(D,E){return g?new OffscreenCanvas(D,E):Hs("canvas")}function p(D,E,V){let J=1,tt=pe(D);if((tt.width>V||tt.height>V)&&(J=V/Math.max(tt.width,tt.height)),J<1)if(typeof HTMLImageElement<"u"&&D instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&D instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&D instanceof ImageBitmap||typeof VideoFrame<"u"&&D instanceof VideoFrame){let ft=Math.floor(J*tt.width),pt=Math.floor(J*tt.height);d===void 0&&(d=y(ft,pt));let et=E?y(ft,pt):d;return et.width=ft,et.height=pt,et.getContext("2d").drawImage(D,0,0,ft,pt),Vt("WebGLRenderer: Texture has been resized from ("+tt.width+"x"+tt.height+") to ("+ft+"x"+pt+")."),et}else return"data"in D&&Vt("WebGLRenderer: Image in DataTexture is too big ("+tt.width+"x"+tt.height+")."),D;return D}function m(D){return D.generateMipmaps}function x(D){r.generateMipmap(D)}function S(D){return D.isWebGLCubeRenderTarget?r.TEXTURE_CUBE_MAP:D.isWebGL3DRenderTarget?r.TEXTURE_3D:D.isWebGLArrayRenderTarget||D.isCompressedArrayTexture?r.TEXTURE_2D_ARRAY:r.TEXTURE_2D}function M(D,E,V,J,tt,ft=!1){if(D!==null){if(r[D]!==void 0)return r[D];Vt("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+D+"'")}let pt;J&&(pt=t.get("EXT_texture_norm16"),pt||Vt("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let et=E;if(E===r.RED&&(V===r.FLOAT&&(et=r.R32F),V===r.HALF_FLOAT&&(et=r.R16F),V===r.UNSIGNED_BYTE&&(et=r.R8),V===r.UNSIGNED_SHORT&&pt&&(et=pt.R16_EXT),V===r.SHORT&&pt&&(et=pt.R16_SNORM_EXT)),E===r.RED_INTEGER&&(V===r.UNSIGNED_BYTE&&(et=r.R8UI),V===r.UNSIGNED_SHORT&&(et=r.R16UI),V===r.UNSIGNED_INT&&(et=r.R32UI),V===r.BYTE&&(et=r.R8I),V===r.SHORT&&(et=r.R16I),V===r.INT&&(et=r.R32I)),E===r.RG&&(V===r.FLOAT&&(et=r.RG32F),V===r.HALF_FLOAT&&(et=r.RG16F),V===r.UNSIGNED_BYTE&&(et=r.RG8),V===r.UNSIGNED_SHORT&&pt&&(et=pt.RG16_EXT),V===r.SHORT&&pt&&(et=pt.RG16_SNORM_EXT)),E===r.RG_INTEGER&&(V===r.UNSIGNED_BYTE&&(et=r.RG8UI),V===r.UNSIGNED_SHORT&&(et=r.RG16UI),V===r.UNSIGNED_INT&&(et=r.RG32UI),V===r.BYTE&&(et=r.RG8I),V===r.SHORT&&(et=r.RG16I),V===r.INT&&(et=r.RG32I)),E===r.RGB_INTEGER&&(V===r.UNSIGNED_BYTE&&(et=r.RGB8UI),V===r.UNSIGNED_SHORT&&(et=r.RGB16UI),V===r.UNSIGNED_INT&&(et=r.RGB32UI),V===r.BYTE&&(et=r.RGB8I),V===r.SHORT&&(et=r.RGB16I),V===r.INT&&(et=r.RGB32I)),E===r.RGBA_INTEGER&&(V===r.UNSIGNED_BYTE&&(et=r.RGBA8UI),V===r.UNSIGNED_SHORT&&(et=r.RGBA16UI),V===r.UNSIGNED_INT&&(et=r.RGBA32UI),V===r.BYTE&&(et=r.RGBA8I),V===r.SHORT&&(et=r.RGBA16I),V===r.INT&&(et=r.RGBA32I)),E===r.RGB&&(V===r.UNSIGNED_SHORT&&pt&&(et=pt.RGB16_EXT),V===r.SHORT&&pt&&(et=pt.RGB16_SNORM_EXT),V===r.UNSIGNED_INT_5_9_9_9_REV&&(et=r.RGB9_E5),V===r.UNSIGNED_INT_10F_11F_11F_REV&&(et=r.R11F_G11F_B10F)),E===r.RGBA){let st=ft?Os:le.getTransfer(tt);V===r.FLOAT&&(et=r.RGBA32F),V===r.HALF_FLOAT&&(et=r.RGBA16F),V===r.UNSIGNED_BYTE&&(et=st===ve?r.SRGB8_ALPHA8:r.RGBA8),V===r.UNSIGNED_SHORT&&pt&&(et=pt.RGBA16_EXT),V===r.SHORT&&pt&&(et=pt.RGBA16_SNORM_EXT),V===r.UNSIGNED_SHORT_4_4_4_4&&(et=r.RGBA4),V===r.UNSIGNED_SHORT_5_5_5_1&&(et=r.RGB5_A1)}return(et===r.R16F||et===r.R32F||et===r.RG16F||et===r.RG32F||et===r.RGBA16F||et===r.RGBA32F)&&t.get("EXT_color_buffer_float"),et}function b(D,E){let V;return D?E===null||E===Li||E===bs?V=r.DEPTH24_STENCIL8:E===Si?V=r.DEPTH32F_STENCIL8:E===Ss&&(V=r.DEPTH24_STENCIL8,Vt("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):E===null||E===Li||E===bs?V=r.DEPTH_COMPONENT24:E===Si?V=r.DEPTH_COMPONENT32F:E===Ss&&(V=r.DEPTH_COMPONENT16),V}function _(D,E){return m(D)===!0||D.isFramebufferTexture&&D.minFilter!==qe&&D.minFilter!==Ge?Math.log2(Math.max(E.width,E.height))+1:D.mipmaps!==void 0&&D.mipmaps.length>0?D.mipmaps.length:D.isCompressedTexture&&Array.isArray(D.image)?E.mipmaps.length:1}function w(D){let E=D.target;E.removeEventListener("dispose",w),T(E),E.isVideoTexture&&h.delete(E),E.isHTMLTexture&&u.delete(E)}function v(D){let E=D.target;E.removeEventListener("dispose",v),R(E)}function T(D){let E=i.get(D);if(E.__webglInit===void 0)return;let V=D.source,J=f.get(V);if(J){let tt=J[E.__cacheKey];tt.usedTimes--,tt.usedTimes===0&&C(D),Object.keys(J).length===0&&f.delete(V)}i.remove(D)}function C(D){let E=i.get(D);r.deleteTexture(E.__webglTexture);let V=D.source,J=f.get(V);delete J[E.__cacheKey],o.memory.textures--}function R(D){let E=i.get(D);if(D.depthTexture&&(D.depthTexture.dispose(),i.remove(D.depthTexture)),D.isWebGLCubeRenderTarget)for(let J=0;J<6;J++){if(Array.isArray(E.__webglFramebuffer[J]))for(let tt=0;tt<E.__webglFramebuffer[J].length;tt++)r.deleteFramebuffer(E.__webglFramebuffer[J][tt]);else r.deleteFramebuffer(E.__webglFramebuffer[J]);E.__webglDepthbuffer&&r.deleteRenderbuffer(E.__webglDepthbuffer[J])}else{if(Array.isArray(E.__webglFramebuffer))for(let J=0;J<E.__webglFramebuffer.length;J++)r.deleteFramebuffer(E.__webglFramebuffer[J]);else r.deleteFramebuffer(E.__webglFramebuffer);if(E.__webglDepthbuffer&&r.deleteRenderbuffer(E.__webglDepthbuffer),E.__webglMultisampledFramebuffer&&r.deleteFramebuffer(E.__webglMultisampledFramebuffer),E.__webglColorRenderbuffer)for(let J=0;J<E.__webglColorRenderbuffer.length;J++)E.__webglColorRenderbuffer[J]&&r.deleteRenderbuffer(E.__webglColorRenderbuffer[J]);E.__webglDepthRenderbuffer&&r.deleteRenderbuffer(E.__webglDepthRenderbuffer)}let V=D.textures;for(let J=0,tt=V.length;J<tt;J++){let ft=i.get(V[J]);ft.__webglTexture&&(r.deleteTexture(ft.__webglTexture),o.memory.textures--),i.remove(V[J])}i.remove(D)}let P=0;function N(){P=0}function I(){return P}function U(D){P=D}function B(){let D=P;return D>=n.maxTextures&&Vt("WebGLTextures: Trying to use "+(D+1)+" texture units while this GPU supports only "+n.maxTextures),P+=1,D}function G(D){let E=[];return E.push(D.wrapS),E.push(D.wrapT),E.push(D.wrapR||0),E.push(D.magFilter),E.push(D.minFilter),E.push(D.anisotropy),E.push(D.internalFormat),E.push(D.format),E.push(D.type),E.push(D.generateMipmaps),E.push(D.premultiplyAlpha),E.push(D.flipY),E.push(D.unpackAlignment),E.push(D.colorSpace),E.join()}function Q(D,E){let V=i.get(D);if(D.isVideoTexture&&z(D),D.isRenderTargetTexture===!1&&D.isExternalTexture!==!0&&D.version>0&&V.__version!==D.version){let J=D.image;if(J===null)Vt("WebGLRenderer: Texture marked for update but no image data found.");else if(J.complete===!1)Vt("WebGLRenderer: Texture marked for update but image is incomplete");else{ct(V,D,E);return}}else D.isExternalTexture&&(V.__webglTexture=D.sourceTexture?D.sourceTexture:null);e.bindTexture(r.TEXTURE_2D,V.__webglTexture,r.TEXTURE0+E)}function F(D,E){let V=i.get(D);if(D.isRenderTargetTexture===!1&&D.version>0&&V.__version!==D.version){ct(V,D,E);return}else D.isExternalTexture&&(V.__webglTexture=D.sourceTexture?D.sourceTexture:null);e.bindTexture(r.TEXTURE_2D_ARRAY,V.__webglTexture,r.TEXTURE0+E)}function $(D,E){let V=i.get(D);if(D.isRenderTargetTexture===!1&&D.version>0&&V.__version!==D.version){ct(V,D,E);return}e.bindTexture(r.TEXTURE_3D,V.__webglTexture,r.TEXTURE0+E)}function K(D,E){let V=i.get(D);if(D.isCubeDepthTexture!==!0&&D.version>0&&V.__version!==D.version){vt(V,D,E);return}e.bindTexture(r.TEXTURE_CUBE_MAP,V.__webglTexture,r.TEXTURE0+E)}let at={[kn]:r.REPEAT,[Oi]:r.CLAMP_TO_EDGE,[so]:r.MIRRORED_REPEAT},rt={[qe]:r.NEAREST,[Hh]:r.NEAREST_MIPMAP_NEAREST,[lr]:r.NEAREST_MIPMAP_LINEAR,[Ge]:r.LINEAR,[Fo]:r.LINEAR_MIPMAP_NEAREST,[$i]:r.LINEAR_MIPMAP_LINEAR},It={[Xh]:r.NEVER,[Qh]:r.ALWAYS,[Yh]:r.LESS,[va]:r.LEQUAL,[qh]:r.EQUAL,[Ma]:r.GEQUAL,[$h]:r.GREATER,[Zh]:r.NOTEQUAL};function ut(D,E){if(E.type===Si&&t.has("OES_texture_float_linear")===!1&&(E.magFilter===Ge||E.magFilter===Fo||E.magFilter===lr||E.magFilter===$i||E.minFilter===Ge||E.minFilter===Fo||E.minFilter===lr||E.minFilter===$i)&&Vt("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),r.texParameteri(D,r.TEXTURE_WRAP_S,at[E.wrapS]),r.texParameteri(D,r.TEXTURE_WRAP_T,at[E.wrapT]),(D===r.TEXTURE_3D||D===r.TEXTURE_2D_ARRAY)&&r.texParameteri(D,r.TEXTURE_WRAP_R,at[E.wrapR]),r.texParameteri(D,r.TEXTURE_MAG_FILTER,rt[E.magFilter]),r.texParameteri(D,r.TEXTURE_MIN_FILTER,rt[E.minFilter]),E.compareFunction&&(r.texParameteri(D,r.TEXTURE_COMPARE_MODE,r.COMPARE_REF_TO_TEXTURE),r.texParameteri(D,r.TEXTURE_COMPARE_FUNC,It[E.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(E.magFilter===qe||E.minFilter!==lr&&E.minFilter!==$i||E.type===Si&&t.has("OES_texture_float_linear")===!1)return;if(E.anisotropy>1||i.get(E).__currentAnisotropy){let V=t.get("EXT_texture_filter_anisotropic");r.texParameterf(D,V.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(E.anisotropy,n.getMaxAnisotropy())),i.get(E).__currentAnisotropy=E.anisotropy}}}function Pt(D,E){let V=!1;D.__webglInit===void 0&&(D.__webglInit=!0,E.addEventListener("dispose",w));let J=E.source,tt=f.get(J);tt===void 0&&(tt={},f.set(J,tt));let ft=G(E);if(ft!==D.__cacheKey){tt[ft]===void 0&&(tt[ft]={texture:r.createTexture(),usedTimes:0},o.memory.textures++,V=!0),tt[ft].usedTimes++;let pt=tt[D.__cacheKey];pt!==void 0&&(tt[D.__cacheKey].usedTimes--,pt.usedTimes===0&&C(E)),D.__cacheKey=ft,D.__webglTexture=tt[ft].texture}return V}function q(D,E,V){return Math.floor(Math.floor(D/V)/E)}function Z(D,E,V,J){let ft=D.updateRanges;if(ft.length===0)e.texSubImage2D(r.TEXTURE_2D,0,0,0,E.width,E.height,V,J,E.data);else{ft.sort((Ft,_t)=>Ft.start-_t.start);let pt=0;for(let Ft=1;Ft<ft.length;Ft++){let _t=ft[pt],gt=ft[Ft],Ut=_t.start+_t.count,Gt=q(gt.start,E.width,4),Jt=q(_t.start,E.width,4);gt.start<=Ut+1&&Gt===Jt&&q(gt.start+gt.count-1,E.width,4)===Gt?_t.count=Math.max(_t.count,gt.start+gt.count-_t.start):(++pt,ft[pt]=gt)}ft.length=pt+1;let et=e.getParameter(r.UNPACK_ROW_LENGTH),st=e.getParameter(r.UNPACK_SKIP_PIXELS),mt=e.getParameter(r.UNPACK_SKIP_ROWS);e.pixelStorei(r.UNPACK_ROW_LENGTH,E.width);for(let Ft=0,_t=ft.length;Ft<_t;Ft++){let gt=ft[Ft],Ut=Math.floor(gt.start/4),Gt=Math.ceil(gt.count/4),Jt=Ut%E.width,H=Math.floor(Ut/E.width),xt=Gt,nt=1;e.pixelStorei(r.UNPACK_SKIP_PIXELS,Jt),e.pixelStorei(r.UNPACK_SKIP_ROWS,H),e.texSubImage2D(r.TEXTURE_2D,0,Jt,H,xt,nt,V,J,E.data)}D.clearUpdateRanges(),e.pixelStorei(r.UNPACK_ROW_LENGTH,et),e.pixelStorei(r.UNPACK_SKIP_PIXELS,st),e.pixelStorei(r.UNPACK_SKIP_ROWS,mt)}}function ct(D,E,V){let J=r.TEXTURE_2D;(E.isDataArrayTexture||E.isCompressedArrayTexture)&&(J=r.TEXTURE_2D_ARRAY),E.isData3DTexture&&(J=r.TEXTURE_3D);let tt=Pt(D,E),ft=E.source;e.bindTexture(J,D.__webglTexture,r.TEXTURE0+V);let pt=i.get(ft);if(ft.version!==pt.__version||tt===!0){if(e.activeTexture(r.TEXTURE0+V),(typeof ImageBitmap<"u"&&E.image instanceof ImageBitmap)===!1){let nt=le.getPrimaries(le.workingColorSpace),yt=E.colorSpace===rn?null:le.getPrimaries(E.colorSpace),Et=E.colorSpace===rn||nt===yt?r.NONE:r.BROWSER_DEFAULT_WEBGL;e.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,E.flipY),e.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,E.premultiplyAlpha),e.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,Et)}e.pixelStorei(r.UNPACK_ALIGNMENT,E.unpackAlignment);let st=p(E.image,!1,n.maxTextureSize);st=Ue(E,st);let mt=s.convert(E.format,E.colorSpace),Ft=s.convert(E.type),_t=M(E.internalFormat,mt,Ft,E.normalized,E.colorSpace,E.isVideoTexture);ut(J,E);let gt,Ut=E.mipmaps,Gt=E.isVideoTexture!==!0,Jt=pt.__version===void 0||tt===!0,H=ft.dataReady,xt=_(E,st);if(E.isDepthTexture)_t=b(E.format===Tn,E.type),Jt&&(Gt?e.texStorage2D(r.TEXTURE_2D,1,_t,st.width,st.height):e.texImage2D(r.TEXTURE_2D,0,_t,st.width,st.height,0,mt,Ft,null));else if(E.isDataTexture)if(Ut.length>0){Gt&&Jt&&e.texStorage2D(r.TEXTURE_2D,xt,_t,Ut[0].width,Ut[0].height);for(let nt=0,yt=Ut.length;nt<yt;nt++)gt=Ut[nt],Gt?H&&e.texSubImage2D(r.TEXTURE_2D,nt,0,0,gt.width,gt.height,mt,Ft,gt.data):e.texImage2D(r.TEXTURE_2D,nt,_t,gt.width,gt.height,0,mt,Ft,gt.data);E.generateMipmaps=!1}else Gt?(Jt&&e.texStorage2D(r.TEXTURE_2D,xt,_t,st.width,st.height),H&&Z(E,st,mt,Ft)):e.texImage2D(r.TEXTURE_2D,0,_t,st.width,st.height,0,mt,Ft,st.data);else if(E.isCompressedTexture)if(E.isCompressedArrayTexture){Gt&&Jt&&e.texStorage3D(r.TEXTURE_2D_ARRAY,xt,_t,Ut[0].width,Ut[0].height,st.depth);for(let nt=0,yt=Ut.length;nt<yt;nt++)if(gt=Ut[nt],E.format!==ri)if(mt!==null)if(Gt){if(H)if(E.layerUpdates.size>0){let Et=ec(gt.width,gt.height,E.format,E.type);for(let ot of E.layerUpdates){let zt=gt.data.subarray(ot*Et/gt.data.BYTES_PER_ELEMENT,(ot+1)*Et/gt.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,nt,0,0,ot,gt.width,gt.height,1,mt,zt)}}else e.compressedTexSubImage3D(r.TEXTURE_2D_ARRAY,nt,0,0,0,gt.width,gt.height,st.depth,mt,gt.data)}else e.compressedTexImage3D(r.TEXTURE_2D_ARRAY,nt,_t,gt.width,gt.height,st.depth,0,gt.data,0,0);else Vt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Gt?H&&e.texSubImage3D(r.TEXTURE_2D_ARRAY,nt,0,0,0,gt.width,gt.height,st.depth,mt,Ft,gt.data):e.texImage3D(r.TEXTURE_2D_ARRAY,nt,_t,gt.width,gt.height,st.depth,0,mt,Ft,gt.data);E.layerUpdates.size>0&&E.clearLayerUpdates()}else{Gt&&Jt&&e.texStorage2D(r.TEXTURE_2D,xt,_t,Ut[0].width,Ut[0].height);for(let nt=0,yt=Ut.length;nt<yt;nt++)gt=Ut[nt],E.format!==ri?mt!==null?Gt?H&&e.compressedTexSubImage2D(r.TEXTURE_2D,nt,0,0,gt.width,gt.height,mt,gt.data):e.compressedTexImage2D(r.TEXTURE_2D,nt,_t,gt.width,gt.height,0,gt.data):Vt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Gt?H&&e.texSubImage2D(r.TEXTURE_2D,nt,0,0,gt.width,gt.height,mt,Ft,gt.data):e.texImage2D(r.TEXTURE_2D,nt,_t,gt.width,gt.height,0,mt,Ft,gt.data)}else if(E.isDataArrayTexture)if(Gt){if(Jt&&e.texStorage3D(r.TEXTURE_2D_ARRAY,xt,_t,st.width,st.height,st.depth),H)if(E.layerUpdates.size>0){let nt=ec(st.width,st.height,E.format,E.type);for(let yt of E.layerUpdates){let Et=st.data.subarray(yt*nt/st.data.BYTES_PER_ELEMENT,(yt+1)*nt/st.data.BYTES_PER_ELEMENT);e.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,yt,st.width,st.height,1,mt,Ft,Et)}E.clearLayerUpdates()}else e.texSubImage3D(r.TEXTURE_2D_ARRAY,0,0,0,0,st.width,st.height,st.depth,mt,Ft,st.data)}else e.texImage3D(r.TEXTURE_2D_ARRAY,0,_t,st.width,st.height,st.depth,0,mt,Ft,st.data);else if(E.isData3DTexture)Gt?(Jt&&e.texStorage3D(r.TEXTURE_3D,xt,_t,st.width,st.height,st.depth),H&&e.texSubImage3D(r.TEXTURE_3D,0,0,0,0,st.width,st.height,st.depth,mt,Ft,st.data)):e.texImage3D(r.TEXTURE_3D,0,_t,st.width,st.height,st.depth,0,mt,Ft,st.data);else if(E.isFramebufferTexture){if(Jt)if(Gt)e.texStorage2D(r.TEXTURE_2D,xt,_t,st.width,st.height);else{let nt=st.width,yt=st.height;for(let Et=0;Et<xt;Et++)e.texImage2D(r.TEXTURE_2D,Et,_t,nt,yt,0,mt,Ft,null),nt>>=1,yt>>=1}}else if(E.isHTMLTexture){if("texElementImage2D"in r){let nt=r.canvas;if(nt.hasAttribute("layoutsubtree")||nt.setAttribute("layoutsubtree","true"),st.parentNode!==nt){nt.appendChild(st),u.add(E),nt.onpaint=yt=>{let Et=yt.changedElements;for(let ot of u)Et.includes(ot.image)&&(ot.needsUpdate=!0)},nt.requestPaint();return}if(r.texElementImage2D.length===3)r.texElementImage2D(r.TEXTURE_2D,r.RGBA8,st);else{let Et=r.RGBA,ot=r.RGBA,zt=r.UNSIGNED_BYTE;r.texElementImage2D(r.TEXTURE_2D,0,Et,ot,zt,st)}r.texParameteri(r.TEXTURE_2D,r.TEXTURE_MIN_FILTER,r.LINEAR),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_S,r.CLAMP_TO_EDGE),r.texParameteri(r.TEXTURE_2D,r.TEXTURE_WRAP_T,r.CLAMP_TO_EDGE)}}else if(Ut.length>0){if(Gt&&Jt){let nt=pe(Ut[0]);e.texStorage2D(r.TEXTURE_2D,xt,_t,nt.width,nt.height)}for(let nt=0,yt=Ut.length;nt<yt;nt++)gt=Ut[nt],Gt?H&&e.texSubImage2D(r.TEXTURE_2D,nt,0,0,mt,Ft,gt):e.texImage2D(r.TEXTURE_2D,nt,_t,mt,Ft,gt);E.generateMipmaps=!1}else if(Gt){if(Jt){let nt=pe(st);e.texStorage2D(r.TEXTURE_2D,xt,_t,nt.width,nt.height)}H&&e.texSubImage2D(r.TEXTURE_2D,0,0,0,mt,Ft,st)}else e.texImage2D(r.TEXTURE_2D,0,_t,mt,Ft,st);m(E)&&x(J),pt.__version=ft.version,E.onUpdate&&E.onUpdate(E)}D.__version=E.version}function vt(D,E,V){if(E.image.length!==6)return;let J=Pt(D,E),tt=E.source;e.bindTexture(r.TEXTURE_CUBE_MAP,D.__webglTexture,r.TEXTURE0+V);let ft=i.get(tt);if(tt.version!==ft.__version||J===!0){e.activeTexture(r.TEXTURE0+V);let pt=le.getPrimaries(le.workingColorSpace),et=E.colorSpace===rn?null:le.getPrimaries(E.colorSpace),st=E.colorSpace===rn||pt===et?r.NONE:r.BROWSER_DEFAULT_WEBGL;e.pixelStorei(r.UNPACK_FLIP_Y_WEBGL,E.flipY),e.pixelStorei(r.UNPACK_PREMULTIPLY_ALPHA_WEBGL,E.premultiplyAlpha),e.pixelStorei(r.UNPACK_ALIGNMENT,E.unpackAlignment),e.pixelStorei(r.UNPACK_COLORSPACE_CONVERSION_WEBGL,st);let mt=E.isCompressedTexture||E.image[0].isCompressedTexture,Ft=E.image[0]&&E.image[0].isDataTexture,_t=[];for(let ot=0;ot<6;ot++)!mt&&!Ft?_t[ot]=p(E.image[ot],!0,n.maxCubemapSize):_t[ot]=Ft?E.image[ot].image:E.image[ot],_t[ot]=Ue(E,_t[ot]);let gt=_t[0],Ut=s.convert(E.format,E.colorSpace),Gt=s.convert(E.type),Jt=M(E.internalFormat,Ut,Gt,E.normalized,E.colorSpace),H=E.isVideoTexture!==!0,xt=ft.__version===void 0||J===!0,nt=tt.dataReady,yt=_(E,gt);ut(r.TEXTURE_CUBE_MAP,E);let Et;if(mt){H&&xt&&e.texStorage2D(r.TEXTURE_CUBE_MAP,yt,Jt,gt.width,gt.height);for(let ot=0;ot<6;ot++){Et=_t[ot].mipmaps;for(let zt=0;zt<Et.length;zt++){let Dt=Et[zt];E.format!==ri?Ut!==null?H?nt&&e.compressedTexSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ot,zt,0,0,Dt.width,Dt.height,Ut,Dt.data):e.compressedTexImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ot,zt,Jt,Dt.width,Dt.height,0,Dt.data):Vt("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):H?nt&&e.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ot,zt,0,0,Dt.width,Dt.height,Ut,Gt,Dt.data):e.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ot,zt,Jt,Dt.width,Dt.height,0,Ut,Gt,Dt.data)}}}else{if(Et=E.mipmaps,H&&xt){Et.length>0&&yt++;let ot=pe(_t[0]);e.texStorage2D(r.TEXTURE_CUBE_MAP,yt,Jt,ot.width,ot.height)}for(let ot=0;ot<6;ot++)if(Ft){H?nt&&e.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ot,0,0,0,_t[ot].width,_t[ot].height,Ut,Gt,_t[ot].data):e.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ot,0,Jt,_t[ot].width,_t[ot].height,0,Ut,Gt,_t[ot].data);for(let zt=0;zt<Et.length;zt++){let Te=Et[zt].image[ot].image;H?nt&&e.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ot,zt+1,0,0,Te.width,Te.height,Ut,Gt,Te.data):e.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ot,zt+1,Jt,Te.width,Te.height,0,Ut,Gt,Te.data)}}else{H?nt&&e.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ot,0,0,0,Ut,Gt,_t[ot]):e.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ot,0,Jt,Ut,Gt,_t[ot]);for(let zt=0;zt<Et.length;zt++){let Dt=Et[zt];H?nt&&e.texSubImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ot,zt+1,0,0,Ut,Gt,Dt.image[ot]):e.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+ot,zt+1,Jt,Ut,Gt,Dt.image[ot])}}}m(E)&&x(r.TEXTURE_CUBE_MAP),ft.__version=tt.version,E.onUpdate&&E.onUpdate(E)}D.__version=E.version}function lt(D,E,V,J,tt,ft){let pt=s.convert(V.format,V.colorSpace),et=s.convert(V.type),st=M(V.internalFormat,pt,et,V.normalized,V.colorSpace),mt=i.get(E),Ft=i.get(V);if(Ft.__renderTarget=E,!mt.__hasExternalTextures){let _t=Math.max(1,E.width>>ft),gt=Math.max(1,E.height>>ft);tt===r.TEXTURE_3D||tt===r.TEXTURE_2D_ARRAY?e.texImage3D(tt,ft,st,_t,gt,E.depth,0,pt,et,null):e.texImage2D(tt,ft,st,_t,gt,0,pt,et,null)}e.bindFramebuffer(r.FRAMEBUFFER,D),Qt(E)?a.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,J,tt,Ft.__webglTexture,0,Ot(E)):(tt===r.TEXTURE_2D||tt>=r.TEXTURE_CUBE_MAP_POSITIVE_X&&tt<=r.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&r.framebufferTexture2D(r.FRAMEBUFFER,J,tt,Ft.__webglTexture,ft),e.bindFramebuffer(r.FRAMEBUFFER,null)}function Ht(D,E,V){if(r.bindRenderbuffer(r.RENDERBUFFER,D),E.depthBuffer){let J=E.depthTexture,tt=J&&J.isDepthTexture?J.type:null,ft=b(E.stencilBuffer,tt),pt=E.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT;Qt(E)?a.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,Ot(E),ft,E.width,E.height):V?r.renderbufferStorageMultisample(r.RENDERBUFFER,Ot(E),ft,E.width,E.height):r.renderbufferStorage(r.RENDERBUFFER,ft,E.width,E.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,pt,r.RENDERBUFFER,D)}else{let J=E.textures;for(let tt=0;tt<J.length;tt++){let ft=J[tt],pt=s.convert(ft.format,ft.colorSpace),et=s.convert(ft.type),st=M(ft.internalFormat,pt,et,ft.normalized,ft.colorSpace);Qt(E)?a.renderbufferStorageMultisampleEXT(r.RENDERBUFFER,Ot(E),st,E.width,E.height):V?r.renderbufferStorageMultisample(r.RENDERBUFFER,Ot(E),st,E.width,E.height):r.renderbufferStorage(r.RENDERBUFFER,st,E.width,E.height)}}r.bindRenderbuffer(r.RENDERBUFFER,null)}function fe(D,E,V){let J=E.isWebGLCubeRenderTarget===!0;if(e.bindFramebuffer(r.FRAMEBUFFER,D),!(E.depthTexture&&E.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let tt=i.get(E.depthTexture);if(tt.__renderTarget=E,(!tt.__webglTexture||E.depthTexture.image.width!==E.width||E.depthTexture.image.height!==E.height)&&(E.depthTexture.image.width=E.width,E.depthTexture.image.height=E.height,E.depthTexture.needsUpdate=!0),J){if(tt.__webglInit===void 0&&(tt.__webglInit=!0,E.depthTexture.addEventListener("dispose",w)),tt.__webglTexture===void 0){tt.__webglTexture=r.createTexture(),e.bindTexture(r.TEXTURE_CUBE_MAP,tt.__webglTexture),ut(r.TEXTURE_CUBE_MAP,E.depthTexture);let mt=s.convert(E.depthTexture.format),Ft=s.convert(E.depthTexture.type),_t;E.depthTexture.format===Hi?_t=r.DEPTH_COMPONENT24:E.depthTexture.format===Tn&&(_t=r.DEPTH24_STENCIL8);for(let gt=0;gt<6;gt++)r.texImage2D(r.TEXTURE_CUBE_MAP_POSITIVE_X+gt,0,_t,E.width,E.height,0,mt,Ft,null)}}else Q(E.depthTexture,0);let ft=tt.__webglTexture,pt=Ot(E),et=J?r.TEXTURE_CUBE_MAP_POSITIVE_X+V:r.TEXTURE_2D,st=E.depthTexture.format===Tn?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT;if(E.depthTexture.format===Hi)Qt(E)?a.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,st,et,ft,0,pt):r.framebufferTexture2D(r.FRAMEBUFFER,st,et,ft,0);else if(E.depthTexture.format===Tn)Qt(E)?a.framebufferTexture2DMultisampleEXT(r.FRAMEBUFFER,st,et,ft,0,pt):r.framebufferTexture2D(r.FRAMEBUFFER,st,et,ft,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function Wt(D){let E=i.get(D),V=D.isWebGLCubeRenderTarget===!0;if(E.__boundDepthTexture!==D.depthTexture){let J=D.depthTexture;if(E.__depthDisposeCallback&&E.__depthDisposeCallback(),J){let tt=()=>{delete E.__boundDepthTexture,delete E.__depthDisposeCallback,J.removeEventListener("dispose",tt)};J.addEventListener("dispose",tt),E.__depthDisposeCallback=tt}E.__boundDepthTexture=J}if(D.depthTexture&&!E.__autoAllocateDepthBuffer)if(V)for(let J=0;J<6;J++)fe(E.__webglFramebuffer[J],D,J);else{let J=D.texture.mipmaps;J&&J.length>0?fe(E.__webglFramebuffer[0],D,0):fe(E.__webglFramebuffer,D,0)}else if(V){E.__webglDepthbuffer=[];for(let J=0;J<6;J++)if(e.bindFramebuffer(r.FRAMEBUFFER,E.__webglFramebuffer[J]),E.__webglDepthbuffer[J]===void 0)E.__webglDepthbuffer[J]=r.createRenderbuffer(),Ht(E.__webglDepthbuffer[J],D,!1);else{let tt=D.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,ft=E.__webglDepthbuffer[J];r.bindRenderbuffer(r.RENDERBUFFER,ft),r.framebufferRenderbuffer(r.FRAMEBUFFER,tt,r.RENDERBUFFER,ft)}}else{let J=D.texture.mipmaps;if(J&&J.length>0?e.bindFramebuffer(r.FRAMEBUFFER,E.__webglFramebuffer[0]):e.bindFramebuffer(r.FRAMEBUFFER,E.__webglFramebuffer),E.__webglDepthbuffer===void 0)E.__webglDepthbuffer=r.createRenderbuffer(),Ht(E.__webglDepthbuffer,D,!1);else{let tt=D.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,ft=E.__webglDepthbuffer;r.bindRenderbuffer(r.RENDERBUFFER,ft),r.framebufferRenderbuffer(r.FRAMEBUFFER,tt,r.RENDERBUFFER,ft)}}e.bindFramebuffer(r.FRAMEBUFFER,null)}function ht(D,E,V){let J=i.get(D);E!==void 0&&lt(J.__webglFramebuffer,D,D.texture,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,0),V!==void 0&&Wt(D)}function it(D){let E=D.texture,V=i.get(D),J=i.get(E);D.addEventListener("dispose",v);let tt=D.textures,ft=D.isWebGLCubeRenderTarget===!0,pt=tt.length>1;if(pt||(J.__webglTexture===void 0&&(J.__webglTexture=r.createTexture()),J.__version=E.version,o.memory.textures++),ft){V.__webglFramebuffer=[];for(let et=0;et<6;et++)if(E.mipmaps&&E.mipmaps.length>0){V.__webglFramebuffer[et]=[];for(let st=0;st<E.mipmaps.length;st++)V.__webglFramebuffer[et][st]=r.createFramebuffer()}else V.__webglFramebuffer[et]=r.createFramebuffer()}else{if(E.mipmaps&&E.mipmaps.length>0){V.__webglFramebuffer=[];for(let et=0;et<E.mipmaps.length;et++)V.__webglFramebuffer[et]=r.createFramebuffer()}else V.__webglFramebuffer=r.createFramebuffer();if(pt)for(let et=0,st=tt.length;et<st;et++){let mt=i.get(tt[et]);mt.__webglTexture===void 0&&(mt.__webglTexture=r.createTexture(),o.memory.textures++)}if(D.samples>0&&Qt(D)===!1){V.__webglMultisampledFramebuffer=r.createFramebuffer(),V.__webglColorRenderbuffer=[],e.bindFramebuffer(r.FRAMEBUFFER,V.__webglMultisampledFramebuffer);for(let et=0;et<tt.length;et++){let st=tt[et];V.__webglColorRenderbuffer[et]=r.createRenderbuffer(),r.bindRenderbuffer(r.RENDERBUFFER,V.__webglColorRenderbuffer[et]);let mt=s.convert(st.format,st.colorSpace),Ft=s.convert(st.type),_t=M(st.internalFormat,mt,Ft,st.normalized,st.colorSpace,D.isXRRenderTarget===!0),gt=Ot(D);r.renderbufferStorageMultisample(r.RENDERBUFFER,gt,_t,D.width,D.height),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+et,r.RENDERBUFFER,V.__webglColorRenderbuffer[et])}r.bindRenderbuffer(r.RENDERBUFFER,null),D.depthBuffer&&(V.__webglDepthRenderbuffer=r.createRenderbuffer(),Ht(V.__webglDepthRenderbuffer,D,!0)),e.bindFramebuffer(r.FRAMEBUFFER,null)}}if(ft){e.bindTexture(r.TEXTURE_CUBE_MAP,J.__webglTexture),ut(r.TEXTURE_CUBE_MAP,E);for(let et=0;et<6;et++)if(E.mipmaps&&E.mipmaps.length>0)for(let st=0;st<E.mipmaps.length;st++)lt(V.__webglFramebuffer[et][st],D,E,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+et,st);else lt(V.__webglFramebuffer[et],D,E,r.COLOR_ATTACHMENT0,r.TEXTURE_CUBE_MAP_POSITIVE_X+et,0);m(E)&&x(r.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(pt){for(let et=0,st=tt.length;et<st;et++){let mt=tt[et],Ft=i.get(mt),_t=r.TEXTURE_2D;(D.isWebGL3DRenderTarget||D.isWebGLArrayRenderTarget)&&(_t=D.isWebGL3DRenderTarget?r.TEXTURE_3D:r.TEXTURE_2D_ARRAY),e.bindTexture(_t,Ft.__webglTexture),ut(_t,mt),lt(V.__webglFramebuffer,D,mt,r.COLOR_ATTACHMENT0+et,_t,0),m(mt)&&x(_t)}e.unbindTexture()}else{let et=r.TEXTURE_2D;if((D.isWebGL3DRenderTarget||D.isWebGLArrayRenderTarget)&&(et=D.isWebGL3DRenderTarget?r.TEXTURE_3D:r.TEXTURE_2D_ARRAY),e.bindTexture(et,J.__webglTexture),ut(et,E),E.mipmaps&&E.mipmaps.length>0)for(let st=0;st<E.mipmaps.length;st++)lt(V.__webglFramebuffer[st],D,E,r.COLOR_ATTACHMENT0,et,st);else lt(V.__webglFramebuffer,D,E,r.COLOR_ATTACHMENT0,et,0);m(E)&&x(et),e.unbindTexture()}D.depthBuffer&&Wt(D)}function Lt(D){let E=D.textures;for(let V=0,J=E.length;V<J;V++){let tt=E[V];if(m(tt)){let ft=S(D),pt=i.get(tt).__webglTexture;e.bindTexture(ft,pt),x(ft),e.unbindTexture()}}}let jt=[],Yt=[];function qt(D){if(D.samples>0){if(Qt(D)===!1){let E=D.textures,V=D.width,J=D.height,tt=r.COLOR_BUFFER_BIT,ft=D.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT,pt=i.get(D),et=E.length>1;if(et)for(let mt=0;mt<E.length;mt++)e.bindFramebuffer(r.FRAMEBUFFER,pt.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+mt,r.RENDERBUFFER,null),e.bindFramebuffer(r.FRAMEBUFFER,pt.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+mt,r.TEXTURE_2D,null,0);e.bindFramebuffer(r.READ_FRAMEBUFFER,pt.__webglMultisampledFramebuffer);let st=D.texture.mipmaps;st&&st.length>0?e.bindFramebuffer(r.DRAW_FRAMEBUFFER,pt.__webglFramebuffer[0]):e.bindFramebuffer(r.DRAW_FRAMEBUFFER,pt.__webglFramebuffer);for(let mt=0;mt<E.length;mt++){if(D.resolveDepthBuffer&&(D.depthBuffer&&(tt|=r.DEPTH_BUFFER_BIT),D.stencilBuffer&&D.resolveStencilBuffer&&(tt|=r.STENCIL_BUFFER_BIT)),et){r.framebufferRenderbuffer(r.READ_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.RENDERBUFFER,pt.__webglColorRenderbuffer[mt]);let Ft=i.get(E[mt]).__webglTexture;r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0,r.TEXTURE_2D,Ft,0)}r.blitFramebuffer(0,0,V,J,0,0,V,J,tt,r.NEAREST),l===!0&&(jt.length=0,Yt.length=0,jt.push(r.COLOR_ATTACHMENT0+mt),D.depthBuffer&&D.storeMultisampledDepthBuffer===!1&&(jt.push(ft),Yt.push(ft),r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,Yt)),r.invalidateFramebuffer(r.READ_FRAMEBUFFER,jt))}if(e.bindFramebuffer(r.READ_FRAMEBUFFER,null),e.bindFramebuffer(r.DRAW_FRAMEBUFFER,null),et)for(let mt=0;mt<E.length;mt++){e.bindFramebuffer(r.FRAMEBUFFER,pt.__webglMultisampledFramebuffer),r.framebufferRenderbuffer(r.FRAMEBUFFER,r.COLOR_ATTACHMENT0+mt,r.RENDERBUFFER,pt.__webglColorRenderbuffer[mt]);let Ft=i.get(E[mt]).__webglTexture;e.bindFramebuffer(r.FRAMEBUFFER,pt.__webglFramebuffer),r.framebufferTexture2D(r.DRAW_FRAMEBUFFER,r.COLOR_ATTACHMENT0+mt,r.TEXTURE_2D,Ft,0)}e.bindFramebuffer(r.DRAW_FRAMEBUFFER,pt.__webglMultisampledFramebuffer)}else if(D.depthBuffer&&D.storeMultisampledDepthBuffer===!1&&l){let E=D.stencilBuffer?r.DEPTH_STENCIL_ATTACHMENT:r.DEPTH_ATTACHMENT;r.invalidateFramebuffer(r.DRAW_FRAMEBUFFER,[E])}}}function Ot(D){return Math.min(n.maxSamples,D.samples)}function Qt(D){let E=i.get(D);return D.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&E.__useRenderToTexture!==!1}function z(D){let E=o.render.frame;h.get(D)!==E&&(h.set(D,E),D.update())}function Ue(D,E){let V=D.colorSpace,J=D.format,tt=D.type;return D.isCompressedTexture===!0||D.isVideoTexture===!0||V!==ks&&V!==rn&&(le.getTransfer(V)===ve?(J!==ri||tt!==hi)&&Vt("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Xt("WebGLTextures: Unsupported texture color space:",V)),E}function pe(D){return typeof HTMLImageElement<"u"&&D instanceof HTMLImageElement?(c.width=D.naturalWidth||D.width,c.height=D.naturalHeight||D.height):typeof VideoFrame<"u"&&D instanceof VideoFrame?(c.width=D.displayWidth,c.height=D.displayHeight):(c.width=D.width,c.height=D.height),c}this.allocateTextureUnit=B,this.resetTextureUnits=N,this.getTextureUnits=I,this.setTextureUnits=U,this.setTexture2D=Q,this.setTexture2DArray=F,this.setTexture3D=$,this.setTextureCube=K,this.rebindTextures=ht,this.setupRenderTarget=it,this.updateRenderTargetMipmap=Lt,this.updateMultisampleRenderTarget=qt,this.setupDepthRenderbuffer=Wt,this.setupFrameBufferTexture=lt,this.useMultisampledRTT=Qt,this.isReversedDepthBuffer=function(){return e.buffers.depth.getReversed()}}function Tg(r,t){function e(i,n=rn){let s,o=le.getTransfer(n);if(i===hi)return r.UNSIGNED_BYTE;if(i===Bo)return r.UNSIGNED_SHORT_4_4_4_4;if(i===zo)return r.UNSIGNED_SHORT_5_5_5_1;if(i===Yl)return r.UNSIGNED_INT_5_9_9_9_REV;if(i===ql)return r.UNSIGNED_INT_10F_11F_11F_REV;if(i===Wl)return r.BYTE;if(i===Xl)return r.SHORT;if(i===Ss)return r.UNSIGNED_SHORT;if(i===Uo)return r.INT;if(i===Li)return r.UNSIGNED_INT;if(i===Si)return r.FLOAT;if(i===Di)return r.HALF_FLOAT;if(i===$l)return r.ALPHA;if(i===Zl)return r.RGB;if(i===ri)return r.RGBA;if(i===Hi)return r.DEPTH_COMPONENT;if(i===Tn)return r.DEPTH_STENCIL;if(i===ko)return r.RED;if(i===Oo)return r.RED_INTEGER;if(i===An)return r.RG;if(i===Ho)return r.RG_INTEGER;if(i===Go)return r.RGBA_INTEGER;if(i===cr||i===hr||i===dr||i===ur)if(o===ve)if(s=t.get("WEBGL_compressed_texture_s3tc_srgb"),s!==null){if(i===cr)return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===hr)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===dr)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===ur)return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(s=t.get("WEBGL_compressed_texture_s3tc"),s!==null){if(i===cr)return s.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===hr)return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===dr)return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===ur)return s.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Vo||i===Wo||i===Xo||i===Yo)if(s=t.get("WEBGL_compressed_texture_pvrtc"),s!==null){if(i===Vo)return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Wo)return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Xo)return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Yo)return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===qo||i===$o||i===Zo||i===Qo||i===Ko||i===fr||i===Jo)if(s=t.get("WEBGL_compressed_texture_etc"),s!==null){if(i===qo||i===$o)return o===ve?s.COMPRESSED_SRGB8_ETC2:s.COMPRESSED_RGB8_ETC2;if(i===Zo)return o===ve?s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:s.COMPRESSED_RGBA8_ETC2_EAC;if(i===Qo)return s.COMPRESSED_R11_EAC;if(i===Ko)return s.COMPRESSED_SIGNED_R11_EAC;if(i===fr)return s.COMPRESSED_RG11_EAC;if(i===Jo)return s.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===jo||i===ta||i===ea||i===ia||i===na||i===sa||i===ra||i===oa||i===aa||i===la||i===ca||i===ha||i===da||i===ua)if(s=t.get("WEBGL_compressed_texture_astc"),s!==null){if(i===jo)return o===ve?s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:s.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===ta)return o===ve?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:s.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===ea)return o===ve?s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:s.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===ia)return o===ve?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:s.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===na)return o===ve?s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:s.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===sa)return o===ve?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:s.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===ra)return o===ve?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:s.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===oa)return o===ve?s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:s.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===aa)return o===ve?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:s.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===la)return o===ve?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:s.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===ca)return o===ve?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:s.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===ha)return o===ve?s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:s.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===da)return o===ve?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:s.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===ua)return o===ve?s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:s.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===fa||i===pa||i===ma)if(s=t.get("EXT_texture_compression_bptc"),s!==null){if(i===fa)return o===ve?s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:s.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===pa)return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===ma)return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===ga||i===xa||i===pr||i===ya)if(s=t.get("EXT_texture_compression_rgtc"),s!==null){if(i===ga)return s.COMPRESSED_RED_RGTC1_EXT;if(i===xa)return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===pr)return s.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===ya)return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===bs?r.UNSIGNED_INT_24_8:r[i]!==void 0?r[i]:null}return{convert:e}}var Ag=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Cg=`
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

}`,Mc=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){let i=new $s(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=i}}getMesh(t){if(this.texture!==null&&this.mesh===null){let e=t.cameras[0].viewport,i=new Ne({vertexShader:Ag,fragmentShader:Cg,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new Mt(new Vn(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},_c=class extends Gi{constructor(t,e){super();let i=this,n=null,s=1,o=null,a="local-floor",l=1,c=null,h=null,u=null,d=null,f=null,g=null,y=typeof XRWebGLBinding<"u",p=new Mc,m={},x=e.getContextAttributes(),S=null,M=null,b=[],_=[],w=new Kt,v=null,T=null,C=new ti;C.viewport=new De;let R=new ti;R.viewport=new De;let P=[C,R],N=new Po,I=null,U=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(q){let Z=b[q];return Z===void 0&&(Z=new ys,b[q]=Z),Z.getTargetRaySpace()},this.getControllerGrip=function(q){let Z=b[q];return Z===void 0&&(Z=new ys,b[q]=Z),Z.getGripSpace()},this.getHand=function(q){let Z=b[q];return Z===void 0&&(Z=new ys,b[q]=Z),Z.getHandSpace()};function B(q){let Z=_.indexOf(q.inputSource);if(Z===-1)return;let ct=b[Z];ct!==void 0&&(ct.update(q.inputSource,q.frame,c||o),ct.dispatchEvent({type:q.type,data:q.inputSource}))}function G(){n.removeEventListener("select",B),n.removeEventListener("selectstart",B),n.removeEventListener("selectend",B),n.removeEventListener("squeeze",B),n.removeEventListener("squeezestart",B),n.removeEventListener("squeezeend",B),n.removeEventListener("end",G),n.removeEventListener("inputsourceschange",Q);for(let q=0;q<b.length;q++){let Z=_[q];Z!==null&&(_[q]=null,b[q].disconnect(Z))}I=null,U=null,p.reset();for(let q in m)delete m[q];if(t.setRenderTarget(S),f=null,d=null,u=null,n=null,M=null,Pt.stop(),i.isPresenting=!1,t.setPixelRatio(v),t.setSize(w.width,w.height,!1),T!==null){let q=T.camera;q.fov=T.fov,q.zoom=T.zoom,q.updateProjectionMatrix(),T=null}i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(q){s=q,i.isPresenting===!0&&Vt("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(q){a=q,i.isPresenting===!0&&Vt("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(q){c=q},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return u===null&&y&&(u=new XRWebGLBinding(n,e)),u},this.getFrame=function(){return g},this.getSession=function(){return n},this.setSession=async function(q){if(n=q,n!==null){if(S=t.getRenderTarget(),n.addEventListener("select",B),n.addEventListener("selectstart",B),n.addEventListener("selectend",B),n.addEventListener("squeeze",B),n.addEventListener("squeezestart",B),n.addEventListener("squeezeend",B),n.addEventListener("end",G),n.addEventListener("inputsourceschange",Q),x.xrCompatible!==!0&&await e.makeXRCompatible(),v=t.getPixelRatio(),t.getSize(w),y&&"createProjectionLayer"in XRWebGLBinding.prototype){let ct=null,vt=null,lt=null;x.depth&&(lt=x.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,ct=x.stencil?Tn:Hi,vt=x.stencil?bs:Li);let Ht={colorFormat:e.RGBA8,depthFormat:lt,scaleFactor:s};u=this.getBinding(),d=u.createProjectionLayer(Ht),n.updateRenderState({layers:[d]}),t.setPixelRatio(1),t.setSize(d.textureWidth,d.textureHeight,!1),M=new ci(d.textureWidth,d.textureHeight,{format:ri,type:hi,depthTexture:new vn(d.textureWidth,d.textureHeight,vt,void 0,void 0,void 0,void 0,void 0,void 0,ct),stencilBuffer:x.stencil,colorSpace:t.outputColorSpace,samples:x.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}else{let ct={antialias:x.antialias,alpha:!0,depth:x.depth,stencil:x.stencil,framebufferScaleFactor:s};f=new XRWebGLLayer(n,e,ct),n.updateRenderState({baseLayer:f}),t.setPixelRatio(1),t.setSize(f.framebufferWidth,f.framebufferHeight,!1),M=new ci(f.framebufferWidth,f.framebufferHeight,{format:ri,type:hi,colorSpace:t.outputColorSpace,stencilBuffer:x.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}M.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await n.requestReferenceSpace(a),Pt.setContext(n),Pt.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(n!==null)return n.environmentBlendMode},this.getDepthTexture=function(){return p.getDepthTexture()};function Q(q){for(let Z=0;Z<q.removed.length;Z++){let ct=q.removed[Z],vt=_.indexOf(ct);vt>=0&&(_[vt]=null,b[vt].disconnect(ct))}for(let Z=0;Z<q.added.length;Z++){let ct=q.added[Z],vt=_.indexOf(ct);if(vt===-1){for(let Ht=0;Ht<b.length;Ht++)if(Ht>=_.length){_.push(ct),vt=Ht;break}else if(_[Ht]===null){_[Ht]=ct,vt=Ht;break}if(vt===-1)break}let lt=b[vt];lt&&lt.connect(ct)}}let F=new O,$=new O;function K(q,Z,ct){F.setFromMatrixPosition(Z.matrixWorld),$.setFromMatrixPosition(ct.matrixWorld);let vt=F.distanceTo($),lt=Z.projectionMatrix.elements,Ht=ct.projectionMatrix.elements,fe=lt[14]/(lt[10]-1),Wt=lt[14]/(lt[10]+1),ht=(lt[9]+1)/lt[5],it=(lt[9]-1)/lt[5],Lt=(lt[8]-1)/lt[0],jt=(Ht[8]+1)/Ht[0],Yt=fe*Lt,qt=fe*jt,Ot=vt/(-Lt+jt),Qt=Ot*-Lt;if(Z.matrixWorld.decompose(q.position,q.quaternion,q.scale),q.translateX(Qt),q.translateZ(Ot),q.matrixWorld.compose(q.position,q.quaternion,q.scale),q.matrixWorldInverse.copy(q.matrixWorld).invert(),lt[10]===-1)q.projectionMatrix.copy(Z.projectionMatrix),q.projectionMatrixInverse.copy(Z.projectionMatrixInverse);else{let z=fe+Ot,Ue=Wt+Ot,pe=Yt-Qt,D=qt+(vt-Qt),E=ht*Wt/Ue*z,V=it*Wt/Ue*z;q.projectionMatrix.makePerspective(pe,D,E,V,z,Ue),q.projectionMatrixInverse.copy(q.projectionMatrix).invert()}}function at(q,Z){Z===null?q.matrixWorld.copy(q.matrix):q.matrixWorld.multiplyMatrices(Z.matrixWorld,q.matrix),q.matrixWorldInverse.copy(q.matrixWorld).invert()}this.updateCamera=function(q){if(n===null)return;let Z=q.near,ct=q.far;p.texture!==null&&(p.depthNear>0&&(Z=p.depthNear),p.depthFar>0&&(ct=p.depthFar)),N.near=R.near=C.near=Z,N.far=R.far=C.far=ct,(I!==N.near||U!==N.far)&&(n.updateRenderState({depthNear:N.near,depthFar:N.far}),I=N.near,U=N.far),N.layers.mask=q.layers.mask|6,C.layers.mask=N.layers.mask&-5,R.layers.mask=N.layers.mask&-3;let vt=q.parent,lt=N.cameras;at(N,vt);for(let Ht=0;Ht<lt.length;Ht++)at(lt[Ht],vt);lt.length===2?K(N,C,R):N.projectionMatrix.copy(C.projectionMatrix),T===null&&q.isPerspectiveCamera&&(T={camera:q,fov:q.fov,zoom:q.zoom}),rt(q,N,vt)};function rt(q,Z,ct){ct===null?q.matrix.copy(Z.matrixWorld):(q.matrix.copy(ct.matrixWorld),q.matrix.invert(),q.matrix.multiply(Z.matrixWorld)),q.matrix.decompose(q.position,q.quaternion,q.scale),q.updateMatrixWorld(!0),q.projectionMatrix.copy(Z.projectionMatrix),q.projectionMatrixInverse.copy(Z.projectionMatrixInverse),q.isPerspectiveCamera&&(q.fov=oo*2*Math.atan(1/q.projectionMatrix.elements[5]),q.zoom=1)}this.getCamera=function(){return N},this.getFoveation=function(){if(!(d===null&&f===null))return l},this.setFoveation=function(q){l=q,d!==null&&(d.fixedFoveation=q),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=q)},this.hasDepthSensing=function(){return p.texture!==null},this.getDepthSensingMesh=function(){return p.getMesh(N)},this.getCameraTexture=function(q){return m[q]};let It=null;function ut(q,Z){if(h=Z.getViewerPose(c||o),g=Z,h!==null){let ct=h.views;f!==null&&(t.setRenderTargetFramebuffer(M,f.framebuffer),t.setRenderTarget(M));let vt=!1;ct.length!==N.cameras.length&&(N.cameras.length=0,vt=!0);for(let Wt=0;Wt<ct.length;Wt++){let ht=ct[Wt],it=null;if(f!==null)it=f.getViewport(ht);else{let jt=u.getViewSubImage(d,ht);it=jt.viewport,Wt===0&&(t.setRenderTargetTextures(M,jt.colorTexture,jt.depthStencilTexture),t.setRenderTarget(M))}let Lt=P[Wt];Lt===void 0&&(Lt=new ti,Lt.layers.enable(Wt),Lt.viewport=new De,P[Wt]=Lt),Lt.matrix.fromArray(ht.transform.matrix),Lt.matrix.decompose(Lt.position,Lt.quaternion,Lt.scale),Lt.projectionMatrix.fromArray(ht.projectionMatrix),Lt.projectionMatrixInverse.copy(Lt.projectionMatrix).invert(),Lt.viewport.set(it.x,it.y,it.width,it.height),Wt===0&&(N.matrix.copy(Lt.matrix),N.matrix.decompose(N.position,N.quaternion,N.scale)),vt===!0&&N.cameras.push(Lt)}let lt=n.enabledFeatures;if(lt&&lt.includes("depth-sensing")&&n.depthUsage=="gpu-optimized"&&y){u=i.getBinding();let Wt=u.getDepthInformation(ct[0]);Wt&&Wt.isValid&&Wt.texture&&p.init(Wt,n.renderState)}if(lt&&lt.includes("camera-access")&&y){t.state.unbindTexture(),u=i.getBinding();for(let Wt=0;Wt<ct.length;Wt++){let ht=ct[Wt].camera;if(ht){let it=m[ht];it||(it=new $s,m[ht]=it);let Lt=u.getCameraImage(ht);it.sourceTexture=Lt}}}}for(let ct=0;ct<b.length;ct++){let vt=_[ct],lt=b[ct];vt!==null&&lt!==void 0&&lt.update(vt,Z,c||o)}It&&It(q,Z),Z.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:Z}),g=null}let Pt=new Ad;Pt.setAnimationLoop(ut),this.setAnimationLoop=function(q){It=q},this.dispose=function(){}}},Rg=new ge,Dd=new Zt;Dd.set(-1,0,0,0,1,0,0,0,1);function Ig(r,t){function e(p,m){p.matrixAutoUpdate===!0&&p.updateMatrix(),m.value.copy(p.matrix)}function i(p,m){m.color.getRGB(p.fogColor.value,Jl(r)),m.isFog?(p.fogNear.value=m.near,p.fogFar.value=m.far):m.isFogExp2&&(p.fogDensity.value=m.density)}function n(p,m,x,S,M){m.isNodeMaterial?m.uniformsNeedUpdate=!1:m.isMeshBasicMaterial?s(p,m):m.isMeshLambertMaterial?(s(p,m),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)):m.isMeshToonMaterial?(s(p,m),u(p,m)):m.isMeshPhongMaterial?(s(p,m),h(p,m),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)):m.isMeshStandardMaterial?(s(p,m),d(p,m),m.isMeshPhysicalMaterial&&f(p,m,M)):m.isMeshMatcapMaterial?(s(p,m),g(p,m)):m.isMeshDepthMaterial?s(p,m):m.isMeshDistanceMaterial?(s(p,m),y(p,m)):m.isMeshNormalMaterial?s(p,m):m.isLineBasicMaterial?(o(p,m),m.isLineDashedMaterial&&a(p,m)):m.isPointsMaterial?l(p,m,x,S):m.isSpriteMaterial?c(p,m):m.isShadowMaterial?(p.color.value.copy(m.color),p.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function s(p,m){p.opacity.value=m.opacity,m.color&&p.diffuse.value.copy(m.color),m.emissive&&p.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(p.map.value=m.map,e(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,e(m.alphaMap,p.alphaMapTransform)),m.bumpMap&&(p.bumpMap.value=m.bumpMap,e(m.bumpMap,p.bumpMapTransform),p.bumpScale.value=m.bumpScale,m.side===Ze&&(p.bumpScale.value*=-1)),m.normalMap&&(p.normalMap.value=m.normalMap,e(m.normalMap,p.normalMapTransform),p.normalScale.value.copy(m.normalScale),m.side===Ze&&p.normalScale.value.negate()),m.displacementMap&&(p.displacementMap.value=m.displacementMap,e(m.displacementMap,p.displacementMapTransform),p.displacementScale.value=m.displacementScale,p.displacementBias.value=m.displacementBias),m.emissiveMap&&(p.emissiveMap.value=m.emissiveMap,e(m.emissiveMap,p.emissiveMapTransform)),m.specularMap&&(p.specularMap.value=m.specularMap,e(m.specularMap,p.specularMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest);let x=t.get(m),S=x.envMap,M=x.envMapRotation;S&&(p.envMap.value=S,p.envMapRotation.value.setFromMatrix4(Rg.makeRotationFromEuler(M)).transpose(),S.isCubeTexture&&S.isRenderTargetTexture===!1&&p.envMapRotation.value.premultiply(Dd),p.reflectivity.value=m.reflectivity,p.ior.value=m.ior,p.refractionRatio.value=m.refractionRatio),m.lightMap&&(p.lightMap.value=m.lightMap,p.lightMapIntensity.value=m.lightMapIntensity,e(m.lightMap,p.lightMapTransform)),m.aoMap&&(p.aoMap.value=m.aoMap,p.aoMapIntensity.value=m.aoMapIntensity,e(m.aoMap,p.aoMapTransform))}function o(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,m.map&&(p.map.value=m.map,e(m.map,p.mapTransform))}function a(p,m){p.dashSize.value=m.dashSize,p.totalSize.value=m.dashSize+m.gapSize,p.scale.value=m.scale}function l(p,m,x,S){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.size.value=m.size*x,p.scale.value=S*.5,m.map&&(p.map.value=m.map,e(m.map,p.uvTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,e(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function c(p,m){p.diffuse.value.copy(m.color),p.opacity.value=m.opacity,p.rotation.value=m.rotation,m.map&&(p.map.value=m.map,e(m.map,p.mapTransform)),m.alphaMap&&(p.alphaMap.value=m.alphaMap,e(m.alphaMap,p.alphaMapTransform)),m.alphaTest>0&&(p.alphaTest.value=m.alphaTest)}function h(p,m){p.specular.value.copy(m.specular),p.shininess.value=Math.max(m.shininess,1e-4)}function u(p,m){m.gradientMap&&(p.gradientMap.value=m.gradientMap)}function d(p,m){p.metalness.value=m.metalness,m.metalnessMap&&(p.metalnessMap.value=m.metalnessMap,e(m.metalnessMap,p.metalnessMapTransform)),p.roughness.value=m.roughness,m.roughnessMap&&(p.roughnessMap.value=m.roughnessMap,e(m.roughnessMap,p.roughnessMapTransform)),m.envMap&&(p.envMapIntensity.value=m.envMapIntensity)}function f(p,m,x){p.ior.value=m.ior,m.sheen>0&&(p.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),p.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(p.sheenColorMap.value=m.sheenColorMap,e(m.sheenColorMap,p.sheenColorMapTransform)),m.sheenRoughnessMap&&(p.sheenRoughnessMap.value=m.sheenRoughnessMap,e(m.sheenRoughnessMap,p.sheenRoughnessMapTransform))),m.clearcoat>0&&(p.clearcoat.value=m.clearcoat,p.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(p.clearcoatMap.value=m.clearcoatMap,e(m.clearcoatMap,p.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(p.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,e(m.clearcoatRoughnessMap,p.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(p.clearcoatNormalMap.value=m.clearcoatNormalMap,e(m.clearcoatNormalMap,p.clearcoatNormalMapTransform),p.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===Ze&&p.clearcoatNormalScale.value.negate())),m.dispersion>0&&(p.dispersion.value=m.dispersion),m.retroreflectivity>0&&(p.retroreflectivity.value=m.retroreflectivity),m.iridescence>0&&(p.iridescence.value=m.iridescence,p.iridescenceIOR.value=m.iridescenceIOR,p.iridescenceThicknessMinimum.value=m.iridescenceThicknessRange[0],p.iridescenceThicknessMaximum.value=m.iridescenceThicknessRange[1],m.iridescenceMap&&(p.iridescenceMap.value=m.iridescenceMap,e(m.iridescenceMap,p.iridescenceMapTransform)),m.iridescenceThicknessMap&&(p.iridescenceThicknessMap.value=m.iridescenceThicknessMap,e(m.iridescenceThicknessMap,p.iridescenceThicknessMapTransform))),m.transmission>0&&(p.transmission.value=m.transmission,p.transmissionSamplerMap.value=x.texture,p.transmissionSamplerSize.value.set(x.width,x.height),m.transmissionMap&&(p.transmissionMap.value=m.transmissionMap,e(m.transmissionMap,p.transmissionMapTransform)),p.thickness.value=m.thickness,m.thicknessMap&&(p.thicknessMap.value=m.thicknessMap,e(m.thicknessMap,p.thicknessMapTransform)),p.attenuationDistance.value=m.attenuationDistance,p.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(p.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(p.anisotropyMap.value=m.anisotropyMap,e(m.anisotropyMap,p.anisotropyMapTransform))),p.specularIntensity.value=m.specularIntensity,p.specularColor.value.copy(m.specularColor),m.specularColorMap&&(p.specularColorMap.value=m.specularColorMap,e(m.specularColorMap,p.specularColorMapTransform)),m.specularIntensityMap&&(p.specularIntensityMap.value=m.specularIntensityMap,e(m.specularIntensityMap,p.specularIntensityMapTransform))}function g(p,m){m.matcap&&(p.matcap.value=m.matcap)}function y(p,m){let x=t.get(m).light;p.referencePosition.value.setFromMatrixPosition(x.matrixWorld),p.nearDistance.value=x.shadow.camera.near,p.farDistance.value=x.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:n}}function Pg(r,t,e,i){let n={},s={},o=[],a=r.getParameter(r.MAX_UNIFORM_BUFFER_BINDINGS);function l(M,b){let _=b.program;i.uniformBlockBinding(M,_)}function c(M,b){let _=n[M.id];_===void 0&&(p(M),_=h(M),n[M.id]=_,M.addEventListener("dispose",x));let w=b.program;i.updateUBOMapping(M,w);let v=t.render.frame;s[M.id]!==v&&(d(M),s[M.id]=v)}function h(M){let b=u();M.__bindingPointIndex=b;let _=r.createBuffer(),w=M.__size,v=M.usage;return r.bindBuffer(r.UNIFORM_BUFFER,_),r.bufferData(r.UNIFORM_BUFFER,w,v),r.bindBuffer(r.UNIFORM_BUFFER,null),r.bindBufferBase(r.UNIFORM_BUFFER,b,_),_}function u(){for(let M=0;M<a;M++)if(o.indexOf(M)===-1)return o.push(M),M;return Xt("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(M){let b=n[M.id],_=M.uniforms,w=M.__cache;r.bindBuffer(r.UNIFORM_BUFFER,b);for(let v=0,T=_.length;v<T;v++){let C=_[v];if(Array.isArray(C))for(let R=0,P=C.length;R<P;R++)f(C[R],v,R,w);else f(C,v,0,w)}r.bindBuffer(r.UNIFORM_BUFFER,null)}function f(M,b,_,w){if(y(M,b,_,w)===!0){let v=M.__offset,T=M.value;if(Array.isArray(T)){let C=0;for(let R=0;R<T.length;R++){let P=T[R],N=m(P);g(P,M.__data,C),typeof P!="number"&&typeof P!="boolean"&&!P.isMatrix3&&!ArrayBuffer.isView(P)&&(C+=N.storage/Float32Array.BYTES_PER_ELEMENT)}}else g(T,M.__data,0);r.bufferSubData(r.UNIFORM_BUFFER,v,M.__data)}}function g(M,b,_){typeof M=="number"||typeof M=="boolean"?b[0]=M:M.isMatrix3?(b[0]=M.elements[0],b[1]=M.elements[1],b[2]=M.elements[2],b[3]=0,b[4]=M.elements[3],b[5]=M.elements[4],b[6]=M.elements[5],b[7]=0,b[8]=M.elements[6],b[9]=M.elements[7],b[10]=M.elements[8],b[11]=0):ArrayBuffer.isView(M)?b.set(new M.constructor(M.buffer,M.byteOffset,b.length)):M.toArray(b,_)}function y(M,b,_,w){let v=M.value,T=b+"_"+_;if(w[T]===void 0)return typeof v=="number"||typeof v=="boolean"?w[T]=v:ArrayBuffer.isView(v)?w[T]=v.slice():w[T]=v.clone(),!0;{let C=w[T];if(typeof v=="number"||typeof v=="boolean"){if(C!==v)return w[T]=v,!0}else{if(ArrayBuffer.isView(v))return!0;if(C.equals(v)===!1)return C.copy(v),!0}}return!1}function p(M){let b=M.uniforms,_=0,w=16;for(let T=0,C=b.length;T<C;T++){let R=Array.isArray(b[T])?b[T]:[b[T]];for(let P=0,N=R.length;P<N;P++){let I=R[P],U=Array.isArray(I.value)?I.value:[I.value];for(let B=0,G=U.length;B<G;B++){let Q=U[B],F=m(Q),$=_%w,K=$%F.boundary,at=$+K;_+=K,at!==0&&w-at<F.storage&&(_+=w-at),I.__data=new Float32Array(F.storage/Float32Array.BYTES_PER_ELEMENT),I.__offset=_,_+=F.storage}}}let v=_%w;return v>0&&(_+=w-v),M.__size=_,M.__cache={},this}function m(M){let b={boundary:0,storage:0};return typeof M=="number"||typeof M=="boolean"?(b.boundary=4,b.storage=4):M.isVector2?(b.boundary=8,b.storage=8):M.isVector3||M.isColor?(b.boundary=16,b.storage=12):M.isVector4?(b.boundary=16,b.storage=16):M.isMatrix3?(b.boundary=48,b.storage=48):M.isMatrix4?(b.boundary=64,b.storage=64):M.isTexture?Vt("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(M)?(b.boundary=16,b.storage=M.byteLength):Vt("WebGLRenderer: Unsupported uniform value type.",M),b}function x(M){let b=M.target;b.removeEventListener("dispose",x);let _=o.indexOf(b.__bindingPointIndex);o.splice(_,1),r.deleteBuffer(n[b.id]),delete n[b.id],delete s[b.id]}function S(){for(let M in n)r.deleteBuffer(n[M]);o=[],n={},s={}}return{bind:l,update:c,dispose:S}}var Lg=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Zi=null;function Dg(){return Zi===null&&(Zi=new xn(Lg,16,16,An,Di),Zi.name="DFG_LUT",Zi.minFilter=Ge,Zi.magFilter=Ge,Zi.wrapS=Oi,Zi.wrapT=Oi,Zi.generateMipmaps=!1,Zi.needsUpdate=!0),Zi}var Ea=class{constructor(t={}){let{canvas:e=Jh(),context:i=null,depth:n=!0,stencil:s=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1,outputBufferType:f=hi}=t;this.isWebGLRenderer=!0;let g;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=i.getContextAttributes().alpha}else g=o;let y=f,p=new Set([Go,Ho,Oo]),m=new Set([hi,Li,Ss,bs,Bo,zo]),x=new Uint32Array(4),S=new Int32Array(4),M=new O,b=null,_=null,w=[],v=[],T=null;this.domElement=e,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Pi,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let C=this,R=!1,P=null,N=null,I=null,U=null;this._outputColorSpace=ni;let B=0,G=0,Q=null,F=-1,$=null,K=new De,at=new De,rt=null,It=new dt(0),ut=0,Pt=e.width,q=e.height,Z=1,ct=null,vt=null,lt=new De(0,0,Pt,q),Ht=new De(0,0,Pt,q),fe=!1,Wt=new vs,ht=!1,it=!1,Lt=new ge,jt=new O,Yt=new De,qt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Ot=!1;function Qt(){return Q===null?Z:1}let z=i;function Ue(A,k){return e.getContext(A,k)}let pe,D,E,V,J,tt,ft,pt,et,st,mt,Ft,_t,gt,Ut,Gt,Jt,H,xt,nt,yt,Et,ot;try{let A={alpha:!0,depth:n,stencil:s,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${"186"}`),e.addEventListener("webglcontextlost",Te,!1),e.addEventListener("webglcontextrestored",xe,!1),e.addEventListener("webglcontextcreationerror",wi,!1),z===null){let k="webgl2";if(z=Ue(k,A),z===null)throw Ue(k)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}zt()}catch(A){throw e.removeEventListener("webglcontextlost",Te,!1),e.removeEventListener("webglcontextrestored",xe,!1),e.removeEventListener("webglcontextcreationerror",wi,!1),Xt("WebGLRenderer: "+A.message),A}function zt(){pe=new Om(z),pe.init(),yt=new Tg(z,pe),D=new Im(z,pe,t,yt),E=new wg(z,pe),D.reversedDepthBuffer&&d&&E.buffers.depth.setReversed(!0),N=z.createFramebuffer(),I=z.createFramebuffer(),U=z.createFramebuffer(),V=new Vm(z),J=new hg,tt=new Eg(z,pe,E,J,D,yt,V),ft=new km(C),pt=new Wu(z),Et=new Cm(z,pt),et=new Hm(z,pt,V,Et),st=new Xm(z,et,pt,Et,V),H=new Wm(z,D,tt),Ut=new Pm(J),mt=new cg(C,ft,pe,D,Et,Ut),Ft=new Ig(C,J),_t=new ug,gt=new yg(pe),Jt=new Am(C,ft,E,st,g,l),Gt=new bg(C,st,D),ot=new Pg(z,V,D,E),xt=new Rm(z,pe,V),nt=new Gm(z,pe,V),V.programs=mt.programs,C.capabilities=D,C.extensions=pe,C.properties=J,C.renderLists=_t,C.shadowMap=Gt,C.state=E,C.info=V}y!==hi&&(T=new qm(y,e.width,e.height,a,n,s));let Dt=new _c(C,z);this.xr=Dt,this.getContext=function(){return z},this.getContextAttributes=function(){return z.getContextAttributes()},this.forceContextLoss=function(){let A=pe.get("WEBGL_lose_context");A&&A.loseContext()},this.forceContextRestore=function(){let A=pe.get("WEBGL_lose_context");A&&A.restoreContext()},this.getPixelRatio=function(){return Z},this.setPixelRatio=function(A){A!==void 0&&(Z=A,this.setSize(Pt,q,!1))},this.getSize=function(A){return A.set(Pt,q)},this.setSize=function(A,k,j=!0){if(Dt.isPresenting){Vt("WebGLRenderer: Can't change size while VR device is presenting.");return}Pt=A,q=k,e.width=Math.floor(A*Z),e.height=Math.floor(k*Z),j===!0&&(e.style.width=A+"px",e.style.height=k+"px"),T!==null&&T.setSize(e.width,e.height),this.setViewport(0,0,A,k)},this.getDrawingBufferSize=function(A){return A.set(Pt*Z,q*Z).floor()},this.setDrawingBufferSize=function(A,k,j){Pt=A,q=k,Z=j,e.width=Math.floor(A*j),e.height=Math.floor(k*j),this.setViewport(0,0,A,k)},this.setEffects=function(A){if(y===hi){Xt("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(A){for(let k=0;k<A.length;k++)if(A[k].isOutputPass===!0){Vt("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}T.setEffects(A||[])},this.getCurrentViewport=function(A){return A.copy(K)},this.getViewport=function(A){return A.copy(lt)},this.setViewport=function(A,k,j,X){A.isVector4?lt.set(A.x,A.y,A.z,A.w):lt.set(A,k,j,X),E.viewport(K.copy(lt).multiplyScalar(Z).round())},this.getScissor=function(A){return A.copy(Ht)},this.setScissor=function(A,k,j,X){A.isVector4?Ht.set(A.x,A.y,A.z,A.w):Ht.set(A,k,j,X),E.scissor(at.copy(Ht).multiplyScalar(Z).round())},this.getScissorTest=function(){return fe},this.setScissorTest=function(A){E.setScissorTest(fe=A)},this.setOpaqueSort=function(A){ct=A},this.setTransparentSort=function(A){vt=A},this.getClearColor=function(A){return A.copy(Jt.getClearColor())},this.setClearColor=function(){Jt.setClearColor(...arguments)},this.getClearAlpha=function(){return Jt.getClearAlpha()},this.setClearAlpha=function(){Jt.setClearAlpha(...arguments)},this.clear=function(A=!0,k=!0,j=!0){let X=0;if(A){let Y=!1;if(Q!==null){let wt=Q.texture.format;Y=p.has(wt)}if(Y){let wt=Q.texture.type,At=m.has(wt),bt=Jt.getClearColor(),Ct=Jt.getClearAlpha(),Nt=bt.r,ie=bt.g,ae=bt.b;At?(x[0]=Nt,x[1]=ie,x[2]=ae,x[3]=Ct,z.clearBufferuiv(z.COLOR,0,x)):(S[0]=Nt,S[1]=ie,S[2]=ae,S[3]=Ct,z.clearBufferiv(z.COLOR,0,S))}else X|=z.COLOR_BUFFER_BIT}k&&(X|=z.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),j&&(X|=z.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),X!==0&&z.clear(X)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(A){A.setRenderer(this),P=A},this.dispose=function(){e.removeEventListener("webglcontextlost",Te,!1),e.removeEventListener("webglcontextrestored",xe,!1),e.removeEventListener("webglcontextcreationerror",wi,!1),Jt.dispose(),_t.dispose(),gt.dispose(),J.dispose(),ft.dispose(),st.dispose(),Et.dispose(),ot.dispose(),mt.dispose(),Dt.dispose(),Dt.removeEventListener("sessionstart",Lc),Dt.removeEventListener("sessionend",Dc),Dn.stop()};function Te(A){A.preventDefault(),Kl("WebGLRenderer: Context Lost."),R=!0}function xe(){Kl("WebGLRenderer: Context Restored."),R=!1;let A=V.autoReset,k=Gt.enabled,j=Gt.autoUpdate,X=Gt.needsUpdate,Y=Gt.type;zt(),V.autoReset=A,Gt.enabled=k,Gt.autoUpdate=j,Gt.needsUpdate=X,Gt.type=Y}function wi(A){Xt("WebGLRenderer: A WebGL context could not be created. Reason: ",A.statusMessage)}function Bi(A){let k=A.target;k.removeEventListener("dispose",Bi),tu(k)}function tu(A){eu(A),J.remove(A)}function eu(A){let k=J.get(A).programs;k!==void 0&&(k.forEach(function(j){mt.releaseProgram(j)}),A.isShaderMaterial&&mt.releaseShaderCache(A))}this.renderBufferDirect=function(A,k,j,X,Y,wt){k===null&&(k=qt);let At=Y.isMesh&&Y.matrixWorld.determinantAffine()<0,bt=su(A,k,j,X,Y);E.setMaterial(X,At);let Ct=j.index,Nt=1;if(X.wireframe===!0){if(Ct=et.getWireframeAttribute(j),Ct===void 0)return;Nt=2}let ie=j.drawRange,ae=j.attributes.position,Rt=ie.start*Nt,ye=(ie.start+ie.count)*Nt;wt!==null&&(Rt=Math.max(Rt,wt.start*Nt),ye=Math.min(ye,(wt.start+wt.count)*Nt)),Ct!==null?(Rt=Math.max(Rt,0),ye=Math.min(ye,Ct.count)):ae!=null&&(Rt=Math.max(Rt,0),ye=Math.min(ye,ae.count));let ke=ye-Rt;if(ke<0||ke===1/0)return;Et.setup(Y,X,bt,j,Ct);let Ie,be=xt;if(Ct!==null&&(Ie=pt.get(Ct),be=nt,be.setIndex(Ie)),Y.isMesh)X.wireframe===!0?(E.setLineWidth(X.wireframeLinewidth*Qt()),be.setMode(z.LINES)):be.setMode(z.TRIANGLES);else if(Y.isLine){let Ke=X.linewidth;Ke===void 0&&(Ke=1),E.setLineWidth(Ke*Qt()),Y.isLineSegments?be.setMode(z.LINES):Y.isLineLoop?be.setMode(z.LINE_LOOP):be.setMode(z.LINE_STRIP)}else Y.isPoints?be.setMode(z.POINTS):Y.isSprite&&be.setMode(z.TRIANGLES);if(Y.isBatchedMesh)if(pe.get("WEBGL_multi_draw"))be.renderMultiDraw(Y._multiDrawStarts,Y._multiDrawCounts,Y._multiDrawCount);else{let Ke=Y._multiDrawStarts,Tt=Y._multiDrawCounts,ii=Y._multiDrawCount,de=Ct?pt.get(Ct).bytesPerElement:1,xi=J.get(X).currentProgram.getUniforms();for(let zi=0;zi<ii;zi++)xi.setValue(z,"_gl_DrawID",zi),be.render(Ke[zi]/de,Tt[zi])}else if(Y.isInstancedMesh)be.renderInstances(Rt,ke,Y.count);else if(j.isInstancedBufferGeometry){let Ke=j._maxInstanceCount!==void 0?j._maxInstanceCount:1/0,Tt=Math.min(j.instanceCount,Ke);be.renderInstances(Rt,ke,Tt)}else be.render(Rt,ke)};function Pc(A,k,j,X){P!==null&&A.isNodeMaterial&&P.setObject(X,A),ht===!0&&Ut.setState(A,j,!1),A.transparent===!0&&A.side===Ve&&A.forceSinglePass===!1?(A.side=Ze,A.needsUpdate=!0,wr(A,k,X),A.side=Ii,A.needsUpdate=!0,wr(A,k,X),A.side=Ve):wr(A,k,X)}this.compile=function(A,k,j=null){j===null&&(j=A),P!==null&&P.renderStart(A,k,j),_=gt.get(j),_.init(k),v.push(_),j.traverseVisible(function(Y){Y.isLight&&Y.layers.test(k.layers)&&(_.pushLight(Y),Y.castShadow&&_.pushShadow(Y))}),A!==j&&A.traverseVisible(function(Y){Y.isLight&&Y.layers.test(k.layers)&&(_.pushLight(Y),Y.castShadow&&_.pushShadow(Y))}),_.setupLights(),P!==null&&P.updateLights(_.state.lightsArray),it=this.localClippingEnabled,ht=Ut.init(this.clippingPlanes,it),ht===!0&&Ut.setGlobalState(this.clippingPlanes,k),P!==null&&Gt.render(_.state.shadowsArray,j,k);let X=new Set;return A.traverse(function(Y){if(!(Y.isMesh||Y.isPoints||Y.isLine||Y.isSprite))return;let wt=Y.material;if(wt)if(Array.isArray(wt))for(let At=0;At<wt.length;At++){let bt=wt[At];Pc(bt,j,k,Y),X.add(bt)}else Pc(wt,j,k,Y),X.add(wt)}),_=v.pop(),P!==null&&P.renderEnd(),X},this.compileAsync=function(A,k,j=null){let X=this.compile(A,k,j);return new Promise(Y=>{function wt(){if(X.forEach(function(At){let Ct=J.get(At).currentProgram;(Ct===void 0||Ct.isReady())&&X.delete(At)}),X.size===0){Y(A);return}setTimeout(wt,10)}pe.get("KHR_parallel_shader_compile")!==null?wt():setTimeout(wt,10)})};let Za=null;function iu(A){Za&&Za(A)}function Lc(){Dn.stop()}function Dc(){Dn.start()}let Dn=new Ad;Dn.setAnimationLoop(iu),typeof self<"u"&&Dn.setContext(self),this.setAnimationLoop=function(A){Za=A,Dt.setAnimationLoop(A),A===null?Dn.stop():Dn.start()},Dt.addEventListener("sessionstart",Lc),Dt.addEventListener("sessionend",Dc),this.render=function(A,k){if(k!==void 0&&k.isCamera!==!0){Xt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(R===!0)return;P!==null&&P.renderStart(A,k);let j=Dt.enabled===!0&&Dt.isPresenting===!0,X=T!==null&&(Q===null||j)&&T.begin(C,Q);if(A.matrixWorldAutoUpdate===!0&&A.updateMatrixWorld(),k.parent===null&&k.matrixWorldAutoUpdate===!0&&k.updateMatrixWorld(),Dt.enabled===!0&&Dt.isPresenting===!0&&(T===null||T.isCompositing()===!1)&&(Dt.cameraAutoUpdate===!0&&Dt.updateCamera(k),k=Dt.getCamera()),A.isScene===!0&&A.onBeforeRender(C,A,k,Q),_=gt.get(A,v.length),_.init(k),_.state.textureUnits=tt.getTextureUnits(),v.push(_),Lt.multiplyMatrices(k.projectionMatrix,k.matrixWorldInverse),Wt.setFromProjectionMatrix(Lt,Ri,k.reversedDepth),it=this.localClippingEnabled,ht=Ut.init(this.clippingPlanes,it),b=_t.get(A,w.length),b.init(),w.push(b),Dt.enabled===!0&&Dt.isPresenting===!0){let At=C.xr.getDepthSensingMesh();At!==null&&Qa(At,k,-1/0,C.sortObjects)}Qa(A,k,0,C.sortObjects),b.finish(),P!==null&&P.updateLights(_.state.lightsArray),C.sortObjects===!0&&b.sort(ct,vt),Ot=Dt.enabled===!1||Dt.isPresenting===!1||Dt.hasDepthSensing()===!1,Ot&&Jt.addToRenderList(b,A),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),ht===!0&&Ut.beginShadows();let Y=_.state.shadowsArray;if(Gt.render(Y,A,k),ht===!0&&Ut.endShadows(),(X&&T.hasRenderPass())===!1){let At=b.opaque,bt=b.transmissive;if(_.setupLights(),k.isArrayCamera){let Ct=k.cameras;if(bt.length>0)for(let Nt=0,ie=Ct.length;Nt<ie;Nt++){let ae=Ct[Nt];Fc(At,bt,A,ae)}Ot&&Jt.render(A);for(let Nt=0,ie=Ct.length;Nt<ie;Nt++){let ae=Ct[Nt];Nc(b,A,ae,ae.viewport)}}else bt.length>0&&Fc(At,bt,A,k),Ot&&Jt.render(A),Nc(b,A,k)}Q!==null&&G===0&&(tt.updateMultisampleRenderTarget(Q),tt.updateRenderTargetMipmap(Q)),X&&T.end(C),A.isScene===!0&&A.onAfterRender(C,A,k),Et.resetDefaultState(),F=-1,$=null,v.pop(),v.length>0?(_=v[v.length-1],tt.setTextureUnits(_.state.textureUnits),ht===!0&&Ut.setGlobalState(C.clippingPlanes,_.state.camera)):_=null,w.pop(),w.length>0?b=w[w.length-1]:b=null,P!==null&&P.renderEnd()};function Qa(A,k,j,X){if(A.visible===!1)return;if(A.layers.test(k.layers)){if(A.isGroup)j=A.renderOrder;else if(A.isLOD)A.autoUpdate===!0&&A.update(k);else if(A.isLightProbeGrid)_.pushLightProbeGrid(A);else if(A.isLight)_.pushLight(A),A.castShadow&&_.pushShadow(A);else if(A.isSprite){if(!A.frustumCulled||A.intersectsFrustum(Wt)){X&&Yt.setFromMatrixPosition(A.matrixWorld).applyMatrix4(Lt);let At=st.update(A),bt=A.material;bt.visible&&b.push(A,At,bt,j,Yt.z,null,k)}}else if((A.isMesh||A.isLine||A.isPoints)&&(!A.frustumCulled||A.intersectsFrustum(Wt))){let At=st.update(A),bt=A.material;if(X&&(A.boundingSphere!==void 0?(A.boundingSphere===null&&A.computeBoundingSphere(),Yt.copy(A.boundingSphere.center)):(At.boundingSphere===null&&At.computeBoundingSphere(),Yt.copy(At.boundingSphere.center)),Yt.applyMatrix4(A.matrixWorld).applyMatrix4(Lt)),Array.isArray(bt)){let Ct=At.groups;for(let Nt=0,ie=Ct.length;Nt<ie;Nt++){let ae=Ct[Nt],Rt=bt[ae.materialIndex];Rt&&Rt.visible&&b.push(A,At,Rt,j,Yt.z,ae,k)}}else bt.visible&&b.push(A,At,bt,j,Yt.z,null,k)}}let wt=A.children;for(let At=0,bt=wt.length;At<bt;At++)Qa(wt[At],k,j,X)}function Nc(A,k,j,X){let{opaque:Y,transmissive:wt,transparent:At}=A;_.setupLightsView(j),ht===!0&&Ut.setGlobalState(C.clippingPlanes,j),X&&E.viewport(K.copy(X)),Y.length>0&&br(Y,k,j),wt.length>0&&br(wt,k,j),At.length>0&&br(At,k,j),E.buffers.depth.setTest(!0),E.buffers.depth.setMask(!0),E.buffers.color.setMask(!0),E.setPolygonOffset(!1)}function Fc(A,k,j,X){if((j.isScene===!0?j.overrideMaterial:null)!==null)return;if(_.state.transmissionRenderTarget[X.id]===void 0){let Rt=pe.has("EXT_color_buffer_half_float")||pe.has("EXT_color_buffer_float");_.state.transmissionRenderTarget[X.id]=new ci(1,1,{generateMipmaps:!0,type:Rt?Di:hi,minFilter:$i,samples:Math.max(4,D.samples),stencilBuffer:s,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:le.workingColorSpace})}let wt=_.state.transmissionRenderTarget[X.id],At=X.viewport||K;wt.setSize(At.z*C.transmissionResolutionScale,At.w*C.transmissionResolutionScale);let bt=C.getRenderTarget(),Ct=C.getActiveCubeFace(),Nt=C.getActiveMipmapLevel();C.setRenderTarget(wt),C.getClearColor(It),ut=C.getClearAlpha(),ut<1&&C.setClearColor(16777215,.5),C.clear(),Ot&&Jt.render(j);let ie=C.toneMapping;C.toneMapping=Pi;let ae=X.viewport;if(X.viewport!==void 0&&(X.viewport=void 0),_.setupLightsView(X),ht===!0&&Ut.setGlobalState(C.clippingPlanes,X),br(A,j,X),tt.updateMultisampleRenderTarget(wt),tt.updateRenderTargetMipmap(wt),pe.has("WEBGL_multisampled_render_to_texture")===!1){let Rt=!1;for(let ye=0,ke=k.length;ye<ke;ye++){let Ie=k[ye],{object:be,geometry:Ke,material:Tt,group:ii}=Ie;if(Tt.side===Ve&&be.layers.test(X.layers)){let de=Tt.side;Tt.side=Ze,Tt.needsUpdate=!0,Uc(be,j,X,Ke,Tt,ii),Tt.side=de,Tt.needsUpdate=!0,Rt=!0}}Rt===!0&&(tt.updateMultisampleRenderTarget(wt),tt.updateRenderTargetMipmap(wt))}C.setRenderTarget(bt,Ct,Nt),C.setClearColor(It,ut),ae!==void 0&&(X.viewport=ae),C.toneMapping=ie}function br(A,k,j){let X=k.isScene===!0?k.overrideMaterial:null;for(let Y=0,wt=A.length;Y<wt;Y++){let At=A[Y],{object:bt,geometry:Ct,group:Nt}=At,ie=At.material;ie.allowOverride===!0&&X!==null&&(ie=X),bt.layers.test(j.layers)&&Uc(bt,k,j,Ct,ie,Nt)}}function Uc(A,k,j,X,Y,wt){P!==null&&Y.isNodeMaterial&&P.setObject(A,Y),A.onBeforeRender(C,k,j,X,Y,wt),A.modelViewMatrix.multiplyMatrices(j.matrixWorldInverse,A.matrixWorld),A.normalMatrix.getNormalMatrix(A.modelViewMatrix),Y.onBeforeRender(C,k,j,X,A,wt),Y.transparent===!0&&Y.side===Ve&&Y.forceSinglePass===!1?(Y.side=Ze,Y.needsUpdate=!0,C.renderBufferDirect(j,k,X,Y,A,wt),Y.side=Ii,Y.needsUpdate=!0,C.renderBufferDirect(j,k,X,Y,A,wt),Y.side=Ve):C.renderBufferDirect(j,k,X,Y,A,wt),A.onAfterRender(C,k,j,X,Y,wt)}function wr(A,k,j){k.isScene!==!0&&(k=qt);let X=J.get(A),Y=_.state.lights,wt=_.state.shadowsArray,At=Y.state.version,bt=mt.getParameters(A,Y.state,wt,k,j,_.state.lightProbeGridArray),Ct=mt.getProgramCacheKey(bt),Nt=X.programs;X.environment=A.isMeshStandardMaterial||A.isMeshLambertMaterial||A.isMeshPhongMaterial?k.environment:null,X.fog=k.fog;let ie=A.isMeshStandardMaterial||A.isMeshLambertMaterial&&!A.envMap||A.isMeshPhongMaterial&&!A.envMap;X.envMap=ft.get(A.envMap||X.environment,ie),X.envMapRotation=X.environment!==null&&A.envMap===null?k.environmentRotation:A.envMapRotation,Nt===void 0&&(A.addEventListener("dispose",Bi),Nt=new Map,X.programs=Nt);let ae=Nt.get(Ct);if(ae!==void 0){if(X.currentProgram===ae&&X.lightsStateVersion===At)return zc(A,bt),ae}else bt.uniforms=mt.getUniforms(A),P!==null&&A.isNodeMaterial&&P.build(A,j,bt),A.onBeforeCompile(bt,C),ae=mt.acquireProgram(bt,Ct),Nt.set(Ct,ae),X.uniforms=bt.uniforms;let Rt=X.uniforms;return(!A.isShaderMaterial&&!A.isRawShaderMaterial||A.clipping===!0)&&(Rt.clippingPlanes=Ut.uniform),zc(A,bt),X.needsLights=ou(A),X.lightsStateVersion=At,X.needsLights&&(Rt.ambientLightColor.value=Y.state.ambient,Rt.lightProbe.value=Y.state.probe,Rt.sunLights.value=Y.state.sun,Rt.sunLightShadows.value=Y.state.sunShadow,Rt.directionalLights.value=Y.state.directional,Rt.directionalLightShadows.value=Y.state.directionalShadow,Rt.spotLights.value=Y.state.spot,Rt.spotLightShadows.value=Y.state.spotShadow,Rt.rectAreaLights.value=Y.state.rectArea,Rt.ltc_1.value=Y.state.rectAreaLTC1,Rt.ltc_2.value=Y.state.rectAreaLTC2,Rt.pointLights.value=Y.state.point,Rt.pointLightShadows.value=Y.state.pointShadow,Rt.hemisphereLights.value=Y.state.hemi,Rt.sunShadowMatrix.value=Y.state.sunShadowMatrix,Rt.sunShadowCascade.value=Y.state.sunShadowCascade,Rt.directionalShadowMatrix.value=Y.state.directionalShadowMatrix,Rt.spotLightMatrix.value=Y.state.spotLightMatrix,Rt.spotLightMap.value=Y.state.spotLightMap,Rt.pointShadowMatrix.value=Y.state.pointShadowMatrix),X.lightProbeGrid=_.state.lightProbeGridArray.length>0,X.currentProgram=ae,X.uniformsList=null,ae}function Bc(A){if(A.uniformsList===null){let k=A.currentProgram.getUniforms();A.uniformsList=As.seqWithValue(k.seq,A.uniforms)}return A.uniformsList}function zc(A,k){let j=J.get(A);j.outputColorSpace=k.outputColorSpace,j.batching=k.batching,j.batchingColor=k.batchingColor,j.instancing=k.instancing,j.instancingColor=k.instancingColor,j.instancingMorph=k.instancingMorph,j.skinning=k.skinning,j.morphTargets=k.morphTargets,j.morphNormals=k.morphNormals,j.morphColors=k.morphColors,j.morphTargetsCount=k.morphTargetsCount,j.numClippingPlanes=k.numClippingPlanes,j.numIntersection=k.numClipIntersection,j.vertexAlphas=k.vertexAlphas,j.vertexTangents=k.vertexTangents,j.toneMapping=k.toneMapping}function nu(A,k){if(A.length===0)return null;if(A.length===1)return A[0].texture!==null?A[0]:null;M.setFromMatrixPosition(k.matrixWorld);for(let j=0,X=A.length;j<X;j++){let Y=A[j];if(Y.texture!==null&&Y.boundingBox.containsPoint(M))return Y}return null}function su(A,k,j,X,Y){k.isScene!==!0&&(k=qt),tt.resetTextureUnits();let wt=k.fog,At=X.isMeshStandardMaterial||X.isMeshLambertMaterial||X.isMeshPhongMaterial?k.environment:null,bt=Q===null?C.outputColorSpace:Q.isXRRenderTarget===!0?Q.texture.colorSpace:le.workingColorSpace,Ct=X.isMeshStandardMaterial||X.isMeshLambertMaterial&&!X.envMap||X.isMeshPhongMaterial&&!X.envMap,Nt=ft.get(X.envMap||At,Ct),ie=X.vertexColors===!0&&!!j.attributes.color&&j.attributes.color.itemSize===4,ae=!!j.attributes.tangent&&(!!X.normalMap||X.anisotropy>0),Rt=!!j.morphAttributes.position,ye=!!j.morphAttributes.normal,ke=!!j.morphAttributes.color,Ie=Pi;X.toneMapped&&(Q===null||Q.isXRRenderTarget===!0)&&(Ie=C.toneMapping);let be=j.morphAttributes.position||j.morphAttributes.normal||j.morphAttributes.color,Ke=be!==void 0?be.length:0,Tt=J.get(X),ii=_.state.lights;if(ht===!0&&(it===!0||A!==$)){let Ae=A===$&&X.id===F;Ut.setState(X,A,Ae)}let de=!1;X.version===Tt.__version?(Tt.needsLights&&Tt.lightsStateVersion!==ii.state.version||Tt.outputColorSpace!==bt||Y.isBatchedMesh&&Tt.batching===!1||!Y.isBatchedMesh&&Tt.batching===!0||Y.isBatchedMesh&&Tt.batchingColor===!0&&Y._colorsTexture===null||Y.isBatchedMesh&&Tt.batchingColor===!1&&Y._colorsTexture!==null||Y.isInstancedMesh&&Tt.instancing===!1||!Y.isInstancedMesh&&Tt.instancing===!0||Y.isSkinnedMesh&&Tt.skinning===!1||!Y.isSkinnedMesh&&Tt.skinning===!0||Y.isInstancedMesh&&Tt.instancingColor===!0&&Y.instanceColor===null||Y.isInstancedMesh&&Tt.instancingColor===!1&&Y.instanceColor!==null||Y.isInstancedMesh&&Tt.instancingMorph===!0&&Y.morphTexture===null||Y.isInstancedMesh&&Tt.instancingMorph===!1&&Y.morphTexture!==null||Tt.envMap!==Nt||X.fog===!0&&Tt.fog!==wt||Tt.numClippingPlanes!==void 0&&(Tt.numClippingPlanes!==Ut.numPlanes||Tt.numIntersection!==Ut.numIntersection)||Tt.vertexAlphas!==ie||Tt.vertexTangents!==ae||Tt.morphTargets!==Rt||Tt.morphNormals!==ye||Tt.morphColors!==ke||Tt.toneMapping!==Ie||Tt.morphTargetsCount!==Ke||!!Tt.lightProbeGrid!=_.state.lightProbeGridArray.length>0)&&(de=!0):(de=!0,Tt.__version=X.version);let xi=Tt.currentProgram;de===!0&&(xi=wr(X,k,Y),P&&X.isNodeMaterial&&P.onUpdateProgram(X,xi,Tt));let zi=!1,ln=!1,Qn=!1,_e=xi.getUniforms(),ze=Tt.uniforms;if(E.useProgram(xi.program)&&(zi=!0,ln=!0,Qn=!0),X.id!==F&&(F=X.id,ln=!0),Tt.needsLights){let Ae=nu(_.state.lightProbeGridArray,Y);Tt.lightProbeGrid!==Ae&&(Tt.lightProbeGrid=Ae,ln=!0)}if(zi||$!==A){E.buffers.depth.getReversed()&&A.reversedDepth!==!0&&(A._reversedDepth=!0,A.updateProjectionMatrix()),_e.setValue(z,"projectionMatrix",A.projectionMatrix),_e.setValue(z,"viewMatrix",A.matrixWorldInverse);let hn=_e.map.cameraPosition;hn!==void 0&&hn.setValue(z,jt.setFromMatrixPosition(A.matrixWorld)),D.logarithmicDepthBuffer&&_e.setValue(z,"logDepthBufFC",2/(Math.log(A.far+1)/Math.LN2)),(X.isMeshPhongMaterial||X.isMeshToonMaterial||X.isMeshLambertMaterial||X.isMeshBasicMaterial||X.isMeshStandardMaterial||X.isShaderMaterial)&&_e.setValue(z,"isOrthographic",A.isOrthographicCamera===!0),$!==A&&($=A,ln=!0,Qn=!0)}if(Tt.needsLights&&(ii.state.sunShadowMap.length>0&&_e.setValue(z,"sunShadowMap",ii.state.sunShadowMap,tt),ii.state.directionalShadowMap.length>0&&_e.setValue(z,"directionalShadowMap",ii.state.directionalShadowMap,tt),ii.state.spotShadowMap.length>0&&_e.setValue(z,"spotShadowMap",ii.state.spotShadowMap,tt),ii.state.pointShadowMap.length>0&&_e.setValue(z,"pointShadowMap",ii.state.pointShadowMap,tt)),Y.isSkinnedMesh){_e.setOptional(z,Y,"bindMatrix"),_e.setOptional(z,Y,"bindMatrixInverse");let Ae=Y.skeleton;Ae&&(Ae.boneTexture===null&&Ae.computeBoneTexture(),_e.setValue(z,"boneTexture",Ae.boneTexture,tt))}Y.isBatchedMesh&&(_e.setOptional(z,Y,"batchingTexture"),_e.setValue(z,"batchingTexture",Y._matricesTexture,tt),_e.setOptional(z,Y,"batchingIdTexture"),_e.setValue(z,"batchingIdTexture",Y._indirectTexture,tt),_e.setOptional(z,Y,"batchingColorTexture"),Y._colorsTexture!==null&&_e.setValue(z,"batchingColorTexture",Y._colorsTexture,tt));let cn=j.morphAttributes;if((cn.position!==void 0||cn.normal!==void 0||cn.color!==void 0)&&H.update(Y,j,xi),(ln||Tt.receiveShadow!==Y.receiveShadow)&&(Tt.receiveShadow=Y.receiveShadow,_e.setValue(z,"receiveShadow",Y.receiveShadow)),(X.isMeshStandardMaterial||X.isMeshLambertMaterial||X.isMeshPhongMaterial)&&X.envMap===null&&k.environment!==null&&(ze.envMapIntensity.value=k.environmentIntensity),ze.dfgLUT!==void 0&&(ze.dfgLUT.value=Dg()),ln){if(_e.setValue(z,"toneMappingExposure",C.toneMappingExposure),Tt.needsLights&&ru(ze,Qn),wt&&X.fog===!0&&Ft.refreshFogUniforms(ze,wt),Ft.refreshMaterialUniforms(ze,X,Z,q,_.state.transmissionRenderTarget[A.id]),Tt.needsLights&&Tt.lightProbeGrid){let Ae=Tt.lightProbeGrid;ze.probesSH.value=Ae.texture,ze.probesMin.value.copy(Ae.boundingBox.min),ze.probesMax.value.copy(Ae.boundingBox.max),ze.probesResolution.value.copy(Ae.resolution)}As.upload(z,Bc(Tt),ze,tt)}if(X.isShaderMaterial&&X.uniformsNeedUpdate===!0&&(As.upload(z,Bc(Tt),ze,tt),X.uniformsNeedUpdate=!1),X.isSpriteMaterial&&_e.setValue(z,"center",Y.center),_e.setValue(z,"modelViewMatrix",Y.modelViewMatrix),_e.setValue(z,"normalMatrix",Y.normalMatrix),_e.setValue(z,"modelMatrix",Y.matrixWorld),X.uniformsGroups!==void 0){let Ae=X.uniformsGroups;for(let hn=0,Kn=Ae.length;hn<Kn;hn++){let Oc=Ae[hn];ot.update(Oc,xi),ot.bind(Oc,xi)}}return xi}function ru(A,k){A.ambientLightColor.needsUpdate=k,A.lightProbe.needsUpdate=k,A.sunLights.needsUpdate=k,A.sunLightShadows.needsUpdate=k,A.directionalLights.needsUpdate=k,A.directionalLightShadows.needsUpdate=k,A.pointLights.needsUpdate=k,A.pointLightShadows.needsUpdate=k,A.spotLights.needsUpdate=k,A.spotLightShadows.needsUpdate=k,A.rectAreaLights.needsUpdate=k,A.hemisphereLights.needsUpdate=k}function ou(A){return A.isMeshLambertMaterial||A.isMeshToonMaterial||A.isMeshPhongMaterial||A.isMeshStandardMaterial||A.isShadowMaterial||A.isShaderMaterial&&A.lights===!0}this.getActiveCubeFace=function(){return B},this.getActiveMipmapLevel=function(){return G},this.getRenderTarget=function(){return Q},this.setRenderTargetTextures=function(A,k,j){let X=J.get(A);X.__autoAllocateDepthBuffer=A.resolveDepthBuffer===!1,X.__autoAllocateDepthBuffer===!1&&(X.__useRenderToTexture=!1),J.get(A.texture).__webglTexture=k,J.get(A.depthTexture).__webglTexture=X.__autoAllocateDepthBuffer?void 0:j,X.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(A,k){let j=J.get(A);j.__webglFramebuffer=k,j.__useDefaultFramebuffer=k===void 0},this.setRenderTarget=function(A,k=0,j=0){Q=A,B=k,G=j;let X=null,Y=!1,wt=!1;if(A){let bt=J.get(A);if(bt.__useDefaultFramebuffer!==void 0){E.bindFramebuffer(z.FRAMEBUFFER,bt.__webglFramebuffer),K.copy(A.viewport),at.copy(A.scissor),rt=A.scissorTest,E.viewport(K),E.scissor(at),E.setScissorTest(rt),F=-1;return}else if(bt.__webglFramebuffer===void 0)tt.setupRenderTarget(A);else if(bt.__hasExternalTextures)tt.rebindTextures(A,J.get(A.texture).__webglTexture,J.get(A.depthTexture).__webglTexture);else if(A.depthBuffer){let ie=A.depthTexture;if(bt.__boundDepthTexture!==ie){if(ie!==null&&J.has(ie)&&(A.width!==ie.image.width||A.height!==ie.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");tt.setupDepthRenderbuffer(A)}}let Ct=A.texture;(Ct.isData3DTexture||Ct.isDataArrayTexture||Ct.isCompressedArrayTexture)&&(wt=!0);let Nt=J.get(A).__webglFramebuffer;A.isWebGLCubeRenderTarget?(Array.isArray(Nt[k])?X=Nt[k][j]:X=Nt[k],Y=!0):A.samples>0&&tt.useMultisampledRTT(A)===!1?X=J.get(A).__webglMultisampledFramebuffer:Array.isArray(Nt)?X=Nt[j]:X=Nt,K.copy(A.viewport),at.copy(A.scissor),rt=A.scissorTest}else K.copy(lt).multiplyScalar(Z).floor(),at.copy(Ht).multiplyScalar(Z).floor(),rt=fe;if(j!==0&&(X=N),E.bindFramebuffer(z.FRAMEBUFFER,X)&&E.drawBuffers(A,X),E.viewport(K),E.scissor(at),E.setScissorTest(rt),Y){let bt=J.get(A.texture);z.framebufferTexture2D(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_CUBE_MAP_POSITIVE_X+k,bt.__webglTexture,j)}else if(wt){let bt=k;for(let Ct=0;Ct<A.textures.length;Ct++){let Nt=J.get(A.textures[Ct]);z.framebufferTextureLayer(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0+Ct,Nt.__webglTexture,j,bt)}}else if(A!==null&&j!==0){let bt=J.get(A.texture);z.framebufferTexture2D(z.FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_2D,bt.__webglTexture,j)}F=-1};function kc(A){let k=J.get(A);return(k.__readFormat!==A.format||k.__readType!==A.type)&&(k.__readFormat=A.format,k.__readType=A.type,k.__formatReadable=D.textureFormatReadable(A.format),k.__typeReadable=D.textureTypeReadable(A.type)),k}this.readRenderTargetPixels=function(A,k,j,X,Y,wt,At,bt=0){if(!(A&&A.isWebGLRenderTarget)){Xt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ct=J.get(A).__webglFramebuffer;if(A.isWebGLCubeRenderTarget&&At!==void 0&&(Ct=Ct[At]),Ct){E.bindFramebuffer(z.FRAMEBUFFER,Ct);try{let Nt=A.textures[bt],ie=Nt.format,ae=Nt.type;A.textures.length>1&&z.readBuffer(z.COLOR_ATTACHMENT0+bt);let Rt=kc(Nt);if(Rt.__formatReadable===!1){Xt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Rt.__typeReadable===!1){Xt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}k>=0&&k<=A.width-X&&j>=0&&j<=A.height-Y&&z.readPixels(k,j,X,Y,yt.convert(ie),yt.convert(ae),wt)}finally{let Nt=Q!==null?J.get(Q).__webglFramebuffer:null;E.bindFramebuffer(z.FRAMEBUFFER,Nt)}}},this.readRenderTargetPixelsAsync=async function(A,k,j,X,Y,wt,At,bt=0){if(!(A&&A.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ct=J.get(A).__webglFramebuffer;if(A.isWebGLCubeRenderTarget&&At!==void 0&&(Ct=Ct[At]),Ct)if(k>=0&&k<=A.width-X&&j>=0&&j<=A.height-Y){E.bindFramebuffer(z.FRAMEBUFFER,Ct);let Nt=A.textures[bt],ie=Nt.format,ae=Nt.type;A.textures.length>1&&z.readBuffer(z.COLOR_ATTACHMENT0+bt);let Rt=kc(Nt);if(Rt.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Rt.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let ye=z.createBuffer();z.bindBuffer(z.PIXEL_PACK_BUFFER,ye),z.bufferData(z.PIXEL_PACK_BUFFER,wt.byteLength,z.STREAM_READ),z.readPixels(k,j,X,Y,yt.convert(ie),yt.convert(ae),0),z.bindBuffer(z.PIXEL_PACK_BUFFER,null);let ke=Q!==null?J.get(Q).__webglFramebuffer:null;E.bindFramebuffer(z.FRAMEBUFFER,ke);let Ie=z.fenceSync(z.SYNC_GPU_COMMANDS_COMPLETE,0);return z.flush(),await td(z,Ie,4),z.bindBuffer(z.PIXEL_PACK_BUFFER,ye),z.getBufferSubData(z.PIXEL_PACK_BUFFER,0,wt),z.bindBuffer(z.PIXEL_PACK_BUFFER,null),z.deleteBuffer(ye),z.deleteSync(Ie),wt}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(A,k=null,j=0){let X=Math.pow(2,-j),Y=Math.floor(A.image.width*X),wt=Math.floor(A.image.height*X),At=k!==null?k.x:0,bt=k!==null?k.y:0;tt.setTexture2D(A,0),z.copyTexSubImage2D(z.TEXTURE_2D,j,0,0,At,bt,Y,wt),E.unbindTexture()},this.copyTextureToTexture=function(A,k,j=null,X=null,Y=0,wt=0){let At,bt,Ct,Nt,ie,ae,Rt,ye,ke,Ie=A.isCompressedTexture?A.mipmaps[wt]:A.image;if(j!==null)At=j.max.x-j.min.x,bt=j.max.y-j.min.y,Ct=j.isBox3?j.max.z-j.min.z:1,Nt=j.min.x,ie=j.min.y,ae=j.isBox3?j.min.z:0;else{let ze=Math.pow(2,-Y);At=Math.floor(Ie.width*ze),bt=Math.floor(Ie.height*ze),A.isDataArrayTexture?Ct=Ie.depth:A.isData3DTexture?Ct=Math.floor(Ie.depth*ze):Ct=1,Nt=0,ie=0,ae=0}X!==null?(Rt=X.x,ye=X.y,ke=X.z):(Rt=0,ye=0,ke=0);let be=yt.convert(k.format),Ke=yt.convert(k.type),Tt;k.isData3DTexture?(tt.setTexture3D(k,0),Tt=z.TEXTURE_3D):k.isDataArrayTexture||k.isCompressedArrayTexture?(tt.setTexture2DArray(k,0),Tt=z.TEXTURE_2D_ARRAY):(tt.setTexture2D(k,0),Tt=z.TEXTURE_2D),E.activeTexture(z.TEXTURE0),E.pixelStorei(z.UNPACK_FLIP_Y_WEBGL,k.flipY),E.pixelStorei(z.UNPACK_PREMULTIPLY_ALPHA_WEBGL,k.premultiplyAlpha),E.pixelStorei(z.UNPACK_ALIGNMENT,k.unpackAlignment);let ii=E.getParameter(z.UNPACK_ROW_LENGTH),de=E.getParameter(z.UNPACK_IMAGE_HEIGHT),xi=E.getParameter(z.UNPACK_SKIP_PIXELS),zi=E.getParameter(z.UNPACK_SKIP_ROWS),ln=E.getParameter(z.UNPACK_SKIP_IMAGES);E.pixelStorei(z.UNPACK_ROW_LENGTH,Ie.width),E.pixelStorei(z.UNPACK_IMAGE_HEIGHT,Ie.height),E.pixelStorei(z.UNPACK_SKIP_PIXELS,Nt),E.pixelStorei(z.UNPACK_SKIP_ROWS,ie),E.pixelStorei(z.UNPACK_SKIP_IMAGES,ae);let Qn=A.isDataArrayTexture||A.isData3DTexture,_e=k.isDataArrayTexture||k.isData3DTexture;if(A.isDepthTexture){let ze=J.get(A),cn=J.get(k),Ae=J.get(ze.__renderTarget),hn=J.get(cn.__renderTarget);E.bindFramebuffer(z.READ_FRAMEBUFFER,Ae.__webglFramebuffer),E.bindFramebuffer(z.DRAW_FRAMEBUFFER,hn.__webglFramebuffer);for(let Kn=0;Kn<Ct;Kn++)Qn&&(z.framebufferTextureLayer(z.READ_FRAMEBUFFER,z.COLOR_ATTACHMENT0,J.get(A).__webglTexture,Y,ae+Kn),z.framebufferTextureLayer(z.DRAW_FRAMEBUFFER,z.COLOR_ATTACHMENT0,J.get(k).__webglTexture,wt,ke+Kn)),z.blitFramebuffer(Nt,ie,At,bt,Rt,ye,At,bt,z.DEPTH_BUFFER_BIT,z.NEAREST);E.bindFramebuffer(z.READ_FRAMEBUFFER,null),E.bindFramebuffer(z.DRAW_FRAMEBUFFER,null)}else if(Y!==0||A.isRenderTargetTexture||J.has(A)){let ze=J.get(A),cn=J.get(k);E.bindFramebuffer(z.READ_FRAMEBUFFER,I),E.bindFramebuffer(z.DRAW_FRAMEBUFFER,U);for(let Ae=0;Ae<Ct;Ae++)Qn?z.framebufferTextureLayer(z.READ_FRAMEBUFFER,z.COLOR_ATTACHMENT0,ze.__webglTexture,Y,ae+Ae):z.framebufferTexture2D(z.READ_FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_2D,ze.__webglTexture,Y),_e?z.framebufferTextureLayer(z.DRAW_FRAMEBUFFER,z.COLOR_ATTACHMENT0,cn.__webglTexture,wt,ke+Ae):z.framebufferTexture2D(z.DRAW_FRAMEBUFFER,z.COLOR_ATTACHMENT0,z.TEXTURE_2D,cn.__webglTexture,wt),Y!==0?z.blitFramebuffer(Nt,ie,At,bt,Rt,ye,At,bt,z.COLOR_BUFFER_BIT,z.NEAREST):_e?z.copyTexSubImage3D(Tt,wt,Rt,ye,ke+Ae,Nt,ie,At,bt):z.copyTexSubImage2D(Tt,wt,Rt,ye,Nt,ie,At,bt);E.bindFramebuffer(z.READ_FRAMEBUFFER,null),E.bindFramebuffer(z.DRAW_FRAMEBUFFER,null)}else _e?A.isDataTexture||A.isData3DTexture?z.texSubImage3D(Tt,wt,Rt,ye,ke,At,bt,Ct,be,Ke,Ie.data):k.isCompressedArrayTexture?z.compressedTexSubImage3D(Tt,wt,Rt,ye,ke,At,bt,Ct,be,Ie.data):z.texSubImage3D(Tt,wt,Rt,ye,ke,At,bt,Ct,be,Ke,Ie):A.isDataTexture?z.texSubImage2D(z.TEXTURE_2D,wt,Rt,ye,At,bt,be,Ke,Ie.data):A.isCompressedTexture?z.compressedTexSubImage2D(z.TEXTURE_2D,wt,Rt,ye,Ie.width,Ie.height,be,Ie.data):z.texSubImage2D(z.TEXTURE_2D,wt,Rt,ye,At,bt,be,Ke,Ie);E.pixelStorei(z.UNPACK_ROW_LENGTH,ii),E.pixelStorei(z.UNPACK_IMAGE_HEIGHT,de),E.pixelStorei(z.UNPACK_SKIP_PIXELS,xi),E.pixelStorei(z.UNPACK_SKIP_ROWS,zi),E.pixelStorei(z.UNPACK_SKIP_IMAGES,ln),wt===0&&k.generateMipmaps&&z.generateMipmap(Tt),E.unbindTexture()},this.initRenderTarget=function(A){J.get(A).__webglFramebuffer===void 0&&tt.setupRenderTarget(A)},this.initTexture=function(A){A.isCubeTexture?tt.setTextureCube(A,0):A.isData3DTexture?tt.setTexture3D(A,0):A.isDataArrayTexture||A.isCompressedArrayTexture?tt.setTexture2DArray(A,0):tt.setTexture2D(A,0),E.unbindTexture()},this.resetState=function(){B=0,G=0,Q=null,E.reset(),Et.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Ri}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=le._getDrawingBufferColorSpace(t),e.unpackColorSpace=le._getUnpackColorSpace()}};var Rn={compact:{id:"compact",name:"\u0423\u0449\u0435\u043B\u044C\u0435 0.8 \xD7 0.8 \u043A\u043C",shortLabel:"0.8 \xD7 0.8 \u043A\u043C",areaKm2:.59,size:768,horizScale:1,elevScale:1,flowScale:1,powerScale:1,snowLineY:58,minZoom:22,maxZoom:720,defaultDist:235,brushSizes:[6,9.5,16,25],desc:"\u0414\u0435\u0442\u0430\u043B\u044C\u043D\u044B\u0439 \u0438\u043D\u0436\u0435\u043D\u0435\u0440\u043D\u044B\u0439 \u0441\u0442\u0432\u043E\u0440 1:1 \u0434\u043B\u044F \u0442\u043E\u0447\u043D\u043E\u0439 \u043F\u0440\u043E\u0440\u0430\u0431\u043E\u0442\u043A\u0438 \u0443\u0437\u043B\u043E\u0432 \u0413\u042D\u0421 \u0438 \u043A\u0430\u043D\u0430\u043B\u043E\u0432."},km5:{id:"km5",name:"\u0411\u0430\u0441\u0441\u0435\u0439\u043D 5 \xD7 5 \u043A\u043C",shortLabel:"5 \xD7 5 \u043A\u043C (25 \u043A\u043C\xB2)",areaKm2:25,size:5e3,horizScale:6.510416666666667,elevScale:2.35,flowScale:6.2,powerScale:6.5,snowLineY:122,minZoom:48,maxZoom:4600,defaultDist:1180,brushSizes:[36,62,104,165],desc:"\u0420\u0435\u0433\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0439 \u0440\u0435\u0447\u043D\u043E\u0439 \u0431\u0430\u0441\u0441\u0435\u0439\u043D 25 \u043A\u043C\xB2 \u0441\u043E \u0441\u043D\u0435\u0436\u043D\u044B\u043C\u0438 \u043F\u0438\u043A\u0430\u043C\u0438, \u0441\u0443\u0434\u043E\u0445\u043E\u0434\u0441\u0442\u0432\u043E\u043C \u0438 8 \u0433\u043E\u0440\u043E\u0434\u0430\u043C\u0438."},km10:{id:"km10",name:"\u041C\u0435\u0433\u0430-\u043A\u0430\u0441\u043A\u0430\u0434 10 \xD7 10 \u043A\u043C",shortLabel:"10 \xD7 10 \u043A\u043C (100 \u043A\u043C\xB2)",areaKm2:100,size:1e4,horizScale:13.020833333333334,elevScale:3.35,flowScale:13.5,powerScale:15,snowLineY:176,minZoom:75,maxZoom:9200,defaultDist:2250,brushSizes:[72,124,208,330],desc:"\u0413\u0438\u0433\u0430\u043D\u0442\u0441\u043A\u0438\u0439 \u0441\u0438\u0431\u0438\u0440\u0441\u043A\u0438\u0439 \u043A\u0430\u0441\u043A\u0430\u0434 100 \u043A\u043C\xB2 \u043C\u0430\u0441\u0448\u0442\u0430\u0431\u0430 \u0410\u043D\u0433\u0430\u0440\u044B \u0438 \u0415\u043D\u0438\u0441\u0435\u044F \u0441 \u043B\u0435\u0434\u043D\u0438\u043A\u0430\u043C\u0438 \u0438 \u043C\u0435\u0433\u0430-\u0413\u042D\u0421."}},L={scaleId:"km5",size:5e3,horizScale:5e3/768,elevScale:2.35,flowScale:6.2,powerScale:6.5,snowLineY:122,minZoom:48,maxZoom:4600,defaultDist:1180,brushSizes:[36,62,104,165],gravity:9.81,waterDensity:1e3,dayLengthSec:185},Ee={pourRateM3PerSec:480,cofferdamInstantRatio:.62,rockAggregateDiscount:.38,highDamHeadThreshold:10.5,maxUnreinforcedHead:17.5,substationCost:6800,navLockCost:11500,fishEcoCost:7200,baseGridLossNoSub:.16,gridLossWithSub:.03,damHeightTiers:[{id:"low",label:"\u042F\u0440\u0443\u0441 +6\u043C",baseAddHeight:6.2,addHeight:14.5},{id:"mid",label:"\u042F\u0440\u0443\u0441 +11\u043C",baseAddHeight:11.2,addHeight:26.3},{id:"high",label:"\u042F\u0440\u0443\u0441 +17\u043C",baseAddHeight:17,addHeight:40}]},Ng=[{id:"posad",name:"\u0420\u0435\u0447\u043D\u043E\u0439 \u041F\u043E\u0441\u0430\u0434",subtitle:"\u041B\u0435\u0441\u043E\u043F\u0435\u0440\u0435\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u0438 \u043F\u0440\u0438\u0440\u0435\u0447\u043D\u0430\u044F \u0441\u043B\u043E\u0431\u043E\u0434\u0430",baseX:-158,baseZ:224,baseRadius:52,baseElev:17.5,startPop:640,baseDemandMW:.38,demandPerBuilding:.075,tariffBonus:1,connectedAtStart:!0,accent:6333946,archetype:"town"},{id:"agro",name:"\u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u0430",subtitle:"\u041E\u0440\u043E\u0448\u0430\u0435\u043C\u044B\u0435 \u043F\u043E\u043B\u044F, \u044D\u043B\u0435\u0432\u0430\u0442\u043E\u0440\u044B \u0438 \u0442\u0435\u043F\u043B\u0438\u0446\u044B",baseX:222,baseZ:112,baseRadius:58,baseElev:18.2,startPop:820,baseDemandMW:.52,demandPerBuilding:.085,tariffBonus:1.12,needsIrrigation:!0,baseIrrTarget:{x:168,z:98,radius:38},connectedAtStart:!1,accent:3462041,archetype:"agro"},{id:"sever",name:"\u0421\u0435\u0432\u0435\u0440\u043E\u0431\u043E\u0440\u0441\u043A",subtitle:"\u0413\u0438\u0434\u0440\u043E\u043C\u0435\u0442\u0435\u043E\u0446\u0435\u043D\u0442\u0440 \u0420\u043E\u0441\u0433\u0438\u0434\u0440\u043E\u043C\u0435\u0442\u0430 \u0438 \u0412\u042D\u0421",baseX:-214,baseZ:-218,baseRadius:48,baseElev:35,startPop:590,baseDemandMW:.45,demandPerBuilding:.09,tariffBonus:1.15,connectedAtStart:!1,accent:3003583,archetype:"science"},{id:"kamen",name:"\u041A\u0430\u043C\u0435\u043D\u043D\u043E\u0433\u043E\u0440\u0441\u043A",subtitle:"\u0413\u043E\u0440\u043D\u043E-\u043E\u0431\u043E\u0433\u0430\u0442\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u0438 \u043C\u0430\u0448\u0438\u043D\u043E\u0441\u0442\u0440\u043E\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u0443\u0437\u0435\u043B",baseX:208,baseZ:-182,baseRadius:54,baseElev:34,startPop:1120,baseDemandMW:.92,demandPerBuilding:.145,tariffBonus:1.24,connectedAtStart:!1,accent:16498468,archetype:"industrial"},{id:"svetlograd",name:"\u0421\u0432\u0435\u0442\u043B\u043E\u0433\u0440\u0430\u0434",subtitle:"\u041C\u0435\u0433\u0430\u043F\u043E\u043B\u0438\u0441 \u0434\u043E\u043B\u0438\u043D\u044B, \u043D\u0435\u0431\u043E\u0441\u043A\u0440\u0451\u0431\u044B \u0438 \u0413\u043E\u0440\u0432\u043E\u0434\u043E\u043A\u0430\u043D\u0430\u043B",baseX:-222,baseZ:-16,baseRadius:66,baseElev:24.8,startPop:2150,baseDemandMW:1.38,demandPerBuilding:.19,tariffBonus:1.22,connectedAtStart:!1,accent:10980346,archetype:"metropolis"},{id:"alumingrad",name:"\u0410\u043B\u044E\u043C\u0438\u043D\u0433\u0440\u0430\u0434",subtitle:"\u042D\u043D\u0435\u0440\u0433\u043E\u0451\u043C\u043A\u0438\u0439 \u0430\u043B\u044E\u043C\u0438\u043D\u0438\u0435\u0432\u044B\u0439 \u044D\u043B\u0435\u043A\u0442\u0440\u043E\u043B\u0438\u0437\u043D\u044B\u0439 \u0437\u0430\u0432\u043E\u0434",baseX:246,baseZ:-38,baseRadius:52,baseElev:26.2,startPop:1340,baseDemandMW:1.65,demandPerBuilding:.22,tariffBonus:1.38,specialContract:"smelter",connectedAtStart:!1,accent:16347926,archetype:"smelter"},{id:"kremniy",name:"\u041A\u0440\u0435\u043C\u043D\u0438\u0435\u0432\u044B\u0439 \u041F\u043B\u0451\u0441",subtitle:"\u0413\u0438\u043F\u0435\u0440\u0441\u043A\u0435\u0439\u043B \u0426\u041E\u0414 \u0418\u0418 \u0438 \u043A\u0432\u0430\u043D\u0442\u043E\u0432\u044B\u0439 \u043A\u0430\u043C\u043F\u0443\u0441",baseX:-124,baseZ:-112,baseRadius:44,baseElev:29.4,startPop:780,baseDemandMW:1.25,demandPerBuilding:.2,tariffBonus:1.44,specialContract:"datacenter",connectedAtStart:!1,accent:3718648,archetype:"datacenter"},{id:"ustport",name:"\u0423\u0441\u0442\u044C-\u041F\u043E\u0440\u0442",subtitle:"\u0420\u0435\u0447\u043D\u043E\u0435 \u043F\u0430\u0440\u043E\u0445\u043E\u0434\u0441\u0442\u0432\u043E, \u0441\u0443\u0434\u043E\u0432\u0435\u0440\u0444\u044C \u0438 \u043C\u0430\u0440\u0438\u043D\u0430",baseX:118,baseZ:274,baseRadius:54,baseElev:12.6,startPop:980,baseDemandMW:.68,demandPerBuilding:.11,tariffBonus:1.18,specialContract:"port",connectedAtStart:!1,accent:440020,archetype:"port"}],oi=[],Sc=[{id:0,name:"\u0414\u0435\u0440\u0435\u0432\u044F\u043D\u043D\u044B\u0439 \u043A\u043E\u0442\u0442\u0435\u0434\u0436",cat:"res",shape:"gable",hMin:4.5,hMax:7,w:6.2,d:6.8,style:0},{id:1,name:"\u041A\u0438\u0440\u043F\u0438\u0447\u043D\u044B\u0439 \u0434\u0443\u043F\u043B\u0435\u043A\u0441",cat:"res",shape:"gable",hMin:6,hMax:8.8,w:7.5,d:8.2,style:1},{id:2,name:"\u0410\u043B\u044C\u043F\u0438\u0439\u0441\u043A\u043E\u0435 \u0448\u0430\u043B\u0435",cat:"res",shape:"gable",hMin:5.5,hMax:8.2,w:7.8,d:7.4,style:2},{id:3,name:"\u0422\u0430\u0443\u043D\u0445\u0430\u0443\u0441 \u0441 \u0442\u0435\u0440\u0440\u0430\u0441\u043E\u0439",cat:"res",shape:"flat",hMin:7.5,hMax:10.5,w:11,d:7,style:3},{id:4,name:"\u041A\u043B\u0430\u0441\u0441\u0438\u0447\u0435\u0441\u043A\u0430\u044F 5-\u044D\u0442\u0430\u0436\u043A\u0430",cat:"mid",shape:"gable",hMin:14,hMax:17.5,w:15,d:9.2,style:4},{id:5,name:"\u041F\u0430\u043D\u0435\u043B\u044C\u043D\u044B\u0439 9-\u044D\u0442\u0430\u0436\u043D\u044B\u0439 \u0434\u043E\u043C",cat:"mid",shape:"flat",hMin:24,hMax:29,w:17.5,d:10.2,style:5},{id:6,name:"\u041C\u043E\u043D\u043E\u043B\u0438\u0442\u043D\u044B\u0439 \u0416\u041A 16 \u044D\u0442\u0430\u0436\u0435\u0439",cat:"high",shape:"step",hMin:38,hMax:48,w:13.5,d:13.5,style:6},{id:7,name:"\u0421\u0442\u0435\u043A\u043B\u044F\u043D\u043D\u0430\u044F \u0431\u0438\u0437\u043D\u0435\u0441-\u0431\u0430\u0448\u043D\u044F",cat:"high",shape:"tower",hMin:52,hMax:72,w:14.5,d:14.5,style:7},{id:8,name:"\u041D\u0435\u0431\u043E\u0441\u043A\u0440\u0451\u0431 \u0441\u043E \u0448\u043F\u0438\u043B\u0435\u043C",cat:"high",shape:"spire",hMin:68,hMax:96,w:15.5,d:15.5,style:8},{id:9,name:"\u041E\u0431\u0449\u0435\u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u0448\u043A\u043E\u043B\u0430",cat:"civ",shape:"flat",hMin:11.5,hMax:14.5,w:18,d:12.5,style:9},{id:10,name:"\u041A\u043B\u0438\u043D\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u0431\u043E\u043B\u044C\u043D\u0438\u0446\u0430",cat:"civ",shape:"step",hMin:18,hMax:24,w:17,d:13,style:10},{id:11,name:"\u0413\u043E\u0440\u043E\u0434\u0441\u043A\u0430\u044F \u0440\u0430\u0442\u0443\u0448\u0430 \u0441 \u0431\u0430\u0448\u043D\u0435\u0439",cat:"civ",shape:"spire",hMin:22,hMax:30,w:14,d:12,style:11},{id:12,name:"\u0410\u0440\u043E\u0447\u043D\u044B\u0439 \u0442\u0435\u043F\u043B\u0438\u0447\u043D\u044B\u0439 \u0431\u043B\u043E\u043A",cat:"agro",shape:"arch",hMin:4.2,hMax:5.8,w:16.5,d:9.5,style:12},{id:13,name:"\u0417\u0435\u0440\u043D\u043E\u0432\u043E\u0439 \u044D\u043B\u0435\u0432\u0430\u0442\u043E\u0440 (\u0441\u0438\u043B\u043E\u0441)",cat:"agro",shape:"cyl",hMin:18,hMax:26,w:9.5,d:9.5,style:13},{id:14,name:"\u0410\u0433\u0440\u043E\u0444\u0435\u0440\u043C\u0430 \u0438 \u0430\u043C\u0431\u0430\u0440",cat:"agro",shape:"gable",hMin:6.8,hMax:9.2,w:14.5,d:9.8,style:14},{id:15,name:"\u041B\u0435\u0441\u043E\u043F\u0438\u043B\u044C\u043D\u044B\u0439 \u043A\u043E\u043C\u0431\u0438\u043D\u0430\u0442",cat:"ind",shape:"gable",hMin:7.5,hMax:10.5,w:16,d:11,style:15},{id:16,name:"\u041C\u0430\u0448\u0438\u043D\u043E\u0441\u0442\u0440\u043E\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u0446\u0435\u0445",cat:"ind",shape:"flat",hMin:10.5,hMax:14.5,w:19,d:13.5,style:16},{id:17,name:"\u041A\u043E\u0440\u043F\u0443\u0441 \u044D\u043B\u0435\u043A\u0442\u0440\u043E\u043B\u0438\u0437\u0430 Al",cat:"smlt",shape:"flat",hMin:11.5,hMax:15,w:24,d:11.5,style:17},{id:18,name:"\u041B\u0438\u0442\u0435\u0439\u043D\u043E-\u043F\u0440\u043E\u043A\u0430\u0442\u043D\u044B\u0439 \u0446\u0435\u0445",cat:"smlt",shape:"step",hMin:15,hMax:21,w:18.5,d:14,style:18},{id:19,name:"\u0413\u0438\u043F\u0435\u0440\u0431\u043E\u043B\u043E\u0438\u0434\u043D\u0430\u044F \u0433\u0440\u0430\u0434\u0438\u0440\u043D\u044F",cat:"ind",shape:"cool",hMin:24,hMax:34,w:13.5,d:13.5,style:19},{id:20,name:"\u041C\u043E\u0434\u0443\u043B\u044C \u0426\u041E\u0414 \u0418\u0418 (\u0421\u0435\u0440\u0432\u0435\u0440\u043D\u0430\u044F)",cat:"dc",shape:"flat",hMin:10,hMax:13.5,w:20,d:14,style:20},{id:21,name:"\u041A\u0432\u0430\u043D\u0442\u043E\u0432\u044B\u0439 \u043B\u0430\u0431-\u043A\u043E\u0440\u043F\u0443\u0441",cat:"dc",shape:"tower",hMin:24,hMax:36,w:13,d:13,style:21},{id:22,name:"\u041F\u043E\u0440\u0442\u043E\u0432\u044B\u0439 \u0442\u0435\u0440\u043C\u0438\u043D\u0430\u043B-\u0441\u043A\u043B\u0430\u0434",cat:"port",shape:"arch",hMin:8.5,hMax:11.5,w:21,d:11.5,style:22},{id:23,name:"\u041A\u0443\u0440\u043E\u0440\u0442\u043D\u044B\u0439 \u0433\u0440\u0430\u043D\u0434-\u043E\u0442\u0435\u043B\u044C",cat:"port",shape:"step",hMin:22,hMax:34,w:16,d:11.5,style:23},{id:24,name:"\u041F\u0430\u0432\u0438\u043B\u044C\u043E\u043D \u044F\u0445\u0442-\u043A\u043B\u0443\u0431\u0430",cat:"port",shape:"gable",hMin:6.5,hMax:9,w:12,d:10,style:24},{id:25,name:"\u0421\u0442\u0430\u043D\u0446\u0438\u044F \u0413\u043E\u0440\u0432\u043E\u0434\u043E\u043A\u0430\u043D\u0430\u043B\u0430",cat:"util",shape:"cyl",hMin:8.5,hMax:12,w:12.5,d:12.5,style:25},{id:26,name:"\u041D\u0430\u0441\u043E\u0441\u043D\u0430\u044F \u0441\u0442\u0430\u043D\u0446\u0438\u044F \u043E\u0440\u043E\u0448\u0435\u043D\u0438\u044F",cat:"agro",shape:"flat",hMin:6,hMax:8.5,w:10.5,d:9,style:26},{id:27,name:"\u041D\u0430\u0443\u0447\u043D\u044B\u0439 \u0446\u0435\u043D\u0442\u0440 \u0420\u043E\u0441\u0433\u0438\u0434\u0440\u043E\u043C\u0435\u0442\u0430",cat:"sci",shape:"spire",hMin:14,hMax:20,w:11.5,d:11.5,style:27},{id:28,name:"\u0422\u043E\u0440\u0433\u043E\u0432\u043E-\u0432\u044B\u0441\u0442\u0430\u0432\u043E\u0447\u043D\u044B\u0439 \u0445\u043E\u043B\u043B",cat:"mid",shape:"arch",hMin:10,hMax:14,w:18.5,d:15,style:28},{id:29,name:"\u041B\u043E\u0433\u0438\u0441\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0445\u0430\u0431",cat:"ind",shape:"flat",hMin:9,hMax:12,w:22,d:13,style:29},{id:30,name:"\u0421\u043F\u0430\u0441\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0435 \u0434\u0435\u043F\u043E \u041C\u0427\u0421",cat:"civ",shape:"flat",hMin:8.5,hMax:11.5,w:13.5,d:11,style:30},{id:31,name:"\u041D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u043E\u043D\u043D\u044B\u0439 \u043C\u0430\u044F\u043A \u043C\u044B\u0441\u0430",cat:"port",shape:"spire",hMin:20,hMax:28,w:6.8,d:6.8,style:31}],bi={bystritsa:{id:"bystritsa",name:"\u0411\u0430\u0441\u0441\u0435\u0439\u043D \xAB\u0411\u043E\u043B\u044C\u0448\u0430\u044F \u0411\u044B\u0441\u0442\u0440\u0438\u0446\u0430\xBB",badge:"\u0420\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0443\u0435\u0442\u0441\u044F \xB7 \u041F\u043E\u043B\u043D\u044B\u0439 \u0446\u0438\u043A\u043B",areaLabel:"3 \u0440\u0435\u043A\u0438 \xB7 8 \u0433\u043E\u0440\u043E\u0434\u043E\u0432 \xB7 \u041B\u0435\u0434\u043D\u0438\u043A\u0438",headLabel:"\u041A\u0430\u0441\u043A\u0430\u0434\u043D\u044B\u0439 \u043A\u0430\u043D\u044C\u043E\u043D + \u043F\u043E\u0439\u043C\u0430",baseMainQ:162,baseCreekQ:54,baseWestQ:36,mainInflowQ:162,creekInflowQ:54,westCreekQ:36,desc:"\u0413\u0440\u0430\u043D\u0438\u0442\u043D\u0430\u044F \u0442\u0435\u0441\u043D\u0438\u043D\u0430 \xAB\u0412\u043E\u0440\u043E\u0442\u0430 \u0413\u0440\u043E\u043C\u0430\xBB, \u0441\u043D\u0435\u0436\u043D\u044B\u0435 \u0432\u0435\u0440\u0448\u0438\u043D\u044B \u043F\u0438\u0442\u0430\u043D\u0438\u044F \u0440\u0435\u043A, \u0434\u0435\u0440\u0438\u0432\u0430\u0446\u0438\u043E\u043D\u043D\u043E\u0435 \u043F\u043B\u0430\u0442\u043E \xAB\u041F\u043E\u0434\u043A\u043E\u0432\u0430\xBB, \u0410\u043B\u044E\u043C\u0438\u043D\u0438\u0435\u0432\u044B\u0439 \u0437\u0430\u0432\u043E\u0434, \u0426\u041E\u0414 \u0418\u0418 \u0438 \u0441\u0443\u0434\u043E\u0445\u043E\u0434\u043D\u043E\u0435 \u0443\u0441\u0442\u044C\u0435.",baseLandmarks:[{label:"\u25B2 \u0421\u0442\u0432\u043E\u0440 \xAB\u0412\u043E\u0440\u043E\u0442\u0430 \u0413\u0440\u043E\u043C\u0430\xBB",x:12,z:-158,dist:142},{label:"\u25C6 \u0414\u0435\u0440\u0438\u0432\u0430\u0446\u0438\u043E\u043D\u043D\u043E\u0435 \u043F\u043B\u0430\u0442\u043E",x:-18,z:-12,dist:185},{label:"\u25C9 \u041E\u0440\u043E\u0448\u0435\u043D\u0438\u0435 \u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u044B",x:168,z:98,dist:155},{label:"\u2693 \u0423\u0441\u0442\u044C-\u041F\u043E\u0440\u0442 \u0438 \u0414\u0435\u043B\u044C\u0442\u0430",x:48,z:278,dist:195}],landmarks:[]},rapids:{id:"rapids",name:"\u041A\u0430\u0441\u043A\u0430\u0434 \xAB\u0421\u0435\u0432\u0435\u0440\u043D\u044B\u0435 \u041F\u043E\u0440\u043E\u0433\u0438\xBB",badge:"\u0421\u0432\u0435\u0440\u0445\u043D\u0430\u043F\u043E\u0440 \xB7 \u0413\u0410\u042D\u0421 \u0438 \u0424\u0440\u044D\u043D\u0441\u0438\u0441",areaLabel:"\u0414\u0432\u043E\u0439\u043D\u043E\u0439 \u043A\u0430\u043D\u044C\u043E\u043D \xB7 \u0421\u043D\u0435\u0436\u043D\u044B\u0435 \u0445\u0440\u0435\u0431\u0442\u044B",headLabel:"\u041C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u044B\u0439 \u043D\u0430\u043F\u043E\u0440",baseMainQ:176,baseCreekQ:66,baseWestQ:44,mainInflowQ:176,creekInflowQ:66,westCreekQ:44,desc:"\u0414\u0432\u0430 \u0433\u043B\u0443\u0431\u043E\u043A\u0438\u0445 \u0441\u043A\u0430\u043B\u044C\u043D\u044B\u0445 \u0443\u0449\u0435\u043B\u044C\u044F \u043F\u043E\u0434\u0440\u044F\u0434 \u0441 \u0432\u044B\u0441\u043E\u043A\u0438\u043C \u043F\u0435\u0440\u0435\u043F\u0430\u0434\u043E\u043C \u0432\u044B\u0441\u043E\u0442 \u0438 \u043E\u0431\u0438\u043B\u044C\u043D\u044B\u043C \u043B\u0435\u0434\u043D\u0438\u043A\u043E\u0432\u044B\u043C \u0442\u0430\u044F\u043D\u0438\u0435\u043C \u0434\u043D\u0451\u043C. \u0418\u0434\u0435\u0430\u043B\u044C\u043D\u0430 \u0434\u043B\u044F \u043A\u0430\u0441\u043A\u0430\u0434\u0430 \u0413\u042D\u0421 \u0438 \u0413\u0410\u042D\u0421.",baseLandmarks:[{label:"\u25B2 \u0412\u0435\u0440\u0445\u043D\u0438\u0439 \u043A\u0430\u043D\u044C\u043E\u043D \u21161",x:-18,z:-248,dist:145},{label:"\u25B2 \u041D\u0438\u0436\u043D\u0438\u0435 \u041F\u043E\u0440\u043E\u0433\u0438 \u21162",x:22,z:-98,dist:148},{label:"\u25C6 \u041F\u0440\u043E\u043C\u0437\u043E\u043D\u0430 \u0410\u043B\u044E\u043C\u0438\u043D\u0433\u0440\u0430\u0434\u0430",x:246,z:-38,dist:175},{label:"\u25C9 \u0422\u0435\u0440\u0440\u0430\u0441\u0430 \u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u044B",x:168,z:98,dist:155}],landmarks:[]},delta:{id:"delta",name:"\u041F\u043E\u0439\u043C\u0430 \xAB\u0412\u0435\u043B\u0438\u043A\u0430\u044F \u0414\u0435\u043B\u044C\u0442\u0430\xBB",badge:"\u0421\u0443\u0434\u043E\u0445\u043E\u0434\u0441\u0442\u0432\u043E, \u0448\u043B\u044E\u0437\u044B \u0438 \u043F\u0430\u0432\u043E\u0434\u043A\u0438",areaLabel:"\u0428\u0438\u0440\u043E\u043A\u0430\u044F \u0440\u0435\u043A\u0430 \xB7 \u041C\u044F\u0433\u043A\u0438\u0435 \u0433\u0440\u0443\u043D\u0442\u044B",headLabel:"\u0411\u043E\u043B\u044C\u0448\u043E\u0439 \u0440\u0430\u0441\u0445\u043E\u0434 Q \u0438 \u0444\u043B\u043E\u0442",baseMainQ:205,baseCreekQ:62,baseWestQ:50,mainInflowQ:205,creekInflowQ:62,westCreekQ:50,desc:"\u041C\u043E\u0433\u0443\u0447\u0430\u044F \u0441\u0443\u0434\u043E\u0445\u043E\u0434\u043D\u0430\u044F \u0440\u0435\u043A\u0430 \u0432 \u0448\u0438\u0440\u043E\u043A\u043E\u0439 \u043F\u043E\u0439\u043C\u0435: \u0438\u043D\u0442\u0435\u043D\u0441\u0438\u0432\u043D\u043E\u0435 \u0438\u0441\u043F\u0430\u0440\u0435\u043D\u0438\u0435 \u0441 \u0437\u0435\u0440\u043A\u0430\u043B\u0430, \u0444\u0438\u043B\u044C\u0442\u0440\u0430\u0446\u0438\u044F \u043F\u043E\u0434 \u043F\u043B\u043E\u0442\u0438\u043D\u0430\u043C\u0438, \u043A\u0430\u0440\u0430\u0432\u0430\u043D\u044B \u0431\u0430\u0440\u0436, \u043F\u043E\u0440\u0442\u044B \u0438 \u0440\u044B\u0431\u0445\u043E\u0437\u044B.",baseLandmarks:[{label:"\u25B2 \u0413\u043B\u0430\u0432\u043D\u044B\u0439 \u0441\u0442\u0432\u043E\u0440 \u0438 \u0428\u043B\u044E\u0437",x:8,z:-152,dist:162},{label:"\u25C6 \u0422\u0440\u0430\u0441\u0441\u0430 \u0441\u043F\u0440\u044F\u043C\u043B\u0435\u043D\u0438\u044F",x:-16,z:-6,dist:190},{label:"\u25C9 \u041F\u043E\u043B\u044F \u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u044B",x:168,z:98,dist:155},{label:"\u2693 \u0428\u0438\u0440\u043E\u043A\u0430\u044F \u0434\u0435\u043B\u044C\u0442\u0430",x:-12,z:268,dist:205}],landmarks:[]}},Ca={low:{id:"low",label:"\u0411\u044B\u0441\u0442\u0440\u043E\u0435",grid:168,maxPixelRatio:1.15,shadows:!1,shadowEvery:0,maxParticles:1400,treeCount:950,rockCount:320,substepsCap:6},medium:{id:"medium",label:"\u0421\u0431\u0430\u043B\u0430\u043D\u0441\u0438\u0440.",grid:208,maxPixelRatio:1.6,shadows:!0,shadowEvery:3,maxParticles:3e3,treeCount:1950,rockCount:560,substepsCap:8},high:{id:"high",label:"\u0423\u043B\u044C\u0442\u0440\u0430",grid:248,maxPixelRatio:2,shadows:!0,shadowEvery:2,maxParticles:5200,treeCount:3100,rockCount:840,substepsCap:10}},$e={low_water:{id:"low_water",label:"\u0416\u0430\u0440\u043A\u0430\u044F \u043C\u0435\u0436\u0435\u043D\u044C",icon:"\u2600",inflowMult:.76,rainRate:0,rainMmPerHour:0,baseTempC:25.5,relHumidity:.36,windSpeedMs:3.4,sunIntensity:1.18,fogDensity:38e-5,next:{low_water:.25,normal:.55,rain:.2}},normal:{id:"normal",label:"\u041D\u043E\u0440\u043C\u0430\u043B\u044C\u043D\u044B\u0439 \u0441\u0442\u043E\u043A",icon:"\u25C8",inflowMult:1,rainRate:0,rainMmPerHour:0,baseTempC:17.5,relHumidity:.56,windSpeedMs:4.6,sunIntensity:1.05,fogDensity:48e-5,next:{low_water:.22,normal:.43,rain:.27,flood:.08}},rain:{id:"rain",label:"\u0426\u0438\u043A\u043B\u043E\u043D \u0438 \u043B\u0438\u0432\u0435\u043D\u044C",icon:"\u2248",inflowMult:1.48,rainRate:16e-5,rainMmPerHour:14.5,baseTempC:12,relHumidity:.88,windSpeedMs:7.8,sunIntensity:.58,fogDensity:76e-5,next:{normal:.45,rain:.3,flood:.25}},flood:{id:"flood",label:"\u0412\u0435\u0441\u0435\u043D\u043D\u0435\u0435 \u043F\u043E\u043B\u043E\u0432\u043E\u0434\u044C\u0435",icon:"\u25C8",inflowMult:2.22,rainRate:32e-5,rainMmPerHour:29,baseTempC:15,relHumidity:.82,windSpeedMs:10.5,sunIntensity:.46,fogDensity:95e-5,next:{rain:.55,normal:.45}}},Mr=[{id:"inspect",key:"1",name:"\u0413\u0438\u0434\u0440\u043E\u043F\u043E\u0441\u0442 / \u0418\u043D\u0441\u043F\u0435\u043A\u0446\u0438\u044F \u0413\u042D\u0421",short:"\u041E\u0441\u043C\u043E\u0442\u0440",costLabel:"\u0431\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u043E",desc:"\u0417\u0430\u043C\u0435\u0440 \u0433\u043B\u0443\u0431\u0438\u043D\u044B, \u0447\u0438\u0441\u043B\u0430 \u0424\u0440\u0443\u0434\u0430, \u0444\u0438\u043B\u044C\u0442\u0440\u0430\u0446\u0438\u0438, \u041A\u041F\u0414 \u0442\u0443\u0440\u0431\u0438\u043D, \u0432\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0435 \u043D\u043E\u0447\u043D\u043E\u0439 \u0437\u0430\u043A\u0430\u0447\u043A\u0438 \u0413\u0410\u042D\u0421 \u0438 \u0443\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u0437\u0430\u0442\u0432\u043E\u0440\u0430\u043C\u0438."},{id:"canal_dig",key:"2",name:"\u042D\u043A\u0441\u043A\u0430\u0432\u0430\u0442\u043E\u0440 \u0434\u0435\u0440\u0438\u0432\u0430\u0446\u0438\u043E\u043D\u043D\u043E\u0433\u043E \u043A\u0430\u043D\u0430\u043B\u0430",short:"\u041A\u043E\u043F\u0430\u0442\u044C \u043A\u0430\u043D\u0430\u043B",costPerM3Soil:3.4,costPerM3Rock:14.5,costLabel:"\u0433\u0440\u0443\u043D\u0442 + \u0449\u0435\u0431\u0435\u043D\u044C",desc:"\u041F\u0440\u043E\u043A\u043B\u0430\u0434\u043A\u0430 \u0441\u0443\u0434\u043E\u0445\u043E\u0434\u043D\u044B\u0445, \u0434\u0435\u0440\u0438\u0432\u0430\u0446\u0438\u043E\u043D\u043D\u044B\u0445 \u0438 \u043E\u0440\u043E\u0441\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0445 \u043A\u0430\u043D\u0430\u043B\u043E\u0432 (\u0434\u0430\u0451\u0442 \u0449\u0435\u0431\u0435\u043D\u044C \u043D\u0430 \u044D\u043A\u0441\u043F\u043E\u0440\u0442 \u0438 \u0441\u043A\u0438\u0434\u043A\u0443 -38% \u043D\u0430 \u0431\u0435\u0442\u043E\u043D!). Shift \u2014 \u0440\u043E\u0432\u043D\u044B\u0439 \u0443\u043A\u043B\u043E\u043D."},{id:"canal_liner",key:"3",name:"\u0416/\u0411 \u043E\u0431\u043B\u0438\u0446\u043E\u0432\u043A\u0430 \u0438 \u043F\u0430\u0440\u0430\u043F\u0435\u0442\u044B \u043A\u0430\u043D\u0430\u043B\u0430",short:"\u0416/\u0411 \u043B\u043E\u0442\u043E\u043A",costPerCell:58,costLabel:"58 \u20BD/\u0441\u0435\u043A\u0446\u0438\u044F",desc:"\u0423\u043A\u043B\u0430\u0434\u043A\u0430 \u0433\u0438\u0434\u0440\u043E\u0442\u0435\u0445\u043D\u0438\u0447\u0435\u0441\u043A\u043E\u0433\u043E \u0431\u0435\u0442\u043E\u043D\u0430 \u041240 (n = 0.012): \u043D\u0443\u043B\u0435\u0432\u0430\u044F \u0438\u043D\u0444\u0438\u043B\u044C\u0442\u0440\u0430\u0446\u0438\u044F \u0432 \u0433\u0440\u0443\u043D\u0442 \u0438 \u0440\u0430\u0437\u0433\u043E\u043D \u043F\u043E\u0442\u043E\u043A\u0430 \u0432 2.5 \u0440\u0430\u0437\u0430!"},{id:"earth_dam",key:"4",name:"\u0413\u0440\u0443\u043D\u0442\u043E\u0432\u0430\u044F \u043F\u043B\u043E\u0442\u0438\u043D\u0430 / \u041F\u0435\u0440\u0435\u043C\u044B\u0447\u043A\u0430",short:"\u041F\u0435\u0440\u0435\u043C\u044B\u0447\u043A\u0430",costPerM3:5.2,costLabel:"-70% \u0438\u0437 \u043E\u0442\u0432\u0430\u043B\u0430",desc:"\u041D\u0430\u0441\u044B\u043F\u043D\u0430\u044F \u0434\u0430\u043C\u0431\u0430 \u0438\u0437 \u0441\u0443\u0433\u043B\u0438\u043D\u043A\u0430 \u0438 \u043A\u0430\u043C\u043D\u044F \u0434\u043B\u044F \u043E\u0442\u0436\u0438\u043C\u0430 \u0440\u0435\u043A\u0438 \u0438\u043B\u0438 \u043E\u0431\u0432\u0430\u043B\u043E\u0432\u0430\u043D\u0438\u044F \u0431\u0435\u0440\u0435\u0433\u043E\u0432. \u041F\u0440\u0438 \u043F\u0435\u0440\u0435\u043B\u0438\u0432\u0435 \u0447\u0435\u0440\u0435\u0437 \u0433\u0440\u0435\u0431\u0435\u043D\u044C \u0440\u0430\u0437\u043C\u044B\u0432\u0430\u0435\u0442\u0441\u044F!"},{id:"concrete_dam",key:"5",name:"\u0413\u0440\u0430\u0432\u0438\u0442\u0430\u0446\u0438\u043E\u043D\u043D\u0430\u044F 3D-\u043F\u043B\u043E\u0442\u0438\u043D\u0430",short:"3D \u041F\u043B\u043E\u0442\u0438\u043D\u0430",costPerM3:22,costLabel:"3 \u044D\u0442\u0430\u043F\u0430 + \u043A\u0440\u0430\u043D\u044B",desc:"\u0412\u043E\u0437\u0432\u043E\u0434\u0438\u0442\u0441\u044F \u043F\u043E\u044D\u0442\u0430\u043F\u043D\u043E \u0431\u0430\u0448\u0435\u043D\u043D\u044B\u043C\u0438 \u043A\u0440\u0430\u043D\u0430\u043C\u0438: \u0448\u043F\u0443\u043D\u0442 \u2192 \u0430\u0440\u043C\u043E\u043A\u0430\u0440\u043A\u0430\u0441 \u2192 \u043C\u043E\u043D\u043E\u043B\u0438\u0442! \u041F\u0440\u0438 \u043F\u0435\u0440\u0435\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u0438 \u0447\u0435\u0440\u0435\u0437 \u0433\u0440\u0435\u0431\u0435\u043D\u044C \u0438\u0434\u0451\u0442 3D-\u043F\u0435\u0440\u0435\u043B\u0438\u0432 \u0432\u043E\u0434\u044B."},{id:"foundation",key:"6",name:"\u0426\u0435\u043C\u0435\u043D\u0442\u0430\u0446\u0438\u043E\u043D\u043D\u0430\u044F \u0437\u0430\u0432\u0435\u0441\u0430 \u0438 \u041A\u043E\u043D\u0442\u0440\u0444\u043E\u0440\u0441\u044B",short:"\u041A\u043E\u043D\u0442\u0440\u0444\u043E\u0440\u0441",costPerCell:135,costLabel:"135 \u20BD/\u0431\u043B\u043E\u043A",desc:"\u0413\u043B\u0443\u0431\u0438\u043D\u043D\u0430\u044F \u0446\u0435\u043C\u0435\u043D\u0442\u0430\u0446\u0438\u044F \u0441\u043A\u0430\u043B\u044B \u0438 \u043D\u0430\u043A\u043B\u043E\u043D\u043D\u044B\u0435 3D-\u043A\u043E\u043D\u0442\u0440\u0444\u043E\u0440\u0441\u044B: \u043E\u0441\u0442\u0430\u043D\u0430\u0432\u043B\u0438\u0432\u0430\u0435\u0442 \u0444\u0438\u043B\u044C\u0442\u0440\u0430\u0446\u0438\u044E \u0414\u0430\u0440\u0441\u0438 \u043F\u043E\u0434 \u043F\u043B\u043E\u0442\u0438\u043D\u043E\u0439 \u0438 \u0434\u0435\u0440\u0436\u0438\u0442 \u0432\u044B\u0441\u043E\u043A\u0438\u0439 \u043D\u0430\u043F\u043E\u0440."},{id:"spillway",key:"7",name:"\u042D\u043A\u0441\u043F\u043B\u0443\u0430\u0442\u0430\u0446\u0438\u043E\u043D\u043D\u044B\u0439 \u0432\u043E\u0434\u043E\u0441\u0431\u0440\u043E\u0441",short:"\u0412\u043E\u0434\u043E\u0441\u0431\u0440\u043E\u0441",costFlat:4400,costLabel:"4 400 \u20BD",desc:"\u0421\u0435\u0433\u043C\u0435\u043D\u0442\u043D\u044B\u0439 \u0437\u0430\u0442\u0432\u043E\u0440 \u0441 3D-\u0432\u043E\u0434\u043E\u0441\u043B\u0438\u0432\u043D\u044B\u043C \u043B\u043E\u0442\u043A\u043E\u043C \u0438 \u043D\u043E\u0441\u043A\u043E\u043C-\u0442\u0440\u0430\u043C\u043F\u043B\u0438\u043D\u043E\u043C: \u0443\u043F\u0440\u0430\u0432\u043B\u044F\u0435\u043C\u044B\u0439 \u043F\u0440\u043E\u043F\u0443\u0441\u043A \u043F\u0430\u0432\u043E\u0434\u043A\u0430 \u0441 \u0430\u043D\u0438\u043C\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u043E\u0439 \u043F\u0435\u043B\u0435\u043D\u043E\u0439 \u0432\u043E\u0434\u044B."},{id:"turbine_kaplan",key:"8",name:"\u0420\u0443\u0441\u043B\u043E\u0432\u0430\u044F \u0413\u042D\u0421 \u041A\u0430\u043F\u043B\u0430\u043D\u0430 (\u041F\u041B)",short:"\u0413\u042D\u0421 \u041A\u0430\u043F\u043B\u0430\u043D",turbineType:"kaplan",costFlat:9500,costLabel:"9 500 \u20BD",desc:"\u041F\u043E\u0432\u043E\u0440\u043E\u0442\u043D\u043E-\u043B\u043E\u043F\u0430\u0441\u0442\u043D\u0430\u044F \u0442\u0443\u0440\u0431\u0438\u043D\u0430 \u0434\u043B\u044F \u043C\u0430\u043B\u044B\u0445 \u0438 \u0441\u0440\u0435\u0434\u043D\u0438\u0445 \u043D\u0430\u043F\u043E\u0440\u043E\u0432. \u041C\u0430\u0448\u0438\u043D\u043D\u044B\u0439 \u0437\u0430\u043B \u0441\u0442\u0440\u043E\u0433\u043E \u0443 \u043F\u043E\u0434\u043D\u043E\u0436\u0438\u044F \u043F\u043B\u043E\u0442\u0438\u043D\u044B \u0432 \u043D\u0438\u0436\u043D\u0435\u043C \u0431\u044C\u0435\u0444\u0435!"},{id:"turbine_francis",key:"9",name:"\u041F\u0440\u0438\u043F\u043B\u043E\u0442\u0438\u043D\u043D\u0430\u044F \u0413\u042D\u0421 \u0424\u0440\u044D\u043D\u0441\u0438\u0441\u0430 (\u0420\u041E)",short:"\u0413\u042D\u0421 \u0424\u0440\u044D\u043D\u0441\u0438\u0441",turbineType:"francis",costFlat:23500,costLabel:"23 500 \u20BD",desc:"\u0420\u0430\u0434\u0438\u0430\u043B\u044C\u043D\u043E-\u043E\u0441\u0435\u0432\u043E\u0439 \u0430\u0433\u0440\u0435\u0433\u0430\u0442 (\u041A\u041F\u0414 94%) \u0441\u043E \u0441\u0442\u0430\u043B\u044C\u043D\u044B\u043C\u0438 \u043D\u0430\u043F\u043E\u0440\u043D\u044B\u043C\u0438 \u0432\u043E\u0434\u043E\u0432\u043E\u0434\u0430\u043C\u0438, \u0430\u0432\u0430\u043D\u043A\u0430\u043C\u0435\u0440\u043E\u0439 \u0438 \u043E\u0441\u0442\u0435\u043A\u043B\u0451\u043D\u043D\u044B\u043C \u043C\u0430\u0448\u0437\u0430\u043B\u043E\u043C \u0432 \u043D\u0438\u0436\u043D\u0435\u043C \u0431\u044C\u0435\u0444\u0435."},{id:"turbine_pelton",key:"0",name:"\u0412\u044B\u0441\u043E\u043A\u043E\u043D\u0430\u043F\u043E\u0440\u043D\u0430\u044F \u0413\u042D\u0421 / \u0413\u0410\u042D\u0421",short:"\u0413\u042D\u0421 / \u0413\u0410\u042D\u0421",turbineType:"pelton",costFlat:32e3,costLabel:"32 000 \u20BD \xB7 \u0413\u0410\u042D\u0421",desc:"\u0412\u044B\u0441\u043E\u043A\u043E\u043D\u0430\u043F\u043E\u0440\u043D\u044B\u0439 \u0430\u0433\u0440\u0435\u0433\u0430\u0442 \u0441 \u0440\u0435\u0436\u0438\u043C\u043E\u043C \u043E\u0431\u0440\u0430\u0442\u0438\u043C\u043E\u0439 \u0413\u0410\u042D\u0421: \u043D\u043E\u0447\u044C\u044E \u043F\u043E \u0434\u0435\u0448\u0451\u0432\u043E\u043C\u0443 \u0442\u0430\u0440\u0438\u0444\u0443 \u0437\u0430\u043A\u0430\u0447\u0438\u0432\u0430\u0435\u0442 \u0432\u043E\u0434\u0443 \u043E\u0431\u0440\u0430\u0442\u043D\u043E \u0432 \u0432\u043E\u0434\u043E\u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435!"},{id:"nav_lock",key:"L",name:"\u0421\u0443\u0434\u043E\u0445\u043E\u0434\u043D\u044B\u0439 \u0448\u043B\u044E\u0437 \u0438 \u0433\u0440\u0443\u0437\u043E\u0432\u043E\u0439 \u043F\u0440\u0438\u0447\u0430\u043B",short:"\u0428\u043B\u044E\u0437 / \u0424\u043B\u043E\u0442",costFlat:11500,costLabel:"11 500 \u20BD (+\u043F\u043E\u0448\u043B\u0438\u043D\u044B)",desc:"\u041A\u0430\u043C\u0435\u0440\u0430 \u0448\u043B\u044E\u0437\u043E\u0432\u0430\u043D\u0438\u044F \u0441 \u0432\u043E\u0440\u043E\u0442\u0430\u043C\u0438: \u043F\u0440\u043E\u043F\u0443\u0441\u043A\u0430\u0435\u0442 \u0441\u0443\u0445\u043E\u0433\u0440\u0443\u0437\u044B, \u0442\u0430\u043D\u043A\u0435\u0440\u044B \u0438 \u0442\u0435\u043F\u043B\u043E\u0445\u043E\u0434\u044B \u0447\u0435\u0440\u0435\u0437 \u0433\u0438\u0434\u0440\u043E\u0443\u0437\u0435\u043B \u0438 \u043F\u0440\u0438\u043D\u043E\u0441\u0438\u0442 \u0441\u0442\u0430\u0431\u0438\u043B\u044C\u043D\u044B\u0435 \u0444\u0440\u0430\u0445\u0442\u043E\u0432\u044B\u0435 \u0441\u0431\u043E\u0440\u044B!"},{id:"fish_eco",key:"F",name:"\u0420\u044B\u0431\u0445\u043E\u0437, \u0440\u044B\u0431\u043E\u0445\u043E\u0434 \u0438 \u044F\u0445\u0442-\u043C\u0430\u0440\u0438\u043D\u0430",short:"\u0420\u044B\u0431\u0445\u043E\u0437 / \u042D\u043A\u043E",costFlat:7200,costLabel:"7 200 \u20BD (+\u0442\u0443\u0440\u0438\u0437\u043C)",desc:"\u041F\u043E\u043D\u0442\u043E\u043D\u043D\u044B\u0435 \u0444\u043E\u0440\u0435\u043B\u0435\u0432\u044B\u0435 \u0441\u0430\u0434\u043A\u0438 \u0438 \u0442\u0443\u0440\u0438\u0441\u0442\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u043F\u0440\u0438\u0441\u0442\u0430\u043D\u044C \u043D\u0430 \u0432\u043E\u0434\u043E\u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435: \u0434\u043E\u0445\u043E\u0434 \u043E\u0442 \u0430\u043A\u0432\u0430\u043A\u0443\u043B\u044C\u0442\u0443\u0440\u044B \u0438 \u044D\u043A\u043E-\u0442\u0443\u0440\u0438\u0437\u043C\u0430 \u0432 \u0447\u0438\u0441\u0442\u043E\u0439 \u0432\u043E\u0434\u0435!"},{id:"powerline",key:"P",name:"\u041E\u0420\u0423 110/220 \u043A\u0412 \u0438 \u041B\u042D\u041F \u043A \u0433\u043E\u0440\u043E\u0434\u0430\u043C",short:"\u041E\u0420\u0423 / \u041B\u042D\u041F",costPerMeter:13,costLabel:"6 800 \u20BD \u041E\u0420\u0423 / \u041B\u042D\u041F",desc:"\u041A\u043B\u0438\u043A \u043F\u043E \u0433\u043E\u0440\u043E\u0434\u0443 \u2014 \u0442\u044F\u043D\u0435\u0442 \u043C\u0430\u0433\u0438\u0441\u0442\u0440\u0430\u043B\u044C\u043D\u0443\u044E \u041B\u042D\u041F. \u041A\u043B\u0438\u043A \u043D\u0430 \u0441\u0443\u0445\u043E\u043C \u0431\u0435\u0440\u0435\u0433\u0443 \u0443 \u0413\u042D\u0421 \u2014 \u0441\u0442\u0440\u043E\u0438\u0442 3D-\u043F\u043E\u0434\u0441\u0442\u0430\u043D\u0446\u0438\u044E \u041E\u0420\u0423 (\u0441\u043D\u0438\u0436\u0430\u0435\u0442 \u043F\u043E\u0442\u0435\u0440\u0438 \u0441 16% \u0434\u043E 3%)!"},{id:"demolish",key:"X",name:"\u0414\u0435\u043C\u043E\u043D\u0442\u0430\u0436 \u0441\u043E\u043E\u0440\u0443\u0436\u0435\u043D\u0438\u044F",short:"\u0421\u043D\u043E\u0441",costFlat:250,costLabel:"250 \u20BD",desc:"\u0414\u0435\u043C\u043E\u043D\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0433\u0438\u0434\u0440\u043E\u0430\u0433\u0440\u0435\u0433\u0430\u0442, \u0432\u043E\u0434\u043E\u0441\u0431\u0440\u043E\u0441, \u0448\u043B\u044E\u0437, \u0440\u044B\u0431\u0445\u043E\u0437, \u043F\u043E\u0434\u0441\u0442\u0430\u043D\u0446\u0438\u044E \u0438\u043B\u0438 \u0440\u0430\u0437\u043E\u0431\u0440\u0430\u0442\u044C \u0441\u0435\u043A\u0446\u0438\u044E \u043F\u043B\u043E\u0442\u0438\u043D\u044B."}],Fg={kaplan:{id:"kaplan",baseName:"\u041A\u0430\u043F\u043B\u0430\u043D\u0430 \u041F\u041B",baseRatedMW:8,baseMinHead:2,baseOptHead:8,baseMaxHead:22,baseHeadSigma:12.5,baseMaxArea:5.4,peakEta:.92,frictionK:15e-5,upkeepPerSec:10,cost:9500,reversible:!1,color:3900150},francis:{id:"francis",baseName:"\u0424\u0440\u044D\u043D\u0441\u0438\u0441\u0430 \u0420\u041E",baseRatedMW:22,baseMinHead:4.8,baseOptHead:16,baseMaxHead:46,baseHeadSigma:16.5,baseMaxArea:6.8,peakEta:.94,frictionK:1e-4,upkeepPerSec:22,cost:23500,reversible:!0,color:16096779},pelton:{id:"pelton",baseName:"\u0413\u0410\u042D\u0421 / \u041F\u0435\u043B\u0442\u043E\u043D",baseRatedMW:36,baseMinHead:8,baseOptHead:24.5,baseMaxHead:66,baseHeadSigma:22,baseMaxArea:6,peakEta:.93,frictionK:8e-5,upkeepPerSec:30,cost:32e3,reversible:!0,color:1096065}},vr={kaplan:{},francis:{},pelton:{}},Re={startingCash:68e3,baseRatePerMWSec:345,industrialPPAMultiplier:1.28,capacityPaymentPerMWSec:18,pumpedNightBuyFactor:.34,navLockTollPerSec:95,municipalWaterPerKPopSec:11.5,irrigationBonusPerSec:135,fishFarmIncomePerSec:88,ecoTourismPerMarinaSec:46,aggregateSellPricePerM3:10.5,carbonCreditPerMWSec:22,floodProtectionBonusSec:95,overSupplyExportFactor:.42,loanChunk:3e4,loanInterestPerSec:4e-4,maxLoan:18e4};function bc(r){let t=(r%24+24)%24;return t>=0&&t<6?.56:t>=6&&t<10.5?1.65:t>=10.5&&t<17?1.06:t>=17&&t<22?2.38:.8}function Nd(r){let t=(r%24+24)%24;return t>=0&&t<6?{label:"\u041D\u043E\u0447\u044C \xD70.56 (\u0437\u0430\u043A\u0430\u0447\u043A\u0430 \u0413\u0410\u042D\u0421)",cls:"offpeak"}:t>=6&&t<10.5?{label:"\u0423\u0442\u0440\u0435\u043D\u043D\u0438\u0439 \u043F\u0438\u043A \xD71.65",cls:"peak"}:t>=10.5&&t<17?{label:"\u0414\u043D\u0435\u0432\u043D\u043E\u0439 \u043F\u043E\u043B\u0443\u043F\u0438\u043A \xD71.06",cls:"mid"}:t>=17&&t<22?{label:"\u0412\u0435\u0447\u0435\u0440\u043D\u0438\u0439 \u0421\u0423\u041F\u0415\u0420-\u041F\u0418\u041A \xD72.38",cls:"superpeak"}:{label:"\u0421\u043F\u0430\u0434 \u043D\u0430\u0433\u0440\u0443\u0437\u043A\u0438 \xD70.80",cls:"offpeak"}}function Ra(r="km5"){let t=Rn[r]||Rn.km5;L.scaleId=t.id,L.size=t.size,L.horizScale=t.horizScale,L.elevScale=t.elevScale,L.flowScale=t.flowScale,L.powerScale=t.powerScale,L.snowLineY=t.snowLineY,L.minZoom=t.minZoom,L.maxZoom=t.maxZoom,L.defaultDist=t.defaultDist,L.brushSizes=t.brushSizes.slice();let e=t.elevScale;Ee.highDamHeadThreshold=+(10.5*e).toFixed(1),Ee.maxUnreinforcedHead=+(17.5*e).toFixed(1);for(let i of Ee.damHeightTiers)i.addHeight=+(i.baseAddHeight*e).toFixed(1),i.label=`\u042F\u0440\u0443\u0441 +${Math.round(i.addHeight)}\u043C`;for(let i of Object.values(bi))i.mainInflowQ=Math.round(i.baseMainQ*t.flowScale),i.creekInflowQ=Math.round(i.baseCreekQ*t.flowScale),i.westCreekQ=Math.round(i.baseWestQ*t.flowScale),i.areaLabel=`${t.shortLabel} \xB7 3 \u0440\u0435\u043A\u0438 \xB7 8 \u0433\u043E\u0440\u043E\u0434\u043E\u0432`,i.headLabel=`\u0421\u0442\u043E\u043A \u0440\u0435\u043A: ~${i.mainInflowQ+i.creekInflowQ+i.westCreekQ} \u043C\xB3/\u0441`,i.landmarks=i.baseLandmarks.map(n=>({label:n.label,x:+(n.x*t.horizScale).toFixed(1),z:+(n.z*t.horizScale).toFixed(1),dist:Math.round(n.dist*Math.pow(t.horizScale,.78))}));for(let[i,n]of Object.entries(Fg)){let s=Math.round(n.baseRatedMW*t.powerScale),o=vr[i];o.id=n.id,o.name=`${n.baseName}-${s}`,o.ratedMW=s,o.minHead=+(n.baseMinHead*e).toFixed(1),o.optHead=+(n.baseOptHead*e).toFixed(1),o.maxHead=+(n.baseMaxHead*e).toFixed(1),o.headSigma=+(n.baseHeadSigma*e).toFixed(1),o.maxArea=+(n.baseMaxArea*(t.flowScale/Math.sqrt(e))).toFixed(2),o.peakEta=n.peakEta,o.frictionK=n.frictionK/(t.flowScale*t.flowScale)*e,o.upkeepPerSec=n.upkeepPerSec,o.cost=n.cost,o.reversible=n.reversible,o.color=n.color}for(let i of Mr)if(i.turbineType&&vr[i.turbineType]){let n=vr[i.turbineType];i.turbineType==="kaplan"?i.short=`\u041A\u0430\u043F\u043B\u0430\u043D ${n.ratedMW}\u041C\u0412\u0442`:i.turbineType==="francis"?i.short=`\u0424\u0440\u044D\u043D\u0441\u0438\u0441 ${n.ratedMW}\u041C\u0412\u0442`:i.short=`\u0413\u0410\u042D\u0421 ${n.ratedMW}\u041C\u0412\u0442`}oi.length=0;for(let i of Ng){let n={id:i.id,name:i.name,subtitle:i.subtitle,x:+(i.baseX*t.horizScale).toFixed(1),z:+(i.baseZ*t.horizScale).toFixed(1),plateauRadius:+(i.baseRadius*t.horizScale).toFixed(1),baseElevation:+(i.baseElev*e).toFixed(2),startPop:Math.round(i.startPop*Math.sqrt(t.horizScale)),baseDemandMW:+(i.baseDemandMW*t.powerScale).toFixed(2),demandPerBuilding:+(i.demandPerBuilding*t.powerScale).toFixed(3),tariffBonus:i.tariffBonus,needsIrrigation:!!i.needsIrrigation,specialContract:i.specialContract||null,connectedAtStart:i.connectedAtStart,accent:i.accent,archetype:i.archetype};i.baseIrrTarget&&(n.irrigationTarget={x:+(i.baseIrrTarget.x*t.horizScale).toFixed(1),z:+(i.baseIrrTarget.z*t.horizScale).toFixed(1),radius:+(i.baseIrrTarget.radius*t.horizScale).toFixed(1)}),oi.push(n)}return t}Ra("km5");var _r=[{id:"first_watt",title:"\u041F\u0435\u0440\u0432\u044B\u0439 \u043F\u0440\u043E\u043C\u044B\u0448\u043B\u0435\u043D\u043D\u044B\u0439 \u0442\u043E\u043A \u0413\u042D\u0421!",desc:"\u041F\u043E\u0441\u0442\u0440\u043E\u0439\u0442\u0435 \u043F\u043B\u043E\u0442\u0438\u043D\u0443, \u0437\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u0435 \u043F\u0440\u0438\u043F\u043B\u043E\u0442\u0438\u043D\u043D\u0443\u044E \u0413\u042D\u0421 \u0432 \u043D\u0438\u0436\u043D\u0435\u043C \u0431\u044C\u0435\u0444\u0435 \u0438 \u0432\u044B\u0434\u0430\u0439\u0442\u0435 \u043C\u043E\u0449\u043D\u043E\u0441\u0442\u044C \u0432 \u0441\u0435\u0442\u044C.",reward:12e3,check:r=>r.totalMW>=.45*L.powerScale},{id:"reinforced_dam",title:"\u0418\u043D\u0436\u0435\u043D\u0435\u0440\u043D\u0430\u044F \u0437\u0430\u0449\u0438\u0442\u0430 \u0438 \u041E\u0420\u0423",desc:"\u0423\u043A\u0440\u0435\u043F\u0438\u0442\u0435 \u043F\u043B\u043E\u0442\u0438\u043D\u0443 \u043C\u0438\u043D\u0438\u043C\u0443\u043C 6 \u0431\u043B\u043E\u043A\u0430\u043C\u0438 \u043A\u043E\u043D\u0442\u0440\u0444\u043E\u0440\u0441\u043E\u0432/\u0446\u0435\u043C\u0435\u043D\u0442\u0430\u0446\u0438\u0438 \u0438\u043B\u0438 \u043F\u043E\u0441\u0442\u0440\u043E\u0439\u0442\u0435 \u043F\u043E\u0434\u0441\u0442\u0430\u043D\u0446\u0438\u044E \u041E\u0420\u0423.",reward:14e3,check:r=>r.reinforcedCells>=6||r.substations>=1},{id:"custom_canal",title:"\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u0432\u043E\u0434\u043D\u0430\u044F \u0430\u0440\u0442\u0435\u0440\u0438\u044F",desc:"\u041F\u0440\u043E\u043A\u043E\u043F\u0430\u0439\u0442\u0435 \u044D\u043A\u0441\u043A\u0430\u0432\u0430\u0442\u043E\u0440\u043E\u043C \u0434\u0435\u0440\u0438\u0432\u0430\u0446\u0438\u043E\u043D\u043D\u044B\u0439, \u0441\u0443\u0434\u043E\u0445\u043E\u0434\u043D\u044B\u0439 \u0438\u043B\u0438 \u043E\u0440\u043E\u0441\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u043A\u0430\u043D\u0430\u043B.",reward:15e3,check:r=>r.excavatedNormM3>=500},{id:"nav_or_fish",title:"\u041A\u043E\u043C\u043F\u043B\u0435\u043A\u0441\u043D\u044B\u0439 \u0433\u0438\u0434\u0440\u043E\u0443\u0437\u0435\u043B: \u0424\u043B\u043E\u0442 \u0438 \u0411\u0438\u043E\u0440\u0435\u0441\u0443\u0440\u0441\u044B",desc:"\u041F\u043E\u0441\u0442\u0440\u043E\u0439\u0442\u0435 \u0441\u0443\u0434\u043E\u0445\u043E\u0434\u043D\u044B\u0439 \u0448\u043B\u044E\u0437 [L] \u0434\u043B\u044F \u043F\u0440\u043E\u043F\u0443\u0441\u043A\u0430 \u043A\u043E\u0440\u0430\u0431\u043B\u0435\u0439 \u0438\u043B\u0438 \u0440\u044B\u0431\u0445\u043E\u0437/\u043C\u0430\u0440\u0438\u043D\u0443 [F] \u043D\u0430 \u0432\u043E\u0434\u043E\u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435.",reward:19e3,check:r=>r.navLocks>=1||r.fishFarms>=1},{id:"irrigation_done",title:"\u0416\u0438\u0432\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u0432\u043B\u0430\u0433\u0430 \u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u044B",desc:"\u041F\u043E\u0434\u0432\u0435\u0434\u0438\u0442\u0435 \u0432\u043E\u0434\u0443 \u0441\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u043C \u043A\u0430\u043D\u0430\u043B\u043E\u043C \u043A \u043E\u0440\u043E\u0441\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u043C\u0443 \u043A\u043E\u043B\u044C\u0446\u0443 \u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u044B.",reward:22e3,check:r=>r.agroIrrigated===!0},{id:"industrial_giants",title:"\u041A\u043E\u043D\u0442\u0440\u0430\u043A\u0442 \u0441 \u0410\u043B\u044E\u043C\u0438\u043D\u0433\u0440\u0430\u0434\u043E\u043C \u0438 \u0426\u041E\u0414 \u0418\u0418",desc:"\u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0438\u0442\u0435 \u043A \u044D\u043D\u0435\u0440\u0433\u043E\u043A\u043E\u043B\u044C\u0446\u0443 \u043C\u0438\u043D\u0438\u043C\u0443\u043C 5 \u0433\u043E\u0440\u043E\u0434\u043E\u0432 \u0438 \u0432\u044B\u0434\u0430\u0439\u0442\u0435 \u043F\u0440\u043E\u043C\u044B\u0448\u043B\u0435\u043D\u043D\u0443\u044E \u043C\u043E\u0449\u043D\u043E\u0441\u0442\u044C.",reward:32e3,check:r=>r.connectedCities>=5&&r.totalMW>=6*L.powerScale},{id:"all_cities_grid",title:"\u0415\u0434\u0438\u043D\u0430\u044F \u044D\u043D\u0435\u0440\u0433\u043E\u0441\u0438\u0441\u0442\u0435\u043C\u0430 \u0432\u0441\u0435\u0445 8 \u0433\u043E\u0440\u043E\u0434\u043E\u0432",desc:"\u041E\u0431\u044A\u0435\u0434\u0438\u043D\u0438\u0442\u0435 \u041B\u042D\u041F \u0432\u0441\u0435 8 \u0433\u043E\u0440\u043E\u0434\u043E\u0432 \u0438 \u043F\u0440\u043E\u043C\u043A\u043B\u0430\u0441\u0442\u0435\u0440\u043E\u0432 \u0431\u0430\u0441\u0441\u0435\u0439\u043D\u0430!",reward:46e3,check:r=>r.connectedCities>=8&&r.totalMW>=10*L.powerScale},{id:"megacascade_master",title:"\u0424\u043B\u0430\u0433\u043C\u0430\u043D \u043D\u0430\u0446\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u043E\u0439 \u0433\u0438\u0434\u0440\u043E\u044D\u043D\u0435\u0440\u0433\u0435\u0442\u0438\u043A\u0438",desc:"\u0412\u044B\u0432\u0435\u0434\u0438\u0442\u0435 \u043A\u0430\u0441\u043A\u0430\u0434 \u0413\u042D\u0421/\u0413\u0410\u042D\u0421 \u043D\u0430 \u043F\u0440\u043E\u0435\u043A\u0442\u043D\u0443\u044E \u043F\u0438\u043A\u043E\u0432\u0443\u044E \u043C\u043E\u0449\u043D\u043E\u0441\u0442\u044C!",reward:75e3,check:r=>r.totalMW>=26*L.powerScale}];function Fd(r=navigator,t=window){let e=(r.maxTouchPoints||0)>0&&(/Android|iPhone|iPad|iPod|Mobile/i.test(r.userAgent||"")||t.matchMedia&&t.matchMedia("(pointer: coarse)").matches),i=r.deviceMemory>0&&r.deviceMemory<=4||r.hardwareConcurrency>0&&r.hardwareConcurrency<=4,n=!e&&!i&&(r.hardwareConcurrency||8)>=8;return{touch:!!e,weak:!!i,low:!!(e||i),recommendedQuality:e||i?"low":n?"high":"medium"}}function Ud(r=window){try{let t=r.location&&r.location.search||"",e=new URLSearchParams(t);return e.get("safe")==="1"||e.get("safe")===""}catch{return!1}}var Ug="2026-10-31 19:48",Ia=null;function wc(){if(Ia)return Ia;let r={webgl2:!1,webgl:!1,floatTex:!1,halfFloatTex:!1,vendor:"\u2014",renderer:"\u2014",reason:null};try{let t=document.createElement("canvas");t.width=16,t.height=16;let e=t.getContext("webgl2",{failIfMajorPerformanceCaveat:!1});if(e?(r.webgl2=!0,r.webgl=!0,r.floatTex=!!e.getExtension("EXT_color_buffer_float"),r.halfFloatTex=!0):(e=t.getContext("webgl",{failIfMajorPerformanceCaveat:!1})||t.getContext("experimental-webgl",{}),e&&(r.webgl=!0,r.floatTex=!!e.getExtension("OES_texture_float"),r.halfFloatTex=!!e.getExtension("OES_texture_half_float"))),!e)return r.reason="\u0411\u0440\u0430\u0443\u0437\u0435\u0440 \u043D\u0435 \u0432\u044B\u0434\u0430\u043B WebGL-\u043A\u043E\u043D\u0442\u0435\u043A\u0441\u0442 (\u0432\u044B\u043A\u043B\u044E\u0447\u0435\u043D\u043E \u0430\u043F\u043F\u0430\u0440\u0430\u0442\u043D\u043E\u0435 \u0443\u0441\u043A\u043E\u0440\u0435\u043D\u0438\u0435).",Ia=r,r;let i=e.getExtension("WEBGL_debug_renderer_info");i?(r.vendor=e.getParameter(i.UNMASKED_VENDOR_WEBGL)||"\u2014",r.renderer=e.getParameter(i.UNMASKED_RENDERER_WEBGL)||"\u2014"):(r.vendor=e.getParameter(e.VENDOR)||"\u2014",r.renderer=e.getParameter(e.RENDERER)||"\u2014")}catch(t){r.reason=t.message}return Ia=r,r}function Bd(r={}){let t=wc();return[`\u041A\u0410\u0421\u041A\u0410\u0414: \u0416\u0438\u0432\u0430\u044F \u0412\u043E\u0434\u0430 \xB7 \u0441\u0431\u043E\u0440\u043A\u0430 ${Ug}`,`GPU: ${t.renderer} (${t.vendor})`,`WebGL2: ${t.webgl2?"\u0434\u0430":"\u043D\u0435\u0442"} \xB7 FloatTex: ${t.floatTex?"RGBA32F":t.halfFloatTex?"RGBA16F":"Uint8 fallback"}`,`\u041A\u0430\u0434\u0440: ${r.fps||0} FPS \xB7 \u0424\u0438\u0437\u0438\u043A\u0430 \u0432\u043E\u0434\u044B: ${(r.hydroMs||0).toFixed(2)} \u043C\u0441/\u043A\u0430\u0434\u0440`,`\u0421\u0435\u0442\u043A\u0430 \u0432\u043E\u0434\u044B: ${r.grid||"\u2014"} \xB7 \u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0435 \u0442\u0430\u0439\u043B\u044B 8\xD78: ${r.activeTiles||0}/${r.totalTiles||0} (\u043F\u0440\u043E\u043F\u0443\u0441\u043A \u0441\u0443\u0445\u0438\u0445 \u0441\u043A\u043B\u043E\u043D\u043E\u0432)`,`\u041F\u043E\u0434\u0448\u0430\u0433\u0438 CFL: ${r.substeps||0} \xB7 \u041C\u0430\u0441\u0441\u0430 \u0432\u043E\u0434\u044B: ${((r.waterVolumeM3||0)/1e3).toFixed(1)} \u0442\u044B\u0441. \u043C\xB3`,`Draw calls: ${r.drawCalls||0} \xB7 \u0422\u0440\u0435\u0443\u0433\u043E\u043B\u044C\u043D\u0438\u043A\u0438: ${r.triangles||0} \xB7 \u0418\u043D\u0441\u0442\u0430\u043D\u0441\u044B \u0437\u0434\u0430\u043D\u0438\u0439: ${r.cityBuildings||0}`,`\u042F\u0434\u0440\u043E \u044D\u043A\u043E\u043D\u043E\u043C\u0438\u043A\u0438: FixedClock 30 \u0413\u0446 (\u041F\u0435\u0440\u0435\u043F\u043B\u0451\u0442) \xB7 \u0422\u0435\u043D\u0438: ${r.shadows||"\u0432\u044B\u043A\u043B"}`].join(`
`)}function W(r,t,e){return r<t?t:r>e?e:r}function ai(r,t,e){let i=W((e-r)/(t-r||1e-6),0,1);return i*i*(3-2*i)}function $t(r,t,e){return r+(t-r)*e}function Zn(r=20261031){let t=r>>>0||1;return()=>{t=t+1831565813|0;let e=Math.imul(t^t>>>15,1|t);return e=e+Math.imul(e^e>>>7,61|e)^e,((e^e>>>14)>>>0)/4294967296}}function Pa(r,t){let e=Math.imul(r,374761393)+Math.imul(t,668265263);return e=Math.imul(e^e>>>13,1274126177),((e^e>>>16)>>>0)/4294967295}function zd(r,t){let e=Math.floor(r),i=Math.floor(t),n=r-e,s=t-i,o=n*n*(3-2*n),a=s*s*(3-2*s),l=Pa(e,i),c=Pa(e+1,i),h=Pa(e,i+1),u=Pa(e+1,i+1);return $t($t(l,c,o),$t(h,u,o),a)*2-1}function Ec(r,t,e=5,i=2.05,n=.5){let s=.5,o=1,a=0,l=0;for(let c=0;c<e;c++)a+=s*zd(r*o,t*o),l+=s,o*=i,s*=n;return a/(l||1)}function Tc(r,t,e=4){let i=.5,n=1,s=0,o=0;for(let a=0;a<e;a++){let l=1-Math.abs(zd(r*n,t*n));s+=i*l*l,o+=i,n*=2.1,i*=.5}return s/(o||1)}function La(r,t,e){let i=1/0,n=0,s=10,o=0,a=1,l=0,c=0;for(let u=0;u<e.length-1;u++)c+=Math.hypot(e[u+1].x-e[u].x,e[u+1].z-e[u].z);let h=0;for(let u=0;u<e.length-1;u++){let d=e[u],f=e[u+1],g=f.x-d.x,y=f.z-d.z,p=g*g+y*y||1e-6,m=Math.sqrt(p),x=W(((r-d.x)*g+(t-d.z)*y)/p,0,1),S=d.x+g*x,M=d.z+y*x,b=(r-S)*(r-S)+(t-M)*(t-M);b<i&&(i=b,n=$t(d.bed,f.bed,x),s=$t(d.width,f.width,x),o=g/m,a=y/m,l=(h+m*x)/(c||1)),h+=m}return{dist:Math.sqrt(i),bed:n,width:s,tx:o,tz:a,s:l}}var Rs={bystritsa:{main:[{x:-92,z:-376,bed:35.4,width:17},{x:-58,z:-322,bed:32.8,width:21},{x:-22,z:-262,bed:30,width:29},{x:4,z:-206,bed:27.6,width:22},{x:12,z:-158,bed:25,width:14},{x:16,z:-112,bed:21.6,width:18},{x:96,z:-56,bed:19,width:21},{x:134,z:32,bed:16.4,width:22},{x:88,z:108,bed:13.6,width:23},{x:4,z:122,bed:10.8,width:23},{x:-46,z:198,bed:8.4,width:26},{x:-16,z:294,bed:6.3,width:31},{x:12,z:384,bed:4.4,width:36}],eastCreek:[{x:152,z:-374,bed:40.5,width:11},{x:102,z:-324,bed:36.6,width:12},{x:44,z:-286,bed:32.8,width:14},{x:-16,z:-258,bed:29.8,width:16}],westCreek:[{x:-374,z:68,bed:27.5,width:10},{x:-268,z:96,bed:21.8,width:11},{x:-146,z:132,bed:14.8,width:12},{x:-46,z:194,bed:8.5,width:14}],gorges:[{x:12,z:-158,spanZ:48,strength:25}],seedOffset:0,widthScale:1,soilBonus:0},rapids:{main:[{x:-108,z:-376,bed:42.5,width:16},{x:-64,z:-312,bed:38.2,width:24},{x:-18,z:-248,bed:33.4,width:13},{x:6,z:-182,bed:28,width:25},{x:22,z:-98,bed:22,width:14},{x:118,z:-22,bed:17.8,width:20},{x:128,z:58,bed:15.6,width:21},{x:52,z:132,bed:11.4,width:23},{x:-38,z:208,bed:8.1,width:26},{x:-10,z:302,bed:6,width:30},{x:16,z:384,bed:4.3,width:34}],eastCreek:[{x:168,z:-374,bed:46,width:11},{x:96,z:-316,bed:40.5,width:13},{x:-12,z:-268,bed:35,width:15}],westCreek:[{x:-374,z:74,bed:30,width:10},{x:-220,z:120,bed:19.5,width:12},{x:-38,z:204,bed:8.2,width:14}],gorges:[{x:-18,z:-248,spanZ:44,strength:27},{x:22,z:-98,spanZ:42,strength:23.5}],seedOffset:37.4,widthScale:.96,soilBonus:-.5},delta:{main:[{x:-78,z:-376,bed:30.2,width:22},{x:-36,z:-292,bed:27.6,width:28},{x:8,z:-152,bed:22.8,width:19},{x:28,z:-96,bed:19.8,width:25},{x:112,z:-34,bed:17.5,width:27},{x:132,z:42,bed:15.8,width:28},{x:76,z:118,bed:12.8,width:29},{x:-8,z:146,bed:10.2,width:31},{x:-44,z:224,bed:7.8,width:34},{x:-8,z:312,bed:5.9,width:38},{x:14,z:384,bed:4.3,width:44}],eastCreek:[{x:158,z:-374,bed:34.5,width:13},{x:84,z:-296,bed:29.8,width:15},{x:-8,z:-232,bed:25.6,width:17}],westCreek:[{x:-374,z:82,bed:24,width:12},{x:-212,z:144,bed:14.5,width:14},{x:-44,z:218,bed:8,width:17}],gorges:[{x:8,z:-152,spanZ:52,strength:17}],seedOffset:91.2,widthScale:1.24,soilBonus:2.2}},xM=Rs.bystritsa.main,yM=Rs.bystritsa.eastCreek;function In(r="bystritsa"){let t=Rs[r]||Rs.bystritsa,e=L.horizScale,i=L.elevScale,n=s=>({x:s.x*e,z:s.z*e,bed:s.bed*i,width:s.width*e*t.widthScale});return{main:t.main.map(n),eastCreek:t.eastCreek.map(n),westCreek:t.westCreek.map(n),gorges:t.gorges.map(s=>({x:s.x*e,z:s.z*e,spanZ:s.spanZ*e,strength:s.strength*i}))}}function Pn(r,t,e="bystritsa",i=0,n=r){let s=Rs[e]||Rs.bystritsa,{bedrock:o,soil:a,concrete:l,h:c,hu:h,hv:u,wetness:d}=t,f=L.size*.5,g=L.size/r,y=L.horizScale,p=L.elevScale,m=s.seedOffset,x=Math.pow(p,.72),S=Math.pow(p,.35),M=W(i,0,r),b=W(n,0,r);for(let _=M;_<b;_++){let w=-f+(_+.5)*g,v=w/y,T=W((384-v)/768,0,1);for(let C=0;C<r;C++){let R=-f+(C+.5)*g,P=R/y,N=_*r+C,I=Math.abs(P)/384,U=Math.pow(W((I-.52)/.48,0,1),1.78)*42,B=ai(-140,-380,v)*(20+25*Tc(P*.009+3.1+m,v*.009-1.7,4)),G=Ec(P*.0052+11.3+m,v*.0052+4.7,5)*8.6,Q=Ec(P*.021-5.2+m,v*.021+8.9,3)*1.9,F=y>1.5?Tc(R*.0011+m,w*.0011-4.2,3)*6.5*ai(.35,.92,I):0,$=12+T*(e==="rapids"?28:e==="delta"?18.5:23.8)+U+B+G+Q+F,K=!1;for(let Yt=0;Yt<s.gorges.length;Yt++){let qt=s.gorges[Yt],Ot=(v-qt.z)/qt.spanZ;if(Math.abs(Ot)<1.35){let Qt=Math.exp(-Ot*Ot*1.9),z=Math.abs(P-qt.x),Ue=ai(12,48,z)*(1-ai(78,152,z));$+=Qt*Ue*qt.strength,Math.abs(v-qt.z)<qt.spanZ*.9&&z<58&&(K=!0)}}let at=1-ai(18,52,Math.abs(P- -16)),rt=ai(-118,-84,v)*(1-ai(82,118,v)),It=at*rt;if(It>.001){let Yt=$t(23.8,16.4,W((v- -98)/205,0,1));$=$t($,Yt,It*.8)}let ut=$*p,Pt=0;for(let Yt=0;Yt<oi.length;Yt++){let qt=oi[Yt],Ot=Math.hypot(R-qt.x,w-qt.z),Qt=1-ai(qt.plateauRadius*.68,qt.plateauRadius*1.26,Ot);Qt>.001&&(ut=$t(ut,qt.baseElevation,Qt*.95),Pt=Math.max(Pt,Qt))}let q=Math.hypot(P-168,v-98);if(q<40){let Yt=1-ai(14,40,q);ut=$t(ut,14.2*p,Yt*.9)}let Z=La(P,v,s.main),ct=La(P,v,s.eastCreek),vt=La(P,v,s.westCreek),lt=0,Ht=0,fe=0,Wt=0,ht=Z.width*.5*s.widthScale;if(Z.dist<ht*3.6){let Yt=1-ai(ht*.82,ht*3.4,Z.dist),qt=W(Z.dist/ht,0,1),Ot=(Z.bed+Math.pow(qt,2.2)*2.6)*p;if(ut=$t(ut,Math.min(ut,Ot+(1-Yt)*5.2*p),Yt),Z.dist<ht*1.12){ut=Math.min(ut,(Z.bed+Math.pow(Z.dist/(ht*1.12),2.4)*2.15)*p);let Qt=Z.bed*p+2.15*x;if(Qt>ut+.05){lt=Qt-ut;let z=2.25*S;Ht=Z.tx*z,fe=Z.tz*z,Wt=1}}}let it=ct.width*.5*s.widthScale;if(ct.dist<it*3.2&&v<-228){let Yt=1-ai(it*.8,it*3,ct.dist),qt=(ct.bed+Math.pow(W(ct.dist/it,0,1),2.1)*1.9)*p;if(ut=$t(ut,Math.min(ut,qt+(1-Yt)*4.2*p),Yt),ct.dist<it*1.1){ut=Math.min(ut,(ct.bed+Math.pow(ct.dist/(it*1.1),2.2)*1.6)*p);let Ot=ct.bed*p+1.38*x;if(Ot>ut+.05&&Ot-ut>lt){lt=Ot-ut;let Qt=2.35*S;Ht=ct.tx*Qt,fe=ct.tz*Qt,Wt=1}}}let Lt=vt.width*.5*s.widthScale;if(vt.dist<Lt*3.1&&P<-32&&v>42&&v<228){let Yt=1-ai(Lt*.8,Lt*2.9,vt.dist),qt=(vt.bed+Math.pow(W(vt.dist/Lt,0,1),2.1)*1.8)*p;if(ut=$t(ut,Math.min(ut,qt+(1-Yt)*3.8*p),Yt),vt.dist<Lt*1.1){ut=Math.min(ut,(vt.bed+Math.pow(vt.dist/(Lt*1.1),2.2)*1.5)*p);let Ot=vt.bed*p+1.2*x;if(Ot>ut+.05&&Ot-ut>lt){lt=Ot-ut;let Qt=2.1*S;Ht=vt.tx*Qt,fe=vt.tz*Qt,Wt=1}}}if(!Wt){let Yt=Math.max(Math.abs(P),Math.max(0,v)),qt=ai(352,383.2,Yt);qt>.001&&(ut=$t(ut,2.75*p,qt*.94))}let jt=(2.7+s.soilBonus+It*4+Pt*1.6-ai(34*p,58*p,ut)*2.2)*Math.pow(p,.65);K&&(jt=Math.min(jt,.45*p)),Wt&&(jt=W(jt*.36,.35,1.8*p)),jt=W(jt,.15,14*p),o[N]=Math.max(.5,ut-jt),a[N]=jt,l[N]=0,c[N]=lt,h[N]=lt*Ht,u[N]=lt*fe,d[N]=lt>.02?1:0}}}var Le=L.gravity,kd=L.waterDensity,Da=.014,Od=Da*Da*Da*Da,Bt=8,Na=class{constructor(t=208,e="bystritsa",i=!1){this.grid=t,this.presetId=e,this.count=t*t,this.dx=L.size/t,this.cellArea=this.dx*this.dx,this.bedrock=new Float32Array(this.count),this.soil=new Float32Array(this.count),this.soilSaturation=new Float32Array(this.count),this.concrete=new Float32Array(this.count),this.targetConcrete=new Float32Array(this.count),this.formworkWall=new Float32Array(this.count),this.buildProgress=new Float32Array(this.count),this.gateWall=new Float32Array(this.count),this.zb=new Float32Array(this.count),this.linedMask=new Uint8Array(this.count),this.earthDamMask=new Uint8Array(this.count),this.foundationMask=new Uint8Array(this.count),this.buttressYaw=new Float32Array(this.count),this.h=new Float32Array(this.count),this.hu=new Float32Array(this.count),this.hv=new Float32Array(this.count),this.dH=new Float32Array(this.count),this.dHU=new Float32Array(this.count),this.dHV=new Float32Array(this.count),this.u=new Float32Array(this.count),this.v=new Float32Array(this.count),this.vort=new Float32Array(this.count),this.sediment=new Float32Array(this.count),this.foam=new Float32Array(this.count),this.sedNext=new Float32Array(this.count),this.foamNext=new Float32Array(this.count),this.wetness=new Float32Array(this.count),this.tilesN=Math.ceil(t/Bt),this.totalTiles=this.tilesN*this.tilesN,this.tileWet=new Uint8Array(this.totalTiles),this.activeTiles=new Int32Array(this.totalTiles),this.activeTileCount=0,this.wetCellCount=0,this.terrainDirty=!0,this.dirtyMinX=0,this.dirtyMinZ=0,this.dirtyMaxX=t-1,this.dirtyMaxZ=t-1,this.engineeredDirty=!0,this.activeBuildCells=[],this.activeBuildSet=new Uint8Array(this.count),this.activeBuildSites=[],this.turbines=[],this.spillways=[],this.substations=[],this.navLocks=[],this.fishFarms=[],this.nextStructId=1,this.overflowEdges=[],this.soilStockpileM3=0,this.rockStockpileM3=0,this.totalExcavatedM3=0,this.excavatedNormM3=0,this.damCellCount=0,this.reinforcedCellCount=0,this.maxDamStress=0,this.totalSeepageQ=0,this.pendingPourVolumeM3=0,this.inflowMult=1,this.rainRate=0,this.currentEvapRateMps=0,this.currentSnowmeltBonusQ=0,this.currentWithdrawQ=0,this.isOffPeakNight=!1,this.lastRiverInflowQ=0,this.lastRainAddedQ=0,this.lastInfiltrationQ=0,this.lastMouthOutflowQ=0,this.lastCrestOverflowQ=0,this.lastPumpedUpQ=0,this.lastPumpedConsumeMW=0,this.meanReservoirTurbidity=.05,this.lastSubsteps=0,this.lastStepMs=0,this.totalWaterVolumeM3=0,this.simTime=0,this._erosionTick=0,this.jetEmitters=[],this._syncScaleGeometry(),i||this.resetValley(e)}_syncScaleGeometry(){this.dx=L.size/this.grid,this.cellArea=this.dx*this.dx;let t=768/this.grid*(768/this.grid);this.volPriceNorm=t/(this.cellArea*L.elevScale),this.maxFlowSpeed=26*Math.sqrt(L.elevScale)}_clearArrays(){this._syncScaleGeometry(),this.bedrock.fill(0),this.soil.fill(0),this.soilSaturation.fill(.25),this.concrete.fill(0),this.targetConcrete.fill(0),this.formworkWall.fill(0),this.buildProgress.fill(1),this.gateWall.fill(0),this.linedMask.fill(0),this.earthDamMask.fill(0),this.foundationMask.fill(0),this.buttressYaw.fill(0),this.h.fill(0),this.hu.fill(0),this.hv.fill(0),this.vort.fill(0),this.sediment.fill(0),this.foam.fill(0),this.wetness.fill(0),this.activeBuildCells=[],this.activeBuildSet.fill(0),this.activeBuildSites=[],this.turbines=[],this.spillways=[],this.substations=[],this.navLocks=[],this.fishFarms=[],this.overflowEdges=[],this.soilStockpileM3=0,this.rockStockpileM3=0,this.totalExcavatedM3=0,this.excavatedNormM3=0,this.damCellCount=0,this.reinforcedCellCount=0,this.maxDamStress=0,this.totalSeepageQ=0,this.pendingPourVolumeM3=0,this.lastCrestOverflowQ=0,this.lastPumpedUpQ=0,this.lastPumpedConsumeMW=0,this.engineeredDirty=!0}resetValley(t=this.presetId){this.presetId=t,this._clearArrays(),Pn(this.grid,this,t,0,this.grid),this.finalizeValleySetup(18)}finalizeValleySetup(t=18){for(let i=0;i<this.count;i++)this.soilSaturation[i]=this.h[i]>.02?1:.28;this.recomputeZbRange(0,0,this.grid-1,this.grid-1),this._rebuildVelocitiesAll(),this._rebuildActiveTiles();let e=Math.min(.055,.35*this.dx/(14*Math.sqrt(L.elevScale)));for(let i=0;i<t;i++)this._substep(e);this._detectCrestOverflows(),this.engineeredDirty=!0}worldToGrid(t,e){let i=L.size*.5,n=Math.floor((t+i)/this.dx),s=Math.floor((e+i)/this.dx);return{gx:W(n,0,this.grid-1),gz:W(s,0,this.grid-1)}}gridToWorld(t,e){let i=L.size*.5;return{wx:-i+(t+.5)*this.dx,wz:-i+(e+.5)*this.dx}}recomputeZbRange(t,e,i,n){let s=this.grid,o=W(t,0,s-1),a=W(e,0,s-1),l=W(i,0,s-1),c=W(n,0,s-1);for(let h=a;h<=c;h++){let u=h*s;for(let d=o;d<=l;d++){let f=u+d,g=Math.max(this.concrete[f],this.formworkWall[f]);this.zb[f]=this.bedrock[f]+this.soil[f]+g+this.gateWall[f]}}this.markTerrainDirty(o,a,l,c)}markTerrainDirty(t,e,i,n){this.terrainDirty?(t<this.dirtyMinX&&(this.dirtyMinX=t),e<this.dirtyMinZ&&(this.dirtyMinZ=e),i>this.dirtyMaxX&&(this.dirtyMaxX=i),n>this.dirtyMaxZ&&(this.dirtyMaxZ=n)):(this.terrainDirty=!0,this.dirtyMinX=t,this.dirtyMinZ=e,this.dirtyMaxX=i,this.dirtyMaxZ=n)}consumeTerrainDirty(){if(!this.terrainDirty)return null;let t={x0:W(this.dirtyMinX-1,0,this.grid-1),z0:W(this.dirtyMinZ-1,0,this.grid-1),x1:W(this.dirtyMaxX+1,0,this.grid-1),z1:W(this.dirtyMaxZ+1,0,this.grid-1)};return this.terrainDirty=!1,t}sampleAtWorld(t,e){let{gx:i,gz:n}=this.worldToGrid(t,e),s=n*this.grid+i,o=this.h[s],a=this.zb[s],l=this.u[s],c=this.v[s],h=Math.hypot(l,c),u=o>.03?h/Math.sqrt(Le*o):0;return{gx:i,gz:n,bed:a,bedrock:this.bedrock[s],soil:this.soil[s],saturation:this.soilSaturation[s],concrete:this.concrete[s],targetConcrete:this.targetConcrete[s],buildProgress:this.buildProgress[s],lined:this.linedMask[s]===1,earthDam:this.earthDamMask[s]===1,reinforced:this.foundationMask[s]===1,depth:o,surface:a+o,u:l,v:c,speed:h,froude:u,vorticity:this.vort[s],sediment:this.sediment[s],foam:this.foam[s]}}excavateCanal(t,e,i,n,s,o,a=!1){let{gx:l,gz:c}=this.worldToGrid(t,e),h=Math.max(1,Math.ceil(i/this.dx)),u=n*L.elevScale,d=0,f=0,g=0,y=W(l-h,1,this.grid-2),p=W(l+h,1,this.grid-2),m=W(c-h,1,this.grid-2),x=W(c+h,1,this.grid-2);for(let S=m;S<=x;S++)for(let M=y;M<=p;M++){let b=Math.hypot(M-l,S-c)*this.dx;if(b>i)continue;let _=S*this.grid+M;if(this.concrete[_]>.25||this.targetConcrete[_]>.25||this.gateWall[_]>.1)continue;let w=W(b/(i||1),0,1),v=w<.56?1:Math.cos((w-.56)/.44*Math.PI*.5);if(v<=.02)continue;let T=this.bedrock[_]+this.soil[_],C=u*v;if(Number.isFinite(s)){let U=w>.56?(w-.56)*4.2*L.elevScale:0,B=s+U;if(T<=B)continue;C=Math.min(u*1.85,T-B)}if(C<=.01)continue;let R=Math.min(this.soil[_],C),P=Math.max(0,C-R),N=Math.min(Math.max(0,this.bedrock[_]-1.2),P*.62),I=(R*3.4+N*14.5)*this.cellArea*this.volPriceNorm*.21;!a&&d+I>o||(this.soil[_]-=R,this.bedrock[_]-=N,this.earthDamMask[_]=0,(this.h[_]>.05||R>.05)&&(this.sediment[_]=Math.min(1.4,this.sediment[_]+.5)),d+=I,f+=R*this.cellArea,g+=N*this.cellArea)}if(f>0||g>0){this.soilStockpileM3+=f,this.rockStockpileM3+=g*1.15;let S=f+g;this.totalExcavatedM3+=S,this.excavatedNormM3+=S*this.volPriceNorm,this.recomputeZbRange(y,m,p,x),this._activateArea(y,m,p,x)}return{cost:d,excavatedM3:f+g,rockM3:g}}lineCanalConcrete(t,e,i,n,s=!1){let{gx:o,gz:a}=this.worldToGrid(t,e),l=Math.max(1,Math.ceil(i/this.dx)),c=0,h=0,u=3.5/this.volPriceNorm,d=W(o-l,1,this.grid-2),f=W(o+l,1,this.grid-2),g=W(a-l,1,this.grid-2),y=W(a+l,1,this.grid-2);for(let p=g;p<=y;p++)for(let m=d;m<=f;m++){if(Math.hypot(m-o,p-a)*this.dx>i)continue;let x=p*this.grid+m;if(this.linedMask[x]===1)continue;let S=Math.min(this.rockStockpileM3,u),M=S>u*.3?58*(1-Ee.rockAggregateDiscount):58;if(!s&&c+M>n)break;this.rockStockpileM3=Math.max(0,this.rockStockpileM3-S),this.linedMask[x]=1,this.soilSaturation[x]=1,this.earthDamMask[x]=0,c+=M,h++}return h>0&&(this.markTerrainDirty(d,g,f,y),this.engineeredDirty=!0),{cost:c,count:h}}buildEarthDam(t,e,i,n,s,o,a=!1){let{gx:l,gz:c}=this.worldToGrid(t,e),h=Math.max(1,Math.ceil(i/this.dx)),u=n*L.elevScale,d=0,f=0,g=W(l-h,1,this.grid-2),y=W(l+h,1,this.grid-2),p=W(c-h,1,this.grid-2),m=W(c+h,1,this.grid-2);for(let x=p;x<=m;x++)for(let S=g;S<=y;S++){let M=Math.hypot(S-l,x-c)*this.dx;if(M>i)continue;let b=x*this.grid+S;if(this.concrete[b]>.2||this.targetConcrete[b]>.2)continue;let _=Math.cos(M/(i||1)*Math.PI*.46),w=u*_;if(Number.isFinite(s)){let P=this.zb[b],N=s-M/(i||1)*1.4*L.elevScale;if(P>=N)continue;w=Math.min(u*1.75,N-P)}if(w<=.02)continue;let v=w*this.cellArea,T=Math.min(this.soilStockpileM3,v),C=v-T,R=(T*1.4+C*5.2)*this.volPriceNorm*.22;!a&&d+R>o||(this.soilStockpileM3=Math.max(0,this.soilStockpileM3-T),this.soil[b]+=w,this.linedMask[b]=0,this.earthDamMask[b]=1,d+=R,f+=v)}return f>0&&(this.recomputeZbRange(g,p,y,m),this._activateArea(g,p,y,m)),{cost:d,addedM3:f}}buildConcreteDam(t,e,i,n,s,o=!1,a=!1){let{gx:l,gz:c}=this.worldToGrid(t,e),h=Math.max(1,Math.ceil(i*.85/this.dx)),u=0,d=0,f=o||a,g=5.6*L.elevScale,y=W(l-h,1,this.grid-2),p=W(l+h,1,this.grid-2),m=W(c-h,1,this.grid-2),x=W(c+h,1,this.grid-2);for(let S=m;S<=x;S++)for(let M=y;M<=p;M++){if(Math.hypot(M-l,S-c)*this.dx>i*.85)continue;let _=S*this.grid+M;if(this.gateWall[_]>.05)continue;let w=this.bedrock[_]+this.soil[_],v=Math.max(this.concrete[_],this.targetConcrete[_]),T=w+v,C=3.2*L.elevScale;if(Number.isFinite(n)){if(T>=n)continue;C=Math.min(g,n-T)}if(C<=.03)continue;let R=C*this.cellArea,P=Math.min(this.rockStockpileM3,R*.55),N=R>0?P/(R*.55)*Ee.rockAggregateDiscount:0,I=this.h[_]>2.2*L.elevScale?1.25:1,U=R*this.volPriceNorm*22*.155*(1-N)*I;if(!o&&u+U>s)continue;this.rockStockpileM3=Math.max(0,this.rockStockpileM3-P);let B=v>1.2,G=v+C;this.targetConcrete[_]=G,this.earthDamMask[_]=0,this.linedMask[_]=1,f?(this.concrete[_]=G,this.formworkWall[_]=0,this.buildProgress[_]=1):(this.formworkWall[_]=Math.max(this.formworkWall[_],this.concrete[_]+C*Ee.cofferdamInstantRatio),this.buildProgress[_]=W(this.concrete[_]/Math.max(.5,G),.06,.92),this.activeBuildSet[_]||(this.activeBuildSet[_]=1,this.activeBuildCells.push(_))),!B&&G>1.2&&this.damCellCount++,u+=U,d+=R}if(d>0){if(!f&&(this.pendingPourVolumeM3+=d,this.activeBuildSites.length<6)){let S=this.gridToWorld(l,c),M=c*this.grid+l;this.activeBuildSites.push({wx:S.wx,wz:S.wz,wy:this.bedrock[M]+this.soil[M]+Math.max(this.concrete[M],this.formworkWall[M]),progress:this.buildProgress[M]})}this.recomputeZbRange(y,m,p,x),this._activateArea(y,m,p,x),this.engineeredDirty=!0}return{cost:u,addedM3:d}}reinforceFoundation(t,e,i,n,s=!1){let{gx:o,gz:a}=this.worldToGrid(t,e),l=Math.max(1,Math.ceil(i*.85/this.dx)),c=0,h=0,u=5/this.volPriceNorm,d=W(o-l,1,this.grid-2),f=W(o+l,1,this.grid-2),g=W(a-l,1,this.grid-2),y=W(a+l,1,this.grid-2),p=this.detectHydraulicDirection(o,a,null);for(let m=g;m<=y;m++)for(let x=d;x<=f;x++){if(Math.hypot(x-o,m-a)*this.dx>i*.85)continue;let S=m*this.grid+x;if(this.foundationMask[S]===1)continue;let M=Math.min(this.rockStockpileM3,u),b=M>u*.3?135*(1-Ee.rockAggregateDiscount):135;if(!s&&c+b>n)break;this.rockStockpileM3=Math.max(0,this.rockStockpileM3-M);let _=this.soil[S]*.85;this.soil[S]-=_,this.bedrock[S]+=_,this.concrete[S]<.8&&this.targetConcrete[S]<.8&&(this.concrete[S]=.85,this.targetConcrete[S]=.85,this.buildProgress[S]=1),this.foundationMask[S]=1,this.buttressYaw[S]=p.yaw,this.earthDamMask[S]=0,this.linedMask[S]=1,this.reinforcedCellCount++,c+=b,h++}return h>0&&(this.recomputeZbRange(d,g,f,y),this.engineeredDirty=!0),{cost:c,count:h}}placeSubstation(t,e,i,n=!1){let s=Ee.substationCost;if(!n&&i<s)return{ok:!1,reason:`\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0441\u0440\u0435\u0434\u0441\u0442\u0432 \u043D\u0430 \u041E\u0420\u0423 110 \u043A\u0412 (\u043D\u0443\u0436\u043D\u043E ${s.toLocaleString("ru-RU")} \u20BD)`};let o=this.sampleAtWorld(t,e);if(o.depth>.35*L.elevScale)return{ok:!1,reason:"\u041F\u043E\u0434\u0441\u0442\u0430\u043D\u0446\u0438\u044E \u041E\u0420\u0423 \u043D\u0443\u0436\u043D\u043E \u0441\u0442\u0440\u043E\u0438\u0442\u044C \u043D\u0430 \u0441\u0443\u0445\u043E\u043C \u0431\u0435\u0440\u0435\u0433\u0443 \u0432\u044B\u0448\u0435 \u0432\u043E\u0434\u044B!"};for(let f of this.substations)if(Math.hypot(f.wx-t,f.wz-e)<28*L.horizScale)return{ok:!1,reason:"\u0420\u044F\u0434\u043E\u043C \u0443\u0436\u0435 \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442 \u043F\u043E\u0434\u0441\u0442\u0430\u043D\u0446\u0438\u044F \u041E\u0420\u0423"};let{gx:a,gz:l}=this.worldToGrid(t,e),c=o.bed+.5,h=l*this.grid+a,u=this.bedrock[h]+this.soil[h];this.concrete[h]=Math.max(this.concrete[h],Math.max(.3,c-u)),this.targetConcrete[h]=Math.max(this.targetConcrete[h],this.concrete[h]),this.linedMask[h]=1,this.recomputeZbRange(a-1,l-1,a+1,l+1);let d={id:this.nextStructId++,kind:"substation",gx:a,gz:l,wx:t,wz:e,wy:c};return this.substations.push(d),this.engineeredDirty=!0,{ok:!0,cost:s,structure:d}}placeNavigationLock(t,e,i,n,s=!1){let o=Ee.navLockCost;if(!s&&n<o)return{ok:!1,reason:`\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0441\u0440\u0435\u0434\u0441\u0442\u0432 \u043D\u0430 \u0441\u0443\u0434\u043E\u0445\u043E\u0434\u043D\u044B\u0439 \u0448\u043B\u044E\u0437 (\u043D\u0443\u0436\u043D\u043E ${o.toLocaleString("ru-RU")} \u20BD)`};let{gx:a,gz:l}=this.worldToGrid(t,e);if(a<4||a>this.grid-5||l<4||l>this.grid-5)return{ok:!1,reason:"\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u0431\u043B\u0438\u0437\u043A\u043E \u043A \u043A\u0440\u0430\u044E \u043A\u0430\u0440\u0442\u044B"};for(let d of this.navLocks)if(Math.hypot(d.gx-a,d.gz-l)<4)return{ok:!1,reason:"\u0420\u044F\u0434\u043E\u043C \u0443\u0436\u0435 \u043F\u043E\u0441\u0442\u0440\u043E\u0435\u043D \u0441\u0443\u0434\u043E\u0445\u043E\u0434\u043D\u044B\u0439 \u0448\u043B\u044E\u0437"};let c=this.detectHydraulicDirection(a,l,i),h=this.sampleAtWorld(t,e),u={id:this.nextStructId++,kind:"nav_lock",gx:a,gz:l,wx:t,wz:e,wy:Math.max(h.bed,h.surface),baseY:h.bedrock+h.soil,yaw:c.yaw,dirX:c.dx,dirZ:c.dz,cyclePhase:0,shipsPassed:0};return this.navLocks.push(u),this.engineeredDirty=!0,{ok:!0,cost:o,structure:u}}placeFishEcoFarm(t,e,i,n=!1){let s=Ee.fishEcoCost;if(!n&&i<s)return{ok:!1,reason:`\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0441\u0440\u0435\u0434\u0441\u0442\u0432 \u043D\u0430 \u0440\u044B\u0431\u0445\u043E\u0437/\u043C\u0430\u0440\u0438\u043D\u0443 (\u043D\u0443\u0436\u043D\u043E ${s.toLocaleString("ru-RU")} \u20BD)`};let o=this.sampleAtWorld(t,e);if(o.depth<.35)return{ok:!1,reason:"\u0420\u044B\u0431\u0445\u043E\u0437 \u0438 \u044F\u0445\u0442-\u043C\u0430\u0440\u0438\u043D\u0443 \u043D\u0443\u0436\u043D\u043E \u0440\u0430\u0437\u043C\u0435\u0449\u0430\u0442\u044C \u043D\u0430 \u0432\u043E\u0434\u0435 (\u0432 \u0440\u0435\u043A\u0435 \u0438\u043B\u0438 \u0432\u043E\u0434\u043E\u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435)!"};for(let l of this.fishFarms)if(Math.hypot(l.wx-t,l.wz-e)<26*L.horizScale)return{ok:!1,reason:"\u0417\u0434\u0435\u0441\u044C \u0443\u0436\u0435 \u0441\u0442\u043E\u044F\u0442 \u0441\u0430\u0434\u043A\u0438 \u0440\u044B\u0431\u0445\u043E\u0437\u0430"};let a={id:this.nextStructId++,kind:"fish_farm",gx:o.gx,gz:o.gz,wx:t,wz:e,wy:o.surface};return this.fishFarms.push(a),this.engineeredDirty=!0,{ok:!0,cost:s,structure:a}}detectHydraulicDirection(t,e,i=null){if(typeof i=="number")return{dx:Math.cos(i),dz:Math.sin(i),yaw:i};let n=0,s=0,o=4;for(let h=-o;h<=o;h++)for(let u=-o;u<=o;u++){if(u===0&&h===0)continue;let d=W(t+u,0,this.grid-1),g=W(e+h,0,this.grid-1)*this.grid+d,y=this.bedrock[g]+this.soil[g]+this.h[g]*2.1,p=1/(u*u+h*h);n-=u*y*p,s-=h*y*p}let a=Math.hypot(n,s);if(a<.001)return{dx:0,dz:1,yaw:Math.PI*.5};let l=n/a,c=s/a;return{dx:l,dz:c,yaw:Math.atan2(c,l)}}placeSpillway(t,e,i,n,s=!1){if(!s&&n<4400)return{ok:!1,reason:"\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0441\u0440\u0435\u0434\u0441\u0442\u0432 (\u043D\u0443\u0436\u043D\u043E 4 400 \u20BD)"};let{gx:a,gz:l}=this.worldToGrid(t,e);if(a<4||a>this.grid-5||l<4||l>this.grid-5)return{ok:!1,reason:"\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u0431\u043B\u0438\u0437\u043A\u043E \u043A \u043A\u0440\u0430\u044E \u043A\u0430\u0440\u0442\u044B"};for(let _ of this.turbines)if(Math.hypot(_.gx-a,_.gz-l)<3)return{ok:!1,reason:"\u041C\u0435\u0441\u0442\u043E \u0437\u0430\u043D\u044F\u0442\u043E \u0433\u0438\u0434\u0440\u043E\u0430\u0433\u0440\u0435\u0433\u0430\u0442\u043E\u043C"};for(let _ of this.spillways)if(Math.hypot(_.gx-a,_.gz-l)<2.8)return{ok:!1,reason:"\u0420\u044F\u0434\u043E\u043C \u0443\u0436\u0435 \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D \u0432\u043E\u0434\u043E\u0441\u0431\u0440\u043E\u0441"};let c=this.detectHydraulicDirection(a,l,i),h=0,u=1/0,d=[];for(let _=-1;_<=1;_++)for(let w=-1;w<=1;w++){let v=a+w,C=(l+_)*this.grid+v;d.push(C),u=Math.min(u,this.bedrock[C]+this.soil[C])}for(let _=-2;_<=2;_++)for(let w=-2;w<=2;w++){let v=W(l+_,0,this.grid-1)*this.grid+W(a+w,0,this.grid-1),T=Math.max(this.concrete[v],this.targetConcrete[v]);T>1&&(h=Math.max(h,this.bedrock[v]+this.soil[v]+T))}let f=u+8.5*L.elevScale,g=h>u+3?h:f,y=u+Math.max(1.2*L.elevScale,(g-u)*.36),p=Math.max(3.5*L.elevScale,g-y);for(let _ of d){let w=this.bedrock[_]+this.soil[_];this.concrete[_]=Math.max(.5,y-w),this.targetConcrete[_]=this.concrete[_],this.formworkWall[_]=0,this.buildProgress[_]=1,this.linedMask[_]=1,this.earthDamMask[_]=0}let m=this.gridToWorld(a,l),x=W(Math.round(a+c.dx*3),1,this.grid-2),S=W(Math.round(l+c.dz*3),1,this.grid-2),M=this.bedrock[S*this.grid+x]+this.soil[S*this.grid+x],b={id:this.nextStructId++,kind:"spillway",gx:a,gz:l,wx:m.wx,wz:m.wz,dirX:c.dx,dirZ:c.dz,yaw:c.yaw,sillElev:y,crestElev:g,downBedY:M,wallHeight:p,openRatio:.35,autoRegulate:!0,targetHeadElev:g-1.2*L.elevScale,currentFlowQ:0,jetSpeed:0,cells:d};return this.spillways.push(b),this._syncSpillwayGateCells(b),this._activateArea(a-3,l-3,a+3,l+3),this.engineeredDirty=!0,{ok:!0,cost:4400,structure:b}}_syncSpillwayGateCells(t){let e=(1-W(t.openRatio,0,1))*t.wallHeight;for(let i=0;i<t.cells.length;i++){let n=t.cells[i];this.gateWall[n]=e,this.zb[n]=this.bedrock[n]+this.soil[n]+Math.max(this.concrete[n],this.formworkWall[n])+e}this.markTerrainDirty(t.gx-2,t.gz-2,t.gx+2,t.gz+2)}placeTurbine(t,e,i,n,s,o=!1){let a=vr[t];if(!a)return{ok:!1,reason:"\u041D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u044B\u0439 \u0442\u0438\u043F \u0442\u0443\u0440\u0431\u0438\u043D\u044B"};if(!o&&s<a.cost)return{ok:!1,reason:`\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0441\u0440\u0435\u0434\u0441\u0442\u0432 (\u043D\u0443\u0436\u043D\u043E ${a.cost.toLocaleString("ru-RU")} \u20BD)`};let{gx:l,gz:c}=this.worldToGrid(e,i);if(l<5||l>this.grid-6||c<5||c>this.grid-6)return{ok:!1,reason:"\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u0431\u043B\u0438\u0437\u043A\u043E \u043A \u0433\u0440\u0430\u043D\u0438\u0446\u0435 \u0431\u0430\u0441\u0441\u0435\u0439\u043D\u0430"};for(let B of this.turbines)if(Math.hypot(B.gx-l,B.gz-c)<3)return{ok:!1,reason:"\u0417\u0434\u0435\u0441\u044C \u0443\u0436\u0435 \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D \u0433\u0438\u0434\u0440\u043E\u0430\u0433\u0440\u0435\u0433\u0430\u0442"};for(let B of this.spillways)if(Math.hypot(B.gx-l,B.gz-c)<2.8)return{ok:!1,reason:"\u041C\u0435\u0441\u0442\u043E \u0437\u0430\u043D\u044F\u0442\u043E \u0432\u043E\u0434\u043E\u0441\u0431\u0440\u043E\u0441\u043E\u043C"};let h=this.detectHydraulicDirection(l,c,n),u=W(Math.round(15*L.horizScale/this.dx),3,5),d=W(Math.round(l-h.dx*u),2,this.grid-3),f=W(Math.round(c-h.dz*u),2,this.grid-3),g=W(Math.round(l+h.dx*u),2,this.grid-3),y=W(Math.round(c+h.dz*u),2,this.grid-3),p=c*this.grid+l,m=this.bedrock[p]+this.soil[p],x=0;for(let B=-2;B<=2;B++)for(let G=-2;G<=2;G++){let Q=W(c+B,0,this.grid-1)*this.grid+W(l+G,0,this.grid-1),F=Math.max(this.concrete[Q],this.targetConcrete[Q]);F>1.2&&(x=Math.max(x,this.bedrock[Q]+this.soil[Q]+F))}let S=x>m+1.5?x:m+5.8*L.elevScale,M=[],b=-h.dz,_=h.dx;for(let B=-1;B<=1;B++){let G=W(Math.round(l+b*B),1,this.grid-2),F=W(Math.round(c+_*B),1,this.grid-2)*this.grid+G,$=this.bedrock[F]+this.soil[F];if($>S+2)continue;let K=this.concrete[F],at=Math.max(K,Math.max(.6,S-$));this.concrete[F]=at,this.targetConcrete[F]=Math.max(this.targetConcrete[F],at),this.formworkWall[F]=0,this.buildProgress[F]=1,this.linedMask[F]=1,this.earthDamMask[F]=0,M.push({i:F,prevConcrete:K})}for(let B=-1;B<=1;B++)for(let G=-1;G<=1;G++){let Q=(f+B)*this.grid+(d+G),F=(y+B)*this.grid+(g+G);(this.concrete[Q]>0||this.targetConcrete[Q]>0)&&(M.push({i:Q,prevConcrete:this.concrete[Q]}),this.concrete[Q]=0,this.targetConcrete[Q]=0,this.formworkWall[Q]=0),(this.concrete[F]>0||this.targetConcrete[F]>0)&&(M.push({i:F,prevConcrete:this.concrete[F]}),this.concrete[F]=0,this.targetConcrete[F]=0,this.formworkWall[F]=0),this.linedMask[Q]=1,this.linedMask[F]=1}let w=this.gridToWorld(l,c),v=this.gridToWorld(d,f),T=this.gridToWorld(g,y),C=this.bedrock[f*this.grid+d]+this.soil[f*this.grid+d],R=this.bedrock[y*this.grid+g]+this.soil[y*this.grid+g],P=w.wx+h.dx*(this.dx*(u*.58)),N=w.wz+h.dz*(this.dx*(u*.58)),I=Math.min(m,R),U={id:this.nextStructId++,kind:"turbine",type:t,spec:a,gx:l,gz:c,wx:w.wx,wz:w.wz,hallWx:P,hallWz:N,hallBaseY:I,crestY:S,baseY:m,dirX:h.dx,dirZ:h.dz,yaw:h.yaw,intakeGx:d,intakeGz:f,intakeWx:v.wx,intakeWz:v.wz,intakeBedY:C,outfallGx:g,outfallGz:y,outfallWx:T.wx,outfallWz:T.wz,outfallBedY:R,bodyCells:M,throttle:1,autoDispatch:!1,pumpedStorage:t==="pelton",isPumpingNow:!1,pumpConsumeMW:0,grossHead:0,netHead:0,flowQ:0,efficiency:0,powerMW:0,cavitation:0,trashLoad:0,condition:1,rotorPhase:0};return this.turbines.push(U),this.recomputeZbRange(Math.min(l,d,g)-2,Math.min(c,f,y)-2,Math.max(l,d,g)+2,Math.max(c,f,y)+2),this._activateArea(Math.min(l,d,g)-2,Math.min(c,f,y)-2,Math.max(l,d,g)+2,Math.max(c,f,y)+2),this.engineeredDirty=!0,{ok:!0,cost:a.cost,structure:U}}demolishAt(t,e){let{gx:i,gz:n}=this.worldToGrid(t,e),s=this.turbines.findIndex(u=>Math.hypot(u.gx-i,u.gz-n)<=2.6||Math.hypot(u.hallWx-t,u.hallWz-e)<=2.2*this.dx);if(s>=0){let u=this.turbines[s];for(let d of u.bodyCells)this.concrete[d.i]=d.prevConcrete,this.targetConcrete[d.i]=d.prevConcrete,this.formworkWall[d.i]=0;return this.turbines.splice(s,1),this.recomputeZbRange(u.gx-3,u.gz-3,u.gx+3,u.gz+3),this.engineeredDirty=!0,{removed:"turbine",refund:Math.round(u.spec.cost*.45)}}let o=this.spillways.findIndex(u=>Math.hypot(u.gx-i,u.gz-n)<=2.6);if(o>=0){let u=this.spillways[o];for(let d of u.cells)this.gateWall[d]=0,this.concrete[d]=0,this.targetConcrete[d]=0,this.formworkWall[d]=0;return this.spillways.splice(o,1),this.recomputeZbRange(u.gx-2,u.gz-2,u.gx+2,u.gz+2),this.engineeredDirty=!0,{removed:"spillway",refund:1900}}let a=this.navLocks.findIndex(u=>Math.hypot(u.gx-i,u.gz-n)<=2.8);if(a>=0)return this.navLocks.splice(a,1),this.engineeredDirty=!0,{removed:"nav_lock",refund:Math.round(Ee.navLockCost*.45)};let l=this.fishFarms.findIndex(u=>Math.hypot(u.gx-i,u.gz-n)<=2.8);if(l>=0)return this.fishFarms.splice(l,1),this.engineeredDirty=!0,{removed:"fish_farm",refund:Math.round(Ee.fishEcoCost*.45)};let c=this.substations.findIndex(u=>Math.hypot(u.gx-i,u.gz-n)<=2.8);if(c>=0)return this.substations.splice(c,1),this.engineeredDirty=!0,{removed:"substation",refund:Math.round(Ee.substationCost*.45)};let h=0;for(let u=-1;u<=1;u++)for(let d=-1;d<=1;d++){let f=W(i+d,1,this.grid-2),y=W(n+u,1,this.grid-2)*this.grid+f;(this.concrete[y]>0||this.targetConcrete[y]>0||this.foundationMask[y])&&(h+=Math.max(this.concrete[y],this.targetConcrete[y])+1,this.concrete[y]=Math.max(0,this.concrete[y]-5*L.elevScale),this.targetConcrete[y]=this.concrete[y],this.formworkWall[y]=0,this.buildProgress[y]=1,this.concrete[y]<=.1&&this.foundationMask[y]&&(this.foundationMask[y]=0,this.reinforcedCellCount=Math.max(0,this.reinforcedCellCount-1))),this.linedMask[y]=0}return h>0?(this.recomputeZbRange(i-2,n-2,i+2,n+2),this.engineeredDirty=!0,{removed:"concrete",refund:0}):{removed:null,refund:0}}findStructureNear(t,e,i=null){let n=i!==null?i:Math.max(16,this.dx*3.2),s=null,o=n;for(let a of this.turbines){let l=Math.min(Math.hypot(a.wx-t,a.wz-e),Math.hypot(a.hallWx-t,a.hallWz-e));l<o&&(o=l,s=a)}for(let a of this.spillways){let l=Math.hypot(a.wx-t,a.wz-e);l<o&&(o=l,s=a)}return s}step(t,e=8){let i=typeof performance<"u"?performance.now():Date.now();this.jetEmitters.length=0;let n=W(t,.001,.16);this.activeBuildCells.length>0&&this._stepConstructionQueue(n),this._rebuildActiveTiles();let s=6.5*Math.sqrt(L.elevScale),o=this.grid;for(let d=0;d<this.activeTileCount;d++){let f=this.activeTiles[d],g=f%this.tilesN*Bt,y=Math.floor(f/this.tilesN)*Bt,p=Math.min(o,g+Bt),m=Math.min(o,y+Bt);for(let x=y;x<m;x+=2){let S=x*o;for(let M=g;M<p;M+=2){let b=S+M,_=this.h[b];if(_>.02){let w=Math.abs(this.u[b])+Math.abs(this.v[b])+Math.sqrt(Le*_);w>s&&(s=w)}}}}let a=.43*this.dx/s,l=W(Math.ceil(n/a),1,e),c=Math.min(n/l,a);this._accumMouthVol=0,this._accumRainVol=0,this._accumInflowVol=0,this._accumPumpVol=0,this._accumPumpMW=0;for(let d=0;d<l;d++)this._substep(c);let h=Math.max(1e-4,c*l);this.lastMouthOutflowQ=this._accumMouthVol/h,this.lastRainAddedQ=this._accumRainVol/h,this.lastRiverInflowQ=this._accumInflowVol/h,this.lastPumpedUpQ=this._accumPumpVol/h,this.lastPumpedConsumeMW=this._accumPumpMW/l,this._stepSecondaryTransportAndErosion(h),this._erosionTick%2===0&&this._detectCrestOverflows(),this.lastSubsteps=l;let u=typeof performance<"u"?performance.now():Date.now();this.lastStepMs=u-i}_detectCrestOverflows(){let t=this.grid,e=[],i=1.65*L.elevScale,n=0;for(let s=0;s<this.activeTileCount;s++){let o=this.activeTiles[s],a=Math.max(2,o%this.tilesN*Bt),l=Math.max(2,Math.floor(o/this.tilesN)*Bt),c=Math.min(t-2,o%this.tilesN*Bt+Bt),h=Math.min(t-2,Math.floor(o/this.tilesN)*Bt+Bt);for(let u=l;u<h;u++){let d=u*t;for(let f=a;f<c;f++){let g=d+f,y=this.h[g];if(y<.08||!(this.concrete[g]>1.2||this.formworkWall[g]>1.2||this.earthDamMask[g]===1)&&y<.35)continue;let m=this.zb[g],x=m+y,S=0,M=0,b=0,_=m,w=(v,T,C)=>{let R=this.zb[v]+this.h[v],P=m-this.zb[v],N=x-R;P>i&&N>i*.75&&P>S&&(S=P,M=T,b=C,_=R)};if(w(g+t,0,1),w(g-t,0,-1),w(g+1,1,0),w(g-1,-1,0),S>i){let v=.385*this.dx*Math.sqrt(2*Le)*Math.pow(y,1.5);n+=v;let T=(u+b)*t+(f+M);if(this.foam[T]=Math.min(1,this.foam[T]+.65),e.length<280){let C=this.gridToWorld(f,u);e.push({wx:C.wx+M*this.dx*.42,wz:C.wz+b*this.dx*.42,crestY:x-.1,toeY:_,dropH:Math.max(1.8,x-_),dirX:M,dirZ:b,yaw:Math.atan2(b,M),width:this.dx*1.12,headH:y}),e.length%3===0&&this.jetEmitters.push({wx:C.wx+M*this.dx*.6,wy:m+y*.3,wz:C.wz+b*this.dx*.6,vx:M*(2.6+Math.sqrt(Le*y)*.9),vy:.4,vz:b*(2.6+Math.sqrt(Le*y)*.9),intensity:W(y/1.5,.25,1.4),kind:"spillway"})}}}}}this.overflowEdges=e,this.lastCrestOverflowQ=n}_stepConstructionQueue(t){let e=this.grid,i=this.activeBuildCells.length;if(i===0){this.pendingPourVolumeM3=0,this.activeBuildSites.length=0;return}let n=Ee.pourRateM3PerSec/this.volPriceNorm,s=Math.max(.95*L.elevScale*t,n*t/(Math.min(i,28)*this.cellArea)),o=e,a=e,l=-1,c=-1,h=0,u=[],d=[];for(let f=0;f<i;f++){let g=this.activeBuildCells[f],y=this.targetConcrete[g],p=this.concrete[g];if(y<=p+.01){this.concrete[g]=y,this.formworkWall[g]=0,this.buildProgress[g]=1,this.activeBuildSet[g]=0;continue}let m=g%e,x=g/e|0,M=(this.h[g]>.6?Math.hypot(this.u[g],this.v[g]):0)>3.5*Math.sqrt(L.elevScale)?.45:1;p=Math.min(y,p+s*M),this.concrete[g]=p;let b=W(p/Math.max(.4,y),.05,1);if(this.buildProgress[g]=b,p>=y-.015)this.concrete[g]=y,this.formworkWall[g]=0,this.buildProgress[g]=1,this.activeBuildSet[g]=0;else if(this.formworkWall[g]=Math.max(p,this.formworkWall[g]),u.push(g),h+=(y-p)*this.cellArea,d.length<6&&f%Math.max(1,Math.floor(i/4))===0){let w=this.gridToWorld(m,x);d.push({wx:w.wx,wz:w.wz,wy:this.bedrock[g]+this.soil[g]+Math.max(p,this.formworkWall[g]),progress:b})}let _=Math.max(this.concrete[g],this.formworkWall[g]);this.zb[g]=this.bedrock[g]+this.soil[g]+_+this.gateWall[g],m<o&&(o=m),x<a&&(a=x),m>l&&(l=m),x>c&&(c=x)}this.activeBuildCells=u,this.activeBuildSites=d,this.pendingPourVolumeM3=h,this.engineeredDirty=!0,l>=o&&this.markTerrainDirty(o,a,l,c)}_activateArea(t,e,i,n){let s=W(Math.floor(t/Bt)-1,0,this.tilesN-1),o=W(Math.floor(e/Bt)-1,0,this.tilesN-1),a=W(Math.floor(i/Bt)+1,0,this.tilesN-1),l=W(Math.floor(n/Bt)+1,0,this.tilesN-1);for(let c=o;c<=l;c++)for(let h=s;h<=a;h++)this.tileWet[c*this.tilesN+h]=1}_rebuildActiveTiles(){let t=this.grid,e=this.tilesN;this.tileWet.fill(0);let i=0,n=0,s=0;for(let a=0;a<e;a++){let l=a*Bt,c=Math.min(t,l+Bt);for(let h=0;h<e;h++){let u=h*Bt,d=Math.min(t,u+Bt),f=!1;for(let g=l;g<c;g++){let y=g*t;for(let p=u;p<d;p++){let m=y+p,x=this.h[m];x>.002&&(f=!0,i+=x,x>.05&&(n++,s+=this.sediment[m]))}}if(f||this.rainRate>0)for(let g=-1;g<=1;g++){let y=a+g;if(!(y<0||y>=e))for(let p=-1;p<=1;p++){let m=h+p;m<0||m>=e||(this.tileWet[y*e+m]=1)}}}}this._activateArea(0,0,t-1,6),this._activateArea(0,Math.floor(t*.55),6,Math.floor(t*.72));for(let a=0;a<this.turbines.length;a++){let l=this.turbines[a];this._activateArea(Math.min(l.intakeGx,l.outfallGx)-2,Math.min(l.intakeGz,l.outfallGz)-2,Math.max(l.intakeGx,l.outfallGx)+2,Math.max(l.intakeGz,l.outfallGz)+2)}let o=0;for(let a=0;a<this.totalTiles;a++)this.tileWet[a]&&(this.activeTiles[o++]=a);this.activeTileCount=o,this.wetCellCount=n,this.meanReservoirTurbidity=n>0?s/n:.04,this.totalWaterVolumeM3=i*this.cellArea}_substep(t){this.simTime+=t;let e=this.grid,i=1/this.dx,n=this.maxFlowSpeed,{h:s,hu:o,hv:a,zb:l,u:c,v:h,dH:u,dHU:d,dHV:f}=this;this._applyRiverBoundariesAndRain(t),this._stepTurbinesAndSpillways(t);for(let g=0;g<this.activeTileCount;g++){let y=this.activeTiles[g],p=y%this.tilesN*Bt,m=Math.floor(y/this.tilesN)*Bt,x=Math.min(e,p+Bt),S=Math.min(e,m+Bt);for(let M=m;M<S;M++){let b=M*e;for(let _=p;_<x;_++){let w=b+_;u[w]=0,d[w]=0,f[w]=0}}}for(let g=0;g<this.activeTileCount;g++){let y=this.activeTiles[g],p=Math.max(0,y%this.tilesN*Bt),m=Math.max(0,Math.floor(y/this.tilesN)*Bt),x=Math.min(e-1,p+Bt),S=Math.min(e-1,m+Bt);for(let M=m;M<S;M++){let b=M*e;for(let _=p;_<x;_++){let w=b+_;{let v=w+1,T=s[w],C=s[v];if(T>1e-5||C>1e-5){let R=l[w],P=l[v],N=R>P?R:P,I=Math.max(0,R+T-N),U=Math.max(0,P+C-N);if(I>1e-6||U>1e-6){let B=c[w],G=h[w],Q=c[v],F=h[v],$=I*B,K=I*G,at=U*Q,rt=U*F,It=Math.abs(B)+Math.sqrt(Le*I),ut=Math.abs(Q)+Math.sqrt(Le*U),Pt=It>ut?It:ut,q=.5*Le*I*I,Z=.5*Le*U*U,ct=.5*($+at-Pt*(U-I)),vt=.5*($*B+q+at*Q+Z-Pt*(at-$)),lt=.5*($*G+at*F-Pt*(rt-K)),Ht=.5*Le*(T*T-I*I),fe=.5*Le*(C*C-U*U);_>=1&&(u[w]-=ct*i,d[w]-=(vt-Ht)*i,f[w]-=lt*i),_+1<e-1&&(u[v]+=ct*i,d[v]+=(vt-fe)*i,f[v]+=lt*i)}}}{let v=w+e,T=s[w],C=s[v];if(T>1e-5||C>1e-5){let R=l[w],P=l[v],N=R>P?R:P,I=Math.max(0,R+T-N),U=Math.max(0,P+C-N);if(I>1e-6||U>1e-6){let B=c[w],G=h[w],Q=c[v],F=h[v],$=I*B,K=I*G,at=U*Q,rt=U*F,It=Math.abs(G)+Math.sqrt(Le*I),ut=Math.abs(F)+Math.sqrt(Le*U),Pt=It>ut?It:ut,q=.5*Le*I*I,Z=.5*Le*U*U,ct=.5*(K+rt-Pt*(U-I)),vt=.5*($*G+at*F-Pt*(at-$)),lt=.5*(K*G+q+rt*F+Z-Pt*(rt-K)),Ht=.5*Le*(T*T-I*I),fe=.5*Le*(C*C-U*U);M>=1&&(u[w]-=ct*i,d[w]-=vt*i,f[w]-=(lt-Ht)*i),M+1<e-1&&(u[v]+=ct*i,d[v]+=vt*i,f[v]+=(lt-fe)*i)}}}}}}for(let g=0;g<this.activeTileCount;g++){let y=this.activeTiles[g],p=Math.max(1,y%this.tilesN*Bt),m=Math.max(1,Math.floor(y/this.tilesN)*Bt),x=Math.min(e-1,y%this.tilesN*Bt+Bt),S=Math.min(e-1,Math.floor(y/this.tilesN)*Bt+Bt);for(let M=m;M<S;M++){let b=M*e;for(let _=p;_<x;_++){let w=b+_,v=s[w]+t*u[w];if(v<=1e-4){s[w]=0,o[w]=0,a[w]=0,c[w]=0,h[w]=0;continue}let T=o[w]+t*d[w],C=a[w]+t*f[w],R=v*v,P=R*R,N=Math.sqrt(P+(Od>P?Od:P)),I=Math.SQRT2*v/N,U=T*I,B=C*I,G=Math.hypot(U,B);if(G>1e-4){let Q=this.linedMask[w]?.012:this.soil[w]<.5?.029:.036,F=Le*Q*Q/Math.pow(Math.max(.08,v),1.3333),$=1/(1+t*F*G);U*=$,B*=$;let K=G*$;if(K>n){let at=n/K;U*=at,B*=at}}s[w]=v,c[w]=U,h[w]=B,o[w]=v*U,a[w]=v*B}}}this._applyVorticityConfinement(t)}_applyRiverBoundariesAndRain(t){let e=this.grid,i=bi[this.presetId]||bi.bystritsa,n=In(this.presetId),s=this.dx*1.6,o=n.main[0],a=this.worldToGrid(o.x,o.z+s),l=i.mainInflowQ*this.inflowMult+this.currentSnowmeltBonusQ*.7;this._injectSpring(a.gx,a.gz,2,l,.42,.91,t);let c=n.eastCreek[0],h=this.worldToGrid(c.x,c.z+s),u=i.creekInflowQ*this.inflowMult+this.currentSnowmeltBonusQ*.3;this._injectSpring(h.gx,h.gz,2,u,-.68,.73,t);let d=n.westCreek[0],f=this.worldToGrid(d.x+s,d.z),g=i.westCreekQ*this.inflowMult;if(this._injectSpring(f.gx,f.gz,2,g,.92,.38,t),this._accumInflowVol+=(i.mainInflowQ+i.creekInflowQ+i.westCreekQ)*this.inflowMult*t,this.rainRate>0){let S=this.rainRate*L.elevScale*t,M=(this.simTime*60|0)&3,b=M&1,_=M>>1&1,w=0;for(let v=2+_;v<e-2;v+=2){let T=v*e;for(let C=2+b;C<e-2;C+=2)this.h[T+C]+=S*4,w++}this._accumRainVol+=w*(S*4)*this.cellArea}let y=(e-2)*e,p=(e-1)*e,m=6.15*L.elevScale,x=0;for(let S=1;S<e-1;S++){let M=y+S,b=this.zb[M];if(this.h[M]>.01){let _=Math.max(0,m-b);if(this.h[M]>_){let w=this.h[M]-_,v=Math.max(this.v[M],Math.sqrt(Le*this.h[M])*.72),T=Math.min(w,v*this.h[M]*t/this.dx);this.h[M]=Math.max(_,this.h[M]-T),x+=T*this.cellArea,this.v[M]=Math.max(this.v[M],v*.65),this.hv[M]=this.h[M]*this.v[M]}}this.h[p+S]=this.h[M]*.85,this.hu[p+S]=0,this.hv[p+S]=0}this._accumMouthVol+=x;for(let S=0;S<e;S++)this.hu[S*e+1]=Math.max(0,this.hu[S*e+1]),this.hu[S*e+(e-2)]=Math.min(0,this.hu[S*e+(e-2)]),this.hv[1*e+S]=Math.max(0,this.hv[1*e+S])}_injectSpring(t,e,i,n,s,o,a){let l=0;for(let u=-i;u<=i;u++)for(let d=-i;d<=i;d++)d*d+u*u<=i*i+1&&l++;if(!l)return;let c=n*a/(l*this.cellArea),h=2.5*Math.pow(L.elevScale,.35);for(let u=-i;u<=i;u++)for(let d=-i;d<=i;d++){if(d*d+u*u>i*i+1)continue;let f=W(t+d,1,this.grid-2),y=W(e+u,1,this.grid-2)*this.grid+f;this.h[y]+=c,this.hu[y]+=c*s*h,this.hv[y]+=c*o*h;let p=this.h[y];this.u[y]=this.hu[y]/p,this.v[y]=this.hv[y]/p}}_stepTurbinesAndSpillways(t){let e=this.grid,i=this.maxFlowSpeed;for(let n=0;n<this.spillways.length;n++){let s=this.spillways[n],o=W(Math.round(s.gx-s.dirX*3),1,e-2),l=W(Math.round(s.gz-s.dirZ*3),1,e-2)*e+o,c=this.zb[l]+this.h[l];if(s.autoRegulate){let d=(c-s.targetHeadElev)/L.elevScale,f=W(.08+d*.28,0,1);Math.abs(f-s.openRatio)>.015&&(s.openRatio=$t(s.openRatio,f,W(t*2.5,0,1)),this._syncSpillwayGateCells(s))}let h=0,u=0;for(let d=0;d<s.cells.length;d++){let f=s.cells[d],g=this.h[f];if(g>.03){let y=Math.max(0,this.u[f]*s.dirX+this.v[f]*s.dirZ);h+=g*y*(this.dx/3),y>u&&(u=y),this.foam[f]=Math.min(1,this.foam[f]+.42)}}if(s.currentFlowQ=h,s.jetSpeed=u,h>1.2*L.flowScale*.2&&s.openRatio>.04){let d=s.gz*e+s.gx;this.jetEmitters.push({wx:s.wx+s.dirX*this.dx*1.1,wy:this.zb[d]+Math.max(.4,this.h[d]*.6),wz:s.wz+s.dirZ*this.dx*1.1,vx:s.dirX*Math.max(5.2,u*1.25),vy:1.5+u*.14,vz:s.dirZ*Math.max(5.2,u*1.25),intensity:W(h/(35*L.flowScale),.25,1.9),kind:"spillway"})}}for(let n=0;n<this.turbines.length;n++){let s=this.turbines[n],o=s.spec;s.isPumpingNow=!1,s.pumpConsumeMW=0;let a=0,l=0,c=0,h=0;for(let K=-1;K<=1;K++)for(let at=-1;at<=1;at++){let rt=(s.intakeGz+K)*e+(s.intakeGx+at),It=this.h[rt];It>.12&&(a+=this.zb[rt]+It,l++,c+=(It-.08)*this.cellArea,h+=this.sediment[rt])}let u=0,d=0,f=0;for(let K=-1;K<=1;K++)for(let at=-1;at<=1;at++){let rt=(s.outfallGz+K)*e+(s.outfallGx+at);u+=this.zb[rt]+this.h[rt],d++,this.h[rt]>.25&&(f+=(this.h[rt]-.2)*this.cellArea)}let g=l>0?a/l:s.intakeBedY,y=u/(d||1),p=Math.max(0,g-y);if(s.grossHead=p,s.pumpedStorage&&o.reversible&&this.isOffPeakNight&&f>2*this.cellArea&&p<o.maxHead*.92){let K=Math.max(3*L.elevScale,p),at=Math.min(o.maxArea*2.1*Math.sqrt(Le*L.elevScale),f*.25/t),rt=kd*Le*at*K/.84*1e-6,It=at*t,ut=0;for(let q=-1;q<=1;q++)for(let Z=-1;Z<=1;Z++){let ct=(s.outfallGz+q)*e+(s.outfallGx+Z);if(this.h[ct]>.25){let vt=Math.min(this.h[ct]-.2,It/9/this.cellArea);this.h[ct]-=vt,ut+=vt*this.cellArea}}let Pt=ut/(9*this.cellArea);for(let q=-1;q<=1;q++)for(let Z=-1;Z<=1;Z++){let ct=(s.intakeGz+q)*e+(s.intakeGx+Z);this.h[ct]+=Pt}s.isPumpingNow=!0,s.pumpConsumeMW=rt,s.flowQ=-at,s.powerMW=0,s.efficiency=.84,s.rotorPhase=(s.rotorPhase-t*5.2)%(Math.PI*2),this._accumPumpVol+=ut,this._accumPumpMW+=rt;continue}if(l===0||c<=.05||s.throttle<=.005){s.netHead=0,s.flowQ=0,s.efficiency=0,s.powerMW=0,s.cavitation=0;continue}let m=h/l;if(s.autoDispatch?s.trashLoad=Math.max(0,s.trashLoad-t*.02):m>.25&&(s.trashLoad=Math.min(.28,s.trashLoad+(m-.25)*.004*t)),p<o.minHead*.45){s.netHead=p,s.flowQ=0,s.efficiency=0,s.powerMW=0,s.cavitation=0;continue}let x=1-s.trashLoad,S=W((p-o.minHead*.35)/(o.optHead*.55),.14,1),M=s.throttle*S*x*o.maxArea*Math.sqrt(2*Le*p),b=c*.42/t,_=Math.min(M,b),w=o.frictionK*_*_+s.trashLoad*1.4*L.elevScale,v=Math.max(0,p-w),T=(v-o.optHead)/o.headSigma,C=Math.exp(-.55*T*T),R=s.throttle<.28?.55+s.throttle/.28*.45:1,P=.65+.35*s.condition,N=W(o.peakEta*C*R*P,.18,o.peakEta),I=v>o.maxHead?(v-o.maxHead)/(15*L.elevScale):v<o.minHead?(o.minHead-v)/(6*L.elevScale):0;s.cavitation=W(I,0,1);let U=kd*Le*_*v*N*1e-6,B=Math.min(o.ratedMW*1.18,U);s.netHead=v,s.flowQ=_,s.efficiency=N,s.powerMW=B,s.rotorPhase=(s.rotorPhase+t*(2.6+B/L.powerScale*1.35))%(Math.PI*2);let G=_*t,Q=0;for(let K=-1;K<=1;K++)for(let at=-1;at<=1;at++){let rt=(s.intakeGz+K)*e+(s.intakeGx+at),It=this.h[rt];if(It>.12){let ut=(It-.08)*this.cellArea/c,Pt=Math.min(It-.05,G*ut/this.cellArea);this.h[rt]-=Pt,this.hu[rt]=this.h[rt]*this.u[rt],this.hv[rt]=this.h[rt]*this.v[rt],Q+=Pt*this.cellArea}}let F=Q/(9*this.cellArea),$=W(2.2+Math.sqrt(2*Le*Math.max(.5,v))*.22,2,i*.45);for(let K=-1;K<=1;K++)for(let at=-1;at<=1;at++){let rt=(s.outfallGz+K)*e+(s.outfallGx+at);this.h[rt]+=F,this.hu[rt]+=F*s.dirX*$,this.hv[rt]+=F*s.dirZ*$;let It=this.h[rt];It>1e-4&&(this.u[rt]=W(this.hu[rt]/It,-i,i),this.v[rt]=W(this.hv[rt]/It,-i,i),this.hu[rt]=It*this.u[rt],this.hv[rt]=It*this.v[rt]),this.foam[rt]=Math.min(1,this.foam[rt]+.45)}if(_>2.5*L.flowScale*.25){let K=s.outfallGz*e+s.outfallGx;this.jetEmitters.push({wx:s.outfallWx,wy:this.zb[K]+this.h[K]+.2,wz:s.outfallWz,vx:s.dirX*$*.75,vy:1.15,vz:s.dirZ*$*.75,intensity:W(B/L.powerScale/8,.2,1.35),kind:"tailrace"})}}}_applyVorticityConfinement(t){let e=this.grid,i=.5/this.dx,n=this.maxFlowSpeed,{h:s,u:o,v:a,hu:l,hv:c,vort:h}=this;for(let d=0;d<this.activeTileCount;d++){let f=this.activeTiles[d],g=Math.max(2,f%this.tilesN*Bt),y=Math.max(2,Math.floor(f/this.tilesN)*Bt),p=Math.min(e-2,f%this.tilesN*Bt+Bt),m=Math.min(e-2,Math.floor(f/this.tilesN)*Bt+Bt);for(let x=y;x<m;x++){let S=x*e;for(let M=g;M<p;M++){let b=S+M;if(s[b]<.18){h[b]=0;continue}let _=(a[b+1]-a[b-1])*i,w=(o[b+e]-o[b-e])*i;h[b]=_-w}}}let u=.34*this.dx*t;for(let d=0;d<this.activeTileCount;d++){let f=this.activeTiles[d],g=Math.max(2,f%this.tilesN*Bt),y=Math.max(2,Math.floor(f/this.tilesN)*Bt),p=Math.min(e-2,f%this.tilesN*Bt+Bt),m=Math.min(e-2,Math.floor(f/this.tilesN)*Bt+Bt);for(let x=y;x<m;x++){let S=x*e;for(let M=g;M<p;M++){let b=S+M,_=s[b],w=h[b];if(_<.25||Math.abs(w)<.015)continue;let v=Math.abs(h[b+1])-Math.abs(h[b-1]),T=Math.abs(h[b+e])-Math.abs(h[b-e]),C=Math.hypot(v,T)+1e-5,R=v/C,P=T/C,N=u*P*w,I=-u*R*w;o[b]=W(o[b]+N,-n,n),a[b]=W(a[b]+I,-n,n),l[b]=_*o[b],c[b]=_*a[b]}}}}_stepSecondaryTransportAndErosion(t){let e=this.grid,i=1/this.dx,{h:n,hu:s,hv:o,u:a,v:l,foam:c,foamNext:h,sediment:u,sedNext:d,wetness:f,soilSaturation:g}=this;this._erosionTick++;let y=this._erosionTick%3===0,p=this._erosionTick%6===0,m=e,x=e,S=-1,M=-1,b=0,_=0,w=0,v=this.currentEvapRateMps*t,T=38*L.elevScale;for(let C=0;C<this.activeTileCount;C++){let R=this.activeTiles[C],P=Math.max(1,R%this.tilesN*Bt),N=Math.max(1,Math.floor(R/this.tilesN)*Bt),I=Math.min(e-1,R%this.tilesN*Bt+Bt),U=Math.min(e-1,Math.floor(R/this.tilesN)*Bt+Bt);for(let B=N;B<U;B++){let G=B*e;for(let Q=P;Q<I;Q++){let F=G+Q,$=n[F];if($>.02){let Ot=v;if(this.linedMask[F]===0&&this.concrete[F]<.1&&g[F]<.995){let Qt=1-g[F],z=Math.min($*.12,Qt*85e-5*t);Ot+=z,w+=z*this.cellArea,g[F]=Math.min(1,g[F]+t*.045)}Ot>0&&$>Ot+.005&&($-=Ot,n[F]=$,s[F]=$*a[F],o[F]=$*l[F])}else g[F]>.25&&(g[F]=Math.max(.25,g[F]-t*.006));if(p&&this.concrete[F]>4.5*L.elevScale&&B>2&&B<e-3&&Q>2&&Q<e-3){let Ot=Math.max(n[F-e*2],n[F-2],n[F+2],n[F+e*2]);if(Ot>2.5*L.elevScale){let Qt=this.foundationMask[F]?T:Ee.maxUnreinforcedHead,z=W(Ot/Qt*100,0,125);if(z>b&&(b=z),!this.foundationMask[F]&&this.soil[F]>1*L.elevScale&&Ot>Ee.highDamHeadThreshold){let Ue=(Ot-Ee.highDamHeadThreshold)/L.elevScale*.09*L.flowScale;_+=Ue}}}let K=n[F-1]>.03||n[F+1]>.03||n[F-e]>.03||n[F+e]>.03;if($>.02||K?f[F]=Math.min(1,f[F]+t*2.5):f[F]>0&&(f[F]=Math.max(0,f[F]-t*.08)),$<=.015){h[F]=c[F]*.75,d[F]=u[F]*.85;continue}let at=W(Q-a[F]*t*i,.5,e-1.5),rt=W(B-l[F]*t*i,.5,e-1.5),It=at|0,ut=rt|0,Pt=at-It,q=rt-ut,Z=ut*e+It,ct=Z+1,vt=Z+e,lt=vt+1,Ht=$t($t(c[Z],c[ct],Pt),$t(c[vt],c[lt],Pt),q),fe=$t($t(u[Z],u[ct],Pt),$t(u[vt],u[lt],Pt),q),Wt=a[F]*a[F]+l[F]*l[F],ht=Math.sqrt(Wt),it=ht/Math.sqrt(Le*Math.max(.08,$)),Lt=(a[F+1]-a[F-1]+(l[F+e]-l[F-e]))*.5*i,jt=it>.95&&Lt<-.08?Math.min(.65,-Lt*.55*t*8):0,Yt=ht>3.6*Math.pow(L.elevScale,.35)?(ht-3.6)*.085*t:0;h[F]=W(Ht*Math.exp(-t*.7)+jt+Yt,0,1);let qt=fe*Math.exp(-t*.16);if(this.linedMask[F]===0&&this.concrete[F]<.05&&this.soil[F]>.02){let Ot=this.earthDamMask[F]===1,Qt=(Ot?1.85:4)*Math.pow(L.elevScale,.35);if(ht>Qt){let z=ht-Qt;if(qt=Math.min(1.5,qt+z*(Ot?.45:.14)*t),y){let Ue=Ot?.095:.008,pe=Math.min(this.soil[F],z*Ue*t*3);pe>.001&&(this.soil[F]-=pe,this.zb[F]=this.bedrock[F]+this.soil[F]+Math.max(this.concrete[F],this.formworkWall[F])+this.gateWall[F],Q<m&&(m=Q),B<x&&(x=B),Q>S&&(S=Q),B>M&&(M=B))}}}d[F]=qt}}}this.lastInfiltrationQ=$t(this.lastInfiltrationQ,w/Math.max(1e-4,t),.3),p&&(this.maxDamStress=$t(this.maxDamStress,b,.35),this.totalSeepageQ=$t(this.totalSeepageQ,_,.35));for(let C=0;C<this.activeTileCount;C++){let R=this.activeTiles[C],P=Math.max(1,R%this.tilesN*Bt),N=Math.max(1,Math.floor(R/this.tilesN)*Bt),I=Math.min(e-1,R%this.tilesN*Bt+Bt),U=Math.min(e-1,Math.floor(R/this.tilesN)*Bt+Bt);for(let B=N;B<U;B++){let G=B*e;for(let Q=P;Q<I;Q++){let F=G+Q;c[F]=h[F],u[F]=d[F]}}}S>=m&&this.markTerrainDirty(m,x,S,M)}_rebuildVelocitiesAll(){for(let t=0;t<this.count;t++){let e=this.h[t];e<=1e-4?(this.u[t]=0,this.v[t]=0,this.hu[t]=0,this.hv[t]=0):(this.u[t]=this.hu[t]/e,this.v[t]=this.hv[t]/e)}}};var Fa=class{constructor({step:t=1/30,maxSteps:e=4}={}){if(!Number.isFinite(t)||t<=0||t>1||!Number.isSafeInteger(e)||e<1)throw new Error("\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0435 \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u044B \u0447\u0430\u0441\u043E\u0432");this.step=t,this.maxSteps=e,this.accumulator=0,this.tick=0,this._advancing=!1}advance(t,e){if(!Number.isFinite(t)||t<0||!Number.isFinite(this.accumulator+t)||typeof e!="function")throw new Error("\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0439 \u0448\u0430\u0433 \u0447\u0430\u0441\u043E\u0432");if(this._advancing)throw new Error("\u0412\u043B\u043E\u0436\u0435\u043D\u043D\u044B\u0439 \u0432\u044B\u0437\u043E\u0432 \u0447\u0430\u0441\u043E\u0432");this.accumulator+=t;let i=0;this._advancing=!0;try{for(;this.accumulator+this.step*1e-9>=this.step&&i<this.maxSteps;)e(this.step,this.tick),this.accumulator=Math.max(0,this.accumulator-this.step),this.tick++,i++}finally{this._advancing=!1}return{steps:i,remaining:this.accumulator,tick:this.tick}}};var Ua=class{constructor(){this.reset()}reset(){this.inflowRiversQ=0,this.snowmeltQ=0,this.precipDirectQ=0,this.groundwaterBaseQ=0,this.pumpedReturnQ=0,this.evaporationQ=0,this.infiltrationQ=0,this.damSeepageQ=0,this.waterSupplyWithdrawQ=0,this.mouthOutflowQ=0,this.turbineWorkingQ=0,this.spillwayAndOverflowQ=0,this.cumArrivedM3=0,this.cumPrecipM3=0,this.cumSnowmeltM3=0,this.cumEvaporatedM3=0,this.cumInfiltratedM3=0,this.cumConsumedM3=0,this.cumMouthOutM3=0,this.cumTurbinePassedM3=0,this.cumSpilledM3=0,this.airTempC=18,this.mountainTempC=4,this.relHumidity=.55,this.windSpeedMs=4.5,this.vaporDeficitKPa=.85,this.wetSurfaceAreaM2=0,this.wetSurfaceHectares=0,this.evapMmPerDay=0,this.snowMeltVisualOffset=0,this.prevVolumeM3=0,this.dVdT=0}_satVaporPressureKPa(t){return .6108*Math.exp(17.27*t/(t+237.3))}step(t,e,i,n,s=1,o=!1){if(t<=0)return;let a=$e[n]||$e.normal,l=Math.sin((i-9.5)/24*Math.PI*2),c=W(Math.sin((i-6)/24*Math.PI*2),0,1);this.airTempC=a.baseTempC+6.4*l,this.mountainTempC=this.airTempC-11.5,this.relHumidity=W(a.relHumidity-.14*l,.2,.98),this.windSpeedMs=a.windSpeedMs*(.85+.3*c),this.wetSurfaceAreaM2=e.wetCellCount*e.cellArea,this.wetSurfaceHectares=this.wetSurfaceAreaM2/1e4;let h=this._satVaporPressureKPa(this.airTempC),u=h*this.relHumidity;this.vaporDeficitKPa=Math.max(.02,h-u),this.evapMmPerDay=(.42+.34*this.windSpeedMs)*this.vaporDeficitKPa*(.55+1.15*c);let d=this.evapMmPerDay*.001/L.dayLengthSec*2.4;this.evaporationQ=d*this.wetSurfaceAreaM2;let f=Math.max(0,this.mountainTempC+3.5*c);this.snowmeltQ=f*(3.2*L.flowScale)*(.35+.85*c),this.snowMeltVisualOffset=W((this.mountainTempC+2)*1.4,-6,16),this.groundwaterBaseQ=8.5*L.flowScale*(a.id==="low_water"?.85:1.12),this.precipDirectQ=e.lastRainAddedQ||0,this.inflowRiversQ=e.lastRiverInflowQ||0,this.infiltrationQ=e.lastInfiltrationQ||0,this.damSeepageQ=e.totalSeepageQ||0,this.mouthOutflowQ=e.lastMouthOutflowQ||0,this.pumpedReturnQ=e.lastPumpedUpQ||0;let g=0;for(let m=0;m<e.turbines.length;m++)e.turbines[m].flowQ>0&&(g+=e.turbines[m].flowQ);let y=e.lastCrestOverflowQ||0;for(let m=0;m<e.spillways.length;m++)y+=e.spillways[m].currentFlowQ||0;this.turbineWorkingQ=g,this.spillwayAndOverflowQ=y,this.waterSupplyWithdrawQ=(s*1.35+(o?6.8:0))*Math.pow(L.flowScale,.75),e.currentEvapRateMps=d,e.currentSnowmeltBonusQ=this.snowmeltQ+this.groundwaterBaseQ,e.currentWithdrawQ=this.waterSupplyWithdrawQ;let p=this.inflowRiversQ+this.snowmeltQ+this.groundwaterBaseQ+this.precipDirectQ;this.cumArrivedM3+=p*t,this.cumPrecipM3+=this.precipDirectQ*t,this.cumSnowmeltM3+=this.snowmeltQ*t,this.cumEvaporatedM3+=this.evaporationQ*t,this.cumInfiltratedM3+=(this.infiltrationQ+this.damSeepageQ)*t,this.cumConsumedM3+=this.waterSupplyWithdrawQ*t,this.cumMouthOutM3+=this.mouthOutflowQ*t,this.cumTurbinePassedM3+=this.turbineWorkingQ*t,this.cumSpilledM3+=this.spillwayAndOverflowQ*t,this.prevVolumeM3>0&&(this.dVdT=(e.totalWaterVolumeM3-this.prevVolumeM3)/Math.max(.05,t)),this.prevVolumeM3=e.totalWaterVolumeM3}getReport(t,e){let i=this.inflowRiversQ+this.snowmeltQ+this.groundwaterBaseQ+this.precipDirectQ,n=this.mouthOutflowQ+this.evaporationQ+this.infiltrationQ+this.damSeepageQ+this.waterSupplyWithdrawQ,s=Math.max(.01,this.turbineWorkingQ+this.spillwayAndOverflowQ),o=this.turbineWorkingQ+this.spillwayAndOverflowQ>.5?Math.round(this.turbineWorkingQ/s*100):0,a=(e%24+24)%24,l="";return this.precipDirectQ>5?l="\u0421\u0435\u0439\u0447\u0430\u0441 \u0446\u0438\u043A\u043B\u043E\u043D: \u043A\u0430\u043F\u043B\u0438 \u0434\u043E\u0436\u0434\u044F \u0434\u0430\u044E\u0442 \u043F\u0440\u044F\u043C\u043E\u0439 \u0441\u043A\u043B\u043E\u043D\u043E\u0432\u044B\u0439 \u0441\u0442\u043E\u043A \u0432 \u0440\u0435\u043A\u0438, \u0432\u043B\u0430\u0436\u043D\u043E\u0441\u0442\u044C \u0432\u044B\u0441\u043E\u043A\u0430\u044F \u2014 \u0438\u0441\u043F\u0430\u0440\u0435\u043D\u0438\u0435 \u0441 \u0437\u0435\u0440\u043A\u0430\u043B\u0430 \u043C\u0438\u043D\u0438\u043C\u0430\u043B\u044C\u043D\u043E.":a>=11&&a<=17.5?l="\u0414\u043D\u0435\u0432\u043D\u043E\u0439 \u043F\u0440\u043E\u0433\u0440\u0435\u0432: \u0441\u043E\u043B\u043D\u0446\u0435 \u0440\u0430\u0441\u0442\u0430\u043F\u043B\u0438\u0432\u0430\u0435\u0442 \u0433\u043E\u0440\u043D\u044B\u0435 \u0441\u043D\u0435\u0436\u043D\u0438\u043A\u0438 (+\u043F\u0440\u0438\u0442\u043E\u043A \u0441\u0432\u0435\u0440\u0445\u0443), \u043D\u043E \u043E\u0434\u043D\u043E\u0432\u0440\u0435\u043C\u0435\u043D\u043D\u043E \u0443\u0441\u0438\u043B\u0438\u0432\u0430\u0435\u0442 \u0438\u0441\u043F\u0430\u0440\u0435\u043D\u0438\u0435 \u0441 \u0448\u0438\u0440\u043E\u043A\u043E\u0433\u043E \u0437\u0435\u0440\u043A\u0430\u043B\u0430 \u0432\u043E\u0434\u043E\u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0430.":a>=0&&a<6?l="\u041D\u043E\u0447\u043D\u043E\u0435 \u043E\u0445\u043B\u0430\u0436\u0434\u0435\u043D\u0438\u0435: \u043B\u0435\u0434\u043D\u0438\u043A\u0438 \u0432 \u0433\u043E\u0440\u0430\u0445 \u043F\u043E\u0434\u043C\u0451\u0440\u0437\u043B\u0438, \u0438\u0441\u043F\u0430\u0440\u0435\u043D\u0438\u0435 \u0443\u043F\u0430\u043B\u043E \u2014 \u0438\u0434\u0435\u0430\u043B\u044C\u043D\u043E\u0435 \u043E\u043A\u043D\u043E \u0434\u043B\u044F \u043D\u0430\u043A\u043E\u043F\u043B\u0435\u043D\u0438\u044F \u0431\u044C\u0435\u0444\u0430 \u0438 \u0437\u0430\u043A\u0430\u0447\u043A\u0438 \u0413\u0410\u042D\u0421!":l="\u041F\u0438\u043A\u043E\u0432\u044B\u0435 \u0447\u0430\u0441\u044B \u044D\u043D\u0435\u0440\u0433\u043E\u0441\u0438\u0441\u0442\u0435\u043C\u044B: \u043D\u0430\u043A\u043E\u043F\u043B\u0435\u043D\u043D\u044B\u0439 \u043E\u0431\u044A\u0451\u043C \u0432\u043E\u0434\u043E\u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0430 \u0441\u0440\u0430\u0431\u0430\u0442\u044B\u0432\u0430\u0435\u0442\u0441\u044F \u0447\u0435\u0440\u0435\u0437 \u043D\u0430\u043F\u043E\u0440\u043D\u044B\u0435 \u0432\u043E\u0434\u043E\u0432\u043E\u0434\u044B \u0413\u042D\u0421 \u0434\u043B\u044F \u043C\u0430\u043A\u0441\u0438\u043C\u0443\u043C\u0430 \u0432\u044B\u0440\u0443\u0447\u043A\u0438.",{airTempC:this.airTempC,mountainTempC:this.mountainTempC,relHumidityPct:Math.round(this.relHumidity*100),windSpeedMs:this.windSpeedMs,evapMmPerDay:this.evapMmPerDay,wetAreaHa:this.wetSurfaceHectares,totalVolumeM3:t.totalWaterVolumeM3,netDeltaQ:i-n,hydroUtilizationPct:o,whenWhySummary:l,inTotalQ:i,inRiversQ:this.inflowRiversQ,inSnowmeltQ:this.snowmeltQ,inPrecipQ:this.precipDirectQ,inGroundwaterQ:this.groundwaterBaseQ,inPumpedGAESQ:this.pumpedReturnQ,outTotalQ:n,outMouthQ:this.mouthOutflowQ,outEvapQ:this.evaporationQ,outInfiltQ:this.infiltrationQ,outSeepageQ:this.damSeepageQ,outCitiesAgroQ:this.waterSupplyWithdrawQ,nodeTurbineQ:this.turbineWorkingQ,nodeSpillOverflowQ:this.spillwayAndOverflowQ,cumArrivedK:this.cumArrivedM3/1e3,cumPrecipK:this.cumPrecipM3/1e3,cumSnowmeltK:this.cumSnowmeltM3/1e3,cumEvaporatedK:this.cumEvaporatedM3/1e3,cumInfiltratedK:this.cumInfiltratedM3/1e3,cumConsumedK:this.cumConsumedM3/1e3,cumMouthOutK:this.cumMouthOutM3/1e3,cumTurbineK:this.cumTurbinePassedM3/1e3,cumSpilledK:this.cumSpilledM3/1e3}}};function Ni(r,t=4,e=!0){return r.wrapS=kn,r.wrapT=kn,r.magFilter=Ge,r.minFilter=$i,r.generateMipmaps=!0,r.anisotropy=t,e&&"colorSpace"in r&&(r.colorSpace=ni),r.needsUpdate=!0,r}function an(r,t=r){let e=document.createElement("canvas");return e.width=r,e.height=t,e}function Qe(r,t,e=17){let i=Math.sin(r*127.1+t*311.7+e*74.7)*43758.5453123;return i-Math.floor(i)}function Sr(r,t,e,i){let n=r*e,s=t*e,o=Math.floor(n),a=Math.floor(s),l=n-o,c=s-a,h=8,u=8;for(let d=-1;d<=1;d++)for(let f=-1;f<=1;f++){let g=((o+f)%e+e)%e,y=((a+d)%e+e)%e,p=f+.14+.72*Qe(g,y,i)-l,m=d+.14+.72*Qe(g,y,i+31)-c,x=Math.hypot(p,m);x<h?(u=h,h=x):x<u&&(u=x)}return{d1:h,edge:u-h}}function Hd(r=512){let t=new Uint8Array(r*r*4),e=Math.PI*2;for(let n=0;n<r;n++){let s=n/r;for(let o=0;o<r;o++){let a=o/r,l=e*(3*a+2*s),c=e*(-5*a+4*s)+1.1,h=e*(8*a-6*s)+2.4,u=e*(13*a+9*s)-.7,d=e*(-17*a-12*s)+1.9,f=e*(24*a-19*s)+.4,g=.3*Math.cos(l)*3+.22*Math.cos(c)*-5+.16*Math.cos(h)*8+.11*Math.cos(u)*13+.07*Math.cos(d)*-17+.045*Math.cos(f)*24,y=.3*Math.cos(l)*2+.22*Math.cos(c)*4+.16*Math.cos(h)*-6+.11*Math.cos(u)*9+.07*Math.cos(d)*-12+.045*Math.cos(f)*-19,p=Math.max(-1,Math.min(1,g*.21)),m=Math.max(-1,Math.min(1,y*.21)),x=Sr(a,s,8,11),S=Sr(a,s,16,43),M=Math.pow(Math.max(0,1-x.edge*2.55),3.6),b=Math.pow(Math.max(0,1-S.edge*2.85),4),_=Math.min(1,M*.76+b*.62),w=Sr(a,s,13,89),v=Sr(a,s,26,137),T=Math.pow(Math.max(0,1-w.edge*3.1),2.4),C=Math.pow(Math.max(0,1-v.d1*1.9),3),R=.5+.5*Math.sin(e*(6*a+2*s)+Math.sin(e*4*s)*1.5),P=Math.min(1,T*.72+C*.34+T*R*.28),N=(n*r+o)*4;t[N]=Math.round((p*.5+.5)*255),t[N+1]=Math.round((m*.5+.5)*255),t[N+2]=Math.round(_*255),t[N+3]=Math.round(P*255)}}let i=new xn(t,r,r,ri);return Ni(i,8,!1)}function Bg(r=4){let i=new Uint8Array(524288),n=Math.PI*2;for(let o=0;o<512;o++){let a=o/512;for(let l=0;l<256;l++){let c=l/256,h=.5+.5*Math.sin(n*9*c+Math.sin(n*3*a)*1.1),u=.5+.5*Math.sin(n*19*c-n*2*a),d=Sr(c,a*2%1,10,61),f=Math.pow(Math.max(0,1-d.edge*2.6),2.1),g=Math.min(1,.32+h*.32+u*.18+f*.45),y=Math.min(1,.58+h*.24+f*.3),p=(o*256+l)*4;i[p]=Math.round((.72+.28*g)*255),i[p+1]=Math.round((.89+.11*g)*255),i[p+2]=Math.round((.96+.04*g)*255),i[p+3]=Math.round(y*255)}}let s=new xn(i,256,512,ri);return Ni(s,r,!0)}function zg(r=4){let e=an(256),i=e.getContext("2d"),n=an(256),s=n.getContext("2d");i.fillStyle="#adb6c1",i.fillRect(0,0,256,256),s.fillStyle="#808080",s.fillRect(0,0,256,256);let o=8,a=4,l=256/o,c=256/a;for(let g=0;g<o;g++){let y=g%2*(c*.5);for(let p=-1;p<=a;p++){let m=p*c+y,x=g*l,S=164+Math.round((Qe(p+10,g,5)-.5)*24);i.fillStyle=`rgb(${S}, ${S+4}, ${S+9})`,i.fillRect(m+1,x+1,c-2,l-2),i.fillStyle="rgba(42, 52, 66, 0.78)",s.fillStyle="#262626";for(let M of[.2,.8])for(let b of[.28,.72])i.beginPath(),i.arc(m+c*M,x+l*b,2.1,0,Math.PI*2),i.fill(),s.beginPath(),s.arc(m+c*M,x+l*b,2.4,0,Math.PI*2),s.fill()}i.fillStyle="rgba(54, 65, 80, 0.68)",i.fillRect(0,g*l-1,256,2),s.fillStyle="#383838",s.fillRect(0,g*l-1,256,2.5)}let h=i.getImageData(0,0,256,256),u=s.getImageData(0,0,256,256),d=h.data,f=u.data;for(let g=0;g<256;g++)for(let y=0;y<256;y++){let p=(Qe(y,g,99)-.5)*18,m=Math.sin(y/256*Math.PI*10)*5,x=(g*256+y)*4;d[x]=Math.max(0,Math.min(255,d[x]+p-m*.4)),d[x+1]=Math.max(0,Math.min(255,d[x+1]+p)),d[x+2]=Math.max(0,Math.min(255,d[x+2]+p+m*.3));let S=Math.max(0,Math.min(255,f[x]+p*1.4));f[x]=S,f[x+1]=S,f[x+2]=S}return i.putImageData(h,0,0),s.putImageData(u,0,0),{map:Ni(new mi(e),r,!0),bumpMap:Ni(new mi(n),r,!1)}}function kg(r=4){let e=an(128),i=e.getContext("2d");i.fillStyle="#9a683a",i.fillRect(0,0,128,128);for(let n=0;n<8;n++){let s=n*16,o=136+Math.round(Qe(n,3,19)*34);i.fillStyle=`rgb(${o+22}, ${o-8}, ${o-46})`,i.fillRect(0,s+1,128,14)}i.strokeStyle="#475569",i.lineWidth=3;for(let n=8;n<128;n+=16)i.beginPath(),i.moveTo(n,0),i.lineTo(n,128),i.stroke(),i.beginPath(),i.moveTo(0,n),i.lineTo(128,n),i.stroke();return i.fillStyle="#eab308",i.fillRect(0,0,128,5),i.fillRect(0,123,128,5),Ni(new mi(e),r,!0)}function Og(r=4){let e=an(128),i=e.getContext("2d"),n=i.createLinearGradient(0,0,128,0);n.addColorStop(0,"#5a6b7d"),n.addColorStop(.32,"#9eb0c2"),n.addColorStop(.52,"#cfdbe6"),n.addColorStop(.75,"#7c8ea2"),n.addColorStop(1,"#5a6b7d"),i.fillStyle=n,i.fillRect(0,0,128,128);for(let s=16;s<128;s+=32){i.fillStyle="rgba(26, 36, 48, 0.65)",i.fillRect(0,s,128,3),i.fillStyle="rgba(226, 232, 240, 0.72)";for(let o=8;o<128;o+=16)i.beginPath(),i.arc(o,s+6,1.9,0,Math.PI*2),i.fill()}return Ni(new mi(e),r,!0)}function Hg(r=4){let e=an(128),i=e.getContext("2d");i.fillStyle="#b8bcc4",i.fillRect(0,0,128,128);for(let n=0;n<128;n+=16){i.fillStyle="rgba(30, 41, 59, 0.35)",i.fillRect(0,n,128,2);let s=n/16%2*8;for(let o=0;o<128;o+=16){let a=166+Math.round(Qe(o,n,71)*38);i.fillStyle=`rgb(${a}, ${a}, ${a+4})`,i.fillRect((o+s)%128,n+2,14,13)}}return Ni(new mi(e),r,!0)}function Gg(r=4){let e=an(128),i=e.getContext("2d");i.fillStyle="#2d5e3c",i.fillRect(0,0,128,128);for(let c=0;c<420;c++){let h=Qe(c,1,13)*128,u=Qe(c,2,29)*128,d=74+Math.round(Qe(c,3,47)*66);i.fillStyle=`rgb(${Math.round(d*.46)}, ${d}, ${Math.round(d*.56)})`,i.fillRect(h,u,4,8)}let n=an(64),s=n.getContext("2d");s.fillStyle="#5c4028",s.fillRect(0,0,64,64);for(let c=0;c<64;c+=4){let h=54+Math.round(Qe(c,7,91)*38);s.fillStyle=`rgb(${h+24}, ${h}, ${h-16})`,s.fillRect(c,0,3,64)}let o=an(128),a=o.getContext("2d"),l=a.createImageData(128,128);for(let c=0;c<128;c++)for(let h=0;h<128;h++){let u=(c*128+h)*4,d=(Qe(h>>1,c>>1,3)-.5)*44,f=(Qe(h,c,7)-.5)*26,g=Qe(h>>4,c>>4,27)>.74?1:0,y=138+d+f;l.data[u]=Math.max(0,Math.min(255,y-g*22)),l.data[u+1]=Math.max(0,Math.min(255,y+g*19)),l.data[u+2]=Math.max(0,Math.min(255,y-4-g*28)),l.data[u+3]=255}return a.putImageData(l,0,0),{foliage:Ni(new mi(e),r,!0),bark:Ni(new mi(n),r,!0),rock:Ni(new mi(o),r,!0)}}function Vg(r=4){let i=an(512),n=i.getContext("2d"),s=[[214,198,178],[192,114,88],[218,224,232],[156,176,198],[182,168,152],[134,168,188],[226,212,184],[164,172,182]];for(let o=0;o<8;o++)for(let a=0;a<8;a++){let l=o*8+a,c=a*64,h=o*64,u=s[(a+o*3)%s.length],d=Math.round((Qe(a,o,19)-.5)*36),f=Math.max(45,Math.min(245,u[0]+d)),g=Math.max(45,Math.min(245,u[1]+d)),y=Math.max(45,Math.min(245,u[2]+d));if(n.fillStyle=`rgb(${f},${g},${y})`,n.fillRect(c,h,64,64),n.fillStyle="rgba(20, 30, 44, 0.24)",o===0||o===1)for(let p=0;p<64;p+=8){n.fillRect(c,h+p,64,1);let m=p/8%2*8;for(let x=m;x<64;x+=16)n.fillRect(c+x,h+p,1,8)}else if(o===2||o===3){n.fillStyle="rgba(56, 148, 218, 0.35)";for(let p=4;p<64;p+=12)for(let m=4;m<64;m+=10)n.fillRect(c+m,h+p,7,8)}else if(o===4)for(let p=0;p<64;p+=6)n.fillRect(c+p,h,2,64);else if(o===5)for(let p=0;p<64;p+=6)n.fillRect(c,h+p,64,1.5);else{for(let p=0;p<64;p+=16)n.fillRect(c,h+p,64,2);for(let p=0;p<64;p+=16)n.fillRect(c+p,h,2,64)}}return Ni(new mi(i),r,!0)}var Ln=[{family:"rock_strata",label:"\u0413\u043E\u0440\u043D\u044B\u0435 \u043F\u043E\u0440\u043E\u0434\u044B \u0438 \u0441\u0442\u0440\u0430\u0442\u044B",count:54,baseH:.07,sat:.12,lMin:.32,lMax:.72},{family:"soils_pebbles",label:"\u0413\u0440\u0443\u043D\u0442\u044B, \u0433\u0430\u043B\u044C\u043A\u0430 \u0438 \u043F\u043B\u044F\u0436\u0438",count:54,baseH:.09,sat:.28,lMin:.28,lMax:.68},{family:"hydro_concrete",label:"\u0413\u0438\u0434\u0440\u043E\u0442\u0435\u0445\u043D\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u0431\u0435\u0442\u043E\u043D\u044B \u0438 \u0431\u0443\u0442",count:54,baseH:.58,sat:.08,lMin:.46,lMax:.84},{family:"city_facades",label:"\u0410\u0440\u0445\u0438\u0442\u0435\u043A\u0442\u0443\u0440\u043D\u044B\u0435 \u0444\u0430\u0441\u0430\u0434\u044B \u0438 \u0441\u0442\u0435\u043A\u043B\u043E",count:72,baseH:.11,sat:.24,lMin:.48,lMax:.88},{family:"roofs_metals",label:"\u041A\u0440\u043E\u0432\u043B\u0438, \u0441\u0442\u0430\u043B\u044C \u0438 \u0432\u043E\u0434\u043E\u0432\u043E\u0434\u044B",count:54,baseH:.03,sat:.34,lMin:.3,lMax:.76},{family:"flora_agro",label:"\u0425\u0432\u043E\u044F, \u043B\u0443\u0433\u0430 \u0438 \u0430\u0433\u0440\u043E-\u043A\u0443\u043B\u044C\u0442\u0443\u0440\u044B",count:54,baseH:.31,sat:.42,lMin:.24,lMax:.62},{family:"water_optics",label:"\u041E\u043F\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u043E\u0442\u0442\u0435\u043D\u043A\u0438 \u0432\u043E\u0434\u044B \u0438 \u043B\u044C\u0434\u0430",count:45,baseH:.52,sat:.58,lMin:.26,lMax:.82},{family:"fleet_machinery",label:"\u0420\u0435\u0447\u043D\u043E\u0439 \u0444\u043B\u043E\u0442, \u043F\u043E\u0435\u0437\u0434\u0430 \u0438 \u043A\u0440\u0430\u043D\u044B",count:45,baseH:.14,sat:.64,lMin:.36,lMax:.78}],on=(()=>{let r=[],t=new dt,e=0;for(let i=0;i<Ln.length;i++){let n=Ln[i];for(let s=0;s<n.count;s++){let o=s/Math.max(1,n.count-1),a=(Qe(i+1,s+3,77)-.5)*(n.family==="city_facades"?.85:.22),l=((n.baseH+a)%1+1)%1,c=Math.max(.03,Math.min(.88,n.sat+(Qe(s,i,19)-.5)*.24)),h=n.lMin+(n.lMax-n.lMin)*o;t.setHSL(l,c,h),r.push({id:e,family:n.family,familyLabel:n.label,name:`${n.label} #${s+1}`,atlasTile:e*7%64,hex:t.getHex(),r:t.r,g:t.g,b:t.b,roughness:+(.25+.68*Qe(e,5,31)).toFixed(2)}),e++}}return r})();function Ki(r,t=0){let e=0;for(let i=0;i<Ln.length;i++){if(Ln[i].family===r){let n=e+(t%Ln[i].count+Ln[i].count)%Ln[i].count;return on[n]}e+=Ln[i].count}return on[(t%on.length+on.length)%on.length]}function Ba(r){let t=r?Math.min(8,r.capabilities.getMaxAnisotropy()):4,e=Hd(512),i=Bg(t),n=zg(t),s=kg(t),o=Og(t),a=Hg(t),l=Vg(t),c=Gg(t);return{waterDetail:e,overflowCascade:i,concreteMap:n.map,concreteBump:n.bumpMap,rebarFormwork:s,steel:o,roof:a,facadeAtlas:l,foliage:c.foliage,bark:c.bark,rock:c.rock,shadeCatalogCount:on.length}}function Gd(r,t=null){let e={uTime:{value:0},uSunDir:{value:new O(.52,.74,.42).normalize()},uSunColor:{value:new dt(16774364)},uSkyColor:{value:new dt(7186664)},uFogColor:{value:new dt(11061992)},uFogDensity:{value:12e-5},uShowContours:{value:0},uSnowLine:{value:122},uMeltOffset:{value:0},uElevScale:{value:2.35},uHorizScale:{value:6.51},uMapHalf:{value:2500},uDetailTex:{value:r},uConcreteTex:{value:t||r},uHasConcreteTex:{value:t?1:0}};return new Ne({uniforms:e,extensions:{derivatives:!0},vertexShader:`
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
      uniform float uMapHalf;
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
        float edgeRatio = max(abs(vWorldPos.x), abs(vWorldPos.z)) / max(100.0, uMapHalf);
        float edgeMist = smoothstep(0.91, 1.00, edgeRatio) * 0.62;
        litCol = mix(litCol, uFogColor, clamp(max(fogF * 0.88, edgeMist), 0.0, 0.94));

        gl_FragColor = vec4(litCol, 1.0);
      }
    `})}function Vd(r){let t={uTime:{value:0},uSunDir:{value:new O(.52,.74,.42).normalize()},uSunColor:{value:new dt(16774624)},uSkyZenith:{value:new dt(2647213)},uSkyHorizon:{value:new dt(10931688)},uFogColor:{value:new dt(11061992)},uFogDensity:{value:12e-5},uHorizScale:{value:6.51},uElevScale:{value:2.35},uMapHalf:{value:2500},uDetailTex:{value:r}};return new Ne({uniforms:t,transparent:!0,depthWrite:!0,side:Ii,vertexShader:`
      uniform float uTime;
      uniform float uHorizScale;
      uniform float uElevScale;

      attribute vec4 aHydro1;
      attribute vec4 aHydro2;

      varying vec3 vWorldPos;
      varying vec3 vMacroNormal;
      varying vec4 vHydro1;
      varying vec4 vHydro2;
      varying float vWaveCrest;

      void main() {
        vHydro1 = aHydro1;
        vHydro2 = aHydro2;
        vec4 worldPos = modelMatrix * vec4(position, 1.0);

        float depth = aHydro1.x;
        vec2 vel = aHydro1.yz;
        float speed = length(vel);
        float vort = aHydro2.y;

        // 3D-\u0433\u0435\u043E\u043C\u0435\u0442\u0440\u0438\u0447\u0435\u0441\u043A\u043E\u0435 \u0434\u0432\u0438\u0436\u0435\u043D\u0438\u0435 \u0432\u043E\u043B\u043D \u0413\u0435\u0440\u0441\u0442\u043D\u0435\u0440\u0430 + \u0441\u0442\u043E\u044F\u0447\u0438\u0435 \u0431\u0443\u0440\u0443\u043D\u044B \u0433\u043E\u0440\u043D\u044B\u0445 \u043F\u0435\u0440\u0435\u043A\u0430\u0442\u043E\u0432 (\u0441 \u043C\u044F\u0433\u043A\u0438\u043C \u0434\u0435\u043C\u043F\u0444\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435\u043C \u0443 \u043A\u0440\u043E\u043C\u043A\u0438 \u0431\u0435\u0440\u0435\u0433\u0430!)
        float optDepth = depth / max(1.0, pow(uElevScale, 0.58));
        float shoreDamp = smoothstep(0.05, 0.55, optDepth) * step(0.05, aHydro2.w);
        float wScale = 1.0 / max(1.0, pow(uHorizScale, 0.56));

        vec2 p = worldPos.xz * wScale;
        float w1 = sin(dot(p, vec2(0.115, 0.082)) - uTime * 2.05);
        float w2 = sin(dot(p, vec2(-0.086, 0.128)) - uTime * 1.62 + 1.4);

        vec2 flowDir = speed > 0.03 ? (vel / speed) : vec2(0.0, 1.0);
        vec2 crossDir = vec2(-flowDir.y, flowDir.x);
        float along = dot(p, flowDir);
        float across = dot(p, crossDir);
        float riffle = sin(along * 0.29 - uTime * (2.9 + min(speed, 12.0) * 0.52))
                     * cos(across * 0.21 + uTime * 1.15 + vort * 0.35);

        float waveAmp = (0.045 + clamp(speed * 0.022, 0.0, 0.20)) * pow(uElevScale, 0.55) * shoreDamp;
        float dy = (w1 * 0.42 + w2 * 0.33 + riffle * (0.25 + clamp(speed * 0.08, 0.0, 0.55))) * waveAmp;

        worldPos.y += dy;
        worldPos.xz += flowDir * (riffle * waveAmp * 0.22);

        vWaveCrest = clamp((w1 * 0.4 + w2 * 0.35 + riffle * 0.5) * 0.5 + 0.5, 0.0, 1.0) * shoreDamp;
        vWorldPos = worldPos.xyz;

        vec3 baseMacroN = normalize(mat3(modelMatrix) * normal);
        vec3 waveTilt = vec3(
          -(w1 * 0.032 - w2 * 0.024 + riffle * flowDir.x * 0.045) * shoreDamp,
          0.0,
          -(w1 * 0.024 + w2 * 0.032 + riffle * flowDir.y * 0.045) * shoreDamp
        );
        vMacroNormal = normalize(baseMacroN + waveTilt);
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
      uniform float uMapHalf;
      uniform sampler2D uDetailTex;

      varying vec3 vWorldPos;
      varying vec3 vMacroNormal;
      varying vec4 vHydro1;
      varying vec4 vHydro2;
      varying float vWaveCrest;

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

        vec2 swellUv = vWorldPos.xz * (0.026 * uvScale) + vec2(uTime * 0.016, -uTime * 0.012);
        vec4 swellSample = texture2D(uDetailTex, swellUv);
        vec2 crossSwellUv = vWorldPos.xz * (0.041 * uvScale) + vec2(-uTime * 0.013, uTime * 0.019);
        vec4 crossSwell = texture2D(uDetailTex, crossSwellUv);

        // \u0412\u0438\u0445\u0440\u0435\u0432\u043E\u0435 \u0437\u0430\u043A\u0440\u0443\u0447\u0438\u0432\u0430\u043D\u0438\u0435 \u041A\u0430\u0440\u043C\u0430\u043D\u0430 \u0432\u043E\u043A\u0440\u0443\u0433 \u0443\u0441\u0442\u043E\u0435\u0432, \u043A\u0430\u043C\u043D\u0435\u0439 \u0438 \u043F\u043E\u0432\u043E\u0440\u043E\u0442\u043E\u0432 \u0440\u0443\u0441\u043B\u0430
        float swirlAng = clamp(vort, -2.5, 2.5) * 0.22 * sin(uTime * 1.9 + vWorldPos.x * 0.02);
        float cs = cos(swirlAng);
        float sn = sin(swirlAng);
        vec2 swirledXZ = vec2(vWorldPos.x * cs - vWorldPos.z * sn, vWorldPos.x * sn + vWorldPos.z * cs);

        vec2 baseUv = swirledXZ * (0.086 * uvScale);
        vec4 s0 = texture2D(uDetailTex, baseUv - flowStep * (p0 * cycle));
        vec4 s1 = texture2D(uDetailTex, baseUv - flowStep * (p1 * cycle) + vec2(0.37, 0.61));
        vec4 waveSample = mix(s0, s1, blend);

        vec2 fineUv = swirledXZ * (0.28 * uvScale) + vec2(vort * 0.08, -vort * 0.08);
        vec4 f0 = texture2D(uDetailTex, fineUv - flowStep * (p0 * cycle * 1.85));
        vec4 f1 = texture2D(uDetailTex, fineUv - flowStep * (p1 * cycle * 1.85) + vec2(0.53, 0.19));
        vec4 fineSample = mix(f0, f1, blend);

        float froude = speed / sqrt(9.81 * max(0.08, depth));
        float distFade = 1.0 - smoothstep(280.0 * uHorizScale, 980.0 * uHorizScale, dist) * 0.58;
        float chopAmp = (0.24 + clamp(speed * 0.058 + froude * 0.16, 0.0, 0.58)) * distFade;

        vec2 dN = (
          (swellSample.xy * 2.0 - 1.0) * 0.34 +
          (crossSwell.xy * 2.0 - 1.0) * 0.26 +
          (waveSample.xy * 2.0 - 1.0) * 0.66 +
          (fineSample.xy * 2.0 - 1.0) * 0.46
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

        // \u041F\u043E\u0434\u043F\u043E\u0432\u0435\u0440\u0445\u043D\u043E\u0441\u0442\u043D\u043E\u0435 \u0438\u0437\u0443\u043C\u0440\u0443\u0434\u043D\u043E\u0435 \u0441\u0432\u0435\u0447\u0435\u043D\u0438\u0435 \u0433\u0440\u0435\u0431\u043D\u0435\u0439 3D-\u0432\u043E\u043B\u043D \u043D\u0430 \u0441\u043E\u043B\u043D\u0446\u0435 (SSS)
        float sss = (pow(clamp(dot(V, -uSunDir + N * 0.65), 0.0, 1.0), 3.0) + vWaveCrest * 0.38) * (1.0 - mudMask * 0.75);
        underwaterRadiance += vec3(0.045, 0.38, 0.36) * sss * max(0.0, uSunDir.y);

        // --- 4. \u0422\u043E\u0447\u043D\u044B\u0439 \u0437\u0430\u043A\u043E\u043D \u0424\u0440\u0435\u043D\u0435\u043B\u044F \u0428\u043B\u0438\u043A\u0430 (R0 = 0.0204 \u0434\u043B\u044F \u043F\u0440\u0435\u0441\u043D\u043E\u0439 \u0432\u043E\u0434\u044B n = 1.333) \u0438 \u0430\u043B\u043C\u0430\u0437\u043D\u044B\u0435 \u0438\u0441\u043A\u0440\u044B \u0431\u043B\u0438\u043A\u043E\u0432 ---
        float NdotV = max(0.0, dot(N, V));
        float fresnel = clamp(0.0204 + 0.92 * pow(1.0 - NdotV, 4.8), 0.0204, 0.89);

        vec3 R = reflect(-V, N);
        float skyGrad = clamp(R.y * 0.5 + 0.5, 0.0, 1.0);
        float canyonReflect = 1.0 - smoothstep(0.0, 0.22, R.y) * 0.24;
        vec3 skyRefl = mix(uSkyHorizon, uSkyZenith, pow(skyGrad, 0.72)) * canyonReflect;

        vec3 H = normalize(uSunDir + V);
        float specCore = pow(max(0.0, dot(N, H)), 480.0) * 3.2;
        float specGlitter = pow(max(0.0, dot(N, H)), 58.0) * 0.36;
        float sparkle = smoothstep(0.76, 0.96, vnoise(vWorldPos.xz * (1.35 * uvScale) + vec2(uTime * 1.9, -uTime * 1.5)))
                      * pow(max(0.0, dot(N, H)), 22.0) * 0.75 * distFade;
        vec3 sunSpec = uSunColor * (specCore + specGlitter + sparkle) * smoothstep(-0.02, 0.12, uSunDir.y);

        // --- 5. \u041F\u0440\u043E\u0434\u043E\u043B\u044C\u043D\u044B\u0435 \u0441\u0442\u0440\u0443\u0438 \u0436\u0438\u0432\u043E\u0433\u043E \u0442\u0435\u0447\u0435\u043D\u0438\u044F, \u0431\u0443\u0440\u0443\u043D\u044B \u043F\u043E\u0440\u043E\u0433\u043E\u0432 \u0438 \u0434\u044B\u0448\u0430\u0449\u0438\u0439 \u043F\u0440\u0438\u0431\u043E\u0439 \u0443 \u0431\u0435\u0440\u0435\u0433\u043E\u0432 ---
        vec2 orthoDir = vec2(-flowDir.y, flowDir.x);
        vec2 anisoUv = vec2(
          dot(vWorldPos.xz, flowDir) * (0.078 * uvScale) - uTime * (0.34 + speed * 0.068 * uvScale),
          dot(vWorldPos.xz, orthoDir) * (0.21 * uvScale)
        );
        float lacePattern = texture2D(uDetailTex, anisoUv).a * 0.62
                          + texture2D(uDetailTex, anisoUv * 2.35 + vec2(0.31, -uTime * 0.14)).a * 0.38;

        // \u0422\u043E\u043D\u043A\u0438\u0435 \u0431\u0435\u0433\u0443\u0449\u0438\u0435 \u043D\u0438\u0442\u0438 \u0442\u0435\u0447\u0435\u043D\u0438\u044F \u0432\u0434\u043E\u043B\u044C \u0440\u0443\u0441\u043B\u0430 \u0440\u0435\u043A\u0438 \u0438 \u043A\u0430\u043D\u0430\u043B\u043E\u0432
        float currentStreak = smoothstep(0.58, 0.88, lacePattern) * clamp(speed * 0.16, 0.0, 0.42);
        // \u0414\u044B\u0448\u0430\u0449\u0438\u0439 \u043D\u0430\u043A\u0430\u0442 \u0432\u043E\u043B\u043D\u044B \u043D\u0430 \u043E\u0442\u043C\u0435\u043B\u0438 \u0438 \u0433\u0430\u043B\u0435\u0447\u043D\u044B\u0435 \u0431\u0435\u0440\u0435\u0433\u0430
        float shoreLap = (0.55 + 0.45 * sin(optDepth * 24.0 - uTime * 3.2)) * (1.0 - smoothstep(0.012, 0.26, optDepth));
        float shoreMeniscus = shoreLap * clamp(0.18 + speed * 0.24, 0.18, 0.78);
        float whitecap = smoothstep(0.74, 0.98, vWaveCrest) * clamp(speed * 0.14 + froude * 0.25, 0.0, 0.55);

        float totalFoamDrive = clamp(foamVal * 1.28 + shoreMeniscus + currentStreak + whitecap + clamp(froude - 0.98, 0.0, 0.78) * 0.65, 0.0, 1.0);
        float foamMask = smoothstep(0.34 - totalFoamDrive * 0.29, 0.73 - totalFoamDrive * 0.22, lacePattern * totalFoamDrive * 1.62);
        vec3 foamColor = vec3(0.96, 0.985, 1.0) * (0.38 + 0.66 * daySun);

        vec3 surfaceCol = mix(underwaterRadiance, skyRefl, fresnel) + sunSpec * (1.0 - foamMask * 0.70);
        vec3 finalCol = mix(surfaceCol, foamColor, foamMask);

        float distFog = 1.0 - exp(-pow(dist * uFogDensity, 1.62));
        float edgeRatioW = max(abs(vWorldPos.x), abs(vWorldPos.z)) / max(100.0, uMapHalf);
        float edgeMistW = smoothstep(0.92, 1.00, edgeRatioW) * 0.55;
        finalCol = mix(finalCol, uFogColor, clamp(max(distFog * 0.88, edgeMistW), 0.0, 0.92));

        float edgeAlpha = smoothstep(0.008, 0.062, optDepth);
        gl_FragColor = vec4(finalCol, edgeAlpha);
      }
    `})}function Wd(r){return new Ne({transparent:!0,depthWrite:!1,side:Ve,uniforms:{uTime:{value:0},uSunFactor:{value:1},uOverflowTex:{value:r},uFogColor:{value:new dt(11061992)},uFogDensity:{value:12e-5}},vertexShader:`
      uniform float uTime;
      varying vec2 vUv;
      varying vec3 vWorldPos;

      void main() {
        vUv = uv;
        vec3 p = position;
        // \u0416\u0438\u0432\u043E\u0435 \u043F\u0443\u043B\u044C\u0441\u0438\u0440\u0443\u044E\u0449\u0435\u0435 \u043A\u043E\u043B\u0435\u0431\u0430\u043D\u0438\u0435 \u043F\u0430\u0434\u0430\u044E\u0449\u0435\u0439 \u0432\u043E\u0434\u043D\u043E\u0439 \u043F\u0435\u043B\u0435\u043D\u044B \u043F\u0435\u0440\u0435\u043B\u0438\u0432\u0430
        float flutter = sin(uv.x * 13.0 + uTime * 9.5) * cos(uv.y * 8.5 - uTime * 12.0) * 0.035 * uv.y;
        p.x += flutter;
        p.y += flutter * 0.45;
        #ifdef USE_INSTANCING
          vec4 wp = modelMatrix * instanceMatrix * vec4(p, 1.0);
        #else
          vec4 wp = modelMatrix * vec4(p, 1.0);
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
    `})}function Xd(r=null,t=null){return new Ne({uniforms:{uSunDir:{value:new O(.5,.7,.4).normalize()},uSunColor:{value:new dt(16774364)},uSkyColor:{value:new dt(8369128)},uNightFactor:{value:0},uFogColor:{value:new dt(11061992)},uFogDensity:{value:12e-5},uRoofTex:{value:r},uHasRoofTex:{value:r?1:0},uFacadeAtlas:{value:t||r},uHasAtlas:{value:t?1:0}},vertexShader:`
      attribute float aPowered;
      attribute float aStyleId;
      attribute float aBuildProg;
      varying vec3 vWorldPos;
      varying vec3 vLocalPos;
      varying vec3 vNormalW;
      varying vec3 vColor;
      varying float vPowered;
      varying float vStyleId;
      varying float vBuildProg;

      void main() {
        vLocalPos = position;
        vPowered = aPowered;
        vStyleId = aStyleId;
        vBuildProg = aBuildProg;
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
      varying float vBuildProg;

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

        // \u0420\u0435\u0430\u043B\u044C\u043D\u0430\u044F \u043F\u043E\u044D\u0442\u0430\u043F\u043D\u0430\u044F \u0441\u0442\u0440\u043E\u0439\u043A\u0430 \u0437\u0434\u0430\u043D\u0438\u044F (vBuildProg < 0.96): \u043C\u043E\u043D\u043E\u043B\u0438\u0442\u043D\u044B\u0439 \u043A\u0430\u0440\u043A\u0430\u0441 \u044D\u0442\u0430\u0436\u0435\u0439 \u0438 \u0437\u0430\u0449\u0438\u0442\u043D\u0430\u044F \u0441\u0435\u0442\u043A\u0430 \u043D\u0430\u0432\u0435\u0440\u0445\u0443!
        float cladLine = vBuildProg < 0.96 ? clamp((vBuildProg - 0.08) / 0.86, 0.08, 1.02) : 2.0;
        bool isRawFrame = (vBuildProg < 0.96) && (vLocalPos.y > cladLine * 0.72);
        if (isRawFrame) {
          float slabBand = step(0.82, fract(vWorldPos.y * 0.34));
          float colBand = step(0.84, fract((abs(N.x) > 0.5 ? vWorldPos.z : vWorldPos.x) * 0.28));
          vec3 rawConc = mix(vec3(0.55, 0.58, 0.61), vec3(0.72, 0.75, 0.78), max(slabBand, colBand));
          float safetyNet = smoothstep(0.76, 0.96, vLocalPos.y) * (0.5 + 0.5 * step(0.5, fract(vWorldPos.y * 0.9)));
          rawConc = mix(rawConc, vec3(0.95, 0.48, 0.12), safetyNet * 0.65);
          litWall = rawConc * (uSunColor * NdotL * 0.85 + uSkyColor * 0.34);
        }

        // \u0414\u0435\u0442\u0430\u043B\u0438\u0437\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0435 \u043E\u043A\u043D\u0430 \u0441 \u043F\u0435\u0440\u0435\u043F\u043B\u0451\u0442\u0430\u043C\u0438 (\u0442\u043E\u043B\u044C\u043A\u043E \u043D\u0430 \u0443\u0436\u0435 \u043E\u0441\u0442\u0435\u043A\u043B\u0451\u043D\u043D\u044B\u0445 \u044D\u0442\u0430\u0436\u0430\u0445, \u043A\u0440\u043E\u043C\u0435 \u0433\u043B\u0443\u0445\u0438\u0445 \u0441\u0438\u043B\u043E\u0441\u043E\u0432/\u0433\u0440\u0430\u0434\u0438\u0440\u0435\u043D 13, 19)
        bool hasWindows = !isRawFrame && abs(vStyleId - 13.0) > 0.4 && abs(vStyleId - 19.0) > 0.4;
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

            float readyLight = vBuildProg >= 0.95 ? 1.0 : 0.0;
            float onProb = vPowered > 0.5 ? 0.78 : 0.06;
            float windowLit = step(1.0 - onProb, rnd) * uNightFactor * readyLight;
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
    `})}function Yd(r){return new Ne({transparent:!1,depthWrite:!0,side:Ii,uniforms:{uTime:{value:0},uMapHalf:{value:2500},uHorizScale:{value:6.51},uSunDir:{value:new O(.52,.74,.42).normalize()},uSunColor:{value:new dt(16774624)},uSkyZenith:{value:new dt(2647213)},uSkyHorizon:{value:new dt(10931688)},uFogColor:{value:new dt(11061992)},uFogDensity:{value:12e-5},uDetailTex:{value:r}},vertexShader:`
      varying vec3 vWorldPos;
      void main() {
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,fragmentShader:`
      uniform float uTime;
      uniform float uMapHalf;
      uniform float uHorizScale;
      uniform vec3 uSunDir;
      uniform vec3 uSunColor;
      uniform vec3 uSkyZenith;
      uniform vec3 uSkyHorizon;
      uniform vec3 uFogColor;
      uniform float uFogDensity;
      uniform sampler2D uDetailTex;

      varying vec3 vWorldPos;

      void main() {
        float boxDist = max(abs(vWorldPos.x), abs(vWorldPos.z));
        // \u0412\u043D\u0443\u0442\u0440\u0438 \u0441\u0430\u043C\u043E\u0439 \u043A\u0430\u0440\u0442\u044B \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442 \u043E\u0441\u043D\u043E\u0432\u043D\u043E\u0439 2D SWE \u043C\u0435\u0448 \u2014 \u0432\u044B\u0440\u0435\u0437\u0430\u0435\u043C \u0432\u043D\u0443\u0442\u0440\u0435\u043D\u043D\u0438\u0439 \u043A\u0432\u0430\u0434\u0440\u0430\u0442 \u0431\u0435\u0437 Z-fighting!
        if (boxDist < uMapHalf * 0.994) discard;

        float uvScale = 0.018 / max(1.0, pow(uHorizScale, 0.55));
        vec2 uv1 = vWorldPos.xz * uvScale + vec2(uTime * 0.018, uTime * 0.012);
        vec2 uv2 = vWorldPos.xz * (uvScale * 2.35) - vec2(uTime * 0.014, -uTime * 0.021);
        vec4 w1 = texture2D(uDetailTex, uv1);
        vec4 w2 = texture2D(uDetailTex, uv2);

        vec2 slope = (w1.rg - 0.5) * 0.34 + (w2.rg - 0.5) * 0.22;
        vec3 N = normalize(vec3(slope.x, 1.0, slope.y));
        vec3 V = normalize(cameraPosition - vWorldPos);

        float cosTheta = clamp(dot(N, V), 0.0, 1.0);
        float fresnel = 0.024 + 0.976 * pow(1.0 - cosTheta, 5.0);

        vec3 R = reflect(-V, N);
        float skyMix = pow(clamp(1.0 - max(0.0, R.y), 0.0, 1.0), 2.1);
        vec3 skyRefl = mix(uSkyZenith, uSkyHorizon, skyMix);

        float dayLum = clamp(uSunDir.y * 2.2 + 0.18, 0.08, 1.0);
        vec3 deepSea = vec3(0.025, 0.135, 0.215) * (0.35 + 0.75 * dayLum);
        vec3 H = normalize(uSunDir + V);
        float spec = pow(max(0.0, dot(N, H)), 180.0) * 1.45;

        // \u041C\u044F\u0433\u043A\u0430\u044F \u0431\u0435\u0440\u0435\u0433\u043E\u0432\u0430\u044F \u043F\u0435\u043D\u0430 \u0432\u0434\u043E\u043B\u044C \u043A\u0440\u043E\u043C\u043A\u0438 \u043A\u0430\u0440\u0442\u044B
        float shoreBand = 1.0 - smoothstep(uMapHalf * 0.994, uMapHalf * 1.055, boxDist);
        float surfLace = smoothstep(0.42, 0.78, (w1.a * 0.6 + w2.a * 0.4) + shoreBand * 0.45) * shoreBand;

        vec3 seaCol = mix(deepSea, skyRefl, clamp(fresnel * 0.92, 0.0, 0.95)) + uSunColor * spec;
        seaCol = mix(seaCol, vec3(0.92, 0.96, 1.0) * (0.35 + 0.65 * dayLum), surfLace * 0.55);

        // \u0413\u0443\u0441\u0442\u043E\u0439 \u0430\u0442\u043C\u043E\u0441\u0444\u0435\u0440\u043D\u044B\u0439 \u0442\u0443\u043C\u0430\u043D \u0432\u0434\u0430\u043B\u0438 \u0437\u0430 \u043A\u0430\u0440\u0442\u043E\u0439 \u2014 \u043F\u043B\u0430\u0432\u043D\u043E \u0441\u043B\u0438\u0432\u0430\u0435\u0442 \u0432\u043E\u0434\u0443 \u0441 \u043D\u0435\u0431\u043E\u043C \u0434\u043E \u0441\u0430\u043C\u043E\u0433\u043E \u0433\u043E\u0440\u0438\u0437\u043E\u043D\u0442\u0430!
        float camDist = length(cameraPosition - vWorldPos);
        float outDist = max(0.0, boxDist - uMapHalf);
        float radialFog = smoothstep(0.0, uMapHalf * 2.4, outDist);
        float viewFog = 1.0 - exp(-pow(camDist * uFogDensity * 1.35, 1.55));
        float totalFog = clamp(max(radialFog, viewFog), 0.0, 1.0);

        vec3 finalCol = mix(seaCol, uFogColor, totalFog);
        gl_FragColor = vec4(finalCol, 1.0);
      }
    `})}function qd(){return new Ne({transparent:!0,depthWrite:!1,side:Ze,uniforms:{uFogColor:{value:new dt(11061992)},uOpacity:{value:.72}},vertexShader:`
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:`
      uniform vec3 uFogColor;
      uniform float uOpacity;
      varying vec2 vUv;
      void main() {
        // \u0413\u0443\u0441\u0442\u043E\u0439 \u0442\u0443\u043C\u0430\u043D \u0443 \u0432\u043E\u0434\u043D\u043E\u0439 \u043F\u043E\u0432\u0435\u0440\u0445\u043D\u043E\u0441\u0442\u0438 (vUv.y ~ 0), \u043F\u043B\u0430\u0432\u043D\u043E \u0442\u0430\u044E\u0449\u0438\u0439 \u0432\u0432\u0435\u0440\u0445 \u0432 \u043D\u0435\u0431\u043E (vUv.y -> 1)
        float alpha = pow(1.0 - clamp(vUv.y, 0.0, 1.0), 2.2) * uOpacity;
        gl_FragColor = vec4(uFogColor, alpha);
      }
    `})}function $d(){return new Ne({side:Ve,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-2,uniforms:{uSunDir:{value:new O(.52,.74,.42).normalize()},uSunColor:{value:new dt(16774364)},uSkyColor:{value:new dt(8369128)},uNightFactor:{value:0},uFogColor:{value:new dt(11061992)},uFogDensity:{value:12e-5}},vertexShader:`
      attribute float aRoadKind;
      varying vec2 vUv;
      varying vec3 vWorldPos;
      varying vec3 vNormalW;
      varying float vRoadKind;

      void main() {
        vUv = uv;
        vRoadKind = aRoadKind;
        vec4 wp = modelMatrix * vec4(position, 1.0);
        vWorldPos = wp.xyz;
        vNormalW = normalize(mat3(modelMatrix) * normal);
        gl_Position = projectionMatrix * viewMatrix * wp;
      }
    `,fragmentShader:`
      uniform vec3 uSunDir;
      uniform vec3 uSunColor;
      uniform vec3 uSkyColor;
      uniform float uNightFactor;
      uniform vec3 uFogColor;
      uniform float uFogDensity;

      varying vec2 vUv;
      varying vec3 vWorldPos;
      varying vec3 vNormalW;
      varying float vRoadKind;

      float hash21(vec2 p) {
        p = fract(p * vec2(127.1, 311.7));
        p += dot(p, p + 34.2);
        return fract(p.x * p.y);
      }

      void main() {
        vec3 N = normalize(vNormalW);
        float NdotL = max(0.12, dot(N, uSunDir));
        float grain = hash21(floor(vWorldPos.xz * 2.2)) * 0.08 - 0.04;

        float across = abs(vUv.x - 0.5) * 2.0; // 0 \u0432 \u0446\u0435\u043D\u0442\u0440\u0435 \u0442\u0440\u0430\u0441\u0441\u044B -> 1 \u043D\u0430 \u043A\u0440\u0430\u044E \u043E\u0431\u043E\u0447\u0438\u043D\u044B
        vec3 col;

        if (vRoadKind > 1.5 && vRoadKind < 2.5) {
          // 2.0 \u2014 \u043E\u0442\u0441\u044B\u043F\u0430\u043D\u043D\u0430\u044F \u0449\u0435\u0431\u0451\u043D\u043E\u0447\u043D\u043E-\u043F\u0435\u0441\u0447\u0430\u043D\u0430\u044F \u043F\u043E\u0434\u0443\u0448\u043A\u0430 \u0441\u0442\u0440\u043E\u044F\u0449\u0435\u0433\u043E\u0441\u044F \u0443\u0447\u0430\u0441\u0442\u043A\u0430 \u0442\u0440\u0430\u0441\u0441\u044B
          vec3 gravelCore = vec3(0.68, 0.58, 0.42) + grain * 1.4;
          vec3 earthEdge = vec3(0.50, 0.39, 0.25);
          float rut = 1.0 - smoothstep(0.0, 0.14, abs(across - 0.42)) * 0.16;
          col = mix(gravelCore * rut, earthEdge, smoothstep(0.72, 1.0, across));
        } else {
          // 0.0 (\u0448\u043E\u0441\u0441\u0435), 1.0 (\u043C\u043E\u0441\u0442\u043E\u0432\u043E\u0439 \u043F\u0440\u043E\u043B\u0451\u0442), 3.0 (\u0433\u043E\u0440\u043E\u0434\u0441\u043A\u043E\u0439 \u043F\u0440\u043E\u0441\u043F\u0435\u043A\u0442)
          bool isBridge = (vRoadKind > 0.5 && vRoadKind < 1.5);
          vec3 asphalt = isBridge
            ? (vec3(0.28, 0.31, 0.35) + grain * 0.7)
            : (vec3(0.20, 0.22, 0.25) + grain);

          // \u0414\u0435\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u043E\u043D\u043D\u044B\u0435 \u0448\u0432\u044B \u043C\u043E\u0441\u0442\u0430 \u0438\u043B\u0438 \u0442\u0435\u043A\u0441\u0442\u0443\u0440\u0430 \u043A\u043E\u043B\u0435\u0438 \u043D\u0430\u043A\u0430\u0442\u0430\u043D\u043D\u043E\u0433\u043E \u0430\u0441\u0444\u0430\u043B\u044C\u0442\u0430
          if (isBridge) {
            float joint = step(0.96, fract(vUv.y * 0.055));
            asphalt -= joint * 0.07;
          } else {
            float tireTrack = smoothstep(0.0, 0.16, abs(across - 0.40));
            asphalt *= (0.92 + 0.08 * tireTrack);
          }

          // \u041E\u0431\u043E\u0447\u0438\u043D\u0430: \u0431\u0435\u0442\u043E\u043D\u043D\u044B\u0439 \u0431\u043E\u0440\u0434\u044E\u0440 \u043D\u0430 \u043C\u043E\u0441\u0442\u0443 \u0438\u043B\u0438 \u0430\u043A\u043A\u0443\u0440\u0430\u0442\u043D\u0430\u044F \u0433\u0440\u0430\u0432\u0438\u0439\u043D\u0430\u044F \u0431\u0440\u043E\u0432\u043A\u0430 \u043D\u0430 \u0437\u0435\u043C\u043B\u0435
          vec3 shoulderCol = isBridge ? vec3(0.74, 0.78, 0.82) : vec3(0.56, 0.53, 0.46);
          float shoulderMask = smoothstep(0.80, 0.86, across);
          col = mix(asphalt, shoulderCol, shoulderMask);

          // \u0427\u0451\u0442\u043A\u0430\u044F \u0434\u043E\u0440\u043E\u0436\u043D\u0430\u044F \u0440\u0430\u0437\u043C\u0435\u0442\u043A\u0430: \u043F\u0440\u0435\u0440\u044B\u0432\u0438\u0441\u0442\u0430\u044F \u043E\u0441\u0435\u0432\u0430\u044F \u0438 \u0441\u043F\u043B\u043E\u0448\u043D\u044B\u0435 \u043A\u0440\u0430\u0435\u0432\u044B\u0435 \u043F\u043E\u043B\u043E\u0441\u044B \u0431\u0435\u0437\u043E\u043F\u0430\u0441\u043D\u043E\u0441\u0442\u0438
          float centerDash = (1.0 - smoothstep(0.0, 0.042, across)) * step(0.42, fract(vUv.y * 0.085));
          float edgeLine = (1.0 - smoothstep(0.0, 0.032, abs(across - 0.76)));
          vec3 paintCol = vec3(0.95, 0.96, 0.94);
          vec3 centerCol = isBridge ? vec3(0.98, 0.84, 0.32) : paintCol;
          col = mix(col, paintCol, edgeLine * 0.82);
          col = mix(col, centerCol, centerDash * 0.90);
        }

        vec3 lit = col * (uSunColor * NdotL * 0.88 + uSkyColor * 0.34);

        // \u0422\u0451\u043F\u043B\u0430\u044F \u043F\u043E\u0434\u0441\u0432\u0435\u0442\u043A\u0430 \u0444\u043E\u043D\u0430\u0440\u0435\u0439 \u043D\u0430 \u043C\u043E\u0441\u0442\u0430\u0445 \u0438 \u0433\u043E\u0440\u043E\u0434\u0441\u043A\u0438\u0445 \u0443\u043B\u0438\u0446\u0430\u0445 \u043D\u043E\u0447\u044C\u044E
        if (uNightFactor > 0.05 && (abs(vRoadKind - 1.0) < 0.4 || vRoadKind > 2.5)) {
          float lampPool = pow(0.5 + 0.5 * cos(vUv.y * 0.22), 4.0) * (1.0 - across * 0.5);
          lit += vec3(1.0, 0.82, 0.46) * lampPool * uNightFactor * 0.32;
        }

        float dist = length(cameraPosition - vWorldPos);
        float fogF = 1.0 - exp(-pow(dist * uFogDensity, 1.62));
        lit = mix(lit, uFogColor, clamp(fogF, 0.0, 0.88));

        gl_FragColor = vec4(lit, 1.0);
      }
    `})}var Zd=[{id:"west_south",from:"posad",to:"svetlograd",name:"\u041F\u0440\u0438\u0440\u0435\u0447\u043D\u044B\u0439 \u0442\u0440\u0430\u043A\u0442 (\u0420\u0435\u0447\u043D\u043E\u0439 \u041F\u043E\u0441\u0430\u0434 \u2014 \u0421\u0432\u0435\u0442\u043B\u043E\u0433\u0440\u0430\u0434)",initProg:.3},{id:"east_south",from:"agro",to:"ustport",name:"\u042E\u0436\u043D\u043E\u0435 \u0448\u043E\u0441\u0441\u0435 (\u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u0430 \u2014 \u0423\u0441\u0442\u044C-\u041F\u043E\u0440\u0442)",initProg:.24},{id:"west_mid",from:"svetlograd",to:"kremniy",name:"\u0422\u0435\u0445\u043D\u043E-\u043C\u0430\u0433\u0438\u0441\u0442\u0440\u0430\u043B\u044C (\u0421\u0432\u0435\u0442\u043B\u043E\u0433\u0440\u0430\u0434 \u2014 \u041A\u0440\u0435\u043C\u043D\u0438\u0435\u0432\u044B\u0439 \u041F\u043B\u0451\u0441)",initProg:.14},{id:"bridge_south",from:"posad",to:"ustport",name:"\u042E\u0436\u043D\u044B\u0439 \u0414\u0435\u043B\u044C\u0442\u043E\u0432\u044B\u0439 \u041C\u043E\u0441\u0442 (\u0420\u0435\u0447\u043D\u043E\u0439 \u041F\u043E\u0441\u0430\u0434 \u2014 \u0423\u0441\u0442\u044C-\u041F\u043E\u0440\u0442)",initProg:.06},{id:"east_mid",from:"agro",to:"alumingrad",name:"\u0412\u043E\u0441\u0442\u043E\u0447\u043D\u043E\u0435 \u043F\u0440\u043E\u043C\u0448\u043E\u0441\u0441\u0435 (\u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u0430 \u2014 \u0410\u043B\u044E\u043C\u0438\u043D\u0433\u0440\u0430\u0434)",initProg:0},{id:"west_north",from:"kremniy",to:"sever",name:"\u0421\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u0441\u0435\u0440\u043F\u0430\u043D\u0442\u0438\u043D (\u041A\u0440\u0435\u043C\u043D\u0438\u0435\u0432\u044B\u0439 \u041F\u043B\u0451\u0441 \u2014 \u0421\u0435\u0432\u0435\u0440\u043E\u0431\u043E\u0440\u0441\u043A)",initProg:0},{id:"east_north",from:"alumingrad",to:"kamen",name:"\u0420\u0443\u0434\u043D\u044B\u0439 \u0442\u0440\u0430\u043A\u0442 (\u0410\u043B\u044E\u043C\u0438\u043D\u0433\u0440\u0430\u0434 \u2014 \u041A\u0430\u043C\u0435\u043D\u043D\u043E\u0433\u043E\u0440\u0441\u043A)",initProg:0},{id:"bridge_mid",from:"svetlograd",to:"agro",name:"\u0426\u0435\u043D\u0442\u0440\u0430\u043B\u044C\u043D\u044B\u0439 \u041C\u043E\u0441\u0442 (\u0421\u0432\u0435\u0442\u043B\u043E\u0433\u0440\u0430\u0434 \u2014 \u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u0430)",initProg:0},{id:"bridge_north",from:"kremniy",to:"kamen",name:"\u0412\u044B\u0441\u043E\u043A\u043E\u0433\u043E\u0440\u043D\u044B\u0439 \u041C\u043E\u0441\u0442 (\u041A\u0440\u0435\u043C\u043D\u0438\u0435\u0432\u044B\u0439 \u041F\u043B\u0451\u0441 \u2014 \u041A\u0430\u043C\u0435\u043D\u043D\u043E\u0433\u043E\u0440\u0441\u043A)",initProg:0}];function Qd(){let r=[],t=(u,d,f,g,y,p)=>{let m=new kt(g,y,p);m.translate(u,d,f),r.push(m)};for(let u of[-.5,.5])for(let d of[-.5,.5])t(u,.5,d,.038,1,.038);for(let u of[.32,.66,.98])t(0,u,-.5,1.04,.038*.85,.038),t(0,u,.5,1.04,.038*.85,.038),t(-.5,u,0,.038,.038*.85,1.04),t(.5,u,0,.038,.038*.85,1.04);t(0,.5,-.5,.038*.75,1,.038*.75),t(0,.5,.5,.038*.75,1,.038*.75),t(-.5,.5,0,.038*.75,1,.038*.75),t(.5,.5,0,.038*.75,1,.038*.75);let i=0,n=0;for(let u of r)i+=u.attributes.position.count,n+=u.index.count;let s=new Float32Array(i*3),o=new Float32Array(i*3),a=new Uint16Array(n),l=0,c=0;for(let u of r){s.set(u.attributes.position.array,l*3),o.set(u.attributes.normal.array,l*3);let d=u.index.array;for(let f=0;f<d.length;f++)a[c+f]=d[f]+l;l+=u.attributes.position.count,c+=d.length,u.dispose()}let h=new me;return h.setAttribute("position",new te(s,3)),h.setAttribute("normal",new te(o,3)),h.setIndex(new te(a,1)),h}var Ac=class{constructor(t){this.nodes=new Int32Array(t),this.prios=new Float32Array(t),this.size=0}clear(){this.size=0}push(t,e){let i=this.size++;for(;i>0;){let n=i-1>>1;if(this.prios[n]<=e)break;this.nodes[i]=this.nodes[n],this.prios[i]=this.prios[n],i=n}this.nodes[i]=t,this.prios[i]=e}pop(){let t=this.nodes[0],e=this.nodes[--this.size],i=this.prios[this.size];if(this.size>0){let n=0,s=this.size>>1;for(;n<s;){let o=(n<<1)+1,a=o+1;if(a<this.size&&this.prios[a]<this.prios[o]&&(o=a),i<=this.prios[o])break;this.nodes[n]=this.nodes[o],this.prios[n]=this.prios[o],n=o}this.nodes[n]=e,this.prios[n]=i}return t}},za=class{constructor(){this.routes=[],this.meshDirty=!0,this.completedCount=0,this._navN=88;let t=this._navN*this._navN;this._heap=new Ac(t*2),this._gScore=new Float32Array(t),this._cameFrom=new Int32Array(t),this._closed=new Uint8Array(t),this._bedGrid=new Float32Array(t),this._depthGrid=new Float32Array(t),this._penaltyGrid=new Float32Array(t)}rebuildRoutes(t,e){if(this.routes=[],this.completedCount=0,this.meshDirty=!0,!t||!e||e.length===0)return;let i=this._navN,n=L.size*.9,s=-n*.5,o=n/(i-1),l=In(t.presetId||"bystritsa").gorges||[],c=54*L.horizScale;for(let u=0;u<i;u++){let d=s+u*o;for(let f=0;f<i;f++){let g=s+f*o,y=u*i+f,p=t.sampleAtWorld(g,d);this._bedGrid[y]=p.bed,this._depthGrid[y]=p.depth;let m=0;for(let x=0;x<l.length;x++){let S=Math.hypot(g-l[x].x,d-l[x].z);S<c&&(m+=(1-S/c)*28)}for(let x=0;x<e.length;x++){let S=Math.hypot(g-e[x].x,d-e[x].z),M=e[x].plateauRadius*.56;S<M&&(m+=(1-S/M)*18)}this._penaltyGrid[y]=m}}let h=new Map;for(let u of e)u.connectedRoadsCount=0,u.builtStreetRings=Math.max(1,Math.min(5,Math.ceil(u.buildingIndices.length/8))),h.set(u.id,u);for(let u=0;u<Zd.length;u++){let d=Zd[u],f=h.get(d.from),g=h.get(d.to);if(!f||!g)continue;let y=Math.atan2(g.z-f.z,g.x-f.x),p=f.plateauRadius*.6,m=g.plateauRadius*.6,x=f.x+Math.cos(y)*p,S=f.z+Math.sin(y)*p,M=g.x-Math.cos(y)*m,b=g.z-Math.sin(y)*m,_=this._findTerrainRouteAStar(x,S,M,b,s,o,i),w=this._buildEngineeredProfile(_,t),v=w.length>0?w[w.length-1].arc:0,T=w.some(P=>P.isBridge),C=W(d.initProg||0,0,1),R=Math.floor(C*Math.max(0,w.length-1));this.routes.push({index:u,id:d.id,name:d.name,fromId:d.from,toId:d.to,fromName:f.name,toName:g.name,points:w,totalLengthM:v,hasBridge:T,buildProgress:C,builtSeg:R,completed:C>=1,activeCrew:!1})}}_findTerrainRouteAStar(t,e,i,n,s,o,a){let l=x=>W(Math.round((x-s)/o),0,a-1),c=l(t),h=l(e),u=l(i),d=l(n),f=h*a+c,g=d*a+u;this._gScore.fill(1e12),this._cameFrom.fill(-1),this._closed.fill(0),this._heap.clear(),this._gScore[f]=0,this._heap.push(f,Math.hypot(u-c,d-h)*o);let y=[[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,1.4142],[-1,1,1.4142],[1,-1,1.4142],[-1,-1,1.4142]];for(;this._heap.size>0;){let x=this._heap.pop();if(x===g)break;if(this._closed[x])continue;this._closed[x]=1;let S=x%a,M=x/a|0,b=this._bedGrid[x],_=this._gScore[x];for(let w=0;w<8;w++){let v=S+y[w][0],T=M+y[w][1];if(v<0||v>=a||T<0||T>=a)continue;let C=T*a+v;if(this._closed[C])continue;let R=y[w][2]*o,P=this._bedGrid[C],N=this._depthGrid[C],I=Math.abs(P-b)/R,U=1;I>.21?U=4.2+(I-.21)*125:I>.08&&(U=1+(I-.08)*24);let B=N>.04?3.5+Math.min(3.5,N*.35):0,G=P>L.snowLineY*.85?5.5:0,Q=C===g||x===f?0:this._penaltyGrid[C],F=R*(U+B+G+Q),$=_+F;if($<this._gScore[C]){this._cameFrom[C]=x,this._gScore[C]=$;let K=Math.hypot(u-v,d-T)*o*.98;this._heap.push(C,$+K)}}}let p=[],m=g;if(this._cameFrom[m]===-1&&m!==f)return[{x:t,z:e},{x:(t+i)*.5,z:(e+n)*.5},{x:i,z:n}];for(;m!==-1;){let x=m%a,S=m/a|0;if(p.push({x:s+x*o,z:s+S*o}),m===f)break;m=this._cameFrom[m]}return p.reverse(),p[0]={x:t,z:e},p[p.length-1]={x:i,z:n},p}_buildEngineeredProfile(t,e){let i=t;for(let y=0;y<2&&!(i.length<3);y++){let p=[i[0]];for(let m=0;m<i.length-1;m++){let x=i[m],S=i[m+1];p.push({x:x.x*.75+S.x*.25,z:x.z*.75+S.z*.25}),p.push({x:x.x*.25+S.x*.75,z:x.z*.25+S.z*.75})}p.push(i[i.length-1]),i=p}let n=W(14.5*Math.pow(L.horizScale,.72),13,96),s=[{x:i[0].x,z:i[0].z,arc:0}],o=0,a=0;for(let y=0;y<i.length-1;y++){let p=i[y].x,m=i[y].z,x=i[y+1].x,S=i[y+1].z,M=Math.hypot(x-p,S-m);if(M<1e-4)continue;let b=n-a;for(;b<=M;){let _=b/M;o+=n,s.push({x:$t(p,x,_),z:$t(m,S,_),arc:o}),b+=n}a=M-(b-n)}let l=i[i.length-1],c=s[s.length-1],h=Math.hypot(l.x-c.x,l.z-c.z);h>n*.25||s.length<2?(o+=h,s.push({x:l.x,z:l.z,arc:o})):(c.x=l.x,c.z=l.z);let u=L.elevScale,d=s.map(y=>{let p=e.sampleAtWorld(y.x,y.z);return{wx:y.x,wz:y.z,arc:y.arc,bed:p.bed,waterDepth:p.depth,waterSurf:p.surface,deckY:p.bed+.34*u,isBridge:p.depth>.045,nx:1,nz:0,yaw:0,pitch:0}}),f=d.map(y=>y.isBridge);for(let y=0;y<d.length;y++)if(f[y])for(let p=Math.max(1,y-2);p<=Math.min(d.length-2,y+2);p++)d[p].isBridge=!0;for(let y=0;y<3;y++)for(let p=1;p<d.length-1;p++){if(d[p].isBridge)continue;let m=.25*d[p-1].deckY+.5*d[p].deckY+.25*d[p+1].deckY;d[p].deckY=Math.max(d[p].bed+.32*u,m)}let g=0;for(;g<d.length;){if(!d[g].isBridge){g++;continue}let y=Math.max(0,g-1);for(;g<d.length&&d[g].isBridge;)g++;let p=Math.min(d.length-1,g),m=-1/0;for(let w=y;w<=p;w++)d[w].waterDepth>.03?m=Math.max(m,d[w].waterSurf):m=Math.max(m,d[w].bed);let x=m+3.8*u,S=Math.max(d[y].deckY,d[y].bed+.6*u),M=Math.max(d[p].deckY,d[p].bed+.6*u),b=Math.max(1,p-y),_=W(b*.24*u,1.2*u,4.8*u);for(let w=y;w<=p;w++){let v=(w-y)/b,T=$t(S,M,v),C=Math.sin(v*Math.PI),R=Math.max(T,$t(T,x,Math.min(1,C*1.45)))+_*C;d[w].deckY=Math.max(d[w].bed+.36*u,R)}}for(let y=0;y<d.length;y++){let p=d[Math.max(0,y-1)],m=d[Math.min(d.length-1,y+1)],x=m.wx-p.wx,S=m.wz-p.wz,M=m.deckY-p.deckY,b=Math.hypot(x,S)||1,_=x/b,w=S/b;d[y].nx=-w,d[y].nz=_,d[y].yaw=Math.atan2(x,S),d[y].pitch=Math.atan2(M,b)}return d}step(t,e){if(t<=0||this.routes.length===0)return;let i=new Map;for(let l of e.cities){i.set(l.id,l);let c=W(Math.ceil(l.buildingIndices.length/8),1,6);c!==l.builtStreetRings&&(l.builtStreetRings=c,this.meshDirty=!0)}let n=0,s=3,o=e.totalMW>.5?1.45:1;for(let l=0;l<this.routes.length;l++){let c=this.routes[l];if(c.completed){c.activeCrew=!1;continue}if(n>=s){c.activeCrew=!1;continue}c.activeCrew=!0,n++;let h=i.get(c.fromId),u=i.get(c.toId),d=(h&&h.connected?.55:0)+(u&&u.connected?.55:0),f=c.hasBridge?.84:1,y=(e.creative?.24:.022)*(1+d)*o*f*t;c.buildProgress=Math.min(1,c.buildProgress+y);let p=Math.floor(c.buildProgress*Math.max(0,c.points.length-1));p!==c.builtSeg&&(c.builtSeg=p,this.meshDirty=!0),c.buildProgress>=1&&!c.completed&&(c.completed=!0,c.activeCrew=!1,c.builtSeg=Math.max(0,c.points.length-1),this.completedCount++,this.meshDirty=!0,h&&(h.connectedRoadsCount=(h.connectedRoadsCount||0)+1),u&&(u.connectedRoadsCount=(u.connectedRoadsCount||0)+1),e.callbacks&&e.callbacks.onNotify&&e.callbacks.onNotify(`\u2726 \u041F\u043E\u0441\u0442\u0440\u043E\u0435\u043D\u0430 \u043C\u0435\u0436\u0434\u0443\u0433\u043E\u0440\u043E\u0434\u043D\u044F\u044F \u0442\u0440\u0430\u0441\u0441\u0430: ${c.name}! \u041E\u0442\u043A\u0440\u044B\u0442\u043E \u0434\u0432\u0438\u0436\u0435\u043D\u0438\u0435 \u0442\u0440\u0430\u043D\u0441\u043F\u043E\u0440\u0442\u0430.`,"good"))}let a=0;for(let l of e.cities)l.connectedRoadsCount=0;for(let l of this.routes)if(l.completed){a++;let c=i.get(l.fromId),h=i.get(l.toId);c&&c.connectedRoadsCount++,h&&h.connectedRoadsCount++}this.completedCount=a}},ka=class{constructor(t,e,i,n,s=!1){this.scene=t,this.hydro=e,this.economy=i,this.textures=n,this.shadowEnabled=s,this.group=new we,this.scene.add(this.group),this._dummy=new Be,this._buildMeshes()}_buildMeshes(){this.maxVerts=9500*4,this.maxIndices=9500*6;let e=new me;this.posArr=new Float32Array(this.maxVerts*3),this.normArr=new Float32Array(this.maxVerts*3),this.uvArr=new Float32Array(this.maxVerts*2),this.kindArr=new Float32Array(this.maxVerts);let i=new Uint32Array(this.maxIndices);for(let f=0;f<9500;f++){let g=f*4,y=f*6;i[y]=g,i[y+1]=g+2,i[y+2]=g+1,i[y+3]=g+1,i[y+4]=g+2,i[y+5]=g+3}this.posAttr=new te(this.posArr,3),this.posAttr.setUsage(Fe),this.normAttr=new te(this.normArr,3),this.normAttr.setUsage(Fe),this.uvAttr=new te(this.uvArr,2),this.uvAttr.setUsage(Fe),this.kindAttr=new te(this.kindArr,1),this.kindAttr.setUsage(Fe),e.setIndex(new te(i,1)),e.setAttribute("position",this.posAttr),e.setAttribute("normal",this.normAttr),e.setAttribute("uv",this.uvAttr),e.setAttribute("aRoadKind",this.kindAttr),e.setDrawRange(0,0),this.roadMat=$d(),this.roadMesh=new Mt(e,this.roadMat),this.roadMesh.receiveShadow=this.shadowEnabled,this.roadMesh.frustumCulled=!1,this.group.add(this.roadMesh),this.maxPiers=380;let n=new Ce(.45,.62,1,8);n.translate(0,-.5,0);let s=new ne({color:13358561,map:this.textures.concreteMap});this.bridgePierIM=new oe(n,s,this.maxPiers),this.bridgePierIM.count=0,this.bridgePierIM.castShadow=this.shadowEnabled,this.bridgePierIM.frustumCulled=!1,this.group.add(this.bridgePierIM),this.maxRails=640;let o=new kt(.22,.72,1);o.translate(0,.36,0);let a=new ne({color:14870768,map:this.textures.steel});this.bridgeRailIM=new oe(o,a,this.maxRails),this.bridgeRailIM.count=0,this.bridgeRailIM.frustumCulled=!1,this.group.add(this.bridgeRailIM),this.maxCrews=12;let l=new kt(2.2,1.55,3.6);l.translate(0,1,0);let c=new ne({color:16096779});this.roadMachineIM=new oe(l,c,this.maxCrews),this.roadMachineIM.count=0,this.roadMachineIM.frustumCulled=!1;let h=new Ce(.82,.82,2.5,12);h.rotateZ(Math.PI*.5);let u=new ne({color:4674921,map:this.textures.steel});this.roadDrumIM=new oe(h,u,this.maxCrews),this.roadDrumIM.count=0,this.roadDrumIM.frustumCulled=!1;let d=new Xi(.55,8,8);this.beaconMat=new Se({color:16498468}),this.roadBeaconIM=new oe(d,this.beaconMat,this.maxCrews),this.roadBeaconIM.count=0,this.roadBeaconIM.frustumCulled=!1,this.group.add(this.roadMachineIM,this.roadDrumIM,this.roadBeaconIM)}_appendQuad(t,e,i,n,s,o,a,l,c,h,u,d,f,g,y){if(t+4>this.maxVerts)return t;let p=this.posArr,m=this.normArr,x=this.uvArr,S=this.kindArr,M=[e-s*d,i,n-o*d,0,f,e+s*d,i,n+o*d,1,f,a-h*d,l,c-u*d,0,g,a+h*d,l,c+u*d,1,g];for(let b=0;b<4;b++){let _=t+b,w=_*3,v=_*2,T=b*5;p[w]=M[T],p[w+1]=M[T+1],p[w+2]=M[T+2],m[w]=0,m[w+1]=1,m[w+2]=0,x[v]=M[T+3],x[v+1]=M[T+4],S[_]=y}return t+4}syncGeometry(){let t=this.economy.roadNetwork;if(!t)return;let e=L.horizScale,i=L.elevScale,n=Math.pow(e,.56),s=4.2*n,o=4.7*n,a=3.1*n,l=0,c=0,h=0,u=this._dummy;for(let f of this.economy.cities){let g=W(f.builtStreetRings||1,1,6),y=this.hydro.sampleAtWorld(f.x,f.z).bed+.22*i,p=24;for(let x=1;x<=g;x++){let S=(6.2+(x-1)*8.4)*e;if(S>f.plateauRadius*.84)break;let M=0;for(let b=0;b<p;b++){let _=b/p*Math.PI*2,w=(b+1)/p*Math.PI*2,v=f.x+Math.cos(_)*S,T=f.z+Math.sin(_)*S,C=f.x+Math.cos(w)*S,R=f.z+Math.sin(w)*S,P=Math.max(y,this.hydro.sampleAtWorld(v,T).bed+.22*i),N=Math.max(y,this.hydro.sampleAtWorld(C,R).bed+.22*i),I=Math.hypot(C-v,R-T);l=this._appendQuad(l,v,P,T,Math.cos(_),Math.sin(_),C,N,R,Math.cos(w),Math.sin(w),a*.85,M/Math.max(1,n),(M+I)/Math.max(1,n),3),M+=I}}let m=Math.min(f.plateauRadius*.72,(6.2+(g-.3)*8.4)*e);for(let x=0;x<4;x++){let S=x*Math.PI*.5+.32,M=Math.cos(S),b=Math.sin(S),_=-b,w=M,v=4.2*e;if(m<=v+2)continue;let T=4;for(let C=0;C<T;C++){let R=$t(v,m,C/T),P=$t(v,m,(C+1)/T),N=f.x+M*R,I=f.z+b*R,U=f.x+M*P,B=f.z+b*P,G=Math.max(y,this.hydro.sampleAtWorld(N,I).bed+.23*i),Q=Math.max(y,this.hydro.sampleAtWorld(U,B).bed+.23*i);l=this._appendQuad(l,N,G,I,_,w,U,Q,B,_,w,a,R/Math.max(1,n),P/Math.max(1,n),3)}}}for(let f=0;f<t.routes.length;f++){let g=t.routes[f],y=g.points;if(!y||y.length<2)continue;let p=W(g.builtSeg,0,y.length-1);for(let m=0;m<p;m++){let x=y[m],S=y[m+1],M=x.isBridge||S.isBridge,b=M?1:0,_=M?.22*i:0;if(l=this._appendQuad(l,x.wx,x.deckY+_,x.wz,x.nx,x.nz,S.wx,S.deckY+_,S.wz,S.nx,S.nz,s,x.arc/Math.max(1,n),S.arc/Math.max(1,n),b),M){let w=Math.hypot(S.wx-x.wx,S.wz-x.wz),v=(x.wx+S.wx)*.5,T=(x.wz+S.wz)*.5,C=(x.deckY+S.deckY)*.5+_;for(let R of[-1,1])h<this.maxRails&&(u.position.set(v+x.nx*s*.92*R,C,T+x.nz*s*.92*R),u.rotation.set(-x.pitch,x.yaw,0),u.scale.set(n,Math.pow(i,.68),w*1.03),u.updateMatrix(),this.bridgeRailIM.setMatrixAt(h++,u.matrix));if(m%2===0&&c+1<this.maxPiers){let R=Math.max(2.5,x.deckY+_-(x.bed-2.2*i));for(let P of[-.54,.54])u.position.set(x.wx+x.nx*s*P,x.deckY+_-.1*i,x.wz+x.nz*s*P),u.rotation.set(0,x.yaw,0),u.scale.set(n*1.15,R,n*1.15),u.updateMatrix(),this.bridgePierIM.setMatrixAt(c++,u.matrix)}}}if(!g.completed&&g.activeCrew){let m=Math.min(y.length-1,p+5);for(let x=p;x<m;x++){let S=y[x],M=y[x+1];l=this._appendQuad(l,S.wx,S.deckY-.06*i,S.wz,S.nx,S.nz,M.wx,M.deckY-.06*i,M.wz,M.nx,M.nz,o,S.arc/Math.max(1,n),M.arc/Math.max(1,n),2)}}}let d=l/4|0;this.roadMesh.geometry.setDrawRange(0,d*6),this.posAttr.needsUpdate=!0,this.normAttr.needsUpdate=!0,this.uvAttr.needsUpdate=!0,this.kindAttr.needsUpdate=!0,this.bridgePierIM.count=c,this.bridgeRailIM.count=h,this.bridgePierIM.instanceMatrix.needsUpdate=!0,this.bridgeRailIM.instanceMatrix.needsUpdate=!0,t.meshDirty=!1}updateCrewAnimations(t,e,i,n,s,o,a){let l=this.roadMat.uniforms;l.uSunDir.value.copy(e),l.uSunColor.value.copy(i),l.uSkyColor.value.copy(n),l.uFogColor.value.copy(s),l.uFogDensity.value=o,l.uNightFactor.value=a;let c=this.economy.roadNetwork;if(!c)return;c.meshDirty&&this.syncGeometry();let h=Math.pow(L.horizScale,.56),u=this._dummy,d=0;for(let f=0;f<c.routes.length&&d+1<this.maxCrews;f++){let g=c.routes[f];if(g.completed||!g.activeCrew||g.points.length<3)continue;let y=W(g.builtSeg,0,g.points.length-2),p=g.points[y],m=g.points[y+1],x=.5+.45*Math.sin(t*1.8+f*2.1),S=$t(p.wx,m.wx,x),M=$t(p.deckY,m.deckY,x)+.15*L.elevScale,b=$t(p.wz,m.wz,x);u.position.set(S,M,b),u.rotation.set(-p.pitch,p.yaw,0),u.scale.set(h*1.15,h*1.15,h*1.15),u.updateMatrix(),this.roadMachineIM.setMatrixAt(d,u.matrix);let _=Math.sin(p.yaw)*2.2*h,w=Math.cos(p.yaw)*2.2*h;u.position.set(S+_,M+.75*h,b+w),u.rotation.set(t*4.5,p.yaw,0),u.scale.set(h,h,h),u.updateMatrix(),this.roadDrumIM.setMatrixAt(d,u.matrix);let v=.75+.45*Math.sin(t*9+f*1.7);u.position.set(S,M+2.9*h,b),u.rotation.set(0,0,0),u.scale.setScalar(h*v),u.updateMatrix(),this.roadBeaconIM.setMatrixAt(d,u.matrix),d++}this.roadMachineIM.count=d,this.roadDrumIM.count=d,this.roadBeaconIM.count=d,d>0&&(this.roadMachineIM.instanceMatrix.needsUpdate=!0,this.roadDrumIM.instanceMatrix.needsUpdate=!0,this.roadBeaconIM.instanceMatrix.needsUpdate=!0)}};var Oa=[{id:"spotEnergy",label:"\u0421\u043F\u043E\u0442\u043E\u0432\u044B\u0439 \u0440\u044B\u043D\u043E\u043A \u041E\u0420\u042D\u041C (\u043F\u0438\u043A\u0438 \u041C\u0412\u0442\xB7\u0447)",color:"#fbbf24"},{id:"industrialPPA",label:"\u041F\u0440\u044F\u043C\u044B\u0435 \u043A\u043E\u043D\u0442\u0440\u0430\u043A\u0442\u044B (\u0410\u043B\u044E\u043C\u0438\u043D\u0438\u0439 + \u0426\u041E\u0414 \u0418\u0418)",color:"#38bdf8"},{id:"capacityMarket",label:"\u041C\u0430\u043D\u0435\u0432\u0440\u0435\u043D\u043D\u0430\u044F \u043C\u043E\u0449\u043D\u043E\u0441\u0442\u044C \u0410\u0420\u0427\u041C (50 \u0413\u0446)",color:"#a78bfa"},{id:"gaesArbitrage",label:"\u0426\u0435\u043D\u043E\u0432\u043E\u0439 \u0430\u0440\u0431\u0438\u0442\u0440\u0430\u0436 \u0413\u0410\u042D\u0421 (\u043D\u043E\u0447\u044C \u2192 \u043F\u0438\u043A)",color:"#2dd4bf"},{id:"navigationLocks",label:"\u0421\u0443\u0434\u043E\u0445\u043E\u0434\u043D\u044B\u0435 \u0448\u043B\u044E\u0437\u044B \u0438 \u0440\u0435\u0447\u043D\u043E\u0439 \u0444\u043B\u043E\u0442",color:"#60a5fa"},{id:"waterSupply",label:"\u0413\u043E\u0440\u0432\u043E\u0434\u043E\u043A\u0430\u043D\u0430\u043B \u0438 \u0442\u0435\u0445\u0432\u043E\u0434\u043E\u0441\u043D\u0430\u0431\u0436\u0435\u043D\u0438\u0435",color:"#34d399"},{id:"agroIrrigation",label:"\u0410\u0433\u0440\u043E-\u0438\u0440\u0440\u0438\u0433\u0430\u0446\u0438\u044F \u043F\u043E\u043B\u0435\u0439 \u0438 \u0442\u0435\u043F\u043B\u0438\u0446",color:"#84cc16"},{id:"aquaculture",label:"\u0424\u043E\u0440\u0435\u043B\u0435\u0432\u044B\u0435 \u0440\u044B\u0431\u0445\u043E\u0437\u044B \u0438 \u0430\u043A\u0432\u0430\u043A\u0443\u043B\u044C\u0442\u0443\u0440\u0430",color:"#fb923c"},{id:"ecoTourism",label:"\u042F\u0445\u0442-\u043C\u0430\u0440\u0438\u043D\u044B \u0438 \u043A\u0440\u0443\u0438\u0437\u043D\u044B\u0439 \u044D\u043A\u043E-\u0442\u0443\u0440\u0438\u0437\u043C",color:"#f472b6"},{id:"aggregateSales",label:"\u042D\u043A\u0441\u043F\u043E\u0440\u0442 \u0433\u0440\u0430\u043D\u0438\u0442\u043D\u043E\u0433\u043E \u0449\u0435\u0431\u043D\u044F \u0441 \u0432\u044B\u0435\u043C\u043E\u043A",color:"#cbd5e1"},{id:"carbonCredits",label:"\u0417\u0435\u043B\u0451\u043D\u044B\u0435 \u0443\u0433\u043B\u0435\u0440\u043E\u0434\u043D\u044B\u0435 \u0441\u0435\u0440\u0442\u0438\u0444\u0438\u043A\u0430\u0442\u044B CO\u2082",color:"#4ade80"},{id:"floodControl",label:"\u041F\u0440\u0435\u043C\u0438\u044F \u041C\u0427\u0421 \u0437\u0430 \u0441\u0440\u0435\u0437\u043A\u0443 \u043F\u0430\u0432\u043E\u0434\u043A\u043E\u0432",color:"#f87171"}],Ha=class{constructor(t,e={}){this.hydro=t,this.callbacks=e,this.clock=new Fa({step:1/30,maxSteps:6}),this._rng=Zn(987654),this.hydrology=new Ua,this.roadNetwork=new za,this.resetEconomy()}resetEconomy(){this.cash=Re.startingCash,this.loan=0,this.creative=!1,this.day=1,this.hour=8.5,this.weatherId="normal",this.weatherTimer=54,this.totalMW=0,this.pumpedConsumeMW=0,this.netDeliveredMW=0,this.gridLossPct=0,this.connectedDemandMW=0,this.totalCityDemandMW=0,this.suppliedCityMW=0,this.exportedMW=0,this.spotMultiplier=bc(this.hour),this.incomePerSec=0,this.upkeepPerSec=0,this.netPerSec=0,this.totalEarned=0,this.totalMWhGenerated=0,this.totalCO2SavedTons=0,this.agroIrrigated=!1,this._seepageWarnCooldown=0,this._gaesStoredMWh=0,this.revenueRates={},this.revenueTotals={};for(let t of Oa)this.revenueRates[t.id]=0,this.revenueTotals[t.id]=0;this.completedMilestones=new Set,this.hydrology.reset(),this.cities=[],this.allBuildings=[],this.buildingsDirty=!0,this.powerLinesDirty=!0,this._initCities(),this.roadNetwork.rebuildRoutes(this.hydro,this.cities),this._applyWeatherToHydro()}_initCities(){this.cities=[],this.allBuildings=[];let t=L.horizScale;for(let e=0;e<oi.length;e++){let i=oi[e],n=Zn(1e3+e*777),s=[];for(let l=1;l<=6;l++){let c=l*6+4,h=(8.5+(l-1)*8.4)*t;for(let u=0;u<c&&!(s.length>=78);u++){let d=u/c*Math.PI*2+l*.43+(n()-.5)*.16,f=h+(n()-.5)*2.2*t;if(f>i.plateauRadius*.92)continue;let g=i.x+Math.cos(d)*f,y=i.z+Math.sin(d)*f;if(Math.abs(g)>L.half*.94||Math.abs(y)>L.half*.94)continue;let p=this.hydro.sampleAtWorld(g,y);p.depth>.25||s.push({wx:g,wz:y,wy:p.bed,yaw:Math.round((d+Math.PI*.5)/(Math.PI*.5))*(Math.PI*.5)+(n()-.5)*.12,ring:l,occupied:!1,buildingIndex:-1})}}let o={...i,connected:!!i.connectedAtStart,population:i.startPop,level:1,levelName:"\u041F\u043E\u0441\u0451\u043B\u043E\u043A",satisfaction:.78,powerRatio:0,currentDemandMW:i.baseDemandMW,suppliedMW:0,growthProgress:.18,isFlooded:!1,irrigated:!1,lots:s,buildingIndices:[],blackoutTimer:0,activeBuildCount:0,currentProjectLabel:"",builtStreetRings:1,connectedRoadsCount:0},a=i.archetype==="metropolis"?7:i.archetype==="industrial"||i.archetype==="smelter"?6:5;for(let l=0;l<a&&l<s.length;l++)this._spawnBuildingInCity(o,s[l],1,n);if(a<s.length){let l=this._spawnBuildingInCity(o,s[a],.52,n);o.activeBuildCount++,o.currentProjectLabel=`${l.label} (52%)`}a+1<s.length&&(this._spawnBuildingInCity(o,s[a+1],.14,n),o.activeBuildCount++),this._recalcCityTier(o),this.cities.push(o)}this.buildingsDirty=!0,this.powerLinesDirty=!0}_chooseBuildingArchetype(t,e,i){let s={town:["res","mid","civ","util","ind"],metropolis:["res","mid","high","civ","util","sci"],civic:["res","mid","high","civ","util","sci"],industrial:["ind","mid","res","util","civ"],industry:["ind","mid","res","util","civ"],agro:["agro","res","util","civ"],science:["sci","res","civ","mid","util"],alpine:["res","civ","sci","port"],smelter:["smlt","ind","util","mid"],datacenter:["dc","sci","high","mid","civ"],tech:["dc","sci","high","mid","civ"],port:["port","mid","res","ind","civ"],resort:["port","res","civ","mid"]}[t.archetype]||["res","mid","civ"],o=Sc.filter(a=>s.includes(a.cat));if(o.length===0)return Sc[0];if(e<=2&&t.level>=2){let a=o.filter(l=>l.hMax>=22||l.shape==="spire"||l.shape==="tower"||l.cat==="dc");if(a.length>0&&i()<.65)return a[Math.floor(i()*a.length)]}return o[Math.floor(i()*o.length)]}_spawnBuildingInCity(t,e,i=.05,n=this._rng){e.occupied=!0;let s=this._chooseBuildingArchetype(t,e.ring,n),o=Math.pow(L.horizScale,.56),a=Math.pow(L.elevScale,.68),l=s.w*(.86+n()*.28)*o,c=s.d*(.86+n()*.28)*o,h=(s.hMin+n()*(s.hMax-s.hMin))*a,u=Ki("city_facades",Math.floor(n()*1e3)+this.allBuildings.length*7),d=Ki("roofs_metals",Math.floor(n()*1e3)+this.allBuildings.length*13),f=s.shape==="cyl"||s.shape==="cool"?"silo":s.shape==="arch"||s.shape==="spire"?"dome":s.shape==="gable"?"gable":"flat",g={res:28,mid:135,high:380,civ:45,agro:22,ind:32,smlt:40,dc:26,port:48,util:18,sci:34},y=this.hydro.sampleAtWorld(e.wx,e.wz),p=this.allBuildings.length,m={index:p,cityId:t.id,kind:s.id,label:s.name,roofType:f,styleId:s.style+(n()<.45?32:0),shadeHex:u.hex,shadeR:u.r,shadeG:u.g,shadeB:u.b,roofR:d.r,roofG:d.g,roofB:d.b,wx:e.wx,wy:y.bed,wz:e.wz,yaw:e.yaw,sx:l,sy:h,sz:c,popGain:g[s.cat]||40,tier:t.level,anim:i,lit:1,tint:n()};return e.buildingIndex=p,this.allBuildings.push(m),t.buildingIndices.push(p),this.buildingsDirty=!0,m}_recalcCityTier(t){let e=t.buildingIndices.length;e>=46?(t.level=5,t.levelName="\u041C\u0435\u0433\u0430\u043F\u043E\u043B\u0438\u0441"):e>=32?(t.level=4,t.levelName="\u041A\u0440\u0443\u043F\u043D\u044B\u0439 \u0443\u0437\u0435\u043B"):e>=21?(t.level=3,t.levelName="\u0420\u0430\u0437\u0432\u0438\u0442\u044B\u0439 \u0433\u043E\u0440\u043E\u0434"):e>=13?(t.level=2,t.levelName="\u0413\u043E\u0440\u043E\u0434\u043E\u043A"):(t.level=1,t.levelName="\u041F\u043E\u0441\u0451\u043B\u043E\u043A")}connectCityGrid(t){let e=this.cities.find(n=>n.id===t);if(!e)return{ok:!1,reason:"\u0413\u043E\u0440\u043E\u0434 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D"};if(e.connected)return{ok:!1,reason:"\u0413\u043E\u0440\u043E\u0434 \u0443\u0436\u0435 \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0451\u043D \u043A \u044D\u043D\u0435\u0440\u0433\u043E\u0441\u0435\u0442\u0438"};let i=this.estimatePowerLineCost(e);return!this.creative&&this.cash<i?{ok:!1,reason:`\u041D\u0443\u0436\u043D\u043E ${i.toLocaleString("ru-RU")} \u20BD \u043D\u0430 \u0441\u0442\u0440\u043E\u0438\u0442\u0435\u043B\u044C\u0441\u0442\u0432\u043E \u041B\u042D\u041F`}:(this.creative||(this.cash-=i),e.connected=!0,this.powerLinesDirty=!0,this.callbacks.onNotify&&this.callbacks.onNotify(`\u2726 \u041C\u0430\u0433\u0438\u0441\u0442\u0440\u0430\u043B\u044C \u041B\u042D\u041F \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u0430 \u043A: ${e.name}!`,"good"),{ok:!0,cost:i,city:e})}estimatePowerLineCost(t){let e=Math.hypot(t.x-12*L.horizScale,t.z- -152*L.horizScale);for(let n of this.hydro.substations){let s=Math.hypot(t.x-n.wx,t.z-n.wz);s<e&&(e=s)}for(let n of this.hydro.turbines){let s=Math.hypot(t.x-n.wx,t.z-n.wz);s<e&&(e=s)}let i=e/L.horizScale;return Math.max(1900,Math.round(i*13.5))}sellAggregateBatch(){let t=this.hydro.rockStockpileM3*this.hydro.volPriceNorm;if(t<40)return{ok:!1,reason:"\u041D\u0430 \u0441\u043A\u043B\u0430\u0434\u0435 \u043C\u0430\u043B\u043E \u0449\u0435\u0431\u043D\u044F \u2014 \u043F\u0440\u043E\u0440\u043E\u0439\u0442\u0435 \u043A\u0430\u043D\u0430\u043B \u0438\u043B\u0438 \u0441\u043A\u0430\u043B\u044C\u043D\u0443\u044E \u0432\u044B\u0435\u043C\u043A\u0443!"};let e=.65,i=this.hydro.rockStockpileM3*e,n=t*e;this.hydro.rockStockpileM3-=i;let s=Math.round(n*Re.aggregateSellPricePerM3*3.2);return this.earn(s),this.revenueTotals.aggregateSales+=s,{ok:!0,soldM3:Math.round(i),revenue:s}}canAfford(t){return this.creative||this.cash>=t}spend(t){return this.creative||t<=0?!0:this.cash<t?!1:(this.cash-=t,!0)}earn(t){t>0&&(this.cash+=t,this.totalEarned+=t)}takeGreenLoan(){return this.loan>=Re.maxLoan?{ok:!1,reason:"\u041B\u0438\u043C\u0438\u0442 \u0437\u0435\u043B\u0451\u043D\u044B\u0445 \u043E\u0431\u043B\u0438\u0433\u0430\u0446\u0438\u0439 \u0438\u0441\u0447\u0435\u0440\u043F\u0430\u043D"}:(this.loan+=Re.loanChunk,this.cash+=Re.loanChunk,{ok:!0,amount:Re.loanChunk})}repayLoan(){if(this.loan<=0)return{ok:!1,reason:"\u041A\u0440\u0435\u0434\u0438\u0442\u043E\u0432 \u043D\u0435\u0442"};let t=Math.min(this.cash,Math.min(Re.loanChunk,this.loan));return t<=100?{ok:!1,reason:"\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0441\u0440\u0435\u0434\u0441\u0442\u0432 \u0434\u043B\u044F \u043F\u043E\u0433\u0430\u0448\u0435\u043D\u0438\u044F"}:(this.cash-=t,this.loan-=t,{ok:!0,amount:t})}setWeather(t){$e[t]&&(this.weatherId=t,this._applyWeatherToHydro())}_applyWeatherToHydro(){let t=$e[this.weatherId]||$e.normal;this.hydro.inflowMult=t.inflowMult,this.hydro.rainRate=t.rainRate}update(t){this.clock.advance(t,(n,s)=>this._simulateFixedStep(n,s)),this.roadNetwork.step(t,this);let e=new Map;for(let n=0;n<this.cities.length;n++){let s=this.cities[n];s.activeBuildCount=0,s.currentProjectLabel="",e.set(s.id,s)}let i=!1;for(let n=0;n<this.allBuildings.length;n++){let s=this.allBuildings[n];if(s.anim<1){let o=e.get(s.cityId),a=o&&o.connected&&o.powerRatio>=.45?1.85:1,l=this.creative?.42:.068*a;s.anim=Math.min(1,s.anim+t*l),i=!0,s.anim<.995&&o&&(o.activeBuildCount++,o.currentProjectLabel||(o.currentProjectLabel=`${s.label} (${Math.round(s.anim*100)}%)`))}}i&&(this.buildingsDirty=!0)}_simulateFixedStep(t,e){let i=24/L.dayLengthSec;if(this.hour+=t*i,this.hour>=24&&(this.hour-=24,this.day+=1),this._seepageWarnCooldown>0&&(this._seepageWarnCooldown-=t),this.weatherTimer-=t,this.weatherTimer<=0){this.weatherTimer=42+this._rng()*34;let ht=$e[this.weatherId]||$e.normal,it=this._rng(),Lt=0;for(let[jt,Yt]of Object.entries(ht.next))if(Lt+=Yt,it<=Lt){if(jt!==this.weatherId){this.weatherId=jt,this._applyWeatherToHydro();let qt=$e[jt];this.callbacks.onNotify&&this.callbacks.onNotify(`${qt.icon} \u0413\u0438\u0434\u0440\u043E\u043F\u0440\u043E\u0433\u043D\u043E\u0437: ${qt.label} (\u043F\u0440\u0438\u0442\u043E\u043A \u0440\u0435\u043A \xD7${qt.inflowMult.toFixed(2)})`,jt==="flood"?"warn":"info")}break}}this.spotMultiplier=bc(this.hour),this.hydro.isOffPeakNight=this.hour>=.2&&this.hour<5.8;let n=this.cities.filter(ht=>ht.connected).length;this.hydrology.step(t,this.hydro,this.hour,this.weatherId,n,this.agroIrrigated);for(let ht=0;ht<this.hydro.turbines.length;ht++){let it=this.hydro.turbines[ht];if(it.autoDispatch&&!it.isPumpingNow){let Lt=this.spotMultiplier>=1.45?1:this.spotMultiplier<.7?.28:.76;it.throttle+=(Lt-it.throttle)*W(t*1.8,0,1)}it.cavitation>.25&&(it.condition=Math.max(.45,it.condition-it.cavitation*.0012*t))}let s=0,o=0,a=0,l=0;for(let ht=0;ht<this.hydro.turbines.length;ht++){let it=this.hydro.turbines[ht];s+=it.powerMW,o+=it.pumpConsumeMW||0,(it.grossHead>it.spec.minHead*.5||it.isPumpingNow)&&(a+=it.spec.ratedMW),l+=it.spec.upkeepPerSec}l+=this.hydro.substations.length*4,l+=this.hydro.navLocks.length*3,l+=this.hydro.fishFarms.length*2,this.totalMW=s,this.pumpedConsumeMW=o;let c=s*t/3600;this.totalMWhGenerated+=c,this.totalCO2SavedTons+=c*.82*120;let h=1/Math.pow(L.powerScale,.72),d=this.hydro.substations.length>0?Ee.gridLossWithSub:s>3*L.powerScale?Ee.baseGridLossNoSub:.06;this.gridLossPct=Math.round(d*100);let f=s*(1-d);this.netDeliveredMW=f,this.hydro.totalSeepageQ>2.2*L.flowScale&&this._seepageWarnCooldown<=0&&(this._seepageWarnCooldown=38,this.callbacks.onNotify&&this.callbacks.onNotify("\u25B2 \u0424\u0438\u043B\u044C\u0442\u0440\u0430\u0446\u0438\u044F \u0414\u0430\u0440\u0441\u0438 \u043F\u043E\u0434 \u043F\u043E\u0434\u043E\u0448\u0432\u043E\u0439 \u0432\u044B\u0441\u043E\u043A\u043E\u0439 \u043F\u043B\u043E\u0442\u0438\u043D\u044B! \u0423\u043A\u0440\u0435\u043F\u0438\u0442\u0435 \u0441\u0442\u0432\u043E\u0440 \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u043E\u043C [6] \u041A\u043E\u043D\u0442\u0440\u0444\u043E\u0440\u0441 / \u0426\u0435\u043C\u0435\u043D\u0442\u0430\u0446\u0438\u044F.","warn")),e%10===0&&this._checkHydroCityInteractions();let g=this.hour,y=g>=17&&g<22.5?1.32:g>=6.5&&g<11?1.15:g<6?.74:1,p=0,m=0;for(let ht=0;ht<this.cities.length;ht++){let it=this.cities[ht],Lt=it.buildingIndices.length;it.currentDemandMW=(it.baseDemandMW+Lt*it.demandPerBuilding)*y,p+=it.currentDemandMW,it.connected&&(m+=it.currentDemandMW)}this.totalCityDemandMW=p,this.connectedDemandMW=m;let x=f,S=0,M=0,b=0,_=!1;for(let ht=0;ht<this.cities.length;ht++){let it=this.cities[ht];if(it.isFlooded&&(_=!0),!it.connected){it.suppliedMW=0,it.powerRatio=0,it.satisfaction=Math.max(.35,it.satisfaction-t*.01),!it.isFlooded&&it.buildingIndices.length<18&&(it.activeBuildCount||0)<2&&(it.growthProgress+=t/22,it.growthProgress>=1&&(it.growthProgress-=1,this._growCityOneStep(it)));continue}let Lt=Math.min(it.currentDemandMW,x);if(x=Math.max(0,x-Lt),it.suppliedMW=Lt,it.powerRatio=it.currentDemandMW>1e-4?W(Lt/it.currentDemandMW,0,1):1,S+=Lt,it.archetype==="smelter"||it.archetype==="tech"||it.archetype==="datacenter"||it.archetype==="industrial"?b+=Lt*h*Re.baseRatePerMWSec*(.85+.45*this.spotMultiplier)*it.tariffBonus*Re.industrialPPAMultiplier:M+=Lt*h*Re.baseRatePerMWSec*this.spotMultiplier*it.tariffBonus,(it.powerRatio>=.5||this.creative)&&!it.isFlooded){it.blackoutTimer=0,it.satisfaction=Math.min(1,it.satisfaction+t*.05);let Yt=it.needsIrrigation&&it.irrigated?1.85:1,qt=1+Math.min(.36,(it.connectedRoadsCount||0)*.12),Qt=(.48+1.05*(this.creative?Math.max(.85,it.powerRatio):it.powerRatio))*qt*(this.creative?2.2:1);(it.activeBuildCount||0)<3&&(it.growthProgress+=t/10.5*Qt*Yt),it.growthProgress>=1&&(it.growthProgress-=1,this._growCityOneStep(it))}else it.satisfaction=Math.max(.15,it.satisfaction-t*(it.isFlooded?.08:.025)),s>.05&&it.powerRatio<.4&&(it.blackoutTimer+=t),!it.isFlooded&&it.buildingIndices.length<18&&(it.activeBuildCount||0)<2&&(it.growthProgress+=t/22,it.growthProgress>=1&&(it.growthProgress-=1,this._growCityOneStep(it)))}let w=Math.max(0,f-S),v=this.cities.some(ht=>ht.connected);this.exportedMW=v?w:0,this.exportedMW>0&&(M+=this.exportedMW*h*Re.baseRatePerMWSec*this.spotMultiplier*Re.overSupplyExportFactor);let T=v?a*h*Re.capacityPaymentPerMWSec:0,C=0;if(o>.05)this._gaesStoredMWh+=o*h*t*.84,l+=o*h*Re.baseRatePerMWSec*Re.pumpedNightBuyFactor;else if(this._gaesStoredMWh>.01&&this.spotMultiplier>=1.35&&s>.5){let ht=Math.min(this._gaesStoredMWh,s*h*t*.65);this._gaesStoredMWh-=ht,C=ht/t*Re.baseRatePerMWSec*1.48}let R=this.cities.some(ht=>ht.archetype==="port"&&ht.connected),P=W(this.hydrology.wetSurfaceHectares/Math.max(1.5,4*L.horizScale),.35,1.8),N=(this.hydro.navLocks.length*Re.navLockTollPerSec+(R?32:8))*P;for(let ht=0;ht<this.hydro.navLocks.length;ht++)this.hydro.navLocks[ht].cyclePhase=(this.hydro.navLocks[ht].cyclePhase+t*.18)%1;let I=this.cities.reduce((ht,it)=>ht+(it.connected?it.population:0),0)/1e3,U=this.hydro.damCellCount>4,B=(U?1:.35)*I*Re.municipalWaterPerKPopSec,G=this.cities.find(ht=>ht.archetype==="agro"),Q=G?1+G.level*.28:1,F=this.agroIrrigated?Re.irrigationBonusPerSec*Q:0,$=W(1.18-this.hydro.meanReservoirTurbidity*.85,.45,1.25),K=this.hydro.fishFarms.length*Re.fishFarmIncomePerSec*$,at=this.cities.find(ht=>ht.archetype==="resort"),rt=at&&at.connected?2.1:1,It=U?W(this.hydrology.wetSurfaceHectares/(8*L.horizScale*L.horizScale),.25,2.5):.15,ut=Re.ecoTourismPerMarinaSec*It*rt+this.hydro.fishFarms.length*14,Pt=0,q=450/this.hydro.volPriceNorm;if(this.hydro.rockStockpileM3>q){let ht=Math.min(this.hydro.rockStockpileM3-q,8.5/this.hydro.volPriceNorm*t);this.hydro.rockStockpileM3-=ht,Pt=ht*this.hydro.volPriceNorm/t*Re.aggregateSellPricePerM3}let Z=s*h*Re.carbonCreditPerMWSec,vt=(this.weatherId==="rain"||this.weatherId==="flood")&&U&&!_?Re.floodProtectionBonusSec*(this.weatherId==="flood"?1.65:1):0,lt=this.revenueRates;lt.spotEnergy=M,lt.industrialPPA=b,lt.capacityMarket=T,lt.gaesArbitrage=C,lt.navigationLocks=N,lt.waterSupply=B,lt.agroIrrigation=F,lt.aquaculture=K,lt.ecoTourism=ut,lt.aggregateSales=Pt,lt.carbonCredits=Z,lt.floodControl=vt;let Ht=0;for(let ht of Oa){let it=lt[ht.id]||0;Ht+=it,this.revenueTotals[ht.id]+=it*t}let fe=this.loan*Re.loanInterestPerSec;this.suppliedCityMW=S,this.incomePerSec=Ht,this.upkeepPerSec=l+fe,this.netPerSec=this.incomePerSec-this.upkeepPerSec;let Wt=this.netPerSec*t;Wt>=0?this.earn(Wt):this.creative||(this.cash=Math.max(0,this.cash+Wt)),e%15===0&&this._checkMilestones()}_checkHydroCityInteractions(){let t=L.horizScale;for(let e=0;e<this.cities.length;e++){let i=this.cities[e],n=0,s=Math.max(1,Math.floor(i.lots.length/8)),o=0;for(let l=0;l<i.lots.length;l+=s){let c=this.hydro.sampleAtWorld(i.lots[l].wx,i.lots[l].wz);o++,c.depth>.48*L.elevScale&&n++}let a=i.isFlooded;if(i.isFlooded=o>0&&n/o>=.25,i.isFlooded&&!a&&this.callbacks.onNotify&&this.callbacks.onNotify(`! \u0412\u043D\u0438\u043C\u0430\u043D\u0438\u0435! \u041F\u043E\u0434\u0442\u043E\u043F\u043B\u0435\u043D\u044B \u043A\u0432\u0430\u0440\u0442\u0430\u043B\u044B \u0433. ${i.name}! \u041E\u0442\u043A\u0440\u043E\u0439\u0442\u0435 \u0432\u043E\u0434\u043E\u0441\u0431\u0440\u043E\u0441 \u0438\u043B\u0438 \u0443\u043A\u0440\u0435\u043F\u0438\u0442\u0435 \u0431\u0435\u0440\u0435\u0433!`,"danger"),i.needsIrrigation&&i.irrigationTarget){let l=i.irrigationTarget,c=!1,h=12*t,u=[[0,0],[-h,-h*.7],[h,h*.7],[-h*.8,h*.8],[h*.8,-h*.8]];for(let d=0;d<u.length;d++)if(this.hydro.sampleAtWorld(l.x+u[d][0],l.z+u[d][1]).depth>.16){c=!0;break}c&&!i.irrigated?(i.irrigated=!0,this.agroIrrigated=!0,this.callbacks.onNotify&&this.callbacks.onNotify("\u25C8 \u0412\u043E\u0434\u0430 \u043F\u0440\u0438\u0448\u043B\u0430 \u0432 \u043E\u0440\u043E\u0441\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u0431\u0430\u0441\u0441\u0435\u0439\u043D \u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u044B! \u0424\u0435\u0440\u043C\u044B \u0438 \u044D\u043B\u0435\u0432\u0430\u0442\u043E\u0440\u044B \u043F\u043E\u0448\u043B\u0438 \u0432 \u0440\u043E\u0441\u0442!","good")):!c&&i.irrigated&&(i.irrigated=!1,this.agroIrrigated=!1)}}}_growCityOneStep(t){let e=t.lots.find(n=>!n.occupied);if(e){let n=this._spawnBuildingInCity(t,e,.05,this._rng);t.population+=n.popGain||95;let s=t.level;this._recalcCityTier(t),t.level>s&&this.callbacks.onNotify&&this.callbacks.onNotify(`\u2605 ${t.name} \u0432\u044B\u0440\u043E\u0441 \u0434\u043E \u0441\u0442\u0430\u0442\u0443\u0441\u0430 \xAB${t.levelName}\xBB (${t.population.toLocaleString("ru-RU")} \u0436\u0438\u0442.)!`,"good");return}let i=Math.pow(L.elevScale,.78);for(let n=0;n<t.buildingIndices.length;n++){let s=this.allBuildings[t.buildingIndices[n]];if(s.sy<18*i){s.sy=Math.min(36*i,s.sy*1.55),s.sx*=1.12,s.sz*=1.12,s.styleId=9,s.roofType="flat",s.anim=.35,t.population+=210,this.buildingsDirty=!0;return}}}_checkMilestones(){let t=this.cities.reduce((n,s)=>n+s.population,0),e=this.cities.filter(n=>n.connected).length,i={totalMW:this.totalMW,excavatedNormM3:this.hydro.excavatedNormM3,agroIrrigated:this.agroIrrigated,connectedCities:e,totalPopulation:t,reinforcedCells:this.hydro.reinforcedCellCount,substations:this.hydro.substations.length,navLocks:this.hydro.navLocks.length,fishFarms:this.hydro.fishFarms.length};for(let n=0;n<_r.length;n++){let s=_r[n];this.completedMilestones.has(s.id)||s.check(i)&&(this.completedMilestones.add(s.id),this.earn(s.reward),this.callbacks.onMilestone&&this.callbacks.onMilestone(s))}}getSummary(){let t=this.cities.reduce((i,n)=>i+n.population,0),e=Nd(this.hour);return{cash:this.cash,loan:this.loan,day:this.day,hour:this.hour,weather:$e[this.weatherId]||$e.normal,spotMultiplier:this.spotMultiplier,periodLabel:e.label,periodClass:e.cls,totalMW:this.totalMW,pumpedConsumeMW:this.pumpedConsumeMW,netDeliveredMW:this.netDeliveredMW,gridLossPct:this.gridLossPct,connectedDemandMW:this.connectedDemandMW,totalCityDemandMW:this.totalCityDemandMW,suppliedCityMW:this.suppliedCityMW,exportedMW:this.exportedMW,incomePerSec:this.incomePerSec,upkeepPerSec:this.upkeepPerSec,netPerSec:this.netPerSec,totalPopulation:t,totalBuildings:this.allBuildings.length,co2SavedTons:this.totalCO2SavedTons,soilStockpileM3:this.hydro.soilStockpileM3,rockStockpileM3:this.hydro.rockStockpileM3,pendingPourM3:this.hydro.pendingPourVolumeM3,maxDamStress:this.hydro.maxDamStress,seepageQ:this.hydro.totalSeepageQ,agroIrrigated:this.agroIrrigated,substationsCount:this.hydro.substations.length,navLocksCount:this.hydro.navLocks.length,fishFarmsCount:this.hydro.fishFarms.length,roadsBuiltCount:this.roadNetwork.completedCount,roadsTotalCount:this.roadNetwork.routes.length,revenueRates:this.revenueRates,revenueTotals:this.revenueTotals,waterReport:this.hydrology.getReport(this.hydro,this.hour)}}};function Wg(){let r=[{group:"hydro_optics",groupLabel:"\u0413\u0438\u0434\u0440\u043E\u0434\u0438\u043D\u0430\u043C\u0438\u043A\u0430, 3D-\u043F\u0435\u0440\u0435\u043B\u0438\u0432\u044B \u0438 \u043E\u043F\u0442\u0438\u043A\u0430 \u0432\u043E\u0434\u044B",items:["\u0412\u043E\u0434\u043E\u043F\u0430\u0434\u043D\u0430\u044F \u043F\u0435\u043B\u0435\u043D\u0430 \u043F\u0435\u0440\u0435\u043B\u0438\u0432\u0430 \u043F\u043B\u043E\u0442\u0438\u043D\u044B (\u0431\u044B\u0441\u0442\u0440\u0430\u044F)","\u0412\u043E\u0434\u043E\u043F\u0430\u0434\u043D\u0430\u044F \u043F\u0435\u043B\u0435\u043D\u0430 \u043F\u0435\u0440\u0435\u043B\u0438\u0432\u0430 (\u0441\u0440\u0435\u0434\u043D\u0438\u0439 \u043D\u0430\u043F\u043E\u0440)","\u0422\u043E\u043D\u043A\u0430\u044F \u043F\u0435\u0440\u0435\u043B\u0438\u0432\u043D\u0430\u044F \u043A\u0440\u043E\u043C\u043A\u0430 \u0433\u0440\u0435\u0431\u043D\u044F","\u0421\u0442\u0440\u0443\u044F \u043E\u0442\u043A\u0440\u044B\u0442\u043E\u0433\u043E \u043B\u043E\u0442\u043A\u0430 \u0432\u043E\u0434\u043E\u0441\u0431\u0440\u043E\u0441\u0430","\u0422\u0440\u0430\u043C\u043F\u043B\u0438\u043D\u043D\u044B\u0439 \u043E\u0442\u0440\u044B\u0432 \u043F\u043E\u0442\u043E\u043A\u0430 \u0441 \u043D\u043E\u0441\u043A\u0430 \u0432\u043E\u0434\u043E\u0441\u0431\u0440\u043E\u0441\u0430","\u041A\u0438\u043F\u044F\u0449\u0438\u0439 \u0433\u0438\u0434\u0440\u0430\u0432\u043B\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u043F\u0440\u044B\u0436\u043E\u043A \u0432\u043D\u0438\u0437\u0443 \u043F\u043B\u043E\u0442\u0438\u043D\u044B","\u0414\u043B\u0438\u043D\u043D\u043E\u0432\u043E\u043B\u043D\u043E\u0432\u0430\u044F \u0432\u0435\u0442\u0440\u043E\u0432\u0430\u044F \u0437\u044B\u0431\u044C \u0432\u043E\u0434\u043E\u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0430","\u041A\u043E\u0440\u043E\u0442\u043A\u0430\u044F \u043A\u0430\u043F\u0438\u043B\u043B\u044F\u0440\u043D\u0430\u044F \u0440\u044F\u0431\u044C \u0440\u0435\u0447\u043D\u043E\u0433\u043E \u043F\u043B\u0451\u0441\u0430","\u041F\u043E\u043F\u0435\u0440\u0435\u0447\u043D\u0430\u044F \u0438\u043D\u0442\u0435\u0440\u0444\u0435\u0440\u0435\u043D\u0446\u0438\u044F \u0432\u043E\u043B\u043D \u0432 \u043A\u0430\u043D\u044C\u043E\u043D\u0435","\u0414\u0432\u043E\u0439\u043D\u0430\u044F \u0441\u043E\u043B\u043D\u0435\u0447\u043D\u0430\u044F \u043A\u0430\u0443\u0441\u0442\u0438\u043A\u0430 \u043C\u0435\u043B\u043A\u043E\u0432\u043E\u0434\u044C\u044F (\u0441\u043B\u043E\u0439 A)","\u0414\u0432\u043E\u0439\u043D\u0430\u044F \u0441\u043E\u043B\u043D\u0435\u0447\u043D\u0430\u044F \u043A\u0430\u0443\u0441\u0442\u0438\u043A\u0430 \u043C\u0435\u043B\u043A\u043E\u0432\u043E\u0434\u044C\u044F (\u0441\u043B\u043E\u0439 B)","\u041A\u0440\u0443\u0436\u0435\u0432\u043D\u0430\u044F \u043F\u0435\u043D\u0430 \u043D\u0430\u043A\u0430\u0442\u0430 \u043D\u0430 \u0431\u0435\u0440\u0435\u0433","\u0412\u0438\u0445\u0440\u0435\u0432\u0430\u044F \u0434\u043E\u0440\u043E\u0436\u043A\u0430 \u041A\u0430\u0440\u043C\u0430\u043D\u0430 \u0437\u0430 \u0443\u0441\u0442\u043E\u044F\u043C\u0438","\u0411\u0435\u043B\u044B\u0439 \u043F\u0435\u043D\u043D\u044B\u0439 \u0432\u0430\u043B \u043F\u0435\u0440\u0435\u043A\u0430\u0442\u0430 \u0433\u043E\u0440\u043D\u043E\u0439 \u0440\u0435\u043A\u0438","\u0411\u0443\u0440\u0443\u043D \u043E\u0442\u0432\u043E\u0434\u044F\u0449\u0435\u0433\u043E \u043A\u0430\u043D\u0430\u043B\u0430 \u0442\u0443\u0440\u0431\u0438\u043D\u044B \u041A\u0430\u043F\u043B\u0430\u043D\u0430","\u0412\u044B\u0441\u043E\u043A\u043E\u043D\u0430\u043F\u043E\u0440\u043D\u044B\u0439 \u0432\u044B\u0431\u0440\u043E\u0441 \u0442\u0443\u0440\u0431\u0438\u043D\u044B \u0424\u0440\u044D\u043D\u0441\u0438\u0441\u0430","\u041D\u043E\u0447\u043D\u043E\u0439 \u043E\u0431\u0440\u0430\u0442\u043D\u044B\u0439 \u043F\u043E\u0442\u043E\u043A \u0437\u0430\u043A\u0430\u0447\u043A\u0438 \u0413\u0410\u042D\u0421","\u0420\u0430\u0434\u0443\u0436\u043D\u0430\u044F \u0432\u043E\u0434\u044F\u043D\u0430\u044F \u043F\u044B\u043B\u044C \u0443 \u043E\u0441\u043D\u043E\u0432\u0430\u043D\u0438\u044F \u0432\u043E\u0434\u043E\u043F\u0430\u0434\u0430","\u0420\u0430\u0437\u043C\u044B\u0432 \u0433\u0440\u0443\u043D\u0442\u043E\u0432\u043E\u0439 \u043F\u0435\u0440\u0435\u043C\u044B\u0447\u043A\u0438 \u043F\u0430\u0432\u043E\u0434\u043A\u043E\u043C","\u041E\u0441\u0435\u0434\u0430\u043D\u0438\u0435 \u0438\u043B\u0438\u0441\u0442\u043E\u0433\u043E \u0448\u043B\u0435\u0439\u0444\u0430 \u0432 \u0442\u0438\u0445\u043E\u043C \u0437\u0430\u043B\u0438\u0432\u0435","\u0411\u043B\u0438\u043A \u0434\u043E\u0440\u043E\u0436\u043A\u0438 \u0441\u043E\u043B\u043D\u0446\u0430 \u043F\u043E \u0437\u0430\u043A\u043E\u043D\u0430\u043C \u0424\u0440\u0435\u043D\u0435\u043B\u044F","\u041B\u0443\u043D\u043D\u0430\u044F \u0441\u0435\u0440\u0435\u0431\u0440\u0438\u0441\u0442\u0430\u044F \u0434\u043E\u0440\u043E\u0436\u043A\u0430 \u043D\u0430 \u0432\u043E\u0434\u0435 \u043D\u043E\u0447\u044C\u044E","\u0412\u043E\u043B\u043D\u043E\u0432\u043E\u0435 \u043A\u0430\u0447\u0430\u043D\u0438\u0435 \u043F\u043E\u0432\u0435\u0440\u0445\u043D\u043E\u0441\u0442\u0438 \u043F\u0440\u0438 \u043B\u0438\u0432\u043D\u0435","\u041A\u0440\u0443\u0433\u0438 \u043E\u0442 \u043A\u0430\u043F\u0435\u043B\u044C \u0448\u0442\u043E\u0440\u043C\u043E\u0432\u043E\u0433\u043E \u0434\u043E\u0436\u0434\u044F","\u041F\u0443\u043B\u044C\u0441\u0430\u0446\u0438\u044F \u0440\u043E\u0434\u043D\u0438\u043A\u043E\u0432\u043E\u0433\u043E \u043A\u043B\u044E\u0447\u0430 \u0432 \u0432\u0435\u0440\u0445\u043E\u0432\u044C\u0435 \u0411\u044B\u0441\u0442\u0440\u0438\u0446\u044B","\u0422\u0430\u043B\u044B\u0439 \u043F\u043E\u0442\u043E\u043A \u043B\u0435\u0434\u043D\u0438\u043A\u043E\u0432\u043E\u0433\u043E \u0440\u0443\u0447\u044C\u044F \u0421\u0435\u0440\u0435\u0431\u0440\u044F\u043D\u043A\u0438","\u0421\u0442\u0440\u0435\u043C\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u0441\u043B\u0438\u0432 \u0433\u043E\u0440\u043D\u043E\u0433\u043E \u0440\u0443\u0447\u044C\u044F \u0413\u0440\u0435\u043C\u0443\u0447\u0435\u0433\u043E","\u041F\u043E\u0434\u044A\u0451\u043C \u0437\u0435\u0440\u043A\u0430\u043B\u0430 \u0432\u0435\u0440\u0445\u043D\u0435\u0433\u043E \u0431\u044C\u0435\u0444\u0430 \u043F\u0440\u0438 \u043D\u0430\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u0438","\u0421\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u0437\u0435\u0440\u043A\u0430\u043B\u0430 \u0431\u044C\u0435\u0444\u0430 \u0432 \u0432\u0435\u0447\u0435\u0440\u043D\u0438\u0439 \u043F\u0438\u043A","\u0424\u0438\u043B\u044C\u0442\u0440\u0430\u0446\u0438\u043E\u043D\u043D\u044B\u0435 \u0441\u0442\u0440\u0443\u0439\u043A\u0438 \u043F\u043E\u0434 \u043D\u0435\u0446\u0435\u043C\u0435\u043D\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u043E\u0439 \u0434\u0430\u043C\u0431\u043E\u0439","\u041D\u0430\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u0435 \u043E\u0440\u043E\u0441\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0433\u043E \u043A\u0430\u043D\u0430\u043B\u0430 \u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u044B","\u0421\u043B\u0438\u044F\u043D\u0438\u0435 \u0443\u0441\u0442\u044C\u044F \u0440\u0435\u043A\u0438 \u0441 \u0431\u0435\u0441\u043A\u0440\u0430\u0439\u043D\u0435\u0439 \u0432\u043E\u0434\u043D\u043E\u0439 \u0433\u043B\u0430\u0434\u044C\u044E"]},{group:"hydro_plant",groupLabel:"\u041C\u0435\u0445\u0430\u043D\u0438\u0437\u043C\u044B \u0413\u042D\u0421, \u0413\u0410\u042D\u0421 \u0438 \u043F\u043E\u0434\u0441\u0442\u0430\u043D\u0446\u0438\u0439 \u041E\u0420\u0423",items:["\u0412\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u0440\u0430\u0431\u043E\u0447\u0435\u0433\u043E \u043A\u043E\u043B\u0435\u0441\u0430 \u041A\u0430\u043F\u043B\u0430\u043D\u0430 (\u043D\u043E\u043C\u0438\u043D\u0430\u043B)","\u0412\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u0440\u0430\u0431\u043E\u0447\u0435\u0433\u043E \u043A\u043E\u043B\u0435\u0441\u0430 \u041A\u0430\u043F\u043B\u0430\u043D\u0430 (\u0444\u043E\u0440\u0441\u0430\u0436)","\u0412\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u0440\u0430\u0434\u0438\u0430\u043B\u044C\u043D\u043E-\u043E\u0441\u0435\u0432\u043E\u0439 \u0442\u0443\u0440\u0431\u0438\u043D\u044B \u0424\u0440\u044D\u043D\u0441\u0438\u0441\u0430","\u0422\u0443\u0440\u0431\u0438\u043D\u043D\u044B\u0439 \u0445\u043E\u0434 \u043E\u0431\u0440\u0430\u0442\u0438\u043C\u043E\u0439 \u0433\u0438\u0434\u0440\u043E\u043C\u0430\u0448\u0438\u043D\u044B \u0413\u0410\u042D\u0421","\u0420\u0435\u0432\u0435\u0440\u0441\u0438\u0432\u043D\u043E\u0435 \u0432\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u043D\u0430\u0441\u043E\u0441\u0430 \u0413\u0410\u042D\u0421 (\u0437\u0430\u043A\u0430\u0447\u043A\u0430 \u043D\u043E\u0447\u044C\u044E)","\u041F\u0443\u043B\u044C\u0441\u0430\u0446\u0438\u044F \u0438\u043D\u0434\u0438\u043A\u0430\u0442\u043E\u0440\u0430 \u043C\u043E\u0449\u043D\u043E\u0441\u0442\u0438 \u043D\u0430 \u043A\u0440\u044B\u0448\u0435 \u043C\u0430\u0448\u0437\u0430\u043B\u0430","\u0425\u043E\u0434 \u043C\u043E\u0441\u0442\u043E\u0432\u043E\u0433\u043E \u043A\u043E\u0437\u043B\u043E\u0432\u043E\u0433\u043E \u043A\u0440\u0430\u043D\u0430 \u043F\u043E \u0433\u0440\u0435\u0431\u043D\u044E \u0413\u042D\u0421","\u041F\u043E\u0434\u044A\u0451\u043C \u043A\u0440\u044E\u043A\u0430 \u043A\u043E\u0437\u043B\u043E\u0432\u043E\u0433\u043E \u043A\u0440\u0430\u043D\u0430 \u043D\u0430\u0434 \u0448\u0430\u0445\u0442\u043E\u0439 \u0442\u0443\u0440\u0431\u0438\u043D\u044B","\u041F\u043B\u0430\u0432\u043D\u043E\u0435 \u043E\u0442\u043A\u0440\u044B\u0442\u0438\u0435 \u0441\u0435\u0433\u043C\u0435\u043D\u0442\u043D\u043E\u0433\u043E \u0437\u0430\u0442\u0432\u043E\u0440\u0430 \u0432\u043E\u0434\u043E\u0441\u0431\u0440\u043E\u0441\u0430","\u0410\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u043E\u0435 \u043F\u0440\u0438\u043A\u0440\u044B\u0442\u0438\u0435 \u0437\u0430\u0442\u0432\u043E\u0440\u0430 \u043F\u043E \u0443\u0440\u043E\u0432\u043D\u044E \u0412\u0411","\u0425\u043E\u0434 \u0433\u0440\u0430\u0431\u043B\u0435\u0439 \u0441\u043E\u0440\u043E\u043E\u0447\u0438\u0441\u0442\u043D\u043E\u0439 \u043C\u0430\u0448\u0438\u043D\u044B \u0432\u043E\u0434\u043E\u043F\u0440\u0438\u0451\u043C\u043D\u0438\u043A\u0430","\u041C\u0438\u043A\u0440\u043E-\u0432\u0438\u0431\u0440\u0430\u0446\u0438\u044F \u0441\u0442\u0430\u043B\u044C\u043D\u044B\u0445 \u043D\u0430\u043F\u043E\u0440\u043D\u044B\u0445 \u0432\u043E\u0434\u043E\u0432\u043E\u0434\u043E\u0432","\u0421\u0431\u0440\u043E\u0441 \u0430\u044D\u0440\u0430\u0446\u0438\u043E\u043D\u043D\u044B\u0445 \u043F\u0443\u0437\u044B\u0440\u0435\u0439 \u0432 \u043E\u0442\u0441\u0430\u0441\u044B\u0432\u0430\u044E\u0449\u0435\u0439 \u0442\u0440\u0443\u0431\u0435","\u0422\u0435\u043F\u043B\u043E\u0432\u043E\u0435 \u0434\u0440\u043E\u0436\u0430\u043D\u0438\u0435 \u043D\u0430\u0434 \u0442\u0440\u0430\u043D\u0441\u0444\u043E\u0440\u043C\u0430\u0442\u043E\u0440\u0430\u043C\u0438 220 \u043A\u0412","\u041A\u043E\u0440\u043E\u043D\u043D\u043E\u0435 \u0441\u0432\u0435\u0447\u0435\u043D\u0438\u0435 \u0433\u0438\u0440\u043B\u044F\u043D\u0434 \u0438\u0437\u043E\u043B\u044F\u0442\u043E\u0440\u043E\u0432 \u041E\u0420\u0423","\u041F\u0440\u043E\u0432\u0438\u0441 \u043F\u0440\u043E\u0432\u043E\u0434\u043E\u0432 \u041B\u042D\u041F \u0441 \u0432\u0435\u0442\u0440\u043E\u0432\u044B\u043C \u0440\u0430\u0441\u043A\u0430\u0447\u0438\u0432\u0430\u043D\u0438\u0435\u043C","\u0411\u0435\u0433\u0443\u0449\u0438\u0439 \u0438\u043C\u043F\u0443\u043B\u044C\u0441 \u043D\u0430\u0433\u0440\u0443\u0437\u043A\u0438 \u043F\u043E \u043C\u0430\u0433\u0438\u0441\u0442\u0440\u0430\u043B\u0438 \u041B\u042D\u041F","\u0410\u0432\u0430\u0440\u0438\u0439\u043D\u044B\u0439 \u043A\u0440\u0430\u0441\u043D\u044B\u0439 \u043C\u0430\u044F\u043A \u043A\u0430\u0432\u0438\u0442\u0430\u0446\u0438\u0438 \u0433\u0438\u0434\u0440\u043E\u0430\u0433\u0440\u0435\u0433\u0430\u0442\u0430","\u0417\u0435\u043B\u0451\u043D\u044B\u0439 \u043C\u0430\u044F\u043A \u0441\u0438\u043D\u0445\u0440\u043E\u043D\u0438\u0437\u0430\u0446\u0438\u0438 \u0441 \u0441\u0435\u0442\u044C\u044E 50,00 \u0413\u0446","\u0411\u0438\u0440\u044E\u0437\u043E\u0432\u044B\u0439 \u0438\u043D\u0434\u0438\u043A\u0430\u0442\u043E\u0440 \u043D\u043E\u0447\u043D\u043E\u0433\u043E \u043D\u0430\u043A\u043E\u043F\u043B\u0435\u043D\u0438\u044F \u0413\u0410\u042D\u0421","\u041E\u0441\u0432\u0435\u0449\u0435\u043D\u0438\u0435 \u0430\u0440\u043E\u0447\u043D\u044B\u0445 \u043E\u043A\u043E\u043D \u043C\u0430\u0448\u0438\u043D\u043D\u043E\u0433\u043E \u0437\u0430\u043B\u0430 \u0413\u042D\u0421","\u041F\u0440\u043E\u0436\u0435\u043A\u0442\u043E\u0440\u044B \u043F\u043E\u0434\u0441\u0432\u0435\u0442\u043A\u0438 \u043D\u0438\u0437\u043E\u0432\u043E\u0439 \u0433\u0440\u0430\u043D\u0438 \u043F\u043B\u043E\u0442\u0438\u043D\u044B","\u0420\u0430\u0431\u043E\u0442\u0430 \u0434\u0440\u0435\u043D\u0430\u0436\u043D\u044B\u0445 \u043D\u0430\u0441\u043E\u0441\u043E\u0432 \u043F\u043E\u0442\u0435\u0440\u043D\u044B \u043F\u043B\u043E\u0442\u0438\u043D\u044B","\u041A\u043E\u043D\u0442\u0440\u043E\u043B\u044C\u043D\u044B\u0439 \u043C\u0430\u044F\u0442\u043D\u0438\u043A-\u043E\u0442\u0432\u0435\u0441 \u043F\u0440\u043E\u0433\u0438\u0431\u0430 \u0432\u044B\u0441\u043E\u043A\u043E\u0439 \u043F\u043B\u043E\u0442\u0438\u043D\u044B","\u041F\u043E\u0432\u043E\u0440\u043E\u0442 \u0440\u0430\u0437\u044A\u0435\u0434\u0438\u043D\u0438\u0442\u0435\u043B\u0435\u0439 \u0448\u0438\u043D\u043D\u043E\u0433\u043E \u043C\u043E\u0441\u0442\u0430 \u041E\u0420\u0423","\u0412\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u0432\u0435\u043D\u0442\u0438\u043B\u044F\u0442\u043E\u0440\u043E\u0432 \u043C\u0430\u0441\u043B\u044F\u043D\u043E\u0433\u043E \u043E\u0445\u043B\u0430\u0436\u0434\u0435\u043D\u0438\u044F \u0422\u0420\u0414\u041D","\u0421\u0442\u0432\u043E\u0440\u0447\u0430\u0442\u044B\u0439 \u043A\u043B\u0430\u043F\u0430\u043D \u0445\u043E\u043B\u043E\u0441\u0442\u043E\u0433\u043E \u0432\u044B\u043F\u0443\u0441\u043A\u0430 \u0432\u043E\u0434\u044B","\u0413\u0430\u0441\u0438\u0442\u0435\u043B\u044C \u044D\u043D\u0435\u0440\u0433\u0438\u0438 \u0432 \u0432\u043E\u0434\u043E\u0431\u043E\u0439\u043D\u043E\u043C \u043A\u043E\u043B\u043E\u0434\u0446\u0435"]},{group:"locks_marinas",groupLabel:"\u0428\u043B\u044E\u0437\u043E\u0432\u044B\u0435 \u043A\u0430\u043C\u0435\u0440\u044B, \u0430\u044D\u0440\u0430\u0442\u043E\u0440\u044B \u0438 \u0433\u0438\u0434\u0440\u043E\u043F\u043E\u0441\u0442\u044B",items:["\u0420\u0430\u0441\u0442\u0432\u043E\u0440\u0435\u043D\u0438\u0435 \u0432\u0435\u0440\u0445\u043D\u0438\u0445 \u0434\u0432\u0443\u0441\u0442\u0432\u043E\u0440\u0447\u0430\u0442\u044B\u0445 \u0432\u043E\u0440\u043E\u0442 \u0448\u043B\u044E\u0437\u0430","\u0420\u0430\u0441\u0442\u0432\u043E\u0440\u0435\u043D\u0438\u0435 \u043D\u0438\u0436\u043D\u0438\u0445 \u0432\u043E\u0440\u043E\u0442 \u0441\u0443\u0434\u043E\u0445\u043E\u0434\u043D\u043E\u0433\u043E \u0448\u043B\u044E\u0437\u0430","\u041F\u043E\u0434\u044A\u0451\u043C \u0437\u0435\u0440\u043A\u0430\u043B\u0430 \u0432\u043E\u0434\u044B \u0432 \u043A\u0430\u043C\u0435\u0440\u0435 \u0448\u043B\u044E\u0437\u0430","\u0421\u043F\u0443\u0441\u043A \u0432\u043E\u0434\u044B \u0438\u0437 \u043A\u0430\u043C\u0435\u0440\u044B \u0448\u043B\u044E\u0437\u0430 \u0432 \u043D\u0438\u0436\u043D\u0438\u0439 \u0431\u044C\u0435\u0444","\u0421\u0432\u0435\u0442\u043E\u0444\u043E\u0440 \u0448\u043B\u044E\u0437\u043E\u0432\u0430\u043D\u0438\u044F (\u043A\u0440\u0430\u0441\u043D\u044B\u0439 / \u0437\u0435\u043B\u0451\u043D\u044B\u0439 \u0441\u0442\u0432\u043E\u0440)","\u041F\u043E\u043A\u0430\u0447\u0438\u0432\u0430\u043D\u0438\u0435 \u0448\u0432\u0430\u0440\u0442\u043E\u0432\u044B\u0445 \u043F\u043E\u043D\u0442\u043E\u043D\u043E\u0432 \u044F\u0445\u0442-\u043C\u0430\u0440\u0438\u043D\u044B","\u0412\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u043F\u043E\u0440\u0442\u043E\u0432\u043E\u0433\u043E \u043D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u043E\u043D\u043D\u043E\u0433\u043E \u0440\u0430\u0434\u0430\u0440\u0430","\u0421\u0438\u0433\u043D\u0430\u043B\u044C\u043D\u044B\u0435 \u043E\u0433\u043D\u0438 \u043F\u043E\u0440\u0442\u043E\u0432\u044B\u0445 \u043F\u0440\u0438\u0447\u0430\u043B\u043E\u0432 \u043D\u043E\u0447\u044C\u044E","\u041A\u0430\u0447\u0430\u043D\u0438\u0435 \u043C\u0435\u0440\u043D\u044B\u0445 \u0440\u0435\u0435\u043A \u0433\u0438\u0434\u0440\u043E\u043B\u043E\u0433\u0438\u0447\u0435\u0441\u043A\u043E\u0433\u043E \u043F\u043E\u0441\u0442\u0430","\u0412\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u0430\u044D\u0440\u0430\u0442\u043E\u0440\u0430 \u0441\u0430\u0434\u043A\u0430 \u0444\u043E\u0440\u0435\u043B\u0435\u0432\u043E\u0433\u043E \u0440\u044B\u0431\u0445\u043E\u0437\u0430 \u21161","\u0412\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u0430\u044D\u0440\u0430\u0442\u043E\u0440\u0430 \u0441\u0430\u0434\u043A\u0430 \u0444\u043E\u0440\u0435\u043B\u0435\u0432\u043E\u0433\u043E \u0440\u044B\u0431\u0445\u043E\u0437\u0430 \u21162","\u0410\u0432\u0442\u043E\u043A\u043E\u0440\u043C\u0443\u0448\u043A\u0430 \u043F\u043E\u043D\u0442\u043E\u043D\u043D\u043E\u0433\u043E \u043C\u043E\u0434\u0443\u043B\u044F \u0440\u044B\u0431\u0445\u043E\u0437\u0430","\u041A\u0438\u0441\u043B\u043E\u0440\u043E\u0434\u043D\u043E\u0435 \u0431\u0443\u0440\u043B\u0435\u043D\u0438\u0435 \u0432 \u0444\u043E\u0440\u0435\u043B\u0435\u0432\u043E\u043C \u0441\u0430\u0434\u043A\u0435","\u041F\u043B\u0430\u0432\u043D\u044B\u0439 \u043F\u0440\u0438\u0431\u043E\u0439 \u043D\u0430 \u0432\u043D\u0435\u0448\u043D\u0435\u043C \u043C\u043E\u0440\u0441\u043A\u043E\u043C \u0433\u043E\u0440\u0438\u0437\u043E\u043D\u0442\u0435","\u041A\u043E\u043B\u044B\u0445\u0430\u043D\u0438\u0435 \u0437\u0430\u0449\u0438\u0442\u043D\u044B\u0445 \u0431\u043E\u043D\u043E\u0432 \u0432\u043E\u0434\u043E\u043F\u0440\u0438\u0451\u043C\u043D\u0438\u043A\u0430","\u0420\u0430\u0431\u043E\u0442\u0430 \u0440\u044B\u0431\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0433\u043E \u0437\u0430\u0442\u0432\u043E\u0440\u0430 \u0433\u0438\u0434\u0440\u043E\u0443\u0437\u043B\u0430","\u041F\u0443\u043B\u044C\u0441\u0430\u0446\u0438\u044F \u0443\u0440\u043E\u0432\u043D\u0435\u043C\u0435\u0440\u0430 \u0432\u0435\u0440\u0445\u043D\u0435\u0433\u043E \u0431\u044C\u0435\u0444\u0430","\u041F\u0443\u043B\u044C\u0441\u0430\u0446\u0438\u044F \u0440\u0430\u0441\u0445\u043E\u0434\u043E\u043C\u0435\u0440\u0430 \u043D\u0438\u0436\u043D\u0435\u0433\u043E \u0431\u044C\u0435\u0444\u0430","\u041E\u0433\u043D\u0438 \u0431\u0435\u0437\u043E\u043F\u0430\u0441\u043D\u043E\u0441\u0442\u0438 \u043D\u0430 \u0443\u0441\u0442\u043E\u044F\u0445 \u0448\u043B\u044E\u0437\u0430","\u041F\u043E\u0432\u043E\u0440\u043E\u0442 \u0441\u0442\u0440\u0435\u043B\u044B \u043F\u0440\u0438\u0447\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u043A\u0440\u0430\u043D\u0430 \u0423\u0441\u0442\u044C-\u041F\u043E\u0440\u0442\u0430","\u041F\u0435\u0440\u0435\u043B\u0438\u0432 \u0432\u043E\u0434\u044B \u0447\u0435\u0440\u0435\u0437 \u0432\u043E\u0434\u043E\u0441\u043B\u0438\u0432 \u0440\u044B\u0431\u043E\u0445\u043E\u0434\u0430","\u0414\u0440\u0435\u0439\u0444 \u0443\u0442\u0440\u0435\u043D\u043D\u0435\u0439 \u0434\u044B\u043C\u043A\u0438 \u043D\u0430\u0434 \u0430\u043A\u0432\u0430\u0442\u043E\u0440\u0438\u0435\u0439 \u043F\u043E\u0440\u0442\u0430","\u0411\u043B\u0438\u043A\u043E\u0432\u0430\u043D\u0438\u0435 \u0432\u043E\u0434\u043D\u043E\u0439 \u0433\u043B\u0430\u0434\u0438 \u0437\u0430 \u043F\u0440\u0435\u0434\u0435\u043B\u0430\u043C\u0438 \u0434\u043E\u043B\u0438\u043D\u044B","\u041C\u0435\u0440\u0446\u0430\u043D\u0438\u0435 \u0431\u0443\u0451\u0432 \u043E\u0433\u0440\u0430\u0436\u0434\u0435\u043D\u0438\u044F \u043F\u0440\u0435\u0434\u043F\u043B\u043E\u0442\u0438\u043D\u043D\u043E\u0439 \u0437\u043E\u043D\u044B","\u0420\u0430\u0431\u043E\u0442\u0430 \u043D\u0430\u0441\u043E\u0441\u043D\u043E\u0439 \u0441\u0442\u0430\u043D\u0446\u0438\u0438 \u0431\u0435\u0440\u0435\u0433\u043E\u0432\u043E\u0433\u043E \u0432\u043E\u0434\u043E\u0437\u0430\u0431\u043E\u0440\u0430","\u0412\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u0431\u0430\u0440\u0430\u0431\u0430\u043D\u043D\u043E\u0433\u043E \u043C\u0438\u043A\u0440\u043E\u0444\u0438\u043B\u044C\u0442\u0440\u0430 \u0432\u043E\u0434\u043E\u043A\u0430\u043D\u0430\u043B\u0430","\u041F\u043E\u0434\u0441\u0432\u0435\u0442\u043A\u0430 \u043D\u0430\u0431\u0435\u0440\u0435\u0436\u043D\u043E\u0439 \u043A\u0443\u0440\u043E\u0440\u0442\u043D\u043E\u0433\u043E \u043A\u0432\u0430\u0440\u0442\u0430\u043B\u0430","\u041F\u043B\u0430\u0432\u043D\u043E\u0435 \u0432\u043E\u043B\u043D\u0435\u043D\u0438\u0435 \u0432 \u0437\u0430\u0449\u0438\u0449\u0451\u043D\u043D\u043E\u0439 \u0431\u0443\u0445\u0442\u0435 \u043F\u043E\u0440\u0442\u0430"]},{group:"construction_mining",groupLabel:"\u0421\u0442\u0440\u043E\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u0442\u0435\u0445\u043D\u0438\u043A\u0430, \u043A\u0440\u0430\u043D\u044B \u0438 \u0431\u0435\u0442\u043E\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435",items:["\u041F\u043E\u0432\u043E\u0440\u043E\u0442 \u0441\u0442\u0440\u0435\u043B\u044B \u0431\u0430\u0448\u0435\u043D\u043D\u043E\u0433\u043E \u043A\u0440\u0430\u043D\u0430 \u041A\u0411-504 (\u043B\u0435\u0432\u044B\u0439)","\u041F\u043E\u0432\u043E\u0440\u043E\u0442 \u0441\u0442\u0440\u0435\u043B\u044B \u0431\u0430\u0448\u0435\u043D\u043D\u043E\u0433\u043E \u043A\u0440\u0430\u043D\u0430 \u041A\u0411-504 (\u043F\u0440\u0430\u0432\u044B\u0439)","\u041F\u0435\u0440\u0435\u043C\u0435\u0449\u0435\u043D\u0438\u0435 \u0433\u0440\u0443\u0437\u043E\u0432\u043E\u0439 \u043A\u0430\u0440\u0435\u0442\u043A\u0438 \u043F\u043E \u0441\u0442\u0440\u0435\u043B\u0435 \u043A\u0440\u0430\u043D\u0430","\u0421\u043F\u0443\u0441\u043A \u0431\u0430\u0434\u044C\u0438 \u0441 \u0433\u0438\u0434\u0440\u043E\u0442\u0435\u0445\u043D\u0438\u0447\u0435\u0441\u043A\u0438\u043C \u0431\u0435\u0442\u043E\u043D\u043E\u043C \u0432 \u0431\u043B\u043E\u043A","\u041F\u043E\u0441\u043B\u043E\u0439\u043D\u044B\u0439 \u0440\u043E\u0441\u0442 \u043C\u043E\u043D\u043E\u043B\u0438\u0442\u043D\u043E\u0439 \u0441\u0435\u043A\u0446\u0438\u0438 \u043F\u043B\u043E\u0442\u0438\u043D\u044B","\u041C\u043E\u043D\u0442\u0430\u0436 \u0441\u0442\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u0448\u043F\u0443\u043D\u0442\u0430 \u043F\u0435\u0440\u0435\u043C\u044B\u0447\u043A\u0438 \u041B\u0430\u0440\u0441\u0435\u043D\u0430","\u0421\u0431\u043E\u0440\u043A\u0430 \u0430\u0440\u043C\u0430\u0442\u0443\u0440\u043D\u043E\u0433\u043E \u043F\u0440\u043E\u0441\u0442\u0440\u0430\u043D\u0441\u0442\u0432\u0435\u043D\u043D\u043E\u0433\u043E \u043A\u0430\u0440\u043A\u0430\u0441\u0430","\u0421\u043D\u044F\u0442\u0438\u0435 \u0449\u0438\u0442\u043E\u0432\u043E\u0439 \u043E\u043F\u0430\u043B\u0443\u0431\u043A\u0438 \u0441\u043E \u0437\u0440\u0435\u043B\u043E\u0433\u043E \u0431\u0435\u0442\u043E\u043D\u0430","\u0412\u044B\u0435\u043C\u043A\u0430 \u0433\u0440\u0443\u043D\u0442\u0430 \u043F\u0440\u0438 \u043F\u0440\u043E\u043A\u043B\u0430\u0434\u043A\u0435 \u043A\u0430\u043D\u0430\u043B\u0430","\u0424\u043E\u043D\u0442\u0430\u043D \u0431\u0440\u044B\u0437\u0433 \u0438 \u043A\u0440\u043E\u0448\u043A\u0438 \u043F\u0440\u0438 \u0440\u0430\u0437\u0440\u0430\u0431\u043E\u0442\u043A\u0435 \u043F\u043E\u0440\u043E\u0434\u044B","\u041F\u043E\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u0435 \u0441\u043A\u043B\u0430\u0434\u0430 \u0433\u0440\u0430\u043D\u0438\u0442\u043D\u043E\u0433\u043E \u0449\u0435\u0431\u043D\u044F","\u041E\u0442\u0433\u0440\u0443\u0437\u043A\u0430 \u043F\u0430\u0440\u0442\u0438\u0438 \u0449\u0435\u0431\u043D\u044F \u0441\u0442\u0440\u043E\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u043C \u0442\u0440\u0435\u0441\u0442\u0430\u043C","\u0412\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u0431\u0430\u0440\u0430\u0431\u0430\u043D\u0430 \u0431\u0435\u0442\u043E\u043D\u043E\u0441\u043C\u0435\u0441\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0433\u043E \u0443\u0437\u043B\u0430","\u041F\u043E\u0434\u0430\u0447\u0430 \u0441\u043C\u0435\u0441\u0438 \u0432 \u0431\u043B\u043E\u043A \u0431\u0435\u0442\u043E\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F \u043F\u043B\u043E\u0442\u0438\u043D\u044B","\u041E\u0442\u0441\u044B\u043F\u043A\u0430 \u044F\u0434\u0440\u0430 \u0433\u0440\u0443\u043D\u0442\u043E\u0432\u043E\u0439 \u043F\u0435\u0440\u0435\u043C\u044B\u0447\u043A\u0438","\u0423\u043F\u043B\u043E\u0442\u043D\u0435\u043D\u0438\u0435 \u0433\u0440\u0435\u0431\u043D\u044F \u0437\u0435\u043C\u043B\u044F\u043D\u043E\u0439 \u0434\u0430\u043C\u0431\u044B","\u0411\u0443\u0440\u0435\u043D\u0438\u0435 \u0441\u043A\u0432\u0430\u0436\u0438\u043D \u0446\u0435\u043C\u0435\u043D\u0442\u0430\u0446\u0438\u043E\u043D\u043D\u043E\u0439 \u0437\u0430\u0432\u0435\u0441\u044B \u0441\u043A\u0430\u043B\u044B","\u0414\u0440\u043E\u0431\u0438\u043B\u044C\u043D\u043E-\u0441\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u043E\u0447\u043D\u044B\u0439 \u0433\u0440\u043E\u0445\u043E\u0442 \u0449\u0435\u0431\u043D\u044F","\u041B\u0435\u043D\u0442\u043E\u0447\u043D\u044B\u0439 \u043A\u043E\u043D\u0432\u0435\u0439\u0435\u0440 \u043F\u043E\u0434\u0430\u0447\u0438 \u0437\u0430\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044F \u0411\u0421\u0423","\u041B\u0451\u0433\u043A\u0438\u0439 \u043F\u0430\u0440 \u0433\u0438\u0434\u0440\u0430\u0442\u0430\u0446\u0438\u0438 \u043C\u0430\u0441\u0441\u0438\u0432\u043D\u043E\u0433\u043E \u0431\u0435\u0442\u043E\u043D\u0430","\u041E\u0440\u0430\u043D\u0436\u0435\u0432\u044B\u0435 \u0441\u0438\u0433\u043D\u0430\u043B\u044C\u043D\u044B\u0435 \u043E\u0433\u043D\u0438 \u0437\u043E\u043D\u044B \u0441\u0442\u0440\u043E\u0438\u0442\u0435\u043B\u044C\u0441\u0442\u0432\u0430","\u041F\u0440\u043E\u0436\u0435\u043A\u0442\u043E\u0440\u044B \u043D\u043E\u0447\u043D\u043E\u0439 \u0441\u043C\u0435\u043D\u044B \u043D\u0430 \u0441\u0442\u0440\u043E\u0439\u043F\u043B\u043E\u0449\u0430\u0434\u043A\u0435 \u0413\u042D\u0421","\u0418\u043D\u044A\u0435\u043A\u0446\u0438\u044F \u0446\u0435\u043C\u0435\u043D\u0442\u043D\u043E\u0433\u043E \u0440\u0430\u0441\u0442\u0432\u043E\u0440\u0430 \u043F\u043E\u0434 \u043A\u043E\u043D\u0442\u0440\u0444\u043E\u0440\u0441","\u0423\u043A\u043B\u0430\u0434\u043A\u0430 \u0436\u0435\u043B\u0435\u0437\u043E\u0431\u0435\u0442\u043E\u043D\u043D\u044B\u0445 \u043F\u043B\u0438\u0442 \u043E\u0431\u043B\u0438\u0446\u043E\u0432\u043A\u0438 \u043A\u0430\u043D\u0430\u043B\u0430","\u0420\u0430\u0431\u043E\u0442\u0430 \u0432\u043E\u0434\u043E\u043E\u0442\u043B\u0438\u0432\u043D\u043E\u0439 \u043F\u043E\u043C\u043F\u044B \u0432 \u043A\u043E\u0442\u043B\u043E\u0432\u0430\u043D\u0435 \u043C\u0430\u0448\u0437\u0430\u043B\u0430","\u0413\u0435\u043E\u0434\u0435\u0437\u0438\u0447\u0435\u0441\u043A\u0438\u0439 3D-\u043F\u0440\u0438\u0437\u0440\u0430\u043A \u043F\u0440\u043E\u0435\u043A\u0442\u043D\u043E\u0433\u043E \u044F\u0440\u0443\u0441\u0430 \u043F\u043B\u043E\u0442\u0438\u043D\u044B"]},{group:"city_avenues",groupLabel:"\u0412\u043D\u0443\u0442\u0440\u0438\u0433\u043E\u0440\u043E\u0434\u0441\u043A\u0430\u044F \u0436\u0438\u0437\u043D\u044C \u0438 \u043A\u043E\u043B\u044C\u0446\u0435\u0432\u044B\u0435 \u043F\u0440\u043E\u0441\u043F\u0435\u043A\u0442\u044B",items:["\u0414\u0432\u0438\u0436\u0435\u043D\u0438\u0435 \u0433\u043E\u0440\u043E\u0434\u0441\u043A\u043E\u0433\u043E \u0442\u0440\u0430\u043D\u0441\u043F\u043E\u0440\u0442\u0430 \u043F\u043E \u043A\u043E\u043B\u044C\u0446\u0443 \u0421\u0432\u0435\u0442\u043B\u043E\u0433\u0440\u0430\u0434\u0430","\u042D\u043B\u0435\u043A\u0442\u0440\u043E\u043C\u043E\u0431\u0438\u043B\u0438 \u043A\u0430\u043C\u043F\u0443\u0441\u0430 \u0422\u0435\u0445\u043D\u043E\u043F\u0430\u0440\u043A\u0430 \u0418\u0418","\u0412\u043D\u0443\u0442\u0440\u0438\u0437\u0430\u0432\u043E\u0434\u0441\u043A\u0438\u0435 \u0442\u044F\u0433\u0430\u0447\u0438 \u043D\u0430 \u043F\u043B\u043E\u0449\u0430\u0434\u043A\u0435 \u0410\u043B\u044E\u043C\u0433\u0440\u0430\u0434\u0430","\u041A\u043E\u043C\u043C\u0443\u043D\u0430\u043B\u044C\u043D\u0430\u044F \u0442\u0435\u0445\u043D\u0438\u043A\u0430 \u043A\u0432\u0430\u0440\u0442\u0430\u043B\u043E\u0432 \u041A\u0430\u043C\u0435\u043D\u043D\u043E\u0433\u043E\u0440\u0441\u043A\u0430","\u0410\u0433\u0440\u043E\u0442\u0435\u0445\u043D\u0438\u043A\u0430 \u0443 \u044D\u043B\u0435\u0432\u0430\u0442\u043E\u0440\u043E\u0432 \u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u044B","\u041A\u0443\u0440\u043E\u0440\u0442\u043D\u044B\u0435 \u0448\u0430\u0442\u0442\u043B\u044B \u043D\u0430\u0431\u0435\u0440\u0435\u0436\u043D\u043E\u0439 \u0423\u0441\u0442\u044C-\u041F\u043E\u0440\u0442\u0430","\u041F\u043E\u0441\u0435\u043B\u043A\u043E\u0432\u044B\u0439 \u0442\u0440\u0430\u043D\u0441\u043F\u043E\u0440\u0442 \u0420\u0435\u0447\u043D\u043E\u0433\u043E \u041F\u043E\u0441\u0430\u0434\u0430","\u0421\u043B\u0443\u0436\u0435\u0431\u043D\u044B\u0435 \u043C\u0430\u0448\u0438\u043D\u044B \u043C\u0435\u0442\u0435\u043E\u0446\u0435\u043D\u0442\u0440\u0430 \u0421\u0435\u0432\u0435\u0440\u043E\u0431\u043E\u0440\u0441\u043A\u0430","\u0417\u0430\u0436\u0438\u0433\u0430\u043D\u0438\u0435 \u0444\u0430\u0440 \u0432\u043D\u0443\u0442\u0440\u0438\u0433\u043E\u0440\u043E\u0434\u0441\u043A\u043E\u0433\u043E \u0442\u0440\u0430\u043D\u0441\u043F\u043E\u0440\u0442\u0430 \u0432\u0435\u0447\u0435\u0440\u043E\u043C","\u041E\u0433\u043D\u0438 \u0443\u043B\u0438\u0447\u043D\u044B\u0445 \u0442\u043E\u0440\u0448\u0435\u0440\u043E\u0432 \u043D\u0430 \u043F\u043B\u043E\u0449\u0430\u0434\u044F\u0445 \u0433\u043E\u0440\u043E\u0434\u043E\u0432","\u041F\u043B\u0430\u0432\u043D\u044B\u0439 \u043F\u043E\u0432\u043E\u0440\u043E\u0442 \u043C\u0430\u0448\u0438\u043D \u043D\u0430 \u0433\u043E\u0440\u043E\u0434\u0441\u043A\u0438\u0445 \u043A\u043E\u043B\u044C\u0446\u0430\u0445","\u041E\u0442\u0440\u0430\u0436\u0435\u043D\u0438\u0435 \u043E\u0433\u043D\u0435\u0439 \u043A\u0432\u0430\u0440\u0442\u0430\u043B\u043E\u0432 \u043D\u0430 \u0432\u0435\u0447\u0435\u0440\u043D\u0438\u0445 \u0443\u043B\u0438\u0446\u0430\u0445","\u0421\u0432\u0435\u0442\u043E\u0432\u0430\u044F \u0432\u043E\u043B\u043D\u0430 \u0446\u0435\u043D\u0442\u0440\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u043F\u0440\u043E\u0441\u043F\u0435\u043A\u0442\u0430 \u043C\u0435\u0433\u0430\u043F\u043E\u043B\u0438\u0441\u0430","\u041F\u043E\u0434\u0441\u0432\u0435\u0442\u043A\u0430 \u043F\u0435\u0448\u0435\u0445\u043E\u0434\u043D\u044B\u0445 \u0431\u0443\u043B\u044C\u0432\u0430\u0440\u043E\u0432 \u0443 \u0440\u0430\u0442\u0443\u0448\u0438","\u0414\u0435\u0436\u0443\u0440\u043D\u044B\u0435 \u043E\u0433\u043D\u0438 \u0441\u043F\u0430\u0441\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0433\u043E \u0434\u0435\u043F\u043E \u041C\u0427\u0421","\u0421\u0438\u0433\u043D\u0430\u043B\u044C\u043D\u044B\u0435 \u043E\u0433\u043D\u0438 \u0431\u043E\u043B\u044C\u043D\u0438\u0447\u043D\u043E\u0433\u043E \u0433\u043E\u0440\u043E\u0434\u043A\u0430","\u0412\u0435\u0447\u0435\u0440\u043D\u044F\u044F \u0438\u043B\u043B\u044E\u043C\u0438\u043D\u0430\u0446\u0438\u044F \u0442\u043E\u0440\u0433\u043E\u0432\u043E\u0433\u043E \u0445\u043E\u043B\u043B\u0430","\u041E\u0433\u043D\u0438 \u043B\u043E\u0433\u0438\u0441\u0442\u0438\u0447\u0435\u0441\u043A\u043E\u0433\u043E \u0442\u0435\u0440\u043C\u0438\u043D\u0430\u043B\u0430 \u043F\u0440\u043E\u043C\u0437\u043E\u043D\u044B","\u041F\u043E\u0434\u0441\u0432\u0435\u0442\u043A\u0430 \u0448\u043A\u043E\u043B\u044C\u043D\u043E\u0433\u043E \u0434\u0432\u043E\u0440\u0430 \u0438 \u0441\u0442\u0430\u0434\u0438\u043E\u043D\u0430","\u0422\u0451\u043F\u043B\u044B\u0439 \u0441\u0432\u0435\u0442 \u0442\u0435\u0440\u0440\u0430\u0441 \u0442\u0430\u0443\u043D\u0445\u0430\u0443\u0441\u043E\u0432 \u0432 \u0441\u0443\u043C\u0435\u0440\u043A\u0430\u0445","\u0425\u043E\u043B\u043E\u0434\u043D\u044B\u0439 \u043D\u0435\u043E\u043D \u0441\u0435\u0440\u0432\u0435\u0440\u043D\u044B\u0445 \u043C\u043E\u0434\u0443\u043B\u0435\u0439 \u0422\u0435\u0445\u043D\u043E\u043F\u0430\u0440\u043A\u0430","\u042F\u043D\u0442\u0430\u0440\u043D\u043E\u0435 \u0441\u0432\u0435\u0447\u0435\u043D\u0438\u0435 \u043E\u043A\u043E\u043D \u0434\u0435\u0440\u0435\u0432\u044F\u043D\u043D\u044B\u0445 \u043A\u043E\u0442\u0442\u0435\u0434\u0436\u0435\u0439","\u041F\u043B\u0430\u0432\u043D\u043E\u0435 \u043E\u0436\u0438\u0432\u043B\u0435\u043D\u0438\u0435 \u0443\u043B\u0438\u0446 \u043F\u043E \u043C\u0435\u0440\u0435 \u0440\u043E\u0441\u0442\u0430 \u043D\u0430\u0441\u0435\u043B\u0435\u043D\u0438\u044F","\u041F\u0443\u043B\u044C\u0441\u0430\u0446\u0438\u044F \u0438\u043D\u0434\u0438\u043A\u0430\u0442\u043E\u0440\u043E\u0432 \u0433\u043E\u0440\u043E\u0434\u0441\u043A\u0438\u0445 \u043F\u043E\u0434\u0441\u0442\u0430\u043D\u0446\u0438\u0439","\u0421\u0438\u043D\u0445\u0440\u043E\u043D\u043D\u043E\u0435 \u0432\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0435 \u043D\u043E\u0447\u043D\u043E\u0433\u043E \u043E\u0441\u0432\u0435\u0449\u0435\u043D\u0438\u044F \u0432 19:30","\u0423\u0442\u0440\u0435\u043D\u043D\u0435\u0435 \u0443\u0433\u0430\u0441\u0430\u043D\u0438\u0435 \u0443\u043B\u0438\u0447\u043D\u044B\u0445 \u0444\u043E\u043D\u0430\u0440\u0435\u0439 \u043D\u0430 \u0440\u0430\u0441\u0441\u0432\u0435\u0442\u0435"]},{group:"renewables_radars",groupLabel:"\u0412\u0435\u0442\u0440\u043E\u043F\u0430\u0440\u043A\u0438 \u0412\u042D\u0421, \u0442\u0440\u0435\u043A\u0435\u0440\u044B \u0421\u042D\u0421, \u0440\u0430\u0434\u0430\u0440\u044B \u0438 \u043C\u0430\u044F\u043A",items:["\u0412\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u0440\u043E\u0442\u043E\u0440\u0430 \u0412\u042D\u0421-1 \u043D\u0430 \u0437\u0430\u043F\u0430\u0434\u043D\u043E\u043C \u0445\u0440\u0435\u0431\u0442\u0435","\u0412\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u0440\u043E\u0442\u043E\u0440\u0430 \u0412\u042D\u0421-2 \u0441\u043E \u0441\u0434\u0432\u0438\u0433\u043E\u043C \u0444\u0430\u0437\u044B 120\xB0","\u0412\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u0440\u043E\u0442\u043E\u0440\u0430 \u0412\u042D\u0421-3 \u0441 \u0443\u0441\u043A\u043E\u0440\u0435\u043D\u0438\u0435\u043C \u043F\u0440\u0438 \u0446\u0438\u043A\u043B\u043E\u043D\u0435","\u0420\u044B\u0441\u043A\u0430\u043D\u0438\u0435 \u0433\u043E\u043D\u0434\u043E\u043B\u044B \u0432\u0435\u0442\u0440\u044F\u043A\u0430 \u043F\u043E \u043D\u0430\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u044E \u0432\u0435\u0442\u0440\u0430","\u0423\u0442\u0440\u0435\u043D\u043D\u0438\u0439 \u0440\u0430\u0437\u0432\u043E\u0440\u043E\u0442 \u0441\u043E\u043B\u043D\u0435\u0447\u043D\u044B\u0445 \u043F\u0430\u043D\u0435\u043B\u0435\u0439 \u0421\u042D\u0421 \u043D\u0430 \u0432\u043E\u0441\u0442\u043E\u043A","\u0414\u043D\u0435\u0432\u043D\u043E\u0435 \u0437\u0435\u043D\u0438\u0442\u043D\u043E\u0435 \u0441\u043B\u0435\u0436\u0435\u043D\u0438\u0435 \u0442\u0440\u0435\u043A\u0435\u0440\u043E\u0432 \u0421\u042D\u0421","\u0412\u0435\u0447\u0435\u0440\u043D\u0438\u0439 \u043D\u0430\u043A\u043B\u043E\u043D \u043F\u0430\u043D\u0435\u043B\u0435\u0439 \u0421\u042D\u0421 \u043A \u0437\u0430\u043A\u0430\u0442\u043D\u043E\u043C\u0443 \u0441\u043E\u043B\u043D\u0446\u0443","\u041D\u043E\u0447\u043D\u0430\u044F \u043F\u0430\u0440\u043A\u043E\u0432\u043A\u0430 \u0441\u0442\u043E\u043B\u043E\u0432 \u0421\u042D\u0421 \u0432 \u0433\u043E\u0440\u0438\u0437\u043E\u043D\u0442","\u0411\u043B\u0438\u043A \u0441\u043E\u043B\u043D\u0435\u0447\u043D\u043E\u0433\u043E \u0437\u0430\u0439\u0447\u0438\u043A\u0430 \u043D\u0430 \u043A\u0440\u0435\u043C\u043D\u0438\u0435\u0432\u044B\u0445 \u044F\u0447\u0435\u0439\u043A\u0430\u0445 \u0421\u042D\u0421","\u041D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u043E\u043D\u043D\u044B\u0439 \u043E\u0433\u043E\u043D\u044C \u043F\u043E\u0440\u0442\u043E\u0432\u043E\u0433\u043E \u043C\u0430\u044F\u043A\u0430 \u043D\u043E\u0447\u044C\u044E","\u0412\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u0430\u043D\u0442\u0435\u043D\u043D\u044B \u0434\u043E\u043F\u043B\u0435\u0440\u043E\u0432\u0441\u043A\u043E\u0433\u043E \u043C\u0435\u0442\u0435\u043E\u0440\u0430\u0434\u0430\u0440\u0430","\u041A\u0430\u0447\u0430\u043D\u0438\u0435 \u0447\u0430\u0448\u0435\u043A \u0430\u043D\u0435\u043C\u043E\u043C\u0435\u0442\u0440\u0430 \u0433\u043E\u0440\u043D\u043E\u0439 \u043C\u0435\u0442\u0435\u043E\u0441\u0442\u0430\u043D\u0446\u0438\u0438","\u041F\u0443\u043B\u044C\u0441\u0430\u0446\u0438\u044F \u043A\u0440\u0430\u0441\u043D\u044B\u0445 \u043E\u0433\u043D\u0435\u0439 \u0417\u041E\u041C \u043D\u0430 \u043C\u0430\u0447\u0442\u0430\u0445 \u0412\u042D\u0421","\u0421\u0438\u043D\u0445\u0440\u043E\u043D\u043D\u0430\u044F \u0432\u0441\u043F\u044B\u0448\u043A\u0430 \u043E\u0433\u043D\u0435\u0439 \u0431\u0435\u0437\u043E\u043F\u0430\u0441\u043D\u043E\u0441\u0442\u0438 \u043D\u0435\u0431\u043E\u0441\u043A\u0440\u0451\u0431\u043E\u0432","\u041F\u043E\u0432\u043E\u0440\u043E\u0442 \u043F\u0430\u0440\u0430\u0431\u043E\u043B\u0438\u0447\u0435\u0441\u043A\u043E\u0439 \u0430\u043D\u0442\u0435\u043D\u043D\u044B \u043A\u043E\u0441\u043C\u043E\u0441\u0432\u044F\u0437\u0438 \u0426\u041E\u0414","\u0418\u043D\u0434\u0438\u043A\u0430\u0442\u043E\u0440 \u0437\u0430\u0440\u044F\u0434\u0430 \u0430\u043A\u043A\u0443\u043C\u0443\u043B\u044F\u0442\u043E\u0440\u043D\u043E\u0433\u043E \u0431\u0443\u0444\u0435\u0440\u0430 \u0421\u042D\u0421","\u041F\u043B\u0430\u0432\u043D\u044B\u0439 \u0445\u043E\u043B\u043E\u0441\u0442\u043E\u0439 \u0445\u043E\u0434 \u0412\u042D\u0421 \u0432 \u0448\u0442\u0438\u043B\u0435\u0432\u0443\u044E \u043C\u0435\u0436\u0435\u043D\u044C","\u0428\u0442\u043E\u0440\u043C\u043E\u0432\u043E\u0435 \u0434\u0435\u043C\u043F\u0444\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u043B\u043E\u043F\u0430\u0441\u0442\u0435\u0439 \u043F\u0440\u0438 \u0443\u0440\u0430\u0433\u0430\u043D\u0435","\u0421\u0432\u0435\u0442\u043E\u0434\u0438\u043E\u0434\u043D\u043E\u0435 \u043A\u043E\u043B\u044C\u0446\u043E \u043D\u0430 \u0431\u0430\u0448\u043D\u0435 \u043C\u0435\u0442\u0435\u043E\u043A\u043E\u043C\u043F\u043B\u0435\u043A\u0441\u0430","\u0422\u0435\u043B\u0435\u043C\u0435\u0442\u0440\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0438\u043C\u043F\u0443\u043B\u044C\u0441 \u0433\u0438\u0434\u0440\u043E\u043F\u043E\u0441\u0442\u0430 \u043D\u0430 \u0440\u0435\u043A\u0435","\u0420\u0430\u0431\u043E\u0442\u0430 \u0433\u0435\u043B\u0438\u043E\u043A\u043E\u043B\u043B\u0435\u043A\u0442\u043E\u0440\u043E\u0432 \u044D\u043A\u043E-\u043A\u0432\u0430\u0440\u0442\u0430\u043B\u0430","\u0412\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u0434\u0435\u0444\u043B\u0435\u043A\u0442\u043E\u0440\u043E\u0432 \u0432\u0435\u043D\u0442\u0438\u043B\u044F\u0446\u0438\u0438 \u043F\u043E\u0434\u0441\u0442\u0430\u043D\u0446\u0438\u0439","\u041F\u0440\u043E\u0431\u043B\u0435\u0441\u043A\u043E\u0432\u044B\u0439 \u0431\u0443\u0439 \u043C\u0435\u0442\u0435\u043E\u0441\u0442\u0430\u043D\u0446\u0438\u0438 \u043D\u0430 \u0432\u043E\u0434\u043E\u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435","\u041B\u0430\u0437\u0435\u0440\u043D\u044B\u0439 \u043B\u0438\u0434\u0430\u0440 \u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044F \u043E\u0431\u043B\u0430\u0447\u043D\u043E\u0441\u0442\u0438 \u043D\u0430 \u043F\u0438\u043A\u0435"]},{group:"industry_agro",groupLabel:"\u0417\u0430\u0432\u043E\u0434\u044B, \u0433\u0440\u0430\u0434\u0438\u0440\u043D\u0438, \u0426\u041E\u0414 \u0418\u0418 \u0438 \u0430\u0433\u0440\u043E\u0438\u0440\u0440\u0438\u0433\u0430\u0446\u0438\u044F",items:["\u041A\u043B\u0443\u0431\u044F\u0449\u0438\u0439\u0441\u044F \u0441\u0442\u043E\u043B\u0431 \u043F\u0430\u0440\u0430 \u0433\u0440\u0430\u0434\u0438\u0440\u043D\u0438 \u21161","\u041A\u043B\u0443\u0431\u044F\u0449\u0438\u0439\u0441\u044F \u0441\u0442\u043E\u043B\u0431 \u043F\u0430\u0440\u0430 \u0433\u0440\u0430\u0434\u0438\u0440\u043D\u0438 \u21162","\u0420\u0430\u0441\u0441\u0435\u0438\u0432\u0430\u043D\u0438\u0435 \u043F\u0430\u0440\u043E\u0432\u043E\u0433\u043E \u0448\u043B\u0435\u0439\u0444\u0430 \u0433\u0440\u0430\u0434\u0438\u0440\u0435\u043D \u043F\u043E \u0432\u0435\u0442\u0440\u0443","\u0414\u044B\u043C\u043A\u0430 \u043B\u0438\u0442\u0435\u0439\u043D\u043E\u0433\u043E \u043A\u043E\u0440\u043F\u0443\u0441\u0430 \u0410\u043B\u044E\u043C\u0433\u0440\u0430\u0434\u0430","\u041E\u0440\u0430\u043D\u0436\u0435\u0432\u044B\u0439 \u043E\u0442\u0441\u0432\u0435\u0442 \u043A\u043E\u0432\u0448\u0430 \u0436\u0438\u0434\u043A\u043E\u0433\u043E \u043C\u0435\u0442\u0430\u043B\u043B\u0430 \u0432 \u0446\u0435\u0445\u0443","\u0411\u0435\u0433\u0443\u0449\u0430\u044F \u0431\u0438\u0440\u044E\u0437\u043E\u0432\u0430\u044F \u043C\u0430\u0442\u0440\u0438\u0446\u0430 \u0441\u0442\u043E\u0435\u043A \u0426\u041E\u0414 \u0418\u0418 (\u0437\u0430\u043B \u0410)","\u0411\u0435\u0433\u0443\u0449\u0430\u044F \u0431\u0438\u0440\u044E\u0437\u043E\u0432\u0430\u044F \u043C\u0430\u0442\u0440\u0438\u0446\u0430 \u0441\u0442\u043E\u0435\u043A \u0426\u041E\u0414 \u0418\u0418 (\u0437\u0430\u043B \u0411)","\u0412\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u0447\u0438\u043B\u043B\u0435\u0440\u043E\u0432 \u0441\u0443\u0445\u043E\u0433\u043E \u043E\u0445\u043B\u0430\u0436\u0434\u0435\u043D\u0438\u044F \u0441\u0443\u043F\u0435\u0440\u043A\u043E\u043C\u043F\u044C\u044E\u0442\u0435\u0440\u0430","\u041F\u0443\u043B\u044C\u0441\u0430\u0446\u0438\u044F \u0437\u0435\u043B\u0451\u043D\u043E\u0433\u043E \u043A\u043E\u043B\u044C\u0446\u0430 \u043E\u0440\u043E\u0448\u0435\u043D\u0438\u044F \u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u044B","\u041D\u0430\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u0435 \u043F\u0440\u0438\u0451\u043C\u043D\u043E\u0439 \u0447\u0430\u0448\u0438 \u043E\u0440\u043E\u0441\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0433\u043E \u043A\u0430\u043D\u0430\u043B\u0430","\u0423\u0432\u043B\u0430\u0436\u043D\u0435\u043D\u0438\u0435 \u0447\u0435\u0440\u043D\u043E\u0437\u0451\u043C\u0430 \u0432\u043E\u043A\u0440\u0443\u0433 \u043A\u0430\u043D\u0430\u043B\u0430 \u0438\u0440\u0440\u0438\u0433\u0430\u0446\u0438\u0438","\u041F\u043E\u0434\u044A\u0451\u043C \u043D\u043E\u0440\u0438\u0438 \u0437\u0435\u0440\u043D\u043E\u0432\u043E\u0433\u043E \u044D\u043B\u0435\u0432\u0430\u0442\u043E\u0440\u0430 \u043D\u0430 \u043F\u043E\u0433\u0440\u0443\u0437\u043A\u0435","\u0422\u0451\u043F\u043B\u043E\u0435 \u0444\u0438\u0442\u043E-\u0441\u0432\u0435\u0447\u0435\u043D\u0438\u0435 \u0442\u0435\u043F\u043B\u0438\u0447\u043D\u043E\u0433\u043E \u043A\u043E\u043C\u043F\u043B\u0435\u043A\u0441\u0430 \u043D\u043E\u0447\u044C\u044E","\u041E\u0442\u043A\u0440\u044B\u0442\u0438\u0435 \u0444\u0440\u0430\u043C\u0443\u0433 \u043F\u0440\u043E\u0432\u0435\u0442\u0440\u0438\u0432\u0430\u043D\u0438\u044F \u0442\u0435\u043F\u043B\u0438\u0446 \u0432 \u043F\u043E\u043B\u0434\u0435\u043D\u044C","\u0420\u0430\u0431\u043E\u0442\u0430 \u043F\u043E\u0440\u0442\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u043A\u0440\u0430\u043D\u0430 \u0432 \u0423\u0441\u0442\u044C-\u041F\u043E\u0440\u0442\u0443","\u0421\u0432\u0435\u0442\u043E\u0432\u0430\u044F \u0438\u043D\u0434\u0438\u043A\u0430\u0446\u0438\u044F \u044D\u043B\u0435\u043A\u0442\u0440\u043E\u043B\u0438\u0437\u043D\u043E\u0433\u043E \u0446\u0435\u0445\u0430 \u0430\u043B\u044E\u043C\u0438\u043D\u0438\u044F","\u0412\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u0430\u044D\u0440\u0430\u0442\u043E\u0440\u043E\u0432 \u0432\u043E\u0434\u044B \u0432 \u0444\u043E\u0440\u0435\u043B\u0435\u0432\u044B\u0445 \u0441\u0430\u0434\u043A\u0430\u0445","\u0410\u0432\u0442\u043E\u043A\u043E\u0440\u043C\u0443\u0448\u043A\u0430 \u0440\u044B\u0431\u043E\u0432\u043E\u0434\u043D\u043E\u0433\u043E \u043F\u043E\u043D\u0442\u043E\u043D\u0430 \u043D\u0430 \u043F\u043B\u0451\u0441\u0435","\u041F\u0443\u043B\u044C\u0441\u0430\u0446\u0438\u044F \u043D\u0430\u0441\u043E\u0441\u043D\u043E\u0439 \u0441\u0442\u0430\u043D\u0446\u0438\u0438 \u0413\u043E\u0440\u0432\u043E\u0434\u043E\u043A\u0430\u043D\u0430\u043B\u0430","\u041C\u0435\u0434\u043B\u0435\u043D\u043D\u043E\u0435 \u0432\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u0441\u043A\u0440\u0435\u0431\u043A\u0430 \u0440\u0430\u0434\u0438\u0430\u043B\u044C\u043D\u043E\u0433\u043E \u043E\u0442\u0441\u0442\u043E\u0439\u043D\u0438\u043A\u0430","\u041A\u043E\u043D\u0432\u0435\u0439\u0435\u0440 \u0433\u043B\u0438\u043D\u043E\u0437\u0451\u043C\u0430 \u043D\u0430 \u043F\u0440\u043E\u043C\u043F\u043B\u043E\u0449\u0430\u0434\u043A\u0435","\u0422\u0435\u0445\u043D\u043E\u043B\u043E\u0433\u0438\u0447\u0435\u0441\u043A\u043E\u0435 \u0441\u0432\u0435\u0447\u0435\u043D\u0438\u0435 \u0433\u0440\u0430\u0434\u0438\u0440\u043D\u0438 \u0432 \u0441\u0443\u043C\u0435\u0440\u043A\u0430\u0445","\u0420\u0430\u0431\u043E\u0442\u0430 \u043A\u043E\u0437\u043B\u043E\u0432\u043E\u0433\u043E \u043A\u0440\u0430\u043D\u0430 \u0441\u043A\u043B\u0430\u0434\u0430 \u0433\u043E\u0442\u043E\u0432\u043E\u0439 \u043F\u0440\u043E\u0434\u0443\u043A\u0446\u0438\u0438","\u041F\u043E\u0434\u0441\u0432\u0435\u0442\u043A\u0430 \u043B\u043E\u0433\u043E\u0442\u0438\u043F\u0430 \u0422\u0435\u0445\u043D\u043E\u043F\u0430\u0440\u043A\u0430 \u0418\u0418 \u043D\u043E\u0447\u044C\u044E","\u041F\u0435\u0440\u0435\u043B\u0438\u0432 \u0447\u0438\u0441\u0442\u043E\u0439 \u0432\u043E\u0434\u044B \u043D\u0430 \u0444\u0438\u043B\u044C\u0442\u0440\u0430\u0445 \u0432\u043E\u0434\u043E\u043F\u043E\u0434\u0433\u043E\u0442\u043E\u0432\u043A\u0438","\u0420\u043E\u0441\u0442 \u0443\u0440\u043E\u0436\u0430\u0439\u043D\u043E\u0441\u0442\u0438 \u0444\u0435\u0440\u043C \u043F\u0440\u0438 \u0441\u0442\u0430\u0431\u0438\u043B\u044C\u043D\u043E\u0439 \u0438\u0440\u0440\u0438\u0433\u0430\u0446\u0438\u0438"]},{group:"wildlife_fauna",groupLabel:"\u0412\u044B\u0441\u043E\u0442\u043D\u044B\u0435 \u043F\u0442\u0438\u0446\u044B \u0432 \u043D\u0435\u0431\u0435 \u0438 \u044D\u043A\u043E\u0441\u0438\u0441\u0442\u0435\u043C\u0430 \u0433\u043E\u0440",items:["\u041F\u0430\u0440\u0435\u043D\u0438\u0435 \u0431\u0435\u0440\u043A\u0443\u0442\u0430 \u0432 \u0432\u043E\u0441\u0445\u043E\u0434\u044F\u0449\u0435\u043C \u0442\u0435\u0440\u043C\u0438\u043A\u0435 \u043D\u0430\u0434 \u0443\u0449\u0435\u043B\u044C\u0435\u043C","\u0421\u043F\u0438\u0440\u0430\u043B\u044C \u043F\u0430\u0440\u044B \u0433\u043E\u0440\u043D\u044B\u0445 \u043E\u0440\u043B\u043E\u0432 \u043D\u0430\u0434 \u0441\u0435\u0432\u0435\u0440\u043D\u044B\u043C \u043F\u0438\u043A\u043E\u043C","\u041A\u043B\u0438\u043D \u043F\u0435\u0440\u0435\u043B\u0451\u0442\u043D\u044B\u0445 \u043F\u0442\u0438\u0446 \u0432\u044B\u0441\u043E\u043A\u043E \u043D\u0430\u0434 \u0445\u0440\u0435\u0431\u0442\u043E\u043C","\u041A\u0440\u0443\u0436\u0435\u043D\u0438\u0435 \u0431\u0435\u043B\u044B\u0445 \u0447\u0430\u0435\u043A \u043D\u0430\u0434 \u0448\u0438\u0440\u043E\u043A\u0438\u043C \u0432\u043E\u0434\u043E\u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435\u043C","\u041F\u043B\u0430\u0432\u043D\u044B\u0439 \u043D\u0430\u0431\u043E\u0440 \u0432\u044B\u0441\u043E\u0442\u044B \u043E\u0440\u043B\u0430 \u0432 \u0433\u043E\u0440\u043D\u043E\u043C \u043F\u043E\u0442\u043E\u043A\u0435","\u0421\u043A\u043E\u043B\u044C\u0436\u0435\u043D\u0438\u0435 \u0441\u043E\u043A\u043E\u043B\u0430 \u0432\u0434\u043E\u043B\u044C \u0441\u043A\u0430\u043B\u044C\u043D\u044B\u0445 \u0449\u0451\u043A \u043A\u0430\u043D\u044C\u043E\u043D\u0430","\u0412\u0437\u043C\u0430\u0445\u0438 \u043A\u0440\u044B\u043B\u044C\u0435\u0432 \u043F\u0442\u0438\u0446 \u0441 \u0438\u043D\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043B\u044C\u043D\u043E\u0439 \u0444\u0430\u0437\u043E\u0439","\u041F\u043B\u0430\u0432\u043D\u043E\u0435 \u043F\u043B\u0430\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u043F\u0442\u0438\u0446 \u043D\u0430 \u0440\u0430\u0441\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043D\u044B\u0445 \u043A\u0440\u044B\u043B\u044C\u044F\u0445","\u041A\u0440\u0443\u0436\u0435\u043D\u0438\u0435 \u0447\u0430\u0435\u043A \u043D\u0430\u0434 \u043F\u0440\u0438\u0431\u0440\u0435\u0436\u043D\u043E\u0439 \u043F\u043E\u043B\u043E\u0441\u043E\u0439 \u043C\u043E\u0440\u044F","\u0412\u044B\u0441\u043E\u0442\u043D\u044B\u0439 \u043E\u0431\u043B\u0451\u0442 \u0441\u0442\u0430\u0438 \u043D\u0430\u0434 \u0434\u0435\u0440\u0438\u0432\u0430\u0446\u0438\u043E\u043D\u043D\u044B\u043C \u043F\u043B\u0430\u0442\u043E","\u0412\u0435\u0447\u0435\u0440\u043D\u0435\u0435 \u0432\u043E\u0437\u0432\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u043F\u0442\u0438\u0446 \u043A \u043B\u0435\u0441\u043D\u044B\u043C \u0441\u043A\u043B\u043E\u043D\u0430\u043C","\u0423\u0442\u0440\u0435\u043D\u043D\u0438\u0439 \u0432\u044B\u043B\u0435\u0442 \u0441\u0442\u0430\u0439 \u043D\u0430 \u0440\u0430\u0441\u0441\u0432\u0435\u0442\u0435 \u043D\u0430\u0434 \u0434\u043E\u043B\u0438\u043D\u043E\u0439","\u0414\u0440\u0435\u0439\u0444 \u043F\u0442\u0438\u0447\u044C\u0435\u0433\u043E \u043A\u0440\u0443\u0433\u0430 \u043F\u043E \u043D\u0430\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u044E \u0432\u0435\u0442\u0440\u0430","\u0421\u043C\u0435\u043D\u0430 \u0432\u044B\u0441\u043E\u0442\u044B \u043F\u0430\u0440\u0435\u043D\u0438\u044F \u043F\u0440\u0438 \u043F\u0440\u0438\u0431\u043B\u0438\u0436\u0435\u043D\u0438\u0438 \u0434\u043E\u0436\u0434\u044F","\u041F\u0430\u0440\u0435\u043D\u0438\u0435 \u043A\u0430\u043D\u044E\u043A\u0430 \u043D\u0430\u0434 \u043F\u043E\u043B\u044F\u043C\u0438 \u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u044B","\u041F\u043E\u043B\u0451\u0442 \u0430\u043B\u044C\u043F\u0438\u0439\u0441\u043A\u0438\u0445 \u0433\u0430\u043B\u043E\u043A \u0443 \u0441\u043D\u0435\u0436\u043D\u044B\u0445 \u0432\u0435\u0440\u0448\u0438\u043D","\u041A\u0440\u0443\u0436\u0435\u043D\u0438\u0435 \u0447\u0430\u0435\u043A \u0443 \u0441\u0430\u0434\u043A\u043E\u0432 \u043F\u043E\u0441\u0442\u0440\u043E\u0435\u043D\u043D\u043E\u0433\u043E \u0440\u044B\u0431\u0445\u043E\u0437\u0430","\u041F\u0435\u0440\u0435\u043B\u0451\u0442 \u0441\u0442\u0430\u0438 \u043D\u0430\u0434 \u043B\u0435\u0441\u043D\u044B\u043C \u043C\u0430\u0441\u0441\u0438\u0432\u043E\u043C \u0421\u0435\u0432\u0435\u0440\u043E\u0431\u043E\u0440\u0441\u043A\u0430","\u0421\u0438\u043D\u0445\u0440\u043E\u043D\u043D\u044B\u0439 \u0432\u0438\u0440\u0430\u0436 \u043F\u0430\u0440\u044B \u043E\u0440\u043B\u043E\u0432 \u043D\u0430\u0434 \u043A\u0430\u043D\u044C\u043E\u043D\u043E\u043C","\u0422\u0435\u043D\u0435\u0432\u043E\u0439 \u0441\u0438\u043B\u0443\u044D\u0442 \u043A\u0440\u044B\u043B\u044C\u0435\u0432 \u043D\u0430 \u0444\u043E\u043D\u0435 \u0441\u0432\u0435\u0442\u043B\u043E\u0433\u043E \u043D\u0435\u0431\u0430","\u041F\u0430\u0442\u0440\u0443\u043B\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u043C\u043E\u0440\u0441\u043A\u0438\u0445 \u043F\u0442\u0438\u0446 \u043D\u0430\u0434 \u0432\u043D\u0435\u0448\u043D\u0438\u043C \u0437\u0430\u043B\u0438\u0432\u043E\u043C","\u0421\u043D\u0438\u0436\u0435\u043D\u0438\u0435 \u0447\u0430\u0435\u043A \u043A \u0441\u043F\u043E\u043A\u043E\u0439\u043D\u043E\u043C\u0443 \u043F\u043B\u0451\u0441\u0443 \u0432 \u0448\u0442\u0438\u043B\u044C","\u0412\u044B\u0441\u043E\u0442\u043D\u0430\u044F \u0441\u043F\u0438\u0440\u0430\u043B\u044C \u043F\u0442\u0438\u0446 \u0432 \u0441\u043E\u043B\u043D\u0435\u0447\u043D\u044B\u0439 \u043F\u043E\u043B\u0434\u0435\u043D\u044C","\u0417\u0430\u0442\u0438\u0445\u0430\u043D\u0438\u0435 \u043F\u043E\u043B\u0451\u0442\u043E\u0432 \u043F\u0440\u0438 \u0448\u0442\u043E\u0440\u043C\u043E\u0432\u043E\u043C \u043F\u0430\u0432\u043E\u0434\u043A\u0435","\u041A\u0440\u0443\u0436\u0435\u043D\u0438\u0435 \u043F\u0442\u0438\u0446 \u043D\u0430\u0434 \u0437\u0435\u043B\u0451\u043D\u044B\u043C \u043E\u0441\u0442\u0440\u043E\u0432\u043E\u043C \u0434\u0435\u043B\u044C\u0442\u044B","\u0421\u043F\u043E\u043A\u043E\u0439\u043D\u043E\u0435 \u043F\u0430\u0440\u0435\u043D\u0438\u0435 \u043D\u0430 \u0437\u0430\u043A\u0430\u0442\u043D\u044B\u0445 \u0432\u043E\u0437\u0434\u0443\u0448\u043D\u044B\u0445 \u043F\u043E\u0442\u043E\u043A\u0430\u0445"]},{group:"flora_wind",groupLabel:"\u041B\u0435\u0441\u043D\u043E\u0439 \u043C\u0430\u0441\u0441\u0438\u0432, \u043F\u043E\u043B\u044F \u0438 \u0432\u0435\u0442\u0440\u043E\u0432\u0430\u044F \u043F\u043B\u0430\u0441\u0442\u0438\u043A\u0430",items:["\u041F\u043E\u043A\u0430\u0447\u0438\u0432\u0430\u043D\u0438\u0435 \u0432\u0435\u0440\u0445\u0443\u0448\u0435\u043A \u0441\u0438\u0431\u0438\u0440\u0441\u043A\u0438\u0445 \u0435\u043B\u0435\u0439 \u043D\u0430 \u0432\u0435\u0442\u0440\u0443","\u0423\u043F\u0440\u0443\u0433\u0438\u0439 \u043D\u0430\u043A\u043B\u043E\u043D \u043A\u043E\u0440\u0430\u0431\u0435\u043B\u044C\u043D\u044B\u0445 \u0441\u043E\u0441\u0435\u043D \u043D\u0430 \u0445\u0440\u0435\u0431\u0442\u0430\u0445","\u0422\u0440\u0435\u043F\u0435\u0442 \u043A\u0440\u043E\u043D \u043F\u0440\u0438\u0431\u0440\u0435\u0436\u043D\u044B\u0445 \u0434\u0435\u0440\u0435\u0432\u044C\u0435\u0432 \u0443 \u043A\u0440\u043E\u043C\u043A\u0438 \u0432\u043E\u0434\u044B","\u0411\u0435\u0433\u0443\u0449\u0430\u044F \u0432\u0435\u0442\u0440\u043E\u0432\u0430\u044F \u0442\u0435\u043D\u044C \u043F\u043E \u0442\u0440\u0430\u0432\u044F\u043D\u0438\u0441\u0442\u044B\u043C \u043B\u0443\u0433\u0430\u043C","\u0418\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0435 \u0432\u043B\u0430\u0436\u043D\u043E\u0433\u043E \u0431\u043B\u0435\u0441\u043A\u0430 \u043B\u0438\u0441\u0442\u0432\u044B \u043F\u043E\u0441\u043B\u0435 \u0434\u043E\u0436\u0434\u044F","\u0428\u0442\u043E\u0440\u043C\u043E\u0432\u043E\u0439 \u0438\u0437\u0433\u0438\u0431 \u043A\u0440\u043E\u043D \u043F\u0440\u0438 \u043F\u0440\u0438\u0445\u043E\u0434\u0435 \u0446\u0438\u043A\u043B\u043E\u043D\u0430","\u041B\u0451\u0433\u043A\u043E\u0435 \u0434\u044B\u0445\u0430\u043D\u0438\u0435 \u0445\u0432\u043E\u0438 \u0432 \u0442\u0438\u0445\u0443\u044E \u043B\u0435\u0442\u043D\u044E\u044E \u043C\u0435\u0436\u0435\u043D\u044C","\u041F\u043B\u0430\u0432\u043D\u044B\u0439 \u043F\u0435\u0440\u0435\u0445\u043E\u0434 \u043F\u043E\u0439\u043C\u0435\u043D\u043D\u044B\u0445 \u0442\u0440\u0430\u0432 \u0432 \u0440\u0435\u0447\u043D\u0443\u044E \u0433\u0430\u043B\u044C\u043A\u0443","\u0421\u043C\u0435\u043D\u0430 \u043E\u0442\u0442\u0435\u043D\u043A\u0430 \u0432\u043B\u0430\u0436\u043D\u043E\u0441\u0442\u0438 \u0431\u0435\u0440\u0435\u0433\u043E\u0432\u043E\u0439 \u0442\u0440\u0430\u0432\u044B \u0443 \u0432\u043E\u0434\u044B","\u041F\u043E\u0442\u0435\u043C\u043D\u0435\u043D\u0438\u0435 \u043F\u0440\u0438\u0431\u0440\u0435\u0436\u043D\u043E\u0439 \u0433\u0430\u043B\u044C\u043A\u0438 \u043F\u0440\u0438 \u043D\u0430\u043A\u0430\u0442\u0435 \u0432\u043E\u043B\u043D\u044B","\u0412\u044B\u0441\u044B\u0445\u0430\u043D\u0438\u0435 \u043C\u043E\u043A\u0440\u043E\u0433\u043E \u0431\u0435\u0440\u0435\u0433\u0430 \u043D\u0430 \u043F\u043E\u043B\u0443\u0434\u0435\u043D\u043D\u043E\u043C \u0441\u043E\u043B\u043D\u0446\u0435","\u0418\u0437\u0443\u043C\u0440\u0443\u0434\u043D\u043E\u0435 \u043D\u0430\u0441\u044B\u0449\u0435\u043D\u0438\u0435 \u043F\u043E\u043B\u0435\u0439 \u043F\u0440\u0438 \u043F\u043E\u0434\u0430\u0447\u0435 \u0438\u0440\u0440\u0438\u0433\u0430\u0446\u0438\u0438","\u0420\u0430\u0441\u0447\u0438\u0441\u0442\u043A\u0430 \u043F\u0440\u043E\u0441\u0435\u043A\u0438 \u043F\u043E\u0434 \u0441\u0442\u0432\u043E\u0440 \u043F\u043B\u043E\u0442\u0438\u043D\u044B \u0438 \u043A\u0430\u043D\u0430\u043B\u0430","\u0422\u0435\u043D\u0438 \u0445\u0432\u043E\u0439\u043D\u044B\u0445 \u043A\u0440\u043E\u043D \u043D\u0430 \u043E\u0441\u0432\u0435\u0449\u0451\u043D\u043D\u044B\u0445 \u0441\u043A\u043B\u043E\u043D\u0430\u0445 \u0433\u043E\u0440","\u0410\u043B\u044C\u043F\u0438\u0439\u0441\u043A\u043E\u0435 \u0440\u0430\u0437\u043D\u043E\u0442\u0440\u0430\u0432\u044C\u0435 \u043D\u0430 \u0441\u0443\u0431\u0430\u043B\u044C\u043F\u0438\u0439\u0441\u043A\u0438\u0445 \u043B\u0443\u0433\u0430\u0445","\u041C\u043E\u0445\u043E\u0432\u044B\u0435 \u043A\u0443\u0440\u0442\u0438\u043D\u044B \u043D\u0430 \u0432\u043B\u0430\u0436\u043D\u044B\u0445 \u0441\u043A\u0430\u043B\u0430\u0445 \u043A\u0430\u043D\u044C\u043E\u043D\u0430","\u041B\u0435\u0441\u043D\u043E\u0439 \u043F\u043E\u044F\u0441 \u0432\u0434\u043E\u043B\u044C \u0440\u0443\u0447\u044C\u044F \u0413\u0440\u0435\u043C\u0443\u0447\u0435\u0433\u043E","\u041F\u0430\u0440\u043A\u043E\u0432\u044B\u0435 \u0440\u043E\u0449\u0438 \u0432\u043E\u043A\u0440\u0443\u0433 \u043A\u0443\u0440\u043E\u0440\u0442\u043D\u043E\u0433\u043E \u0423\u0441\u0442\u044C-\u041F\u043E\u0440\u0442\u0430","\u0417\u0430\u0449\u0438\u0442\u043D\u0430\u044F \u043B\u0435\u0441\u043E\u043F\u043E\u043B\u043E\u0441\u0430 \u0432\u0434\u043E\u043B\u044C \u0442\u0435\u0440\u0440\u0430\u0441\u044B \u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u044B","\u041A\u043E\u043D\u0442\u0440\u0430\u0441\u0442 \u0442\u0451\u043C\u043D\u043E\u0439 \u0442\u0430\u0439\u0433\u0438 \u0438 \u0441\u0432\u0435\u0442\u043B\u044B\u0445 \u043F\u0435\u0441\u0447\u0430\u043D\u044B\u0445 \u043E\u0442\u043C\u0435\u043B\u0435\u0439","\u0412\u0435\u0442\u0440\u043E\u0432\u0430\u044F \u0440\u044F\u0431\u044C \u043B\u0443\u0433\u043E\u0432 \u0432\u043E\u043A\u0440\u0443\u0433 \u0444\u0435\u0440\u043C\u0435\u0440\u0441\u043A\u0438\u0445 \u0443\u0433\u043E\u0434\u0438\u0439","\u041C\u044F\u0433\u043A\u043E\u0435 \u0440\u0430\u0441\u0441\u0435\u0438\u0432\u0430\u043D\u0438\u0435 \u0434\u0430\u043B\u0451\u043A\u043E\u0433\u043E \u043B\u0435\u0441\u0430 \u0432 \u043A\u0440\u0430\u0435\u0432\u043E\u043C \u0442\u0443\u043C\u0430\u043D\u0435","\u0423\u0432\u043B\u0430\u0436\u043D\u0435\u043D\u0438\u0435 \u043F\u043E\u0447\u0432\u044B \u043F\u043E\u0439\u043C\u044B \u043F\u043E\u0441\u043B\u0435 \u0432\u0435\u0441\u0435\u043D\u043D\u0435\u0433\u043E \u043F\u0430\u0432\u043E\u0434\u043A\u0430","\u041A\u043E\u043D\u0442\u0440\u0430\u0441\u0442 \u0441\u0443\u0445\u0438\u0445 \u044E\u0436\u043D\u044B\u0445 \u0438 \u0432\u043B\u0430\u0436\u043D\u044B\u0445 \u0441\u0435\u0432\u0435\u0440\u043D\u044B\u0445 \u0441\u043A\u043B\u043E\u043D\u043E\u0432","\u0425\u0432\u043E\u0439\u043D\u044B\u0435 \u043A\u0443\u0440\u0442\u0438\u043D\u044B \u0443 \u043A\u043E\u0442\u0442\u0435\u0434\u0436\u0435\u0439 \u0420\u0435\u0447\u043D\u043E\u0433\u043E \u041F\u043E\u0441\u0430\u0434\u0430","\u0420\u0435\u0434\u043A\u043E\u043B\u0435\u0441\u044C\u0435 \u0443 \u043D\u0438\u0436\u043D\u0435\u0439 \u0433\u0440\u0430\u043D\u0438\u0446\u044B \u0432\u0435\u0447\u043D\u044B\u0445 \u0441\u043D\u0435\u0433\u043E\u0432","\u041F\u043B\u0430\u0432\u043D\u044B\u0439 \u043F\u0435\u0440\u0435\u0445\u043E\u0434 \u0442\u0443\u043D\u0434\u0440\u044B \u0432 \u0441\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u0433\u0440\u0435\u0431\u0435\u043D\u044C","\u0421\u043E\u043B\u043D\u0435\u0447\u043D\u044B\u0435 \u043F\u043E\u043B\u044F\u043D\u044B \u0432 \u0440\u0430\u0437\u0440\u0435\u0436\u0435\u043D\u043D\u043E\u043C \u0441\u043E\u0441\u043D\u043E\u0432\u043E\u043C \u0431\u043E\u0440\u0443"]},{group:"sky_climate",groupLabel:"\u0410\u0442\u043C\u043E\u0441\u0444\u0435\u0440\u0430, \u043A\u0440\u0430\u0435\u0432\u043E\u0439 \u0442\u0443\u043C\u0430\u043D, \u043C\u043E\u0440\u0435 \u0438 \u0441\u043C\u0435\u043D\u0430 \u0441\u0443\u0442\u043E\u043A",items:["\u0421\u0443\u0442\u043E\u0447\u043D\u043E\u0435 \u0434\u0432\u0438\u0436\u0435\u043D\u0438\u0435 \u0441\u043E\u043B\u043D\u0446\u0430 \u0441 \u0432\u043E\u0441\u0442\u043E\u043A\u0430 \u043D\u0430 \u0437\u0430\u043F\u0430\u0434","\u0412\u043E\u0441\u0445\u043E\u0434 \u0441 \u0442\u0451\u043F\u043B\u044B\u043C \u0437\u043E\u043B\u043E\u0442\u0438\u0441\u0442\u043E-\u0440\u043E\u0437\u043E\u0432\u044B\u043C \u0441\u0432\u0435\u0442\u043E\u043C \u0433\u043E\u0440","\u0417\u0435\u043D\u0438\u0442\u043D\u043E\u0435 \u043F\u043E\u043B\u0443\u0434\u0435\u043D\u043D\u043E\u0435 \u043E\u0441\u0432\u0435\u0449\u0435\u043D\u0438\u0435 \u0432\u044B\u0441\u043E\u043A\u043E\u0439 \u0447\u0451\u0442\u043A\u043E\u0441\u0442\u0438","\u0411\u0430\u0433\u0440\u044F\u043D\u044B\u0439 \u0430\u043B\u044C\u043F\u0438\u0439\u0441\u043A\u0438\u0439 \u0437\u0430\u043A\u0430\u0442 \u043D\u0430 \u0441\u043D\u0435\u0436\u043D\u044B\u0445 \u043F\u0438\u043A\u0430\u0445","\u0421\u0438\u043D\u044F\u044F \u0431\u0430\u0440\u0445\u0430\u0442\u043D\u0430\u044F \u043D\u043E\u0447\u044C \u0441 \u043B\u0443\u043D\u043D\u044B\u043C \u0441\u0432\u0435\u0442\u043E\u043C","\u0414\u0440\u0435\u0439\u0444 \u043E\u0431\u044A\u0451\u043C\u043D\u044B\u0445 \u043A\u0443\u0447\u0435\u0432\u044B\u0445 \u043E\u0431\u043B\u0430\u043A\u043E\u0432 \u043D\u0430\u0434 \u0434\u043E\u043B\u0438\u043D\u043E\u0439","\u0411\u0435\u0433\u0443\u0449\u0438\u0435 \u043C\u044F\u0433\u043A\u0438\u0435 \u0442\u0435\u043D\u0438 \u043E\u0431\u043B\u0430\u043A\u043E\u0432 \u043F\u043E \u0433\u043E\u0440\u0430\u043C \u0438 \u0432\u043E\u0434\u0435","\u0421\u0433\u0443\u0449\u0435\u043D\u0438\u0435 \u0433\u0440\u043E\u0437\u043E\u0432\u043E\u0439 \u043E\u0431\u043B\u0430\u0447\u043D\u043E\u0441\u0442\u0438 \u043F\u0435\u0440\u0435\u0434 \u043F\u0430\u0432\u043E\u0434\u043A\u043E\u043C","\u0414\u043D\u0435\u0432\u043D\u043E\u0435 \u043E\u0442\u0441\u0442\u0443\u043F\u043B\u0435\u043D\u0438\u0435 \u043A\u0440\u043E\u043C\u043A\u0438 \u0433\u043E\u0440\u043D\u044B\u0445 \u0441\u043D\u0435\u0436\u043D\u0438\u043A\u043E\u0432 (\u0442\u0430\u044F\u043D\u0438\u0435)","\u041D\u043E\u0447\u043D\u043E\u0435 \u043F\u0440\u043E\u043C\u0435\u0440\u0437\u0430\u043D\u0438\u0435 \u0438 \u0431\u043B\u0435\u0441\u043A \u0433\u043E\u0440\u043D\u043E\u0433\u043E \u043B\u0435\u0434\u043D\u0438\u043A\u0430","\u041A\u043E\u0441\u044B\u0435 \u0441\u0435\u0440\u0435\u0431\u0440\u0438\u0441\u0442\u044B\u0435 \u043D\u0438\u0442\u0438 \u0434\u043E\u0436\u0434\u044F \u043F\u0440\u0438 \u0446\u0438\u043A\u043B\u043E\u043D\u0435","\u0413\u0443\u0441\u0442\u043E\u0439 \u0430\u0442\u043C\u043E\u0441\u0444\u0435\u0440\u043D\u044B\u0439 \u0442\u0443\u043C\u0430\u043D \u0437\u0430 \u043F\u0440\u0435\u0434\u0435\u043B\u0430\u043C\u0438 \u043A\u0430\u0440\u0442\u044B","\u0411\u0435\u0441\u043A\u0440\u0430\u0439\u043D\u044F\u044F \u0432\u043E\u0434\u043D\u0430\u044F \u0433\u043B\u0430\u0434\u044C \u0432\u043E\u043A\u0440\u0443\u0433 \u0434\u043E\u043B\u0438\u043D\u044B \u0434\u043E \u0433\u043E\u0440\u0438\u0437\u043E\u043D\u0442\u0430","\u041C\u044F\u0433\u043A\u043E\u0435 \u0441\u043B\u0438\u044F\u043D\u0438\u0435 \u0432\u043D\u0435\u0448\u043D\u0435\u0433\u043E \u043C\u043E\u0440\u044F \u0441 \u043D\u0435\u0431\u0435\u0441\u043D\u043E\u0439 \u0434\u044B\u043C\u043A\u043E\u0439","\u0412\u0435\u0442\u0440\u043E\u0432\u043E\u0439 \u0441\u043D\u043E\u0441 \u0434\u043E\u0436\u0434\u0435\u0432\u043E\u0439 \u043F\u0435\u043B\u0435\u043D\u044B \u043F\u043E \u043F\u043E\u0440\u044B\u0432\u0430\u043C","\u0418\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0435 \u0446\u0432\u0435\u0442\u043E\u0432\u043E\u0439 \u0442\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u044B \u043D\u0435\u0431\u0430 \u043F\u043E \u0447\u0430\u0441\u0430\u043C","\u0410\u0434\u0430\u043F\u0442\u0438\u0432\u043D\u0430\u044F \u043F\u043B\u043E\u0442\u043D\u043E\u0441\u0442\u044C \u0442\u0443\u043C\u0430\u043D\u0430 \u043F\u043E\u0434 \u043C\u0430\u0441\u0448\u0442\u0430\u0431 10\xD710 \u043A\u043C","\u0421\u043E\u043B\u043D\u0435\u0447\u043D\u0430\u044F \u0434\u043E\u0440\u043E\u0436\u043A\u0430 \u043D\u0430 \u0432\u043D\u0435\u0448\u043D\u0435\u043C \u043C\u043E\u0440\u0435 \u0432\u043E\u043A\u0440\u0443\u0433 \u043A\u0430\u0440\u0442\u044B","\u041A\u043E\u043B\u044C\u0446\u043E \u043E\u0431\u044A\u0451\u043C\u043D\u043E\u0439 \u0434\u044B\u043C\u043A\u0438 \u0432\u0434\u043E\u043B\u044C \u0433\u043E\u0440\u0438\u0437\u043E\u043D\u0442\u0430 \u0431\u0430\u0441\u0441\u0435\u0439\u043D\u0430","\u0412\u043B\u0430\u0436\u043D\u044B\u0439 \u0431\u043B\u0435\u0441\u043A \u0441\u043A\u0430\u043B \u0438 \u043A\u0440\u044B\u0448 \u0432\u043E \u0432\u0440\u0435\u043C\u044F \u0434\u043E\u0436\u0434\u044F","\u0411\u044B\u0441\u0442\u0440\u043E\u0435 \u043F\u0440\u043E\u044F\u0441\u043D\u0435\u043D\u0438\u0435 \u043D\u0435\u0431\u0430 \u043F\u043E\u0441\u043B\u0435 \u043F\u0440\u043E\u0445\u043E\u0436\u0434\u0435\u043D\u0438\u044F \u0444\u0440\u043E\u043D\u0442\u0430","\u0421\u0443\u0445\u043E\u0439 \u0437\u043E\u043B\u043E\u0442\u0438\u0441\u0442\u044B\u0439 \u0437\u043D\u043E\u0439 \u0432 \u043F\u0435\u0440\u0438\u043E\u0434 \u043B\u0435\u0442\u043D\u0435\u0439 \u043C\u0435\u0436\u0435\u043D\u0438","\u0425\u043E\u043B\u043E\u0434\u043D\u044B\u0435 \u0441\u0438\u043D\u0438\u0435 \u0442\u0435\u043D\u0438 \u0432 \u0441\u0435\u0432\u0435\u0440\u043D\u044B\u0445 \u0446\u0438\u0440\u043A\u0430\u0445 \u043B\u0435\u0434\u043D\u0438\u043A\u043E\u0432","\u041C\u044F\u0433\u043A\u043E\u0435 \u0440\u0430\u0441\u0441\u0435\u044F\u043D\u043D\u043E\u0435 \u043E\u0441\u0432\u0435\u0449\u0435\u043D\u0438\u0435 \u043F\u0430\u0441\u043C\u0443\u0440\u043D\u043E\u0433\u043E \u0434\u043D\u044F","\u0414\u0438\u043D\u0430\u043C\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0442\u0435\u043D\u0435\u0432\u043E\u0439 \u043A\u0430\u0441\u043A\u0430\u0434 \u0437\u0430 \u0444\u043E\u043A\u0443\u0441\u043E\u043C \u043A\u0430\u043C\u0435\u0440\u044B","\u041F\u043B\u0430\u0432\u043D\u043E\u0435 \u043F\u043E\u0433\u0440\u0443\u0436\u0435\u043D\u0438\u0435 \u043A\u0440\u0430\u0451\u0432 \u0440\u0435\u043B\u044C\u0435\u0444\u0430 \u0432 \u0432\u043E\u0434\u0443 \u0438 \u0442\u0443\u043C\u0430\u043D","\u0421\u043D\u0435\u0436\u043D\u0430\u044F \u043A\u0440\u043E\u043C\u043A\u0430 \u043D\u0430 \u0441\u0430\u043C\u044B\u0445 \u0432\u044B\u0441\u043E\u043A\u0438\u0445 \u043F\u0438\u043A\u0430\u0445 \u0434\u043E\u043B\u0438\u043D\u044B","\u0423\u0442\u0440\u0435\u043D\u043D\u044F\u044F \u0434\u044B\u043C\u043A\u0430 \u043D\u0430\u0434 \u0432\u043E\u0434\u043D\u043E\u0439 \u0433\u043B\u0430\u0434\u044C\u044E \u0432\u043E\u0434\u043E\u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0430"]},{group:"urban_life",groupLabel:"\u0420\u043E\u0441\u0442 8 \u0433\u043E\u0440\u043E\u0434\u043E\u0432 \u0438 32 \u0430\u0440\u0445\u0438\u0442\u0435\u043A\u0442\u0443\u0440\u043D\u044B\u0445 \u0442\u0438\u043F\u043E\u0432",items:["\u041F\u0440\u0443\u0436\u0438\u043D\u043D\u044B\u0439 \u043F\u043E\u0434\u044A\u0451\u043C \u043D\u043E\u0432\u043E\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0438\u0437 \u0444\u0443\u043D\u0434\u0430\u043C\u0435\u043D\u0442\u0430","\u041F\u043E\u044D\u0442\u0430\u043F\u043D\u043E\u0435 \u0437\u0430\u0436\u0438\u0433\u0430\u043D\u0438\u0435 \u043E\u043A\u043E\u043D \u0436\u0438\u043B\u044B\u0445 \u0431\u0430\u0448\u0435\u043D \u0432 19:00","\u041F\u043B\u0430\u0432\u043D\u043E\u0435 \u0433\u0430\u0448\u0435\u043D\u0438\u0435 \u0447\u0430\u0441\u0442\u0438 \u043E\u043A\u043E\u043D \u043F\u043E\u0441\u043B\u0435 \u043F\u043E\u043B\u0443\u043D\u043E\u0447\u0438","\u0423\u0442\u0440\u0435\u043D\u043D\u0435\u0435 \u043F\u0440\u043E\u0431\u0443\u0436\u0434\u0435\u043D\u0438\u0435 \u043A\u0432\u0430\u0440\u0442\u0430\u043B\u043E\u0432 \u043F\u0435\u0440\u0435\u0434 \u0440\u0430\u0441\u0441\u0432\u0435\u0442\u043E\u043C","\u041C\u0433\u043D\u043E\u0432\u0435\u043D\u043D\u043E\u0435 \u043F\u0440\u0438\u0442\u0443\u0445\u0430\u043D\u0438\u0435 \u043A\u0432\u0430\u0440\u0442\u0430\u043B\u0430 \u043F\u0440\u0438 \u0434\u0435\u0444\u0438\u0446\u0438\u0442\u0435 \u041C\u0412\u0442","\u042F\u0440\u043A\u0430\u044F \u0432\u0441\u043F\u044B\u0448\u043A\u0430 \u0438\u043B\u043B\u044E\u043C\u0438\u043D\u0430\u0446\u0438\u0438 \u043F\u0440\u0438 \u043F\u0443\u0441\u043A\u0435 \u043D\u043E\u0432\u043E\u0439 \u041B\u042D\u041F","\u0422\u0451\u043F\u043B\u044B\u0439 \u0441\u0432\u0435\u0442 \u043C\u0430\u043D\u0441\u0430\u0440\u0434 \u0430\u043B\u044C\u043F\u0438\u0439\u0441\u043A\u0438\u0445 \u0448\u0430\u043B\u0435","\u0425\u043E\u043B\u043E\u0434\u043D\u044B\u0439 \u043E\u0444\u0438\u0441\u043D\u044B\u0439 \u0441\u0432\u0435\u0442 \u0441\u0442\u0435\u043A\u043B\u044F\u043D\u043D\u044B\u0445 \u043D\u0435\u0431\u043E\u0441\u043A\u0440\u0451\u0431\u043E\u0432","\u0412\u0435\u0447\u0435\u0440\u043D\u044F\u044F \u043F\u043E\u0434\u0441\u0432\u0435\u0442\u043A\u0430 \u043E\u0442\u0435\u043B\u0435\u0439 \u0423\u0441\u0442\u044C-\u041F\u043E\u0440\u0442\u0430","\u041E\u0433\u043D\u0438 \u043E\u0431\u0449\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u043E\u0433\u043E \u0446\u0435\u043D\u0442\u0440\u0430 \u0421\u0432\u0435\u0442\u043B\u043E\u0433\u0440\u0430\u0434\u0430 \u0432\u0435\u0447\u0435\u0440\u043E\u043C","\u041F\u043E\u0434\u0441\u0432\u0435\u0442\u043A\u0430 \u043A\u0443\u043F\u043E\u043B\u0430 \u043E\u0431\u0441\u0435\u0440\u0432\u0430\u0442\u043E\u0440\u0438\u0438 \u0438 \u0440\u0430\u0442\u0443\u0448\u0438","\u041E\u0433\u043D\u0438 \u043F\u043E\u0440\u0442\u043E\u0432\u044B\u0445 \u0441\u043A\u043B\u0430\u0434\u043E\u0432 \u0438 \u0442\u0435\u0440\u043C\u0438\u043D\u0430\u043B\u043E\u0432 \u0433\u0430\u0432\u0430\u043D\u0438","\u0423\u043F\u043B\u043E\u0442\u043D\u0435\u043D\u0438\u0435 \u0437\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u043F\u0440\u0438 \u0440\u043E\u0441\u0442\u0435 \u044D\u043D\u0435\u0440\u0433\u043E\u0441\u043D\u0430\u0431\u0436\u0435\u043D\u0438\u044F","\u0412\u044B\u0441\u043E\u0442\u043D\u0430\u044F \u0434\u043E\u043C\u0438\u043D\u0430\u043D\u0442\u0430 \u0432 \u044F\u0434\u0440\u0435 \u043C\u0435\u0433\u0430\u043F\u043E\u043B\u0438\u0441\u0430","\u0421\u0432\u0435\u0442\u043E\u0432\u0430\u044F \u0438\u043D\u0434\u0438\u043A\u0430\u0446\u0438\u044F \u0431\u043E\u043B\u044C\u043D\u0438\u0446\u044B \u0438 \u044D\u043A\u0441\u0442\u0440\u0435\u043D\u043D\u044B\u0445 \u0441\u043B\u0443\u0436\u0431","\u041A\u043E\u043B\u044C\u0446\u0435\u0432\u0430\u044F \u043F\u043B\u0430\u043D\u0438\u0440\u043E\u0432\u043A\u0430 \u043A\u0432\u0430\u0440\u0442\u0430\u043B\u043E\u0432 \u0432\u043E\u043A\u0440\u0443\u0433 \u043F\u043B\u043E\u0449\u0430\u0434\u0438","\u041F\u0440\u0430\u0437\u0434\u043D\u0438\u0447\u043D\u0430\u044F \u0438\u043B\u043B\u044E\u043C\u0438\u043D\u0430\u0446\u0438\u044F \u043F\u0440\u0438 \u0432\u0437\u044F\u0442\u0438\u0438 \u0432\u0435\u0445\u0438 \u0440\u0430\u0437\u0432\u0438\u0442\u0438\u044F","\u041D\u043E\u0447\u043D\u043E\u0439 \u0441\u0438\u043B\u0443\u044D\u0442 \u043D\u0435\u0431\u043E\u0441\u043A\u0440\u0451\u0431\u043E\u0432 \u043D\u0430 \u0444\u043E\u043D\u0435 \u0442\u0443\u043C\u0430\u043D\u0430","\u041F\u0440\u0435\u0434\u0443\u043F\u0440\u0435\u0436\u0434\u0430\u044E\u0449\u0430\u044F \u0438\u043D\u0434\u0438\u043A\u0430\u0446\u0438\u044F \u043F\u0440\u0438 \u043F\u043E\u0434\u0442\u043E\u043F\u043B\u0435\u043D\u0438\u0438 \u043D\u0438\u0437\u0438\u043D","\u0420\u043E\u0441\u0442 \u0442\u0435\u043F\u043B\u0438\u0447\u043D\u044B\u0445 \u0440\u044F\u0434\u043E\u0432 \u043F\u0440\u0438 \u043F\u0440\u0438\u0445\u043E\u0434\u0435 \u0432\u043E\u0434\u044B \u0432 \u043A\u0430\u043D\u0430\u043B","\u0420\u0430\u0437\u0432\u0438\u0442\u0438\u0435 \u043F\u0440\u0438\u0431\u0440\u0435\u0436\u043D\u044B\u0445 \u043A\u0432\u0430\u0440\u0442\u0430\u043B\u043E\u0432 \u0423\u0441\u0442\u044C-\u041F\u043E\u0440\u0442\u0430","\u0417\u0430\u043F\u0443\u0441\u043A \u043D\u043E\u0432\u044B\u0445 \u0446\u0435\u0445\u043E\u0432 \u0410\u043B\u044E\u043C\u0433\u0440\u0430\u0434\u0430 \u043E\u0442 \u0447\u0438\u0441\u0442\u043E\u0439 \u0413\u042D\u0421","\u0420\u0430\u0441\u0448\u0438\u0440\u0435\u043D\u0438\u0435 \u043A\u0430\u043C\u043F\u0443\u0441\u0430 \u0422\u0435\u0445\u043D\u043E\u043F\u0430\u0440\u043A\u0430 \u0418\u0418 \u043D\u0430 \u043F\u043B\u0430\u0442\u043E","\u0421\u0442\u0430\u0431\u0438\u043B\u044C\u043D\u043E\u0435 \u043F\u0438\u0442\u0430\u043D\u0438\u0435 \u0433\u043E\u0440\u043E\u0434\u0441\u043A\u0438\u0445 \u0432\u043E\u0434\u043E\u043A\u0430\u043D\u0430\u043B\u043E\u0432","\u0428\u043F\u0438\u043B\u0438 \u0438 \u043A\u0443\u043F\u043E\u043B\u0430 \u043E\u0431\u0449\u0435\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0445 \u0437\u0434\u0430\u043D\u0438\u0439","\u0422\u0435\u0440\u0440\u0430\u0441\u043D\u044B\u0435 \u0444\u0430\u0441\u0430\u0434\u044B \u0441\u043E\u0432\u0440\u0435\u043C\u0435\u043D\u043D\u044B\u0445 \u0436\u0438\u043B\u044B\u0445 \u043A\u043E\u043C\u043F\u043B\u0435\u043A\u0441\u043E\u0432","\u0414\u0438\u0441\u043F\u0435\u0442\u0447\u0435\u0440\u0441\u043A\u0430\u044F \u0442\u0435\u043B\u0435\u043C\u0435\u0442\u0440\u0438\u044F \u044D\u043D\u0435\u0440\u0433\u043E\u043F\u043E\u0442\u0440\u0435\u0431\u043B\u0435\u043D\u0438\u044F \u0433\u043E\u0440\u043E\u0434\u043E\u0432","\u0421\u0431\u0430\u043B\u0430\u043D\u0441\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439 \u0440\u043E\u0441\u0442 \u0432\u0441\u0435\u0445 8 \u0446\u0435\u043D\u0442\u0440\u043E\u0432 \u0431\u0430\u0441\u0441\u0435\u0439\u043D\u0430"]}],t=[],e=1;for(let i=0;i<r.length;i++){let n=r[i];for(let s=0;s<n.items.length;s++)t.push({id:e,code:`${n.group}_${String(s+1).padStart(2,"0")}`,group:n.group,groupLabel:n.groupLabel,title:n.items[s],freqHz:+(.08+e*17%45*.055).toFixed(3),phaseOffset:+(e*1.6180339%1*Math.PI*2).toFixed(3)}),e++}return t}var Va=Wg(),Ga=class{constructor(t,e,i,n){this.scene=t,this.hydro=e,this.economy=i,this.textures=n,this.group=new we,this.scene.add(this.group),this._dummy=new Be,this._time=0,this.cityCars=[],this.highwayCars=[],this.windTurbines=[],this.solarTrackers=[],this.steamPuffs=[],this.birds=[],this.clouds=[],this._buildInstancedBatches(),this.rebuildWorldActors()}_buildInstancedBatches(){this.maxVehicles=96;let t=new kt(1,1,1),e=new Yi({roughness:.45,metalness:.3});this.vehicleIM=new oe(t,e,this.maxVehicles),this.vehicleIM.castShadow=!1,this.vehicleIM.frustumCulled=!1;let i=new kt(.85,.3,.16);this.headlightMat=new Se({color:16774084}),this.headlightIM=new oe(i,this.headlightMat,this.maxVehicles),this.headlightIM.frustumCulled=!1,this.maxWind=24;let n=new Ce(.32,.68,1,8);n.translate(0,.5,0);let s=new Yi({color:15857145,roughness:.38,metalness:.28});this.windTowerIM=new oe(n,s,this.maxWind),this.windTowerIM.castShadow=!0,this.windTowerIM.frustumCulled=!1;let o=new kt(.14,1,.04);o.translate(0,.5,0);let a=new me,l=[],c=[],h=o.attributes.position,u=o.attributes.normal,d=o.index,f=new O,g=new O;for(let b=0;b<3;b++){let _=b*Math.PI*2/3,w=Math.cos(_),v=Math.sin(_);for(let T=0;T<d.count;T++){let C=d.getX(T);f.fromBufferAttribute(h,C),g.fromBufferAttribute(u,C),l.push(f.x*w-f.y*v,f.x*v+f.y*w,f.z),c.push(g.x*w-g.y*v,g.x*v+g.y*w,g.z)}}a.setAttribute("position",new re(l,3)),a.setAttribute("normal",new re(c,3)),o.dispose(),this.windRotorIM=new oe(a,s,this.maxWind),this.windRotorIM.castShadow=!0,this.windRotorIM.frustumCulled=!1,this.maxSolar=36;let y=new kt(1,.08,.68),p=new Yi({color:1920728,roughness:.22,metalness:.72,emissive:728909,emissiveIntensity:.25});this.solarIM=new oe(y,p,this.maxSolar),this.solarIM.frustumCulled=!1,this.maxPuffs=64;let m=new Ks(.65,1);this.puffMat=new ne({color:15857145,transparent:!0,opacity:.42,depthWrite:!1}),this.puffIM=new oe(m,this.puffMat,this.maxPuffs),this.puffIM.frustumCulled=!1,this.maxBirds=48;let x=new _i(.55,.22,3);x.scale(2.4,.25,.85);let S=new ne({color:16317180});this.birdIM=new oe(x,S,this.maxBirds),this.birdIM.frustumCulled=!1,this.maxClouds=34;let M=new Gn(1,1);M.scale(1.9,.48,1.25),this.cloudMat=new ne({color:16777215,transparent:!0,opacity:.66,depthWrite:!1}),this.cloudIM=new oe(M,this.cloudMat,this.maxClouds),this.cloudIM.frustumCulled=!1,this.group.add(this.vehicleIM,this.headlightIM,this.windTowerIM,this.windRotorIM,this.solarIM,this.puffIM,this.birdIM,this.cloudIM)}rebuildWorldActors(){let t=Zn(202603),e=L.horizScale,i=L.elevScale,n=Math.pow(e,.58),o=In(this.hydro.presetId).main;this.cityCars=[];for(let h=0;h<28;h++){let u=oi[h%oi.length];if(!u)continue;let d=u.plateauRadius*(.34+h%2*.2),f=Ki("fleet_machinery",h*3+7);this.cityCars.push({cx:u.x,cz:u.z,ringR:d,angle:t()*Math.PI*2,omega:(.22+t()*.14)*(h%2===0?1:-1),sx:1.55*n,sy:1.1*n,sz:3.1*n,color:new dt(f.r,f.g,f.b)})}this.highwayCars=[];let a=this.economy.roadNetwork&&this.economy.roadNetwork.routes||[];for(let h=0;h<a.length;h++)for(let u=0;u<5;u++){let d=u===0||u===3,f=Ki("fleet_machinery",h*11+u*5+3);this.highwayCars.push({routeIdx:h,segPos:u*.2,dir:u%2===0?1:-1,speedSegPerSec:(.85+t()*.45)*(d?.82:1.08),isTruck:d,sx:(d?1.95:1.55)*n,sy:(d?1.65:1.12)*n,sz:(d?4.3:3.2)*n,color:d&&u===0?new dt(16096779):new dt(f.r,f.g,f.b)})}this.windTurbines=[];for(let h=0;h<this.maxWind;h++){let d=(h%2===0?-1:1)*(225+h%6*22+t()*12)*e,f=(-285+Math.floor(h/2)*46+t()*14)*e;if(Math.abs(d)>L.half*.92||Math.abs(f)>L.half*.92)continue;let g=this.hydro.sampleAtWorld(d,f);if(g.depth>.2)continue;let y=(22+h%3*4)*n;this.windTurbines.push({wx:d,wy:g.bed,wz:f,towerH:y,bladeLen:y*.46,yaw:.35+Math.sin(h)*.22,phase:t()*Math.PI*2,speedMult:.85+t()*.35})}this.windTowerIM.count=this.windTurbines.length,this.windRotorIM.count=this.windTurbines.length;for(let h=0;h<this.windTurbines.length;h++){let u=this.windTurbines[h];this._dummy.position.set(u.wx,u.wy,u.wz),this._dummy.rotation.set(0,u.yaw,0),this._dummy.scale.set(n*1.1,u.towerH,n*1.1),this._dummy.updateMatrix(),this.windTowerIM.setMatrixAt(h,this._dummy.matrix)}this.windTowerIM.instanceMatrix.needsUpdate=!0,this.solarTrackers=[];let l=oi.find(h=>h.archetype==="tech")||oi[0];for(let h=0;h<this.maxSolar;h++){let u=Math.floor(h/6),d=h%6,f=l.x+(d-2.5)*9.5*n+42*e,g=l.z+(u-2.5)*8.5*n+36*e;if(Math.abs(f)>L.half*.91||Math.abs(g)>L.half*.91)continue;let y=this.hydro.sampleAtWorld(f,g);y.depth>.2||this.solarTrackers.push({wx:f,wy:y.bed+1.4*n,wz:g,scale:5.2*n})}this.solarIM.count=this.solarTrackers.length,this.steamPuffs=[];let c=oi.filter(h=>h.archetype==="industrial"||h.archetype==="smelter");for(let h=0;h<this.maxPuffs;h++){let u=c[h%Math.max(1,c.length)]||oi[0],d=h*2.39996%(Math.PI*2),f=(8+h%5*7)*e,g=u.x+Math.cos(d)*f,y=u.z+Math.sin(d)*f,p=this.hydro.sampleAtWorld(g,y);this.steamPuffs.push({baseX:g,baseY:p.bed+10*Math.pow(i,.78),baseZ:y,phase:(h/this.maxPuffs+t()*.2)%1,speed:.14+t()*.1,size:(3+t()*2.2)*n})}this.puffIM.count=this.steamPuffs.length,this.birds=[];for(let h=0;h<this.maxBirds;h++){let u=h<18,d=o[h%o.length];this.birds.push({cx:d.x+(t()-.5)*180*e,cz:d.z+(t()-.5)*180*e,alt:(u?105:48)*i+t()*26*i,orbitR:(u?62:32)*e*(.65+t()*.7),omega:(u?.2:.4)*(h%2===0?1:-1),phase:t()*Math.PI*2,flapFreq:u?3:7.2,scale:(u?2.2:1.25)*n,color:u?new dt(6045747):new dt(16317180)}),this.birdIM.setColorAt(h,this.birds[h].color)}this.birdIM.count=this.birds.length,this.birdIM.instanceColor&&(this.birdIM.instanceColor.needsUpdate=!0),this.clouds=[];for(let h=0;h<this.maxClouds;h++)this.clouds.push({wx:(t()-.5)*L.size*1.2,wy:(168+t()*55)*i,wz:(t()-.5)*L.size*1.2,sx:(38+t()*34)*e,sy:(11+t()*8)*i,sz:(28+t()*26)*e,drift:.75+t()*.55});this.cloudIM.count=this.clouds.length}update(t,e,i){this._time+=t;let n=this._time,s=L.horizScale,o=Math.pow(s,.58),a=this.economy.weatherId==="flood"?2.1:this.economy.weatherId==="rain"?1.5:1,l=i<.26,c=0,h=0;for(let m=0;m<this.cityCars.length;m++){let x=this.cityCars[m];x.angle=(x.angle+x.omega*t)%(Math.PI*2);let S=x.cx+Math.cos(x.angle)*x.ringR,M=x.cz+Math.sin(x.angle)*x.ringR;if(Math.abs(S)>L.half*.94||Math.abs(M)>L.half*.94)continue;let b=this.hydro.sampleAtWorld(S,M);if(b.depth>.08)continue;let _=Math.atan2(-Math.sin(x.angle)*Math.sign(x.omega),Math.cos(x.angle)*Math.sign(x.omega)),w=b.bed+x.sy*.52;this._dummy.position.set(S,w,M),this._dummy.rotation.set(0,_,0),this._dummy.scale.set(x.sx,x.sy,x.sz),this._dummy.updateMatrix(),this.vehicleIM.setMatrixAt(c,this._dummy.matrix),this.vehicleIM.setColorAt(c,x.color),c++,l&&(this._dummy.position.set(S+Math.sin(_)*x.sz*.54,w,M+Math.cos(_)*x.sz*.54),this._dummy.rotation.set(0,_,0),this._dummy.scale.set(x.sx*.8,x.sy*.35,.35*o),this._dummy.updateMatrix(),this.headlightIM.setMatrixAt(h++,this._dummy.matrix))}let u=this.economy.roadNetwork&&this.economy.roadNetwork.routes||[],d=1.45*Math.pow(s,.56);for(let m=0;m<this.highwayCars.length&&c<this.maxVehicles;m++){let x=this.highwayCars[m],S=u[x.routeIdx];if(!S||!S.points||S.points.length<4)continue;let M=S.completed?S.points.length-1.001:S.builtSeg-.5;if(M<2.5||!S.completed&&!x.isTruck)continue;x.segPos+=x.dir*x.speedSegPerSec*t,x.segPos>=M?(x.segPos=M,x.dir=-1):x.segPos<=.2&&(x.segPos=.2,x.dir=1);let b=W(Math.floor(x.segPos),0,S.points.length-2),_=x.segPos-b,w=S.points[b],v=S.points[b+1],T=x.dir>0?1:-1,C=w.wx+(v.wx-w.wx)*_+w.nx*d*T,R=w.wz+(v.wz-w.wz)*_+w.nz*d*T,P=w.deckY+(v.deckY-w.deckY)*_+(w.isBridge||v.isBridge?.22*L.elevScale:0),N=this.hydro.sampleAtWorld(C,R);if(!w.isBridge&&!v.isBridge&&N.depth>.12&&N.surface>P+.25){x.dir=-x.dir;continue}let I=x.dir>0?w.yaw:w.yaw+Math.PI,U=x.dir>0?-w.pitch:w.pitch,B=P+x.sy*.52;this._dummy.position.set(C,B,R),this._dummy.rotation.set(U,I,0),this._dummy.scale.set(x.sx,x.sy,x.sz),this._dummy.updateMatrix(),this.vehicleIM.setMatrixAt(c,this._dummy.matrix),this.vehicleIM.setColorAt(c,x.color),c++,l&&h<this.maxVehicles&&(this._dummy.position.set(C+Math.sin(I)*x.sz*.54,B,R+Math.cos(I)*x.sz*.54),this._dummy.rotation.set(U,I,0),this._dummy.scale.set(x.sx*.8,x.sy*.35,.35*o),this._dummy.updateMatrix(),this.headlightIM.setMatrixAt(h++,this._dummy.matrix))}this.vehicleIM.count=c,this.headlightIM.count=h,this.vehicleIM.instanceMatrix.needsUpdate=!0,this.vehicleIM.instanceColor&&(this.vehicleIM.instanceColor.needsUpdate=!0),h>0&&(this.headlightIM.instanceMatrix.needsUpdate=!0);for(let m=0;m<this.windTurbines.length;m++){let x=this.windTurbines[m];x.phase=(x.phase+t*1.9*x.speedMult*a)%(Math.PI*2),this._dummy.position.set(x.wx+Math.sin(x.yaw)*.5*o,x.wy+x.towerH,x.wz+Math.cos(x.yaw)*.5*o),this._dummy.rotation.set(0,x.yaw,x.phase),this._dummy.scale.set(x.bladeLen,x.bladeLen,x.bladeLen),this._dummy.updateMatrix(),this.windRotorIM.setMatrixAt(m,this._dummy.matrix)}this.windTurbines.length>0&&(this.windRotorIM.instanceMatrix.needsUpdate=!0);let f=i>.05?W((e-12.5)*.11,-.75,.75):0,g=i>.05?.42:.05;for(let m=0;m<this.solarTrackers.length;m++){let x=this.solarTrackers[m];this._dummy.position.set(x.wx,x.wy,x.wz),this._dummy.rotation.set(g,.15,f),this._dummy.scale.set(x.scale,x.scale,x.scale),this._dummy.updateMatrix(),this.solarIM.setMatrixAt(m,this._dummy.matrix)}this.solarTrackers.length>0&&(this.solarIM.instanceMatrix.needsUpdate=!0);for(let m=0;m<this.steamPuffs.length;m++){let x=this.steamPuffs[m];x.phase=(x.phase+t*x.speed)%1;let S=x.phase,M=S*26*o,b=S*14*o*a,_=x.size*(.55+S*1.65)*(1-S*.35);this._dummy.position.set(x.baseX+b,x.baseY+M,x.baseZ+S*5*o),this._dummy.rotation.set(S*2,S*1.5,0),this._dummy.scale.set(_,_*.82,_),this._dummy.updateMatrix(),this.puffIM.setMatrixAt(m,this._dummy.matrix)}this.puffIM.instanceMatrix.needsUpdate=!0;for(let m=0;m<this.birds.length;m++){let x=this.birds[m],S=n*x.omega+x.phase,M=x.cx+Math.cos(S)*x.orbitR,b=x.cz+Math.sin(S)*x.orbitR*.78,_=Math.sin(n*x.flapFreq+x.phase),w=x.alt+Math.sin(S*2)*3.5*L.elevScale+_*.25,v=S+(x.omega>0?Math.PI*.5:-Math.PI*.5);this._dummy.position.set(M,w,b),this._dummy.rotation.set(.08*_,-v,.28*Math.sign(x.omega)),this._dummy.scale.set(x.scale,x.scale*(.65+.55*Math.abs(_)),x.scale),this._dummy.updateMatrix(),this.birdIM.setMatrixAt(m,this._dummy.matrix)}this.birdIM.instanceMatrix.needsUpdate=!0;let y=L.size*1.25;this.cloudMat.opacity=this.economy.weatherId==="flood"?.85:l?.34:.66;let p=l?.28:this.economy.weatherId==="flood"?.58:.98;this.cloudMat.color.setRGB(p,p*1.01,p*1.05);for(let m=0;m<this.clouds.length;m++){let x=this.clouds[m];x.wx+=t*4.2*s*x.drift*a*.32,x.wx>y*.5&&(x.wx-=y),this._dummy.position.set(x.wx,x.wy,x.wz),this._dummy.rotation.set(0,m*.7,0),this._dummy.scale.set(x.sx,x.sy,x.sz),this._dummy.updateMatrix(),this.cloudIM.setMatrixAt(m,this._dummy.matrix)}this.cloudIM.instanceMatrix.needsUpdate=!0}getActiveStats(){return{totalRegisteredAnimations:Va.length,vehiclesActive:this.vehicleIM.count,windTurbines:this.windTurbines.length,solarTrackers:this.solarTrackers.length,birdsActive:this.birdIM.count}}};var ee=new ge,ue=new O,Me=new fi,he=new O,He=new pi,Fi=new dt;function Xg(){let r=new _i(1.95,3.8,7);r.translate(0,3.5,0);let t=new _i(1.42,3.3,7);t.translate(0,5.5,0);let e=r.attributes.position.array,i=r.attributes.normal.array,n=r.attributes.uv.array,s=r.index.array,o=t.attributes.position.array,a=t.attributes.normal.array,l=t.attributes.uv.array,c=t.index.array,h=e.length/3,u=new Float32Array(e.length+o.length);u.set(e,0),u.set(o,e.length);let d=new Float32Array(i.length+a.length);d.set(i,0),d.set(a,i.length);let f=new Float32Array(n.length+l.length);f.set(n,0),f.set(l,n.length);let g=new Uint16Array(s.length+c.length);g.set(s,0);for(let p=0;p<c.length;p++)g[s.length+p]=c[p]+h;let y=new me;return y.setAttribute("position",new te(u,3)),y.setAttribute("normal",new te(d,3)),y.setAttribute("uv",new te(f,2)),y.setIndex(new te(g,1)),r.dispose(),t.dispose(),y}function Kd(){let e=[],i=[],n=[],s=[];for(let a=0;a<2;a++){let l=a===0?1:-1,c=e.length/3;for(let h=0;h<=8;h++){let u=h/8,d=-.12+.38*u+.56*u*u,f=.04*Math.sin(u*Math.PI*.5)-u*u,g=.16*(1-.35*u)*l,y=.38+1.12*u,p=-2*u,m=Math.hypot(y,p)||1,x=-p/m*l,S=y/m*l;for(let M=0;M<=2;M++){let b=M/2-.5;e.push(d+x*Math.abs(g),f+S*Math.abs(g),b),i.push(x,S,0),n.push(M/2,u*1.35)}}for(let h=0;h<8;h++)for(let u=0;u<2;u++){let d=c+h*3+u,f=d+1,g=d+3,y=g+1;a===0?s.push(d,g,f,f,g,y):s.push(d,f,g,f,y,g)}}let o=new me;return o.setAttribute("position",new re(e,3)),o.setAttribute("normal",new re(i,3)),o.setAttribute("uv",new re(n,2)),o.setIndex(s),o}var Wa=class{constructor(t,e,i,n,s=null,o=null){this.scene=t,this.hydro=e,this.economy=i,this.profile=n,this.textures=o||Ba(s),this.detailTex=this.textures.waterDetail,this.hemiLight=new ir(9356799,4017973,.74),this.scene.add(this.hemiLight),this.sunLight=new sr(16774107,1.48),this.sunLight.position.set(220,310,170),this.scene.add(this.sunLight.target),n.shadows&&(this.sunLight.castShadow=!0,this.sunLight.shadow.mapSize.set(2048,2048),this.sunLight.shadow.bias=-6e-4),this.scene.add(this.sunLight),this._syncShadowFrustum(),this.skyColorZenith=new dt(2647213),this.skyColorHorizon=new dt(10931688),this.fogColor=new dt(10931688),this.scene.background=this.fogColor.clone(),this._buildTerrainMesh(),this._buildWaterMesh(),this._buildOuterWorldSeaAndFog(),this._buildOverflow3DPools(),this._buildNatureInstances(),this.cityDisksGroup=new we,this.scene.add(this.cityDisksGroup),this._buildCityInstancedPools(),this._rebuildCityDisks(),this.roadRenderer=new ka(this.scene,this.hydro,this.economy,this.textures,!!this.profile.shadows),this.roadRenderer.syncGeometry(),this._buildVolumetricConstructionPools(),this.structuresGroup=new we,this.scene.add(this.structuresGroup),this.structMeshes=new Map,this._buildPowerLinePools(),this.livingWorld=new Ga(this.scene,this.hydro,this.economy,this.textures),this._buildCursorPreview(),this._buildIrrigationBeacon(),this._buildTutorialBeacon()}_syncShadowFrustum(){if(!this.profile.shadows)return;let t=W(420*Math.pow(L.horizScale,.55),395,1650);this.sunLight.shadow.camera.near=40,this.sunLight.shadow.camera.far=t*3.8,this.sunLight.shadow.camera.left=-t,this.sunLight.shadow.camera.right=t,this.sunLight.shadow.camera.top=t,this.sunLight.shadow.camera.bottom=-t,this.sunLight.shadow.camera.updateProjectionMatrix()}rebuildForNewValley(){let t=this.hydro.grid,e=this.hydro.dx,i=L.size*.5,n=this.terrainPosAttr.array,s=this.waterPosAttr.array;for(let a=0;a<t;a++){let l=-i+(a+.5)*e;for(let c=0;c<t;c++){let h=-i+(c+.5)*e,u=(a*t+c)*3;n[u]=h,n[u+2]=l,s[u]=h,s[u+2]=l}}this.terrainMesh.geometry.boundingSphere=null,this.waterMesh.geometry.boundingSphere=null,this.skirtMesh&&(this.skirtMesh.scale.set(L.size,32*L.elevScale,L.size),this.skirtMesh.position.set(0,-15.6*L.elevScale,0),this.skirtMesh.updateMatrix()),this.terrainMat.uniforms.uHorizScale.value=L.horizScale,this.terrainMat.uniforms.uElevScale.value=L.elevScale,this.terrainMat.uniforms.uSnowLine.value=L.snowLineY,this.terrainMat.uniforms.uMapHalf.value=i,this.waterMat.uniforms.uHorizScale.value=L.horizScale,this.waterMat.uniforms.uElevScale.value=L.elevScale,this.waterMat.uniforms.uMapHalf.value=i,this._syncOuterSeaScale(),this._syncShadowFrustum(),this.updateTerrainGeometryRect(0,0,t-1,t-1),this._populateNatureInstances(),this._rebuildCityDisks();for(let[,a]of this.structMeshes.entries())this.structuresGroup.remove(a);this.structMeshes.clear();let o=this.economy.cities.find(a=>a.archetype==="agro");if(this.irrBeacon&&o&&o.irrigationTarget){let a=o.irrigationTarget.x,l=o.irrigationTarget.z,c=this.hydro.sampleAtWorld(a,l).bed,h=Math.pow(L.horizScale,.65);this.irrBeacon.position.set(a,c+.45*L.elevScale,l),this.irrBeacon.userData.baseScale=h}this.roadRenderer&&this.roadRenderer.syncGeometry(),this.livingWorld&&this.livingWorld.rebuildWorldActors(),this.hydro.engineeredDirty=!0,this.economy.buildingsDirty=!0,this.economy.powerLinesDirty=!0,this.syncEngineeredVolumes(),this.syncCityInstances(),this.syncHydroStructures(),this.updateOverflowWater3D(0)}_buildTerrainMesh(){let t=this.hydro.grid,e=t*t,i=this.hydro.dx,n=L.size*.5,s=new me,o=new Float32Array(e*3),a=new Float32Array(e*3),l=new Float32Array(e*4);for(let f=0;f<t;f++){let g=-n+(f+.5)*i;for(let y=0;y<t;y++){let p=-n+(y+.5)*i,m=f*t+y,x=m*3;o[x]=p,o[x+1]=this.hydro.zb[m],o[x+2]=g,a[x+1]=1}}let c=new Uint32Array((t-1)*(t-1)*6),h=0;for(let f=0;f<t-1;f++)for(let g=0;g<t-1;g++){let y=f*t+g,p=y+1,m=y+t,x=m+1;c[h++]=y,c[h++]=m,c[h++]=p,c[h++]=p,c[h++]=m,c[h++]=x}s.setIndex(new te(c,1)),this.terrainPosAttr=new te(o,3),this.terrainPosAttr.setUsage(Fe),this.terrainNormAttr=new te(a,3),this.terrainNormAttr.setUsage(Fe),this.terrainMetaAttr=new te(l,4),this.terrainMetaAttr.setUsage(Fe),s.setAttribute("position",this.terrainPosAttr),s.setAttribute("normal",this.terrainNormAttr),s.setAttribute("aTerrainMeta",this.terrainMetaAttr),this.terrainMat=Gd(this.detailTex,this.textures.concreteMap),this.terrainMat.uniforms.uHorizScale.value=L.horizScale,this.terrainMat.uniforms.uElevScale.value=L.elevScale,this.terrainMat.uniforms.uSnowLine.value=L.snowLineY,this.terrainMat.uniforms.uMapHalf.value=n,this.terrainMesh=new Mt(s,this.terrainMat),this.terrainMesh.receiveShadow=!!this.profile.shadows,this.terrainMesh.castShadow=!!this.profile.shadows,this.terrainMesh.frustumCulled=!1,this.terrainMesh.matrixAutoUpdate=!1,this.terrainMesh.updateMatrix(),this.scene.add(this.terrainMesh);let u=new ne({color:2501684,map:this.textures.rock}),d=new kt(1,1,1);this.skirtMesh=new Mt(d,u),this.skirtMesh.scale.set(L.size,32*L.elevScale,L.size),this.skirtMesh.position.set(0,-15.6*L.elevScale,0),this.skirtMesh.frustumCulled=!1,this.skirtMesh.matrixAutoUpdate=!1,this.skirtMesh.updateMatrix(),this.scene.add(this.skirtMesh),this.updateTerrainGeometryRect(0,0,t-1,t-1)}_buildWaterMesh(){let t=this.hydro.grid,e=t*t,i=this.hydro.dx,n=L.size*.5,s=new me,o=new Float32Array(e*3),a=new Float32Array(e*3),l=new Float32Array(e*4),c=new Float32Array(e*4);for(let h=0;h<t;h++){let u=-n+(h+.5)*i;for(let d=0;d<t;d++){let f=-n+(d+.5)*i,g=h*t+d,y=g*3;o[y]=f,o[y+1]=this.hydro.zb[g]+this.hydro.h[g],o[y+2]=u,a[y+1]=1}}s.setIndex(this.terrainMesh.geometry.getIndex()),this.waterPosAttr=new te(o,3),this.waterPosAttr.setUsage(Fe),this.waterNormAttr=new te(a,3),this.waterNormAttr.setUsage(Fe),this.waterH1Attr=new te(l,4),this.waterH1Attr.setUsage(Fe),this.waterH2Attr=new te(c,4),this.waterH2Attr.setUsage(Fe),s.setAttribute("position",this.waterPosAttr),s.setAttribute("normal",this.waterNormAttr),s.setAttribute("aHydro1",this.waterH1Attr),s.setAttribute("aHydro2",this.waterH2Attr),this.waterMat=Vd(this.detailTex),this.waterMat.uniforms.uHorizScale.value=L.horizScale,this.waterMat.uniforms.uElevScale.value=L.elevScale,this.waterMat.uniforms.uMapHalf.value=n,this.waterMesh=new Mt(s,this.waterMat),this.waterMesh.renderOrder=2,this.waterMesh.frustumCulled=!1,this.waterMesh.matrixAutoUpdate=!1,this.waterMesh.updateMatrix(),this.scene.add(this.waterMesh)}_buildOuterWorldSeaAndFog(){let t=new Vn(1,1,1,1);t.rotateX(-Math.PI*.5),this.outerSeaMat=Yd(this.detailTex),this.outerSeaMesh=new Mt(t,this.outerSeaMat),this.outerSeaMesh.renderOrder=1,this.outerSeaMesh.frustumCulled=!1,this.outerSeaMesh.matrixAutoUpdate=!1,this.scene.add(this.outerSeaMesh);let e=new Ce(1,1,1,48,1,!0);e.translate(0,.5,0),this.horizonMistMat=qd(),this.horizonMistMesh=new Mt(e,this.horizonMistMat),this.horizonMistMesh.renderOrder=4,this.horizonMistMesh.frustumCulled=!1,this.horizonMistMesh.matrixAutoUpdate=!1,this.scene.add(this.horizonMistMesh),this._syncOuterSeaScale()}_syncOuterSeaScale(){if(!this.outerSeaMesh)return;let t=L.size*.5,e=3.2*L.elevScale,i=L.size*14;if(this.outerSeaMesh.position.set(0,e,0),this.outerSeaMesh.scale.set(i,1,i),this.outerSeaMesh.updateMatrix(),this.outerSeaMat.uniforms.uMapHalf.value=t,this.outerSeaMat.uniforms.uHorizScale.value=L.horizScale,this.horizonMistMesh){let n=L.size*2.25,s=Math.max(240,340*L.elevScale);this.horizonMistMesh.position.set(0,e-4*L.elevScale,0),this.horizonMistMesh.scale.set(n,s,n),this.horizonMistMesh.updateMatrix()}}_buildOverflow3DPools(){this.overflowWaterMat=Wd(this.textures.overflowCascade);let t=Kd();this.maxOverflows=300,this.overflowNappeIM=new oe(t,this.overflowWaterMat,this.maxOverflows),this.overflowNappeIM.count=0,this.overflowNappeIM.renderOrder=3,this.overflowNappeIM.frustumCulled=!1,this.scene.add(this.overflowNappeIM);let e=new Ce(.65,.85,1,10);e.rotateX(Math.PI*.5),this.plungeRollerMat=new Se({color:16055295,map:this.textures.overflowCascade,transparent:!0,opacity:.82,depthWrite:!1}),this.plungeRollerIM=new oe(e,this.plungeRollerMat,this.maxOverflows),this.plungeRollerIM.count=0,this.plungeRollerIM.renderOrder=4,this.plungeRollerIM.frustumCulled=!1,this.scene.add(this.plungeRollerIM)}updateOverflowWater3D(t){this.overflowWaterMat.uniforms.uTime.value=t;let e=this.hydro.overflowEdges||[],i=Math.min(e.length,this.maxOverflows);for(let n=0;n<i;n++){let s=e[n],o=1+Math.sin(t*9.5+n*1.3)*.06,a=Math.max(this.hydro.dx*.65,s.dropH*.42);ue.set(s.wx,s.crestY,s.wz),He.set(0,-s.yaw,0),Me.setFromEuler(He),he.set(a*o,s.dropH,s.width*1.08),ee.compose(ue,Me,he),this.overflowNappeIM.setMatrixAt(n,ee);let l=s.wx+s.dirX*a*.82,c=s.wz+s.dirZ*a*.82,h=W(.8+s.headH*.9,.8,4.5)*Math.pow(L.horizScale,.45)*o;ue.set(l,s.toeY+h*.25,c),He.set(0,-s.yaw,t*4.5+n),Me.setFromEuler(He),he.set(h,s.width*1.12,h),ee.compose(ue,Me,he),this.plungeRollerIM.setMatrixAt(n,ee)}this.overflowNappeIM.count=i,this.plungeRollerIM.count=i,i>0&&(this.overflowNappeIM.instanceMatrix.needsUpdate=!0,this.plungeRollerIM.instanceMatrix.needsUpdate=!0)}_buildNatureInstances(){let t=this.profile.treeCount,e=this.profile.rockCount,i=new Ce(.2,.38,2.3,6);i.translate(0,1.15,0);let n=Xg(),s=new ne({map:this.textures.bark}),o=new ne({color:16777215,map:this.textures.foliage});this.treeTrunks=new oe(i,s,t),this.treeCrowns=new oe(n,o,t),this.treeCrowns.castShadow=!!this.profile.shadows,this.treeTrunks.frustumCulled=!1,this.treeCrowns.frustumCulled=!1,this.treeTrunks.matrixAutoUpdate=!1,this.treeCrowns.matrixAutoUpdate=!1,this.scene.add(this.treeTrunks),this.scene.add(this.treeCrowns);let a=new Gn(1.35,1),l=new ne({color:16777215,map:this.textures.rock});this.rockInstances=new oe(a,l,e),this.rockInstances.castShadow=!!this.profile.shadows,this.rockInstances.frustumCulled=!1,this.rockInstances.matrixAutoUpdate=!1,this.scene.add(this.rockInstances),this._populateNatureInstances()}_populateNatureInstances(){let t=Zn(424242),e=this.profile.treeCount,i=this.profile.rockCount,n=Math.pow(L.horizScale,.56),s=L.snowLineY*.78,o=6.8*L.elevScale;this.treeSlots=[];let a=0,l=0;for(;a<e&&l<e*9;){l++;let h=(t()-.5)*(L.size*.96),u=(t()-.5)*(L.size*.96),d=this.hydro.sampleAtWorld(h,u);if(d.depth>.03||d.bed>s||d.bed<o||d.soil<.65*L.elevScale)continue;let f=!1;for(let p of this.economy.cities)if(Math.hypot(h-p.x,u-p.z)<p.plateauRadius*1.05){f=!0;break}if(f)continue;let g=(.74+t()*.82)*n;ue.set(h,d.bed-.15,u),He.set(0,t()*Math.PI*2,0),Me.setFromEuler(He),he.set(g,g*(.92+t()*.38),g),ee.compose(ue,Me,he),this.treeTrunks.setMatrixAt(a,ee),this.treeCrowns.setMatrixAt(a,ee);let y=Ki("flora_agro",a+Math.floor(t()*50));Fi.setRGB(y.r*1.25,y.g*1.25,y.b*1.25),this.treeCrowns.setColorAt(a,Fi),this.treeSlots.push({index:a,wx:h,wz:u,baseBed:d.bed,alive:!0}),a++}this.treeTrunks.count=a,this.treeCrowns.count=a,this.treeTrunks.instanceMatrix.needsUpdate=!0,this.treeCrowns.instanceMatrix.needsUpdate=!0,this.treeCrowns.instanceColor&&(this.treeCrowns.instanceColor.needsUpdate=!0),this.rockSlots=[];let c=0;for(let h=0;h<i*6&&c<i;h++){let u=(t()-.5)*(L.size*.96),d=(t()-.5)*(L.size*.96),f=this.hydro.sampleAtWorld(u,d);if(f.depth>.5)continue;let g=!1;for(let p of this.economy.cities)if(Math.hypot(u-p.x,d-p.z)<p.plateauRadius){g=!0;break}if(g)continue;ue.set(u,f.bed+.18,d),He.set(t()*3,t()*3,t()*3),Me.setFromEuler(He),he.set((.65+t()*1.5)*n,(.45+t()*.95)*n,(.65+t()*1.5)*n),ee.compose(ue,Me,he);let y=Ki("rock_strata",c*3);Fi.setRGB(y.r*1.35,y.g*1.35,y.b*1.35),this.rockInstances.setColorAt(c,Fi),this.rockSlots.push({index:c,wx:u,wz:d,baseBed:f.bed,alive:!0}),this.rockInstances.setMatrixAt(c++,ee)}this.rockInstances.count=c,this.rockInstances.instanceMatrix.needsUpdate=!0,this.rockInstances.instanceColor&&(this.rockInstances.instanceColor.needsUpdate=!0)}_buildCityInstancedPools(){let e=new kt(1,1,1);e.translate(0,.5,0),this.cityPoweredArr=new Float32Array(720),this.cityStyleArr=new Float32Array(720),this.cityBuildProgArr=new Float32Array(720).fill(1),this.cityPoweredAttr=new Mi(this.cityPoweredArr,1),this.cityPoweredAttr.setUsage(Fe),this.cityStyleAttr=new Mi(this.cityStyleArr,1),this.cityStyleAttr.setUsage(Fe),this.cityBuildProgAttr=new Mi(this.cityBuildProgArr,1),this.cityBuildProgAttr.setUsage(Fe),e.setAttribute("aPowered",this.cityPoweredAttr),e.setAttribute("aStyleId",this.cityStyleAttr),e.setAttribute("aBuildProg",this.cityBuildProgAttr);let i=new Ce(.42,.52,1,12);i.translate(0,.5,0),this.siloPoweredArr=new Float32Array(720),this.siloStyleArr=new Float32Array(720),this.siloBuildProgArr=new Float32Array(720).fill(1),this.siloPoweredAttr=new Mi(this.siloPoweredArr,1),this.siloStyleAttr=new Mi(this.siloStyleArr,1),this.siloBuildProgAttr=new Mi(this.siloBuildProgArr,1),this.siloBuildProgAttr.setUsage(Fe),i.setAttribute("aPowered",this.siloPoweredAttr),i.setAttribute("aStyleId",this.siloStyleAttr),i.setAttribute("aBuildProg",this.siloBuildProgAttr);let n=new _i(.76,.44,4);n.rotateY(Math.PI*.25),n.translate(0,.22,0);let s=new Xi(.52,12,8,0,Math.PI*2,0,Math.PI*.5);this.cityBodyMat=Xd(this.textures.roof,this.textures.facadeAtlas);let o=new ne({color:16777215,map:this.textures.roof}),a=new Yi({color:14870768,roughness:.28,metalness:.48});this.cityBodies=new oe(e,this.cityBodyMat,720),this.citySilos=new oe(i,this.cityBodyMat,720),this.cityRoofs=new oe(n,o,720),this.cityDomes=new oe(s,a,720),this.cityBodies.castShadow=!!this.profile.shadows,this.cityBodies.receiveShadow=!!this.profile.shadows,this.citySilos.castShadow=!!this.profile.shadows,this.cityBodies.frustumCulled=!1,this.citySilos.frustumCulled=!1,this.cityRoofs.frustumCulled=!1,this.cityDomes.frustumCulled=!1;let l=new kt(1.16,1,1.16);l.translate(0,.5,0);let c=new ne({color:9741240,map:this.textures.concreteMap});this.cityFoundations=new oe(l,c,720),this.cityFoundations.count=0,this.cityFoundations.frustumCulled=!1;let h=Qd(),u=new ne({color:14251782});this.cityScaffolds=new oe(h,u,120),this.cityScaffolds.count=0,this.cityScaffolds.frustumCulled=!1;let d=40,f=new kt(.85,1,.85);f.translate(0,.5,0);let g=new ne({color:16096779,map:this.textures.steel});this.cityCraneMasts=new oe(f,g,d),this.cityCraneMasts.count=0,this.cityCraneMasts.frustumCulled=!1;let y=new kt(15.5,.72,.82);y.translate(3.4,0,0),this.cityCraneJibs=new oe(y,g,d),this.cityCraneJibs.count=0,this.cityCraneJibs.frustumCulled=!1,this.activeCityCraneSites=[],this.scene.add(this.cityFoundations,this.cityBodies,this.citySilos,this.cityRoofs,this.cityDomes,this.cityScaffolds,this.cityCraneMasts,this.cityCraneJibs)}_rebuildCityDisks(){for(;this.cityDisksGroup.children.length>0;)this.cityDisksGroup.remove(this.cityDisksGroup.children[0]);for(let t of this.economy.cities){let e=new Mn(4.5*L.horizScale,t.plateauRadius*.88,40);e.rotateX(-Math.PI*.5);let i=t.archetype==="agro"?7307075:t.archetype==="resort"?9143664:6054764,n=new ne({color:i,map:this.textures.concreteMap,transparent:!0,opacity:.44}),s=new Mt(e,n),o=this.hydro.sampleAtWorld(t.x,t.z).bed;s.position.set(t.x,o+.12*L.elevScale,t.z),s.frustumCulled=!1,s.matrixAutoUpdate=!1,s.updateMatrix(),this.cityDisksGroup.add(s)}}_buildVolumetricConstructionPools(){let t=new js({color:14541802,map:this.textures.concreteMap,bumpMap:this.textures.concreteBump,bumpScale:.35,shininess:14}),e=new ne({color:16777215,map:this.textures.rebarFormwork}),i=new kt(1,1,1);i.translate(0,.5,0),this.damMonolithMesh=new oe(i,t,2600),this.damMonolithMesh.count=0,this.damMonolithMesh.castShadow=!!this.profile.shadows,this.damMonolithMesh.receiveShadow=!!this.profile.shadows,this.damMonolithMesh.frustumCulled=!1,this.damMonolithMesh.matrixAutoUpdate=!1,this.scene.add(this.damMonolithMesh);let n=new kt(1.06,1,1.06);n.translate(0,.5,0),this.scaffoldingMesh=new oe(n,e,1400),this.scaffoldingMesh.count=0,this.scaffoldingMesh.castShadow=!!this.profile.shadows,this.scaffoldingMesh.frustumCulled=!1,this.scaffoldingMesh.matrixAutoUpdate=!1,this.scene.add(this.scaffoldingMesh);let s=new Ce(.32,.92,1,4);s.rotateY(Math.PI*.25),s.translate(0,.5,.25),this.buttressMesh=new oe(s,t,1600),this.buttressMesh.count=0,this.buttressMesh.castShadow=!!this.profile.shadows,this.buttressMesh.receiveShadow=!!this.profile.shadows,this.buttressMesh.frustumCulled=!1,this.buttressMesh.matrixAutoUpdate=!1,this.scene.add(this.buttressMesh);let o=new kt(1,1,1);o.translate(0,.5,0),this.canalCurbMesh=new oe(o,t,2e3),this.canalCurbMesh.count=0,this.canalCurbMesh.receiveShadow=!!this.profile.shadows,this.canalCurbMesh.frustumCulled=!1,this.canalCurbMesh.matrixAutoUpdate=!1,this.scene.add(this.canalCurbMesh),this.cranes=[];for(let a=0;a<6;a++){let l=this._createTowerCraneMesh(a);l.visible=!1,this.scene.add(l),this.cranes.push(l)}}_createTowerCraneMesh(t){let e=new we,i=new ne({color:16096779,map:this.textures.steel}),n=new ne({color:3359061,map:this.textures.concreteMap}),s=new Mt(new kt(4.2,1.2,4.2),n);s.position.y=.6,e.add(s);let o=new Mt(new kt(1.35,19,1.35),i);o.position.y=10.1,o.castShadow=!!this.profile.shadows,e.add(o);let a=new we;a.position.y=19.6;let l=new Mt(new kt(2.1,2.2,2.1),i);l.position.set(.6,.8,0);let c=new Mt(new kt(21,.95,1.05),i);c.position.set(4.5,1.4,0),c.castShadow=!!this.profile.shadows;let h=new Mt(new _i(.9,3.4,4),i);h.position.set(0,3.4,0);let u=new Mt(new kt(3.4,1.8,2),n);u.position.set(-4.8,.9,0);let d=new we;d.position.set(10.5,1,0);let f=new Mt(new Ce(.08,.08,9.5,5),new Se({color:13358561}));f.position.y=-4.75;let g=new Mt(new Ce(.95,.55,1.8,8),n);return g.position.y=-9.6,d.add(f,g),a.add(l,c,h,u,d),e.add(a),e.userData.slew=a,e.userData.hoist=d,e.userData.seed=t*1.7,e}syncEngineeredVolumes(){if(!this.hydro.engineeredDirty)return;this.hydro.engineeredDirty=!1;let t=this.hydro.grid,e=this.hydro.dx,i=L.size*.5,{bedrock:n,soil:s,concrete:o,targetConcrete:a,foundationMask:l,buttressYaw:c,linedMask:h,gateWall:u}=this.hydro,d=0,f=0,g=0,y=0,p=this.damMonolithMesh.instanceMatrix.count,m=this.scaffoldingMesh.instanceMatrix.count,x=this.buttressMesh.instanceMatrix.count,S=this.canalCurbMesh.instanceMatrix.count;for(let M=1;M<t-1;M++){let b=-i+(M+.5)*e,_=M*t;for(let w=1;w<t-1;w++){let v=_+w,T=o[v],C=a[v],R=l[v]===1,P=h[v]===1;if(T<.9&&C<.9&&!R&&!P)continue;let N=-i+(w+.5)*e,I=n[v]+s[v];if(T>=1.35&&u[v]<.05&&d<p){ue.set(N,I-.35,b),Me.identity(),he.set(e*.96,T+.52,e*.96),ee.compose(ue,Me,he),this.damMonolithMesh.setMatrixAt(d,ee);let U=Ki("hydro_concrete",w*7+M*13);Fi.setRGB(U.r*1.28,U.g*1.28,U.b*1.28),this.damMonolithMesh.setColorAt(d,Fi),d++}if(C>T+.08&&f<m){let U=I+T*.85,B=Math.max(1.2,C-T*.85+.65);ue.set(N,U,b),Me.identity(),he.set(e*1.02,B,e*1.02),ee.compose(ue,Me,he),this.scaffoldingMesh.setMatrixAt(f++,ee)}if(R&&g<x){let U=Math.max(2.6*L.elevScale,Math.max(T,C)*.92+1.4);ue.set(N,I-.6,b),He.set(0,-c[v]+Math.PI*.5,0),Me.setFromEuler(He),he.set(e*.88,U,e*1.38),ee.compose(ue,Me,he),this.buttressMesh.setMatrixAt(g++,ee)}P&&T<1.1&&C<1.1&&y<S&&(!h[v-1]||!h[v+1]||!h[v-t]||!h[v+t])&&(ue.set(N,I-.15,b),Me.identity(),he.set(e*.92,.72*L.elevScale,e*.92),ee.compose(ue,Me,he),this.canalCurbMesh.setMatrixAt(y++,ee))}}this.damMonolithMesh.count=d,this.scaffoldingMesh.count=f,this.buttressMesh.count=g,this.canalCurbMesh.count=y,this.damMonolithMesh.instanceMatrix.needsUpdate=!0,this.damMonolithMesh.instanceColor&&(this.damMonolithMesh.instanceColor.needsUpdate=!0),this.scaffoldingMesh.instanceMatrix.needsUpdate=!0,this.buttressMesh.instanceMatrix.needsUpdate=!0,this.canalCurbMesh.instanceMatrix.needsUpdate=!0}animateConstructionCranes(t){let e=this.hydro.activeBuildSites,i=Math.pow(L.horizScale,.56);for(let n=0;n<this.cranes.length;n++){let s=this.cranes[n];if(n<e.length){let o=e[n];s.visible=!0,s.scale.setScalar(i),s.position.set(o.wx+5.5*i,o.wy-.5,o.wz-4.5*i);let a=t*.85+s.userData.seed;s.userData.slew.rotation.y=Math.sin(a)*1.15,s.userData.hoist.position.x=8.5+Math.cos(a*1.4)*5.2}else s.visible=!1}if(this.cityCraneJibs&&this.activeCityCraneSites&&this.activeCityCraneSites.length>0){let n=this.activeCityCraneSites.length;for(let s=0;s<n;s++){let o=this.activeCityCraneSites[s],a=o.baseYaw+Math.sin(t*.72+o.seed)*1.35;ue.set(o.x,o.topY,o.z),He.set(0,a,0),Me.setFromEuler(He),he.setScalar(o.scale),ee.compose(ue,Me,he),this.cityCraneJibs.setMatrixAt(s,ee)}this.cityCraneJibs.count=n,this.cityCraneJibs.instanceMatrix.needsUpdate=!0}else this.cityCraneJibs&&(this.cityCraneJibs.count=0)}_buildPowerLinePools(){let e=new Ce(.22,1.05,12.8,4);e.translate(0,6.4,0);let i=new ne({color:11187906,map:this.textures.steel});this.pylonMesh=new oe(e,i,420),this.pylonMesh.count=0,this.pylonMesh.frustumCulled=!1,this.pylonMesh.matrixAutoUpdate=!1,this.scene.add(this.pylonMesh);let n=new kt(4.6,.28,.35);n.translate(0,11.4,0),this.pylonArmMesh=new oe(n,i,420),this.pylonArmMesh.count=0,this.pylonArmMesh.frustumCulled=!1,this.pylonArmMesh.matrixAutoUpdate=!1,this.scene.add(this.pylonArmMesh);let s=new me;this.wirePositions=new Float32Array(420*24),this.wireAttr=new te(this.wirePositions,3),s.setAttribute("position",this.wireAttr),this.wireMat=new yn({color:16769154,transparent:!0,opacity:.88}),this.wireLines=new Hn(s,this.wireMat),this.wireLines.frustumCulled=!1,this.scene.add(this.wireLines)}_buildCursorPreview(){this.cursorGroup=new we,this.cursorGroup.visible=!1;let t=new Mn(.88,1,36);t.rotateX(-Math.PI*.5),this.cursorRingMat=new Se({color:3718648,side:Ve,transparent:!0,opacity:.85,depthTest:!1}),this.cursorRing=new Mt(t,this.cursorRingMat),this.cursorGroup.add(this.cursorRing);let e=new Ce(.82,1,1,20,1,!0);e.translate(0,.5,0),this.ghostVolumeMat=new Se({color:16498468,transparent:!0,opacity:.24,side:Ve,depthWrite:!1}),this.ghostVolume=new Mt(e,this.ghostVolumeMat),this.ghostVolume.visible=!1,this.cursorGroup.add(this.ghostVolume),this.flowArrow=new we;let i=new Mt(new kt(15,.85,1.7),new Se({color:2282478,transparent:!0,opacity:.82})),n=new Mt(new _i(2.9,5.8,12),new Se({color:3462041,transparent:!0,opacity:.92}));n.rotation.z=-Math.PI*.5,n.position.x=9.5;let s=new Mt(new Xi(2.2,12,12),new Se({color:3900150,transparent:!0,opacity:.86}));s.position.x=-9.5,this.flowArrow.add(i,n,s),this.flowArrow.visible=!1,this.cursorGroup.add(this.flowArrow),this.scene.add(this.cursorGroup)}_buildIrrigationBeacon(){let t=new Mn(10.5,12.6,32);t.rotateX(-Math.PI*.5),this.irrRingMat=new Se({color:3462041,side:Ve,transparent:!0,opacity:.58});let e=this.economy.cities.find(o=>o.archetype==="agro"),i=e&&e.irrigationTarget?e.irrigationTarget.x:168*L.horizScale,n=e&&e.irrigationTarget?e.irrigationTarget.z:98*L.horizScale,s=this.hydro.sampleAtWorld(i,n).bed;this.irrBeacon=new Mt(t,this.irrRingMat),this.irrBeacon.position.set(i,s+.45*L.elevScale,n),this.irrBeacon.userData.baseScale=Math.pow(L.horizScale,.65),this.scene.add(this.irrBeacon)}_buildTutorialBeacon(){this.tutorialBeacon=new we,this.tutorialBeacon.visible=!1;let t=new Mt(new Mn(9,11.4,36),new Se({color:2282478,side:Ve,transparent:!0,opacity:.82}));t.rotateX(-Math.PI*.5);let e=new Mt(new Ce(1.4,4.5,36,16,1,!0),new Se({color:3718648,side:Ve,transparent:!0,opacity:.22,depthWrite:!1}));e.position.y=18;let i=new Mt(new _i(3.4,6.8,6),new Se({color:16638023}));i.rotation.x=Math.PI,i.position.y=22,this.tutorialBeacon.add(t,e,i),this.tutorialBeacon.userData.pointer=i,this.scene.add(this.tutorialBeacon)}setTutorialTarget(t,e,i=!0){if(!this.tutorialBeacon||(this.tutorialBeacon.visible=i,!i))return;let n=this.hydro.sampleAtWorld(t,e);this.tutorialBeacon.position.set(t,Math.max(n.bed,n.surface)+.45,e)}updateTerrainGeometryRect(t,e,i,n){let s=this.hydro.grid,o=this.hydro.dx,a=this.terrainPosAttr.array,l=this.terrainNormAttr.array,c=this.terrainMetaAttr.array,{zb:h,soil:u,concrete:d,formworkWall:f,wetness:g,h:y,linedMask:p}=this.hydro;for(let _=e;_<=n;_++){let w=_*s;for(let v=t;v<=i;v++){let T=w+v;a[T*3+1]=h[T];let C=T*4;c[C]=u[T],c[C+1]=Math.max(d[T],f[T]*.5)+(p[T]?.5:0),c[C+2]=g[T],c[C+3]=y[T]}}let m=W(t-1,0,s-1),x=W(e-1,0,s-1),S=W(i+1,0,s-1),M=W(n+1,0,s-1),b=2*o;for(let _=x;_<=M;_++){let w=Math.max(0,_-1)*s,v=Math.min(s-1,_+1)*s,T=_*s;for(let C=m;C<=S;C++){let R=Math.max(0,C-1),P=Math.min(s-1,C+1),N=(h[T+P]-h[T+R])/b,I=(h[v+C]-h[w+C])/b,U=Math.hypot(N,1,I),B=(T+C)*3;l[B]=-N/U,l[B+1]=1/U,l[B+2]=-I/U}}if(this.terrainPosAttr.needsUpdate=!0,this.terrainNormAttr.needsUpdate=!0,this.terrainMetaAttr.needsUpdate=!0,this.treeSlots&&i-t<s-2){let _=L.size*.5,w=-_+t*o-2,v=-_+(i+1)*o+2,T=-_+e*o-2,C=-_+(n+1)*o+2,R=!1;for(let P=0;P<this.treeSlots.length;P++){let N=this.treeSlots[P];if(N.alive&&N.wx>=w&&N.wx<=v&&N.wz>=T&&N.wz<=C){let I=this.hydro.sampleAtWorld(N.wx,N.wz);(Math.abs(I.bed-N.baseBed)>.35||I.concrete>.1||I.targetConcrete>.1||I.lined)&&(N.alive=!1,ee.makeScale(0,0,0),this.treeTrunks.setMatrixAt(N.index,ee),this.treeCrowns.setMatrixAt(N.index,ee),R=!0)}}if(R&&(this.treeTrunks.instanceMatrix.needsUpdate=!0,this.treeCrowns.instanceMatrix.needsUpdate=!0),this.rockSlots){let P=!1;for(let N=0;N<this.rockSlots.length;N++){let I=this.rockSlots[N];if(I.alive&&I.wx>=w&&I.wx<=v&&I.wz>=T&&I.wz<=C){let U=this.hydro.sampleAtWorld(I.wx,I.wz);(Math.abs(U.bed-I.baseBed)>.3||U.concrete>.1||U.targetConcrete>.1||U.lined)&&(I.alive=!1,ee.makeScale(0,0,0),this.rockInstances.setMatrixAt(I.index,ee),P=!0)}}P&&(this.rockInstances.instanceMatrix.needsUpdate=!0)}}}updateWaterAndWetness(t){let e=this.hydro.grid,i=2*this.hydro.dx,{zb:n,h:s,u:o,v:a,foam:l,sediment:c,vort:h,wetness:u,soil:d,concrete:f,formworkWall:g,linedMask:y}=this.hydro,p=this.waterPosAttr.array,m=this.waterNormAttr.array,x=this.waterH1Attr.array,S=this.waterH2Attr.array,M=this.terrainMetaAttr.array;for(let b=0;b<e;b++){let _=b*e;for(let w=0;w<e;w++){let v=_+w,T=s[v],C=v*3,R=v*4;if(M[R]=d[v],M[R+1]=Math.max(f[v],g[v]*.5)+(y[v]?.5:0),M[R+2]=u[v],M[R+3]=T,T>.014)p[C+1]=n[v]+T,x[R]=T,x[R+1]=o[v],x[R+2]=a[v],x[R+3]=l[v],S[R]=c[v],S[R+1]=h[v],S[R+2]=f[v]>.05||y[v]?1:0,S[R+3]=1;else{let P=0,N=0;if(w>0&&s[v-1]>.014&&(P+=n[v-1]+s[v-1],N++),w<e-1&&s[v+1]>.014&&(P+=n[v+1]+s[v+1],N++),b>0&&s[v-e]>.014&&(P+=n[v-e]+s[v-e],N++),b<e-1&&s[v+e]>.014&&(P+=n[v+e]+s[v+e],N++),N>0){let I=P/N;p[C+1]=Math.min(n[v]+.025,I),x[R]=0,x[R+1]=0,x[R+2]=0,x[R+3]=0,S[R+3]=1}else p[C+1]=n[v]-.65*L.elevScale,x[R]=0,S[R+3]=0}}}for(let b=0;b<this.hydro.activeTileCount;b++){let _=this.hydro.activeTiles[b],w=Math.max(1,_%this.hydro.tilesN*8),v=Math.max(1,Math.floor(_/this.hydro.tilesN)*8),T=Math.min(e-2,w+8),C=Math.min(e-2,v+8);for(let R=v;R<=C;R++){let P=R*e;for(let N=w;N<=T;N++){let I=P+N;if(s[I]<=.014)continue;let U=p[(I-1)*3+1],B=p[(I+1)*3+1],G=p[(I-e)*3+1],Q=p[(I+e)*3+1],F=W((B-U)/i,-.65,.65),$=W((Q-G)/i,-.65,.65),K=Math.hypot(F,1,$),at=I*3;m[at]=-F/K,m[at+1]=1/K,m[at+2]=-$/K}}}this.waterPosAttr.needsUpdate=!0,this.waterNormAttr.needsUpdate=!0,this.waterH1Attr.needsUpdate=!0,this.waterH2Attr.needsUpdate=!0,this.terrainMetaAttr.needsUpdate=!0,this.waterMat.uniforms.uTime.value=t,this.terrainMat.uniforms.uTime.value=t,this.outerSeaMat&&(this.outerSeaMat.uniforms.uTime.value=t),this.terrainMat.uniforms.uMeltOffset.value=this.economy.hydrology?this.economy.hydrology.snowMeltVisualOffset:0,this.updateOverflowWater3D(t)}syncCityInstances(){let t=this.economy.allBuildings,e=new Map;for(let y of this.economy.cities)e.set(y.id,y);let i=this.cityBodies.instanceMatrix.count,n=this.cityScaffolds.instanceMatrix.count,s=this.cityCraneMasts.instanceMatrix.count,o=Math.pow(L.horizScale,.52),a=.62*Math.pow(L.elevScale,.68),l=0,c=0,h=0,u=0,d=0,f=0,g=0;this.activeCityCraneSites.length=0;for(let y=0;y<t.length&&y<i;y++){let p=t[y],m=e.get(p.cityId),x=m&&m.connected&&m.powerRatio>=.45?1:0,S=W(p.anim??1,0,1),M=W(S/.16,.25,1);ue.set(p.wx,p.wy-.35,p.wz),He.set(0,p.yaw,0),Me.setFromEuler(He),he.set(p.sx*M,a,p.sz*M),ee.compose(ue,Me,he),this.cityFoundations.setMatrixAt(d++,ee);let b=.05;if(S>.1){let w=W((S-.1)/.82,0,1),v=Math.max(2,Math.round(p.sy/(3.2*Math.pow(L.elevScale,.65)))),T=Math.floor(w*v)/v;b=Math.max(.06,$t(T,w,.62))}let _=p.sy*(S>=.96?1:b);if(ue.set(p.wx,p.wy-.22,p.wz),Fi.setRGB(p.shadeR||.72,p.shadeG||.74,p.shadeB||.78),p.roofType==="silo")he.set(p.sx,_,p.sz),ee.compose(ue,Me,he),this.citySilos.setMatrixAt(c,ee),this.citySilos.setColorAt(c,Fi),this.siloPoweredArr[c]=x,this.siloStyleArr[c]=p.styleId||13,this.siloBuildProgArr[c]=S,c++;else if(he.set(p.sx,_,p.sz),ee.compose(ue,Me,he),this.cityBodies.setMatrixAt(l,ee),this.cityBodies.setColorAt(l,Fi),this.cityPoweredArr[l]=x,this.cityStyleArr[l]=p.styleId||0,this.cityBuildProgArr[l]=S,l++,S>=.8){let w=W((S-.8)/.18,.05,1);if(p.roofType==="gable"&&h<i)ue.set(p.wx,p.wy-.22+_,p.wz),he.set(p.sx*1.08,(1.8*Math.pow(L.elevScale,.7)+_*.16)*w,p.sz*1.08),ee.compose(ue,Me,he),Fi.setRGB(p.roofR||.68,p.roofG||.34,p.roofB||.26),this.cityRoofs.setMatrixAt(h,ee),this.cityRoofs.setColorAt(h,Fi),h++;else if(p.roofType==="dome"&&u<i){ue.set(p.wx,p.wy-.22+_,p.wz);let v=Math.min(p.sx,p.sz)*.78*w;he.set(v,v*.75,v),ee.compose(ue,Me,he),this.cityDomes.setMatrixAt(u++,ee)}}if(S>=.05&&S<.92){if(f<n){let w=S>.82?1-(S-.82)/.1:1,v=Math.max(2.2*L.elevScale,_*1.08)*w;ue.set(p.wx,p.wy-.22,p.wz),He.set(0,p.yaw,0),Me.setFromEuler(He),he.set(p.sx*1.12,v,p.sz*1.12),ee.compose(ue,Me,he),this.cityScaffolds.setMatrixAt(f++,ee)}if(g<s){let w=Math.cos(p.yaw)*(p.sx*.68+2.4*o),v=-Math.sin(p.yaw)*(p.sz*.68+2.4*o),T=p.wx+w,C=p.wz+v,R=Math.max(p.sy*.85,_)+7.5*Math.pow(L.elevScale,.72);ue.set(T,p.wy-.2,C),He.set(0,p.yaw,0),Me.setFromEuler(He),he.set(o,R,o),ee.compose(ue,Me,he),this.cityCraneMasts.setMatrixAt(g,ee),this.activeCityCraneSites.push({x:T,topY:p.wy-.2+R,z:C,baseYaw:p.yaw+Math.PI,scale:o*.92,seed:y*1.37}),g++}}}this.cityFoundations.count=d,this.cityBodies.count=l,this.citySilos.count=c,this.cityRoofs.count=h,this.cityDomes.count=u,this.cityScaffolds.count=f,this.cityCraneMasts.count=g,this.cityFoundations.instanceMatrix.needsUpdate=!0,this.cityBodies.instanceMatrix.needsUpdate=!0,this.cityPoweredAttr.needsUpdate=!0,this.cityStyleAttr.needsUpdate=!0,this.cityBuildProgAttr.needsUpdate=!0,this.cityBodies.instanceColor&&(this.cityBodies.instanceColor.needsUpdate=!0),this.citySilos.instanceMatrix.needsUpdate=!0,this.siloPoweredAttr.needsUpdate=!0,this.siloStyleAttr.needsUpdate=!0,this.siloBuildProgAttr.needsUpdate=!0,c>0&&this.citySilos.instanceColor&&(this.citySilos.instanceColor.needsUpdate=!0),this.cityRoofs.instanceMatrix.needsUpdate=!0,h>0&&this.cityRoofs.instanceColor&&(this.cityRoofs.instanceColor.needsUpdate=!0),this.cityDomes.instanceMatrix.needsUpdate=!0,this.cityScaffolds.instanceMatrix.needsUpdate=!0,this.cityCraneMasts.instanceMatrix.needsUpdate=!0}syncHydroStructures(t=0){let e=new Set;for(let i of this.hydro.turbines){e.add(`t_${i.id}`);let n=this.structMeshes.get(`t_${i.id}`);n||(n=this._createTurbinePowerhouseMesh(i),this.structMeshes.set(`t_${i.id}`,n),this.structuresGroup.add(n),this.economy.powerLinesDirty=!0);let s=n.userData.rotor;s&&(s.rotation.y=i.rotorPhase);let o=n.userData.gantryTrolley;o&&(o.position.z=Math.sin(t*.45+i.id)*n.userData.gantryTravel);let a=n.userData.statusLamp;a&&(i.isPumpingNow?a.material.color.setHex(2282478):i.cavitation>.45?a.material.color.setHex(15680580):a.material.color.setHex(i.powerMW>.1?3462041:16096779))}for(let i of this.hydro.spillways){e.add(`s_${i.id}`);let n=this.structMeshes.get(`s_${i.id}`);n||(n=this._createSpillwayMesh(i),this.structMeshes.set(`s_${i.id}`,n),this.structuresGroup.add(n));let s=n.userData.gateLeaf;s&&(s.position.y=i.sillElev+i.wallHeight*.5+i.openRatio*(i.wallHeight*.8));let o=n.userData.chuteWater,a=n.userData.skiJump,l=i.currentFlowQ>.35&&i.openRatio>.03;if(o&&(o.visible=l,l)){let c=W(.35+i.openRatio*1.45,.35,2.2);o.scale.y=c}if(a&&(a.visible=l,l)){let c=n.userData.baseThrow*(.7+W(i.jetSpeed/12,.15,1.1));a.scale.x=c}}for(let i of this.hydro.navLocks){e.add(`l_${i.id}`);let n=this.structMeshes.get(`l_${i.id}`);n||(n=this._createNavLockMesh(i),this.structMeshes.set(`l_${i.id}`,n),this.structuresGroup.add(n));let s=i.cyclePhase||0,o=s<.25?Math.sin(s/.25*Math.PI)*.95:0;if(n.userData.gateLeft&&(n.userData.gateLeft.rotation.y=o),n.userData.gateRight&&(n.userData.gateRight.rotation.y=-o),n.userData.chamberWater){let a=Math.sin(s*Math.PI*2)*1.8*L.elevScale;n.userData.chamberWater.position.y=i.baseY+2.4*L.elevScale+a}}for(let i of this.hydro.fishFarms){e.add(`f_${i.id}`);let n=this.structMeshes.get(`f_${i.id}`);n||(n=this._createFishFarmMesh(i),this.structMeshes.set(`f_${i.id}`,n),this.structuresGroup.add(n));let s=this.hydro.sampleAtWorld(i.wx,i.wz);n.position.y=Math.max(s.bed,s.surface),n.userData.aerator&&(n.userData.aerator.rotation.y=t*4.5)}for(let i of this.hydro.substations){e.add(`u_${i.id}`);let n=this.structMeshes.get(`u_${i.id}`);n||(n=this._createSubstationMesh(i),this.structMeshes.set(`u_${i.id}`,n),this.structuresGroup.add(n),this.economy.powerLinesDirty=!0)}for(let[i,n]of this.structMeshes.entries())e.has(i)||(this.structuresGroup.remove(n),this.structMeshes.delete(i),this.economy.powerLinesDirty=!0);this.economy.powerLinesDirty&&(this._rebuildPowerLines(),this.economy.powerLinesDirty=!1)}_createTurbinePowerhouseMesh(t){let e=new we;e.position.set(t.wx,0,t.wz),e.rotation.y=-t.yaw;let i=Math.pow(L.horizScale,.52),n=new ne({color:14870768,map:this.textures.concreteMap}),s=new ne({color:9741240,map:this.textures.concreteMap}),o=new Yi({color:13358561,map:this.textures.steel,roughness:.36,metalness:.68}),a=new ne({color:t.spec.color,map:this.textures.steel}),l=new ne({color:16096779,map:this.textures.steel}),c=new Se({color:16771235}),h=Math.min(t.baseY,t.outfallBedY),u=h+1.1*L.elevScale,d=Math.max(u+5.2*i,t.crestY),f=Math.max(5*i,d-h),g=Math.max(8.8*i,Math.hypot(t.hallWx-t.wx,t.hallWz-t.wz)),y=new Mt(new kt(6.8*i,f,12.6*i),n);y.position.set(-1.2*i,h+f*.5,0),y.castShadow=!!this.profile.shadows,y.receiveShadow=!!this.profile.shadows;let p=Math.max(4.8*i,f*.72),m=new Mt(new kt(.6*i,p,9.6*i),new ne({color:1976635,map:this.textures.steel}));m.position.set(-4.7*i,d-p*.52,0);for(let q of[-4.8,0,4.8]){let Z=new Mt(new kt(2.4*i,p+1.8*i,1.1*i),s);Z.position.set(-4.5*i,d-p*.45+.6*i,q*i),e.add(Z)}let x=new we;x.position.set(-1.2*i,d,0);let S=new Mt(new kt(.6*i,3.8*i,.6*i),l);S.position.set(-1.8*i,1.9*i,0);let M=S.clone();M.position.x=1.8*i;let b=new Mt(new kt(4.6*i,.85*i,2.2*i),l);b.position.set(0,3.9*i,0),x.add(S,M,b);let _=(t.type==="francis"?1.25:t.type==="pelton"?1.05:1.38)*i,w=new O(-.5*i,d-2.2*i,0),v=new O(g-2.6*i,u+1.8*i,0),T=new O().subVectors(v,w),C=Math.max(2.5,T.length()),R=new fi().setFromUnitVectors(new O(0,1,0),T.clone().normalize());for(let q of[-2.4*i,2.4*i]){let Z=new Mt(new Ce(_,_,C,14),o);Z.position.copy(w).addScaledVector(T,.5),Z.position.z=q,Z.quaternion.copy(R),Z.castShadow=!!this.profile.shadows,e.add(Z);for(let ct of[.25,.55,.82]){let vt=new Mt(new Ce(_*1.18,_*1.18,.42*i,14),a);vt.position.copy(w).addScaledVector(T,ct),vt.position.z=q,vt.quaternion.copy(R),e.add(vt)}}let P=9.4*i,N=6.6*i,I=13.2*i,U=4.6*i,B=new Mt(new kt(P+2.4*i,U,I+.6*i),s);B.position.set(g+.8*i,u-U*.5+.6*i,0),B.receiveShadow=!!this.profile.shadows;for(let q of[-2.8*i,2.8*i]){let Z=new Mt(new kt(1.4*i,2.5*i,3.8*i),new Se({color:729657}));Z.position.set(g+P*.5+1.5*i,u-.8*i,q),e.add(Z)}let G=new Mt(new kt(P,N,I),n);G.position.set(g,u+N*.5,0),G.castShadow=!!this.profile.shadows,G.receiveShadow=!!this.profile.shadows;for(let q=-2;q<=2;q++){let Z=new Mt(new kt(.25*i,N*.62,1.45*i),c);Z.position.set(g+P*.5+.05*i,u+N*.54,q*2.3*i),e.add(Z)}let Q=new Mt(new kt(P+.8*i,.85*i,I+.8*i),a);Q.position.set(g,u+N+.35*i,0);let F=new we;F.position.set(g,u+N+1.15*i,0);let $=new Mt(new Ce(1.35*i,1.35*i,1.1*i,12),o),K=new Mt(new kt(5.2*i,.35*i,.85*i),a),at=K.clone();at.rotation.y=Math.PI*.5,F.add($,K,at);let rt=u+1.2*i,It=new Mt(new kt(2.6*i,2.8*i,3.2*i),o);It.position.set(g-P*.35,rt+1.4*i,I*.5+2*i);let ut=new Mt(new Ce(.18*i,.32*i,6.2*i,4),o);ut.position.set(g,u+N+3.1*i,I*.38);let Pt=new Mt(new Xi(.68*i,8,8),new Se({color:16096779}));return Pt.position.set(g+P*.38,u+N+1.5*i,I*.38),e.add(y,m,x,B,G,Q,F,It,ut,Pt),e.userData.rotor=F,e.userData.gantryTrolley=x,e.userData.gantryTravel=3.8*i,e.userData.statusLamp=Pt,e}_createSpillwayMesh(t){let e=new we;e.position.set(t.wx,0,t.wz),e.rotation.y=-t.yaw;let i=Math.pow(L.horizScale,.5),n=new ne({color:13358561,map:this.textures.concreteMap}),s=new ne({color:14251782,map:this.textures.steel}),o=t.wallHeight+4.8*L.elevScale,a=Math.max(7.6*i,this.hydro.dx*1.6),l=new Mt(new kt(10.5*i,o,1.5*i),n);l.position.set(1.2*i,t.sillElev+o*.5-1,-a*.55),l.castShadow=!!this.profile.shadows;let c=l.clone();c.position.z=a*.55;let h=new Mt(new kt(2.8*i,1.3*i,a*1.28),n);h.position.set(0,t.sillElev+o-.5,0);let u=new Mt(new kt(1.2*i,t.wallHeight,a*.96),s);u.position.set(0,t.sillElev+t.wallHeight*.5,0);let d=Math.max(2,t.sillElev-(t.downBedY||t.sillElev-4)),f=Math.max(8*i,d*1.15),g=-Math.atan2(d*.55,f),y=new Mt(new kt(f,1.2*i,a),n);y.rotation.z=g,y.position.set(f*.45,t.sillElev-d*.28,0);let p=new Mt(new kt(f*1.02,1*i,a*.92),this.overflowWaterMat);p.rotation.z=g,p.position.set(f*.45,t.sillElev-d*.28+.95*i,0),p.renderOrder=3,p.visible=!1;let m=new Mt(Kd(),this.overflowWaterMat),x=f*.92,S=t.sillElev-d*.52+.8*i,M=Math.max(2.2,S-(t.downBedY||S-4)),b=Math.max(6*i,M*.95);return m.position.set(x,S,0),m.scale.set(b,M,a*.9),m.renderOrder=3,m.visible=!1,e.add(l,c,h,u,y,p,m),e.userData.gateLeaf=u,e.userData.chuteWater=p,e.userData.skiJump=m,e.userData.baseThrow=b,e}_createNavLockMesh(t){let e=new we;e.position.set(t.wx,0,t.wz),e.rotation.y=-t.yaw;let i=Math.pow(L.horizScale,.55),n=new ne({color:14212841,map:this.textures.concreteMap}),s=new ne({color:1920728,map:this.textures.steel}),o=22*i,a=7.4*i,l=6.8*L.elevScale,c=new Mt(new kt(o,l,1.6*i),n);c.position.set(0,t.baseY+l*.5,-a*.5);let h=c.clone();h.position.z=a*.5;let u=new Mt(new kt(o*.92,.8,a*.84),new Se({color:959977,transparent:!0,opacity:.78}));u.position.set(0,t.baseY+l*.45,0);let d=new Mt(new kt(.6*i,l*.88,a*.46),s);d.position.set(o*.45,t.baseY+l*.46,-a*.24);let f=d.clone();return f.position.z=a*.24,e.add(c,h,u,d,f),e.userData.gateLeft=d,e.userData.gateRight=f,e.userData.chamberWater=u,e}_createFishFarmMesh(t){let e=new we;e.position.set(t.wx,t.wy,t.wz);let i=Math.pow(L.horizScale,.55),n=new ne({color:16347926}),s=new Se({color:481669,transparent:!0,opacity:.65}),o=new ne({color:14870768,map:this.textures.roof}),a=[[-4.2,-3.5],[4.2,-3.5],[-4.2,3.5],[4.2,3.5]];for(let[h,u]of a){let d=new Mt(new Js(3.1*i,.28*i,6,18),n);d.rotation.x=Math.PI*.5,d.position.set(h*i,.25*i,u*i);let f=new Mt(new Zs(2.9*i,16),s);f.rotation.x=-Math.PI*.5,f.position.set(h*i,.18*i,u*i),e.add(d,f)}let l=new Mt(new kt(13*i,.35*i,1.8*i),o);l.position.y=.35*i;let c=new Mt(new kt(2.6*i,.45*i,.55*i),new Se({color:3718648}));return c.position.set(0,.85*i,0),e.add(l,c),e.userData.aerator=c,e}_createSubstationMesh(t){let e=new we;e.position.set(t.wx,t.wy,t.wz);let i=Math.pow(L.horizScale,.52),n=new ne({color:13358561,map:this.textures.concreteMap}),s=new ne({color:9741240,map:this.textures.steel}),o=new ne({color:3718648}),a=new Mt(new kt(16.5*i,1*i,14.5*i),n);a.position.y=-.3*i,e.add(a);for(let c of[-3.6,3.6]){let h=new Mt(new kt(3.8*i,3.8*i,4.6*i),s);h.position.set(c*i,2*i,0),h.castShadow=!!this.profile.shadows,e.add(h);for(let u of[-1.2,0,1.2]){let d=new Mt(new Ce(.18*i,.26*i,2.1*i,6),o);d.position.set(c*i,4.8*i,u*i),e.add(d)}}for(let c of[-5.2,5.2]){let h=new Mt(new Ce(.22*i,.42*i,11.5*i,4),s);h.position.set(-5.8*i,5.75*i,c*i);let u=h.clone();u.position.x=5.8*i;let d=new Mt(new kt(12.8*i,.45*i,.45*i),s);d.position.set(0,11.2*i,c*i),e.add(h,u,d)}let l=new Mt(new Xi(.65*i,8,8),new Se({color:3718648}));return l.position.set(0,12.2*i,5.2*i),e.add(l),e}_rebuildPowerLines(){let t=L.horizScale,e=Math.pow(t,.56),i=this.hydro.substations.length>0?{x:this.hydro.substations[0].wx,z:this.hydro.substations[0].wz}:this.hydro.turbines.length>0?{x:this.hydro.turbines[0].wx,z:this.hydro.turbines[0].wz}:{x:12*t,z:-152*t},n=0,s=0,o=this.pylonMesh.instanceMatrix.count,a=[];for(let c of this.hydro.substations)for(let h of this.hydro.turbines)Math.hypot(h.wx-c.wx,h.wz-c.wz)<220*t&&a.push({x0:h.wx,z0:h.wz,x1:c.wx,z1:c.wz});for(let c of this.economy.cities){if(!c.connected)continue;let h=i,u=Math.hypot(c.x-h.x,c.z-h.z);for(let d of this.hydro.substations){let f=Math.hypot(c.x-d.wx,c.z-d.wz);f<u&&(u=f,h={x:d.wx,z:d.wz})}for(let d of this.hydro.turbines){let f=Math.hypot(c.x-d.wx,c.z-d.wz);f<u&&(u=f,h={x:d.wx,z:d.wz})}a.push({x0:h.x,z0:h.z,x1:c.x,z1:c.z})}let l=52*t;for(let c of a){let h=Math.hypot(c.x1-c.x0,c.z1-c.z0),u=W(Math.ceil(h/l),2,18),d=Math.atan2(c.x1-c.x0,c.z1-c.z0),f=null;for(let g=0;g<=u&&!(n>=o);g++){let y=g/u,p=c.x0+(c.x1-c.x0)*y,m=c.z0+(c.z1-c.z0)*y,x=this.hydro.sampleAtWorld(p,m),S=Math.max(x.bed,x.surface);ue.set(p,S,m),He.set(0,d,0),Me.setFromEuler(He),he.set(e,e,e),ee.compose(ue,Me,he),this.pylonMesh.setMatrixAt(n,ee),this.pylonArmMesh.setMatrixAt(n,ee),n++;let M=S+12.1*e;if(f&&s+12<=this.wirePositions.length){let b=(f.x+p)*.5,_=(f.z+m)*.5,w=(f.y+M)*.5-2.1*e;this.wirePositions[s++]=f.x,this.wirePositions[s++]=f.y,this.wirePositions[s++]=f.z,this.wirePositions[s++]=b,this.wirePositions[s++]=w,this.wirePositions[s++]=_,this.wirePositions[s++]=b,this.wirePositions[s++]=w,this.wirePositions[s++]=_,this.wirePositions[s++]=p,this.wirePositions[s++]=M,this.wirePositions[s++]=m}f={x:p,y:M,z:m}}}for(let c=s;c<this.wirePositions.length;c++)this.wirePositions[c]=0;this.pylonMesh.count=n,this.pylonArmMesh.count=n,this.pylonMesh.instanceMatrix.needsUpdate=!0,this.pylonArmMesh.instanceMatrix.needsUpdate=!0,this.wireAttr.needsUpdate=!0}updateAtmosphere(t,e,i=null,n=.016){let s=(t-6)/24*Math.PI*2,o=Math.sin(s),a=Math.cos(s),l=new O(a*.78,Math.max(-.35,o),.48).normalize(),c=W((o+.16)/.65,0,1),h=Math.exp(-Math.pow((o-.08)/.18,2)),u=new dt(594982),d=new dt(2450347),f=new dt(1254978),g=new dt(10406632),y=new dt(15900519);this.skyColorZenith.copy(u).lerp(d,c),this.skyColorHorizon.copy(f).lerp(g,c).lerp(y,h*.62),this.fogColor.copy(this.skyColorHorizon);let p=new dt(3889292).lerp(new dt(16774626),c).lerp(new dt(16755038),h*.75),m=e.fogDensity/Math.pow(L.horizScale,.84),x=i?i.x:0,S=i?i.z:0,M=480*Math.pow(L.horizScale,.55);this.sunLight.target.position.set(x,0,S),this.sunLight.position.set(x+l.x*M,Math.max(120,l.y*M),S+l.z*M),this.sunLight.color.copy(p),this.sunLight.intensity=(.18+1.34*c)*e.sunIntensity,this.hemiLight.intensity=.26+.56*c,this.scene.background.copy(this.fogColor);let b=o>-.05?l:new O(-l.x,.35,-l.z).normalize();if(this.terrainMat.uniforms.uSunDir.value.copy(b),this.terrainMat.uniforms.uSunColor.value.copy(p).multiplyScalar(.32+.78*c),this.terrainMat.uniforms.uSkyColor.value.copy(this.skyColorZenith).lerp(new dt(16777215),.35),this.terrainMat.uniforms.uFogColor.value.copy(this.fogColor),this.terrainMat.uniforms.uFogDensity.value=m,this.waterMat.uniforms.uSunDir.value.copy(b),this.waterMat.uniforms.uSunColor.value.copy(p).multiplyScalar(c),this.waterMat.uniforms.uSkyZenith.value.copy(this.skyColorZenith),this.waterMat.uniforms.uSkyHorizon.value.copy(this.skyColorHorizon),this.waterMat.uniforms.uFogColor.value.copy(this.fogColor),this.waterMat.uniforms.uFogDensity.value=m,this.overflowWaterMat&&(this.overflowWaterMat.uniforms.uSunFactor.value=.25+.75*c,this.overflowWaterMat.uniforms.uFogColor.value.copy(this.fogColor),this.overflowWaterMat.uniforms.uFogDensity.value=m),this.outerSeaMat&&(this.outerSeaMat.uniforms.uSunDir.value.copy(b),this.outerSeaMat.uniforms.uSunColor.value.copy(p).multiplyScalar(c),this.outerSeaMat.uniforms.uSkyZenith.value.copy(this.skyColorZenith),this.outerSeaMat.uniforms.uSkyHorizon.value.copy(this.skyColorHorizon),this.outerSeaMat.uniforms.uFogColor.value.copy(this.fogColor),this.outerSeaMat.uniforms.uFogDensity.value=m),this.horizonMistMat&&(this.horizonMistMat.uniforms.uFogColor.value.copy(this.fogColor),this.horizonMistMat.uniforms.uOpacity.value=e.id==="flood"?.88:e.id==="rain"?.8:.68),this.cityBodyMat&&(this.cityBodyMat.uniforms.uSunDir.value.copy(b),this.cityBodyMat.uniforms.uSunColor.value.copy(p).multiplyScalar(.28+.82*c),this.cityBodyMat.uniforms.uSkyColor.value.copy(this.skyColorZenith).lerp(new dt(16777215),.35),this.cityBodyMat.uniforms.uNightFactor.value=W(1-(o+.05)/.28,0,1),this.cityBodyMat.uniforms.uFogColor.value.copy(this.fogColor),this.cityBodyMat.uniforms.uFogDensity.value=m),this.roadRenderer){let w=W(1-(o+.05)/.28,0,1);this.roadRenderer.updateCrewAnimations(this.hydro.simTime||0,b,this.cityBodyMat?this.cityBodyMat.uniforms.uSunColor.value:p,this.cityBodyMat?this.cityBodyMat.uniforms.uSkyColor.value:this.skyColorZenith,this.fogColor,m,w)}this.livingWorld&&n>0&&this.livingWorld.update(n,t,c,b);let _=typeof performance<"u"?performance.now():Date.now();if(this.irrBeacon&&(this.irrBeacon.visible=!this.economy.agroIrrigated,this.irrBeacon.visible)){let v=(this.irrBeacon.userData.baseScale||1)*(1+Math.sin(_*.004)*.08);this.irrBeacon.scale.set(v,1,v)}if(this.tutorialBeacon&&this.tutorialBeacon.visible){let w=Math.pow(L.horizScale,.56),v=w*(1+Math.sin(_*.0055)*.1);this.tutorialBeacon.scale.set(v,w,v),this.tutorialBeacon.userData.pointer.position.y=21+Math.sin(_*.006)*2.8,this.tutorialBeacon.userData.pointer.rotation.y=_*.0022}return{isNight:o<.06,dayFactor:c}}updateCursor(t,e,i,n,s,o=6.2,a=!0){if(this.cursorGroup.visible=a,!a)return;let l=this.hydro.sampleAtWorld(t,e),c=Math.max(l.bed,l.surface)+.35*L.elevScale;this.cursorGroup.position.set(t,c,e),this.cursorRing.scale.set(i,i,1);let h=n==="spillway"||n==="nav_lock"||n.startsWith("turbine_");this.flowArrow.visible=h;let u=n==="concrete_dam"||n==="earth_dam"||n==="foundation";if(this.ghostVolume.visible=u,u){let d=(n==="concrete_dam"?o:n==="earth_dam"?4.2:6)*L.elevScale;this.ghostVolume.scale.set(i,d,i),this.ghostVolumeMat.color.setHex(n==="foundation"?16096779:16498468)}if(h){let{gx:d,gz:f}=this.hydro.worldToGrid(t,e),g=this.hydro.detectHydraulicDirection(d,f,s),y=Math.pow(L.horizScale,.55);this.flowArrow.scale.setScalar(y),this.flowArrow.rotation.y=-g.yaw,this.cursorRingMat.color.setHex(3462041)}else n==="canal_dig"||n==="fish_eco"?this.cursorRingMat.color.setHex(3718648):n==="concrete_dam"||n==="earth_dam"||n==="foundation"?this.cursorRingMat.color.setHex(16498468):n==="demolish"?this.cursorRingMat.color.setHex(15680580):this.cursorRingMat.color.setHex(10980346)}};var Xa=class{constructor(t,e=2800){this.max=e,this.head=0,this.positions=new Float32Array(this.max*3),this.velocities=new Float32Array(this.max*3),this.life=new Float32Array(this.max),this.maxLife=new Float32Array(this.max),this.sizes=new Float32Array(this.max),this.kinds=new Uint8Array(this.max);let i=new me;this.posAttr=new te(this.positions,3),this.posAttr.setUsage(Fe),this.sizeAttr=new te(this.sizes,1),this.sizeAttr.setUsage(Fe),this.alphaAttr=new te(new Float32Array(this.max),1),this.alphaAttr.setUsage(Fe),i.setAttribute("position",this.posAttr),i.setAttribute("aSize",this.sizeAttr),i.setAttribute("aAlpha",this.alphaAttr);let n=new Ne({transparent:!0,depthWrite:!1,blending:wn,uniforms:{uLight:{value:1},uPixelRatio:{value:Math.min(typeof window<"u"&&window.devicePixelRatio||1,2)}},vertexShader:`
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
      `});this.points=new Ys(i,n),this.points.frustumCulled=!1,this.points.matrixAutoUpdate=!1,t.add(this.points);let s=380;this.rainCount=s;let o=new Float32Array(s*6);this.rainSeeds=new Float32Array(s*3);for(let l=0;l<s;l++)this.rainSeeds[l*3]=(Math.random()-.5)*210,this.rainSeeds[l*3+1]=Math.random()*80,this.rainSeeds[l*3+2]=(Math.random()-.5)*210;let a=new me;this.rainAttr=new te(o,3),this.rainAttr.setUsage(Fe),a.setAttribute("position",this.rainAttr),this.rainMat=new yn({color:13624575,transparent:!0,opacity:.36,depthWrite:!1}),this.rainLines=new Hn(a,this.rainMat),this.rainLines.visible=!1,this.rainLines.frustumCulled=!1,t.add(this.rainLines)}spawn(t,e,i,n,s,o,a,l,c=1){let h=this.head;this.head=(this.head+1)%this.max;let u=h*3;this.positions[u]=t,this.positions[u+1]=e,this.positions[u+2]=i,this.velocities[u]=n,this.velocities[u+1]=s,this.velocities[u+2]=o,this.life[h]=l,this.maxLife[h]=l,this.sizes[h]=a,this.kinds[h]=c}spawnDigSplash(t,e,i,n=12){let s=Math.pow(L.horizScale,.55);for(let o=0;o<n;o++){let a=Math.random()*Math.PI*2,l=(1.5+Math.random()*4)*s*.65;this.spawn(t+(Math.random()-.5)*3*s,e+.5*L.elevScale,i+(Math.random()-.5)*3*s,Math.cos(a)*l,(2.5+Math.random()*4.5)*Math.sqrt(L.elevScale),Math.sin(a)*l,(1.1+Math.random()*.8)*s,.55+Math.random()*.35,1)}}update(t,e,i,n=1,s=0){this.points.material.uniforms.uLight.value=n;let o=Math.pow(L.horizScale,.52),a=e.jetEmitters;for(let u=0;u<a.length;u++){let d=a[u],f=d.kind==="spillway"?Math.ceil(4*d.intensity):Math.ceil(3*d.intensity);for(let g=0;g<f;g++){let y=(d.kind==="spillway"?2.4:3.2)*o;this.spawn(d.wx+(Math.random()-.5)*y,d.wy+Math.random()*.6*o,d.wz+(Math.random()-.5)*y,d.vx*(.85+Math.random()*.3)+(Math.random()-.5)*1.4*o,d.vy+(Math.random()-.3)*1.6,d.vz*(.85+Math.random()*.3)+(Math.random()-.5)*1.4*o,(d.kind==="spillway"?1.6+Math.random()*1.5:1.3+Math.random()*1.1)*o,.95+Math.random()*.55,1)}Math.random()<.65&&this.spawn(d.wx+d.vx*.5+(Math.random()-.5)*5*o,d.wy-.5,d.wz+d.vz*.5+(Math.random()-.5)*5*o,(Math.random()-.5)*1.2*o,(1.4+Math.random()*1.8)*Math.sqrt(L.elevScale),(Math.random()-.5)*1.2*o,(3.4+Math.random()*2.6)*o,1.5+Math.random()*.9,2)}let l=e.overflowEdges||[];if(l.length>0){let u=Math.min(l.length,6);for(let d=0;d<u;d++){let f=l[Math.floor(Math.random()*l.length)],g=Math.max(e.dx*.55,f.dropH*.42),y=f.wx+f.dirX*g*.85+(Math.random()-.5)*f.width,p=f.wz+f.dirZ*g*.85+(Math.random()-.5)*f.width;this.spawn(y,f.toeY+.5*o,p,f.dirX*(1.8+Math.random()*2.5)*o+(Math.random()-.5)*1.6*o,(2.2+Math.random()*3.4)*Math.sqrt(L.elevScale),f.dirZ*(1.8+Math.random()*2.5)*o+(Math.random()-.5)*1.6*o,(2.4+Math.random()*2.2)*o,1.15+Math.random()*.75,2)}}if(e.activeTileCount>0)for(let u=0;u<5;u++){let d=i.x+(Math.random()-.5)*260*o,f=i.z+(Math.random()-.5)*260*o;if(Math.abs(d)>=L.half*.96||Math.abs(f)>=L.half*.96)continue;let g=e.sampleAtWorld(d,f);g.depth>.18&&(g.froude>1.08||g.foam>.42)&&g.speed>2.2&&this.spawn(d,g.surface+.15*o,f,g.u*.35+(Math.random()-.5)*1.5*o,(1.6+Math.random()*2.6)*Math.sqrt(L.elevScale),g.v*.35+(Math.random()-.5)*1.5*o,(1.1+Math.random()*1.2)*o,.55+Math.random()*.45,1)}let c=this.alphaAttr.array,h=!1;for(let u=0;u<this.max;u++){let d=this.kinds[u];if(d===0){c[u]=0;continue}if(this.life[u]-=t,this.life[u]<=0){this.kinds[u]=0,c[u]=0;continue}h=!0;let f=u*3;d===1?(this.velocities[f]*=1-t*.35,this.velocities[f+1]-=L.gravity*t*.92,this.velocities[f+2]*=1-t*.35):(this.velocities[f]*=1-t*1.2,this.velocities[f+1]=Math.max(.3,this.velocities[f+1]-t*.9),this.velocities[f+2]*=1-t*1.2,this.sizes[u]+=t*1.4*o);let g=this.positions[f]+this.velocities[f]*t,y=this.positions[f+1]+this.velocities[f+1]*t,p=this.positions[f+2]+this.velocities[f+2]*t;if(this.positions[f]=g,this.positions[f+1]=y,this.positions[f+2]=p,d===1&&Math.abs(g)<L.size*.49&&Math.abs(p)<L.size*.49){let x=e.worldToGrid(g,p),S=x.gz*e.grid+x.gx,M=e.zb[S]+e.h[S];if(y<=M){e.foam[S]=Math.min(1,e.foam[S]+.35),this.kinds[u]=0,c[u]=0;continue}}let m=this.life[u]/(this.maxLife[u]||1);c[u]=d===1?Math.min(.78,m*1.2):Math.sin(m*Math.PI)*.24}if((h||a.length>0)&&(this.posAttr.needsUpdate=!0,this.sizeAttr.needsUpdate=!0,this.alphaAttr.needsUpdate=!0),s>.05){this.rainLines.visible=!0,this.rainMat.opacity=Math.min(.45,s*.35);let u=this.rainAttr.array,d=typeof performance<"u"?performance.now():Date.now(),f=Math.pow(L.horizScale,.55),g=d*.065%(70*f);for(let y=0;y<this.rainCount;y++){let p=y*3,m=i.x+this.rainSeeds[p]*f,x=this.rainSeeds[p+1]*f-g;x<0&&(x+=70*f),x+=i.y*.3+6*f;let S=i.z+this.rainSeeds[p+2]*f,M=y*6;u[M]=m,u[M+1]=x,u[M+2]=S,u[M+3]=m+.6*f,u[M+4]=x-3.8*f,u[M+5]=S+.4*f}this.rainAttr.needsUpdate=!0}else this.rainLines.visible=!1}};function Jd(r){if(r.code&&(r.code==="KeyW"||r.code==="KeyA"||r.code==="KeyS"||r.code==="KeyD"||r.code==="KeyQ"||r.code==="KeyE"||r.code==="ArrowUp"||r.code==="ArrowDown"||r.code==="ArrowLeft"||r.code==="ArrowRight"||r.code==="ShiftLeft"||r.code==="ShiftRight"))return r.code;let t=(r.key||"").toLowerCase();return t==="w"||t==="\u0446"?"KeyW":t==="a"||t==="\u0444"?"KeyA":t==="s"||t==="\u044B"?"KeyS":t==="d"||t==="\u0432"?"KeyD":t==="q"||t==="\u0439"?"KeyQ":t==="e"||t==="\u0443"?"KeyE":r.code||""}var Ya=class{constructor(t,e){this.camera=t,this.dom=e,this.target=new O(14*L.horizScale,28*L.elevScale,-64*L.horizScale),this.goalTarget=this.target.clone(),this.yaw=-.54,this.pitch=.67,this.distance=L.defaultDist||248,this.goalYaw=this.yaw,this.goalPitch=this.pitch,this.goalDist=this.distance,this._flight=null,this.keys=new Set,this.isOrbiting=!1,this.isPanning=!1,this.lastX=0,this.lastY=0,this.userMoved=!1,this.touches=new Map,this.prevPinchDist=0,this.syncToWorldScale(),this._bindEvents(),this.update(.016,22*L.elevScale,null)}syncToWorldScale(){this.camera.near=L.size>=5e3?4.5:1.5,this.camera.far=Math.max(4800,L.size*3.8),this.camera.updateProjectionMatrix(),this.goalDist=W(this.goalDist,L.minZoom,L.maxZoom)}clearKeys(){this.keys.clear()}_bindEvents(){window.addEventListener("keydown",e=>{let i=e.target&&e.target.tagName;if(i==="INPUT"||i==="SELECT"||i==="TEXTAREA")return;let n=Jd(e);n&&(this.keys.add(n),n.startsWith("Arrow")&&e.preventDefault())}),window.addEventListener("keyup",e=>{let i=Jd(e);i&&this.keys.delete(i)}),window.addEventListener("blur",()=>this.keys.clear()),document.addEventListener("visibilitychange",()=>{document.hidden&&this.keys.clear()}),this.dom.addEventListener("contextmenu",e=>e.preventDefault()),this.dom.addEventListener("mousedown",e=>{e.button===2?(this.isOrbiting=!0,this.lastX=e.clientX,this.lastY=e.clientY):e.button===1&&(this._flight=null,this.isPanning=!0,this.lastX=e.clientX,this.lastY=e.clientY)}),window.addEventListener("mousemove",e=>{if(this.isOrbiting){let i=e.clientX-this.lastX,n=e.clientY-this.lastY;this.lastX=e.clientX,this.lastY=e.clientY,this.goalYaw-=i*.0055,this.goalPitch=W(this.goalPitch+n*.0048,.16,1.4),this.userMoved=!0}else if(this.isPanning){let i=e.clientX-this.lastX,n=e.clientY-this.lastY;this.lastX=e.clientX,this.lastY=e.clientY,this._panByPixels(i,n),this.userMoved=!0}}),window.addEventListener("mouseup",e=>{e.button===2&&(this.isOrbiting=!1),e.button===1&&(this.isPanning=!1)}),this.dom.addEventListener("wheel",e=>{e.preventDefault();let i=e.deltaY>0?1.13:.885;this.goalDist=W(this.goalDist*i,L.minZoom,L.maxZoom),this._flight&&(this._flight.endDist=this.goalDist),this.userMoved=!0},{passive:!1}),this.dom.addEventListener("touchstart",e=>{for(let i of e.changedTouches)this.touches.set(i.identifier,{x:i.clientX,y:i.clientY});if(this.touches.size===2){this._flight=null;let i=[...this.touches.values()];this.prevPinchDist=Math.hypot(i[0].x-i[1].x,i[0].y-i[1].y)}},{passive:!0}),this.dom.addEventListener("touchmove",e=>{if(this.touches.size>=2){let i=[...this.touches.values()],n=(i[0].x+i[1].x)*.5,s=(i[0].y+i[1].y)*.5;for(let h of e.changedTouches)this.touches.set(h.identifier,{x:h.clientX,y:h.clientY});let o=[...this.touches.values()],a=(o[0].x+o[1].x)*.5,l=(o[0].y+o[1].y)*.5;this._panByPixels(a-n,l-s);let c=Math.hypot(o[0].x-o[1].x,o[0].y-o[1].y);this.prevPinchDist>10&&c>10&&(this.goalDist=W(this.goalDist*(this.prevPinchDist/c),L.minZoom,L.maxZoom)),this.prevPinchDist=c,this.userMoved=!0}},{passive:!0});let t=e=>{for(let i of e.changedTouches)this.touches.delete(i.identifier)};this.dom.addEventListener("touchend",t,{passive:!0}),this.dom.addEventListener("touchcancel",t,{passive:!0})}_panByPixels(t,e){this._flight=null;let i=this.distance*.00175,n=Math.sin(this.yaw),s=Math.cos(this.yaw);this.goalTarget.x-=(s*t+n*e)*i,this.goalTarget.z-=(-n*t+s*e)*i;let o=L.size*.485;this.goalTarget.x=W(this.goalTarget.x,-o,o),this.goalTarget.z=W(this.goalTarget.z,-o,o)}flyTo(t,e,i=L.defaultDist,n=20){let s=L.size*.485,o=W(t,-s,s),a=W(e,-s,s),l=Math.max(8,n+2.5),c=W(i,L.minZoom,L.maxZoom),h=Math.hypot(o-this.target.x,a-this.target.z);if(h<12){this._flight=null,this.goalTarget.set(o,l,a),this.goalDist=c;return}let u=W(.42+h/Math.max(600,L.size)*.52,.42,.92),d=Math.min(L.maxZoom*.42,h*.24);this._flight={elapsed:0,duration:u,startTarget:this.target.clone(),endTarget:new O(o,l,a),startDist:this.distance,endDist:c,arcLift:d},this.goalTarget.set(o,l,a),this.goalDist=c}updatePreviewOrbit(t,e=22){this._flight=null,this.goalYaw+=t*.1,this.goalPitch=.62,this.goalDist=W(L.defaultDist*1.18,L.minZoom,L.maxZoom),this.update(t,e,null)}update(t,e=18,i=null){let n=0,s=0;(this.keys.has("KeyW")||this.keys.has("ArrowUp"))&&(n+=1),(this.keys.has("KeyS")||this.keys.has("ArrowDown"))&&(n-=1),(this.keys.has("KeyD")||this.keys.has("ArrowRight"))&&(s+=1),(this.keys.has("KeyA")||this.keys.has("ArrowLeft"))&&(s-=1);let o=this.keys.has("ShiftLeft")||this.keys.has("ShiftRight")?2.15:1,a=(28*Math.sqrt(L.horizScale)+this.distance*.88)*o*t,l=Math.sin(this.yaw),c=Math.cos(this.yaw);if(n!==0||s!==0){this._flight&&(this.goalTarget.copy(this.target),this.goalDist=this.distance,this._flight=null);let p=Math.hypot(n,s);n/=p,s/=p,this.goalTarget.x+=(-l*n+c*s)*a,this.goalTarget.z+=(-c*n-l*s)*a;let m=L.size*.485;this.goalTarget.x=W(this.goalTarget.x,-m,m),this.goalTarget.z=W(this.goalTarget.z,-m,m),this.userMoved=!0}this.keys.has("KeyQ")&&(this.goalYaw+=1.65*t,this.userMoved=!0),this.keys.has("KeyE")&&(this.goalYaw-=1.65*t,this.userMoved=!0);let h=W(t*12,.06,1);if(this.yaw=$t(this.yaw,this.goalYaw,h),this.pitch=$t(this.pitch,this.goalPitch,h),this._flight){this._flight.elapsed+=t;let p=W(this._flight.elapsed/this._flight.duration,0,1),m=p*p*p*(p*(p*6-15)+10),x=4*p*(1-p);this.target.lerpVectors(this._flight.startTarget,this._flight.endTarget,m),this.target.y=Math.max(this.target.y,e+2.5)+this._flight.arcLift*.22*x,this.distance=$t(this._flight.startDist,this._flight.endDist,m)+this._flight.arcLift*x,p>=1&&(this.goalTarget.copy(this._flight.endTarget),this.goalDist=this._flight.endDist,this._flight=null)}else this.goalTarget.y=$t(this.goalTarget.y,Math.max(8,e+2.5),W(t*6.5,0,1)),this.distance=$t(this.distance,this.goalDist,h),this.target.lerp(this.goalTarget,h);let u=Math.cos(this.pitch)*this.distance,d=Math.sin(this.pitch)*this.distance,f=this.target.x+Math.sin(this.yaw)*u,g=this.target.z+Math.cos(this.yaw)*u,y=e+6;if(i){let p=i(f,g);y=Math.max(y,p+7.5*Math.pow(L.elevScale,.5))}this.camera.position.set(f,Math.max(y,this.target.y+d),g),this.camera.lookAt(this.target)}};var qa=class{constructor(){this.ctx=null,this.muted=!1,this.initialized=!1,this.masterGain=null,this.compressor=null,this.streamGain=null,this.streamFilter=null,this.spillGain=null,this.spillFilter=null,this.turbineGain=null,this.turbineOsc=null,this._lastSfxTime=0}unlock(){if(this.muted)return;if(this.initialized&&this.ctx){this.ctx.state==="suspended"&&this.ctx.resume().catch(()=>{});return}let t=window.AudioContext||window.webkitAudioContext;if(t)try{this.ctx=new t,this.ctx.state==="suspended"&&this.ctx.resume().catch(()=>{}),this.compressor=this.ctx.createDynamicsCompressor(),this.compressor.threshold.value=-18,this.compressor.knee.value=18,this.compressor.ratio.value=6,this.compressor.attack.value=.005,this.compressor.release.value=.18,this.masterGain=this.ctx.createGain(),this.masterGain.gain.value=.85,this.compressor.connect(this.masterGain),this.masterGain.connect(this.ctx.destination);let e=this.ctx.sampleRate,i=e*4,n=this.ctx.createBuffer(1,i,e),s=n.getChannelData(0),o=0,a=0,l=0,c=0;for(let f=0;f<i;f++){let g=Math.random()*2-1;o=.99765*o+g*.099046,a=.963*a+g*.2965164,l=.57*l+g*1.0526913;let y=(o+a+l+g*.1848)*.045;c=.94*c+.06*y;let p=f<1200?f/1200:f>i-1200?(i-f)/1200:1;s[f]=W(c*3.2,-.85,.85)*p+(1-p)*0}let h=this.ctx.createBufferSource();h.buffer=n,h.loop=!0,this.streamFilter=this.ctx.createBiquadFilter(),this.streamFilter.type="bandpass",this.streamFilter.frequency.value=340,this.streamFilter.Q.value=.65,this.streamGain=this.ctx.createGain(),this.streamGain.gain.value=.015,h.connect(this.streamFilter),this.streamFilter.connect(this.streamGain),this.streamGain.connect(this.compressor),h.start();let u=this.ctx.createBufferSource();u.buffer=n,u.loop=!0,u.playbackRate.value=.78,this.spillFilter=this.ctx.createBiquadFilter(),this.spillFilter.type="lowpass",this.spillFilter.frequency.value=320,this.spillGain=this.ctx.createGain(),this.spillGain.gain.value=0,u.connect(this.spillFilter),this.spillFilter.connect(this.spillGain),this.spillGain.connect(this.compressor),u.start(),this.turbineOsc=this.ctx.createOscillator(),this.turbineOsc.type="sine",this.turbineOsc.frequency.value=50;let d=this.ctx.createBiquadFilter();d.type="lowpass",d.frequency.value=105,this.turbineGain=this.ctx.createGain(),this.turbineGain.gain.value=0,this.turbineOsc.connect(d),d.connect(this.turbineGain),this.turbineGain.connect(this.compressor),this.turbineOsc.start(),this.initialized=!0}catch{}}toggleMute(){if(this.muted=!this.muted,!this.muted&&!this.initialized&&this.unlock(),this.ctx&&this.initialized&&this.masterGain){!this.muted&&this.ctx.state==="suspended"&&this.ctx.resume().catch(()=>{});let t=this.ctx.currentTime;this.masterGain.gain.cancelScheduledValues(t),this.masterGain.gain.setTargetAtTime(this.muted?0:.85,t,.06)}return this.muted}updateContinuous(t,e,i,n=1/0){if(!this.initialized||this.muted||!this.ctx||this.ctx.state==="suspended")return;let s=Math.max(180,L.defaultDist||920),o=W(1-(t-L.minZoom)/(s*1.45),.12,1),a=Math.max(0,e)/Math.max(1,L.flowScale*85),l=Math.max(0,i)/Math.max(1,L.powerScale*18),c=Number.isFinite(n)?W(1-n/(s*.85),0,1):o*.4,h=this.ctx.currentTime,u=W(.008+o*.024,.006,.034);this.streamGain.gain.setTargetAtTime(u,h,.18),this.streamFilter.frequency.setTargetAtTime(280+o*210,h,.18);let d=W(a*.042*(.25+.75*c)*o,0,.055),f=W(240+a*180+o*160,220,680);this.spillGain.gain.setTargetAtTime(d,h,.16),this.spillFilter.frequency.setTargetAtTime(f,h,.16);let g=l>.01?W(l*.016,.002,.015)*c*o:0;this.turbineGain.gain.setTargetAtTime(g,h,.2),this.turbineOsc.frequency.setTargetAtTime(50,h,.25)}playTone(t=440,e=.11,i="sine",n=.045,s=0){if(!(!this.initialized||this.muted||!this.ctx)){if(this.ctx.state==="suspended"){this.ctx.resume().catch(()=>{});return}try{let o=this.ctx.currentTime+s,a=this.ctx.createOscillator(),l=this.ctx.createGain();a.type=i==="sawtooth"?"triangle":i,a.frequency.setValueAtTime(t,o),l.gain.setValueAtTime(1e-4,o),l.gain.linearRampToValueAtTime(n,o+.008),l.gain.exponentialRampToValueAtTime(5e-4,o+e),a.connect(l),l.connect(this.compressor||this.ctx.destination),a.start(o),a.stop(o+e+.02)}catch{}}}playBuild(){let t=performance.now();t-this._lastSfxTime<65||(this._lastSfxTime=t,this.playTone(196,.075,"sine",.042,0),this.playTone(293.66,.095,"triangle",.032,.038))}playDig(){let t=performance.now();if(!(t-this._lastSfxTime<85)&&(this._lastSfxTime=t,!(!this.initialized||this.muted||!this.ctx||this.ctx.state==="suspended")))try{let e=this.ctx.currentTime,i=this.ctx.createOscillator(),n=this.ctx.createGain();i.type="sine",i.frequency.setValueAtTime(118+Math.random()*18,e),i.frequency.exponentialRampToValueAtTime(58,e+.075),n.gain.setValueAtTime(1e-4,e),n.gain.linearRampToValueAtTime(.045,e+.006),n.gain.exponentialRampToValueAtTime(5e-4,e+.08),i.connect(n),n.connect(this.compressor||this.ctx.destination),i.start(e),i.stop(e+.09)}catch{}}playMilestone(){this.playTone(523.25,.16,"sine",.048,0),this.playTone(659.25,.18,"sine",.045,.09),this.playTone(783.99,.26,"sine",.05,.18)}};var $a=class{constructor(t){this.game=t,this.active=!1,this.completed=!1,this.stepIndex=0,this.visitedGorge=!1,this.cardEl=document.getElementById("tutorial-card"),this.stepBadgeEl=document.getElementById("tut-step-badge"),this.titleEl=document.getElementById("tut-title"),this.bodyEl=document.getElementById("tut-body"),this.progFillEl=document.getElementById("tut-prog-fill"),this.progTextEl=document.getElementById("tut-prog-text"),this.rewardEl=document.getElementById("tut-reward"),this._bindButtons()}_getGorgeCoords(){let t=this.game.hydro.presetId||"bystritsa",i=In(t).gorges[0]||{x:12*L.horizScale,z:-158*L.horizScale};return{x:i.x,z:i.z}}_getSteps(){let t=this._getGorgeCoords(),e=L.horizScale,i=Math.pow(e,.68),n=L.powerScale;return[{id:"recon",title:"\u0420\u0430\u0437\u0432\u0435\u0434\u043A\u0430 \u0443\u0449\u0435\u043B\u044C\u044F \u0438 \u0433\u0435\u043E\u0434\u0435\u0437\u0438\u044F",toolId:"inspect",reward:2e3,target:{x:t.x,z:t.z,dist:128*i},body:"\u041F\u0435\u0440\u0435\u043B\u0435\u0442\u0438\u0442\u0435 \u043A \u0441\u043A\u0430\u043B\u044C\u043D\u043E\u043C\u0443 \u0443\u0449\u0435\u043B\u044C\u044E \u043A\u043D\u043E\u043F\u043A\u043E\u0439 <b>\xAB\u2316 \u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u043C\u0435\u0441\u0442\u043E\xBB</b> (\u0438\u043B\u0438 \u043A\u043B\u0430\u0432\u0438\u0448\u0430\u043C\u0438 <code>WASD</code> + \u043A\u043E\u043B\u0435\u0441\u043E \u043C\u044B\u0448\u0438) \u0438 \u0432\u043A\u043B\u044E\u0447\u0438\u0442\u0435 \u0438\u0437\u043E\u043B\u0438\u043D\u0438\u0438 \u0432\u044B\u0441\u043E\u0442 <b>[\u2261 \u0412\u044B\u0441\u043E\u0442\u044B]</b> (<code>C</code>), \u0447\u0442\u043E\u0431\u044B \u0443\u0432\u0438\u0434\u0435\u0442\u044C \u043A\u0430\u043C\u0435\u043D\u043D\u044B\u0435 \u0449\u0451\u043A\u0438 \u043A\u0430\u043D\u044C\u043E\u043D\u0430.",progress:()=>{Math.hypot(this.game.camCtrl.target.x-t.x,this.game.camCtrl.target.z-t.z)<98*e&&(this.visitedGorge=!0);let o=(this.visitedGorge?.6:0)+(this.game.showContours?.4:0);return{ratio:W(o,0,1),label:this.visitedGorge?this.game.showContours?"\u0421\u0442\u0432\u043E\u0440 \u0438\u0437\u0443\u0447\u0435\u043D!":"\u0412\u043A\u043B\u044E\u0447\u0438\u0442\u0435 \u0438\u0437\u043E\u043B\u0438\u043D\u0438\u0438 [C] \u0438\u043B\u0438 \u043D\u0430\u0436\u043C\u0438\u0442\u0435 \xAB\u0414\u0430\u043B\u0435\u0435\xBB":"\u041D\u0430\u0432\u0435\u0434\u0438\u0442\u0435 \u043A\u0430\u043C\u0435\u0440\u0443 \u043D\u0430 \u0443\u0449\u0435\u043B\u044C\u0435 \xAB\u0412\u043E\u0440\u043E\u0442\u0430 \u0413\u0440\u043E\u043C\u0430\xBB",done:this.visitedGorge&&this.game.showContours}}},{id:"volumetric_dam",title:"\u041E\u0431\u044A\u0451\u043C\u043D\u0430\u044F 3D-\u043F\u043B\u043E\u0442\u0438\u043D\u0430 \u0438 \u043F\u0435\u0440\u0435\u043B\u0438\u0432",toolId:"concrete_dam",reward:5e3,target:{x:t.x,z:t.z,dist:124*i},body:"\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 <b>[5] 3D \u041F\u043B\u043E\u0442\u0438\u043D\u0430</b>, \u0443\u043A\u0430\u0436\u0438\u0442\u0435 \u044F\u0440\u0443\u0441 \u0432\u044B\u0441\u043E\u0442\u044B \u0438 \u043F\u0440\u043E\u0442\u044F\u043D\u0438\u0442\u0435 \u041B\u041A\u041C \u043E\u0442 \u043B\u0435\u0432\u043E\u0439 \u0441\u043A\u0430\u043B\u044B \u0443\u0449\u0435\u043B\u044C\u044F \u043A \u043F\u0440\u0430\u0432\u043E\u0439. \u041F\u0440\u0438 \u043D\u0430\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u0438 \u0432\u043E\u0434\u043E\u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0430 \u0432\u044B \u0443\u0432\u0438\u0434\u0438\u0442\u0435 \u0436\u0438\u0432\u043E\u0439 3D-\u043F\u0435\u0440\u0435\u043B\u0438\u0432 \u0432\u043E\u0434\u044B \u0447\u0435\u0440\u0435\u0437 \u0433\u0440\u0435\u0431\u0435\u043D\u044C!",progress:()=>{let s=this.game.hydro.damCellCount;return{ratio:W(s/6,0,1),label:`\u0412\u043E\u0437\u0432\u0435\u0434\u0435\u043D\u043E \u043E\u0431\u044A\u0451\u043C\u043D\u044B\u0445 \u0441\u0435\u043A\u0446\u0438\u0439 \u043F\u043B\u043E\u0442\u0438\u043D\u044B: ${Math.min(s,6)} / 6`,done:s>=6}}},{id:"buttress_spillway",title:"\u041A\u043E\u043D\u0442\u0440\u0444\u043E\u0440\u0441\u044B \u0438 3D-\u0432\u043E\u0434\u043E\u0441\u0431\u0440\u043E\u0441",toolId:"foundation",reward:4500,target:{x:t.x,z:t.z+8*e,dist:122*i},body:"\u0412\u044B\u0441\u043E\u043A\u0438\u0439 \u043D\u0430\u043F\u043E\u0440 \u0432\u044B\u0437\u044B\u0432\u0430\u0435\u0442 \u0444\u0438\u043B\u044C\u0442\u0440\u0430\u0446\u0438\u044E \u0414\u0430\u0440\u0441\u0438 \u043F\u043E\u0434 \u043E\u0441\u043D\u043E\u0432\u0430\u043D\u0438\u0435\u043C! \u0423\u043A\u0440\u0435\u043F\u0438\u0442\u0435 \u043F\u043B\u043E\u0442\u0438\u043D\u0443 \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u043E\u043C <b>[6] \u041A\u043E\u043D\u0442\u0440\u0444\u043E\u0440\u0441</b> \u0438 \u0432\u0440\u0435\u0436\u044C\u0442\u0435 \u0441\u0431\u043E\u043A\u0443 <b>[7] \u0412\u043E\u0434\u043E\u0441\u0431\u0440\u043E\u0441</b> \u0441 3D-\u043B\u043E\u0442\u043A\u043E\u043C \u0438 \u043D\u043E\u0441\u043A\u043E\u043C-\u0442\u0440\u0430\u043C\u043F\u043B\u0438\u043D\u043E\u043C.",progress:()=>{let s=this.game.hydro.reinforcedCellCount,o=this.game.hydro.spillways.length;return{ratio:W(Math.min(1,s/3)*.5+(o>0?.5:0),0,1),label:`\u041A\u043E\u043D\u0442\u0440\u0444\u043E\u0440\u0441\u044B: ${Math.min(s,3)}/3 \xB7 \u0412\u043E\u0434\u043E\u0441\u0431\u0440\u043E\u0441: ${o}/1`,done:s>=3&&o>=1}}},{id:"turbine_launch",title:"\u041F\u0440\u0438\u043F\u043B\u043E\u0442\u0438\u043D\u043D\u0430\u044F \u0413\u042D\u0421 \u0432 \u043D\u0438\u0436\u043D\u0435\u043C \u0431\u044C\u0435\u0444\u0435",toolId:"turbine_kaplan",reward:6500,target:{x:t.x,z:t.z,dist:118*i},body:"\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 <b>[8] \u041A\u0430\u043F\u043B\u0430\u043D</b>, <b>[9] \u0424\u0440\u044D\u043D\u0441\u0438\u0441</b> \u0438\u043B\u0438 <b>[0] \u0413\u0410\u042D\u0421</b> \u0438 \u043A\u043B\u0438\u043A\u043D\u0438\u0442\u0435 \u043F\u043E \u043F\u043B\u043E\u0442\u0438\u043D\u0435: \u0432\u043E\u0434\u043E\u043F\u0440\u0438\u0451\u043C\u043D\u0438\u043A \u0432\u0441\u0442\u0430\u043D\u0435\u0442 \u0432 \u0432\u0435\u0440\u0445\u043D\u0435\u043C \u0431\u044C\u0435\u0444\u0435, \u0441\u0442\u0430\u043B\u044C\u043D\u044B\u0435 \u0432\u043E\u0434\u043E\u0432\u043E\u0434\u044B \u043F\u043E\u0439\u0434\u0443\u0442 \u0432\u043D\u0438\u0437, \u0430 \u043C\u0430\u0448\u0437\u0430\u043B \u0430\u043A\u043A\u0443\u0440\u0430\u0442\u043D\u043E \u0440\u0430\u0437\u043C\u0435\u0441\u0442\u0438\u0442\u0441\u044F \u0443 \u043F\u043E\u0434\u043D\u043E\u0436\u0438\u044F \u0432 \u043D\u0438\u0436\u043D\u0435\u043C \u0431\u044C\u0435\u0444\u0435!",progress:()=>{let s=this.game.hydro.turbines.length>0,o=+(.35*n).toFixed(1),a=Math.max(this.game.economy.totalMW,this.game.economy.pumpedConsumeMW);return{ratio:W((s?.45:0)+Math.min(.55,a/Math.max(.1,o)*.55),0,1),label:s?`\u0412\u044B\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u0413\u042D\u0421: ${a.toFixed(1)} / ${o} \u041C\u0412\u0442`:"\u0423\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u0435 \u0433\u0438\u0434\u0440\u043E\u0430\u0433\u0440\u0435\u0433\u0430\u0442 \u0432 \u0441\u0442\u0432\u043E\u0440 \u043F\u043B\u043E\u0442\u0438\u043D\u044B",done:s&&a>=o}}},{id:"substation_grid",title:"\u041E\u0420\u0423 220 \u043A\u0412, \u0448\u043B\u044E\u0437\u044B \u0438 8 \u0433\u043E\u0440\u043E\u0434\u043E\u0432",toolId:"powerline",reward:5500,target:{x:t.x+36*e,z:t.z+16*e,dist:145*i},body:"\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 <b>[P] \u041E\u0420\u0423 / \u041B\u042D\u041F</b> \u0438 \u043A\u043B\u0438\u043A\u043D\u0438\u0442\u0435 \u043D\u0430 \u0441\u0443\u0445\u043E\u043C \u0431\u0435\u0440\u0435\u0433\u0443 \u0440\u044F\u0434\u043E\u043C \u0441 \u0413\u042D\u0421, \u0447\u0442\u043E\u0431\u044B \u0432\u043E\u0437\u0432\u0435\u0441\u0442\u0438 <b>3D-\u043F\u043E\u0434\u0441\u0442\u0430\u043D\u0446\u0438\u044E \u041E\u0420\u0423</b> (\u0441\u043D\u0438\u0436\u0430\u0435\u0442 \u043F\u043E\u0442\u0435\u0440\u0438 \u0441 16% \u0434\u043E 3%), \u0437\u0430\u0442\u0435\u043C \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0438\u0442\u0435 \u0435\u0449\u0451 \u043E\u0434\u0438\u043D \u0433\u043E\u0440\u043E\u0434 \u0441\u043F\u0440\u0430\u0432\u0430 (\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440 \u0410\u043B\u044E\u043C\u0433\u0440\u0430\u0434 \u0438\u043B\u0438 \u0422\u0435\u0445\u043D\u043E\u043F\u0430\u0440\u043A \u0418\u0418)!",progress:()=>{let s=this.game.hydro.substations.length,o=this.game.economy.cities.filter(l=>l.connected).length;return{ratio:W((s>0?.5:0)+(o>=2?.5:0),0,1),label:`\u041F\u043E\u0434\u0441\u0442\u0430\u043D\u0446\u0438\u044F \u041E\u0420\u0423: ${Math.min(1,s)}/1 \xB7 \u0413\u043E\u0440\u043E\u0434\u043E\u0432 \u0432 \u0441\u0435\u0442\u0438: ${o}/2`,done:s>=1||o>=2}}},{id:"custom_canal",title:"\u0421\u0432\u043E\u0439 \u043A\u0430\u043D\u0430\u043B, \u0448\u043B\u044E\u0437 [L] \u0438\u043B\u0438 \u0440\u044B\u0431\u0445\u043E\u0437 [F]",toolId:"canal_dig",reward:6500,target:{x:146*e,z:72*e,dist:140*i},body:"\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 <b>[2] \u041A\u0430\u043D\u0430\u043B</b> (\u0441 <code>Shift</code> \u0434\u043B\u044F \u0440\u043E\u0432\u043D\u043E\u0433\u043E \u0434\u043D\u0430!) \u0438 \u043F\u0440\u043E\u0440\u043E\u0439\u0442\u0435 \u0440\u0443\u0441\u043B\u043E \u043A \u0437\u0435\u043B\u0451\u043D\u043E\u043C\u0443 \u043A\u043E\u043B\u044C\u0446\u0443 \u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u044B \u2014 \u043B\u0438\u0431\u043E \u043F\u043E\u0441\u0442\u0440\u043E\u0439\u0442\u0435 <b>[L] \u0428\u043B\u044E\u0437</b> / <b>[F] \u0420\u044B\u0431\u0445\u043E\u0437</b> \u0434\u043B\u044F \u043D\u043E\u0432\u044B\u0445 \u0438\u0441\u0442\u043E\u0447\u043D\u0438\u043A\u043E\u0432 \u0434\u043E\u0445\u043E\u0434\u0430!",progress:()=>{let s=this.game.hydro.excavatedNormM3,o=this.game.hydro.navLocks.length+this.game.hydro.fishFarms.length,a=o>0?1:W(s/220,0,1);return{ratio:a,label:o>0?"\u041F\u043E\u0441\u0442\u0440\u043E\u0435\u043D \u0448\u043B\u044E\u0437 / \u0440\u044B\u0431\u0445\u043E\u0437!":`\u041F\u0440\u043E\u0433\u0440\u0435\u0441\u0441 \u0437\u0435\u043C\u043B\u044F\u043D\u044B\u0445 \u0440\u0430\u0431\u043E\u0442 \u043A\u0430\u043D\u0430\u043B\u0430: ${Math.round(a*100)}%`,done:o>0||s>=220}}},{id:"spot_dispatch",title:"\u042D\u043D\u0435\u0440\u0433\u043E\u0440\u044B\u043D\u043E\u043A, \u0413\u0410\u042D\u0421 \u0438 \u0432\u043E\u0434\u043D\u044B\u0439 \u0431\u0430\u043B\u0430\u043D\u0441",toolId:"inspect",reward:4e3,target:{x:t.x,z:t.z,dist:115*i},body:"\u0418\u0437\u0443\u0447\u0438\u0442\u0435 \u0432\u043A\u043B\u0430\u0434\u043A\u0443 <b>\xAB\u0412\u043E\u0434\u0430 \u0438 12 \u0434\u043E\u0445\u043E\u0434\u043E\u0432\xBB</b> \u0441\u043F\u0440\u0430\u0432\u0430, \u0430 \u0437\u0430\u0442\u0435\u043C \u0432\u044B\u0431\u0435\u0440\u0438\u0442\u0435 <b>[1] \u041E\u0441\u043C\u043E\u0442\u0440</b>, \u043A\u043B\u0438\u043A\u043D\u0438\u0442\u0435 \u043F\u043E \u043C\u0430\u0448\u0437\u0430\u043B\u0443 \u0413\u042D\u0421 \u0438 \u0432\u043A\u043B\u044E\u0447\u0438\u0442\u0435 <b>\xAB\u0410\u0432\u0442\u043E-\u0434\u0438\u0441\u043F\u0435\u0442\u0447\u0435\u0440\xBB</b> \u0438\u043B\u0438 <b>\xAB\u041D\u043E\u0447\u043D\u0443\u044E \u0437\u0430\u043A\u0430\u0447\u043A\u0443 \u0413\u0410\u042D\u0421\xBB</b>!",progress:()=>{let s=this.game.hydro.turbines.some(o=>o.autoDispatch||o.pumpedStorage);return{ratio:s?1:.2,label:s?"\u0418\u043D\u0442\u0435\u043B\u043B\u0435\u043A\u0442\u0443\u0430\u043B\u044C\u043D\u044B\u0439 \u0440\u0435\u0436\u0438\u043C \u0413\u042D\u0421/\u0413\u0410\u042D\u0421 \u0430\u043A\u0442\u0438\u0432\u0435\u043D!":"\u041E\u0442\u043A\u0440\u043E\u0439\u0442\u0435 \u0438\u043D\u0441\u043F\u0435\u043A\u0442\u043E\u0440 \u0413\u042D\u0421 \u0438 \u0432\u043A\u043B\u044E\u0447\u0438\u0442\u0435 \u0410\u0432\u0442\u043E-\u0434\u0438\u0441\u043F\u0435\u0442\u0447\u0435\u0440 / \u0413\u0410\u042D\u0421",done:s}}},{id:"master_diploma",title:"\u041F\u043E\u0432\u0435\u043B\u0438\u0442\u0435\u043B\u044C \u0440\u0435\u0447\u043D\u043E\u0433\u043E \u0431\u0430\u0441\u0441\u0435\u0439\u043D\u0430!",toolId:"turbine_francis",reward:12e3,target:{x:168*e,z:98*e,dist:165*i},body:`\u0424\u0438\u043D\u0430\u043B\u044C\u043D\u044B\u0439 \u044D\u043A\u0437\u0430\u043C\u0435\u043D: \u0434\u043E\u0432\u0435\u0434\u0438\u0442\u0435 \u0432\u044B\u0440\u0430\u0431\u043E\u0442\u043A\u0443 \u043A\u0430\u0441\u043A\u0430\u0434\u0430 \u0434\u043E <b>${(1.4*n).toFixed(0)} \u041C\u0412\u0442</b> \u0418\u041B\u0418 \u043F\u043E\u0434\u0430\u0439\u0442\u0435 \u0432\u043E\u0434\u0443 \u043A\u0430\u043D\u0430\u043B\u043E\u043C \u0432 \u043E\u0440\u043E\u0441\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u0431\u0430\u0441\u0441\u0435\u0439\u043D <b>\u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u044B</b>!`,progress:()=>{let s=1.4*n,o=this.game.economy.totalMW,a=this.game.economy.agroIrrigated;return{ratio:a?1:W(o/s,0,1),label:a?"\u041E\u0440\u043E\u0448\u0435\u043D\u0438\u0435 \u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u044B \u0437\u0430\u043F\u0443\u0449\u0435\u043D\u043E!":`\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C \u0413\u042D\u0421: ${o.toFixed(1)} / ${s.toFixed(0)} \u041C\u0412\u0442`,done:a||o>=s}}}]}_bindButtons(){let t=document.getElementById("tut-btn-fly"),e=document.getElementById("tut-btn-equip"),i=document.getElementById("tut-btn-skip"),n=document.getElementById("tut-close"),s=document.getElementById("btn-tutorial");t&&t.addEventListener("click",()=>{let o=this._getSteps()[this.stepIndex];if(!o)return;let a=this.game.hydro.sampleAtWorld(o.target.x,o.target.z).bed;this.game.camCtrl.flyTo(o.target.x,o.target.z,o.target.dist,a),o.id==="recon"&&(this.visitedGorge=!0)}),e&&e.addEventListener("click",()=>{let o=this._getSteps()[this.stepIndex];o&&(o.id==="recon"&&!this.game.showContours&&this.game.toggleContours(),o.toolId&&this.game.selectTool(o.toolId))}),i&&i.addEventListener("click",()=>{this._advanceStep(!0)}),n&&n.addEventListener("click",()=>{this.stop()}),s&&s.addEventListener("click",()=>{this.active?this.stop():(this.completed&&(this.stepIndex=0),this.start(this.stepIndex))})}start(t=0){this.active=!0,this.completed=!1,this.stepIndex=t,this.cardEl&&this.cardEl.classList.remove("hidden");let e=document.getElementById("btn-tutorial");e&&e.classList.add("active"),this._renderCurrentStep(!0)}stop(){this.active=!1,this.cardEl&&this.cardEl.classList.add("hidden");let t=document.getElementById("btn-tutorial");t&&t.classList.remove("active"),this._clearToolHighlight(),this.game.worldView.setTutorialTarget(0,0,!1)}_clearToolHighlight(){document.querySelectorAll(".tool-slot.tut-pulse").forEach(t=>t.classList.remove("tut-pulse"))}_renderCurrentStep(t=!1){let e=this._getSteps(),i=e[this.stepIndex];if(!i){this._finishAll();return}if(this.stepBadgeEl.textContent=`\u041E\u0411\u0423\u0427\u0415\u041D\u0418\u0415 \xB7 \u0428\u0410\u0413 ${this.stepIndex+1} \u0418\u0417 ${e.length}`,this.titleEl.textContent=i.title,this.bodyEl.innerHTML=i.body,this.rewardEl.textContent=`\u041F\u0440\u0435\u043C\u0438\u044F: +${i.reward.toLocaleString("ru-RU")} \u20BD`,this._clearToolHighlight(),i.toolId){let n=document.querySelector(`.tool-slot[data-tool="${i.toolId}"]`);n&&n.classList.add("tut-pulse")}if(this.game.worldView.setTutorialTarget(i.target.x,i.target.z,!0),t&&this.stepIndex===0){let n=this.game.hydro.sampleAtWorld(i.target.x,i.target.z).bed;this.game.camCtrl.flyTo(i.target.x,i.target.z,i.target.dist*1.12,n)}this.update()}_advanceStep(t=!1){let e=this._getSteps(),i=e[this.stepIndex];i&&!t&&(this.game.economy.earn(i.reward),this.game.audio.playMilestone(),this.game.notify(`\u2726 \u0428\u0430\u0433 \u043E\u0431\u0443\u0447\u0435\u043D\u0438\u044F \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D: \xAB${i.title}\xBB (+${i.reward.toLocaleString("ru-RU")} \u20BD)!`,"good")),this.stepIndex++,this.stepIndex>=e.length?this._finishAll():this._renderCurrentStep(!1)}_finishAll(){this.completed=!0,this.active=!1,this._clearToolHighlight(),this.game.worldView.setTutorialTarget(0,0,!1),this.cardEl&&this.cardEl.classList.add("hidden");let t=document.getElementById("btn-tutorial");t&&t.classList.remove("active"),this.game.notify("\u2605 \u041F\u043E\u0437\u0434\u0440\u0430\u0432\u043B\u044F\u0435\u043C! \u0412\u044B \u043E\u043A\u043E\u043D\u0447\u0438\u043B\u0438 \u0428\u043A\u043E\u043B\u0443 \u0413\u043B\u0430\u0432\u043D\u043E\u0433\u043E \u0413\u0438\u0434\u0440\u043E\u0441\u0442\u0440\u043E\u0438\u0442\u0435\u043B\u044F \u0438 \u043E\u0441\u0432\u043E\u0438\u043B\u0438 \u0432\u0435\u0441\u044C \u043A\u0430\u0441\u043A\u0430\u0434!","good");try{localStorage.setItem("cascade.tutorialDone","1")}catch{}}update(){if(!this.active)return;let e=this._getSteps()[this.stepIndex];if(!e)return;let i=e.progress();this.progFillEl&&(this.progFillEl.style.width=`${Math.round(i.ratio*100)}%`),this.progTextEl&&(this.progTextEl.textContent=i.label),i.done&&this._advanceStep(!1)}};var jd={inspect:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#38bdf8" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M11 8v6M8 11h6"/></svg>',canal_dig:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#22d3ee" stroke-width="2"><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/><path d="M2 21h20"/></svg>',canal_liner:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#cbd5e1" stroke-width="2"><path d="M2 7h3l3 10h8l3-10h3"/><path d="M7 13h10"/><path d="M5 19h14" stroke="#38bdf8"/></svg>',earth_dam:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#d97706" stroke-width="2"><path d="M2 19L9 7h6l7 12H2z"/><path d="M6 19l4-7h4l4 7"/></svg>',concrete_dam:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#f8fafc" stroke-width="2"><path d="M3 20L6 5h12l3 15H3z"/><path d="M5 10h14M4 15h16M12 5v15" stroke="#94a3b8" stroke-width="1.5"/></svg>',foundation:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M4 20V6h6l10 14H4z"/><path d="M7 20v3M12 20v3M17 20v3" stroke="#fbbf24"/><path d="M4 12h9"/></svg>',spillway:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M4 5v14M20 5v14M4 9h16"/><path d="M7 11c2 4 5 5 10 8" stroke="#67e8f9"/><path d="M6 15c2 2 5 3 8 4" stroke="#bae6fd"/></svg>',turbine_kaplan:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#60a5fa" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v6M12 16v6M2 12h6M16 12h6"/></svg>',turbine_francis:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fbbf24" stroke-width="2"><polygon points="13 2 4 14 11 14 10 22 20 10 13 10 13 2"/></svg>',turbine_pelton:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#34d399" stroke-width="2"><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1"/></svg>',nav_lock:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M3 16l3 4h12l3-4H3z"/><path d="M7 16v-5h10v5M12 7v4"/><path d="M2 21c3-1 5 1 8 0s5-1 8 0 4 0 4 0" stroke="#7dd3fc"/></svg>',fish_eco:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#2dd4bf" stroke-width="2"><path d="M3 12c3-5 10-6 15-1-5 5-12 4-15 1z"/><path d="M18 11l4-3v6l-4-3z"/><circle cx="8" cy="11.5" r="1" fill="#2dd4bf"/></svg>',powerline:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fde047" stroke-width="2"><path d="M12 3L7 21M12 3l5 18M5 9h14M7 14h10"/></svg>',demolish:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#f87171" stroke-width="2"><path d="M5 5l14 14M19 5L5 19"/></svg>'};var Cc=["normal","rain","flood","low_water"],Rc=[0,1,2,5];function Ui(){return new Promise(r=>requestAnimationFrame(()=>r()))}var Ic=class{constructor(){this.canvas=document.getElementById("scene"),this.device=Fd();let t=Ud(),e=this._loadSetting("quality",null),i=t?"low":e||this.device.recommendedQuality;this.profile=Ca[i]||Ca.medium,this.selectedScaleId="km5",Ra(this.selectedScaleId),this.selectedPresetId="bystritsa",this.selectedMode="standard",this.activeSideTab="cities",this.isInPreGameLoader=!0,this.isLoadingMap=!0,this.ready=!1,this.audio=new qa,this._initRenderer(),this.scene=new Vs,this.camera=new ti(46,window.innerWidth/window.innerHeight,2,28500),this.camCtrl=new Ya(this.camera,this.canvas),this.activeToolId="concrete_dam",this.brushSizeIndex=1,this.brushRadius=L.brushSizes[1],this.damTierIndex=1,this.manualYaw=null,this.showContours=!1,this.speedIndex=1,this.selectedStruct=null,this.pointerDown=!1,this.lastBrushWorld=null,this.lockedGradeElev=null,this.hoverWorld=null,this.showDiag=!1,this.fps=60,this._fpsFrames=0,this._fpsAccum=0,this._frameCount=0,this._uiRefreshAccum=0,this._lastTime=performance.now(),this._onResize(),window.addEventListener("resize",()=>this._onResize()),this._bindLoaderUI(),this._bootAsync()}_setLoaderProgress(t,e){let i=document.getElementById("loader-bar-fill"),n=document.getElementById("loader-stage"),s=document.getElementById("loader-pct");i&&(i.style.width=`${t}%`),n&&(n.textContent=e),s&&(s.textContent=`${Math.round(t)}%`)}_syncScaleLabelsInUI(){let t=Rn[this.selectedScaleId]||Rn.km5,e=document.getElementById("hud-scale-badge");e&&(e.textContent=t.short);let i=document.getElementById("scen-meta-bystritsa"),n=document.getElementById("scen-meta-rapids"),s=document.getElementById("scen-meta-delta");i&&(i.textContent=`${t.short} \xB7 ${t.areaKm2} \xB7 3 \u0440\u0435\u043A\u0438 \u0438 \u043B\u0435\u0434\u043D\u0438\u043A\u0438`),n&&(n.textContent=`${t.short} \xB7 ${t.areaKm2} \xB7 \u0414\u0432\u043E\u0439\u043D\u043E\u0439 \u043A\u0430\u043D\u044C\u043E\u043D \u0413\u0410\u042D\u0421`),s&&(s.textContent=`${t.short} \xB7 ${t.areaKm2} \xB7 \u0421\u0443\u0434\u043E\u0445\u043E\u0434\u043D\u043E\u0435 \u0440\u0443\u0441\u043B\u043E`);for(let o=0;o<3;o++){let a=document.getElementById(`brush-btn-${o}`);a&&(a.textContent=`${Math.round(L.brushSizes[o]*2)}\u043C`);let l=document.getElementById(`tier-btn-${o}`),c=Math.round((Ee.damHeightTiers[o]?.addHeight||11)*L.elevScale);l&&(l.textContent=`+${c}\u043C`)}this.brushRadius=L.brushSizes[this.brushSizeIndex]||L.brushSizes[1]}_bindLoaderUI(){let t=document.getElementById("btn-enter-valley"),e=document.getElementById("pill-mode-std"),i=document.getElementById("pill-mode-cre"),n=document.getElementById("chk-start-tutorial");n&&this._loadSetting("tutorialDone","")==="1"&&(n.checked=!1),document.querySelectorAll(".scale-card").forEach(o=>{o.addEventListener("click",()=>{if(this.isLoadingMap)return;let a=o.dataset.scale;!a||a===this.selectedScaleId||(this.selectedScaleId=a,Ra(a),this.camCtrl.syncToWorldScale(),this._syncScaleLabelsInUI(),document.querySelectorAll(".scale-card").forEach(l=>l.classList.remove("active")),o.classList.add("active"),this.loadValleyMapAsync(this.selectedPresetId))})}),document.querySelectorAll(".scenario-card").forEach(o=>{o.addEventListener("click",()=>{if(this.isLoadingMap)return;let a=o.dataset.preset;!a||a===this.selectedPresetId||(document.querySelectorAll(".scenario-card").forEach(l=>l.classList.remove("active")),o.classList.add("active"),this.loadValleyMapAsync(a))})});let s=o=>{this.selectedMode=o,e.classList.toggle("active",o==="standard"),i.classList.toggle("active",o==="creative")};e.addEventListener("click",()=>s("standard")),i.addEventListener("click",()=>s("creative")),t.addEventListener("click",()=>{this.isLoadingMap||(this.audio.unlock(),this.enterValley())})}async _bootAsync(){let t=document.getElementById("btn-enter-valley");t&&(t.disabled=!0,t.textContent="\u0413\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u044F \u0431\u0430\u0441\u0441\u0435\u0439\u043D\u0430\u2026"),this._syncScaleLabelsInUI(),this._setLoaderProgress(10,"\u0421\u0438\u043D\u0442\u0435\u0437 \u0442\u0435\u043A\u0441\u0442\u0443\u0440\u044B \u0432\u043E\u0434\u044B 512\xD7512, \u043C\u0435\u0433\u0430-\u0430\u0442\u043B\u0430\u0441\u0430 64 \u0444\u0430\u0441\u0430\u0434\u043E\u0432 \u0438 432 \u043F\u0440\u0435\u0441\u0435\u0442\u043E\u0432 \u043E\u0442\u0442\u0435\u043D\u043A\u043E\u0432\u2026"),await Ui(),this.textures=Ba(this.renderer);let e=Rn[this.selectedScaleId];this._setLoaderProgress(24,`\u0412\u044B\u0434\u0435\u043B\u0435\u043D\u0438\u0435 \u043F\u0430\u043C\u044F\u0442\u0438 \u0443\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u0439 \u0421\u0435\u043D-\u0412\u0435\u043D\u0430\u043D\u0430 (${e.label})\u2026`),await Ui(),this.hydro=new Na(this.profile.grid,this.selectedPresetId,!0);let i=this.hydro.grid,n=Math.floor(i/3),s=Math.floor(i*2/3);this._setLoaderProgress(40,"\u0413\u0435\u043E\u0434\u0435\u0437\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u0441\u044A\u0451\u043C\u043A\u0430 \u043B\u0435\u0434\u043D\u0438\u043A\u043E\u0432\u044B\u0445 \u0445\u0440\u0435\u0431\u0442\u043E\u0432 \u0438 \u0441\u043A\u0430\u043B\u044C\u043D\u044B\u0445 \u0443\u0449\u0435\u043B\u0438\u0439 (1/3)\u2026"),await Ui(),Pn(i,this.hydro,this.selectedPresetId,0,n),this._setLoaderProgress(56,"\u0424\u043E\u0440\u043C\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u0442\u0435\u0440\u0440\u0430\u0441 \u043F\u043E\u0434 8 \u0433\u043E\u0440\u043E\u0434\u043E\u0432 \u0438 \u0434\u0435\u0440\u0438\u0432\u0430\u0446\u0438\u043E\u043D\u043D\u043E\u0433\u043E \u043F\u043B\u0430\u0442\u043E (2/3)\u2026"),await Ui(),Pn(i,this.hydro,this.selectedPresetId,n,s),this._setLoaderProgress(72,"\u041D\u0430\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u0435 \u0440\u0435\u043A \xAB\u0411\u044B\u0441\u0442\u0440\u0438\u0446\u0430\xBB, \xAB\u0421\u0435\u0440\u0435\u0431\u0440\u044F\u043D\u043A\u0430\xBB \u0438 \xAB\u0413\u0440\u0435\u043C\u0443\u0447\u0438\u0439\xBB (3/3)\u2026"),await Ui(),Pn(i,this.hydro,this.selectedPresetId,s,i),this.hydro.finalizeValleySetup(18),this._setLoaderProgress(86,"\u0417\u0430\u043F\u0443\u0441\u043A 8 \u0433\u043E\u0440\u043E\u0434\u043E\u0432 (32 \u0442\u0438\u043F\u0430 \u0437\u0434\u0430\u043D\u0438\u0439), \u043D\u0430\u0443\u0447\u043D\u043E\u0433\u043E \u0431\u0430\u043B\u0430\u043D\u0441\u0430 \u0432\u043E\u0434\u044B \u0438 300 \u0430\u043D\u0438\u043C\u0430\u0446\u0438\u0439\u2026"),await Ui(),this.economy=new Ha(this.hydro,{onNotify:(a,l)=>this.notify(a,l),onMilestone:a=>{this.audio.playMilestone(),this.notify(`\u2605 \u0413\u0440\u0430\u043D\u0442 \u041C\u0438\u043D\u044D\u043D\u0435\u0440\u0433\u043E \xAB${a.title}\xBB: +${a.reward.toLocaleString("ru-RU")} \u20BD!`,"good")}}),this.worldView=new Wa(this.scene,this.hydro,this.economy,this.profile,this.renderer,this.textures),this.spray=new Xa(this.scene,this.profile.maxParticles),this.tutorial=new $a(this),this._setLoaderProgress(96,"\u041F\u0440\u0435\u0434\u043A\u043E\u043C\u043F\u0438\u043B\u044F\u0446\u0438\u044F WebGL-\u0448\u0435\u0439\u0434\u0435\u0440\u043E\u0432 \u0432\u043E\u0434\u044B, 3D-\u043F\u0435\u0440\u0435\u043B\u0438\u0432\u0430 \u0438 \u043C\u0435\u0433\u0430-\u0430\u0442\u043B\u0430\u0441\u0430 \u0433\u043E\u0440\u043E\u0434\u043E\u0432\u2026"),await Ui(),this.renderer.compile(this.scene,this.camera),this._initUI(),this._populateWorldCatalogTab(),this._bindWorldInput(),this._rebuildLandmarksBar(),this.worldView.syncCityInstances(),this.worldView.syncEngineeredVolumes(),this._setLoaderProgress(100,`\u0411\u0430\u0441\u0441\u0435\u0439\u043D \xAB${bi[this.selectedPresetId].name}\xBB (${e.short}, ${e.areaKm2}) \u0433\u043E\u0442\u043E\u0432!`),this.isLoadingMap=!1,this.ready=!0;let o=document.getElementById("map-loader");o&&o.classList.add("ready-preview"),t&&(t.disabled=!1,t.textContent=`\u25B6 \u0412\u043E\u0439\u0442\u0438 \u0432 \u0431\u0430\u0441\u0441\u0435\u0439\u043D (${e.short}) \u0438 \u043D\u0430\u0447\u0430\u0442\u044C \u0441\u0442\u0440\u043E\u0438\u0442\u0435\u043B\u044C\u0441\u0442\u0432\u043E`),this._lastTime=performance.now(),requestAnimationFrame(a=>this._loop(a)),window.location.search.includes("autostart=1")&&this.enterValley()}async loadValleyMapAsync(t){this.isLoadingMap=!0,this.selectedPresetId=t;let e=Rn[this.selectedScaleId],i=document.getElementById("btn-enter-valley");i&&(i.disabled=!0,i.textContent=`\u0413\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u044F \u043A\u0430\u0440\u0442\u044B ${e.short}\u2026`),this._setLoaderProgress(18,`\u041F\u0435\u0440\u0435\u0441\u0442\u0440\u043E\u0439\u043A\u0430 \u0431\u0430\u0441\u0441\u0435\u0439\u043D\u0430 \xAB${bi[t].name}\xBB (${e.label})\u2026`),await Ui(),this.hydro.presetId=t,this.hydro._clearArrays();let n=this.hydro.grid,s=Math.floor(n/2);this._setLoaderProgress(48,"\u0421\u043A\u0443\u043B\u044C\u043F\u0442\u0443\u0440\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u0445\u0440\u0435\u0431\u0442\u043E\u0432, \u0443\u0449\u0435\u043B\u0438\u0439 \u0438 \u0442\u0435\u0440\u0440\u0430\u0441 8 \u0433\u043E\u0440\u043E\u0434\u043E\u0432 (1/2)\u2026"),await Ui(),Pn(n,this.hydro,t,0,s),this._setLoaderProgress(76,"\u041D\u0430\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u0435 \u0440\u0443\u0441\u0435\u043B \u0440\u0435\u043A \u0438 \u043F\u0440\u043E\u0433\u0440\u0435\u0432 \u0433\u0438\u0434\u0440\u043E\u0434\u0438\u043D\u0430\u043C\u0438\u043A\u0438 \u0421\u0435\u043D-\u0412\u0435\u043D\u0430\u043D\u0430 (2/2)\u2026"),await Ui(),Pn(n,this.hydro,t,s,n),this.hydro.finalizeValleySetup(18),this._setLoaderProgress(92,"\u0420\u0430\u0437\u043C\u0435\u0449\u0435\u043D\u0438\u0435 8 \u0433\u043E\u0440\u043E\u0434\u043E\u0432, \u0444\u043B\u043E\u0442\u0430, \u043F\u043E\u0435\u0437\u0434\u043E\u0432, \u0412\u042D\u0421, \u0421\u042D\u0421, \u043F\u0442\u0438\u0446 \u0438 \u043B\u0435\u0441\u043E\u0432\u2026"),await Ui(),this.economy.resetEconomy(),this.worldView.rebuildForNewValley(),this.camCtrl.syncToWorldScale(),this._syncScaleLabelsInUI(),this._rebuildLandmarksBar(),this.selectedStruct=null,document.getElementById("struct-inspector").classList.add("hidden"),this._refreshHUD(),this._setLoaderProgress(100,`\u041A\u0430\u0440\u0442\u0430 \xAB${bi[t].name}\xBB (${e.short}) \u0433\u043E\u0442\u043E\u0432\u0430!`),this.isLoadingMap=!1,i&&(i.disabled=!1,i.textContent=`\u25B6 \u0412\u043E\u0439\u0442\u0438 \u0432 \u0431\u0430\u0441\u0441\u0435\u0439\u043D (${e.short}) \u0438 \u043D\u0430\u0447\u0430\u0442\u044C \u0441\u0442\u0440\u043E\u0438\u0442\u0435\u043B\u044C\u0441\u0442\u0432\u043E`)}enterValley(){this.isInPreGameLoader=!1,this.camCtrl.clearKeys();let t=document.getElementById("map-loader");t&&t.classList.add("hidden");let e=this.selectedMode==="creative";this.economy.creative=e,document.getElementById("btn-creative").classList.toggle("active",e);let i=bi[this.selectedPresetId].landmarks[0],n=this.hydro.sampleAtWorld(i.x,i.z).bed;this.camCtrl.flyTo(i.x,i.z+25*L.horizScale,i.dist,n);let s=document.getElementById("chk-start-tutorial");if(s&&s.checked)this.tutorial.start(0);else{this.tutorial.stop();let o=Rn[this.selectedScaleId];this.notify(`\u2248 \u0411\u0430\u0441\u0441\u0435\u0439\u043D \xAB${bi[this.selectedPresetId].name}\xBB (${o.short}) \u043E\u0442\u043A\u0440\u044B\u0442! \u0412\u043E\u0434\u043D\u044B\u0439 \u0431\u0430\u043B\u0430\u043D\u0441 \u0438 12 \u0434\u043E\u0445\u043E\u0434\u043E\u0432 \u2014 \u0432 \u043F\u0430\u043D\u0435\u043B\u0438 \u0441\u043F\u0440\u0430\u0432\u0430.`,"info")}this._refreshHUD()}openMapLoader(){this.isInPreGameLoader=!0,this.camCtrl.clearKeys();let t=document.getElementById("map-loader");t&&(t.classList.remove("hidden"),t.classList.add("ready-preview"))}_flyToCityByIndex(t){if(!this.economy||!this.economy.cities.length)return;let e=this.economy.cities.length;this._cityNavIndex=(t%e+e)%e;let i=this.economy.cities[this._cityNavIndex],n=135*Math.pow(L.horizScale,.72);this.camCtrl.flyTo(i.x,i.z,n,i.baseElevation),this._cityNavLabelEl&&(this._cityNavLabelEl.textContent=`\u2316 ${i.name} (${this._cityNavIndex+1}/${e})`)}_rebuildLandmarksBar(){let t=document.getElementById("landmarks-bar");if(!t)return;t.innerHTML="",this._cityNavIndex=0;let i=(bi[this.selectedPresetId]||bi.bystritsa).landmarks[0];if(i){let n=document.createElement("button");n.className="lm-btn",n.textContent="\u25B2 \u041A \u0441\u0442\u0432\u043E\u0440\u0443 \u0413\u042D\u0421",n.addEventListener("click",()=>{if(this.hydro.turbines.length>0){let s=this.hydro.turbines[0];this.camCtrl.flyTo(s.wx,s.wz,i.dist,s.baseY)}else{let s=this.hydro.sampleAtWorld(i.x,i.z).bed;this.camCtrl.flyTo(i.x,i.z,i.dist,s)}}),t.appendChild(n)}if(this.economy&&this.economy.cities.length>0){let n=document.createElement("button");n.className="lm-btn",n.title="\u041F\u0440\u0435\u0434\u044B\u0434\u0443\u0449\u0438\u0439 \u0433\u043E\u0440\u043E\u0434",n.textContent="\u25C0",n.addEventListener("click",()=>this._flyToCityByIndex((this._cityNavIndex||0)-1));let s=document.createElement("button");s.className="lm-btn",s.textContent=`\u2316 ${this.economy.cities[0].name} (1/${this.economy.cities.length})`,s.addEventListener("click",()=>this._flyToCityByIndex(this._cityNavIndex||0)),this._cityNavLabelEl=s;let o=document.createElement("button");o.className="lm-btn",o.title="\u0421\u043B\u0435\u0434\u0443\u044E\u0449\u0438\u0439 \u0433\u043E\u0440\u043E\u0434",o.textContent="\u25B6",o.addEventListener("click",()=>this._flyToCityByIndex((this._cityNavIndex||0)+1)),t.append(n,s,o)}}_loadSetting(t,e){try{return localStorage.getItem(`cascade.${t}`)||e}catch{return e}}_saveSetting(t,e){try{localStorage.setItem(`cascade.${t}`,e)}catch{}}_initRenderer(){let t=[{antialias:this.profile.id!=="low",powerPreference:"high-performance"},{antialias:!1,powerPreference:"default"},{antialias:!1,failIfMajorPerformanceCaveat:!1}],e=null;for(let n of t)try{if(this.renderer=new Ea({canvas:this.canvas,antialias:n.antialias,powerPreference:n.powerPreference,alpha:!1}),this.renderer&&this.renderer.getContext())break}catch(s){e=s,this.renderer=null}if(!this.renderer){let n=wc(),s=document.getElementById("nogl-modal"),o=document.getElementById("nogl-reason");throw s&&s.classList.remove("hidden"),o&&(o.textContent=n.reason||e&&e.message||"WebGL \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D"),new Error("WebGL context unavailable")}let i=Math.min(window.devicePixelRatio||1,this.profile.maxPixelRatio);this.renderer.setPixelRatio(i),this.renderer.setSize(window.innerWidth,window.innerHeight),this.renderer.shadowMap.enabled=!!this.profile.shadows,this.renderer.shadowMap.type=Wn,this.renderer.shadowMap.autoUpdate=!1,this.renderer.shadowMap.needsUpdate=!0}_onResize(){let t=window.innerWidth,e=window.innerHeight;this.camera.aspect=t/Math.max(1,e),this.camera.updateProjectionMatrix();let i=Math.min(window.devicePixelRatio||1,this.profile.maxPixelRatio);this.renderer.setPixelRatio(i),this.renderer.setSize(t,e)}raycastValley(t,e){let i=this.canvas.getBoundingClientRect(),n=(t-i.left)/i.width*2-1,s=-((e-i.top)/i.height)*2+1,o=this._raycaster||(this._raycaster=new rr);o.setFromCamera({x:n,y:s},this.camera);let a=o.ray.origin,l=o.ray.direction;if(l.y>=-.01)return null;let c=148*L.elevScale,h=Math.max(2200,L.size*2.65),u=Math.max(2,(a.y-c)/-l.y),d=Math.min(h,(a.y- -6)/-l.y);if(d<=u)return null;let f=96,g=(d-u)/f,y=u,p=L.size*.496;for(let m=1;m<=f;m++){let x=u+m*g,S=a.x+l.x*x,M=a.y+l.y*x,b=a.z+l.z*x;if(Math.abs(S)>p||Math.abs(b)>p){y=x;continue}let _=this.hydro.sampleAtWorld(S,b);if(M<=_.bed){let w=y,v=x;for(let C=0;C<6;C++){let R=(w+v)*.5,P=a.x+l.x*R,N=a.y+l.y*R,I=a.z+l.z*R,U=this.hydro.sampleAtWorld(P,I);N<=U.bed?v=R:w=R}let T=(w+v)*.5;return{wx:W(a.x+l.x*T,-p,p),wy:a.y+l.y*T,wz:W(a.z+l.z*T,-p,p)}}y=x}return null}_initUI(){let t=document.getElementById("hotbar");t.innerHTML="";for(let h of Mr){let u=document.createElement("button");u.className=`tool-slot${h.id===this.activeToolId?" active":""}`,u.dataset.tool=h.id,u.innerHTML=`
        <span class="tool-key">[${h.key}]</span>
        <span class="tool-icon">${jd[h.id]||"\u25C8"}</span>
        <span class="tool-name">${h.short}</span>
        <span class="tool-price">${h.costLabel}</span>
      `,u.addEventListener("click",()=>{this.audio.unlock(),this.selectTool(h.id)}),t.appendChild(u)}this._updateToolHint(),document.querySelectorAll(".side-tab").forEach(h=>{h.addEventListener("click",()=>{let u=h.dataset.tab;this.activeSideTab=u,document.querySelectorAll(".side-tab").forEach(d=>d.classList.toggle("active",d===h)),["cities","water","revenue","world"].forEach(d=>{let f=document.getElementById(`tab-pane-${d}`);f&&f.classList.toggle("hidden",d!==u)}),this._refreshHUD()})});let e=document.getElementById("btn-sell-aggregate");e&&e.addEventListener("click",()=>{let h=this.economy.sellAggregateBatch();h.ok?(this.audio.playMilestone(),this.notify(`\u25B2 \u041E\u0442\u0433\u0440\u0443\u0436\u0435\u043D\u0430 \u0431\u0430\u0440\u0436\u0430 \u0433\u0440\u0430\u043D\u0438\u0442\u043D\u043E\u0433\u043E \u0449\u0435\u0431\u043D\u044F (${h.soldM3.toLocaleString("ru-RU")} \u043C\xB3): +${h.revenue.toLocaleString("ru-RU")} \u20BD!`,"good"),this._refreshHUD()):this.notify(h.reason,"warn")}),document.querySelectorAll(".size-btn[data-size-idx]").forEach(h=>{h.addEventListener("click",()=>{this.brushSizeIndex=parseInt(h.dataset.sizeIdx,10)||0,this.brushRadius=L.brushSizes[this.brushSizeIndex],document.querySelectorAll(".size-btn[data-size-idx]").forEach(u=>u.classList.remove("active")),h.classList.add("active")})}),document.querySelectorAll(".tier-btn[data-tier]").forEach(h=>{h.addEventListener("click",()=>{this.damTierIndex=parseInt(h.dataset.tier,10)||0,document.querySelectorAll(".tier-btn[data-tier]").forEach(d=>d.classList.remove("active")),h.classList.add("active");let u=Math.round((Ee.damHeightTiers[this.damTierIndex]?.addHeight||11)*L.elevScale);this.notify(`\u25B2 \u0412\u044B\u0431\u0440\u0430\u043D \u043F\u0440\u043E\u0444\u0438\u043B\u044C 3D-\u043F\u043B\u043E\u0442\u0438\u043D\u044B: +${u} \u043C \u043A \u043E\u0441\u043D\u043E\u0432\u0430\u043D\u0438\u044E`,"info")})}),document.getElementById("btn-rotate").addEventListener("click",()=>this.rotatePlacement()),document.getElementById("btn-speed").addEventListener("click",()=>this.cycleSpeed()),document.getElementById("btn-open-loader").addEventListener("click",()=>this.openMapLoader()),document.getElementById("btn-contours").addEventListener("click",()=>this.toggleContours()),document.getElementById("btn-weather-cycle").addEventListener("click",()=>{let h=(Cc.indexOf(this.economy.weatherId)+1)%Cc.length,u=Cc[h];this.economy.setWeather(u);let d=$e[u];this.notify(`${d.icon} \u041C\u0435\u0442\u0435\u043E\u0440\u0435\u0436\u0438\u043C: ${d.label} (\u043F\u0440\u0438\u0442\u043E\u043A \u0440\u0435\u043A \xD7${d.inflowMult.toFixed(2)})`,"info"),this._refreshHUD()});let i=document.getElementById("btn-creative");i.addEventListener("click",()=>{this.economy.creative=!this.economy.creative,i.classList.toggle("active",this.economy.creative),this.notify(this.economy.creative?"\u2605 \u0420\u0435\u0436\u0438\u043C \xAB\u0418\u043D\u0436\u0435\u043D\u0435\u0440\u043D\u044B\u0439 \u043A\u0440\u0435\u0430\u0442\u0438\u0432\xBB \u0432\u043A\u043B\u044E\u0447\u0451\u043D: \u043C\u0433\u043D\u043E\u0432\u0435\u043D\u043D\u0430\u044F \u0441\u0442\u0440\u043E\u0439\u043A\u0430 \u0438 \u0431\u0435\u0441\u043A\u043E\u043D\u0435\u0447\u043D\u044B\u0439 \u0431\u044E\u0434\u0436\u0435\u0442!":"\u25C8 \u0412\u043A\u043B\u044E\u0447\u0451\u043D \u0438\u043D\u0436\u0435\u043D\u0435\u0440\u043D\u044B\u0439 \u0440\u0435\u0436\u0438\u043C: 3-\u044D\u0442\u0430\u043F\u043D\u043E\u0435 \u0431\u0435\u0442\u043E\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u043A\u0440\u0430\u043D\u0430\u043C\u0438 \u0438 \u0440\u0435\u0430\u043B\u044C\u043D\u044B\u0439 \u0431\u044E\u0434\u0436\u0435\u0442.","info"),this._refreshHUD()});let n=document.getElementById("btn-quality");n.textContent=`\u2699 ${this.profile.label}`,n.addEventListener("click",()=>{let h=["low","medium","high"],u=h[(h.indexOf(this.profile.id)+1)%h.length];this._saveSetting("quality",u),this.profile=Ca[u],n.textContent=`\u2699 ${this.profile.label}`,this.renderer.shadowMap.enabled=!!this.profile.shadows,this.renderer.shadowMap.needsUpdate=!0,this._onResize(),this.notify(`\u0413\u0440\u0430\u0444\u0438\u043A\u0430 \u043F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0435\u043D\u0430: ${this.profile.label}`,"info")});let s=document.getElementById("btn-mute");s.addEventListener("click",()=>{let h=this.audio.toggleMute();s.textContent=h?"\u2715 \u0411\u0435\u0437 \u0437\u0432\u0443\u043A\u0430":"\u266A \u0417\u0432\u0443\u043A"});let o=document.getElementById("help-modal");document.getElementById("btn-help").addEventListener("click",()=>o.classList.toggle("hidden")),document.getElementById("help-close").addEventListener("click",()=>o.classList.add("hidden")),document.getElementById("help-start-btn").addEventListener("click",()=>{this.audio.unlock(),o.classList.add("hidden")});let a=document.getElementById("panel-body"),l=document.getElementById("btn-toggle-panel");l.addEventListener("click",()=>{let h=a.classList.toggle("hidden");l.textContent=h?"\u25B8":"\u25BE"}),document.getElementById("btn-loan").addEventListener("click",()=>{let h=this.economy.takeGreenLoan();h.ok?this.notify(`+ \u0412\u044B\u043F\u0443\u0449\u0435\u043D\u044B \u0437\u0435\u043B\u0451\u043D\u044B\u0435 \u043E\u0431\u043B\u0438\u0433\u0430\u0446\u0438\u0438 \u0413\u042D\u0421: +${h.amount.toLocaleString("ru-RU")} \u20BD`,"good"):this.notify(h.reason,"warn"),this._refreshHUD()}),document.getElementById("btn-repay").addEventListener("click",()=>{let h=this.economy.repayLoan();h.ok?this.notify(`\u041F\u043E\u0433\u0430\u0448\u0435\u043D\u0430 \u0447\u0430\u0441\u0442\u044C \u043E\u0431\u043B\u0438\u0433\u0430\u0446\u0438\u0439: -${h.amount.toLocaleString("ru-RU")} \u20BD`,"info"):this.notify(h.reason,"warn"),this._refreshHUD()}),document.getElementById("insp-close").addEventListener("click",()=>{this.selectedStruct=null,document.getElementById("struct-inspector").classList.add("hidden")}),document.getElementById("insp-slider").addEventListener("input",h=>{if(!this.selectedStruct)return;let u=Number(h.target.value)/100;this.selectedStruct.kind==="turbine"?(this.selectedStruct.throttle=u,this.selectedStruct.autoDispatch=!1,document.getElementById("insp-auto").checked=!1):(this.selectedStruct.openRatio=u,this.selectedStruct.autoRegulate=!1,document.getElementById("insp-auto").checked=!1,this.hydro._syncSpillwayGateCells(this.selectedStruct)),this._refreshInspector()}),document.getElementById("insp-auto").addEventListener("change",h=>{if(!this.selectedStruct)return;let u=h.target.checked;this.selectedStruct.kind==="turbine"?this.selectedStruct.autoDispatch=u:this.selectedStruct.autoRegulate=u,this._refreshInspector()}),document.getElementById("insp-gaes").addEventListener("change",h=>{this.selectedStruct&&this.selectedStruct.kind==="turbine"&&(this.selectedStruct.pumpedStorage=h.target.checked,this.notify(h.target.checked?"\u2248 \u0412\u043A\u043B\u044E\u0447\u0451\u043D \u043E\u0431\u0440\u0430\u0442\u0438\u043C\u044B\u0439 \u0440\u0435\u0436\u0438\u043C \u0413\u0410\u042D\u0421: \u043D\u043E\u0447\u044C\u044E (00:00\u201306:00) \u0430\u0433\u0440\u0435\u0433\u0430\u0442 \u0437\u0430\u043A\u0430\u0447\u0430\u0435\u0442 \u0432\u043E\u0434\u0443 \u0432 \u0432\u0435\u0440\u0445\u043D\u0438\u0439 \u0431\u044C\u0435\u0444!":"\u0420\u0435\u0436\u0438\u043C \u043D\u043E\u0447\u043D\u043E\u0439 \u0437\u0430\u043A\u0430\u0447\u043A\u0438 \u0413\u0410\u042D\u0421 \u043E\u0442\u043A\u043B\u044E\u0447\u0451\u043D.","info"),this._refreshInspector())}),document.getElementById("insp-clean-btn").addEventListener("click",()=>{this.selectedStruct&&this.selectedStruct.kind==="turbine"&&(this.selectedStruct.trashLoad=0,this.audio.playBuild(),this.notify("\u0421\u043E\u0440\u043E\u0443\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u044E\u0449\u0430\u044F \u0440\u0435\u0448\u0451\u0442\u043A\u0430 \u0432\u043E\u0434\u043E\u043F\u0440\u0438\u0451\u043C\u043D\u0438\u043A\u0430 \u043F\u0440\u043E\u043C\u044B\u0442\u0430!","good"),this._refreshInspector())});let c={Digit1:"1",Digit2:"2",Digit3:"3",Digit4:"4",Digit5:"5",Digit6:"6",Digit7:"7",Digit8:"8",Digit9:"9",Digit0:"0",KeyL:"L",KeyF:"F",KeyP:"P",KeyX:"X"};window.addEventListener("keydown",h=>{if(this.isInPreGameLoader||h.target&&(h.target.tagName==="INPUT"||h.target.tagName==="SELECT"))return;if(h.code==="F3"){h.preventDefault(),this.showDiag=!this.showDiag,document.getElementById("diag-panel").classList.toggle("hidden",!this.showDiag);return}let u=c[h.code]||h.key.toUpperCase();if(h.code!=="KeyW"&&h.code!=="KeyA"&&h.code!=="KeyS"&&h.code!=="KeyD"&&h.code!=="KeyQ"&&h.code!=="KeyE"){for(let d of Mr)if(d.key===u){this.selectTool(d.id);return}}h.code==="KeyV"||h.code==="Space"?(h.preventDefault(),this.cycleSpeed()):h.code==="KeyC"?this.toggleContours():h.code==="KeyR"?this.rotatePlacement():h.code==="KeyT"?document.getElementById("btn-tutorial").click():h.code==="KeyK"?i.click():h.code==="KeyM"?s.click():h.code==="KeyH"&&o.classList.toggle("hidden")}),this._renderCityCards(),this._refreshHUD()}_populateWorldCatalogTab(){let t=document.getElementById("anim-groups-list"),e=document.getElementById("tex-families-list");if(t){let i=new Map;for(let s of Va)i.set(s.groupLabel,(i.get(s.groupLabel)||0)+1);let n="";for(let[s,o]of i.entries())n+=`<div class="wb-row"><span>${s}</span><strong>${o} \u0430\u043D\u0438\u043C.</strong></div>`;n+=`<div class="wb-row total"><span>\u0412\u0441\u0435\u0433\u043E \u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0445 \u0430\u043D\u0438\u043C\u0430\u0446\u0438\u0439</span><strong>${Va.length}</strong></div>`,t.innerHTML=n}if(e){let i=new Map;for(let s of on)i.set(s.familyLabel,(i.get(s.familyLabel)||0)+1);let n="";for(let[s,o]of i.entries())n+=`<div class="wb-row"><span>${s}</span><strong>${o} \u043F\u0440\u0435\u0441\u0435\u0442\u0430</strong></div>`;n+=`<div class="wb-row total"><span>\u0412\u0441\u0435\u0433\u043E \u0442\u0435\u043A\u0441\u0442\u0443\u0440 \u0438 \u043E\u0442\u0442\u0435\u043D\u043A\u043E\u0432</span><strong>${on.length}</strong></div>`,e.innerHTML=n}}selectTool(t){this.activeToolId=t,document.querySelectorAll(".tool-slot").forEach(e=>{e.classList.toggle("active",e.dataset.tool===t)}),this._updateToolHint()}_updateToolHint(){let t=Mr.find(i=>i.id===this.activeToolId),e=document.getElementById("tool-hint");t&&e&&(e.textContent=`\u25B8 ${t.name}: ${t.desc}`)}rotatePlacement(){this.manualYaw===null?this.manualYaw=0:this.manualYaw+=Math.PI*.25,this.manualYaw>Math.PI*2&&(this.manualYaw=null),this.notify(this.manualYaw===null?"\u21BB \u0410\u0432\u0442\u043E-\u043E\u0440\u0438\u0435\u043D\u0442\u0430\u0446\u0438\u044F \u0441\u0442\u0432\u043E\u0440\u0430 \u043F\u043E \u0443\u043A\u043B\u043E\u043D\u0443 \u0432\u043E\u0434\u044B \u0432\u043A\u043B\u044E\u0447\u0435\u043D\u0430":`\u21BB \u0420\u0443\u0447\u043D\u043E\u0439 \u0443\u0433\u043E\u043B \u0441\u0442\u0432\u043E\u0440\u0430: ${Math.round(this.manualYaw*180/Math.PI)}\xB0`,"info")}cycleSpeed(){this.speedIndex=(this.speedIndex+1)%Rc.length;let t=Rc[this.speedIndex],e=document.getElementById("btn-speed");e.textContent=t===0?"\u23F8 \u041F\u0430\u0443\u0437\u0430":`\u25B6 \xD7${t}`,e.classList.toggle("active",t>1)}toggleContours(){this.showContours=!this.showContours,this.worldView.terrainMat.uniforms.uShowContours.value=this.showContours?1:0,document.getElementById("btn-contours").classList.toggle("active",this.showContours)}_bindWorldInput(){this.canvas.addEventListener("pointerdown",t=>{if(this.isInPreGameLoader||(this.audio.unlock(),t.button!==0)||this.camCtrl.touches.size>=2)return;let e=this.raycastValley(t.clientX,t.clientY);if(!e)return;let i=this.hydro.findStructureNear(e.wx,e.wz);if(i&&(this.activeToolId==="inspect"||t.altKey)){this.selectedStruct=i,document.getElementById("struct-inspector").classList.remove("hidden"),this._refreshInspector();return}if(this.activeToolId==="spillway"||this.activeToolId.startsWith("turbine_")||this.activeToolId==="nav_lock"||this.activeToolId==="fish_eco"||this.activeToolId==="powerline"||this.activeToolId==="demolish"||this.activeToolId==="inspect"){this._applySingleClickTool(e.wx,e.wz);return}this.pointerDown=!0,this.lastBrushWorld={wx:e.wx,wz:e.wz};let n=this.hydro.sampleAtWorld(e.wx,e.wz),s=(Ee.damHeightTiers[this.damTierIndex]?.addHeight||11.2)*L.elevScale;this.activeToolId==="canal_dig"?this.lockedGradeElev=t.shiftKey?n.bed-1.9*L.elevScale:null:this.activeToolId==="concrete_dam"?this.lockedGradeElev=Math.max(n.bed,n.surface)+s:this.activeToolId==="earth_dam"?this.lockedGradeElev=Math.max(n.bed,n.surface)+4.2*L.elevScale:this.lockedGradeElev=null,this._applyContinuousStrokePoint(e.wx,e.wz,0)}),window.addEventListener("pointermove",t=>{if(this.isInPreGameLoader)return;let e=this.raycastValley(t.clientX,t.clientY);this.hoverWorld=e;let i=Ee.damHeightTiers[this.damTierIndex]?.addHeight||11.2;if(e?(this.worldView.updateCursor(e.wx,e.wz,this.brushRadius,this.activeToolId,this.manualYaw,i,!0),this._updateProbeBar(e.wx,e.wz)):this.worldView.updateCursor(0,0,this.brushRadius,this.activeToolId,this.manualYaw,i,!1),!this.pointerDown||!e||!this.lastBrushWorld||this.camCtrl.touches.size>=2)return;let n=e.wx-this.lastBrushWorld.wx,s=e.wz-this.lastBrushWorld.wz,o=Math.hypot(n,s),a=Math.max(this.hydro.dx*.55,this.brushRadius*.35);if(o<a)return;let l=Math.min(20,Math.ceil(o/a));for(let c=1;c<=l;c++){let h=c/l,u=$t(this.lastBrushWorld.wx,e.wx,h),d=$t(this.lastBrushWorld.wz,e.wz,h);this.activeToolId==="canal_dig"&&this.lockedGradeElev!==null&&(this.lockedGradeElev-=o/l*.004),this._applyContinuousStrokePoint(u,d,c)}this.lastBrushWorld={wx:e.wx,wz:e.wz}}),window.addEventListener("pointerup",()=>{this.pointerDown=!1,this.lastBrushWorld=null,this.lockedGradeElev=null})}_applyContinuousStrokePoint(t,e,i){let n=this.economy.cash,s=this.economy.creative;if(this.activeToolId==="canal_dig"){let o=this.hydro.excavateCanal(t,e,this.brushRadius,1.45,this.lockedGradeElev,n,s);if(o.excavatedM3>0){if(this.economy.spend(o.cost),i===0){this.audio.playDig();let a=this.hydro.sampleAtWorld(t,e);this.spray.spawnDigSplash(t,a.bed,e,8)}}else!s&&n<40&&i===0&&this.notify("\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0441\u0440\u0435\u0434\u0441\u0442\u0432 \u043D\u0430 \u0437\u0435\u043C\u043B\u044F\u043D\u044B\u0435 \u0440\u0430\u0431\u043E\u0442\u044B!","warn")}else if(this.activeToolId==="canal_liner"){let o=this.hydro.lineCanalConcrete(t,e,this.brushRadius,n,s);o.count>0&&(this.economy.spend(o.cost),i===0&&this.audio.playBuild())}else if(this.activeToolId==="earth_dam"){let o=this.hydro.buildEarthDam(t,e,this.brushRadius,1.85,this.lockedGradeElev,n,s);o.addedM3>0&&(this.economy.spend(o.cost),i===0&&this.audio.playDig())}else if(this.activeToolId==="concrete_dam"){let o=(Ee.damHeightTiers[this.damTierIndex]?.addHeight||11.2)*L.elevScale,a=this.lockedGradeElev??this.hydro.sampleAtWorld(t,e).bed+o,l=this.hydro.buildConcreteDam(t,e,this.brushRadius,a,n,s,!1);l.addedM3>0?(this.economy.spend(l.cost),i===0&&this.audio.playBuild()):!s&&n<180&&i===0&&this.notify("\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0441\u0440\u0435\u0434\u0441\u0442\u0432 \u043D\u0430 \u0431\u0435\u0442\u043E\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 (\u043C\u043E\u0436\u043D\u043E \u0432\u044B\u043F\u0443\u0441\u0442\u0438\u0442\u044C \u0437\u0435\u043B\u0451\u043D\u044B\u0435 \u043E\u0431\u043B\u0438\u0433\u0430\u0446\u0438\u0438 \u0441\u043F\u0440\u0430\u0432\u0430!)","warn")}else if(this.activeToolId==="foundation"){let o=this.hydro.reinforceFoundation(t,e,this.brushRadius,n,s);o.count>0?(this.economy.spend(o.cost),i===0&&this.audio.playBuild()):!s&&n<140&&i===0&&this.notify("\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0441\u0440\u0435\u0434\u0441\u0442\u0432 \u043D\u0430 \u0441\u043A\u0430\u043B\u044C\u043D\u0443\u044E \u0446\u0435\u043C\u0435\u043D\u0442\u0430\u0446\u0438\u044E \u0438 3D-\u043A\u043E\u043D\u0442\u0440\u0444\u043E\u0440\u0441\u044B!","warn")}}_applySingleClickTool(t,e){let i=this.economy.cash,n=this.economy.creative;if(this.activeToolId==="inspect"){let s=this.hydro.findStructureNear(t,e);s&&(this.selectedStruct=s,document.getElementById("struct-inspector").classList.remove("hidden"),this._refreshInspector());return}if(this.activeToolId==="spillway"){let s=this.hydro.placeSpillway(t,e,this.manualYaw,i,n);if(!s.ok){this.notify(s.reason,"warn");return}this.economy.spend(s.cost),this.audio.playBuild(),this.selectedStruct=s.structure,document.getElementById("struct-inspector").classList.remove("hidden"),this._refreshInspector(),this.notify("\u2248 \u0421\u043C\u043E\u043D\u0442\u0438\u0440\u043E\u0432\u0430\u043D 3D-\u0432\u043E\u0434\u043E\u0441\u0431\u0440\u043E\u0441 \u0441 \u0441\u0435\u0433\u043C\u0435\u043D\u0442\u043D\u044B\u043C \u0437\u0430\u0442\u0432\u043E\u0440\u043E\u043C \u0438 \u0442\u0440\u0430\u043C\u043F\u043B\u0438\u043D\u043E\u043C!","good");return}if(this.activeToolId.startsWith("turbine_")){let s=this.activeToolId.replace("turbine_",""),o=this.hydro.placeTurbine(s,t,e,this.manualYaw,i,n);if(!o.ok){this.notify(o.reason,"warn");return}this.economy.spend(o.cost),this.audio.playBuild(),this.selectedStruct=o.structure,document.getElementById("struct-inspector").classList.remove("hidden"),this._refreshInspector(),this.notify(`\u2726 \u041F\u043E\u0441\u0442\u0440\u043E\u0435\u043D\u0430 \u043F\u0440\u0438\u043F\u043B\u043E\u0442\u0438\u043D\u043D\u0430\u044F ${o.structure.spec.name}: \u0432\u043E\u0434\u043E\u043F\u0440\u0438\u0451\u043C\u043D\u0438\u043A \u043D\u0430\u0432\u0435\u0440\u0445\u0443, \u043C\u0430\u0448\u0437\u0430\u043B \u0432 \u043D\u0438\u0436\u043D\u0435\u043C \u0431\u044C\u0435\u0444\u0435!`,"good");return}if(this.activeToolId==="nav_lock"){let s=this.hydro.placeNavigationLock(t,e,this.manualYaw,i,n);if(!s.ok){this.notify(s.reason,"warn");return}this.economy.spend(s.cost),this.audio.playBuild(),this.notify("\u2726 \u041E\u0442\u043A\u0440\u044B\u0442 \u0441\u0443\u0434\u043E\u0445\u043E\u0434\u043D\u044B\u0439 \u0448\u043B\u044E\u0437! \u0420\u0435\u0447\u043D\u043E\u0439 \u0444\u043B\u043E\u0442 \u043D\u0430\u0447\u0430\u043B \u043F\u0440\u0438\u043D\u043E\u0441\u0438\u0442\u044C \u043D\u0430\u0432\u0438\u0433\u0430\u0446\u0438\u043E\u043D\u043D\u044B\u0439 \u0441\u0431\u043E\u0440.","good"),this._refreshHUD();return}if(this.activeToolId==="fish_eco"){let s=this.hydro.placeFishEcoFarm(t,e,i,n);if(!s.ok){this.notify(s.reason,"warn");return}this.economy.spend(s.cost),this.audio.playBuild(),this.notify("\u2726 \u0420\u0430\u0437\u0432\u0451\u0440\u043D\u0443\u0442\u044B \u0441\u0430\u0434\u043A\u0438 \u0444\u043E\u0440\u0435\u043B\u0435\u0432\u043E\u0433\u043E \u0445\u043E\u0437\u044F\u0439\u0441\u0442\u0432\u0430 \u0438 \u044F\u0445\u0442-\u043C\u0430\u0440\u0438\u043D\u0430 (+\u0434\u043E\u0445\u043E\u0434 \u0430\u043A\u0432\u0430\u043A\u0443\u043B\u044C\u0442\u0443\u0440\u044B \u0438 \u0442\u0443\u0440\u0438\u0437\u043C\u0430)!","good"),this._refreshHUD();return}if(this.activeToolId==="powerline"){let s=null,o=92*L.horizScale;for(let l of this.economy.cities){let c=Math.hypot(l.x-t,l.z-e);c<o&&(o=c,s=l)}if(s){let l=this.economy.connectCityGrid(s.id);l.ok?this.audio.playBuild():this.notify(l.reason,"warn"),this._renderCityCards();return}let a=this.hydro.placeSubstation(t,e,i,n);if(!a.ok){this.notify(a.reason,"warn");return}this.economy.spend(a.cost),this.economy.powerLinesDirty=!0,this.audio.playBuild(),this.notify("\u2726 \u041F\u043E\u0441\u0442\u0440\u043E\u0435\u043D\u0430 \u0443\u0437\u043B\u043E\u0432\u0430\u044F 3D-\u043F\u043E\u0434\u0441\u0442\u0430\u043D\u0446\u0438\u044F \u041E\u0420\u0423 220 \u043A\u0412! \u041F\u043E\u0442\u0435\u0440\u0438 \u043F\u0435\u0440\u0435\u0434\u0430\u0447\u0438 \u0441\u043D\u0438\u0436\u0435\u043D\u044B \u0441 16% \u0434\u043E 3%!","good"),this._refreshHUD();return}if(this.activeToolId==="demolish"){let s=this.hydro.demolishAt(t,e);s.removed&&(this.economy.earn(s.refund),this.audio.playDig(),this.selectedStruct&&!this.hydro.turbines.includes(this.selectedStruct)&&!this.hydro.spillways.includes(this.selectedStruct)&&(this.selectedStruct=null,document.getElementById("struct-inspector").classList.add("hidden")),this.notify(s.refund>0?`\u0414\u0435\u043C\u043E\u043D\u0442\u0430\u0436 \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D (\u0432\u043E\u0437\u0432\u0440\u0430\u0442 +${s.refund.toLocaleString("ru-RU")} \u20BD)`:"\u0421\u0435\u043A\u0446\u0438\u044F \u0440\u0430\u0441\u0447\u0438\u0449\u0435\u043D\u0430","info"))}}_updateProbeBar(t,e){let i=this.hydro.sampleAtWorld(t,e),n=document.getElementById("probe-readout");if(!n)return;let s="";i.targetConcrete>i.concrete+.08?s=` \xB7 \u0421\u0442\u0440\u043E\u0439\u043A\u0430 ${Math.round(i.buildProgress*100)}%`:i.reinforced&&(s=" \xB7 [\u041A\u043E\u043D\u0442\u0440\u0444\u043E\u0440\u0441]");let o=i.concrete>.8?"3D-\u041C\u043E\u043D\u043E\u043B\u0438\u0442 \u043F\u043B\u043E\u0442\u0438\u043D\u044B":i.lined?"\u0416/\u0411 \u043B\u043E\u0442\u043E\u043A \u043A\u0430\u043D\u0430\u043B\u0430":i.earthDam?"\u041D\u0430\u0441\u044B\u043F\u044C \u0434\u0430\u043C\u0431\u044B":i.soil<.75*L.elevScale?"\u0413\u0440\u0430\u043D\u0438\u0442":`\u0413\u0440\u0443\u043D\u0442 (\u0432\u043B\u0430\u0436\u043D. ${Math.round(i.saturation*100)}%)`,a=i.depth<.03?"\u0441\u0443\u0445\u043E":i.froude>1?"Fr>1 \u0431\u0443\u0440\u043D\u044B\u0439":"\u0441\u043F\u043E\u043A\u043E\u0439\u043D\u044B\u0439";n.textContent=`\u0414\u043D\u043E: ${i.bed.toFixed(1)} \u043C (${o})${s} \xB7 \u0412\u043E\u0434\u0430: ${i.depth>.02?i.surface.toFixed(1)+" \u043C":"\u2014"} \xB7 H: ${i.depth.toFixed(2)} \u043C \xB7 V: ${i.speed.toFixed(2)} \u043C/\u0441 (${a})`}_renderCityCards(){let t=document.getElementById("cities-list");if(t){t.innerHTML="";for(let e of this.economy.cities){let i=document.createElement("div");i.className=`city-card${e.isFlooded?" flooded":""}`,i.id=`city-card-${e.id}`;let n=this.economy.estimatePowerLineCost(e),s=Math.round(e.growthProgress*100),o=e.connected?`\u25C8 ${e.suppliedMW.toFixed(1)} / ${e.currentDemandMW.toFixed(1)} \u041C\u0412\u0442`:`\u041D\u0435 \u0432 \u0441\u0435\u0442\u0438 (\u0441\u043F\u0440\u043E\u0441 ${e.currentDemandMW.toFixed(1)} \u041C\u0412\u0442)`,a="";e.isFlooded?a='<div class="city-note warn">! \u041A\u0432\u0430\u0440\u0442\u0430\u043B\u044B \u043F\u043E\u0434\u0442\u043E\u043F\u043B\u0435\u043D\u044B! \u0420\u043E\u0441\u0442 \u043E\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D</div>':e.needsIrrigation?a=e.irrigated?'<div class="city-note">\u25C8 \u041A\u0430\u043D\u0430\u043B \u043E\u0440\u043E\u0448\u0435\u043D\u0438\u044F \u0430\u043A\u0442\u0438\u0432\u0435\u043D (\u0440\u043E\u0441\u0442 \xD71.82 + \u0434\u043E\u0445\u043E\u0434 \u0438\u0440\u0440\u0438\u0433\u0430\u0446\u0438\u0438)</div>':'<div class="city-note warn">\u25C8 \u041F\u043E\u0434\u0432\u0435\u0434\u0438\u0442\u0435 \u043A\u0430\u043D\u0430\u043B \u043A \u0437\u0435\u043B\u0451\u043D\u043E\u043C\u0443 \u043A\u043E\u043B\u044C\u0446\u0443 \u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u044B</div>':(e.archetype==="smelter"||e.archetype==="tech")&&(a=`<div class="city-note">\u2605 \u041F\u0440\u044F\u043C\u043E\u0439 \u043F\u0440\u043E\u043C\u043A\u043E\u043D\u0442\u0440\u0430\u043A\u0442 PPA \xD7${e.tariffBonus.toFixed(2)}</div>`);let l="";e.currentProjectLabel&&(l=`<div class="city-note">\u25B2 \u0421\u0442\u0440\u043E\u0439\u043A\u0430 (${e.activeBuildCount} \u043A\u0440.): ${e.currentProjectLabel}</div>`);let c=this.economy.roadNetwork&&this.economy.roadNetwork.routes?this.economy.roadNetwork.routes.filter(f=>f.fromId===e.id||f.toId===e.id):[],h=c.filter(f=>f.completed).length,u=c.find(f=>!f.completed&&f.activeCrew),d=u?` \xB7 \u0422\u0440\u0430\u0441\u0441\u0430 ${Math.round(u.buildProgress*100)}%`:` \xB7 \u0422\u0440\u0430\u0441\u0441 ${h}/${c.length}`;i.innerHTML=`
        <div class="city-top">
          <button type="button" class="city-fly-btn" data-flycity="${e.id}" title="\u041F\u043B\u0430\u0432\u043D\u043E \u043F\u0435\u0440\u0435\u043B\u0435\u0442\u0435\u0442\u044C \u043A\u0430\u043C\u0435\u0440\u043E\u0439 \u043A \u0433\u043E\u0440\u043E\u0434\u0443">\u2316 ${e.name}</button>
          <span class="city-badge">${e.levelName} \xB7 ${e.buildingIndices.length} \u0437\u0434.${d}</span>
        </div>
        <div class="city-meta">
          <span>\u041D\u0430\u0441.: ${e.population.toLocaleString("ru-RU")}</span>
          <span>${o}</span>
        </div>
        <div class="progress-track">
          <div class="progress-fill" style="width:${s}%"></div>
        </div>
        ${l}
        ${a}
        ${e.connected?"":`<div class="city-actions"><button class="connect-btn" data-connect="${e.id}">\u25C8 \u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u041B\u042D\u041F (${n.toLocaleString("ru-RU")} \u20BD)</button></div>`}
      `,t.appendChild(i)}t.querySelectorAll("[data-flycity]").forEach(e=>{e.addEventListener("click",()=>{let i=this.economy.cities.findIndex(n=>n.id===e.dataset.flycity);i>=0&&this._flyToCityByIndex(i)})}),t.querySelectorAll("[data-connect]").forEach(e=>{e.addEventListener("click",()=>{let i=this.economy.connectCityGrid(e.dataset.connect);i.ok?this.audio.playBuild():this.notify(i.reason,"warn"),this._renderCityCards(),this._refreshHUD()})})}}_renderWaterBalanceTab(t){let e=document.getElementById("wb-why-note"),i=document.getElementById("wb-meteo-strip"),n=document.getElementById("wb-in-table"),s=document.getElementById("wb-out-table"),o=document.getElementById("wb-node-table");if(!n||!t)return;e&&(e.textContent=t.whenWhySummary),i&&(i.textContent=`\u0414\u043E\u043B\u0438\u043D\u0430: ${t.airTempC>=0?"+":""}${t.airTempC.toFixed(1)}\xB0C \xB7 \u041B\u0435\u0434\u043D\u0438\u043A\u0438: ${t.mountainTempC>=0?"+":""}${t.mountainTempC.toFixed(1)}\xB0C \xB7 \u0412\u043B\u0430\u0436\u043D.: ${t.relHumidityPct}% \xB7 \u0417\u0435\u0440\u043A\u0430\u043B\u043E: ${t.wetAreaHa.toFixed(1)} \u0433\u0430`);let a=c=>`${c.toFixed(1)} \u043C\xB3/\u0441`;n.innerHTML=`
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
    `;let l=t.totalVolumeM3/1e6;o.innerHTML=`
      <div class="wb-row"><span>\u0427\u0435\u0440\u0435\u0437 \u0442\u0443\u0440\u0431\u0438\u043D\u044B \u0413\u042D\u0421 (\u043F\u043E\u043B\u0435\u0437\u043D\u0430\u044F \u0440\u0430\u0431\u043E\u0442\u0430)</span><strong>${a(t.nodeTurbineQ)}</strong></div>
      <div class="wb-row"><span>3D-\u043F\u0435\u0440\u0435\u043B\u0438\u0432 \u043F\u043B\u043E\u0442\u0438\u043D + \u0432\u043E\u0434\u043E\u0441\u0431\u0440\u043E\u0441</span><strong>${a(t.nodeSpillOverflowQ)}</strong></div>
      <div class="wb-row"><span>\u041A\u041F\u0414 \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u044F \u0441\u0442\u043E\u043A\u0430 \u0433\u0438\u0434\u0440\u043E\u0443\u0437\u043B\u043E\u043C</span><strong>${t.hydroUtilizationPct}%</strong></div>
      <div class="wb-row total"><span>\u0417\u0430\u043F\u0430\u0441 \u0432\u043E\u0434\u044B \u0432 \u0431\u0430\u0441\u0441\u0435\u0439\u043D\u0435 \u0441\u0435\u0439\u0447\u0430\u0441</span><strong>${l>=1?l.toFixed(2)+" \u043C\u043B\u043D \u043C\xB3":(t.totalVolumeM3/1e3).toFixed(0)+" \u0442\u044B\u0441. \u043C\xB3"}</strong></div>
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
    `,e.innerHTML=i}_refreshHUD(){if(!this.economy)return;let t=this.economy.getSummary(),e=t.waterReport;document.getElementById("hud-cash").textContent=this.economy.creative?"\u221E \u041A\u0420\u0415\u0410\u0422\u0418\u0412":`${Math.round(t.cash).toLocaleString("ru-RU")} \u20BD`;let i=t.netPerSec>=0?"+":"",n=document.getElementById("hud-net");n.textContent=`${i}${Math.round(t.netPerSec).toLocaleString("ru-RU")} \u20BD/\u0441`,n.style.color=t.netPerSec>=0?"#4ade80":"#f87171";let s=t.pumpedConsumeMW>.1?` (\u0413\u0410\u042D\u0421 -${t.pumpedConsumeMW.toFixed(1)})`:"";document.getElementById("hud-mw").textContent=`${t.totalMW.toFixed(1)} \u041C\u0412\u0442${s}`,document.getElementById("hud-demand").textContent=`\u0421\u0435\u0442\u044C: ${t.suppliedCityMW.toFixed(1)}/${t.connectedDemandMW.toFixed(1)} \xB7 \u041F\u043E\u0442\u0435\u0440\u0438 ${t.gridLossPct}%`;let o=Math.floor(t.hour),a=Math.floor((t.hour-o)*60);document.getElementById("hud-clock").textContent=`\u0414\u0435\u043D\u044C ${t.day} \xB7 ${String(o).padStart(2,"0")}:${String(a).padStart(2,"0")}`,document.getElementById("hud-tariff").textContent=t.periodLabel,document.getElementById("chip-tariff").className=`stat-chip stat-tariff ${t.periodClass}`,document.getElementById("hud-weather").textContent=t.pendingPourM3>5?`\u25B2 \u0411\u0435\u0442\u043E\u043D: ${Math.round(t.pendingPourM3*this.hydro.volPriceNorm)} \u0443\u0441\u043B.\u043C\xB3`:`${t.weather.icon} ${t.weather.label}`,document.getElementById("hud-stockpile").textContent=`\u041F\u0440\u0438\u0442\u043E\u043A +${Math.round(e.inTotalQ)} \xB7 \u0418\u0441\u043F\u0430\u0440. -${e.outEvapQ.toFixed(1)} \u043C\xB3/\u0441`,document.getElementById("hud-pop-total").textContent=`8 \u0433\u043E\u0440\u043E\u0434\u043E\u0432 (${t.totalBuildings} \u0437\u0434.) \xB7 \u0422\u0440\u0430\u0441\u0441 ${t.roadsBuiltCount}/${t.roadsTotalCount} \xB7 ${t.totalPopulation.toLocaleString("ru-RU")} \u0436\u0438\u0442.`,document.getElementById("hud-loan").textContent=`\u0414\u043E\u043B\u0433 \u043F\u043E \u043E\u0431\u043B\u0438\u0433\u0430\u0446\u0438\u044F\u043C: ${Math.round(t.loan).toLocaleString("ru-RU")} \u20BD`;let l=document.getElementById("dam-health-banner"),c=document.getElementById("hud-dam-status"),h=this.hydro.overflowEdges.length;t.pendingPourM3>5?(l.className="dam-health-banner warn",c.textContent="\u0411\u0430\u0448\u0435\u043D\u043D\u044B\u0435 \u043A\u0440\u0430\u043D\u044B \u0431\u0435\u0442\u043E\u043D\u0438\u0440\u0443\u044E\u0442 \u0441\u0442\u0432\u043E\u0440 \u043F\u043B\u043E\u0442\u0438\u043D\u044B\u2026"):t.seepageQ>1.8*L.flowScale||t.maxDamStress>78?(l.className="dam-health-banner warn",c.textContent=`\u041D\u0430\u0433\u0440\u0443\u0437\u043A\u0430 ${Math.round(t.maxDamStress)}% \xB7 \u0424\u0438\u043B\u044C\u0442\u0440\u0430\u0446\u0438\u044F \u0414\u0430\u0440\u0441\u0438! \u0421\u0442\u0430\u0432\u044C\u0442\u0435 [6] \u041A\u043E\u043D\u0442\u0440\u0444\u043E\u0440\u0441`):h>0?(l.className="dam-health-banner",c.textContent=`3D-\u043F\u0435\u0440\u0435\u043B\u0438\u0432 \u0430\u043A\u0442\u0438\u0432\u0435\u043D (${h} \u0441\u0442\u0440\u0443\u0439) \xB7 \u0428\u043B\u044E\u0437\u044B: ${t.navLocksCount} \xB7 \u0420\u044B\u0431\u0445\u043E\u0437\u044B: ${t.fishFarmsCount}`):(l.className="dam-health-banner",c.textContent=`\u041F\u043B\u043E\u0442\u0438\u043D\u0430 ${Math.round(t.maxDamStress)}% \xB7 \u041E\u0420\u0423: ${t.substationsCount} \xB7 \u0428\u043B\u044E\u0437\u044B: ${t.navLocksCount} \xB7 \u0420\u044B\u0431\u0445\u043E\u0437\u044B: ${t.fishFarmsCount}`);let u=_r.find(d=>!this.economy.completedMilestones.has(d.id));u?(document.getElementById("ms-title").textContent=`${u.title} (+${u.reward.toLocaleString("ru-RU")} \u20BD)`,document.getElementById("ms-desc").textContent=u.desc):(document.getElementById("ms-title").textContent="\u0412\u0441\u0435 \u0433\u043E\u0441\u0443\u0434\u0430\u0440\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0435 \u0433\u0440\u0430\u043D\u0442\u044B \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u044B!",document.getElementById("ms-desc").textContent="\u0412\u0430\u0448 \u043A\u0430\u0441\u043A\u0430\u0434 \u0413\u042D\u0421/\u0413\u0410\u042D\u0421 \u0441\u0442\u0430\u043B \u044D\u0442\u0430\u043B\u043E\u043D\u043E\u043C \u0433\u0438\u0434\u0440\u043E\u044D\u043D\u0435\u0440\u0433\u0435\u0442\u0438\u043A\u0438."),this.activeSideTab==="cities"?this._renderCityCards():this.activeSideTab==="water"?this._renderWaterBalanceTab(e):this.activeSideTab==="revenue"&&this._renderRevenueTab(t),this.selectedStruct&&this._refreshInspector()}_refreshInspector(){let t=this.selectedStruct;if(!t)return;let e=document.getElementById("insp-title"),i=document.getElementById("insp-metrics"),n=document.getElementById("insp-slider"),s=document.getElementById("insp-slider-label"),o=document.getElementById("insp-auto"),a=document.getElementById("insp-auto-label"),l=document.getElementById("insp-gaes-row"),c=document.getElementById("insp-gaes"),h=document.getElementById("insp-clean-btn");if(t.kind==="turbine"){e.textContent=`\u2699 ${t.spec.name} (#${t.id})`;let u=Math.round((t.trashLoad||0)*100),d=t.isPumpingNow?`<b style="color:#22d3ee">\u0417\u0430\u043A\u0430\u0447\u043A\u0430 \u0413\u0410\u042D\u0421 (-${t.pumpConsumeMW.toFixed(1)} \u041C\u0412\u0442)</b>`:`<b>${t.powerMW.toFixed(2)} \u041C\u0412\u0442</b>`;i.innerHTML=`
        <span>\u0420\u0435\u0436\u0438\u043C: ${d}</span>
        <span>\u041D\u0430\u043F\u043E\u0440 \u0447\u0438\u0441\u0442.: <b>${t.netHead.toFixed(1)} \u043C</b></span>
        <span>\u0420\u0430\u0441\u0445\u043E\u0434 Q: <b>${Math.abs(t.flowQ).toFixed(1)} \u043C\xB3/\u0441</b></span>
        <span>\u041A\u041F\u0414 \u03B7: <b>${Math.round(t.efficiency*100)}%</b></span>
        <span>\u0420\u0435\u0448\u0451\u0442\u043A\u0430: <b>${u>4?`\u0437\u0430\u0441\u043E\u0440 ${u}%`:"\u0447\u0438\u0441\u0442\u0430\u044F"}</b></span>
        <span>\u041A\u0430\u0432\u0438\u0442\u0430\u0446\u0438\u044F: <b>${t.cavitation>.2?"\u25B2 \u0435\u0441\u0442\u044C":"\u043D\u043E\u0440\u043C\u0430"}</b></span>
      `;let f=Math.round(t.throttle*100);n.value=f,s.textContent=`\u041E\u0442\u043A\u0440\u044B\u0442\u0438\u0435 \u043D\u0430\u043F\u0440\u0430\u0432\u043B\u044F\u044E\u0449\u0435\u0433\u043E \u0430\u043F\u043F\u0430\u0440\u0430\u0442\u0430: ${f}%`,o.checked=!!t.autoDispatch,a.textContent="\u0410\u0432\u0442\u043E-\u0434\u0438\u0441\u043F\u0435\u0442\u0447\u0435\u0440 \u043F\u043E \u043F\u0438\u043A\u0430\u043C \u041E\u0420\u042D\u041C + \u0441\u043E\u0440\u043E\u043E\u0447\u0438\u0441\u0442\u043A\u0430",l&&l.classList.toggle("hidden",!t.spec.reversible),c&&(c.checked=!!t.pumpedStorage),h.classList.toggle("hidden",u<=2)}else{e.textContent=`\u2248 3D-\u0412\u043E\u0434\u043E\u0441\u0431\u0440\u043E\u0441 \u0441 \u0442\u0440\u0430\u043C\u043F\u043B\u0438\u043D\u043E\u043C (#${t.id})`,i.innerHTML=`
        <span>\u0421\u0431\u0440\u043E\u0441 Q: <b>${t.currentFlowQ.toFixed(1)} \u043C\xB3/\u0441</b></span>
        <span>\u0421\u043A\u043E\u0440\u043E\u0441\u0442\u044C \u0441\u0442\u0440\u0443\u0438: <b>${t.jetSpeed.toFixed(1)} \u043C/\u0441</b></span>
        <span>\u041E\u0442\u043C\u0435\u0442\u043A\u0430 \u043F\u043E\u0440\u043E\u0433\u0430: <b>${t.sillElev.toFixed(1)} \u043C</b></span>
        <span>\u0423\u0441\u0442\u0430\u0432\u043A\u0430 \u0431\u044C\u0435\u0444\u0430: <b>${t.targetHeadElev.toFixed(1)} \u043C</b></span>
      `;let u=Math.round(t.openRatio*100);n.value=u,s.textContent=`\u041F\u043E\u0434\u044A\u0451\u043C \u0441\u0435\u0433\u043C\u0435\u043D\u0442\u043D\u043E\u0433\u043E \u0437\u0430\u0442\u0432\u043E\u0440\u0430: ${u}%`,o.checked=!!t.autoRegulate,a.textContent="\u0410\u0432\u0442\u043E-\u0441\u0431\u0440\u043E\u0441 \u043F\u0430\u0432\u043E\u0434\u043A\u0430 \u043F\u0440\u0438 \u043F\u0435\u0440\u0435\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u0438 \u0431\u044C\u0435\u0444\u0430",l&&l.classList.add("hidden"),h.classList.add("hidden")}}notify(t,e="info"){let i=document.getElementById("toast-stack");if(!i)return;let n=document.createElement("div");for(n.className=`toast ${e}`,n.textContent=t,i.prepend(n);i.children.length>4;)i.lastElementChild.remove();setTimeout(()=>{n.parentNode&&n.remove()},5200)}_loop(t){requestAnimationFrame(d=>this._loop(d));let e=Math.min(.08,Math.max(.001,(t-this._lastTime)/1e3));if(this._lastTime=t,this._frameCount++,this._fpsFrames++,this._fpsAccum+=e,this._fpsAccum>=.5&&(this.fps=Math.round(this._fpsFrames/this._fpsAccum),this._fpsFrames=0,this._fpsAccum=0),this.isInPreGameLoader){this.hydro.step(e*.75,4);let d=this.hydro.sampleAtWorld(this.camCtrl.goalTarget.x,this.camCtrl.goalTarget.z).bed;this.camCtrl.updatePreviewOrbit(e,d);let f=$e[this.economy.weatherId]||$e.normal;this.worldView.updateAtmosphere(this.economy.hour,f,this.camCtrl.target,e),this.worldView.updateWaterAndWetness(this.hydro.simTime),this.renderer.shadowMap.enabled&&this._frameCount%6===0&&(this.renderer.shadowMap.needsUpdate=!0),this.renderer.render(this.scene,this.camera);return}let i=Rc[this.speedIndex];if(i>0){let d=i<=2?1:2,f=e*i/d;for(let g=0;g<d;g++)this.hydro.step(f,this.profile.substepsCap);this.economy.update(e*i)}let n=this.hydro.sampleAtWorld(this.camCtrl.goalTarget.x,this.camCtrl.goalTarget.z).bed;this.camCtrl.update(e,n,(d,f)=>this.hydro.sampleAtWorld(d,f).bed);let s=$e[this.economy.weatherId]||$e.normal,o=e*Math.max(0,Math.min(2.5,i)),{dayFactor:a}=this.worldView.updateAtmosphere(this.economy.hour,s,this.camCtrl.target,o),l=this.hydro.consumeTerrainDirty();l&&(this.worldView.updateTerrainGeometryRect(l.x0,l.z0,l.x1,l.z1),this.renderer.shadowMap.enabled&&(this.renderer.shadowMap.needsUpdate=!0)),this.worldView.updateWaterAndWetness(this.hydro.simTime),this.worldView.syncEngineeredVolumes(),this.worldView.animateConstructionCranes(this.hydro.simTime),this.worldView.syncHydroStructures(this.hydro.simTime),(this.economy.buildingsDirty||this._frameCount%12===0)&&(this.worldView.syncCityInstances(),this.economy.buildingsDirty=!1,this.renderer.shadowMap.enabled&&this.profile.shadowEvery>0&&this._frameCount%30===0&&(this.renderer.shadowMap.needsUpdate=!0));let c=this.economy.weatherId==="flood"?1:this.economy.weatherId==="rain"?.6:0;this.spray.update(e*Math.max(1,Math.min(2,i)),this.hydro,this.camCtrl.target,a,c);let h=this.hydro.lastCrestOverflowQ||0,u=1/0;for(let d of this.hydro.spillways){h+=d.currentFlowQ;let f=Math.hypot(d.wx-this.camCtrl.target.x,d.wz-this.camCtrl.target.z);f<u&&(u=f)}for(let d of this.hydro.turbines){let f=Math.hypot(d.wx-this.camCtrl.target.x,d.wz-this.camCtrl.target.z);f<u&&(u=f)}if(this.audio.updateContinuous(this.camCtrl.distance,h,this.economy.totalMW,u),this.renderer.shadowMap.enabled&&this.profile.shadowEvery>0&&this._frameCount%this.profile.shadowEvery===0&&(this.renderer.shadowMap.needsUpdate=!0),this.renderer.render(this.scene,this.camera),this._uiRefreshAccum+=e,this._uiRefreshAccum>=.25&&(this._uiRefreshAccum=0,this.tutorial.update(),this._refreshHUD(),this.showDiag)){let d=document.getElementById("diag-panel");d.textContent=Bd({fps:this.fps,hydroMs:this.hydro.lastStepMs,grid:`${this.hydro.grid}\xD7${this.hydro.grid} (${L.size}\xD7${L.size}\u043C)`,activeTiles:this.hydro.activeTileCount,totalTiles:this.hydro.totalTiles,substeps:this.hydro.lastSubsteps,waterVolumeM3:this.hydro.totalWaterVolumeM3,drawCalls:this.renderer.info.render.calls,triangles:this.renderer.info.render.triangles,cityBuildings:this.economy.allBuildings.length,shadows:this.renderer.shadowMap.enabled?`\u0432\u043A\u043B (1/${this.profile.shadowEvery} \u043A\u0430\u0434\u0440\u0430)`:"\u0432\u044B\u043A\u043B"})}}};window.addEventListener("DOMContentLoaded",()=>{window.__game=new Ic});})();
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2026 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
