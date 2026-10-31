(()=>{var jc=0,pl=1,th=2;var Fn=1,eh=2,ds=3,zi=0,je=1,qe=2,ki=0,_n=1,ml=2,gl=3,xl=4,ih=5;var Bn=100,nh=101,sh=102,rh=103,oh=104,ah=200,lh=201,ch=202,hh=203,_l=204,yl=205,uh=206,dh=207,fh=208,ph=209,mh=210,gh=211,xh=212,_h=213,yh=214,zr=0,kr=1,Hr=2,ss=3,Gr=4,Vr=5,Wr=6,Xr=7,Zs=0,vh=1,Mh=2,Ei=0,vl=1,Ml=2,bl=3,Sl=4,wl=5,El=6,Tl=7;var Al=300,yn=301,On=302,bo=303,So=304,Js=306,Pn=1e3,Di=1001,qr=1002,Ne=1003,bh=1004;var Ks=1005;var Ce=1006,wo=1007;var Hi=1008;var ri=1009,Cl=1010,Rl=1011,fs=1012,Eo=1013,Ti=1014,gi=1015,Ai=1016,To=1017,Ao=1018,ps=1020,Pl=35902,Il=35899,Ll=1021,Dl=1022,oi=1023,Ni=1026,vn=1027,Co=1028,Ro=1029,Mn=1030,Po=1031;var Io=1033,Qs=33776,js=33777,tr=33778,er=33779,Lo=35840,Do=35841,No=35842,Uo=35843,Fo=36196,Bo=37492,Oo=37496,zo=37488,ko=37489,ir=37490,Ho=37491,Go=37808,Vo=37809,Wo=37810,Xo=37811,qo=37812,Yo=37813,$o=37814,Zo=37815,Jo=37816,Ko=37817,Qo=37818,jo=37819,ta=37820,ea=37821,ia=36492,na=36494,sa=36495,ra=36283,oa=36284,nr=36285,aa=36286;var Rs=2300,Yr=2301,Br=2302,rl=2303,ol=2400,al=2401,ll=2402;var Sh=3200;var sr=0,wh=1,tn="",Je="srgb",Ps="srgb-linear",Is="linear",oe="srgb";var Or=7680;var Eh=519,Th=512,Ah=513,Ch=514,la=515,Rh=516,Ph=517,ca=518,Ih=519,Lh=35044,ti=35048;var Nl="300 es",Si=2e3,rs=2001;function Uu(s){for(let t=s.length-1;t>=0;--t)if(s[t]>=65535)return!0;return!1}function Fu(s){return ArrayBuffer.isView(s)&&!(s instanceof DataView)}function Ls(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function Dh(){let s=Ls("canvas");return s.style.display="block",s}var bc={},os=null;function Ul(...s){let t="THREE."+s.shift();os?os("log",t,...s):console.log(t,...s)}function Nh(s){let t=s[0];if(typeof t=="string"&&t.startsWith("TSL:")){let e=s[1];e&&e.isStackTrace?s[0]+=" "+e.getLocation():s[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return s}function Dt(...s){s=Nh(s);let t="THREE."+s.shift();if(os)os("warn",t,...s);else{let e=s[0];e&&e.isStackTrace?console.warn(e.getError(t)):console.warn(t,...s)}}function Ft(...s){s=Nh(s);let t="THREE."+s.shift();if(os)os("error",t,...s);else{let e=s[0];e&&e.isStackTrace?console.error(e.getError(t)):console.error(t,...s)}}function Rn(...s){let t=s.join(" ");t in bc||(bc[t]=!0,Dt(...s))}function Uh(s,t,e){return new Promise(function(i,n){function r(){switch(s.clientWaitSync(t,s.SYNC_FLUSH_COMMANDS_BIT,0)){case s.WAIT_FAILED:n();break;case s.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:i()}}setTimeout(r,e)})}var Fh={[zr]:kr,[Hr]:Wr,[Gr]:Xr,[ss]:Vr,[kr]:zr,[Wr]:Hr,[Xr]:Gr,[Vr]:ss},Ui=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[t]===void 0&&(i[t]=[]),i[t].indexOf(e)===-1&&i[t].push(e)}hasEventListener(t,e){let i=this._listeners;return i===void 0?!1:i[t]!==void 0&&i[t].indexOf(e)!==-1}removeEventListener(t,e){let i=this._listeners;if(i===void 0)return;let n=i[t];if(n!==void 0){let r=n.indexOf(e);r!==-1&&n.splice(r,1)}}dispatchEvent(t){let e=this._listeners;if(e===void 0)return;let i=e[t.type];if(i!==void 0){t.target=this;let n=i.slice(0);for(let r=0,o=n.length;r<o;r++)n[r].call(this,t);t.target=null}}},Ge=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var Ua=Math.PI/180,$r=180/Math.PI;function rr(){let s=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(Ge[s&255]+Ge[s>>8&255]+Ge[s>>16&255]+Ge[s>>24&255]+"-"+Ge[t&255]+Ge[t>>8&255]+"-"+Ge[t>>16&15|64]+Ge[t>>24&255]+"-"+Ge[e&63|128]+Ge[e>>8&255]+"-"+Ge[e>>16&255]+Ge[e>>24&255]+Ge[i&255]+Ge[i>>8&255]+Ge[i>>16&255]+Ge[i>>24&255]).toLowerCase()}function Kt(s,t,e){return Math.max(t,Math.min(e,s))}function Bu(s,t){return(s%t+t)%t}function Fa(s,t,e){return(1-e)*s+e*t}function Ms(s,t){switch(t.constructor){case Float32Array:return s;case Uint32Array:return s/4294967295;case Uint16Array:return s/65535;case Uint8Array:case Uint8ClampedArray:return s/255;case Int32Array:return Math.max(s/2147483647,-1);case Int16Array:return Math.max(s/32767,-1);case Int8Array:return Math.max(s/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function ni(s,t){switch(t.constructor){case Float32Array:return s;case Uint32Array:return Math.round(s*4294967295);case Uint16Array:return Math.round(s*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(s*255);case Int32Array:return Math.round(s*2147483647);case Int16Array:return Math.round(s*32767);case Int8Array:return Math.round(s*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var kl=class kl{constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,i=this.y,n=t.elements;return this.x=n[0]*e+n[3]*i+n[6],this.y=n[1]*e+n[4]*i+n[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Kt(this.x,t.x,e.x),this.y=Kt(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=Kt(this.x,t,e),this.y=Kt(this.y,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Kt(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let i=this.dot(t)/e;return Math.acos(Kt(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,i=this.y-t.y;return e*e+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let i=Math.cos(e),n=Math.sin(e),r=this.x-t.x,o=this.y-t.y;return this.x=r*i-o*n+t.x,this.y=r*n+o*i+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};kl.prototype.isVector2=!0;var Wt=kl,fi=class{constructor(t=0,e=0,i=0,n=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=i,this._w=n}static slerpFlat(t,e,i,n,r,o,a){let l=i[n+0],c=i[n+1],h=i[n+2],d=i[n+3],u=r[o+0],f=r[o+1],g=r[o+2],_=r[o+3];if(d!==_||l!==u||c!==f||h!==g){let m=l*u+c*f+h*g+d*_;m<0&&(u=-u,f=-f,g=-g,_=-_,m=-m);let p=1-a;if(m<.9995){let b=Math.acos(m),T=Math.sin(b);p=Math.sin(p*b)/T,a=Math.sin(a*b)/T,l=l*p+u*a,c=c*p+f*a,h=h*p+g*a,d=d*p+_*a}else{l=l*p+u*a,c=c*p+f*a,h=h*p+g*a,d=d*p+_*a;let b=1/Math.sqrt(l*l+c*c+h*h+d*d);l*=b,c*=b,h*=b,d*=b}}t[e]=l,t[e+1]=c,t[e+2]=h,t[e+3]=d}static multiplyQuaternionsFlat(t,e,i,n,r,o){let a=i[n],l=i[n+1],c=i[n+2],h=i[n+3],d=r[o],u=r[o+1],f=r[o+2],g=r[o+3];return t[e]=a*g+h*d+l*f-c*u,t[e+1]=l*g+h*u+c*d-a*f,t[e+2]=c*g+h*f+a*u-l*d,t[e+3]=h*g-a*d-l*u-c*f,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,i,n){return this._x=t,this._y=e,this._z=i,this._w=n,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let i=t._x,n=t._y,r=t._z,o=t._order,a=Math.cos,l=Math.sin,c=a(i/2),h=a(n/2),d=a(r/2),u=l(i/2),f=l(n/2),g=l(r/2);switch(o){case"XYZ":this._x=u*h*d+c*f*g,this._y=c*f*d-u*h*g,this._z=c*h*g+u*f*d,this._w=c*h*d-u*f*g;break;case"YXZ":this._x=u*h*d+c*f*g,this._y=c*f*d-u*h*g,this._z=c*h*g-u*f*d,this._w=c*h*d+u*f*g;break;case"ZXY":this._x=u*h*d-c*f*g,this._y=c*f*d+u*h*g,this._z=c*h*g+u*f*d,this._w=c*h*d-u*f*g;break;case"ZYX":this._x=u*h*d-c*f*g,this._y=c*f*d+u*h*g,this._z=c*h*g-u*f*d,this._w=c*h*d+u*f*g;break;case"YZX":this._x=u*h*d+c*f*g,this._y=c*f*d+u*h*g,this._z=c*h*g-u*f*d,this._w=c*h*d-u*f*g;break;case"XZY":this._x=u*h*d-c*f*g,this._y=c*f*d-u*h*g,this._z=c*h*g+u*f*d,this._w=c*h*d+u*f*g;break;default:Dt("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let i=e/2,n=Math.sin(i);return this._x=t.x*n,this._y=t.y*n,this._z=t.z*n,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,i=e[0],n=e[4],r=e[8],o=e[1],a=e[5],l=e[9],c=e[2],h=e[6],d=e[10],u=i+a+d;if(u>0){let f=.5/Math.sqrt(u+1);this._w=.25/f,this._x=(h-l)*f,this._y=(r-c)*f,this._z=(o-n)*f}else if(i>a&&i>d){let f=2*Math.sqrt(1+i-a-d);this._w=(h-l)/f,this._x=.25*f,this._y=(n+o)/f,this._z=(r+c)/f}else if(a>d){let f=2*Math.sqrt(1+a-i-d);this._w=(r-c)/f,this._x=(n+o)/f,this._y=.25*f,this._z=(l+h)/f}else{let f=2*Math.sqrt(1+d-i-a);this._w=(o-n)/f,this._x=(r+c)/f,this._y=(l+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let i=t.dot(e)+1;return i<1e-8?(i=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=i):(this._x=0,this._y=-t.z,this._z=t.y,this._w=i)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=i),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(Kt(this.dot(t),-1,1)))}rotateTowards(t,e){let i=this.angleTo(t);if(i===0)return this;let n=Math.min(1,e/i);return this.slerp(t,n),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let i=t._x,n=t._y,r=t._z,o=t._w,a=e._x,l=e._y,c=e._z,h=e._w;return this._x=i*h+o*a+n*c-r*l,this._y=n*h+o*l+r*a-i*c,this._z=r*h+o*c+i*l-n*a,this._w=o*h-i*a-n*l-r*c,this._onChangeCallback(),this}slerp(t,e){let i=t._x,n=t._y,r=t._z,o=t._w,a=this.dot(t);a<0&&(i=-i,n=-n,r=-r,o=-o,a=-a);let l=1-e;if(a<.9995){let c=Math.acos(a),h=Math.sin(c);l=Math.sin(l*c)/h,e=Math.sin(e*c)/h,this._x=this._x*l+i*e,this._y=this._y*l+n*e,this._z=this._z*l+r*e,this._w=this._w*l+o*e,this._onChangeCallback()}else this._x=this._x*l+i*e,this._y=this._y*l+n*e,this._z=this._z*l+r*e,this._w=this._w*l+o*e,this.normalize();return this}slerpQuaternions(t,e,i){return this.copy(t).slerp(e,i)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),i=Math.random(),n=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(n*Math.sin(t),n*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},Hl=class Hl{constructor(t=0,e=0,i=0){this.x=t,this.y=e,this.z=i}set(t,e,i){return i===void 0&&(i=this.z),this.x=t,this.y=e,this.z=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(Sc.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(Sc.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,i=this.y,n=this.z,r=t.elements;return this.x=r[0]*e+r[3]*i+r[6]*n,this.y=r[1]*e+r[4]*i+r[7]*n,this.z=r[2]*e+r[5]*i+r[8]*n,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,i=this.y,n=this.z,r=t.elements,o=1/(r[3]*e+r[7]*i+r[11]*n+r[15]);return this.x=(r[0]*e+r[4]*i+r[8]*n+r[12])*o,this.y=(r[1]*e+r[5]*i+r[9]*n+r[13])*o,this.z=(r[2]*e+r[6]*i+r[10]*n+r[14])*o,this}applyQuaternion(t){let e=this.x,i=this.y,n=this.z,r=t.x,o=t.y,a=t.z,l=t.w,c=2*(o*n-a*i),h=2*(a*e-r*n),d=2*(r*i-o*e);return this.x=e+l*c+o*d-a*h,this.y=i+l*h+a*c-r*d,this.z=n+l*d+r*h-o*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,i=this.y,n=this.z,r=t.elements;return this.x=r[0]*e+r[4]*i+r[8]*n,this.y=r[1]*e+r[5]*i+r[9]*n,this.z=r[2]*e+r[6]*i+r[10]*n,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Kt(this.x,t.x,e.x),this.y=Kt(this.y,t.y,e.y),this.z=Kt(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=Kt(this.x,t,e),this.y=Kt(this.y,t,e),this.z=Kt(this.z,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Kt(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let i=t.x,n=t.y,r=t.z,o=e.x,a=e.y,l=e.z;return this.x=n*l-r*a,this.y=r*o-i*l,this.z=i*a-n*o,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let i=t.dot(this)/e;return this.copy(t).multiplyScalar(i)}projectOnPlane(t){return Ba.copy(this).projectOnVector(t),this.sub(Ba)}reflect(t){return this.sub(Ba.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let i=this.dot(t)/e;return Math.acos(Kt(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,i=this.y-t.y,n=this.z-t.z;return e*e+i*i+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,i){let n=Math.sin(e)*t;return this.x=n*Math.sin(i),this.y=Math.cos(e)*t,this.z=n*Math.cos(i),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,i){return this.x=t*Math.sin(e),this.y=i,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),i=this.setFromMatrixColumn(t,1).length(),n=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=i,this.z=n,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,i=Math.sqrt(1-e*e);return this.x=i*Math.cos(t),this.y=e,this.z=i*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};Hl.prototype.isVector3=!0;var O=Hl,Ba=new O,Sc=new fi,Gl=class Gl{constructor(t,e,i,n,r,o,a,l,c){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,i,n,r,o,a,l,c)}set(t,e,i,n,r,o,a,l,c){let h=this.elements;return h[0]=t,h[1]=n,h[2]=a,h[3]=e,h[4]=r,h[5]=l,h[6]=i,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],this}extractBasis(t,e,i){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let i=t.elements,n=e.elements,r=this.elements,o=i[0],a=i[3],l=i[6],c=i[1],h=i[4],d=i[7],u=i[2],f=i[5],g=i[8],_=n[0],m=n[3],p=n[6],b=n[1],T=n[4],y=n[7],v=n[2],S=n[5],A=n[8];return r[0]=o*_+a*b+l*v,r[3]=o*m+a*T+l*S,r[6]=o*p+a*y+l*A,r[1]=c*_+h*b+d*v,r[4]=c*m+h*T+d*S,r[7]=c*p+h*y+d*A,r[2]=u*_+f*b+g*v,r[5]=u*m+f*T+g*S,r[8]=u*p+f*y+g*A,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],i=t[1],n=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8];return e*o*h-e*a*c-i*r*h+i*a*l+n*r*c-n*o*l}invert(){let t=this.elements,e=t[0],i=t[1],n=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8],d=h*o-a*c,u=a*l-h*r,f=c*r-o*l,g=e*d+i*u+n*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let _=1/g;return t[0]=d*_,t[1]=(n*c-h*i)*_,t[2]=(a*i-n*o)*_,t[3]=u*_,t[4]=(h*e-n*l)*_,t[5]=(n*r-a*e)*_,t[6]=f*_,t[7]=(i*l-c*e)*_,t[8]=(o*e-i*r)*_,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,i,n,r,o,a){let l=Math.cos(r),c=Math.sin(r);return this.set(i*l,i*c,-i*(l*o+c*a)+o+t,-n*c,n*l,-n*(-c*o+l*a)+a+e,0,0,1),this}scale(t,e){return Rn("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Oa.makeScale(t,e)),this}rotate(t){return Rn("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Oa.makeRotation(-t)),this}translate(t,e){return Rn("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Oa.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,i,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,i=t.elements;for(let n=0;n<9;n++)if(e[n]!==i[n])return!1;return!0}fromArray(t,e=0){for(let i=0;i<9;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){let i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t}clone(){return new this.constructor().fromArray(this.elements)}};Gl.prototype.isMatrix3=!0;var kt=Gl,Oa=new kt,wc=new kt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Ec=new kt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Ou(){let s={enabled:!0,workingColorSpace:Ps,spaces:{},convert:function(n,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===oe&&(n.r=ji(n.r),n.g=ji(n.g),n.b=ji(n.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(n.applyMatrix3(this.spaces[r].toXYZ),n.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===oe&&(n.r=ns(n.r),n.g=ns(n.g),n.b=ns(n.b))),n},workingToColorSpace:function(n,r){return this.convert(n,this.workingColorSpace,r)},colorSpaceToWorking:function(n,r){return this.convert(n,r,this.workingColorSpace)},getPrimaries:function(n){return this.spaces[n].primaries},getTransfer:function(n){return n===tn?Is:this.spaces[n].transfer},getToneMappingMode:function(n){return this.spaces[n].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(n,r=this.workingColorSpace){return n.fromArray(this.spaces[r].luminanceCoefficients)},define:function(n){Object.assign(this.spaces,n)},_getMatrix:function(n,r,o){return n.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(n){return this.spaces[n].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(n=this.workingColorSpace){return this.spaces[n].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(n,r){return Rn("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),s.workingToColorSpace(n,r)},toWorkingColorSpace:function(n,r){return Rn("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),s.colorSpaceToWorking(n,r)}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],i=[.3127,.329];return s.define({[Ps]:{primaries:t,whitePoint:i,transfer:Is,toXYZ:wc,fromXYZ:Ec,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:Je},outputColorSpaceConfig:{drawingBufferColorSpace:Je}},[Je]:{primaries:t,whitePoint:i,transfer:oe,toXYZ:wc,fromXYZ:Ec,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:Je}}}),s}var Zt=Ou();function ji(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function ns(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}var Vn,Zr=class{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let i;if(t instanceof HTMLCanvasElement)i=t;else{Vn===void 0&&(Vn=Ls("canvas")),Vn.width=t.width,Vn.height=t.height;let n=Vn.getContext("2d");t instanceof ImageData?n.putImageData(t,0,0):n.drawImage(t,0,0,t.width,t.height),i=Vn}return i.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=Ls("canvas");e.width=t.width,e.height=t.height;let i=e.getContext("2d");i.drawImage(t,0,0,t.width,t.height);let n=i.getImageData(0,0,t.width,t.height),r=n.data;for(let o=0;o<r.length;o++)r[o]=ji(r[o]/255)*255;return i.putImageData(n,0,0),e}else if(t.data){let e=t.data.slice(0);for(let i=0;i<e.length;i++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[i]=Math.floor(ji(e[i]/255)*255):e[i]=ji(e[i]);return{data:e,width:t.width,height:t.height}}else return Dt("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},zu=0,as=class{constructor(t=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:zu++}),this.uuid=rr(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let e=this.data;return typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):typeof VideoFrame<"u"&&e instanceof VideoFrame?t.set(e.displayWidth,e.displayHeight,0):e!==null?t.set(e.width,e.height,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let i={uuid:this.uuid,url:""},n=this.data;if(n!==null){let r;if(Array.isArray(n)){r=[];for(let o=0,a=n.length;o<a;o++)n[o].isDataTexture?r.push(za(n[o].image)):r.push(za(n[o]))}else r=za(n);i.url=r}return e||(t.images[this.uuid]=i),i}};function za(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?Zr.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(Dt("Texture: Unable to serialize Texture."),{})}var ku=0,ka=new O,Ke=class s extends Ui{constructor(t=s.DEFAULT_IMAGE,e=s.DEFAULT_MAPPING,i=Di,n=Di,r=Ce,o=Hi,a=oi,l=ri,c=s.DEFAULT_ANISOTROPY,h=tn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:ku++}),this.uuid=rr(),this.name="",this.source=new as(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=i,this.wrapT=n,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new Wt(0,0),this.repeat=new Wt(1,1),this.center=new Wt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new kt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(ka).x}get height(){return this.source.getSize(ka).y}get depth(){return this.source.getSize(ka).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let e in t){let i=t[e];if(i===void 0){Dt(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}let n=this[e];if(n===void 0){Dt(`Texture.setValues(): property '${e}' does not exist.`);continue}n&&i&&n.isVector2&&i.isVector2||n&&i&&n.isVector3&&i.isVector3||n&&i&&n.isMatrix3&&i.isMatrix3?n.copy(i):this[e]=i}}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),e||(t.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==Al)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case Pn:t.x=t.x-Math.floor(t.x);break;case Di:t.x=t.x<0?0:1;break;case qr:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case Pn:t.y=t.y-Math.floor(t.y);break;case Di:t.y=t.y<0?0:1;break;case qr:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};Ke.DEFAULT_IMAGE=null;Ke.DEFAULT_MAPPING=Al;Ke.DEFAULT_ANISOTROPY=1;var Vl=class Vl{constructor(t=0,e=0,i=0,n=1){this.x=t,this.y=e,this.z=i,this.w=n}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,i,n){return this.x=t,this.y=e,this.z=i,this.w=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,i=this.y,n=this.z,r=this.w,o=t.elements;return this.x=o[0]*e+o[4]*i+o[8]*n+o[12]*r,this.y=o[1]*e+o[5]*i+o[9]*n+o[13]*r,this.z=o[2]*e+o[6]*i+o[10]*n+o[14]*r,this.w=o[3]*e+o[7]*i+o[11]*n+o[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,i,n,r,l=t.elements,c=l[0],h=l[4],d=l[8],u=l[1],f=l[5],g=l[9],_=l[2],m=l[6],p=l[10];if(Math.abs(h-u)<.01&&Math.abs(d-_)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+u)<.1&&Math.abs(d+_)<.1&&Math.abs(g+m)<.1&&Math.abs(c+f+p-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let T=(c+1)/2,y=(f+1)/2,v=(p+1)/2,S=(h+u)/4,A=(d+_)/4,x=(g+m)/4;return T>y&&T>v?T<.01?(i=0,n=.707106781,r=.707106781):(i=Math.sqrt(T),n=S/i,r=A/i):y>v?y<.01?(i=.707106781,n=0,r=.707106781):(n=Math.sqrt(y),i=S/n,r=x/n):v<.01?(i=.707106781,n=.707106781,r=0):(r=Math.sqrt(v),i=A/r,n=x/r),this.set(i,n,r,e),this}let b=Math.sqrt((m-g)*(m-g)+(d-_)*(d-_)+(u-h)*(u-h));return Math.abs(b)<.001&&(b=1),this.x=(m-g)/b,this.y=(d-_)/b,this.z=(u-h)/b,this.w=Math.acos((c+f+p-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Kt(this.x,t.x,e.x),this.y=Kt(this.y,t.y,e.y),this.z=Kt(this.z,t.z,e.z),this.w=Kt(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=Kt(this.x,t,e),this.y=Kt(this.y,t,e),this.z=Kt(this.z,t,e),this.w=Kt(this.w,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(Kt(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this.w=t.w+(e.w-t.w)*i,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};Vl.prototype.isVector4=!0;var xe=Vl,Jr=class extends Ui{constructor(t=1,e=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Ce,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=i.depth,this.scissor=new xe(0,0,t,e),this.scissorTest=!1,this.viewport=new xe(0,0,t,e),this.textures=[];let n={width:t,height:e,depth:i.depth},r=new Ke(n),o=i.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveColorBuffer=i.resolveColorBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.storeMultisampledColorBuffer=i.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=i.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=i.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(t={}){let e={minFilter:Ce,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),t!==null&&t.renderTarget===null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,i=1){if(this.width!==t||this.height!==e||this.depth!==i){this.width=t,this.height=e,this.depth=i;for(let n=0,r=this.textures.length;n<r;n++)this.textures[n].image.width=t,this.textures[n].image.height=e,this.textures[n].image.depth=i,this.textures[n].isData3DTexture!==!0&&(this.textures[n].isArrayTexture=this.textures[n].image.depth>1);this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,i=t.textures.length;e<i;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;let n=Object.assign({},t.textures[e].image);this.textures[e].source=new as(n)}if(this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveColorBuffer=t.resolveColorBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,this.storeMultisampledColorBuffer=t.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=t.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=t.storeMultisampledStencilBuffer,t.depthTexture!==null)if(t.depthTexture.renderTarget===t){let e=t.depthTexture.clone();e.renderTarget=null,this.depthTexture=e}else this.depthTexture=t.depthTexture;return this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},si=class extends Jr{constructor(t=1,e=1,i={}){super(t,e,i),this.isWebGLRenderTarget=!0}},Ds=class extends Ke{constructor(t=null,e=1,i=1,n=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:i,depth:n},this.magFilter=Ne,this.minFilter=Ne,this.wrapR=Di,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var Kr=class extends Ke{constructor(t=null,e=1,i=1,n=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:i,depth:n},this.magFilter=Ne,this.minFilter=Ne,this.wrapR=Di,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}};var Mo=class Mo{constructor(t,e,i,n,r,o,a,l,c,h,d,u,f,g,_,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,i,n,r,o,a,l,c,h,d,u,f,g,_,m)}set(t,e,i,n,r,o,a,l,c,h,d,u,f,g,_,m){let p=this.elements;return p[0]=t,p[4]=e,p[8]=i,p[12]=n,p[1]=r,p[5]=o,p[9]=a,p[13]=l,p[2]=c,p[6]=h,p[10]=d,p[14]=u,p[3]=f,p[7]=g,p[11]=_,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Mo().fromArray(this.elements)}copy(t){let e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],e[9]=i[9],e[10]=i[10],e[11]=i[11],e[12]=i[12],e[13]=i[13],e[14]=i[14],e[15]=i[15],this}copyPosition(t){let e=this.elements,i=t.elements;return e[12]=i[12],e[13]=i[13],e[14]=i[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,i){return this.determinantAffine()===0?(t.set(1,0,0),e.set(0,1,0),i.set(0,0,1),this):(t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(t,e,i){return this.set(t.x,e.x,i.x,0,t.y,e.y,i.y,0,t.z,e.z,i.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();let e=this.elements,i=t.elements,n=1/Wn.setFromMatrixColumn(t,0).length(),r=1/Wn.setFromMatrixColumn(t,1).length(),o=1/Wn.setFromMatrixColumn(t,2).length();return e[0]=i[0]*n,e[1]=i[1]*n,e[2]=i[2]*n,e[3]=0,e[4]=i[4]*r,e[5]=i[5]*r,e[6]=i[6]*r,e[7]=0,e[8]=i[8]*o,e[9]=i[9]*o,e[10]=i[10]*o,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,i=t.x,n=t.y,r=t.z,o=Math.cos(i),a=Math.sin(i),l=Math.cos(n),c=Math.sin(n),h=Math.cos(r),d=Math.sin(r);if(t.order==="XYZ"){let u=o*h,f=o*d,g=a*h,_=a*d;e[0]=l*h,e[4]=-l*d,e[8]=c,e[1]=f+g*c,e[5]=u-_*c,e[9]=-a*l,e[2]=_-u*c,e[6]=g+f*c,e[10]=o*l}else if(t.order==="YXZ"){let u=l*h,f=l*d,g=c*h,_=c*d;e[0]=u+_*a,e[4]=g*a-f,e[8]=o*c,e[1]=o*d,e[5]=o*h,e[9]=-a,e[2]=f*a-g,e[6]=_+u*a,e[10]=o*l}else if(t.order==="ZXY"){let u=l*h,f=l*d,g=c*h,_=c*d;e[0]=u-_*a,e[4]=-o*d,e[8]=g+f*a,e[1]=f+g*a,e[5]=o*h,e[9]=_-u*a,e[2]=-o*c,e[6]=a,e[10]=o*l}else if(t.order==="ZYX"){let u=o*h,f=o*d,g=a*h,_=a*d;e[0]=l*h,e[4]=g*c-f,e[8]=u*c+_,e[1]=l*d,e[5]=_*c+u,e[9]=f*c-g,e[2]=-c,e[6]=a*l,e[10]=o*l}else if(t.order==="YZX"){let u=o*l,f=o*c,g=a*l,_=a*c;e[0]=l*h,e[4]=_-u*d,e[8]=g*d+f,e[1]=d,e[5]=o*h,e[9]=-a*h,e[2]=-c*h,e[6]=f*d+g,e[10]=u-_*d}else if(t.order==="XZY"){let u=o*l,f=o*c,g=a*l,_=a*c;e[0]=l*h,e[4]=-d,e[8]=c*h,e[1]=u*d+_,e[5]=o*h,e[9]=f*d-g,e[2]=g*d-f,e[6]=a*h,e[10]=_*d+u}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(Hu,t,Gu)}lookAt(t,e,i){let n=this.elements;return ai.subVectors(t,e),ai.lengthSq()===0&&(ai.z=1),ai.normalize(),on.crossVectors(i,ai),on.lengthSq()===0&&(Math.abs(i.z)===1?ai.x+=1e-4:ai.z+=1e-4,ai.normalize(),on.crossVectors(i,ai)),on.normalize(),fr.crossVectors(ai,on),n[0]=on.x,n[4]=fr.x,n[8]=ai.x,n[1]=on.y,n[5]=fr.y,n[9]=ai.y,n[2]=on.z,n[6]=fr.z,n[10]=ai.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let i=t.elements,n=e.elements,r=this.elements,o=i[0],a=i[4],l=i[8],c=i[12],h=i[1],d=i[5],u=i[9],f=i[13],g=i[2],_=i[6],m=i[10],p=i[14],b=i[3],T=i[7],y=i[11],v=i[15],S=n[0],A=n[4],x=n[8],E=n[12],R=n[1],I=n[5],D=n[9],C=n[13],P=n[2],N=n[6],q=n[10],W=n[14],tt=n[3],k=n[7],X=n[11],H=n[15];return r[0]=o*S+a*R+l*P+c*tt,r[4]=o*A+a*I+l*N+c*k,r[8]=o*x+a*D+l*q+c*X,r[12]=o*E+a*C+l*W+c*H,r[1]=h*S+d*R+u*P+f*tt,r[5]=h*A+d*I+u*N+f*k,r[9]=h*x+d*D+u*q+f*X,r[13]=h*E+d*C+u*W+f*H,r[2]=g*S+_*R+m*P+p*tt,r[6]=g*A+_*I+m*N+p*k,r[10]=g*x+_*D+m*q+p*X,r[14]=g*E+_*C+m*W+p*H,r[3]=b*S+T*R+y*P+v*tt,r[7]=b*A+T*I+y*N+v*k,r[11]=b*x+T*D+y*q+v*X,r[15]=b*E+T*C+y*W+v*H,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],i=t[4],n=t[8],r=t[12],o=t[1],a=t[5],l=t[9],c=t[13],h=t[2],d=t[6],u=t[10],f=t[14],g=t[3],_=t[7],m=t[11],p=t[15],b=l*f-c*u,T=a*f-c*d,y=a*u-l*d,v=o*f-c*h,S=o*u-l*h,A=o*d-a*h;return e*(_*b-m*T+p*y)-i*(g*b-m*v+p*S)+n*(g*T-_*v+p*A)-r*(g*y-_*S+m*A)}determinantAffine(){let t=this.elements,e=t[0],i=t[4],n=t[8],r=t[1],o=t[5],a=t[9],l=t[2],c=t[6],h=t[10];return e*(o*h-a*c)-i*(r*h-a*l)+n*(r*c-o*l)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,i){let n=this.elements;return t.isVector3?(n[12]=t.x,n[13]=t.y,n[14]=t.z):(n[12]=t,n[13]=e,n[14]=i),this}invert(){let t=this.elements,e=t[0],i=t[1],n=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8],d=t[9],u=t[10],f=t[11],g=t[12],_=t[13],m=t[14],p=t[15],b=e*a-i*o,T=e*l-n*o,y=e*c-r*o,v=i*l-n*a,S=i*c-r*a,A=n*c-r*l,x=h*_-d*g,E=h*m-u*g,R=h*p-f*g,I=d*m-u*_,D=d*p-f*_,C=u*p-f*m,P=b*C-T*D+y*I+v*R-S*E+A*x;if(P===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let N=1/P;return t[0]=(a*C-l*D+c*I)*N,t[1]=(n*D-i*C-r*I)*N,t[2]=(_*A-m*S+p*v)*N,t[3]=(u*S-d*A-f*v)*N,t[4]=(l*R-o*C-c*E)*N,t[5]=(e*C-n*R+r*E)*N,t[6]=(m*y-g*A-p*T)*N,t[7]=(h*A-u*y+f*T)*N,t[8]=(o*D-a*R+c*x)*N,t[9]=(i*R-e*D-r*x)*N,t[10]=(g*S-_*y+p*b)*N,t[11]=(d*y-h*S-f*b)*N,t[12]=(a*E-o*I-l*x)*N,t[13]=(e*I-i*E+n*x)*N,t[14]=(_*T-g*v-m*b)*N,t[15]=(h*v-d*T+u*b)*N,this}scale(t){let e=this.elements,i=t.x,n=t.y,r=t.z;return e[0]*=i,e[4]*=n,e[8]*=r,e[1]*=i,e[5]*=n,e[9]*=r,e[2]*=i,e[6]*=n,e[10]*=r,e[3]*=i,e[7]*=n,e[11]*=r,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],i=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],n=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,i,n))}makeTranslation(t,e,i){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,i,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),i=Math.sin(t);return this.set(1,0,0,0,0,e,-i,0,0,i,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,0,i,0,0,1,0,0,-i,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,0,i,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let i=Math.cos(e),n=Math.sin(e),r=1-i,o=t.x,a=t.y,l=t.z,c=r*o,h=r*a;return this.set(c*o+i,c*a-n*l,c*l+n*a,0,c*a+n*l,h*a+i,h*l-n*o,0,c*l-n*a,h*l+n*o,r*l*l+i,0,0,0,0,1),this}makeScale(t,e,i){return this.set(t,0,0,0,0,e,0,0,0,0,i,0,0,0,0,1),this}makeShear(t,e,i,n,r,o){return this.set(1,i,r,0,t,1,o,0,e,n,1,0,0,0,0,1),this}compose(t,e,i){let n=this.elements,r=e._x,o=e._y,a=e._z,l=e._w,c=r+r,h=o+o,d=a+a,u=r*c,f=r*h,g=r*d,_=o*h,m=o*d,p=a*d,b=l*c,T=l*h,y=l*d,v=i.x,S=i.y,A=i.z;return n[0]=(1-(_+p))*v,n[1]=(f+y)*v,n[2]=(g-T)*v,n[3]=0,n[4]=(f-y)*S,n[5]=(1-(u+p))*S,n[6]=(m+b)*S,n[7]=0,n[8]=(g+T)*A,n[9]=(m-b)*A,n[10]=(1-(u+_))*A,n[11]=0,n[12]=t.x,n[13]=t.y,n[14]=t.z,n[15]=1,this}decompose(t,e,i){let n=this.elements;t.x=n[12],t.y=n[13],t.z=n[14];let r=this.determinantAffine();if(r===0)return i.set(1,1,1),e.identity(),this;let o=Wn.set(n[0],n[1],n[2]).length(),a=Wn.set(n[4],n[5],n[6]).length(),l=Wn.set(n[8],n[9],n[10]).length();r<0&&(o=-o),yi.copy(this);let c=1/o,h=1/a,d=1/l;return yi.elements[0]*=c,yi.elements[1]*=c,yi.elements[2]*=c,yi.elements[4]*=h,yi.elements[5]*=h,yi.elements[6]*=h,yi.elements[8]*=d,yi.elements[9]*=d,yi.elements[10]*=d,e.setFromRotationMatrix(yi),i.x=o,i.y=a,i.z=l,this}makePerspective(t,e,i,n,r,o,a=Si,l=!1){let c=this.elements,h=2*r/(e-t),d=2*r/(i-n),u=(e+t)/(e-t),f=(i+n)/(i-n),g,_;if(l)g=r/(o-r),_=o*r/(o-r);else if(a===Si)g=-(o+r)/(o-r),_=-2*o*r/(o-r);else if(a===rs)g=-o/(o-r),_=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=h,c[4]=0,c[8]=u,c[12]=0,c[1]=0,c[5]=d,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=_,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,e,i,n,r,o,a=Si,l=!1){let c=this.elements,h=2/(e-t),d=2/(i-n),u=-(e+t)/(e-t),f=-(i+n)/(i-n),g,_;if(l)g=1/(o-r),_=o/(o-r);else if(a===Si)g=-2/(o-r),_=-(o+r)/(o-r);else if(a===rs)g=-1/(o-r),_=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=h,c[4]=0,c[8]=0,c[12]=u,c[1]=0,c[5]=d,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=g,c[14]=_,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){let e=this.elements,i=t.elements;for(let n=0;n<16;n++)if(e[n]!==i[n])return!1;return!0}fromArray(t,e=0){for(let i=0;i<16;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){let i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t[e+9]=i[9],t[e+10]=i[10],t[e+11]=i[11],t[e+12]=i[12],t[e+13]=i[13],t[e+14]=i[14],t[e+15]=i[15],t}};Mo.prototype.isMatrix4=!0;var ie=Mo,Wn=new O,yi=new ie,Hu=new O(0,0,0),Gu=new O(1,1,1),on=new O,fr=new O,ai=new O,Tc=new ie,Ac=new fi,pi=class s{constructor(t=0,e=0,i=0,n=s.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=i,this._order=n}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,i,n=this._order){return this._x=t,this._y=e,this._z=i,this._order=n,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,i=!0){let n=t.elements,r=n[0],o=n[4],a=n[8],l=n[1],c=n[5],h=n[9],d=n[2],u=n[6],f=n[10];switch(e){case"XYZ":this._y=Math.asin(Kt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(u,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Kt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-d,r),this._z=0);break;case"ZXY":this._x=Math.asin(Kt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-d,f),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Kt(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(u,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(Kt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-d,r)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-Kt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(u,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,f),this._y=0);break;default:Dt("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,i===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,i){return Tc.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Tc,e,i)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Ac.setFromEuler(this),this.setFromQuaternion(Ac,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};pi.DEFAULT_ORDER="XYZ";var ls=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},Vu=0,Cc=new O,Xn=new fi,$i=new ie,pr=new O,bs=new O,Wu=new O,Xu=new fi,Rc=new O(1,0,0),Pc=new O(0,1,0),Ic=new O(0,0,1),Lc={type:"added"},qu={type:"removed"},qn={type:"childadded",child:null},Ha={type:"childremoved",child:null},Ue=class s extends Ui{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Vu++}),this.uuid=rr(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=s.DEFAULT_UP.clone();let t=new O,e=new pi,i=new fi,n=new O(1,1,1);function r(){i.setFromEuler(e,!1)}function o(){e.setFromQuaternion(i,void 0,!1)}e._onChange(r),i._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:n},modelViewMatrix:{value:new ie},normalMatrix:{value:new kt}}),this.matrix=new ie,this.matrixWorld=new ie,this.matrixAutoUpdate=s.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=s.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new ls,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Xn.setFromAxisAngle(t,e),this.quaternion.multiply(Xn),this}rotateOnWorldAxis(t,e){return Xn.setFromAxisAngle(t,e),this.quaternion.premultiply(Xn),this}rotateX(t){return this.rotateOnAxis(Rc,t)}rotateY(t){return this.rotateOnAxis(Pc,t)}rotateZ(t){return this.rotateOnAxis(Ic,t)}translateOnAxis(t,e){return Cc.copy(t).applyQuaternion(this.quaternion),this.position.add(Cc.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Rc,t)}translateY(t){return this.translateOnAxis(Pc,t)}translateZ(t){return this.translateOnAxis(Ic,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4($i.copy(this.matrixWorld).invert())}lookAt(t,e,i){t.isVector3?pr.copy(t):pr.set(t,e,i);let n=this.parent;this.updateWorldMatrix(!0,!1),bs.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?$i.lookAt(bs,pr,this.up):$i.lookAt(pr,bs,this.up),this.quaternion.setFromRotationMatrix($i),n&&($i.extractRotation(n.matrixWorld),Xn.setFromRotationMatrix($i),this.quaternion.premultiply(Xn.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(Ft("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Lc),qn.child=t,this.dispatchEvent(qn),qn.child=null):Ft("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(qu),Ha.child=t,this.dispatchEvent(Ha),Ha.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),$i.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),$i.multiply(t.parent.matrixWorld)),t.applyMatrix4($i),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Lc),qn.child=t,this.dispatchEvent(qn),qn.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let i=0,n=this.children.length;i<n;i++){let o=this.children[i].getObjectByProperty(t,e);if(o!==void 0)return o}}getObjectsByProperty(t,e,i=[]){this[t]===e&&i.push(this);let n=this.children;for(let r=0,o=n.length;r<o;r++)n[r].getObjectsByProperty(t,e,i);return i}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(bs,t,Wu),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(bs,Xu,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(t){t(this);let e=this.children;for(let i=0,n=e.length;i<n;i++)e[i].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let i=0,n=e.length;i<n;i++)e[i].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let e=t.x,i=t.y,n=t.z,r=this.matrix.elements;r[12]+=e-r[0]*e-r[4]*i-r[8]*n,r[13]+=i-r[1]*e-r[5]*i-r[9]*n,r[14]+=n-r[2]*e-r[6]*i-r[10]*n}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let i=0,n=e.length;i<n;i++)e[i].updateMatrixWorld(t)}updateWorldMatrix(t,e,i=!1){let n=this.parent;if(t===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||i)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,i=!0),e===!0){let r=this.children;for(let o=0,a=r.length;o<a;o++)r[o].updateWorldMatrix(!1,!0,i)}}toJSON(t){let e=t===void 0||typeof t=="string",i={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let n={};n.uuid=this.uuid,n.type=this.type,n.name=this.name,n.castShadow=this.castShadow,n.receiveShadow=this.receiveShadow,n.visible=this.visible,n.frustumCulled=this.frustumCulled,n.renderOrder=this.renderOrder,n.static=this.static,n.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(n.userData=this.userData),n.layers=this.layers.mask,n.matrix=this.matrix.toArray(),n.up=this.up.toArray(),this.pivot!==null&&(n.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(n.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(n.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(n.type="InstancedMesh",n.count=this.count,n.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(n.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(n.type="BatchedMesh",n.perObjectFrustumCulled=this.perObjectFrustumCulled,n.sortObjects=this.sortObjects,n.drawRanges=this._drawRanges,n.reservedRanges=this._reservedRanges,n.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),n.instanceInfo=this._instanceInfo.map(a=>({...a})),n.availableInstanceIds=this._availableInstanceIds.slice(),n.availableGeometryIds=this._availableGeometryIds.slice(),n.nextIndexStart=this._nextIndexStart,n.nextVertexStart=this._nextVertexStart,n.geometryCount=this._geometryCount,n.maxInstanceCount=this._maxInstanceCount,n.maxVertexCount=this._maxVertexCount,n.maxIndexCount=this._maxIndexCount,n.geometryInitialized=this._geometryInitialized,n.matricesTexture=this._matricesTexture.toJSON(t),n.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(n.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(n.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(n.boundingBox=this.boundingBox.toJSON()));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?n.background=this.background.toJSON():this.background.isTexture&&(n.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(n.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){n.geometry=r(t.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let d=l[c];r(t.shapes,d)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(n.bindMode=this.bindMode,n.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),n.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(t.materials,this.material[l]));n.material=a}else n.material=r(t.materials,this.material);if(this.children.length>0){n.children=[];for(let a=0;a<this.children.length;a++)n.children.push(this.children[a].toJSON(t).object)}if(this.animations.length>0){n.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];n.animations.push(r(t.animations,l))}}if(e){let a=o(t.geometries),l=o(t.materials),c=o(t.textures),h=o(t.images),d=o(t.shapes),u=o(t.skeletons),f=o(t.animations),g=o(t.nodes);a.length>0&&(i.geometries=a),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),h.length>0&&(i.images=h),d.length>0&&(i.shapes=d),u.length>0&&(i.skeletons=u),f.length>0&&(i.animations=f),g.length>0&&(i.nodes=g)}return i.object=n,i;function o(a){let l=[];for(let c in a){let h=a[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let i=0;i<t.children.length;i++){let n=t.children[i];this.add(n.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};Ue.DEFAULT_UP=new O(0,1,0);Ue.DEFAULT_MATRIX_AUTO_UPDATE=!0;Ue.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Ae=class extends Ue{constructor(){super(),this.isGroup=!0,this.type="Group"}},Yu={type:"move"},cs=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Ae,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Ae,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new O,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new O),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Ae,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new O,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new O,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let i of t.hand.values())this._getHandJoint(e,i)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,i){let n=null,r=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){o=!0;for(let _ of t.hand.values()){let m=e.getJointPose(_,i),p=this._getHandJoint(c,_);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}let h=c.joints["index-finger-tip"],d=c.joints["thumb-tip"],u=h.position.distanceTo(d.position),f=.02,g=.005;c.inputState.pinching&&u>f+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&u<=f-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,i),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:t,target:this})));a!==null&&(n=e.getPose(t.targetRaySpace,i),n===null&&r!==null&&(n=r),n!==null&&(a.matrix.fromArray(n.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,n.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(n.linearVelocity)):a.hasLinearVelocity=!1,n.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(n.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Yu)))}return a!==null&&(a.visible=n!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let i=new Ae;i.matrixAutoUpdate=!1,i.visible=!1,t.joints[e.jointName]=i,t.add(i)}return t.joints[e.jointName]}},Bh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},an={h:0,s:0,l:0},mr={h:0,s:0,l:0};function Ga(s,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?s+(t-s)*6*e:e<1/2?t:e<2/3?s+(t-s)*6*(2/3-e):s}var yt=class{constructor(t,e,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,i)}set(t,e,i){if(e===void 0&&i===void 0){let n=t;n&&n.isColor?this.copy(n):typeof n=="number"?this.setHex(n):typeof n=="string"&&this.setStyle(n)}else this.setRGB(t,e,i);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=Je){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,Zt.colorSpaceToWorking(this,e),this}setRGB(t,e,i,n=Zt.workingColorSpace){return this.r=t,this.g=e,this.b=i,Zt.colorSpaceToWorking(this,n),this}setHSL(t,e,i,n=Zt.workingColorSpace){if(t=Bu(t,1),e=Kt(e,0,1),i=Kt(i,0,1),e===0)this.r=this.g=this.b=i;else{let r=i<=.5?i*(1+e):i+e-i*e,o=2*i-r;this.r=Ga(o,r,t+1/3),this.g=Ga(o,r,t),this.b=Ga(o,r,t-1/3)}return Zt.colorSpaceToWorking(this,n),this}setStyle(t,e=Je){function i(r){r!==void 0&&parseFloat(r)<1&&Dt("Color: Alpha component of "+t+" will be ignored.")}let n;if(n=/^(\w+)\(([^\)]*)\)/.exec(t)){let r,o=n[1],a=n[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:Dt("Color: Unknown color model "+t)}}else if(n=/^\#([A-Fa-f\d]+)$/.exec(t)){let r=n[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(o===6)return this.setHex(parseInt(r,16),e);Dt("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=Je){let i=Bh[t.toLowerCase()];return i!==void 0?this.setHex(i,e):Dt("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=ji(t.r),this.g=ji(t.g),this.b=ji(t.b),this}copyLinearToSRGB(t){return this.r=ns(t.r),this.g=ns(t.g),this.b=ns(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=Je){return Zt.workingToColorSpace(Ve.copy(this),t),Math.round(Kt(Ve.r*255,0,255))*65536+Math.round(Kt(Ve.g*255,0,255))*256+Math.round(Kt(Ve.b*255,0,255))}getHexString(t=Je){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=Zt.workingColorSpace){Zt.workingToColorSpace(Ve.copy(this),e);let i=Ve.r,n=Ve.g,r=Ve.b,o=Math.max(i,n,r),a=Math.min(i,n,r),l,c,h=(a+o)/2;if(a===o)l=0,c=0;else{let d=o-a;switch(c=h<=.5?d/(o+a):d/(2-o-a),o){case i:l=(n-r)/d+(n<r?6:0);break;case n:l=(r-i)/d+2;break;case r:l=(i-n)/d+4;break}l/=6}return t.h=l,t.s=c,t.l=h,t}getRGB(t,e=Zt.workingColorSpace){return Zt.workingToColorSpace(Ve.copy(this),e),t.r=Ve.r,t.g=Ve.g,t.b=Ve.b,t}getStyle(t=Je){Zt.workingToColorSpace(Ve.copy(this),t);let e=Ve.r,i=Ve.g,n=Ve.b;return t!==Je?`color(${t} ${e.toFixed(3)} ${i.toFixed(3)} ${n.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(i*255)},${Math.round(n*255)})`}offsetHSL(t,e,i){return this.getHSL(an),this.setHSL(an.h+t,an.s+e,an.l+i)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,i){return this.r=t.r+(e.r-t.r)*i,this.g=t.g+(e.g-t.g)*i,this.b=t.b+(e.b-t.b)*i,this}lerpHSL(t,e){this.getHSL(an),t.getHSL(mr);let i=Fa(an.h,mr.h,e),n=Fa(an.s,mr.s,e),r=Fa(an.l,mr.l,e);return this.setHSL(i,n,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,i=this.g,n=this.b,r=t.elements;return this.r=r[0]*e+r[3]*i+r[6]*n,this.g=r[1]*e+r[4]*i+r[7]*n,this.b=r[2]*e+r[5]*i+r[8]*n,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Ve=new yt;yt.NAMES=Bh;var Ns=class extends Ue{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new pi,this.environmentIntensity=1,this.environmentRotation=new pi,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),e.object.backgroundBlurriness=this.backgroundBlurriness,e.object.backgroundIntensity=this.backgroundIntensity,e.object.backgroundRotation=this.backgroundRotation.toArray(),e.object.environmentIntensity=this.environmentIntensity,e.object.environmentRotation=this.environmentRotation.toArray(),e}},vi=new O,Zi=new O,Va=new O,Ji=new O,Yn=new O,$n=new O,Dc=new O,Wa=new O,Xa=new O,qa=new O,Ya=new xe,$a=new xe,Za=new xe,un=class s{constructor(t=new O,e=new O,i=new O){this.a=t,this.b=e,this.c=i}static getNormal(t,e,i,n){n.subVectors(i,e),vi.subVectors(t,e),n.cross(vi);let r=n.lengthSq();return r>0?n.multiplyScalar(1/Math.sqrt(r)):n.set(0,0,0)}static getBarycoord(t,e,i,n,r){vi.subVectors(n,e),Zi.subVectors(i,e),Va.subVectors(t,e);let o=vi.dot(vi),a=vi.dot(Zi),l=vi.dot(Va),c=Zi.dot(Zi),h=Zi.dot(Va),d=o*c-a*a;if(d===0)return r.set(0,0,0),null;let u=1/d,f=(c*l-a*h)*u,g=(o*h-a*l)*u;return r.set(1-f-g,g,f)}static containsPoint(t,e,i,n){return this.getBarycoord(t,e,i,n,Ji)===null?!1:Ji.x>=0&&Ji.y>=0&&Ji.x+Ji.y<=1}static getInterpolation(t,e,i,n,r,o,a,l){return this.getBarycoord(t,e,i,n,Ji)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Ji.x),l.addScaledVector(o,Ji.y),l.addScaledVector(a,Ji.z),l)}static getInterpolatedAttribute(t,e,i,n,r,o){return Ya.setScalar(0),$a.setScalar(0),Za.setScalar(0),Ya.fromBufferAttribute(t,e),$a.fromBufferAttribute(t,i),Za.fromBufferAttribute(t,n),o.setScalar(0),o.addScaledVector(Ya,r.x),o.addScaledVector($a,r.y),o.addScaledVector(Za,r.z),o}static isFrontFacing(t,e,i,n){return vi.subVectors(i,e),Zi.subVectors(t,e),vi.cross(Zi).dot(n)<0}set(t,e,i){return this.a.copy(t),this.b.copy(e),this.c.copy(i),this}setFromPointsAndIndices(t,e,i,n){return this.a.copy(t[e]),this.b.copy(t[i]),this.c.copy(t[n]),this}setFromAttributeAndIndices(t,e,i,n){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,i),this.c.fromBufferAttribute(t,n),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return vi.subVectors(this.c,this.b),Zi.subVectors(this.a,this.b),vi.cross(Zi).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return s.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return s.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,i,n,r){return s.getInterpolation(t,this.a,this.b,this.c,e,i,n,r)}containsPoint(t){return s.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return s.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let i=this.a,n=this.b,r=this.c,o,a;Yn.subVectors(n,i),$n.subVectors(r,i),Wa.subVectors(t,i);let l=Yn.dot(Wa),c=$n.dot(Wa);if(l<=0&&c<=0)return e.copy(i);Xa.subVectors(t,n);let h=Yn.dot(Xa),d=$n.dot(Xa);if(h>=0&&d<=h)return e.copy(n);let u=l*d-h*c;if(u<=0&&l>=0&&h<=0)return o=l/(l-h),e.copy(i).addScaledVector(Yn,o);qa.subVectors(t,r);let f=Yn.dot(qa),g=$n.dot(qa);if(g>=0&&f<=g)return e.copy(r);let _=f*c-l*g;if(_<=0&&c>=0&&g<=0)return a=c/(c-g),e.copy(i).addScaledVector($n,a);let m=h*g-f*d;if(m<=0&&d-h>=0&&f-g>=0)return Dc.subVectors(r,n),a=(d-h)/(d-h+(f-g)),e.copy(n).addScaledVector(Dc,a);let p=1/(m+_+u);return o=_*p,a=u*p,e.copy(i).addScaledVector(Yn,o).addScaledVector($n,a)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},Fi=class{constructor(t=new O(1/0,1/0,1/0),e=new O(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e+=3)this.expandByPoint(Mi.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,i=t.count;e<i;e++)this.expandByPoint(Mi.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let i=Mi.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(i),this.max.copy(t).add(i),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let i=t.geometry;if(i!==void 0){let r=i.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)t.isMesh===!0?t.getVertexPosition(o,Mi):Mi.fromBufferAttribute(r,o),Mi.applyMatrix4(t.matrixWorld),this.expandByPoint(Mi);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),gr.copy(t.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),gr.copy(i.boundingBox)),gr.applyMatrix4(t.matrixWorld),this.union(gr)}let n=t.children;for(let r=0,o=n.length;r<o;r++)this.expandByObject(n[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,Mi),Mi.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,i;return t.normal.x>0?(e=t.normal.x*this.min.x,i=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,i=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,i+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,i+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,i+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,i+=t.normal.z*this.min.z),e<=-t.constant&&i>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Ss),xr.subVectors(this.max,Ss),Zn.subVectors(t.a,Ss),Jn.subVectors(t.b,Ss),Kn.subVectors(t.c,Ss),ln.subVectors(Jn,Zn),cn.subVectors(Kn,Jn),En.subVectors(Zn,Kn);let e=[0,-ln.z,ln.y,0,-cn.z,cn.y,0,-En.z,En.y,ln.z,0,-ln.x,cn.z,0,-cn.x,En.z,0,-En.x,-ln.y,ln.x,0,-cn.y,cn.x,0,-En.y,En.x,0];return!Ja(e,Zn,Jn,Kn,xr)||(e=[1,0,0,0,1,0,0,0,1],!Ja(e,Zn,Jn,Kn,xr))?!1:(_r.crossVectors(ln,cn),e=[_r.x,_r.y,_r.z],Ja(e,Zn,Jn,Kn,xr))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,Mi).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(Mi).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(Ki[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),Ki[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),Ki[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),Ki[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),Ki[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),Ki[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),Ki[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),Ki[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(Ki),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}},Ki=[new O,new O,new O,new O,new O,new O,new O,new O],Mi=new O,gr=new Fi,Zn=new O,Jn=new O,Kn=new O,ln=new O,cn=new O,En=new O,Ss=new O,xr=new O,_r=new O,Tn=new O;function Ja(s,t,e,i,n){for(let r=0,o=s.length-3;r<=o;r+=3){Tn.fromArray(s,r);let a=n.x*Math.abs(Tn.x)+n.y*Math.abs(Tn.y)+n.z*Math.abs(Tn.z),l=t.dot(Tn),c=e.dot(Tn),h=i.dot(Tn);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>a)return!1}return!0}var Te=new O,yr=new Wt,$u=0,ee=class extends Ui{constructor(t,e,i=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:$u++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=i,this.usage=Lh,this.updateRanges=[],this.gpuType=gi,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,i){t*=this.itemSize,i*=e.itemSize;for(let n=0,r=this.itemSize;n<r;n++)this.array[t+n]=e.array[i+n];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,i=this.count;e<i;e++)yr.fromBufferAttribute(this,e),yr.applyMatrix3(t),this.setXY(e,yr.x,yr.y);else if(this.itemSize===3)for(let e=0,i=this.count;e<i;e++)Te.fromBufferAttribute(this,e),Te.applyMatrix3(t),this.setXYZ(e,Te.x,Te.y,Te.z);return this}applyMatrix4(t){for(let e=0,i=this.count;e<i;e++)Te.fromBufferAttribute(this,e),Te.applyMatrix4(t),this.setXYZ(e,Te.x,Te.y,Te.z);return this}applyNormalMatrix(t){for(let e=0,i=this.count;e<i;e++)Te.fromBufferAttribute(this,e),Te.applyNormalMatrix(t),this.setXYZ(e,Te.x,Te.y,Te.z);return this}transformDirection(t){for(let e=0,i=this.count;e<i;e++)Te.fromBufferAttribute(this,e),Te.transformDirection(t),this.setXYZ(e,Te.x,Te.y,Te.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let i=this.array[t*this.itemSize+e];return this.normalized&&(i=Ms(i,this.array)),i}setComponent(t,e,i){return this.normalized&&(i=ni(i,this.array)),this.array[t*this.itemSize+e]=i,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=Ms(e,this.array)),e}setX(t,e){return this.normalized&&(e=ni(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=Ms(e,this.array)),e}setY(t,e){return this.normalized&&(e=ni(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=Ms(e,this.array)),e}setZ(t,e){return this.normalized&&(e=ni(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=Ms(e,this.array)),e}setW(t,e){return this.normalized&&(e=ni(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,i){return t*=this.itemSize,this.normalized&&(e=ni(e,this.array),i=ni(i,this.array)),this.array[t+0]=e,this.array[t+1]=i,this}setXYZ(t,e,i,n){return t*=this.itemSize,this.normalized&&(e=ni(e,this.array),i=ni(i,this.array),n=ni(n,this.array)),this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=n,this}setXYZW(t,e,i,n,r){return t*=this.itemSize,this.normalized&&(e=ni(e,this.array),i=ni(i,this.array),n=ni(n,this.array),r=ni(r,this.array)),this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=n,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return t.name=this.name,t.usage=this.usage,t.gpuType=this.gpuType,t}dispose(){this.dispatchEvent({type:"dispose"})}};var Us=class extends ee{constructor(t,e,i){super(new Uint16Array(t),e,i)}};var Fs=class extends ee{constructor(t,e,i){super(new Uint32Array(t),e,i)}};var fe=class extends ee{constructor(t,e,i){super(new Float32Array(t),e,i)}},Zu=new Fi,ws=new O,Ka=new O,Bi=class{constructor(t=new O,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let i=this.center;e!==void 0?i.copy(e):Zu.setFromPoints(t).getCenter(i);let n=0;for(let r=0,o=t.length;r<o;r++)n=Math.max(n,i.distanceToSquared(t[r]));return this.radius=Math.sqrt(n),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let i=this.center.distanceToSquared(t);return e.copy(t),i>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;ws.subVectors(t,this.center);let e=ws.lengthSq();if(e>this.radius*this.radius){let i=Math.sqrt(e),n=(i-this.radius)*.5;this.center.addScaledVector(ws,n/i),this.radius+=n}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Ka.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(ws.copy(t.center).add(Ka)),this.expandByPoint(ws.copy(t.center).sub(Ka))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}},Ju=0,di=new ie,Qa=new Ue,Qn=new O,li=new Fi,Es=new Fi,De=new O,_e=class s extends Ui{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Ju++}),this.uuid=rr(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(Uu(t)?Fs:Us)(t,1):this.index=t,this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,i=0){this.groups.push({start:t,count:e,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let r=new kt().getNormalMatrix(t);i.applyNormalMatrix(r),i.needsUpdate=!0}let n=this.attributes.tangent;return n!==void 0&&(n.transformDirection(t),n.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return di.makeRotationFromQuaternion(t),this.applyMatrix4(di),this}rotateX(t){return di.makeRotationX(t),this.applyMatrix4(di),this}rotateY(t){return di.makeRotationY(t),this.applyMatrix4(di),this}rotateZ(t){return di.makeRotationZ(t),this.applyMatrix4(di),this}translate(t,e,i){return di.makeTranslation(t,e,i),this.applyMatrix4(di),this}scale(t,e,i){return di.makeScale(t,e,i),this.applyMatrix4(di),this}lookAt(t){return Qa.lookAt(t),Qa.updateMatrix(),this.applyMatrix4(Qa.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Qn).negate(),this.translate(Qn.x,Qn.y,Qn.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let i=[];for(let n=0,r=t.length;n<r;n++){let o=t[n];i.push(o.x,o.y,o.z||0)}this.setAttribute("position",new fe(i,3))}else{let i=Math.min(t.length,e.count);for(let n=0;n<i;n++){let r=t[n];e.setXYZ(n,r.x,r.y,r.z||0)}t.length>e.count&&Dt("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Fi);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Ft("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new O(-1/0,-1/0,-1/0),new O(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let i=0,n=e.length;i<n;i++){let r=e[i];li.setFromBufferAttribute(r),this.morphTargetsRelative?(De.addVectors(this.boundingBox.min,li.min),this.boundingBox.expandByPoint(De),De.addVectors(this.boundingBox.max,li.max),this.boundingBox.expandByPoint(De)):(this.boundingBox.expandByPoint(li.min),this.boundingBox.expandByPoint(li.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Ft('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Bi);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Ft("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new O,1/0);return}if(t){let i=this.boundingSphere.center;if(li.setFromBufferAttribute(t),e)for(let r=0,o=e.length;r<o;r++){let a=e[r];Es.setFromBufferAttribute(a),this.morphTargetsRelative?(De.addVectors(li.min,Es.min),li.expandByPoint(De),De.addVectors(li.max,Es.max),li.expandByPoint(De)):(li.expandByPoint(Es.min),li.expandByPoint(Es.max))}li.getCenter(i);let n=0;for(let r=0,o=t.count;r<o;r++)De.fromBufferAttribute(t,r),n=Math.max(n,i.distanceToSquared(De));if(e)for(let r=0,o=e.length;r<o;r++){let a=e[r],l=this.morphTargetsRelative;for(let c=0,h=a.count;c<h;c++)De.fromBufferAttribute(a,c),l&&(Qn.fromBufferAttribute(t,c),De.add(Qn)),n=Math.max(n,i.distanceToSquared(De))}this.boundingSphere.radius=Math.sqrt(n),isNaN(this.boundingSphere.radius)&&Ft('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){Ft("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=e.position,n=e.normal,r=e.uv,o=this.getAttribute("tangent");(o===void 0||o.count!==i.count)&&(o=new ee(new Float32Array(4*i.count),4),this.setAttribute("tangent",o));let a=[],l=[];for(let x=0;x<i.count;x++)a[x]=new O,l[x]=new O;let c=new O,h=new O,d=new O,u=new Wt,f=new Wt,g=new Wt,_=new O,m=new O;function p(x,E,R){c.fromBufferAttribute(i,x),h.fromBufferAttribute(i,E),d.fromBufferAttribute(i,R),u.fromBufferAttribute(r,x),f.fromBufferAttribute(r,E),g.fromBufferAttribute(r,R),h.sub(c),d.sub(c),f.sub(u),g.sub(u);let I=1/(f.x*g.y-g.x*f.y);isFinite(I)&&(_.copy(h).multiplyScalar(g.y).addScaledVector(d,-f.y).multiplyScalar(I),m.copy(d).multiplyScalar(f.x).addScaledVector(h,-g.x).multiplyScalar(I),a[x].add(_),a[E].add(_),a[R].add(_),l[x].add(m),l[E].add(m),l[R].add(m))}let b=this.groups;b.length===0&&(b=[{start:0,count:t.count}]);for(let x=0,E=b.length;x<E;++x){let R=b[x],I=R.start,D=R.count;for(let C=I,P=I+D;C<P;C+=3)p(t.getX(C+0),t.getX(C+1),t.getX(C+2))}let T=new O,y=new O,v=new O,S=new O;function A(x){v.fromBufferAttribute(n,x),S.copy(v);let E=a[x];T.copy(E),T.sub(v.multiplyScalar(v.dot(E))).normalize(),y.crossVectors(S,E);let I=y.dot(l[x])<0?-1:1;o.setXYZW(x,T.x,T.y,T.z,I)}for(let x=0,E=b.length;x<E;++x){let R=b[x],I=R.start,D=R.count;for(let C=I,P=I+D;C<P;C+=3)A(t.getX(C+0)),A(t.getX(C+1)),A(t.getX(C+2))}this._transformed=!0}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==e.count)i=new ee(new Float32Array(e.count*3),3),this.setAttribute("normal",i);else for(let u=0,f=i.count;u<f;u++)i.setXYZ(u,0,0,0);let n=new O,r=new O,o=new O,a=new O,l=new O,c=new O,h=new O,d=new O;if(t)for(let u=0,f=t.count;u<f;u+=3){let g=t.getX(u+0),_=t.getX(u+1),m=t.getX(u+2);n.fromBufferAttribute(e,g),r.fromBufferAttribute(e,_),o.fromBufferAttribute(e,m),h.subVectors(o,r),d.subVectors(n,r),h.cross(d),a.fromBufferAttribute(i,g),l.fromBufferAttribute(i,_),c.fromBufferAttribute(i,m),a.add(h),l.add(h),c.add(h),i.setXYZ(g,a.x,a.y,a.z),i.setXYZ(_,l.x,l.y,l.z),i.setXYZ(m,c.x,c.y,c.z)}else for(let u=0,f=e.count;u<f;u+=3)n.fromBufferAttribute(e,u+0),r.fromBufferAttribute(e,u+1),o.fromBufferAttribute(e,u+2),h.subVectors(o,r),d.subVectors(n,r),h.cross(d),i.setXYZ(u+0,h.x,h.y,h.z),i.setXYZ(u+1,h.x,h.y,h.z),i.setXYZ(u+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,i=t.count;e<i;e++)De.fromBufferAttribute(t,e),De.normalize(),t.setXYZ(e,De.x,De.y,De.z)}toNonIndexed(){function t(a,l){let c=a.array,h=a.itemSize,d=a.normalized,u=new c.constructor(l.length*h),f=0,g=0;for(let _=0,m=l.length;_<m;_++){a.isInterleavedBufferAttribute?f=l[_]*a.data.stride+a.offset:f=l[_]*h;for(let p=0;p<h;p++)u[g++]=c[f++]}return new ee(u,h,d)}if(this.index===null)return Dt("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new s,i=this.index.array,n=this.attributes;for(let a in n){let l=n[a],c=t(l,i);e.setAttribute(a,c)}let r=this.morphAttributes;for(let a in r){let l=[],c=r[a];for(let h=0,d=c.length;h<d;h++){let u=c[h],f=t(u,i);l.push(f)}e.morphAttributes[a]=l}e.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let i=this.attributes;for(let l in i){let c=i[l];t.data.attributes[l]=c.toJSON(t.data)}let n={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let d=0,u=c.length;d<u;d++){let f=c[d];h.push(f.toJSON(t.data))}h.length>0&&(n[l]=h,r=!0)}r&&(t.data.morphAttributes=n,t.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(t.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(t.data.boundingSphere=a.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let i=t.index;i!==null&&this.setIndex(i.clone());let n=t.attributes;for(let c in n){let h=n[c];this.setAttribute(c,h.clone(e))}let r=t.morphAttributes;for(let c in r){let h=[],d=r[c];for(let u=0,f=d.length;u<f;u++)h.push(d[u].clone(e));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;let o=t.groups;for(let c=0,h=o.length;c<h;c++){let d=o[c];this.addGroup(d.start,d.count,d.materialIndex)}let a=t.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var ja=new O,Ku=new O,Qu=new kt,bi=class{constructor(t=new O(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,i,n){return this.normal.set(t,e,i),this.constant=n,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,i){let n=ja.subVectors(i,e).cross(Ku.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(n,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e,i=!0){let n=t.delta(ja),r=this.normal.dot(n);if(r===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let o=-(t.start.dot(this.normal)+this.constant)/r;return i===!0&&(o<0||o>1)?null:e.copy(t.start).addScaledVector(n,o)}intersectsLine(t){let e=this.distanceToPoint(t.start),i=this.distanceToPoint(t.end);return e<0&&i>0||i<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let i=e||Qu.getNormalMatrix(t),n=this.coplanarPoint(ja).applyMatrix4(t),r=this.normal.applyMatrix3(i).normalize();return this.constant=-n.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(t){return this.normal.fromArray(t.normal),this.constant=t.constant,this}},ju=0,wi=class extends Ui{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:ju++}),this.uuid=rr(),this.name="",this.type="Material",this.blending=_n,this.side=zi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=_l,this.blendDst=yl,this.blendEquation=Bn,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new yt(0,0,0),this.blendAlpha=0,this.depthFunc=ss,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Eh,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Or,this.stencilZFail=Or,this.stencilZPass=Or,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let i=t[e];if(i===void 0){Dt(`Material: parameter '${e}' has value of undefined.`);continue}let n=this[e];if(n===void 0){Dt(`Material: '${e}' is not a property of THREE.${this.type}.`);continue}n&&n.isColor?n.set(i):n&&n.isVector2&&i&&i.isVector2||n&&n.isEuler&&i&&i.isEuler||n&&n.isVector3&&i&&i.isVector3?n.copy(i):this[e]=i}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,i.blending=this.blending,i.side=this.side,i.shadowSide=this.shadowSide,i.vertexColors=this.vertexColors,i.opacity=this.opacity,i.transparent=this.transparent,i.blendSrc=this.blendSrc,i.blendDst=this.blendDst,i.blendEquation=this.blendEquation,i.blendSrcAlpha=this.blendSrcAlpha,i.blendDstAlpha=this.blendDstAlpha,i.blendEquationAlpha=this.blendEquationAlpha,i.blendColor=this.blendColor.getHex(),i.blendAlpha=this.blendAlpha,i.depthFunc=this.depthFunc,i.depthTest=this.depthTest,i.depthWrite=this.depthWrite,i.colorWrite=this.colorWrite,i.clipIntersection=this.clipIntersection,i.clipShadows=this.clipShadows,i.stencilWriteMask=this.stencilWriteMask,i.stencilFunc=this.stencilFunc,i.stencilRef=this.stencilRef,i.stencilFuncMask=this.stencilFuncMask,i.stencilFail=this.stencilFail,i.stencilZFail=this.stencilZFail,i.stencilZPass=this.stencilZPass,i.stencilWrite=this.stencilWrite,i.polygonOffset=this.polygonOffset,i.polygonOffsetFactor=this.polygonOffsetFactor,i.polygonOffsetUnits=this.polygonOffsetUnits,i.dithering=this.dithering,i.alphaTest=this.alphaTest,i.alphaHash=this.alphaHash,i.alphaToCoverage=this.alphaToCoverage,i.premultipliedAlpha=this.premultipliedAlpha,i.forceSinglePass=this.forceSinglePass,i.allowOverride=this.allowOverride,i.visible=this.visible,i.toneMapped=this.toneMapped,i.name=this.name,this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(i.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(t).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(t).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(t).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(t).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(t).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(i.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(i.rotation=this.rotation),this.depthPacking!==void 0&&(i.depthPacking=this.depthPacking),this.linewidth!==void 0&&(i.linewidth=this.linewidth),this.linecap!==void 0&&(i.linecap=this.linecap),this.linejoin!==void 0&&(i.linejoin=this.linejoin),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.wireframe!==void 0&&(i.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(i.flatShading=this.flatShading),this.fog!==void 0&&(i.fog=this.fog),Object.keys(this.userData).length>0&&(i.userData=this.userData);function n(r){let o=[];for(let a in r){let l=r[a];delete l.metadata,o.push(l)}return o}if(e){let r=n(t.textures),o=n(t.images);r.length>0&&(i.textures=r),o.length>0&&(i.images=o)}return i}fromJSON(t,e){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new yt().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.retroreflectivity!==void 0&&(this.retroreflectivity=t.retroreflectivity),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=t.iridescenceThicknessRange),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.clippingPlanes!==void 0&&(this.clippingPlanes=t.clippingPlanes.map(i=>new bi().fromJSON(i))),t.clipIntersection!==void 0&&(this.clipIntersection=t.clipIntersection),t.clipShadows!==void 0&&(this.clipShadows=t.clipShadows),t.depthPacking!==void 0&&(this.depthPacking=t.depthPacking),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.linecap!==void 0&&(this.linecap=t.linecap),t.linejoin!==void 0&&(this.linejoin=t.linejoin),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=e[t.map]||null),t.matcap!==void 0&&(this.matcap=e[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=e[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=e[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=e[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let i=t.normalScale;Array.isArray(i)===!1&&(i=[i,i]),this.normalScale=new Wt().fromArray(i)}return t.displacementMap!==void 0&&(this.displacementMap=e[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=e[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=e[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=e[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=e[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=e[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=e[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=e[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=e[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=e[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=e[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=e[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=e[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=e[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Wt().fromArray(t.clearcoatNormalScale)),t.iridescenceMap!==void 0&&(this.iridescenceMap=e[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=e[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=e[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=e[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=e[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=e[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=e[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,i=null;if(e!==null){let n=e.length;i=new Array(n);for(let r=0;r!==n;++r)i[r]=e[r].clone()}return this.clippingPlanes=i,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}};var Qi=new O,tl=new O,vr=new O,Mr=new O,In=class{constructor(t=new O,e=new O(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Qi)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let i=e.dot(this.direction);return i<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=Qi.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(Qi.copy(this.origin).addScaledVector(this.direction,e),Qi.distanceToSquared(t))}distanceSqToSegment(t,e,i,n){tl.copy(t).add(e).multiplyScalar(.5),vr.copy(e).sub(t).normalize(),Mr.copy(this.origin).sub(tl);let r=t.distanceTo(e)*.5,o=-this.direction.dot(vr),a=Mr.dot(this.direction),l=-Mr.dot(vr),c=Mr.lengthSq(),h=Math.abs(1-o*o),d,u,f,g;if(h>0)if(d=o*l-a,u=o*a-l,g=r*h,d>=0)if(u>=-g)if(u<=g){let _=1/h;d*=_,u*=_,f=d*(d+o*u+2*a)+u*(o*d+u+2*l)+c}else u=r,d=Math.max(0,-(o*u+a)),f=-d*d+u*(u+2*l)+c;else u=-r,d=Math.max(0,-(o*u+a)),f=-d*d+u*(u+2*l)+c;else u<=-g?(d=Math.max(0,-(-o*r+a)),u=d>0?-r:Math.min(Math.max(-r,-l),r),f=-d*d+u*(u+2*l)+c):u<=g?(d=0,u=Math.min(Math.max(-r,-l),r),f=u*(u+2*l)+c):(d=Math.max(0,-(o*r+a)),u=d>0?r:Math.min(Math.max(-r,-l),r),f=-d*d+u*(u+2*l)+c);else u=o>0?-r:r,d=Math.max(0,-(o*u+a)),f=-d*d+u*(u+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,d),n&&n.copy(tl).addScaledVector(vr,u),f}intersectSphere(t,e){if(t.radius<0)return null;Qi.subVectors(t.center,this.origin);let i=Qi.dot(this.direction),n=Qi.dot(Qi)-i*i,r=t.radius*t.radius;if(n>r)return null;let o=Math.sqrt(r-n),a=i-o,l=i+o;return l<0?null:a<0?this.at(l,e):this.at(a,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(t.normal)+t.constant)/e;return i>=0?i:null}intersectPlane(t,e){let i=this.distanceToPlane(t);return i===null?null:this.at(i,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let i,n,r,o,a,l,c=1/this.direction.x,h=1/this.direction.y,d=1/this.direction.z,u=this.origin;return c>=0?(i=(t.min.x-u.x)*c,n=(t.max.x-u.x)*c):(i=(t.max.x-u.x)*c,n=(t.min.x-u.x)*c),h>=0?(r=(t.min.y-u.y)*h,o=(t.max.y-u.y)*h):(r=(t.max.y-u.y)*h,o=(t.min.y-u.y)*h),i>o||r>n||((r>i||isNaN(i))&&(i=r),(o<n||isNaN(n))&&(n=o),d>=0?(a=(t.min.z-u.z)*d,l=(t.max.z-u.z)*d):(a=(t.max.z-u.z)*d,l=(t.min.z-u.z)*d),i>l||a>n)||((a>i||i!==i)&&(i=a),(l<n||n!==n)&&(n=l),n<0)?null:this.at(i>=0?i:n,e)}intersectsBox(t){return this.intersectBox(t,Qi)!==null}intersectTriangle(t,e,i,n,r){let o=this.origin,a=this.direction,l=a.x,c=a.y,h=a.z,d=t.x-o.x,u=t.y-o.y,f=t.z-o.z,g=e.x-o.x,_=e.y-o.y,m=e.z-o.z,p=i.x-o.x,b=i.y-o.y,T=i.z-o.z,y=Math.abs(l),v=Math.abs(c),S=Math.abs(h),A,x,E,R,I,D,C,P,N,q,W,tt;if(y>=v&&y>=S?(E=l,D=d,N=g,tt=p,l>=0?(A=c,x=h,R=u,I=f,C=_,P=m,q=b,W=T):(A=h,x=c,R=f,I=u,C=m,P=_,q=T,W=b)):v>=S?(E=c,D=u,N=_,tt=b,c>=0?(A=h,x=l,R=f,I=d,C=m,P=g,q=T,W=p):(A=l,x=h,R=d,I=f,C=g,P=m,q=p,W=T)):(E=h,D=f,N=m,tt=T,h>=0?(A=l,x=c,R=d,I=u,C=g,P=_,q=p,W=b):(A=c,x=l,R=u,I=d,C=_,P=g,q=b,W=p)),E===0)return null;let k=A/E,X=x/E,H=1/E,rt=R-k*D,lt=I-X*D,Ht=C-k*N,Bt=P-X*N,zt=q-k*tt,Z=W-X*tt,Q=zt*Bt-Z*Ht,at=rt*Z-lt*zt,wt=Ht*lt-Bt*rt;if(n){if(Q<0||at<0||wt<0)return null}else if((Q<0||at<0||wt<0)&&(Q>0||at>0||wt>0))return null;let st=Q+at+wt;if(st===0)return null;let Tt=H*(Q*D+at*N+wt*tt);return(st>0?Tt<0:Tt>0)?null:this.at(Tt/st,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Fe=class extends wi{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new yt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new pi,this.combine=Zs,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}},Nc=new ie,An=new In,br=new Bi,Uc=new O,Sr=new O,wr=new O,Er=new O,el=new O,Tr=new O,Fc=new O,Ar=new O,Ct=class extends Ue{constructor(t=new _e,e=new Fe){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){let n=e[i[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=n.length;r<o;r++){let a=n[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(t,e){let i=this.geometry,n=i.attributes.position,r=i.morphAttributes.position,o=i.morphTargetsRelative;e.fromBufferAttribute(n,t);let a=this.morphTargetInfluences;if(r&&a){Tr.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let h=a[l],d=r[l];h!==0&&(el.fromBufferAttribute(d,t),o?Tr.addScaledVector(el,h):Tr.addScaledVector(el.sub(e),h))}e.add(Tr)}return e}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let i=this.geometry,n=this.material,r=this.matrixWorld;n!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),br.copy(i.boundingSphere),br.applyMatrix4(r),An.copy(t.ray).recast(t.near),!(br.containsPoint(An.origin)===!1&&(An.intersectSphere(br,Uc)===null||An.origin.distanceToSquared(Uc)>(t.far-t.near)**2))&&(Nc.copy(r).invert(),An.copy(t.ray).applyMatrix4(Nc),!(i.boundingBox!==null&&An.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(t,e,An)))}_computeIntersections(t,e,i){let n,r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,d=r.attributes.normal,u=r.groups,f=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,_=u.length;g<_;g++){let m=u[g],p=o[m.materialIndex],b=Math.max(m.start,f.start),T=Math.min(a.count,Math.min(m.start+m.count,f.start+f.count));for(let y=b,v=T;y<v;y+=3){let S=a.getX(y),A=a.getX(y+1),x=a.getX(y+2);n=Cr(this,p,t,i,c,h,d,S,A,x),n&&(n.faceIndex=Math.floor(y/3),n.face.materialIndex=m.materialIndex,e.push(n))}}else{let g=Math.max(0,f.start),_=Math.min(a.count,f.start+f.count);for(let m=g,p=_;m<p;m+=3){let b=a.getX(m),T=a.getX(m+1),y=a.getX(m+2);n=Cr(this,o,t,i,c,h,d,b,T,y),n&&(n.faceIndex=Math.floor(m/3),e.push(n))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,_=u.length;g<_;g++){let m=u[g],p=o[m.materialIndex],b=Math.max(m.start,f.start),T=Math.min(l.count,Math.min(m.start+m.count,f.start+f.count));for(let y=b,v=T;y<v;y+=3){let S=y,A=y+1,x=y+2;n=Cr(this,p,t,i,c,h,d,S,A,x),n&&(n.faceIndex=Math.floor(y/3),n.face.materialIndex=m.materialIndex,e.push(n))}}else{let g=Math.max(0,f.start),_=Math.min(l.count,f.start+f.count);for(let m=g,p=_;m<p;m+=3){let b=m,T=m+1,y=m+2;n=Cr(this,o,t,i,c,h,d,b,T,y),n&&(n.faceIndex=Math.floor(m/3),e.push(n))}}}};function td(s,t,e,i,n,r,o,a){let l;if(t.side===je?l=i.intersectTriangle(o,r,n,!0,a):l=i.intersectTriangle(n,r,o,t.side===zi,a),l===null)return null;Ar.copy(a),Ar.applyMatrix4(s.matrixWorld);let c=e.ray.origin.distanceTo(Ar);return c<e.near||c>e.far?null:{distance:c,point:Ar.clone(),object:s}}function Cr(s,t,e,i,n,r,o,a,l,c){s.getVertexPosition(a,Sr),s.getVertexPosition(l,wr),s.getVertexPosition(c,Er);let h=td(s,t,e,i,Sr,wr,Er,Fc);if(h){let d=new O;un.getBarycoord(Fc,Sr,wr,Er,d),n&&(h.uv=un.getInterpolatedAttribute(n,a,l,c,d,new Wt)),r&&(h.uv1=un.getInterpolatedAttribute(r,a,l,c,d,new Wt)),o&&(h.normal=un.getInterpolatedAttribute(o,a,l,c,d,new O),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));let u={a,b:l,c,normal:new O,materialIndex:0};un.getNormal(Sr,wr,Er,u.normal),h.face=u,h.barycoord=d}return h}var Ln=class extends Ke{constructor(t=null,e=1,i=1,n,r,o,a,l,c=Ne,h=Ne,d,u){super(null,o,a,l,c,h,n,r,d,u),this.isDataTexture=!0,this.image={data:t,width:e,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Dn=class extends ee{constructor(t,e,i,n=1){super(t,e,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=n}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){let t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}},jn=new ie,Bc=new ie,Rr=[],Oc=new Fi,ed=new ie,Ts=new Ct,As=new Bi,Qe=class extends Ct{constructor(t,e,i){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new Dn(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let n=0;n<i;n++)this.setMatrixAt(n,ed)}computeBoundingBox(){let t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new Fi),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<e;i++)this.getMatrixAt(i,jn),Oc.copy(t.boundingBox).applyMatrix4(jn),this.boundingBox.union(Oc)}computeBoundingSphere(){let t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new Bi),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<e;i++)this.getMatrixAt(i,jn),As.copy(t.boundingSphere).applyMatrix4(jn),this.boundingSphere.union(As)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){return this.instanceColor===null?e.setRGB(1,1,1):e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){return e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){let i=e.morphTargetInfluences,n=this.morphTexture.source.data.data,r=i.length+1,o=t*r+1;for(let a=0;a<i.length;a++)i[a]=n[o+a]}raycast(t,e){let i=this.matrixWorld,n=this.count;if(Ts.geometry=this.geometry,Ts.material=this.material,Ts.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),As.copy(this.boundingSphere),As.applyMatrix4(i),t.ray.intersectsSphere(As)!==!1))for(let r=0;r<n;r++){this.getMatrixAt(r,jn),Bc.multiplyMatrices(i,jn),Ts.matrixWorld=Bc,Ts.raycast(t,Rr);for(let o=0,a=Rr.length;o<a;o++){let l=Rr[o];l.instanceId=r,l.object=this,e.push(l)}Rr.length=0}}setColorAt(t,e){return this.instanceColor===null&&(this.instanceColor=new Dn(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3),this}setMatrixAt(t,e){return e.toArray(this.instanceMatrix.array,t*16),this}setMorphAt(t,e){let i=e.morphTargetInfluences,n=i.length+1;this.morphTexture===null&&(this.morphTexture=new Ln(new Float32Array(n*this.count),n,this.count,Co,gi));let r=this.morphTexture.source.data.data,o=0;for(let c=0;c<i.length;c++)o+=i[c];let a=this.geometry.morphTargetsRelative?1:1-o,l=n*t;return r[l]=a,r.set(i,l+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Cn=new Bi,id=new Wt(.5,.5),Pr=new O,hs=class{constructor(t=new bi,e=new bi,i=new bi,n=new bi,r=new bi,o=new bi){this.planes=[t,e,i,n,r,o]}set(t,e,i,n,r,o){let a=this.planes;return a[0].copy(t),a[1].copy(e),a[2].copy(i),a[3].copy(n),a[4].copy(r),a[5].copy(o),this}copy(t){let e=this.planes;for(let i=0;i<6;i++)e[i].copy(t.planes[i]);return this}setFromProjectionMatrix(t,e=Si,i=!1){let n=this.planes,r=t.elements,o=r[0],a=r[1],l=r[2],c=r[3],h=r[4],d=r[5],u=r[6],f=r[7],g=r[8],_=r[9],m=r[10],p=r[11],b=r[12],T=r[13],y=r[14],v=r[15];if(n[0].setComponents(c-o,f-h,p-g,v-b).normalize(),n[1].setComponents(c+o,f+h,p+g,v+b).normalize(),n[2].setComponents(c+a,f+d,p+_,v+T).normalize(),n[3].setComponents(c-a,f-d,p-_,v-T).normalize(),i)n[4].setComponents(l,u,m,y).normalize(),n[5].setComponents(c-l,f-u,p-m,v-y).normalize();else if(n[4].setComponents(c-l,f-u,p-m,v-y).normalize(),e===Si)n[5].setComponents(c+l,f+u,p+m,v+y).normalize();else if(e===rs)n[5].setComponents(l,u,m,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),Cn.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),Cn.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(Cn)}intersectsSprite(t){Cn.center.set(0,0,0);let e=id.distanceTo(t.center);return Cn.radius=.7071067811865476+e,Cn.applyMatrix4(t.matrixWorld),this.intersectsSphere(Cn)}intersectsSphere(t){let e=this.planes,i=t.center,n=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(i)<n)return!1;return!0}intersectsBox(t){let e=this.planes;for(let i=0;i<6;i++){let n=e[i];if(Pr.x=n.normal.x>0?t.max.x:t.min.x,Pr.y=n.normal.y>0?t.max.y:t.min.y,Pr.z=n.normal.z>0?t.max.z:t.min.z,n.distanceToPoint(Pr)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let i=0;i<6;i++)if(e[i].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var dn=class extends wi{constructor(t){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new yt(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}},Qr=new O,jr=new O,zc=new ie,Cs=new In,Ir=new Bi,il=new O,kc=new O,to=class extends Ue{constructor(t=new _e,e=new dn){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){let t=this.geometry;if(t.index===null){let e=t.attributes.position,i=[0];for(let n=1,r=e.count;n<r;n++)Qr.fromBufferAttribute(e,n-1),jr.fromBufferAttribute(e,n),i[n]=i[n-1],i[n]+=Qr.distanceTo(jr);t.setAttribute("lineDistance",new fe(i,1))}else Dt("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let i=this.geometry,n=this.matrixWorld,r=t.params.Line.threshold,o=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Ir.copy(i.boundingSphere),Ir.applyMatrix4(n),Ir.radius+=r,t.ray.intersectsSphere(Ir)===!1)return;zc.copy(n).invert(),Cs.copy(t.ray).applyMatrix4(zc);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=this.isLineSegments?2:1,h=i.index,u=i.attributes.position;if(h!==null){let f=Math.max(0,o.start),g=Math.min(h.count,o.start+o.count);for(let _=f,m=g-1;_<m;_+=c){let p=h.getX(_),b=h.getX(_+1),T=Lr(this,t,Cs,l,p,b,_);T&&e.push(T)}if(this.isLineLoop){let _=h.getX(g-1),m=h.getX(f),p=Lr(this,t,Cs,l,_,m,g-1);p&&e.push(p)}}else{let f=Math.max(0,o.start),g=Math.min(u.count,o.start+o.count);for(let _=f,m=g-1;_<m;_+=c){let p=Lr(this,t,Cs,l,_,_+1,_);p&&e.push(p)}if(this.isLineLoop){let _=Lr(this,t,Cs,l,g-1,f,g-1);_&&e.push(_)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){let n=e[i[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=n.length;r<o;r++){let a=n[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}};function Lr(s,t,e,i,n,r,o){let a=s.geometry.attributes.position;if(Qr.fromBufferAttribute(a,n),jr.fromBufferAttribute(a,r),e.distanceSqToSegment(Qr,jr,il,kc)>i)return;il.applyMatrix4(s.matrixWorld);let c=t.ray.origin.distanceTo(il);if(!(c<t.near||c>t.far))return{distance:c,point:kc.clone().applyMatrix4(s.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:s}}var Hc=new O,Gc=new O,Nn=class extends to{constructor(t,e){super(t,e),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let t=this.geometry;if(t.index===null){let e=t.attributes.position,i=[];for(let n=0,r=e.count;n<r;n+=2)Hc.fromBufferAttribute(e,n),Gc.fromBufferAttribute(e,n+1),i[n]=n===0?0:i[n-1],i[n+1]=i[n]+Hc.distanceTo(Gc);t.setAttribute("lineDistance",new fe(i,1))}else Dt("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}};var eo=class extends wi{constructor(t){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new yt(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}},Vc=new ie,cl=new In,Dr=new Bi,Nr=new O,Bs=class extends Ue{constructor(t=new _e,e=new eo){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let i=this.geometry,n=this.matrixWorld,r=t.params.Points.threshold,o=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Dr.copy(i.boundingSphere),Dr.applyMatrix4(n),Dr.radius+=r,t.ray.intersectsSphere(Dr)===!1)return;Vc.copy(n).invert(),cl.copy(t.ray).applyMatrix4(Vc);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=i.index,d=i.attributes.position;if(c!==null){let u=Math.max(0,o.start),f=Math.min(c.count,o.start+o.count);for(let g=u,_=f;g<_;g++){let m=c.getX(g);Nr.fromBufferAttribute(d,m),Wc(Nr,m,l,n,t,e,this)}}else{let u=Math.max(0,o.start),f=Math.min(d.count,o.start+o.count);for(let g=u,_=f;g<_;g++)Nr.fromBufferAttribute(d,g),Wc(Nr,g,l,n,t,e,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){let n=e[i[0]];if(n!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=n.length;r<o;r++){let a=n[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}};function Wc(s,t,e,i,n,r,o){let a=cl.distanceSqToPoint(s);if(a<e){let l=new O;cl.closestPointToPoint(s,l),l.applyMatrix4(i);let c=n.ray.origin.distanceTo(l);if(c<n.near||c>n.far)return;r.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:t,face:null,faceIndex:null,barycoord:null,object:o})}}var Os=class extends Ke{constructor(t=[],e=yn,i,n,r,o,a,l,c,h){super(t,e,i,n,r,o,a,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},mi=class extends Ke{constructor(t,e,i,n,r,o,a,l,c){super(t,e,i,n,r,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}};var fn=class extends Ke{constructor(t,e,i=Ti,n,r,o,a=Ne,l=Ne,c,h=Ni,d=1){if(h!==Ni&&h!==vn)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let u={width:t,height:e,depth:d};super(u,n,r,o,a,l,h,i,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new as(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return e.compareFunction=this.compareFunction,e}},io=class extends fn{constructor(t,e=Ti,i=yn,n,r,o=Ne,a=Ne,l,c=Ni){let h={width:t,height:t,depth:1},d=[h,h,h,h,h,h];super(t,t,e,i,n,r,o,a,l,c),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}},zs=class extends Ke{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}},Jt=class s extends _e{constructor(t=1,e=1,i=1,n=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:i,widthSegments:n,heightSegments:r,depthSegments:o};let a=this;n=Math.floor(n),r=Math.floor(r),o=Math.floor(o);let l=[],c=[],h=[],d=[],u=0,f=0;g("z","y","x",-1,-1,i,e,t,o,r,0),g("z","y","x",1,-1,i,e,-t,o,r,1),g("x","z","y",1,1,t,i,e,n,o,2),g("x","z","y",1,-1,t,i,-e,n,o,3),g("x","y","z",1,-1,t,e,i,n,r,4),g("x","y","z",-1,-1,t,e,-i,n,r,5),this.setIndex(l),this.setAttribute("position",new fe(c,3)),this.setAttribute("normal",new fe(h,3)),this.setAttribute("uv",new fe(d,2));function g(_,m,p,b,T,y,v,S,A,x,E){let R=y/A,I=v/x,D=y/2,C=v/2,P=S/2,N=A+1,q=x+1,W=0,tt=0,k=new O;for(let X=0;X<q;X++){let H=X*I-C;for(let rt=0;rt<N;rt++){let lt=rt*R-D;k[_]=lt*b,k[m]=H*T,k[p]=P,c.push(k.x,k.y,k.z),k[_]=0,k[m]=0,k[p]=S>0?1:-1,h.push(k.x,k.y,k.z),d.push(rt/A),d.push(1-X/x),W+=1}}for(let X=0;X<x;X++)for(let H=0;H<A;H++){let rt=u+H+N*X,lt=u+H+N*(X+1),Ht=u+(H+1)+N*(X+1),Bt=u+(H+1)+N*X;l.push(rt,lt,Bt),l.push(lt,Ht,Bt),tt+=6}a.addGroup(f,tt,E),f+=tt,u+=W}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};var Xe=class s extends _e{constructor(t=1,e=1,i=1,n=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:i,radialSegments:n,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};let c=this;n=Math.floor(n),r=Math.floor(r);let h=[],d=[],u=[],f=[],g=0,_=[],m=i/2,p=0;b(),o===!1&&(t>0&&T(!0),e>0&&T(!1)),this.setIndex(h),this.setAttribute("position",new fe(d,3)),this.setAttribute("normal",new fe(u,3)),this.setAttribute("uv",new fe(f,2));function b(){let y=new O,v=new O,S=0,A=(e-t)/i;for(let x=0;x<=r;x++){let E=[],R=x/r,I=R*(e-t)+t;for(let D=0;D<=n;D++){let C=D/n,P=C*l+a,N=Math.sin(P),q=Math.cos(P);v.x=I*N,v.y=-R*i+m,v.z=I*q,d.push(v.x,v.y,v.z),y.set(N,A,q).normalize(),u.push(y.x,y.y,y.z),f.push(C,1-R),E.push(g++)}_.push(E)}for(let x=0;x<n;x++)for(let E=0;E<r;E++){let R=_[E][x],I=_[E+1][x],D=_[E+1][x+1],C=_[E][x+1];(t>0||E!==0)&&(h.push(R,I,C),S+=3),(e>0||E!==r-1)&&(h.push(I,D,C),S+=3)}c.addGroup(p,S,0),p+=S}function T(y){let v=g,S=new Wt,A=new O,x=0,E=y===!0?t:e,R=y===!0?1:-1;for(let D=1;D<=n;D++)d.push(0,m*R,0),u.push(0,R,0),f.push(.5,.5),g++;let I=g;for(let D=0;D<=n;D++){let P=D/n*l+a,N=Math.cos(P),q=Math.sin(P);A.x=E*q,A.y=m*R,A.z=E*N,d.push(A.x,A.y,A.z),u.push(0,R,0),S.x=N*.5+.5,S.y=q*.5*R+.5,f.push(S.x,S.y),g++}for(let D=0;D<n;D++){let C=v+D,P=I+D;y===!0?h.push(P,P+1,C):h.push(P+1,P,C),x+=3}c.addGroup(p,x,y===!0?1:2),p+=x}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Oi=class s extends Xe{constructor(t=1,e=1,i=32,n=1,r=!1,o=0,a=Math.PI*2){super(0,t,e,i,n,r,o,a),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:i,heightSegments:n,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(t){return new s(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},no=class s extends _e{constructor(t=[],e=[],i=1,n=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:i,detail:n};let r=[],o=[];a(n),c(i),h(),this.setAttribute("position",new fe(r,3)),this.setAttribute("normal",new fe(r.slice(),3)),this.setAttribute("uv",new fe(o,2)),n===0?this.computeVertexNormals():this.normalizeNormals();function a(b){let T=new O,y=new O,v=new O;for(let S=0;S<e.length;S+=3)f(e[S+0],T),f(e[S+1],y),f(e[S+2],v),l(T,y,v,b)}function l(b,T,y,v){let S=v+1,A=[];for(let x=0;x<=S;x++){A[x]=[];let E=b.clone().lerp(y,x/S),R=T.clone().lerp(y,x/S),I=S-x;for(let D=0;D<=I;D++)D===0&&x===S?A[x][D]=E:A[x][D]=E.clone().lerp(R,D/I)}for(let x=0;x<S;x++)for(let E=0;E<2*(S-x)-1;E++){let R=Math.floor(E/2);E%2===0?(u(A[x][R+1]),u(A[x+1][R]),u(A[x][R])):(u(A[x][R+1]),u(A[x+1][R+1]),u(A[x+1][R]))}}function c(b){let T=new O;for(let y=0;y<r.length;y+=3)T.x=r[y+0],T.y=r[y+1],T.z=r[y+2],T.normalize().multiplyScalar(b),r[y+0]=T.x,r[y+1]=T.y,r[y+2]=T.z}function h(){let b=new O;for(let T=0;T<r.length;T+=3){b.x=r[T+0],b.y=r[T+1],b.z=r[T+2];let y=m(b)/2/Math.PI+.5,v=p(b)/Math.PI+.5;o.push(y,1-v)}g(),d()}function d(){for(let b=0;b<o.length;b+=6){let T=o[b+0],y=o[b+2],v=o[b+4],S=Math.max(T,y,v),A=Math.min(T,y,v);S>.9&&A<.1&&(T<.2&&(o[b+0]+=1),y<.2&&(o[b+2]+=1),v<.2&&(o[b+4]+=1))}}function u(b){r.push(b.x,b.y,b.z)}function f(b,T){let y=b*3;T.x=t[y+0],T.y=t[y+1],T.z=t[y+2]}function g(){let b=new O,T=new O,y=new O,v=new O,S=new Wt,A=new Wt,x=new Wt;for(let E=0,R=0;E<r.length;E+=9,R+=6){b.set(r[E+0],r[E+1],r[E+2]),T.set(r[E+3],r[E+4],r[E+5]),y.set(r[E+6],r[E+7],r[E+8]),S.set(o[R+0],o[R+1]),A.set(o[R+2],o[R+3]),x.set(o[R+4],o[R+5]),v.copy(b).add(T).add(y).divideScalar(3);let I=m(v);_(S,R+0,b,I),_(A,R+2,T,I),_(x,R+4,y,I)}}function _(b,T,y,v){v<0&&b.x===1&&(o[T]=b.x-1),y.x===0&&y.z===0&&(o[T]=v/2/Math.PI+.5)}function m(b){return Math.atan2(b.z,-b.x)}function p(b){return Math.atan2(-b.y,Math.sqrt(b.x*b.x+b.z*b.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.vertices,t.indices,t.radius,t.detail)}},ks=class s extends no{constructor(t=1,e=0){let i=(1+Math.sqrt(5))/2,n=1/i,r=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-n,-i,0,-n,i,0,n,-i,0,n,i,-n,-i,0,-n,i,0,n,-i,0,n,i,0,-i,0,-n,i,0,-n,-i,0,n,i,0,n],o=[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9];super(r,o,t,e),this.type="DodecahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new s(t.radius,t.detail)}};var Hs=class s extends _e{constructor(t=1,e=1,i=1,n=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:i,heightSegments:n};let r=t/2,o=e/2,a=Math.floor(i),l=Math.floor(n),c=a+1,h=l+1,d=t/a,u=e/l,f=[],g=[],_=[],m=[];for(let p=0;p<h;p++){let b=p*u-o;for(let T=0;T<c;T++){let y=T*d-r;g.push(y,-b,0),_.push(0,0,1),m.push(T/a),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let b=0;b<a;b++){let T=b+c*p,y=b+c*(p+1),v=b+1+c*(p+1),S=b+1+c*p;f.push(T,y,S),f.push(y,v,S)}this.setIndex(f),this.setAttribute("position",new fe(g,3)),this.setAttribute("normal",new fe(_,3)),this.setAttribute("uv",new fe(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.width,t.height,t.widthSegments,t.heightSegments)}},pn=class s extends _e{constructor(t=.5,e=1,i=32,n=1,r=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:t,outerRadius:e,thetaSegments:i,phiSegments:n,thetaStart:r,thetaLength:o},i=Math.max(3,i),n=Math.max(1,n);let a=[],l=[],c=[],h=[],d=t,u=(e-t)/n,f=new O,g=new Wt;for(let _=0;_<=n;_++){for(let m=0;m<=i;m++){let p=r+m/i*o;f.x=d*Math.cos(p),f.y=d*Math.sin(p),l.push(f.x,f.y,f.z),c.push(0,0,1),g.x=(f.x/e+1)/2,g.y=(f.y/e+1)/2,h.push(g.x,g.y)}d+=u}for(let _=0;_<n;_++){let m=_*(i+1);for(let p=0;p<i;p++){let b=p+m,T=b,y=b+i+1,v=b+i+2,S=b+1;a.push(T,y,S),a.push(y,v,S)}}this.setIndex(a),this.setAttribute("position",new fe(l,3)),this.setAttribute("normal",new fe(c,3)),this.setAttribute("uv",new fe(h,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}};var Un=class s extends _e{constructor(t=1,e=32,i=16,n=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:i,phiStart:n,phiLength:r,thetaStart:o,thetaLength:a},e=Math.max(3,Math.floor(e)),i=Math.max(2,Math.floor(i));let l=Math.min(o+a,Math.PI),c=0,h=[],d=new O,u=new O,f=[],g=[],_=[],m=[];for(let p=0;p<=i;p++){let b=[],T=p/i,y=o+T*a,v=t*Math.cos(y),S=Math.sqrt(t*t-v*v),A=0;p===0&&o===0?A=.5/e:p===i&&l===Math.PI&&(A=-.5/e);for(let x=0;x<=e;x++){let E=x/e,R=n+E*r;d.x=-S*Math.cos(R),d.y=v,d.z=S*Math.sin(R),g.push(d.x,d.y,d.z),u.copy(d).normalize(),_.push(u.x,u.y,u.z),m.push(E+A,1-T),b.push(c++)}h.push(b)}for(let p=0;p<i;p++)for(let b=0;b<e;b++){let T=h[p][b+1],y=h[p][b],v=h[p+1][b],S=h[p+1][b+1];(p!==0||o>0)&&f.push(T,y,S),(p!==i-1||l<Math.PI)&&f.push(y,v,S)}this.setIndex(f),this.setAttribute("position",new fe(g,3)),this.setAttribute("normal",new fe(_,3)),this.setAttribute("uv",new fe(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new s(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};function zn(s){let t={};for(let e in s){t[e]={};for(let i in s[e]){let n=s[e][i];if(Xc(n))n.isRenderTargetTexture?(Dt("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][i]=null):t[e][i]=n.clone();else if(Array.isArray(n))if(Xc(n[0])){let r=[];for(let o=0,a=n.length;o<a;o++)r[o]=n[o].clone();t[e][i]=r}else t[e][i]=n.slice();else t[e][i]=n}}return t}function Ye(s){let t={};for(let e=0;e<s.length;e++){let i=zn(s[e]);for(let n in i)t[n]=i[n]}return t}function Xc(s){return s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)}function nd(s){let t=[];for(let e=0;e<s.length;e++)t.push(s[e].clone());return t}function Fl(s){let t=s.getRenderTarget();return t===null?s.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:Zt.workingColorSpace}var Oh={clone:zn,merge:Ye},sd=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,rd=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Re=class extends wi{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=sd,this.fragmentShader=rd,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=zn(t.uniforms),this.uniformsGroups=nd(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let n in this.uniforms){let o=this.uniforms[n].value;o&&o.isTexture?e.uniforms[n]={type:"t",value:o.toJSON(t).uuid}:o&&o.isColor?e.uniforms[n]={type:"c",value:o.getHex()}:o&&o.isVector2?e.uniforms[n]={type:"v2",value:o.toArray()}:o&&o.isVector3?e.uniforms[n]={type:"v3",value:o.toArray()}:o&&o.isVector4?e.uniforms[n]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?e.uniforms[n]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?e.uniforms[n]={type:"m4",value:o.toArray()}:e.uniforms[n]={value:o}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let i={};for(let n in this.extensions)this.extensions[n]===!0&&(i[n]=!0);return Object.keys(i).length>0&&(e.extensions=i),e}fromJSON(t,e){if(super.fromJSON(t,e),t.uniforms!==void 0)for(let i in t.uniforms){let n=t.uniforms[i];switch(this.uniforms[i]={},n.type){case"t":this.uniforms[i].value=e[n.value]||null;break;case"c":this.uniforms[i].value=new yt().setHex(n.value);break;case"v2":this.uniforms[i].value=new Wt().fromArray(n.value);break;case"v3":this.uniforms[i].value=new O().fromArray(n.value);break;case"v4":this.uniforms[i].value=new xe().fromArray(n.value);break;case"m3":this.uniforms[i].value=new kt().fromArray(n.value);break;case"m4":this.uniforms[i].value=new ie().fromArray(n.value);break;default:this.uniforms[i].value=n.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(let i in t.extensions)this.extensions[i]=t.extensions[i];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}},so=class extends Re{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}};var Gs=class extends wi{constructor(t){super(),this.isMeshPhongMaterial=!0,this.type="MeshPhongMaterial",this.color=new yt(16777215),this.specular=new yt(1118481),this.shininess=30,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new yt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=sr,this.normalScale=new Wt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new pi,this.combine=Zs,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.specular.copy(t.specular),this.shininess=t.shininess,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.envMapIntensity=t.envMapIntensity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}};var ve=class extends wi{constructor(t){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new yt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new yt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=sr,this.normalScale=new Wt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new pi,this.combine=Zs,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.envMapIntensity=t.envMapIntensity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}},ro=class extends wi{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Sh,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},oo=class extends wi{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}};function ts(s,t){return!s||s.constructor===t?s:typeof t.BYTES_PER_ELEMENT=="number"?new t(s):Array.prototype.slice.call(s)}function nl(s){return s!==void 0&&s.inTangents!==void 0&&s.outTangents!==void 0}var mn=class{constructor(t,e,i,n){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=n!==void 0?n:new e.constructor(i),this.sampleValues=e,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,i=this._cachedIndex,n=e[i],r=e[i-1];i:{t:{let o;e:{n:if(!(t<n)){for(let a=i+2;;){if(n===void 0){if(t<r)break n;return i=e.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===a)break;if(r=n,n=e[++i],t<n)break t}o=e.length;break e}if(!(t>=r)){let a=e[1];t<a&&(i=2,r=a);for(let l=i-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===l)break;if(n=r,r=e[--i-1],t>=r)break t}o=i,i=0;break e}break i}for(;i<o;){let a=i+o>>>1;t<e[a]?o=a:i=a+1}if(n=e[i],r=e[i-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===void 0)return i=e.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,r,n)}return this.interpolate_(i,r,t,n)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,i=this.sampleValues,n=this.valueSize,r=t*n;for(let o=0;o!==n;++o)e[o]=i[r+o];return e}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},ao=class extends mn{constructor(t,e,i,n){super(t,e,i,n),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:ol,endingEnd:ol}}intervalChanged_(t,e,i){let n=this.parameterPositions,r=t-2,o=t+1,a=n[r],l=n[o];if(a===void 0)switch(this.getSettings_().endingStart){case al:r=t,a=2*e-i;break;case ll:r=n.length-2,a=e+n[r]-n[r+1];break;default:r=t,a=i}if(l===void 0)switch(this.getSettings_().endingEnd){case al:o=t,l=2*i-e;break;case ll:o=1,l=i+n[1]-n[0];break;default:o=t-1,l=e}let c=(i-e)*.5,h=this.valueSize;this._weightPrev=c/(e-a),this._weightNext=c/(l-i),this._offsetPrev=r*h,this._offsetNext=o*h}interpolate_(t,e,i,n){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,h=this._offsetPrev,d=this._offsetNext,u=this._weightPrev,f=this._weightNext,g=(i-e)/(n-e),_=g*g,m=_*g,p=-u*m+2*u*_-u*g,b=(1+u)*m+(-1.5-2*u)*_+(-.5+u)*g+1,T=(-1-f)*m+(1.5+f)*_+.5*g,y=f*m-f*_;for(let v=0;v!==a;++v)r[v]=p*o[h+v]+b*o[c+v]+T*o[l+v]+y*o[d+v];return r}},lo=class extends mn{constructor(t,e,i,n){super(t,e,i,n)}interpolate_(t,e,i,n){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,h=(i-e)/(n-e),d=1-h;for(let u=0;u!==a;++u)r[u]=o[c+u]*d+o[l+u]*h;return r}},co=class extends mn{constructor(t,e,i,n){super(t,e,i,n)}interpolate_(t){return this.copySampleValue_(t-1)}},ho=class extends mn{interpolate_(t,e,i,n){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,h=this.inTangents,d=this.outTangents;if(!h||!d){let g=(i-e)/(n-e),_=1-g;for(let m=0;m!==a;++m)r[m]=o[c+m]*_+o[l+m]*g;return r}let u=a*2,f=t-1;for(let g=0;g!==a;++g){let _=o[c+g],m=o[l+g],p=f*u+g*2,b=d[p],T=d[p+1],y=t*u+g*2,v=h[y],S=h[y+1],A=ad(i,e,b,v,n);r[g]=zh(A,_,T,S,m)}return r}};function zh(s,t,e,i,n){let r=1-s;return r*r*r*t+3*r*r*s*e+3*r*s*s*i+s*s*s*n}function od(s,t,e,i,n){let r=1-s;return 3*r*r*(e-t)+6*r*s*(i-e)+3*s*s*(n-i)}function ad(s,t,e,i,n){let r=(s-t)/(n-t);for(let o=0;o<8;o++){let a=zh(r,t,e,i,n)-s;if(Math.abs(a)<1e-10)break;let l=od(r,t,e,i,n);if(Math.abs(l)<1e-10)break;r=Math.max(0,Math.min(1,r-a/l))}return r}var ci=class{constructor(t,e,i,n){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=ts(e,this.TimeBufferType),this.values=ts(i,this.ValueBufferType),this.setInterpolation(n||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,i;if(e.toJSON!==this.toJSON)i=e.toJSON(t);else{i={name:t.name,times:ts(t.times,Array),values:ts(t.values,Array)};let n=t.getInterpolation();n!==t.DefaultInterpolation&&(i.interpolation=n),nl(t.settings)&&(i.settings={inTangents:ts(t.settings.inTangents,Array),outTangents:ts(t.settings.outTangents,Array)})}return i.type=t.ValueTypeName,i}InterpolantFactoryMethodDiscrete(t){return new co(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new lo(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new ao(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodBezier(t){let e=new ho(this.times,this.values,this.getValueSize(),t);return this.settings&&(e.inTangents=this.settings.inTangents,e.outTangents=this.settings.outTangents),e}setInterpolation(t){let e;switch(t){case Rs:e=this.InterpolantFactoryMethodDiscrete;break;case Yr:e=this.InterpolantFactoryMethodLinear;break;case Br:e=this.InterpolantFactoryMethodSmooth;break;case rl:e=this.InterpolantFactoryMethodBezier;break}if(e===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return Dt("KeyframeTrack:",i),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Rs;case this.InterpolantFactoryMethodLinear:return Yr;case this.InterpolantFactoryMethodSmooth:return Br;case this.InterpolantFactoryMethodBezier:return rl}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let i=0,n=e.length;i!==n;++i)e[i]+=t}return this}scale(t){if(t!==1){let e=this.times;for(let i=0,n=e.length;i!==n;++i)e[i]*=t;nl(this.settings)&&(qc(this.settings.inTangents,t),qc(this.settings.outTangents,t))}return this}trim(t,e){let i=this.times,n=i.length,r=0,o=n-1;for(;r!==n&&i[r]<t;)++r;for(;o!==-1&&i[o]>e;)--o;if(++o,r!==0||o!==n){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=i.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(Ft("KeyframeTrack: Invalid value size in track.",this),t=!1);let i=this.times,n=this.values,r=i.length;r===0&&(Ft("KeyframeTrack: Track is empty.",this),t=!1);let o=null;for(let a=0;a!==r;a++){let l=i[a];if(typeof l=="number"&&isNaN(l)){Ft("KeyframeTrack: Time is not a valid number.",this,a,l),t=!1;break}if(o!==null&&o>l){Ft("KeyframeTrack: Out of order keys.",this,a,l,o),t=!1;break}o=l}if(n!==void 0&&Fu(n))for(let a=0,l=n.length;a!==l;++a){let c=n[a];if(isNaN(c)){Ft("KeyframeTrack: Value is not a valid number.",this,a,c),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),i=this.getValueSize(),n=this.getInterpolation()===Br,r=t.length-1,o=1;for(let a=1;a<r;++a){let l=!1,c=t[a],h=t[a+1];if(c!==h&&(a!==1||c!==t[0]))if(n)l=!0;else{let d=a*i,u=d-i,f=d+i;for(let g=0;g!==i;++g){let _=e[d+g];if(_!==e[u+g]||_!==e[f+g]){l=!0;break}}}if(l){if(a!==o){t[o]=t[a];let d=a*i,u=o*i;for(let f=0;f!==i;++f)e[u+f]=e[d+f]}++o}}if(r>0){t[o]=t[r];for(let a=r*i,l=o*i,c=0;c!==i;++c)e[l+c]=e[a+c];++o}return o!==t.length?(this.times=t.slice(0,o),this.values=e.slice(0,o*i)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),i=this.constructor,n=new i(this.name,t,e);return n.createInterpolant=this.createInterpolant,nl(this.settings)&&(n.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),n}};function qc(s,t){for(let e=0,i=s.length;e!==i;e+=2)s[e]*=t}ci.prototype.ValueTypeName="";ci.prototype.TimeBufferType=Float32Array;ci.prototype.ValueBufferType=Float32Array;ci.prototype.DefaultInterpolation=Yr;var gn=class extends ci{constructor(t,e,i){super(t,e,i)}};gn.prototype.ValueTypeName="bool";gn.prototype.ValueBufferType=Array;gn.prototype.DefaultInterpolation=Rs;gn.prototype.InterpolantFactoryMethodLinear=void 0;gn.prototype.InterpolantFactoryMethodSmooth=void 0;var uo=class extends ci{constructor(t,e,i,n){super(t,e,i,n)}};uo.prototype.ValueTypeName="color";var fo=class extends ci{constructor(t,e,i,n){super(t,e,i,n)}};fo.prototype.ValueTypeName="number";var po=class extends mn{constructor(t,e,i,n){super(t,e,i,n)}interpolate_(t,e,i,n){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(i-e)/(n-e),c=t*a;for(let h=c+a;c!==h;c+=4)fi.slerpFlat(r,0,o,c-a,o,c,l);return r}},Vs=class extends ci{constructor(t,e,i,n){super(t,e,i,n)}InterpolantFactoryMethodLinear(t){return new po(this.times,this.values,this.getValueSize(),t)}};Vs.prototype.ValueTypeName="quaternion";Vs.prototype.InterpolantFactoryMethodSmooth=void 0;var xn=class extends ci{constructor(t,e,i){super(t,e,i)}};xn.prototype.ValueTypeName="string";xn.prototype.ValueBufferType=Array;xn.prototype.DefaultInterpolation=Rs;xn.prototype.InterpolantFactoryMethodLinear=void 0;xn.prototype.InterpolantFactoryMethodSmooth=void 0;var mo=class extends ci{constructor(t,e,i,n){super(t,e,i,n)}};mo.prototype.ValueTypeName="vector";var go=class{constructor(t,e,i){let n=this,r=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=i,this._abortController=null,this.itemStart=function(h){a++,r===!1&&n.onStart!==void 0&&n.onStart(h,o,a),r=!0},this.itemEnd=function(h){o++,n.onProgress!==void 0&&n.onProgress(h,o,a),o===a&&(r=!1,n.onLoad!==void 0&&n.onLoad())},this.itemError=function(h){n.onError!==void 0&&n.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,d){return c.push(h,d),this},this.removeHandler=function(h){let d=c.indexOf(h);return d!==-1&&c.splice(d,2),this},this.getHandler=function(h){for(let d=0,u=c.length;d<u;d+=2){let f=c[d],g=c[d+1];if(f.global&&(f.lastIndex=0),f.test(h))return g}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},kh=new go,xo=class{constructor(t){this.manager=t!==void 0?t:kh,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(t,e){let i=this;return new Promise(function(n,r){i.load(t,n,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}abort(){return this}};xo.DEFAULT_MATERIAL_NAME="__DEFAULT";var Ws=class extends Ue{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new yt(t),this.intensity=e}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,e}},Xs=class extends Ws{constructor(t,e,i){super(t,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Ue.DEFAULT_UP),this.updateMatrix(),this.groundColor=new yt(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}toJSON(t){let e=super.toJSON(t);return e.object.groundColor=this.groundColor.getHex(),e}},sl=new ie,Yc=new O,$c=new O,_o=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Wt(512,512),this.mapType=ri,this.map=null,this.mapPass=null,this.matrix=new ie,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new hs,this._frameExtents=new Wt(1,1),this._viewportCount=1,this._viewports=[new xe(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera;Yc.setFromMatrixPosition(t.matrixWorld),e.position.copy(Yc),$c.setFromMatrixPosition(t.target.matrixWorld),e.lookAt($c),e.updateMatrixWorld(),this._updateMatrix(e,this.matrix,this._frustum)}_updateMatrix(t,e,i,n){sl.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),i.setFromProjectionMatrix(sl,t.coordinateSystem,t.reversedDepth);let r=this._frameExtents,o=n?n.z/r.x:1,a=n?n.w/r.y:1,l=n?n.x/r.x:0,c=n?n.y/r.y:0;t.coordinateSystem===rs||t.reversedDepth?e.set(.5*o,0,0,.5*o+l,0,.5*a,0,.5*a+c,0,0,1,0,0,0,0,1):e.set(.5*o,0,0,.5*o+l,0,.5*a,0,.5*a+c,0,0,.5,.5,0,0,0,1),e.multiply(sl)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return t.intensity=this.intensity,t.bias=this.bias,t.normalBias=this.normalBias,t.radius=this.radius,t.blurSamples=this.blurSamples,t.mapSize=this.mapSize.toArray(),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}},Ur=new O,Fr=new fi,Li=new O,qs=class extends Ue{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ie,this.projectionMatrix=new ie,this.projectionMatrixInverse=new ie,this.coordinateSystem=Si,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose(Ur,Fr,Li),Li.x===1&&Li.y===1&&Li.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ur,Fr,Li.set(1,1,1)).invert()}updateWorldMatrix(t,e,i=!1){super.updateWorldMatrix(t,e,i),this.matrixWorld.decompose(Ur,Fr,Li),Li.x===1&&Li.y===1&&Li.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ur,Fr,Li.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},hn=new O,Zc=new Wt,Jc=new Wt,We=class extends qs{constructor(t=50,e=1,i=.1,n=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=i,this.far=n,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=$r*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(Ua*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return $r*2*Math.atan(Math.tan(Ua*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,i){hn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(hn.x,hn.y).multiplyScalar(-t/hn.z),hn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(hn.x,hn.y).multiplyScalar(-t/hn.z)}getViewSize(t,e){return this.getViewBounds(t,Zc,Jc),e.subVectors(Jc,Zc)}setViewOffset(t,e,i,n,r,o){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=n,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(Ua*.5*this.fov)/this.zoom,i=2*e,n=this.aspect*i,r=-.5*n,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*n/l,e-=o.offsetY*i/c,n*=o.width/l,i*=o.height/c}let a=this.filmOffset;a!==0&&(r+=t*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+n,e,e-i,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}};var us=class extends qs{constructor(t=-1,e=1,i=1,n=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=i,this.bottom=n,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,i,n,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=n,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,n=(this.top+this.bottom)/2,r=i-t,o=i+t,a=n+e,l=n-e;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=h*this.view.offsetY,l=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}},hl=class extends _o{constructor(){super(new us(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Ys=class extends Ws{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Ue.DEFAULT_UP),this.updateMatrix(),this.target=new Ue,this.shadow=new hl}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.shadow=this.shadow.toJSON(),e.object.target=this.target.uuid,e}};var es=-90,is=1,yo=class extends Ue{constructor(t,e,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let n=new We(es,is,t,e);n.layers=this.layers,this.add(n);let r=new We(es,is,t,e);r.layers=this.layers,this.add(r);let o=new We(es,is,t,e);o.layers=this.layers,this.add(o);let a=new We(es,is,t,e);a.layers=this.layers,this.add(a);let l=new We(es,is,t,e);l.layers=this.layers,this.add(l);let c=new We(es,is,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[i,n,r,o,a,l]=e;for(let c of e)this.remove(c);if(t===Si)i.up.set(0,1,0),i.lookAt(1,0,0),n.up.set(0,1,0),n.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===rs)i.up.set(0,-1,0),i.lookAt(-1,0,0),n.up.set(0,-1,0),n.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:n}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[r,o,a,l,c,h]=this.children,d=t.getRenderTarget(),u=t.getActiveCubeFace(),f=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;let _=i.texture.generateMipmaps;i.texture.generateMipmaps=!1;let m=!1;t.isWebGLRenderer===!0?m=t.state.buffers.depth.getReversed():m=t.reversedDepthBuffer,t.setRenderTarget(i,0,n),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,r),t.setRenderTarget(i,1,n),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,o),t.setRenderTarget(i,2,n),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,a),t.setRenderTarget(i,3,n),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,l),t.setRenderTarget(i,4,n),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,c),i.texture.generateMipmaps=_,t.setRenderTarget(i,5,n),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,h),t.setRenderTarget(d,u,f),t.xr.enabled=g,i.texture.needsPMREMUpdate=!0}},vo=class extends We{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}};var Bl="\\[\\]\\.:\\/",ld=new RegExp("["+Bl+"]","g"),Ol="[^"+Bl+"]",cd="[^"+Bl.replace("\\.","")+"]",hd=/((?:WC+[\/:])*)/.source.replace("WC",Ol),ud=/(WCOD+)?/.source.replace("WCOD",cd),dd=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Ol),fd=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Ol),pd=new RegExp("^"+hd+ud+dd+fd+"$"),md=["material","materials","bones","map"],ul=class{constructor(t,e,i){let n=i||ge.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,n)}getValue(t,e){this.bind();let i=this._targetGroup.nCachedObjects_,n=this._bindings[i];n!==void 0&&n.getValue(t,e)}setValue(t,e){let i=this._bindings;for(let n=this._targetGroup.nCachedObjects_,r=i.length;n!==r;++n)i[n].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,i=t.length;e!==i;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,i=t.length;e!==i;++e)t[e].unbind()}},ge=class s{constructor(t,e,i){this.path=e,this.parsedPath=i||s.parseTrackName(e),this.node=s.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,i){return t&&t.isAnimationObjectGroup?new s.Composite(t,e,i):new s(t,e,i)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(ld,"")}static parseTrackName(t){let e=pd.exec(t);if(e===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let i={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},n=i.nodeName&&i.nodeName.lastIndexOf(".");if(n!==void 0&&n!==-1){let r=i.nodeName.substring(n+1);md.indexOf(r)!==-1&&(i.nodeName=i.nodeName.substring(0,n),i.objectName=r)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return i}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let i=t.skeleton.getBoneByName(e);if(i!==void 0)return i}if(t.children){let i=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===e||a.uuid===e)return a;let l=i(a.children);if(l)return l}return null},n=i(t.children);if(n)return n}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let i=this.resolvedProperty;for(let n=0,r=i.length;n!==r;++n)t[e++]=i[n]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let i=this.resolvedProperty;for(let n=0,r=i.length;n!==r;++n)i[n]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let i=this.resolvedProperty;for(let n=0,r=i.length;n!==r;++n)i[n]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let i=this.resolvedProperty;for(let n=0,r=i.length;n!==r;++n)i[n]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,i=e.objectName,n=e.propertyName,r=e.propertyIndex;if(t||(t=s.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){Dt("PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let c=e.objectIndex;switch(i){case"materials":if(!t.material){Ft("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){Ft("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){Ft("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let h=0;h<t.length;h++)if(t[h].name===c){c=h;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){Ft("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){Ft("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[i]===void 0){Ft("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[i]}if(c!==void 0){if(t[c]===void 0){Ft("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[c]}}let o=t[n];if(o===void 0){let c=e.nodeName;Ft("PropertyBinding: Trying to update property for track: "+c+"."+n+" but it wasn't found.",t);return}let a=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?a=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(n==="morphTargetInfluences"){if(!t.geometry){Ft("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){Ft("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[r]!==void 0&&(r=t.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=n;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};ge.Composite=ul;ge.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};ge.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};ge.prototype.GetterByBindingType=[ge.prototype._getValue_direct,ge.prototype._getValue_array,ge.prototype._getValue_arrayElement,ge.prototype._getValue_toArray];ge.prototype.SetterByBindingTypeAndVersioning=[[ge.prototype._setValue_direct,ge.prototype._setValue_direct_setNeedsUpdate,ge.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[ge.prototype._setValue_array,ge.prototype._setValue_array_setNeedsUpdate,ge.prototype._setValue_array_setMatrixWorldNeedsUpdate],[ge.prototype._setValue_arrayElement,ge.prototype._setValue_arrayElement_setNeedsUpdate,ge.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[ge.prototype._setValue_fromArray,ge.prototype._setValue_fromArray_setNeedsUpdate,ge.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var gg=new Float32Array(1);var Kc=new ie,$s=class{constructor(t,e,i=0,n=1/0){this.ray=new In(t,e),this.near=i,this.far=n,this.camera=null,this.layers=new ls,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,e){this.ray.set(t,e)}setFromCamera(t,e){e.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(e).sub(this.ray.origin).normalize(),this.camera=e):e.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,e.projectionMatrix.elements[14]).unproject(e),this.ray.direction.set(0,0,-1).transformDirection(e.matrixWorld),this.camera=e):Ft("Raycaster: Unsupported camera type: "+e.type)}setFromXRController(t){return Kc.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Kc),this}intersectObject(t,e=!0,i=[]){return dl(t,this,i,e),i.sort(Qc),i}intersectObjects(t,e=!0,i=[]){for(let n=0,r=t.length;n<r;n++)dl(t[n],this,i,e);return i.sort(Qc),i}};function Qc(s,t){return s.distance-t.distance}function dl(s,t,e,i){let n=!0;if(s.layers.test(t.layers)&&s.raycast(t,e)===!1&&(n=!1),n===!0&&i===!0){let r=s.children;for(let o=0,a=r.length;o<a;o++)dl(r[o],t,e,!0)}}var Wl=class Wl{constructor(t,e,i,n){this.elements=[1,0,0,1],t!==void 0&&this.set(t,e,i,n)}identity(){return this.set(1,0,0,1),this}fromArray(t,e=0){for(let i=0;i<4;i++)this.elements[i]=t[i+e];return this}set(t,e,i,n){let r=this.elements;return r[0]=t,r[2]=e,r[1]=i,r[3]=n,this}};Wl.prototype.isMatrix2=!0;var fl=Wl;function zl(s,t,e,i){let n=gd(i);switch(e){case Ll:return s*t;case Co:return s*t/n.components*n.byteLength;case Ro:return s*t/n.components*n.byteLength;case Mn:return s*t*2/n.components*n.byteLength;case Po:return s*t*2/n.components*n.byteLength;case Dl:return s*t*3/n.components*n.byteLength;case oi:return s*t*4/n.components*n.byteLength;case Io:return s*t*4/n.components*n.byteLength;case Qs:case js:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*8;case tr:case er:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case Do:case Uo:return Math.max(s,16)*Math.max(t,8)/4;case Lo:case No:return Math.max(s,8)*Math.max(t,8)/2;case Fo:case Bo:case zo:case ko:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*8;case Oo:case ir:case Ho:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case Go:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case Vo:return Math.floor((s+4)/5)*Math.floor((t+3)/4)*16;case Wo:return Math.floor((s+4)/5)*Math.floor((t+4)/5)*16;case Xo:return Math.floor((s+5)/6)*Math.floor((t+4)/5)*16;case qo:return Math.floor((s+5)/6)*Math.floor((t+5)/6)*16;case Yo:return Math.floor((s+7)/8)*Math.floor((t+4)/5)*16;case $o:return Math.floor((s+7)/8)*Math.floor((t+5)/6)*16;case Zo:return Math.floor((s+7)/8)*Math.floor((t+7)/8)*16;case Jo:return Math.floor((s+9)/10)*Math.floor((t+4)/5)*16;case Ko:return Math.floor((s+9)/10)*Math.floor((t+5)/6)*16;case Qo:return Math.floor((s+9)/10)*Math.floor((t+7)/8)*16;case jo:return Math.floor((s+9)/10)*Math.floor((t+9)/10)*16;case ta:return Math.floor((s+11)/12)*Math.floor((t+9)/10)*16;case ea:return Math.floor((s+11)/12)*Math.floor((t+11)/12)*16;case ia:case na:case sa:return Math.ceil(s/4)*Math.ceil(t/4)*16;case ra:case oa:return Math.ceil(s/4)*Math.ceil(t/4)*8;case nr:case aa:return Math.ceil(s/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function gd(s){switch(s){case ri:case Cl:return{byteLength:1,components:1};case fs:case Rl:case Ai:return{byteLength:2,components:1};case To:case Ao:return{byteLength:2,components:4};case Ti:case Eo:case gi:return{byteLength:4,components:1};case Pl:case Il:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${s}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?Dt("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function lu(){let s=null,t=!1,e=null,i=null;function n(r,o){i=s.requestAnimationFrame(n),e(r,o)}return{start:function(){t!==!0&&e!==null&&s!==null&&(i=s.requestAnimationFrame(n),t=!0)},stop:function(){s!==null&&s.cancelAnimationFrame(i),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){s=r}}}function _d(s){let t=new WeakMap;function e(a,l){let c=a.array,h=a.usage,d=c.byteLength,u=s.createBuffer();s.bindBuffer(l,u),s.bufferData(l,c,h),a.onUploadCallback();let f;if(c instanceof Float32Array)f=s.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)f=s.HALF_FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?f=s.HALF_FLOAT:f=s.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=s.SHORT;else if(c instanceof Uint32Array)f=s.UNSIGNED_INT;else if(c instanceof Int32Array)f=s.INT;else if(c instanceof Int8Array)f=s.BYTE;else if(c instanceof Uint8Array)f=s.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:u,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:d}}function i(a,l,c){let h=l.array,d=l.updateRanges;if(s.bindBuffer(c,a),d.length===0)s.bufferSubData(c,0,h);else{d.sort((f,g)=>f.start-g.start);let u=0;for(let f=1;f<d.length;f++){let g=d[u],_=d[f];_.start<=g.start+g.count+1?g.count=Math.max(g.count,_.start+_.count-g.start):(++u,d[u]=_)}d.length=u+1;for(let f=0,g=d.length;f<g;f++){let _=d[f];s.bufferSubData(c,_.start*h.BYTES_PER_ELEMENT,h,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function n(a){return a.isInterleavedBufferAttribute&&(a=a.data),t.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);let l=t.get(a);l&&(s.deleteBuffer(l.buffer),t.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let h=t.get(a);(!h||h.version<a.version)&&t.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let c=t.get(a);if(c===void 0)t.set(a,e(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,a,l),c.version=a.version}}return{get:n,remove:r,update:o}}var yd=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,vd=`#ifdef USE_ALPHAHASH
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
#endif`,Md=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,bd=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Sd=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,wd=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Ed=`#ifdef USE_AOMAP
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
#endif`,Td=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Ad=`#ifdef USE_BATCHING
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
#endif`,Cd=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Rd=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Pd=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Id=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,Ld=`#ifdef USE_IRIDESCENCE
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
#endif`,Dd=`#ifdef USE_BUMPMAP
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
#endif`,Nd=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,Ud=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Fd=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Bd=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Od=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,zd=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,kd=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Hd=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,Gd=`#define PI 3.141592653589793
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
} // validated`,Vd=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,Wd=`vec3 transformedNormal = objectNormal;
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
#endif`,Xd=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,qd=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Yd=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,$d=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Zd="gl_FragColor = linearToOutputTexel( gl_FragColor );",Jd=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Kd=`#ifdef USE_ENVMAP
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
#endif`,Qd=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,jd=`#ifdef USE_ENVMAP
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
#endif`,tf=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,ef=`#ifdef USE_ENVMAP
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
#endif`,nf=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,sf=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,rf=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,of=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,af=`#ifdef USE_GRADIENTMAP
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
}`,lf=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,cf=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,hf=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,uf=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,df=`#ifdef USE_ENVMAP
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
#endif`,ff=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,pf=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,mf=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,gf=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,xf=`PhysicalMaterial material;
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
#endif`,_f=`uniform sampler2D dfgLUT;
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
}`,yf=`
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
#endif`,vf=`#if defined( RE_IndirectDiffuse )
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
#endif`,Mf=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,bf=`#ifdef USE_LIGHT_PROBES_GRID
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
#endif`,Sf=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,wf=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Ef=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Tf=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Af=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Cf=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Rf=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Pf=`#if defined( USE_POINTS_UV )
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
#endif`,If=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Lf=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Df=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Nf=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Uf=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Ff=`#ifdef USE_MORPHTARGETS
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
#endif`,Bf=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Of=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,zf=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,kf=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Hf=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Gf=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,Vf=`#ifdef USE_NORMALMAP
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
#endif`,Wf=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Xf=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,qf=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Yf=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,$f=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Zf=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,Jf=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Kf=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Qf=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,jf=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,tp=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,ep=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,ip=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,np=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,sp=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,rp=`float getShadowMask() {
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
}`,op=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,ap=`#ifdef USE_SKINNING
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
#endif`,lp=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,cp=`#ifdef USE_SKINNING
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
#endif`,hp=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,up=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,dp=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,fp=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,pp=`#ifdef USE_TRANSMISSION
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
#endif`,mp=`#ifdef USE_TRANSMISSION
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
#endif`,gp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,xp=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,_p=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,yp=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,vp=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Mp=`uniform sampler2D t2D;
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
}`,bp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Sp=`#ifdef ENVMAP_TYPE_CUBE
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
}`,wp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Ep=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Tp=`#include <common>
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
}`,Ap=`#if DEPTH_PACKING == 3200
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
}`,Cp=`#define DISTANCE
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
}`,Rp=`#define DISTANCE
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
}`,Pp=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Ip=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Lp=`uniform float scale;
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
}`,Dp=`uniform vec3 diffuse;
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
}`,Np=`#include <common>
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
}`,Up=`uniform vec3 diffuse;
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
}`,Fp=`#define LAMBERT
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
}`,Bp=`#define LAMBERT
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
}`,Op=`#define MATCAP
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
}`,zp=`#define MATCAP
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
}`,kp=`#define NORMAL
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
}`,Hp=`#define NORMAL
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
}`,Gp=`#define PHONG
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
}`,Vp=`#define PHONG
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
}`,Wp=`#define STANDARD
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
}`,Xp=`#define STANDARD
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
}`,qp=`#define TOON
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
}`,Yp=`#define TOON
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
}`,$p=`uniform float size;
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
}`,Zp=`uniform vec3 diffuse;
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
}`,Jp=`#include <common>
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
}`,Kp=`uniform vec3 color;
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
}`,Qp=`uniform float rotation;
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
}`,jp=`uniform vec3 diffuse;
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
}`,qt={alphahash_fragment:yd,alphahash_pars_fragment:vd,alphamap_fragment:Md,alphamap_pars_fragment:bd,alphatest_fragment:Sd,alphatest_pars_fragment:wd,aomap_fragment:Ed,aomap_pars_fragment:Td,batching_pars_vertex:Ad,batching_vertex:Cd,begin_vertex:Rd,beginnormal_vertex:Pd,bsdfs:Id,iridescence_fragment:Ld,bumpmap_pars_fragment:Dd,clipping_planes_fragment:Nd,clipping_planes_pars_fragment:Ud,clipping_planes_pars_vertex:Fd,clipping_planes_vertex:Bd,color_fragment:Od,color_pars_fragment:zd,color_pars_vertex:kd,color_vertex:Hd,common:Gd,cube_uv_reflection_fragment:Vd,defaultnormal_vertex:Wd,displacementmap_pars_vertex:Xd,displacementmap_vertex:qd,emissivemap_fragment:Yd,emissivemap_pars_fragment:$d,colorspace_fragment:Zd,colorspace_pars_fragment:Jd,envmap_fragment:Kd,envmap_common_pars_fragment:Qd,envmap_pars_fragment:jd,envmap_pars_vertex:tf,envmap_physical_pars_fragment:df,envmap_vertex:ef,fog_vertex:nf,fog_pars_vertex:sf,fog_fragment:rf,fog_pars_fragment:of,gradientmap_pars_fragment:af,lightmap_pars_fragment:lf,lights_lambert_fragment:cf,lights_lambert_pars_fragment:hf,lights_pars_begin:uf,lights_toon_fragment:ff,lights_toon_pars_fragment:pf,lights_phong_fragment:mf,lights_phong_pars_fragment:gf,lights_physical_fragment:xf,lights_physical_pars_fragment:_f,lights_fragment_begin:yf,lights_fragment_maps:vf,lights_fragment_end:Mf,lightprobes_pars_fragment:bf,logdepthbuf_fragment:Sf,logdepthbuf_pars_fragment:wf,logdepthbuf_pars_vertex:Ef,logdepthbuf_vertex:Tf,map_fragment:Af,map_pars_fragment:Cf,map_particle_fragment:Rf,map_particle_pars_fragment:Pf,metalnessmap_fragment:If,metalnessmap_pars_fragment:Lf,morphinstance_vertex:Df,morphcolor_vertex:Nf,morphnormal_vertex:Uf,morphtarget_pars_vertex:Ff,morphtarget_vertex:Bf,normal_fragment_begin:Of,normal_fragment_maps:zf,normal_pars_fragment:kf,normal_pars_vertex:Hf,normal_vertex:Gf,normalmap_pars_fragment:Vf,clearcoat_normal_fragment_begin:Wf,clearcoat_normal_fragment_maps:Xf,clearcoat_pars_fragment:qf,iridescence_pars_fragment:Yf,opaque_fragment:$f,packing:Zf,premultiplied_alpha_fragment:Jf,project_vertex:Kf,dithering_fragment:Qf,dithering_pars_fragment:jf,roughnessmap_fragment:tp,roughnessmap_pars_fragment:ep,shadowmap_pars_fragment:ip,shadowmap_pars_vertex:np,shadowmap_vertex:sp,shadowmask_pars_fragment:rp,skinbase_vertex:op,skinning_pars_vertex:ap,skinning_vertex:lp,skinnormal_vertex:cp,specularmap_fragment:hp,specularmap_pars_fragment:up,tonemapping_fragment:dp,tonemapping_pars_fragment:fp,transmission_fragment:pp,transmission_pars_fragment:mp,uv_pars_fragment:gp,uv_pars_vertex:xp,uv_vertex:_p,worldpos_vertex:yp,background_vert:vp,background_frag:Mp,backgroundCube_vert:bp,backgroundCube_frag:Sp,cube_vert:wp,cube_frag:Ep,depth_vert:Tp,depth_frag:Ap,distance_vert:Cp,distance_frag:Rp,equirect_vert:Pp,equirect_frag:Ip,linedashed_vert:Lp,linedashed_frag:Dp,meshbasic_vert:Np,meshbasic_frag:Up,meshlambert_vert:Fp,meshlambert_frag:Bp,meshmatcap_vert:Op,meshmatcap_frag:zp,meshnormal_vert:kp,meshnormal_frag:Hp,meshphong_vert:Gp,meshphong_frag:Vp,meshphysical_vert:Wp,meshphysical_frag:Xp,meshtoon_vert:qp,meshtoon_frag:Yp,points_vert:$p,points_frag:Zp,shadow_vert:Jp,shadow_frag:Kp,sprite_vert:Qp,sprite_frag:jp},mt={common:{diffuse:{value:new yt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new kt},alphaMap:{value:null},alphaMapTransform:{value:new kt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new kt}},envmap:{envMap:{value:null},envMapRotation:{value:new kt},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new kt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new kt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new kt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new kt},normalScale:{value:new Wt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new kt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new kt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new kt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new kt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new yt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new O},probesMax:{value:new O},probesResolution:{value:new O}},points:{diffuse:{value:new yt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new kt},alphaTest:{value:0},uvTransform:{value:new kt}},sprite:{diffuse:{value:new yt(16777215)},opacity:{value:1},center:{value:new Wt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new kt},alphaMap:{value:null},alphaMapTransform:{value:new kt},alphaTest:{value:0}}},Vi={basic:{uniforms:Ye([mt.common,mt.specularmap,mt.envmap,mt.aomap,mt.lightmap,mt.fog]),vertexShader:qt.meshbasic_vert,fragmentShader:qt.meshbasic_frag},lambert:{uniforms:Ye([mt.common,mt.specularmap,mt.envmap,mt.aomap,mt.lightmap,mt.emissivemap,mt.bumpmap,mt.normalmap,mt.displacementmap,mt.fog,mt.lights,{emissive:{value:new yt(0)},envMapIntensity:{value:1}}]),vertexShader:qt.meshlambert_vert,fragmentShader:qt.meshlambert_frag},phong:{uniforms:Ye([mt.common,mt.specularmap,mt.envmap,mt.aomap,mt.lightmap,mt.emissivemap,mt.bumpmap,mt.normalmap,mt.displacementmap,mt.fog,mt.lights,{emissive:{value:new yt(0)},specular:{value:new yt(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:qt.meshphong_vert,fragmentShader:qt.meshphong_frag},standard:{uniforms:Ye([mt.common,mt.envmap,mt.aomap,mt.lightmap,mt.emissivemap,mt.bumpmap,mt.normalmap,mt.displacementmap,mt.roughnessmap,mt.metalnessmap,mt.fog,mt.lights,{emissive:{value:new yt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:qt.meshphysical_vert,fragmentShader:qt.meshphysical_frag},toon:{uniforms:Ye([mt.common,mt.aomap,mt.lightmap,mt.emissivemap,mt.bumpmap,mt.normalmap,mt.displacementmap,mt.gradientmap,mt.fog,mt.lights,{emissive:{value:new yt(0)}}]),vertexShader:qt.meshtoon_vert,fragmentShader:qt.meshtoon_frag},matcap:{uniforms:Ye([mt.common,mt.bumpmap,mt.normalmap,mt.displacementmap,mt.fog,{matcap:{value:null}}]),vertexShader:qt.meshmatcap_vert,fragmentShader:qt.meshmatcap_frag},points:{uniforms:Ye([mt.points,mt.fog]),vertexShader:qt.points_vert,fragmentShader:qt.points_frag},dashed:{uniforms:Ye([mt.common,mt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:qt.linedashed_vert,fragmentShader:qt.linedashed_frag},depth:{uniforms:Ye([mt.common,mt.displacementmap]),vertexShader:qt.depth_vert,fragmentShader:qt.depth_frag},normal:{uniforms:Ye([mt.common,mt.bumpmap,mt.normalmap,mt.displacementmap,{opacity:{value:1}}]),vertexShader:qt.meshnormal_vert,fragmentShader:qt.meshnormal_frag},sprite:{uniforms:Ye([mt.sprite,mt.fog]),vertexShader:qt.sprite_vert,fragmentShader:qt.sprite_frag},background:{uniforms:{uvTransform:{value:new kt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:qt.background_vert,fragmentShader:qt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new kt}},vertexShader:qt.backgroundCube_vert,fragmentShader:qt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:qt.cube_vert,fragmentShader:qt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:qt.equirect_vert,fragmentShader:qt.equirect_frag},distance:{uniforms:Ye([mt.common,mt.displacementmap,{referencePosition:{value:new O},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:qt.distance_vert,fragmentShader:qt.distance_frag},shadow:{uniforms:Ye([mt.lights,mt.fog,{color:{value:new yt(0)},opacity:{value:1}}]),vertexShader:qt.shadow_vert,fragmentShader:qt.shadow_frag}};Vi.physical={uniforms:Ye([Vi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new kt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new kt},clearcoatNormalScale:{value:new Wt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new kt},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new kt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new kt},sheen:{value:0},sheenColor:{value:new yt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new kt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new kt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new kt},transmissionSamplerSize:{value:new Wt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new kt},attenuationDistance:{value:0},attenuationColor:{value:new yt(0)},specularColor:{value:new yt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new kt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new kt},anisotropyVector:{value:new Wt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new kt}}]),vertexShader:qt.meshphysical_vert,fragmentShader:qt.meshphysical_frag};var ha={r:0,b:0,g:0},tm=new ie,cu=new kt;cu.set(-1,0,0,0,1,0,0,0,1);function em(s,t,e,i,n,r){let o=new yt(0),a=n===!0?0:1,l,c,h=null,d=0,u=null;function f(b){let T=b.isScene===!0?b.background:null;if(T&&T.isTexture){let y=b.backgroundBlurriness>0;T=t.get(T,y)}return T}function g(b){let T=!1,y=f(b);y===null?m(o,a):y&&y.isColor&&(m(y,1),T=!0);let v=s.xr.getEnvironmentBlendMode();v==="additive"?e.buffers.color.setClear(0,0,0,1,r):v==="alpha-blend"&&e.buffers.color.setClear(0,0,0,0,r),(s.autoClear||T)&&(e.buffers.depth.setTest(!0),e.buffers.depth.setMask(!0),e.buffers.color.setMask(!0),s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil))}function _(b,T){let y=f(T);y&&(y.isCubeTexture||y.mapping===Js)?(c===void 0&&(c=new Ct(new Jt(1,1,1),new Re({name:"BackgroundCubeMaterial",uniforms:zn(Vi.backgroundCube.uniforms),vertexShader:Vi.backgroundCube.vertexShader,fragmentShader:Vi.backgroundCube.fragmentShader,side:je,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(v,S,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(c)),c.material.uniforms.envMap.value=y,c.material.uniforms.backgroundBlurriness.value=T.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=T.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(tm.makeRotationFromEuler(T.backgroundRotation)).transpose(),y.isCubeTexture&&y.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(cu),c.material.toneMapped=Zt.getTransfer(y.colorSpace)!==oe,(h!==y||d!==y.version||u!==s.toneMapping)&&(c.material.needsUpdate=!0,h=y,d=y.version,u=s.toneMapping),c.layers.enableAll(),b.unshift(c,c.geometry,c.material,0,0,null)):y&&y.isTexture&&(l===void 0&&(l=new Ct(new Hs(2,2),new Re({name:"BackgroundMaterial",uniforms:zn(Vi.background.uniforms),vertexShader:Vi.background.vertexShader,fragmentShader:Vi.background.fragmentShader,side:zi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=y,l.material.uniforms.backgroundIntensity.value=T.backgroundIntensity,l.material.toneMapped=Zt.getTransfer(y.colorSpace)!==oe,y.matrixAutoUpdate===!0&&y.updateMatrix(),l.material.uniforms.uvTransform.value.copy(y.matrix),(h!==y||d!==y.version||u!==s.toneMapping)&&(l.material.needsUpdate=!0,h=y,d=y.version,u=s.toneMapping),l.layers.enableAll(),b.unshift(l,l.geometry,l.material,0,0,null))}function m(b,T){b.getRGB(ha,Fl(s)),e.buffers.color.setClear(ha.r,ha.g,ha.b,T,r)}function p(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return o},setClearColor:function(b,T=1){o.set(b),a=T,m(o,a)},getClearAlpha:function(){return a},setClearAlpha:function(b){a=b,m(o,a)},render:g,addToRenderList:_,dispose:p}}function im(s,t){let e=s.getParameter(s.MAX_VERTEX_ATTRIBS),i={},n=u(null),r=n,o=!1;function a(I,D,C,P,N){let q=!1,W=d(I,P,C,D);r!==W&&(r=W,c(r.object)),q=f(I,P,C,N),q&&g(I,P,C,N),N!==null&&t.update(N,s.ELEMENT_ARRAY_BUFFER),(q||o)&&(o=!1,y(I,D,C,P),N!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,t.get(N).buffer))}function l(){return s.createVertexArray()}function c(I){return s.bindVertexArray(I)}function h(I){return s.deleteVertexArray(I)}function d(I,D,C,P){let N=P.wireframe===!0,q=i[D.id];q===void 0&&(q={},i[D.id]=q);let W=I.isInstancedMesh===!0?I.id:0,tt=q[W];tt===void 0&&(tt={},q[W]=tt);let k=tt[C.id];k===void 0&&(k={},tt[C.id]=k);let X=k[N];return X===void 0&&(X=u(l()),k[N]=X),X}function u(I){let D=[],C=[],P=[];for(let N=0;N<e;N++)D[N]=0,C[N]=0,P[N]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:D,enabledAttributes:C,attributeDivisors:P,object:I,attributes:{},index:null}}function f(I,D,C,P){let N=r.attributes,q=D.attributes,W=0,tt=C.getAttributes();for(let k in tt)if(tt[k].location>=0){let H=N[k],rt=q[k];if(rt===void 0&&(k==="instanceMatrix"&&I.instanceMatrix&&(rt=I.instanceMatrix),k==="instanceColor"&&I.instanceColor&&(rt=I.instanceColor)),H===void 0||H.attribute!==rt||rt&&H.data!==rt.data)return!0;W++}return r.attributesNum!==W||r.index!==P}function g(I,D,C,P){let N={},q=D.attributes,W=0,tt=C.getAttributes();for(let k in tt)if(tt[k].location>=0){let H=q[k];H===void 0&&(k==="instanceMatrix"&&I.instanceMatrix&&(H=I.instanceMatrix),k==="instanceColor"&&I.instanceColor&&(H=I.instanceColor));let rt={};rt.attribute=H,H&&H.data&&(rt.data=H.data),N[k]=rt,W++}r.attributes=N,r.attributesNum=W,r.index=P}function _(){let I=r.newAttributes;for(let D=0,C=I.length;D<C;D++)I[D]=0}function m(I){p(I,0)}function p(I,D){let C=r.newAttributes,P=r.enabledAttributes,N=r.attributeDivisors;C[I]=1,P[I]===0&&(s.enableVertexAttribArray(I),P[I]=1),N[I]!==D&&(s.vertexAttribDivisor(I,D),N[I]=D)}function b(){let I=r.newAttributes,D=r.enabledAttributes;for(let C=0,P=D.length;C<P;C++)D[C]!==I[C]&&(s.disableVertexAttribArray(C),D[C]=0)}function T(I,D,C,P,N,q,W){W===!0?s.vertexAttribIPointer(I,D,C,N,q):s.vertexAttribPointer(I,D,C,P,N,q)}function y(I,D,C,P){_();let N=P.attributes,q=C.getAttributes(),W=D.defaultAttributeValues;for(let tt in q){let k=q[tt];if(k.location>=0){let X=N[tt];if(X===void 0&&(tt==="instanceMatrix"&&I.instanceMatrix&&(X=I.instanceMatrix),tt==="instanceColor"&&I.instanceColor&&(X=I.instanceColor)),X!==void 0){let H=X.normalized,rt=X.itemSize,lt=t.get(X);if(lt===void 0)continue;let Ht=lt.buffer,Bt=lt.type,zt=lt.bytesPerElement,Z=Bt===s.INT||Bt===s.UNSIGNED_INT||X.gpuType===Eo;if(X.isInterleavedBufferAttribute){let Q=X.data,at=Q.stride,wt=X.offset;if(Q.isInstancedInterleavedBuffer){for(let st=0;st<k.locationSize;st++)p(k.location+st,Q.meshPerAttribute);I.isInstancedMesh!==!0&&P._maxInstanceCount===void 0&&(P._maxInstanceCount=Q.meshPerAttribute*Q.count)}else for(let st=0;st<k.locationSize;st++)m(k.location+st);s.bindBuffer(s.ARRAY_BUFFER,Ht);for(let st=0;st<k.locationSize;st++)T(k.location+st,rt/k.locationSize,Bt,H,at*zt,(wt+rt/k.locationSize*st)*zt,Z)}else{if(X.isInstancedBufferAttribute){for(let Q=0;Q<k.locationSize;Q++)p(k.location+Q,X.meshPerAttribute);I.isInstancedMesh!==!0&&P._maxInstanceCount===void 0&&(P._maxInstanceCount=X.meshPerAttribute*X.count)}else for(let Q=0;Q<k.locationSize;Q++)m(k.location+Q);s.bindBuffer(s.ARRAY_BUFFER,Ht);for(let Q=0;Q<k.locationSize;Q++)T(k.location+Q,rt/k.locationSize,Bt,H,rt*zt,rt/k.locationSize*Q*zt,Z)}}else if(W!==void 0){let H=W[tt];if(H!==void 0)switch(H.length){case 2:s.vertexAttrib2fv(k.location,H);break;case 3:s.vertexAttrib3fv(k.location,H);break;case 4:s.vertexAttrib4fv(k.location,H);break;default:s.vertexAttrib1fv(k.location,H)}}}}b()}function v(){E();for(let I in i){let D=i[I];for(let C in D){let P=D[C];for(let N in P){let q=P[N];for(let W in q)h(q[W].object),delete q[W];delete P[N]}}delete i[I]}}function S(I){if(i[I.id]===void 0)return;let D=i[I.id];for(let C in D){let P=D[C];for(let N in P){let q=P[N];for(let W in q)h(q[W].object),delete q[W];delete P[N]}}delete i[I.id]}function A(I){for(let D in i){let C=i[D];for(let P in C){let N=C[P];if(N[I.id]===void 0)continue;let q=N[I.id];for(let W in q)h(q[W].object),delete q[W];delete N[I.id]}}}function x(I){for(let D in i){let C=i[D],P=I.isInstancedMesh===!0?I.id:0,N=C[P];if(N!==void 0){for(let q in N){let W=N[q];for(let tt in W)h(W[tt].object),delete W[tt];delete N[q]}delete C[P],Object.keys(C).length===0&&delete i[D]}}}function E(){R(),o=!0,r!==n&&(r=n,c(r.object))}function R(){n.geometry=null,n.program=null,n.wireframe=!1}return{setup:a,reset:E,resetDefaultState:R,dispose:v,releaseStatesOfGeometry:S,releaseStatesOfObject:x,releaseStatesOfProgram:A,initAttributes:_,enableAttribute:m,disableUnusedAttributes:b}}function nm(s,t,e){let i;function n(l){i=l}function r(l,c){s.drawArrays(i,l,c),e.update(c,i,1)}function o(l,c,h){h!==0&&(s.drawArraysInstanced(i,l,c,h),e.update(c,i,h))}function a(l,c,h){if(h===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,l,0,c,0,h);let u=0;for(let f=0;f<h;f++)u+=c[f];e.update(u,i,1)}this.setMode=n,this.render=r,this.renderInstances=o,this.renderMultiDraw=a}function sm(s,t,e,i){let n;function r(){if(n!==void 0)return n;if(t.has("EXT_texture_filter_anisotropic")===!0){let A=t.get("EXT_texture_filter_anisotropic");n=s.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else n=0;return n}function o(A){return!(A!==oi&&i.convert(A)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(A){let x=A===Ai&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(A!==ri&&A!==gi&&!x&&i.convert(A)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE))}function l(A){if(A==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp",h=l(c);h!==c&&(Dt("WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let d=e.logarithmicDepthBuffer===!0,u=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control");e.reversedDepthBuffer===!0&&u===!1&&Dt("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let f=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),g=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=s.getParameter(s.MAX_TEXTURE_SIZE),m=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),p=s.getParameter(s.MAX_VERTEX_ATTRIBS),b=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),T=s.getParameter(s.MAX_VARYING_VECTORS),y=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),v=s.getParameter(s.MAX_SAMPLES),S=s.getParameter(s.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:d,reversedDepthBuffer:u,maxTextures:f,maxVertexTextures:g,maxTextureSize:_,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:b,maxVaryings:T,maxFragmentUniforms:y,maxSamples:v,samples:S}}function rm(s){let t=this,e=null,i=0,n=!1,r=!1,o=new bi,a=new kt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(d,u){let f=d.length!==0||u||i!==0||n;return n=u,i=d.length,f},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(d,u){e=h(d,u,0)},this.setState=function(d,u,f){let g=d.clippingPlanes,_=d.clipIntersection,m=d.clipShadows,p=s.get(d);if(!n||g===null||g.length===0||r&&!m)r?h(null):c();else{let b=r?0:i,T=b*4,y=p.clippingState||null;l.value=y,y=h(g,u,T,f);for(let v=0;v!==T;++v)y[v]=e[v];p.clippingState=y,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=b}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=i>0),t.numPlanes=i,t.numIntersection=0}function h(d,u,f,g){let _=d!==null?d.length:0,m=null;if(_!==0){if(m=l.value,g!==!0||m===null){let p=f+_*4,b=u.matrixWorldInverse;a.getNormalMatrix(b),(m===null||m.length<p)&&(m=new Float32Array(p));for(let T=0,y=f;T!==_;++T,y+=4)o.copy(d[T]).applyMatrix4(b,a),o.normal.toArray(m,y),m[y+3]=o.constant}l.value=m,l.needsUpdate=!0}return t.numPlanes=_,t.numIntersection=0,m}}var gs=4,om=6,am=20,lm=256,or=new us,Hh=new yt,Xl=null,ql=0,Yl=0,$l=!1,cm=new O,kn=new O,da=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(t,e=0,i=.1,n=100,r={}){let{size:o=256,position:a=cm}=r;Xl=this._renderer.getRenderTarget(),ql=this._renderer.getActiveCubeFace(),Yl=this._renderer.getActiveMipmapLevel(),$l=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(t,i,n,l,a),e>0&&this._blur(l,0,0,e),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Wh(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Vh(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodMeshes.length;t++)this._lodMeshes[t].geometry.dispose()}_cleanup(t){this._renderer.setRenderTarget(Xl,ql,Yl),this._renderer.xr.enabled=$l,t.scissorTest=!1,ms(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===yn||t.mapping===On?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),Xl=this._renderer.getRenderTarget(),ql=this._renderer.getActiveCubeFace(),Yl=this._renderer.getActiveMipmapLevel(),$l=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=e||this._allocateTargets();return this._textureToCubeUV(t,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,i={magFilter:Ce,minFilter:Ce,generateMipmaps:!1,type:Ai,format:oi,colorSpace:Ps,depthBuffer:!1},n=Gh(t,e,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Gh(t,e,i);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=hm(r)),this._blurMaterial=dm(r,t,e),this._ggxMaterial=um(r,t,e)}return n}_compileMaterial(t){let e=new Ct(new _e,t);this._renderer.compile(e,or)}_sceneToCubeUV(t,e,i,n,r){let l=new We(90,1,e,i),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],d=this._renderer,u=d.autoClear,f=d.toneMapping;d.getClearColor(Hh),d.toneMapping=Ei,d.autoClear=!1,d.state.buffers.depth.getReversed()&&(d.setRenderTarget(n),d.clearDepth(),d.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new Ct(new Jt,new Fe({name:"PMREM.Background",side:je,depthWrite:!1,depthTest:!1})));let _=this._backgroundBox,m=_.material,p=!1,b=t.background;b?b.isColor&&(m.color.copy(b),t.background=null,p=!0):(m.color.copy(Hh),p=!0);for(let T=0;T<6;T++){let y=T%3;y===0?(l.up.set(0,c[T],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+h[T],r.y,r.z)):y===1?(l.up.set(0,0,c[T]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+h[T],r.z)):(l.up.set(0,c[T],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+h[T]));let v=this._cubeSize;ms(n,y*v,T>2?v:0,v,v),d.setRenderTarget(n),p&&d.render(_,l),d.render(t,l)}d.toneMapping=f,d.autoClear=u,t.background=b}_textureToCubeUV(t,e){let i=this._renderer,n=t.mapping===yn||t.mapping===On;n?(this._cubemapMaterial===null&&(this._cubemapMaterial=Wh()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Vh());let r=n?this._cubemapMaterial:this._equirectMaterial,o=this._lodMeshes[0];o.material=r;let a=r.uniforms;a.envMap.value=t;let l=this._cubeSize;ms(e,0,0,3*l,2*l),i.setRenderTarget(e),i.render(o,or)}_applyPMREM(t){let e=this._renderer,i=e.autoClear;e.autoClear=!1;let n=this._lodMeshes.length;for(let r=1;r<n;r++)this._applyGGXFilter(t,r-1,r);e.autoClear=i}_applyGGXFilter(t,e,i){let n=this._renderer,r=this._pingPongRenderTarget,o=this._ggxMaterial,a=this._lodMeshes[i];a.material=o;let l=o.uniforms,c=i/(this._lodMeshes.length-1),h=e/(this._lodMeshes.length-1),d=Math.sqrt(c*c-h*h),u=c*1.25,f=d*u,{_lodMax:g}=this,_=this._sizeLods[i],m=3*_*(i>g-gs?i-g+gs:0),p=4*(this._cubeSize-_);l.envMap.value=t.texture,l.roughness.value=f,l.mipInt.value=g-e,ms(r,m,p,3*_,2*_),n.setRenderTarget(r),n.render(a,or),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=g-i,ms(t,m,p,3*_,2*_),n.setRenderTarget(t),n.render(a,or)}_blur(t,e,i,n){let r=this._pingPongRenderTarget,o=Math.min(n,Math.PI)/Math.SQRT2;this._blurPass(t,r,e,i,o),this._blurPass(r,t,i,i,o)}_blurPass(t,e,i,n,r){let o=this._renderer,a=this._blurMaterial,l=this._lodMeshes[n];l.material=a;let c=a.uniforms;c.envMap.value=t.texture,c.sigma.value=r,c.mipInt.value=this._lodMax-i;let h=this._sizeLods[n],d=3*h*(n>this._lodMax-gs?n-this._lodMax+gs:0),u=4*(this._cubeSize-h);ms(e,d,u,3*h,2*h),o.setRenderTarget(e),o.render(l,or)}};function hm(s){let t=[],e=[],i=s,n=s-gs+1+om;for(let r=0;r<n;r++){let o=Math.pow(2,i);t.push(o);let a=1/(o-2),l=-a,c=1+a,h=[l,l,c,l,c,c,l,l,c,c,l,c],d=6,u=6,f=3,g=new Float32Array(f*u*d),_=new Float32Array(f*u*d);for(let p=0;p<d;p++){let b=p%3*2/3-1,T=p>2?0:-1,y=[b,T,0,b+2/3,T,0,b+2/3,T+1,0,b,T,0,b+2/3,T+1,0,b,T+1,0];g.set(y,f*u*p);for(let v=0;v<u;v++){let S=h[v*2]*2-1,A=h[v*2+1]*2-1;p===0?kn.set(1,A,S):p===1?kn.set(-S,1,-A):p===2?kn.set(-S,A,1):p===3?kn.set(-1,A,-S):p===4?kn.set(-S,-1,A):kn.set(S,A,-1),kn.toArray(_,(p*u+v)*f)}}let m=new _e;m.setAttribute("position",new ee(g,f)),m.setAttribute("outputDirection",new ee(_,f)),e.push(new Ct(m,null)),i>gs&&i--}return{lodMeshes:e,sizeLods:t}}function Gh(s,t,e){let i=new si(s,t,e);return i.texture.mapping=Js,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function ms(s,t,e,i,n){s.viewport.set(t,e,i,n),s.scissor.set(t,e,i,n)}function um(s,t,e){return new Re({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:lm,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:ma(),fragmentShader:`

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
		`,blending:ki,depthTest:!1,depthWrite:!1})}function dm(s,t,e){return new Re({name:"SphericalGaussianBlur",defines:{SAMPLES:am,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:ma(),fragmentShader:`

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
		`,blending:ki,depthTest:!1,depthWrite:!1})}function Vh(){return new Re({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:ma(),fragmentShader:`

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
		`,blending:ki,depthTest:!1,depthWrite:!1})}function Wh(){return new Re({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:ma(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:ki,depthTest:!1,depthWrite:!1})}function ma(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var fa=class extends si{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let i={width:t,height:t,depth:1},n=[i,i,i,i,i,i];this.texture=new Os(n),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},n=new Jt(5,5,5),r=new Re({name:"CubemapFromEquirect",uniforms:zn(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:je,blending:ki});r.uniforms.tEquirect.value=e;let o=new Ct(n,r),a=e.minFilter;return e.minFilter===Hi&&(e.minFilter=Ce),new yo(1,10,this).update(t,o),e.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(t,e=!0,i=!0,n=!0){let r=t.getRenderTarget();for(let o=0;o<6;o++)t.setRenderTarget(this,o),t.clear(e,i,n);t.setRenderTarget(r)}};function fm(s){let t=new WeakMap,e=new WeakMap,i=null;function n(u,f=!1){return u==null?null:f?o(u):r(u)}function r(u){if(u&&u.isTexture){let f=u.mapping;if(f===bo||f===So)if(t.has(u)){let g=t.get(u).texture;return a(g,u.mapping)}else{let g=u.image;if(g&&g.height>0){let _=new fa(g.height);return _.fromEquirectangularTexture(s,u),t.set(u,_),u.addEventListener("dispose",c),a(_.texture,u.mapping)}else return null}}return u}function o(u){if(u&&u.isTexture){let f=u.mapping,g=f===bo||f===So,_=f===yn||f===On;if(g||_){let m=e.get(u),p=m!==void 0?m.texture.pmremVersion:0;if(u.isRenderTargetTexture&&u.pmremVersion!==p)return i===null&&(i=new da(s)),m=g?i.fromEquirectangular(u,m):i.fromCubemap(u,m),m.texture.pmremVersion=u.pmremVersion,e.set(u,m),m.texture;if(m!==void 0)return m.texture;{let b=u.image;return g&&b&&b.height>0||_&&b&&l(b)?(i===null&&(i=new da(s)),m=g?i.fromEquirectangular(u):i.fromCubemap(u),m.texture.pmremVersion=u.pmremVersion,e.set(u,m),u.addEventListener("dispose",h),m.texture):null}}}return u}function a(u,f){return f===bo?u.mapping=yn:f===So&&(u.mapping=On),u}function l(u){let f=0,g=6;for(let _=0;_<g;_++)u[_]!==void 0&&f++;return f===g}function c(u){let f=u.target;f.removeEventListener("dispose",c);let g=t.get(f);g!==void 0&&(t.delete(f),g.dispose())}function h(u){let f=u.target;f.removeEventListener("dispose",h);let g=e.get(f);g!==void 0&&(e.delete(f),g.dispose())}function d(){t=new WeakMap,e=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:n,dispose:d}}function pm(s){let t={};function e(i){if(t[i]!==void 0)return t[i];let n=s.getExtension(i);return t[i]=n,n}return{has:function(i){return e(i)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(i){let n=e(i);return n===null&&Rn("WebGLRenderer: "+i+" extension not supported."),n}}}function mm(s,t,e,i){let n={},r=new WeakMap;function o(d){let u=d.target;u.index!==null&&t.remove(u.index);for(let g in u.attributes)t.remove(u.attributes[g]);u.removeEventListener("dispose",o),delete n[u.id];let f=r.get(u);f&&(t.remove(f),r.delete(u)),i.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,e.memory.geometries--}function a(d,u){return n[u.id]===!0||(u.addEventListener("dispose",o),n[u.id]=!0,e.memory.geometries++),u}function l(d){let u=d.attributes;for(let f in u)t.update(u[f],s.ARRAY_BUFFER)}function c(d){let u=[],f=d.index,g=d.attributes.position,_=0;if(g===void 0)return;if(f!==null){let b=f.array;_=f.version;for(let T=0,y=b.length;T<y;T+=3){let v=b[T+0],S=b[T+1],A=b[T+2];u.push(v,S,S,A,A,v)}}else{let b=g.array;_=g.version;for(let T=0,y=b.length/3-1;T<y;T+=3){let v=T+0,S=T+1,A=T+2;u.push(v,S,S,A,A,v)}}let m=new(g.count>=65535?Fs:Us)(u,1);m.version=_;let p=r.get(d);p&&t.remove(p),r.set(d,m)}function h(d){let u=r.get(d);if(u){let f=d.index;f!==null&&u.version<f.version&&c(d)}else c(d);return r.get(d)}return{get:a,update:l,getWireframeAttribute:h}}function gm(s,t,e){let i;function n(d){i=d}let r,o;function a(d){r=d.type,o=d.bytesPerElement}function l(d,u){s.drawElements(i,u,r,d*o),e.update(u,i,1)}function c(d,u,f){f!==0&&(s.drawElementsInstanced(i,u,r,d*o,f),e.update(u,i,f))}function h(d,u,f){if(f===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,u,0,r,d,0,f);let _=0;for(let m=0;m<f;m++)_+=u[m];e.update(_,i,1)}this.setMode=n,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=h}function xm(s){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,o,a){switch(e.calls++,o){case s.TRIANGLES:e.triangles+=a*(r/3);break;case s.LINES:e.lines+=a*(r/2);break;case s.LINE_STRIP:e.lines+=a*(r-1);break;case s.LINE_LOOP:e.lines+=a*r;break;case s.POINTS:e.points+=a*r;break;default:Ft("WebGLInfo: Unknown draw mode:",o);break}}function n(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:n,update:i}}function _m(s,t,e){let i=new WeakMap,n=new xe;function r(o,a,l){let c=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,d=h!==void 0?h.length:0,u=i.get(a);if(u===void 0||u.count!==d){let E=function(){A.dispose(),i.delete(a),a.removeEventListener("dispose",E)};u!==void 0&&u.texture.dispose();let f=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,_=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],p=a.morphAttributes.normal||[],b=a.morphAttributes.color||[],T=0;f===!0&&(T=1),g===!0&&(T=2),_===!0&&(T=3);let y=a.attributes.position.count*T,v=1;y>t.maxTextureSize&&(v=Math.ceil(y/t.maxTextureSize),y=t.maxTextureSize);let S=new Float32Array(y*v*4*d),A=new Ds(S,y,v,d);A.type=gi,A.needsUpdate=!0;let x=T*4;for(let R=0;R<d;R++){let I=m[R],D=p[R],C=b[R],P=y*v*4*R;for(let N=0;N<I.count;N++){let q=N*x;f===!0&&(n.fromBufferAttribute(I,N),S[P+q+0]=n.x,S[P+q+1]=n.y,S[P+q+2]=n.z,S[P+q+3]=0),g===!0&&(n.fromBufferAttribute(D,N),S[P+q+4]=n.x,S[P+q+5]=n.y,S[P+q+6]=n.z,S[P+q+7]=0),_===!0&&(n.fromBufferAttribute(C,N),S[P+q+8]=n.x,S[P+q+9]=n.y,S[P+q+10]=n.z,S[P+q+11]=C.itemSize===4?n.w:1)}}u={count:d,texture:A,size:new Wt(y,v)},i.set(a,u),a.addEventListener("dispose",E)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(s,"morphTexture",o.morphTexture,e);else{let f=0;for(let _=0;_<c.length;_++)f+=c[_];let g=a.morphTargetsRelative?1:1-f;l.getUniforms().setValue(s,"morphTargetBaseInfluence",g),l.getUniforms().setValue(s,"morphTargetInfluences",c)}l.getUniforms().setValue(s,"morphTargetsTexture",u.texture,e),l.getUniforms().setValue(s,"morphTargetsTextureSize",u.size)}return{update:r}}function ym(s,t,e,i,n){let r=new WeakMap;function o(c){let h=n.render.frame,d=c.geometry,u=t.get(c,d);if(r.get(u)!==h&&(t.update(u),r.set(u,h)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==h&&(e.update(c.instanceMatrix,s.ARRAY_BUFFER),c.instanceColor!==null&&e.update(c.instanceColor,s.ARRAY_BUFFER),r.set(c,h))),c.isSkinnedMesh){let f=c.skeleton;r.get(f)!==h&&(f.update(),r.set(f,h))}return u}function a(){r=new WeakMap}function l(c){let h=c.target;h.removeEventListener("dispose",l),i.releaseStatesOfObject(h),e.remove(h.instanceMatrix),h.instanceColor!==null&&e.remove(h.instanceColor)}return{update:o,dispose:a}}var vm={[vl]:"LINEAR_TONE_MAPPING",[Ml]:"REINHARD_TONE_MAPPING",[bl]:"CINEON_TONE_MAPPING",[Sl]:"ACES_FILMIC_TONE_MAPPING",[El]:"AGX_TONE_MAPPING",[Tl]:"NEUTRAL_TONE_MAPPING",[wl]:"CUSTOM_TONE_MAPPING"};function Mm(s,t,e,i,n,r){let o=new si(t,e,{type:s,depthBuffer:n,stencilBuffer:r,samples:i?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),a=null,l=null,c=new _e;c.setAttribute("position",new fe([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new fe([0,2,0,0,2,0],2));let h=new so({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),d=new Ct(c,h),u=new us(-1,1,1,-1,0,1),f=null,g=null,_=!1,m,p=null,b=[],T=!1;this.setSize=function(y,v){o.setSize(y,v),a!==null&&a.setSize(y,v),l!==null&&l.setSize(y,v);for(let S=0;S<b.length;S++){let A=b[S];A.setSize&&A.setSize(y,v)}},this.setEffects=function(y){b=y,T=b.length>0&&b[0].isRenderPass===!0;let v=o.width,S=o.height;b.length>0&&a===null&&(a=new si(v,S,{type:Ai,depthBuffer:!1,stencilBuffer:!1}),l=new si(v,S,{type:Ai,depthBuffer:!1,stencilBuffer:!1}));for(let A=0;A<b.length;A++){let x=b[A];x.setSize&&x.setSize(v,S)}},this.begin=function(y,v){if(_||y.toneMapping===Ei&&b.length===0)return!1;if(p=v,v!==null){let S=v.width,A=v.height;(o.width!==S||o.height!==A)&&this.setSize(S,A)}return T===!1&&y.setRenderTarget(o),m=y.toneMapping,y.toneMapping=Ei,!0},this.hasRenderPass=function(){return T},this.end=function(y,v){y.toneMapping=m,_=!0;let S=o,A=a;for(let x=0;x<b.length;x++){let E=b[x];E.enabled!==!1&&(E.render(y,A,S,v),E.needsSwap!==!1&&(S=A,A=A===a?l:a))}if(f!==y.outputColorSpace||g!==y.toneMapping){f=y.outputColorSpace,g=y.toneMapping,h.defines={},Zt.getTransfer(f)===oe&&(h.defines.SRGB_TRANSFER="");let x=vm[g];x&&(h.defines[x]=""),h.needsUpdate=!0}h.uniforms.tDiffuse.value=S.texture,y.setRenderTarget(p),y.render(d,u),p=null,_=!1},this.isCompositing=function(){return _},this.dispose=function(){o.dispose(),a!==null&&a.dispose(),l!==null&&l.dispose(),c.dispose(),h.dispose()}}var hu=new Ke,Kl=new fn(1,1),uu=new Ds,du=new Kr,fu=new Os,Xh=[],qh=[],Yh=new Float32Array(16),$h=new Float32Array(9),Zh=new Float32Array(4);function _s(s,t,e){let i=s[0];if(i<=0||i>0)return s;let n=t*e,r=Xh[n];if(r===void 0&&(r=new Float32Array(n),Xh[n]=r),t!==0){i.toArray(r,0);for(let o=1,a=0;o!==t;++o)a+=e,s[o].toArray(r,a)}return r}function Pe(s,t){if(s.length!==t.length)return!1;for(let e=0,i=s.length;e<i;e++)if(s[e]!==t[e])return!1;return!0}function Ie(s,t){for(let e=0,i=t.length;e<i;e++)s[e]=t[e]}function ga(s,t){let e=qh[t];e===void 0&&(e=new Int32Array(t),qh[t]=e);for(let i=0;i!==t;++i)e[i]=s.allocateTextureUnit();return e}function bm(s,t){let e=this.cache;e[0]!==t&&(s.uniform1f(this.addr,t),e[0]=t)}function Sm(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Pe(e,t))return;s.uniform2fv(this.addr,t),Ie(e,t)}}function wm(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(s.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Pe(e,t))return;s.uniform3fv(this.addr,t),Ie(e,t)}}function Em(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Pe(e,t))return;s.uniform4fv(this.addr,t),Ie(e,t)}}function Tm(s,t){let e=this.cache,i=t.elements;if(i===void 0){if(Pe(e,t))return;s.uniformMatrix2fv(this.addr,!1,t),Ie(e,t)}else{if(Pe(e,i))return;Zh.set(i),s.uniformMatrix2fv(this.addr,!1,Zh),Ie(e,i)}}function Am(s,t){let e=this.cache,i=t.elements;if(i===void 0){if(Pe(e,t))return;s.uniformMatrix3fv(this.addr,!1,t),Ie(e,t)}else{if(Pe(e,i))return;$h.set(i),s.uniformMatrix3fv(this.addr,!1,$h),Ie(e,i)}}function Cm(s,t){let e=this.cache,i=t.elements;if(i===void 0){if(Pe(e,t))return;s.uniformMatrix4fv(this.addr,!1,t),Ie(e,t)}else{if(Pe(e,i))return;Yh.set(i),s.uniformMatrix4fv(this.addr,!1,Yh),Ie(e,i)}}function Rm(s,t){let e=this.cache;e[0]!==t&&(s.uniform1i(this.addr,t),e[0]=t)}function Pm(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Pe(e,t))return;s.uniform2iv(this.addr,t),Ie(e,t)}}function Im(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Pe(e,t))return;s.uniform3iv(this.addr,t),Ie(e,t)}}function Lm(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Pe(e,t))return;s.uniform4iv(this.addr,t),Ie(e,t)}}function Dm(s,t){let e=this.cache;e[0]!==t&&(s.uniform1ui(this.addr,t),e[0]=t)}function Nm(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Pe(e,t))return;s.uniform2uiv(this.addr,t),Ie(e,t)}}function Um(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Pe(e,t))return;s.uniform3uiv(this.addr,t),Ie(e,t)}}function Fm(s,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Pe(e,t))return;s.uniform4uiv(this.addr,t),Ie(e,t)}}function Bm(s,t,e){let i=this.cache,n=e.allocateTextureUnit();i[0]!==n&&(s.uniform1i(this.addr,n),i[0]=n);let r;this.type===s.SAMPLER_2D_SHADOW?(Kl.compareFunction=e.isReversedDepthBuffer()?ca:la,r=Kl):r=hu,e.setTexture2D(t||r,n)}function Om(s,t,e){let i=this.cache,n=e.allocateTextureUnit();i[0]!==n&&(s.uniform1i(this.addr,n),i[0]=n),e.setTexture3D(t||du,n)}function zm(s,t,e){let i=this.cache,n=e.allocateTextureUnit();i[0]!==n&&(s.uniform1i(this.addr,n),i[0]=n),e.setTextureCube(t||fu,n)}function km(s,t,e){let i=this.cache,n=e.allocateTextureUnit();i[0]!==n&&(s.uniform1i(this.addr,n),i[0]=n),e.setTexture2DArray(t||uu,n)}function Hm(s){switch(s){case 5126:return bm;case 35664:return Sm;case 35665:return wm;case 35666:return Em;case 35674:return Tm;case 35675:return Am;case 35676:return Cm;case 5124:case 35670:return Rm;case 35667:case 35671:return Pm;case 35668:case 35672:return Im;case 35669:case 35673:return Lm;case 5125:return Dm;case 36294:return Nm;case 36295:return Um;case 36296:return Fm;case 35678:case 36198:case 36298:case 36306:case 35682:return Bm;case 35679:case 36299:case 36307:return Om;case 35680:case 36300:case 36308:case 36293:return zm;case 36289:case 36303:case 36311:case 36292:return km}}function Gm(s,t){s.uniform1fv(this.addr,t)}function Vm(s,t){let e=_s(t,this.size,2);s.uniform2fv(this.addr,e)}function Wm(s,t){let e=_s(t,this.size,3);s.uniform3fv(this.addr,e)}function Xm(s,t){let e=_s(t,this.size,4);s.uniform4fv(this.addr,e)}function qm(s,t){let e=_s(t,this.size,4);s.uniformMatrix2fv(this.addr,!1,e)}function Ym(s,t){let e=_s(t,this.size,9);s.uniformMatrix3fv(this.addr,!1,e)}function $m(s,t){let e=_s(t,this.size,16);s.uniformMatrix4fv(this.addr,!1,e)}function Zm(s,t){s.uniform1iv(this.addr,t)}function Jm(s,t){s.uniform2iv(this.addr,t)}function Km(s,t){s.uniform3iv(this.addr,t)}function Qm(s,t){s.uniform4iv(this.addr,t)}function jm(s,t){s.uniform1uiv(this.addr,t)}function t0(s,t){s.uniform2uiv(this.addr,t)}function e0(s,t){s.uniform3uiv(this.addr,t)}function i0(s,t){s.uniform4uiv(this.addr,t)}function n0(s,t,e){let i=this.cache,n=t.length,r=ga(e,n);Pe(i,r)||(s.uniform1iv(this.addr,r),Ie(i,r));let o;this.type===s.SAMPLER_2D_SHADOW?o=Kl:o=hu;for(let a=0;a!==n;++a)e.setTexture2D(t[a]||o,r[a])}function s0(s,t,e){let i=this.cache,n=t.length,r=ga(e,n);Pe(i,r)||(s.uniform1iv(this.addr,r),Ie(i,r));for(let o=0;o!==n;++o)e.setTexture3D(t[o]||du,r[o])}function r0(s,t,e){let i=this.cache,n=t.length,r=ga(e,n);Pe(i,r)||(s.uniform1iv(this.addr,r),Ie(i,r));for(let o=0;o!==n;++o)e.setTextureCube(t[o]||fu,r[o])}function o0(s,t,e){let i=this.cache,n=t.length,r=ga(e,n);Pe(i,r)||(s.uniform1iv(this.addr,r),Ie(i,r));for(let o=0;o!==n;++o)e.setTexture2DArray(t[o]||uu,r[o])}function a0(s){switch(s){case 5126:return Gm;case 35664:return Vm;case 35665:return Wm;case 35666:return Xm;case 35674:return qm;case 35675:return Ym;case 35676:return $m;case 5124:case 35670:return Zm;case 35667:case 35671:return Jm;case 35668:case 35672:return Km;case 35669:case 35673:return Qm;case 5125:return jm;case 36294:return t0;case 36295:return e0;case 36296:return i0;case 35678:case 36198:case 36298:case 36306:case 35682:return n0;case 35679:case 36299:case 36307:return s0;case 35680:case 36300:case 36308:case 36293:return r0;case 36289:case 36303:case 36311:case 36292:return o0}}var Ql=class{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.setValue=Hm(e.type)}},jl=class{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=a0(e.type)}},tc=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,i){let n=this.seq;for(let r=0,o=n.length;r!==o;++r){let a=n[r];a.setValue(t,e[a.id],i)}}},Zl=/(\w+)(\])?(\[|\.)?/g;function Jh(s,t){s.seq.push(t),s.map[t.id]=t}function l0(s,t,e){let i=s.name,n=i.length;for(Zl.lastIndex=0;;){let r=Zl.exec(i),o=Zl.lastIndex,a=r[1],l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===n){Jh(e,c===void 0?new Ql(a,s,t):new jl(a,s,t));break}else{let d=e.map[a];d===void 0&&(d=new tc(a),Jh(e,d)),e=d}}}var xs=class{constructor(t,e){this.seq=[],this.map={};let i=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let o=0;o<i;++o){let a=t.getActiveUniform(e,o),l=t.getUniformLocation(e,a.name);l0(a,l,this)}let n=[],r=[];for(let o of this.seq)o.type===t.SAMPLER_2D_SHADOW||o.type===t.SAMPLER_CUBE_SHADOW||o.type===t.SAMPLER_2D_ARRAY_SHADOW?n.push(o):r.push(o);n.length>0&&(this.seq=n.concat(r))}setValue(t,e,i,n){let r=this.map[e];r!==void 0&&r.setValue(t,i,n)}setOptional(t,e,i){let n=e[i];n!==void 0&&this.setValue(t,i,n)}static upload(t,e,i,n){for(let r=0,o=e.length;r!==o;++r){let a=e[r],l=i[a.id];l.needsUpdate!==!1&&a.setValue(t,l.value,n)}}static seqWithValue(t,e){let i=[];for(let n=0,r=t.length;n!==r;++n){let o=t[n];o.id in e&&i.push(o)}return i}};function Kh(s,t,e){let i=s.createShader(t);return s.shaderSource(i,e),s.compileShader(i),i}var c0=37297,h0=0;function u0(s,t){let e=s.split(`
`),i=[],n=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let o=n;o<r;o++){let a=o+1;i.push(`${a===t?">":" "} ${a}: ${e[o]}`)}return i.join(`
`)}var Qh=new kt;function d0(s){Zt._getMatrix(Qh,Zt.workingColorSpace,s);let t=`mat3( ${Qh.elements.map(e=>e.toFixed(4))} )`;switch(Zt.getTransfer(s)){case Is:return[t,"LinearTransferOETF"];case oe:return[t,"sRGBTransferOETF"];default:return Dt("WebGLProgram: Unsupported color space: ",s),[t,"LinearTransferOETF"]}}function jh(s,t,e){let i=s.getShaderParameter(t,s.COMPILE_STATUS),r=(s.getShaderInfoLog(t)||"").trim();if(i&&r==="")return"";let o=/ERROR: 0:(\d+)/.exec(r);if(o){let a=parseInt(o[1]);return e.toUpperCase()+`

`+r+`

`+u0(s.getShaderSource(t),a)}else return r}function f0(s,t){let e=d0(t);return[`vec4 ${s}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}var p0={[vl]:"Linear",[Ml]:"Reinhard",[bl]:"Cineon",[Sl]:"ACESFilmic",[El]:"AgX",[Tl]:"Neutral",[wl]:"Custom"};function m0(s,t){let e=p0[t];return e===void 0?(Dt("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+s+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+s+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}var ua=new O;function g0(){Zt.getLuminanceCoefficients(ua);let s=ua.x.toFixed(4),t=ua.y.toFixed(4),e=ua.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${s}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function x0(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(lr).join(`
`)}function _0(s){let t=[];for(let e in s){let i=s[e];i!==!1&&t.push("#define "+e+" "+i)}return t.join(`
`)}function y0(s,t){let e={},i=s.getProgramParameter(t,s.ACTIVE_ATTRIBUTES);for(let n=0;n<i;n++){let r=s.getActiveAttrib(t,n),o=r.name,a=1;r.type===s.FLOAT_MAT2&&(a=2),r.type===s.FLOAT_MAT3&&(a=3),r.type===s.FLOAT_MAT4&&(a=4),e[o]={type:r.type,location:s.getAttribLocation(t,o),locationSize:a}}return e}function lr(s){return s!==""}function tu(s,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return s.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function eu(s,t){return s.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var v0=/^[ \t]*#include +<([\w\d./]+)>/gm;function ec(s){return s.replace(v0,b0)}var M0=new Map;function b0(s,t){let e=qt[t];if(e===void 0){let i=M0.get(t);if(i!==void 0)e=qt[i],Dt('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,i);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">")}return ec(e)}var S0=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function iu(s){return s.replace(S0,w0)}function w0(s,t,e,i){let n="";for(let r=parseInt(t);r<parseInt(e);r++)n+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return n}function nu(s){let t=`precision ${s.precision} float;
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
#define LOW_PRECISION`),t}var E0={[Fn]:"SHADOWMAP_TYPE_PCF",[ds]:"SHADOWMAP_TYPE_VSM"};function T0(s){return E0[s.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var A0={[yn]:"ENVMAP_TYPE_CUBE",[On]:"ENVMAP_TYPE_CUBE",[Js]:"ENVMAP_TYPE_CUBE_UV"};function C0(s){return s.envMap===!1?"ENVMAP_TYPE_CUBE":A0[s.envMapMode]||"ENVMAP_TYPE_CUBE"}var R0={[On]:"ENVMAP_MODE_REFRACTION"};function P0(s){return s.envMap===!1?"ENVMAP_MODE_REFLECTION":R0[s.envMapMode]||"ENVMAP_MODE_REFLECTION"}var I0={[Zs]:"ENVMAP_BLENDING_MULTIPLY",[vh]:"ENVMAP_BLENDING_MIX",[Mh]:"ENVMAP_BLENDING_ADD"};function L0(s){return s.envMap===!1?"ENVMAP_BLENDING_NONE":I0[s.combine]||"ENVMAP_BLENDING_NONE"}function D0(s){let t=s.envMapCubeUVHeight;if(t===null)return null;let e=Math.log2(t)-2,i=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:i,maxMip:e}}function N0(s,t,e,i){let n=s.getContext(),r=e.defines,o=e.vertexShader,a=e.fragmentShader,l=T0(e),c=C0(e),h=P0(e),d=L0(e),u=D0(e),f=x0(e),g=_0(r),_=n.createProgram(),m,p,b=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(lr).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(lr).join(`
`),p.length>0&&(p+=`
`)):(m=[nu(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexNormals?"#define HAS_NORMAL":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(lr).join(`
`),p=[nu(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+h:"",e.envMap?"#define "+d:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.retroreflection?"#define USE_RETROREFLECTION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas||e.batchingColor?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==Ei?"#define TONE_MAPPING":"",e.toneMapping!==Ei?qt.tonemapping_pars_fragment:"",e.toneMapping!==Ei?m0("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",qt.colorspace_pars_fragment,f0("linearToOutputTexel",e.outputColorSpace),g0(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(lr).join(`
`)),o=ec(o),o=tu(o,e),o=eu(o,e),a=ec(a),a=tu(a,e),a=eu(a,e),o=iu(o),a=iu(a),e.isRawShaderMaterial!==!0&&(b=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",e.glslVersion===Nl?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===Nl?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);let T=b+m+o,y=b+p+a,v=Kh(n,n.VERTEX_SHADER,T),S=Kh(n,n.FRAGMENT_SHADER,y);n.attachShader(_,v),n.attachShader(_,S),e.index0AttributeName!==void 0?n.bindAttribLocation(_,0,e.index0AttributeName):e.hasPositionAttribute===!0&&n.bindAttribLocation(_,0,"position"),n.linkProgram(_);function A(I){if(s.debug.checkShaderErrors){let D=n.getProgramInfoLog(_)||"",C=n.getShaderInfoLog(v)||"",P=n.getShaderInfoLog(S)||"",N=D.trim(),q=C.trim(),W=P.trim(),tt=!0,k=!0;if(n.getProgramParameter(_,n.LINK_STATUS)===!1)if(tt=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(n,_,v,S);else{let X=jh(n,v,"vertex"),H=jh(n,S,"fragment");Ft("WebGLProgram: Shader Error "+n.getError()+" - VALIDATE_STATUS "+n.getProgramParameter(_,n.VALIDATE_STATUS)+`

Material Name: `+I.name+`
Material Type: `+I.type+`

Program Info Log: `+N+`
`+X+`
`+H)}else N!==""?Dt("WebGLProgram: Program Info Log:",N):(q===""||W==="")&&(k=!1);k&&(I.diagnostics={runnable:tt,programLog:N,vertexShader:{log:q,prefix:m},fragmentShader:{log:W,prefix:p}})}n.deleteShader(v),n.deleteShader(S),x=new xs(n,_),E=y0(n,_)}let x;this.getUniforms=function(){return x===void 0&&A(this),x};let E;this.getAttributes=function(){return E===void 0&&A(this),E};let R=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return R===!1&&(R=n.getProgramParameter(_,c0)),R},this.destroy=function(){i.releaseStatesOfProgram(this),n.deleteProgram(_),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=h0++,this.cacheKey=t,this.usedTimes=1,this.program=_,this.vertexShader=v,this.fragmentShader=S,this}var U0=0,ic=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,e,i){let n=this._getShaderCacheForMaterial(t);return n.has(e)===!1&&(n.add(e),e.usedTimes++),n.has(i)===!1&&(n.add(i),i.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let i of e)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,i=e.get(t);return i===void 0&&(i=new Set,e.set(t,i)),i}_getShaderStage(t){let e=this.shaderCache,i=e.get(t);return i===void 0&&(i=new nc(t),e.set(t,i)),i}},nc=class{constructor(t){this.id=U0++,this.code=t,this.usedTimes=0}};function F0(s){return s===Mn||s===ir||s===nr}function B0(s,t,e,i,n,r){let o=new ls,a=new ic,l=new Set,c=[],h=new Map,d=i.logarithmicDepthBuffer,u=i.precision,f={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(x){return l.add(x),x===0?"uv":`uv${x}`}function _(x,E,R,I,D,C){let P=I.fog,N=D.geometry,q=x.isMeshStandardMaterial||x.isMeshLambertMaterial||x.isMeshPhongMaterial?I.environment:null,W=x.isMeshStandardMaterial||x.isMeshLambertMaterial&&!x.envMap||x.isMeshPhongMaterial&&!x.envMap,tt=t.get(x.envMap||q,W),k=tt&&tt.mapping===Js?tt.image.height:null,X=f[x.type];x.precision!==null&&(u=i.getMaxPrecision(x.precision),u!==x.precision&&Dt("WebGLProgram.getParameters:",x.precision,"not supported, using",u,"instead."));let H=N.morphAttributes.position||N.morphAttributes.normal||N.morphAttributes.color,rt=H!==void 0?H.length:0,lt=0;N.morphAttributes.position!==void 0&&(lt=1),N.morphAttributes.normal!==void 0&&(lt=2),N.morphAttributes.color!==void 0&&(lt=3);let Ht,Bt,zt,Z;if(X){let ue=Vi[X];Ht=ue.vertexShader,Bt=ue.fragmentShader}else{Ht=x.vertexShader,Bt=x.fragmentShader;let ue=a.getVertexShaderStage(x),se=a.getFragmentShaderStage(x);a.update(x,ue,se),zt=ue.id,Z=se.id}let Q=s.getRenderTarget(),at=s.state.buffers.depth.getReversed(),wt=D.isInstancedMesh===!0,st=D.isBatchedMesh===!0,Tt=!!x.map,Yt=!!x.matcap,Ut=!!tt,Ot=!!x.aoMap,jt=!!x.lightMap,Gt=!!x.bumpMap&&x.wireframe===!1,le=!!x.normalMap,Me=!!x.displacementMap,ii=!!x.emissiveMap,ye=!!x.metalnessMap,we=!!x.roughnessMap,B=x.anisotropy>0,ke=x.clearcoat>0,ae=x.dispersion>0,L=x.retroreflectivity>0,M=x.iridescence>0,z=x.sheen>0,Y=x.transmission>0,K=B&&!!x.anisotropyMap,ot=ke&&!!x.clearcoatMap,ct=ke&&!!x.clearcoatNormalMap,j=ke&&!!x.clearcoatRoughnessMap,it=M&&!!x.iridescenceMap,ht=M&&!!x.iridescenceThicknessMap,Rt=z&&!!x.sheenColorMap,pt=z&&!!x.sheenRoughnessMap,ut=!!x.specularMap,Pt=!!x.specularColorMap,Lt=!!x.specularIntensityMap,Vt=Y&&!!x.transmissionMap,F=Y&&!!x.thicknessMap,dt=!!x.gradientMap,et=!!x.alphaMap,ft=x.alphaTest>0,_t=!!x.alphaHash,nt=!!x.extensions,It=Ei;x.toneMapped&&(Q===null||Q.isXRRenderTarget===!0)&&(It=s.toneMapping);let Et={shaderID:X,shaderType:x.type,shaderName:x.name,vertexShader:Ht,fragmentShader:Bt,defines:x.defines,customVertexShaderID:zt,customFragmentShaderID:Z,isRawShaderMaterial:x.isRawShaderMaterial===!0,glslVersion:x.glslVersion,precision:u,batching:st,batchingColor:st&&D._colorsTexture!==null,instancing:wt,instancingColor:wt&&D.instanceColor!==null,instancingMorph:wt&&D.morphTexture!==null,outputColorSpace:Q===null?s.outputColorSpace:Q.isXRRenderTarget===!0?Q.texture.colorSpace:Zt.workingColorSpace,alphaToCoverage:!!x.alphaToCoverage,map:Tt,matcap:Yt,envMap:Ut,envMapMode:Ut&&tt.mapping,envMapCubeUVHeight:k,aoMap:Ot,lightMap:jt,bumpMap:Gt,normalMap:le,displacementMap:Me,emissiveMap:ii,normalMapObjectSpace:le&&x.normalMapType===wh,normalMapTangentSpace:le&&x.normalMapType===sr,packedNormalMap:le&&x.normalMapType===sr&&F0(x.normalMap.format),metalnessMap:ye,roughnessMap:we,anisotropy:B,anisotropyMap:K,clearcoat:ke,clearcoatMap:ot,clearcoatNormalMap:ct,clearcoatRoughnessMap:j,dispersion:ae,retroreflection:L,iridescence:M,iridescenceMap:it,iridescenceThicknessMap:ht,sheen:z,sheenColorMap:Rt,sheenRoughnessMap:pt,specularMap:ut,specularColorMap:Pt,specularIntensityMap:Lt,transmission:Y,transmissionMap:Vt,thicknessMap:F,gradientMap:dt,opaque:x.transparent===!1&&x.blending===_n&&x.alphaToCoverage===!1,alphaMap:et,alphaTest:ft,alphaHash:_t,combine:x.combine,mapUv:Tt&&g(x.map.channel),aoMapUv:Ot&&g(x.aoMap.channel),lightMapUv:jt&&g(x.lightMap.channel),bumpMapUv:Gt&&g(x.bumpMap.channel),normalMapUv:le&&g(x.normalMap.channel),displacementMapUv:Me&&g(x.displacementMap.channel),emissiveMapUv:ii&&g(x.emissiveMap.channel),metalnessMapUv:ye&&g(x.metalnessMap.channel),roughnessMapUv:we&&g(x.roughnessMap.channel),anisotropyMapUv:K&&g(x.anisotropyMap.channel),clearcoatMapUv:ot&&g(x.clearcoatMap.channel),clearcoatNormalMapUv:ct&&g(x.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:j&&g(x.clearcoatRoughnessMap.channel),iridescenceMapUv:it&&g(x.iridescenceMap.channel),iridescenceThicknessMapUv:ht&&g(x.iridescenceThicknessMap.channel),sheenColorMapUv:Rt&&g(x.sheenColorMap.channel),sheenRoughnessMapUv:pt&&g(x.sheenRoughnessMap.channel),specularMapUv:ut&&g(x.specularMap.channel),specularColorMapUv:Pt&&g(x.specularColorMap.channel),specularIntensityMapUv:Lt&&g(x.specularIntensityMap.channel),transmissionMapUv:Vt&&g(x.transmissionMap.channel),thicknessMapUv:F&&g(x.thicknessMap.channel),alphaMapUv:et&&g(x.alphaMap.channel),vertexTangents:!!N.attributes.tangent&&(le||B),vertexNormals:!!N.attributes.normal,vertexColors:x.vertexColors,vertexAlphas:x.vertexColors===!0&&!!N.attributes.color&&N.attributes.color.itemSize===4,pointsUvs:D.isPoints===!0&&!!N.attributes.uv&&(Tt||et),fog:!!P,useFog:x.fog===!0,fogExp2:!!P&&P.isFogExp2,flatShading:x.wireframe===!1&&(x.flatShading===!0||N.attributes.normal===void 0&&le===!1&&(x.isMeshLambertMaterial||x.isMeshPhongMaterial||x.isMeshStandardMaterial||x.isMeshPhysicalMaterial)),sizeAttenuation:x.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:at,skinning:D.isSkinnedMesh===!0,hasPositionAttribute:N.attributes.position!==void 0,morphTargets:N.morphAttributes.position!==void 0,morphNormals:N.morphAttributes.normal!==void 0,morphColors:N.morphAttributes.color!==void 0,morphTargetsCount:rt,morphTextureStride:lt,numSunLights:E.sun.length,numDirLights:E.directional.length,numPointLights:E.point.length,numSpotLights:E.spot.length,numSpotLightMaps:E.spotLightMap.length,numRectAreaLights:E.rectArea.length,numHemiLights:E.hemi.length,numSunLightShadows:E.sunShadowMap.length,numDirLightShadows:E.directionalShadowMap.length,numPointLightShadows:E.pointShadowMap.length,numSpotLightShadows:E.spotShadowMap.length,numSpotLightShadowsWithMaps:E.numSpotLightShadowsWithMaps,numLightProbes:E.numLightProbes,numLightProbeGrids:C.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:x.dithering,shadowMapEnabled:s.shadowMap.enabled&&R.length>0,shadowMapType:s.shadowMap.type,toneMapping:It,decodeVideoTexture:Tt&&x.map.isVideoTexture===!0&&Zt.getTransfer(x.map.colorSpace)===oe,decodeVideoTextureEmissive:ii&&x.emissiveMap.isVideoTexture===!0&&Zt.getTransfer(x.emissiveMap.colorSpace)===oe,premultipliedAlpha:x.premultipliedAlpha,doubleSided:x.side===qe,flipSided:x.side===je,useDepthPacking:x.depthPacking>=0,depthPacking:x.depthPacking||0,index0AttributeName:x.index0AttributeName,extensionClipCullDistance:nt&&x.extensions.clipCullDistance===!0&&e.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(nt&&x.extensions.multiDraw===!0||st)&&e.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:e.has("KHR_parallel_shader_compile"),customProgramCacheKey:x.customProgramCacheKey()};return Et.vertexUv1s=l.has(1),Et.vertexUv2s=l.has(2),Et.vertexUv3s=l.has(3),l.clear(),Et}function m(x){let E=[];if(x.shaderID?E.push(x.shaderID):(E.push(x.customVertexShaderID),E.push(x.customFragmentShaderID)),x.defines!==void 0)for(let R in x.defines)E.push(R),E.push(x.defines[R]);return x.isRawShaderMaterial===!1&&(p(E,x),b(E,x),E.push(s.outputColorSpace)),E.push(x.customProgramCacheKey),E.join()}function p(x,E){x.push(E.precision),x.push(E.outputColorSpace),x.push(E.envMapMode),x.push(E.envMapCubeUVHeight),x.push(E.mapUv),x.push(E.alphaMapUv),x.push(E.lightMapUv),x.push(E.aoMapUv),x.push(E.bumpMapUv),x.push(E.normalMapUv),x.push(E.displacementMapUv),x.push(E.emissiveMapUv),x.push(E.metalnessMapUv),x.push(E.roughnessMapUv),x.push(E.anisotropyMapUv),x.push(E.clearcoatMapUv),x.push(E.clearcoatNormalMapUv),x.push(E.clearcoatRoughnessMapUv),x.push(E.iridescenceMapUv),x.push(E.iridescenceThicknessMapUv),x.push(E.sheenColorMapUv),x.push(E.sheenRoughnessMapUv),x.push(E.specularMapUv),x.push(E.specularColorMapUv),x.push(E.specularIntensityMapUv),x.push(E.transmissionMapUv),x.push(E.thicknessMapUv),x.push(E.combine),x.push(E.fogExp2),x.push(E.sizeAttenuation),x.push(E.morphTargetsCount),x.push(E.morphAttributeCount),x.push(E.numSunLights),x.push(E.numDirLights),x.push(E.numPointLights),x.push(E.numSpotLights),x.push(E.numSpotLightMaps),x.push(E.numHemiLights),x.push(E.numRectAreaLights),x.push(E.numSunLightShadows),x.push(E.numDirLightShadows),x.push(E.numPointLightShadows),x.push(E.numSpotLightShadows),x.push(E.numSpotLightShadowsWithMaps),x.push(E.numLightProbes),x.push(E.shadowMapType),x.push(E.toneMapping),x.push(E.numClippingPlanes),x.push(E.numClipIntersection),x.push(E.depthPacking)}function b(x,E){o.disableAll(),E.instancing&&o.enable(0),E.instancingColor&&o.enable(1),E.instancingMorph&&o.enable(2),E.matcap&&o.enable(3),E.envMap&&o.enable(4),E.normalMapObjectSpace&&o.enable(5),E.normalMapTangentSpace&&o.enable(6),E.clearcoat&&o.enable(7),E.iridescence&&o.enable(8),E.alphaTest&&o.enable(9),E.vertexColors&&o.enable(10),E.vertexAlphas&&o.enable(11),E.vertexUv1s&&o.enable(12),E.vertexUv2s&&o.enable(13),E.vertexUv3s&&o.enable(14),E.vertexTangents&&o.enable(15),E.anisotropy&&o.enable(16),E.alphaHash&&o.enable(17),E.batching&&o.enable(18),E.dispersion&&o.enable(19),E.retroreflection&&o.enable(24),E.batchingColor&&o.enable(20),E.gradientMap&&o.enable(21),E.packedNormalMap&&o.enable(22),E.vertexNormals&&o.enable(23),x.push(o.mask),o.disableAll(),E.fog&&o.enable(0),E.useFog&&o.enable(1),E.flatShading&&o.enable(2),E.logarithmicDepthBuffer&&o.enable(3),E.reversedDepthBuffer&&o.enable(4),E.skinning&&o.enable(5),E.morphTargets&&o.enable(6),E.morphNormals&&o.enable(7),E.morphColors&&o.enable(8),E.premultipliedAlpha&&o.enable(9),E.shadowMapEnabled&&o.enable(10),E.doubleSided&&o.enable(11),E.flipSided&&o.enable(12),E.useDepthPacking&&o.enable(13),E.dithering&&o.enable(14),E.transmission&&o.enable(15),E.sheen&&o.enable(16),E.opaque&&o.enable(17),E.pointsUvs&&o.enable(18),E.decodeVideoTexture&&o.enable(19),E.decodeVideoTextureEmissive&&o.enable(20),E.alphaToCoverage&&o.enable(21),E.numLightProbeGrids>0&&o.enable(22),E.hasPositionAttribute&&o.enable(23),x.push(o.mask)}function T(x){let E=f[x.type],R;if(E){let I=Vi[E];R=Oh.clone(I.uniforms)}else R=x.uniforms;return R}function y(x,E){let R=h.get(E);return R!==void 0?++R.usedTimes:(R=new N0(s,E,x,n),c.push(R),h.set(E,R)),R}function v(x){if(--x.usedTimes===0){let E=c.indexOf(x);c[E]=c[c.length-1],c.pop(),h.delete(x.cacheKey),x.destroy()}}function S(x){a.remove(x)}function A(){a.dispose()}return{getParameters:_,getProgramCacheKey:m,getUniforms:T,acquireProgram:y,releaseProgram:v,releaseShaderCache:S,programs:c,dispose:A}}function O0(){let s=new WeakMap;function t(o){return s.has(o)}function e(o){let a=s.get(o);return a===void 0&&(a={},s.set(o,a)),a}function i(o){s.delete(o)}function n(o,a,l){s.get(o)[a]=l}function r(){s=new WeakMap}return{has:t,get:e,remove:i,update:n,dispose:r}}function z0(s,t){return s.groupOrder!==t.groupOrder?s.groupOrder-t.groupOrder:s.renderOrder!==t.renderOrder?s.renderOrder-t.renderOrder:s.material.id!==t.material.id?s.material.id-t.material.id:s.materialVariant!==t.materialVariant?s.materialVariant-t.materialVariant:s.z!==t.z?s.z-t.z:s.id-t.id}function su(s,t){return s.groupOrder!==t.groupOrder?s.groupOrder-t.groupOrder:s.renderOrder!==t.renderOrder?s.renderOrder-t.renderOrder:s.z!==t.z?t.z-s.z:s.id-t.id}function ru(){let s=[],t=0,e=[],i=[],n=[];function r(){t=0,e.length=0,i.length=0,n.length=0}function o(u){let f=0;return u.isInstancedMesh&&(f+=2),u.isSkinnedMesh&&(f+=1),f}function a(u,f,g,_,m,p){let b=s[t];return b===void 0?(b={id:u.id,object:u,geometry:f,material:g,materialVariant:o(u),groupOrder:_,renderOrder:u.renderOrder,z:m,group:p},s[t]=b):(b.id=u.id,b.object=u,b.geometry=f,b.material=g,b.materialVariant=o(u),b.groupOrder=_,b.renderOrder=u.renderOrder,b.z=m,b.group=p),t++,b}function l(u,f,g,_,m,p,b){b.reversedDepth===!0&&(m=-m);let T=a(u,f,g,_,m,p);g.transmission>0?i.push(T):g.transparent===!0?n.push(T):e.push(T)}function c(u,f,g,_,m,p){let b=a(u,f,g,_,m,p);g.transmission>0?i.unshift(b):g.transparent===!0?n.unshift(b):e.unshift(b)}function h(u,f){e.length>1&&e.sort(u||z0),i.length>1&&i.sort(f||su),n.length>1&&n.sort(f||su)}function d(){for(let u=t,f=s.length;u<f;u++){let g=s[u];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:e,transmissive:i,transparent:n,init:r,push:l,unshift:c,finish:d,sort:h}}function k0(){let s=new WeakMap;function t(i,n){let r=s.get(i),o;return r===void 0?(o=new ru,s.set(i,[o])):n>=r.length?(o=new ru,r.push(o)):o=r[n],o}function e(){s=new WeakMap}return{get:t,dispose:e}}function H0(){let s={};return{get:function(t){if(s[t.id]!==void 0)return s[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={direction:new O,color:new yt};break;case"SpotLight":e={position:new O,direction:new O,color:new yt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new O,color:new yt,distance:0,decay:0};break;case"HemisphereLight":e={direction:new O,skyColor:new yt,groundColor:new yt};break;case"RectAreaLight":e={color:new yt,position:new O,halfWidth:new O,halfHeight:new O};break}return s[t.id]=e,e}}}function G0(){let s={};return{get:function(t){if(s[t.id]!==void 0)return s[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Wt};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Wt};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Wt,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[t.id]=e,e}}}var V0=0;function W0(s,t){return(t.castShadow?2:0)-(s.castShadow?2:0)+(t.map?1:0)-(s.map?1:0)}function X0(s){let t=new H0,e=G0(),i={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new O);let n=new O,r=new ie,o=new ie;function a(c){let h=0,d=0,u=0;for(let D=0;D<9;D++)i.probe[D].set(0,0,0);let f=0,g=0,_=0,m=0,p=0,b=0,T=0,y=0,v=0,S=0,A=0,x=0,E=0,R=0;c.sort(W0);for(let D=0,C=c.length;D<C;D++){let P=c[D],N=P.color,q=P.intensity,W=P.distance,tt=null;if(P.shadow&&P.shadow.map&&(P.shadow.map.texture.format===Mn?tt=P.shadow.map.texture:tt=P.shadow.map.depthTexture||P.shadow.map.texture),P.isAmbientLight)h+=N.r*q,d+=N.g*q,u+=N.b*q;else if(P.isLightProbe){for(let k=0;k<9;k++)i.probe[k].addScaledVector(P.sh.coefficients[k],q);R++}else if(P.isSunLight){let k=t.get(P);if(k.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){let X=P.shadow,H=e.get(P);H.shadowIntensity=X.intensity,H.shadowBias=X.bias,H.shadowNormalBias=X.normalBias,H.shadowRadius=X.radius,H.shadowMapSize.copy(X.mapSize).multiply(X.getFrameExtents()),i.sunShadow[g]=H,i.sunShadowMap[g]=tt;let rt=X.getViewportCount();for(let lt=0;lt<rt;lt++)i.sunShadowMatrix[_+lt]=X.getMatrix(lt),i.sunShadowCascade[_+lt]=X._cascadeData[lt];_+=rt,g++}i.sun[f]=k,f++}else if(P.isDirectionalLight){let k=t.get(P);if(k.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){let X=P.shadow,H=e.get(P);H.shadowIntensity=X.intensity,H.shadowBias=X.bias,H.shadowNormalBias=X.normalBias,H.shadowRadius=X.radius,H.shadowMapSize=X.mapSize,i.directionalShadow[m]=H,i.directionalShadowMap[m]=tt,i.directionalShadowMatrix[m]=P.shadow.matrix,v++}i.directional[m]=k,m++}else if(P.isSpotLight){let k=t.get(P);k.position.setFromMatrixPosition(P.matrixWorld),k.color.copy(N).multiplyScalar(q),k.distance=W,k.coneCos=Math.cos(P.angle),k.penumbraCos=Math.cos(P.angle*(1-P.penumbra)),k.decay=P.decay,i.spot[b]=k;let X=P.shadow;if(P.map&&(i.spotLightMap[x]=P.map,x++,X.updateMatrices(P),P.castShadow&&E++),i.spotLightMatrix[b]=X.matrix,P.castShadow){let H=e.get(P);H.shadowIntensity=X.intensity,H.shadowBias=X.bias,H.shadowNormalBias=X.normalBias,H.shadowRadius=X.radius,H.shadowMapSize=X.mapSize,i.spotShadow[b]=H,i.spotShadowMap[b]=tt,A++}b++}else if(P.isRectAreaLight){let k=t.get(P);k.color.copy(N).multiplyScalar(q),k.halfWidth.set(P.width*.5,0,0),k.halfHeight.set(0,P.height*.5,0),i.rectArea[T]=k,T++}else if(P.isPointLight){let k=t.get(P);if(k.color.copy(P.color).multiplyScalar(P.intensity),k.distance=P.distance,k.decay=P.decay,P.castShadow){let X=P.shadow,H=e.get(P);H.shadowIntensity=X.intensity,H.shadowBias=X.bias,H.shadowNormalBias=X.normalBias,H.shadowRadius=X.radius,H.shadowMapSize=X.mapSize,H.shadowCameraNear=X.camera.near,H.shadowCameraFar=X.camera.far,i.pointShadow[p]=H,i.pointShadowMap[p]=tt,i.pointShadowMatrix[p]=P.shadow.matrix,S++}i.point[p]=k,p++}else if(P.isHemisphereLight){let k=t.get(P);k.skyColor.copy(P.color).multiplyScalar(q),k.groundColor.copy(P.groundColor).multiplyScalar(q),i.hemi[y]=k,y++}}T>0&&(s.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=mt.LTC_FLOAT_1,i.rectAreaLTC2=mt.LTC_FLOAT_2):(i.rectAreaLTC1=mt.LTC_HALF_1,i.rectAreaLTC2=mt.LTC_HALF_2)),i.ambient[0]=h,i.ambient[1]=d,i.ambient[2]=u;let I=i.hash;(I.sunLength!==f||I.directionalLength!==m||I.pointLength!==p||I.spotLength!==b||I.rectAreaLength!==T||I.hemiLength!==y||I.numSunShadows!==g||I.numDirectionalShadows!==v||I.numPointShadows!==S||I.numSpotShadows!==A||I.numSpotMaps!==x||I.numLightProbes!==R)&&(i.sun.length=f,i.directional.length=m,i.spot.length=b,i.rectArea.length=T,i.point.length=p,i.hemi.length=y,i.sunShadow.length=g,i.sunShadowMap.length=g,i.sunShadowMatrix.length=_,i.sunShadowCascade.length=_,i.directionalShadow.length=v,i.directionalShadowMap.length=v,i.directionalShadowMatrix.length=v,i.pointShadow.length=S,i.pointShadowMap.length=S,i.pointShadowMatrix.length=S,i.spotShadow.length=A,i.spotShadowMap.length=A,i.spotLightMatrix.length=A+x-E,i.spotLightMap.length=x,i.numSpotLightShadowsWithMaps=E,i.numLightProbes=R,I.sunLength=f,I.directionalLength=m,I.pointLength=p,I.spotLength=b,I.rectAreaLength=T,I.hemiLength=y,I.numSunShadows=g,I.numDirectionalShadows=v,I.numPointShadows=S,I.numSpotShadows=A,I.numSpotMaps=x,I.numLightProbes=R,i.version=V0++)}function l(c,h){let d=0,u=0,f=0,g=0,_=0,m=0,p=h.matrixWorldInverse;for(let b=0,T=c.length;b<T;b++){let y=c[b];if(y.isSunLight){let v=i.sun[d];v.direction.setFromMatrixPosition(y.matrixWorld),v.direction.transformDirection(p),d++}else if(y.isDirectionalLight){let v=i.directional[u];v.direction.setFromMatrixPosition(y.matrixWorld),n.setFromMatrixPosition(y.target.matrixWorld),v.direction.sub(n),v.direction.transformDirection(p),u++}else if(y.isSpotLight){let v=i.spot[g];v.position.setFromMatrixPosition(y.matrixWorld),v.position.applyMatrix4(p),v.direction.setFromMatrixPosition(y.matrixWorld),n.setFromMatrixPosition(y.target.matrixWorld),v.direction.sub(n),v.direction.transformDirection(p),g++}else if(y.isRectAreaLight){let v=i.rectArea[_];v.position.setFromMatrixPosition(y.matrixWorld),v.position.applyMatrix4(p),o.identity(),r.copy(y.matrixWorld),r.premultiply(p),o.extractRotation(r),v.halfWidth.set(y.width*.5,0,0),v.halfHeight.set(0,y.height*.5,0),v.halfWidth.applyMatrix4(o),v.halfHeight.applyMatrix4(o),_++}else if(y.isPointLight){let v=i.point[f];v.position.setFromMatrixPosition(y.matrixWorld),v.position.applyMatrix4(p),f++}else if(y.isHemisphereLight){let v=i.hemi[m];v.direction.setFromMatrixPosition(y.matrixWorld),v.direction.transformDirection(p),m++}}}return{setup:a,setupView:l,state:i}}function ou(s){let t=new X0(s),e=[],i=[],n=[];function r(u){d.camera=u,e.length=0,i.length=0,n.length=0}function o(u){e.push(u)}function a(u){i.push(u)}function l(u){n.push(u)}function c(){t.setup(e)}function h(u){t.setupView(e,u)}let d={lightsArray:e,shadowsArray:i,lightProbeGridArray:n,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:d,setupLights:c,setupLightsView:h,pushLight:o,pushShadow:a,pushLightProbeGrid:l}}function q0(s){let t=new WeakMap;function e(n,r=0){let o=t.get(n),a;return o===void 0?(a=new ou(s),t.set(n,[a])):r>=o.length?(a=new ou(s),o.push(a)):a=o[r],a}function i(){t=new WeakMap}return{get:e,dispose:i}}var Y0=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,$0=`uniform sampler2D shadow_pass;
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
}`,Z0=[new O(1,0,0),new O(-1,0,0),new O(0,1,0),new O(0,-1,0),new O(0,0,1),new O(0,0,-1)],J0=[new O(0,-1,0),new O(0,-1,0),new O(0,0,1),new O(0,0,-1),new O(0,-1,0),new O(0,-1,0)],au=new ie,ar=new O,Jl=new O;function K0(s,t,e){let i=new hs,n=new Wt,r=new Wt,o=new xe,a=new ro,l=new oo,c={},h=e.maxTextureSize,d={[zi]:je,[je]:zi,[qe]:qe},u=new Re({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Wt},radius:{value:4}},vertexShader:Y0,fragmentShader:$0}),f=u.clone();f.defines.HORIZONTAL_PASS=1;let g=new _e;g.setAttribute("position",new ee(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let _=new Ct(g,u),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Fn;let p=this.type;this.render=function(S,A,x){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||S.length===0)return;this.type===eh&&(Dt("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Fn);let E=s.getRenderTarget(),R=s.getActiveCubeFace(),I=s.getActiveMipmapLevel(),D=s.state;D.setBlending(ki),D.buffers.depth.getReversed()===!0?D.buffers.color.setClear(0,0,0,0):D.buffers.color.setClear(1,1,1,1),D.buffers.depth.setTest(!0),D.setScissorTest(!1);let C=p!==this.type;C&&A.traverse(function(P){P.material&&(Array.isArray(P.material)?P.material.forEach(N=>N.needsUpdate=!0):P.material.needsUpdate=!0)});for(let P=0,N=S.length;P<N;P++){let q=S[P],W=q.shadow;if(W===void 0){Dt("WebGLShadowMap:",q,"has no shadow.");continue}if(W.autoUpdate===!1&&W.needsUpdate===!1)continue;n.copy(W.mapSize);let tt=W.getFrameExtents();n.multiply(tt),r.copy(W.mapSize),(n.x>h||n.y>h)&&(n.x>h&&(r.x=Math.floor(h/tt.x),n.x=r.x*tt.x,W.mapSize.x=r.x),n.y>h&&(r.y=Math.floor(h/tt.y),n.y=r.y*tt.y,W.mapSize.y=r.y));let k=s.state.buffers.depth.getReversed();if(W.camera._reversedDepth=k,W.map===null||C===!0){if(W.map!==null&&(W.map.depthTexture!==null&&(W.map.depthTexture.dispose(),W.map.depthTexture=null),W.map.dispose()),this.type===ds){if(q.isPointLight){Dt("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}W.map=new si(n.x,n.y,{format:Mn,type:Ai,minFilter:Ce,magFilter:Ce,generateMipmaps:!1}),W.map.texture.name=q.name+".shadowMap",W.map.depthTexture=new fn(n.x,n.y,gi),W.map.depthTexture.name=q.name+".shadowMapDepth",W.map.depthTexture.format=Ni,W.map.depthTexture.compareFunction=null,W.map.depthTexture.minFilter=Ne,W.map.depthTexture.magFilter=Ne}else q.isPointLight?(W.map=new fa(n.x),W.map.depthTexture=new io(n.x,Ti)):(W.map=new si(n.x,n.y),W.map.depthTexture=new fn(n.x,n.y,Ti)),W.map.depthTexture.name=q.name+".shadowMap",W.map.depthTexture.format=Ni,this.type===Fn?(W.map.depthTexture.compareFunction=k?ca:la,W.map.depthTexture.minFilter=Ce,W.map.depthTexture.magFilter=Ce):(W.map.depthTexture.compareFunction=null,W.map.depthTexture.minFilter=Ne,W.map.depthTexture.magFilter=Ne);W.camera.updateProjectionMatrix()}W.map.isWebGLCubeRenderTarget!==!0&&(W.map.width!==n.x||W.map.height!==n.y)&&W.map.setSize(n.x,n.y);let X=W.map.isWebGLCubeRenderTarget?6:W.getViewportCount();q.isPointLight!==!0&&W.updateMatrices(q,x);for(let H=0;H<X;H++){let rt=W.getCamera(H);if(q.isPointLight){let lt=W.camera,Ht=W.matrix,Bt=q.distance||lt.far;Bt!==lt.far&&(lt.far=Bt,lt.updateProjectionMatrix()),ar.setFromMatrixPosition(q.matrixWorld),lt.position.copy(ar),Jl.copy(lt.position),Jl.add(Z0[H]),lt.up.copy(J0[H]),lt.lookAt(Jl),lt.updateMatrixWorld(),Ht.makeTranslation(-ar.x,-ar.y,-ar.z),au.multiplyMatrices(lt.projectionMatrix,lt.matrixWorldInverse),W._frustum.setFromProjectionMatrix(au,lt.coordinateSystem,lt.reversedDepth)}if(W.map.isWebGLCubeRenderTarget)s.setRenderTarget(W.map,H),s.clear();else{H===0&&(s.setRenderTarget(W.map),s.clear());let lt=W.getViewport(H);o.set(r.x*lt.x,r.y*lt.y,r.x*lt.z,r.y*lt.w),D.viewport(o)}i=W.getFrustum(H),y(A,x,rt,q,this.type)}W.isPointLightShadow!==!0&&this.type===ds&&b(W,x),W.needsUpdate=!1}p=this.type,m.needsUpdate=!1,s.setRenderTarget(E,R,I)};function b(S,A){let x=t.update(_);u.defines.VSM_SAMPLES!==S.blurSamples&&(u.defines.VSM_SAMPLES=S.blurSamples,f.defines.VSM_SAMPLES=S.blurSamples,u.needsUpdate=!0,f.needsUpdate=!0),S.mapPass===null?S.mapPass=new si(n.x,n.y,{format:Mn,type:Ai}):(S.mapPass.width!==S.map.width||S.mapPass.height!==S.map.height)&&S.mapPass.setSize(S.map.width,S.map.height),u.uniforms.shadow_pass.value=S.map.depthTexture,u.uniforms.resolution.value.set(S.map.width,S.map.height),u.uniforms.radius.value=S.radius,s.setRenderTarget(S.mapPass),s.clear(),s.renderBufferDirect(A,null,x,u,_,null),f.uniforms.shadow_pass.value=S.mapPass.texture,f.uniforms.resolution.value.set(S.map.width,S.map.height),f.uniforms.radius.value=S.radius,s.setRenderTarget(S.map),s.clear(),s.renderBufferDirect(A,null,x,f,_,null)}function T(S,A,x,E){let R=null,I=x.isPointLight===!0?S.customDistanceMaterial:S.customDepthMaterial;if(I!==void 0)R=I;else if(R=x.isPointLight===!0?l:a,s.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0||A.alphaToCoverage===!0){let D=R.uuid,C=A.uuid,P=c[D];P===void 0&&(P={},c[D]=P);let N=P[C];N===void 0&&(N=R.clone(),P[C]=N,A.addEventListener("dispose",v)),R=N}if(R.visible=A.visible,R.wireframe=A.wireframe,E===ds?R.side=A.shadowSide!==null?A.shadowSide:A.side:R.side=A.shadowSide!==null?A.shadowSide:d[A.side],R.alphaMap=A.alphaMap,R.alphaTest=A.alphaToCoverage===!0?.5:A.alphaTest,R.map=A.map,R.clipShadows=A.clipShadows,R.clippingPlanes=A.clippingPlanes,R.clipIntersection=A.clipIntersection,R.displacementMap=A.displacementMap,R.displacementScale=A.displacementScale,R.displacementBias=A.displacementBias,R.wireframeLinewidth=A.wireframeLinewidth,R.linewidth=A.linewidth,x.isPointLight===!0&&R.isMeshDistanceMaterial===!0){let D=s.properties.get(R);D.light=x}return R}function y(S,A,x,E,R){if(S.visible===!1)return;if(S.layers.test(A.layers)&&(S.isMesh||S.isLine||S.isPoints)&&(S.castShadow||S.receiveShadow&&R===ds)&&(!S.frustumCulled||S.intersectsFrustum(i))){S.modelViewMatrix.multiplyMatrices(x.matrixWorldInverse,S.matrixWorld);let C=t.update(S),P=S.material;if(Array.isArray(P)){let N=C.groups;for(let q=0,W=N.length;q<W;q++){let tt=N[q],k=P[tt.materialIndex];if(k&&k.visible){let X=T(S,k,E,R);S.onBeforeShadow(s,S,A,x,C,X,tt),s.renderBufferDirect(x,null,C,X,S,tt),S.onAfterShadow(s,S,A,x,C,X,tt)}}}else if(P.visible){let N=T(S,P,E,R);S.onBeforeShadow(s,S,A,x,C,N,null),s.renderBufferDirect(x,null,C,N,S,null),S.onAfterShadow(s,S,A,x,C,N,null)}}let D=S.children;for(let C=0,P=D.length;C<P;C++)y(D[C],A,x,E,R)}function v(S){S.target.removeEventListener("dispose",v);for(let x in c){let E=c[x],R=S.target.uuid;R in E&&(E[R].dispose(),delete E[R])}}}function Q0(s,t){function e(){let F=!1,dt=new xe,et=null,ft=new xe(0,0,0,0);return{setMask:function(_t){et!==_t&&!F&&(s.colorMask(_t,_t,_t,_t),et=_t)},setLocked:function(_t){F=_t},setClear:function(_t,nt,It,Et,ue){ue===!0&&(_t*=Et,nt*=Et,It*=Et),dt.set(_t,nt,It,Et),ft.equals(dt)===!1&&(s.clearColor(_t,nt,It,Et),ft.copy(dt))},reset:function(){F=!1,et=null,ft.set(-1,0,0,0)}}}function i(){let F=!1,dt=!1,et=null,ft=null,_t=null;return{setReversed:function(nt){if(dt!==nt){let It=t.get("EXT_clip_control");nt?It.clipControlEXT(It.LOWER_LEFT_EXT,It.ZERO_TO_ONE_EXT):It.clipControlEXT(It.LOWER_LEFT_EXT,It.NEGATIVE_ONE_TO_ONE_EXT),dt=nt;let Et=_t;_t=null,this.setClear(Et)}},getReversed:function(){return dt},setTest:function(nt){nt?Q(s.DEPTH_TEST):at(s.DEPTH_TEST)},setMask:function(nt){et!==nt&&!F&&(s.depthMask(nt),et=nt)},setFunc:function(nt){if(dt&&(nt=Fh[nt]),ft!==nt){switch(nt){case zr:s.depthFunc(s.NEVER);break;case kr:s.depthFunc(s.ALWAYS);break;case Hr:s.depthFunc(s.LESS);break;case ss:s.depthFunc(s.LEQUAL);break;case Gr:s.depthFunc(s.EQUAL);break;case Vr:s.depthFunc(s.GEQUAL);break;case Wr:s.depthFunc(s.GREATER);break;case Xr:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}ft=nt}},setLocked:function(nt){F=nt},setClear:function(nt){_t!==nt&&(_t=nt,dt&&(nt=1-nt),s.clearDepth(nt))},reset:function(){F=!1,et=null,ft=null,_t=null,dt=!1}}}function n(){let F=!1,dt=null,et=null,ft=null,_t=null,nt=null,It=null,Et=null,ue=null;return{setTest:function(se){F||(se?Q(s.STENCIL_TEST):at(s.STENCIL_TEST))},setMask:function(se){dt!==se&&!F&&(s.stencilMask(se),dt=se)},setFunc:function(se,_i,Pi){(et!==se||ft!==_i||_t!==Pi)&&(s.stencilFunc(se,_i,Pi),et=se,ft=_i,_t=Pi)},setOp:function(se,_i,Pi){(nt!==se||It!==_i||Et!==Pi)&&(s.stencilOp(se,_i,Pi),nt=se,It=_i,Et=Pi)},setLocked:function(se){F=se},setClear:function(se){ue!==se&&(s.clearStencil(se),ue=se)},reset:function(){F=!1,dt=null,et=null,ft=null,_t=null,nt=null,It=null,Et=null,ue=null}}}let r=new e,o=new i,a=new n,l=new WeakMap,c=new WeakMap,h={},d={},u={},f=new WeakMap,g=[],_=null,m=!1,p=null,b=null,T=null,y=null,v=null,S=null,A=null,x=new yt(0,0,0),E=0,R=!1,I=null,D=null,C=null,P=null,N=null,q=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS),W=!1,tt=0,k=s.getParameter(s.VERSION);k.indexOf("WebGL")!==-1?(tt=parseFloat(/^WebGL (\d)/.exec(k)[1]),W=tt>=1):k.indexOf("OpenGL ES")!==-1&&(tt=parseFloat(/^OpenGL ES (\d)/.exec(k)[1]),W=tt>=2);let X=null,H={},rt=s.getParameter(s.SCISSOR_BOX),lt=s.getParameter(s.VIEWPORT),Ht=new xe().fromArray(rt),Bt=new xe().fromArray(lt);function zt(F,dt,et,ft){let _t=new Uint8Array(4),nt=s.createTexture();s.bindTexture(F,nt),s.texParameteri(F,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(F,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let It=0;It<et;It++)F===s.TEXTURE_3D||F===s.TEXTURE_2D_ARRAY?s.texImage3D(dt,0,s.RGBA,1,1,ft,0,s.RGBA,s.UNSIGNED_BYTE,_t):s.texImage2D(dt+It,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,_t);return nt}let Z={};Z[s.TEXTURE_2D]=zt(s.TEXTURE_2D,s.TEXTURE_2D,1),Z[s.TEXTURE_CUBE_MAP]=zt(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),Z[s.TEXTURE_2D_ARRAY]=zt(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),Z[s.TEXTURE_3D]=zt(s.TEXTURE_3D,s.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),Q(s.DEPTH_TEST),o.setFunc(ss),Gt(!1),le(pl),Q(s.CULL_FACE),Ot(ki);function Q(F){h[F]!==!0&&(s.enable(F),h[F]=!0)}function at(F){h[F]!==!1&&(s.disable(F),h[F]=!1)}function wt(F,dt){return u[F]!==dt?(s.bindFramebuffer(F,dt),u[F]=dt,F===s.DRAW_FRAMEBUFFER&&(u[s.FRAMEBUFFER]=dt),F===s.FRAMEBUFFER&&(u[s.DRAW_FRAMEBUFFER]=dt),!0):!1}function st(F,dt){let et=g,ft=!1;if(F){et=f.get(dt),et===void 0&&(et=[],f.set(dt,et));let _t=F.textures;if(et.length!==_t.length||et[0]!==s.COLOR_ATTACHMENT0){for(let nt=0,It=_t.length;nt<It;nt++)et[nt]=s.COLOR_ATTACHMENT0+nt;et.length=_t.length,ft=!0}}else et[0]!==s.BACK&&(et[0]=s.BACK,ft=!0);ft&&s.drawBuffers(et)}function Tt(F){return _!==F?(s.useProgram(F),_=F,!0):!1}let Yt={[Bn]:s.FUNC_ADD,[nh]:s.FUNC_SUBTRACT,[sh]:s.FUNC_REVERSE_SUBTRACT};Yt[rh]=s.MIN,Yt[oh]=s.MAX;let Ut={[ah]:s.ZERO,[lh]:s.ONE,[ch]:s.SRC_COLOR,[_l]:s.SRC_ALPHA,[mh]:s.SRC_ALPHA_SATURATE,[fh]:s.DST_COLOR,[uh]:s.DST_ALPHA,[hh]:s.ONE_MINUS_SRC_COLOR,[yl]:s.ONE_MINUS_SRC_ALPHA,[ph]:s.ONE_MINUS_DST_COLOR,[dh]:s.ONE_MINUS_DST_ALPHA,[gh]:s.CONSTANT_COLOR,[xh]:s.ONE_MINUS_CONSTANT_COLOR,[_h]:s.CONSTANT_ALPHA,[yh]:s.ONE_MINUS_CONSTANT_ALPHA};function Ot(F,dt,et,ft,_t,nt,It,Et,ue,se){if(F===ki){m===!0&&(at(s.BLEND),m=!1);return}if(m===!1&&(Q(s.BLEND),m=!0),F!==ih){if(F!==p||se!==R){if((b!==Bn||v!==Bn)&&(s.blendEquation(s.FUNC_ADD),b=Bn,v=Bn),se)switch(F){case _n:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case ml:s.blendFunc(s.ONE,s.ONE);break;case gl:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case xl:s.blendFuncSeparate(s.DST_COLOR,s.ONE_MINUS_SRC_ALPHA,s.ZERO,s.ONE);break;default:Ft("WebGLState: Invalid blending: ",F);break}else switch(F){case _n:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case ml:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE,s.ONE,s.ONE);break;case gl:Ft("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case xl:Ft("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Ft("WebGLState: Invalid blending: ",F);break}T=null,y=null,S=null,A=null,x.set(0,0,0),E=0,p=F,R=se}return}_t=_t||dt,nt=nt||et,It=It||ft,(dt!==b||_t!==v)&&(s.blendEquationSeparate(Yt[dt],Yt[_t]),b=dt,v=_t),(et!==T||ft!==y||nt!==S||It!==A)&&(s.blendFuncSeparate(Ut[et],Ut[ft],Ut[nt],Ut[It]),T=et,y=ft,S=nt,A=It),(Et.equals(x)===!1||ue!==E)&&(s.blendColor(Et.r,Et.g,Et.b,ue),x.copy(Et),E=ue),p=F,R=!1}function jt(F,dt){F.side===qe?at(s.CULL_FACE):Q(s.CULL_FACE);let et=F.side===je;dt&&(et=!et),Gt(et),F.blending===_n&&F.transparent===!1?Ot(ki):Ot(F.blending,F.blendEquation,F.blendSrc,F.blendDst,F.blendEquationAlpha,F.blendSrcAlpha,F.blendDstAlpha,F.blendColor,F.blendAlpha,F.premultipliedAlpha),o.setFunc(F.depthFunc),o.setTest(F.depthTest),o.setMask(F.depthWrite),r.setMask(F.colorWrite);let ft=F.stencilWrite;a.setTest(ft),ft&&(a.setMask(F.stencilWriteMask),a.setFunc(F.stencilFunc,F.stencilRef,F.stencilFuncMask),a.setOp(F.stencilFail,F.stencilZFail,F.stencilZPass)),ii(F.polygonOffset,F.polygonOffsetFactor,F.polygonOffsetUnits),F.alphaToCoverage===!0?Q(s.SAMPLE_ALPHA_TO_COVERAGE):at(s.SAMPLE_ALPHA_TO_COVERAGE)}function Gt(F){I!==F&&(F?s.frontFace(s.CW):s.frontFace(s.CCW),I=F)}function le(F){F!==jc?(Q(s.CULL_FACE),F!==D&&(F===pl?s.cullFace(s.BACK):F===th?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):at(s.CULL_FACE),D=F}function Me(F){F!==C&&(W&&s.lineWidth(F),C=F)}function ii(F,dt,et){F?(Q(s.POLYGON_OFFSET_FILL),(P!==dt||N!==et)&&(P=dt,N=et,o.getReversed()&&(dt=-dt),s.polygonOffset(dt,et))):at(s.POLYGON_OFFSET_FILL)}function ye(F){F?Q(s.SCISSOR_TEST):at(s.SCISSOR_TEST)}function we(F){F===void 0&&(F=s.TEXTURE0+q-1),X!==F&&(s.activeTexture(F),X=F)}function B(F,dt,et){et===void 0&&(X===null?et=s.TEXTURE0+q-1:et=X);let ft=H[et];ft===void 0&&(ft={type:void 0,texture:void 0},H[et]=ft),(ft.type!==F||ft.texture!==dt)&&(X!==et&&(s.activeTexture(et),X=et),s.bindTexture(F,dt||Z[F]),ft.type=F,ft.texture=dt)}function ke(){let F=H[X];F!==void 0&&F.type!==void 0&&(s.bindTexture(F.type,null),F.type=void 0,F.texture=void 0)}function ae(){try{s.compressedTexImage2D(...arguments)}catch(F){Ft("WebGLState:",F)}}function L(){try{s.compressedTexImage3D(...arguments)}catch(F){Ft("WebGLState:",F)}}function M(){try{s.texSubImage2D(...arguments)}catch(F){Ft("WebGLState:",F)}}function z(){try{s.texSubImage3D(...arguments)}catch(F){Ft("WebGLState:",F)}}function Y(){try{s.compressedTexSubImage2D(...arguments)}catch(F){Ft("WebGLState:",F)}}function K(){try{s.compressedTexSubImage3D(...arguments)}catch(F){Ft("WebGLState:",F)}}function ot(){try{s.texStorage2D(...arguments)}catch(F){Ft("WebGLState:",F)}}function ct(){try{s.texStorage3D(...arguments)}catch(F){Ft("WebGLState:",F)}}function j(){try{s.texImage2D(...arguments)}catch(F){Ft("WebGLState:",F)}}function it(){try{s.texImage3D(...arguments)}catch(F){Ft("WebGLState:",F)}}function ht(F){return d[F]!==void 0?d[F]:s.getParameter(F)}function Rt(F,dt){d[F]!==dt&&(s.pixelStorei(F,dt),d[F]=dt)}function pt(F){Ht.equals(F)===!1&&(s.scissor(F.x,F.y,F.z,F.w),Ht.copy(F))}function ut(F){Bt.equals(F)===!1&&(s.viewport(F.x,F.y,F.z,F.w),Bt.copy(F))}function Pt(F,dt){let et=c.get(dt);et===void 0&&(et=new WeakMap,c.set(dt,et));let ft=et.get(F);ft===void 0&&(ft=s.getUniformBlockIndex(dt,F.name),et.set(F,ft))}function Lt(F,dt){let ft=c.get(dt).get(F);l.get(dt)!==ft&&(s.uniformBlockBinding(dt,ft,F.__bindingPointIndex),l.set(dt,ft))}function Vt(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),o.setReversed(!1),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),s.pixelStorei(s.PACK_ALIGNMENT,4),s.pixelStorei(s.UNPACK_ALIGNMENT,4),s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,!1),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,s.BROWSER_DEFAULT_WEBGL),s.pixelStorei(s.PACK_ROW_LENGTH,0),s.pixelStorei(s.PACK_SKIP_PIXELS,0),s.pixelStorei(s.PACK_SKIP_ROWS,0),s.pixelStorei(s.UNPACK_ROW_LENGTH,0),s.pixelStorei(s.UNPACK_IMAGE_HEIGHT,0),s.pixelStorei(s.UNPACK_SKIP_PIXELS,0),s.pixelStorei(s.UNPACK_SKIP_ROWS,0),s.pixelStorei(s.UNPACK_SKIP_IMAGES,0),h={},d={},X=null,H={},u={},f=new WeakMap,g=[],_=null,m=!1,p=null,b=null,T=null,y=null,v=null,S=null,A=null,x=new yt(0,0,0),E=0,R=!1,I=null,D=null,C=null,P=null,N=null,Ht.set(0,0,s.canvas.width,s.canvas.height),Bt.set(0,0,s.canvas.width,s.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:Q,disable:at,bindFramebuffer:wt,drawBuffers:st,useProgram:Tt,setBlending:Ot,setMaterial:jt,setFlipSided:Gt,setCullFace:le,setLineWidth:Me,setPolygonOffset:ii,setScissorTest:ye,activeTexture:we,bindTexture:B,unbindTexture:ke,compressedTexImage2D:ae,compressedTexImage3D:L,texImage2D:j,texImage3D:it,pixelStorei:Rt,getParameter:ht,updateUBOMapping:Pt,uniformBlockBinding:Lt,texStorage2D:ot,texStorage3D:ct,texSubImage2D:M,texSubImage3D:z,compressedTexSubImage2D:Y,compressedTexSubImage3D:K,scissor:pt,viewport:ut,reset:Vt}}function j0(s,t,e,i,n,r,o){let a=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Wt,h=new WeakMap,d=new Set,u,f=new WeakMap,g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function _(L,M){return g?new OffscreenCanvas(L,M):Ls("canvas")}function m(L,M,z){let Y=1,K=ae(L);if((K.width>z||K.height>z)&&(Y=z/Math.max(K.width,K.height)),Y<1)if(typeof HTMLImageElement<"u"&&L instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&L instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&L instanceof ImageBitmap||typeof VideoFrame<"u"&&L instanceof VideoFrame){let ot=Math.floor(Y*K.width),ct=Math.floor(Y*K.height);u===void 0&&(u=_(ot,ct));let j=M?_(ot,ct):u;return j.width=ot,j.height=ct,j.getContext("2d").drawImage(L,0,0,ot,ct),Dt("WebGLRenderer: Texture has been resized from ("+K.width+"x"+K.height+") to ("+ot+"x"+ct+")."),j}else return"data"in L&&Dt("WebGLRenderer: Image in DataTexture is too big ("+K.width+"x"+K.height+")."),L;return L}function p(L){return L.generateMipmaps}function b(L){s.generateMipmap(L)}function T(L){return L.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:L.isWebGL3DRenderTarget?s.TEXTURE_3D:L.isWebGLArrayRenderTarget||L.isCompressedArrayTexture?s.TEXTURE_2D_ARRAY:s.TEXTURE_2D}function y(L,M,z,Y,K,ot=!1){if(L!==null){if(s[L]!==void 0)return s[L];Dt("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+L+"'")}let ct;Y&&(ct=t.get("EXT_texture_norm16"),ct||Dt("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let j=M;if(M===s.RED&&(z===s.FLOAT&&(j=s.R32F),z===s.HALF_FLOAT&&(j=s.R16F),z===s.UNSIGNED_BYTE&&(j=s.R8),z===s.UNSIGNED_SHORT&&ct&&(j=ct.R16_EXT),z===s.SHORT&&ct&&(j=ct.R16_SNORM_EXT)),M===s.RED_INTEGER&&(z===s.UNSIGNED_BYTE&&(j=s.R8UI),z===s.UNSIGNED_SHORT&&(j=s.R16UI),z===s.UNSIGNED_INT&&(j=s.R32UI),z===s.BYTE&&(j=s.R8I),z===s.SHORT&&(j=s.R16I),z===s.INT&&(j=s.R32I)),M===s.RG&&(z===s.FLOAT&&(j=s.RG32F),z===s.HALF_FLOAT&&(j=s.RG16F),z===s.UNSIGNED_BYTE&&(j=s.RG8),z===s.UNSIGNED_SHORT&&ct&&(j=ct.RG16_EXT),z===s.SHORT&&ct&&(j=ct.RG16_SNORM_EXT)),M===s.RG_INTEGER&&(z===s.UNSIGNED_BYTE&&(j=s.RG8UI),z===s.UNSIGNED_SHORT&&(j=s.RG16UI),z===s.UNSIGNED_INT&&(j=s.RG32UI),z===s.BYTE&&(j=s.RG8I),z===s.SHORT&&(j=s.RG16I),z===s.INT&&(j=s.RG32I)),M===s.RGB_INTEGER&&(z===s.UNSIGNED_BYTE&&(j=s.RGB8UI),z===s.UNSIGNED_SHORT&&(j=s.RGB16UI),z===s.UNSIGNED_INT&&(j=s.RGB32UI),z===s.BYTE&&(j=s.RGB8I),z===s.SHORT&&(j=s.RGB16I),z===s.INT&&(j=s.RGB32I)),M===s.RGBA_INTEGER&&(z===s.UNSIGNED_BYTE&&(j=s.RGBA8UI),z===s.UNSIGNED_SHORT&&(j=s.RGBA16UI),z===s.UNSIGNED_INT&&(j=s.RGBA32UI),z===s.BYTE&&(j=s.RGBA8I),z===s.SHORT&&(j=s.RGBA16I),z===s.INT&&(j=s.RGBA32I)),M===s.RGB&&(z===s.UNSIGNED_SHORT&&ct&&(j=ct.RGB16_EXT),z===s.SHORT&&ct&&(j=ct.RGB16_SNORM_EXT),z===s.UNSIGNED_INT_5_9_9_9_REV&&(j=s.RGB9_E5),z===s.UNSIGNED_INT_10F_11F_11F_REV&&(j=s.R11F_G11F_B10F)),M===s.RGBA){let it=ot?Is:Zt.getTransfer(K);z===s.FLOAT&&(j=s.RGBA32F),z===s.HALF_FLOAT&&(j=s.RGBA16F),z===s.UNSIGNED_BYTE&&(j=it===oe?s.SRGB8_ALPHA8:s.RGBA8),z===s.UNSIGNED_SHORT&&ct&&(j=ct.RGBA16_EXT),z===s.SHORT&&ct&&(j=ct.RGBA16_SNORM_EXT),z===s.UNSIGNED_SHORT_4_4_4_4&&(j=s.RGBA4),z===s.UNSIGNED_SHORT_5_5_5_1&&(j=s.RGB5_A1)}return(j===s.R16F||j===s.R32F||j===s.RG16F||j===s.RG32F||j===s.RGBA16F||j===s.RGBA32F)&&t.get("EXT_color_buffer_float"),j}function v(L,M){let z;return L?M===null||M===Ti||M===ps?z=s.DEPTH24_STENCIL8:M===gi?z=s.DEPTH32F_STENCIL8:M===fs&&(z=s.DEPTH24_STENCIL8,Dt("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):M===null||M===Ti||M===ps?z=s.DEPTH_COMPONENT24:M===gi?z=s.DEPTH_COMPONENT32F:M===fs&&(z=s.DEPTH_COMPONENT16),z}function S(L,M){return p(L)===!0||L.isFramebufferTexture&&L.minFilter!==Ne&&L.minFilter!==Ce?Math.log2(Math.max(M.width,M.height))+1:L.mipmaps!==void 0&&L.mipmaps.length>0?L.mipmaps.length:L.isCompressedTexture&&Array.isArray(L.image)?M.mipmaps.length:1}function A(L){let M=L.target;M.removeEventListener("dispose",A),E(M),M.isVideoTexture&&h.delete(M),M.isHTMLTexture&&d.delete(M)}function x(L){let M=L.target;M.removeEventListener("dispose",x),I(M)}function E(L){let M=i.get(L);if(M.__webglInit===void 0)return;let z=L.source,Y=f.get(z);if(Y){let K=Y[M.__cacheKey];K.usedTimes--,K.usedTimes===0&&R(L),Object.keys(Y).length===0&&f.delete(z)}i.remove(L)}function R(L){let M=i.get(L);s.deleteTexture(M.__webglTexture);let z=L.source,Y=f.get(z);delete Y[M.__cacheKey],o.memory.textures--}function I(L){let M=i.get(L);if(L.depthTexture&&(L.depthTexture.dispose(),i.remove(L.depthTexture)),L.isWebGLCubeRenderTarget)for(let Y=0;Y<6;Y++){if(Array.isArray(M.__webglFramebuffer[Y]))for(let K=0;K<M.__webglFramebuffer[Y].length;K++)s.deleteFramebuffer(M.__webglFramebuffer[Y][K]);else s.deleteFramebuffer(M.__webglFramebuffer[Y]);M.__webglDepthbuffer&&s.deleteRenderbuffer(M.__webglDepthbuffer[Y])}else{if(Array.isArray(M.__webglFramebuffer))for(let Y=0;Y<M.__webglFramebuffer.length;Y++)s.deleteFramebuffer(M.__webglFramebuffer[Y]);else s.deleteFramebuffer(M.__webglFramebuffer);if(M.__webglDepthbuffer&&s.deleteRenderbuffer(M.__webglDepthbuffer),M.__webglMultisampledFramebuffer&&s.deleteFramebuffer(M.__webglMultisampledFramebuffer),M.__webglColorRenderbuffer)for(let Y=0;Y<M.__webglColorRenderbuffer.length;Y++)M.__webglColorRenderbuffer[Y]&&s.deleteRenderbuffer(M.__webglColorRenderbuffer[Y]);M.__webglDepthRenderbuffer&&s.deleteRenderbuffer(M.__webglDepthRenderbuffer)}let z=L.textures;for(let Y=0,K=z.length;Y<K;Y++){let ot=i.get(z[Y]);ot.__webglTexture&&(s.deleteTexture(ot.__webglTexture),o.memory.textures--),i.remove(z[Y])}i.remove(L)}let D=0;function C(){D=0}function P(){return D}function N(L){D=L}function q(){let L=D;return L>=n.maxTextures&&Dt("WebGLTextures: Trying to use "+(L+1)+" texture units while this GPU supports only "+n.maxTextures),D+=1,L}function W(L){let M=[];return M.push(L.wrapS),M.push(L.wrapT),M.push(L.wrapR||0),M.push(L.magFilter),M.push(L.minFilter),M.push(L.anisotropy),M.push(L.internalFormat),M.push(L.format),M.push(L.type),M.push(L.generateMipmaps),M.push(L.premultiplyAlpha),M.push(L.flipY),M.push(L.unpackAlignment),M.push(L.colorSpace),M.join()}function tt(L,M){let z=i.get(L);if(L.isVideoTexture&&B(L),L.isRenderTargetTexture===!1&&L.isExternalTexture!==!0&&L.version>0&&z.__version!==L.version){let Y=L.image;if(Y===null)Dt("WebGLRenderer: Texture marked for update but no image data found.");else if(Y.complete===!1)Dt("WebGLRenderer: Texture marked for update but image is incomplete");else{at(z,L,M);return}}else L.isExternalTexture&&(z.__webglTexture=L.sourceTexture?L.sourceTexture:null);e.bindTexture(s.TEXTURE_2D,z.__webglTexture,s.TEXTURE0+M)}function k(L,M){let z=i.get(L);if(L.isRenderTargetTexture===!1&&L.version>0&&z.__version!==L.version){at(z,L,M);return}else L.isExternalTexture&&(z.__webglTexture=L.sourceTexture?L.sourceTexture:null);e.bindTexture(s.TEXTURE_2D_ARRAY,z.__webglTexture,s.TEXTURE0+M)}function X(L,M){let z=i.get(L);if(L.isRenderTargetTexture===!1&&L.version>0&&z.__version!==L.version){at(z,L,M);return}e.bindTexture(s.TEXTURE_3D,z.__webglTexture,s.TEXTURE0+M)}function H(L,M){let z=i.get(L);if(L.isCubeDepthTexture!==!0&&L.version>0&&z.__version!==L.version){wt(z,L,M);return}e.bindTexture(s.TEXTURE_CUBE_MAP,z.__webglTexture,s.TEXTURE0+M)}let rt={[Pn]:s.REPEAT,[Di]:s.CLAMP_TO_EDGE,[qr]:s.MIRRORED_REPEAT},lt={[Ne]:s.NEAREST,[bh]:s.NEAREST_MIPMAP_NEAREST,[Ks]:s.NEAREST_MIPMAP_LINEAR,[Ce]:s.LINEAR,[wo]:s.LINEAR_MIPMAP_NEAREST,[Hi]:s.LINEAR_MIPMAP_LINEAR},Ht={[Th]:s.NEVER,[Ih]:s.ALWAYS,[Ah]:s.LESS,[la]:s.LEQUAL,[Ch]:s.EQUAL,[ca]:s.GEQUAL,[Rh]:s.GREATER,[Ph]:s.NOTEQUAL};function Bt(L,M){if(M.type===gi&&t.has("OES_texture_float_linear")===!1&&(M.magFilter===Ce||M.magFilter===wo||M.magFilter===Ks||M.magFilter===Hi||M.minFilter===Ce||M.minFilter===wo||M.minFilter===Ks||M.minFilter===Hi)&&Dt("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(L,s.TEXTURE_WRAP_S,rt[M.wrapS]),s.texParameteri(L,s.TEXTURE_WRAP_T,rt[M.wrapT]),(L===s.TEXTURE_3D||L===s.TEXTURE_2D_ARRAY)&&s.texParameteri(L,s.TEXTURE_WRAP_R,rt[M.wrapR]),s.texParameteri(L,s.TEXTURE_MAG_FILTER,lt[M.magFilter]),s.texParameteri(L,s.TEXTURE_MIN_FILTER,lt[M.minFilter]),M.compareFunction&&(s.texParameteri(L,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(L,s.TEXTURE_COMPARE_FUNC,Ht[M.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(M.magFilter===Ne||M.minFilter!==Ks&&M.minFilter!==Hi||M.type===gi&&t.has("OES_texture_float_linear")===!1)return;if(M.anisotropy>1||i.get(M).__currentAnisotropy){let z=t.get("EXT_texture_filter_anisotropic");s.texParameterf(L,z.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(M.anisotropy,n.getMaxAnisotropy())),i.get(M).__currentAnisotropy=M.anisotropy}}}function zt(L,M){let z=!1;L.__webglInit===void 0&&(L.__webglInit=!0,M.addEventListener("dispose",A));let Y=M.source,K=f.get(Y);K===void 0&&(K={},f.set(Y,K));let ot=W(M);if(ot!==L.__cacheKey){K[ot]===void 0&&(K[ot]={texture:s.createTexture(),usedTimes:0},o.memory.textures++,z=!0),K[ot].usedTimes++;let ct=K[L.__cacheKey];ct!==void 0&&(K[L.__cacheKey].usedTimes--,ct.usedTimes===0&&R(M)),L.__cacheKey=ot,L.__webglTexture=K[ot].texture}return z}function Z(L,M,z){return Math.floor(Math.floor(L/z)/M)}function Q(L,M,z,Y){let ot=L.updateRanges;if(ot.length===0)e.texSubImage2D(s.TEXTURE_2D,0,0,0,M.width,M.height,z,Y,M.data);else{ot.sort((Rt,pt)=>Rt.start-pt.start);let ct=0;for(let Rt=1;Rt<ot.length;Rt++){let pt=ot[ct],ut=ot[Rt],Pt=pt.start+pt.count,Lt=Z(ut.start,M.width,4),Vt=Z(pt.start,M.width,4);ut.start<=Pt+1&&Lt===Vt&&Z(ut.start+ut.count-1,M.width,4)===Lt?pt.count=Math.max(pt.count,ut.start+ut.count-pt.start):(++ct,ot[ct]=ut)}ot.length=ct+1;let j=e.getParameter(s.UNPACK_ROW_LENGTH),it=e.getParameter(s.UNPACK_SKIP_PIXELS),ht=e.getParameter(s.UNPACK_SKIP_ROWS);e.pixelStorei(s.UNPACK_ROW_LENGTH,M.width);for(let Rt=0,pt=ot.length;Rt<pt;Rt++){let ut=ot[Rt],Pt=Math.floor(ut.start/4),Lt=Math.ceil(ut.count/4),Vt=Pt%M.width,F=Math.floor(Pt/M.width),dt=Lt,et=1;e.pixelStorei(s.UNPACK_SKIP_PIXELS,Vt),e.pixelStorei(s.UNPACK_SKIP_ROWS,F),e.texSubImage2D(s.TEXTURE_2D,0,Vt,F,dt,et,z,Y,M.data)}L.clearUpdateRanges(),e.pixelStorei(s.UNPACK_ROW_LENGTH,j),e.pixelStorei(s.UNPACK_SKIP_PIXELS,it),e.pixelStorei(s.UNPACK_SKIP_ROWS,ht)}}function at(L,M,z){let Y=s.TEXTURE_2D;(M.isDataArrayTexture||M.isCompressedArrayTexture)&&(Y=s.TEXTURE_2D_ARRAY),M.isData3DTexture&&(Y=s.TEXTURE_3D);let K=zt(L,M),ot=M.source;e.bindTexture(Y,L.__webglTexture,s.TEXTURE0+z);let ct=i.get(ot);if(ot.version!==ct.__version||K===!0){if(e.activeTexture(s.TEXTURE0+z),(typeof ImageBitmap<"u"&&M.image instanceof ImageBitmap)===!1){let et=Zt.getPrimaries(Zt.workingColorSpace),ft=M.colorSpace===tn?null:Zt.getPrimaries(M.colorSpace),_t=M.colorSpace===tn||et===ft?s.NONE:s.BROWSER_DEFAULT_WEBGL;e.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,M.flipY),e.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),e.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,_t)}e.pixelStorei(s.UNPACK_ALIGNMENT,M.unpackAlignment);let it=m(M.image,!1,n.maxTextureSize);it=ke(M,it);let ht=r.convert(M.format,M.colorSpace),Rt=r.convert(M.type),pt=y(M.internalFormat,ht,Rt,M.normalized,M.colorSpace,M.isVideoTexture);Bt(Y,M);let ut,Pt=M.mipmaps,Lt=M.isVideoTexture!==!0,Vt=ct.__version===void 0||K===!0,F=ot.dataReady,dt=S(M,it);if(M.isDepthTexture)pt=v(M.format===vn,M.type),Vt&&(Lt?e.texStorage2D(s.TEXTURE_2D,1,pt,it.width,it.height):e.texImage2D(s.TEXTURE_2D,0,pt,it.width,it.height,0,ht,Rt,null));else if(M.isDataTexture)if(Pt.length>0){Lt&&Vt&&e.texStorage2D(s.TEXTURE_2D,dt,pt,Pt[0].width,Pt[0].height);for(let et=0,ft=Pt.length;et<ft;et++)ut=Pt[et],Lt?F&&e.texSubImage2D(s.TEXTURE_2D,et,0,0,ut.width,ut.height,ht,Rt,ut.data):e.texImage2D(s.TEXTURE_2D,et,pt,ut.width,ut.height,0,ht,Rt,ut.data);M.generateMipmaps=!1}else Lt?(Vt&&e.texStorage2D(s.TEXTURE_2D,dt,pt,it.width,it.height),F&&Q(M,it,ht,Rt)):e.texImage2D(s.TEXTURE_2D,0,pt,it.width,it.height,0,ht,Rt,it.data);else if(M.isCompressedTexture)if(M.isCompressedArrayTexture){Lt&&Vt&&e.texStorage3D(s.TEXTURE_2D_ARRAY,dt,pt,Pt[0].width,Pt[0].height,it.depth);for(let et=0,ft=Pt.length;et<ft;et++)if(ut=Pt[et],M.format!==oi)if(ht!==null)if(Lt){if(F)if(M.layerUpdates.size>0){let _t=zl(ut.width,ut.height,M.format,M.type);for(let nt of M.layerUpdates){let It=ut.data.subarray(nt*_t/ut.data.BYTES_PER_ELEMENT,(nt+1)*_t/ut.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,et,0,0,nt,ut.width,ut.height,1,ht,It)}}else e.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,et,0,0,0,ut.width,ut.height,it.depth,ht,ut.data)}else e.compressedTexImage3D(s.TEXTURE_2D_ARRAY,et,pt,ut.width,ut.height,it.depth,0,ut.data,0,0);else Dt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Lt?F&&e.texSubImage3D(s.TEXTURE_2D_ARRAY,et,0,0,0,ut.width,ut.height,it.depth,ht,Rt,ut.data):e.texImage3D(s.TEXTURE_2D_ARRAY,et,pt,ut.width,ut.height,it.depth,0,ht,Rt,ut.data);M.layerUpdates.size>0&&M.clearLayerUpdates()}else{Lt&&Vt&&e.texStorage2D(s.TEXTURE_2D,dt,pt,Pt[0].width,Pt[0].height);for(let et=0,ft=Pt.length;et<ft;et++)ut=Pt[et],M.format!==oi?ht!==null?Lt?F&&e.compressedTexSubImage2D(s.TEXTURE_2D,et,0,0,ut.width,ut.height,ht,ut.data):e.compressedTexImage2D(s.TEXTURE_2D,et,pt,ut.width,ut.height,0,ut.data):Dt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Lt?F&&e.texSubImage2D(s.TEXTURE_2D,et,0,0,ut.width,ut.height,ht,Rt,ut.data):e.texImage2D(s.TEXTURE_2D,et,pt,ut.width,ut.height,0,ht,Rt,ut.data)}else if(M.isDataArrayTexture)if(Lt){if(Vt&&e.texStorage3D(s.TEXTURE_2D_ARRAY,dt,pt,it.width,it.height,it.depth),F)if(M.layerUpdates.size>0){let et=zl(it.width,it.height,M.format,M.type);for(let ft of M.layerUpdates){let _t=it.data.subarray(ft*et/it.data.BYTES_PER_ELEMENT,(ft+1)*et/it.data.BYTES_PER_ELEMENT);e.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,ft,it.width,it.height,1,ht,Rt,_t)}M.clearLayerUpdates()}else e.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,it.width,it.height,it.depth,ht,Rt,it.data)}else e.texImage3D(s.TEXTURE_2D_ARRAY,0,pt,it.width,it.height,it.depth,0,ht,Rt,it.data);else if(M.isData3DTexture)Lt?(Vt&&e.texStorage3D(s.TEXTURE_3D,dt,pt,it.width,it.height,it.depth),F&&e.texSubImage3D(s.TEXTURE_3D,0,0,0,0,it.width,it.height,it.depth,ht,Rt,it.data)):e.texImage3D(s.TEXTURE_3D,0,pt,it.width,it.height,it.depth,0,ht,Rt,it.data);else if(M.isFramebufferTexture){if(Vt)if(Lt)e.texStorage2D(s.TEXTURE_2D,dt,pt,it.width,it.height);else{let et=it.width,ft=it.height;for(let _t=0;_t<dt;_t++)e.texImage2D(s.TEXTURE_2D,_t,pt,et,ft,0,ht,Rt,null),et>>=1,ft>>=1}}else if(M.isHTMLTexture){if("texElementImage2D"in s){let et=s.canvas;if(et.hasAttribute("layoutsubtree")||et.setAttribute("layoutsubtree","true"),it.parentNode!==et){et.appendChild(it),d.add(M),et.onpaint=ft=>{let _t=ft.changedElements;for(let nt of d)_t.includes(nt.image)&&(nt.needsUpdate=!0)},et.requestPaint();return}if(s.texElementImage2D.length===3)s.texElementImage2D(s.TEXTURE_2D,s.RGBA8,it);else{let _t=s.RGBA,nt=s.RGBA,It=s.UNSIGNED_BYTE;s.texElementImage2D(s.TEXTURE_2D,0,_t,nt,It,it)}s.texParameteri(s.TEXTURE_2D,s.TEXTURE_MIN_FILTER,s.LINEAR),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_S,s.CLAMP_TO_EDGE),s.texParameteri(s.TEXTURE_2D,s.TEXTURE_WRAP_T,s.CLAMP_TO_EDGE)}}else if(Pt.length>0){if(Lt&&Vt){let et=ae(Pt[0]);e.texStorage2D(s.TEXTURE_2D,dt,pt,et.width,et.height)}for(let et=0,ft=Pt.length;et<ft;et++)ut=Pt[et],Lt?F&&e.texSubImage2D(s.TEXTURE_2D,et,0,0,ht,Rt,ut):e.texImage2D(s.TEXTURE_2D,et,pt,ht,Rt,ut);M.generateMipmaps=!1}else if(Lt){if(Vt){let et=ae(it);e.texStorage2D(s.TEXTURE_2D,dt,pt,et.width,et.height)}F&&e.texSubImage2D(s.TEXTURE_2D,0,0,0,ht,Rt,it)}else e.texImage2D(s.TEXTURE_2D,0,pt,ht,Rt,it);p(M)&&b(Y),ct.__version=ot.version,M.onUpdate&&M.onUpdate(M)}L.__version=M.version}function wt(L,M,z){if(M.image.length!==6)return;let Y=zt(L,M),K=M.source;e.bindTexture(s.TEXTURE_CUBE_MAP,L.__webglTexture,s.TEXTURE0+z);let ot=i.get(K);if(K.version!==ot.__version||Y===!0){e.activeTexture(s.TEXTURE0+z);let ct=Zt.getPrimaries(Zt.workingColorSpace),j=M.colorSpace===tn?null:Zt.getPrimaries(M.colorSpace),it=M.colorSpace===tn||ct===j?s.NONE:s.BROWSER_DEFAULT_WEBGL;e.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,M.flipY),e.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),e.pixelStorei(s.UNPACK_ALIGNMENT,M.unpackAlignment),e.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,it);let ht=M.isCompressedTexture||M.image[0].isCompressedTexture,Rt=M.image[0]&&M.image[0].isDataTexture,pt=[];for(let nt=0;nt<6;nt++)!ht&&!Rt?pt[nt]=m(M.image[nt],!0,n.maxCubemapSize):pt[nt]=Rt?M.image[nt].image:M.image[nt],pt[nt]=ke(M,pt[nt]);let ut=pt[0],Pt=r.convert(M.format,M.colorSpace),Lt=r.convert(M.type),Vt=y(M.internalFormat,Pt,Lt,M.normalized,M.colorSpace),F=M.isVideoTexture!==!0,dt=ot.__version===void 0||Y===!0,et=K.dataReady,ft=S(M,ut);Bt(s.TEXTURE_CUBE_MAP,M);let _t;if(ht){F&&dt&&e.texStorage2D(s.TEXTURE_CUBE_MAP,ft,Vt,ut.width,ut.height);for(let nt=0;nt<6;nt++){_t=pt[nt].mipmaps;for(let It=0;It<_t.length;It++){let Et=_t[It];M.format!==oi?Pt!==null?F?et&&e.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+nt,It,0,0,Et.width,Et.height,Pt,Et.data):e.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+nt,It,Vt,Et.width,Et.height,0,Et.data):Dt("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):F?et&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+nt,It,0,0,Et.width,Et.height,Pt,Lt,Et.data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+nt,It,Vt,Et.width,Et.height,0,Pt,Lt,Et.data)}}}else{if(_t=M.mipmaps,F&&dt){_t.length>0&&ft++;let nt=ae(pt[0]);e.texStorage2D(s.TEXTURE_CUBE_MAP,ft,Vt,nt.width,nt.height)}for(let nt=0;nt<6;nt++)if(Rt){F?et&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+nt,0,0,0,pt[nt].width,pt[nt].height,Pt,Lt,pt[nt].data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+nt,0,Vt,pt[nt].width,pt[nt].height,0,Pt,Lt,pt[nt].data);for(let It=0;It<_t.length;It++){let ue=_t[It].image[nt].image;F?et&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+nt,It+1,0,0,ue.width,ue.height,Pt,Lt,ue.data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+nt,It+1,Vt,ue.width,ue.height,0,Pt,Lt,ue.data)}}else{F?et&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+nt,0,0,0,Pt,Lt,pt[nt]):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+nt,0,Vt,Pt,Lt,pt[nt]);for(let It=0;It<_t.length;It++){let Et=_t[It];F?et&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+nt,It+1,0,0,Pt,Lt,Et.image[nt]):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+nt,It+1,Vt,Pt,Lt,Et.image[nt])}}}p(M)&&b(s.TEXTURE_CUBE_MAP),ot.__version=K.version,M.onUpdate&&M.onUpdate(M)}L.__version=M.version}function st(L,M,z,Y,K,ot){let ct=r.convert(z.format,z.colorSpace),j=r.convert(z.type),it=y(z.internalFormat,ct,j,z.normalized,z.colorSpace),ht=i.get(M),Rt=i.get(z);if(Rt.__renderTarget=M,!ht.__hasExternalTextures){let pt=Math.max(1,M.width>>ot),ut=Math.max(1,M.height>>ot);K===s.TEXTURE_3D||K===s.TEXTURE_2D_ARRAY?e.texImage3D(K,ot,it,pt,ut,M.depth,0,ct,j,null):e.texImage2D(K,ot,it,pt,ut,0,ct,j,null)}e.bindFramebuffer(s.FRAMEBUFFER,L),we(M)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,Y,K,Rt.__webglTexture,0,ye(M)):(K===s.TEXTURE_2D||K>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&K<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,Y,K,Rt.__webglTexture,ot),e.bindFramebuffer(s.FRAMEBUFFER,null)}function Tt(L,M,z){if(s.bindRenderbuffer(s.RENDERBUFFER,L),M.depthBuffer){let Y=M.depthTexture,K=Y&&Y.isDepthTexture?Y.type:null,ot=v(M.stencilBuffer,K),ct=M.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;we(M)?a.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,ye(M),ot,M.width,M.height):z?s.renderbufferStorageMultisample(s.RENDERBUFFER,ye(M),ot,M.width,M.height):s.renderbufferStorage(s.RENDERBUFFER,ot,M.width,M.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,ct,s.RENDERBUFFER,L)}else{let Y=M.textures;for(let K=0;K<Y.length;K++){let ot=Y[K],ct=r.convert(ot.format,ot.colorSpace),j=r.convert(ot.type),it=y(ot.internalFormat,ct,j,ot.normalized,ot.colorSpace);we(M)?a.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,ye(M),it,M.width,M.height):z?s.renderbufferStorageMultisample(s.RENDERBUFFER,ye(M),it,M.width,M.height):s.renderbufferStorage(s.RENDERBUFFER,it,M.width,M.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function Yt(L,M,z){let Y=M.isWebGLCubeRenderTarget===!0;if(e.bindFramebuffer(s.FRAMEBUFFER,L),!(M.depthTexture&&M.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let K=i.get(M.depthTexture);if(K.__renderTarget=M,(!K.__webglTexture||M.depthTexture.image.width!==M.width||M.depthTexture.image.height!==M.height)&&(M.depthTexture.image.width=M.width,M.depthTexture.image.height=M.height,M.depthTexture.needsUpdate=!0),Y){if(K.__webglInit===void 0&&(K.__webglInit=!0,M.depthTexture.addEventListener("dispose",A)),K.__webglTexture===void 0){K.__webglTexture=s.createTexture(),e.bindTexture(s.TEXTURE_CUBE_MAP,K.__webglTexture),Bt(s.TEXTURE_CUBE_MAP,M.depthTexture);let ht=r.convert(M.depthTexture.format),Rt=r.convert(M.depthTexture.type),pt;M.depthTexture.format===Ni?pt=s.DEPTH_COMPONENT24:M.depthTexture.format===vn&&(pt=s.DEPTH24_STENCIL8);for(let ut=0;ut<6;ut++)s.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ut,0,pt,M.width,M.height,0,ht,Rt,null)}}else tt(M.depthTexture,0);let ot=K.__webglTexture,ct=ye(M),j=Y?s.TEXTURE_CUBE_MAP_POSITIVE_X+z:s.TEXTURE_2D,it=M.depthTexture.format===vn?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;if(M.depthTexture.format===Ni)we(M)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,it,j,ot,0,ct):s.framebufferTexture2D(s.FRAMEBUFFER,it,j,ot,0);else if(M.depthTexture.format===vn)we(M)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,it,j,ot,0,ct):s.framebufferTexture2D(s.FRAMEBUFFER,it,j,ot,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function Ut(L){let M=i.get(L),z=L.isWebGLCubeRenderTarget===!0;if(M.__boundDepthTexture!==L.depthTexture){let Y=L.depthTexture;if(M.__depthDisposeCallback&&M.__depthDisposeCallback(),Y){let K=()=>{delete M.__boundDepthTexture,delete M.__depthDisposeCallback,Y.removeEventListener("dispose",K)};Y.addEventListener("dispose",K),M.__depthDisposeCallback=K}M.__boundDepthTexture=Y}if(L.depthTexture&&!M.__autoAllocateDepthBuffer)if(z)for(let Y=0;Y<6;Y++)Yt(M.__webglFramebuffer[Y],L,Y);else{let Y=L.texture.mipmaps;Y&&Y.length>0?Yt(M.__webglFramebuffer[0],L,0):Yt(M.__webglFramebuffer,L,0)}else if(z){M.__webglDepthbuffer=[];for(let Y=0;Y<6;Y++)if(e.bindFramebuffer(s.FRAMEBUFFER,M.__webglFramebuffer[Y]),M.__webglDepthbuffer[Y]===void 0)M.__webglDepthbuffer[Y]=s.createRenderbuffer(),Tt(M.__webglDepthbuffer[Y],L,!1);else{let K=L.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,ot=M.__webglDepthbuffer[Y];s.bindRenderbuffer(s.RENDERBUFFER,ot),s.framebufferRenderbuffer(s.FRAMEBUFFER,K,s.RENDERBUFFER,ot)}}else{let Y=L.texture.mipmaps;if(Y&&Y.length>0?e.bindFramebuffer(s.FRAMEBUFFER,M.__webglFramebuffer[0]):e.bindFramebuffer(s.FRAMEBUFFER,M.__webglFramebuffer),M.__webglDepthbuffer===void 0)M.__webglDepthbuffer=s.createRenderbuffer(),Tt(M.__webglDepthbuffer,L,!1);else{let K=L.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,ot=M.__webglDepthbuffer;s.bindRenderbuffer(s.RENDERBUFFER,ot),s.framebufferRenderbuffer(s.FRAMEBUFFER,K,s.RENDERBUFFER,ot)}}e.bindFramebuffer(s.FRAMEBUFFER,null)}function Ot(L,M,z){let Y=i.get(L);M!==void 0&&st(Y.__webglFramebuffer,L,L.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),z!==void 0&&Ut(L)}function jt(L){let M=L.texture,z=i.get(L),Y=i.get(M);L.addEventListener("dispose",x);let K=L.textures,ot=L.isWebGLCubeRenderTarget===!0,ct=K.length>1;if(ct||(Y.__webglTexture===void 0&&(Y.__webglTexture=s.createTexture()),Y.__version=M.version,o.memory.textures++),ot){z.__webglFramebuffer=[];for(let j=0;j<6;j++)if(M.mipmaps&&M.mipmaps.length>0){z.__webglFramebuffer[j]=[];for(let it=0;it<M.mipmaps.length;it++)z.__webglFramebuffer[j][it]=s.createFramebuffer()}else z.__webglFramebuffer[j]=s.createFramebuffer()}else{if(M.mipmaps&&M.mipmaps.length>0){z.__webglFramebuffer=[];for(let j=0;j<M.mipmaps.length;j++)z.__webglFramebuffer[j]=s.createFramebuffer()}else z.__webglFramebuffer=s.createFramebuffer();if(ct)for(let j=0,it=K.length;j<it;j++){let ht=i.get(K[j]);ht.__webglTexture===void 0&&(ht.__webglTexture=s.createTexture(),o.memory.textures++)}if(L.samples>0&&we(L)===!1){z.__webglMultisampledFramebuffer=s.createFramebuffer(),z.__webglColorRenderbuffer=[],e.bindFramebuffer(s.FRAMEBUFFER,z.__webglMultisampledFramebuffer);for(let j=0;j<K.length;j++){let it=K[j];z.__webglColorRenderbuffer[j]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,z.__webglColorRenderbuffer[j]);let ht=r.convert(it.format,it.colorSpace),Rt=r.convert(it.type),pt=y(it.internalFormat,ht,Rt,it.normalized,it.colorSpace,L.isXRRenderTarget===!0),ut=ye(L);s.renderbufferStorageMultisample(s.RENDERBUFFER,ut,pt,L.width,L.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+j,s.RENDERBUFFER,z.__webglColorRenderbuffer[j])}s.bindRenderbuffer(s.RENDERBUFFER,null),L.depthBuffer&&(z.__webglDepthRenderbuffer=s.createRenderbuffer(),Tt(z.__webglDepthRenderbuffer,L,!0)),e.bindFramebuffer(s.FRAMEBUFFER,null)}}if(ot){e.bindTexture(s.TEXTURE_CUBE_MAP,Y.__webglTexture),Bt(s.TEXTURE_CUBE_MAP,M);for(let j=0;j<6;j++)if(M.mipmaps&&M.mipmaps.length>0)for(let it=0;it<M.mipmaps.length;it++)st(z.__webglFramebuffer[j][it],L,M,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+j,it);else st(z.__webglFramebuffer[j],L,M,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+j,0);p(M)&&b(s.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(ct){for(let j=0,it=K.length;j<it;j++){let ht=K[j],Rt=i.get(ht),pt=s.TEXTURE_2D;(L.isWebGL3DRenderTarget||L.isWebGLArrayRenderTarget)&&(pt=L.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),e.bindTexture(pt,Rt.__webglTexture),Bt(pt,ht),st(z.__webglFramebuffer,L,ht,s.COLOR_ATTACHMENT0+j,pt,0),p(ht)&&b(pt)}e.unbindTexture()}else{let j=s.TEXTURE_2D;if((L.isWebGL3DRenderTarget||L.isWebGLArrayRenderTarget)&&(j=L.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),e.bindTexture(j,Y.__webglTexture),Bt(j,M),M.mipmaps&&M.mipmaps.length>0)for(let it=0;it<M.mipmaps.length;it++)st(z.__webglFramebuffer[it],L,M,s.COLOR_ATTACHMENT0,j,it);else st(z.__webglFramebuffer,L,M,s.COLOR_ATTACHMENT0,j,0);p(M)&&b(j),e.unbindTexture()}L.depthBuffer&&Ut(L)}function Gt(L){let M=L.textures;for(let z=0,Y=M.length;z<Y;z++){let K=M[z];if(p(K)){let ot=T(L),ct=i.get(K).__webglTexture;e.bindTexture(ot,ct),b(ot),e.unbindTexture()}}}let le=[],Me=[];function ii(L){if(L.samples>0){if(we(L)===!1){let M=L.textures,z=L.width,Y=L.height,K=s.COLOR_BUFFER_BIT,ot=L.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,ct=i.get(L),j=M.length>1;if(j)for(let ht=0;ht<M.length;ht++)e.bindFramebuffer(s.FRAMEBUFFER,ct.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+ht,s.RENDERBUFFER,null),e.bindFramebuffer(s.FRAMEBUFFER,ct.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+ht,s.TEXTURE_2D,null,0);e.bindFramebuffer(s.READ_FRAMEBUFFER,ct.__webglMultisampledFramebuffer);let it=L.texture.mipmaps;it&&it.length>0?e.bindFramebuffer(s.DRAW_FRAMEBUFFER,ct.__webglFramebuffer[0]):e.bindFramebuffer(s.DRAW_FRAMEBUFFER,ct.__webglFramebuffer);for(let ht=0;ht<M.length;ht++){if(L.resolveDepthBuffer&&(L.depthBuffer&&(K|=s.DEPTH_BUFFER_BIT),L.stencilBuffer&&L.resolveStencilBuffer&&(K|=s.STENCIL_BUFFER_BIT)),j){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,ct.__webglColorRenderbuffer[ht]);let Rt=i.get(M[ht]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,Rt,0)}s.blitFramebuffer(0,0,z,Y,0,0,z,Y,K,s.NEAREST),l===!0&&(le.length=0,Me.length=0,le.push(s.COLOR_ATTACHMENT0+ht),L.depthBuffer&&L.storeMultisampledDepthBuffer===!1&&(le.push(ot),Me.push(ot),s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,Me)),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,le))}if(e.bindFramebuffer(s.READ_FRAMEBUFFER,null),e.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),j)for(let ht=0;ht<M.length;ht++){e.bindFramebuffer(s.FRAMEBUFFER,ct.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+ht,s.RENDERBUFFER,ct.__webglColorRenderbuffer[ht]);let Rt=i.get(M[ht]).__webglTexture;e.bindFramebuffer(s.FRAMEBUFFER,ct.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+ht,s.TEXTURE_2D,Rt,0)}e.bindFramebuffer(s.DRAW_FRAMEBUFFER,ct.__webglMultisampledFramebuffer)}else if(L.depthBuffer&&L.storeMultisampledDepthBuffer===!1&&l){let M=L.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[M])}}}function ye(L){return Math.min(n.maxSamples,L.samples)}function we(L){let M=i.get(L);return L.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&M.__useRenderToTexture!==!1}function B(L){let M=o.render.frame;h.get(L)!==M&&(h.set(L,M),L.update())}function ke(L,M){let z=L.colorSpace,Y=L.format,K=L.type;return L.isCompressedTexture===!0||L.isVideoTexture===!0||z!==Ps&&z!==tn&&(Zt.getTransfer(z)===oe?(Y!==oi||K!==ri)&&Dt("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Ft("WebGLTextures: Unsupported texture color space:",z)),M}function ae(L){return typeof HTMLImageElement<"u"&&L instanceof HTMLImageElement?(c.width=L.naturalWidth||L.width,c.height=L.naturalHeight||L.height):typeof VideoFrame<"u"&&L instanceof VideoFrame?(c.width=L.displayWidth,c.height=L.displayHeight):(c.width=L.width,c.height=L.height),c}this.allocateTextureUnit=q,this.resetTextureUnits=C,this.getTextureUnits=P,this.setTextureUnits=N,this.setTexture2D=tt,this.setTexture2DArray=k,this.setTexture3D=X,this.setTextureCube=H,this.rebindTextures=Ot,this.setupRenderTarget=jt,this.updateRenderTargetMipmap=Gt,this.updateMultisampleRenderTarget=ii,this.setupDepthRenderbuffer=Ut,this.setupFrameBufferTexture=st,this.useMultisampledRTT=we,this.isReversedDepthBuffer=function(){return e.buffers.depth.getReversed()}}function tg(s,t){function e(i,n=tn){let r,o=Zt.getTransfer(n);if(i===ri)return s.UNSIGNED_BYTE;if(i===To)return s.UNSIGNED_SHORT_4_4_4_4;if(i===Ao)return s.UNSIGNED_SHORT_5_5_5_1;if(i===Pl)return s.UNSIGNED_INT_5_9_9_9_REV;if(i===Il)return s.UNSIGNED_INT_10F_11F_11F_REV;if(i===Cl)return s.BYTE;if(i===Rl)return s.SHORT;if(i===fs)return s.UNSIGNED_SHORT;if(i===Eo)return s.INT;if(i===Ti)return s.UNSIGNED_INT;if(i===gi)return s.FLOAT;if(i===Ai)return s.HALF_FLOAT;if(i===Ll)return s.ALPHA;if(i===Dl)return s.RGB;if(i===oi)return s.RGBA;if(i===Ni)return s.DEPTH_COMPONENT;if(i===vn)return s.DEPTH_STENCIL;if(i===Co)return s.RED;if(i===Ro)return s.RED_INTEGER;if(i===Mn)return s.RG;if(i===Po)return s.RG_INTEGER;if(i===Io)return s.RGBA_INTEGER;if(i===Qs||i===js||i===tr||i===er)if(o===oe)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===Qs)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===js)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===tr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===er)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===Qs)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===js)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===tr)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===er)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Lo||i===Do||i===No||i===Uo)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===Lo)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===Do)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===No)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Uo)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===Fo||i===Bo||i===Oo||i===zo||i===ko||i===ir||i===Ho)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(i===Fo||i===Bo)return o===oe?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===Oo)return o===oe?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(i===zo)return r.COMPRESSED_R11_EAC;if(i===ko)return r.COMPRESSED_SIGNED_R11_EAC;if(i===ir)return r.COMPRESSED_RG11_EAC;if(i===Ho)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===Go||i===Vo||i===Wo||i===Xo||i===qo||i===Yo||i===$o||i===Zo||i===Jo||i===Ko||i===Qo||i===jo||i===ta||i===ea)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(i===Go)return o===oe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===Vo)return o===oe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===Wo)return o===oe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===Xo)return o===oe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===qo)return o===oe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===Yo)return o===oe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===$o)return o===oe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===Zo)return o===oe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===Jo)return o===oe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===Ko)return o===oe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===Qo)return o===oe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===jo)return o===oe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===ta)return o===oe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===ea)return o===oe?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===ia||i===na||i===sa)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(i===ia)return o===oe?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===na)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===sa)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===ra||i===oa||i===nr||i===aa)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(i===ra)return r.COMPRESSED_RED_RGTC1_EXT;if(i===oa)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===nr)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===aa)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===ps?s.UNSIGNED_INT_24_8:s[i]!==void 0?s[i]:null}return{convert:e}}var eg=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,ig=`
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

}`,sc=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){let i=new zs(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=i}}getMesh(t){if(this.texture!==null&&this.mesh===null){let e=t.cameras[0].viewport,i=new Re({vertexShader:eg,fragmentShader:ig,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new Ct(new Hs(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},rc=class extends Ui{constructor(t,e){super();let i=this,n=null,r=1,o=null,a="local-floor",l=1,c=null,h=null,d=null,u=null,f=null,g=null,_=typeof XRWebGLBinding<"u",m=new sc,p={},b=e.getContextAttributes(),T=null,y=null,v=[],S=[],A=new Wt,x=null,E=null,R=new We;R.viewport=new xe;let I=new We;I.viewport=new xe;let D=[R,I],C=new vo,P=null,N=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Z){let Q=v[Z];return Q===void 0&&(Q=new cs,v[Z]=Q),Q.getTargetRaySpace()},this.getControllerGrip=function(Z){let Q=v[Z];return Q===void 0&&(Q=new cs,v[Z]=Q),Q.getGripSpace()},this.getHand=function(Z){let Q=v[Z];return Q===void 0&&(Q=new cs,v[Z]=Q),Q.getHandSpace()};function q(Z){let Q=S.indexOf(Z.inputSource);if(Q===-1)return;let at=v[Q];at!==void 0&&(at.update(Z.inputSource,Z.frame,c||o),at.dispatchEvent({type:Z.type,data:Z.inputSource}))}function W(){n.removeEventListener("select",q),n.removeEventListener("selectstart",q),n.removeEventListener("selectend",q),n.removeEventListener("squeeze",q),n.removeEventListener("squeezestart",q),n.removeEventListener("squeezeend",q),n.removeEventListener("end",W),n.removeEventListener("inputsourceschange",tt);for(let Z=0;Z<v.length;Z++){let Q=S[Z];Q!==null&&(S[Z]=null,v[Z].disconnect(Q))}P=null,N=null,m.reset();for(let Z in p)delete p[Z];if(t.setRenderTarget(T),f=null,u=null,d=null,n=null,y=null,zt.stop(),i.isPresenting=!1,t.setPixelRatio(x),t.setSize(A.width,A.height,!1),E!==null){let Z=E.camera;Z.fov=E.fov,Z.zoom=E.zoom,Z.updateProjectionMatrix(),E=null}i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Z){r=Z,i.isPresenting===!0&&Dt("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Z){a=Z,i.isPresenting===!0&&Dt("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(Z){c=Z},this.getBaseLayer=function(){return u!==null?u:f},this.getBinding=function(){return d===null&&_&&(d=new XRWebGLBinding(n,e)),d},this.getFrame=function(){return g},this.getSession=function(){return n},this.setSession=async function(Z){if(n=Z,n!==null){if(T=t.getRenderTarget(),n.addEventListener("select",q),n.addEventListener("selectstart",q),n.addEventListener("selectend",q),n.addEventListener("squeeze",q),n.addEventListener("squeezestart",q),n.addEventListener("squeezeend",q),n.addEventListener("end",W),n.addEventListener("inputsourceschange",tt),b.xrCompatible!==!0&&await e.makeXRCompatible(),x=t.getPixelRatio(),t.getSize(A),_&&"createProjectionLayer"in XRWebGLBinding.prototype){let at=null,wt=null,st=null;b.depth&&(st=b.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,at=b.stencil?vn:Ni,wt=b.stencil?ps:Ti);let Tt={colorFormat:e.RGBA8,depthFormat:st,scaleFactor:r};d=this.getBinding(),u=d.createProjectionLayer(Tt),n.updateRenderState({layers:[u]}),t.setPixelRatio(1),t.setSize(u.textureWidth,u.textureHeight,!1),y=new si(u.textureWidth,u.textureHeight,{format:oi,type:ri,depthTexture:new fn(u.textureWidth,u.textureHeight,wt,void 0,void 0,void 0,void 0,void 0,void 0,at),stencilBuffer:b.stencil,colorSpace:t.outputColorSpace,samples:b.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1,storeMultisampledDepthBuffer:u.ignoreDepthValues===!1,storeMultisampledStencilBuffer:u.ignoreDepthValues===!1})}else{let at={antialias:b.antialias,alpha:!0,depth:b.depth,stencil:b.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(n,e,at),n.updateRenderState({baseLayer:f}),t.setPixelRatio(1),t.setSize(f.framebufferWidth,f.framebufferHeight,!1),y=new si(f.framebufferWidth,f.framebufferHeight,{format:oi,type:ri,colorSpace:t.outputColorSpace,stencilBuffer:b.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await n.requestReferenceSpace(a),zt.setContext(n),zt.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(n!==null)return n.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function tt(Z){for(let Q=0;Q<Z.removed.length;Q++){let at=Z.removed[Q],wt=S.indexOf(at);wt>=0&&(S[wt]=null,v[wt].disconnect(at))}for(let Q=0;Q<Z.added.length;Q++){let at=Z.added[Q],wt=S.indexOf(at);if(wt===-1){for(let Tt=0;Tt<v.length;Tt++)if(Tt>=S.length){S.push(at),wt=Tt;break}else if(S[Tt]===null){S[Tt]=at,wt=Tt;break}if(wt===-1)break}let st=v[wt];st&&st.connect(at)}}let k=new O,X=new O;function H(Z,Q,at){k.setFromMatrixPosition(Q.matrixWorld),X.setFromMatrixPosition(at.matrixWorld);let wt=k.distanceTo(X),st=Q.projectionMatrix.elements,Tt=at.projectionMatrix.elements,Yt=st[14]/(st[10]-1),Ut=st[14]/(st[10]+1),Ot=(st[9]+1)/st[5],jt=(st[9]-1)/st[5],Gt=(st[8]-1)/st[0],le=(Tt[8]+1)/Tt[0],Me=Yt*Gt,ii=Yt*le,ye=wt/(-Gt+le),we=ye*-Gt;if(Q.matrixWorld.decompose(Z.position,Z.quaternion,Z.scale),Z.translateX(we),Z.translateZ(ye),Z.matrixWorld.compose(Z.position,Z.quaternion,Z.scale),Z.matrixWorldInverse.copy(Z.matrixWorld).invert(),st[10]===-1)Z.projectionMatrix.copy(Q.projectionMatrix),Z.projectionMatrixInverse.copy(Q.projectionMatrixInverse);else{let B=Yt+ye,ke=Ut+ye,ae=Me-we,L=ii+(wt-we),M=Ot*Ut/ke*B,z=jt*Ut/ke*B;Z.projectionMatrix.makePerspective(ae,L,M,z,B,ke),Z.projectionMatrixInverse.copy(Z.projectionMatrix).invert()}}function rt(Z,Q){Q===null?Z.matrixWorld.copy(Z.matrix):Z.matrixWorld.multiplyMatrices(Q.matrixWorld,Z.matrix),Z.matrixWorldInverse.copy(Z.matrixWorld).invert()}this.updateCamera=function(Z){if(n===null)return;let Q=Z.near,at=Z.far;m.texture!==null&&(m.depthNear>0&&(Q=m.depthNear),m.depthFar>0&&(at=m.depthFar)),C.near=I.near=R.near=Q,C.far=I.far=R.far=at,(P!==C.near||N!==C.far)&&(n.updateRenderState({depthNear:C.near,depthFar:C.far}),P=C.near,N=C.far),C.layers.mask=Z.layers.mask|6,R.layers.mask=C.layers.mask&-5,I.layers.mask=C.layers.mask&-3;let wt=Z.parent,st=C.cameras;rt(C,wt);for(let Tt=0;Tt<st.length;Tt++)rt(st[Tt],wt);st.length===2?H(C,R,I):C.projectionMatrix.copy(R.projectionMatrix),E===null&&Z.isPerspectiveCamera&&(E={camera:Z,fov:Z.fov,zoom:Z.zoom}),lt(Z,C,wt)};function lt(Z,Q,at){at===null?Z.matrix.copy(Q.matrixWorld):(Z.matrix.copy(at.matrixWorld),Z.matrix.invert(),Z.matrix.multiply(Q.matrixWorld)),Z.matrix.decompose(Z.position,Z.quaternion,Z.scale),Z.updateMatrixWorld(!0),Z.projectionMatrix.copy(Q.projectionMatrix),Z.projectionMatrixInverse.copy(Q.projectionMatrixInverse),Z.isPerspectiveCamera&&(Z.fov=$r*2*Math.atan(1/Z.projectionMatrix.elements[5]),Z.zoom=1)}this.getCamera=function(){return C},this.getFoveation=function(){if(!(u===null&&f===null))return l},this.setFoveation=function(Z){l=Z,u!==null&&(u.fixedFoveation=Z),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=Z)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(C)},this.getCameraTexture=function(Z){return p[Z]};let Ht=null;function Bt(Z,Q){if(h=Q.getViewerPose(c||o),g=Q,h!==null){let at=h.views;f!==null&&(t.setRenderTargetFramebuffer(y,f.framebuffer),t.setRenderTarget(y));let wt=!1;at.length!==C.cameras.length&&(C.cameras.length=0,wt=!0);for(let Ut=0;Ut<at.length;Ut++){let Ot=at[Ut],jt=null;if(f!==null)jt=f.getViewport(Ot);else{let le=d.getViewSubImage(u,Ot);jt=le.viewport,Ut===0&&(t.setRenderTargetTextures(y,le.colorTexture,le.depthStencilTexture),t.setRenderTarget(y))}let Gt=D[Ut];Gt===void 0&&(Gt=new We,Gt.layers.enable(Ut),Gt.viewport=new xe,D[Ut]=Gt),Gt.matrix.fromArray(Ot.transform.matrix),Gt.matrix.decompose(Gt.position,Gt.quaternion,Gt.scale),Gt.projectionMatrix.fromArray(Ot.projectionMatrix),Gt.projectionMatrixInverse.copy(Gt.projectionMatrix).invert(),Gt.viewport.set(jt.x,jt.y,jt.width,jt.height),Ut===0&&(C.matrix.copy(Gt.matrix),C.matrix.decompose(C.position,C.quaternion,C.scale)),wt===!0&&C.cameras.push(Gt)}let st=n.enabledFeatures;if(st&&st.includes("depth-sensing")&&n.depthUsage=="gpu-optimized"&&_){d=i.getBinding();let Ut=d.getDepthInformation(at[0]);Ut&&Ut.isValid&&Ut.texture&&m.init(Ut,n.renderState)}if(st&&st.includes("camera-access")&&_){t.state.unbindTexture(),d=i.getBinding();for(let Ut=0;Ut<at.length;Ut++){let Ot=at[Ut].camera;if(Ot){let jt=p[Ot];jt||(jt=new zs,p[Ot]=jt);let Gt=d.getCameraImage(Ot);jt.sourceTexture=Gt}}}}for(let at=0;at<v.length;at++){let wt=S[at],st=v[at];wt!==null&&st!==void 0&&st.update(wt,Q,c||o)}Ht&&Ht(Z,Q),Q.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:Q}),g=null}let zt=new lu;zt.setAnimationLoop(Bt),this.setAnimationLoop=function(Z){Ht=Z},this.dispose=function(){}}},ng=new ie,pu=new kt;pu.set(-1,0,0,0,1,0,0,0,1);function sg(s,t){function e(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function i(m,p){p.color.getRGB(m.fogColor.value,Fl(s)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function n(m,p,b,T,y){p.isNodeMaterial?p.uniformsNeedUpdate=!1:p.isMeshBasicMaterial?r(m,p):p.isMeshLambertMaterial?(r(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshToonMaterial?(r(m,p),d(m,p)):p.isMeshPhongMaterial?(r(m,p),h(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshStandardMaterial?(r(m,p),u(m,p),p.isMeshPhysicalMaterial&&f(m,p,y)):p.isMeshMatcapMaterial?(r(m,p),g(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),_(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(o(m,p),p.isLineDashedMaterial&&a(m,p)):p.isPointsMaterial?l(m,p,b,T):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,e(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,e(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===je&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,e(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===je&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,e(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,e(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,e(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);let b=t.get(p),T=b.envMap,y=b.envMapRotation;T&&(m.envMap.value=T,m.envMapRotation.value.setFromMatrix4(ng.makeRotationFromEuler(y)).transpose(),T.isCubeTexture&&T.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(pu),m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,e(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,e(p.aoMap,m.aoMapTransform))}function o(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,e(p.map,m.mapTransform))}function a(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,b,T){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*b,m.scale.value=T*.5,p.map&&(m.map.value=p.map,e(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,e(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function h(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function d(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function u(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,e(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,e(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function f(m,p,b){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,e(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,e(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,e(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,e(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,e(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===je&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.retroreflectivity>0&&(m.retroreflectivity.value=p.retroreflectivity),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,e(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,e(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=b.texture,m.transmissionSamplerSize.value.set(b.width,b.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,e(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,e(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,e(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,e(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,e(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function _(m,p){let b=t.get(p).light;m.referencePosition.value.setFromMatrixPosition(b.matrixWorld),m.nearDistance.value=b.shadow.camera.near,m.farDistance.value=b.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:n}}function rg(s,t,e,i){let n={},r={},o=[],a=s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);function l(y,v){let S=v.program;i.uniformBlockBinding(y,S)}function c(y,v){let S=n[y.id];S===void 0&&(m(y),S=h(y),n[y.id]=S,y.addEventListener("dispose",b));let A=v.program;i.updateUBOMapping(y,A);let x=t.render.frame;r[y.id]!==x&&(u(y),r[y.id]=x)}function h(y){let v=d();y.__bindingPointIndex=v;let S=s.createBuffer(),A=y.__size,x=y.usage;return s.bindBuffer(s.UNIFORM_BUFFER,S),s.bufferData(s.UNIFORM_BUFFER,A,x),s.bindBuffer(s.UNIFORM_BUFFER,null),s.bindBufferBase(s.UNIFORM_BUFFER,v,S),S}function d(){for(let y=0;y<a;y++)if(o.indexOf(y)===-1)return o.push(y),y;return Ft("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(y){let v=n[y.id],S=y.uniforms,A=y.__cache;s.bindBuffer(s.UNIFORM_BUFFER,v);for(let x=0,E=S.length;x<E;x++){let R=S[x];if(Array.isArray(R))for(let I=0,D=R.length;I<D;I++)f(R[I],x,I,A);else f(R,x,0,A)}s.bindBuffer(s.UNIFORM_BUFFER,null)}function f(y,v,S,A){if(_(y,v,S,A)===!0){let x=y.__offset,E=y.value;if(Array.isArray(E)){let R=0;for(let I=0;I<E.length;I++){let D=E[I],C=p(D);g(D,y.__data,R),typeof D!="number"&&typeof D!="boolean"&&!D.isMatrix3&&!ArrayBuffer.isView(D)&&(R+=C.storage/Float32Array.BYTES_PER_ELEMENT)}}else g(E,y.__data,0);s.bufferSubData(s.UNIFORM_BUFFER,x,y.__data)}}function g(y,v,S){typeof y=="number"||typeof y=="boolean"?v[0]=y:y.isMatrix3?(v[0]=y.elements[0],v[1]=y.elements[1],v[2]=y.elements[2],v[3]=0,v[4]=y.elements[3],v[5]=y.elements[4],v[6]=y.elements[5],v[7]=0,v[8]=y.elements[6],v[9]=y.elements[7],v[10]=y.elements[8],v[11]=0):ArrayBuffer.isView(y)?v.set(new y.constructor(y.buffer,y.byteOffset,v.length)):y.toArray(v,S)}function _(y,v,S,A){let x=y.value,E=v+"_"+S;if(A[E]===void 0)return typeof x=="number"||typeof x=="boolean"?A[E]=x:ArrayBuffer.isView(x)?A[E]=x.slice():A[E]=x.clone(),!0;{let R=A[E];if(typeof x=="number"||typeof x=="boolean"){if(R!==x)return A[E]=x,!0}else{if(ArrayBuffer.isView(x))return!0;if(R.equals(x)===!1)return R.copy(x),!0}}return!1}function m(y){let v=y.uniforms,S=0,A=16;for(let E=0,R=v.length;E<R;E++){let I=Array.isArray(v[E])?v[E]:[v[E]];for(let D=0,C=I.length;D<C;D++){let P=I[D],N=Array.isArray(P.value)?P.value:[P.value];for(let q=0,W=N.length;q<W;q++){let tt=N[q],k=p(tt),X=S%A,H=X%k.boundary,rt=X+H;S+=H,rt!==0&&A-rt<k.storage&&(S+=A-rt),P.__data=new Float32Array(k.storage/Float32Array.BYTES_PER_ELEMENT),P.__offset=S,S+=k.storage}}}let x=S%A;return x>0&&(S+=A-x),y.__size=S,y.__cache={},this}function p(y){let v={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(v.boundary=4,v.storage=4):y.isVector2?(v.boundary=8,v.storage=8):y.isVector3||y.isColor?(v.boundary=16,v.storage=12):y.isVector4?(v.boundary=16,v.storage=16):y.isMatrix3?(v.boundary=48,v.storage=48):y.isMatrix4?(v.boundary=64,v.storage=64):y.isTexture?Dt("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(y)?(v.boundary=16,v.storage=y.byteLength):Dt("WebGLRenderer: Unsupported uniform value type.",y),v}function b(y){let v=y.target;v.removeEventListener("dispose",b);let S=o.indexOf(v.__bindingPointIndex);o.splice(S,1),s.deleteBuffer(n[v.id]),delete n[v.id],delete r[v.id]}function T(){for(let y in n)s.deleteBuffer(n[y]);o=[],n={},r={}}return{bind:l,update:c,dispose:T}}var og=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Gi=null;function ag(){return Gi===null&&(Gi=new Ln(og,16,16,Mn,Ai),Gi.name="DFG_LUT",Gi.minFilter=Ce,Gi.magFilter=Ce,Gi.wrapS=Di,Gi.wrapT=Di,Gi.generateMipmaps=!1,Gi.needsUpdate=!0),Gi}var pa=class{constructor(t={}){let{canvas:e=Dh(),context:i=null,depth:n=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:u=!1,outputBufferType:f=ri}=t;this.isWebGLRenderer=!0;let g;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=i.getContextAttributes().alpha}else g=o;let _=f,m=new Set([Io,Po,Ro]),p=new Set([ri,Ti,fs,ps,To,Ao]),b=new Uint32Array(4),T=new Int32Array(4),y=new O,v=null,S=null,A=[],x=[],E=null;this.domElement=e,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Ei,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let R=this,I=!1,D=null,C=null,P=null,N=null;this._outputColorSpace=Je;let q=0,W=0,tt=null,k=-1,X=null,H=new xe,rt=new xe,lt=null,Ht=new yt(0),Bt=0,zt=e.width,Z=e.height,Q=1,at=null,wt=null,st=new xe(0,0,zt,Z),Tt=new xe(0,0,zt,Z),Yt=!1,Ut=new hs,Ot=!1,jt=!1,Gt=new ie,le=new O,Me=new xe,ii={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},ye=!1;function we(){return tt===null?Q:1}let B=i;function ke(w,U){return e.getContext(w,U)}let ae,L,M,z,Y,K,ot,ct,j,it,ht,Rt,pt,ut,Pt,Lt,Vt,F,dt,et,ft,_t,nt;try{let w={alpha:!0,depth:n,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:d};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${"186"}`),e.addEventListener("webglcontextlost",ue,!1),e.addEventListener("webglcontextrestored",se,!1),e.addEventListener("webglcontextcreationerror",_i,!1),B===null){let U="webgl2";if(B=ke(U,w),B===null)throw ke(U)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}It()}catch(w){throw e.removeEventListener("webglcontextlost",ue,!1),e.removeEventListener("webglcontextrestored",se,!1),e.removeEventListener("webglcontextcreationerror",_i,!1),Ft("WebGLRenderer: "+w.message),w}function It(){ae=new pm(B),ae.init(),ft=new tg(B,ae),L=new sm(B,ae,t,ft),M=new Q0(B,ae),L.reversedDepthBuffer&&u&&M.buffers.depth.setReversed(!0),C=B.createFramebuffer(),P=B.createFramebuffer(),N=B.createFramebuffer(),z=new xm(B),Y=new O0,K=new j0(B,ae,M,Y,L,ft,z),ot=new fm(R),ct=new _d(B),_t=new im(B,ct),j=new mm(B,ct,z,_t),it=new ym(B,j,ct,_t,z),F=new _m(B,L,K),Pt=new rm(Y),ht=new B0(R,ot,ae,L,_t,Pt),Rt=new sg(R,Y),pt=new k0,ut=new q0(ae),Vt=new em(R,ot,M,it,g,l),Lt=new K0(R,it,L),nt=new rg(B,z,L,M),dt=new nm(B,ae,z),et=new gm(B,ae,z),z.programs=ht.programs,R.capabilities=L,R.extensions=ae,R.properties=Y,R.renderLists=pt,R.shadowMap=Lt,R.state=M,R.info=z}_!==ri&&(E=new Mm(_,e.width,e.height,a,n,r));let Et=new rc(R,B);this.xr=Et,this.getContext=function(){return B},this.getContextAttributes=function(){return B.getContextAttributes()},this.forceContextLoss=function(){let w=ae.get("WEBGL_lose_context");w&&w.loseContext()},this.forceContextRestore=function(){let w=ae.get("WEBGL_lose_context");w&&w.restoreContext()},this.getPixelRatio=function(){return Q},this.setPixelRatio=function(w){w!==void 0&&(Q=w,this.setSize(zt,Z,!1))},this.getSize=function(w){return w.set(zt,Z)},this.setSize=function(w,U,$=!0){if(Et.isPresenting){Dt("WebGLRenderer: Can't change size while VR device is presenting.");return}zt=w,Z=U,e.width=Math.floor(w*Q),e.height=Math.floor(U*Q),$===!0&&(e.style.width=w+"px",e.style.height=U+"px"),E!==null&&E.setSize(e.width,e.height),this.setViewport(0,0,w,U)},this.getDrawingBufferSize=function(w){return w.set(zt*Q,Z*Q).floor()},this.setDrawingBufferSize=function(w,U,$){zt=w,Z=U,Q=$,e.width=Math.floor(w*$),e.height=Math.floor(U*$),this.setViewport(0,0,w,U)},this.setEffects=function(w){if(_===ri){Ft("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(w){for(let U=0;U<w.length;U++)if(w[U].isOutputPass===!0){Dt("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}E.setEffects(w||[])},this.getCurrentViewport=function(w){return w.copy(H)},this.getViewport=function(w){return w.copy(st)},this.setViewport=function(w,U,$,G){w.isVector4?st.set(w.x,w.y,w.z,w.w):st.set(w,U,$,G),M.viewport(H.copy(st).multiplyScalar(Q).round())},this.getScissor=function(w){return w.copy(Tt)},this.setScissor=function(w,U,$,G){w.isVector4?Tt.set(w.x,w.y,w.z,w.w):Tt.set(w,U,$,G),M.scissor(rt.copy(Tt).multiplyScalar(Q).round())},this.getScissorTest=function(){return Yt},this.setScissorTest=function(w){M.setScissorTest(Yt=w)},this.setOpaqueSort=function(w){at=w},this.setTransparentSort=function(w){wt=w},this.getClearColor=function(w){return w.copy(Vt.getClearColor())},this.setClearColor=function(){Vt.setClearColor(...arguments)},this.getClearAlpha=function(){return Vt.getClearAlpha()},this.setClearAlpha=function(){Vt.setClearAlpha(...arguments)},this.clear=function(w=!0,U=!0,$=!0){let G=0;if(w){let V=!1;if(tt!==null){let xt=tt.texture.format;V=m.has(xt)}if(V){let xt=tt.texture.type,Mt=p.has(xt),gt=Vt.getClearColor(),bt=Vt.getClearAlpha(),At=gt.r,Xt=gt.g,$t=gt.b;Mt?(b[0]=At,b[1]=Xt,b[2]=$t,b[3]=bt,B.clearBufferuiv(B.COLOR,0,b)):(T[0]=At,T[1]=Xt,T[2]=$t,T[3]=bt,B.clearBufferiv(B.COLOR,0,T))}else G|=B.COLOR_BUFFER_BIT}U&&(G|=B.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),$&&(G|=B.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),G!==0&&B.clear(G)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(w){w.setRenderer(this),D=w},this.dispose=function(){e.removeEventListener("webglcontextlost",ue,!1),e.removeEventListener("webglcontextrestored",se,!1),e.removeEventListener("webglcontextcreationerror",_i,!1),Vt.dispose(),pt.dispose(),ut.dispose(),Y.dispose(),ot.dispose(),it.dispose(),_t.dispose(),nt.dispose(),ht.dispose(),Et.dispose(),Et.removeEventListener("sessionstart",fc),Et.removeEventListener("sessionend",pc),wn.stop()};function ue(w){w.preventDefault(),Ul("WebGLRenderer: Context Lost."),I=!0}function se(){Ul("WebGLRenderer: Context Restored."),I=!1;let w=z.autoReset,U=Lt.enabled,$=Lt.autoUpdate,G=Lt.needsUpdate,V=Lt.type;It(),z.autoReset=w,Lt.enabled=U,Lt.autoUpdate=$,Lt.needsUpdate=G,Lt.type=V}function _i(w){Ft("WebGLRenderer: A WebGL context could not be created. Reason: ",w.statusMessage)}function Pi(w){let U=w.target;U.removeEventListener("dispose",Pi),Cu(U)}function Cu(w){Ru(w),Y.remove(w)}function Ru(w){let U=Y.get(w).programs;U!==void 0&&(U.forEach(function($){ht.releaseProgram($)}),w.isShaderMaterial&&ht.releaseShaderCache(w))}this.renderBufferDirect=function(w,U,$,G,V,xt){U===null&&(U=ii);let Mt=V.isMesh&&V.matrixWorld.determinantAffine()<0,gt=Lu(w,U,$,G,V);M.setMaterial(G,Mt);let bt=$.index,At=1;if(G.wireframe===!0){if(bt=j.getWireframeAttribute($),bt===void 0)return;At=2}let Xt=$.drawRange,$t=$.attributes.position,St=Xt.start*At,re=(Xt.start+Xt.count)*At;xt!==null&&(St=Math.max(St,xt.start*At),re=Math.min(re,(xt.start+xt.count)*At)),bt!==null?(St=Math.max(St,0),re=Math.min(re,bt.count)):$t!=null&&(St=Math.max(St,0),re=Math.min(re,$t.count));let Ee=re-St;if(Ee<0||Ee===1/0)return;_t.setup(V,G,gt,$,bt);let me,he=dt;if(bt!==null&&(me=ct.get(bt),he=et,he.setIndex(me)),V.isMesh)G.wireframe===!0?(M.setLineWidth(G.wireframeLinewidth*we()),he.setMode(B.LINES)):he.setMode(B.TRIANGLES);else if(V.isLine){let He=G.linewidth;He===void 0&&(He=1),M.setLineWidth(He*we()),V.isLineSegments?he.setMode(B.LINES):V.isLineLoop?he.setMode(B.LINE_LOOP):he.setMode(B.LINE_STRIP)}else V.isPoints?he.setMode(B.POINTS):V.isSprite&&he.setMode(B.TRIANGLES);if(V.isBatchedMesh)if(ae.get("WEBGL_multi_draw"))he.renderMultiDraw(V._multiDrawStarts,V._multiDrawCounts,V._multiDrawCount);else{let He=V._multiDrawStarts,vt=V._multiDrawCounts,Ze=V._multiDrawCount,te=bt?ct.get(bt).bytesPerElement:1,ui=Y.get(G).currentProgram.getUniforms();for(let Ii=0;Ii<Ze;Ii++)ui.setValue(B,"_gl_DrawID",Ii),he.render(He[Ii]/te,vt[Ii])}else if(V.isInstancedMesh)he.renderInstances(St,Ee,V.count);else if($.isInstancedBufferGeometry){let He=$._maxInstanceCount!==void 0?$._maxInstanceCount:1/0,vt=Math.min($.instanceCount,He);he.renderInstances(St,Ee,vt)}else he.render(St,Ee)};function dc(w,U,$,G){D!==null&&w.isNodeMaterial&&D.setObject(G,w),Ot===!0&&Pt.setState(w,$,!1),w.transparent===!0&&w.side===qe&&w.forceSinglePass===!1?(w.side=je,w.needsUpdate=!0,dr(w,U,G),w.side=zi,w.needsUpdate=!0,dr(w,U,G),w.side=qe):dr(w,U,G)}this.compile=function(w,U,$=null){$===null&&($=w),D!==null&&D.renderStart(w,U,$),S=ut.get($),S.init(U),x.push(S),$.traverseVisible(function(V){V.isLight&&V.layers.test(U.layers)&&(S.pushLight(V),V.castShadow&&S.pushShadow(V))}),w!==$&&w.traverseVisible(function(V){V.isLight&&V.layers.test(U.layers)&&(S.pushLight(V),V.castShadow&&S.pushShadow(V))}),S.setupLights(),D!==null&&D.updateLights(S.state.lightsArray),jt=this.localClippingEnabled,Ot=Pt.init(this.clippingPlanes,jt),Ot===!0&&Pt.setGlobalState(this.clippingPlanes,U),D!==null&&Lt.render(S.state.shadowsArray,$,U);let G=new Set;return w.traverse(function(V){if(!(V.isMesh||V.isPoints||V.isLine||V.isSprite))return;let xt=V.material;if(xt)if(Array.isArray(xt))for(let Mt=0;Mt<xt.length;Mt++){let gt=xt[Mt];dc(gt,$,U,V),G.add(gt)}else dc(xt,$,U,V),G.add(xt)}),S=x.pop(),D!==null&&D.renderEnd(),G},this.compileAsync=function(w,U,$=null){let G=this.compile(w,U,$);return new Promise(V=>{function xt(){if(G.forEach(function(Mt){let bt=Y.get(Mt).currentProgram;(bt===void 0||bt.isReady())&&G.delete(Mt)}),G.size===0){V(w);return}setTimeout(xt,10)}ae.get("KHR_parallel_shader_compile")!==null?xt():setTimeout(xt,10)})};let Da=null;function Pu(w){Da&&Da(w)}function fc(){wn.stop()}function pc(){wn.start()}let wn=new lu;wn.setAnimationLoop(Pu),typeof self<"u"&&wn.setContext(self),this.setAnimationLoop=function(w){Da=w,Et.setAnimationLoop(w),w===null?wn.stop():wn.start()},Et.addEventListener("sessionstart",fc),Et.addEventListener("sessionend",pc),this.render=function(w,U){if(U!==void 0&&U.isCamera!==!0){Ft("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(I===!0)return;D!==null&&D.renderStart(w,U);let $=Et.enabled===!0&&Et.isPresenting===!0,G=E!==null&&(tt===null||$)&&E.begin(R,tt);if(w.matrixWorldAutoUpdate===!0&&w.updateMatrixWorld(),U.parent===null&&U.matrixWorldAutoUpdate===!0&&U.updateMatrixWorld(),Et.enabled===!0&&Et.isPresenting===!0&&(E===null||E.isCompositing()===!1)&&(Et.cameraAutoUpdate===!0&&Et.updateCamera(U),U=Et.getCamera()),w.isScene===!0&&w.onBeforeRender(R,w,U,tt),S=ut.get(w,x.length),S.init(U),S.state.textureUnits=K.getTextureUnits(),x.push(S),Gt.multiplyMatrices(U.projectionMatrix,U.matrixWorldInverse),Ut.setFromProjectionMatrix(Gt,Si,U.reversedDepth),jt=this.localClippingEnabled,Ot=Pt.init(this.clippingPlanes,jt),v=pt.get(w,A.length),v.init(),A.push(v),Et.enabled===!0&&Et.isPresenting===!0){let Mt=R.xr.getDepthSensingMesh();Mt!==null&&Na(Mt,U,-1/0,R.sortObjects)}Na(w,U,0,R.sortObjects),v.finish(),D!==null&&D.updateLights(S.state.lightsArray),R.sortObjects===!0&&v.sort(at,wt),ye=Et.enabled===!1||Et.isPresenting===!1||Et.hasDepthSensing()===!1,ye&&Vt.addToRenderList(v,w),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),Ot===!0&&Pt.beginShadows();let V=S.state.shadowsArray;if(Lt.render(V,w,U),Ot===!0&&Pt.endShadows(),(G&&E.hasRenderPass())===!1){let Mt=v.opaque,gt=v.transmissive;if(S.setupLights(),U.isArrayCamera){let bt=U.cameras;if(gt.length>0)for(let At=0,Xt=bt.length;At<Xt;At++){let $t=bt[At];gc(Mt,gt,w,$t)}ye&&Vt.render(w);for(let At=0,Xt=bt.length;At<Xt;At++){let $t=bt[At];mc(v,w,$t,$t.viewport)}}else gt.length>0&&gc(Mt,gt,w,U),ye&&Vt.render(w),mc(v,w,U)}tt!==null&&W===0&&(K.updateMultisampleRenderTarget(tt),K.updateRenderTargetMipmap(tt)),G&&E.end(R),w.isScene===!0&&w.onAfterRender(R,w,U),_t.resetDefaultState(),k=-1,X=null,x.pop(),x.length>0?(S=x[x.length-1],K.setTextureUnits(S.state.textureUnits),Ot===!0&&Pt.setGlobalState(R.clippingPlanes,S.state.camera)):S=null,A.pop(),A.length>0?v=A[A.length-1]:v=null,D!==null&&D.renderEnd()};function Na(w,U,$,G){if(w.visible===!1)return;if(w.layers.test(U.layers)){if(w.isGroup)$=w.renderOrder;else if(w.isLOD)w.autoUpdate===!0&&w.update(U);else if(w.isLightProbeGrid)S.pushLightProbeGrid(w);else if(w.isLight)S.pushLight(w),w.castShadow&&S.pushShadow(w);else if(w.isSprite){if(!w.frustumCulled||w.intersectsFrustum(Ut)){G&&Me.setFromMatrixPosition(w.matrixWorld).applyMatrix4(Gt);let Mt=it.update(w),gt=w.material;gt.visible&&v.push(w,Mt,gt,$,Me.z,null,U)}}else if((w.isMesh||w.isLine||w.isPoints)&&(!w.frustumCulled||w.intersectsFrustum(Ut))){let Mt=it.update(w),gt=w.material;if(G&&(w.boundingSphere!==void 0?(w.boundingSphere===null&&w.computeBoundingSphere(),Me.copy(w.boundingSphere.center)):(Mt.boundingSphere===null&&Mt.computeBoundingSphere(),Me.copy(Mt.boundingSphere.center)),Me.applyMatrix4(w.matrixWorld).applyMatrix4(Gt)),Array.isArray(gt)){let bt=Mt.groups;for(let At=0,Xt=bt.length;At<Xt;At++){let $t=bt[At],St=gt[$t.materialIndex];St&&St.visible&&v.push(w,Mt,St,$,Me.z,$t,U)}}else gt.visible&&v.push(w,Mt,gt,$,Me.z,null,U)}}let xt=w.children;for(let Mt=0,gt=xt.length;Mt<gt;Mt++)Na(xt[Mt],U,$,G)}function mc(w,U,$,G){let{opaque:V,transmissive:xt,transparent:Mt}=w;S.setupLightsView($),Ot===!0&&Pt.setGlobalState(R.clippingPlanes,$),G&&M.viewport(H.copy(G)),V.length>0&&ur(V,U,$),xt.length>0&&ur(xt,U,$),Mt.length>0&&ur(Mt,U,$),M.buffers.depth.setTest(!0),M.buffers.depth.setMask(!0),M.buffers.color.setMask(!0),M.setPolygonOffset(!1)}function gc(w,U,$,G){if(($.isScene===!0?$.overrideMaterial:null)!==null)return;if(S.state.transmissionRenderTarget[G.id]===void 0){let St=ae.has("EXT_color_buffer_half_float")||ae.has("EXT_color_buffer_float");S.state.transmissionRenderTarget[G.id]=new si(1,1,{generateMipmaps:!0,type:St?Ai:ri,minFilter:Hi,samples:Math.max(4,L.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:Zt.workingColorSpace})}let xt=S.state.transmissionRenderTarget[G.id],Mt=G.viewport||H;xt.setSize(Mt.z*R.transmissionResolutionScale,Mt.w*R.transmissionResolutionScale);let gt=R.getRenderTarget(),bt=R.getActiveCubeFace(),At=R.getActiveMipmapLevel();R.setRenderTarget(xt),R.getClearColor(Ht),Bt=R.getClearAlpha(),Bt<1&&R.setClearColor(16777215,.5),R.clear(),ye&&Vt.render($);let Xt=R.toneMapping;R.toneMapping=Ei;let $t=G.viewport;if(G.viewport!==void 0&&(G.viewport=void 0),S.setupLightsView(G),Ot===!0&&Pt.setGlobalState(R.clippingPlanes,G),ur(w,$,G),K.updateMultisampleRenderTarget(xt),K.updateRenderTargetMipmap(xt),ae.has("WEBGL_multisampled_render_to_texture")===!1){let St=!1;for(let re=0,Ee=U.length;re<Ee;re++){let me=U[re],{object:he,geometry:He,material:vt,group:Ze}=me;if(vt.side===qe&&he.layers.test(G.layers)){let te=vt.side;vt.side=je,vt.needsUpdate=!0,xc(he,$,G,He,vt,Ze),vt.side=te,vt.needsUpdate=!0,St=!0}}St===!0&&(K.updateMultisampleRenderTarget(xt),K.updateRenderTargetMipmap(xt))}R.setRenderTarget(gt,bt,At),R.setClearColor(Ht,Bt),$t!==void 0&&(G.viewport=$t),R.toneMapping=Xt}function ur(w,U,$){let G=U.isScene===!0?U.overrideMaterial:null;for(let V=0,xt=w.length;V<xt;V++){let Mt=w[V],{object:gt,geometry:bt,group:At}=Mt,Xt=Mt.material;Xt.allowOverride===!0&&G!==null&&(Xt=G),gt.layers.test($.layers)&&xc(gt,U,$,bt,Xt,At)}}function xc(w,U,$,G,V,xt){D!==null&&V.isNodeMaterial&&D.setObject(w,V),w.onBeforeRender(R,U,$,G,V,xt),w.modelViewMatrix.multiplyMatrices($.matrixWorldInverse,w.matrixWorld),w.normalMatrix.getNormalMatrix(w.modelViewMatrix),V.onBeforeRender(R,U,$,G,w,xt),V.transparent===!0&&V.side===qe&&V.forceSinglePass===!1?(V.side=je,V.needsUpdate=!0,R.renderBufferDirect($,U,G,V,w,xt),V.side=zi,V.needsUpdate=!0,R.renderBufferDirect($,U,G,V,w,xt),V.side=qe):R.renderBufferDirect($,U,G,V,w,xt),w.onAfterRender(R,U,$,G,V,xt)}function dr(w,U,$){U.isScene!==!0&&(U=ii);let G=Y.get(w),V=S.state.lights,xt=S.state.shadowsArray,Mt=V.state.version,gt=ht.getParameters(w,V.state,xt,U,$,S.state.lightProbeGridArray),bt=ht.getProgramCacheKey(gt),At=G.programs;G.environment=w.isMeshStandardMaterial||w.isMeshLambertMaterial||w.isMeshPhongMaterial?U.environment:null,G.fog=U.fog;let Xt=w.isMeshStandardMaterial||w.isMeshLambertMaterial&&!w.envMap||w.isMeshPhongMaterial&&!w.envMap;G.envMap=ot.get(w.envMap||G.environment,Xt),G.envMapRotation=G.environment!==null&&w.envMap===null?U.environmentRotation:w.envMapRotation,At===void 0&&(w.addEventListener("dispose",Pi),At=new Map,G.programs=At);let $t=At.get(bt);if($t!==void 0){if(G.currentProgram===$t&&G.lightsStateVersion===Mt)return yc(w,gt),$t}else gt.uniforms=ht.getUniforms(w),D!==null&&w.isNodeMaterial&&D.build(w,$,gt),w.onBeforeCompile(gt,R),$t=ht.acquireProgram(gt,bt),At.set(bt,$t),G.uniforms=gt.uniforms;let St=G.uniforms;return(!w.isShaderMaterial&&!w.isRawShaderMaterial||w.clipping===!0)&&(St.clippingPlanes=Pt.uniform),yc(w,gt),G.needsLights=Nu(w),G.lightsStateVersion=Mt,G.needsLights&&(St.ambientLightColor.value=V.state.ambient,St.lightProbe.value=V.state.probe,St.sunLights.value=V.state.sun,St.sunLightShadows.value=V.state.sunShadow,St.directionalLights.value=V.state.directional,St.directionalLightShadows.value=V.state.directionalShadow,St.spotLights.value=V.state.spot,St.spotLightShadows.value=V.state.spotShadow,St.rectAreaLights.value=V.state.rectArea,St.ltc_1.value=V.state.rectAreaLTC1,St.ltc_2.value=V.state.rectAreaLTC2,St.pointLights.value=V.state.point,St.pointLightShadows.value=V.state.pointShadow,St.hemisphereLights.value=V.state.hemi,St.sunShadowMatrix.value=V.state.sunShadowMatrix,St.sunShadowCascade.value=V.state.sunShadowCascade,St.directionalShadowMatrix.value=V.state.directionalShadowMatrix,St.spotLightMatrix.value=V.state.spotLightMatrix,St.spotLightMap.value=V.state.spotLightMap,St.pointShadowMatrix.value=V.state.pointShadowMatrix),G.lightProbeGrid=S.state.lightProbeGridArray.length>0,G.currentProgram=$t,G.uniformsList=null,$t}function _c(w){if(w.uniformsList===null){let U=w.currentProgram.getUniforms();w.uniformsList=xs.seqWithValue(U.seq,w.uniforms)}return w.uniformsList}function yc(w,U){let $=Y.get(w);$.outputColorSpace=U.outputColorSpace,$.batching=U.batching,$.batchingColor=U.batchingColor,$.instancing=U.instancing,$.instancingColor=U.instancingColor,$.instancingMorph=U.instancingMorph,$.skinning=U.skinning,$.morphTargets=U.morphTargets,$.morphNormals=U.morphNormals,$.morphColors=U.morphColors,$.morphTargetsCount=U.morphTargetsCount,$.numClippingPlanes=U.numClippingPlanes,$.numIntersection=U.numClipIntersection,$.vertexAlphas=U.vertexAlphas,$.vertexTangents=U.vertexTangents,$.toneMapping=U.toneMapping}function Iu(w,U){if(w.length===0)return null;if(w.length===1)return w[0].texture!==null?w[0]:null;y.setFromMatrixPosition(U.matrixWorld);for(let $=0,G=w.length;$<G;$++){let V=w[$];if(V.texture!==null&&V.boundingBox.containsPoint(y))return V}return null}function Lu(w,U,$,G,V){U.isScene!==!0&&(U=ii),K.resetTextureUnits();let xt=U.fog,Mt=G.isMeshStandardMaterial||G.isMeshLambertMaterial||G.isMeshPhongMaterial?U.environment:null,gt=tt===null?R.outputColorSpace:tt.isXRRenderTarget===!0?tt.texture.colorSpace:Zt.workingColorSpace,bt=G.isMeshStandardMaterial||G.isMeshLambertMaterial&&!G.envMap||G.isMeshPhongMaterial&&!G.envMap,At=ot.get(G.envMap||Mt,bt),Xt=G.vertexColors===!0&&!!$.attributes.color&&$.attributes.color.itemSize===4,$t=!!$.attributes.tangent&&(!!G.normalMap||G.anisotropy>0),St=!!$.morphAttributes.position,re=!!$.morphAttributes.normal,Ee=!!$.morphAttributes.color,me=Ei;G.toneMapped&&(tt===null||tt.isXRRenderTarget===!0)&&(me=R.toneMapping);let he=$.morphAttributes.position||$.morphAttributes.normal||$.morphAttributes.color,He=he!==void 0?he.length:0,vt=Y.get(G),Ze=S.state.lights;if(Ot===!0&&(jt===!0||w!==X)){let de=w===X&&G.id===k;Pt.setState(G,w,de)}let te=!1;G.version===vt.__version?(vt.needsLights&&vt.lightsStateVersion!==Ze.state.version||vt.outputColorSpace!==gt||V.isBatchedMesh&&vt.batching===!1||!V.isBatchedMesh&&vt.batching===!0||V.isBatchedMesh&&vt.batchingColor===!0&&V._colorsTexture===null||V.isBatchedMesh&&vt.batchingColor===!1&&V._colorsTexture!==null||V.isInstancedMesh&&vt.instancing===!1||!V.isInstancedMesh&&vt.instancing===!0||V.isSkinnedMesh&&vt.skinning===!1||!V.isSkinnedMesh&&vt.skinning===!0||V.isInstancedMesh&&vt.instancingColor===!0&&V.instanceColor===null||V.isInstancedMesh&&vt.instancingColor===!1&&V.instanceColor!==null||V.isInstancedMesh&&vt.instancingMorph===!0&&V.morphTexture===null||V.isInstancedMesh&&vt.instancingMorph===!1&&V.morphTexture!==null||vt.envMap!==At||G.fog===!0&&vt.fog!==xt||vt.numClippingPlanes!==void 0&&(vt.numClippingPlanes!==Pt.numPlanes||vt.numIntersection!==Pt.numIntersection)||vt.vertexAlphas!==Xt||vt.vertexTangents!==$t||vt.morphTargets!==St||vt.morphNormals!==re||vt.morphColors!==Ee||vt.toneMapping!==me||vt.morphTargetsCount!==He||!!vt.lightProbeGrid!=S.state.lightProbeGridArray.length>0)&&(te=!0):(te=!0,vt.__version=G.version);let ui=vt.currentProgram;te===!0&&(ui=dr(G,U,V),D&&G.isNodeMaterial&&D.onUpdateProgram(G,ui,vt));let Ii=!1,nn=!1,Hn=!1,ce=ui.getUniforms(),be=vt.uniforms;if(M.useProgram(ui.program)&&(Ii=!0,nn=!0,Hn=!0),G.id!==k&&(k=G.id,nn=!0),vt.needsLights){let de=Iu(S.state.lightProbeGridArray,V);vt.lightProbeGrid!==de&&(vt.lightProbeGrid=de,nn=!0)}if(Ii||X!==w){M.buffers.depth.getReversed()&&w.reversedDepth!==!0&&(w._reversedDepth=!0,w.updateProjectionMatrix()),ce.setValue(B,"projectionMatrix",w.projectionMatrix),ce.setValue(B,"viewMatrix",w.matrixWorldInverse);let rn=ce.map.cameraPosition;rn!==void 0&&rn.setValue(B,le.setFromMatrixPosition(w.matrixWorld)),L.logarithmicDepthBuffer&&ce.setValue(B,"logDepthBufFC",2/(Math.log(w.far+1)/Math.LN2)),(G.isMeshPhongMaterial||G.isMeshToonMaterial||G.isMeshLambertMaterial||G.isMeshBasicMaterial||G.isMeshStandardMaterial||G.isShaderMaterial)&&ce.setValue(B,"isOrthographic",w.isOrthographicCamera===!0),X!==w&&(X=w,nn=!0,Hn=!0)}if(vt.needsLights&&(Ze.state.sunShadowMap.length>0&&ce.setValue(B,"sunShadowMap",Ze.state.sunShadowMap,K),Ze.state.directionalShadowMap.length>0&&ce.setValue(B,"directionalShadowMap",Ze.state.directionalShadowMap,K),Ze.state.spotShadowMap.length>0&&ce.setValue(B,"spotShadowMap",Ze.state.spotShadowMap,K),Ze.state.pointShadowMap.length>0&&ce.setValue(B,"pointShadowMap",Ze.state.pointShadowMap,K)),V.isSkinnedMesh){ce.setOptional(B,V,"bindMatrix"),ce.setOptional(B,V,"bindMatrixInverse");let de=V.skeleton;de&&(de.boneTexture===null&&de.computeBoneTexture(),ce.setValue(B,"boneTexture",de.boneTexture,K))}V.isBatchedMesh&&(ce.setOptional(B,V,"batchingTexture"),ce.setValue(B,"batchingTexture",V._matricesTexture,K),ce.setOptional(B,V,"batchingIdTexture"),ce.setValue(B,"batchingIdTexture",V._indirectTexture,K),ce.setOptional(B,V,"batchingColorTexture"),V._colorsTexture!==null&&ce.setValue(B,"batchingColorTexture",V._colorsTexture,K));let sn=$.morphAttributes;if((sn.position!==void 0||sn.normal!==void 0||sn.color!==void 0)&&F.update(V,$,ui),(nn||vt.receiveShadow!==V.receiveShadow)&&(vt.receiveShadow=V.receiveShadow,ce.setValue(B,"receiveShadow",V.receiveShadow)),(G.isMeshStandardMaterial||G.isMeshLambertMaterial||G.isMeshPhongMaterial)&&G.envMap===null&&U.environment!==null&&(be.envMapIntensity.value=U.environmentIntensity),be.dfgLUT!==void 0&&(be.dfgLUT.value=ag()),nn){if(ce.setValue(B,"toneMappingExposure",R.toneMappingExposure),vt.needsLights&&Du(be,Hn),xt&&G.fog===!0&&Rt.refreshFogUniforms(be,xt),Rt.refreshMaterialUniforms(be,G,Q,Z,S.state.transmissionRenderTarget[w.id]),vt.needsLights&&vt.lightProbeGrid){let de=vt.lightProbeGrid;be.probesSH.value=de.texture,be.probesMin.value.copy(de.boundingBox.min),be.probesMax.value.copy(de.boundingBox.max),be.probesResolution.value.copy(de.resolution)}xs.upload(B,_c(vt),be,K)}if(G.isShaderMaterial&&G.uniformsNeedUpdate===!0&&(xs.upload(B,_c(vt),be,K),G.uniformsNeedUpdate=!1),G.isSpriteMaterial&&ce.setValue(B,"center",V.center),ce.setValue(B,"modelViewMatrix",V.modelViewMatrix),ce.setValue(B,"normalMatrix",V.normalMatrix),ce.setValue(B,"modelMatrix",V.matrixWorld),G.uniformsGroups!==void 0){let de=G.uniformsGroups;for(let rn=0,Gn=de.length;rn<Gn;rn++){let Mc=de[rn];nt.update(Mc,ui),nt.bind(Mc,ui)}}return ui}function Du(w,U){w.ambientLightColor.needsUpdate=U,w.lightProbe.needsUpdate=U,w.sunLights.needsUpdate=U,w.sunLightShadows.needsUpdate=U,w.directionalLights.needsUpdate=U,w.directionalLightShadows.needsUpdate=U,w.pointLights.needsUpdate=U,w.pointLightShadows.needsUpdate=U,w.spotLights.needsUpdate=U,w.spotLightShadows.needsUpdate=U,w.rectAreaLights.needsUpdate=U,w.hemisphereLights.needsUpdate=U}function Nu(w){return w.isMeshLambertMaterial||w.isMeshToonMaterial||w.isMeshPhongMaterial||w.isMeshStandardMaterial||w.isShadowMaterial||w.isShaderMaterial&&w.lights===!0}this.getActiveCubeFace=function(){return q},this.getActiveMipmapLevel=function(){return W},this.getRenderTarget=function(){return tt},this.setRenderTargetTextures=function(w,U,$){let G=Y.get(w);G.__autoAllocateDepthBuffer=w.resolveDepthBuffer===!1,G.__autoAllocateDepthBuffer===!1&&(G.__useRenderToTexture=!1),Y.get(w.texture).__webglTexture=U,Y.get(w.depthTexture).__webglTexture=G.__autoAllocateDepthBuffer?void 0:$,G.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(w,U){let $=Y.get(w);$.__webglFramebuffer=U,$.__useDefaultFramebuffer=U===void 0},this.setRenderTarget=function(w,U=0,$=0){tt=w,q=U,W=$;let G=null,V=!1,xt=!1;if(w){let gt=Y.get(w);if(gt.__useDefaultFramebuffer!==void 0){M.bindFramebuffer(B.FRAMEBUFFER,gt.__webglFramebuffer),H.copy(w.viewport),rt.copy(w.scissor),lt=w.scissorTest,M.viewport(H),M.scissor(rt),M.setScissorTest(lt),k=-1;return}else if(gt.__webglFramebuffer===void 0)K.setupRenderTarget(w);else if(gt.__hasExternalTextures)K.rebindTextures(w,Y.get(w.texture).__webglTexture,Y.get(w.depthTexture).__webglTexture);else if(w.depthBuffer){let Xt=w.depthTexture;if(gt.__boundDepthTexture!==Xt){if(Xt!==null&&Y.has(Xt)&&(w.width!==Xt.image.width||w.height!==Xt.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");K.setupDepthRenderbuffer(w)}}let bt=w.texture;(bt.isData3DTexture||bt.isDataArrayTexture||bt.isCompressedArrayTexture)&&(xt=!0);let At=Y.get(w).__webglFramebuffer;w.isWebGLCubeRenderTarget?(Array.isArray(At[U])?G=At[U][$]:G=At[U],V=!0):w.samples>0&&K.useMultisampledRTT(w)===!1?G=Y.get(w).__webglMultisampledFramebuffer:Array.isArray(At)?G=At[$]:G=At,H.copy(w.viewport),rt.copy(w.scissor),lt=w.scissorTest}else H.copy(st).multiplyScalar(Q).floor(),rt.copy(Tt).multiplyScalar(Q).floor(),lt=Yt;if($!==0&&(G=C),M.bindFramebuffer(B.FRAMEBUFFER,G)&&M.drawBuffers(w,G),M.viewport(H),M.scissor(rt),M.setScissorTest(lt),V){let gt=Y.get(w.texture);B.framebufferTexture2D(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_CUBE_MAP_POSITIVE_X+U,gt.__webglTexture,$)}else if(xt){let gt=U;for(let bt=0;bt<w.textures.length;bt++){let At=Y.get(w.textures[bt]);B.framebufferTextureLayer(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0+bt,At.__webglTexture,$,gt)}}else if(w!==null&&$!==0){let gt=Y.get(w.texture);B.framebufferTexture2D(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,gt.__webglTexture,$)}k=-1};function vc(w){let U=Y.get(w);return(U.__readFormat!==w.format||U.__readType!==w.type)&&(U.__readFormat=w.format,U.__readType=w.type,U.__formatReadable=L.textureFormatReadable(w.format),U.__typeReadable=L.textureTypeReadable(w.type)),U}this.readRenderTargetPixels=function(w,U,$,G,V,xt,Mt,gt=0){if(!(w&&w.isWebGLRenderTarget)){Ft("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let bt=Y.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&Mt!==void 0&&(bt=bt[Mt]),bt){M.bindFramebuffer(B.FRAMEBUFFER,bt);try{let At=w.textures[gt],Xt=At.format,$t=At.type;w.textures.length>1&&B.readBuffer(B.COLOR_ATTACHMENT0+gt);let St=vc(At);if(St.__formatReadable===!1){Ft("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(St.__typeReadable===!1){Ft("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}U>=0&&U<=w.width-G&&$>=0&&$<=w.height-V&&B.readPixels(U,$,G,V,ft.convert(Xt),ft.convert($t),xt)}finally{let At=tt!==null?Y.get(tt).__webglFramebuffer:null;M.bindFramebuffer(B.FRAMEBUFFER,At)}}},this.readRenderTargetPixelsAsync=async function(w,U,$,G,V,xt,Mt,gt=0){if(!(w&&w.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let bt=Y.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&Mt!==void 0&&(bt=bt[Mt]),bt)if(U>=0&&U<=w.width-G&&$>=0&&$<=w.height-V){M.bindFramebuffer(B.FRAMEBUFFER,bt);let At=w.textures[gt],Xt=At.format,$t=At.type;w.textures.length>1&&B.readBuffer(B.COLOR_ATTACHMENT0+gt);let St=vc(At);if(St.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(St.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let re=B.createBuffer();B.bindBuffer(B.PIXEL_PACK_BUFFER,re),B.bufferData(B.PIXEL_PACK_BUFFER,xt.byteLength,B.STREAM_READ),B.readPixels(U,$,G,V,ft.convert(Xt),ft.convert($t),0),B.bindBuffer(B.PIXEL_PACK_BUFFER,null);let Ee=tt!==null?Y.get(tt).__webglFramebuffer:null;M.bindFramebuffer(B.FRAMEBUFFER,Ee);let me=B.fenceSync(B.SYNC_GPU_COMMANDS_COMPLETE,0);return B.flush(),await Uh(B,me,4),B.bindBuffer(B.PIXEL_PACK_BUFFER,re),B.getBufferSubData(B.PIXEL_PACK_BUFFER,0,xt),B.bindBuffer(B.PIXEL_PACK_BUFFER,null),B.deleteBuffer(re),B.deleteSync(me),xt}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(w,U=null,$=0){let G=Math.pow(2,-$),V=Math.floor(w.image.width*G),xt=Math.floor(w.image.height*G),Mt=U!==null?U.x:0,gt=U!==null?U.y:0;K.setTexture2D(w,0),B.copyTexSubImage2D(B.TEXTURE_2D,$,0,0,Mt,gt,V,xt),M.unbindTexture()},this.copyTextureToTexture=function(w,U,$=null,G=null,V=0,xt=0){let Mt,gt,bt,At,Xt,$t,St,re,Ee,me=w.isCompressedTexture?w.mipmaps[xt]:w.image;if($!==null)Mt=$.max.x-$.min.x,gt=$.max.y-$.min.y,bt=$.isBox3?$.max.z-$.min.z:1,At=$.min.x,Xt=$.min.y,$t=$.isBox3?$.min.z:0;else{let be=Math.pow(2,-V);Mt=Math.floor(me.width*be),gt=Math.floor(me.height*be),w.isDataArrayTexture?bt=me.depth:w.isData3DTexture?bt=Math.floor(me.depth*be):bt=1,At=0,Xt=0,$t=0}G!==null?(St=G.x,re=G.y,Ee=G.z):(St=0,re=0,Ee=0);let he=ft.convert(U.format),He=ft.convert(U.type),vt;U.isData3DTexture?(K.setTexture3D(U,0),vt=B.TEXTURE_3D):U.isDataArrayTexture||U.isCompressedArrayTexture?(K.setTexture2DArray(U,0),vt=B.TEXTURE_2D_ARRAY):(K.setTexture2D(U,0),vt=B.TEXTURE_2D),M.activeTexture(B.TEXTURE0),M.pixelStorei(B.UNPACK_FLIP_Y_WEBGL,U.flipY),M.pixelStorei(B.UNPACK_PREMULTIPLY_ALPHA_WEBGL,U.premultiplyAlpha),M.pixelStorei(B.UNPACK_ALIGNMENT,U.unpackAlignment);let Ze=M.getParameter(B.UNPACK_ROW_LENGTH),te=M.getParameter(B.UNPACK_IMAGE_HEIGHT),ui=M.getParameter(B.UNPACK_SKIP_PIXELS),Ii=M.getParameter(B.UNPACK_SKIP_ROWS),nn=M.getParameter(B.UNPACK_SKIP_IMAGES);M.pixelStorei(B.UNPACK_ROW_LENGTH,me.width),M.pixelStorei(B.UNPACK_IMAGE_HEIGHT,me.height),M.pixelStorei(B.UNPACK_SKIP_PIXELS,At),M.pixelStorei(B.UNPACK_SKIP_ROWS,Xt),M.pixelStorei(B.UNPACK_SKIP_IMAGES,$t);let Hn=w.isDataArrayTexture||w.isData3DTexture,ce=U.isDataArrayTexture||U.isData3DTexture;if(w.isDepthTexture){let be=Y.get(w),sn=Y.get(U),de=Y.get(be.__renderTarget),rn=Y.get(sn.__renderTarget);M.bindFramebuffer(B.READ_FRAMEBUFFER,de.__webglFramebuffer),M.bindFramebuffer(B.DRAW_FRAMEBUFFER,rn.__webglFramebuffer);for(let Gn=0;Gn<bt;Gn++)Hn&&(B.framebufferTextureLayer(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,Y.get(w).__webglTexture,V,$t+Gn),B.framebufferTextureLayer(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,Y.get(U).__webglTexture,xt,Ee+Gn)),B.blitFramebuffer(At,Xt,Mt,gt,St,re,Mt,gt,B.DEPTH_BUFFER_BIT,B.NEAREST);M.bindFramebuffer(B.READ_FRAMEBUFFER,null),M.bindFramebuffer(B.DRAW_FRAMEBUFFER,null)}else if(V!==0||w.isRenderTargetTexture||Y.has(w)){let be=Y.get(w),sn=Y.get(U);M.bindFramebuffer(B.READ_FRAMEBUFFER,P),M.bindFramebuffer(B.DRAW_FRAMEBUFFER,N);for(let de=0;de<bt;de++)Hn?B.framebufferTextureLayer(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,be.__webglTexture,V,$t+de):B.framebufferTexture2D(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,be.__webglTexture,V),ce?B.framebufferTextureLayer(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,sn.__webglTexture,xt,Ee+de):B.framebufferTexture2D(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,sn.__webglTexture,xt),V!==0?B.blitFramebuffer(At,Xt,Mt,gt,St,re,Mt,gt,B.COLOR_BUFFER_BIT,B.NEAREST):ce?B.copyTexSubImage3D(vt,xt,St,re,Ee+de,At,Xt,Mt,gt):B.copyTexSubImage2D(vt,xt,St,re,At,Xt,Mt,gt);M.bindFramebuffer(B.READ_FRAMEBUFFER,null),M.bindFramebuffer(B.DRAW_FRAMEBUFFER,null)}else ce?w.isDataTexture||w.isData3DTexture?B.texSubImage3D(vt,xt,St,re,Ee,Mt,gt,bt,he,He,me.data):U.isCompressedArrayTexture?B.compressedTexSubImage3D(vt,xt,St,re,Ee,Mt,gt,bt,he,me.data):B.texSubImage3D(vt,xt,St,re,Ee,Mt,gt,bt,he,He,me):w.isDataTexture?B.texSubImage2D(B.TEXTURE_2D,xt,St,re,Mt,gt,he,He,me.data):w.isCompressedTexture?B.compressedTexSubImage2D(B.TEXTURE_2D,xt,St,re,me.width,me.height,he,me.data):B.texSubImage2D(B.TEXTURE_2D,xt,St,re,Mt,gt,he,He,me);M.pixelStorei(B.UNPACK_ROW_LENGTH,Ze),M.pixelStorei(B.UNPACK_IMAGE_HEIGHT,te),M.pixelStorei(B.UNPACK_SKIP_PIXELS,ui),M.pixelStorei(B.UNPACK_SKIP_ROWS,Ii),M.pixelStorei(B.UNPACK_SKIP_IMAGES,nn),xt===0&&U.generateMipmaps&&B.generateMipmap(vt),M.unbindTexture()},this.initRenderTarget=function(w){Y.get(w).__webglFramebuffer===void 0&&K.setupRenderTarget(w)},this.initTexture=function(w){w.isCubeTexture?K.setTextureCube(w,0):w.isData3DTexture?K.setTexture3D(w,0):w.isDataArrayTexture||w.isCompressedArrayTexture?K.setTexture2DArray(w,0):K.setTexture2D(w,0),M.unbindTexture()},this.resetState=function(){q=0,W=0,tt=null,M.reset(),_t.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Si}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=Zt._getDrawingBufferColorSpace(t),e.unpackColorSpace=Zt._getUnpackColorSpace()}};var Qt={size:768,gravity:9.81,waterDensity:1e3,dayLengthSec:185},Le={pourRateM3PerSec:460,cofferdamInstantRatio:.62,rockAggregateDiscount:.38,highDamHeadThreshold:10.5,maxUnreinforcedHead:17.5,substationCost:6800,baseGridLossNoSub:.16,gridLossWithSub:.03,damHeightTiers:[{id:"low",label:"\u042F\u0440\u0443\u0441 +6\u043C",addHeight:6.2},{id:"mid",label:"\u042F\u0440\u0443\u0441 +11\u043C",addHeight:11.2},{id:"high",label:"\u042F\u0440\u0443\u0441 +17\u043C",addHeight:17}]},Ci={bystritsa:{id:"bystritsa",name:"\u0414\u043E\u043B\u0438\u043D\u0430 \xAB\u0411\u043E\u043B\u044C\u0448\u0430\u044F \u0411\u044B\u0441\u0442\u0440\u0438\u0446\u0430\xBB",badge:"\u0420\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0443\u0435\u0442\u0441\u044F \xB7 \u041E\u0431\u0443\u0447\u0435\u043D\u0438\u0435",areaLabel:"768 \xD7 768 \u043C \xB7 3 \u0440\u0435\u043A\u0438 \xB7 5 \u0433\u043E\u0440\u043E\u0434\u043E\u0432",headLabel:"\u041F\u0435\u0440\u0435\u043F\u0430\u0434 \u0432\u044B\u0441\u043E\u0442: 36 \u043C",mainInflowQ:158,creekInflowQ:52,westCreekQ:34,desc:"\u0413\u0440\u0430\u043D\u0438\u0442\u043D\u0430\u044F \u0442\u0435\u0441\u043D\u0438\u043D\u0430 \xAB\u0412\u043E\u0440\u043E\u0442\u0430 \u0413\u0440\u043E\u043C\u0430\xBB, \u0434\u0432\u0430 \u0433\u043E\u0440\u043D\u044B\u0445 \u043F\u0440\u0438\u0442\u043E\u043A\u0430, \u0448\u0438\u0440\u043E\u043A\u043E\u0435 \u0434\u0435\u0440\u0438\u0432\u0430\u0446\u0438\u043E\u043D\u043D\u043E\u0435 \u043F\u043B\u0430\u0442\u043E \u0443 \u0438\u0437\u043B\u0443\u0447\u0438\u043D\u044B \xAB\u041F\u043E\u0434\u043A\u043E\u0432\u0430\xBB \u0438 \u043E\u0440\u043E\u0448\u0430\u0435\u043C\u0430\u044F \u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u0430.",landmarks:[{label:"\u25B2 \u0421\u0442\u0432\u043E\u0440 \xAB\u0412\u043E\u0440\u043E\u0442\u0430 \u0413\u0440\u043E\u043C\u0430\xBB",x:12,z:-158,dist:132},{label:"\u25C6 \u0414\u0435\u0440\u0438\u0432\u0430\u0446\u0438\u043E\u043D\u043D\u043E\u0435 \u043F\u043B\u0430\u0442\u043E",x:-18,z:-12,dist:175},{label:"\u25C9 \u041E\u0440\u043E\u0448\u0435\u043D\u0438\u0435 \u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u044B",x:168,z:98,dist:145},{label:"\u2248 \u041D\u0438\u0436\u043D\u0438\u0439 \u043F\u043B\u0451\u0441 \u0438 \u041F\u043E\u0441\u0430\u0434",x:-24,z:235,dist:185}]},rapids:{id:"rapids",name:"\u041A\u0430\u0441\u043A\u0430\u0434 \xAB\u0421\u0435\u0432\u0435\u0440\u043D\u044B\u0435 \u041F\u043E\u0440\u043E\u0433\u0438\xBB",badge:"\u0412\u044B\u0441\u043E\u043A\u0438\u0439 \u043D\u0430\u043F\u043E\u0440 \xB7 \u0421\u043A\u0430\u043B\u044B",areaLabel:"768 \xD7 768 \u043C \xB7 \u0414\u0432\u043E\u0439\u043D\u043E\u0439 \u043A\u0430\u043D\u044C\u043E\u043D",headLabel:"\u041F\u0435\u0440\u0435\u043F\u0430\u0434 \u0432\u044B\u0441\u043E\u0442: 46 \u043C",mainInflowQ:172,creekInflowQ:64,westCreekQ:42,desc:"\u041A\u0440\u0443\u0442\u0430\u044F \u0441\u0442\u0443\u043F\u0435\u043D\u0447\u0430\u0442\u0430\u044F \u0433\u043E\u0440\u043D\u0430\u044F \u0434\u043E\u043B\u0438\u043D\u0430 \u0441 \u0434\u0432\u0443\u043C\u044F \u0443\u0437\u043A\u0438\u043C\u0438 \u0443\u0449\u0435\u043B\u044C\u044F\u043C\u0438 \u043F\u043E\u0434\u0440\u044F\u0434. \u0418\u0434\u0435\u0430\u043B\u044C\u043D\u0430 \u0434\u043B\u044F \u043C\u043D\u043E\u0433\u043E\u0441\u0442\u0443\u043F\u0435\u043D\u0447\u0430\u0442\u043E\u0433\u043E \u043A\u0430\u0441\u043A\u0430\u0434\u0430 \u0413\u042D\u0421 \u0424\u0440\u044D\u043D\u0441\u0438\u0441\u0430 \u0438 \u041F\u0435\u043B\u0442\u043E\u043D\u0430 \u0441 \u043A\u043E\u043D\u0442\u0440\u0444\u043E\u0440\u0441\u0430\u043C\u0438.",landmarks:[{label:"\u25B2 \u0412\u0435\u0440\u0445\u043D\u0438\u0439 \u043A\u0430\u043D\u044C\u043E\u043D",x:-18,z:-248,dist:135},{label:"\u25B2 \u041D\u0438\u0436\u043D\u0438\u0435 \u041F\u043E\u0440\u043E\u0433\u0438",x:22,z:-98,dist:140},{label:"\u25C6 \u041E\u0431\u0432\u043E\u0434\u043D\u0430\u044F \u043F\u043E\u043B\u043A\u0430",x:-26,z:32,dist:170},{label:"\u25C9 \u0422\u0435\u0440\u0440\u0430\u0441\u0430 \u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u044B",x:168,z:98,dist:150}]},delta:{id:"delta",name:"\u041F\u043E\u0439\u043C\u0430 \xAB\u0417\u0435\u0440\u043A\u0430\u043B\u044C\u043D\u0430\u044F \u0414\u0435\u043B\u044C\u0442\u0430\xBB",badge:"\u041A\u0430\u043D\u0430\u043B\u044B \u0438 \u043F\u0430\u0432\u043E\u0434\u043A\u0438",areaLabel:"768 \xD7 768 \u043C \xB7 \u0428\u0438\u0440\u043E\u043A\u043E\u0435 \u0440\u0443\u0441\u043B\u043E",headLabel:"\u041F\u0435\u0440\u0435\u043F\u0430\u0434 \u0432\u044B\u0441\u043E\u0442: 28 \u043C",mainInflowQ:195,creekInflowQ:58,westCreekQ:48,desc:"\u041C\u043E\u0449\u043D\u0430\u044F \u043F\u043E\u043B\u043D\u043E\u0432\u043E\u0434\u043D\u0430\u044F \u0440\u0435\u043A\u0430 \u0432 \u0448\u0438\u0440\u043E\u043A\u043E\u0439 \u043F\u043E\u0439\u043C\u0435 \u0441 \u043C\u044F\u0433\u043A\u0438\u043C\u0438 \u0433\u0440\u0443\u043D\u0442\u0430\u043C\u0438. \u0422\u0440\u0435\u0431\u0443\u0435\u0442 \u0434\u043B\u0438\u043D\u043D\u044B\u0445 \u0434\u0430\u043C\u0431, \u0446\u0435\u043C\u0435\u043D\u0442\u0430\u0446\u0438\u0438 \u043E\u0441\u043D\u043E\u0432\u0430\u043D\u0438\u044F, \u0431\u0435\u0442\u043E\u043D\u043D\u044B\u0445 \u043A\u0430\u043D\u0430\u043B\u043E\u0432 \u0438 \u0437\u0430\u0449\u0438\u0442\u044B \u0433\u043E\u0440\u043E\u0434\u043E\u0432 \u043E\u0442 \u043F\u043E\u043B\u043E\u0432\u043E\u0434\u044C\u044F.",landmarks:[{label:"\u25B2 \u0413\u043B\u0430\u0432\u043D\u044B\u0439 \u0433\u0438\u0434\u0440\u043E\u0443\u0437\u0435\u043B",x:8,z:-152,dist:155},{label:"\u25C6 \u0422\u0440\u0430\u0441\u0441\u0430 \u0441\u043F\u0440\u044F\u043C\u043B\u0435\u043D\u0438\u044F",x:-16,z:-6,dist:185},{label:"\u25C9 \u0411\u0430\u0441\u0441\u0435\u0439\u043D \u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u044B",x:168,z:98,dist:150},{label:"\u2248 \u0428\u0438\u0440\u043E\u043A\u0430\u044F \u0434\u0435\u043B\u044C\u0442\u0430",x:-12,z:255,dist:195}]}},xa={low:{id:"low",label:"\u041B\u0451\u0433\u043A\u043E\u0435",grid:168,maxPixelRatio:1.15,shadows:!1,shadowEvery:0,maxParticles:1300,treeCount:720,rockCount:240,substepsCap:6},medium:{id:"medium",label:"\u041E\u0431\u044B\u0447\u043D\u043E\u0435",grid:208,maxPixelRatio:1.6,shadows:!0,shadowEvery:3,maxParticles:2800,treeCount:1350,rockCount:420,substepsCap:8},high:{id:"high",label:"\u0412\u044B\u0441\u043E\u043A\u043E\u0435",grid:248,maxPixelRatio:2,shadows:!0,shadowEvery:2,maxParticles:4800,treeCount:2100,rockCount:620,substepsCap:10}},ei={low_water:{id:"low_water",label:"\u041B\u0435\u0442\u043D\u044F\u044F \u043C\u0435\u0436\u0435\u043D\u044C",icon:"\u2600",inflowMult:.74,rainRate:0,sunIntensity:1.16,fogDensity:4e-4,next:{low_water:.25,normal:.55,rain:.2}},normal:{id:"normal",label:"\u041D\u043E\u0440\u043C\u0430\u043B\u044C\u043D\u044B\u0439 \u0441\u0442\u043E\u043A",icon:"\u25C8",inflowMult:1,rainRate:0,sunIntensity:1.05,fogDensity:5e-4,next:{low_water:.22,normal:.43,rain:.27,flood:.08}},rain:{id:"rain",label:"\u0414\u043E\u0436\u0434\u0435\u0432\u043E\u0439 \u043F\u0430\u0432\u043E\u0434\u043E\u043A",icon:"\u2602",inflowMult:1.52,rainRate:15e-5,sunIntensity:.6,fogDensity:82e-5,next:{normal:.45,rain:.3,flood:.25}},flood:{id:"flood",label:"\u0412\u0435\u0441\u0435\u043D\u043D\u0435\u0435 \u043F\u043E\u043B\u043E\u0432\u043E\u0434\u044C\u0435",icon:"\u25C8",inflowMult:2.25,rainRate:32e-5,sunIntensity:.44,fogDensity:.00106,next:{rain:.55,normal:.45}}},_a=[{id:"inspect",key:"1",name:"\u0413\u0438\u0434\u0440\u043E\u043F\u043E\u0441\u0442 / \u0418\u043D\u0441\u043F\u0435\u043A\u0446\u0438\u044F",short:"\u041E\u0441\u043C\u043E\u0442\u0440",costLabel:"\u0431\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u043E",desc:"\u0417\u0430\u043C\u0435\u0440 \u0433\u043B\u0443\u0431\u0438\u043D\u044B, \u0447\u0438\u0441\u043B\u0430 \u0424\u0440\u0443\u0434\u0430, \u0433\u0435\u043E\u043B\u043E\u0433\u0438\u0438 \u043F\u043E\u0440\u043E\u0434, \u0441\u0442\u0430\u0434\u0438\u0438 \u0431\u0435\u0442\u043E\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F \u0438 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0430 \u0442\u0443\u0440\u0431\u0438\u043D/\u0437\u0430\u0442\u0432\u043E\u0440\u043E\u0432."},{id:"canal_dig",key:"2",name:"\u042D\u043A\u0441\u043A\u0430\u0432\u0430\u0442\u043E\u0440 \u043A\u0430\u043D\u0430\u043B\u0430",short:"\u041A\u043E\u043F\u0430\u0442\u044C \u043A\u0430\u043D\u0430\u043B",costPerM3Soil:3.4,costPerM3Rock:14.5,costLabel:"3.4 \u20BD/\u043C\xB3 + \u0449\u0435\u0431\u0435\u043D\u044C",desc:"\u041A\u043E\u043F\u043A\u0430 \u043A\u0430\u043D\u0430\u043B\u043E\u0432 \u0438 \u043A\u043E\u0442\u043B\u043E\u0432\u0430\u043D\u043E\u0432 (\u0434\u0430\u0451\u0442 \u0433\u0440\u0443\u043D\u0442 \u0438 \u0433\u0440\u0430\u043D\u0438\u0442\u043D\u044B\u0439 \u0449\u0435\u0431\u0435\u043D\u044C \u0441\u043E \u0441\u043A\u0438\u0434\u043A\u043E\u0439 38% \u043D\u0430 \u0431\u0435\u0442\u043E\u043D!). \u0417\u0430\u0436\u043C\u0438\u0442\u0435 Shift \u0434\u043B\u044F \u0440\u043E\u0432\u043D\u043E\u0433\u043E \u0443\u043A\u043B\u043E\u043D\u0430."},{id:"canal_liner",key:"3",name:"\u0416/\u0411 \u043B\u043E\u0442\u043E\u043A \u0438 \u0431\u043E\u0440\u0442\u0430 \u043A\u0430\u043D\u0430\u043B\u0430",short:"\u0416/\u0411 \u043B\u043E\u0442\u043E\u043A",costPerCell:58,costLabel:"58 \u20BD/\u0441\u0435\u043A\u0446\u0438\u044F",desc:"\u0423\u043A\u043B\u0430\u0434\u043A\u0430 \u043E\u0431\u044A\u0451\u043C\u043D\u044B\u0445 \u0436\u0435\u043B\u0435\u0437\u043E\u0431\u0435\u0442\u043E\u043D\u043D\u044B\u0445 \u043F\u043B\u0438\u0442 \u0438 \u043F\u0430\u0440\u0430\u043F\u0435\u0442\u043E\u0432 \u043A\u0430\u043D\u0430\u043B\u0430 (n = 0.012): \u043F\u043E\u0442\u043E\u043A \u0432 2.5\xD7 \u0431\u044B\u0441\u0442\u0440\u0435\u0435 \u0438 \u043D\u0443\u043B\u0435\u0432\u043E\u0439 \u0440\u0430\u0437\u043C\u044B\u0432!"},{id:"earth_dam",key:"4",name:"\u0412\u0440\u0435\u043C\u0435\u043D\u043D\u0430\u044F \u043D\u0430\u0441\u044B\u043F\u043D\u0430\u044F \u0434\u0430\u043C\u0431\u0430",short:"\u041F\u0435\u0440\u0435\u043C\u044B\u0447\u043A\u0430",costPerM3:5.2,costLabel:"5.2 \u20BD/\u043C\xB3 (-70% \u043E\u0442\u0432\u0430\u043B)",desc:"\u0411\u044B\u0441\u0442\u0440\u0430\u044F \u0441\u0442\u0440\u043E\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u043F\u0435\u0440\u0435\u043C\u044B\u0447\u043A\u0430 \u0438\u0437 \u0433\u0440\u0443\u043D\u0442\u0430 \u0434\u043B\u044F \u043E\u0441\u0443\u0448\u0435\u043D\u0438\u044F \u043A\u043E\u0442\u043B\u043E\u0432\u0430\u043D\u0430 \u043F\u043B\u043E\u0442\u0438\u043D\u044B \u0438\u043B\u0438 \u0437\u0430\u0449\u0438\u0442\u044B \u0431\u0435\u0440\u0435\u0433\u043E\u0432. \u0420\u0430\u0437\u043C\u044B\u0432\u0430\u0435\u0442\u0441\u044F \u043F\u0440\u0438 \u043F\u0435\u0440\u0435\u043B\u0438\u0432\u0435!"},{id:"concrete_dam",key:"5",name:"\u041E\u0431\u044A\u0451\u043C\u043D\u0430\u044F \u0431\u0435\u0442\u043E\u043D\u043D\u0430\u044F \u043F\u043B\u043E\u0442\u0438\u043D\u0430",short:"3D \u041F\u043B\u043E\u0442\u0438\u043D\u0430",costPerM3:22,costLabel:"22 \u20BD/\u043C\xB3 (3 \u044D\u0442\u0430\u043F\u0430)",desc:"\u0412\u043E\u0437\u0432\u043E\u0434\u0438\u0442\u0441\u044F \u0432 3 \u0441\u0442\u0430\u0434\u0438\u0438 \u0441 \u0431\u0430\u0448\u0435\u043D\u043D\u044B\u043C\u0438 \u043A\u0440\u0430\u043D\u0430\u043C\u0438: \u0448\u043F\u0443\u043D\u0442 \u2192 \u0430\u0440\u043C\u043E\u043A\u0430\u0440\u043A\u0430\u0441 \u0438 \u043E\u043F\u0430\u043B\u0443\u0431\u043A\u0430 \u2192 3D-\u043C\u043E\u043D\u043E\u043B\u0438\u0442 \u0441 \u043F\u0430\u0440\u0430\u043F\u0435\u0442\u043E\u043C! \u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0432\u044B\u0441\u043E\u0442\u0443 \u044F\u0440\u0443\u0441\u0430 \u0432\u043D\u0438\u0437\u0443."},{id:"foundation",key:"6",name:"\u0421\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u0444\u0443\u043D\u0434\u0430\u043C\u0435\u043D\u0442 \u0438 \u041A\u043E\u043D\u0442\u0440\u0444\u043E\u0440\u0441",short:"\u041A\u043E\u043D\u0442\u0440\u0444\u043E\u0440\u0441",costPerCell:135,costLabel:"135 \u20BD/\u0431\u043B\u043E\u043A",desc:"\u0426\u0435\u043C\u0435\u043D\u0442\u0430\u0446\u0438\u044F \u043E\u0441\u043D\u043E\u0432\u0430\u043D\u0438\u044F \u0434\u043E \u0441\u043A\u0430\u043B\u044B \u0438 \u043C\u043E\u043D\u0442\u0430\u0436 \u043E\u0431\u044A\u0451\u043C\u043D\u044B\u0445 3D-\u043A\u043E\u043D\u0442\u0440\u0444\u043E\u0440\u0441\u043E\u0432 \u043F\u043B\u043E\u0442\u0438\u043D\u044B: \u0443\u0431\u0438\u0440\u0430\u0435\u0442 \u0444\u0438\u043B\u044C\u0442\u0440\u0430\u0446\u0438\u044E \u043F\u043E\u0434 \u043F\u043E\u0434\u043E\u0448\u0432\u043E\u0439 \u0438 \u0434\u0435\u0440\u0436\u0438\u0442 \u0441\u0432\u0435\u0440\u0445\u043D\u0430\u043F\u043E\u0440!"},{id:"spillway",key:"7",name:"\u0412\u043E\u0434\u043E\u0441\u0431\u0440\u043E\u0441 \u0441 \u0441\u0435\u0433\u043C\u0435\u043D\u0442\u043D\u044B\u043C \u0437\u0430\u0442\u0432\u043E\u0440\u043E\u043C",short:"\u0412\u043E\u0434\u043E\u0441\u0431\u0440\u043E\u0441",costFlat:4400,costLabel:"4 400 \u20BD",desc:"\u0411\u0435\u0442\u043E\u043D\u043D\u044B\u0439 \u0432\u043E\u0434\u043E\u0441\u043B\u0438\u0432 \u0441 \u043F\u043E\u0434\u044A\u0451\u043C\u043D\u044B\u043C \u0441\u0442\u0430\u043B\u044C\u043D\u044B\u043C \u0437\u0430\u0442\u0432\u043E\u0440\u043E\u043C \u0438 \u043D\u043E\u0441\u043A\u043E\u043C-\u0442\u0440\u0430\u043C\u043F\u043B\u0438\u043D\u043E\u043C: \u0431\u0435\u0437\u043E\u043F\u0430\u0441\u043D\u043E \u0441\u0431\u0440\u0430\u0441\u044B\u0432\u0430\u0435\u0442 \u043F\u0430\u0432\u043E\u0434\u043E\u043A \u044D\u0444\u0444\u0435\u043A\u0442\u043D\u043E\u0439 3D-\u0441\u0442\u0440\u0443\u0451\u0439."},{id:"turbine_kaplan",key:"8",name:"\u0413\u0438\u0434\u0440\u043E\u0443\u0437\u0435\u043B \u041A\u0430\u043F\u043B\u0430\u043D\u0430 (\u0440\u0443\u0441\u043B\u043E\u0432\u043E\u0439)",short:"\u041A\u0430\u043F\u043B\u0430\u043D 7 \u041C\u0412\u0442",turbineType:"kaplan",costFlat:9500,costLabel:"9 500 \u20BD",desc:"\u0412\u043E\u0434\u043E\u043F\u0440\u0438\u0451\u043C\u043D\u0438\u043A \u0441 \u0441\u043E\u0440\u043E\u0443\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u044E\u0449\u0435\u0439 \u0440\u0435\u0448\u0451\u0442\u043A\u043E\u0439, \u0432\u043E\u0434\u043E\u0432\u043E\u0434 \u0438 \u043C\u0430\u0448\u0438\u043D\u043D\u044B\u0439 \u0437\u0430\u043B \u0434\u043B\u044F \u043C\u0430\u043B\u044B\u0445 \u0438 \u0441\u0440\u0435\u0434\u043D\u0438\u0445 \u043D\u0430\u043F\u043E\u0440\u043E\u0432 (2.5\u201316 \u043C)."},{id:"turbine_francis",key:"9",name:"\u0413\u0438\u0434\u0440\u043E\u0443\u0437\u0435\u043B \u0424\u0440\u044D\u043D\u0441\u0438\u0441\u0430 (\u043D\u0430\u043F\u043E\u0440\u043D\u044B\u0439)",short:"\u0424\u0440\u044D\u043D\u0441\u0438\u0441 19 \u041C\u0412\u0442",turbineType:"francis",costFlat:23500,costLabel:"23 500 \u20BD",desc:"\u041C\u043E\u0449\u043D\u044B\u0439 \u0433\u0438\u0434\u0440\u043E\u0430\u0433\u0440\u0435\u0433\u0430\u0442 \u0441\u043E \u0441\u0442\u0430\u043B\u044C\u043D\u044B\u043C \u043D\u0430\u043F\u043E\u0440\u043D\u044B\u043C \u0442\u0440\u0443\u0431\u043E\u043F\u0440\u043E\u0432\u043E\u0434\u043E\u043C \u0434\u043B\u044F \u0441\u0440\u0435\u0434\u043D\u0438\u0445 \u0438 \u0432\u044B\u0441\u043E\u043A\u0438\u0445 \u043F\u043B\u043E\u0442\u0438\u043D \u0441 \u043A\u043E\u043D\u0442\u0440\u0444\u043E\u0440\u0441\u0430\u043C\u0438 (8\u201338 \u043C, \u041A\u041F\u0414 93.5%)."},{id:"turbine_pelton",key:"0",name:"\u0413\u0438\u0434\u0440\u043E\u0443\u0437\u0435\u043B \u041F\u0435\u043B\u0442\u043E\u043D\u0430 (\u043A\u043E\u0432\u0448\u043E\u0432\u044B\u0439)",short:"\u041F\u0435\u043B\u0442\u043E\u043D 30 \u041C\u0412\u0442",turbineType:"pelton",costFlat:32e3,costLabel:"32 000 \u20BD",desc:"\u0412\u044B\u0441\u043E\u043A\u043E\u043D\u0430\u043F\u043E\u0440\u043D\u0430\u044F \u0434\u0435\u0440\u0438\u0432\u0430\u0446\u0438\u043E\u043D\u043D\u0430\u044F \u0413\u042D\u0421 (13\u201352 \u043C) \u0441 \u0434\u043B\u0438\u043D\u043D\u044B\u043C \u043D\u0430\u043F\u043E\u0440\u043D\u044B\u043C \u0432\u043E\u0434\u043E\u0432\u043E\u0434\u043E\u043C \u0434\u043B\u044F \u0433\u043B\u0443\u0431\u043E\u043A\u0438\u0445 \u043A\u0430\u043D\u044C\u043E\u043D\u043E\u0432 \u0438 \u043A\u0440\u0443\u0442\u044B\u0445 \u0441\u0431\u0440\u043E\u0441\u043E\u0432 \u0441 \u043A\u0430\u043D\u0430\u043B\u0430."},{id:"powerline",key:"P",name:"\u041F\u043E\u0434\u0441\u0442\u0430\u043D\u0446\u0438\u044F \u041E\u0420\u0423 110 \u043A\u0412 \u0438 \u041B\u042D\u041F",short:"\u041E\u0420\u0423 / \u041B\u042D\u041F",costPerMeter:13,costLabel:"6 800 \u20BD \u041E\u0420\u0423 / \u041B\u042D\u041F",desc:"\u041A\u043B\u0438\u043A \u043F\u043E \u0433\u043E\u0440\u043E\u0434\u0443 \u2014 \u0442\u044F\u043D\u0435\u0442 \u0430\u0436\u0443\u0440\u043D\u044B\u0435 \u043E\u043F\u043E\u0440\u044B \u041B\u042D\u041F 110 \u043A\u0412. \u041A\u043B\u0438\u043A \u043D\u0430 \u0431\u0435\u0440\u0435\u0433\u0443 \u0443 \u0413\u042D\u0421 \u2014 \u0441\u0442\u0440\u043E\u0438\u0442 3D-\u043F\u043E\u0434\u0441\u0442\u0430\u043D\u0446\u0438\u044E \u041E\u0420\u0423 110 \u043A\u0412 (\u0441\u043D\u0438\u0436\u0430\u0435\u0442 \u043F\u043E\u0442\u0435\u0440\u0438 \u0441 16% \u0434\u043E 3%)!"},{id:"demolish",key:"X",name:"\u0414\u0435\u043C\u043E\u043D\u0442\u0430\u0436 / \u0413\u0438\u0434\u0440\u043E\u043C\u043E\u043B\u043E\u0442",short:"\u0421\u043D\u043E\u0441",costFlat:250,costLabel:"250 \u20BD",desc:"\u0414\u0435\u043C\u043E\u043D\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0433\u0438\u0434\u0440\u043E\u0430\u0433\u0440\u0435\u0433\u0430\u0442, \u0437\u0430\u0442\u0432\u043E\u0440, \u043F\u043E\u0434\u0441\u0442\u0430\u043D\u0446\u0438\u044E \u0438\u043B\u0438 \u0440\u0430\u0437\u043E\u0431\u0440\u0430\u0442\u044C \u0441\u0435\u043A\u0446\u0438\u044E \u0431\u0435\u0442\u043E\u043D\u043D\u043E\u0439 \u043F\u043B\u043E\u0442\u0438\u043D\u044B."}],mu={kaplan:{id:"kaplan",name:"\u041A\u0430\u043F\u043B\u0430\u043D\u0430 \u041F\u041B-7",ratedMW:7,minHead:2.2,optHead:8.2,maxHead:21,headSigma:12,maxArea:5.1,peakEta:.915,frictionK:17e-5,upkeepPerSec:10,cost:9500,color:3900150},francis:{id:"francis",name:"\u0424\u0440\u044D\u043D\u0441\u0438\u0441\u0430 \u0420\u041E-19",ratedMW:19,minHead:5,optHead:16.5,maxHead:44,headSigma:16,maxArea:6.5,peakEta:.938,frictionK:11e-5,upkeepPerSec:23,cost:23500,color:16096779},pelton:{id:"pelton",name:"\u041F\u0435\u043B\u0442\u043E\u043D\u0430 \u041A-30",ratedMW:30,minHead:9,optHead:25.5,maxHead:62,headSigma:21,maxArea:5.5,peakEta:.928,frictionK:9e-5,upkeepPerSec:31,cost:32e3,color:1096065}},xi={startingCash:56e3,baseRatePerMWSec:345,irrigationBonusPerSec:110,overSupplyExportFactor:.4,loanChunk:25e3,loanInterestPerSec:42e-5,maxLoan:15e4};function oc(s){let t=(s%24+24)%24;return t>=0&&t<6?.58:t>=6&&t<10.5?1.62:t>=10.5&&t<17?1.05:t>=17&&t<22?2.35:.82}function gu(s){let t=(s%24+24)%24;return t>=0&&t<6?{label:"\u041D\u043E\u0447\u043D\u043E\u0439 \u043C\u0438\u043D\u0438\u043C\u0443\u043C (\u043A\u043E\u043F\u0438\u0442\u0435 \u0432\u043E\u0434\u0443)",cls:"offpeak"}:t>=6&&t<10.5?{label:"\u0423\u0442\u0440\u0435\u043D\u043D\u0438\u0439 \u043F\u0438\u043A \xD71.62",cls:"peak"}:t>=10.5&&t<17?{label:"\u0414\u043D\u0435\u0432\u043D\u043E\u0439 \u043F\u043E\u043B\u0443\u043F\u0438\u043A \xD71.05",cls:"mid"}:t>=17&&t<22?{label:"\u0412\u0435\u0447\u0435\u0440\u043D\u0438\u0439 \u0421\u0423\u041F\u0415\u0420-\u041F\u0418\u041A \xD72.35",cls:"superpeak"}:{label:"\u0421\u043F\u0430\u0434 \u043D\u0430\u0433\u0440\u0443\u0437\u043A\u0438 \xD70.82",cls:"offpeak"}}var vs=[{id:"posad",name:"\u0420\u0435\u0447\u043D\u043E\u0439 \u041F\u043E\u0441\u0430\u0434",subtitle:"\u0414\u0435\u0440\u0435\u0432\u043E\u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u0438 \u044E\u0436\u043D\u0430\u044F \u043F\u0440\u0438\u0441\u0442\u0430\u043D\u044C",x:-158,z:224,plateauRadius:58,baseElevation:17.5,startPop:440,baseDemandMW:.36,demandPerBuilding:.075,tariffBonus:1,connectedAtStart:!0,accent:6333946,archetype:"town"},{id:"agro",name:"\u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u0430",subtitle:"\u0417\u0435\u0440\u043D\u043E\u0432\u044B\u0435 \u0442\u0435\u0440\u0440\u0430\u0441\u044B, \u0442\u0435\u043F\u043B\u0438\u0446\u044B \u0438 \u043E\u0440\u043E\u0441\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u0443\u0437\u0435\u043B",x:222,z:112,plateauRadius:64,baseElevation:18.2,startPop:590,baseDemandMW:.48,demandPerBuilding:.085,tariffBonus:1.1,needsIrrigation:!0,irrigationTarget:{x:168,z:98,radius:38},connectedAtStart:!1,accent:3462041,archetype:"agro"},{id:"sever",name:"\u0421\u0435\u0432\u0435\u0440\u043E\u0431\u043E\u0440\u0441\u043A",subtitle:"\u0413\u043E\u0440\u043D\u0430\u044F \u043C\u0435\u0442\u0435\u043E\u0441\u0442\u0430\u043D\u0446\u0438\u044F \u0438 \u043B\u0435\u0441\u043E\u043F\u0438\u043B\u044C\u043D\u044B\u0439 \u0443\u0437\u0435\u043B",x:-214,z:-218,plateauRadius:54,baseElevation:35,startPop:510,baseDemandMW:.44,demandPerBuilding:.09,tariffBonus:1.14,connectedAtStart:!1,accent:3003583,archetype:"town"},{id:"kamen",name:"\u041A\u0430\u043C\u0435\u043D\u043D\u043E\u0433\u043E\u0440\u0441\u043A",subtitle:"\u0413\u043E\u0440\u043D\u043E\u0440\u0443\u0434\u043D\u044B\u0439 \u043A\u043E\u043C\u0431\u0438\u043D\u0430\u0442 \u0438 \u044D\u043B\u0435\u043A\u0442\u0440\u043E\u043C\u0435\u0442\u0430\u043B\u043B\u0443\u0440\u0433\u0438\u044F",x:208,z:-182,plateauRadius:60,baseElevation:34,startPop:920,baseDemandMW:.88,demandPerBuilding:.145,tariffBonus:1.24,connectedAtStart:!1,accent:16498468,archetype:"industrial"},{id:"svetlograd",name:"\u0421\u0432\u0435\u0442\u043B\u043E\u0433\u0440\u0430\u0434",subtitle:"\u0421\u0442\u043E\u043B\u0438\u0446\u0430 \u0434\u043E\u043B\u0438\u043D\u044B, \u0442\u0435\u0445\u043D\u043E\u043F\u0430\u0440\u043A \u0438 \u0432\u044B\u0441\u043E\u0442\u043D\u044B\u0439 \u0446\u0435\u043D\u0442\u0440",x:-218,z:-18,plateauRadius:74,baseElevation:24.8,startPop:1720,baseDemandMW:1.3,demandPerBuilding:.185,tariffBonus:1.2,connectedAtStart:!1,accent:10980346,archetype:"metropolis"}],cr=[{id:"first_watt",title:"\u041F\u0435\u0440\u0432\u044B\u0439 \u0442\u043E\u043A \u0432 \u0441\u0435\u0442\u0438!",desc:"\u0417\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u0435 \u0437\u0430\u043B\u0438\u0432\u043A\u0443 \u043F\u043B\u043E\u0442\u0438\u043D\u044B, \u0437\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u0435 \u0433\u0438\u0434\u0440\u043E\u0430\u0433\u0440\u0435\u0433\u0430\u0442 \u0438 \u0432\u044B\u0434\u0430\u0439\u0442\u0435 0.5 \u041C\u0412\u0442 \u043C\u043E\u0449\u043D\u043E\u0441\u0442\u0438.",reward:11e3,check:s=>s.totalMW>=.5},{id:"reinforced_dam",title:"\u041D\u0430\u0434\u0451\u0436\u043D\u044B\u0439 \u0433\u0438\u0434\u0440\u043E\u0443\u0437\u0435\u043B \u0438 \u041E\u0420\u0423 110 \u043A\u0412",desc:"\u0423\u043A\u0440\u0435\u043F\u0438\u0442\u0435 \u043F\u043B\u043E\u0442\u0438\u043D\u0443 \u043C\u0438\u043D\u0438\u043C\u0443\u043C 6 \u0431\u043B\u043E\u043A\u0430\u043C\u0438 \u043A\u043E\u043D\u0442\u0440\u0444\u043E\u0440\u0441\u043E\u0432/\u0446\u0435\u043C\u0435\u043D\u0442\u0430\u0446\u0438\u0438 \u0438\u043B\u0438 \u043F\u043E\u0441\u0442\u0440\u043E\u0439\u0442\u0435 \u043F\u043E\u0434\u0441\u0442\u0430\u043D\u0446\u0438\u044E \u041E\u0420\u0423 110 \u043A\u0412.",reward:13e3,check:s=>s.reinforcedCells>=6||s.substations>=1},{id:"custom_canal",title:"\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439 \u0434\u0435\u0440\u0438\u0432\u0430\u0446\u0438\u043E\u043D\u043D\u044B\u0439 \u043A\u0430\u043D\u0430\u043B",desc:"\u041F\u0440\u043E\u043A\u043E\u043F\u0430\u0439\u0442\u0435 \u043D\u0435 \u043C\u0435\u043D\u0435\u0435 550 \u043C\xB3 \u043F\u043E\u0440\u043E\u0434\u044B \u043F\u043E\u0434 \u0434\u0435\u0440\u0438\u0432\u0430\u0446\u0438\u043E\u043D\u043D\u044B\u0439, \u043E\u0431\u0432\u043E\u0434\u043D\u043E\u0439 \u0438\u043B\u0438 \u043E\u0440\u043E\u0441\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u043A\u0430\u043D\u0430\u043B.",reward:14e3,check:s=>s.excavatedM3>=550},{id:"irrigation_done",title:"\u0416\u0438\u0432\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u0432\u043B\u0430\u0433\u0430 \u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u044B",desc:"\u041F\u043E\u0434\u0432\u0435\u0434\u0438\u0442\u0435 \u0432\u043E\u0434\u0443 \u0441\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u043C \u043A\u0430\u043D\u0430\u043B\u043E\u043C \u043A \u043E\u0440\u043E\u0441\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u043C\u0443 \u0431\u0430\u0441\u0441\u0435\u0439\u043D\u0443 \u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u044B.",reward:18e3,check:s=>s.agroIrrigated===!0},{id:"power_10mw",title:"\u041F\u0440\u043E\u043C\u044B\u0448\u043B\u0435\u043D\u043D\u044B\u0439 \u043A\u0430\u0441\u043A\u0430\u0434 (10 \u041C\u0412\u0442)",desc:"\u0414\u043E\u0441\u0442\u0438\u0433\u043D\u0438\u0442\u0435 \u0441\u0443\u043C\u043C\u0430\u0440\u043D\u043E\u0439 \u0433\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u0438 10 \u041C\u0412\u0442 \u043D\u0430 \u0432\u0430\u0448\u0438\u0445 \u0433\u0438\u0434\u0440\u043E\u0430\u0433\u0440\u0435\u0433\u0430\u0442\u0430\u0445.",reward:25e3,check:s=>s.totalMW>=10},{id:"all_cities_grid",title:"\u0415\u0434\u0438\u043D\u043E\u0435 \u044D\u043D\u0435\u0440\u0433\u043E\u043A\u043E\u043B\u044C\u0446\u043E 5 \u0433\u043E\u0440\u043E\u0434\u043E\u0432",desc:"\u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0438\u0442\u0435 \u043B\u0438\u043D\u0438\u044F\u043C\u0438 \u041B\u042D\u041F \u0432\u0441\u0435 5 \u0433\u043E\u0440\u043E\u0434\u043E\u0432 \u0434\u043E\u043B\u0438\u043D\u044B \u0438 \u0432\u044B\u0434\u0430\u0439\u0442\u0435 \u043E\u0442 5 \u041C\u0412\u0442.",reward:32e3,check:s=>s.connectedCities>=5&&s.totalMW>=5},{id:"growing_valley",title:"\u041C\u0435\u0433\u0430\u043F\u043E\u043B\u0438\u0441\u044B \u0436\u0438\u0432\u043E\u0439 \u0432\u043E\u0434\u044B",desc:"\u0420\u0430\u0437\u0432\u0435\u0439\u0442\u0435 \u0441\u0430\u043C\u043E\u0440\u0430\u0441\u0442\u0443\u0449\u0438\u0435 \u0433\u043E\u0440\u043E\u0434\u0430 \u0434\u043E\u043B\u0438\u043D\u044B \u0434\u043E \u0441\u043E\u0432\u043E\u043A\u0443\u043F\u043D\u043E\u0433\u043E \u043D\u0430\u0441\u0435\u043B\u0435\u043D\u0438\u044F 10 000 \u0436\u0438\u0442\u0435\u043B\u0435\u0439.",reward:44e3,check:s=>s.totalPopulation>=1e4},{id:"cascade_30mw",title:"\u0424\u043B\u0430\u0433\u043C\u0430\u043D \u0433\u0438\u0434\u0440\u043E\u044D\u043D\u0435\u0440\u0433\u0435\u0442\u0438\u043A\u0438 (30 \u041C\u0412\u0442)",desc:"\u0412\u044B\u0432\u0435\u0434\u0438\u0442\u0435 \u043A\u0430\u0441\u043A\u0430\u0434 \u0413\u042D\u0421 \u043D\u0430 \u043F\u0438\u043A\u043E\u0432\u0443\u044E \u043C\u043E\u0449\u043D\u043E\u0441\u0442\u044C 30 \u041C\u0412\u0442!",reward:68e3,check:s=>s.totalMW>=30}];function xu(s=navigator,t=window){let e=(s.maxTouchPoints||0)>0&&(/Android|iPhone|iPad|iPod|Mobile/i.test(s.userAgent||"")||t.matchMedia&&t.matchMedia("(pointer: coarse)").matches),i=s.deviceMemory>0&&s.deviceMemory<=4||s.hardwareConcurrency>0&&s.hardwareConcurrency<=4,n=!e&&!i&&(s.hardwareConcurrency||8)>=8;return{touch:!!e,weak:!!i,low:!!(e||i),recommendedQuality:e||i?"low":n?"high":"medium"}}function _u(s=window){try{let t=s.location&&s.location.search||"",e=new URLSearchParams(t);return e.get("safe")==="1"||e.get("safe")===""}catch{return!1}}var lg="2026-10-31 17:22",ya=null;function ac(){if(ya)return ya;let s={webgl2:!1,webgl:!1,floatTex:!1,halfFloatTex:!1,vendor:"\u2014",renderer:"\u2014",reason:null};try{let t=document.createElement("canvas");t.width=16,t.height=16;let e=t.getContext("webgl2",{failIfMajorPerformanceCaveat:!1});if(e?(s.webgl2=!0,s.webgl=!0,s.floatTex=!!e.getExtension("EXT_color_buffer_float"),s.halfFloatTex=!0):(e=t.getContext("webgl",{failIfMajorPerformanceCaveat:!1})||t.getContext("experimental-webgl",{}),e&&(s.webgl=!0,s.floatTex=!!e.getExtension("OES_texture_float"),s.halfFloatTex=!!e.getExtension("OES_texture_half_float"))),!e)return s.reason="\u0411\u0440\u0430\u0443\u0437\u0435\u0440 \u043D\u0435 \u0432\u044B\u0434\u0430\u043B WebGL-\u043A\u043E\u043D\u0442\u0435\u043A\u0441\u0442 (\u0432\u044B\u043A\u043B\u044E\u0447\u0435\u043D\u043E \u0430\u043F\u043F\u0430\u0440\u0430\u0442\u043D\u043E\u0435 \u0443\u0441\u043A\u043E\u0440\u0435\u043D\u0438\u0435).",ya=s,s;let i=e.getExtension("WEBGL_debug_renderer_info");i?(s.vendor=e.getParameter(i.UNMASKED_VENDOR_WEBGL)||"\u2014",s.renderer=e.getParameter(i.UNMASKED_RENDERER_WEBGL)||"\u2014"):(s.vendor=e.getParameter(e.VENDOR)||"\u2014",s.renderer=e.getParameter(e.RENDERER)||"\u2014")}catch(t){s.reason=t.message}return ya=s,s}function yu(s={}){let t=ac();return[`\u041A\u0410\u0421\u041A\u0410\u0414: \u0416\u0438\u0432\u0430\u044F \u0412\u043E\u0434\u0430 \xB7 \u0441\u0431\u043E\u0440\u043A\u0430 ${lg}`,`GPU: ${t.renderer} (${t.vendor})`,`WebGL2: ${t.webgl2?"\u0434\u0430":"\u043D\u0435\u0442"} \xB7 FloatTex: ${t.floatTex?"RGBA32F":t.halfFloatTex?"RGBA16F":"Uint8 fallback"}`,`\u041A\u0430\u0434\u0440: ${s.fps||0} FPS \xB7 \u0424\u0438\u0437\u0438\u043A\u0430 \u0432\u043E\u0434\u044B: ${(s.hydroMs||0).toFixed(2)} \u043C\u0441/\u043A\u0430\u0434\u0440`,`\u0421\u0435\u0442\u043A\u0430 \u0432\u043E\u0434\u044B: ${s.grid||"\u2014"} \xB7 \u0410\u043A\u0442\u0438\u0432\u043D\u044B\u0435 \u0442\u0430\u0439\u043B\u044B 8\xD78: ${s.activeTiles||0}/${s.totalTiles||0} (\u043F\u0440\u043E\u043F\u0443\u0441\u043A \u0441\u0443\u0445\u0438\u0445 \u0441\u043A\u043B\u043E\u043D\u043E\u0432)`,`\u041F\u043E\u0434\u0448\u0430\u0433\u0438 CFL: ${s.substeps||0} \xB7 \u041C\u0430\u0441\u0441\u0430 \u0432\u043E\u0434\u044B: ${((s.waterVolumeM3||0)/1e3).toFixed(1)} \u0442\u044B\u0441. \u043C\xB3`,`Draw calls: ${s.drawCalls||0} \xB7 \u0422\u0440\u0435\u0443\u0433\u043E\u043B\u044C\u043D\u0438\u043A\u0438: ${s.triangles||0} \xB7 \u0418\u043D\u0441\u0442\u0430\u043D\u0441\u044B \u0437\u0434\u0430\u043D\u0438\u0439: ${s.cityBuildings||0}`,`\u042F\u0434\u0440\u043E \u044D\u043A\u043E\u043D\u043E\u043C\u0438\u043A\u0438: FixedClock 30 \u0413\u0446 (\u041F\u0435\u0440\u0435\u043F\u043B\u0451\u0442) \xB7 \u0422\u0435\u043D\u0438: ${s.shadows||"\u0432\u044B\u043A\u043B"}`].join(`
`)}function J(s,t,e){return s<t?t:s>e?e:s}function hi(s,t,e){let i=J((e-s)/(t-s||1e-6),0,1);return i*i*(3-2*i)}function ne(s,t,e){return s+(t-s)*e}function hr(s=20261031){let t=s>>>0||1;return()=>{t=t+1831565813|0;let e=Math.imul(t^t>>>15,1|t);return e=e+Math.imul(e^e>>>7,61|e)^e,((e^e>>>14)>>>0)/4294967296}}function va(s,t){let e=Math.imul(s,374761393)+Math.imul(t,668265263);return e=Math.imul(e^e>>>13,1274126177),((e^e>>>16)>>>0)/4294967295}function vu(s,t){let e=Math.floor(s),i=Math.floor(t),n=s-e,r=t-i,o=n*n*(3-2*n),a=r*r*(3-2*r),l=va(e,i),c=va(e+1,i),h=va(e,i+1),d=va(e+1,i+1);return ne(ne(l,c,o),ne(h,d,o),a)*2-1}function lc(s,t,e=5,i=2.05,n=.5){let r=.5,o=1,a=0,l=0;for(let c=0;c<e;c++)a+=r*vu(s*o,t*o),l+=r,o*=i,r*=n;return a/(l||1)}function Mu(s,t,e=4){let i=.5,n=1,r=0,o=0;for(let a=0;a<e;a++){let l=1-Math.abs(vu(s*n,t*n));r+=i*l*l,o+=i,n*=2.1,i*=.5}return r/(o||1)}function Ma(s,t,e){let i=1/0,n=0,r=10,o=0,a=1,l=0,c=0;for(let d=0;d<e.length-1;d++)c+=Math.hypot(e[d+1].x-e[d].x,e[d+1].z-e[d].z);let h=0;for(let d=0;d<e.length-1;d++){let u=e[d],f=e[d+1],g=f.x-u.x,_=f.z-u.z,m=g*g+_*_||1e-6,p=Math.sqrt(m),b=J(((s-u.x)*g+(t-u.z)*_)/m,0,1),T=u.x+g*b,y=u.z+_*b,v=(s-T)*(s-T)+(t-y)*(t-y);v<i&&(i=v,n=ne(u.bed,f.bed,b),r=ne(u.width,f.width,b),o=g/p,a=_/p,l=(h+p*b)/(c||1)),h+=p}return{dist:Math.sqrt(i),bed:n,width:r,tx:o,tz:a,s:l}}var Wi={bystritsa:{main:[{x:-92,z:-376,bed:35.4,width:17},{x:-58,z:-322,bed:32.8,width:21},{x:-22,z:-262,bed:30,width:29},{x:4,z:-206,bed:27.6,width:22},{x:12,z:-158,bed:25,width:14},{x:16,z:-112,bed:21.6,width:17},{x:96,z:-56,bed:19,width:21},{x:134,z:32,bed:16.4,width:22},{x:88,z:108,bed:13.6,width:23},{x:4,z:122,bed:10.8,width:22},{x:-46,z:198,bed:8.4,width:25},{x:-26,z:294,bed:6.3,width:29},{x:12,z:384,bed:4.4,width:34}],eastCreek:[{x:152,z:-374,bed:40.5,width:11},{x:102,z:-324,bed:36.6,width:12},{x:44,z:-286,bed:32.8,width:14},{x:-16,z:-258,bed:29.8,width:16}],westCreek:[{x:-374,z:68,bed:27.5,width:10},{x:-268,z:96,bed:21.8,width:11},{x:-146,z:132,bed:14.8,width:12},{x:-46,z:194,bed:8.5,width:14}],gorges:[{x:12,z:-158,spanZ:48,strength:24.5}],seedOffset:0,widthScale:1,soilBonus:0},rapids:{main:[{x:-108,z:-376,bed:42.5,width:16},{x:-64,z:-312,bed:38.2,width:24},{x:-18,z:-248,bed:33.4,width:13},{x:6,z:-182,bed:28,width:25},{x:22,z:-98,bed:22,width:14},{x:118,z:-22,bed:17.8,width:20},{x:128,z:58,bed:15.6,width:21},{x:52,z:132,bed:11.4,width:22},{x:-38,z:208,bed:8.1,width:25},{x:-14,z:302,bed:6,width:28},{x:16,z:384,bed:4.3,width:32}],eastCreek:[{x:168,z:-374,bed:46,width:11},{x:96,z:-316,bed:40.5,width:13},{x:-12,z:-268,bed:35,width:15}],westCreek:[{x:-374,z:74,bed:30,width:10},{x:-220,z:120,bed:19.5,width:12},{x:-38,z:204,bed:8.2,width:14}],gorges:[{x:-18,z:-248,spanZ:44,strength:26.5},{x:22,z:-98,spanZ:42,strength:23}],seedOffset:37.4,widthScale:.95,soilBonus:-.5},delta:{main:[{x:-78,z:-376,bed:30.2,width:22},{x:-36,z:-292,bed:27.6,width:28},{x:8,z:-152,bed:22.8,width:19},{x:28,z:-96,bed:19.8,width:24},{x:112,z:-34,bed:17.5,width:26},{x:132,z:42,bed:15.8,width:27},{x:76,z:118,bed:12.8,width:28},{x:-8,z:146,bed:10.2,width:29},{x:-44,z:224,bed:7.8,width:32},{x:-12,z:312,bed:5.9,width:36},{x:14,z:384,bed:4.3,width:40}],eastCreek:[{x:158,z:-374,bed:34.5,width:13},{x:84,z:-296,bed:29.8,width:15},{x:-8,z:-232,bed:25.6,width:17}],westCreek:[{x:-374,z:82,bed:24,width:12},{x:-212,z:144,bed:14.5,width:14},{x:-44,z:218,bed:8,width:17}],gorges:[{x:8,z:-152,spanZ:52,strength:16.5}],seedOffset:91.2,widthScale:1.22,soilBonus:2.1}},Xy=Wi.bystritsa.main,qy=Wi.bystritsa.eastCreek;function bn(s,t,e="bystritsa",i=0,n=s){let r=Wi[e]||Wi.bystritsa,{bedrock:o,soil:a,concrete:l,h:c,hu:h,hv:d,wetness:u}=t,f=Qt.size*.5,g=Qt.size/s,_=r.seedOffset,m=J(i,0,s),p=J(n,0,s);for(let b=m;b<p;b++){let T=-f+(b+.5)*g,y=J((f-T)/Qt.size,0,1);for(let v=0;v<s;v++){let S=-f+(v+.5)*g,A=b*s+v,x=Math.abs(S)/f,E=Math.pow(J((x-.54)/.46,0,1),1.82)*38,R=hi(-150,-378,T)*(18+21*Mu(S*.009+3.1+_,T*.009-1.7,4)),I=lc(S*.0052+11.3+_,T*.0052+4.7,5)*8.4,D=lc(S*.021-5.2+_,T*.021+8.9,3)*1.85,C=12+y*(e==="rapids"?27.5:e==="delta"?18.5:23.5)+E+R+I+D,P=!1;for(let st=0;st<r.gorges.length;st++){let Tt=r.gorges[st],Yt=(T-Tt.z)/Tt.spanZ;if(Math.abs(Yt)<1.35){let Ut=Math.exp(-Yt*Yt*1.9),Ot=Math.abs(S-Tt.x),jt=hi(12,48,Ot)*(1-hi(78,152,Ot));C+=Ut*jt*Tt.strength,Math.abs(T-Tt.z)<Tt.spanZ*.9&&Ot<58&&(P=!0)}}let N=1-hi(18,52,Math.abs(S- -16)),q=hi(-118,-84,T)*(1-hi(82,118,T)),W=N*q;if(W>.001){let st=ne(23.8,16.4,J((T- -98)/205,0,1));C=ne(C,st,W*.8)}let tt=0;for(let st=0;st<vs.length;st++){let Tt=vs[st],Yt=Math.hypot(S-Tt.x,T-Tt.z),Ut=1-hi(Tt.plateauRadius*.68,Tt.plateauRadius*1.28,Yt);Ut>.001&&(C=ne(C,Tt.baseElevation,Ut*.95),tt=Math.max(tt,Ut))}let k=Math.hypot(S-168,T-98);if(k<40){let st=1-hi(14,40,k);C=ne(C,14.2,st*.9)}let X=Ma(S,T,r.main),H=Ma(S,T,r.eastCreek),rt=Ma(S,T,r.westCreek),lt=0,Ht=0,Bt=0,zt=0,Z=X.width*.5*r.widthScale;if(X.dist<Z*3.6){let st=1-hi(Z*.82,Z*3.4,X.dist),Tt=J(X.dist/Z,0,1),Yt=X.bed+Math.pow(Tt,2.2)*2.6;if(C=ne(C,Math.min(C,Yt+(1-st)*5.2),st),X.dist<Z*1.08){C=Math.min(C,X.bed+Math.pow(X.dist/(Z*1.08),2.4)*2.15);let Ut=X.bed+2.05;if(Ut>C+.05){lt=Ut-C;let Ot=2.25;Ht=X.tx*Ot,Bt=X.tz*Ot,zt=1}}}let Q=H.width*.5*r.widthScale;if(H.dist<Q*3.2&&T<-228){let st=1-hi(Q*.8,Q*3,H.dist),Tt=H.bed+Math.pow(J(H.dist/Q,0,1),2.1)*1.9;if(C=ne(C,Math.min(C,Tt+(1-st)*4.2),st),H.dist<Q*1.06){C=Math.min(C,H.bed+Math.pow(H.dist/(Q*1.06),2.2)*1.6);let Yt=H.bed+1.32;Yt>C+.05&&Yt-C>lt&&(lt=Yt-C,Ht=H.tx*2.35,Bt=H.tz*2.35,zt=1)}}let at=rt.width*.5*r.widthScale;if(rt.dist<at*3.1&&S<-32&&T>42&&T<228){let st=1-hi(at*.8,at*2.9,rt.dist),Tt=rt.bed+Math.pow(J(rt.dist/at,0,1),2.1)*1.8;if(C=ne(C,Math.min(C,Tt+(1-st)*3.8),st),rt.dist<at*1.05){C=Math.min(C,rt.bed+Math.pow(rt.dist/(at*1.05),2.2)*1.5);let Yt=rt.bed+1.15;Yt>C+.05&&Yt-C>lt&&(lt=Yt-C,Ht=rt.tx*2.1,Bt=rt.tz*2.1,zt=1)}}let wt=2.7+r.soilBonus+W*4+tt*1.5-hi(34,58,C)*2.2;P&&(wt=Math.min(wt,.42)),zt&&(wt=J(wt*.36,.35,1.5)),wt=J(wt,.15,8.5),o[A]=Math.max(.5,C-wt),a[A]=wt,l[A]=0,c[A]=lt,h[A]=lt*Ht,d[A]=lt*Bt,u[A]=lt>.02?1:0}}}var $e=Qt.gravity,cg=Qt.waterDensity,ba=.014,bu=ba*ba*ba*ba,Xi=26,Nt=8,Sa=class{constructor(t=208,e="bystritsa",i=!1){this.grid=t,this.presetId=e,this.count=t*t,this.dx=Qt.size/t,this.cellArea=this.dx*this.dx,this.bedrock=new Float32Array(this.count),this.soil=new Float32Array(this.count),this.concrete=new Float32Array(this.count),this.targetConcrete=new Float32Array(this.count),this.formworkWall=new Float32Array(this.count),this.buildProgress=new Float32Array(this.count),this.gateWall=new Float32Array(this.count),this.zb=new Float32Array(this.count),this.linedMask=new Uint8Array(this.count),this.earthDamMask=new Uint8Array(this.count),this.foundationMask=new Uint8Array(this.count),this.buttressYaw=new Float32Array(this.count),this.h=new Float32Array(this.count),this.hu=new Float32Array(this.count),this.hv=new Float32Array(this.count),this.dH=new Float32Array(this.count),this.dHU=new Float32Array(this.count),this.dHV=new Float32Array(this.count),this.u=new Float32Array(this.count),this.v=new Float32Array(this.count),this.vort=new Float32Array(this.count),this.sediment=new Float32Array(this.count),this.foam=new Float32Array(this.count),this.sedNext=new Float32Array(this.count),this.foamNext=new Float32Array(this.count),this.wetness=new Float32Array(this.count),this.tilesN=Math.ceil(t/Nt),this.totalTiles=this.tilesN*this.tilesN,this.tileWet=new Uint8Array(this.totalTiles),this.activeTiles=new Int32Array(this.totalTiles),this.activeTileCount=0,this.terrainDirty=!0,this.dirtyMinX=0,this.dirtyMinZ=0,this.dirtyMaxX=t-1,this.dirtyMaxZ=t-1,this.engineeredDirty=!0,this.activeBuildCells=[],this.activeBuildSet=new Uint8Array(this.count),this.activeBuildSites=[],this.turbines=[],this.spillways=[],this.substations=[],this.nextStructId=1,this.soilStockpileM3=0,this.rockStockpileM3=0,this.totalExcavatedM3=0,this.damCellCount=0,this.reinforcedCellCount=0,this.maxDamStress=0,this.totalSeepageQ=0,this.pendingPourVolumeM3=0,this.inflowMult=1,this.rainRate=0,this.lastSubsteps=0,this.lastStepMs=0,this.totalWaterVolumeM3=0,this.simTime=0,this._erosionTick=0,this.jetEmitters=[],i||this.resetValley(e)}_clearArrays(){this.bedrock.fill(0),this.soil.fill(0),this.concrete.fill(0),this.targetConcrete.fill(0),this.formworkWall.fill(0),this.buildProgress.fill(1),this.gateWall.fill(0),this.linedMask.fill(0),this.earthDamMask.fill(0),this.foundationMask.fill(0),this.buttressYaw.fill(0),this.h.fill(0),this.hu.fill(0),this.hv.fill(0),this.vort.fill(0),this.sediment.fill(0),this.foam.fill(0),this.wetness.fill(0),this.activeBuildCells=[],this.activeBuildSet.fill(0),this.activeBuildSites=[],this.turbines=[],this.spillways=[],this.substations=[],this.soilStockpileM3=0,this.rockStockpileM3=0,this.totalExcavatedM3=0,this.damCellCount=0,this.reinforcedCellCount=0,this.maxDamStress=0,this.totalSeepageQ=0,this.pendingPourVolumeM3=0,this.engineeredDirty=!0}resetValley(t=this.presetId){this.presetId=t,this._clearArrays(),bn(this.grid,this,t,0,this.grid),this.finalizeValleySetup(18)}finalizeValleySetup(t=18){this.recomputeZbRange(0,0,this.grid-1,this.grid-1),this._rebuildVelocitiesAll(),this._rebuildActiveTiles();for(let e=0;e<t;e++)this._substep(.045);this.engineeredDirty=!0}worldToGrid(t,e){let i=Qt.size*.5,n=Math.floor((t+i)/this.dx),r=Math.floor((e+i)/this.dx);return{gx:J(n,0,this.grid-1),gz:J(r,0,this.grid-1)}}gridToWorld(t,e){let i=Qt.size*.5;return{wx:-i+(t+.5)*this.dx,wz:-i+(e+.5)*this.dx}}recomputeZbRange(t,e,i,n){let r=this.grid,o=J(t,0,r-1),a=J(e,0,r-1),l=J(i,0,r-1),c=J(n,0,r-1);for(let h=a;h<=c;h++){let d=h*r;for(let u=o;u<=l;u++){let f=d+u,g=Math.max(this.concrete[f],this.formworkWall[f]);this.zb[f]=this.bedrock[f]+this.soil[f]+g+this.gateWall[f]}}this.markTerrainDirty(o,a,l,c)}markTerrainDirty(t,e,i,n){this.terrainDirty?(t<this.dirtyMinX&&(this.dirtyMinX=t),e<this.dirtyMinZ&&(this.dirtyMinZ=e),i>this.dirtyMaxX&&(this.dirtyMaxX=i),n>this.dirtyMaxZ&&(this.dirtyMaxZ=n)):(this.terrainDirty=!0,this.dirtyMinX=t,this.dirtyMinZ=e,this.dirtyMaxX=i,this.dirtyMaxZ=n)}consumeTerrainDirty(){if(!this.terrainDirty)return null;let t={x0:J(this.dirtyMinX-1,0,this.grid-1),z0:J(this.dirtyMinZ-1,0,this.grid-1),x1:J(this.dirtyMaxX+1,0,this.grid-1),z1:J(this.dirtyMaxZ+1,0,this.grid-1)};return this.terrainDirty=!1,t}sampleAtWorld(t,e){let{gx:i,gz:n}=this.worldToGrid(t,e),r=n*this.grid+i,o=this.h[r],a=this.zb[r],l=this.u[r],c=this.v[r],h=Math.hypot(l,c),d=o>.03?h/Math.sqrt($e*o):0;return{gx:i,gz:n,bed:a,bedrock:this.bedrock[r],soil:this.soil[r],concrete:this.concrete[r],targetConcrete:this.targetConcrete[r],buildProgress:this.buildProgress[r],lined:this.linedMask[r]===1,earthDam:this.earthDamMask[r]===1,reinforced:this.foundationMask[r]===1,depth:o,surface:a+o,u:l,v:c,speed:h,froude:d,vorticity:this.vort[r],sediment:this.sediment[r],foam:this.foam[r]}}excavateCanal(t,e,i,n,r,o,a=!1){let{gx:l,gz:c}=this.worldToGrid(t,e),h=Math.max(1,Math.ceil(i/this.dx)),d=0,u=0,f=0,g=J(l-h,1,this.grid-2),_=J(l+h,1,this.grid-2),m=J(c-h,1,this.grid-2),p=J(c+h,1,this.grid-2);for(let b=m;b<=p;b++)for(let T=g;T<=_;T++){let y=Math.hypot(T-l,b-c)*this.dx;if(y>i)continue;let v=b*this.grid+T;if(this.concrete[v]>.25||this.targetConcrete[v]>.25||this.gateWall[v]>.1)continue;let S=J(y/(i||1),0,1),A=S<.56?1:Math.cos((S-.56)/.44*Math.PI*.5);if(A<=.02)continue;let x=this.bedrock[v]+this.soil[v],E=n*A;if(Number.isFinite(r)){let P=S>.56?(S-.56)*4.2:0,N=r+P;if(x<=N)continue;E=Math.min(n*1.85,x-N)}if(E<=.01)continue;let R=Math.min(this.soil[v],E),I=Math.max(0,E-R),D=Math.min(Math.max(0,this.bedrock[v]-1.2),I*.58),C=(R*3.4+D*14.5)*this.cellArea*.21;!a&&d+C>o||(this.soil[v]-=R,this.bedrock[v]-=D,this.earthDamMask[v]=0,(this.h[v]>.05||R>.05)&&(this.sediment[v]=Math.min(1.4,this.sediment[v]+.55)),d+=C,u+=R*this.cellArea,f+=D*this.cellArea)}return(u>0||f>0)&&(this.soilStockpileM3+=u,this.rockStockpileM3+=f*1.15,this.totalExcavatedM3+=u+f,this.recomputeZbRange(g,m,_,p),this._activateArea(g,m,_,p)),{cost:d,excavatedM3:u+f,rockM3:f}}lineCanalConcrete(t,e,i,n,r=!1){let{gx:o,gz:a}=this.worldToGrid(t,e),l=Math.max(1,Math.ceil(i/this.dx)),c=0,h=0,d=J(o-l,1,this.grid-2),u=J(o+l,1,this.grid-2),f=J(a-l,1,this.grid-2),g=J(a+l,1,this.grid-2);for(let _=f;_<=g;_++)for(let m=d;m<=u;m++){if(Math.hypot(m-o,_-a)*this.dx>i)continue;let p=_*this.grid+m;if(this.linedMask[p]===1)continue;let b=Math.min(this.rockStockpileM3,3.5),T=b>1?58*(1-Le.rockAggregateDiscount):58;if(!r&&c+T>n)break;this.rockStockpileM3=Math.max(0,this.rockStockpileM3-b),this.linedMask[p]=1,this.earthDamMask[p]=0,c+=T,h++}return h>0&&(this.markTerrainDirty(d,f,u,g),this.engineeredDirty=!0),{cost:c,count:h}}buildEarthDam(t,e,i,n,r,o,a=!1){let{gx:l,gz:c}=this.worldToGrid(t,e),h=Math.max(1,Math.ceil(i/this.dx)),d=0,u=0,f=J(l-h,1,this.grid-2),g=J(l+h,1,this.grid-2),_=J(c-h,1,this.grid-2),m=J(c+h,1,this.grid-2);for(let p=_;p<=m;p++)for(let b=f;b<=g;b++){let T=Math.hypot(b-l,p-c)*this.dx;if(T>i)continue;let y=p*this.grid+b;if(this.concrete[y]>.2||this.targetConcrete[y]>.2)continue;let v=Math.cos(T/(i||1)*Math.PI*.46),S=n*v;if(Number.isFinite(r)){let I=this.zb[y],D=r-T/(i||1)*1.4;if(I>=D)continue;S=Math.min(n*1.75,D-I)}if(S<=.02)continue;let A=S*this.cellArea,x=Math.min(this.soilStockpileM3,A),E=A-x,R=(x*1.4+E*5.2)*.22;!a&&d+R>o||(this.soilStockpileM3=Math.max(0,this.soilStockpileM3-x),this.soil[y]+=S,this.linedMask[y]=0,this.earthDamMask[y]=1,d+=R,u+=A)}return u>0&&(this.recomputeZbRange(f,_,g,m),this._activateArea(f,_,g,m)),{cost:d,addedM3:u}}buildConcreteDam(t,e,i,n,r,o=!1,a=!1){let{gx:l,gz:c}=this.worldToGrid(t,e),h=Math.max(1,Math.ceil(i/this.dx)),d=0,u=0,f=o||a,g=J(l-h,1,this.grid-2),_=J(l+h,1,this.grid-2),m=J(c-h,1,this.grid-2),p=J(c+h,1,this.grid-2);for(let b=m;b<=p;b++)for(let T=g;T<=_;T++){let y=Math.hypot(T-l,b-c)*this.dx;if(y>i)continue;let v=b*this.grid+T;if(this.gateWall[v]>.05)continue;let S=y/(i||1),A=S<.64?n:n-(S-.64)*3.4,x=Math.max(this.concrete[v],this.targetConcrete[v]),E=this.bedrock[v]+this.soil[v]+x;if(E>=A)continue;let R=Math.min(7.5,A-E),I=R*this.cellArea,D=Math.min(this.rockStockpileM3,I*.55),C=I>0?D/(I*.55)*Le.rockAggregateDiscount:0,P=this.h[v]>2.2?1.28:1,N=I*22*.155*(1-C)*P;if(!o&&d+N>r)continue;this.rockStockpileM3=Math.max(0,this.rockStockpileM3-D);let q=x>1.2,W=x+R;this.targetConcrete[v]=W,this.earthDamMask[v]=0,this.linedMask[v]=1,f?(this.concrete[v]=W,this.formworkWall[v]=0,this.buildProgress[v]=1):(this.formworkWall[v]=Math.max(this.formworkWall[v],this.concrete[v]+R*Le.cofferdamInstantRatio),this.buildProgress[v]=J(this.concrete[v]/Math.max(.5,W),.06,.92),this.activeBuildSet[v]||(this.activeBuildSet[v]=1,this.activeBuildCells.push(v))),!q&&W>1.2&&this.damCellCount++,d+=N,u+=I}if(u>0){if(!f&&(this.pendingPourVolumeM3+=u,this.activeBuildSites.length<6)){let b=this.gridToWorld(l,c),T=c*this.grid+l;this.activeBuildSites.push({wx:b.wx,wz:b.wz,wy:this.bedrock[T]+this.soil[T]+Math.max(this.concrete[T],this.formworkWall[T]),progress:this.buildProgress[T]})}this.recomputeZbRange(g,m,_,p),this._activateArea(g,m,_,p),this.engineeredDirty=!0}return{cost:d,addedM3:u}}reinforceFoundation(t,e,i,n,r=!1){let{gx:o,gz:a}=this.worldToGrid(t,e),l=Math.max(1,Math.ceil(i*.85/this.dx)),c=0,h=0,d=J(o-l,1,this.grid-2),u=J(o+l,1,this.grid-2),f=J(a-l,1,this.grid-2),g=J(a+l,1,this.grid-2),_=this.detectHydraulicDirection(o,a,null);for(let m=f;m<=g;m++)for(let p=d;p<=u;p++){if(Math.hypot(p-o,m-a)*this.dx>i*.85)continue;let b=m*this.grid+p;if(this.foundationMask[b]===1)continue;let T=Math.min(this.rockStockpileM3,5),y=T>1.5?135*(1-Le.rockAggregateDiscount):135;if(!r&&c+y>n)break;this.rockStockpileM3=Math.max(0,this.rockStockpileM3-T);let v=this.soil[b]*.82;this.soil[b]-=v,this.bedrock[b]+=v,this.concrete[b]<.8&&this.targetConcrete[b]<.8&&(this.concrete[b]=.85,this.targetConcrete[b]=.85,this.buildProgress[b]=1),this.foundationMask[b]=1,this.buttressYaw[b]=_.yaw,this.earthDamMask[b]=0,this.linedMask[b]=1,this.reinforcedCellCount++,c+=y,h++}return h>0&&(this.recomputeZbRange(d,f,u,g),this.engineeredDirty=!0),{cost:c,count:h}}placeSubstation(t,e,i,n=!1){let r=Le.substationCost;if(!n&&i<r)return{ok:!1,reason:`\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0441\u0440\u0435\u0434\u0441\u0442\u0432 \u043D\u0430 \u041E\u0420\u0423 110 \u043A\u0412 (\u043D\u0443\u0436\u043D\u043E ${r.toLocaleString("ru-RU")} \u20BD)`};let o=this.sampleAtWorld(t,e);if(o.depth>.35)return{ok:!1,reason:"\u041F\u043E\u0434\u0441\u0442\u0430\u043D\u0446\u0438\u044E \u041E\u0420\u0423 110 \u043A\u0412 \u043D\u0443\u0436\u043D\u043E \u0441\u0442\u0440\u043E\u0438\u0442\u044C \u043D\u0430 \u0441\u0443\u0445\u043E\u043C \u0431\u0435\u0440\u0435\u0433\u0443 \u0432\u044B\u0448\u0435 \u0432\u043E\u0434\u044B!"};for(let d of this.substations)if(Math.hypot(d.wx-t,d.wz-e)<28)return{ok:!1,reason:"\u0420\u044F\u0434\u043E\u043C \u0443\u0436\u0435 \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442 \u043F\u043E\u0434\u0441\u0442\u0430\u043D\u0446\u0438\u044F \u041E\u0420\u0423 110 \u043A\u0412"};let{gx:a,gz:l}=this.worldToGrid(t,e),c=o.bed+.6;for(let d=-1;d<=1;d++)for(let u=-1;u<=1;u++){let f=J(a+u,1,this.grid-2),_=J(l+d,1,this.grid-2)*this.grid+f,m=this.bedrock[_]+this.soil[_];this.concrete[_]=Math.max(this.concrete[_],Math.max(.4,c-m)),this.targetConcrete[_]=Math.max(this.targetConcrete[_],this.concrete[_]),this.linedMask[_]=1}this.recomputeZbRange(a-2,l-2,a+2,l+2);let h={id:this.nextStructId++,kind:"substation",gx:a,gz:l,wx:t,wz:e,wy:c};return this.substations.push(h),this.engineeredDirty=!0,{ok:!0,cost:r,structure:h}}detectHydraulicDirection(t,e,i=null){if(typeof i=="number")return{dx:Math.cos(i),dz:Math.sin(i),yaw:i};let n=0,r=0,o=4;for(let h=-o;h<=o;h++)for(let d=-o;d<=o;d++){if(d===0&&h===0)continue;let u=J(t+d,0,this.grid-1),g=J(e+h,0,this.grid-1)*this.grid+u,_=this.bedrock[g]+this.soil[g]+this.h[g]*1.85,m=1/(d*d+h*h);n-=d*_*m,r-=h*_*m}let a=Math.hypot(n,r);if(a<.001)return{dx:0,dz:1,yaw:Math.PI*.5};let l=n/a,c=r/a;return{dx:l,dz:c,yaw:Math.atan2(c,l)}}placeSpillway(t,e,i,n,r=!1){if(!r&&n<4400)return{ok:!1,reason:"\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0441\u0440\u0435\u0434\u0441\u0442\u0432 (\u043D\u0443\u0436\u043D\u043E 4 400 \u20BD)"};let{gx:a,gz:l}=this.worldToGrid(t,e);if(a<4||a>this.grid-5||l<4||l>this.grid-5)return{ok:!1,reason:"\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u0431\u043B\u0438\u0437\u043A\u043E \u043A \u043A\u0440\u0430\u044E \u043A\u0430\u0440\u0442\u044B"};for(let p of this.turbines)if(Math.hypot(p.gx-a,p.gz-l)<3.5)return{ok:!1,reason:"\u041C\u0435\u0441\u0442\u043E \u0437\u0430\u043D\u044F\u0442\u043E \u0433\u0438\u0434\u0440\u043E\u0430\u0433\u0440\u0435\u0433\u0430\u0442\u043E\u043C"};for(let p of this.spillways)if(Math.hypot(p.gx-a,p.gz-l)<3)return{ok:!1,reason:"\u0420\u044F\u0434\u043E\u043C \u0443\u0436\u0435 \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D \u0432\u043E\u0434\u043E\u0441\u0431\u0440\u043E\u0441"};let c=this.detectHydraulicDirection(a,l,i),h=0,d=1/0,u=[];for(let p=-1;p<=1;p++)for(let b=-1;b<=1;b++){let T=a+b,v=(l+p)*this.grid+T;u.push(v),d=Math.min(d,this.bedrock[v]+this.soil[v])}for(let p=-3;p<=3;p++)for(let b=-3;b<=3;b++){let T=J(l+p,0,this.grid-1)*this.grid+J(a+b,0,this.grid-1),y=this.bedrock[T]+this.soil[T]+Math.max(this.concrete[T],this.targetConcrete[T]);h=Math.max(h,y)}let f=Math.max(d+1.5,h-7.8),g=Math.max(6.8,h-f+2.2);for(let p of u){let b=this.bedrock[p]+this.soil[p],T=Math.max(.5,f-b);this.concrete[p]=T,this.targetConcrete[p]=T,this.formworkWall[p]=0,this.buildProgress[p]=1,this.linedMask[p]=1,this.earthDamMask[p]=0}let _=this.gridToWorld(a,l),m={id:this.nextStructId++,kind:"spillway",gx:a,gz:l,wx:_.wx,wz:_.wz,dirX:c.dx,dirZ:c.dz,yaw:c.yaw,sillElev:f,wallHeight:g,openRatio:.35,autoRegulate:!0,targetHeadElev:f+g*.82,cells:u,currentFlowQ:0,jetSpeed:0};return this.spillways.push(m),this._syncSpillwayGateCells(m),this.recomputeZbRange(a-2,l-2,a+2,l+2),this._activateArea(a-3,l-3,a+3,l+3),this.engineeredDirty=!0,{ok:!0,cost:4400,structure:m}}_syncSpillwayGateCells(t){let e=(1-J(t.openRatio,0,1))*t.wallHeight;for(let i=0;i<t.cells.length;i++){let n=t.cells[i];this.gateWall[n]=e,this.zb[n]=this.bedrock[n]+this.soil[n]+Math.max(this.concrete[n],this.formworkWall[n])+e}this.markTerrainDirty(t.gx-2,t.gz-2,t.gx+2,t.gz+2)}placeTurbine(t,e,i,n,r,o=!1){let a=mu[t];if(!a)return{ok:!1,reason:"\u041D\u0435\u0438\u0437\u0432\u0435\u0441\u0442\u043D\u044B\u0439 \u0442\u0438\u043F \u0442\u0443\u0440\u0431\u0438\u043D\u044B"};if(!o&&r<a.cost)return{ok:!1,reason:`\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0441\u0440\u0435\u0434\u0441\u0442\u0432 (\u043D\u0443\u0436\u043D\u043E ${a.cost.toLocaleString("ru-RU")} \u20BD)`};let{gx:l,gz:c}=this.worldToGrid(e,i);if(l<6||l>this.grid-7||c<6||c>this.grid-7)return{ok:!1,reason:"\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u0431\u043B\u0438\u0437\u043A\u043E \u043A \u0433\u0440\u0430\u043D\u0438\u0446\u0435 \u0434\u043E\u043B\u0438\u043D\u044B"};for(let I of this.turbines)if(Math.hypot(I.gx-l,I.gz-c)<3.6)return{ok:!1,reason:"\u0417\u0434\u0435\u0441\u044C \u0443\u0436\u0435 \u0441\u0442\u043E\u0438\u0442 \u0433\u0438\u0434\u0440\u043E\u0430\u0433\u0440\u0435\u0433\u0430\u0442"};for(let I of this.spillways)if(Math.hypot(I.gx-l,I.gz-c)<3.2)return{ok:!1,reason:"\u041C\u0435\u0441\u0442\u043E \u0437\u0430\u043D\u044F\u0442\u043E \u0432\u043E\u0434\u043E\u0441\u0431\u0440\u043E\u0441\u043E\u043C"};let h=this.detectHydraulicDirection(l,c,n),d=Math.max(4,Math.ceil(16/this.dx)),u=J(Math.round(l-h.dx*d),2,this.grid-3),f=J(Math.round(c-h.dz*d),2,this.grid-3),g=J(Math.round(l+h.dx*d),2,this.grid-3),_=J(Math.round(c+h.dz*d),2,this.grid-3),m=0;for(let I=-3;I<=3;I++)for(let D=-3;D<=3;D++){let C=J(c+I,0,this.grid-1)*this.grid+J(l+D,0,this.grid-1),P=this.bedrock[C]+this.soil[C]+Math.max(this.concrete[C],this.targetConcrete[C]);m=Math.max(m,P)}let p=c*this.grid+l,b=this.bedrock[p]+this.soil[p],T=Math.max(b+11.5,m),y=[];for(let I=-1;I<=1;I++)for(let D=-1;D<=1;D++){let C=l+D,N=(c+I)*this.grid+C,q=this.bedrock[N]+this.soil[N],W=this.concrete[N],tt=Math.max(W,T-q);this.concrete[N]=tt,this.targetConcrete[N]=Math.max(this.targetConcrete[N],tt),this.formworkWall[N]=0,this.buildProgress[N]=1,this.linedMask[N]=1,this.earthDamMask[N]=0,y.push({i:N,prevConcrete:W})}for(let I=-1;I<=1;I++)for(let D=-1;D<=1;D++){let C=(f+I)*this.grid+(u+D),P=(_+I)*this.grid+(g+D);(this.concrete[C]>0||this.targetConcrete[C]>0)&&(y.push({i:C,prevConcrete:this.concrete[C]}),this.concrete[C]=0,this.targetConcrete[C]=0,this.formworkWall[C]=0),(this.concrete[P]>0||this.targetConcrete[P]>0)&&(y.push({i:P,prevConcrete:this.concrete[P]}),this.concrete[P]=0,this.targetConcrete[P]=0,this.formworkWall[P]=0),this.linedMask[C]=1,this.linedMask[P]=1}let v=this.gridToWorld(l,c),S=this.gridToWorld(u,f),A=this.gridToWorld(g,_),x=this.bedrock[f*this.grid+u]+this.soil[f*this.grid+u],E=this.bedrock[_*this.grid+g]+this.soil[_*this.grid+g],R={id:this.nextStructId++,kind:"turbine",type:t,spec:a,gx:l,gz:c,wx:v.wx,wz:v.wz,crestY:T,baseY:b,dirX:h.dx,dirZ:h.dz,yaw:h.yaw,intakeGx:u,intakeGz:f,intakeWx:S.wx,intakeWz:S.wz,intakeBedY:x,outfallGx:g,outfallGz:_,outfallWx:A.wx,outfallWz:A.wz,outfallBedY:E,bodyCells:y,throttle:1,autoDispatch:!1,grossHead:0,netHead:0,flowQ:0,efficiency:0,powerMW:0,cavitation:0,trashLoad:0,condition:1,rotorPhase:0};return this.turbines.push(R),this.recomputeZbRange(Math.min(l,u,g)-2,Math.min(c,f,_)-2,Math.max(l,u,g)+2,Math.max(c,f,_)+2),this._activateArea(Math.min(l,u,g)-2,Math.min(c,f,_)-2,Math.max(l,u,g)+2,Math.max(c,f,_)+2),this.engineeredDirty=!0,{ok:!0,cost:a.cost,structure:R}}demolishAt(t,e){let{gx:i,gz:n}=this.worldToGrid(t,e),r=this.turbines.findIndex(c=>Math.hypot(c.gx-i,c.gz-n)<=2.5);if(r>=0){let c=this.turbines[r];for(let h of c.bodyCells)this.concrete[h.i]=h.prevConcrete,this.targetConcrete[h.i]=h.prevConcrete,this.formworkWall[h.i]=0;return this.turbines.splice(r,1),this.recomputeZbRange(c.gx-2,c.gz-2,c.gx+2,c.gz+2),this.engineeredDirty=!0,{removed:"turbine",refund:Math.round(c.spec.cost*.45)}}let o=this.spillways.findIndex(c=>Math.hypot(c.gx-i,c.gz-n)<=2.5);if(o>=0){let c=this.spillways[o];for(let h of c.cells)this.gateWall[h]=0,this.concrete[h]=0,this.targetConcrete[h]=0,this.formworkWall[h]=0;return this.spillways.splice(o,1),this.recomputeZbRange(c.gx-2,c.gz-2,c.gx+2,c.gz+2),this.engineeredDirty=!0,{removed:"spillway",refund:1900}}let a=this.substations.findIndex(c=>Math.hypot(c.wx-t,c.wz-e)<=14);if(a>=0)return this.substations.splice(a,1),this.engineeredDirty=!0,{removed:"substation",refund:Math.round(Le.substationCost*.45)};let l=0;for(let c=-1;c<=1;c++)for(let h=-1;h<=1;h++){let d=J(i+h,1,this.grid-2),f=J(n+c,1,this.grid-2)*this.grid+d;(this.concrete[f]>0||this.targetConcrete[f]>0||this.foundationMask[f])&&(l+=Math.max(this.concrete[f],this.targetConcrete[f])+1,this.concrete[f]=Math.max(0,this.concrete[f]-5),this.targetConcrete[f]=this.concrete[f],this.formworkWall[f]=0,this.buildProgress[f]=1,this.concrete[f]<=.1&&this.foundationMask[f]&&(this.foundationMask[f]=0,this.reinforcedCellCount=Math.max(0,this.reinforcedCellCount-1))),this.linedMask[f]=0}return l>0?(this.recomputeZbRange(i-2,n-2,i+2,n+2),this.engineeredDirty=!0,{removed:"concrete",refund:0}):{removed:null,refund:0}}findStructureNear(t,e,i=15){let n=null,r=i;for(let o of this.turbines){let a=Math.hypot(o.wx-t,o.wz-e);a<r&&(r=a,n=o)}for(let o of this.spillways){let a=Math.hypot(o.wx-t,o.wz-e);a<r&&(r=a,n=o)}return n}step(t,e=8){let i=typeof performance<"u"?performance.now():Date.now();this.jetEmitters.length=0;let n=J(t,.001,.16);this.activeBuildCells.length>0&&this._stepConstructionQueue(n),this._rebuildActiveTiles();let r=6.5,o=this.grid;for(let d=0;d<this.activeTileCount;d++){let u=this.activeTiles[d],f=u%this.tilesN*Nt,g=Math.floor(u/this.tilesN)*Nt,_=Math.min(o,f+Nt),m=Math.min(o,g+Nt);for(let p=g;p<m;p+=2){let b=p*o;for(let T=f;T<_;T+=2){let y=b+T,v=this.h[y];if(v>.02){let S=Math.abs(this.u[y])+Math.abs(this.v[y])+Math.sqrt($e*v);S>r&&(r=S)}}}}let a=.43*this.dx/r,l=J(Math.ceil(n/a),1,e),c=Math.min(n/l,a);for(let d=0;d<l;d++)this._substep(c);this._stepSecondaryTransportAndErosion(c*l),this.lastSubsteps=l;let h=typeof performance<"u"?performance.now():Date.now();this.lastStepMs=h-i}_stepConstructionQueue(t){let e=this.grid,i=this.activeBuildCells.length;if(i===0){this.pendingPourVolumeM3=0,this.activeBuildSites.length=0;return}let n=Math.max(.85*t,Le.pourRateM3PerSec*t/(Math.min(i,28)*this.cellArea)),r=e,o=e,a=-1,l=-1,c=0,h=[],d=[];for(let u=0;u<i;u++){let f=this.activeBuildCells[u],g=this.targetConcrete[f],_=this.concrete[f];if(g<=_+.01){this.concrete[f]=g,this.formworkWall[f]=0,this.buildProgress[f]=1,this.activeBuildSet[f]=0;continue}let m=f%e,p=f/e|0,T=(this.h[f]>.6?Math.hypot(this.u[f],this.v[f]):0)>3.5?.42:1;_=Math.min(g,_+n*T),this.concrete[f]=_;let y=J(_/Math.max(.4,g),.05,1);if(this.buildProgress[f]=y,_>=g-.015)this.concrete[f]=g,this.formworkWall[f]=0,this.buildProgress[f]=1,this.activeBuildSet[f]=0;else if(this.formworkWall[f]=Math.max(_,this.formworkWall[f]),h.push(f),c+=(g-_)*this.cellArea,d.length<6&&u%Math.max(1,Math.floor(i/4))===0){let S=this.gridToWorld(m,p);d.push({wx:S.wx,wz:S.wz,wy:this.bedrock[f]+this.soil[f]+Math.max(_,this.formworkWall[f]),progress:y})}let v=Math.max(this.concrete[f],this.formworkWall[f]);this.zb[f]=this.bedrock[f]+this.soil[f]+v+this.gateWall[f],m<r&&(r=m),p<o&&(o=p),m>a&&(a=m),p>l&&(l=p)}this.activeBuildCells=h,this.activeBuildSites=d,this.pendingPourVolumeM3=c,this.engineeredDirty=!0,a>=r&&this.markTerrainDirty(r,o,a,l)}_activateArea(t,e,i,n){let r=J(Math.floor(t/Nt)-1,0,this.tilesN-1),o=J(Math.floor(e/Nt)-1,0,this.tilesN-1),a=J(Math.floor(i/Nt)+1,0,this.tilesN-1),l=J(Math.floor(n/Nt)+1,0,this.tilesN-1);for(let c=o;c<=l;c++)for(let h=r;h<=a;h++)this.tileWet[c*this.tilesN+h]=1}_rebuildActiveTiles(){let t=this.grid,e=this.tilesN;this.tileWet.fill(0);let i=0;for(let r=0;r<e;r++){let o=r*Nt,a=Math.min(t,o+Nt);for(let l=0;l<e;l++){let c=l*Nt,h=Math.min(t,c+Nt),d=!1;for(let u=o;u<a;u++){let f=u*t;for(let g=c;g<h;g++){let _=this.h[f+g];_>.0015&&(d=!0,i+=_)}}if(d||this.rainRate>0)for(let u=-1;u<=1;u++){let f=r+u;if(!(f<0||f>=e))for(let g=-1;g<=1;g++){let _=l+g;_<0||_>=e||(this.tileWet[f*e+_]=1)}}}}this._activateArea(0,0,t-1,6),this._activateArea(0,Math.floor(t*.55),6,Math.floor(t*.72));for(let r=0;r<this.turbines.length;r++){let o=this.turbines[r];this._activateArea(Math.min(o.intakeGx,o.outfallGx)-2,Math.min(o.intakeGz,o.outfallGz)-2,Math.max(o.intakeGx,o.outfallGx)+2,Math.max(o.intakeGz,o.outfallGz)+2)}let n=0;for(let r=0;r<this.totalTiles;r++)this.tileWet[r]&&(this.activeTiles[n++]=r);this.activeTileCount=n,this.totalWaterVolumeM3=i*this.cellArea}_substep(t){this.simTime+=t;let e=this.grid,i=1/this.dx,{h:n,hu:r,hv:o,zb:a,u:l,v:c,dH:h,dHU:d,dHV:u}=this;this._applyRiverBoundariesAndRain(t),this._stepTurbinesAndSpillways(t);for(let g=0;g<this.activeTileCount;g++){let _=this.activeTiles[g],m=_%this.tilesN*Nt,p=Math.floor(_/this.tilesN)*Nt,b=Math.min(e,m+Nt),T=Math.min(e,p+Nt);for(let y=p;y<T;y++){let v=y*e;for(let S=m;S<b;S++){let A=v+S;h[A]=0,d[A]=0,u[A]=0}}}for(let g=0;g<this.activeTileCount;g++){let _=this.activeTiles[g],m=Math.max(0,_%this.tilesN*Nt),p=Math.max(0,Math.floor(_/this.tilesN)*Nt),b=Math.min(e-1,m+Nt),T=Math.min(e-1,p+Nt);for(let y=p;y<T;y++){let v=y*e;for(let S=m;S<b;S++){let A=v+S;{let x=A+1,E=n[A],R=n[x];if(E>1e-5||R>1e-5){let I=a[A],D=a[x],C=I>D?I:D,P=Math.max(0,I+E-C),N=Math.max(0,D+R-C);if(P>1e-6||N>1e-6){let q=l[A],W=c[A],tt=l[x],k=c[x],X=P*q,H=P*W,rt=N*tt,lt=N*k,Ht=Math.abs(q)+Math.sqrt($e*P),Bt=Math.abs(tt)+Math.sqrt($e*N),zt=Ht>Bt?Ht:Bt,Z=.5*$e*P*P,Q=.5*$e*N*N,at=.5*(X+rt-zt*(N-P)),wt=.5*(X*q+Z+rt*tt+Q-zt*(rt-X)),st=.5*(X*W+rt*k-zt*(lt-H));h[A]-=at,h[x]+=at,d[A]-=wt-Z,d[x]+=wt-Q,u[A]-=st,u[x]+=st}}}{let x=A+e,E=n[A],R=n[x];if(E>1e-5||R>1e-5){let I=a[A],D=a[x],C=I>D?I:D,P=Math.max(0,I+E-C),N=Math.max(0,D+R-C);if(P>1e-6||N>1e-6){let q=l[A],W=c[A],tt=l[x],k=c[x],X=P*q,H=P*W,rt=N*tt,lt=N*k,Ht=Math.abs(W)+Math.sqrt($e*P),Bt=Math.abs(k)+Math.sqrt($e*N),zt=Ht>Bt?Ht:Bt,Z=.5*$e*P*P,Q=.5*$e*N*N,at=.5*(H+lt-zt*(N-P)),wt=.5*(H*q+lt*tt-zt*(rt-X)),st=.5*(H*W+Z+lt*k+Q-zt*(lt-H));h[A]-=at,h[x]+=at,d[A]-=wt,d[x]+=wt,u[A]-=st-Z,u[x]+=st-Q}}}}}}let f=t*i;for(let g=0;g<this.activeTileCount;g++){let _=this.activeTiles[g],m=Math.max(1,_%this.tilesN*Nt),p=Math.max(1,Math.floor(_/this.tilesN)*Nt),b=Math.min(e-1,_%this.tilesN*Nt+Nt),T=Math.min(e-1,Math.floor(_/this.tilesN)*Nt+Nt);for(let y=p;y<T;y++){let v=y*e;for(let S=m;S<b;S++){let A=v+S,x=n[A]+f*h[A];if(x<=1e-5){n[A]=0,r[A]=0,o[A]=0,l[A]=0,c[A]=0;continue}let E=r[A]+f*d[A],R=o[A]+f*u[A],I=x*x,D=I*I,C=Math.SQRT2*x/Math.sqrt(D+(D>bu?D:bu)),P=E*C,N=R*C,q=this.linedMask[A]?.012:this.soil[A]<.6?.026:.036,W=Math.hypot(P,N);if(W>1e-4){let tt=x>.045?x:.045,X=1/(1+t*$e*q*q*W/Math.pow(tt,1.3333333));if(P*=X,N*=X,W*X>Xi){let H=Xi/(W*X);P*=H,N*=H}}n[A]=x,l[A]=P,c[A]=N,r[A]=x*P,o[A]=x*N}}}this._applyVorticityConfinement(t)}_applyRiverBoundariesAndRain(t){let e=this.grid,i=Ci[this.presetId]||Ci.bystritsa,n=Wi[this.presetId]||Wi.bystritsa,r=n.main[0],o=this.worldToGrid(r.x,r.z+6);this._injectSpring(o.gx,o.gz,2,i.mainInflowQ*this.inflowMult,.42,.91,t);let a=n.eastCreek[0],l=this.worldToGrid(a.x,a.z+6);this._injectSpring(l.gx,l.gz,2,i.creekInflowQ*this.inflowMult,-.68,.73,t);let c=n.westCreek[0],h=this.worldToGrid(c.x+6,c.z);if(this._injectSpring(h.gx,h.gz,2,i.westCreekQ*this.inflowMult,.92,.38,t),this.rainRate>0){let f=this.rainRate*t,g=(this.simTime*60|0)&3,_=g&1,m=g>>1&1;for(let p=2+m;p<e-2;p+=2){let b=p*e;for(let T=2+_;T<e-2;T+=2)this.h[b+T]+=f*4}}let d=(e-2)*e,u=(e-1)*e;for(let f=1;f<e-1;f++){let g=d+f,_=this.zb[g];if(this.h[g]>.01){let m=Math.max(0,6.15-_);if(this.h[g]>m){let p=this.h[g]-m,b=Math.max(this.v[g],Math.sqrt($e*this.h[g])*.72),T=Math.min(p,b*this.h[g]*t/this.dx);this.h[g]=Math.max(m,this.h[g]-T),this.v[g]=Math.max(this.v[g],b*.65),this.hv[g]=this.h[g]*this.v[g]}}this.h[u+f]=this.h[g]*.85,this.hu[u+f]=0,this.hv[u+f]=0}for(let f=0;f<e;f++)this.hu[f*e+1]=Math.max(0,this.hu[f*e+1]),this.hu[f*e+(e-2)]=Math.min(0,this.hu[f*e+(e-2)]),this.hv[1*e+f]=Math.max(0,this.hv[1*e+f])}_injectSpring(t,e,i,n,r,o,a){let l=0;for(let d=-i;d<=i;d++)for(let u=-i;u<=i;u++)u*u+d*d<=i*i+1&&l++;if(!l)return;let c=n*a/(l*this.cellArea),h=2.5;for(let d=-i;d<=i;d++)for(let u=-i;u<=i;u++){if(u*u+d*d>i*i+1)continue;let f=J(t+u,1,this.grid-2),_=J(e+d,1,this.grid-2)*this.grid+f;this.h[_]+=c,this.hu[_]+=c*r*h,this.hv[_]+=c*o*h;let m=this.h[_];this.u[_]=this.hu[_]/m,this.v[_]=this.hv[_]/m}}_stepTurbinesAndSpillways(t){let e=this.grid;for(let i=0;i<this.spillways.length;i++){let n=this.spillways[i],r=J(Math.round(n.gx-n.dirX*3),1,e-2),a=J(Math.round(n.gz-n.dirZ*3),1,e-2)*e+r,l=this.zb[a]+this.h[a];if(n.autoRegulate){let d=l-n.targetHeadElev,u=J(.08+d*.28,0,1);Math.abs(u-n.openRatio)>.015&&(n.openRatio=ne(n.openRatio,u,J(t*2.5,0,1)),this._syncSpillwayGateCells(n))}let c=0,h=0;for(let d=0;d<n.cells.length;d++){let u=n.cells[d],f=this.h[u];if(f>.03){let g=Math.max(0,this.u[u]*n.dirX+this.v[u]*n.dirZ);c+=f*g*(this.dx/3),g>h&&(h=g),this.foam[u]=Math.min(1,this.foam[u]+.35)}}if(n.currentFlowQ=c,n.jetSpeed=h,c>1.2&&n.openRatio>.05){let d=n.gz*e+n.gx;this.jetEmitters.push({wx:n.wx+n.dirX*3.5,wy:this.zb[d]+Math.max(.3,this.h[d]*.6),wz:n.wz+n.dirZ*3.5,vx:n.dirX*Math.max(4.8,h*1.25),vy:1.4+h*.14,vz:n.dirZ*Math.max(4.8,h*1.25),intensity:J(c/35,.15,1.8),kind:"spillway"})}}for(let i=0;i<this.turbines.length;i++){let n=this.turbines[i],r=n.spec,o=0,a=0,l=0,c=0;for(let k=-1;k<=1;k++)for(let X=-1;X<=1;X++){let H=(n.intakeGz+k)*e+(n.intakeGx+X),rt=this.h[H];rt>.12&&(o+=this.zb[H]+rt,a++,l+=(rt-.08)*this.cellArea,c+=this.sediment[H])}let h=0,d=0;for(let k=-1;k<=1;k++)for(let X=-1;X<=1;X++){let H=(n.outfallGz+k)*e+(n.outfallGx+X);h+=this.zb[H]+this.h[H],d++}if(a===0||l<=.05||n.throttle<=.005){n.grossHead=0,n.netHead=0,n.flowQ=0,n.efficiency=0,n.powerMW=0,n.cavitation=0;continue}let u=c/a;n.autoDispatch?n.trashLoad=Math.max(0,n.trashLoad-t*.02):u>.25&&(n.trashLoad=Math.min(.28,n.trashLoad+(u-.25)*.004*t));let f=o/a,g=h/(d||1),_=Math.max(0,f-g);if(n.grossHead=_,_<r.minHead*.45){n.netHead=_,n.flowQ=0,n.efficiency=0,n.powerMW=0,n.cavitation=0;continue}let m=1-n.trashLoad,p=J((_-r.minHead*.35)/(r.optHead*.55),.14,1),b=n.throttle*p*m*r.maxArea*Math.sqrt(2*$e*_),T=l*.42/t,y=Math.min(b,T),v=r.frictionK*y*y+n.trashLoad*1.4,S=Math.max(0,_-v),A=(S-r.optHead)/r.headSigma,x=Math.exp(-.55*A*A),E=n.throttle<.28?.55+n.throttle/.28*.45:1,R=.65+.35*n.condition,I=J(r.peakEta*x*E*R,.18,r.peakEta),D=S>r.maxHead?(S-r.maxHead)/15:S<r.minHead?(r.minHead-S)/6:0;n.cavitation=J(D,0,1);let C=cg*$e*y*S*I*1e-6,P=Math.min(r.ratedMW*1.18,C);n.netHead=S,n.flowQ=y,n.efficiency=I,n.powerMW=P,n.rotorPhase=(n.rotorPhase+t*(2.5+P*1.35))%(Math.PI*2);let N=y*t,q=0;for(let k=-1;k<=1;k++)for(let X=-1;X<=1;X++){let H=(n.intakeGz+k)*e+(n.intakeGx+X),rt=this.h[H];if(rt>.12){let lt=(rt-.08)*this.cellArea/l,Ht=Math.min(rt-.05,N*lt/this.cellArea);this.h[H]-=Ht,this.hu[H]=this.h[H]*this.u[H],this.hv[H]=this.h[H]*this.v[H],q+=Ht*this.cellArea}}let W=q/(9*this.cellArea),tt=J(2.2+Math.sqrt(2*$e*Math.max(.5,S))*.22,2,9.5);for(let k=-1;k<=1;k++)for(let X=-1;X<=1;X++){let H=(n.outfallGz+k)*e+(n.outfallGx+X);this.h[H]+=W,this.hu[H]+=W*n.dirX*tt,this.hv[H]+=W*n.dirZ*tt;let rt=this.h[H];rt>1e-4&&(this.u[H]=J(this.hu[H]/rt,-Xi,Xi),this.v[H]=J(this.hv[H]/rt,-Xi,Xi),this.hu[H]=rt*this.u[H],this.hv[H]=rt*this.v[H]),this.foam[H]=Math.min(1,this.foam[H]+.42)}if(y>2.5){let k=n.outfallGz*e+n.outfallGx;this.jetEmitters.push({wx:n.outfallWx,wy:this.zb[k]+this.h[k]+.2,wz:n.outfallWz,vx:n.dirX*tt*.75,vy:1.15,vz:n.dirZ*tt*.75,intensity:J(P/8,.2,1.35),kind:"tailrace"})}}}_applyVorticityConfinement(t){let e=this.grid,i=.5/this.dx,{h:n,u:r,v:o,hu:a,hv:l,vort:c}=this;for(let d=0;d<this.activeTileCount;d++){let u=this.activeTiles[d],f=Math.max(2,u%this.tilesN*Nt),g=Math.max(2,Math.floor(u/this.tilesN)*Nt),_=Math.min(e-2,u%this.tilesN*Nt+Nt),m=Math.min(e-2,Math.floor(u/this.tilesN)*Nt+Nt);for(let p=g;p<m;p++){let b=p*e;for(let T=f;T<_;T++){let y=b+T;if(n[y]<.18){c[y]=0;continue}let v=(o[y+1]-o[y-1])*i,S=(r[y+e]-r[y-e])*i;c[y]=v-S}}}let h=.34*this.dx*t;for(let d=0;d<this.activeTileCount;d++){let u=this.activeTiles[d],f=Math.max(2,u%this.tilesN*Nt),g=Math.max(2,Math.floor(u/this.tilesN)*Nt),_=Math.min(e-2,u%this.tilesN*Nt+Nt),m=Math.min(e-2,Math.floor(u/this.tilesN)*Nt+Nt);for(let p=g;p<m;p++){let b=p*e;for(let T=f;T<_;T++){let y=b+T,v=n[y],S=c[y];if(v<.25||Math.abs(S)<.015)continue;let A=Math.abs(c[y+1])-Math.abs(c[y-1]),x=Math.abs(c[y+e])-Math.abs(c[y-e]),E=Math.hypot(A,x)+1e-5,R=A/E,I=x/E,D=h*I*S,C=-h*R*S;r[y]=J(r[y]+D,-Xi,Xi),o[y]=J(o[y]+C,-Xi,Xi),a[y]=v*r[y],l[y]=v*o[y]}}}}_stepSecondaryTransportAndErosion(t){let e=this.grid,i=1/this.dx,{h:n,u:r,v:o,foam:a,foamNext:l,sediment:c,sedNext:h,wetness:d}=this;this._erosionTick++;let u=this._erosionTick%3===0,f=this._erosionTick%6===0,g=e,_=e,m=-1,p=-1,b=0,T=0;for(let y=0;y<this.activeTileCount;y++){let v=this.activeTiles[y],S=Math.max(1,v%this.tilesN*Nt),A=Math.max(1,Math.floor(v/this.tilesN)*Nt),x=Math.min(e-1,v%this.tilesN*Nt+Nt),E=Math.min(e-1,Math.floor(v/this.tilesN)*Nt+Nt);for(let R=A;R<E;R++){let I=R*e;for(let D=S;D<x;D++){let C=I+D,P=n[C];if(f&&this.concrete[C]>5&&R>2&&R<e-3&&D>2&&D<e-3){let Ot=Math.max(n[C-e*2],n[C-2],n[C+2],n[C+e*2]);if(Ot>2.5){let jt=this.foundationMask[C]?36:Le.maxUnreinforcedHead,Gt=J(Ot/jt*100,0,125);if(Gt>b&&(b=Gt),!this.foundationMask[C]&&this.soil[C]>1.2&&Ot>Le.highDamHeadThreshold){let le=(Ot-Le.highDamHeadThreshold)*.08*(this.soil[C]/3);T+=le}}}let N=n[C-1]>.03||n[C+1]>.03||n[C-e]>.03||n[C+e]>.03;if(P>.02||N?d[C]=Math.min(1,d[C]+t*2.5):d[C]>0&&(d[C]=Math.max(0,d[C]-t*.08)),P<=.015){l[C]=a[C]*.75,h[C]=c[C]*.85;continue}let q=J(D-r[C]*t*i,.5,e-1.5),W=J(R-o[C]*t*i,.5,e-1.5),tt=q|0,k=W|0,X=q-tt,H=W-k,rt=k*e+tt,lt=rt+1,Ht=rt+e,Bt=Ht+1,zt=ne(ne(a[rt],a[lt],X),ne(a[Ht],a[Bt],X),H),Z=ne(ne(c[rt],c[lt],X),ne(c[Ht],c[Bt],X),H),Q=r[C]*r[C]+o[C]*o[C],at=Math.sqrt(Q),wt=at/Math.sqrt($e*Math.max(.08,P)),st=(r[C+1]-r[C-1]+(o[C+e]-o[C-e]))*.5*i,Tt=wt>.95&&st<-.12?Math.min(.65,-st*.45*t*8):0,Yt=at>3.6?(at-3.6)*.085*t:0;l[C]=J(zt*Math.exp(-t*.72)+Tt+Yt,0,1);let Ut=Z*Math.exp(-t*.16);if(this.linedMask[C]===0&&this.concrete[C]<.05&&this.soil[C]>.02){let Ot=this.earthDamMask[C]===1,jt=Ot?1.85:3.9;if(at>jt){let Gt=at-jt;if(Ut=Math.min(1.5,Ut+Gt*(Ot?.45:.14)*t),u){let le=Ot?.095:.008,Me=Math.min(this.soil[C],Gt*le*t*3);Me>.001&&(this.soil[C]-=Me,this.zb[C]=this.bedrock[C]+this.soil[C]+Math.max(this.concrete[C],this.formworkWall[C])+this.gateWall[C],D<g&&(g=D),R<_&&(_=R),D>m&&(m=D),R>p&&(p=R))}}}h[C]=Ut}}}f&&(this.maxDamStress=ne(this.maxDamStress,b,.35),this.totalSeepageQ=ne(this.totalSeepageQ,T,.35));for(let y=0;y<this.activeTileCount;y++){let v=this.activeTiles[y],S=Math.max(1,v%this.tilesN*Nt),A=Math.max(1,Math.floor(v/this.tilesN)*Nt),x=Math.min(e-1,v%this.tilesN*Nt+Nt),E=Math.min(e-1,Math.floor(v/this.tilesN)*Nt+Nt);for(let R=A;R<E;R++){let I=R*e;for(let D=S;D<x;D++){let C=I+D;a[C]=l[C],c[C]=h[C]}}}m>=g&&this.markTerrainDirty(g,_,m,p)}_rebuildVelocitiesAll(){for(let t=0;t<this.count;t++){let e=this.h[t];e<=1e-4?(this.u[t]=0,this.v[t]=0,this.hu[t]=0,this.hv[t]=0):(this.u[t]=this.hu[t]/e,this.v[t]=this.hv[t]/e)}}};var wa=class{constructor({step:t=1/30,maxSteps:e=4}={}){if(!Number.isFinite(t)||t<=0||t>1||!Number.isSafeInteger(e)||e<1)throw new Error("\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0435 \u043F\u0430\u0440\u0430\u043C\u0435\u0442\u0440\u044B \u0447\u0430\u0441\u043E\u0432");this.step=t,this.maxSteps=e,this.accumulator=0,this.tick=0,this._advancing=!1}advance(t,e){if(!Number.isFinite(t)||t<0||!Number.isFinite(this.accumulator+t)||typeof e!="function")throw new Error("\u041D\u0435\u043A\u043E\u0440\u0440\u0435\u043A\u0442\u043D\u044B\u0439 \u0448\u0430\u0433 \u0447\u0430\u0441\u043E\u0432");if(this._advancing)throw new Error("\u0412\u043B\u043E\u0436\u0435\u043D\u043D\u044B\u0439 \u0432\u044B\u0437\u043E\u0432 \u0447\u0430\u0441\u043E\u0432");this.accumulator+=t;let i=0;this._advancing=!0;try{for(;this.accumulator+this.step*1e-9>=this.step&&i<this.maxSteps;)e(this.step,this.tick),this.accumulator=Math.max(0,this.accumulator-this.step),this.tick++,i++}finally{this._advancing=!1}return{steps:i,remaining:this.accumulator,tick:this.tick}}};var Ea=class{constructor(t,e={}){this.hydro=t,this.callbacks=e,this.clock=new wa({step:1/30,maxSteps:6}),this._rng=hr(987654),this.resetEconomy()}resetEconomy(){this.cash=xi.startingCash,this.loan=0,this.creative=!1,this.day=1,this.hour=8,this.weatherId="normal",this.weatherTimer=54,this.totalMW=0,this.netDeliveredMW=0,this.gridLossPct=0,this.connectedDemandMW=0,this.totalCityDemandMW=0,this.suppliedCityMW=0,this.exportedMW=0,this.spotMultiplier=oc(this.hour),this.incomePerSec=0,this.upkeepPerSec=0,this.netPerSec=0,this.totalEarned=0,this.totalMWhGenerated=0,this.agroIrrigated=!1,this._seepageWarnCooldown=0,this.completedMilestones=new Set,this.cities=[],this.allBuildings=[],this.buildingsDirty=!0,this.powerLinesDirty=!0,this._initCities(),this._applyWeatherToHydro()}_initCities(){this.cities=[],this.allBuildings=[];for(let t=0;t<vs.length;t++){let e=vs[t],i=hr(1e3+t*777),n=[];for(let a=1;a<=5;a++){let l=a*6+3,c=9+(a-1)*9.2;for(let h=0;h<l&&!(n.length>=62);h++){let d=h/l*Math.PI*2+a*.43+(i()-.5)*.16,u=c+(i()-.5)*2.4;if(u>e.plateauRadius*.92)continue;let f=e.x+Math.cos(d)*u,g=e.z+Math.sin(d)*u,_=this.hydro.sampleAtWorld(f,g);n.push({wx:f,wz:g,wy:_.bed,yaw:Math.round((d+Math.PI*.5)/(Math.PI*.5))*(Math.PI*.5)+(i()-.5)*.12,ring:a,occupied:!1,buildingIndex:-1})}}let r={...e,connected:!!e.connectedAtStart,population:e.startPop,level:1,levelName:"\u041F\u043E\u0441\u0451\u043B\u043E\u043A",satisfaction:.76,powerRatio:0,currentDemandMW:e.baseDemandMW,suppliedMW:0,growthProgress:.16,isFlooded:!1,irrigated:!1,lots:n,buildingIndices:[],blackoutTimer:0},o=e.archetype==="metropolis"?14:e.archetype==="industrial"?11:8;for(let a=0;a<o&&a<n.length;a++)this._spawnBuildingInCity(r,n[a],1,i);this._recalcCityTier(r),this.cities.push(r)}this.buildingsDirty=!0,this.powerLinesDirty=!0}_chooseBuildingKind(t,e,i,n){if(t.archetype==="agro"&&e>=3&&n()<.52)return"greenhouse";if(t.archetype==="industrial"&&e>=2&&n()<.44)return"factory";if(t.archetype==="metropolis"&&e<=2&&t.level>=3&&n()<.65)return"skyscraper";let r=4-Math.min(3,e)+i+n()*1.4;return r>=4.4?"skyscraper":r>=2.9?"apartment":r>=1.9&&n()<.35?"factory":r>=1.6?"townhouse":"cottage"}_spawnBuildingInCity(t,e,i=.05,n=this._rng){e.occupied=!0;let r=this._chooseBuildingKind(t,e.ring,t.level*.55,n),o=4.4,a=3.8,l=4.4;r==="cottage"?(o=4+n()*1.3,a=3+n()*1.2,l=4+n()*1.3):r==="townhouse"?(o=5+n()*1.6,a=5.6+n()*2.4,l=4.6+n()*1.3):r==="apartment"?(o=5.8+n()*2,a=11+n()*7,l=5.4+n()*1.7):r==="factory"?(o=7.8+n()*2.4,a=6+n()*2.5,l=6.5+n()*2.2):r==="greenhouse"?(o=7.2+n()*2.2,a=2.8+n()*.9,l=5+n()*1.5):r==="skyscraper"&&(o=6.6+n()*2,a=19+n()*14,l=6.6+n()*2);let c=this.hydro.sampleAtWorld(e.wx,e.wz),h=this.allBuildings.length,d={index:h,cityId:t.id,kind:r,wx:e.wx,wy:c.bed,wz:e.wz,yaw:e.yaw,sx:o,sy:a,sz:l,tier:t.level,anim:i,lit:1,tint:n()};return e.buildingIndex=h,this.allBuildings.push(d),t.buildingIndices.push(h),this.buildingsDirty=!0,d}_recalcCityTier(t){let e=t.buildingIndices.length;e>=42?(t.level=5,t.levelName="\u041C\u0435\u0433\u0430\u043F\u043E\u043B\u0438\u0441"):e>=30?(t.level=4,t.levelName="\u0418\u043D\u0434\u0443\u0441\u0442\u0440\u0438\u0430\u043B\u044C\u043D\u044B\u0439 \u0446\u0435\u043D\u0442\u0440"):e>=20?(t.level=3,t.levelName="\u041A\u0440\u0443\u043F\u043D\u044B\u0439 \u0433\u043E\u0440\u043E\u0434"):e>=13?(t.level=2,t.levelName="\u0413\u043E\u0440\u043E\u0434\u043E\u043A"):(t.level=1,t.levelName="\u041F\u043E\u0441\u0451\u043B\u043E\u043A")}connectCityGrid(t){let e=this.cities.find(n=>n.id===t);if(!e)return{ok:!1,reason:"\u0413\u043E\u0440\u043E\u0434 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D"};if(e.connected)return{ok:!1,reason:"\u0413\u043E\u0440\u043E\u0434 \u0443\u0436\u0435 \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0451\u043D \u043A \u044D\u043D\u0435\u0440\u0433\u043E\u0441\u0435\u0442\u0438"};let i=this.estimatePowerLineCost(e);return!this.creative&&this.cash<i?{ok:!1,reason:`\u041D\u0443\u0436\u043D\u043E ${i.toLocaleString("ru-RU")} \u20BD \u043D\u0430 \u0441\u0442\u0440\u043E\u0438\u0442\u0435\u043B\u044C\u0441\u0442\u0432\u043E \u041B\u042D\u041F 110 \u043A\u0412`}:(this.creative||(this.cash-=i),e.connected=!0,this.powerLinesDirty=!0,this.callbacks.onNotify&&this.callbacks.onNotify(`\u2726 \u041C\u0430\u0433\u0438\u0441\u0442\u0440\u0430\u043B\u044C \u041B\u042D\u041F 110 \u043A\u0412 \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u0430 \u043A \u0433. ${e.name}!`,"good"),{ok:!0,cost:i,city:e})}estimatePowerLineCost(t){let e=Math.hypot(t.x-12,t.z- -152);for(let i of this.hydro.substations){let n=Math.hypot(t.x-i.wx,t.z-i.wz);n<e&&(e=n)}for(let i of this.hydro.turbines){let n=Math.hypot(t.x-i.wx,t.z-i.wz);n<e&&(e=n)}return Math.max(1900,Math.round(e*13))}canAfford(t){return this.creative||this.cash>=t}spend(t){return this.creative||t<=0?!0:this.cash<t?!1:(this.cash-=t,!0)}earn(t){t>0&&(this.cash+=t,this.totalEarned+=t)}takeGreenLoan(){return this.loan>=xi.maxLoan?{ok:!1,reason:"\u041B\u0438\u043C\u0438\u0442 \u0437\u0435\u043B\u0451\u043D\u044B\u0445 \u043E\u0431\u043B\u0438\u0433\u0430\u0446\u0438\u0439 \u0438\u0441\u0447\u0435\u0440\u043F\u0430\u043D"}:(this.loan+=xi.loanChunk,this.cash+=xi.loanChunk,{ok:!0,amount:xi.loanChunk})}repayLoan(){if(this.loan<=0)return{ok:!1,reason:"\u041A\u0440\u0435\u0434\u0438\u0442\u043E\u0432 \u043D\u0435\u0442"};let t=Math.min(this.cash,Math.min(xi.loanChunk,this.loan));return t<=100?{ok:!1,reason:"\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0441\u0440\u0435\u0434\u0441\u0442\u0432 \u0434\u043B\u044F \u043F\u043E\u0433\u0430\u0448\u0435\u043D\u0438\u044F"}:(this.cash-=t,this.loan-=t,{ok:!0,amount:t})}setWeather(t){ei[t]&&(this.weatherId=t,this._applyWeatherToHydro())}_applyWeatherToHydro(){let t=ei[this.weatherId]||ei.normal;this.hydro.inflowMult=t.inflowMult,this.hydro.rainRate=t.rainRate}update(t){this.clock.advance(t,(i,n)=>this._simulateFixedStep(i,n));let e=!1;for(let i=0;i<this.allBuildings.length;i++){let n=this.allBuildings[i];n.anim<1&&(n.anim=Math.min(1,n.anim+t*1.4),e=!0)}e&&(this.buildingsDirty=!0)}_simulateFixedStep(t,e){let i=24/Qt.dayLengthSec;if(this.hour+=t*i,this.hour>=24&&(this.hour-=24,this.day+=1),this._seepageWarnCooldown>0&&(this._seepageWarnCooldown-=t),this.weatherTimer-=t,this.weatherTimer<=0){this.weatherTimer=40+this._rng()*34;let y=ei[this.weatherId]||ei.normal,v=this._rng(),S=0;for(let[A,x]of Object.entries(y.next))if(S+=x,v<=S){if(A!==this.weatherId){this.weatherId=A,this._applyWeatherToHydro();let E=ei[A];this.callbacks.onNotify&&this.callbacks.onNotify(`${E.icon} \u0413\u0438\u0434\u0440\u043E\u043F\u0440\u043E\u0433\u043D\u043E\u0437: ${E.label} (\u043F\u0440\u0438\u0442\u043E\u043A \u0440\u0435\u043A \xD7${E.inflowMult.toFixed(2)})`,A==="flood"?"warn":"info")}break}}this.spotMultiplier=oc(this.hour);for(let y=0;y<this.hydro.turbines.length;y++){let v=this.hydro.turbines[y];if(v.autoDispatch){let S=this.spotMultiplier>=1.5?1:this.spotMultiplier<.7?.32:.74;v.throttle+=(S-v.throttle)*J(t*1.8,0,1)}v.cavitation>.25&&(v.condition=Math.max(.45,v.condition-v.cavitation*.0012*t))}let n=0,r=0;for(let y=0;y<this.hydro.turbines.length;y++){let v=this.hydro.turbines[y];n+=v.powerMW,r+=v.spec.upkeepPerSec}r+=this.hydro.substations.length*4,this.totalMW=n,this.totalMWhGenerated+=n*t/3600;let a=this.hydro.substations.length>0?Le.gridLossWithSub:n>3?Le.baseGridLossNoSub:.06;this.gridLossPct=Math.round(a*100);let l=n*(1-a);this.netDeliveredMW=l,this.hydro.totalSeepageQ>2.2&&this._seepageWarnCooldown<=0&&(this._seepageWarnCooldown=36,this.callbacks.onNotify&&this.callbacks.onNotify("\u25B2 \u041E\u0431\u043D\u0430\u0440\u0443\u0436\u0435\u043D\u0430 \u0444\u0438\u043B\u044C\u0442\u0440\u0430\u0446\u0438\u044F \u0432\u043E\u0434\u044B \u043F\u043E\u0434 \u043F\u043E\u0434\u043E\u0448\u0432\u043E\u0439 \u043F\u043B\u043E\u0442\u0438\u043D\u044B! \u0423\u043A\u0440\u0435\u043F\u0438\u0442\u0435 \u0441\u0442\u0432\u043E\u0440 \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u043E\u043C [6] \u041A\u043E\u043D\u0442\u0440\u0444\u043E\u0440\u0441 / \u0426\u0435\u043C\u0435\u043D\u0442\u0430\u0446\u0438\u044F.","warn")),e%10===0&&this._checkHydroCityInteractions();let c=this.hour,h=c>=17&&c<22.5?1.32:c>=6.5&&c<11?1.14:c<6?.74:1,d=0,u=0;for(let y=0;y<this.cities.length;y++){let v=this.cities[y],S=v.buildingIndices.length;v.currentDemandMW=(v.baseDemandMW+S*v.demandPerBuilding)*h,d+=v.currentDemandMW,v.connected&&(u+=v.currentDemandMW)}this.totalCityDemandMW=d,this.connectedDemandMW=u;let f=l,g=0,_=0;for(let y=0;y<this.cities.length;y++){let v=this.cities[y];if(!v.connected){v.suppliedMW=0,v.powerRatio=0,v.satisfaction=Math.max(.35,v.satisfaction-t*.01);continue}let S=Math.min(v.currentDemandMW,f);if(f=Math.max(0,f-S),v.suppliedMW=S,v.powerRatio=v.currentDemandMW>1e-4?J(S/v.currentDemandMW,0,1):1,g+=S,_+=v.suppliedMW*xi.baseRatePerMWSec*this.spotMultiplier*v.tariffBonus,v.powerRatio>=.55&&!v.isFlooded){v.blackoutTimer=0,v.satisfaction=Math.min(1,v.satisfaction+t*.05);let A=v.needsIrrigation&&v.irrigated?1.78:1,x=.36+.96*v.powerRatio;v.growthProgress+=t/14*x*A,v.growthProgress>=1&&(v.growthProgress-=1,this._growCityOneStep(v))}else v.satisfaction=Math.max(.15,v.satisfaction-t*(v.isFlooded?.08:.025)),n>.05&&v.powerRatio<.4&&(v.blackoutTimer+=t)}let m=Math.max(0,l-g),p=this.cities.some(y=>y.connected);this.exportedMW=p?m:0,this.exportedMW>0&&(_+=this.exportedMW*xi.baseRatePerMWSec*this.spotMultiplier*xi.overSupplyExportFactor),this.agroIrrigated&&(_+=xi.irrigationBonusPerSec);let b=this.loan*xi.loanInterestPerSec;this.suppliedCityMW=g,this.incomePerSec=_,this.upkeepPerSec=r+b,this.netPerSec=this.incomePerSec-this.upkeepPerSec;let T=this.netPerSec*t;T>=0?this.earn(T):this.creative||(this.cash=Math.max(0,this.cash+T)),e%15===0&&this._checkMilestones()}_checkHydroCityInteractions(){for(let t=0;t<this.cities.length;t++){let e=this.cities[t],i=0,n=Math.max(1,Math.floor(e.lots.length/8)),r=0;for(let a=0;a<e.lots.length;a+=n){let l=this.hydro.sampleAtWorld(e.lots[a].wx,e.lots[a].wz);r++,l.depth>.44&&i++}let o=e.isFlooded;if(e.isFlooded=r>0&&i/r>=.25,e.isFlooded&&!o&&this.callbacks.onNotify&&this.callbacks.onNotify(`! \u0412\u043D\u0438\u043C\u0430\u043D\u0438\u0435! \u041F\u043E\u0434\u0442\u043E\u043F\u043B\u0435\u043D\u044B \u0443\u043B\u0438\u0446\u044B \u0433. ${e.name}! \u041E\u0442\u043A\u0440\u043E\u0439\u0442\u0435 \u0432\u043E\u0434\u043E\u0441\u0431\u0440\u043E\u0441 \u0438\u043B\u0438 \u043D\u0430\u0441\u044B\u043F\u044C\u0442\u0435 \u0434\u0430\u043C\u0431\u0443!`,"danger"),e.needsIrrigation&&e.irrigationTarget){let a=e.irrigationTarget,l=!1,c=[[0,0],[-12,-8],[12,8],[-10,10],[10,-10]];for(let h=0;h<c.length;h++)if(this.hydro.sampleAtWorld(a.x+c[h][0],a.z+c[h][1]).depth>.16){l=!0;break}l&&!e.irrigated?(e.irrigated=!0,this.agroIrrigated=!0,this.callbacks.onNotify&&this.callbacks.onNotify("\u25C8 \u0412\u043E\u0434\u0430 \u043F\u0440\u0438\u0448\u043B\u0430 \u0432 \u043E\u0440\u043E\u0441\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u0431\u0430\u0441\u0441\u0435\u0439\u043D \u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u044B! \u041F\u043E\u043B\u044F \u0438 \u0442\u0435\u043F\u043B\u0438\u0446\u044B \u043F\u043E\u0448\u043B\u0438 \u0432 \u0431\u0443\u0440\u043D\u044B\u0439 \u0440\u043E\u0441\u0442!","good")):!l&&e.irrigated&&(e.irrigated=!1,this.agroIrrigated=!1)}}}_growCityOneStep(t){let e=t.lots.find(i=>!i.occupied);if(e){let i=this._spawnBuildingInCity(t,e,.05,this._rng),n=i.kind==="skyscraper"?260:i.kind==="apartment"?150:i.kind==="factory"?115:72;t.population+=n;let r=t.level;this._recalcCityTier(t),t.level>r&&this.callbacks.onNotify&&this.callbacks.onNotify(`\u2605 ${t.name} \u0432\u044B\u0440\u043E\u0441 \u0434\u043E \u0441\u0442\u0430\u0442\u0443\u0441\u0430 \xAB${t.levelName}\xBB (${t.population.toLocaleString("ru-RU")} \u0436\u0438\u0442.)!`,"good");return}for(let i=0;i<t.buildingIndices.length;i++){let n=this.allBuildings[t.buildingIndices[i]];if(n.kind==="cottage"||n.kind==="townhouse"){n.kind=t.archetype==="industrial"?"factory":"apartment",n.sy=Math.min(28,n.sy*2.1),n.sx*=1.15,n.sz*=1.15,n.anim=.35,t.population+=180,this.buildingsDirty=!0;return}if(n.kind==="apartment"&&n.sy<24){n.kind="skyscraper",n.sy=Math.min(34,n.sy*1.65),n.anim=.45,t.population+=240,this.buildingsDirty=!0;return}}}_checkMilestones(){let t=this.cities.reduce((n,r)=>n+r.population,0),e=this.cities.filter(n=>n.connected).length,i={totalMW:this.totalMW,excavatedM3:this.hydro.totalExcavatedM3,agroIrrigated:this.agroIrrigated,connectedCities:e,totalPopulation:t,reinforcedCells:this.hydro.reinforcedCellCount,substations:this.hydro.substations.length};for(let n=0;n<cr.length;n++){let r=cr[n];this.completedMilestones.has(r.id)||r.check(i)&&(this.completedMilestones.add(r.id),this.earn(r.reward),this.callbacks.onMilestone&&this.callbacks.onMilestone(r))}}getSummary(){let t=this.cities.reduce((i,n)=>i+n.population,0),e=gu(this.hour);return{cash:this.cash,loan:this.loan,day:this.day,hour:this.hour,weather:ei[this.weatherId]||ei.normal,spotMultiplier:this.spotMultiplier,periodLabel:e.label,periodClass:e.cls,totalMW:this.totalMW,netDeliveredMW:this.netDeliveredMW,gridLossPct:this.gridLossPct,connectedDemandMW:this.connectedDemandMW,totalCityDemandMW:this.totalCityDemandMW,suppliedCityMW:this.suppliedCityMW,exportedMW:this.exportedMW,incomePerSec:this.incomePerSec,upkeepPerSec:this.upkeepPerSec,netPerSec:this.netPerSec,totalPopulation:t,soilStockpileM3:this.hydro.soilStockpileM3,rockStockpileM3:this.hydro.rockStockpileM3,pendingPourM3:this.hydro.pendingPourVolumeM3,maxDamStress:this.hydro.maxDamStress,seepageQ:this.hydro.totalSeepageQ,agroIrrigated:this.agroIrrigated,substationsCount:this.hydro.substations.length}}};function en(s,t=4,e=!0){return s.wrapS=Pn,s.wrapT=Pn,s.magFilter=Ce,s.minFilter=Hi,s.generateMipmaps=!0,s.anisotropy=t,e&&"colorSpace"in s&&(s.colorSpace=Je),s.needsUpdate=!0,s}function Sn(s){let t=document.createElement("canvas");return t.width=s,t.height=s,t}function Se(s,t,e=17){let i=Math.sin(s*127.1+t*311.7+e*74.7)*43758.5453123;return i-Math.floor(i)}function Ta(s,t,e,i){let n=s*e,r=t*e,o=Math.floor(n),a=Math.floor(r),l=n-o,c=r-a,h=8,d=8;for(let u=-1;u<=1;u++)for(let f=-1;f<=1;f++){let g=((o+f)%e+e)%e,_=((a+u)%e+e)%e,m=f+.15+.7*Se(g,_,i)-l,p=u+.15+.7*Se(g,_,i+31)-c,b=Math.hypot(m,p);b<h?(d=h,h=b):b<d&&(d=b)}return{d1:h,edge:d-h}}function Su(s=384){let t=new Uint8Array(s*s*4),e=Math.PI*2;for(let n=0;n<s;n++){let r=n/s;for(let o=0;o<s;o++){let a=o/s,l=Math.sin(a*e*3+r*e*2)*.34,c=Math.cos(a*e*5-r*e*4+1.1)*.25,h=Math.sin(a*e*9+r*e*7+2.4)*.17,d=Math.cos(a*e*15-r*e*12+.7)*.11,u=Math.sin(a*e*23+r*e*19+1.9)*.06,f=(Math.cos(a*e*3+r*e*2)*3*.34-Math.sin(a*e*5-r*e*4+1.1)*5*.25+Math.cos(a*e*9+r*e*7+2.4)*9*.17-Math.sin(a*e*15-r*e*12+.7)*15*.11+Math.cos(a*e*23+r*e*19+1.9)*23*.06)/6.8,g=(Math.cos(a*e*3+r*e*2)*2*.34+Math.sin(a*e*5-r*e*4+1.1)*4*.25+Math.cos(a*e*9+r*e*7+2.4)*7*.17+Math.sin(a*e*15-r*e*12+.7)*12*.11+Math.cos(a*e*23+r*e*19+1.9)*19*.06)/6.8,_=Ta(a,r,6,13),m=Ta((a+.37)%1,(r+.61)%1,10,47),p=Math.pow(Math.max(0,1-Math.min(1,_.edge*2.85)),2.6),b=Math.pow(Math.max(0,1-Math.min(1,m.edge*3.1)),3),T=Math.min(1,p*.75+b*.52),y=Ta(a,r,9,89),v=Ta((a+.21)%1,(r+.43)%1,17,131),S=Math.max(0,1-Math.min(1,y.edge*2.4)),A=Math.max(0,1-Math.min(1,v.edge*2.7)),x=Math.max(0,Math.min(1,.18+S*.56+A*.38+(l+c)*.12)),E=(n*s+o)*4;t[E]=Math.max(0,Math.min(255,Math.round((f*.5+.5)*255))),t[E+1]=Math.max(0,Math.min(255,Math.round((g*.5+.5)*255))),t[E+2]=Math.max(0,Math.min(255,Math.round(T*255))),t[E+3]=Math.max(0,Math.min(255,Math.round(x*255)))}}let i=new Ln(t,s,s,oi);return en(i,4,!1)}function hg(s=4){let e=Sn(256),i=e.getContext("2d"),n=Sn(256),r=n.getContext("2d");i.fillStyle="#adb4bc",i.fillRect(0,0,256,256),r.fillStyle="#808080",r.fillRect(0,0,256,256);let o=i.getImageData(0,0,256,256),a=r.getImageData(0,0,256,256);for(let h=0;h<256;h++)for(let d=0;d<256;d++){let u=(h*256+d)*4,f=Se(d,h,3)-.5,g=Se(d>>1,h>>1,9)-.5,_=Math.sin(h/256*Math.PI*8+Se(d>>2,1,21)*1.4)*4.5,m=f*18+g*14+_;o.data[u]=Math.max(0,Math.min(255,174+m)),o.data[u+1]=Math.max(0,Math.min(255,180+m)),o.data[u+2]=Math.max(0,Math.min(255,186+m*1.05)),o.data[u+3]=255;let p=Math.max(0,Math.min(255,128+f*38+g*26));a.data[u]=p,a.data[u+1]=p,a.data[u+2]=p,a.data[u+3]=255}i.putImageData(o,0,0),r.putImageData(a,0,0);let l=256/4,c=256/4;for(let h=0;h<4;h++)for(let d=0;d<4;d++){let u=d*l,f=h*c,g=(Se(d,h,55)-.5)*.07;i.fillStyle=g>0?`rgba(255,255,255,${g})`:`rgba(15,23,42,${-g})`,i.fillRect(u+2,f+2,l-4,c-4),i.strokeStyle="rgba(42, 52, 65, 0.58)",i.lineWidth=2,i.strokeRect(u+1,f+1,l-2,c-2),r.strokeStyle="#363636",r.lineWidth=2.5,r.strokeRect(u+1,f+1,l-2,c-2);let _=[[u+12,f+12],[u+l-12,f+12],[u+12,f+c-12],[u+l-12,f+c-12]];for(let[m,p]of _)i.fillStyle="rgba(38, 46, 56, 0.72)",i.beginPath(),i.arc(m,p,2.3,0,Math.PI*2),i.fill(),r.fillStyle="#222222",r.beginPath(),r.arc(m,p,2.6,0,Math.PI*2),r.fill()}return{map:en(new mi(e),s,!0),bumpMap:en(new mi(n),s,!1)}}function ug(s=4){let e=Sn(256),i=e.getContext("2d");i.fillStyle="#9a6b3b",i.fillRect(0,0,256,256);for(let n=0;n<8;n++){let r=n*32,o=135+Math.round((Se(n,2,71)-.5)*32);i.fillStyle=`rgb(${o+26}, ${o-8}, ${Math.max(40,o-62)})`,i.fillRect(0,r,256,30),i.fillStyle="rgba(38, 22, 10, 0.65)",i.fillRect(0,r+30,256,2)}i.strokeStyle="#3f4752",i.lineWidth=5;for(let n=16;n<256;n+=32)i.beginPath(),i.moveTo(n,0),i.lineTo(n,256),i.stroke(),i.beginPath(),i.moveTo(0,n),i.lineTo(256,n),i.stroke();i.strokeStyle="#d97706",i.lineWidth=3,i.beginPath(),i.moveTo(0,0),i.lineTo(256,256),i.moveTo(256,0),i.lineTo(0,256),i.stroke();for(let n=16;n<256;n+=32)for(let r=16;r<256;r+=32)i.fillStyle="#b45309",i.fillRect(r-3,n-3,6,6);return en(new mi(e),s,!0)}function dg(s=4){let e=Sn(256),i=e.getContext("2d"),n=i.createLinearGradient(0,0,256,0);n.addColorStop(0,"#788594"),n.addColorStop(.35,"#aeb9c6"),n.addColorStop(.55,"#8693a2"),n.addColorStop(.85,"#b8c3cf"),n.addColorStop(1,"#788594"),i.fillStyle=n,i.fillRect(0,0,256,256);for(let r=0;r<256;r+=2){let o=(Se(1,r,101)-.5)*.1;i.fillStyle=o>0?`rgba(255,255,255,${o})`:`rgba(0,0,0,${-o})`,i.fillRect(0,r,256,1)}for(let r=0;r<256;r+=64){i.fillStyle="rgba(30, 41, 59, 0.65)",i.fillRect(0,r,256,3),i.fillStyle="rgba(226, 232, 240, 0.45)",i.fillRect(0,r+3,256,2);for(let o=8;o<256;o+=16)i.fillStyle="#334155",i.beginPath(),i.arc(o,r+9,2.1,0,Math.PI*2),i.fill()}return en(new mi(e),s,!0)}function fg(s=4){let e=Sn(256),i=e.getContext("2d");i.fillStyle="#c8cfd6",i.fillRect(0,0,256,256);let n=12,r=10,o=256/n,a=256/r;for(let l=0;l<n;l++){let c=l%2*(a*.5);for(let h=-1;h<=r;h++){let d=h*a+c,u=l*o,f=195+Math.round((Se(h+10,l,37)-.5)*34);i.fillStyle=`rgb(${f}, ${f-4}, ${f-8})`,i.fillRect(d+1,u+1,a-2,o-3),i.fillStyle="rgba(15, 23, 42, 0.36)",i.fillRect(d,u+o-3,a,3)}}return en(new mi(e),s,!0)}function pg(s=4){let t=Sn(128),e=t.getContext("2d");e.fillStyle="#97ab94",e.fillRect(0,0,128,128);for(let l=0;l<620;l++){let c=Se(l,1,11)*128,h=Se(l,2,19)*128,d=Se(l,3,29)>.46;e.strokeStyle=d?"rgba(235, 252, 224, 0.42)":"rgba(24, 46, 26, 0.45)",e.lineWidth=2,e.beginPath(),e.moveTo(c,h),e.lineTo(c+(Se(l,4,41)-.5)*14,h+5+Se(l,5,53)*8),e.stroke()}let i=Sn(128),n=i.getContext("2d");n.fillStyle="#6b4c32",n.fillRect(0,0,128,128);for(let l=0;l<128;l+=3){let c=(Se(l,7,61)-.5)*44;n.fillStyle=`rgb(${Math.min(255,Math.max(0,108+c))}, ${Math.min(255,Math.max(0,76+c*.7))}, ${Math.min(255,Math.max(0,50+c*.5))})`,n.fillRect(l,0,2,128)}for(let l=0;l<90;l++)n.fillStyle="rgba(28, 17, 10, 0.52)",n.fillRect(Se(l,1,79)*128,Se(l,2,83)*128,2,14+Se(l,3,97)*18);let r=Sn(256),o=r.getContext("2d");o.fillStyle="#8b8a85",o.fillRect(0,0,256,256);let a=o.getImageData(0,0,256,256);for(let l=0;l<256;l++)for(let c=0;c<256;c++){let h=(l*256+c)*4,d=(Se(c,l,5)-.5)*42,u=(Se(c>>2,l>>2,15)-.5)*34,f=Se(c>>4,l>>4,27)>.76?1:0,g=138+d+u;a.data[h]=Math.max(0,Math.min(255,g-f*22)),a.data[h+1]=Math.max(0,Math.min(255,g+f*18)),a.data[h+2]=Math.max(0,Math.min(255,g-4-f*28)),a.data[h+3]=255}return o.putImageData(a,0,0),{foliage:en(new mi(t),s,!0),bark:en(new mi(i),s,!0),rock:en(new mi(r),s,!0)}}function Aa(s){let t=s?Math.min(8,s.capabilities.getMaxAnisotropy()):4,e=Su(384),i=hg(t),n=ug(t),r=dg(t),o=fg(t),a=pg(t);return{waterDetail:e,concreteMap:i.map,concreteBump:i.bumpMap,rebarFormwork:n,steel:r,roof:o,foliage:a.foliage,bark:a.bark,rock:a.rock}}function wu(s,t=null){let e={uTime:{value:0},uSunDir:{value:new O(.52,.74,.42).normalize()},uSunColor:{value:new yt(16774364)},uSkyColor:{value:new yt(7186664)},uFogColor:{value:new yt(11061992)},uFogDensity:{value:5e-4},uShowContours:{value:0},uDetailTex:{value:s},uConcreteTex:{value:t||s},uHasConcreteTex:{value:t?1:0}};return new Re({uniforms:e,extensions:{derivatives:!0},vertexShader:`
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

      // \u041F\u043B\u0430\u0432\u043D\u044B\u0439 \u0431\u0438\u043B\u0438\u043D\u0435\u0439\u043D\u044B\u0439 \u0448\u0443\u043C \u0431\u0435\u0437 \u043F\u0438\u043A\u0441\u0435\u043B\u044C\u043D\u044B\u0445 \u043A\u0432\u0430\u0434\u0440\u0430\u0442\u043E\u0432!
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
        float detailFade = 1.0 - smoothstep(140.0, 480.0, camDist);

        // --- 1. \u041C\u043D\u043E\u0433\u043E\u0441\u043B\u043E\u0439\u043D\u044B\u0439 \u043F\u0440\u043E\u0446\u0435\u0434\u0443\u0440\u043D\u044B\u0439 \u043C\u0438\u043A\u0440\u043E\u0440\u0435\u043B\u044C\u0435\u0444 \u0434\u043B\u044F \u0442\u0440\u0430\u0432, \u0433\u0430\u043B\u044C\u043A\u0438 \u0438 \u0442\u0440\u0435\u0449\u0438\u043D \u0433\u0440\u0430\u043D\u0438\u0442\u0430 ---
        float macroPatch = fbm3(vWorldPos.xz * 0.032);
        float medDetail = fbm3(vWorldPos.xz * 0.28);
        float pebbleField = vnoise(vWorldPos.xz * 2.35) * 0.65 + vnoise(vWorldPos.xz * 5.2) * 0.35;

        // \u0422\u0440\u0438\u043F\u043B\u0430\u043D\u0430\u0440\u043D\u044B\u0435 \u0433\u0435\u043E\u043B\u043E\u0433\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u043F\u043B\u0430\u0441\u0442\u044B \u0438 \u0442\u0440\u0435\u0449\u0438\u043D\u044B \u043D\u0430 \u043A\u0440\u0443\u0442\u044B\u0445 \u0443\u0442\u0451\u0441\u0430\u0445 \u043A\u0430\u043D\u044C\u043E\u043D\u0430!
        float cliffStrata = sin(vWorldPos.y * 1.65 + fbm3(vWorldPos.xz * 0.09) * 3.8) * 0.5 + 0.5;
        float cliffCracks = vnoise(vec2(vWorldPos.x + vWorldPos.z, vWorldPos.y * 1.9) * 0.85);
        float rockMask = clamp(smoothstep(0.30, 0.58, slope) + (1.0 - smoothstep(0.20, 0.85, soil)) * 0.76, 0.0, 1.0);

        // \u0421\u043E\u0431\u0438\u0440\u0430\u0435\u043C \u0441\u043A\u0430\u043B\u044F\u0440\u043D\u043E\u0435 \u043F\u043E\u043B\u0435 \u0432\u044B\u0441\u043E\u0442\u044B \u043C\u0438\u043A\u0440\u043E\u0440\u0435\u043B\u044C\u0435\u0444\u0430 \u0434\u043B\u044F \u0447\u0435\u0441\u0442\u043D\u043E\u0433\u043E \u044D\u043A\u0440\u0430\u043D\u043D\u043E\u0433\u043E bump-mapping
        float microHeight = mix(medDetail * 0.45 + pebbleField * wetness * 0.45, cliffStrata * 0.65 + cliffCracks * 0.55, rockMask);

        // --- 2. \u0411\u043E\u0433\u0430\u0442\u044B\u0435 \u043F\u0440\u0438\u0440\u043E\u0434\u043D\u044B\u0435 \u0431\u0438\u043E\u043C\u044B \u0434\u043E\u043B\u0438\u043D\u044B ---
        vec3 valleyGrass = mix(vec3(0.21, 0.45, 0.17), vec3(0.32, 0.56, 0.22), macroPatch);
        // \u0426\u0432\u0435\u0442\u0443\u0449\u0438\u0435 \u043B\u0443\u0433\u043E\u0432\u044B\u0435 \u043F\u044F\u0442\u043D\u0430 \u043A\u043B\u0435\u0432\u0435\u0440\u0430/\u0440\u0430\u0437\u043D\u043E\u0442\u0440\u0430\u0432\u044C\u044F \u043D\u0430 \u0441\u043E\u043B\u043D\u0435\u0447\u043D\u044B\u0445 \u043F\u043E\u043B\u044F\u043D\u0430\u0445
        float wildflower = smoothstep(0.66, 0.82, fbm3(vWorldPos.xz * 0.14 + 12.0)) * (1.0 - slope * 2.0);
        valleyGrass = mix(valleyGrass, vec3(0.46, 0.58, 0.24), wildflower * 0.55);

        vec3 alpineMoss = mix(vec3(0.33, 0.46, 0.23), vec3(0.47, 0.52, 0.29), medDetail);
        float altMix = smoothstep(23.0, 48.0, vWorldPos.y);
        vec3 grassCol = mix(valleyGrass, alpineMoss, altMix) * (0.86 + medDetail * 0.28);

        // \u0421\u0443\u0433\u043B\u0438\u043D\u043E\u043A, \u0441\u0432\u0435\u0436\u0438\u0439 \u0441\u0440\u0435\u0437 \u0433\u0440\u0443\u043D\u0442\u0430 \u0432 \u043E\u0442\u043A\u043E\u0441\u0430\u0445 \u043A\u0430\u043D\u0430\u043B\u0430 \u0438 \u0440\u0435\u0447\u043D\u043E\u0439 \u0433\u0430\u043B\u0435\u0447\u043D\u0438\u043A
        vec3 richLoam = mix(vec3(0.45, 0.33, 0.21), vec3(0.58, 0.44, 0.29), medDetail);
        float bareSoil = clamp(smoothstep(0.24, 0.52, slope) + (1.0 - smoothstep(0.38, 1.45, soil)) * 0.55, 0.0, 1.0);
        vec3 groundCol = mix(grassCol, richLoam, bareSoil * 0.76);

        vec3 cobbleCol = mix(vec3(0.49, 0.46, 0.39), vec3(0.67, 0.62, 0.52), pebbleField);
        float shoreBlend = clamp(wetness * 0.78 + smoothstep(0.01, 0.28, subDepth) * 0.60, 0.0, 0.92);
        groundCol = mix(groundCol, cobbleCol, shoreBlend);

        // \u0421\u043B\u043E\u0438\u0441\u0442\u044B\u0439 \u0441\u0435\u0440\u044B\u0439 \u0438 \u0442\u0451\u043F\u043B\u044B\u0439 \u043A\u0432\u0430\u0440\u0446\u0435\u0432\u044B\u0439 \u0433\u0440\u0430\u043D\u0438\u0442 \u0443\u0449\u0435\u043B\u0438\u0439 \u0441\u043E \u043C\u0445\u043E\u043C \u043D\u0430 \u043F\u043E\u043B\u043A\u0430\u0445
        vec3 darkGranite = vec3(0.34, 0.35, 0.37);
        vec3 warmQuartz = vec3(0.55, 0.52, 0.48);
        vec3 graniteCol = mix(darkGranite, warmQuartz, cliffStrata * 0.65 + cliffCracks * 0.35);
        float ledgeMoss = (1.0 - smoothstep(0.18, 0.44, slope)) * rockMask * smoothstep(0.45, 0.75, medDetail);
        graniteCol = mix(graniteCol, vec3(0.29, 0.42, 0.22), ledgeMoss * 0.65);

        vec3 col = mix(groundCol, graniteCol, rockMask);

        // \u0421\u043D\u0435\u0436\u043D\u044B\u0435 \u0448\u0430\u043F\u043A\u0438 \u0438 \u0444\u0438\u0440\u043D \u0432 \u0432\u044B\u0441\u043E\u043A\u043E\u0433\u043E\u0440\u044C\u0435 \u0441 \u0438\u0441\u043A\u0440\u0438\u0441\u0442\u044B\u043C \u0442\u043E\u043D\u043E\u043C
        float snowLine = 54.0 + macroPatch * 6.0;
        float snowMask = smoothstep(snowLine, snowLine + 10.0, vWorldPos.y) * (1.0 - smoothstep(0.44, 0.74, slope));
        vec3 snowCol = mix(vec3(0.88, 0.93, 0.98), vec3(0.97, 0.99, 1.0), medDetail);
        col = mix(col, snowCol, snowMask);

        // --- 3. \u0410\u0440\u0445\u0438\u0442\u0435\u043A\u0442\u0443\u0440\u043D\u044B\u0439 \u0431\u0435\u0442\u043E\u043D \u043F\u043B\u043E\u0442\u0438\u043D \u0438 \u043E\u0431\u043B\u0438\u0446\u043E\u0432\u0430\u043D\u043D\u044B\u0445 \u043A\u0430\u043D\u0430\u043B\u043E\u0432 ---
        if (concrete > 0.05) {
          float concMask = clamp(concrete * 2.4, 0.0, 1.0);
          vec3 triW = pow(abs(Ngeom), vec3(4.0));
          triW /= max(0.001, triW.x + triW.y + triW.z);

          vec3 texXZ = texture2D(uConcreteTex, vWorldPos.xz * 0.11).rgb;
          vec3 texXY = texture2D(uConcreteTex, vWorldPos.xy * 0.11).rgb;
          vec3 texZY = texture2D(uConcreteTex, vWorldPos.zy * 0.11).rgb;
          vec3 triConc = texXZ * triW.y + texXY * triW.z + texZY * triW.x;

          float seamX = step(0.955, fract(vWorldPos.x * 0.25));
          float seamZ = step(0.955, fract(vWorldPos.z * 0.25));
          float seamY = step(0.935, fract(vWorldPos.y * 0.33));
          float joints = clamp(seamX + seamZ + seamY * 0.65, 0.0, 1.0);

          vec3 baseConc = uHasConcreteTex > 0.5 ? (triConc * 1.06) : vec3(0.71, 0.73, 0.75);
          vec3 concCol = baseConc - joints * 0.12;
          // \u0422\u0451\u043C\u043D\u043E-\u0438\u0437\u0443\u043C\u0440\u0443\u0434\u043D\u0430\u044F \u043F\u043E\u043B\u043E\u0441\u0430 \u0432\u043E\u0434\u043E\u0440\u043E\u0441\u043B\u0435\u0439/\u0432\u043B\u0430\u0433\u0438 \u0443 \u0432\u0430\u0442\u0435\u0440\u043B\u0438\u043D\u0438\u0438 \u0431\u0435\u0442\u043E\u043D\u0430
          concCol = mix(concCol, vec3(0.28, 0.35, 0.30), wetness * (1.0 - clamp(subDepth * 0.5, 0.0, 1.0)) * 0.38);

          col = mix(col, concCol, concMask);
          microHeight = mix(microHeight, (triConc.r - joints * 0.35) * 0.7, concMask);
        }

        // \u0424\u0438\u0437\u0438\u0447\u0435\u0441\u043A\u043E\u0435 \u043F\u043E\u0442\u0435\u043C\u043D\u0435\u043D\u0438\u0435 \u043F\u043E\u0440\u0438\u0441\u0442\u044B\u0445 \u043F\u043E\u0440\u043E\u0434 \u043E\u0442 \u043A\u0430\u043F\u0438\u043B\u043B\u044F\u0440\u043D\u043E\u0439 \u0432\u043B\u0430\u0433\u0438
        col *= mix(1.0, 0.63, wetness);

        // --- 4. \u0410\u043D\u0430\u043B\u0438\u0442\u0438\u0447\u0435\u0441\u043A\u043E\u0435 \u0432\u043E\u0437\u043C\u0443\u0449\u0435\u043D\u0438\u0435 \u043D\u043E\u0440\u043C\u0430\u043B\u0438 (Bump Mapping \u0431\u0435\u0437 \u0434\u043E\u043F\u043E\u043B\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0445 \u0442\u0435\u043A\u0441\u0442\u0443\u0440!) ---
        vec3 dPosX = dFdx(vWorldPos);
        vec3 dPosY = dFdy(vWorldPos);
        float dHx = dFdx(microHeight) * detailFade;
        float dHy = dFdy(microHeight) * detailFade;
        vec3 r1 = cross(dPosY, Ngeom);
        vec3 r2 = cross(Ngeom, dPosX);
        float det = dot(dPosX, r1);
        vec3 surfGrad = sign(det) * (dHx * r1 + dHy * r2);
        float bumpStrength = mix(0.32, 0.62, rockMask);
        vec3 N = normalize(abs(det) > 1e-7 ? (abs(det) * Ngeom - bumpStrength * surfGrad) : Ngeom);

        // --- 5. \u0420\u0435\u0430\u043B\u0438\u0441\u0442\u0438\u0447\u043D\u043E\u0435 \u043E\u0441\u0432\u0435\u0449\u0435\u043D\u0438\u0435 (\u0421\u043E\u043B\u043D\u0446\u0435 + \u043F\u043E\u043B\u0443\u0441\u0444\u0435\u0440\u0430 \u043D\u0435\u0431\u0430 + \u0442\u0451\u043F\u043B\u044B\u0439 \u043E\u0442\u0441\u0432\u0435\u0442 \u0437\u0435\u043C\u043B\u0438 + \u043C\u043E\u043A\u0440\u044B\u0439 \u0431\u043B\u0438\u043A) ---
        float NdotL = max(0.0, dot(N, uSunDir));
        float hemi = 0.5 + 0.5 * N.y;
        float cavityAO = mix(0.84, 1.06, clamp(microHeight, 0.0, 1.0));
        vec3 bounceLight = vec3(0.24, 0.21, 0.16) * (1.0 - N.y) * 0.24;
        vec3 lighting = (uSunColor * (NdotL * 0.95) + uSkyColor * (0.28 + 0.30 * hemi) + bounceLight) * cavityAO;

        vec3 V = normalize(cameraPosition - vWorldPos);
        vec3 H = normalize(uSunDir + V);
        float wetSpec = pow(max(0.0, dot(N, H)), 56.0) * wetness * 0.42;
        vec3 litCol = col * lighting + uSunColor * wetSpec;

        // \u0413\u0435\u043E\u0434\u0435\u0437\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u0438\u0437\u043E\u043B\u0438\u043D\u0438\u0438 \u0432\u044B\u0441\u043E\u0442 (\u043A\u0430\u0436\u0434\u044B\u0435 2 \u043C \u0438 \u0436\u0438\u0440\u043D\u044B\u0435 \u043A\u0430\u0436\u0434\u044B\u0435 10 \u043C)
        if (uShowContours > 0.5) {
          float minor = abs(fract(vWorldPos.y * 0.5) - 0.5);
          float major = abs(fract(vWorldPos.y * 0.1) - 0.5);
          float lineMinor = 1.0 - smoothstep(0.014, 0.044, minor);
          float lineMajor = 1.0 - smoothstep(0.011, 0.032, major);
          litCol = mix(litCol, vec3(0.95, 0.86, 0.42), lineMinor * 0.32);
          litCol = mix(litCol, vec3(1.0, 0.97, 0.74), lineMajor * 0.72);
        }

        float fogF = 1.0 - exp(-pow(camDist * uFogDensity, 1.65));
        litCol = mix(litCol, uFogColor, clamp(fogF, 0.0, 0.84));

        gl_FragColor = vec4(litCol, 1.0);
      }
    `})}function Eu(s){let t={uTime:{value:0},uSunDir:{value:new O(.52,.74,.42).normalize()},uSunColor:{value:new yt(16774624)},uSkyZenith:{value:new yt(2647213)},uSkyHorizon:{value:new yt(10931688)},uFogColor:{value:new yt(11061992)},uFogDensity:{value:5e-4},uDetailTex:{value:s}};return new Re({uniforms:t,transparent:!0,depthWrite:!0,side:zi,vertexShader:`
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

        // --- 1. \u0414\u0432\u0443\u0445\u0444\u0430\u0437\u043D\u0430\u044F \u0430\u0434\u0432\u0435\u043A\u0446\u0438\u044F \u0432\u043E\u043B\u043D\u043E\u0432\u044B\u0445 \u043D\u043E\u0440\u043C\u0430\u043B\u0435\u0439 \u0432\u0434\u043E\u043B\u044C \u0432\u0435\u043A\u0442\u043E\u0440\u0430 \u0442\u0435\u0447\u0435\u043D\u0438\u044F (u, v) ---
        vec2 flowDir = speed > 0.02 ? (vel / speed) : vec2(0.0, 1.0);
        vec2 flowStep = vel * 0.050;
        float cycle = 1.18;
        float p0 = fract(uTime / cycle);
        float p1 = fract(uTime / cycle + 0.5);
        float blend = abs(2.0 * p0 - 1.0);

        vec2 baseUv = vWorldPos.xz * 0.078;
        vec4 s0 = texture2D(uDetailTex, baseUv - flowStep * (p0 * cycle));
        vec4 s1 = texture2D(uDetailTex, baseUv - flowStep * (p1 * cycle) + vec2(0.37, 0.61));
        vec4 waveSample = mix(s0, s1, blend);

        vec2 fineUv = vWorldPos.xz * 0.23 + vec2(vort * 0.075, -vort * 0.075);
        vec4 f0 = texture2D(uDetailTex, fineUv - flowStep * (p0 * cycle * 1.65));
        vec4 f1 = texture2D(uDetailTex, fineUv - flowStep * (p1 * cycle * 1.65) + vec2(0.53, 0.19));
        vec4 fineSample = mix(f0, f1, blend);

        float froude = speed / sqrt(9.81 * max(0.08, depth));
        float chopAmp = (0.18 + clamp(speed * 0.050 + froude * 0.13, 0.0, 0.48)) * (1.0 - smoothstep(190.0, 560.0, dist) * 0.65);

        vec2 dN = ((waveSample.xy * 2.0 - 1.0) * 0.68 + (fineSample.xy * 2.0 - 1.0) * 0.40) * chopAmp;
        vec3 N = normalize(vec3(vMacroNormal.x + dN.x, vMacroNormal.y, vMacroNormal.z + dN.y));

        // --- 2. \u041F\u0440\u0435\u043B\u043E\u043C\u043B\u0435\u043D\u0438\u0435 \u043F\u043E\u0434\u0432\u043E\u0434\u043D\u043E\u0433\u043E \u0433\u0430\u043B\u0435\u0447\u043D\u0438\u043A\u0430 \u0438 \u043F\u043B\u0438\u0442 \u043F\u043E \u0437\u0430\u043A\u043E\u043D\u0443 \u0421\u043D\u0435\u043B\u043B\u0438\u0443\u0441\u0430 + \u043A\u0430\u0443\u0441\u0442\u0438\u043A\u0430 \u0412\u043E\u0440\u043E\u043D\u043E\u0433\u043E ---
        float daySun = max(0.14, clamp(uSunDir.y + 0.18, 0.0, 1.0));
        vec2 refrXZ = vWorldPos.xz - N.xz * min(depth, 4.0) * 0.54;

        float cobbleA = vnoise(refrXZ * 2.6);
        float cobbleB = vnoise(refrXZ * 6.4);
        vec3 gravelBed = mix(vec3(0.41, 0.38, 0.31), vec3(0.61, 0.56, 0.46), cobbleA * 0.65 + cobbleB * 0.35);

        float slabJoint = clamp(step(0.95, fract(refrXZ.x * 0.25)) + step(0.95, fract(refrXZ.y * 0.25)), 0.0, 1.0);
        vec3 concBed = vec3(0.56, 0.60, 0.63) - slabJoint * 0.14 + (cobbleB - 0.5) * 0.08;
        vec3 bedAlbedo = mix(gravelBed, concBed, isConcreteBed);

        vec2 cUv1 = refrXZ * 0.095 + vec2(uTime * 0.036, uTime * 0.025);
        vec2 cUv2 = refrXZ * 0.135 - vec2(uTime * 0.029, -uTime * 0.032);
        float caust = (texture2D(uDetailTex, cUv1).b + texture2D(uDetailTex, cUv2).b) * 0.82 * exp(-depth * 0.29) * daySun;
        vec3 sunlitBed = bedAlbedo * (0.36 + 0.86 * daySun) + uSunColor * caust * 0.52;

        // --- 3. \u0417\u0430\u043A\u043E\u043D \u0411\u0443\u0433\u0435\u0440\u0430 \u2014 \u041B\u0430\u043C\u0431\u0435\u0440\u0442\u0430 \u2014 \u0411\u0435\u0440\u0430 (\u043A\u0440\u0438\u0441\u0442\u0430\u043B\u044C\u043D\u0430\u044F \u043E\u0442\u043C\u0435\u043B\u044C -> \u0431\u0438\u0440\u044E\u0437\u0430 -> \u0433\u043B\u0443\u0431\u043E\u043A\u0438\u0439 \u0441\u0430\u043F\u0444\u0438\u0440 \u0431\u044C\u0435\u0444\u0430) ---
        float viewCos = max(0.30, abs(dot(N, V)));
        float opticalPath = depth / viewCos;

        vec3 sigmaPure = vec3(0.44, 0.092, 0.064);
        vec3 transmittance = exp(-sigmaPure * opticalPath);

        vec3 pureScatter = mix(vec3(0.035, 0.34, 0.37), vec3(0.015, 0.12, 0.23), smoothstep(1.4, 12.5, depth)) * (0.28 + 0.84 * daySun);
        vec3 mudScatter = vec3(0.50, 0.37, 0.21) * (0.30 + 0.75 * daySun);
        float mudMask = clamp(sediment * 0.72, 0.0, 0.88);
        vec3 inScatter = mix(pureScatter, mudScatter, mudMask);

        vec3 effTrans = transmittance * (1.0 - mudMask * 0.88);
        vec3 underwaterRadiance = sunlitBed * effTrans + inScatter * (1.0 - effTrans);

        // \u041F\u043E\u0434\u043F\u043E\u0432\u0435\u0440\u0445\u043D\u043E\u0441\u0442\u043D\u043E\u0435 \u0431\u0438\u0440\u044E\u0437\u043E\u0432\u043E\u0435 \u0441\u0432\u0435\u0447\u0435\u043D\u0438\u0435 \u0433\u0440\u0435\u0431\u043D\u0435\u0439 \u0432\u043E\u043B\u043D \u043D\u0430 \u0441\u043E\u043B\u043D\u0446\u0435
        float sss = pow(clamp(dot(V, -uSunDir + N * 0.6), 0.0, 1.0), 3.0) * (1.0 - mudMask * 0.75);
        underwaterRadiance += vec3(0.05, 0.33, 0.30) * sss * max(0.0, uSunDir.y);

        // --- 4. \u041E\u0442\u0440\u0430\u0436\u0435\u043D\u0438\u044F \u0424\u0440\u0435\u043D\u0435\u043B\u044F \u0438 \u0441\u043E\u043B\u043D\u0435\u0447\u043D\u044B\u0435 \u0438\u0441\u043A\u0440\u044B ---
        float NdotV = max(0.0, dot(N, V));
        float fresnel = clamp(0.024 + 0.88 * pow(1.0 - NdotV, 4.6), 0.024, 0.87);

        vec3 R = reflect(-V, N);
        float skyGrad = clamp(R.y * 0.5 + 0.5, 0.0, 1.0);
        float canyonReflect = 1.0 - smoothstep(0.0, 0.20, R.y) * 0.26;
        vec3 skyRefl = mix(uSkyHorizon, uSkyZenith, pow(skyGrad, 0.74)) * canyonReflect;

        vec3 H = normalize(uSunDir + V);
        float specCore = pow(max(0.0, dot(N, H)), 420.0) * 2.8;
        float specSparkle = pow(max(0.0, dot(N, H)), 58.0) * 0.30;
        vec3 sunSpec = uSunColor * (specCore + specSparkle) * smoothstep(-0.02, 0.12, uSunDir.y);

        // --- 5. \u041A\u0440\u0443\u0436\u0435\u0432\u043D\u0430\u044F \u043F\u0435\u043D\u0430 \u0431\u0443\u0440\u0443\u043D\u043E\u0432 \u0438 \u0432\u043E\u0434\u043E\u0441\u0431\u0440\u043E\u0441\u043E\u0432 ---
        vec2 orthoDir = vec2(-flowDir.y, flowDir.x);
        vec2 anisoUv = vec2(dot(vWorldPos.xz, flowDir) * 0.072 - uTime * (0.26 + speed * 0.044),
                            dot(vWorldPos.xz, orthoDir) * 0.19);
        float lacePattern = texture2D(uDetailTex, anisoUv).a * 0.64
                          + texture2D(uDetailTex, anisoUv * 2.15 + vec2(0.31, -uTime * 0.08)).a * 0.36;

        float shoreMeniscus = (1.0 - smoothstep(0.015, 0.18, depth)) * clamp(speed * 0.25, 0.10, 0.70);
        float totalFoamDrive = clamp(foamVal * 1.20 + shoreMeniscus + clamp(froude - 1.08, 0.0, 0.68) * 0.60, 0.0, 1.0);
        float foamMask = smoothstep(0.36 - totalFoamDrive * 0.30, 0.75 - totalFoamDrive * 0.22, lacePattern * totalFoamDrive * 1.52);
        vec3 foamColor = vec3(0.96, 0.98, 1.0) * (0.36 + 0.68 * daySun);

        vec3 surfaceCol = mix(underwaterRadiance, skyRefl, fresnel) + sunSpec * (1.0 - foamMask * 0.7);
        vec3 finalCol = mix(surfaceCol, foamColor, foamMask);

        float distFog = 1.0 - exp(-pow(dist * uFogDensity, 1.65));
        finalCol = mix(finalCol, uFogColor, clamp(distFog, 0.0, 0.84));

        float edgeAlpha = smoothstep(0.010, 0.075, depth);
        gl_FragColor = vec4(finalCol, edgeAlpha);
      }
    `})}function Tu(s=null){return new Re({uniforms:{uSunDir:{value:new O(.5,.7,.4).normalize()},uSunColor:{value:new yt(16774364)},uSkyColor:{value:new yt(8369128)},uNightFactor:{value:0},uFogColor:{value:new yt(11061992)},uFogDensity:{value:5e-4},uRoofTex:{value:s},uHasRoofTex:{value:s?1:0}},vertexShader:`
      attribute float aPowered;
      varying vec3 vWorldPos;
      varying vec3 vLocalPos;
      varying vec3 vNormalW;
      varying vec3 vColor;
      varying float vPowered;

      void main() {
        vLocalPos = position;
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
      uniform sampler2D uRoofTex;
      uniform float uHasRoofTex;

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
        vec3 baseAlbedo = vColor;

        // \u041F\u043B\u043E\u0441\u043A\u0430\u044F \u043A\u0440\u043E\u0432\u043B\u044F \u0432\u044B\u0441\u043E\u0442\u043E\u043A \u0441 \u0433\u0440\u0430\u0432\u0438\u0439\u043D\u043E\u0439 \u043A\u0440\u043E\u0448\u043A\u043E\u0439 \u0438 \u0431\u043E\u0440\u0442\u0438\u043A\u043E\u043C \u043F\u0430\u0440\u0430\u043F\u0435\u0442\u0430
        if (N.y > 0.55) {
          float roofEdge = max(abs(vLocalPos.x), abs(vLocalPos.z));
          float parapet = smoothstep(0.41, 0.46, roofEdge);
          vec3 roofGrain = uHasRoofTex > 0.5 ? texture2D(uRoofTex, vWorldPos.xz * 0.25).rgb : vec3(0.55);
          baseAlbedo = mix(roofGrain * 0.72, vColor * 0.88, parapet);
        } else {
          // \u041A\u0430\u043C\u0435\u043D\u043D\u044B\u0439 \u0446\u043E\u043A\u043E\u043B\u044C \u043F\u0435\u0440\u0432\u043E\u0433\u043E \u044D\u0442\u0430\u0436\u0430, \u0443\u0433\u043B\u043E\u0432\u044B\u0435 \u043F\u0438\u043B\u044F\u0441\u0442\u0440\u044B \u0438 \u043C\u0435\u0436\u044D\u0442\u0430\u0436\u043D\u044B\u0435 \u043F\u043E\u044F\u0441\u0430
          float plinth = 1.0 - smoothstep(0.05, 0.11, vLocalPos.y);
          float cornice = smoothstep(0.93, 0.96, vLocalPos.y);
          float cornerTrim = smoothstep(0.42, 0.47, max(abs(vLocalPos.x), abs(vLocalPos.z)));
          float floorBand = step(0.91, fract(vWorldPos.y * 0.36));
          baseAlbedo *= (1.0 - plinth * 0.24 - floorBand * 0.08 + cornice * 0.12 + cornerTrim * 0.08);
        }

        vec3 litWall = baseAlbedo * (uSunColor * NdotL * 0.88 + uSkyColor * (0.30 + 0.26 * max(0.0, N.y)));

        // \u0414\u0435\u0442\u0430\u043B\u0438\u0437\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0435 \u043E\u043A\u043D\u0430 \u0441 \u043F\u0435\u0440\u0435\u043F\u043B\u0451\u0442\u0430\u043C\u0438 \u0440\u0430\u043C, \u0434\u043D\u0435\u0432\u043D\u044B\u043C \u043E\u0442\u0440\u0430\u0436\u0435\u043D\u0438\u0435\u043C \u043D\u0435\u0431\u0430 \u0438 \u043D\u043E\u0447\u043D\u044B\u043C \u0441\u0432\u0435\u0442\u043E\u043C
        if (abs(N.y) < 0.45) {
          float uCoord = abs(N.x) > 0.5 ? vWorldPos.z : vWorldPos.x;
          vec2 winGrid = vec2(uCoord * 0.54, vWorldPos.y * 0.36);
          vec2 cell = floor(winGrid);
          vec2 f = fract(winGrid);

          float inWin = step(0.18, f.x) * step(f.x, 0.82) * step(0.22, f.y) * step(f.y, 0.80);
          inWin *= step(0.09, vLocalPos.y) * step(vLocalPos.y, 0.93);
          inWin *= (1.0 - smoothstep(0.43, 0.47, max(abs(vLocalPos.x), abs(vLocalPos.z))));

          if (inWin > 0.5) {
            // \u0422\u0451\u043C\u043D\u044B\u0439 \u043E\u043A\u043E\u043D\u043D\u044B\u0439 \u043F\u0435\u0440\u0435\u043F\u043B\u0451\u0442 / \u0440\u0430\u043C\u0430 \u043F\u043E \u043A\u043E\u043D\u0442\u0443\u0440\u0443 \u0438 \u0438\u043C\u043F\u043E\u0441\u0442 \u043F\u043E \u0446\u0435\u043D\u0442\u0440\u0443
            float frame = 1.0 - (step(0.23, f.x) * step(f.x, 0.77) * step(0.27, f.y) * step(f.y, 0.75));
            float mullion = 1.0 - smoothstep(0.0, 0.035, abs(f.x - 0.5));
            float frameMask = clamp(frame + mullion * 0.65, 0.0, 1.0);

            float rnd = hash21(cell);
            float tintRnd = hash21(cell + 19.7);
            vec3 dayGlass = mix(vec3(0.14, 0.24, 0.35), uSkyColor * 0.92, 0.38 + f.y * 0.28);

            float onProb = vPowered > 0.5 ? 0.78 : 0.07;
            float windowLit = step(1.0 - onProb, rnd) * uNightFactor;
            vec3 warmLamp = mix(vec3(1.0, 0.81, 0.44), vec3(0.72, 0.91, 1.0), step(0.76, tintRnd));
            vec3 paneCol = mix(dayGlass, warmLamp * (vPowered > 0.5 ? 1.38 : 0.42), windowLit);
            litWall = mix(paneCol, vec3(0.16, 0.19, 0.23), frameMask * 0.75);
          }
        }

        float dist = length(cameraPosition - vWorldPos);
        float fogF = 1.0 - exp(-pow(dist * uFogDensity, 1.65));
        litWall = mix(litWall, uFogColor, clamp(fogF, 0.0, 0.84));

        gl_FragColor = vec4(litWall, 1.0);
      }
    `})}var pe=new ie,Be=new O,ze=new fi,Oe=new O,qi=new pi,Yi=new yt;function mg(){let s=new Oi(1.95,3.8,7);s.translate(0,3.5,0);let t=new Oi(1.42,3.3,7);t.translate(0,5.5,0);let e=s.attributes.position.array,i=s.attributes.normal.array,n=s.attributes.uv.array,r=s.index.array,o=t.attributes.position.array,a=t.attributes.normal.array,l=t.attributes.uv.array,c=t.index.array,h=e.length/3,d=new Float32Array(e.length+o.length);d.set(e,0),d.set(o,e.length);let u=new Float32Array(i.length+a.length);u.set(i,0),u.set(a,i.length);let f=new Float32Array(n.length+l.length);f.set(n,0),f.set(l,n.length);let g=new Uint16Array(r.length+c.length);g.set(r,0);for(let m=0;m<c.length;m++)g[r.length+m]=c[m]+h;let _=new _e;return _.setAttribute("position",new ee(d,3)),_.setAttribute("normal",new ee(u,3)),_.setAttribute("uv",new ee(f,2)),_.setIndex(new ee(g,1)),s.dispose(),t.dispose(),_}var Ca=class{constructor(t,e,i,n,r=null,o=null){if(this.scene=t,this.hydro=e,this.economy=i,this.profile=n,this.textures=o||Aa(r),this.detailTex=this.textures.waterDetail,this.hemiLight=new Xs(9356799,4017973,.74),this.scene.add(this.hemiLight),this.sunLight=new Ys(16774107,1.48),this.sunLight.position.set(220,310,170),n.shadows){this.sunLight.castShadow=!0,this.sunLight.shadow.mapSize.set(2048,2048),this.sunLight.shadow.camera.near=40,this.sunLight.shadow.camera.far=960;let a=395;this.sunLight.shadow.camera.left=-a,this.sunLight.shadow.camera.right=a,this.sunLight.shadow.camera.top=a,this.sunLight.shadow.camera.bottom=-a,this.sunLight.shadow.bias=-7e-4}this.scene.add(this.sunLight),this.skyColorZenith=new yt(2647213),this.skyColorHorizon=new yt(10931688),this.fogColor=new yt(10931688),this.scene.background=this.fogColor.clone(),this._buildTerrainMesh(),this._buildWaterMesh(),this._buildNatureInstances(),this.cityDisksGroup=new Ae,this.scene.add(this.cityDisksGroup),this._buildCityInstancedPools(),this._rebuildCityDisks(),this._buildVolumetricConstructionPools(),this.structuresGroup=new Ae,this.scene.add(this.structuresGroup),this.structMeshes=new Map,this._buildPowerLinePools(),this._buildCursorPreview(),this._buildIrrigationBeacon(),this._buildTutorialBeacon()}rebuildForNewValley(){let t=this.hydro.grid;this.updateTerrainGeometryRect(0,0,t-1,t-1),this._populateNatureInstances(),this._rebuildCityDisks();for(let[,e]of this.structMeshes.entries())this.structuresGroup.remove(e);if(this.structMeshes.clear(),this.irrBeacon){let e=this.hydro.sampleAtWorld(168,98).bed;this.irrBeacon.position.set(168,e+.38,98)}this.hydro.engineeredDirty=!0,this.economy.buildingsDirty=!0,this.economy.powerLinesDirty=!0,this.syncEngineeredVolumes(0),this.syncCityInstances(),this.syncHydroStructures()}_buildTerrainMesh(){let t=this.hydro.grid,e=t*t,i=this.hydro.dx,n=Qt.size*.5,r=new _e,o=new Float32Array(e*3),a=new Float32Array(e*3),l=new Float32Array(e*4);for(let g=0;g<t;g++){let _=-n+(g+.5)*i;for(let m=0;m<t;m++){let p=-n+(m+.5)*i,b=g*t+m,T=b*3;o[T]=p,o[T+1]=this.hydro.zb[b],o[T+2]=_,a[T+1]=1}}let c=new Uint32Array((t-1)*(t-1)*6),h=0;for(let g=0;g<t-1;g++)for(let _=0;_<t-1;_++){let m=g*t+_,p=m+1,b=m+t,T=b+1;c[h++]=m,c[h++]=b,c[h++]=p,c[h++]=p,c[h++]=b,c[h++]=T}r.setIndex(new ee(c,1)),this.terrainPosAttr=new ee(o,3),this.terrainPosAttr.setUsage(ti),this.terrainNormAttr=new ee(a,3),this.terrainNormAttr.setUsage(ti),this.terrainMetaAttr=new ee(l,4),this.terrainMetaAttr.setUsage(ti),r.setAttribute("position",this.terrainPosAttr),r.setAttribute("normal",this.terrainNormAttr),r.setAttribute("aTerrainMeta",this.terrainMetaAttr),this.terrainMat=wu(this.detailTex,this.textures.concreteMap),this.terrainMesh=new Ct(r,this.terrainMat),this.terrainMesh.receiveShadow=!!this.profile.shadows,this.terrainMesh.castShadow=!!this.profile.shadows,this.terrainMesh.matrixAutoUpdate=!1,this.terrainMesh.updateMatrix(),this.scene.add(this.terrainMesh);let d=new ve({color:2501684,map:this.textures.rock}),u=new Jt(Qt.size,32,Qt.size),f=new Ct(u,d);f.position.set(0,-15.6,0),f.matrixAutoUpdate=!1,f.updateMatrix(),this.scene.add(f),this.updateTerrainGeometryRect(0,0,t-1,t-1)}_buildWaterMesh(){let t=this.hydro.grid,e=t*t,i=this.hydro.dx,n=Qt.size*.5,r=new _e,o=new Float32Array(e*3),a=new Float32Array(e*3),l=new Float32Array(e*4),c=new Float32Array(e*4);for(let h=0;h<t;h++){let d=-n+(h+.5)*i;for(let u=0;u<t;u++){let f=-n+(u+.5)*i,g=h*t+u,_=g*3;o[_]=f,o[_+1]=this.hydro.zb[g]+this.hydro.h[g],o[_+2]=d,a[_+1]=1}}r.setIndex(this.terrainMesh.geometry.getIndex()),this.waterPosAttr=new ee(o,3),this.waterPosAttr.setUsage(ti),this.waterNormAttr=new ee(a,3),this.waterNormAttr.setUsage(ti),this.waterH1Attr=new ee(l,4),this.waterH1Attr.setUsage(ti),this.waterH2Attr=new ee(c,4),this.waterH2Attr.setUsage(ti),r.setAttribute("position",this.waterPosAttr),r.setAttribute("normal",this.waterNormAttr),r.setAttribute("aHydro1",this.waterH1Attr),r.setAttribute("aHydro2",this.waterH2Attr),this.waterMat=Eu(this.detailTex),this.waterMesh=new Ct(r,this.waterMat),this.waterMesh.renderOrder=2,this.waterMesh.matrixAutoUpdate=!1,this.waterMesh.updateMatrix(),this.scene.add(this.waterMesh)}_buildNatureInstances(){let t=this.profile.treeCount,e=this.profile.rockCount,i=new Xe(.2,.38,2.3,6);i.translate(0,1.15,0);let n=mg(),r=new ve({map:this.textures.bark}),o=new ve({color:16777215,map:this.textures.foliage});this.treeTrunks=new Qe(i,r,t),this.treeCrowns=new Qe(n,o,t),this.treeCrowns.castShadow=!!this.profile.shadows,this.treeTrunks.matrixAutoUpdate=!1,this.treeCrowns.matrixAutoUpdate=!1,this.scene.add(this.treeTrunks),this.scene.add(this.treeCrowns);let a=new ks(1.35,1),l=new ve({color:14211798,map:this.textures.rock});this.rockInstances=new Qe(a,l,e),this.rockInstances.castShadow=!!this.profile.shadows,this.rockInstances.matrixAutoUpdate=!1,this.scene.add(this.rockInstances),this._populateNatureInstances()}_populateNatureInstances(){let t=hr(424242),e=this.profile.treeCount,i=this.profile.rockCount;this.treeSlots=[];let n=0,r=0;for(;n<e&&r<e*8;){r++;let a=(t()-.5)*(Qt.size-28),l=(t()-.5)*(Qt.size-28),c=this.hydro.sampleAtWorld(a,l);if(c.depth>.02||c.bed>55||c.bed<7.2||c.soil<.72)continue;let h=!1;for(let u of this.economy.cities)if(Math.hypot(a-u.x,l-u.z)<u.plateauRadius*1.08){h=!0;break}if(h)continue;let d=.74+t()*.78;Be.set(a,c.bed-.15,l),qi.set(0,t()*Math.PI*2,0),ze.setFromEuler(qi),Oe.set(d,d*(.9+t()*.38),d),pe.compose(Be,ze,Oe),this.treeTrunks.setMatrixAt(n,pe),this.treeCrowns.setMatrixAt(n,pe),Yi.setHSL(.3+(t()-.5)*.06,.44+t()*.16,.36+t()*.14),this.treeCrowns.setColorAt(n,Yi),this.treeSlots.push({index:n,wx:a,wz:l,baseBed:c.bed,alive:!0}),n++}this.treeTrunks.count=n,this.treeCrowns.count=n,this.treeTrunks.instanceMatrix.needsUpdate=!0,this.treeCrowns.instanceMatrix.needsUpdate=!0,this.treeCrowns.instanceColor&&(this.treeCrowns.instanceColor.needsUpdate=!0),this.rockSlots=[];let o=0;for(let a=0;a<i*5&&o<i;a++){let l=(t()-.5)*(Qt.size-22),c=(t()-.5)*(Qt.size-22),h=this.hydro.sampleAtWorld(l,c);if(h.depth>.4)continue;let d=!1;for(let u of this.economy.cities)if(Math.hypot(l-u.x,c-u.z)<u.plateauRadius){d=!0;break}d||(Be.set(l,h.bed+.18,c),qi.set(t()*3,t()*3,t()*3),ze.setFromEuler(qi),Oe.set(.65+t()*1.5,.45+t()*.95,.65+t()*1.5),pe.compose(Be,ze,Oe),this.rockSlots.push({index:o,wx:l,wz:c,baseBed:h.bed,alive:!0}),this.rockInstances.setMatrixAt(o++,pe))}this.rockInstances.count=o,this.rockInstances.instanceMatrix.needsUpdate=!0}_buildCityInstancedPools(){let e=new Jt(1,1,1);e.translate(0,.5,0),this.cityPoweredArr=new Float32Array(420),this.cityPoweredAttr=new Dn(this.cityPoweredArr,1),this.cityPoweredAttr.setUsage(ti),e.setAttribute("aPowered",this.cityPoweredAttr);let i=new Oi(.76,.44,4);i.rotateY(Math.PI*.25),i.translate(0,.22,0),this.cityBodyMat=Tu(this.textures.roof);let n=new ve({color:16777215,map:this.textures.roof});this.cityBodies=new Qe(e,this.cityBodyMat,420),this.cityRoofs=new Qe(i,n,420),this.cityBodies.castShadow=!!this.profile.shadows,this.cityBodies.receiveShadow=!!this.profile.shadows,this.cityBodies.matrixAutoUpdate=!1,this.cityRoofs.matrixAutoUpdate=!1,this.scene.add(this.cityBodies),this.scene.add(this.cityRoofs)}_rebuildCityDisks(){for(;this.cityDisksGroup.children.length>0;)this.cityDisksGroup.remove(this.cityDisksGroup.children[0]);for(let t of this.economy.cities){let e=new pn(4.2,t.plateauRadius*.86,36);e.rotateX(-Math.PI*.5);let i=new ve({color:t.archetype==="agro"?7307075:6054764,map:this.textures.concreteMap,transparent:!0,opacity:.46}),n=new Ct(e,i),r=this.hydro.sampleAtWorld(t.x,t.z).bed;n.position.set(t.x,r+.09,t.z),n.matrixAutoUpdate=!1,n.updateMatrix(),this.cityDisksGroup.add(n)}}_buildVolumetricConstructionPools(){let t=new Gs({color:14541802,map:this.textures.concreteMap,bumpMap:this.textures.concreteBump,bumpScale:.35,shininess:14}),e=new ve({color:16777215,map:this.textures.rebarFormwork}),i=new Jt(1,1,1);i.translate(0,.5,0),this.damMonolithMesh=new Qe(i,t,2200),this.damMonolithMesh.count=0,this.damMonolithMesh.castShadow=!!this.profile.shadows,this.damMonolithMesh.receiveShadow=!!this.profile.shadows,this.damMonolithMesh.matrixAutoUpdate=!1,this.scene.add(this.damMonolithMesh);let n=new Jt(1.06,1,1.06);n.translate(0,.5,0),this.scaffoldingMesh=new Qe(n,e,1200),this.scaffoldingMesh.count=0,this.scaffoldingMesh.castShadow=!!this.profile.shadows,this.scaffoldingMesh.matrixAutoUpdate=!1,this.scene.add(this.scaffoldingMesh);let r=new Xe(.32,.92,1,4);r.rotateY(Math.PI*.25),r.translate(0,.5,.25),this.buttressMesh=new Qe(r,t,1400),this.buttressMesh.count=0,this.buttressMesh.castShadow=!!this.profile.shadows,this.buttressMesh.receiveShadow=!!this.profile.shadows,this.buttressMesh.matrixAutoUpdate=!1,this.scene.add(this.buttressMesh);let o=new Jt(1,1,1);o.translate(0,.5,0),this.canalCurbMesh=new Qe(o,t,1800),this.canalCurbMesh.count=0,this.canalCurbMesh.receiveShadow=!!this.profile.shadows,this.canalCurbMesh.matrixAutoUpdate=!1,this.scene.add(this.canalCurbMesh),this.cranes=[];for(let a=0;a<6;a++){let l=this._createTowerCraneMesh(a);l.visible=!1,this.scene.add(l),this.cranes.push(l)}}_createTowerCraneMesh(t){let e=new Ae,i=new ve({color:16096779,map:this.textures.steel}),n=new ve({color:3359061,map:this.textures.concreteMap}),r=new Ct(new Jt(4.2,1.2,4.2),n);r.position.y=.6,e.add(r);let o=new Ct(new Jt(1.35,19,1.35),i);o.position.y=10.1,o.castShadow=!!this.profile.shadows,e.add(o);let a=new Ae;a.position.y=19.6;let l=new Ct(new Jt(2.1,2.2,2.1),i);l.position.set(.6,.8,0);let c=new Ct(new Jt(21,.95,1.05),i);c.position.set(4.5,1.4,0),c.castShadow=!!this.profile.shadows;let h=new Ct(new Oi(.9,3.4,4),i);h.position.set(0,3.4,0);let d=new Ct(new Jt(3.4,1.8,2),n);d.position.set(-4.8,.9,0);let u=new Ae;u.position.set(10.5,1,0);let f=new Ct(new Xe(.08,.08,9.5,5),new Fe({color:13358561}));f.position.y=-4.75;let g=new Ct(new Xe(.95,.55,1.8,8),n);return g.position.y=-9.6,u.add(f,g),a.add(l,c,h,d,u),e.add(a),e.userData.slew=a,e.userData.hoist=u,e.userData.seed=t*1.7,e}syncEngineeredVolumes(){if(!this.hydro.engineeredDirty)return;this.hydro.engineeredDirty=!1;let t=this.hydro.grid,e=this.hydro.dx,i=Qt.size*.5,{bedrock:n,soil:r,concrete:o,targetConcrete:a,foundationMask:l,buttressYaw:c,linedMask:h,gateWall:d}=this.hydro,u=0,f=0,g=0,_=0,m=this.damMonolithMesh.instanceMatrix.count,p=this.scaffoldingMesh.instanceMatrix.count,b=this.buttressMesh.instanceMatrix.count,T=this.canalCurbMesh.instanceMatrix.count;for(let y=1;y<t-1;y++){let v=-i+(y+.5)*e,S=y*t;for(let A=1;A<t-1;A++){let x=S+A,E=o[x],R=a[x],I=l[x]===1,D=h[x]===1;if(E<.9&&R<.9&&!I&&!D)continue;let C=-i+(A+.5)*e,P=n[x]+r[x];if(E>=1.35&&d[x]<.05&&u<m&&(Be.set(C,P-.35,v),ze.identity(),Oe.set(e*.96,E+.52,e*.96),pe.compose(Be,ze,Oe),this.damMonolithMesh.setMatrixAt(u++,pe)),R>E+.08&&f<p){let N=P+E*.85,q=Math.max(1.2,R-E*.85+.65);Be.set(C,N,v),ze.identity(),Oe.set(e*1.02,q,e*1.02),pe.compose(Be,ze,Oe),this.scaffoldingMesh.setMatrixAt(f++,pe)}if(I&&g<b){let N=Math.max(2.6,Math.max(E,R)*.92+1.4);Be.set(C,P-.6,v),qi.set(0,-c[x]+Math.PI*.5,0),ze.setFromEuler(qi),Oe.set(e*.88,N,e*1.38),pe.compose(Be,ze,Oe),this.buttressMesh.setMatrixAt(g++,pe)}D&&E<1.1&&R<1.1&&_<T&&(!h[x-1]||!h[x+1]||!h[x-t]||!h[x+t])&&(Be.set(C,P-.15,v),ze.identity(),Oe.set(e*.92,.72,e*.92),pe.compose(Be,ze,Oe),this.canalCurbMesh.setMatrixAt(_++,pe))}}this.damMonolithMesh.count=u,this.scaffoldingMesh.count=f,this.buttressMesh.count=g,this.canalCurbMesh.count=_,this.damMonolithMesh.instanceMatrix.needsUpdate=!0,this.scaffoldingMesh.instanceMatrix.needsUpdate=!0,this.buttressMesh.instanceMatrix.needsUpdate=!0,this.canalCurbMesh.instanceMatrix.needsUpdate=!0}animateConstructionCranes(t){let e=this.hydro.activeBuildSites;for(let i=0;i<this.cranes.length;i++){let n=this.cranes[i];if(i<e.length){let r=e[i];n.visible=!0,n.position.set(r.wx+5.5,r.wy-.5,r.wz-4.5);let o=t*.85+n.userData.seed;n.userData.slew.rotation.y=Math.sin(o)*1.15,n.userData.hoist.position.x=8.5+Math.cos(o*1.4)*5.2}else n.visible=!1}}_buildPowerLinePools(){let e=new Xe(.22,1.05,12.8,4);e.translate(0,6.4,0);let i=new ve({color:11187906,map:this.textures.steel});this.pylonMesh=new Qe(e,i,260),this.pylonMesh.count=0,this.pylonMesh.matrixAutoUpdate=!1,this.scene.add(this.pylonMesh);let n=new Jt(4.6,.28,.35);n.translate(0,11.4,0),this.pylonArmMesh=new Qe(n,i,260),this.pylonArmMesh.count=0,this.pylonArmMesh.matrixAutoUpdate=!1,this.scene.add(this.pylonArmMesh);let r=new _e;this.wirePositions=new Float32Array(260*24),this.wireAttr=new ee(this.wirePositions,3),r.setAttribute("position",this.wireAttr),this.wireMat=new dn({color:16769154,transparent:!0,opacity:.88}),this.wireLines=new Nn(r,this.wireMat),this.wireLines.frustumCulled=!1,this.scene.add(this.wireLines)}_buildCursorPreview(){this.cursorGroup=new Ae,this.cursorGroup.visible=!1;let t=new pn(.88,1,36);t.rotateX(-Math.PI*.5),this.cursorRingMat=new Fe({color:3718648,side:qe,transparent:!0,opacity:.85,depthTest:!1}),this.cursorRing=new Ct(t,this.cursorRingMat),this.cursorGroup.add(this.cursorRing);let e=new Xe(.82,1,1,20,1,!0);e.translate(0,.5,0),this.ghostVolumeMat=new Fe({color:16498468,transparent:!0,opacity:.24,side:qe,depthWrite:!1}),this.ghostVolume=new Ct(e,this.ghostVolumeMat),this.ghostVolume.visible=!1,this.cursorGroup.add(this.ghostVolume),this.flowArrow=new Ae;let i=new Ct(new Jt(15,.85,1.7),new Fe({color:2282478,transparent:!0,opacity:.82})),n=new Ct(new Oi(2.9,5.8,12),new Fe({color:3462041,transparent:!0,opacity:.92}));n.rotation.z=-Math.PI*.5,n.position.x=9.5;let r=new Ct(new Un(2.2,12,12),new Fe({color:3900150,transparent:!0,opacity:.86}));r.position.x=-9.5,this.flowArrow.add(i,n,r),this.flowArrow.visible=!1,this.cursorGroup.add(this.flowArrow),this.scene.add(this.cursorGroup)}_buildIrrigationBeacon(){let t=new pn(10.5,12.6,32);t.rotateX(-Math.PI*.5),this.irrRingMat=new Fe({color:3462041,side:qe,transparent:!0,opacity:.58});let e=this.hydro.sampleAtWorld(168,98).bed;this.irrBeacon=new Ct(t,this.irrRingMat),this.irrBeacon.position.set(168,e+.38,98),this.scene.add(this.irrBeacon)}_buildTutorialBeacon(){this.tutorialBeacon=new Ae,this.tutorialBeacon.visible=!1;let t=new Ct(new pn(9,11.4,36),new Fe({color:2282478,side:qe,transparent:!0,opacity:.82}));t.rotateX(-Math.PI*.5);let e=new Ct(new Xe(1.4,4.5,36,16,1,!0),new Fe({color:3718648,side:qe,transparent:!0,opacity:.22,depthWrite:!1}));e.position.y=18;let i=new Ct(new Oi(3.4,6.8,6),new Fe({color:16638023}));i.rotation.x=Math.PI,i.position.y=22,this.tutorialBeacon.add(t,e,i),this.tutorialBeacon.userData.pointer=i,this.scene.add(this.tutorialBeacon)}setTutorialTarget(t,e,i=!0){if(!this.tutorialBeacon||(this.tutorialBeacon.visible=i,!i))return;let n=this.hydro.sampleAtWorld(t,e);this.tutorialBeacon.position.set(t,Math.max(n.bed,n.surface)+.45,e)}updateTerrainGeometryRect(t,e,i,n){let r=this.hydro.grid,o=this.hydro.dx,a=this.terrainPosAttr.array,l=this.terrainNormAttr.array,c=this.terrainMetaAttr.array,{zb:h,soil:d,concrete:u,formworkWall:f,wetness:g,h:_,linedMask:m}=this.hydro;for(let S=e;S<=n;S++){let A=S*r;for(let x=t;x<=i;x++){let E=A+x;a[E*3+1]=h[E];let R=E*4;c[R]=d[E],c[R+1]=Math.max(u[E],f[E]*.5)+(m[E]?.5:0),c[R+2]=g[E],c[R+3]=_[E]}}let p=J(t-1,0,r-1),b=J(e-1,0,r-1),T=J(i+1,0,r-1),y=J(n+1,0,r-1),v=2*o;for(let S=b;S<=y;S++){let A=Math.max(0,S-1)*r,x=Math.min(r-1,S+1)*r,E=S*r;for(let R=p;R<=T;R++){let I=Math.max(0,R-1),D=Math.min(r-1,R+1),C=(h[E+D]-h[E+I])/v,P=(h[x+R]-h[A+R])/v,N=Math.hypot(C,1,P),q=(E+R)*3;l[q]=-C/N,l[q+1]=1/N,l[q+2]=-P/N}}if(this.terrainPosAttr.needsUpdate=!0,this.terrainNormAttr.needsUpdate=!0,this.terrainMetaAttr.needsUpdate=!0,this.treeSlots&&i-t<r-2){let S=Qt.size*.5,A=-S+t*o-2,x=-S+(i+1)*o+2,E=-S+e*o-2,R=-S+(n+1)*o+2,I=!1;for(let D=0;D<this.treeSlots.length;D++){let C=this.treeSlots[D];if(C.alive&&C.wx>=A&&C.wx<=x&&C.wz>=E&&C.wz<=R){let P=this.hydro.sampleAtWorld(C.wx,C.wz);(Math.abs(P.bed-C.baseBed)>.35||P.concrete>.1||P.targetConcrete>.1||P.lined)&&(C.alive=!1,pe.makeScale(0,0,0),this.treeTrunks.setMatrixAt(C.index,pe),this.treeCrowns.setMatrixAt(C.index,pe),I=!0)}}if(I&&(this.treeTrunks.instanceMatrix.needsUpdate=!0,this.treeCrowns.instanceMatrix.needsUpdate=!0),this.rockSlots){let D=!1;for(let C=0;C<this.rockSlots.length;C++){let P=this.rockSlots[C];if(P.alive&&P.wx>=A&&P.wx<=x&&P.wz>=E&&P.wz<=R){let N=this.hydro.sampleAtWorld(P.wx,P.wz);(Math.abs(N.bed-P.baseBed)>.3||N.concrete>.1||N.targetConcrete>.1||N.lined)&&(P.alive=!1,pe.makeScale(0,0,0),this.rockInstances.setMatrixAt(P.index,pe),D=!0)}}D&&(this.rockInstances.instanceMatrix.needsUpdate=!0)}}}updateWaterAndWetness(t){let e=this.hydro.grid,i=2*this.hydro.dx,{zb:n,h:r,u:o,v:a,foam:l,sediment:c,vort:h,wetness:d,soil:u,concrete:f,formworkWall:g,linedMask:_}=this.hydro,m=this.waterPosAttr.array,p=this.waterNormAttr.array,b=this.waterH1Attr.array,T=this.waterH2Attr.array,y=this.terrainMetaAttr.array;for(let v=0;v<e;v++){let S=v*e;for(let A=0;A<e;A++){let x=S+A,E=r[x],R=x*3,I=x*4;if(y[I]=u[x],y[I+1]=Math.max(f[x],g[x]*.5)+(_[x]?.5:0),y[I+2]=d[x],y[I+3]=E,E>.014)m[R+1]=n[x]+E,b[I]=E,b[I+1]=o[x],b[I+2]=a[x],b[I+3]=l[x],T[I]=c[x],T[I+1]=h[x],T[I+2]=f[x]>.05||_[x]?1:0,T[I+3]=1;else{let D=0,C=0;if(A>0&&r[x-1]>.014&&(D+=n[x-1]+r[x-1],C++),A<e-1&&r[x+1]>.014&&(D+=n[x+1]+r[x+1],C++),v>0&&r[x-e]>.014&&(D+=n[x-e]+r[x-e],C++),v<e-1&&r[x+e]>.014&&(D+=n[x+e]+r[x+e],C++),C>0){let P=D/C;m[R+1]=Math.min(n[x]+.025,P),b[I]=0,b[I+1]=0,b[I+2]=0,b[I+3]=0,T[I+3]=1}else m[R+1]=n[x]-.55,b[I]=0,T[I+3]=0}}}for(let v=0;v<this.hydro.activeTileCount;v++){let S=this.hydro.activeTiles[v],A=Math.max(1,S%this.hydro.tilesN*8),x=Math.max(1,Math.floor(S/this.hydro.tilesN)*8),E=Math.min(e-2,A+8),R=Math.min(e-2,x+8);for(let I=x;I<=R;I++){let D=I*e;for(let C=A;C<=E;C++){let P=D+C;if(r[P]<=.014)continue;let N=m[(P-1)*3+1],q=m[(P+1)*3+1],W=m[(P-e)*3+1],tt=m[(P+e)*3+1],k=J((q-N)/i,-.65,.65),X=J((tt-W)/i,-.65,.65),H=Math.hypot(k,1,X),rt=P*3;p[rt]=-k/H,p[rt+1]=1/H,p[rt+2]=-X/H}}}this.waterPosAttr.needsUpdate=!0,this.waterNormAttr.needsUpdate=!0,this.waterH1Attr.needsUpdate=!0,this.waterH2Attr.needsUpdate=!0,this.terrainMetaAttr.needsUpdate=!0,this.waterMat.uniforms.uTime.value=t,this.terrainMat.uniforms.uTime.value=t}syncCityInstances(){let t=this.economy.allBuildings,e=new Map;for(let n of this.economy.cities)e.set(n.id,n);let i=Math.min(t.length,this.cityBodies.instanceMatrix.count);for(let n=0;n<i;n++){let r=t[n],o=e.get(r.cityId),a=o&&o.connected&&o.powerRatio>=.45,l=r.sy*Math.max(.08,r.anim);Be.set(r.wx,r.wy-.25,r.wz),qi.set(0,r.yaw,0),ze.setFromEuler(qi),Oe.set(r.sx,l,r.sz),pe.compose(Be,ze,Oe),this.cityBodies.setMatrixAt(n,pe),this.cityPoweredArr[n]=a?1:0,r.kind==="skyscraper"?Yi.setHSL(.56+r.tint*.06,.3,.58):r.kind==="factory"?Yi.setHex(9732724):r.kind==="greenhouse"?Yi.setHex(11004093):r.kind==="apartment"?Yi.setHSL(.08+r.tint*.08,.24,.74):Yi.setHSL(.09+r.tint*.05,.36,.68),this.cityBodies.setColorAt(n,Yi),r.kind==="cottage"||r.kind==="townhouse"?(Be.set(r.wx,r.wy-.25+l,r.wz),Oe.set(r.sx*1.08,1.9+r.sy*.18,r.sz*1.08),pe.compose(Be,ze,Oe),Yi.setHex(r.kind==="cottage"?11815992:8016452)):pe.makeScale(0,0,0),this.cityRoofs.setMatrixAt(n,pe),this.cityRoofs.setColorAt(n,Yi)}this.cityBodies.count=i,this.cityRoofs.count=i,this.cityBodies.instanceMatrix.needsUpdate=!0,this.cityRoofs.instanceMatrix.needsUpdate=!0,this.cityPoweredAttr.needsUpdate=!0,this.cityBodies.instanceColor&&(this.cityBodies.instanceColor.needsUpdate=!0),this.cityRoofs.instanceColor&&(this.cityRoofs.instanceColor.needsUpdate=!0)}syncHydroStructures(){let t=new Set;for(let e of this.hydro.turbines){t.add(`t_${e.id}`);let i=this.structMeshes.get(`t_${e.id}`);i||(i=this._createTurbinePowerhouseMesh(e),this.structMeshes.set(`t_${e.id}`,i),this.structuresGroup.add(i),this.economy.powerLinesDirty=!0);let n=i.userData.rotor;n&&(n.rotation.y=e.rotorPhase);let r=i.userData.statusLamp;r&&r.material.color.setHex(e.powerMW>.1?3462041:16096779)}for(let e of this.hydro.spillways){t.add(`s_${e.id}`);let i=this.structMeshes.get(`s_${e.id}`);i||(i=this._createSpillwayMesh(e),this.structMeshes.set(`s_${e.id}`,i),this.structuresGroup.add(i));let n=i.userData.gateLeaf;n&&(n.position.y=e.sillElev+e.wallHeight*.5+e.openRatio*(e.wallHeight*.78))}for(let e of this.hydro.substations){t.add(`u_${e.id}`);let i=this.structMeshes.get(`u_${e.id}`);i||(i=this._createSubstationMesh(e),this.structMeshes.set(`u_${e.id}`,i),this.structuresGroup.add(i),this.economy.powerLinesDirty=!0)}for(let[e,i]of this.structMeshes.entries())t.has(e)||(this.structuresGroup.remove(i),this.structMeshes.delete(e),this.economy.powerLinesDirty=!0);this.economy.powerLinesDirty&&(this._rebuildPowerLines(),this.economy.powerLinesDirty=!1)}_createTurbinePowerhouseMesh(t){let e=new Ae;e.position.set(t.wx,0,t.wz),e.rotation.y=-t.yaw;let i=new ve({color:14870768,map:this.textures.concreteMap}),n=new ve({color:13358561,map:this.textures.steel}),r=new ve({color:t.spec.color,map:this.textures.steel}),o=t.crestY,a=Math.max(6,o-t.baseY+2),l=new Ct(new Jt(10.6,a,10.2),i);l.position.set(0,o-a*.5+.5,0),l.castShadow=!!this.profile.shadows;let c=new Ct(new Jt(10.2,6.8,9.6),i);c.position.set(0,o+3.4,0),c.castShadow=!!this.profile.shadows;let h=new Ct(new Jt(10.8,1,10.2),r);h.position.set(0,o+7.1,0);let d=new Ct(new Jt(.55,3.6,8.8),n);d.position.set(-3.6,o+9.2,0);let u=d.clone();u.position.x=3.6;let f=new Ct(new Jt(8.2,.75,1.2),r);f.position.set(0,o+10.8,0);let g=new Ae;g.position.set(0,o+8.1,0);let _=new Ct(new Xe(1.45,1.45,1.3,12),n),m=new Ct(new Jt(5.6,.38,.95),r),p=m.clone();p.rotation.y=Math.PI*.5,g.add(_,m,p);let b=Math.hypot(t.intakeWx-t.wx,t.intakeWz-t.wz),T=Math.max(7.5,o-t.intakeBedY+2.5),y=new Ct(new Jt(4.6,T,6.8),i);y.position.set(-b+2.2,t.intakeBedY+T*.5,0);let v=new Ct(new Jt(.5,T*.72,5.4),new ve({color:3359061,map:this.textures.steel}));v.position.set(-b-.1,t.intakeBedY+T*.42,0);let S=new O(-b+2.5,Math.max(t.intakeBedY+2.2,o-2.6),0),A=new O(-3.2,Math.max(t.outfallBedY+2,o-5.5),0),x=new O().subVectors(A,S),E=Math.max(2,x.length()),R=t.type==="francis"?1.55:t.type==="pelton"?1.25:1.7,I=new Ct(new Xe(R,R,E,14),n);I.position.copy(S).addScaledVector(x,.5),I.quaternion.setFromUnitVectors(new O(0,1,0),x.clone().normalize()),I.castShadow=!!this.profile.shadows;let D=new Ct(new Jt(4.2,4.4,7.6),i);D.position.set(5.8,t.outfallBedY+2.2,0);let C=new Ct(new Jt(2.9,3.1,2.7),n);C.position.set(-2.2,o+1.55,5.8);let P=new Ct(new Un(.7,8,8),new Fe({color:16096779}));return P.position.set(3.6,o+8.2,0),e.add(l,c,h,d,u,f,g,y,v,I,D,C,P),e.userData.rotor=g,e.userData.statusLamp=P,e}_createSpillwayMesh(t){let e=new Ae;e.position.set(t.wx,0,t.wz),e.rotation.y=-t.yaw;let i=new ve({color:13358561,map:this.textures.concreteMap}),n=new ve({color:14251782,map:this.textures.steel}),r=new Ct(new Jt(9.6,t.wallHeight+5.2,1.7),i);r.position.set(0,t.sillElev+(t.wallHeight+5.2)*.5-1,-4.5),r.castShadow=!!this.profile.shadows;let o=r.clone();o.position.z=4.5;let a=new Ct(new Jt(2.8,1.4,11),i);a.position.set(0,t.sillElev+t.wallHeight+4.2,0);let l=new Ct(new Jt(1.25,t.wallHeight,7.6),n);l.position.set(0,t.sillElev+t.wallHeight*.5,0);let c=new Ct(new Jt(5.2,1.6,7.8),i);return c.rotation.z=.25,c.position.set(5,t.sillElev+.45,0),e.add(r,o,a,l,c),e.userData.gateLeaf=l,e}_createSubstationMesh(t){let e=new Ae;e.position.set(t.wx,t.wy,t.wz);let i=new ve({color:13358561,map:this.textures.concreteMap}),n=new ve({color:9741240,map:this.textures.steel}),r=new ve({color:3718648}),o=new Ct(new Jt(16.5,1,14.5),i);o.position.y=-.3,e.add(o);for(let l of[-3.6,3.6]){let c=new Ct(new Jt(3.8,3.8,4.6),n);c.position.set(l,2,0),c.castShadow=!!this.profile.shadows,e.add(c);for(let h of[-1.2,0,1.2]){let d=new Ct(new Xe(.18,.26,2.1,6),r);d.position.set(l,4.8,h),e.add(d)}}for(let l of[-5.2,5.2]){let c=new Ct(new Xe(.22,.42,11.5,4),n);c.position.set(-5.8,5.75,l);let h=c.clone();h.position.x=5.8;let d=new Ct(new Jt(12.8,.45,.45),n);d.position.set(0,11.2,l),e.add(c,h,d)}let a=new Ct(new Un(.65,8,8),new Fe({color:3718648}));return a.position.set(0,12.2,5.2),e.add(a),e}_rebuildPowerLines(){let t=this.hydro.substations.length>0?{x:this.hydro.substations[0].wx,z:this.hydro.substations[0].wz}:this.hydro.turbines.length>0?{x:this.hydro.turbines[0].wx,z:this.hydro.turbines[0].wz}:{x:12,z:-152},e=0,i=0,n=this.pylonMesh.instanceMatrix.count,r=[];for(let o of this.hydro.substations)for(let a of this.hydro.turbines)Math.hypot(a.wx-o.wx,a.wz-o.wz)<160&&r.push({x0:a.wx,z0:a.wz,x1:o.wx,z1:o.wz});for(let o of this.economy.cities){if(!o.connected)continue;let a=t,l=Math.hypot(o.x-a.x,o.z-a.z);for(let c of this.hydro.substations){let h=Math.hypot(o.x-c.wx,o.z-c.wz);h<l&&(l=h,a={x:c.wx,z:c.wz})}for(let c of this.hydro.turbines){let h=Math.hypot(o.x-c.wx,o.z-c.wz);h<l&&(l=h,a={x:c.wx,z:c.wz})}r.push({x0:a.x,z0:a.z,x1:o.x,z1:o.z})}for(let o of r){let a=Math.hypot(o.x1-o.x0,o.z1-o.z0),l=J(Math.ceil(a/46),2,14),c=Math.atan2(o.x1-o.x0,o.z1-o.z0),h=null;for(let d=0;d<=l&&!(e>=n);d++){let u=d/l,f=o.x0+(o.x1-o.x0)*u,g=o.z0+(o.z1-o.z0)*u,_=this.hydro.sampleAtWorld(f,g).bed;Be.set(f,_,g),qi.set(0,c,0),ze.setFromEuler(qi),Oe.set(1,1,1),pe.compose(Be,ze,Oe),this.pylonMesh.setMatrixAt(e,pe),this.pylonArmMesh.setMatrixAt(e,pe),e++;let m=_+12.1;if(h&&i+12<=this.wirePositions.length){let p=(h.x+f)*.5,b=(h.z+g)*.5,T=(h.y+m)*.5-1.85;this.wirePositions[i++]=h.x,this.wirePositions[i++]=h.y,this.wirePositions[i++]=h.z,this.wirePositions[i++]=p,this.wirePositions[i++]=T,this.wirePositions[i++]=b,this.wirePositions[i++]=p,this.wirePositions[i++]=T,this.wirePositions[i++]=b,this.wirePositions[i++]=f,this.wirePositions[i++]=m,this.wirePositions[i++]=g}h={x:f,y:m,z:g}}}for(let o=i;o<this.wirePositions.length;o++)this.wirePositions[o]=0;this.pylonMesh.count=e,this.pylonArmMesh.count=e,this.pylonMesh.instanceMatrix.needsUpdate=!0,this.pylonArmMesh.instanceMatrix.needsUpdate=!0,this.wireAttr.needsUpdate=!0}updateAtmosphere(t,e){let i=(t-6)/24*Math.PI*2,n=Math.sin(i),r=Math.cos(i),o=new O(r*.78,Math.max(-.35,n),.48).normalize(),a=J((n+.16)/.65,0,1),l=Math.exp(-Math.pow((n-.08)/.18,2)),c=new yt(594982),h=new yt(2450347),d=new yt(1254978),u=new yt(10406632),f=new yt(15900519);this.skyColorZenith.copy(c).lerp(h,a),this.skyColorHorizon.copy(d).lerp(u,a).lerp(f,l*.62),this.fogColor.copy(this.skyColorHorizon);let g=new yt(3889292).lerp(new yt(16774626),a).lerp(new yt(16755038),l*.75);this.sunLight.position.copy(o).multiplyScalar(420),this.sunLight.color.copy(g),this.sunLight.intensity=(.18+1.34*a)*e.sunIntensity,this.hemiLight.intensity=.26+.56*a,this.scene.background.copy(this.fogColor);let _=n>-.05?o:new O(-o.x,.35,-o.z).normalize();this.terrainMat.uniforms.uSunDir.value.copy(_),this.terrainMat.uniforms.uSunColor.value.copy(g).multiplyScalar(.32+.78*a),this.terrainMat.uniforms.uSkyColor.value.copy(this.skyColorZenith).lerp(new yt(16777215),.35),this.terrainMat.uniforms.uFogColor.value.copy(this.fogColor),this.terrainMat.uniforms.uFogDensity.value=e.fogDensity,this.waterMat.uniforms.uSunDir.value.copy(_),this.waterMat.uniforms.uSunColor.value.copy(g).multiplyScalar(a),this.waterMat.uniforms.uSkyZenith.value.copy(this.skyColorZenith),this.waterMat.uniforms.uSkyHorizon.value.copy(this.skyColorHorizon),this.waterMat.uniforms.uFogColor.value.copy(this.fogColor),this.waterMat.uniforms.uFogDensity.value=e.fogDensity,this.cityBodyMat&&(this.cityBodyMat.uniforms.uSunDir.value.copy(_),this.cityBodyMat.uniforms.uSunColor.value.copy(g).multiplyScalar(.28+.82*a),this.cityBodyMat.uniforms.uSkyColor.value.copy(this.skyColorZenith).lerp(new yt(16777215),.35),this.cityBodyMat.uniforms.uNightFactor.value=J(1-(n+.05)/.28,0,1),this.cityBodyMat.uniforms.uFogColor.value.copy(this.fogColor),this.cityBodyMat.uniforms.uFogDensity.value=e.fogDensity);let m=performance.now();if(this.irrBeacon&&(this.irrBeacon.visible=!this.economy.agroIrrigated,this.irrBeacon.visible)){let p=1+Math.sin(m*.004)*.08;this.irrBeacon.scale.set(p,1,p)}if(this.tutorialBeacon&&this.tutorialBeacon.visible){let p=1+Math.sin(m*.0055)*.1;this.tutorialBeacon.scale.set(p,1,p),this.tutorialBeacon.userData.pointer.position.y=21+Math.sin(m*.006)*2.8,this.tutorialBeacon.userData.pointer.rotation.y=m*.0022}return{isNight:n<.06,dayFactor:a}}updateCursor(t,e,i,n,r,o=6.2,a=!0){if(this.cursorGroup.visible=a,!a)return;let l=this.hydro.sampleAtWorld(t,e),c=Math.max(l.bed,l.surface)+.35;this.cursorGroup.position.set(t,c,e),this.cursorRing.scale.set(i,i,1);let h=n==="spillway"||n.startsWith("turbine_");this.flowArrow.visible=h;let d=n==="concrete_dam"||n==="earth_dam"||n==="foundation";if(this.ghostVolume.visible=d,d){let u=n==="concrete_dam"?o:n==="earth_dam"?4.2:6;this.ghostVolume.scale.set(i,u,i),this.ghostVolumeMat.color.setHex(n==="foundation"?16096779:16498468)}if(h){let{gx:u,gz:f}=this.hydro.worldToGrid(t,e),g=this.hydro.detectHydraulicDirection(u,f,r);this.flowArrow.rotation.y=-g.yaw,this.cursorRingMat.color.setHex(3462041)}else n==="canal_dig"?this.cursorRingMat.color.setHex(3718648):n==="concrete_dam"||n==="earth_dam"||n==="foundation"?this.cursorRingMat.color.setHex(16498468):n==="demolish"?this.cursorRingMat.color.setHex(15680580):this.cursorRingMat.color.setHex(10980346)}};var Ra=class{constructor(t,e=2400){this.max=e,this.head=0,this.positions=new Float32Array(this.max*3),this.velocities=new Float32Array(this.max*3),this.life=new Float32Array(this.max),this.maxLife=new Float32Array(this.max),this.sizes=new Float32Array(this.max),this.kinds=new Uint8Array(this.max);let i=new _e;this.posAttr=new ee(this.positions,3),this.posAttr.setUsage(ti),this.sizeAttr=new ee(this.sizes,1),this.sizeAttr.setUsage(ti),this.alphaAttr=new ee(new Float32Array(this.max),1),this.alphaAttr.setUsage(ti),i.setAttribute("position",this.posAttr),i.setAttribute("aSize",this.sizeAttr),i.setAttribute("aAlpha",this.alphaAttr);let n=new Re({transparent:!0,depthWrite:!1,blending:_n,uniforms:{uLight:{value:1},uPixelRatio:{value:Math.min(window.devicePixelRatio||1,2)}},vertexShader:`
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
      `});this.points=new Bs(i,n),this.points.frustumCulled=!1,this.points.matrixAutoUpdate=!1,t.add(this.points);let r=360;this.rainCount=r;let o=new Float32Array(r*6);this.rainSeeds=new Float32Array(r*3);for(let l=0;l<r;l++)this.rainSeeds[l*3]=(Math.random()-.5)*180,this.rainSeeds[l*3+1]=Math.random()*70,this.rainSeeds[l*3+2]=(Math.random()-.5)*180;let a=new _e;this.rainAttr=new ee(o,3),this.rainAttr.setUsage(ti),a.setAttribute("position",this.rainAttr),this.rainMat=new dn({color:13624575,transparent:!0,opacity:.35,depthWrite:!1}),this.rainLines=new Nn(a,this.rainMat),this.rainLines.visible=!1,this.rainLines.frustumCulled=!1,t.add(this.rainLines)}spawn(t,e,i,n,r,o,a,l,c=1){let h=this.head;this.head=(this.head+1)%this.max;let d=h*3;this.positions[d]=t,this.positions[d+1]=e,this.positions[d+2]=i,this.velocities[d]=n,this.velocities[d+1]=r,this.velocities[d+2]=o,this.life[h]=l,this.maxLife[h]=l,this.sizes[h]=a,this.kinds[h]=c}spawnDigSplash(t,e,i,n=12){for(let r=0;r<n;r++){let o=Math.random()*Math.PI*2,a=1.5+Math.random()*4;this.spawn(t+(Math.random()-.5)*3,e+.5,i+(Math.random()-.5)*3,Math.cos(o)*a,2.5+Math.random()*4.5,Math.sin(o)*a,1.1+Math.random()*.8,.55+Math.random()*.35,1)}}update(t,e,i,n=1,r=0){this.points.material.uniforms.uLight.value=n;let o=e.jetEmitters;for(let c=0;c<o.length;c++){let h=o[c],d=h.kind==="spillway"?Math.ceil(5*h.intensity):Math.ceil(3*h.intensity);for(let u=0;u<d;u++){let f=h.kind==="spillway"?2.4:3.2;this.spawn(h.wx+(Math.random()-.5)*f,h.wy+Math.random()*.6,h.wz+(Math.random()-.5)*f,h.vx*(.85+Math.random()*.3)+(Math.random()-.5)*1.4,h.vy+(Math.random()-.3)*1.6,h.vz*(.85+Math.random()*.3)+(Math.random()-.5)*1.4,h.kind==="spillway"?1.6+Math.random()*1.5:1.3+Math.random()*1.1,.95+Math.random()*.55,1)}Math.random()<.65&&this.spawn(h.wx+h.vx*.5+(Math.random()-.5)*5,h.wy-.5,h.wz+h.vz*.5+(Math.random()-.5)*5,(Math.random()-.5)*1.2,1.4+Math.random()*1.8,(Math.random()-.5)*1.2,3.4+Math.random()*2.6,1.5+Math.random()*.9,2)}let a=this.alphaAttr.array,l=!1;for(let c=0;c<this.max;c++){let h=this.kinds[c];if(h===0){a[c]=0;continue}if(this.life[c]-=t,this.life[c]<=0){this.kinds[c]=0,a[c]=0;continue}l=!0;let d=c*3;h===1?(this.velocities[d]*=1-t*.35,this.velocities[d+1]-=Qt.gravity*t*.92,this.velocities[d+2]*=1-t*.35):(this.velocities[d]*=1-t*1.2,this.velocities[d+1]=Math.max(.3,this.velocities[d+1]-t*.9),this.velocities[d+2]*=1-t*1.2,this.sizes[c]+=t*1.4);let u=this.positions[d]+this.velocities[d]*t,f=this.positions[d+1]+this.velocities[d+1]*t,g=this.positions[d+2]+this.velocities[d+2]*t;if(this.positions[d]=u,this.positions[d+1]=f,this.positions[d+2]=g,h===1&&Math.abs(u)<Qt.size*.49&&Math.abs(g)<Qt.size*.49){let m=e.worldToGrid(u,g),p=m.gz*e.grid+m.gx,b=e.zb[p]+e.h[p];if(f<=b){e.foam[p]=Math.min(1,e.foam[p]+.35),this.kinds[c]=0,a[c]=0;continue}}let _=this.life[c]/(this.maxLife[c]||1);a[c]=h===1?Math.min(.78,_*1.2):Math.sin(_*Math.PI)*.24}if((l||o.length>0)&&(this.posAttr.needsUpdate=!0,this.sizeAttr.needsUpdate=!0,this.alphaAttr.needsUpdate=!0),r>.05){this.rainLines.visible=!0,this.rainMat.opacity=Math.min(.45,r*.35);let c=this.rainAttr.array,h=performance.now()*.065%70;for(let d=0;d<this.rainCount;d++){let u=d*3,f=i.x+this.rainSeeds[u],g=this.rainSeeds[u+1]-h;g<0&&(g+=70),g+=i.y*.3+6;let _=i.z+this.rainSeeds[u+2],m=d*6;c[m]=f,c[m+1]=g,c[m+2]=_,c[m+3]=f+.6,c[m+4]=g-3.6,c[m+5]=_+.4}this.rainAttr.needsUpdate=!0}else this.rainLines.visible=!1}};var Pa=class{constructor(t,e){this.camera=t,this.dom=e,this.target=new O(14,24,-64),this.goalTarget=this.target.clone(),this.yaw=-.54,this.pitch=.67,this.distance=248,this.goalYaw=this.yaw,this.goalPitch=this.pitch,this.goalDist=this.distance,this.keys=new Set,this.isOrbiting=!1,this.isPanning=!1,this.lastX=0,this.lastY=0,this.userMoved=!1,this.touches=new Map,this.prevPinchDist=0,this._bindEvents(),this.update(.016,22)}_bindEvents(){window.addEventListener("keydown",e=>{e.target&&(e.target.tagName==="INPUT"||e.target.tagName==="SELECT")||this.keys.add(e.code)}),window.addEventListener("keyup",e=>{this.keys.delete(e.code)}),window.addEventListener("blur",()=>this.keys.clear()),this.dom.addEventListener("contextmenu",e=>e.preventDefault()),this.dom.addEventListener("mousedown",e=>{e.button===2?(this.isOrbiting=!0,this.lastX=e.clientX,this.lastY=e.clientY):e.button===1&&(this.isPanning=!0,this.lastX=e.clientX,this.lastY=e.clientY)}),window.addEventListener("mousemove",e=>{if(this.isOrbiting){let i=e.clientX-this.lastX,n=e.clientY-this.lastY;this.lastX=e.clientX,this.lastY=e.clientY,this.goalYaw-=i*.0055,this.goalPitch=J(this.goalPitch+n*.0048,.16,1.38),this.userMoved=!0}else if(this.isPanning){let i=e.clientX-this.lastX,n=e.clientY-this.lastY;this.lastX=e.clientX,this.lastY=e.clientY,this._panByPixels(i,n),this.userMoved=!0}}),window.addEventListener("mouseup",e=>{e.button===2&&(this.isOrbiting=!1),e.button===1&&(this.isPanning=!1)}),this.dom.addEventListener("wheel",e=>{e.preventDefault();let i=e.deltaY>0?1.12:.89;this.goalDist=J(this.goalDist*i,24,650),this.userMoved=!0},{passive:!1}),this.dom.addEventListener("touchstart",e=>{for(let i of e.changedTouches)this.touches.set(i.identifier,{x:i.clientX,y:i.clientY});if(this.touches.size===2){let i=[...this.touches.values()];this.prevPinchDist=Math.hypot(i[0].x-i[1].x,i[0].y-i[1].y)}},{passive:!0}),this.dom.addEventListener("touchmove",e=>{if(this.touches.size>=2){let i=[...this.touches.values()],n=(i[0].x+i[1].x)*.5,r=(i[0].y+i[1].y)*.5;for(let h of e.changedTouches)this.touches.set(h.identifier,{x:h.clientX,y:h.clientY});let o=[...this.touches.values()],a=(o[0].x+o[1].x)*.5,l=(o[0].y+o[1].y)*.5;this._panByPixels(a-n,l-r);let c=Math.hypot(o[0].x-o[1].x,o[0].y-o[1].y);this.prevPinchDist>10&&c>10&&(this.goalDist=J(this.goalDist*(this.prevPinchDist/c),26,650)),this.prevPinchDist=c,this.userMoved=!0}},{passive:!0});let t=e=>{for(let i of e.changedTouches)this.touches.delete(i.identifier)};this.dom.addEventListener("touchend",t,{passive:!0}),this.dom.addEventListener("touchcancel",t,{passive:!0})}_panByPixels(t,e){let i=this.distance*.0017,n=Math.sin(this.yaw),r=Math.cos(this.yaw);this.goalTarget.x-=(r*t+n*e)*i,this.goalTarget.z-=(-n*t+r*e)*i;let o=Qt.size*.48;this.goalTarget.x=J(this.goalTarget.x,-o,o),this.goalTarget.z=J(this.goalTarget.z,-o,o)}flyTo(t,e,i=135,n=20){let r=Qt.size*.48;this.goalTarget.set(J(t,-r,r),n,J(e,-r,r)),this.goalDist=J(i,28,620)}updatePreviewOrbit(t,e=22){this.goalYaw+=t*.11,this.goalPitch=.64,this.goalDist=310,this.update(t,e)}update(t,e=18){let i=(62+this.distance*.58)*t,n=Math.sin(this.yaw),r=Math.cos(this.yaw),o=0,a=0;if((this.keys.has("KeyW")||this.keys.has("ArrowUp"))&&(o+=1),(this.keys.has("KeyS")||this.keys.has("ArrowDown"))&&(o-=1),(this.keys.has("KeyD")||this.keys.has("ArrowRight"))&&(a+=1),(this.keys.has("KeyA")||this.keys.has("ArrowLeft"))&&(a-=1),o!==0||a!==0){let d=Math.hypot(o,a);o/=d,a/=d,this.goalTarget.x+=(-n*o+r*a)*i,this.goalTarget.z+=(-r*o-n*a)*i;let u=Qt.size*.48;this.goalTarget.x=J(this.goalTarget.x,-u,u),this.goalTarget.z=J(this.goalTarget.z,-u,u),this.userMoved=!0}this.keys.has("KeyQ")&&(this.goalYaw+=1.55*t,this.userMoved=!0),this.keys.has("KeyE")&&(this.goalYaw-=1.55*t,this.userMoved=!0),this.goalTarget.y=ne(this.goalTarget.y,Math.max(8,e+2),J(t*5,0,1));let l=J(t*10.5,.05,1);this.yaw=ne(this.yaw,this.goalYaw,l),this.pitch=ne(this.pitch,this.goalPitch,l),this.distance=ne(this.distance,this.goalDist,l),this.target.lerp(this.goalTarget,l);let c=Math.cos(this.pitch)*this.distance,h=Math.sin(this.pitch)*this.distance;this.camera.position.set(this.target.x+Math.sin(this.yaw)*c,Math.max(e+4.5,this.target.y+h),this.target.z+Math.cos(this.yaw)*c),this.camera.lookAt(this.target)}};var Ia=class{constructor(){this.ctx=null,this.muted=!1,this.initialized=!1,this.waterGain=null,this.waterFilter=null,this.turbineGain=null,this.turbineOsc=null}unlock(){if(this.initialized||this.muted)return;let t=window.AudioContext||window.webkitAudioContext;if(t)try{this.ctx=new t,this.ctx.state==="suspended"&&this.ctx.resume();let e=this.ctx.sampleRate*2,i=this.ctx.createBuffer(1,e,this.ctx.sampleRate),n=i.getChannelData(0),r=0,o=0,a=0;for(let h=0;h<e;h++){let d=Math.random()*2-1;r=.997*r+d*.029,o=.985*o+d*.032,a=.95*a+d*.048,n[h]=J((r+o+a+d*.04)*1.8,-1,1)}let l=this.ctx.createBufferSource();l.buffer=i,l.loop=!0,this.waterFilter=this.ctx.createBiquadFilter(),this.waterFilter.type="lowpass",this.waterFilter.frequency.value=620,this.waterGain=this.ctx.createGain(),this.waterGain.gain.value=.04,l.connect(this.waterFilter),this.waterFilter.connect(this.waterGain),this.waterGain.connect(this.ctx.destination),l.start(),this.turbineOsc=this.ctx.createOscillator(),this.turbineOsc.type="triangle",this.turbineOsc.frequency.value=98;let c=this.ctx.createBiquadFilter();c.type="lowpass",c.frequency.value=190,this.turbineGain=this.ctx.createGain(),this.turbineGain.gain.value=0,this.turbineOsc.connect(c),c.connect(this.turbineGain),this.turbineGain.connect(this.ctx.destination),this.turbineOsc.start(),this.initialized=!0}catch{}}toggleMute(){return this.muted=!this.muted,!this.muted&&!this.initialized&&this.unlock(),this.ctx&&this.initialized&&this.muted&&(this.waterGain.gain.setTargetAtTime(0,this.ctx.currentTime,.08),this.turbineGain.gain.setTargetAtTime(0,this.ctx.currentTime,.08)),this.muted}updateContinuous(t,e,i){if(!this.initialized||this.muted||!this.ctx||this.ctx.state==="suspended")return;let n=J(1-(t-45)/290,.18,1),r=J(.03+n*.06+e/140*.14,0,.22),o=J(420+n*520+e*12,350,2400),a=this.ctx.currentTime;this.waterGain.gain.setTargetAtTime(r,a,.12),this.waterFilter.frequency.setTargetAtTime(o,a,.12);let l=i>.1?J(.012+i/30*.045,0,.065)*n:0;this.turbineGain.gain.setTargetAtTime(l,a,.15),this.turbineOsc.frequency.setTargetAtTime(92+Math.min(35,i*.9),a,.2)}playTone(t=440,e=.12,i="sine",n=.08){if(!(!this.initialized||this.muted||!this.ctx))try{let r=this.ctx.currentTime,o=this.ctx.createOscillator(),a=this.ctx.createGain();o.type=i,o.frequency.setValueAtTime(t,r),a.gain.setValueAtTime(n,r),a.gain.exponentialRampToValueAtTime(8e-4,r+e),o.connect(a),a.connect(this.ctx.destination),o.start(r),o.stop(r+e+.02)}catch{}}playBuild(){this.playTone(210,.09,"triangle",.07),setTimeout(()=>this.playTone(315,.11,"sine",.06),45)}playDig(){this.playTone(135+Math.random()*35,.07,"sawtooth",.035)}playMilestone(){this.playTone(523.25,.16,"sine",.09),setTimeout(()=>this.playTone(659.25,.18,"sine",.09),110),setTimeout(()=>this.playTone(783.99,.28,"sine",.1),220)}};var La=class{constructor(t){this.game=t,this.active=!1,this.completed=!1,this.stepIndex=0,this.visitedGorge=!1,this.cardEl=document.getElementById("tutorial-card"),this.stepBadgeEl=document.getElementById("tut-step-badge"),this.titleEl=document.getElementById("tut-title"),this.bodyEl=document.getElementById("tut-body"),this.progFillEl=document.getElementById("tut-prog-fill"),this.progTextEl=document.getElementById("tut-prog-text"),this.rewardEl=document.getElementById("tut-reward"),this._bindButtons()}_getGorgeCoords(){let t=this.game.hydro.presetId||"bystritsa",e=Wi[t]&&Wi[t].gorges[0]||{x:12,z:-158};return{x:e.x,z:e.z}}_getSteps(){let t=this._getGorgeCoords();return[{id:"recon",title:"\u0420\u0430\u0437\u0432\u0435\u0434\u043A\u0430 \u0443\u0449\u0435\u043B\u044C\u044F \u0438 \u0433\u0435\u043E\u0434\u0435\u0437\u0438\u044F",toolId:"inspect",reward:2e3,target:{x:t.x,z:t.z,dist:128},body:"\u041F\u0435\u0440\u0435\u043B\u0435\u0442\u0438\u0442\u0435 \u043A \u0441\u043A\u0430\u043B\u044C\u043D\u043E\u043C\u0443 \u0443\u0449\u0435\u043B\u044C\u044E \u043A\u043D\u043E\u043F\u043A\u043E\u0439 <b>\xAB\u2316 \u041F\u043E\u043A\u0430\u0437\u0430\u0442\u044C \u043C\u0435\u0441\u0442\u043E\xBB</b> (\u0438\u043B\u0438 \u043A\u043B\u0430\u0432\u0438\u0448\u0430\u043C\u0438 <code>WASD</code> + \u043A\u043E\u043B\u0435\u0441\u043E \u043C\u044B\u0448\u0438) \u0438 \u0432\u043A\u043B\u044E\u0447\u0438\u0442\u0435 \u0438\u0437\u043E\u043B\u0438\u043D\u0438\u0438 \u0432\u044B\u0441\u043E\u0442 <b>[\u2261 \u0412\u044B\u0441\u043E\u0442\u044B]</b> (<code>C</code>), \u0447\u0442\u043E\u0431\u044B \u0443\u0432\u0438\u0434\u0435\u0442\u044C \u043A\u0430\u043C\u0435\u043D\u043D\u044B\u0435 \u0449\u0451\u043A\u0438 \u043A\u0430\u043D\u044C\u043E\u043D\u0430.",progress:()=>{Math.hypot(this.game.camCtrl.target.x-t.x,this.game.camCtrl.target.z-t.z)<92&&(this.visitedGorge=!0);let i=(this.visitedGorge?.6:0)+(this.game.showContours?.4:0);return{ratio:J(i,0,1),label:this.visitedGorge?this.game.showContours?"\u0421\u0442\u0432\u043E\u0440 \u0438\u0437\u0443\u0447\u0435\u043D!":"\u0412\u043A\u043B\u044E\u0447\u0438\u0442\u0435 \u0438\u0437\u043E\u043B\u0438\u043D\u0438\u0438 [C] \u0438\u043B\u0438 \u043D\u0430\u0436\u043C\u0438\u0442\u0435 \xAB\u0414\u0430\u043B\u0435\u0435\xBB":"\u041D\u0430\u0432\u0435\u0434\u0438\u0442\u0435 \u043A\u0430\u043C\u0435\u0440\u0443 \u043D\u0430 \u0443\u0449\u0435\u043B\u044C\u0435 \xAB\u0412\u043E\u0440\u043E\u0442\u0430 \u0413\u0440\u043E\u043C\u0430\xBB",done:this.visitedGorge&&this.game.showContours}}},{id:"volumetric_dam",title:"\u041E\u0431\u044A\u0451\u043C\u043D\u0430\u044F 3D-\u043F\u043B\u043E\u0442\u0438\u043D\u0430 (3 \u044D\u0442\u0430\u043F\u0430)",toolId:"concrete_dam",reward:5e3,target:{x:t.x,z:t.z,dist:124},body:"\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 <b>[5] 3D \u041F\u043B\u043E\u0442\u0438\u043D\u0430</b>, \u0443\u043A\u0430\u0436\u0438\u0442\u0435 \u044F\u0440\u0443\u0441 \u0432\u044B\u0441\u043E\u0442\u044B (\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440 <b>+11\u043C</b>) \u0438 \u043F\u0440\u043E\u0442\u044F\u043D\u0438\u0442\u0435 \u041B\u041A\u041C \u043E\u0442 \u043B\u0435\u0432\u043E\u0439 \u0441\u043A\u0430\u043B\u044B \u0443\u0449\u0435\u043B\u044C\u044F \u043A \u043F\u0440\u0430\u0432\u043E\u0439. \u0412\u044B \u0443\u0432\u0438\u0434\u0438\u0442\u0435 \u0448\u043F\u0443\u043D\u0442, 3D-\u0430\u0440\u043C\u043E\u043A\u0430\u0440\u043A\u0430\u0441 \u0441 \u043E\u043F\u0430\u043B\u0443\u0431\u043A\u043E\u0439 \u0438 \u0440\u0430\u0431\u043E\u0442\u0443 \u0431\u0430\u0448\u0435\u043D\u043D\u044B\u0445 \u043A\u0440\u0430\u043D\u043E\u0432!",progress:()=>{let e=this.game.hydro.damCellCount;return{ratio:J(e/6,0,1),label:`\u0412\u043E\u0437\u0432\u0435\u0434\u0435\u043D\u043E \u043E\u0431\u044A\u0451\u043C\u043D\u044B\u0445 \u0441\u0435\u043A\u0446\u0438\u0439 \u043F\u043B\u043E\u0442\u0438\u043D\u044B: ${Math.min(e,6)} / 6`,done:e>=6}}},{id:"buttress_spillway",title:"\u041A\u043E\u043D\u0442\u0440\u0444\u043E\u0440\u0441\u044B \u0438 \u0437\u0430\u0449\u0438\u0442\u0430 \u043E\u0442 \u043F\u0430\u0432\u043E\u0434\u043A\u0430",toolId:"foundation",reward:4500,target:{x:t.x,z:t.z+8,dist:122},body:"\u0412\u044B\u0441\u043E\u043A\u0438\u0439 \u043D\u0430\u043F\u043E\u0440 \u0434\u0430\u0432\u0438\u0442 \u043D\u0430 \u043E\u0441\u043D\u043E\u0432\u0430\u043D\u0438\u0435! \u0423\u043A\u0440\u0435\u043F\u0438\u0442\u0435 \u043F\u043B\u043E\u0442\u0438\u043D\u0443 \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u043E\u043C <b>[6] \u041A\u043E\u043D\u0442\u0440\u0444\u043E\u0440\u0441</b> (\u0443\u0431\u0438\u0440\u0430\u0435\u0442 \u043F\u043E\u0434\u0437\u0435\u043C\u043D\u0443\u044E \u0444\u0438\u043B\u044C\u0442\u0440\u0430\u0446\u0438\u044E) \u0438 \u0432\u0440\u0435\u0436\u044C\u0442\u0435 \u0441\u0431\u043E\u043A\u0443 <b>[7] \u0412\u043E\u0434\u043E\u0441\u0431\u0440\u043E\u0441</b> \u0441 \u043F\u043E\u0434\u044A\u0451\u043C\u043D\u044B\u043C \u0437\u0430\u0442\u0432\u043E\u0440\u043E\u043C.",progress:()=>{let e=this.game.hydro.reinforcedCellCount,i=this.game.hydro.spillways.length;return{ratio:J(Math.min(1,e/3)*.5+(i>0?.5:0),0,1),label:`\u041A\u043E\u043D\u0442\u0440\u0444\u043E\u0440\u0441\u044B: ${Math.min(e,3)}/3 \xB7 \u0412\u043E\u0434\u043E\u0441\u0431\u0440\u043E\u0441: ${i}/1`,done:e>=3&&i>=1}}},{id:"turbine_launch",title:"\u041F\u0443\u0441\u043A \u0413\u042D\u0421 \u0441 3D \u043D\u0430\u043F\u043E\u0440\u043D\u044B\u043C \u0432\u043E\u0434\u043E\u0432\u043E\u0434\u043E\u043C",toolId:"turbine_kaplan",reward:6500,target:{x:t.x,z:t.z,dist:118},body:"\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 <b>[8] \u041A\u0430\u043F\u043B\u0430\u043D 7 \u041C\u0412\u0442</b> (\u0438\u043B\u0438 <b>[9] \u0424\u0440\u044D\u043D\u0441\u0438\u0441</b>) \u0438 \u043A\u043B\u0438\u043A\u043D\u0438\u0442\u0435 \u043F\u0440\u044F\u043C\u043E \u043F\u043E \u0433\u0440\u0435\u0431\u043D\u044E \u043F\u043B\u043E\u0442\u0438\u043D\u044B \u0442\u0430\u043A, \u0447\u0442\u043E\u0431\u044B \u0441\u0438\u043D\u0438\u0439 \u0448\u0430\u0440 \u0432\u043E\u0434\u043E\u0437\u0430\u0431\u043E\u0440\u0430 \u0441\u043C\u043E\u0442\u0440\u0435\u043B \u0432 \u0432\u043E\u0434\u043E\u0445\u0440\u0430\u043D\u0438\u043B\u0438\u0449\u0435, \u0430 \u0441\u0442\u0440\u0435\u043B\u043A\u0430 \u2014 \u0432\u043D\u0438\u0437 \u043F\u043E \u0440\u0435\u043A\u0435. \u0414\u043E\u0436\u0434\u0438\u0442\u0435\u0441\u044C <b>0.35 \u041C\u0412\u0442</b>!",progress:()=>{let e=this.game.hydro.turbines.length>0,i=this.game.economy.totalMW;return{ratio:J((e?.45:0)+Math.min(.55,i/.35*.55),0,1),label:e?`\u0412\u044B\u0440\u0430\u0431\u043E\u0442\u043A\u0430 \u0413\u042D\u0421: ${i.toFixed(2)} / 0.35 \u041C\u0412\u0442 (\u043A\u043E\u043F\u0438\u0442\u0441\u044F \u043D\u0430\u043F\u043E\u0440)`:"\u0423\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u0435 \u0433\u0438\u0434\u0440\u043E\u0430\u0433\u0440\u0435\u0433\u0430\u0442 \u0432 \u0441\u0442\u0432\u043E\u0440 \u043F\u043B\u043E\u0442\u0438\u043D\u044B",done:e&&i>=.35}}},{id:"substation_grid",title:"\u041F\u043E\u0434\u0441\u0442\u0430\u043D\u0446\u0438\u044F \u041E\u0420\u0423 110 \u043A\u0412 \u0438 \u041B\u042D\u041F \u043A \u0433\u043E\u0440\u043E\u0434\u0430\u043C",toolId:"powerline",reward:5500,target:{x:t.x+36,z:t.z+16,dist:145},body:"\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 <b>[P] \u041E\u0420\u0423 / \u041B\u042D\u041F</b> \u0438 \u043A\u043B\u0438\u043A\u043D\u0438\u0442\u0435 \u043D\u0430 \u0441\u0443\u0445\u043E\u043C \u0431\u0435\u0440\u0435\u0433\u0443 \u0440\u044F\u0434\u043E\u043C \u0441 \u0413\u042D\u0421, \u0447\u0442\u043E\u0431\u044B \u0432\u043E\u0437\u0432\u0435\u0441\u0442\u0438 <b>3D-\u043F\u043E\u0434\u0441\u0442\u0430\u043D\u0446\u0438\u044E \u041E\u0420\u0423 110 \u043A\u0412</b> (\u0441\u043D\u0438\u0436\u0430\u0435\u0442 \u043F\u043E\u0442\u0435\u0440\u0438 \u0441 16% \u0434\u043E 3%), \u0437\u0430\u0442\u0435\u043C \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0438\u0442\u0435 \u0435\u0449\u0451 \u043E\u0434\u0438\u043D \u0433\u043E\u0440\u043E\u0434 \u0441\u043F\u0440\u0430\u0432\u0430!",progress:()=>{let e=this.game.hydro.substations.length,i=this.game.economy.cities.filter(r=>r.connected).length;return{ratio:J((e>0?.5:0)+(i>=2?.5:0),0,1),label:`\u041F\u043E\u0434\u0441\u0442\u0430\u043D\u0446\u0438\u044F \u041E\u0420\u0423 110 \u043A\u0412: ${Math.min(1,e)}/1 \xB7 \u0413\u043E\u0440\u043E\u0434\u043E\u0432 \u0432 \u0441\u0435\u0442\u0438: ${i}/2`,done:e>=1||i>=2}}},{id:"custom_canal",title:"\u041F\u0440\u043E\u043A\u043B\u0430\u0434\u043A\u0430 \u0441\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u043E\u0433\u043E \u043A\u0430\u043D\u0430\u043B\u0430 \u0438 \u0416/\u0411 \u043B\u043E\u0442\u043E\u043A",toolId:"canal_dig",reward:6500,target:{x:146,z:72,dist:140},body:"\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 <b>[2] \u042D\u043A\u0441\u043A\u0430\u0432\u0430\u0442\u043E\u0440 \u043A\u0430\u043D\u0430\u043B\u0430</b>, \u0437\u0430\u0436\u043C\u0438\u0442\u0435 <code>Shift</code> (\u0440\u043E\u0432\u043D\u044B\u0439 \u0443\u043A\u043B\u043E\u043D \u0434\u043D\u0430!) \u0438 \u043F\u0440\u043E\u043A\u043E\u043F\u0430\u0439\u0442\u0435 \u043A\u0430\u043D\u0430\u043B (\u043D\u0430\u043F\u0440\u0438\u043C\u0435\u0440 \u043E\u0442 \u0432\u043E\u0441\u0442\u043E\u0447\u043D\u043E\u0439 \u0438\u0437\u043B\u0443\u0447\u0438\u043D\u044B \u043A \u0437\u0435\u043B\u0451\u043D\u043E\u043C\u0443 \u043A\u043E\u043B\u044C\u0446\u0443 \u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u044B). \u041A\u0430\u043C\u0435\u043D\u043D\u0430\u044F \u0432\u044B\u0435\u043C\u043A\u0430 \u0434\u0430\u0441\u0442 \u0449\u0435\u0431\u0435\u043D\u044C \u0441\u043E \u0441\u043A\u0438\u0434\u043A\u043E\u0439 38% \u043D\u0430 <b>[3] \u0416/\u0411 \u043B\u043E\u0442\u043E\u043A</b>!",progress:()=>{let e=this.game.hydro.totalExcavatedM3;return{ratio:J(e/220,0,1),label:`\u0412\u044B\u043D\u0443\u0442\u043E \u043F\u043E\u0440\u043E\u0434\u044B \u043F\u043E\u0434 \u0441\u0432\u043E\u0439 \u043A\u0430\u043D\u0430\u043B: ${Math.round(Math.min(e,220))} / 220 \u043C\xB3`,done:e>=220}}},{id:"spot_dispatch",title:"\u0421\u043F\u043E\u0442\u043E\u0432\u044B\u0439 \u0440\u044B\u043D\u043E\u043A \u0438 \u0410\u0432\u0442\u043E-\u0434\u0438\u0441\u043F\u0435\u0442\u0447\u0435\u0440",toolId:"inspect",reward:4e3,target:{x:t.x,z:t.z,dist:115},body:"\u0412\u0435\u0447\u0435\u0440\u043E\u043C \u0441 17:00 \u0434\u043E 22:00 \u0446\u0435\u043D\u0430 \u044D\u043D\u0435\u0440\u0433\u0438\u0438 \u0432\u0437\u043B\u0435\u0442\u0430\u0435\u0442 \u0432 <b>\xD72.35 \u0440\u0430\u0437\u0430</b>! \u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 <b>[1] \u041E\u0441\u043C\u043E\u0442\u0440</b>, \u043A\u043B\u0438\u043A\u043D\u0438\u0442\u0435 \u043F\u043E \u0437\u0434\u0430\u043D\u0438\u044E \u0413\u042D\u0421 \u0438 \u0432\u043A\u043B\u044E\u0447\u0438\u0442\u0435 \u0432 \u0438\u043D\u0441\u043F\u0435\u043A\u0442\u043E\u0440\u0435 <b>\xAB\u0410\u0432\u0442\u043E-\u0434\u0438\u0441\u043F\u0435\u0442\u0447\u0435\u0440 \u043F\u043E \u043F\u0438\u043A\u0430\u043C \u044D\u043D\u0435\u0440\u0433\u043E\u0440\u044B\u043D\u043A\u0430\xBB</b>.",progress:()=>{let e=this.game.hydro.turbines.some(i=>i.autoDispatch);return{ratio:e?1:.2,label:e?"\u0410\u0432\u0442\u043E-\u0434\u0438\u0441\u043F\u0435\u0442\u0447\u0435\u0440 \u0432\u043A\u043B\u044E\u0447\u0451\u043D!":"\u041E\u0442\u043A\u0440\u043E\u0439\u0442\u0435 \u0438\u043D\u0441\u043F\u0435\u043A\u0442\u043E\u0440 \u0413\u042D\u0421 \u0438 \u0432\u043A\u043B\u044E\u0447\u0438\u0442\u0435 \u0410\u0432\u0442\u043E-\u0434\u0438\u0441\u043F\u0435\u0442\u0447\u0435\u0440",done:e}}},{id:"master_diploma",title:"\u042D\u043D\u0435\u0440\u0433\u0435\u0442\u0438\u0447\u0435\u0441\u043A\u043E\u0435 \u0441\u0435\u0440\u0434\u0446\u0435 \u0434\u043E\u043B\u0438\u043D\u044B!",toolId:"turbine_francis",reward:12e3,target:{x:168,z:98,dist:165},body:"\u0424\u0438\u043D\u0430\u043B\u044C\u043D\u044B\u0439 \u044D\u043A\u0437\u0430\u043C\u0435\u043D: \u0434\u043E\u0432\u0435\u0434\u0438\u0442\u0435 \u0432\u044B\u0440\u0430\u0431\u043E\u0442\u043A\u0443 \u043A\u0430\u0441\u043A\u0430\u0434\u0430 \u0434\u043E <b>2.0 \u041C\u0412\u0442</b> (\u043D\u0430\u0440\u0430\u0441\u0442\u0438\u0432 \u043F\u043B\u043E\u0442\u0438\u043D\u0443 \u0438\u043B\u0438 \u0434\u043E\u0431\u0430\u0432\u0438\u0432 \u0430\u0433\u0440\u0435\u0433\u0430\u0442) \u0418\u041B\u0418 \u043F\u043E\u0434\u0430\u0439\u0442\u0435 \u0432\u043E\u0434\u0443 \u043A\u0430\u043D\u0430\u043B\u043E\u043C \u0432 \u043E\u0440\u043E\u0441\u0438\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u0431\u0430\u0441\u0441\u0435\u0439\u043D <b>\u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u044B</b>!",progress:()=>{let e=this.game.economy.totalMW,i=this.game.economy.agroIrrigated;return{ratio:i?1:J(e/2,0,1),label:i?"\u041E\u0440\u043E\u0448\u0435\u043D\u0438\u0435 \u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u044B \u0437\u0430\u043F\u0443\u0449\u0435\u043D\u043E!":`\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C \u0413\u042D\u0421: ${e.toFixed(2)} / 2.00 \u041C\u0412\u0442 (\u0438\u043B\u0438 \u043E\u0440\u043E\u0441\u0438\u0442\u0435 \u0410\u0433\u0440\u043E\u0434\u043E\u043B\u0438\u043D\u0443)`,done:i||e>=2}}}]}_bindButtons(){let t=document.getElementById("tut-btn-fly"),e=document.getElementById("tut-btn-equip"),i=document.getElementById("tut-btn-skip"),n=document.getElementById("tut-close"),r=document.getElementById("btn-tutorial");t&&t.addEventListener("click",()=>{let o=this._getSteps()[this.stepIndex];if(!o)return;let a=this.game.hydro.sampleAtWorld(o.target.x,o.target.z).bed;this.game.camCtrl.flyTo(o.target.x,o.target.z,o.target.dist,a),o.id==="recon"&&(this.visitedGorge=!0)}),e&&e.addEventListener("click",()=>{let o=this._getSteps()[this.stepIndex];o&&(o.id==="recon"&&!this.game.showContours&&this.game.toggleContours(),o.toolId&&this.game.selectTool(o.toolId))}),i&&i.addEventListener("click",()=>{this._advanceStep(!0)}),n&&n.addEventListener("click",()=>{this.stop()}),r&&r.addEventListener("click",()=>{this.active?this.stop():(this.completed&&(this.stepIndex=0),this.start(this.stepIndex))})}start(t=0){this.active=!0,this.completed=!1,this.stepIndex=t,this.cardEl&&this.cardEl.classList.remove("hidden");let e=document.getElementById("btn-tutorial");e&&e.classList.add("active"),this._renderCurrentStep(!0)}stop(){this.active=!1,this.cardEl&&this.cardEl.classList.add("hidden");let t=document.getElementById("btn-tutorial");t&&t.classList.remove("active"),this._clearToolHighlight(),this.game.worldView.setTutorialTarget(0,0,!1)}_clearToolHighlight(){document.querySelectorAll(".tool-slot.tut-pulse").forEach(t=>t.classList.remove("tut-pulse"))}_renderCurrentStep(t=!1){let e=this._getSteps(),i=e[this.stepIndex];if(!i){this._finishAll();return}if(this.stepBadgeEl.textContent=`\u041E\u0411\u0423\u0427\u0415\u041D\u0418\u0415 \xB7 \u0428\u0410\u0413 ${this.stepIndex+1} \u0418\u0417 ${e.length}`,this.titleEl.textContent=i.title,this.bodyEl.innerHTML=i.body,this.rewardEl.textContent=`\u041F\u0440\u0435\u043C\u0438\u044F: +${i.reward.toLocaleString("ru-RU")} \u20BD`,this._clearToolHighlight(),i.toolId){let n=document.querySelector(`.tool-slot[data-tool="${i.toolId}"]`);n&&n.classList.add("tut-pulse")}if(this.game.worldView.setTutorialTarget(i.target.x,i.target.z,!0),t&&this.stepIndex===0){let n=this.game.hydro.sampleAtWorld(i.target.x,i.target.z).bed;this.game.camCtrl.flyTo(i.target.x,i.target.z,i.target.dist+25,n)}this.update()}_advanceStep(t=!1){let e=this._getSteps(),i=e[this.stepIndex];i&&!t&&(this.game.economy.earn(i.reward),this.game.audio.playMilestone(),this.game.notify(`\u2726 \u0428\u0430\u0433 \u043E\u0431\u0443\u0447\u0435\u043D\u0438\u044F \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D: \xAB${i.title}\xBB (+${i.reward.toLocaleString("ru-RU")} \u20BD)!`,"good")),this.stepIndex++,this.stepIndex>=e.length?this._finishAll():this._renderCurrentStep(!1)}_finishAll(){this.completed=!0,this.active=!1,this._clearToolHighlight(),this.game.worldView.setTutorialTarget(0,0,!1),this.cardEl&&this.cardEl.classList.add("hidden");let t=document.getElementById("btn-tutorial");t&&t.classList.remove("active"),this.game.notify("\u2605 \u041F\u043E\u0437\u0434\u0440\u0430\u0432\u043B\u044F\u0435\u043C! \u0412\u044B \u043E\u043A\u043E\u043D\u0447\u0438\u043B\u0438 \u0428\u043A\u043E\u043B\u0443 \u0413\u043B\u0430\u0432\u043D\u043E\u0433\u043E \u0413\u0438\u0434\u0440\u043E\u0441\u0442\u0440\u043E\u0438\u0442\u0435\u043B\u044F \u0438 \u043E\u0441\u0432\u043E\u0438\u043B\u0438 \u0432\u0435\u0441\u044C \u043A\u0430\u0441\u043A\u0430\u0434!","good");try{localStorage.setItem("cascade.tutorialDone","1")}catch{}}update(){if(!this.active)return;let e=this._getSteps()[this.stepIndex];if(!e)return;let i=e.progress();this.progFillEl&&(this.progFillEl.style.width=`${Math.round(i.ratio*100)}%`),this.progTextEl&&(this.progTextEl.textContent=i.label),i.done&&this._advanceStep(!1)}};var Au={inspect:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#38bdf8" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3M11 8v6M8 11h6"/></svg>',canal_dig:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#22d3ee" stroke-width="2"><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/><path d="M2 21h20"/></svg>',canal_liner:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#cbd5e1" stroke-width="2"><path d="M2 7h3l3 10h8l3-10h3"/><path d="M7 13h10"/><path d="M5 19h14" stroke="#38bdf8"/></svg>',earth_dam:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#d97706" stroke-width="2"><path d="M2 19L9 7h6l7 12H2z"/><path d="M6 19l4-7h4l4 7"/></svg>',concrete_dam:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#f8fafc" stroke-width="2"><path d="M3 20L6 5h12l3 15H3z"/><path d="M5 10h14M4 15h16M12 5v15" stroke="#94a3b8" stroke-width="1.5"/></svg>',foundation:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#f59e0b" stroke-width="2"><path d="M4 20V6h6l10 14H4z"/><path d="M7 20v3M12 20v3M17 20v3" stroke="#fbbf24"/><path d="M4 12h9"/></svg>',spillway:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#38bdf8" stroke-width="2"><path d="M4 5v14M20 5v14M4 9h16"/><path d="M8 13c2 3 6 3 8 6" stroke="#67e8f9"/></svg>',turbine_kaplan:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#60a5fa" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v6M12 16v6M2 12h6M16 12h6"/></svg>',turbine_francis:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fbbf24" stroke-width="2"><polygon points="13 2 4 14 11 14 10 22 20 10 13 10 13 2"/></svg>',turbine_pelton:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#34d399" stroke-width="2"><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1"/></svg>',powerline:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#fde047" stroke-width="2"><path d="M12 3L7 21M12 3l5 18M5 9h14M7 14h10"/></svg>',demolish:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="#f87171" stroke-width="2"><path d="M5 5l14 14M19 5L5 19"/></svg>'};var cc=["normal","rain","flood","low_water"],hc=[0,1,2,5];function Ri(){return new Promise(s=>requestAnimationFrame(()=>s()))}var uc=class{constructor(){this.canvas=document.getElementById("scene"),this.device=xu();let t=_u(),e=this._loadSetting("quality",null),i=t?"low":e||this.device.recommendedQuality;this.profile=xa[i]||xa.medium,this.selectedPresetId="bystritsa",this.selectedMode="standard",this.isInPreGameLoader=!0,this.isLoadingMap=!0,this.ready=!1,this.audio=new Ia,this._initRenderer(),this.scene=new Ns,this.camera=new We(46,window.innerWidth/window.innerHeight,1.8,2400),this.camCtrl=new Pa(this.camera,this.canvas),this.activeToolId="concrete_dam",this.brushRadius=9,this.damTierIndex=1,this.manualYaw=null,this.showContours=!1,this.speedIndex=1,this.selectedStruct=null,this.pointerDown=!1,this.lastBrushWorld=null,this.lockedGradeElev=null,this.hoverWorld=null,this.showDiag=!1,this.fps=60,this._fpsFrames=0,this._fpsAccum=0,this._frameCount=0,this._uiRefreshAccum=0,this._lastTime=performance.now(),this._onResize(),window.addEventListener("resize",()=>this._onResize()),this._bindLoaderUI(),this._bootAsync()}_setLoaderProgress(t,e){let i=document.getElementById("loader-bar-fill"),n=document.getElementById("loader-stage"),r=document.getElementById("loader-pct");i&&(i.style.width=`${t}%`),n&&(n.textContent=e),r&&(r.textContent=`${Math.round(t)}%`)}_bindLoaderUI(){let t=document.getElementById("btn-enter-valley"),e=document.getElementById("pill-mode-std"),i=document.getElementById("pill-mode-cre"),n=document.getElementById("chk-start-tutorial");n&&this._loadSetting("tutorialDone","")==="1"&&(n.checked=!1),document.querySelectorAll(".scenario-card").forEach(o=>{o.addEventListener("click",()=>{if(this.isLoadingMap)return;let a=o.dataset.preset;!a||a===this.selectedPresetId||(document.querySelectorAll(".scenario-card").forEach(l=>l.classList.remove("active")),o.classList.add("active"),this.loadValleyMapAsync(a))})});let r=o=>{this.selectedMode=o,e.classList.toggle("active",o==="standard"),i.classList.toggle("active",o==="creative")};e.addEventListener("click",()=>r("standard")),i.addEventListener("click",()=>r("creative")),t.addEventListener("click",()=>{this.isLoadingMap||(this.audio.unlock(),this.enterValley())})}async _bootAsync(){let t=document.getElementById("btn-enter-valley");t&&(t.disabled=!0,t.textContent="\u0413\u0435\u043D\u0435\u0440\u0430\u0446\u0438\u044F \u0434\u043E\u043B\u0438\u043D\u044B\u2026"),this._setLoaderProgress(8,"\u0421\u0438\u043D\u0442\u0435\u0437 \u043F\u0440\u043E\u0446\u0435\u0434\u0443\u0440\u043D\u044B\u0445 PBR-\u0442\u0435\u043A\u0441\u0442\u0443\u0440 \u0433\u0440\u0430\u043D\u0438\u0442\u0430, \u0431\u0435\u0442\u043E\u043D\u0430, \u043E\u043F\u0430\u043B\u0443\u0431\u043A\u0438 \u0438 \u0445\u0432\u043E\u0438\u2026"),await Ri(),this.textures=Aa(this.renderer),this._setLoaderProgress(22,"\u0412\u044B\u0434\u0435\u043B\u0435\u043D\u0438\u0435 \u043F\u0430\u043C\u044F\u0442\u0438 \u0433\u0438\u0434\u0440\u043E\u0434\u0438\u043D\u0430\u043C\u0438\u043A\u0438 \u0421\u0435\u043D-\u0412\u0435\u043D\u0430\u043D\u0430 (768 \xD7 768 \u043C)\u2026"),await Ri(),this.hydro=new Sa(this.profile.grid,this.selectedPresetId,!0);let e=this.hydro.grid,i=Math.floor(e/3),n=Math.floor(e*2/3);this._setLoaderProgress(38,"\u0413\u0435\u043E\u0434\u0435\u0437\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u0441\u044A\u0451\u043C\u043A\u0430 \u0441\u0435\u0432\u0435\u0440\u043D\u044B\u0445 \u0445\u0440\u0435\u0431\u0442\u043E\u0432 \u0438 \u0441\u043A\u0430\u043B\u044C\u043D\u044B\u0445 \u0443\u0449\u0435\u043B\u0438\u0439 (1/3)\u2026"),await Ri(),bn(e,this.hydro,this.selectedPresetId,0,i),this._setLoaderProgress(54,"\u0424\u043E\u0440\u043C\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u0434\u0435\u0440\u0438\u0432\u0430\u0446\u0438\u043E\u043D\u043D\u043E\u0433\u043E \u043F\u043B\u0430\u0442\u043E \u0438 \u0438\u0437\u043B\u0443\u0447\u0438\u043D\u044B \xAB\u0411\u043E\u043B\u044C\u0448\u0430\u044F \u041F\u043E\u0434\u043A\u043E\u0432\u0430\xBB (2/3)\u2026"),await Ri(),bn(e,this.hydro,this.selectedPresetId,i,n),this._setLoaderProgress(70,"\u041D\u0430\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u0435 \u0440\u0435\u043A \xAB\u0411\u044B\u0441\u0442\u0440\u0438\u0446\u0430\xBB, \xAB\u0421\u0435\u0440\u0435\u0431\u0440\u044F\u043D\u043A\u0430\xBB \u0438 \xAB\u0413\u0440\u0435\u043C\u0443\u0447\u0438\u0439\xBB (3/3)\u2026"),await Ri(),bn(e,this.hydro,this.selectedPresetId,n,e),this.hydro.finalizeValleySetup(18),this._setLoaderProgress(84,"\u0412\u043E\u0437\u0432\u0435\u0434\u0435\u043D\u0438\u0435 5 \u0441\u0442\u0430\u0440\u0442\u043E\u0432\u044B\u0445 \u0433\u043E\u0440\u043E\u0434\u043E\u0432, \u043F\u043E\u0441\u0430\u0434\u043A\u0430 \u043B\u0435\u0441\u043E\u0432 \u0438 \u043F\u0443\u043B\u043E\u0432 3D-\u0441\u0442\u0440\u043E\u0439\u043A\u0438\u2026"),await Ri(),this.economy=new Ea(this.hydro,{onNotify:(o,a)=>this.notify(o,a),onMilestone:o=>{this.audio.playMilestone(),this.notify(`\u2605 \u0413\u0440\u0430\u043D\u0442 \u041C\u0438\u043D\u044D\u043D\u0435\u0440\u0433\u043E \xAB${o.title}\xBB: +${o.reward.toLocaleString("ru-RU")} \u20BD!`,"good")}}),this.worldView=new Ca(this.scene,this.hydro,this.economy,this.profile,this.renderer,this.textures),this.spray=new Ra(this.scene,this.profile.maxParticles),this.tutorial=new La(this),this._setLoaderProgress(95,"\u041F\u0440\u0435\u0434\u043A\u043E\u043C\u043F\u0438\u043B\u044F\u0446\u0438\u044F WebGL-\u0448\u0435\u0439\u0434\u0435\u0440\u043E\u0432 \u043E\u043F\u0442\u0438\u043A\u0438 \u0432\u043E\u0434\u044B, \u043A\u0430\u0443\u0441\u0442\u0438\u043A\u0438 \u0438 \u0444\u0430\u0441\u0430\u0434\u043E\u0432\u2026"),await Ri(),this.renderer.compile(this.scene,this.camera),this._initUI(),this._bindWorldInput(),this._rebuildLandmarksBar(),this.worldView.syncCityInstances(),this.worldView.syncEngineeredVolumes(),this._setLoaderProgress(100,`\u041A\u0430\u0440\u0442\u0430 \xAB${Ci[this.selectedPresetId].name}\xBB (768\xD7768 \u043C) \u0433\u043E\u0442\u043E\u0432\u0430 \u043A \u0440\u0430\u0431\u043E\u0442\u0435!`),this.isLoadingMap=!1,this.ready=!0;let r=document.getElementById("map-loader");r&&r.classList.add("ready-preview"),t&&(t.disabled=!1,t.textContent="\u25B6 \u0412\u043E\u0439\u0442\u0438 \u0432 \u0434\u043E\u043B\u0438\u043D\u0443 \u0438 \u043D\u0430\u0447\u0430\u0442\u044C \u0441\u0442\u0440\u043E\u0438\u0442\u0435\u043B\u044C\u0441\u0442\u0432\u043E"),this._lastTime=performance.now(),requestAnimationFrame(o=>this._loop(o)),window.location.search.includes("autostart=1")&&this.enterValley()}async loadValleyMapAsync(t){this.isLoadingMap=!0,this.selectedPresetId=t;let e=document.getElementById("btn-enter-valley");e&&(e.disabled=!0,e.textContent="\u041F\u0435\u0440\u0435\u0441\u0442\u0440\u043E\u0439\u043A\u0430 \u0440\u0435\u043B\u044C\u0435\u0444\u0430 \u0434\u043E\u043B\u0438\u043D\u044B\u2026"),this._setLoaderProgress(18,`\u041E\u0447\u0438\u0441\u0442\u043A\u0430 \u0433\u0438\u0434\u0440\u043E\u0443\u0437\u043B\u0430 \u0438 \u043F\u043E\u0434\u0433\u043E\u0442\u043E\u0432\u043A\u0430 \u043A\u0430\u0440\u0442\u044B \xAB${Ci[t].name}\xBB\u2026`),await Ri(),this.hydro.presetId=t,this.hydro._clearArrays();let i=this.hydro.grid,n=Math.floor(i/2);this._setLoaderProgress(48,"\u0421\u043A\u0443\u043B\u044C\u043F\u0442\u0443\u0440\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u043A\u0430\u043D\u044C\u043E\u043D\u043E\u0432, \u0442\u0435\u0440\u0440\u0430\u0441 5 \u0433\u043E\u0440\u043E\u0434\u043E\u0432 \u0438 \u0440\u0443\u0441\u0435\u043B \u0440\u0435\u043A (1/2)\u2026"),await Ri(),bn(i,this.hydro,t,0,n),this._setLoaderProgress(76,"\u0417\u0430\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u0435 \u0432\u043E\u0434\u043E\u0442\u043E\u043A\u043E\u0432 \u0438 \u043F\u0440\u043E\u0433\u0440\u0435\u0432 \u0443\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u0439 \u043C\u0435\u043B\u043A\u043E\u0439 \u0432\u043E\u0434\u044B (2/2)\u2026"),await Ri(),bn(i,this.hydro,t,n,i),this.hydro.finalizeValleySetup(18),this._setLoaderProgress(92,"\u0420\u0430\u0437\u043C\u0435\u0449\u0435\u043D\u0438\u0435 \u043A\u0432\u0430\u0440\u0442\u0430\u043B\u043E\u0432 5 \u0433\u043E\u0440\u043E\u0434\u043E\u0432, \u0445\u0432\u043E\u0439\u043D\u044B\u0445 \u043C\u0430\u0441\u0441\u0438\u0432\u043E\u0432 \u0438 \u0432\u0430\u043B\u0443\u043D\u043E\u0432\u2026"),await Ri(),this.economy.resetEconomy(),this.worldView.rebuildForNewValley(),this._rebuildLandmarksBar(),this.selectedStruct=null,document.getElementById("struct-inspector").classList.add("hidden"),this._refreshHUD(),this._setLoaderProgress(100,`\u041A\u0430\u0440\u0442\u0430 \xAB${Ci[t].name}\xBB \u043F\u043E\u043B\u043D\u043E\u0441\u0442\u044C\u044E \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D\u0430!`),this.isLoadingMap=!1,e&&(e.disabled=!1,e.textContent="\u25B6 \u0412\u043E\u0439\u0442\u0438 \u0432 \u0434\u043E\u043B\u0438\u043D\u0443 \u0438 \u043D\u0430\u0447\u0430\u0442\u044C \u0441\u0442\u0440\u043E\u0438\u0442\u0435\u043B\u044C\u0441\u0442\u0432\u043E")}enterValley(){this.isInPreGameLoader=!1;let t=document.getElementById("map-loader");t&&t.classList.add("hidden");let e=this.selectedMode==="creative";this.economy.creative=e,document.getElementById("btn-creative").classList.toggle("active",e);let i=Ci[this.selectedPresetId].landmarks[0],n=this.hydro.sampleAtWorld(i.x,i.z).bed;this.camCtrl.flyTo(i.x,i.z+25,165,n);let r=document.getElementById("chk-start-tutorial");r&&r.checked?this.tutorial.start(0):(this.tutorial.stop(),this.notify(`\u2248 \u041A\u0430\u0440\u0442\u0430 \xAB${Ci[this.selectedPresetId].name}\xBB \u043E\u0442\u043A\u0440\u044B\u0442\u0430! \u041D\u0430\u0436\u043C\u0438\u0442\u0435 \xAB\u041E\u0431\u0443\u0447\u0435\u043D\u0438\u0435\xBB \u0441\u0432\u0435\u0440\u0445\u0443 (T) \u0432 \u043B\u044E\u0431\u043E\u0439 \u043C\u043E\u043C\u0435\u043D\u0442.`,"info")),this._refreshHUD()}openMapLoader(){this.isInPreGameLoader=!0;let t=document.getElementById("map-loader");t&&(t.classList.remove("hidden"),t.classList.add("ready-preview"))}_rebuildLandmarksBar(){let t=document.getElementById("landmarks-bar");if(!t)return;t.innerHTML="";let e=Ci[this.selectedPresetId]||Ci.bystritsa;for(let i of e.landmarks){let n=document.createElement("button");n.className="lm-btn",n.textContent=i.label,n.addEventListener("click",()=>{let r=this.hydro.sampleAtWorld(i.x,i.z).bed;this.camCtrl.flyTo(i.x,i.z,i.dist,r)}),t.appendChild(n)}}_loadSetting(t,e){try{return localStorage.getItem(`cascade.${t}`)||e}catch{return e}}_saveSetting(t,e){try{localStorage.setItem(`cascade.${t}`,e)}catch{}}_initRenderer(){let t=[{antialias:this.profile.id!=="low",powerPreference:"high-performance"},{antialias:!1,powerPreference:"default"},{antialias:!1,failIfMajorPerformanceCaveat:!1}],e=null;for(let n of t)try{if(this.renderer=new pa({canvas:this.canvas,antialias:n.antialias,powerPreference:n.powerPreference,alpha:!1}),this.renderer&&this.renderer.getContext())break}catch(r){e=r,this.renderer=null}if(!this.renderer){let n=ac(),r=document.getElementById("nogl-modal"),o=document.getElementById("nogl-reason");throw r&&r.classList.remove("hidden"),o&&(o.textContent=n.reason||e&&e.message||"WebGL \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D"),new Error("WebGL context unavailable")}let i=Math.min(window.devicePixelRatio||1,this.profile.maxPixelRatio);this.renderer.setPixelRatio(i),this.renderer.setSize(window.innerWidth,window.innerHeight),this.renderer.shadowMap.enabled=!!this.profile.shadows,this.renderer.shadowMap.type=Fn,this.renderer.shadowMap.autoUpdate=!1,this.renderer.shadowMap.needsUpdate=!0}_onResize(){let t=window.innerWidth,e=window.innerHeight;this.camera.aspect=t/Math.max(1,e),this.camera.updateProjectionMatrix();let i=Math.min(window.devicePixelRatio||1,this.profile.maxPixelRatio);this.renderer.setPixelRatio(i),this.renderer.setSize(t,e)}raycastValley(t,e){let i=this.canvas.getBoundingClientRect(),n=(t-i.left)/i.width*2-1,r=-((e-i.top)/i.height)*2+1,o=this._raycaster||(this._raycaster=new $s);o.setFromCamera({x:n,y:r},this.camera);let a=o.ray.origin,l=o.ray.direction;if(l.y>=-.01)return null;let c=Math.max(2,(a.y-102)/-l.y),h=Math.min(1650,(a.y- -2)/-l.y);if(h<=c)return null;let d=76,u=(h-c)/d,f=c,g=Qt.size*.495;for(let _=1;_<=d;_++){let m=c+_*u,p=a.x+l.x*m,b=a.y+l.y*m,T=a.z+l.z*m;if(Math.abs(p)>g||Math.abs(T)>g){f=m;continue}let y=this.hydro.sampleAtWorld(p,T);if(b<=y.bed){let v=f,S=m;for(let x=0;x<5;x++){let E=(v+S)*.5,R=a.x+l.x*E,I=a.y+l.y*E,D=a.z+l.z*E,C=this.hydro.sampleAtWorld(R,D);I<=C.bed?S=E:v=E}let A=(v+S)*.5;return{wx:J(a.x+l.x*A,-g,g),wy:a.y+l.y*A,wz:J(a.z+l.z*A,-g,g)}}f=m}return null}_initUI(){let t=document.getElementById("hotbar");t.innerHTML="";for(let l of _a){let c=document.createElement("button");c.className=`tool-slot${l.id===this.activeToolId?" active":""}`,c.dataset.tool=l.id,c.innerHTML=`
        <span class="tool-key">[${l.key}]</span>
        <span class="tool-icon">${Au[l.id]||"\u25C8"}</span>
        <span class="tool-name">${l.short}</span>
        <span class="tool-price">${l.costLabel}</span>
      `,c.addEventListener("click",()=>{this.audio.unlock(),this.selectTool(l.id)}),t.appendChild(c)}this._updateToolHint(),document.querySelectorAll(".size-btn[data-size]").forEach(l=>{l.addEventListener("click",()=>{this.brushRadius=parseFloat(l.dataset.size),document.querySelectorAll(".size-btn[data-size]").forEach(c=>c.classList.remove("active")),l.classList.add("active")})}),document.querySelectorAll(".tier-btn[data-tier]").forEach(l=>{l.addEventListener("click",()=>{this.damTierIndex=parseInt(l.dataset.tier,10)||0,document.querySelectorAll(".tier-btn[data-tier]").forEach(h=>h.classList.remove("active")),l.classList.add("active");let c=Le.damHeightTiers[this.damTierIndex];this.notify(`\u25B2 \u0412\u044B\u0431\u0440\u0430\u043D \u043F\u0440\u043E\u0444\u0438\u043B\u044C 3D-\u043F\u043B\u043E\u0442\u0438\u043D\u044B: ${c.label}`,"info")})}),document.getElementById("btn-rotate").addEventListener("click",()=>this.rotatePlacement()),document.getElementById("btn-speed").addEventListener("click",()=>this.cycleSpeed()),document.getElementById("btn-open-loader").addEventListener("click",()=>this.openMapLoader()),document.getElementById("btn-contours").addEventListener("click",()=>this.toggleContours()),document.getElementById("btn-weather-cycle").addEventListener("click",()=>{let l=(cc.indexOf(this.economy.weatherId)+1)%cc.length,c=cc[l];this.economy.setWeather(c);let h=ei[c];this.notify(`${h.icon} \u0412\u043A\u043B\u044E\u0447\u0451\u043D \u0440\u0435\u0436\u0438\u043C: ${h.label} (\u043F\u0440\u0438\u0442\u043E\u043A \xD7${h.inflowMult.toFixed(2)})`,"info"),this._refreshHUD()});let e=document.getElementById("btn-creative");e.addEventListener("click",()=>{this.economy.creative=!this.economy.creative,e.classList.toggle("active",this.economy.creative),this.notify(this.economy.creative?"\u2605 \u0420\u0435\u0436\u0438\u043C \xAB\u0418\u043D\u0436\u0435\u043D\u0435\u0440\u043D\u044B\u0439 \u043A\u0440\u0435\u0430\u0442\u0438\u0432\xBB \u0432\u043A\u043B\u044E\u0447\u0451\u043D: \u043C\u0433\u043D\u043E\u0432\u0435\u043D\u043D\u0430\u044F \u0441\u0442\u0440\u043E\u0439\u043A\u0430 \u0438 \u0431\u0435\u0441\u043A\u043E\u043D\u0435\u0447\u043D\u044B\u0439 \u0431\u044E\u0434\u0436\u0435\u0442!":"\u25C8 \u0412\u043A\u043B\u044E\u0447\u0451\u043D \u0438\u043D\u0436\u0435\u043D\u0435\u0440\u043D\u044B\u0439 \u0440\u0435\u0436\u0438\u043C: 3-\u044D\u0442\u0430\u043F\u043D\u043E\u0435 \u0431\u0435\u0442\u043E\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u043A\u0440\u0430\u043D\u0430\u043C\u0438 \u0438 \u0440\u0435\u0430\u043B\u044C\u043D\u044B\u0439 \u0431\u044E\u0434\u0436\u0435\u0442.","info"),this._refreshHUD()});let i=document.getElementById("btn-quality");i.textContent=`\u2699 ${this.profile.label}`,i.addEventListener("click",()=>{let l=["low","medium","high"],c=l[(l.indexOf(this.profile.id)+1)%l.length];this._saveSetting("quality",c),this.profile=xa[c],i.textContent=`\u2699 ${this.profile.label}`,this.renderer.shadowMap.enabled=!!this.profile.shadows,this.renderer.shadowMap.needsUpdate=!0,this._onResize(),this.notify(`\u0413\u0440\u0430\u0444\u0438\u043A\u0430 \u043F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0435\u043D\u0430: ${this.profile.label} (\u0441\u043C\u0435\u043D\u0430 \u043F\u043B\u043E\u0442\u043D\u043E\u0441\u0442\u0438 \u0441\u0435\u0442\u043A\u0438 \u0432\u043E\u0434\u044B \u0432\u0441\u0442\u0443\u043F\u0438\u0442 \u043F\u043E\u0441\u043B\u0435 \u043F\u0435\u0440\u0435\u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438)`,"info")});let n=document.getElementById("btn-mute");n.addEventListener("click",()=>{let l=this.audio.toggleMute();n.textContent=l?"\u2715 \u0411\u0435\u0437 \u0437\u0432\u0443\u043A\u0430":"\u266A \u0417\u0432\u0443\u043A"});let r=document.getElementById("help-modal");document.getElementById("btn-help").addEventListener("click",()=>r.classList.toggle("hidden")),document.getElementById("help-close").addEventListener("click",()=>r.classList.add("hidden")),document.getElementById("help-start-btn").addEventListener("click",()=>{this.audio.unlock(),r.classList.add("hidden")});let o=document.getElementById("panel-body"),a=document.getElementById("btn-toggle-panel");a.addEventListener("click",()=>{let l=o.classList.toggle("hidden");a.textContent=l?"\u25B8":"\u25BE"}),document.getElementById("btn-loan").addEventListener("click",()=>{let l=this.economy.takeGreenLoan();l.ok?this.notify(`+ \u0412\u044B\u043F\u0443\u0449\u0435\u043D\u044B \u0437\u0435\u043B\u0451\u043D\u044B\u0435 \u043E\u0431\u043B\u0438\u0433\u0430\u0446\u0438\u0438 \u0413\u042D\u0421: +${l.amount.toLocaleString("ru-RU")} \u20BD`,"good"):this.notify(l.reason,"warn"),this._refreshHUD()}),document.getElementById("btn-repay").addEventListener("click",()=>{let l=this.economy.repayLoan();l.ok?this.notify(`\u041F\u043E\u0433\u0430\u0448\u0435\u043D\u0430 \u0447\u0430\u0441\u0442\u044C \u043E\u0431\u043B\u0438\u0433\u0430\u0446\u0438\u0439: -${l.amount.toLocaleString("ru-RU")} \u20BD`,"info"):this.notify(l.reason,"warn"),this._refreshHUD()}),document.getElementById("insp-close").addEventListener("click",()=>{this.selectedStruct=null,document.getElementById("struct-inspector").classList.add("hidden")}),document.getElementById("insp-slider").addEventListener("input",l=>{if(!this.selectedStruct)return;let c=Number(l.target.value)/100;this.selectedStruct.kind==="turbine"?(this.selectedStruct.throttle=c,this.selectedStruct.autoDispatch=!1,document.getElementById("insp-auto").checked=!1):(this.selectedStruct.openRatio=c,this.selectedStruct.autoRegulate=!1,document.getElementById("insp-auto").checked=!1,this.hydro._syncSpillwayGateCells(this.selectedStruct)),this._refreshInspector()}),document.getElementById("insp-auto").addEventListener("change",l=>{if(!this.selectedStruct)return;let c=l.target.checked;this.selectedStruct.kind==="turbine"?this.selectedStruct.autoDispatch=c:this.selectedStruct.autoRegulate=c,this._refreshInspector()}),document.getElementById("insp-clean-btn").addEventListener("click",()=>{this.selectedStruct&&this.selectedStruct.kind==="turbine"&&(this.selectedStruct.trashLoad=0,this.audio.playBuild(),this.notify("\u0421\u043E\u0440\u043E\u0443\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u044E\u0449\u0430\u044F \u0440\u0435\u0448\u0451\u0442\u043A\u0430 \u0432\u043E\u0434\u043E\u043F\u0440\u0438\u0451\u043C\u043D\u0438\u043A\u0430 \u043E\u0447\u0438\u0449\u0435\u043D\u0430 \u043E\u0442 \u043F\u043B\u0430\u0432\u043D\u0438\u043A\u0430 \u0438 \u0438\u043B\u0430!","good"),this._refreshInspector())}),window.addEventListener("keydown",l=>{if(this.isInPreGameLoader||l.target&&(l.target.tagName==="INPUT"||l.target.tagName==="SELECT"))return;if(l.code==="F3"){l.preventDefault(),this.showDiag=!this.showDiag,document.getElementById("diag-panel").classList.toggle("hidden",!this.showDiag);return}let c=l.key.toUpperCase();for(let h of _a)if(h.key===c){this.selectTool(h.id);return}l.code==="KeyV"||l.code==="Space"?(l.preventDefault(),this.cycleSpeed()):l.code==="KeyC"?this.toggleContours():l.code==="KeyR"?this.rotatePlacement():l.code==="KeyT"?document.getElementById("btn-tutorial").click():l.code==="KeyK"?e.click():l.code==="KeyM"?n.click():l.code==="KeyH"&&r.classList.toggle("hidden")}),this._renderCityCards(),this._refreshHUD()}selectTool(t){this.activeToolId=t,document.querySelectorAll(".tool-slot").forEach(e=>{e.classList.toggle("active",e.dataset.tool===t)}),this._updateToolHint()}_updateToolHint(){let t=_a.find(i=>i.id===this.activeToolId),e=document.getElementById("tool-hint");t&&e&&(e.textContent=`\u25B8 ${t.name}: ${t.desc}`)}rotatePlacement(){this.manualYaw===null?this.manualYaw=0:this.manualYaw+=Math.PI*.25,this.manualYaw>Math.PI*2&&(this.manualYaw=null),this.notify(this.manualYaw===null?"\u21BB \u0410\u0432\u0442\u043E-\u043E\u0440\u0438\u0435\u043D\u0442\u0430\u0446\u0438\u044F \u0441\u0442\u0432\u043E\u0440\u0430 \u043F\u043E \u0443\u043A\u043B\u043E\u043D\u0443 \u0432\u043E\u0434\u044B \u0432\u043A\u043B\u044E\u0447\u0435\u043D\u0430":`\u21BB \u0420\u0443\u0447\u043D\u043E\u0439 \u0443\u0433\u043E\u043B \u0441\u0442\u0432\u043E\u0440\u0430: ${Math.round(this.manualYaw*180/Math.PI)}\xB0`,"info")}cycleSpeed(){this.speedIndex=(this.speedIndex+1)%hc.length;let t=hc[this.speedIndex],e=document.getElementById("btn-speed");e.textContent=t===0?"\u23F8 \u041F\u0430\u0443\u0437\u0430":`\u25B6 \xD7${t}`,e.classList.toggle("active",t>1)}toggleContours(){this.showContours=!this.showContours,this.worldView.terrainMat.uniforms.uShowContours.value=this.showContours?1:0,document.getElementById("btn-contours").classList.toggle("active",this.showContours)}_bindWorldInput(){this.canvas.addEventListener("pointerdown",t=>{if(this.isInPreGameLoader||(this.audio.unlock(),t.button!==0)||this.camCtrl.touches.size>=2)return;let e=this.raycastValley(t.clientX,t.clientY);if(!e)return;let i=this.hydro.findStructureNear(e.wx,e.wz,13);if(i&&(this.activeToolId==="inspect"||t.altKey)){this.selectedStruct=i,document.getElementById("struct-inspector").classList.remove("hidden"),this._refreshInspector();return}if(this.activeToolId==="spillway"||this.activeToolId.startsWith("turbine_")||this.activeToolId==="powerline"||this.activeToolId==="demolish"||this.activeToolId==="inspect"){this._applySingleClickTool(e.wx,e.wz);return}this.pointerDown=!0,this.lastBrushWorld={wx:e.wx,wz:e.wz};let n=this.hydro.sampleAtWorld(e.wx,e.wz),r=Le.damHeightTiers[this.damTierIndex]?.addHeight||11.2;this.activeToolId==="canal_dig"?this.lockedGradeElev=t.shiftKey?n.bed-1.9:null:this.activeToolId==="concrete_dam"?this.lockedGradeElev=Math.max(n.bed,n.surface)+r:this.activeToolId==="earth_dam"?this.lockedGradeElev=Math.max(n.bed,n.surface)+4.2:this.lockedGradeElev=null,this._applyContinuousStrokePoint(e.wx,e.wz,0)}),window.addEventListener("pointermove",t=>{if(this.isInPreGameLoader)return;let e=this.raycastValley(t.clientX,t.clientY);this.hoverWorld=e;let i=Le.damHeightTiers[this.damTierIndex]?.addHeight||11.2;if(e?(this.worldView.updateCursor(e.wx,e.wz,this.brushRadius,this.activeToolId,this.manualYaw,i,!0),this._updateProbeBar(e.wx,e.wz)):this.worldView.updateCursor(0,0,this.brushRadius,this.activeToolId,this.manualYaw,i,!1),!this.pointerDown||!e||!this.lastBrushWorld||this.camCtrl.touches.size>=2)return;let n=e.wx-this.lastBrushWorld.wx,r=e.wz-this.lastBrushWorld.wz,o=Math.hypot(n,r),a=Math.max(2.4,this.brushRadius*.35);if(o<a)return;let l=Math.min(20,Math.ceil(o/a));for(let c=1;c<=l;c++){let h=c/l,d=ne(this.lastBrushWorld.wx,e.wx,h),u=ne(this.lastBrushWorld.wz,e.wz,h);this.activeToolId==="canal_dig"&&this.lockedGradeElev!==null&&(this.lockedGradeElev-=o/l*.005),this._applyContinuousStrokePoint(d,u,c)}this.lastBrushWorld={wx:e.wx,wz:e.wz}}),window.addEventListener("pointerup",()=>{this.pointerDown=!1,this.lastBrushWorld=null,this.lockedGradeElev=null})}_applyContinuousStrokePoint(t,e,i){let n=this.economy.cash,r=this.economy.creative;if(this.activeToolId==="canal_dig"){let o=this.hydro.excavateCanal(t,e,this.brushRadius,1.4,this.lockedGradeElev,n,r);if(o.excavatedM3>0){if(this.economy.spend(o.cost),i===0){this.audio.playDig();let a=this.hydro.sampleAtWorld(t,e);this.spray.spawnDigSplash(t,a.bed,e,8)}}else!r&&n<35&&i===0&&this.notify("\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0441\u0440\u0435\u0434\u0441\u0442\u0432 \u043D\u0430 \u0437\u0435\u043C\u043B\u044F\u043D\u044B\u0435 \u0440\u0430\u0431\u043E\u0442\u044B!","warn")}else if(this.activeToolId==="canal_liner"){let o=this.hydro.lineCanalConcrete(t,e,this.brushRadius,n,r);o.count>0&&(this.economy.spend(o.cost),i===0&&this.audio.playBuild())}else if(this.activeToolId==="earth_dam"){let o=this.hydro.buildEarthDam(t,e,this.brushRadius,1.85,this.lockedGradeElev,n,r);o.addedM3>0&&(this.economy.spend(o.cost),i===0&&this.audio.playDig())}else if(this.activeToolId==="concrete_dam"){let o=Le.damHeightTiers[this.damTierIndex]?.addHeight||11.2,a=this.lockedGradeElev??this.hydro.sampleAtWorld(t,e).bed+o,l=this.hydro.buildConcreteDam(t,e,this.brushRadius,a,n,r,!1);l.addedM3>0?(this.economy.spend(l.cost),i===0&&this.audio.playBuild()):!r&&n<180&&i===0&&this.notify("\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0441\u0440\u0435\u0434\u0441\u0442\u0432 \u043D\u0430 \u0431\u0435\u0442\u043E\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 (\u043C\u043E\u0436\u043D\u043E \u0432\u044B\u043F\u0443\u0441\u0442\u0438\u0442\u044C \u0437\u0435\u043B\u0451\u043D\u044B\u0435 \u043E\u0431\u043B\u0438\u0433\u0430\u0446\u0438\u0438 \u0441\u043F\u0440\u0430\u0432\u0430!)","warn")}else if(this.activeToolId==="foundation"){let o=this.hydro.reinforceFoundation(t,e,this.brushRadius,n,r);o.count>0?(this.economy.spend(o.cost),i===0&&this.audio.playBuild()):!r&&n<140&&i===0&&this.notify("\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0441\u0440\u0435\u0434\u0441\u0442\u0432 \u043D\u0430 \u0441\u043A\u0430\u043B\u044C\u043D\u0443\u044E \u0446\u0435\u043C\u0435\u043D\u0442\u0430\u0446\u0438\u044E \u0438 3D-\u043A\u043E\u043D\u0442\u0440\u0444\u043E\u0440\u0441\u044B!","warn")}}_applySingleClickTool(t,e){let i=this.economy.cash,n=this.economy.creative;if(this.activeToolId==="inspect"){let r=this.hydro.findStructureNear(t,e,16);r&&(this.selectedStruct=r,document.getElementById("struct-inspector").classList.remove("hidden"),this._refreshInspector());return}if(this.activeToolId==="spillway"){let r=this.hydro.placeSpillway(t,e,this.manualYaw,i,n);if(!r.ok){this.notify(r.reason,"warn");return}this.economy.spend(r.cost),this.audio.playBuild(),this.selectedStruct=r.structure,document.getElementById("struct-inspector").classList.remove("hidden"),this._refreshInspector(),this.notify("\u2248 \u0421\u043C\u043E\u043D\u0442\u0438\u0440\u043E\u0432\u0430\u043D \u0432\u043E\u0434\u043E\u0441\u0431\u0440\u043E\u0441 \u0441 \u043F\u043E\u0434\u044A\u0451\u043C\u043D\u044B\u043C \u0441\u0435\u0433\u043C\u0435\u043D\u0442\u043D\u044B\u043C \u0437\u0430\u0442\u0432\u043E\u0440\u043E\u043C \u0438 \u043D\u043E\u0441\u043A\u043E\u043C-\u0442\u0440\u0430\u043C\u043F\u043B\u0438\u043D\u043E\u043C!","good");return}if(this.activeToolId.startsWith("turbine_")){let r=this.activeToolId.replace("turbine_",""),o=this.hydro.placeTurbine(r,t,e,this.manualYaw,i,n);if(!o.ok){this.notify(o.reason,"warn");return}this.economy.spend(o.cost),this.audio.playBuild(),this.selectedStruct=o.structure,document.getElementById("struct-inspector").classList.remove("hidden"),this._refreshInspector(),this.notify(`\u2726 \u041F\u043E\u0441\u0442\u0440\u043E\u0435\u043D \u0433\u0438\u0434\u0440\u043E\u0443\u0437\u0435\u043B ${o.structure.spec.name} \u0441 \u0432\u043E\u0434\u043E\u043F\u0440\u0438\u0451\u043C\u043D\u0438\u043A\u043E\u043C \u0438 3D-\u0432\u043E\u0434\u043E\u0432\u043E\u0434\u043E\u043C!`,"good");return}if(this.activeToolId==="powerline"){let r=null,o=92;for(let l of this.economy.cities){let c=Math.hypot(l.x-t,l.z-e);c<o&&(o=c,r=l)}if(r){let l=this.economy.connectCityGrid(r.id);l.ok?this.audio.playBuild():this.notify(l.reason,"warn"),this._renderCityCards();return}let a=this.hydro.placeSubstation(t,e,i,n);if(!a.ok){this.notify(a.reason,"warn");return}this.economy.spend(a.cost),this.economy.powerLinesDirty=!0,this.audio.playBuild(),this.notify("\u2726 \u041F\u043E\u0441\u0442\u0440\u043E\u0435\u043D\u0430 \u0443\u0437\u043B\u043E\u0432\u0430\u044F 3D-\u043F\u043E\u0434\u0441\u0442\u0430\u043D\u0446\u0438\u044F \u041E\u0420\u0423 110 \u043A\u0412! \u041F\u043E\u0442\u0435\u0440\u0438 \u043F\u0435\u0440\u0435\u0434\u0430\u0447\u0438 \u0432 \u0441\u0435\u0442\u0438 \u0441\u043D\u0438\u0436\u0435\u043D\u044B \u0441 16% \u0434\u043E 3%!","good"),this._refreshHUD();return}if(this.activeToolId==="demolish"){let r=this.hydro.demolishAt(t,e);r.removed&&(this.economy.earn(r.refund),this.audio.playDig(),this.selectedStruct&&!this.hydro.turbines.includes(this.selectedStruct)&&!this.hydro.spillways.includes(this.selectedStruct)&&(this.selectedStruct=null,document.getElementById("struct-inspector").classList.add("hidden")),this.notify(r.refund>0?`\u0414\u0435\u043C\u043E\u043D\u0442\u0430\u0436 \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D (\u0432\u043E\u0437\u0432\u0440\u0430\u0442 +${r.refund.toLocaleString("ru-RU")} \u20BD)`:"\u0421\u0435\u043A\u0446\u0438\u044F \u0440\u0430\u0441\u0447\u0438\u0449\u0435\u043D\u0430","info"))}}_updateProbeBar(t,e){let i=this.hydro.sampleAtWorld(t,e),n=document.getElementById("probe-readout");if(!n)return;let r="";if(i.targetConcrete>i.concrete+.08){let l=Math.round(i.buildProgress*100);r=` \xB7 \u0421\u0442\u0440\u043E\u0439\u043A\u0430: ${l<35?"\u0428\u043F\u0443\u043D\u0442/\u041A\u043E\u0442\u043B\u043E\u0432\u0430\u043D":l<75?"\u0410\u0440\u043C\u043E\u043A\u0430\u0440\u043A\u0430\u0441 \u0438 \u043E\u043F\u0430\u043B\u0443\u0431\u043A\u0430":"\u0417\u0430\u043B\u0438\u0432\u043A\u0430 \u043C\u043E\u043D\u043E\u043B\u0438\u0442\u0430"} (${l}%)`}else i.reinforced&&(r=" \xB7 [\u041A\u043E\u043D\u0442\u0440\u0444\u043E\u0440\u0441 + \u0421\u043A\u0430\u043B\u0430]");let o=i.concrete>.8?"3D-\u041C\u043E\u043D\u043E\u043B\u0438\u0442 \u043F\u043B\u043E\u0442\u0438\u043D\u044B":i.lined?"\u0416/\u0411 \u043B\u043E\u0442\u043E\u043A \u043A\u0430\u043D\u0430\u043B\u0430":i.earthDam?"\u041D\u0430\u0441\u044B\u043F\u044C \u043F\u0435\u0440\u0435\u043C\u044B\u0447\u043A\u0438":i.soil<.75?"\u0421\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u0433\u0440\u0430\u043D\u0438\u0442":`\u0413\u0440\u0443\u043D\u0442 ${i.soil.toFixed(1)}\u043C`,a=i.depth<.03?"\u0441\u0443\u0445\u043E":i.froude>1?"Fr>1 \u0431\u0443\u0440\u043D\u044B\u0439":"\u0441\u043F\u043E\u043A\u043E\u0439\u043D\u044B\u0439";n.textContent=`\u0414\u043D\u043E: ${i.bed.toFixed(1)} \u043C (${o})${r} \xB7 \u0412\u043E\u0434\u0430: ${i.depth>.02?i.surface.toFixed(1)+" \u043C":"\u2014"} \xB7 H: ${i.depth.toFixed(2)} \u043C \xB7 V: ${i.speed.toFixed(2)} \u043C/\u0441 (${a})`}_renderCityCards(){let t=document.getElementById("cities-list");if(t){t.innerHTML="";for(let e of this.economy.cities){let i=document.createElement("div");i.className=`city-card${e.isFlooded?" flooded":""}`,i.id=`city-card-${e.id}`;let n=this.economy.estimatePowerLineCost(e),r=Math.round(e.growthProgress*100),o=e.connected?`\u25C8 ${e.suppliedMW.toFixed(2)} / ${e.currentDemandMW.toFixed(2)} \u041C\u0412\u0442`:`\u041D\u0435 \u0432 \u0441\u0435\u0442\u0438 (\u0441\u043F\u0440\u043E\u0441 ${e.currentDemandMW.toFixed(2)} \u041C\u0412\u0442)`,a="";e.isFlooded?a='<div class="city-note warn">! \u041A\u0432\u0430\u0440\u0442\u0430\u043B\u044B \u043F\u043E\u0434\u0442\u043E\u043F\u043B\u0435\u043D\u044B! \u0420\u043E\u0441\u0442 \u043E\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D</div>':e.needsIrrigation&&(a=e.irrigated?'<div class="city-note">\u25C8 \u041A\u0430\u043D\u0430\u043B \u043E\u0440\u043E\u0448\u0435\u043D\u0438\u044F \u0430\u043A\u0442\u0438\u0432\u0435\u043D (+110 \u20BD/\u0441, \u0440\u043E\u0441\u0442 \xD71.78)</div>':'<div class="city-note warn">\u25C8 \u041F\u043E\u0434\u0432\u0435\u0434\u0438\u0442\u0435 \u043A\u0430\u043D\u0430\u043B \u043A \u0437\u0435\u043B\u0451\u043D\u043E\u043C\u0443 \u043A\u043E\u043B\u044C\u0446\u0443 (+110 \u20BD/\u0441)</div>'),i.innerHTML=`
        <div class="city-top">
          <span class="city-name" data-flycity="${e.id}">\u25B8 ${e.name}</span>
          <span class="city-badge">${e.levelName} \xB7 ${e.buildingIndices.length} \u0437\u0434.</span>
        </div>
        <div class="city-meta">
          <span>\u041D\u0430\u0441.: ${e.population.toLocaleString("ru-RU")}</span>
          <span>${o}</span>
        </div>
        <div class="progress-track" title="\u041F\u0440\u043E\u0433\u0440\u0435\u0441\u0441 \u0441\u0430\u043C\u043E\u0441\u0442\u043E\u044F\u0442\u0435\u043B\u044C\u043D\u043E\u0439 \u0437\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u043A\u0432\u0430\u0440\u0442\u0430\u043B\u043E\u0432">
          <div class="progress-fill" style="width:${r}%"></div>
        </div>
        ${a}
        ${e.connected?"":`<div class="city-actions"><button class="connect-btn" data-connect="${e.id}">\u25C8 \u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u041B\u042D\u041F (${n.toLocaleString("ru-RU")} \u20BD)</button></div>`}
      `,t.appendChild(i)}t.querySelectorAll("[data-flycity]").forEach(e=>{e.addEventListener("click",()=>{let i=this.economy.cities.find(n=>n.id===e.dataset.flycity);i&&this.camCtrl.flyTo(i.x,i.z,128,i.baseElevation)})}),t.querySelectorAll("[data-connect]").forEach(e=>{e.addEventListener("click",()=>{let i=this.economy.connectCityGrid(e.dataset.connect);i.ok?this.audio.playBuild():this.notify(i.reason,"warn"),this._renderCityCards(),this._refreshHUD()})})}}_refreshHUD(){if(!this.economy)return;let t=this.economy.getSummary();document.getElementById("hud-cash").textContent=this.economy.creative?"\u221E \u041A\u0420\u0415\u0410\u0422\u0418\u0412":`${Math.round(t.cash).toLocaleString("ru-RU")} \u20BD`;let e=t.netPerSec>=0?"+":"",i=document.getElementById("hud-net");i.textContent=`${e}${Math.round(t.netPerSec).toLocaleString("ru-RU")} \u20BD/\u0441`,i.style.color=t.netPerSec>=0?"#4ade80":"#f87171",document.getElementById("hud-mw").textContent=`${t.totalMW.toFixed(2)} \u041C\u0412\u0442`,document.getElementById("hud-demand").textContent=`\u0421\u0435\u0442\u044C: ${t.suppliedCityMW.toFixed(2)}/${t.connectedDemandMW.toFixed(2)} \xB7 \u041F\u043E\u0442\u0435\u0440\u0438 ${t.gridLossPct}%`;let n=Math.floor(t.hour),r=Math.floor((t.hour-n)*60);document.getElementById("hud-clock").textContent=`\u0414\u0435\u043D\u044C ${t.day} \xB7 ${String(n).padStart(2,"0")}:${String(r).padStart(2,"0")}`,document.getElementById("hud-tariff").textContent=t.periodLabel,document.getElementById("chip-tariff").className=`stat-chip stat-tariff ${t.periodClass}`,document.getElementById("hud-weather").textContent=t.pendingPourM3>5?`\u25B2 \u0411\u0435\u0442\u043E\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435: ${Math.round(t.pendingPourM3)} \u043C\xB3`:`${t.weather.icon} ${t.weather.label}`,document.getElementById("hud-stockpile").textContent=`\u0413\u0440\u0443\u043D\u0442: ${Math.round(t.soilStockpileM3)} \xB7 \u0429\u0435\u0431\u0435\u043D\u044C: ${Math.round(t.rockStockpileM3)} \u043C\xB3`,document.getElementById("hud-pop-total").textContent=`\u041D\u0430\u0441\u0435\u043B\u0435\u043D\u0438\u0435 5 \u0433\u043E\u0440\u043E\u0434\u043E\u0432: ${t.totalPopulation.toLocaleString("ru-RU")} \u0436\u0438\u0442.`,document.getElementById("hud-loan").textContent=`\u0414\u043E\u043B\u0433 \u043F\u043E \u043E\u0431\u043B\u0438\u0433\u0430\u0446\u0438\u044F\u043C: ${Math.round(t.loan).toLocaleString("ru-RU")} \u20BD`;let o=document.getElementById("dam-health-banner"),a=document.getElementById("hud-dam-status");t.pendingPourM3>5?(o.className="dam-health-banner warn",a.textContent=`\u041A\u0440\u0430\u043D\u044B \u043D\u0430 \u043E\u0431\u044A\u0435\u043A\u0442\u0435: \u043E\u0441\u0442\u0430\u043B\u043E\u0441\u044C \u0437\u0430\u043B\u0438\u0442\u044C ${Math.round(t.pendingPourM3)} \u043C\xB3 \u0431\u0435\u0442\u043E\u043D\u0430`):t.seepageQ>1.5||t.maxDamStress>78?(o.className="dam-health-banner warn",a.textContent=`\u041D\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u043F\u043B\u043E\u0442\u0438\u043D\u044B ${Math.round(t.maxDamStress)}% \xB7 \u0424\u0438\u043B\u044C\u0442\u0440\u0430\u0446\u0438\u044F! \u0421\u0442\u0430\u0432\u044C\u0442\u0435 [6] \u041A\u043E\u043D\u0442\u0440\u0444\u043E\u0440\u0441`):(o.className="dam-health-banner",a.textContent=`\u041D\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u043F\u043B\u043E\u0442\u0438\u043D\u044B: ${Math.round(t.maxDamStress)}% \xB7 \u041A\u043E\u043D\u0442\u0440\u0444\u043E\u0440\u0441\u044B: ${this.hydro.reinforcedCellCount} \xB7 \u041E\u0420\u0423: ${t.substationsCount}`);let l=cr.find(c=>!this.economy.completedMilestones.has(c.id));l?(document.getElementById("ms-title").textContent=`${l.title} (+${l.reward.toLocaleString("ru-RU")} \u20BD)`,document.getElementById("ms-desc").textContent=l.desc):(document.getElementById("ms-title").textContent="\u0412\u0441\u0435 \u0433\u043E\u0441\u0443\u0434\u0430\u0440\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0435 \u0433\u0440\u0430\u043D\u0442\u044B \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u044B!",document.getElementById("ms-desc").textContent="\u0412\u0430\u0448 \u043A\u0430\u0441\u043A\u0430\u0434 \u0413\u042D\u0421 \u0441\u0442\u0430\u043B \u044D\u043D\u0435\u0440\u0433\u0435\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u043C \u0441\u0435\u0440\u0434\u0446\u0435\u043C \u0434\u043E\u043B\u0438\u043D\u044B."),this._renderCityCards(),this.selectedStruct&&this._refreshInspector()}_refreshInspector(){let t=this.selectedStruct;if(!t)return;let e=document.getElementById("insp-title"),i=document.getElementById("insp-metrics"),n=document.getElementById("insp-slider"),r=document.getElementById("insp-slider-label"),o=document.getElementById("insp-auto"),a=document.getElementById("insp-auto-label"),l=document.getElementById("insp-clean-btn");if(t.kind==="turbine"){e.textContent=`\u2699 ${t.spec.name} (#${t.id})`;let c=Math.round((t.trashLoad||0)*100);i.innerHTML=`
        <span>\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C: <b>${t.powerMW.toFixed(2)} \u041C\u0412\u0442</b></span>
        <span>\u041D\u0430\u043F\u043E\u0440 \u0447\u0438\u0441\u0442.: <b>${t.netHead.toFixed(1)} \u043C</b></span>
        <span>\u0420\u0430\u0441\u0445\u043E\u0434 Q: <b>${t.flowQ.toFixed(1)} \u043C\xB3/\u0441</b></span>
        <span>\u041A\u041F\u0414 \u03B7: <b>${Math.round(t.efficiency*100)}%</b></span>
        <span>\u0420\u0435\u0448\u0451\u0442\u043A\u0430: <b>${c>4?`\u0437\u0430\u0441\u043E\u0440 ${c}%`:"\u0447\u0438\u0441\u0442\u0430\u044F"}</b></span>
        <span>\u041A\u0430\u0432\u0438\u0442\u0430\u0446\u0438\u044F: <b>${t.cavitation>.2?"\u25B2 \u0435\u0441\u0442\u044C":"\u043D\u043E\u0440\u043C\u0430"}</b></span>
      `;let h=Math.round(t.throttle*100);n.value=h,r.textContent=`\u041E\u0442\u043A\u0440\u044B\u0442\u0438\u0435 \u043D\u0430\u043F\u0440\u0430\u0432\u043B\u044F\u044E\u0449\u0435\u0433\u043E \u0430\u043F\u043F\u0430\u0440\u0430\u0442\u0430: ${h}%`,o.checked=!!t.autoDispatch,a.textContent="\u0410\u0432\u0442\u043E-\u0434\u0438\u0441\u043F\u0435\u0442\u0447\u0435\u0440 \u043F\u043E \u043F\u0438\u043A\u0430\u043C \u0440\u044B\u043D\u043A\u0430 + \u0441\u043E\u0440\u043E\u043E\u0447\u0438\u0441\u0442\u043A\u0430",l.classList.toggle("hidden",c<=2)}else{e.textContent=`\u2248 \u0412\u043E\u0434\u043E\u0441\u0431\u0440\u043E\u0441 \u0441 \u0442\u0440\u0430\u043C\u043F\u043B\u0438\u043D\u043E\u043C (#${t.id})`,i.innerHTML=`
        <span>\u0421\u0431\u0440\u043E\u0441 Q: <b>${t.currentFlowQ.toFixed(1)} \u043C\xB3/\u0441</b></span>
        <span>\u0421\u043A\u043E\u0440\u043E\u0441\u0442\u044C \u0441\u0442\u0440\u0443\u0438: <b>${t.jetSpeed.toFixed(1)} \u043C/\u0441</b></span>
        <span>\u041E\u0442\u043C\u0435\u0442\u043A\u0430 \u043F\u043E\u0440\u043E\u0433\u0430: <b>${t.sillElev.toFixed(1)} \u043C</b></span>
        <span>\u0423\u0441\u0442\u0430\u0432\u043A\u0430 \u0431\u044C\u0435\u0444\u0430: <b>${t.targetHeadElev.toFixed(1)} \u043C</b></span>
      `;let c=Math.round(t.openRatio*100);n.value=c,r.textContent=`\u041F\u043E\u0434\u044A\u0451\u043C \u0441\u0435\u0433\u043C\u0435\u043D\u0442\u043D\u043E\u0433\u043E \u0437\u0430\u0442\u0432\u043E\u0440\u0430: ${c}%`,o.checked=!!t.autoRegulate,a.textContent="\u0410\u0432\u0442\u043E-\u0441\u0431\u0440\u043E\u0441 \u043F\u0430\u0432\u043E\u0434\u043A\u0430 \u043F\u0440\u0438 \u043F\u0435\u0440\u0435\u043F\u043E\u043B\u043D\u0435\u043D\u0438\u0438 \u0431\u044C\u0435\u0444\u0430",l.classList.add("hidden")}}notify(t,e="info"){let i=document.getElementById("toast-stack");if(!i)return;let n=document.createElement("div");for(n.className=`toast ${e}`,n.textContent=t,i.prepend(n);i.children.length>4;)i.lastElementChild.remove();setTimeout(()=>{n.parentNode&&n.remove()},5200)}_loop(t){requestAnimationFrame(h=>this._loop(h));let e=Math.min(.08,Math.max(.001,(t-this._lastTime)/1e3));if(this._lastTime=t,this._frameCount++,this._fpsFrames++,this._fpsAccum+=e,this._fpsAccum>=.5&&(this.fps=Math.round(this._fpsFrames/this._fpsAccum),this._fpsFrames=0,this._fpsAccum=0),this.isInPreGameLoader){this.hydro.step(e*.75,4);let h=this.hydro.sampleAtWorld(this.camCtrl.goalTarget.x,this.camCtrl.goalTarget.z).bed;this.camCtrl.updatePreviewOrbit(e,h);let d=ei[this.economy.weatherId]||ei.normal;this.worldView.updateAtmosphere(this.economy.hour,d),this.worldView.updateWaterAndWetness(this.hydro.simTime),this.renderer.shadowMap.enabled&&this._frameCount%6===0&&(this.renderer.shadowMap.needsUpdate=!0),this.renderer.render(this.scene,this.camera);return}let i=hc[this.speedIndex];if(i>0){let h=i<=2?1:2,d=e*i/h;for(let u=0;u<h;u++)this.hydro.step(d,this.profile.substepsCap);this.economy.update(e*i)}let n=this.hydro.sampleAtWorld(this.camCtrl.goalTarget.x,this.camCtrl.goalTarget.z).bed;this.camCtrl.update(e,n);let r=ei[this.economy.weatherId]||ei.normal,{dayFactor:o}=this.worldView.updateAtmosphere(this.economy.hour,r),a=this.hydro.consumeTerrainDirty();a&&(this.worldView.updateTerrainGeometryRect(a.x0,a.z0,a.x1,a.z1),this.renderer.shadowMap.enabled&&(this.renderer.shadowMap.needsUpdate=!0)),this.worldView.updateWaterAndWetness(this.hydro.simTime),this.worldView.syncEngineeredVolumes(),this.worldView.animateConstructionCranes(this.hydro.simTime),this.worldView.syncHydroStructures(),(this.economy.buildingsDirty||this._frameCount%12===0)&&(this.worldView.syncCityInstances(),this.economy.buildingsDirty=!1,this.renderer.shadowMap.enabled&&this.profile.shadowEvery>0&&this._frameCount%30===0&&(this.renderer.shadowMap.needsUpdate=!0));let l=this.economy.weatherId==="flood"?1:this.economy.weatherId==="rain"?.6:0;this.spray.update(e*Math.max(1,Math.min(2,i)),this.hydro,this.camCtrl.target,o,l);let c=0;for(let h of this.hydro.spillways)c+=h.currentFlowQ;if(this.audio.updateContinuous(this.camCtrl.distance,c,this.economy.totalMW),this.renderer.shadowMap.enabled&&this.profile.shadowEvery>0&&this._frameCount%this.profile.shadowEvery===0&&(this.renderer.shadowMap.needsUpdate=!0),this.renderer.render(this.scene,this.camera),this._uiRefreshAccum+=e,this._uiRefreshAccum>=.25&&(this._uiRefreshAccum=0,this.tutorial.update(),this._refreshHUD(),this.showDiag)){let h=document.getElementById("diag-panel");h.textContent=yu({fps:this.fps,hydroMs:this.hydro.lastStepMs,grid:`${this.hydro.grid}\xD7${this.hydro.grid} (${Qt.size}\xD7${Qt.size}\u043C)`,activeTiles:this.hydro.activeTileCount,totalTiles:this.hydro.totalTiles,substeps:this.hydro.lastSubsteps,waterVolumeM3:this.hydro.totalWaterVolumeM3,drawCalls:this.renderer.info.render.calls,triangles:this.renderer.info.render.triangles,cityBuildings:this.economy.allBuildings.length,shadows:this.renderer.shadowMap.enabled?`\u0432\u043A\u043B (1/${this.profile.shadowEvery} \u043A\u0430\u0434\u0440\u0430)`:"\u0432\u044B\u043A\u043B"})}}};window.addEventListener("DOMContentLoaded",()=>{window.__game=new uc});})();
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2026 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
