import{P as Vi,S as Fi,W as ji,A as Zn,a as cn,C as Li,T as Ui,D as gt,V as I,b as On,M as rt,R as br,O as Bi,c as Ut,B as Bt,U as Pt,d as Hi,e as $i,f as yt,L as Wi,g as Gi,h as ue,G as Yn,Q as Ki,i as qi,j as Zi,F as Qn,k as Yi}from"./threejs-4A5RaTDs.js";const vn=!1;var An=Array.isArray,Qi=Array.prototype.indexOf,Xe=Array.prototype.includes,Ht=Array.from,wr=Object.defineProperty,Oe=Object.getOwnPropertyDescriptor,Sr=Object.getOwnPropertyDescriptors,Xi=Object.prototype,Ji=Array.prototype,In=Object.getPrototypeOf,Xn=Object.isExtensible;function Ke(e){return typeof e=="function"}const P=()=>{};function eo(e){return typeof e?.then=="function"}function Dr(e){for(var t=0;t<e.length;t++)e[t]()}function Er(){var e,t,n=new Promise((r,i)=>{e=r,t=i});return{promise:n,resolve:e,reject:t}}function lc(e,t){if(Array.isArray(e))return e;if(!(Symbol.iterator in e))return Array.from(e);const n=[];for(const r of e)if(n.push(r),n.length===t)break;return n}const N=2,xt=4,bt=8,Cr=1<<24,he=16,se=32,Ne=64,hn=128,Z=512,A=1024,R=2048,oe=4096,W=8192,ye=16384,Pe=32768,we=65536,Jn=1<<17,Mr=1<<18,He=1<<19,Tr=1<<20,ge=1<<25,Ue=65536,pn=1<<21,Pn=1<<22,Ae=1<<23,de=Symbol("$state"),Or=Symbol("legacy props"),to=Symbol(""),ze=new class extends Error{name="StaleReactionError";message="The reaction that called `getAbortSignal()` was re-run or destroyed"},no=!!globalThis.document?.contentType&&globalThis.document.contentType.includes("xml");function kn(e){throw new Error("https://svelte.dev/e/lifecycle_outside_component")}function ro(){throw new Error("https://svelte.dev/e/async_derived_orphan")}function io(e,t,n){throw new Error("https://svelte.dev/e/each_key_duplicate")}function oo(e){throw new Error("https://svelte.dev/e/effect_in_teardown")}function so(){throw new Error("https://svelte.dev/e/effect_in_unowned_derived")}function ao(e){throw new Error("https://svelte.dev/e/effect_orphan")}function co(){throw new Error("https://svelte.dev/e/effect_update_depth_exceeded")}function lo(e){throw new Error("https://svelte.dev/e/props_invalid_value")}function fo(){throw new Error("https://svelte.dev/e/state_descriptors_fixed")}function uo(){throw new Error("https://svelte.dev/e/state_prototype_fixed")}function vo(){throw new Error("https://svelte.dev/e/state_unsafe_mutation")}function ho(){throw new Error("https://svelte.dev/e/svelte_boundary_reset_onerror")}const po=1,mo=2,Ar=4,_o=8,go=16,yo=1,xo=2,bo=4,wo=8,So=16,Do=1,Eo=2,Co=4,Mo=1,To=2,T=Symbol(),Ir="http://www.w3.org/1999/xhtml";function Oo(){console.warn("https://svelte.dev/e/select_multiple_invalid_value")}function Ao(){console.warn("https://svelte.dev/e/svelte_boundary_reset_noop")}function Pr(e){return e===this.v}function Nn(e,t){return e!=e?t==t:e!==t||e!==null&&typeof e=="object"||typeof e=="function"}function kr(e){return!Nn(e,this.v)}let it=!1,Io=!1;function uc(){it=!0}let E=null;function Je(e){E=e}function J(e){return Nr().get(e)}function ee(e,t){return Nr().set(e,t),t}function $t(e,t=!1,n){E={p:E,i:!1,c:null,e:null,s:e,x:null,l:it&&!t?{s:null,u:null,$:[]}:null}}function Wt(e){var t=E,n=t.e;if(n!==null){t.e=null;for(var r of n)ni(r)}return t.i=!0,E=t.p,{}}function $e(){return!it||E!==null&&E.l===null}function Nr(e){return E===null&&kn(),E.c??=new Map(Po(E)||void 0)}function Po(e){let t=e.p;for(;t!==null;){const n=t.c;if(n!==null)return n;t=t.p}return null}let Ve=[];function Rr(){var e=Ve;Ve=[],Dr(e)}function Y(e){if(Ve.length===0&&!Qe){var t=Ve;queueMicrotask(()=>{t===Ve&&Rr()})}Ve.push(e)}function ko(){for(;Ve.length>0;)Rr()}function zr(e){var t=w;if(t===null)return b.f|=Ae,e;if((t.f&Pe)===0&&(t.f&xt)===0)throw e;Te(e,t)}function Te(e,t){for(;t!==null;){if((t.f&hn)!==0){if((t.f&Pe)===0)throw e;try{t.b.error(e);return}catch(n){e=n}}t=t.parent}throw e}const No=-7169;function M(e,t){e.f=e.f&No|t}function Rn(e){(e.f&Z)!==0||e.deps===null?M(e,A):M(e,oe)}function Vr(e){if(e!==null)for(const t of e)(t.f&N)===0||(t.f&Ue)===0||(t.f^=Ue,Vr(t.deps))}function Fr(e,t,n){(e.f&R)!==0?t.add(e):(e.f&oe)!==0&&n.add(e),Vr(e.deps),M(e,A)}const Mt=new Set;let D=null,Nt=null,ne=null,L=[],Gt=null,mn=!1,Qe=!1;class ve{current=new Map;previous=new Map;#t=new Set;#a=new Set;#e=0;#o=0;#n=null;#s=new Set;#r=new Set;#i=new Map;is_fork=!1;#c=!1;#f(){return this.is_fork||this.#o>0}skip_effect(t){this.#i.has(t)||this.#i.set(t,{d:[],m:[]})}unskip_effect(t){var n=this.#i.get(t);if(n){this.#i.delete(t);for(var r of n.d)M(r,R),re(r);for(r of n.m)M(r,oe),re(r)}}process(t){L=[],this.apply();var n=[],r=[];for(const i of t)this.#l(i,n,r);if(this.#f()){this.#u(r),this.#u(n);for(const[i,o]of this.#i)Hr(i,o)}else{for(const i of this.#t)i();this.#t.clear(),this.#e===0&&this.#v(),Nt=this,D=null,er(r),er(n),Nt=null,this.#n?.resolve()}ne=null}#l(t,n,r){t.f^=A;for(var i=t.first;i!==null;){var o=i.f,s=(o&(se|Ne))!==0,a=s&&(o&A)!==0,c=a||(o&W)!==0||this.#i.has(i);if(!c&&i.fn!==null){s?i.f^=A:(o&xt)!==0?n.push(i):Dt(i)&&((o&he)!==0&&this.#r.add(i),nt(i));var l=i.first;if(l!==null){i=l;continue}}for(;i!==null;){var f=i.next;if(f!==null){i=f;break}i=i.parent}}}#u(t){for(var n=0;n<t.length;n+=1)Fr(t[n],this.#s,this.#r)}capture(t,n){n!==T&&!this.previous.has(t)&&this.previous.set(t,n),(t.f&Ae)===0&&(this.current.set(t,t.v),ne?.set(t,t.v))}activate(){D=this,this.apply()}deactivate(){D===this&&(D=null,ne=null)}flush(){if(this.activate(),L.length>0){if(Lr(),D!==null&&D!==this)return}else this.#e===0&&this.process([]);this.deactivate()}discard(){for(const t of this.#a)t(this);this.#a.clear()}#v(){if(Mt.size>1){this.previous.clear();var t=ne,n=!0;for(const i of Mt){if(i===this){n=!1;continue}const o=[];for(const[a,c]of this.current){if(i.current.has(a))if(n&&c!==i.current.get(a))i.current.set(a,c);else continue;o.push(a)}if(o.length===0)continue;const s=[...i.current.keys()].filter(a=>!this.current.has(a));if(s.length>0){var r=L;L=[];const a=new Set,c=new Map;for(const l of o)Ur(l,s,a,c);if(L.length>0){D=i,i.apply();for(const l of L)i.#l(l,[],[]);i.deactivate()}L=r}}D=null,ne=t}Mt.delete(this)}increment(t){this.#e+=1,t&&(this.#o+=1)}decrement(t){this.#e-=1,t&&(this.#o-=1),!this.#c&&(this.#c=!0,Y(()=>{this.#c=!1,this.#f()?L.length>0&&this.flush():this.revive()}))}revive(){for(const t of this.#s)this.#r.delete(t),M(t,R),re(t);for(const t of this.#r)M(t,oe),re(t);this.flush()}oncommit(t){this.#t.add(t)}ondiscard(t){this.#a.add(t)}settled(){return(this.#n??=Er()).promise}static ensure(){if(D===null){const t=D=new ve;Mt.add(D),Qe||Y(()=>{D===t&&t.flush()})}return D}apply(){}}function jr(e){var t=Qe;Qe=!0;try{for(var n;;){if(ko(),L.length===0&&(D?.flush(),L.length===0))return Gt=null,n;Lr()}}finally{Qe=t}}function Lr(){mn=!0;var e=null;try{for(var t=0;L.length>0;){var n=ve.ensure();if(t++>1e3){var r,i;Ro()}n.process(L),Ie.clear()}}finally{L=[],mn=!1,Gt=null}}function Ro(){try{co()}catch(e){Te(e,Gt)}}let pe=null;function er(e){var t=e.length;if(t!==0){for(var n=0;n<t;){var r=e[n++];if((r.f&(ye|W))===0&&Dt(r)&&(pe=new Set,nt(r),r.deps===null&&r.first===null&&r.nodes===null&&r.teardown===null&&r.ac===null&&ii(r),pe?.size>0)){Ie.clear();for(const i of pe){if((i.f&(ye|W))!==0)continue;const o=[i];let s=i.parent;for(;s!==null;)pe.has(s)&&(pe.delete(s),o.push(s)),s=s.parent;for(let a=o.length-1;a>=0;a--){const c=o[a];(c.f&(ye|W))===0&&nt(c)}}pe.clear()}}pe=null}}function Ur(e,t,n,r){if(!n.has(e)&&(n.add(e),e.reactions!==null))for(const i of e.reactions){const o=i.f;(o&N)!==0?Ur(i,t,n,r):(o&(Pn|he))!==0&&(o&R)===0&&Br(i,t,r)&&(M(i,R),re(i))}}function Br(e,t,n){const r=n.get(e);if(r!==void 0)return r;if(e.deps!==null)for(const i of e.deps){if(Xe.call(t,i))return!0;if((i.f&N)!==0&&Br(i,t,n))return n.set(i,!0),!0}return n.set(e,!1),!1}function re(e){var t=Gt=e,n=t.b;if(n?.is_pending&&(e.f&(xt|bt|Cr))!==0&&(e.f&Pe)===0){n.defer_effect(e);return}for(;t.parent!==null;){t=t.parent;var r=t.f;if(mn&&t===w&&(r&he)!==0&&(r&Mr)===0&&(r&Pe)!==0)return;if((r&(Ne|se))!==0){if((r&A)===0)return;t.f^=A}}L.push(t)}function Hr(e,t){if(!((e.f&se)!==0&&(e.f&A)!==0)){(e.f&R)!==0?t.d.push(e):(e.f&oe)!==0&&t.m.push(e),M(e,A);for(var n=e.first;n!==null;)Hr(n,t),n=n.next}}function $r(e){let t=0,n=Se(0),r;return()=>{Zt()&&(m(n),St(()=>(t===0&&(r=ce(()=>e(()=>lt(n)))),t+=1,()=>{Y(()=>{t-=1,t===0&&(r?.(),r=void 0,lt(n))})})))}}var zo=we|He;function Vo(e,t,n,r){new Fo(e,t,n,r)}class Fo{parent;is_pending=!1;transform_error;#t;#a=null;#e;#o;#n;#s=null;#r=null;#i=null;#c=null;#f=0;#l=0;#u=!1;#v=new Set;#h=new Set;#d=null;#y=$r(()=>(this.#d=Se(this.#f),()=>{this.#d=null}));constructor(t,n,r,i){this.#t=t,this.#e=n,this.#o=o=>{var s=w;s.b=this,s.f|=hn,r(o)},this.parent=w.b,this.transform_error=i??this.parent?.transform_error??(o=>o),this.#n=We(()=>{this.#_()},zo)}#x(){try{this.#s=q(()=>this.#o(this.#t))}catch(t){this.error(t)}}#b(t){const n=this.#e.failed;n&&(this.#i=q(()=>{n(this.#t,()=>t,()=>()=>{})}))}#w(){const t=this.#e.pending;t&&(this.is_pending=!0,this.#r=q(()=>t(this.#t)),Y(()=>{var n=this.#c=document.createDocumentFragment(),r=be();n.append(r),this.#s=this.#m(()=>(ve.ensure(),q(()=>this.#o(r)))),this.#l===0&&(this.#t.before(n),this.#c=null,je(this.#r,()=>{this.#r=null}),this.#p())}))}#_(){try{if(this.is_pending=this.has_pending_snippet(),this.#l=0,this.#f=0,this.#s=q(()=>{this.#o(this.#t)}),this.#l>0){var t=this.#c=document.createDocumentFragment();ai(this.#s,t);const n=this.#e.pending;this.#r=q(()=>n(this.#t))}else this.#p()}catch(n){this.error(n)}}#p(){this.is_pending=!1;for(const t of this.#v)M(t,R),re(t);for(const t of this.#h)M(t,oe),re(t);this.#v.clear(),this.#h.clear()}defer_effect(t){Fr(t,this.#v,this.#h)}is_rendered(){return!this.is_pending&&(!this.parent||this.parent.is_rendered())}has_pending_snippet(){return!!this.#e.pending}#m(t){var n=w,r=b,i=E;X(this.#n),H(this.#n),Je(this.#n.ctx);try{return t()}catch(o){return zr(o),null}finally{X(n),H(r),Je(i)}}#g(t){if(!this.has_pending_snippet()){this.parent&&this.parent.#g(t);return}this.#l+=t,this.#l===0&&(this.#p(),this.#r&&je(this.#r,()=>{this.#r=null}),this.#c&&(this.#t.before(this.#c),this.#c=null))}update_pending_count(t){this.#g(t),this.#f+=t,!(!this.#d||this.#u)&&(this.#u=!0,Y(()=>{this.#u=!1,this.#d&&xe(this.#d,this.#f)}))}get_effect_pending(){return this.#y(),m(this.#d)}error(t){var n=this.#e.onerror;let r=this.#e.failed;if(!n&&!r)throw t;this.#s&&(F(this.#s),this.#s=null),this.#r&&(F(this.#r),this.#r=null),this.#i&&(F(this.#i),this.#i=null);var i=!1,o=!1;const s=()=>{if(i){Ao();return}i=!0,o&&ho(),this.#i!==null&&je(this.#i,()=>{this.#i=null}),this.#m(()=>{ve.ensure(),this.#_()})},a=c=>{try{o=!0,n?.(c,s),o=!1}catch(l){Te(l,this.#n&&this.#n.parent)}r&&(this.#i=this.#m(()=>{ve.ensure();try{return q(()=>{var l=w;l.b=this,l.f|=hn,r(this.#t,()=>c,()=>s)})}catch(l){return Te(l,this.#n.parent),null}}))};Y(()=>{var c;try{c=this.transform_error(t)}catch(l){Te(l,this.#n&&this.#n.parent);return}c!==null&&typeof c=="object"&&typeof c.then=="function"?c.then(a,l=>Te(l,this.#n&&this.#n.parent)):a(c)})}}function jo(e,t,n,r){const i=$e()?Kt:zn;var o=e.filter(u=>!u.settled);if(n.length===0&&o.length===0){r(t.map(i));return}var s=w,a=Wr(),c=o.length===1?o[0].promise:o.length>1?Promise.all(o.map(u=>u.promise)):null;function l(u){a();try{r(u)}catch(d){(s.f&ye)===0&&Te(d,s)}Rt()}if(n.length===0){c.then(()=>l(t.map(i)));return}function f(){a(),Promise.all(n.map(u=>Uo(u))).then(u=>l([...t.map(i),...u])).catch(u=>Te(u,s))}c?c.then(f):f()}function Wr(){var e=w,t=b,n=E,r=D;return function(o=!0){X(e),H(t),Je(n),o&&r?.activate()}}function Rt(e=!0){X(null),H(null),Je(null),e&&D?.deactivate()}function Lo(){var e=w.b,t=D,n=e.is_rendered();return e.update_pending_count(1),t.increment(n),()=>{e.update_pending_count(-1),t.decrement(n)}}function Kt(e){var t=N|R,n=b!==null&&(b.f&N)!==0?b:null;return w!==null&&(w.f|=He),{ctx:E,deps:null,effects:null,equals:Pr,f:t,fn:e,reactions:null,rv:0,v:T,wv:0,parent:n??w,ac:null}}function Uo(e,t,n){w===null&&ro();var i=void 0,o=Se(T),s=!b,a=new Map;return es(()=>{var c=Er();i=c.promise;try{Promise.resolve(e()).then(c.resolve,c.reject).finally(Rt)}catch(d){c.reject(d),Rt()}var l=D;if(s){var f=Lo();a.get(l)?.reject(ze),a.delete(l),a.set(l,c)}const u=(d,v=void 0)=>{if(l.activate(),v)v!==ze&&(o.f|=Ae,xe(o,v));else{(o.f&Ae)!==0&&(o.f^=Ae),xe(o,d);for(const[h,_]of a){if(a.delete(h),h===l)break;_.reject(ze)}}f&&f()};c.promise.then(u,d=>u(null,d||"unknown"))}),Yt(()=>{for(const c of a.values())c.reject(ze)}),new Promise(c=>{function l(f){function u(){f===i?c(o):l(i)}f.then(u,u)}l(i)})}function G(e){const t=Kt(e);return ci(t),t}function zn(e){const t=Kt(e);return t.equals=kr,t}function Bo(e){var t=e.effects;if(t!==null){e.effects=null;for(var n=0;n<t.length;n+=1)F(t[n])}}function Ho(e){for(var t=e.parent;t!==null;){if((t.f&N)===0)return(t.f&ye)===0?t:null;t=t.parent}return null}function Vn(e){var t,n=w;X(Ho(e));try{e.f&=~Ue,Bo(e),t=di(e)}finally{X(n)}return t}function Gr(e){var t=Vn(e);if(!e.equals(t)&&(e.wv=fi(),(!D?.is_fork||e.deps===null)&&(e.v=t,e.deps===null))){M(e,A);return}ke||(ne!==null?(Zt()||D?.is_fork)&&ne.set(e,t):Rn(e))}function $o(e){if(e.effects!==null)for(const t of e.effects)(t.teardown||t.ac)&&(t.teardown?.(),t.ac?.abort(ze),t.teardown=P,t.ac=null,dt(t,0),Fn(t))}function Kr(e){if(e.effects!==null)for(const t of e.effects)t.teardown&&nt(t)}let _n=new Set;const Ie=new Map;let qr=!1;function Se(e,t){var n={f:0,v:e,reactions:null,equals:Pr,rv:0,wv:0};return n}function le(e,t){const n=Se(e);return ci(n),n}function zt(e,t=!1,n=!0){const r=Se(e);return t||(r.equals=kr),it&&n&&E!==null&&E.l!==null&&(E.l.s??=[]).push(r),r}function B(e,t,n=!1){b!==null&&(!ie||(b.f&Jn)!==0)&&$e()&&(b.f&(N|he|Pn|Jn))!==0&&(Q===null||!Xe.call(Q,e))&&vo();let r=n?qe(t):t;return xe(e,r)}function xe(e,t){if(!e.equals(t)){var n=e.v;ke?Ie.set(e,t):Ie.set(e,n),e.v=t;var r=ve.ensure();if(r.capture(e,n),(e.f&N)!==0){const i=e;(e.f&R)!==0&&Vn(i),Rn(i)}e.wv=fi(),Zr(e,R),$e()&&w!==null&&(w.f&A)!==0&&(w.f&(se|Ne))===0&&(K===null?rs([e]):K.push(e)),!r.is_fork&&_n.size>0&&!qr&&Wo()}return t}function Wo(){qr=!1;for(const e of _n)(e.f&A)!==0&&M(e,oe),Dt(e)&&nt(e);_n.clear()}function dc(e,t=1){var n=m(e),r=t===1?n++:n--;return B(e,n),r}function lt(e){B(e,e.v+1)}function Zr(e,t){var n=e.reactions;if(n!==null)for(var r=$e(),i=n.length,o=0;o<i;o++){var s=n[o],a=s.f;if(!(!r&&s===w)){var c=(a&R)===0;if(c&&M(s,t),(a&N)!==0){var l=s;ne?.delete(l),(a&Ue)===0&&(a&Z&&(s.f|=Ue),Zr(l,oe))}else c&&((a&he)!==0&&pe!==null&&pe.add(s),re(s))}}}function qe(e){if(typeof e!="object"||e===null||de in e)return e;const t=In(e);if(t!==Xi&&t!==Ji)return e;var n=new Map,r=An(e),i=le(0),o=Le,s=a=>{if(Le===o)return a();var c=b,l=Le;H(null),sr(o);var f=a();return H(c),sr(l),f};return r&&n.set("length",le(e.length)),new Proxy(e,{defineProperty(a,c,l){(!("value"in l)||l.configurable===!1||l.enumerable===!1||l.writable===!1)&&fo();var f=n.get(c);return f===void 0?s(()=>{var u=le(l.value);return n.set(c,u),u}):B(f,l.value,!0),!0},deleteProperty(a,c){var l=n.get(c);if(l===void 0){if(c in a){const f=s(()=>le(T));n.set(c,f),lt(i)}}else B(l,T),lt(i);return!0},get(a,c,l){if(c===de)return e;var f=n.get(c),u=c in a;if(f===void 0&&(!u||Oe(a,c)?.writable)&&(f=s(()=>{var v=qe(u?a[c]:T),h=le(v);return h}),n.set(c,f)),f!==void 0){var d=m(f);return d===T?void 0:d}return Reflect.get(a,c,l)},getOwnPropertyDescriptor(a,c){var l=Reflect.getOwnPropertyDescriptor(a,c);if(l&&"value"in l){var f=n.get(c);f&&(l.value=m(f))}else if(l===void 0){var u=n.get(c),d=u?.v;if(u!==void 0&&d!==T)return{enumerable:!0,configurable:!0,value:d,writable:!0}}return l},has(a,c){if(c===de)return!0;var l=n.get(c),f=l!==void 0&&l.v!==T||Reflect.has(a,c);if(l!==void 0||w!==null&&(!f||Oe(a,c)?.writable)){l===void 0&&(l=s(()=>{var d=f?qe(a[c]):T,v=le(d);return v}),n.set(c,l));var u=m(l);if(u===T)return!1}return f},set(a,c,l,f){var u=n.get(c),d=c in a;if(r&&c==="length")for(var v=l;v<u.v;v+=1){var h=n.get(v+"");h!==void 0?B(h,T):v in a&&(h=s(()=>le(T)),n.set(v+"",h))}if(u===void 0)(!d||Oe(a,c)?.writable)&&(u=s(()=>le(void 0)),B(u,qe(l)),n.set(c,u));else{d=u.v!==T;var _=s(()=>qe(l));B(u,_)}var p=Reflect.getOwnPropertyDescriptor(a,c);if(p?.set&&p.set.call(f,l),!d){if(r&&typeof c=="string"){var y=n.get("length"),S=Number(c);Number.isInteger(S)&&S>=y.v&&B(y,S+1)}lt(i)}return!0},ownKeys(a){m(i);var c=Reflect.ownKeys(a).filter(u=>{var d=n.get(u);return d===void 0||d.v!==T});for(var[l,f]of n)f.v!==T&&!(l in a)&&c.push(l);return c},setPrototypeOf(){uo()}})}function tr(e){try{if(e!==null&&typeof e=="object"&&de in e)return e[de]}catch{}return e}function Go(e,t){return Object.is(tr(e),tr(t))}var nr,Yr,Qr,Xr;function Ko(){if(nr===void 0){nr=window,Yr=/Firefox/.test(navigator.userAgent);var e=Element.prototype,t=Node.prototype,n=Text.prototype;Qr=Oe(t,"firstChild").get,Xr=Oe(t,"nextSibling").get,Xn(e)&&(e.__click=void 0,e.__className=void 0,e.__attributes=null,e.__style=void 0,e.__e=void 0),Xn(n)&&(n.__t=void 0)}}function be(e=""){return document.createTextNode(e)}function et(e){return Qr.call(e)}function wt(e){return Xr.call(e)}function rr(e,t){return et(e)}function qt(e,t=!1){{var n=et(e);return n instanceof Comment&&n.data===""?wt(n):n}}function vc(e,t=1,n=!1){let r=e;for(;t--;)r=wt(r);return r}function qo(e){e.textContent=""}function Jr(){return!1}function Zo(e,t,n){return document.createElementNS(Ir,e,void 0)}function hc(e,t){{const n=document.body;e.autofocus=!0,Y(()=>{document.activeElement===n&&e.focus()})}}let ir=!1;function Yo(){ir||(ir=!0,document.addEventListener("reset",e=>{Promise.resolve().then(()=>{if(!e.defaultPrevented)for(const t of e.target.elements)t.__on_r?.()})},{capture:!0}))}function ot(e){var t=b,n=w;H(null),X(null);try{return e()}finally{H(t),X(n)}}function ei(e,t,n,r=n){e.addEventListener(t,()=>ot(n));const i=e.__on_r;i?e.__on_r=()=>{i(),r(!0)}:e.__on_r=()=>r(!0),Yo()}function ti(e){w===null&&(b===null&&ao(),so()),ke&&oo()}function Qo(e,t){var n=t.last;n===null?t.last=t.first=e:(n.next=e,e.prev=n,t.last=e)}function ae(e,t,n){var r=w;r!==null&&(r.f&W)!==0&&(e|=W);var i={ctx:E,deps:null,nodes:null,f:e|R|Z,first:null,fn:t,last:null,next:null,parent:r,b:r&&r.b,prev:null,teardown:null,wv:0,ac:null};if(n)try{nt(i)}catch(a){throw F(i),a}else t!==null&&re(i);var o=i;if(n&&o.deps===null&&o.teardown===null&&o.nodes===null&&o.first===o.last&&(o.f&He)===0&&(o=o.first,(e&he)!==0&&(e&we)!==0&&o!==null&&(o.f|=we)),o!==null&&(o.parent=r,r!==null&&Qo(o,r),b!==null&&(b.f&N)!==0&&(e&Ne)===0)){var s=b;(s.effects??=[]).push(o)}return i}function Zt(){return b!==null&&!ie}function Yt(e){const t=ae(bt,null,!1);return M(t,A),t.teardown=e,t}function tt(e){ti();var t=w.f,n=!b&&(t&se)!==0&&(t&Pe)===0;if(n){var r=E;(r.e??=[]).push(e)}else return ni(e)}function ni(e){return ae(xt|Tr,e,!1)}function k(e){return ti(),ae(bt|Tr,e,!0)}function Xo(e){ve.ensure();const t=ae(Ne|He,e,!0);return()=>{F(t)}}function Jo(e){ve.ensure();const t=ae(Ne|He,e,!0);return(n={})=>new Promise(r=>{n.outro?je(t,()=>{F(t),r(void 0)}):(F(t),r(void 0))})}function Qt(e){return ae(xt,e,!1)}function es(e){return ae(Pn|He,e,!0)}function St(e,t=0){return ae(bt|t,e,!0)}function pc(e,t=[],n=[],r=[]){jo(r,t,n,i=>{ae(bt,()=>e(...i.map(m)),!0)})}function We(e,t=0){var n=ae(he|t,e,!0);return n}function q(e){return ae(se|He,e,!0)}function ri(e){var t=e.teardown;if(t!==null){const n=ke,r=b;or(!0),H(null);try{t.call(null)}finally{or(n),H(r)}}}function Fn(e,t=!1){var n=e.first;for(e.first=e.last=null;n!==null;){const i=n.ac;i!==null&&ot(()=>{i.abort(ze)});var r=n.next;(n.f&Ne)!==0?n.parent=null:F(n,t),n=r}}function ts(e){for(var t=e.first;t!==null;){var n=t.next;(t.f&se)===0&&F(t),t=n}}function F(e,t=!0){var n=!1;(t||(e.f&Mr)!==0)&&e.nodes!==null&&e.nodes.end!==null&&(ns(e.nodes.start,e.nodes.end),n=!0),Fn(e,t&&!n),dt(e,0),M(e,ye);var r=e.nodes&&e.nodes.t;if(r!==null)for(const o of r)o.stop();ri(e);var i=e.parent;i!==null&&i.first!==null&&ii(e),e.next=e.prev=e.teardown=e.ctx=e.deps=e.fn=e.nodes=e.ac=null}function ns(e,t){for(;e!==null;){var n=e===t?null:wt(e);e.remove(),e=n}}function ii(e){var t=e.parent,n=e.prev,r=e.next;n!==null&&(n.next=r),r!==null&&(r.prev=n),t!==null&&(t.first===e&&(t.first=r),t.last===e&&(t.last=n))}function je(e,t,n=!0){var r=[];oi(e,r,!0);var i=()=>{n&&F(e),t&&t()},o=r.length;if(o>0){var s=()=>--o||i();for(var a of r)a.out(s)}else i()}function oi(e,t,n){if((e.f&W)===0){e.f^=W;var r=e.nodes&&e.nodes.t;if(r!==null)for(const a of r)(a.is_global||n)&&t.push(a);for(var i=e.first;i!==null;){var o=i.next,s=(i.f&we)!==0||(i.f&se)!==0&&(e.f&he)!==0;oi(i,t,s?n:!1),i=o}}}function jn(e){si(e,!0)}function si(e,t){if((e.f&W)!==0){e.f^=W,(e.f&A)===0&&(M(e,R),re(e));for(var n=e.first;n!==null;){var r=n.next,i=(n.f&we)!==0||(n.f&se)!==0;si(n,i?t:!1),n=r}var o=e.nodes&&e.nodes.t;if(o!==null)for(const s of o)(s.is_global||t)&&s.in()}}function ai(e,t){if(e.nodes)for(var n=e.nodes.start,r=e.nodes.end;n!==null;){var i=n===r?null:wt(n);t.append(n),n=i}}let kt=!1,ke=!1;function or(e){ke=e}let b=null,ie=!1;function H(e){b=e}let w=null;function X(e){w=e}let Q=null;function ci(e){b!==null&&(Q===null?Q=[e]:Q.push(e))}let U=null,$=0,K=null;function rs(e){K=e}let li=1,Fe=0,Le=Fe;function sr(e){Le=e}function fi(){return++li}function Dt(e){var t=e.f;if((t&R)!==0)return!0;if(t&N&&(e.f&=~Ue),(t&oe)!==0){for(var n=e.deps,r=n.length,i=0;i<r;i++){var o=n[i];if(Dt(o)&&Gr(o),o.wv>e.wv)return!0}(t&Z)!==0&&ne===null&&M(e,A)}return!1}function ui(e,t,n=!0){var r=e.reactions;if(r!==null&&!(Q!==null&&Xe.call(Q,e)))for(var i=0;i<r.length;i++){var o=r[i];(o.f&N)!==0?ui(o,t,!1):t===o&&(n?M(o,R):(o.f&A)!==0&&M(o,oe),re(o))}}function di(e){var t=U,n=$,r=K,i=b,o=Q,s=E,a=ie,c=Le,l=e.f;U=null,$=0,K=null,b=(l&(se|Ne))===0?e:null,Q=null,Je(e.ctx),ie=!1,Le=++Fe,e.ac!==null&&(ot(()=>{e.ac.abort(ze)}),e.ac=null);try{e.f|=pn;var f=e.fn,u=f();e.f|=Pe;var d=e.deps,v=D?.is_fork;if(U!==null){var h;if(v||dt(e,$),d!==null&&$>0)for(d.length=$+U.length,h=0;h<U.length;h++)d[$+h]=U[h];else e.deps=d=U;if(Zt()&&(e.f&Z)!==0)for(h=$;h<d.length;h++)(d[h].reactions??=[]).push(e)}else!v&&d!==null&&$<d.length&&(dt(e,$),d.length=$);if($e()&&K!==null&&!ie&&d!==null&&(e.f&(N|oe|R))===0)for(h=0;h<K.length;h++)ui(K[h],e);if(i!==null&&i!==e){if(Fe++,i.deps!==null)for(let _=0;_<n;_+=1)i.deps[_].rv=Fe;if(t!==null)for(const _ of t)_.rv=Fe;K!==null&&(r===null?r=K:r.push(...K))}return(e.f&Ae)!==0&&(e.f^=Ae),u}catch(_){return zr(_)}finally{e.f^=pn,U=t,$=n,K=r,b=i,Q=o,Je(s),ie=a,Le=c}}function is(e,t){let n=t.reactions;if(n!==null){var r=Qi.call(n,e);if(r!==-1){var i=n.length-1;i===0?n=t.reactions=null:(n[r]=n[i],n.pop())}}if(n===null&&(t.f&N)!==0&&(U===null||!Xe.call(U,t))){var o=t;(o.f&Z)!==0&&(o.f^=Z,o.f&=~Ue),Rn(o),$o(o),dt(o,0)}}function dt(e,t){var n=e.deps;if(n!==null)for(var r=t;r<n.length;r++)is(e,n[r])}function nt(e){var t=e.f;if((t&ye)===0){M(e,A);var n=w,r=kt;w=e,kt=!0;try{(t&(he|Cr))!==0?ts(e):Fn(e),ri(e);var i=di(e);e.teardown=typeof i=="function"?i:null,e.wv=li;var o;vn&&Io&&(e.f&R)!==0&&e.deps}finally{kt=r,w=n}}}async function vi(){await Promise.resolve(),jr()}function m(e){var t=e.f,n=(t&N)!==0;if(b!==null&&!ie){var r=w!==null&&(w.f&ye)!==0;if(!r&&(Q===null||!Xe.call(Q,e))){var i=b.deps;if((b.f&pn)!==0)e.rv<Fe&&(e.rv=Fe,U===null&&i!==null&&i[$]===e?$++:U===null?U=[e]:U.push(e));else{(b.deps??=[]).push(e);var o=e.reactions;o===null?e.reactions=[b]:Xe.call(o,b)||o.push(b)}}}if(ke&&Ie.has(e))return Ie.get(e);if(n){var s=e;if(ke){var a=s.v;return((s.f&A)===0&&s.reactions!==null||pi(s))&&(a=Vn(s)),Ie.set(s,a),a}var c=(s.f&Z)===0&&!ie&&b!==null&&(kt||(b.f&Z)!==0),l=(s.f&Pe)===0;Dt(s)&&(c&&(s.f|=Z),Gr(s)),c&&!l&&(Kr(s),hi(s))}if(ne?.has(e))return ne.get(e);if((e.f&Ae)!==0)throw e.v;return e.v}function hi(e){if(e.f|=Z,e.deps!==null)for(const t of e.deps)(t.reactions??=[]).push(e),(t.f&N)!==0&&(t.f&Z)===0&&(Kr(t),hi(t))}function pi(e){if(e.v===T)return!0;if(e.deps===null)return!1;for(const t of e.deps)if(Ie.has(t)||(t.f&N)!==0&&pi(t))return!0;return!1}function ce(e){var t=ie;try{return ie=!0,e()}finally{ie=t}}function os(e){if(!(typeof e!="object"||!e||e instanceof EventTarget)){if(de in e)gn(e);else if(!Array.isArray(e))for(let t in e){const n=e[t];typeof n=="object"&&n&&de in n&&gn(n)}}}function gn(e,t=new Set){if(typeof e=="object"&&e!==null&&!(e instanceof EventTarget)&&!t.has(e)){t.add(e),e instanceof Date&&e.getTime();for(let r in e)try{gn(e[r],t)}catch{}const n=In(e);if(n!==Object.prototype&&n!==Array.prototype&&n!==Map.prototype&&n!==Set.prototype&&n!==Date.prototype){const r=Sr(n);for(let i in r){const o=r[i].get;if(o)try{o.call(e)}catch{}}}}}const ss=["touchstart","touchmove"];function as(e){return ss.includes(e)}const at=Symbol("events"),mi=new Set,yn=new Set;function cs(e,t,n,r={}){function i(o){if(r.capture||xn.call(t,o),!o.cancelBubble)return ot(()=>n?.call(this,o))}return e.startsWith("pointer")||e.startsWith("touch")||e==="wheel"?Y(()=>{t.addEventListener(e,i,r)}):t.addEventListener(e,i,r),i}function mc(e,t,n,r,i){var o={capture:r,passive:i},s=cs(e,t,n,o);(t===document.body||t===window||t===document||t instanceof HTMLMediaElement)&&Yt(()=>{t.removeEventListener(e,s,o)})}function _c(e,t,n){(t[at]??={})[e]=n}function gc(e){for(var t=0;t<e.length;t++)mi.add(e[t]);for(var n of yn)n(e)}let ar=null;function xn(e){var t=this,n=t.ownerDocument,r=e.type,i=e.composedPath?.()||[],o=i[0]||e.target;ar=e;var s=0,a=ar===e&&e[at];if(a){var c=i.indexOf(a);if(c!==-1&&(t===document||t===window)){e[at]=t;return}var l=i.indexOf(t);if(l===-1)return;c<=l&&(s=c)}if(o=i[s]||e.target,o!==t){wr(e,"currentTarget",{configurable:!0,get(){return o||n}});var f=b,u=w;H(null),X(null);try{for(var d,v=[];o!==null;){var h=o.assignedSlot||o.parentNode||o.host||null;try{var _=o[at]?.[r];_!=null&&(!o.disabled||e.target===o)&&_.call(o,e)}catch(p){d?v.push(p):d=p}if(e.cancelBubble||h===t||h===null)break;o=h}if(d){for(let p of v)queueMicrotask(()=>{throw p});throw d}}finally{e[at]=t,delete e.currentTarget,H(f),X(u)}}}const ls=globalThis?.window?.trustedTypes&&globalThis.window.trustedTypes.createPolicy("svelte-trusted-html",{createHTML:e=>e});function fs(e){return ls?.createHTML(e)??e}function _i(e){var t=Zo("template");return t.innerHTML=fs(e.replaceAll("<!>","<!---->")),t.content}function vt(e,t){var n=w;n.nodes===null&&(n.nodes={start:e,end:t,a:null,t:null})}function us(e,t){var n=(t&Mo)!==0,r=(t&To)!==0,i,o=!e.startsWith("<!>");return()=>{i===void 0&&(i=_i(o?e:"<!>"+e),n||(i=et(i)));var s=r||Yr?document.importNode(i,!0):i.cloneNode(!0);if(n){var a=et(s),c=s.lastChild;vt(a,c)}else vt(s,s);return s}}function ds(e,t,n="svg"){var r=!e.startsWith("<!>"),i=`<${n}>${r?e:"<!>"+e}</${n}>`,o;return()=>{if(!o){var s=_i(i),a=et(s);o=et(a)}var c=o.cloneNode(!0);return vt(c,c),c}}function yc(e,t){return ds(e,t,"svg")}function xc(e=""){{var t=be(e+"");return vt(t,t),t}}function Xt(){var e=document.createDocumentFragment(),t=document.createComment(""),n=be();return e.append(t,n),vt(t,n),e}function ht(e,t){e!==null&&e.before(t)}let bn=!0;function bc(e,t){var n=t==null?"":typeof t=="object"?`${t}`:t;n!==(e.__t??=e.nodeValue)&&(e.__t=n,e.nodeValue=`${n}`)}function wc(e,t){return vs(e,t)}const Tt=new Map;function vs(e,{target:t,anchor:n,props:r={},events:i,context:o,intro:s=!0,transformError:a}){Ko();var c=void 0,l=Jo(()=>{var f=n??t.appendChild(be());Vo(f,{pending:()=>{}},v=>{$t({});var h=E;o&&(h.c=o),i&&(r.$$events=i),bn=s,c=e(v,r)||{},bn=!0,Wt()},a);var u=new Set,d=v=>{for(var h=0;h<v.length;h++){var _=v[h];if(!u.has(_)){u.add(_);var p=as(_);for(const g of[t,document]){var y=Tt.get(g);y===void 0&&(y=new Map,Tt.set(g,y));var S=y.get(_);S===void 0?(g.addEventListener(_,xn,{passive:p}),y.set(_,1)):y.set(_,S+1)}}}};return d(Ht(mi)),yn.add(d),()=>{for(var v of u)for(const p of[t,document]){var h=Tt.get(p),_=h.get(v);--_==0?(p.removeEventListener(v,xn),h.delete(v),h.size===0&&Tt.delete(p)):h.set(v,_)}yn.delete(d),f!==n&&f.parentNode?.removeChild(f)}});return hs.set(c,l),c}let hs=new WeakMap;class Et{anchor;#t=new Map;#a=new Map;#e=new Map;#o=new Set;#n=!0;constructor(t,n=!0){this.anchor=t,this.#n=n}#s=()=>{var t=D;if(this.#t.has(t)){var n=this.#t.get(t),r=this.#a.get(n);if(r)jn(r),this.#o.delete(n);else{var i=this.#e.get(n);i&&(this.#a.set(n,i.effect),this.#e.delete(n),i.fragment.lastChild.remove(),this.anchor.before(i.fragment),r=i.effect)}for(const[o,s]of this.#t){if(this.#t.delete(o),o===t)break;const a=this.#e.get(s);a&&(F(a.effect),this.#e.delete(s))}for(const[o,s]of this.#a){if(o===n||this.#o.has(o))continue;const a=()=>{if(Array.from(this.#t.values()).includes(o)){var l=document.createDocumentFragment();ai(s,l),l.append(be()),this.#e.set(o,{effect:s,fragment:l})}else F(s);this.#o.delete(o),this.#a.delete(o)};this.#n||!r?(this.#o.add(o),je(s,a,!1)):a()}}};#r=t=>{this.#t.delete(t);const n=Array.from(this.#t.values());for(const[r,i]of this.#e)n.includes(r)||(F(i.effect),this.#e.delete(r))};ensure(t,n){var r=D,i=Jr();if(n&&!this.#a.has(t)&&!this.#e.has(t))if(i){var o=document.createDocumentFragment(),s=be();o.append(s),this.#e.set(t,{effect:q(()=>n(s)),fragment:o})}else this.#a.set(t,q(()=>n(this.anchor)));if(this.#t.set(r,t),i){for(const[a,c]of this.#a)a===t?r.unskip_effect(c):r.skip_effect(c);for(const[a,c]of this.#e)a===t?r.unskip_effect(c.effect):r.skip_effect(c.effect);r.oncommit(this.#s),r.ondiscard(this.#r)}else this.#s()}}const ps=0,cr=1,ms=2;function Sc(e,t,n,r,i){var o=$e(),s=T,a=o?Se(s):zt(s,!1,!1),c=o?Se(s):zt(s,!1,!1),l=new Et(e);We(()=>{var f=t(),u=!1;if(eo(f)){var d=Wr(),v=!1;const h=_=>{if(!u){v=!0,d(!1),ve.ensure();try{_()}finally{Rt(!1),Qe||jr()}}};f.then(_=>{h(()=>{xe(a,_),l.ensure(cr,r&&(p=>r(p,a)))})},_=>{h(()=>{if(xe(c,_),l.ensure(ms,i&&(p=>i(p,c))),!i)throw c.v})}),Y(()=>{v||h(()=>{l.ensure(ps,n)})})}else xe(a,f),l.ensure(cr,r&&(h=>r(h,a)));return()=>{u=!0}})}function _s(e,t,n=!1){var r=new Et(e),i=n?we:0;function o(s,a){r.ensure(s,a)}We(()=>{var s=!1;t((a,c=0)=>{s=!0,o(c,a)}),s||o(!1,null)},i)}const gs=Symbol("NaN");function Dc(e,t,n){var r=new Et(e),i=!$e();We(()=>{var o=t();o!==o&&(o=gs),i&&o!==null&&typeof o=="object"&&(o={}),r.ensure(o,n)})}function Ec(e,t){return t}function ys(e,t,n){for(var r=[],i=t.length,o,s=t.length,a=0;a<i;a++){let u=t[a];je(u,()=>{if(o){if(o.pending.delete(u),o.done.add(u),o.pending.size===0){var d=e.outrogroups;wn(Ht(o.done)),d.delete(o),d.size===0&&(e.outrogroups=null)}}else s-=1},!1)}if(s===0){var c=r.length===0&&n!==null;if(c){var l=n,f=l.parentNode;qo(f),f.append(l),e.items.clear()}wn(t,!c)}else o={pending:new Set(t),done:new Set},(e.outrogroups??=new Set).add(o)}function wn(e,t=!0){for(var n=0;n<e.length;n++)F(e[n],t)}var lr;function Cc(e,t,n,r,i,o=null){var s=e,a=new Map,c=(t&Ar)!==0;if(c){var l=e;s=l.appendChild(be())}var f=null,u=zn(()=>{var y=n();return An(y)?y:y==null?[]:Ht(y)}),d,v=!0;function h(){p.fallback=f,xs(p,d,s,t,r),f!==null&&(d.length===0?(f.f&ge)===0?jn(f):(f.f^=ge,ct(f,null,s)):je(f,()=>{f=null}))}var _=We(()=>{d=m(u);for(var y=d.length,S=new Set,g=D,x=Jr(),V=0;V<y;V+=1){var te=d[V],j=r(te,V),z=v?null:a.get(j);z?(z.v&&xe(z.v,te),z.i&&xe(z.i,V),x&&g.unskip_effect(z.e)):(z=bs(a,v?s:lr??=be(),te,j,V,i,t,n),v||(z.e.f|=ge),a.set(j,z)),S.add(j)}if(y===0&&o&&!f&&(v?f=q(()=>o(s)):(f=q(()=>o(lr??=be())),f.f|=ge)),y>S.size&&io(),!v)if(x){for(const[De,Ee]of a)S.has(De)||g.skip_effect(Ee.e);g.oncommit(h),g.ondiscard(()=>{})}else h();m(u)}),p={effect:_,items:a,outrogroups:null,fallback:f};v=!1}function st(e){for(;e!==null&&(e.f&se)===0;)e=e.next;return e}function xs(e,t,n,r,i){var o=(r&_o)!==0,s=t.length,a=e.items,c=st(e.effect.first),l,f=null,u,d=[],v=[],h,_,p,y;if(o)for(y=0;y<s;y+=1)h=t[y],_=i(h,y),p=a.get(_).e,(p.f&ge)===0&&(p.nodes?.a?.measure(),(u??=new Set).add(p));for(y=0;y<s;y+=1){if(h=t[y],_=i(h,y),p=a.get(_).e,e.outrogroups!==null)for(const Ee of e.outrogroups)Ee.pending.delete(p),Ee.done.delete(p);if((p.f&ge)!==0)if(p.f^=ge,p===c)ct(p,null,n);else{var S=f?f.next:c;p===e.effect.last&&(e.effect.last=p.prev),p.prev&&(p.prev.next=p.next),p.next&&(p.next.prev=p.prev),Ce(e,f,p),Ce(e,p,S),ct(p,S,n),f=p,d=[],v=[],c=st(f.next);continue}if((p.f&W)!==0&&(jn(p),o&&(p.nodes?.a?.unfix(),(u??=new Set).delete(p))),p!==c){if(l!==void 0&&l.has(p)){if(d.length<v.length){var g=v[0],x;f=g.prev;var V=d[0],te=d[d.length-1];for(x=0;x<d.length;x+=1)ct(d[x],g,n);for(x=0;x<v.length;x+=1)l.delete(v[x]);Ce(e,V.prev,te.next),Ce(e,f,V),Ce(e,te,g),c=g,f=te,y-=1,d=[],v=[]}else l.delete(p),ct(p,c,n),Ce(e,p.prev,p.next),Ce(e,p,f===null?e.effect.first:f.next),Ce(e,f,p),f=p;continue}for(d=[],v=[];c!==null&&c!==p;)(l??=new Set).add(c),v.push(c),c=st(c.next);if(c===null)continue}(p.f&ge)===0&&d.push(p),f=p,c=st(p.next)}if(e.outrogroups!==null){for(const Ee of e.outrogroups)Ee.pending.size===0&&(wn(Ht(Ee.done)),e.outrogroups?.delete(Ee));e.outrogroups.size===0&&(e.outrogroups=null)}if(c!==null||l!==void 0){var j=[];if(l!==void 0)for(p of l)(p.f&W)===0&&j.push(p);for(;c!==null;)(c.f&W)===0&&c!==e.fallback&&j.push(c),c=st(c.next);var z=j.length;if(z>0){var De=(r&Ar)!==0&&s===0?n:null;if(o){for(y=0;y<z;y+=1)j[y].nodes?.a?.measure();for(y=0;y<z;y+=1)j[y].nodes?.a?.fix()}ys(e,j,De)}}o&&Y(()=>{if(u!==void 0)for(p of u)p.nodes?.a?.apply()})}function bs(e,t,n,r,i,o,s,a){var c=(s&po)!==0?(s&go)===0?zt(n,!1,!1):Se(n):null,l=(s&mo)!==0?Se(i):null;return{v:c,i:l,e:q(()=>(o(t,c??n,l??i,a),()=>{e.delete(r)}))}}function ct(e,t,n){if(e.nodes)for(var r=e.nodes.start,i=e.nodes.end,o=t&&(t.f&ge)===0?t.nodes.start:n;r!==null;){var s=wt(r);if(o.before(r),r===i)return;r=s}}function Ce(e,t,n){t===null?e.effect.first=n:t.next=n,n===null?e.effect.last=t:n.prev=t}function Jt(e,t,...n){var r=new Et(e);We(()=>{const i=t()??null;r.ensure(i,i&&(o=>i(o,...n)))},we)}function Mc(e,t,n){var r=new Et(e);We(()=>{var i=t()??null;r.ensure(i,i&&(o=>n(o,i)))},we)}const ws=()=>performance.now(),_e={tick:e=>requestAnimationFrame(e),now:()=>ws(),tasks:new Set};function gi(){const e=_e.now();_e.tasks.forEach(t=>{t.c(e)||(_e.tasks.delete(t),t.f())}),_e.tasks.size!==0&&_e.tick(gi)}function Ss(e){let t;return _e.tasks.size===0&&_e.tick(gi),{promise:new Promise(n=>{_e.tasks.add(t={c:e,f:n})}),abort(){_e.tasks.delete(t)}}}function Vt(e,t){ot(()=>{e.dispatchEvent(new CustomEvent(t))})}function Ds(e){if(e==="float")return"cssFloat";if(e==="offset")return"cssOffset";if(e.startsWith("--"))return e;const t=e.split("-");return t.length===1?t[0]:t[0]+t.slice(1).map(n=>n[0].toUpperCase()+n.slice(1)).join("")}function fr(e){const t={},n=e.split(";");for(const r of n){const[i,o]=r.split(":");if(!i||o===void 0)break;const s=Ds(i.trim());t[s]=o.trim()}return t}const Es=e=>e;function Tc(e,t,n){var r=w,i=r.nodes,o,s,a,c=null;i.a??={element:e,measure(){o=this.element.getBoundingClientRect()},apply(){if(a?.abort(),s=this.element.getBoundingClientRect(),o.left!==s.left||o.right!==s.right||o.top!==s.top||o.bottom!==s.bottom){const l=t()(this.element,{from:o,to:s},n?.());a=Ft(this.element,l,void 0,1,()=>{a?.abort(),a=void 0})}},fix(){if(!e.getAnimations().length){var{position:l,width:f,height:u}=getComputedStyle(e);if(l!=="absolute"&&l!=="fixed"){var d=e.style;c={position:d.position,width:d.width,height:d.height,transform:d.transform},d.position="absolute",d.width=f,d.height=u;var v=e.getBoundingClientRect();if(o.left!==v.left||o.top!==v.top){var h=`translate(${o.left-v.left}px, ${o.top-v.top}px)`;d.transform=d.transform?`${d.transform} ${h}`:h}}}},unfix(){if(c){var l=e.style;l.position=c.position,l.width=c.width,l.height=c.height,l.transform=c.transform}}},i.a.element=e}function Oc(e,t,n,r){var i=(e&Do)!==0,o=(e&Eo)!==0,s=i&&o,a=(e&Co)!==0,c=s?"both":i?"in":"out",l,f=t.inert,u=t.style.overflow,d,v;function h(){return ot(()=>l??=n()(t,r?.()??{},{direction:c}))}var _={is_global:a,in(){if(t.inert=f,!i){v?.abort(),v?.reset?.();return}o||d?.abort(),d=Ft(t,h(),v,1,()=>{Vt(t,"introend"),d?.abort(),d=l=void 0,t.style.overflow=u})},out(g){if(!o){g?.(),l=void 0;return}t.inert=!0,v=Ft(t,h(),d,0,()=>{Vt(t,"outroend"),g?.()})},stop:()=>{d?.abort(),v?.abort()}},p=w;if((p.nodes.t??=[]).push(_),i&&bn){var y=a;if(!y){for(var S=p.parent;S&&(S.f&we)!==0;)for(;(S=S.parent)&&(S.f&he)===0;);y=!S||(S.f&Pe)!==0}y&&Qt(()=>{ce(()=>_.in())})}}function Ft(e,t,n,r,i){var o=r===1;if(Ke(t)){var s,a=!1;return Y(()=>{if(!a){var p=t({direction:o?"in":"out"});s=Ft(e,p,n,r,i)}}),{abort:()=>{a=!0,s?.abort()},deactivate:()=>s.deactivate(),reset:()=>s.reset(),t:()=>s.t()}}if(n?.deactivate(),!t?.duration&&!t?.delay)return Vt(e,o?"introstart":"outrostart"),i(),{abort:P,deactivate:P,reset:P,t:()=>r};const{delay:c=0,css:l,tick:f,easing:u=Es}=t;var d=[];if(o&&n===void 0&&(f&&f(0,1),l)){var v=fr(l(0,1));d.push(v,v)}var h=()=>1-r,_=e.animate(d,{duration:c,fill:"forwards"});return _.onfinish=()=>{_.cancel(),Vt(e,o?"introstart":"outrostart");var p=n?.t()??1-r;n?.abort();var y=r-p,S=t.duration*Math.abs(y),g=[];if(S>0){var x=!1;if(l)for(var V=Math.ceil(S/16.666666666666668),te=0;te<=V;te+=1){var j=p+y*u(te/V),z=fr(l(j,1-j));g.push(z),x||=z.overflow==="hidden"}x&&(e.style.overflow="hidden"),h=()=>{var De=_.currentTime;return p+y*u(De/S)},f&&Ss(()=>{if(_.playState!=="running")return!1;var De=h();return f(De,1-De),!0})}_=e.animate(g,{duration:S,fill:"forwards"}),_.onfinish=()=>{h=()=>r,f?.(r,1-r),i()}},{abort:()=>{_&&(_.cancel(),_.effect=null,_.onfinish=P)},deactivate:()=>{i=P},reset:()=>{r===0&&f?.(1,0)},t:()=>h()}}function Ac(e,t,n){Qt(()=>{var r=ce(()=>t(e,n?.())||{});if(n&&r?.update){var i=!1,o={};St(()=>{var s=n();os(s),i&&Nn(o,s)&&(o=s,r.update(s))}),i=!0}if(r?.destroy)return()=>r.destroy()})}const ur=[...` 	
\r\f \v\uFEFF`];function Cs(e,t,n){var r=e==null?"":""+e;if(t&&(r=r?r+" "+t:t),n){for(var i of Object.keys(n))if(n[i])r=r?r+" "+i:i;else if(r.length)for(var o=i.length,s=0;(s=r.indexOf(i,s))>=0;){var a=s+o;(s===0||ur.includes(r[s-1]))&&(a===r.length||ur.includes(r[a]))?r=(s===0?"":r.substring(0,s))+r.substring(a+1):s=a}}return r===""?null:r}function Ms(e,t){return e==null?null:String(e)}function Ic(e,t,n,r,i,o){var s=e.__className;if(s!==n||s===void 0){var a=Cs(n,r,o);a==null?e.removeAttribute("class"):e.className=a,e.__className=n}else if(o&&i!==o)for(var c in o){var l=!!o[c];(i==null||l!==!!i[c])&&e.classList.toggle(c,l)}return o}function Pc(e,t,n,r){var i=e.__style;if(i!==t){var o=Ms(t);o==null?e.removeAttribute("style"):e.style.cssText=o,e.__style=t}return r}function yi(e,t,n=!1){if(e.multiple){if(t==null)return;if(!An(t))return Oo();for(var r of e.options)r.selected=t.includes(ft(r));return}for(r of e.options){var i=ft(r);if(Go(i,t)){r.selected=!0;return}}(!n||t!==void 0)&&(e.selectedIndex=-1)}function Ts(e){var t=new MutationObserver(()=>{yi(e,e.__value)});t.observe(e,{childList:!0,subtree:!0,attributes:!0,attributeFilter:["value"]}),Yt(()=>{t.disconnect()})}function kc(e,t,n=t){var r=new WeakSet,i=!0;ei(e,"change",o=>{var s=o?"[selected]":":checked",a;if(e.multiple)a=[].map.call(e.querySelectorAll(s),ft);else{var c=e.querySelector(s)??e.querySelector("option:not([disabled])");a=c&&ft(c)}n(a),D!==null&&r.add(D)}),Qt(()=>{var o=t();if(e===document.activeElement){var s=Nt??D;if(r.has(s))return}if(yi(e,o,i),i&&o===void 0){var a=e.querySelector(":checked");a!==null&&(o=ft(a),n(o))}e.__value=o,i=!1}),Ts(e)}function ft(e){return"__value"in e?e.__value:e.value}const Os=Symbol("is custom element"),As=Symbol("is html"),Is=no?"progress":"PROGRESS";function Nc(e,t){var n=Ln(e);n.value===(n.value=t??void 0)||e.value===t&&(t!==0||e.nodeName!==Is)||(e.value=t??"")}function Rc(e,t){var n=Ln(e);n.checked!==(n.checked=t??void 0)&&(e.checked=t)}function zc(e,t,n,r){var i=Ln(e);i[t]!==(i[t]=n)&&(t==="loading"&&(e[to]=n),n==null?e.removeAttribute(t):typeof n!="string"&&Ps(e).includes(t)?e[t]=n:e.setAttribute(t,n))}function Ln(e){return e.__attributes??={[Os]:e.nodeName.includes("-"),[As]:e.namespaceURI===Ir}}var dr=new Map;function Ps(e){var t=e.getAttribute("is")||e.nodeName,n=dr.get(t);if(n)return n;dr.set(t,n=[]);for(var r,i=e,o=Element.prototype;o!==i;){r=Sr(i);for(var s in r)r[s].set&&n.push(s);i=In(i)}return n}function Vc(e,t,n=t){var r=new WeakSet;ei(e,"input",async i=>{var o=i?e.defaultValue:e.value;if(o=ln(e)?fn(o):o,n(o),D!==null&&r.add(D),await vi(),o!==(o=t())){var s=e.selectionStart,a=e.selectionEnd,c=e.value.length;if(e.value=o??"",a!==null){var l=e.value.length;s===a&&a===c&&l>c?(e.selectionStart=l,e.selectionEnd=l):(e.selectionStart=s,e.selectionEnd=Math.min(a,l))}}}),ce(t)==null&&e.value&&(n(ln(e)?fn(e.value):e.value),D!==null&&r.add(D)),St(()=>{var i=t();if(e===document.activeElement){var o=Nt??D;if(r.has(o))return}ln(e)&&i===fn(e.value)||e.type==="date"&&!i&&!e.value||i!==e.value&&(e.value=i??"")})}function ln(e){var t=e.type;return t==="number"||t==="range"}function fn(e){return e===""?null:+e}function vr(e,t){return e===t||e?.[de]===t}function hr(e={},t,n,r){return Qt(()=>{var i,o;return St(()=>{i=o,o=r?.()||[],ce(()=>{e!==n(...o)&&(t(e,...o),i&&vr(n(...i),e)&&t(null,...i))})}),()=>{Y(()=>{o&&vr(n(...o),e)&&t(null,...o)})}}),e}function Un(e,t,n){if(e==null)return t(void 0),n&&n(void 0),P;const r=ce(()=>e.subscribe(t,n));return r.unsubscribe?()=>r.unsubscribe():r}const Ge=[];function Bn(e,t){return{subscribe:en(e,t).subscribe}}function en(e,t=P){let n=null;const r=new Set;function i(a){if(Nn(e,a)&&(e=a,n)){const c=!Ge.length;for(const l of r)l[1](),Ge.push(l,e);if(c){for(let l=0;l<Ge.length;l+=2)Ge[l][0](Ge[l+1]);Ge.length=0}}}function o(a){i(a(e))}function s(a,c=P){const l=[a,c];return r.add(l),r.size===1&&(n=t(i,o)||P),a(e),()=>{r.delete(l),r.size===0&&n&&(n(),n=null)}}return{set:i,update:o,subscribe:s}}function xi(e,t,n){const r=!Array.isArray(e),i=r?[e]:e;if(!i.every(Boolean))throw new Error("derived() expects stores as input, got a falsy value");const o=t.length<2;return Bn(n,(s,a)=>{let c=!1;const l=[];let f=0,u=P;const d=()=>{if(f)return;u();const h=t(r?l[0]:l,s,a);o?s(h):u=typeof h=="function"?h:P},v=i.map((h,_)=>Un(h,p=>{l[_]=p,f&=~(1<<_),c&&d()},()=>{f|=1<<_}));return c=!0,d(),function(){Dr(v),u(),c=!1}})}function bi(e){let t;return Un(e,n=>t=n)(),t}let Ot=!1,Sn=Symbol();function ks(e,t,n){const r=n[t]??={store:null,source:zt(void 0),unsubscribe:P};if(r.store!==e&&!(Sn in n))if(r.unsubscribe(),r.store=e??null,e==null)r.source.v=void 0,r.unsubscribe=P;else{var i=!0;r.unsubscribe=Un(e,o=>{i?r.source.v=o:B(r.source,o)}),i=!1}return e&&Sn in n?bi(e):m(r.source)}function Ns(){const e={};function t(){Yt(()=>{for(var n in e)e[n].unsubscribe();wr(e,Sn,{enumerable:!1,value:!0})})}return[e,t]}function Rs(e){var t=Ot;try{return Ot=!1,[e(),Ot]}finally{Ot=t}}const zs={get(e,t){if(!e.exclude.includes(t))return e.props[t]},set(e,t){return!1},getOwnPropertyDescriptor(e,t){if(!e.exclude.includes(t)&&t in e.props)return{enumerable:!0,configurable:!0,value:e.props[t]}},has(e,t){return e.exclude.includes(t)?!1:t in e.props},ownKeys(e){return Reflect.ownKeys(e.props).filter(t=>!e.exclude.includes(t))}};function tn(e,t,n){return new Proxy({props:e,exclude:t},zs)}const Vs={get(e,t){let n=e.props.length;for(;n--;){let r=e.props[n];if(Ke(r)&&(r=r()),typeof r=="object"&&r!==null&&t in r)return r[t]}},set(e,t,n){let r=e.props.length;for(;r--;){let i=e.props[r];Ke(i)&&(i=i());const o=Oe(i,t);if(o&&o.set)return o.set(n),!0}return!1},getOwnPropertyDescriptor(e,t){let n=e.props.length;for(;n--;){let r=e.props[n];if(Ke(r)&&(r=r()),typeof r=="object"&&r!==null&&t in r){const i=Oe(r,t);return i&&!i.configurable&&(i.configurable=!0),i}}},has(e,t){if(t===de||t===Or)return!1;for(let n of e.props)if(Ke(n)&&(n=n()),n!=null&&t in n)return!0;return!1},ownKeys(e){const t=[];for(let n of e.props)if(Ke(n)&&(n=n()),!!n){for(const r in n)t.includes(r)||t.push(r);for(const r of Object.getOwnPropertySymbols(n))t.includes(r)||t.push(r)}return t}};function wi(...e){return new Proxy({props:e},Vs)}function Ze(e,t,n,r){var i=!it||(n&xo)!==0,o=(n&wo)!==0,s=(n&So)!==0,a=r,c=!0,l=()=>(c&&(c=!1,a=s?ce(r):r),a),f;if(o){var u=de in e||Or in e;f=Oe(e,t)?.set??(u&&t in e?g=>e[t]=g:void 0)}var d,v=!1;o?[d,v]=Rs(()=>e[t]):d=e[t],d===void 0&&r!==void 0&&(d=l(),f&&(i&&lo(),f(d)));var h;if(i?h=()=>{var g=e[t];return g===void 0?l():(c=!0,g)}:h=()=>{var g=e[t];return g!==void 0&&(a=void 0),g===void 0?a:g},i&&(n&bo)===0)return h;if(f){var _=e.$$legacy;return(function(g,x){return arguments.length>0?((!i||!x||_||v)&&f(x?h():g),g):h()})}var p=!1,y=((n&yo)!==0?Kt:zn)(()=>(p=!1,h()));o&&m(y);var S=w;return(function(g,x){if(arguments.length>0){const V=x?m(y):i&&o?qe(g):g;return B(y,V),p=!0,a!==void 0&&(a=V),g}return ke&&p||(S.f&ye)!==0?y.v:m(y)})}function Si(e){E===null&&kn(),it&&E.l!==null?Fs(E).m.push(e):tt(()=>{const t=ce(e);if(typeof t=="function")return t})}function nn(e){E===null&&kn(),Si(()=>()=>ce(e))}function Fs(e){var t=e.l;return t.u??={a:[],b:[],m:[]}}const js="5";typeof window<"u"&&((window.__svelte??={}).v??=new Set).add(js);function Ls(e,t){var n=w,r=b,i=e();return{subscribe:en(i,s=>{var a=i!==e(),c,l=b,f=w;H(r),X(n);try{c=Xo(()=>{St(()=>{const u=e();a&&s(u)})})}finally{H(l),X(f)}return a=!0,c}).subscribe}}function jt(e){let t;const n=$r(i=>{let o=!1;const s=e.subscribe(a=>{t=a,o&&i()});return o=!0,s});function r(){return Zt()?(n(),t):bi(e)}return"set"in e?{get current(){return r()},set current(i){e.set(i)}}:{get current(){return r()}}}const pr=(e,t)=>{if(e===t)return!0;if(!e||!t)return!1;const n=e.length;if(t.length!==n)return!1;for(let r=0;r<n;r++)if(e[r]!==t[r])return!1;return!0},Us=()=>{const e=[],r={items:e,remember:(i,o)=>{for(let a=0;a<e.length;a++){const c=e[a];if(pr(o,c.keys)&&c.promise)return c.promise}const s={promise:i(),keys:o};return e.push(s),s.promise},clear:i=>{for(let o=0;o<e.length;o++){const s=e[o];if(pr(i,s.keys)){e.splice(o,1);return}}}};return ee("threlte-cache",r),r},mr=Symbol(),Bs=e=>typeof e?.subscribe=="function",Di=(e,t,n)=>{const r=e().map(s=>Bs(s)?jt(s):mr),i=G(()=>e().map((s,a)=>r[a]===mr?s:r[a].current)),o=()=>{m(i);let s;return ce(()=>{s=t(m(i))}),s};n?k(o):tt(o)},Hs=(e,t)=>Di(e,t,!1),$s=(e,t)=>Di(e,t,!0);Object.assign(Hs,{pre:$s});const fe=(e,t)=>e?.[`is${t}`]===!0,Ws=typeof window<"u",me=(e,t)=>{const n=xi(e,o=>o);let r;const i=n.subscribe(async o=>{r&&r();const s=await t(o);s&&(r=s)});nn(()=>{i(),r&&r()})},O=e=>{const t=en(e),n={set:r=>{n.current=r,t.set(r)},subscribe:t.subscribe,update:r=>{const i=r(n.current);n.current=i,t.set(i)},current:e};return n},Gs=e=>({subscribe:e.subscribe,get current(){return e.current}}),Ei=(e,t)=>{if(t.includes(".")){const n=t.split("."),r=n.pop();for(let i=0;i<n.length;i+=1)e=e[n[i]];return{target:e,key:r}}else return{target:e,key:t}},Ks=e=>{const{dom:t,canvas:n}=e,r=O({width:t.offsetWidth,height:t.offsetHeight});Si(()=>{const o=new ResizeObserver(()=>{const{offsetWidth:s,offsetHeight:a}=t;(r.current.width!==s||r.current.height!==a)&&r.set({width:s,height:a})});return o.observe(t),()=>{o.disconnect()}});const i={dom:t,canvas:n,size:Gs(r)};return ee("threlte-dom-context",i),i},Hn=()=>{const e=J("threlte-dom-context");if(!e)throw new Error("useDOM can only be used in a child component to <Canvas>.");return e};function qs(e){return{all:e=e||new Map,on:function(t,n){var r=e.get(t);r?r.push(n):e.set(t,[n])},off:function(t,n){var r=e.get(t);r&&(n?r.splice(r.indexOf(n)>>>0,1):e.set(t,[]))},emit:function(t,n){var r=e.get(t);r&&r.slice().map(function(i){i(n)}),(r=e.get("*"))&&r.slice().map(function(i){i(t,n)})}}}class Me{allVertices={};isolatedVertices={};connectedVertices={};sortedConnectedValues=[];needsSort=!1;emitter=qs();emit=this.emitter.emit.bind(this.emitter);on=this.emitter.on.bind(this.emitter);off=this.emitter.off.bind(this.emitter);get sortedVertices(){return this.mapNodes(t=>t)}moveToIsolated(t){const n=this.connectedVertices[t];n&&(this.isolatedVertices[t]=n,delete this.connectedVertices[t])}moveToConnected(t){const n=this.isolatedVertices[t];n&&(this.connectedVertices[t]=n,delete this.isolatedVertices[t])}getKey=t=>typeof t=="object"?t.key:t;add(t,n,r){if(this.allVertices[t]&&this.allVertices[t].value!==void 0)throw new Error(`A node with the key ${t.toString()} already exists`);let i=this.allVertices[t];i?i.value===void 0&&(i.value=n):(i={value:n,previous:new Set,next:new Set},this.allVertices[t]=i);const o=i.next.size>0||i.previous.size>0;if(!r?.after&&!r?.before&&!o){this.isolatedVertices[t]=i,this.emit("node:added",{key:t,type:"isolated",value:n});return}else this.connectedVertices[t]=i;if(r?.after){const s=Array.isArray(r.after)?r.after:[r.after];s.forEach(a=>{i.previous.add(this.getKey(a))}),s.forEach(a=>{const c=this.getKey(a),l=this.allVertices[c];l?(l.next.add(t),this.moveToConnected(c)):(this.allVertices[c]={value:void 0,previous:new Set,next:new Set([t])},this.connectedVertices[c]=this.allVertices[c])})}if(r?.before){const s=Array.isArray(r.before)?r.before:[r.before];s.forEach(a=>{i.next.add(this.getKey(a))}),s.forEach(a=>{const c=this.getKey(a),l=this.allVertices[c];l?(l.previous.add(t),this.moveToConnected(c)):(this.allVertices[c]={value:void 0,previous:new Set([t]),next:new Set},this.connectedVertices[c]=this.allVertices[c])})}this.emit("node:added",{key:t,type:"connected",value:n}),this.needsSort=!0}remove(t){const n=this.getKey(t);if(this.isolatedVertices[n]){delete this.isolatedVertices[n],delete this.allVertices[n],this.emit("node:removed",{key:n,type:"isolated"});return}const i=this.connectedVertices[n];i&&(i.next.forEach(o=>{const s=this.connectedVertices[o];s&&(s.previous.delete(n),s.previous.size===0&&s.next.size===0&&this.moveToIsolated(o))}),i.previous.forEach(o=>{const s=this.connectedVertices[o];s&&(s.next.delete(n),s.previous.size===0&&s.next.size===0&&this.moveToIsolated(o))}),delete this.connectedVertices[n],delete this.allVertices[n],this.emit("node:removed",{key:n,type:"connected"}),this.needsSort=!0)}mapNodes(t){this.needsSort&&this.sort();const n=[];return this.forEachNode((r,i)=>{n.push(t(r,i))}),n}forEachNode(t){this.needsSort&&this.sort();let n=0;for(;n<this.sortedConnectedValues.length;n++)t(this.sortedConnectedValues[n],n);Reflect.ownKeys(this.isolatedVertices).forEach(r=>{const i=this.isolatedVertices[r];i.value!==void 0&&t(i.value,n++)})}getValueByKey(t){return this.allVertices[t]?.value}getKeyByValue(t){return Reflect.ownKeys(this.connectedVertices).find(n=>this.connectedVertices[n].value===t)??Reflect.ownKeys(this.isolatedVertices).find(n=>this.isolatedVertices[n].value===t)}sort(){const t=new Map,n=[],r=[],i=Reflect.ownKeys(this.connectedVertices).filter(s=>this.connectedVertices[s].value!==void 0);for(i.forEach(s=>{t.set(s,0)}),i.forEach(s=>{this.connectedVertices[s].next.forEach(c=>{this.connectedVertices[c]&&t.set(c,(t.get(c)||0)+1)})}),t.forEach((s,a)=>{s===0&&n.push(a)});n.length>0;){const s=n.shift();r.push(s);const a=i.find(c=>c===s);a&&this.connectedVertices[a]?.next.forEach(c=>{const l=(t.get(c)||0)-1;t.set(c,l),l===0&&n.push(c)})}if(r.length!==i.length)throw new Error("The graph contains a cycle, and thus can not be sorted topologically.");const o=s=>s!==void 0;this.sortedConnectedValues=r.map(s=>this.connectedVertices[s].value).filter(o),this.needsSort=!1}clear(){this.allVertices={},this.isolatedVertices={},this.connectedVertices={},this.sortedConnectedValues=[],this.needsSort=!1}static isKey(t){return typeof t=="string"||typeof t=="symbol"}static isValue(t){return typeof t=="object"&&"key"in t}}class Zs{key;stage;callback;runTask=!0;stop(){this.runTask=!1}start(){this.runTask=!0}constructor(t,n,r){this.stage=t,this.key=n,this.callback=r}run(t){this.runTask&&this.callback(t)}}class Ys extends Me{key;scheduler;runTask=!0;stop(){this.runTask=!1}start(){this.runTask=!0}get tasks(){return this.sortedVertices}callback=(t,n)=>n();constructor(t,n,r){super(),this.scheduler=t,this.key=n,this.start=this.start.bind(this),this.stop=this.stop.bind(this),r&&(this.callback=r.bind(this))}createTask(t,n,r){const i=new Zs(this,t,n);return this.add(t,i,r),i}getTask(t){return this.getValueByKey(t)}removeTask=this.remove.bind(this);run(t){this.runTask&&this.callback(t,n=>{this.forEachNode(r=>{r.run(n??t)})})}runWithTiming(t){if(!this.runTask)return{};const n={};return this.callback(t,r=>{this.forEachNode(i=>{const o=performance.now();i.run(r??t);const s=performance.now()-o;n[i.key]=s})}),n}getSchedule(){return this.mapNodes(t=>t.key.toString())}}class Qs extends Me{lastTime=performance.now();clampDeltaTo=.1;get stages(){return this.sortedVertices}constructor(t){super(),t?.clampDeltaTo&&(this.clampDeltaTo=t.clampDeltaTo),this.run=this.run.bind(this)}createStage(t,n){const r=new Ys(this,t,n?.callback);return this.add(t,r,{after:n?.after,before:n?.before}),r}getStage(t){return this.getValueByKey(t)}removeStage=this.remove.bind(this);run(t){const n=t-this.lastTime;this.forEachNode(r=>{r.run(Math.min(n/1e3,this.clampDeltaTo))}),this.lastTime=t}runWithTiming(t){const n=t-this.lastTime,r={},i=performance.now();return this.forEachNode(o=>{const s=performance.now(),a=o.runWithTiming(Math.min(n/1e3,this.clampDeltaTo)),c=performance.now()-s;r[o.key.toString()]={duration:c,tasks:a}}),{total:performance.now()-i,stages:r}}getSchedule(t={tasks:!0}){return{stages:this.mapNodes(n=>{if(n===void 0)throw new Error("Stage not found");return{key:n.key.toString(),tasks:t.tasks?n.getSchedule():void 0}})}}dispose(){this.clear()}}const Xs=e=>{const t=new Qs,n=t.createStage(Symbol("threlte-main-stage")),r={scheduler:t,frameInvalidated:!0,autoInvalidations:new Set,shouldAdvance:!1,advance:()=>{r.shouldAdvance=!0},autoRender:O(e.autoRender??!0),renderMode:O(e.renderMode??"on-demand"),invalidate(){r.frameInvalidated=!0},mainStage:n,shouldRender:()=>r.renderMode.current==="always"||r.renderMode.current==="on-demand"&&(r.frameInvalidated||r.autoInvalidations.size>0)||r.renderMode.current==="manual"&&r.shouldAdvance,renderStage:t.createStage(Symbol("threlte-render-stage"),{after:n,callback(i,o){r.shouldRender()&&o()}}),resetFrameInvalidation(){r.frameInvalidated=!1,r.shouldAdvance=!1}};return tt(()=>{r.autoRender.set(e.autoRender??!0)}),tt(()=>{r.renderMode.set(e.renderMode??"on-demand")}),nn(()=>{r.scheduler.dispose()}),ee("threlte-scheduler-context",r),r},rn=()=>{const e=J("threlte-scheduler-context");if(!e)throw new Error("useScheduler can only be used in a child component to <Canvas>.");return e},Js=()=>{const{size:e}=Hn(),{invalidate:t}=rn(),n=new Vi(75,0,.1,1e3);n.position.z=5,n.lookAt(0,0,0);const r=O(n);me(e,o=>{if(r.current===n){const s=r.current;s.aspect=o.width/o.height,s.updateProjectionMatrix(),t()}}),me(r,o=>{o===void 0&&r.set(n)});const i={camera:r};return ee("threlte-camera-context",i),i},Ci=()=>{const e=J("threlte-camera-context");if(!e)throw new Error("useCamera can only be used in a child component to <Canvas>.");return e},ea=()=>{const e={removeObjectFromDisposal:t=>{e.disposableObjects.delete(t)},disposableObjectMounted:t=>{const n=e.disposableObjects.get(t);n?e.disposableObjects.set(t,n+1):e.disposableObjects.set(t,1)},disposableObjectUnmounted:t=>{const n=e.disposableObjects.get(t);n&&n>0&&(e.disposableObjects.set(t,n-1),n-1<=0&&(e.shouldDispose=!0))},disposableObjects:new Map,shouldDispose:!1,dispose:async(t=!1)=>{await vi(),!(!e.shouldDispose&&!t)&&(e.disposableObjects.forEach((n,r)=>{(n===0||t)&&(r?.dispose?.(),e.disposableObjects.delete(r))}),e.shouldDispose=!1)}};return nn(()=>{e.dispose(!0)}),ee("threlte-disposal-context",e),e},Mi=()=>{const e=J("threlte-disposal-context");if(!e)throw new Error("useDisposal can only be used in a child component to <Canvas>.");return e},Ti=Symbol("threlte-parent-context"),Oi=e=>{const t=O(e);return ee(Ti,t),t},ta=()=>J(Ti),Lt=Symbol("threlte-parent-object3d-context"),na=e=>{const t=Bn(e);return ee(Lt,t),t},ra=e=>{const t=J(Lt),n=en(e),r=xi([n,t],([i,o])=>i??o);return ee(Lt,r),n},ia=()=>J(Lt);function Ai(e,t,n){if(!Ws)return{task:void 0,start:()=>{},stop:()=>{},started:Bn(!1)};let r,i,o;Me.isKey(e)?(r=e,i=t,o=n):(r=Symbol("useTask"),i=e,o=t);const s=rn(),a=o?.autoInvalidate??!0;let c=s.mainStage,l=G(()=>o?.running?.()??o?.autoStart??!0);if(o){if(o.stage)if(Me.isValue(o.stage))c=o.stage;else{const u=s.scheduler.getStage(o.stage);if(!u)throw new Error(`No stage found with key ${o.stage.toString()}`);c=u}else if(o.after)if(Array.isArray(o.after))for(let u=0;u<o.after.length;u++){const d=o.after[u];if(Me.isValue(d)){c=d.stage;break}}else Me.isValue(o.after)&&(c=o.after.stage);else if(o.before)if(Array.isArray(o.before))for(let u=0;u<o.before.length;u++){const d=o.before[u];if(Me.isValue(d)){c=d.stage;break}}else Me.isValue(o.before)&&(c=o.before.stage)}const f=c.createTask(r,i,o);return k(()=>{if(m(l))return f.start(),a&&s.autoInvalidations.add(i),()=>{f.stop(),a&&s.autoInvalidations.delete(i)}}),k(()=>()=>{c.removeTask(r)}),{task:f,start:()=>{B(l,!0)},stop:()=>{B(l,!1)},started:Ls(()=>m(l))}}const oa=e=>{const t={scene:new Fi};return ee("threlte-scene-context",t),t},Ii=()=>{const e=J("threlte-scene-context");if(!e)throw new Error("useScene can only be used in a child component to <Canvas>.");return e},sa=e=>{const{dispose:t}=Mi(),{camera:n}=Ci(),{scene:r}=Ii(),{invalidate:i,renderStage:o,autoRender:s,scheduler:a,resetFrameInvalidation:c}=rn(),{size:l,canvas:f}=Hn(),u=e.createRenderer?e.createRenderer(f):new ji({canvas:f,powerPreference:"high-performance",antialias:!0,alpha:!0}),d=o.createTask(Symbol("threlte-auto-render-task"),()=>{u.render(r,n.current)}),v={renderer:u,colorManagementEnabled:O(e.colorManagementEnabled??!0),colorSpace:O(e.colorSpace??"srgb"),dpr:O(e.dpr??window.devicePixelRatio),shadows:O(e.shadows??cn),toneMapping:O(e.toneMapping??Zn),autoRenderTask:d};ee("threlte-renderer-context",v),me([v.colorManagementEnabled],([p])=>{Li.enabled=p}),me([v.colorSpace],([p])=>{"outputColorSpace"in u&&(u.outputColorSpace=p)}),me([v.dpr],([p])=>{"setPixelRatio"in u&&u.setPixelRatio(p)});const{start:h,stop:_}=Ai(()=>{!("xr"in u)||u.xr?.isPresenting||(u.setSize(l.current.width,l.current.height),i(),_())},{before:d,autoStart:!1,autoInvalidate:!1});return me([l],()=>{h()}),me([v.shadows],([p])=>{"shadowMap"in u&&(u.shadowMap.enabled=!!p,p&&p!==!0?u.shadowMap.type=p:p===!0&&(u.shadowMap.type=cn))}),me([v.toneMapping],([p])=>{"toneMapping"in u&&(u.toneMapping=p)}),me([s],([p])=>(p?v.autoRenderTask.start():v.autoRenderTask.stop(),()=>{v.autoRenderTask.stop()})),"setAnimationLoop"in v.renderer&&v.renderer.setAnimationLoop(y=>{t(),a.run(y),c()}),nn(()=>{if("dispose"in v.renderer){const p=v.renderer.dispose;p()}}),k(()=>{v.colorManagementEnabled.set(e.colorManagementEnabled??!0)}),k(()=>{v.colorSpace.set(e.colorSpace??"srgb")}),k(()=>{v.toneMapping.set(e.toneMapping??Zn)}),k(()=>{v.shadows.set(e.shadows??cn)}),k(()=>{v.dpr.set(e.dpr??window.devicePixelRatio)}),v},aa=()=>{const e=J("threlte-renderer-context");if(!e)throw new Error("useRenderer can only be used in a child component to <Canvas>.");return e},ca=()=>{const e=O({});return ee("threlte-user-context",e),e},la=e=>{const{scene:t}=oa();return{scene:t,...Ks(e),...Us(),...Oi(t),...na(t),...ea(),...Xs(e),...Js(),...sa(e),...ca()}};function fa(e,t){$t(t,!0),la(tn(t,["$$slots","$$events","$$legacy","children"]));var r=Xt(),i=qt(r);Jt(i,()=>t.children),ht(e,r),Wt()}var ua=us('<div class="svelte-clyidt"><canvas class="svelte-clyidt"><!></canvas></div>');function Fc(e,t){let n=tn(t,["$$slots","$$events","$$legacy","children"]),r=le(void 0),i=le(void 0);var o=ua(),s=rr(o),a=rr(s);{var c=l=>{fa(l,wi({get dom(){return m(i)},get canvas(){return m(r)}},()=>n,{children:(f,u)=>{var d=Xt(),v=qt(d);Jt(v,()=>t.children??P),ht(f,d)},$$slots:{default:!0}}))};_s(a,l=>{m(r)&&m(i)&&l(c)})}hr(s,l=>B(r,l),()=>m(r)),hr(o,l=>B(i,l),()=>m(i)),ht(e,o)}const Ct=()=>{const e=rn(),t=aa(),n=Ci(),r=Ii(),i=Hn();return{advance:e.advance,autoRender:e.autoRender,autoRenderTask:t.autoRenderTask,camera:n.camera,colorManagementEnabled:t.colorManagementEnabled,colorSpace:t.colorSpace,dpr:t.dpr,invalidate:e.invalidate,mainStage:e.mainStage,renderer:t.renderer,renderMode:e.renderMode,renderStage:e.renderStage,scheduler:e.scheduler,shadows:t.shadows,shouldRender:e.shouldRender,dom:i.dom,canvas:i.canvas,size:i.size,toneMapping:t.toneMapping,get scene(){return r.scene},set scene(s){r.scene=s}}},da=e=>typeof e=="object"&&e!==null,va=(e,t)=>{const{invalidate:n}=Ct(),r=G(e),i=G(t),o=jt(ta()),s=jt(ia()),a=Oi(),c=ra();k(()=>{a.set(m(r)),fe(m(r),"Object3D")&&c.set(m(r)),n()}),k(()=>{n();const l=m(r);if(m(i)===void 0&&fe(l,"Object3D"))return s.current?.add(l),()=>{n(),s.current?.remove(l)};if(m(i)===void 0&&da(o.current)){const f=o.current;if(fe(l,"Material")){const u=f.material;return f.material=l,()=>{n(),f.material=u}}else if(fe(l,"BufferGeometry")){const u=f.geometry;return f.geometry=l,()=>{n(),f.geometry=u}}}if(m(i)===!1)return()=>{n()};if(typeof m(i)=="function"){const f=m(i)({ref:l,parent:o.current,parentObject3D:s.current});return()=>{n(),f?.()}}if(typeof m(i)=="string"){const{target:f,key:u}=Ei(o.current,m(i));if(u in f){const d=f[u];return f[u]=l,()=>{n(),f[u]=d}}else return f[u]=l,()=>{n(),delete f[u]}}if(fe(m(i),"Object3D")&&fe(l,"Object3D"))return m(i).add(l),()=>{n(),m(i).remove(l)}})},un=new Set,ha=(e,t,n)=>{const{invalidate:r,size:i,camera:o}=Ct(),s=G(e),a=jt(i);k(()=>{if(!n())return;const c=m(s);return un.add(c),o.set(c),r(),()=>{un.delete(c),un.size===0&&(o.set(void 0),r())}}),k(()=>{if(t())return;const{width:c,height:l}=a.current;fe(m(s),"PerspectiveCamera")?m(s).aspect=c/l:fe(m(s),"OrthographicCamera")&&(m(s).left=c/-2,m(s).right=c/2,m(s).top=l/2,m(s).bottom=l/-2),m(s).updateProjectionMatrix(),m(s).updateMatrixWorld(),r()})},Dn=Symbol("threlte-disposable-object-context"),pa=e=>typeof e?.dispose=="function",ma=e=>{const t=J(Dn),n=G(()=>e()??t?.()??!0);ee(Dn,()=>m(n))},_a=e=>{const t=G(e),{disposableObjectMounted:n,disposableObjectUnmounted:r,removeObjectFromDisposal:i}=Mi(),o=J(Dn),s=G(()=>o?.()??!0);tt(()=>{if(m(s))return n(m(t)),()=>r(m(t));i(m(t))})},ga=e=>e!==null&&typeof e=="object"&&"addEventListener"in e&&"removeEventListener"in e,ya=(e,t,n)=>{const r=G(e);for(const i of t){const o=G(()=>n[i]);i.startsWith("on")&&k(()=>{if(typeof m(o)!="function"||!ga(m(r)))return;const s=i.slice(2);return m(r).addEventListener(s,m(o)),()=>m(r).removeEventListener(s,m(o))})}};let En;const xa=e=>{En=e},ba=()=>{const e=En;return En=void 0,e},wa="threlte-plugin-context",Sa=e=>{const t=J(wa);if(!t)return;const n=[],r=Object.values(t);if(r.length>0){const i=e();for(let o=0;o<r.length;o++){const s=r[o],a=s(i);a&&a.pluginProps&&n.push(...a.pluginProps)}}return{pluginsProps:n}},Da=new Set(["$$scope","$$slots","type","args","attach","instance"]),Ea=new Set(["fov","aspect","near","far","left","right","top","bottom","zoom"]),Ca=e=>typeof e=="string"||typeof e=="number"||typeof e=="boolean"||typeof e>"u"||e===null,_r=(e,t,n)=>!Array.isArray(n)&&typeof n=="number"&&typeof e[t]=="object"&&e[t]!==null&&typeof e[t]?.setScalar=="function"&&!e[t]?.isColor?(r,i,o)=>{r[i].setScalar(o)}:typeof e[t]?.set=="function"&&typeof e[t]=="object"&&e[t]!==null?Array.isArray(n)?(r,i,o)=>{r[i].set(...o)}:(r,i,o)=>{r[i].set(o)}:(r,i,o)=>{r[i]=o},Ma=()=>{const{invalidate:e}=Ct(),t=new Map,n=new Map,r=(o,s,a,c)=>{if(Ca(a)){const u=t.get(s);if(u&&u.instance===o&&u.value===a)return;t.set(s,{instance:o,value:a})}const{key:l,target:f}=Ei(o,s);if(a!=null){const u=n.get(s);if(u)u(f,l,a);else{const d=_r(f,l,a);n.set(s,d),d(f,l,a)}}else _r(f,l,a)(f,l,a);c||Ea.has(l)&&(f.isPerspectiveCamera||f.isOrthographicCamera)&&f.updateProjectionMatrix()};return{updateProp:(o,s,a,c,l)=>{!Da.has(s)&&!c?.includes(s)&&r(o,s,a,l),e()}}},Ta=e=>typeof e=="function"&&Function.prototype.toString.call(e).startsWith("class "),Oa=(e,t)=>Ta(e)?Array.isArray(t)?new e(...t):new e:e;function dn(e,t){$t(t,!0);let n=Ze(t,"is",19,ba),r=Ze(t,"manual",3,!1),i=Ze(t,"makeDefault",3,!1),o=Ze(t,"ref",15),s=tn(t,["$$slots","$$events","$$legacy","is","args","attach","manual","makeDefault","dispose","ref","oncreate","children"]);const a=G(()=>Oa(n(),t.args));k(()=>{o()!==m(a)&&o(m(a))});const c=Sa(()=>({get ref(){return m(a)},get args(){return t.args},get attach(){return t.attach},get manual(){return r()},get makeDefault(){return i()},get dispose(){return t.dispose},get props(){return s}})),l=Object.keys(s),{updateProp:f}=Ma();l.forEach(v=>{const h=G(()=>s[v]);k(()=>{f(m(a),v,m(h),c?.pluginsProps,r())})}),va(()=>m(a),()=>t.attach),k(()=>{(fe(m(a),"PerspectiveCamera")||fe(m(a),"OrthographicCamera"))&&ha(()=>m(a),()=>r(),()=>i())}),ma(()=>t.dispose),k(()=>{pa(m(a))&&_a(()=>m(a))}),ya(()=>m(a),l,s),tt(()=>{m(a);let v;return ce(()=>{v=t.oncreate?.(m(a))}),v});var u=Xt(),d=qt(u);Jt(d,()=>t.children??P,()=>({ref:m(a)})),ht(e,u),Wt()}const Aa={},gr=new Proxy(dn,{get(e,t){if(typeof t!="string")return dn;const n=Aa[t]||Ui[t];if(n===void 0)throw new Error(`No Three.js module found for ${t}. Did you forget to extend the catalogue?`);return xa(n),dn}});function Ia(e,t){const{scheduler:n}=Ct();return n.getStage(e)??n.createStage(e,t)}const Re=e=>({subscribe:e.subscribe,get current(){return e.current}});let ut=0;const $n=O(!1),on=O(!1),Wn=O(void 0),Gn=O(0),Kn=O(0),Pi=O([]),qn=O(0),{onStart:Pa,onLoad:ka,onError:Na}=gt;gt.onStart=(e,t,n)=>{Pa?.(e,t,n),on.set(!0),Wn.set(e),Gn.set(t),Kn.set(n);const r=(t-ut)/(n-ut);qn.set(r),r===1&&$n.set(!0)};gt.onLoad=()=>{ka?.(),on.set(!1)};gt.onError=e=>{Na?.(e),Pi.update(t=>[...t,e])};gt.onProgress=(e,t,n)=>{t===n&&(ut=n),on.set(!0),Wn.set(e),Gn.set(t),Kn.set(n);const r=(t-ut)/(n-ut)||1;qn.set(r),r===1&&$n.set(!0)};Re(on),Re(Wn),Re(Gn),Re(Kn),Re(Pi),Re(qn),Re($n);new I;new I;new I;new On;new rt;new br;new I;new I;new rt;new I;new I;new Bi;new I;new I;new I;new Ut;const Ra="Right",za="Top",Va="Front",Fa="Left",ja="Bottom",La="Back";[Ra,za,Va,Fa,ja,La].map(e=>e.toLocaleLowerCase());new Bt;new I;Pt.line={worldUnits:{value:1},linewidth:{value:1},resolution:{value:new Ut(1,1)},dashOffset:{value:0},dashScale:{value:1},dashSize:{value:1},gapSize:{value:1}};Hi.line={uniforms:$i.merge([Pt.common,Pt.fog,Pt.line]),vertexShader:`
		#include <common>
		#include <color_pars_vertex>
		#include <fog_pars_vertex>
		#include <logdepthbuf_pars_vertex>
		#include <clipping_planes_pars_vertex>

		uniform float linewidth;
		uniform vec2 resolution;

		attribute vec3 instanceStart;
		attribute vec3 instanceEnd;

		attribute vec3 instanceColorStart;
		attribute vec3 instanceColorEnd;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#ifdef USE_DASH

			uniform float dashScale;
			attribute float instanceDistanceStart;
			attribute float instanceDistanceEnd;
			varying float vLineDistance;

		#endif

		void trimSegment( const in vec4 start, inout vec4 end ) {

			// trim end segment so it terminates between the camera plane and the near plane

			// conservative estimate of the near plane
			float a = projectionMatrix[ 2 ][ 2 ]; // 3nd entry in 3th column
			float b = projectionMatrix[ 3 ][ 2 ]; // 3nd entry in 4th column
			float nearEstimate = - 0.5 * b / a;

			float alpha = ( nearEstimate - start.z ) / ( end.z - start.z );

			end.xyz = mix( start.xyz, end.xyz, alpha );

		}

		void main() {

			#ifdef USE_COLOR

				vColor.xyz = ( position.y < 0.5 ) ? instanceColorStart : instanceColorEnd;

			#endif

			#ifdef USE_DASH

				vLineDistance = ( position.y < 0.5 ) ? dashScale * instanceDistanceStart : dashScale * instanceDistanceEnd;
				vUv = uv;

			#endif

			float aspect = resolution.x / resolution.y;

			// camera space
			vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
			vec4 end = modelViewMatrix * vec4( instanceEnd, 1.0 );

			#ifdef WORLD_UNITS

				worldStart = start.xyz;
				worldEnd = end.xyz;

			#else

				vUv = uv;

			#endif

			// special case for perspective projection, and segments that terminate either in, or behind, the camera plane
			// clearly the gpu firmware has a way of addressing this issue when projecting into ndc space
			// but we need to perform ndc-space calculations in the shader, so we must address this issue directly
			// perhaps there is a more elegant solution -- WestLangley

			bool perspective = ( projectionMatrix[ 2 ][ 3 ] == - 1.0 ); // 4th entry in the 3rd column

			if ( perspective ) {

				if ( start.z < 0.0 && end.z >= 0.0 ) {

					trimSegment( start, end );

				} else if ( end.z < 0.0 && start.z >= 0.0 ) {

					trimSegment( end, start );

				}

			}

			// clip space
			vec4 clipStart = projectionMatrix * start;
			vec4 clipEnd = projectionMatrix * end;

			// ndc space
			vec3 ndcStart = clipStart.xyz / clipStart.w;
			vec3 ndcEnd = clipEnd.xyz / clipEnd.w;

			// direction
			vec2 dir = ndcEnd.xy - ndcStart.xy;

			// account for clip-space aspect ratio
			dir.x *= aspect;
			dir = normalize( dir );

			#ifdef WORLD_UNITS

				vec3 worldDir = normalize( end.xyz - start.xyz );
				vec3 tmpFwd = normalize( mix( start.xyz, end.xyz, 0.5 ) );
				vec3 worldUp = normalize( cross( worldDir, tmpFwd ) );
				vec3 worldFwd = cross( worldDir, worldUp );
				worldPos = position.y < 0.5 ? start: end;

				// height offset
				float hw = linewidth * 0.5;
				worldPos.xyz += position.x < 0.0 ? hw * worldUp : - hw * worldUp;

				// don't extend the line if we're rendering dashes because we
				// won't be rendering the endcaps
				#ifndef USE_DASH

					// cap extension
					worldPos.xyz += position.y < 0.5 ? - hw * worldDir : hw * worldDir;

					// add width to the box
					worldPos.xyz += worldFwd * hw;

					// endcaps
					if ( position.y > 1.0 || position.y < 0.0 ) {

						worldPos.xyz -= worldFwd * 2.0 * hw;

					}

				#endif

				// project the worldpos
				vec4 clip = projectionMatrix * worldPos;

				// shift the depth of the projected points so the line
				// segments overlap neatly
				vec3 clipPose = ( position.y < 0.5 ) ? ndcStart : ndcEnd;
				clip.z = clipPose.z * clip.w;

			#else

				vec2 offset = vec2( dir.y, - dir.x );
				// undo aspect ratio adjustment
				dir.x /= aspect;
				offset.x /= aspect;

				// sign flip
				if ( position.x < 0.0 ) offset *= - 1.0;

				// endcaps
				if ( position.y < 0.0 ) {

					offset += - dir;

				} else if ( position.y > 1.0 ) {

					offset += dir;

				}

				// adjust for linewidth
				offset *= linewidth;

				// adjust for clip-space to screen-space conversion // maybe resolution should be based on viewport ...
				offset /= resolution.y;

				// select end
				vec4 clip = ( position.y < 0.5 ) ? clipStart : clipEnd;

				// back to clip space
				offset *= clip.w;

				clip.xy += offset;

			#endif

			gl_Position = clip;

			vec4 mvPosition = ( position.y < 0.5 ) ? start : end; // this is an approximation

			#include <logdepthbuf_vertex>
			#include <clipping_planes_vertex>
			#include <fog_vertex>

		}
		`,fragmentShader:`
		uniform vec3 diffuse;
		uniform float opacity;
		uniform float linewidth;

		#ifdef USE_DASH

			uniform float dashOffset;
			uniform float dashSize;
			uniform float gapSize;

		#endif

		varying float vLineDistance;

		#ifdef WORLD_UNITS

			varying vec4 worldPos;
			varying vec3 worldStart;
			varying vec3 worldEnd;

			#ifdef USE_DASH

				varying vec2 vUv;

			#endif

		#else

			varying vec2 vUv;

		#endif

		#include <common>
		#include <color_pars_fragment>
		#include <fog_pars_fragment>
		#include <logdepthbuf_pars_fragment>
		#include <clipping_planes_pars_fragment>

		vec2 closestLineToLine(vec3 p1, vec3 p2, vec3 p3, vec3 p4) {

			float mua;
			float mub;

			vec3 p13 = p1 - p3;
			vec3 p43 = p4 - p3;

			vec3 p21 = p2 - p1;

			float d1343 = dot( p13, p43 );
			float d4321 = dot( p43, p21 );
			float d1321 = dot( p13, p21 );
			float d4343 = dot( p43, p43 );
			float d2121 = dot( p21, p21 );

			float denom = d2121 * d4343 - d4321 * d4321;

			float numer = d1343 * d4321 - d1321 * d4343;

			mua = numer / denom;
			mua = clamp( mua, 0.0, 1.0 );
			mub = ( d1343 + d4321 * ( mua ) ) / d4343;
			mub = clamp( mub, 0.0, 1.0 );

			return vec2( mua, mub );

		}

		void main() {

			#include <clipping_planes_fragment>

			#ifdef USE_DASH

				if ( vUv.y < - 1.0 || vUv.y > 1.0 ) discard; // discard endcaps

				if ( mod( vLineDistance + dashOffset, dashSize + gapSize ) > dashSize ) discard; // todo - FIX

			#endif

			float alpha = opacity;

			#ifdef WORLD_UNITS

				// Find the closest points on the view ray and the line segment
				vec3 rayEnd = normalize( worldPos.xyz ) * 1e5;
				vec3 lineDir = worldEnd - worldStart;
				vec2 params = closestLineToLine( worldStart, worldEnd, vec3( 0.0, 0.0, 0.0 ), rayEnd );

				vec3 p1 = worldStart + lineDir * params.x;
				vec3 p2 = rayEnd * params.y;
				vec3 delta = p1 - p2;
				float len = length( delta );
				float norm = len / linewidth;

				#ifndef USE_DASH

					#ifdef USE_ALPHA_TO_COVERAGE

						float dnorm = fwidth( norm );
						alpha = 1.0 - smoothstep( 0.5 - dnorm, 0.5 + dnorm, norm );

					#else

						if ( norm > 0.5 ) {

							discard;

						}

					#endif

				#endif

			#else

				#ifdef USE_ALPHA_TO_COVERAGE

					// artifacts appear on some hardware if a derivative is taken within a conditional
					float a = vUv.x;
					float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
					float len2 = a * a + b * b;
					float dlen = fwidth( len2 );

					if ( abs( vUv.y ) > 1.0 ) {

						alpha = 1.0 - smoothstep( 1.0 - dlen, 1.0 + dlen, len2 );

					}

				#else

					if ( abs( vUv.y ) > 1.0 ) {

						float a = vUv.x;
						float b = ( vUv.y > 0.0 ) ? vUv.y - 1.0 : vUv.y + 1.0;
						float len2 = a * a + b * b;

						if ( len2 > 1.0 ) discard;

					}

				#endif

			#endif

			vec4 diffuseColor = vec4( diffuse, alpha );

			#include <logdepthbuf_fragment>
			#include <color_fragment>

			gl_FragColor = vec4( diffuseColor.rgb, alpha );

			#include <tonemapping_fragment>
			#include <colorspace_fragment>
			#include <fog_fragment>
			#include <premultiplied_alpha_fragment>

		}
		`};new yt;new I;new I;new yt;new yt;new yt;new I;new rt;new Wi;new I;new Bt;new On;new yt;new rt;new rt;new Gi;`${ue.logdepthbuf_pars_vertex}${ue.fog_pars_vertex}${ue.logdepthbuf_vertex}${ue.fog_vertex}`;function jc(e,t){$t(t,!0);const n=()=>ks(f,"$camera",r),[r,i]=Ns();let o=Ze(t,"follow",3,!0),s=Ze(t,"ref",15),a=tn(t,["$$slots","$$events","$$legacy","follow","ref","children"]);const c=new Yn,l=new Yn,{camera:f,renderStage:u}=Ct(),d=new Ki;let v=G(()=>o()===!0?n():o()===!1?void 0:o());const h=Ia("<Billboard>",{before:u});Ai(()=>{l.updateMatrix(),l.updateWorldMatrix(!1,!1),l.getWorldQuaternion(d),m(v)?.getWorldQuaternion(c.quaternion).premultiply(d.invert())},{stage:h,running:()=>o()!==!1}),gr(e,wi({get is(){return l}},()=>a,{get ref(){return s()},set ref(_){s(_)},children:(_,p)=>{gr(_,{get is(){return c},children:(y,S)=>{var g=Xt(),x=qt(g);Jt(x,()=>t.children??P,()=>({ref:l})),ht(y,g)},$$slots:{default:!0}})},$$slots:{default:!0}})),Wt(),i()}`${ue.tonemapping_fragment}${ue.colorspace_fragment}`;`${ue.tonemapping_fragment}${ue.colorspace_fragment}`;const Ua=`

// A stack of uint32 indices can can store the indices for
// a perfectly balanced tree with a depth up to 31. Lower stack
// depth gets higher performance.
//
// However not all trees are balanced. Best value to set this to
// is the trees max depth.
#ifndef BVH_STACK_DEPTH
#define BVH_STACK_DEPTH 60
#endif

#ifndef INFINITY
#define INFINITY 1e20
#endif

// Utilities
uvec4 uTexelFetch1D( usampler2D tex, uint index ) {

	uint width = uint( textureSize( tex, 0 ).x );
	uvec2 uv;
	uv.x = index % width;
	uv.y = index / width;

	return texelFetch( tex, ivec2( uv ), 0 );

}

ivec4 iTexelFetch1D( isampler2D tex, uint index ) {

	uint width = uint( textureSize( tex, 0 ).x );
	uvec2 uv;
	uv.x = index % width;
	uv.y = index / width;

	return texelFetch( tex, ivec2( uv ), 0 );

}

vec4 texelFetch1D( sampler2D tex, uint index ) {

	uint width = uint( textureSize( tex, 0 ).x );
	uvec2 uv;
	uv.x = index % width;
	uv.y = index / width;

	return texelFetch( tex, ivec2( uv ), 0 );

}

vec4 textureSampleBarycoord( sampler2D tex, vec3 barycoord, uvec3 faceIndices ) {

	return
		barycoord.x * texelFetch1D( tex, faceIndices.x ) +
		barycoord.y * texelFetch1D( tex, faceIndices.y ) +
		barycoord.z * texelFetch1D( tex, faceIndices.z );

}

void ndcToCameraRay(
	vec2 coord, mat4 cameraWorld, mat4 invProjectionMatrix,
	out vec3 rayOrigin, out vec3 rayDirection
) {

	// get camera look direction and near plane for camera clipping
	vec4 lookDirection = cameraWorld * vec4( 0.0, 0.0, - 1.0, 0.0 );
	vec4 nearVector = invProjectionMatrix * vec4( 0.0, 0.0, - 1.0, 1.0 );
	float near = abs( nearVector.z / nearVector.w );

	// get the camera direction and position from camera matrices
	vec4 origin = cameraWorld * vec4( 0.0, 0.0, 0.0, 1.0 );
	vec4 direction = invProjectionMatrix * vec4( coord, 0.5, 1.0 );
	direction /= direction.w;
	direction = cameraWorld * direction - origin;

	// slide the origin along the ray until it sits at the near clip plane position
	origin.xyz += direction.xyz * near / dot( direction, lookDirection );

	rayOrigin = origin.xyz;
	rayDirection = direction.xyz;

}
`,Ba=`

#ifndef TRI_INTERSECT_EPSILON
#define TRI_INTERSECT_EPSILON 1e-5
#endif

// Raycasting
bool intersectsBounds( vec3 rayOrigin, vec3 rayDirection, vec3 boundsMin, vec3 boundsMax, out float dist ) {

	// https://www.reddit.com/r/opengl/comments/8ntzz5/fast_glsl_ray_box_intersection/
	// https://tavianator.com/2011/ray_box.html
	vec3 invDir = 1.0 / rayDirection;

	// find intersection distances for each plane
	vec3 tMinPlane = invDir * ( boundsMin - rayOrigin );
	vec3 tMaxPlane = invDir * ( boundsMax - rayOrigin );

	// get the min and max distances from each intersection
	vec3 tMinHit = min( tMaxPlane, tMinPlane );
	vec3 tMaxHit = max( tMaxPlane, tMinPlane );

	// get the furthest hit distance
	vec2 t = max( tMinHit.xx, tMinHit.yz );
	float t0 = max( t.x, t.y );

	// get the minimum hit distance
	t = min( tMaxHit.xx, tMaxHit.yz );
	float t1 = min( t.x, t.y );

	// set distance to 0.0 if the ray starts inside the box
	dist = max( t0, 0.0 );

	return t1 >= dist;

}

bool intersectsTriangle(
	vec3 rayOrigin, vec3 rayDirection, vec3 a, vec3 b, vec3 c,
	out vec3 barycoord, out vec3 norm, out float dist, out float side
) {

	// https://stackoverflow.com/questions/42740765/intersection-between-line-and-triangle-in-3d
	vec3 edge1 = b - a;
	vec3 edge2 = c - a;
	norm = cross( edge1, edge2 );

	float det = - dot( rayDirection, norm );
	float invdet = 1.0 / det;

	vec3 AO = rayOrigin - a;
	vec3 DAO = cross( AO, rayDirection );

	vec4 uvt;
	uvt.x = dot( edge2, DAO ) * invdet;
	uvt.y = - dot( edge1, DAO ) * invdet;
	uvt.z = dot( AO, norm ) * invdet;
	uvt.w = 1.0 - uvt.x - uvt.y;

	// set the hit information
	barycoord = uvt.wxy; // arranged in A, B, C order
	dist = uvt.z;
	side = sign( det );
	norm = side * normalize( norm );

	// add an epsilon to avoid misses between triangles
	uvt += vec4( TRI_INTERSECT_EPSILON );

	return all( greaterThanEqual( uvt, vec4( 0.0 ) ) );

}

bool intersectTriangles(
	// geometry info and triangle range
	sampler2D positionAttr, usampler2D indexAttr, uint offset, uint count,

	// ray
	vec3 rayOrigin, vec3 rayDirection,

	// outputs
	inout float minDistance, inout uvec4 faceIndices, inout vec3 faceNormal, inout vec3 barycoord,
	inout float side, inout float dist
) {

	bool found = false;
	vec3 localBarycoord, localNormal;
	float localDist, localSide;
	for ( uint i = offset, l = offset + count; i < l; i ++ ) {

		uvec3 indices = uTexelFetch1D( indexAttr, i ).xyz;
		vec3 a = texelFetch1D( positionAttr, indices.x ).rgb;
		vec3 b = texelFetch1D( positionAttr, indices.y ).rgb;
		vec3 c = texelFetch1D( positionAttr, indices.z ).rgb;

		if (
			intersectsTriangle( rayOrigin, rayDirection, a, b, c, localBarycoord, localNormal, localDist, localSide )
			&& localDist < minDistance
		) {

			found = true;
			minDistance = localDist;

			faceIndices = uvec4( indices.xyz, i );
			faceNormal = localNormal;

			side = localSide;
			barycoord = localBarycoord;
			dist = localDist;

		}

	}

	return found;

}

bool intersectsBVHNodeBounds( vec3 rayOrigin, vec3 rayDirection, sampler2D bvhBounds, uint currNodeIndex, out float dist ) {

	uint cni2 = currNodeIndex * 2u;
	vec3 boundsMin = texelFetch1D( bvhBounds, cni2 ).xyz;
	vec3 boundsMax = texelFetch1D( bvhBounds, cni2 + 1u ).xyz;
	return intersectsBounds( rayOrigin, rayDirection, boundsMin, boundsMax, dist );

}

// use a macro to hide the fact that we need to expand the struct into separate fields
#define	bvhIntersectFirstHit(		bvh,		rayOrigin, rayDirection, faceIndices, faceNormal, barycoord, side, dist	)	_bvhIntersectFirstHit(		bvh.position, bvh.index, bvh.bvhBounds, bvh.bvhContents,		rayOrigin, rayDirection, faceIndices, faceNormal, barycoord, side, dist	)

bool _bvhIntersectFirstHit(
	// bvh info
	sampler2D bvh_position, usampler2D bvh_index, sampler2D bvh_bvhBounds, usampler2D bvh_bvhContents,

	// ray
	vec3 rayOrigin, vec3 rayDirection,

	// output variables split into separate variables due to output precision
	inout uvec4 faceIndices, inout vec3 faceNormal, inout vec3 barycoord,
	inout float side, inout float dist
) {

	// stack needs to be twice as long as the deepest tree we expect because
	// we push both the left and right child onto the stack every traversal
	int pointer = 0;
	uint stack[ BVH_STACK_DEPTH ];
	stack[ 0 ] = 0u;

	float triangleDistance = INFINITY;
	bool found = false;
	while ( pointer > - 1 && pointer < BVH_STACK_DEPTH ) {

		uint currNodeIndex = stack[ pointer ];
		pointer --;

		// check if we intersect the current bounds
		float boundsHitDistance;
		if (
			! intersectsBVHNodeBounds( rayOrigin, rayDirection, bvh_bvhBounds, currNodeIndex, boundsHitDistance )
			|| boundsHitDistance > triangleDistance
		) {

			continue;

		}

		uvec2 boundsInfo = uTexelFetch1D( bvh_bvhContents, currNodeIndex ).xy;
		bool isLeaf = bool( boundsInfo.x & 0xffff0000u );

		if ( isLeaf ) {

			uint count = boundsInfo.x & 0x0000ffffu;
			uint offset = boundsInfo.y;

			found = intersectTriangles(
				bvh_position, bvh_index, offset, count,
				rayOrigin, rayDirection, triangleDistance,
				faceIndices, faceNormal, barycoord, side, dist
			) || found;

		} else {

			uint leftIndex = currNodeIndex + 1u;
			uint splitAxis = boundsInfo.x & 0x0000ffffu;
			uint rightIndex = currNodeIndex + boundsInfo.y;

			bool leftToRight = rayDirection[ splitAxis ] >= 0.0;
			uint c1 = leftToRight ? leftIndex : rightIndex;
			uint c2 = leftToRight ? rightIndex : leftIndex;

			// set c2 in the stack so we traverse it later. We need to keep track of a pointer in
			// the stack while we traverse. The second pointer added is the one that will be
			// traversed first
			pointer ++;
			stack[ pointer ] = c2;

			pointer ++;
			stack[ pointer ] = c1;

		}

	}

	return found;

}
`,Ha=`
struct BVH {

	usampler2D index;
	sampler2D position;

	sampler2D bvhBounds;
	usampler2D bvhContents;

};
`,$a=Ha,Wa=`
	${Ua}
	${Ba}
`;`${$a}${Wa}${ue.tonemapping_fragment}${ue.colorspace_fragment}`;new Bt;typeof window<"u"&&document.createElement("div");for(let e=0;e<256;e++)(e<16?"0":"")+e.toString(16);new qi(-1,1,1,-1,0,1);class Ga extends Zi{constructor(){super(),this.setAttribute("position",new Qn([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new Qn([0,2,0,0,2,0],2))}}new Ga;var ki={exports:{}};ki.exports=sn;ki.exports.default=sn;function sn(e,t,n){n=n||2;var r=t&&t.length,i=r?t[0]*n:e.length,o=Ni(e,0,i,n,!0),s=[];if(!o||o.next===o.prev)return s;var a,c,l,f,u,d,v;if(r&&(o=Qa(e,t,o,n)),e.length>80*n){a=l=e[0],c=f=e[1];for(var h=n;h<i;h+=n)u=e[h],d=e[h+1],u<a&&(a=u),d<c&&(c=d),u>l&&(l=u),d>f&&(f=d);v=Math.max(l-a,f-c),v=v!==0?32767/v:0}return pt(o,s,n,a,c,v,0),s}function Ni(e,t,n,r,i){var o,s;if(i===Tn(e,t,n,r)>0)for(o=t;o<n;o+=r)s=yr(o,e[o],e[o+1],s);else for(o=n-r;o>=t;o-=r)s=yr(o,e[o],e[o+1],s);return s&&an(s,s.next)&&(_t(s),s=s.next),s}function Be(e,t){if(!e)return e;t||(t=e);var n=e,r;do if(r=!1,!n.steiner&&(an(n,n.next)||C(n.prev,n,n.next)===0)){if(_t(n),n=t=n.prev,n===n.next)break;r=!0}else n=n.next;while(r||n!==t);return t}function pt(e,t,n,r,i,o,s){if(e){!s&&o&&nc(e,r,i,o);for(var a=e,c,l;e.prev!==e.next;){if(c=e.prev,l=e.next,o?qa(e,r,i,o):Ka(e)){t.push(c.i/n|0),t.push(e.i/n|0),t.push(l.i/n|0),_t(e),e=l.next,a=l.next;continue}if(e=l,e===a){s?s===1?(e=Za(Be(e),t,n),pt(e,t,n,r,i,o,2)):s===2&&Ya(e,t,n,r,i,o):pt(Be(e),t,n,r,i,o,1);break}}}}function Ka(e){var t=e.prev,n=e,r=e.next;if(C(t,n,r)>=0)return!1;for(var i=t.x,o=n.x,s=r.x,a=t.y,c=n.y,l=r.y,f=i<o?i<s?i:s:o<s?o:s,u=a<c?a<l?a:l:c<l?c:l,d=i>o?i>s?i:s:o>s?o:s,v=a>c?a>l?a:l:c>l?c:l,h=r.next;h!==t;){if(h.x>=f&&h.x<=d&&h.y>=u&&h.y<=v&&Ye(i,a,o,c,s,l,h.x,h.y)&&C(h.prev,h,h.next)>=0)return!1;h=h.next}return!0}function qa(e,t,n,r){var i=e.prev,o=e,s=e.next;if(C(i,o,s)>=0)return!1;for(var a=i.x,c=o.x,l=s.x,f=i.y,u=o.y,d=s.y,v=a<c?a<l?a:l:c<l?c:l,h=f<u?f<d?f:d:u<d?u:d,_=a>c?a>l?a:l:c>l?c:l,p=f>u?f>d?f:d:u>d?u:d,y=Cn(v,h,t,n,r),S=Cn(_,p,t,n,r),g=e.prevZ,x=e.nextZ;g&&g.z>=y&&x&&x.z<=S;){if(g.x>=v&&g.x<=_&&g.y>=h&&g.y<=p&&g!==i&&g!==s&&Ye(a,f,c,u,l,d,g.x,g.y)&&C(g.prev,g,g.next)>=0||(g=g.prevZ,x.x>=v&&x.x<=_&&x.y>=h&&x.y<=p&&x!==i&&x!==s&&Ye(a,f,c,u,l,d,x.x,x.y)&&C(x.prev,x,x.next)>=0))return!1;x=x.nextZ}for(;g&&g.z>=y;){if(g.x>=v&&g.x<=_&&g.y>=h&&g.y<=p&&g!==i&&g!==s&&Ye(a,f,c,u,l,d,g.x,g.y)&&C(g.prev,g,g.next)>=0)return!1;g=g.prevZ}for(;x&&x.z<=S;){if(x.x>=v&&x.x<=_&&x.y>=h&&x.y<=p&&x!==i&&x!==s&&Ye(a,f,c,u,l,d,x.x,x.y)&&C(x.prev,x,x.next)>=0)return!1;x=x.nextZ}return!0}function Za(e,t,n){var r=e;do{var i=r.prev,o=r.next.next;!an(i,o)&&Ri(i,r,r.next,o)&&mt(i,o)&&mt(o,i)&&(t.push(i.i/n|0),t.push(r.i/n|0),t.push(o.i/n|0),_t(r),_t(r.next),r=e=o),r=r.next}while(r!==e);return Be(r)}function Ya(e,t,n,r,i,o){var s=e;do{for(var a=s.next.next;a!==s.prev;){if(s.i!==a.i&&oc(s,a)){var c=zi(s,a);s=Be(s,s.next),c=Be(c,c.next),pt(s,t,n,r,i,o,0),pt(c,t,n,r,i,o,0);return}a=a.next}s=s.next}while(s!==e)}function Qa(e,t,n,r){var i=[],o,s,a,c,l;for(o=0,s=t.length;o<s;o++)a=t[o]*r,c=o<s-1?t[o+1]*r:e.length,l=Ni(e,a,c,r,!1),l===l.next&&(l.steiner=!0),i.push(ic(l));for(i.sort(Xa),o=0;o<i.length;o++)n=Ja(i[o],n);return n}function Xa(e,t){return e.x-t.x}function Ja(e,t){var n=ec(e,t);if(!n)return t;var r=zi(n,e);return Be(r,r.next),Be(n,n.next)}function ec(e,t){var n=t,r=e.x,i=e.y,o=-1/0,s;do{if(i<=n.y&&i>=n.next.y&&n.next.y!==n.y){var a=n.x+(i-n.y)*(n.next.x-n.x)/(n.next.y-n.y);if(a<=r&&a>o&&(o=a,s=n.x<n.next.x?n:n.next,a===r))return s}n=n.next}while(n!==t);if(!s)return null;var c=s,l=s.x,f=s.y,u=1/0,d;n=s;do r>=n.x&&n.x>=l&&r!==n.x&&Ye(i<f?r:o,i,l,f,i<f?o:r,i,n.x,n.y)&&(d=Math.abs(i-n.y)/(r-n.x),mt(n,e)&&(d<u||d===u&&(n.x>s.x||n.x===s.x&&tc(s,n)))&&(s=n,u=d)),n=n.next;while(n!==c);return s}function tc(e,t){return C(e.prev,e,t.prev)<0&&C(t.next,e,e.next)<0}function nc(e,t,n,r){var i=e;do i.z===0&&(i.z=Cn(i.x,i.y,t,n,r)),i.prevZ=i.prev,i.nextZ=i.next,i=i.next;while(i!==e);i.prevZ.nextZ=null,i.prevZ=null,rc(i)}function rc(e){var t,n,r,i,o,s,a,c,l=1;do{for(n=e,e=null,o=null,s=0;n;){for(s++,r=n,a=0,t=0;t<l&&(a++,r=r.nextZ,!!r);t++);for(c=l;a>0||c>0&&r;)a!==0&&(c===0||!r||n.z<=r.z)?(i=n,n=n.nextZ,a--):(i=r,r=r.nextZ,c--),o?o.nextZ=i:e=i,i.prevZ=o,o=i;n=r}o.nextZ=null,l*=2}while(s>1);return e}function Cn(e,t,n,r,i){return e=(e-n)*i|0,t=(t-r)*i|0,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,t=(t|t<<8)&16711935,t=(t|t<<4)&252645135,t=(t|t<<2)&858993459,t=(t|t<<1)&1431655765,e|t<<1}function ic(e){var t=e,n=e;do(t.x<n.x||t.x===n.x&&t.y<n.y)&&(n=t),t=t.next;while(t!==e);return n}function Ye(e,t,n,r,i,o,s,a){return(i-s)*(t-a)>=(e-s)*(o-a)&&(e-s)*(r-a)>=(n-s)*(t-a)&&(n-s)*(o-a)>=(i-s)*(r-a)}function oc(e,t){return e.next.i!==t.i&&e.prev.i!==t.i&&!sc(e,t)&&(mt(e,t)&&mt(t,e)&&ac(e,t)&&(C(e.prev,e,t.prev)||C(e,t.prev,t))||an(e,t)&&C(e.prev,e,e.next)>0&&C(t.prev,t,t.next)>0)}function C(e,t,n){return(t.y-e.y)*(n.x-t.x)-(t.x-e.x)*(n.y-t.y)}function an(e,t){return e.x===t.x&&e.y===t.y}function Ri(e,t,n,r){var i=It(C(e,t,n)),o=It(C(e,t,r)),s=It(C(n,r,e)),a=It(C(n,r,t));return!!(i!==o&&s!==a||i===0&&At(e,n,t)||o===0&&At(e,r,t)||s===0&&At(n,e,r)||a===0&&At(n,t,r))}function At(e,t,n){return t.x<=Math.max(e.x,n.x)&&t.x>=Math.min(e.x,n.x)&&t.y<=Math.max(e.y,n.y)&&t.y>=Math.min(e.y,n.y)}function It(e){return e>0?1:e<0?-1:0}function sc(e,t){var n=e;do{if(n.i!==e.i&&n.next.i!==e.i&&n.i!==t.i&&n.next.i!==t.i&&Ri(n,n.next,e,t))return!0;n=n.next}while(n!==e);return!1}function mt(e,t){return C(e.prev,e,e.next)<0?C(e,t,e.next)>=0&&C(e,e.prev,t)>=0:C(e,t,e.prev)<0||C(e,e.next,t)<0}function ac(e,t){var n=e,r=!1,i=(e.x+t.x)/2,o=(e.y+t.y)/2;do n.y>o!=n.next.y>o&&n.next.y!==n.y&&i<(n.next.x-n.x)*(o-n.y)/(n.next.y-n.y)+n.x&&(r=!r),n=n.next;while(n!==e);return r}function zi(e,t){var n=new Mn(e.i,e.x,e.y),r=new Mn(t.i,t.x,t.y),i=e.next,o=t.prev;return e.next=t,t.prev=e,n.next=i,i.prev=n,r.next=n,n.prev=r,o.next=r,r.prev=o,r}function yr(e,t,n,r){var i=new Mn(e,t,n);return r?(i.next=r.next,i.prev=r,r.next.prev=i,r.next=i):(i.prev=i,i.next=i),i}function _t(e){e.next.prev=e.prev,e.prev.next=e.next,e.prevZ&&(e.prevZ.nextZ=e.nextZ),e.nextZ&&(e.nextZ.prevZ=e.prevZ)}function Mn(e,t,n){this.i=e,this.x=t,this.y=n,this.prev=null,this.next=null,this.z=0,this.prevZ=null,this.nextZ=null,this.steiner=!1}sn.deviation=function(e,t,n,r){var i=t&&t.length,o=i?t[0]*n:e.length,s=Math.abs(Tn(e,0,o,n));if(i)for(var a=0,c=t.length;a<c;a++){var l=t[a]*n,f=a<c-1?t[a+1]*n:e.length;s-=Math.abs(Tn(e,l,f,n))}var u=0;for(a=0;a<r.length;a+=3){var d=r[a]*n,v=r[a+1]*n,h=r[a+2]*n;u+=Math.abs((e[d]-e[h])*(e[v+1]-e[d+1])-(e[d]-e[v])*(e[h+1]-e[d+1]))}return s===0&&u===0?0:Math.abs((u-s)/s)};function Tn(e,t,n,r){for(var i=0,o=t,s=n-r;o<n;o+=r)i+=(e[s]-e[o])*(e[o+1]+e[s+1]),s=o;return i}sn.flatten=function(e){for(var t=e[0][0].length,n={vertices:[],holes:[],dimensions:t},r=0,i=0;i<e.length;i++){for(var o=0;o<e[i].length;o++)for(var s=0;s<t;s++)n.vertices.push(e[i][o][s]);i>0&&(r+=e[i-1].length,n.holes.push(r))}return n};new Ut;new Ut;var xr;(e=>{function t(i){let o=i.slice();return o.sort(e.POINT_COMPARATOR),e.makeHullPresorted(o)}e.makeHull=t;function n(i){if(i.length<=1)return i.slice();let o=[];for(let a=0;a<i.length;a++){const c=i[a];for(;o.length>=2;){const l=o[o.length-1],f=o[o.length-2];if((l.x-f.x)*(c.y-f.y)>=(l.y-f.y)*(c.x-f.x))o.pop();else break}o.push(c)}o.pop();let s=[];for(let a=i.length-1;a>=0;a--){const c=i[a];for(;s.length>=2;){const l=s[s.length-1],f=s[s.length-2];if((l.x-f.x)*(c.y-f.y)>=(l.y-f.y)*(c.x-f.x))s.pop();else break}s.push(c)}return s.pop(),o.length==1&&s.length==1&&o[0].x==s[0].x&&o[0].y==s[0].y?o:o.concat(s)}e.makeHullPresorted=n;function r(i,o){return i.x<o.x?-1:i.x>o.x?1:i.y<o.y?-1:i.y>o.y?1:0}e.POINT_COMPARATOR=r})(xr||(xr={}));new Yi;new I;new rt;new br;new On;new Bt;new I;new I;export{nr as $,qe as A,Xt as B,qt as C,Sc as D,Mc as E,wc as F,Ze as G,Pc as H,Oc as I,xc as J,hr as K,Ac as L,ce as M,lc as N,dc as O,yc as P,Ai as Q,Dc as R,jc as S,gr as T,Ct as U,ks as V,Ns as W,Fc as X,Jt as Y,hc as Z,Nc as _,vc as a,Tc as a0,nn as a1,uc as a2,Rc as a3,_c as b,ht as c,gc as d,Cc as e,Wt as f,bi as g,le as h,m as i,rr as j,Ec as k,us as l,_s as m,zc as n,Si as o,$t as p,Ic as q,bc as r,B as s,pc as t,mc as u,kc as v,en as w,Vc as x,G as y,tt as z};
