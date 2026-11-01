(()=>{var Nh=0,ql=1,Uh=2;var pr=1,Fh=2,ds=3,dn=0,Ve=1,Pe=2,Fi=0,fs=1,$l=2,Yl=3,Zl=4,Oh=5;var In=100,kh=101,Bh=102,zh=103,Hh=104,Gh=200,Vh=201,Wh=202,Xh=203,Jl=204,Kl=205,qh=206,$h=207,Yh=208,Zh=209,Jh=210,Kh=211,jh=212,Qh=213,tu=214,oa=0,la=1,ca=2,ts=3,ha=4,ua=5,da=6,fa=7,jl=0,eu=1,iu=2,wi=0,Ql=1,tc=2,ec=3,mr=4,ic=5,nc=6,sc=7;var rc=300,fn=301,Ln=302,Va=303,Wa=304,gr=306,an=1e3,Ii=1001,pa=1002,He=1003,nu=1004;var xr=1005;var Ge=1006,Xa=1007;var pn=1008;var si=1009,ac=1010,oc=1011,ps=1012,qa=1013,Ti=1014,pi=1015,Ai=1016,$a=1017,Ya=1018,ms=1020,lc=35902,cc=35899,hc=1021,uc=1022,mi=1023,Li=1026,mn=1027,Za=1028,Ja=1029,gn=1030,Ka=1031;var ja=1033,_r=33776,vr=33777,yr=33778,Mr=33779,Qa=35840,to=35841,eo=35842,io=35843,no=36196,so=37492,ro=37496,ao=37488,oo=37489,br=37490,lo=37491,co=37808,ho=37809,uo=37810,fo=37811,po=37812,mo=37813,go=37814,xo=37815,_o=37816,vo=37817,yo=37818,Mo=37819,bo=37820,So=37821,Eo=36492,wo=36494,To=36495,Ao=36283,Ro=36284,Sr=36285,Co=36286;var Os=2300,ma=2301,ra=2302,Nl=2303,Ul=2400,Fl=2401,Ol=2402;var su=3200;var Po=0,ru=1,Yi="",Se="srgb",ks="srgb-linear",Bs="linear",de="srgb";var aa=7680;var au=519,ou=512,lu=513,cu=514,Io=515,hu=516,uu=517,Lo=518,du=519,fu=35044;var dc="300 es",Si=2e3,es=2001;function Pd(n){for(let t=n.length-1;t>=0;--t)if(n[t]>=65535)return!0;return!1}function Id(n){return ArrayBuffer.isView(n)&&!(n instanceof DataView)}function zs(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function pu(){let n=zs("canvas");return n.style.display="block",n}var nh={},is=null;function fc(...n){let t="THREE."+n.shift();is?is("log",t,...n):console.log(t,...n)}function mu(n){let t=n[0];if(typeof t=="string"&&t.startsWith("TSL:")){let e=n[1];e&&e.isStackTrace?n[0]+=" "+e.getLocation():n[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return n}function Gt(...n){n=mu(n);let t="THREE."+n.shift();if(is)is("warn",t,...n);else{let e=n[0];e&&e.isStackTrace?console.warn(e.getError(t)):console.warn(t,...n)}}function Wt(...n){n=mu(n);let t="THREE."+n.shift();if(is)is("error",t,...n);else{let e=n[0];e&&e.isStackTrace?console.error(e.getError(t)):console.error(t,...n)}}function wn(...n){let t=n.join(" ");t in nh||(nh[t]=!0,Gt(...n))}function gu(n,t,e){return new Promise(function(i,s){function r(){switch(n.clientWaitSync(t,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:s();break;case n.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:i()}}setTimeout(r,e)})}var xu={[oa]:la,[ca]:da,[ha]:fa,[ts]:ua,[la]:oa,[da]:ca,[fa]:ha,[ua]:ts},Di=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let i=this._listeners;i[t]===void 0&&(i[t]=[]),i[t].indexOf(e)===-1&&i[t].push(e)}hasEventListener(t,e){let i=this._listeners;return i===void 0?!1:i[t]!==void 0&&i[t].indexOf(e)!==-1}removeEventListener(t,e){let i=this._listeners;if(i===void 0)return;let s=i[t];if(s!==void 0){let r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){let e=this._listeners;if(e===void 0)return;let i=e[t.type];if(i!==void 0){t.target=this;let s=i.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,t);t.target=null}}},$e=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var ll=Math.PI/180,ga=180/Math.PI;function gs(){let n=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return($e[n&255]+$e[n>>8&255]+$e[n>>16&255]+$e[n>>24&255]+"-"+$e[t&255]+$e[t>>8&255]+"-"+$e[t>>16&15|64]+$e[t>>24&255]+"-"+$e[e&63|128]+$e[e>>8&255]+"-"+$e[e>>16&255]+$e[e>>24&255]+$e[i&255]+$e[i>>8&255]+$e[i>>16&255]+$e[i>>24&255]).toLowerCase()}function jt(n,t,e){return Math.max(t,Math.min(e,n))}function Ld(n,t){return(n%t+t)%t}function cl(n,t,e){return(1-e)*n+e*t}function As(n,t){switch(t.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:case Uint8ClampedArray:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function ei(n,t){switch(t.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var dt=class n{static{n.prototype.isVector2=!0}constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,i=this.y,s=t.elements;return this.x=s[0]*e+s[3]*i+s[6],this.y=s[1]*e+s[4]*i+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=jt(this.x,t.x,e.x),this.y=jt(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=jt(this.x,t,e),this.y=jt(this.y,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(jt(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let i=this.dot(t)/e;return Math.acos(jt(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,i=this.y-t.y;return e*e+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let i=Math.cos(e),s=Math.sin(e),r=this.x-t.x,a=this.y-t.y;return this.x=r*i-a*s+t.x,this.y=r*s+a*i+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Ni=class{constructor(t=0,e=0,i=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=i,this._w=s}static slerpFlat(t,e,i,s,r,a,o){let l=i[s+0],c=i[s+1],h=i[s+2],d=i[s+3],u=r[a+0],f=r[a+1],m=r[a+2],y=r[a+3];if(d!==y||l!==u||c!==f||h!==m){let g=l*u+c*f+h*m+d*y;g<0&&(u=-u,f=-f,m=-m,y=-y,g=-g);let p=1-o;if(g<.9995){let M=Math.acos(g),w=Math.sin(M);p=Math.sin(p*M)/w,o=Math.sin(o*M)/w,l=l*p+u*o,c=c*p+f*o,h=h*p+m*o,d=d*p+y*o}else{l=l*p+u*o,c=c*p+f*o,h=h*p+m*o,d=d*p+y*o;let M=1/Math.sqrt(l*l+c*c+h*h+d*d);l*=M,c*=M,h*=M,d*=M}}t[e]=l,t[e+1]=c,t[e+2]=h,t[e+3]=d}static multiplyQuaternionsFlat(t,e,i,s,r,a){let o=i[s],l=i[s+1],c=i[s+2],h=i[s+3],d=r[a],u=r[a+1],f=r[a+2],m=r[a+3];return t[e]=o*m+h*d+l*f-c*u,t[e+1]=l*m+h*u+c*d-o*f,t[e+2]=c*m+h*f+o*u-l*d,t[e+3]=h*m-o*d-l*u-c*f,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,i,s){return this._x=t,this._y=e,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let i=t._x,s=t._y,r=t._z,a=t._order,o=Math.cos,l=Math.sin,c=o(i/2),h=o(s/2),d=o(r/2),u=l(i/2),f=l(s/2),m=l(r/2);switch(a){case"XYZ":this._x=u*h*d+c*f*m,this._y=c*f*d-u*h*m,this._z=c*h*m+u*f*d,this._w=c*h*d-u*f*m;break;case"YXZ":this._x=u*h*d+c*f*m,this._y=c*f*d-u*h*m,this._z=c*h*m-u*f*d,this._w=c*h*d+u*f*m;break;case"ZXY":this._x=u*h*d-c*f*m,this._y=c*f*d+u*h*m,this._z=c*h*m+u*f*d,this._w=c*h*d-u*f*m;break;case"ZYX":this._x=u*h*d-c*f*m,this._y=c*f*d+u*h*m,this._z=c*h*m-u*f*d,this._w=c*h*d+u*f*m;break;case"YZX":this._x=u*h*d+c*f*m,this._y=c*f*d+u*h*m,this._z=c*h*m-u*f*d,this._w=c*h*d-u*f*m;break;case"XZY":this._x=u*h*d-c*f*m,this._y=c*f*d-u*h*m,this._z=c*h*m+u*f*d,this._w=c*h*d+u*f*m;break;default:Gt("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let i=e/2,s=Math.sin(i);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,i=e[0],s=e[4],r=e[8],a=e[1],o=e[5],l=e[9],c=e[2],h=e[6],d=e[10],u=i+o+d;if(u>0){let f=.5/Math.sqrt(u+1);this._w=.25/f,this._x=(h-l)*f,this._y=(r-c)*f,this._z=(a-s)*f}else if(i>o&&i>d){let f=2*Math.sqrt(1+i-o-d);this._w=(h-l)/f,this._x=.25*f,this._y=(s+a)/f,this._z=(r+c)/f}else if(o>d){let f=2*Math.sqrt(1+o-i-d);this._w=(r-c)/f,this._x=(s+a)/f,this._y=.25*f,this._z=(l+h)/f}else{let f=2*Math.sqrt(1+d-i-o);this._w=(a-s)/f,this._x=(r+c)/f,this._y=(l+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let i=t.dot(e)+1;return i<1e-8?(i=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=i):(this._x=0,this._y=-t.z,this._z=t.y,this._w=i)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=i),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(jt(this.dot(t),-1,1)))}rotateTowards(t,e){let i=this.angleTo(t);if(i===0)return this;let s=Math.min(1,e/i);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let i=t._x,s=t._y,r=t._z,a=t._w,o=e._x,l=e._y,c=e._z,h=e._w;return this._x=i*h+a*o+s*c-r*l,this._y=s*h+a*l+r*o-i*c,this._z=r*h+a*c+i*l-s*o,this._w=a*h-i*o-s*l-r*c,this._onChangeCallback(),this}slerp(t,e){let i=t._x,s=t._y,r=t._z,a=t._w,o=this.dot(t);o<0&&(i=-i,s=-s,r=-r,a=-a,o=-o);let l=1-e;if(o<.9995){let c=Math.acos(o),h=Math.sin(c);l=Math.sin(l*c)/h,e=Math.sin(e*c)/h,this._x=this._x*l+i*e,this._y=this._y*l+s*e,this._z=this._z*l+r*e,this._w=this._w*l+a*e,this._onChangeCallback()}else this._x=this._x*l+i*e,this._y=this._y*l+s*e,this._z=this._z*l+r*e,this._w=this._w*l+a*e,this.normalize();return this}slerpQuaternions(t,e,i){return this.copy(t).slerp(e,i)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},D=class n{static{n.prototype.isVector3=!0}constructor(t=0,e=0,i=0){this.x=t,this.y=e,this.z=i}set(t,e,i){return i===void 0&&(i=this.z),this.x=t,this.y=e,this.z=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(sh.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(sh.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,i=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*i+r[6]*s,this.y=r[1]*e+r[4]*i+r[7]*s,this.z=r[2]*e+r[5]*i+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,i=this.y,s=this.z,r=t.elements,a=1/(r[3]*e+r[7]*i+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*i+r[8]*s+r[12])*a,this.y=(r[1]*e+r[5]*i+r[9]*s+r[13])*a,this.z=(r[2]*e+r[6]*i+r[10]*s+r[14])*a,this}applyQuaternion(t){let e=this.x,i=this.y,s=this.z,r=t.x,a=t.y,o=t.z,l=t.w,c=2*(a*s-o*i),h=2*(o*e-r*s),d=2*(r*i-a*e);return this.x=e+l*c+a*d-o*h,this.y=i+l*h+o*c-r*d,this.z=s+l*d+r*h-a*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,i=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*i+r[8]*s,this.y=r[1]*e+r[5]*i+r[9]*s,this.z=r[2]*e+r[6]*i+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=jt(this.x,t.x,e.x),this.y=jt(this.y,t.y,e.y),this.z=jt(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=jt(this.x,t,e),this.y=jt(this.y,t,e),this.z=jt(this.z,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(jt(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let i=t.x,s=t.y,r=t.z,a=e.x,o=e.y,l=e.z;return this.x=s*l-r*o,this.y=r*a-i*l,this.z=i*o-s*a,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let i=t.dot(this)/e;return this.copy(t).multiplyScalar(i)}projectOnPlane(t){return hl.copy(this).projectOnVector(t),this.sub(hl)}reflect(t){return this.sub(hl.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let i=this.dot(t)/e;return Math.acos(jt(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,i=this.y-t.y,s=this.z-t.z;return e*e+i*i+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,i){let s=Math.sin(e)*t;return this.x=s*Math.sin(i),this.y=Math.cos(e)*t,this.z=s*Math.cos(i),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,i){return this.x=t*Math.sin(e),this.y=i,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),i=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=i,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,i=Math.sqrt(1-e*e);return this.x=i*Math.cos(t),this.y=e,this.z=i*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},hl=new D,sh=new Ni,$t=class n{static{n.prototype.isMatrix3=!0}constructor(t,e,i,s,r,a,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,i,s,r,a,o,l,c)}set(t,e,i,s,r,a,o,l,c){let h=this.elements;return h[0]=t,h[1]=s,h[2]=o,h[3]=e,h[4]=r,h[5]=l,h[6]=i,h[7]=a,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],this}extractBasis(t,e,i){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let i=t.elements,s=e.elements,r=this.elements,a=i[0],o=i[3],l=i[6],c=i[1],h=i[4],d=i[7],u=i[2],f=i[5],m=i[8],y=s[0],g=s[3],p=s[6],M=s[1],w=s[4],x=s[7],E=s[2],S=s[5],R=s[8];return r[0]=a*y+o*M+l*E,r[3]=a*g+o*w+l*S,r[6]=a*p+o*x+l*R,r[1]=c*y+h*M+d*E,r[4]=c*g+h*w+d*S,r[7]=c*p+h*x+d*R,r[2]=u*y+f*M+m*E,r[5]=u*g+f*w+m*S,r[8]=u*p+f*x+m*R,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],i=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8];return e*a*h-e*o*c-i*r*h+i*o*l+s*r*c-s*a*l}invert(){let t=this.elements,e=t[0],i=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8],d=h*a-o*c,u=o*l-h*r,f=c*r-a*l,m=e*d+i*u+s*f;if(m===0)return this.set(0,0,0,0,0,0,0,0,0);let y=1/m;return t[0]=d*y,t[1]=(s*c-h*i)*y,t[2]=(o*i-s*a)*y,t[3]=u*y,t[4]=(h*e-s*l)*y,t[5]=(s*r-o*e)*y,t[6]=f*y,t[7]=(i*l-c*e)*y,t[8]=(a*e-i*r)*y,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,i,s,r,a,o){let l=Math.cos(r),c=Math.sin(r);return this.set(i*l,i*c,-i*(l*a+c*o)+a+t,-s*c,s*l,-s*(-c*a+l*o)+o+e,0,0,1),this}scale(t,e){return wn("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(ul.makeScale(t,e)),this}rotate(t){return wn("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(ul.makeRotation(-t)),this}translate(t,e){return wn("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(ul.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,i,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,i=t.elements;for(let s=0;s<9;s++)if(e[s]!==i[s])return!1;return!0}fromArray(t,e=0){for(let i=0;i<9;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){let i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t}clone(){return new this.constructor().fromArray(this.elements)}},ul=new $t,rh=new $t().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),ah=new $t().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Dd(){let n={enabled:!0,workingColorSpace:ks,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===de&&(s.r=Xi(s.r),s.g=Xi(s.g),s.b=Xi(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===de&&(s.r=Qn(s.r),s.g=Qn(s.g),s.b=Qn(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Yi?Bs:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return wn("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),n.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return wn("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),n.colorSpaceToWorking(s,r)}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],i=[.3127,.329];return n.define({[ks]:{primaries:t,whitePoint:i,transfer:Bs,toXYZ:rh,fromXYZ:ah,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:Se},outputColorSpaceConfig:{drawingBufferColorSpace:Se}},[Se]:{primaries:t,whitePoint:i,transfer:de,toXYZ:rh,fromXYZ:ah,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:Se}}}),n}var ne=Dd();function Xi(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function Qn(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}var Bn,xa=class{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let i;if(t instanceof HTMLCanvasElement)i=t;else{Bn===void 0&&(Bn=zs("canvas")),Bn.width=t.width,Bn.height=t.height;let s=Bn.getContext("2d");t instanceof ImageData?s.putImageData(t,0,0):s.drawImage(t,0,0,t.width,t.height),i=Bn}return i.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=zs("canvas");e.width=t.width,e.height=t.height;let i=e.getContext("2d");i.drawImage(t,0,0,t.width,t.height);let s=i.getImageData(0,0,t.width,t.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=Xi(r[a]/255)*255;return i.putImageData(s,0,0),e}else if(t.data){let e=t.data.slice(0);for(let i=0;i<e.length;i++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[i]=Math.floor(Xi(e[i]/255)*255):e[i]=Xi(e[i]);return{data:e,width:t.width,height:t.height}}else return Gt("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},Nd=0,ns=class{constructor(t=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Nd++}),this.uuid=gs(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let e=this.data;return typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):typeof VideoFrame<"u"&&e instanceof VideoFrame?t.set(e.displayWidth,e.displayHeight,0):e!==null?t.set(e.width,e.height,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(dl(s[a].image)):r.push(dl(s[a]))}else r=dl(s);i.url=r}return e||(t.images[this.uuid]=i),i}};function dl(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?xa.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(Gt("Texture: Unable to serialize Texture."),{})}var Ud=0,fl=new D,Qe=class n extends Di{constructor(t=n.DEFAULT_IMAGE,e=n.DEFAULT_MAPPING,i=Ii,s=Ii,r=Ge,a=pn,o=mi,l=si,c=n.DEFAULT_ANISOTROPY,h=Yi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Ud++}),this.uuid=gs(),this.name="",this.source=new ns(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new dt(0,0),this.repeat=new dt(1,1),this.center=new dt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new $t,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(fl).x}get height(){return this.source.getSize(fl).y}get depth(){return this.source.getSize(fl).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let e in t){let i=t[e];if(i===void 0){Gt(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){Gt(`Texture.setValues(): property '${e}' does not exist.`);continue}s&&i&&s.isVector2&&i.isVector2||s&&i&&s.isVector3&&i.isVector3||s&&i&&s.isMatrix3&&i.isMatrix3?s.copy(i):this[e]=i}}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),e||(t.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==rc)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case an:t.x=t.x-Math.floor(t.x);break;case Ii:t.x=t.x<0?0:1;break;case pa:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case an:t.y=t.y-Math.floor(t.y);break;case Ii:t.y=t.y<0?0:1;break;case pa:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};Qe.DEFAULT_IMAGE=null;Qe.DEFAULT_MAPPING=rc;Qe.DEFAULT_ANISOTROPY=1;var Ee=class n{static{n.prototype.isVector4=!0}constructor(t=0,e=0,i=0,s=1){this.x=t,this.y=e,this.z=i,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,i,s){return this.x=t,this.y=e,this.z=i,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,i=this.y,s=this.z,r=this.w,a=t.elements;return this.x=a[0]*e+a[4]*i+a[8]*s+a[12]*r,this.y=a[1]*e+a[5]*i+a[9]*s+a[13]*r,this.z=a[2]*e+a[6]*i+a[10]*s+a[14]*r,this.w=a[3]*e+a[7]*i+a[11]*s+a[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,i,s,r,l=t.elements,c=l[0],h=l[4],d=l[8],u=l[1],f=l[5],m=l[9],y=l[2],g=l[6],p=l[10];if(Math.abs(h-u)<.01&&Math.abs(d-y)<.01&&Math.abs(m-g)<.01){if(Math.abs(h+u)<.1&&Math.abs(d+y)<.1&&Math.abs(m+g)<.1&&Math.abs(c+f+p-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let w=(c+1)/2,x=(f+1)/2,E=(p+1)/2,S=(h+u)/4,R=(d+y)/4,v=(m+g)/4;return w>x&&w>E?w<.01?(i=0,s=.707106781,r=.707106781):(i=Math.sqrt(w),s=S/i,r=R/i):x>E?x<.01?(i=.707106781,s=0,r=.707106781):(s=Math.sqrt(x),i=S/s,r=v/s):E<.01?(i=.707106781,s=.707106781,r=0):(r=Math.sqrt(E),i=R/r,s=v/r),this.set(i,s,r,e),this}let M=Math.sqrt((g-m)*(g-m)+(d-y)*(d-y)+(u-h)*(u-h));return Math.abs(M)<.001&&(M=1),this.x=(g-m)/M,this.y=(d-y)/M,this.z=(u-h)/M,this.w=Math.acos((c+f+p-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=jt(this.x,t.x,e.x),this.y=jt(this.y,t.y,e.y),this.z=jt(this.z,t.z,e.z),this.w=jt(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=jt(this.x,t,e),this.y=jt(this.y,t,e),this.z=jt(this.z,t,e),this.w=jt(this.w,t,e),this}clampLength(t,e){let i=this.length();return this.divideScalar(i||1).multiplyScalar(jt(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this.w=t.w+(e.w-t.w)*i,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},_a=class extends Di{constructor(t=1,e=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Ge,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},i),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=i.depth,this.scissor=new Ee(0,0,t,e),this.scissorTest=!1,this.viewport=new Ee(0,0,t,e),this.textures=[];let s={width:t,height:e,depth:i.depth},r=new Qe(s),a=i.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveColorBuffer=i.resolveColorBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this.storeMultisampledColorBuffer=i.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=i.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=i.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview,this.useArrayDepthTexture=i.useArrayDepthTexture}_setTextureOptions(t={}){let e={minFilter:Ge,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),t!==null&&t.renderTarget===null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,i=1){if(this.width!==t||this.height!==e||this.depth!==i){this.width=t,this.height=e,this.depth=i;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=i,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,i=t.textures.length;e<i;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;let s=Object.assign({},t.textures[e].image);this.textures[e].source=new ns(s)}if(this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveColorBuffer=t.resolveColorBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,this.storeMultisampledColorBuffer=t.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=t.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=t.storeMultisampledStencilBuffer,t.depthTexture!==null)if(t.depthTexture.renderTarget===t){let e=t.depthTexture.clone();e.renderTarget=null,this.depthTexture=e}else this.depthTexture=t.depthTexture;return this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},ii=class extends _a{constructor(t=1,e=1,i={}){super(t,e,i),this.isWebGLRenderTarget=!0}},Hs=class extends Qe{constructor(t=null,e=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:i,depth:s},this.magFilter=He,this.minFilter=He,this.wrapR=Ii,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var va=class extends Qe{constructor(t=null,e=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:i,depth:s},this.magFilter=He,this.minFilter=He,this.wrapR=Ii,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}};var ge=class n{static{n.prototype.isMatrix4=!0}constructor(t,e,i,s,r,a,o,l,c,h,d,u,f,m,y,g){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,i,s,r,a,o,l,c,h,d,u,f,m,y,g)}set(t,e,i,s,r,a,o,l,c,h,d,u,f,m,y,g){let p=this.elements;return p[0]=t,p[4]=e,p[8]=i,p[12]=s,p[1]=r,p[5]=a,p[9]=o,p[13]=l,p[2]=c,p[6]=h,p[10]=d,p[14]=u,p[3]=f,p[7]=m,p[11]=y,p[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new n().fromArray(this.elements)}copy(t){let e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],e[9]=i[9],e[10]=i[10],e[11]=i[11],e[12]=i[12],e[13]=i[13],e[14]=i[14],e[15]=i[15],this}copyPosition(t){let e=this.elements,i=t.elements;return e[12]=i[12],e[13]=i[13],e[14]=i[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,i){return this.determinantAffine()===0?(t.set(1,0,0),e.set(0,1,0),i.set(0,0,1),this):(t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this)}makeBasis(t,e,i){return this.set(t.x,e.x,i.x,0,t.y,e.y,i.y,0,t.z,e.z,i.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();let e=this.elements,i=t.elements,s=1/zn.setFromMatrixColumn(t,0).length(),r=1/zn.setFromMatrixColumn(t,1).length(),a=1/zn.setFromMatrixColumn(t,2).length();return e[0]=i[0]*s,e[1]=i[1]*s,e[2]=i[2]*s,e[3]=0,e[4]=i[4]*r,e[5]=i[5]*r,e[6]=i[6]*r,e[7]=0,e[8]=i[8]*a,e[9]=i[9]*a,e[10]=i[10]*a,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,i=t.x,s=t.y,r=t.z,a=Math.cos(i),o=Math.sin(i),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),d=Math.sin(r);if(t.order==="XYZ"){let u=a*h,f=a*d,m=o*h,y=o*d;e[0]=l*h,e[4]=-l*d,e[8]=c,e[1]=f+m*c,e[5]=u-y*c,e[9]=-o*l,e[2]=y-u*c,e[6]=m+f*c,e[10]=a*l}else if(t.order==="YXZ"){let u=l*h,f=l*d,m=c*h,y=c*d;e[0]=u+y*o,e[4]=m*o-f,e[8]=a*c,e[1]=a*d,e[5]=a*h,e[9]=-o,e[2]=f*o-m,e[6]=y+u*o,e[10]=a*l}else if(t.order==="ZXY"){let u=l*h,f=l*d,m=c*h,y=c*d;e[0]=u-y*o,e[4]=-a*d,e[8]=m+f*o,e[1]=f+m*o,e[5]=a*h,e[9]=y-u*o,e[2]=-a*c,e[6]=o,e[10]=a*l}else if(t.order==="ZYX"){let u=a*h,f=a*d,m=o*h,y=o*d;e[0]=l*h,e[4]=m*c-f,e[8]=u*c+y,e[1]=l*d,e[5]=y*c+u,e[9]=f*c-m,e[2]=-c,e[6]=o*l,e[10]=a*l}else if(t.order==="YZX"){let u=a*l,f=a*c,m=o*l,y=o*c;e[0]=l*h,e[4]=y-u*d,e[8]=m*d+f,e[1]=d,e[5]=a*h,e[9]=-o*h,e[2]=-c*h,e[6]=f*d+m,e[10]=u-y*d}else if(t.order==="XZY"){let u=a*l,f=a*c,m=o*l,y=o*c;e[0]=l*h,e[4]=-d,e[8]=c*h,e[1]=u*d+y,e[5]=a*h,e[9]=f*d-m,e[2]=m*d-f,e[6]=o*h,e[10]=y*d+u}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(Fd,t,Od)}lookAt(t,e,i){let s=this.elements;return ai.subVectors(t,e),ai.lengthSq()===0&&(ai.z=1),ai.normalize(),Qi.crossVectors(i,ai),Qi.lengthSq()===0&&(Math.abs(i.z)===1?ai.x+=1e-4:ai.z+=1e-4,ai.normalize(),Qi.crossVectors(i,ai)),Qi.normalize(),Ur.crossVectors(ai,Qi),s[0]=Qi.x,s[4]=Ur.x,s[8]=ai.x,s[1]=Qi.y,s[5]=Ur.y,s[9]=ai.y,s[2]=Qi.z,s[6]=Ur.z,s[10]=ai.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let i=t.elements,s=e.elements,r=this.elements,a=i[0],o=i[4],l=i[8],c=i[12],h=i[1],d=i[5],u=i[9],f=i[13],m=i[2],y=i[6],g=i[10],p=i[14],M=i[3],w=i[7],x=i[11],E=i[15],S=s[0],R=s[4],v=s[8],T=s[12],P=s[1],C=s[5],I=s[9],O=s[13],L=s[2],k=s[6],V=s[10],W=s[14],K=s[3],q=s[7],Q=s[11],it=s[15];return r[0]=a*S+o*P+l*L+c*K,r[4]=a*R+o*C+l*k+c*q,r[8]=a*v+o*I+l*V+c*Q,r[12]=a*T+o*O+l*W+c*it,r[1]=h*S+d*P+u*L+f*K,r[5]=h*R+d*C+u*k+f*q,r[9]=h*v+d*I+u*V+f*Q,r[13]=h*T+d*O+u*W+f*it,r[2]=m*S+y*P+g*L+p*K,r[6]=m*R+y*C+g*k+p*q,r[10]=m*v+y*I+g*V+p*Q,r[14]=m*T+y*O+g*W+p*it,r[3]=M*S+w*P+x*L+E*K,r[7]=M*R+w*C+x*k+E*q,r[11]=M*v+w*I+x*V+E*Q,r[15]=M*T+w*O+x*W+E*it,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],i=t[4],s=t[8],r=t[12],a=t[1],o=t[5],l=t[9],c=t[13],h=t[2],d=t[6],u=t[10],f=t[14],m=t[3],y=t[7],g=t[11],p=t[15],M=l*f-c*u,w=o*f-c*d,x=o*u-l*d,E=a*f-c*h,S=a*u-l*h,R=a*d-o*h;return e*(y*M-g*w+p*x)-i*(m*M-g*E+p*S)+s*(m*w-y*E+p*R)-r*(m*x-y*S+g*R)}determinantAffine(){let t=this.elements,e=t[0],i=t[4],s=t[8],r=t[1],a=t[5],o=t[9],l=t[2],c=t[6],h=t[10];return e*(a*h-o*c)-i*(r*h-o*l)+s*(r*c-a*l)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,i){let s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=i),this}invert(){let t=this.elements,e=t[0],i=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],h=t[8],d=t[9],u=t[10],f=t[11],m=t[12],y=t[13],g=t[14],p=t[15],M=e*o-i*a,w=e*l-s*a,x=e*c-r*a,E=i*l-s*o,S=i*c-r*o,R=s*c-r*l,v=h*y-d*m,T=h*g-u*m,P=h*p-f*m,C=d*g-u*y,I=d*p-f*y,O=u*p-f*g,L=M*O-w*I+x*C+E*P-S*T+R*v;if(L===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let k=1/L;return t[0]=(o*O-l*I+c*C)*k,t[1]=(s*I-i*O-r*C)*k,t[2]=(y*R-g*S+p*E)*k,t[3]=(u*S-d*R-f*E)*k,t[4]=(l*P-a*O-c*T)*k,t[5]=(e*O-s*P+r*T)*k,t[6]=(g*x-m*R-p*w)*k,t[7]=(h*R-u*x+f*w)*k,t[8]=(a*I-o*P+c*v)*k,t[9]=(i*P-e*I-r*v)*k,t[10]=(m*S-y*x+p*M)*k,t[11]=(d*x-h*S-f*M)*k,t[12]=(o*T-a*C-l*v)*k,t[13]=(e*C-i*T+s*v)*k,t[14]=(y*w-m*E-g*M)*k,t[15]=(h*E-d*w+u*M)*k,this}scale(t){let e=this.elements,i=t.x,s=t.y,r=t.z;return e[0]*=i,e[4]*=s,e[8]*=r,e[1]*=i,e[5]*=s,e[9]*=r,e[2]*=i,e[6]*=s,e[10]*=r,e[3]*=i,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],i=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,i,s))}makeTranslation(t,e,i){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,i,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),i=Math.sin(t);return this.set(1,0,0,0,0,e,-i,0,0,i,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,0,i,0,0,1,0,0,-i,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,0,i,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let i=Math.cos(e),s=Math.sin(e),r=1-i,a=t.x,o=t.y,l=t.z,c=r*a,h=r*o;return this.set(c*a+i,c*o-s*l,c*l+s*o,0,c*o+s*l,h*o+i,h*l-s*a,0,c*l-s*o,h*l+s*a,r*l*l+i,0,0,0,0,1),this}makeScale(t,e,i){return this.set(t,0,0,0,0,e,0,0,0,0,i,0,0,0,0,1),this}makeShear(t,e,i,s,r,a){return this.set(1,i,r,0,t,1,a,0,e,s,1,0,0,0,0,1),this}compose(t,e,i){let s=this.elements,r=e._x,a=e._y,o=e._z,l=e._w,c=r+r,h=a+a,d=o+o,u=r*c,f=r*h,m=r*d,y=a*h,g=a*d,p=o*d,M=l*c,w=l*h,x=l*d,E=i.x,S=i.y,R=i.z;return s[0]=(1-(y+p))*E,s[1]=(f+x)*E,s[2]=(m-w)*E,s[3]=0,s[4]=(f-x)*S,s[5]=(1-(u+p))*S,s[6]=(g+M)*S,s[7]=0,s[8]=(m+w)*R,s[9]=(g-M)*R,s[10]=(1-(u+y))*R,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,i){let s=this.elements;t.x=s[12],t.y=s[13],t.z=s[14];let r=this.determinantAffine();if(r===0)return i.set(1,1,1),e.identity(),this;let a=zn.set(s[0],s[1],s[2]).length(),o=zn.set(s[4],s[5],s[6]).length(),l=zn.set(s[8],s[9],s[10]).length();r<0&&(a=-a),vi.copy(this);let c=1/a,h=1/o,d=1/l;return vi.elements[0]*=c,vi.elements[1]*=c,vi.elements[2]*=c,vi.elements[4]*=h,vi.elements[5]*=h,vi.elements[6]*=h,vi.elements[8]*=d,vi.elements[9]*=d,vi.elements[10]*=d,e.setFromRotationMatrix(vi),i.x=a,i.y=o,i.z=l,this}makePerspective(t,e,i,s,r,a,o=Si,l=!1){let c=this.elements,h=2*r/(e-t),d=2*r/(i-s),u=(e+t)/(e-t),f=(i+s)/(i-s),m,y;if(l)m=r/(a-r),y=a*r/(a-r);else if(o===Si)m=-(a+r)/(a-r),y=-2*a*r/(a-r);else if(o===es)m=-a/(a-r),y=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=u,c[12]=0,c[1]=0,c[5]=d,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=m,c[14]=y,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,e,i,s,r,a,o=Si,l=!1){let c=this.elements,h=2/(e-t),d=2/(i-s),u=-(e+t)/(e-t),f=-(i+s)/(i-s),m,y;if(l)m=1/(a-r),y=a/(a-r);else if(o===Si)m=-2/(a-r),y=-(a+r)/(a-r);else if(o===es)m=-1/(a-r),y=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=h,c[4]=0,c[8]=0,c[12]=u,c[1]=0,c[5]=d,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=m,c[14]=y,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){let e=this.elements,i=t.elements;for(let s=0;s<16;s++)if(e[s]!==i[s])return!1;return!0}fromArray(t,e=0){for(let i=0;i<16;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){let i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t[e+9]=i[9],t[e+10]=i[10],t[e+11]=i[11],t[e+12]=i[12],t[e+13]=i[13],t[e+14]=i[14],t[e+15]=i[15],t}},zn=new D,vi=new ge,Fd=new D(0,0,0),Od=new D(1,1,1),Qi=new D,Ur=new D,ai=new D,oh=new ge,lh=new Ni,Ei=class n{constructor(t=0,e=0,i=0,s=n.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=i,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,i,s=this._order){return this._x=t,this._y=e,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,i=!0){let s=t.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],h=s[9],d=s[2],u=s[6],f=s[10];switch(e){case"XYZ":this._y=Math.asin(jt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(u,c),this._z=0);break;case"YXZ":this._x=Math.asin(-jt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-d,r),this._z=0);break;case"ZXY":this._x=Math.asin(jt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-d,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-jt(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(u,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(jt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-d,r)):(this._x=0,this._y=Math.atan2(o,f));break;case"XZY":this._z=Math.asin(-jt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(u,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,f),this._y=0);break;default:Gt("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,i===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,i){return oh.makeRotationFromQuaternion(t),this.setFromRotationMatrix(oh,e,i)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return lh.setFromEuler(this),this.setFromQuaternion(lh,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Ei.DEFAULT_ORDER="XYZ";var Gs=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},kd=0,ch=new D,Hn=new Ni,zi=new ge,Fr=new D,Rs=new D,Bd=new D,zd=new Ni,hh=new D(1,0,0),uh=new D(0,1,0),dh=new D(0,0,1),fh={type:"added"},Hd={type:"removed"},Gn={type:"childadded",child:null},pl={type:"childremoved",child:null},De=class n extends Di{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:kd++}),this.uuid=gs(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=n.DEFAULT_UP.clone();let t=new D,e=new Ei,i=new Ni,s=new D(1,1,1);function r(){i.setFromEuler(e,!1)}function a(){e.setFromQuaternion(i,void 0,!1)}e._onChange(r),i._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new ge},normalMatrix:{value:new $t}}),this.matrix=new ge,this.matrixWorld=new ge,this.matrixAutoUpdate=n.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=n.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Gs,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Hn.setFromAxisAngle(t,e),this.quaternion.multiply(Hn),this}rotateOnWorldAxis(t,e){return Hn.setFromAxisAngle(t,e),this.quaternion.premultiply(Hn),this}rotateX(t){return this.rotateOnAxis(hh,t)}rotateY(t){return this.rotateOnAxis(uh,t)}rotateZ(t){return this.rotateOnAxis(dh,t)}translateOnAxis(t,e){return ch.copy(t).applyQuaternion(this.quaternion),this.position.add(ch.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(hh,t)}translateY(t){return this.translateOnAxis(uh,t)}translateZ(t){return this.translateOnAxis(dh,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(zi.copy(this.matrixWorld).invert())}lookAt(t,e,i){t.isVector3?Fr.copy(t):Fr.set(t,e,i);let s=this.parent;this.updateWorldMatrix(!0,!1),Rs.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?zi.lookAt(Rs,Fr,this.up):zi.lookAt(Fr,Rs,this.up),this.quaternion.setFromRotationMatrix(zi),s&&(zi.extractRotation(s.matrixWorld),Hn.setFromRotationMatrix(zi),this.quaternion.premultiply(Hn.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(Wt("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(fh),Gn.child=t,this.dispatchEvent(Gn),Gn.child=null):Wt("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(Hd),pl.child=t,this.dispatchEvent(pl),pl.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),zi.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),zi.multiply(t.parent.matrixWorld)),t.applyMatrix4(zi),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(fh),Gn.child=t,this.dispatchEvent(Gn),Gn.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let i=0,s=this.children.length;i<s;i++){let a=this.children[i].getObjectByProperty(t,e);if(a!==void 0)return a}}getObjectsByProperty(t,e,i=[]){this[t]===e&&i.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(t,e,i);return i}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Rs,t,Bd),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Rs,zd,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(t){t(this);let e=this.children;for(let i=0,s=e.length;i<s;i++)e[i].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let i=0,s=e.length;i<s;i++)e[i].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let e=t.x,i=t.y,s=t.z,r=this.matrix.elements;r[12]+=e-r[0]*e-r[4]*i-r[8]*s,r[13]+=i-r[1]*e-r[5]*i-r[9]*s,r[14]+=s-r[2]*e-r[6]*i-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let i=0,s=e.length;i<s;i++)e[i].updateMatrixWorld(t)}updateWorldMatrix(t,e,i=!1){let s=this.parent;if(t===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||i)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,i=!0),e===!0){let r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,i)}}toJSON(t){let e=t===void 0||typeof t=="string",i={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(t),s.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let d=l[c];r(t.shapes,d)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(t.materials,this.material[l]));s.material=o}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];s.animations.push(r(t.animations,l))}}if(e){let o=a(t.geometries),l=a(t.materials),c=a(t.textures),h=a(t.images),d=a(t.shapes),u=a(t.skeletons),f=a(t.animations),m=a(t.nodes);o.length>0&&(i.geometries=o),l.length>0&&(i.materials=l),c.length>0&&(i.textures=c),h.length>0&&(i.images=h),d.length>0&&(i.shapes=d),u.length>0&&(i.skeletons=u),f.length>0&&(i.animations=f),m.length>0&&(i.nodes=m)}return i.object=s,i;function a(o){let l=[];for(let c in o){let h=o[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let i=0;i<t.children.length;i++){let s=t.children[i];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};De.DEFAULT_UP=new D(0,1,0);De.DEFAULT_MATRIX_AUTO_UPDATE=!0;De.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var be=class extends De{constructor(){super(),this.isGroup=!0,this.type="Group"}},Gd={type:"move"},ss=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new be,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new be,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new D,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new D),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new be,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new D,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new D,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let i of t.hand.values())this._getHandJoint(e,i)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,i){let s=null,r=null,a=null,o=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){a=!0;for(let y of t.hand.values()){let g=e.getJointPose(y,i),p=this._getHandJoint(c,y);g!==null&&(p.matrix.fromArray(g.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=g.radius),p.visible=g!==null}let h=c.joints["index-finger-tip"],d=c.joints["thumb-tip"],u=h.position.distanceTo(d.position),f=.02,m=.005;c.inputState.pinching&&u>f+m?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&u<=f-m&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,i),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:t,target:this})));o!==null&&(s=e.getPose(t.targetRaySpace,i),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Gd)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let i=new be;i.matrixAutoUpdate=!1,i.visible=!1,t.joints[e.jointName]=i,t.add(i)}return t.joints[e.jointName]}},_u={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},tn={h:0,s:0,l:0},Or={h:0,s:0,l:0};function ml(n,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?n+(t-n)*6*e:e<1/2?t:e<2/3?n+(t-n)*6*(2/3-e):n}var Rt=class{constructor(t,e,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,i)}set(t,e,i){if(e===void 0&&i===void 0){let s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,i);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=Se){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,ne.colorSpaceToWorking(this,e),this}setRGB(t,e,i,s=ne.workingColorSpace){return this.r=t,this.g=e,this.b=i,ne.colorSpaceToWorking(this,s),this}setHSL(t,e,i,s=ne.workingColorSpace){if(t=Ld(t,1),e=jt(e,0,1),i=jt(i,0,1),e===0)this.r=this.g=this.b=i;else{let r=i<=.5?i*(1+e):i+e-i*e,a=2*i-r;this.r=ml(a,r,t+1/3),this.g=ml(a,r,t),this.b=ml(a,r,t-1/3)}return ne.colorSpaceToWorking(this,s),this}setStyle(t,e=Se){function i(r){r!==void 0&&parseFloat(r)<1&&Gt("Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r,a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:Gt("Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(a===6)return this.setHex(parseInt(r,16),e);Gt("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=Se){let i=_u[t.toLowerCase()];return i!==void 0?this.setHex(i,e):Gt("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Xi(t.r),this.g=Xi(t.g),this.b=Xi(t.b),this}copyLinearToSRGB(t){return this.r=Qn(t.r),this.g=Qn(t.g),this.b=Qn(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=Se){return ne.workingToColorSpace(Ye.copy(this),t),Math.round(jt(Ye.r*255,0,255))*65536+Math.round(jt(Ye.g*255,0,255))*256+Math.round(jt(Ye.b*255,0,255))}getHexString(t=Se){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=ne.workingColorSpace){ne.workingToColorSpace(Ye.copy(this),e);let i=Ye.r,s=Ye.g,r=Ye.b,a=Math.max(i,s,r),o=Math.min(i,s,r),l,c,h=(o+a)/2;if(o===a)l=0,c=0;else{let d=a-o;switch(c=h<=.5?d/(a+o):d/(2-a-o),a){case i:l=(s-r)/d+(s<r?6:0);break;case s:l=(r-i)/d+2;break;case r:l=(i-s)/d+4;break}l/=6}return t.h=l,t.s=c,t.l=h,t}getRGB(t,e=ne.workingColorSpace){return ne.workingToColorSpace(Ye.copy(this),e),t.r=Ye.r,t.g=Ye.g,t.b=Ye.b,t}getStyle(t=Se){ne.workingToColorSpace(Ye.copy(this),t);let e=Ye.r,i=Ye.g,s=Ye.b;return t!==Se?`color(${t} ${e.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(i*255)},${Math.round(s*255)})`}offsetHSL(t,e,i){return this.getHSL(tn),this.setHSL(tn.h+t,tn.s+e,tn.l+i)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,i){return this.r=t.r+(e.r-t.r)*i,this.g=t.g+(e.g-t.g)*i,this.b=t.b+(e.b-t.b)*i,this}lerpHSL(t,e){this.getHSL(tn),t.getHSL(Or);let i=cl(tn.h,Or.h,e),s=cl(tn.s,Or.s,e),r=cl(tn.l,Or.l,e);return this.setHSL(i,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,i=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*i+r[6]*s,this.g=r[1]*e+r[4]*i+r[7]*s,this.b=r[2]*e+r[5]*i+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Ye=new Rt;Rt.NAMES=_u;var Vs=class n{constructor(t,e=25e-5){this.isFogExp2=!0,this.name="",this.color=new Rt(t),this.density=e}clone(){return new n(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}};var Ws=class extends De{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Ei,this.environmentIntensity=1,this.environmentRotation=new Ei,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),e.object.backgroundBlurriness=this.backgroundBlurriness,e.object.backgroundIntensity=this.backgroundIntensity,e.object.backgroundRotation=this.backgroundRotation.toArray(),e.object.environmentIntensity=this.environmentIntensity,e.object.environmentRotation=this.environmentRotation.toArray(),e}},yi=new D,Hi=new D,gl=new D,Gi=new D,Vn=new D,Wn=new D,ph=new D,xl=new D,_l=new D,vl=new D,yl=new Ee,Ml=new Ee,bl=new Ee,rn=class n{constructor(t=new D,e=new D,i=new D){this.a=t,this.b=e,this.c=i}static getNormal(t,e,i,s){s.subVectors(i,e),yi.subVectors(t,e),s.cross(yi);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,i,s,r){yi.subVectors(s,e),Hi.subVectors(i,e),gl.subVectors(t,e);let a=yi.dot(yi),o=yi.dot(Hi),l=yi.dot(gl),c=Hi.dot(Hi),h=Hi.dot(gl),d=a*c-o*o;if(d===0)return r.set(0,0,0),null;let u=1/d,f=(c*l-o*h)*u,m=(a*h-o*l)*u;return r.set(1-f-m,m,f)}static containsPoint(t,e,i,s){return this.getBarycoord(t,e,i,s,Gi)===null?!1:Gi.x>=0&&Gi.y>=0&&Gi.x+Gi.y<=1}static getInterpolation(t,e,i,s,r,a,o,l){return this.getBarycoord(t,e,i,s,Gi)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Gi.x),l.addScaledVector(a,Gi.y),l.addScaledVector(o,Gi.z),l)}static getInterpolatedAttribute(t,e,i,s,r,a){return yl.setScalar(0),Ml.setScalar(0),bl.setScalar(0),yl.fromBufferAttribute(t,e),Ml.fromBufferAttribute(t,i),bl.fromBufferAttribute(t,s),a.setScalar(0),a.addScaledVector(yl,r.x),a.addScaledVector(Ml,r.y),a.addScaledVector(bl,r.z),a}static isFrontFacing(t,e,i,s){return yi.subVectors(i,e),Hi.subVectors(t,e),yi.cross(Hi).dot(s)<0}set(t,e,i){return this.a.copy(t),this.b.copy(e),this.c.copy(i),this}setFromPointsAndIndices(t,e,i,s){return this.a.copy(t[e]),this.b.copy(t[i]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,i,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,i),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return yi.subVectors(this.c,this.b),Hi.subVectors(this.a,this.b),yi.cross(Hi).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return n.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return n.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,i,s,r){return n.getInterpolation(t,this.a,this.b,this.c,e,i,s,r)}containsPoint(t){return n.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return n.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let i=this.a,s=this.b,r=this.c,a,o;Vn.subVectors(s,i),Wn.subVectors(r,i),xl.subVectors(t,i);let l=Vn.dot(xl),c=Wn.dot(xl);if(l<=0&&c<=0)return e.copy(i);_l.subVectors(t,s);let h=Vn.dot(_l),d=Wn.dot(_l);if(h>=0&&d<=h)return e.copy(s);let u=l*d-h*c;if(u<=0&&l>=0&&h<=0)return a=l/(l-h),e.copy(i).addScaledVector(Vn,a);vl.subVectors(t,r);let f=Vn.dot(vl),m=Wn.dot(vl);if(m>=0&&f<=m)return e.copy(r);let y=f*c-l*m;if(y<=0&&c>=0&&m<=0)return o=c/(c-m),e.copy(i).addScaledVector(Wn,o);let g=h*m-f*d;if(g<=0&&d-h>=0&&f-m>=0)return ph.subVectors(r,s),o=(d-h)/(d-h+(f-m)),e.copy(s).addScaledVector(ph,o);let p=1/(g+y+u);return a=y*p,o=u*p,e.copy(i).addScaledVector(Vn,a).addScaledVector(Wn,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},Ui=class{constructor(t=new D(1/0,1/0,1/0),e=new D(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e+=3)this.expandByPoint(Mi.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,i=t.count;e<i;e++)this.expandByPoint(Mi.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let i=Mi.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(i),this.max.copy(t).add(i),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let i=t.geometry;if(i!==void 0){let r=i.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)t.isMesh===!0?t.getVertexPosition(a,Mi):Mi.fromBufferAttribute(r,a),Mi.applyMatrix4(t.matrixWorld),this.expandByPoint(Mi);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),kr.copy(t.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),kr.copy(i.boundingBox)),kr.applyMatrix4(t.matrixWorld),this.union(kr)}let s=t.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,Mi),Mi.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,i;return t.normal.x>0?(e=t.normal.x*this.min.x,i=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,i=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,i+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,i+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,i+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,i+=t.normal.z*this.min.z),e<=-t.constant&&i>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Cs),Br.subVectors(this.max,Cs),Xn.subVectors(t.a,Cs),qn.subVectors(t.b,Cs),$n.subVectors(t.c,Cs),en.subVectors(qn,Xn),nn.subVectors($n,qn),yn.subVectors(Xn,$n);let e=[0,-en.z,en.y,0,-nn.z,nn.y,0,-yn.z,yn.y,en.z,0,-en.x,nn.z,0,-nn.x,yn.z,0,-yn.x,-en.y,en.x,0,-nn.y,nn.x,0,-yn.y,yn.x,0];return!Sl(e,Xn,qn,$n,Br)||(e=[1,0,0,0,1,0,0,0,1],!Sl(e,Xn,qn,$n,Br))?!1:(zr.crossVectors(en,nn),e=[zr.x,zr.y,zr.z],Sl(e,Xn,qn,$n,Br))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,Mi).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(Mi).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(Vi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),Vi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),Vi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),Vi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),Vi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),Vi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),Vi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),Vi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(Vi),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}},Vi=[new D,new D,new D,new D,new D,new D,new D,new D],Mi=new D,kr=new Ui,Xn=new D,qn=new D,$n=new D,en=new D,nn=new D,yn=new D,Cs=new D,Br=new D,zr=new D,Mn=new D;function Sl(n,t,e,i,s){for(let r=0,a=n.length-3;r<=a;r+=3){Mn.fromArray(n,r);let o=s.x*Math.abs(Mn.x)+s.y*Math.abs(Mn.y)+s.z*Math.abs(Mn.z),l=t.dot(Mn),c=e.dot(Mn),h=i.dot(Mn);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>o)return!1}return!0}var Le=new D,Hr=new dt,Vd=0,Je=class extends Di{constructor(t,e,i=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Vd++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=i,this.usage=fu,this.updateRanges=[],this.gpuType=pi,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,i){t*=this.itemSize,i*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[i+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,i=this.count;e<i;e++)Hr.fromBufferAttribute(this,e),Hr.applyMatrix3(t),this.setXY(e,Hr.x,Hr.y);else if(this.itemSize===3)for(let e=0,i=this.count;e<i;e++)Le.fromBufferAttribute(this,e),Le.applyMatrix3(t),this.setXYZ(e,Le.x,Le.y,Le.z);return this}applyMatrix4(t){for(let e=0,i=this.count;e<i;e++)Le.fromBufferAttribute(this,e),Le.applyMatrix4(t),this.setXYZ(e,Le.x,Le.y,Le.z);return this}applyNormalMatrix(t){for(let e=0,i=this.count;e<i;e++)Le.fromBufferAttribute(this,e),Le.applyNormalMatrix(t),this.setXYZ(e,Le.x,Le.y,Le.z);return this}transformDirection(t){for(let e=0,i=this.count;e<i;e++)Le.fromBufferAttribute(this,e),Le.transformDirection(t),this.setXYZ(e,Le.x,Le.y,Le.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let i=this.array[t*this.itemSize+e];return this.normalized&&(i=As(i,this.array)),i}setComponent(t,e,i){return this.normalized&&(i=ei(i,this.array)),this.array[t*this.itemSize+e]=i,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=As(e,this.array)),e}setX(t,e){return this.normalized&&(e=ei(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=As(e,this.array)),e}setY(t,e){return this.normalized&&(e=ei(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=As(e,this.array)),e}setZ(t,e){return this.normalized&&(e=ei(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=As(e,this.array)),e}setW(t,e){return this.normalized&&(e=ei(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,i){return t*=this.itemSize,this.normalized&&(e=ei(e,this.array),i=ei(i,this.array)),this.array[t+0]=e,this.array[t+1]=i,this}setXYZ(t,e,i,s){return t*=this.itemSize,this.normalized&&(e=ei(e,this.array),i=ei(i,this.array),s=ei(s,this.array)),this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=s,this}setXYZW(t,e,i,s,r){return t*=this.itemSize,this.normalized&&(e=ei(e,this.array),i=ei(i,this.array),s=ei(s,this.array),r=ei(r,this.array)),this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return t.name=this.name,t.usage=this.usage,t.gpuType=this.gpuType,t}dispose(){this.dispatchEvent({type:"dispose"})}};var Xs=class extends Je{constructor(t,e,i){super(new Uint16Array(t),e,i)}};var qs=class extends Je{constructor(t,e,i){super(new Uint32Array(t),e,i)}};var fe=class extends Je{constructor(t,e,i){super(new Float32Array(t),e,i)}},Wd=new Ui,Ps=new D,El=new D,qi=class{constructor(t=new D,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let i=this.center;e!==void 0?i.copy(e):Wd.setFromPoints(t).getCenter(i);let s=0;for(let r=0,a=t.length;r<a;r++)s=Math.max(s,i.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let i=this.center.distanceToSquared(t);return e.copy(t),i>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Ps.subVectors(t,this.center);let e=Ps.lengthSq();if(e>this.radius*this.radius){let i=Math.sqrt(e),s=(i-this.radius)*.5;this.center.addScaledVector(Ps,s/i),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(El.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Ps.copy(t.center).add(El)),this.expandByPoint(Ps.copy(t.center).sub(El))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}},Xd=0,fi=new ge,wl=new De,Yn=new D,oi=new Ui,Is=new Ui,ze=new D,Re=class n extends Di{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Xd++}),this.uuid=gs(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(Pd(t)?qs:Xs)(t,1):this.index=t,this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,i=0){this.groups.push({start:t,count:e,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let i=this.attributes.normal;if(i!==void 0){let r=new $t().getNormalMatrix(t);i.applyNormalMatrix(r),i.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return fi.makeRotationFromQuaternion(t),this.applyMatrix4(fi),this}rotateX(t){return fi.makeRotationX(t),this.applyMatrix4(fi),this}rotateY(t){return fi.makeRotationY(t),this.applyMatrix4(fi),this}rotateZ(t){return fi.makeRotationZ(t),this.applyMatrix4(fi),this}translate(t,e,i){return fi.makeTranslation(t,e,i),this.applyMatrix4(fi),this}scale(t,e,i){return fi.makeScale(t,e,i),this.applyMatrix4(fi),this}lookAt(t){return wl.lookAt(t),wl.updateMatrix(),this.applyMatrix4(wl.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Yn).negate(),this.translate(Yn.x,Yn.y,Yn.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let i=[];for(let s=0,r=t.length;s<r;s++){let a=t[s];i.push(a.x,a.y,a.z||0)}this.setAttribute("position",new fe(i,3))}else{let i=Math.min(t.length,e.count);for(let s=0;s<i;s++){let r=t[s];e.setXYZ(s,r.x,r.y,r.z||0)}t.length>e.count&&Gt("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Ui);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Wt("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new D(-1/0,-1/0,-1/0),new D(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let i=0,s=e.length;i<s;i++){let r=e[i];oi.setFromBufferAttribute(r),this.morphTargetsRelative?(ze.addVectors(this.boundingBox.min,oi.min),this.boundingBox.expandByPoint(ze),ze.addVectors(this.boundingBox.max,oi.max),this.boundingBox.expandByPoint(ze)):(this.boundingBox.expandByPoint(oi.min),this.boundingBox.expandByPoint(oi.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Wt('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new qi);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){Wt("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new D,1/0);return}if(t){let i=this.boundingSphere.center;if(oi.setFromBufferAttribute(t),e)for(let r=0,a=e.length;r<a;r++){let o=e[r];Is.setFromBufferAttribute(o),this.morphTargetsRelative?(ze.addVectors(oi.min,Is.min),oi.expandByPoint(ze),ze.addVectors(oi.max,Is.max),oi.expandByPoint(ze)):(oi.expandByPoint(Is.min),oi.expandByPoint(Is.max))}oi.getCenter(i);let s=0;for(let r=0,a=t.count;r<a;r++)ze.fromBufferAttribute(t,r),s=Math.max(s,i.distanceToSquared(ze));if(e)for(let r=0,a=e.length;r<a;r++){let o=e[r],l=this.morphTargetsRelative;for(let c=0,h=o.count;c<h;c++)ze.fromBufferAttribute(o,c),l&&(Yn.fromBufferAttribute(t,c),ze.add(Yn)),s=Math.max(s,i.distanceToSquared(ze))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Wt('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){Wt("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let i=e.position,s=e.normal,r=e.uv,a=this.getAttribute("tangent");(a===void 0||a.count!==i.count)&&(a=new Je(new Float32Array(4*i.count),4),this.setAttribute("tangent",a));let o=[],l=[];for(let v=0;v<i.count;v++)o[v]=new D,l[v]=new D;let c=new D,h=new D,d=new D,u=new dt,f=new dt,m=new dt,y=new D,g=new D;function p(v,T,P){c.fromBufferAttribute(i,v),h.fromBufferAttribute(i,T),d.fromBufferAttribute(i,P),u.fromBufferAttribute(r,v),f.fromBufferAttribute(r,T),m.fromBufferAttribute(r,P),h.sub(c),d.sub(c),f.sub(u),m.sub(u);let C=1/(f.x*m.y-m.x*f.y);isFinite(C)&&(y.copy(h).multiplyScalar(m.y).addScaledVector(d,-f.y).multiplyScalar(C),g.copy(d).multiplyScalar(f.x).addScaledVector(h,-m.x).multiplyScalar(C),o[v].add(y),o[T].add(y),o[P].add(y),l[v].add(g),l[T].add(g),l[P].add(g))}let M=this.groups;M.length===0&&(M=[{start:0,count:t.count}]);for(let v=0,T=M.length;v<T;++v){let P=M[v],C=P.start,I=P.count;for(let O=C,L=C+I;O<L;O+=3)p(t.getX(O+0),t.getX(O+1),t.getX(O+2))}let w=new D,x=new D,E=new D,S=new D;function R(v){E.fromBufferAttribute(s,v),S.copy(E);let T=o[v];w.copy(T),w.sub(E.multiplyScalar(E.dot(T))).normalize(),x.crossVectors(S,T);let C=x.dot(l[v])<0?-1:1;a.setXYZW(v,w.x,w.y,w.z,C)}for(let v=0,T=M.length;v<T;++v){let P=M[v],C=P.start,I=P.count;for(let O=C,L=C+I;O<L;O+=3)R(t.getX(O+0)),R(t.getX(O+1)),R(t.getX(O+2))}this._transformed=!0}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let i=this.getAttribute("normal");if(i===void 0||i.count!==e.count)i=new Je(new Float32Array(e.count*3),3),this.setAttribute("normal",i);else for(let u=0,f=i.count;u<f;u++)i.setXYZ(u,0,0,0);let s=new D,r=new D,a=new D,o=new D,l=new D,c=new D,h=new D,d=new D;if(t)for(let u=0,f=t.count;u<f;u+=3){let m=t.getX(u+0),y=t.getX(u+1),g=t.getX(u+2);s.fromBufferAttribute(e,m),r.fromBufferAttribute(e,y),a.fromBufferAttribute(e,g),h.subVectors(a,r),d.subVectors(s,r),h.cross(d),o.fromBufferAttribute(i,m),l.fromBufferAttribute(i,y),c.fromBufferAttribute(i,g),o.add(h),l.add(h),c.add(h),i.setXYZ(m,o.x,o.y,o.z),i.setXYZ(y,l.x,l.y,l.z),i.setXYZ(g,c.x,c.y,c.z)}else for(let u=0,f=e.count;u<f;u+=3)s.fromBufferAttribute(e,u+0),r.fromBufferAttribute(e,u+1),a.fromBufferAttribute(e,u+2),h.subVectors(a,r),d.subVectors(s,r),h.cross(d),i.setXYZ(u+0,h.x,h.y,h.z),i.setXYZ(u+1,h.x,h.y,h.z),i.setXYZ(u+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,i=t.count;e<i;e++)ze.fromBufferAttribute(t,e),ze.normalize(),t.setXYZ(e,ze.x,ze.y,ze.z)}toNonIndexed(){function t(o,l){let c=o.array,h=o.itemSize,d=o.normalized,u=new c.constructor(l.length*h),f=0,m=0;for(let y=0,g=l.length;y<g;y++){o.isInterleavedBufferAttribute?f=l[y]*o.data.stride+o.offset:f=l[y]*h;for(let p=0;p<h;p++)u[m++]=c[f++]}return new Je(u,h,d)}if(this.index===null)return Gt("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new n,i=this.index.array,s=this.attributes;for(let o in s){let l=s[o],c=t(l,i);e.setAttribute(o,c)}let r=this.morphAttributes;for(let o in r){let l=[],c=r[o];for(let h=0,d=c.length;h<d;h++){let u=c[h],f=t(u,i);l.push(f)}e.morphAttributes[o]=l}e.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,l=a.length;o<l;o++){let c=a[o];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let i=this.attributes;for(let l in i){let c=i[l];t.data.attributes[l]=c.toJSON(t.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let d=0,u=c.length;d<u;d++){let f=c[d];h.push(f.toJSON(t.data))}h.length>0&&(s[l]=h,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(t.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(t.data.boundingSphere=o.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let i=t.index;i!==null&&this.setIndex(i.clone());let s=t.attributes;for(let c in s){let h=s[c];this.setAttribute(c,h.clone(e))}let r=t.morphAttributes;for(let c in r){let h=[],d=r[c];for(let u=0,f=d.length;u<f;u++)h.push(d[u].clone(e));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;let a=t.groups;for(let c=0,h=a.length;c<h;c++){let d=a[c];this.addGroup(d.start,d.count,d.materialIndex)}let o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var Tl=new D,qd=new D,$d=new $t,bi=class{constructor(t=new D(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,i,s){return this.normal.set(t,e,i),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,i){let s=Tl.subVectors(i,e).cross(qd.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e,i=!0){let s=t.delta(Tl),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let a=-(t.start.dot(this.normal)+this.constant)/r;return i===!0&&(a<0||a>1)?null:e.copy(t.start).addScaledVector(s,a)}intersectsLine(t){let e=this.distanceToPoint(t.start),i=this.distanceToPoint(t.end);return e<0&&i>0||i<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let i=e||$d.getNormalMatrix(t),s=this.coplanarPoint(Tl).applyMatrix4(t),r=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(t){return this.normal.fromArray(t.normal),this.constant=t.constant,this}},Yd=0,$i=class extends Di{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Yd++}),this.uuid=gs(),this.name="",this.type="Material",this.blending=fs,this.side=dn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Jl,this.blendDst=Kl,this.blendEquation=In,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Rt(0,0,0),this.blendAlpha=0,this.depthFunc=ts,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=au,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=aa,this.stencilZFail=aa,this.stencilZPass=aa,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let i=t[e];if(i===void 0){Gt(`Material: parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){Gt(`Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(i):s&&s.isVector2&&i&&i.isVector2||s&&s.isEuler&&i&&i.isEuler||s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[e]=i}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,i.blending=this.blending,i.side=this.side,i.shadowSide=this.shadowSide,i.vertexColors=this.vertexColors,i.opacity=this.opacity,i.transparent=this.transparent,i.blendSrc=this.blendSrc,i.blendDst=this.blendDst,i.blendEquation=this.blendEquation,i.blendSrcAlpha=this.blendSrcAlpha,i.blendDstAlpha=this.blendDstAlpha,i.blendEquationAlpha=this.blendEquationAlpha,i.blendColor=this.blendColor.getHex(),i.blendAlpha=this.blendAlpha,i.depthFunc=this.depthFunc,i.depthTest=this.depthTest,i.depthWrite=this.depthWrite,i.colorWrite=this.colorWrite,i.clipIntersection=this.clipIntersection,i.clipShadows=this.clipShadows,i.stencilWriteMask=this.stencilWriteMask,i.stencilFunc=this.stencilFunc,i.stencilRef=this.stencilRef,i.stencilFuncMask=this.stencilFuncMask,i.stencilFail=this.stencilFail,i.stencilZFail=this.stencilZFail,i.stencilZPass=this.stencilZPass,i.stencilWrite=this.stencilWrite,i.polygonOffset=this.polygonOffset,i.polygonOffsetFactor=this.polygonOffsetFactor,i.polygonOffsetUnits=this.polygonOffsetUnits,i.dithering=this.dithering,i.alphaTest=this.alphaTest,i.alphaHash=this.alphaHash,i.alphaToCoverage=this.alphaToCoverage,i.premultipliedAlpha=this.premultipliedAlpha,i.forceSinglePass=this.forceSinglePass,i.allowOverride=this.allowOverride,i.visible=this.visible,i.toneMapped=this.toneMapped,i.name=this.name,this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(i.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(t).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(t).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(t).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(t).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(t).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(i.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(i.rotation=this.rotation),this.depthPacking!==void 0&&(i.depthPacking=this.depthPacking),this.linewidth!==void 0&&(i.linewidth=this.linewidth),this.linecap!==void 0&&(i.linecap=this.linecap),this.linejoin!==void 0&&(i.linejoin=this.linejoin),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.wireframe!==void 0&&(i.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(i.flatShading=this.flatShading),this.fog!==void 0&&(i.fog=this.fog),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(r){let a=[];for(let o in r){let l=r[o];delete l.metadata,a.push(l)}return a}if(e){let r=s(t.textures),a=s(t.images);r.length>0&&(i.textures=r),a.length>0&&(i.images=a)}return i}fromJSON(t,e){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new Rt().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.retroreflectivity!==void 0&&(this.retroreflectivity=t.retroreflectivity),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=t.iridescenceThicknessRange),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.clippingPlanes!==void 0&&(this.clippingPlanes=t.clippingPlanes.map(i=>new bi().fromJSON(i))),t.clipIntersection!==void 0&&(this.clipIntersection=t.clipIntersection),t.clipShadows!==void 0&&(this.clipShadows=t.clipShadows),t.depthPacking!==void 0&&(this.depthPacking=t.depthPacking),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.linecap!==void 0&&(this.linecap=t.linecap),t.linejoin!==void 0&&(this.linejoin=t.linejoin),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=e[t.map]||null),t.matcap!==void 0&&(this.matcap=e[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=e[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=e[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=e[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let i=t.normalScale;Array.isArray(i)===!1&&(i=[i,i]),this.normalScale=new dt().fromArray(i)}return t.displacementMap!==void 0&&(this.displacementMap=e[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=e[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=e[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=e[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=e[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=e[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=e[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=e[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=e[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=e[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=e[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=e[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=e[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=e[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new dt().fromArray(t.clearcoatNormalScale)),t.iridescenceMap!==void 0&&(this.iridescenceMap=e[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=e[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=e[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=e[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=e[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=e[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=e[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,i=null;if(e!==null){let s=e.length;i=new Array(s);for(let r=0;r!==s;++r)i[r]=e[r].clone()}return this.clippingPlanes=i,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}};var Wi=new D,Al=new D,Gr=new D,Vr=new D,$s=class{constructor(t=new D,e=new D(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Wi)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let i=e.dot(this.direction);return i<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=Wi.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(Wi.copy(this.origin).addScaledVector(this.direction,e),Wi.distanceToSquared(t))}distanceSqToSegment(t,e,i,s){Al.copy(t).add(e).multiplyScalar(.5),Gr.copy(e).sub(t).normalize(),Vr.copy(this.origin).sub(Al);let r=t.distanceTo(e)*.5,a=-this.direction.dot(Gr),o=Vr.dot(this.direction),l=-Vr.dot(Gr),c=Vr.lengthSq(),h=Math.abs(1-a*a),d,u,f,m;if(h>0)if(d=a*l-o,u=a*o-l,m=r*h,d>=0)if(u>=-m)if(u<=m){let y=1/h;d*=y,u*=y,f=d*(d+a*u+2*o)+u*(a*d+u+2*l)+c}else u=r,d=Math.max(0,-(a*u+o)),f=-d*d+u*(u+2*l)+c;else u=-r,d=Math.max(0,-(a*u+o)),f=-d*d+u*(u+2*l)+c;else u<=-m?(d=Math.max(0,-(-a*r+o)),u=d>0?-r:Math.min(Math.max(-r,-l),r),f=-d*d+u*(u+2*l)+c):u<=m?(d=0,u=Math.min(Math.max(-r,-l),r),f=u*(u+2*l)+c):(d=Math.max(0,-(a*r+o)),u=d>0?r:Math.min(Math.max(-r,-l),r),f=-d*d+u*(u+2*l)+c);else u=a>0?-r:r,d=Math.max(0,-(a*u+o)),f=-d*d+u*(u+2*l)+c;return i&&i.copy(this.origin).addScaledVector(this.direction,d),s&&s.copy(Al).addScaledVector(Gr,u),f}intersectSphere(t,e){if(t.radius<0)return null;Wi.subVectors(t.center,this.origin);let i=Wi.dot(this.direction),s=Wi.dot(Wi)-i*i,r=t.radius*t.radius;if(s>r)return null;let a=Math.sqrt(r-s),o=i-a,l=i+a;return l<0?null:o<0?this.at(l,e):this.at(o,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let i=-(this.origin.dot(t.normal)+t.constant)/e;return i>=0?i:null}intersectPlane(t,e){let i=this.distanceToPlane(t);return i===null?null:this.at(i,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let i,s,r,a,o,l,c=1/this.direction.x,h=1/this.direction.y,d=1/this.direction.z,u=this.origin;return c>=0?(i=(t.min.x-u.x)*c,s=(t.max.x-u.x)*c):(i=(t.max.x-u.x)*c,s=(t.min.x-u.x)*c),h>=0?(r=(t.min.y-u.y)*h,a=(t.max.y-u.y)*h):(r=(t.max.y-u.y)*h,a=(t.min.y-u.y)*h),i>a||r>s||((r>i||isNaN(i))&&(i=r),(a<s||isNaN(s))&&(s=a),d>=0?(o=(t.min.z-u.z)*d,l=(t.max.z-u.z)*d):(o=(t.max.z-u.z)*d,l=(t.min.z-u.z)*d),i>l||o>s)||((o>i||i!==i)&&(i=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(i>=0?i:s,e)}intersectsBox(t){return this.intersectBox(t,Wi)!==null}intersectTriangle(t,e,i,s,r){let a=this.origin,o=this.direction,l=o.x,c=o.y,h=o.z,d=t.x-a.x,u=t.y-a.y,f=t.z-a.z,m=e.x-a.x,y=e.y-a.y,g=e.z-a.z,p=i.x-a.x,M=i.y-a.y,w=i.z-a.z,x=Math.abs(l),E=Math.abs(c),S=Math.abs(h),R,v,T,P,C,I,O,L,k,V,W,K;if(x>=E&&x>=S?(T=l,I=d,k=m,K=p,l>=0?(R=c,v=h,P=u,C=f,O=y,L=g,V=M,W=w):(R=h,v=c,P=f,C=u,O=g,L=y,V=w,W=M)):E>=S?(T=c,I=u,k=y,K=M,c>=0?(R=h,v=l,P=f,C=d,O=g,L=m,V=w,W=p):(R=l,v=h,P=d,C=f,O=m,L=g,V=p,W=w)):(T=h,I=f,k=g,K=w,h>=0?(R=l,v=c,P=d,C=u,O=m,L=y,V=p,W=M):(R=c,v=l,P=u,C=d,O=y,L=m,V=M,W=p)),T===0)return null;let q=R/T,Q=v/T,it=1/T,Dt=P-q*I,At=C-Q*I,le=O-q*k,te=L-Q*k,re=V-q*K,Z=W-Q*K,tt=re*te-Z*le,vt=Dt*Z-At*re,Vt=le*At-te*Dt;if(s){if(tt<0||vt<0||Vt<0)return null}else if((tt<0||vt<0||Vt<0)&&(tt>0||vt>0||Vt>0))return null;let St=tt+vt+Vt;if(St===0)return null;let Xt=it*(tt*I+vt*k+Vt*K);return(St>0?Xt<0:Xt>0)?null:this.at(Xt/St,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Ne=class extends $i{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Rt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ei,this.combine=jl,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}},mh=new ge,bn=new $s,Wr=new qi,gh=new D,Xr=new D,qr=new D,$r=new D,Rl=new D,Yr=new D,xh=new D,Zr=new D,lt=class extends De{constructor(t=new Re,e=new Ne){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){let s=e[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(t,e){let i=this.geometry,s=i.attributes.position,r=i.morphAttributes.position,a=i.morphTargetsRelative;e.fromBufferAttribute(s,t);let o=this.morphTargetInfluences;if(r&&o){Yr.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let h=o[l],d=r[l];h!==0&&(Rl.fromBufferAttribute(d,t),a?Yr.addScaledVector(Rl,h):Yr.addScaledVector(Rl.sub(e),h))}e.add(Yr)}return e}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let i=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Wr.copy(i.boundingSphere),Wr.applyMatrix4(r),bn.copy(t.ray).recast(t.near),!(Wr.containsPoint(bn.origin)===!1&&(bn.intersectSphere(Wr,gh)===null||bn.origin.distanceToSquared(gh)>(t.far-t.near)**2))&&(mh.copy(r).invert(),bn.copy(t.ray).applyMatrix4(mh),!(i.boundingBox!==null&&bn.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(t,e,bn)))}_computeIntersections(t,e,i){let s,r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,d=r.attributes.normal,u=r.groups,f=r.drawRange;if(o!==null)if(Array.isArray(a))for(let m=0,y=u.length;m<y;m++){let g=u[m],p=a[g.materialIndex],M=Math.max(g.start,f.start),w=Math.min(o.count,Math.min(g.start+g.count,f.start+f.count));for(let x=M,E=w;x<E;x+=3){let S=o.getX(x),R=o.getX(x+1),v=o.getX(x+2);s=Jr(this,p,t,i,c,h,d,S,R,v),s&&(s.faceIndex=Math.floor(x/3),s.face.materialIndex=g.materialIndex,e.push(s))}}else{let m=Math.max(0,f.start),y=Math.min(o.count,f.start+f.count);for(let g=m,p=y;g<p;g+=3){let M=o.getX(g),w=o.getX(g+1),x=o.getX(g+2);s=Jr(this,a,t,i,c,h,d,M,w,x),s&&(s.faceIndex=Math.floor(g/3),e.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let m=0,y=u.length;m<y;m++){let g=u[m],p=a[g.materialIndex],M=Math.max(g.start,f.start),w=Math.min(l.count,Math.min(g.start+g.count,f.start+f.count));for(let x=M,E=w;x<E;x+=3){let S=x,R=x+1,v=x+2;s=Jr(this,p,t,i,c,h,d,S,R,v),s&&(s.faceIndex=Math.floor(x/3),s.face.materialIndex=g.materialIndex,e.push(s))}}else{let m=Math.max(0,f.start),y=Math.min(l.count,f.start+f.count);for(let g=m,p=y;g<p;g+=3){let M=g,w=g+1,x=g+2;s=Jr(this,a,t,i,c,h,d,M,w,x),s&&(s.faceIndex=Math.floor(g/3),e.push(s))}}}};function Zd(n,t,e,i,s,r,a,o){let l;if(t.side===Ve?l=i.intersectTriangle(a,r,s,!0,o):l=i.intersectTriangle(s,r,a,t.side===dn,o),l===null)return null;Zr.copy(o),Zr.applyMatrix4(n.matrixWorld);let c=e.ray.origin.distanceTo(Zr);return c<e.near||c>e.far?null:{distance:c,point:Zr.clone(),object:n}}function Jr(n,t,e,i,s,r,a,o,l,c){n.getVertexPosition(o,Xr),n.getVertexPosition(l,qr),n.getVertexPosition(c,$r);let h=Zd(n,t,e,i,Xr,qr,$r,xh);if(h){let d=new D;rn.getBarycoord(xh,Xr,qr,$r,d),s&&(h.uv=rn.getInterpolatedAttribute(s,o,l,c,d,new dt)),r&&(h.uv1=rn.getInterpolatedAttribute(r,o,l,c,d,new dt)),a&&(h.normal=rn.getInterpolatedAttribute(a,o,l,c,d,new D),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));let u={a:o,b:l,c,normal:new D,materialIndex:0};rn.getNormal(Xr,qr,$r,u.normal),h.face=u,h.barycoord=d}return h}var Ys=class extends Qe{constructor(t=null,e=1,i=1,s,r,a,o,l,c=He,h=He,d,u){super(null,a,o,l,c,h,s,r,d,u),this.isDataTexture=!0,this.image={data:t,width:e,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Tn=class extends Je{constructor(t,e,i,s=1){super(t,e,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){let t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}},Zn=new ge,_h=new ge,Kr=[],vh=new Ui,Jd=new ge,Ls=new lt,Ds=new qi,on=class extends lt{constructor(t,e,i){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new Tn(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<i;s++)this.setMatrixAt(s,Jd)}computeBoundingBox(){let t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new Ui),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<e;i++)this.getMatrixAt(i,Zn),vh.copy(t.boundingBox).applyMatrix4(Zn),this.boundingBox.union(vh)}computeBoundingSphere(){let t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new qi),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<e;i++)this.getMatrixAt(i,Zn),Ds.copy(t.boundingSphere).applyMatrix4(Zn),this.boundingSphere.union(Ds)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){return this.instanceColor===null?e.setRGB(1,1,1):e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){return e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){let i=e.morphTargetInfluences,s=this.morphTexture.source.data.data,r=i.length+1,a=t*r+1;for(let o=0;o<i.length;o++)i[o]=s[a+o]}raycast(t,e){let i=this.matrixWorld,s=this.count;if(Ls.geometry=this.geometry,Ls.material=this.material,Ls.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Ds.copy(this.boundingSphere),Ds.applyMatrix4(i),t.ray.intersectsSphere(Ds)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,Zn),_h.multiplyMatrices(i,Zn),Ls.matrixWorld=_h,Ls.raycast(t,Kr);for(let a=0,o=Kr.length;a<o;a++){let l=Kr[a];l.instanceId=r,l.object=this,e.push(l)}Kr.length=0}}setColorAt(t,e){return this.instanceColor===null&&(this.instanceColor=new Tn(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3),this}setMatrixAt(t,e){return e.toArray(this.instanceMatrix.array,t*16),this}setMorphAt(t,e){let i=e.morphTargetInfluences,s=i.length+1;this.morphTexture===null&&(this.morphTexture=new Ys(new Float32Array(s*this.count),s,this.count,Za,pi));let r=this.morphTexture.source.data.data,a=0;for(let c=0;c<i.length;c++)a+=i[c];let o=this.geometry.morphTargetsRelative?1:1-a,l=s*t;return r[l]=o,r.set(i,l+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Sn=new qi,Kd=new dt(.5,.5),jr=new D,rs=class{constructor(t=new bi,e=new bi,i=new bi,s=new bi,r=new bi,a=new bi){this.planes=[t,e,i,s,r,a]}set(t,e,i,s,r,a){let o=this.planes;return o[0].copy(t),o[1].copy(e),o[2].copy(i),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(t){let e=this.planes;for(let i=0;i<6;i++)e[i].copy(t.planes[i]);return this}setFromProjectionMatrix(t,e=Si,i=!1){let s=this.planes,r=t.elements,a=r[0],o=r[1],l=r[2],c=r[3],h=r[4],d=r[5],u=r[6],f=r[7],m=r[8],y=r[9],g=r[10],p=r[11],M=r[12],w=r[13],x=r[14],E=r[15];if(s[0].setComponents(c-a,f-h,p-m,E-M).normalize(),s[1].setComponents(c+a,f+h,p+m,E+M).normalize(),s[2].setComponents(c+o,f+d,p+y,E+w).normalize(),s[3].setComponents(c-o,f-d,p-y,E-w).normalize(),i)s[4].setComponents(l,u,g,x).normalize(),s[5].setComponents(c-l,f-u,p-g,E-x).normalize();else if(s[4].setComponents(c-l,f-u,p-g,E-x).normalize(),e===Si)s[5].setComponents(c+l,f+u,p+g,E+x).normalize();else if(e===es)s[5].setComponents(l,u,g,x).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),Sn.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),Sn.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(Sn)}intersectsSprite(t){Sn.center.set(0,0,0);let e=Kd.distanceTo(t.center);return Sn.radius=.7071067811865476+e,Sn.applyMatrix4(t.matrixWorld),this.intersectsSphere(Sn)}intersectsSphere(t){let e=this.planes,i=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(i)<s)return!1;return!0}intersectsBox(t){let e=this.planes;for(let i=0;i<6;i++){let s=e[i];if(jr.x=s.normal.x>0?t.max.x:t.min.x,jr.y=s.normal.y>0?t.max.y:t.min.y,jr.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(jr)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let i=0;i<6;i++)if(e[i].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var An=class extends $i{constructor(t){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Rt(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}},yh=new ge,kl=new $s,Qr=new qi,ta=new D,as=class extends De{constructor(t=new Re,e=new An){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let i=this.geometry,s=this.matrixWorld,r=t.params.Points.threshold,a=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),Qr.copy(i.boundingSphere),Qr.applyMatrix4(s),Qr.radius+=r,t.ray.intersectsSphere(Qr)===!1)return;yh.copy(s).invert(),kl.copy(t.ray).applyMatrix4(yh);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=i.index,d=i.attributes.position;if(c!==null){let u=Math.max(0,a.start),f=Math.min(c.count,a.start+a.count);for(let m=u,y=f;m<y;m++){let g=c.getX(m);ta.fromBufferAttribute(d,g),Mh(ta,g,l,s,t,e,this)}}else{let u=Math.max(0,a.start),f=Math.min(d.count,a.start+a.count);for(let m=u,y=f;m<y;m++)ta.fromBufferAttribute(d,m),Mh(ta,m,l,s,t,e,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){let s=e[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function Mh(n,t,e,i,s,r,a){let o=kl.distanceSqToPoint(n);if(o<e){let l=new D;kl.closestPointToPoint(n,l),l.applyMatrix4(i);let c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:t,face:null,faceIndex:null,barycoord:null,object:a})}}var Zs=class extends Qe{constructor(t=[],e=fn,i,s,r,a,o,l,c,h){super(t,e,i,s,r,a,o,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},ni=class extends Qe{constructor(t,e,i,s,r,a,o,l,c){super(t,e,i,s,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}};var ln=class extends Qe{constructor(t,e,i=Ti,s,r,a,o=He,l=He,c,h=Li,d=1){if(h!==Li&&h!==mn)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let u={width:t,height:e,depth:d};super(u,s,r,a,o,l,h,i,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new ns(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return e.compareFunction=this.compareFunction,e}},ya=class extends ln{constructor(t,e=Ti,i=fn,s,r,a=He,o=He,l,c=Li){let h={width:t,height:t,depth:1},d=[h,h,h,h,h,h];super(t,t,e,i,s,r,a,o,l,c),this.image=d,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}},Js=class extends Qe{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}},Qt=class n extends Re{constructor(t=1,e=1,i=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:i,widthSegments:s,heightSegments:r,depthSegments:a};let o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let l=[],c=[],h=[],d=[],u=0,f=0;m("z","y","x",-1,-1,i,e,t,a,r,0),m("z","y","x",1,-1,i,e,-t,a,r,1),m("x","z","y",1,1,t,i,e,s,a,2),m("x","z","y",1,-1,t,i,-e,s,a,3),m("x","y","z",1,-1,t,e,i,s,r,4),m("x","y","z",-1,-1,t,e,-i,s,r,5),this.setIndex(l),this.setAttribute("position",new fe(c,3)),this.setAttribute("normal",new fe(h,3)),this.setAttribute("uv",new fe(d,2));function m(y,g,p,M,w,x,E,S,R,v,T){let P=x/R,C=E/v,I=x/2,O=E/2,L=S/2,k=R+1,V=v+1,W=0,K=0,q=new D;for(let Q=0;Q<V;Q++){let it=Q*C-O;for(let Dt=0;Dt<k;Dt++){let At=Dt*P-I;q[y]=At*M,q[g]=it*w,q[p]=L,c.push(q.x,q.y,q.z),q[y]=0,q[g]=0,q[p]=S>0?1:-1,h.push(q.x,q.y,q.z),d.push(Dt/R),d.push(1-Q/v),W+=1}}for(let Q=0;Q<v;Q++)for(let it=0;it<R;it++){let Dt=u+it+k*Q,At=u+it+k*(Q+1),le=u+(it+1)+k*(Q+1),te=u+(it+1)+k*Q;l.push(Dt,At,te),l.push(At,le,te),K+=6}o.addGroup(f,K,T),f+=K,u+=W}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};var we=class n extends Re{constructor(t=1,e=1,i=1,s=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:i,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};let c=this;s=Math.floor(s),r=Math.floor(r);let h=[],d=[],u=[],f=[],m=0,y=[],g=i/2,p=0;M(),a===!1&&(t>0&&w(!0),e>0&&w(!1)),this.setIndex(h),this.setAttribute("position",new fe(d,3)),this.setAttribute("normal",new fe(u,3)),this.setAttribute("uv",new fe(f,2));function M(){let x=new D,E=new D,S=0,R=(e-t)/i;for(let v=0;v<=r;v++){let T=[],P=v/r,C=P*(e-t)+t;for(let I=0;I<=s;I++){let O=I/s,L=O*l+o,k=Math.sin(L),V=Math.cos(L);E.x=C*k,E.y=-P*i+g,E.z=C*V,d.push(E.x,E.y,E.z),x.set(k,R,V).normalize(),u.push(x.x,x.y,x.z),f.push(O,1-P),T.push(m++)}y.push(T)}for(let v=0;v<s;v++)for(let T=0;T<r;T++){let P=y[T][v],C=y[T+1][v],I=y[T+1][v+1],O=y[T][v+1];(t>0||T!==0)&&(h.push(P,C,O),S+=3),(e>0||T!==r-1)&&(h.push(C,I,O),S+=3)}c.addGroup(p,S,0),p+=S}function w(x){let E=m,S=new dt,R=new D,v=0,T=x===!0?t:e,P=x===!0?1:-1;for(let I=1;I<=s;I++)d.push(0,g*P,0),u.push(0,P,0),f.push(.5,.5),m++;let C=m;for(let I=0;I<=s;I++){let L=I/s*l+o,k=Math.cos(L),V=Math.sin(L);R.x=T*V,R.y=g*P,R.z=T*k,d.push(R.x,R.y,R.z),u.push(0,P,0),S.x=k*.5+.5,S.y=V*.5*P+.5,f.push(S.x,S.y),m++}for(let I=0;I<s;I++){let O=E+I,L=C+I;x===!0?h.push(L,L+1,O):h.push(L+1,L,O),v+=3}c.addGroup(p,v,x===!0?1:2),p+=v}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Rn=class n extends we{constructor(t=1,e=1,i=32,s=1,r=!1,a=0,o=Math.PI*2){super(0,t,e,i,s,r,a,o),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:i,heightSegments:s,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(t){return new n(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}};var li=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){Gt("Curve: .getPoint() not implemented.")}getPointAt(t,e){let i=this.getUtoTmapping(t);return this.getPoint(i,e)}getPoints(t=5){let e=[];for(let i=0;i<=t;i++)e.push(this.getPoint(i/t));return e}getSpacedPoints(t=5){let e=[];for(let i=0;i<=t;i++)e.push(this.getPointAt(i/t));return e}getLength(){let t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let e=[],i,s=this.getPoint(0),r=0;e.push(0);for(let a=1;a<=t;a++)i=this.getPoint(a/t),r+=i.distanceTo(s),e.push(r),s=i;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e=null){let i=this.getLengths(),s=0,r=i.length,a;e?a=e:a=t*i[r-1];let o=0,l=r-1,c;for(;o<=l;)if(s=Math.floor(o+(l-o)/2),c=i[s]-a,c<0)o=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,i[s]===a)return s/(r-1);let h=i[s],u=i[s+1]-h,f=(a-h)/u;return(s+f)/(r-1)}getTangent(t,e){let s=t-1e-4,r=t+1e-4;s<0&&(s=0),r>1&&(r=1);let a=this.getPoint(s),o=this.getPoint(r),l=e||(a.isVector2?new dt:new D);return l.copy(o).sub(a).normalize(),l}getTangentAt(t,e){let i=this.getUtoTmapping(t);return this.getTangent(i,e)}computeFrenetFrames(t,e=!1){let i=new D,s=[],r=[],a=[],o=new D,l=new ge;for(let f=0;f<=t;f++){let m=f/t;s[f]=this.getTangentAt(m,new D)}r[0]=new D,a[0]=new D;let c=Number.MAX_VALUE,h=Math.abs(s[0].x),d=Math.abs(s[0].y),u=Math.abs(s[0].z);h<=c&&(c=h,i.set(1,0,0)),d<=c&&(c=d,i.set(0,1,0)),u<=c&&i.set(0,0,1),o.crossVectors(s[0],i).normalize(),r[0].crossVectors(s[0],o),a[0].crossVectors(s[0],r[0]);for(let f=1;f<=t;f++){if(r[f]=r[f-1].clone(),a[f]=a[f-1].clone(),o.crossVectors(s[f-1],s[f]),o.length()>Number.EPSILON){o.normalize();let m=Math.acos(jt(s[f-1].dot(s[f]),-1,1));r[f].applyMatrix4(l.makeRotationAxis(o,m))}a[f].crossVectors(s[f],r[f])}if(e===!0){let f=Math.acos(jt(r[0].dot(r[t]),-1,1));f/=t,s[0].dot(o.crossVectors(r[0],r[t]))>0&&(f=-f);for(let m=1;m<=t;m++)r[m].applyMatrix4(l.makeRotationAxis(s[m],f*m)),a[m].crossVectors(s[m],r[m])}return{tangents:s,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){let t={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}},os=class extends li{constructor(t=0,e=0,i=1,s=1,r=0,a=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=i,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=l}getPoint(t,e=new dt){let i=e,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(a?r=0:r=s),this.aClockwise===!0&&!a&&(r===s?r=-s:r=r-s);let o=this.aStartAngle+t*r,l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let h=Math.cos(this.aRotation),d=Math.sin(this.aRotation),u=l-this.aX,f=c-this.aY;l=u*h-f*d+this.aX,c=u*d+f*h+this.aY}return i.set(l,c)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){let t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}},Ma=class extends os{constructor(t,e,i,s,r,a){super(t,e,i,i,s,r,a),this.isArcCurve=!0,this.type="ArcCurve"}};function pc(){let n=0,t=0,e=0,i=0;function s(r,a,o,l){n=r,t=o,e=-3*r+3*a-2*o-l,i=2*r-2*a+o+l}return{initCatmullRom:function(r,a,o,l,c){s(a,o,c*(o-r),c*(l-a))},initNonuniformCatmullRom:function(r,a,o,l,c,h,d){let u=(a-r)/c-(o-r)/(c+h)+(o-a)/h,f=(o-a)/h-(l-a)/(h+d)+(l-o)/d;u*=h,f*=h,s(a,o,u,f)},calc:function(r){let a=r*r,o=a*r;return n+t*r+e*a+i*o}}}var bh=new D,Sh=new D,Cl=new pc,Pl=new pc,Il=new pc,ba=class extends li{constructor(t=[],e=!1,i="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=i,this.tension=s}getPoint(t,e=new D){let i=e,s=this.points,r=s.length,a=(r-(this.closed?0:1))*t,o=Math.floor(a),l=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:l===0&&o===r-1&&(o=r-2,l=1);let c,h;this.closed||o>0?c=s[(o-1)%r]:(Sh.subVectors(s[0],s[1]).add(s[0]),c=Sh);let d=s[o%r],u=s[(o+1)%r];if(this.closed||o+2<r?h=s[(o+2)%r]:(bh.subVectors(s[r-1],s[r-2]).add(s[r-1]),h=bh),this.curveType==="centripetal"||this.curveType==="chordal"){let f=this.curveType==="chordal"?.5:.25,m=Math.pow(c.distanceToSquared(d),f),y=Math.pow(d.distanceToSquared(u),f),g=Math.pow(u.distanceToSquared(h),f);y<1e-4&&(y=1),m<1e-4&&(m=y),g<1e-4&&(g=y),Cl.initNonuniformCatmullRom(c.x,d.x,u.x,h.x,m,y,g),Pl.initNonuniformCatmullRom(c.y,d.y,u.y,h.y,m,y,g),Il.initNonuniformCatmullRom(c.z,d.z,u.z,h.z,m,y,g)}else this.curveType==="catmullrom"&&(Cl.initCatmullRom(c.x,d.x,u.x,h.x,this.tension),Pl.initCatmullRom(c.y,d.y,u.y,h.y,this.tension),Il.initCatmullRom(c.z,d.z,u.z,h.z,this.tension));return i.set(Cl.calc(l),Pl.calc(l),Il.calc(l)),i}copy(t){super.copy(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){let s=t.points[e];this.points.push(s.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,i=this.points.length;e<i;e++){let s=this.points[e];t.points.push(s.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){let s=t.points[e];this.points.push(new D().fromArray(s))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}};function Eh(n,t,e,i,s){let r=(i-t)*.5,a=(s-e)*.5,o=n*n,l=n*o;return(2*e-2*i+r+a)*l+(-3*e+3*i-2*r-a)*o+r*n+e}function jd(n,t){let e=1-n;return e*e*t}function Qd(n,t){return 2*(1-n)*n*t}function tf(n,t){return n*n*t}function Us(n,t,e,i){return jd(n,t)+Qd(n,e)+tf(n,i)}function ef(n,t){let e=1-n;return e*e*e*t}function nf(n,t){let e=1-n;return 3*e*e*n*t}function sf(n,t){return 3*(1-n)*n*n*t}function rf(n,t){return n*n*n*t}function Fs(n,t,e,i,s){return ef(n,t)+nf(n,e)+sf(n,i)+rf(n,s)}var Ks=class extends li{constructor(t=new dt,e=new dt,i=new dt,s=new dt){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=i,this.v3=s}getPoint(t,e=new dt){let i=e,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return i.set(Fs(t,s.x,r.x,a.x,o.x),Fs(t,s.y,r.y,a.y,o.y)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},Sa=class extends li{constructor(t=new D,e=new D,i=new D,s=new D){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=i,this.v3=s}getPoint(t,e=new D){let i=e,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return i.set(Fs(t,s.x,r.x,a.x,o.x),Fs(t,s.y,r.y,a.y,o.y),Fs(t,s.z,r.z,a.z,o.z)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},js=class extends li{constructor(t=new dt,e=new dt){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new dt){let i=e;return t===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(t).add(this.v1)),i}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new dt){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Ea=class extends li{constructor(t=new D,e=new D){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new D){let i=e;return t===1?i.copy(this.v2):(i.copy(this.v2).sub(this.v1),i.multiplyScalar(t).add(this.v1)),i}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new D){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Qs=class extends li{constructor(t=new dt,e=new dt,i=new dt){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=i}getPoint(t,e=new dt){let i=e,s=this.v0,r=this.v1,a=this.v2;return i.set(Us(t,s.x,r.x,a.x),Us(t,s.y,r.y,a.y)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},wa=class extends li{constructor(t=new D,e=new D,i=new D){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=i}getPoint(t,e=new D){let i=e,s=this.v0,r=this.v1,a=this.v2;return i.set(Us(t,s.x,r.x,a.x),Us(t,s.y,r.y,a.y),Us(t,s.z,r.z,a.z)),i}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},tr=class extends li{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new dt){let i=e,s=this.points,r=(s.length-1)*t,a=Math.floor(r),o=r-a,l=s[a===0?a:a-1],c=s[a],h=s[a>s.length-2?s.length-1:a+1],d=s[a>s.length-3?s.length-1:a+2];return i.set(Eh(o,l.x,c.x,h.x,d.x),Eh(o,l.y,c.y,h.y,d.y)),i}copy(t){super.copy(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){let s=t.points[e];this.points.push(s.clone())}return this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,i=this.points.length;e<i;e++){let s=this.points[e];t.points.push(s.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,i=t.points.length;e<i;e++){let s=t.points[e];this.points.push(new dt().fromArray(s))}return this}},Bl=Object.freeze({__proto__:null,ArcCurve:Ma,CatmullRomCurve3:ba,CubicBezierCurve:Ks,CubicBezierCurve3:Sa,EllipseCurve:os,LineCurve:js,LineCurve3:Ea,QuadraticBezierCurve:Qs,QuadraticBezierCurve3:wa,SplineCurve:tr}),Ta=class extends li{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(t){this.curves.push(t)}closePath(){let t=this.curves[0].getPoint(0),e=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(e)){let i=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Bl[i](e,t))}return this}getPoint(t,e){let i=t*this.getLength(),s=this.getCurveLengths(),r=0;for(;r<s.length;){if(s[r]>=i){let a=s[r]-i,o=this.curves[r],l=o.getLength(),c=l===0?0:1-a/l;return o.getPointAt(c,e)}r++}return null}getLength(){let t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let t=[],e=0;for(let i=0,s=this.curves.length;i<s;i++)e+=this.curves[i].getLength(),t.push(e);return this.cacheLengths=t,t}getSpacedPoints(t=40){let e=[];for(let i=0;i<=t;i++)e.push(this.getPoint(i/t));return this.autoClose&&e.push(e[0]),e}getPoints(t=12){let e=[],i;for(let s=0,r=this.curves;s<r.length;s++){let a=r[s],o=a.isEllipseCurve?t*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?t*a.points.length:t,l=a.getPoints(o);for(let c=0;c<l.length;c++){let h=l[c];i&&i.equals(h)||(e.push(h),i=h)}}return this.autoClose&&e.length>1&&!e[e.length-1].equals(e[0])&&e.push(e[0]),e}copy(t){super.copy(t),this.curves=[];for(let e=0,i=t.curves.length;e<i;e++){let s=t.curves[e];this.curves.push(s.clone())}return this.autoClose=t.autoClose,this}toJSON(){let t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let e=0,i=this.curves.length;e<i;e++){let s=this.curves[e];t.curves.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let e=0,i=t.curves.length;e<i;e++){let s=t.curves[e];this.curves.push(new Bl[s.type]().fromJSON(s))}return this}},er=class extends Ta{constructor(t){super(),this.type="Path",this.currentPoint=new dt,t&&this.setFromPoints(t)}setFromPoints(t){this.moveTo(t[0].x,t[0].y);for(let e=1,i=t.length;e<i;e++)this.lineTo(t[e].x,t[e].y);return this}moveTo(t,e){return this.currentPoint.set(t,e),this}lineTo(t,e){let i=new js(this.currentPoint.clone(),new dt(t,e));return this.curves.push(i),this.currentPoint.set(t,e),this}quadraticCurveTo(t,e,i,s){let r=new Qs(this.currentPoint.clone(),new dt(t,e),new dt(i,s));return this.curves.push(r),this.currentPoint.set(i,s),this}bezierCurveTo(t,e,i,s,r,a){let o=new Ks(this.currentPoint.clone(),new dt(t,e),new dt(i,s),new dt(r,a));return this.curves.push(o),this.currentPoint.set(r,a),this}splineThru(t){let e=[this.currentPoint.clone()].concat(t),i=new tr(e);return this.curves.push(i),this.currentPoint.copy(t[t.length-1]),this}arc(t,e,i,s,r,a){let o=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(t+o,e+l,i,s,r,a),this}absarc(t,e,i,s,r,a){return this.absellipse(t,e,i,i,s,r,a),this}ellipse(t,e,i,s,r,a,o,l){let c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(t+c,e+h,i,s,r,a,o,l),this}absellipse(t,e,i,s,r,a,o,l){let c=new os(t,e,i,s,r,a,o,l);if(this.curves.length>0){let d=c.getPoint(0);d.equals(this.currentPoint)||this.lineTo(d.x,d.y)}this.curves.push(c);let h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(t){return super.copy(t),this.currentPoint.copy(t.currentPoint),this}toJSON(){let t=super.toJSON();return t.currentPoint=this.currentPoint.toArray(),t}fromJSON(t){return super.fromJSON(t),this.currentPoint.fromArray(t.currentPoint),this}},ls=class extends er{constructor(t){super(t),this.uuid=gs(),this.type="Shape",this.holes=[]}getPointsHoles(t){let e=[];for(let i=0,s=this.holes.length;i<s;i++)e[i]=this.holes[i].getPoints(t);return e}extractPoints(t){return{shape:this.getPoints(t),holes:this.getPointsHoles(t)}}copy(t){super.copy(t),this.holes=[];for(let e=0,i=t.holes.length;e<i;e++){let s=t.holes[e];this.holes.push(s.clone())}return this}toJSON(){let t=super.toJSON();t.uuid=this.uuid,t.holes=[];for(let e=0,i=this.holes.length;e<i;e++){let s=this.holes[e];t.holes.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.uuid=t.uuid,this.holes=[];for(let e=0,i=t.holes.length;e<i;e++){let s=t.holes[e];this.holes.push(new er().fromJSON(s))}return this}};function af(n,t,e=2){let i=t&&t.length,s=i?t[0]*e:n.length,r=vu(n,0,s,e,!0),a=[];if(!r||r.next===r.prev)return a;let o,l,c;if(i&&(r=uf(n,t,r,e)),n.length>80*e){o=n[0],l=n[1];let h=o,d=l;for(let u=e;u<s;u+=e){let f=n[u],m=n[u+1];f<o&&(o=f),m<l&&(l=m),f>h&&(h=f),m>d&&(d=m)}c=Math.max(h-o,d-l),c=c!==0?32767/c:0}return ir(r,a,e,o,l,c,0),a}function vu(n,t,e,i,s){let r;if(s===bf(n,t,e,i)>0)for(let a=t;a<e;a+=i)r=wh(a/i|0,n[a],n[a+1],r);else for(let a=e-i;a>=t;a-=i)r=wh(a/i|0,n[a],n[a+1],r);return r&&cs(r,r.next)&&(sr(r),r=r.next),r}function Cn(n,t){if(!n)return n;t||(t=n);let e=n,i;do if(i=!1,!e.steiner&&(cs(e,e.next)||Ae(e.prev,e,e.next)===0)){if(sr(e),e=t=e.prev,e===e.next)break;i=!0}else e=e.next;while(i||e!==t);return t}function ir(n,t,e,i,s,r,a){if(!n)return;!a&&r&&gf(n,i,s,r);let o=n;for(;n.prev!==n.next;){let l=n.prev,c=n.next;if(r?lf(n,i,s,r):of(n)){t.push(l.i,n.i,c.i),sr(n),n=c.next,o=c.next;continue}if(n=c,n===o){a?a===1?(n=cf(Cn(n),t),ir(n,t,e,i,s,r,2)):a===2&&hf(n,t,e,i,s,r):ir(Cn(n),t,e,i,s,r,1);break}}}function of(n){let t=n.prev,e=n,i=n.next;if(Ae(t,e,i)>=0)return!1;let s=t.x,r=e.x,a=i.x,o=t.y,l=e.y,c=i.y,h=Math.min(s,r,a),d=Math.min(o,l,c),u=Math.max(s,r,a),f=Math.max(o,l,c),m=i.next;for(;m!==t;){if(m.x>=h&&m.x<=u&&m.y>=d&&m.y<=f&&Ns(s,o,r,l,a,c,m.x,m.y)&&Ae(m.prev,m,m.next)>=0)return!1;m=m.next}return!0}function lf(n,t,e,i){let s=n.prev,r=n,a=n.next;if(Ae(s,r,a)>=0)return!1;let o=s.x,l=r.x,c=a.x,h=s.y,d=r.y,u=a.y,f=Math.min(o,l,c),m=Math.min(h,d,u),y=Math.max(o,l,c),g=Math.max(h,d,u),p=zl(f,m,t,e,i),M=zl(y,g,t,e,i),w=n.prevZ,x=n.nextZ;for(;w&&w.z>=p&&x&&x.z<=M;){if(w.x>=f&&w.x<=y&&w.y>=m&&w.y<=g&&w!==s&&w!==a&&Ns(o,h,l,d,c,u,w.x,w.y)&&Ae(w.prev,w,w.next)>=0||(w=w.prevZ,x.x>=f&&x.x<=y&&x.y>=m&&x.y<=g&&x!==s&&x!==a&&Ns(o,h,l,d,c,u,x.x,x.y)&&Ae(x.prev,x,x.next)>=0))return!1;x=x.nextZ}for(;w&&w.z>=p;){if(w.x>=f&&w.x<=y&&w.y>=m&&w.y<=g&&w!==s&&w!==a&&Ns(o,h,l,d,c,u,w.x,w.y)&&Ae(w.prev,w,w.next)>=0)return!1;w=w.prevZ}for(;x&&x.z<=M;){if(x.x>=f&&x.x<=y&&x.y>=m&&x.y<=g&&x!==s&&x!==a&&Ns(o,h,l,d,c,u,x.x,x.y)&&Ae(x.prev,x,x.next)>=0)return!1;x=x.nextZ}return!0}function cf(n,t){let e=n;do{let i=e.prev,s=e.next.next;!cs(i,s)&&Mu(i,e,e.next,s)&&nr(i,s)&&nr(s,i)&&(t.push(i.i,e.i,s.i),sr(e),sr(e.next),e=n=s),e=e.next}while(e!==n);return Cn(e)}function hf(n,t,e,i,s,r){let a=n;do{let o=a.next.next;for(;o!==a.prev;){if(a.i!==o.i&&vf(a,o)){let l=bu(a,o);a=Cn(a,a.next),l=Cn(l,l.next),ir(a,t,e,i,s,r,0),ir(l,t,e,i,s,r,0);return}o=o.next}a=a.next}while(a!==n)}function uf(n,t,e,i){let s=[];for(let r=0,a=t.length;r<a;r++){let o=t[r]*i,l=r<a-1?t[r+1]*i:n.length,c=vu(n,o,l,i,!1);c===c.next&&(c.steiner=!0),s.push(_f(c))}s.sort(df);for(let r=0;r<s.length;r++)e=ff(s[r],e);return e}function df(n,t){let e=n.x-t.x;if(e===0&&(e=n.y-t.y,e===0)){let i=(n.next.y-n.y)/(n.next.x-n.x),s=(t.next.y-t.y)/(t.next.x-t.x);e=i-s}return e}function ff(n,t){let e=pf(n,t);if(!e)return t;let i=bu(e,n);return Cn(i,i.next),Cn(e,e.next)}function pf(n,t){let e=t,i=n.x,s=n.y,r=-1/0,a;if(cs(n,e))return e;do{if(cs(n,e.next))return e.next;if(s<=e.y&&s>=e.next.y&&e.next.y!==e.y){let d=e.x+(s-e.y)*(e.next.x-e.x)/(e.next.y-e.y);if(d<=i&&d>r&&(r=d,a=e.x<e.next.x?e:e.next,d===i))return a}e=e.next}while(e!==t);if(!a)return null;let o=a,l=a.x,c=a.y,h=1/0;e=a;do{if(i>=e.x&&e.x>=l&&i!==e.x&&yu(s<c?i:r,s,l,c,s<c?r:i,s,e.x,e.y)){let d=Math.abs(s-e.y)/(i-e.x);nr(e,n)&&(d<h||d===h&&(e.x>a.x||e.x===a.x&&mf(a,e)))&&(a=e,h=d)}e=e.next}while(e!==o);return a}function mf(n,t){return Ae(n.prev,n,t.prev)<0&&Ae(t.next,n,n.next)<0}function gf(n,t,e,i){let s=n;do s.z===0&&(s.z=zl(s.x,s.y,t,e,i)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==n);s.prevZ.nextZ=null,s.prevZ=null,xf(s)}function xf(n){let t,e=1;do{let i=n,s;n=null;let r=null;for(t=0;i;){t++;let a=i,o=0;for(let c=0;c<e&&(o++,a=a.nextZ,!!a);c++);let l=e;for(;o>0||l>0&&a;)o!==0&&(l===0||!a||i.z<=a.z)?(s=i,i=i.nextZ,o--):(s=a,a=a.nextZ,l--),r?r.nextZ=s:n=s,s.prevZ=r,r=s;i=a}r.nextZ=null,e*=2}while(t>1);return n}function zl(n,t,e,i,s){return n=(n-e)*s|0,t=(t-i)*s|0,n=(n|n<<8)&16711935,n=(n|n<<4)&252645135,n=(n|n<<2)&858993459,n=(n|n<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,n|t<<1}function _f(n){let t=n,e=n;do(t.x<e.x||t.x===e.x&&t.y<e.y)&&(e=t),t=t.next;while(t!==n);return e}function yu(n,t,e,i,s,r,a,o){return(s-a)*(t-o)>=(n-a)*(r-o)&&(n-a)*(i-o)>=(e-a)*(t-o)&&(e-a)*(r-o)>=(s-a)*(i-o)}function Ns(n,t,e,i,s,r,a,o){return!(n===a&&t===o)&&yu(n,t,e,i,s,r,a,o)}function vf(n,t){return n.next.i!==t.i&&n.prev.i!==t.i&&!yf(n,t)&&(nr(n,t)&&nr(t,n)&&Mf(n,t)&&(Ae(n.prev,n,t.prev)||Ae(n,t.prev,t))||cs(n,t)&&Ae(n.prev,n,n.next)>0&&Ae(t.prev,t,t.next)>0)}function Ae(n,t,e){return(t.y-n.y)*(e.x-t.x)-(t.x-n.x)*(e.y-t.y)}function cs(n,t){return n.x===t.x&&n.y===t.y}function Mu(n,t,e,i){let s=ia(Ae(n,t,e)),r=ia(Ae(n,t,i)),a=ia(Ae(e,i,n)),o=ia(Ae(e,i,t));return!!(s!==r&&a!==o||s===0&&ea(n,e,t)||r===0&&ea(n,i,t)||a===0&&ea(e,n,i)||o===0&&ea(e,t,i))}function ea(n,t,e){return t.x<=Math.max(n.x,e.x)&&t.x>=Math.min(n.x,e.x)&&t.y<=Math.max(n.y,e.y)&&t.y>=Math.min(n.y,e.y)}function ia(n){return n>0?1:n<0?-1:0}function yf(n,t){let e=n;do{if(e.i!==n.i&&e.next.i!==n.i&&e.i!==t.i&&e.next.i!==t.i&&Mu(e,e.next,n,t))return!0;e=e.next}while(e!==n);return!1}function nr(n,t){return Ae(n.prev,n,n.next)<0?Ae(n,t,n.next)>=0&&Ae(n,n.prev,t)>=0:Ae(n,t,n.prev)<0||Ae(n,n.next,t)<0}function Mf(n,t){let e=n,i=!1,s=(n.x+t.x)/2,r=(n.y+t.y)/2;do e.y>r!=e.next.y>r&&e.next.y!==e.y&&s<(e.next.x-e.x)*(r-e.y)/(e.next.y-e.y)+e.x&&(i=!i),e=e.next;while(e!==n);return i}function bu(n,t){let e=Hl(n.i,n.x,n.y),i=Hl(t.i,t.x,t.y),s=n.next,r=t.prev;return n.next=t,t.prev=n,e.next=s,s.prev=e,i.next=e,e.prev=i,r.next=i,i.prev=r,i}function wh(n,t,e,i){let s=Hl(n,t,e);return i?(s.next=i.next,s.prev=i,i.next.prev=s,i.next=s):(s.prev=s,s.next=s),s}function sr(n){n.next.prev=n.prev,n.prev.next=n.next,n.prevZ&&(n.prevZ.nextZ=n.nextZ),n.nextZ&&(n.nextZ.prevZ=n.prevZ)}function Hl(n,t,e){return{i:n,x:t,y:e,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function bf(n,t,e,i){let s=0;for(let r=t,a=e-i;r<e;r+=i)s+=(n[a]-n[r])*(n[r+1]+n[a+1]),a=r;return s}var Gl=class{static triangulate(t,e,i=2){return af(t,e,i)}},En=class n{static area(t){let e=t.length,i=0;for(let s=e-1,r=0;r<e;s=r++)i+=t[s].x*t[r].y-t[r].x*t[s].y;return i*.5}static isClockWise(t){return n.area(t)<0}static triangulateShape(t,e){let i=[],s=[],r=[];Th(t),Ah(i,t);let a=t.length;e.forEach(Th);for(let l=0;l<e.length;l++)s.push(a),a+=e[l].length,Ah(i,e[l]);let o=Gl.triangulate(i,s);for(let l=0;l<o.length;l+=3)r.push(o.slice(l,l+3));return r}};function Th(n){let t=n.length;t>2&&n[t-1].equals(n[0])&&n.pop()}function Ah(n,t){for(let e=0;e<t.length;e++)n.push(t[e].x),n.push(t[e].y)}var rr=class n extends Re{constructor(t=new ls([new dt(.5,.5),new dt(-.5,.5),new dt(-.5,-.5),new dt(.5,-.5)]),e={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:t,options:e},t=Array.isArray(t)?t:[t];let i=this,s=[],r=[];for(let o=0,l=t.length;o<l;o++){let c=t[o];a(c)}this.setAttribute("position",new fe(s,3)),this.setAttribute("uv",new fe(r,2)),this.computeVertexNormals();function a(o){let l=[],c=e.curveSegments!==void 0?e.curveSegments:12,h=e.steps!==void 0?e.steps:1,d=e.depth!==void 0?e.depth:1,u=e.bevelEnabled!==void 0?e.bevelEnabled:!0,f=e.bevelThickness!==void 0?e.bevelThickness:.2,m=e.bevelSize!==void 0?e.bevelSize:f-.1,y=e.bevelOffset!==void 0?e.bevelOffset:0,g=e.bevelSegments!==void 0?e.bevelSegments:3,p=e.extrudePath,M=e.UVGenerator!==void 0?e.UVGenerator:Sf,w,x=!1,E,S,R,v;if(p){w=p.getSpacedPoints(h),x=!0,u=!1;let et=p.isCatmullRomCurve3?p.closed:!1;E=p.computeFrenetFrames(h,et),S=new D,R=new D,v=new D}u||(g=0,f=0,m=0,y=0);let T=o.extractPoints(c),P=T.shape,C=T.holes;if(!En.isClockWise(P)){P=P.reverse();for(let et=0,st=C.length;et<st;et++){let rt=C[et];En.isClockWise(rt)&&(C[et]=rt.reverse())}}function O(et){let rt=10000000000000001e-36,at=et[0];for(let ut=1;ut<=et.length;ut++){let Bt=ut%et.length,Ot=et[Bt],qt=Ot.x-at.x,Yt=Ot.y-at.y,N=qt*qt+Yt*Yt,ce=Math.max(Math.abs(Ot.x),Math.abs(Ot.y),Math.abs(at.x),Math.abs(at.y)),ee=rt*ce*ce;if(N<=ee){et.splice(Bt,1),ut--;continue}at=Ot}}O(P),C.forEach(O);let L=C.length,k=P;for(let et=0;et<L;et++){let st=C[et];P=P.concat(st)}function V(et,st,rt){return st||Wt("ExtrudeGeometry: vec does not exist"),et.clone().addScaledVector(st,rt)}let W=P.length;function K(et,st,rt){let at,ut,Bt,Ot=et.x-st.x,qt=et.y-st.y,Yt=rt.x-et.x,N=rt.y-et.y,ce=Ot*Ot+qt*qt,ee=Ot*N-qt*Yt;if(Math.abs(ee)>Number.EPSILON){let A=Math.sqrt(ce),_=Math.sqrt(Yt*Yt+N*N),B=st.x-qt/A,G=st.y+Ot/A,$=rt.x-N/_,ot=rt.y+Yt/_,ht=(($-B)*N-(ot-G)*Yt)/(Ot*N-qt*Yt);at=B+Ot*ht-et.x,ut=G+qt*ht-et.y;let Y=at*at+ut*ut;if(Y<=2)return new dt(at,ut);Bt=Math.sqrt(Y/2)}else{let A=!1;Ot>Number.EPSILON?Yt>Number.EPSILON&&(A=!0):Ot<-Number.EPSILON?Yt<-Number.EPSILON&&(A=!0):Math.sign(qt)===Math.sign(N)&&(A=!0),A?(at=-qt,ut=Ot,Bt=Math.sqrt(ce)):(at=Ot,ut=qt,Bt=Math.sqrt(ce/2))}return new dt(at/Bt,ut/Bt)}let q=[];for(let et=0,st=k.length,rt=st-1,at=et+1;et<st;et++,rt++,at++)rt===st&&(rt=0),at===st&&(at=0),q[et]=K(k[et],k[rt],k[at]);let Q=[],it,Dt=q.concat();for(let et=0,st=L;et<st;et++){let rt=C[et];it=[];for(let at=0,ut=rt.length,Bt=ut-1,Ot=at+1;at<ut;at++,Bt++,Ot++)Bt===ut&&(Bt=0),Ot===ut&&(Ot=0),it[at]=K(rt[at],rt[Bt],rt[Ot]);Q.push(it),Dt=Dt.concat(it)}let At;if(g===0)At=En.triangulateShape(k,C);else{let et=[],st=[];for(let rt=0;rt<g;rt++){let at=rt/g,ut=f*Math.cos(at*Math.PI/2),Bt=m*Math.sin(at*Math.PI/2)+y;for(let Ot=0,qt=k.length;Ot<qt;Ot++){let Yt=V(k[Ot],q[Ot],Bt);vt(Yt.x,Yt.y,-ut),at===0&&et.push(Yt)}for(let Ot=0,qt=L;Ot<qt;Ot++){let Yt=C[Ot];it=Q[Ot];let N=[];for(let ce=0,ee=Yt.length;ce<ee;ce++){let A=V(Yt[ce],it[ce],Bt);vt(A.x,A.y,-ut),at===0&&N.push(A)}at===0&&st.push(N)}}At=En.triangulateShape(et,st)}let le=At.length,te=m+y;for(let et=0;et<W;et++){let st=u?V(P[et],Dt[et],te):P[et];x?(R.copy(E.normals[0]).multiplyScalar(st.x),S.copy(E.binormals[0]).multiplyScalar(st.y),v.copy(w[0]).add(R).add(S),vt(v.x,v.y,v.z)):vt(st.x,st.y,0)}for(let et=1;et<=h;et++)for(let st=0;st<W;st++){let rt=u?V(P[st],Dt[st],te):P[st];x?(R.copy(E.normals[et]).multiplyScalar(rt.x),S.copy(E.binormals[et]).multiplyScalar(rt.y),v.copy(w[et]).add(R).add(S),vt(v.x,v.y,v.z)):vt(rt.x,rt.y,d/h*et)}for(let et=g-1;et>=0;et--){let st=et/g,rt=f*Math.cos(st*Math.PI/2),at=m*Math.sin(st*Math.PI/2)+y;for(let ut=0,Bt=k.length;ut<Bt;ut++){let Ot=V(k[ut],q[ut],at);vt(Ot.x,Ot.y,d+rt)}for(let ut=0,Bt=C.length;ut<Bt;ut++){let Ot=C[ut];it=Q[ut];for(let qt=0,Yt=Ot.length;qt<Yt;qt++){let N=V(Ot[qt],it[qt],at);x?vt(N.x,N.y+w[h-1].y,w[h-1].x+rt):vt(N.x,N.y,d+rt)}}}re(),Z();function re(){let et=s.length/3;if(u){let st=0,rt=W*st;for(let at=0;at<le;at++){let ut=At[at];Vt(ut[2]+rt,ut[1]+rt,ut[0]+rt)}st=h+g*2,rt=W*st;for(let at=0;at<le;at++){let ut=At[at];Vt(ut[0]+rt,ut[1]+rt,ut[2]+rt)}}else{for(let st=0;st<le;st++){let rt=At[st];Vt(rt[2],rt[1],rt[0])}for(let st=0;st<le;st++){let rt=At[st];Vt(rt[0]+W*h,rt[1]+W*h,rt[2]+W*h)}}i.addGroup(et,s.length/3-et,0)}function Z(){let et=s.length/3,st=0;tt(k,st),st+=k.length;for(let rt=0,at=C.length;rt<at;rt++){let ut=C[rt];tt(ut,st),st+=ut.length}i.addGroup(et,s.length/3-et,1)}function tt(et,st){let rt=et.length;for(;--rt>=0;){let at=rt,ut=rt-1;ut<0&&(ut=et.length-1);for(let Bt=0,Ot=h+g*2;Bt<Ot;Bt++){let qt=W*Bt,Yt=W*(Bt+1),N=st+at+qt,ce=st+ut+qt,ee=st+ut+Yt,A=st+at+Yt;St(N,ce,ee,A)}}}function vt(et,st,rt){l.push(et),l.push(st),l.push(rt)}function Vt(et,st,rt){Xt(et),Xt(st),Xt(rt);let at=s.length/3,ut=M.generateTopUV(i,s,at-3,at-2,at-1);pe(ut[0]),pe(ut[1]),pe(ut[2])}function St(et,st,rt,at){Xt(et),Xt(st),Xt(at),Xt(st),Xt(rt),Xt(at);let ut=s.length/3,Bt=M.generateSideWallUV(i,s,ut-6,ut-3,ut-2,ut-1);pe(Bt[0]),pe(Bt[1]),pe(Bt[3]),pe(Bt[1]),pe(Bt[2]),pe(Bt[3])}function Xt(et){s.push(l[et*3+0]),s.push(l[et*3+1]),s.push(l[et*3+2])}function pe(et){r.push(et.x),r.push(et.y)}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON(),e=this.parameters.shapes,i=this.parameters.options;return Ef(e,i,t)}static fromJSON(t,e){let i=[];for(let r=0,a=t.shapes.length;r<a;r++){let o=e[t.shapes[r]];i.push(o)}let s=t.options.extrudePath;return s!==void 0&&(t.options.extrudePath=new Bl[s.type]().fromJSON(s)),new n(i,t.options)}},Sf={generateTopUV:function(n,t,e,i,s){let r=t[e*3],a=t[e*3+1],o=t[i*3],l=t[i*3+1],c=t[s*3],h=t[s*3+1];return[new dt(r,a),new dt(o,l),new dt(c,h)]},generateSideWallUV:function(n,t,e,i,s,r){let a=t[e*3],o=t[e*3+1],l=t[e*3+2],c=t[i*3],h=t[i*3+1],d=t[i*3+2],u=t[s*3],f=t[s*3+1],m=t[s*3+2],y=t[r*3],g=t[r*3+1],p=t[r*3+2];return Math.abs(o-h)<Math.abs(a-c)?[new dt(a,1-l),new dt(c,1-d),new dt(u,1-m),new dt(y,1-p)]:[new dt(o,1-l),new dt(h,1-d),new dt(f,1-m),new dt(g,1-p)]}};function Ef(n,t,e){if(e.shapes=[],Array.isArray(n))for(let i=0,s=n.length;i<s;i++){let r=n[i];e.shapes.push(r.uuid)}else e.shapes.push(n.uuid);return e.options=Object.assign({},t),t.extrudePath!==void 0&&(e.options.extrudePath=t.extrudePath.toJSON()),e}var Ue=class n extends Re{constructor(t=1,e=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:i,heightSegments:s};let r=t/2,a=e/2,o=Math.floor(i),l=Math.floor(s),c=o+1,h=l+1,d=t/o,u=e/l,f=[],m=[],y=[],g=[];for(let p=0;p<h;p++){let M=p*u-a;for(let w=0;w<c;w++){let x=w*d-r;m.push(x,-M,0),y.push(0,0,1),g.push(w/o),g.push(1-p/l)}}for(let p=0;p<l;p++)for(let M=0;M<o;M++){let w=M+c*p,x=M+c*(p+1),E=M+1+c*(p+1),S=M+1+c*p;f.push(w,x,S),f.push(x,E,S)}this.setIndex(f),this.setAttribute("position",new fe(m,3)),this.setAttribute("normal",new fe(y,3)),this.setAttribute("uv",new fe(g,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.width,t.height,t.widthSegments,t.heightSegments)}},ar=class n extends Re{constructor(t=.5,e=1,i=32,s=1,r=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:t,outerRadius:e,thetaSegments:i,phiSegments:s,thetaStart:r,thetaLength:a},i=Math.max(3,i),s=Math.max(1,s);let o=[],l=[],c=[],h=[],d=t,u=(e-t)/s,f=new D,m=new dt;for(let y=0;y<=s;y++){for(let g=0;g<=i;g++){let p=r+g/i*a;f.x=d*Math.cos(p),f.y=d*Math.sin(p),l.push(f.x,f.y,f.z),c.push(0,0,1),m.x=(f.x/e+1)/2,m.y=(f.y/e+1)/2,h.push(m.x,m.y)}d+=u}for(let y=0;y<s;y++){let g=y*(i+1);for(let p=0;p<i;p++){let M=p+g,w=M,x=M+i+1,E=M+i+2,S=M+1;o.push(w,x,S),o.push(x,E,S)}}this.setIndex(o),this.setAttribute("position",new fe(l,3)),this.setAttribute("normal",new fe(c,3)),this.setAttribute("uv",new fe(h,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}};var Pn=class n extends Re{constructor(t=1,e=32,i=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:i,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},e=Math.max(3,Math.floor(e)),i=Math.max(2,Math.floor(i));let l=Math.min(a+o,Math.PI),c=0,h=[],d=new D,u=new D,f=[],m=[],y=[],g=[];for(let p=0;p<=i;p++){let M=[],w=p/i,x=a+w*o,E=t*Math.cos(x),S=Math.sqrt(t*t-E*E),R=0;p===0&&a===0?R=.5/e:p===i&&l===Math.PI&&(R=-.5/e);for(let v=0;v<=e;v++){let T=v/e,P=s+T*r;d.x=-S*Math.cos(P),d.y=E,d.z=S*Math.sin(P),m.push(d.x,d.y,d.z),u.copy(d).normalize(),y.push(u.x,u.y,u.z),g.push(T+R,1-w),M.push(c++)}h.push(M)}for(let p=0;p<i;p++)for(let M=0;M<e;M++){let w=h[p][M+1],x=h[p][M],E=h[p+1][M],S=h[p+1][M+1];(p!==0||a>0)&&f.push(w,x,S),(p!==i-1||l<Math.PI)&&f.push(x,E,S)}this.setIndex(f),this.setAttribute("position",new fe(m,3)),this.setAttribute("normal",new fe(y,3)),this.setAttribute("uv",new fe(g,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};var or=class n extends Re{constructor(t=1,e=.4,i=12,s=48,r=Math.PI*2,a=0,o=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:i,tubularSegments:s,arc:r,thetaStart:a,thetaLength:o},i=Math.floor(i),s=Math.floor(s);let l=[],c=[],h=[],d=[],u=new D,f=new D,m=new D;for(let y=0;y<=i;y++){let g=a+y/i*o;for(let p=0;p<=s;p++){let M=p/s*r;f.x=(t+e*Math.cos(g))*Math.cos(M),f.y=(t+e*Math.cos(g))*Math.sin(M),f.z=e*Math.sin(g),c.push(f.x,f.y,f.z),u.x=t*Math.cos(M),u.y=t*Math.sin(M),m.subVectors(f,u).normalize(),h.push(m.x,m.y,m.z),d.push(p/s),d.push(y/i)}}for(let y=1;y<=i;y++)for(let g=1;g<=s;g++){let p=(s+1)*y+g-1,M=(s+1)*(y-1)+g-1,w=(s+1)*(y-1)+g,x=(s+1)*y+g;l.push(p,M,x),l.push(M,w,x)}this.setIndex(l),this.setAttribute("position",new fe(c,3)),this.setAttribute("normal",new fe(h,3)),this.setAttribute("uv",new fe(d,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new n(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc,t.thetaStart,t.thetaLength)}};function Dn(n){let t={};for(let e in n){t[e]={};for(let i in n[e]){let s=n[e][i];if(Rh(s))s.isRenderTargetTexture?(Gt("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][i]=null):t[e][i]=s.clone();else if(Array.isArray(s))if(Rh(s[0])){let r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();t[e][i]=r}else t[e][i]=s.slice();else t[e][i]=s}}return t}function Ke(n){let t={};for(let e=0;e<n.length;e++){let i=Dn(n[e]);for(let s in i)t[s]=i[s]}return t}function Rh(n){return n&&(n.isColor||n.isMatrix3||n.isMatrix4||n.isVector2||n.isVector3||n.isVector4||n.isTexture||n.isQuaternion)}function wf(n){let t=[];for(let e=0;e<n.length;e++)t.push(n[e].clone());return t}function mc(n){let t=n.getRenderTarget();return t===null?n.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:ne.workingColorSpace}var Su={clone:Dn,merge:Ke},Tf=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Af=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,ti=class extends $i{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Tf,this.fragmentShader=Af,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Dn(t.uniforms),this.uniformsGroups=wf(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?e.uniforms[s]={type:"t",value:a.toJSON(t).uuid}:a&&a.isColor?e.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?e.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?e.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?e.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?e.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?e.uniforms[s]={type:"m4",value:a.toArray()}:e.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let i={};for(let s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(e.extensions=i),e}fromJSON(t,e){if(super.fromJSON(t,e),t.uniforms!==void 0)for(let i in t.uniforms){let s=t.uniforms[i];switch(this.uniforms[i]={},s.type){case"t":this.uniforms[i].value=e[s.value]||null;break;case"c":this.uniforms[i].value=new Rt().setHex(s.value);break;case"v2":this.uniforms[i].value=new dt().fromArray(s.value);break;case"v3":this.uniforms[i].value=new D().fromArray(s.value);break;case"v4":this.uniforms[i].value=new Ee().fromArray(s.value);break;case"m3":this.uniforms[i].value=new $t().fromArray(s.value);break;case"m4":this.uniforms[i].value=new ge().fromArray(s.value);break;default:this.uniforms[i].value=s.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(let i in t.extensions)this.extensions[i]=t.extensions[i];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}},Aa=class extends ti{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},kt=class extends $i{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Rt(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Rt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Po,this.normalScale=new dt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ei,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}},lr=class extends kt{constructor(t){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new dt(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return jt(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(e){this.ior=(1+.4*e)/(1-.4*e)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Rt(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Rt(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Rt(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(t)}get anisotropy(){return this._anisotropy}set anisotropy(t){this._anisotropy>0!=t>0&&this.version++,this._anisotropy=t}get clearcoat(){return this._clearcoat}set clearcoat(t){this._clearcoat>0!=t>0&&this.version++,this._clearcoat=t}get iridescence(){return this._iridescence}set iridescence(t){this._iridescence>0!=t>0&&this.version++,this._iridescence=t}get dispersion(){return this._dispersion}set dispersion(t){this._dispersion>0!=t>0&&this.version++,this._dispersion=t}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(t){this._retroreflectivity>0!=t>0&&this.version++,this._retroreflectivity=t}get sheen(){return this._sheen}set sheen(t){this._sheen>0!=t>0&&this.version++,this._sheen=t}get transmission(){return this._transmission}set transmission(t){this._transmission>0!=t>0&&this.version++,this._transmission=t}copy(t){return super.copy(t),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=t.anisotropy,this.anisotropyRotation=t.anisotropyRotation,this.anisotropyMap=t.anisotropyMap,this.clearcoat=t.clearcoat,this.clearcoatMap=t.clearcoatMap,this.clearcoatRoughness=t.clearcoatRoughness,this.clearcoatRoughnessMap=t.clearcoatRoughnessMap,this.clearcoatNormalMap=t.clearcoatNormalMap,this.clearcoatNormalScale.copy(t.clearcoatNormalScale),this.dispersion=t.dispersion,this.ior=t.ior,this.iridescence=t.iridescence,this.iridescenceMap=t.iridescenceMap,this.iridescenceIOR=t.iridescenceIOR,this.iridescenceThicknessRange=[...t.iridescenceThicknessRange],this.iridescenceThicknessMap=t.iridescenceThicknessMap,this.retroreflectivity=t.retroreflectivity,this.sheen=t.sheen,this.sheenColor.copy(t.sheenColor),this.sheenColorMap=t.sheenColorMap,this.sheenRoughness=t.sheenRoughness,this.sheenRoughnessMap=t.sheenRoughnessMap,this.transmission=t.transmission,this.transmissionMap=t.transmissionMap,this.thickness=t.thickness,this.thicknessMap=t.thicknessMap,this.attenuationDistance=t.attenuationDistance,this.attenuationColor.copy(t.attenuationColor),this.specularIntensity=t.specularIntensity,this.specularIntensityMap=t.specularIntensityMap,this.specularColor.copy(t.specularColor),this.specularColorMap=t.specularColorMap,this}};var Ra=class extends $i{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=su,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},Ca=class extends $i{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}};function Jn(n,t){return!n||n.constructor===t?n:typeof t.BYTES_PER_ELEMENT=="number"?new t(n):Array.prototype.slice.call(n)}function Ll(n){return n!==void 0&&n.inTangents!==void 0&&n.outTangents!==void 0}var cn=class{constructor(t,e,i,s){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new e.constructor(i),this.sampleValues=e,this.valueSize=i,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,i=this._cachedIndex,s=e[i],r=e[i-1];i:{t:{let a;e:{n:if(!(t<s)){for(let o=i+2;;){if(s===void 0){if(t<r)break n;return i=e.length,this._cachedIndex=i,this.copySampleValue_(i-1)}if(i===o)break;if(r=s,s=e[++i],t<s)break t}a=e.length;break e}if(!(t>=r)){let o=e[1];t<o&&(i=2,r=o);for(let l=i-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===l)break;if(s=r,r=e[--i-1],t>=r)break t}a=i,i=0;break e}break i}for(;i<a;){let o=i+a>>>1;t<e[o]?a=o:i=o+1}if(s=e[i],r=e[i-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return i=e.length,this._cachedIndex=i,this.copySampleValue_(i-1)}this._cachedIndex=i,this.intervalChanged_(i,r,s)}return this.interpolate_(i,r,t,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,i=this.sampleValues,s=this.valueSize,r=t*s;for(let a=0;a!==s;++a)e[a]=i[r+a];return e}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},Pa=class extends cn{constructor(t,e,i,s){super(t,e,i,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Ul,endingEnd:Ul}}intervalChanged_(t,e,i){let s=this.parameterPositions,r=t-2,a=t+1,o=s[r],l=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case Fl:r=t,o=2*e-i;break;case Ol:r=s.length-2,o=e+s[r]-s[r+1];break;default:r=t,o=i}if(l===void 0)switch(this.getSettings_().endingEnd){case Fl:a=t,l=2*i-e;break;case Ol:a=1,l=i+s[1]-s[0];break;default:a=t-1,l=e}let c=(i-e)*.5,h=this.valueSize;this._weightPrev=c/(e-o),this._weightNext=c/(l-i),this._offsetPrev=r*h,this._offsetNext=a*h}interpolate_(t,e,i,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,h=this._offsetPrev,d=this._offsetNext,u=this._weightPrev,f=this._weightNext,m=(i-e)/(s-e),y=m*m,g=y*m,p=-u*g+2*u*y-u*m,M=(1+u)*g+(-1.5-2*u)*y+(-.5+u)*m+1,w=(-1-f)*g+(1.5+f)*y+.5*m,x=f*g-f*y;for(let E=0;E!==o;++E)r[E]=p*a[h+E]+M*a[c+E]+w*a[l+E]+x*a[d+E];return r}},Ia=class extends cn{constructor(t,e,i,s){super(t,e,i,s)}interpolate_(t,e,i,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,h=(i-e)/(s-e),d=1-h;for(let u=0;u!==o;++u)r[u]=a[c+u]*d+a[l+u]*h;return r}},La=class extends cn{constructor(t,e,i,s){super(t,e,i,s)}interpolate_(t){return this.copySampleValue_(t-1)}},Da=class extends cn{interpolate_(t,e,i,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,h=this.inTangents,d=this.outTangents;if(!h||!d){let m=(i-e)/(s-e),y=1-m;for(let g=0;g!==o;++g)r[g]=a[c+g]*y+a[l+g]*m;return r}let u=o*2,f=t-1;for(let m=0;m!==o;++m){let y=a[c+m],g=a[l+m],p=f*u+m*2,M=d[p],w=d[p+1],x=t*u+m*2,E=h[x],S=h[x+1],R=Cf(i,e,M,E,s);r[m]=Eu(R,y,w,S,g)}return r}};function Eu(n,t,e,i,s){let r=1-n;return r*r*r*t+3*r*r*n*e+3*r*n*n*i+n*n*n*s}function Rf(n,t,e,i,s){let r=1-n;return 3*r*r*(e-t)+6*r*n*(i-e)+3*n*n*(s-i)}function Cf(n,t,e,i,s){let r=(n-t)/(s-t);for(let a=0;a<8;a++){let o=Eu(r,t,e,i,s)-n;if(Math.abs(o)<1e-10)break;let l=Rf(r,t,e,i,s);if(Math.abs(l)<1e-10)break;r=Math.max(0,Math.min(1,r-o/l))}return r}var ci=class{constructor(t,e,i,s){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=Jn(e,this.TimeBufferType),this.values=Jn(i,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,i;if(e.toJSON!==this.toJSON)i=e.toJSON(t);else{i={name:t.name,times:Jn(t.times,Array),values:Jn(t.values,Array)};let s=t.getInterpolation();s!==t.DefaultInterpolation&&(i.interpolation=s),Ll(t.settings)&&(i.settings={inTangents:Jn(t.settings.inTangents,Array),outTangents:Jn(t.settings.outTangents,Array)})}return i.type=t.ValueTypeName,i}InterpolantFactoryMethodDiscrete(t){return new La(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new Ia(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new Pa(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodBezier(t){let e=new Da(this.times,this.values,this.getValueSize(),t);return this.settings&&(e.inTangents=this.settings.inTangents,e.outTangents=this.settings.outTangents),e}setInterpolation(t){let e;switch(t){case Os:e=this.InterpolantFactoryMethodDiscrete;break;case ma:e=this.InterpolantFactoryMethodLinear;break;case ra:e=this.InterpolantFactoryMethodSmooth;break;case Nl:e=this.InterpolantFactoryMethodBezier;break}if(e===void 0){let i="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(i);return Gt("KeyframeTrack:",i),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Os;case this.InterpolantFactoryMethodLinear:return ma;case this.InterpolantFactoryMethodSmooth:return ra;case this.InterpolantFactoryMethodBezier:return Nl}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let i=0,s=e.length;i!==s;++i)e[i]+=t}return this}scale(t){if(t!==1){let e=this.times;for(let i=0,s=e.length;i!==s;++i)e[i]*=t;Ll(this.settings)&&(Ch(this.settings.inTangents,t),Ch(this.settings.outTangents,t))}return this}trim(t,e){let i=this.times,s=i.length,r=0,a=s-1;for(;r!==s&&i[r]<t;)++r;for(;a!==-1&&i[a]>e;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=i.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(Wt("KeyframeTrack: Invalid value size in track.",this),t=!1);let i=this.times,s=this.values,r=i.length;r===0&&(Wt("KeyframeTrack: Track is empty.",this),t=!1);let a=null;for(let o=0;o!==r;o++){let l=i[o];if(typeof l=="number"&&isNaN(l)){Wt("KeyframeTrack: Time is not a valid number.",this,o,l),t=!1;break}if(a!==null&&a>l){Wt("KeyframeTrack: Out of order keys.",this,o,l,a),t=!1;break}a=l}if(s!==void 0&&Id(s))for(let o=0,l=s.length;o!==l;++o){let c=s[o];if(isNaN(c)){Wt("KeyframeTrack: Value is not a valid number.",this,o,c),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),i=this.getValueSize(),s=this.getInterpolation()===ra,r=t.length-1,a=1;for(let o=1;o<r;++o){let l=!1,c=t[o],h=t[o+1];if(c!==h&&(o!==1||c!==t[0]))if(s)l=!0;else{let d=o*i,u=d-i,f=d+i;for(let m=0;m!==i;++m){let y=e[d+m];if(y!==e[u+m]||y!==e[f+m]){l=!0;break}}}if(l){if(o!==a){t[a]=t[o];let d=o*i,u=a*i;for(let f=0;f!==i;++f)e[u+f]=e[d+f]}++a}}if(r>0){t[a]=t[r];for(let o=r*i,l=a*i,c=0;c!==i;++c)e[l+c]=e[o+c];++a}return a!==t.length?(this.times=t.slice(0,a),this.values=e.slice(0,a*i)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),i=this.constructor,s=new i(this.name,t,e);return s.createInterpolant=this.createInterpolant,Ll(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};function Ch(n,t){for(let e=0,i=n.length;e!==i;e+=2)n[e]*=t}ci.prototype.ValueTypeName="";ci.prototype.TimeBufferType=Float32Array;ci.prototype.ValueBufferType=Float32Array;ci.prototype.DefaultInterpolation=ma;var hn=class extends ci{constructor(t,e,i){super(t,e,i)}};hn.prototype.ValueTypeName="bool";hn.prototype.ValueBufferType=Array;hn.prototype.DefaultInterpolation=Os;hn.prototype.InterpolantFactoryMethodLinear=void 0;hn.prototype.InterpolantFactoryMethodSmooth=void 0;var Na=class extends ci{constructor(t,e,i,s){super(t,e,i,s)}};Na.prototype.ValueTypeName="color";var Ua=class extends ci{constructor(t,e,i,s){super(t,e,i,s)}};Ua.prototype.ValueTypeName="number";var Fa=class extends cn{constructor(t,e,i,s){super(t,e,i,s)}interpolate_(t,e,i,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(i-e)/(s-e),c=t*o;for(let h=c+o;c!==h;c+=4)Ni.slerpFlat(r,0,a,c-o,a,c,l);return r}},cr=class extends ci{constructor(t,e,i,s){super(t,e,i,s)}InterpolantFactoryMethodLinear(t){return new Fa(this.times,this.values,this.getValueSize(),t)}};cr.prototype.ValueTypeName="quaternion";cr.prototype.InterpolantFactoryMethodSmooth=void 0;var un=class extends ci{constructor(t,e,i){super(t,e,i)}};un.prototype.ValueTypeName="string";un.prototype.ValueBufferType=Array;un.prototype.DefaultInterpolation=Os;un.prototype.InterpolantFactoryMethodLinear=void 0;un.prototype.InterpolantFactoryMethodSmooth=void 0;var Oa=class extends ci{constructor(t,e,i,s){super(t,e,i,s)}};Oa.prototype.ValueTypeName="vector";var ka=class{constructor(t,e,i){let s=this,r=!1,a=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=i,this._abortController=null,this.itemStart=function(h){o++,r===!1&&s.onStart!==void 0&&s.onStart(h,a,o),r=!0},this.itemEnd=function(h){a++,s.onProgress!==void 0&&s.onProgress(h,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,d){return c.push(h,d),this},this.removeHandler=function(h){let d=c.indexOf(h);return d!==-1&&c.splice(d,2),this},this.getHandler=function(h){for(let d=0,u=c.length;d<u;d+=2){let f=c[d],m=c[d+1];if(f.global&&(f.lastIndex=0),f.test(h))return m}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},wu=new ka,Ba=class{constructor(t){this.manager=t!==void 0?t:wu,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(t,e){let i=this;return new Promise(function(s,r){i.load(t,s,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}abort(){return this}};Ba.DEFAULT_MATERIAL_NAME="__DEFAULT";var hs=class extends De{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new Rt(t),this.intensity=e}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,e}},hr=class extends hs{constructor(t,e,i){super(t,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(De.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Rt(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}toJSON(t){let e=super.toJSON(t);return e.object.groundColor=this.groundColor.getHex(),e}},Dl=new ge,Ph=new D,Ih=new D,za=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new dt(512,512),this.mapType=si,this.map=null,this.mapPass=null,this.matrix=new ge,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new rs,this._frameExtents=new dt(1,1),this._viewportCount=1,this._viewports=[new Ee(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera;Ph.setFromMatrixPosition(t.matrixWorld),e.position.copy(Ph),Ih.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(Ih),e.updateMatrixWorld(),this._updateMatrix(e,this.matrix,this._frustum)}_updateMatrix(t,e,i,s){Dl.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),i.setFromProjectionMatrix(Dl,t.coordinateSystem,t.reversedDepth);let r=this._frameExtents,a=s?s.z/r.x:1,o=s?s.w/r.y:1,l=s?s.x/r.x:0,c=s?s.y/r.y:0;t.coordinateSystem===es||t.reversedDepth?e.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):e.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),e.multiply(Dl)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return t.intensity=this.intensity,t.bias=this.bias,t.normalBias=this.normalBias,t.radius=this.radius,t.blurSamples=this.blurSamples,t.mapSize=this.mapSize.toArray(),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}},na=new D,sa=new Ni,Pi=new D,ur=class extends De{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ge,this.projectionMatrix=new ge,this.projectionMatrixInverse=new ge,this.coordinateSystem=Si,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose(na,sa,Pi),Pi.x===1&&Pi.y===1&&Pi.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(na,sa,Pi.set(1,1,1)).invert()}updateWorldMatrix(t,e,i=!1){super.updateWorldMatrix(t,e,i),this.matrixWorld.decompose(na,sa,Pi),Pi.x===1&&Pi.y===1&&Pi.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(na,sa,Pi.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},sn=new D,Lh=new dt,Dh=new dt,Ze=class extends ur{constructor(t=50,e=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=ga*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(ll*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return ga*2*Math.atan(Math.tan(ll*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,i){sn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(sn.x,sn.y).multiplyScalar(-t/sn.z),sn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(sn.x,sn.y).multiplyScalar(-t/sn.z)}getViewSize(t,e){return this.getViewBounds(t,Lh,Dh),e.subVectors(Dh,Lh)}setViewOffset(t,e,i,s,r,a){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(ll*.5*this.fov)/this.zoom,i=2*e,s=this.aspect*i,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,e-=a.offsetY*i/c,s*=a.width/l,i*=a.height/c}let o=this.filmOffset;o!==0&&(r+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-i,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}};var us=class extends ur{constructor(t=-1,e=1,i=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=i,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,i,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=i-t,a=i+t,o=s+e,l=s-e;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=h*this.view.offsetY,l=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}},Vl=class extends za{constructor(){super(new us(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},dr=class extends hs{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(De.DEFAULT_UP),this.updateMatrix(),this.target=new De,this.shadow=new Vl}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.shadow=this.shadow.toJSON(),e.object.target=this.target.uuid,e}},fr=class extends hs{constructor(t,e){super(t,e),this.isAmbientLight=!0,this.type="AmbientLight"}};var Kn=-90,jn=1,Ha=class extends De{constructor(t,e,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Ze(Kn,jn,t,e);s.layers=this.layers,this.add(s);let r=new Ze(Kn,jn,t,e);r.layers=this.layers,this.add(r);let a=new Ze(Kn,jn,t,e);a.layers=this.layers,this.add(a);let o=new Ze(Kn,jn,t,e);o.layers=this.layers,this.add(o);let l=new Ze(Kn,jn,t,e);l.layers=this.layers,this.add(l);let c=new Ze(Kn,jn,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[i,s,r,a,o,l]=e;for(let c of e)this.remove(c);if(t===Si)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===es)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,l,c,h]=this.children,d=t.getRenderTarget(),u=t.getActiveCubeFace(),f=t.getActiveMipmapLevel(),m=t.xr.enabled;t.xr.enabled=!1;let y=i.texture.generateMipmaps;i.texture.generateMipmaps=!1;let g=!1;t.isWebGLRenderer===!0?g=t.state.buffers.depth.getReversed():g=t.reversedDepthBuffer,t.setRenderTarget(i,0,s),g&&t.autoClear===!1&&t.clearDepth(),t.render(e,r),t.setRenderTarget(i,1,s),g&&t.autoClear===!1&&t.clearDepth(),t.render(e,a),t.setRenderTarget(i,2,s),g&&t.autoClear===!1&&t.clearDepth(),t.render(e,o),t.setRenderTarget(i,3,s),g&&t.autoClear===!1&&t.clearDepth(),t.render(e,l),t.setRenderTarget(i,4,s),g&&t.autoClear===!1&&t.clearDepth(),t.render(e,c),i.texture.generateMipmaps=y,t.setRenderTarget(i,5,s),g&&t.autoClear===!1&&t.clearDepth(),t.render(e,h),t.setRenderTarget(d,u,f),t.xr.enabled=m,i.texture.needsPMREMUpdate=!0}},Ga=class extends Ze{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}};var gc="\\[\\]\\.:\\/",Pf=new RegExp("["+gc+"]","g"),xc="[^"+gc+"]",If="[^"+gc.replace("\\.","")+"]",Lf=/((?:WC+[\/:])*)/.source.replace("WC",xc),Df=/(WCOD+)?/.source.replace("WCOD",If),Nf=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",xc),Uf=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",xc),Ff=new RegExp("^"+Lf+Df+Nf+Uf+"$"),Of=["material","materials","bones","map"],Wl=class{constructor(t,e,i){let s=i||Me.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,s)}getValue(t,e){this.bind();let i=this._targetGroup.nCachedObjects_,s=this._bindings[i];s!==void 0&&s.getValue(t,e)}setValue(t,e){let i=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=i.length;s!==r;++s)i[s].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,i=t.length;e!==i;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,i=t.length;e!==i;++e)t[e].unbind()}},Me=class n{constructor(t,e,i){this.path=e,this.parsedPath=i||n.parseTrackName(e),this.node=n.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,i){return t&&t.isAnimationObjectGroup?new n.Composite(t,e,i):new n(t,e,i)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(Pf,"")}static parseTrackName(t){let e=Ff.exec(t);if(e===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let i={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},s=i.nodeName&&i.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=i.nodeName.substring(s+1);Of.indexOf(r)!==-1&&(i.nodeName=i.nodeName.substring(0,s),i.objectName=r)}if(i.propertyName===null||i.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return i}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let i=t.skeleton.getBoneByName(e);if(i!==void 0)return i}if(t.children){let i=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===e||o.uuid===e)return o;let l=i(o.children);if(l)return l}return null},s=i(t.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)t[e++]=i[s]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let i=this.resolvedProperty;for(let s=0,r=i.length;s!==r;++s)i[s]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,i=e.objectName,s=e.propertyName,r=e.propertyIndex;if(t||(t=n.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){Gt("PropertyBinding: No target node found for track: "+this.path+".");return}if(i){let c=e.objectIndex;switch(i){case"materials":if(!t.material){Wt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){Wt("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){Wt("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let h=0;h<t.length;h++)if(t[h].name===c){c=h;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){Wt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){Wt("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[i]===void 0){Wt("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[i]}if(c!==void 0){if(t[c]===void 0){Wt("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[c]}}let a=t[s];if(a===void 0){let c=e.nodeName;Wt("PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",t);return}let o=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?o=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!t.geometry){Wt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){Wt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[r]!==void 0&&(r=t.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Me.Composite=Wl;Me.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Me.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Me.prototype.GetterByBindingType=[Me.prototype._getValue_direct,Me.prototype._getValue_array,Me.prototype._getValue_arrayElement,Me.prototype._getValue_toArray];Me.prototype.SetterByBindingTypeAndVersioning=[[Me.prototype._setValue_direct,Me.prototype._setValue_direct_setNeedsUpdate,Me.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Me.prototype._setValue_array,Me.prototype._setValue_array_setNeedsUpdate,Me.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Me.prototype._setValue_arrayElement,Me.prototype._setValue_arrayElement_setNeedsUpdate,Me.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Me.prototype._setValue_fromArray,Me.prototype._setValue_fromArray_setNeedsUpdate,Me.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var e_=new Float32Array(1);var Xl=class n{static{n.prototype.isMatrix2=!0}constructor(t,e,i,s){this.elements=[1,0,0,1],t!==void 0&&this.set(t,e,i,s)}identity(){return this.set(1,0,0,1),this}fromArray(t,e=0){for(let i=0;i<4;i++)this.elements[i]=t[i+e];return this}set(t,e,i,s){let r=this.elements;return r[0]=t,r[2]=e,r[1]=i,r[3]=s,this}};function _c(n,t,e,i){let s=kf(i);switch(e){case hc:return n*t;case Za:return n*t/s.components*s.byteLength;case Ja:return n*t/s.components*s.byteLength;case gn:return n*t*2/s.components*s.byteLength;case Ka:return n*t*2/s.components*s.byteLength;case uc:return n*t*3/s.components*s.byteLength;case mi:return n*t*4/s.components*s.byteLength;case ja:return n*t*4/s.components*s.byteLength;case _r:case vr:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*8;case yr:case Mr:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*16;case to:case io:return Math.max(n,16)*Math.max(t,8)/4;case Qa:case eo:return Math.max(n,8)*Math.max(t,8)/2;case no:case so:case ao:case oo:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*8;case ro:case br:case lo:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*16;case co:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*16;case ho:return Math.floor((n+4)/5)*Math.floor((t+3)/4)*16;case uo:return Math.floor((n+4)/5)*Math.floor((t+4)/5)*16;case fo:return Math.floor((n+5)/6)*Math.floor((t+4)/5)*16;case po:return Math.floor((n+5)/6)*Math.floor((t+5)/6)*16;case mo:return Math.floor((n+7)/8)*Math.floor((t+4)/5)*16;case go:return Math.floor((n+7)/8)*Math.floor((t+5)/6)*16;case xo:return Math.floor((n+7)/8)*Math.floor((t+7)/8)*16;case _o:return Math.floor((n+9)/10)*Math.floor((t+4)/5)*16;case vo:return Math.floor((n+9)/10)*Math.floor((t+5)/6)*16;case yo:return Math.floor((n+9)/10)*Math.floor((t+7)/8)*16;case Mo:return Math.floor((n+9)/10)*Math.floor((t+9)/10)*16;case bo:return Math.floor((n+11)/12)*Math.floor((t+9)/10)*16;case So:return Math.floor((n+11)/12)*Math.floor((t+11)/12)*16;case Eo:case wo:case To:return Math.ceil(n/4)*Math.ceil(t/4)*16;case Ao:case Ro:return Math.ceil(n/4)*Math.ceil(t/4)*8;case Sr:case Co:return Math.ceil(n/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function kf(n){switch(n){case si:case ac:return{byteLength:1,components:1};case ps:case oc:case Ai:return{byteLength:2,components:1};case $a:case Ya:return{byteLength:2,components:4};case Ti:case qa:case pi:return{byteLength:4,components:1};case lc:case cc:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${n}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?Gt("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function $u(){let n=null,t=!1,e=null,i=null;function s(r,a){i=n.requestAnimationFrame(s),e(r,a)}return{start:function(){t!==!0&&e!==null&&n!==null&&(i=n.requestAnimationFrame(s),t=!0)},stop:function(){n!==null&&n.cancelAnimationFrame(i),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){n=r}}}function zf(n){let t=new WeakMap;function e(o,l){let c=o.array,h=o.usage,d=c.byteLength,u=n.createBuffer();n.bindBuffer(l,u),n.bufferData(l,c,h),o.onUploadCallback();let f;if(c instanceof Float32Array)f=n.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)f=n.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?f=n.HALF_FLOAT:f=n.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=n.SHORT;else if(c instanceof Uint32Array)f=n.UNSIGNED_INT;else if(c instanceof Int32Array)f=n.INT;else if(c instanceof Int8Array)f=n.BYTE;else if(c instanceof Uint8Array)f=n.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:u,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:d}}function i(o,l,c){let h=l.array,d=l.updateRanges;if(n.bindBuffer(c,o),d.length===0)n.bufferSubData(c,0,h);else{d.sort((f,m)=>f.start-m.start);let u=0;for(let f=1;f<d.length;f++){let m=d[u],y=d[f];y.start<=m.start+m.count+1?m.count=Math.max(m.count,y.start+y.count-m.start):(++u,d[u]=y)}d.length=u+1;for(let f=0,m=d.length;f<m;f++){let y=d[f];n.bufferSubData(c,y.start*h.BYTES_PER_ELEMENT,h,y.start,y.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=t.get(o);l&&(n.deleteBuffer(l.buffer),t.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let h=t.get(o);(!h||h.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=t.get(o);if(c===void 0)t.set(o,e(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var Hf=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Gf=`#ifdef USE_ALPHAHASH
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
#endif`,Vf=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Wf=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Xf=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,qf=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,$f=`#ifdef USE_AOMAP
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
#endif`,Yf=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Zf=`#ifdef USE_BATCHING
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
#endif`,Jf=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Kf=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,jf=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Qf=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,tp=`#ifdef USE_IRIDESCENCE
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
#endif`,ep=`#ifdef USE_BUMPMAP
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
#endif`,ip=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,np=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,sp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,rp=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,ap=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,op=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,lp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,cp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,hp=`#define PI 3.141592653589793
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
} // validated`,up=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,dp=`vec3 transformedNormal = objectNormal;
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
#endif`,fp=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,pp=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,mp=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,gp=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,xp="gl_FragColor = linearToOutputTexel( gl_FragColor );",_p=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,vp=`#ifdef USE_ENVMAP
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
#endif`,yp=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,Mp=`#ifdef USE_ENVMAP
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
#endif`,bp=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Sp=`#ifdef USE_ENVMAP
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
#endif`,Ep=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,wp=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Tp=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Ap=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Rp=`#ifdef USE_GRADIENTMAP
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
}`,Cp=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Pp=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Ip=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Lp=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,Dp=`#ifdef USE_ENVMAP
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
#endif`,Np=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Up=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Fp=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Op=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,kp=`PhysicalMaterial material;
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
#endif`,Bp=`uniform sampler2D dfgLUT;
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
}`,zp=`
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
#endif`,Hp=`#if defined( RE_IndirectDiffuse )
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
#endif`,Gp=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Vp=`#ifdef USE_LIGHT_PROBES_GRID
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
#endif`,Wp=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Xp=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,qp=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,$p=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Yp=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Zp=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Jp=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Kp=`#if defined( USE_POINTS_UV )
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
#endif`,jp=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Qp=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,tm=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,em=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,im=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,nm=`#ifdef USE_MORPHTARGETS
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
#endif`,sm=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,rm=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,am=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,om=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,lm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,cm=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,hm=`#ifdef USE_NORMALMAP
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
#endif`,um=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,dm=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,fm=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,pm=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,mm=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,gm=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,xm=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,_m=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,vm=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,ym=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Mm=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,bm=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Sm=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Em=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,wm=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,Tm=`float getShadowMask() {
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
}`,Am=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Rm=`#ifdef USE_SKINNING
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
#endif`,Cm=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Pm=`#ifdef USE_SKINNING
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
#endif`,Im=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Lm=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Dm=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Nm=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,Um=`#ifdef USE_TRANSMISSION
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
#endif`,Fm=`#ifdef USE_TRANSMISSION
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
#endif`,Om=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,km=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Bm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,zm=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,Hm=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Gm=`uniform sampler2D t2D;
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
}`,Vm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Wm=`#ifdef ENVMAP_TYPE_CUBE
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
}`,Xm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,qm=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,$m=`#include <common>
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
}`,Ym=`#if DEPTH_PACKING == 3200
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
}`,Zm=`#define DISTANCE
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
}`,Jm=`#define DISTANCE
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
}`,Km=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,jm=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Qm=`uniform float scale;
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
}`,t0=`uniform vec3 diffuse;
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
}`,e0=`#include <common>
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
}`,i0=`uniform vec3 diffuse;
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
}`,n0=`#define LAMBERT
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
}`,s0=`#define LAMBERT
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
}`,r0=`#define MATCAP
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
}`,a0=`#define MATCAP
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
}`,o0=`#define NORMAL
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
}`,l0=`#define NORMAL
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
}`,c0=`#define PHONG
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
}`,h0=`#define PHONG
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
}`,u0=`#define STANDARD
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
}`,d0=`#define STANDARD
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
}`,f0=`#define TOON
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
}`,p0=`#define TOON
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
}`,m0=`uniform float size;
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
}`,g0=`uniform vec3 diffuse;
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
}`,x0=`#include <common>
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
}`,_0=`uniform vec3 color;
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
}`,v0=`uniform float rotation;
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
}`,y0=`uniform vec3 diffuse;
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
}`,Kt={alphahash_fragment:Hf,alphahash_pars_fragment:Gf,alphamap_fragment:Vf,alphamap_pars_fragment:Wf,alphatest_fragment:Xf,alphatest_pars_fragment:qf,aomap_fragment:$f,aomap_pars_fragment:Yf,batching_pars_vertex:Zf,batching_vertex:Jf,begin_vertex:Kf,beginnormal_vertex:jf,bsdfs:Qf,iridescence_fragment:tp,bumpmap_pars_fragment:ep,clipping_planes_fragment:ip,clipping_planes_pars_fragment:np,clipping_planes_pars_vertex:sp,clipping_planes_vertex:rp,color_fragment:ap,color_pars_fragment:op,color_pars_vertex:lp,color_vertex:cp,common:hp,cube_uv_reflection_fragment:up,defaultnormal_vertex:dp,displacementmap_pars_vertex:fp,displacementmap_vertex:pp,emissivemap_fragment:mp,emissivemap_pars_fragment:gp,colorspace_fragment:xp,colorspace_pars_fragment:_p,envmap_fragment:vp,envmap_common_pars_fragment:yp,envmap_pars_fragment:Mp,envmap_pars_vertex:bp,envmap_physical_pars_fragment:Dp,envmap_vertex:Sp,fog_vertex:Ep,fog_pars_vertex:wp,fog_fragment:Tp,fog_pars_fragment:Ap,gradientmap_pars_fragment:Rp,lightmap_pars_fragment:Cp,lights_lambert_fragment:Pp,lights_lambert_pars_fragment:Ip,lights_pars_begin:Lp,lights_toon_fragment:Np,lights_toon_pars_fragment:Up,lights_phong_fragment:Fp,lights_phong_pars_fragment:Op,lights_physical_fragment:kp,lights_physical_pars_fragment:Bp,lights_fragment_begin:zp,lights_fragment_maps:Hp,lights_fragment_end:Gp,lightprobes_pars_fragment:Vp,logdepthbuf_fragment:Wp,logdepthbuf_pars_fragment:Xp,logdepthbuf_pars_vertex:qp,logdepthbuf_vertex:$p,map_fragment:Yp,map_pars_fragment:Zp,map_particle_fragment:Jp,map_particle_pars_fragment:Kp,metalnessmap_fragment:jp,metalnessmap_pars_fragment:Qp,morphinstance_vertex:tm,morphcolor_vertex:em,morphnormal_vertex:im,morphtarget_pars_vertex:nm,morphtarget_vertex:sm,normal_fragment_begin:rm,normal_fragment_maps:am,normal_pars_fragment:om,normal_pars_vertex:lm,normal_vertex:cm,normalmap_pars_fragment:hm,clearcoat_normal_fragment_begin:um,clearcoat_normal_fragment_maps:dm,clearcoat_pars_fragment:fm,iridescence_pars_fragment:pm,opaque_fragment:mm,packing:gm,premultiplied_alpha_fragment:xm,project_vertex:_m,dithering_fragment:vm,dithering_pars_fragment:ym,roughnessmap_fragment:Mm,roughnessmap_pars_fragment:bm,shadowmap_pars_fragment:Sm,shadowmap_pars_vertex:Em,shadowmap_vertex:wm,shadowmask_pars_fragment:Tm,skinbase_vertex:Am,skinning_pars_vertex:Rm,skinning_vertex:Cm,skinnormal_vertex:Pm,specularmap_fragment:Im,specularmap_pars_fragment:Lm,tonemapping_fragment:Dm,tonemapping_pars_fragment:Nm,transmission_fragment:Um,transmission_pars_fragment:Fm,uv_pars_fragment:Om,uv_pars_vertex:km,uv_vertex:Bm,worldpos_vertex:zm,background_vert:Hm,background_frag:Gm,backgroundCube_vert:Vm,backgroundCube_frag:Wm,cube_vert:Xm,cube_frag:qm,depth_vert:$m,depth_frag:Ym,distance_vert:Zm,distance_frag:Jm,equirect_vert:Km,equirect_frag:jm,linedashed_vert:Qm,linedashed_frag:t0,meshbasic_vert:e0,meshbasic_frag:i0,meshlambert_vert:n0,meshlambert_frag:s0,meshmatcap_vert:r0,meshmatcap_frag:a0,meshnormal_vert:o0,meshnormal_frag:l0,meshphong_vert:c0,meshphong_frag:h0,meshphysical_vert:u0,meshphysical_frag:d0,meshtoon_vert:f0,meshtoon_frag:p0,points_vert:m0,points_frag:g0,shadow_vert:x0,shadow_frag:_0,sprite_vert:v0,sprite_frag:y0},_t={common:{diffuse:{value:new Rt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new $t},alphaMap:{value:null},alphaMapTransform:{value:new $t},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new $t}},envmap:{envMap:{value:null},envMapRotation:{value:new $t},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new $t}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new $t}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new $t},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new $t},normalScale:{value:new dt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new $t},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new $t}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new $t}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new $t}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Rt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new D},probesMax:{value:new D},probesResolution:{value:new D}},points:{diffuse:{value:new Rt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new $t},alphaTest:{value:0},uvTransform:{value:new $t}},sprite:{diffuse:{value:new Rt(16777215)},opacity:{value:1},center:{value:new dt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new $t},alphaMap:{value:null},alphaMapTransform:{value:new $t},alphaTest:{value:0}}},ki={basic:{uniforms:Ke([_t.common,_t.specularmap,_t.envmap,_t.aomap,_t.lightmap,_t.fog]),vertexShader:Kt.meshbasic_vert,fragmentShader:Kt.meshbasic_frag},lambert:{uniforms:Ke([_t.common,_t.specularmap,_t.envmap,_t.aomap,_t.lightmap,_t.emissivemap,_t.bumpmap,_t.normalmap,_t.displacementmap,_t.fog,_t.lights,{emissive:{value:new Rt(0)},envMapIntensity:{value:1}}]),vertexShader:Kt.meshlambert_vert,fragmentShader:Kt.meshlambert_frag},phong:{uniforms:Ke([_t.common,_t.specularmap,_t.envmap,_t.aomap,_t.lightmap,_t.emissivemap,_t.bumpmap,_t.normalmap,_t.displacementmap,_t.fog,_t.lights,{emissive:{value:new Rt(0)},specular:{value:new Rt(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:Kt.meshphong_vert,fragmentShader:Kt.meshphong_frag},standard:{uniforms:Ke([_t.common,_t.envmap,_t.aomap,_t.lightmap,_t.emissivemap,_t.bumpmap,_t.normalmap,_t.displacementmap,_t.roughnessmap,_t.metalnessmap,_t.fog,_t.lights,{emissive:{value:new Rt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Kt.meshphysical_vert,fragmentShader:Kt.meshphysical_frag},toon:{uniforms:Ke([_t.common,_t.aomap,_t.lightmap,_t.emissivemap,_t.bumpmap,_t.normalmap,_t.displacementmap,_t.gradientmap,_t.fog,_t.lights,{emissive:{value:new Rt(0)}}]),vertexShader:Kt.meshtoon_vert,fragmentShader:Kt.meshtoon_frag},matcap:{uniforms:Ke([_t.common,_t.bumpmap,_t.normalmap,_t.displacementmap,_t.fog,{matcap:{value:null}}]),vertexShader:Kt.meshmatcap_vert,fragmentShader:Kt.meshmatcap_frag},points:{uniforms:Ke([_t.points,_t.fog]),vertexShader:Kt.points_vert,fragmentShader:Kt.points_frag},dashed:{uniforms:Ke([_t.common,_t.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Kt.linedashed_vert,fragmentShader:Kt.linedashed_frag},depth:{uniforms:Ke([_t.common,_t.displacementmap]),vertexShader:Kt.depth_vert,fragmentShader:Kt.depth_frag},normal:{uniforms:Ke([_t.common,_t.bumpmap,_t.normalmap,_t.displacementmap,{opacity:{value:1}}]),vertexShader:Kt.meshnormal_vert,fragmentShader:Kt.meshnormal_frag},sprite:{uniforms:Ke([_t.sprite,_t.fog]),vertexShader:Kt.sprite_vert,fragmentShader:Kt.sprite_frag},background:{uniforms:{uvTransform:{value:new $t},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Kt.background_vert,fragmentShader:Kt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new $t}},vertexShader:Kt.backgroundCube_vert,fragmentShader:Kt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Kt.cube_vert,fragmentShader:Kt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Kt.equirect_vert,fragmentShader:Kt.equirect_frag},distance:{uniforms:Ke([_t.common,_t.displacementmap,{referencePosition:{value:new D},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Kt.distance_vert,fragmentShader:Kt.distance_frag},shadow:{uniforms:Ke([_t.lights,_t.fog,{color:{value:new Rt(0)},opacity:{value:1}}]),vertexShader:Kt.shadow_vert,fragmentShader:Kt.shadow_frag}};ki.physical={uniforms:Ke([ki.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new $t},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new $t},clearcoatNormalScale:{value:new dt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new $t},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new $t},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new $t},sheen:{value:0},sheenColor:{value:new Rt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new $t},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new $t},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new $t},transmissionSamplerSize:{value:new dt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new $t},attenuationDistance:{value:0},attenuationColor:{value:new Rt(0)},specularColor:{value:new Rt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new $t},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new $t},anisotropyVector:{value:new dt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new $t}}]),vertexShader:Kt.meshphysical_vert,fragmentShader:Kt.meshphysical_frag};var Do={r:0,b:0,g:0},M0=new ge,Yu=new $t;Yu.set(-1,0,0,0,1,0,0,0,1);function b0(n,t,e,i,s,r){let a=new Rt(0),o=s===!0?0:1,l,c,h=null,d=0,u=null;function f(M){let w=M.isScene===!0?M.background:null;if(w&&w.isTexture){let x=M.backgroundBlurriness>0;w=t.get(w,x)}return w}function m(M){let w=!1,x=f(M);x===null?g(a,o):x&&x.isColor&&(g(x,1),w=!0);let E=n.xr.getEnvironmentBlendMode();E==="additive"?e.buffers.color.setClear(0,0,0,1,r):E==="alpha-blend"&&e.buffers.color.setClear(0,0,0,0,r),(n.autoClear||w)&&(e.buffers.depth.setTest(!0),e.buffers.depth.setMask(!0),e.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function y(M,w){let x=f(w);x&&(x.isCubeTexture||x.mapping===gr)?(c===void 0&&(c=new lt(new Qt(1,1,1),new ti({name:"BackgroundCubeMaterial",uniforms:Dn(ki.backgroundCube.uniforms),vertexShader:ki.backgroundCube.vertexShader,fragmentShader:ki.backgroundCube.fragmentShader,side:Ve,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(E,S,R){this.matrixWorld.copyPosition(R.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(c)),c.material.uniforms.envMap.value=x,c.material.uniforms.backgroundBlurriness.value=w.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=w.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(M0.makeRotationFromEuler(w.backgroundRotation)).transpose(),x.isCubeTexture&&x.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(Yu),c.material.toneMapped=ne.getTransfer(x.colorSpace)!==de,(h!==x||d!==x.version||u!==n.toneMapping)&&(c.material.needsUpdate=!0,h=x,d=x.version,u=n.toneMapping),c.layers.enableAll(),M.unshift(c,c.geometry,c.material,0,0,null)):x&&x.isTexture&&(l===void 0&&(l=new lt(new Ue(2,2),new ti({name:"BackgroundMaterial",uniforms:Dn(ki.background.uniforms),vertexShader:ki.background.vertexShader,fragmentShader:ki.background.fragmentShader,side:dn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=x,l.material.uniforms.backgroundIntensity.value=w.backgroundIntensity,l.material.toneMapped=ne.getTransfer(x.colorSpace)!==de,x.matrixAutoUpdate===!0&&x.updateMatrix(),l.material.uniforms.uvTransform.value.copy(x.matrix),(h!==x||d!==x.version||u!==n.toneMapping)&&(l.material.needsUpdate=!0,h=x,d=x.version,u=n.toneMapping),l.layers.enableAll(),M.unshift(l,l.geometry,l.material,0,0,null))}function g(M,w){M.getRGB(Do,mc(n)),e.buffers.color.setClear(Do.r,Do.g,Do.b,w,r)}function p(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(M,w=1){a.set(M),o=w,g(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(M){o=M,g(a,o)},render:m,addToRenderList:y,dispose:p}}function S0(n,t){let e=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},s=u(null),r=s,a=!1;function o(C,I,O,L,k){let V=!1,W=d(C,L,O,I);r!==W&&(r=W,c(r.object)),V=f(C,L,O,k),V&&m(C,L,O,k),k!==null&&t.update(k,n.ELEMENT_ARRAY_BUFFER),(V||a)&&(a=!1,x(C,I,O,L),k!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,t.get(k).buffer))}function l(){return n.createVertexArray()}function c(C){return n.bindVertexArray(C)}function h(C){return n.deleteVertexArray(C)}function d(C,I,O,L){let k=L.wireframe===!0,V=i[I.id];V===void 0&&(V={},i[I.id]=V);let W=C.isInstancedMesh===!0?C.id:0,K=V[W];K===void 0&&(K={},V[W]=K);let q=K[O.id];q===void 0&&(q={},K[O.id]=q);let Q=q[k];return Q===void 0&&(Q=u(l()),q[k]=Q),Q}function u(C){let I=[],O=[],L=[];for(let k=0;k<e;k++)I[k]=0,O[k]=0,L[k]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:I,enabledAttributes:O,attributeDivisors:L,object:C,attributes:{},index:null}}function f(C,I,O,L){let k=r.attributes,V=I.attributes,W=0,K=O.getAttributes();for(let q in K)if(K[q].location>=0){let it=k[q],Dt=V[q];if(Dt===void 0&&(q==="instanceMatrix"&&C.instanceMatrix&&(Dt=C.instanceMatrix),q==="instanceColor"&&C.instanceColor&&(Dt=C.instanceColor)),it===void 0||it.attribute!==Dt||Dt&&it.data!==Dt.data)return!0;W++}return r.attributesNum!==W||r.index!==L}function m(C,I,O,L){let k={},V=I.attributes,W=0,K=O.getAttributes();for(let q in K)if(K[q].location>=0){let it=V[q];it===void 0&&(q==="instanceMatrix"&&C.instanceMatrix&&(it=C.instanceMatrix),q==="instanceColor"&&C.instanceColor&&(it=C.instanceColor));let Dt={};Dt.attribute=it,it&&it.data&&(Dt.data=it.data),k[q]=Dt,W++}r.attributes=k,r.attributesNum=W,r.index=L}function y(){let C=r.newAttributes;for(let I=0,O=C.length;I<O;I++)C[I]=0}function g(C){p(C,0)}function p(C,I){let O=r.newAttributes,L=r.enabledAttributes,k=r.attributeDivisors;O[C]=1,L[C]===0&&(n.enableVertexAttribArray(C),L[C]=1),k[C]!==I&&(n.vertexAttribDivisor(C,I),k[C]=I)}function M(){let C=r.newAttributes,I=r.enabledAttributes;for(let O=0,L=I.length;O<L;O++)I[O]!==C[O]&&(n.disableVertexAttribArray(O),I[O]=0)}function w(C,I,O,L,k,V,W){W===!0?n.vertexAttribIPointer(C,I,O,k,V):n.vertexAttribPointer(C,I,O,L,k,V)}function x(C,I,O,L){y();let k=L.attributes,V=O.getAttributes(),W=I.defaultAttributeValues;for(let K in V){let q=V[K];if(q.location>=0){let Q=k[K];if(Q===void 0&&(K==="instanceMatrix"&&C.instanceMatrix&&(Q=C.instanceMatrix),K==="instanceColor"&&C.instanceColor&&(Q=C.instanceColor)),Q!==void 0){let it=Q.normalized,Dt=Q.itemSize,At=t.get(Q);if(At===void 0)continue;let le=At.buffer,te=At.type,re=At.bytesPerElement,Z=te===n.INT||te===n.UNSIGNED_INT||Q.gpuType===qa;if(Q.isInterleavedBufferAttribute){let tt=Q.data,vt=tt.stride,Vt=Q.offset;if(tt.isInstancedInterleavedBuffer){for(let St=0;St<q.locationSize;St++)p(q.location+St,tt.meshPerAttribute);C.isInstancedMesh!==!0&&L._maxInstanceCount===void 0&&(L._maxInstanceCount=tt.meshPerAttribute*tt.count)}else for(let St=0;St<q.locationSize;St++)g(q.location+St);n.bindBuffer(n.ARRAY_BUFFER,le);for(let St=0;St<q.locationSize;St++)w(q.location+St,Dt/q.locationSize,te,it,vt*re,(Vt+Dt/q.locationSize*St)*re,Z)}else{if(Q.isInstancedBufferAttribute){for(let tt=0;tt<q.locationSize;tt++)p(q.location+tt,Q.meshPerAttribute);C.isInstancedMesh!==!0&&L._maxInstanceCount===void 0&&(L._maxInstanceCount=Q.meshPerAttribute*Q.count)}else for(let tt=0;tt<q.locationSize;tt++)g(q.location+tt);n.bindBuffer(n.ARRAY_BUFFER,le);for(let tt=0;tt<q.locationSize;tt++)w(q.location+tt,Dt/q.locationSize,te,it,Dt*re,Dt/q.locationSize*tt*re,Z)}}else if(W!==void 0){let it=W[K];if(it!==void 0)switch(it.length){case 2:n.vertexAttrib2fv(q.location,it);break;case 3:n.vertexAttrib3fv(q.location,it);break;case 4:n.vertexAttrib4fv(q.location,it);break;default:n.vertexAttrib1fv(q.location,it)}}}}M()}function E(){T();for(let C in i){let I=i[C];for(let O in I){let L=I[O];for(let k in L){let V=L[k];for(let W in V)h(V[W].object),delete V[W];delete L[k]}}delete i[C]}}function S(C){if(i[C.id]===void 0)return;let I=i[C.id];for(let O in I){let L=I[O];for(let k in L){let V=L[k];for(let W in V)h(V[W].object),delete V[W];delete L[k]}}delete i[C.id]}function R(C){for(let I in i){let O=i[I];for(let L in O){let k=O[L];if(k[C.id]===void 0)continue;let V=k[C.id];for(let W in V)h(V[W].object),delete V[W];delete k[C.id]}}}function v(C){for(let I in i){let O=i[I],L=C.isInstancedMesh===!0?C.id:0,k=O[L];if(k!==void 0){for(let V in k){let W=k[V];for(let K in W)h(W[K].object),delete W[K];delete k[V]}delete O[L],Object.keys(O).length===0&&delete i[I]}}}function T(){P(),a=!0,r!==s&&(r=s,c(r.object))}function P(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:T,resetDefaultState:P,dispose:E,releaseStatesOfGeometry:S,releaseStatesOfObject:v,releaseStatesOfProgram:R,initAttributes:y,enableAttribute:g,disableUnusedAttributes:M}}function E0(n,t,e){let i;function s(l){i=l}function r(l,c){n.drawArrays(i,l,c),e.update(c,i,1)}function a(l,c,h){h!==0&&(n.drawArraysInstanced(i,l,c,h),e.update(c,i,h))}function o(l,c,h){if(h===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,l,0,c,0,h);let u=0;for(let f=0;f<h;f++)u+=c[f];e.update(u,i,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function w0(n,t,e,i){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){let R=t.get("EXT_texture_filter_anisotropic");s=n.getParameter(R.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(R){return!(R!==mi&&i.convert(R)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(R){let v=R===Ai&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(R!==si&&R!==pi&&!v&&i.convert(R)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE))}function l(R){if(R==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";R="mediump"}return R==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp",h=l(c);h!==c&&(Gt("WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let d=e.logarithmicDepthBuffer===!0,u=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control");e.reversedDepthBuffer===!0&&u===!1&&Gt("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let f=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),m=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),y=n.getParameter(n.MAX_TEXTURE_SIZE),g=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),p=n.getParameter(n.MAX_VERTEX_ATTRIBS),M=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),w=n.getParameter(n.MAX_VARYING_VECTORS),x=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),E=n.getParameter(n.MAX_SAMPLES),S=n.getParameter(n.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:d,reversedDepthBuffer:u,maxTextures:f,maxVertexTextures:m,maxTextureSize:y,maxCubemapSize:g,maxAttributes:p,maxVertexUniforms:M,maxVaryings:w,maxFragmentUniforms:x,maxSamples:E,samples:S}}function T0(n){let t=this,e=null,i=0,s=!1,r=!1,a=new bi,o=new $t,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(d,u){let f=d.length!==0||u||i!==0||s;return s=u,i=d.length,f},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(d,u){e=h(d,u,0)},this.setState=function(d,u,f){let m=d.clippingPlanes,y=d.clipIntersection,g=d.clipShadows,p=n.get(d);if(!s||m===null||m.length===0||r&&!g)r?h(null):c();else{let M=r?0:i,w=M*4,x=p.clippingState||null;l.value=x,x=h(m,u,w,f);for(let E=0;E!==w;++E)x[E]=e[E];p.clippingState=x,this.numIntersection=y?this.numPlanes:0,this.numPlanes+=M}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=i>0),t.numPlanes=i,t.numIntersection=0}function h(d,u,f,m){let y=d!==null?d.length:0,g=null;if(y!==0){if(g=l.value,m!==!0||g===null){let p=f+y*4,M=u.matrixWorldInverse;o.getNormalMatrix(M),(g===null||g.length<p)&&(g=new Float32Array(p));for(let w=0,x=f;w!==y;++w,x+=4)a.copy(d[w]).applyMatrix4(M,o),a.normal.toArray(g,x),g[x+3]=a.constant}l.value=g,l.needsUpdate=!0}return t.numPlanes=y,t.numIntersection=0,g}}var _s=4,A0=6,R0=20,C0=256,Er=new us,Tu=new Rt,vc=null,yc=0,Mc=0,bc=!1,P0=new D,Nn=new D,Uo=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(t,e=0,i=.1,s=100,r={}){let{size:a=256,position:o=P0}=r;vc=this._renderer.getRenderTarget(),yc=this._renderer.getActiveCubeFace(),Mc=this._renderer.getActiveMipmapLevel(),bc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(t,i,s,l,o),e>0&&this._blur(l,0,0,e),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Cu(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Ru(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodMeshes.length;t++)this._lodMeshes[t].geometry.dispose()}_cleanup(t){this._renderer.setRenderTarget(vc,yc,Mc),this._renderer.xr.enabled=bc,t.scissorTest=!1,xs(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===fn||t.mapping===Ln?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),vc=this._renderer.getRenderTarget(),yc=this._renderer.getActiveCubeFace(),Mc=this._renderer.getActiveMipmapLevel(),bc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let i=e||this._allocateTargets();return this._textureToCubeUV(t,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,i={magFilter:Ge,minFilter:Ge,generateMipmaps:!1,type:Ai,format:mi,colorSpace:ks,depthBuffer:!1},s=Au(t,e,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Au(t,e,i);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=I0(r)),this._blurMaterial=D0(r,t,e),this._ggxMaterial=L0(r,t,e)}return s}_compileMaterial(t){let e=new lt(new Re,t);this._renderer.compile(e,Er)}_sceneToCubeUV(t,e,i,s,r){let l=new Ze(90,1,e,i),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],d=this._renderer,u=d.autoClear,f=d.toneMapping;d.getClearColor(Tu),d.toneMapping=wi,d.autoClear=!1,d.state.buffers.depth.getReversed()&&(d.setRenderTarget(s),d.clearDepth(),d.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new lt(new Qt,new Ne({name:"PMREM.Background",side:Ve,depthWrite:!1,depthTest:!1})));let y=this._backgroundBox,g=y.material,p=!1,M=t.background;M?M.isColor&&(g.color.copy(M),t.background=null,p=!0):(g.color.copy(Tu),p=!0);for(let w=0;w<6;w++){let x=w%3;x===0?(l.up.set(0,c[w],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+h[w],r.y,r.z)):x===1?(l.up.set(0,0,c[w]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+h[w],r.z)):(l.up.set(0,c[w],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+h[w]));let E=this._cubeSize;xs(s,x*E,w>2?E:0,E,E),d.setRenderTarget(s),p&&d.render(y,l),d.render(t,l)}d.toneMapping=f,d.autoClear=u,t.background=M}_textureToCubeUV(t,e){let i=this._renderer,s=t.mapping===fn||t.mapping===Ln;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Cu()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Ru());let r=s?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;let o=r.uniforms;o.envMap.value=t;let l=this._cubeSize;xs(e,0,0,3*l,2*l),i.setRenderTarget(e),i.render(a,Er)}_applyPMREM(t){let e=this._renderer,i=e.autoClear;e.autoClear=!1;let s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(t,r-1,r);e.autoClear=i}_applyGGXFilter(t,e,i){let s=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[i];o.material=a;let l=a.uniforms,c=i/(this._lodMeshes.length-1),h=e/(this._lodMeshes.length-1),d=Math.sqrt(c*c-h*h),u=c*1.25,f=d*u,{_lodMax:m}=this,y=this._sizeLods[i],g=3*y*(i>m-_s?i-m+_s:0),p=4*(this._cubeSize-y);l.envMap.value=t.texture,l.roughness.value=f,l.mipInt.value=m-e,xs(r,g,p,3*y,2*y),s.setRenderTarget(r),s.render(o,Er),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=m-i,xs(t,g,p,3*y,2*y),s.setRenderTarget(t),s.render(o,Er)}_blur(t,e,i,s){let r=this._pingPongRenderTarget,a=Math.min(s,Math.PI)/Math.SQRT2;this._blurPass(t,r,e,i,a),this._blurPass(r,t,i,i,a)}_blurPass(t,e,i,s,r){let a=this._renderer,o=this._blurMaterial,l=this._lodMeshes[s];l.material=o;let c=o.uniforms;c.envMap.value=t.texture,c.sigma.value=r,c.mipInt.value=this._lodMax-i;let h=this._sizeLods[s],d=3*h*(s>this._lodMax-_s?s-this._lodMax+_s:0),u=4*(this._cubeSize-h);xs(e,d,u,3*h,2*h),a.setRenderTarget(e),a.render(l,Er)}};function I0(n){let t=[],e=[],i=n,s=n-_s+1+A0;for(let r=0;r<s;r++){let a=Math.pow(2,i);t.push(a);let o=1/(a-2),l=-o,c=1+o,h=[l,l,c,l,c,c,l,l,c,c,l,c],d=6,u=6,f=3,m=new Float32Array(f*u*d),y=new Float32Array(f*u*d);for(let p=0;p<d;p++){let M=p%3*2/3-1,w=p>2?0:-1,x=[M,w,0,M+2/3,w,0,M+2/3,w+1,0,M,w,0,M+2/3,w+1,0,M,w+1,0];m.set(x,f*u*p);for(let E=0;E<u;E++){let S=h[E*2]*2-1,R=h[E*2+1]*2-1;p===0?Nn.set(1,R,S):p===1?Nn.set(-S,1,-R):p===2?Nn.set(-S,R,1):p===3?Nn.set(-1,R,-S):p===4?Nn.set(-S,-1,R):Nn.set(S,R,-1),Nn.toArray(y,(p*u+E)*f)}}let g=new Re;g.setAttribute("position",new Je(m,f)),g.setAttribute("outputDirection",new Je(y,f)),e.push(new lt(g,null)),i>_s&&i--}return{lodMeshes:e,sizeLods:t}}function Au(n,t,e){let i=new ii(n,t,e);return i.texture.mapping=gr,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function xs(n,t,e,i,s){n.viewport.set(t,e,i,s),n.scissor.set(t,e,i,s)}function L0(n,t,e){return new ti({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:C0,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:ko(),fragmentShader:`

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
		`,blending:Fi,depthTest:!1,depthWrite:!1})}function D0(n,t,e){return new ti({name:"SphericalGaussianBlur",defines:{SAMPLES:R0,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:ko(),fragmentShader:`

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
		`,blending:Fi,depthTest:!1,depthWrite:!1})}function Ru(){return new ti({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:ko(),fragmentShader:`

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
		`,blending:Fi,depthTest:!1,depthWrite:!1})}function Cu(){return new ti({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:ko(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Fi,depthTest:!1,depthWrite:!1})}function ko(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var Fo=class extends ii{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let i={width:t,height:t,depth:1},s=[i,i,i,i,i,i];this.texture=new Zs(s),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let i={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new Qt(5,5,5),r=new ti({name:"CubemapFromEquirect",uniforms:Dn(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:Ve,blending:Fi});r.uniforms.tEquirect.value=e;let a=new lt(s,r),o=e.minFilter;return e.minFilter===pn&&(e.minFilter=Ge),new Ha(1,10,this).update(t,a),e.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(t,e=!0,i=!0,s=!0){let r=t.getRenderTarget();for(let a=0;a<6;a++)t.setRenderTarget(this,a),t.clear(e,i,s);t.setRenderTarget(r)}};function N0(n){let t=new WeakMap,e=new WeakMap,i=null;function s(u,f=!1){return u==null?null:f?a(u):r(u)}function r(u){if(u&&u.isTexture){let f=u.mapping;if(f===Va||f===Wa)if(t.has(u)){let m=t.get(u).texture;return o(m,u.mapping)}else{let m=u.image;if(m&&m.height>0){let y=new Fo(m.height);return y.fromEquirectangularTexture(n,u),t.set(u,y),u.addEventListener("dispose",c),o(y.texture,u.mapping)}else return null}}return u}function a(u){if(u&&u.isTexture){let f=u.mapping,m=f===Va||f===Wa,y=f===fn||f===Ln;if(m||y){let g=e.get(u),p=g!==void 0?g.texture.pmremVersion:0;if(u.isRenderTargetTexture&&u.pmremVersion!==p)return i===null&&(i=new Uo(n)),g=m?i.fromEquirectangular(u,g):i.fromCubemap(u,g),g.texture.pmremVersion=u.pmremVersion,e.set(u,g),g.texture;if(g!==void 0)return g.texture;{let M=u.image;return m&&M&&M.height>0||y&&M&&l(M)?(i===null&&(i=new Uo(n)),g=m?i.fromEquirectangular(u):i.fromCubemap(u),g.texture.pmremVersion=u.pmremVersion,e.set(u,g),u.addEventListener("dispose",h),g.texture):null}}}return u}function o(u,f){return f===Va?u.mapping=fn:f===Wa&&(u.mapping=Ln),u}function l(u){let f=0,m=6;for(let y=0;y<m;y++)u[y]!==void 0&&f++;return f===m}function c(u){let f=u.target;f.removeEventListener("dispose",c);let m=t.get(f);m!==void 0&&(t.delete(f),m.dispose())}function h(u){let f=u.target;f.removeEventListener("dispose",h);let m=e.get(f);m!==void 0&&(e.delete(f),m.dispose())}function d(){t=new WeakMap,e=new WeakMap,i!==null&&(i.dispose(),i=null)}return{get:s,dispose:d}}function U0(n){let t={};function e(i){if(t[i]!==void 0)return t[i];let s=n.getExtension(i);return t[i]=s,s}return{has:function(i){return e(i)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(i){let s=e(i);return s===null&&wn("WebGLRenderer: "+i+" extension not supported."),s}}}function F0(n,t,e,i){let s={},r=new WeakMap;function a(d){let u=d.target;u.index!==null&&t.remove(u.index);for(let m in u.attributes)t.remove(u.attributes[m]);u.removeEventListener("dispose",a),delete s[u.id];let f=r.get(u);f&&(t.remove(f),r.delete(u)),i.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,e.memory.geometries--}function o(d,u){return s[u.id]===!0||(u.addEventListener("dispose",a),s[u.id]=!0,e.memory.geometries++),u}function l(d){let u=d.attributes;for(let f in u)t.update(u[f],n.ARRAY_BUFFER)}function c(d){let u=[],f=d.index,m=d.attributes.position,y=0;if(m===void 0)return;if(f!==null){let M=f.array;y=f.version;for(let w=0,x=M.length;w<x;w+=3){let E=M[w+0],S=M[w+1],R=M[w+2];u.push(E,S,S,R,R,E)}}else{let M=m.array;y=m.version;for(let w=0,x=M.length/3-1;w<x;w+=3){let E=w+0,S=w+1,R=w+2;u.push(E,S,S,R,R,E)}}let g=new(m.count>=65535?qs:Xs)(u,1);g.version=y;let p=r.get(d);p&&t.remove(p),r.set(d,g)}function h(d){let u=r.get(d);if(u){let f=d.index;f!==null&&u.version<f.version&&c(d)}else c(d);return r.get(d)}return{get:o,update:l,getWireframeAttribute:h}}function O0(n,t,e){let i;function s(d){i=d}let r,a;function o(d){r=d.type,a=d.bytesPerElement}function l(d,u){n.drawElements(i,u,r,d*a),e.update(u,i,1)}function c(d,u,f){f!==0&&(n.drawElementsInstanced(i,u,r,d*a,f),e.update(u,i,f))}function h(d,u,f){if(f===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,u,0,r,d,0,f);let y=0;for(let g=0;g<f;g++)y+=u[g];e.update(y,i,1)}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=h}function k0(n){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,a,o){switch(e.calls++,a){case n.TRIANGLES:e.triangles+=o*(r/3);break;case n.LINES:e.lines+=o*(r/2);break;case n.LINE_STRIP:e.lines+=o*(r-1);break;case n.LINE_LOOP:e.lines+=o*r;break;case n.POINTS:e.points+=o*r;break;default:Wt("WebGLInfo: Unknown draw mode:",a);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:i}}function B0(n,t,e){let i=new WeakMap,s=new Ee;function r(a,o,l){let c=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,d=h!==void 0?h.length:0,u=i.get(o);if(u===void 0||u.count!==d){let T=function(){R.dispose(),i.delete(o),o.removeEventListener("dispose",T)};u!==void 0&&u.texture.dispose();let f=o.morphAttributes.position!==void 0,m=o.morphAttributes.normal!==void 0,y=o.morphAttributes.color!==void 0,g=o.morphAttributes.position||[],p=o.morphAttributes.normal||[],M=o.morphAttributes.color||[],w=0;f===!0&&(w=1),m===!0&&(w=2),y===!0&&(w=3);let x=o.attributes.position.count*w,E=1;x>t.maxTextureSize&&(E=Math.ceil(x/t.maxTextureSize),x=t.maxTextureSize);let S=new Float32Array(x*E*4*d),R=new Hs(S,x,E,d);R.type=pi,R.needsUpdate=!0;let v=w*4;for(let P=0;P<d;P++){let C=g[P],I=p[P],O=M[P],L=x*E*4*P;for(let k=0;k<C.count;k++){let V=k*v;f===!0&&(s.fromBufferAttribute(C,k),S[L+V+0]=s.x,S[L+V+1]=s.y,S[L+V+2]=s.z,S[L+V+3]=0),m===!0&&(s.fromBufferAttribute(I,k),S[L+V+4]=s.x,S[L+V+5]=s.y,S[L+V+6]=s.z,S[L+V+7]=0),y===!0&&(s.fromBufferAttribute(O,k),S[L+V+8]=s.x,S[L+V+9]=s.y,S[L+V+10]=s.z,S[L+V+11]=O.itemSize===4?s.w:1)}}u={count:d,texture:R,size:new dt(x,E)},i.set(o,u),o.addEventListener("dispose",T)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(n,"morphTexture",a.morphTexture,e);else{let f=0;for(let y=0;y<c.length;y++)f+=c[y];let m=o.morphTargetsRelative?1:1-f;l.getUniforms().setValue(n,"morphTargetBaseInfluence",m),l.getUniforms().setValue(n,"morphTargetInfluences",c)}l.getUniforms().setValue(n,"morphTargetsTexture",u.texture,e),l.getUniforms().setValue(n,"morphTargetsTextureSize",u.size)}return{update:r}}function z0(n,t,e,i,s){let r=new WeakMap;function a(c){let h=s.render.frame,d=c.geometry,u=t.get(c,d);if(r.get(u)!==h&&(t.update(u),r.set(u,h)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==h&&(e.update(c.instanceMatrix,n.ARRAY_BUFFER),c.instanceColor!==null&&e.update(c.instanceColor,n.ARRAY_BUFFER),r.set(c,h))),c.isSkinnedMesh){let f=c.skeleton;r.get(f)!==h&&(f.update(),r.set(f,h))}return u}function o(){r=new WeakMap}function l(c){let h=c.target;h.removeEventListener("dispose",l),i.releaseStatesOfObject(h),e.remove(h.instanceMatrix),h.instanceColor!==null&&e.remove(h.instanceColor)}return{update:a,dispose:o}}var H0={[Ql]:"LINEAR_TONE_MAPPING",[tc]:"REINHARD_TONE_MAPPING",[ec]:"CINEON_TONE_MAPPING",[mr]:"ACES_FILMIC_TONE_MAPPING",[nc]:"AGX_TONE_MAPPING",[sc]:"NEUTRAL_TONE_MAPPING",[ic]:"CUSTOM_TONE_MAPPING"};function G0(n,t,e,i,s,r){let a=new ii(t,e,{type:n,depthBuffer:s,stencilBuffer:r,samples:i?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),o=null,l=null,c=new Re;c.setAttribute("position",new fe([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new fe([0,2,0,0,2,0],2));let h=new Aa({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),d=new lt(c,h),u=new us(-1,1,1,-1,0,1),f=null,m=null,y=!1,g,p=null,M=[],w=!1;this.setSize=function(x,E){a.setSize(x,E),o!==null&&o.setSize(x,E),l!==null&&l.setSize(x,E);for(let S=0;S<M.length;S++){let R=M[S];R.setSize&&R.setSize(x,E)}},this.setEffects=function(x){M=x,w=M.length>0&&M[0].isRenderPass===!0;let E=a.width,S=a.height;M.length>0&&o===null&&(o=new ii(E,S,{type:Ai,depthBuffer:!1,stencilBuffer:!1}),l=new ii(E,S,{type:Ai,depthBuffer:!1,stencilBuffer:!1}));for(let R=0;R<M.length;R++){let v=M[R];v.setSize&&v.setSize(E,S)}},this.begin=function(x,E){if(y||x.toneMapping===wi&&M.length===0)return!1;if(p=E,E!==null){let S=E.width,R=E.height;(a.width!==S||a.height!==R)&&this.setSize(S,R)}return w===!1&&x.setRenderTarget(a),g=x.toneMapping,x.toneMapping=wi,!0},this.hasRenderPass=function(){return w},this.end=function(x,E){x.toneMapping=g,y=!0;let S=a,R=o;for(let v=0;v<M.length;v++){let T=M[v];T.enabled!==!1&&(T.render(x,R,S,E),T.needsSwap!==!1&&(S=R,R=R===o?l:o))}if(f!==x.outputColorSpace||m!==x.toneMapping){f=x.outputColorSpace,m=x.toneMapping,h.defines={},ne.getTransfer(f)===de&&(h.defines.SRGB_TRANSFER="");let v=H0[m];v&&(h.defines[v]=""),h.needsUpdate=!0}h.uniforms.tDiffuse.value=S.texture,x.setRenderTarget(p),x.render(d,u),p=null,y=!1},this.isCompositing=function(){return y},this.dispose=function(){a.dispose(),o!==null&&o.dispose(),l!==null&&l.dispose(),c.dispose(),h.dispose()}}var Zu=new Qe,wc=new ln(1,1),Ju=new Hs,Ku=new va,ju=new Zs,Pu=[],Iu=[],Lu=new Float32Array(16),Du=new Float32Array(9),Nu=new Float32Array(4);function ys(n,t,e){let i=n[0];if(i<=0||i>0)return n;let s=t*e,r=Pu[s];if(r===void 0&&(r=new Float32Array(s),Pu[s]=r),t!==0){i.toArray(r,0);for(let a=1,o=0;a!==t;++a)o+=e,n[a].toArray(r,o)}return r}function Fe(n,t){if(n.length!==t.length)return!1;for(let e=0,i=n.length;e<i;e++)if(n[e]!==t[e])return!1;return!0}function Oe(n,t){for(let e=0,i=t.length;e<i;e++)n[e]=t[e]}function Bo(n,t){let e=Iu[t];e===void 0&&(e=new Int32Array(t),Iu[t]=e);for(let i=0;i!==t;++i)e[i]=n.allocateTextureUnit();return e}function V0(n,t){let e=this.cache;e[0]!==t&&(n.uniform1f(this.addr,t),e[0]=t)}function W0(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(n.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Fe(e,t))return;n.uniform2fv(this.addr,t),Oe(e,t)}}function X0(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(n.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(n.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Fe(e,t))return;n.uniform3fv(this.addr,t),Oe(e,t)}}function q0(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(n.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Fe(e,t))return;n.uniform4fv(this.addr,t),Oe(e,t)}}function $0(n,t){let e=this.cache,i=t.elements;if(i===void 0){if(Fe(e,t))return;n.uniformMatrix2fv(this.addr,!1,t),Oe(e,t)}else{if(Fe(e,i))return;Nu.set(i),n.uniformMatrix2fv(this.addr,!1,Nu),Oe(e,i)}}function Y0(n,t){let e=this.cache,i=t.elements;if(i===void 0){if(Fe(e,t))return;n.uniformMatrix3fv(this.addr,!1,t),Oe(e,t)}else{if(Fe(e,i))return;Du.set(i),n.uniformMatrix3fv(this.addr,!1,Du),Oe(e,i)}}function Z0(n,t){let e=this.cache,i=t.elements;if(i===void 0){if(Fe(e,t))return;n.uniformMatrix4fv(this.addr,!1,t),Oe(e,t)}else{if(Fe(e,i))return;Lu.set(i),n.uniformMatrix4fv(this.addr,!1,Lu),Oe(e,i)}}function J0(n,t){let e=this.cache;e[0]!==t&&(n.uniform1i(this.addr,t),e[0]=t)}function K0(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(n.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Fe(e,t))return;n.uniform2iv(this.addr,t),Oe(e,t)}}function j0(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(n.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Fe(e,t))return;n.uniform3iv(this.addr,t),Oe(e,t)}}function Q0(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(n.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Fe(e,t))return;n.uniform4iv(this.addr,t),Oe(e,t)}}function tg(n,t){let e=this.cache;e[0]!==t&&(n.uniform1ui(this.addr,t),e[0]=t)}function eg(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(n.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Fe(e,t))return;n.uniform2uiv(this.addr,t),Oe(e,t)}}function ig(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(n.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Fe(e,t))return;n.uniform3uiv(this.addr,t),Oe(e,t)}}function ng(n,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(n.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Fe(e,t))return;n.uniform4uiv(this.addr,t),Oe(e,t)}}function sg(n,t,e){let i=this.cache,s=e.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s);let r;this.type===n.SAMPLER_2D_SHADOW?(wc.compareFunction=e.isReversedDepthBuffer()?Lo:Io,r=wc):r=Zu,e.setTexture2D(t||r,s)}function rg(n,t,e){let i=this.cache,s=e.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),e.setTexture3D(t||Ku,s)}function ag(n,t,e){let i=this.cache,s=e.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),e.setTextureCube(t||ju,s)}function og(n,t,e){let i=this.cache,s=e.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),e.setTexture2DArray(t||Ju,s)}function lg(n){switch(n){case 5126:return V0;case 35664:return W0;case 35665:return X0;case 35666:return q0;case 35674:return $0;case 35675:return Y0;case 35676:return Z0;case 5124:case 35670:return J0;case 35667:case 35671:return K0;case 35668:case 35672:return j0;case 35669:case 35673:return Q0;case 5125:return tg;case 36294:return eg;case 36295:return ig;case 36296:return ng;case 35678:case 36198:case 36298:case 36306:case 35682:return sg;case 35679:case 36299:case 36307:return rg;case 35680:case 36300:case 36308:case 36293:return ag;case 36289:case 36303:case 36311:case 36292:return og}}function cg(n,t){n.uniform1fv(this.addr,t)}function hg(n,t){let e=ys(t,this.size,2);n.uniform2fv(this.addr,e)}function ug(n,t){let e=ys(t,this.size,3);n.uniform3fv(this.addr,e)}function dg(n,t){let e=ys(t,this.size,4);n.uniform4fv(this.addr,e)}function fg(n,t){let e=ys(t,this.size,4);n.uniformMatrix2fv(this.addr,!1,e)}function pg(n,t){let e=ys(t,this.size,9);n.uniformMatrix3fv(this.addr,!1,e)}function mg(n,t){let e=ys(t,this.size,16);n.uniformMatrix4fv(this.addr,!1,e)}function gg(n,t){n.uniform1iv(this.addr,t)}function xg(n,t){n.uniform2iv(this.addr,t)}function _g(n,t){n.uniform3iv(this.addr,t)}function vg(n,t){n.uniform4iv(this.addr,t)}function yg(n,t){n.uniform1uiv(this.addr,t)}function Mg(n,t){n.uniform2uiv(this.addr,t)}function bg(n,t){n.uniform3uiv(this.addr,t)}function Sg(n,t){n.uniform4uiv(this.addr,t)}function Eg(n,t,e){let i=this.cache,s=t.length,r=Bo(e,s);Fe(i,r)||(n.uniform1iv(this.addr,r),Oe(i,r));let a;this.type===n.SAMPLER_2D_SHADOW?a=wc:a=Zu;for(let o=0;o!==s;++o)e.setTexture2D(t[o]||a,r[o])}function wg(n,t,e){let i=this.cache,s=t.length,r=Bo(e,s);Fe(i,r)||(n.uniform1iv(this.addr,r),Oe(i,r));for(let a=0;a!==s;++a)e.setTexture3D(t[a]||Ku,r[a])}function Tg(n,t,e){let i=this.cache,s=t.length,r=Bo(e,s);Fe(i,r)||(n.uniform1iv(this.addr,r),Oe(i,r));for(let a=0;a!==s;++a)e.setTextureCube(t[a]||ju,r[a])}function Ag(n,t,e){let i=this.cache,s=t.length,r=Bo(e,s);Fe(i,r)||(n.uniform1iv(this.addr,r),Oe(i,r));for(let a=0;a!==s;++a)e.setTexture2DArray(t[a]||Ju,r[a])}function Rg(n){switch(n){case 5126:return cg;case 35664:return hg;case 35665:return ug;case 35666:return dg;case 35674:return fg;case 35675:return pg;case 35676:return mg;case 5124:case 35670:return gg;case 35667:case 35671:return xg;case 35668:case 35672:return _g;case 35669:case 35673:return vg;case 5125:return yg;case 36294:return Mg;case 36295:return bg;case 36296:return Sg;case 35678:case 36198:case 36298:case 36306:case 35682:return Eg;case 35679:case 36299:case 36307:return wg;case 35680:case 36300:case 36308:case 36293:return Tg;case 36289:case 36303:case 36311:case 36292:return Ag}}var Tc=class{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.setValue=lg(e.type)}},Ac=class{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=Rg(e.type)}},Rc=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,i){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let o=s[r];o.setValue(t,e[o.id],i)}}},Sc=/(\w+)(\])?(\[|\.)?/g;function Uu(n,t){n.seq.push(t),n.map[t.id]=t}function Cg(n,t,e){let i=n.name,s=i.length;for(Sc.lastIndex=0;;){let r=Sc.exec(i),a=Sc.lastIndex,o=r[1],l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){Uu(e,c===void 0?new Tc(o,n,t):new Ac(o,n,t));break}else{let d=e.map[o];d===void 0&&(d=new Rc(o),Uu(e,d)),e=d}}}var vs=class{constructor(t,e){this.seq=[],this.map={};let i=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let a=0;a<i;++a){let o=t.getActiveUniform(e,a),l=t.getUniformLocation(e,o.name);Cg(o,l,this)}let s=[],r=[];for(let a of this.seq)a.type===t.SAMPLER_2D_SHADOW||a.type===t.SAMPLER_CUBE_SHADOW||a.type===t.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(t,e,i,s){let r=this.map[e];r!==void 0&&r.setValue(t,i,s)}setOptional(t,e,i){let s=e[i];s!==void 0&&this.setValue(t,i,s)}static upload(t,e,i,s){for(let r=0,a=e.length;r!==a;++r){let o=e[r],l=i[o.id];l.needsUpdate!==!1&&o.setValue(t,l.value,s)}}static seqWithValue(t,e){let i=[];for(let s=0,r=t.length;s!==r;++s){let a=t[s];a.id in e&&i.push(a)}return i}};function Fu(n,t,e){let i=n.createShader(t);return n.shaderSource(i,e),n.compileShader(i),i}var Pg=37297,Ig=0;function Lg(n,t){let e=n.split(`
`),i=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let a=s;a<r;a++){let o=a+1;i.push(`${o===t?">":" "} ${o}: ${e[a]}`)}return i.join(`
`)}var Ou=new $t;function Dg(n){ne._getMatrix(Ou,ne.workingColorSpace,n);let t=`mat3( ${Ou.elements.map(e=>e.toFixed(4))} )`;switch(ne.getTransfer(n)){case Bs:return[t,"LinearTransferOETF"];case de:return[t,"sRGBTransferOETF"];default:return Gt("WebGLProgram: Unsupported color space: ",n),[t,"LinearTransferOETF"]}}function ku(n,t,e){let i=n.getShaderParameter(t,n.COMPILE_STATUS),r=(n.getShaderInfoLog(t)||"").trim();if(i&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return e.toUpperCase()+`

`+r+`

`+Lg(n.getShaderSource(t),o)}else return r}function Ng(n,t){let e=Dg(t);return[`vec4 ${n}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}var Ug={[Ql]:"Linear",[tc]:"Reinhard",[ec]:"Cineon",[mr]:"ACESFilmic",[nc]:"AgX",[sc]:"Neutral",[ic]:"Custom"};function Fg(n,t){let e=Ug[t];return e===void 0?(Gt("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+n+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+n+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}var No=new D;function Og(){ne.getLuminanceCoefficients(No);let n=No.x.toFixed(4),t=No.y.toFixed(4),e=No.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function kg(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Tr).join(`
`)}function Bg(n){let t=[];for(let e in n){let i=n[e];i!==!1&&t.push("#define "+e+" "+i)}return t.join(`
`)}function zg(n,t){let e={},i=n.getProgramParameter(t,n.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){let r=n.getActiveAttrib(t,s),a=r.name,o=1;r.type===n.FLOAT_MAT2&&(o=2),r.type===n.FLOAT_MAT3&&(o=3),r.type===n.FLOAT_MAT4&&(o=4),e[a]={type:r.type,location:n.getAttribLocation(t,a),locationSize:o}}return e}function Tr(n){return n!==""}function Bu(n,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return n.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function zu(n,t){return n.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var Hg=/^[ \t]*#include +<([\w\d./]+)>/gm;function Cc(n){return n.replace(Hg,Vg)}var Gg=new Map;function Vg(n,t){let e=Kt[t];if(e===void 0){let i=Gg.get(t);if(i!==void 0)e=Kt[i],Gt('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,i);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">")}return Cc(e)}var Wg=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Hu(n){return n.replace(Wg,Xg)}function Xg(n,t,e,i){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Gu(n){let t=`precision ${n.precision} float;
	precision ${n.precision} int;
	precision ${n.precision} sampler2D;
	precision ${n.precision} samplerCube;
	precision ${n.precision} sampler3D;
	precision ${n.precision} sampler2DArray;
	precision ${n.precision} sampler2DShadow;
	precision ${n.precision} samplerCubeShadow;
	precision ${n.precision} sampler2DArrayShadow;
	precision ${n.precision} isampler2D;
	precision ${n.precision} isampler3D;
	precision ${n.precision} isamplerCube;
	precision ${n.precision} isampler2DArray;
	precision ${n.precision} usampler2D;
	precision ${n.precision} usampler3D;
	precision ${n.precision} usamplerCube;
	precision ${n.precision} usampler2DArray;
	`;return n.precision==="highp"?t+=`
#define HIGH_PRECISION`:n.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:n.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}var qg={[pr]:"SHADOWMAP_TYPE_PCF",[ds]:"SHADOWMAP_TYPE_VSM"};function $g(n){return qg[n.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var Yg={[fn]:"ENVMAP_TYPE_CUBE",[Ln]:"ENVMAP_TYPE_CUBE",[gr]:"ENVMAP_TYPE_CUBE_UV"};function Zg(n){return n.envMap===!1?"ENVMAP_TYPE_CUBE":Yg[n.envMapMode]||"ENVMAP_TYPE_CUBE"}var Jg={[Ln]:"ENVMAP_MODE_REFRACTION"};function Kg(n){return n.envMap===!1?"ENVMAP_MODE_REFLECTION":Jg[n.envMapMode]||"ENVMAP_MODE_REFLECTION"}var jg={[jl]:"ENVMAP_BLENDING_MULTIPLY",[eu]:"ENVMAP_BLENDING_MIX",[iu]:"ENVMAP_BLENDING_ADD"};function Qg(n){return n.envMap===!1?"ENVMAP_BLENDING_NONE":jg[n.combine]||"ENVMAP_BLENDING_NONE"}function tx(n){let t=n.envMapCubeUVHeight;if(t===null)return null;let e=Math.log2(t)-2,i=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:i,maxMip:e}}function ex(n,t,e,i){let s=n.getContext(),r=e.defines,a=e.vertexShader,o=e.fragmentShader,l=$g(e),c=Zg(e),h=Kg(e),d=Qg(e),u=tx(e),f=kg(e),m=Bg(r),y=s.createProgram(),g,p,M=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(g=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m].filter(Tr).join(`
`),g.length>0&&(g+=`
`),p=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m].filter(Tr).join(`
`),p.length>0&&(p+=`
`)):(g=[Gu(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexNormals?"#define HAS_NORMAL":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Tr).join(`
`),p=[Gu(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,m,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+h:"",e.envMap?"#define "+d:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.retroreflection?"#define USE_RETROREFLECTION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas||e.batchingColor?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==wi?"#define TONE_MAPPING":"",e.toneMapping!==wi?Kt.tonemapping_pars_fragment:"",e.toneMapping!==wi?Fg("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",Kt.colorspace_pars_fragment,Ng("linearToOutputTexel",e.outputColorSpace),Og(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(Tr).join(`
`)),a=Cc(a),a=Bu(a,e),a=zu(a,e),o=Cc(o),o=Bu(o,e),o=zu(o,e),a=Hu(a),o=Hu(o),e.isRawShaderMaterial!==!0&&(M=`#version 300 es
`,g=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+g,p=["#define varying in",e.glslVersion===dc?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===dc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);let w=M+g+a,x=M+p+o,E=Fu(s,s.VERTEX_SHADER,w),S=Fu(s,s.FRAGMENT_SHADER,x);s.attachShader(y,E),s.attachShader(y,S),e.index0AttributeName!==void 0?s.bindAttribLocation(y,0,e.index0AttributeName):e.hasPositionAttribute===!0&&s.bindAttribLocation(y,0,"position"),s.linkProgram(y);function R(C){if(n.debug.checkShaderErrors){let I=s.getProgramInfoLog(y)||"",O=s.getShaderInfoLog(E)||"",L=s.getShaderInfoLog(S)||"",k=I.trim(),V=O.trim(),W=L.trim(),K=!0,q=!0;if(s.getProgramParameter(y,s.LINK_STATUS)===!1)if(K=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(s,y,E,S);else{let Q=ku(s,E,"vertex"),it=ku(s,S,"fragment");Wt("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(y,s.VALIDATE_STATUS)+`

Material Name: `+C.name+`
Material Type: `+C.type+`

Program Info Log: `+k+`
`+Q+`
`+it)}else k!==""?Gt("WebGLProgram: Program Info Log:",k):(V===""||W==="")&&(q=!1);q&&(C.diagnostics={runnable:K,programLog:k,vertexShader:{log:V,prefix:g},fragmentShader:{log:W,prefix:p}})}s.deleteShader(E),s.deleteShader(S),v=new vs(s,y),T=zg(s,y)}let v;this.getUniforms=function(){return v===void 0&&R(this),v};let T;this.getAttributes=function(){return T===void 0&&R(this),T};let P=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return P===!1&&(P=s.getProgramParameter(y,Pg)),P},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(y),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=Ig++,this.cacheKey=t,this.usedTimes=1,this.program=y,this.vertexShader=E,this.fragmentShader=S,this}var ix=0,Pc=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,e,i){let s=this._getShaderCacheForMaterial(t);return s.has(e)===!1&&(s.add(e),e.usedTimes++),s.has(i)===!1&&(s.add(i),i.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let i of e)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,i=e.get(t);return i===void 0&&(i=new Set,e.set(t,i)),i}_getShaderStage(t){let e=this.shaderCache,i=e.get(t);return i===void 0&&(i=new Ic(t),e.set(t,i)),i}},Ic=class{constructor(t){this.id=ix++,this.code=t,this.usedTimes=0}};function nx(n){return n===gn||n===br||n===Sr}function sx(n,t,e,i,s,r){let a=new Gs,o=new Pc,l=new Set,c=[],h=new Map,d=i.logarithmicDepthBuffer,u=i.precision,f={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function m(v){return l.add(v),v===0?"uv":`uv${v}`}function y(v,T,P,C,I,O){let L=C.fog,k=I.geometry,V=v.isMeshStandardMaterial||v.isMeshLambertMaterial||v.isMeshPhongMaterial?C.environment:null,W=v.isMeshStandardMaterial||v.isMeshLambertMaterial&&!v.envMap||v.isMeshPhongMaterial&&!v.envMap,K=t.get(v.envMap||V,W),q=K&&K.mapping===gr?K.image.height:null,Q=f[v.type];v.precision!==null&&(u=i.getMaxPrecision(v.precision),u!==v.precision&&Gt("WebGLProgram.getParameters:",v.precision,"not supported, using",u,"instead."));let it=k.morphAttributes.position||k.morphAttributes.normal||k.morphAttributes.color,Dt=it!==void 0?it.length:0,At=0;k.morphAttributes.position!==void 0&&(At=1),k.morphAttributes.normal!==void 0&&(At=2),k.morphAttributes.color!==void 0&&(At=3);let le,te,re,Z;if(Q){let _e=ki[Q];le=_e.vertexShader,te=_e.fragmentShader}else{le=v.vertexShader,te=v.fragmentShader;let _e=o.getVertexShaderStage(v),he=o.getFragmentShaderStage(v);o.update(v,_e,he),re=_e.id,Z=he.id}let tt=n.getRenderTarget(),vt=n.state.buffers.depth.getReversed(),Vt=I.isInstancedMesh===!0,St=I.isBatchedMesh===!0,Xt=!!v.map,pe=!!v.matcap,et=!!K,st=!!v.aoMap,rt=!!v.lightMap,at=!!v.bumpMap&&v.wireframe===!1,ut=!!v.normalMap,Bt=!!v.displacementMap,Ot=!!v.emissiveMap,qt=!!v.metalnessMap,Yt=!!v.roughnessMap,N=v.anisotropy>0,ce=v.clearcoat>0,ee=v.dispersion>0,A=v.retroreflectivity>0,_=v.iridescence>0,B=v.sheen>0,G=v.transmission>0,$=N&&!!v.anisotropyMap,ot=ce&&!!v.clearcoatMap,ht=ce&&!!v.clearcoatNormalMap,Y=ce&&!!v.clearcoatRoughnessMap,j=_&&!!v.iridescenceMap,ft=_&&!!v.iridescenceThicknessMap,Nt=B&&!!v.sheenColorMap,xt=B&&!!v.sheenRoughnessMap,pt=!!v.specularMap,Ut=!!v.specularColorMap,zt=!!v.specularIntensityMap,Zt=G&&!!v.transmissionMap,F=G&&!!v.thicknessMap,mt=!!v.gradientMap,J=!!v.alphaMap,gt=v.alphaTest>0,bt=!!v.alphaHash,nt=!!v.extensions,Ft=wi;v.toneMapped&&(tt===null||tt.isXRRenderTarget===!0)&&(Ft=n.toneMapping);let It={shaderID:Q,shaderType:v.type,shaderName:v.name,vertexShader:le,fragmentShader:te,defines:v.defines,customVertexShaderID:re,customFragmentShaderID:Z,isRawShaderMaterial:v.isRawShaderMaterial===!0,glslVersion:v.glslVersion,precision:u,batching:St,batchingColor:St&&I._colorsTexture!==null,instancing:Vt,instancingColor:Vt&&I.instanceColor!==null,instancingMorph:Vt&&I.morphTexture!==null,outputColorSpace:tt===null?n.outputColorSpace:tt.isXRRenderTarget===!0?tt.texture.colorSpace:ne.workingColorSpace,alphaToCoverage:!!v.alphaToCoverage,map:Xt,matcap:pe,envMap:et,envMapMode:et&&K.mapping,envMapCubeUVHeight:q,aoMap:st,lightMap:rt,bumpMap:at,normalMap:ut,displacementMap:Bt,emissiveMap:Ot,normalMapObjectSpace:ut&&v.normalMapType===ru,normalMapTangentSpace:ut&&v.normalMapType===Po,packedNormalMap:ut&&v.normalMapType===Po&&nx(v.normalMap.format),metalnessMap:qt,roughnessMap:Yt,anisotropy:N,anisotropyMap:$,clearcoat:ce,clearcoatMap:ot,clearcoatNormalMap:ht,clearcoatRoughnessMap:Y,dispersion:ee,retroreflection:A,iridescence:_,iridescenceMap:j,iridescenceThicknessMap:ft,sheen:B,sheenColorMap:Nt,sheenRoughnessMap:xt,specularMap:pt,specularColorMap:Ut,specularIntensityMap:zt,transmission:G,transmissionMap:Zt,thicknessMap:F,gradientMap:mt,opaque:v.transparent===!1&&v.blending===fs&&v.alphaToCoverage===!1,alphaMap:J,alphaTest:gt,alphaHash:bt,combine:v.combine,mapUv:Xt&&m(v.map.channel),aoMapUv:st&&m(v.aoMap.channel),lightMapUv:rt&&m(v.lightMap.channel),bumpMapUv:at&&m(v.bumpMap.channel),normalMapUv:ut&&m(v.normalMap.channel),displacementMapUv:Bt&&m(v.displacementMap.channel),emissiveMapUv:Ot&&m(v.emissiveMap.channel),metalnessMapUv:qt&&m(v.metalnessMap.channel),roughnessMapUv:Yt&&m(v.roughnessMap.channel),anisotropyMapUv:$&&m(v.anisotropyMap.channel),clearcoatMapUv:ot&&m(v.clearcoatMap.channel),clearcoatNormalMapUv:ht&&m(v.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Y&&m(v.clearcoatRoughnessMap.channel),iridescenceMapUv:j&&m(v.iridescenceMap.channel),iridescenceThicknessMapUv:ft&&m(v.iridescenceThicknessMap.channel),sheenColorMapUv:Nt&&m(v.sheenColorMap.channel),sheenRoughnessMapUv:xt&&m(v.sheenRoughnessMap.channel),specularMapUv:pt&&m(v.specularMap.channel),specularColorMapUv:Ut&&m(v.specularColorMap.channel),specularIntensityMapUv:zt&&m(v.specularIntensityMap.channel),transmissionMapUv:Zt&&m(v.transmissionMap.channel),thicknessMapUv:F&&m(v.thicknessMap.channel),alphaMapUv:J&&m(v.alphaMap.channel),vertexTangents:!!k.attributes.tangent&&(ut||N),vertexNormals:!!k.attributes.normal,vertexColors:v.vertexColors,vertexAlphas:v.vertexColors===!0&&!!k.attributes.color&&k.attributes.color.itemSize===4,pointsUvs:I.isPoints===!0&&!!k.attributes.uv&&(Xt||J),fog:!!L,useFog:v.fog===!0,fogExp2:!!L&&L.isFogExp2,flatShading:v.wireframe===!1&&(v.flatShading===!0||k.attributes.normal===void 0&&ut===!1&&(v.isMeshLambertMaterial||v.isMeshPhongMaterial||v.isMeshStandardMaterial||v.isMeshPhysicalMaterial)),sizeAttenuation:v.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:vt,skinning:I.isSkinnedMesh===!0,hasPositionAttribute:k.attributes.position!==void 0,morphTargets:k.morphAttributes.position!==void 0,morphNormals:k.morphAttributes.normal!==void 0,morphColors:k.morphAttributes.color!==void 0,morphTargetsCount:Dt,morphTextureStride:At,numSunLights:T.sun.length,numDirLights:T.directional.length,numPointLights:T.point.length,numSpotLights:T.spot.length,numSpotLightMaps:T.spotLightMap.length,numRectAreaLights:T.rectArea.length,numHemiLights:T.hemi.length,numSunLightShadows:T.sunShadowMap.length,numDirLightShadows:T.directionalShadowMap.length,numPointLightShadows:T.pointShadowMap.length,numSpotLightShadows:T.spotShadowMap.length,numSpotLightShadowsWithMaps:T.numSpotLightShadowsWithMaps,numLightProbes:T.numLightProbes,numLightProbeGrids:O.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:v.dithering,shadowMapEnabled:n.shadowMap.enabled&&P.length>0,shadowMapType:n.shadowMap.type,toneMapping:Ft,decodeVideoTexture:Xt&&v.map.isVideoTexture===!0&&ne.getTransfer(v.map.colorSpace)===de,decodeVideoTextureEmissive:Ot&&v.emissiveMap.isVideoTexture===!0&&ne.getTransfer(v.emissiveMap.colorSpace)===de,premultipliedAlpha:v.premultipliedAlpha,doubleSided:v.side===Pe,flipSided:v.side===Ve,useDepthPacking:v.depthPacking>=0,depthPacking:v.depthPacking||0,index0AttributeName:v.index0AttributeName,extensionClipCullDistance:nt&&v.extensions.clipCullDistance===!0&&e.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(nt&&v.extensions.multiDraw===!0||St)&&e.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:e.has("KHR_parallel_shader_compile"),customProgramCacheKey:v.customProgramCacheKey()};return It.vertexUv1s=l.has(1),It.vertexUv2s=l.has(2),It.vertexUv3s=l.has(3),l.clear(),It}function g(v){let T=[];if(v.shaderID?T.push(v.shaderID):(T.push(v.customVertexShaderID),T.push(v.customFragmentShaderID)),v.defines!==void 0)for(let P in v.defines)T.push(P),T.push(v.defines[P]);return v.isRawShaderMaterial===!1&&(p(T,v),M(T,v),T.push(n.outputColorSpace)),T.push(v.customProgramCacheKey),T.join()}function p(v,T){v.push(T.precision),v.push(T.outputColorSpace),v.push(T.envMapMode),v.push(T.envMapCubeUVHeight),v.push(T.mapUv),v.push(T.alphaMapUv),v.push(T.lightMapUv),v.push(T.aoMapUv),v.push(T.bumpMapUv),v.push(T.normalMapUv),v.push(T.displacementMapUv),v.push(T.emissiveMapUv),v.push(T.metalnessMapUv),v.push(T.roughnessMapUv),v.push(T.anisotropyMapUv),v.push(T.clearcoatMapUv),v.push(T.clearcoatNormalMapUv),v.push(T.clearcoatRoughnessMapUv),v.push(T.iridescenceMapUv),v.push(T.iridescenceThicknessMapUv),v.push(T.sheenColorMapUv),v.push(T.sheenRoughnessMapUv),v.push(T.specularMapUv),v.push(T.specularColorMapUv),v.push(T.specularIntensityMapUv),v.push(T.transmissionMapUv),v.push(T.thicknessMapUv),v.push(T.combine),v.push(T.fogExp2),v.push(T.sizeAttenuation),v.push(T.morphTargetsCount),v.push(T.morphAttributeCount),v.push(T.numSunLights),v.push(T.numDirLights),v.push(T.numPointLights),v.push(T.numSpotLights),v.push(T.numSpotLightMaps),v.push(T.numHemiLights),v.push(T.numRectAreaLights),v.push(T.numSunLightShadows),v.push(T.numDirLightShadows),v.push(T.numPointLightShadows),v.push(T.numSpotLightShadows),v.push(T.numSpotLightShadowsWithMaps),v.push(T.numLightProbes),v.push(T.shadowMapType),v.push(T.toneMapping),v.push(T.numClippingPlanes),v.push(T.numClipIntersection),v.push(T.depthPacking)}function M(v,T){a.disableAll(),T.instancing&&a.enable(0),T.instancingColor&&a.enable(1),T.instancingMorph&&a.enable(2),T.matcap&&a.enable(3),T.envMap&&a.enable(4),T.normalMapObjectSpace&&a.enable(5),T.normalMapTangentSpace&&a.enable(6),T.clearcoat&&a.enable(7),T.iridescence&&a.enable(8),T.alphaTest&&a.enable(9),T.vertexColors&&a.enable(10),T.vertexAlphas&&a.enable(11),T.vertexUv1s&&a.enable(12),T.vertexUv2s&&a.enable(13),T.vertexUv3s&&a.enable(14),T.vertexTangents&&a.enable(15),T.anisotropy&&a.enable(16),T.alphaHash&&a.enable(17),T.batching&&a.enable(18),T.dispersion&&a.enable(19),T.retroreflection&&a.enable(24),T.batchingColor&&a.enable(20),T.gradientMap&&a.enable(21),T.packedNormalMap&&a.enable(22),T.vertexNormals&&a.enable(23),v.push(a.mask),a.disableAll(),T.fog&&a.enable(0),T.useFog&&a.enable(1),T.flatShading&&a.enable(2),T.logarithmicDepthBuffer&&a.enable(3),T.reversedDepthBuffer&&a.enable(4),T.skinning&&a.enable(5),T.morphTargets&&a.enable(6),T.morphNormals&&a.enable(7),T.morphColors&&a.enable(8),T.premultipliedAlpha&&a.enable(9),T.shadowMapEnabled&&a.enable(10),T.doubleSided&&a.enable(11),T.flipSided&&a.enable(12),T.useDepthPacking&&a.enable(13),T.dithering&&a.enable(14),T.transmission&&a.enable(15),T.sheen&&a.enable(16),T.opaque&&a.enable(17),T.pointsUvs&&a.enable(18),T.decodeVideoTexture&&a.enable(19),T.decodeVideoTextureEmissive&&a.enable(20),T.alphaToCoverage&&a.enable(21),T.numLightProbeGrids>0&&a.enable(22),T.hasPositionAttribute&&a.enable(23),v.push(a.mask)}function w(v){let T=f[v.type],P;if(T){let C=ki[T];P=Su.clone(C.uniforms)}else P=v.uniforms;return P}function x(v,T){let P=h.get(T);return P!==void 0?++P.usedTimes:(P=new ex(n,T,v,s),c.push(P),h.set(T,P)),P}function E(v){if(--v.usedTimes===0){let T=c.indexOf(v);c[T]=c[c.length-1],c.pop(),h.delete(v.cacheKey),v.destroy()}}function S(v){o.remove(v)}function R(){o.dispose()}return{getParameters:y,getProgramCacheKey:g,getUniforms:w,acquireProgram:x,releaseProgram:E,releaseShaderCache:S,programs:c,dispose:R}}function rx(){let n=new WeakMap;function t(a){return n.has(a)}function e(a){let o=n.get(a);return o===void 0&&(o={},n.set(a,o)),o}function i(a){n.delete(a)}function s(a,o,l){n.get(a)[o]=l}function r(){n=new WeakMap}return{has:t,get:e,remove:i,update:s,dispose:r}}function ax(n,t){return n.groupOrder!==t.groupOrder?n.groupOrder-t.groupOrder:n.renderOrder!==t.renderOrder?n.renderOrder-t.renderOrder:n.material.id!==t.material.id?n.material.id-t.material.id:n.materialVariant!==t.materialVariant?n.materialVariant-t.materialVariant:n.z!==t.z?n.z-t.z:n.id-t.id}function Vu(n,t){return n.groupOrder!==t.groupOrder?n.groupOrder-t.groupOrder:n.renderOrder!==t.renderOrder?n.renderOrder-t.renderOrder:n.z!==t.z?t.z-n.z:n.id-t.id}function Wu(){let n=[],t=0,e=[],i=[],s=[];function r(){t=0,e.length=0,i.length=0,s.length=0}function a(u){let f=0;return u.isInstancedMesh&&(f+=2),u.isSkinnedMesh&&(f+=1),f}function o(u,f,m,y,g,p){let M=n[t];return M===void 0?(M={id:u.id,object:u,geometry:f,material:m,materialVariant:a(u),groupOrder:y,renderOrder:u.renderOrder,z:g,group:p},n[t]=M):(M.id=u.id,M.object=u,M.geometry=f,M.material=m,M.materialVariant=a(u),M.groupOrder=y,M.renderOrder=u.renderOrder,M.z=g,M.group=p),t++,M}function l(u,f,m,y,g,p,M){M.reversedDepth===!0&&(g=-g);let w=o(u,f,m,y,g,p);m.transmission>0?i.push(w):m.transparent===!0?s.push(w):e.push(w)}function c(u,f,m,y,g,p){let M=o(u,f,m,y,g,p);m.transmission>0?i.unshift(M):m.transparent===!0?s.unshift(M):e.unshift(M)}function h(u,f){e.length>1&&e.sort(u||ax),i.length>1&&i.sort(f||Vu),s.length>1&&s.sort(f||Vu)}function d(){for(let u=t,f=n.length;u<f;u++){let m=n[u];if(m.id===null)break;m.id=null,m.object=null,m.geometry=null,m.material=null,m.group=null}}return{opaque:e,transmissive:i,transparent:s,init:r,push:l,unshift:c,finish:d,sort:h}}function ox(){let n=new WeakMap;function t(i,s){let r=n.get(i),a;return r===void 0?(a=new Wu,n.set(i,[a])):s>=r.length?(a=new Wu,r.push(a)):a=r[s],a}function e(){n=new WeakMap}return{get:t,dispose:e}}function lx(){let n={};return{get:function(t){if(n[t.id]!==void 0)return n[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={direction:new D,color:new Rt};break;case"SpotLight":e={position:new D,direction:new D,color:new Rt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new D,color:new Rt,distance:0,decay:0};break;case"HemisphereLight":e={direction:new D,skyColor:new Rt,groundColor:new Rt};break;case"RectAreaLight":e={color:new Rt,position:new D,halfWidth:new D,halfHeight:new D};break}return n[t.id]=e,e}}}function cx(){let n={};return{get:function(t){if(n[t.id]!==void 0)return n[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new dt};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new dt};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new dt,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[t.id]=e,e}}}var hx=0;function ux(n,t){return(t.castShadow?2:0)-(n.castShadow?2:0)+(t.map?1:0)-(n.map?1:0)}function dx(n){let t=new lx,e=cx(),i={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)i.probe.push(new D);let s=new D,r=new ge,a=new ge;function o(c){let h=0,d=0,u=0;for(let I=0;I<9;I++)i.probe[I].set(0,0,0);let f=0,m=0,y=0,g=0,p=0,M=0,w=0,x=0,E=0,S=0,R=0,v=0,T=0,P=0;c.sort(ux);for(let I=0,O=c.length;I<O;I++){let L=c[I],k=L.color,V=L.intensity,W=L.distance,K=null;if(L.shadow&&L.shadow.map&&(L.shadow.map.texture.format===gn?K=L.shadow.map.texture:K=L.shadow.map.depthTexture||L.shadow.map.texture),L.isAmbientLight)h+=k.r*V,d+=k.g*V,u+=k.b*V;else if(L.isLightProbe){for(let q=0;q<9;q++)i.probe[q].addScaledVector(L.sh.coefficients[q],V);P++}else if(L.isSunLight){let q=t.get(L);if(q.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){let Q=L.shadow,it=e.get(L);it.shadowIntensity=Q.intensity,it.shadowBias=Q.bias,it.shadowNormalBias=Q.normalBias,it.shadowRadius=Q.radius,it.shadowMapSize.copy(Q.mapSize).multiply(Q.getFrameExtents()),i.sunShadow[m]=it,i.sunShadowMap[m]=K;let Dt=Q.getViewportCount();for(let At=0;At<Dt;At++)i.sunShadowMatrix[y+At]=Q.getMatrix(At),i.sunShadowCascade[y+At]=Q._cascadeData[At];y+=Dt,m++}i.sun[f]=q,f++}else if(L.isDirectionalLight){let q=t.get(L);if(q.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){let Q=L.shadow,it=e.get(L);it.shadowIntensity=Q.intensity,it.shadowBias=Q.bias,it.shadowNormalBias=Q.normalBias,it.shadowRadius=Q.radius,it.shadowMapSize=Q.mapSize,i.directionalShadow[g]=it,i.directionalShadowMap[g]=K,i.directionalShadowMatrix[g]=L.shadow.matrix,E++}i.directional[g]=q,g++}else if(L.isSpotLight){let q=t.get(L);q.position.setFromMatrixPosition(L.matrixWorld),q.color.copy(k).multiplyScalar(V),q.distance=W,q.coneCos=Math.cos(L.angle),q.penumbraCos=Math.cos(L.angle*(1-L.penumbra)),q.decay=L.decay,i.spot[M]=q;let Q=L.shadow;if(L.map&&(i.spotLightMap[v]=L.map,v++,Q.updateMatrices(L),L.castShadow&&T++),i.spotLightMatrix[M]=Q.matrix,L.castShadow){let it=e.get(L);it.shadowIntensity=Q.intensity,it.shadowBias=Q.bias,it.shadowNormalBias=Q.normalBias,it.shadowRadius=Q.radius,it.shadowMapSize=Q.mapSize,i.spotShadow[M]=it,i.spotShadowMap[M]=K,R++}M++}else if(L.isRectAreaLight){let q=t.get(L);q.color.copy(k).multiplyScalar(V),q.halfWidth.set(L.width*.5,0,0),q.halfHeight.set(0,L.height*.5,0),i.rectArea[w]=q,w++}else if(L.isPointLight){let q=t.get(L);if(q.color.copy(L.color).multiplyScalar(L.intensity),q.distance=L.distance,q.decay=L.decay,L.castShadow){let Q=L.shadow,it=e.get(L);it.shadowIntensity=Q.intensity,it.shadowBias=Q.bias,it.shadowNormalBias=Q.normalBias,it.shadowRadius=Q.radius,it.shadowMapSize=Q.mapSize,it.shadowCameraNear=Q.camera.near,it.shadowCameraFar=Q.camera.far,i.pointShadow[p]=it,i.pointShadowMap[p]=K,i.pointShadowMatrix[p]=L.shadow.matrix,S++}i.point[p]=q,p++}else if(L.isHemisphereLight){let q=t.get(L);q.skyColor.copy(L.color).multiplyScalar(V),q.groundColor.copy(L.groundColor).multiplyScalar(V),i.hemi[x]=q,x++}}w>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=_t.LTC_FLOAT_1,i.rectAreaLTC2=_t.LTC_FLOAT_2):(i.rectAreaLTC1=_t.LTC_HALF_1,i.rectAreaLTC2=_t.LTC_HALF_2)),i.ambient[0]=h,i.ambient[1]=d,i.ambient[2]=u;let C=i.hash;(C.sunLength!==f||C.directionalLength!==g||C.pointLength!==p||C.spotLength!==M||C.rectAreaLength!==w||C.hemiLength!==x||C.numSunShadows!==m||C.numDirectionalShadows!==E||C.numPointShadows!==S||C.numSpotShadows!==R||C.numSpotMaps!==v||C.numLightProbes!==P)&&(i.sun.length=f,i.directional.length=g,i.spot.length=M,i.rectArea.length=w,i.point.length=p,i.hemi.length=x,i.sunShadow.length=m,i.sunShadowMap.length=m,i.sunShadowMatrix.length=y,i.sunShadowCascade.length=y,i.directionalShadow.length=E,i.directionalShadowMap.length=E,i.directionalShadowMatrix.length=E,i.pointShadow.length=S,i.pointShadowMap.length=S,i.pointShadowMatrix.length=S,i.spotShadow.length=R,i.spotShadowMap.length=R,i.spotLightMatrix.length=R+v-T,i.spotLightMap.length=v,i.numSpotLightShadowsWithMaps=T,i.numLightProbes=P,C.sunLength=f,C.directionalLength=g,C.pointLength=p,C.spotLength=M,C.rectAreaLength=w,C.hemiLength=x,C.numSunShadows=m,C.numDirectionalShadows=E,C.numPointShadows=S,C.numSpotShadows=R,C.numSpotMaps=v,C.numLightProbes=P,i.version=hx++)}function l(c,h){let d=0,u=0,f=0,m=0,y=0,g=0,p=h.matrixWorldInverse;for(let M=0,w=c.length;M<w;M++){let x=c[M];if(x.isSunLight){let E=i.sun[d];E.direction.setFromMatrixPosition(x.matrixWorld),E.direction.transformDirection(p),d++}else if(x.isDirectionalLight){let E=i.directional[u];E.direction.setFromMatrixPosition(x.matrixWorld),s.setFromMatrixPosition(x.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(p),u++}else if(x.isSpotLight){let E=i.spot[m];E.position.setFromMatrixPosition(x.matrixWorld),E.position.applyMatrix4(p),E.direction.setFromMatrixPosition(x.matrixWorld),s.setFromMatrixPosition(x.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(p),m++}else if(x.isRectAreaLight){let E=i.rectArea[y];E.position.setFromMatrixPosition(x.matrixWorld),E.position.applyMatrix4(p),a.identity(),r.copy(x.matrixWorld),r.premultiply(p),a.extractRotation(r),E.halfWidth.set(x.width*.5,0,0),E.halfHeight.set(0,x.height*.5,0),E.halfWidth.applyMatrix4(a),E.halfHeight.applyMatrix4(a),y++}else if(x.isPointLight){let E=i.point[f];E.position.setFromMatrixPosition(x.matrixWorld),E.position.applyMatrix4(p),f++}else if(x.isHemisphereLight){let E=i.hemi[g];E.direction.setFromMatrixPosition(x.matrixWorld),E.direction.transformDirection(p),g++}}}return{setup:o,setupView:l,state:i}}function Xu(n){let t=new dx(n),e=[],i=[],s=[];function r(u){d.camera=u,e.length=0,i.length=0,s.length=0}function a(u){e.push(u)}function o(u){i.push(u)}function l(u){s.push(u)}function c(){t.setup(e)}function h(u){t.setupView(e,u)}let d={lightsArray:e,shadowsArray:i,lightProbeGridArray:s,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:d,setupLights:c,setupLightsView:h,pushLight:a,pushShadow:o,pushLightProbeGrid:l}}function fx(n){let t=new WeakMap;function e(s,r=0){let a=t.get(s),o;return a===void 0?(o=new Xu(n),t.set(s,[o])):r>=a.length?(o=new Xu(n),a.push(o)):o=a[r],o}function i(){t=new WeakMap}return{get:e,dispose:i}}var px=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,mx=`uniform sampler2D shadow_pass;
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
}`,gx=[new D(1,0,0),new D(-1,0,0),new D(0,1,0),new D(0,-1,0),new D(0,0,1),new D(0,0,-1)],xx=[new D(0,-1,0),new D(0,-1,0),new D(0,0,1),new D(0,0,-1),new D(0,-1,0),new D(0,-1,0)],qu=new ge,wr=new D,Ec=new D;function _x(n,t,e){let i=new rs,s=new dt,r=new dt,a=new Ee,o=new Ra,l=new Ca,c={},h=e.maxTextureSize,d={[dn]:Ve,[Ve]:dn,[Pe]:Pe},u=new ti({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new dt},radius:{value:4}},vertexShader:px,fragmentShader:mx}),f=u.clone();f.defines.HORIZONTAL_PASS=1;let m=new Re;m.setAttribute("position",new Je(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let y=new lt(m,u),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=pr;let p=this.type;this.render=function(S,R,v){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||S.length===0)return;this.type===Fh&&(Gt("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=pr);let T=n.getRenderTarget(),P=n.getActiveCubeFace(),C=n.getActiveMipmapLevel(),I=n.state;I.setBlending(Fi),I.buffers.depth.getReversed()===!0?I.buffers.color.setClear(0,0,0,0):I.buffers.color.setClear(1,1,1,1),I.buffers.depth.setTest(!0),I.setScissorTest(!1);let O=p!==this.type;O&&R.traverse(function(L){L.material&&(Array.isArray(L.material)?L.material.forEach(k=>k.needsUpdate=!0):L.material.needsUpdate=!0)});for(let L=0,k=S.length;L<k;L++){let V=S[L],W=V.shadow;if(W===void 0){Gt("WebGLShadowMap:",V,"has no shadow.");continue}if(W.autoUpdate===!1&&W.needsUpdate===!1)continue;s.copy(W.mapSize);let K=W.getFrameExtents();s.multiply(K),r.copy(W.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/K.x),s.x=r.x*K.x,W.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/K.y),s.y=r.y*K.y,W.mapSize.y=r.y));let q=n.state.buffers.depth.getReversed();if(W.camera._reversedDepth=q,W.map===null||O===!0){if(W.map!==null&&(W.map.depthTexture!==null&&(W.map.depthTexture.dispose(),W.map.depthTexture=null),W.map.dispose()),this.type===ds){if(V.isPointLight){Gt("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}W.map=new ii(s.x,s.y,{format:gn,type:Ai,minFilter:Ge,magFilter:Ge,generateMipmaps:!1}),W.map.texture.name=V.name+".shadowMap",W.map.depthTexture=new ln(s.x,s.y,pi),W.map.depthTexture.name=V.name+".shadowMapDepth",W.map.depthTexture.format=Li,W.map.depthTexture.compareFunction=null,W.map.depthTexture.minFilter=He,W.map.depthTexture.magFilter=He}else V.isPointLight?(W.map=new Fo(s.x),W.map.depthTexture=new ya(s.x,Ti)):(W.map=new ii(s.x,s.y),W.map.depthTexture=new ln(s.x,s.y,Ti)),W.map.depthTexture.name=V.name+".shadowMap",W.map.depthTexture.format=Li,this.type===pr?(W.map.depthTexture.compareFunction=q?Lo:Io,W.map.depthTexture.minFilter=Ge,W.map.depthTexture.magFilter=Ge):(W.map.depthTexture.compareFunction=null,W.map.depthTexture.minFilter=He,W.map.depthTexture.magFilter=He);W.camera.updateProjectionMatrix()}W.map.isWebGLCubeRenderTarget!==!0&&(W.map.width!==s.x||W.map.height!==s.y)&&W.map.setSize(s.x,s.y);let Q=W.map.isWebGLCubeRenderTarget?6:W.getViewportCount();V.isPointLight!==!0&&W.updateMatrices(V,v);for(let it=0;it<Q;it++){let Dt=W.getCamera(it);if(V.isPointLight){let At=W.camera,le=W.matrix,te=V.distance||At.far;te!==At.far&&(At.far=te,At.updateProjectionMatrix()),wr.setFromMatrixPosition(V.matrixWorld),At.position.copy(wr),Ec.copy(At.position),Ec.add(gx[it]),At.up.copy(xx[it]),At.lookAt(Ec),At.updateMatrixWorld(),le.makeTranslation(-wr.x,-wr.y,-wr.z),qu.multiplyMatrices(At.projectionMatrix,At.matrixWorldInverse),W._frustum.setFromProjectionMatrix(qu,At.coordinateSystem,At.reversedDepth)}if(W.map.isWebGLCubeRenderTarget)n.setRenderTarget(W.map,it),n.clear();else{it===0&&(n.setRenderTarget(W.map),n.clear());let At=W.getViewport(it);a.set(r.x*At.x,r.y*At.y,r.x*At.z,r.y*At.w),I.viewport(a)}i=W.getFrustum(it),x(R,v,Dt,V,this.type)}W.isPointLightShadow!==!0&&this.type===ds&&M(W,v),W.needsUpdate=!1}p=this.type,g.needsUpdate=!1,n.setRenderTarget(T,P,C)};function M(S,R){let v=t.update(y);u.defines.VSM_SAMPLES!==S.blurSamples&&(u.defines.VSM_SAMPLES=S.blurSamples,f.defines.VSM_SAMPLES=S.blurSamples,u.needsUpdate=!0,f.needsUpdate=!0),S.mapPass===null?S.mapPass=new ii(s.x,s.y,{format:gn,type:Ai}):(S.mapPass.width!==S.map.width||S.mapPass.height!==S.map.height)&&S.mapPass.setSize(S.map.width,S.map.height),u.uniforms.shadow_pass.value=S.map.depthTexture,u.uniforms.resolution.value.set(S.map.width,S.map.height),u.uniforms.radius.value=S.radius,n.setRenderTarget(S.mapPass),n.clear(),n.renderBufferDirect(R,null,v,u,y,null),f.uniforms.shadow_pass.value=S.mapPass.texture,f.uniforms.resolution.value.set(S.map.width,S.map.height),f.uniforms.radius.value=S.radius,n.setRenderTarget(S.map),n.clear(),n.renderBufferDirect(R,null,v,f,y,null)}function w(S,R,v,T){let P=null,C=v.isPointLight===!0?S.customDistanceMaterial:S.customDepthMaterial;if(C!==void 0)P=C;else if(P=v.isPointLight===!0?l:o,n.localClippingEnabled&&R.clipShadows===!0&&Array.isArray(R.clippingPlanes)&&R.clippingPlanes.length!==0||R.displacementMap&&R.displacementScale!==0||R.alphaMap&&R.alphaTest>0||R.map&&R.alphaTest>0||R.alphaToCoverage===!0){let I=P.uuid,O=R.uuid,L=c[I];L===void 0&&(L={},c[I]=L);let k=L[O];k===void 0&&(k=P.clone(),L[O]=k,R.addEventListener("dispose",E)),P=k}if(P.visible=R.visible,P.wireframe=R.wireframe,T===ds?P.side=R.shadowSide!==null?R.shadowSide:R.side:P.side=R.shadowSide!==null?R.shadowSide:d[R.side],P.alphaMap=R.alphaMap,P.alphaTest=R.alphaToCoverage===!0?.5:R.alphaTest,P.map=R.map,P.clipShadows=R.clipShadows,P.clippingPlanes=R.clippingPlanes,P.clipIntersection=R.clipIntersection,P.displacementMap=R.displacementMap,P.displacementScale=R.displacementScale,P.displacementBias=R.displacementBias,P.wireframeLinewidth=R.wireframeLinewidth,P.linewidth=R.linewidth,v.isPointLight===!0&&P.isMeshDistanceMaterial===!0){let I=n.properties.get(P);I.light=v}return P}function x(S,R,v,T,P){if(S.visible===!1)return;if(S.layers.test(R.layers)&&(S.isMesh||S.isLine||S.isPoints)&&(S.castShadow||S.receiveShadow&&P===ds)&&(!S.frustumCulled||S.intersectsFrustum(i))){S.modelViewMatrix.multiplyMatrices(v.matrixWorldInverse,S.matrixWorld);let O=t.update(S),L=S.material;if(Array.isArray(L)){let k=O.groups;for(let V=0,W=k.length;V<W;V++){let K=k[V],q=L[K.materialIndex];if(q&&q.visible){let Q=w(S,q,T,P);S.onBeforeShadow(n,S,R,v,O,Q,K),n.renderBufferDirect(v,null,O,Q,S,K),S.onAfterShadow(n,S,R,v,O,Q,K)}}}else if(L.visible){let k=w(S,L,T,P);S.onBeforeShadow(n,S,R,v,O,k,null),n.renderBufferDirect(v,null,O,k,S,null),S.onAfterShadow(n,S,R,v,O,k,null)}}let I=S.children;for(let O=0,L=I.length;O<L;O++)x(I[O],R,v,T,P)}function E(S){S.target.removeEventListener("dispose",E);for(let v in c){let T=c[v],P=S.target.uuid;P in T&&(T[P].dispose(),delete T[P])}}}function vx(n,t){function e(){let F=!1,mt=new Ee,J=null,gt=new Ee(0,0,0,0);return{setMask:function(bt){J!==bt&&!F&&(n.colorMask(bt,bt,bt,bt),J=bt)},setLocked:function(bt){F=bt},setClear:function(bt,nt,Ft,It,_e){_e===!0&&(bt*=It,nt*=It,Ft*=It),mt.set(bt,nt,Ft,It),gt.equals(mt)===!1&&(n.clearColor(bt,nt,Ft,It),gt.copy(mt))},reset:function(){F=!1,J=null,gt.set(-1,0,0,0)}}}function i(){let F=!1,mt=!1,J=null,gt=null,bt=null;return{setReversed:function(nt){if(mt!==nt){let Ft=t.get("EXT_clip_control");nt?Ft.clipControlEXT(Ft.LOWER_LEFT_EXT,Ft.ZERO_TO_ONE_EXT):Ft.clipControlEXT(Ft.LOWER_LEFT_EXT,Ft.NEGATIVE_ONE_TO_ONE_EXT),mt=nt;let It=bt;bt=null,this.setClear(It)}},getReversed:function(){return mt},setTest:function(nt){nt?tt(n.DEPTH_TEST):vt(n.DEPTH_TEST)},setMask:function(nt){J!==nt&&!F&&(n.depthMask(nt),J=nt)},setFunc:function(nt){if(mt&&(nt=xu[nt]),gt!==nt){switch(nt){case oa:n.depthFunc(n.NEVER);break;case la:n.depthFunc(n.ALWAYS);break;case ca:n.depthFunc(n.LESS);break;case ts:n.depthFunc(n.LEQUAL);break;case ha:n.depthFunc(n.EQUAL);break;case ua:n.depthFunc(n.GEQUAL);break;case da:n.depthFunc(n.GREATER);break;case fa:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}gt=nt}},setLocked:function(nt){F=nt},setClear:function(nt){bt!==nt&&(bt=nt,mt&&(nt=1-nt),n.clearDepth(nt))},reset:function(){F=!1,J=null,gt=null,bt=null,mt=!1}}}function s(){let F=!1,mt=null,J=null,gt=null,bt=null,nt=null,Ft=null,It=null,_e=null;return{setTest:function(he){F||(he?tt(n.STENCIL_TEST):vt(n.STENCIL_TEST))},setMask:function(he){mt!==he&&!F&&(n.stencilMask(he),mt=he)},setFunc:function(he,_i,Ri){(J!==he||gt!==_i||bt!==Ri)&&(n.stencilFunc(he,_i,Ri),J=he,gt=_i,bt=Ri)},setOp:function(he,_i,Ri){(nt!==he||Ft!==_i||It!==Ri)&&(n.stencilOp(he,_i,Ri),nt=he,Ft=_i,It=Ri)},setLocked:function(he){F=he},setClear:function(he){_e!==he&&(n.clearStencil(he),_e=he)},reset:function(){F=!1,mt=null,J=null,gt=null,bt=null,nt=null,Ft=null,It=null,_e=null}}}let r=new e,a=new i,o=new s,l=new WeakMap,c=new WeakMap,h={},d={},u={},f=new WeakMap,m=[],y=null,g=!1,p=null,M=null,w=null,x=null,E=null,S=null,R=null,v=new Rt(0,0,0),T=0,P=!1,C=null,I=null,O=null,L=null,k=null,V=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS),W=!1,K=0,q=n.getParameter(n.VERSION);q.indexOf("WebGL")!==-1?(K=parseFloat(/^WebGL (\d)/.exec(q)[1]),W=K>=1):q.indexOf("OpenGL ES")!==-1&&(K=parseFloat(/^OpenGL ES (\d)/.exec(q)[1]),W=K>=2);let Q=null,it={},Dt=n.getParameter(n.SCISSOR_BOX),At=n.getParameter(n.VIEWPORT),le=new Ee().fromArray(Dt),te=new Ee().fromArray(At);function re(F,mt,J,gt){let bt=new Uint8Array(4),nt=n.createTexture();n.bindTexture(F,nt),n.texParameteri(F,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(F,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let Ft=0;Ft<J;Ft++)F===n.TEXTURE_3D||F===n.TEXTURE_2D_ARRAY?n.texImage3D(mt,0,n.RGBA,1,1,gt,0,n.RGBA,n.UNSIGNED_BYTE,bt):n.texImage2D(mt+Ft,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,bt);return nt}let Z={};Z[n.TEXTURE_2D]=re(n.TEXTURE_2D,n.TEXTURE_2D,1),Z[n.TEXTURE_CUBE_MAP]=re(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),Z[n.TEXTURE_2D_ARRAY]=re(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),Z[n.TEXTURE_3D]=re(n.TEXTURE_3D,n.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),tt(n.DEPTH_TEST),a.setFunc(ts),at(!1),ut(ql),tt(n.CULL_FACE),st(Fi);function tt(F){h[F]!==!0&&(n.enable(F),h[F]=!0)}function vt(F){h[F]!==!1&&(n.disable(F),h[F]=!1)}function Vt(F,mt){return u[F]!==mt?(n.bindFramebuffer(F,mt),u[F]=mt,F===n.DRAW_FRAMEBUFFER&&(u[n.FRAMEBUFFER]=mt),F===n.FRAMEBUFFER&&(u[n.DRAW_FRAMEBUFFER]=mt),!0):!1}function St(F,mt){let J=m,gt=!1;if(F){J=f.get(mt),J===void 0&&(J=[],f.set(mt,J));let bt=F.textures;if(J.length!==bt.length||J[0]!==n.COLOR_ATTACHMENT0){for(let nt=0,Ft=bt.length;nt<Ft;nt++)J[nt]=n.COLOR_ATTACHMENT0+nt;J.length=bt.length,gt=!0}}else J[0]!==n.BACK&&(J[0]=n.BACK,gt=!0);gt&&n.drawBuffers(J)}function Xt(F){return y!==F?(n.useProgram(F),y=F,!0):!1}let pe={[In]:n.FUNC_ADD,[kh]:n.FUNC_SUBTRACT,[Bh]:n.FUNC_REVERSE_SUBTRACT};pe[zh]=n.MIN,pe[Hh]=n.MAX;let et={[Gh]:n.ZERO,[Vh]:n.ONE,[Wh]:n.SRC_COLOR,[Jl]:n.SRC_ALPHA,[Jh]:n.SRC_ALPHA_SATURATE,[Yh]:n.DST_COLOR,[qh]:n.DST_ALPHA,[Xh]:n.ONE_MINUS_SRC_COLOR,[Kl]:n.ONE_MINUS_SRC_ALPHA,[Zh]:n.ONE_MINUS_DST_COLOR,[$h]:n.ONE_MINUS_DST_ALPHA,[Kh]:n.CONSTANT_COLOR,[jh]:n.ONE_MINUS_CONSTANT_COLOR,[Qh]:n.CONSTANT_ALPHA,[tu]:n.ONE_MINUS_CONSTANT_ALPHA};function st(F,mt,J,gt,bt,nt,Ft,It,_e,he){if(F===Fi){g===!0&&(vt(n.BLEND),g=!1);return}if(g===!1&&(tt(n.BLEND),g=!0),F!==Oh){if(F!==p||he!==P){if((M!==In||E!==In)&&(n.blendEquation(n.FUNC_ADD),M=In,E=In),he)switch(F){case fs:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case $l:n.blendFunc(n.ONE,n.ONE);break;case Yl:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case Zl:n.blendFuncSeparate(n.DST_COLOR,n.ONE_MINUS_SRC_ALPHA,n.ZERO,n.ONE);break;default:Wt("WebGLState: Invalid blending: ",F);break}else switch(F){case fs:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case $l:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE,n.ONE,n.ONE);break;case Yl:Wt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Zl:Wt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Wt("WebGLState: Invalid blending: ",F);break}w=null,x=null,S=null,R=null,v.set(0,0,0),T=0,p=F,P=he}return}bt=bt||mt,nt=nt||J,Ft=Ft||gt,(mt!==M||bt!==E)&&(n.blendEquationSeparate(pe[mt],pe[bt]),M=mt,E=bt),(J!==w||gt!==x||nt!==S||Ft!==R)&&(n.blendFuncSeparate(et[J],et[gt],et[nt],et[Ft]),w=J,x=gt,S=nt,R=Ft),(It.equals(v)===!1||_e!==T)&&(n.blendColor(It.r,It.g,It.b,_e),v.copy(It),T=_e),p=F,P=!1}function rt(F,mt){F.side===Pe?vt(n.CULL_FACE):tt(n.CULL_FACE);let J=F.side===Ve;mt&&(J=!J),at(J),F.blending===fs&&F.transparent===!1?st(Fi):st(F.blending,F.blendEquation,F.blendSrc,F.blendDst,F.blendEquationAlpha,F.blendSrcAlpha,F.blendDstAlpha,F.blendColor,F.blendAlpha,F.premultipliedAlpha),a.setFunc(F.depthFunc),a.setTest(F.depthTest),a.setMask(F.depthWrite),r.setMask(F.colorWrite);let gt=F.stencilWrite;o.setTest(gt),gt&&(o.setMask(F.stencilWriteMask),o.setFunc(F.stencilFunc,F.stencilRef,F.stencilFuncMask),o.setOp(F.stencilFail,F.stencilZFail,F.stencilZPass)),Ot(F.polygonOffset,F.polygonOffsetFactor,F.polygonOffsetUnits),F.alphaToCoverage===!0?tt(n.SAMPLE_ALPHA_TO_COVERAGE):vt(n.SAMPLE_ALPHA_TO_COVERAGE)}function at(F){C!==F&&(F?n.frontFace(n.CW):n.frontFace(n.CCW),C=F)}function ut(F){F!==Nh?(tt(n.CULL_FACE),F!==I&&(F===ql?n.cullFace(n.BACK):F===Uh?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):vt(n.CULL_FACE),I=F}function Bt(F){F!==O&&(W&&n.lineWidth(F),O=F)}function Ot(F,mt,J){F?(tt(n.POLYGON_OFFSET_FILL),(L!==mt||k!==J)&&(L=mt,k=J,a.getReversed()&&(mt=-mt),n.polygonOffset(mt,J))):vt(n.POLYGON_OFFSET_FILL)}function qt(F){F?tt(n.SCISSOR_TEST):vt(n.SCISSOR_TEST)}function Yt(F){F===void 0&&(F=n.TEXTURE0+V-1),Q!==F&&(n.activeTexture(F),Q=F)}function N(F,mt,J){J===void 0&&(Q===null?J=n.TEXTURE0+V-1:J=Q);let gt=it[J];gt===void 0&&(gt={type:void 0,texture:void 0},it[J]=gt),(gt.type!==F||gt.texture!==mt)&&(Q!==J&&(n.activeTexture(J),Q=J),n.bindTexture(F,mt||Z[F]),gt.type=F,gt.texture=mt)}function ce(){let F=it[Q];F!==void 0&&F.type!==void 0&&(n.bindTexture(F.type,null),F.type=void 0,F.texture=void 0)}function ee(){try{n.compressedTexImage2D(...arguments)}catch(F){Wt("WebGLState:",F)}}function A(){try{n.compressedTexImage3D(...arguments)}catch(F){Wt("WebGLState:",F)}}function _(){try{n.texSubImage2D(...arguments)}catch(F){Wt("WebGLState:",F)}}function B(){try{n.texSubImage3D(...arguments)}catch(F){Wt("WebGLState:",F)}}function G(){try{n.compressedTexSubImage2D(...arguments)}catch(F){Wt("WebGLState:",F)}}function $(){try{n.compressedTexSubImage3D(...arguments)}catch(F){Wt("WebGLState:",F)}}function ot(){try{n.texStorage2D(...arguments)}catch(F){Wt("WebGLState:",F)}}function ht(){try{n.texStorage3D(...arguments)}catch(F){Wt("WebGLState:",F)}}function Y(){try{n.texImage2D(...arguments)}catch(F){Wt("WebGLState:",F)}}function j(){try{n.texImage3D(...arguments)}catch(F){Wt("WebGLState:",F)}}function ft(F){return d[F]!==void 0?d[F]:n.getParameter(F)}function Nt(F,mt){d[F]!==mt&&(n.pixelStorei(F,mt),d[F]=mt)}function xt(F){le.equals(F)===!1&&(n.scissor(F.x,F.y,F.z,F.w),le.copy(F))}function pt(F){te.equals(F)===!1&&(n.viewport(F.x,F.y,F.z,F.w),te.copy(F))}function Ut(F,mt){let J=c.get(mt);J===void 0&&(J=new WeakMap,c.set(mt,J));let gt=J.get(F);gt===void 0&&(gt=n.getUniformBlockIndex(mt,F.name),J.set(F,gt))}function zt(F,mt){let gt=c.get(mt).get(F);l.get(mt)!==gt&&(n.uniformBlockBinding(mt,gt,F.__bindingPointIndex),l.set(mt,gt))}function Zt(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),a.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),n.pixelStorei(n.PACK_ALIGNMENT,4),n.pixelStorei(n.UNPACK_ALIGNMENT,4),n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,!1),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,n.BROWSER_DEFAULT_WEBGL),n.pixelStorei(n.PACK_ROW_LENGTH,0),n.pixelStorei(n.PACK_SKIP_PIXELS,0),n.pixelStorei(n.PACK_SKIP_ROWS,0),n.pixelStorei(n.UNPACK_ROW_LENGTH,0),n.pixelStorei(n.UNPACK_IMAGE_HEIGHT,0),n.pixelStorei(n.UNPACK_SKIP_PIXELS,0),n.pixelStorei(n.UNPACK_SKIP_ROWS,0),n.pixelStorei(n.UNPACK_SKIP_IMAGES,0),h={},d={},Q=null,it={},u={},f=new WeakMap,m=[],y=null,g=!1,p=null,M=null,w=null,x=null,E=null,S=null,R=null,v=new Rt(0,0,0),T=0,P=!1,C=null,I=null,O=null,L=null,k=null,le.set(0,0,n.canvas.width,n.canvas.height),te.set(0,0,n.canvas.width,n.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:tt,disable:vt,bindFramebuffer:Vt,drawBuffers:St,useProgram:Xt,setBlending:st,setMaterial:rt,setFlipSided:at,setCullFace:ut,setLineWidth:Bt,setPolygonOffset:Ot,setScissorTest:qt,activeTexture:Yt,bindTexture:N,unbindTexture:ce,compressedTexImage2D:ee,compressedTexImage3D:A,texImage2D:Y,texImage3D:j,pixelStorei:Nt,getParameter:ft,updateUBOMapping:Ut,uniformBlockBinding:zt,texStorage2D:ot,texStorage3D:ht,texSubImage2D:_,texSubImage3D:B,compressedTexSubImage2D:G,compressedTexSubImage3D:$,scissor:xt,viewport:pt,reset:Zt}}function yx(n,t,e,i,s,r,a){let o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new dt,h=new WeakMap,d=new Set,u,f=new WeakMap,m=!1;try{m=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function y(A,_){return m?new OffscreenCanvas(A,_):zs("canvas")}function g(A,_,B){let G=1,$=ee(A);if(($.width>B||$.height>B)&&(G=B/Math.max($.width,$.height)),G<1)if(typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&A instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&A instanceof ImageBitmap||typeof VideoFrame<"u"&&A instanceof VideoFrame){let ot=Math.floor(G*$.width),ht=Math.floor(G*$.height);u===void 0&&(u=y(ot,ht));let Y=_?y(ot,ht):u;return Y.width=ot,Y.height=ht,Y.getContext("2d").drawImage(A,0,0,ot,ht),Gt("WebGLRenderer: Texture has been resized from ("+$.width+"x"+$.height+") to ("+ot+"x"+ht+")."),Y}else return"data"in A&&Gt("WebGLRenderer: Image in DataTexture is too big ("+$.width+"x"+$.height+")."),A;return A}function p(A){return A.generateMipmaps}function M(A){n.generateMipmap(A)}function w(A){return A.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:A.isWebGL3DRenderTarget?n.TEXTURE_3D:A.isWebGLArrayRenderTarget||A.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function x(A,_,B,G,$,ot=!1){if(A!==null){if(n[A]!==void 0)return n[A];Gt("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+A+"'")}let ht;G&&(ht=t.get("EXT_texture_norm16"),ht||Gt("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let Y=_;if(_===n.RED&&(B===n.FLOAT&&(Y=n.R32F),B===n.HALF_FLOAT&&(Y=n.R16F),B===n.UNSIGNED_BYTE&&(Y=n.R8),B===n.UNSIGNED_SHORT&&ht&&(Y=ht.R16_EXT),B===n.SHORT&&ht&&(Y=ht.R16_SNORM_EXT)),_===n.RED_INTEGER&&(B===n.UNSIGNED_BYTE&&(Y=n.R8UI),B===n.UNSIGNED_SHORT&&(Y=n.R16UI),B===n.UNSIGNED_INT&&(Y=n.R32UI),B===n.BYTE&&(Y=n.R8I),B===n.SHORT&&(Y=n.R16I),B===n.INT&&(Y=n.R32I)),_===n.RG&&(B===n.FLOAT&&(Y=n.RG32F),B===n.HALF_FLOAT&&(Y=n.RG16F),B===n.UNSIGNED_BYTE&&(Y=n.RG8),B===n.UNSIGNED_SHORT&&ht&&(Y=ht.RG16_EXT),B===n.SHORT&&ht&&(Y=ht.RG16_SNORM_EXT)),_===n.RG_INTEGER&&(B===n.UNSIGNED_BYTE&&(Y=n.RG8UI),B===n.UNSIGNED_SHORT&&(Y=n.RG16UI),B===n.UNSIGNED_INT&&(Y=n.RG32UI),B===n.BYTE&&(Y=n.RG8I),B===n.SHORT&&(Y=n.RG16I),B===n.INT&&(Y=n.RG32I)),_===n.RGB_INTEGER&&(B===n.UNSIGNED_BYTE&&(Y=n.RGB8UI),B===n.UNSIGNED_SHORT&&(Y=n.RGB16UI),B===n.UNSIGNED_INT&&(Y=n.RGB32UI),B===n.BYTE&&(Y=n.RGB8I),B===n.SHORT&&(Y=n.RGB16I),B===n.INT&&(Y=n.RGB32I)),_===n.RGBA_INTEGER&&(B===n.UNSIGNED_BYTE&&(Y=n.RGBA8UI),B===n.UNSIGNED_SHORT&&(Y=n.RGBA16UI),B===n.UNSIGNED_INT&&(Y=n.RGBA32UI),B===n.BYTE&&(Y=n.RGBA8I),B===n.SHORT&&(Y=n.RGBA16I),B===n.INT&&(Y=n.RGBA32I)),_===n.RGB&&(B===n.UNSIGNED_SHORT&&ht&&(Y=ht.RGB16_EXT),B===n.SHORT&&ht&&(Y=ht.RGB16_SNORM_EXT),B===n.UNSIGNED_INT_5_9_9_9_REV&&(Y=n.RGB9_E5),B===n.UNSIGNED_INT_10F_11F_11F_REV&&(Y=n.R11F_G11F_B10F)),_===n.RGBA){let j=ot?Bs:ne.getTransfer($);B===n.FLOAT&&(Y=n.RGBA32F),B===n.HALF_FLOAT&&(Y=n.RGBA16F),B===n.UNSIGNED_BYTE&&(Y=j===de?n.SRGB8_ALPHA8:n.RGBA8),B===n.UNSIGNED_SHORT&&ht&&(Y=ht.RGBA16_EXT),B===n.SHORT&&ht&&(Y=ht.RGBA16_SNORM_EXT),B===n.UNSIGNED_SHORT_4_4_4_4&&(Y=n.RGBA4),B===n.UNSIGNED_SHORT_5_5_5_1&&(Y=n.RGB5_A1)}return(Y===n.R16F||Y===n.R32F||Y===n.RG16F||Y===n.RG32F||Y===n.RGBA16F||Y===n.RGBA32F)&&t.get("EXT_color_buffer_float"),Y}function E(A,_){let B;return A?_===null||_===Ti||_===ms?B=n.DEPTH24_STENCIL8:_===pi?B=n.DEPTH32F_STENCIL8:_===ps&&(B=n.DEPTH24_STENCIL8,Gt("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):_===null||_===Ti||_===ms?B=n.DEPTH_COMPONENT24:_===pi?B=n.DEPTH_COMPONENT32F:_===ps&&(B=n.DEPTH_COMPONENT16),B}function S(A,_){return p(A)===!0||A.isFramebufferTexture&&A.minFilter!==He&&A.minFilter!==Ge?Math.log2(Math.max(_.width,_.height))+1:A.mipmaps!==void 0&&A.mipmaps.length>0?A.mipmaps.length:A.isCompressedTexture&&Array.isArray(A.image)?_.mipmaps.length:1}function R(A){let _=A.target;_.removeEventListener("dispose",R),T(_),_.isVideoTexture&&h.delete(_),_.isHTMLTexture&&d.delete(_)}function v(A){let _=A.target;_.removeEventListener("dispose",v),C(_)}function T(A){let _=i.get(A);if(_.__webglInit===void 0)return;let B=A.source,G=f.get(B);if(G){let $=G[_.__cacheKey];$.usedTimes--,$.usedTimes===0&&P(A),Object.keys(G).length===0&&f.delete(B)}i.remove(A)}function P(A){let _=i.get(A);n.deleteTexture(_.__webglTexture);let B=A.source,G=f.get(B);delete G[_.__cacheKey],a.memory.textures--}function C(A){let _=i.get(A);if(A.depthTexture&&(A.depthTexture.dispose(),i.remove(A.depthTexture)),A.isWebGLCubeRenderTarget)for(let G=0;G<6;G++){if(Array.isArray(_.__webglFramebuffer[G]))for(let $=0;$<_.__webglFramebuffer[G].length;$++)n.deleteFramebuffer(_.__webglFramebuffer[G][$]);else n.deleteFramebuffer(_.__webglFramebuffer[G]);_.__webglDepthbuffer&&n.deleteRenderbuffer(_.__webglDepthbuffer[G])}else{if(Array.isArray(_.__webglFramebuffer))for(let G=0;G<_.__webglFramebuffer.length;G++)n.deleteFramebuffer(_.__webglFramebuffer[G]);else n.deleteFramebuffer(_.__webglFramebuffer);if(_.__webglDepthbuffer&&n.deleteRenderbuffer(_.__webglDepthbuffer),_.__webglMultisampledFramebuffer&&n.deleteFramebuffer(_.__webglMultisampledFramebuffer),_.__webglColorRenderbuffer)for(let G=0;G<_.__webglColorRenderbuffer.length;G++)_.__webglColorRenderbuffer[G]&&n.deleteRenderbuffer(_.__webglColorRenderbuffer[G]);_.__webglDepthRenderbuffer&&n.deleteRenderbuffer(_.__webglDepthRenderbuffer)}let B=A.textures;for(let G=0,$=B.length;G<$;G++){let ot=i.get(B[G]);ot.__webglTexture&&(n.deleteTexture(ot.__webglTexture),a.memory.textures--),i.remove(B[G])}i.remove(A)}let I=0;function O(){I=0}function L(){return I}function k(A){I=A}function V(){let A=I;return A>=s.maxTextures&&Gt("WebGLTextures: Trying to use "+(A+1)+" texture units while this GPU supports only "+s.maxTextures),I+=1,A}function W(A){let _=[];return _.push(A.wrapS),_.push(A.wrapT),_.push(A.wrapR||0),_.push(A.magFilter),_.push(A.minFilter),_.push(A.anisotropy),_.push(A.internalFormat),_.push(A.format),_.push(A.type),_.push(A.generateMipmaps),_.push(A.premultiplyAlpha),_.push(A.flipY),_.push(A.unpackAlignment),_.push(A.colorSpace),_.join()}function K(A,_){let B=i.get(A);if(A.isVideoTexture&&N(A),A.isRenderTargetTexture===!1&&A.isExternalTexture!==!0&&A.version>0&&B.__version!==A.version){let G=A.image;if(G===null)Gt("WebGLRenderer: Texture marked for update but no image data found.");else if(G.complete===!1)Gt("WebGLRenderer: Texture marked for update but image is incomplete");else{vt(B,A,_);return}}else A.isExternalTexture&&(B.__webglTexture=A.sourceTexture?A.sourceTexture:null);e.bindTexture(n.TEXTURE_2D,B.__webglTexture,n.TEXTURE0+_)}function q(A,_){let B=i.get(A);if(A.isRenderTargetTexture===!1&&A.version>0&&B.__version!==A.version){vt(B,A,_);return}else A.isExternalTexture&&(B.__webglTexture=A.sourceTexture?A.sourceTexture:null);e.bindTexture(n.TEXTURE_2D_ARRAY,B.__webglTexture,n.TEXTURE0+_)}function Q(A,_){let B=i.get(A);if(A.isRenderTargetTexture===!1&&A.version>0&&B.__version!==A.version){vt(B,A,_);return}e.bindTexture(n.TEXTURE_3D,B.__webglTexture,n.TEXTURE0+_)}function it(A,_){let B=i.get(A);if(A.isCubeDepthTexture!==!0&&A.version>0&&B.__version!==A.version){Vt(B,A,_);return}e.bindTexture(n.TEXTURE_CUBE_MAP,B.__webglTexture,n.TEXTURE0+_)}let Dt={[an]:n.REPEAT,[Ii]:n.CLAMP_TO_EDGE,[pa]:n.MIRRORED_REPEAT},At={[He]:n.NEAREST,[nu]:n.NEAREST_MIPMAP_NEAREST,[xr]:n.NEAREST_MIPMAP_LINEAR,[Ge]:n.LINEAR,[Xa]:n.LINEAR_MIPMAP_NEAREST,[pn]:n.LINEAR_MIPMAP_LINEAR},le={[ou]:n.NEVER,[du]:n.ALWAYS,[lu]:n.LESS,[Io]:n.LEQUAL,[cu]:n.EQUAL,[Lo]:n.GEQUAL,[hu]:n.GREATER,[uu]:n.NOTEQUAL};function te(A,_){if(_.type===pi&&t.has("OES_texture_float_linear")===!1&&(_.magFilter===Ge||_.magFilter===Xa||_.magFilter===xr||_.magFilter===pn||_.minFilter===Ge||_.minFilter===Xa||_.minFilter===xr||_.minFilter===pn)&&Gt("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(A,n.TEXTURE_WRAP_S,Dt[_.wrapS]),n.texParameteri(A,n.TEXTURE_WRAP_T,Dt[_.wrapT]),(A===n.TEXTURE_3D||A===n.TEXTURE_2D_ARRAY)&&n.texParameteri(A,n.TEXTURE_WRAP_R,Dt[_.wrapR]),n.texParameteri(A,n.TEXTURE_MAG_FILTER,At[_.magFilter]),n.texParameteri(A,n.TEXTURE_MIN_FILTER,At[_.minFilter]),_.compareFunction&&(n.texParameteri(A,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(A,n.TEXTURE_COMPARE_FUNC,le[_.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(_.magFilter===He||_.minFilter!==xr&&_.minFilter!==pn||_.type===pi&&t.has("OES_texture_float_linear")===!1)return;if(_.anisotropy>1||i.get(_).__currentAnisotropy){let B=t.get("EXT_texture_filter_anisotropic");n.texParameterf(A,B.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(_.anisotropy,s.getMaxAnisotropy())),i.get(_).__currentAnisotropy=_.anisotropy}}}function re(A,_){let B=!1;A.__webglInit===void 0&&(A.__webglInit=!0,_.addEventListener("dispose",R));let G=_.source,$=f.get(G);$===void 0&&($={},f.set(G,$));let ot=W(_);if(ot!==A.__cacheKey){$[ot]===void 0&&($[ot]={texture:n.createTexture(),usedTimes:0},a.memory.textures++,B=!0),$[ot].usedTimes++;let ht=$[A.__cacheKey];ht!==void 0&&($[A.__cacheKey].usedTimes--,ht.usedTimes===0&&P(_)),A.__cacheKey=ot,A.__webglTexture=$[ot].texture}return B}function Z(A,_,B){return Math.floor(Math.floor(A/B)/_)}function tt(A,_,B,G){let ot=A.updateRanges;if(ot.length===0)e.texSubImage2D(n.TEXTURE_2D,0,0,0,_.width,_.height,B,G,_.data);else{ot.sort((Nt,xt)=>Nt.start-xt.start);let ht=0;for(let Nt=1;Nt<ot.length;Nt++){let xt=ot[ht],pt=ot[Nt],Ut=xt.start+xt.count,zt=Z(pt.start,_.width,4),Zt=Z(xt.start,_.width,4);pt.start<=Ut+1&&zt===Zt&&Z(pt.start+pt.count-1,_.width,4)===zt?xt.count=Math.max(xt.count,pt.start+pt.count-xt.start):(++ht,ot[ht]=pt)}ot.length=ht+1;let Y=e.getParameter(n.UNPACK_ROW_LENGTH),j=e.getParameter(n.UNPACK_SKIP_PIXELS),ft=e.getParameter(n.UNPACK_SKIP_ROWS);e.pixelStorei(n.UNPACK_ROW_LENGTH,_.width);for(let Nt=0,xt=ot.length;Nt<xt;Nt++){let pt=ot[Nt],Ut=Math.floor(pt.start/4),zt=Math.ceil(pt.count/4),Zt=Ut%_.width,F=Math.floor(Ut/_.width),mt=zt,J=1;e.pixelStorei(n.UNPACK_SKIP_PIXELS,Zt),e.pixelStorei(n.UNPACK_SKIP_ROWS,F),e.texSubImage2D(n.TEXTURE_2D,0,Zt,F,mt,J,B,G,_.data)}A.clearUpdateRanges(),e.pixelStorei(n.UNPACK_ROW_LENGTH,Y),e.pixelStorei(n.UNPACK_SKIP_PIXELS,j),e.pixelStorei(n.UNPACK_SKIP_ROWS,ft)}}function vt(A,_,B){let G=n.TEXTURE_2D;(_.isDataArrayTexture||_.isCompressedArrayTexture)&&(G=n.TEXTURE_2D_ARRAY),_.isData3DTexture&&(G=n.TEXTURE_3D);let $=re(A,_),ot=_.source;e.bindTexture(G,A.__webglTexture,n.TEXTURE0+B);let ht=i.get(ot);if(ot.version!==ht.__version||$===!0){if(e.activeTexture(n.TEXTURE0+B),(typeof ImageBitmap<"u"&&_.image instanceof ImageBitmap)===!1){let J=ne.getPrimaries(ne.workingColorSpace),gt=_.colorSpace===Yi?null:ne.getPrimaries(_.colorSpace),bt=_.colorSpace===Yi||J===gt?n.NONE:n.BROWSER_DEFAULT_WEBGL;e.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,_.flipY),e.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),e.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,bt)}e.pixelStorei(n.UNPACK_ALIGNMENT,_.unpackAlignment);let j=g(_.image,!1,s.maxTextureSize);j=ce(_,j);let ft=r.convert(_.format,_.colorSpace),Nt=r.convert(_.type),xt=x(_.internalFormat,ft,Nt,_.normalized,_.colorSpace,_.isVideoTexture);te(G,_);let pt,Ut=_.mipmaps,zt=_.isVideoTexture!==!0,Zt=ht.__version===void 0||$===!0,F=ot.dataReady,mt=S(_,j);if(_.isDepthTexture)xt=E(_.format===mn,_.type),Zt&&(zt?e.texStorage2D(n.TEXTURE_2D,1,xt,j.width,j.height):e.texImage2D(n.TEXTURE_2D,0,xt,j.width,j.height,0,ft,Nt,null));else if(_.isDataTexture)if(Ut.length>0){zt&&Zt&&e.texStorage2D(n.TEXTURE_2D,mt,xt,Ut[0].width,Ut[0].height);for(let J=0,gt=Ut.length;J<gt;J++)pt=Ut[J],zt?F&&e.texSubImage2D(n.TEXTURE_2D,J,0,0,pt.width,pt.height,ft,Nt,pt.data):e.texImage2D(n.TEXTURE_2D,J,xt,pt.width,pt.height,0,ft,Nt,pt.data);_.generateMipmaps=!1}else zt?(Zt&&e.texStorage2D(n.TEXTURE_2D,mt,xt,j.width,j.height),F&&tt(_,j,ft,Nt)):e.texImage2D(n.TEXTURE_2D,0,xt,j.width,j.height,0,ft,Nt,j.data);else if(_.isCompressedTexture)if(_.isCompressedArrayTexture){zt&&Zt&&e.texStorage3D(n.TEXTURE_2D_ARRAY,mt,xt,Ut[0].width,Ut[0].height,j.depth);for(let J=0,gt=Ut.length;J<gt;J++)if(pt=Ut[J],_.format!==mi)if(ft!==null)if(zt){if(F)if(_.layerUpdates.size>0){let bt=_c(pt.width,pt.height,_.format,_.type);for(let nt of _.layerUpdates){let Ft=pt.data.subarray(nt*bt/pt.data.BYTES_PER_ELEMENT,(nt+1)*bt/pt.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,J,0,0,nt,pt.width,pt.height,1,ft,Ft)}}else e.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,J,0,0,0,pt.width,pt.height,j.depth,ft,pt.data)}else e.compressedTexImage3D(n.TEXTURE_2D_ARRAY,J,xt,pt.width,pt.height,j.depth,0,pt.data,0,0);else Gt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else zt?F&&e.texSubImage3D(n.TEXTURE_2D_ARRAY,J,0,0,0,pt.width,pt.height,j.depth,ft,Nt,pt.data):e.texImage3D(n.TEXTURE_2D_ARRAY,J,xt,pt.width,pt.height,j.depth,0,ft,Nt,pt.data);_.layerUpdates.size>0&&_.clearLayerUpdates()}else{zt&&Zt&&e.texStorage2D(n.TEXTURE_2D,mt,xt,Ut[0].width,Ut[0].height);for(let J=0,gt=Ut.length;J<gt;J++)pt=Ut[J],_.format!==mi?ft!==null?zt?F&&e.compressedTexSubImage2D(n.TEXTURE_2D,J,0,0,pt.width,pt.height,ft,pt.data):e.compressedTexImage2D(n.TEXTURE_2D,J,xt,pt.width,pt.height,0,pt.data):Gt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):zt?F&&e.texSubImage2D(n.TEXTURE_2D,J,0,0,pt.width,pt.height,ft,Nt,pt.data):e.texImage2D(n.TEXTURE_2D,J,xt,pt.width,pt.height,0,ft,Nt,pt.data)}else if(_.isDataArrayTexture)if(zt){if(Zt&&e.texStorage3D(n.TEXTURE_2D_ARRAY,mt,xt,j.width,j.height,j.depth),F)if(_.layerUpdates.size>0){let J=_c(j.width,j.height,_.format,_.type);for(let gt of _.layerUpdates){let bt=j.data.subarray(gt*J/j.data.BYTES_PER_ELEMENT,(gt+1)*J/j.data.BYTES_PER_ELEMENT);e.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,gt,j.width,j.height,1,ft,Nt,bt)}_.clearLayerUpdates()}else e.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,j.width,j.height,j.depth,ft,Nt,j.data)}else e.texImage3D(n.TEXTURE_2D_ARRAY,0,xt,j.width,j.height,j.depth,0,ft,Nt,j.data);else if(_.isData3DTexture)zt?(Zt&&e.texStorage3D(n.TEXTURE_3D,mt,xt,j.width,j.height,j.depth),F&&e.texSubImage3D(n.TEXTURE_3D,0,0,0,0,j.width,j.height,j.depth,ft,Nt,j.data)):e.texImage3D(n.TEXTURE_3D,0,xt,j.width,j.height,j.depth,0,ft,Nt,j.data);else if(_.isFramebufferTexture){if(Zt)if(zt)e.texStorage2D(n.TEXTURE_2D,mt,xt,j.width,j.height);else{let J=j.width,gt=j.height;for(let bt=0;bt<mt;bt++)e.texImage2D(n.TEXTURE_2D,bt,xt,J,gt,0,ft,Nt,null),J>>=1,gt>>=1}}else if(_.isHTMLTexture){if("texElementImage2D"in n){let J=n.canvas;if(J.hasAttribute("layoutsubtree")||J.setAttribute("layoutsubtree","true"),j.parentNode!==J){J.appendChild(j),d.add(_),J.onpaint=gt=>{let bt=gt.changedElements;for(let nt of d)bt.includes(nt.image)&&(nt.needsUpdate=!0)},J.requestPaint();return}if(n.texElementImage2D.length===3)n.texElementImage2D(n.TEXTURE_2D,n.RGBA8,j);else{let bt=n.RGBA,nt=n.RGBA,Ft=n.UNSIGNED_BYTE;n.texElementImage2D(n.TEXTURE_2D,0,bt,nt,Ft,j)}n.texParameteri(n.TEXTURE_2D,n.TEXTURE_MIN_FILTER,n.LINEAR),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_S,n.CLAMP_TO_EDGE),n.texParameteri(n.TEXTURE_2D,n.TEXTURE_WRAP_T,n.CLAMP_TO_EDGE)}}else if(Ut.length>0){if(zt&&Zt){let J=ee(Ut[0]);e.texStorage2D(n.TEXTURE_2D,mt,xt,J.width,J.height)}for(let J=0,gt=Ut.length;J<gt;J++)pt=Ut[J],zt?F&&e.texSubImage2D(n.TEXTURE_2D,J,0,0,ft,Nt,pt):e.texImage2D(n.TEXTURE_2D,J,xt,ft,Nt,pt);_.generateMipmaps=!1}else if(zt){if(Zt){let J=ee(j);e.texStorage2D(n.TEXTURE_2D,mt,xt,J.width,J.height)}F&&e.texSubImage2D(n.TEXTURE_2D,0,0,0,ft,Nt,j)}else e.texImage2D(n.TEXTURE_2D,0,xt,ft,Nt,j);p(_)&&M(G),ht.__version=ot.version,_.onUpdate&&_.onUpdate(_)}A.__version=_.version}function Vt(A,_,B){if(_.image.length!==6)return;let G=re(A,_),$=_.source;e.bindTexture(n.TEXTURE_CUBE_MAP,A.__webglTexture,n.TEXTURE0+B);let ot=i.get($);if($.version!==ot.__version||G===!0){e.activeTexture(n.TEXTURE0+B);let ht=ne.getPrimaries(ne.workingColorSpace),Y=_.colorSpace===Yi?null:ne.getPrimaries(_.colorSpace),j=_.colorSpace===Yi||ht===Y?n.NONE:n.BROWSER_DEFAULT_WEBGL;e.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,_.flipY),e.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),e.pixelStorei(n.UNPACK_ALIGNMENT,_.unpackAlignment),e.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,j);let ft=_.isCompressedTexture||_.image[0].isCompressedTexture,Nt=_.image[0]&&_.image[0].isDataTexture,xt=[];for(let nt=0;nt<6;nt++)!ft&&!Nt?xt[nt]=g(_.image[nt],!0,s.maxCubemapSize):xt[nt]=Nt?_.image[nt].image:_.image[nt],xt[nt]=ce(_,xt[nt]);let pt=xt[0],Ut=r.convert(_.format,_.colorSpace),zt=r.convert(_.type),Zt=x(_.internalFormat,Ut,zt,_.normalized,_.colorSpace),F=_.isVideoTexture!==!0,mt=ot.__version===void 0||G===!0,J=$.dataReady,gt=S(_,pt);te(n.TEXTURE_CUBE_MAP,_);let bt;if(ft){F&&mt&&e.texStorage2D(n.TEXTURE_CUBE_MAP,gt,Zt,pt.width,pt.height);for(let nt=0;nt<6;nt++){bt=xt[nt].mipmaps;for(let Ft=0;Ft<bt.length;Ft++){let It=bt[Ft];_.format!==mi?Ut!==null?F?J&&e.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+nt,Ft,0,0,It.width,It.height,Ut,It.data):e.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+nt,Ft,Zt,It.width,It.height,0,It.data):Gt("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):F?J&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+nt,Ft,0,0,It.width,It.height,Ut,zt,It.data):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+nt,Ft,Zt,It.width,It.height,0,Ut,zt,It.data)}}}else{if(bt=_.mipmaps,F&&mt){bt.length>0&&gt++;let nt=ee(xt[0]);e.texStorage2D(n.TEXTURE_CUBE_MAP,gt,Zt,nt.width,nt.height)}for(let nt=0;nt<6;nt++)if(Nt){F?J&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+nt,0,0,0,xt[nt].width,xt[nt].height,Ut,zt,xt[nt].data):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+nt,0,Zt,xt[nt].width,xt[nt].height,0,Ut,zt,xt[nt].data);for(let Ft=0;Ft<bt.length;Ft++){let _e=bt[Ft].image[nt].image;F?J&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+nt,Ft+1,0,0,_e.width,_e.height,Ut,zt,_e.data):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+nt,Ft+1,Zt,_e.width,_e.height,0,Ut,zt,_e.data)}}else{F?J&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+nt,0,0,0,Ut,zt,xt[nt]):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+nt,0,Zt,Ut,zt,xt[nt]);for(let Ft=0;Ft<bt.length;Ft++){let It=bt[Ft];F?J&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+nt,Ft+1,0,0,Ut,zt,It.image[nt]):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+nt,Ft+1,Zt,Ut,zt,It.image[nt])}}}p(_)&&M(n.TEXTURE_CUBE_MAP),ot.__version=$.version,_.onUpdate&&_.onUpdate(_)}A.__version=_.version}function St(A,_,B,G,$,ot){let ht=r.convert(B.format,B.colorSpace),Y=r.convert(B.type),j=x(B.internalFormat,ht,Y,B.normalized,B.colorSpace),ft=i.get(_),Nt=i.get(B);if(Nt.__renderTarget=_,!ft.__hasExternalTextures){let xt=Math.max(1,_.width>>ot),pt=Math.max(1,_.height>>ot);$===n.TEXTURE_3D||$===n.TEXTURE_2D_ARRAY?e.texImage3D($,ot,j,xt,pt,_.depth,0,ht,Y,null):e.texImage2D($,ot,j,xt,pt,0,ht,Y,null)}e.bindFramebuffer(n.FRAMEBUFFER,A),Yt(_)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,G,$,Nt.__webglTexture,0,qt(_)):($===n.TEXTURE_2D||$>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&$<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,G,$,Nt.__webglTexture,ot),e.bindFramebuffer(n.FRAMEBUFFER,null)}function Xt(A,_,B){if(n.bindRenderbuffer(n.RENDERBUFFER,A),_.depthBuffer){let G=_.depthTexture,$=G&&G.isDepthTexture?G.type:null,ot=E(_.stencilBuffer,$),ht=_.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;Yt(_)?o.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,qt(_),ot,_.width,_.height):B?n.renderbufferStorageMultisample(n.RENDERBUFFER,qt(_),ot,_.width,_.height):n.renderbufferStorage(n.RENDERBUFFER,ot,_.width,_.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,ht,n.RENDERBUFFER,A)}else{let G=_.textures;for(let $=0;$<G.length;$++){let ot=G[$],ht=r.convert(ot.format,ot.colorSpace),Y=r.convert(ot.type),j=x(ot.internalFormat,ht,Y,ot.normalized,ot.colorSpace);Yt(_)?o.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,qt(_),j,_.width,_.height):B?n.renderbufferStorageMultisample(n.RENDERBUFFER,qt(_),j,_.width,_.height):n.renderbufferStorage(n.RENDERBUFFER,j,_.width,_.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function pe(A,_,B){let G=_.isWebGLCubeRenderTarget===!0;if(e.bindFramebuffer(n.FRAMEBUFFER,A),!(_.depthTexture&&_.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let $=i.get(_.depthTexture);if($.__renderTarget=_,(!$.__webglTexture||_.depthTexture.image.width!==_.width||_.depthTexture.image.height!==_.height)&&(_.depthTexture.image.width=_.width,_.depthTexture.image.height=_.height,_.depthTexture.needsUpdate=!0),G){if($.__webglInit===void 0&&($.__webglInit=!0,_.depthTexture.addEventListener("dispose",R)),$.__webglTexture===void 0){$.__webglTexture=n.createTexture(),e.bindTexture(n.TEXTURE_CUBE_MAP,$.__webglTexture),te(n.TEXTURE_CUBE_MAP,_.depthTexture);let ft=r.convert(_.depthTexture.format),Nt=r.convert(_.depthTexture.type),xt;_.depthTexture.format===Li?xt=n.DEPTH_COMPONENT24:_.depthTexture.format===mn&&(xt=n.DEPTH24_STENCIL8);for(let pt=0;pt<6;pt++)n.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+pt,0,xt,_.width,_.height,0,ft,Nt,null)}}else K(_.depthTexture,0);let ot=$.__webglTexture,ht=qt(_),Y=G?n.TEXTURE_CUBE_MAP_POSITIVE_X+B:n.TEXTURE_2D,j=_.depthTexture.format===mn?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;if(_.depthTexture.format===Li)Yt(_)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,j,Y,ot,0,ht):n.framebufferTexture2D(n.FRAMEBUFFER,j,Y,ot,0);else if(_.depthTexture.format===mn)Yt(_)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,j,Y,ot,0,ht):n.framebufferTexture2D(n.FRAMEBUFFER,j,Y,ot,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function et(A){let _=i.get(A),B=A.isWebGLCubeRenderTarget===!0;if(_.__boundDepthTexture!==A.depthTexture){let G=A.depthTexture;if(_.__depthDisposeCallback&&_.__depthDisposeCallback(),G){let $=()=>{delete _.__boundDepthTexture,delete _.__depthDisposeCallback,G.removeEventListener("dispose",$)};G.addEventListener("dispose",$),_.__depthDisposeCallback=$}_.__boundDepthTexture=G}if(A.depthTexture&&!_.__autoAllocateDepthBuffer)if(B)for(let G=0;G<6;G++)pe(_.__webglFramebuffer[G],A,G);else{let G=A.texture.mipmaps;G&&G.length>0?pe(_.__webglFramebuffer[0],A,0):pe(_.__webglFramebuffer,A,0)}else if(B){_.__webglDepthbuffer=[];for(let G=0;G<6;G++)if(e.bindFramebuffer(n.FRAMEBUFFER,_.__webglFramebuffer[G]),_.__webglDepthbuffer[G]===void 0)_.__webglDepthbuffer[G]=n.createRenderbuffer(),Xt(_.__webglDepthbuffer[G],A,!1);else{let $=A.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ot=_.__webglDepthbuffer[G];n.bindRenderbuffer(n.RENDERBUFFER,ot),n.framebufferRenderbuffer(n.FRAMEBUFFER,$,n.RENDERBUFFER,ot)}}else{let G=A.texture.mipmaps;if(G&&G.length>0?e.bindFramebuffer(n.FRAMEBUFFER,_.__webglFramebuffer[0]):e.bindFramebuffer(n.FRAMEBUFFER,_.__webglFramebuffer),_.__webglDepthbuffer===void 0)_.__webglDepthbuffer=n.createRenderbuffer(),Xt(_.__webglDepthbuffer,A,!1);else{let $=A.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ot=_.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,ot),n.framebufferRenderbuffer(n.FRAMEBUFFER,$,n.RENDERBUFFER,ot)}}e.bindFramebuffer(n.FRAMEBUFFER,null)}function st(A,_,B){let G=i.get(A);_!==void 0&&St(G.__webglFramebuffer,A,A.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),B!==void 0&&et(A)}function rt(A){let _=A.texture,B=i.get(A),G=i.get(_);A.addEventListener("dispose",v);let $=A.textures,ot=A.isWebGLCubeRenderTarget===!0,ht=$.length>1;if(ht||(G.__webglTexture===void 0&&(G.__webglTexture=n.createTexture()),G.__version=_.version,a.memory.textures++),ot){B.__webglFramebuffer=[];for(let Y=0;Y<6;Y++)if(_.mipmaps&&_.mipmaps.length>0){B.__webglFramebuffer[Y]=[];for(let j=0;j<_.mipmaps.length;j++)B.__webglFramebuffer[Y][j]=n.createFramebuffer()}else B.__webglFramebuffer[Y]=n.createFramebuffer()}else{if(_.mipmaps&&_.mipmaps.length>0){B.__webglFramebuffer=[];for(let Y=0;Y<_.mipmaps.length;Y++)B.__webglFramebuffer[Y]=n.createFramebuffer()}else B.__webglFramebuffer=n.createFramebuffer();if(ht)for(let Y=0,j=$.length;Y<j;Y++){let ft=i.get($[Y]);ft.__webglTexture===void 0&&(ft.__webglTexture=n.createTexture(),a.memory.textures++)}if(A.samples>0&&Yt(A)===!1){B.__webglMultisampledFramebuffer=n.createFramebuffer(),B.__webglColorRenderbuffer=[],e.bindFramebuffer(n.FRAMEBUFFER,B.__webglMultisampledFramebuffer);for(let Y=0;Y<$.length;Y++){let j=$[Y];B.__webglColorRenderbuffer[Y]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,B.__webglColorRenderbuffer[Y]);let ft=r.convert(j.format,j.colorSpace),Nt=r.convert(j.type),xt=x(j.internalFormat,ft,Nt,j.normalized,j.colorSpace,A.isXRRenderTarget===!0),pt=qt(A);n.renderbufferStorageMultisample(n.RENDERBUFFER,pt,xt,A.width,A.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+Y,n.RENDERBUFFER,B.__webglColorRenderbuffer[Y])}n.bindRenderbuffer(n.RENDERBUFFER,null),A.depthBuffer&&(B.__webglDepthRenderbuffer=n.createRenderbuffer(),Xt(B.__webglDepthRenderbuffer,A,!0)),e.bindFramebuffer(n.FRAMEBUFFER,null)}}if(ot){e.bindTexture(n.TEXTURE_CUBE_MAP,G.__webglTexture),te(n.TEXTURE_CUBE_MAP,_);for(let Y=0;Y<6;Y++)if(_.mipmaps&&_.mipmaps.length>0)for(let j=0;j<_.mipmaps.length;j++)St(B.__webglFramebuffer[Y][j],A,_,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+Y,j);else St(B.__webglFramebuffer[Y],A,_,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+Y,0);p(_)&&M(n.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(ht){for(let Y=0,j=$.length;Y<j;Y++){let ft=$[Y],Nt=i.get(ft),xt=n.TEXTURE_2D;(A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(xt=A.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),e.bindTexture(xt,Nt.__webglTexture),te(xt,ft),St(B.__webglFramebuffer,A,ft,n.COLOR_ATTACHMENT0+Y,xt,0),p(ft)&&M(xt)}e.unbindTexture()}else{let Y=n.TEXTURE_2D;if((A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(Y=A.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),e.bindTexture(Y,G.__webglTexture),te(Y,_),_.mipmaps&&_.mipmaps.length>0)for(let j=0;j<_.mipmaps.length;j++)St(B.__webglFramebuffer[j],A,_,n.COLOR_ATTACHMENT0,Y,j);else St(B.__webglFramebuffer,A,_,n.COLOR_ATTACHMENT0,Y,0);p(_)&&M(Y),e.unbindTexture()}A.depthBuffer&&et(A)}function at(A){let _=A.textures;for(let B=0,G=_.length;B<G;B++){let $=_[B];if(p($)){let ot=w(A),ht=i.get($).__webglTexture;e.bindTexture(ot,ht),M(ot),e.unbindTexture()}}}let ut=[],Bt=[];function Ot(A){if(A.samples>0){if(Yt(A)===!1){let _=A.textures,B=A.width,G=A.height,$=n.COLOR_BUFFER_BIT,ot=A.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,ht=i.get(A),Y=_.length>1;if(Y)for(let ft=0;ft<_.length;ft++)e.bindFramebuffer(n.FRAMEBUFFER,ht.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ft,n.RENDERBUFFER,null),e.bindFramebuffer(n.FRAMEBUFFER,ht.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+ft,n.TEXTURE_2D,null,0);e.bindFramebuffer(n.READ_FRAMEBUFFER,ht.__webglMultisampledFramebuffer);let j=A.texture.mipmaps;j&&j.length>0?e.bindFramebuffer(n.DRAW_FRAMEBUFFER,ht.__webglFramebuffer[0]):e.bindFramebuffer(n.DRAW_FRAMEBUFFER,ht.__webglFramebuffer);for(let ft=0;ft<_.length;ft++){if(A.resolveDepthBuffer&&(A.depthBuffer&&($|=n.DEPTH_BUFFER_BIT),A.stencilBuffer&&A.resolveStencilBuffer&&($|=n.STENCIL_BUFFER_BIT)),Y){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,ht.__webglColorRenderbuffer[ft]);let Nt=i.get(_[ft]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,Nt,0)}n.blitFramebuffer(0,0,B,G,0,0,B,G,$,n.NEAREST),l===!0&&(ut.length=0,Bt.length=0,ut.push(n.COLOR_ATTACHMENT0+ft),A.depthBuffer&&A.storeMultisampledDepthBuffer===!1&&(ut.push(ot),Bt.push(ot),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,Bt)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,ut))}if(e.bindFramebuffer(n.READ_FRAMEBUFFER,null),e.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),Y)for(let ft=0;ft<_.length;ft++){e.bindFramebuffer(n.FRAMEBUFFER,ht.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+ft,n.RENDERBUFFER,ht.__webglColorRenderbuffer[ft]);let Nt=i.get(_[ft]).__webglTexture;e.bindFramebuffer(n.FRAMEBUFFER,ht.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+ft,n.TEXTURE_2D,Nt,0)}e.bindFramebuffer(n.DRAW_FRAMEBUFFER,ht.__webglMultisampledFramebuffer)}else if(A.depthBuffer&&A.storeMultisampledDepthBuffer===!1&&l){let _=A.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[_])}}}function qt(A){return Math.min(s.maxSamples,A.samples)}function Yt(A){let _=i.get(A);return A.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&_.__useRenderToTexture!==!1}function N(A){let _=a.render.frame;h.get(A)!==_&&(h.set(A,_),A.update())}function ce(A,_){let B=A.colorSpace,G=A.format,$=A.type;return A.isCompressedTexture===!0||A.isVideoTexture===!0||B!==ks&&B!==Yi&&(ne.getTransfer(B)===de?(G!==mi||$!==si)&&Gt("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Wt("WebGLTextures: Unsupported texture color space:",B)),_}function ee(A){return typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement?(c.width=A.naturalWidth||A.width,c.height=A.naturalHeight||A.height):typeof VideoFrame<"u"&&A instanceof VideoFrame?(c.width=A.displayWidth,c.height=A.displayHeight):(c.width=A.width,c.height=A.height),c}this.allocateTextureUnit=V,this.resetTextureUnits=O,this.getTextureUnits=L,this.setTextureUnits=k,this.setTexture2D=K,this.setTexture2DArray=q,this.setTexture3D=Q,this.setTextureCube=it,this.rebindTextures=st,this.setupRenderTarget=rt,this.updateRenderTargetMipmap=at,this.updateMultisampleRenderTarget=Ot,this.setupDepthRenderbuffer=et,this.setupFrameBufferTexture=St,this.useMultisampledRTT=Yt,this.isReversedDepthBuffer=function(){return e.buffers.depth.getReversed()}}function Mx(n,t){function e(i,s=Yi){let r,a=ne.getTransfer(s);if(i===si)return n.UNSIGNED_BYTE;if(i===$a)return n.UNSIGNED_SHORT_4_4_4_4;if(i===Ya)return n.UNSIGNED_SHORT_5_5_5_1;if(i===lc)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===cc)return n.UNSIGNED_INT_10F_11F_11F_REV;if(i===ac)return n.BYTE;if(i===oc)return n.SHORT;if(i===ps)return n.UNSIGNED_SHORT;if(i===qa)return n.INT;if(i===Ti)return n.UNSIGNED_INT;if(i===pi)return n.FLOAT;if(i===Ai)return n.HALF_FLOAT;if(i===hc)return n.ALPHA;if(i===uc)return n.RGB;if(i===mi)return n.RGBA;if(i===Li)return n.DEPTH_COMPONENT;if(i===mn)return n.DEPTH_STENCIL;if(i===Za)return n.RED;if(i===Ja)return n.RED_INTEGER;if(i===gn)return n.RG;if(i===Ka)return n.RG_INTEGER;if(i===ja)return n.RGBA_INTEGER;if(i===_r||i===vr||i===yr||i===Mr)if(a===de)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===_r)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===vr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===yr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===Mr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===_r)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===vr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===yr)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===Mr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Qa||i===to||i===eo||i===io)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===Qa)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===to)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===eo)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===io)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===no||i===so||i===ro||i===ao||i===oo||i===br||i===lo)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(i===no||i===so)return a===de?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===ro)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(i===ao)return r.COMPRESSED_R11_EAC;if(i===oo)return r.COMPRESSED_SIGNED_R11_EAC;if(i===br)return r.COMPRESSED_RG11_EAC;if(i===lo)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(i===co||i===ho||i===uo||i===fo||i===po||i===mo||i===go||i===xo||i===_o||i===vo||i===yo||i===Mo||i===bo||i===So)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(i===co)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===ho)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===uo)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===fo)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===po)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===mo)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===go)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===xo)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===_o)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===vo)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===yo)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===Mo)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===bo)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===So)return a===de?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===Eo||i===wo||i===To)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(i===Eo)return a===de?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===wo)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===To)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===Ao||i===Ro||i===Sr||i===Co)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(i===Ao)return r.COMPRESSED_RED_RGTC1_EXT;if(i===Ro)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===Sr)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===Co)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===ms?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:e}}var bx=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Sx=`
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

}`,Lc=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){let i=new Js(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=i}}getMesh(t){if(this.texture!==null&&this.mesh===null){let e=t.cameras[0].viewport,i=new ti({vertexShader:bx,fragmentShader:Sx,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new lt(new Ue(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Dc=class extends Di{constructor(t,e){super();let i=this,s=null,r=1,a=null,o="local-floor",l=1,c=null,h=null,d=null,u=null,f=null,m=null,y=typeof XRWebGLBinding<"u",g=new Lc,p={},M=e.getContextAttributes(),w=null,x=null,E=[],S=[],R=new dt,v=null,T=null,P=new Ze;P.viewport=new Ee;let C=new Ze;C.viewport=new Ee;let I=[P,C],O=new Ga,L=null,k=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Z){let tt=E[Z];return tt===void 0&&(tt=new ss,E[Z]=tt),tt.getTargetRaySpace()},this.getControllerGrip=function(Z){let tt=E[Z];return tt===void 0&&(tt=new ss,E[Z]=tt),tt.getGripSpace()},this.getHand=function(Z){let tt=E[Z];return tt===void 0&&(tt=new ss,E[Z]=tt),tt.getHandSpace()};function V(Z){let tt=S.indexOf(Z.inputSource);if(tt===-1)return;let vt=E[tt];vt!==void 0&&(vt.update(Z.inputSource,Z.frame,c||a),vt.dispatchEvent({type:Z.type,data:Z.inputSource}))}function W(){s.removeEventListener("select",V),s.removeEventListener("selectstart",V),s.removeEventListener("selectend",V),s.removeEventListener("squeeze",V),s.removeEventListener("squeezestart",V),s.removeEventListener("squeezeend",V),s.removeEventListener("end",W),s.removeEventListener("inputsourceschange",K);for(let Z=0;Z<E.length;Z++){let tt=S[Z];tt!==null&&(S[Z]=null,E[Z].disconnect(tt))}L=null,k=null,g.reset();for(let Z in p)delete p[Z];if(t.setRenderTarget(w),f=null,u=null,d=null,s=null,x=null,re.stop(),i.isPresenting=!1,t.setPixelRatio(v),t.setSize(R.width,R.height,!1),T!==null){let Z=T.camera;Z.fov=T.fov,Z.zoom=T.zoom,Z.updateProjectionMatrix(),T=null}i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Z){r=Z,i.isPresenting===!0&&Gt("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Z){o=Z,i.isPresenting===!0&&Gt("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(Z){c=Z},this.getBaseLayer=function(){return u!==null?u:f},this.getBinding=function(){return d===null&&y&&(d=new XRWebGLBinding(s,e)),d},this.getFrame=function(){return m},this.getSession=function(){return s},this.setSession=async function(Z){if(s=Z,s!==null){if(w=t.getRenderTarget(),s.addEventListener("select",V),s.addEventListener("selectstart",V),s.addEventListener("selectend",V),s.addEventListener("squeeze",V),s.addEventListener("squeezestart",V),s.addEventListener("squeezeend",V),s.addEventListener("end",W),s.addEventListener("inputsourceschange",K),M.xrCompatible!==!0&&await e.makeXRCompatible(),v=t.getPixelRatio(),t.getSize(R),y&&"createProjectionLayer"in XRWebGLBinding.prototype){let vt=null,Vt=null,St=null;M.depth&&(St=M.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,vt=M.stencil?mn:Li,Vt=M.stencil?ms:Ti);let Xt={colorFormat:e.RGBA8,depthFormat:St,scaleFactor:r};d=this.getBinding(),u=d.createProjectionLayer(Xt),s.updateRenderState({layers:[u]}),t.setPixelRatio(1),t.setSize(u.textureWidth,u.textureHeight,!1),x=new ii(u.textureWidth,u.textureHeight,{format:mi,type:si,depthTexture:new ln(u.textureWidth,u.textureHeight,Vt,void 0,void 0,void 0,void 0,void 0,void 0,vt),stencilBuffer:M.stencil,colorSpace:t.outputColorSpace,samples:M.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1,storeMultisampledDepthBuffer:u.ignoreDepthValues===!1,storeMultisampledStencilBuffer:u.ignoreDepthValues===!1})}else{let vt={antialias:M.antialias,alpha:!0,depth:M.depth,stencil:M.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,e,vt),s.updateRenderState({baseLayer:f}),t.setPixelRatio(1),t.setSize(f.framebufferWidth,f.framebufferHeight,!1),x=new ii(f.framebufferWidth,f.framebufferHeight,{format:mi,type:si,colorSpace:t.outputColorSpace,stencilBuffer:M.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}x.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),re.setContext(s),re.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return g.getDepthTexture()};function K(Z){for(let tt=0;tt<Z.removed.length;tt++){let vt=Z.removed[tt],Vt=S.indexOf(vt);Vt>=0&&(S[Vt]=null,E[Vt].disconnect(vt))}for(let tt=0;tt<Z.added.length;tt++){let vt=Z.added[tt],Vt=S.indexOf(vt);if(Vt===-1){for(let Xt=0;Xt<E.length;Xt++)if(Xt>=S.length){S.push(vt),Vt=Xt;break}else if(S[Xt]===null){S[Xt]=vt,Vt=Xt;break}if(Vt===-1)break}let St=E[Vt];St&&St.connect(vt)}}let q=new D,Q=new D;function it(Z,tt,vt){q.setFromMatrixPosition(tt.matrixWorld),Q.setFromMatrixPosition(vt.matrixWorld);let Vt=q.distanceTo(Q),St=tt.projectionMatrix.elements,Xt=vt.projectionMatrix.elements,pe=St[14]/(St[10]-1),et=St[14]/(St[10]+1),st=(St[9]+1)/St[5],rt=(St[9]-1)/St[5],at=(St[8]-1)/St[0],ut=(Xt[8]+1)/Xt[0],Bt=pe*at,Ot=pe*ut,qt=Vt/(-at+ut),Yt=qt*-at;if(tt.matrixWorld.decompose(Z.position,Z.quaternion,Z.scale),Z.translateX(Yt),Z.translateZ(qt),Z.matrixWorld.compose(Z.position,Z.quaternion,Z.scale),Z.matrixWorldInverse.copy(Z.matrixWorld).invert(),St[10]===-1)Z.projectionMatrix.copy(tt.projectionMatrix),Z.projectionMatrixInverse.copy(tt.projectionMatrixInverse);else{let N=pe+qt,ce=et+qt,ee=Bt-Yt,A=Ot+(Vt-Yt),_=st*et/ce*N,B=rt*et/ce*N;Z.projectionMatrix.makePerspective(ee,A,_,B,N,ce),Z.projectionMatrixInverse.copy(Z.projectionMatrix).invert()}}function Dt(Z,tt){tt===null?Z.matrixWorld.copy(Z.matrix):Z.matrixWorld.multiplyMatrices(tt.matrixWorld,Z.matrix),Z.matrixWorldInverse.copy(Z.matrixWorld).invert()}this.updateCamera=function(Z){if(s===null)return;let tt=Z.near,vt=Z.far;g.texture!==null&&(g.depthNear>0&&(tt=g.depthNear),g.depthFar>0&&(vt=g.depthFar)),O.near=C.near=P.near=tt,O.far=C.far=P.far=vt,(L!==O.near||k!==O.far)&&(s.updateRenderState({depthNear:O.near,depthFar:O.far}),L=O.near,k=O.far),O.layers.mask=Z.layers.mask|6,P.layers.mask=O.layers.mask&-5,C.layers.mask=O.layers.mask&-3;let Vt=Z.parent,St=O.cameras;Dt(O,Vt);for(let Xt=0;Xt<St.length;Xt++)Dt(St[Xt],Vt);St.length===2?it(O,P,C):O.projectionMatrix.copy(P.projectionMatrix),T===null&&Z.isPerspectiveCamera&&(T={camera:Z,fov:Z.fov,zoom:Z.zoom}),At(Z,O,Vt)};function At(Z,tt,vt){vt===null?Z.matrix.copy(tt.matrixWorld):(Z.matrix.copy(vt.matrixWorld),Z.matrix.invert(),Z.matrix.multiply(tt.matrixWorld)),Z.matrix.decompose(Z.position,Z.quaternion,Z.scale),Z.updateMatrixWorld(!0),Z.projectionMatrix.copy(tt.projectionMatrix),Z.projectionMatrixInverse.copy(tt.projectionMatrixInverse),Z.isPerspectiveCamera&&(Z.fov=ga*2*Math.atan(1/Z.projectionMatrix.elements[5]),Z.zoom=1)}this.getCamera=function(){return O},this.getFoveation=function(){if(!(u===null&&f===null))return l},this.setFoveation=function(Z){l=Z,u!==null&&(u.fixedFoveation=Z),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=Z)},this.hasDepthSensing=function(){return g.texture!==null},this.getDepthSensingMesh=function(){return g.getMesh(O)},this.getCameraTexture=function(Z){return p[Z]};let le=null;function te(Z,tt){if(h=tt.getViewerPose(c||a),m=tt,h!==null){let vt=h.views;f!==null&&(t.setRenderTargetFramebuffer(x,f.framebuffer),t.setRenderTarget(x));let Vt=!1;vt.length!==O.cameras.length&&(O.cameras.length=0,Vt=!0);for(let et=0;et<vt.length;et++){let st=vt[et],rt=null;if(f!==null)rt=f.getViewport(st);else{let ut=d.getViewSubImage(u,st);rt=ut.viewport,et===0&&(t.setRenderTargetTextures(x,ut.colorTexture,ut.depthStencilTexture),t.setRenderTarget(x))}let at=I[et];at===void 0&&(at=new Ze,at.layers.enable(et),at.viewport=new Ee,I[et]=at),at.matrix.fromArray(st.transform.matrix),at.matrix.decompose(at.position,at.quaternion,at.scale),at.projectionMatrix.fromArray(st.projectionMatrix),at.projectionMatrixInverse.copy(at.projectionMatrix).invert(),at.viewport.set(rt.x,rt.y,rt.width,rt.height),et===0&&(O.matrix.copy(at.matrix),O.matrix.decompose(O.position,O.quaternion,O.scale)),Vt===!0&&O.cameras.push(at)}let St=s.enabledFeatures;if(St&&St.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&y){d=i.getBinding();let et=d.getDepthInformation(vt[0]);et&&et.isValid&&et.texture&&g.init(et,s.renderState)}if(St&&St.includes("camera-access")&&y){t.state.unbindTexture(),d=i.getBinding();for(let et=0;et<vt.length;et++){let st=vt[et].camera;if(st){let rt=p[st];rt||(rt=new Js,p[st]=rt);let at=d.getCameraImage(st);rt.sourceTexture=at}}}}for(let vt=0;vt<E.length;vt++){let Vt=S[vt],St=E[vt];Vt!==null&&St!==void 0&&St.update(Vt,tt,c||a)}le&&le(Z,tt),tt.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:tt}),m=null}let re=new $u;re.setAnimationLoop(te),this.setAnimationLoop=function(Z){le=Z},this.dispose=function(){}}},Ex=new ge,Qu=new $t;Qu.set(-1,0,0,0,1,0,0,0,1);function wx(n,t){function e(g,p){g.matrixAutoUpdate===!0&&g.updateMatrix(),p.value.copy(g.matrix)}function i(g,p){p.color.getRGB(g.fogColor.value,mc(n)),p.isFog?(g.fogNear.value=p.near,g.fogFar.value=p.far):p.isFogExp2&&(g.fogDensity.value=p.density)}function s(g,p,M,w,x){p.isNodeMaterial?p.uniformsNeedUpdate=!1:p.isMeshBasicMaterial?r(g,p):p.isMeshLambertMaterial?(r(g,p),p.envMap&&(g.envMapIntensity.value=p.envMapIntensity)):p.isMeshToonMaterial?(r(g,p),d(g,p)):p.isMeshPhongMaterial?(r(g,p),h(g,p),p.envMap&&(g.envMapIntensity.value=p.envMapIntensity)):p.isMeshStandardMaterial?(r(g,p),u(g,p),p.isMeshPhysicalMaterial&&f(g,p,x)):p.isMeshMatcapMaterial?(r(g,p),m(g,p)):p.isMeshDepthMaterial?r(g,p):p.isMeshDistanceMaterial?(r(g,p),y(g,p)):p.isMeshNormalMaterial?r(g,p):p.isLineBasicMaterial?(a(g,p),p.isLineDashedMaterial&&o(g,p)):p.isPointsMaterial?l(g,p,M,w):p.isSpriteMaterial?c(g,p):p.isShadowMaterial?(g.color.value.copy(p.color),g.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(g,p){g.opacity.value=p.opacity,p.color&&g.diffuse.value.copy(p.color),p.emissive&&g.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(g.map.value=p.map,e(p.map,g.mapTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,e(p.alphaMap,g.alphaMapTransform)),p.bumpMap&&(g.bumpMap.value=p.bumpMap,e(p.bumpMap,g.bumpMapTransform),g.bumpScale.value=p.bumpScale,p.side===Ve&&(g.bumpScale.value*=-1)),p.normalMap&&(g.normalMap.value=p.normalMap,e(p.normalMap,g.normalMapTransform),g.normalScale.value.copy(p.normalScale),p.side===Ve&&g.normalScale.value.negate()),p.displacementMap&&(g.displacementMap.value=p.displacementMap,e(p.displacementMap,g.displacementMapTransform),g.displacementScale.value=p.displacementScale,g.displacementBias.value=p.displacementBias),p.emissiveMap&&(g.emissiveMap.value=p.emissiveMap,e(p.emissiveMap,g.emissiveMapTransform)),p.specularMap&&(g.specularMap.value=p.specularMap,e(p.specularMap,g.specularMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest);let M=t.get(p),w=M.envMap,x=M.envMapRotation;w&&(g.envMap.value=w,g.envMapRotation.value.setFromMatrix4(Ex.makeRotationFromEuler(x)).transpose(),w.isCubeTexture&&w.isRenderTargetTexture===!1&&g.envMapRotation.value.premultiply(Qu),g.reflectivity.value=p.reflectivity,g.ior.value=p.ior,g.refractionRatio.value=p.refractionRatio),p.lightMap&&(g.lightMap.value=p.lightMap,g.lightMapIntensity.value=p.lightMapIntensity,e(p.lightMap,g.lightMapTransform)),p.aoMap&&(g.aoMap.value=p.aoMap,g.aoMapIntensity.value=p.aoMapIntensity,e(p.aoMap,g.aoMapTransform))}function a(g,p){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,p.map&&(g.map.value=p.map,e(p.map,g.mapTransform))}function o(g,p){g.dashSize.value=p.dashSize,g.totalSize.value=p.dashSize+p.gapSize,g.scale.value=p.scale}function l(g,p,M,w){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,g.size.value=p.size*M,g.scale.value=w*.5,p.map&&(g.map.value=p.map,e(p.map,g.uvTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,e(p.alphaMap,g.alphaMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest)}function c(g,p){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,g.rotation.value=p.rotation,p.map&&(g.map.value=p.map,e(p.map,g.mapTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,e(p.alphaMap,g.alphaMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest)}function h(g,p){g.specular.value.copy(p.specular),g.shininess.value=Math.max(p.shininess,1e-4)}function d(g,p){p.gradientMap&&(g.gradientMap.value=p.gradientMap)}function u(g,p){g.metalness.value=p.metalness,p.metalnessMap&&(g.metalnessMap.value=p.metalnessMap,e(p.metalnessMap,g.metalnessMapTransform)),g.roughness.value=p.roughness,p.roughnessMap&&(g.roughnessMap.value=p.roughnessMap,e(p.roughnessMap,g.roughnessMapTransform)),p.envMap&&(g.envMapIntensity.value=p.envMapIntensity)}function f(g,p,M){g.ior.value=p.ior,p.sheen>0&&(g.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),g.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(g.sheenColorMap.value=p.sheenColorMap,e(p.sheenColorMap,g.sheenColorMapTransform)),p.sheenRoughnessMap&&(g.sheenRoughnessMap.value=p.sheenRoughnessMap,e(p.sheenRoughnessMap,g.sheenRoughnessMapTransform))),p.clearcoat>0&&(g.clearcoat.value=p.clearcoat,g.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(g.clearcoatMap.value=p.clearcoatMap,e(p.clearcoatMap,g.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,e(p.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(g.clearcoatNormalMap.value=p.clearcoatNormalMap,e(p.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Ve&&g.clearcoatNormalScale.value.negate())),p.dispersion>0&&(g.dispersion.value=p.dispersion),p.retroreflectivity>0&&(g.retroreflectivity.value=p.retroreflectivity),p.iridescence>0&&(g.iridescence.value=p.iridescence,g.iridescenceIOR.value=p.iridescenceIOR,g.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],g.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(g.iridescenceMap.value=p.iridescenceMap,e(p.iridescenceMap,g.iridescenceMapTransform)),p.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=p.iridescenceThicknessMap,e(p.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),p.transmission>0&&(g.transmission.value=p.transmission,g.transmissionSamplerMap.value=M.texture,g.transmissionSamplerSize.value.set(M.width,M.height),p.transmissionMap&&(g.transmissionMap.value=p.transmissionMap,e(p.transmissionMap,g.transmissionMapTransform)),g.thickness.value=p.thickness,p.thicknessMap&&(g.thicknessMap.value=p.thicknessMap,e(p.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=p.attenuationDistance,g.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(g.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(g.anisotropyMap.value=p.anisotropyMap,e(p.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=p.specularIntensity,g.specularColor.value.copy(p.specularColor),p.specularColorMap&&(g.specularColorMap.value=p.specularColorMap,e(p.specularColorMap,g.specularColorMapTransform)),p.specularIntensityMap&&(g.specularIntensityMap.value=p.specularIntensityMap,e(p.specularIntensityMap,g.specularIntensityMapTransform))}function m(g,p){p.matcap&&(g.matcap.value=p.matcap)}function y(g,p){let M=t.get(p).light;g.referencePosition.value.setFromMatrixPosition(M.matrixWorld),g.nearDistance.value=M.shadow.camera.near,g.farDistance.value=M.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function Tx(n,t,e,i){let s={},r={},a=[],o=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function l(x,E){let S=E.program;i.uniformBlockBinding(x,S)}function c(x,E){let S=s[x.id];S===void 0&&(g(x),S=h(x),s[x.id]=S,x.addEventListener("dispose",M));let R=E.program;i.updateUBOMapping(x,R);let v=t.render.frame;r[x.id]!==v&&(u(x),r[x.id]=v)}function h(x){let E=d();x.__bindingPointIndex=E;let S=n.createBuffer(),R=x.__size,v=x.usage;return n.bindBuffer(n.UNIFORM_BUFFER,S),n.bufferData(n.UNIFORM_BUFFER,R,v),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,E,S),S}function d(){for(let x=0;x<o;x++)if(a.indexOf(x)===-1)return a.push(x),x;return Wt("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(x){let E=s[x.id],S=x.uniforms,R=x.__cache;n.bindBuffer(n.UNIFORM_BUFFER,E);for(let v=0,T=S.length;v<T;v++){let P=S[v];if(Array.isArray(P))for(let C=0,I=P.length;C<I;C++)f(P[C],v,C,R);else f(P,v,0,R)}n.bindBuffer(n.UNIFORM_BUFFER,null)}function f(x,E,S,R){if(y(x,E,S,R)===!0){let v=x.__offset,T=x.value;if(Array.isArray(T)){let P=0;for(let C=0;C<T.length;C++){let I=T[C],O=p(I);m(I,x.__data,P),typeof I!="number"&&typeof I!="boolean"&&!I.isMatrix3&&!ArrayBuffer.isView(I)&&(P+=O.storage/Float32Array.BYTES_PER_ELEMENT)}}else m(T,x.__data,0);n.bufferSubData(n.UNIFORM_BUFFER,v,x.__data)}}function m(x,E,S){typeof x=="number"||typeof x=="boolean"?E[0]=x:x.isMatrix3?(E[0]=x.elements[0],E[1]=x.elements[1],E[2]=x.elements[2],E[3]=0,E[4]=x.elements[3],E[5]=x.elements[4],E[6]=x.elements[5],E[7]=0,E[8]=x.elements[6],E[9]=x.elements[7],E[10]=x.elements[8],E[11]=0):ArrayBuffer.isView(x)?E.set(new x.constructor(x.buffer,x.byteOffset,E.length)):x.toArray(E,S)}function y(x,E,S,R){let v=x.value,T=E+"_"+S;if(R[T]===void 0)return typeof v=="number"||typeof v=="boolean"?R[T]=v:ArrayBuffer.isView(v)?R[T]=v.slice():R[T]=v.clone(),!0;{let P=R[T];if(typeof v=="number"||typeof v=="boolean"){if(P!==v)return R[T]=v,!0}else{if(ArrayBuffer.isView(v))return!0;if(P.equals(v)===!1)return P.copy(v),!0}}return!1}function g(x){let E=x.uniforms,S=0,R=16;for(let T=0,P=E.length;T<P;T++){let C=Array.isArray(E[T])?E[T]:[E[T]];for(let I=0,O=C.length;I<O;I++){let L=C[I],k=Array.isArray(L.value)?L.value:[L.value];for(let V=0,W=k.length;V<W;V++){let K=k[V],q=p(K),Q=S%R,it=Q%q.boundary,Dt=Q+it;S+=it,Dt!==0&&R-Dt<q.storage&&(S+=R-Dt),L.__data=new Float32Array(q.storage/Float32Array.BYTES_PER_ELEMENT),L.__offset=S,S+=q.storage}}}let v=S%R;return v>0&&(S+=R-v),x.__size=S,x.__cache={},this}function p(x){let E={boundary:0,storage:0};return typeof x=="number"||typeof x=="boolean"?(E.boundary=4,E.storage=4):x.isVector2?(E.boundary=8,E.storage=8):x.isVector3||x.isColor?(E.boundary=16,E.storage=12):x.isVector4?(E.boundary=16,E.storage=16):x.isMatrix3?(E.boundary=48,E.storage=48):x.isMatrix4?(E.boundary=64,E.storage=64):x.isTexture?Gt("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(x)?(E.boundary=16,E.storage=x.byteLength):Gt("WebGLRenderer: Unsupported uniform value type.",x),E}function M(x){let E=x.target;E.removeEventListener("dispose",M);let S=a.indexOf(E.__bindingPointIndex);a.splice(S,1),n.deleteBuffer(s[E.id]),delete s[E.id],delete r[E.id]}function w(){for(let x in s)n.deleteBuffer(s[x]);a=[],s={},r={}}return{bind:l,update:c,dispose:w}}var Ax=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Oi=null;function Rx(){return Oi===null&&(Oi=new Ys(Ax,16,16,gn,Ai),Oi.name="DFG_LUT",Oi.minFilter=Ge,Oi.magFilter=Ge,Oi.wrapS=Ii,Oi.wrapT=Ii,Oi.generateMipmaps=!1,Oi.needsUpdate=!0),Oi}var Oo=class{constructor(t={}){let{canvas:e=pu(),context:i=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:u=!1,outputBufferType:f=si}=t;this.isWebGLRenderer=!0;let m;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");m=i.getContextAttributes().alpha}else m=a;let y=f,g=new Set([ja,Ka,Ja]),p=new Set([si,Ti,ps,ms,$a,Ya]),M=new Uint32Array(4),w=new Int32Array(4),x=new D,E=null,S=null,R=[],v=[],T=null;this.domElement=e,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=wi,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let P=this,C=!1,I=null,O=null,L=null,k=null;this._outputColorSpace=Se;let V=0,W=0,K=null,q=-1,Q=null,it=new Ee,Dt=new Ee,At=null,le=new Rt(0),te=0,re=e.width,Z=e.height,tt=1,vt=null,Vt=null,St=new Ee(0,0,re,Z),Xt=new Ee(0,0,re,Z),pe=!1,et=new rs,st=!1,rt=!1,at=new ge,ut=new D,Bt=new Ee,Ot={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},qt=!1;function Yt(){return K===null?tt:1}let N=i;function ce(b,U){return e.getContext(b,U)}let ee,A,_,B,G,$,ot,ht,Y,j,ft,Nt,xt,pt,Ut,zt,Zt,F,mt,J,gt,bt,nt;try{let b={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:d};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${"186"}`),e.addEventListener("webglcontextlost",_e,!1),e.addEventListener("webglcontextrestored",he,!1),e.addEventListener("webglcontextcreationerror",_i,!1),N===null){let U="webgl2";if(N=ce(U,b),N===null)throw ce(U)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Ft()}catch(b){throw e.removeEventListener("webglcontextlost",_e,!1),e.removeEventListener("webglcontextrestored",he,!1),e.removeEventListener("webglcontextcreationerror",_i,!1),Wt("WebGLRenderer: "+b.message),b}function Ft(){ee=new U0(N),ee.init(),gt=new Mx(N,ee),A=new w0(N,ee,t,gt),_=new vx(N,ee),A.reversedDepthBuffer&&u&&_.buffers.depth.setReversed(!0),O=N.createFramebuffer(),L=N.createFramebuffer(),k=N.createFramebuffer(),B=new k0(N),G=new rx,$=new yx(N,ee,_,G,A,gt,B),ot=new N0(P),ht=new zf(N),bt=new S0(N,ht),Y=new F0(N,ht,B,bt),j=new z0(N,Y,ht,bt,B),F=new B0(N,A,$),Ut=new T0(G),ft=new sx(P,ot,ee,A,bt,Ut),Nt=new wx(P,G),xt=new ox,pt=new fx(ee),Zt=new b0(P,ot,_,j,m,l),zt=new _x(P,j,A),nt=new Tx(N,B,A,_),mt=new E0(N,ee,B),J=new O0(N,ee,B),B.programs=ft.programs,P.capabilities=A,P.extensions=ee,P.properties=G,P.renderLists=xt,P.shadowMap=zt,P.state=_,P.info=B}y!==si&&(T=new G0(y,e.width,e.height,o,s,r));let It=new Dc(P,N);this.xr=It,this.getContext=function(){return N},this.getContextAttributes=function(){return N.getContextAttributes()},this.forceContextLoss=function(){let b=ee.get("WEBGL_lose_context");b&&b.loseContext()},this.forceContextRestore=function(){let b=ee.get("WEBGL_lose_context");b&&b.restoreContext()},this.getPixelRatio=function(){return tt},this.setPixelRatio=function(b){b!==void 0&&(tt=b,this.setSize(re,Z,!1))},this.getSize=function(b){return b.set(re,Z)},this.setSize=function(b,U,X=!0){if(It.isPresenting){Gt("WebGLRenderer: Can't change size while VR device is presenting.");return}re=b,Z=U,e.width=Math.floor(b*tt),e.height=Math.floor(U*tt),X===!0&&(e.style.width=b+"px",e.style.height=U+"px"),T!==null&&T.setSize(e.width,e.height),this.setViewport(0,0,b,U)},this.getDrawingBufferSize=function(b){return b.set(re*tt,Z*tt).floor()},this.setDrawingBufferSize=function(b,U,X){re=b,Z=U,tt=X,e.width=Math.floor(b*X),e.height=Math.floor(U*X),this.setViewport(0,0,b,U)},this.setEffects=function(b){if(y===si){Wt("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(b){for(let U=0;U<b.length;U++)if(b[U].isOutputPass===!0){Gt("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}T.setEffects(b||[])},this.getCurrentViewport=function(b){return b.copy(it)},this.getViewport=function(b){return b.copy(St)},this.setViewport=function(b,U,X,z){b.isVector4?St.set(b.x,b.y,b.z,b.w):St.set(b,U,X,z),_.viewport(it.copy(St).multiplyScalar(tt).round())},this.getScissor=function(b){return b.copy(Xt)},this.setScissor=function(b,U,X,z){b.isVector4?Xt.set(b.x,b.y,b.z,b.w):Xt.set(b,U,X,z),_.scissor(Dt.copy(Xt).multiplyScalar(tt).round())},this.getScissorTest=function(){return pe},this.setScissorTest=function(b){_.setScissorTest(pe=b)},this.setOpaqueSort=function(b){vt=b},this.setTransparentSort=function(b){Vt=b},this.getClearColor=function(b){return b.copy(Zt.getClearColor())},this.setClearColor=function(){Zt.setClearColor(...arguments)},this.getClearAlpha=function(){return Zt.getClearAlpha()},this.setClearAlpha=function(){Zt.setClearAlpha(...arguments)},this.clear=function(b=!0,U=!0,X=!0){let z=0;if(b){let H=!1;if(K!==null){let Mt=K.texture.format;H=g.has(Mt)}if(H){let Mt=K.texture.type,Tt=p.has(Mt),yt=Zt.getClearColor(),Ct=Zt.getClearAlpha(),Lt=yt.r,Jt=yt.g,ie=yt.b;Tt?(M[0]=Lt,M[1]=Jt,M[2]=ie,M[3]=Ct,N.clearBufferuiv(N.COLOR,0,M)):(w[0]=Lt,w[1]=Jt,w[2]=ie,w[3]=Ct,N.clearBufferiv(N.COLOR,0,w))}else z|=N.COLOR_BUFFER_BIT}U&&(z|=N.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),X&&(z|=N.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),z!==0&&N.clear(z)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(b){b.setRenderer(this),I=b},this.dispose=function(){e.removeEventListener("webglcontextlost",_e,!1),e.removeEventListener("webglcontextrestored",he,!1),e.removeEventListener("webglcontextcreationerror",_i,!1),Zt.dispose(),xt.dispose(),pt.dispose(),G.dispose(),ot.dispose(),j.dispose(),bt.dispose(),nt.dispose(),ft.dispose(),It.dispose(),It.removeEventListener("sessionstart",Yc),It.removeEventListener("sessionend",Zc),vn.stop()};function _e(b){b.preventDefault(),fc("WebGLRenderer: Context Lost."),C=!0}function he(){fc("WebGLRenderer: Context Restored."),C=!1;let b=B.autoReset,U=zt.enabled,X=zt.autoUpdate,z=zt.needsUpdate,H=zt.type;Ft(),B.autoReset=b,zt.enabled=U,zt.autoUpdate=X,zt.needsUpdate=z,zt.type=H}function _i(b){Wt("WebGLRenderer: A WebGL context could not be created. Reason: ",b.statusMessage)}function Ri(b){let U=b.target;U.removeEventListener("dispose",Ri),Sd(U)}function Sd(b){Ed(b),G.remove(b)}function Ed(b){let U=G.get(b).programs;U!==void 0&&(U.forEach(function(X){ft.releaseProgram(X)}),b.isShaderMaterial&&ft.releaseShaderCache(b))}this.renderBufferDirect=function(b,U,X,z,H,Mt){U===null&&(U=Ot);let Tt=H.isMesh&&H.matrixWorld.determinantAffine()<0,yt=Ad(b,U,X,z,H);_.setMaterial(z,Tt);let Ct=X.index,Lt=1;if(z.wireframe===!0){if(Ct=Y.getWireframeAttribute(X),Ct===void 0)return;Lt=2}let Jt=X.drawRange,ie=X.attributes.position,Pt=Jt.start*Lt,ue=(Jt.start+Jt.count)*Lt;Mt!==null&&(Pt=Math.max(Pt,Mt.start*Lt),ue=Math.min(ue,(Mt.start+Mt.count)*Lt)),Ct!==null?(Pt=Math.max(Pt,0),ue=Math.min(ue,Ct.count)):ie!=null&&(Pt=Math.max(Pt,0),ue=Math.min(ue,ie.count));let Ie=ue-Pt;if(Ie<0||Ie===1/0)return;bt.setup(H,z,yt,X,Ct);let ye,xe=mt;if(Ct!==null&&(ye=ht.get(Ct),xe=J,xe.setIndex(ye)),H.isMesh)z.wireframe===!0?(_.setLineWidth(z.wireframeLinewidth*Yt()),xe.setMode(N.LINES)):xe.setMode(N.TRIANGLES);else if(H.isLine){let qe=z.linewidth;qe===void 0&&(qe=1),_.setLineWidth(qe*Yt()),H.isLineSegments?xe.setMode(N.LINES):H.isLineLoop?xe.setMode(N.LINE_LOOP):xe.setMode(N.LINE_STRIP)}else H.isPoints?xe.setMode(N.POINTS):H.isSprite&&xe.setMode(N.TRIANGLES);if(H.isBatchedMesh)if(ee.get("WEBGL_multi_draw"))xe.renderMultiDraw(H._multiDrawStarts,H._multiDrawCounts,H._multiDrawCount);else{let qe=H._multiDrawStarts,wt=H._multiDrawCounts,je=H._multiDrawCount,ae=Ct?ht.get(Ct).bytesPerElement:1,di=G.get(z).currentProgram.getUniforms();for(let Ci=0;Ci<je;Ci++)di.setValue(N,"_gl_DrawID",Ci),xe.render(qe[Ci]/ae,wt[Ci])}else if(H.isInstancedMesh)xe.renderInstances(Pt,Ie,H.count);else if(X.isInstancedBufferGeometry){let qe=X._maxInstanceCount!==void 0?X._maxInstanceCount:1/0,wt=Math.min(X.instanceCount,qe);xe.renderInstances(Pt,Ie,wt)}else xe.render(Pt,Ie)};function $c(b,U,X,z){I!==null&&b.isNodeMaterial&&I.setObject(z,b),st===!0&&Ut.setState(b,X,!1),b.transparent===!0&&b.side===Pe&&b.forceSinglePass===!1?(b.side=Ve,b.needsUpdate=!0,Nr(b,U,z),b.side=dn,b.needsUpdate=!0,Nr(b,U,z),b.side=Pe):Nr(b,U,z)}this.compile=function(b,U,X=null){X===null&&(X=b),I!==null&&I.renderStart(b,U,X),S=pt.get(X),S.init(U),v.push(S),X.traverseVisible(function(H){H.isLight&&H.layers.test(U.layers)&&(S.pushLight(H),H.castShadow&&S.pushShadow(H))}),b!==X&&b.traverseVisible(function(H){H.isLight&&H.layers.test(U.layers)&&(S.pushLight(H),H.castShadow&&S.pushShadow(H))}),S.setupLights(),I!==null&&I.updateLights(S.state.lightsArray),rt=this.localClippingEnabled,st=Ut.init(this.clippingPlanes,rt),st===!0&&Ut.setGlobalState(this.clippingPlanes,U),I!==null&&zt.render(S.state.shadowsArray,X,U);let z=new Set;return b.traverse(function(H){if(!(H.isMesh||H.isPoints||H.isLine||H.isSprite))return;let Mt=H.material;if(Mt)if(Array.isArray(Mt))for(let Tt=0;Tt<Mt.length;Tt++){let yt=Mt[Tt];$c(yt,X,U,H),z.add(yt)}else $c(Mt,X,U,H),z.add(Mt)}),S=v.pop(),I!==null&&I.renderEnd(),z},this.compileAsync=function(b,U,X=null){let z=this.compile(b,U,X);return new Promise(H=>{function Mt(){if(z.forEach(function(Tt){let Ct=G.get(Tt).currentProgram;(Ct===void 0||Ct.isReady())&&z.delete(Tt)}),z.size===0){H(b);return}setTimeout(Mt,10)}ee.get("KHR_parallel_shader_compile")!==null?Mt():setTimeout(Mt,10)})};let al=null;function wd(b){al&&al(b)}function Yc(){vn.stop()}function Zc(){vn.start()}let vn=new $u;vn.setAnimationLoop(wd),typeof self<"u"&&vn.setContext(self),this.setAnimationLoop=function(b){al=b,It.setAnimationLoop(b),b===null?vn.stop():vn.start()},It.addEventListener("sessionstart",Yc),It.addEventListener("sessionend",Zc),this.render=function(b,U){if(U!==void 0&&U.isCamera!==!0){Wt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(C===!0)return;I!==null&&I.renderStart(b,U);let X=It.enabled===!0&&It.isPresenting===!0,z=T!==null&&(K===null||X)&&T.begin(P,K);if(b.matrixWorldAutoUpdate===!0&&b.updateMatrixWorld(),U.parent===null&&U.matrixWorldAutoUpdate===!0&&U.updateMatrixWorld(),It.enabled===!0&&It.isPresenting===!0&&(T===null||T.isCompositing()===!1)&&(It.cameraAutoUpdate===!0&&It.updateCamera(U),U=It.getCamera()),b.isScene===!0&&b.onBeforeRender(P,b,U,K),S=pt.get(b,v.length),S.init(U),S.state.textureUnits=$.getTextureUnits(),v.push(S),at.multiplyMatrices(U.projectionMatrix,U.matrixWorldInverse),et.setFromProjectionMatrix(at,Si,U.reversedDepth),rt=this.localClippingEnabled,st=Ut.init(this.clippingPlanes,rt),E=xt.get(b,R.length),E.init(),R.push(E),It.enabled===!0&&It.isPresenting===!0){let Tt=P.xr.getDepthSensingMesh();Tt!==null&&ol(Tt,U,-1/0,P.sortObjects)}ol(b,U,0,P.sortObjects),E.finish(),I!==null&&I.updateLights(S.state.lightsArray),P.sortObjects===!0&&E.sort(vt,Vt),qt=It.enabled===!1||It.isPresenting===!1||It.hasDepthSensing()===!1,qt&&Zt.addToRenderList(E,b),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),st===!0&&Ut.beginShadows();let H=S.state.shadowsArray;if(zt.render(H,b,U),st===!0&&Ut.endShadows(),(z&&T.hasRenderPass())===!1){let Tt=E.opaque,yt=E.transmissive;if(S.setupLights(),U.isArrayCamera){let Ct=U.cameras;if(yt.length>0)for(let Lt=0,Jt=Ct.length;Lt<Jt;Lt++){let ie=Ct[Lt];Kc(Tt,yt,b,ie)}qt&&Zt.render(b);for(let Lt=0,Jt=Ct.length;Lt<Jt;Lt++){let ie=Ct[Lt];Jc(E,b,ie,ie.viewport)}}else yt.length>0&&Kc(Tt,yt,b,U),qt&&Zt.render(b),Jc(E,b,U)}K!==null&&W===0&&($.updateMultisampleRenderTarget(K),$.updateRenderTargetMipmap(K)),z&&T.end(P),b.isScene===!0&&b.onAfterRender(P,b,U),bt.resetDefaultState(),q=-1,Q=null,v.pop(),v.length>0?(S=v[v.length-1],$.setTextureUnits(S.state.textureUnits),st===!0&&Ut.setGlobalState(P.clippingPlanes,S.state.camera)):S=null,R.pop(),R.length>0?E=R[R.length-1]:E=null,I!==null&&I.renderEnd()};function ol(b,U,X,z){if(b.visible===!1)return;if(b.layers.test(U.layers)){if(b.isGroup)X=b.renderOrder;else if(b.isLOD)b.autoUpdate===!0&&b.update(U);else if(b.isLightProbeGrid)S.pushLightProbeGrid(b);else if(b.isLight)S.pushLight(b),b.castShadow&&S.pushShadow(b);else if(b.isSprite){if(!b.frustumCulled||b.intersectsFrustum(et)){z&&Bt.setFromMatrixPosition(b.matrixWorld).applyMatrix4(at);let Tt=j.update(b),yt=b.material;yt.visible&&E.push(b,Tt,yt,X,Bt.z,null,U)}}else if((b.isMesh||b.isLine||b.isPoints)&&(!b.frustumCulled||b.intersectsFrustum(et))){let Tt=j.update(b),yt=b.material;if(z&&(b.boundingSphere!==void 0?(b.boundingSphere===null&&b.computeBoundingSphere(),Bt.copy(b.boundingSphere.center)):(Tt.boundingSphere===null&&Tt.computeBoundingSphere(),Bt.copy(Tt.boundingSphere.center)),Bt.applyMatrix4(b.matrixWorld).applyMatrix4(at)),Array.isArray(yt)){let Ct=Tt.groups;for(let Lt=0,Jt=Ct.length;Lt<Jt;Lt++){let ie=Ct[Lt],Pt=yt[ie.materialIndex];Pt&&Pt.visible&&E.push(b,Tt,Pt,X,Bt.z,ie,U)}}else yt.visible&&E.push(b,Tt,yt,X,Bt.z,null,U)}}let Mt=b.children;for(let Tt=0,yt=Mt.length;Tt<yt;Tt++)ol(Mt[Tt],U,X,z)}function Jc(b,U,X,z){let{opaque:H,transmissive:Mt,transparent:Tt}=b;S.setupLightsView(X),st===!0&&Ut.setGlobalState(P.clippingPlanes,X),z&&_.viewport(it.copy(z)),H.length>0&&Dr(H,U,X),Mt.length>0&&Dr(Mt,U,X),Tt.length>0&&Dr(Tt,U,X),_.buffers.depth.setTest(!0),_.buffers.depth.setMask(!0),_.buffers.color.setMask(!0),_.setPolygonOffset(!1)}function Kc(b,U,X,z){if((X.isScene===!0?X.overrideMaterial:null)!==null)return;if(S.state.transmissionRenderTarget[z.id]===void 0){let Pt=ee.has("EXT_color_buffer_half_float")||ee.has("EXT_color_buffer_float");S.state.transmissionRenderTarget[z.id]=new ii(1,1,{generateMipmaps:!0,type:Pt?Ai:si,minFilter:pn,samples:Math.max(4,A.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:ne.workingColorSpace})}let Mt=S.state.transmissionRenderTarget[z.id],Tt=z.viewport||it;Mt.setSize(Tt.z*P.transmissionResolutionScale,Tt.w*P.transmissionResolutionScale);let yt=P.getRenderTarget(),Ct=P.getActiveCubeFace(),Lt=P.getActiveMipmapLevel();P.setRenderTarget(Mt),P.getClearColor(le),te=P.getClearAlpha(),te<1&&P.setClearColor(16777215,.5),P.clear(),qt&&Zt.render(X);let Jt=P.toneMapping;P.toneMapping=wi;let ie=z.viewport;if(z.viewport!==void 0&&(z.viewport=void 0),S.setupLightsView(z),st===!0&&Ut.setGlobalState(P.clippingPlanes,z),Dr(b,X,z),$.updateMultisampleRenderTarget(Mt),$.updateRenderTargetMipmap(Mt),ee.has("WEBGL_multisampled_render_to_texture")===!1){let Pt=!1;for(let ue=0,Ie=U.length;ue<Ie;ue++){let ye=U[ue],{object:xe,geometry:qe,material:wt,group:je}=ye;if(wt.side===Pe&&xe.layers.test(z.layers)){let ae=wt.side;wt.side=Ve,wt.needsUpdate=!0,jc(xe,X,z,qe,wt,je),wt.side=ae,wt.needsUpdate=!0,Pt=!0}}Pt===!0&&($.updateMultisampleRenderTarget(Mt),$.updateRenderTargetMipmap(Mt))}P.setRenderTarget(yt,Ct,Lt),P.setClearColor(le,te),ie!==void 0&&(z.viewport=ie),P.toneMapping=Jt}function Dr(b,U,X){let z=U.isScene===!0?U.overrideMaterial:null;for(let H=0,Mt=b.length;H<Mt;H++){let Tt=b[H],{object:yt,geometry:Ct,group:Lt}=Tt,Jt=Tt.material;Jt.allowOverride===!0&&z!==null&&(Jt=z),yt.layers.test(X.layers)&&jc(yt,U,X,Ct,Jt,Lt)}}function jc(b,U,X,z,H,Mt){I!==null&&H.isNodeMaterial&&I.setObject(b,H),b.onBeforeRender(P,U,X,z,H,Mt),b.modelViewMatrix.multiplyMatrices(X.matrixWorldInverse,b.matrixWorld),b.normalMatrix.getNormalMatrix(b.modelViewMatrix),H.onBeforeRender(P,U,X,z,b,Mt),H.transparent===!0&&H.side===Pe&&H.forceSinglePass===!1?(H.side=Ve,H.needsUpdate=!0,P.renderBufferDirect(X,U,z,H,b,Mt),H.side=dn,H.needsUpdate=!0,P.renderBufferDirect(X,U,z,H,b,Mt),H.side=Pe):P.renderBufferDirect(X,U,z,H,b,Mt),b.onAfterRender(P,U,X,z,H,Mt)}function Nr(b,U,X){U.isScene!==!0&&(U=Ot);let z=G.get(b),H=S.state.lights,Mt=S.state.shadowsArray,Tt=H.state.version,yt=ft.getParameters(b,H.state,Mt,U,X,S.state.lightProbeGridArray),Ct=ft.getProgramCacheKey(yt),Lt=z.programs;z.environment=b.isMeshStandardMaterial||b.isMeshLambertMaterial||b.isMeshPhongMaterial?U.environment:null,z.fog=U.fog;let Jt=b.isMeshStandardMaterial||b.isMeshLambertMaterial&&!b.envMap||b.isMeshPhongMaterial&&!b.envMap;z.envMap=ot.get(b.envMap||z.environment,Jt),z.envMapRotation=z.environment!==null&&b.envMap===null?U.environmentRotation:b.envMapRotation,Lt===void 0&&(b.addEventListener("dispose",Ri),Lt=new Map,z.programs=Lt);let ie=Lt.get(Ct);if(ie!==void 0){if(z.currentProgram===ie&&z.lightsStateVersion===Tt)return th(b,yt),ie}else yt.uniforms=ft.getUniforms(b),I!==null&&b.isNodeMaterial&&I.build(b,X,yt),b.onBeforeCompile(yt,P),ie=ft.acquireProgram(yt,Ct),Lt.set(Ct,ie),z.uniforms=yt.uniforms;let Pt=z.uniforms;return(!b.isShaderMaterial&&!b.isRawShaderMaterial||b.clipping===!0)&&(Pt.clippingPlanes=Ut.uniform),th(b,yt),z.needsLights=Cd(b),z.lightsStateVersion=Tt,z.needsLights&&(Pt.ambientLightColor.value=H.state.ambient,Pt.lightProbe.value=H.state.probe,Pt.sunLights.value=H.state.sun,Pt.sunLightShadows.value=H.state.sunShadow,Pt.directionalLights.value=H.state.directional,Pt.directionalLightShadows.value=H.state.directionalShadow,Pt.spotLights.value=H.state.spot,Pt.spotLightShadows.value=H.state.spotShadow,Pt.rectAreaLights.value=H.state.rectArea,Pt.ltc_1.value=H.state.rectAreaLTC1,Pt.ltc_2.value=H.state.rectAreaLTC2,Pt.pointLights.value=H.state.point,Pt.pointLightShadows.value=H.state.pointShadow,Pt.hemisphereLights.value=H.state.hemi,Pt.sunShadowMatrix.value=H.state.sunShadowMatrix,Pt.sunShadowCascade.value=H.state.sunShadowCascade,Pt.directionalShadowMatrix.value=H.state.directionalShadowMatrix,Pt.spotLightMatrix.value=H.state.spotLightMatrix,Pt.spotLightMap.value=H.state.spotLightMap,Pt.pointShadowMatrix.value=H.state.pointShadowMatrix),z.lightProbeGrid=S.state.lightProbeGridArray.length>0,z.currentProgram=ie,z.uniformsList=null,ie}function Qc(b){if(b.uniformsList===null){let U=b.currentProgram.getUniforms();b.uniformsList=vs.seqWithValue(U.seq,b.uniforms)}return b.uniformsList}function th(b,U){let X=G.get(b);X.outputColorSpace=U.outputColorSpace,X.batching=U.batching,X.batchingColor=U.batchingColor,X.instancing=U.instancing,X.instancingColor=U.instancingColor,X.instancingMorph=U.instancingMorph,X.skinning=U.skinning,X.morphTargets=U.morphTargets,X.morphNormals=U.morphNormals,X.morphColors=U.morphColors,X.morphTargetsCount=U.morphTargetsCount,X.numClippingPlanes=U.numClippingPlanes,X.numIntersection=U.numClipIntersection,X.vertexAlphas=U.vertexAlphas,X.vertexTangents=U.vertexTangents,X.toneMapping=U.toneMapping}function Td(b,U){if(b.length===0)return null;if(b.length===1)return b[0].texture!==null?b[0]:null;x.setFromMatrixPosition(U.matrixWorld);for(let X=0,z=b.length;X<z;X++){let H=b[X];if(H.texture!==null&&H.boundingBox.containsPoint(x))return H}return null}function Ad(b,U,X,z,H){U.isScene!==!0&&(U=Ot),$.resetTextureUnits();let Mt=U.fog,Tt=z.isMeshStandardMaterial||z.isMeshLambertMaterial||z.isMeshPhongMaterial?U.environment:null,yt=K===null?P.outputColorSpace:K.isXRRenderTarget===!0?K.texture.colorSpace:ne.workingColorSpace,Ct=z.isMeshStandardMaterial||z.isMeshLambertMaterial&&!z.envMap||z.isMeshPhongMaterial&&!z.envMap,Lt=ot.get(z.envMap||Tt,Ct),Jt=z.vertexColors===!0&&!!X.attributes.color&&X.attributes.color.itemSize===4,ie=!!X.attributes.tangent&&(!!z.normalMap||z.anisotropy>0),Pt=!!X.morphAttributes.position,ue=!!X.morphAttributes.normal,Ie=!!X.morphAttributes.color,ye=wi;z.toneMapped&&(K===null||K.isXRRenderTarget===!0)&&(ye=P.toneMapping);let xe=X.morphAttributes.position||X.morphAttributes.normal||X.morphAttributes.color,qe=xe!==void 0?xe.length:0,wt=G.get(z),je=S.state.lights;if(st===!0&&(rt===!0||b!==Q)){let ve=b===Q&&z.id===q;Ut.setState(z,b,ve)}let ae=!1;z.version===wt.__version?(wt.needsLights&&wt.lightsStateVersion!==je.state.version||wt.outputColorSpace!==yt||H.isBatchedMesh&&wt.batching===!1||!H.isBatchedMesh&&wt.batching===!0||H.isBatchedMesh&&wt.batchingColor===!0&&H._colorsTexture===null||H.isBatchedMesh&&wt.batchingColor===!1&&H._colorsTexture!==null||H.isInstancedMesh&&wt.instancing===!1||!H.isInstancedMesh&&wt.instancing===!0||H.isSkinnedMesh&&wt.skinning===!1||!H.isSkinnedMesh&&wt.skinning===!0||H.isInstancedMesh&&wt.instancingColor===!0&&H.instanceColor===null||H.isInstancedMesh&&wt.instancingColor===!1&&H.instanceColor!==null||H.isInstancedMesh&&wt.instancingMorph===!0&&H.morphTexture===null||H.isInstancedMesh&&wt.instancingMorph===!1&&H.morphTexture!==null||wt.envMap!==Lt||z.fog===!0&&wt.fog!==Mt||wt.numClippingPlanes!==void 0&&(wt.numClippingPlanes!==Ut.numPlanes||wt.numIntersection!==Ut.numIntersection)||wt.vertexAlphas!==Jt||wt.vertexTangents!==ie||wt.morphTargets!==Pt||wt.morphNormals!==ue||wt.morphColors!==Ie||wt.toneMapping!==ye||wt.morphTargetsCount!==qe||!!wt.lightProbeGrid!=S.state.lightProbeGridArray.length>0)&&(ae=!0):(ae=!0,wt.__version=z.version);let di=wt.currentProgram;ae===!0&&(di=Nr(z,U,H),I&&z.isNodeMaterial&&I.onUpdateProgram(z,di,wt));let Ci=!1,Ji=!1,On=!1,me=di.getUniforms(),Ce=wt.uniforms;if(_.useProgram(di.program)&&(Ci=!0,Ji=!0,On=!0),z.id!==q&&(q=z.id,Ji=!0),wt.needsLights){let ve=Td(S.state.lightProbeGridArray,H);wt.lightProbeGrid!==ve&&(wt.lightProbeGrid=ve,Ji=!0)}if(Ci||Q!==b){_.buffers.depth.getReversed()&&b.reversedDepth!==!0&&(b._reversedDepth=!0,b.updateProjectionMatrix()),me.setValue(N,"projectionMatrix",b.projectionMatrix),me.setValue(N,"viewMatrix",b.matrixWorldInverse);let ji=me.map.cameraPosition;ji!==void 0&&ji.setValue(N,ut.setFromMatrixPosition(b.matrixWorld)),A.logarithmicDepthBuffer&&me.setValue(N,"logDepthBufFC",2/(Math.log(b.far+1)/Math.LN2)),(z.isMeshPhongMaterial||z.isMeshToonMaterial||z.isMeshLambertMaterial||z.isMeshBasicMaterial||z.isMeshStandardMaterial||z.isShaderMaterial)&&me.setValue(N,"isOrthographic",b.isOrthographicCamera===!0),Q!==b&&(Q=b,Ji=!0,On=!0)}if(wt.needsLights&&(je.state.sunShadowMap.length>0&&me.setValue(N,"sunShadowMap",je.state.sunShadowMap,$),je.state.directionalShadowMap.length>0&&me.setValue(N,"directionalShadowMap",je.state.directionalShadowMap,$),je.state.spotShadowMap.length>0&&me.setValue(N,"spotShadowMap",je.state.spotShadowMap,$),je.state.pointShadowMap.length>0&&me.setValue(N,"pointShadowMap",je.state.pointShadowMap,$)),H.isSkinnedMesh){me.setOptional(N,H,"bindMatrix"),me.setOptional(N,H,"bindMatrixInverse");let ve=H.skeleton;ve&&(ve.boneTexture===null&&ve.computeBoneTexture(),me.setValue(N,"boneTexture",ve.boneTexture,$))}H.isBatchedMesh&&(me.setOptional(N,H,"batchingTexture"),me.setValue(N,"batchingTexture",H._matricesTexture,$),me.setOptional(N,H,"batchingIdTexture"),me.setValue(N,"batchingIdTexture",H._indirectTexture,$),me.setOptional(N,H,"batchingColorTexture"),H._colorsTexture!==null&&me.setValue(N,"batchingColorTexture",H._colorsTexture,$));let Ki=X.morphAttributes;if((Ki.position!==void 0||Ki.normal!==void 0||Ki.color!==void 0)&&F.update(H,X,di),(Ji||wt.receiveShadow!==H.receiveShadow)&&(wt.receiveShadow=H.receiveShadow,me.setValue(N,"receiveShadow",H.receiveShadow)),(z.isMeshStandardMaterial||z.isMeshLambertMaterial||z.isMeshPhongMaterial)&&z.envMap===null&&U.environment!==null&&(Ce.envMapIntensity.value=U.environmentIntensity),Ce.dfgLUT!==void 0&&(Ce.dfgLUT.value=Rx()),Ji){if(me.setValue(N,"toneMappingExposure",P.toneMappingExposure),wt.needsLights&&Rd(Ce,On),Mt&&z.fog===!0&&Nt.refreshFogUniforms(Ce,Mt),Nt.refreshMaterialUniforms(Ce,z,tt,Z,S.state.transmissionRenderTarget[b.id]),wt.needsLights&&wt.lightProbeGrid){let ve=wt.lightProbeGrid;Ce.probesSH.value=ve.texture,Ce.probesMin.value.copy(ve.boundingBox.min),Ce.probesMax.value.copy(ve.boundingBox.max),Ce.probesResolution.value.copy(ve.resolution)}vs.upload(N,Qc(wt),Ce,$)}if(z.isShaderMaterial&&z.uniformsNeedUpdate===!0&&(vs.upload(N,Qc(wt),Ce,$),z.uniformsNeedUpdate=!1),z.isSpriteMaterial&&me.setValue(N,"center",H.center),me.setValue(N,"modelViewMatrix",H.modelViewMatrix),me.setValue(N,"normalMatrix",H.normalMatrix),me.setValue(N,"modelMatrix",H.matrixWorld),z.uniformsGroups!==void 0){let ve=z.uniformsGroups;for(let ji=0,kn=ve.length;ji<kn;ji++){let ih=ve[ji];nt.update(ih,di),nt.bind(ih,di)}}return di}function Rd(b,U){b.ambientLightColor.needsUpdate=U,b.lightProbe.needsUpdate=U,b.sunLights.needsUpdate=U,b.sunLightShadows.needsUpdate=U,b.directionalLights.needsUpdate=U,b.directionalLightShadows.needsUpdate=U,b.pointLights.needsUpdate=U,b.pointLightShadows.needsUpdate=U,b.spotLights.needsUpdate=U,b.spotLightShadows.needsUpdate=U,b.rectAreaLights.needsUpdate=U,b.hemisphereLights.needsUpdate=U}function Cd(b){return b.isMeshLambertMaterial||b.isMeshToonMaterial||b.isMeshPhongMaterial||b.isMeshStandardMaterial||b.isShadowMaterial||b.isShaderMaterial&&b.lights===!0}this.getActiveCubeFace=function(){return V},this.getActiveMipmapLevel=function(){return W},this.getRenderTarget=function(){return K},this.setRenderTargetTextures=function(b,U,X){let z=G.get(b);z.__autoAllocateDepthBuffer=b.resolveDepthBuffer===!1,z.__autoAllocateDepthBuffer===!1&&(z.__useRenderToTexture=!1),G.get(b.texture).__webglTexture=U,G.get(b.depthTexture).__webglTexture=z.__autoAllocateDepthBuffer?void 0:X,z.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(b,U){let X=G.get(b);X.__webglFramebuffer=U,X.__useDefaultFramebuffer=U===void 0},this.setRenderTarget=function(b,U=0,X=0){K=b,V=U,W=X;let z=null,H=!1,Mt=!1;if(b){let yt=G.get(b);if(yt.__useDefaultFramebuffer!==void 0){_.bindFramebuffer(N.FRAMEBUFFER,yt.__webglFramebuffer),it.copy(b.viewport),Dt.copy(b.scissor),At=b.scissorTest,_.viewport(it),_.scissor(Dt),_.setScissorTest(At),q=-1;return}else if(yt.__webglFramebuffer===void 0)$.setupRenderTarget(b);else if(yt.__hasExternalTextures)$.rebindTextures(b,G.get(b.texture).__webglTexture,G.get(b.depthTexture).__webglTexture);else if(b.depthBuffer){let Jt=b.depthTexture;if(yt.__boundDepthTexture!==Jt){if(Jt!==null&&G.has(Jt)&&(b.width!==Jt.image.width||b.height!==Jt.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");$.setupDepthRenderbuffer(b)}}let Ct=b.texture;(Ct.isData3DTexture||Ct.isDataArrayTexture||Ct.isCompressedArrayTexture)&&(Mt=!0);let Lt=G.get(b).__webglFramebuffer;b.isWebGLCubeRenderTarget?(Array.isArray(Lt[U])?z=Lt[U][X]:z=Lt[U],H=!0):b.samples>0&&$.useMultisampledRTT(b)===!1?z=G.get(b).__webglMultisampledFramebuffer:Array.isArray(Lt)?z=Lt[X]:z=Lt,it.copy(b.viewport),Dt.copy(b.scissor),At=b.scissorTest}else it.copy(St).multiplyScalar(tt).floor(),Dt.copy(Xt).multiplyScalar(tt).floor(),At=pe;if(X!==0&&(z=O),_.bindFramebuffer(N.FRAMEBUFFER,z)&&_.drawBuffers(b,z),_.viewport(it),_.scissor(Dt),_.setScissorTest(At),H){let yt=G.get(b.texture);N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_CUBE_MAP_POSITIVE_X+U,yt.__webglTexture,X)}else if(Mt){let yt=U;for(let Ct=0;Ct<b.textures.length;Ct++){let Lt=G.get(b.textures[Ct]);N.framebufferTextureLayer(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0+Ct,Lt.__webglTexture,X,yt)}}else if(b!==null&&X!==0){let yt=G.get(b.texture);N.framebufferTexture2D(N.FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,yt.__webglTexture,X)}q=-1};function eh(b){let U=G.get(b);return(U.__readFormat!==b.format||U.__readType!==b.type)&&(U.__readFormat=b.format,U.__readType=b.type,U.__formatReadable=A.textureFormatReadable(b.format),U.__typeReadable=A.textureTypeReadable(b.type)),U}this.readRenderTargetPixels=function(b,U,X,z,H,Mt,Tt,yt=0){if(!(b&&b.isWebGLRenderTarget)){Wt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ct=G.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&Tt!==void 0&&(Ct=Ct[Tt]),Ct){_.bindFramebuffer(N.FRAMEBUFFER,Ct);try{let Lt=b.textures[yt],Jt=Lt.format,ie=Lt.type;b.textures.length>1&&N.readBuffer(N.COLOR_ATTACHMENT0+yt);let Pt=eh(Lt);if(Pt.__formatReadable===!1){Wt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Pt.__typeReadable===!1){Wt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}U>=0&&U<=b.width-z&&X>=0&&X<=b.height-H&&N.readPixels(U,X,z,H,gt.convert(Jt),gt.convert(ie),Mt)}finally{let Lt=K!==null?G.get(K).__webglFramebuffer:null;_.bindFramebuffer(N.FRAMEBUFFER,Lt)}}},this.readRenderTargetPixelsAsync=async function(b,U,X,z,H,Mt,Tt,yt=0){if(!(b&&b.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ct=G.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&Tt!==void 0&&(Ct=Ct[Tt]),Ct)if(U>=0&&U<=b.width-z&&X>=0&&X<=b.height-H){_.bindFramebuffer(N.FRAMEBUFFER,Ct);let Lt=b.textures[yt],Jt=Lt.format,ie=Lt.type;b.textures.length>1&&N.readBuffer(N.COLOR_ATTACHMENT0+yt);let Pt=eh(Lt);if(Pt.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Pt.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let ue=N.createBuffer();N.bindBuffer(N.PIXEL_PACK_BUFFER,ue),N.bufferData(N.PIXEL_PACK_BUFFER,Mt.byteLength,N.STREAM_READ),N.readPixels(U,X,z,H,gt.convert(Jt),gt.convert(ie),0),N.bindBuffer(N.PIXEL_PACK_BUFFER,null);let Ie=K!==null?G.get(K).__webglFramebuffer:null;_.bindFramebuffer(N.FRAMEBUFFER,Ie);let ye=N.fenceSync(N.SYNC_GPU_COMMANDS_COMPLETE,0);return N.flush(),await gu(N,ye,4),N.bindBuffer(N.PIXEL_PACK_BUFFER,ue),N.getBufferSubData(N.PIXEL_PACK_BUFFER,0,Mt),N.bindBuffer(N.PIXEL_PACK_BUFFER,null),N.deleteBuffer(ue),N.deleteSync(ye),Mt}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(b,U=null,X=0){let z=Math.pow(2,-X),H=Math.floor(b.image.width*z),Mt=Math.floor(b.image.height*z),Tt=U!==null?U.x:0,yt=U!==null?U.y:0;$.setTexture2D(b,0),N.copyTexSubImage2D(N.TEXTURE_2D,X,0,0,Tt,yt,H,Mt),_.unbindTexture()},this.copyTextureToTexture=function(b,U,X=null,z=null,H=0,Mt=0){let Tt,yt,Ct,Lt,Jt,ie,Pt,ue,Ie,ye=b.isCompressedTexture?b.mipmaps[Mt]:b.image;if(X!==null)Tt=X.max.x-X.min.x,yt=X.max.y-X.min.y,Ct=X.isBox3?X.max.z-X.min.z:1,Lt=X.min.x,Jt=X.min.y,ie=X.isBox3?X.min.z:0;else{let Ce=Math.pow(2,-H);Tt=Math.floor(ye.width*Ce),yt=Math.floor(ye.height*Ce),b.isDataArrayTexture?Ct=ye.depth:b.isData3DTexture?Ct=Math.floor(ye.depth*Ce):Ct=1,Lt=0,Jt=0,ie=0}z!==null?(Pt=z.x,ue=z.y,Ie=z.z):(Pt=0,ue=0,Ie=0);let xe=gt.convert(U.format),qe=gt.convert(U.type),wt;U.isData3DTexture?($.setTexture3D(U,0),wt=N.TEXTURE_3D):U.isDataArrayTexture||U.isCompressedArrayTexture?($.setTexture2DArray(U,0),wt=N.TEXTURE_2D_ARRAY):($.setTexture2D(U,0),wt=N.TEXTURE_2D),_.activeTexture(N.TEXTURE0),_.pixelStorei(N.UNPACK_FLIP_Y_WEBGL,U.flipY),_.pixelStorei(N.UNPACK_PREMULTIPLY_ALPHA_WEBGL,U.premultiplyAlpha),_.pixelStorei(N.UNPACK_ALIGNMENT,U.unpackAlignment);let je=_.getParameter(N.UNPACK_ROW_LENGTH),ae=_.getParameter(N.UNPACK_IMAGE_HEIGHT),di=_.getParameter(N.UNPACK_SKIP_PIXELS),Ci=_.getParameter(N.UNPACK_SKIP_ROWS),Ji=_.getParameter(N.UNPACK_SKIP_IMAGES);_.pixelStorei(N.UNPACK_ROW_LENGTH,ye.width),_.pixelStorei(N.UNPACK_IMAGE_HEIGHT,ye.height),_.pixelStorei(N.UNPACK_SKIP_PIXELS,Lt),_.pixelStorei(N.UNPACK_SKIP_ROWS,Jt),_.pixelStorei(N.UNPACK_SKIP_IMAGES,ie);let On=b.isDataArrayTexture||b.isData3DTexture,me=U.isDataArrayTexture||U.isData3DTexture;if(b.isDepthTexture){let Ce=G.get(b),Ki=G.get(U),ve=G.get(Ce.__renderTarget),ji=G.get(Ki.__renderTarget);_.bindFramebuffer(N.READ_FRAMEBUFFER,ve.__webglFramebuffer),_.bindFramebuffer(N.DRAW_FRAMEBUFFER,ji.__webglFramebuffer);for(let kn=0;kn<Ct;kn++)On&&(N.framebufferTextureLayer(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,G.get(b).__webglTexture,H,ie+kn),N.framebufferTextureLayer(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,G.get(U).__webglTexture,Mt,Ie+kn)),N.blitFramebuffer(Lt,Jt,Tt,yt,Pt,ue,Tt,yt,N.DEPTH_BUFFER_BIT,N.NEAREST);_.bindFramebuffer(N.READ_FRAMEBUFFER,null),_.bindFramebuffer(N.DRAW_FRAMEBUFFER,null)}else if(H!==0||b.isRenderTargetTexture||G.has(b)){let Ce=G.get(b),Ki=G.get(U);_.bindFramebuffer(N.READ_FRAMEBUFFER,L),_.bindFramebuffer(N.DRAW_FRAMEBUFFER,k);for(let ve=0;ve<Ct;ve++)On?N.framebufferTextureLayer(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,Ce.__webglTexture,H,ie+ve):N.framebufferTexture2D(N.READ_FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,Ce.__webglTexture,H),me?N.framebufferTextureLayer(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,Ki.__webglTexture,Mt,Ie+ve):N.framebufferTexture2D(N.DRAW_FRAMEBUFFER,N.COLOR_ATTACHMENT0,N.TEXTURE_2D,Ki.__webglTexture,Mt),H!==0?N.blitFramebuffer(Lt,Jt,Tt,yt,Pt,ue,Tt,yt,N.COLOR_BUFFER_BIT,N.NEAREST):me?N.copyTexSubImage3D(wt,Mt,Pt,ue,Ie+ve,Lt,Jt,Tt,yt):N.copyTexSubImage2D(wt,Mt,Pt,ue,Lt,Jt,Tt,yt);_.bindFramebuffer(N.READ_FRAMEBUFFER,null),_.bindFramebuffer(N.DRAW_FRAMEBUFFER,null)}else me?b.isDataTexture||b.isData3DTexture?N.texSubImage3D(wt,Mt,Pt,ue,Ie,Tt,yt,Ct,xe,qe,ye.data):U.isCompressedArrayTexture?N.compressedTexSubImage3D(wt,Mt,Pt,ue,Ie,Tt,yt,Ct,xe,ye.data):N.texSubImage3D(wt,Mt,Pt,ue,Ie,Tt,yt,Ct,xe,qe,ye):b.isDataTexture?N.texSubImage2D(N.TEXTURE_2D,Mt,Pt,ue,Tt,yt,xe,qe,ye.data):b.isCompressedTexture?N.compressedTexSubImage2D(N.TEXTURE_2D,Mt,Pt,ue,ye.width,ye.height,xe,ye.data):N.texSubImage2D(N.TEXTURE_2D,Mt,Pt,ue,Tt,yt,xe,qe,ye);_.pixelStorei(N.UNPACK_ROW_LENGTH,je),_.pixelStorei(N.UNPACK_IMAGE_HEIGHT,ae),_.pixelStorei(N.UNPACK_SKIP_PIXELS,di),_.pixelStorei(N.UNPACK_SKIP_ROWS,Ci),_.pixelStorei(N.UNPACK_SKIP_IMAGES,Ji),Mt===0&&U.generateMipmaps&&N.generateMipmap(wt),_.unbindTexture()},this.initRenderTarget=function(b){G.get(b).__webglFramebuffer===void 0&&$.setupRenderTarget(b)},this.initTexture=function(b){b.isCubeTexture?$.setTextureCube(b,0):b.isData3DTexture?$.setTexture3D(b,0):b.isDataArrayTexture||b.isCompressedArrayTexture?$.setTexture2DArray(b,0):$.setTexture2D(b,0),_.unbindTexture()},this.resetState=function(){V=0,W=0,K=null,_.reset(),bt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Si}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=ne._getDrawingBufferColorSpace(t),e.unpackColorSpace=ne._getUnpackColorSpace()}};var hi={DE:{name:"\u0413\u0435\u0440\u043C\u0430\u043D\u0438\u044F",flag:"\u{1F1E9}\u{1F1EA}",fuel:1.74,speed:80},NL:{name:"\u041D\u0438\u0434\u0435\u0440\u043B\u0430\u043D\u0434\u044B",flag:"\u{1F1F3}\u{1F1F1}",fuel:1.96,speed:80},BE:{name:"\u0411\u0435\u043B\u044C\u0433\u0438\u044F",flag:"\u{1F1E7}\u{1F1EA}",fuel:1.72,speed:80},LU:{name:"\u041B\u044E\u043A\u0441\u0435\u043C\u0431\u0443\u0440\u0433",flag:"\u{1F1F1}\u{1F1FA}",fuel:1.54,speed:80},FR:{name:"\u0424\u0440\u0430\u043D\u0446\u0438\u044F",flag:"\u{1F1EB}\u{1F1F7}",fuel:1.86,speed:80},ES:{name:"\u0418\u0441\u043F\u0430\u043D\u0438\u044F",flag:"\u{1F1EA}\u{1F1F8}",fuel:1.59,speed:80},PT:{name:"\u041F\u043E\u0440\u0442\u0443\u0433\u0430\u043B\u0438\u044F",flag:"\u{1F1F5}\u{1F1F9}",fuel:1.67,speed:80},IT:{name:"\u0418\u0442\u0430\u043B\u0438\u044F",flag:"\u{1F1EE}\u{1F1F9}",fuel:1.81,speed:80},CH:{name:"\u0428\u0432\u0435\u0439\u0446\u0430\u0440\u0438\u044F",flag:"\u{1F1E8}\u{1F1ED}",fuel:1.88,speed:80},AT:{name:"\u0410\u0432\u0441\u0442\u0440\u0438\u044F",flag:"\u{1F1E6}\u{1F1F9}",fuel:1.7,speed:80},CZ:{name:"\u0427\u0435\u0445\u0438\u044F",flag:"\u{1F1E8}\u{1F1FF}",fuel:1.56,speed:80},PL:{name:"\u041F\u043E\u043B\u044C\u0448\u0430",flag:"\u{1F1F5}\u{1F1F1}",fuel:1.49,speed:80},DK:{name:"\u0414\u0430\u043D\u0438\u044F",flag:"\u{1F1E9}\u{1F1F0}",fuel:1.91,speed:80},SE:{name:"\u0428\u0432\u0435\u0446\u0438\u044F",flag:"\u{1F1F8}\u{1F1EA}",fuel:1.79,speed:80},NO:{name:"\u041D\u043E\u0440\u0432\u0435\u0433\u0438\u044F",flag:"\u{1F1F3}\u{1F1F4}",fuel:2.09,speed:80},FI:{name:"\u0424\u0438\u043D\u043B\u044F\u043D\u0434\u0438\u044F",flag:"\u{1F1EB}\u{1F1EE}",fuel:1.84,speed:80},EE:{name:"\u042D\u0441\u0442\u043E\u043D\u0438\u044F",flag:"\u{1F1EA}\u{1F1EA}",fuel:1.61,speed:80},LV:{name:"\u041B\u0430\u0442\u0432\u0438\u044F",flag:"\u{1F1F1}\u{1F1FB}",fuel:1.55,speed:80},LT:{name:"\u041B\u0438\u0442\u0432\u0430",flag:"\u{1F1F1}\u{1F1F9}",fuel:1.52,speed:80},HU:{name:"\u0412\u0435\u043D\u0433\u0440\u0438\u044F",flag:"\u{1F1ED}\u{1F1FA}",fuel:1.61,speed:80},SK:{name:"\u0421\u043B\u043E\u0432\u0430\u043A\u0438\u044F",flag:"\u{1F1F8}\u{1F1F0}",fuel:1.6,speed:80},RO:{name:"\u0420\u0443\u043C\u044B\u043D\u0438\u044F",flag:"\u{1F1F7}\u{1F1F4}",fuel:1.44,speed:80},HR:{name:"\u0425\u043E\u0440\u0432\u0430\u0442\u0438\u044F",flag:"\u{1F1ED}\u{1F1F7}",fuel:1.56,speed:80},SI:{name:"\u0421\u043B\u043E\u0432\u0435\u043D\u0438\u044F",flag:"\u{1F1F8}\u{1F1EE}",fuel:1.6,speed:80},RS:{name:"\u0421\u0435\u0440\u0431\u0438\u044F",flag:"\u{1F1F7}\u{1F1F8}",fuel:1.54,speed:80},BG:{name:"\u0411\u043E\u043B\u0433\u0430\u0440\u0438\u044F",flag:"\u{1F1E7}\u{1F1EC}",fuel:1.34,speed:80}},Cx=[["berlin","\u0411\u0435\u0440\u043B\u0438\u043D","DE",52.52,13.4,3],["hamburg","\u0413\u0430\u043C\u0431\u0443\u0440\u0433","DE",53.55,9.99,3],["munich","\u041C\u044E\u043D\u0445\u0435\u043D","DE",48.14,11.58,3],["cologne","\u041A\u0451\u043B\u044C\u043D","DE",50.94,6.96,3],["frankfurt","\u0424\u0440\u0430\u043D\u043A\u0444\u0443\u0440\u0442","DE",50.11,8.68,3],["stuttgart","\u0428\u0442\u0443\u0442\u0433\u0430\u0440\u0442","DE",48.78,9.18,2],["dresden","\u0414\u0440\u0435\u0437\u0434\u0435\u043D","DE",51.05,13.74,2],["leipzig","\u041B\u0435\u0439\u043F\u0446\u0438\u0433","DE",51.34,12.37,2],["nuremberg","\u041D\u044E\u0440\u043D\u0431\u0435\u0440\u0433","DE",49.45,11.08,2],["hannover","\u0413\u0430\u043D\u043D\u043E\u0432\u0435\u0440","DE",52.37,9.73,2],["dortmund","\u0414\u043E\u0440\u0442\u043C\u0443\u043D\u0434","DE",51.51,7.47,2],["bremen","\u0411\u0440\u0435\u043C\u0435\u043D","DE",53.08,8.8,2],["kassel","\u041A\u0430\u0441\u0441\u0435\u043B\u044C","DE",51.31,9.49,1],["wurzburg","\u0412\u044E\u0440\u0446\u0431\u0443\u0440\u0433","DE",49.79,9.95,1],["mannheim","\u041C\u0430\u043D\u0433\u0435\u0439\u043C","DE",49.49,8.47,2],["rostock","\u0420\u043E\u0441\u0442\u043E\u043A","DE",54.09,12.1,1],["kiel","\u041A\u0438\u043B\u044C","DE",54.32,10.14,1],["freiburg","\u0424\u0440\u0430\u0439\u0431\u0443\u0440\u0433","DE",47.99,7.85,1],["regensburg","\u0420\u0435\u0433\u0435\u043D\u0441\u0431\u0443\u0440\u0433","DE",49.01,12.1,1],["magdeburg","\u041C\u0430\u0433\u0434\u0435\u0431\u0443\u0440\u0433","DE",52.12,11.63,1],["amsterdam","\u0410\u043C\u0441\u0442\u0435\u0440\u0434\u0430\u043C","NL",52.37,4.9,3],["rotterdam","\u0420\u043E\u0442\u0442\u0435\u0440\u0434\u0430\u043C","NL",51.92,4.48,3],["utrecht","\u0423\u0442\u0440\u0435\u0445\u0442","NL",52.09,5.12,2],["eindhoven","\u042D\u0439\u043D\u0434\u0445\u043E\u0432\u0435\u043D","NL",51.44,5.48,2],["groningen","\u0413\u0440\u043E\u043D\u0438\u043D\u0433\u0435\u043D","NL",53.22,6.57,1],["arnhem","\u0410\u0440\u043D\u0435\u043C","NL",51.98,5.91,1],["brussels","\u0411\u0440\u044E\u0441\u0441\u0435\u043B\u044C","BE",50.85,4.35,3],["antwerp","\u0410\u043D\u0442\u0432\u0435\u0440\u043F\u0435\u043D","BE",51.22,4.4,2],["ghent","\u0413\u0435\u043D\u0442","BE",51.05,3.72,1],["liege","\u041B\u044C\u0435\u0436","BE",50.63,5.57,1],["luxembourg","\u041B\u044E\u043A\u0441\u0435\u043C\u0431\u0443\u0440\u0433","LU",49.61,6.13,2],["paris","\u041F\u0430\u0440\u0438\u0436","FR",48.86,2.35,3],["lyon","\u041B\u0438\u043E\u043D","FR",45.76,4.84,3],["marseille","\u041C\u0430\u0440\u0441\u0435\u043B\u044C","FR",43.3,5.37,2],["bordeaux","\u0411\u043E\u0440\u0434\u043E","FR",44.84,-.58,2],["toulouse","\u0422\u0443\u043B\u0443\u0437\u0430","FR",43.6,1.44,2],["nantes","\u041D\u0430\u043D\u0442","FR",47.22,-1.55,2],["lille","\u041B\u0438\u043B\u043B\u044C","FR",50.63,3.06,2],["strasbourg","\u0421\u0442\u0440\u0430\u0441\u0431\u0443\u0440\u0433","FR",48.57,7.75,2],["nice","\u041D\u0438\u0446\u0446\u0430","FR",43.7,7.27,2],["rennes","\u0420\u0435\u043D\u043D","FR",48.11,-1.68,1],["dijon","\u0414\u0438\u0436\u043E\u043D","FR",47.32,5.04,1],["clermont","\u041A\u043B\u0435\u0440\u043C\u043E\u043D-\u0424\u0435\u0440\u0440\u0430\u043D","FR",45.78,3.08,1],["rouen","\u0420\u0443\u0430\u043D","FR",49.44,1.1,1],["madrid","\u041C\u0430\u0434\u0440\u0438\u0434","ES",40.42,-3.7,3],["barcelona","\u0411\u0430\u0440\u0441\u0435\u043B\u043E\u043D\u0430","ES",41.39,2.17,3],["valencia","\u0412\u0430\u043B\u0435\u043D\u0441\u0438\u044F","ES",39.47,-.38,2],["seville","\u0421\u0435\u0432\u0438\u043B\u044C\u044F","ES",37.39,-5.98,2],["zaragoza","\u0421\u0430\u0440\u0430\u0433\u043E\u0441\u0430","ES",41.65,-.88,2],["bilbao","\u0411\u0438\u043B\u044C\u0431\u0430\u043E","ES",43.26,-2.93,2],["malaga","\u041C\u0430\u043B\u0430\u0433\u0430","ES",36.72,-4.42,1],["valladolid","\u0412\u0430\u043B\u044C\u044F\u0434\u043E\u043B\u0438\u0434","ES",41.65,-4.72,1],["acoruna","\u041B\u0430-\u041A\u043E\u0440\u0443\u043D\u044C\u044F","ES",43.36,-8.41,1],["lisbon","\u041B\u0438\u0441\u0441\u0430\u0431\u043E\u043D","PT",38.72,-9.14,3],["porto","\u041F\u043E\u0440\u0442\u0443","PT",41.15,-8.61,2],["rome","\u0420\u0438\u043C","IT",41.9,12.5,3],["milan","\u041C\u0438\u043B\u0430\u043D","IT",45.46,9.19,3],["turin","\u0422\u0443\u0440\u0438\u043D","IT",45.07,7.69,2],["genoa","\u0413\u0435\u043D\u0443\u044F","IT",44.41,8.93,2],["bologna","\u0411\u043E\u043B\u043E\u043D\u044C\u044F","IT",44.49,11.34,2],["florence","\u0424\u043B\u043E\u0440\u0435\u043D\u0446\u0438\u044F","IT",43.77,11.26,2],["naples","\u041D\u0435\u0430\u043F\u043E\u043B\u044C","IT",40.85,14.27,2],["venice","\u0412\u0435\u043D\u0435\u0446\u0438\u044F","IT",45.44,12.32,2],["verona","\u0412\u0435\u0440\u043E\u043D\u0430","IT",45.44,10.99,1],["bari","\u0411\u0430\u0440\u0438","IT",41.12,16.87,1],["zurich","\u0426\u044E\u0440\u0438\u0445","CH",47.37,8.54,2],["basel","\u0411\u0430\u0437\u0435\u043B\u044C","CH",47.56,7.59,2],["geneva","\u0416\u0435\u043D\u0435\u0432\u0430","CH",46.2,6.14,2],["bern","\u0411\u0435\u0440\u043D","CH",46.95,7.45,1],["lugano","\u041B\u0443\u0433\u0430\u043D\u043E","CH",46,8.95,1],["vienna","\u0412\u0435\u043D\u0430","AT",48.21,16.37,3],["salzburg","\u0417\u0430\u043B\u044C\u0446\u0431\u0443\u0440\u0433","AT",47.81,13.05,2],["innsbruck","\u0418\u043D\u0441\u0431\u0440\u0443\u043A","AT",47.27,11.4,1],["graz","\u0413\u0440\u0430\u0446","AT",47.07,15.44,1],["linz","\u041B\u0438\u043D\u0446","AT",48.31,14.29,1],["prague","\u041F\u0440\u0430\u0433\u0430","CZ",50.08,14.44,3],["brno","\u0411\u0440\u043D\u043E","CZ",49.2,16.61,2],["ostrava","\u041E\u0441\u0442\u0440\u0430\u0432\u0430","CZ",49.82,18.26,1],["plzen","\u041F\u043B\u044C\u0437\u0435\u043D\u044C","CZ",49.74,13.38,1],["warsaw","\u0412\u0430\u0440\u0448\u0430\u0432\u0430","PL",52.23,21.01,3],["krakow","\u041A\u0440\u0430\u043A\u043E\u0432","PL",50.06,19.94,2],["wroclaw","\u0412\u0440\u043E\u0446\u043B\u0430\u0432","PL",51.11,17.04,2],["gdansk","\u0413\u0434\u0430\u043D\u044C\u0441\u043A","PL",54.35,18.65,2],["poznan","\u041F\u043E\u0437\u043D\u0430\u043D\u044C","PL",52.41,16.93,2],["lodz","\u041B\u043E\u0434\u0437\u044C","PL",51.76,19.46,2],["szczecin","\u0429\u0435\u0446\u0438\u043D","PL",53.43,14.55,1],["katowice","\u041A\u0430\u0442\u043E\u0432\u0438\u0446\u0435","PL",50.26,19.02,2],["copenhagen","\u041A\u043E\u043F\u0435\u043D\u0433\u0430\u0433\u0435\u043D","DK",55.68,12.57,3],["aarhus","\u041E\u0440\u0445\u0443\u0441","DK",56.16,10.2,2],["odense","\u041E\u0434\u0435\u043D\u0441\u0435","DK",55.4,10.39,1],["aalborg","\u041E\u043B\u044C\u0431\u043E\u0440\u0433","DK",57.05,9.92,1],["stockholm","\u0421\u0442\u043E\u043A\u0433\u043E\u043B\u044C\u043C","SE",59.33,18.07,3],["gothenburg","\u0413\u0451\u0442\u0435\u0431\u043E\u0440\u0433","SE",57.71,11.97,2],["malmo","\u041C\u0430\u043B\u044C\u043C\u0451","SE",55.6,13,2],["jonkoping","\u0419\u0451\u043D\u0447\u0451\u043F\u0438\u043D\u0433","SE",57.78,14.16,1],["linkoping","\u041B\u0438\u043D\u0447\u0451\u043F\u0438\u043D\u0433","SE",58.41,15.62,1],["sundsvall","\u0421\u0443\u043D\u0434\u0441\u0432\u0430\u043B\u043B\u044C","SE",62.39,17.31,1],["umea","\u0423\u043C\u0435\u043E","SE",63.83,20.26,1],["oslo","\u041E\u0441\u043B\u043E","NO",59.91,10.75,3],["bergen","\u0411\u0435\u0440\u0433\u0435\u043D","NO",60.39,5.32,2],["trondheim","\u0422\u0440\u043E\u043D\u0445\u0435\u0439\u043C","NO",63.43,10.4,1],["stavanger","\u0421\u0442\u0430\u0432\u0430\u043D\u0433\u0435\u0440","NO",58.97,5.73,1],["kristiansand","\u041A\u0440\u0438\u0441\u0442\u0438\u0430\u043D\u0441\u0430\u043D\u043D","NO",58.15,8,1],["helsinki","\u0425\u0435\u043B\u044C\u0441\u0438\u043D\u043A\u0438","FI",60.17,24.94,3],["turku","\u0422\u0443\u0440\u043A\u0443","FI",60.45,22.27,2],["tampere","\u0422\u0430\u043C\u043F\u0435\u0440\u0435","FI",61.5,23.76,2],["oulu","\u041E\u0443\u043B\u0443","FI",65.01,25.47,1],["tallinn","\u0422\u0430\u043B\u043B\u0438\u043D","EE",59.44,24.75,2],["tartu","\u0422\u0430\u0440\u0442\u0443","EE",58.38,26.72,1],["riga","\u0420\u0438\u0433\u0430","LV",56.95,24.11,2],["liepaja","\u041B\u0438\u0435\u043F\u0430\u044F","LV",56.51,21.01,1],["vilnius","\u0412\u0438\u043B\u044C\u043D\u044E\u0441","LT",54.69,25.28,2],["kaunas","\u041A\u0430\u0443\u043D\u0430\u0441","LT",54.9,23.9,2],["klaipeda","\u041A\u043B\u0430\u0439\u043F\u0435\u0434\u0430","LT",55.71,21.13,1],["budapest","\u0411\u0443\u0434\u0430\u043F\u0435\u0448\u0442","HU",47.5,19.04,3],["debrecen","\u0414\u0435\u0431\u0440\u0435\u0446\u0435\u043D","HU",47.53,21.62,1],["szeged","\u0421\u0435\u0433\u0435\u0434","HU",46.25,20.15,1],["gyor","\u0414\u044C\u0451\u0440","HU",47.69,17.63,1],["bratislava","\u0411\u0440\u0430\u0442\u0438\u0441\u043B\u0430\u0432\u0430","SK",48.15,17.11,2],["kosice","\u041A\u043E\u0448\u0438\u0446\u0435","SK",48.72,21.26,1],["zilina","\u0416\u0438\u043B\u0438\u043D\u0430","SK",49.22,18.74,1],["bucharest","\u0411\u0443\u0445\u0430\u0440\u0435\u0441\u0442","RO",44.43,26.1,3],["cluj","\u041A\u043B\u0443\u0436-\u041D\u0430\u043F\u043E\u043A\u0430","RO",46.77,23.6,2],["timisoara","\u0422\u0438\u043C\u0438\u0448\u043E\u0430\u0440\u0430","RO",45.75,21.23,2],["iasi","\u042F\u0441\u0441\u044B","RO",47.16,27.59,1],["constanta","\u041A\u043E\u043D\u0441\u0442\u0430\u043D\u0446\u0430","RO",44.17,28.64,1],["sibiu","\u0421\u0438\u0431\u0438\u0443","RO",45.8,24.15,1],["zagreb","\u0417\u0430\u0433\u0440\u0435\u0431","HR",45.81,15.98,2],["split","\u0421\u043F\u043B\u0438\u0442","HR",43.51,16.44,1],["rijeka","\u0420\u0438\u0435\u043A\u0430","HR",45.33,14.44,1],["osijek","\u041E\u0441\u0438\u0435\u043A","HR",45.55,18.69,1],["ljubljana","\u041B\u044E\u0431\u043B\u044F\u043D\u0430","SI",46.06,14.51,2],["maribor","\u041C\u0430\u0440\u0438\u0431\u043E\u0440","SI",46.55,15.65,1],["belgrade","\u0411\u0435\u043B\u0433\u0440\u0430\u0434","RS",44.79,20.45,3],["novisad","\u041D\u043E\u0432\u0438-\u0421\u0430\u0434","RS",45.25,19.84,1],["nis","\u041D\u0438\u0448","RS",43.32,21.9,1],["sofia","\u0421\u043E\u0444\u0438\u044F","BG",42.7,23.32,3],["plovdiv","\u041F\u043B\u043E\u0432\u0434\u0438\u0432","BG",42.15,24.75,2],["varna","\u0412\u0430\u0440\u043D\u0430","BG",43.21,27.91,1]],Un=Cx.map(([n,t,e,i,s,r])=>({id:n,name:t,country:e,lat:i,lon:s,size:r,specialty:null})),oe=new Map(Un.map(n=>[n.id,n]));var Te=[{id:"auriga-3",name:"Auriga 3 \xB7 330",hp:330,price:34e3,level:1,used:!0,tank:380,consumption:30.5,gears:12,finalDrive:3.08,topSpeed:89,color:12042953,desc:"\u041F\u043E\u0434\u0435\u0440\u0436\u0430\u043D\u043D\u044B\u0439 \u0442\u044F\u0433\u0430\u0447 \u0434\u043B\u044F \u043F\u0435\u0440\u0432\u044B\u0445 \u0440\u0435\u0439\u0441\u043E\u0432. \u041F\u0440\u043E\u0449\u0430\u0435\u0442 \u043E\u0448\u0438\u0431\u043A\u0438, \u043D\u043E \u0431\u044B\u0441\u0442\u0440\u043E \u0443\u0441\u0442\u0430\u0451\u0442 \u043D\u0430 \u043F\u043E\u0434\u044A\u0451\u043C\u0430\u0445."},{id:"auriga-4",name:"Auriga 4 \xB7 380",hp:380,price:76e3,level:2,tank:400,consumption:29.2,gears:12,finalDrive:3.08,topSpeed:89,color:8369096,desc:"\u0420\u0430\u0431\u043E\u0447\u0430\u044F \u043B\u043E\u0448\u0430\u0434\u043A\u0430 \u0434\u0430\u043B\u044C\u043D\u043E\u0431\u043E\u0439\u0449\u0438\u043A\u0430: \u043D\u0430\u0434\u0451\u0436\u043D\u0430\u044F \u0442\u0440\u0430\u043D\u0441\u043C\u0438\u0441\u0441\u0438\u044F \u0438 \u0443\u043C\u0435\u0440\u0435\u043D\u043D\u044B\u0439 \u0440\u0430\u0441\u0445\u043E\u0434."},{id:"auriga-5",name:"Auriga 5 \xB7 460",hp:460,price:108e3,level:4,tank:480,consumption:31,gears:12,finalDrive:2.85,topSpeed:89,color:12666159,desc:"\u041A\u043E\u043C\u0444\u043E\u0440\u0442\u043D\u0430\u044F \u043A\u0430\u0431\u0438\u043D\u0430 \u0441\u043E \u0441\u043F\u0430\u043B\u044C\u043D\u0438\u043A\u043E\u043C, \u0442\u044F\u0433\u0430 \u0434\u043B\u044F \u0442\u044F\u0436\u0451\u043B\u044B\u0445 \u0433\u0440\u0443\u0437\u043E\u0432 \u0438 \u0430\u0432\u0442\u043E\u043F\u043E\u0435\u0437\u0434\u043E\u0432."},{id:"auriga-6",name:"Auriga 6 \xB7 540",hp:540,price:146e3,level:6,tank:560,consumption:32.4,gears:12,finalDrive:2.64,topSpeed:89,color:3107663,desc:"\u0424\u043B\u0430\u0433\u043C\u0430\u043D \u0441 12-\u0441\u0442\u0443\u043F\u0435\u043D\u0447\u0430\u0442\u043E\u0439 \u043A\u043E\u0440\u043E\u0431\u043A\u043E\u0439, \u0440\u0435\u0442\u0430\u0440\u0434\u0435\u0440\u043E\u043C \u0438 \u0430\u0434\u0430\u043F\u0442\u0438\u0432\u043D\u044B\u043C \u043A\u0440\u0443\u0438\u0437-\u043A\u043E\u043D\u0442\u0440\u043E\u043B\u0435\u043C."},{id:"auriga-6x",name:"Auriga 6X \xB7 620",hp:620,price:189e3,level:9,tank:620,consumption:34.6,gears:12,finalDrive:2.47,topSpeed:89,color:2833251,desc:"\u0422\u044F\u0436\u0451\u043B\u044B\u0439 \u0444\u043B\u0430\u0433\u043C\u0430\u043D \u0434\u043B\u044F \u043D\u0435\u0433\u0430\u0431\u0430\u0440\u0438\u0442\u0430 \u0438 \u0433\u043E\u0440\u043D\u044B\u0445 \u0441\u0435\u0440\u043F\u0430\u043D\u0442\u0438\u043D\u043E\u0432. \u041C\u0430\u043A\u0441\u0438\u043C\u0430\u043B\u044C\u043D\u0430\u044F \u0442\u044F\u0433\u0430."}],xn=[{id:"ice",name:"\u041B\u0435\u0434\u044F\u043D\u043E\u0439 \u0431\u0435\u043B\u044B\u0439",hex:14673641},{id:"ocean",name:"\u041E\u043A\u0435\u0430\u043D",hex:3112872},{id:"crimson",name:"\u041A\u0430\u0440\u043C\u0438\u043D",hex:12072236},{id:"forest",name:"\u041B\u0435\u0441\u043D\u043E\u0439",hex:3107663},{id:"amber",name:"\u042F\u043D\u0442\u0430\u0440\u044C",hex:13863727},{id:"graphite",name:"\u0413\u0440\u0430\u0444\u0438\u0442",hex:3686472},{id:"violet",name:"\u0418\u043D\u0434\u0438\u0433\u043E",hex:4930421}],_n={engine:[{id:0,name:"\u0421\u0442\u0430\u043D\u0434\u0430\u0440\u0442\u043D\u044B\u0439 \u0434\u0432\u0438\u0433\u0430\u0442\u0435\u043B\u044C",power:1,price:0},{id:1,name:"\u0427\u0438\u043F-\u0442\u044E\u043D\u0438\u043D\u0433 +8%",power:1.08,price:4200},{id:2,name:"\u0421\u043F\u043E\u0440\u0442\u0438\u0432\u043D\u0430\u044F \u043F\u0440\u043E\u0448\u0438\u0432\u043A\u0430 +15%",power:1.15,price:9600}],tires:[{id:0,name:"\u0412\u0441\u0435\u0441\u0435\u0437\u043E\u043D\u043D\u044B\u0435 \u0448\u0438\u043D\u044B",grip:1,price:0},{id:1,name:"\u0428\u0438\u043D\u044B \u043F\u043E\u0432\u044B\u0448\u0435\u043D\u043D\u043E\u0439 \u0445\u043E\u0434\u0438\u043C\u043E\u0441\u0442\u0438",grip:1.06,price:3200},{id:2,name:"\u041F\u0440\u0435\u043C\u0438\u0430\u043B\u044C\u043D\u044B\u0435 \u0448\u0438\u043D\u044B",grip:1.14,price:7400}],retarder:[{id:0,name:"\u0411\u0435\u0437 \u0440\u0435\u0442\u0430\u0440\u0434\u0435\u0440\u0430",strength:0,price:0},{id:1,name:"\u0413\u0438\u0434\u0440\u0430\u0432\u043B\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0440\u0435\u0442\u0430\u0440\u0434\u0435\u0440",strength:1,price:5200}]},zo=[{id:"long",name:"\u0414\u0430\u043B\u044C\u043D\u0438\u0435 \u0440\u0435\u0439\u0441\u044B",desc:"\u041E\u0442\u043A\u0440\u044B\u0432\u0430\u0435\u0442 \u043A\u043E\u043D\u0442\u0440\u0430\u043A\u0442\u044B \u0434\u043B\u0438\u043D\u043D\u0435\u0435 600 \u043A\u043C \u0438 \u043F\u043E\u0432\u044B\u0448\u0430\u0435\u0442 \u043E\u043F\u043B\u0430\u0442\u0443 \u0437\u0430 \u043A\u0438\u043B\u043E\u043C\u0435\u0442\u0440."},{id:"value",name:"\u0426\u0435\u043D\u043D\u044B\u0435 \u0433\u0440\u0443\u0437\u044B",desc:"\u0414\u043E\u0441\u0442\u0443\u043F \u043A \u044D\u043B\u0435\u043A\u0442\u0440\u043E\u043D\u0438\u043A\u0435, \u043C\u0435\u0434\u0438\u043A\u0430\u043C\u0435\u043D\u0442\u0430\u043C \u0438 \u0434\u0440\u0443\u0433\u0438\u043C \u0434\u043E\u0440\u043E\u0433\u0438\u043C \u0433\u0440\u0443\u0437\u0430\u043C."},{id:"fragile",name:"\u0425\u0440\u0443\u043F\u043A\u0438\u0435 \u0433\u0440\u0443\u0437\u044B",desc:"\u0421\u043D\u0438\u0436\u0430\u0435\u0442 \u0440\u0438\u0441\u043A \u043F\u043E\u0432\u0440\u0435\u0434\u0438\u0442\u044C \u0445\u0440\u0443\u043F\u043A\u0438\u0439 \u0433\u0440\u0443\u0437 \u0438 \u043F\u043E\u0432\u044B\u0448\u0430\u0435\u0442 \u043E\u043F\u043B\u0430\u0442\u0443."},{id:"urgent",name:"\u0421\u0440\u043E\u0447\u043D\u044B\u0435 \u0440\u0435\u0439\u0441\u044B",desc:"\u0411\u043E\u043B\u044C\u0448\u0435 \u0441\u0440\u043E\u0447\u043D\u044B\u0445 \u043A\u043E\u043D\u0442\u0440\u0430\u043A\u0442\u043E\u0432 \u0441 \u043D\u0430\u0434\u0431\u0430\u0432\u043A\u043E\u0439 \u0437\u0430 \u0441\u0440\u043E\u043A."},{id:"adr",name:"ADR \xB7 \u043E\u043F\u0430\u0441\u043D\u044B\u0435 \u0433\u0440\u0443\u0437\u044B",desc:"\u041E\u0442\u043A\u0440\u044B\u0432\u0430\u0435\u0442 \u0446\u0438\u0441\u0442\u0435\u0440\u043D\u044B \u0441 \u0442\u043E\u043F\u043B\u0438\u0432\u043E\u043C, \u0445\u0438\u043C\u0438\u043A\u0430\u0442\u0430\u043C\u0438 \u0438 \u0433\u0430\u0437\u043E\u043C."},{id:"eco",name:"\u042D\u043A\u043E\u043D\u043E\u043C\u0438\u0447\u043D\u043E\u0435 \u0432\u043E\u0436\u0434\u0435\u043D\u0438\u0435",desc:"\u0421\u043D\u0438\u0436\u0430\u0435\u0442 \u0440\u0430\u0441\u0445\u043E\u0434 \u0442\u043E\u043F\u043B\u0438\u0432\u0430 \u0438 \u0438\u0437\u043D\u043E\u0441 \u0434\u0432\u0438\u0433\u0430\u0442\u0435\u043B\u044F."}];function gi(n){let t=1,e=260,i=0;for(;n>=i+e;)i+=e,t++,e=Math.round(260*Math.pow(t,1.4));return{level:t,current:n-i,need:e,total:i}}var bs=[{id:"first",icon:"\u{1F69A}",name:"\u041F\u0435\u0440\u0432\u044B\u0439 \u0440\u0435\u0439\u0441",desc:"\u0414\u043E\u0441\u0442\u0430\u0432\u044C\u0442\u0435 \u043F\u0435\u0440\u0432\u044B\u0439 \u0433\u0440\u0443\u0437."},{id:"ten",icon:"\u{1F4E6}",name:"\u0414\u0435\u0441\u044F\u0442\u044C \u0440\u0435\u0439\u0441\u043E\u0432",desc:"\u0412\u044B\u043F\u043E\u043B\u043D\u0438\u0442\u0435 10 \u0434\u043E\u0441\u0442\u0430\u0432\u043E\u043A."},{id:"fifty",icon:"\u{1F3C6}",name:"\u041E\u043F\u044B\u0442\u043D\u044B\u0439 \u0434\u0430\u043B\u044C\u043D\u043E\u0431\u043E\u0439\u0449\u0438\u043A",desc:"\u0412\u044B\u043F\u043E\u043B\u043D\u0438\u0442\u0435 50 \u0434\u043E\u0441\u0442\u0430\u0432\u043E\u043A."},{id:"km1000",icon:"\u{1F6E3}",name:"\u0422\u044B\u0441\u044F\u0447\u0430 \u043A\u0438\u043B\u043E\u043C\u0435\u0442\u0440\u043E\u0432",desc:"\u041F\u0440\u043E\u0439\u0434\u0438\u0442\u0435 1000 \u043A\u043C."},{id:"km10000",icon:"\u{1F30D}",name:"\u0412\u0441\u044F \u0415\u0432\u0440\u043E\u043F\u0430",desc:"\u041F\u0440\u043E\u0439\u0434\u0438\u0442\u0435 10 000 \u043A\u043C."},{id:"rich",icon:"\u{1F4B0}",name:"\u041F\u0435\u0440\u0432\u044B\u0439 \u043A\u0430\u043F\u0438\u0442\u0430\u043B",desc:"\u0417\u0430\u0440\u0430\u0431\u043E\u0442\u0430\u0439\u0442\u0435 100 000 \u20AC."},{id:"clean",icon:"\u2728",name:"\u0411\u0435\u0437 \u0446\u0430\u0440\u0430\u043F\u0438\u043D\u044B",desc:"\u0414\u043E\u0441\u0442\u0430\u0432\u044C\u0442\u0435 \u0433\u0440\u0443\u0437 \u0431\u0435\u0437 \u043F\u043E\u0432\u0440\u0435\u0436\u0434\u0435\u043D\u0438\u0439."},{id:"night",icon:"\u{1F319}",name:"\u041D\u043E\u0447\u043D\u0430\u044F \u0441\u043C\u0435\u043D\u0430",desc:"\u041F\u0440\u043E\u0435\u0434\u044C 50 \u043A\u043C \u043D\u043E\u0447\u044C\u044E."},{id:"storm",icon:"\u26C8",name:"\u0413\u0440\u043E\u0437\u0430 \u043D\u0430\u0434 \u0442\u0440\u0430\u0441\u0441\u043E\u0439",desc:"\u0414\u043E\u0441\u0442\u0430\u0432\u044C\u0442\u0435 \u0433\u0440\u0443\u0437 \u0432 \u0433\u0440\u043E\u0437\u0443."},{id:"adr",icon:"\u2623",name:"\u041E\u043F\u0430\u0441\u043D\u044B\u0439 \u0433\u0440\u0443\u0437",desc:"\u0414\u043E\u0441\u0442\u0430\u0432\u044C\u0442\u0435 ADR-\u0433\u0440\u0443\u0437."},{id:"dealer",icon:"\u{1F3E2}",name:"\u041D\u043E\u0432\u044B\u0439 \u0442\u044F\u0433\u0430\u0447",desc:"\u041A\u0443\u043F\u0438\u0442\u0435 \u0432\u0442\u043E\u0440\u043E\u0439 \u0442\u044F\u0433\u0430\u0447."},{id:"garage",icon:"\u{1F3E0}",name:"\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439 \u0433\u0430\u0440\u0430\u0436",desc:"\u041A\u0443\u043F\u0438\u0442\u0435 \u0433\u0430\u0440\u0430\u0436 \u0432 \u043B\u044E\u0431\u043E\u043C \u0433\u043E\u0440\u043E\u0434\u0435."},{id:"driver",icon:"\u{1F465}",name:"\u041D\u0435 \u043E\u0434\u0438\u043D",desc:"\u041D\u0430\u0439\u043C\u0438\u0442\u0435 \u043F\u0435\u0440\u0432\u043E\u0433\u043E \u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044F."},{id:"level10",icon:"\u2B50",name:"\u0423\u0440\u043E\u0432\u0435\u043D\u044C 10",desc:"\u0414\u043E\u0441\u0442\u0438\u0433\u043D\u0438\u0442\u0435 10-\u0433\u043E \u0443\u0440\u043E\u0432\u043D\u044F."},{id:"nightride",icon:"\u{1F526}",name:"\u0414\u0430\u043B\u044C\u043D\u0438\u0439 \u0441\u0432\u0435\u0442",desc:"\u041F\u0440\u043E\u0435\u0434\u044C 20 \u043A\u043C \u0441 \u0432\u043A\u043B\u044E\u0447\u0451\u043D\u043D\u044B\u043C\u0438 \u0444\u0430\u0440\u0430\u043C\u0438."},{id:"longhaul",icon:"\u{1F5FA}",name:"\u0414\u0430\u043B\u044C\u043D\u0438\u0439 \u0440\u0435\u0439\u0441",desc:"\u0412\u044B\u043F\u043E\u043B\u043D\u0438\u0442\u0435 \u0440\u0435\u0439\u0441 \u0434\u043B\u0438\u043D\u043D\u0435\u0435 400 \u043A\u043C."}],pM=new Map(bs.map(n=>[n.id,n]));var Et=(n,t,e)=>n<t?t:n>e?e:n,ke=(n,t,e)=>n+(t-n)*e,Ar=n=>(n=Et(n,0,1),n*n*(3-2*n));var Ss=n=>n*Math.PI/180;function Be(n){let t=n>>>0;return function(){t=t+1831565813>>>0;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}function Zi(n,t){let e=Math.imul(n|0,374761393)^Math.imul(t|0,668265263);return e=Math.imul(e^e>>>13,1274126177),((e^e>>>16)>>>0)/4294967296}function Ho(n){let t=2166136261;for(let e=0;e<n.length;e++)t^=n.charCodeAt(e),t=Math.imul(t,16777619);return t>>>0}function Rr(n,t,e,i){let r=Ss(e-n),a=Ss(i-t),o=Math.sin(r/2)**2+Math.cos(Ss(n))*Math.cos(Ss(e))*Math.sin(a/2)**2;return 2*6371*Math.asin(Math.sqrt(Et(o,0,1)))}function Nc(n,t,e,i,s){let r=s*s,a=r*s;return .5*(2*t+(-n+e)*s+(2*n-5*t+4*e-i)*r+(-n+3*t-3*e+i)*a)}function We(n){return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g," ")}function se(n){return We(Math.round(n))+" \u20AC"}function Bi(n){let t=(Math.floor(n)%1440+1440)%1440,e=Math.floor(t/60),i=Math.floor(t%60);return String(e).padStart(2,"0")+":"+String(i).padStart(2,"0")}function Go(n){let t=Math.max(0,Math.round(n)),e=Math.floor(t/1440),i=Math.floor(t%1440/60),s=t%60;return e>0?`${e} \u0434 ${i} \u0447`:i>0?`${i} \u0447 ${s} \u043C\u0438\u043D`:`${s} \u043C\u0438\u043D`}function Uc(n){return n>=1e3?(n/1e3).toFixed(1).replace(".",",")+" \u043A\u043C":Math.round(n)+" \u043C"}function td(n,t,e,i){if(t===e)return[t];let s=new Set([t]),r=new Map([[t,0]]),a=new Map([[t,i(t,e)]]),o=new Map;for(;s.size;){let l=null,c=1/0;for(let d of s){let u=a.get(d)??1/0;u<c&&(c=u,l=d)}if(l===null)break;if(l===e){let d=[l];for(;o.has(l);)l=o.get(l),d.unshift(l);return d}s.delete(l);let h=n.get(l);for(let d of h.edges){if(d.blocked)continue;let u=(r.get(l)??1/0)+d.cost;u<(r.get(d.to)??1/0)&&(o.set(d.to,l),r.set(d.to,u),a.set(d.to,u+i(d.to,e)),s.add(d.to))}}return null}function ed(n){let t=n.length;if(t<3)return[];let e=1/0,i=1/0,s=-1/0,r=-1/0;for(let p of n)e=Math.min(e,p.x),i=Math.min(i,p.y),s=Math.max(s,p.x),r=Math.max(r,p.y);let a=s-e||1,o=r-i||1,l=Math.max(a,o),c=(e+s)/2,h=(i+r)/2,d=n.map(p=>({x:p.x,y:p.y}));d.push({x:c-20*l,y:h-l,_s:!0}),d.push({x:c,y:h+20*l,_s:!0}),d.push({x:c+20*l,y:h-l,_s:!0});let u=t,f=t+1,m=t+2,y=(p,M,w)=>{let x=d[p].x,E=d[p].y,S=d[M].x,R=d[M].y,v=d[w].x,T=d[w].y,P=2*(x*(R-T)+S*(T-E)+v*(E-R));if(Math.abs(P)<1e-12)return{x:0,y:0,r2:1/0};let C=((x*x+E*E)*(R-T)+(S*S+R*R)*(T-E)+(v*v+T*T)*(E-R))/P,I=((x*x+E*E)*(v-S)+(S*S+R*R)*(x-v)+(v*v+T*T)*(S-x))/P;return{x:C,y:I,r2:(x-C)**2+(E-I)**2}},g=[{a:u,b:f,c:m,...y(u,f,m)}];for(let p=0;p<t;p++){let M=d[p],w=[],x=[];for(let S of g){let R=M.x-S.x,v=M.y-S.y;R*R+v*v<=S.r2+1e-9?w.push(S):x.push(S)}let E=new Map;for(let S of w){let R=[[S.a,S.b],[S.b,S.c],[S.c,S.a]];for(let[v,T]of R){let P=v<T?`${v}:${T}`:`${T}:${v}`,C=E.get(P);C?C.count++:E.set(P,{u:v,v:T,count:1})}}g=x;for(let S of E.values())S.count===1&&g.push({a:S.u,b:S.v,c:p,...y(S.u,S.v,p)})}return g.filter(p=>p.a<t&&p.b<t&&p.c<t).map(p=>[p.a,p.b,p.c])}var id="eurotrak.saves.v1",nd="eurotrak.settings.v1",Px=1,Vo={sound:!0,volume:.65,camera:"interior",units:"kmh",quality:"high",showFps:!1,invertY:!1,timeScale:3};function Fc(n="\u0412\u043E\u0434\u0438\u0442\u0435\u043B\u044C",t="auriga-3"){let e=Te.find(i=>i.id===t)||Te[0];return{version:Px,id:"p"+Date.now().toString(36),name:n,created:Date.now(),lastPlayed:Date.now(),money:9200,xp:0,level:1,skills:{long:0,value:0,fragile:0,urgent:0,adr:0,eco:0},truck:{modelId:e.id,paint:"ocean",engine:0,tires:0,retarder:0,condition:{engine:88,tires:74,brakes:82},odometer:21400,fuel:Math.round(e.tank*.55)},currentCity:"berlin",garages:[],drivers:[],stats:{distance:0,deliveries:0,earnings:0,fines:0,collisions:0,late:0,fuelSpent:0,topSpeed:0},achievements:[],clock:{day:1,minutes:480},activeJob:null}}function sd(){try{let n=localStorage.getItem(id);if(!n)return{slots:[null,null,null],lastSlot:0};let t=JSON.parse(n);return{slots:Array.isArray(t.slots)?[t.slots[0]||null,t.slots[1]||null,t.slots[2]||null]:[null,null,null],lastSlot:t.lastSlot||0}}catch{return{slots:[null,null,null],lastSlot:0}}}function Wo(n,t){try{return localStorage.setItem(id,JSON.stringify({slots:n,lastSlot:t,savedAt:Date.now()})),!0}catch{return!1}}function rd(){try{let n=localStorage.getItem(nd);return{...Vo,...n?JSON.parse(n):{}}}catch{return{...Vo}}}function Oc(n){try{localStorage.setItem(nd,JSON.stringify(n))}catch{}}function ad(n){if(!n)return n;let t=Fc(n.name||"\u0412\u043E\u0434\u0438\u0442\u0435\u043B\u044C"),e={...t,...n,skills:{...t.skills,...n.skills||{}},truck:{...t.truck,...n.truck||{},condition:{...t.truck.condition,...n.truck?.condition||{}}},stats:{...t.stats,...n.stats||{}},clock:{...t.clock,...n.clock||{}}};return e.level=gi(e.xp||0).level,e}function Xo(n,t){return 1200+(n.skills[t]||0)*1400}var ct=n=>document.getElementById(n);function od(n="#2f7fa8",t=!0){return`<svg class="truck-svg" viewBox="0 0 260 110" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <ellipse cx="130" cy="101" rx="118" ry="6" fill="rgba(0,0,0,.35)"/>
    ${t?`<rect x="6" y="30" width="118" height="52" rx="4" fill="#e7e2d4" stroke="#b9b3a4"/>
    <rect x="6" y="64" width="118" height="7" fill="#2f4a3c" opacity=".8"/>
    <rect x="16" y="40" width="70" height="8" rx="2" fill="#8d9488" opacity=".55"/>
    <circle cx="28" cy="88" r="10" fill="#1d2225"/><circle cx="28" cy="88" r="4" fill="#aab2b6"/>
    <circle cx="52" cy="88" r="10" fill="#1d2225"/><circle cx="52" cy="88" r="4" fill="#aab2b6"/>
    <circle cx="104" cy="88" r="10" fill="#1d2225"/><circle cx="104" cy="88" r="4" fill="#aab2b6"/>`:""}
    <path d="M126 32 h44 l10 10 h30 a6 6 0 0 1 6 6 v40 h-90 z" fill="${n}" stroke="rgba(0,0,0,.25)"/>
    <path d="M172 38 l9 8 h-9 z" fill="#9fd0e0" opacity=".9"/>
    <rect x="176" y="48" width="32" height="18" rx="2" fill="#9fd0e0" opacity=".75"/>
    <rect x="126" y="74" width="90" height="8" fill="rgba(0,0,0,.22)"/>
    <rect x="206" y="60" width="12" height="5" rx="1" fill="#ffe9a8"/>
    <circle cx="142" cy="88" r="11" fill="#1d2225"/><circle cx="142" cy="88" r="4.5" fill="#aab2b6"/>
    <circle cx="198" cy="88" r="11" fill="#1d2225"/><circle cx="198" cy="88" r="4.5" fill="#aab2b6"/>
    <circle cx="222" cy="88" r="11" fill="#1d2225"/><circle cx="222" cy="88" r="4.5" fill="#aab2b6"/>
  </svg>`}var qo=class{constructor(t){this.game=t,this.navTab="jobs",this.jobFilter="all",this.toastTimers=[],this.lastHud=0,this.bindEvents(),this.buildTouchZones()}bindEvents(){ct("btn-continue").addEventListener("click",()=>this.game.continueCareer()),ct("btn-new").addEventListener("click",()=>this.game.newCareerDialog()),ct("btn-profiles").addEventListener("click",()=>this.game.profilesDialog()),ct("btn-settings").addEventListener("click",()=>this.showSettings(!0)),ct("btn-about").addEventListener("click",()=>this.showAbout()),ct("btn-pause").addEventListener("click",()=>this.game.togglePause()),ct("g-menu").addEventListener("click",()=>this.game.togglePause()),ct("modal-close").addEventListener("click",()=>this.closeModal()),document.querySelectorAll(".garage-nav button").forEach(t=>{t.addEventListener("click",()=>{this.navTab=t.dataset.nav,document.querySelectorAll(".garage-nav button").forEach(e=>e.classList.toggle("active",e===t)),this.renderGarage()})}),document.body.addEventListener("click",t=>{let e=t.target.closest("[data-act]");if(!e)return;let i=e.dataset.act,s=e.dataset.arg;this.handleAction(i,s,e),this.game.audio.click()}),document.body.addEventListener("input",t=>{let e=t.target;if(e.dataset.input==="fuel"){ct("fuel-amount").textContent=We(Et(+e.value,0,+e.max))+" \u043B";let i=this.game.currentFuelPrice||1.7;ct("fuel-total").textContent=se(Et(+e.value,0,+e.max)*i)}if(e.dataset.input==="volume"){this.game.setSetting("volume",+e.value/100);let i=ct("volume-value");i&&(i.textContent=e.value+"%")}}),document.body.addEventListener("change",t=>{let e=t.target;e.dataset.setting&&this.game.setSetting(e.dataset.setting,e.type==="checkbox"?e.checked:e.value),e.dataset.select==="truck"&&this.game.selectTruck(e.value),e.dataset.select==="paint"&&this.game.setPaint(e.value),e.dataset.select==="mapcity"&&this.game.freeDrive(e.value)}),window.addEventListener("keydown",t=>this.onKey(t))}onKey(t){if(!ct("modal-root").classList.contains("hidden")&&t.key==="Enter"){let i=ct("modal-foot").querySelector(".btn-primary");i&&i.click()}}buildTouchZones(){document.querySelectorAll("[data-touch]").forEach(t=>{let e=t.dataset.touch,s={left:"KeyA",right:"KeyD",gas:"KeyW",brake:"KeyS"}[e],r=o=>{o.preventDefault(),this.game.input.touch[s]=!0,t.classList.add("active")},a=o=>{o.preventDefault(),this.game.input.touch[s]=!1,t.classList.remove("active")};t.addEventListener("pointerdown",r),t.addEventListener("pointerup",a),t.addEventListener("pointercancel",a),t.addEventListener("pointerleave",a)})}handleAction(t,e,i){let s=this.game;switch(t){case"accept-job":{let r=s.offers?.find(a=>a.id===e);r&&s.acceptJob(r);break}case"continue-job":s.continueActiveJob();break;case"abandon-job":s.abandonJob();break;case"service":{e==="fuel"?s.refuelDialog():e==="repair"?s.repairDialog():e==="rest"?s.restDialog():e==="all"&&s.fullService();break}case"buy-truck":{let r=Te.find(a=>a.id===e);r&&s.buyTruckDialog(r);break}case"buy-truck-confirm":this.closeModal(),s.buyTruck(e);break;case"filter":this.jobFilter=e,this.renderGarage();break;case"select-truck":s.selectTruck(e);break;case"take-owned":s.takeOwnedTruck(Number(e));break;case"sell-truck":s.sellTruckDialog();break;case"paint":s.setPaint(e);break;case"upgrade":{let[r,a]=e.split(":");s.buyUpgrade(r,+a);break}case"fuel-confirm":{let r=+ct("fuel-range").value;this.closeModal(),s.refuel(r);break}case"repair-confirm":{this.closeModal(),s.repair(e);break}case"rest-confirm":this.closeModal(),s.rest();break;case"buy-garage":s.buyGarage(e);break;case"hire-driver":s.hireDriverDialog();break;case"fire-driver":s.fireDriver(e);break;case"skill":s.buySkill(e);break;case"reset-save":s.resetDialog();break;case"delete-slot":s.deleteSlot(+e);break;case"load-slot":s.loadSlot(+e);break;case"new-slot":s.newCareerDialog(+e);break;case"quit-menu":this.closeModal(),s.returnToMenu();break;case"free-drive":s.freeDrive(e);break;case"goto-jobs":this.closeModal(),s.openGarageTab("jobs");break;case"photo":s.takeScreenshot();break;case"help-driving":this.closeModal(),s.showHelp();break;case"toggle-setting":{let r=e,a=s.settings[r];s.setSetting(r,!a),this.showSettings(!0);break}case"reset-settings":s.resetSettings(),this.showSettings(!0);break;case"interact":s.interact();break;case"camera":s.cycleCamera();break;case"touch-cruise":s.toggleCruise();break;case"free-drive-select":{let r=document.querySelector('[data-select="mapcity"]')?.value;r&&s.freeDrive(r);break}case"close":this.closeModal();break;default:break}}setScreen(t){ct("screen-menu").classList.toggle("hidden",t!=="menu"),ct("screen-garage").classList.toggle("hidden",t!=="garage"),ct("screen-loading").classList.toggle("hidden",t!=="loading"),ct("hud").classList.toggle("hidden",t!=="driving"),t!=="driving"&&this.closeModal()}loading(t="\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430\u2026",e=""){ct("loading-title").textContent=t,ct("loading-sub").textContent=e,this.setScreen("loading")}updateHud(t){let e=this.game.profile;if(!e)return;ct("hud-money").textContent=se(e.money);let i=gi(e.xp||0);ct("hud-level").textContent=i.level,ct("hud-xp").style.width=`${Et(i.current/i.need*100,0,100)}%`,ct("hud-clock").textContent=Bi(this.game.clock.minutes),ct("hud-day").textContent="\u0414\u0435\u043D\u044C "+this.game.clock.day,ct("hud-weather").textContent=t.weatherName||"\u2014",ct("hud-temp").textContent=Math.round(t.airTemp??17)+"\xB0",ct("dash-speed").textContent=Math.round(t.speedKmh),ct("dash-gear").textContent=t.gear===-1?"R":t.gear===0?"N":t.gear,ct("dash-mode").textContent=t.autoGearbox?"\u0410\u0412\u0422\u041E":"\u0420\u0423\u0427\u041D.",ct("bar-rpm").style.width=`${Et(t.rpm/2400*100,0,100)}%`,ct("val-rpm").textContent=Math.round(t.rpm),ct("bar-fuel").style.width=`${Et(t.fuelPct*100,0,100)}%`,ct("val-fuel").textContent=Math.round(t.fuel)+" \u043B",ct("bar-temp").style.width=`${Et((t.temp-40)/80*100,0,100)}%`,ct("val-temp").textContent=Math.round(t.temp)+"\xB0C",ct("bar-cond").style.width=`${Et(t.condition,0,100)}%`,ct("val-cond").textContent=Math.round(t.condition)+"%",ct("bar-fatigue").style.width=`${Et(t.fatigue,0,100)}%`,ct("val-fatigue").textContent=Math.round(t.fatigue)+"%",ct("speed-limit").textContent=Math.round(t.speedLimit),ct("speed-limit").style.borderColor=t.speedLimit<=50?"#f2b544":"#c8362c",ct("speed-limit").style.color="#1b1b18";let s=ct("cruise-indicator");if(t.cruise?(s.classList.remove("hidden"),ct("cruise-speed").textContent=Math.round(t.cruise)):s.classList.add("hidden"),t.speedKmh>t.speedLimit+8?ct("speed-limit").classList.add("over-speed"):ct("speed-limit").classList.remove("over-speed"),this.game.route&&this.game.job){let r=this.game.job,a=this.game.phase;ct("ra-phase").textContent=a==="pickup"?"\u0417\u0410\u0411\u0420\u0410\u0422\u042C \u0413\u0420\u0423\u0417":a==="delivery"?"\u0414\u041E\u0421\u0422\u0410\u0412\u041A\u0410":a==="unloading"?"\u0412\u042B\u0413\u0420\u0423\u0417\u041A\u0410":"\u0420\u0415\u0419\u0421";let o=this.game.remainingMeters(),l=a==="pickup"?"\u041F\u0443\u043D\u043A\u0442 \u043F\u043E\u0433\u0440\u0443\u0437\u043A\u0438":r.toName;ct("ra-from").textContent=r.fromName,ct("ra-to").textContent=l,ct("ra-left").textContent=Uc(Math.abs(o));let c=this.game.etaMinutes();ct("ra-eta").textContent="ETA "+Bi(this.game.clock.minutes+c);let h=r.deadlineMin-this.game.jobElapsed();ct("ra-deadline").textContent=a==="pickup"?"\u2014":Go(h),ct("ra-deadline").style.color=h<60?"var(--red)":"",ct("ra-cargo").textContent=r.cargo;let d=Et((1-Math.abs(o)/Math.max(1,this.game.phaseDistance()))*100,0,100);ct("ra-progress").style.width=d+"%";let u=ct("ra-action");this.game.interaction?u.innerHTML=`<span class="arrive-hint">${this.game.interaction.hint}</span>`:this.game.parkedAtDepot?u.innerHTML=`<button class="btn btn-primary btn-sm" data-act="${this.game.parkedAtDepot.act}" data-arg="${this.game.parkedAtDepot.arg||""}">${this.game.parkedAtDepot.label}</button>`:u.innerHTML=""}t.fps&&this.game.settings.showFps&&(ct("hud-weather").textContent+=` \xB7 ${Math.round(t.fps)} FPS`),this.drawMinimap(t)}drawMinimap(t){let e=ct("minimap");if(!e)return;let i=e.getContext("2d"),s=e.width,r=e.height;i.clearRect(0,0,s,r),i.save(),i.beginPath(),i.arc(s/2,r/2,s/2-2,0,Math.PI*2),i.clip(),i.fillStyle="#0a1216",i.fillRect(0,0,s,r);let a=this.game.route,o=this.game.truck;if(!a||!o){i.restore();return}let l=.13,c=a.pointAt(o.s),h=(m,y)=>[s/2+(m-c.x)*l,r/2-(y-c.z)*l];i.strokeStyle="rgba(140, 190, 200, 0.32)",i.lineWidth=3,i.beginPath();for(let m=0;m<a.samples.length;m+=6){let y=a.samples[m];if(Math.abs(y.s-o.s)>2600)continue;let[g,p]=h(y.x,y.z);m===0?i.moveTo(g,p):i.lineTo(g,p)}i.stroke(),i.strokeStyle="rgba(78, 201, 176, 0.85)",i.lineWidth=2.4,i.beginPath();let d=!0;for(let m=0;m<a.samples.length;m+=5){let y=a.samples[m];if(y.s<o.s-500||y.s>o.s+2800)continue;let[g,p]=h(y.x,y.z);d?(i.moveTo(g,p),d=!1):i.lineTo(g,p)}i.stroke();let u=[];this.game.job&&u.push({s:this.game.targetS(),color:"#f2b544",label:this.game.phase==="pickup"?"\u0413\u0420\u0423\u0417":"\u0424\u0418\u041D\u0418\u0428"});for(let m of a.stations)Math.abs(m.s-o.s)<2400&&u.push({s:m.s,color:"#6fb6e8",label:"\u0410\u0417\u0421"});for(let m of u){let y=a.pointAt(m.s),[g,p]=h(y.x,y.z);i.fillStyle=m.color,i.beginPath(),i.arc(g,p,4.5,0,Math.PI*2),i.fill(),i.fillStyle="rgba(230,240,240,.85)",i.font="bold 8px system-ui",i.textAlign="center",i.fillText(m.label,g,p-7)}let f=c.hdg+(o.yawRel||0);i.save(),i.translate(s/2,r/2),i.rotate(-f+Math.PI),i.fillStyle="#f2b544",i.beginPath(),i.moveTo(0,-9),i.lineTo(6.5,7),i.lineTo(0,4),i.lineTo(-6.5,7),i.closePath(),i.fill(),i.restore(),i.strokeStyle="rgba(150, 180, 190, 0.25)",i.lineWidth=2,i.beginPath(),i.arc(s/2,r/2,s/2-2,0,Math.PI*2),i.stroke(),i.restore()}renderGarage(){let t=this.game,e=t.profile;if(!e||t.state!=="garage")return;let i=gi(e.xp||0);ct("g-name").textContent=e.name,ct("g-company").textContent=e.companyName||"Auriga Logistics",ct("g-level").textContent=i.level,ct("g-xp").style.width=`${Et(i.current/i.need*100,0,100)}%`,ct("g-money").textContent=se(e.money);let s=oe.get(e.currentCity)||oe.get("berlin");ct("g-city").textContent=s.name,ct("g-country").textContent=(hi[s.country]?.flag||"")+" "+(hi[s.country]?.name||""),ct("g-clock").textContent=Bi(t.clock.minutes),ct("g-day").textContent=t.clock.day,this.renderActiveJob(),document.querySelectorAll(".garage-nav button").forEach(a=>a.classList.toggle("active",a.dataset.nav===this.navTab));let r=ct("garage-main");switch(this.navTab){case"jobs":r.innerHTML=this.jobsHtml();break;case"garage":r.innerHTML=this.truckHtml();break;case"dealer":r.innerHTML=this.dealerHtml();break;case"drivers":r.innerHTML=this.driversHtml();break;case"map":r.innerHTML=this.mapHtml(),this.drawFullMap();break;case"stats":r.innerHTML=this.statsHtml();break;case"settings":r.innerHTML=this.settingsHtml();break;default:r.innerHTML=""}}renderActiveJob(){let t=this.game,e=ct("garage-active");if(t.profile?.activeJob){let i=t.profile.activeJob;e.innerHTML=`<div class="card">
        <div class="card-company">\u0410\u041A\u0422\u0418\u0412\u041D\u042B\u0419 \u0420\u0415\u0419\u0421</div>
        <div class="card-route">${i.fromName} <i>\u2192</i> ${i.toName}</div>
        <div class="card-cargo">${i.cargo} \xB7 ${We(i.mass)} \u0442</div>
        <div class="card-stats">
          <div><small>\u041E\u0421\u0422\u0410\u041B\u041E\u0421\u042C</small><b>${Uc(i.distance*1e3)}</b></div>
          <div><small>\u041E\u041F\u041B\u0410\u0422\u0410</small><b style="color:var(--green)">${se(i.pay)}</b></div>
        </div>
        <button class="btn btn-primary btn-sm" data-act="continue-job">\u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u044C \u0440\u0435\u0439\u0441</button>
      </div>`}else e.innerHTML=""}jobsHtml(){let t=this.game,i=(t.offers||[]).filter(r=>this.jobFilter==="all"?!0:this.jobFilter==="urgent"?r.urgent:this.jobFilter==="adr"?r.adr:this.jobFilter==="fridge"?r.category==="fridge":this.jobFilter==="heavy"?r.category==="heavy":this.jobFilter==="fragile"?r.fragile:!0),s=t.profile.truck.fuel;return`
      <div class="section-title">
        <div><h2>\u0420\u044B\u043D\u043E\u043A \u0433\u0440\u0443\u0437\u043E\u0432</h2><p class="sub">\u0421\u0432\u0435\u0436\u0438\u0435 \u043A\u043E\u043D\u0442\u0440\u0430\u043A\u0442\u044B \u0438\u0437 ${oe.get(t.profile.currentCity)?.name}. \u041E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435 \u043A\u0430\u0436\u0434\u044B\u0439 \u0447\u0430\u0441.</p></div>
        <button class="btn btn-sm" data-act="service" data-arg="fuel">\u26FD \u0417\u0430\u043F\u0440\u0430\u0432\u0438\u0442\u044C\u0441\u044F (${Math.round(s)} \u043B)</button>
      </div>
      <div class="filter-bar">
        ${[["all","\u0412\u0441\u0435"],["urgent","\u0421\u0440\u043E\u0447\u043D\u044B\u0435"],["heavy","\u0422\u044F\u0436\u0451\u043B\u044B\u0435"],["fridge","\u0420\u0435\u0444"],["fragile","\u0425\u0440\u0443\u043F\u043A\u0438\u0435"],["adr","ADR"]].map(([r,a])=>`<button class="${this.jobFilter===r?"active":""}" data-act="filter" data-arg="${r}">${a}</button>`).join("")}
      </div>
      <div class="cards">${i.map(r=>this.jobCard(r)).join("")||'<div class="empty-state"><b>\u041D\u0435\u0442 \u043F\u043E\u0434\u0445\u043E\u0434\u044F\u0449\u0438\u0445 \u043A\u043E\u043D\u0442\u0440\u0430\u043A\u0442\u043E\u0432</b>\u041F\u043E\u043F\u0440\u043E\u0431\u0443\u0439\u0442\u0435 \u0434\u0440\u0443\u0433\u043E\u0439 \u0444\u0438\u043B\u044C\u0442\u0440 \u0438\u043B\u0438 \u043E\u0431\u043D\u043E\u0432\u0438\u0442\u0435 \u0441\u043F\u0438\u0441\u043E\u043A.</div>'}</div>
    `}jobCard(t){let i=(this.game.profile.level||1)<(t.minLevel||1),s=Math.round(t.deadlineMin/60),r=t.pay/Math.max(1,t.distance);return`<article class="card">
      <div class="card-head">
        <div>
          <div class="card-company">${t.company}</div>
          <div class="card-route">${t.fromName} <i>\u2192</i> ${t.toName}</div>
        </div>
        <div class="card-tag ${t.adr?"adr":t.urgent?"urgent":""}">${t.tag}</div>
      </div>
      <div class="card-cargo">${t.cargo} <small>\xB7 ${t.trailerName} \xB7 ${We(t.mass)} \u0442</small></div>
      <div class="card-stats">
        <div><small>\u0420\u0410\u0421\u0421\u0422\u041E\u042F\u041D\u0418\u0415</small><b>${We(t.distance)} \u043A\u043C</b></div>
        <div><small>\u0421\u0420\u041E\u041A</small><b>${s} \u0447</b></div>
        <div><small>\u20AC/\u041A\u041C</small><b>${r.toFixed(1)}</b></div>
      </div>
      <div class="card-pay">${se(t.pay)}<small>${t.urgent?"\u043D\u0430\u0434\u0431\u0430\u0432\u043A\u0430 \u0437\u0430 \u0441\u0440\u043E\u0447\u043D\u043E\u0441\u0442\u044C":"\u0444\u0438\u043A\u0441\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u0430\u044F \u043E\u043F\u043B\u0430\u0442\u0430"}</small></div>
      <div class="card-actions">
        <button class="btn btn-primary btn-sm" data-act="accept-job" data-arg="${t.id}" ${i?"disabled":""}>\u041F\u0440\u0438\u043D\u044F\u0442\u044C \u0440\u0435\u0439\u0441</button>
      </div>
      ${i?`<div class="pill bad">\u041D\u0443\u0436\u0435\u043D ${t.minLevel}-\u0439 \u0443\u0440\u043E\u0432\u0435\u043D\u044C</div>`:""}
    </article>`}truckHtml(){let e=this.game.profile,i=Te.find(l=>l.id===e.truck.modelId)||Te[0],s=xn.find(l=>l.id===e.truck.paint)||xn[1],r=e.truck.condition,a=(r.engine+r.tires+r.brakes)/3,o=e.truck.fuel/i.tank*100;return`
      <div class="section-title"><div><h2>\u041C\u043E\u0439 \u0442\u044F\u0433\u0430\u0447</h2><p class="sub">${i.name} \xB7 ${i.hp} \u043B.\u0441. \xB7 \u043F\u0440\u043E\u0431\u0435\u0433 ${We(e.truck.odometer)} \u043A\u043C</p></div>
      <button class="btn btn-sm" data-act="service" data-arg="all">\u{1F527} \u041F\u043E\u043B\u043D\u043E\u0435 \u0422\u041E</button></div>
      <div class="card" style="margin-bottom:14px">
        <div class="truck-visual">
          ${od("#"+kc(s.hex))}
          <div style="flex:1;min-width:200px">
            <div class="field-row"><label>\u0421\u043E\u0441\u0442\u043E\u044F\u043D\u0438\u0435<small>\u0434\u0432\u0438\u0433\u0430\u0442\u0435\u043B\u044C \xB7 \u0448\u0438\u043D\u044B \xB7 \u0442\u043E\u0440\u043C\u043E\u0437\u0430</small></label><b>${Math.round(a)}%</b></div>
            <div class="field-row"><label>\u0422\u043E\u043F\u043B\u0438\u0432\u043E</label><b>${Math.round(e.truck.fuel)} / ${i.tank} \u043B</b></div>
            <div class="field-row"><label>\u0411\u0430\u043A</label>
              <div class="bar" style="width:140px"><i style="width:${Et(o,0,100)}%;background:linear-gradient(90deg,#e2a44a,#ffe08a)"></i></div>
            </div>
            <div class="field-row"><label>\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C</label><b>${Math.round(i.hp*_n.engine[e.truck.engine||0].power)} \u043B.\u0441.</b></div>
            <div class="field-row"><label>\u0420\u0430\u0441\u0445\u043E\u0434</label><b>${i.consumption} \u043B/100 \u043A\u043C</b></div>
          </div>
        </div>
      </div>
      <div class="cards">
        <div class="card">
          <div class="card-company">\u0421\u041E\u0421\u0422\u041E\u042F\u041D\u0418\u0415 \u0423\u0417\u041B\u041E\u0412</div>
          ${[["\u0414\u0432\u0438\u0433\u0430\u0442\u0435\u043B\u044C",r.engine],["\u0428\u0438\u043D\u044B",r.tires],["\u0422\u043E\u0440\u043C\u043E\u0437\u0430",r.brakes]].map(([l,c])=>`<div class="field-row"><label>${l}</label>
              <div class="bar" style="width:120px"><i style="width:${Et(c,0,100)}%;background:linear-gradient(90deg,#e2564a,#e2b64a,#6fd08c)"></i></div>
              <b>${Math.round(c)}%</b></div>`).join("")}
          <button class="btn btn-sm" data-act="service" data-arg="repair">\u{1F527} \u0420\u0435\u043C\u043E\u043D\u0442 \u0438 \u043E\u0431\u0441\u043B\u0443\u0436\u0438\u0432\u0430\u043D\u0438\u0435</button>
        </div>
        <div class="card">
          <div class="card-company">\u0422\u042E\u041D\u0418\u041D\u0413</div>
          ${Object.entries(_n).map(([l,c])=>{let h=e.truck[l]||0,d=c[h+1];return`<div class="field-row"><label>${c[0].name.replace("\u0421\u0442\u0430\u043D\u0434\u0430\u0440\u0442\u043D\u044B\u0439 ","").replace("\u0412\u0441\u0435\u0441\u0435\u0437\u043E\u043D\u043D\u044B\u0435 ","").replace("\u0411\u0435\u0437 ","")}
                <small>${c[h].name}</small></label>
                ${d?`<button class="btn btn-sm" data-act="upgrade" data-arg="${l}:${d.id}">${d.name.split(" ")[0]} \xB7 ${se(d.price)}</button>`:'<span class="pill good">\u041C\u0430\u043A\u0441\u0438\u043C\u0443\u043C</span>'}
              </div>`}).join("")}
        </div>
        <div class="card">
          <div class="card-company">\u041E\u041A\u0420\u0410\u0421\u041A\u0410</div>
          <div class="badge-row">
            ${xn.map(l=>`<button title="${l.name}" data-act="paint" data-arg="${l.id}"
                style="width:34px;height:34px;border-radius:9px;background:#${kc(l.hex)};
                border:2px solid ${l.id===e.truck.paint?"#f2b544":"rgba(255,255,255,.15)"}"></button>`).join("")}
          </div>
          <p style="font-size:12px;color:var(--muted)">\u041F\u0435\u0440\u0435\u043A\u0440\u0430\u0441\u043A\u0430 \u0431\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u0430 \u0432 \u0441\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u043E\u043C \u0433\u0430\u0440\u0430\u0436\u0435.</p>
          <button class="btn btn-sm btn-danger" data-act="sell-truck">\u041F\u0440\u043E\u0434\u0430\u0442\u044C \u0442\u044F\u0433\u0430\u0447</button>
        </div>
        ${(e.owned||[]).length?`<div class="card">
          <div class="card-company">\u0422\u042F\u0413\u0410\u0427\u0418 \u0412 \u0413\u0410\u0420\u0410\u0416\u0415</div>
          ${(e.owned||[]).map((l,c)=>`<div class="field-row"><label>${Te.find(d=>d.id===l.modelId)?.name||l.modelId}<small>\u043F\u0440\u043E\u0431\u0435\u0433 ${We(l.odometer||0)} \u043A\u043C</small></label>
                <button class="btn btn-sm" data-act="take-owned" data-arg="${c}">\u041F\u0435\u0440\u0435\u0441\u0435\u0441\u0442\u044C</button></div>`).join("")}
        </div>`:""}
      </div>
    `}dealerHtml(){let e=this.game.profile;return`
      <div class="section-title"><div><h2>\u0410\u0432\u0442\u043E\u0441\u0430\u043B\u043E\u043D AURIGA</h2><p class="sub">\u041D\u043E\u0432\u044B\u0435 \u0438 \u043F\u043E\u0434\u0435\u0440\u0436\u0430\u043D\u043D\u044B\u0435 \u0442\u044F\u0433\u0430\u0447\u0438. \u0412\u0430\u0448 \u0442\u0435\u043A\u0443\u0449\u0438\u0439: ${Te.find(i=>i.id===e.truck.modelId)?.name}</p></div></div>
      <div class="cards">
        ${Te.map(i=>{let s=e.truck.modelId===i.id,r=(e.level||1)<i.level;return`<article class="card">
            <div class="card-head">
              <div class="card-route">${i.name}</div>
              ${s?'<span class="pill good">\u0412\u0430\u0448</span>':r?`<span class="pill bad">${i.level} \u0443\u0440.</span>`:i.used?'<span class="pill warn">\u0411/\u0423</span>':""}
            </div>
            ${od("#"+kc(i.color),!1)}
            <p style="font-size:12px;color:var(--muted);margin:0">${i.desc}</p>
            <div class="card-stats">
              <div><small>\u041C\u041E\u0429\u041D\u041E\u0421\u0422\u042C</small><b>${i.hp} \u043B.\u0441.</b></div>
              <div><small>\u0411\u0410\u041A</small><b>${i.tank} \u043B</b></div>
              <div><small>\u0420\u0410\u0421\u0425\u041E\u0414</small><b>${i.consumption}</b></div>
            </div>
            <div class="card-actions">
              ${s?'<button class="btn btn-sm" disabled>\u0412 \u0433\u0430\u0440\u0430\u0436\u0435</button>':`<button class="btn btn-primary btn-sm" data-act="buy-truck" data-arg="${i.id}" ${r?"disabled":""}>\u041A\u0443\u043F\u0438\u0442\u044C \xB7 ${se(i.price)}</button>`}
            </div>
          </article>`}).join("")}
      </div>`}driversHtml(){let e=this.game.profile,i=oe.get(e.currentCity),s=e.garages.includes(e.currentCity),r=24e3+(i?.size||1)*12e3,a=e.drivers||[],o=a.reduce((l,c)=>l+c.rate,0);return`
      <div class="section-title"><div><h2>\u0413\u0430\u0440\u0430\u0436\u0438 \u0438 \u0432\u043E\u0434\u0438\u0442\u0435\u043B\u0438</h2><p class="sub">\u041F\u0430\u0441\u0441\u0438\u0432\u043D\u044B\u0439 \u0434\u043E\u0445\u043E\u0434, \u043F\u043E\u043A\u0430 \u0432\u044B \u0437\u0430 \u0440\u0443\u043B\u0451\u043C.</p></div>
      <span class="pill ${a.length?"good":""}">${a.length} \u0432\u043E\u0434\u0438\u0442\u0435\u043B\u0435\u0439 \xB7 ${se(o)}/\u0447\u0430\u0441</span></div>
      <div class="cards">
        <div class="card">
          <div class="card-company">\u0413\u0410\u0420\u0410\u0416 \u0412 ${i.name.toUpperCase()}</div>
          <div class="card-route">${s?"\u0423\u0436\u0435 \u043A\u0443\u043F\u043B\u0435\u043D":se(r)}</div>
          <p style="font-size:12px;color:var(--muted);margin:0">\u0413\u0430\u0440\u0430\u0436 \u043F\u043E\u0437\u0432\u043E\u043B\u044F\u0435\u0442 \u043D\u0430\u043D\u0438\u043C\u0430\u0442\u044C \u0432\u043E\u0434\u0438\u0442\u0435\u043B\u0435\u0439 \u0438 \u043C\u0435\u043D\u044F\u0442\u044C \u0442\u044F\u0433\u0430\u0447 \u0432 \u044D\u0442\u043E\u043C \u0433\u043E\u0440\u043E\u0434\u0435.</p>
          ${s?'<span class="pill good">\u0413\u043E\u0442\u043E\u0432 \u043A \u0440\u0430\u0431\u043E\u0442\u0435</span>':`<button class="btn btn-primary btn-sm" data-act="buy-garage" data-arg="${e.currentCity}" ${e.money<r?"disabled":""}>\u041A\u0443\u043F\u0438\u0442\u044C \u0433\u0430\u0440\u0430\u0436</button>`}
        </div>
        <div class="card">
          <div class="card-company">\u041D\u0410\u0401\u041C</div>
          <div class="card-route">\u0412\u043E\u0434\u0438\u0442\u0435\u043B\u044C \u0437\u0430 12 000 \u20AC</div>
          <p style="font-size:12px;color:var(--muted);margin:0">\u0412\u043E\u0434\u0438\u0442\u0435\u043B\u044C \u043F\u0440\u0438\u043D\u043E\u0441\u0438\u0442 220\u2013400 \u20AC \u0432 \u0447\u0430\u0441 \u0438\u0433\u0440\u043E\u0432\u043E\u0433\u043E \u0432\u0440\u0435\u043C\u0435\u043D\u0438 \u0438 \u043F\u043E\u0441\u0442\u0435\u043F\u0435\u043D\u043D\u043E \u043D\u0430\u0431\u0438\u0440\u0430\u0435\u0442 \u043E\u043F\u044B\u0442.</p>
          <button class="btn btn-sm" data-act="hire-driver" ${s&&e.money>=12e3&&a.length<5?"":"disabled"}>\u041D\u0430\u043D\u044F\u0442\u044C \u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044F</button>
        </div>
      </div>
      <div class="section-title" style="margin-top:22px"><h3>\u041C\u043E\u0438 \u0433\u0430\u0440\u0430\u0436\u0438</h3></div>
      <div class="badge-row">${e.garages.length?e.garages.map(l=>`<span class="badge-item">\u{1F3E0} ${oe.get(l)?.name||l}</span>`).join(""):'<span class="pill">\u041F\u043E\u043A\u0430 \u043D\u0435\u0442 \u0433\u0430\u0440\u0430\u0436\u0435\u0439</span>'}</div>
      <div class="section-title" style="margin-top:22px"><h3>\u0412\u043E\u0434\u0438\u0442\u0435\u043B\u0438</h3></div>
      <div class="cards">
        ${a.length?a.map(l=>`<div class="card">
            <div class="card-head"><div class="card-route">${l.name}</div><span class="pill">${l.city?oe.get(l.city)?.name:"\u2014"}</span></div>
            <div class="card-stats">
              <div><small>\u041E\u041F\u042B\u0422</small><b>${l.exp} \u0440\u0435\u0439\u0441\u043E\u0432</b></div>
              <div><small>\u0414\u041E\u0425\u041E\u0414</small><b>${se(l.rate)}/\u0447</b></div>
              <div><small>\u0417\u0410\u0420\u0410\u0411\u041E\u0422\u0410\u041D\u041E</small><b>${se(l.earned)}</b></div>
            </div>
            <button class="btn btn-sm btn-ghost" data-act="fire-driver" data-arg="${l.id}">\u0423\u0432\u043E\u043B\u0438\u0442\u044C</button>
          </div>`).join(""):'<div class="empty-state"><b>\u041D\u0435\u0442 \u0432\u043E\u0434\u0438\u0442\u0435\u043B\u0435\u0439</b>\u041A\u0443\u043F\u0438\u0442\u0435 \u0433\u0430\u0440\u0430\u0436 \u0438 \u043D\u0430\u0439\u043C\u0438\u0442\u0435 \u043F\u0435\u0440\u0432\u043E\u0433\u043E \u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044F.</div>'}
      </div>`}mapHtml(){let e=this.game.profile;return`
      <div class="section-title"><div><h2>\u041A\u0430\u0440\u0442\u0430 \u0415\u0432\u0440\u043E\u043F\u044B</h2><p class="sub">139 \u0433\u043E\u0440\u043E\u0434\u043E\u0432 \u0432 26 \u0441\u0442\u0440\u0430\u043D\u0430\u0445. \u0417\u0435\u043B\u0451\u043D\u044B\u043C \u2014 \u0442\u0435\u043A\u0443\u0449\u0438\u0439 \u043C\u0430\u0440\u0448\u0440\u0443\u0442.</p></div>
      <div class="range-row"><select data-select="mapcity" style="background:rgba(255,255,255,.06);border:1px solid var(--line);color:var(--text);padding:9px 12px;border-radius:9px;font-family:inherit">${Un.map(s=>`<option value="${s.id}">${s.name} \xB7 ${hi[s.country]?.name||""}</option>`).join("")}</select>
      <button class="btn btn-sm" data-act="free-drive-select">\u0421\u0432\u043E\u0431\u043E\u0434\u043D\u0430\u044F \u043F\u043E\u0435\u0437\u0434\u043A\u0430</button></div></div>
      <div class="map-wrap"><canvas id="map-canvas" width="1200" height="860"></canvas></div>
      <div class="map-legend">
        <span><i style="background:#6fb6e8"></i> \u0433\u043E\u0440\u043E\u0434\u0430</span>
        <span><i style="background:#4ec9b0"></i> \u0442\u0435\u043A\u0443\u0449\u0438\u0439 \u043C\u0430\u0440\u0448\u0440\u0443\u0442</span>
        <span><i style="background:#f2b544"></i> \u0432\u044B \u0437\u0434\u0435\u0441\u044C</span>
        <span><i style="background:#8ba0a8"></i> \u0434\u043E\u0440\u043E\u0433\u0438</span>
      </div>`}drawFullMap(){let t=ct("map-canvas");if(!t)return;let e=this.game,i=t.getContext("2d"),s=t.width,r=t.height;i.clearRect(0,0,s,r),i.fillStyle="#081014",i.fillRect(0,0,s,r);let a=e.network;if(!a)return;let o=[...a.list.map(M=>M.x)],l=[...a.list.map(M=>M.z)],c=Math.min(...o)-4e3,h=Math.max(...o)+4e3,d=Math.min(...l)-4e3,u=Math.max(...l)+4e3,f=Math.min(s/(h-c),r/(u-d))*.94,m=s/2-(c+h)/2*f,y=r/2+(d+u)/2*f,g=M=>m+M*f,p=M=>y-M*f;i.strokeStyle="rgba(120,160,170,.08)",i.lineWidth=1;for(let M=0;M<s;M+=60)i.beginPath(),i.moveTo(M,0),i.lineTo(M,r),i.stroke();for(let M=0;M<r;M+=60)i.beginPath(),i.moveTo(0,M),i.lineTo(s,M),i.stroke();i.strokeStyle="rgba(140,170,180,.35)",i.lineWidth=1.5;for(let[M,w]of a.adj){if(!oe.get(M))continue;let E=e.cityPos(M);for(let S of w){if(M>S.to)continue;let R=e.cityPos(S.to);i.beginPath(),i.moveTo(g(E.x),p(E.z)),i.lineTo(g(R.x),p(R.z)),i.stroke()}}e.route&&(i.strokeStyle="#4ec9b0",i.lineWidth=3,i.beginPath(),e.route.samples.forEach((M,w)=>{if(w%4)return;let x=g(M.x),E=p(M.z);w===0?i.moveTo(x,E):i.lineTo(x,E)}),i.stroke());for(let M of a.list){let w=g(M.x),x=p(M.z);i.fillStyle=M.size===3?"#6fb6e8":M.size===2?"rgba(111,182,232,.8)":"rgba(111,182,232,.55)",i.beginPath(),i.arc(w,x,2+M.size,0,Math.PI*2),i.fill(),M.size>=2&&(i.fillStyle="rgba(220,235,238,.65)",i.font="11px system-ui",i.fillText(M.name,w+6,x-6))}if(e.profile){let M=oe.get(e.profile.currentCity);if(M){let w=e.cityPos(M.id);i.fillStyle="#f2b544",i.beginPath(),i.arc(g(w.x),p(w.z),7,0,Math.PI*2),i.fill(),i.strokeStyle="rgba(242,181,68,.4)",i.lineWidth=3,i.beginPath(),i.arc(g(w.x),p(w.z),14,0,Math.PI*2),i.stroke()}}}statsHtml(){let e=this.game.profile,i=gi(e.xp||0),s=e.stats,r=zo.map(a=>{let o=e.skills[a.id]||0,l=Xo(e,a.id),c=5;return`<div class="card">
        <div class="card-head"><div class="card-route" style="font-size:14px">${a.name}</div><span class="pill ${o?"good":""}">${o}/${c}</span></div>
        <p style="font-size:12px;color:var(--muted);margin:0">${a.desc}</p>
        <button class="btn btn-sm" data-act="skill" data-arg="${a.id}" ${o>=c||e.money<l?"disabled":""}>${o>=c?"\u041C\u0430\u043A\u0441\u0438\u043C\u0443\u043C":"\u041E\u0431\u0443\u0447\u0438\u0442\u044C\u0441\u044F \xB7 "+se(l)}</button>
      </div>`}).join("");return`
      <div class="section-title"><div><h2>\u0421\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0430 \u0438 \u043D\u0430\u0432\u044B\u043A\u0438</h2><p class="sub">\u0423\u0440\u043E\u0432\u0435\u043D\u044C ${i.level} \xB7 ${We(e.xp)} \u043E\u043F\u044B\u0442\u0430 \xB7 \u0434\u043E \u0441\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0433\u043E ${We(i.need-i.current)} XP</p></div></div>
      <div class="stat-grid">
        <div class="stat-box"><small>\u0414\u041E\u0421\u0422\u0410\u0412\u041B\u0415\u041D\u041E \u0413\u0420\u0423\u0417\u041E\u0412</small><b>${We(s.deliveries)}</b></div>
        <div class="stat-box"><small>\u041E\u0411\u0429\u0418\u0419 \u041F\u0420\u041E\u0411\u0415\u0413</small><b>${We(s.distance)} \u043A\u043C</b></div>
        <div class="stat-box"><small>\u0417\u0410\u0420\u0410\u0411\u041E\u0422\u0410\u041D\u041E</small><b>${se(s.earnings)}</b></div>
        <div class="stat-box"><small>\u0428\u0422\u0420\u0410\u0424\u042B</small><b style="color:var(--red)">${se(s.fines)}</b></div>
        <div class="stat-box"><small>\u0410\u0412\u0410\u0420\u0418\u0418</small><b>${We(s.collisions)}</b></div>
        <div class="stat-box"><small>\u041C\u0410\u041A\u0421. \u0421\u041A\u041E\u0420\u041E\u0421\u0422\u042C</small><b>${We(s.topSpeed)} \u043A\u043C/\u0447</b></div>
      </div>
      <div class="section-title" style="margin-top:24px"><h3>\u041D\u0430\u0432\u044B\u043A\u0438</h3><span class="pill">${se(e.money)}</span></div>
      <div class="cards">${r}</div>
      <div class="section-title" style="margin-top:24px"><h3>\u0414\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u044F</h3><span class="pill">${e.achievements.length} / ${bs.length}</span></div>
      <div class="badge-row">
        ${bs.map(a=>`<div class="badge-item ${e.achievements.includes(a.id)?"":"locked"}" title="${a.desc}">
            <span class="badge-icon">${a.icon}</span><span>${a.name}</span></div>`).join("")}
      </div>`}settingsHtml(){let e=this.game.settings;return`
      <div class="section-title"><div><h2>\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438</h2><p class="sub">\u041F\u0440\u0438\u043C\u0435\u043D\u044F\u044E\u0442\u0441\u044F \u0441\u0440\u0430\u0437\u0443.</p></div></div>
      <div class="card">
        <div class="field-row"><label>\u0417\u0432\u0443\u043A<small>\u0434\u0432\u0438\u0433\u0430\u0442\u0435\u043B\u044C, \u0434\u043E\u0436\u0434\u044C, \u0441\u0438\u0433\u043D\u0430\u043B\u044B</small></label>
          <button class="btn btn-sm" data-act="toggle-setting" data-arg="sound">${e.sound?"\u0412\u043A\u043B\u044E\u0447\u0451\u043D":"\u0412\u044B\u043A\u043B\u044E\u0447\u0435\u043D"}</button></div>
        <div class="field-row"><label>\u0413\u0440\u043E\u043C\u043A\u043E\u0441\u0442\u044C</label>
          <div class="range-row"><input type="range" min="0" max="100" value="${Math.round(e.volume*100)}" data-input="volume">
          <span class="range-label" id="volume-value">${Math.round(e.volume*100)}%</span></div></div>
        <div class="field-row"><label>\u041A\u0430\u043C\u0435\u0440\u0430 \u043F\u043E \u0443\u043C\u043E\u043B\u0447\u0430\u043D\u0438\u044E<small>V \u043F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0430\u0435\u0442 \u0432 \u0438\u0433\u0440\u0435</small></label>
          <select data-setting="camera">
            ${["interior","hood","chase","far"].map(i=>`<option value="${i}" ${e.camera===i?"selected":""}>${i==="interior"?"\u0418\u0437 \u043A\u0430\u0431\u0438\u043D\u044B":i==="hood"?"\u0421 \u043A\u0430\u043F\u043E\u0442\u0430":i==="chase"?"\u0421\u0437\u0430\u0434\u0438":"\u0421\u0432\u0435\u0440\u0445\u0443 \u0441\u0437\u0430\u0434\u0438"}</option>`).join("")}
          </select></div>
        <div class="field-row"><label>\u0421\u043A\u043E\u0440\u043E\u0441\u0442\u044C \u0432\u0440\u0435\u043C\u0435\u043D\u0438</label>
          <select data-setting="timeScale">
            ${[[1,"\u041E\u0431\u044B\u0447\u043D\u0430\u044F"],[3,"\u0423\u0441\u043A\u043E\u0440\u0435\u043D\u043D\u0430\u044F \xD73"],[6,"\u0411\u044B\u0441\u0442\u0440\u0430\u044F \xD76"]].map(([i,s])=>`<option value="${i}" ${String(e.timeScale)===String(i)?"selected":""}>${s}</option>`).join("")}
          </select></div>
        <div class="field-row"><label>\u041A\u0430\u0447\u0435\u0441\u0442\u0432\u043E \u0433\u0440\u0430\u0444\u0438\u043A\u0438</label>
          <select data-setting="quality">
            ${[["high","\u0412\u044B\u0441\u043E\u043A\u043E\u0435"],["medium","\u0421\u0440\u0435\u0434\u043D\u0435\u0435"],["low","\u041D\u0438\u0437\u043A\u043E\u0435"]].map(([i,s])=>`<option value="${i}" ${e.quality===i?"selected":""}>${s}</option>`).join("")}
          </select></div>
        <div class="field-row"><label>\u041F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0442\u044C FPS</label>
          <button class="btn btn-sm" data-act="toggle-setting" data-arg="showFps">${e.showFps?"\u0412\u043A\u043B":"\u0412\u044B\u043A\u043B"}</button></div>
        <div class="field-row"><label>\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438</label><button class="btn btn-sm" data-act="reset-settings">\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C</button></div>
      </div>
      <div class="section-title" style="margin-top:24px"><h3>\u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435</h3></div>
      <div class="card" style="font-size:13px;line-height:1.9">
        <div><b>W / \u2191</b> \u2014 \u0433\u0430\u0437 \xB7 <b>S / \u2193</b> \u2014 \u0442\u043E\u0440\u043C\u043E\u0437 \xB7 <b>A D / \u2190 \u2192</b> \u2014 \u0440\u0443\u043B\u044C</div>
        <div><b>\u041F\u0440\u043E\u0431\u0435\u043B</b> \u2014 \u0440\u0443\u0447\u043D\u0438\u043A \xB7 <b>Shift / Ctrl</b> \u2014 \u0432\u044B\u0448\u0435/\u043D\u0438\u0436\u0435 \u043F\u0435\u0440\u0435\u0434\u0430\u0447\u0430 (\u0432 \u0440\u0443\u0447\u043D\u043E\u043C \u0440\u0435\u0436\u0438\u043C\u0435)</div>
        <div><b>C</b> \u2014 \u043A\u0440\u0443\u0438\u0437-\u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044C \xB7 <b>M</b> \u2014 \u0430\u0432\u0442\u043E/\u0440\u0443\u0447\u043D\u0430\u044F \u041A\u041F\u041F \xB7 <b>L</b> \u2014 \u0444\u0430\u0440\u044B</div>
        <div><b>E</b> \u2014 \u0432\u0437\u0430\u0438\u043C\u043E\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435 (\u043F\u043E\u0433\u0440\u0443\u0437\u043A\u0430, \u0437\u0430\u043F\u0440\u0430\u0432\u043A\u0430, \u043E\u0442\u0434\u044B\u0445) \xB7 <b>H</b> \u2014 \u0441\u0438\u0433\u043D\u0430\u043B</div>
        <div><b>V</b> \u2014 \u043A\u0430\u043C\u0435\u0440\u0430 \xB7 <b>P</b> \u2014 \u0441\u043D\u0438\u043C\u043E\u043A \u044D\u043A\u0440\u0430\u043D\u0430 \xB7 <b>Esc</b> \u2014 \u043F\u0430\u0443\u0437\u0430</div>
      </div>
      <div class="section-title" style="margin-top:24px"><h3>\u0421\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0435</h3></div>
      <div class="card">
        <div class="field-row"><label>\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C \u0441\u0435\u0439\u0447\u0430\u0441</label><button class="btn btn-sm" onclick="window.__eurotrakSave && window.__eurotrakSave()">\u{1F4BE} \u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C</button></div>
        <div class="field-row"><label>\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0442\u0435\u043A\u0443\u0449\u0443\u044E \u043A\u0430\u0440\u044C\u0435\u0440\u0443<small>\u0421\u043B\u043E\u0442 \u0431\u0443\u0434\u0435\u0442 \u0441\u0432\u043E\u0431\u043E\u0434\u0435\u043D</small></label><button class="btn btn-danger btn-sm" data-act="reset-save">\u0423\u0434\u0430\u043B\u0438\u0442\u044C</button></div>
      </div>`}showSettings(t=!1){if(t&&(!this.game.profile||this.game.state!=="garage")){this.openModal({eyebrow:"\u041D\u0410\u0421\u0422\u0420\u041E\u0419\u041A\u0418",title:"\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0438\u0433\u0440\u044B",body:this.settingsHtml(!1),actions:[{label:"\u0417\u0430\u043A\u0440\u044B\u0442\u044C",primary:!0,act:"close"}]});return}this.navTab="settings",this.renderGarage()}showAbout(){this.openModal({eyebrow:"\u041E\u0411 \u0418\u0413\u0420\u0415",title:"\u0415\u0412\u0420\u041E\u0422\u0420\u0410\u041A",body:`
        <p><b>\u0415\u0412\u0420\u041E\u0422\u0420\u0410\u041A</b> \u2014 \u0441\u0430\u043C\u043E\u0441\u0442\u043E\u044F\u0442\u0435\u043B\u044C\u043D\u044B\u0439 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u043D\u044B\u0439 \u0441\u0438\u043C\u0443\u043B\u044F\u0442\u043E\u0440 \u0433\u0440\u0443\u0437\u043E\u043F\u0435\u0440\u0435\u0432\u043E\u0437\u043E\u043A, \u0432\u0434\u043E\u0445\u043D\u043E\u0432\u043B\u0451\u043D\u043D\u044B\u0439 \u0436\u0430\u043D\u0440\u043E\u043C \u0434\u0430\u043B\u044C\u043D\u043E\u0431\u043E\u0439\u043D\u044B\u0445 \u0441\u0438\u043C\u0443\u043B\u044F\u0442\u043E\u0440\u043E\u0432. \u0422\u044F\u0433\u0430\u0447\u0438 \u043C\u0430\u0440\u043A\u0438 AURIGA \u0438 \u0432\u0441\u0435 \u0433\u0440\u0443\u0437\u043E\u0432\u0438\u043A\u0438 \u0432\u044B\u043C\u044B\u0448\u043B\u0435\u043D\u044B: \u044D\u0442\u043E \u043D\u0435 \u043A\u043E\u043F\u0438\u0438 \u0440\u0435\u0430\u043B\u044C\u043D\u044B\u0445 \u043C\u0430\u0448\u0438\u043D.</p>
        <h4>\u0427\u0442\u043E \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u043E</h4>
        <p>139 \u0433\u043E\u0440\u043E\u0434\u043E\u0432 \u0432 26 \u0441\u0442\u0440\u0430\u043D\u0430\u0445, 30 \u0432\u0438\u0434\u043E\u0432 \u0433\u0440\u0443\u0437\u0430 \u0438 6 \u0442\u0438\u043F\u043E\u0432 \u043F\u0440\u0438\u0446\u0435\u043F\u043E\u0432, \u043A\u0430\u0440\u044C\u0435\u0440\u0430 \u0441 \u0443\u0440\u043E\u0432\u043D\u0435\u043C \u0438 \u043D\u0430\u0432\u044B\u043A\u0430\u043C\u0438, \u044D\u043A\u043E\u043D\u043E\u043C\u0438\u043A\u0430 \u0441 \u0442\u043E\u043F\u043B\u0438\u0432\u043E\u043C, \u0440\u0435\u043C\u043E\u043D\u0442\u043E\u043C, \u0448\u0442\u0440\u0430\u0444\u0430\u043C\u0438 \u0438 \u043A\u0440\u0435\u0434\u0438\u0442\u043E\u043C, \u0433\u0430\u0440\u0430\u0436\u0438, \u043D\u0430\u0451\u043C\u043D\u044B\u0435 \u0432\u043E\u0434\u0438\u0442\u0435\u043B\u0438, \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u044F \u0438 \u0430\u0432\u0442\u043E\u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0435 \u0432 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435.</p>
        <h4>\u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435</h4>
        <p>W/S \u2014 \u0433\u0430\u0437 \u0438 \u0442\u043E\u0440\u043C\u043E\u0437, A/D \u2014 \u0440\u0443\u043B\u044C, E \u2014 \u0432\u0437\u0430\u0438\u043C\u043E\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435, C \u2014 \u043A\u0440\u0443\u0438\u0437, M \u2014 \u0440\u0435\u0436\u0438\u043C \u041A\u041F\u041F, V \u2014 \u043A\u0430\u043C\u0435\u0440\u0430, Esc \u2014 \u043F\u0430\u0443\u0437\u0430. \u041D\u0430 \u0442\u0435\u043B\u0435\u0444\u043E\u043D\u0435 \u2014 \u044D\u043A\u0440\u0430\u043D\u043D\u044B\u0435 \u043A\u043D\u043E\u043F\u043A\u0438.</p>
        <h4>\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0433\u0440\u0430\u0444\u0438\u043A\u0438</h4>
        <p>\u0418\u0433\u0440\u0430 \u0440\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u043D\u0430 \u043D\u0430 \u0441\u043B\u0430\u0431\u044B\u0435 \u0443\u0441\u0442\u0440\u043E\u0439\u0441\u0442\u0432\u0430: \u043D\u0438\u0437\u043A\u0430\u044F \u0434\u0435\u0442\u0430\u043B\u0438\u0437\u0430\u0446\u0438\u044F \u0438 \u043C\u0435\u043D\u044C\u0448\u0435\u0435 \u0440\u0430\u0437\u0440\u0435\u0448\u0435\u043D\u0438\u0435 \u0432\u043A\u043B\u044E\u0447\u0430\u044E\u0442\u0441\u044F \u0432 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0430\u0445 \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0430 \u0438\u043B\u0438 \u0443\u043C\u0435\u043D\u044C\u0448\u0435\u043D\u0438\u0435\u043C \u043E\u043A\u043D\u0430.</p>`,actions:[{label:"\u041F\u043E\u043D\u044F\u0442\u043D\u043E",primary:!0,act:"close"}]})}openModal({eyebrow:t="\u0418\u041D\u0424\u041E\u0420\u041C\u0410\u0426\u0418\u042F",title:e="",body:i="",actions:s=[]}){ct("modal-eyebrow").textContent=t,ct("modal-title").textContent=e,ct("modal-body").innerHTML=i,ct("modal-foot").innerHTML=s.map(r=>`<button class="btn ${r.primary?"btn-primary":""} ${r.danger?"btn-danger":""}" data-act="${r.act||"close"}" data-arg="${r.arg||""}">${r.label}</button>`).join(""),ct("modal-root").classList.remove("hidden")}closeModal(){ct("modal-root").classList.add("hidden"),this.game.onModalClosed&&this.game.onModalClosed()}showWork(t,e,i=!0){let s=ct("work-overlay");if(s){if(!i){s.classList.add("hidden");return}s.classList.remove("hidden"),ct("work-title").textContent=t,ct("work-bar").style.width=Math.round(Et(e,0,1)*100)+"%"}}toast(t,e="",i=3200){let s=ct("toast-stack"),r=document.createElement("div");for(r.className="toast "+e,r.textContent=t,s.appendChild(r);s.children.length>4;)s.removeChild(s.firstChild);setTimeout(()=>{r.style.opacity="0",r.style.transform="translateY(-6px)",r.style.transition="all .3s",setTimeout(()=>r.remove(),320)},i)}flashDamage(){let t=ct("damage-flash");t.classList.add("on"),setTimeout(()=>t.classList.remove("on"),140)}fuelDialog(t,e,i,s){let r=Math.max(0,Math.floor(i-e)),a=Math.max(0,Math.min(r,Math.floor(s/t))),o=Math.min(a,Math.ceil(r*.7));this.game.currentFuelPrice=t,this.openModal({eyebrow:"\u0410\u0417\u0421",title:"\u0417\u0430\u043F\u0440\u0430\u0432\u043A\u0430",body:`<div class="fuel-dialog">
        <div class="fuel-price"><span>\u0426\u0435\u043D\u0430 \u0437\u0430 \u043B\u0438\u0442\u0440</span><b>${t.toFixed(2)} \u20AC</b></div>
        <div class="fuel-price"><span>\u0412 \u0431\u0430\u043A\u0435</span><b>${Math.round(e)} / ${i} \u043B</b></div>
        <input class="fuel-slider" id="fuel-range" type="range" min="0" max="${Math.max(1,a)}" value="${o}" data-input="fuel">
        <div class="fuel-price"><span>\u0417\u0430\u043B\u0438\u0442\u044C</span><b id="fuel-amount">${o} \u043B</b></div>
        <div class="fuel-total"><span>\u0418\u0442\u043E\u0433\u043E</span><b id="fuel-total">${se(o*t)}</b></div>
        ${a<r?'<p style="color:var(--amber);font-size:12px">\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0434\u0435\u043D\u0435\u0433 \u043D\u0430 \u043F\u043E\u043B\u043D\u044B\u0439 \u0431\u0430\u043A.</p>':""}
      </div>`,actions:[{label:"\u041E\u0442\u043C\u0435\u043D\u0430",act:"close"},{label:"\u0417\u0430\u043F\u0440\u0430\u0432\u0438\u0442\u044C",primary:!0,act:"fuel-confirm"}]})}confirmRest(){let t=this.game;this.openModal({eyebrow:"\u0417\u041E\u041D\u0410 \u041E\u0422\u0414\u042B\u0425\u0410",title:"\u041E\u0442\u0434\u043E\u0445\u043D\u0443\u0442\u044C 9 \u0447\u0430\u0441\u043E\u0432",body:`<p>\u041E\u0442\u0434\u044B\u0445 \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442 \u0441\u0438\u043B\u044B \u0438 \u0441\u0434\u0432\u0438\u043D\u0435\u0442 \u0438\u0433\u0440\u043E\u0432\u043E\u0435 \u0432\u0440\u0435\u043C\u044F \u043D\u0430 9 \u0447\u0430\u0441\u043E\u0432. \u0421\u0435\u0439\u0447\u0430\u0441 ${Bi(t.clock.minutes)}, \u0434\u0435\u043D\u044C ${t.clock.day}.</p>
        <p>\u0421\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C \u0441\u0442\u043E\u044F\u043D\u043A\u0438 \u2014 <b>45 \u20AC</b>.</p>`,actions:[{label:"\u041E\u0442\u043C\u0435\u043D\u0430",act:"close"},{label:"\u041E\u0442\u0434\u043E\u0445\u043D\u0443\u0442\u044C",primary:!0,act:"rest-confirm"}]})}confirmRepair(t,e){let i=this.game;this.openModal({eyebrow:"\u0421\u0415\u0420\u0412\u0418\u0421",title:"\u0420\u0435\u043C\u043E\u043D\u0442 \u0438 \u043E\u0431\u0441\u043B\u0443\u0436\u0438\u0432\u0430\u043D\u0438\u0435",body:`<p>${e}</p>
        <div class="field-row"><label>\u0421\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C \u0440\u0430\u0431\u043E\u0442</label><b>${se(t)}</b></div>
        <div class="field-row"><label>\u0412 \u043A\u043E\u0448\u0435\u043B\u044C\u043A\u0435</label><b>${se(i.profile.money)}</b></div>`,actions:[{label:"\u041E\u0442\u043C\u0435\u043D\u0430",act:"close"},{label:"\u041E\u043F\u043B\u0430\u0442\u0438\u0442\u044C",primary:!0,act:"repair-confirm",arg:"all"}]})}confirmBuyTruck(t,e){this.openModal({eyebrow:"\u0410\u0412\u0422\u041E\u0421\u0410\u041B\u041E\u041D",title:t.name,body:`<p>${t.desc}</p>
        <div class="field-row"><label>\u0421\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C</label><b>${se(t.price)}</b></div>
        <div class="field-row"><label>Trade-in \u0442\u0435\u043A\u0443\u0449\u0435\u0433\u043E \u0442\u044F\u0433\u0430\u0447\u0430</label><b style="color:var(--green)">\u2212 ${se(e)}</b></div>
        <div class="field-row"><label>\u0418\u0442\u043E\u0433\u043E \u043A \u043E\u043F\u043B\u0430\u0442\u0435</label><b>${se(Math.max(0,t.price-e))}</b></div>`,actions:[{label:"\u041E\u0442\u043C\u0435\u043D\u0430",act:"close"},{label:"\u041A\u0443\u043F\u0438\u0442\u044C",primary:!0,act:"buy-truck-confirm",arg:t.id}]})}deliveryResult({job:t,pay:e,notes:i,xp:s,stats:r,levelUp:a}){this.openModal({eyebrow:"\u0414\u041E\u0421\u0422\u0410\u0412\u041A\u0410 \u0412\u042B\u041F\u041E\u041B\u041D\u0415\u041D\u0410",title:"\u0413\u0440\u0443\u0437 \u0434\u043E\u0441\u0442\u0430\u0432\u043B\u0435\u043D",body:`<div class="result-hero"><div class="money">${se(e)}</div><span class="pill good">${t.fromName} \u2192 ${t.toName}</span></div>
        <div class="result-rows">
          <div><span>\u0413\u0440\u0443\u0437</span><span>${t.cargo} \xB7 ${We(t.mass)} \u0442</span></div>
          <div><span>\u0420\u0430\u0441\u0441\u0442\u043E\u044F\u043D\u0438\u0435</span><span>${We(t.distance)} \u043A\u043C</span></div>
          ${i.map(o=>`<div><span>${o}</span><span></span></div>`).join("")}
          <div><span>\u041E\u043F\u044B\u0442</span><span>+${s} XP</span></div>
          <div><span>\u041F\u0440\u043E\u0431\u0435\u0433</span><span>+${We(r.distance)} \u043A\u043C</span></div>
        </div>
        ${a?`<p style="color:var(--amber);font-weight:700;text-align:center;margin-top:14px">\u041D\u043E\u0432\u044B\u0439 \u0443\u0440\u043E\u0432\u0435\u043D\u044C: ${a}!</p>`:""}`,actions:[{label:"\u0412 \u0433\u0430\u0440\u0430\u0436",primary:!0,act:"goto-jobs"}]})}};function kc(n){return"#"+n.toString(16).padStart(6,"0")}var Bc=new Map;function Fn(n,t,e,i,{repeat:s=[1,1],srgb:r=!0}={}){if(Bc.has(n))return Bc.get(n);let a=document.createElement("canvas");a.width=t,a.height=e;let o=a.getContext("2d");i(o,t,e);let l=new ni(a);return l.wrapS=l.wrapT=an,l.repeat.set(s[0],s[1]),l.anisotropy=8,r&&(l.colorSpace=Se),Bc.set(n,l),l}var Cr={asphalt(){return Fn("asphalt",512,512,(n,t,e)=>{n.fillStyle="#4a4d4f",n.fillRect(0,0,t,e);let i=Be(7);for(let s=0;s<26e3;s++){let r=52+Math.floor(i()*46);n.fillStyle=`rgb(${r},${r+2},${r+3})`,n.fillRect(i()*t,i()*e,1+i()*2,1+i()*2)}for(let s=0;s<60;s++){n.strokeStyle=`rgba(30,32,34,${.05+i()*.12})`,n.lineWidth=1+i()*3,n.beginPath();let r=i()*t;n.moveTo(r,0),n.bezierCurveTo(r+20,e*.3,r-20,e*.6,r+10,e),n.stroke()}},{repeat:[4,60]})},grass(){return Fn("grass",512,512,(n,t,e)=>{n.fillStyle="#4d6238",n.fillRect(0,0,t,e);let i=Be(21);for(let s=0;s<18e3;s++){let r=i();n.fillStyle=r>.6?"#5b7440":r>.3?"#42592f":"#394d29",n.fillRect(i()*t,i()*e,2+i()*4,2+i()*4)}},{repeat:[16,120]})},concrete(){return Fn("concrete",256,256,(n,t,e)=>{n.fillStyle="#9a9a94",n.fillRect(0,0,t,e);let i=Be(3);for(let s=0;s<6e3;s++){let r=130+Math.floor(i()*40);n.fillStyle=`rgb(${r},${r},${r-4})`,n.fillRect(i()*t,i()*e,2,2)}n.strokeStyle="rgba(90,90,88,.5)",n.lineWidth=2,n.strokeRect(0,0,t,e)},{repeat:[2,2]})},windows(){return Fn("windows",256,256,(n,t,e)=>{n.fillStyle="#2e3336",n.fillRect(0,0,t,e);let i=Be(11),s=6,r=8,a=t/s,o=e/r;for(let l=0;l<r;l++)for(let c=0;c<s;c++){let h=i()>.45;n.fillStyle=h?`rgba(255,214,140,${.55+i()*.4})`:"rgba(28,34,40,0.9)",n.fillRect(c*a+a*.16,l*o+o*.2,a*.68,o*.5)}},{repeat:[1,1]})},buildingWall(){return Fn("buildingWall",256,256,(n,t,e)=>{n.fillStyle="#b7b2a6",n.fillRect(0,0,t,e);let i=Be(17);for(let s=0;s<5e3;s++){let r=150+Math.floor(i()*50);n.fillStyle=`rgba(${r},${r-4},${r-14},.5)`,n.fillRect(i()*t,i()*e,2,2)}},{repeat:[1,1]})},skyline(){return Fn("skyline",1024,256,(n,t,e)=>{n.clearRect(0,0,t,e);let i=Be(99);for(let s=0;s<90;s++){let r=12+i()*46,a=30+i()*190,o=i()*t;n.fillStyle=`rgba(${28+i()*20},${34+i()*20},${42+i()*20},0.85)`,n.fillRect(o,e-a,r,a);for(let l=e-a+8;l<e-8;l+=12)for(let c=o+4;c<o+r-4;c+=9)i()>.55&&(n.fillStyle="rgba(255,206,120,.75)",n.fillRect(c,l,3,4))}},{repeat:[1,1]})}},$o=null;function Es(){if($o)return $o;let n=Cr.asphalt(),t=Cr.grass(),e=Cr.concrete(),i=Cr.windows(),s=Cr.buildingWall();return $o={asphalt:new kt({color:10133668,map:n,roughness:.94,metalness:.02}),grass:new kt({color:10465919,map:t,roughness:1}),grassDark:new kt({color:8295528,map:t,roughness:1}),concrete:new kt({color:12171698,map:e,roughness:.9}),whiteLine:new kt({color:15921382,roughness:.7,emissive:2236962}),yellowLine:new kt({color:15778122,roughness:.7}),metal:new kt({color:9278617,metalness:.75,roughness:.42}),darkMetal:new kt({color:3883591,metalness:.6,roughness:.6}),wall:new kt({color:13617336,map:s,roughness:.9}),windows:new kt({color:5988711,map:i,emissive:16764807,emissiveMap:i,emissiveIntensity:0,roughness:.65,metalness:.2}),roof:new kt({color:9203036,roughness:.95}),roofLight:new kt({color:11581371,roughness:.9}),trunk:new kt({color:5982518,roughness:1}),leaves:[new kt({color:4549434,roughness:1}),new kt({color:5602368,roughness:1}),new kt({color:3691567,roughness:1}),new kt({color:7175994,roughness:1})],glass:new lr({color:10470607,metalness:.25,roughness:.12,transparent:!0,opacity:.62,transmission:.15}),lamp:new kt({color:16773833,emissive:16767114,emissiveIntensity:1.4,roughness:.4}),lampOff:new kt({color:12170920,roughness:.6}),redLight:new kt({color:13842988,emissive:9180168,emissiveIntensity:1.1}),blueSign:new kt({color:1920908,roughness:.62}),greenSign:new kt({color:2059078,roughness:.62}),tyres:new kt({color:1842977,roughness:.95}),rim:new kt({color:12172994,metalness:.85,roughness:.3}),chrome:new kt({color:14212576,metalness:1,roughness:.16}),headlight:new kt({color:16774872,emissive:16773312,emissiveIntensity:2.2}),taillight:new kt({color:13774370,emissive:9047816,emissiveIntensity:1.6})},$o}function ld(n,t){n.windows.emissiveIntensity=Et(t,0,1)*1.1,n.lamp.emissiveIntensity=.25+t*2.2}function Yo(n,t="#e8e4d9"){let e="trailer:"+n+t;return Fn(e,1024,512,(i,s,r)=>{i.fillStyle=t,i.fillRect(0,0,s,r),i.fillStyle="rgba(0,0,0,0.06)";for(let a=0;a<s;a+=26)i.fillRect(a,0,4,r);i.fillStyle="#2d3c33",i.fillRect(0,r*.62,s,14),i.fillStyle="#22302a",i.font="bold 86px system-ui, Arial",i.fillText(n.toUpperCase(),46,r*.42),i.fillStyle="#5d6b5f",i.font="bold 30px system-ui, Arial",i.fillText("\u0415\u0412\u0420\u041E\u041F\u0415\u0419\u0421\u041A\u0418\u0415 \u0413\u0420\u0423\u0417\u041E\u0412\u042B\u0415 \u041B\u0418\u041D\u0418\u0418",48,r*.55),i.strokeStyle="rgba(40,50,44,0.55)",i.lineWidth=6,i.strokeRect(12,12,s-24,r-24)},{repeat:[1,1]})}var hd=12,Ix=2400,Lx=380;function Zo(n,t){let e=Math.abs(t),i=Ar((e-5.5)/34),s=2.9*Math.sin(n*.0031+t*.0068)+1.8*Math.sin(n*.0081-t*.0102+1.3)+.8*Math.sin(n*.019+t*.021+2.2),r=e>60?(e-60)*.045:0;return i*(s+r)}function xi(n,t,e,i,s={}){let{step:r=hd,yOffset:a=0,yFn:o=null,uvScale:l=24}=s,c=Math.max(2,Math.ceil((e-t)/r)),h=i.length,d=[],u=[],f=[];for(let y=0;y<=c;y++){let g=t+(e-t)*y/c,p=n.pointAt(g),M=Math.cos(p.hdg),w=-Math.sin(p.hdg);for(let x=0;x<h;x++){let E=i[x],S=o?o(g,E):0;d.push(p.x+M*E,p.y+a+S,p.z+w*E),u.push(x/Math.max(1,h-1),g/l)}}for(let y=0;y<c;y++)for(let g=0;g<h-1;g++){let p=y*h+g,M=p+1,w=(y+1)*h+g,x=w+1;f.push(p,w,M,M,w,x)}let m=new Re;return m.setAttribute("position",new fe(d,3)),m.setAttribute("uv",new fe(u,2)),m.setIndex(f),m.computeVertexNormals(),m}function zc(n,t,e,i,s,r,a=hd){let o=Math.max(2,Math.ceil((e-t)/a)),l=[],c=[];for(let d=0;d<=o;d++){let u=t+(e-t)*d/o,f=n.pointAt(u),m=Math.cos(f.hdg),y=-Math.sin(f.hdg);l.push(f.x+m*i,f.y+s,f.z+y*i),l.push(f.x+m*i,f.y+r,f.z+y*i)}for(let d=0;d<o;d++){let u=d*2;c.push(u,u+2,u+1,u+1,u+2,u+3)}let h=new Re;return h.setAttribute("position",new fe(l,3)),h.setIndex(c),h.computeVertexNormals(),h}function cd(n,t,e,i,s,r){return xi(n,t,e,[i-s/2,i+s/2],{yOffset:r,step:Math.min(e-t,3)})}var Hc=new Map;function ws(n,t,e="#1f5c3a"){let i="sign:"+n+t+e;if(Hc.has(i))return Hc.get(i);let s=document.createElement("canvas");s.width=512,s.height=256;let r=s.getContext("2d");r.fillStyle=e,r.fillRect(0,0,512,256),r.strokeStyle="#f2f2ea",r.lineWidth=10,r.strokeRect(14,14,484,228),r.fillStyle="#ffffff",r.textAlign="center",r.font="bold 62px system-ui, Arial",r.fillText(n,256,t?120:150,460),t&&(r.font="bold 30px system-ui, Arial",r.fillStyle="#dbe6dd",r.fillText(t,256,178));let a=new ni(s);return a.colorSpace=Se,a.userData.key=i,Hc.set(i,a),a}function Dx(){let n=document.createElement("canvas");n.width=256,n.height=256;let t=n.getContext("2d");t.fillStyle="#f7f5ec",t.beginPath(),t.roundRect?t.roundRect(10,48,236,160,14):t.rect(10,48,236,160),t.fill(),t.strokeStyle="#c8362c",t.lineWidth=10,t.beginPath(),t.roundRect?t.roundRect(16,54,224,148,12):t.rect(16,54,224,148),t.stroke(),t.fillStyle="#2a2f33",t.fillRect(44,106,84,58),t.beginPath(),t.moveTo(128,118),t.lineTo(176,96),t.lineTo(176,174),t.lineTo(128,152),t.closePath(),t.fill(),t.fillStyle="#c8362c",t.font="bold 30px system-ui, Arial",t.textAlign="center",t.fillText("\u0424\u041E\u0422\u041E",128,210);let e=new ni(n);return e.colorSpace=Se,e}function Nx(n){let t="speed:"+n,e=document.createElement("canvas");e.width=256,e.height=256;let i=e.getContext("2d");i.clearRect(0,0,256,256),i.fillStyle="#f7f5ec",i.beginPath(),i.arc(128,128,118,0,Math.PI*2),i.fill(),i.lineWidth=26,i.strokeStyle="#c8362c",i.beginPath(),i.arc(128,128,105,0,Math.PI*2),i.stroke(),i.fillStyle="#1e1e1c",i.font="bold 120px system-ui, Arial",i.textAlign="center",i.textBaseline="middle",i.fillText(String(n),128,136);let s=new ni(e);return s.colorSpace=Se,s}var Jo=class{constructor(t,e,i=[]){this.scene=t,this.route=e,this.depots=i,this.group=new be,this.group.name="road-world",t.add(this.group),this.mats=Es(),this.lastBuild=-1e9,this.signTex=new Map,this.railMat=this.mats.metal.clone(),this.railMat.side=Pe,this.railMat.__keep=!0,this.weatherWetness=0,this.night=0,this.rebuild(0)}disposeChildren(){this.group.traverse(t=>{t.geometry&&t.geometry.dispose(),t.material&&t.material.dispose&&!t.material.__keep&&!Object.values(this.mats).includes(t.material)&&!Array.isArray(t.material)&&t.material.dispose()}),this.group.clear()}update(t,e){Math.abs(t-this.lastBuild)>300&&this.rebuild(t),ld(this.mats,this.night);let i=this.weatherWetness;this.mats.asphalt.roughness=ke(.94,.42,i),this.mats.asphalt.color.setHex(i>.3?8160393:10133668)}rebuildS(t){return this.rebuild(t)}rebuild(t){let e=this.route;this.lastBuild=t,this.disposeChildren();let i=Math.max(0,t-Lx),s=Math.min(e.length-1,t+Ix);if(s-i<50)return;let r=this.mats,a=e.pointAt((i+s)/2),o=new lt(new Ue(6e3,6e3),r.grassDark);o.rotation.x=-Math.PI/2,o.position.set(a.x,a.y-1.4,a.z),this.group.add(o);let l=(C,I)=>{let O=new lt(C,I);return O.matrixAutoUpdate=!1,this.group.add(O),O};l(xi(e,i,s,[-3.7,3.7]),r.asphalt),l(xi(e,i,s,[-12.7,-5.3]),r.asphalt),l(xi(e,i,s,[3.7,5.2]),r.asphalt),l(xi(e,i,s,[-14.2,-12.7]),r.asphalt),l(xi(e,i,s,[-5.3,-3.7],{yOffset:.14}),r.concrete);let c=r.whiteLine,h=.035;l(xi(e,i,s,[3.52,3.68],{yOffset:h}),c),l(xi(e,i,s,[-3.68,-3.52],{yOffset:h}),c),l(xi(e,i,s,[-12.62,-12.46],{yOffset:h}),c),l(xi(e,i,s,[-5.54,-5.38],{yOffset:h}),c);let d=Math.floor(i/9)*9;for(let C=d;C<s;C+=9){let I=Math.max(i,C),O=Math.min(s,C+3.2);O-I<.4||(l(cd(e,I,O,0,.15,h),c),l(cd(e,I,O,-9,.15,h),c))}let u=this.railMat;l(zc(e,i,s,5.35,.28,.82),u),l(zc(e,i,s,-4.45,.22,.92),u),l(zc(e,i,s,-14.35,.28,.82),u);let f=[5.2,9,16,30,52,88,140,210],m=[-14.2,-18,-26,-40,-62,-95,-145,-210];l(xi(e,i,s,f,{yFn:(C,I)=>Zo(C,I)-.06,uvScale:30}),r.grass),l(xi(e,i,s,m,{yFn:(C,I)=>Zo(C,I)-.06,uvScale:30}),r.grassDark);let y=150,g=new we(.16,.3,2.6,5),p=new Rn(1.7,4.2,6),M=new on(g,r.trunk,y),w=new on(p,r.leaves[0],y);w.instanceColor=new Tn(new Float32Array(y*3),3);let x=new De,E=new Rt,S=0,R=11,v=Math.floor(i/R);for(let C=0;C<y;C++){let I=v+C,O=I*R+Zi(I,3)*5;if(O<i-30||O>s+30)continue;let L=Zi(I,7)>.5?1:-1,k=12+Zi(I,11)*120,V=L*k,W=e.pointAt(O),K=W.y+Zo(O,V)+1.3,q=.7+Zi(I,13)*1.1;x.position.set(W.x+Math.cos(W.hdg)*V,K,W.z-Math.sin(W.hdg)*V),x.rotation.set(0,Zi(I,17)*6.28,0),x.scale.set(q,q,q),x.updateMatrix(),M.setMatrixAt(S,x.matrix),x.position.y=K+2.2*q,x.updateMatrix(),w.setMatrixAt(S,x.matrix),E.setHSL(.25+Zi(I,23)*.09,.35+Zi(I,29)*.2,.3+Zi(I,31)*.14),w.setColorAt(S,E),S++}M.count=S,w.count=S,M.instanceMatrix.needsUpdate=!0,w.instanceMatrix.needsUpdate=!0,w.instanceColor&&(w.instanceColor.needsUpdate=!0),this.group.add(M,w);let T=115,P=Math.floor(i/T)*T;for(let C=P;C<s;C+=T){let I=e.pointAt(C),O=6.6,L=new lt(new we(.12,.16,9,5),r.darkMetal);L.position.set(I.x+Math.cos(I.hdg)*O,I.y+4.5,I.z-Math.sin(I.hdg)*O);let k=new lt(new Qt(2.6,.14,.14),r.darkMetal);k.position.set(I.x+Math.cos(I.hdg)*(O-1.2),I.y+8.9,I.z-Math.sin(I.hdg)*(O-1.2)),k.rotation.y=I.hdg;let V=new lt(new Qt(.8,.18,.34),this.night>.3?r.lamp:r.lampOff);V.position.set(I.x+Math.cos(I.hdg)*(O-2.4),I.y+8.8,I.z-Math.sin(I.hdg)*(O-2.4)),V.rotation.y=I.hdg,this.group.add(L,k,V)}this.buildSigns(i,s);for(let C of e.stations)C.s<i-80||C.s>s+80||this.buildStation(C);for(let C of e.rests)C.s<i-80||C.s>s+80||this.buildRest(C);this.buildCitiesNear(i,s);for(let C of this.depots)C.s<i-100||C.s>s+100||this.buildDepot(C)}buildDepot(t){let i=this.route.pointAt(t.s),s=Math.cos(i.hdg),r=-Math.sin(i.hdg),a=new be,o=this.mats,l=(M,w)=>new D(i.x+s*M,i.y+w,i.z+r*M),c=new lt(new Qt(26,9,34),o.wall);c.position.copy(l(34,4.5)),c.rotation.y=i.hdg,a.add(c);let h=new lt(new Qt(27,.8,35),o.roofLight);h.position.copy(l(34,9.2)),h.rotation.y=i.hdg,a.add(h);for(let M=-1;M<=1;M++){let w=new lt(new Qt(6,5.6,.4),o.darkMetal);w.position.copy(l(21.1,2.8)).add(new D(M*8,0,0).applyAxisAngle(new D(0,1,0),i.hdg)),w.rotation.y=i.hdg,a.add(w)}let d=new lt(new Qt(30,.06,26),o.concrete);d.position.copy(l(18,.02)),d.rotation.y=i.hdg,a.add(d);let u=ws(t.label,t.sub||"",t.color||"#1f5c3a"),f=new Ne({map:u,transparent:!0,side:Pe}),m=new lt(new Ue(6.4,3.2),f);m.position.copy(l(12,6.4)),m.rotation.y=i.hdg+Math.PI,a.add(m);for(let M of[-2.2,2.2]){let w=new lt(new we(.1,.1,6.4,6),o.darkMetal);w.position.copy(l(12,3.2)).add(new D(M,0,0).applyAxisAngle(new D(0,1,0),i.hdg)),a.add(w)}let y=new Ne({color:t.color==="#1f5c3a"?4839344:15906116,transparent:!0,opacity:.22,depthWrite:!1,side:Pe}),g=new lt(new we(1.6,1.6,26,12,1,!0),y);g.position.copy(l(6.4,13)),a.add(g);let p=new lt(new ar(2.3,2.8,24),new Ne({color:t.color==="#1f5c3a"?4839344:15906116,transparent:!0,opacity:.8,side:Pe}));p.position.copy(l(4.6,.09)),p.rotation.x=-Math.PI/2,a.add(p),this.group.add(a)}buildSigns(t,e){let i=this.route,s=(o,l,c,h=4.4,d=2.2,u=4.6)=>{let f=i.pointAt(o),m=new kt({map:c,roughness:.7,transparent:!0}),y=new lt(new Ue(h,d),m);y.position.set(f.x+Math.cos(f.hdg)*l,f.y+u,f.z-Math.sin(f.hdg)*l),y.rotation.y=f.hdg+Math.PI;let g=new we(.09,.09,u,5),p=new lt(g,this.mats.darkMetal);p.position.set(y.position.x-Math.cos(f.hdg)*(h*.35),f.y+u/2,y.position.z+Math.sin(f.hdg)*(h*.35));let M=p.clone();M.position.set(y.position.x+Math.cos(f.hdg)*(h*.35),f.y+u/2,y.position.z-Math.sin(f.hdg)*(h*.35)),this.group.add(y,p,M)};for(let o of i.marks){let l=o.s-t;if(l>0&&l<e-t){let c=ws(o.name,hi[o.country]?.name||"","#1f5c3a");s(o.s-420,7.8,c,5.6,2.6,5.2)}}let r=null;for(let o=0;o<i.samples.length;o+=3){let l=i.samples[o];if(l.s<t-600||l.s>e)continue;let c=l.country;if(c&&r&&c!==r&&l.s>t){let h=hi[c],d=ws("\u0413\u0420\u0410\u041D\u0418\u0426\u0410",(h?.flag||"")+" "+(h?.name||c),"#1c3f6e");s(l.s,8.6,d,4.6,2.3,4.4)}r=c||r}let a=[];for(let o of i.zones)a.push({s:o.from-90,limit:50}),a.push({s:o.to+90,limit:80});for(let o of i.works)a.push({s:o.from-110,limit:30}),a.push({s:o.to+40,limit:80});this.cameraSign||(this.cameraSign=Dx());for(let o of a){if(o.s<t||o.s>e)continue;let l=this.signTextures().speed.get(o.limit)||this.speedTexture(o.limit);s(o.s,7,l,1.7,1.7,3.4),o.limit<80&&s(o.s-220,7,this.cameraSign,2,2,3.6)}}signTextures(){return this.speedSigns||(this.speedSigns=new Map),{speed:this.speedSigns}}speedTexture(t){let e=Nx(t);return this.speedSigns.set(t,e),e}buildStation(t){let i=this.route.pointAt(t.s),s=Math.cos(i.hdg),r=-Math.sin(i.hdg),a=(f,m)=>new D(i.x+s*f,i.y+m,i.z+r*f),o=new be,l=this.mats,c=new lt(new Qt(16,.7,11),l.concrete);c.position.copy(a(t.side*20,6.2)),c.rotation.y=i.hdg;let h=new we(.22,.22,6.2,8);for(let f of[-6,6])for(let m of[-4,4]){let y=new lt(h,l.metal),g=new D(f,3.1,m).applyAxisAngle(new D(0,1,0),i.hdg);y.position.copy(a(t.side*20,0)).add(g),o.add(y)}o.add(c);let d=new lt(new Qt(7,3.4,5),l.wall);d.position.copy(a(t.side*32,1.7)),d.rotation.y=i.hdg,o.add(d);for(let f of[-2.5,2.5]){let m=new lt(new Qt(1.1,1.9,.7),l.redLight);m.position.copy(a(t.side*20,.95)).add(new D(0,0,f).applyAxisAngle(new D(0,1,0),i.hdg)),m.rotation.y=i.hdg,o.add(m)}if(t.side>0){let f=new lt(new Ue(3.2,1.6),new Ne({map:ws("\u0410\u0417\u0421",t.brand,"#12395f"),transparent:!0,side:Pe}));f.position.copy(a(7,3.2)),f.rotation.y=i.hdg+Math.PI,o.add(f);let m=new lt(new we(.08,.08,3.2,5),l.darkMetal);m.position.copy(a(7,1.6)),o.add(m)}let u=new lt(new Ue(10,2.4),new Ne({map:ws(t.brand,"","#12395f"),transparent:!0}));u.position.copy(a(t.side*20,7.1)),u.rotation.y=i.hdg+Math.PI,o.add(u),this.group.add(o)}buildRest(t){let i=this.route.pointAt(t.s),s=Math.cos(i.hdg),r=-Math.sin(i.hdg),a=new be,o=new lt(new Qt(30,.08,42),this.mats.concrete);o.position.set(i.x+s*t.side*30,i.y+.03,i.z+r*t.side*30),o.rotation.y=i.hdg,a.add(o);let l=new lt(new Qt(9,3.6,6),this.mats.wall);l.position.set(i.x+s*t.side*52,i.y+1.8,i.z+r*t.side*52),l.rotation.y=i.hdg,a.add(l);let c=new lt(new Ue(4,2),new Ne({map:ws("P","\u0417\u041E\u041D\u0410 \u041E\u0422\u0414\u042B\u0425\u0410","#1b4a74"),transparent:!0}));c.position.set(i.x+s*t.side*52,i.y+5.4,i.z+r*t.side*52),c.rotation.y=i.hdg+Math.PI,a.add(c),this.group.add(a)}buildCitiesNear(t,e){let i=this.route,s=this.mats;for(let r of i.marks){if(r.s<t-2e3||r.s>e+2500)continue;let a=Math.min(1500,Math.max(500,420*(oe.get(r.id)?.size||1))),o=Be(r.s*31+7),l=Math.round(a/46),c=new Qt(1,1,1),h=new on(c,s.windows,l),d=new on(c,s.roofLight,l),u=new De,f=new Rt,m=0;for(let y=0;y<l;y++){let g=(o()-.35)*a,p=r.s+g;if(p<0||p>i.length)continue;let w=(o()>.5?1:-1)*(16+o()*95),x=i.pointAt(p),E=7+o()*20,S=7+o()*(26+(oe.get(r.id)?.size||1)*18),R=7+o()*20,v=x.y+Zo(p,w);u.position.set(x.x+Math.cos(x.hdg)*w,v+S/2,x.z-Math.sin(x.hdg)*w),u.rotation.set(0,x.hdg+(o()-.5)*.4,0),u.scale.set(E,S,R),u.updateMatrix(),h.setMatrixAt(m,u.matrix),u.position.y=v+S+.6,u.scale.set(E*1.04,1.2,R*1.04),u.updateMatrix(),d.setMatrixAt(m,u.matrix),f.setHSL(.09+o()*.05,.1+o()*.2,.55+o()*.25),h.setColorAt(m,f),m++}h.count=m,d.count=m,h.instanceMatrix.needsUpdate=!0,d.instanceMatrix.needsUpdate=!0,h.instanceColor&&(h.instanceColor.needsUpdate=!0),this.group.add(h,d)}}dispose(){this.disposeChildren(),this.scene.remove(this.group)}};var DM=new D(0,1,0);function Ht(n,t,e,i,s,r,a,o,l=0){let c=new lt(new Qt(t,e,i),s);return c.position.set(r,a,o),l&&(c.rotation.y=l),n.add(c),c}function Ko(n,t,e,i,s,r,a,o,l=Math.PI/2,c=14){let h=new lt(new we(t,e,i,c),s);return h.position.set(r,a,o),h.rotation.z=l,n.add(h),h}var jo=class{constructor(t,e=3112872){this.scene=t,this.mats=Es(),this.root=new be,this.root.name="truck",t.add(this.root),this.paint=new kt({color:e,metalness:.45,roughness:.28}),this.paintDark=new kt({color:new Rt(e).multiplyScalar(.55),metalness:.4,roughness:.4}),this.wheels=[],this.frontWheels=[],this.wipers=[],this.indicators=[],this.buildTractor(),this.buildTrailer("curtain","Auriga Logistics"),this.buildInterior(),this.headlights=new be,this.root.add(this.headlights);let i=new Ne({color:16773312,transparent:!0,opacity:.12,depthWrite:!1});for(let s of[-.9,.9]){let r=new lt(new Rn(2.4,26,12,1,!0),i);r.rotation.x=Math.PI/2,r.position.set(s,.85,14),this.headlights.add(r)}this.headlights.visible=!1,this.trailerGroup=null}buildTractor(){let t=this.mats,e=new be;this.tractor=e,this.root.add(e),Ht(e,1.1,.34,7.6,t.darkMetal,0,.72,-1),Ht(e,1.2,.12,1.1,t.metal,0,1.02,-.35);let i=new ls;i.moveTo(-.55,.86),i.lineTo(3.22,.86),i.lineTo(3.22,1.5),i.lineTo(3,3.6),i.lineTo(2.42,3.72),i.lineTo(-.15,3.72),i.lineTo(-.95,3),i.closePath();let s=new rr(i,{depth:2.42,bevelEnabled:!0,bevelSize:.06,bevelThickness:.06,bevelSegments:2});s.translate(0,0,-1.21),s.rotateY(-Math.PI/2);let r=new lt(s,this.paint);r.position.set(0,0,0),e.add(r);let a=new lt(new Ue(2.2,1.55),t.glass);a.position.set(0,2.94,3.09),a.rotation.x=-.18,e.add(a);let o=Ht(e,2.36,.14,.1,this.paintDark,0,3.62,2.95);o.rotation.x=-.18;for(let u of[-1,1]){let f=new lt(new Ue(1.5,1.15),t.glass);f.position.set(u*1.225,2.92,2.05),f.rotation.y=u>0?Math.PI/2:-Math.PI/2,e.add(f);let m=new lt(new Ue(1.2,1),t.glass);m.position.set(u*1.225,2.9,.55),m.rotation.y=u>0?Math.PI/2:-Math.PI/2,e.add(m);let y=Ht(e,.9,.06,.06,t.darkMetal,u*1.65,3.2,3),g=Ht(e,.1,.62,.34,t.darkMetal,u*1.95,2.85,2.98),p=Ht(e,.02,.5,.26,t.glass,u*2,2.85,2.98);Ht(e,.04,.12,.28,t.chrome,u*1.27,2.2,1.4)}Ht(e,2.3,.55,.1,t.darkMetal,0,1.35,3.28);for(let u=0;u<5;u++)Ht(e,2.1,.05,.14,t.chrome,0,1.15+u*.1,3.3);Ht(e,2.42,.36,.36,this.paintDark,0,.92,3.3);let l=t.headlight;for(let u of[-.78,.78])Ht(e,.55,.28,.12,l,u,1.72,3.31);Ht(e,2.3,.24,.1,t.darkMetal,0,.72,3.34);for(let u of[-.9,.9])Ht(e,.22,.12,.08,t.taillight,u,3.82,2.98);Ht(e,2.44,.22,1.6,this.paint,0,3.83,2);for(let u=0;u<5;u++)Ht(e,.22,.16,.9,t.headlight,-.9+u*.45,3.9,2.5);Ht(e,2.1,.5,1.1,this.paintDark,0,3.9,.75),Ko(e,.42,.42,2.1,t.metal,-1.15,.72,-1.2,Math.PI/2),Ko(e,.42,.42,1.4,t.metal,1.15,.72,-1,Math.PI/2),Ko(e,.1,.1,2.2,t.chrome,1.1,2.2,-2.2,0,8).rotation.x=0,Ht(e,1,.85,1.4,t.wall,0,.9,-2.9);let c=new we(.52,.52,.34,18),h=new we(.27,.27,.36,12),d=(u,f,m)=>{let y=new be,g=new lt(c,t.tyres);g.rotation.z=Math.PI/2,y.add(g);let p=new lt(h,t.rim);p.rotation.z=Math.PI/2,y.add(p),y.position.set(u,.52,f),e.add(y),this.wheels.push(y),m&&this.frontWheels.push(y)};for(let u of[-1,1])d(u*1.02,2.55,!0),d(u*.92,-1.75,!1),d(u*1.32,-1.75,!1),d(u*.92,-3.1,!1),d(u*1.32,-3.1,!1);for(let u of[-1,1])Ht(e,.06,.5,1,t.darkMetal,u*1.28,.5,2.55);for(let u of[-.62,.2]){let f=new be,m=new lt(new Qt(.05,.9,.05),t.darkMetal);m.position.y=.45,f.add(m),f.position.set(u,3.55,3.15),f.rotation.x=-.15,e.add(f),this.wipers.push(f)}}buildTrailer(t,e){this.trailerGroup&&(this.root.remove(this.trailerGroup),this.trailerGroup.traverse(c=>c.geometry&&c.geometry.dispose()));let i=this.mats,s=new be;s.position.set(0,0,-.55);let r=13.6,a=-r/2-.35;if(t==="tank"){let c=new lt(new we(1.28,1.28,r,22),i.chrome);c.rotation.x=Math.PI/2,c.position.set(0,2.2,a),s.add(c);for(let h of[-2.2,-6,-9.8]){let d=new lt(new Qt(2.7,.3,.4),i.darkMetal);d.position.set(0,2.2,a+h+2),s.add(d)}Ht(s,2.2,.16,r,i.darkMetal,0,1.35,a)}else if(t==="flatbed"){Ht(s,2.5,.22,r,i.concrete,0,1.45,a);let c=new kt({color:9075295,roughness:.9});for(let h=0;h<6;h++)Ht(s,2.2,1.6,1.9,c,0,2.4,a+4.6-h*1.95)}else if(t==="container"){let c=Yo(e,"#cf5b3a"),h=new kt({map:c,roughness:.8});Ht(s,2.48,2.85,r,h,0,2.55,a)}else if(t==="log"){Ht(s,2.4,.2,r,i.darkMetal,0,1.4,a);let c=new kt({color:8018488,roughness:1});for(let h=0;h<3;h++)for(let d=0;d<3;d++){let u=r-.6,f=new lt(new we(.34,.34,u,7),c);f.rotation.x=Math.PI/2,f.position.set((d-1)*.72,1.85+h*.62,a),s.add(f)}for(let h of[4.6,.6,-3.4,-7.4])Ht(s,2.55,2.2,.16,i.darkMetal,0,2.4,a+h)}else if(t==="fridge"){let c=Yo(e,"#eef1f0"),h=new kt({map:c,roughness:.55,metalness:.1});Ht(s,2.5,3,r,h,0,2.55,a);let d=Ht(s,1.5,.9,.55,i.metal,0,3.4,a+r/2+.2)}else{let c=Yo(e,"#e9e5d8"),h=new kt({map:c,roughness:.75});Ht(s,2.5,3,r,h,0,2.55,a);for(let d=0;d<16;d++)Ht(s,2.52,2.9,.03,i.darkMetal,0,2.55,a+r/2-.4-d*.82)}Ht(s,2.4,.16,.14,i.darkMetal,0,1.1,a-r/2-.05);for(let c of[-.85,.85])Ht(s,.34,.5,.1,i.taillight,c,1.35,a-r/2-.08),Ht(s,.22,.16,.1,i.headlight,c,.85,a-r/2-.08);for(let c of[-1,1])Ht(s,.7,.55,.05,i.darkMetal,c,.42,a-r/2+1.1);for(let c of[-.7,.7]){let h=Ko(s,.09,.09,1.2,i.darkMetal,c,.75,a+r/2-2.6,0,6);h.rotation.z=0}let o=new we(.5,.5,.3,16),l=new we(.26,.26,.32,10);for(let c of[-1,1])for(let h of[-.9,-2.25]){let d=new be,u=new lt(o,i.tyres);u.rotation.z=Math.PI/2,d.add(u);let f=new lt(l,i.rim);f.rotation.z=Math.PI/2,d.add(f),d.position.set(c*(.95+(c>0?.4:0)),.5,a-1.6+h-1),s.add(d),this.wheels.push(d)}this.trailerGroup=s,this.root.add(s)}buildInterior(){let t=this.mats,e=new be;this.interior=e,this.root.add(e);let i=new kt({color:2435886,roughness:.9,side:Pe}),s=new kt({color:4015947,roughness:.55,metalness:.25,side:Pe}),r=new kt({color:2832964,roughness:1,side:Pe}),a=new kt({color:3359309,roughness:1,side:Pe});Ht(e,2.3,.6,.95,i,0,1.85,2.75),Ht(e,2.3,.34,.55,i,0,2.15,3.02);let o=Ht(e,.92,.26,.42,i,-.5,2.3,2.62);o.rotation.x=.18,Ht(e,.44,.5,.4,s,.3,2.12,2.7),Ht(e,.9,.55,1.3,s,0,1.32,2.15),this.wheelPivot=new be,this.wheelPivot.position.set(-.5,2.02,2.14),this.wheelPivot.rotation.x=-.42;let l=new lt(new or(.225,.032,8,22),new kt({color:1909542,roughness:.9}));this.wheelPivot.add(l);for(let f=0;f<3;f++){let m=new lt(new Qt(.4,.035,.05),s);m.rotation.z=f*Math.PI/3,this.wheelPivot.add(m)}let c=new lt(new we(.07,.07,.06,12),t.chrome);c.rotation.x=Math.PI/2,this.wheelPivot.add(c);let h=new lt(new we(.05,.07,.5,8),i);h.position.set(-.5,1.85,2.32),h.rotation.x=Math.PI/2-.42,e.add(this.wheelPivot,h),this.dashCanvas=document.createElement("canvas"),this.dashCanvas.width=512,this.dashCanvas.height=256,this.dashTex=new ni(this.dashCanvas),this.dashTex.colorSpace=Se;let d=new lt(new Ue(.46,.23),new Ne({map:this.dashTex}));d.position.set(-.5,2.2,2.4),d.rotation.x=-.22,e.add(d),this.dashScreen=d,this.navCanvas=document.createElement("canvas"),this.navCanvas.width=256,this.navCanvas.height=160,this.navTex=new ni(this.navCanvas),this.navTex.colorSpace=Se;let u=new lt(new Ue(.3,.19),new Ne({map:this.navTex}));u.position.set(.32,2.16,2.49),u.rotation.x=-.2,e.add(u);for(let f of[-1,1]){let m=Ht(e,.1,1.5,.1,i,f*1.12,2.95,3);m.rotation.z=f*.06,Ht(e,.06,2.2,2.4,r,f*1.14,1.95,1.5),Ht(e,.1,.5,2.2,s,f*1.1,1.2,1.6),Ht(e,.12,.1,.5,s,f*1.02,1.5,1.35)}Ht(e,2.3,.14,2.6,r,0,3.52,1.65),Ht(e,2.2,.06,.4,s,0,3.44,2.75),Ht(e,2.2,.22,1.1,r,0,1.35,.35),Ht(e,2.3,2.2,.1,r,0,2.3,-.35);for(let f of[-.55,.55]){Ht(e,.56,.18,.62,a,f,1.5,1.3);let m=Ht(e,.5,1.02,.16,a,f,1.98,.96);m.rotation.x=.12,Ht(e,.26,.2,.14,a,f,2.55,.9)}Ht(e,.05,.42,.05,t.darkMetal,.06,1.75,1.95),Ht(e,.09,.09,.09,s,.06,1.98,1.95);for(let f of[-.55,.55])Ht(e,.9,.16,.3,r,f,3.42,2.85);this.interiorVisible=!0,e.visible=!0}setPaint(t){this.paint.color.setHex(t),this.paintDark.color.setHex(t).multiplyScalar(.55)}setNight(t,e){this.headlights.visible=e,this.mats.headlight.emissiveIntensity=e?2.4:.2}update(t,e,i={}){let{steer:s=0,brake:r=0,trailerType:a,company:o}=i;a&&this.currentTrailer!==a+o&&(this.currentTrailer=a+o,this.buildTrailer(a,o||"Auriga Logistics"));let l=t.speedKmh/3.6/.52*e;for(let h of this.wheels)h.rotation.x-=l;for(let h of this.frontWheels)h.rotation.y=s*.42;this.wheelPivot&&(this.wheelPivot.rotation.z=-s*3.2);let c=i.rain>.15;if(this.wipers.length){this.wiperPhase=(this.wiperPhase||0)+e*(c?4.2:0);let h=c?Math.sin(this.wiperPhase)*.85:0;for(let d of this.wipers)d.rotation.z=-h}this.dashAcc=(this.dashAcc||0)+e,this.dashAcc>.1&&(this.dashAcc=0,this.drawDash(t))}drawDash(t){let e=this.dashCanvas.getContext("2d"),i=512,s=256;e.fillStyle="#0d1214",e.fillRect(0,0,i,s),e.strokeStyle="#1d282c",e.lineWidth=3,e.strokeRect(6,6,i-12,s-12);let r=(a,o,l,c,h,d,u,f)=>{e.save(),e.translate(a,o),e.strokeStyle="#25343a",e.lineWidth=10,e.beginPath(),e.arc(0,0,l,Math.PI*.75,Math.PI*2.25),e.stroke();let m=Et(c/h,0,1);e.strokeStyle=f,e.beginPath(),e.arc(0,0,l,Math.PI*.75,Math.PI*.75+Math.PI*1.5*m),e.stroke(),e.fillStyle="#e8f2ea",e.font="bold 44px system-ui, Arial",e.textAlign="center",e.fillText(String(Math.round(c)),0,10),e.fillStyle="#7f9188",e.font="bold 17px system-ui, Arial",e.fillText(u,0,36),e.fillStyle="#9fb2a8",e.font="bold 15px system-ui, Arial",e.fillText(d,0,l+26),e.restore()};r(130,128,92,t.speedKmh,120,"\u0421\u041A\u041E\u0420\u041E\u0421\u0422\u042C","\u043A\u043C/\u0447","#8ad4ff"),r(382,128,92,t.rpm,2400,"\u041E\u0411\u041E\u0420\u041E\u0422\u042B","\u043E\u0431/\u043C\u0438\u043D","#ffcf6b"),e.fillStyle="#9fb2a8",e.font="bold 22px system-ui, Arial",e.textAlign="center",e.fillText("\u041F\u0415\u0420\u0415\u0414\u0410\u0427\u0410",256,60),e.fillStyle="#e8f2ea",e.font="bold 52px system-ui, Arial",e.fillText(t.gear===-1?"R":t.gear===0?"N":String(t.gear),256,112),e.fillStyle="#ffcf6b",e.font="bold 18px system-ui, Arial",e.fillText("\u0422\u041E\u041F\u041B\u0418\u0412\u041E "+Math.round(t.fuel)+" \u043B",256,152),e.fillStyle=t.temp>100?"#ff7b6b":"#7f9188",e.fillText("\u041E\u0416 "+Math.round(t.temp)+"\xB0C",256,180),e.fillStyle="#7f9188",e.font="bold 16px system-ui, Arial",e.fillText(t.clock?Bi(t.clock):"",256,210),this.dashTex.needsUpdate=!0}drawNav(t){let e=this.navCanvas.getContext("2d");e.fillStyle="#0b1418",e.fillRect(0,0,256,160),e.strokeStyle="#1f3b40",e.lineWidth=2,e.strokeRect(4,4,248,152),e.fillStyle="#7fe0c0",e.font="bold 20px system-ui, Arial",e.textAlign="center",e.fillText(t.title||"\u041C\u0410\u0420\u0428\u0420\u0423\u0422",128,38,232),e.fillStyle="#e8f2ea",e.font="bold 34px system-ui, Arial",e.fillText(t.distance||"\u2014",128,92),e.fillStyle="#8ea9a0",e.font="bold 18px system-ui, Arial",e.fillText(t.eta||"",128,126),this.navTex.needsUpdate=!0}setInteriorVisible(t){this.interiorVisible!==t&&(this.interiorVisible=t,this.interior.visible=t)}setPosition(t,e,i,s,r=0,a=0){this.root.position.set(t,e,i),this.root.rotation.set(r,s,a,"YXZ")}setTrailerAngle(t){this.trailerGroup&&(this.trailerGroup.rotation.y=t)}dispose(){this.scene.remove(this.root)}};var ud=[14211282,3095109,9187114,3103884,7306314,11580600,2040357,13214266,4870010,8007498];function Ux(n,t){let e=new be,i=new kt({color:ud[Math.floor(Math.random()*ud.length)],metalness:.5,roughness:.35}),s=n.darkMetal;if(t==="truck"){let h=new lt(new Qt(2.5,2.6,2.2),i);h.position.set(0,1.6,3.2),e.add(h);let d=new lt(new Qt(2.5,3,8.6),new kt({color:15000797,roughness:.8}));d.position.set(0,2.1,-2.4),e.add(d);let u=new lt(new Qt(2.5,.5,.3),s);u.position.set(0,.8,4.35),e.add(u)}else if(t==="bus"){let h=new lt(new Qt(2.55,3.1,11.5),i);h.position.set(0,1.9,0),e.add(h);let d=new lt(new Qt(2.57,1,9.8),n.glass);d.position.set(0,2.5,.2),e.add(d)}else if(t==="van"){let h=new lt(new Qt(2.1,2.2,5.4),i);h.position.set(0,1.35,0),e.add(h);let d=new lt(new Qt(2.12,.7,1.6),n.glass);d.position.set(0,1.95,1.5),e.add(d)}else{let h=new lt(new Qt(1.86,.62,4.4),i);h.position.set(0,.72,0),e.add(h);let d=new lt(new Qt(1.72,.6,2.3),i);d.position.set(0,1.25,-.25),e.add(d);let u=new lt(new Qt(1.74,.5,2.1),n.glass);u.position.set(0,1.27,-.25),e.add(u);for(let f of[-.95,.95]){let m=new lt(new Qt(.16,.1,.12),s);m.position.set(f,1.18,1),e.add(m)}}let r=new we(.34,.34,.24,10),a=[],o=t==="bus"?[-4,-2.6,3.2,4.2]:t==="truck"?[3.2,-1.2,-2.4]:[-1.4,1.35];for(let h of o)for(let d of[-1,1]){let u=new lt(r,n.tyres);u.rotation.z=Math.PI/2,u.position.set(d*(t==="car"?.86:1),.34,h),e.add(u),a.push(u)}let l=new kt({color:16774352,emissive:16771496,emissiveIntensity:1.6}),c=new kt({color:14170668,emissive:11016204,emissiveIntensity:1.2});for(let h of[-.65,.65]){let d=new lt(new Qt(.34,.16,.08),l);d.position.set(h,t==="truck"?1:.78,t==="car"?2.2:4.35),e.add(d);let u=new lt(new Qt(.3,.14,.08),c);u.position.set(h,t==="truck"?1:.8,t==="car"?-2.2:-7.4),e.add(u)}return e.userData.wheels=a,e.userData.headMat=l,e.userData.tailMat=c,e}var Qo=class{constructor(t,e,i=26){this.scene=t,this.route=e,this.mats=Es(),this.vehicles=[],this.group=new be,t.add(this.group),this.rand=Be(4711);for(let s=0;s<i;s++){let r=["car","car","car","van","truck","bus"][Math.floor(this.rand()*6)],a=Ux(this.mats,r);a.visible=!1,this.group.add(a),this.vehicles.push({mesh:a,active:!1,s:0,lat:0,targetLat:0,speed:0,dir:1,length:r==="truck"?10:r==="bus"?12:4.6,type:r,laneTimer:0,spin:0})}this.count=i,this.playerS=0,this.headlights=!1}reset(t){this.route=t;for(let e of this.vehicles)e.active=!1,e.mesh.visible=!1}spawn(t,e,i){let s=this.vehicles.find(r=>!r.active);s&&(s.active=!0,s.dir=e,s.s=t+i,s.lat=e>0?this.rand()>.75?-1.85:1.85:this.rand()>.5?-7.15:-10.85,s.targetLat=s.lat,s.speed=e>0?19+this.rand()*8:21+this.rand()*7,s.type==="truck"&&(s.speed=19+this.rand()*4),s.laneTimer=2+this.rand()*6,s.mesh.visible=!0)}update(t,e,i,s,r){this.playerS=e,this.headlights=r>.35;let a=0;for(let l of this.vehicles)l.active&&l.dir>0&&a++;a<9&&this.rand()<t*1.6&&this.spawn(e,1,220+this.rand()*900);let o=0;for(let l of this.vehicles)l.active&&l.dir<0&&o++;o<7&&this.rand()<t*1.3&&this.spawn(e,-1,260+this.rand()*1100);for(let l of this.vehicles){if(!l.active)continue;if(l.dir>0){let u=null;for(let m of this.vehicles)m===l||!m.active||m.dir!==l.dir||Math.abs(m.lat-l.lat)<2.2&&m.s>l.s&&m.s-l.s<35&&(!u||m.s<u.s)&&(u=m);let f=e>l.s&&e-l.s<40&&Math.abs(i-l.lat)<2.4;u&&u.speed<l.speed-.5||f?(l.speed=Math.max(14,l.speed-t*3.4),l.laneTimer-=t,l.laneTimer<=0&&Math.abs(l.lat-1.85)<.4&&(l.targetLat=-1.85,l.laneTimer=5+this.rand()*5)):(l.speed=Math.min(l.type==="truck"?24:31,l.speed+t*1.6),l.laneTimer-=t,l.laneTimer<=0&&(l.targetLat=this.rand()>.5?1.85:-1.85,l.laneTimer=6+this.rand()*8)),l.lat+=Et(l.targetLat-l.lat,-1.8*t,1.8*t),l.s+=l.speed*t}else l.s-=(l.speed+2)*t,l.lat=l.targetLat;let c=l.s-e;if(c>1600||c<-500||l.s<0||l.s>this.route.length-1){l.active=!1,l.mesh.visible=!1;continue}let h=this.route.worldPos(l.s,l.lat);l.mesh.position.set(h.x,h.y+.02,h.z),l.mesh.rotation.y=h.hdg+(l.dir<0?Math.PI:0);let d=l.speed/.34*t;for(let u of l.mesh.userData.wheels)u.rotation.x-=d;l.mesh.userData.headMat.emissiveIntensity=this.headlights?2.4:.5,l.mesh.userData.tailMat.emissiveIntensity=this.headlights?1.9:.8}}collide(t,e){for(let i of this.vehicles){if(!i.active||i.dir<0)continue;let s=Math.abs(i.s-t),r=Math.abs(i.lat-e);if(s<(i.length+16.5)/2&&r<2.6)return i}return null}dispose(){let t=new Set(Object.values(this.mats));this.group.traverse(e=>{e.geometry&&e.geometry.dispose(),e.material&&!t.has(e.material)&&!Array.isArray(e.material)&&(e.material.map&&e.material.map.dispose&&e.material.map.dispose(),e.material.dispose())}),this.scene.remove(this.group)}};var ri={topDay:new Rt(3108799),topNight:new Rt(330266),horizonDay:new Rt(13623530),horizonNight:new Rt(1186346),sunset:new Rt(15043154),greyTop:new Rt(7042951),greyHorizon:new Rt(9345444),fogGrey:new Rt(10135213),sunWarm:new Rt(16774084),sunLightWarm:new Rt(16773328),hemiDay:new Rt(12572912),hemiNight:new Rt(2240586)},Fx=`
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
}`,Ox=`
uniform vec3 topColor;
uniform vec3 horizonColor;
uniform vec3 sunColor;
uniform vec3 sunDir;
uniform float sunStrength;
varying vec3 vDir;
void main() {
  float h = clamp(vDir.y * 1.4 + 0.05, 0.0, 1.0);
  vec3 col = mix(horizonColor, topColor, pow(h, 0.65));
  float sun = max(dot(normalize(vDir), normalize(sunDir)), 0.0);
  col += sunColor * pow(sun, 220.0) * 2.2 * sunStrength;
  col += sunColor * pow(sun, 6.0) * 0.22 * sunStrength;
  // ShaderMaterial \u043D\u0435 \u043F\u0440\u043E\u0445\u043E\u0434\u0438\u0442 \u0447\u0435\u0440\u0435\u0437 \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u043E\u0435 \u043F\u0440\u0435\u043E\u0431\u0440\u0430\u0437\u043E\u0432\u0430\u043D\u0438\u0435 \u0446\u0432\u0435\u0442\u0430 \u2014 \u043A\u043E\u0434\u0438\u0440\u0443\u0435\u043C \u0432 sRGB \u0441\u0430\u043C\u0438.
  gl_FragColor = vec4(pow(clamp(col, 0.0, 4.0), vec3(0.4545)), 1.0);
}`,tl={clear:{id:"clear",name:"\u042F\u0441\u043D\u043E",fog:45e-5,rain:0,cloud:.15,sun:1,wet:0,wind:.15},cloudy:{id:"cloudy",name:"\u041F\u0435\u0440\u0435\u043C\u0435\u043D\u043D\u0430\u044F \u043E\u0431\u043B\u0430\u0447\u043D\u043E\u0441\u0442\u044C",fog:68e-5,rain:0,cloud:.55,sun:.72,wet:0,wind:.35},overcast:{id:"overcast",name:"\u041F\u0430\u0441\u043C\u0443\u0440\u043D\u043E",fog:68e-5,rain:0,cloud:.9,sun:.4,wet:.05,wind:.5},rain:{id:"rain",name:"\u0414\u043E\u0436\u0434\u044C",fog:85e-5,rain:.55,cloud:1,sun:.22,wet:.7,wind:.6},storm:{id:"storm",name:"\u0413\u0440\u043E\u0437\u0430",fog:.001,rain:1,cloud:1,sun:.12,wet:1,wind:1},fog:{id:"fog",name:"\u0422\u0443\u043C\u0430\u043D",fog:.0017,rain:0,cloud:.85,sun:.25,wet:.35,wind:.05}},el=class{constructor(t,e){this.scene=t,this.renderer=e,this.weather=tl.clear,this.targetWeather=tl.clear,this.weatherBlend=1,this.minutes=480,this.night=0,this.sunDir=new D(.4,.7,.2),this.dome=new lt(new Pn(4200,32,16),new ti({uniforms:{topColor:{value:new Rt(2781115)},horizonColor:{value:new Rt(12375014)},sunColor:{value:new Rt(16773572)},sunDir:{value:new D(.4,.7,.2)},sunStrength:{value:1}},vertexShader:Fx,fragmentShader:Ox,side:Ve,depthWrite:!1,fog:!1})),this.dome.frustumCulled=!1,t.add(this.dome);let i=1400,s=new Float32Array(i*3),r=Be(42);for(let f=0;f<i;f++){let m=r()*Math.PI*2,y=Math.acos(.05+r()*.95),g=3800;s[f*3]=Math.sin(y)*Math.cos(m)*g,s[f*3+1]=Math.cos(y)*g,s[f*3+2]=Math.sin(y)*Math.sin(m)*g}let a=new Re;a.setAttribute("position",new Je(s,3)),this.starMat=new An({color:16777215,size:9,sizeAttenuation:!1,transparent:!0,opacity:0,depthWrite:!1,fog:!1}),this.stars=new as(a,this.starMat),this.stars.frustumCulled=!1,t.add(this.stars),this.sun=new lt(new Pn(90,16,12),new Ne({color:16774084,fog:!1})),this.moon=new lt(new Pn(58,16,12),new Ne({color:14673906,fog:!1})),t.add(this.sun,this.moon),this.sunLight=new dr(16773328,2.6),this.sunLight.position.set(200,400,120),t.add(this.sunLight),this.hemi=new hr(12375791,4937024,1),t.add(this.hemi),this.ambient=new fr(16777215,.28),t.add(this.ambient);let o=document.createElement("canvas");o.width=512,o.height=512;let l=o.getContext("2d"),c=Be(9);l.clearRect(0,0,512,512);for(let f=0;f<130;f++){let m=c()*512,y=c()*512,g=18+c()*62,p=l.createRadialGradient(m,y,0,m,y,g);p.addColorStop(0,`rgba(255,255,255,${.12+c()*.2})`),p.addColorStop(1,"rgba(255,255,255,0)"),l.fillStyle=p,l.beginPath(),l.arc(m,y,g,0,Math.PI*2),l.fill()}let h=new ni(o);h.wrapS=h.wrapT=an,h.repeat.set(3,3),this.cloudMat=new Ne({map:h,transparent:!0,opacity:.5,depthWrite:!1,fog:!1,color:16777215}),this.clouds=new lt(new Ue(9e3,9e3),this.cloudMat),this.clouds.rotation.x=-Math.PI/2,this.clouds.position.y=900,this.clouds.frustumCulled=!1,t.add(this.clouds),this.cloudTex=h,this.rainCount=3200;let d=new Float32Array(this.rainCount*3);for(let f=0;f<this.rainCount;f++)d[f*3]=(Math.random()-.5)*120,d[f*3+1]=Math.random()*40,d[f*3+2]=(Math.random()-.5)*160;let u=new Re;u.setAttribute("position",new Je(d,3)),this.rainMat=new An({color:12571872,size:.16,transparent:!0,opacity:.55,depthWrite:!1}),this.rain=new as(u,this.rainMat),this.rain.frustumCulled=!1,this.rain.visible=!1,t.add(this.rain),this.rainSpeeds=new Float32Array(this.rainCount).map(()=>18+Math.random()*14),this.fog=new Vs(11452363,3e-4),t.fog=this.fog,this._tmpColor=new Rt,this.lightning=0}setWeather(t,e=!1){let i=tl[t]||tl.clear;e?(this.weather=i,this.targetWeather=i,this.weatherBlend=1):(this.targetWeather=i,this.weatherBlend=0)}setTime(t){this.minutes=t}update(t,e,i){this.minutes=i,this.weatherBlend=Math.min(1,this.weatherBlend+t*.25);let s=this.weatherBlend,r=this.weather,a=this.targetWeather,o=(L,k)=>ke(L,k,s),l=o(r.fog,a.fog),c=o(r.rain,a.rain),h=o(r.cloud,a.cloud),d=o(r.sun,a.sun);s>=1&&(this.weather=a);let u=o(r.wet,a.wet),f=(i-360)/720*Math.PI,m=Math.sin(f),y=f*.9-.5,g=m,p=Math.cos(y)*Math.sqrt(Math.max(0,1-m*m)),M=Math.sin(y)*Math.sqrt(Math.max(0,1-m*m));this.sunDir.set(p,g,M).normalize();let w=Et(-m*4+.25,0,1);this.night=w;let x=1-w,E=ri.topDay,S=ri.topNight,R=ri.horizonDay,v=ri.horizonNight,T=Et(1-Math.abs(m)*6,0,1)*x,P=S.clone().lerp(E,x),C=v.clone().lerp(R,x).lerp(ri.sunset,T*.65);P.lerp(ri.greyTop,h*.55),C.lerp(ri.greyHorizon,h*.5),this.dome.material.uniforms.topColor.value.copy(P),this.dome.material.uniforms.horizonColor.value.copy(C),this.dome.material.uniforms.sunDir.value.copy(this.sunDir),this.dome.material.uniforms.sunStrength.value=d,this.dome.position.copy(e.position),this.stars.position.copy(e.position),this.starMat.opacity=Et(w*(1-h*.85),0,1)*.9,this.sun.position.copy(e.position).addScaledVector(this.sunDir,3400),this.sun.visible=m>-.1&&h<.95,this.moon.position.copy(e.position).addScaledVector(this.sunDir.clone().negate(),3200),this.moon.visible=w>.2,this.sun.material.color.copy(ri.sunWarm).lerp(ri.sunset,T),this.sun.scale.setScalar(1+T*.5),this.clouds.position.set(e.position.x,e.position.y+700,e.position.z),this.cloudMat.opacity=.15+h*.62,this.cloudMat.color.setHex(w>.5?2831168:16777215),this.cloudTex.offset.x+=t*.0025,this.sunLight.intensity=(.15+3.1*x)*d,this.sunLight.color.copy(ri.sunLightWarm).lerp(ri.sunset,T*.9),this.sunLight.position.copy(e.position).addScaledVector(this.sunDir,600),this.sunLight.target.position.copy(e.position),this.hemi.intensity=.22+x*1,this.hemi.color.copy(ri.hemiDay).lerp(ri.hemiNight,w),this.ambient.intensity=.1+x*.3;let I=C.clone().lerp(ri.fogGrey,h*.3);if(this.fog.color.copy(I),this.fog.density=ke(l,9e-4,c*.35),this.scene.background=I.clone(),this.rain.visible=c>.02,this.rain.visible){let L=this.rain.geometry.attributes.position;for(let k=0;k<this.rainCount;k++){let V=L.array[k*3+1]-this.rainSpeeds[k]*t*(.6+c),W=L.array[k*3]+6*t,K=L.array[k*3+2]+9*t;V<-2&&(V=38+Math.random()*12,W=(Math.random()-.5)*120,K=(Math.random()-.5)*170),L.array[k*3]=W,L.array[k*3+1]=V,L.array[k*3+2]=K}L.needsUpdate=!0,this.rain.position.set(e.position.x,e.position.y-8,e.position.z),this.rainMat.opacity=.4+c*.4,this.rainMat.size=.13+c*.1}return c>.9&&Math.random()<t*.12&&(this.lightning=1),this.lightning>0&&(this.lightning=Math.max(0,this.lightning-t*4),this.sunLight.intensity+=this.lightning*5,this.hemi.intensity+=this.lightning*1.5),{night:Et(w*1.6+c*.35+(1-x)*.4,0,1),wet:u,rain:c,fog:this.fog.density,day:x,weatherName:(s>=1?a:r).name,sunElevation:m}}};var Ts=.05,kx=10,dd=50,Bx=111320*Math.cos(Ss(dd))*Ts,zx=110540*Ts;function Hx(n,t){return{x:(t-kx)*Bx,z:-(n-dd)*zx}}var ui=new Map(Un.map(n=>{let t=Hx(n.lat,n.lon);return[n.id,{...n,x:t.x,z:t.z}]}));function fd(n,t){return Rr(n.lat,n.lon,t.lat,t.lon)*Ts}var pd=1.16,il=null;function Vc(){if(il)return il;let n=[...ui.values()],t=n.map(l=>({x:l.x,y:l.z})),e=ed(t),i=new Map(n.map(l=>[l.id,[]])),s=new Set,r=(l,c,h)=>{if(l===c)return;let d=l<c?l+"|"+c:c+"|"+l;if(s.has(d))return;s.add(d);let u=ui.get(l),f=ui.get(c),m=Rr(u.lat,u.lon,f.lat,f.lon)*Ts*(h?1:pd);i.get(l).push({to:c,cost:m,km:m}),i.get(c).push({to:l,cost:m,km:m})};for(let[l,c,h]of e)r(n[l].id,n[c].id,!1),r(n[c].id,n[h].id,!1),r(n[h].id,n[l].id,!1);for(let l of n){let c=n.filter(h=>h.id!==l.id).map(h=>({o:h,d:Math.hypot(h.x-l.x,h.z-l.z)})).sort((h,d)=>h.d-d.d).slice(0,3);for(let{o:h}of c)r(l.id,h.id,!0)}let a=new Map,o=0;for(let l of n){if(a.has(l.id))continue;let c=[l.id];for(a.set(l.id,o);c.length;){let h=c.pop();for(let d of i.get(h))a.has(d.to)||(a.set(d.to,o),c.push(d.to))}o++}if(o>1)for(let l=1;l<o;l++){let c=n.filter(u=>a.get(u.id)===l),h=n.filter(u=>a.get(u.id)===0),d=null;for(let u of c)for(let f of h){let m=Math.hypot(u.x-f.x,u.z-f.z);(!d||m<d.d)&&(d={a:u,b:f,d:m})}d&&r(d.a.id,d.b.id,!1)}return il={adj:i,list:n},il}var Gx=(n,t)=>{let e=ui.get(n),i=ui.get(t);return Math.hypot(e.x-i.x,e.z-i.z)};function Vx(n,t){let{adj:e}=Vc(),i=new Map;for(let r of ui.values())i.set(r.id,{edges:e.get(r.id)||[]});return td(i,n,t,Gx)||[n,t]}var Gc=new Map;function Pr(n,t){let e=n<t?n+"|"+t:t+"|"+n;if(Gc.has(e))return Gc.get(e);let i=Vx(n,t),s=0;for(let a=1;a<i.length;a++){let o=ui.get(i[a-1]),l=ui.get(i[a]);s+=Rr(o.lat,o.lon,l.lat,l.lon)*Ts*pd}let r={km:s,path:i};return Gc.set(e,r),r}function Wx(n,t){let e=[],i=0,s=n[0];e.push(s);for(let a=1;a<n.length;a++){let o=n[a],l=o.x-s.x,c=o.z-s.z,h=Math.hypot(l,c);if(h<1e-6)continue;let d=t-i;for(;d<=h;){let u=d/h;e.push({x:s.x+l*u,z:s.z+c*u,country:o.country||s.country}),d+=t}i=h-(d-t),s=o}let r=n[n.length-1];return e.push(r),e}function Xx(n,t,e=.5){for(let i=0;i<t;i++){let s=n.map(r=>({...r}));for(let r=1;r<n.length-1;r++)s[r].x=ke(n[r].x,(n[r-1].x+n[r+1].x)/2,e),s[r].z=ke(n[r].z,(n[r-1].z+n[r+1].z)/2,e);for(let r=0;r<n.length;r++)n[r].x=s[r].x,n[r].z=s[r].z}return n}function qx(n){return 6.5*Math.sin(n/2100+.7)+4.2*Math.sin(n/890+2.1)+2.1*Math.sin(n/310+4.3)+1.1*Math.sin(n/97+1.2)}var JM={laneWidth:3.7,lanes:2,carriageway:7.4,median:3.2,shoulder:1.4,halfRoad:7.4+1.4,guardRail:9.4,verge:220};function md(n,t=1){let e=Be(t*7919+13),i=[],s=[];for(let M=0;M<n.length;M++){let w=ui.get(n[M]);if(w&&(i.push({x:w.x,z:w.z,city:w.id}),M<n.length-1)){let x=ui.get(n[M+1]),E=x.x-w.x,S=x.z-w.z,R=Math.hypot(E,S),v=-S/R,T=E/R,P=Et(Math.round(R/1300),2,9);for(let C=1;C<=P;C++){let I=C/(P+1),O=(e()-.5)*Math.min(R*.16,1900)*(.5+Math.sin(I*Math.PI)*.8);i.push({x:w.x+E*I+v*O,z:w.z+S*I+T*O,country:hi[oe.get(M===0?n[0]:n[M]).country]})}}}let r=[];for(let M=0;M<i.length-1;M++){let w=i[Math.max(0,M-1)],x=i[M],E=i[M+1],S=i[Math.min(i.length-1,M+2)],R=Math.hypot(E.x-x.x,E.z-x.z),v=Math.max(6,Math.round(R/90));for(let T=0;T<v;T++){let P=T/v;r.push({x:Nc(w.x,x.x,E.x,S.x,P),z:Nc(w.z,x.z,E.z,S.z,P),country:x.city?oe.get(x.city).country:x.country?.name})}}let a=ui.get(n[n.length-1]);r.push({x:a.x,z:a.z,country:a.country}),Xx(r,4,.5);let o=Wx(r,12),l=0,c=[];for(let M=0;M<o.length;M++){M>0&&(l+=Math.hypot(o[M].x-o[M-1].x,o[M].z-o[M-1].z));let w=o[Math.max(0,M-1)],x=o[Math.min(o.length-1,M+1)],E=Math.atan2(x.x-w.x,x.z-w.z);c.push({x:o[M].x,z:o[M].z,y:0,s:l,hdg:E,curv:0,country:o[M].country})}let h=l;for(let M of c)M.y=qx(M.s);for(let M=0;M<c.length;M++){let w=c[Math.max(0,M-3)],x=c[Math.min(c.length-1,M+3)],E=x.s-w.s||1,S=x.hdg-w.hdg;for(;S>Math.PI;)S-=Math.PI*2;for(;S<-Math.PI;)S+=Math.PI*2;c[M].curv=S/E}for(let M=0;M<3;M++){let w=c.map(x=>x.curv);for(let x=1;x<c.length-1;x++)c[x].curv=(w[x-1]+w[x]*2+w[x+1])/4}for(let M of n){let w=ui.get(M),x=0,E=1/0;for(let S=0;S<c.length;S++){let R=(c[S].x-w.x)**2+(c[S].z-w.z)**2;R<E&&(E=R,x=S)}s.push({id:M,name:w.name,country:w.country,s:c[x].s,cityX:w.x,cityZ:w.z})}s.sort((M,w)=>M.s-w.s);let d=s.map(M=>({s:M.s,from:M.s-1400,to:M.s+1400})),u=[],f=[],m=Be(t*31337+7);for(let M=1;M*6200<h-2200;M++){let w=M*6200+(m()-.5)*1800;if(w<1200||w>h-1200||d.some(S=>w>S.from-300&&w<S.to+300))continue;let E=1;m()>.28?u.push({s:w,lat:E*17,side:E,brand:["Aurora Fuel","NordOel","TransStop","Vega Petrol"][Math.floor(m()*4)],priceMod:.92+m()*.2,id:"fuel-"+M}):f.push({s:w,lat:E*20,side:E,id:"rest-"+M,name:"\u0417\u043E\u043D\u0430 \u043E\u0442\u0434\u044B\u0445\u0430"})}let y=[];for(let M=0;M<Math.max(1,Math.floor(h/16e3));M++){let w=4e3+m()*Math.max(1e3,h-8e3);d.some(x=>w>x.from-500&&w<x.to+500)||y.push({from:w,to:w+220})}let g=M=>{let w=Et(M,0,h),x=Et(Math.floor(w/12),0,c.length-2),E=Et((w-c[x].s)/(c[x+1].s-c[x].s||1),0,1),S=c[x],R=c[x+1],v=R.hdg-S.hdg;for(;v>Math.PI;)v-=Math.PI*2;for(;v<-Math.PI;)v+=Math.PI*2;return{x:ke(S.x,R.x,E),z:ke(S.z,R.z,E),y:ke(S.y,R.y,E),hdg:S.hdg+v*E,curv:ke(S.curv,R.curv,E),country:S.country}};return{cityIds:n,samples:c,marks:s,zones:d,stations:u,rests:f,works:y,km:h/1e3,length:h,pointAt:g,seed:t,from:n[0],to:n[n.length-1],name:(oe.get(n[0])?.name||"")+" \u2192 "+(oe.get(n[n.length-1])?.name||""),worldPos(M,w){let x=g(M),E=Math.cos(x.hdg),S=-Math.sin(x.hdg);return{x:x.x+E*w,y:x.y,z:x.z+S*w,hdg:x.hdg,curv:x.curv}}}}function Wc(n,t){return n.zones.find(i=>t>i.from&&t<i.to)?50:n.works.some(i=>t>i.from-120&&t<i.to+60)?30:80}var Ir=9.81,$x=1.225,Yx=[11.32,8.42,6.52,5.11,4.06,3.24,2.62,2.09,1.68,1.34,1,.78],nl=class{constructor(t={}){this.model=t.model||{hp:460,tank:480,consumption:31,gears:12,finalDrive:2.85,topSpeed:89},this.upgradePower=t.upgradePower||1,this.tireGrip=t.tireGrip||1,this.retarder=t.retarder||0,this.cargoMass=t.cargoMass??0,this.reset(t)}reset(t={}){this.cargoMass=t.cargoMass??this.cargoMass??0,this.s=t.s??0,this.lat=t.lat??2,this.speed=0,this.yawRel=0,this.steer=0,this.gear=0,this.gearTimer=0,this.rpm=700,this.throttle=0,this.brake=0,this.engineOn=!1,this.fuel=t.fuel??this.model.tank,this.fuelCapacity=this.model.tank,this.engine=t.engine??100,this.tires=t.tires??100,this.brakes=t.brakes??100,this.temp=40,this.odometer=t.odometer??0,this.autoGearbox=!0,this.handbrake=!0,this.trailerYaw=0,this.trailerYawOffset=0,this.wheelSpin=0,this.slip=0,this.pitch=0,this.roll=0,this.limitSpeed=89,this.lastShift=0,this.impact=0,this.jackknife=0,this.cruise=null,this.cruiseTarget=0,this.engineBrake=0}get mass(){return 14600+this.cargoMass*1e3}get powerW(){return this.model.hp*735.5*this.upgradePower}get maxSpeedLimit(){return this.model.topSpeed||89}get gearRatio(){return this.gear===0?0:this.gear===-1?-9.5:Yx[Et(this.gear-1,0,11)]}get wheelForce(){if(!this.engineOn||this.gear===0)return 0;let t=this.powerW*.82/(1250*(2*Math.PI)/60),e=Et(this.rpm,600,2100),i=.45+.55*Ar((e-600)/500)*(e>1700?Et(1-(e-1700)/700,.5,1):1);return t*i*(this.engine/100)*this.gearRatio*this.model.finalDrive*.9/.52}shiftUp(){this.gear<12&&(this.gear=Math.max(1,this.gear+1),this.gearTimer=.35,this.lastShift=.35)}shiftDown(){this.gear>-1&&(this.gear=this.gear===1?0:this.gear-1,this.gearTimer=.3,this.lastShift=.3)}toggleReverse(){return Math.abs(this.speed)>1.2?!1:(this.gear=this.gear===-1?0:-1,this.gearTimer=.3,!0)}toggleEngine(){this.engineOn?(this.engineOn=!1,this.speed=0,this.gear=0):(this.engineOn=!0,this.handbrake=!1)}step(t,e,i){let s=this.model,r=s.gears||12;this.throttle=Et(e.throttle,0,1),this.brake=Et(e.brake,0,1),this.limitSpeed=Math.min(this.maxSpeedLimit,i.speedLimit||80);let a=Et(e.steer,-1,1),o=ke(.5,.085,Et(Math.abs(this.speed)/26,0,1)),l=a*o,c=a===0?2.4:1.7;if(this.steer+=Et(l-this.steer,-c*t,c*t),this.gearTimer>0&&(this.gearTimer=Math.max(0,this.gearTimer-t)),this.lastShift>0&&(this.lastShift=Math.max(0,this.lastShift-t)),this.autoGearbox&&this.engineOn){this.gear===-1?(Math.abs(this.speed)<.2&&this.throttle<.03&&(this.gear=0),this.rpm=Et(700+this.throttle*900,650,2400)):this.gear===0&&this.throttle>.05&&(this.gear=1);let K=this.speed/.52*this.gearRatio*s.finalDrive*(60/(2*Math.PI));this.gear>0&&(this.rpm=Et(Math.max(K,650),650,2400)),this.gearTimer<=0&&this.gear>0&&(this.rpm>1750&&this.gear<r?this.shiftUp():this.rpm<950&&this.gear>1?this.shiftDown():this.gear>0&&this.speed<1.2&&this.throttle<.1&&(this.gear=0))}else if(this.engineOn){let K=this.speed/.52*this.gearRatio*s.finalDrive*(60/(2*Math.PI));this.rpm=Et(Math.max(Math.abs(K),600+this.throttle*900),600,2400)}else this.rpm=Et(this.rpm-t*700,0,2400);this.gearTimer>0&&(this.rpm*=.9);let h=this.speed,d=this.mass,u=i.grade||0,f=this.tireGrip*(.55+.45*(this.tires/100))*(1-Math.min(.25,Math.abs(h)/90)),m=0,y=this.gearTimer>0?0:this.wheelForce*this.throttle*f,g=.0065*d*Ir*Math.sign(h||1)*(this.brake>.02?0:1),p=.5*$x*7.4*h*Math.abs(h),M=(this.handbrake?1:this.brake)*d*Ir*.78*(.4+.6*(this.brakes/100)),w=this.retarder*(this.brake>.05?1:0)*d*Ir*.22,x=d*Ir*Math.sin(u),E=(this.throttle<.03&&h>2&&this.gear>0?1:0)*d*Ir*.055*(this.rpm/1500),S=y-p-x-E;Math.abs(h)>.05&&(S-=g),S-=M+w,Math.abs(h)<.4&&(M>0||this.handbrake)?(S=0,this.speed=0):this.speed+=S/d*t;let R=this.maxSpeedLimit/3.6;if(this.speed>R+3&&(this.speed=ke(this.speed,R+3,.2)),this.speed<.02&&this.throttle<.02&&(this.speed=0),this.cruise!=null&&this.gear>0){let q=Et(this.cruise,20,Math.min(this.maxSpeedLimit,i.speedLimit))/3.6-this.speed;this.brake>.05?this.cruise=null:q>.2?this.throttle=Et(q*.3,0,.9):q<-.3&&(this.throttle=0)}this.s+=this.speed*t;let v=4.1,T=3.1*f,P=Math.abs(this.speed)>1?T/Math.abs(this.speed):2,C=Et(this.speed*Math.tan(this.steer)/v,-P,P),O=(i.curv||0)*this.speed*(1-.45);this.yawRel+=(C-O)*t,this.yawRel*=1/(1+t*2.2),this.yawRel=Et(this.yawRel,-.55,.55),this.lat+=this.yawRel*this.speed*t;let L=2.9;if(Math.abs(this.lat)>L+.9){let K=Math.sign(this.lat);this.speed*=1-.9*t,this.yawRel-=K*1.6*t,this.slip=Et((Math.abs(this.lat)-L)/3,0,1)}else this.slip=0,Math.abs(a)<.05&&Math.abs(this.lat)>1.9&&(this.lat-=Math.sign(this.lat)*.35*t);this.lat=Et(this.lat,-7.5,7.5);let k=this.yawRel*.55;this.trailerYawOffset+=(k-this.trailerYawOffset)*Math.min(1,t*2.4),this.trailerYaw=this.yawRel+this.trailerYawOffset;let V=this.throttle*(.5+Math.abs(this.speed)/60),W=62+V*48+(this.engine<50?12:0);if(this.temp+=(W-this.temp)*t/22,this.engineOn){let K=1.4+this.model.consumption/100*Math.max(0,this.speed*3.6)*(.55+V)*(1+this.cargoMass/45);this.fuel=Math.max(0,this.fuel-K*t/3600),this.fuel<=0&&(this.engineOn=!1,this.throttle=0),this.odometer+=Math.abs(this.speed)*t,this.temp>108&&(this.engine=Math.max(0,this.engine-t*1.4)),this.brake>.3&&(this.brakes=Math.max(0,this.brakes-t*.02*this.brake)),this.engine=Math.max(0,this.engine-Math.abs(this.speed)*t*12e-6*(1+Math.max(0,this.temp-95)/20)),this.tires=Math.max(0,this.tires-Math.abs(this.speed)*t*9e-6)}return this.pitch=ke(this.pitch,Et(-Math.asin(Et(u,-1,1)),-.3,.3),Math.min(1,t*3)),this.roll=ke(this.roll,Et(-this.yawRel*this.speed*.012,-.06,.06),Math.min(1,t*4)),this.impact>0&&(this.impact=Math.max(0,this.impact-t*1.5)),this}status(){return{speedKmh:Math.abs(this.speed)*3.6,rpm:this.rpm,gear:this.gear,fuel:this.fuel,fuelPct:this.fuel/this.fuelCapacity,temp:this.temp,engine:this.engine,tires:this.tires,brakes:this.brakes,s:this.s,lat:this.lat,odometer:this.odometer,throttle:this.throttle,brake:this.brake}}};var sl=class{constructor(){this.ctx=null,this.enabled=!0,this.volume=.7,this.started=!1}init(){if(this.ctx){this.ctx.state==="suspended"&&this.ctx.resume();return}let t=window.AudioContext||window.webkitAudioContext;if(!t)return;this.ctx=new t;let e=this.ctx;this.master=e.createGain(),this.master.gain.value=this.volume,this.master.connect(e.destination);let i=e.createBuffer(1,e.sampleRate*2,e.sampleRate),s=i.getChannelData(0);for(let a=0;a<s.length;a++)s[a]=Math.random()*2-1;this.noiseBuffer=i,this.engineGain=e.createGain(),this.engineGain.gain.value=0,this.engineFilter=e.createBiquadFilter(),this.engineFilter.type="lowpass",this.engineFilter.frequency.value=500,this.engineGain.connect(this.engineFilter),this.engineFilter.connect(this.master),this.osc1=e.createOscillator(),this.osc1.type="sawtooth",this.osc2=e.createOscillator(),this.osc2.type="square",this.osc1.connect(this.engineGain);let r=e.createGain();r.gain.value=.3,this.osc2.connect(r),r.connect(this.engineGain),this.osc1.frequency.value=60,this.osc2.frequency.value=30,this.osc1.start(),this.osc2.start(),this.turboGain=e.createGain(),this.turboGain.gain.value=0,this.turbo=e.createOscillator(),this.turbo.type="sine",this.turbo.frequency.value=1800,this.turbo.connect(this.turboGain),this.turboGain.connect(this.master),this.turbo.start(),this.rollNoise=e.createBufferSource(),this.rollNoise.buffer=i,this.rollNoise.loop=!0,this.rollFilter=e.createBiquadFilter(),this.rollFilter.type="bandpass",this.rollFilter.frequency.value=320,this.rollFilter.Q.value=.7,this.rollGain=e.createGain(),this.rollGain.gain.value=0,this.rollNoise.connect(this.rollFilter),this.rollFilter.connect(this.rollGain),this.rollGain.connect(this.master),this.rollNoise.start(),this.rainNoise=e.createBufferSource(),this.rainNoise.buffer=i,this.rainNoise.loop=!0,this.rainFilter=e.createBiquadFilter(),this.rainFilter.type="highpass",this.rainFilter.frequency.value=1400,this.rainGain=e.createGain(),this.rainGain.gain.value=0,this.rainNoise.connect(this.rainFilter),this.rainFilter.connect(this.rainGain),this.rainGain.connect(this.master),this.rainNoise.start(),this.started=!0}setEnabled(t){this.enabled=t,this.master&&(this.master.gain.value=t?this.volume:0)}setVolume(t){this.volume=t,this.master&&this.enabled&&(this.master.gain.value=t)}update({rpm:t=700,throttle:e=0,speed:i=0,rain:s=0,engineOn:r=!0,gear:a=0}){if(!this.started||!this.enabled)return;let l=this.ctx.currentTime,c=Math.max(.15,t/700);this.osc1.frequency.setTargetAtTime(32*c,l,.08),this.osc2.frequency.setTargetAtTime(16*c,l,.08),this.engineFilter.frequency.setTargetAtTime(260+e*900+c*120,l,.1),this.engineGain.gain.setTargetAtTime(r?.045+e*.075:0,l,.12),this.turboGain.gain.setTargetAtTime(r&&t>1400?(t-1400)/1400*.02:0,l,.2),this.turbo.frequency.setTargetAtTime(1200+c*900,l,.2);let h=Math.min(1,Math.abs(i)/28);this.rollGain.gain.setTargetAtTime(h*.05,l,.2),this.rollFilter.frequency.setTargetAtTime(220+h*420,l,.2),this.rainGain.gain.setTargetAtTime(s*.08,l,.4)}honk(){if(!this.ctx||!this.enabled)return;let t=this.ctx,e=t.currentTime;for(let i of[370,466]){let s=t.createOscillator();s.type="square",s.frequency.value=i;let r=t.createGain();r.gain.setValueAtTime(1e-4,e),r.gain.exponentialRampToValueAtTime(.09,e+.02),r.gain.exponentialRampToValueAtTime(1e-4,e+.55),s.connect(r),r.connect(this.master),s.start(e),s.stop(e+.6)}}blip(t=660,e=.08,i="sine",s=.06){if(!this.ctx||!this.enabled)return;let r=this.ctx,a=r.currentTime,o=r.createOscillator();o.type=i,o.frequency.value=t;let l=r.createGain();l.gain.setValueAtTime(1e-4,a),l.gain.exponentialRampToValueAtTime(s,a+.01),l.gain.exponentialRampToValueAtTime(1e-4,a+e),o.connect(l),l.connect(this.master),o.start(a),o.stop(a+e+.02)}click(){this.blip(880,.05,"triangle",.035)}shift(){this.blip(220,.09,"sawtooth",.03)}indicator(){this.blip(1200,.06,"square",.025)}cash(){this.blip(880,.1,"triangle",.05),setTimeout(()=>this.blip(1320,.14,"triangle",.05),90)}alarm(){this.blip(520,.18,"square",.05),setTimeout(()=>this.blip(390,.22,"square",.05),200)}};var _d={curtain:{name:"\u0422\u0435\u043D\u0442\u043E\u0432\u0430\u043D\u043D\u044B\u0439 \u043F\u043E\u043B\u0443\u043F\u0440\u0438\u0446\u0435\u043F",short:"\u0422\u0435\u043D\u0442",length:13.6,wheelbase:9.2},fridge:{name:"\u0420\u0435\u0444\u0440\u0438\u0436\u0435\u0440\u0430\u0442\u043E\u0440",short:"\u0420\u0435\u0444",length:13.6,wheelbase:9.2},tank:{name:"\u0426\u0438\u0441\u0442\u0435\u0440\u043D\u0430",short:"\u0426\u0438\u0441\u0442\u0435\u0440\u043D\u0430",length:13.2,wheelbase:8.8},flatbed:{name:"\u041F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430",short:"\u041F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430",length:13.7,wheelbase:9.3},container:{name:"\u041A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440\u043E\u0432\u043E\u0437",short:"\u041A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440",length:13.6,wheelbase:9.2},log:{name:"\u041B\u0435\u0441\u043E\u0432\u043E\u0437",short:"\u041B\u0435\u0441\u043E\u0432\u043E\u0437",length:14,wheelbase:9.5}},Xc=[["\u041F\u0430\u043A\u0435\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0435 \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u044B","general","curtain",12,22,1.35,1],["\u0411\u044B\u0442\u043E\u0432\u0430\u044F \u0442\u0435\u0445\u043D\u0438\u043A\u0430","general","curtain",8,18,1.5,1],["\u0421\u0442\u0440\u043E\u0439\u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B\u044B","heavy","flatbed",18,26,1.6,1],["\u041F\u0438\u043B\u043E\u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B\u044B","heavy","log",20,28,1.55,2],["\u041C\u0435\u0431\u0435\u043B\u044C","fragile","curtain",6,16,1.45,1],["\u041E\u0432\u043E\u0449\u0438 \u0438 \u0444\u0440\u0443\u043A\u0442\u044B","fridge","fridge",12,22,1.55,1],["\u041C\u044F\u0441\u043D\u0430\u044F \u043F\u0440\u043E\u0434\u0443\u043A\u0446\u0438\u044F","fridge","fridge",10,20,1.75,2],["\u041C\u043E\u043B\u043E\u0447\u043D\u044B\u0435 \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u044B","fridge","fridge",9,19,1.7,1],["\u041C\u0435\u0434\u0438\u043A\u0430\u043C\u0435\u043D\u0442\u044B","fragile","fridge",4,12,2.25,3],["\u042D\u043B\u0435\u043A\u0442\u0440\u043E\u043D\u0438\u043A\u0430","valuable","curtain",3,10,2.4,2],["\u0421\u0442\u0435\u043A\u043B\u043E \u0438 \u0437\u0435\u0440\u043A\u0430\u043B\u0430","fragile","flatbed",8,18,1.85,2],["\u0410\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u044C\u043D\u044B\u0435 \u0437\u0430\u043F\u0447\u0430\u0441\u0442\u0438","general","curtain",6,16,1.6,2],["\u0421\u0442\u0430\u043B\u044C\u043D\u043E\u0439 \u043F\u0440\u043E\u043A\u0430\u0442","heavy","flatbed",22,28,1.7,2],["\u0422\u0440\u0443\u0431\u044B \u0431\u043E\u043B\u044C\u0448\u043E\u0433\u043E \u0434\u0438\u0430\u043C\u0435\u0442\u0440\u0430","heavy","flatbed",20,27,1.65,2],["\u0426\u0435\u043C\u0435\u043D\u0442","heavy","tank",22,28,1.5,1],["\u0422\u043E\u043F\u043B\u0438\u0432\u043E","adr","tank",20,30,2.15,3],["\u0425\u0438\u043C\u0438\u043A\u0430\u0442\u044B","adr","tank",16,26,2.35,3],["\u0421\u0436\u0438\u0436\u0435\u043D\u043D\u044B\u0439 \u0433\u0430\u0437","adr","tank",18,27,2.4,4],["\u041A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440\u044B \u0441 \u043E\u0434\u0435\u0436\u0434\u043E\u0439","general","container",10,22,1.45,1],["\u0411\u0443\u043C\u0430\u0433\u0430 \u0432 \u0440\u0443\u043B\u043E\u043D\u0430\u0445","heavy","curtain",18,26,1.5,1],["\u041A\u043E\u0444\u0435 \u0438 \u0447\u0430\u0439","valuable","curtain",5,14,1.95,2],["\u0412\u0438\u043D\u043E \u0438 \u043D\u0430\u043F\u0438\u0442\u043A\u0438","fragile","curtain",10,20,1.8,2],["\u0421\u0435\u043B\u044C\u0445\u043E\u0437\u0442\u0435\u0445\u043D\u0438\u043A\u0430","heavy","flatbed",18,27,1.85,3],["\u0421\u043E\u043B\u043D\u0435\u0447\u043D\u044B\u0435 \u043F\u0430\u043D\u0435\u043B\u0438","fragile","flatbed",6,16,1.9,3],["\u0421\u043F\u043E\u0440\u0442\u0438\u0432\u043D\u044B\u0435 \u0442\u043E\u0432\u0430\u0440\u044B","general","curtain",4,14,1.4,1],["\u0428\u0438\u043D\u044B","general","container",12,24,1.4,1],["\u0414\u0435\u0442\u0441\u043A\u0438\u0435 \u0438\u0433\u0440\u0443\u0448\u043A\u0438","general","container",4,12,1.35,1],["\u041C\u043E\u0440\u043E\u0436\u0435\u043D\u043E\u0435","fridge","fridge",8,18,2,2],["\u0416\u0438\u0432\u0430\u044F \u0440\u044B\u0431\u0430","adr","tank",8,16,2.1,3],["\u0414\u0440\u0435\u0432\u0435\u0441\u043D\u044B\u0435 \u0433\u0440\u0430\u043D\u0443\u043B\u044B","heavy","curtain",20,27,1.45,1]],gd=["Nord","Trans","Euro","Vega","Alpen","Baltic","Rhein","Adria","Danube","Iberia","Scandi","Lombard","Helvet","Vistula","Carpath","Atlantic","Oder","Rhone","Tiber","Fjord"],xd=["Logistik","Cargo","Trans","Freight","Spedition","Logistics","Transport","Lines","Group","Handel"];function vd(n){let t=gd[Math.floor(n*7919)%gd.length],e=xd[Math.floor(n*104729)%xd.length];return`${t} ${e}`}var Zx={general:"\u041E\u0411\u042B\u0427\u041D\u042B\u0419",fragile:"\u0425\u0420\u0423\u041F\u041A\u0418\u0419",fridge:"\u0420\u0415\u0424",heavy:"\u0422\u042F\u0416\u0401\u041B\u042B\u0419",valuable:"\u0426\u0415\u041D\u041D\u042B\u0419",adr:"ADR"},Jx=15;function Kx(n,t){let e=n.skills||{},i=1;return t.category==="valuable"&&(i+=.12*(e.value||0)),t.category==="fragile"&&(i+=.1*(e.fragile||0)),t.category==="adr"&&(i+=.14*(e.adr||0)),t.category==="heavy"&&(i+=.06*(e.long||0)),i}function jx(n,t,e){let i=n.skills||{};return!(t.category==="adr"&&(i.adr||0)<1||t.category==="valuable"&&(i.value||0)<1||e>400&&(i.long||0)<1||(n.level||1)<t.minLevel)}function Qx(n,t,e,i){let s=Be(e),r=oe.get(t),a=Un.filter(O=>O.id!==t),o=null,l=0;for(let O=0;O<26;O++){let L=a[Math.floor(s()*a.length)],{km:k}=Pr(t,L.id),V=s();if(V<.55?k<90:!(V<.85)||k<260){o=L,l=k;break}}o||(o=a[Math.floor(s()*a.length)],l=Pr(t,o.id).km),l=Math.max(9,l);let c=Xc.filter(O=>jx(n,{category:O[1],minLevel:O[6]},l)),h=(c.length?c:Xc.filter(O=>O[1]==="general"))[Math.floor(s()*(c.length||1))],[,d,u,f,m,y,g]=h,p=Math.round((f+s()*(m-f))*10)/10,M=s()<.18+.05*(n.skills?.urgent||0),w=d==="fragile"||d==="valuable",x=.85+p/55,E=Kx(n,{category:d}),S=M?1.28:1,R=l*y*x*E*S*Jx;R=Math.round(R/5)*5;let v=l/70*60*3*1.15,T=M?40+s()*40:90+s()*150,P=Math.round(v+T),C=vd(s()),I=Math.round(i+240+s()*720);return{id:"job-"+e.toString(36),from:t,to:o.id,fromName:r.name,toName:o.name,fromCountry:r.country,toCountry:o.country,cargo:h[0],category:d,tag:Zx[d]||"\u0413\u0420\u0423\u0417",trailer:u,trailerName:_d[u]?.name||"\u041F\u043E\u043B\u0443\u043F\u0440\u0438\u0446\u0435\u043F",mass:p,distance:l,pay:R,deadlineMin:P,urgent:M,fragile:w,adr:d==="adr",company:C,expires:I,acceptedAt:null,minLevel:g}}function yd(n,t,e,i,s=1){let r=[];for(let a=0;a<e;a++){let o=Ho(t+":"+Math.floor(i/180)+":"+a+":"+s);r.push(Qx(n,t,o,i))}return r}function Md(n,t,e,i){let s=n.pay,r=[];if(e>0){let a=Math.min(.45,e/Math.max(60,n.deadlineMin)*.9);s*=1-a,r.push(`\u041F\u0440\u043E\u0441\u0440\u043E\u0447\u043A\u0430: \u2212${Math.round(a*100)}%`)}if(t>.5){let a=Math.min(.3,t/200);s*=1-a,r.push(`\u041F\u043E\u0432\u0440\u0435\u0436\u0434\u0435\u043D\u0438\u0435: \u2212${Math.round(a*100)}%`)}return i&&(s-=i,r.push(`\u0428\u0442\u0440\u0430\u0444\u044B: \u2212${se(i)}`)),{total:Math.max(0,Math.round(s/5)*5),notes:r}}function bd(n,t,e){let i=40+n.distance*3.2+(n.urgent?40:0)+(n.adr?30:0);return t>20&&(i*=.8),e>0&&(i*=.75),Math.round(i)}var Xe=n=>document.getElementById(n),Lr=["interior","hood","chase","far"],t_=20,qc=class{constructor(){this.audio=new sl,this.settings=rd(),this.saves=sd(),this.profile=null,this.slot=0,this.state="menu",this.paused=!1,this.offers=[],this.route=null,this.job=null,this.phase=null,this.clock={day:1,minutes:480},this.input={keys:new Set,touch:{}},this.cameraMode=Lr.includes(this.settings.camera)?this.settings.camera:"interior",this.collisionCooldown=0,this.cameraShake=0,this.lastHudUpdate=0,this.lastSave=0,this.weatherTimer=0,this.interaction=null,this.parkedAtDepot=null,this.work=null,this.driverIncomeTimer=0,this.fines=0,this.camerasHit=new Set,this.lastGear=0,this.tipsShown=new Set,this.fps=60,this.fpsAccum=0,this.fpsFrames=0,this.drivingDistance=0,this.nightDistance=0,this.lightsOn=!1,this.network=Vc(),this.ui=new qo(this),this.audio.setVolume(this.settings.volume),this.audio.setEnabled(this.settings.sound),this.init3D(),this.bindInput(),this.refreshSaveInfo(),this.ui.setScreen("menu"),this.last=performance.now(),this.accumulator=0,this.raf=this.loop.bind(this),requestAnimationFrame(this.raf)}init3D(){try{this.renderer=new Oo({canvas:Xe("scene"),antialias:!0,powerPreference:"high-performance",alpha:!1,preserveDrawingBuffer:!0}),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.75)),this.renderer.setSize(window.innerWidth,window.innerHeight,!1),this.renderer.outputColorSpace=Se,this.renderer.toneMapping=mr,this.renderer.toneMappingExposure=1.05,this.renderer.shadowMap.enabled=!1}catch(t){console.error(t),Xe("webgl-error").classList.remove("hidden");return}this.scene=new Ws,this.camera=new Ze(68,window.innerWidth/window.innerHeight,.08,5200),this.camera.position.set(0,3,0),this.sky=new el(this.scene,this.renderer),this.truckView=new jo(this.scene,3112872),this.truckView.setInteriorVisible(!0),this.road=null,this.traffic=null,this.truckPos=new D,this.tmpVec=new D,this.camTarget=new D,this.camLookAt=new D,this.tmpVec2=new D,this.camLook=new D,this.camPos=new D(0,0,0),this.smoothCam=null,window.addEventListener("resize",()=>{if(!this.renderer)return;let t=window.innerWidth,e=window.innerHeight;this.renderer.setSize(t,e,!1),this.camera.aspect=t/e,this.camera.updateProjectionMatrix()}),window.matchMedia&&window.matchMedia("(pointer: coarse)").matches&&Xe("hud").classList.add("touch-device")}bindInput(){window.addEventListener("gamepadconnected",()=>{this.ui.toast("\u0413\u0435\u0439\u043C\u043F\u0430\u0434 \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0451\u043D: RT \u2014 \u0433\u0430\u0437, LT \u2014 \u0442\u043E\u0440\u043C\u043E\u0437, \u0441\u0442\u0438\u043A \u2014 \u0440\u0443\u043B\u044C","good",5e3)}),window.addEventListener("keydown",t=>{if(!(t.target&&["INPUT","SELECT","TEXTAREA"].includes(t.target.tagName))&&this.state==="driving"){switch(this.input.keys.add(t.code),t.code){case"Escape":t.preventDefault(),Xe("modal-root").classList.contains("hidden")?this.togglePause():this.ui.closeModal();break;case"KeyC":this.toggleCruise();break;case"KeyV":this.cycleCamera();break;case"KeyM":this.toggleGearbox();break;case"KeyL":this.toggleLights();break;case"KeyE":this.interact();break;case"KeyH":this.audio.honk();break;case"KeyP":this.takeScreenshot();break;case"Comma":this.toggleIndicator(-1);break;case"Period":this.toggleIndicator(1);break;case"KeyR":this.truck.toggleReverse()&&(this.audio.shift(),this.ui.toast(this.truck.gear===-1?"\u0417\u0430\u0434\u043D\u0438\u0439 \u0445\u043E\u0434":"\u041D\u0435\u0439\u0442\u0440\u0430\u043B\u044C\u043D\u0430\u044F \u043F\u0435\u0440\u0435\u0434\u0430\u0447\u0430","info",1400));break;case"KeyF":this.truck.toggleEngine(),this.audio.blip(180,.25,"sawtooth",.05);break;case"ShiftLeft":case"PageUp":this.truck.autoGearbox||(this.truck.shiftUp(),this.audio.shift());break;case"ControlLeft":case"PageDown":this.truck.autoGearbox||(this.truck.shiftDown(),this.audio.shift());break;default:break}["ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].includes(t.code)&&t.preventDefault()}}),window.addEventListener("keyup",t=>this.input.keys.delete(t.code)),window.addEventListener("blur",()=>{this.input.keys.clear();for(let t of Object.keys(this.input.touch))this.input.touch[t]=!1})}key(...t){return t.some(e=>this.input.keys.has(e))}pollGamepad(){if(!navigator.getGamepads)return null;let t=navigator.getGamepads(),e=t&&(t[0]||t[1]||t[2]||t[3]);if(!e)return null;let s=Math.abs(e.axes[0]||0)>.16?e.axes[0]:0,r=e.buttons[7]?.value||0,a=e.buttons[6]?.value||0;return{steer:s,throttle:r,brake:a,buttons:e.buttons}}padButton(t){let e=this.pollGamepad();return e?!!e.buttons[t]?.pressed:!1}handlePadButtons(){let t=this.padPrev||{},e=(i,s,r)=>{let a=this.padButton(i);a&&!t[s]&&r(),t[s]=a};e(3,"camera",()=>this.cycleCamera()),e(2,"interact",()=>this.interact()),e(9,"pause",()=>this.togglePause()),e(0,"cruise",()=>this.toggleCruise()),e(1,"lights",()=>this.toggleLights()),e(12,"up",()=>{this.truck.autoGearbox||(this.truck.shiftUp(),this.audio.shift())}),e(13,"down",()=>{this.truck.autoGearbox||(this.truck.shiftDown(),this.audio.shift())}),this.padPrev=t}toggleIndicator(t){this.truck&&(this.indicator=this.indicator===t?0:t,this.indicatorTimer=0,this.blinkPhase=0,this.indicator&&this.ui.toast(t<0?"\u041B\u0435\u0432\u044B\u0439 \u043F\u043E\u0432\u043E\u0440\u043E\u0442\u043D\u0438\u043A":"\u041F\u0440\u0430\u0432\u044B\u0439 \u043F\u043E\u0432\u043E\u0440\u043E\u0442\u043D\u0438\u043A","info",1200))}controls(){let t=this.input.touch,e=0,i=0,s=0;(this.key("KeyW","ArrowUp")||t.KeyW)&&(e=1),(this.key("KeyS","ArrowDown")||t.KeyS)&&(i=1),this.truck&&(this.truck.handbrake=this.key("Space")),(this.key("KeyA","ArrowLeft")||t.KeyA)&&(s-=1),(this.key("KeyD","ArrowRight")||t.KeyD)&&(s+=1);let r=this.pollGamepad();return r&&(Math.abs(r.steer)>0&&(s=Et(s+r.steer,-1,1)),r.throttle>.05&&(e=Math.max(e,r.throttle)),r.brake>.05&&(i=Math.max(i,r.brake))),{throttle:e,brake:i,steer:s}}refreshSaveInfo(){let t=this.saves.slots.filter(Boolean);Xe("btn-continue").disabled=t.length===0,Xe("menu-save-info").textContent=t.length?`\u0421\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0439: ${t.length} \xB7 \u043F\u043E\u0441\u043B\u0435\u0434\u043D\u0435\u0435: ${t[0]?.name||t[1]?.name||t[2]?.name}`:"\u0421\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u0439 \u043F\u043E\u043A\u0430 \u043D\u0435\u0442 \u2014 \u043D\u0430\u0447\u043D\u0438\u0442\u0435 \u043A\u0430\u0440\u044C\u0435\u0440\u0443";let e=this.saves.slots[this.saves.lastSlot];Xe("btn-continue").textContent=e?`\u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u044C: ${e.name}`:"\u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u044C \u043A\u0430\u0440\u044C\u0435\u0440\u0443"}continueCareer(){let t=this.saves.slots.findIndex(e=>e&&e.id===this.saves.slots[this.saves.lastSlot]?.id);this.loadSlot(t>=0?t:this.saves.slots.findIndex(Boolean))}loadSlot(t){let e=this.saves.slots[t];if(!e){this.newCareerDialog(t);return}this.slot=t,this.profile=ad(e),this.clock={...this.profile.clock},this.audio.init(),this.enterGarage()}newCareerDialog(t){let e=Number.isInteger(t)?t:this.saves.slots.findIndex(r=>!r),i=e>=0?e:0;this.ui.openModal({eyebrow:"\u041D\u041E\u0412\u0410\u042F \u041A\u0410\u0420\u042C\u0415\u0420\u0410",title:"\u041D\u0430\u0447\u0430\u0442\u044C \u043F\u0443\u0442\u044C",body:`<p>\u0412\u044B \u2014 \u0432\u043B\u0430\u0434\u0435\u043B\u0435\u0446 \u043F\u043E\u0434\u0435\u0440\u0436\u0430\u043D\u043D\u043E\u0433\u043E \u0442\u044F\u0433\u0430\u0447\u0430 \u0438 \u0443\u0447\u0430\u0441\u0442\u043D\u0438\u043A \u0435\u0432\u0440\u043E\u043F\u0435\u0439\u0441\u043A\u043E\u0433\u043E \u0440\u044B\u043D\u043A\u0430 \u0433\u0440\u0443\u0437\u043E\u043F\u0435\u0440\u0435\u0432\u043E\u0437\u043E\u043A.</p>
        <div class="field-row"><label>\u0418\u043C\u044F \u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044F</label><input type="text" id="new-name" value="\u0412\u043E\u0434\u0438\u0442\u0435\u043B\u044C" maxlength="18"></div>
        <div class="field-row"><label>\u0421\u0442\u0430\u0440\u0442\u043E\u0432\u044B\u0439 \u0433\u043E\u0440\u043E\u0434</label>
          <select id="new-city" style="background:rgba(255,255,255,.06);border:1px solid var(--line);color:var(--text);padding:8px 10px;border-radius:8px;font-family:inherit">
            ${["berlin","amsterdam","paris","warsaw","vienna","prague","munich","milan"].map(r=>`<option value="${r}">${oe.get(r).name}</option>`).join("")}
          </select></div>
        <div class="field-row"><label>\u0421\u043B\u043E\u0442 \u0441\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u044F</label><b>${i+1}</b></div>
        <p style="font-size:12px">\u0421\u0442\u0430\u0440\u0442\u043E\u0432\u044B\u0439 \u043A\u0430\u043F\u0438\u0442\u0430\u043B: 9 200 \u20AC, \u0442\u044F\u0433\u0430\u0447 Auriga 3 \xB7 330 \u043B.\u0441. \u0417\u0430\u0440\u0430\u0431\u043E\u0442\u0430\u0442\u044C \u043D\u0430 \u043D\u043E\u0432\u044B\u0439 \u0433\u0440\u0443\u0437\u043E\u0432\u0438\u043A \u043C\u043E\u0436\u043D\u043E \u0440\u0435\u0439\u0441\u0430\u043C\u0438.</p>`,actions:[{label:"\u041E\u0442\u043C\u0435\u043D\u0430",act:"close"},{label:"\u041D\u0430\u0447\u0430\u0442\u044C \u043A\u0430\u0440\u044C\u0435\u0440\u0443",primary:!0,act:"create-career",arg:String(i)}]});let s=Xe("modal-foot").querySelector('[data-act="create-career"]');s&&s.addEventListener("click",()=>{let r=(Xe("new-name")?.value||"\u0412\u043E\u0434\u0438\u0442\u0435\u043B\u044C").trim().slice(0,18)||"\u0412\u043E\u0434\u0438\u0442\u0435\u043B\u044C",a=Xe("new-city")?.value||"berlin";this.ui.closeModal(),this.createCareer(r,a,i)})}createCareer(t,e,i){let s=Fc(t);s.currentCity=e,s.companyName="Auriga Logistics",this.slot=i,this.profile=s,this.clock={...s.clock},this.audio.init(),this.saveNow(),this.enterGarage(),this.ui.toast("\u041A\u0430\u0440\u044C\u0435\u0440\u0430 \u0441\u043E\u0437\u0434\u0430\u043D\u0430. \u0412\u043E\u0437\u044C\u043C\u0438\u0442\u0435 \u043F\u0435\u0440\u0432\u044B\u0439 \u0433\u0440\u0443\u0437!","good",4200)}profilesDialog(){let e=`<div class="slot-list">${this.saves.slots.map((i,s)=>i?`<div class="slot">
          <div class="slot-num">${s+1}</div>
          <div class="slot-info"><b>${i.name}</b>
            <small>${oe.get(i.currentCity)?.name||"\u2014"} \xB7 ${i.stats?.deliveries||0} \u0440\u0435\u0439\u0441\u043E\u0432 \xB7 ${se(i.money)}</small>
          </div>
          <button class="btn btn-sm btn-primary" data-act="load-slot" data-arg="${s}">\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C</button>
          <button class="btn btn-sm btn-ghost" data-act="delete-slot" data-arg="${s}">\u0423\u0434\u0430\u043B\u0438\u0442\u044C</button>
        </div>`:`<div class="slot" data-act="new-slot" data-arg="${s}">
            <div class="slot-num">${s+1}</div>
            <div class="slot-info"><b>\u0421\u0432\u043E\u0431\u043E\u0434\u043D\u044B\u0439 \u0441\u043B\u043E\u0442</b><small>\u041D\u0430\u0447\u0430\u0442\u044C \u043D\u043E\u0432\u0443\u044E \u043A\u0430\u0440\u044C\u0435\u0440\u0443</small></div>
            <button class="btn btn-sm">\u0421\u043E\u0437\u0434\u0430\u0442\u044C</button>
          </div>`).join("")}</div>`;this.ui.openModal({eyebrow:"\u041F\u0420\u041E\u0424\u0418\u041B\u0418",title:"\u0421\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u0438\u044F",body:e,actions:[{label:"\u0417\u0430\u043A\u0440\u044B\u0442\u044C",act:"close"}]})}deleteSlot(t){this.saves.slots[t]=null,Wo(this.saves.slots,this.saves.lastSlot),this.profile&&this.slot===t&&(this.profile=null,this.state="menu"),this.refreshSaveInfo(),this.profilesDialog()}returnToMenu(){this.profile&&this.saveNow(),this.state="menu",this.paused=!1,this.ui.setScreen("menu"),this.refreshSaveInfo(),this.disposeWorld()}enterGarage(t="jobs"){this.state="garage",this.paused=!1,this.disposeWorld(),this.profile.level=gi(this.profile.xp||0).level,this.clock={...this.profile.clock},this.refreshOffers(),this.ui.setScreen("garage"),this.ui.navTab=t,this.ui.renderGarage(),this.saveNow()}openGarageTab(t){this.enterGarage(t)}currentMinutes(){return(this.clock.day-1)*1440+this.clock.minutes}refreshOffers(t=!1){if(!this.profile)return;let e=this.currentMinutes();if(!t&&this.offers.length&&(this.offers=this.offers.filter(s=>s.expires>e),this.offers.length>=6))return;let i=Math.floor(e/240);this.offers=yd(this.profile,this.profile.currentCity,10,e,i)}freeDrive(t){if(!t||t===this.profile.currentCity){this.ui.toast("\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0434\u0440\u0443\u0433\u043E\u0439 \u0433\u043E\u0440\u043E\u0434 \u0434\u043B\u044F \u043F\u043E\u0435\u0437\u0434\u043A\u0438","info");return}let e={id:"free-"+Date.now(),from:this.profile.currentCity,to:t,fromName:oe.get(this.profile.currentCity).name,toName:oe.get(t)?.name||t,cargo:"\u0411\u0435\u0437 \u0433\u0440\u0443\u0437\u0430",mass:0,category:"general",trailer:"curtain",pay:0,deadlineMin:9999,distance:Math.max(5,fd(oe.get(this.profile.currentCity),oe.get(t))),free:!0,seed:Date.now()%1e5};this.ui.closeModal(),this.startDrive(e)}acceptJob(t){if(this.profile.activeJob){this.ui.openModal({eyebrow:"\u0412\u041D\u0418\u041C\u0410\u041D\u0418\u0415",title:"\u0423\u0436\u0435 \u0435\u0441\u0442\u044C \u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0439 \u0440\u0435\u0439\u0441",body:`<p>\u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u0437\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u0435 \u0442\u0435\u043A\u0443\u0449\u0438\u0439 \u043A\u043E\u043D\u0442\u0440\u0430\u043A\u0442: ${this.profile.activeJob.fromName} \u2192 ${this.profile.activeJob.toName}.</p>`,actions:[{label:"\u041A \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u043C\u0443 \u0440\u0435\u0439\u0441\u0443",primary:!0,act:"continue-job"},{label:"\u041E\u0442\u043C\u0435\u043D\u0430",act:"close"}]});return}let e=oe.get(t.from);if(t.free!==!0&&e.id!==this.profile.currentCity){this.ui.toast("\u041A\u043E\u043D\u0442\u0440\u0430\u043A\u0442 \u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D \u0442\u043E\u043B\u044C\u043A\u043E \u0438\u0437 \u0442\u0435\u043A\u0443\u0449\u0435\u0433\u043E \u0433\u043E\u0440\u043E\u0434\u0430","bad");return}let i={...t,seed:t.seed||Ho(t.id),acceptedAt:this.currentMinutes(),routeCities:null};this.profile.activeJob=i,this.startDrive(i)}continueActiveJob(){if(!this.profile.activeJob){this.ui.toast("\u041D\u0435\u0442 \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0433\u043E \u0440\u0435\u0439\u0441\u0430","info");return}this.ui.closeModal(),this.startDrive(this.profile.activeJob)}abandonJob(){this.profile.activeJob=null,this.enterGarage(),this.ui.toast("\u0420\u0435\u0439\u0441 \u043E\u0442\u043C\u0435\u043D\u0451\u043D","info")}startDrive(t){this.ui.loading("\u0421\u0442\u0440\u043E\u0438\u043C \u043C\u0430\u0440\u0448\u0440\u0443\u0442\u2026",`${t.fromName} \u2192 ${t.toName}`),this.state="loading",setTimeout(()=>{try{this.setupWorld(t),this.state="driving",this.ui.setScreen("driving"),this.paused=!1}catch(e){console.error(e),this.ui.toast("\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u043F\u043E\u0441\u0442\u0440\u043E\u0438\u0442\u044C \u043C\u0430\u0440\u0448\u0440\u0443\u0442","bad"),this.enterGarage()}},60)}setupWorld(t){this.disposeWorld();let e=t.seed||1234,i=md(t.routeCities||this.pathFor(t.from,t.to),e);t.routeCities=i.cityIds,this.route=i,this.job=t,t.distance=Math.round(i.km*10)/10,this.phase=t.free?"free":"pickup",this.fines=0,this.camerasHit.clear(),this.work=null,this.parkedAtDepot=null,this.interaction=null;let s=xn.find(c=>c.id===this.profile.truck.paint)||xn[1];this.truckView.setPaint(s.hex),this.truckView.setInteriorVisible(this.cameraMode==="interior");let r=Te.find(c=>c.id===this.profile.truck.modelId)||Te[0],a=_n.engine[this.profile.truck.engine||0];this.truck=new nl({model:r,upgradePower:a.power,tireGrip:_n.tires[this.profile.truck.tires||0].grip,retarder:_n.retarder[this.profile.truck.retarder||0].strength,cargoMass:0,fuel:Math.round(this.profile.truck.fuel),engine:this.profile.truck.condition.engine,tires:this.profile.truck.condition.tires,brakes:this.profile.truck.condition.brakes,odometer:this.profile.truck.odometer}),this.truck.engineOn=!0,this.truck.handbrake=!1;let o=i.marks[0],l=i.marks[i.marks.length-1];this.startS=40,this.pickupS=Et(o.s+1100,200,i.length-200),this.deliveryS=Et((l?.s||i.length)-700,300,i.length-60),this.phaseStartS=this.startS,this.truck.s=this.startS,this.truck.lat=1.85,this.playerSpeed=0,t.playerS!=null&&(this.truck.s=Et(t.playerS,20,i.length-40),this.phase=t.phase||this.phase,this.cargoDamage=t.cargoDamage||0,this.phase==="delivery"&&(this.truck.cargoMass=t.mass||0)),this.phaseStartS=this.phase==="delivery"?this.pickupS:this.startS,this.depots=[{s:this.pickupS,label:"\u041F\u041E\u0413\u0420\u0423\u0417\u041A\u0410",sub:this.job.company||"",color:"#1f5c3a"},{s:this.deliveryS,label:"\u0412\u042B\u0413\u0420\u0423\u0417\u041A\u0410",sub:this.job.toName||"",color:"#8a5a12"}],this.road=new Jo(this.scene,i,this.depots),this.traffic=new Qo(this.scene,i,this.settings.quality==="low"?14:26),this.traffic.reset(i),this.setWeather(this.pickWeather(),!0),this.drivingDistance=0,this.nightDistance=0,this.ui.toast("\u0414\u0432\u0438\u0433\u0430\u0442\u0435\u043B\u044C \u0440\u0430\u0431\u043E\u0442\u0430\u0435\u0442. W \u2014 \u0433\u0430\u0437, E \u2014 \u043F\u043E\u0433\u0440\u0443\u0437\u043A\u0430, V \u2014 \u043A\u0430\u043C\u0435\u0440\u0430","info",5e3),this.updateCamera(.016,!0)}pathFor(t,e){return Pr(t,e).path}targetS(){return this.phase==="pickup"?this.pickupS:this.deliveryS}remainingMeters(){return!this.route||!this.truck?0:this.targetS()-this.truck.s}phaseDistance(){return this.phase==="pickup"?Math.max(1,Math.abs(this.pickupS-this.startS)):this.phase==="delivery"?Math.max(1,this.deliveryS-this.pickupS):Math.max(1,this.deliveryS-this.startS)}etaMinutes(){let t=Math.abs(this.remainingMeters()),e=Math.max(8,Math.abs(this.truck?.speed||0)*3.6*.9);return Math.round(t/1e3/e*60)}jobElapsed(){return this.job?Math.max(0,this.currentMinutes()-(this.job.acceptedAt??this.currentMinutes())):0}pickWeather(){let t=Math.random();return t<.36?"clear":t<.62?"cloudy":t<.78?"overcast":t<.9?"rain":t<.95?"storm":"fog"}setWeather(t,e=!1){this.weatherId=t,this.sky.setWeather(t,e),this.weatherTimer=900+Math.random()*1500}advanceClock(t){let e=Number(this.settings.timeScale)||3,i=t*e/60;for(this.clock.minutes+=i;this.clock.minutes>=1440;)this.clock.minutes-=1440,this.clock.day++,this.payDriverIncome();this.weatherTimer-=i,this.weatherTimer<=0&&this.setWeather(this.pickWeather()),this.driverIncomeTimer+=i,this.driverIncomeTimer>=60&&(this.driverIncomeTimer=0,this.payDriverIncome())}payDriverIncome(){if(!this.profile)return;let t=this.profile.drivers||[];if(!t.length)return;let e=0;for(let i of t)e+=i.rate,i.earned=(i.earned||0)+i.rate,i.exp=(i.exp||0)+1,i.rate=Math.min(600,Math.round(i.rate*1.004));this.profile.money+=e,e>0&&this.state==="driving"&&this.ui.toast(`\u0412\u043E\u0434\u0438\u0442\u0435\u043B\u0438 \u0437\u0430\u0440\u0430\u0431\u043E\u0442\u0430\u043B\u0438 ${se(e)}`,"good")}airTemp(){let t=(this.clock.minutes-360)/1440,e=12+Math.sin(t*Math.PI*2)*7,i=this.weatherId;return Math.round(e+(i==="rain"||i==="storm"?-3:i==="clear"?3:0))}loop(t){let e=Math.min(.05,(t-this.last)/1e3);this.last=t,this.fpsAccum+=e,this.fpsFrames++,this.fpsAccum>.5&&(this.fps=this.fpsFrames/this.fpsAccum,this.fpsAccum=0,this.fpsFrames=0),this.state==="driving"&&!this.paused&&this.truck?this.updateDriving(e):(this.state==="garage"||this.state==="menu")&&this.clock&&this.profile&&this.advanceClock(e*.25),this.renderer&&this.renderer.render(this.scene,this.camera),requestAnimationFrame(this.raf)}updateDriving(t){this.advanceClock(t),this.sky.setTime(this.clock.minutes);let e=this.sky.update(t,this.camera,this.clock.minutes);this.night=e.night,this.road.night=e.night,this.road.weatherWetness=e.wet,this.road.update(this.truck.s,t),this.handlePadButtons(),this.updateIndicators(t);let i=this.controls();if(this.work){i.throttle=0,i.brake=1,this.work.elapsed+=t;let d=this.work.elapsed/this.work.duration;if(this.work.elapsed>=this.work.duration){let u=this.work.onDone;this.work=null,this.ui.showWork("",0,!1),u()}else this.truck.speed>.4?(this.work=null,this.ui.showWork("",0,!1),this.ui.toast("\u041F\u043E\u0433\u0440\u0443\u0437\u043A\u0430 \u043F\u0440\u0435\u0440\u0432\u0430\u043D\u0430","bad")):this.ui.showWork(this.work?this.work.title:"",d)}this.accumulator+=t;let s=1/90,r=0;for(;this.accumulator>=s&&r<8;){let d=this.route.pointAt(this.truck.s),f=(this.route.pointAt(this.truck.s+2).y-d.y)/2,m=Wc(this.route,this.truck.s);this.truck.step(s,i,{curv:d.curv,grade:f,speedLimit:m}),this.accumulator-=s,r++}this.currentLimit=Wc(this.route,this.truck.s),this.updateTruckTransform(t),this.traffic.update(t,this.truck.s,this.truck.lat,this.truck.speed,e.night),this.checkCollisions(t),this.checkTriggers(t),this.checkCameras(),this.updateFatigue(t),this.updateCamera(t),this.audio.update({rpm:this.truck.rpm,throttle:this.truck.throttle,speed:this.truck.speed,rain:e.rain,engineOn:this.truck.engineOn,gear:this.truck.gear}),this.truckView.setNight(e.night,this.lightsOn||e.night>.55),this.lightsOn!==this.lastLights&&this.truck&&(this.lastLights=this.lightsOn),this.truck.fuel/this.truck.fuelCapacity<.14&&!this.lowFuelWarned&&(this.lowFuelWarned=!0,this.ui.toast("\u041C\u0430\u043B\u043E \u0442\u043E\u043F\u043B\u0438\u0432\u0430 \u2014 \u0437\u0430\u043F\u0440\u0430\u0432\u044C\u0442\u0435\u0441\u044C \u043D\u0430 \u0410\u0417\u0421 (E)","bad",4200)),this.truck.fuel/this.truck.fuelCapacity>.25&&(this.lowFuelWarned=!1),this.truck.fuel<=.05&&!this.fuelHelpShown&&Math.abs(this.truck.speed)<.6&&(this.fuelHelpShown=!0,this.offerFuelHelp()),this.truck.fuel>1&&(this.fuelHelpShown=!1);let a=Math.abs(this.truck.speed)*t;this.drivingDistance+=a,this.profile.stats.distance+=a/1e3,e.night>.5&&(this.nightDistance+=a),this.profile.stats.topSpeed=Math.max(this.profile.stats.topSpeed||0,this.truck.speed*3.6);let o=Xe("ind-left"),l=Xe("ind-right"),c=this.indicator&&Math.floor(this.blinkPhase/.31)%2===0;o&&(o.className="ind"+(c&&this.indicator<0?" on-left":"")),l&&(l.className="ind"+(c&&this.indicator>0?" on-right":""));let h=Xe("windshield");if(h){let d=this.cameraMode==="interior"||this.cameraMode==="hood",u=e.rain||0;h.className="windshield"+(d&&u>.55?" heavy":d&&u>.08?" wet":"")}this.lastHudUpdate+=t,this.lastHudUpdate>.1&&(this.lastHudUpdate=0,this.updateHud(e)),this.lastSave+=t,this.lastSave>t_&&(this.lastSave=0,this.syncProfileFromTruck(),this.saveNow(!0))}updateHud(t){this.ui.updateHud({speedKmh:Math.abs(this.truck.speed)*3.6,rpm:this.truck.rpm,gear:this.truck.gear,fuel:this.truck.fuel,fuelPct:this.truck.fuel/this.truck.fuelCapacity,temp:this.truck.temp,condition:Math.min(this.truck.engine,this.truck.tires*1.15,100),fatigue:this.profile.fatigue||0,speedLimit:this.currentLimit||80,cruise:this.truck.cruise,autoGearbox:this.truck.autoGearbox,weatherName:t.weatherName,airTemp:this.airTemp(),fps:this.fps})}updateTruckTransform(t){let e=this.route.pointAt(this.truck.s),i=this.route.worldPos(this.truck.s,this.truck.lat),s=this.truck.pitch,r=this.truck.roll+(this.truck.slip?Math.sin(performance.now()*.02)*.01*this.truck.slip:0);this.truckView.setPosition(i.x,i.y,i.z,e.hdg+this.truck.yawRel,s,r),this.truckView.setTrailerAngle(this.truck.trailerYawOffset),this.truckView.update({speedKmh:Math.abs(this.truck.speed)*3.6,rpm:this.truck.rpm,gear:this.truck.gear,fuel:this.truck.fuel,temp:this.truck.temp,clock:this.clock.minutes},t,{steer:this.truck.steer/.5,brake:this.truck.brake,rain:this.sky.weather.rain,trailerType:this.job?.trailer||"curtain",company:this.job?.company||"Auriga Logistics"}),this.truckView.drawNav({title:this.phase==="pickup"?"\u0417\u0410\u0411\u0420\u0410\u0422\u042C \u0413\u0420\u0423\u0417":"\u0414\u041E\u0421\u0422\u0410\u0412\u041A\u0410",distance:this.fmtDistanceShort(Math.abs(this.remainingMeters())),eta:"ETA "+Bi(this.clock.minutes+this.etaMinutes())}),this.truckPos.set(i.x,i.y,i.z)}fmtDistanceShort(t){return t>=1e3?(t/1e3).toFixed(1).replace(".",",")+" \u043A\u043C":Math.round(t)+" \u043C"}updateCamera(t,e=!1){if(!this.truck)return;let i=this.cameraMode,s=this.truckView.root,r=this.cameraShake>0?this.cameraShake*.06*Math.sin(performance.now()*.05):0;this.cameraShake=Math.max(0,this.cameraShake-t*3);let a=Math.abs(this.truck.speed);if(i==="interior"||i==="hood"){this.truckView.setInteriorVisible(i==="interior"),s.updateMatrixWorld(!0);let l=i==="interior"?new D(-.5,2.45,1.45):new D(0,3.35,3.5);this.tmpVec.copy(l),s.localToWorld(this.tmpVec),this.camera.position.copy(this.tmpVec);let c=new Ei((i==="interior"?-.05:-.03)+s.rotation.x,s.rotation.y+Math.PI+(i==="interior"?this.truck.steer*.4:0),s.rotation.z*.6+r,"YXZ");this.camera.quaternion.setFromEuler(c),this.camera.fov=i==="interior"?64:68}else{this.truckView.setInteriorVisible(!1);let l=i==="far"?34:23,c=i==="far"?13:6.6,h=Math.sin(s.rotation.y),d=Math.cos(s.rotation.y),u=this.camTarget.set(this.truckPos.x-h*l,this.truckPos.y+c,this.truckPos.z-d*l),f=this.camLookAt.set(this.truckPos.x+h*12,this.truckPos.y+1.9,this.truckPos.z+d*12),m=e?1:Et(t*4.5,.05,1);this.camera.position.lerp(u,m),this.camLook.lerp(f,m),this.camera.lookAt(this.camLook),this.camera.fov=i==="far"?58:66,this.camera.rotateZ(r*.35)}let o=this.camera.fov+Et(a*.35,0,10);this.camera.fov=ke(this.camera.fov,o,.08),this.camera.updateProjectionMatrix()}updateIndicators(t){this.truck&&(this.indicatorTimer=(this.indicatorTimer||0)+t,this.indicator&&this.indicatorTimer>18&&(this.indicator=0),this.blinkPhase=(this.blinkPhase||0)+t,this.indicator&&this.blinkPhase>.62&&(this.blinkPhase=0,this.audio.indicator()),this.indicator&&this.truck.speed>6&&this.indicatorTimer>6&&Math.abs(this.truck.steer)<.02&&(this.indicator=0))}cycleCamera(){let t=Lr.indexOf(this.cameraMode);this.cameraMode=Lr[(t+1)%Lr.length],this.cameraMode=this.cameraMode,this.cameraMode!=="interior"&&this.cameraMode!=="hood"&&this.camLook.set(this.truckPos.x,this.truckPos.y+1.8,this.truckPos.z),this.ui.toast("\u041A\u0430\u043C\u0435\u0440\u0430: "+{interior:"\u0438\u0437 \u043A\u0430\u0431\u0438\u043D\u044B",hood:"\u0441 \u043A\u0430\u043F\u043E\u0442\u0430",chase:"\u0441\u0437\u0430\u0434\u0438",far:"\u0441\u0432\u0435\u0440\u0445\u0443 \u0441\u0437\u0430\u0434\u0438"}[this.cameraMode],"info",1400)}toggleCruise(){this.truck&&(this.truck.cruise!=null?(this.truck.cruise=null,this.ui.toast("\u041A\u0440\u0443\u0438\u0437-\u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044C \u0432\u044B\u043A\u043B\u044E\u0447\u0435\u043D","info",1600)):this.truck.speed>5?(this.truck.cruise=Math.round(Math.abs(this.truck.speed)*3.6),this.ui.toast("\u041A\u0440\u0443\u0438\u0437-\u043A\u043E\u043D\u0442\u0440\u043E\u043B\u044C: "+this.truck.cruise+" \u043A\u043C/\u0447","good",1800)):this.ui.toast("\u0414\u043B\u044F \u043A\u0440\u0443\u0438\u0437\u0430 \u043D\u0443\u0436\u043D\u0430 \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C \u0432\u044B\u0448\u0435 20 \u043A\u043C/\u0447","info"))}toggleGearbox(){this.truck&&(this.truck.autoGearbox=!this.truck.autoGearbox,this.ui.toast(this.truck.autoGearbox?"\u041A\u043E\u0440\u043E\u0431\u043A\u0430: \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0440\u0435\u0436\u0438\u043C":"\u041A\u043E\u0440\u043E\u0431\u043A\u0430: \u0440\u0443\u0447\u043D\u043E\u0439 \u0440\u0435\u0436\u0438\u043C (Shift/Ctrl)","info",2200))}toggleLights(){this.lightsOn=!this.lightsOn,this.truckView.setNight(this.night||0,this.lightsOn),this.ui.toast(this.lightsOn?"\u0424\u0430\u0440\u044B \u0432\u043A\u043B\u044E\u0447\u0435\u043D\u044B":"\u0424\u0430\u0440\u044B \u0432\u044B\u043A\u043B\u044E\u0447\u0435\u043D\u044B","info",1400)}checkCollisions(t){this.collisionCooldown>0&&(this.collisionCooldown-=t);let e=this.traffic.collide(this.truck.s,this.truck.lat);if(e&&this.collisionCooldown<=0&&Math.abs(this.truck.speed)>.5){let i=Math.abs(this.truck.speed-e.speed),s=Et(4+i*.8,4,26);this.truck.engine=Math.max(0,this.truck.engine-s*.5),this.truck.brakes=Math.max(0,this.truck.brakes-s*.2),this.profile.stats.collisions++,this.collisionCooldown=1.6,this.cameraShake=1.2,this.truck.speed=Math.min(this.truck.speed,e.speed*.55),this.truck.cruise=null,this.ui.flashDamage(),this.ui.toast("\u0421\u0442\u043E\u043B\u043A\u043D\u043E\u0432\u0435\u043D\u0438\u0435 \u0441 "+(e.type==="truck"?"\u0433\u0440\u0443\u0437\u043E\u0432\u0438\u043A\u043E\u043C":e.type==="bus"?"\u0430\u0432\u0442\u043E\u0431\u0443\u0441\u043E\u043C":"\u0430\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u0435\u043C"),"bad"),this.audio.alarm(),this.damageCargo(s),e.s+=6}(this.truck.lat>4.95||this.truck.lat<-4)&&(this.cameraShake<.1&&(this.cameraShake=.35,this.audio.blip(90,.2,"sawtooth",.06)),this.truck.lat=Et(this.truck.lat,-4,4.95),this.truck.speed*=1-t*.8,this.truck.engine=Math.max(0,this.truck.engine-t*.6))}damageCargo(t){this.phase==="delivery"&&(this.cargoDamage=Et((this.cargoDamage||0)+t*.7,0,100))}checkCameras(){let t=this.currentLimit||80,e=Math.abs(this.truck.speed)*3.6;if(!(e<t+11)){for(let i of this.route.zones){let s="zone"+i.from;!this.camerasHit.has(s)&&this.truck.s>i.from&&this.truck.s<i.from+30&&(this.camerasHit.add(s),this.fine(Math.round(90+(e-t)*9),"\u041F\u0440\u0435\u0432\u044B\u0448\u0435\u043D\u0438\u0435 \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u0438"))}for(let i of this.route.works){let s="work"+i.from;!this.camerasHit.has(s)&&this.truck.s>i.from&&this.truck.s<i.from+25&&(this.camerasHit.add(s),this.fine(150,"\u0421\u043A\u043E\u0440\u043E\u0441\u0442\u044C \u0432 \u0437\u043E\u043D\u0435 \u0440\u0430\u0431\u043E\u0442"))}}}fine(t,e){let i=Math.min(t,Math.max(0,this.profile.money));this.profile.money-=i,this.profile.stats.fines+=i,this.fines+=i,this.ui.toast(`${e}: \u0448\u0442\u0440\u0430\u0444 ${se(i)}`,"bad",4200),this.audio.alarm()}checkTriggers(t){this.interaction=null,this.parkedAtDepot=null;let e=Math.abs(this.truck.speed)*3.6,i=this.truck.s;if(!this.work){if(this.phase==="pickup"||this.phase==="delivery"||this.phase==="free"){let s=Math.abs(i-this.targetS());s<34?e<3?(this.parkedAtDepot={act:"interact",label:this.phase==="pickup"?"E \u2014 \u043D\u0430\u0447\u0430\u0442\u044C \u043F\u043E\u0433\u0440\u0443\u0437\u043A\u0443":this.phase==="free"?"E \u2014 \u0437\u0430\u0432\u0435\u0440\u0448\u0438\u0442\u044C \u043F\u043E\u0435\u0437\u0434\u043A\u0443":"E \u2014 \u0432\u044B\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0433\u0440\u0443\u0437"},this.interaction={hint:this.phase==="pickup"?"\u0412\u044B \u043D\u0430 \u043C\u0435\u0441\u0442\u0435 \u043F\u043E\u0433\u0440\u0443\u0437\u043A\u0438. \u041D\u0430\u0436\u043C\u0438\u0442\u0435 E":"\u0412\u044B \u043D\u0430 \u043C\u0435\u0441\u0442\u0435 \u0432\u044B\u0433\u0440\u0443\u0437\u043A\u0438. \u041D\u0430\u0436\u043C\u0438\u0442\u0435 E"}):this.interaction={hint:"\u041E\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u0435\u0441\u044C, \u0447\u0442\u043E\u0431\u044B \u043F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u044C"}:s<400?this.interaction={hint:`\u0414\u043E \u0446\u0435\u043B\u0438 ${Math.round(s)} \u043C`}:i>this.targetS()+40&&(this.interaction={hint:"\u041F\u0443\u043D\u043A\u0442 \u043F\u043E\u0437\u0430\u0434\u0438: \u0432\u043A\u043B\u044E\u0447\u0438\u0442\u0435 \u0437\u0430\u0434\u043D\u0438\u0439 \u0445\u043E\u0434 (R)"},this.tipsShown.has("overshoot")||(this.tipsShown.add("overshoot"),this.ui.toast("\u0412\u044B \u043F\u0440\u043E\u0435\u0445\u0430\u043B\u0438 \u043F\u0443\u043D\u043A\u0442. \u0417\u0430\u0434\u043D\u0438\u0439 \u0445\u043E\u0434 \u2014 \u043A\u043B\u0430\u0432\u0438\u0448\u0430 R","info",4200)))}for(let s of this.route.stations)if(!(s.side<0)&&Math.abs(s.s-i)<26&&e<2.5&&!this.parkedAtDepot){this.parkedAtDepot={act:"interact",label:`E \u2014 \u0437\u0430\u043F\u0440\u0430\u0432\u043A\u0430 (${s.brand})`},this.interaction={hint:"\u0417\u0430\u043F\u0440\u0430\u0432\u043A\u0430: \u043E\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u0435\u0441\u044C \u0438 \u043D\u0430\u0436\u043C\u0438\u0442\u0435 E"};break}for(let s of this.route.rests)if(!(s.side<0)&&Math.abs(s.s-i)<26&&e<2.5&&!this.parkedAtDepot){this.parkedAtDepot={act:"interact",label:"E \u2014 \u0437\u043E\u043D\u0430 \u043E\u0442\u0434\u044B\u0445\u0430"},this.interaction={hint:"\u0417\u043E\u043D\u0430 \u043E\u0442\u0434\u044B\u0445\u0430"};break}}}interact(){if(this.work)return;if(!this.parkedAtDepot){if(this.phase==="delivery"&&Math.abs(this.truck.s-this.deliveryS)<60)return;this.ui.toast("\u0417\u0434\u0435\u0441\u044C \u043D\u0435\u0447\u0435\u0433\u043E \u0434\u0435\u043B\u0430\u0442\u044C. \u041F\u043E\u0434\u044A\u0435\u0434\u044C\u0442\u0435 \u043A \u0446\u0435\u043B\u0438 \u0438 \u043E\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u0435\u0441\u044C","info",2200);return}let e=this.truck.s;if(this.phase==="pickup"&&Math.abs(e-this.pickupS)<34){this.startWork("\u041F\u043E\u0433\u0440\u0443\u0437\u043A\u0430 \u0433\u0440\u0443\u0437\u0430",7,()=>this.finishPickup());return}if((this.phase==="delivery"||this.phase==="free")&&Math.abs(e-this.deliveryS)<34){this.startWork(this.phase==="free"?"\u0417\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u0438\u0435 \u043F\u043E\u0435\u0437\u0434\u043A\u0438":"\u0412\u044B\u0433\u0440\u0443\u0437\u043A\u0430 \u0433\u0440\u0443\u0437\u0430",4,()=>this.finishDelivery());return}for(let i of this.route.stations)if(i.side>0&&Math.abs(i.s-e)<26){let s=hi[this.route.pointAt(i.s).country]?.fuel*i.priceMod||1.75;this.openFuel(s);return}for(let i of this.route.rests)if(i.side>0&&Math.abs(i.s-e)<26){this.ui.confirmRest();return}}startWork(t,e,i){this.work={title:t,duration:e,elapsed:0,onDone:i},this.truck.handbrake=!0,this.truck.throttle=0,this.audio.blip(420,.12,"triangle",.05),this.ui.toast(t+"\u2026","info",2e3)}finishPickup(){if(this.job.free){this.phase="free",this.startS=this.pickupS,this.ui.toast("\u0421\u0432\u043E\u0431\u043E\u0434\u043D\u0430\u044F \u043F\u043E\u0435\u0437\u0434\u043A\u0430 \u043D\u0430\u0447\u0430\u043B\u0430\u0441\u044C","good");return}this.phase="delivery",this.phaseStartS=this.truck.s;let t=this.job.mass||10;this.truck.cargoMass=t,this.cargoDamage=0,this.truck.handbrake=!1,this.truck.inertia=0,this.audio.cash(),this.ui.toast(`\u0413\u0440\u0443\u0437 \xAB${this.job.cargo}\xBB (${this.job.mass} \u0442) \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D. \u0412 \u043F\u0443\u0442\u044C!`,"good",4200),this.job.loadedAt=this.currentMinutes()}finishDelivery(){if(this.job.free||this.phase==="free"){this.job=null,this.profile.activeJob=null,this.state="garage",this.enterGarage(),this.ui.toast("\u0412\u044B \u0434\u043E\u0435\u0445\u0430\u043B\u0438. \u0421\u0432\u043E\u0431\u043E\u0434\u043D\u0430\u044F \u043F\u043E\u0435\u0437\u0434\u043A\u0430 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u0430","good");return}let t=this.job,e=Math.max(0,this.jobElapsed()-t.deadlineMin),i=Et(this.cargoDamage||0,0,100),s=Md(t,i,e,0),r=bd(t,i,e),a=this.profile.money;this.profile.money+=s.total,this.profile.xp+=r,this.profile.stats.deliveries++,this.profile.stats.earnings+=s.total,e>0&&this.profile.stats.late++,this.profile.currentCity=t.to,this.profile.activeJob=null,this.profile.truck.fuel=this.truck.fuel,this.profile.truck.odometer=this.truck.odometer;let o=gi(this.profile.xp-r).level,l=gi(this.profile.xp).level;this.audio.cash(),this.checkAchievements({damage:i,late:e,job:t}),this.saveNow(),this.disposeWorld(),this.enterGarage("jobs"),this.ui.deliveryResult({job:t,pay:s.total,notes:s.notes,xp:r,stats:{distance:t.distance},levelUp:l>o?l:null})}updateFatigue(t){if(!this.profile)return;this.profile.fatigue||(this.profile.fatigue=0);let e=Math.abs(this.truck.speed)>1;this.profile.fatigue=Et(this.profile.fatigue+(e?t*(100/2700):t*.004),0,100),this.profile.fatigue>72&&!this.tipsShown.has("fatigue")&&(this.tipsShown.add("fatigue"),this.ui.toast("\u0412\u044B \u0443\u0441\u0442\u0430\u043B\u0438. \u041D\u0430\u0439\u0434\u0438\u0442\u0435 \u0437\u043E\u043D\u0443 \u043E\u0442\u0434\u044B\u0445\u0430 (E)","bad",4600)),this.profile.fatigue>96&&!this.tipsShown.has("fatigue2")&&(this.tipsShown.add("fatigue2"),this.ui.toast("\u0421\u0440\u043E\u0447\u043D\u043E \u043D\u0443\u0436\u0435\u043D \u043E\u0442\u0434\u044B\u0445! \u0412\u043D\u0438\u043C\u0430\u043D\u0438\u0435 \u0441\u043D\u0438\u0436\u0435\u043D\u043E","bad",5e3))}refuelDialog(){let t=Te.find(r=>r.id===this.profile.truck.modelId)||Te[0],e=oe.get(this.profile.currentCity),i=(hi[e?.country]?.fuel||1.7)*1.02,s=this.profile.truck.fuel;this.fuelPrice=i,this.ui.fuelDialog(i,s,t.tank,this.profile.money)}openFuel(t){this.paused=!0,this.fuelPause=!0,this.ui.fuelDialog(t,this.truck.fuel,this.truck.fuelCapacity,this.profile.money),this.fuelContext="road",this.fuelPrice=t}refuel(t){let e=this.fuelPrice||this.gameFuelPrice||1.75,i=Math.min(this.profile.money,t*e),s=Math.min(t,i/e);if(this.profile.money-=i,this.profile.stats.fuelSpent=(this.profile.stats.fuelSpent||0)+i,this.truck)this.truck.fuel=Math.min(this.truck.fuelCapacity,this.truck.fuel+s),this.profile.truck.fuel=this.truck.fuel;else{let r=Te.find(a=>a.id===this.profile.truck.modelId)||Te[0];this.profile.truck.fuel=Math.min(r.tank,this.profile.truck.fuel+s)}this.audio.cash(),this.ui.toast(`\u0417\u0430\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u043E ${Math.round(s)} \u043B \u0437\u0430 ${se(i)}`,"good"),this.paused=!1,this.fuelPause=!1,this.ui.renderGarage(),this.saveNow()}repairDialog(){let t=this.profile.truck.condition,e=Math.round((100-t.engine)*42+(100-t.tires)*26+(100-t.brakes)*18);this.ui.confirmRepair(Math.max(0,e),"\u0414\u0432\u0438\u0433\u0430\u0442\u0435\u043B\u044C, \u0448\u0438\u043D\u044B \u0438 \u0442\u043E\u0440\u043C\u043E\u0437\u0430 \u0431\u0443\u0434\u0443\u0442 \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u044B \u0434\u043E 100%.")}repair(){let t=this.profile.truck.condition,e=Math.round((100-t.engine)*42+(100-t.tires)*26+(100-t.brakes)*18);if(this.profile.money<e){this.ui.toast("\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0434\u0435\u043D\u0435\u0433 \u043D\u0430 \u0440\u0435\u043C\u043E\u043D\u0442","bad");return}this.profile.money-=e,t.engine=100,t.tires=100,t.brakes=100,this.truck&&(this.truck.engine=100,this.truck.tires=100,this.truck.brakes=100),this.audio.cash(),this.ui.toast("\u0420\u0435\u043C\u043E\u043D\u0442 \u0432\u044B\u043F\u043E\u043B\u043D\u0435\u043D","good"),this.ui.renderGarage(),this.saveNow()}fullService(){this.repairDialog()}restDialog(){this.ui.confirmRest()}rest(){if(this.profile.money<45){this.ui.toast("\u041D\u0435 \u0445\u0432\u0430\u0442\u0430\u0435\u0442 45 \u20AC \u043D\u0430 \u0441\u0442\u043E\u044F\u043D\u043A\u0443","bad");return}for(this.profile.money-=45,this.profile.fatigue=0,this.clock.minutes+=540;this.clock.minutes>=1440;)this.clock.minutes-=1440,this.clock.day++;this.setWeather(this.pickWeather(),!0),this.truck&&(this.truck.handbrake=!0,this.truck.speed=0,this.truck.engineOn=!1),this.paused=!1,this.ui.toast("\u0412\u044B \u043E\u0442\u0434\u043E\u0445\u043D\u0443\u043B\u0438 9 \u0447\u0430\u0441\u043E\u0432","good"),this.saveNow(),this.ui.renderGarage()}buyTruckDialog(t){let e=Te.find(s=>s.id===this.profile.truck.modelId)||Te[0],i=Math.round(e.price*.52);this.ui.confirmBuyTruck(t,i)}buyTruck(t){let e=Te.find(a=>a.id===t);if(!e)return;if(this.profile.level<e.level){this.ui.toast(`\u041D\u0443\u0436\u0435\u043D ${e.level}-\u0439 \u0443\u0440\u043E\u0432\u0435\u043D\u044C`,"bad");return}let i=Te.find(a=>a.id===this.profile.truck.modelId)||Te[0],s=Math.round(i.price*.52),r=Math.max(0,e.price-s);if(this.profile.money<r){this.ui.toast("\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0434\u0435\u043D\u0435\u0433","bad");return}this.profile.money-=r,this.profile.owned=this.profile.owned||[],this.profile.owned.push({...this.profile.truck}),this.profile.truck={modelId:e.id,paint:this.profile.truck.paint,engine:0,tires:0,retarder:e.hp>500?1:0,condition:{engine:100,tires:100,brakes:100},odometer:0,fuel:e.tank},this.profile.stats.deliveries=this.profile.stats.deliveries,this.audio.cash(),this.ui.toast("\u041A\u0443\u043F\u043B\u0435\u043D "+e.name,"good",4200),this.checkAchievements({purchased:!0}),this.ui.closeModal(),this.ui.renderGarage(),this.saveNow()}sellTruckDialog(){if(!(this.profile.owned||[]).length){this.ui.openModal({eyebrow:"\u0413\u0410\u0420\u0410\u0416",title:"\u041F\u0440\u043E\u0434\u0430\u0436\u0430 \u0442\u044F\u0433\u0430\u0447\u0430",body:"<p>\u041D\u0435\u043B\u044C\u0437\u044F \u043F\u0440\u043E\u0434\u0430\u0442\u044C \u0435\u0434\u0438\u043D\u0441\u0442\u0432\u0435\u043D\u043D\u044B\u0439 \u0442\u044F\u0433\u0430\u0447 \u2014 \u043E\u043D \u043D\u0443\u0436\u0435\u043D \u0434\u043B\u044F \u0440\u0430\u0431\u043E\u0442\u044B. \u041A\u0443\u043F\u0438\u0442\u0435 \u0432\u0442\u043E\u0440\u043E\u0439 \u0432 \u0430\u0432\u0442\u043E\u0441\u0430\u043B\u043E\u043D\u0435, \u0447\u0442\u043E\u0431\u044B \u043E\u0441\u0432\u043E\u0431\u043E\u0434\u0438\u0442\u044C \u044D\u0442\u043E\u0442.</p>",actions:[{label:"\u041F\u043E\u043D\u044F\u0442\u043D\u043E",primary:!0,act:"close"}]});return}let e=Te.find(r=>r.id===this.profile.truck.modelId)||Te[0],i=Math.round(e.price*.52);this.ui.openModal({eyebrow:"\u0413\u0410\u0420\u0410\u0416",title:"\u041F\u0440\u043E\u0434\u0430\u0442\u044C "+e.name,body:`<p>\u0412\u044B \u043F\u0440\u043E\u0434\u0430\u0434\u0438\u0442\u0435 \u0442\u0435\u043A\u0443\u0449\u0438\u0439 \u0442\u044F\u0433\u0430\u0447 \u0438 \u043F\u0435\u0440\u0435\u0441\u044F\u0434\u0435\u0442\u0435 \u043D\u0430 \u043F\u0440\u0435\u0434\u044B\u0434\u0443\u0449\u0438\u0439 \u0438\u0437 \u0433\u0430\u0440\u0430\u0436\u0430.</p>
        <div class="field-row"><label>\u0412\u044B\u0440\u0443\u0447\u043A\u0430</label><b style="color:var(--green)">${se(i)}</b></div>`,actions:[{label:"\u041E\u0442\u043C\u0435\u043D\u0430",act:"close"},{label:"\u041F\u0440\u043E\u0434\u0430\u0442\u044C",primary:!0,act:"sell-confirm"}]});let s=Xe("modal-foot").querySelector('[data-act="sell-confirm"]');s&&s.addEventListener("click",()=>{this.profile.money+=i,this.profile.truck=this.profile.owned.pop(),this.ui.closeModal(),this.ui.renderGarage(),this.saveNow(),this.ui.toast("\u0422\u044F\u0433\u0430\u0447 \u043F\u0440\u043E\u0434\u0430\u043D","good")})}setPaint(t){this.profile.truck.paint=t;let e=xn.find(i=>i.id===t);e&&this.truckView.setPaint(e.hex),this.ui.renderGarage(),this.saveNow()}buyUpgrade(t,e){let i=_n[t];if(!i)return;let s=i[e];if(s&&!(this.profile.truck[t]>=e)){if(this.profile.money<s.price){this.ui.toast("\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0434\u0435\u043D\u0435\u0433","bad");return}this.profile.money-=s.price,this.profile.truck[t]=e,this.audio.cash(),this.ui.toast("\u0423\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u043E: "+s.name,"good"),this.ui.renderGarage(),this.saveNow()}}selectTruck(t){}takeOwnedTruck(t){let e=this.profile.owned||[],i=e[t];i&&(e[t]=this.profile.truck,this.profile.truck=i,this.ui.renderGarage(),this.saveNow(),this.ui.toast("\u0412\u044B \u043F\u0435\u0440\u0435\u0441\u0435\u043B\u0438 \u043D\u0430 \u0434\u0440\u0443\u0433\u043E\u0439 \u0442\u044F\u0433\u0430\u0447","good"))}buyGarage(t){let e=oe.get(t),i=24e3+(e?.size||1)*12e3;if(this.profile.money<i){this.ui.toast("\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0434\u0435\u043D\u0435\u0433","bad");return}this.profile.money-=i,this.profile.garages.push(t),this.checkAchievements({garage:!0}),this.audio.cash(),this.ui.toast("\u0413\u0430\u0440\u0430\u0436 \u043A\u0443\u043F\u043B\u0435\u043D \u0432 "+e.name,"good"),this.ui.renderGarage(),this.saveNow()}hireDriverDialog(){if(this.profile.money<12e3){this.ui.toast("\u041D\u0443\u0436\u043D\u043E 12 000 \u20AC","bad");return}if(!this.profile.garages.length){this.ui.toast("\u0421\u043D\u0430\u0447\u0430\u043B\u0430 \u043A\u0443\u043F\u0438\u0442\u0435 \u0433\u0430\u0440\u0430\u0436","info");return}let e=["\u0410\u043B\u0435\u043A\u0441\u0435\u0439","\u041C\u0430\u0440\u0435\u043A","\u041B\u0443\u043A\u0430\u0441","\u041F\u0435\u0442\u0435\u0440","\u0418\u0440\u0436\u0438","\u041C\u0430\u0442\u0435\u043E","\u041E\u043B\u0435","\u042E\u0440\u0433\u0435\u043D","\u0422\u043E\u043C\u0430\u0448","\u0410\u043D\u0440\u0438","\u0414\u0438\u0442\u0435\u0440","\u0421\u0432\u0435\u043D","\u041C\u0430\u0440\u043A\u043E","\u041F\u0430\u0432\u0435\u043B","\u041D\u0438\u043B\u044C\u0441"],i=e[Math.floor(Math.random()*e.length)]+" "+String.fromCharCode(65+Math.floor(Math.random()*26))+".";this.profile.money-=12e3,this.profile.drivers.push({id:"d"+Date.now().toString(36),name:i,city:this.profile.garages[Math.floor(Math.random()*this.profile.garages.length)],rate:220+Math.round(Math.random()*180),exp:Math.floor(Math.random()*30),earned:0,hired:this.currentMinutes()}),this.checkAchievements({driver:!0}),this.audio.cash(),this.ui.toast("\u041D\u0430\u043D\u044F\u0442 \u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044C: "+i,"good"),this.ui.renderGarage(),this.saveNow()}fireDriver(t){this.profile.drivers=this.profile.drivers.filter(e=>e.id!==t),this.ui.renderGarage(),this.saveNow()}buySkill(t){let e=zo.find(r=>r.id===t);if(!e)return;let i=this.profile.skills[t]||0,s=Xo(this.profile,t);if(!(i>=5)){if(this.profile.money<s){this.ui.toast("\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0434\u0435\u043D\u0435\u0433","bad");return}this.profile.money-=s,this.profile.skills[t]=i+1,this.audio.cash(),this.ui.toast(`${e.name}: \u0443\u0440\u043E\u0432\u0435\u043D\u044C ${i+1}`,"good"),this.refreshOffers(!0),this.ui.renderGarage(),this.saveNow()}}setSetting(t,e){if(this.settings[t]=e,Oc(this.settings),t==="sound"&&this.audio.setEnabled(!!e),t==="volume"&&this.audio.setVolume(Number(e)),t==="quality"&&this.renderer){let i=e==="low"?.8:e==="medium"?1.1:Math.min(window.devicePixelRatio||1,1.75);this.renderer.setPixelRatio(i)}t==="camera"&&(this.cameraMode=Lr.includes(e)?e:"interior"),this.ui.renderGarage()}resetSettings(){this.settings={...Vo},this.cameraMode="interior",Oc(this.settings),this.audio.setEnabled(this.settings.sound),this.audio.setVolume(this.settings.volume),this.ui.renderGarage(),this.ui.toast("\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0441\u0431\u0440\u043E\u0448\u0435\u043D\u044B","info")}resetDialog(){this.ui.openModal({eyebrow:"\u041E\u041F\u0410\u0421\u041D\u041E",title:"\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u043A\u0430\u0440\u044C\u0435\u0440\u0443?",body:"<p>\u0412\u0435\u0441\u044C \u043F\u0440\u043E\u0433\u0440\u0435\u0441\u0441 \u0432 \u0442\u0435\u043A\u0443\u0449\u0435\u043C \u0441\u043B\u043E\u0442\u0435 \u0431\u0443\u0434\u0435\u0442 \u0443\u0434\u0430\u043B\u0451\u043D \u0431\u0435\u0437\u0432\u043E\u0437\u0432\u0440\u0430\u0442\u043D\u043E: \u0434\u0435\u043D\u044C\u0433\u0438, \u0433\u0440\u0443\u0437\u043E\u0432\u0438\u043A\u0438, \u0432\u043E\u0434\u0438\u0442\u0435\u043B\u0438 \u0438 \u0434\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u044F.</p>",actions:[{label:"\u041E\u0442\u043C\u0435\u043D\u0430",act:"close"},{label:"\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u043D\u0430\u0432\u0441\u0435\u0433\u0434\u0430",danger:!0,act:"reset-confirm"}]});let t=Xe("modal-foot").querySelector('[data-act="reset-confirm"]');t&&t.addEventListener("click",()=>{this.saves.slots[this.slot]=null,Wo(this.saves.slots,this.saves.lastSlot),this.profile=null,this.ui.closeModal(),this.returnToMenu(),this.ui.toast("\u041A\u0430\u0440\u044C\u0435\u0440\u0430 \u0443\u0434\u0430\u043B\u0435\u043D\u0430","info")})}togglePause(){if(this.state==="driving"){if(this.paused=!this.paused,this.paused){this.ui.openModal({eyebrow:"\u041F\u0410\u0423\u0417\u0410",title:this.job?`${this.job.fromName} \u2192 ${this.job.toName}`:"\u041F\u0430\u0443\u0437\u0430",body:`<p>${this.job?`${this.job.cargo} \xB7 ${this.job.mass} \u0442 \xB7 \u043E\u0441\u0442\u0430\u043B\u043E\u0441\u044C ${this.fmtDistanceShort(Math.abs(this.remainingMeters()))}`:""}</p>
          <div class="field-row"><label>\u0418\u0433\u0440\u043E\u0432\u043E\u0435 \u0432\u0440\u0435\u043C\u044F</label><b>${Bi(this.clock.minutes)} \xB7 \u0434\u0435\u043D\u044C ${this.clock.day}</b></div>
          <div class="field-row"><label>\u0414\u043E \u0441\u0440\u043E\u043A\u0430</label><b>${this.job?Go(Math.max(0,this.job.deadlineMin-this.jobElapsed())):"\u2014"}</b></div>
          <div class="field-row"><label>\u0417\u0430\u0440\u0430\u0431\u043E\u0442\u0430\u043D\u043E \u0437\u0430 \u0440\u0435\u0439\u0441</label><b>${this.job?se(this.job.pay):"\u2014"}</b></div>
          <h4>\u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435</h4>
          <p style="font-size:12px;line-height:1.8">W/S \u2014 \u0433\u0430\u0437 \u0438 \u0442\u043E\u0440\u043C\u043E\u0437 \xB7 A/D \u2014 \u0440\u0443\u043B\u044C \xB7 E \u2014 \u0432\u0437\u0430\u0438\u043C\u043E\u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435 \xB7 C \u2014 \u043A\u0440\u0443\u0438\u0437 \xB7 M \u2014 \u0440\u0435\u0436\u0438\u043C \u041A\u041F\u041F \xB7 V \u2014 \u043A\u0430\u043C\u0435\u0440\u0430 \xB7 L \u2014 \u0444\u0430\u0440\u044B \xB7 H \u2014 \u0441\u0438\u0433\u043D\u0430\u043B \xB7 P \u2014 \u0441\u043D\u0438\u043C\u043E\u043A \xB7 F \u2014 \u0434\u0432\u0438\u0433\u0430\u0442\u0435\u043B\u044C</p>`,actions:[{label:"\u041F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u044C",primary:!0,act:"resume"},{label:"\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C",act:"save"},{label:"\u041F\u043E\u043A\u0438\u043D\u0443\u0442\u044C \u0440\u0435\u0439\u0441",danger:!0,act:"quit-to-garage"}]});let t=Xe("modal-foot");t.querySelector('[data-act="resume"]')?.addEventListener("click",()=>{this.paused=!1,this.ui.closeModal()}),t.querySelector('[data-act="save"]')?.addEventListener("click",()=>{this.syncProfileFromTruck(),this.saveNow(),this.ui.toast("\u0421\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u043E","good")}),t.querySelector('[data-act="quit-to-garage"]')?.addEventListener("click",()=>{this.syncProfileFromTruck(),this.saveNow(),this.paused=!1,this.ui.closeModal(),this.disposeWorld(),this.enterGarage()})}else this.ui.closeModal();this.syncProfileFromTruck(),this.saveNow(!0)}}offerFuelHelp(){this.paused=!0,this.fuelPause=!0,this.ui.openModal({eyebrow:"\u0422\u0415\u0425\u041F\u041E\u041C\u041E\u0429\u042C",title:"\u0422\u043E\u043F\u043B\u0438\u0432\u043E \u0437\u0430\u043A\u043E\u043D\u0447\u0438\u043B\u043E\u0441\u044C",body:`<p>\u0411\u0430\u043A \u043F\u0443\u0441\u0442. \u041C\u043E\u0436\u043D\u043E \u0432\u044B\u0437\u0432\u0430\u0442\u044C \u043F\u0435\u0440\u0435\u0434\u0432\u0438\u0436\u043D\u0443\u044E \u0437\u0430\u043F\u0440\u0430\u0432\u043A\u0443: 60 \u043B\u0438\u0442\u0440\u043E\u0432 \u0441 \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u043E\u0439.</p>
        <div class="field-row"><label>\u0421\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C</label><b>${se(320)}</b></div>
        <div class="field-row"><label>\u0412 \u043A\u043E\u0448\u0435\u043B\u044C\u043A\u0435</label><b>${se(this.profile.money)}</b></div>`,actions:[{label:"\u0416\u0434\u0430\u0442\u044C",act:"close"},{label:"\u0412\u044B\u0437\u0432\u0430\u0442\u044C \u0442\u0435\u0445\u043F\u043E\u043C\u043E\u0449\u044C",primary:!0,act:"fuel-help"}]});let t=Xe("modal-foot").querySelector('[data-act="fuel-help"]');t&&t.addEventListener("click",()=>{if(this.profile.money<320){this.ui.toast("\u041D\u0435\u0434\u043E\u0441\u0442\u0430\u0442\u043E\u0447\u043D\u043E \u0434\u0435\u043D\u0435\u0433","bad");return}this.profile.money-=320,this.truck.fuel=Math.min(this.truck.fuelCapacity,this.truck.fuel+60),this.truck.engineOn=!0,this.profile.truck.fuel=this.truck.fuel,this.paused=!1,this.fuelPause=!1,this.ui.closeModal(),this.ui.toast("\u0422\u0435\u0445\u043F\u043E\u043C\u043E\u0449\u044C \u043F\u0440\u0438\u0432\u0435\u0437\u043B\u0430 60 \u043B \u0442\u043E\u043F\u043B\u0438\u0432\u0430","good"),this.saveNow()})}onModalClosed(){this.fuelPause&&(this.fuelPause=!1,this.paused=!1)}takeScreenshot(){try{let t=this.renderer.domElement.toDataURL("image/png"),e=document.createElement("a");e.href=t,e.download=`eurotrak-${Date.now()}.png`,e.click(),this.ui.toast("\u0421\u043D\u0438\u043C\u043E\u043A \u0441\u043E\u0445\u0440\u0430\u043D\u0451\u043D","good")}catch{this.ui.toast("\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0441\u0434\u0435\u043B\u0430\u0442\u044C \u0441\u043D\u0438\u043C\u043E\u043A","bad")}}syncProfileFromTruck(){!this.truck||!this.profile||(this.profile.truck.fuel=this.truck.fuel,this.profile.truck.odometer=this.truck.odometer,this.profile.truck.condition={engine:this.truck.engine,tires:this.truck.tires,brakes:this.truck.brakes},this.profile.clock={day:this.clock.day,minutes:this.clock.minutes},this.job&&this.job.id&&this.job.free!==!0&&this.route&&(this.job.distance=Math.round(this.route.km*10)/10,this.job.playerS=this.truck.s,this.job.phase=this.phase,this.job.cargoDamage=this.cargoDamage||0,this.profile.activeJob={...this.job}))}saveNow(t=!1){if(!this.profile)return;this.profile.clock={day:this.clock.day,minutes:this.clock.minutes},this.profile.level=gi(this.profile.xp||0).level,this.profile.lastPlayed=Date.now(),this.saves.slots[this.slot]=JSON.parse(JSON.stringify(this.profile)),this.saves.lastSlot=this.slot;let e=Wo(this.saves.slots,this.saves.lastSlot);this.refreshSaveInfo(),!e&&!t&&this.ui.toast("\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0441\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C (localStorage \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D)","bad",4200)}checkAchievements(t={}){let e=this.profile;if(!e)return;let i=s=>{if(e.achievements.includes(s))return;e.achievements.push(s);let r=bs.find(a=>a.id===s);r&&this.ui.toast(`\u0414\u043E\u0441\u0442\u0438\u0436\u0435\u043D\u0438\u0435: ${r.icon} ${r.name}`,"good",5e3),this.audio.cash()};e.stats.deliveries>=1&&i("first"),e.stats.deliveries>=10&&i("ten"),e.stats.deliveries>=50&&i("fifty"),e.stats.distance>=1e3&&i("km1000"),e.stats.distance>=1e4&&i("km10000"),e.money>=1e5&&i("rich"),t.damage!==void 0&&t.damage<1&&t.job&&!t.job.free&&i("clean"),this.nightDistance>=5e4&&i("night"),t.job&&!t.job.free&&t.job.distance>400&&i("longhaul"),t.job&&t.job.adr&&i("adr"),t.purchased&&i("dealer"),t.garage&&i("garage"),t.driver&&i("driver"),gi(e.xp).level>=10&&i("level10"),this.lightsOn&&this.nightDistance>2e4&&i("nightride"),this.network=this.network}cityPos(t){return oe.get(t)?this._cityWorld(t):{x:0,z:0}}_cityWorld(t){let e=oe.get(t),i=.1,s=111320*Math.cos(50*Math.PI/180)*i,r=110540*i;return{x:(e.lon-10)*s,z:-(e.lat-50)*r}}disposeWorld(){this.road&&(this.road.dispose(),this.road=null),this.traffic&&(this.traffic.dispose(),this.traffic=null),this.truck=null,this.route=null,this.job=null,this.work=null}},rl=new qc;window.__game=rl;window.__eurotrakSave=()=>{rl.syncProfileFromTruck(),rl.saveNow(),rl.ui.toast("\u0421\u043E\u0445\u0440\u0430\u043D\u0435\u043D\u043E","good")};})();
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2026 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
