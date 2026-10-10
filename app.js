/* Rental Aman - front-end app (PWA). Data tersimpan di localStorage perangkat. */
const $=s=>document.querySelector(s),rp=n=>'Rp '+Math.round(n).toLocaleString('id-ID');
const K='rental-aman-v1',DAY=864e5;
let S=Object.assign({u:null,bk:[],hist:[],plus:0,mine:[],auto:1,chat:[['b','Halo! Ada yang bisa kami bantu?']]},JSON.parse(localStorage.getItem(K)||'{}'));
const save=()=>localStorage.setItem(K,JSON.stringify(S));
/* ====== DATA (edit di sini) ====== */
const V0=[
{id:'a1',n:'Honda Vario 125',t:'Motor',e:'🛵',p:90000,m:'Bali Sejahtera',lat:-8.7184,lng:115.1686,s:'125cc · matic · 2 helm',hold:200000},
{id:'a2',n:'Yamaha NMAX',t:'Motor',e:'🏍️',p:150000,m:'Canggu Ride',lat:-8.6478,lng:115.1385,s:'155cc · matic · 2 helm',hold:300000},
{id:'a3',n:'Motor Listrik',t:'Listrik',e:'⚡',p:120000,m:'Eco Ubud',lat:-8.5069,lng:115.2625,s:'baterai terisi',hold:250000},
{id:'a4',n:'Toyota Avanza',t:'Mobil',e:'🚙',p:350000,m:'Bali Sejahtera',lat:-8.6705,lng:115.2126,s:'7 kursi · AC',hold:700000},
{id:'a5',n:'Honda Brio',t:'Mobil',e:'🚗',p:300000,m:'Sanur Auto',lat:-8.69,lng:115.263,s:'5 kursi · matic · AC',hold:700000},
{id:'a6',n:'Mobil + Sopir',t:'Sopir',e:'🧑‍✈️',p:550000,m:'Bandara Drive',lat:-8.7467,lng:115.1668,s:'sopir profesional · tanpa perlu SIM',hold:0,drv:1}];
const H=[['Ambil di lokasi mitra',0],['Diantar ke hotel/rumah',25000],['Diantar ke bandara',50000]];
const PH=['Depan','Belakang','Kiri','Kanan','Indikator BBM/baterai'];
const Q=[['BBM habis','Jika BBM habis, itu menjadi tanggung jawab penyewa. Kami tunjukkan SPBU resmi terdekat.'],['Mogok','Kami hubungi mitra dan bengkel terdekat. Tetap di lokasi yang aman, ya.'],['Perpanjang sewa','Perpanjangan bisa diajukan di tab Perjalanan.'],['Talk to agent','Connecting you to an English-speaking agent.']];
const CENTER=[-8.68,115.2],ISO=d=>new Date(d).toISOString().slice(0,10);
const all=()=>V0.concat(S.mine),vh=id=>all().find(v=>v.id==id);
let ui={role:'p',tab:'home',v:null,f:'Semua',sel:null,pos:null,eta:'',pay:'QRIS',agree:0,prot:1,promo:'',h:0,d1:ISO(Date.now()),d2:ISO(Date.now()+DAY),cur:null,busy:0,star:0,moving:0,tour:0,nm:''};
const km=(a,b,c,d)=>{const r=x=>x*Math.PI/180,k=Math.sin(r(c-a)/2)**2+Math.cos(r(a))*Math.cos(r(c))*Math.sin(r(d-b)/2)**2;return 12742*Math.asin(Math.sqrt(k))};
let tt;const toast=m=>{const e=$('#toast');e.textContent=m;e.className='s';clearTimeout(tt);tt=setTimeout(()=>e.className='',2600)};
/* ====== PETA (Leaflet + OpenStreetMap) ====== */
let map,mk=L.layerGroup(),me,rt,tr,tl=[],wid;
function initMap(){map=L.map('map',{zoomControl:false}).setView(CENTER,11);
 L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(map);
 L.control.zoom({position:'topright'}).addTo(map);mk.addTo(map);drawPins()}
