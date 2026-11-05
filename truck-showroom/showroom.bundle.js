(()=>{var Gi={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},Wi={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},vu=0,Uc=1,bu=2;var ps=1,za=2,ir=3,Xi=0,Xe=1,Ne=2,ai=0,sr=1,Fc=2,Oc=3,Bc=4,Su=5;var ms=100,Mu=101,Eu=102,Tu=103,wu=104,Au=200,Ru=201,Cu=202,Pu=203,kc=204,zc=205,Iu=206,Lu=207,Du=208,Nu=209,Uu=210,Fu=211,Ou=212,Bu=213,ku=214,sa=0,ra=1,oa=2,Vs=3,aa=4,la=5,ca=6,ha=7,Ha=0,zu=1,Hu=2,$n=0,Hc=1,Vc=2,Gc=3,rr=4,Wc=5,Xc=6,qc=7;var Yc=300,qi=301,gs=302,or=303,Va=304,ho=306,Gs=1e3,ni=1001,ua=1002,tn=1003,Vu=1004;var uo=1005;var nn=1006,Ga=1007;var Yi=1008;var yn=1009,Zc=1010,Jc=1011,ar=1012,Wa=1013,Kn=1014,kn=1015,jn=1016,Xa=1017,qa=1018,lr=1020,$c=35902,Kc=35899,jc=1021,Qc=1022,zn=1023,ii=1026,Zi=1027,Ya=1028,Za=1029,Ji=1030,Ja=1031;var $a=1033,fo=33776,po=33777,mo=33778,go=33779,Ka=35840,ja=35841,Qa=35842,tl=35843,el=36196,nl=37492,il=37496,sl=37488,rl=37489,_o=37490,ol=37491,al=37808,ll=37809,cl=37810,hl=37811,ul=37812,dl=37813,fl=37814,pl=37815,ml=37816,gl=37817,_l=37818,xl=37819,yl=37820,vl=37821,bl=36492,Sl=36494,Ml=36495,El=36283,Tl=36284,xo=36285,wl=36286;var Dr=2300,da=2301,na=2302,bc=2303,Sc=2400,Mc=2401,Ec=2402;var Gu=3200;var yo=0,Wu=1,Ei="",Qe="srgb",Nr="srgb-linear",Ur="linear",_e="srgb";var ia=7680;var Xu=519,qu=512,Yu=513,Zu=514,Al=515,Ju=516,$u=517,Rl=518,Ku=519,ju=35044;var th="300 es",Zn=2e3,Ws=2001;function bf(i){for(let t=i.length-1;t>=0;--t)if(i[t]>=65535)return!0;return!1}function Sf(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function Fr(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Qu(){let i=Fr("canvas");return i.style.display="block",i}var Vh={},Xs=null;function eh(...i){let t="THREE."+i.shift();Xs?Xs("log",t,...i):console.log(t,...i)}function td(i){let t=i[0];if(typeof t=="string"&&t.startsWith("TSL:")){let e=i[1];e&&e.isStackTrace?i[0]+=" "+e.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function Qt(...i){i=td(i);let t="THREE."+i.shift();if(Xs)Xs("warn",t,...i);else{let e=i[0];e&&e.isStackTrace?console.warn(e.getError(t)):console.warn(t,...i)}}function ne(...i){i=td(i);let t="THREE."+i.shift();if(Xs)Xs("error",t,...i);else{let e=i[0];e&&e.isStackTrace?console.error(e.getError(t)):console.error(t,...i)}}function ls(...i){let t=i.join(" ");t in Vh||(Vh[t]=!0,Qt(...i))}function ed(i,t,e){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(t,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}var nd={[sa]:ra,[oa]:ca,[aa]:ha,[Vs]:la,[ra]:sa,[ca]:oa,[ha]:aa,[la]:Vs},Jn=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){let n=this._listeners;return n===void 0?!1:n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){let n=this._listeners;if(n===void 0)return;let s=n[t];if(s!==void 0){let r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){let e=this._listeners;if(e===void 0)return;let n=e[t.type];if(n!==void 0){t.target=this;let s=n.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,t);t.target=null}}},an=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Gh=1234567,Cr=Math.PI/180,cs=180/Math.PI;function _s(){let i=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(an[i&255]+an[i>>8&255]+an[i>>16&255]+an[i>>24&255]+"-"+an[t&255]+an[t>>8&255]+"-"+an[t>>16&15|64]+an[t>>24&255]+"-"+an[e&63|128]+an[e>>8&255]+"-"+an[e>>16&255]+an[e>>24&255]+an[n&255]+an[n>>8&255]+an[n>>16&255]+an[n>>24&255]).toLowerCase()}function oe(i,t,e){return Math.max(t,Math.min(e,i))}function nh(i,t){return(i%t+t)%t}function Mf(i,t,e,n,s){return n+(i-t)*(s-n)/(e-t)}function Ef(i,t,e){return i!==t?(e-i)/(t-i):0}function Pr(i,t,e){return(1-e)*i+e*t}function Tf(i,t,e,n){return Pr(i,t,1-Math.exp(-e*n))}function wf(i,t=1){return t-Math.abs(nh(i,t*2)-t)}function Af(i,t,e){return i<=t?0:i>=e?1:(i=(i-t)/(e-t),i*i*(3-2*i))}function Rf(i,t,e){return i<=t?0:i>=e?1:(i=(i-t)/(e-t),i*i*i*(i*(i*6-15)+10))}function Cf(i,t){return i+Math.floor(Math.random()*(t-i+1))}function Pf(i,t){return i+Math.random()*(t-i)}function If(i){return i*(.5-Math.random())}function Lf(i){i!==void 0&&(Gh=i);let t=Gh+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function Df(i){return i*Cr}function Nf(i){return i*cs}function Uf(i){return i>0&&Number.isInteger(i)&&2**Math.round(Math.log2(i))===i}function Ff(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function Of(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function Bf(i,t,e,n,s){let r=Math.cos,o=Math.sin,a=r(e/2),l=o(e/2),c=r((t+n)/2),h=o((t+n)/2),u=r((t-n)/2),d=o((t-n)/2),f=r((n-t)/2),g=o((n-t)/2);switch(s){case"XYX":i.set(a*h,l*u,l*d,a*c);break;case"YZY":i.set(l*d,a*h,l*u,a*c);break;case"ZXZ":i.set(l*u,l*d,a*h,a*c);break;case"XZX":i.set(a*h,l*g,l*f,a*c);break;case"YXY":i.set(l*f,a*h,l*g,a*c);break;case"ZYZ":i.set(l*g,l*f,a*h,a*c);break;default:Qt("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function zs(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:case Uint8ClampedArray:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function mn(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var ih={DEG2RAD:Cr,RAD2DEG:cs,generateUUID:_s,clamp:oe,euclideanModulo:nh,mapLinear:Mf,inverseLerp:Ef,lerp:Pr,damp:Tf,pingpong:wf,smoothstep:Af,smootherstep:Rf,randInt:Cf,randFloat:Pf,randFloatSpread:If,seededRandom:Lf,degToRad:Df,radToDeg:Nf,isPowerOfTwo:Uf,ceilPowerOfTwo:Ff,floorPowerOfTwo:Of,setQuaternionFromProperEuler:Bf,normalize:mn,denormalize:zs},ch=class ch{constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,n=this.y,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6],this.y=s[1]*e+s[4]*n+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=oe(this.x,t.x,e.x),this.y=oe(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=oe(this.x,t,e),this.y=oe(this.y,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(oe(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(oe(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let n=Math.cos(e),s=Math.sin(e),r=this.x-t.x,o=this.y-t.y;return this.x=r*n-o*s+t.x,this.y=r*s+o*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};ch.prototype.isVector2=!0;var at=ch,An=class{constructor(t=0,e=0,n=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=s}static slerpFlat(t,e,n,s,r,o,a){let l=n[s+0],c=n[s+1],h=n[s+2],u=n[s+3],d=r[o+0],f=r[o+1],g=r[o+2],_=r[o+3];if(u!==_||l!==d||c!==f||h!==g){let m=l*d+c*f+h*g+u*_;m<0&&(d=-d,f=-f,g=-g,_=-_,m=-m);let p=1-a;if(m<.9995){let v=Math.acos(m),S=Math.sin(v);p=Math.sin(p*v)/S,a=Math.sin(a*v)/S,l=l*p+d*a,c=c*p+f*a,h=h*p+g*a,u=u*p+_*a}else{l=l*p+d*a,c=c*p+f*a,h=h*p+g*a,u=u*p+_*a;let v=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=v,c*=v,h*=v,u*=v}}t[e]=l,t[e+1]=c,t[e+2]=h,t[e+3]=u}static multiplyQuaternionsFlat(t,e,n,s,r,o){let a=n[s],l=n[s+1],c=n[s+2],h=n[s+3],u=r[o],d=r[o+1],f=r[o+2],g=r[o+3];return t[e]=a*g+h*u+l*f-c*d,t[e+1]=l*g+h*d+c*u-a*f,t[e+2]=c*g+h*f+a*d-l*u,t[e+3]=h*g-a*u-l*d-c*f,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,s){return this._x=t,this._y=e,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let n=t._x,s=t._y,r=t._z,o=t._order,a=Math.cos,l=Math.sin,c=a(n/2),h=a(s/2),u=a(r/2),d=l(n/2),f=l(s/2),g=l(r/2);switch(o){case"XYZ":this._x=d*h*u+c*f*g,this._y=c*f*u-d*h*g,this._z=c*h*g+d*f*u,this._w=c*h*u-d*f*g;break;case"YXZ":this._x=d*h*u+c*f*g,this._y=c*f*u-d*h*g,this._z=c*h*g-d*f*u,this._w=c*h*u+d*f*g;break;case"ZXY":this._x=d*h*u-c*f*g,this._y=c*f*u+d*h*g,this._z=c*h*g+d*f*u,this._w=c*h*u-d*f*g;break;case"ZYX":this._x=d*h*u-c*f*g,this._y=c*f*u+d*h*g,this._z=c*h*g-d*f*u,this._w=c*h*u+d*f*g;break;case"YZX":this._x=d*h*u+c*f*g,this._y=c*f*u+d*h*g,this._z=c*h*g-d*f*u,this._w=c*h*u-d*f*g;break;case"XZY":this._x=d*h*u-c*f*g,this._y=c*f*u-d*h*g,this._z=c*h*g+d*f*u,this._w=c*h*u+d*f*g;break;default:Qt("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let n=e/2,s=Math.sin(n);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,n=e[0],s=e[4],r=e[8],o=e[1],a=e[5],l=e[9],c=e[2],h=e[6],u=e[10],d=n+a+u;if(d>0){let f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(h-l)*f,this._y=(r-c)*f,this._z=(o-s)*f}else if(n>a&&n>u){let f=2*Math.sqrt(1+n-a-u);this._w=(h-l)/f,this._x=.25*f,this._y=(s+o)/f,this._z=(r+c)/f}else if(a>u){let f=2*Math.sqrt(1+a-n-u);this._w=(r-c)/f,this._x=(s+o)/f,this._y=.25*f,this._z=(l+h)/f}else{let f=2*Math.sqrt(1+u-n-a);this._w=(o-s)/f,this._x=(r+c)/f,this._y=(l+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<1e-8?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(oe(this.dot(t),-1,1)))}rotateTowards(t,e){let n=this.angleTo(t);if(n===0)return this;let s=Math.min(1,e/n);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let n=t._x,s=t._y,r=t._z,o=t._w,a=e._x,l=e._y,c=e._z,h=e._w;return this._x=n*h+o*a+s*c-r*l,this._y=s*h+o*l+r*a-n*c,this._z=r*h+o*c+n*l-s*a,this._w=o*h-n*a-s*l-r*c,this._onChangeCallback(),this}slerp(t,e){let n=t._x,s=t._y,r=t._z,o=t._w,a=this.dot(t);a<0&&(n=-n,s=-s,r=-r,o=-o,a=-a);let l=1-e;if(a<.9995){let c=Math.acos(a),h=Math.sin(c);l=Math.sin(l*c)/h,e=Math.sin(e*c)/h,this._x=this._x*l+n*e,this._y=this._y*l+s*e,this._z=this._z*l+r*e,this._w=this._w*l+o*e,this._onChangeCallback()}else this._x=this._x*l+n*e,this._y=this._y*l+s*e,this._z=this._z*l+r*e,this._w=this._w*l+o*e,this.normalize();return this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},hh=class hh{constructor(t=0,e=0,n=0){this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(Wh.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(Wh.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*s,this.y=r[1]*e+r[4]*n+r[7]*s,this.z=r[2]*e+r[5]*n+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=t.elements,o=1/(r[3]*e+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*s+r[12])*o,this.y=(r[1]*e+r[5]*n+r[9]*s+r[13])*o,this.z=(r[2]*e+r[6]*n+r[10]*s+r[14])*o,this}applyQuaternion(t){let e=this.x,n=this.y,s=this.z,r=t.x,o=t.y,a=t.z,l=t.w,c=2*(o*s-a*n),h=2*(a*e-r*s),u=2*(r*n-o*e);return this.x=e+l*c+o*u-a*h,this.y=n+l*h+a*c-r*u,this.z=s+l*u+r*h-o*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*s,this.y=r[1]*e+r[5]*n+r[9]*s,this.z=r[2]*e+r[6]*n+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=oe(this.x,t.x,e.x),this.y=oe(this.y,t.y,e.y),this.z=oe(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=oe(this.x,t,e),this.y=oe(this.y,t,e),this.z=oe(this.z,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(oe(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let n=t.x,s=t.y,r=t.z,o=e.x,a=e.y,l=e.z;return this.x=s*l-r*a,this.y=r*o-n*l,this.z=n*a-s*o,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return Kl.copy(this).projectOnVector(t),this.sub(Kl)}reflect(t){return this.sub(Kl.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(oe(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y,s=this.z-t.z;return e*e+n*n+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){let s=Math.sin(e)*t;return this.x=s*Math.sin(n),this.y=Math.cos(e)*t,this.z=s*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};hh.prototype.isVector3=!0;var N=hh,Kl=new N,Wh=new An,uh=class uh{constructor(t,e,n,s,r,o,a,l,c){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,o,a,l,c)}set(t,e,n,s,r,o,a,l,c){let h=this.elements;return h[0]=t,h[1]=s,h[2]=a,h[3]=e,h[4]=r,h[5]=l,h[6]=n,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],h=n[4],u=n[7],d=n[2],f=n[5],g=n[8],_=s[0],m=s[3],p=s[6],v=s[1],S=s[4],y=s[7],E=s[2],M=s[5],A=s[8];return r[0]=o*_+a*v+l*E,r[3]=o*m+a*S+l*M,r[6]=o*p+a*y+l*A,r[1]=c*_+h*v+u*E,r[4]=c*m+h*S+u*M,r[7]=c*p+h*y+u*A,r[2]=d*_+f*v+g*E,r[5]=d*m+f*S+g*M,r[8]=d*p+f*y+g*A,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8];return e*o*h-e*a*c-n*r*h+n*a*l+s*r*c-s*o*l}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8],u=h*o-a*c,d=a*l-h*r,f=c*r-o*l,g=e*u+n*d+s*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let _=1/g;return t[0]=u*_,t[1]=(s*c-h*n)*_,t[2]=(a*n-s*o)*_,t[3]=d*_,t[4]=(h*e-s*l)*_,t[5]=(s*r-a*e)*_,t[6]=f*_,t[7]=(n*l-c*e)*_,t[8]=(o*e-n*r)*_,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,s,r,o,a){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*o+c*a)+o+t,-s*c,s*l,-s*(-c*o+l*a)+a+e,0,0,1),this}scale(t,e){return ls("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(jl.makeScale(t,e)),this}rotate(t){return ls("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(jl.makeRotation(-t)),this}translate(t,e){return ls("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(jl.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<9;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}};uh.prototype.isMatrix3=!0;var re=uh,jl=new re,Xh=new re().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),qh=new re().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function kf(){let i={enabled:!0,workingColorSpace:Nr,spaces:{},convert:function(s,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===_e&&(s.r=vi(s.r),s.g=vi(s.g),s.b=vi(s.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===_e&&(s.r=Hs(s.r),s.g=Hs(s.g),s.b=Hs(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Ei?Ur:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,o){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return ls("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return ls("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[Nr]:{primaries:t,whitePoint:n,transfer:Ur,toXYZ:Xh,fromXYZ:qh,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:Qe},outputColorSpaceConfig:{drawingBufferColorSpace:Qe}},[Qe]:{primaries:t,whitePoint:n,transfer:_e,toXYZ:Xh,fromXYZ:qh,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:Qe}}}),i}var he=kf();function vi(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Hs(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var ws,fa=class{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement=="undefined")return t.src;let n;if(t instanceof HTMLCanvasElement)n=t;else{ws===void 0&&(ws=Fr("canvas")),ws.width=t.width,ws.height=t.height;let s=ws.getContext("2d");t instanceof ImageData?s.putImageData(t,0,0):s.drawImage(t,0,0,t.width,t.height),n=ws}return n.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement!="undefined"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement!="undefined"&&t instanceof HTMLCanvasElement||typeof ImageBitmap!="undefined"&&t instanceof ImageBitmap){let e=Fr("canvas");e.width=t.width,e.height=t.height;let n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);let s=n.getImageData(0,0,t.width,t.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=vi(r[o]/255)*255;return n.putImageData(s,0,0),e}else if(t.data){let e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(vi(e[n]/255)*255):e[n]=vi(e[n]);return{data:e,width:t.width,height:t.height}}else return Qt("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},zf=0,qs=class{constructor(t=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:zf++}),this.uuid=_s(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let e=this.data;return typeof HTMLVideoElement!="undefined"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):typeof VideoFrame!="undefined"&&e instanceof VideoFrame?t.set(e.displayWidth,e.displayHeight,0):e!==null?t.set(e.width,e.height,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(Ql(s[o].image)):r.push(Ql(s[o]))}else r=Ql(s);n.url=r}return e||(t.images[this.uuid]=n),n}};function Ql(i){return typeof HTMLImageElement!="undefined"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement!="undefined"&&i instanceof HTMLCanvasElement||typeof ImageBitmap!="undefined"&&i instanceof ImageBitmap?fa.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(Qt("Texture: Unable to serialize Texture."),{})}var Hf=0,tc=new N,gn=class i extends Jn{constructor(t=i.DEFAULT_IMAGE,e=i.DEFAULT_MAPPING,n=ni,s=ni,r=nn,o=Yi,a=zn,l=yn,c=i.DEFAULT_ANISOTROPY,h=Ei){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Hf++}),this.uuid=_s(),this.name="",this.source=new qs(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new at(0,0),this.repeat=new at(1,1),this.center=new at(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new re,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(tc).x}get height(){return this.source.getSize(tc).y}get depth(){return this.source.getSize(tc).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let e in t){let n=t[e];if(n===void 0){Qt(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){Qt(`Texture.setValues(): property '${e}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==Yc)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case Gs:t.x=t.x-Math.floor(t.x);break;case ni:t.x=t.x<0?0:1;break;case ua:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case Gs:t.y=t.y-Math.floor(t.y);break;case ni:t.y=t.y<0?0:1;break;case ua:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};gn.DEFAULT_IMAGE=null;gn.DEFAULT_MAPPING=Yc;gn.DEFAULT_ANISOTROPY=1;var dh=class dh{constructor(t=0,e=0,n=0,s=1){this.x=t,this.y=e,this.z=n,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=this.w,o=t.elements;return this.x=o[0]*e+o[4]*n+o[8]*s+o[12]*r,this.y=o[1]*e+o[5]*n+o[9]*s+o[13]*r,this.z=o[2]*e+o[6]*n+o[10]*s+o[14]*r,this.w=o[3]*e+o[7]*n+o[11]*s+o[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,s,r,l=t.elements,c=l[0],h=l[4],u=l[8],d=l[1],f=l[5],g=l[9],_=l[2],m=l[6],p=l[10];if(Math.abs(h-d)<.01&&Math.abs(u-_)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+_)<.1&&Math.abs(g+m)<.1&&Math.abs(c+f+p-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let S=(c+1)/2,y=(f+1)/2,E=(p+1)/2,M=(h+d)/4,A=(u+_)/4,x=(g+m)/4;return S>y&&S>E?S<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(S),s=M/n,r=A/n):y>E?y<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(y),n=M/s,r=x/s):E<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(E),n=A/r,s=x/r),this.set(n,s,r,e),this}let v=Math.sqrt((m-g)*(m-g)+(u-_)*(u-_)+(d-h)*(d-h));return Math.abs(v)<.001&&(v=1),this.x=(m-g)/v,this.y=(u-_)/v,this.z=(d-h)/v,this.w=Math.acos((c+f+p-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=oe(this.x,t.x,e.x),this.y=oe(this.y,t.y,e.y),this.z=oe(this.z,t.z,e.z),this.w=oe(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=oe(this.x,t,e),this.y=oe(this.y,t,e),this.z=oe(this.z,t,e),this.w=oe(this.w,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(oe(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};dh.prototype.isVector4=!0;var Pe=dh,pa=class extends Jn{constructor(t=1,e=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:nn,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=n.depth,this.scissor=new Pe(0,0,t,e),this.scissorTest=!1,this.viewport=new Pe(0,0,t,e),this.textures=[];let s={width:t,height:e,depth:n.depth},r=new gn(s),o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(t={}){let e={minFilter:nn,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),t!==null&&t.renderTarget===null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,n=t.textures.length;e<n;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;let s=Object.assign({},t.textures[e].image);this.textures[e].source=new qs(s)}if(this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveColorBuffer=t.resolveColorBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,this.storeMultisampledColorBuffer=t.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=t.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=t.storeMultisampledStencilBuffer,t.depthTexture!==null)if(t.depthTexture.renderTarget===t){let e=t.depthTexture.clone();e.renderTarget=null,this.depthTexture=e}else this.depthTexture=t.depthTexture;return this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},_n=class extends pa{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}},Or=class extends gn{constructor(t=null,e=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=tn,this.minFilter=tn,this.wrapR=ni,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var ma=class extends gn{constructor(t=null,e=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=tn,this.minFilter=tn,this.wrapR=ni,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}};var ka=class ka{constructor(t,e,n,s,r,o,a,l,c,h,u,d,f,g,_,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,o,a,l,c,h,u,d,f,g,_,m)}set(t,e,n,s,r,o,a,l,c,h,u,d,f,g,_,m){let p=this.elements;return p[0]=t,p[4]=e,p[8]=n,p[12]=s,p[1]=r,p[5]=o,p[9]=a,p[13]=l,p[2]=c,p[6]=h,p[10]=u,p[14]=d,p[3]=f,p[7]=g,p[11]=_,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new ka().fromArray(this.elements)}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){let e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return this.determinantAffine()===0?(t.set(1,0,0),e.set(0,1,0),n.set(0,0,1),this):(t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();let e=this.elements,n=t.elements,s=1/As.setFromMatrixColumn(t,0).length(),r=1/As.setFromMatrixColumn(t,1).length(),o=1/As.setFromMatrixColumn(t,2).length();return e[0]=n[0]*s,e[1]=n[1]*s,e[2]=n[2]*s,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*o,e[9]=n[9]*o,e[10]=n[10]*o,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,n=t.x,s=t.y,r=t.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),u=Math.sin(r);if(t.order==="XYZ"){let d=o*h,f=o*u,g=a*h,_=a*u;e[0]=l*h,e[4]=-l*u,e[8]=c,e[1]=f+g*c,e[5]=d-_*c,e[9]=-a*l,e[2]=_-d*c,e[6]=g+f*c,e[10]=o*l}else if(t.order==="YXZ"){let d=l*h,f=l*u,g=c*h,_=c*u;e[0]=d+_*a,e[4]=g*a-f,e[8]=o*c,e[1]=o*u,e[5]=o*h,e[9]=-a,e[2]=f*a-g,e[6]=_+d*a,e[10]=o*l}else if(t.order==="ZXY"){let d=l*h,f=l*u,g=c*h,_=c*u;e[0]=d-_*a,e[4]=-o*u,e[8]=g+f*a,e[1]=f+g*a,e[5]=o*h,e[9]=_-d*a,e[2]=-o*c,e[6]=a,e[10]=o*l}else if(t.order==="ZYX"){let d=o*h,f=o*u,g=a*h,_=a*u;e[0]=l*h,e[4]=g*c-f,e[8]=d*c+_,e[1]=l*u,e[5]=_*c+d,e[9]=f*c-g,e[2]=-c,e[6]=a*l,e[10]=o*l}else if(t.order==="YZX"){let d=o*l,f=o*c,g=a*l,_=a*c;e[0]=l*h,e[4]=_-d*u,e[8]=g*u+f,e[1]=u,e[5]=o*h,e[9]=-a*h,e[2]=-c*h,e[6]=f*u+g,e[10]=d-_*u}else if(t.order==="XZY"){let d=o*l,f=o*c,g=a*l,_=a*c;e[0]=l*h,e[4]=-u,e[8]=c*h,e[1]=d*u+_,e[5]=o*h,e[9]=f*u-g,e[2]=g*u-f,e[6]=a*h,e[10]=_*u+d}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(Vf,t,Gf)}lookAt(t,e,n){let s=this.elements;return Mn.subVectors(t,e),Mn.lengthSq()===0&&(Mn.z=1),Mn.normalize(),Ci.crossVectors(n,Mn),Ci.lengthSq()===0&&(Math.abs(n.z)===1?Mn.x+=1e-4:Mn.z+=1e-4,Mn.normalize(),Ci.crossVectors(n,Mn)),Ci.normalize(),No.crossVectors(Mn,Ci),s[0]=Ci.x,s[4]=No.x,s[8]=Mn.x,s[1]=Ci.y,s[5]=No.y,s[9]=Mn.y,s[2]=Ci.z,s[6]=No.z,s[10]=Mn.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],h=n[1],u=n[5],d=n[9],f=n[13],g=n[2],_=n[6],m=n[10],p=n[14],v=n[3],S=n[7],y=n[11],E=n[15],M=s[0],A=s[4],x=s[8],w=s[12],C=s[1],I=s[5],P=s[9],O=s[13],U=s[2],H=s[6],K=s[10],L=s[14],q=s[3],X=s[7],z=s[11],G=s[15];return r[0]=o*M+a*C+l*U+c*q,r[4]=o*A+a*I+l*H+c*X,r[8]=o*x+a*P+l*K+c*z,r[12]=o*w+a*O+l*L+c*G,r[1]=h*M+u*C+d*U+f*q,r[5]=h*A+u*I+d*H+f*X,r[9]=h*x+u*P+d*K+f*z,r[13]=h*w+u*O+d*L+f*G,r[2]=g*M+_*C+m*U+p*q,r[6]=g*A+_*I+m*H+p*X,r[10]=g*x+_*P+m*K+p*z,r[14]=g*w+_*O+m*L+p*G,r[3]=v*M+S*C+y*U+E*q,r[7]=v*A+S*I+y*H+E*X,r[11]=v*x+S*P+y*K+E*z,r[15]=v*w+S*O+y*L+E*G,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[4],s=t[8],r=t[12],o=t[1],a=t[5],l=t[9],c=t[13],h=t[2],u=t[6],d=t[10],f=t[14],g=t[3],_=t[7],m=t[11],p=t[15],v=l*f-c*d,S=a*f-c*u,y=a*d-l*u,E=o*f-c*h,M=o*d-l*h,A=o*u-a*h;return e*(_*v-m*S+p*y)-n*(g*v-m*E+p*M)+s*(g*S-_*E+p*A)-r*(g*y-_*M+m*A)}determinantAffine(){let t=this.elements,e=t[0],n=t[4],s=t[8],r=t[1],o=t[5],a=t[9],l=t[2],c=t[6],h=t[10];return e*(o*h-a*c)-n*(r*h-a*l)+s*(r*c-o*l)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){let s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=n),this}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8],u=t[9],d=t[10],f=t[11],g=t[12],_=t[13],m=t[14],p=t[15],v=e*a-n*o,S=e*l-s*o,y=e*c-r*o,E=n*l-s*a,M=n*c-r*a,A=s*c-r*l,x=h*_-u*g,w=h*m-d*g,C=h*p-f*g,I=u*m-d*_,P=u*p-f*_,O=d*p-f*m,U=v*O-S*P+y*I+E*C-M*w+A*x;if(U===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let H=1/U;return t[0]=(a*O-l*P+c*I)*H,t[1]=(s*P-n*O-r*I)*H,t[2]=(_*A-m*M+p*E)*H,t[3]=(d*M-u*A-f*E)*H,t[4]=(l*C-o*O-c*w)*H,t[5]=(e*O-s*C+r*w)*H,t[6]=(m*y-g*A-p*S)*H,t[7]=(h*A-d*y+f*S)*H,t[8]=(o*P-a*C+c*x)*H,t[9]=(n*C-e*P-r*x)*H,t[10]=(g*M-_*y+p*v)*H,t[11]=(u*y-h*M-f*v)*H,t[12]=(a*w-o*I-l*x)*H,t[13]=(e*I-n*w+s*x)*H,t[14]=(_*S-g*E-m*v)*H,t[15]=(h*E-u*S+d*v)*H,this}scale(t){let e=this.elements,n=t.x,s=t.y,r=t.z;return e[0]*=n,e[4]*=s,e[8]*=r,e[1]*=n,e[5]*=s,e[9]*=r,e[2]*=n,e[6]*=s,e[10]*=r,e[3]*=n,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,s))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let n=Math.cos(e),s=Math.sin(e),r=1-n,o=t.x,a=t.y,l=t.z,c=r*o,h=r*a;return this.set(c*o+n,c*a-s*l,c*l+s*a,0,c*a+s*l,h*a+n,h*l-s*o,0,c*l-s*a,h*l+s*o,r*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,s,r,o){return this.set(1,n,r,0,t,1,o,0,e,s,1,0,0,0,0,1),this}compose(t,e,n){let s=this.elements,r=e._x,o=e._y,a=e._z,l=e._w,c=r+r,h=o+o,u=a+a,d=r*c,f=r*h,g=r*u,_=o*h,m=o*u,p=a*u,v=l*c,S=l*h,y=l*u,E=n.x,M=n.y,A=n.z;return s[0]=(1-(_+p))*E,s[1]=(f+y)*E,s[2]=(g-S)*E,s[3]=0,s[4]=(f-y)*M,s[5]=(1-(d+p))*M,s[6]=(m+v)*M,s[7]=0,s[8]=(g+S)*A,s[9]=(m-v)*A,s[10]=(1-(d+_))*A,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,n){let s=this.elements;t.x=s[12],t.y=s[13],t.z=s[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),e.identity(),this;let o=As.set(s[0],s[1],s[2]).length(),a=As.set(s[4],s[5],s[6]).length(),l=As.set(s[8],s[9],s[10]).length();r<0&&(o=-o),Xn.copy(this);let c=1/o,h=1/a,u=1/l;return Xn.elements[0]*=c,Xn.elements[1]*=c,Xn.elements[2]*=c,Xn.elements[4]*=h,Xn.elements[5]*=h,Xn.elements[6]*=h,Xn.elements[8]*=u,Xn.elements[9]*=u,Xn.elements[10]*=u,e.setFromRotationMatrix(Xn),n.x=o,n.y=a,n.z=l,this}makePerspective(t,e,n,s,r,o,a=Zn,l=!1){let c=this.elements,h=2*r/(e-t),u=2*r/(n-s),d=(e+t)/(e-t),f=(n+s)/(n-s),g,_;if(l)g=r/(o-r),_=o*r/(o-r);else if(a===Zn)g=-(o+r)/(o-r),_=-2*o*r/(o-r);else if(a===Ws)g=-o/(o-r),_=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=h,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=_,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,e,n,s,r,o,a=Zn,l=!1){let c=this.elements,h=2/(e-t),u=2/(n-s),d=-(e+t)/(e-t),f=-(n+s)/(n-s),g,_;if(l)g=1/(o-r),_=o/(o-r);else if(a===Zn)g=-2/(o-r),_=-(o+r)/(o-r);else if(a===Ws)g=-1/(o-r),_=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=h,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=g,c[14]=_,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<16;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}};ka.prototype.isMatrix4=!0;var Se=ka,As=new N,Xn=new Se,Vf=new N(0,0,0),Gf=new N(1,1,1),Ci=new N,No=new N,Mn=new N,Yh=new Se,Zh=new An,si=class i{constructor(t=0,e=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,s=this._order){return this._x=t,this._y=e,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){let s=t.elements,r=s[0],o=s[4],a=s[8],l=s[1],c=s[5],h=s[9],u=s[2],d=s[6],f=s[10];switch(e){case"XYZ":this._y=Math.asin(oe(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-oe(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(oe(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-oe(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(oe(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-oe(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,f),this._y=0);break;default:Qt("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return Yh.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Yh,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Zh.setFromEuler(this),this.setFromQuaternion(Zh,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};si.DEFAULT_ORDER="XYZ";var Ys=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},Wf=0,Jh=new N,Rs=new An,mi=new Se,Uo=new N,Sr=new N,Xf=new N,qf=new An,$h=new N(1,0,0),Kh=new N(0,1,0),jh=new N(0,0,1),Qh={type:"added"},Yf={type:"removed"},Cs={type:"childadded",child:null},ec={type:"childremoved",child:null},We=class i extends Jn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Wf++}),this.uuid=_s(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let t=new N,e=new si,n=new An,s=new N(1,1,1);function r(){n.setFromEuler(e,!1)}function o(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Se},normalMatrix:{value:new re}}),this.matrix=new Se,this.matrixWorld=new Se,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Ys,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Rs.setFromAxisAngle(t,e),this.quaternion.multiply(Rs),this}rotateOnWorldAxis(t,e){return Rs.setFromAxisAngle(t,e),this.quaternion.premultiply(Rs),this}rotateX(t){return this.rotateOnAxis($h,t)}rotateY(t){return this.rotateOnAxis(Kh,t)}rotateZ(t){return this.rotateOnAxis(jh,t)}translateOnAxis(t,e){return Jh.copy(t).applyQuaternion(this.quaternion),this.position.add(Jh.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis($h,t)}translateY(t){return this.translateOnAxis(Kh,t)}translateZ(t){return this.translateOnAxis(jh,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(mi.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?Uo.copy(t):Uo.set(t,e,n);let s=this.parent;this.updateWorldMatrix(!0,!1),Sr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?mi.lookAt(Sr,Uo,this.up):mi.lookAt(Uo,Sr,this.up),this.quaternion.setFromRotationMatrix(mi),s&&(mi.extractRotation(s.matrixWorld),Rs.setFromRotationMatrix(mi),this.quaternion.premultiply(Rs.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(ne("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Qh),Cs.child=t,this.dispatchEvent(Cs),Cs.child=null):ne("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(Yf),ec.child=t,this.dispatchEvent(ec),ec.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),mi.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),mi.multiply(t.parent.matrixWorld)),t.applyMatrix4(mi),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Qh),Cs.child=t,this.dispatchEvent(Cs),Cs.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,s=this.children.length;n<s;n++){let o=this.children[n].getObjectByProperty(t,e);if(o!==void 0)return o}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Sr,t,Xf),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Sr,qf,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(t){t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let e=t.x,n=t.y,s=t.z,r=this.matrix.elements;r[12]+=e-r[0]*e-r[4]*n-r[8]*s,r[13]+=n-r[1]*e-r[5]*n-r[9]*s,r[14]+=s-r[2]*e-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e,n=!1){let s=this.parent;if(t===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),e===!0){let r=this.children;for(let o=0,a=r.length;o<a;o++)r[o].updateWorldMatrix(!1,!0,n)}}toJSON(t){let e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(a=>({...a})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(t),s.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let u=l[c];r(t.shapes,u)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(t.materials,this.material[l]));s.material=a}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];s.animations.push(r(t.animations,l))}}if(e){let a=o(t.geometries),l=o(t.materials),c=o(t.textures),h=o(t.images),u=o(t.shapes),d=o(t.skeletons),f=o(t.animations),g=o(t.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),d.length>0&&(n.skeletons=d),f.length>0&&(n.animations=f),g.length>0&&(n.nodes=g)}return n.object=s,n;function o(a){let l=[];for(let c in a){let h=a[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){let s=t.children[n];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};We.DEFAULT_UP=new N(0,1,0);We.DEFAULT_MATRIX_AUTO_UPDATE=!0;We.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var en=class extends We{constructor(){super(),this.isGroup=!0,this.type="Group"}},Zf={type:"move"},Zs=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new en,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new en,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new N,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new N),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new en,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new N,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new N,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let s=null,r=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){o=!0;for(let _ of t.hand.values()){let m=e.getJointPose(_,n),p=this._getHandJoint(c,_);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}let h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],d=h.position.distanceTo(u.position),f=.02,g=.005;c.inputState.pinching&&d>f+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&d<=f-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:t,target:this})));a!==null&&(s=e.getPose(t.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Zf)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let n=new en;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}},id={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Pi={h:0,s:0,l:0},Fo={h:0,s:0,l:0};function nc(i,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?i+(t-i)*6*e:e<1/2?t:e<2/3?i+(t-i)*6*(2/3-e):i}var jt=class{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){let s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=Qe){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,he.colorSpaceToWorking(this,e),this}setRGB(t,e,n,s=he.workingColorSpace){return this.r=t,this.g=e,this.b=n,he.colorSpaceToWorking(this,s),this}setHSL(t,e,n,s=he.workingColorSpace){if(t=nh(t,1),e=oe(e,0,1),n=oe(n,0,1),e===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+e):n+e-n*e,o=2*n-r;this.r=nc(o,r,t+1/3),this.g=nc(o,r,t),this.b=nc(o,r,t-1/3)}return he.colorSpaceToWorking(this,s),this}setStyle(t,e=Qe){function n(r){r!==void 0&&parseFloat(r)<1&&Qt("Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r,o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:Qt("Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){let r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(o===6)return this.setHex(parseInt(r,16),e);Qt("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=Qe){let n=id[t.toLowerCase()];return n!==void 0?this.setHex(n,e):Qt("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=vi(t.r),this.g=vi(t.g),this.b=vi(t.b),this}copyLinearToSRGB(t){return this.r=Hs(t.r),this.g=Hs(t.g),this.b=Hs(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=Qe){return he.workingToColorSpace(ln.copy(this),t),Math.round(oe(ln.r*255,0,255))*65536+Math.round(oe(ln.g*255,0,255))*256+Math.round(oe(ln.b*255,0,255))}getHexString(t=Qe){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=he.workingColorSpace){he.workingToColorSpace(ln.copy(this),e);let n=ln.r,s=ln.g,r=ln.b,o=Math.max(n,s,r),a=Math.min(n,s,r),l,c,h=(a+o)/2;if(a===o)l=0,c=0;else{let u=o-a;switch(c=h<=.5?u/(o+a):u/(2-o-a),o){case n:l=(s-r)/u+(s<r?6:0);break;case s:l=(r-n)/u+2;break;case r:l=(n-s)/u+4;break}l/=6}return t.h=l,t.s=c,t.l=h,t}getRGB(t,e=he.workingColorSpace){return he.workingToColorSpace(ln.copy(this),e),t.r=ln.r,t.g=ln.g,t.b=ln.b,t}getStyle(t=Qe){he.workingToColorSpace(ln.copy(this),t);let e=ln.r,n=ln.g,s=ln.b;return t!==Qe?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(t,e,n){return this.getHSL(Pi),this.setHSL(Pi.h+t,Pi.s+e,Pi.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(Pi),t.getHSL(Fo);let n=Pr(Pi.h,Fo.h,e),s=Pr(Pi.s,Fo.s,e),r=Pr(Pi.l,Fo.l,e);return this.setHSL(n,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,n=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*s,this.g=r[1]*e+r[4]*n+r[7]*s,this.b=r[2]*e+r[5]*n+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},ln=new jt;jt.NAMES=id;var Js=class i{constructor(t,e=1,n=1e3){this.isFog=!0,this.name="",this.color=new jt(t),this.near=e,this.far=n}clone(){return new i(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}},Ui=class extends We{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new si,this.environmentIntensity=1,this.environmentRotation=new si,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__!="undefined"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),e.object.backgroundBlurriness=this.backgroundBlurriness,e.object.backgroundIntensity=this.backgroundIntensity,e.object.backgroundRotation=this.backgroundRotation.toArray(),e.object.environmentIntensity=this.environmentIntensity,e.object.environmentRotation=this.environmentRotation.toArray(),e}},qn=new N,gi=new N,ic=new N,_i=new N,Ps=new N,Is=new N,tu=new N,sc=new N,rc=new N,oc=new N,ac=new Pe,lc=new Pe,cc=new Pe,Ni=class i{constructor(t=new N,e=new N,n=new N){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,s){s.subVectors(n,e),qn.subVectors(t,e),s.cross(qn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,n,s,r){qn.subVectors(s,e),gi.subVectors(n,e),ic.subVectors(t,e);let o=qn.dot(qn),a=qn.dot(gi),l=qn.dot(ic),c=gi.dot(gi),h=gi.dot(ic),u=o*c-a*a;if(u===0)return r.set(0,0,0),null;let d=1/u,f=(c*l-a*h)*d,g=(o*h-a*l)*d;return r.set(1-f-g,g,f)}static containsPoint(t,e,n,s){return this.getBarycoord(t,e,n,s,_i)===null?!1:_i.x>=0&&_i.y>=0&&_i.x+_i.y<=1}static getInterpolation(t,e,n,s,r,o,a,l){return this.getBarycoord(t,e,n,s,_i)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,_i.x),l.addScaledVector(o,_i.y),l.addScaledVector(a,_i.z),l)}static getInterpolatedAttribute(t,e,n,s,r,o){return ac.setScalar(0),lc.setScalar(0),cc.setScalar(0),ac.fromBufferAttribute(t,e),lc.fromBufferAttribute(t,n),cc.fromBufferAttribute(t,s),o.setScalar(0),o.addScaledVector(ac,r.x),o.addScaledVector(lc,r.y),o.addScaledVector(cc,r.z),o}static isFrontFacing(t,e,n,s){return qn.subVectors(n,e),gi.subVectors(t,e),qn.cross(gi).dot(s)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,s){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,n,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return qn.subVectors(this.c,this.b),gi.subVectors(this.a,this.b),qn.cross(gi).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return i.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return i.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,s,r){return i.getInterpolation(t,this.a,this.b,this.c,e,n,s,r)}containsPoint(t){return i.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return i.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let n=this.a,s=this.b,r=this.c,o,a;Ps.subVectors(s,n),Is.subVectors(r,n),sc.subVectors(t,n);let l=Ps.dot(sc),c=Is.dot(sc);if(l<=0&&c<=0)return e.copy(n);rc.subVectors(t,s);let h=Ps.dot(rc),u=Is.dot(rc);if(h>=0&&u<=h)return e.copy(s);let d=l*u-h*c;if(d<=0&&l>=0&&h<=0)return o=l/(l-h),e.copy(n).addScaledVector(Ps,o);oc.subVectors(t,r);let f=Ps.dot(oc),g=Is.dot(oc);if(g>=0&&f<=g)return e.copy(r);let _=f*c-l*g;if(_<=0&&c>=0&&g<=0)return a=c/(c-g),e.copy(n).addScaledVector(Is,a);let m=h*g-f*u;if(m<=0&&u-h>=0&&f-g>=0)return tu.subVectors(r,s),a=(u-h)/(u-h+(f-g)),e.copy(s).addScaledVector(tu,a);let p=1/(m+_+d);return o=_*p,a=d*p,e.copy(n).addScaledVector(Ps,o).addScaledVector(Is,a)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},ri=class{constructor(t=new N(1/0,1/0,1/0),e=new N(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(Yn.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(Yn.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let n=Yn.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let n=t.geometry;if(n!==void 0){let r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)t.isMesh===!0?t.getVertexPosition(o,Yn):Yn.fromBufferAttribute(r,o),Yn.applyMatrix4(t.matrixWorld),this.expandByPoint(Yn);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Oo.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Oo.copy(n.boundingBox)),Oo.applyMatrix4(t.matrixWorld),this.union(Oo)}let s=t.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,Yn),Yn.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Mr),Bo.subVectors(this.max,Mr),Ls.subVectors(t.a,Mr),Ds.subVectors(t.b,Mr),Ns.subVectors(t.c,Mr),Ii.subVectors(Ds,Ls),Li.subVectors(Ns,Ds),is.subVectors(Ls,Ns);let e=[0,-Ii.z,Ii.y,0,-Li.z,Li.y,0,-is.z,is.y,Ii.z,0,-Ii.x,Li.z,0,-Li.x,is.z,0,-is.x,-Ii.y,Ii.x,0,-Li.y,Li.x,0,-is.y,is.x,0];return!hc(e,Ls,Ds,Ns,Bo)||(e=[1,0,0,0,1,0,0,0,1],!hc(e,Ls,Ds,Ns,Bo))?!1:(ko.crossVectors(Ii,Li),e=[ko.x,ko.y,ko.z],hc(e,Ls,Ds,Ns,Bo))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,Yn).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(Yn).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(xi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),xi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),xi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),xi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),xi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),xi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),xi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),xi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(xi),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}},xi=[new N,new N,new N,new N,new N,new N,new N,new N],Yn=new N,Oo=new ri,Ls=new N,Ds=new N,Ns=new N,Ii=new N,Li=new N,is=new N,Mr=new N,Bo=new N,ko=new N,ss=new N;function hc(i,t,e,n,s){for(let r=0,o=i.length-3;r<=o;r+=3){ss.fromArray(i,r);let a=s.x*Math.abs(ss.x)+s.y*Math.abs(ss.y)+s.z*Math.abs(ss.z),l=t.dot(ss),c=e.dot(ss),h=n.dot(ss);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>a)return!1}return!0}var Ge=new N,zo=new at,Jf=0,wn=class extends Jn{constructor(t,e,n=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Jf++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=ju,this.updateRanges=[],this.gpuType=kn,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[n+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)zo.fromBufferAttribute(this,e),zo.applyMatrix3(t),this.setXY(e,zo.x,zo.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)Ge.fromBufferAttribute(this,e),Ge.applyMatrix3(t),this.setXYZ(e,Ge.x,Ge.y,Ge.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)Ge.fromBufferAttribute(this,e),Ge.applyMatrix4(t),this.setXYZ(e,Ge.x,Ge.y,Ge.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)Ge.fromBufferAttribute(this,e),Ge.applyNormalMatrix(t),this.setXYZ(e,Ge.x,Ge.y,Ge.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)Ge.fromBufferAttribute(this,e),Ge.transformDirection(t),this.setXYZ(e,Ge.x,Ge.y,Ge.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=zs(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=mn(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=zs(e,this.array)),e}setX(t,e){return this.normalized&&(e=mn(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=zs(e,this.array)),e}setY(t,e){return this.normalized&&(e=mn(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=zs(e,this.array)),e}setZ(t,e){return this.normalized&&(e=mn(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=zs(e,this.array)),e}setW(t,e){return this.normalized&&(e=mn(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=mn(e,this.array),n=mn(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,s){return t*=this.itemSize,this.normalized&&(e=mn(e,this.array),n=mn(n,this.array),s=mn(s,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t*=this.itemSize,this.normalized&&(e=mn(e,this.array),n=mn(n,this.array),s=mn(s,this.array),r=mn(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return t.name=this.name,t.usage=this.usage,t.gpuType=this.gpuType,t}dispose(){this.dispatchEvent({type:"dispose"})}};var Br=class extends wn{constructor(t,e,n){super(new Uint16Array(t),e,n)}};var kr=class extends wn{constructor(t,e,n){super(new Uint32Array(t),e,n)}};var ue=class extends wn{constructor(t,e,n){super(new Float32Array(t),e,n)}},$f=new ri,Er=new N,uc=new N,Fi=class{constructor(t=new N,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let n=this.center;e!==void 0?n.copy(e):$f.setFromPoints(t).getCenter(n);let s=0;for(let r=0,o=t.length;r<o;r++)s=Math.max(s,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Er.subVectors(t,this.center);let e=Er.lengthSq();if(e>this.radius*this.radius){let n=Math.sqrt(e),s=(n-this.radius)*.5;this.center.addScaledVector(Er,s/n),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(uc.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Er.copy(t.center).add(uc)),this.expandByPoint(Er.copy(t.center).sub(uc))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}},Kf=0,On=new Se,dc=new We,Us=new N,En=new ri,Tr=new ri,je=new N,De=class i extends Jn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Kf++}),this.uuid=_s(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(bf(t)?kr:Br)(t,1):this.index=t,this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new re().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return On.makeRotationFromQuaternion(t),this.applyMatrix4(On),this}rotateX(t){return On.makeRotationX(t),this.applyMatrix4(On),this}rotateY(t){return On.makeRotationY(t),this.applyMatrix4(On),this}rotateZ(t){return On.makeRotationZ(t),this.applyMatrix4(On),this}translate(t,e,n){return On.makeTranslation(t,e,n),this.applyMatrix4(On),this}scale(t,e,n){return On.makeScale(t,e,n),this.applyMatrix4(On),this}lookAt(t){return dc.lookAt(t),dc.updateMatrix(),this.applyMatrix4(dc.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Us).negate(),this.translate(Us.x,Us.y,Us.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let n=[];for(let s=0,r=t.length;s<r;s++){let o=t[s];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new ue(n,3))}else{let n=Math.min(t.length,e.count);for(let s=0;s<n;s++){let r=t[s];e.setXYZ(s,r.x,r.y,r.z||0)}t.length>e.count&&Qt("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new ri);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){ne("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new N(-1/0,-1/0,-1/0),new N(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,s=e.length;n<s;n++){let r=e[n];En.setFromBufferAttribute(r),this.morphTargetsRelative?(je.addVectors(this.boundingBox.min,En.min),this.boundingBox.expandByPoint(je),je.addVectors(this.boundingBox.max,En.max),this.boundingBox.expandByPoint(je)):(this.boundingBox.expandByPoint(En.min),this.boundingBox.expandByPoint(En.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&ne('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Fi);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){ne("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new N,1/0);return}if(t){let n=this.boundingSphere.center;if(En.setFromBufferAttribute(t),e)for(let r=0,o=e.length;r<o;r++){let a=e[r];Tr.setFromBufferAttribute(a),this.morphTargetsRelative?(je.addVectors(En.min,Tr.min),En.expandByPoint(je),je.addVectors(En.max,Tr.max),En.expandByPoint(je)):(En.expandByPoint(Tr.min),En.expandByPoint(Tr.max))}En.getCenter(n);let s=0;for(let r=0,o=t.count;r<o;r++)je.fromBufferAttribute(t,r),s=Math.max(s,n.distanceToSquared(je));if(e)for(let r=0,o=e.length;r<o;r++){let a=e[r],l=this.morphTargetsRelative;for(let c=0,h=a.count;c<h;c++)je.fromBufferAttribute(a,c),l&&(Us.fromBufferAttribute(t,c),je.add(Us)),s=Math.max(s,n.distanceToSquared(je))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&ne('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){ne("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=e.position,s=e.normal,r=e.uv,o=this.getAttribute("tangent");(o===void 0||o.count!==n.count)&&(o=new wn(new Float32Array(4*n.count),4),this.setAttribute("tangent",o));let a=[],l=[];for(let x=0;x<n.count;x++)a[x]=new N,l[x]=new N;let c=new N,h=new N,u=new N,d=new at,f=new at,g=new at,_=new N,m=new N;function p(x,w,C){c.fromBufferAttribute(n,x),h.fromBufferAttribute(n,w),u.fromBufferAttribute(n,C),d.fromBufferAttribute(r,x),f.fromBufferAttribute(r,w),g.fromBufferAttribute(r,C),h.sub(c),u.sub(c),f.sub(d),g.sub(d);let I=1/(f.x*g.y-g.x*f.y);isFinite(I)&&(_.copy(h).multiplyScalar(g.y).addScaledVector(u,-f.y).multiplyScalar(I),m.copy(u).multiplyScalar(f.x).addScaledVector(h,-g.x).multiplyScalar(I),a[x].add(_),a[w].add(_),a[C].add(_),l[x].add(m),l[w].add(m),l[C].add(m))}let v=this.groups;v.length===0&&(v=[{start:0,count:t.count}]);for(let x=0,w=v.length;x<w;++x){let C=v[x],I=C.start,P=C.count;for(let O=I,U=I+P;O<U;O+=3)p(t.getX(O+0),t.getX(O+1),t.getX(O+2))}let S=new N,y=new N,E=new N,M=new N;function A(x){E.fromBufferAttribute(s,x),M.copy(E);let w=a[x];S.copy(w),S.sub(E.multiplyScalar(E.dot(w))).normalize(),y.crossVectors(M,w);let I=y.dot(l[x])<0?-1:1;o.setXYZW(x,S.x,S.y,S.z,I)}for(let x=0,w=v.length;x<w;++x){let C=v[x],I=C.start,P=C.count;for(let O=I,U=I+P;O<U;O+=3)A(t.getX(O+0)),A(t.getX(O+1)),A(t.getX(O+2))}this._transformed=!0}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==e.count)n=new wn(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let d=0,f=n.count;d<f;d++)n.setXYZ(d,0,0,0);let s=new N,r=new N,o=new N,a=new N,l=new N,c=new N,h=new N,u=new N;if(t)for(let d=0,f=t.count;d<f;d+=3){let g=t.getX(d+0),_=t.getX(d+1),m=t.getX(d+2);s.fromBufferAttribute(e,g),r.fromBufferAttribute(e,_),o.fromBufferAttribute(e,m),h.subVectors(o,r),u.subVectors(s,r),h.cross(u),a.fromBufferAttribute(n,g),l.fromBufferAttribute(n,_),c.fromBufferAttribute(n,m),a.add(h),l.add(h),c.add(h),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(_,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let d=0,f=e.count;d<f;d+=3)s.fromBufferAttribute(e,d+0),r.fromBufferAttribute(e,d+1),o.fromBufferAttribute(e,d+2),h.subVectors(o,r),u.subVectors(s,r),h.cross(u),n.setXYZ(d+0,h.x,h.y,h.z),n.setXYZ(d+1,h.x,h.y,h.z),n.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)je.fromBufferAttribute(t,e),je.normalize(),t.setXYZ(e,je.x,je.y,je.z)}toNonIndexed(){function t(a,l){let c=a.array,h=a.itemSize,u=a.normalized,d=new c.constructor(l.length*h),f=0,g=0;for(let _=0,m=l.length;_<m;_++){a.isInterleavedBufferAttribute?f=l[_]*a.data.stride+a.offset:f=l[_]*h;for(let p=0;p<h;p++)d[g++]=c[f++]}return new wn(d,h,u)}if(this.index===null)return Qt("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new i,n=this.index.array,s=this.attributes;for(let a in s){let l=s[a],c=t(l,n);e.setAttribute(a,c)}let r=this.morphAttributes;for(let a in r){let l=[],c=r[a];for(let h=0,u=c.length;h<u;h++){let d=c[h],f=t(d,n);l.push(f)}e.morphAttributes[a]=l}e.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let n=this.attributes;for(let l in n){let c=n[l];t.data.attributes[l]=c.toJSON(t.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let u=0,d=c.length;u<d;u++){let f=c[u];h.push(f.toJSON(t.data))}h.length>0&&(s[l]=h,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(t.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(t.data.boundingSphere=a.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let n=t.index;n!==null&&this.setIndex(n.clone());let s=t.attributes;for(let c in s){let h=s[c];this.setAttribute(c,h.clone(e))}let r=t.morphAttributes;for(let c in r){let h=[],u=r[c];for(let d=0,f=u.length;d<f;d++)h.push(u[d].clone(e));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;let o=t.groups;for(let c=0,h=o.length;c<h;c++){let u=o[c];this.addGroup(u.start,u.count,u.materialIndex)}let a=t.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}};var fc=new N,jf=new N,Qf=new re,Tn=class{constructor(t=new N(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,s){return this.normal.set(t,e,n),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){let s=fc.subVectors(n,e).cross(jf.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e,n=!0){let s=t.delta(fc),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let o=-(t.start.dot(this.normal)+this.constant)/r;return n===!0&&(o<0||o>1)?null:e.copy(t.start).addScaledVector(s,o)}intersectsLine(t){let e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let n=e||Qf.getNormalMatrix(t),s=this.coplanarPoint(fc).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(t){return this.normal.fromArray(t.normal),this.constant=t.constant,this}},tp=0,bi=class extends Jn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:tp++}),this.uuid=_s(),this.name="",this.type="Material",this.blending=sr,this.side=Xi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=kc,this.blendDst=zc,this.blendEquation=ms,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new jt(0,0,0),this.blendAlpha=0,this.depthFunc=Vs,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Xu,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=ia,this.stencilZFail=ia,this.stencilZPass=ia,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let n=t[e];if(n===void 0){Qt(`Material: parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){Qt(`Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let o=[];for(let a in r){let l=r[a];delete l.metadata,o.push(l)}return o}if(e){let r=s(t.textures),o=s(t.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}fromJSON(t,e){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new jt().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.retroreflectivity!==void 0&&(this.retroreflectivity=t.retroreflectivity),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=t.iridescenceThicknessRange),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.clippingPlanes!==void 0&&(this.clippingPlanes=t.clippingPlanes.map(n=>new Tn().fromJSON(n))),t.clipIntersection!==void 0&&(this.clipIntersection=t.clipIntersection),t.clipShadows!==void 0&&(this.clipShadows=t.clipShadows),t.depthPacking!==void 0&&(this.depthPacking=t.depthPacking),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.linecap!==void 0&&(this.linecap=t.linecap),t.linejoin!==void 0&&(this.linejoin=t.linejoin),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=e[t.map]||null),t.matcap!==void 0&&(this.matcap=e[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=e[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=e[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=e[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let n=t.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new at().fromArray(n)}return t.displacementMap!==void 0&&(this.displacementMap=e[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=e[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=e[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=e[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=e[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=e[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=e[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=e[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=e[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=e[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=e[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=e[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=e[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=e[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new at().fromArray(t.clearcoatNormalScale)),t.iridescenceMap!==void 0&&(this.iridescenceMap=e[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=e[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=e[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=e[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=e[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=e[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=e[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,n=null;if(e!==null){let s=e.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}};var yi=new N,pc=new N,Ho=new N,Vo=new N,hs=class{constructor(t=new N,e=new N(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,yi)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=yi.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(yi.copy(this.origin).addScaledVector(this.direction,e),yi.distanceToSquared(t))}distanceSqToSegment(t,e,n,s){pc.copy(t).add(e).multiplyScalar(.5),Ho.copy(e).sub(t).normalize(),Vo.copy(this.origin).sub(pc);let r=t.distanceTo(e)*.5,o=-this.direction.dot(Ho),a=Vo.dot(this.direction),l=-Vo.dot(Ho),c=Vo.lengthSq(),h=Math.abs(1-o*o),u,d,f,g;if(h>0)if(u=o*l-a,d=o*a-l,g=r*h,u>=0)if(d>=-g)if(d<=g){let _=1/h;u*=_,d*=_,f=u*(u+o*d+2*a)+d*(o*u+d+2*l)+c}else d=r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;else d=-r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;else d<=-g?(u=Math.max(0,-(-o*r+a)),d=u>0?-r:Math.min(Math.max(-r,-l),r),f=-u*u+d*(d+2*l)+c):d<=g?(u=0,d=Math.min(Math.max(-r,-l),r),f=d*(d+2*l)+c):(u=Math.max(0,-(o*r+a)),d=u>0?r:Math.min(Math.max(-r,-l),r),f=-u*u+d*(d+2*l)+c);else d=o>0?-r:r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(pc).addScaledVector(Ho,d),f}intersectSphere(t,e){if(t.radius<0)return null;yi.subVectors(t.center,this.origin);let n=yi.dot(this.direction),s=yi.dot(yi)-n*n,r=t.radius*t.radius;if(s>r)return null;let o=Math.sqrt(r-s),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,e):this.at(a,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){let n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,s,r,o,a,l,c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(t.min.x-d.x)*c,s=(t.max.x-d.x)*c):(n=(t.max.x-d.x)*c,s=(t.min.x-d.x)*c),h>=0?(r=(t.min.y-d.y)*h,o=(t.max.y-d.y)*h):(r=(t.max.y-d.y)*h,o=(t.min.y-d.y)*h),n>o||r>s||((r>n||isNaN(n))&&(n=r),(o<s||isNaN(s))&&(s=o),u>=0?(a=(t.min.z-d.z)*u,l=(t.max.z-d.z)*u):(a=(t.max.z-d.z)*u,l=(t.min.z-d.z)*u),n>l||a>s)||((a>n||n!==n)&&(n=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,e)}intersectsBox(t){return this.intersectBox(t,yi)!==null}intersectTriangle(t,e,n,s,r){let o=this.origin,a=this.direction,l=a.x,c=a.y,h=a.z,u=t.x-o.x,d=t.y-o.y,f=t.z-o.z,g=e.x-o.x,_=e.y-o.y,m=e.z-o.z,p=n.x-o.x,v=n.y-o.y,S=n.z-o.z,y=Math.abs(l),E=Math.abs(c),M=Math.abs(h),A,x,w,C,I,P,O,U,H,K,L,q;if(y>=E&&y>=M?(w=l,P=u,H=g,q=p,l>=0?(A=c,x=h,C=d,I=f,O=_,U=m,K=v,L=S):(A=h,x=c,C=f,I=d,O=m,U=_,K=S,L=v)):E>=M?(w=c,P=d,H=_,q=v,c>=0?(A=h,x=l,C=f,I=u,O=m,U=g,K=S,L=p):(A=l,x=h,C=u,I=f,O=g,U=m,K=p,L=S)):(w=h,P=f,H=m,q=S,h>=0?(A=l,x=c,C=u,I=d,O=g,U=_,K=p,L=v):(A=c,x=l,C=d,I=u,O=_,U=g,K=v,L=p)),w===0)return null;let X=A/w,z=x/w,G=1/w,pt=C-X*P,j=I-z*P,ht=O-X*H,dt=U-z*H,Mt=K-X*q,Y=L-z*q,nt=Mt*dt-Y*ht,_t=pt*Y-j*Mt,vt=ht*j-dt*pt;if(s){if(nt<0||_t<0||vt<0)return null}else if((nt<0||_t<0||vt<0)&&(nt>0||_t>0||vt>0))return null;let xt=nt+_t+vt;if(xt===0)return null;let Dt=G*(nt*P+_t*H+vt*q);return(xt>0?Dt<0:Dt>0)?null:this.at(Dt/xt,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Si=class extends bi{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new jt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new si,this.combine=Ha,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}},eu=new Se,rs=new hs,Go=new Fi,nu=new N,Wo=new N,Xo=new N,qo=new N,mc=new N,Yo=new N,iu=new N,Zo=new N,Ft=class extends We{constructor(t=new De,e=new Si){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(t,e){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;e.fromBufferAttribute(s,t);let a=this.morphTargetInfluences;if(r&&a){Yo.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let h=a[l],u=r[l];h!==0&&(mc.fromBufferAttribute(u,t),o?Yo.addScaledVector(mc,h):Yo.addScaledVector(mc.sub(e),h))}e.add(Yo)}return e}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Go.copy(n.boundingSphere),Go.applyMatrix4(r),rs.copy(t.ray).recast(t.near),!(Go.containsPoint(rs.origin)===!1&&(rs.intersectSphere(Go,nu)===null||rs.origin.distanceToSquared(nu)>(t.far-t.near)**2))&&(eu.copy(r).invert(),rs.copy(t.ray).applyMatrix4(eu),!(n.boundingBox!==null&&rs.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,rs)))}_computeIntersections(t,e,n){let s,r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,d=r.groups,f=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,_=d.length;g<_;g++){let m=d[g],p=o[m.materialIndex],v=Math.max(m.start,f.start),S=Math.min(a.count,Math.min(m.start+m.count,f.start+f.count));for(let y=v,E=S;y<E;y+=3){let M=a.getX(y),A=a.getX(y+1),x=a.getX(y+2);s=Jo(this,p,t,n,c,h,u,M,A,x),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{let g=Math.max(0,f.start),_=Math.min(a.count,f.start+f.count);for(let m=g,p=_;m<p;m+=3){let v=a.getX(m),S=a.getX(m+1),y=a.getX(m+2);s=Jo(this,o,t,n,c,h,u,v,S,y),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,_=d.length;g<_;g++){let m=d[g],p=o[m.materialIndex],v=Math.max(m.start,f.start),S=Math.min(l.count,Math.min(m.start+m.count,f.start+f.count));for(let y=v,E=S;y<E;y+=3){let M=y,A=y+1,x=y+2;s=Jo(this,p,t,n,c,h,u,M,A,x),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{let g=Math.max(0,f.start),_=Math.min(l.count,f.start+f.count);for(let m=g,p=_;m<p;m+=3){let v=m,S=m+1,y=m+2;s=Jo(this,o,t,n,c,h,u,v,S,y),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}}};function ep(i,t,e,n,s,r,o,a){let l;if(t.side===Xe?l=n.intersectTriangle(o,r,s,!0,a):l=n.intersectTriangle(s,r,o,t.side===Xi,a),l===null)return null;Zo.copy(a),Zo.applyMatrix4(i.matrixWorld);let c=e.ray.origin.distanceTo(Zo);return c<e.near||c>e.far?null:{distance:c,point:Zo.clone(),object:i}}function Jo(i,t,e,n,s,r,o,a,l,c){i.getVertexPosition(a,Wo),i.getVertexPosition(l,Xo),i.getVertexPosition(c,qo);let h=ep(i,t,e,n,Wo,Xo,qo,iu);if(h){let u=new N;Ni.getBarycoord(iu,Wo,Xo,qo,u),s&&(h.uv=Ni.getInterpolatedAttribute(s,a,l,c,u,new at)),r&&(h.uv1=Ni.getInterpolatedAttribute(r,a,l,c,u,new at)),o&&(h.normal=Ni.getInterpolatedAttribute(o,a,l,c,u,new N),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));let d={a,b:l,c,normal:new N,materialIndex:0};Ni.getNormal(Wo,Xo,qo,d.normal),h.face=d,h.barycoord=u}return h}var zr=class extends gn{constructor(t=null,e=1,n=1,s,r,o,a,l,c=tn,h=tn,u,d){super(null,o,a,l,c,h,s,r,u,d),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Hr=class extends wn{constructor(t,e,n,s=1){super(t,e,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){let t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}},Fs=new Se,su=new Se,$o=[],ru=new ri,np=new Se,wr=new Ft,Ar=new Fi,Vr=class extends Ft{constructor(t,e,n){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new Hr(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,np)}computeBoundingBox(){let t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new ri),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,Fs),ru.copy(t.boundingBox).applyMatrix4(Fs),this.boundingBox.union(ru)}computeBoundingSphere(){let t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new Fi),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,Fs),Ar.copy(t.boundingSphere).applyMatrix4(Fs),this.boundingSphere.union(Ar)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){return this.instanceColor===null?e.setRGB(1,1,1):e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){return e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){let n=e.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,o=t*r+1;for(let a=0;a<n.length;a++)n[a]=s[o+a]}raycast(t,e){let n=this.matrixWorld,s=this.count;if(wr.geometry=this.geometry,wr.material=this.material,wr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Ar.copy(this.boundingSphere),Ar.applyMatrix4(n),t.ray.intersectsSphere(Ar)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,Fs),su.multiplyMatrices(n,Fs),wr.matrixWorld=su,wr.raycast(t,$o);for(let o=0,a=$o.length;o<a;o++){let l=$o[o];l.instanceId=r,l.object=this,e.push(l)}$o.length=0}}setColorAt(t,e){return this.instanceColor===null&&(this.instanceColor=new Hr(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3),this}setMatrixAt(t,e){return e.toArray(this.instanceMatrix.array,t*16),this}setMorphAt(t,e){let n=e.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new zr(new Float32Array(s*this.count),s,this.count,Ya,kn));let r=this.morphTexture.source.data.data,o=0;for(let c=0;c<n.length;c++)o+=n[c];let a=this.geometry.morphTargetsRelative?1:1-o,l=s*t;return r[l]=a,r.set(n,l+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},os=new Fi,ip=new at(.5,.5),Ko=new N,$s=class{constructor(t=new Tn,e=new Tn,n=new Tn,s=new Tn,r=new Tn,o=new Tn){this.planes=[t,e,n,s,r,o]}set(t,e,n,s,r,o){let a=this.planes;return a[0].copy(t),a[1].copy(e),a[2].copy(n),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(t){let e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=Zn,n=!1){let s=this.planes,r=t.elements,o=r[0],a=r[1],l=r[2],c=r[3],h=r[4],u=r[5],d=r[6],f=r[7],g=r[8],_=r[9],m=r[10],p=r[11],v=r[12],S=r[13],y=r[14],E=r[15];if(s[0].setComponents(c-o,f-h,p-g,E-v).normalize(),s[1].setComponents(c+o,f+h,p+g,E+v).normalize(),s[2].setComponents(c+a,f+u,p+_,E+S).normalize(),s[3].setComponents(c-a,f-u,p-_,E-S).normalize(),n)s[4].setComponents(l,d,m,y).normalize(),s[5].setComponents(c-l,f-d,p-m,E-y).normalize();else if(s[4].setComponents(c-l,f-d,p-m,E-y).normalize(),e===Zn)s[5].setComponents(c+l,f+d,p+m,E+y).normalize();else if(e===Ws)s[5].setComponents(l,d,m,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),os.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),os.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(os)}intersectsSprite(t){os.center.set(0,0,0);let e=ip.distanceTo(t.center);return os.radius=.7071067811865476+e,os.applyMatrix4(t.matrixWorld),this.intersectsSphere(os)}intersectsSphere(t){let e=this.planes,n=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(t){let e=this.planes;for(let n=0;n<6;n++){let s=e[n];if(Ko.x=s.normal.x>0?t.max.x:t.min.x,Ko.y=s.normal.y>0?t.max.y:t.min.y,Ko.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(Ko)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var Gr=class extends gn{constructor(t=[],e=qi,n,s,r,o,a,l,c,h){super(t,e,n,s,r,o,a,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},Wr=class extends gn{constructor(t,e,n,s,r,o,a,l,c){super(t,e,n,s,r,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}};var Oi=class extends gn{constructor(t,e,n=Kn,s,r,o,a=tn,l=tn,c,h=ii,u=1){if(h!==ii&&h!==Zi)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let d={width:t,height:e,depth:u};super(d,s,r,o,a,l,h,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new qs(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return e.compareFunction=this.compareFunction,e}},ga=class extends Oi{constructor(t,e=Kn,n=qi,s,r,o=tn,a=tn,l,c=ii){let h={width:t,height:t,depth:1},u=[h,h,h,h,h,h];super(t,t,e,n,s,r,o,a,l,c),this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}},Xr=class extends gn{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}},xn=class i extends De{constructor(t=1,e=1,n=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:s,heightSegments:r,depthSegments:o};let a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);let l=[],c=[],h=[],u=[],d=0,f=0;g("z","y","x",-1,-1,n,e,t,o,r,0),g("z","y","x",1,-1,n,e,-t,o,r,1),g("x","z","y",1,1,t,n,e,s,o,2),g("x","z","y",1,-1,t,n,-e,s,o,3),g("x","y","z",1,-1,t,e,n,s,r,4),g("x","y","z",-1,-1,t,e,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new ue(c,3)),this.setAttribute("normal",new ue(h,3)),this.setAttribute("uv",new ue(u,2));function g(_,m,p,v,S,y,E,M,A,x,w){let C=y/A,I=E/x,P=y/2,O=E/2,U=M/2,H=A+1,K=x+1,L=0,q=0,X=new N;for(let z=0;z<K;z++){let G=z*I-O;for(let pt=0;pt<H;pt++){let j=pt*C-P;X[_]=j*v,X[m]=G*S,X[p]=U,c.push(X.x,X.y,X.z),X[_]=0,X[m]=0,X[p]=M>0?1:-1,h.push(X.x,X.y,X.z),u.push(pt/A),u.push(1-z/x),L+=1}}for(let z=0;z<x;z++)for(let G=0;G<A;G++){let pt=d+G+H*z,j=d+G+H*(z+1),ht=d+(G+1)+H*(z+1),dt=d+(G+1)+H*z;l.push(pt,j,dt),l.push(j,ht,dt),q+=6}a.addGroup(f,q,w),f+=q,d+=L}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};var Me=class i extends De{constructor(t=1,e=1,n=1,s=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};let c=this;s=Math.floor(s),r=Math.floor(r);let h=[],u=[],d=[],f=[],g=0,_=[],m=n/2,p=0;v(),o===!1&&(t>0&&S(!0),e>0&&S(!1)),this.setIndex(h),this.setAttribute("position",new ue(u,3)),this.setAttribute("normal",new ue(d,3)),this.setAttribute("uv",new ue(f,2));function v(){let y=new N,E=new N,M=0,A=(e-t)/n;for(let x=0;x<=r;x++){let w=[],C=x/r,I=C*(e-t)+t;for(let P=0;P<=s;P++){let O=P/s,U=O*l+a,H=Math.sin(U),K=Math.cos(U);E.x=I*H,E.y=-C*n+m,E.z=I*K,u.push(E.x,E.y,E.z),y.set(H,A,K).normalize(),d.push(y.x,y.y,y.z),f.push(O,1-C),w.push(g++)}_.push(w)}for(let x=0;x<s;x++)for(let w=0;w<r;w++){let C=_[w][x],I=_[w+1][x],P=_[w+1][x+1],O=_[w][x+1];(t>0||w!==0)&&(h.push(C,I,O),M+=3),(e>0||w!==r-1)&&(h.push(I,P,O),M+=3)}c.addGroup(p,M,0),p+=M}function S(y){let E=g,M=new at,A=new N,x=0,w=y===!0?t:e,C=y===!0?1:-1;for(let P=1;P<=s;P++)u.push(0,m*C,0),d.push(0,C,0),f.push(.5,.5),g++;let I=g;for(let P=0;P<=s;P++){let U=P/s*l+a,H=Math.cos(U),K=Math.sin(U);A.x=w*K,A.y=m*C,A.z=w*H,u.push(A.x,A.y,A.z),d.push(0,C,0),M.x=H*.5+.5,M.y=K*.5*C+.5,f.push(M.x,M.y),g++}for(let P=0;P<s;P++){let O=E+P,U=I+P;y===!0?h.push(U,U+1,O):h.push(U+1,U,O),x+=3}c.addGroup(p,x,y===!0?1:2),p+=x}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}};var _a=class i extends De{constructor(t=[],e=[],n=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:n,detail:s};let r=[],o=[];a(s),c(n),h(),this.setAttribute("position",new ue(r,3)),this.setAttribute("normal",new ue(r.slice(),3)),this.setAttribute("uv",new ue(o,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function a(v){let S=new N,y=new N,E=new N;for(let M=0;M<e.length;M+=3)f(e[M+0],S),f(e[M+1],y),f(e[M+2],E),l(S,y,E,v)}function l(v,S,y,E){let M=E+1,A=[];for(let x=0;x<=M;x++){A[x]=[];let w=v.clone().lerp(y,x/M),C=S.clone().lerp(y,x/M),I=M-x;for(let P=0;P<=I;P++)P===0&&x===M?A[x][P]=w:A[x][P]=w.clone().lerp(C,P/I)}for(let x=0;x<M;x++)for(let w=0;w<2*(M-x)-1;w++){let C=Math.floor(w/2);w%2===0?(d(A[x][C+1]),d(A[x+1][C]),d(A[x][C])):(d(A[x][C+1]),d(A[x+1][C+1]),d(A[x+1][C]))}}function c(v){let S=new N;for(let y=0;y<r.length;y+=3)S.x=r[y+0],S.y=r[y+1],S.z=r[y+2],S.normalize().multiplyScalar(v),r[y+0]=S.x,r[y+1]=S.y,r[y+2]=S.z}function h(){let v=new N;for(let S=0;S<r.length;S+=3){v.x=r[S+0],v.y=r[S+1],v.z=r[S+2];let y=m(v)/2/Math.PI+.5,E=p(v)/Math.PI+.5;o.push(y,1-E)}g(),u()}function u(){for(let v=0;v<o.length;v+=6){let S=o[v+0],y=o[v+2],E=o[v+4],M=Math.max(S,y,E),A=Math.min(S,y,E);M>.9&&A<.1&&(S<.2&&(o[v+0]+=1),y<.2&&(o[v+2]+=1),E<.2&&(o[v+4]+=1))}}function d(v){r.push(v.x,v.y,v.z)}function f(v,S){let y=v*3;S.x=t[y+0],S.y=t[y+1],S.z=t[y+2]}function g(){let v=new N,S=new N,y=new N,E=new N,M=new at,A=new at,x=new at;for(let w=0,C=0;w<r.length;w+=9,C+=6){v.set(r[w+0],r[w+1],r[w+2]),S.set(r[w+3],r[w+4],r[w+5]),y.set(r[w+6],r[w+7],r[w+8]),M.set(o[C+0],o[C+1]),A.set(o[C+2],o[C+3]),x.set(o[C+4],o[C+5]),E.copy(v).add(S).add(y).divideScalar(3);let I=m(E);_(M,C+0,v,I),_(A,C+2,S,I),_(x,C+4,y,I)}}function _(v,S,y,E){E<0&&v.x===1&&(o[S]=v.x-1),y.x===0&&y.z===0&&(o[S]=E/2/Math.PI+.5)}function m(v){return Math.atan2(v.z,-v.x)}function p(v){return Math.atan2(-v.y,Math.sqrt(v.x*v.x+v.z*v.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.vertices,t.indices,t.radius,t.detail)}},Ks=class i extends _a{constructor(t=1,e=0){let n=(1+Math.sqrt(5))/2,s=1/n,r=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-s,-n,0,-s,n,0,s,-n,0,s,n,-s,-n,0,-s,n,0,s,-n,0,s,n,0,-n,0,-s,n,0,-s,-n,0,s,n,0,s],o=[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9];super(r,o,t,e),this.type="DodecahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new i(t.radius,t.detail)}};var Rn=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){Qt("Curve: .getPoint() not implemented.")}getPointAt(t,e){let n=this.getUtoTmapping(t);return this.getPoint(n,e)}getPoints(t=5){let e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return e}getSpacedPoints(t=5){let e=[];for(let n=0;n<=t;n++)e.push(this.getPointAt(n/t));return e}getLength(){let t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let e=[],n,s=this.getPoint(0),r=0;e.push(0);for(let o=1;o<=t;o++)n=this.getPoint(o/t),r+=n.distanceTo(s),e.push(r),s=n;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e=null){let n=this.getLengths(),s=0,r=n.length,o;e?o=e:o=t*n[r-1];let a=0,l=r-1,c;for(;a<=l;)if(s=Math.floor(a+(l-a)/2),c=n[s]-o,c<0)a=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,n[s]===o)return s/(r-1);let h=n[s],d=n[s+1]-h,f=(o-h)/d;return(s+f)/(r-1)}getTangent(t,e){let s=t-1e-4,r=t+1e-4;s<0&&(s=0),r>1&&(r=1);let o=this.getPoint(s),a=this.getPoint(r),l=e||(o.isVector2?new at:new N);return l.copy(a).sub(o).normalize(),l}getTangentAt(t,e){let n=this.getUtoTmapping(t);return this.getTangent(n,e)}computeFrenetFrames(t,e=!1){let n=new N,s=[],r=[],o=[],a=new N,l=new Se;for(let f=0;f<=t;f++){let g=f/t;s[f]=this.getTangentAt(g,new N)}r[0]=new N,o[0]=new N;let c=Number.MAX_VALUE,h=Math.abs(s[0].x),u=Math.abs(s[0].y),d=Math.abs(s[0].z);h<=c&&(c=h,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),d<=c&&n.set(0,0,1),a.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],a),o[0].crossVectors(s[0],r[0]);for(let f=1;f<=t;f++){if(r[f]=r[f-1].clone(),o[f]=o[f-1].clone(),a.crossVectors(s[f-1],s[f]),a.length()>Number.EPSILON){a.normalize();let g=Math.acos(oe(s[f-1].dot(s[f]),-1,1));r[f].applyMatrix4(l.makeRotationAxis(a,g))}o[f].crossVectors(s[f],r[f])}if(e===!0){let f=Math.acos(oe(r[0].dot(r[t]),-1,1));f/=t,s[0].dot(a.crossVectors(r[0],r[t]))>0&&(f=-f);for(let g=1;g<=t;g++)r[g].applyMatrix4(l.makeRotationAxis(s[g],f*g)),o[g].crossVectors(s[g],r[g])}return{tangents:s,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){let t={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}},js=class extends Rn{constructor(t=0,e=0,n=1,s=1,r=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(t,e=new at){let n=e,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(o?r=0:r=s),this.aClockwise===!0&&!o&&(r===s?r=-s:r=r-s);let a=this.aStartAngle+t*r,l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),d=l-this.aX,f=c-this.aY;l=d*h-f*u+this.aX,c=d*u+f*h+this.aY}return n.set(l,c)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){let t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}},xa=class extends js{constructor(t,e,n,s,r,o){super(t,e,n,n,s,r,o),this.isArcCurve=!0,this.type="ArcCurve"}};function sh(){let i=0,t=0,e=0,n=0;function s(r,o,a,l){i=r,t=a,e=-3*r+3*o-2*a-l,n=2*r-2*o+a+l}return{initCatmullRom:function(r,o,a,l,c){s(o,a,c*(a-r),c*(l-o))},initNonuniformCatmullRom:function(r,o,a,l,c,h,u){let d=(o-r)/c-(a-r)/(c+h)+(a-o)/h,f=(a-o)/h-(l-o)/(h+u)+(l-a)/u;d*=h,f*=h,s(o,a,d,f)},calc:function(r){let o=r*r,a=o*r;return i+t*r+e*o+n*a}}}var ou=new N,au=new N,gc=new sh,_c=new sh,xc=new sh,ya=class extends Rn{constructor(t=[],e=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=n,this.tension=s}getPoint(t,e=new N){let n=e,s=this.points,r=s.length,o=(r-(this.closed?0:1))*t,a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:l===0&&a===r-1&&(a=r-2,l=1);let c,h;this.closed||a>0?c=s[(a-1)%r]:(au.subVectors(s[0],s[1]).add(s[0]),c=au);let u=s[a%r],d=s[(a+1)%r];if(this.closed||a+2<r?h=s[(a+2)%r]:(ou.subVectors(s[r-1],s[r-2]).add(s[r-1]),h=ou),this.curveType==="centripetal"||this.curveType==="chordal"){let f=this.curveType==="chordal"?.5:.25,g=Math.pow(c.distanceToSquared(u),f),_=Math.pow(u.distanceToSquared(d),f),m=Math.pow(d.distanceToSquared(h),f);_<1e-4&&(_=1),g<1e-4&&(g=_),m<1e-4&&(m=_),gc.initNonuniformCatmullRom(c.x,u.x,d.x,h.x,g,_,m),_c.initNonuniformCatmullRom(c.y,u.y,d.y,h.y,g,_,m),xc.initNonuniformCatmullRom(c.z,u.z,d.z,h.z,g,_,m)}else this.curveType==="catmullrom"&&(gc.initCatmullRom(c.x,u.x,d.x,h.x,this.tension),_c.initCatmullRom(c.y,u.y,d.y,h.y,this.tension),xc.initCatmullRom(c.z,u.z,d.z,h.z,this.tension));return n.set(gc.calc(l),_c.calc(l),xc.calc(l)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(s.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){let s=this.points[e];t.points.push(s.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(new N().fromArray(s))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}};function lu(i,t,e,n,s){let r=(n-t)*.5,o=(s-e)*.5,a=i*i,l=i*a;return(2*e-2*n+r+o)*l+(-3*e+3*n-2*r-o)*a+r*i+e}function sp(i,t){let e=1-i;return e*e*t}function rp(i,t){return 2*(1-i)*i*t}function op(i,t){return i*i*t}function Ir(i,t,e,n){return sp(i,t)+rp(i,e)+op(i,n)}function ap(i,t){let e=1-i;return e*e*e*t}function lp(i,t){let e=1-i;return 3*e*e*i*t}function cp(i,t){return 3*(1-i)*i*i*t}function hp(i,t){return i*i*i*t}function Lr(i,t,e,n,s){return ap(i,t)+lp(i,e)+cp(i,n)+hp(i,s)}var qr=class extends Rn{constructor(t=new at,e=new at,n=new at,s=new at){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new at){let n=e,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(Lr(t,s.x,r.x,o.x,a.x),Lr(t,s.y,r.y,o.y,a.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},va=class extends Rn{constructor(t=new N,e=new N,n=new N,s=new N){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new N){let n=e,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(Lr(t,s.x,r.x,o.x,a.x),Lr(t,s.y,r.y,o.y,a.y),Lr(t,s.z,r.z,o.z,a.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},Yr=class extends Rn{constructor(t=new at,e=new at){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new at){let n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new at){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},ba=class extends Rn{constructor(t=new N,e=new N){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new N){let n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new N){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Zr=class extends Rn{constructor(t=new at,e=new at,n=new at){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new at){let n=e,s=this.v0,r=this.v1,o=this.v2;return n.set(Ir(t,s.x,r.x,o.x),Ir(t,s.y,r.y,o.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Sa=class extends Rn{constructor(t=new N,e=new N,n=new N){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new N){let n=e,s=this.v0,r=this.v1,o=this.v2;return n.set(Ir(t,s.x,r.x,o.x),Ir(t,s.y,r.y,o.y),Ir(t,s.z,r.z,o.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Jr=class extends Rn{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new at){let n=e,s=this.points,r=(s.length-1)*t,o=Math.floor(r),a=r-o,l=s[o===0?o:o-1],c=s[o],h=s[o>s.length-2?s.length-1:o+1],u=s[o>s.length-3?s.length-1:o+2];return n.set(lu(a,l.x,c.x,h.x,u.x),lu(a,l.y,c.y,h.y,u.y)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(s.clone())}return this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){let s=this.points[e];t.points.push(s.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(new at().fromArray(s))}return this}},Tc=Object.freeze({__proto__:null,ArcCurve:xa,CatmullRomCurve3:ya,CubicBezierCurve:qr,CubicBezierCurve3:va,EllipseCurve:js,LineCurve:Yr,LineCurve3:ba,QuadraticBezierCurve:Zr,QuadraticBezierCurve3:Sa,SplineCurve:Jr}),Ma=class extends Rn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(t){this.curves.push(t)}closePath(){let t=this.curves[0].getPoint(0),e=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(e)){let n=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Tc[n](e,t))}return this}getPoint(t,e){let n=t*this.getLength(),s=this.getCurveLengths(),r=0;for(;r<s.length;){if(s[r]>=n){let o=s[r]-n,a=this.curves[r],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,e)}r++}return null}getLength(){let t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let t=[],e=0;for(let n=0,s=this.curves.length;n<s;n++)e+=this.curves[n].getLength(),t.push(e);return this.cacheLengths=t,t}getSpacedPoints(t=40){let e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return this.autoClose&&e.push(e[0]),e}getPoints(t=12){let e=[],n;for(let s=0,r=this.curves;s<r.length;s++){let o=r[s],a=o.isEllipseCurve?t*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?t*o.points.length:t,l=o.getPoints(a);for(let c=0;c<l.length;c++){let h=l[c];n&&n.equals(h)||(e.push(h),n=h)}}return this.autoClose&&e.length>1&&!e[e.length-1].equals(e[0])&&e.push(e[0]),e}copy(t){super.copy(t),this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){let s=t.curves[e];this.curves.push(s.clone())}return this.autoClose=t.autoClose,this}toJSON(){let t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let e=0,n=this.curves.length;e<n;e++){let s=this.curves[e];t.curves.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){let s=t.curves[e];this.curves.push(new Tc[s.type]().fromJSON(s))}return this}},us=class extends Ma{constructor(t){super(),this.type="Path",this.currentPoint=new at,t&&this.setFromPoints(t)}setFromPoints(t){this.moveTo(t[0].x,t[0].y);for(let e=1,n=t.length;e<n;e++)this.lineTo(t[e].x,t[e].y);return this}moveTo(t,e){return this.currentPoint.set(t,e),this}lineTo(t,e){let n=new Yr(this.currentPoint.clone(),new at(t,e));return this.curves.push(n),this.currentPoint.set(t,e),this}quadraticCurveTo(t,e,n,s){let r=new Zr(this.currentPoint.clone(),new at(t,e),new at(n,s));return this.curves.push(r),this.currentPoint.set(n,s),this}bezierCurveTo(t,e,n,s,r,o){let a=new qr(this.currentPoint.clone(),new at(t,e),new at(n,s),new at(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(t){let e=[this.currentPoint.clone()].concat(t),n=new Jr(e);return this.curves.push(n),this.currentPoint.copy(t[t.length-1]),this}arc(t,e,n,s,r,o){let a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(t+a,e+l,n,s,r,o),this}absarc(t,e,n,s,r,o){return this.absellipse(t,e,n,n,s,r,o),this}ellipse(t,e,n,s,r,o,a,l){let c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(t+c,e+h,n,s,r,o,a,l),this}absellipse(t,e,n,s,r,o,a,l){let c=new js(t,e,n,s,r,o,a,l);if(this.curves.length>0){let u=c.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(c);let h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(t){return super.copy(t),this.currentPoint.copy(t.currentPoint),this}toJSON(){let t=super.toJSON();return t.currentPoint=this.currentPoint.toArray(),t}fromJSON(t){return super.fromJSON(t),this.currentPoint.fromArray(t.currentPoint),this}},Qs=class extends us{constructor(t){super(t),this.uuid=_s(),this.type="Shape",this.holes=[]}getPointsHoles(t){let e=[];for(let n=0,s=this.holes.length;n<s;n++)e[n]=this.holes[n].getPoints(t);return e}extractPoints(t){return{shape:this.getPoints(t),holes:this.getPointsHoles(t)}}copy(t){super.copy(t),this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){let s=t.holes[e];this.holes.push(s.clone())}return this}toJSON(){let t=super.toJSON();t.uuid=this.uuid,t.holes=[];for(let e=0,n=this.holes.length;e<n;e++){let s=this.holes[e];t.holes.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.uuid=t.uuid,this.holes=[];for(let e=0,n=t.holes.length;e<n;e++){let s=t.holes[e];this.holes.push(new us().fromJSON(s))}return this}};function up(i,t,e=2){let n=t&&t.length,s=n?t[0]*e:i.length,r=sd(i,0,s,e,!0),o=[];if(!r||r.next===r.prev)return o;let a,l,c;if(n&&(r=gp(i,t,r,e)),i.length>80*e){a=i[0],l=i[1];let h=a,u=l;for(let d=e;d<s;d+=e){let f=i[d],g=i[d+1];f<a&&(a=f),g<l&&(l=g),f>h&&(h=f),g>u&&(u=g)}c=Math.max(h-a,u-l),c=c!==0?32767/c:0}return $r(r,o,e,a,l,c,0),o}function sd(i,t,e,n,s){let r;if(s===Ap(i,t,e,n)>0)for(let o=t;o<e;o+=n)r=cu(o/n|0,i[o],i[o+1],r);else for(let o=e-n;o>=t;o-=n)r=cu(o/n|0,i[o],i[o+1],r);return r&&tr(r,r.next)&&(jr(r),r=r.next),r}function ds(i,t){if(!i)return i;t||(t=i);let e=i,n;do if(n=!1,!e.steiner&&(tr(e,e.next)||Ie(e.prev,e,e.next)===0)){if(jr(e),e=t=e.prev,e===e.next)break;n=!0}else e=e.next;while(n||e!==t);return t}function $r(i,t,e,n,s,r,o){if(!i)return;!o&&r&&bp(i,n,s,r);let a=i;for(;i.prev!==i.next;){let l=i.prev,c=i.next;if(r?fp(i,n,s,r):dp(i)){t.push(l.i,i.i,c.i),jr(i),i=c.next,a=c.next;continue}if(i=c,i===a){o?o===1?(i=pp(ds(i),t),$r(i,t,e,n,s,r,2)):o===2&&mp(i,t,e,n,s,r):$r(ds(i),t,e,n,s,r,1);break}}}function dp(i){let t=i.prev,e=i,n=i.next;if(Ie(t,e,n)>=0)return!1;let s=t.x,r=e.x,o=n.x,a=t.y,l=e.y,c=n.y,h=Math.min(s,r,o),u=Math.min(a,l,c),d=Math.max(s,r,o),f=Math.max(a,l,c),g=n.next;for(;g!==t;){if(g.x>=h&&g.x<=d&&g.y>=u&&g.y<=f&&Rr(s,a,r,l,o,c,g.x,g.y)&&Ie(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function fp(i,t,e,n){let s=i.prev,r=i,o=i.next;if(Ie(s,r,o)>=0)return!1;let a=s.x,l=r.x,c=o.x,h=s.y,u=r.y,d=o.y,f=Math.min(a,l,c),g=Math.min(h,u,d),_=Math.max(a,l,c),m=Math.max(h,u,d),p=wc(f,g,t,e,n),v=wc(_,m,t,e,n),S=i.prevZ,y=i.nextZ;for(;S&&S.z>=p&&y&&y.z<=v;){if(S.x>=f&&S.x<=_&&S.y>=g&&S.y<=m&&S!==s&&S!==o&&Rr(a,h,l,u,c,d,S.x,S.y)&&Ie(S.prev,S,S.next)>=0||(S=S.prevZ,y.x>=f&&y.x<=_&&y.y>=g&&y.y<=m&&y!==s&&y!==o&&Rr(a,h,l,u,c,d,y.x,y.y)&&Ie(y.prev,y,y.next)>=0))return!1;y=y.nextZ}for(;S&&S.z>=p;){if(S.x>=f&&S.x<=_&&S.y>=g&&S.y<=m&&S!==s&&S!==o&&Rr(a,h,l,u,c,d,S.x,S.y)&&Ie(S.prev,S,S.next)>=0)return!1;S=S.prevZ}for(;y&&y.z<=v;){if(y.x>=f&&y.x<=_&&y.y>=g&&y.y<=m&&y!==s&&y!==o&&Rr(a,h,l,u,c,d,y.x,y.y)&&Ie(y.prev,y,y.next)>=0)return!1;y=y.nextZ}return!0}function pp(i,t){let e=i;do{let n=e.prev,s=e.next.next;!tr(n,s)&&od(n,e,e.next,s)&&Kr(n,s)&&Kr(s,n)&&(t.push(n.i,e.i,s.i),jr(e),jr(e.next),e=i=s),e=e.next}while(e!==i);return ds(e)}function mp(i,t,e,n,s,r){let o=i;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&Ep(o,a)){let l=ad(o,a);o=ds(o,o.next),l=ds(l,l.next),$r(o,t,e,n,s,r,0),$r(l,t,e,n,s,r,0);return}a=a.next}o=o.next}while(o!==i)}function gp(i,t,e,n){let s=[];for(let r=0,o=t.length;r<o;r++){let a=t[r]*n,l=r<o-1?t[r+1]*n:i.length,c=sd(i,a,l,n,!1);c===c.next&&(c.steiner=!0),s.push(Mp(c))}s.sort(_p);for(let r=0;r<s.length;r++)e=xp(s[r],e);return e}function _p(i,t){let e=i.x-t.x;if(e===0&&(e=i.y-t.y,e===0)){let n=(i.next.y-i.y)/(i.next.x-i.x),s=(t.next.y-t.y)/(t.next.x-t.x);e=n-s}return e}function xp(i,t){let e=yp(i,t);if(!e)return t;let n=ad(e,i);return ds(n,n.next),ds(e,e.next)}function yp(i,t){let e=t,n=i.x,s=i.y,r=-1/0,o;if(tr(i,e))return e;do{if(tr(i,e.next))return e.next;if(s<=e.y&&s>=e.next.y&&e.next.y!==e.y){let u=e.x+(s-e.y)*(e.next.x-e.x)/(e.next.y-e.y);if(u<=n&&u>r&&(r=u,o=e.x<e.next.x?e:e.next,u===n))return o}e=e.next}while(e!==t);if(!o)return null;let a=o,l=o.x,c=o.y,h=1/0;e=o;do{if(n>=e.x&&e.x>=l&&n!==e.x&&rd(s<c?n:r,s,l,c,s<c?r:n,s,e.x,e.y)){let u=Math.abs(s-e.y)/(n-e.x);Kr(e,i)&&(u<h||u===h&&(e.x>o.x||e.x===o.x&&vp(o,e)))&&(o=e,h=u)}e=e.next}while(e!==a);return o}function vp(i,t){return Ie(i.prev,i,t.prev)<0&&Ie(t.next,i,i.next)<0}function bp(i,t,e,n){let s=i;do s.z===0&&(s.z=wc(s.x,s.y,t,e,n)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==i);s.prevZ.nextZ=null,s.prevZ=null,Sp(s)}function Sp(i){let t,e=1;do{let n=i,s;i=null;let r=null;for(t=0;n;){t++;let o=n,a=0;for(let c=0;c<e&&(a++,o=o.nextZ,!!o);c++);let l=e;for(;a>0||l>0&&o;)a!==0&&(l===0||!o||n.z<=o.z)?(s=n,n=n.nextZ,a--):(s=o,o=o.nextZ,l--),r?r.nextZ=s:i=s,s.prevZ=r,r=s;n=o}r.nextZ=null,e*=2}while(t>1);return i}function wc(i,t,e,n,s){return i=(i-e)*s|0,t=(t-n)*s|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,i|t<<1}function Mp(i){let t=i,e=i;do(t.x<e.x||t.x===e.x&&t.y<e.y)&&(e=t),t=t.next;while(t!==i);return e}function rd(i,t,e,n,s,r,o,a){return(s-o)*(t-a)>=(i-o)*(r-a)&&(i-o)*(n-a)>=(e-o)*(t-a)&&(e-o)*(r-a)>=(s-o)*(n-a)}function Rr(i,t,e,n,s,r,o,a){return!(i===o&&t===a)&&rd(i,t,e,n,s,r,o,a)}function Ep(i,t){return i.next.i!==t.i&&i.prev.i!==t.i&&!Tp(i,t)&&(Kr(i,t)&&Kr(t,i)&&wp(i,t)&&(Ie(i.prev,i,t.prev)||Ie(i,t.prev,t))||tr(i,t)&&Ie(i.prev,i,i.next)>0&&Ie(t.prev,t,t.next)>0)}function Ie(i,t,e){return(t.y-i.y)*(e.x-t.x)-(t.x-i.x)*(e.y-t.y)}function tr(i,t){return i.x===t.x&&i.y===t.y}function od(i,t,e,n){let s=Qo(Ie(i,t,e)),r=Qo(Ie(i,t,n)),o=Qo(Ie(e,n,i)),a=Qo(Ie(e,n,t));return!!(s!==r&&o!==a||s===0&&jo(i,e,t)||r===0&&jo(i,n,t)||o===0&&jo(e,i,n)||a===0&&jo(e,t,n))}function jo(i,t,e){return t.x<=Math.max(i.x,e.x)&&t.x>=Math.min(i.x,e.x)&&t.y<=Math.max(i.y,e.y)&&t.y>=Math.min(i.y,e.y)}function Qo(i){return i>0?1:i<0?-1:0}function Tp(i,t){let e=i;do{if(e.i!==i.i&&e.next.i!==i.i&&e.i!==t.i&&e.next.i!==t.i&&od(e,e.next,i,t))return!0;e=e.next}while(e!==i);return!1}function Kr(i,t){return Ie(i.prev,i,i.next)<0?Ie(i,t,i.next)>=0&&Ie(i,i.prev,t)>=0:Ie(i,t,i.prev)<0||Ie(i,i.next,t)<0}function wp(i,t){let e=i,n=!1,s=(i.x+t.x)/2,r=(i.y+t.y)/2;do e.y>r!=e.next.y>r&&e.next.y!==e.y&&s<(e.next.x-e.x)*(r-e.y)/(e.next.y-e.y)+e.x&&(n=!n),e=e.next;while(e!==i);return n}function ad(i,t){let e=Ac(i.i,i.x,i.y),n=Ac(t.i,t.x,t.y),s=i.next,r=t.prev;return i.next=t,t.prev=i,e.next=s,s.prev=e,n.next=e,e.prev=n,r.next=n,n.prev=r,n}function cu(i,t,e,n){let s=Ac(i,t,e);return n?(s.next=n.next,s.prev=n,n.next.prev=s,n.next=s):(s.prev=s,s.next=s),s}function jr(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function Ac(i,t,e){return{i,x:t,y:e,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function Ap(i,t,e,n){let s=0;for(let r=t,o=e-n;r<e;r+=n)s+=(i[o]-i[r])*(i[r+1]+i[o+1]),o=r;return s}var Rc=class{static triangulate(t,e,n=2){return up(t,e,n)}},as=class i{static area(t){let e=t.length,n=0;for(let s=e-1,r=0;r<e;s=r++)n+=t[s].x*t[r].y-t[r].x*t[s].y;return n*.5}static isClockWise(t){return i.area(t)<0}static triangulateShape(t,e){let n=[],s=[],r=[];hu(t),uu(n,t);let o=t.length;e.forEach(hu);for(let l=0;l<e.length;l++)s.push(o),o+=e[l].length,uu(n,e[l]);let a=Rc.triangulate(n,s);for(let l=0;l<a.length;l+=3)r.push(a.slice(l,l+3));return r}};function hu(i){let t=i.length;t>2&&i[t-1].equals(i[0])&&i.pop()}function uu(i,t){for(let e=0;e<t.length;e++)i.push(t[e].x),i.push(t[e].y)}var Qr=class i extends De{constructor(t=new Qs([new at(.5,.5),new at(-.5,.5),new at(-.5,-.5),new at(.5,-.5)]),e={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:t,options:e},t=Array.isArray(t)?t:[t];let n=this,s=[],r=[];for(let a=0,l=t.length;a<l;a++){let c=t[a];o(c)}this.setAttribute("position",new ue(s,3)),this.setAttribute("uv",new ue(r,2)),this.computeVertexNormals();function o(a){let l=[],c=e.curveSegments!==void 0?e.curveSegments:12,h=e.steps!==void 0?e.steps:1,u=e.depth!==void 0?e.depth:1,d=e.bevelEnabled!==void 0?e.bevelEnabled:!0,f=e.bevelThickness!==void 0?e.bevelThickness:.2,g=e.bevelSize!==void 0?e.bevelSize:f-.1,_=e.bevelOffset!==void 0?e.bevelOffset:0,m=e.bevelSegments!==void 0?e.bevelSegments:3,p=e.extrudePath,v=e.UVGenerator!==void 0?e.UVGenerator:Rp,S,y=!1,E,M,A,x;if(p){S=p.getSpacedPoints(h),y=!0,d=!1;let ot=p.isCatmullRomCurve3?p.closed:!1;E=p.computeFrenetFrames(h,ot),M=new N,A=new N,x=new N}d||(m=0,f=0,g=0,_=0);let w=a.extractPoints(c),C=w.shape,I=w.holes;if(!as.isClockWise(C)){C=C.reverse();for(let ot=0,ut=I.length;ot<ut;ot++){let mt=I[ot];as.isClockWise(mt)&&(I[ot]=mt.reverse())}}function O(ot){let mt=10000000000000001e-36,gt=ot[0];for(let Et=1;Et<=ot.length;Et++){let Kt=Et%ot.length,lt=ot[Kt],Bt=lt.x-gt.x,Wt=lt.y-gt.y,D=Bt*Bt+Wt*Wt,ee=Math.max(Math.abs(lt.x),Math.abs(lt.y),Math.abs(gt.x),Math.abs(gt.y)),ie=mt*ee*ee;if(D<=ie){ot.splice(Kt,1),Et--;continue}gt=lt}}O(C),I.forEach(O);let U=I.length,H=C;for(let ot=0;ot<U;ot++){let ut=I[ot];C=C.concat(ut)}function K(ot,ut,mt){return ut||ne("ExtrudeGeometry: vec does not exist"),ot.clone().addScaledVector(ut,mt)}let L=C.length;function q(ot,ut,mt){let gt,Et,Kt,lt=ot.x-ut.x,Bt=ot.y-ut.y,Wt=mt.x-ot.x,D=mt.y-ot.y,ee=lt*lt+Bt*Bt,ie=lt*D-Bt*Wt;if(Math.abs(ie)>Number.EPSILON){let R=Math.sqrt(ee),b=Math.sqrt(Wt*Wt+D*D),V=ut.x-Bt/R,Z=ut.y+lt/R,et=mt.x-D/b,yt=mt.y+Wt/b,wt=((et-V)*D-(yt-Z)*Wt)/(lt*D-Bt*Wt);gt=V+lt*wt-ot.x,Et=Z+Bt*wt-ot.y;let tt=gt*gt+Et*Et;if(tt<=2)return new at(gt,Et);Kt=Math.sqrt(tt/2)}else{let R=!1;lt>Number.EPSILON?Wt>Number.EPSILON&&(R=!0):lt<-Number.EPSILON?Wt<-Number.EPSILON&&(R=!0):Math.sign(Bt)===Math.sign(D)&&(R=!0),R?(gt=-Bt,Et=lt,Kt=Math.sqrt(ee)):(gt=lt,Et=Bt,Kt=Math.sqrt(ee/2))}return new at(gt/Kt,Et/Kt)}let X=[];for(let ot=0,ut=H.length,mt=ut-1,gt=ot+1;ot<ut;ot++,mt++,gt++)mt===ut&&(mt=0),gt===ut&&(gt=0),X[ot]=q(H[ot],H[mt],H[gt]);let z=[],G,pt=X.concat();for(let ot=0,ut=U;ot<ut;ot++){let mt=I[ot];G=[];for(let gt=0,Et=mt.length,Kt=Et-1,lt=gt+1;gt<Et;gt++,Kt++,lt++)Kt===Et&&(Kt=0),lt===Et&&(lt=0),G[gt]=q(mt[gt],mt[Kt],mt[lt]);z.push(G),pt=pt.concat(G)}let j;if(m===0)j=as.triangulateShape(H,I);else{let ot=[],ut=[];for(let mt=0;mt<m;mt++){let gt=mt/m,Et=f*Math.cos(gt*Math.PI/2),Kt=g*Math.sin(gt*Math.PI/2)+_;for(let lt=0,Bt=H.length;lt<Bt;lt++){let Wt=K(H[lt],X[lt],Kt);_t(Wt.x,Wt.y,-Et),gt===0&&ot.push(Wt)}for(let lt=0,Bt=U;lt<Bt;lt++){let Wt=I[lt];G=z[lt];let D=[];for(let ee=0,ie=Wt.length;ee<ie;ee++){let R=K(Wt[ee],G[ee],Kt);_t(R.x,R.y,-Et),gt===0&&D.push(R)}gt===0&&ut.push(D)}}j=as.triangulateShape(ot,ut)}let ht=j.length,dt=g+_;for(let ot=0;ot<L;ot++){let ut=d?K(C[ot],pt[ot],dt):C[ot];y?(A.copy(E.normals[0]).multiplyScalar(ut.x),M.copy(E.binormals[0]).multiplyScalar(ut.y),x.copy(S[0]).add(A).add(M),_t(x.x,x.y,x.z)):_t(ut.x,ut.y,0)}for(let ot=1;ot<=h;ot++)for(let ut=0;ut<L;ut++){let mt=d?K(C[ut],pt[ut],dt):C[ut];y?(A.copy(E.normals[ot]).multiplyScalar(mt.x),M.copy(E.binormals[ot]).multiplyScalar(mt.y),x.copy(S[ot]).add(A).add(M),_t(x.x,x.y,x.z)):_t(mt.x,mt.y,u/h*ot)}for(let ot=m-1;ot>=0;ot--){let ut=ot/m,mt=f*Math.cos(ut*Math.PI/2),gt=g*Math.sin(ut*Math.PI/2)+_;for(let Et=0,Kt=H.length;Et<Kt;Et++){let lt=K(H[Et],X[Et],gt);_t(lt.x,lt.y,u+mt)}for(let Et=0,Kt=I.length;Et<Kt;Et++){let lt=I[Et];G=z[Et];for(let Bt=0,Wt=lt.length;Bt<Wt;Bt++){let D=K(lt[Bt],G[Bt],gt);y?_t(D.x,D.y+S[h-1].y,S[h-1].x+mt):_t(D.x,D.y,u+mt)}}}Mt(),Y();function Mt(){let ot=s.length/3;if(d){let ut=0,mt=L*ut;for(let gt=0;gt<ht;gt++){let Et=j[gt];vt(Et[2]+mt,Et[1]+mt,Et[0]+mt)}ut=h+m*2,mt=L*ut;for(let gt=0;gt<ht;gt++){let Et=j[gt];vt(Et[0]+mt,Et[1]+mt,Et[2]+mt)}}else{for(let ut=0;ut<ht;ut++){let mt=j[ut];vt(mt[2],mt[1],mt[0])}for(let ut=0;ut<ht;ut++){let mt=j[ut];vt(mt[0]+L*h,mt[1]+L*h,mt[2]+L*h)}}n.addGroup(ot,s.length/3-ot,0)}function Y(){let ot=s.length/3,ut=0;nt(H,ut),ut+=H.length;for(let mt=0,gt=I.length;mt<gt;mt++){let Et=I[mt];nt(Et,ut),ut+=Et.length}n.addGroup(ot,s.length/3-ot,1)}function nt(ot,ut){let mt=ot.length;for(;--mt>=0;){let gt=mt,Et=mt-1;Et<0&&(Et=ot.length-1);for(let Kt=0,lt=h+m*2;Kt<lt;Kt++){let Bt=L*Kt,Wt=L*(Kt+1),D=ut+gt+Bt,ee=ut+Et+Bt,ie=ut+Et+Wt,R=ut+gt+Wt;xt(D,ee,ie,R)}}}function _t(ot,ut,mt){l.push(ot),l.push(ut),l.push(mt)}function vt(ot,ut,mt){Dt(ot),Dt(ut),Dt(mt);let gt=s.length/3,Et=v.generateTopUV(n,s,gt-3,gt-2,gt-1);te(Et[0]),te(Et[1]),te(Et[2])}function xt(ot,ut,mt,gt){Dt(ot),Dt(ut),Dt(gt),Dt(ut),Dt(mt),Dt(gt);let Et=s.length/3,Kt=v.generateSideWallUV(n,s,Et-6,Et-3,Et-2,Et-1);te(Kt[0]),te(Kt[1]),te(Kt[3]),te(Kt[1]),te(Kt[2]),te(Kt[3])}function Dt(ot){s.push(l[ot*3+0]),s.push(l[ot*3+1]),s.push(l[ot*3+2])}function te(ot){r.push(ot.x),r.push(ot.y)}}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON(),e=this.parameters.shapes,n=this.parameters.options;return Cp(e,n,t)}static fromJSON(t,e){let n=[];for(let r=0,o=t.shapes.length;r<o;r++){let a=e[t.shapes[r]];n.push(a)}let s=t.options.extrudePath;return s!==void 0&&(t.options.extrudePath=new Tc[s.type]().fromJSON(s)),new i(n,t.options)}},Rp={generateTopUV:function(i,t,e,n,s){let r=t[e*3],o=t[e*3+1],a=t[n*3],l=t[n*3+1],c=t[s*3],h=t[s*3+1];return[new at(r,o),new at(a,l),new at(c,h)]},generateSideWallUV:function(i,t,e,n,s,r){let o=t[e*3],a=t[e*3+1],l=t[e*3+2],c=t[n*3],h=t[n*3+1],u=t[n*3+2],d=t[s*3],f=t[s*3+1],g=t[s*3+2],_=t[r*3],m=t[r*3+1],p=t[r*3+2];return Math.abs(a-h)<Math.abs(o-c)?[new at(o,1-l),new at(c,1-u),new at(d,1-g),new at(_,1-p)]:[new at(a,1-l),new at(h,1-u),new at(f,1-g),new at(m,1-p)]}};function Cp(i,t,e){if(e.shapes=[],Array.isArray(i))for(let n=0,s=i.length;n<s;n++){let r=i[n];e.shapes.push(r.uuid)}else e.shapes.push(i.uuid);return e.options=Object.assign({},t),t.extrudePath!==void 0&&(e.options.extrudePath=t.extrudePath.toJSON()),e}var to=class i extends De{constructor(t=[new at(0,-.5),new at(.5,0),new at(0,.5)],e=12,n=0,s=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:t,segments:e,phiStart:n,phiLength:s},e=Math.floor(e),s=oe(s,0,Math.PI*2);let r=[],o=[],a=[],l=[],c=[],h=1/e,u=new N,d=new at,f=new N,g=new N,_=new N,m=0,p=0;for(let v=0;v<=t.length-1;v++)switch(v){case 0:m=t[v+1].x-t[v].x,p=t[v+1].y-t[v].y,f.x=p*1,f.y=-m,f.z=p*0,_.copy(f),f.normalize(),l.push(f.x,f.y,f.z);break;case t.length-1:l.push(_.x,_.y,_.z);break;default:m=t[v+1].x-t[v].x,p=t[v+1].y-t[v].y,f.x=p*1,f.y=-m,f.z=p*0,g.copy(f),f.x+=_.x,f.y+=_.y,f.z+=_.z,f.normalize(),l.push(f.x,f.y,f.z),_.copy(g)}for(let v=0;v<=e;v++){let S=n+v*h*s,y=Math.sin(S),E=Math.cos(S);for(let M=0;M<=t.length-1;M++){u.x=t[M].x*y,u.y=t[M].y,u.z=t[M].x*E,o.push(u.x,u.y,u.z),d.x=v/e,d.y=M/(t.length-1),a.push(d.x,d.y);let A=l[3*M+0]*y,x=l[3*M+1],w=l[3*M+0]*E;c.push(A,x,w)}}for(let v=0;v<e;v++)for(let S=0;S<t.length-1;S++){let y=S+v*t.length,E=y,M=y+t.length,A=y+t.length+1,x=y+1;r.push(E,M,x),r.push(A,x,M)}this.setIndex(r),this.setAttribute("position",new ue(o,3)),this.setAttribute("uv",new ue(a,2)),this.setAttribute("normal",new ue(c,3))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.points,t.segments,t.phiStart,t.phiLength)}};var Bn=class i extends De{constructor(t=1,e=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:s};let r=t/2,o=e/2,a=Math.floor(n),l=Math.floor(s),c=a+1,h=l+1,u=t/a,d=e/l,f=[],g=[],_=[],m=[];for(let p=0;p<h;p++){let v=p*d-o;for(let S=0;S<c;S++){let y=S*u-r;g.push(y,-v,0),_.push(0,0,1),m.push(S/a),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let v=0;v<a;v++){let S=v+c*p,y=v+c*(p+1),E=v+1+c*(p+1),M=v+1+c*p;f.push(S,y,M),f.push(y,E,M)}this.setIndex(f),this.setAttribute("position",new ue(g,3)),this.setAttribute("normal",new ue(_,3)),this.setAttribute("uv",new ue(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.widthSegments,t.heightSegments)}};var oi=class i extends De{constructor(t=1,e=32,n=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));let l=Math.min(o+a,Math.PI),c=0,h=[],u=new N,d=new N,f=[],g=[],_=[],m=[];for(let p=0;p<=n;p++){let v=[],S=p/n,y=o+S*a,E=t*Math.cos(y),M=Math.sqrt(t*t-E*E),A=0;p===0&&o===0?A=.5/e:p===n&&l===Math.PI&&(A=-.5/e);for(let x=0;x<=e;x++){let w=x/e,C=s+w*r;u.x=-M*Math.cos(C),u.y=E,u.z=M*Math.sin(C),g.push(u.x,u.y,u.z),d.copy(u).normalize(),_.push(d.x,d.y,d.z),m.push(w+A,1-S),v.push(c++)}h.push(v)}for(let p=0;p<n;p++)for(let v=0;v<e;v++){let S=h[p][v+1],y=h[p][v],E=h[p+1][v],M=h[p+1][v+1];(p!==0||o>0)&&f.push(S,y,M),(p!==n-1||l<Math.PI)&&f.push(y,E,M)}this.setIndex(f),this.setAttribute("position",new ue(g,3)),this.setAttribute("normal",new ue(_,3)),this.setAttribute("uv",new ue(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};var sn=class i extends De{constructor(t=1,e=.4,n=12,s=48,r=Math.PI*2,o=0,a=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:n,tubularSegments:s,arc:r,thetaStart:o,thetaLength:a},n=Math.floor(n),s=Math.floor(s);let l=[],c=[],h=[],u=[],d=new N,f=new N,g=new N;for(let _=0;_<=n;_++){let m=o+_/n*a;for(let p=0;p<=s;p++){let v=p/s*r;f.x=(t+e*Math.cos(m))*Math.cos(v),f.y=(t+e*Math.cos(m))*Math.sin(v),f.z=e*Math.sin(m),c.push(f.x,f.y,f.z),d.x=t*Math.cos(v),d.y=t*Math.sin(v),g.subVectors(f,d).normalize(),h.push(g.x,g.y,g.z),u.push(p/s),u.push(_/n)}}for(let _=1;_<=n;_++)for(let m=1;m<=s;m++){let p=(s+1)*_+m-1,v=(s+1)*(_-1)+m-1,S=(s+1)*(_-1)+m,y=(s+1)*_+m;l.push(p,v,y),l.push(v,S,y)}this.setIndex(l),this.setAttribute("position",new ue(c,3)),this.setAttribute("normal",new ue(h,3)),this.setAttribute("uv",new ue(u,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc,t.thetaStart,t.thetaLength)}};function xs(i){let t={};for(let e in i){t[e]={};for(let n in i[e]){let s=i[e][n];if(du(s))s.isRenderTargetTexture?(Qt("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=s.clone();else if(Array.isArray(s))if(du(s[0])){let r=[];for(let o=0,a=s.length;o<a;o++)r[o]=s[o].clone();t[e][n]=r}else t[e][n]=s.slice();else t[e][n]=s}}return t}function cn(i){let t={};for(let e=0;e<i.length;e++){let n=xs(i[e]);for(let s in n)t[s]=n[s]}return t}function du(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function Pp(i){let t=[];for(let e=0;e<i.length;e++)t.push(i[e].clone());return t}function rh(i){let t=i.getRenderTarget();return t===null?i.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:he.workingColorSpace}var ld={clone:xs,merge:cn},Ip=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Lp=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,Cn=class extends bi{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Ip,this.fragmentShader=Lp,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=xs(t.uniforms),this.uniformsGroups=Pp(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let s in this.uniforms){let o=this.uniforms[s].value;o&&o.isTexture?e.uniforms[s]={type:"t",value:o.toJSON(t).uuid}:o&&o.isColor?e.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?e.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?e.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?e.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?e.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?e.uniforms[s]={type:"m4",value:o.toArray()}:e.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}fromJSON(t,e){if(super.fromJSON(t,e),t.uniforms!==void 0)for(let n in t.uniforms){let s=t.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=e[s.value]||null;break;case"c":this.uniforms[n].value=new jt().setHex(s.value);break;case"v2":this.uniforms[n].value=new at().fromArray(s.value);break;case"v3":this.uniforms[n].value=new N().fromArray(s.value);break;case"v4":this.uniforms[n].value=new Pe().fromArray(s.value);break;case"m3":this.uniforms[n].value=new re().fromArray(s.value);break;case"m4":this.uniforms[n].value=new Se().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(let n in t.extensions)this.extensions[n]=t.extensions[n];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}},Ea=class extends Cn{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},xe=class extends bi{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new jt(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new jt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=yo,this.normalScale=new at(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new si,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}},Mi=class extends xe{constructor(t){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new at(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return oe(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(e){this.ior=(1+.4*e)/(1-.4*e)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new jt(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new jt(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new jt(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(t)}get anisotropy(){return this._anisotropy}set anisotropy(t){this._anisotropy>0!=t>0&&this.version++,this._anisotropy=t}get clearcoat(){return this._clearcoat}set clearcoat(t){this._clearcoat>0!=t>0&&this.version++,this._clearcoat=t}get iridescence(){return this._iridescence}set iridescence(t){this._iridescence>0!=t>0&&this.version++,this._iridescence=t}get dispersion(){return this._dispersion}set dispersion(t){this._dispersion>0!=t>0&&this.version++,this._dispersion=t}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(t){this._retroreflectivity>0!=t>0&&this.version++,this._retroreflectivity=t}get sheen(){return this._sheen}set sheen(t){this._sheen>0!=t>0&&this.version++,this._sheen=t}get transmission(){return this._transmission}set transmission(t){this._transmission>0!=t>0&&this.version++,this._transmission=t}copy(t){return super.copy(t),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=t.anisotropy,this.anisotropyRotation=t.anisotropyRotation,this.anisotropyMap=t.anisotropyMap,this.clearcoat=t.clearcoat,this.clearcoatMap=t.clearcoatMap,this.clearcoatRoughness=t.clearcoatRoughness,this.clearcoatRoughnessMap=t.clearcoatRoughnessMap,this.clearcoatNormalMap=t.clearcoatNormalMap,this.clearcoatNormalScale.copy(t.clearcoatNormalScale),this.dispersion=t.dispersion,this.ior=t.ior,this.iridescence=t.iridescence,this.iridescenceMap=t.iridescenceMap,this.iridescenceIOR=t.iridescenceIOR,this.iridescenceThicknessRange=[...t.iridescenceThicknessRange],this.iridescenceThicknessMap=t.iridescenceThicknessMap,this.retroreflectivity=t.retroreflectivity,this.sheen=t.sheen,this.sheenColor.copy(t.sheenColor),this.sheenColorMap=t.sheenColorMap,this.sheenRoughness=t.sheenRoughness,this.sheenRoughnessMap=t.sheenRoughnessMap,this.transmission=t.transmission,this.transmissionMap=t.transmissionMap,this.thickness=t.thickness,this.thicknessMap=t.thicknessMap,this.attenuationDistance=t.attenuationDistance,this.attenuationColor.copy(t.attenuationColor),this.specularIntensity=t.specularIntensity,this.specularIntensityMap=t.specularIntensityMap,this.specularColor.copy(t.specularColor),this.specularColorMap=t.specularColorMap,this}};var eo=class extends bi{constructor(t){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new jt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new jt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=yo,this.normalScale=new at(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new si,this.combine=Ha,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.envMapIntensity=t.envMapIntensity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}},Ta=class extends bi{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Gu,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},wa=class extends bi{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}};function Os(i,t){return!i||i.constructor===t?i:typeof t.BYTES_PER_ELEMENT=="number"?new t(i):Array.prototype.slice.call(i)}function yc(i){return i!==void 0&&i.inTangents!==void 0&&i.outTangents!==void 0}var Bi=class{constructor(t,e,n,s){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new e.constructor(n),this.sampleValues=e,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,n=this._cachedIndex,s=e[n],r=e[n-1];n:{t:{let o;e:{i:if(!(t<s)){for(let a=n+2;;){if(s===void 0){if(t<r)break i;return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(r=s,s=e[++n],t<s)break t}o=e.length;break e}if(!(t>=r)){let a=e[1];t<a&&(n=2,r=a);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=e[--n-1],t>=r)break t}o=n,n=0;break e}break n}for(;n<o;){let a=n+o>>>1;t<e[a]?o=a:n=a+1}if(s=e[n],r=e[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,t,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=t*s;for(let o=0;o!==s;++o)e[o]=n[r+o];return e}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},Aa=class extends Bi{constructor(t,e,n,s){super(t,e,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Sc,endingEnd:Sc}}intervalChanged_(t,e,n){let s=this.parameterPositions,r=t-2,o=t+1,a=s[r],l=s[o];if(a===void 0)switch(this.getSettings_().endingStart){case Mc:r=t,a=2*e-n;break;case Ec:r=s.length-2,a=e+s[r]-s[r+1];break;default:r=t,a=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Mc:o=t,l=2*n-e;break;case Ec:o=1,l=n+s[1]-s[0];break;default:o=t-1,l=e}let c=(n-e)*.5,h=this.valueSize;this._weightPrev=c/(e-a),this._weightNext=c/(l-n),this._offsetPrev=r*h,this._offsetNext=o*h}interpolate_(t,e,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,h=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,g=(n-e)/(s-e),_=g*g,m=_*g,p=-d*m+2*d*_-d*g,v=(1+d)*m+(-1.5-2*d)*_+(-.5+d)*g+1,S=(-1-f)*m+(1.5+f)*_+.5*g,y=f*m-f*_;for(let E=0;E!==a;++E)r[E]=p*o[h+E]+v*o[c+E]+S*o[l+E]+y*o[u+E];return r}},Ra=class extends Bi{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,h=(n-e)/(s-e),u=1-h;for(let d=0;d!==a;++d)r[d]=o[c+d]*u+o[l+d]*h;return r}},Ca=class extends Bi{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t){return this.copySampleValue_(t-1)}},Pa=class extends Bi{interpolate_(t,e,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,h=this.inTangents,u=this.outTangents;if(!h||!u){let g=(n-e)/(s-e),_=1-g;for(let m=0;m!==a;++m)r[m]=o[c+m]*_+o[l+m]*g;return r}let d=a*2,f=t-1;for(let g=0;g!==a;++g){let _=o[c+g],m=o[l+g],p=f*d+g*2,v=u[p],S=u[p+1],y=t*d+g*2,E=h[y],M=h[y+1],A=Np(n,e,v,E,s);r[g]=cd(A,_,S,M,m)}return r}};function cd(i,t,e,n,s){let r=1-i;return r*r*r*t+3*r*r*i*e+3*r*i*i*n+i*i*i*s}function Dp(i,t,e,n,s){let r=1-i;return 3*r*r*(e-t)+6*r*i*(n-e)+3*i*i*(s-n)}function Np(i,t,e,n,s){let r=(i-t)/(s-t);for(let o=0;o<8;o++){let a=cd(r,t,e,n,s)-i;if(Math.abs(a)<1e-10)break;let l=Dp(r,t,e,n,s);if(Math.abs(l)<1e-10)break;r=Math.max(0,Math.min(1,r-a/l))}return r}var Pn=class{constructor(t,e,n,s){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=Os(e,this.TimeBufferType),this.values=Os(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,n;if(e.toJSON!==this.toJSON)n=e.toJSON(t);else{n={name:t.name,times:Os(t.times,Array),values:Os(t.values,Array)};let s=t.getInterpolation();s!==t.DefaultInterpolation&&(n.interpolation=s),yc(t.settings)&&(n.settings={inTangents:Os(t.settings.inTangents,Array),outTangents:Os(t.settings.outTangents,Array)})}return n.type=t.ValueTypeName,n}InterpolantFactoryMethodDiscrete(t){return new Ca(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new Ra(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new Aa(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodBezier(t){let e=new Pa(this.times,this.values,this.getValueSize(),t);return this.settings&&(e.inTangents=this.settings.inTangents,e.outTangents=this.settings.outTangents),e}setInterpolation(t){let e;switch(t){case Dr:e=this.InterpolantFactoryMethodDiscrete;break;case da:e=this.InterpolantFactoryMethodLinear;break;case na:e=this.InterpolantFactoryMethodSmooth;break;case bc:e=this.InterpolantFactoryMethodBezier;break}if(e===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return Qt("KeyframeTrack:",n),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Dr;case this.InterpolantFactoryMethodLinear:return da;case this.InterpolantFactoryMethodSmooth:return na;case this.InterpolantFactoryMethodBezier:return bc}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]+=t}return this}scale(t){if(t!==1){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]*=t;yc(this.settings)&&(fu(this.settings.inTangents,t),fu(this.settings.outTangents,t))}return this}trim(t,e){let n=this.times,s=n.length,r=0,o=s-1;for(;r!==s&&n[r]<t;)++r;for(;o!==-1&&n[o]>e;)--o;if(++o,r!==0||o!==s){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=n.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(ne("KeyframeTrack: Invalid value size in track.",this),t=!1);let n=this.times,s=this.values,r=n.length;r===0&&(ne("KeyframeTrack: Track is empty.",this),t=!1);let o=null;for(let a=0;a!==r;a++){let l=n[a];if(typeof l=="number"&&isNaN(l)){ne("KeyframeTrack: Time is not a valid number.",this,a,l),t=!1;break}if(o!==null&&o>l){ne("KeyframeTrack: Out of order keys.",this,a,l,o),t=!1;break}o=l}if(s!==void 0&&Sf(s))for(let a=0,l=s.length;a!==l;++a){let c=s[a];if(isNaN(c)){ne("KeyframeTrack: Value is not a valid number.",this,a,c),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===na,r=t.length-1,o=1;for(let a=1;a<r;++a){let l=!1,c=t[a],h=t[a+1];if(c!==h&&(a!==1||c!==t[0]))if(s)l=!0;else{let u=a*n,d=u-n,f=u+n;for(let g=0;g!==n;++g){let _=e[u+g];if(_!==e[d+g]||_!==e[f+g]){l=!0;break}}}if(l){if(a!==o){t[o]=t[a];let u=a*n,d=o*n;for(let f=0;f!==n;++f)e[d+f]=e[u+f]}++o}}if(r>0){t[o]=t[r];for(let a=r*n,l=o*n,c=0;c!==n;++c)e[l+c]=e[a+c];++o}return o!==t.length?(this.times=t.slice(0,o),this.values=e.slice(0,o*n)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),n=this.constructor,s=new n(this.name,t,e);return s.createInterpolant=this.createInterpolant,yc(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};function fu(i,t){for(let e=0,n=i.length;e!==n;e+=2)i[e]*=t}Pn.prototype.ValueTypeName="";Pn.prototype.TimeBufferType=Float32Array;Pn.prototype.ValueBufferType=Float32Array;Pn.prototype.DefaultInterpolation=da;var ki=class extends Pn{constructor(t,e,n){super(t,e,n)}};ki.prototype.ValueTypeName="bool";ki.prototype.ValueBufferType=Array;ki.prototype.DefaultInterpolation=Dr;ki.prototype.InterpolantFactoryMethodLinear=void 0;ki.prototype.InterpolantFactoryMethodSmooth=void 0;var Ia=class extends Pn{constructor(t,e,n,s){super(t,e,n,s)}};Ia.prototype.ValueTypeName="color";var La=class extends Pn{constructor(t,e,n,s){super(t,e,n,s)}};La.prototype.ValueTypeName="number";var Da=class extends Bi{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(n-e)/(s-e),c=t*a;for(let h=c+a;c!==h;c+=4)An.slerpFlat(r,0,o,c-a,o,c,l);return r}},no=class extends Pn{constructor(t,e,n,s){super(t,e,n,s)}InterpolantFactoryMethodLinear(t){return new Da(this.times,this.values,this.getValueSize(),t)}};no.prototype.ValueTypeName="quaternion";no.prototype.InterpolantFactoryMethodSmooth=void 0;var zi=class extends Pn{constructor(t,e,n){super(t,e,n)}};zi.prototype.ValueTypeName="string";zi.prototype.ValueBufferType=Array;zi.prototype.DefaultInterpolation=Dr;zi.prototype.InterpolantFactoryMethodLinear=void 0;zi.prototype.InterpolantFactoryMethodSmooth=void 0;var Na=class extends Pn{constructor(t,e,n,s){super(t,e,n,s)}};Na.prototype.ValueTypeName="vector";var Ua=class{constructor(t,e,n){let s=this,r=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=n,this._abortController=null,this.itemStart=function(h){a++,r===!1&&s.onStart!==void 0&&s.onStart(h,o,a),r=!0},this.itemEnd=function(h){o++,s.onProgress!==void 0&&s.onProgress(h,o,a),o===a&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){let u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,d=c.length;u<d;u+=2){let f=c[u],g=c[u+1];if(f.global&&(f.lastIndex=0),f.test(h))return g}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},hd=new Ua,Fa=class{constructor(t){this.manager=t!==void 0?t:hd,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__!="undefined"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(t,e){let n=this;return new Promise(function(s,r){n.load(t,s,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}abort(){return this}};Fa.DEFAULT_MATERIAL_NAME="__DEFAULT";var fs=class extends We{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new jt(t),this.intensity=e}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,e}},io=class extends fs{constructor(t,e,n){super(t,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(We.DEFAULT_UP),this.updateMatrix(),this.groundColor=new jt(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}toJSON(t){let e=super.toJSON(t);return e.object.groundColor=this.groundColor.getHex(),e}},vc=new Se,pu=new N,mu=new N,er=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new at(512,512),this.mapType=yn,this.map=null,this.mapPass=null,this.matrix=new Se,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new $s,this._frameExtents=new at(1,1),this._viewportCount=1,this._viewports=[new Pe(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera;pu.setFromMatrixPosition(t.matrixWorld),e.position.copy(pu),mu.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(mu),e.updateMatrixWorld(),this._updateMatrix(e,this.matrix,this._frustum)}_updateMatrix(t,e,n,s){vc.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),n.setFromProjectionMatrix(vc,t.coordinateSystem,t.reversedDepth);let r=this._frameExtents,o=s?s.z/r.x:1,a=s?s.w/r.y:1,l=s?s.x/r.x:0,c=s?s.y/r.y:0;t.coordinateSystem===Ws||t.reversedDepth?e.set(.5*o,0,0,.5*o+l,0,.5*a,0,.5*a+c,0,0,1,0,0,0,0,1):e.set(.5*o,0,0,.5*o+l,0,.5*a,0,.5*a+c,0,0,.5,.5,0,0,0,1),e.multiply(vc)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return t.intensity=this.intensity,t.bias=this.bias,t.normalBias=this.normalBias,t.radius=this.radius,t.blurSamples=this.blurSamples,t.mapSize=this.mapSize.toArray(),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}},ta=new N,ea=new An,ei=new N,so=class extends We{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Se,this.projectionMatrix=new Se,this.projectionMatrixInverse=new Se,this.coordinateSystem=Zn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose(ta,ea,ei),ei.x===1&&ei.y===1&&ei.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(ta,ea,ei.set(1,1,1)).invert()}updateWorldMatrix(t,e,n=!1){super.updateWorldMatrix(t,e,n),this.matrixWorld.decompose(ta,ea,ei),ei.x===1&&ei.y===1&&ei.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(ta,ea,ei.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Di=new N,gu=new at,_u=new at,qe=class extends so{constructor(t=50,e=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=cs*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(Cr*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return cs*2*Math.atan(Math.tan(Cr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){Di.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(Di.x,Di.y).multiplyScalar(-t/Di.z),Di.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Di.x,Di.y).multiplyScalar(-t/Di.z)}getViewSize(t,e){return this.getViewBounds(t,gu,_u),e.subVectors(_u,gu)}setViewOffset(t,e,n,s,r,o){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(Cr*.5*this.fov)/this.zoom,n=2*e,s=this.aspect*n,r=-.5*s,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*s/l,e-=o.offsetY*n/c,s*=o.width/l,n*=o.height/c}let a=this.filmOffset;a!==0&&(r+=t*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-n,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}},Cc=class extends er{constructor(){super(new qe(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(t){let e=this.camera,n=cs*2*t.angle*this.focus,s=this.mapSize.width/this.mapSize.height*this.aspect,r=t.distance||e.far;(n!==e.fov||s!==e.aspect||r!==e.far)&&(e.fov=n,e.aspect=s,e.far=r,e.updateProjectionMatrix()),super.updateMatrices(t)}copy(t){return super.copy(t),this.focus=t.focus,this.aspect=t.aspect,this}toJSON(){let t=super.toJSON();return t.focus=this.focus,t.aspect=this.aspect,t}},ro=class extends fs{constructor(t,e,n=0,s=Math.PI/3,r=0,o=2){super(t,e),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(We.DEFAULT_UP),this.updateMatrix(),this.target=new We,this.distance=n,this.angle=s,this.penumbra=r,this.decay=o,this.map=null,this.shadow=new Cc}get power(){return this.intensity*Math.PI}set power(t){this.intensity=t/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.angle=t.angle,this.penumbra=t.penumbra,this.decay=t.decay,this.target=t.target.clone(),this.map=t.map,this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.distance=this.distance,e.object.angle=this.angle,e.object.decay=this.decay,e.object.penumbra=this.penumbra,e.object.target=this.target.uuid,this.map&&this.map.isTexture&&(e.object.map=this.map.toJSON(t).uuid),e.object.shadow=this.shadow.toJSON(),e}},Pc=class extends er{constructor(){super(new qe(90,1,.5,500)),this.isPointLightShadow=!0}},oo=class extends fs{constructor(t,e,n=0,s=2){super(t,e),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new Pc}get power(){return this.intensity*4*Math.PI}set power(t){this.intensity=t/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.decay=t.decay,this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.distance=this.distance,e.object.decay=this.decay,e.object.shadow=this.shadow.toJSON(),e}},nr=class extends so{constructor(t=-1,e=1,n=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-t,o=n+t,a=s+e,l=s-e;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=h*this.view.offsetY,l=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}},Ic=class extends er{constructor(){super(new nr(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Hi=class extends fs{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(We.DEFAULT_UP),this.updateMatrix(),this.target=new We,this.shadow=new Ic}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.shadow=this.shadow.toJSON(),e.object.target=this.target.uuid,e}};var Bs=-90,ks=1,Oa=class extends We{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new qe(Bs,ks,t,e);s.layers=this.layers,this.add(s);let r=new qe(Bs,ks,t,e);r.layers=this.layers,this.add(r);let o=new qe(Bs,ks,t,e);o.layers=this.layers,this.add(o);let a=new qe(Bs,ks,t,e);a.layers=this.layers,this.add(a);let l=new qe(Bs,ks,t,e);l.layers=this.layers,this.add(l);let c=new qe(Bs,ks,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[n,s,r,o,a,l]=e;for(let c of e)this.remove(c);if(t===Zn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===Ws)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[r,o,a,l,c,h]=this.children,u=t.getRenderTarget(),d=t.getActiveCubeFace(),f=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;let _=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let m=!1;t.isWebGLRenderer===!0?m=t.state.buffers.depth.getReversed():m=t.reversedDepthBuffer,t.setRenderTarget(n,0,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,r),t.setRenderTarget(n,1,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,o),t.setRenderTarget(n,2,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,a),t.setRenderTarget(n,3,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,l),t.setRenderTarget(n,4,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,c),n.texture.generateMipmaps=_,t.setRenderTarget(n,5,s),m&&t.autoClear===!1&&t.clearDepth(),t.render(e,h),t.setRenderTarget(u,d,f),t.xr.enabled=g,n.texture.needsPMREMUpdate=!0}},Ba=class extends qe{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}};var oh="\\[\\]\\.:\\/",Up=new RegExp("["+oh+"]","g"),ah="[^"+oh+"]",Fp="[^"+oh.replace("\\.","")+"]",Op=/((?:WC+[\/:])*)/.source.replace("WC",ah),Bp=/(WCOD+)?/.source.replace("WCOD",Fp),kp=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",ah),zp=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",ah),Hp=new RegExp("^"+Op+Bp+kp+zp+"$"),Vp=["material","materials","bones","map"],Lc=class{constructor(t,e,n){let s=n||Ce.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,s)}getValue(t,e){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(t,e)}setValue(t,e){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].unbind()}},Ce=class i{constructor(t,e,n){this.path=e,this.parsedPath=n||i.parseTrackName(e),this.node=i.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,n){return t&&t.isAnimationObjectGroup?new i.Composite(t,e,n):new i(t,e,n)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(Up,"")}static parseTrackName(t){let e=Hp.exec(t);if(e===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let n={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);Vp.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return n}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let n=t.skeleton.getBoneByName(e);if(n!==void 0)return n}if(t.children){let n=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===e||a.uuid===e)return a;let l=n(a.children);if(l)return l}return null},s=n(t.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)t[e++]=n[s]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,n=e.objectName,s=e.propertyName,r=e.propertyIndex;if(t||(t=i.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){Qt("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=e.objectIndex;switch(n){case"materials":if(!t.material){ne("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){ne("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){ne("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let h=0;h<t.length;h++)if(t[h].name===c){c=h;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){ne("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){ne("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[n]===void 0){ne("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[n]}if(c!==void 0){if(t[c]===void 0){ne("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[c]}}let o=t[s];if(o===void 0){let c=e.nodeName;ne("PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",t);return}let a=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?a=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!t.geometry){ne("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){ne("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[r]!==void 0&&(r=t.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Ce.Composite=Lc;Ce.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Ce.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Ce.prototype.GetterByBindingType=[Ce.prototype._getValue_direct,Ce.prototype._getValue_array,Ce.prototype._getValue_arrayElement,Ce.prototype._getValue_toArray];Ce.prototype.SetterByBindingTypeAndVersioning=[[Ce.prototype._setValue_direct,Ce.prototype._setValue_direct_setNeedsUpdate,Ce.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Ce.prototype._setValue_array,Ce.prototype._setValue_array_setNeedsUpdate,Ce.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Ce.prototype._setValue_arrayElement,Ce.prototype._setValue_arrayElement_setNeedsUpdate,Ce.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Ce.prototype._setValue_fromArray,Ce.prototype._setValue_fromArray_setNeedsUpdate,Ce.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var ky=new Float32Array(1);var xu=new Se,ao=class{constructor(t,e,n=0,s=1/0){this.ray=new hs(t,e),this.near=n,this.far=s,this.camera=null,this.layers=new Ys,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,e){this.ray.set(t,e)}setFromCamera(t,e){e.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(e).sub(this.ray.origin).normalize(),this.camera=e):e.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,e.projectionMatrix.elements[14]).unproject(e),this.ray.direction.set(0,0,-1).transformDirection(e.matrixWorld),this.camera=e):ne("Raycaster: Unsupported camera type: "+e.type)}setFromXRController(t){return xu.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(xu),this}intersectObject(t,e=!0,n=[]){return Dc(t,this,n,e),n.sort(yu),n}intersectObjects(t,e=!0,n=[]){for(let s=0,r=t.length;s<r;s++)Dc(t[s],this,n,e);return n.sort(yu),n}};function yu(i,t){return i.distance-t.distance}function Dc(i,t,e,n){let s=!0;if(i.layers.test(t.layers)&&i.raycast(t,e)===!1&&(s=!1),s===!0&&n===!0){let r=i.children;for(let o=0,a=r.length;o<a;o++)Dc(r[o],t,e,!0)}}var lo=class{constructor(t=!0){this.autoStart=t,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1,Qt("Clock: This module has been deprecated. Please use THREE.Timer instead.")}start(){this.startTime=performance.now(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let t=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){let e=performance.now();t=(e-this.oldTime)/1e3,this.oldTime=e,this.elapsedTime+=t}return t}},Vi=class{constructor(t=1,e=0,n=0){this.radius=t,this.phi=e,this.theta=n}set(t,e,n){return this.radius=t,this.phi=e,this.theta=n,this}copy(t){return this.radius=t.radius,this.phi=t.phi,this.theta=t.theta,this}makeSafe(){return this.phi=oe(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(t){return this.setFromCartesianCoords(t.x,t.y,t.z)}setFromCartesianCoords(t,e,n){return this.radius=Math.sqrt(t*t+e*e+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(t,n),this.phi=Math.acos(oe(e/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}};var fh=class fh{constructor(t,e,n,s){this.elements=[1,0,0,1],t!==void 0&&this.set(t,e,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(t,e=0){for(let n=0;n<4;n++)this.elements[n]=t[n+e];return this}set(t,e,n,s){let r=this.elements;return r[0]=t,r[2]=e,r[1]=n,r[3]=s,this}};fh.prototype.isMatrix2=!0;var Nc=fh;var co=class extends Jn{constructor(t,e=null){super(),this.object=t,this.domElement=e,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(t){this.domElement!==null&&this.disconnect(),this.domElement=t}disconnect(){}dispose(){}update(){}};function lh(i,t,e,n){let s=Gp(n);switch(e){case jc:return i*t;case Ya:return i*t/s.components*s.byteLength;case Za:return i*t/s.components*s.byteLength;case Ji:return i*t*2/s.components*s.byteLength;case Ja:return i*t*2/s.components*s.byteLength;case Qc:return i*t*3/s.components*s.byteLength;case zn:return i*t*4/s.components*s.byteLength;case $a:return i*t*4/s.components*s.byteLength;case fo:case po:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case mo:case go:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case ja:case tl:return Math.max(i,16)*Math.max(t,8)/4;case Ka:case Qa:return Math.max(i,8)*Math.max(t,8)/2;case el:case nl:case sl:case rl:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case il:case _o:case ol:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case al:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case ll:return Math.floor((i+4)/5)*Math.floor((t+3)/4)*16;case cl:return Math.floor((i+4)/5)*Math.floor((t+4)/5)*16;case hl:return Math.floor((i+5)/6)*Math.floor((t+4)/5)*16;case ul:return Math.floor((i+5)/6)*Math.floor((t+5)/6)*16;case dl:return Math.floor((i+7)/8)*Math.floor((t+4)/5)*16;case fl:return Math.floor((i+7)/8)*Math.floor((t+5)/6)*16;case pl:return Math.floor((i+7)/8)*Math.floor((t+7)/8)*16;case ml:return Math.floor((i+9)/10)*Math.floor((t+4)/5)*16;case gl:return Math.floor((i+9)/10)*Math.floor((t+5)/6)*16;case _l:return Math.floor((i+9)/10)*Math.floor((t+7)/8)*16;case xl:return Math.floor((i+9)/10)*Math.floor((t+9)/10)*16;case yl:return Math.floor((i+11)/12)*Math.floor((t+9)/10)*16;case vl:return Math.floor((i+11)/12)*Math.floor((t+11)/12)*16;case bl:case Sl:case Ml:return Math.ceil(i/4)*Math.ceil(t/4)*16;case El:case Tl:return Math.ceil(i/4)*Math.ceil(t/4)*8;case xo:case wl:return Math.ceil(i/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function Gp(i){switch(i){case yn:case Zc:return{byteLength:1,components:1};case ar:case Jc:case jn:return{byteLength:2,components:1};case Xa:case qa:return{byteLength:2,components:4};case Kn:case Wa:case kn:return{byteLength:4,components:1};case $c:case Kc:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__!="undefined"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window!="undefined"&&(window.__THREE__?Qt("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function Ld(){let i=null,t=!1,e=null,n=null;function s(r,o){n=i.requestAnimationFrame(s),e(r,o)}return{start:function(){t!==!0&&e!==null&&i!==null&&(n=i.requestAnimationFrame(s),t=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){i=r}}}function Xp(i){let t=new WeakMap;function e(a,l){let c=a.array,h=a.usage,u=c.byteLength,d=i.createBuffer();i.bindBuffer(l,d),i.bufferData(l,c,h),a.onUploadCallback();let f;if(c instanceof Float32Array)f=i.FLOAT;else if(typeof Float16Array!="undefined"&&c instanceof Float16Array)f=i.HALF_FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?f=i.HALF_FLOAT:f=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=i.SHORT;else if(c instanceof Uint32Array)f=i.UNSIGNED_INT;else if(c instanceof Int32Array)f=i.INT;else if(c instanceof Int8Array)f=i.BYTE;else if(c instanceof Uint8Array)f=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:u}}function n(a,l,c){let h=l.array,u=l.updateRanges;if(i.bindBuffer(c,a),u.length===0)i.bufferSubData(c,0,h);else{u.sort((f,g)=>f.start-g.start);let d=0;for(let f=1;f<u.length;f++){let g=u[d],_=u[f];_.start<=g.start+g.count+1?g.count=Math.max(g.count,_.start+_.count-g.start):(++d,u[d]=_)}u.length=d+1;for(let f=0,g=u.length;f<g;f++){let _=u[f];i.bufferSubData(c,_.start*h.BYTES_PER_ELEMENT,h,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),t.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);let l=t.get(a);l&&(i.deleteBuffer(l.buffer),t.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let h=t.get(a);(!h||h.version<a.version)&&t.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let c=t.get(a);if(c===void 0)t.set(a,e(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,a,l),c.version=a.version}}return{get:s,remove:r,update:o}}var qp=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Yp=`#ifdef USE_ALPHAHASH
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
#endif`,Zp=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Jp=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,$p=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Kp=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,jp=`#ifdef USE_AOMAP
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
#endif`,Qp=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,t0=`#ifdef USE_BATCHING
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
#endif`,e0=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,n0=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,i0=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,s0=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,r0=`#ifdef USE_IRIDESCENCE
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
#endif`,o0=`#ifdef USE_BUMPMAP
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
#endif`,a0=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,l0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,c0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,h0=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,u0=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,d0=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,f0=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,p0=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,m0=`#define PI 3.141592653589793
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
} // validated`,g0=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,_0=`vec3 transformedNormal = objectNormal;
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
#endif`,x0=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,y0=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,v0=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,b0=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,S0="gl_FragColor = linearToOutputTexel( gl_FragColor );",M0=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,E0=`#ifdef USE_ENVMAP
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
#endif`,T0=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,w0=`#ifdef USE_ENVMAP
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
#endif`,A0=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,R0=`#ifdef USE_ENVMAP
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
#endif`,C0=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,P0=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,I0=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,L0=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,D0=`#ifdef USE_GRADIENTMAP
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
}`,N0=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,U0=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,F0=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,O0=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,B0=`#ifdef USE_ENVMAP
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
#endif`,k0=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,z0=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,H0=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,V0=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,G0=`PhysicalMaterial material;
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
#endif`,W0=`uniform sampler2D dfgLUT;
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
}`,X0=`
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
#endif`,q0=`#if defined( RE_IndirectDiffuse )
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
#endif`,Y0=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Z0=`#ifdef USE_LIGHT_PROBES_GRID
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
#endif`,J0=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,$0=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,K0=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,j0=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Q0=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,tm=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,em=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,nm=`#if defined( USE_POINTS_UV )
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
#endif`,im=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,sm=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,rm=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,om=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,am=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,lm=`#ifdef USE_MORPHTARGETS
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
#endif`,cm=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,hm=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,um=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,dm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,fm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,pm=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,mm=`#ifdef USE_NORMALMAP
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
#endif`,gm=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,_m=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,xm=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,ym=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,vm=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,bm=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,Sm=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Mm=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Em=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Tm=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,wm=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Am=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Rm=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Cm=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,Pm=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,Im=`float getShadowMask() {
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
}`,Lm=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Dm=`#ifdef USE_SKINNING
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
#endif`,Nm=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Um=`#ifdef USE_SKINNING
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
#endif`,Fm=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Om=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Bm=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,km=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,zm=`#ifdef USE_TRANSMISSION
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
#endif`,Hm=`#ifdef USE_TRANSMISSION
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
#endif`,Vm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Gm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Wm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Xm=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,qm=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Ym=`uniform sampler2D t2D;
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
}`,Zm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Jm=`#ifdef ENVMAP_TYPE_CUBE
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
}`,$m=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Km=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,jm=`#include <common>
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
}`,Qm=`#if DEPTH_PACKING == 3200
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
}`,tg=`#define DISTANCE
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
}`,eg=`#define DISTANCE
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
}`,ng=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,ig=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,sg=`uniform float scale;
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
}`,rg=`uniform vec3 diffuse;
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
}`,og=`#include <common>
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
}`,ag=`uniform vec3 diffuse;
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
}`,lg=`#define LAMBERT
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
}`,cg=`#define LAMBERT
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
}`,hg=`#define MATCAP
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
}`,ug=`#define MATCAP
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
}`,dg=`#define NORMAL
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
}`,fg=`#define NORMAL
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
}`,pg=`#define PHONG
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
}`,mg=`#define PHONG
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
}`,gg=`#define STANDARD
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
}`,_g=`#define STANDARD
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
}`,xg=`#define TOON
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
}`,yg=`#define TOON
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
}`,vg=`uniform float size;
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
}`,bg=`uniform vec3 diffuse;
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
}`,Sg=`#include <common>
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
}`,Mg=`uniform vec3 color;
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
}`,Eg=`uniform float rotation;
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
}`,Tg=`uniform vec3 diffuse;
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
}`,le={alphahash_fragment:qp,alphahash_pars_fragment:Yp,alphamap_fragment:Zp,alphamap_pars_fragment:Jp,alphatest_fragment:$p,alphatest_pars_fragment:Kp,aomap_fragment:jp,aomap_pars_fragment:Qp,batching_pars_vertex:t0,batching_vertex:e0,begin_vertex:n0,beginnormal_vertex:i0,bsdfs:s0,iridescence_fragment:r0,bumpmap_pars_fragment:o0,clipping_planes_fragment:a0,clipping_planes_pars_fragment:l0,clipping_planes_pars_vertex:c0,clipping_planes_vertex:h0,color_fragment:u0,color_pars_fragment:d0,color_pars_vertex:f0,color_vertex:p0,common:m0,cube_uv_reflection_fragment:g0,defaultnormal_vertex:_0,displacementmap_pars_vertex:x0,displacementmap_vertex:y0,emissivemap_fragment:v0,emissivemap_pars_fragment:b0,colorspace_fragment:S0,colorspace_pars_fragment:M0,envmap_fragment:E0,envmap_common_pars_fragment:T0,envmap_pars_fragment:w0,envmap_pars_vertex:A0,envmap_physical_pars_fragment:B0,envmap_vertex:R0,fog_vertex:C0,fog_pars_vertex:P0,fog_fragment:I0,fog_pars_fragment:L0,gradientmap_pars_fragment:D0,lightmap_pars_fragment:N0,lights_lambert_fragment:U0,lights_lambert_pars_fragment:F0,lights_pars_begin:O0,lights_toon_fragment:k0,lights_toon_pars_fragment:z0,lights_phong_fragment:H0,lights_phong_pars_fragment:V0,lights_physical_fragment:G0,lights_physical_pars_fragment:W0,lights_fragment_begin:X0,lights_fragment_maps:q0,lights_fragment_end:Y0,lightprobes_pars_fragment:Z0,logdepthbuf_fragment:J0,logdepthbuf_pars_fragment:$0,logdepthbuf_pars_vertex:K0,logdepthbuf_vertex:j0,map_fragment:Q0,map_pars_fragment:tm,map_particle_fragment:em,map_particle_pars_fragment:nm,metalnessmap_fragment:im,metalnessmap_pars_fragment:sm,morphinstance_vertex:rm,morphcolor_vertex:om,morphnormal_vertex:am,morphtarget_pars_vertex:lm,morphtarget_vertex:cm,normal_fragment_begin:hm,normal_fragment_maps:um,normal_pars_fragment:dm,normal_pars_vertex:fm,normal_vertex:pm,normalmap_pars_fragment:mm,clearcoat_normal_fragment_begin:gm,clearcoat_normal_fragment_maps:_m,clearcoat_pars_fragment:xm,iridescence_pars_fragment:ym,opaque_fragment:vm,packing:bm,premultiplied_alpha_fragment:Sm,project_vertex:Mm,dithering_fragment:Em,dithering_pars_fragment:Tm,roughnessmap_fragment:wm,roughnessmap_pars_fragment:Am,shadowmap_pars_fragment:Rm,shadowmap_pars_vertex:Cm,shadowmap_vertex:Pm,shadowmask_pars_fragment:Im,skinbase_vertex:Lm,skinning_pars_vertex:Dm,skinning_vertex:Nm,skinnormal_vertex:Um,specularmap_fragment:Fm,specularmap_pars_fragment:Om,tonemapping_fragment:Bm,tonemapping_pars_fragment:km,transmission_fragment:zm,transmission_pars_fragment:Hm,uv_pars_fragment:Vm,uv_pars_vertex:Gm,uv_vertex:Wm,worldpos_vertex:Xm,background_vert:qm,background_frag:Ym,backgroundCube_vert:Zm,backgroundCube_frag:Jm,cube_vert:$m,cube_frag:Km,depth_vert:jm,depth_frag:Qm,distance_vert:tg,distance_frag:eg,equirect_vert:ng,equirect_frag:ig,linedashed_vert:sg,linedashed_frag:rg,meshbasic_vert:og,meshbasic_frag:ag,meshlambert_vert:lg,meshlambert_frag:cg,meshmatcap_vert:hg,meshmatcap_frag:ug,meshnormal_vert:dg,meshnormal_frag:fg,meshphong_vert:pg,meshphong_frag:mg,meshphysical_vert:gg,meshphysical_frag:_g,meshtoon_vert:xg,meshtoon_frag:yg,points_vert:vg,points_frag:bg,shadow_vert:Sg,shadow_frag:Mg,sprite_vert:Eg,sprite_frag:Tg},Lt={common:{diffuse:{value:new jt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new re},alphaMap:{value:null},alphaMapTransform:{value:new re},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new re}},envmap:{envMap:{value:null},envMapRotation:{value:new re},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new re}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new re}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new re},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new re},normalScale:{value:new at(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new re},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new re}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new re}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new re}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new jt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new N},probesMax:{value:new N},probesResolution:{value:new N}},points:{diffuse:{value:new jt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new re},alphaTest:{value:0},uvTransform:{value:new re}},sprite:{diffuse:{value:new jt(16777215)},opacity:{value:1},center:{value:new at(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new re},alphaMap:{value:null},alphaMapTransform:{value:new re},alphaTest:{value:0}}},ci={basic:{uniforms:cn([Lt.common,Lt.specularmap,Lt.envmap,Lt.aomap,Lt.lightmap,Lt.fog]),vertexShader:le.meshbasic_vert,fragmentShader:le.meshbasic_frag},lambert:{uniforms:cn([Lt.common,Lt.specularmap,Lt.envmap,Lt.aomap,Lt.lightmap,Lt.emissivemap,Lt.bumpmap,Lt.normalmap,Lt.displacementmap,Lt.fog,Lt.lights,{emissive:{value:new jt(0)},envMapIntensity:{value:1}}]),vertexShader:le.meshlambert_vert,fragmentShader:le.meshlambert_frag},phong:{uniforms:cn([Lt.common,Lt.specularmap,Lt.envmap,Lt.aomap,Lt.lightmap,Lt.emissivemap,Lt.bumpmap,Lt.normalmap,Lt.displacementmap,Lt.fog,Lt.lights,{emissive:{value:new jt(0)},specular:{value:new jt(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:le.meshphong_vert,fragmentShader:le.meshphong_frag},standard:{uniforms:cn([Lt.common,Lt.envmap,Lt.aomap,Lt.lightmap,Lt.emissivemap,Lt.bumpmap,Lt.normalmap,Lt.displacementmap,Lt.roughnessmap,Lt.metalnessmap,Lt.fog,Lt.lights,{emissive:{value:new jt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:le.meshphysical_vert,fragmentShader:le.meshphysical_frag},toon:{uniforms:cn([Lt.common,Lt.aomap,Lt.lightmap,Lt.emissivemap,Lt.bumpmap,Lt.normalmap,Lt.displacementmap,Lt.gradientmap,Lt.fog,Lt.lights,{emissive:{value:new jt(0)}}]),vertexShader:le.meshtoon_vert,fragmentShader:le.meshtoon_frag},matcap:{uniforms:cn([Lt.common,Lt.bumpmap,Lt.normalmap,Lt.displacementmap,Lt.fog,{matcap:{value:null}}]),vertexShader:le.meshmatcap_vert,fragmentShader:le.meshmatcap_frag},points:{uniforms:cn([Lt.points,Lt.fog]),vertexShader:le.points_vert,fragmentShader:le.points_frag},dashed:{uniforms:cn([Lt.common,Lt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:le.linedashed_vert,fragmentShader:le.linedashed_frag},depth:{uniforms:cn([Lt.common,Lt.displacementmap]),vertexShader:le.depth_vert,fragmentShader:le.depth_frag},normal:{uniforms:cn([Lt.common,Lt.bumpmap,Lt.normalmap,Lt.displacementmap,{opacity:{value:1}}]),vertexShader:le.meshnormal_vert,fragmentShader:le.meshnormal_frag},sprite:{uniforms:cn([Lt.sprite,Lt.fog]),vertexShader:le.sprite_vert,fragmentShader:le.sprite_frag},background:{uniforms:{uvTransform:{value:new re},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:le.background_vert,fragmentShader:le.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new re}},vertexShader:le.backgroundCube_vert,fragmentShader:le.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:le.cube_vert,fragmentShader:le.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:le.equirect_vert,fragmentShader:le.equirect_frag},distance:{uniforms:cn([Lt.common,Lt.displacementmap,{referencePosition:{value:new N},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:le.distance_vert,fragmentShader:le.distance_frag},shadow:{uniforms:cn([Lt.lights,Lt.fog,{color:{value:new jt(0)},opacity:{value:1}}]),vertexShader:le.shadow_vert,fragmentShader:le.shadow_frag}};ci.physical={uniforms:cn([ci.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new re},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new re},clearcoatNormalScale:{value:new at(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new re},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new re},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new re},sheen:{value:0},sheenColor:{value:new jt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new re},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new re},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new re},transmissionSamplerSize:{value:new at},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new re},attenuationDistance:{value:0},attenuationColor:{value:new jt(0)},specularColor:{value:new jt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new re},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new re},anisotropyVector:{value:new at},anisotropyMap:{value:null},anisotropyMapTransform:{value:new re}}]),vertexShader:le.meshphysical_vert,fragmentShader:le.meshphysical_frag};var Cl={r:0,b:0,g:0},wg=new Se,Dd=new re;Dd.set(-1,0,0,0,1,0,0,0,1);function Ag(i,t,e,n,s,r){let o=new jt(0),a=s===!0?0:1,l,c,h=null,u=0,d=null;function f(v){let S=v.isScene===!0?v.background:null;if(S&&S.isTexture){let y=v.backgroundBlurriness>0;S=t.get(S,y)}return S}function g(v){let S=!1,y=f(v);y===null?m(o,a):y&&y.isColor&&(m(y,1),S=!0);let E=i.xr.getEnvironmentBlendMode();E==="additive"?e.buffers.color.setClear(0,0,0,1,r):E==="alpha-blend"&&e.buffers.color.setClear(0,0,0,0,r),(i.autoClear||S)&&(e.buffers.depth.setTest(!0),e.buffers.depth.setMask(!0),e.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function _(v,S){let y=f(S);y&&(y.isCubeTexture||y.mapping===ho)?(c===void 0&&(c=new Ft(new xn(1,1,1),new Cn({name:"BackgroundCubeMaterial",uniforms:xs(ci.backgroundCube.uniforms),vertexShader:ci.backgroundCube.vertexShader,fragmentShader:ci.backgroundCube.fragmentShader,side:Xe,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(E,M,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=y,c.material.uniforms.backgroundBlurriness.value=S.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(wg.makeRotationFromEuler(S.backgroundRotation)).transpose(),y.isCubeTexture&&y.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(Dd),c.material.toneMapped=he.getTransfer(y.colorSpace)!==_e,(h!==y||u!==y.version||d!==i.toneMapping)&&(c.material.needsUpdate=!0,h=y,u=y.version,d=i.toneMapping),c.layers.enableAll(),v.unshift(c,c.geometry,c.material,0,0,null)):y&&y.isTexture&&(l===void 0&&(l=new Ft(new Bn(2,2),new Cn({name:"BackgroundMaterial",uniforms:xs(ci.background.uniforms),vertexShader:ci.background.vertexShader,fragmentShader:ci.background.fragmentShader,side:Xi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=y,l.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,l.material.toneMapped=he.getTransfer(y.colorSpace)!==_e,y.matrixAutoUpdate===!0&&y.updateMatrix(),l.material.uniforms.uvTransform.value.copy(y.matrix),(h!==y||u!==y.version||d!==i.toneMapping)&&(l.material.needsUpdate=!0,h=y,u=y.version,d=i.toneMapping),l.layers.enableAll(),v.unshift(l,l.geometry,l.material,0,0,null))}function m(v,S){v.getRGB(Cl,rh(i)),e.buffers.color.setClear(Cl.r,Cl.g,Cl.b,S,r)}function p(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return o},setClearColor:function(v,S=1){o.set(v),a=S,m(o,a)},getClearAlpha:function(){return a},setClearAlpha:function(v){a=v,m(o,a)},render:g,addToRenderList:_,dispose:p}}function Rg(i,t){let e=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=d(null),r=s,o=!1;function a(I,P,O,U,H){let K=!1,L=u(I,U,O,P);r!==L&&(r=L,c(r.object)),K=f(I,U,O,H),K&&g(I,U,O,H),H!==null&&t.update(H,i.ELEMENT_ARRAY_BUFFER),(K||o)&&(o=!1,y(I,P,O,U),H!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(H).buffer))}function l(){return i.createVertexArray()}function c(I){return i.bindVertexArray(I)}function h(I){return i.deleteVertexArray(I)}function u(I,P,O,U){let H=U.wireframe===!0,K=n[P.id];K===void 0&&(K={},n[P.id]=K);let L=I.isInstancedMesh===!0?I.id:0,q=K[L];q===void 0&&(q={},K[L]=q);let X=q[O.id];X===void 0&&(X={},q[O.id]=X);let z=X[H];return z===void 0&&(z=d(l()),X[H]=z),z}function d(I){let P=[],O=[],U=[];for(let H=0;H<e;H++)P[H]=0,O[H]=0,U[H]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:P,enabledAttributes:O,attributeDivisors:U,object:I,attributes:{},index:null}}function f(I,P,O,U){let H=r.attributes,K=P.attributes,L=0,q=O.getAttributes();for(let X in q)if(q[X].location>=0){let G=H[X],pt=K[X];if(pt===void 0&&(X==="instanceMatrix"&&I.instanceMatrix&&(pt=I.instanceMatrix),X==="instanceColor"&&I.instanceColor&&(pt=I.instanceColor)),G===void 0||G.attribute!==pt||pt&&G.data!==pt.data)return!0;L++}return r.attributesNum!==L||r.index!==U}function g(I,P,O,U){let H={},K=P.attributes,L=0,q=O.getAttributes();for(let X in q)if(q[X].location>=0){let G=K[X];G===void 0&&(X==="instanceMatrix"&&I.instanceMatrix&&(G=I.instanceMatrix),X==="instanceColor"&&I.instanceColor&&(G=I.instanceColor));let pt={};pt.attribute=G,G&&G.data&&(pt.data=G.data),H[X]=pt,L++}r.attributes=H,r.attributesNum=L,r.index=U}function _(){let I=r.newAttributes;for(let P=0,O=I.length;P<O;P++)I[P]=0}function m(I){p(I,0)}function p(I,P){let O=r.newAttributes,U=r.enabledAttributes,H=r.attributeDivisors;O[I]=1,U[I]===0&&(i.enableVertexAttribArray(I),U[I]=1),H[I]!==P&&(i.vertexAttribDivisor(I,P),H[I]=P)}function v(){let I=r.newAttributes,P=r.enabledAttributes;for(let O=0,U=P.length;O<U;O++)P[O]!==I[O]&&(i.disableVertexAttribArray(O),P[O]=0)}function S(I,P,O,U,H,K,L){L===!0?i.vertexAttribIPointer(I,P,O,H,K):i.vertexAttribPointer(I,P,O,U,H,K)}function y(I,P,O,U){_();let H=U.attributes,K=O.getAttributes(),L=P.defaultAttributeValues;for(let q in K){let X=K[q];if(X.location>=0){let z=H[q];if(z===void 0&&(q==="instanceMatrix"&&I.instanceMatrix&&(z=I.instanceMatrix),q==="instanceColor"&&I.instanceColor&&(z=I.instanceColor)),z!==void 0){let G=z.normalized,pt=z.itemSize,j=t.get(z);if(j===void 0)continue;let ht=j.buffer,dt=j.type,Mt=j.bytesPerElement,Y=dt===i.INT||dt===i.UNSIGNED_INT||z.gpuType===Wa;if(z.isInterleavedBufferAttribute){let nt=z.data,_t=nt.stride,vt=z.offset;if(nt.isInstancedInterleavedBuffer){for(let xt=0;xt<X.locationSize;xt++)p(X.location+xt,nt.meshPerAttribute);I.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=nt.meshPerAttribute*nt.count)}else for(let xt=0;xt<X.locationSize;xt++)m(X.location+xt);i.bindBuffer(i.ARRAY_BUFFER,ht);for(let xt=0;xt<X.locationSize;xt++)S(X.location+xt,pt/X.locationSize,dt,G,_t*Mt,(vt+pt/X.locationSize*xt)*Mt,Y)}else{if(z.isInstancedBufferAttribute){for(let nt=0;nt<X.locationSize;nt++)p(X.location+nt,z.meshPerAttribute);I.isInstancedMesh!==!0&&U._maxInstanceCount===void 0&&(U._maxInstanceCount=z.meshPerAttribute*z.count)}else for(let nt=0;nt<X.locationSize;nt++)m(X.location+nt);i.bindBuffer(i.ARRAY_BUFFER,ht);for(let nt=0;nt<X.locationSize;nt++)S(X.location+nt,pt/X.locationSize,dt,G,pt*Mt,pt/X.locationSize*nt*Mt,Y)}}else if(L!==void 0){let G=L[q];if(G!==void 0)switch(G.length){case 2:i.vertexAttrib2fv(X.location,G);break;case 3:i.vertexAttrib3fv(X.location,G);break;case 4:i.vertexAttrib4fv(X.location,G);break;default:i.vertexAttrib1fv(X.location,G)}}}}v()}function E(){w();for(let I in n){let P=n[I];for(let O in P){let U=P[O];for(let H in U){let K=U[H];for(let L in K)h(K[L].object),delete K[L];delete U[H]}}delete n[I]}}function M(I){if(n[I.id]===void 0)return;let P=n[I.id];for(let O in P){let U=P[O];for(let H in U){let K=U[H];for(let L in K)h(K[L].object),delete K[L];delete U[H]}}delete n[I.id]}function A(I){for(let P in n){let O=n[P];for(let U in O){let H=O[U];if(H[I.id]===void 0)continue;let K=H[I.id];for(let L in K)h(K[L].object),delete K[L];delete H[I.id]}}}function x(I){for(let P in n){let O=n[P],U=I.isInstancedMesh===!0?I.id:0,H=O[U];if(H!==void 0){for(let K in H){let L=H[K];for(let q in L)h(L[q].object),delete L[q];delete H[K]}delete O[U],Object.keys(O).length===0&&delete n[P]}}}function w(){C(),o=!0,r!==s&&(r=s,c(r.object))}function C(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:w,resetDefaultState:C,dispose:E,releaseStatesOfGeometry:M,releaseStatesOfObject:x,releaseStatesOfProgram:A,initAttributes:_,enableAttribute:m,disableUnusedAttributes:v}}function Cg(i,t,e){let n;function s(l){n=l}function r(l,c){i.drawArrays(n,l,c),e.update(c,n,1)}function o(l,c,h){h!==0&&(i.drawArraysInstanced(n,l,c,h),e.update(c,n,h))}function a(l,c,h){if(h===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,h);let d=0;for(let f=0;f<h;f++)d+=c[f];e.update(d,n,1)}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a}function Pg(i,t,e,n){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){let A=t.get("EXT_texture_filter_anisotropic");s=i.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(A){return!(A!==zn&&n.convert(A)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(A){let x=A===jn&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(A!==yn&&A!==kn&&!x&&n.convert(A)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function l(A){if(A==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp",h=l(c);h!==c&&(Qt("WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let u=e.logarithmicDepthBuffer===!0,d=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control");e.reversedDepthBuffer===!0&&d===!1&&Qt("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let f=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),p=i.getParameter(i.MAX_VERTEX_ATTRIBS),v=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),S=i.getParameter(i.MAX_VARYING_VECTORS),y=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),E=i.getParameter(i.MAX_SAMPLES),M=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:u,reversedDepthBuffer:d,maxTextures:f,maxVertexTextures:g,maxTextureSize:_,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:v,maxVaryings:S,maxFragmentUniforms:y,maxSamples:E,samples:M}}function Ig(i){let t=this,e=null,n=0,s=!1,r=!1,o=new Tn,a=new re,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){let f=u.length!==0||d||n!==0||s;return s=d,n=u.length,f},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,d){e=h(u,d,0)},this.setState=function(u,d,f){let g=u.clippingPlanes,_=u.clipIntersection,m=u.clipShadows,p=i.get(u);if(!s||g===null||g.length===0||r&&!m)r?h(null):c();else{let v=r?0:n,S=v*4,y=p.clippingState||null;l.value=y,y=h(g,d,S,f);for(let E=0;E!==S;++E)y[E]=e[E];p.clippingState=y,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=v}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function h(u,d,f,g){let _=u!==null?u.length:0,m=null;if(_!==0){if(m=l.value,g!==!0||m===null){let p=f+_*4,v=d.matrixWorldInverse;a.getNormalMatrix(v),(m===null||m.length<p)&&(m=new Float32Array(p));for(let S=0,y=f;S!==_;++S,y+=4)o.copy(u[S]).applyMatrix4(v,a),o.normal.toArray(m,y),m[y+3]=o.constant}l.value=m,l.needsUpdate=!0}return t.numPlanes=_,t.numIntersection=0,m}}var hr=4,Lg=6,Dg=20,Ng=256,vo=new nr,ud=new jt,ph=null,mh=0,gh=0,_h=!1,Ug=new N,ys=new N,dr=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(t,e=0,n=.1,s=100,r={}){let{size:o=256,position:a=Ug}=r;ph=this._renderer.getRenderTarget(),mh=this._renderer.getActiveCubeFace(),gh=this._renderer.getActiveMipmapLevel(),_h=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(t,n,s,l,a),e>0&&this._blur(l,0,0,e),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=pd(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=fd(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodMeshes.length;t++)this._lodMeshes[t].geometry.dispose()}_cleanup(t){this._renderer.setRenderTarget(ph,mh,gh),this._renderer.xr.enabled=_h,t.scissorTest=!1,cr(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===qi||t.mapping===gs?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),ph=this._renderer.getRenderTarget(),mh=this._renderer.getActiveCubeFace(),gh=this._renderer.getActiveMipmapLevel(),_h=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:nn,minFilter:nn,generateMipmaps:!1,type:jn,format:zn,colorSpace:Nr,depthBuffer:!1},s=dd(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=dd(t,e,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=Fg(r)),this._blurMaterial=Bg(r,t,e),this._ggxMaterial=Og(r,t,e)}return s}_compileMaterial(t){let e=new Ft(new De,t);this._renderer.compile(e,vo)}_sceneToCubeUV(t,e,n,s,r){let l=new qe(90,1,e,n),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],u=this._renderer,d=u.autoClear,f=u.toneMapping;u.getClearColor(ud),u.toneMapping=$n,u.autoClear=!1,u.state.buffers.depth.getReversed()&&(u.setRenderTarget(s),u.clearDepth(),u.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new Ft(new xn,new Si({name:"PMREM.Background",side:Xe,depthWrite:!1,depthTest:!1})));let _=this._backgroundBox,m=_.material,p=!1,v=t.background;v?v.isColor&&(m.color.copy(v),t.background=null,p=!0):(m.color.copy(ud),p=!0);for(let S=0;S<6;S++){let y=S%3;y===0?(l.up.set(0,c[S],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+h[S],r.y,r.z)):y===1?(l.up.set(0,0,c[S]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+h[S],r.z)):(l.up.set(0,c[S],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+h[S]));let E=this._cubeSize;cr(s,y*E,S>2?E:0,E,E),u.setRenderTarget(s),p&&u.render(_,l),u.render(t,l)}u.toneMapping=f,u.autoClear=d,t.background=v}_textureToCubeUV(t,e){let n=this._renderer,s=t.mapping===qi||t.mapping===gs;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=pd()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=fd());let r=s?this._cubemapMaterial:this._equirectMaterial,o=this._lodMeshes[0];o.material=r;let a=r.uniforms;a.envMap.value=t;let l=this._cubeSize;cr(e,0,0,3*l,2*l),n.setRenderTarget(e),n.render(o,vo)}_applyPMREM(t){let e=this._renderer,n=e.autoClear;e.autoClear=!1;let s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(t,r-1,r);e.autoClear=n}_applyGGXFilter(t,e,n){let s=this._renderer,r=this._pingPongRenderTarget,o=this._ggxMaterial,a=this._lodMeshes[n];a.material=o;let l=o.uniforms,c=n/(this._lodMeshes.length-1),h=e/(this._lodMeshes.length-1),u=Math.sqrt(c*c-h*h),d=c*1.25,f=u*d,{_lodMax:g}=this,_=this._sizeLods[n],m=3*_*(n>g-hr?n-g+hr:0),p=4*(this._cubeSize-_);l.envMap.value=t.texture,l.roughness.value=f,l.mipInt.value=g-e,cr(r,m,p,3*_,2*_),s.setRenderTarget(r),s.render(a,vo),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=g-n,cr(t,m,p,3*_,2*_),s.setRenderTarget(t),s.render(a,vo)}_blur(t,e,n,s){let r=this._pingPongRenderTarget,o=Math.min(s,Math.PI)/Math.SQRT2;this._blurPass(t,r,e,n,o),this._blurPass(r,t,n,n,o)}_blurPass(t,e,n,s,r){let o=this._renderer,a=this._blurMaterial,l=this._lodMeshes[s];l.material=a;let c=a.uniforms;c.envMap.value=t.texture,c.sigma.value=r,c.mipInt.value=this._lodMax-n;let h=this._sizeLods[s],u=3*h*(s>this._lodMax-hr?s-this._lodMax+hr:0),d=4*(this._cubeSize-h);cr(e,u,d,3*h,2*h),o.setRenderTarget(e),o.render(l,vo)}};function Fg(i){let t=[],e=[],n=i,s=i-hr+1+Lg;for(let r=0;r<s;r++){let o=Math.pow(2,n);t.push(o);let a=1/(o-2),l=-a,c=1+a,h=[l,l,c,l,c,c,l,l,c,c,l,c],u=6,d=6,f=3,g=new Float32Array(f*d*u),_=new Float32Array(f*d*u);for(let p=0;p<u;p++){let v=p%3*2/3-1,S=p>2?0:-1,y=[v,S,0,v+2/3,S,0,v+2/3,S+1,0,v,S,0,v+2/3,S+1,0,v,S+1,0];g.set(y,f*d*p);for(let E=0;E<d;E++){let M=h[E*2]*2-1,A=h[E*2+1]*2-1;p===0?ys.set(1,A,M):p===1?ys.set(-M,1,-A):p===2?ys.set(-M,A,1):p===3?ys.set(-1,A,-M):p===4?ys.set(-M,-1,A):ys.set(M,A,-1),ys.toArray(_,(p*d+E)*f)}}let m=new De;m.setAttribute("position",new wn(g,f)),m.setAttribute("outputDirection",new wn(_,f)),e.push(new Ft(m,null)),n>hr&&n--}return{lodMeshes:e,sizeLods:t}}function dd(i,t,e){let n=new _n(i,t,e);return n.texture.mapping=ho,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function cr(i,t,e,n,s){i.viewport.set(t,e,n,s),i.scissor.set(t,e,n,s)}function Og(i,t,e){return new Cn({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:Ng,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Dl(),fragmentShader:`

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
		`,blending:ai,depthTest:!1,depthWrite:!1})}function Bg(i,t,e){return new Cn({name:"SphericalGaussianBlur",defines:{SAMPLES:Dg,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:Dl(),fragmentShader:`

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
		`,blending:ai,depthTest:!1,depthWrite:!1})}function fd(){return new Cn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Dl(),fragmentShader:`

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
		`,blending:ai,depthTest:!1,depthWrite:!1})}function pd(){return new Cn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Dl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:ai,depthTest:!1,depthWrite:!1})}function Dl(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var Il=class extends _n{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let n={width:t,height:t,depth:1},s=[n,n,n,n,n,n];this.texture=new Gr(s),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new xn(5,5,5),r=new Cn({name:"CubemapFromEquirect",uniforms:xs(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Xe,blending:ai});r.uniforms.tEquirect.value=e;let o=new Ft(s,r),a=e.minFilter;return e.minFilter===Yi&&(e.minFilter=nn),new Oa(1,10,this).update(t,o),e.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(t,e=!0,n=!0,s=!0){let r=t.getRenderTarget();for(let o=0;o<6;o++)t.setRenderTarget(this,o),t.clear(e,n,s);t.setRenderTarget(r)}};function kg(i){let t=new WeakMap,e=new WeakMap,n=null;function s(d,f=!1){return d==null?null:f?o(d):r(d)}function r(d){if(d&&d.isTexture){let f=d.mapping;if(f===or||f===Va)if(t.has(d)){let g=t.get(d).texture;return a(g,d.mapping)}else{let g=d.image;if(g&&g.height>0){let _=new Il(g.height);return _.fromEquirectangularTexture(i,d),t.set(d,_),d.addEventListener("dispose",c),a(_.texture,d.mapping)}else return null}}return d}function o(d){if(d&&d.isTexture){let f=d.mapping,g=f===or||f===Va,_=f===qi||f===gs;if(g||_){let m=e.get(d),p=m!==void 0?m.texture.pmremVersion:0;if(d.isRenderTargetTexture&&d.pmremVersion!==p)return n===null&&(n=new dr(i)),m=g?n.fromEquirectangular(d,m):n.fromCubemap(d,m),m.texture.pmremVersion=d.pmremVersion,e.set(d,m),m.texture;if(m!==void 0)return m.texture;{let v=d.image;return g&&v&&v.height>0||_&&v&&l(v)?(n===null&&(n=new dr(i)),m=g?n.fromEquirectangular(d):n.fromCubemap(d),m.texture.pmremVersion=d.pmremVersion,e.set(d,m),d.addEventListener("dispose",h),m.texture):null}}}return d}function a(d,f){return f===or?d.mapping=qi:f===Va&&(d.mapping=gs),d}function l(d){let f=0,g=6;for(let _=0;_<g;_++)d[_]!==void 0&&f++;return f===g}function c(d){let f=d.target;f.removeEventListener("dispose",c);let g=t.get(f);g!==void 0&&(t.delete(f),g.dispose())}function h(d){let f=d.target;f.removeEventListener("dispose",h);let g=e.get(f);g!==void 0&&(e.delete(f),g.dispose())}function u(){t=new WeakMap,e=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:u}}function zg(i){let t={};function e(n){if(t[n]!==void 0)return t[n];let s=i.getExtension(n);return t[n]=s,s}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){let s=e(n);return s===null&&ls("WebGLRenderer: "+n+" extension not supported."),s}}}function Hg(i,t,e,n){let s={},r=new WeakMap;function o(u){let d=u.target;d.index!==null&&t.remove(d.index);for(let g in d.attributes)t.remove(d.attributes[g]);d.removeEventListener("dispose",o),delete s[d.id];let f=r.get(d);f&&(t.remove(f),r.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,e.memory.geometries--}function a(u,d){return s[d.id]===!0||(d.addEventListener("dispose",o),s[d.id]=!0,e.memory.geometries++),d}function l(u){let d=u.attributes;for(let f in d)t.update(d[f],i.ARRAY_BUFFER)}function c(u){let d=[],f=u.index,g=u.attributes.position,_=0;if(g===void 0)return;if(f!==null){let v=f.array;_=f.version;for(let S=0,y=v.length;S<y;S+=3){let E=v[S+0],M=v[S+1],A=v[S+2];d.push(E,M,M,A,A,E)}}else{let v=g.array;_=g.version;for(let S=0,y=v.length/3-1;S<y;S+=3){let E=S+0,M=S+1,A=S+2;d.push(E,M,M,A,A,E)}}let m=new(g.count>=65535?kr:Br)(d,1);m.version=_;let p=r.get(u);p&&t.remove(p),r.set(u,m)}function h(u){let d=r.get(u);if(d){let f=u.index;f!==null&&d.version<f.version&&c(u)}else c(u);return r.get(u)}return{get:a,update:l,getWireframeAttribute:h}}function Vg(i,t,e){let n;function s(u){n=u}let r,o;function a(u){r=u.type,o=u.bytesPerElement}function l(u,d){i.drawElements(n,d,r,u*o),e.update(d,n,1)}function c(u,d,f){f!==0&&(i.drawElementsInstanced(n,d,r,u*o,f),e.update(d,n,f))}function h(u,d,f){if(f===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,d,0,r,u,0,f);let _=0;for(let m=0;m<f;m++)_+=d[m];e.update(_,n,1)}this.setMode=s,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=h}function Gg(i){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(e.calls++,o){case i.TRIANGLES:e.triangles+=a*(r/3);break;case i.LINES:e.lines+=a*(r/2);break;case i.LINE_STRIP:e.lines+=a*(r-1);break;case i.LINE_LOOP:e.lines+=a*r;break;case i.POINTS:e.points+=a*r;break;default:ne("WebGLInfo: Unknown draw mode:",o);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:n}}function Wg(i,t,e){let n=new WeakMap,s=new Pe;function r(o,a,l){let c=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,u=h!==void 0?h.length:0,d=n.get(a);if(d===void 0||d.count!==u){let w=function(){A.dispose(),n.delete(a),a.removeEventListener("dispose",w)};d!==void 0&&d.texture.dispose();let f=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,_=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],p=a.morphAttributes.normal||[],v=a.morphAttributes.color||[],S=0;f===!0&&(S=1),g===!0&&(S=2),_===!0&&(S=3);let y=a.attributes.position.count*S,E=1;y>t.maxTextureSize&&(E=Math.ceil(y/t.maxTextureSize),y=t.maxTextureSize);let M=new Float32Array(y*E*4*u),A=new Or(M,y,E,u);A.type=kn,A.needsUpdate=!0;let x=S*4;for(let C=0;C<u;C++){let I=m[C],P=p[C],O=v[C],U=y*E*4*C;for(let H=0;H<I.count;H++){let K=H*x;f===!0&&(s.fromBufferAttribute(I,H),M[U+K+0]=s.x,M[U+K+1]=s.y,M[U+K+2]=s.z,M[U+K+3]=0),g===!0&&(s.fromBufferAttribute(P,H),M[U+K+4]=s.x,M[U+K+5]=s.y,M[U+K+6]=s.z,M[U+K+7]=0),_===!0&&(s.fromBufferAttribute(O,H),M[U+K+8]=s.x,M[U+K+9]=s.y,M[U+K+10]=s.z,M[U+K+11]=O.itemSize===4?s.w:1)}}d={count:u,texture:A,size:new at(y,E)},n.set(a,d),a.addEventListener("dispose",w)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",o.morphTexture,e);else{let f=0;for(let _=0;_<c.length;_++)f+=c[_];let g=a.morphTargetsRelative?1:1-f;l.getUniforms().setValue(i,"morphTargetBaseInfluence",g),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",d.texture,e),l.getUniforms().setValue(i,"morphTargetsTextureSize",d.size)}return{update:r}}function Xg(i,t,e,n,s){let r=new WeakMap;function o(c){let h=s.render.frame,u=c.geometry,d=t.get(c,u);if(r.get(d)!==h&&(t.update(d),r.set(d,h)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==h&&(e.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&e.update(c.instanceColor,i.ARRAY_BUFFER),r.set(c,h))),c.isSkinnedMesh){let f=c.skeleton;r.get(f)!==h&&(f.update(),r.set(f,h))}return d}function a(){r=new WeakMap}function l(c){let h=c.target;h.removeEventListener("dispose",l),n.releaseStatesOfObject(h),e.remove(h.instanceMatrix),h.instanceColor!==null&&e.remove(h.instanceColor)}return{update:o,dispose:a}}var qg={[Hc]:"LINEAR_TONE_MAPPING",[Vc]:"REINHARD_TONE_MAPPING",[Gc]:"CINEON_TONE_MAPPING",[rr]:"ACES_FILMIC_TONE_MAPPING",[Xc]:"AGX_TONE_MAPPING",[qc]:"NEUTRAL_TONE_MAPPING",[Wc]:"CUSTOM_TONE_MAPPING"};function Yg(i,t,e,n,s,r){let o=new _n(t,e,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),a=null,l=null,c=new De;c.setAttribute("position",new ue([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new ue([0,2,0,0,2,0],2));let h=new Ea({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),u=new Ft(c,h),d=new nr(-1,1,1,-1,0,1),f=null,g=null,_=!1,m,p=null,v=[],S=!1;this.setSize=function(y,E){o.setSize(y,E),a!==null&&a.setSize(y,E),l!==null&&l.setSize(y,E);for(let M=0;M<v.length;M++){let A=v[M];A.setSize&&A.setSize(y,E)}},this.setEffects=function(y){v=y,S=v.length>0&&v[0].isRenderPass===!0;let E=o.width,M=o.height;v.length>0&&a===null&&(a=new _n(E,M,{type:jn,depthBuffer:!1,stencilBuffer:!1}),l=new _n(E,M,{type:jn,depthBuffer:!1,stencilBuffer:!1}));for(let A=0;A<v.length;A++){let x=v[A];x.setSize&&x.setSize(E,M)}},this.begin=function(y,E){if(_||y.toneMapping===$n&&v.length===0)return!1;if(p=E,E!==null){let M=E.width,A=E.height;(o.width!==M||o.height!==A)&&this.setSize(M,A)}return S===!1&&y.setRenderTarget(o),m=y.toneMapping,y.toneMapping=$n,!0},this.hasRenderPass=function(){return S},this.end=function(y,E){y.toneMapping=m,_=!0;let M=o,A=a;for(let x=0;x<v.length;x++){let w=v[x];w.enabled!==!1&&(w.render(y,A,M,E),w.needsSwap!==!1&&(M=A,A=A===a?l:a))}if(f!==y.outputColorSpace||g!==y.toneMapping){f=y.outputColorSpace,g=y.toneMapping,h.defines={},he.getTransfer(f)===_e&&(h.defines.SRGB_TRANSFER="");let x=qg[g];x&&(h.defines[x]=""),h.needsUpdate=!0}h.uniforms.tDiffuse.value=M.texture,y.setRenderTarget(p),y.render(u,d),p=null,_=!1},this.isCompositing=function(){return _},this.dispose=function(){o.dispose(),a!==null&&a.dispose(),l!==null&&l.dispose(),c.dispose(),h.dispose()}}var Nd=new gn,vh=new Oi(1,1),Ud=new Or,Fd=new ma,Od=new Gr,md=[],gd=[],_d=new Float32Array(16),xd=new Float32Array(9),yd=new Float32Array(4);function fr(i,t,e){let n=i[0];if(n<=0||n>0)return i;let s=t*e,r=md[s];if(r===void 0&&(r=new Float32Array(s),md[s]=r),t!==0){n.toArray(r,0);for(let o=1,a=0;o!==t;++o)a+=e,i[o].toArray(r,a)}return r}function Ye(i,t){if(i.length!==t.length)return!1;for(let e=0,n=i.length;e<n;e++)if(i[e]!==t[e])return!1;return!0}function Ze(i,t){for(let e=0,n=t.length;e<n;e++)i[e]=t[e]}function Nl(i,t){let e=gd[t];e===void 0&&(e=new Int32Array(t),gd[t]=e);for(let n=0;n!==t;++n)e[n]=i.allocateTextureUnit();return e}function Zg(i,t){let e=this.cache;e[0]!==t&&(i.uniform1f(this.addr,t),e[0]=t)}function Jg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ye(e,t))return;i.uniform2fv(this.addr,t),Ze(e,t)}}function $g(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(i.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Ye(e,t))return;i.uniform3fv(this.addr,t),Ze(e,t)}}function Kg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ye(e,t))return;i.uniform4fv(this.addr,t),Ze(e,t)}}function jg(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(Ye(e,t))return;i.uniformMatrix2fv(this.addr,!1,t),Ze(e,t)}else{if(Ye(e,n))return;yd.set(n),i.uniformMatrix2fv(this.addr,!1,yd),Ze(e,n)}}function Qg(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(Ye(e,t))return;i.uniformMatrix3fv(this.addr,!1,t),Ze(e,t)}else{if(Ye(e,n))return;xd.set(n),i.uniformMatrix3fv(this.addr,!1,xd),Ze(e,n)}}function t_(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(Ye(e,t))return;i.uniformMatrix4fv(this.addr,!1,t),Ze(e,t)}else{if(Ye(e,n))return;_d.set(n),i.uniformMatrix4fv(this.addr,!1,_d),Ze(e,n)}}function e_(i,t){let e=this.cache;e[0]!==t&&(i.uniform1i(this.addr,t),e[0]=t)}function n_(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ye(e,t))return;i.uniform2iv(this.addr,t),Ze(e,t)}}function i_(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Ye(e,t))return;i.uniform3iv(this.addr,t),Ze(e,t)}}function s_(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ye(e,t))return;i.uniform4iv(this.addr,t),Ze(e,t)}}function r_(i,t){let e=this.cache;e[0]!==t&&(i.uniform1ui(this.addr,t),e[0]=t)}function o_(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ye(e,t))return;i.uniform2uiv(this.addr,t),Ze(e,t)}}function a_(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Ye(e,t))return;i.uniform3uiv(this.addr,t),Ze(e,t)}}function l_(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ye(e,t))return;i.uniform4uiv(this.addr,t),Ze(e,t)}}function c_(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(vh.compareFunction=e.isReversedDepthBuffer()?Rl:Al,r=vh):r=Nd,e.setTexture2D(t||r,s)}function h_(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture3D(t||Fd,s)}function u_(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTextureCube(t||Od,s)}function d_(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture2DArray(t||Ud,s)}function f_(i){switch(i){case 5126:return Zg;case 35664:return Jg;case 35665:return $g;case 35666:return Kg;case 35674:return jg;case 35675:return Qg;case 35676:return t_;case 5124:case 35670:return e_;case 35667:case 35671:return n_;case 35668:case 35672:return i_;case 35669:case 35673:return s_;case 5125:return r_;case 36294:return o_;case 36295:return a_;case 36296:return l_;case 35678:case 36198:case 36298:case 36306:case 35682:return c_;case 35679:case 36299:case 36307:return h_;case 35680:case 36300:case 36308:case 36293:return u_;case 36289:case 36303:case 36311:case 36292:return d_}}function p_(i,t){i.uniform1fv(this.addr,t)}function m_(i,t){let e=fr(t,this.size,2);i.uniform2fv(this.addr,e)}function g_(i,t){let e=fr(t,this.size,3);i.uniform3fv(this.addr,e)}function __(i,t){let e=fr(t,this.size,4);i.uniform4fv(this.addr,e)}function x_(i,t){let e=fr(t,this.size,4);i.uniformMatrix2fv(this.addr,!1,e)}function y_(i,t){let e=fr(t,this.size,9);i.uniformMatrix3fv(this.addr,!1,e)}function v_(i,t){let e=fr(t,this.size,16);i.uniformMatrix4fv(this.addr,!1,e)}function b_(i,t){i.uniform1iv(this.addr,t)}function S_(i,t){i.uniform2iv(this.addr,t)}function M_(i,t){i.uniform3iv(this.addr,t)}function E_(i,t){i.uniform4iv(this.addr,t)}function T_(i,t){i.uniform1uiv(this.addr,t)}function w_(i,t){i.uniform2uiv(this.addr,t)}function A_(i,t){i.uniform3uiv(this.addr,t)}function R_(i,t){i.uniform4uiv(this.addr,t)}function C_(i,t,e){let n=this.cache,s=t.length,r=Nl(e,s);Ye(n,r)||(i.uniform1iv(this.addr,r),Ze(n,r));let o;this.type===i.SAMPLER_2D_SHADOW?o=vh:o=Nd;for(let a=0;a!==s;++a)e.setTexture2D(t[a]||o,r[a])}function P_(i,t,e){let n=this.cache,s=t.length,r=Nl(e,s);Ye(n,r)||(i.uniform1iv(this.addr,r),Ze(n,r));for(let o=0;o!==s;++o)e.setTexture3D(t[o]||Fd,r[o])}function I_(i,t,e){let n=this.cache,s=t.length,r=Nl(e,s);Ye(n,r)||(i.uniform1iv(this.addr,r),Ze(n,r));for(let o=0;o!==s;++o)e.setTextureCube(t[o]||Od,r[o])}function L_(i,t,e){let n=this.cache,s=t.length,r=Nl(e,s);Ye(n,r)||(i.uniform1iv(this.addr,r),Ze(n,r));for(let o=0;o!==s;++o)e.setTexture2DArray(t[o]||Ud,r[o])}function D_(i){switch(i){case 5126:return p_;case 35664:return m_;case 35665:return g_;case 35666:return __;case 35674:return x_;case 35675:return y_;case 35676:return v_;case 5124:case 35670:return b_;case 35667:case 35671:return S_;case 35668:case 35672:return M_;case 35669:case 35673:return E_;case 5125:return T_;case 36294:return w_;case 36295:return A_;case 36296:return R_;case 35678:case 36198:case 36298:case 36306:case 35682:return C_;case 35679:case 36299:case 36307:return P_;case 35680:case 36300:case 36308:case 36293:return I_;case 36289:case 36303:case 36311:case 36292:return L_}}var bh=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=f_(e.type)}},Sh=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=D_(e.type)}},Mh=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){let s=this.seq;for(let r=0,o=s.length;r!==o;++r){let a=s[r];a.setValue(t,e[a.id],n)}}},xh=/(\w+)(\])?(\[|\.)?/g;function vd(i,t){i.seq.push(t),i.map[t.id]=t}function N_(i,t,e){let n=i.name,s=n.length;for(xh.lastIndex=0;;){let r=xh.exec(n),o=xh.lastIndex,a=r[1],l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===s){vd(e,c===void 0?new bh(a,i,t):new Sh(a,i,t));break}else{let u=e.map[a];u===void 0&&(u=new Mh(a),vd(e,u)),e=u}}}var ur=class{constructor(t,e){this.seq=[],this.map={};let n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let o=0;o<n;++o){let a=t.getActiveUniform(e,o),l=t.getUniformLocation(e,a.name);N_(a,l,this)}let s=[],r=[];for(let o of this.seq)o.type===t.SAMPLER_2D_SHADOW||o.type===t.SAMPLER_CUBE_SHADOW||o.type===t.SAMPLER_2D_ARRAY_SHADOW?s.push(o):r.push(o);s.length>0&&(this.seq=s.concat(r))}setValue(t,e,n,s){let r=this.map[e];r!==void 0&&r.setValue(t,n,s)}setOptional(t,e,n){let s=e[n];s!==void 0&&this.setValue(t,n,s)}static upload(t,e,n,s){for(let r=0,o=e.length;r!==o;++r){let a=e[r],l=n[a.id];l.needsUpdate!==!1&&a.setValue(t,l.value,s)}}static seqWithValue(t,e){let n=[];for(let s=0,r=t.length;s!==r;++s){let o=t[s];o.id in e&&n.push(o)}return n}};function bd(i,t,e){let n=i.createShader(t);return i.shaderSource(n,e),i.compileShader(n),n}var U_=37297,F_=0;function O_(i,t){let e=i.split(`
`),n=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let o=s;o<r;o++){let a=o+1;n.push(`${a===t?">":" "} ${a}: ${e[o]}`)}return n.join(`
`)}var Sd=new re;function B_(i){he._getMatrix(Sd,he.workingColorSpace,i);let t=`mat3( ${Sd.elements.map(e=>e.toFixed(4))} )`;switch(he.getTransfer(i)){case Ur:return[t,"LinearTransferOETF"];case _e:return[t,"sRGBTransferOETF"];default:return Qt("WebGLProgram: Unsupported color space: ",i),[t,"LinearTransferOETF"]}}function Md(i,t,e){let n=i.getShaderParameter(t,i.COMPILE_STATUS),r=(i.getShaderInfoLog(t)||"").trim();if(n&&r==="")return"";let o=/ERROR: 0:(\d+)/.exec(r);if(o){let a=parseInt(o[1]);return e.toUpperCase()+`

`+r+`

`+O_(i.getShaderSource(t),a)}else return r}function k_(i,t){let e=B_(t);return[`vec4 ${i}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}var z_={[Hc]:"Linear",[Vc]:"Reinhard",[Gc]:"Cineon",[rr]:"ACESFilmic",[Xc]:"AgX",[qc]:"Neutral",[Wc]:"Custom"};function H_(i,t){let e=z_[t];return e===void 0?(Qt("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}var Pl=new N;function V_(){he.getLuminanceCoefficients(Pl);let i=Pl.x.toFixed(4),t=Pl.y.toFixed(4),e=Pl.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function G_(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(So).join(`
`)}function W_(i){let t=[];for(let e in i){let n=i[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function X_(i,t){let e={},n=i.getProgramParameter(t,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(t,s),o=r.name,a=1;r.type===i.FLOAT_MAT2&&(a=2),r.type===i.FLOAT_MAT3&&(a=3),r.type===i.FLOAT_MAT4&&(a=4),e[o]={type:r.type,location:i.getAttribLocation(t,o),locationSize:a}}return e}function So(i){return i!==""}function Ed(i,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Td(i,t){return i.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var q_=/^[ \t]*#include +<([\w\d./]+)>/gm;function Eh(i){return i.replace(q_,Z_)}var Y_=new Map;function Z_(i,t){let e=le[t];if(e===void 0){let n=Y_.get(t);if(n!==void 0)e=le[n],Qt('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">")}return Eh(e)}var J_=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function wd(i){return i.replace(J_,$_)}function $_(i,t,e,n){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Ad(i){let t=`precision ${i.precision} float;
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
#define LOW_PRECISION`),t}var K_={[ps]:"SHADOWMAP_TYPE_PCF",[ir]:"SHADOWMAP_TYPE_VSM"};function j_(i){return K_[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var Q_={[qi]:"ENVMAP_TYPE_CUBE",[gs]:"ENVMAP_TYPE_CUBE",[ho]:"ENVMAP_TYPE_CUBE_UV"};function tx(i){return i.envMap===!1?"ENVMAP_TYPE_CUBE":Q_[i.envMapMode]||"ENVMAP_TYPE_CUBE"}var ex={[gs]:"ENVMAP_MODE_REFRACTION"};function nx(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":ex[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}var ix={[Ha]:"ENVMAP_BLENDING_MULTIPLY",[zu]:"ENVMAP_BLENDING_MIX",[Hu]:"ENVMAP_BLENDING_ADD"};function sx(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":ix[i.combine]||"ENVMAP_BLENDING_NONE"}function rx(i){let t=i.envMapCubeUVHeight;if(t===null)return null;let e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:n,maxMip:e}}function ox(i,t,e,n){let s=i.getContext(),r=e.defines,o=e.vertexShader,a=e.fragmentShader,l=j_(e),c=tx(e),h=nx(e),u=sx(e),d=rx(e),f=G_(e),g=W_(r),_=s.createProgram(),m,p,v=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(So).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(So).join(`
`),p.length>0&&(p+=`
`)):(m=[Ad(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexNormals?"#define HAS_NORMAL":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(So).join(`
`),p=[Ad(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+h:"",e.envMap?"#define "+u:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.retroreflection?"#define USE_RETROREFLECTION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas||e.batchingColor?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==$n?"#define TONE_MAPPING":"",e.toneMapping!==$n?le.tonemapping_pars_fragment:"",e.toneMapping!==$n?H_("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",le.colorspace_pars_fragment,k_("linearToOutputTexel",e.outputColorSpace),V_(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(So).join(`
`)),o=Eh(o),o=Ed(o,e),o=Td(o,e),a=Eh(a),a=Ed(a,e),a=Td(a,e),o=wd(o),a=wd(a),e.isRawShaderMaterial!==!0&&(v=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",e.glslVersion===th?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===th?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);let S=v+m+o,y=v+p+a,E=bd(s,s.VERTEX_SHADER,S),M=bd(s,s.FRAGMENT_SHADER,y);s.attachShader(_,E),s.attachShader(_,M),e.index0AttributeName!==void 0?s.bindAttribLocation(_,0,e.index0AttributeName):e.hasPositionAttribute===!0&&s.bindAttribLocation(_,0,"position"),s.linkProgram(_);function A(I){if(i.debug.checkShaderErrors){let P=s.getProgramInfoLog(_)||"",O=s.getShaderInfoLog(E)||"",U=s.getShaderInfoLog(M)||"",H=P.trim(),K=O.trim(),L=U.trim(),q=!0,X=!0;if(s.getProgramParameter(_,s.LINK_STATUS)===!1)if(q=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,_,E,M);else{let z=Md(s,E,"vertex"),G=Md(s,M,"fragment");ne("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(_,s.VALIDATE_STATUS)+`

Material Name: `+I.name+`
Material Type: `+I.type+`

Program Info Log: `+H+`
`+z+`
`+G)}else H!==""?Qt("WebGLProgram: Program Info Log:",H):(K===""||L==="")&&(X=!1);X&&(I.diagnostics={runnable:q,programLog:H,vertexShader:{log:K,prefix:m},fragmentShader:{log:L,prefix:p}})}s.deleteShader(E),s.deleteShader(M),x=new ur(s,_),w=X_(s,_)}let x;this.getUniforms=function(){return x===void 0&&A(this),x};let w;this.getAttributes=function(){return w===void 0&&A(this),w};let C=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return C===!1&&(C=s.getProgramParameter(_,U_)),C},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(_),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=F_++,this.cacheKey=t,this.usedTimes=1,this.program=_,this.vertexShader=E,this.fragmentShader=M,this}var ax=0,Th=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,e,n){let s=this._getShaderCacheForMaterial(t);return s.has(e)===!1&&(s.add(e),e.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){let e=this.shaderCache,n=e.get(t);return n===void 0&&(n=new wh(t),e.set(t,n)),n}},wh=class{constructor(t){this.id=ax++,this.code=t,this.usedTimes=0}};function lx(i){return i===Ji||i===_o||i===xo}function cx(i,t,e,n,s,r){let o=new Ys,a=new Th,l=new Set,c=[],h=new Map,u=n.logarithmicDepthBuffer,d=n.precision,f={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(x){return l.add(x),x===0?"uv":`uv${x}`}function _(x,w,C,I,P,O){let U=I.fog,H=P.geometry,K=x.isMeshStandardMaterial||x.isMeshLambertMaterial||x.isMeshPhongMaterial?I.environment:null,L=x.isMeshStandardMaterial||x.isMeshLambertMaterial&&!x.envMap||x.isMeshPhongMaterial&&!x.envMap,q=t.get(x.envMap||K,L),X=q&&q.mapping===ho?q.image.height:null,z=f[x.type];x.precision!==null&&(d=n.getMaxPrecision(x.precision),d!==x.precision&&Qt("WebGLProgram.getParameters:",x.precision,"not supported, using",d,"instead."));let G=H.morphAttributes.position||H.morphAttributes.normal||H.morphAttributes.color,pt=G!==void 0?G.length:0,j=0;H.morphAttributes.position!==void 0&&(j=1),H.morphAttributes.normal!==void 0&&(j=2),H.morphAttributes.color!==void 0&&(j=3);let ht,dt,Mt,Y;if(z){let ve=ci[z];ht=ve.vertexShader,dt=ve.fragmentShader}else{ht=x.vertexShader,dt=x.fragmentShader;let ve=a.getVertexShaderStage(x),fe=a.getFragmentShaderStage(x);a.update(x,ve,fe),Mt=ve.id,Y=fe.id}let nt=i.getRenderTarget(),_t=i.state.buffers.depth.getReversed(),vt=P.isInstancedMesh===!0,xt=P.isBatchedMesh===!0,Dt=!!x.map,te=!!x.matcap,ot=!!q,ut=!!x.aoMap,mt=!!x.lightMap,gt=!!x.bumpMap&&x.wireframe===!1,Et=!!x.normalMap,Kt=!!x.displacementMap,lt=!!x.emissiveMap,Bt=!!x.metalnessMap,Wt=!!x.roughnessMap,D=x.anisotropy>0,ee=x.clearcoat>0,ie=x.dispersion>0,R=x.retroreflectivity>0,b=x.iridescence>0,V=x.sheen>0,Z=x.transmission>0,et=D&&!!x.anisotropyMap,yt=ee&&!!x.clearcoatMap,wt=ee&&!!x.clearcoatNormalMap,tt=ee&&!!x.clearcoatRoughnessMap,rt=b&&!!x.iridescenceMap,At=b&&!!x.iridescenceThicknessMap,Xt=V&&!!x.sheenColorMap,Ct=V&&!!x.sheenRoughnessMap,Rt=!!x.specularMap,Vt=!!x.specularColorMap,it=!!x.specularIntensityMap,bt=Z&&!!x.transmissionMap,F=Z&&!!x.thicknessMap,ft=!!x.gradientMap,st=!!x.alphaMap,Tt=x.alphaTest>0,It=!!x.alphaHash,ct=!!x.extensions,Zt=$n;x.toneMapped&&(nt===null||nt.isXRRenderTarget===!0)&&(Zt=i.toneMapping);let Gt={shaderID:z,shaderType:x.type,shaderName:x.name,vertexShader:ht,fragmentShader:dt,defines:x.defines,customVertexShaderID:Mt,customFragmentShaderID:Y,isRawShaderMaterial:x.isRawShaderMaterial===!0,glslVersion:x.glslVersion,precision:d,batching:xt,batchingColor:xt&&P._colorsTexture!==null,instancing:vt,instancingColor:vt&&P.instanceColor!==null,instancingMorph:vt&&P.morphTexture!==null,outputColorSpace:nt===null?i.outputColorSpace:nt.isXRRenderTarget===!0?nt.texture.colorSpace:he.workingColorSpace,alphaToCoverage:!!x.alphaToCoverage,map:Dt,matcap:te,envMap:ot,envMapMode:ot&&q.mapping,envMapCubeUVHeight:X,aoMap:ut,lightMap:mt,bumpMap:gt,normalMap:Et,displacementMap:Kt,emissiveMap:lt,normalMapObjectSpace:Et&&x.normalMapType===Wu,normalMapTangentSpace:Et&&x.normalMapType===yo,packedNormalMap:Et&&x.normalMapType===yo&&lx(x.normalMap.format),metalnessMap:Bt,roughnessMap:Wt,anisotropy:D,anisotropyMap:et,clearcoat:ee,clearcoatMap:yt,clearcoatNormalMap:wt,clearcoatRoughnessMap:tt,dispersion:ie,retroreflection:R,iridescence:b,iridescenceMap:rt,iridescenceThicknessMap:At,sheen:V,sheenColorMap:Xt,sheenRoughnessMap:Ct,specularMap:Rt,specularColorMap:Vt,specularIntensityMap:it,transmission:Z,transmissionMap:bt,thicknessMap:F,gradientMap:ft,opaque:x.transparent===!1&&x.blending===sr&&x.alphaToCoverage===!1,alphaMap:st,alphaTest:Tt,alphaHash:It,combine:x.combine,mapUv:Dt&&g(x.map.channel),aoMapUv:ut&&g(x.aoMap.channel),lightMapUv:mt&&g(x.lightMap.channel),bumpMapUv:gt&&g(x.bumpMap.channel),normalMapUv:Et&&g(x.normalMap.channel),displacementMapUv:Kt&&g(x.displacementMap.channel),emissiveMapUv:lt&&g(x.emissiveMap.channel),metalnessMapUv:Bt&&g(x.metalnessMap.channel),roughnessMapUv:Wt&&g(x.roughnessMap.channel),anisotropyMapUv:et&&g(x.anisotropyMap.channel),clearcoatMapUv:yt&&g(x.clearcoatMap.channel),clearcoatNormalMapUv:wt&&g(x.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:tt&&g(x.clearcoatRoughnessMap.channel),iridescenceMapUv:rt&&g(x.iridescenceMap.channel),iridescenceThicknessMapUv:At&&g(x.iridescenceThicknessMap.channel),sheenColorMapUv:Xt&&g(x.sheenColorMap.channel),sheenRoughnessMapUv:Ct&&g(x.sheenRoughnessMap.channel),specularMapUv:Rt&&g(x.specularMap.channel),specularColorMapUv:Vt&&g(x.specularColorMap.channel),specularIntensityMapUv:it&&g(x.specularIntensityMap.channel),transmissionMapUv:bt&&g(x.transmissionMap.channel),thicknessMapUv:F&&g(x.thicknessMap.channel),alphaMapUv:st&&g(x.alphaMap.channel),vertexTangents:!!H.attributes.tangent&&(Et||D),vertexNormals:!!H.attributes.normal,vertexColors:x.vertexColors,vertexAlphas:x.vertexColors===!0&&!!H.attributes.color&&H.attributes.color.itemSize===4,pointsUvs:P.isPoints===!0&&!!H.attributes.uv&&(Dt||st),fog:!!U,useFog:x.fog===!0,fogExp2:!!U&&U.isFogExp2,flatShading:x.wireframe===!1&&(x.flatShading===!0||H.attributes.normal===void 0&&Et===!1&&(x.isMeshLambertMaterial||x.isMeshPhongMaterial||x.isMeshStandardMaterial||x.isMeshPhysicalMaterial)),sizeAttenuation:x.sizeAttenuation===!0,logarithmicDepthBuffer:u,reversedDepthBuffer:_t,skinning:P.isSkinnedMesh===!0,hasPositionAttribute:H.attributes.position!==void 0,morphTargets:H.morphAttributes.position!==void 0,morphNormals:H.morphAttributes.normal!==void 0,morphColors:H.morphAttributes.color!==void 0,morphTargetsCount:pt,morphTextureStride:j,numSunLights:w.sun.length,numDirLights:w.directional.length,numPointLights:w.point.length,numSpotLights:w.spot.length,numSpotLightMaps:w.spotLightMap.length,numRectAreaLights:w.rectArea.length,numHemiLights:w.hemi.length,numSunLightShadows:w.sunShadowMap.length,numDirLightShadows:w.directionalShadowMap.length,numPointLightShadows:w.pointShadowMap.length,numSpotLightShadows:w.spotShadowMap.length,numSpotLightShadowsWithMaps:w.numSpotLightShadowsWithMaps,numLightProbes:w.numLightProbes,numLightProbeGrids:O.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:x.dithering,shadowMapEnabled:i.shadowMap.enabled&&C.length>0,shadowMapType:i.shadowMap.type,toneMapping:Zt,decodeVideoTexture:Dt&&x.map.isVideoTexture===!0&&he.getTransfer(x.map.colorSpace)===_e,decodeVideoTextureEmissive:lt&&x.emissiveMap.isVideoTexture===!0&&he.getTransfer(x.emissiveMap.colorSpace)===_e,premultipliedAlpha:x.premultipliedAlpha,doubleSided:x.side===Ne,flipSided:x.side===Xe,useDepthPacking:x.depthPacking>=0,depthPacking:x.depthPacking||0,index0AttributeName:x.index0AttributeName,extensionClipCullDistance:ct&&x.extensions.clipCullDistance===!0&&e.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ct&&x.extensions.multiDraw===!0||xt)&&e.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:e.has("KHR_parallel_shader_compile"),customProgramCacheKey:x.customProgramCacheKey()};return Gt.vertexUv1s=l.has(1),Gt.vertexUv2s=l.has(2),Gt.vertexUv3s=l.has(3),l.clear(),Gt}function m(x){let w=[];if(x.shaderID?w.push(x.shaderID):(w.push(x.customVertexShaderID),w.push(x.customFragmentShaderID)),x.defines!==void 0)for(let C in x.defines)w.push(C),w.push(x.defines[C]);return x.isRawShaderMaterial===!1&&(p(w,x),v(w,x),w.push(i.outputColorSpace)),w.push(x.customProgramCacheKey),w.join()}function p(x,w){x.push(w.precision),x.push(w.outputColorSpace),x.push(w.envMapMode),x.push(w.envMapCubeUVHeight),x.push(w.mapUv),x.push(w.alphaMapUv),x.push(w.lightMapUv),x.push(w.aoMapUv),x.push(w.bumpMapUv),x.push(w.normalMapUv),x.push(w.displacementMapUv),x.push(w.emissiveMapUv),x.push(w.metalnessMapUv),x.push(w.roughnessMapUv),x.push(w.anisotropyMapUv),x.push(w.clearcoatMapUv),x.push(w.clearcoatNormalMapUv),x.push(w.clearcoatRoughnessMapUv),x.push(w.iridescenceMapUv),x.push(w.iridescenceThicknessMapUv),x.push(w.sheenColorMapUv),x.push(w.sheenRoughnessMapUv),x.push(w.specularMapUv),x.push(w.specularColorMapUv),x.push(w.specularIntensityMapUv),x.push(w.transmissionMapUv),x.push(w.thicknessMapUv),x.push(w.combine),x.push(w.fogExp2),x.push(w.sizeAttenuation),x.push(w.morphTargetsCount),x.push(w.morphAttributeCount),x.push(w.numSunLights),x.push(w.numDirLights),x.push(w.numPointLights),x.push(w.numSpotLights),x.push(w.numSpotLightMaps),x.push(w.numHemiLights),x.push(w.numRectAreaLights),x.push(w.numSunLightShadows),x.push(w.numDirLightShadows),x.push(w.numPointLightShadows),x.push(w.numSpotLightShadows),x.push(w.numSpotLightShadowsWithMaps),x.push(w.numLightProbes),x.push(w.shadowMapType),x.push(w.toneMapping),x.push(w.numClippingPlanes),x.push(w.numClipIntersection),x.push(w.depthPacking)}function v(x,w){o.disableAll(),w.instancing&&o.enable(0),w.instancingColor&&o.enable(1),w.instancingMorph&&o.enable(2),w.matcap&&o.enable(3),w.envMap&&o.enable(4),w.normalMapObjectSpace&&o.enable(5),w.normalMapTangentSpace&&o.enable(6),w.clearcoat&&o.enable(7),w.iridescence&&o.enable(8),w.alphaTest&&o.enable(9),w.vertexColors&&o.enable(10),w.vertexAlphas&&o.enable(11),w.vertexUv1s&&o.enable(12),w.vertexUv2s&&o.enable(13),w.vertexUv3s&&o.enable(14),w.vertexTangents&&o.enable(15),w.anisotropy&&o.enable(16),w.alphaHash&&o.enable(17),w.batching&&o.enable(18),w.dispersion&&o.enable(19),w.retroreflection&&o.enable(24),w.batchingColor&&o.enable(20),w.gradientMap&&o.enable(21),w.packedNormalMap&&o.enable(22),w.vertexNormals&&o.enable(23),x.push(o.mask),o.disableAll(),w.fog&&o.enable(0),w.useFog&&o.enable(1),w.flatShading&&o.enable(2),w.logarithmicDepthBuffer&&o.enable(3),w.reversedDepthBuffer&&o.enable(4),w.skinning&&o.enable(5),w.morphTargets&&o.enable(6),w.morphNormals&&o.enable(7),w.morphColors&&o.enable(8),w.premultipliedAlpha&&o.enable(9),w.shadowMapEnabled&&o.enable(10),w.doubleSided&&o.enable(11),w.flipSided&&o.enable(12),w.useDepthPacking&&o.enable(13),w.dithering&&o.enable(14),w.transmission&&o.enable(15),w.sheen&&o.enable(16),w.opaque&&o.enable(17),w.pointsUvs&&o.enable(18),w.decodeVideoTexture&&o.enable(19),w.decodeVideoTextureEmissive&&o.enable(20),w.alphaToCoverage&&o.enable(21),w.numLightProbeGrids>0&&o.enable(22),w.hasPositionAttribute&&o.enable(23),x.push(o.mask)}function S(x){let w=f[x.type],C;if(w){let I=ci[w];C=ld.clone(I.uniforms)}else C=x.uniforms;return C}function y(x,w){let C=h.get(w);return C!==void 0?++C.usedTimes:(C=new ox(i,w,x,s),c.push(C),h.set(w,C)),C}function E(x){if(--x.usedTimes===0){let w=c.indexOf(x);c[w]=c[c.length-1],c.pop(),h.delete(x.cacheKey),x.destroy()}}function M(x){a.remove(x)}function A(){a.dispose()}return{getParameters:_,getProgramCacheKey:m,getUniforms:S,acquireProgram:y,releaseProgram:E,releaseShaderCache:M,programs:c,dispose:A}}function hx(){let i=new WeakMap;function t(o){return i.has(o)}function e(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function s(o,a,l){i.get(o)[a]=l}function r(){i=new WeakMap}return{has:t,get:e,remove:n,update:s,dispose:r}}function ux(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.material.id!==t.material.id?i.material.id-t.material.id:i.materialVariant!==t.materialVariant?i.materialVariant-t.materialVariant:i.z!==t.z?i.z-t.z:i.id-t.id}function Rd(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.z!==t.z?t.z-i.z:i.id-t.id}function Cd(){let i=[],t=0,e=[],n=[],s=[];function r(){t=0,e.length=0,n.length=0,s.length=0}function o(d){let f=0;return d.isInstancedMesh&&(f+=2),d.isSkinnedMesh&&(f+=1),f}function a(d,f,g,_,m,p){let v=i[t];return v===void 0?(v={id:d.id,object:d,geometry:f,material:g,materialVariant:o(d),groupOrder:_,renderOrder:d.renderOrder,z:m,group:p},i[t]=v):(v.id=d.id,v.object=d,v.geometry=f,v.material=g,v.materialVariant=o(d),v.groupOrder=_,v.renderOrder=d.renderOrder,v.z=m,v.group=p),t++,v}function l(d,f,g,_,m,p,v){v.reversedDepth===!0&&(m=-m);let S=a(d,f,g,_,m,p);g.transmission>0?n.push(S):g.transparent===!0?s.push(S):e.push(S)}function c(d,f,g,_,m,p){let v=a(d,f,g,_,m,p);g.transmission>0?n.unshift(v):g.transparent===!0?s.unshift(v):e.unshift(v)}function h(d,f){e.length>1&&e.sort(d||ux),n.length>1&&n.sort(f||Rd),s.length>1&&s.sort(f||Rd)}function u(){for(let d=t,f=i.length;d<f;d++){let g=i[d];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:e,transmissive:n,transparent:s,init:r,push:l,unshift:c,finish:u,sort:h}}function dx(){let i=new WeakMap;function t(n,s){let r=i.get(n),o;return r===void 0?(o=new Cd,i.set(n,[o])):s>=r.length?(o=new Cd,r.push(o)):o=r[s],o}function e(){i=new WeakMap}return{get:t,dispose:e}}function fx(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={direction:new N,color:new jt};break;case"SpotLight":e={position:new N,direction:new N,color:new jt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new N,color:new jt,distance:0,decay:0};break;case"HemisphereLight":e={direction:new N,skyColor:new jt,groundColor:new jt};break;case"RectAreaLight":e={color:new jt,position:new N,halfWidth:new N,halfHeight:new N};break}return i[t.id]=e,e}}}function px(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new at};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new at};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new at,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[t.id]=e,e}}}var mx=0;function gx(i,t){return(t.castShadow?2:0)-(i.castShadow?2:0)+(t.map?1:0)-(i.map?1:0)}function _x(i){let t=new fx,e=px(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new N);let s=new N,r=new Se,o=new Se;function a(c){let h=0,u=0,d=0;for(let P=0;P<9;P++)n.probe[P].set(0,0,0);let f=0,g=0,_=0,m=0,p=0,v=0,S=0,y=0,E=0,M=0,A=0,x=0,w=0,C=0;c.sort(gx);for(let P=0,O=c.length;P<O;P++){let U=c[P],H=U.color,K=U.intensity,L=U.distance,q=null;if(U.shadow&&U.shadow.map&&(U.shadow.map.texture.format===Ji?q=U.shadow.map.texture:q=U.shadow.map.depthTexture||U.shadow.map.texture),U.isAmbientLight)h+=H.r*K,u+=H.g*K,d+=H.b*K;else if(U.isLightProbe){for(let X=0;X<9;X++)n.probe[X].addScaledVector(U.sh.coefficients[X],K);C++}else if(U.isSunLight){let X=t.get(U);if(X.color.copy(U.color).multiplyScalar(U.intensity),U.castShadow){let z=U.shadow,G=e.get(U);G.shadowIntensity=z.intensity,G.shadowBias=z.bias,G.shadowNormalBias=z.normalBias,G.shadowRadius=z.radius,G.shadowMapSize.copy(z.mapSize).multiply(z.getFrameExtents()),n.sunShadow[g]=G,n.sunShadowMap[g]=q;let pt=z.getViewportCount();for(let j=0;j<pt;j++)n.sunShadowMatrix[_+j]=z.getMatrix(j),n.sunShadowCascade[_+j]=z._cascadeData[j];_+=pt,g++}n.sun[f]=X,f++}else if(U.isDirectionalLight){let X=t.get(U);if(X.color.copy(U.color).multiplyScalar(U.intensity),U.castShadow){let z=U.shadow,G=e.get(U);G.shadowIntensity=z.intensity,G.shadowBias=z.bias,G.shadowNormalBias=z.normalBias,G.shadowRadius=z.radius,G.shadowMapSize=z.mapSize,n.directionalShadow[m]=G,n.directionalShadowMap[m]=q,n.directionalShadowMatrix[m]=U.shadow.matrix,E++}n.directional[m]=X,m++}else if(U.isSpotLight){let X=t.get(U);X.position.setFromMatrixPosition(U.matrixWorld),X.color.copy(H).multiplyScalar(K),X.distance=L,X.coneCos=Math.cos(U.angle),X.penumbraCos=Math.cos(U.angle*(1-U.penumbra)),X.decay=U.decay,n.spot[v]=X;let z=U.shadow;if(U.map&&(n.spotLightMap[x]=U.map,x++,z.updateMatrices(U),U.castShadow&&w++),n.spotLightMatrix[v]=z.matrix,U.castShadow){let G=e.get(U);G.shadowIntensity=z.intensity,G.shadowBias=z.bias,G.shadowNormalBias=z.normalBias,G.shadowRadius=z.radius,G.shadowMapSize=z.mapSize,n.spotShadow[v]=G,n.spotShadowMap[v]=q,A++}v++}else if(U.isRectAreaLight){let X=t.get(U);X.color.copy(H).multiplyScalar(K),X.halfWidth.set(U.width*.5,0,0),X.halfHeight.set(0,U.height*.5,0),n.rectArea[S]=X,S++}else if(U.isPointLight){let X=t.get(U);if(X.color.copy(U.color).multiplyScalar(U.intensity),X.distance=U.distance,X.decay=U.decay,U.castShadow){let z=U.shadow,G=e.get(U);G.shadowIntensity=z.intensity,G.shadowBias=z.bias,G.shadowNormalBias=z.normalBias,G.shadowRadius=z.radius,G.shadowMapSize=z.mapSize,G.shadowCameraNear=z.camera.near,G.shadowCameraFar=z.camera.far,n.pointShadow[p]=G,n.pointShadowMap[p]=q,n.pointShadowMatrix[p]=U.shadow.matrix,M++}n.point[p]=X,p++}else if(U.isHemisphereLight){let X=t.get(U);X.skyColor.copy(U.color).multiplyScalar(K),X.groundColor.copy(U.groundColor).multiplyScalar(K),n.hemi[y]=X,y++}}S>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=Lt.LTC_FLOAT_1,n.rectAreaLTC2=Lt.LTC_FLOAT_2):(n.rectAreaLTC1=Lt.LTC_HALF_1,n.rectAreaLTC2=Lt.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=d;let I=n.hash;(I.sunLength!==f||I.directionalLength!==m||I.pointLength!==p||I.spotLength!==v||I.rectAreaLength!==S||I.hemiLength!==y||I.numSunShadows!==g||I.numDirectionalShadows!==E||I.numPointShadows!==M||I.numSpotShadows!==A||I.numSpotMaps!==x||I.numLightProbes!==C)&&(n.sun.length=f,n.directional.length=m,n.spot.length=v,n.rectArea.length=S,n.point.length=p,n.hemi.length=y,n.sunShadow.length=g,n.sunShadowMap.length=g,n.sunShadowMatrix.length=_,n.sunShadowCascade.length=_,n.directionalShadow.length=E,n.directionalShadowMap.length=E,n.directionalShadowMatrix.length=E,n.pointShadow.length=M,n.pointShadowMap.length=M,n.pointShadowMatrix.length=M,n.spotShadow.length=A,n.spotShadowMap.length=A,n.spotLightMatrix.length=A+x-w,n.spotLightMap.length=x,n.numSpotLightShadowsWithMaps=w,n.numLightProbes=C,I.sunLength=f,I.directionalLength=m,I.pointLength=p,I.spotLength=v,I.rectAreaLength=S,I.hemiLength=y,I.numSunShadows=g,I.numDirectionalShadows=E,I.numPointShadows=M,I.numSpotShadows=A,I.numSpotMaps=x,I.numLightProbes=C,n.version=mx++)}function l(c,h){let u=0,d=0,f=0,g=0,_=0,m=0,p=h.matrixWorldInverse;for(let v=0,S=c.length;v<S;v++){let y=c[v];if(y.isSunLight){let E=n.sun[u];E.direction.setFromMatrixPosition(y.matrixWorld),E.direction.transformDirection(p),u++}else if(y.isDirectionalLight){let E=n.directional[d];E.direction.setFromMatrixPosition(y.matrixWorld),s.setFromMatrixPosition(y.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(p),d++}else if(y.isSpotLight){let E=n.spot[g];E.position.setFromMatrixPosition(y.matrixWorld),E.position.applyMatrix4(p),E.direction.setFromMatrixPosition(y.matrixWorld),s.setFromMatrixPosition(y.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(p),g++}else if(y.isRectAreaLight){let E=n.rectArea[_];E.position.setFromMatrixPosition(y.matrixWorld),E.position.applyMatrix4(p),o.identity(),r.copy(y.matrixWorld),r.premultiply(p),o.extractRotation(r),E.halfWidth.set(y.width*.5,0,0),E.halfHeight.set(0,y.height*.5,0),E.halfWidth.applyMatrix4(o),E.halfHeight.applyMatrix4(o),_++}else if(y.isPointLight){let E=n.point[f];E.position.setFromMatrixPosition(y.matrixWorld),E.position.applyMatrix4(p),f++}else if(y.isHemisphereLight){let E=n.hemi[m];E.direction.setFromMatrixPosition(y.matrixWorld),E.direction.transformDirection(p),m++}}}return{setup:a,setupView:l,state:n}}function Pd(i){let t=new _x(i),e=[],n=[],s=[];function r(d){u.camera=d,e.length=0,n.length=0,s.length=0}function o(d){e.push(d)}function a(d){n.push(d)}function l(d){s.push(d)}function c(){t.setup(e)}function h(d){t.setupView(e,d)}let u={lightsArray:e,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:u,setupLights:c,setupLightsView:h,pushLight:o,pushShadow:a,pushLightProbeGrid:l}}function xx(i){let t=new WeakMap;function e(s,r=0){let o=t.get(s),a;return o===void 0?(a=new Pd(i),t.set(s,[a])):r>=o.length?(a=new Pd(i),o.push(a)):a=o[r],a}function n(){t=new WeakMap}return{get:e,dispose:n}}var yx=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,vx=`uniform sampler2D shadow_pass;
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
}`,bx=[new N(1,0,0),new N(-1,0,0),new N(0,1,0),new N(0,-1,0),new N(0,0,1),new N(0,0,-1)],Sx=[new N(0,-1,0),new N(0,-1,0),new N(0,0,1),new N(0,0,-1),new N(0,-1,0),new N(0,-1,0)],Id=new Se,bo=new N,yh=new N;function Mx(i,t,e){let n=new $s,s=new at,r=new at,o=new Pe,a=new Ta,l=new wa,c={},h=e.maxTextureSize,u={[Xi]:Xe,[Xe]:Xi,[Ne]:Ne},d=new Cn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new at},radius:{value:4}},vertexShader:yx,fragmentShader:vx}),f=d.clone();f.defines.HORIZONTAL_PASS=1;let g=new De;g.setAttribute("position",new wn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let _=new Ft(g,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=ps;let p=this.type;this.render=function(M,A,x){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||M.length===0)return;this.type===za&&(Qt("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=ps);let w=i.getRenderTarget(),C=i.getActiveCubeFace(),I=i.getActiveMipmapLevel(),P=i.state;P.setBlending(ai),P.buffers.depth.getReversed()===!0?P.buffers.color.setClear(0,0,0,0):P.buffers.color.setClear(1,1,1,1),P.buffers.depth.setTest(!0),P.setScissorTest(!1);let O=p!==this.type;O&&A.traverse(function(U){U.material&&(Array.isArray(U.material)?U.material.forEach(H=>H.needsUpdate=!0):U.material.needsUpdate=!0)});for(let U=0,H=M.length;U<H;U++){let K=M[U],L=K.shadow;if(L===void 0){Qt("WebGLShadowMap:",K,"has no shadow.");continue}if(L.autoUpdate===!1&&L.needsUpdate===!1)continue;s.copy(L.mapSize);let q=L.getFrameExtents();s.multiply(q),r.copy(L.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/q.x),s.x=r.x*q.x,L.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/q.y),s.y=r.y*q.y,L.mapSize.y=r.y));let X=i.state.buffers.depth.getReversed();if(L.camera._reversedDepth=X,L.map===null||O===!0){if(L.map!==null&&(L.map.depthTexture!==null&&(L.map.depthTexture.dispose(),L.map.depthTexture=null),L.map.dispose()),this.type===ir){if(K.isPointLight){Qt("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}L.map=new _n(s.x,s.y,{format:Ji,type:jn,minFilter:nn,magFilter:nn,generateMipmaps:!1}),L.map.texture.name=K.name+".shadowMap",L.map.depthTexture=new Oi(s.x,s.y,kn),L.map.depthTexture.name=K.name+".shadowMapDepth",L.map.depthTexture.format=ii,L.map.depthTexture.compareFunction=null,L.map.depthTexture.minFilter=tn,L.map.depthTexture.magFilter=tn}else K.isPointLight?(L.map=new Il(s.x),L.map.depthTexture=new ga(s.x,Kn)):(L.map=new _n(s.x,s.y),L.map.depthTexture=new Oi(s.x,s.y,Kn)),L.map.depthTexture.name=K.name+".shadowMap",L.map.depthTexture.format=ii,this.type===ps?(L.map.depthTexture.compareFunction=X?Rl:Al,L.map.depthTexture.minFilter=nn,L.map.depthTexture.magFilter=nn):(L.map.depthTexture.compareFunction=null,L.map.depthTexture.minFilter=tn,L.map.depthTexture.magFilter=tn);L.camera.updateProjectionMatrix()}L.map.isWebGLCubeRenderTarget!==!0&&(L.map.width!==s.x||L.map.height!==s.y)&&L.map.setSize(s.x,s.y);let z=L.map.isWebGLCubeRenderTarget?6:L.getViewportCount();K.isPointLight!==!0&&L.updateMatrices(K,x);for(let G=0;G<z;G++){let pt=L.getCamera(G);if(K.isPointLight){let j=L.camera,ht=L.matrix,dt=K.distance||j.far;dt!==j.far&&(j.far=dt,j.updateProjectionMatrix()),bo.setFromMatrixPosition(K.matrixWorld),j.position.copy(bo),yh.copy(j.position),yh.add(bx[G]),j.up.copy(Sx[G]),j.lookAt(yh),j.updateMatrixWorld(),ht.makeTranslation(-bo.x,-bo.y,-bo.z),Id.multiplyMatrices(j.projectionMatrix,j.matrixWorldInverse),L._frustum.setFromProjectionMatrix(Id,j.coordinateSystem,j.reversedDepth)}if(L.map.isWebGLCubeRenderTarget)i.setRenderTarget(L.map,G),i.clear();else{G===0&&(i.setRenderTarget(L.map),i.clear());let j=L.getViewport(G);o.set(r.x*j.x,r.y*j.y,r.x*j.z,r.y*j.w),P.viewport(o)}n=L.getFrustum(G),y(A,x,pt,K,this.type)}L.isPointLightShadow!==!0&&this.type===ir&&v(L,x),L.needsUpdate=!1}p=this.type,m.needsUpdate=!1,i.setRenderTarget(w,C,I)};function v(M,A){let x=t.update(_);d.defines.VSM_SAMPLES!==M.blurSamples&&(d.defines.VSM_SAMPLES=M.blurSamples,f.defines.VSM_SAMPLES=M.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),M.mapPass===null?M.mapPass=new _n(s.x,s.y,{format:Ji,type:jn}):(M.mapPass.width!==M.map.width||M.mapPass.height!==M.map.height)&&M.mapPass.setSize(M.map.width,M.map.height),d.uniforms.shadow_pass.value=M.map.depthTexture,d.uniforms.resolution.value.set(M.map.width,M.map.height),d.uniforms.radius.value=M.radius,i.setRenderTarget(M.mapPass),i.clear(),i.renderBufferDirect(A,null,x,d,_,null),f.uniforms.shadow_pass.value=M.mapPass.texture,f.uniforms.resolution.value.set(M.map.width,M.map.height),f.uniforms.radius.value=M.radius,i.setRenderTarget(M.map),i.clear(),i.renderBufferDirect(A,null,x,f,_,null)}function S(M,A,x,w){let C=null,I=x.isPointLight===!0?M.customDistanceMaterial:M.customDepthMaterial;if(I!==void 0)C=I;else if(C=x.isPointLight===!0?l:a,i.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0||A.alphaToCoverage===!0){let P=C.uuid,O=A.uuid,U=c[P];U===void 0&&(U={},c[P]=U);let H=U[O];H===void 0&&(H=C.clone(),U[O]=H,A.addEventListener("dispose",E)),C=H}if(C.visible=A.visible,C.wireframe=A.wireframe,w===ir?C.side=A.shadowSide!==null?A.shadowSide:A.side:C.side=A.shadowSide!==null?A.shadowSide:u[A.side],C.alphaMap=A.alphaMap,C.alphaTest=A.alphaToCoverage===!0?.5:A.alphaTest,C.map=A.map,C.clipShadows=A.clipShadows,C.clippingPlanes=A.clippingPlanes,C.clipIntersection=A.clipIntersection,C.displacementMap=A.displacementMap,C.displacementScale=A.displacementScale,C.displacementBias=A.displacementBias,C.wireframeLinewidth=A.wireframeLinewidth,C.linewidth=A.linewidth,x.isPointLight===!0&&C.isMeshDistanceMaterial===!0){let P=i.properties.get(C);P.light=x}return C}function y(M,A,x,w,C){if(M.visible===!1)return;if(M.layers.test(A.layers)&&(M.isMesh||M.isLine||M.isPoints)&&(M.castShadow||M.receiveShadow&&C===ir)&&(!M.frustumCulled||M.intersectsFrustum(n))){M.modelViewMatrix.multiplyMatrices(x.matrixWorldInverse,M.matrixWorld);let O=t.update(M),U=M.material;if(Array.isArray(U)){let H=O.groups;for(let K=0,L=H.length;K<L;K++){let q=H[K],X=U[q.materialIndex];if(X&&X.visible){let z=S(M,X,w,C);M.onBeforeShadow(i,M,A,x,O,z,q),i.renderBufferDirect(x,null,O,z,M,q),M.onAfterShadow(i,M,A,x,O,z,q)}}}else if(U.visible){let H=S(M,U,w,C);M.onBeforeShadow(i,M,A,x,O,H,null),i.renderBufferDirect(x,null,O,H,M,null),M.onAfterShadow(i,M,A,x,O,H,null)}}let P=M.children;for(let O=0,U=P.length;O<U;O++)y(P[O],A,x,w,C)}function E(M){M.target.removeEventListener("dispose",E);for(let x in c){let w=c[x],C=M.target.uuid;C in w&&(w[C].dispose(),delete w[C])}}}function Ex(i,t){function e(){let F=!1,ft=new Pe,st=null,Tt=new Pe(0,0,0,0);return{setMask:function(It){st!==It&&!F&&(i.colorMask(It,It,It,It),st=It)},setLocked:function(It){F=It},setClear:function(It,ct,Zt,Gt,ve){ve===!0&&(It*=Gt,ct*=Gt,Zt*=Gt),ft.set(It,ct,Zt,Gt),Tt.equals(ft)===!1&&(i.clearColor(It,ct,Zt,Gt),Tt.copy(ft))},reset:function(){F=!1,st=null,Tt.set(-1,0,0,0)}}}function n(){let F=!1,ft=!1,st=null,Tt=null,It=null;return{setReversed:function(ct){if(ft!==ct){let Zt=t.get("EXT_clip_control");ct?Zt.clipControlEXT(Zt.LOWER_LEFT_EXT,Zt.ZERO_TO_ONE_EXT):Zt.clipControlEXT(Zt.LOWER_LEFT_EXT,Zt.NEGATIVE_ONE_TO_ONE_EXT),ft=ct;let Gt=It;It=null,this.setClear(Gt)}},getReversed:function(){return ft},setTest:function(ct){ct?nt(i.DEPTH_TEST):_t(i.DEPTH_TEST)},setMask:function(ct){st!==ct&&!F&&(i.depthMask(ct),st=ct)},setFunc:function(ct){if(ft&&(ct=nd[ct]),Tt!==ct){switch(ct){case sa:i.depthFunc(i.NEVER);break;case ra:i.depthFunc(i.ALWAYS);break;case oa:i.depthFunc(i.LESS);break;case Vs:i.depthFunc(i.LEQUAL);break;case aa:i.depthFunc(i.EQUAL);break;case la:i.depthFunc(i.GEQUAL);break;case ca:i.depthFunc(i.GREATER);break;case ha:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}Tt=ct}},setLocked:function(ct){F=ct},setClear:function(ct){It!==ct&&(It=ct,ft&&(ct=1-ct),i.clearDepth(ct))},reset:function(){F=!1,st=null,Tt=null,It=null,ft=!1}}}function s(){let F=!1,ft=null,st=null,Tt=null,It=null,ct=null,Zt=null,Gt=null,ve=null;return{setTest:function(fe){F||(fe?nt(i.STENCIL_TEST):_t(i.STENCIL_TEST))},setMask:function(fe){ft!==fe&&!F&&(i.stencilMask(fe),ft=fe)},setFunc:function(fe,dn,Sn){(st!==fe||Tt!==dn||It!==Sn)&&(i.stencilFunc(fe,dn,Sn),st=fe,Tt=dn,It=Sn)},setOp:function(fe,dn,Sn){(ct!==fe||Zt!==dn||Gt!==Sn)&&(i.stencilOp(fe,dn,Sn),ct=fe,Zt=dn,Gt=Sn)},setLocked:function(fe){F=fe},setClear:function(fe){ve!==fe&&(i.clearStencil(fe),ve=fe)},reset:function(){F=!1,ft=null,st=null,Tt=null,It=null,ct=null,Zt=null,Gt=null,ve=null}}}let r=new e,o=new n,a=new s,l=new WeakMap,c=new WeakMap,h={},u={},d={},f=new WeakMap,g=[],_=null,m=!1,p=null,v=null,S=null,y=null,E=null,M=null,A=null,x=new jt(0,0,0),w=0,C=!1,I=null,P=null,O=null,U=null,H=null,K=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),L=!1,q=0,X=i.getParameter(i.VERSION);X.indexOf("WebGL")!==-1?(q=parseFloat(/^WebGL (\d)/.exec(X)[1]),L=q>=1):X.indexOf("OpenGL ES")!==-1&&(q=parseFloat(/^OpenGL ES (\d)/.exec(X)[1]),L=q>=2);let z=null,G={},pt=i.getParameter(i.SCISSOR_BOX),j=i.getParameter(i.VIEWPORT),ht=new Pe().fromArray(pt),dt=new Pe().fromArray(j);function Mt(F,ft,st,Tt){let It=new Uint8Array(4),ct=i.createTexture();i.bindTexture(F,ct),i.texParameteri(F,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(F,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Zt=0;Zt<st;Zt++)F===i.TEXTURE_3D||F===i.TEXTURE_2D_ARRAY?i.texImage3D(ft,0,i.RGBA,1,1,Tt,0,i.RGBA,i.UNSIGNED_BYTE,It):i.texImage2D(ft+Zt,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,It);return ct}let Y={};Y[i.TEXTURE_2D]=Mt(i.TEXTURE_2D,i.TEXTURE_2D,1),Y[i.TEXTURE_CUBE_MAP]=Mt(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),Y[i.TEXTURE_2D_ARRAY]=Mt(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),Y[i.TEXTURE_3D]=Mt(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),nt(i.DEPTH_TEST),o.setFunc(Vs),gt(!1),Et(Uc),nt(i.CULL_FACE),ut(ai);function nt(F){h[F]!==!0&&(i.enable(F),h[F]=!0)}function _t(F){h[F]!==!1&&(i.disable(F),h[F]=!1)}function vt(F,ft){return d[F]!==ft?(i.bindFramebuffer(F,ft),d[F]=ft,F===i.DRAW_FRAMEBUFFER&&(d[i.FRAMEBUFFER]=ft),F===i.FRAMEBUFFER&&(d[i.DRAW_FRAMEBUFFER]=ft),!0):!1}function xt(F,ft){let st=g,Tt=!1;if(F){st=f.get(ft),st===void 0&&(st=[],f.set(ft,st));let It=F.textures;if(st.length!==It.length||st[0]!==i.COLOR_ATTACHMENT0){for(let ct=0,Zt=It.length;ct<Zt;ct++)st[ct]=i.COLOR_ATTACHMENT0+ct;st.length=It.length,Tt=!0}}else st[0]!==i.BACK&&(st[0]=i.BACK,Tt=!0);Tt&&i.drawBuffers(st)}function Dt(F){return _!==F?(i.useProgram(F),_=F,!0):!1}let te={[ms]:i.FUNC_ADD,[Mu]:i.FUNC_SUBTRACT,[Eu]:i.FUNC_REVERSE_SUBTRACT};te[Tu]=i.MIN,te[wu]=i.MAX;let ot={[Au]:i.ZERO,[Ru]:i.ONE,[Cu]:i.SRC_COLOR,[kc]:i.SRC_ALPHA,[Uu]:i.SRC_ALPHA_SATURATE,[Du]:i.DST_COLOR,[Iu]:i.DST_ALPHA,[Pu]:i.ONE_MINUS_SRC_COLOR,[zc]:i.ONE_MINUS_SRC_ALPHA,[Nu]:i.ONE_MINUS_DST_COLOR,[Lu]:i.ONE_MINUS_DST_ALPHA,[Fu]:i.CONSTANT_COLOR,[Ou]:i.ONE_MINUS_CONSTANT_COLOR,[Bu]:i.CONSTANT_ALPHA,[ku]:i.ONE_MINUS_CONSTANT_ALPHA};function ut(F,ft,st,Tt,It,ct,Zt,Gt,ve,fe){if(F===ai){m===!0&&(_t(i.BLEND),m=!1);return}if(m===!1&&(nt(i.BLEND),m=!0),F!==Su){if(F!==p||fe!==C){if((v!==ms||E!==ms)&&(i.blendEquation(i.FUNC_ADD),v=ms,E=ms),fe)switch(F){case sr:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Fc:i.blendFunc(i.ONE,i.ONE);break;case Oc:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Bc:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:ne("WebGLState: Invalid blending: ",F);break}else switch(F){case sr:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Fc:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case Oc:ne("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Bc:ne("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:ne("WebGLState: Invalid blending: ",F);break}S=null,y=null,M=null,A=null,x.set(0,0,0),w=0,p=F,C=fe}return}It=It||ft,ct=ct||st,Zt=Zt||Tt,(ft!==v||It!==E)&&(i.blendEquationSeparate(te[ft],te[It]),v=ft,E=It),(st!==S||Tt!==y||ct!==M||Zt!==A)&&(i.blendFuncSeparate(ot[st],ot[Tt],ot[ct],ot[Zt]),S=st,y=Tt,M=ct,A=Zt),(Gt.equals(x)===!1||ve!==w)&&(i.blendColor(Gt.r,Gt.g,Gt.b,ve),x.copy(Gt),w=ve),p=F,C=!1}function mt(F,ft){F.side===Ne?_t(i.CULL_FACE):nt(i.CULL_FACE);let st=F.side===Xe;ft&&(st=!st),gt(st),F.blending===sr&&F.transparent===!1?ut(ai):ut(F.blending,F.blendEquation,F.blendSrc,F.blendDst,F.blendEquationAlpha,F.blendSrcAlpha,F.blendDstAlpha,F.blendColor,F.blendAlpha,F.premultipliedAlpha),o.setFunc(F.depthFunc),o.setTest(F.depthTest),o.setMask(F.depthWrite),r.setMask(F.colorWrite);let Tt=F.stencilWrite;a.setTest(Tt),Tt&&(a.setMask(F.stencilWriteMask),a.setFunc(F.stencilFunc,F.stencilRef,F.stencilFuncMask),a.setOp(F.stencilFail,F.stencilZFail,F.stencilZPass)),lt(F.polygonOffset,F.polygonOffsetFactor,F.polygonOffsetUnits),F.alphaToCoverage===!0?nt(i.SAMPLE_ALPHA_TO_COVERAGE):_t(i.SAMPLE_ALPHA_TO_COVERAGE)}function gt(F){I!==F&&(F?i.frontFace(i.CW):i.frontFace(i.CCW),I=F)}function Et(F){F!==vu?(nt(i.CULL_FACE),F!==P&&(F===Uc?i.cullFace(i.BACK):F===bu?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):_t(i.CULL_FACE),P=F}function Kt(F){F!==O&&(L&&i.lineWidth(F),O=F)}function lt(F,ft,st){F?(nt(i.POLYGON_OFFSET_FILL),(U!==ft||H!==st)&&(U=ft,H=st,o.getReversed()&&(ft=-ft),i.polygonOffset(ft,st))):_t(i.POLYGON_OFFSET_FILL)}function Bt(F){F?nt(i.SCISSOR_TEST):_t(i.SCISSOR_TEST)}function Wt(F){F===void 0&&(F=i.TEXTURE0+K-1),z!==F&&(i.activeTexture(F),z=F)}function D(F,ft,st){st===void 0&&(z===null?st=i.TEXTURE0+K-1:st=z);let Tt=G[st];Tt===void 0&&(Tt={type:void 0,texture:void 0},G[st]=Tt),(Tt.type!==F||Tt.texture!==ft)&&(z!==st&&(i.activeTexture(st),z=st),i.bindTexture(F,ft||Y[F]),Tt.type=F,Tt.texture=ft)}function ee(){let F=G[z];F!==void 0&&F.type!==void 0&&(i.bindTexture(F.type,null),F.type=void 0,F.texture=void 0)}function ie(){try{i.compressedTexImage2D(...arguments)}catch(F){ne("WebGLState:",F)}}function R(){try{i.compressedTexImage3D(...arguments)}catch(F){ne("WebGLState:",F)}}function b(){try{i.texSubImage2D(...arguments)}catch(F){ne("WebGLState:",F)}}function V(){try{i.texSubImage3D(...arguments)}catch(F){ne("WebGLState:",F)}}function Z(){try{i.compressedTexSubImage2D(...arguments)}catch(F){ne("WebGLState:",F)}}function et(){try{i.compressedTexSubImage3D(...arguments)}catch(F){ne("WebGLState:",F)}}function yt(){try{i.texStorage2D(...arguments)}catch(F){ne("WebGLState:",F)}}function wt(){try{i.texStorage3D(...arguments)}catch(F){ne("WebGLState:",F)}}function tt(){try{i.texImage2D(...arguments)}catch(F){ne("WebGLState:",F)}}function rt(){try{i.texImage3D(...arguments)}catch(F){ne("WebGLState:",F)}}function At(F){return u[F]!==void 0?u[F]:i.getParameter(F)}function Xt(F,ft){u[F]!==ft&&(i.pixelStorei(F,ft),u[F]=ft)}function Ct(F){ht.equals(F)===!1&&(i.scissor(F.x,F.y,F.z,F.w),ht.copy(F))}function Rt(F){dt.equals(F)===!1&&(i.viewport(F.x,F.y,F.z,F.w),dt.copy(F))}function Vt(F,ft){let st=c.get(ft);st===void 0&&(st=new WeakMap,c.set(ft,st));let Tt=st.get(F);Tt===void 0&&(Tt=i.getUniformBlockIndex(ft,F.name),st.set(F,Tt))}function it(F,ft){let Tt=c.get(ft).get(F);l.get(ft)!==Tt&&(i.uniformBlockBinding(ft,Tt,F.__bindingPointIndex),l.set(ft,Tt))}function bt(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),o.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),h={},u={},z=null,G={},d={},f=new WeakMap,g=[],_=null,m=!1,p=null,v=null,S=null,y=null,E=null,M=null,A=null,x=new jt(0,0,0),w=0,C=!1,I=null,P=null,O=null,U=null,H=null,ht.set(0,0,i.canvas.width,i.canvas.height),dt.set(0,0,i.canvas.width,i.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:nt,disable:_t,bindFramebuffer:vt,drawBuffers:xt,useProgram:Dt,setBlending:ut,setMaterial:mt,setFlipSided:gt,setCullFace:Et,setLineWidth:Kt,setPolygonOffset:lt,setScissorTest:Bt,activeTexture:Wt,bindTexture:D,unbindTexture:ee,compressedTexImage2D:ie,compressedTexImage3D:R,texImage2D:tt,texImage3D:rt,pixelStorei:Xt,getParameter:At,updateUBOMapping:Vt,uniformBlockBinding:it,texStorage2D:yt,texStorage3D:wt,texSubImage2D:b,texSubImage3D:V,compressedTexSubImage2D:Z,compressedTexSubImage3D:et,scissor:Ct,viewport:Rt,reset:bt}}function Tx(i,t,e,n,s,r,o){let a=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator=="undefined"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new at,h=new WeakMap,u=new Set,d,f=new WeakMap,g=!1;try{g=typeof OffscreenCanvas!="undefined"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function _(R,b){return g?new OffscreenCanvas(R,b):Fr("canvas")}function m(R,b,V){let Z=1,et=ie(R);if((et.width>V||et.height>V)&&(Z=V/Math.max(et.width,et.height)),Z<1)if(typeof HTMLImageElement!="undefined"&&R instanceof HTMLImageElement||typeof HTMLCanvasElement!="undefined"&&R instanceof HTMLCanvasElement||typeof ImageBitmap!="undefined"&&R instanceof ImageBitmap||typeof VideoFrame!="undefined"&&R instanceof VideoFrame){let yt=Math.floor(Z*et.width),wt=Math.floor(Z*et.height);d===void 0&&(d=_(yt,wt));let tt=b?_(yt,wt):d;return tt.width=yt,tt.height=wt,tt.getContext("2d").drawImage(R,0,0,yt,wt),Qt("WebGLRenderer: Texture has been resized from ("+et.width+"x"+et.height+") to ("+yt+"x"+wt+")."),tt}else return"data"in R&&Qt("WebGLRenderer: Image in DataTexture is too big ("+et.width+"x"+et.height+")."),R;return R}function p(R){return R.generateMipmaps}function v(R){i.generateMipmap(R)}function S(R){return R.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:R.isWebGL3DRenderTarget?i.TEXTURE_3D:R.isWebGLArrayRenderTarget||R.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function y(R,b,V,Z,et,yt=!1){if(R!==null){if(i[R]!==void 0)return i[R];Qt("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+R+"'")}let wt;Z&&(wt=t.get("EXT_texture_norm16"),wt||Qt("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let tt=b;if(b===i.RED&&(V===i.FLOAT&&(tt=i.R32F),V===i.HALF_FLOAT&&(tt=i.R16F),V===i.UNSIGNED_BYTE&&(tt=i.R8),V===i.UNSIGNED_SHORT&&wt&&(tt=wt.R16_EXT),V===i.SHORT&&wt&&(tt=wt.R16_SNORM_EXT)),b===i.RED_INTEGER&&(V===i.UNSIGNED_BYTE&&(tt=i.R8UI),V===i.UNSIGNED_SHORT&&(tt=i.R16UI),V===i.UNSIGNED_INT&&(tt=i.R32UI),V===i.BYTE&&(tt=i.R8I),V===i.SHORT&&(tt=i.R16I),V===i.INT&&(tt=i.R32I)),b===i.RG&&(V===i.FLOAT&&(tt=i.RG32F),V===i.HALF_FLOAT&&(tt=i.RG16F),V===i.UNSIGNED_BYTE&&(tt=i.RG8),V===i.UNSIGNED_SHORT&&wt&&(tt=wt.RG16_EXT),V===i.SHORT&&wt&&(tt=wt.RG16_SNORM_EXT)),b===i.RG_INTEGER&&(V===i.UNSIGNED_BYTE&&(tt=i.RG8UI),V===i.UNSIGNED_SHORT&&(tt=i.RG16UI),V===i.UNSIGNED_INT&&(tt=i.RG32UI),V===i.BYTE&&(tt=i.RG8I),V===i.SHORT&&(tt=i.RG16I),V===i.INT&&(tt=i.RG32I)),b===i.RGB_INTEGER&&(V===i.UNSIGNED_BYTE&&(tt=i.RGB8UI),V===i.UNSIGNED_SHORT&&(tt=i.RGB16UI),V===i.UNSIGNED_INT&&(tt=i.RGB32UI),V===i.BYTE&&(tt=i.RGB8I),V===i.SHORT&&(tt=i.RGB16I),V===i.INT&&(tt=i.RGB32I)),b===i.RGBA_INTEGER&&(V===i.UNSIGNED_BYTE&&(tt=i.RGBA8UI),V===i.UNSIGNED_SHORT&&(tt=i.RGBA16UI),V===i.UNSIGNED_INT&&(tt=i.RGBA32UI),V===i.BYTE&&(tt=i.RGBA8I),V===i.SHORT&&(tt=i.RGBA16I),V===i.INT&&(tt=i.RGBA32I)),b===i.RGB&&(V===i.UNSIGNED_SHORT&&wt&&(tt=wt.RGB16_EXT),V===i.SHORT&&wt&&(tt=wt.RGB16_SNORM_EXT),V===i.UNSIGNED_INT_5_9_9_9_REV&&(tt=i.RGB9_E5),V===i.UNSIGNED_INT_10F_11F_11F_REV&&(tt=i.R11F_G11F_B10F)),b===i.RGBA){let rt=yt?Ur:he.getTransfer(et);V===i.FLOAT&&(tt=i.RGBA32F),V===i.HALF_FLOAT&&(tt=i.RGBA16F),V===i.UNSIGNED_BYTE&&(tt=rt===_e?i.SRGB8_ALPHA8:i.RGBA8),V===i.UNSIGNED_SHORT&&wt&&(tt=wt.RGBA16_EXT),V===i.SHORT&&wt&&(tt=wt.RGBA16_SNORM_EXT),V===i.UNSIGNED_SHORT_4_4_4_4&&(tt=i.RGBA4),V===i.UNSIGNED_SHORT_5_5_5_1&&(tt=i.RGB5_A1)}return(tt===i.R16F||tt===i.R32F||tt===i.RG16F||tt===i.RG32F||tt===i.RGBA16F||tt===i.RGBA32F)&&t.get("EXT_color_buffer_float"),tt}function E(R,b){let V;return R?b===null||b===Kn||b===lr?V=i.DEPTH24_STENCIL8:b===kn?V=i.DEPTH32F_STENCIL8:b===ar&&(V=i.DEPTH24_STENCIL8,Qt("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):b===null||b===Kn||b===lr?V=i.DEPTH_COMPONENT24:b===kn?V=i.DEPTH_COMPONENT32F:b===ar&&(V=i.DEPTH_COMPONENT16),V}function M(R,b){return p(R)===!0||R.isFramebufferTexture&&R.minFilter!==tn&&R.minFilter!==nn?Math.log2(Math.max(b.width,b.height))+1:R.mipmaps!==void 0&&R.mipmaps.length>0?R.mipmaps.length:R.isCompressedTexture&&Array.isArray(R.image)?b.mipmaps.length:1}function A(R){let b=R.target;b.removeEventListener("dispose",A),w(b),b.isVideoTexture&&h.delete(b),b.isHTMLTexture&&u.delete(b)}function x(R){let b=R.target;b.removeEventListener("dispose",x),I(b)}function w(R){let b=n.get(R);if(b.__webglInit===void 0)return;let V=R.source,Z=f.get(V);if(Z){let et=Z[b.__cacheKey];et.usedTimes--,et.usedTimes===0&&C(R),Object.keys(Z).length===0&&f.delete(V)}n.remove(R)}function C(R){let b=n.get(R);i.deleteTexture(b.__webglTexture);let V=R.source,Z=f.get(V);delete Z[b.__cacheKey],o.memory.textures--}function I(R){let b=n.get(R);if(R.depthTexture&&(R.depthTexture.dispose(),n.remove(R.depthTexture)),R.isWebGLCubeRenderTarget)for(let Z=0;Z<6;Z++){if(Array.isArray(b.__webglFramebuffer[Z]))for(let et=0;et<b.__webglFramebuffer[Z].length;et++)i.deleteFramebuffer(b.__webglFramebuffer[Z][et]);else i.deleteFramebuffer(b.__webglFramebuffer[Z]);b.__webglDepthbuffer&&i.deleteRenderbuffer(b.__webglDepthbuffer[Z])}else{if(Array.isArray(b.__webglFramebuffer))for(let Z=0;Z<b.__webglFramebuffer.length;Z++)i.deleteFramebuffer(b.__webglFramebuffer[Z]);else i.deleteFramebuffer(b.__webglFramebuffer);if(b.__webglDepthbuffer&&i.deleteRenderbuffer(b.__webglDepthbuffer),b.__webglMultisampledFramebuffer&&i.deleteFramebuffer(b.__webglMultisampledFramebuffer),b.__webglColorRenderbuffer)for(let Z=0;Z<b.__webglColorRenderbuffer.length;Z++)b.__webglColorRenderbuffer[Z]&&i.deleteRenderbuffer(b.__webglColorRenderbuffer[Z]);b.__webglDepthRenderbuffer&&i.deleteRenderbuffer(b.__webglDepthRenderbuffer)}let V=R.textures;for(let Z=0,et=V.length;Z<et;Z++){let yt=n.get(V[Z]);yt.__webglTexture&&(i.deleteTexture(yt.__webglTexture),o.memory.textures--),n.remove(V[Z])}n.remove(R)}let P=0;function O(){P=0}function U(){return P}function H(R){P=R}function K(){let R=P;return R>=s.maxTextures&&Qt("WebGLTextures: Trying to use "+(R+1)+" texture units while this GPU supports only "+s.maxTextures),P+=1,R}function L(R){let b=[];return b.push(R.wrapS),b.push(R.wrapT),b.push(R.wrapR||0),b.push(R.magFilter),b.push(R.minFilter),b.push(R.anisotropy),b.push(R.internalFormat),b.push(R.format),b.push(R.type),b.push(R.generateMipmaps),b.push(R.premultiplyAlpha),b.push(R.flipY),b.push(R.unpackAlignment),b.push(R.colorSpace),b.join()}function q(R,b){let V=n.get(R);if(R.isVideoTexture&&D(R),R.isRenderTargetTexture===!1&&R.isExternalTexture!==!0&&R.version>0&&V.__version!==R.version){let Z=R.image;if(Z===null)Qt("WebGLRenderer: Texture marked for update but no image data found.");else if(Z.complete===!1)Qt("WebGLRenderer: Texture marked for update but image is incomplete");else{_t(V,R,b);return}}else R.isExternalTexture&&(V.__webglTexture=R.sourceTexture?R.sourceTexture:null);e.bindTexture(i.TEXTURE_2D,V.__webglTexture,i.TEXTURE0+b)}function X(R,b){let V=n.get(R);if(R.isRenderTargetTexture===!1&&R.version>0&&V.__version!==R.version){_t(V,R,b);return}else R.isExternalTexture&&(V.__webglTexture=R.sourceTexture?R.sourceTexture:null);e.bindTexture(i.TEXTURE_2D_ARRAY,V.__webglTexture,i.TEXTURE0+b)}function z(R,b){let V=n.get(R);if(R.isRenderTargetTexture===!1&&R.version>0&&V.__version!==R.version){_t(V,R,b);return}e.bindTexture(i.TEXTURE_3D,V.__webglTexture,i.TEXTURE0+b)}function G(R,b){let V=n.get(R);if(R.isCubeDepthTexture!==!0&&R.version>0&&V.__version!==R.version){vt(V,R,b);return}e.bindTexture(i.TEXTURE_CUBE_MAP,V.__webglTexture,i.TEXTURE0+b)}let pt={[Gs]:i.REPEAT,[ni]:i.CLAMP_TO_EDGE,[ua]:i.MIRRORED_REPEAT},j={[tn]:i.NEAREST,[Vu]:i.NEAREST_MIPMAP_NEAREST,[uo]:i.NEAREST_MIPMAP_LINEAR,[nn]:i.LINEAR,[Ga]:i.LINEAR_MIPMAP_NEAREST,[Yi]:i.LINEAR_MIPMAP_LINEAR},ht={[qu]:i.NEVER,[Ku]:i.ALWAYS,[Yu]:i.LESS,[Al]:i.LEQUAL,[Zu]:i.EQUAL,[Rl]:i.GEQUAL,[Ju]:i.GREATER,[$u]:i.NOTEQUAL};function dt(R,b){if(b.type===kn&&t.has("OES_texture_float_linear")===!1&&(b.magFilter===nn||b.magFilter===Ga||b.magFilter===uo||b.magFilter===Yi||b.minFilter===nn||b.minFilter===Ga||b.minFilter===uo||b.minFilter===Yi)&&Qt("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(R,i.TEXTURE_WRAP_S,pt[b.wrapS]),i.texParameteri(R,i.TEXTURE_WRAP_T,pt[b.wrapT]),(R===i.TEXTURE_3D||R===i.TEXTURE_2D_ARRAY)&&i.texParameteri(R,i.TEXTURE_WRAP_R,pt[b.wrapR]),i.texParameteri(R,i.TEXTURE_MAG_FILTER,j[b.magFilter]),i.texParameteri(R,i.TEXTURE_MIN_FILTER,j[b.minFilter]),b.compareFunction&&(i.texParameteri(R,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(R,i.TEXTURE_COMPARE_FUNC,ht[b.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(b.magFilter===tn||b.minFilter!==uo&&b.minFilter!==Yi||b.type===kn&&t.has("OES_texture_float_linear")===!1)return;if(b.anisotropy>1||n.get(b).__currentAnisotropy){let V=t.get("EXT_texture_filter_anisotropic");i.texParameterf(R,V.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(b.anisotropy,s.getMaxAnisotropy())),n.get(b).__currentAnisotropy=b.anisotropy}}}function Mt(R,b){let V=!1;R.__webglInit===void 0&&(R.__webglInit=!0,b.addEventListener("dispose",A));let Z=b.source,et=f.get(Z);et===void 0&&(et={},f.set(Z,et));let yt=L(b);if(yt!==R.__cacheKey){et[yt]===void 0&&(et[yt]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,V=!0),et[yt].usedTimes++;let wt=et[R.__cacheKey];wt!==void 0&&(et[R.__cacheKey].usedTimes--,wt.usedTimes===0&&C(b)),R.__cacheKey=yt,R.__webglTexture=et[yt].texture}return V}function Y(R,b,V){return Math.floor(Math.floor(R/V)/b)}function nt(R,b,V,Z){let yt=R.updateRanges;if(yt.length===0)e.texSubImage2D(i.TEXTURE_2D,0,0,0,b.width,b.height,V,Z,b.data);else{yt.sort((Xt,Ct)=>Xt.start-Ct.start);let wt=0;for(let Xt=1;Xt<yt.length;Xt++){let Ct=yt[wt],Rt=yt[Xt],Vt=Ct.start+Ct.count,it=Y(Rt.start,b.width,4),bt=Y(Ct.start,b.width,4);Rt.start<=Vt+1&&it===bt&&Y(Rt.start+Rt.count-1,b.width,4)===it?Ct.count=Math.max(Ct.count,Rt.start+Rt.count-Ct.start):(++wt,yt[wt]=Rt)}yt.length=wt+1;let tt=e.getParameter(i.UNPACK_ROW_LENGTH),rt=e.getParameter(i.UNPACK_SKIP_PIXELS),At=e.getParameter(i.UNPACK_SKIP_ROWS);e.pixelStorei(i.UNPACK_ROW_LENGTH,b.width);for(let Xt=0,Ct=yt.length;Xt<Ct;Xt++){let Rt=yt[Xt],Vt=Math.floor(Rt.start/4),it=Math.ceil(Rt.count/4),bt=Vt%b.width,F=Math.floor(Vt/b.width),ft=it,st=1;e.pixelStorei(i.UNPACK_SKIP_PIXELS,bt),e.pixelStorei(i.UNPACK_SKIP_ROWS,F),e.texSubImage2D(i.TEXTURE_2D,0,bt,F,ft,st,V,Z,b.data)}R.clearUpdateRanges(),e.pixelStorei(i.UNPACK_ROW_LENGTH,tt),e.pixelStorei(i.UNPACK_SKIP_PIXELS,rt),e.pixelStorei(i.UNPACK_SKIP_ROWS,At)}}function _t(R,b,V){let Z=i.TEXTURE_2D;(b.isDataArrayTexture||b.isCompressedArrayTexture)&&(Z=i.TEXTURE_2D_ARRAY),b.isData3DTexture&&(Z=i.TEXTURE_3D);let et=Mt(R,b),yt=b.source;e.bindTexture(Z,R.__webglTexture,i.TEXTURE0+V);let wt=n.get(yt);if(yt.version!==wt.__version||et===!0){if(e.activeTexture(i.TEXTURE0+V),(typeof ImageBitmap!="undefined"&&b.image instanceof ImageBitmap)===!1){let st=he.getPrimaries(he.workingColorSpace),Tt=b.colorSpace===Ei?null:he.getPrimaries(b.colorSpace),It=b.colorSpace===Ei||st===Tt?i.NONE:i.BROWSER_DEFAULT_WEBGL;e.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,b.flipY),e.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),e.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,It)}e.pixelStorei(i.UNPACK_ALIGNMENT,b.unpackAlignment);let rt=m(b.image,!1,s.maxTextureSize);rt=ee(b,rt);let At=r.convert(b.format,b.colorSpace),Xt=r.convert(b.type),Ct=y(b.internalFormat,At,Xt,b.normalized,b.colorSpace,b.isVideoTexture);dt(Z,b);let Rt,Vt=b.mipmaps,it=b.isVideoTexture!==!0,bt=wt.__version===void 0||et===!0,F=yt.dataReady,ft=M(b,rt);if(b.isDepthTexture)Ct=E(b.format===Zi,b.type),bt&&(it?e.texStorage2D(i.TEXTURE_2D,1,Ct,rt.width,rt.height):e.texImage2D(i.TEXTURE_2D,0,Ct,rt.width,rt.height,0,At,Xt,null));else if(b.isDataTexture)if(Vt.length>0){it&&bt&&e.texStorage2D(i.TEXTURE_2D,ft,Ct,Vt[0].width,Vt[0].height);for(let st=0,Tt=Vt.length;st<Tt;st++)Rt=Vt[st],it?F&&e.texSubImage2D(i.TEXTURE_2D,st,0,0,Rt.width,Rt.height,At,Xt,Rt.data):e.texImage2D(i.TEXTURE_2D,st,Ct,Rt.width,Rt.height,0,At,Xt,Rt.data);b.generateMipmaps=!1}else it?(bt&&e.texStorage2D(i.TEXTURE_2D,ft,Ct,rt.width,rt.height),F&&nt(b,rt,At,Xt)):e.texImage2D(i.TEXTURE_2D,0,Ct,rt.width,rt.height,0,At,Xt,rt.data);else if(b.isCompressedTexture)if(b.isCompressedArrayTexture){it&&bt&&e.texStorage3D(i.TEXTURE_2D_ARRAY,ft,Ct,Vt[0].width,Vt[0].height,rt.depth);for(let st=0,Tt=Vt.length;st<Tt;st++)if(Rt=Vt[st],b.format!==zn)if(At!==null)if(it){if(F)if(b.layerUpdates.size>0){let It=lh(Rt.width,Rt.height,b.format,b.type);for(let ct of b.layerUpdates){let Zt=Rt.data.subarray(ct*It/Rt.data.BYTES_PER_ELEMENT,(ct+1)*It/Rt.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,st,0,0,ct,Rt.width,Rt.height,1,At,Zt)}}else e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,st,0,0,0,Rt.width,Rt.height,rt.depth,At,Rt.data)}else e.compressedTexImage3D(i.TEXTURE_2D_ARRAY,st,Ct,Rt.width,Rt.height,rt.depth,0,Rt.data,0,0);else Qt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else it?F&&e.texSubImage3D(i.TEXTURE_2D_ARRAY,st,0,0,0,Rt.width,Rt.height,rt.depth,At,Xt,Rt.data):e.texImage3D(i.TEXTURE_2D_ARRAY,st,Ct,Rt.width,Rt.height,rt.depth,0,At,Xt,Rt.data);b.layerUpdates.size>0&&b.clearLayerUpdates()}else{it&&bt&&e.texStorage2D(i.TEXTURE_2D,ft,Ct,Vt[0].width,Vt[0].height);for(let st=0,Tt=Vt.length;st<Tt;st++)Rt=Vt[st],b.format!==zn?At!==null?it?F&&e.compressedTexSubImage2D(i.TEXTURE_2D,st,0,0,Rt.width,Rt.height,At,Rt.data):e.compressedTexImage2D(i.TEXTURE_2D,st,Ct,Rt.width,Rt.height,0,Rt.data):Qt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):it?F&&e.texSubImage2D(i.TEXTURE_2D,st,0,0,Rt.width,Rt.height,At,Xt,Rt.data):e.texImage2D(i.TEXTURE_2D,st,Ct,Rt.width,Rt.height,0,At,Xt,Rt.data)}else if(b.isDataArrayTexture)if(it){if(bt&&e.texStorage3D(i.TEXTURE_2D_ARRAY,ft,Ct,rt.width,rt.height,rt.depth),F)if(b.layerUpdates.size>0){let st=lh(rt.width,rt.height,b.format,b.type);for(let Tt of b.layerUpdates){let It=rt.data.subarray(Tt*st/rt.data.BYTES_PER_ELEMENT,(Tt+1)*st/rt.data.BYTES_PER_ELEMENT);e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,Tt,rt.width,rt.height,1,At,Xt,It)}b.clearLayerUpdates()}else e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,rt.width,rt.height,rt.depth,At,Xt,rt.data)}else e.texImage3D(i.TEXTURE_2D_ARRAY,0,Ct,rt.width,rt.height,rt.depth,0,At,Xt,rt.data);else if(b.isData3DTexture)it?(bt&&e.texStorage3D(i.TEXTURE_3D,ft,Ct,rt.width,rt.height,rt.depth),F&&e.texSubImage3D(i.TEXTURE_3D,0,0,0,0,rt.width,rt.height,rt.depth,At,Xt,rt.data)):e.texImage3D(i.TEXTURE_3D,0,Ct,rt.width,rt.height,rt.depth,0,At,Xt,rt.data);else if(b.isFramebufferTexture){if(bt)if(it)e.texStorage2D(i.TEXTURE_2D,ft,Ct,rt.width,rt.height);else{let st=rt.width,Tt=rt.height;for(let It=0;It<ft;It++)e.texImage2D(i.TEXTURE_2D,It,Ct,st,Tt,0,At,Xt,null),st>>=1,Tt>>=1}}else if(b.isHTMLTexture){if("texElementImage2D"in i){let st=i.canvas;if(st.hasAttribute("layoutsubtree")||st.setAttribute("layoutsubtree","true"),rt.parentNode!==st){st.appendChild(rt),u.add(b),st.onpaint=Tt=>{let It=Tt.changedElements;for(let ct of u)It.includes(ct.image)&&(ct.needsUpdate=!0)},st.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,rt);else{let It=i.RGBA,ct=i.RGBA,Zt=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,It,ct,Zt,rt)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(Vt.length>0){if(it&&bt){let st=ie(Vt[0]);e.texStorage2D(i.TEXTURE_2D,ft,Ct,st.width,st.height)}for(let st=0,Tt=Vt.length;st<Tt;st++)Rt=Vt[st],it?F&&e.texSubImage2D(i.TEXTURE_2D,st,0,0,At,Xt,Rt):e.texImage2D(i.TEXTURE_2D,st,Ct,At,Xt,Rt);b.generateMipmaps=!1}else if(it){if(bt){let st=ie(rt);e.texStorage2D(i.TEXTURE_2D,ft,Ct,st.width,st.height)}F&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,At,Xt,rt)}else e.texImage2D(i.TEXTURE_2D,0,Ct,At,Xt,rt);p(b)&&v(Z),wt.__version=yt.version,b.onUpdate&&b.onUpdate(b)}R.__version=b.version}function vt(R,b,V){if(b.image.length!==6)return;let Z=Mt(R,b),et=b.source;e.bindTexture(i.TEXTURE_CUBE_MAP,R.__webglTexture,i.TEXTURE0+V);let yt=n.get(et);if(et.version!==yt.__version||Z===!0){e.activeTexture(i.TEXTURE0+V);let wt=he.getPrimaries(he.workingColorSpace),tt=b.colorSpace===Ei?null:he.getPrimaries(b.colorSpace),rt=b.colorSpace===Ei||wt===tt?i.NONE:i.BROWSER_DEFAULT_WEBGL;e.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,b.flipY),e.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),e.pixelStorei(i.UNPACK_ALIGNMENT,b.unpackAlignment),e.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,rt);let At=b.isCompressedTexture||b.image[0].isCompressedTexture,Xt=b.image[0]&&b.image[0].isDataTexture,Ct=[];for(let ct=0;ct<6;ct++)!At&&!Xt?Ct[ct]=m(b.image[ct],!0,s.maxCubemapSize):Ct[ct]=Xt?b.image[ct].image:b.image[ct],Ct[ct]=ee(b,Ct[ct]);let Rt=Ct[0],Vt=r.convert(b.format,b.colorSpace),it=r.convert(b.type),bt=y(b.internalFormat,Vt,it,b.normalized,b.colorSpace),F=b.isVideoTexture!==!0,ft=yt.__version===void 0||Z===!0,st=et.dataReady,Tt=M(b,Rt);dt(i.TEXTURE_CUBE_MAP,b);let It;if(At){F&&ft&&e.texStorage2D(i.TEXTURE_CUBE_MAP,Tt,bt,Rt.width,Rt.height);for(let ct=0;ct<6;ct++){It=Ct[ct].mipmaps;for(let Zt=0;Zt<It.length;Zt++){let Gt=It[Zt];b.format!==zn?Vt!==null?F?st&&e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ct,Zt,0,0,Gt.width,Gt.height,Vt,Gt.data):e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ct,Zt,bt,Gt.width,Gt.height,0,Gt.data):Qt("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):F?st&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ct,Zt,0,0,Gt.width,Gt.height,Vt,it,Gt.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ct,Zt,bt,Gt.width,Gt.height,0,Vt,it,Gt.data)}}}else{if(It=b.mipmaps,F&&ft){It.length>0&&Tt++;let ct=ie(Ct[0]);e.texStorage2D(i.TEXTURE_CUBE_MAP,Tt,bt,ct.width,ct.height)}for(let ct=0;ct<6;ct++)if(Xt){F?st&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ct,0,0,0,Ct[ct].width,Ct[ct].height,Vt,it,Ct[ct].data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ct,0,bt,Ct[ct].width,Ct[ct].height,0,Vt,it,Ct[ct].data);for(let Zt=0;Zt<It.length;Zt++){let ve=It[Zt].image[ct].image;F?st&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ct,Zt+1,0,0,ve.width,ve.height,Vt,it,ve.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ct,Zt+1,bt,ve.width,ve.height,0,Vt,it,ve.data)}}else{F?st&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ct,0,0,0,Vt,it,Ct[ct]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ct,0,bt,Vt,it,Ct[ct]);for(let Zt=0;Zt<It.length;Zt++){let Gt=It[Zt];F?st&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ct,Zt+1,0,0,Vt,it,Gt.image[ct]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ct,Zt+1,bt,Vt,it,Gt.image[ct])}}}p(b)&&v(i.TEXTURE_CUBE_MAP),yt.__version=et.version,b.onUpdate&&b.onUpdate(b)}R.__version=b.version}function xt(R,b,V,Z,et,yt){let wt=r.convert(V.format,V.colorSpace),tt=r.convert(V.type),rt=y(V.internalFormat,wt,tt,V.normalized,V.colorSpace),At=n.get(b),Xt=n.get(V);if(Xt.__renderTarget=b,!At.__hasExternalTextures){let Ct=Math.max(1,b.width>>yt),Rt=Math.max(1,b.height>>yt);et===i.TEXTURE_3D||et===i.TEXTURE_2D_ARRAY?e.texImage3D(et,yt,rt,Ct,Rt,b.depth,0,wt,tt,null):e.texImage2D(et,yt,rt,Ct,Rt,0,wt,tt,null)}e.bindFramebuffer(i.FRAMEBUFFER,R),Wt(b)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,Z,et,Xt.__webglTexture,0,Bt(b)):(et===i.TEXTURE_2D||et>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&et<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,Z,et,Xt.__webglTexture,yt),e.bindFramebuffer(i.FRAMEBUFFER,null)}function Dt(R,b,V){if(i.bindRenderbuffer(i.RENDERBUFFER,R),b.depthBuffer){let Z=b.depthTexture,et=Z&&Z.isDepthTexture?Z.type:null,yt=E(b.stencilBuffer,et),wt=b.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;Wt(b)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Bt(b),yt,b.width,b.height):V?i.renderbufferStorageMultisample(i.RENDERBUFFER,Bt(b),yt,b.width,b.height):i.renderbufferStorage(i.RENDERBUFFER,yt,b.width,b.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,wt,i.RENDERBUFFER,R)}else{let Z=b.textures;for(let et=0;et<Z.length;et++){let yt=Z[et],wt=r.convert(yt.format,yt.colorSpace),tt=r.convert(yt.type),rt=y(yt.internalFormat,wt,tt,yt.normalized,yt.colorSpace);Wt(b)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Bt(b),rt,b.width,b.height):V?i.renderbufferStorageMultisample(i.RENDERBUFFER,Bt(b),rt,b.width,b.height):i.renderbufferStorage(i.RENDERBUFFER,rt,b.width,b.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function te(R,b,V){let Z=b.isWebGLCubeRenderTarget===!0;if(e.bindFramebuffer(i.FRAMEBUFFER,R),!(b.depthTexture&&b.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let et=n.get(b.depthTexture);if(et.__renderTarget=b,(!et.__webglTexture||b.depthTexture.image.width!==b.width||b.depthTexture.image.height!==b.height)&&(b.depthTexture.image.width=b.width,b.depthTexture.image.height=b.height,b.depthTexture.needsUpdate=!0),Z){if(et.__webglInit===void 0&&(et.__webglInit=!0,b.depthTexture.addEventListener("dispose",A)),et.__webglTexture===void 0){et.__webglTexture=i.createTexture(),e.bindTexture(i.TEXTURE_CUBE_MAP,et.__webglTexture),dt(i.TEXTURE_CUBE_MAP,b.depthTexture);let At=r.convert(b.depthTexture.format),Xt=r.convert(b.depthTexture.type),Ct;b.depthTexture.format===ii?Ct=i.DEPTH_COMPONENT24:b.depthTexture.format===Zi&&(Ct=i.DEPTH24_STENCIL8);for(let Rt=0;Rt<6;Rt++)i.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Rt,0,Ct,b.width,b.height,0,At,Xt,null)}}else q(b.depthTexture,0);let yt=et.__webglTexture,wt=Bt(b),tt=Z?i.TEXTURE_CUBE_MAP_POSITIVE_X+V:i.TEXTURE_2D,rt=b.depthTexture.format===Zi?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(b.depthTexture.format===ii)Wt(b)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,rt,tt,yt,0,wt):i.framebufferTexture2D(i.FRAMEBUFFER,rt,tt,yt,0);else if(b.depthTexture.format===Zi)Wt(b)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,rt,tt,yt,0,wt):i.framebufferTexture2D(i.FRAMEBUFFER,rt,tt,yt,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function ot(R){let b=n.get(R),V=R.isWebGLCubeRenderTarget===!0;if(b.__boundDepthTexture!==R.depthTexture){let Z=R.depthTexture;if(b.__depthDisposeCallback&&b.__depthDisposeCallback(),Z){let et=()=>{delete b.__boundDepthTexture,delete b.__depthDisposeCallback,Z.removeEventListener("dispose",et)};Z.addEventListener("dispose",et),b.__depthDisposeCallback=et}b.__boundDepthTexture=Z}if(R.depthTexture&&!b.__autoAllocateDepthBuffer)if(V)for(let Z=0;Z<6;Z++)te(b.__webglFramebuffer[Z],R,Z);else{let Z=R.texture.mipmaps;Z&&Z.length>0?te(b.__webglFramebuffer[0],R,0):te(b.__webglFramebuffer,R,0)}else if(V){b.__webglDepthbuffer=[];for(let Z=0;Z<6;Z++)if(e.bindFramebuffer(i.FRAMEBUFFER,b.__webglFramebuffer[Z]),b.__webglDepthbuffer[Z]===void 0)b.__webglDepthbuffer[Z]=i.createRenderbuffer(),Dt(b.__webglDepthbuffer[Z],R,!1);else{let et=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,yt=b.__webglDepthbuffer[Z];i.bindRenderbuffer(i.RENDERBUFFER,yt),i.framebufferRenderbuffer(i.FRAMEBUFFER,et,i.RENDERBUFFER,yt)}}else{let Z=R.texture.mipmaps;if(Z&&Z.length>0?e.bindFramebuffer(i.FRAMEBUFFER,b.__webglFramebuffer[0]):e.bindFramebuffer(i.FRAMEBUFFER,b.__webglFramebuffer),b.__webglDepthbuffer===void 0)b.__webglDepthbuffer=i.createRenderbuffer(),Dt(b.__webglDepthbuffer,R,!1);else{let et=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,yt=b.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,yt),i.framebufferRenderbuffer(i.FRAMEBUFFER,et,i.RENDERBUFFER,yt)}}e.bindFramebuffer(i.FRAMEBUFFER,null)}function ut(R,b,V){let Z=n.get(R);b!==void 0&&xt(Z.__webglFramebuffer,R,R.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),V!==void 0&&ot(R)}function mt(R){let b=R.texture,V=n.get(R),Z=n.get(b);R.addEventListener("dispose",x);let et=R.textures,yt=R.isWebGLCubeRenderTarget===!0,wt=et.length>1;if(wt||(Z.__webglTexture===void 0&&(Z.__webglTexture=i.createTexture()),Z.__version=b.version,o.memory.textures++),yt){V.__webglFramebuffer=[];for(let tt=0;tt<6;tt++)if(b.mipmaps&&b.mipmaps.length>0){V.__webglFramebuffer[tt]=[];for(let rt=0;rt<b.mipmaps.length;rt++)V.__webglFramebuffer[tt][rt]=i.createFramebuffer()}else V.__webglFramebuffer[tt]=i.createFramebuffer()}else{if(b.mipmaps&&b.mipmaps.length>0){V.__webglFramebuffer=[];for(let tt=0;tt<b.mipmaps.length;tt++)V.__webglFramebuffer[tt]=i.createFramebuffer()}else V.__webglFramebuffer=i.createFramebuffer();if(wt)for(let tt=0,rt=et.length;tt<rt;tt++){let At=n.get(et[tt]);At.__webglTexture===void 0&&(At.__webglTexture=i.createTexture(),o.memory.textures++)}if(R.samples>0&&Wt(R)===!1){V.__webglMultisampledFramebuffer=i.createFramebuffer(),V.__webglColorRenderbuffer=[],e.bindFramebuffer(i.FRAMEBUFFER,V.__webglMultisampledFramebuffer);for(let tt=0;tt<et.length;tt++){let rt=et[tt];V.__webglColorRenderbuffer[tt]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,V.__webglColorRenderbuffer[tt]);let At=r.convert(rt.format,rt.colorSpace),Xt=r.convert(rt.type),Ct=y(rt.internalFormat,At,Xt,rt.normalized,rt.colorSpace,R.isXRRenderTarget===!0),Rt=Bt(R);i.renderbufferStorageMultisample(i.RENDERBUFFER,Rt,Ct,R.width,R.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+tt,i.RENDERBUFFER,V.__webglColorRenderbuffer[tt])}i.bindRenderbuffer(i.RENDERBUFFER,null),R.depthBuffer&&(V.__webglDepthRenderbuffer=i.createRenderbuffer(),Dt(V.__webglDepthRenderbuffer,R,!0)),e.bindFramebuffer(i.FRAMEBUFFER,null)}}if(yt){e.bindTexture(i.TEXTURE_CUBE_MAP,Z.__webglTexture),dt(i.TEXTURE_CUBE_MAP,b);for(let tt=0;tt<6;tt++)if(b.mipmaps&&b.mipmaps.length>0)for(let rt=0;rt<b.mipmaps.length;rt++)xt(V.__webglFramebuffer[tt][rt],R,b,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+tt,rt);else xt(V.__webglFramebuffer[tt],R,b,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+tt,0);p(b)&&v(i.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(wt){for(let tt=0,rt=et.length;tt<rt;tt++){let At=et[tt],Xt=n.get(At),Ct=i.TEXTURE_2D;(R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(Ct=R.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(Ct,Xt.__webglTexture),dt(Ct,At),xt(V.__webglFramebuffer,R,At,i.COLOR_ATTACHMENT0+tt,Ct,0),p(At)&&v(Ct)}e.unbindTexture()}else{let tt=i.TEXTURE_2D;if((R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(tt=R.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(tt,Z.__webglTexture),dt(tt,b),b.mipmaps&&b.mipmaps.length>0)for(let rt=0;rt<b.mipmaps.length;rt++)xt(V.__webglFramebuffer[rt],R,b,i.COLOR_ATTACHMENT0,tt,rt);else xt(V.__webglFramebuffer,R,b,i.COLOR_ATTACHMENT0,tt,0);p(b)&&v(tt),e.unbindTexture()}R.depthBuffer&&ot(R)}function gt(R){let b=R.textures;for(let V=0,Z=b.length;V<Z;V++){let et=b[V];if(p(et)){let yt=S(R),wt=n.get(et).__webglTexture;e.bindTexture(yt,wt),v(yt),e.unbindTexture()}}}let Et=[],Kt=[];function lt(R){if(R.samples>0){if(Wt(R)===!1){let b=R.textures,V=R.width,Z=R.height,et=i.COLOR_BUFFER_BIT,yt=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,wt=n.get(R),tt=b.length>1;if(tt)for(let At=0;At<b.length;At++)e.bindFramebuffer(i.FRAMEBUFFER,wt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+At,i.RENDERBUFFER,null),e.bindFramebuffer(i.FRAMEBUFFER,wt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+At,i.TEXTURE_2D,null,0);e.bindFramebuffer(i.READ_FRAMEBUFFER,wt.__webglMultisampledFramebuffer);let rt=R.texture.mipmaps;rt&&rt.length>0?e.bindFramebuffer(i.DRAW_FRAMEBUFFER,wt.__webglFramebuffer[0]):e.bindFramebuffer(i.DRAW_FRAMEBUFFER,wt.__webglFramebuffer);for(let At=0;At<b.length;At++){if(R.resolveDepthBuffer&&(R.depthBuffer&&(et|=i.DEPTH_BUFFER_BIT),R.stencilBuffer&&R.resolveStencilBuffer&&(et|=i.STENCIL_BUFFER_BIT)),tt){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,wt.__webglColorRenderbuffer[At]);let Xt=n.get(b[At]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Xt,0)}i.blitFramebuffer(0,0,V,Z,0,0,V,Z,et,i.NEAREST),l===!0&&(Et.length=0,Kt.length=0,Et.push(i.COLOR_ATTACHMENT0+At),R.depthBuffer&&R.storeMultisampledDepthBuffer===!1&&(Et.push(yt),Kt.push(yt),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,Kt)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,Et))}if(e.bindFramebuffer(i.READ_FRAMEBUFFER,null),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),tt)for(let At=0;At<b.length;At++){e.bindFramebuffer(i.FRAMEBUFFER,wt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+At,i.RENDERBUFFER,wt.__webglColorRenderbuffer[At]);let Xt=n.get(b[At]).__webglTexture;e.bindFramebuffer(i.FRAMEBUFFER,wt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+At,i.TEXTURE_2D,Xt,0)}e.bindFramebuffer(i.DRAW_FRAMEBUFFER,wt.__webglMultisampledFramebuffer)}else if(R.depthBuffer&&R.storeMultisampledDepthBuffer===!1&&l){let b=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[b])}}}function Bt(R){return Math.min(s.maxSamples,R.samples)}function Wt(R){let b=n.get(R);return R.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&b.__useRenderToTexture!==!1}function D(R){let b=o.render.frame;h.get(R)!==b&&(h.set(R,b),R.update())}function ee(R,b){let V=R.colorSpace,Z=R.format,et=R.type;return R.isCompressedTexture===!0||R.isVideoTexture===!0||V!==Nr&&V!==Ei&&(he.getTransfer(V)===_e?(Z!==zn||et!==yn)&&Qt("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):ne("WebGLTextures: Unsupported texture color space:",V)),b}function ie(R){return typeof HTMLImageElement!="undefined"&&R instanceof HTMLImageElement?(c.width=R.naturalWidth||R.width,c.height=R.naturalHeight||R.height):typeof VideoFrame!="undefined"&&R instanceof VideoFrame?(c.width=R.displayWidth,c.height=R.displayHeight):(c.width=R.width,c.height=R.height),c}this.allocateTextureUnit=K,this.resetTextureUnits=O,this.getTextureUnits=U,this.setTextureUnits=H,this.setTexture2D=q,this.setTexture2DArray=X,this.setTexture3D=z,this.setTextureCube=G,this.rebindTextures=ut,this.setupRenderTarget=mt,this.updateRenderTargetMipmap=gt,this.updateMultisampleRenderTarget=lt,this.setupDepthRenderbuffer=ot,this.setupFrameBufferTexture=xt,this.useMultisampledRTT=Wt,this.isReversedDepthBuffer=function(){return e.buffers.depth.getReversed()}}function wx(i,t){function e(n,s=Ei){let r,o=he.getTransfer(s);if(n===yn)return i.UNSIGNED_BYTE;if(n===Xa)return i.UNSIGNED_SHORT_4_4_4_4;if(n===qa)return i.UNSIGNED_SHORT_5_5_5_1;if(n===$c)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Kc)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===Zc)return i.BYTE;if(n===Jc)return i.SHORT;if(n===ar)return i.UNSIGNED_SHORT;if(n===Wa)return i.INT;if(n===Kn)return i.UNSIGNED_INT;if(n===kn)return i.FLOAT;if(n===jn)return i.HALF_FLOAT;if(n===jc)return i.ALPHA;if(n===Qc)return i.RGB;if(n===zn)return i.RGBA;if(n===ii)return i.DEPTH_COMPONENT;if(n===Zi)return i.DEPTH_STENCIL;if(n===Ya)return i.RED;if(n===Za)return i.RED_INTEGER;if(n===Ji)return i.RG;if(n===Ja)return i.RG_INTEGER;if(n===$a)return i.RGBA_INTEGER;if(n===fo||n===po||n===mo||n===go)if(o===_e)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===fo)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===po)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===mo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===go)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===fo)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===po)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===mo)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===go)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Ka||n===ja||n===Qa||n===tl)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Ka)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===ja)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Qa)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===tl)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===el||n===nl||n===il||n===sl||n===rl||n===_o||n===ol)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===el||n===nl)return o===_e?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===il)return o===_e?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===sl)return r.COMPRESSED_R11_EAC;if(n===rl)return r.COMPRESSED_SIGNED_R11_EAC;if(n===_o)return r.COMPRESSED_RG11_EAC;if(n===ol)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===al||n===ll||n===cl||n===hl||n===ul||n===dl||n===fl||n===pl||n===ml||n===gl||n===_l||n===xl||n===yl||n===vl)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===al)return o===_e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===ll)return o===_e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===cl)return o===_e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===hl)return o===_e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===ul)return o===_e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===dl)return o===_e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===fl)return o===_e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===pl)return o===_e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===ml)return o===_e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===gl)return o===_e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===_l)return o===_e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===xl)return o===_e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===yl)return o===_e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===vl)return o===_e?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===bl||n===Sl||n===Ml)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===bl)return o===_e?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Sl)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Ml)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===El||n===Tl||n===xo||n===wl)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===El)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Tl)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===xo)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===wl)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===lr?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:e}}var Ax=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Rx=`
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

}`,Ah=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){let n=new Xr(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=n}}getMesh(t){if(this.texture!==null&&this.mesh===null){let e=t.cameras[0].viewport,n=new Cn({vertexShader:Ax,fragmentShader:Rx,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new Ft(new Bn(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Rh=class extends Jn{constructor(t,e){super();let n=this,s=null,r=1,o=null,a="local-floor",l=1,c=null,h=null,u=null,d=null,f=null,g=null,_=typeof XRWebGLBinding!="undefined",m=new Ah,p={},v=e.getContextAttributes(),S=null,y=null,E=[],M=[],A=new at,x=null,w=null,C=new qe;C.viewport=new Pe;let I=new qe;I.viewport=new Pe;let P=[C,I],O=new Ba,U=null,H=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Y){let nt=E[Y];return nt===void 0&&(nt=new Zs,E[Y]=nt),nt.getTargetRaySpace()},this.getControllerGrip=function(Y){let nt=E[Y];return nt===void 0&&(nt=new Zs,E[Y]=nt),nt.getGripSpace()},this.getHand=function(Y){let nt=E[Y];return nt===void 0&&(nt=new Zs,E[Y]=nt),nt.getHandSpace()};function K(Y){let nt=M.indexOf(Y.inputSource);if(nt===-1)return;let _t=E[nt];_t!==void 0&&(_t.update(Y.inputSource,Y.frame,c||o),_t.dispatchEvent({type:Y.type,data:Y.inputSource}))}function L(){s.removeEventListener("select",K),s.removeEventListener("selectstart",K),s.removeEventListener("selectend",K),s.removeEventListener("squeeze",K),s.removeEventListener("squeezestart",K),s.removeEventListener("squeezeend",K),s.removeEventListener("end",L),s.removeEventListener("inputsourceschange",q);for(let Y=0;Y<E.length;Y++){let nt=M[Y];nt!==null&&(M[Y]=null,E[Y].disconnect(nt))}U=null,H=null,m.reset();for(let Y in p)delete p[Y];if(t.setRenderTarget(S),f=null,d=null,u=null,s=null,y=null,Mt.stop(),n.isPresenting=!1,t.setPixelRatio(x),t.setSize(A.width,A.height,!1),w!==null){let Y=w.camera;Y.fov=w.fov,Y.zoom=w.zoom,Y.updateProjectionMatrix(),w=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Y){r=Y,n.isPresenting===!0&&Qt("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Y){a=Y,n.isPresenting===!0&&Qt("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(Y){c=Y},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return u===null&&_&&(u=new XRWebGLBinding(s,e)),u},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(Y){if(s=Y,s!==null){if(S=t.getRenderTarget(),s.addEventListener("select",K),s.addEventListener("selectstart",K),s.addEventListener("selectend",K),s.addEventListener("squeeze",K),s.addEventListener("squeezestart",K),s.addEventListener("squeezeend",K),s.addEventListener("end",L),s.addEventListener("inputsourceschange",q),v.xrCompatible!==!0&&await e.makeXRCompatible(),x=t.getPixelRatio(),t.getSize(A),_&&"createProjectionLayer"in XRWebGLBinding.prototype){let _t=null,vt=null,xt=null;v.depth&&(xt=v.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,_t=v.stencil?Zi:ii,vt=v.stencil?lr:Kn);let Dt={colorFormat:e.RGBA8,depthFormat:xt,scaleFactor:r};u=this.getBinding(),d=u.createProjectionLayer(Dt),s.updateRenderState({layers:[d]}),t.setPixelRatio(1),t.setSize(d.textureWidth,d.textureHeight,!1),y=new _n(d.textureWidth,d.textureHeight,{format:zn,type:yn,depthTexture:new Oi(d.textureWidth,d.textureHeight,vt,void 0,void 0,void 0,void 0,void 0,void 0,_t),stencilBuffer:v.stencil,colorSpace:t.outputColorSpace,samples:v.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}else{let _t={antialias:v.antialias,alpha:!0,depth:v.depth,stencil:v.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,e,_t),s.updateRenderState({baseLayer:f}),t.setPixelRatio(1),t.setSize(f.framebufferWidth,f.framebufferHeight,!1),y=new _n(f.framebufferWidth,f.framebufferHeight,{format:zn,type:yn,colorSpace:t.outputColorSpace,stencilBuffer:v.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await s.requestReferenceSpace(a),Mt.setContext(s),Mt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function q(Y){for(let nt=0;nt<Y.removed.length;nt++){let _t=Y.removed[nt],vt=M.indexOf(_t);vt>=0&&(M[vt]=null,E[vt].disconnect(_t))}for(let nt=0;nt<Y.added.length;nt++){let _t=Y.added[nt],vt=M.indexOf(_t);if(vt===-1){for(let Dt=0;Dt<E.length;Dt++)if(Dt>=M.length){M.push(_t),vt=Dt;break}else if(M[Dt]===null){M[Dt]=_t,vt=Dt;break}if(vt===-1)break}let xt=E[vt];xt&&xt.connect(_t)}}let X=new N,z=new N;function G(Y,nt,_t){X.setFromMatrixPosition(nt.matrixWorld),z.setFromMatrixPosition(_t.matrixWorld);let vt=X.distanceTo(z),xt=nt.projectionMatrix.elements,Dt=_t.projectionMatrix.elements,te=xt[14]/(xt[10]-1),ot=xt[14]/(xt[10]+1),ut=(xt[9]+1)/xt[5],mt=(xt[9]-1)/xt[5],gt=(xt[8]-1)/xt[0],Et=(Dt[8]+1)/Dt[0],Kt=te*gt,lt=te*Et,Bt=vt/(-gt+Et),Wt=Bt*-gt;if(nt.matrixWorld.decompose(Y.position,Y.quaternion,Y.scale),Y.translateX(Wt),Y.translateZ(Bt),Y.matrixWorld.compose(Y.position,Y.quaternion,Y.scale),Y.matrixWorldInverse.copy(Y.matrixWorld).invert(),xt[10]===-1)Y.projectionMatrix.copy(nt.projectionMatrix),Y.projectionMatrixInverse.copy(nt.projectionMatrixInverse);else{let D=te+Bt,ee=ot+Bt,ie=Kt-Wt,R=lt+(vt-Wt),b=ut*ot/ee*D,V=mt*ot/ee*D;Y.projectionMatrix.makePerspective(ie,R,b,V,D,ee),Y.projectionMatrixInverse.copy(Y.projectionMatrix).invert()}}function pt(Y,nt){nt===null?Y.matrixWorld.copy(Y.matrix):Y.matrixWorld.multiplyMatrices(nt.matrixWorld,Y.matrix),Y.matrixWorldInverse.copy(Y.matrixWorld).invert()}this.updateCamera=function(Y){if(s===null)return;let nt=Y.near,_t=Y.far;m.texture!==null&&(m.depthNear>0&&(nt=m.depthNear),m.depthFar>0&&(_t=m.depthFar)),O.near=I.near=C.near=nt,O.far=I.far=C.far=_t,(U!==O.near||H!==O.far)&&(s.updateRenderState({depthNear:O.near,depthFar:O.far}),U=O.near,H=O.far),O.layers.mask=Y.layers.mask|6,C.layers.mask=O.layers.mask&-5,I.layers.mask=O.layers.mask&-3;let vt=Y.parent,xt=O.cameras;pt(O,vt);for(let Dt=0;Dt<xt.length;Dt++)pt(xt[Dt],vt);xt.length===2?G(O,C,I):O.projectionMatrix.copy(C.projectionMatrix),w===null&&Y.isPerspectiveCamera&&(w={camera:Y,fov:Y.fov,zoom:Y.zoom}),j(Y,O,vt)};function j(Y,nt,_t){_t===null?Y.matrix.copy(nt.matrixWorld):(Y.matrix.copy(_t.matrixWorld),Y.matrix.invert(),Y.matrix.multiply(nt.matrixWorld)),Y.matrix.decompose(Y.position,Y.quaternion,Y.scale),Y.updateMatrixWorld(!0),Y.projectionMatrix.copy(nt.projectionMatrix),Y.projectionMatrixInverse.copy(nt.projectionMatrixInverse),Y.isPerspectiveCamera&&(Y.fov=cs*2*Math.atan(1/Y.projectionMatrix.elements[5]),Y.zoom=1)}this.getCamera=function(){return O},this.getFoveation=function(){if(!(d===null&&f===null))return l},this.setFoveation=function(Y){l=Y,d!==null&&(d.fixedFoveation=Y),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=Y)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(O)},this.getCameraTexture=function(Y){return p[Y]};let ht=null;function dt(Y,nt){if(h=nt.getViewerPose(c||o),g=nt,h!==null){let _t=h.views;f!==null&&(t.setRenderTargetFramebuffer(y,f.framebuffer),t.setRenderTarget(y));let vt=!1;_t.length!==O.cameras.length&&(O.cameras.length=0,vt=!0);for(let ot=0;ot<_t.length;ot++){let ut=_t[ot],mt=null;if(f!==null)mt=f.getViewport(ut);else{let Et=u.getViewSubImage(d,ut);mt=Et.viewport,ot===0&&(t.setRenderTargetTextures(y,Et.colorTexture,Et.depthStencilTexture),t.setRenderTarget(y))}let gt=P[ot];gt===void 0&&(gt=new qe,gt.layers.enable(ot),gt.viewport=new Pe,P[ot]=gt),gt.matrix.fromArray(ut.transform.matrix),gt.matrix.decompose(gt.position,gt.quaternion,gt.scale),gt.projectionMatrix.fromArray(ut.projectionMatrix),gt.projectionMatrixInverse.copy(gt.projectionMatrix).invert(),gt.viewport.set(mt.x,mt.y,mt.width,mt.height),ot===0&&(O.matrix.copy(gt.matrix),O.matrix.decompose(O.position,O.quaternion,O.scale)),vt===!0&&O.cameras.push(gt)}let xt=s.enabledFeatures;if(xt&&xt.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&_){u=n.getBinding();let ot=u.getDepthInformation(_t[0]);ot&&ot.isValid&&ot.texture&&m.init(ot,s.renderState)}if(xt&&xt.includes("camera-access")&&_){t.state.unbindTexture(),u=n.getBinding();for(let ot=0;ot<_t.length;ot++){let ut=_t[ot].camera;if(ut){let mt=p[ut];mt||(mt=new Xr,p[ut]=mt);let gt=u.getCameraImage(ut);mt.sourceTexture=gt}}}}for(let _t=0;_t<E.length;_t++){let vt=M[_t],xt=E[_t];vt!==null&&xt!==void 0&&xt.update(vt,nt,c||o)}ht&&ht(Y,nt),nt.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:nt}),g=null}let Mt=new Ld;Mt.setAnimationLoop(dt),this.setAnimationLoop=function(Y){ht=Y},this.dispose=function(){}}},Cx=new Se,Bd=new re;Bd.set(-1,0,0,0,1,0,0,0,1);function Px(i,t){function e(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,rh(i)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function s(m,p,v,S,y){p.isNodeMaterial?p.uniformsNeedUpdate=!1:p.isMeshBasicMaterial?r(m,p):p.isMeshLambertMaterial?(r(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshToonMaterial?(r(m,p),u(m,p)):p.isMeshPhongMaterial?(r(m,p),h(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshStandardMaterial?(r(m,p),d(m,p),p.isMeshPhysicalMaterial&&f(m,p,y)):p.isMeshMatcapMaterial?(r(m,p),g(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),_(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(o(m,p),p.isLineDashedMaterial&&a(m,p)):p.isPointsMaterial?l(m,p,v,S):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,e(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,e(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===Xe&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,e(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===Xe&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,e(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,e(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,e(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);let v=t.get(p),S=v.envMap,y=v.envMapRotation;S&&(m.envMap.value=S,m.envMapRotation.value.setFromMatrix4(Cx.makeRotationFromEuler(y)).transpose(),S.isCubeTexture&&S.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(Bd),m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,e(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,e(p.aoMap,m.aoMapTransform))}function o(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,e(p.map,m.mapTransform))}function a(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,v,S){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*v,m.scale.value=S*.5,p.map&&(m.map.value=p.map,e(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,e(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function h(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function u(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function d(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,e(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,e(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function f(m,p,v){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,e(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,e(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,e(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,e(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,e(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Xe&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.retroreflectivity>0&&(m.retroreflectivity.value=p.retroreflectivity),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,e(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,e(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=v.texture,m.transmissionSamplerSize.value.set(v.width,v.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,e(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,e(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,e(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,e(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,e(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function _(m,p){let v=t.get(p).light;m.referencePosition.value.setFromMatrixPosition(v.matrixWorld),m.nearDistance.value=v.shadow.camera.near,m.farDistance.value=v.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function Ix(i,t,e,n){let s={},r={},o=[],a=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(y,E){let M=E.program;n.uniformBlockBinding(y,M)}function c(y,E){let M=s[y.id];M===void 0&&(m(y),M=h(y),s[y.id]=M,y.addEventListener("dispose",v));let A=E.program;n.updateUBOMapping(y,A);let x=t.render.frame;r[y.id]!==x&&(d(y),r[y.id]=x)}function h(y){let E=u();y.__bindingPointIndex=E;let M=i.createBuffer(),A=y.__size,x=y.usage;return i.bindBuffer(i.UNIFORM_BUFFER,M),i.bufferData(i.UNIFORM_BUFFER,A,x),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,E,M),M}function u(){for(let y=0;y<a;y++)if(o.indexOf(y)===-1)return o.push(y),y;return ne("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(y){let E=s[y.id],M=y.uniforms,A=y.__cache;i.bindBuffer(i.UNIFORM_BUFFER,E);for(let x=0,w=M.length;x<w;x++){let C=M[x];if(Array.isArray(C))for(let I=0,P=C.length;I<P;I++)f(C[I],x,I,A);else f(C,x,0,A)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function f(y,E,M,A){if(_(y,E,M,A)===!0){let x=y.__offset,w=y.value;if(Array.isArray(w)){let C=0;for(let I=0;I<w.length;I++){let P=w[I],O=p(P);g(P,y.__data,C),typeof P!="number"&&typeof P!="boolean"&&!P.isMatrix3&&!ArrayBuffer.isView(P)&&(C+=O.storage/Float32Array.BYTES_PER_ELEMENT)}}else g(w,y.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,x,y.__data)}}function g(y,E,M){typeof y=="number"||typeof y=="boolean"?E[0]=y:y.isMatrix3?(E[0]=y.elements[0],E[1]=y.elements[1],E[2]=y.elements[2],E[3]=0,E[4]=y.elements[3],E[5]=y.elements[4],E[6]=y.elements[5],E[7]=0,E[8]=y.elements[6],E[9]=y.elements[7],E[10]=y.elements[8],E[11]=0):ArrayBuffer.isView(y)?E.set(new y.constructor(y.buffer,y.byteOffset,E.length)):y.toArray(E,M)}function _(y,E,M,A){let x=y.value,w=E+"_"+M;if(A[w]===void 0)return typeof x=="number"||typeof x=="boolean"?A[w]=x:ArrayBuffer.isView(x)?A[w]=x.slice():A[w]=x.clone(),!0;{let C=A[w];if(typeof x=="number"||typeof x=="boolean"){if(C!==x)return A[w]=x,!0}else{if(ArrayBuffer.isView(x))return!0;if(C.equals(x)===!1)return C.copy(x),!0}}return!1}function m(y){let E=y.uniforms,M=0,A=16;for(let w=0,C=E.length;w<C;w++){let I=Array.isArray(E[w])?E[w]:[E[w]];for(let P=0,O=I.length;P<O;P++){let U=I[P],H=Array.isArray(U.value)?U.value:[U.value];for(let K=0,L=H.length;K<L;K++){let q=H[K],X=p(q),z=M%A,G=z%X.boundary,pt=z+G;M+=G,pt!==0&&A-pt<X.storage&&(M+=A-pt),U.__data=new Float32Array(X.storage/Float32Array.BYTES_PER_ELEMENT),U.__offset=M,M+=X.storage}}}let x=M%A;return x>0&&(M+=A-x),y.__size=M,y.__cache={},this}function p(y){let E={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(E.boundary=4,E.storage=4):y.isVector2?(E.boundary=8,E.storage=8):y.isVector3||y.isColor?(E.boundary=16,E.storage=12):y.isVector4?(E.boundary=16,E.storage=16):y.isMatrix3?(E.boundary=48,E.storage=48):y.isMatrix4?(E.boundary=64,E.storage=64):y.isTexture?Qt("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(y)?(E.boundary=16,E.storage=y.byteLength):Qt("WebGLRenderer: Unsupported uniform value type.",y),E}function v(y){let E=y.target;E.removeEventListener("dispose",v);let M=o.indexOf(E.__bindingPointIndex);o.splice(M,1),i.deleteBuffer(s[E.id]),delete s[E.id],delete r[E.id]}function S(){for(let y in s)i.deleteBuffer(s[y]);o=[],s={},r={}}return{bind:l,update:c,dispose:S}}var Lx=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),li=null;function Dx(){return li===null&&(li=new zr(Lx,16,16,Ji,jn),li.name="DFG_LUT",li.minFilter=nn,li.magFilter=nn,li.wrapS=ni,li.wrapT=ni,li.generateMipmaps=!1,li.needsUpdate=!0),li}var Ll=class{constructor(t={}){let{canvas:e=Qu(),context:n=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1,outputBufferType:f=yn}=t;this.isWebGLRenderer=!0;let g;if(n!==null){if(typeof WebGLRenderingContext!="undefined"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=n.getContextAttributes().alpha}else g=o;let _=f,m=new Set([$a,Ja,Za]),p=new Set([yn,Kn,ar,lr,Xa,qa]),v=new Uint32Array(4),S=new Int32Array(4),y=new N,E=null,M=null,A=[],x=[],w=null;this.domElement=e,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=$n,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let C=this,I=!1,P=null,O=null,U=null,H=null;this._outputColorSpace=Qe;let K=0,L=0,q=null,X=-1,z=null,G=new Pe,pt=new Pe,j=null,ht=new jt(0),dt=0,Mt=e.width,Y=e.height,nt=1,_t=null,vt=null,xt=new Pe(0,0,Mt,Y),Dt=new Pe(0,0,Mt,Y),te=!1,ot=new $s,ut=!1,mt=!1,gt=new Se,Et=new N,Kt=new Pe,lt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Bt=!1;function Wt(){return q===null?nt:1}let D=n;function ee(T,k){return e.getContext(T,k)}let ie,R,b,V,Z,et,yt,wt,tt,rt,At,Xt,Ct,Rt,Vt,it,bt,F,ft,st,Tt,It,ct;try{let T={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${"186"}`),e.addEventListener("webglcontextlost",ve,!1),e.addEventListener("webglcontextrestored",fe,!1),e.addEventListener("webglcontextcreationerror",dn,!1),D===null){let k="webgl2";if(D=ee(k,T),D===null)throw ee(k)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Zt()}catch(T){throw e.removeEventListener("webglcontextlost",ve,!1),e.removeEventListener("webglcontextrestored",fe,!1),e.removeEventListener("webglcontextcreationerror",dn,!1),ne("WebGLRenderer: "+T.message),T}function Zt(){ie=new zg(D),ie.init(),Tt=new wx(D,ie),R=new Pg(D,ie,t,Tt),b=new Ex(D,ie),R.reversedDepthBuffer&&d&&b.buffers.depth.setReversed(!0),O=D.createFramebuffer(),U=D.createFramebuffer(),H=D.createFramebuffer(),V=new Gg(D),Z=new hx,et=new Tx(D,ie,b,Z,R,Tt,V),yt=new kg(C),wt=new Xp(D),It=new Rg(D,wt),tt=new Hg(D,wt,V,It),rt=new Xg(D,tt,wt,It,V),F=new Wg(D,R,et),Vt=new Ig(Z),At=new cx(C,yt,ie,R,It,Vt),Xt=new Px(C,Z),Ct=new dx,Rt=new xx(ie),bt=new Ag(C,yt,b,rt,g,l),it=new Mx(C,rt,R),ct=new Ix(D,V,R,b),ft=new Cg(D,ie,V),st=new Vg(D,ie,V),V.programs=At.programs,C.capabilities=R,C.extensions=ie,C.properties=Z,C.renderLists=Ct,C.shadowMap=it,C.state=b,C.info=V}_!==yn&&(w=new Yg(_,e.width,e.height,a,s,r));let Gt=new Rh(C,D);this.xr=Gt,this.getContext=function(){return D},this.getContextAttributes=function(){return D.getContextAttributes()},this.forceContextLoss=function(){let T=ie.get("WEBGL_lose_context");T&&T.loseContext()},this.forceContextRestore=function(){let T=ie.get("WEBGL_lose_context");T&&T.restoreContext()},this.getPixelRatio=function(){return nt},this.setPixelRatio=function(T){T!==void 0&&(nt=T,this.setSize(Mt,Y,!1))},this.getSize=function(T){return T.set(Mt,Y)},this.setSize=function(T,k,Q=!0){if(Gt.isPresenting){Qt("WebGLRenderer: Can't change size while VR device is presenting.");return}Mt=T,Y=k,e.width=Math.floor(T*nt),e.height=Math.floor(k*nt),Q===!0&&(e.style.width=T+"px",e.style.height=k+"px"),w!==null&&w.setSize(e.width,e.height),this.setViewport(0,0,T,k)},this.getDrawingBufferSize=function(T){return T.set(Mt*nt,Y*nt).floor()},this.setDrawingBufferSize=function(T,k,Q){Mt=T,Y=k,nt=Q,e.width=Math.floor(T*Q),e.height=Math.floor(k*Q),this.setViewport(0,0,T,k)},this.setEffects=function(T){if(_===yn){ne("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(T){for(let k=0;k<T.length;k++)if(T[k].isOutputPass===!0){Qt("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}w.setEffects(T||[])},this.getCurrentViewport=function(T){return T.copy(G)},this.getViewport=function(T){return T.copy(xt)},this.setViewport=function(T,k,Q,J){T.isVector4?xt.set(T.x,T.y,T.z,T.w):xt.set(T,k,Q,J),b.viewport(G.copy(xt).multiplyScalar(nt).round())},this.getScissor=function(T){return T.copy(Dt)},this.setScissor=function(T,k,Q,J){T.isVector4?Dt.set(T.x,T.y,T.z,T.w):Dt.set(T,k,Q,J),b.scissor(pt.copy(Dt).multiplyScalar(nt).round())},this.getScissorTest=function(){return te},this.setScissorTest=function(T){b.setScissorTest(te=T)},this.setOpaqueSort=function(T){_t=T},this.setTransparentSort=function(T){vt=T},this.getClearColor=function(T){return T.copy(bt.getClearColor())},this.setClearColor=function(){bt.setClearColor(...arguments)},this.getClearAlpha=function(){return bt.getClearAlpha()},this.setClearAlpha=function(){bt.setClearAlpha(...arguments)},this.clear=function(T=!0,k=!0,Q=!0){let J=0;if(T){let $=!1;if(q!==null){let Ut=q.texture.format;$=m.has(Ut)}if($){let Ut=q.texture.type,zt=p.has(Ut),Nt=bt.getClearColor(),qt=bt.getClearAlpha(),$t=Nt.r,ae=Nt.g,ce=Nt.b;zt?(v[0]=$t,v[1]=ae,v[2]=ce,v[3]=qt,D.clearBufferuiv(D.COLOR,0,v)):(S[0]=$t,S[1]=ae,S[2]=ce,S[3]=qt,D.clearBufferiv(D.COLOR,0,S))}else J|=D.COLOR_BUFFER_BIT}k&&(J|=D.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),Q&&(J|=D.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),J!==0&&D.clear(J)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(T){T.setRenderer(this),P=T},this.dispose=function(){e.removeEventListener("webglcontextlost",ve,!1),e.removeEventListener("webglcontextrestored",fe,!1),e.removeEventListener("webglcontextcreationerror",dn,!1),bt.dispose(),Ct.dispose(),Rt.dispose(),Z.dispose(),yt.dispose(),rt.dispose(),It.dispose(),ct.dispose(),At.dispose(),Gt.dispose(),Gt.removeEventListener("sessionstart",fn),Gt.removeEventListener("sessionend",$e),pe.stop()};function ve(T){T.preventDefault(),eh("WebGLRenderer: Context Lost."),I=!0}function fe(){eh("WebGLRenderer: Context Restored."),I=!1;let T=V.autoReset,k=it.enabled,Q=it.autoUpdate,J=it.needsUpdate,$=it.type;Zt(),V.autoReset=T,it.enabled=k,it.autoUpdate=Q,it.needsUpdate=J,it.type=$}function dn(T){ne("WebGLRenderer: A WebGL context could not be created. Reason: ",T.statusMessage)}function Sn(T){let k=T.target;k.removeEventListener("dispose",Sn),Jt(k)}function Jt(T){se(T),Z.remove(T)}function se(T){let k=Z.get(T).programs;k!==void 0&&(k.forEach(function(Q){At.releaseProgram(Q)}),T.isShaderMaterial&&At.releaseShaderCache(T))}this.renderBufferDirect=function(T,k,Q,J,$,Ut){k===null&&(k=lt);let zt=$.isMesh&&$.matrixWorld.determinantAffine()<0,Nt=Do(T,k,Q,J,$);b.setMaterial(J,zt);let qt=Q.index,$t=1;if(J.wireframe===!0){if(qt=tt.getWireframeAttribute(Q),qt===void 0)return;$t=2}let ae=Q.drawRange,ce=Q.attributes.position,Yt=ae.start*$t,ge=(ae.start+ae.count)*$t;Ut!==null&&(Yt=Math.max(Yt,Ut.start*$t),ge=Math.min(ge,(Ut.start+Ut.count)*$t)),qt!==null?(Yt=Math.max(Yt,0),ge=Math.min(ge,qt.count)):ce!=null&&(Yt=Math.max(Yt,0),ge=Math.min(ge,ce.count));let Ve=ge-Yt;if(Ve<0||Ve===1/0)return;It.setup($,J,Nt,Q,qt);let Re,Ee=ft;if(qt!==null&&(Re=wt.get(qt),Ee=st,Ee.setIndex(Re)),$.isMesh)J.wireframe===!0?(b.setLineWidth(J.wireframeLinewidth*Wt()),Ee.setMode(D.LINES)):Ee.setMode(D.TRIANGLES);else if($.isLine){let on=J.linewidth;on===void 0&&(on=1),b.setLineWidth(on*Wt()),$.isLineSegments?Ee.setMode(D.LINES):$.isLineLoop?Ee.setMode(D.LINE_LOOP):Ee.setMode(D.LINE_STRIP)}else $.isPoints?Ee.setMode(D.POINTS):$.isSprite&&Ee.setMode(D.TRIANGLES);if($.isBatchedMesh)if(ie.get("WEBGL_multi_draw"))Ee.renderMultiDraw($._multiDrawStarts,$._multiDrawCounts,$._multiDrawCount);else{let on=$._multiDrawStarts,kt=$._multiDrawCounts,pn=$._multiDrawCount,me=qt?wt.get(qt).bytesPerElement:1,Fn=Z.get(J).currentProgram.getUniforms();for(let ti=0;ti<pn;ti++)Fn.setValue(D,"_gl_DrawID",ti),Ee.render(on[ti]/me,kt[ti])}else if($.isInstancedMesh)Ee.renderInstances(Yt,Ve,$.count);else if(Q.isInstancedBufferGeometry){let on=Q._maxInstanceCount!==void 0?Q._maxInstanceCount:1/0,kt=Math.min(Q.instanceCount,on);Ee.renderInstances(Yt,Ve,kt)}else Ee.render(Yt,Ve)};function Te(T,k,Q,J){P!==null&&T.isNodeMaterial&&P.setObject(J,T),ut===!0&&Vt.setState(T,Q,!1),T.transparent===!0&&T.side===Ne&&T.forceSinglePass===!1?(T.side=Xe,T.needsUpdate=!0,pi(T,k,J),T.side=Xi,T.needsUpdate=!0,pi(T,k,J),T.side=Ne):pi(T,k,J)}this.compile=function(T,k,Q=null){Q===null&&(Q=T),P!==null&&P.renderStart(T,k,Q),M=Rt.get(Q),M.init(k),x.push(M),Q.traverseVisible(function($){$.isLight&&$.layers.test(k.layers)&&(M.pushLight($),$.castShadow&&M.pushShadow($))}),T!==Q&&T.traverseVisible(function($){$.isLight&&$.layers.test(k.layers)&&(M.pushLight($),$.castShadow&&M.pushShadow($))}),M.setupLights(),P!==null&&P.updateLights(M.state.lightsArray),mt=this.localClippingEnabled,ut=Vt.init(this.clippingPlanes,mt),ut===!0&&Vt.setGlobalState(this.clippingPlanes,k),P!==null&&it.render(M.state.shadowsArray,Q,k);let J=new Set;return T.traverse(function($){if(!($.isMesh||$.isPoints||$.isLine||$.isSprite))return;let Ut=$.material;if(Ut)if(Array.isArray(Ut))for(let zt=0;zt<Ut.length;zt++){let Nt=Ut[zt];Te(Nt,Q,k,$),J.add(Nt)}else Te(Ut,Q,k,$),J.add(Ut)}),M=x.pop(),P!==null&&P.renderEnd(),J},this.compileAsync=function(T,k,Q=null){let J=this.compile(T,k,Q);return new Promise($=>{function Ut(){if(J.forEach(function(zt){let qt=Z.get(zt).currentProgram;(qt===void 0||qt.isReady())&&J.delete(zt)}),J.size===0){$(T);return}setTimeout(Ut,10)}ie.get("KHR_parallel_shader_compile")!==null?Ut():setTimeout(Ut,10)})};let ze=null;function rn(T){ze&&ze(T)}function fn(){pe.stop()}function $e(){pe.start()}let pe=new Ld;pe.setAnimationLoop(rn),typeof self!="undefined"&&pe.setContext(self),this.setAnimationLoop=function(T){ze=T,Gt.setAnimationLoop(T),T===null?pe.stop():pe.start()},Gt.addEventListener("sessionstart",fn),Gt.addEventListener("sessionend",$e),this.render=function(T,k){if(k!==void 0&&k.isCamera!==!0){ne("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(I===!0)return;P!==null&&P.renderStart(T,k);let Q=Gt.enabled===!0&&Gt.isPresenting===!0,J=w!==null&&(q===null||Q)&&w.begin(C,q);if(T.matrixWorldAutoUpdate===!0&&T.updateMatrixWorld(),k.parent===null&&k.matrixWorldAutoUpdate===!0&&k.updateMatrixWorld(),Gt.enabled===!0&&Gt.isPresenting===!0&&(w===null||w.isCompositing()===!1)&&(Gt.cameraAutoUpdate===!0&&Gt.updateCamera(k),k=Gt.getCamera()),T.isScene===!0&&T.onBeforeRender(C,T,k,q),M=Rt.get(T,x.length),M.init(k),M.state.textureUnits=et.getTextureUnits(),x.push(M),gt.multiplyMatrices(k.projectionMatrix,k.matrixWorldInverse),ot.setFromProjectionMatrix(gt,Zn,k.reversedDepth),mt=this.localClippingEnabled,ut=Vt.init(this.clippingPlanes,mt),E=Ct.get(T,A.length),E.init(),A.push(E),Gt.enabled===!0&&Gt.isPresenting===!0){let zt=C.xr.getDepthSensingMesh();zt!==null&&He(zt,k,-1/0,C.sortObjects)}He(T,k,0,C.sortObjects),E.finish(),P!==null&&P.updateLights(M.state.lightsArray),C.sortObjects===!0&&E.sort(_t,vt),Bt=Gt.enabled===!1||Gt.isPresenting===!1||Gt.hasDepthSensing()===!1,Bt&&bt.addToRenderList(E,T),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),ut===!0&&Vt.beginShadows();let $=M.state.shadowsArray;if(it.render($,T,k),ut===!0&&Vt.endShadows(),(J&&w.hasRenderPass())===!1){let zt=E.opaque,Nt=E.transmissive;if(M.setupLights(),k.isArrayCamera){let qt=k.cameras;if(Nt.length>0)for(let $t=0,ae=qt.length;$t<ae;$t++){let ce=qt[$t];ts(zt,Nt,T,ce)}Bt&&bt.render(T);for(let $t=0,ae=qt.length;$t<ae;$t++){let ce=qt[$t];Ke(E,T,ce,ce.viewport)}}else Nt.length>0&&ts(zt,Nt,T,k),Bt&&bt.render(T),Ke(E,T,k)}q!==null&&L===0&&(et.updateMultisampleRenderTarget(q),et.updateRenderTargetMipmap(q)),J&&w.end(C),T.isScene===!0&&T.onAfterRender(C,T,k),It.resetDefaultState(),X=-1,z=null,x.pop(),x.length>0?(M=x[x.length-1],et.setTextureUnits(M.state.textureUnits),ut===!0&&Vt.setGlobalState(C.clippingPlanes,M.state.camera)):M=null,A.pop(),A.length>0?E=A[A.length-1]:E=null,P!==null&&P.renderEnd()};function He(T,k,Q,J){if(T.visible===!1)return;if(T.layers.test(k.layers)){if(T.isGroup)Q=T.renderOrder;else if(T.isLOD)T.autoUpdate===!0&&T.update(k);else if(T.isLightProbeGrid)M.pushLightProbeGrid(T);else if(T.isLight)M.pushLight(T),T.castShadow&&M.pushShadow(T);else if(T.isSprite){if(!T.frustumCulled||T.intersectsFrustum(ot)){J&&Kt.setFromMatrixPosition(T.matrixWorld).applyMatrix4(gt);let zt=rt.update(T),Nt=T.material;Nt.visible&&E.push(T,zt,Nt,Q,Kt.z,null,k)}}else if((T.isMesh||T.isLine||T.isPoints)&&(!T.frustumCulled||T.intersectsFrustum(ot))){let zt=rt.update(T),Nt=T.material;if(J&&(T.boundingSphere!==void 0?(T.boundingSphere===null&&T.computeBoundingSphere(),Kt.copy(T.boundingSphere.center)):(zt.boundingSphere===null&&zt.computeBoundingSphere(),Kt.copy(zt.boundingSphere.center)),Kt.applyMatrix4(T.matrixWorld).applyMatrix4(gt)),Array.isArray(Nt)){let qt=zt.groups;for(let $t=0,ae=qt.length;$t<ae;$t++){let ce=qt[$t],Yt=Nt[ce.materialIndex];Yt&&Yt.visible&&E.push(T,zt,Yt,Q,Kt.z,ce,k)}}else Nt.visible&&E.push(T,zt,Nt,Q,Kt.z,null,k)}}let Ut=T.children;for(let zt=0,Nt=Ut.length;zt<Nt;zt++)He(Ut[zt],k,Q,J)}function Ke(T,k,Q,J){let{opaque:$,transmissive:Ut,transparent:zt}=T;M.setupLightsView(Q),ut===!0&&Vt.setGlobalState(C.clippingPlanes,Q),J&&b.viewport(G.copy(J)),$.length>0&&fi($,k,Q),Ut.length>0&&fi(Ut,k,Q),zt.length>0&&fi(zt,k,Q),b.buffers.depth.setTest(!0),b.buffers.depth.setMask(!0),b.buffers.color.setMask(!0),b.setPolygonOffset(!1)}function ts(T,k,Q,J){if((Q.isScene===!0?Q.overrideMaterial:null)!==null)return;if(M.state.transmissionRenderTarget[J.id]===void 0){let Yt=ie.has("EXT_color_buffer_half_float")||ie.has("EXT_color_buffer_float");M.state.transmissionRenderTarget[J.id]=new _n(1,1,{generateMipmaps:!0,type:Yt?jn:yn,minFilter:Yi,samples:Math.max(4,R.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:he.workingColorSpace})}let Ut=M.state.transmissionRenderTarget[J.id],zt=J.viewport||G;Ut.setSize(zt.z*C.transmissionResolutionScale,zt.w*C.transmissionResolutionScale);let Nt=C.getRenderTarget(),qt=C.getActiveCubeFace(),$t=C.getActiveMipmapLevel();C.setRenderTarget(Ut),C.getClearColor(ht),dt=C.getClearAlpha(),dt<1&&C.setClearColor(16777215,.5),C.clear(),Bt&&bt.render(Q);let ae=C.toneMapping;C.toneMapping=$n;let ce=J.viewport;if(J.viewport!==void 0&&(J.viewport=void 0),M.setupLightsView(J),ut===!0&&Vt.setGlobalState(C.clippingPlanes,J),fi(T,Q,J),et.updateMultisampleRenderTarget(Ut),et.updateRenderTargetMipmap(Ut),ie.has("WEBGL_multisampled_render_to_texture")===!1){let Yt=!1;for(let ge=0,Ve=k.length;ge<Ve;ge++){let Re=k[ge],{object:Ee,geometry:on,material:kt,group:pn}=Re;if(kt.side===Ne&&Ee.layers.test(J.layers)){let me=kt.side;kt.side=Xe,kt.needsUpdate=!0,Jl(Ee,Q,J,on,kt,pn),kt.side=me,kt.needsUpdate=!0,Yt=!0}}Yt===!0&&(et.updateMultisampleRenderTarget(Ut),et.updateRenderTargetMipmap(Ut))}C.setRenderTarget(Nt,qt,$t),C.setClearColor(ht,dt),ce!==void 0&&(J.viewport=ce),C.toneMapping=ae}function fi(T,k,Q){let J=k.isScene===!0?k.overrideMaterial:null;for(let $=0,Ut=T.length;$<Ut;$++){let zt=T[$],{object:Nt,geometry:qt,group:$t}=zt,ae=zt.material;ae.allowOverride===!0&&J!==null&&(ae=J),Nt.layers.test(Q.layers)&&Jl(Nt,k,Q,qt,ae,$t)}}function Jl(T,k,Q,J,$,Ut){P!==null&&$.isNodeMaterial&&P.setObject(T,$),T.onBeforeRender(C,k,Q,J,$,Ut),T.modelViewMatrix.multiplyMatrices(Q.matrixWorldInverse,T.matrixWorld),T.normalMatrix.getNormalMatrix(T.modelViewMatrix),$.onBeforeRender(C,k,Q,J,T,Ut),$.transparent===!0&&$.side===Ne&&$.forceSinglePass===!1?($.side=Xe,$.needsUpdate=!0,C.renderBufferDirect(Q,k,J,$,T,Ut),$.side=Xi,$.needsUpdate=!0,C.renderBufferDirect(Q,k,J,$,T,Ut),$.side=Ne):C.renderBufferDirect(Q,k,J,$,T,Ut),T.onAfterRender(C,k,Q,J,$,Ut)}function pi(T,k,Q){k.isScene!==!0&&(k=lt);let J=Z.get(T),$=M.state.lights,Ut=M.state.shadowsArray,zt=$.state.version,Nt=At.getParameters(T,$.state,Ut,k,Q,M.state.lightProbeGridArray),qt=At.getProgramCacheKey(Nt),$t=J.programs;J.environment=T.isMeshStandardMaterial||T.isMeshLambertMaterial||T.isMeshPhongMaterial?k.environment:null,J.fog=k.fog;let ae=T.isMeshStandardMaterial||T.isMeshLambertMaterial&&!T.envMap||T.isMeshPhongMaterial&&!T.envMap;J.envMap=yt.get(T.envMap||J.environment,ae),J.envMapRotation=J.environment!==null&&T.envMap===null?k.environmentRotation:T.envMapRotation,$t===void 0&&(T.addEventListener("dispose",Sn),$t=new Map,J.programs=$t);let ce=$t.get(qt);if(ce!==void 0){if(J.currentProgram===ce&&J.lightsStateVersion===zt)return ns(T,Nt),ce}else Nt.uniforms=At.getUniforms(T),P!==null&&T.isNodeMaterial&&P.build(T,Q,Nt),T.onBeforeCompile(Nt,C),ce=At.acquireProgram(Nt,qt),$t.set(qt,ce),J.uniforms=Nt.uniforms;let Yt=J.uniforms;return(!T.isShaderMaterial&&!T.isRawShaderMaterial||T.clipping===!0)&&(Yt.clippingPlanes=Vt.uniform),ns(T,Nt),J.needsLights=vf(T),J.lightsStateVersion=zt,J.needsLights&&(Yt.ambientLightColor.value=$.state.ambient,Yt.lightProbe.value=$.state.probe,Yt.sunLights.value=$.state.sun,Yt.sunLightShadows.value=$.state.sunShadow,Yt.directionalLights.value=$.state.directional,Yt.directionalLightShadows.value=$.state.directionalShadow,Yt.spotLights.value=$.state.spot,Yt.spotLightShadows.value=$.state.spotShadow,Yt.rectAreaLights.value=$.state.rectArea,Yt.ltc_1.value=$.state.rectAreaLTC1,Yt.ltc_2.value=$.state.rectAreaLTC2,Yt.pointLights.value=$.state.point,Yt.pointLightShadows.value=$.state.pointShadow,Yt.hemisphereLights.value=$.state.hemi,Yt.sunShadowMatrix.value=$.state.sunShadowMatrix,Yt.sunShadowCascade.value=$.state.sunShadowCascade,Yt.directionalShadowMatrix.value=$.state.directionalShadowMatrix,Yt.spotLightMatrix.value=$.state.spotLightMatrix,Yt.spotLightMap.value=$.state.spotLightMap,Yt.pointShadowMatrix.value=$.state.pointShadowMatrix),J.lightProbeGrid=M.state.lightProbeGridArray.length>0,J.currentProgram=ce,J.uniformsList=null,ce}function es(T){if(T.uniformsList===null){let k=T.currentProgram.getUniforms();T.uniformsList=ur.seqWithValue(k.seq,T.uniforms)}return T.uniformsList}function ns(T,k){let Q=Z.get(T);Q.outputColorSpace=k.outputColorSpace,Q.batching=k.batching,Q.batchingColor=k.batchingColor,Q.instancing=k.instancing,Q.instancingColor=k.instancingColor,Q.instancingMorph=k.instancingMorph,Q.skinning=k.skinning,Q.morphTargets=k.morphTargets,Q.morphNormals=k.morphNormals,Q.morphColors=k.morphColors,Q.morphTargetsCount=k.morphTargetsCount,Q.numClippingPlanes=k.numClippingPlanes,Q.numIntersection=k.numClipIntersection,Q.vertexAlphas=k.vertexAlphas,Q.vertexTangents=k.vertexTangents,Q.toneMapping=k.toneMapping}function $l(T,k){if(T.length===0)return null;if(T.length===1)return T[0].texture!==null?T[0]:null;y.setFromMatrixPosition(k.matrixWorld);for(let Q=0,J=T.length;Q<J;Q++){let $=T[Q];if($.texture!==null&&$.boundingBox.containsPoint(y))return $}return null}function Do(T,k,Q,J,$){k.isScene!==!0&&(k=lt),et.resetTextureUnits();let Ut=k.fog,zt=J.isMeshStandardMaterial||J.isMeshLambertMaterial||J.isMeshPhongMaterial?k.environment:null,Nt=q===null?C.outputColorSpace:q.isXRRenderTarget===!0?q.texture.colorSpace:he.workingColorSpace,qt=J.isMeshStandardMaterial||J.isMeshLambertMaterial&&!J.envMap||J.isMeshPhongMaterial&&!J.envMap,$t=yt.get(J.envMap||zt,qt),ae=J.vertexColors===!0&&!!Q.attributes.color&&Q.attributes.color.itemSize===4,ce=!!Q.attributes.tangent&&(!!J.normalMap||J.anisotropy>0),Yt=!!Q.morphAttributes.position,ge=!!Q.morphAttributes.normal,Ve=!!Q.morphAttributes.color,Re=$n;J.toneMapped&&(q===null||q.isXRRenderTarget===!0)&&(Re=C.toneMapping);let Ee=Q.morphAttributes.position||Q.morphAttributes.normal||Q.morphAttributes.color,on=Ee!==void 0?Ee.length:0,kt=Z.get(J),pn=M.state.lights;if(ut===!0&&(mt===!0||T!==z)){let we=T===z&&J.id===X;Vt.setState(J,T,we)}let me=!1;J.version===kt.__version?(kt.needsLights&&kt.lightsStateVersion!==pn.state.version||kt.outputColorSpace!==Nt||$.isBatchedMesh&&kt.batching===!1||!$.isBatchedMesh&&kt.batching===!0||$.isBatchedMesh&&kt.batchingColor===!0&&$._colorsTexture===null||$.isBatchedMesh&&kt.batchingColor===!1&&$._colorsTexture!==null||$.isInstancedMesh&&kt.instancing===!1||!$.isInstancedMesh&&kt.instancing===!0||$.isSkinnedMesh&&kt.skinning===!1||!$.isSkinnedMesh&&kt.skinning===!0||$.isInstancedMesh&&kt.instancingColor===!0&&$.instanceColor===null||$.isInstancedMesh&&kt.instancingColor===!1&&$.instanceColor!==null||$.isInstancedMesh&&kt.instancingMorph===!0&&$.morphTexture===null||$.isInstancedMesh&&kt.instancingMorph===!1&&$.morphTexture!==null||kt.envMap!==$t||J.fog===!0&&kt.fog!==Ut||kt.numClippingPlanes!==void 0&&(kt.numClippingPlanes!==Vt.numPlanes||kt.numIntersection!==Vt.numIntersection)||kt.vertexAlphas!==ae||kt.vertexTangents!==ce||kt.morphTargets!==Yt||kt.morphNormals!==ge||kt.morphColors!==Ve||kt.toneMapping!==Re||kt.morphTargetsCount!==on||!!kt.lightProbeGrid!=M.state.lightProbeGridArray.length>0)&&(me=!0):(me=!0,kt.__version=J.version);let Fn=kt.currentProgram;me===!0&&(Fn=pi(J,k,$),P&&J.isNodeMaterial&&P.onUpdateProgram(J,Fn,kt));let ti=!1,wi=!1,Es=!1,be=Fn.getUniforms(),Oe=kt.uniforms;if(b.useProgram(Fn.program)&&(ti=!0,wi=!0,Es=!0),J.id!==X&&(X=J.id,wi=!0),kt.needsLights){let we=$l(M.state.lightProbeGridArray,$);kt.lightProbeGrid!==we&&(kt.lightProbeGrid=we,wi=!0)}if(ti||z!==T){b.buffers.depth.getReversed()&&T.reversedDepth!==!0&&(T._reversedDepth=!0,T.updateProjectionMatrix()),be.setValue(D,"projectionMatrix",T.projectionMatrix),be.setValue(D,"viewMatrix",T.matrixWorldInverse);let Ri=be.map.cameraPosition;Ri!==void 0&&Ri.setValue(D,Et.setFromMatrixPosition(T.matrixWorld)),R.logarithmicDepthBuffer&&be.setValue(D,"logDepthBufFC",2/(Math.log(T.far+1)/Math.LN2)),(J.isMeshPhongMaterial||J.isMeshToonMaterial||J.isMeshLambertMaterial||J.isMeshBasicMaterial||J.isMeshStandardMaterial||J.isShaderMaterial)&&be.setValue(D,"isOrthographic",T.isOrthographicCamera===!0),z!==T&&(z=T,wi=!0,Es=!0)}if(kt.needsLights&&(pn.state.sunShadowMap.length>0&&be.setValue(D,"sunShadowMap",pn.state.sunShadowMap,et),pn.state.directionalShadowMap.length>0&&be.setValue(D,"directionalShadowMap",pn.state.directionalShadowMap,et),pn.state.spotShadowMap.length>0&&be.setValue(D,"spotShadowMap",pn.state.spotShadowMap,et),pn.state.pointShadowMap.length>0&&be.setValue(D,"pointShadowMap",pn.state.pointShadowMap,et)),$.isSkinnedMesh){be.setOptional(D,$,"bindMatrix"),be.setOptional(D,$,"bindMatrixInverse");let we=$.skeleton;we&&(we.boneTexture===null&&we.computeBoneTexture(),be.setValue(D,"boneTexture",we.boneTexture,et))}$.isBatchedMesh&&(be.setOptional(D,$,"batchingTexture"),be.setValue(D,"batchingTexture",$._matricesTexture,et),be.setOptional(D,$,"batchingIdTexture"),be.setValue(D,"batchingIdTexture",$._indirectTexture,et),be.setOptional(D,$,"batchingColorTexture"),$._colorsTexture!==null&&be.setValue(D,"batchingColorTexture",$._colorsTexture,et));let Ai=Q.morphAttributes;if((Ai.position!==void 0||Ai.normal!==void 0||Ai.color!==void 0)&&F.update($,Q,Fn),(wi||kt.receiveShadow!==$.receiveShadow)&&(kt.receiveShadow=$.receiveShadow,be.setValue(D,"receiveShadow",$.receiveShadow)),(J.isMeshStandardMaterial||J.isMeshLambertMaterial||J.isMeshPhongMaterial)&&J.envMap===null&&k.environment!==null&&(Oe.envMapIntensity.value=k.environmentIntensity),Oe.dfgLUT!==void 0&&(Oe.dfgLUT.value=Dx()),wi){if(be.setValue(D,"toneMappingExposure",C.toneMappingExposure),kt.needsLights&&yf(Oe,Es),Ut&&J.fog===!0&&Xt.refreshFogUniforms(Oe,Ut),Xt.refreshMaterialUniforms(Oe,J,nt,Y,M.state.transmissionRenderTarget[T.id]),kt.needsLights&&kt.lightProbeGrid){let we=kt.lightProbeGrid;Oe.probesSH.value=we.texture,Oe.probesMin.value.copy(we.boundingBox.min),Oe.probesMax.value.copy(we.boundingBox.max),Oe.probesResolution.value.copy(we.resolution)}ur.upload(D,es(kt),Oe,et)}if(J.isShaderMaterial&&J.uniformsNeedUpdate===!0&&(ur.upload(D,es(kt),Oe,et),J.uniformsNeedUpdate=!1),J.isSpriteMaterial&&be.setValue(D,"center",$.center),be.setValue(D,"modelViewMatrix",$.modelViewMatrix),be.setValue(D,"normalMatrix",$.normalMatrix),be.setValue(D,"modelMatrix",$.matrixWorld),J.uniformsGroups!==void 0){let we=J.uniformsGroups;for(let Ri=0,Ts=we.length;Ri<Ts;Ri++){let Hh=we[Ri];ct.update(Hh,Fn),ct.bind(Hh,Fn)}}return Fn}function yf(T,k){T.ambientLightColor.needsUpdate=k,T.lightProbe.needsUpdate=k,T.sunLights.needsUpdate=k,T.sunLightShadows.needsUpdate=k,T.directionalLights.needsUpdate=k,T.directionalLightShadows.needsUpdate=k,T.pointLights.needsUpdate=k,T.pointLightShadows.needsUpdate=k,T.spotLights.needsUpdate=k,T.spotLightShadows.needsUpdate=k,T.rectAreaLights.needsUpdate=k,T.hemisphereLights.needsUpdate=k}function vf(T){return T.isMeshLambertMaterial||T.isMeshToonMaterial||T.isMeshPhongMaterial||T.isMeshStandardMaterial||T.isShadowMaterial||T.isShaderMaterial&&T.lights===!0}this.getActiveCubeFace=function(){return K},this.getActiveMipmapLevel=function(){return L},this.getRenderTarget=function(){return q},this.setRenderTargetTextures=function(T,k,Q){let J=Z.get(T);J.__autoAllocateDepthBuffer=T.resolveDepthBuffer===!1,J.__autoAllocateDepthBuffer===!1&&(J.__useRenderToTexture=!1),Z.get(T.texture).__webglTexture=k,Z.get(T.depthTexture).__webglTexture=J.__autoAllocateDepthBuffer?void 0:Q,J.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(T,k){let Q=Z.get(T);Q.__webglFramebuffer=k,Q.__useDefaultFramebuffer=k===void 0},this.setRenderTarget=function(T,k=0,Q=0){q=T,K=k,L=Q;let J=null,$=!1,Ut=!1;if(T){let Nt=Z.get(T);if(Nt.__useDefaultFramebuffer!==void 0){b.bindFramebuffer(D.FRAMEBUFFER,Nt.__webglFramebuffer),G.copy(T.viewport),pt.copy(T.scissor),j=T.scissorTest,b.viewport(G),b.scissor(pt),b.setScissorTest(j),X=-1;return}else if(Nt.__webglFramebuffer===void 0)et.setupRenderTarget(T);else if(Nt.__hasExternalTextures)et.rebindTextures(T,Z.get(T.texture).__webglTexture,Z.get(T.depthTexture).__webglTexture);else if(T.depthBuffer){let ae=T.depthTexture;if(Nt.__boundDepthTexture!==ae){if(ae!==null&&Z.has(ae)&&(T.width!==ae.image.width||T.height!==ae.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");et.setupDepthRenderbuffer(T)}}let qt=T.texture;(qt.isData3DTexture||qt.isDataArrayTexture||qt.isCompressedArrayTexture)&&(Ut=!0);let $t=Z.get(T).__webglFramebuffer;T.isWebGLCubeRenderTarget?(Array.isArray($t[k])?J=$t[k][Q]:J=$t[k],$=!0):T.samples>0&&et.useMultisampledRTT(T)===!1?J=Z.get(T).__webglMultisampledFramebuffer:Array.isArray($t)?J=$t[Q]:J=$t,G.copy(T.viewport),pt.copy(T.scissor),j=T.scissorTest}else G.copy(xt).multiplyScalar(nt).floor(),pt.copy(Dt).multiplyScalar(nt).floor(),j=te;if(Q!==0&&(J=O),b.bindFramebuffer(D.FRAMEBUFFER,J)&&b.drawBuffers(T,J),b.viewport(G),b.scissor(pt),b.setScissorTest(j),$){let Nt=Z.get(T.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_CUBE_MAP_POSITIVE_X+k,Nt.__webglTexture,Q)}else if(Ut){let Nt=k;for(let qt=0;qt<T.textures.length;qt++){let $t=Z.get(T.textures[qt]);D.framebufferTextureLayer(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0+qt,$t.__webglTexture,Q,Nt)}}else if(T!==null&&Q!==0){let Nt=Z.get(T.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,Nt.__webglTexture,Q)}X=-1};function zh(T){let k=Z.get(T);return(k.__readFormat!==T.format||k.__readType!==T.type)&&(k.__readFormat=T.format,k.__readType=T.type,k.__formatReadable=R.textureFormatReadable(T.format),k.__typeReadable=R.textureTypeReadable(T.type)),k}this.readRenderTargetPixels=function(T,k,Q,J,$,Ut,zt,Nt=0){if(!(T&&T.isWebGLRenderTarget)){ne("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let qt=Z.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&zt!==void 0&&(qt=qt[zt]),qt){b.bindFramebuffer(D.FRAMEBUFFER,qt);try{let $t=T.textures[Nt],ae=$t.format,ce=$t.type;T.textures.length>1&&D.readBuffer(D.COLOR_ATTACHMENT0+Nt);let Yt=zh($t);if(Yt.__formatReadable===!1){ne("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Yt.__typeReadable===!1){ne("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}k>=0&&k<=T.width-J&&Q>=0&&Q<=T.height-$&&D.readPixels(k,Q,J,$,Tt.convert(ae),Tt.convert(ce),Ut)}finally{let $t=q!==null?Z.get(q).__webglFramebuffer:null;b.bindFramebuffer(D.FRAMEBUFFER,$t)}}},this.readRenderTargetPixelsAsync=async function(T,k,Q,J,$,Ut,zt,Nt=0){if(!(T&&T.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let qt=Z.get(T).__webglFramebuffer;if(T.isWebGLCubeRenderTarget&&zt!==void 0&&(qt=qt[zt]),qt)if(k>=0&&k<=T.width-J&&Q>=0&&Q<=T.height-$){b.bindFramebuffer(D.FRAMEBUFFER,qt);let $t=T.textures[Nt],ae=$t.format,ce=$t.type;T.textures.length>1&&D.readBuffer(D.COLOR_ATTACHMENT0+Nt);let Yt=zh($t);if(Yt.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Yt.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let ge=D.createBuffer();D.bindBuffer(D.PIXEL_PACK_BUFFER,ge),D.bufferData(D.PIXEL_PACK_BUFFER,Ut.byteLength,D.STREAM_READ),D.readPixels(k,Q,J,$,Tt.convert(ae),Tt.convert(ce),0),D.bindBuffer(D.PIXEL_PACK_BUFFER,null);let Ve=q!==null?Z.get(q).__webglFramebuffer:null;b.bindFramebuffer(D.FRAMEBUFFER,Ve);let Re=D.fenceSync(D.SYNC_GPU_COMMANDS_COMPLETE,0);return D.flush(),await ed(D,Re,4),D.bindBuffer(D.PIXEL_PACK_BUFFER,ge),D.getBufferSubData(D.PIXEL_PACK_BUFFER,0,Ut),D.bindBuffer(D.PIXEL_PACK_BUFFER,null),D.deleteBuffer(ge),D.deleteSync(Re),Ut}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(T,k=null,Q=0){let J=Math.pow(2,-Q),$=Math.floor(T.image.width*J),Ut=Math.floor(T.image.height*J),zt=k!==null?k.x:0,Nt=k!==null?k.y:0;et.setTexture2D(T,0),D.copyTexSubImage2D(D.TEXTURE_2D,Q,0,0,zt,Nt,$,Ut),b.unbindTexture()},this.copyTextureToTexture=function(T,k,Q=null,J=null,$=0,Ut=0){let zt,Nt,qt,$t,ae,ce,Yt,ge,Ve,Re=T.isCompressedTexture?T.mipmaps[Ut]:T.image;if(Q!==null)zt=Q.max.x-Q.min.x,Nt=Q.max.y-Q.min.y,qt=Q.isBox3?Q.max.z-Q.min.z:1,$t=Q.min.x,ae=Q.min.y,ce=Q.isBox3?Q.min.z:0;else{let Oe=Math.pow(2,-$);zt=Math.floor(Re.width*Oe),Nt=Math.floor(Re.height*Oe),T.isDataArrayTexture?qt=Re.depth:T.isData3DTexture?qt=Math.floor(Re.depth*Oe):qt=1,$t=0,ae=0,ce=0}J!==null?(Yt=J.x,ge=J.y,Ve=J.z):(Yt=0,ge=0,Ve=0);let Ee=Tt.convert(k.format),on=Tt.convert(k.type),kt;k.isData3DTexture?(et.setTexture3D(k,0),kt=D.TEXTURE_3D):k.isDataArrayTexture||k.isCompressedArrayTexture?(et.setTexture2DArray(k,0),kt=D.TEXTURE_2D_ARRAY):(et.setTexture2D(k,0),kt=D.TEXTURE_2D),b.activeTexture(D.TEXTURE0),b.pixelStorei(D.UNPACK_FLIP_Y_WEBGL,k.flipY),b.pixelStorei(D.UNPACK_PREMULTIPLY_ALPHA_WEBGL,k.premultiplyAlpha),b.pixelStorei(D.UNPACK_ALIGNMENT,k.unpackAlignment);let pn=b.getParameter(D.UNPACK_ROW_LENGTH),me=b.getParameter(D.UNPACK_IMAGE_HEIGHT),Fn=b.getParameter(D.UNPACK_SKIP_PIXELS),ti=b.getParameter(D.UNPACK_SKIP_ROWS),wi=b.getParameter(D.UNPACK_SKIP_IMAGES);b.pixelStorei(D.UNPACK_ROW_LENGTH,Re.width),b.pixelStorei(D.UNPACK_IMAGE_HEIGHT,Re.height),b.pixelStorei(D.UNPACK_SKIP_PIXELS,$t),b.pixelStorei(D.UNPACK_SKIP_ROWS,ae),b.pixelStorei(D.UNPACK_SKIP_IMAGES,ce);let Es=T.isDataArrayTexture||T.isData3DTexture,be=k.isDataArrayTexture||k.isData3DTexture;if(T.isDepthTexture){let Oe=Z.get(T),Ai=Z.get(k),we=Z.get(Oe.__renderTarget),Ri=Z.get(Ai.__renderTarget);b.bindFramebuffer(D.READ_FRAMEBUFFER,we.__webglFramebuffer),b.bindFramebuffer(D.DRAW_FRAMEBUFFER,Ri.__webglFramebuffer);for(let Ts=0;Ts<qt;Ts++)Es&&(D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,Z.get(T).__webglTexture,$,ce+Ts),D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,Z.get(k).__webglTexture,Ut,Ve+Ts)),D.blitFramebuffer($t,ae,zt,Nt,Yt,ge,zt,Nt,D.DEPTH_BUFFER_BIT,D.NEAREST);b.bindFramebuffer(D.READ_FRAMEBUFFER,null),b.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else if($!==0||T.isRenderTargetTexture||Z.has(T)){let Oe=Z.get(T),Ai=Z.get(k);b.bindFramebuffer(D.READ_FRAMEBUFFER,U),b.bindFramebuffer(D.DRAW_FRAMEBUFFER,H);for(let we=0;we<qt;we++)Es?D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,Oe.__webglTexture,$,ce+we):D.framebufferTexture2D(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,Oe.__webglTexture,$),be?D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,Ai.__webglTexture,Ut,Ve+we):D.framebufferTexture2D(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,Ai.__webglTexture,Ut),$!==0?D.blitFramebuffer($t,ae,zt,Nt,Yt,ge,zt,Nt,D.COLOR_BUFFER_BIT,D.NEAREST):be?D.copyTexSubImage3D(kt,Ut,Yt,ge,Ve+we,$t,ae,zt,Nt):D.copyTexSubImage2D(kt,Ut,Yt,ge,$t,ae,zt,Nt);b.bindFramebuffer(D.READ_FRAMEBUFFER,null),b.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else be?T.isDataTexture||T.isData3DTexture?D.texSubImage3D(kt,Ut,Yt,ge,Ve,zt,Nt,qt,Ee,on,Re.data):k.isCompressedArrayTexture?D.compressedTexSubImage3D(kt,Ut,Yt,ge,Ve,zt,Nt,qt,Ee,Re.data):D.texSubImage3D(kt,Ut,Yt,ge,Ve,zt,Nt,qt,Ee,on,Re):T.isDataTexture?D.texSubImage2D(D.TEXTURE_2D,Ut,Yt,ge,zt,Nt,Ee,on,Re.data):T.isCompressedTexture?D.compressedTexSubImage2D(D.TEXTURE_2D,Ut,Yt,ge,Re.width,Re.height,Ee,Re.data):D.texSubImage2D(D.TEXTURE_2D,Ut,Yt,ge,zt,Nt,Ee,on,Re);b.pixelStorei(D.UNPACK_ROW_LENGTH,pn),b.pixelStorei(D.UNPACK_IMAGE_HEIGHT,me),b.pixelStorei(D.UNPACK_SKIP_PIXELS,Fn),b.pixelStorei(D.UNPACK_SKIP_ROWS,ti),b.pixelStorei(D.UNPACK_SKIP_IMAGES,wi),Ut===0&&k.generateMipmaps&&D.generateMipmap(kt),b.unbindTexture()},this.initRenderTarget=function(T){Z.get(T).__webglFramebuffer===void 0&&et.setupRenderTarget(T)},this.initTexture=function(T){T.isCubeTexture?et.setTextureCube(T,0):T.isData3DTexture?et.setTexture3D(T,0):T.isDataArrayTexture||T.isCompressedArrayTexture?et.setTexture2DArray(T,0):et.setTexture2D(T,0),b.unbindTexture()},this.resetState=function(){K=0,L=0,q=null,b.reset(),It.reset()},typeof __THREE_DEVTOOLS__!="undefined"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Zn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=he._getDrawingBufferColorSpace(t),e.unpackColorSpace=he._getUnpackColorSpace()}};var Ul=class extends Ui{constructor(){super(),this.name="RoomEnvironment",this.position.y=-3.5;let t=new xn;t.deleteAttribute("uv");let e=new xe({side:Xe}),n=new xe,s=new oo(16777215,900,28,2);s.position.set(.418,16.199,.3),this.add(s);let r=new Ft(t,e);r.position.set(-.757,13.219,.717),r.scale.set(31.713,28.305,28.591),this.add(r);let o=new Vr(t,n,6),a=new We;a.position.set(-10.906,2.009,1.846),a.rotation.set(0,-.195,0),a.scale.set(2.328,7.905,4.651),a.updateMatrix(),o.setMatrixAt(0,a.matrix),a.position.set(-5.607,-.754,-.758),a.rotation.set(0,.994,0),a.scale.set(1.97,1.534,3.955),a.updateMatrix(),o.setMatrixAt(1,a.matrix),a.position.set(6.167,.857,7.803),a.rotation.set(0,.561,0),a.scale.set(3.927,6.285,3.687),a.updateMatrix(),o.setMatrixAt(2,a.matrix),a.position.set(-2.017,.018,6.124),a.rotation.set(0,.333,0),a.scale.set(2.002,4.566,2.064),a.updateMatrix(),o.setMatrixAt(3,a.matrix),a.position.set(2.291,-.756,-2.621),a.rotation.set(0,-.286,0),a.scale.set(1.546,1.552,1.496),a.updateMatrix(),o.setMatrixAt(4,a.matrix),a.position.set(-2.193,-.369,-5.547),a.rotation.set(0,.516,0),a.scale.set(3.875,3.487,2.986),a.updateMatrix(),o.setMatrixAt(5,a.matrix),this.add(o);let l=new Ft(t,pr(50));l.position.set(-16.116,14.37,8.208),l.scale.set(.1,2.428,2.739),this.add(l);let c=new Ft(t,pr(50));c.position.set(-16.109,18.021,-8.207),c.scale.set(.1,2.425,2.751),this.add(c);let h=new Ft(t,pr(17));h.position.set(14.904,12.198,-1.832),h.scale.set(.15,4.265,6.331),this.add(h);let u=new Ft(t,pr(43));u.position.set(-.462,8.89,14.52),u.scale.set(4.38,5.441,.088),this.add(u);let d=new Ft(t,pr(20));d.position.set(3.235,11.486,-12.541),d.scale.set(2.5,2,.1),this.add(d);let f=new Ft(t,pr(100));f.position.set(0,20,0),f.scale.set(1,.1,1),this.add(f)}dispose(){let t=new Set;this.traverse(e=>{e.isMesh&&(t.add(e.geometry),t.add(e.material))});for(let e of t)e.dispose()}};function pr(i){return new eo({color:0,emissive:16777215,emissiveIntensity:i})}var Mo=new N;function Hn(i,t,e,n,s,r){let o=2*Math.PI*s/4,a=Math.max(r-2*s,0),l=Math.PI/4;Mo.copy(t),Mo[n]=0,Mo.normalize();let c=.5*o/(o+a),h=1-Mo.angleTo(i)/l;return Math.sign(Mo[e])===1?h*c:a/(o+a)+c+c*(1-h)}var Fl=class i extends xn{constructor(t=1,e=1,n=1,s=2,r=.1){let o=s*2+1;if(r=Math.min(t/2,e/2,n/2,r),super(1,1,1,o,o,o),this.type="RoundedBoxGeometry",this.parameters={width:t,height:e,depth:n,segments:s,radius:r},o===1)return;let a=this.toNonIndexed();this.index=null,this.attributes.position=a.attributes.position,this.attributes.normal=a.attributes.normal,this.attributes.uv=a.attributes.uv;let l=new N,c=new N,h=new N(t,e,n).divideScalar(2).subScalar(r),u=this.attributes.position.array,d=this.attributes.normal.array,f=this.attributes.uv.array,g=u.length/6,_=new N,m=.5/o;for(let p=0,v=0;p<u.length;p+=3,v+=2)switch(l.fromArray(u,p),c.copy(l),c.x-=Math.sign(c.x)*m,c.y-=Math.sign(c.y)*m,c.z-=Math.sign(c.z)*m,c.normalize(),u[p+0]=h.x*Math.sign(l.x)+c.x*r,u[p+1]=h.y*Math.sign(l.y)+c.y*r,u[p+2]=h.z*Math.sign(l.z)+c.z*r,d[p+0]=c.x,d[p+1]=c.y,d[p+2]=c.z,Math.floor(p/g)){case 0:_.set(1,0,0),f[v+0]=Hn(_,c,"z","y",r,n),f[v+1]=1-Hn(_,c,"y","z",r,e);break;case 1:_.set(-1,0,0),f[v+0]=1-Hn(_,c,"z","y",r,n),f[v+1]=1-Hn(_,c,"y","z",r,e);break;case 2:_.set(0,1,0),f[v+0]=1-Hn(_,c,"x","z",r,t),f[v+1]=Hn(_,c,"z","x",r,n);break;case 3:_.set(0,-1,0),f[v+0]=1-Hn(_,c,"x","z",r,t),f[v+1]=1-Hn(_,c,"z","x",r,n);break;case 4:_.set(0,0,1),f[v+0]=1-Hn(_,c,"x","y",r,t),f[v+1]=1-Hn(_,c,"y","x",r,e);break;case 5:_.set(0,0,-1),f[v+0]=Hn(_,c,"x","y",r,t),f[v+1]=1-Hn(_,c,"y","x",r,e);break}}static fromJSON(t){return new i(t.width,t.height,t.depth,t.segments,t.radius)}};var gr=typeof document!="undefined"&&typeof document.createElement=="function",Le=Math.PI,In=Le*2,Pt=Le/2,kd=i=>i*Le/180,Vn=(i,t,e)=>Math.max(t,Math.min(e,i)),$i=(i,t,e)=>i+(t-i)*e;function hi(i,t,e,{repeat:n=null,srgb:s=!0}={}){if(!gr)return null;let r=document.createElement("canvas");r.width=i,r.height=t;let o=r.getContext("2d");e(o,i,t);let a=new Wr(r);return s&&(a.colorSpace=Qe),a.wrapS=a.wrapT=Gs,n&&a.repeat.set(n[0],n[1]),a.needsUpdate=!0,a}function zd(i,t,e,n,s=.06,r=1){for(let o=0;o<n;o++){let a=Math.random()*255;i.fillStyle=`rgba(${a},${a},${a},${s})`,i.fillRect(Math.random()*t,Math.random()*e,r,r)}}function Nx(i,t,e){i.fillStyle="#808080",i.fillRect(0,0,t,e),i.fillStyle="#c8c8c8";for(let n=-20;n<e+20;n+=22)for(let s=0;s<t;s+=20){let r=Math.floor(n/22)%2*10;i.save(),i.translate(s+r,n),i.rotate(.5),i.fillRect(-9,-4,18,8),i.restore()}i.fillStyle="#5a5a5a";for(let n=0;n<t;n+=22)i.fillRect(n,0,3,e)}function Ux(i,t,e){i.fillStyle="#d8d8d8",i.fillRect(0,0,t,e),i.strokeStyle="rgba(255,255,255,0.35)",i.lineWidth=2;for(let n=0;n<t;n+=6)i.beginPath(),i.moveTo(n,0),i.lineTo(n,e),i.stroke();for(let n=0;n<e;n+=6)i.beginPath(),i.moveTo(0,n),i.lineTo(t,n),i.stroke();i.strokeStyle="rgba(0,0,0,0.18)",i.lineWidth=3;for(let n=0;n<t;n+=64)i.beginPath(),i.moveTo(n,0),i.lineTo(n,e),i.stroke();zd(i,t,e,2600,.05,2)}function Fx(i,t,e){i.fillStyle="#a87542",i.fillRect(0,0,t,e);for(let n=0;n<26;n++){let s=n/26*e;i.fillStyle=n%2?"rgba(90,52,24,0.25)":"rgba(220,170,110,0.16)",i.fillRect(0,s,t,e/26-2),i.fillStyle="rgba(60,34,14,0.5)",i.fillRect(0,s+e/26-2,t,2)}for(let n=0;n<90;n++){i.strokeStyle=`rgba(70,40,18,${.05+Math.random()*.12})`,i.beginPath();let s=Math.random()*e;i.moveTo(0,s),i.bezierCurveTo(t*.3,s+6,t*.7,s-8,t,s+3),i.stroke()}}function Ox(i,t,e){i.fillStyle="#b9bcc0",i.fillRect(0,0,t,e);for(let n=0;n<400;n++){i.strokeStyle=`rgba(255,255,255,${.02+Math.random()*.07})`,i.beginPath();let s=Math.random()*e;i.moveTo(0,s),i.lineTo(t,s+(Math.random()-.5)*3),i.stroke()}zd(i,t,e,1500,.03,1)}function Ki(i,t={}){let{bg:e="#12161b",fg:n="#f2ecdf",accent:s="#e8b45a",width:r=512,height:o=128,font:a="bold 54px Arial, sans-serif",sub:l="",subFont:c="bold 22px Arial, sans-serif",border:h=!0}=t;return hi(r,o,(u,d,f)=>{u.fillStyle=e,u.fillRect(0,0,d,f),h&&(u.strokeStyle=s,u.lineWidth=6,u.strokeRect(6,6,d-12,f-12)),u.fillStyle=s,u.fillRect(20,20,10,f-40),u.fillStyle=n,u.font=a,u.textBaseline="middle",u.fillText(i,48,l?f*.42:f*.52),l&&(u.fillStyle="rgba(242,236,223,0.7)",u.font=c,u.fillText(l,50,f*.72))})}function _r(i){return hi(256,64,(t,e,n)=>{t.fillStyle="#f2f2ea",t.fillRect(0,0,e,n),t.fillStyle="#1b2634",t.fillRect(0,0,34,n),t.fillStyle="#f2f2ea",t.font="bold 13px Arial",t.fillText("RUS",4,n-12),t.fillStyle="#111",t.font="bold 40px Arial",t.textAlign="center",t.fillText(i,144,46),t.strokeStyle="#777",t.lineWidth=3,t.strokeRect(1,1,e-2,n-2)})}function Hd(i=null){var o,a,l;let t=Math.min(8,(l=(a=(o=i==null?void 0:i.capabilities)==null?void 0:o.getMaxAnisotropy)==null?void 0:a.call(o))!=null?l:4),e={tread:hi(256,256,Nx,{srgb:!1}),tarp:hi(512,512,Ux,{repeat:[3,2]}),wood:hi(512,512,Fx,{repeat:[1,4]}),metal:hi(512,512,Ox,{repeat:[2,1]})};for(let c of Object.values(e))c&&(c.anisotropy=t);let n=c=>new xe(c),s=c=>new Mi(c);return{paint(c,h={}){var u,d,f,g,_;return s({color:c,metalness:(u=h.metalness)!=null?u:.45,roughness:(d=h.roughness)!=null?d:.32,clearcoat:(f=h.clearcoat)!=null?f:1,clearcoatRoughness:(g=h.clearcoatRoughness)!=null?g:.08,envMapIntensity:(_=h.envMapIntensity)!=null?_:1.05})},accent(c,h={}){var u,d;return s({color:c,metalness:(u=h.metalness)!=null?u:.3,roughness:(d=h.roughness)!=null?d:.34,clearcoat:.8,clearcoatRoughness:.12})},get chrome(){return n({color:15856629,metalness:1,roughness:.08,envMapIntensity:1.7})},get chromeDark(){return n({color:12041410,metalness:1,roughness:.22,envMapIntensity:1.3})},get steel(){return n({color:10133928,metalness:.92,roughness:.34,map:e.metal,envMapIntensity:1.1})},get darkSteel(){return n({color:2962490,metalness:.85,roughness:.45,envMapIntensity:.9})},get frame(){return n({color:1974823,metalness:.7,roughness:.6})},get plastic(){return n({color:1316892,metalness:.15,roughness:.72})},get plasticGray(){return n({color:3949901,metalness:.1,roughness:.82})},get plasticLight(){return n({color:12106940,metalness:.1,roughness:.6})},get rubber(){return n({color:1316376,roughness:.96,metalness:0,bumpMap:e.tread,bumpScale:.035})},get rubberTrim(){return n({color:2106151,roughness:.9,metalness:.05})},get glass(){return s({color:12574958,metalness:.1,roughness:.06,transparent:!0,opacity:.26,envMapIntensity:1.6,depthWrite:!1,side:Ne})},get glassDark(){return s({color:2767944,metalness:.2,roughness:.1,transparent:!0,opacity:.55,envMapIntensity:1.3,depthWrite:!1})},get mirror(){return n({color:14674158,metalness:1,roughness:.03,envMapIntensity:2})},get headlight(){return n({color:16645360,emissive:16774095,emissiveIntensity:.35,roughness:.12,metalness:.25})},get taillight(){return n({color:9313047,emissive:16722458,emissiveIntensity:.5,roughness:.25})},get amber(){return n({color:11822618,emissive:16751406,emissiveIntensity:.6,roughness:.3})},get reverseLight(){return n({color:14212306,emissive:14286832,emissiveIntensity:.15,roughness:.3})},get interiorDark(){return n({color:2237995,roughness:.82,metalness:.08})},get interiorMid(){return n({color:3356991,roughness:.75,metalness:.1})},get leather(){return n({color:2303530,roughness:.62,metalness:.05})},get leatherBeige(){return n({color:10982521,roughness:.68,metalness:.04})},get fabric(){return n({color:3883593,roughness:.95,metalness:.02})},get dashScreen(){return n({color:659220,emissive:1919843,emissiveIntensity:.55,roughness:.25})},get tarp(){return n({color:14672870,map:e.tarp,roughness:.92,metalness:.02})},get tarpDark(){return n({color:4015178,map:e.tarp,roughness:.94,metalness:.02})},get wood(){return n({color:12159570,map:e.wood,roughness:.86,metalness:.02})},get tank(){return n({color:14212834,metalness:.95,roughness:.18,envMapIntensity:1.5})},get tankWhite(){return n({color:15330798,metalness:.35,roughness:.3,envMapIntensity:1.1})},get orange(){return n({color:14182687,metalness:.25,roughness:.55})},get hazard(){return n({color:14715422,metalness:.2,roughness:.6})},get rope(){return n({color:7169109,roughness:.95})},get containerBlue(){return n({color:2579320,metalness:.55,roughness:.6})},get containerRed(){return n({color:9189930,metalness:.5,roughness:.62})},get containerGreen(){return n({color:4023623,metalness:.5,roughness:.6})},get concrete(){return n({color:10263700,roughness:.95})}}}function Ue(i=null,t=""){let e=new en;return e.name=t,i&&i.add(e),e}function xr(i,t,e,n=0,s=0,r=0){let o=new Ft(t,e);return o.position.set(n,s,r),i==null||i.add(o),o}function B(i,t,e,n,s,r=0,o=0,a=0){return xr(i,new xn(t,e,n),s,r,o,a)}function W(i,t,e,n,s,r=0,o=0,a=0,l=.05,c=2){let h=Math.min(l,Math.min(t,e,n)/2-5e-4);return xr(i,new Fl(t,e,n,c,Math.max(.001,h)),s,r,o,a)}function Ht(i,t,e,n,s,r=0,o=0,a=0,l=20){return xr(i,new Me(t,e,n,l),s,r,o,a)}function bs(i,t,e,n=0,s=0,r=0,o=16){return xr(i,new oi(t,o,Math.max(6,o/2)),e,n,s,r)}function Ln(i,t,e,n,s=0,r=0,o=0,a=24,l=In){return xr(i,new sn(t,e,10,a,l),n,s,r,o)}function vn(i,t,e,n,s=0,r=0,o=0){return xr(i,new Bn(t,e),n,s,r,o)}function ji(i,t={}){let{radius:e=.52,width:n=.32,style:s="truck",rimColor:r=14146270,tread:o=i.rubber,spokes:a=6,brakeDisc:l=!0}=t,c=new en,h=new en;h.rotation.z=Pt,c.add(h);let u=n/2,d=e*.6,f=[new at(d,-u),new at(e*.88,-u*1.02),new at(e*.985,-u*.78),new at(e,-u*.42),new at(e,u*.42),new at(e*.985,u*.78),new at(e*.88,u*1.02),new at(d,u)],g=new to(f,40),_=new Ft(g,o);h.add(_);let m=new Ft(new Me(d,d,n*.96,28,1,!0),i.rubberTrim);h.add(m);let p=e*.58,v=new Ft(new Me(p,p,n*.9,30),mr(r));h.add(v);let S=new Ft(new sn(p*.99,e*.022,8,30),mr(r));S.rotation.x=Pt,S.position.y=u*.86,h.add(S);let y=u*.9;if(s==="truck"){for(let M=0;M<10;M++){let A=M/10*In,x=new Ft(new Me(e*.075,e*.075,.012,8),i.plastic);x.position.set(Math.cos(A)*p*.68,y,Math.sin(A)*p*.68),h.add(x)}let E=new Ft(new Me(e*.2,e*.23,.05,18),mr(r));E.position.y=y-.006,h.add(E);for(let M=0;M<6;M++){let A=M/6*In,x=new Ft(new Me(.022,.022,.024,6),i.chromeDark);x.position.set(Math.cos(A)*e*.13,y+.018,Math.sin(A)*e*.13),h.add(x)}}else{let E=mr(r);for(let x=0;x<a;x++){let w=x/a*In,C=new Ft(new xn(e*.16,.05,p*.92),E);C.position.set(Math.cos(w)*p*.45,y-.02,Math.sin(w)*p*.45),C.rotation.y=-w,h.add(C)}let M=new Ft(new Me(e*.17,e*.19,.032,20),mr(r));M.position.y=y-.004,h.add(M);for(let x=0;x<5;x++){let w=x/5*In,C=new Ft(new Me(.014,.014,.018,6),i.chromeDark);C.position.set(Math.cos(w)*e*.11,y+.012,Math.sin(w)*e*.11),h.add(C)}let A=new Ft(new Me(e*.085,e*.085,.022,16),mr(1711650));A.position.y=y+.008,h.add(A)}if(l){let E=new Ft(new Me(e*.52,e*.52,.035,28),i.darkSteel);E.position.y=-u*.2,h.add(E);let M=new Ft(new xn(e*.2,.09,e*.28),i.plasticGray);M.position.set(e*.35,-u*.2,e*.28),h.add(M)}return c.userData.radius=e,c}function mr(i){return new xe({color:i,metalness:.95,roughness:.26,envMapIntensity:1.2})}function Gn(i,t,e,n,s,r=8){let o=new N(...t),a=new N(...e),l=a.clone().sub(o),c=l.length(),h=new Me(n,n,c,r),u=new Ft(h,s);return u.position.copy(o).add(a).multiplyScalar(.5),u.quaternion.setFromUnitVectors(new N(0,1,0),l.normalize()),i.add(u),u}function Ss(i=window,t=navigator){let e=f=>{var g;try{return!!((g=i.matchMedia)!=null&&g.call(i,f).matches)}catch{return!1}},n=((t==null?void 0:t.userAgent)||"").toLowerCase(),s=(t==null?void 0:t.maxTouchPoints)||0,r=e("(pointer: coarse)"),o=e("(hover: none)"),a=s>0||r||o,l=/android|iphone|ipad|ipod|mobile|windows phone|opera mini/.test(n),c=Math.min(i.innerWidth||1024,i.innerHeight||768),h=a&&(c<=620||/iphone|android.*mobile|mobile/.test(n)&&c<=900),u=a&&!h&&(c<=1100||/ipad|tablet/.test(n));return{touch:a,coarse:r,noHover:o,phone:h,tablet:u,desktop:!a&&!h,mobile:h||u,standalone:e("(display-mode: standalone)")||(t==null?void 0:t.standalone)===!0,reducedMotion:e("(prefers-reduced-motion: reduce)"),portrait:(i.innerHeight||0)>=(i.innerWidth||0),dpr:i.devicePixelRatio||1,cores:(t==null?void 0:t.hardwareConcurrency)||4,memory:(t==null?void 0:t.deviceMemory)||4}}function Bx(i=Ss()){return i.phone||i.cores<=4||i.memory<=4}function Vd(i,t={},e={}){var M;let n=e.win||(typeof window!="undefined"?window:null),s=(M=e.swipeMin)!=null?M:46,r=t.onSwipe,o=t.onDoubleTap,a=t.onPinch,l=t.onInteraction,c=0,h=0,u=0,d=!1,f=!1,g=0,_=0,m=A=>{let[x,w]=A;return Math.hypot(x.clientX-w.clientX,x.clientY-w.clientY)};function p(A){A.touches.length===1?(f=!1,c=A.touches[0].clientX,h=A.touches[0].clientY,u=performance.now(),d=!1):A.touches.length===2&&(f=!0,_=m(A.touches)),l==null||l()}function v(A){if(A.touches.length!==1||f)return;let x=A.touches[0].clientX-c,w=A.touches[0].clientY-h;Math.hypot(x,w)>10&&(d=!0)}function S(A){var P;if(f){A.touches.length===0&&(f=!1);return}let x=(P=A.changedTouches)==null?void 0:P[0];if(!x)return;let w=x.clientX-c,C=x.clientY-h,I=performance.now()-u;if(r&&I<550&&Math.abs(w)>s&&Math.abs(w)>Math.abs(C)*1.6){r(Math.sign(w));return}if(!d&&o){let O=performance.now();O-g<320?(o(),g=0):g=O}}function y(A){if(A.touches.length!==2||!_)return;let x=m(A.touches);Math.abs(x-_)>70&&(a==null||a(x>_?"out":"in"),_=x)}i.addEventListener("touchstart",p,{passive:!0}),i.addEventListener("touchmove",v,{passive:!0}),i.addEventListener("touchmove",y,{passive:!0}),i.addEventListener("touchend",S,{passive:!0});let E=A=>{var x;((x=A.touches)==null?void 0:x.length)>1&&A.preventDefault()};return i.addEventListener("gesturestart",A=>A.preventDefault(),{passive:!1}),()=>{i.removeEventListener("touchstart",p),i.removeEventListener("touchmove",v),i.removeEventListener("touchmove",y),i.removeEventListener("touchend",S),i.removeEventListener("gesturestart",E)}}function Ms(i=8){var t;try{(t=navigator.vibrate)==null||t.call(navigator,i)}catch{}}function Ch(i=Ss(),t=60,e=window){var a,l;let n=((e==null?void 0:e.innerWidth)||1280)*((e==null?void 0:e.innerHeight)||720),s=Bx(i),r=Math.min(i.dpr||1,s?1.35:2);n>26e5&&(r=Math.min(r,1.6)),t<40&&(r=Math.min(r,1));let o=!s&&((a=i.cores)!=null?a:4)>=8&&((l=i.memory)!=null?l:4)>=8;return{pixelRatio:r,shadows:!s&&(o||n<34e5),antialias:!s,powerPreference:s?"default":"high-performance"}}function Gd(i,t={}){var r;if(!("DeviceMotionEvent"in window))return()=>{};let e=(r=t.threshold)!=null?r:22,n=0,s=o=>{let a=o.accelerationIncludingGravity;if(!a)return;Math.hypot(a.x||0,a.y||0,a.z||0)>e&&performance.now()-n>1200&&(n=performance.now(),i())};return window.addEventListener("devicemotion",s),()=>window.removeEventListener("devicemotion",s)}function Wd(i){let t=Ss(),e=Ch(t),n=new Ll({canvas:i,antialias:e.antialias,powerPreference:e.powerPreference,alpha:!1,preserveDrawingBuffer:!1});n.setPixelRatio(e.pixelRatio),n.outputColorSpace=Qe,n.toneMapping=rr,n.toneMappingExposure=1.02,n.shadowMap.enabled=e.shadows||!t.mobile,n.shadowMap.type=t.mobile?ps:za;let s=new Ui;s.background=new jt("#0b0d0c"),s.fog=new Js("#0b0d0c",42,120);let r=new qe(38,1,.05,400);r.position.set(8,3.4,-9);let o=new io(14674418,1448218,1.15);s.add(o);let a=new Hi(16774370,2.6);a.position.set(7,13,-9),a.castShadow=!0,a.shadow.mapSize.set(2048,2048),a.shadow.camera.left=-16,a.shadow.camera.right=16,a.shadow.camera.top=16,a.shadow.camera.bottom=-16,a.shadow.camera.near=1,a.shadow.camera.far=46,a.shadow.bias=-6e-4,a.shadow.normalBias=.02,a.shadow.radius=2.5,s.add(a);let l=new Hi(12376319,.85);l.position.set(-10,6,7),s.add(l);let c=new Hi(16767400,1.5);c.position.set(-4,5,12),s.add(c);let h=new Hi(10478847,.7);h.position.set(9,2.4,9),s.add(h);let u=[];for(let[L,q,X]of[[-6,-6,16773336],[6,-6,14676991],[0,7.5,16770240]]){let z=new ro(X,130,34,.55,.55,1.6);z.position.set(L,11.5,q),z.target.position.set(0,1,0),s.add(z,z.target),u.push(z)}let d=new dr(n);d.compileEquirectangularShader();let f=null;try{if(gr){let L=kx();L&&(L.mapping=or,f=d.fromEquirectangular(L),s.environment=f.texture,L.dispose())}}catch(L){console.warn("env fallback",L)}if(!s.environment)try{s.environment=d.fromScene(new Ul,.04).texture}catch(L){console.warn("RoomEnvironment \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D",L)}s.environmentIntensity=.9;let g=new en;s.add(g);let _=gr?hi(1024,1024,(L,q,X)=>{L.fillStyle="#14171a",L.fillRect(0,0,q,X);let z=q/8;for(let G=0;G<8;G++)for(let pt=0;pt<8;pt++)L.fillStyle=(pt+G)%2?"#171a1e":"#111417",L.fillRect(pt*z,G*z,z,z);L.strokeStyle="rgba(255,255,255,0.045)",L.lineWidth=2;for(let G=0;G<=8;G++)L.beginPath(),L.moveTo(G*z,0),L.lineTo(G*z,X),L.stroke(),L.beginPath(),L.moveTo(0,G*z),L.lineTo(q,G*z),L.stroke();for(let G=0;G<9e3;G++)L.fillStyle=`rgba(255,255,255,${Math.random()*.02})`,L.fillRect(Math.random()*q,Math.random()*X,2,2)},{repeat:[6,6]}):null,m=new xe({color:2764595,roughness:.32,metalness:.55,map:_,envMapIntensity:.65}),p=new Ft(new Bn(160,160),m);p.rotation.x=-Math.PI/2,p.receiveShadow=!0,g.add(p);let v=new Ft(new Me(9.2,9.5,.1,72,1,!1),new xe({color:1843236,roughness:.2,metalness:.75,envMapIntensity:.9}));v.position.y=.05,v.receiveShadow=!0,g.add(v);let S=new Ft(new sn(9.32,.025,6,96),new xe({color:15250522,emissive:15250522,emissiveIntensity:1.3,roughness:.4}));S.rotation.x=Math.PI/2,S.position.y=.1,g.add(S);let y=gr?hi(1024,512,(L,q,X)=>{let z=L.createLinearGradient(0,0,0,X);z.addColorStop(0,"#161c20"),z.addColorStop(.55,"#2a333a"),z.addColorStop(.72,"#5d6a72"),z.addColorStop(.88,"#39434a"),z.addColorStop(1,"#151a1d"),L.fillStyle=z,L.fillRect(0,0,q,X);for(let G=0;G<9;G++){let pt=40+G*112,j=L.createLinearGradient(0,X*.2,0,X*.62);j.addColorStop(0,"rgba(255,244,224,0.85)"),j.addColorStop(1,"rgba(255,244,224,0)"),L.fillStyle=j,L.fillRect(pt,X*.2,62,X*.42)}for(let G=0;G<9;G++)L.fillStyle="rgba(10,12,14,0.55)",L.fillRect(20+G*112,X*.16,12,X*.68);L.fillStyle="rgba(232,180,90,0.35)",L.fillRect(0,X*.7,q,3)}):null,E=new Si({map:y,side:Xe,fog:!0}),M=new Ft(new Me(46,46,26,48,1,!0),E);M.position.y=12,g.add(M);let A=new Ft(new oi(46,32,16,0,Math.PI*2,0,Math.PI/2),new Si({color:1778215,side:Xe,fog:!0}));g.add(A);let x=new xe({color:2435888,roughness:.35,metalness:.85});for(let L=0;L<3;L++){let q=new Ft(new sn(10.5+L*1.6,.07,6,120,Math.PI),x);q.rotation.z=Math.PI,q.position.y=.5,q.rotation.x=0,q.rotation.y=L*.35,g.add(q)}let w=new Si({color:3818056,transparent:!0,opacity:.6});for(let L=-6;L<=6;L++){let q=new Ft(new Bn(.02,60),w);q.rotation.x=-Math.PI/2,q.position.set(L*3,.011,-26),g.add(q)}let C={studio:{bg:"#0b0d0c",fog:["#0b0d0c",42,120],floor:2764595,floorRough:.32,floorMetal:.55,hemi:1.15,key:2.6,rim:1.5,env:.9,exposure:1.02,grid:!0},dark:{bg:"#050607",fog:["#050607",30,90],floor:856082,floorRough:.18,floorMetal:.8,hemi:.5,key:1.8,rim:2.6,env:.65,exposure:.92,grid:!0},show:{bg:"#101418",fog:["#101418",50,130],floor:3817542,floorRough:.5,floorMetal:.35,hemi:1.6,key:3.2,rim:1.2,env:1.05,exposure:1.06,grid:!0},garage:{bg:"#0e1112",fog:["#0e1112",38,105],floor:2369578,floorRough:.82,floorMetal:.15,hemi:.9,key:2.2,rim:.9,env:.7,exposure:1,grid:!1}},I="studio";function P(L){var X;let q=C[L]||C.studio;I=L,s.background=new jt(q.bg),s.fog=new Js(q.fog[0],q.fog[1],q.fog[2]),m.color.setHex(q.floor),m.roughness=q.floorRough,m.metalness=q.floorMetal,o.intensity=q.hemi,a.intensity=q.key,c.intensity=q.rim,s.environmentIntensity=q.env,n.toneMappingExposure=q.exposure,w.opacity=q.grid?.6:.12,S.visible=L!=="garage";for(let z of g.children)((X=z.geometry)==null?void 0:X.type)==="TorusGeometry"&&z!==S&&(z.visible=L!=="garage")}function O(){let L=i.parentElement,q=Math.max(320,(L==null?void 0:L.clientWidth)||i.clientWidth||900),X=Math.max(240,(L==null?void 0:L.clientHeight)||i.clientHeight||560),z=Ch(Ss(),U);n.setPixelRatio(z.pixelRatio),n.setSize(q,X,!1),r.aspect=q/X,r.fov=X>q?Math.max(38,H(q/X)):38,r.updateProjectionMatrix()}let U=60,H=L=>Math.min(60,38+(1-Math.min(1,L))*26);function K(L){U=L,L<32&&n.getPixelRatio()>1&&(n.setPixelRatio(Math.max(1,n.getPixelRatio()-.2)),n.setSize(i.clientWidth,i.clientHeight,!1))}return typeof ResizeObserver!="undefined"&&i.parentElement&&new ResizeObserver(()=>O()).observe(i.parentElement),window.addEventListener("resize",O),O(),{renderer:n,scene:s,camera:r,stage:g,profile:t,adaptQuality:K,lights:{hemi:o,key:a,fill:l,rim:c,rim2:h,spots:u},setPreset:P,resize:O,get preset(){return I}}}function kx(){return hi(2048,1024,(i,t,e)=>{let n=i.createLinearGradient(0,0,0,e);n.addColorStop(0,"#2a3339"),n.addColorStop(.45,"#1a2025"),n.addColorStop(.55,"#0d1114"),n.addColorStop(1,"#05080a"),i.fillStyle=n,i.fillRect(0,0,t,e);let s=(o,a,l,c,h,u=1)=>{let d=i.createRadialGradient(o,a,1,o,a,l);d.addColorStop(0,h),d.addColorStop(.55,h),d.addColorStop(1,"rgba(0,0,0,0)"),i.globalAlpha=u,i.fillStyle=d,i.beginPath(),i.ellipse(o,a,l,c,0,0,Math.PI*2),i.fill(),i.globalAlpha=1};for(let o=0;o<5;o++){let a=150+o*46,l=i.createLinearGradient(0,a,t,a);l.addColorStop(0,"rgba(255,244,225,0)"),l.addColorStop(.2,"rgba(255,246,230,0.85)"),l.addColorStop(.5,"rgba(255,250,240,1)"),l.addColorStop(.8,"rgba(255,246,230,0.85)"),l.addColorStop(1,"rgba(255,244,225,0)"),i.fillStyle=l,i.fillRect(0,a,t,14+o*2)}for(let o=0;o<3;o++){let a=360+o*40,l=i.createLinearGradient(0,a,t,a);l.addColorStop(0,"rgba(180,220,255,0)"),l.addColorStop(.55,"rgba(200,232,255,0.55)"),l.addColorStop(1,"rgba(180,220,255,0)"),i.fillStyle=l,i.fillRect(0,a,t,10)}s(t*.15,e*.42,190,120,"rgba(255,240,214,0.9)",.9),s(t*.62,e*.38,230,150,"rgba(214,238,255,0.85)",.85),s(t*.88,e*.46,160,100,"rgba(255,226,190,0.8)",.8);let r=i.createLinearGradient(0,e*.6,0,e);r.addColorStop(0,"rgba(60,70,78,0.5)"),r.addColorStop(1,"rgba(0,0,0,0)"),i.fillStyle=r,i.fillRect(0,e*.6,t,e*.4)},{srgb:!0})}function Xd(){let i=new Ui;i.background=new jt("#0b0d0c");let t=new qe(38,1.5,.05,400);return{renderer:{domElement:gr?document.createElement("canvas"):null,capabilities:{getMaxAnisotropy:()=>1},shadowMap:{enabled:!1,type:0},outputColorSpace:Qe,toneMapping:rr,toneMappingExposure:1,render(){},setPixelRatio(){},setSize(){},dispose(){}},scene:i,camera:t,lights:{},fallback:!0,profile:{mobile:!1,phone:!1,touch:!1},setPreset(){},resize(){},adaptQuality(){}}}var qd={type:"change"},Ih={type:"start"},Zd={type:"end"},Ol=new hs,Yd=new Tn,zx=Math.cos(70*ih.DEG2RAD),Je=new N,bn=2*Math.PI,ye={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},Ph=1e-6,Bl=class extends co{constructor(t,e=null){super(t,e),this.state=ye.NONE,this.target=new N,this.cursor=new N,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:Gi.ROTATE,MIDDLE:Gi.DOLLY,RIGHT:Gi.PAN},this.touches={ONE:Wi.ROTATE,TWO:Wi.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._cursorStyle="auto",this._domElementKeyEvents=null,this._lastPosition=new N,this._lastQuaternion=new An,this._lastTargetPosition=new N,this._quat=new An().setFromUnitVectors(t.up,new N(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new Vi,this._sphericalDelta=new Vi,this._scale=1,this._panOffset=new N,this._rotateStart=new at,this._rotateEnd=new at,this._rotateDelta=new at,this._panStart=new at,this._panEnd=new at,this._panDelta=new at,this._dollyStart=new at,this._dollyEnd=new at,this._dollyDelta=new at,this._dollyDirection=new N,this._mouse=new at,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=Vx.bind(this),this._onPointerDown=Hx.bind(this),this._onPointerUp=Gx.bind(this),this._onContextMenu=$x.bind(this),this._onMouseWheel=qx.bind(this),this._onKeyDown=Yx.bind(this),this._onTouchStart=Zx.bind(this),this._onTouchMove=Jx.bind(this),this._onMouseDown=Wx.bind(this),this._onMouseMove=Xx.bind(this),this._interceptControlDown=Kx.bind(this),this._interceptControlUp=jx.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}set cursorStyle(t){this._cursorStyle=t,t==="grab"?this.domElement.style.cursor="grab":this.domElement.style.cursor="auto"}get cursorStyle(){return this._cursorStyle}connect(t){super.connect(t),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.state=ye.NONE,this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents();let t=this.domElement.getRootNode();t.removeEventListener("keydown",this._interceptControlDown,{capture:!0}),t.removeEventListener("keyup",this._interceptControlUp,{capture:!0}),this._controlActive=!1,this._pointers.length=0,this._pointerPositions={},this.domElement.style.touchAction="",this.domElement.style.cursor="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(t){t.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=t}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(qd),this.update(),this.state=ye.NONE}pan(t,e){this._pan(t,e),this.update()}dollyIn(t){this._dollyIn(t),this.update()}dollyOut(t){this._dollyOut(t),this.update()}rotateLeft(t){this._rotateLeft(t),this.update()}rotateUp(t){this._rotateUp(t),this.update()}update(t=null){let e=this.object.position;Je.copy(e).sub(this.target),Je.applyQuaternion(this._quat),this._spherical.setFromVector3(Je),this.autoRotate&&this.state===ye.NONE&&this._rotateLeft(this._getAutoRotationAngle(t)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(n)&&isFinite(s)&&(n<-Math.PI?n+=bn:n>Math.PI&&(n-=bn),s<-Math.PI?s+=bn:s>Math.PI&&(s-=bn),n<=s?this._spherical.theta=Math.max(n,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+s)/2?Math.max(n,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let o=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=o!=this._spherical.radius}if(Je.setFromSpherical(this._spherical),Je.applyQuaternion(this._quatInverse),e.copy(this.target).add(Je),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let o=null;if(this.object.isPerspectiveCamera){let a=Je.length();o=this._clampDistance(a*this._scale);let l=a-o;this.object.position.addScaledVector(this._dollyDirection,l),this.object.updateMatrixWorld(),r=!!l}else if(this.object.isOrthographicCamera){let a=new N(this._mouse.x,this._mouse.y,0);a.unproject(this.object);let l=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=l!==this.object.zoom;let c=new N(this._mouse.x,this._mouse.y,0);c.unproject(this.object),this.object.position.sub(c).add(a),this.object.updateMatrixWorld(),o=Je.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;o!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(o).add(this.object.position):(Ol.origin.copy(this.object.position),Ol.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(Ol.direction))<zx?this.object.lookAt(this.target):(Yd.setFromNormalAndCoplanarPoint(this.object.up,this.target),Ol.intersectPlane(Yd,this.target))))}else if(this.object.isOrthographicCamera){let o=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),o!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>Ph||8*(1-this._lastQuaternion.dot(this.object.quaternion))>Ph||this._lastTargetPosition.distanceToSquared(this.target)>Ph?(this.dispatchEvent(qd),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(t){return t!==null?bn/60*this.autoRotateSpeed*t:bn/60/60*this.autoRotateSpeed}_getZoomScale(t){let e=Math.abs(t*.01);return Math.pow(.95,this.zoomSpeed*e)}_rotateLeft(t){this._sphericalDelta.theta-=t}_rotateUp(t){this._sphericalDelta.phi-=t}_panLeft(t,e){Je.setFromMatrixColumn(e,0),Je.multiplyScalar(-t),this._panOffset.add(Je)}_panUp(t,e){this.screenSpacePanning===!0?Je.setFromMatrixColumn(e,1):(Je.setFromMatrixColumn(e,0),Je.crossVectors(this.object.up,Je)),Je.multiplyScalar(t),this._panOffset.add(Je)}_pan(t,e){let n=this.domElement;if(this.object.isPerspectiveCamera){let s=this.object.position;Je.copy(s).sub(this.target);let r=Je.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*t*r/n.clientHeight,this.object.matrix),this._panUp(2*e*r/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(t*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(e*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(t,e){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let n=this.domElement.getBoundingClientRect(),s=t-n.left,r=e-n.top,o=n.width,a=n.height;this._mouse.x=s/o*2-1,this._mouse.y=-(r/a)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(t){return Math.max(this.minDistance,Math.min(this.maxDistance,t))}_handleMouseDownRotate(t){this._rotateStart.set(t.clientX,t.clientY)}_handleMouseDownDolly(t){this._updateZoomParameters(t.clientX,t.clientX),this._dollyStart.set(t.clientX,t.clientY)}_handleMouseDownPan(t){this._panStart.set(t.clientX,t.clientY)}_handleMouseMoveRotate(t){this._rotateEnd.set(t.clientX,t.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let e=this.domElement;this._rotateLeft(bn*this._rotateDelta.x/e.clientHeight),this._rotateUp(bn*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(t){this._dollyEnd.set(t.clientX,t.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(t){this._panEnd.set(t.clientX,t.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(t){this._updateZoomParameters(t.clientX,t.clientY),t.deltaY<0?this._dollyIn(this._getZoomScale(t.deltaY)):t.deltaY>0&&this._dollyOut(this._getZoomScale(t.deltaY)),this.update()}_handleKeyDown(t){let e=!1;switch(t.code){case this.keys.UP:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateUp(bn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),e=!0;break;case this.keys.BOTTOM:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateUp(-bn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),e=!0;break;case this.keys.LEFT:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateLeft(bn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),e=!0;break;case this.keys.RIGHT:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateLeft(-bn*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),e=!0;break}e&&(t.preventDefault(),this.update())}_handleTouchStartRotate(t){if(this._pointers.length===1)this._rotateStart.set(t.pageX,t.pageY);else{let e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._rotateStart.set(n,s)}}_handleTouchStartPan(t){if(this._pointers.length===1)this._panStart.set(t.pageX,t.pageY);else{let e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._panStart.set(n,s)}}_handleTouchStartDolly(t){let e=this._getSecondPointerPosition(t),n=t.pageX-e.x,s=t.pageY-e.y,r=Math.sqrt(n*n+s*s);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enablePan&&this._handleTouchStartPan(t)}_handleTouchStartDollyRotate(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enableRotate&&this._handleTouchStartRotate(t)}_handleTouchMoveRotate(t){if(this._pointers.length==1)this._rotateEnd.set(t.pageX,t.pageY);else{let n=this._getSecondPointerPosition(t),s=.5*(t.pageX+n.x),r=.5*(t.pageY+n.y);this._rotateEnd.set(s,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let e=this.domElement;this._rotateLeft(bn*this._rotateDelta.x/e.clientHeight),this._rotateUp(bn*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(t){if(this._pointers.length===1)this._panEnd.set(t.pageX,t.pageY);else{let e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._panEnd.set(n,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(t){let e=this._getSecondPointerPosition(t),n=t.pageX-e.x,s=t.pageY-e.y,r=Math.sqrt(n*n+s*s);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let o=(t.pageX+e.x)*.5,a=(t.pageY+e.y)*.5;this._updateZoomParameters(o,a)}_handleTouchMoveDollyPan(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enablePan&&this._handleTouchMovePan(t)}_handleTouchMoveDollyRotate(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enableRotate&&this._handleTouchMoveRotate(t)}_addPointer(t){this._pointers.push(t.pointerId)}_removePointer(t){delete this._pointerPositions[t.pointerId];for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId){this._pointers.splice(e,1);return}}_isTrackingPointer(t){for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId)return!0;return!1}_trackPointer(t){let e=this._pointerPositions[t.pointerId];e===void 0&&(e=new at,this._pointerPositions[t.pointerId]=e),e.set(t.pageX,t.pageY)}_getSecondPointerPosition(t){let e=t.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[e]}_customWheelEvent(t){let e=t.deltaMode,n={clientX:t.clientX,clientY:t.clientY,deltaY:t.deltaY};switch(e){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100;break}return t.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}};function Hx(i){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(i.pointerId),this.domElement.ownerDocument.addEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(i)&&(this._addPointer(i),i.pointerType==="touch"?this._onTouchStart(i):this._onMouseDown(i),this._cursorStyle==="grab"&&(this.domElement.style.cursor="grabbing")))}function Vx(i){this.enabled!==!1&&(i.pointerType==="touch"?this._onTouchMove(i):this._onMouseMove(i))}function Gx(i){switch(this._removePointer(i),this._pointers.length){case 0:this.domElement.releasePointerCapture(i.pointerId),this.domElement.ownerDocument.removeEventListener("pointermove",this._onPointerMove),this.domElement.ownerDocument.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(Zd),this.state=ye.NONE,this._cursorStyle==="grab"&&(this.domElement.style.cursor="grab");break;case 1:let t=this._pointers[0],e=this._pointerPositions[t];this._onTouchStart({pointerId:t,pageX:e.x,pageY:e.y});break}}function Wx(i){let t;switch(i.button){case 0:t=this.mouseButtons.LEFT;break;case 1:t=this.mouseButtons.MIDDLE;break;case 2:t=this.mouseButtons.RIGHT;break;default:t=-1}switch(t){case Gi.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(i),this.state=ye.DOLLY;break;case Gi.ROTATE:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=ye.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=ye.ROTATE}break;case Gi.PAN:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=ye.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=ye.PAN}break;default:this.state=ye.NONE}this.state!==ye.NONE&&this.dispatchEvent(Ih)}function Xx(i){switch(this.state){case ye.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(i);break;case ye.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(i);break;case ye.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(i);break}}function qx(i){this.enabled===!1||this.enableZoom===!1||this.state!==ye.NONE||(i.preventDefault(),this.dispatchEvent(Ih),this._handleMouseWheel(this._customWheelEvent(i)),this.dispatchEvent(Zd))}function Yx(i){this.enabled!==!1&&this._handleKeyDown(i)}function Zx(i){switch(this._trackPointer(i),this._pointers.length){case 1:switch(this.touches.ONE){case Wi.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(i),this.state=ye.TOUCH_ROTATE;break;case Wi.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(i),this.state=ye.TOUCH_PAN;break;default:this.state=ye.NONE}break;case 2:switch(this.touches.TWO){case Wi.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(i),this.state=ye.TOUCH_DOLLY_PAN;break;case Wi.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(i),this.state=ye.TOUCH_DOLLY_ROTATE;break;default:this.state=ye.NONE}break;default:this.state=ye.NONE}this.state!==ye.NONE&&this.dispatchEvent(Ih)}function Jx(i){switch(this._trackPointer(i),this.state){case ye.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(i),this.update();break;case ye.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(i),this.update();break;case ye.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(i),this.update();break;case ye.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(i),this.update();break;default:this.state=ye.NONE}}function $x(i){this.enabled!==!1&&i.preventDefault()}function Kx(i){i.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function jx(i){i.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}var kl=class{constructor(t,e,n={}){this.camera=t,this.controls=new Bl(t,e);let s=!!n.touch;this.controls.enableDamping=!0,this.controls.dampingFactor=s?.12:.085,this.controls.minDistance=1.4,this.controls.maxDistance=46,this.controls.zoomToCursor=!0,this.controls.zoomSpeed=s?.95:.8,this.controls.rotateSpeed=s?.6:.9,this.controls.panSpeed=.85,this.controls.maxPolarAngle=Math.PI*.495,this.controls.screenSpacePanning=!0,this.controls.target.set(0,1.4,0),this.controls.enabled=!0,this.controls.autoRotateSpeed=.55,this.flying=null,this.current=null,this.look=new N,this.view=null}setView(t,{instant:e=!1}={}){this.view=t;let n=new N(...t.pos),s=new N(...t.target);if(t.seat){let o=s.clone().sub(n).normalize();s=n.clone().add(o.multiplyScalar(2.6)),t={...t,target:s.toArray()}}this.controls.enabled=!!t.orbit||!!t.seat,this.controls.maxPolarAngle=t.seat?Math.PI*.96:Math.PI*.495,this.controls.autoRotate=!!t.autoRotate&&!t.seat,this.controls.minDistance=t.seat?.35:1.4;let r=n.distanceTo(s);this.controls.maxDistance=Vn(r*2.4,6,60),e?(this.camera.position.copy(n),this.camera.fov=t.fov||40,this.camera.updateProjectionMatrix(),this.controls.target.copy(s),this.controls.update(),this.flying=null):this.flying={t:0,dur:t.seat?1.15:.95,fromPos:this.camera.position.clone(),fromTarget:this.controls.target.clone(),fromFov:this.camera.fov,toPos:n,toTarget:s,toFov:t.fov||40,view:t}}orbit(t,e){if(!this.controls.enabled)return;let n=this.controls.target,s=this.camera.position.clone().sub(n),r=new Vi().setFromVector3(s);r.theta-=t;let o=.14;r.phi=Vn(r.phi-e,o,this.controls.maxPolarAngle-.02),s.setFromSpherical(r),this.camera.position.copy(n).add(s),this.camera.lookAt(n),this.controls.update()}zoomBy(t){let e=this.controls.target,n=this.camera.position.clone().sub(e),s=Vn(n.length()/t,this.controls.minDistance,this.controls.maxDistance);n.setLength(s),this.camera.position.copy(e).add(n),this.camera.lookAt(e),this.controls.update()}panBy(t,e){let n=this.controls.target,s=new N().setFromMatrixColumn(this.camera.matrix,0),r=new N().setFromMatrixColumn(this.camera.matrix,1),o=this.camera.position.distanceTo(n)*.12,a=s.multiplyScalar(t*o).add(r.multiplyScalar(e*o));n.add(a),this.camera.position.add(a),this.camera.lookAt(n),this.controls.update()}focusOn(t,{distance:e=null}={}){let n=this.camera.position.clone(),s=n.clone().sub(t).normalize(),r=Vn(e!=null?e:n.distanceTo(t)*.62,1.6,this.controls.maxDistance),o=t.clone().add(s.multiplyScalar(r));this.flying={t:0,dur:.55,fromPos:n,fromTarget:this.controls.target.clone(),fromFov:this.camera.fov,toPos:o,toTarget:t.clone(),toFov:this.camera.fov,view:this.view}}update(t){var e;if(this.flying){let n=this.flying;n.t+=t;let s=Vn(n.t/n.dur,0,1),r=s<.5?4*s*s*s:1-Math.pow(-2*s+2,3)/2;this.camera.position.lerpVectors(n.fromPos,n.toPos,r),this.controls.target.lerpVectors(n.fromTarget,n.toTarget,r),this.camera.fov=n.fromFov+(n.toFov-n.fromFov)*r,this.camera.updateProjectionMatrix(),this.controls.update(),s>=1&&(this.flying=null,this.current=n.view,(e=n.view)!=null&&e.orbit&&(this.controls.autoRotate=!!n.view.autoRotate));return}this.controls.enabled&&this.controls.update(t)}lookAt(t,e,n){this.controls.target.set(t,e,n),this.controls.update()}get isSeated(){var t;return!!((t=this.view)!=null&&t.seat)}};var Qx=1.18;function Jd(i,t,e={}){return i.paint(t,e)}function $d(i,t,e,n,s,r,o,a){let l=new en,c=new Ft(new sn(e,Math.max(.035,n*.055),6,24,Le),t);c.rotation.y=a>0?-Pt:Pt,l.add(c);let h=new Ft(new Me(e-.03,e-.03,n*.8,18,1,!0,0,Le),t);return h.rotation.z=Pt,h.material=t.clone?t.clone():t,h.material.side=Ne,l.add(h),l.position.set(s,r,o),l}function Kd(i,t){var At,Xt,Ct,Rt,Vt;let e=Ue(null,`truck:${i.id}`),n=[],s=[],r=[],o=[],a=i.wheel||{radius:.535,width:.42,rimColor:"#d9dde0"},l=a.radius,c=i.style||"euro",h=i.roof||"high",u=c==="bonnet",d=c==="futuristic",f=c==="lowentry",g=(At=i.cabHeight)!=null?At:3.55,_=(Xt=i.length)!=null?Xt:6.2,m=i.chrome!==!1,p=1.27,v=Jd(t,i.paint),S=Jd(t,i.paint,{roughness:.4,metalness:.35}),y=t.accent(i.accent||"#e8b45a");s.push(v,S,y);let E=-_/2,M=_/2,A=u?(Ct=i.bonnet)!=null?Ct:2.1:0,x=E+(u?.55+A:.28),w=Vn((h==="mega"?2.75:2.35)+(u?-.1:0),1.9,2.95),C=x+w,I=2.5,P=f?.85:Qx,O=Math.max(g,P+1.55),U=x+(f?.75:1.25),H=M-.55,K=H-(i.heavy?1.45:1.32),L=i.heavy?H+1.35:null,q=1.02,X=(K+H)/2-.62,z=[K,H,L].filter(it=>it!=null&&it<M+.1),G=Ue(e,"chassis"),pt=t.darkSteel;for(let it of[-.48,.48])B(G,.12,.28,M-E-.35,pt,it,q,(E+M)/2+.1);for(let it=E+1.1;it<M-.2;it+=.85)B(G,.95,.16,.1,pt,0,q-.02,it);B(G,1.05,.22,.16,t.darkSteel,0,q-.02,M-.15);let j=m?t.tank:t.plasticGray,ht=.31,dt=Vn(_*.32,.9,1.7),Mt=E+2.1+dt/2;for(let it of[-1,1]){let bt=Ht(G,ht,ht,dt,j,it*.92,.72,Mt,22);bt.rotation.x=Pt;let F=Ln(G,ht+.012,.025,t.darkSteel,it*.92,.72,Mt,20);F.rotation.y=Pt;let ft=Ht(G,.09,.09,.05,t.chromeDark,it*.92,.72,Mt+dt/2-.16,12);ft.rotation.x=Pt,r.push({pos:[it*1.22,.9,Mt],label:"\u0422\u043E\u043F\u043B\u0438\u0432\u043D\u044B\u0439 \u0431\u0430\u043A",side:`${it>0?"\u0441\u043F\u0440\u0430\u0432\u0430":"\u0441\u043B\u0435\u0432\u0430"}`})}W(G,.52,.36,.62,t.plasticGray,-.92,.72,Mt-dt/2-.55),Ht(G,.16,.16,.62,t.chromeDark,.9,.62,Mt-dt/2-.6,14).rotation.x=Pt;let Y=t.rubber;function nt(it,bt,F={}){var st,Tt;let ft=ji(t,{radius:l,width:(st=F.width)!=null?st:a.width,style:"truck",rimColor:(Tt=F.rimColor)!=null?Tt:a.rimColor,tread:Y});return ft.position.set(it,l,bt),F.flip&&(ft.rotation.y=Le),e.add(ft),n.push(ft),ft}let _t=.98;for(let it of[-1,1])nt(it*_t,U,{flip:it<0,width:a.width});for(let it of z)for(let bt of[-1,1])nt(bt*.74,it,{width:.32,flip:bt<0}),nt(bt*1.09,it,{width:.32,flip:bt<0});!i.thirdAxle&&z.length>2&&(z.length=2);for(let it of[-1,1]){let bt=$d(t,t.plasticGray,l+.05,.5,it*_t,l+.02,U,it);bt.visible=i.fenders!==!1,e.add(bt);for(let F of z){let ft=$d(t,t.plasticGray,l+.06,1.02,it*.92,l+.02,F,it);ft.visible=i.fenders!==!1,e.add(ft)}for(let F of[U-.42,z[0]-.55])B(e,.42,.5,.04,t.rubberTrim,it*(F<0?_t:.92),l-.22,F)}let vt=Ue(e,"cab"),xt=P+.72,Dt=Math.min(O-.4,P+1.58),te=C,ot=d?.42:f?.1:.22;for(let it of[-1,1]){let bt=it*(p-.06);W(vt,.12,xt-P,w-.1,v,bt,(P+xt)/2,(x+te)/2,.045),W(vt,.12,Math.max(.2,O-Dt-.02),w-.1,v,bt,(Dt+O)/2+.01,(x+te)/2,.045),W(vt,.13,Dt-xt,.17,v,bt,(Dt+xt)/2,x+.12,.04),W(vt,.13,Dt-xt,.13,t.plastic,bt,(Dt+xt)/2,te-.12,.04),B(vt,.02,.075,w*.82,y,it*(p+.012),xt+.16,(x+te)/2+.02);let F=W(vt,.05,.06,.22,m?t.chrome:t.plasticGray,it*(p+.02),xt-.2,x+1.05,.02);r.push({pos:[it*(p+.05),xt-.2,x+1.05],label:"\u0414\u0432\u0435\u0440\u044C \u043A\u0430\u0431\u0438\u043D\u044B",side:it>0?"\u0441\u043F\u0440\u0430\u0432\u0430":"\u0441\u043B\u0435\u0432\u0430"})}W(vt,I-.12,O-P-.04,.1,v,0,(P+O)/2,te-.02,.04),(h==="high"||h==="mega")&&B(vt,.92,.5,.03,t.glassDark,0,O-.62,te-.08);for(let it of[-.9,-.3,.3,.9])B(vt,.04,O-P-.28,.05,t.plastic,it,(P+O)/2+.04,te-.09);W(vt,I-.1,.14,w,t.plastic,0,P-.07,(x+te)/2,.04),W(vt,I-.04,.16,w-.02,v,0,O+.02,(x+te)/2,.06),W(vt,I-.3,.12,.5,v,0,O-.12,x+.16,.06);let ut=xt-.12,mt=Dt+.06,gt=x+.06;W(vt,I-.14,ut-P,.14,v,0,(P+ut)/2,gt,.05),W(vt,I-.14,Math.max(.12,O-mt),.2,v,0,(mt+O)/2,gt+.05,.06);let Et=Math.max(.5,mt-ut),Kt=vn(vt,I-.26,Et,t.glass,0,(ut+mt)/2,gt+.03);Kt.rotation.x=-.05;for(let it of[-1,1]){let bt=vn(vt,w-.42,Dt-xt,t.glass,it*(p-.005),(xt+Dt)/2,(x+te)/2-.02);bt.rotation.y=it>0?-Pt:Pt}for(let it of[-1,1]){if(d){let st=W(vt,.12,.1,.22,t.plastic,it*1.34,Dt-.02,x+.24,.03),Tt=B(vt,.02,.07,.12,t.glassDark,it*1.41,Dt-.02,x+.24),It=B(vt,.12,.06,.06,t.plastic,it*1.29,Dt-.02,x+.2);r.push({pos:[it*1.42,Dt,x+.24],label:"\u041A\u0430\u043C\u0435\u0440\u0430 \u043E\u0431\u0437\u043E\u0440\u0430"});continue}let bt=B(vt,.34,.06,.06,m?t.chrome:t.plastic,it*(p+.16),Dt+.12,x+.16),F=B(vt,.28,.05,.05,m?t.chrome:t.plastic,it*(p+.14),xt+.2,x+.16),ft=W(vt,.13,.72,.24,t.plastic,it*(p+.36),Dt-.18,x+.16,.04);B(vt,.02,.56,.18,t.mirror,it*(p+.43),Dt-.18,x+.16),B(vt,.015,.16,.16,t.glassDark,it*(p+.425),xt+.06,x+.16),r.push({pos:[it*(p+.45),Dt,x+.16],label:"\u0417\u0435\u0440\u043A\u0430\u043B\u043E",side:it>0?"\u0441\u043F\u0440\u0430\u0432\u0430":"\u0441\u043B\u0435\u0432\u0430"})}let lt=Ue(e,"front");if(u){(Vt=(Rt=W(lt,2.2,.95,A,v,0,P+.48,E+.28+A/2,.16).geometry).dispose)==null||Vt.call(Rt),W(lt,2.14,.55,.9,v,0,P+.92,x-.42,.18),B(lt,1.9,.72,.1,m?t.chrome:t.plasticGray,0,P+.34,E+.02);for(let bt=-3;bt<=3;bt++)B(lt,1.8,.06,.05,t.chromeDark,0,P+.34+bt*.11,E-.03);for(let bt of[-1,1])W(lt,.34,.3,.1,t.chrome,bt*.86,P+.34,E-.02,.04);for(let bt of[-1,1]){let F=Ht(lt,.075,.085,2.3,t.chrome,bt*1.16,P+1.35,x-.55,14),ft=Ht(lt,.09,.075,.18,t.chromeDark,bt*1.16,P+2.52,x-.55,14),st=B(lt,.03,1.5,.28,t.chromeDark,bt*1.16,P+.75,x-.55)}}else if(W(lt,2.34,d?.9:.62,.16,d?t.plasticGray:t.plastic,0,P+.42,x-.02,.05),d){let it=B(lt,2.3,.1,.03,t.headlight,0,P+.78,x-.11),bt=B(lt,2.32,.22,.02,y,0,P+.78,x-.12);bt.material=y;let F=Ht(lt,.16,.16,.04,t.chrome,0,P+.42,x-.12,20);F.rotation.x=Pt}else{let it=m?t.chrome:t.plasticGray;B(lt,1.5,.4,.06,t.plastic,0,P+.42,x-.1);for(let ft=-2;ft<=2;ft++)B(lt,1.44,.045,.03,it,0,P+.42+ft*.085,x-.14);let bt=Ki(i.brand,{width:512,height:160,bg:"#14181c",fg:"#f4efe3",accent:i.accent||"#e8b45a",font:"bold 72px Arial, sans-serif",border:!1});if(bt){let ft=vn(lt,.66,.2,new xe({map:bt,roughness:.4,metalness:.2}),0,P+.42,x-.155)}let F=Ht(lt,.19,.19,.03,t.chrome,0,P+.42,x-.15,24);F.rotation.x=Pt}let Bt=.62,Wt=E+.06;W(lt,2.5,.42,.34,i.chromeBumper||m?t.chrome:t.plasticGray,0,Bt,Wt,.05),!m&&!i.chromeBumper&&B(lt,2.3,.12,.02,t.plastic,0,Bt-.12,Wt-.18);for(let it of[-1,1]){let bt=Ht(lt,.075,.075,.04,t.headlight,it*.85,Bt-.1,Wt-.18,14);bt.rotation.x=Pt}for(let it of[-1,1]){let bt=W(lt,.5,.24,.08,t.headlight,it*.72,P+.02,x-.12,.03),F=B(lt,.42,.06,.03,t.chrome,it*.72,P-.02,x-.17),ft=B(lt,.34,.06,.03,t.amber,it*.72,P+.13,x-.17);o.push(ft)}for(let it of[-1,1]){let bt=x+w*.55;B(e,.42,.05,.5,t.darkSteel,it*(p-.16),.56,bt),B(e,.42,.05,.5,t.darkSteel,it*(p-.16),.9,bt-.02),B(e,.4,.5,.03,t.plastic,it*(p-.16),.75,bt+.26)}let D=Ue(e,"roof"),ee=h==="mega"?.42:h==="high"?.24:.08;if(ee>0){W(D,I-.18,ee+.1,w-.34,v,0,O+ee/2+.06,(x+te)/2-.08,.09);let it=W(D,I-.24,.36,.5,S,0,O+ee+.02,x+.26,.08);it.rotation.x=-.35}if(i.deflectors)for(let it of[-1,1]){let bt=W(D,.1,.5,1.15,S,it*(p-.02),O+.24,te-.5,.05);bt.rotation.x=-.22,bt.rotation.z=it*.04}ee>.1&&(W(D,.62,.06,.62,t.plasticGray,.52,O+ee+.06,te-.75,.03),B(D,.02,.34,.02,t.darkSteel,-.95,O+ee+.2,te-.55),r.push({pos:[.52,O+ee+.1,te-.75],label:"\u041B\u044E\u043A \u043A\u0430\u0431\u0438\u043D\u044B"}));for(let it of[-.95,-.5,.5,.95]){let bt=bs(D,.035,t.amber,it,O+ee+.12,x+.48,8)}if(!d){let it=W(D,I-.3,.1,.22,S,0,O-.12,x-.06,.03);it.rotation.x=.2}if(i.sideSkirts)for(let it of[-1,1])W(e,.08,.72,w+(M-C)*.62,S,it*1.22,.72,C+(M-C)*.3,.03);let ie=Ue(e,"fifth"),R=1.24;W(ie,1.5,.1,1.05,t.darkSteel,0,R,X,.03);let b=W(ie,.42,.12,.42,t.steel,0,R+.04,X+.08,.02),V=Ht(ie,.035,.035,.8,t.chromeDark,-.72,R-.1,X-.3,8);V.rotation.z=Pt,r.push({pos:[0,R+.15,X],label:"\u0421\u0435\u0434\u043B\u043E (\u043F\u044F\u0442\u043E\u0435 \u043A\u043E\u043B\u0435\u0441\u043E)"});for(let it of[-1,1])B(e,.3,.16,.06,t.taillight,it*.78,q+.05,M-.06),B(e,.3,.08,.06,t.amber,it*.78,q+.2,M-.06),B(e,.06,.22,.06,t.reverseLight,it*.6,q+.05,M-.06);let Z=_r("\u0410 001 \u0422\u0421");Z&&vn(e,.5,.13,new xe({map:Z,roughness:.6}),0,.95,M-.08);let et=ty({M:t,unit:i,cabFront:x,cabRear:te,cabW:I,floorY:P,roofY:O,winBottom:xt,winTop:Dt,style:c,roofType:h,paint:v,accent:y,anchors:r,isBonnet:u,isLowEntry:f});vt.add(et.group);let yt=P+1.02,tt=[{id:"driver",label:"\u041C\u0435\u0441\u0442\u043E \u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044F",group:"interior",pos:[-.46+.06,P+1.3,x+1.02],target:[-.24,P+.68,x-9],fov:72,orbit:!1,seat:!0},{id:"passenger",label:"\u041C\u0435\u0441\u0442\u043E \u043F\u0430\u0441\u0441\u0430\u0436\u0438\u0440\u0430",group:"interior",pos:[.6,P+1.3,x+1.06],target:[-.45,P+.8,x-5],fov:70,orbit:!1,seat:!0}];return(h==="high"||h==="mega"||h==="sleeper")&&tt.push({id:"bunk",label:"\u0421\u043F\u0430\u043B\u044C\u043D\u043E\u0435 \u043C\u0435\u0441\u0442\u043E",group:"interior",pos:[.3,P+1.66,C-.5],target:[-.34,P+1.02,x+1.1],fov:74,orbit:!0,seat:!0}),tt.push({id:"exterior",label:"\u0421\u043D\u0430\u0440\u0443\u0436\u0438",group:"exterior",pos:[7.6,3.1,-8.2],target:[0,1.45,.4],fov:38,orbit:!0,autoRotate:!0}),tt.push({id:"side",label:"\u0411\u043E\u0440\u0442",group:"exterior",pos:[10.5,1.9,.6],target:[0,1.5,.3],fov:34,orbit:!0}),tt.push({id:"rear",label:"\u0421\u0437\u0430\u0434\u0438",group:"exterior",pos:[-5.6,3.2,8.4],target:[0,1.5,.6],fov:40,orbit:!0}),{root:e,wheels:n,paintMats:s,views:tt,anchors:r,layout:{frontZ:E,rearEnd:M,cabFront:x,cabRear:te,roofY:O,floorY:P,fifthWheelZ:X,plateY:R,rearAxle1:K,rearAxle2:H,wheelRadius:l,cabWidth:I},kind:"truck"}}function ty(i){let{M:t,cabFront:e,cabRear:n,cabW:s,floorY:r,roofY:o,winBottom:a,winTop:l,roofType:c,paint:h,accent:u,anchors:d,style:f,isLowEntry:g}=i,_=Ue(null,"interior"),m=(e+n)/2,p=t.interiorDark,v=t.interiorMid,S=i.unit.luxury?t.leatherBeige:t.leather,y=s-.2,E=W(_,y,.03,n-e-.16,t.rubberTrim,0,r+.02,m,.02);W(_,y-.02,.05,n-e-.2,t.interiorMid,0,o-.09,m,.02);for(let z of[-1,1])W(_,.055,.7,n-e-.5,p,z*(s/2-.16),r+.42,m+.02,.02),W(_,.14,.1,.62,S,z*(s/2-.19),r+.62,e+1.02,.03),W(_,.03,.04,.16,t.chromeDark,z*(s/2-.23),r+.72,e+1,.01);W(_,y,o-r-.2,.06,v,0,(r+o)/2,n-.16,.03);let M=e+.28,A=r+.82,x=W(_,y-.02,.46,.62,p,0,r+.55,M,.08);x.rotation.x=.08,W(_,y-.06,.14,.78,v,0,A+.02,M+.12,.06);let w=M+.04,C=W(_,.7,.28,.24,p,-.46,A+.2,w,.05);C.rotation.x=-.22,W(_,.44,.5,.28,v,.08,r+.62,M+.34,.04);let I=W(_,.34,.24,.03,t.dashScreen,.08,r+.92,M+.2,.02);I.rotation.x=-.12;for(let z=-1;z<=1;z++)B(_,.035,.02,.02,t.chromeDark,.08+z*.09,r+.78,M+.34);for(let z of[-1,1]){let G=W(_,.16,.09,.03,t.plastic,z*.78,A+.06,M-.02,.02);for(let pt=-1;pt<=1;pt++)B(_,.012,.07,.01,t.chromeDark,z*.78+pt*.045,A+.06,M-.04)}for(let[z,G]of[[-.64,.1],[-.34,.1]]){let pt=Ht(_,G,G,.02,t.plastic,z,A+.2,w+.11,24);pt.rotation.x=Pt;let j=Ln(_,G,.008,t.chromeDark,z,A+.2,w+.12,20);j.rotation.x=0;let ht=B(_,.012,G*1.1,.006,t.taillight,z,A+.2+G*.25,w+.13);ht.rotation.z=.6}let P=Ue(_,"steering");P.position.set(-.48,A+.19,M+.26),P.rotation.x=-.36;let O=Ln(P,.215,.023,t.leather,0,0,0,40);O.rotation.x=0;let U=Ht(P,.065,.07,.07,t.plastic,0,0,.02,20);U.rotation.x=Pt;for(let z=0;z<3;z++){let G=kd(90)+z*(In/3),pt=B(P,.04,.2,.025,t.plasticGray,Math.cos(G)*.1,Math.sin(G)*.1,0);pt.rotation.z=G-Pt}let H=Ht(P,.032,.032,.012,u,0,0,.06,16);H.rotation.x=Pt;let K=Ht(_,.045,.06,.5,t.plastic,-.48,A+.06,M+.06,12);if(K.rotation.x=.62,f==="euro"||f==="futuristic"){let z=Ht(_,.02,.025,.3,t.chromeDark,.42,A+.02,M+.12,8);z.rotation.x=-.5,bs(_,.045,t.plastic,.42,A+.16,M+.24,10)}d.push({pos:[-.48,A+.16,M-.4],label:"\u0420\u0443\u043B\u044C \u0438 \u043F\u0440\u0438\u0431\u043E\u0440\u044B"}),d.push({pos:[.08,r+.95,M+.15],label:"\u041C\u0443\u043B\u044C\u0442\u0438\u043C\u0435\u0434\u0438\u0430"});function L(z,G,{recline:pt=.12,luxury:j=!1}={}){let ht=Ue(_),dt=W(ht,.56,.16,.56,j?S:t.fabric,0,r+.28,0,.05);for(let vt of[-1,1])W(ht,.09,.16,.54,j?S:t.fabric,vt*.28,r+.33,0,.04);let Mt=W(ht,.54,.72,.16,j?S:t.fabric,0,r+.66,.24,.06);Mt.rotation.x=pt;for(let vt of[-1,1]){let xt=W(ht,.08,.62,.14,j?S:t.fabric,vt*.26,r+.68,.24,.05);xt.rotation.x=pt}let Y=W(ht,.34,.2,.14,j?S:t.fabric,0,r+1.14,.32,.06),nt=Ht(ht,.11,.13,.16,t.rubberTrim,0,r+.18,.02,14),_t=B(ht,.07,.72,.02,t.plasticGray,-.22,r+.72,.36);_t.rotation.x=pt,_t.rotation.z=-.12;for(let vt of[-1,1])B(ht,.02,.16,.02,t.chromeDark,vt*.11,r+1.02,.33);return ht.position.set(z,0,G),ht}let q=L(-.46,e+1.02,{recline:.14,luxury:!!i.unit.luxury});if(d.push({pos:[-.46,r+.62,e+1.02],label:"\u0421\u0438\u0434\u0435\u043D\u044C\u0435 \u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044F"}),L(.56,e+1,{recline:.1,luxury:!!i.unit.luxury}),c==="high"||c==="mega"||c==="sleeper"){let G=n-.46-.1,pt=r+.96;W(_,y-.12,.1,.92,t.interiorMid,0,pt,G,.02),W(_,y-.24,.16,.92-.08,t.leatherBeige,0,pt+.12,G,.05),W(_,.46,.11,.3,t.plasticLight,-.28,pt+.24,n-.26,.04),W(_,y-.36,.07,.34,t.accent("#5a6b57"),.02,pt+.23,G+.2,.03);for(let j of[-1,1])W(_,.02,.52,.92-.1,t.fabric,j*(y/2-.06),pt+.34,G,.01);if(d.push({pos:[0,pt+.3,n-.35],label:"\u0421\u043F\u0430\u043B\u044C\u043D\u043E\u0435 \u043C\u0435\u0441\u0442\u043E"}),c==="mega"){W(_,y-.2,.09,1.3,t.interiorMid,0,r+1.86,n-.72,.02),W(_,y-.3,.12,1.2,t.leatherBeige,0,r+1.95,n-.72,.03);for(let j of[-1,1])B(_,.03,.62,.03,t.steel,j*.34,r+1.4,n-.16);for(let j=0;j<3;j++)B(_,.72,.03,.03,t.steel,0,r+1.2+j*.24,n-.16)}}if(c==="mega"||i.unit.luxury){let z=W(_,.5,.8,.55,t.interiorMid,-1,r+.55,n-.55,.04),G=W(_,.42,.5,.5,t.plasticGray,1,r+.42,n-.5,.04);B(_,1.6,.05,.5,t.wood||t.plasticLight,0,r+.95,n-.5),d.push({pos:[1,r+.6,n-.5],label:"\u0425\u043E\u043B\u043E\u0434\u0438\u043B\u044C\u043D\u0438\u043A"})}W(_,.3,.06,.06,t.plasticLight,.6,o-.18,m,.02);let X=Ht(_,.08,.08,.04,t.headlight,0,o-.12,m+.4,14);X.rotation.x=Pt;for(let z of[-1,1]){let G=W(_,.62,.16,.03,t.plasticLight,z*.5,l+.05,e+.22,.02);G.rotation.x=-.25}for(let[z,G]of[[-.64,.1],[-.44,.16],[-.22,.1]]){let pt=B(_,G,.03,.16,t.steel,z,r+.16,e+.55);pt.rotation.x=.5}return W(_,.6,.03,.3,t.plastic,.55,A+.03,M-.12,.01),W(_,.4,.28,.4,t.interiorMid,.5,r+.3,e+1.7,.03),{group:_}}function ey(i){var C,I,P;let t=(C=i.length)!=null?C:4.7,e=(I=i.width)!=null?I:1.84,n=(P=i.height)!=null?P:1.44,s=i.style||"sedan",r=s==="coupe"||s==="sport",o=s==="van",a=s==="pickup",l=s==="suv"||a||s==="crossover",c=s==="micro",h=s==="wagon",u=-t/2,d=t/2,f=.26,g=n*(r?.78:o?.62:.66),_=n*(l?.58:o?.46:r?.66:.56),m=n*(l?.5:r?.58:.46),p=n*(l?.7:o?.62:r?.72:.62),v=u+t*(o?.2:l?.24:.27),S=u+t*(o?.3:l?.34:r?.3:.31),y=S+(n-_)*(o?.7:l?.85:1.05),E=d-t*(h?.05:o?.03:a?.36:l?.13:r?.4:.31),M=E+(n-p)*(o?.35:l?.5:r?1.6:.95),A=Math.min(M,d-.1),x=a?E+.16:null,w=a?p-.06:null;return{L:t,W:e,H:n,style:s,sport:r,wagon:h,van:o,pickup:a,suv:l,micro:c,front:u,rear:d,ground:f,belt:g,hoodY:_,deckY:p,noseY:m,hoodZ:v,wsBase:S,wsTopZ:y,roofRearZ:E,rearBaseZ:A,bedFrom:x,bedY:w}}function ny(i){let{front:t,rear:e,noseY:n,hoodY:s,hoodZ:r,wsBase:o,wsTopZ:a,roofRearZ:l,rearBaseZ:c,deckY:h,H:u}=i,d=[],f=(g,_,m,p=0)=>{for(let v=0;v<=m;v++){let S=v/m,y=$i(g[0],_[0],S),E=$i(g[1],_[1],S)+Math.sin(S*Le)*p;d.push([y,E])}};return d.push([t,n]),f([t,n],[t+.05,n+.03],1),f([t+.05,n+.03],[r,s],4,.035),f([r,s],[o,s+.035],1),f([o,s+.035],[a,u-.015],1),f([a,u-.015],[l,u-.02],4,.015),f([l,u-.02],[c,h],3),f([c,h],[e,h-.02],2),d}function iy(i,t,e){for(let n=0;n<i.length-1;n++){let[s,r]=i[n],[o,a]=i[n+1];if(t>=s&&t<=o||t>=o&&t<=s){let l=Math.abs(o-s)<1e-6?0:(t-s)/(o-s);return $i(r,a,Vn(l,0,1))}}return e}function sy(i,{root:t,paint:e,paintDark:n,black:s,belt:r,halfW:o,M:a}){let{roofRearZ:l,rear:c,bedY:h,L:u,W:d}=i,f=l+.12,g=c-.06,_=g-f,m=(f+g)/2,p=.42,v=h+p/2;B(t,d-.16,.06,_,a.plasticGray,0,h-.01,m);for(let S of[-1,1])W(t,.09,p,_,e,S*(o-.06),v,m,.02),B(t,.11,.035,_,n,S*(o-.06),h+p-.02,m);W(t,d-.1,p,.09,e,0,v,g,.02),B(t,d-.08,.035,.11,n,0,h+p-.02,g),W(t,d-.12,p+.08,.08,e,0,h+p/2+.02,f-.02,.02);for(let S=0;S<6;S++)B(t,d-.22,.012,.035,a.steel,0,h+.025,f+.18+S*(_-.3)/5);for(let S of[-1,1])W(t,.26,.1,.04,a.taillight,S*(o-.28),h-.02,g+.04,.02)}function Eo(i,t,e={}){var gt,Et,Kt;let n=e.simple===!0,s=ey(i),{L:r,W:o,H:a,front:l,rear:c,belt:h,ground:u}=s,d=ny(s),f=(gt=i.wheelRadius)!=null?gt:.33,g=(Et=i.wheelWidth)!=null?Et:.23,_=(Kt=i.wheelbase)!=null?Kt:r*.58,m=o/2,p=i.paint||"#2f5d8a",v=i.accent||"#d8d5c8",S=Ue(null,`car:${i.id}`),y=[],E=[],M=[],A=t.paint(p,{metalness:.5,roughness:.26}),x=new jt(p).multiplyScalar(.78),w=t.paint(x,{metalness:.4,roughness:.42}),C=t.accent(v),I=t.chrome,P=t.plastic;M.push(A,w,C);let O=.09,U=m-O/2,H=[-_/2,_/2],K=u+.08,L=h,q=s.wsBase+Math.max(.16,r*.035),X=s.pickup?s.roofRearZ-.04:s.rearBaseZ-Math.max(.14,r*.03),z=$i(q,X,s.van?.34:.47),G=s.van||s.micro?.22:.09,pt=lt=>Math.max(L+.07,iy(d,lt,a)-.075),j=[{z0:q,z1:z-G/2},{z0:z+G/2,z1:X}].filter(lt=>lt.z1-lt.z0>.24),ht=new Qs,dt=s.pickup?[...d.filter(([lt])=>lt<=s.roofRearZ+.001),[s.roofRearZ+.1,s.bedY+.02],[c-.06,s.bedY+.02]]:d,Mt=[[l,u],...dt,[c,u]],Y=f+.05,nt=f+.02;ht.moveTo(Mt[0][0],Mt[0][1]);for(let lt=1;lt<Mt.length-1;lt++)ht.lineTo(Mt[lt][0],Mt[lt][1]);ht.lineTo(Mt[Mt.length-2][0],Mt[Mt.length-2][1]),ht.lineTo(c,u);for(let lt of[...H].sort((Bt,Wt)=>Wt-Bt)){ht.lineTo(lt+Y,u),ht.lineTo(lt+Y,nt);let Bt=16;for(let Wt=1;Wt<=Bt;Wt++){let D=Wt/Bt*Le;ht.lineTo(lt+Math.cos(D)*Y,nt+Math.sin(D)*Y)}ht.lineTo(lt-Y,nt),ht.lineTo(lt-Y,u)}ht.lineTo(l,u),ht.closePath();for(let lt of j){let Bt=new us,Wt=8,D=[[lt.z0,L+.02]];for(let ee=0;ee<=Wt;ee++){let ie=$i(lt.z0,lt.z1,ee/Wt);D.push([ie,pt(ie)])}D.push([lt.z1,L+.02]),Bt.moveTo(D[0][0],D[0][1]);for(let ee=1;ee<D.length;ee++)Bt.lineTo(D[ee][0],D[ee][1]);Bt.closePath(),ht.holes.push(Bt)}if(n){for(let lt of H)for(let Bt of[-1,1]){let Wt=ji(t,{radius:f,width:g,style:"car",rimColor:"#b9bfc4"});Wt.position.set(Bt*(m-g*.55),f,lt),Bt<0&&(Wt.rotation.y=Le),S.add(Wt)}B(S,o*.9,.1,r*.9,P,0,.2,0)}else{let D=function(Jt,se,Te=0){let ze=[];for(let[He,Ke]of Jt){let ts=Vn((Ke-h)/Math.max(.2,a-h),0,1),fi=(m-.015+Te)*(1-.055*ts*ts);ze.push(-fi,Ke,He,fi,Ke,He)}let rn=[];for(let He=0;He<Jt.length-1;He++){let Ke=He*2;rn.push(Ke,Ke+1,Ke+2,Ke+1,Ke+3,Ke+2)}let fn=rn,$e=new De;$e.setAttribute("position",new ue(ze,3)),$e.setIndex(fn),$e.computeVertexNormals();let pe=se.clone?se.clone():se;pe.side=Ne,S.add(new Ft($e,pe))},lt=new Qr(ht,{depth:O,bevelEnabled:!0,bevelThickness:.01,bevelSize:.01,bevelSegments:1,curveSegments:10});lt.rotateY(-Pt),lt.computeBoundingBox();let Bt=lt.boundingBox,Wt=m-Bt.max.x;lt.translate(Wt,0,0);for(let Jt of[-1,1]){let se=new Ft(lt,A);Jt<0&&(se.scale.x=-1),se.castShadow=!0,S.add(se)}let ee=(Jt,se)=>Math.abs(Jt-se)<1e-4,ie=Jt=>d.findIndex(([se])=>ee(se,Jt)),R=ie(s.wsBase),b=ie(s.wsTopZ),V=ie(s.roofRearZ),Z=ie(s.rearBaseZ),et=d.slice(0,R+1),yt=d.slice(b,V+1),wt=d.slice(Z);s.pickup?(D([...yt,[s.roofRearZ+.16,s.bedY+.02]],A),D(et,A),sy(s,{root:S,paint:A,paintDark:w,black:P,belt:h,halfW:m,M:t})):(D(et,A),D(yt,A),D(wt,A));let tt=new Mi({color:10470612,metalness:.08,roughness:.06,transparent:!0,opacity:.3,envMapIntensity:1.8,side:Ne,depthWrite:!1}),rt=(Jt,se,Te,ze,rn,fn)=>{let $e=Te-Jt,pe=ze-se,He=Math.hypot($e,pe)||1,Ke=0,ts=$e/He,fi=-pe/He,Jl=Ke*fn,pi=ts*fn,es=fi*fn,ns=new De,$l=[-m*rn,se+pi,Jt+es,m*rn,se+pi,Jt+es,-m*rn,ze+pi,Te+es,m*rn,ze+pi,Te+es];ns.setAttribute("position",new ue($l,3)),ns.setIndex([0,1,2,1,3,2]),ns.computeVertexNormals();let Do=new Ft(ns,tt);Do.renderOrder=2,S.add(Do)};rt(s.wsBase-.06,s.hoodY+.02,s.wsTopZ-.03,a-.04,.9,.09),s.pickup?rt(s.roofRearZ+.02,a-.05,s.roofRearZ+.12,s.deckY+.06,.86,.09):rt(s.roofRearZ+.04,a-.05,s.rearBaseZ+.02,s.deckY+.02,.88,.09);for(let[Jt,se,Te,ze,rn]of[[s.wsBase-.06,s.hoodY+.02,s.wsTopZ-.03,a-.04,.9],[s.roofRearZ+.04,a-.05,s.rearBaseZ+.02,s.deckY+.02,.88]])for(let fn of[-1,1]){let $e=Te-Jt,pe=ze-se,He=Math.hypot($e,pe)||1,Ke=B(S,.035,.035,He,P,fn*m*rn,(se+ze)/2,(Jt+Te)/2);Ke.rotation.x=-Math.atan2(pe,Math.abs($e)),Ke.position.y+=.01}let At=new Ft(new Bn(o-.06,r-.16),t.plastic);At.rotation.x=-Pt,At.position.y=u-.004,S.add(At);for(let Jt of H)for(let se of[-1,1]){let Te=ji(t,{radius:f,width:g,style:"car",rimColor:s.sport?"#2b2f33":"#c3c9cd",tread:t.rubber,spokes:s.sport?5:6});Te.position.set(se*(m-g*.52),f,Jt),se<0&&(Te.rotation.y=Le),S.add(Te),y.push(Te);let ze=new Ft(new sn(f+.06,.018,5,20,Le),P);ze.position.set(se*(m+.012),f+.02,Jt);let rn=new Ft(new Me(f+.055,f+.055,.2,16,1,!0,0,Le),t.plastic);rn.rotation.z=Pt,rn.position.set(se*(m-.16),f+.02,Jt),S.add(rn),ze.rotation.y=se>0?-Pt:Pt,S.add(ze)}let Xt=H[0]+f+.1,Ct=H[1]-f-.1,Rt=Math.max(.34,Ct-Xt),Vt=(Xt+Ct)/2;for(let Jt of[-1,1])W(S,.055,.085,Rt,P,Jt*(m+.001),u+.1,Vt,.02),B(S,.02,.026,Rt,w,Jt*(m+.012),h-.26,Vt),B(S,.014,.016,Rt*.96,I,Jt*(m+.012),h-.2,Vt);for(let Jt of j)for(let se of[-1,1]){let Te=[],ze=[];for(let pe=0;pe<=8;pe++){let He=$i(Jt.z0,Jt.z1,pe/8);Te.push(se*(U-.035),L+.015,He)}for(let pe=0;pe<=8;pe++){let He=$i(Jt.z0,Jt.z1,pe/8);Te.push(se*(U-.035),pt(He)-.012,He)}let fn=9;for(let pe=0;pe<fn-1;pe++)ze.push(pe,pe+1,fn+pe,pe+1,fn+pe+1,fn+pe);let $e=new De;$e.setAttribute("position",new ue(Te,3)),$e.setIndex(ze),$e.computeVertexNormals(),S.add(new Ft($e,t.glass))}for(let Jt of[-1,1]){let se=Math.max(.25,pt(z)-L);B(S,.02,se,G,P,Jt*(m+.004),L+se/2,z)}let it=l+.075,bt=s.noseY+.08,F=Math.max(.2,bt-u+.04);W(S,o-.02,F,.11,A,0,u+F/2-.02,it,.03);let ft=Math.max(.2,s.deckY-u+.02);W(S,o-.02,ft,.11,A,0,u+ft/2-.02,c-.055,.03);let st=l-.004,Tt=s.noseY-.11,It=Math.min(.3,Math.max(.12,Tt-u-.16)),ct=Tt-It,Zt=(Tt+ct)/2;W(S,o*.4,It+.035,.05,P,0,Zt,st-.03,.018);let Gt=4;for(let Jt=0;Jt<Gt;Jt++){let se=Gt===1?.5:Jt/(Gt-1);B(S,o*.36,.011,.012,I,0,ct+.025+se*(It-.05),st-.058)}let ve=Ht(S,Math.min(.052,It*.3),Math.min(.052,It*.3),.014,I,0,Zt,st-.06,20);ve.rotation.x=Pt;for(let Jt of[-1,1]){W(S,o*.31,.095,.055,t.headlight,Jt*m*.63,s.noseY-.055,st-.018,.018),B(S,.25,.012,.016,I,Jt*m*.63,s.noseY-.108,st-.042),B(S,.1,.034,.042,t.amber,Jt*m*.85,s.noseY-.105,st-.02);let se=Ht(S,.038,.038,.022,t.headlight,Jt*m*.6,u+.14,st-.03,10);se.rotation.x=Pt}W(S,o*.99,.2,.24,w,0,u+.11,l-.1,.05),W(S,o*.66,.075,.06,P,0,u+.03,l-.16,.02);for(let Jt of[-1,1])W(S,.38,.12,.08,t.taillight,Jt*m*.66,s.deckY-.08,c+.03,.02),B(S,.18,.045,.03,t.reverseLight,Jt*m*.56,s.deckY-.17,c+.045);let fe=_r("\u041E 777 \u0410\u0410");if(fe){let Jt=new xe({map:fe,roughness:.55}),se=Math.max(u+.4,s.deckY-.42);W(S,.45,.13,.03,P,0,se,c+.03,.012);let Te=vn(S,.42,.11,Jt,0,se,c+.047);Te.renderOrder=1}if(W(S,o*.98,.22,.18,w,0,u+.16,c+.08,.05),s.sport){for(let Jt of[-1,1]){let se=Ht(S,.048,.048,.1,I,Jt*.3,u+.08,c-.02,12);se.rotation.x=Pt}W(S,o*.76,.03,.24,A,0,a+.13,s.roofRearZ-.12,.02);for(let Jt of[-1,1])B(S,.035,.15,.1,P,Jt*o*.27,a+.06,s.roofRearZ-.12)}let dn=s.wsBase+.06;for(let Jt of[-1,1]){B(S,.14,.04,.05,P,Jt*(m+.02),h+.05,dn),W(S,.15,.085,.1,A,Jt*(m+.085),h+.07,dn,.03),B(S,.018,.055,.075,t.mirror,Jt*(m+.155),h+.07,dn);for(let se of[q+.5,z+.02]){let Te=Math.min(se,X-.18);W(S,.03,.038,.15,I,Jt*(m+.008),h-.12,Te,.02)}}let Sn=Ki(i.brand||"ASTER",{width:256,height:64,bg:"rgba(0,0,0,0)",fg:"#f4f0e4",accent:v,font:"bold 40px Arial, sans-serif",border:!1});if(Sn){let Jt=new xe({map:Sn,transparent:!0,roughness:.5});for(let se of[-1,1]){let Te=vn(S,.52,.13,Jt,se*(m+.03),u+.33,s.wsBase-.35);Te.rotation.y=se>0?-Pt:Pt}}E.push({pos:[0,a+.06,s.roofRearZ-.35],label:"\u041A\u0440\u044B\u0448\u0430"}),E.push({pos:[U,h+.12,z],label:"\u0414\u0432\u0435\u0440\u044C \u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044F"}),E.push({pos:[0,Zt,l],label:"\u0420\u0435\u0448\u0451\u0442\u043A\u0430 \u0438 \u0444\u0430\u0440\u044B"}),E.push({pos:[0,s.deckY-.15,c],label:"\u041A\u043E\u0440\u043C\u043E\u0432\u0430\u044F \u0447\u0430\u0441\u0442\u044C"});for(let Jt of H)E.push({pos:[m,f,Jt],label:"\u041A\u043E\u043B\u0435\u0441\u043E",side:"\u0441\u043F\u0440\u0430\u0432\u0430"});S.add(ry({M:t,S:s,nodes:d,pick:pt,unit:i,halfW:m,sideT:O,belt:h,H:a,R:f,anchors:E,floorY:K}))}let _t=o-.3,vt=h+.3,xt=K+.42,te=(s.sport?Math.min(a-.12,xt+.24):a-(s.micro?.24:.3))-(h+.3),ot=s.wsTopZ+(s.sport?.42:s.van?.62:.52),ut=[{id:"driver",label:"\u041C\u0435\u0441\u0442\u043E \u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044F",group:"interior",pos:[-_t*.22,h+vt*0+.3+te,ot],target:[-_t*.27,xt+.07,s.wsTopZ-.24],fov:s.sport?64:70,orbit:!1,seat:!0},{id:"salon",label:"\u0421\u0430\u043B\u043E\u043D",group:"interior",pos:[0,Math.min(h+.22,a-.22),s.wsTopZ+Math.max(.34,(s.roofRearZ-s.wsTopZ)*.4)],target:[0,K+.49,s.wsTopZ-.5],fov:72,orbit:!0,seat:!0},{id:"exterior",label:"\u0421\u043D\u0430\u0440\u0443\u0436\u0438",group:"exterior",pos:[6.4,2.55,-7],target:[0,.72,.05],fov:32,orbit:!0,autoRotate:!0},{id:"side",label:"\u0421\u0431\u043E\u043A\u0443",group:"exterior",pos:[8.8,1.3,.15],target:[0,.72,0],fov:27,orbit:!0},{id:"rear",label:"\u0421\u0437\u0430\u0434\u0438",group:"exterior",pos:[-4.7,2.1,6.8],target:[0,.75,.1],fov:33,orbit:!0}],mt={frontZ:l,rearEnd:c,roofY:a,floorY:K,wheelRadius:f,belt:h,length:r,width:o,wsBase:s.wsBase,wsTopZ:s.wsTopZ,roofRearZ:s.roofRearZ,rearBaseZ:s.rearBaseZ};return{root:S,wheels:y,paintMats:M,views:ut,anchors:E,layout:mt,kind:"car"}}function ry({M:i,S:t,nodes:e,pick:n,unit:s,halfW:r,sideT:o,belt:a,H:l,R:c,anchors:h,floorY:u}){let d=Ue(null,"interior"),f=t.W-.3,g=t.wsBase+.02,_=t.rearBaseZ-.06,m=(g+_)/2,p=t.wsTopZ+.5,v=p-.72,S=p+.34,y=i.interiorDark,E=i.interiorMid,M=t.sport,A=M?i.leather:i.fabric,x=M?i.accent(s.accent||"#d8d5c8"):i.fabric;W(d,f+.05,.03,_-g+.7,i.rubberTrim,0,u,m+.1,.02);for(let dt of[-.34,.34])W(d,.44,.012,.44,i.fabric,dt,u+.025,g+.55,.01);for(let dt of[-1,1]){let Mt=dt*(f/2-.02);W(d,.04,Math.max(.24,a-u-.08),_-g+.3,y,Mt,u+.28,m,.02),W(d,.1,.055,.4,x,Mt-dt*.03,a-.1,S-.16,.02),W(d,.1,.07,.32,E,Mt-dt*.04,u+.4,S+.06,.02),B(d,.025,.028,.1,i.chromeDark,Mt-dt*.04,a-.18,S-.3);let Y=Ht(d,.05,.05,.018,i.plastic,Mt-dt*.04,u+.26,S-.52,10);Y.rotation.z=Pt}W(d,f-.08,.025,t.roofRearZ-t.wsTopZ+.1,i.interiorMid,0,l-.13,(t.wsTopZ+t.roofRearZ)/2,.02),W(d,.23,.2,_-g-.2,E,0,u+.11,m-.1,.04),s.seats>2&&W(d,f-.1,Math.max(.2,a-u-.14),.05,y,0,u+.32,_+.12,.02);let w=u+.44;W(d,f+.06,w-u+.1,.05,y,0,(u+w)/2-.05,g-.05,.02);let C=u+.42,I=v+.205,P=u+.06,O=C+.08-P,U=P+O/2,H=W(d,f,O+.03,.4,y,0,U,v,.05);H.rotation.x=-.05;let K=v+.02;W(d,f-.02,.035,.42,i.rubberTrim,0,C+.06,K,.016);for(let[dt,Mt]of[-f*.32,-f*.22].entries()){let Y=C+.07+(dt===0?.006:-.006),nt=Ht(d,.075,.075,.026,i.plastic,Mt,Y,I+.02,20);nt.rotation.x=Pt;let _t=Ht(d,.062,.062,.006,i.plasticLight,Mt,Y,I+.034,18);_t.rotation.x=Pt,Ln(d,.068,.005,i.chromeDark,Mt,Y,I+.035,18);let vt=B(d,.007,.05,.004,i.taillight,Mt,Y+.018,I+.039);vt.rotation.z=dt===0?.7:-.55,vt.rotation.z=dt===0?.65:-.5}W(d,.38,.24,.02,i.plastic,.06,C-.06,I+.006,.02);let L=W(d,.34,.2,.024,i.dashScreen,.06,C-.06,I+.022,.02);L.rotation.x=-.08;for(let dt of[-1,1]){let Mt=dt===-1?f*.4:-f*.4;W(d,.13,.055,.03,i.plastic,Mt,C+.02,I+.006,.015);for(let Y=-1;Y<=1;Y++)B(d,.01,.042,.012,i.chromeDark,Mt+Y*.034,C+.02,I+.02)}W(d,.36,.12,.02,E,f*.26,C-.2,I+.004,.02),B(d,.13,.02,.02,i.chrome,f*.26,C-.16,I+.016);let q=Ue(d,"steering");q.position.set(-f*.27,C-.06,v+.38),q.rotation.x=-.42,Ln(q,.175,.02,i.leather,0,0,0,34);let X=Ht(q,.055,.06,.05,i.plastic,0,0,.02,16);X.rotation.x=Pt;for(let dt=0;dt<3;dt++){let Mt=Pt+dt*(In/3),Y=B(q,.03,.15,.016,i.plasticGray,Math.cos(Mt)*.08,Math.sin(Mt)*.08,.012);Y.rotation.z=Mt-Pt}let z=Ht(q,.025,.025,.01,i.accent(s.accent||"#d8d5c8"),0,0,.045,12);z.rotation.x=Pt;let G=Ht(d,.032,.048,.46,i.plastic,-f*.27,C-.06,v+.2,10);G.rotation.x=.6;let pt=Ht(d,.016,.02,.17,i.chromeDark,.12,u+.22,v+.22,8);pt.rotation.x=-.28,bs(d,.032,i.plastic,.12,u+.3,v+.25,8),W(d,.21,.1,.46,E,0,u+.24,(v+_)/2+.1,.03);for(let dt of[-.045,.045])Ht(d,.028,.028,.02,i.rubberTrim,dt,u+.28,(v+_)/2-.04,10);for(let dt of[-f*.34,-f*.22]){let Mt=B(d,.055,.018,.09,i.steel,dt,u+.13,v-.24);Mt.rotation.x=.6}W(d,.19,.045,.03,i.plastic,0,l-.1,t.roofRearZ-.34,.02),B(d,.16,.036,.007,i.mirror,0,l-.1,t.roofRearZ-.358);for(let dt of[-1,1])W(d,.3,.045,.018,i.plasticLight,dt*.24,l-.14,t.wsTopZ+.2,.015);let j=Ht(d,.036,.036,.016,i.headlight,0,l-.122,m,8);j.rotation.x=Pt,W(d,.09,.04,.04,i.plastic,0,l-.14,t.wsTopZ+.3,.02);function ht(dt,Mt,{rear:Y=!1,width:nt=.47}={}){let _t=Ue(d);W(_t,nt,.09,.44,A,0,u+.25,0,.03);for(let Dt of[-1,1])W(_t,.065,.12,.4,x,Dt*(nt/2-.008),u+.29,0,.03);let vt=Y?.3:.16,xt=W(_t,nt-.02,.56,.13,A,0,u+.56,.19,.05);xt.rotation.x=vt;for(let Dt of[-1,1]){let te=W(_t,.055,.48,.1,x,Dt*(nt/2-.008),u+.58,.2,.04);te.rotation.x=vt}if(W(_t,nt-.18,.13,.1,A,0,u+.89,.27,.03),!Y){let Dt=B(_t,.045,.54,.01,i.plasticGray,-nt/2+.05,u+.58,.26);Dt.rotation.x=vt}return _t.position.set(dt,0,Mt),_t}if(ht(-f*.27,S),!M&&t.style!=="micro"&&ht(f*.27,S),h.push({pos:[-f*.27,u+.6,S],label:"\u0421\u0438\u0434\u0435\u043D\u044C\u0435 \u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044F"}),h.push({pos:[0,u+.52,v],label:"\u0422\u043E\u0440\u043F\u0435\u0434\u043E \u0438 \u0440\u0443\u043B\u044C"}),s.seats>2){let dt=_-.5;if(s.seats>=5){W(d,f-.08,.11,.46,A,0,u+.27,dt,.04);for(let Y of[-1,1])W(d,.08,.14,.44,x,Y*(f/2-.07),u+.31,dt,.03);let Mt=W(d,f-.06,.5,.13,A,0,u+.58,dt+.25,.05);Mt.rotation.x=.26;for(let Y of[-1,0,1])W(d,.14,.1,.08,A,Y*(f*.26),u+.85,dt+.29,.02);h.push({pos:[0,u+.52,dt],label:"\u0417\u0430\u0434\u043D\u0438\u0439 \u0440\u044F\u0434"})}else ht(-f*.27,dt,{rear:!0}),ht(f*.27,dt,{rear:!0})}return d}var Dn=1.25;function de(i,t=.65,e=.2){return new xe({color:i,roughness:t,metalness:e})}var oy={TRAILGO:"#1b4f8a",COLDFLOW:"#0f6b70",STEELRIDE:"#cf5a13",AQUATEC:"#2f7d5a",BULKLINE:"#7d1a2e",FARMHAUL:"#5c6b3b",TIMBERLINE:"#5a3c25",PORTLINE:"#16233f",AUTOLINE:"#4b3c85",WATERTRAIL:"#3d8fc4",CLEARLINE:"#37a58c"};function Qn(i,t="#1b4f8a"){let e=String((i==null?void 0:i.brand)||"").split(/[\s-]/)[0].toUpperCase();return oy[e]||t}function ay(i,t,e,n,s,r,o){let a=new Me(s,s,r,16,1,!0,0,Le),l=o.clone();l.side=Ne;let c=new Ft(a,l);return c.rotation.z=Pt,c.position.set(t,e,n),i.add(c),c}function Hl(i,{W:t,z:e,bottom:n,height:s,leafMat:r,liveryMat:o,M:a,leaves:l=2}){let c=(t-.14)/l;for(let h=0;h<l;h++){let u=-t/2+.07+c*(h+.5);W(i,c-.02,s,.09,r,u,n+s/2,e-.05,.015);for(let d of[-.26,.26]){let f=Ht(i,.032,.032,s-.14,a.steel,u+d*(c/.9),n+s/2,e-.12,8)}for(let d=0;d<3;d++)B(i,.1,.13,.07,a.steel,u+(h===0?-c/2+.06:c/2-.06),n+.5+d*(s-1)/2,e-.1);B(i,.24,.05,.05,a.chrome,u+(h===0?c/2-.3:-c/2+.3),n+s*.45,e-.13)}B(i,.03,s-.05,.04,a.plastic,0,n+s/2,e-.1),B(i,t-.1,.1,.05,o,0,n+.06,e-.12),B(i,t-.1,.08,.05,o,0,n+s-.02,e-.12)}function zl(i,{length:t,height:e=.13,x:n=0,y:s=0,z:r=0,axis:o="z",side:a=1,seg:l=.55,colors:c=["#b02a21","#e8e4d8"]}={}){let h=Math.max(2,Math.round(t/l)),u=t/h,d=[],f=[],g=new jt(c[0]),_=new jt(c[1]),m=e/2;for(let y=0;y<h;y++){let E=-t/2+y*u,M=E+u,A=y%2?_:g,x=o==="z"?[[n,s-m,r+E],[n,s+m,r+E],[n,s+m,r+M],[n,s-m,r+E],[n,s+m,r+M],[n,s-m,r+M]]:[[n+E,s-m,r],[n+E,s+m,r],[n+M,s+m,r],[n+E,s-m,r],[n+M,s+m,r],[n+M,s-m,r]];for(let w of x)d.push(w[0]+(o==="z"?a*.014:0),w[1],w[2]+(o==="x"?a*.014:0)),f.push(A.r,A.g,A.b)}let p=new De;p.setAttribute("position",new ue(d,3)),p.setAttribute("color",new ue(f,3)),p.computeVertexNormals();let v=new xe({vertexColors:!0,roughness:.45,metalness:.15,side:Ne}),S=new Ft(p,v);return i.add(S),S}function ef(i,t){var z,G,pt;let e=Ue(null,`trailer:${i.id}`),n=[],s=[],r=(z=i.length)!=null?z:13.6,o=(G=i.width)!=null?G:2.55,a=(pt=i.height)!=null?pt:2.75,l=i.type,c=r/2,h=-c,u=c,d=i.color||"#d5d8d3",f=de(d,.72,.12),g=de(new jt(d).multiplyScalar(.86),.78,.12),_=t.darkSteel,m=l==="lowboy",p=m?.92:Dn,v=l==="lowboy"?4:l==="bdouble"?5:l==="dolly"||l==="boat"?2:3,S=Ue(e,"frame");if(l==="dolly"){for(let j of[-1,1])Gn(S,[j*.55,Dn-.1,h+.2],[j*.02,Dn-.1,h+2.4],.07,_),B(S,.14,.24,r-2.2,_,j*.52,Dn-.12,.6);B(S,1.2,.22,.24,_,0,Dn-.1,h+2.4),B(S,.5,.18,2.4,t.steel,0,Dn-.14,h+1.4)}else if(m){B(S,1.1,.4,3.4,_,0,p+.16,h+1.7);for(let j of[-1,1])B(S,.14,.42,r-.4,_,j*(o/2-.32),p-.2,.2);for(let j=h+.6;j<u;j+=1.2)B(S,o-.6,.18,.12,_,0,p-.18,j)}else{for(let j of[-1,1])B(S,.16,.34,r-.5,_,j*(o/2-.22),p-.2,.2);for(let j=h+.8;j<u-.2;j+=1.15)B(S,o-.4,.16,.12,_,0,p-.22,j)}if(l!=="dolly"&&l!=="boat"){for(let j of[-1,1]){let ht=W(S,.16,.9,.2,t.plasticGray,j*.85,Dn-.62,h+1.75,.02);B(S,.3,.06,.3,t.darkSteel,j*.85,Dn-1.1,h+1.75),Gn(S,[j*.85,Dn-.55,h+1.7],[j*.85,Dn-.18,h+2],.02,t.chromeDark)}W(S,1,.1,.8,_,0,Dn-.33,h+.5,.02),Ht(S,.07,.07,.26,t.steel,0,Dn-.45,h+.5,12),s.push({pos:[0,Dn-.4,h+.5],label:"\u0421\u0446\u0435\u043F\u043D\u043E\u0439 \u0448\u043A\u0432\u043E\u0440\u0435\u043D\u044C"})}let y=l==="lowboy"?.48:l==="boat"?.32:.5,E=[];if(l==="bdouble")E.push(u-.7,u-1.55);else if(l==="dolly")E.push(1,1.85);else if(l==="boat")E.push(1,1.8);else for(let j=0;j<v;j++)E.push(u-.75-j*1.32);let M=l==="boat"?1.02:.94,A=l!=="boat"&&l!=="dolly",x=E[0];for(let j of E){Ht(e,.09,.09,o-.35,t.darkSteel,0,y,j,10).rotation.z=Pt;for(let ht of[-1,1])if(A)for(let dt of[0,.34]){let Mt=ji(t,{radius:y,width:.3,style:"truck",rimColor:"#d2d5d7"});Mt.position.set(ht*(M+dt),y,j),ht<0&&(Mt.rotation.y=Le),e.add(Mt),n.push(Mt)}else{let dt=ji(t,{radius:y,width:.26,style:"truck",rimColor:"#d2d5d7"});dt.position.set(ht*M,y,j),ht<0&&(dt.rotation.y=Le),e.add(dt),n.push(dt)}for(let ht of[-1,1]){let dt=Ht(e,.085,.085,.2,t.plasticGray,ht*.5,y+.04,j+.24,10);dt.rotation.x=Pt}for(let ht of[-1,1])Ht(e,.12,.15,.3,t.rubberTrim,ht*(o/2-.45),p-.36,j,12);if(A)for(let ht of[-1,1])ay(e,ht*(M+.17),y,j,y+.13,.86,t.plastic)}for(let j of[-1,1]){let ht=E[E.length-1];W(e,.62,.62,.03,t.rubberTrim,j*(M+.17),y-.1,ht-.72,.02),B(e,.1,.08,.06,t.steel,j*(M+.17),y+.5,ht-.72)}let w=x-1.05,C=h+1.9,I=["curtain","van","reefer","tipper","livestock","sidetip","bdouble"].includes(l);if(l!=="boat"&&l!=="dolly"&&l!=="lowboy"&&w-C>1.2)for(let j of[-1,1]){let ht=j*(o/2-.06);B(e,.06,.74,w-C,t.plasticGray,ht,.82,(C+w)/2);for(let dt=C+.4;dt<w-.3;dt+=1.5)B(e,.09,.76,.05,t.plastic,ht,.82,dt);B(e,.08,.05,w-C,t.plasticGray,ht,.47,(C+w)/2),B(e,.07,.05,w-C,t.plastic,ht,1.16,(C+w)/2),zl(e,{length:w-C-.1,height:.1,y:.74,z:(C+w)/2,x:j*(o/2-.015),side:j})}for(let j of[-1,1]){let ht=Ht(e,.16,.16,1.1,t.steel,j*.62,p-.55,h+2.9,14);ht.rotation.x=Pt;for(let dt of[-.4,.4])B(e,.05,.06,.06,t.darkSteel,j*.62,p-.4,h+2.9+dt)}let P=W(e,.95,.5,.55,t.plasticGray,.75,p-.62,h+2.35,.03);B(e,.9,.04,.5,t.steel,.75,p-.36,h+2.35);let O=Ue(e,"rear");B(O,o-.12,.2,.18,t.darkSteel,0,p-.36,u-.04);let U=.62;W(O,o-.18,.16,.14,t.steel,0,U,u-.12,.03);for(let j of[-1,1]){let ht=j*(o/2-.42);B(O,.12,p-U-.4,.1,t.darkSteel,ht,(p+U)/2-.1,u-.14);let dt=B(O,.08,.7,.08,t.darkSteel,ht,U+.34,u-.3);dt.rotation.x=.55}zl(O,{length:o-.4,height:.11,y:U,z:u-.2,axis:"x",side:-1});for(let j of[-1,1]){let ht=j*(o/2-.33);B(O,.36,.4,.05,t.plastic,ht,p-.56,u-.07),B(O,.2,.3,.035,t.taillight,ht-j*.07,p-.56,u-.04),B(O,.09,.12,.035,t.amber,ht+j*.1,p-.47,u-.04),B(O,.09,.12,.035,t.reverseLight,ht+j*.1,p-.63,u-.04),B(O,.12,.06,.02,t.taillight,j*(o/2-.05),U+.12,u-.2)}B(O,.56,.17,.02,t.plastic,0,p-.62,u-.08);let H=_r("\u0412\u041A 4471");H&&vn(O,.5,.13,new xe({map:H,roughness:.6}),0,p-.62,u-.1),B(O,.16,.05,.05,t.headlight,0,p-.5,u-.12);for(let j of[-1,1])for(let ht=h+2.2;ht<u-.6;ht+=2.4)B(e,.09,.06,.03,t.plastic,j*(o/2-.02),p-.2,ht),bs(e,.026,t.amber,j*(o/2+.005),p-.2,ht,6);let K=Ue(e,"body"),L={M:t,unit:i,body:K,bodyMat:f,bodyMat2:g,W:o,H:a,L:r,halfL:c,zFront:h,zRear:u,deckY:p,R:y,anchors:s,frameMat:_,std:de};switch(l){case"curtain":ly(L);break;case"van":jd(L);break;case"reefer":cy(L);break;case"flatbed":hy(L);break;case"lowboy":uy(L);break;case"tanker":Qd(L,!1);break;case"adr":Qd(L,!0);break;case"silo":dy(L);break;case"tipper":fy(L);break;case"livestock":py(L);break;case"logging":my(L);break;case"dolly":gy(L);break;case"container":tf(L,!1);break;case"refcontainer":tf(L,!0);break;case"carrier":xy(L);break;case"bdouble":yy(L);break;case"boat":vy(L);break;case"glass":by(L);break;case"crane":Sy(L);break;case"sidetip":My(L);break;default:jd(L)}if(["curtain","van","reefer","tipper","livestock"].includes(l)){let j=de(Qn(i),.5,.25),ht=Ki(i.brand,{width:512,height:128,bg:"rgba(0,0,0,0)",fg:"#f7f4ea",accent:"#e8b45a",font:"bold 64px Arial, sans-serif",border:!1}),dt=ht?new xe({map:ht,transparent:!0,roughness:.5}):null;for(let Mt of[-1,1]){let Y=W(K,.03,.62,2.7,j,Mt*(o/2+.02),p+1.42,h+3.4,.04);if(Y.rotation.y=0,dt){let nt=vn(K,2.3,.5,dt,Mt*(o/2+.045),p+1.42,h+3.4);nt.rotation.y=Mt>0?-Pt:Pt}}}return{root:e,wheels:n,paintMats:[f,g],views:[{id:"exterior",label:"\u0421\u043D\u0430\u0440\u0443\u0436\u0438",group:"exterior",pos:[12.5,5.2,-11.5],target:[0,1.6,.6],fov:38,orbit:!0,autoRotate:!0},{id:"side",label:"\u0421\u0431\u043E\u043A\u0443",group:"exterior",pos:[17.5,2.6,1],target:[0,1.7,.2],fov:32,orbit:!0},{id:"rear",label:"\u0421\u0437\u0430\u0434\u0438",group:"exterior",pos:[-6.5,4.2,13.5],target:[0,1.5,.4],fov:40,orbit:!0},{id:"front",label:"\u0421\u043F\u0435\u0440\u0435\u0434\u0438",group:"exterior",pos:[5,4,-14.5],target:[0,1.4,.4],fov:40,orbit:!0}],anchors:s,layout:{frontZ:h,rearEnd:u,roofY:p+a,deckY:p,axleZ:E,wheelRadius:y,width:o,length:r},kind:"trailer"}}function ly(i){var m,p;let{M:t,body:e,bodyMat:n,bodyMat2:s,W:r,H:o,L:a,halfL:l,zFront:c,deckY:h,unit:u}=i,d=h+o;W(e,r,.12,a-.1,t.wood,0,h+.06,0,.02),B(e,r-.12,.02,a-.3,t.wood,0,h+.13,0);let f=new xe({color:new jt("#cfd3d0"),map:((m=t.tarp)==null?void 0:m.map)||null,roughness:.93,metalness:.02,side:Ne});for(let v of[-1,1]){let S=vn(e,a-.4,o-.1,f,v*(r/2+.005),h+o/2,0);S.rotation.y=v>0?-Pt:Pt;for(let y=c+.6;y<l-.4;y+=1.35)B(e,.05,o-.12,.03,t.plasticGray,v*(r/2+.03),h+o/2,y);B(e,.05,.12,a-.4,t.plasticGray,v*(r/2),h-.02,0),B(e,.09,.09,a-.2,t.steel,v*(r/2),d+.02,0)}let g=new xe({color:14672869,map:((p=t.tarp)==null?void 0:p.map)||null,roughness:.94});W(e,r+.04,.07,a-.2,g,0,d+.04,0,.02);for(let v=c+.8;v<l;v+=1.5)B(e,r,.05,.05,t.steel,0,d-.03,v);B(e,r-.04,o,.1,s,0,h+o/2,c+.12);for(let v of[-1,1])W(e,.1,o+.04,.14,t.plasticGray,v*(r/2-.02),h+o/2,c+.1,.02),W(e,.1,o+.04,.14,t.plasticGray,v*(r/2-.02),h+o/2,l-.12,.02);let _=de(Qn(u),.55,.25);for(let v of[-1,1])B(e,.012,.26,a-1.4,_,v*(r/2+.03),h+.62,0),B(e,.01,.06,a-1.4,_,v*(r/2+.012),h+.9,0);Hl(e,{W:r,z:l-.02,bottom:h+.02,height:o-.08,leafMat:n,liveryMat:_,M:t,leaves:2});for(let v=c+1.2;v<l-.5;v+=3.2)for(let S of[-1,1])B(e,.06,o,.06,t.steel,S*(r/2-.06),h+o/2,v);i.anchors.push({pos:[0,h+.6,l-.2],label:"\u0417\u0430\u0434\u043D\u0438\u0435 \u0432\u043E\u0440\u043E\u0442\u0430"}),i.anchors.push({pos:[r/2+.06,h+1.4,0],label:"\u0411\u043E\u043A\u043E\u0432\u0430\u044F \u0448\u0442\u043E\u0440\u043A\u0430"})}function jd(i){let{M:t,body:e,bodyMat:n,bodyMat2:s,W:r,H:o,L:a,zFront:l,zRear:c,deckY:h}=i,u=h+o;W(e,r,o,a-.3,n,0,h+o/2+.05,0,.06);for(let f=l+.5;f<c-.4;f+=.55)for(let g of[-1,1])B(e,.03,o-.2,.05,s,g*(r/2+.005),h+o/2,f);for(let f=l+.5;f<c-.4;f+=.8)B(e,r-.1,.03,.06,s,0,u+.05,f);let d=de(Qn(i.unit),.5,.3);for(let f of[-1,1])B(e,.012,.3,a-1.6,d,f*(r/2+.03),h+.55,0),B(e,.014,.06,a-1.2,t.steel,f*(r/2+.012),h+o*.62,0),W(e,.09,o+.06,.12,t.plasticGray,f*(r/2-.02),h+o/2,l+.14,.02),W(e,.09,o+.06,.12,t.plasticGray,f*(r/2-.02),h+o/2,c-.16,.02);Hl(e,{W:r,z:c-.03,bottom:h+.02,height:o-.08,leafMat:n,liveryMat:d,M:t,leaves:2}),i.anchors.push({pos:[0,h+.5,c-.2],label:"\u0414\u0432\u0435\u0440\u0438 \u0444\u0443\u0440\u0433\u043E\u043D\u0430"})}function cy(i){let{M:t,body:e,bodyMat:n,bodyMat2:s,W:r,H:o,L:a,zFront:l,zRear:c,deckY:h}=i,u=h+o;W(e,r,o,a-.3,n,0,h+o/2+.05,0,.07);for(let _=l+.4;_<c-.3;_+=.9)for(let m of[-1,1])B(e,.02,o-.2,.05,s,m*(r/2+.005),h+o/2,_);let d=W(e,1.7,1.15,.55,t.plasticLight,0,h+o-.72,l+.2,.06);B(e,1.3,.9,.05,t.plastic,0,h+o-.72,l-.1);for(let _=-3;_<=3;_++)B(e,.06,.78,.03,t.plasticGray,_*.16,h+o-.72,l-.12);let f=Ht(e,.3,.3,.1,t.plastic,0,h+o-1.35,l+.15,20);f.rotation.x=Pt,W(e,.5,.5,.35,t.plasticGray,-.9,h+.55,l+.25,.04);let g=de(Qn(i.unit),.5,.3);for(let _ of[-1,1])B(e,.012,.34,a-1.8,g,_*(r/2+.03),h+.5,0),W(e,.09,o+.06,.12,t.plasticGray,_*(r/2-.02),h+o/2,l+.16,.02);Hl(e,{W:r,z:c-.02,bottom:h+.02,height:o-.08,leafMat:n,liveryMat:g,M:t,leaves:2}),i.anchors.push({pos:[0,h+o-.6,l-.2],label:"\u0425\u043E\u043B\u043E\u0434\u0438\u043B\u044C\u043D\u0430\u044F \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0430"})}function hy(i){let{M:t,body:e,W:n,L:s,zFront:r,zRear:o,deckY:a,unit:l}=i,c=de(Qn(l,"#cf5a13"),.55,.25);W(e,n,.12,s-.2,t.steel,0,a+.06,0,.02);for(let f=-4;f<=4;f++)B(e,.1,.015,s-.5,t.darkSteel,f*.26,a+.13,0);for(let f of[-1,1]){let g=f*(n/2-.03);B(e,.08,.3,s-.3,t.steel,g,a+.28,0),B(e,.1,.05,s-.3,t.chromeDark,g,a+.44,0);for(let _ of[r+1.2,-1.4,o-2.3])B(e,.14,.32,.16,t.darkSteel,g,a+.3,_);B(e,.012,.09,s-.8,c,f*(n/2+.012),a+.34,0);for(let _=r+1.6;_<o-1;_+=2.6)B(e,.05,.04,.12,t.amber,f*(n/2+.04),a+.36,_)}B(e,n,.9,.08,t.steel,0,a+.62,r+.22);for(let f of[-1,1])W(e,.1,1,.1,t.darkSteel,f*(n/2-.06),a+.66,r+.22,.02);for(let f of[r+1.5,-1.4,o-2.4])for(let g of[-1,1]){let _=W(e,.14,1.05,.14,t.steel,g*(n/2-.1),a+.78,f,.02);_.rotation.z=g*.05,W(e,.26,.1,.26,t.darkSteel,g*(n/2-.1),a+1.3,f,.02)}let h=de("#8a8f94",.42,.85),u=de("#9c6a3c",.75,.5);[-3.6,0,3.4].forEach((f,g)=>{let m=Ht(e,.74,.74,1.35,g===2?u:h,0,a+.16+.74,f,24);m.rotation.z=Pt;for(let p of[-1,1])Ht(e,.74*.55,.74*.55,.04,t.darkSteel,p*.69,a+.16+.74,f,20).rotation.z=Pt;for(let p of[-1,1])B(e,1.5,.1,.16,t.wood,0,a+.12,f+p*.62);B(e,.06,.74*2+.1,.04,t.rope,.3,a+.16+.74,f+.72),B(e,.06,.74*2+.1,.04,t.rope,-.3,a+.16+.74,f+.72)}),W(e,.8,.5,.5,t.plasticGray,.62,a-.55,r+2.6,.03),i.anchors.push({pos:[0,a+1,-3.6],label:"\u0413\u0440\u0443\u0437: \u0440\u0443\u043B\u043E\u043D\u044B \u0441\u0442\u0430\u043B\u0438"})}function uy(i){let{M:t,body:e,W:n,L:s,zFront:r,zRear:o,deckY:a,halfL:l}=i,c=a-.05;W(e,n,.16,s-4.4,t.steel,0,c,o-3.2,.02);for(let p=r+3.2;p<o-.6;p+=.9)B(e,n-.2,.06,.1,t.darkSteel,0,c-.08,p);W(e,n-.2,.9,3.2,t.steel,0,a+.4,r+1.9,.05),B(e,n-.4,.12,3.2,t.darkSteel,0,a+.86,r+1.9);let h=W(e,n-.3,.12,3.6,t.steel,0,c+.05,o+1.7,.03);h.rotation.x=-.12;for(let p of[-1,1])B(e,.06,.16,3.6,t.darkSteel,p*(n/2-.2),c+.12,o+1.7);let u=Ue(e,"excavator");u.position.set(0,c+.08,o-3.4);let d=de("#c9a227",.5,.3),f=de("#1b1d1f",.85,.1);for(let p of[-1,1]){W(u,.52,.44,3,f,p*.72,.3,0,.1);for(let v=-2;v<=2;v++)Ht(u,.2,.2,.53,t.steel,p*.72,.3,v*.6,12).rotation.z=Pt}W(u,2.1,.3,2.4,t.darkSteel,0,.6,0,.04),W(u,1.7,.72,1.9,d,0,1.06,.2,.08),W(u,.8,.9,.9,d,-.55,1.5,-.55,.05),W(u,.62,.5,.62,t.glassDark,-.55,1.6,-.6,.03);let g=W(u,.3,.28,2.4,d,.1,1.6,.9,.04);g.rotation.x=-.55;let _=W(u,.22,.2,1.8,d,.1,1.95,2.6,.03);_.rotation.x=.5;let m=W(u,.75,.5,.7,de("#4c4f52",.6,.4),.1,1.55,3.25,.05);i.anchors.push({pos:[0,c+1.4,o-3.4],label:"\u0413\u0440\u0443\u0437: \u0433\u0443\u0441\u0435\u043D\u0438\u0447\u043D\u044B\u0439 \u044D\u043A\u0441\u043A\u0430\u0432\u0430\u0442\u043E\u0440"})}function Qd(i,t){let{M:e,body:n,W:s,L:r,deckY:o,unit:a}=i,l=1,c=o+l+.18,h=t?de("#e8e9e4",.4,.42):e.tank,u=de(Qn(a,"#2f7d5a"),.5,.3),d=r-2.6,f=new Ft(new Me(l,l,d,40,1,!1),h);f.rotation.x=Pt,f.position.set(0,c,-.2),n.add(f);for(let m of[-1,1]){let p=new Ft(new oi(l,32,18,0,In,0,Pt),h);p.rotation.x=m>0?-Pt:Pt,p.position.set(0,c,m>0?d/2-.2:-d/2-.2),p.scale.z=.5,n.add(p);let v=Ln(n,l+.005,.035,e.steel,0,c,m>0?d/2-.24:-d/2+.24,40);v.rotation.y=0}for(let m of[-1.6,0,1.6])Ln(n,l+.01,.032,e.steel,0,c,m,40);for(let m of[-1,1])B(n,.02,.16,d-.6,u,m*(l+.004),c+.18,-.2);for(let m=-d/2+.3;m<d/2-.2;m+=.42)B(n,.72,.03,.3,e.steel,0,c+l+.03,m);for(let m of[-1,1]){for(let v of[-d/2+.5,0,d/2-.5])B(n,.05,.55,.05,e.darkSteel,m*.52,c+l+.3,v);let p=Ht(n,.028,.028,d-1.2,e.steel,m*.52,c+l+.56,-.2,8);p.rotation.x=Pt}for(let m=0;m<3;m++){let p=-d/3.2+m*(d/3.2);Ht(n,.3,.34,.16,e.steel,0,c+l+.1,p,20),Ht(n,.24,.26,.14,e.chromeDark,0,c+l+.2,p,20),Ht(n,.29,.29,.06,e.chrome,0,c+l+.3,p,20);let v=Ln(n,.2,.025,e.chromeDark,0,c+l+.34,p,16);v.rotation.x=Pt,B(n,.42,.035,.05,e.chrome,0,c+l+.34,p)}for(let m=0;m<5;m++)B(n,.42,.035,.04,e.steel,.52,o+.55+m*.4,d/2+.02);for(let m of[.3,.75])Gn(n,[m,o+.35,d/2+.02],[m,c+l-.05,d/2+.02],.024,e.steel);W(n,.9,.85,.32,e.plasticGray,-.55,o+.5,d/2+.06,.03),B(n,.78,.06,.03,e.chromeDark,-.55,o+.78,d/2+.22);let g=Ht(n,.1,.1,.3,e.chrome,-.55,o+.05,d/2+.12,14);g.rotation.x=Pt;let _=Ht(n,.12,.12,.34,e.chrome,.35,o+.02,1.2,14);_.rotation.x=Pt,W(n,.7,.5,.4,e.plasticGray,-.7,o-.35,1.4,.03);for(let m of[-d/2+.7,0,d/2-.7]){for(let p of[-1,1])B(n,.18,.46,.5,e.darkSteel,p*.8,o+.26,m);B(n,s-.5,.14,.6,e.darkSteel,0,o+.2,m)}if(t){let m=Ki("33 1203",{width:256,height:128,bg:"#e08a1e",fg:"#1a1a1a",accent:"#1a1a1a",font:"bold 54px Arial, sans-serif",border:!0});if(m){let p=new xe({map:m,roughness:.5});for(let v of[-1,1])for(let S of[-1.5,1.6]){let y=vn(n,.62,.3,p,v*(l+.02),c+.25,S);y.rotation.y=v>0?-Pt:Pt}}for(let p of[-1,1])B(n,.02,.1,d-1,e.hazard,p*(l+.006),c-.55,-.2)}i.anchors.push({pos:[0,c+l+.2,-d/3],label:"\u0413\u043E\u0440\u043B\u043E\u0432\u0438\u043D\u0430 \u043B\u044E\u043A\u0430"}),i.anchors.push({pos:[0,o+.1,1.1],label:"\u041D\u0438\u0436\u043D\u0438\u0439 \u043D\u0430\u043B\u0438\u0432"})}function dy(i){let{M:t,body:e,W:n,L:s,zFront:r,zRear:o,deckY:a,unit:l}=i,c=de("#dfe3e4",.4,.35),h=de(Qn(l,"#7d1a2e"),.5,.3),u=a+.25,d=1.85,f=1.06,g=[-s/4.4,s/4.4];for(let _ of g){let m=new Ft(new Me(f,f,d,28,1,!1),c);m.position.set(0,u+.55+d/2,_),e.add(m);let p=new Ft(new Me(f,.2,.72,28,1,!1),c);p.position.set(0,u+.55-.36,_),e.add(p),Ht(e,.16,.16,.3,t.chromeDark,0,u+.05,_,14);let v=new Ft(new oi(f,28,14,0,In,0,Pt),c);v.position.set(0,u+.55+d,_),v.scale.set(1,.42,1),e.add(v);for(let S of[.25,1,1.7])Ln(e,f+.008,.028,t.steel,0,u+.55+S,_,30);Ht(e,.24,.26,.16,t.chromeDark,0,u+.55+d+.32,_,18),Ht(e,.28,.28,.05,t.chrome,0,u+.55+d+.42,_,18),Ln(e,f+.004,.06,h,0,u+1.25,_,30);for(let S=0;S<4;S++)B(e,.34,.03,.03,t.steel,.42,u+.85+S*.38,_+f+.06);for(let S of[.26,.58])Gn(e,[S,u+.6,_+f+.06],[S,u+2.4,_+f+.06],.022,t.steel)}for(let _ of[-1,1]){B(e,.14,.22,s-1.4,t.darkSteel,_*.92,u-.05,0);for(let m=r+1.4;m<o-1;m+=2.2)B(e,.12,.9,.12,t.darkSteel,_*.92,u-.55,m)}for(let _ of[-3.4,0,3.4])B(e,n-.5,.14,.16,t.darkSteel,0,u-.02,_);for(let _ of g)for(let m of[-.5,0,.5])B(e,n-.6,.12,.14,t.steel,0,u+.16,_+m);for(let _=-1.2;_<=1.2;_+=.4)B(e,n-.9,.04,.3,t.steel,0,u+.16,_);W(e,.92,.62,.72,t.plasticGray,0,a+.52,r+.75,.05),Ht(e,.2,.2,.46,t.steel,.5,a+.56,r+.75,16).rotation.z=Pt;for(let _=0;_<4;_++)B(e,.7,.03,.03,t.chromeDark,0,a+.3+_*.13,r+.42);Gn(e,[.42,a+.75,r+.8],[.42,u+1.5,r+2],.05,t.steel),Gn(e,[.42,u+1.5,r+2],[.42,u+1.5,o-1],.05,t.steel);for(let _=0;_<2;_++){let m=new Ft(new sn(.32,.05,8,16,Le),t.rubberTrim);m.position.set(.2,a+.4,o-.7-_*.3),m.rotation.y=Pt,e.add(m)}W(e,.8,.44,.5,t.plasticGray,-.6,a-.32,-1.2,.03),i.anchors.push({pos:[0,a+1.4,0],label:"\u0411\u0443\u043D\u043A\u0435\u0440-\u0446\u0438\u0441\u0442\u0435\u0440\u043D\u0430"}),i.anchors.push({pos:[0,a+.55,r+.8],label:"\u041A\u043E\u043C\u043F\u0440\u0435\u0441\u0441\u043E\u0440"})}function fy(i){let{M:t,body:e,bodyMat:n,bodyMat2:s,W:r,H:o,L:a,zFront:l,zRear:c,deckY:h}=i,u=Math.max(o,1.7);W(e,r,.14,a-.3,t.darkSteel,0,h+.2,0,.02);for(let v of[-1,1]){W(e,.1,u,a-.3,n,v*(r/2-.05),h+.2+u/2,0,.02),B(e,.09,.1,a-.4,t.steel,v*(r/2-.03),h+.2+u,0);for(let S=l+.8;S<c-.3;S+=1)B(e,.03,u-.15,.12,s,v*(r/2),h+.2+u/2,S)}B(e,r-.1,u,.12,n,0,h+.2+u/2,l+.22);let d=W(e,r-.1,u-.15,.1,n,0,h+.2+u/2,c-.16,.02);B(e,r-.2,.06,.06,t.steel,0,h+.25+u,c-.12);for(let v of[-1,1])Ht(e,.04,.04,.16,t.chromeDark,v*(r/2-.15),h+.25,c-.16,8);let f=W(e,.18,.9,.18,t.hazard,-.55,h+.75,l+1.2,.03),g=Ht(e,.05,.05,1.1,t.chrome,-.55,h+1.55,l+1.4,12);g.rotation.x=-.32;let _=W(e,r,.06,a-.5,t.tarp,0,h+.2+u+.04,0,.02),m=de(Qn(i.unit,"#b04a6a"),.55,.25);for(let v of[-1,1])B(e,.012,.26,a-1,m,v*(r/2+.006),h+.72,0);let p=de("#6f6a63",.98,.02);for(let v=0;v<26;v++){let S=.12+Math.random()*.12,y=new Ft(new Ks(S,0),p);y.position.set((Math.random()-.5)*(r-.5),h+.25+u+.02,(Math.random()-.5)*(a-1.2)),y.rotation.set(Math.random(),Math.random(),Math.random()),e.add(y)}i.anchors.push({pos:[0,h+u+.2,0],label:"\u0421\u0430\u043C\u043E\u0441\u0432\u0430\u043B\u044C\u043D\u044B\u0439 \u043A\u043E\u0432\u0448"})}function py(i){let{M:t,body:e,bodyMat:n,bodyMat2:s,W:r,H:o,L:a,zFront:l,zRear:c,deckY:h}=i,u=Math.max(o,2.6);for(let g of[-1,1]){for(let _=l+.8;_<c-.4;_+=1.2)B(e,.1,u,.1,t.steel,g*(r/2-.1),h+u/2,_);B(e,.1,.1,a-.5,t.steel,g*(r/2-.1),h+u-.1,0),B(e,.1,.1,a-.5,t.darkSteel,g*(r/2-.1),h+u*.5,0)}let d=de(Qn(i.unit,"#5c6b3b"),.6,.2);for(let g of[-1,1]){W(e,.06,.75,a-.5,d,g*(r/2),h+.45,0,.02);for(let _=l+.6;_<c-.4;_+=.55)B(e,.05,u-.95,.05,t.steel,g*(r/2),h+.95+(u-.95)/2-.05,_);for(let _ of[1.1,1.6,2.1])B(e,.07,.05,a-.4,t.steel,g*(r/2),h+_,0);for(let _=l+1.4;_<c-.8;_+=2.6)B(e,.05,.04,.12,t.amber,g*(r/2+.01),h+.85,_)}B(e,r-.2,.06,a-.5,t.steel,0,h+u*.5,0);for(let g=l+1;g<c-.5;g+=.8)B(e,r-.25,.04,.06,t.darkSteel,0,h+u*.5+.03,g);W(e,r,.08,a-.3,n,0,h+u+.05,0,.02);for(let g=0;g<6;g++)W(e,.62,.12,.62,t.plastic,0,h+u+.12,l+1.4+g*2,.03);for(let g of[-1,1])B(e,.05,.34,a-.5,t.steel,g*(r/2),h+u-.12,0);let f=W(e,r-.3,.08,2,t.steel,0,h+.05,c+.8,.02);f.rotation.x=.14;for(let g of[-1,1]){let _=W(e,.18,.18,1.4,t.steel,g*.75,h+.6,-2,.03)}i.anchors.push({pos:[0,h+u*.6,0],label:"\u0414\u0432\u0443\u0445\u044A\u044F\u0440\u0443\u0441\u043D\u044B\u0439 \u043E\u0442\u0441\u0435\u043A"})}function my(i){let{M:t,body:e,W:n,L:s,zFront:r,zRear:o,deckY:a,halfL:l}=i;W(e,n-.3,.16,s-.4,t.darkSteel,0,a,0,.02);let c=[r+1.4,-1,o-2];for(let g of c){for(let _ of[-1,1]){let m=W(e,.12,1.5,.12,t.steel,_*(n/2-.15),a+.75,g,.02);m.rotation.z=_*.12,B(e,.5,.12,.14,t.darkSteel,_*(n/2-.3),a+.1,g)}B(e,n-.2,.1,.1,t.darkSteel,0,a+.1,g)}let h=de("#6b4a2e",.95,.02),u=de("#c9a06a",.9,.02),d=[],f=0;for(let g=0;g<4;g++){let _=4-Math.floor(g/2);for(let m=0;m<_;m++){let p=.19+Math.random()*.05,v=(m-(_-1)/2)*.47,S=a+.28+g*.4,y=.2+(Math.random()-.5)*.5,E=s-1.6,M=Ht(e,p,p,E,h,v,S,y,12);M.rotation.x=Pt;let A=Ht(e,p*.98,p*.98,.03,u,v,S,y-E/2,12);A.rotation.x=Pt;let x=Ht(e,p*.98,p*.98,.03,u,v,S,y+E/2,12);x.rotation.x=Pt,d.push(M)}}for(let g of[r+1.4,-1,o-2]){B(e,n-.2,.03,.03,t.rope,0,a+1.7,g);for(let _ of[-1,1])B(e,.03,1.5,.03,t.rope,_*(n/2-.18),a+.95,g)}i.anchors.push({pos:[0,a+1.2,0],label:"\u0428\u0442\u0430\u0431\u0435\u043B\u044C \u0431\u0440\u0451\u0432\u0435\u043D"})}function gy(i){let{M:t,body:e,W:n,L:s,zFront:r,zRear:o,deckY:a}=i;B(e,.16,.16,s-2.6,t.darkSteel,0,a-.1,.5);for(let l of[-1,1])B(e,.14,.14,s-2.8,t.steel,l*.5,a-.14,.6);for(let l of[-1.2,.6,2.4,o-.3]){for(let c of[-1,1]){let h=W(e,.1,1.4,.1,t.steel,c*1,a+.6,l,.02);h.rotation.z=c*.15}B(e,n-.4,.12,.12,t.darkSteel,0,a-.05,l)}for(let l=0;l<3;l++){let c=Ht(e,.24,.24,7,t.steel,-.6+l*.62,a+.4+l%2*.1,-.4,16);c.rotation.x=Pt}i.anchors.push({pos:[0,a+.8,1],label:"\u041A\u043E\u043D\u0438\u043A\u0438 \u0438 \u0442\u0440\u0443\u0431\u044B"})}function _y(i,{color:t="#275b78",reefer:e=!1}={}){let{M:n,body:s,W:r,zFront:o,zRear:a,deckY:l}=i,c=Math.min(r,2.44),h=2.55,u=12.2,d=de(t,.7,.3),f=de(new jt(t).multiplyScalar(.8),.75,.3);W(s,c,h,u,d,0,l+.18+h/2,0,.04);for(let _=o+.9;_<a-.8;_+=.32)for(let m of[-1,1])B(s,.035,h-.18,.1,f,m*(c/2+.012),l+.18+h/2,_);B(s,c,.14,u,n.darkSteel,0,l+.12,0);for(let _ of[-1,1]){B(s,.05,h-.2,.08,n.steel,_*.55,l+.18+h/2,a-.75);for(let m=0;m<4;m++)B(s,.06,.3,.06,n.chromeDark,_*.55,l+.4+m*.55,a-.7)}for(let _ of[-1,1])for(let m of[-u/2+.35,u/2-.35])for(let p of[l+.2,l+.18+h-.12])B(s,.2,.16,.2,n.steel,_*(c/2-.08),p,m);W(s,c+.04,.1,u,f,0,l+.18+h+.03,0,.02);for(let _=-u/2+.6;_<u/2-.5;_+=.6)B(s,.05,.04,.5,n.steel,0,l+.18+h+.09,_);for(let _ of[-.62,-.2,.2,.62]){let m=Ht(s,.03,.03,h-.24,n.chromeDark,_,l+.18+h/2,a-.75,8);B(s,.16,.05,.08,n.chrome,_,l+1,a-.72)}let g=Ki("PORTLINE",{width:512,height:128,bg:"rgba(0,0,0,0)",fg:"#f4f2e8",accent:t,font:"bold 62px Arial, sans-serif",border:!1});if(g){let _=new xe({map:g,transparent:!0,roughness:.6});for(let m of[-1,1]){let p=vn(s,2.6,.65,_,m*(c/2+.05),l+.18+h/2+.3,.8);p.rotation.y=m>0?-Pt:Pt}}if(e){let _=de("#0f6b70",.5,.3);for(let p of[-1,1])B(s,.02,.34,u-2.6,_,p*(c/2+.02),l+1.05,0);W(s,c-.3,1,.5,n.plasticLight,0,l+.18+h-.7,o+1,.05);for(let p=-3;p<=3;p++)B(s,.05,.7,.03,n.plasticGray,p*.14,l+.18+h-.7,o+.73);let m=Ht(s,.28,.28,.08,n.plastic,0,l+.18+h-1.3,o+1,18);m.rotation.x=Pt}return{w:c,h,l:u}}function tf(i,t){let{M:e,body:n,W:s,L:r,zFront:o,zRear:a,deckY:l,unit:c}=i;W(n,s-.1,.18,r-.6,e.darkSteel,0,l+.05,0,.02);for(let h of[-5.2,5.2])for(let u of[-1,1])B(n,.24,.14,.24,e.steel,u*(s/2-.3),l+.16,h),B(n,.1,.05,.1,e.chromeDark,u*(s/2-.3),l+.26,h);_y(i,{color:t?"#e8ebe6":c.color,reefer:t}),i.anchors.push({pos:[s/2,l+1.6,0],label:t?"\u0420\u0435\u0444-\u043A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440":"\u041A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440 40\u2032"}),i.anchors.push({pos:[s/2-.3,l+.2,-5.2],label:"Twist-lock \u0444\u0438\u0442\u0438\u043D\u0433"})}function xy(i){let{M:t,body:e,W:n,L:s,zFront:r,zRear:o,deckY:a}=i,l=t.steel,c=t.darkSteel;for(let g of[-1,1])B(e,.12,.3,s-.6,c,g*(n/2-.2),a-.02,0);for(let g=r+.8;g<o-.3;g+=1.3)B(e,n-.3,.1,.1,c,0,a+.02,g);let h=a+3.3;for(let g of[r+1,r+6.3,o-1.2])for(let _ of[-1,1])B(e,.14,3.4,.14,l,_*(n/2-.15),a+1.7,g);for(let g of[-1,1])B(e,.14,.16,s-1.2,c,g*(n/2-.15),h,0);for(let g=r+1.2;g<o-.8;g+=1.4)B(e,n-.3,.08,.1,c,0,h,g);for(let g of[-1,1]){let _=W(e,.12,1.2,.12,t.hazard,g*1.02,a+.8,r+3.5,.02);_.rotation.x=-.2}let u=["#2f5d8a","#c9402f","#e9ecec","#e0b528","#4f5844","#7a8086"],d=0;for(let g of[r+2,r+5,r+8]){for(let _=0;_<1;_++){let m=Eo({id:"carrier-car",name:"",brand:"",style:"sedan",paint:u[d%u.length],accent:"#d8d5c8",length:4.4,width:1.8,height:1.4,wheelbase:2.6,wheelRadius:.31,wheelWidth:.2},t,{simple:!0,wheels:!1});m.root.position.set(0,a+.08,g),m.root.rotation.y=Le/2,e.add(m.root);let p=d<3?h+.08:a+.08}d++}let f=3;for(let g of[r+2.4,r+5.6,r+8.6]){let _=Eo({id:"carrier-car2",name:"",brand:"",style:"sedan",paint:u[f%u.length],accent:"#d8d5c8",length:4.4,width:1.8,height:1.4,wheelbase:2.6,wheelRadius:.31,wheelWidth:.2},t,{simple:!0,wheels:!1});_.root.position.set(0,h+.1,g),_.root.rotation.y=Le/2,e.add(_.root),f++}for(let g of[o-.2]){let _=W(e,n-.6,.1,2.6,t.steel,0,a-.6,o+.9,.02);_.rotation.x=.2}i.anchors.push({pos:[n/2,h-.4,r+5],label:"\u0412\u0435\u0440\u0445\u043D\u044F\u044F \u043F\u0430\u043B\u0443\u0431\u0430"})}function yy(i){let{M:t,body:e,W:n,L:s,zFront:r,zRear:o,deckY:a}=i,l=s/2,c=W(e,n,2.7,7,de("#d5d8d3",.7,.12),0,a+1.45,r+3.8,.05),h=W(e,n,2.7,6.4,de("#d5d8d3",.7,.12),0,a+1.45,o-3.6,.05);B(e,.9,.3,2.2,t.darkSteel,0,a+.1,.4);for(let d of[-1,1])B(e,.12,.24,3.2,t.steel,d*.55,a+.05,.4);for(let d of[{z0:r+.6,z1:r+7.2},{z0:o-6.7,z1:o-.4}])for(let f=d.z0;f<d.z1;f+=.6)for(let g of[-1,1])B(e,.03,2.5,.05,de("#c2c6c2",.75,.1),g*(n/2+.006),a+1.45,f);for(let d of[1,1.8])for(let f of[-1,1])B(e,.1,.4,.1,t.steel,f*.8,a-.2,d);let u=de(Qn(i.unit,"#1b4f8a"),.5,.3);for(let d of[-1,1])B(e,.012,.24,6.4,u,d*(n/2+.02),a+.62,r+3.8),B(e,.012,.24,5.8,u,d*(n/2+.02),a+.62,o-3.6),zl(e,{length:6.2,height:.1,y:.42,z:r+3.8,x:d*(n/2+.012),side:d}),zl(e,{length:5.6,height:.1,y:.42,z:o-3.6,x:d*(n/2+.012),side:d});Hl(e,{W:n,z:o-.06,bottom:a+.12,height:2.56,leafMat:de("#d5d8d3",.7,.12),liveryMat:u,M:t,leaves:2}),i.anchors.push({pos:[0,a+.2,.4],label:"\u0421\u043E\u0435\u0434\u0438\u043D\u0438\u0442\u0435\u043B\u044C\u043D\u0430\u044F \u0431\u0430\u043B\u043A\u0430"})}function vy(i){let{M:t,body:e,W:n,zFront:s,zRear:r,deckY:o}=i;for(let d of[-1,1]){let f=B(e,.12,.16,7,t.darkSteel,d*.85,o-.2,.2);for(let g=s+1.4;g<r-1.2;g+=.9){let _=Ht(e,.11,.11,.4,t.rubberTrim,d*.85,o-.02,g,12);_.rotation.z=Pt}}Gn(e,[-.4,o-.3,s+.5],[0,o-.3,s-1.1],.06,t.steel),Gn(e,[.4,o-.3,s+.5],[0,o-.3,s-1.1],.06,t.steel),Ht(e,.09,.09,.3,t.steel,0,o-.5,s-1.25,10).rotation.x=Pt,W(e,.3,.3,.4,t.chromeDark,0,o+.05,s+.9,.03);let a=de("#f2f4f2",.25,.25),l=de("#1f3d5c",.4,.3),c=new Ft(new Me(1,.45,4.8,20,1,!1,0,In,0,Pt),a);c.rotation.x=Pt,c.rotation.z=Pt,c.scale.set(1,.72,1),c.position.set(0,o+.5,-.2),e.add(c);let h=new Ft(new sn(.9,.08,8,24,Le),l);h.rotation.x=Pt,h.position.set(0,o+.52,-.2),h.scale.set(1,1,.72),e.add(h);let u=W(e,1.5,.5,.08,t.glassDark,0,o+1,-2,.03);u.rotation.x=-.35,W(e,1.4,.25,.5,t.plasticLight,0,o+.8,-1.5,.05),W(e,.7,.25,.6,de("#2d3440",.8,.05),0,o+.82,-.9,.05),W(e,.45,.7,.5,t.plastic,0,o+.9,2.3,.05),B(e,.3,.3,.1,t.plasticGray,0,o+.8,2.58),i.anchors.push({pos:[0,o+1,-.2],label:"\u041A\u0430\u0442\u0435\u0440 \u043D\u0430 \u0440\u043E\u043B\u0438\u043A\u0430\u0445"})}function by(i){let{M:t,body:e,W:n,L:s,zFront:r,zRear:o,deckY:a}=i;for(let c=0;c<5;c++){let h=r+1.6+c*2.3;for(let u of[-1,1])Gn(e,[u*(n/2-.2),a,h],[0,a+3,h],.06,t.darkSteel),Gn(e,[u*(n/2-.2),a,h],[u*.6,a+1.6,h],.05,t.steel);B(e,n-.3,.1,.14,t.darkSteel,0,a+1.5,h)}let l=new Mi({color:10471872,metalness:.1,roughness:.05,transparent:!0,opacity:.55,side:Ne,envMapIntensity:1.4});for(let c=0;c<7;c++){let h=B(e,.04,2.3,s-4,l,-.5+c*.11,a+1.2,.2);h.rotation.z=.03}for(let c of[r+3,0,o-3.2])B(e,n-.2,.05,.08,t.rope,0,a+1,c);B(e,.9,.16,s-4.2,t.fabric,-.2,a+.12,.2),i.anchors.push({pos:[0,a+2.2,0],label:"\u041F\u0430\u043A\u0435\u0442 \u043B\u0438\u0441\u0442\u043E\u0432\u043E\u0433\u043E \u0441\u0442\u0435\u043A\u043B\u0430"})}function Sy(i){let{M:t,body:e,W:n,L:s,zFront:r,zRear:o,deckY:a,halfL:l}=i;W(e,n,.16,s-.3,t.steel,0,a+.08,0,.02);for(let m=r+.6;m<o-.3;m+=.7)B(e,n-.2,.02,.06,t.darkSteel,0,a+.17,m);for(let m of[-1,1]){B(e,.07,.4,s-.4,t.steel,m*(n/2),a+.35,0);for(let p=r+.6;p<o-.3;p+=1.1)B(e,.06,.36,.05,t.darkSteel,m*(n/2),a+.36,p)}let c=de("#c94a1e",.5,.3),h=r+1.7;Ht(e,.55,.6,.3,t.darkSteel,0,a+.35,h,20);let u=Ht(e,.34,.34,1.5,c,0,a+1.2,h,18),d=W(e,.28,.28,4.2,c,0,a+2.1,h+1.4,.05);d.rotation.x=.42;let f=W(e,.2,.2,2.4,c,0,a+2.55,h+3.6,.03);f.rotation.x=-.55;let g=Ht(e,.06,.06,1.5,t.chrome,0,a+1.35,h+.65,10);g.rotation.x=1,Gn(e,[0,a+2.05,h+4.5],[0,a+1.25,h+4.5],.012,t.steel);let _=new Ft(new sn(.12,.03,6,12,Le*1.4),t.steel);_.position.set(0,a+1.15,h+4.5),_.rotation.x=Pt,e.add(_);for(let m of[-1,1]){let p=W(e,.9,.16,.22,t.darkSteel,m*(n/2+.2),a-.02,h-1.1,.02);B(e,.16,.9,.16,t.hazard,m*(n/2+.5),a-.45,h-1.1),B(e,.38,.06,.38,t.steel,m*(n/2+.5),a-.9,h-1.1)}for(let m=0;m<3;m++)W(e,1.1,1.2,1.2,t.wood,.2,a+.75,l-2.2-m*1.5,.02);i.anchors.push({pos:[0,a+2.2,h+1.4],label:"\u041A\u0440\u0430\u043D-\u043C\u0430\u043D\u0438\u043F\u0443\u043B\u044F\u0442\u043E\u0440"})}function My(i){var m;let{M:t,body:e,bodyMat:n,bodyMat2:s,W:r,L:o,zFront:a,zRear:l,deckY:c,unit:h}=i,u=Math.max((m=h.height)!=null?m:1.8,1.6);W(e,r,.14,o-.3,t.darkSteel,0,c+.2,0,.02);let d=Ue(e);d.position.set(-r/2+.12,c+.2,0),d.rotation.z=-.12;let f=n;W(d,r,u,o-.4,f,r/2,u/2,0,.03);for(let p of[-1,1]){B(d,.08,.1,o-.5,t.steel,r/2+p*(r/2-.02),u,0);for(let v=a+.8;v<l-.3;v+=1.1)B(d,.03,u-.15,.1,s,r/2+p*(r/2),u/2,v)}B(d,r,u,.1,n,r/2,u/2,a+.2),B(d,r,u,.1,n,r/2,u/2,l-.2);let g=de(Qn(i.unit,"#37a58c"),.55,.25);for(let p of[-1,1])B(d,.012,.24,o-1,g,r/2+p*(r/2+.006),u*.55,0);for(let p of[a+1.5,l-1.5]){let v=Ht(e,.09,.09,1.2,t.hazard,-r/2+.3,c+.7,p,12);v.rotation.z=.4}let _=de("#8a7f6a",.98,.02);for(let p=0;p<20;p++){let v=.1+Math.random()*.1,S=new Ft(new Ks(v,0),_);S.position.set((Math.random()-.2)*(r-.4),c+u+.1,(Math.random()-.5)*(o-1)),S.rotation.set(Math.random(),Math.random(),Math.random()),e.add(S)}i.anchors.push({pos:[0,c+u,0],label:"\u0411\u043E\u043A\u043E\u0432\u043E\u0439 \u0441\u0430\u043C\u043E\u0441\u0432\u0430\u043B"})}function Vl(i,t){return i.category==="trucks"?Kd(i,t):i.category==="trailers"?ef(i,t):Eo(i,t)}var nf=[{id:"trucks",title:"\u0422\u042F\u0413\u0410\u0427\u0418",short:"\u0422\u044F\u0433\u0430\u0447\u0438",icon:"\u{1F69B}",count:10,hint:"10 \u043C\u043E\u0434\u0435\u043B\u0435\u0439 \xB7 \u0441\u0435\u0434\u0435\u043B\u044C\u043D\u044B\u0435 \u0442\u044F\u0433\u0430\u0447\u0438"},{id:"trailers",title:"\u041F\u0420\u0418\u0426\u0415\u041F\u042B",short:"\u041F\u0440\u0438\u0446\u0435\u043F\u044B",icon:"\u{1F4E6}",count:20,hint:"20 \u0442\u0438\u043F\u043E\u0432 \xB7 \u043E\u0442 \u0448\u0442\u043E\u0440\u043A\u0438 \u0434\u043E \u0446\u0438\u0441\u0442\u0435\u0440\u043D\u044B"},{id:"cars",title:"\u0410\u0412\u0422\u041E\u041C\u041E\u0411\u0418\u041B\u0418",short:"\u0410\u0432\u0442\u043E",icon:"\u{1F697}",count:10,hint:"10 \u043C\u043E\u0434\u0435\u043B\u0435\u0439 \xB7 \u043E\u0442 \u043C\u0438\u043A\u0440\u043E\u043A\u0430\u0440\u0430 \u0434\u043E \u0441\u043F\u043E\u0440\u0442\u043A\u0430\u0440\u0430"}],ui={night:"#1f2933",graphite:"#2f353b",black:"#101214",white:"#e9ecec",ivory:"#ddd6c3",silver:"#b9c0c6",gray:"#6f777e",red:"#a4241d",crimson:"#7d1a2e",orange:"#cf5a13",amber:"#d99a1e",yellow:"#e0b528",olive:"#5c6b3b",green:"#1f6b45",mint:"#37a58c",teal:"#0f6b70",blue:"#1b4f8a",navy:"#16233f",sky:"#3d8fc4",violet:"#4b3c85",purple:"#6d2a6b",rose:"#b04a6a",brown:"#5a3c25",copper:"#a35a2c",sand:"#c2a878"},To=[{id:"atlas-vision",name:"ATLAS Vision 4\xD72",brand:"ATLAS",model:"Vision",tagline:"\u041C\u0430\u0433\u0438\u0441\u0442\u0440\u0430\u043B\u044C\u043D\u044B\u0439 \u0442\u0440\u0443\u0434\u044F\u0433\u0430 \u0441 \u0432\u044B\u0441\u043E\u043A\u043E\u0439 \u043A\u0430\u0431\u0438\u043D\u043E\u0439",desc:"\u0421\u0430\u043C\u044B\u0439 \u043F\u043E\u043F\u0443\u043B\u044F\u0440\u043D\u044B\u0439 \u0442\u044F\u0433\u0430\u0447 \u0441\u0435\u0440\u0438\u0438: \u0432\u044B\u0441\u043E\u043A\u0430\u044F \u043A\u0430\u0431\u0438\u043D\u0430 \u0441 \u0434\u0432\u0443\u043C\u044F \u0441\u043F\u0430\u043B\u044C\u043D\u044B\u043C\u0438 \u043C\u0435\u0441\u0442\u0430\u043C\u0438, \u043E\u0431\u0442\u0435\u043A\u0430\u0435\u043C\u044B\u0439 \u043E\u0431\u0432\u0435\u0441 \u0438 12-\u0441\u0442\u0443\u043F\u0435\u043D\u0447\u0430\u0442\u0430\u044F \u043A\u043E\u0440\u043E\u0431\u043A\u0430. \u0421\u043E\u0437\u0434\u0430\u043D \u0434\u043B\u044F \u0434\u043B\u0438\u043D\u043D\u044B\u0445 \u0440\u0435\u0439\u0441\u043E\u0432 \u043F\u043E \u0442\u0440\u0430\u0441\u0441\u0435.",style:"euro",roof:"high",length:6.2,cabHeight:3.55,paint:ui.blue,accent:"#e8b45a",chrome:!0,fenders:!0,deflectors:!0,sideSkirts:!0,wheel:{radius:.535,width:.42,style:"truck",rimColor:"#d9dde0"},tags:["\u043C\u0430\u0433\u0438\u0441\u0442\u0440\u0430\u043B\u044C\u043D\u044B\u0439","4\xD72","\u0432\u044B\u0441\u043E\u043A\u0430\u044F \u043A\u0430\u0431\u0438\u043D\u0430"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","460 \u043B.\u0441."],["\u041A\u0440\u0443\u0442\u044F\u0449\u0438\u0439 \u043C\u043E\u043C\u0435\u043D\u0442","2 300 \u041D\xB7\u043C"],["\u041A\u043E\u0440\u043E\u0431\u043A\u0430 \u043F\u0435\u0440\u0435\u0434\u0430\u0447","12-\u0441\u0442. \u0430\u0432\u0442\u043E\u043C\u0430\u0442"],["\u041F\u0440\u0438\u0432\u043E\u0434","4\xD72"],["\u041F\u043E\u043B\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","18 000 \u043A\u0433"],["\u0411\u0430\u043A","1 200 \u043B"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","89 \u043A\u043C/\u0447"],["\u0426\u0435\u043D\u0430","8 900 000 \u20BD"]]},{id:"nordwind-aurora",name:"NORDWIND Aurora 6\xD72",brand:"NORDWIND",model:"Aurora",tagline:"\u0424\u043B\u0430\u0433\u043C\u0430\u043D \u0441 \u043A\u0430\u0431\u0438\u043D\u043E\u0439-\u043F\u0435\u043D\u0442\u0445\u0430\u0443\u0441\u043E\u043C",desc:"\u041A\u0430\u0431\u0438\u043D\u0430-\u043C\u0435\u0433\u0430 \u0441 \u0440\u043E\u0432\u043D\u044B\u043C \u043F\u043E\u043B\u043E\u043C, \u0445\u043E\u043B\u043E\u0434\u0438\u043B\u044C\u043D\u0438\u043A\u043E\u043C \u0438 \u0440\u0430\u0431\u043E\u0447\u0438\u043C \u0441\u0442\u043E\u043B\u043E\u043C. \u0422\u0440\u0438 \u043E\u0441\u0438, \u043F\u043E\u0434\u044A\u0451\u043C\u043D\u044B\u0439 \u043C\u043E\u0441\u0442 \u0438 \u0430\u044D\u0440\u043E\u0434\u0438\u043D\u0430\u043C\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u043F\u0430\u043A\u0435\u0442 \u0434\u043B\u044F \u044D\u043A\u043E\u043D\u043E\u043C\u0438\u0438 \u0442\u043E\u043F\u043B\u0438\u0432\u0430.",style:"euro",roof:"mega",length:6.6,cabHeight:4.05,paint:ui.white,accent:"#12908f",chrome:!0,fenders:!0,deflectors:!0,sideSkirts:!0,thirdAxle:!0,meta:"6\xD72",wheel:{radius:.535,width:.42,style:"truck",rimColor:"#c9d1d5"},tags:["\u043C\u0435\u0433\u0430-\u043A\u0430\u0431\u0438\u043D\u0430","6\xD72","\u0444\u043B\u0430\u0433\u043C\u0430\u043D"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","530 \u043B.\u0441."],["\u041A\u0440\u0443\u0442\u044F\u0449\u0438\u0439 \u043C\u043E\u043C\u0435\u043D\u0442","2 600 \u041D\xB7\u043C"],["\u041A\u043E\u0440\u043E\u0431\u043A\u0430 \u043F\u0435\u0440\u0435\u0434\u0430\u0447","12-\u0441\u0442. \u0430\u0432\u0442\u043E\u043C\u0430\u0442"],["\u041F\u0440\u0438\u0432\u043E\u0434","6\xD72 (\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u044B\u0439 \u043C\u043E\u0441\u0442)"],["\u041F\u043E\u043B\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","26 000 \u043A\u0433"],["\u0411\u0430\u043A","1 500 \u043B"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","89 \u043A\u043C/\u0447"],["\u0426\u0435\u043D\u0430","12 400 000 \u20BD"]]},{id:"vulcan-titan",name:"VULCAN Titan 6\xD74",brand:"VULCAN",model:"Titan",tagline:"\u041A\u043B\u0430\u0441\u0441\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u043A\u0430\u043F\u043E\u0442\u043D\u0438\u043A \u0434\u043B\u044F \u0442\u044F\u0436\u0451\u043B\u044B\u0445 \u0433\u0440\u0443\u0437\u043E\u0432",desc:"\u0414\u043B\u0438\u043D\u043D\u044B\u0439 \u043A\u0430\u043F\u043E\u0442, \u043E\u0433\u0440\u043E\u043C\u043D\u0430\u044F \u0445\u0440\u043E\u043C\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u0430\u044F \u0440\u0435\u0448\u0451\u0442\u043A\u0430 \u0438 \u0432\u044B\u0445\u043B\u043E\u043F\u043D\u044B\u0435 \u0442\u0440\u0443\u0431\u044B \u043F\u043E \u0431\u043E\u043A\u0430\u043C. \u0422\u044F\u0433\u0430\u0447 \u0434\u043B\u044F \u0442\u044F\u0436\u0435\u043B\u043E\u0432\u043E\u0437\u043D\u044B\u0445 \u043F\u043E\u043B\u0443\u043F\u0440\u0438\u0446\u0435\u043F\u043E\u0432 \u0438 \u0440\u0430\u0431\u043E\u0442\u044B \u0432 \u043A\u0430\u0440\u044C\u0435\u0440\u0435.",style:"bonnet",roof:"sleeper",length:7.6,cabHeight:3.5,bonnet:2.15,paint:ui.crimson,accent:"#cfd3d5",chrome:!0,fenders:!0,stacks:!0,chromeBumper:!0,wheel:{radius:.55,width:.46,style:"truck",rimColor:"#d8d2c4"},tags:["\u043A\u0430\u043F\u043E\u0442\u043D\u0438\u043A","6\xD74","\u0442\u044F\u0436\u0435\u043B\u043E\u0432\u043E\u0437"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","620 \u043B.\u0441."],["\u041A\u0440\u0443\u0442\u044F\u0449\u0438\u0439 \u043C\u043E\u043C\u0435\u043D\u0442","3 000 \u041D\xB7\u043C"],["\u041A\u043E\u0440\u043E\u0431\u043A\u0430 \u043F\u0435\u0440\u0435\u0434\u0430\u0447","16-\u0441\u0442. \u043C\u0435\u0445\u0430\u043D\u0438\u043A\u0430"],["\u041F\u0440\u0438\u0432\u043E\u0434","6\xD74"],["\u041F\u043E\u043B\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","33 000 \u043A\u0433"],["\u0411\u0430\u043A","1 000 \u043B"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","89 \u043A\u043C/\u0447"],["\u0426\u0435\u043D\u0430","14 700 000 \u20BD"]]},{id:"helios-spark",name:"HELIOS Spark",brand:"HELIOS",model:"Spark",tagline:"\u0413\u043E\u0440\u043E\u0434\u0441\u043A\u043E\u0439 \u0440\u0430\u0437\u0432\u043E\u0437\u043D\u043E\u0439 \u0442\u044F\u0433\u0430\u0447",desc:"\u041D\u0438\u0437\u043A\u0430\u044F \u0434\u043D\u0435\u0432\u043D\u0430\u044F \u043A\u0430\u0431\u0438\u043D\u0430, \u043A\u043E\u0440\u043E\u0442\u043A\u0430\u044F \u0431\u0430\u0437\u0430 \u0438 \u043E\u0431\u0437\u043E\u0440\u043D\u0430\u044F \u043F\u043E\u0441\u0430\u0434\u043A\u0430. \u0418\u0434\u0435\u0430\u043B\u0435\u043D \u0434\u043B\u044F \u0433\u043E\u0440\u043E\u0434\u0430: \u0440\u0430\u0437\u0432\u043E\u0437\u043A\u0430 \u043F\u043E \u043C\u0430\u0433\u0430\u0437\u0438\u043D\u0430\u043C \u0438 \u0441\u043A\u043B\u0430\u0434\u0430\u043C.",style:"euro",roof:"day",length:4.7,cabHeight:2.85,paint:ui.orange,accent:"#f4f1e8",chrome:!1,fenders:!0,sideSkirts:!1,wheel:{radius:.505,width:.38,style:"truck",rimColor:"#cdd2d4"},tags:["\u0433\u043E\u0440\u043E\u0434\u0441\u043A\u043E\u0439","4\xD72","\u0434\u043D\u0435\u0432\u043D\u0430\u044F \u043A\u0430\u0431\u0438\u043D\u0430"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","320 \u043B.\u0441."],["\u041A\u0440\u0443\u0442\u044F\u0449\u0438\u0439 \u043C\u043E\u043C\u0435\u043D\u0442","1 600 \u041D\xB7\u043C"],["\u041A\u043E\u0440\u043E\u0431\u043A\u0430 \u043F\u0435\u0440\u0435\u0434\u0430\u0447","6-\u0441\u0442. \u0430\u0432\u0442\u043E\u043C\u0430\u0442"],["\u041F\u0440\u0438\u0432\u043E\u0434","4\xD72"],["\u041F\u043E\u043B\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","16 000 \u043A\u0433"],["\u0411\u0430\u043A","400 \u043B"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","85 \u043A\u043C/\u0447"],["\u0426\u0435\u043D\u0430","6 200 000 \u20BD"]]},{id:"orion-x",name:"ORION X",brand:"ORION",model:"X",tagline:"\u042D\u043B\u0435\u043A\u0442\u0440\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0442\u044F\u0433\u0430\u0447 \u0431\u0443\u0434\u0443\u0449\u0435\u0433\u043E",desc:"\u0413\u043B\u0430\u0434\u043A\u0438\u0439 \u043A\u0443\u0437\u043E\u0432 \u0431\u0435\u0437 \u0432\u044B\u0441\u0442\u0443\u043F\u0430\u044E\u0449\u0438\u0445 \u0437\u0435\u0440\u043A\u0430\u043B \u2014 \u0438\u0445 \u0437\u0430\u043C\u0435\u043D\u0438\u043B\u0438 \u043A\u0430\u043C\u0435\u0440\u044B. \u0411\u0430\u0442\u0430\u0440\u0435\u044F \u0432 \u0440\u0430\u043C\u0435, \u043E\u0433\u0440\u043E\u043C\u043D\u044B\u0439 \u0441\u0435\u043D\u0441\u043E\u0440\u043D\u044B\u0439 \u0434\u0438\u0441\u043F\u043B\u0435\u0439 \u0438 \u0441\u0432\u0435\u0442\u044F\u0449\u0430\u044F\u0441\u044F \u043F\u0435\u0440\u0435\u0434\u043D\u044F\u044F \u043F\u0430\u043D\u0435\u043B\u044C.",style:"futuristic",roof:"aero",length:6.4,cabHeight:3.75,paint:ui.silver,accent:"#25d0e0",chrome:!0,fenders:!0,deflectors:!0,sideSkirts:!0,led:!0,wheel:{radius:.53,width:.42,style:"truck",rimColor:"#2c3237"},tags:["\u044D\u043B\u0435\u043A\u0442\u0440\u043E\u0432\u043E\u0437","4\xD72","\u043A\u0430\u043C\u0435\u0440\u044B \u0432\u043C\u0435\u0441\u0442\u043E \u0437\u0435\u0440\u043A\u0430\u043B"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","480 \u043A\u0412\u0442 (~650 \u043B.\u0441.)"],["\u041A\u0440\u0443\u0442\u044F\u0449\u0438\u0439 \u043C\u043E\u043C\u0435\u043D\u0442","3 400 \u041D\xB7\u043C"],["\u041A\u043E\u0440\u043E\u0431\u043A\u0430 \u043F\u0435\u0440\u0435\u0434\u0430\u0447","2-\u0441\u0442. \u0440\u0435\u0434\u0443\u043A\u0442\u043E\u0440"],["\u041F\u0440\u0438\u0432\u043E\u0434","4\xD72"],["\u0411\u0430\u0442\u0430\u0440\u0435\u044F","620 \u043A\u0412\u0442\xB7\u0447"],["\u0417\u0430\u043F\u0430\u0441 \u0445\u043E\u0434\u0430","480 \u043A\u043C"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","90 \u043A\u043C/\u0447"],["\u0426\u0435\u043D\u0430","19 800 000 \u20BD"]]},{id:"meridian-grand",name:"MERIDIAN Grand",brand:"MERIDIAN",model:"Grand",tagline:"\u041F\u0440\u0435\u0434\u0441\u0442\u0430\u0432\u0438\u0442\u0435\u043B\u044C\u0441\u043A\u0438\u0439 \u0442\u044F\u0433\u0430\u0447 \u0441 \u043A\u0430\u0431\u0438\u043D\u043E\u0439-\u043B\u044E\u043A\u0441",desc:"\u041A\u043E\u0436\u0430\u043D\u044B\u0439 \u0441\u0430\u043B\u043E\u043D, \u043F\u0430\u043D\u043E\u0440\u0430\u043C\u043D\u043E\u0435 \u043E\u0441\u0442\u0435\u043A\u043B\u0435\u043D\u0438\u0435 \u0438 \u0431\u043E\u043B\u044C\u0448\u043E\u0439 \u0431\u043E\u043A\u043E\u0432\u043E\u0439 \u0434\u0435\u0444\u043B\u0435\u043A\u0442\u043E\u0440. \u0412\u043D\u0435\u0448\u043D\u0435 \u0441\u043F\u043E\u043A\u043E\u0439\u043D\u044B\u0439, \u0432\u043D\u0443\u0442\u0440\u0438 \u2014 \u043C\u0430\u043B\u0435\u043D\u044C\u043A\u0430\u044F \u0433\u043E\u0441\u0442\u0438\u043D\u0430\u044F.",style:"euro",roof:"high",length:6.4,cabHeight:3.7,paint:ui.ivory,accent:"#8c6d3f",chrome:!0,fenders:!0,deflectors:!0,sideSkirts:!0,luxury:!0,wheel:{radius:.535,width:.42,style:"truck",rimColor:"#e5e1d6"},tags:["\u043B\u044E\u043A\u0441","4\xD72","\u043F\u0430\u043D\u043E\u0440\u0430\u043C\u0430"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","500 \u043B.\u0441."],["\u041A\u0440\u0443\u0442\u044F\u0449\u0438\u0439 \u043C\u043E\u043C\u0435\u043D\u0442","2 450 \u041D\xB7\u043C"],["\u041A\u043E\u0440\u043E\u0431\u043A\u0430 \u043F\u0435\u0440\u0435\u0434\u0430\u0447","12-\u0441\u0442. \u0430\u0432\u0442\u043E\u043C\u0430\u0442"],["\u041F\u0440\u0438\u0432\u043E\u0434","4\xD72"],["\u041F\u043E\u043B\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","18 000 \u043A\u0433"],["\u0411\u0430\u043A","1 300 \u043B"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","89 \u043A\u043C/\u0447"],["\u0426\u0435\u043D\u0430","11 300 000 \u20BD"]]},{id:"kargo-standard",name:"KARGO Standard",brand:"KARGO",model:"Standard",tagline:"\u0420\u0430\u0431\u043E\u0447\u0430\u044F \u043B\u043E\u0448\u0430\u0434\u043A\u0430 \u0431\u0435\u0437 \u0438\u0437\u043B\u0438\u0448\u0435\u0441\u0442\u0432",desc:"\u041F\u0440\u043E\u0441\u0442\u0430\u044F \u043F\u043B\u043E\u0441\u043A\u0430\u044F \u043A\u0440\u044B\u0448\u0430, \u043C\u0438\u043D\u0438\u043C\u0443\u043C \u0445\u0440\u043E\u043C\u0430, \u0440\u0435\u043C\u043E\u043D\u0442\u043E\u043F\u0440\u0438\u0433\u043E\u0434\u043D\u043E\u0441\u0442\u044C \u0438 \u043D\u0430\u0434\u0451\u0436\u043D\u043E\u0441\u0442\u044C. \u0421\u0430\u043C\u044B\u0439 \u0434\u043E\u0441\u0442\u0443\u043F\u043D\u044B\u0439 \u0442\u044F\u0433\u0430\u0447 \u043A\u0430\u0442\u0430\u043B\u043E\u0433\u0430.",style:"euro",roof:"flat",length:5.9,cabHeight:3.05,paint:ui.green,accent:"#d8d5c8",chrome:!1,fenders:!0,deflectors:!1,sideSkirts:!1,wheel:{radius:.52,width:.4,style:"truck",rimColor:"#cfd2d3"},tags:["\u0431\u044E\u0434\u0436\u0435\u0442\u043D\u044B\u0439","4\xD72","\u043F\u043B\u043E\u0441\u043A\u0430\u044F \u043A\u0440\u044B\u0448\u0430"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","400 \u043B.\u0441."],["\u041A\u0440\u0443\u0442\u044F\u0449\u0438\u0439 \u043C\u043E\u043C\u0435\u043D\u0442","1 950 \u041D\xB7\u043C"],["\u041A\u043E\u0440\u043E\u0431\u043A\u0430 \u043F\u0435\u0440\u0435\u0434\u0430\u0447","12-\u0441\u0442. \u043C\u0435\u0445\u0430\u043D\u0438\u043A\u0430"],["\u041F\u0440\u0438\u0432\u043E\u0434","4\xD72"],["\u041F\u043E\u043B\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","18 000 \u043A\u0433"],["\u0411\u0430\u043A","900 \u043B"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","89 \u043A\u043C/\u0447"],["\u0426\u0435\u043D\u0430","5 400 000 \u20BD"]]},{id:"stellar-wave",name:"STELLAR Wave",brand:"STELLAR",model:"Wave",tagline:"\u041D\u0438\u0437\u043A\u043E\u043F\u043E\u043B\u044C\u043D\u044B\u0439 \u0442\u044F\u0433\u0430\u0447 \u0434\u043B\u044F \u0442\u044F\u0436\u0451\u043B\u043E\u0439 \u0441\u0446\u0435\u043F\u043A\u0438",desc:"\u041A\u0430\u0431\u0438\u043D\u0430 \u0441 \u043D\u0438\u0437\u043A\u0438\u043C \u0432\u0445\u043E\u0434\u043E\u043C \u0438 \u0440\u043E\u0432\u043D\u044B\u043C \u043F\u043E\u043B\u043E\u043C, \u043E\u0433\u0440\u043E\u043C\u043D\u043E\u0435 \u043B\u043E\u0431\u043E\u0432\u043E\u0435 \u0441\u0442\u0435\u043A\u043B\u043E \u0438 \u043E\u0431\u0437\u043E\u0440 \u043A\u0430\u043A \u0443 \u0430\u0432\u0442\u043E\u0431\u0443\u0441\u0430. \u0414\u043B\u044F \u0440\u0430\u0431\u043E\u0442\u044B \u0432 \u043F\u043E\u0440\u0442\u0443 \u0438 \u043D\u0430 \u043A\u043E\u043C\u0431\u0438\u043D\u0430\u0442\u0430\u0445.",style:"lowentry",roof:"bus",length:5.4,cabHeight:3,paint:ui.violet,accent:"#37a58c",chrome:!0,fenders:!0,deflectors:!1,sideSkirts:!0,wheel:{radius:.5,width:.4,style:"truck",rimColor:"#d2d6d8"},tags:["\u043D\u0438\u0437\u043A\u043E\u043F\u043E\u043B\u044C\u043D\u044B\u0439","\u043F\u043E\u0440\u0442","\u043F\u0430\u043D\u043E\u0440\u0430\u043C\u043D\u044B\u0439 \u043E\u0431\u0437\u043E\u0440"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","360 \u043B.\u0441."],["\u041A\u0440\u0443\u0442\u044F\u0449\u0438\u0439 \u043C\u043E\u043C\u0435\u043D\u0442","1 800 \u041D\xB7\u043C"],["\u041A\u043E\u0440\u043E\u0431\u043A\u0430 \u043F\u0435\u0440\u0435\u0434\u0430\u0447","6-\u0441\u0442. \u0430\u0432\u0442\u043E\u043C\u0430\u0442"],["\u041F\u0440\u0438\u0432\u043E\u0434","4\xD72"],["\u041F\u043E\u043B\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","19 000 \u043A\u0433"],["\u0411\u0430\u043A","600 \u043B"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","80 \u043A\u043C/\u0447"],["\u0426\u0435\u043D\u0430","7 100 000 \u20BD"]]},{id:"terra-worker",name:"TERRA Worker 8\xD74",brand:"TERRA",model:"Worker",tagline:"\u0422\u044F\u0436\u0451\u043B\u044B\u0439 \u043A\u0430\u0440\u044C\u0435\u0440\u043D\u044B\u0439 \u0442\u044F\u0433\u0430\u0447",desc:"\u0427\u0435\u0442\u044B\u0440\u0435 \u043E\u0441\u0438, \u0443\u0441\u0438\u043B\u0435\u043D\u043D\u0430\u044F \u0440\u0430\u043C\u0430, \u0441\u0442\u0430\u043B\u044C\u043D\u044B\u0435 \u0431\u0430\u043C\u043F\u0435\u0440\u044B \u0438 \u0437\u0430\u0449\u0438\u0442\u0430 \u0444\u0430\u0440. \u0421\u0435\u0440\u044C\u0451\u0437\u043D\u0430\u044F \u043C\u0430\u0448\u0438\u043D\u0430 \u0434\u043B\u044F \u0442\u044F\u0433\u0430\u0447\u0435\u0439-\u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C \u0438 \u043D\u0435\u0433\u0430\u0431\u0430\u0440\u0438\u0442\u0430.",style:"euro",roof:"high",length:8.4,cabHeight:3.6,paint:ui.black,accent:"#e07a1c",chrome:!1,fenders:!0,deflectors:!1,sideSkirts:!1,thirdAxle:!0,heavy:!0,wheel:{radius:.58,width:.5,style:"truck",rimColor:"#b9b4a6"},tags:["8\xD74","\u043A\u0430\u0440\u044C\u0435\u0440\u0430","\u0443\u0441\u0438\u043B\u0435\u043D\u043D\u0430\u044F \u0440\u0430\u043C\u0430"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","700 \u043B.\u0441."],["\u041A\u0440\u0443\u0442\u044F\u0449\u0438\u0439 \u043C\u043E\u043C\u0435\u043D\u0442","3 550 \u041D\xB7\u043C"],["\u041A\u043E\u0440\u043E\u0431\u043A\u0430 \u043F\u0435\u0440\u0435\u0434\u0430\u0447","16-\u0441\u0442. \u0430\u0432\u0442\u043E\u043C\u0430\u0442"],["\u041F\u0440\u0438\u0432\u043E\u0434","8\xD74"],["\u041F\u043E\u043B\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","41 000 \u043A\u0433"],["\u0411\u0430\u043A","1 100 \u043B"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","75 \u043A\u043C/\u0447"],["\u0426\u0435\u043D\u0430","17 900 000 \u20BD"]]},{id:"polaris-lite",name:"POLARIS Lite",brand:"POLARIS",model:"Lite",tagline:"\u041A\u043E\u043C\u043F\u0430\u043A\u0442\u043D\u044B\u0439 \u0442\u044F\u0433\u0430\u0447 \u0434\u043B\u044F \u0440\u0435\u0433\u0438\u043E\u043D\u0430\u043B\u043A\u0438",desc:"\u041A\u043E\u0440\u043E\u0442\u043A\u0430\u044F \u043A\u0430\u0431\u0438\u043D\u0430 \u0441 \u043E\u0434\u043D\u0438\u043C \u0441\u043F\u0430\u043B\u044C\u043D\u044B\u043C \u043C\u0435\u0441\u0442\u043E\u043C, \u043B\u0451\u0433\u043A\u0438\u0439 \u043A\u0443\u0437\u043E\u0432 \u0438 \u043C\u0430\u043B\u044B\u0439 \u0440\u0430\u0434\u0438\u0443\u0441 \u0440\u0430\u0437\u0432\u043E\u0440\u043E\u0442\u0430. \u0414\u043B\u044F \u0440\u0435\u0433\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0445 \u0440\u0435\u0439\u0441\u043E\u0432 \u043D\u0430 300\u2013500 \u043A\u043C.",style:"euro",roof:"low",length:5.2,cabHeight:3.2,paint:ui.red,accent:"#1f2933",chrome:!0,fenders:!0,deflectors:!0,sideSkirts:!0,wheel:{radius:.52,width:.4,style:"truck",rimColor:"#d5d8da"},tags:["\u0440\u0435\u0433\u0438\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0439","4\xD72","\u043A\u043E\u043C\u043F\u0430\u043A\u0442\u043D\u044B\u0439"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","380 \u043B.\u0441."],["\u041A\u0440\u0443\u0442\u044F\u0449\u0438\u0439 \u043C\u043E\u043C\u0435\u043D\u0442","1 750 \u041D\xB7\u043C"],["\u041A\u043E\u0440\u043E\u0431\u043A\u0430 \u043F\u0435\u0440\u0435\u0434\u0430\u0447","9-\u0441\u0442. \u0430\u0432\u0442\u043E\u043C\u0430\u0442"],["\u041F\u0440\u0438\u0432\u043E\u0434","4\xD72"],["\u041F\u043E\u043B\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","18 000 \u043A\u0433"],["\u0411\u0430\u043A","700 \u043B"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","89 \u043A\u043C/\u0447"],["\u0426\u0435\u043D\u0430","4 950 000 \u20BD"]]}],wo=[{id:"curtain",name:"\u0428\u0442\u043E\u0440\u043D\u044B\u0439 \u043F\u043E\u043B\u0443\u043F\u0440\u0438\u0446\u0435\u043F",brand:"TRAILGO",type:"curtain",length:13.6,width:2.55,height:2.75,color:"#cfd3d0",tagline:"\u0423\u043D\u0438\u0432\u0435\u0440\u0441\u0430\u043B \u0434\u043B\u044F \u043F\u0430\u043B\u043B\u0435\u0442 \u0438 \u043A\u043E\u0440\u043E\u0431\u043E\u043A",desc:"\u0411\u043E\u043A\u043E\u0432\u044B\u0435 \u0448\u0442\u043E\u0440\u044B \u043D\u0430 \u0440\u043E\u043B\u0438\u043A\u0430\u0445, \u0440\u0430\u0437\u0434\u0432\u0438\u0436\u043D\u0430\u044F \u043A\u0440\u044B\u0448\u0430 \u0438 33 \u0435\u0432\u0440\u043E\u043F\u0430\u043B\u043B\u0435\u0442\u044B \u0432\u043D\u0443\u0442\u0440\u0438. \u0421\u0430\u043C\u044B\u0439 \u0440\u0430\u0441\u043F\u0440\u043E\u0441\u0442\u0440\u0430\u043D\u0451\u043D\u043D\u044B\u0439 \u0442\u0438\u043F \u0432 \u0415\u0432\u0440\u043E\u043F\u0435.",tags:["\u0443\u043D\u0438\u0432\u0435\u0440\u0441\u0430\u043B\u044C\u043D\u044B\u0439","3 \u043E\u0441\u0438","33 \u043F\u0430\u043B\u043B\u0435\u0442\u044B"],specs:[["\u0414\u043B\u0438\u043D\u0430","13,6 \u043C"],["\u0412\u043D\u0443\u0442\u0440\u0435\u043D\u043D\u0438\u0439 \u043E\u0431\u044A\u0451\u043C","92 \u043C\xB3"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","24 000 \u043A\u0433"],["\u041E\u0441\u0438","3"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","6 800 \u043A\u0433"],["\u0426\u0435\u043D\u0430","2 150 000 \u20BD"]]},{id:"van",name:"\u0418\u0437\u043E\u0442\u0435\u0440\u043C\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0444\u0443\u0440\u0433\u043E\u043D",brand:"TRAILGO",type:"van",length:13.6,width:2.55,height:2.8,color:"#e7e9e6",tagline:"\u0413\u0435\u0440\u043C\u0435\u0442\u0438\u0447\u043D\u044B\u0439 \u043A\u0443\u0437\u043E\u0432 \u0441 \u0436\u0451\u0441\u0442\u043A\u0438\u043C\u0438 \u0441\u0442\u0435\u043D\u043A\u0430\u043C\u0438",desc:"\u0426\u0435\u043B\u044C\u043D\u043E\u043C\u0435\u0442\u0430\u043B\u043B\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0444\u0443\u0440\u0433\u043E\u043D \u0441 \u0441\u044D\u043D\u0434\u0432\u0438\u0447-\u043F\u0430\u043D\u0435\u043B\u044F\u043C\u0438. \u0414\u0435\u0440\u0436\u0438\u0442 \u0442\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u0443 \u0438 \u0437\u0430\u0449\u0438\u0449\u0430\u0435\u0442 \u0433\u0440\u0443\u0437 \u043E\u0442 \u0432\u043B\u0430\u0433\u0438.",tags:["\u0438\u0437\u043E\u0442\u0435\u0440\u043C\u0430","3 \u043E\u0441\u0438","\u0436\u0451\u0441\u0442\u043A\u0438\u0435 \u0441\u0442\u0435\u043D\u043A\u0438"],specs:[["\u0414\u043B\u0438\u043D\u0430","13,6 \u043C"],["\u0412\u043D\u0443\u0442\u0440\u0435\u043D\u043D\u0438\u0439 \u043E\u0431\u044A\u0451\u043C","96 \u043C\xB3"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","26 000 \u043A\u0433"],["\u041E\u0441\u0438","3"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","7 200 \u043A\u0433"],["\u0426\u0435\u043D\u0430","2 400 000 \u20BD"]]},{id:"reefer",name:"\u0420\u0435\u0444-\u043F\u043E\u043B\u0443\u043F\u0440\u0438\u0446\u0435\u043F",brand:"COLDFLOW",type:"reefer",length:13.4,width:2.55,height:2.7,color:"#eef0ec",tagline:"\u0425\u043E\u043B\u043E\u0434\u0438\u043B\u044C\u043D\u0438\u043A \u043D\u0430 \u043A\u043E\u043B\u0451\u0441\u0430\u0445",desc:"\u0420\u0435\u0444\u0440\u0438\u0436\u0435\u0440\u0430\u0442\u043E\u0440 \u0441 \u0434\u0438\u0437\u0435\u043B\u044C-\u0433\u0435\u043D\u0435\u0440\u0430\u0442\u043E\u0440\u043E\u043C \u043D\u0430 \u043F\u0435\u0440\u0435\u0434\u043D\u0435\u0439 \u0441\u0442\u0435\u043D\u043A\u0435: \u043E\u0442 \u221225 \xB0C \u0434\u043E +25 \xB0C. \u0414\u043B\u044F \u043F\u0440\u043E\u0434\u0443\u043A\u0442\u043E\u0432, \u043C\u0435\u0434\u0438\u043A\u0430\u043C\u0435\u043D\u0442\u043E\u0432 \u0438 \u0446\u0432\u0435\u0442\u043E\u0432.",tags:["\u0440\u0435\u0444","\u221225 \xB0C","3 \u043E\u0441\u0438"],specs:[["\u0414\u043B\u0438\u043D\u0430","13,4 \u043C"],["\u0412\u043D\u0443\u0442\u0440\u0435\u043D\u043D\u0438\u0439 \u043E\u0431\u044A\u0451\u043C","88 \u043C\xB3"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","22 000 \u043A\u0433"],["\u0422\u0435\u043C\u043F\u0435\u0440\u0430\u0442\u0443\u0440\u0430","\u221225\u2026+25 \xB0C"],["\u041E\u0441\u0438","3"],["\u0426\u0435\u043D\u0430","3 800 000 \u20BD"]]},{id:"flatbed",name:"\u0411\u043E\u0440\u0442\u043E\u0432\u0430\u044F \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430",brand:"STEELRIDE",type:"flatbed",length:13.6,width:2.48,height:0,color:"#9aa0a4",tagline:"\u041E\u0442\u043A\u0440\u044B\u0442\u0430\u044F \u043F\u043B\u043E\u0449\u0430\u0434\u043A\u0430 \u0441\u043E \u0441\u0442\u043E\u0439\u043A\u0430\u043C\u0438",desc:"\u0420\u043E\u0432\u043D\u044B\u0439 \u0441\u0442\u0430\u043B\u044C\u043D\u043E\u0439 \u043F\u043E\u043B, \u043E\u0442\u043A\u0438\u0434\u043D\u044B\u0435 \u0431\u043E\u0440\u0442\u0430 \u0438 \u043A\u043E\u043D\u0438\u043A\u0438 \u043F\u043E\u0434 \u0433\u0440\u0443\u0437. \u0414\u043B\u044F \u0441\u0442\u0440\u043E\u0439\u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B\u043E\u0432 \u0438 \u0442\u0435\u0445\u043D\u0438\u043A\u0438.",tags:["\u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430","3 \u043E\u0441\u0438","\u043E\u0442\u043A\u0440\u044B\u0442\u0430\u044F"],specs:[["\u0414\u043B\u0438\u043D\u0430","13,6 \u043C"],["\u041F\u043B\u043E\u0449\u0430\u0434\u044C \u043F\u043E\u043B\u0430","33,7 \u043C\xB2"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","30 000 \u043A\u0433"],["\u041E\u0441\u0438","3"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","6 200 \u043A\u0433"],["\u0426\u0435\u043D\u0430","1 650 000 \u20BD"]]},{id:"lowboy",name:"\u041D\u0438\u0437\u043A\u043E\u0440\u0430\u043C\u043D\u044B\u0439 \u0442\u0440\u0430\u043B",brand:"STEELRIDE",type:"lowboy",length:15.2,width:3,height:.9,color:"#2f363c",tagline:"\u0414\u043B\u044F \u0442\u0435\u0445\u043D\u0438\u043A\u0438, \u043A\u0440\u0430\u043D\u043E\u0432 \u0438 \u043D\u0435\u0433\u0430\u0431\u0430\u0440\u0438\u0442\u0430",desc:"\u0417\u0430\u043D\u0438\u0436\u0435\u043D\u043D\u0430\u044F \u043F\u043E\u0433\u0440\u0443\u0437\u043E\u0447\u043D\u0430\u044F \u043F\u043B\u043E\u0449\u0430\u0434\u043A\u0430, \u0432\u044B\u0434\u0432\u0438\u0436\u043D\u043E\u0439 \u0442\u0440\u0430\u043F \u0438 4 \u043E\u0441\u0438. \u041F\u0435\u0440\u0435\u0432\u043E\u0437\u0438\u0442 \u044D\u043A\u0441\u043A\u0430\u0432\u0430\u0442\u043E\u0440\u044B \u0438 \u0431\u0443\u0440\u043E\u0432\u044B\u0435 \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u0438.",tags:["\u0442\u0440\u0430\u043B","\u043D\u0435\u0433\u0430\u0431\u0430\u0440\u0438\u0442","4 \u043E\u0441\u0438"],specs:[["\u0414\u043B\u0438\u043D\u0430","15,2 \u043C"],["\u0412\u044B\u0441\u043E\u0442\u0430 \u043F\u043E\u043B\u0430","0,9 \u043C"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","48 000 \u043A\u0433"],["\u041E\u0441\u0438","4"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","14 500 \u043A\u0433"],["\u0426\u0435\u043D\u0430","5 100 000 \u20BD"]]},{id:"tanker",name:"\u0426\u0438\u0441\u0442\u0435\u0440\u043D\u0430 \u0434\u043B\u044F \u0436\u0438\u0434\u043A\u043E\u0441\u0442\u0435\u0439",brand:"AQUATEC",type:"tanker",length:13.2,width:2.5,height:3.1,color:"#dfe4e7",tagline:"\u0410\u043B\u044E\u043C\u0438\u043D\u0438\u0435\u0432\u0430\u044F \u0431\u043E\u0447\u043A\u0430 \u043D\u0430 33 000 \u043B",desc:"\u0422\u0440\u0438 \u0438\u0437\u043E\u043B\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0435 \u0441\u0435\u043A\u0446\u0438\u0438, \u043D\u0438\u0436\u043D\u0438\u0439 \u043D\u0430\u043B\u0438\u0432 \u0438 \u043F\u0430\u0440\u043E\u0432\u043E\u0439 \u043E\u0431\u043E\u0433\u0440\u0435\u0432. \u041F\u0438\u0449\u0435\u0432\u044B\u0435 \u0436\u0438\u0434\u043A\u043E\u0441\u0442\u0438, \u0442\u043E\u043F\u043B\u0438\u0432\u043E \u0438 \u0445\u0438\u043C\u0438\u044F.",tags:["\u0446\u0438\u0441\u0442\u0435\u0440\u043D\u0430","3 \u0441\u0435\u043A\u0446\u0438\u0438","\u043F\u0438\u0449\u0435\u0432\u0430\u044F"],specs:[["\u0414\u043B\u0438\u043D\u0430","13,2 \u043C"],["\u041E\u0431\u044A\u0451\u043C","33 000 \u043B"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","27 000 \u043A\u0433"],["\u041E\u0441\u0438","3"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","8 300 \u043A\u0433"],["\u0426\u0435\u043D\u0430","6 700 000 \u20BD"]]},{id:"silo",name:"\u0426\u0435\u043C\u0435\u043D\u0442\u043E\u0432\u043E\u0437-\u0441\u0438\u043B\u043E\u0441",brand:"BULKLINE",type:"silo",length:13,width:2.5,height:3.2,color:"#c9cdd0",tagline:"\u0421\u044B\u043F\u0443\u0447\u0438\u0435 \u0433\u0440\u0443\u0437\u044B \u043F\u043E\u0434 \u0434\u0430\u0432\u043B\u0435\u043D\u0438\u0435\u043C",desc:"\u0414\u0432\u0430 \u043A\u043E\u043D\u0438\u0447\u0435\u0441\u043A\u0438\u0445 \u0431\u0443\u043D\u043A\u0435\u0440\u0430, \u043A\u043E\u043C\u043F\u0440\u0435\u0441\u0441\u043E\u0440 \u0438 \u0430\u044D\u0440\u0430\u0446\u0438\u044F. \u0426\u0435\u043C\u0435\u043D\u0442, \u043C\u0443\u043A\u0430 \u0438 \u043C\u0438\u043D\u0435\u0440\u0430\u043B\u044C\u043D\u044B\u0439 \u043F\u043E\u0440\u043E\u0448\u043E\u043A \u0432\u044B\u0433\u0440\u0443\u0436\u0430\u044E\u0442\u0441\u044F \u0432\u043E\u0437\u0434\u0443\u0445\u043E\u043C.",tags:["\u0441\u044B\u043F\u0443\u0447\u0438\u0435","\u0430\u044D\u0440\u0430\u0446\u0438\u044F","\u043A\u043E\u043C\u043F\u0440\u0435\u0441\u0441\u043E\u0440"],specs:[["\u0414\u043B\u0438\u043D\u0430","13,0 \u043C"],["\u041E\u0431\u044A\u0451\u043C","38 \u043C\xB3"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","30 000 \u043A\u0433"],["\u041E\u0441\u0438","3"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","9 100 \u043A\u0433"],["\u0426\u0435\u043D\u0430","7 300 000 \u20BD"]]},{id:"tipper",name:"\u0421\u0430\u043C\u043E\u0441\u0432\u0430\u043B\u044C\u043D\u044B\u0439 \u043F\u043E\u043B\u0443\u043F\u0440\u0438\u0446\u0435\u043F",brand:"BULKLINE",type:"tipper",length:13.4,width:2.5,height:1.9,color:"#8f9498",tagline:"\u0420\u0430\u0437\u0433\u0440\u0443\u0437\u043A\u0430 \u043E\u043F\u0440\u043E\u043A\u0438\u0434\u044B\u0432\u0430\u043D\u0438\u0435\u043C",desc:"\u0421\u0442\u0430\u043B\u044C\u043D\u043E\u0439 \u043A\u043E\u0432\u0448 \u0441 \u0433\u0438\u0434\u0440\u043E\u0446\u0438\u043B\u0438\u043D\u0434\u0440\u043E\u043C, \u0437\u0430\u0434\u043D\u0438\u0439 \u0431\u043E\u0440\u0442 \u043D\u0430 \u043F\u0435\u0442\u043B\u044F\u0445. \u0429\u0435\u0431\u0435\u043D\u044C, \u043F\u0435\u0441\u043E\u043A, \u0433\u0440\u0443\u043D\u0442 \u0438 \u0437\u0435\u0440\u043D\u043E.",tags:["\u0441\u0430\u043C\u043E\u0441\u0432\u0430\u043B","\u0433\u0438\u0434\u0440\u0430\u0432\u043B\u0438\u043A\u0430","\u0449\u0435\u0431\u0435\u043D\u044C"],specs:[["\u0414\u043B\u0438\u043D\u0430","13,4 \u043C"],["\u041E\u0431\u044A\u0451\u043C","34 \u043C\xB3"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","32 000 \u043A\u0433"],["\u041E\u0441\u0438","3"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","11 200 \u043A\u0433"],["\u0426\u0435\u043D\u0430","4 400 000 \u20BD"]]},{id:"livestock",name:"\u0421\u043A\u043E\u0442\u043E\u0432\u043E\u0437",brand:"FARMHAUL",type:"livestock",length:13.2,width:2.55,height:2.9,color:"#e4e6df",tagline:"\u0414\u0432\u0443\u0445\u044A\u044F\u0440\u0443\u0441\u043D\u044B\u0439, \u0441 \u0432\u0435\u043D\u0442\u0438\u043B\u044F\u0446\u0438\u0435\u0439",desc:"\u0412\u0435\u043D\u0442\u0438\u043B\u0438\u0440\u0443\u0435\u043C\u044B\u0435 \u0431\u043E\u0440\u0442\u0430, \u043F\u043E\u0438\u043B\u043A\u0438 \u0438 \u043F\u043E\u0434\u044A\u0451\u043C\u043D\u044B\u0439 \u043F\u043E\u043B. \u041F\u0435\u0440\u0435\u0432\u043E\u0437\u043A\u0430 \u0441\u043A\u043E\u0442\u0430 \u0441 \u0441\u043E\u0431\u043B\u044E\u0434\u0435\u043D\u0438\u0435\u043C \u043D\u043E\u0440\u043C \u043F\u043B\u043E\u0442\u043D\u043E\u0441\u0442\u0438.",tags:["\u0441\u043A\u043E\u0442","2 \u044F\u0440\u0443\u0441\u0430","\u0432\u0435\u043D\u0442\u0438\u043B\u044F\u0446\u0438\u044F"],specs:[["\u0414\u043B\u0438\u043D\u0430","13,2 \u043C"],["\u041F\u043B\u043E\u0449\u0430\u0434\u044C","33 \u043C\xB2"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","20 000 \u043A\u0433"],["\u041E\u0441\u0438","3"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","8 900 \u043A\u0433"],["\u0426\u0435\u043D\u0430","3 300 000 \u20BD"]]},{id:"logging",name:"\u041B\u0435\u0441\u043E\u0432\u043E\u0437",brand:"TIMBERLINE",type:"logging",length:14,width:2.5,height:0,color:"#586066",tagline:"\u041A\u043E\u043D\u0438\u043A\u0438 \u0438 \u0441\u0442\u043E\u0439\u043A\u0438 \u043F\u043E\u0434 \u0431\u0440\u0451\u0432\u043D\u0430",desc:"\u041A\u043E\u043C\u043F\u043B\u0435\u043A\u0442 \u043A\u043E\u043D\u0438\u043A\u043E\u0432 \u0441 \u0432\u0435\u0440\u0442\u0438\u043A\u0430\u043B\u044C\u043D\u044B\u043C\u0438 \u0441\u0442\u043E\u0439\u043A\u0430\u043C\u0438 \u0438 \u0446\u0435\u043F\u044F\u043C\u0438. \u0411\u0440\u0451\u0432\u043D\u0430 \u0443\u043A\u043B\u0430\u0434\u044B\u0432\u0430\u044E\u0442\u0441\u044F \u0448\u0442\u0430\u0431\u0435\u043B\u0435\u043C \u0438 \u043A\u0440\u0435\u043F\u044F\u0442\u0441\u044F \u0441\u0432\u0435\u0440\u0445\u0443.",tags:["\u043B\u0435\u0441","\u043A\u043E\u043D\u0438\u043A\u0438","\u0431\u0440\u0451\u0432\u043D\u0430"],specs:[["\u0414\u043B\u0438\u043D\u0430","14,0 \u043C"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","29 000 \u043A\u0433"],["\u041E\u0441\u0438","3"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","7 800 \u043A\u0433"],["\u0426\u0435\u043D\u0430","2 900 000 \u20BD"]]},{id:"container",name:"\u041A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440\u043D\u0430\u044F \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430",brand:"PORTLINE",type:"container",length:13.6,width:2.45,height:2.6,color:"#275b78",tagline:"\u041F\u043E\u0434 40-\u0444\u0443\u0442\u043E\u0432\u044B\u0439 \u043A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440",desc:"\u0424\u0438\u0442\u0438\u043D\u0433\u0438 \u0438 twist-lock \u0437\u0430\u043C\u043A\u0438, \u0443\u0441\u0438\u043B\u0435\u043D\u043D\u0430\u044F \u0440\u0430\u043C\u0430. \u0412\u043E\u0437\u0438\u0442 \u043E\u0434\u0438\u043D 40\u2032 \u0438\u043B\u0438 \u0434\u0432\u0430 20\u2032 \u043A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440\u0430.",tags:["\u043A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440","40 \u0444\u0443\u0442\u043E\u0432","\u043F\u043E\u0440\u0442"],specs:[["\u0414\u043B\u0438\u043D\u0430","13,6 \u043C"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","32 000 \u043A\u0433"],["\u041E\u0441\u0438","3"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","8 100 \u043A\u0433"],["\u0426\u0435\u043D\u0430","2 700 000 \u20BD"]]},{id:"carrier",name:"\u0410\u0432\u0442\u043E\u0432\u043E\u0437-\u043F\u043E\u043B\u0443\u043F\u0440\u0438\u0446\u0435\u043F",brand:"AUTOLINE",type:"carrier",length:13.8,width:2.55,height:4,color:"#3d4449",tagline:"\u0414\u0432\u0430 \u044F\u0440\u0443\u0441\u0430, \u0434\u043E 8 \u043C\u0430\u0448\u0438\u043D",desc:"\u0412\u0435\u0440\u0445\u043D\u044F\u044F \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430 \u043D\u0430 \u043F\u043E\u0434\u044A\u0451\u043C\u043D\u0438\u043A\u0430\u0445, \u0441\u0442\u044F\u0436\u043D\u044B\u0435 \u0440\u0435\u043C\u043D\u0438 \u043D\u0430 \u043A\u043E\u043B\u0451\u0441\u0430. \u041F\u0435\u0440\u0435\u0432\u043E\u0437\u0438\u0442 \u043B\u0435\u0433\u043A\u043E\u0432\u044B\u0435 \u0430\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u0438 \u0441 \u0437\u0430\u0432\u043E\u0434\u0430.",tags:["\u0430\u0432\u0442\u043E\u0432\u043E\u0437","2 \u044F\u0440\u0443\u0441\u0430","8 \u043C\u0430\u0448\u0438\u043D"],specs:[["\u0414\u043B\u0438\u043D\u0430","13,8 \u043C"],["\u041C\u0430\u0448\u0438\u043D","\u0434\u043E 8"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","21 000 \u043A\u0433"],["\u041E\u0441\u0438","3"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","10 500 \u043A\u0433"],["\u0426\u0435\u043D\u0430","4 900 000 \u20BD"]]},{id:"dolly",name:"\u041F\u0440\u0438\u0446\u0435\u043F-\u0440\u043E\u0441\u043F\u0443\u0441\u043A",brand:"TIMBERLINE",type:"dolly",length:9.5,width:2.45,height:0,color:"#6d7160",tagline:"\u0414\u043B\u0438\u043D\u043D\u043E\u043C\u0435\u0440 \u0434\u043B\u044F \u043B\u0435\u0441\u0430 \u0438 \u0442\u0440\u0443\u0431",desc:"\u0414\u044B\u0448\u043B\u043E \u0441 \u0448\u0430\u0440\u043D\u0438\u0440\u043E\u043C, \u043A\u043E\u043D\u0438\u043A\u0438 \u0438 \u0442\u0435\u043B\u0435\u0441\u043A\u043E\u043F\u0438\u0447\u0435\u0441\u043A\u0430\u044F \u0440\u0430\u043C\u0430. \u0421\u043E\u0431\u0438\u0440\u0430\u0435\u0442 \u0441\u0446\u0435\u043F\u043A\u0443 \u0438\u0437 \u0434\u0432\u0443\u0445 \u0437\u0432\u0435\u043D\u044C\u0435\u0432.",tags:["\u0440\u043E\u0441\u043F\u0443\u0441\u043A","\u0434\u043B\u0438\u043D\u043D\u043E\u043C\u0435\u0440","\u0442\u0440\u0443\u0431\u044B"],specs:[["\u0414\u043B\u0438\u043D\u0430","9,5 \u043C"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","22 000 \u043A\u0433"],["\u041E\u0441\u0438","2"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","4 200 \u043A\u0433"],["\u0426\u0435\u043D\u0430","1 250 000 \u20BD"]]},{id:"bdouble",name:"B-\u0434\u0432\u043E\u0439\u043D\u043E\u0439 \u043A\u043E\u043C\u043F\u043B\u0435\u043A\u0442",brand:"TRAILGO",type:"bdouble",length:15.5,width:2.5,height:2.7,color:"#d5d8d3",tagline:"\u0414\u0432\u0435 \u0441\u0435\u043A\u0446\u0438\u0438 \u043D\u0430 \u043E\u0434\u043D\u043E\u0439 \u0441\u0446\u0435\u043F\u043A\u0435",desc:"\u041F\u0435\u0440\u0435\u0434\u043D\u044F\u044F \u0438 \u0437\u0430\u0434\u043D\u044F\u044F \u0441\u0435\u043A\u0446\u0438\u0438 \u0441\u043E\u0435\u0434\u0438\u043D\u0435\u043D\u044B \u0431\u0430\u043B\u043A\u043E\u0439 \u0438 \u0434\u043E\u043F. \u0442\u0435\u043B\u0435\u0436\u043A\u043E\u0439. \u0414\u0430\u0451\u0442 +35 % \u043E\u0431\u044A\u0451\u043C\u0430 \u043D\u0430 \u0434\u0430\u043B\u044C\u043D\u0438\u0445 \u043C\u0430\u0440\u0448\u0440\u0443\u0442\u0430\u0445.",tags:["B-double","2 \u0441\u0435\u043A\u0446\u0438\u0438","\u0430\u0432\u0442\u043E\u043F\u043E\u0435\u0437\u0434"],specs:[["\u0414\u043B\u0438\u043D\u0430","15,5 \u043C"],["\u0412\u043D\u0443\u0442\u0440\u0435\u043D\u043D\u0438\u0439 \u043E\u0431\u044A\u0451\u043C","115 \u043C\xB3"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","34 000 \u043A\u0433"],["\u041E\u0441\u0438","5"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","13 000 \u043A\u0433"],["\u0426\u0435\u043D\u0430","5 600 000 \u20BD"]]},{id:"boat",name:"\u041B\u043E\u0434\u043E\u0447\u043D\u044B\u0439 \u043F\u0440\u0438\u0446\u0435\u043F",brand:"WATERTRAIL",type:"boat",length:8.2,width:2.4,height:2.2,color:"#9fb3bd",tagline:"\u041B\u043E\u0436\u0435 \u0441 \u0440\u043E\u043B\u0438\u043A\u0430\u043C\u0438 \u043F\u043E\u0434 \u043A\u043E\u0440\u043F\u0443\u0441 \u043A\u0430\u0442\u0435\u0440\u0430",desc:"\u0420\u043E\u043B\u0438\u043A\u043E\u0432\u043E\u0435 \u043B\u043E\u0436\u0435, \u043B\u0435\u0431\u0451\u0434\u043A\u0430 \u0438 \u0433\u0435\u0440\u043C\u0435\u0442\u0438\u0447\u043D\u044B\u0435 \u0444\u043E\u043D\u0430\u0440\u0438. \u041B\u043E\u0434\u043A\u0430 \u0441\u043F\u0443\u0441\u043A\u0430\u0435\u0442\u0441\u044F \u043F\u0440\u044F\u043C\u043E \u0432 \u0432\u043E\u0434\u0443 \u043D\u0430 \u0441\u043B\u0438\u043F\u0435.",tags:["\u043A\u0430\u0442\u0435\u0440","\u0440\u043E\u043B\u0438\u043A\u0438","\u0441\u043F\u0443\u0441\u043A \u043D\u0430 \u0432\u043E\u0434\u0443"],specs:[["\u0414\u043B\u0438\u043D\u0430","8,2 \u043C"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","3 500 \u043A\u0433"],["\u041E\u0441\u0438","2"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","1 200 \u043A\u0433"],["\u0426\u0435\u043D\u0430","890 000 \u20BD"]]},{id:"glass",name:"\u0421\u0442\u0435\u043A\u043B\u043E\u0432\u043E\u0437",brand:"CLEARLINE",type:"glass",length:12.5,width:2.5,height:3,color:"#4a5660",tagline:"\u0421\u0442\u043E\u0439\u043A\u0438-\xAB\u0433\u0440\u0435\u0431\u0451\u043D\u043A\u0438\xBB \u043F\u043E\u0434 \u0441\u0442\u0435\u043A\u043B\u043E",desc:"\u0412\u0435\u0440\u0442\u0438\u043A\u0430\u043B\u044C\u043D\u044B\u0435 A-\u043E\u0431\u0440\u0430\u0437\u043D\u044B\u0435 \u0441\u0442\u043E\u0439\u043A\u0438, \u0432\u043E\u0439\u043B\u043E\u0447\u043D\u044B\u0435 \u043F\u0440\u043E\u043A\u043B\u0430\u0434\u043A\u0438 \u0438 \u0440\u0435\u043C\u043D\u0438. \u041F\u0435\u0440\u0435\u0432\u043E\u0437\u043A\u0430 \u043B\u0438\u0441\u0442\u043E\u0432\u043E\u0433\u043E \u0441\u0442\u0435\u043A\u043B\u0430 \u0438 \u0437\u0435\u0440\u043A\u0430\u043B.",tags:["\u0441\u0442\u0435\u043A\u043B\u043E","A-\u0441\u0442\u043E\u0439\u043A\u0438","\u0445\u0440\u0443\u043F\u043A\u043E\u0435"],specs:[["\u0414\u043B\u0438\u043D\u0430","12,5 \u043C"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","18 000 \u043A\u0433"],["\u041E\u0441\u0438","3"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","6 900 \u043A\u0433"],["\u0426\u0435\u043D\u0430","2 100 000 \u20BD"]]},{id:"adr",name:"\u0426\u0438\u0441\u0442\u0435\u0440\u043D\u0430 ADR",brand:"AQUATEC",type:"adr",length:13.2,width:2.5,height:3.15,color:"#e5e7e2",tagline:"\u041E\u043F\u0430\u0441\u043D\u044B\u0435 \u0433\u0440\u0443\u0437\u044B \u0441 \u043F\u043E\u043B\u043D\u043E\u0439 \u043C\u0430\u0440\u043A\u0438\u0440\u043E\u0432\u043A\u043E\u0439",desc:"\u0414\u0432\u043E\u0439\u043D\u044B\u0435 \u0441\u0442\u0435\u043D\u043A\u0438, \u0437\u043D\u0430\u043A\u0438 \u043E\u043F\u0430\u0441\u043D\u043E\u0441\u0442\u0438 \u0438 \u0437\u0430\u0437\u0435\u043C\u043B\u0435\u043D\u0438\u0435. \u0425\u0438\u043C\u0438\u044F, \u043A\u0438\u0441\u043B\u043E\u0442\u044B \u0438 \u0441\u0436\u0438\u0436\u0435\u043D\u043D\u044B\u0435 \u0433\u0430\u0437\u044B \u043F\u043E \u043D\u043E\u0440\u043C\u0430\u043C ADR.",tags:["ADR","\u043E\u043F\u0430\u0441\u043D\u044B\u0439 \u0433\u0440\u0443\u0437","\u0434\u0432\u043E\u0439\u043D\u044B\u0435 \u0441\u0442\u0435\u043D\u043A\u0438"],specs:[["\u0414\u043B\u0438\u043D\u0430","13,2 \u043C"],["\u041E\u0431\u044A\u0451\u043C","30 000 \u043B"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","25 000 \u043A\u0433"],["\u041E\u0441\u0438","3"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","9 600 \u043A\u0433"],["\u0426\u0435\u043D\u0430","8 200 000 \u20BD"]]},{id:"crane",name:"\u041F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430 \u0441 \u043A\u0440\u0430\u043D\u043E\u043C",brand:"STEELRIDE",type:"crane",length:13,width:2.5,height:1.1,color:"#8e9397",tagline:"\u0421\u0430\u043C\u043E\u043F\u043E\u0433\u0440\u0443\u0437\u043A\u0430 \u0432 \u043E\u0434\u043D\u0443 \u043C\u0430\u0448\u0438\u043D\u0443",desc:"\u041A\u0440\u0430\u043D-\u043C\u0430\u043D\u0438\u043F\u0443\u043B\u044F\u0442\u043E\u0440 \u0441 \u0432\u044B\u043B\u0435\u0442\u043E\u043C 8 \u043C \u0438 \u0433\u0438\u0434\u0440\u0430\u0432\u043B\u0438\u0447\u0435\u0441\u043A\u0438\u043C\u0438 \u043E\u043F\u043E\u0440\u0430\u043C\u0438. \u0421\u0430\u043C \u0433\u0440\u0443\u0437\u0438\u0442 \u0438 \u0432\u044B\u0433\u0440\u0443\u0436\u0430\u0435\u0442 \u043F\u0430\u043B\u043B\u0435\u0442\u044B \u0438 \u0431\u043B\u043E\u043A\u0438.",tags:["\u043A\u0440\u0430\u043D","\u0441\u0430\u043C\u043E\u043F\u043E\u0433\u0440\u0443\u0437\u043A\u0430","8 \u043C"],specs:[["\u0414\u043B\u0438\u043D\u0430","13,0 \u043C"],["\u0412\u044B\u043B\u0435\u0442 \u0441\u0442\u0440\u0435\u043B\u044B","8,0 \u043C"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","24 000 \u043A\u0433"],["\u041E\u0441\u0438","3"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","12 800 \u043A\u0433"],["\u0426\u0435\u043D\u0430","9 400 000 \u20BD"]]},{id:"sidetip",name:"\u041F\u043E\u043B\u0443\u043F\u0440\u0438\u0446\u0435\u043F-\u0441\u0430\u043C\u043E\u0441\u0432\u0430\u043B \u0432 \u0441\u0442\u043E\u0440\u043E\u043D\u0443",brand:"BULKLINE",type:"sidetip",length:12.8,width:2.5,height:1.8,color:"#6f7b82",tagline:"\u0421\u0432\u0430\u043B\u0438\u0432\u0430\u0435\u0442 \u0433\u0440\u0443\u0437 \u0432\u0431\u043E\u043A \u043D\u0430 \u043E\u0431\u043E\u0447\u0438\u043D\u0443",desc:"\u0411\u043E\u043A\u043E\u0432\u043E\u0435 \u043E\u043F\u0440\u043E\u043A\u0438\u0434\u044B\u0432\u0430\u043D\u0438\u0435 \u0431\u0435\u0437 \u0437\u0430\u0435\u0437\u0434\u0430 \u043D\u0430 \u044D\u0441\u0442\u0430\u043A\u0430\u0434\u0443. \u0423\u0434\u043E\u0431\u043D\u043E \u043D\u0430 \u0443\u0437\u043A\u0438\u0445 \u0441\u0442\u0440\u043E\u0439\u043F\u043B\u043E\u0449\u0430\u0434\u043A\u0430\u0445.",tags:["\u0431\u043E\u043A\u043E\u0432\u043E\u0439 \u0441\u0432\u0430\u043B","\u0441\u0442\u0440\u043E\u0439\u043A\u0430","3 \u043E\u0441\u0438"],specs:[["\u0414\u043B\u0438\u043D\u0430","12,8 \u043C"],["\u041E\u0431\u044A\u0451\u043C","30 \u043C\xB3"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","30 000 \u043A\u0433"],["\u041E\u0441\u0438","3"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","10 900 \u043A\u0433"],["\u0426\u0435\u043D\u0430","4 800 000 \u20BD"]]},{id:"refcontainer",name:"\u0420\u0435\u0444-\u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430 \u0441 \u043A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440\u043E\u043C",brand:"COLDFLOW",type:"refcontainer",length:13.6,width:2.45,height:2.9,color:"#e8ebe6",tagline:"40-\u0444\u0443\u0442\u043E\u0432\u044B\u0439 \u0440\u0435\u0444-\u043A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440 \u043D\u0430 \u0437\u0430\u043C\u043A\u0430\u0445",desc:"\u0422\u0435\u0440\u043C\u043E\u0438\u0437\u043E\u043B\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439 \u043A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440 \u0441 \u0445\u043E\u043B\u043E\u0434\u0438\u043B\u044C\u043D\u043E\u0439 \u0443\u0441\u0442\u0430\u043D\u043E\u0432\u043A\u043E\u0439 \u043A\u0440\u0435\u043F\u0438\u0442\u0441\u044F \u043A \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0435 twist-lock \u0437\u0430\u043C\u043A\u0430\u043C\u0438.",tags:["\u0440\u0435\u0444-\u043A\u043E\u043D\u0442\u0435\u0439\u043D\u0435\u0440","\u043A\u043E\u043C\u0431\u0438\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u043D\u044B\u0439","40 \u0444\u0443\u0442\u043E\u0432"],specs:[["\u0414\u043B\u0438\u043D\u0430","13,6 \u043C"],["\u041E\u0431\u044A\u0451\u043C","76 \u043C\xB3"],["\u0413\u0440\u0443\u0437\u043E\u043F\u043E\u0434\u044A\u0451\u043C\u043D\u043E\u0441\u0442\u044C","26 000 \u043A\u0433"],["\u041E\u0441\u0438","3"],["\u0421\u043E\u0431\u0441\u0442\u0432\u0435\u043D\u043D\u0430\u044F \u043C\u0430\u0441\u0441\u0430","9 300 \u043A\u0433"],["\u0426\u0435\u043D\u0430","6 100 000 \u20BD"]]}],Ao=[{id:"sedan",name:"Aster S",brand:"ASTER",model:"S",style:"sedan",tagline:"\u041A\u043B\u0430\u0441\u0441\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0433\u043E\u0440\u043E\u0434\u0441\u043A\u043E\u0439 \u0441\u0435\u0434\u0430\u043D",desc:"\u041F\u0440\u043E\u0441\u0442\u043E\u0440\u043D\u044B\u0439 \u0441\u0430\u043B\u043E\u043D, \u0431\u0430\u0433\u0430\u0436\u043D\u0438\u043A \u043D\u0430 480 \u043B \u0438 \u043C\u044F\u0433\u043A\u0430\u044F \u043F\u043E\u0434\u0432\u0435\u0441\u043A\u0430. \u0423\u043D\u0438\u0432\u0435\u0440\u0441\u0430\u043B\u044C\u043D\u044B\u0439 \u0430\u0432\u0442\u043E\u043C\u043E\u0431\u0438\u043B\u044C \u043D\u0430 \u043A\u0430\u0436\u0434\u044B\u0439 \u0434\u0435\u043D\u044C.",paint:"#2f5d8a",accent:"#d8d5c8",length:4.78,width:1.84,height:1.44,wheelbase:2.82,wheelRadius:.33,wheelWidth:.23,seats:5,tags:["\u0441\u0435\u0434\u0430\u043D","\u043F\u0435\u0440\u0435\u0434\u043D\u0438\u0439 \u043F\u0440\u0438\u0432\u043E\u0434","5 \u043C\u0435\u0441\u0442"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","190 \u043B.\u0441."],["0\u2013100 \u043A\u043C/\u0447","8,4 \u0441"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","225 \u043A\u043C/\u0447"],["\u041F\u0440\u0438\u0432\u043E\u0434","\u043F\u0435\u0440\u0435\u0434\u043D\u0438\u0439"],["\u0420\u0430\u0441\u0445\u043E\u0434","6,7 \u043B/100 \u043A\u043C"],["\u041C\u0430\u0441\u0441\u0430","1 560 \u043A\u0433"],["\u0426\u0435\u043D\u0430","2 890 000 \u20BD"]]},{id:"wagon",name:"Aster SW",brand:"ASTER",model:"SW",style:"wagon",tagline:"\u041F\u0440\u0430\u043A\u0442\u0438\u0447\u043D\u044B\u0439 \u0443\u043D\u0438\u0432\u0435\u0440\u0441\u0430\u043B \u0441 \u0431\u043E\u043B\u044C\u0448\u0438\u043C \u0431\u0430\u0433\u0430\u0436\u043D\u0438\u043A\u043E\u043C",desc:"\u0422\u0430 \u0436\u0435 \u043F\u043B\u0430\u0442\u0444\u043E\u0440\u043C\u0430, \u0447\u0442\u043E \u0443 \u0441\u0435\u0434\u0430\u043D\u0430, \u043D\u043E \u0441 \u043A\u0440\u044B\u0448\u0435\u0439 \u0434\u043E \u043A\u043E\u0440\u043C\u044B. \u0414\u043B\u044F \u0441\u0435\u043C\u044C\u0438, \u0441\u043E\u0431\u0430\u043A \u0438 \u0432\u0435\u043B\u043E\u0441\u0438\u043F\u0435\u0434\u043E\u0432.",paint:"#6b3f2a",accent:"#c9c2ae",length:4.86,width:1.85,height:1.5,wheelbase:2.82,wheelRadius:.34,wheelWidth:.235,seats:5,tags:["\u0443\u043D\u0438\u0432\u0435\u0440\u0441\u0430\u043B","\u043F\u043E\u043B\u043D\u044B\u0439 \u043F\u0440\u0438\u0432\u043E\u0434","5 \u043C\u0435\u0441\u0442"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","220 \u043B.\u0441."],["0\u2013100 \u043A\u043C/\u0447","7,6 \u0441"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","230 \u043A\u043C/\u0447"],["\u041F\u0440\u0438\u0432\u043E\u0434","\u043F\u043E\u043B\u043D\u044B\u0439"],["\u0420\u0430\u0441\u0445\u043E\u0434","7,4 \u043B/100 \u043A\u043C"],["\u041C\u0430\u0441\u0441\u0430","1 720 \u043A\u0433"],["\u0426\u0435\u043D\u0430","3 190 000 \u20BD"]]},{id:"hatch",name:"Vela City",brand:"VELA",model:"City",style:"hatch",tagline:"\u041A\u043E\u043C\u043F\u0430\u043A\u0442\u043D\u044B\u0439 \u0445\u044D\u0442\u0447\u0431\u0435\u043A \u0434\u043B\u044F \u043F\u0430\u0440\u043A\u043E\u0432\u043A\u0438 \u0432 \u0446\u0435\u043D\u0442\u0440\u0435",desc:"\u041A\u043E\u0440\u043E\u0442\u043A\u0438\u0439 \u0441\u0432\u0435\u0441, \u0432\u044B\u0441\u043E\u043A\u0430\u044F \u043F\u043E\u0441\u0430\u0434\u043A\u0430 \u0438 \u0440\u0430\u0437\u0432\u043E\u0440\u043E\u0442 \u0437\u0430 9,8 \u043C. \u0411\u0435\u043D\u0437\u0438\u043D\u043E\u0432\u044B\u0439 \u0442\u0443\u0440\u0431\u043E\u043C\u043E\u0442\u043E\u0440 1,4 \u043B.",paint:"#c9402f",accent:"#2b2f33",length:4.02,width:1.76,height:1.48,wheelbase:2.58,wheelRadius:.31,wheelWidth:.21,seats:5,tags:["\u0445\u044D\u0442\u0447\u0431\u0435\u043A","\u043F\u0435\u0440\u0435\u0434\u043D\u0438\u0439 \u043F\u0440\u0438\u0432\u043E\u0434","\u043A\u043E\u043C\u043F\u0430\u043A\u0442"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","135 \u043B.\u0441."],["0\u2013100 \u043A\u043C/\u0447","9,3 \u0441"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","205 \u043A\u043C/\u0447"],["\u041F\u0440\u0438\u0432\u043E\u0434","\u043F\u0435\u0440\u0435\u0434\u043D\u0438\u0439"],["\u0420\u0430\u0441\u0445\u043E\u0434","5,8 \u043B/100 \u043A\u043C"],["\u041C\u0430\u0441\u0441\u0430","1 240 \u043A\u0433"],["\u0426\u0435\u043D\u0430","1 890 000 \u20BD"]]},{id:"suv",name:"Terra Rover 4\xD74",brand:"TERRA",model:"Rover",style:"suv",tagline:"\u0411\u043E\u043B\u044C\u0448\u043E\u0439 \u043F\u043E\u043B\u043D\u043E\u043F\u0440\u0438\u0432\u043E\u0434\u043D\u044B\u0439 \u0432\u043D\u0435\u0434\u043E\u0440\u043E\u0436\u043D\u0438\u043A",desc:"\u041A\u043B\u0438\u0440\u0435\u043D\u0441 220 \u043C\u043C, \u0431\u043B\u043E\u043A\u0438\u0440\u043E\u0432\u043A\u0430 \u0437\u0430\u0434\u043D\u0435\u0433\u043E \u0434\u0438\u0444\u0444\u0435\u0440\u0435\u043D\u0446\u0438\u0430\u043B\u0430 \u0438 7 \u043C\u0435\u0441\u0442. \u0414\u043B\u044F \u0434\u0430\u0447\u0438, \u043E\u0445\u043E\u0442\u044B \u0438 \u043F\u043B\u043E\u0445\u0438\u0445 \u0434\u043E\u0440\u043E\u0433.",paint:"#4f5844",accent:"#1c1f1e",length:4.92,width:1.96,height:1.82,wheelbase:2.9,wheelRadius:.4,wheelWidth:.28,seats:7,tags:["\u0432\u043D\u0435\u0434\u043E\u0440\u043E\u0436\u043D\u0438\u043A","4\xD74","7 \u043C\u0435\u0441\u0442"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","265 \u043B.\u0441."],["0\u2013100 \u043A\u043C/\u0447","8,9 \u0441"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","210 \u043A\u043C/\u0447"],["\u041F\u0440\u0438\u0432\u043E\u0434","\u043F\u043E\u043B\u043D\u044B\u0439"],["\u0420\u0430\u0441\u0445\u043E\u0434","10,2 \u043B/100 \u043A\u043C"],["\u041C\u0430\u0441\u0441\u0430","2 160 \u043A\u0433"],["\u0426\u0435\u043D\u0430","4 750 000 \u20BD"]]},{id:"coupe",name:"Vela Coup\xE9",brand:"VELA",model:"Coup\xE9",style:"coupe",tagline:"\u041D\u0438\u0437\u043A\u0438\u0439 \u0434\u0432\u0443\u0445\u0434\u0432\u0435\u0440\u043D\u044B\u0439 \u0445\u0430\u0440\u0430\u043A\u0442\u0435\u0440",desc:"\u0421\u043F\u043E\u0439\u043B\u0435\u0440, \u0441\u043F\u043E\u0440\u0442\u0438\u0432\u043D\u044B\u0435 \u0441\u0438\u0434\u0435\u043D\u044C\u044F \u0438 2,0-\u043B\u0438\u0442\u0440\u043E\u0432\u044B\u0439 \u0442\u0443\u0440\u0431\u043E\u043C\u043E\u0442\u043E\u0440. \u0412\u0442\u043E\u0440\u043E\u0439 \u0440\u044F\u0434 \u2014 \u0434\u043B\u044F \u0432\u0435\u0449\u0435\u0439, \u0430 \u043D\u0435 \u0434\u043B\u044F \u043B\u044E\u0434\u0435\u0439.",paint:"#a3141c",accent:"#141719",length:4.62,width:1.9,height:1.32,wheelbase:2.74,wheelRadius:.35,wheelWidth:.26,seats:4,tags:["\u043A\u0443\u043F\u0435","\u0437\u0430\u0434\u043D\u0438\u0439 \u043F\u0440\u0438\u0432\u043E\u0434","2 \u0434\u0432\u0435\u0440\u0438"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","330 \u043B.\u0441."],["0\u2013100 \u043A\u043C/\u0447","5,1 \u0441"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","265 \u043A\u043C/\u0447"],["\u041F\u0440\u0438\u0432\u043E\u0434","\u0437\u0430\u0434\u043D\u0438\u0439"],["\u0420\u0430\u0441\u0445\u043E\u0434","8,9 \u043B/100 \u043A\u043C"],["\u041C\u0430\u0441\u0441\u0430","1 590 \u043A\u0433"],["\u0426\u0435\u043D\u0430","5 600 000 \u20BD"]]},{id:"pickup",name:"Terra Hauler",brand:"TERRA",model:"Hauler",style:"pickup",tagline:"\u041F\u0438\u043A\u0430\u043F \u0441 \u043A\u0443\u0437\u043E\u0432\u043E\u043C \u0438 \u0440\u0430\u043C\u043E\u0439",desc:"\u041A\u0443\u0437\u043E\u0432 1,5 \u043C \u0441 \u043A\u0440\u044B\u0448\u043A\u043E\u0439, \u043F\u0440\u0438\u0446\u0435\u043F \u0434\u043E 3,5 \u0442 \u0438 \u043F\u043E\u043D\u0438\u0436\u0430\u044E\u0449\u0430\u044F \u043F\u0435\u0440\u0435\u0434\u0430\u0447\u0430. \u0420\u0430\u0431\u043E\u0447\u0438\u0439 \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442 \u0438 \u0441\u0435\u043C\u0435\u0439\u043D\u0430\u044F \u043C\u0430\u0448\u0438\u043D\u0430.",paint:"#1d5b73",accent:"#c9c9c0",length:5.34,width:1.98,height:1.88,wheelbase:3.22,wheelRadius:.41,wheelWidth:.29,seats:5,tags:["\u043F\u0438\u043A\u0430\u043F","4\xD74","\u043F\u0440\u0438\u0446\u0435\u043F 3,5 \u0442"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","250 \u043B.\u0441."],["0\u2013100 \u043A\u043C/\u0447","9,1 \u0441"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","195 \u043A\u043C/\u0447"],["\u041F\u0440\u0438\u0432\u043E\u0434","\u043F\u043E\u043B\u043D\u044B\u0439"],["\u0420\u0430\u0441\u0445\u043E\u0434","11,5 \u043B/100 \u043A\u043C"],["\u041C\u0430\u0441\u0441\u0430","2 320 \u043A\u0433"],["\u0426\u0435\u043D\u0430","4 290 000 \u20BD"]]},{id:"van-life",name:"Kargo Vito Van",brand:"KARGO",model:"Vito",style:"van",tagline:"\u0426\u0435\u043B\u044C\u043D\u043E\u043C\u0435\u0442\u0430\u043B\u043B\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0444\u0443\u0440\u0433\u043E\u043D",desc:"\u0413\u0440\u0443\u0437\u043E\u0432\u043E\u0439 \u043E\u0442\u0441\u0435\u043A 6,5 \u043C\xB3, \u0441\u0434\u0432\u0438\u0436\u043D\u0430\u044F \u0434\u0432\u0435\u0440\u044C \u0438 \u043F\u0435\u0440\u0435\u0433\u043E\u0440\u043E\u0434\u043A\u0430. \u041A\u0443\u0440\u044C\u0435\u0440\u0441\u043A\u0438\u0439 \u0438 \u0441\u0435\u0440\u0432\u0438\u0441\u043D\u044B\u0439 \u0442\u0440\u0430\u043D\u0441\u043F\u043E\u0440\u0442.",paint:"#e6e8e3",accent:"#d94f2b",length:5.14,width:1.94,height:2.28,wheelbase:3.1,wheelRadius:.36,wheelWidth:.24,seats:3,tags:["\u0444\u0443\u0440\u0433\u043E\u043D","6,5 \u043C\xB3","\u043F\u0435\u0440\u0435\u0434\u043D\u0438\u0439 \u043F\u0440\u0438\u0432\u043E\u0434"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","150 \u043B.\u0441."],["0\u2013100 \u043A\u043C/\u0447","11,8 \u0441"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","175 \u043A\u043C/\u0447"],["\u041F\u0440\u0438\u0432\u043E\u0434","\u043F\u0435\u0440\u0435\u0434\u043D\u0438\u0439"],["\u0420\u0430\u0441\u0445\u043E\u0434","7,9 \u043B/100 \u043A\u043C"],["\u041C\u0430\u0441\u0441\u0430","1 980 \u043A\u0433"],["\u0426\u0435\u043D\u0430","3 450 000 \u20BD"]]},{id:"micro",name:"Vela Mini",brand:"VELA",model:"Mini",style:"micro",tagline:"\u041C\u0438\u043A\u0440\u043E\u043A\u0430\u0440 \u043D\u0430 4 \u043C\u0435\u0441\u0442\u0430",desc:"\u0414\u043B\u0438\u043D\u0430 \u0432\u0441\u0435\u0433\u043E 3,2 \u043C, \u0431\u0430\u0442\u0430\u0440\u0435\u044F \u043D\u0430 260 \u043A\u043C \u0438 \u043F\u0430\u0440\u043A\u043E\u0432\u043A\u0430 \u0432 \u043B\u044E\u0431\u0443\u044E \u0449\u0435\u043B\u044C. \u042D\u043B\u0435\u043A\u0442\u0440\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u0433\u043E\u0440\u043E\u0434\u0441\u043A\u043E\u0439 \u043C\u0430\u043B\u044B\u0448.",paint:"#e0b528",accent:"#24363f",length:3.2,width:1.58,height:1.56,wheelbase:2,wheelRadius:.27,wheelWidth:.17,seats:4,tags:["\u043C\u0438\u043A\u0440\u043E\u043A\u0430\u0440","\u044D\u043B\u0435\u043A\u0442\u0440\u043E","260 \u043A\u043C"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","75 \u043B.\u0441."],["0\u2013100 \u043A\u043C/\u0447","12,5 \u0441"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","130 \u043A\u043C/\u0447"],["\u041F\u0440\u0438\u0432\u043E\u0434","\u0437\u0430\u0434\u043D\u0438\u0439"],["\u0411\u0430\u0442\u0430\u0440\u0435\u044F","32 \u043A\u0412\u0442\xB7\u0447"],["\u0417\u0430\u043F\u0430\u0441 \u0445\u043E\u0434\u0430","260 \u043A\u043C"],["\u0426\u0435\u043D\u0430","1 590 000 \u20BD"]]},{id:"crossover",name:"Aster Cross",brand:"ASTER",model:"Cross",style:"crossover",tagline:"\u0413\u043E\u0440\u043E\u0434\u0441\u043A\u043E\u0439 \u043A\u0440\u043E\u0441\u0441\u043E\u0432\u0435\u0440 \u0441 \u0432\u044B\u0441\u043E\u043A\u0438\u043C \u043A\u043B\u0438\u0440\u0435\u043D\u0441\u043E\u043C",desc:"\u0421\u0440\u0435\u0434\u043D\u0438\u0439 \u0440\u0430\u0437\u043C\u0435\u0440, \u044D\u043A\u043E\u043D\u043E\u043C\u0438\u0447\u043D\u044B\u0439 \u0433\u0438\u0431\u0440\u0438\u0434 \u0438 \u043F\u043E\u043B\u043D\u044B\u0439 \u043F\u0440\u0438\u0432\u043E\u0434 \u043D\u0430 \u0437\u0430\u0434\u043D\u044E\u044E \u043E\u0441\u044C. \u041A\u043E\u043C\u043F\u0440\u043E\u043C\u0438\u0441\u0441 \u043C\u0435\u0436\u0434\u0443 \u0441\u0435\u0434\u0430\u043D\u043E\u043C \u0438 SUV.",paint:"#7a8086",accent:"#252a2e",length:4.6,width:1.87,height:1.66,wheelbase:2.77,wheelRadius:.36,wheelWidth:.25,seats:5,tags:["\u043A\u0440\u043E\u0441\u0441\u043E\u0432\u0435\u0440","\u0433\u0438\u0431\u0440\u0438\u0434","5 \u043C\u0435\u0441\u0442"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","215 \u043B.\u0441."],["0\u2013100 \u043A\u043C/\u0447","8,1 \u0441"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","215 \u043A\u043C/\u0447"],["\u041F\u0440\u0438\u0432\u043E\u0434","\u043F\u043E\u043B\u043D\u044B\u0439"],["\u0420\u0430\u0441\u0445\u043E\u0434","5,4 \u043B/100 \u043A\u043C"],["\u041C\u0430\u0441\u0441\u0430","1 830 \u043A\u0433"],["\u0426\u0435\u043D\u0430","3 760 000 \u20BD"]]},{id:"sport",name:"Vela RS",brand:"VELA",model:"RS",style:"sport",tagline:"\u0422\u0440\u0435\u043A\u043E\u0432\u044B\u0439 \u0441\u043F\u043E\u0440\u0442\u043A\u0430\u0440 \u0441 V8",desc:"\u041A\u0430\u0440\u0431\u043E\u043D\u043E\u0432\u044B\u0435 \u0434\u0435\u0442\u0430\u043B\u0438, \u0430\u043A\u0442\u0438\u0432\u043D\u043E\u0435 \u0430\u043D\u0442\u0438\u043A\u0440\u044B\u043B\u043E \u0438 4,0-\u043B\u0438\u0442\u0440\u043E\u0432\u044B\u0439 V8. 3,2 \u0441 \u0434\u043E \u0441\u043E\u0442\u043D\u0438 \u0438 \u043D\u0430\u0441\u0442\u043E\u044F\u0449\u0438\u0439 \u0440\u0451\u0432.",paint:"#e08a16",accent:"#101214",length:4.58,width:2.02,height:1.22,wheelbase:2.66,wheelRadius:.36,wheelWidth:.31,seats:2,tags:["\u0441\u043F\u043E\u0440\u0442\u043A\u0430\u0440","V8","3,2 \u0441"],specs:[["\u041C\u043E\u0449\u043D\u043E\u0441\u0442\u044C","620 \u043B.\u0441."],["0\u2013100 \u043A\u043C/\u0447","3,2 \u0441"],["\u041C\u0430\u043A\u0441. \u0441\u043A\u043E\u0440\u043E\u0441\u0442\u044C","318 \u043A\u043C/\u0447"],["\u041F\u0440\u0438\u0432\u043E\u0434","\u0437\u0430\u0434\u043D\u0438\u0439"],["\u0420\u0430\u0441\u0445\u043E\u0434","13,8 \u043B/100 \u043A\u043C"],["\u041C\u0430\u0441\u0441\u0430","1 480 \u043A\u0433"],["\u0426\u0435\u043D\u0430","18 900 000 \u20BD"]]}];for(let i of To)i.category="trucks";for(let i of wo)i.category="trailers";for(let i of Ao)i.category="cars";function sf(i,t){let e=i==="trucks"?To:i==="trailers"?wo:Ao;return e.find(n=>n.id===t)||e[0]}var St=i=>document.getElementById(i),Ti={trucks:To,trailers:wo,cars:Ao},Ey=Object.fromEntries(nf.map(i=>[i.id,i])),Ty=["#e9ecec","#b9c0c6","#2f5d8a","#16233f","#a4241d","#7d1a2e","#cf5a13","#e0b528","#1f6b45","#37a58c","#0f6b70","#4b3c85","#6d2a6b","#7a3b2a","#5a3c25","#c2a878","#2f353b","#101214"],hf="garage3d-showroom-v1",uf={exterior:"\u{1F310}",side:"\u25E7",rear:"\u25A3",front:"\u25CD",driver:"\u{1F9D1}\u200D\u2708\uFE0F",passenger:"\u{1FA91}",salon:"\u{1F698}",bunk:"\u{1F6CF}"},Ot={cat:"trucks",id:"atlas-vision",view:"exterior",preset:"studio",color:null,fav:[],favOnly:!1,autoRotate:!0,search:"",compare:null},Un={};try{Un=JSON.parse(localStorage.getItem(hf)||"{}")||{}}catch{Un={}}Un.cat&&Ti[Un.cat]&&(Ot.cat=Un.cat);Un.id&&(Ot.id=Un.id);Ot.fav=Array.isArray(Un.fav)?Un.fav:[];Ot.preset=Un.preset||"studio";var vr=Un.colors&&typeof Un.colors=="object"?Un.colors:{};function Lo(){try{localStorage.setItem(hf,JSON.stringify({cat:Ot.cat,id:Ot.id,fav:Ot.fav,preset:Ot.preset,colors:vr}))}catch{}}function hn(){return sf(Ot.cat,Ot.id)}var un,df=!0;function wy(){try{let i=document.createElement("canvas");return!!(i.getContext("webgl2")||i.getContext("webgl"))}catch{return!1}}try{if(!wy())throw new Error("WebGL context is not available");un=Wd(St("gl"))}catch(i){df=!1,un=Xd();let t=document.createElement("div");t.className="webgl-error",t.innerHTML="<b>3D \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u043E \u0432 \u044D\u0442\u043E\u043C \u0431\u0440\u0430\u0443\u0437\u0435\u0440\u0435</b><span>\u041D\u0435 \u0443\u0434\u0430\u043B\u043E\u0441\u044C \u0441\u043E\u0437\u0434\u0430\u0442\u044C WebGL-\u043A\u043E\u043D\u0442\u0435\u043A\u0441\u0442: \u0432\u043A\u043B\u044E\u0447\u0438\u0442\u0435 \u0430\u043F\u043F\u0430\u0440\u0430\u0442\u043D\u043E\u0435 \u0443\u0441\u043A\u043E\u0440\u0435\u043D\u0438\u0435. \u041A\u0430\u0442\u0430\u043B\u043E\u0433, \u0445\u0430\u0440\u0430\u043A\u0442\u0435\u0440\u0438\u0441\u0442\u0438\u043A\u0438 \u0438 \u0441\u043F\u0438\u0441\u043E\u043A \u0432\u0438\u0434\u043E\u0432 \u043D\u0438\u0436\u0435 \u0440\u0430\u0431\u043E\u0442\u0430\u044E\u0442 \u0438 \u0431\u0435\u0437 3D.</span>",St("viewport").appendChild(t),St("gl").classList.add("hidden"),console.warn("\u0413\u0410\u0420\u0410\u0416 3D: WebGL \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D, \u0432\u043A\u043B\u044E\u0447\u0451\u043D \u0440\u0435\u0436\u0438\u043C \u043A\u0430\u0442\u0430\u043B\u043E\u0433\u0430.",i)}var Uh=Hd(un.renderer),Wn=Ss(),Fe=new kl(un.camera,St("gl"),{touch:Wn.touch});typeof window!="undefined"&&(window.__garageCam=Fe);document.documentElement.classList.toggle("is-touch",Wn.touch);document.documentElement.classList.toggle("is-phone",Wn.phone);document.documentElement.classList.toggle("is-tablet",Wn.tablet);document.documentElement.classList.toggle("is-desktop",Wn.desktop);document.documentElement.classList.toggle("is-coarse",Wn.coarse);document.documentElement.classList.toggle("is-portrait",Wn.portrait);var Fh=()=>{let i=(window.innerHeight||0)>=(window.innerWidth||0);document.documentElement.classList.toggle("is-portrait",i),document.documentElement.classList.toggle("is-landscape",!i)};Fh();window.addEventListener("orientationchange",()=>setTimeout(Fh,120));window.addEventListener("resize",Fh);var br=un.scene,ke=null,di=new Map;function Oh(i){return`${i.category}:${i.id}`}function Be(i){if(Array.isArray(i.views)&&i.views.length)return i.views;let t=Oh(i);di.has(t)||Ry(i,Vl(i,Uh));let e=di.get(t);return i.views=e.views,i.anchors=e.anchors,i.views}function ff(i){let t=Oh(i),e=di.get(t);return e&&di.delete(t),e}var Ay=6;function Ry(i,t){let e=Oh(i);for(di.has(e)&&di.delete(e),di.set(e,t);di.size>Ay;){let[n,s]=di.entries().next().value;di.delete(n),s.root.traverse(r=>{var o,a;(a=(o=r.geometry)==null?void 0:o.dispose)==null||a.call(o)})}}var Xl=null,Nh=!1,Co=null,Qi=!0,Ae=i=>{let t=St("stage-live");t.textContent=i,t.classList.add("show"),clearTimeout(Ae.t),Ae.t=setTimeout(()=>t.classList.remove("show"),1800)};function Cy(){ke&&(br.remove(ke.root),ke.root.traverse(i=>{var t,e,n;if(i.geometry&&((e=(t=i.geometry).dispose)==null||e.call(t)),i.material){let s=Array.isArray(i.material)?i.material:[i.material];for(let r of s)r&&r.__shared!==!0&&((n=r.dispose)==null||n.call(r))}}),ke=null)}function Bh(i,{instant:t=!1,view:e=null}={}){Nh=!0,St("loader").classList.remove("hidden"),Cy(),setTimeout(()=>{var a,l;let n=ff(i)||Vl(i,Uh),s=vr[i.id]||i.paint;for(let c of n.paintMats)c&&c.color&&c.color.set(s);br.add(n.root),ke=n;let r=0;n.root.traverse(c=>{var h;if(c.isMesh&&c.geometry){let u=c.geometry,d=u.index?u.index.count:((h=u.attributes.position)==null?void 0:h.count)||0;r+=d/3}}),St("poly-badge").textContent=`${Math.round(r/1e3)}K \u043F\u043E\u043B\u0438\u0433\u043E\u043D\u043E\u0432`;let o=e||Be(i).find(c=>c.id===(t?"exterior":Ot.view))||Be(i)[0];if(Ot.view=o.id,Fe.controls.autoRotate=!!o.autoRotate&&Qi&&Ot.view==="exterior",Fe.setView(o,{instant:t}),gf(i),kh(i),St("mode-badge").textContent=mf(i,o),St("loader").classList.add("hidden"),Nh=!1,Zl(i),(a=St("compare-btn"))==null||a.classList.toggle("on",!!Ot.compare),(l=St("compare-btn-2"))==null||l.classList.toggle("active",!!Ot.compare),Xl){let c=Xl;Xl=null,Bh(c.unit,c.opts)}},60)}function Yl(i,t,{instant:e=!1}={}){Ot.cat=i,Ot.id=t,Lo();let n=hn();yr(),Zl(n),kh(n);let s=`${n.category==="trailers"?"trailer":n.category==="cars"?"car":"truck"}:${n.id}`;if(!ke||ke.root.name!==s){if(Nh){Xl={unit:n,opts:{instant:e}};return}Bh(n,{instant:e,view:Be(n)[0]})}}var pf={catalog:"panel-catalog",details:"panel-details"},Io=null;function rf(i){var n,s;let t=Io===i?null:i;Io=t;for(let[r,o]of Object.entries(pf)){let a=St(o);if(!a)continue;a.classList.toggle("open",r===t);let l=St(`${r}-toggle`);l&&l.setAttribute("aria-expanded",String(r===t))}(n=St("backdrop"))==null||n.classList.toggle("show",!!t);let e=St("light-pop");t&&e&&(e.classList.add("hidden"),(s=St("light-btn"))==null||s.setAttribute("aria-expanded","false")),t==="catalog"&&setTimeout(()=>{var r;return(r=St("search"))==null?void 0:r.focus({preventScroll:!0})},240)}function Po(){var t,e,n;if(!Io)return!1;let i=Io;Io=null;for(let[s,r]of Object.entries(pf))(t=St(r))==null||t.classList.toggle("open",!1),(e=St(`${s}-toggle`))==null||e.setAttribute("aria-expanded","false");return(n=St("backdrop"))==null||n.classList.remove("show"),!!i}function Py(i){return i.category==="trucks"?"\u{1F69B}":i.category==="cars"?i.style==="sport"?"\u{1F3CE}":i.style==="van"?"\u{1F690}":i.style==="pickup"?"\u{1F6FB}":"\u{1F697}":{tanker:"\u{1F6E2}",adr:"\u2623",silo:"\u{1F3D7}",tipper:"\u{1F6A7}",livestock:"\u{1F404}",logging:"\u{1F332}",container:"\u{1F9F1}",refcontainer:"\u2744",carrier:"\u{1F697}",bdouble:"\u{1F69A}",boat:"\u26F5",glass:"\u{1FA9F}",crane:"\u{1F3D7}",sidetip:"\u{1F69B}",dolly:"\u{1FAB5}",lowboy:"\u{1F9BE}",reefer:"\u2744",curtain:"\u{1F3AD}",van:"\u{1F4E6}",flatbed:"\u25AD"}[i.type]||"\u{1F4E6}"}function yr(){let i=St("unit-list"),t=Ot.search.trim().toLowerCase(),e=Ti[Ot.cat].filter(s=>Ot.favOnly&&!Ot.fav.includes(s.id)?!1:t?[s.name,s.brand,s.tagline,s.type,...s.tags||[],...(s.specs||[]).flat()].join(" ").toLowerCase().includes(t):!0);if(i.innerHTML="",St("cat-hint").textContent=Ey[Ot.cat].hint+(Ot.favOnly?" \xB7 \u0442\u043E\u043B\u044C\u043A\u043E \u0438\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0435":""),St("catalog-count").textContent=e.length,!e.length){i.innerHTML='<p class="mini" style="padding:14px">\u041D\u0438\u0447\u0435\u0433\u043E \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u043E. \u041E\u0447\u0438\u0441\u0442\u0438\u0442\u0435 \u043F\u043E\u0438\u0441\u043A \u0438\u043B\u0438 \u0438\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0435.</p>';return}e.forEach((s,r)=>{let o=document.createElement("button");o.className="unit"+(s.id===Ot.id&&s.category===Ot.cat?" active":""),o.setAttribute("role","option"),o.setAttribute("aria-selected",String(s.id===Ot.id));let a=vr[s.id]||s.color||s.paint||"#888";o.innerHTML=`
      <span class="thumb">${Py(s)}</span>
      <span>
        <span class="u-name"><i class="swatch" style="background:${a}"></i>${s.name}</span>
        <span class="u-sub">${s.tagline||""}</span>
      </span>
      <span class="u-idx">${String(Ti[Ot.cat].indexOf(s)+1).padStart(2,"0")}</span>
      ${Ot.fav.includes(s.id)?'<span class="fav-dot">\u2605</span>':""}
    `,o.onclick=()=>{var l;if(s.id===Ot.id&&s.category===Ot.cat){ql();return}Yl(Ot.cat,s.id),(window.innerWidth<=900||(l=window.matchMedia)!=null&&l.call(window,"(max-width: 900px)").matches)&&Po()},i.appendChild(o)});let n=i.querySelector(".unit.active");n&&typeof n.scrollIntoView=="function"&&n.scrollIntoView({block:"nearest"})}function Zl(i){St("d-brand").textContent=`${i.brand||"\u2014"} \xB7 2026`,St("d-name").textContent=i.name,St("d-cat").textContent=i.category==="trucks"?"\u0422\u042F\u0413\u0410\u0427":i.category==="trailers"?"\u041F\u0420\u0418\u0426\u0415\u041F":"\u0410\u0412\u0422\u041E\u041C\u041E\u0411\u0418\u041B\u042C",St("d-desc").textContent=i.desc||i.tagline||"",St("unit-kind").textContent=(i.category==="trucks"?"\u0422\u042F\u0413\u0410\u0427":i.category==="trailers"?"\u041F\u0420\u0418\u0426\u0415\u041F":"\u0410\u0412\u0422\u041E\u041C\u041E\u0411\u0418\u041B\u042C")+(i.meta?` \xB7 ${i.meta}`:""),St("unit-name").textContent=i.name,St("unit-tagline").textContent=i.tagline||"";let t=St("d-tags");t.innerHTML="";for(let l of i.tags||[]){let c=document.createElement("span");c.className="tag",c.textContent=l,t.appendChild(c)}let e=St("spec-grid");e.innerHTML="";for(let[l,c]of i.specs||[]){let h=document.createElement("div");h.className="spec",h.innerHTML=`<span>${l}</span><b>${c}</b>`,e.appendChild(h)}let n=St("paint-row");n.innerHTML="";let s=vr[i.id]||i.paint||i.color;[...new Set([i.paint||i.color||"#e9ecec",...Ty])].forEach(l=>{let c=document.createElement("button");c.className="paint-dot"+(l.toLowerCase()===String(s).toLowerCase()?" active":""),c.style.background=l,c.title=l,c.onclick=()=>Iy(i,l),n.appendChild(c)});let o=St("anchor-row");o.innerHTML="",ke&&ke.anchors?(St("anchor-count").textContent=ke.anchors.length,ke.anchors.forEach(l=>{let c=document.createElement("button");c.className="anchor-btn",c.textContent=l.label+(l.side?` (${l.side})`:""),c.onclick=()=>Dy(l),o.appendChild(c)})):St("anchor-count").textContent="0";let a=Ti[Ot.cat].findIndex(l=>l.id===i.id);St("counter").textContent=`${a+1} / ${Ti[Ot.cat].length}`}function Iy(i,t){if(vr[i.id]=t,Lo(),ke)for(let e of ke.paintMats)e!=null&&e.color&&e.color.set(t);yr(),Zl(i),Ae(`\u0426\u0432\u0435\u0442: ${t.toUpperCase()}`)}function kh(i){let t=St("dock-views");t.innerHTML="";let e=[{title:"\u0421\u041D\u0410\u0420\u0423\u0416\u0418",items:Be(i).filter(n=>n.group==="exterior")},{title:"\u0412\u041D\u0423\u0422\u0420\u0418",items:Be(i).filter(n=>n.group==="interior")}];for(let n of e){if(!n.items.length)continue;let s=document.createElement("span");s.className="eyebrow",s.textContent=n.title,t.appendChild(s);for(let r of n.items){let o=document.createElement("button");o.className="chip"+(r.id===Ot.view?" active":""),o.textContent=`${uf[r.id]||""} ${r.label}`.trim(),o.dataset.view=r.id,o.onclick=()=>Nn(r.id),t.appendChild(o)}}}function mf(i,t){return!t||t.group!=="interior"?"\u0421\u041D\u0410\u0420\u0423\u0416\u0418":t.id==="bunk"?"\u0421\u041F\u0410\u041B\u042C\u041D\u0418\u041A":i.category==="cars"?t.id==="salon"?"\u0418\u0417 \u0421\u0410\u041B\u041E\u041D\u0410":"\u0417\u0410 \u0420\u0423\u041B\u0401\u041C":t.id==="passenger"?"\u041C\u0415\u0421\u0422\u041E \u041F\u0410\u0421\u0421\u0410\u0416\u0418\u0420\u0410":"\u0412 \u041A\u0410\u0411\u0418\u041D\u0415"}function gf(i){let t=St("view-switch");t.innerHTML="";let e=["exterior","side","rear","front","driver","passenger","salon","bunk"];[...Be(i)].sort((s,r)=>e.indexOf(s.id)-e.indexOf(r.id)).forEach(s=>{let r=document.createElement("button");r.className="view-btn"+(s.group==="interior"?" interior":"")+(s.id===Ot.view?" active":""),r.dataset.view=s.id,r.innerHTML=`<span>${uf[s.id]||"\u{1F4F7}"}</span>${s.label}`,r.onclick=()=>Nn(s.id),t.appendChild(r)})}function Ly(){let i=St("navpad");if(!i)return;let t={up:()=>Fe.orbit(0,.075),down:()=>Fe.orbit(0,-.075),left:()=>Fe.orbit(-.1,0),right:()=>Fe.orbit(.1,0),zin:()=>Fe.zoomBy(1.05),zout:()=>Fe.zoomBy(1/1.05),reset:()=>{let e=hn();Nn(Be(e)[0].id),Ae("\u0412\u0438\u0434 \u0441\u0431\u0440\u043E\u0448\u0435\u043D")}};i.querySelectorAll("[data-act]").forEach(e=>{let n=t[e.dataset.act];if(!n)return;let s=null,r=null,o=()=>{s&&(clearTimeout(s),s=null),r&&(cancelAnimationFrame(r),r=null),e.classList.remove("holding")},a=l=>{l.preventDefault(),e.dataset.act!=="reset"&&Ms(5),n(),o(),e.classList.add("holding"),e.dataset.act!=="reset"&&(s=setTimeout(()=>{let c=()=>{n(),r=requestAnimationFrame(c)};c()},280))};e.addEventListener("pointerdown",a),e.addEventListener("pointerup",o),e.addEventListener("pointerleave",o),e.addEventListener("pointercancel",o),e.addEventListener("blur",o),e.addEventListener("keydown",l=>{(l.key==="Enter"||l.key===" ")&&(l.preventDefault(),n())})})}function Nn(i){let t=hn(),e=Be(t).find(n=>n.id===i)||Be(t)[0];Ot.view=e.id,Fe.controls.autoRotate=!!e.autoRotate&&Qi,Fe.setView(e,{instant:!1}),document.querySelectorAll(".view-btn").forEach(n=>n.classList.toggle("active",n.dataset.view===i)),document.querySelectorAll("#dock-views .chip").forEach(n=>n.classList.toggle("active",n.dataset.view===i)),St("mode-badge").textContent=mf(t,e),St("orbit-btn").classList.toggle("active",!!e.autoRotate&&Qi),Lo()}function ql(){let i=hn(),t=Be(i);if(t.some(s=>s.group==="interior"&&s.id===Ot.view)){Nn((t.find(s=>s.id==="exterior")||t[0]).id),Ae("\u0412\u0438\u0434 \u0441\u043D\u0430\u0440\u0443\u0436\u0438");return}let n=t.find(s=>s.id==="driver")||t.find(s=>s.id==="salon")||t.find(s=>s.group==="interior");if(!n){Ae("\u0423 \u043F\u0440\u0438\u0446\u0435\u043F\u043E\u0432 \u0441\u0430\u043B\u043E\u043D\u0430 \u043D\u0435\u0442 \u2014 \u043E\u0441\u043C\u043E\u0442\u0440 \u0442\u043E\u043B\u044C\u043A\u043E \u0441\u043D\u0430\u0440\u0443\u0436\u0438");return}Nn(n.id),Ae(n.id==="salon"?"\u0421\u043C\u043E\u0442\u0440\u0438\u043C \u0438\u0437 \u0441\u0430\u043B\u043E\u043D\u0430":"\u0421\u0430\u0434\u0438\u043C\u0441\u044F \u0432 \u043A\u0430\u0431\u0438\u043D\u0443")}function Dy(i){let[t,e,n]=i.pos,s=(ke==null?void 0:ke.kind)==="car"?2.6:3.4,r=new N(t,e,n),o=new N(1,.55,-.9).normalize(),a={id:"anchor",label:i.label,group:"exterior",seat:!1,orbit:!0,fov:34,pos:[t+o.x*s,Math.max(e+o.y*s,.4),n+o.z*s],target:[t,e,n]};Fe.setView(a,{instant:!1}),St("mode-badge").textContent="\u041E\u0421\u041C\u041E\u0422\u0420",Ae(i.label+(i.side?` \xB7 ${i.side}`:"")),document.querySelectorAll(".view-btn").forEach(l=>l.classList.remove("active"))}function of(){let i=hn();if(Ot.compare)Ot.compare=null,_f(),St("compare-btn").classList.remove("on"),St("compare-btn-2").classList.remove("active"),Ae("\u0421\u0440\u0430\u0432\u043D\u0435\u043D\u0438\u0435 \u0432\u044B\u043A\u043B\u044E\u0447\u0435\u043D\u043E");else{let e=Ti[Ot.cat],n=e.findIndex(r=>r.id===i.id),s=e[(n+1)%e.length];if(s.id===i.id){Ae("\u0412 \u043A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u0438 \u043E\u0434\u043D\u0430 \u043C\u043E\u0434\u0435\u043B\u044C \u2014 \u0441\u0440\u0430\u0432\u043D\u0438\u0432\u0430\u0442\u044C \u043D\u0435 \u0441 \u0447\u0435\u043C");return}Ot.compare=s.id,Ny(i,s),St("compare-btn").classList.add("on"),St("compare-btn-2").classList.add("active"),Ae(`\u0420\u044F\u0434\u043E\u043C: ${s.name}`)}}function Ny(i,t){_f();let e=new en,n={...t,category:i.category},s=ff(n)||Vl(n,Uh),r=vr[t.id]||t.paint;for(let a of s.paintMats)a!=null&&a.color&&a.color.set(r);let o=(i.category==="cars"?3.6:4.6)*(s.kind==="car"?1:1.15);s.root.position.set(o,0,0),s.root.rotation.y=-.4,e.add(s.root),br.add(e),Co={group:e,built:s}}function _f(){Co&&(br.remove(Co.group),Co.group.traverse(i=>{var t,e;i.geometry&&((e=(t=i.geometry).dispose)==null||e.call(t))}),Co=null)}function Ro(i){let t=Ti[Ot.cat],e=t.findIndex(s=>s.id===Ot.id),n=t[(e+i+t.length)%t.length];Yl(Ot.cat,n.id)}function Lh(){let i=[...To.map(n=>["trucks",n.id]),...wo.map(n=>["trailers",n.id]),...Ao.map(n=>["cars",n.id])],[t,e]=i[Math.floor(Math.random()*i.length)];t!==Ot.cat&&(Ot.cat=t,document.querySelectorAll(".cat-tab").forEach(n=>{let s=n.dataset.cat===t;n.classList.toggle("active",s),n.setAttribute("aria-selected",String(s))})),Yl(t,e),Ae("\u0421\u043B\u0443\u0447\u0430\u0439\u043D\u044B\u0439 \u044D\u043A\u0441\u043F\u043E\u043D\u0430\u0442")}function Uy(i){Ti[i]&&(Ot.cat=i,Ot.id=Ti[i][0].id,document.querySelectorAll(".cat-tab").forEach(t=>{let e=t.dataset.cat===i;t.classList.toggle("active",e),t.setAttribute("aria-selected",String(e))}),Yl(i,Ot.id,{instant:!1}))}function af(){if(!df){Ae("\u0421\u043A\u0440\u0438\u043D\u0448\u043E\u0442 \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D \u0431\u0435\u0437 3D");return}un.renderer.render(br,un.camera);let i=document.createElement("a"),t=hn();i.download=`garage3d-${t.id}-${Ot.view}.png`,i.href=un.renderer.domElement.toDataURL("image/png"),i.click(),Ae("\u0421\u043A\u0440\u0438\u043D\u0448\u043E\u0442 \u0441\u043E\u0445\u0440\u0430\u043D\u0451\u043D")}function lf(){var t,e;let i=document.documentElement;document.fullscreenElement?(e=document.exitFullscreen)==null||e.call(document):(t=i.requestFullscreen)==null||t.call(i).catch(()=>Ae("\u041F\u043E\u043B\u043D\u044B\u0439 \u044D\u043A\u0440\u0430\u043D \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u0435\u043D"))}function cf(){let i=document.querySelector(".hud-top"),t=document.querySelector(".hud-bottom");if(!i||!t)return;let e=document.documentElement;e.style.setProperty("--hud-h",`${Math.round(i.getBoundingClientRect().height)||54}px`),e.style.setProperty("--dock-h",`${Math.round(t.getBoundingClientRect().height)||64}px`)}function Fy(){document.querySelectorAll(".cat-tab").forEach(s=>{s.onclick=()=>Uy(s.dataset.cat)}),document.querySelectorAll("#dock-env .chip").forEach(s=>{s.onclick=()=>{Ot.preset=s.dataset.preset,un.setPreset(Ot.preset),document.querySelectorAll("#dock-env .chip").forEach(r=>r.classList.toggle("active",r.dataset.preset===Ot.preset)),Lo(),Ae(`\u0421\u0432\u0435\u0442: ${s.textContent}`)}}),St("prev-btn").onclick=()=>Ro(-1),St("next-btn").onclick=()=>Ro(1),St("random-btn").onclick=Lh,St("shot-btn").onclick=af,St("full-btn").onclick=lf,St("catalog-toggle").onclick=()=>rf("catalog"),St("details-toggle").onclick=()=>rf("details"),St("catalog-close").onclick=()=>Po(),St("details-close").onclick=()=>Po(),St("backdrop").onclick=()=>Po(),St("light-btn").onclick=s=>{s.stopPropagation();let r=St("light-pop"),o=r.classList.contains("hidden");r.classList.toggle("hidden",!o),St("light-btn").setAttribute("aria-expanded",String(o))},St("light-pop").onclick=s=>s.stopPropagation(),document.addEventListener("click",()=>{var s,r;(s=St("light-pop"))==null||s.classList.add("hidden"),(r=St("light-btn"))==null||r.setAttribute("aria-expanded","false")}),St("help-btn").onclick=()=>St("help-modal").classList.remove("hidden"),St("help-close").onclick=()=>St("help-modal").classList.add("hidden"),St("help-modal").onclick=s=>{s.target.id==="help-modal"&&St("help-modal").classList.add("hidden")},St("d-inside").onclick=()=>{let s=hn(),r=Be(s).find(o=>o.id==="driver"||o.id==="salon");r?Nn(r.id):Ae("\u0423 \u044D\u0442\u043E\u0439 \u043C\u043E\u0434\u0435\u043B\u0438 \u043D\u0435\u0442 \u0441\u0430\u043B\u043E\u043D\u0430 \u2014 \u043F\u0440\u0438\u0446\u0435\u043F \u0442\u043E\u043B\u044C\u043A\u043E \u0441\u043D\u0430\u0440\u0443\u0436\u0438")},St("d-outside").onclick=()=>Nn("exterior"),St("orbit-btn").onclick=()=>{let s=Be(hn()).find(r=>r.id===Ot.view);Qi=!Qi,Fe.controls.autoRotate=Qi&&!!(s!=null&&s.autoRotate),St("orbit-btn").classList.toggle("active",Qi),Ae(Qi?"\u0410\u0432\u0442\u043E\u0432\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u0432\u043A\u043B\u044E\u0447\u0435\u043D\u043E":"\u0410\u0432\u0442\u043E\u0432\u0440\u0430\u0449\u0435\u043D\u0438\u0435 \u0432\u044B\u043A\u043B\u044E\u0447\u0435\u043D\u043E")},St("reset-btn").onclick=()=>{let s=hn();Nn(Be(s)[0].id)},St("look-btn").onclick=()=>{let s=hn(),r=Be(s).find(a=>a.id===Ot.view);if(r!=null&&r.seat){Nn(r.id),Ae("\u0412\u0437\u0433\u043B\u044F\u0434 \u0432\u043F\u0435\u0440\u0451\u0434 \u2014 \u0442\u044F\u043D\u0438\u0442\u0435 \u043C\u044B\u0448\u044C\u044E, \u0447\u0442\u043E\u0431\u044B \u043E\u0441\u043C\u043E\u0442\u0440\u0435\u0442\u044C\u0441\u044F");return}let o=Be(s).find(a=>a.id==="driver")||Be(s).find(a=>a.group==="interior");if(!o){Ae("\u0423 \u044D\u0442\u043E\u0439 \u043C\u043E\u0434\u0435\u043B\u0438 \u043D\u0435\u0442 \u0441\u0430\u043B\u043E\u043D\u0430 \u2014 \u043E\u0441\u043C\u043E\u0442\u0440 \u0442\u043E\u043B\u044C\u043A\u043E \u0441\u043D\u0430\u0440\u0443\u0436\u0438");return}Nn(o.id),Ae("\u0421\u0432\u043E\u0431\u043E\u0434\u043D\u044B\u0439 \u0432\u0437\u0433\u043B\u044F\u0434: \u0442\u044F\u043D\u0438\u0442\u0435 \u043C\u044B\u0448\u044C\u044E/\u043F\u0430\u043B\u044C\u0446\u0435\u043C")},St("compare-btn").onclick=of,St("compare-btn-2").onclick=of,St("fav-filter").onclick=()=>{Ot.favOnly=!Ot.favOnly,St("fav-filter").classList.toggle("on",Ot.favOnly),yr(),Ae(Ot.favOnly?"\u0422\u043E\u043B\u044C\u043A\u043E \u0438\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0435":"\u0412\u0441\u0435 \u043C\u043E\u0434\u0435\u043B\u0438")},St("search").oninput=s=>{Ot.search=s.target.value,yr()},Ly();let i=St("gl"),t=new ao,e=null,n=s=>i.classList.toggle("is-dragging",s);i.addEventListener("pointerdown",()=>n(!0)),window.addEventListener("pointerup",()=>n(!1)),window.addEventListener("pointercancel",()=>n(!1)),i.addEventListener("dblclick",()=>{clearTimeout(e),ql()}),i.addEventListener("click",s=>{if(s.detail>1)return;let r=i.getBoundingClientRect();if(!r.width||!r.height)return;let o=(s.clientX-r.left)/r.width*2-1,a=-((s.clientY-r.top)/r.height)*2+1;clearTimeout(e),e=setTimeout(()=>{if(!(ke!=null&&ke.root)||!Fe.controls.enabled)return;t.setFromCamera(new at(o,a),un.camera);let l=t.intersectObject(ke.root,!0).find(d=>{var f;return d.object.isMesh&&d.object.visible!==!1&&((f=d.object.material)==null?void 0:f.transparent)!==!0});if(!l)return;let c=l.point.clone();Fe.focusOn(c);let h=null,u=1.1;for(let d of ke.anchors||[]){let f=c.distanceTo(new N(...d.pos));f<u&&(u=f,h=d.label)}Ms(6),Ae(h?`\u0424\u043E\u043A\u0443\u0441: ${h}`:"\u0424\u043E\u043A\u0443\u0441 \u043D\u0430 \u0434\u0435\u0442\u0430\u043B\u0438 \xB7 \u043A\u043D\u043E\u043F\u043A\u0430 \u2302 \u0432\u0435\u0440\u043D\u0451\u0442 \u0432\u0438\u0434")},220)}),Wn.touch&&(Vd(St("gl"),{onSwipe:s=>{Ms(10),Ro(s>0?1:-1),Ae(s>0?"\u0421\u043B\u0435\u0434\u0443\u044E\u0449\u0430\u044F \u043C\u043E\u0434\u0435\u043B\u044C \u2192":"\u2190 \u041F\u0440\u0435\u0434\u044B\u0434\u0443\u0449\u0430\u044F \u043C\u043E\u0434\u0435\u043B\u044C")},onDoubleTap:()=>{Ms(12),ql()},onPinch:()=>{Ms(6);let s=Be(hn()).find(r=>r.id===Ot.view);s&&Nn(s.id)}}),Gd(()=>{Wn.phone&&(Ms([14,40,14]),Lh())},{threshold:26})),window.addEventListener("keydown",s=>{var r;if(s.target.tagName!=="INPUT")switch(s.key){case"ArrowRight":Ro(1);break;case"ArrowLeft":Ro(-1);break;case"a":case"A":case"\u0444":case"\u0424":Fe.orbit(-.14,0);break;case"d":case"D":case"\u0432":case"\u0412":Fe.orbit(.14,0);break;case"w":case"W":case"\u0446":case"\u0426":Fe.orbit(0,.1);break;case"s":case"S":case"\u044B":case"\u042B":Fe.orbit(0,-.1);break;case"+":case"=":case"\u044E":Fe.zoomBy(1.16);break;case"-":case"_":case"\u0436":Fe.zoomBy(1/1.16);break;case"r":case"R":case"\u043A":case"\u041A":Lh();break;case"f":case"F":case"\u0430":case"\u0410":lf();break;case"c":case"C":case"\u0441":case"\u0421":af();break;case"h":case"H":case"\u0440":case"\u0420":St("help-modal").classList.toggle("hidden");break;case"i":case"I":case"\u0448":case"\u0428":ql();break;case"Escape":{St("help-modal").classList.add("hidden"),(r=St("light-pop"))==null||r.classList.add("hidden"),Po();break}case" ":{s.preventDefault(),St("orbit-btn").onclick();break}case"0":Nn((Be(hn()).find(o=>o.group==="exterior")||Be(hn())[0]).id);break;case"1":case"2":case"3":case"4":case"5":{let o=Number(s.key),a=Be(hn()).slice(0,5);a[o-1]&&Nn(a[o-1].id);break}default:break}}),St("d-name").ondblclick=()=>{let s=hn().id;Ot.fav=Ot.fav.includes(s)?Ot.fav.filter(r=>r!==s):[...Ot.fav,s],Lo(),yr(),Ae(Ot.fav.includes(s)?"\u0414\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u043E \u0432 \u0438\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0435 \u2605":"\u0423\u0431\u0440\u0430\u043D\u043E \u0438\u0437 \u0438\u0437\u0431\u0440\u0430\u043D\u043D\u043E\u0433\u043E")}}var Oy=new lo,Dh=0,Gl=0,Wl=0;function xf(){var t;requestAnimationFrame(xf);let i=Math.min(.06,Oy.getDelta());if(Fe.update(i),un.renderer.render(br,un.camera),Dh+=1,Gl+=i,Gl>=1){let e=Dh/Gl;Dh=0,Gl=0,e<30?(Wl+=1,Wl>=2&&((t=un.adaptQuality)==null||t.call(un,e),Wl=0)):Wl=0}}function By(){let i=document.querySelector(".stage-hint");i&&(i.innerHTML=Wn.touch?"<span><kbd>1 \u043F\u0430\u043B\u0435\u0446</kbd> \u0432\u0440\u0430\u0449\u0430\u0442\u044C</span><span><kbd>2 \u043F\u0430\u043B\u044C\u0446\u0430</kbd> \u0437\u0443\u043C</span><span><kbd>\u0422\u0430\u043F \u043F\u043E \u0434\u0435\u0442\u0430\u043B\u0438</kbd> \u0444\u043E\u043A\u0443\u0441</span><span><kbd>\u0421\u0432\u0430\u0439\u043F</kbd> \u043C\u043E\u0434\u0435\u043B\u044C</span><span><kbd>\u0414\u0432\u043E\u0439\u043D\u043E\u0439 \u0442\u0430\u043F</kbd> \u0441\u0430\u043B\u043E\u043D</span>":"<span><kbd>\u041B\u041A\u041C</kbd> \u0432\u0440\u0430\u0449\u0430\u0442\u044C</span><span><kbd>\u041A\u043E\u043B\u0435\u0441\u043E</kbd> \u0437\u0443\u043C \u043A \u043A\u0443\u0440\u0441\u043E\u0440\u0443</span><span><kbd>\u041A\u043B\u0438\u043A</kbd> \u0444\u043E\u043A\u0443\u0441 \u043D\u0430 \u0434\u0435\u0442\u0430\u043B\u0438</span><span><kbd>A D W S</kbd> \u043A\u0430\u043C\u0435\u0440\u0430</span><span><kbd>I</kbd> \u0441\u0430\u043B\u043E\u043D</span><span><kbd>\u2190 \u2192</kbd> \u043C\u043E\u0434\u0435\u043B\u044C</span>");let t=document.querySelector(".foot-note");t&&Wn.touch&&(t.textContent="40 \u043C\u043E\u0434\u0435\u043B\u0435\u0439 \xB7 10 / 20 / 10"),un.setPreset(Ot.preset),document.querySelectorAll("#dock-env .chip").forEach(n=>n.classList.toggle("active",n.dataset.preset===Ot.preset)),document.querySelectorAll(".cat-tab").forEach(n=>{let s=n.dataset.cat===Ot.cat;n.classList.toggle("active",s),n.setAttribute("aria-selected",String(s))}),Fy(),cf(),window.addEventListener("resize",cf);let e=hn();yr(),Zl(e),kh(e),gf(e),St("mode-badge").textContent="\u0421\u041D\u0410\u0420\u0423\u0416\u0418",Bh(e,{instant:!0,view:Be(e)[0]}),xf(),setTimeout(()=>Ae(Wn.touch?"\u0421\u0432\u0430\u0439\u043F \u2014 \u0434\u0440\u0443\u0433\u0430\u044F \u043C\u043E\u0434\u0435\u043B\u044C \xB7 \u0434\u0432\u043E\u0439\u043D\u043E\u0439 \u0442\u0430\u043F \u2014 \u0441\u0430\u043B\u043E\u043D":"\u041A\u0430\u0442\u0430\u043B\u043E\u0433 \u0438 \u043A\u0430\u0440\u0442\u043E\u0447\u043A\u0430 \u2014 \u043A\u043D\u043E\u043F\u043A\u0438 \u0441\u0432\u0435\u0440\u0445\u0443 \xB7 I \u2014 \u0441\u0430\u043B\u043E\u043D"),900)}By();})();
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2026 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