const pin=e=>L.divIcon({html:`<b class="pin">${e}</b>`,className:'',iconSize:[34,34],iconAnchor:[17,17]});
function drawPins(){mk.clearLayers();if(ui.v=='active')return;list().forEach(v=>L.marker([v.lat,v.lng],{icon:pin(v.e),title:v.n}).on('click',()=>A.pick(v.id)).addTo(mk))}
function setMe(p){ui.pos=p;if(me)me.setLatLng(p);else me=L.circleMarker(p,{radius:8,color:'#fff',weight:3,fillColor:'#1F6FEB',fillOpacity:1}).addTo(map)}
function locate(go){if(!navigator.geolocation)return toast('GPS tidak tersedia di perangkat ini');
 navigator.geolocation.getCurrentPosition(p=>{setMe([p.coords.latitude,p.coords.longitude]);map.flyTo(ui.pos,14);render()},()=>toast('Izin lokasi ditolak. Aktifkan GPS di pengaturan browser.'),{enableHighAccuracy:true,timeout:10000})}
async function search(q){if(!q)return;try{const r=await(await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&q='+encodeURIComponent(q+' Bali'))).json();
 if(!r[0])return toast('Lokasi tidak ditemukan');setMe([+r[0].lat,+r[0].lon]);map.flyTo(ui.pos,14);render()}catch(e){toast('Pencarian lokasi gagal. Periksa koneksi.')}}
async function drawRoute(v){const o=ui.pos||CENTER;if(rt){map.removeLayer(rt);rt=null}ui.eta='';
 try{const r=await(await fetch(`https://router.project-osrm.org/route/v1/driving/${o[1]},${o[0]};${v.lng},${v.lat}?overview=full&geometries=geojson`)).json(),x=r.routes[0];
  rt=L.geoJSON(x.geometry,{style:{color:'#1F6FEB',weight:5}}).addTo(map);map.fitBounds(rt.getBounds(),{padding:[40,40]});ui.eta=`${(x.distance/1000).toFixed(1)} km · ±${Math.round(x.duration/60)} mnt dari posisi Anda`}
 catch(e){ui.eta=`${km(o[0],o[1],v.lat,v.lng).toFixed(1)} km (garis lurus)`;map.flyTo([v.lat,v.lng],14)}
 if(ui.v=='detail')render()}
function track(on){if(on&&navigator.geolocation&&!wid){tl=[];wid=navigator.geolocation.watchPosition(p=>{const c=[p.coords.latitude,p.coords.longitude];setMe(c);tl.push(c);if(tr)map.removeLayer(tr);tr=L.polyline(tl,{color:'#7CC4FA',weight:5}).addTo(map);map.setView(c);ui.moving=(p.coords.speed||0)>1.5},()=>toast('GPS tidak aktif: pelacakan langsung tidak berjalan'),{enableHighAccuracy:true})}
 if(!on&&wid){navigator.geolocation.clearWatch(wid);wid=null}}
/* ====== LOGIKA ====== */
const list=()=>all().filter(v=>(S.u&&S.u.nosim?v.drv:1)&&(ui.f=='Semua'||v.t==ui.f)).map(v=>({...v,d:km((ui.pos||CENTER)[0],(ui.pos||CENTER)[1],v.lat,v.lng)})).sort((a,b)=>a.d-b.d);
const dys=()=>Math.max(1,Math.round((new Date(ui.d2)-new Date(ui.d1))/DAY));
const calc=v=>{const d=dys(),b=v.p*d,hd=H[ui.h][1],pr=ui.prot&&!v.drv?20000*d:0,ds=ui.promo.toUpperCase()=='BIRU10'?Math.round(b*.1):0,sv=Math.round((b+hd+pr-ds)*.05);return{d,b,hd,pr,ds,sv,tot:b+hd+pr-ds+sv,hold:v.hold*(S.plus?.5:1)}};
const bk=id=>S.bk.find(b=>b.id==id),stC={pending:['w','Menunggu mitra'],ok:['ok','Dikonfirmasi'],active:['ok','Sewa aktif'],rejected:['w','Ditolak']};
const pills=(a,c,k)=>a.map(x=>`<button class="pill ${c==x?'on':''}" aria-pressed="${c==x}" data-a="set" data-k="${k}" data-v="${x}">${x}</button>`).join('');
const back=t=>`<button class="btn g sm" data-a="back" data-v="${t||''}">← Kembali</button><div class="gap"></div>`;
/* ====== TAMPILAN ====== */
const V={
onb:()=>`<h2>Selamat datang</h2><p class="m">Verifikasi SIM wajib sebelum menyewa. Data hanya tersimpan di perangkat ini.</p>
<label class="l">Nama<input class="fld" id="nm" data-c="nm" value="${ui.nm}" autocomplete="name"></label>
<div>${pills(['Warga lokal','Turis asing'],ui.tour?'Turis asing':'Warga lokal','tour')}</div>
<div class="card"><h3>1. Foto ${ui.tour?'SIM internasional + paspor':'SIM + KTP'}</h3><input class="fld" type="file" accept="image/*" capture="environment" data-c="sim"></div>
<div class="card"><h3>2. Selfie verifikasi wajah</h3><input class="fld" type="file" accept="image/*" capture="user" data-c="face"></div>
<button class="btn" data-a="reg" ${ui.sim&&ui.face&&ui.nm?'':'disabled'}>Mulai</button><div class="gap"></div>
<button class="btn g" data-a="reg" data-v="nosim">Saya tidak punya SIM (hanya Mobil + Sopir)</button>`,
home:()=>`<div class="row"><input id="q" class="fld" style="margin:0" placeholder="Cari lokasi, mis. Ubud" aria-label="Cari lokasi"><button class="btn sm" data-a="srch">Cari</button><button class="btn g sm" data-a="loc" aria-label="Lokasi saya">📍</button></div><div class="gap"></div>
<div>${pills(['Semua','Motor','Mobil','Listrik','Sopir'],ui.f,'f')}</div>`+(list().map(v=>`<button class="opt" data-a="pick" data-v="${v.id}"><div class="row"><span class="em">${v.e}</span><div style="flex:1"><b>${v.n}</b><div class="note">${v.m} · ${v.d.toFixed(1)} km · ${v.s}</div></div><b>${rp(v.p)}</b></div></button>`).join('')||'<p class="note">Tidak ada kendaraan.</p>'),
detail:()=>{const v=vh(ui.sel),c=calc(v);return back()+`<h2>${v.e} ${v.n}</h2><p class="m">${v.m} · ${ui.eta||'menghitung rute…'}</p><p class="note">${v.s}. ${v.t=='Listrik'?'Baterai terisi':'BBM terisi'} saat serah-terima (termasuk harga); jika habis menjadi tanggung jawab penyewa.</p>
<div class="row"><label class="l" style="flex:1">Ambil<input type="date" class="fld" data-c="d1" min="${ISO(Date.now())}" value="${ui.d1}"></label><label class="l" style="flex:1">Kembali<input type="date" class="fld" data-c="d2" min="${ui.d1}" value="${ui.d2}"></label></div>
<label class="l">Serah-terima<select class="fld" data-c="h">${H.map((h,i)=>`<option value="${i}" ${ui.h==i?'selected':''}>${h[0]}${h[1]?' (+'+rp(h[1])+')':''}</option>`).join('')}</select></label>
${v.drv?'':`<label class="note"><input type="checkbox" data-c="prot" ${ui.prot?'checked':''}> Paket proteksi (+${rp(20000)}/hari)</label>`}
<label class="l">Kode promo<input class="fld" data-c="promo" placeholder="BIRU10" value="${ui.promo}"></label>
<div class="card"><div class="row"><span>Sewa ${c.d} hari</span><span>${rp(c.b)}</span></div><div class="row"><span>Serah-terima</span><span>${rp(c.hd)}</span></div><div class="row"><span>Proteksi</span><span>${rp(c.pr)}</span></div>${c.ds?`<div class="row"><span>Promo</span><span>−${rp(c.ds)}</span></div>`:''}<div class="row"><span>Biaya layanan</span><span>${rp(c.sv)}</span></div><div class="row"><b>Total</b><b>${rp(c.tot)}</b></div></div>
<button class="btn" data-a="topay">Lanjut ke pembayaran</button>`},
pay:()=>{if(ui.busy)return `<div class="spin" role="status" aria-label="Memproses"></div><p class="m" style="text-align:center">Memproses pembayaran…</p>`;const v=vh(ui.sel),c=calc(v);return back('detail')+`<h2>Pembayaran</h2><p class="m">${v.n} · ${c.d} hari</p><div class="card row"><b>Total</b><b>${rp(c.tot)}</b></div>
${v.drv?'':`<div class="card"><h3>Tahan saldo ${rp(c.hold)}</h3><p class="note">Bukan deposit tunai; dilepas otomatis setelah kendaraan kembali.</p></div>`}
<div>${pills(['QRIS','Kartu','E-wallet'],ui.pay,'pay')}</div><label class="note"><input type="checkbox" data-c="agree" ${ui.agree?'checked':''}> Saya setuju kontrak digital dan kebijakan BBM/baterai</label><div class="gap"></div>
<button class="btn" data-a="bayar" ${ui.agree?'':'disabled'}>Bayar ${rp(c.tot)}</button>`},
trip:()=>`<h2>Perjalanan</h2><p class="m">Pesanan dan sewa Anda.</p>`+(S.bk.length?S.bk.slice().reverse().map(b=>{const v=vh(b.vid)||{n:'Kendaraan',e:'🚗'};return `<div class="card"><div class="row"><b>${v.e} ${v.n}</b><span class="chip ${stC[b.st][0]}">${stC[b.st][1]}</span></div><p class="note">${b.d1} → ${b.d2} · ${rp(b.tot)} · ${H[b.h][0]}</p>${b.st=='pending'?`<button class="btn g" data-a="cancel" data-v="${b.id}">Batalkan</button>`:b.st=='ok'?`<button class="btn" data-a="ci" data-v="${b.id}">Check-in & mulai sewa</button>`:b.st=='active'?`<button class="btn" data-a="open" data-v="${b.id}">Buka perjalanan</button>`:''}</div>`}).join(''):'<div class="card note">Belum ada pesanan. Pilih kendaraan di Beranda.</div>'),
checkin:()=>{const b=bk(ui.cur);return back('trip')+`<h2>Check-in digital</h2><p class="m">Foto kondisi kendaraan (${b.ph.length}/5).</p>`+PH.map((p,i)=>`<label class="opt ${b.ph.includes(i)?'on':''}"><div class="row"><span>Foto ${p}</span><span>${b.ph.includes(i)?'✓':'Ambil foto'}</span></div><input type="file" accept="image/*" capture="environment" hidden data-c="ph" data-i="${i}"></label>`).join('')+`<button class="btn" data-a="start" ${b.ph.length==5?'':'disabled'}>Mulai sewa</button>`},
active:()=>{const b=bk(ui.cur),v=vh(b.vid);return `<div class="row"><h2>${v.e} ${v.n}</h2><span class="chip ok">Sewa aktif</span></div><div class="tm" id="tm">00:00:00</div><p class="note">Pelacakan GPS langsung aktif · ${H[b.h][0]}</p>
${v.drv?'':`<div class="card"><div class="row"><h3>Kunci digital</h3><span class="chip w">Simulasi chip · Fase 2</span></div><p class="note">Penguncian hanya saat kendaraan berhenti (${ui.moving?'sedang berjalan':'berhenti'}).</p><div class="row"><button class="btn g" data-a="lock" data-v="1">Kunci</button><button class="btn g" data-a="lock" data-v="0">Buka & nyalakan</button></div></div>`}
<div class="row"><button class="btn bad" data-a="sos">SOS</button><button class="btn g" data-a="chat">Chat CS</button></div><div class="gap"></div><button class="btn" data-a="end">Akhiri sewa</button>`},
rate:()=>`<h2>Sewa selesai</h2><p class="m">Tahan saldo dilepas otomatis. Beri penilaian:</p><div>${[1,2,3,4,5].map(i=>`<button class="star ${ui.star>=i?'on':''}" aria-label="${i} bintang" data-a="star" data-v="${i}">★</button>`).join('')}</div><button class="btn" data-a="rate" ${ui.star?'':'disabled'}>Kirim</button>`,
hist:()=>`<h2>Riwayat</h2>`+(S.hist.map(h=>`<div class="card row"><div><b>${h.n}</b><div class="note">${h.d} · ★ ${h.r}</div></div><b>${rp(h.tot)}</b></div>`).join('')||'<div class="card note">Belum ada riwayat.</div>'),
akun:()=>`<h2>Akun</h2><p class="m">${S.u?S.u.nm+' · '+(S.u.tour?'Turis asing':'Warga lokal'):''}</p><div class="card"><div class="row"><span>SIM</span><span class="chip ${S.u.nosim?'w':'ok'}">${S.u.nosim?'Tidak ada':'Terverifikasi'}</span></div></div>
<div class="card row"><div><h3>Member Plus</h3><p class="note">Tahan saldo 50% lebih ringan · Rp49.000/bln (contoh)</p></div><button class="pill on" style="margin:0" data-a="plus">${S.plus?'Aktif':'Berlangganan'}</button></div>
<button class="btn g" data-a="role">${ui.role=='p'?'Beralih ke Mode Mitra':'Beralih ke Mode Penyewa'}</button><div class="gap"></div><button class="btn g" data-a="reset">Hapus semua data</button><p class="note">Prototipe fungsional: data di perangkat ini, pembayaran dan chip masih simulasi.</p>`,
orders:()=>`<h2>Pesanan masuk</h2><label class="note"><input type="checkbox" data-c="auto" ${S.auto?'checked':''}> Terima otomatis (4 detik)</label>`+(S.bk.length?S.bk.slice().reverse().map(b=>{const v=vh(b.vid)||{n:'Kendaraan',e:'🚗'};return `<div class="card"><div class="row"><b>${v.e} ${v.n}</b><span class="chip ${stC[b.st][0]}">${stC[b.st][1]}</span></div><p class="note">${b.d1} → ${b.d2} · ${rp(b.tot)}</p>${b.st=='pending'?`<div class="row"><button class="btn" data-a="acc" data-v="${b.id}">Terima</button><button class="btn g" data-a="rej" data-v="${b.id}">Tolak</button></div>`:''}</div>`}).join(''):'<div class="card note">Belum ada pesanan.</div>'),
fleet:()=>`<h2>Armada saya</h2>`+(S.mine.map(v=>`<div class="card row"><b>${v.e} ${v.n}</b><span>${rp(v.p)}/hari</span></div>`).join('')||'<div class="card note">Belum ada kendaraan.</div>')+`<div class="card"><h3>Tambah kendaraan</h3><input class="fld" id="an" placeholder="Nama kendaraan"><select class="fld" id="at"><option>Motor</option><option>Mobil</option><option>Listrik</option></select><input class="fld" id="ap" type="number" min="10000" placeholder="Harga per hari (Rp)"><p class="note">Lokasi = posisi Anda (atau pusat peta).</p><button class="btn" data-a="add">Tambah</button></div>`,
chat:()=>back(ui.tab=='home'?'':ui.tab)+`<h2>Bantuan CS</h2>${S.chat.map(m=>`<div class="bub ${m[0]=='u'?'u':''}">${m[1]}</div>`).join('')}<div>${Q.map((q,i)=>`<button class="pill" data-a="say" data-v="${i}">${q[0]}</button>`).join('')}</div>`,
sos:()=>back('active')+`<h2>Bantuan darurat</h2>${['Mogok','Ban bocor','Kecelakaan','Kendaraan hilang'].map(x=>`<button class="btn g" style="margin-bottom:10px" data-a="sosx" data-v="${x}">${x}</button>`).join('')}`};
const NAV={p:[['home','🏠','Beranda'],['trip','🧾','Perjalanan'],['hist','🕘','Riwayat'],['akun','👤','Akun']],m:[['orders','📥','Pesanan'],['fleet','🚗','Armada'],['akun','👤','Akun']]};
function render(){const sheet=!!S.u&&(ui.v=='active'||(!ui.v&&ui.tab=='home'&&ui.role=='p')||ui.v=='detail'),key=!S.u?'onb':ui.v||ui.tab;
 const e=$('#view');e.className=sheet?'sheet':'full';e.innerHTML=V[key]();
 $('#nav').style.display=S.u?'flex':'none';$('#nav').innerHTML=NAV[ui.role].map(t=>`<button class="${ui.tab==t[0]?'on':''}" data-a="tab" data-v="${t[0]}"><b>${t[1]}</b>${t[2]}</button>`).join('');
 if(map){drawPins();setTimeout(()=>map.invalidateSize(),60)}}
const go=(tab,v)=>{ui.tab=tab;ui.v=v||null;if(tab!='home'||v)ui.sel=ui.sel;render()};
/* ====== AKSI ====== */
const A={
tab:t=>{if(rt){map.removeLayer(rt);rt=null}go(t)},back:t=>{if(t=='trip'||t=='akun')go(t);else{if(rt){map.removeLayer(rt);rt=null}go(ui.tab,t||null)}},
set:(v,e)=>{const k=e.dataset.k;ui[k]=k=='tour'?v=='Turis asing':v;render()},f:v=>{ui.f=v;render()},
pick:id=>{ui.sel=id;ui.v='detail';const v=vh(id);map.flyTo([v.lat,v.lng],14);render();drawRoute(v)},
srch:()=>search($('#q').value.trim()),loc:()=>locate(),
reg:v=>{S.u={nm:ui.nm||'Pengguna',tour:ui.tour,nosim:v=='nosim'};save();render();locate()},
topay:()=>{ui.v='pay';ui.agree=0;render()},
bayar:()=>{const v=vh(ui.sel),c=calc(v);ui.busy=1;render();setTimeout(()=>{ui.busy=0;const b={id:'B'+Date.now(),vid:v.id,d1:ui.d1,d2:ui.d2,d:c.d,h:ui.h,tot:c.tot,pay:ui.pay,st:'pending',ph:[]};S.bk.push(b);save();
 if(S.auto)setTimeout(()=>{const x=bk(b.id);if(x&&x.st=='pending'){x.st='ok';save();toast('Mitra menerima pesanan Anda');if(ui.tab=='trip'||ui.tab=='orders')render()}},4000);
 if(rt){map.removeLayer(rt);rt=null}toast('Pembayaran berhasil. Menunggu mitra…');go('trip')},1800)},
cancel:id=>{S.bk=S.bk.filter(b=>b.id!=id);save();toast('Pesanan dibatalkan');render()},
acc:id=>{bk(id).st='ok';save();render()},rej:id=>{bk(id).st='rejected';save();render()},
ci:id=>{ui.cur=id;ui.v='checkin';render()},
start:()=>{const b=bk(ui.cur);b.st='active';b.t0=Date.now();save();A.open(b.id)},
open:id=>{ui.cur=id;ui.v='active';render();track(1)},
lock:(v)=>{if(v=='1'&&ui.moving)return toast('Tidak bisa mengunci saat kendaraan berjalan');toast(v=='1'?'Terkunci (simulasi)':'Siap dinyalakan (simulasi)')},
sos:()=>{ui.v='sos';render()},sosx:x=>{toast(x+': CS segera menghubungi Anda');ui.v='chat';render()},
end:()=>{track(0);if(tr){map.removeLayer(tr);tr=null}bk(ui.cur).st='done';save();ui.star=0;ui.v='rate';render()},
star:v=>{ui.star=+v;render()},
rate:()=>{const b=bk(ui.cur),v=vh(b.vid);S.hist.unshift({n:v.n,d:b.d1+' → '+b.d2,tot:b.tot,r:ui.star});S.bk=S.bk.filter(x=>x.id!=b.id);save();toast('Terima kasih atas penilaian Anda');go('hist')},
plus:()=>{S.plus=S.plus?0:1;save();render()},role:()=>{ui.role=ui.role=='p'?'m':'p';go(ui.role=='p'?'home':'orders')},
reset:()=>{if(confirm('Hapus semua data aplikasi di perangkat ini?')){localStorage.removeItem(K);location.reload()}},
chat:()=>{ui.v='chat';render()},say:i=>{S.chat.push(['u',Q[i][0]],['b',Q[i][1]]);save();render()},
add:()=>{const n=$('#an').value.trim(),p=+$('#ap').value;if(!n||!p)return toast('Isi nama dan harga');const t=$('#at').value,c=ui.pos||[map.getCenter().lat,map.getCenter().lng];
 S.mine.push({id:'m'+Date.now(),n,t,e:t=='Mobil'?'🚗':t=='Listrik'?'⚡':'🛵',p,m:S.u.nm,lat:c[0],lng:c[1],s:'milik mitra',hold:p*2});save();toast('Kendaraan ditambahkan');render()}};
document.addEventListener('click',e=>{const a=e.target.closest('[data-a]');if(a&&A[a.dataset.a])A[a.dataset.a](a.dataset.v,a)});
document.addEventListener('change',e=>{const t=e.target,c=t.dataset.c;if(!c)return;
 if(c=='ph'){const b=bk(ui.cur);if(t.files.length&&!b.ph.includes(+t.dataset.i)){b.ph.push(+t.dataset.i);save()}}
 else if(c=='sim'||c=='face')ui[c]=t.files.length>0;else if(c=='auto'){S.auto=t.checked?1:0;save();return}
 else ui[c]=t.type=='checkbox'?t.checked:t.value;if(c=='d1'&&ui.d2<=ui.d1)ui.d2=ISO(new Date(ui.d1).getTime()+DAY);render()});
document.addEventListener('keydown',e=>{if(e.key=='Enter'&&e.target.id=='q')A.srch()});
setInterval(()=>{const t=$('#tm'),b=ui.v=='active'&&bk(ui.cur);if(t&&b){const s=Math.floor((Date.now()-b.t0)/1e3),p=n=>String(n).padStart(2,'0');t.textContent=`${p(s/3600|0)}:${p(s/60%60|0)}:${p(s%60)}`}},1000);
/* ====== BOOT (splash + loading) ====== */
const steps=['Memuat peta…','Menyiapkan layanan…','Menghubungkan mitra…','Siap!'];let i=0;
const bar=$('.ld i'),sp=$('#sp');
function boot(){initMap();render();if(S.u)locate()}
const iv=setInterval(()=>{sp.textContent=steps[i];bar.style.width=((i+1)/steps.length*100)+'%';i++;if(i>=steps.length){clearInterval(iv);setTimeout(()=>{$('#splash').classList.add('off');boot()},500)}},600);
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});
