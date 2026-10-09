"use strict";
const KEY="montessori_os_v2";
const toys=[
["Кутија за постојаност на предмет","Кула со прстени","Чаши за вгнездување","Сложувалка со големи рачки","Големи дрвени коцки"],
["Кутија со големи дискови","Кутија со фиока","Вметнувалка со крупни цилиндри","Играчка со топки за тркалање","Дрвено возило"],
["Едноставен сортер","Кула за редење","Сложувалка со форми","Коцки за градење","Кутија со вратички"],
["Кула од коцки","Играчка за туркање","Сортер со крупни блокови","Сложувалка со животни","Рампа со крупни топки"],
["Рампа со големи топки","Играчка причина-последица","Кутија со вратички","Вметнувалка со форми","Играчка за влечење"],
["Кула со различни големини","Сложувалка со рачки","Кутија за сортирање","Моторичка играчка со заробени елементи","Дрвени блокови"],
["Сет за имитација на сервирање","Сет со вратички","Сложувалка со животни","Вметнувалка со форми","Крупни коцки"],
["Сортер по боја","Чаши за редење","Сложувалка со животни","Спарување слики","Кутија со отвори"],
["Дрвени животни со крупни делови","Сложувалка со возила","Сет за игра со храна","Коцки со слики","Моторичка играчка"],
["Сет за имитација на чистење","Сет за сервирање","Играчка со вратички","Сложувалка со крупни делови","Садови за вгнездување"],
["Конструкциски блокови","Сортер со форми","Сложувалка со крупни делови","Спарување животни","Кула по големина"],
["Сет за игра со готвење","Конструкциски сет","Сложувалка со 6 крупни делови","Сортирање по боја","Сет за практични активности"]];
const themes=["Откривам и повторувам","Ставање и вадење","Форми и координација","Градам и истражувам","Причина и последица","Редослед и концентрација","Самостојност","Споредувам и групирам","Зборови и предмети","Практичен живот","Решавам проблеми","Посложена игра"];
const seed=()=>({settings:{price:119,shipping:40,handling:15,buffer:7},customers:[],packages:toys.map((t,i)=>({id:"M"+(i+12),age:i+12,title:themes[i],toys:t,guide:"Развојни активности соодветни на возраста. Секогаш проверете ги упатствата на производителот.",cost:85+i*5})),stock:[],payments:[],expenses:[],operations:[]});
let db;try{db=JSON.parse(localStorage.getItem(KEY))||seed()}catch{db=seed()}
db={...seed(),...db};for(const k of ["customers","packages","stock","payments","expenses","operations"])if(!Array.isArray(db[k]))db[k]=[];
function save(){localStorage.setItem(KEY,JSON.stringify(db));window.dispatchEvent(new Event("os-change"))}
const uid=()=>Math.random().toString(36).slice(2,10);
const money=v=>Number(v||0).toLocaleString("pl-PL",{style:"currency",currency:"PLN"});
function esc(v){return String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function date(d){return new Date(d+"T12:00:00")}
function iso(d){return [d.getFullYear(),String(d.getMonth()+1).padStart(2,"0"),String(d.getDate()).padStart(2,"0")].join("-")}
function addMonths(s,n){const d=date(s),day=d.getDate();d.setDate(1);d.setMonth(d.getMonth()+n);const max=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();d.setDate(Math.min(day,max));return iso(d)}
function diffMonths(a,b){return (date(b).getFullYear()-date(a).getFullYear())*12+date(b).getMonth()-date(a).getMonth()}
function cycle(c,i){return {customer:c,id:c.id+"-"+i,packageId:"M"+(Number(c.age)+i),start:addMonths(c.start,i),end:addMonths(c.start,i+1)}}
function cycles(c,limit=24){let result=[];for(let i=0;i<limit;i++){const cy=cycle(c,i);if(Number(c.age)+i>23)break;if(c.status==="paused"||c.status==="cancelled")break;result.push(cy)}return result}
function overlap(a,b){return a.start<b.end&&b.start<a.end}
function padCycle(c){return {...c,start:addMonths(c.start,0),end:iso(new Date(date(c.end).getTime()+Math.max(7,Number(db.settings.buffer||7))*86400000))}}
function capacity(id){return db.stock.filter(s=>s.packageId===id&&s.status!=="retired").length}
function peakDemand(id){const events=[];for(const c of db.customers)for(const cy of cycles(c)){if(cy.packageId!==id)continue;let p=padCycle(cy);events.push({t:p.start,d:1},{t:p.end,d:-1})}events.sort((a,b)=>a.t.localeCompare(b.t)||a.d-b.d);let n=0,max=0;for(const e of events){n+=e.d;max=Math.max(max,n)}return max}
function plan(){return db.packages.map(p=>({...p,have:capacity(p.id),need:peakDemand(p.id),short:Math.max(0,peakDemand(p.id)-capacity(p.id))}))}
function page(){return document.body.dataset.page||"dashboard"}
function layout(){const nav=[["index.html","dashboard","calendar-check-2","Операции"],["customers.html","customers","users-round","Клиенти"],["packages.html","packages","package","Пакети"],["inventory.html","inventory","boxes","Залиха"],["finances.html","finances","wallet","Финансии"],["settings.html","settings","settings-2","Поставки"]];document.getElementById("root").innerHTML='<div class="app"><aside class="sidebar"><div class="brand"><a href="index.html" class="brand-logo-link" aria-label="ToySharing — Контролна табла"><img src="./assets/ToySharing%20House%20of%20Play.png" class="brand-logo" alt="ToySharing" /></a></div><nav class="nav">'+nav.map(n=>'<a href="'+n[0]+'" class="'+(n[1]===page()?"active":"")+'"><i data-lucide="'+n[2]+'"></i>'+n[3]+'</a>').join("")+'</nav><div class="sidebar-foot">Локална верзија · податоците се во овој прелистувач</div></aside><main class="main"><header class="top"><div><h1 id="title"></h1><p id="subtitle"></p></div><div id="topAction"></div></header><div id="content"></div></main></div><div id="modal" class="drawer-mask hidden"></div>';render()}
function header(t,s,action=""){document.getElementById("title").textContent=t;document.getElementById("subtitle").textContent=s;document.getElementById("topAction").innerHTML=action}
function modal(html){const el=document.getElementById("modal");el.classList.remove("hidden");el.innerHTML='<div class="drawer">'+html+'</div>';el.onclick=e=>{if(e.target===el)closeModal()}}
function closeModal(){document.getElementById("modal").classList.add("hidden")}
function field(name,label,value="",type="text",extra=""){return '<div><label>'+label+'</label><input class="input" name="'+name+'" type="'+type+'" value="'+esc(value)+'" '+extra+' required></div>'}
function formData(id){return Object.fromEntries(new FormData(document.getElementById(id)).entries())}
function confirmDelete(message){return confirm(message)}
function render(){const p=page();if(p==="dashboard")timeline();if(p==="customers")customers();if(p==="packages")packages();if(p==="inventory")inventory();if(p==="timeline")timeline();if(p==="finances")finances();if(p==="settings")settings();if(p==="signup")signup()}
function dashboard(){
 header("Контролна табла","Оперативен преглед на Montessori претплатите и ротациите");
 const active=db.customers.filter(c=>c.status==="active").length,short=plan().reduce((a,p)=>a+p.short,0);
 const stats=[["Активни претплати",active,"users-round"],["Очекувана месечна наплата",money(active*db.settings.price),"credit-card"],["Физички сетови",db.stock.length,"package-check"],["Недостиг на сетови",short,"alert-triangle"]];
 document.getElementById("content").innerHTML=
 
 '<div class="grid">'+stats.map(x=>'<div class="card"><span class="kpi-icon"><i data-lucide="'+x[2]+'"></i></span><div class="muted small">'+x[0]+'</div><div class="metric">'+x[1]+'</div></div>').join("")+'</div>'+
 '<div class="two"><div class="card"><div class="section-header"><h2>Планиран недостиг на сетови</h2><a href="inventory.html" class="btn light sm">Отвори залиха →</a></div>'+shortages()+'</div><div class="card"><h2>Брз пристап</h2><p>Управувај со претплатници, фиксни пакети и физички копии.</p><div class="section flex"><a class="btn" href="customers.html">Преглед на клиенти</a><a class="btn light" href="packages.html">Преглед на пакети</a></div><div class="note mt">Демо-податоците се пример и не претставуваат вистински клиенти или наплати.</div></div></div>';
}
function shortages(){const a=plan().filter(p=>p.short);return a.length?'<div class="table-wrap"><table><thead><tr><th>Пакет</th><th>Потребни</th><th>Достапни</th><th>Недостигаат</th></tr></thead><tbody>'+a.map(p=>'<tr><td>'+p.id+'</td><td>'+p.need+'</td><td>'+p.have+'</td><td><span class="tag bad">'+p.short+'</span></td></tr>').join("")+'</tbody></table></div>':'<div class="empty">Нема конфликт во планираните циклуси.</div>'}
function customers(){
 header("Клиенти","Регистрации од веб-страницата и статуси на претплатите.",'<a class="btn light" href="signup.html"><i data-lucide="external-link"></i> Јавна регистрација</a>');
 document.getElementById("content").innerHTML='<div class="work-surface"><div class="work-bar"><strong>Регистрирани клиенти</strong><span>'+db.customers.length+' клиенти</span></div><div class="work-scroll"><table class="work-table"><thead><tr><th>Клиент</th><th>Дете</th><th>Возраст</th><th>Датум на старт</th><th>Адреса</th><th>Статус</th><th></th></tr></thead><tbody>'+db.customers.map(c=>'<tr><td><strong>'+esc(c.name)+'</strong><small class="work-sub">'+esc(c.email)+'</small></td><td>'+esc(c.child)+'</td><td>'+c.age+' месеци</td><td>'+c.start+'</td><td>'+esc(c.address||"Нема адреса")+'</td><td><span class="tag '+(c.status==="active"?"":"warn")+'">'+(c.status==="active"?"Активен":c.status==="paused"?"Паузиран":"Откажан")+'</span></td><td><button class="air-link" onclick="customerForm(\''+c.id+'\')">Уреди <i data-lucide="chevron-right"></i></button></td></tr>').join("")+'</tbody></table>'+(db.customers.length?"":'<div class="empty">Нема регистрации.</div>')+'</div></div>';
}
function customerForm(id){const c=db.customers.find(x=>x.id===id)||{name:"",email:"",child:"",age:12,start:iso(new Date()),status:"active"};modal('<h2>'+(id?"Уреди клиент":"Нов клиент")+'</h2><p>Циклусот се повторува на истиот ден секој месец.</p><form id="customerForm" class="form-grid section">'+field("name","Родител",c.name)+field("child","Име на дете",c.child)+field("email","Е-пошта",c.email,"email")+field("age","Возраст на почеток (12–23)",c.age,"number",'min="12" max="23"')+field("start","Датум на прва испорака",c.start,"date")+field("address","Адреса за достава",c.address||"")+'<div><label>Статус</label><select name="status"><option value="active">Активен</option><option value="paused">Паузиран</option><option value="cancelled">Откажан</option></select></div></form><footer><button class="btn light" onclick="closeModal()">Откажи</button><button class="btn" onclick="saveCustomer(\''+(id||"")+'\')">Зачувај</button></footer>');document.querySelector('#customerForm [name="status"]').value=c.status}
function saveCustomer(id){const f=document.getElementById("customerForm");if(!f.reportValidity())return;const d=formData("customerForm");d.age=Number(d.age);if(id)Object.assign(db.customers.find(x=>x.id===id),d);else db.customers.push({id:uid(),...d});save();closeModal();render()}
function deleteCustomer(id){if(!confirmDelete("Да се избрише клиентот?"))return;db.customers=db.customers.filter(c=>c.id!==id);save();render()}
function packages(){
 header("Пакети","Дефинирај ја содржината на секој Montessori пакет. Залихата се управува одделно.");
 document.getElementById("content").innerHTML='<div class="work-surface"><div class="work-bar"><strong>Каталог на пакети</strong><span>'+db.packages.length+' типови · 5 играчки по пакет</span></div><div class="work-scroll"><table class="work-table"><thead><tr><th>Пакет</th><th>Програма</th><th>Содржина на пакетот</th><th>Набавна цена</th><th>Акции</th></tr></thead><tbody>'+db.packages.map(p=>'<tr><td><strong>'+p.id+'</strong></td><td>'+esc(p.title)+'</td><td class="work-toys">'+p.toys.slice(0,3).map(t=>'<span class="toy-chip" title="'+esc(t)+'">'+esc(t)+'</span>').join('')+(p.toys.length>3?'<button type="button" class="toy-more" title="'+esc(p.toys.slice(3).join(" • "))+'" aria-label="'+esc(p.toys.slice(3).join(", "))+'" data-tooltip="'+esc(p.toys.slice(3).join(" • "))+'">+'+(p.toys.length-3)+'</button>':"")+'</td><td>'+money(p.cost)+'</td><td><button class="air-link" onclick="packageForm(\''+p.id+'\')">Уреди <i data-lucide="chevron-right"></i></button></td></tr>').join('')+'</tbody></table></div></div>';
}
function packageForm(id){
 const p=db.packages.find(x=>x.id===id);if(!p)return;
 modal('<h2>'+id+' · Уреди пакет</h2><p>Одреди ги петте играчки што го сочинуваат овој тип пакет. Количините се внесуваат во Залиха.</p><form id="packageForm" class="form-grid section">'+field("title","Име на пакет",p.title)+field("cost","Набавна цена по комплет (PLN)",p.cost,"number",'min="0" step="0.01"')+p.toys.map((t,i)=>'<div class="wide">'+field("toy"+i,"Играчка "+(i+1),t,'text','required')+'</div>').join('')+'</form><footer><button class="btn light" onclick="closeModal()">Откажи</button><button class="btn" onclick="savePackage(\''+id+'\')">Зачувај пакет</button></footer>');
}
function savePackage(id){
 const f=document.getElementById("packageForm");if(!f.reportValidity())return;
 const d=formData("packageForm"),p=db.packages.find(x=>x.id===id);
 if(!p)return;
 p.title=d.title;p.cost=Number(d.cost);p.toys=Array.from({length:5},(_,i)=>d["toy"+i].trim());
 if(p.toys.some(x=>!x)){alert("Внеси ги сите 5 играчки.");return}
 save();closeModal();render();
}
function inventory(){
 header("Залиха","Внеси колку физички комплети имаш за секој пакет M12–M23. Количините го хранат Timeline.");
 const p=plan();
 document.getElementById("content").innerHTML='<div class="work-surface"><div class="work-bar"><strong>Залиха по тип пакет</strong><span>'+db.stock.filter(x=>x.status!=="retired").length+' активни физички комплети</span></div><div class="work-scroll"><table class="work-table"><thead><tr><th>Пакет</th><th>Програма</th><th>Вкупно комплети</th><th>Подготвени</th><th>На чистење</th><th>Потребни според план</th><th>Недостиг</th><th>Акции</th></tr></thead><tbody>'+p.map(v=>{
 const stock=db.stock.filter(s=>s.packageId===v.id&&s.status!=="retired");
 const ready=stock.filter(s=>s.status==="ready").length,cleaning=stock.filter(s=>s.status==="cleaning").length;
 return '<tr><td><strong>'+v.id+'</strong></td><td>'+esc(v.title)+'</td><td><strong>'+stock.length+'</strong></td><td>'+ready+'</td><td>'+cleaning+'</td><td>'+v.need+'</td><td>'+(v.short?'<span class="tag warn">'+v.short+' недостигаат</span>':'<span class="tag">Доволно</span>')+'</td><td><button class="air-link" onclick="inventoryQuantity(\''+v.id+'\')">Уреди количина <i data-lucide="chevron-right"></i></button></td></tr>';
 }).join('')+'</tbody></table></div><p class="air-footnote">Една единица = еден целосен комплет од петте играчки дефинирани во „Пакети“. Физичките копии се водат индивидуално во системот за да може Timeline да им доделува конкретни сетови на клиентите. Планираната побарувачка ја вклучува подготовката по враќање.</p></div>';
}
function inventoryQuantity(id){
 const p=db.packages.find(x=>x.id===id);if(!p)return;
 const current=capacity(id);
 modal('<h2>Залиха · '+id+'</h2><p>'+esc(p.title)+' · секоја копија е целосен пакет со пет играчки.</p><form id="quantityForm" class="form-grid section"><div class="wide">'+field("quantity","Број на активни комплети",current,"number",'min="0" max="999" step="1" required')+'</div></form><p class="small">Намалувањето е дозволено само за копии што немаат зачувана доделба или испорака.</p><footer><button class="btn light" onclick="closeModal()">Откажи</button><button class="btn" onclick="saveInventoryQuantity(\''+id+'\')">Зачувај количина</button></footer>');
}
function saveInventoryQuantity(id){
 const input=document.querySelector('#quantityForm [name="quantity"]');if(!input||!input.reportValidity())return;
 const q=Number(input.value);if(!Number.isInteger(q)||q<0||q>999){alert("Внеси цел број од 0 до 999.");return}
 const current=db.stock.filter(x=>x.packageId===id&&x.status!=="retired");
 const change=q-current.length;
 if(change>0){
   for(let i=0;i<change;i++){const key=uid();db.stock.push({id:key,code:"SET-"+id+"-"+key.toUpperCase(),packageId:id,price:Number(db.packages.find(p=>p.id===id)?.cost||0),condition:"Добра",status:"ready"})}
 }else if(change<0){
   const reserved=new Set(db.operations.filter(o=>o.stockId).map(o=>o.stockId));
   const removable=current.filter(x=>!reserved.has(x.id)).reverse();
   if(removable.length<(-change)){alert("Некои копии се веќе доделени на клиенти. Не можеш да ја намалиш количината под бројот на резервирани комплети.");return}
   const ids=new Set(removable.slice(0,-change).map(x=>x.id));db.stock=db.stock.filter(x=>!ids.has(x.id));
 }
 save();closeModal();render();
}
function stockForm(id){const s=db.stock.find(x=>x.id===id)||{code:"SET-"+String(db.stock.length+1).padStart(3,"0"),packageId:"M12",price:85,condition:"Многу добра",status:"ready"};modal('<h2>'+(id?"Уреди сет":"Нов физички сет")+'</h2><form id="stockForm" class="form-grid section">'+field("code","Инвентарен број",s.code)+'<div><label>Тип пакет</label><select name="packageId">'+db.packages.map(p=>'<option value="'+p.id+'">'+p.id+" · "+esc(p.title)+'</option>').join("")+'</select></div>'+field("price","Набавна цена (PLN)",s.price,"number",'min="0" step="0.01"')+field("condition","Состојба",s.condition)+'<div class="wide"><label>Статус</label><select name="status"><option value="ready">Подготвен</option><option value="cleaning">На чистење</option><option value="retired">Повлечен</option></select></div></form><footer><button class="btn light" onclick="closeModal()">Откажи</button><button class="btn" onclick="saveStock(\''+(id||"")+'\')">Зачувај</button></footer>');document.querySelector('#stockForm [name="packageId"]').value=s.packageId;document.querySelector('#stockForm [name="status"]').value=s.status}
function saveStock(id){const f=document.getElementById("stockForm");if(!f.reportValidity())return;const d=formData("stockForm");d.price=Number(d.price);if(id)Object.assign(db.stock.find(x=>x.id===id),d);else db.stock.push({id:uid(),...d});save();closeModal();render()}
function deleteStock(id){if(!confirmDelete("Да се избрише физичкиот сет?"))return;db.stock=db.stock.filter(x=>x.id!==id);save();render()}

const DAY=86400000;
const plusDays=(d,n)=>iso(new Date(date(d).getTime()+n*DAY));
const turnaround=()=>Math.max(7,Number(db.settings.buffer||7));
function operationalPlan(){
 const customers=db.customers.filter(c=>c.status==="active");
 const orders=customers.flatMap(c=>cycles(c).map(cy=>({...cy,customer:c,dispatch:plusDays(cy.start,-2)}))).sort((a,b)=>a.dispatch.localeCompare(b.dispatch)||a.id.localeCompare(b.id));
 const operationMap=new Map(db.operations.map(o=>[o.id,o]));
 const pool={};
 for(const p of db.packages)pool[p.id]=db.stock.filter(s=>s.packageId===p.id&&s.status!=="retired").map(s=>({id:s.id,code:s.code,status:s.status,free:"0001-01-01"}));
 const output=[];
 for(const order of orders){
  const op=operationMap.get(order.id)||{};
  const candidates=pool[order.packageId]||[];
  let kit=null;
  if(op.stockId)kit=candidates.find(s=>s.id===op.stockId);
  if(!kit&&!op.stockId){
    kit=candidates.filter(s=>s.free<=order.dispatch).sort((a,b)=>a.free.localeCompare(b.free))[0]||null;
  }
  let conflict=!!kit&&kit.free>order.dispatch;
  const blockedByReturn=!!kit&&kit.free==="9999-12-31";
  let state=!kit||conflict?"missing":kit.status==="cleaning"?"risk":"ready";
  if(op.step==="shipped"||op.step==="delivered")state="transit";
  if(op.step==="returned")state="processing";
  if(op.step==="cleaned")state="done";
  let description=!kit?"Нема физички сет. Потребна е набавка.":conflict?"Избраниот сет не е слободен за овој термин.":"Сетот е планиран; провери ја адресата и подготви ја испораката.";
  if(kit){
    // A dispatched kit stays blocked until a return is recorded. Future planning uses the
    // expected return date plus a full turnaround window.
    const returnDay=op.returnedAt||order.end;
    let nextFree=plusDays(returnDay,turnaround());
    if((op.step==="shipped"||op.step==="delivered")&&date(order.end)<new Date())nextFree="9999-12-31";
    if(op.step==="returned"&&op.returnedAt)nextFree=plusDays(op.returnedAt,turnaround());
    if(op.step==="cleaned"&&op.cleanedAt)nextFree=[plusDays(op.returnedAt||order.end,turnaround()),op.cleanedAt].sort().at(-1);
    kit.free=nextFree;
  }
  const deliveryAddress=order.customer.address||"Нема внесена адреса";
  const status=op.step||"planned";
  output.push({...order,stockId:kit?.id||"",code:kit?.code||"—",state,status,description,conflict,blockedByReturn,address:deliveryAddress,returnedAt:op.returnedAt||"",cleanedAt:op.cleanedAt||"",tracking:op.tracking||"",opStockId:op.stockId||"",readyAfter:kit?.free||"",buffer:turnaround()});
 }
 return output;
}
function rotationOrders(){return operationalPlan();}
function operationUpdate(id,step){
 const rows=operationalPlan(),o=rows.find(x=>x.id===id);if(!o)return;
 const existing=db.operations.find(x=>x.id===id);
 const op=existing||{id,stockId:o.stockId,step:"planned"};
 if(!o.stockId){alert("Нема доделен физички сет. Прво набави и регистрирај копија во Залиха.");return}
 if(o.conflict){alert("Конфликт во залихата. Овој сет веќе е резервиран во истиот период.");return}
 if(step==="shipped"&&(!o.customer.address||o.customer.address.trim()==="")){alert("Внеси адреса на клиентот пред испраќање.");return}
 const allowed={planned:["shipped"],shipped:["delivered","returned"],delivered:["returned"],returned:["cleaned"],cleaned:[]};
 if(!(allowed[op.step]||[]).includes(step)){alert("Чекорот не може да се потврди во оваа фаза.");return}
 if(step==="shipped")op.shippedAt=iso(new Date());
 if(step==="delivered")op.deliveredAt=iso(new Date());
 if(step==="returned")op.returnedAt=iso(new Date());
 if(step==="cleaned"){
   if(!op.returnedAt){alert("Прво потврди враќање.");return}
   op.cleanedAt=iso(new Date());
 }
 op.step=step;
 if(!existing)db.operations.push(op);
 save();closeModal();render();rotationDetail(id);
}
function updateTracking(id){
 const el=document.getElementById("trackingInput");if(!el)return;
 let op=db.operations.find(x=>x.id===id);
 if(!op){const row=operationalPlan().find(x=>x.id===id);op={id,stockId:row?.stockId||"",step:"planned"};db.operations.push(op)}
 op.tracking=el.value.trim().slice(0,100);save();closeModal();rotationDetail(id);
}
function monthlyTasks(){
 const start=iso(new Date(new Date().getFullYear(),new Date().getMonth(),1)),end=addMonths(start,1),today=iso(new Date());
 return operationalPlan().filter(o=>o.dispatch<end&&o.end>=start&&o.status!=="cleaned").map(o=>{
 let action="",due=o.dispatch,kind="normal";
 if(o.state==="missing"||o.conflict){action="Обезбеди комплет";kind="danger"}
 else if(!o.customer.address){action="Внеси адреса";kind="danger"}
 else if(o.status==="planned"){action=o.state==="risk"?"Провери / подготви комплет":"Подготви и испрати";kind=o.state==="risk"?"warning":"normal"}
 else if(o.status==="shipped"){action="Чекај потврда за прием";kind="waiting";due=o.start}
 else if(o.status==="delivered"){action="Закажи враќање";due=o.end}
 else if(o.status==="returned"){action="Исчисти и провери";due=o.returnedAt||o.end;kind="warning"}
 return {o,action,due,kind,overdue:due<=today&&kind!=="waiting"}
 }).filter(x=>x.action).sort((a,b)=>Number(b.overdue)-Number(a.overdue)||a.due.localeCompare(b.due));
}
function renderMonthlyTasks(){
 const tasks=monthlyTasks();
 return '<div class="air-section-title"><h2>Мои активности овој месец</h2><span>'+tasks.length+' активности</span></div><div class="task-sheet"><div class="task-head"><span>Рок</span><span>Што треба да направиш</span><span>Клиент / пакет</span><span>Статус</span><span></span></div>'+
 tasks.map(t=>'<div class="task-row"><span>'+t.due+'</span><strong>'+esc(t.action)+'</strong><span>'+esc(t.o.customer.name)+' · '+t.o.packageId+'</span><span class="task-priority '+t.kind+'">'+(t.overdue?'За реакција':t.kind==="waiting"?'Се чека':'Планирано')+'</span><button class="air-link" data-task-id="'+esc(t.o.id)+'" onclick="rotationDetail(this.dataset.taskId)">Отвори</button></div>').join('')+
 (tasks.length?'':'<div class="empty">Нема активности овој месец.</div>')+'</div>';
}
function deliveryConfirmationLink(id){
 const o=operationalPlan().find(x=>x.id===id);
 if(!o||o.status!=="shipped"){alert("Прво потврди испраќање.");return}
 const url=new URL("confirm.html",location.href);url.searchParams.set("cycle",id);
 modal('<h2>Линк за клиентска потврда</h2><p>Демо линк за прием на пакетот '+o.packageId+'.</p><label>Линк</label><input class="input" id="receiptUrl" readonly><div id="receiptQr" class="receipt-qr"></div><p class="small">QR скенирање од друг уред НЕ ја ажурира администрацијата без централен backend. Ова е само прототип.</p><footer><button class="btn light" id="copyReceipt">Копирај линк</button><button class="btn light" onclick="closeModal()">Затвори</button></footer>');
 document.getElementById("receiptUrl").value=url.href;
 document.getElementById("copyReceipt").onclick=()=>navigator.clipboard.writeText(url.href);
 const sc=document.createElement("script");sc.src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";sc.onload=()=>{const el=document.getElementById("receiptQr");if(el&&window.QRCode)new QRCode(el,{text:url.href,width:156,height:156})};document.head.appendChild(sc);
}
function receiptPage(){
 const id=new URLSearchParams(location.search).get("cycle"),o=operationalPlan().find(x=>x.id===id),root=document.getElementById("root");
 if(!o||o.status!=="shipped"){root.innerHTML='<main class="public-page"><div class="public-card"><h1>Потврдата не е достапна</h1><p>Нема испратен пакет за овој линк во локалното демо.</p></div></main>';return}
 root.innerHTML='<main class="public-page"><div class="public-card"><h1>Потврда за прием</h1><p>Пакет '+esc(o.packageId)+' за '+esc(o.customer.child)+'</p><p class="note">Демо потврда. Работи само во истиот browser.</p><button id="confirmReceipt" class="btn">Го добив пакетот</button></div></main>';
 document.getElementById("confirmReceipt").onclick=()=>{
 const op=db.operations.find(x=>x.id===id);if(!op||op.step!=="shipped"){alert("Пакетот нема статус испратено.");return}
 op.step="delivered";op.deliveredAt=iso(new Date());op.confirmationSource="client-demo";save();
 root.querySelector(".public-card").innerHTML='<h1>Приемот е потврден</h1><p>Благодариме!</p>';
 };
}
function timeline(){
 const view=localStorage.getItem("toysharing_timeline_range")==="1"?1:2;
 const tab=["tasks","timeline","shipments"].includes(sessionStorage.getItem("toysharing_ops_tab"))?sessionStorage.getItem("toysharing_ops_tab"):"tasks";
 const start=iso(new Date(new Date().getFullYear(),new Date().getMonth(),1));
 const end=addMonths(start,view),orders=operationalPlan();
 const visible=orders.filter(o=>o.start>=start&&o.start<end);
 const today=iso(new Date());
 // A package is actionable only when it has a physical set, an address,
 // enough prep time before outbound shipping, and confirmed workflow steps.
 const classify=o=>{
   if(o.state==="missing"||o.conflict)return {key:"missing",text:"Недостиг",why:"Нема слободна физичка копија за овој циклус."};
   if(!o.customer.address)return {key:"risk",text:"Ризик",why:"Недостасува адреса за испорака."};
   if(o.state==="risk")return {key:"risk",text:"Ризик",why:"Сетот е на чистење и нема потврда дека е подготвен."};
   if((o.status==="planned")&&o.dispatch<=today)return {key:"risk",text:"Ризик",why:"Рокот за испраќање е достигнат или поминат."};
   if(o.status==="returned")return {key:"risk",text:"За подготовка",why:"Вратен сет — потребна е проверка и чистење."};
   return {key:"ready",text:({planned:"Планиран",shipped:"Испратен",delivered:"Доставен",cleaned:"Подготвен"})[o.status]||"Планиран",why:"Сетот е резервиран и во планираниот циклус."};
 };
 const flagged=visible.filter(o=>classify(o).key!=="ready");
 const status=o=>{const c=classify(o);return '<span class="air-status '+c.key+'" title="'+esc(c.why)+'"><i data-lucide="'+(c.key==="ready"?"check-circle-2":c.key==="risk"?"alert-triangle":"x-circle")+'"></i>'+c.text+'</span>'};
 const months=Array.from({length:view},(_,i)=>addMonths(start,i));
 const grid='<div class="air-grid-scroll"><div class="air-grid"><div class="air-grid-header"><div>Клиент</div>'+months.map(m=>'<div>'+new Date(m+"T12:00:00").toLocaleDateString("mk-MK",{month:"long",year:"numeric"})+'</div>').join("")+'</div>'+
 db.customers.filter(c=>c.status==="active").map(c=>'<div class="air-grid-row"><div class="air-grid-client"><b>'+esc(c.name)+'</b><span>'+esc(c.child)+'</span></div>'+months.map(m=>{const o=visible.find(x=>x.customer.id===c.id&&x.start>=m&&x.start<addMonths(m,1));if(!o)return '<div class="air-grid-slot"><span class="air-faint">—</span></div>';const cl=classify(o);return '<div class="air-grid-slot"><button class="air-cycle '+cl.key+'" onclick="rotationDetail(\''+o.id+'\')"><span><b>'+o.packageId+'</b><small>'+o.start.slice(8,10)+'. '+new Date(o.start+"T12:00:00").toLocaleDateString("mk-MK",{month:"short"})+'</small></span>'+status(o)+'</button></div>'}).join("")+'</div>').join("")+'</div></div>';
 const table='<div class="air-table-scroll"><table class="air-data"><thead><tr><th>Датум за испраќање</th><th>Клиент / дете</th><th>Пакет</th><th>Физички сет</th><th>Адреса</th><th>Статус</th><th></th></tr></thead><tbody>'+visible.slice().sort((x,y)=>x.dispatch.localeCompare(y.dispatch)).map(o=>'<tr><td>'+esc(o.dispatch)+'</td><td><strong>'+esc(o.customer.name)+'</strong><small>'+esc(o.customer.child)+'</small></td><td><b>'+o.packageId+'</b></td><td>'+esc(o.code)+'</td><td class="air-address">'+esc(o.address)+'</td><td>'+status(o)+'</td><td><button class="air-link" onclick="rotationDetail(\''+o.id+'\')">Управувај <i data-lucide="chevron-right"></i></button></td></tr>').join("")+'</tbody></table></div>';
 header("Операции","Активности, календар на ротации и испораки.");
 document.getElementById("topAction").innerHTML='<div class="air-range"><button class="'+(view===1?"active":"")+'" onclick="timelineRange(1)">Овој месец</button><button class="'+(view===2?"active":"")+'" onclick="timelineRange(2)">Следни 2 месеци</button></div>';
 document.getElementById("content").innerHTML='<div class="air-workspace">'+
 '<div class="air-metrics"><div><span>Замени</span><strong>'+visible.length+'</strong></div><div><span>Без ризик</span><strong>'+visible.filter(o=>classify(o).key==="ready").length+'</strong></div><div><span>Бараат внимание</span><strong class="air-attention">'+flagged.length+'</strong></div><div class="air-rule"><i data-lucide="clock-3"></i> '+turnaround()+' дена подготовка по враќање</div></div>'+
 '<div class="ops-tabs" role="tablist" aria-label="Оперативни прикази"><button role="tab" aria-selected="'+(tab==="tasks")+'" class="'+(tab==="tasks"?"selected":"")+'" onclick="operationsTab(\'tasks\')">Активности</button><button role="tab" aria-selected="'+(tab==="timeline")+'" class="'+(tab==="timeline"?"selected":"")+'" onclick="operationsTab(\'timeline\')">Timeline</button><button role="tab" aria-selected="'+(tab==="shipments")+'" class="'+(tab==="shipments"?"selected":"")+'" onclick="operationsTab(\'shipments\')">Испораки</button></div>'+ 
 (tab==='tasks'?renderMonthlyTasks():tab==='timeline'?'<div class="air-section-title"><h2>Timeline по клиенти</h2><span>Кликни на пакет за управување со испораката</span></div>'+grid:'<div class="air-section-title"><h2>Испораки и ротации</h2><span>'+visible.length+' циклуси · '+flagged.length+' за проверка</span></div>'+table)+
 '<div class="air-footnote">Ова е план со локално зачувани операции. Зелениот статус е планска достапност, не потврдена InPost испорака. Ризиците се проверуваат за секој конкретен циклус.</div></div>';
}
function operationsTab(tab){sessionStorage.setItem("toysharing_ops_tab",tab);timeline();}
function timelineRange(months){localStorage.setItem("toysharing_timeline_range",String(months));timeline();}

function rotationDetail(id){
 const o=operationalPlan().find(x=>x.id===id);if(!o)return;
 const steps={planned:"Планирано",shipped:"Испратено",delivered:"Доставено",returned:"Вратено",cleaned:"Исчистено"};
 const actions={planned:[["shipped","Потврди испраќање"]],shipped:[["delivered","Потврди достава"],["returned","Потврди враќање"]],delivered:[["returned","Потврди враќање"]],returned:[["cleaned","Потврди чистење"]],cleaned:[]};
 const fields=[["Дете",o.customer.child],["Пакет",o.packageId],["Физички сет",o.code],["Испрати до",o.dispatch],["Почеток",o.start],["Очекувано враќање",o.end],["Вратено на",o.returnedAt||"Не е потврдено"],["Подготвен најрано",o.readyAfter||"Нема"],["Адреса",o.address],["Состојба",o.description]];
 modal('<h2>'+o.packageId+' · '+esc(o.customer.name)+'</h2><p>Оперативен статус: <b>'+steps[o.status]+'</b></p><div class="ops-detail">'+fields.map(f=>'<div><span>'+f[0]+'</span><strong>'+esc(f[1])+'</strong></div>').join("")+'</div>'+
 '<div class="section"><label for="physicalKitChoice">Физички сет · доделување</label><select id="physicalKitChoice" '+(o.status!=="planned"?"disabled":"")+'><option value="">Автоматски избор</option>'+db.stock.filter(s=>s.packageId===o.packageId&&s.status!=="retired").map(s=>'<option value="'+esc(s.id)+'" '+((o.opStockId||o.stockId)===s.id?"selected":"")+'>'+esc(s.code)+'</option>').join("")+'</select><div class="mt"><button class="btn light sm" '+(o.status!=="planned"?"disabled":"")+' onclick="assignKit(\''+o.id+'\')">Зачувај доделување</button></div></div>'+'<div class="section"><label for="trackingInput">Број за следење на пратката</label><input id="trackingInput" class="input" value="'+esc(o.tracking)+'" placeholder="Внеси број од InPost"><div class="mt"><button class="btn light sm" onclick="updateTracking(\''+o.id+'\')">Зачувај број</button></div></div>'+
 '<footer><button class="btn light" onclick="closeModal()">Затвори</button>'+ (o.status==="shipped"?'<button class="btn light" data-confirm-id="'+esc(o.id)+'" onclick="deliveryConfirmationLink(this.dataset.confirmId)">QR потврда</button>':'')+
 (o.state!=="missing"?actions[o.status].map(a=>'<button class="btn" onclick="operationUpdate(\''+o.id+'\',\''+a[0]+'\')">'+a[1]+'</button>').join(""):'<a class="btn" href="inventory.html">Внеси нов сет</a>')+'</footer>');
}

function finances(){
 header("Финансии","Наплати и трошоци во еден табеларен преглед.",'<div class="flex"><button class="btn light" onclick="transactionForm(\'expense\')">+ Трошок</button><button class="btn" onclick="transactionForm(\'payment\')">+ Наплата</button></div>');
 const total=db.payments.reduce((n,x)=>n+Number(x.amount),0),costs=db.expenses.reduce((n,x)=>n+Number(x.amount),0);
 const rows=[...db.payments.map(x=>({...x,type:"payment"})),...db.expenses.map(x=>({...x,type:"expense"}))].sort((a,b)=>b.date.localeCompare(a.date));
 document.getElementById("content").innerHTML='<div class="work-surface"><div class="work-stats"><span>Наплати <strong>'+money(total)+'</strong></span><span>Трошоци <strong>'+money(costs)+'</strong></span><span>Салдо <strong>'+money(total-costs)+'</strong></span></div><div class="work-bar"><strong>Трансакции</strong><span>'+rows.length+' записи</span></div><div class="work-scroll"><table class="work-table"><thead><tr><th>Датум</th><th>Вид</th><th>Опис</th><th>Износ</th><th></th></tr></thead><tbody>'+rows.map(x=>'<tr><td>'+x.date+'</td><td><span class="tag '+(x.type==="expense"?"warn":"")+'">'+(x.type==="payment"?"Наплата":"Трошок")+'</span></td><td>'+esc(x.description)+'</td><td>'+money(x.amount)+'</td><td><button class="air-link" onclick="deleteTransaction(\''+x.type+'\',\''+x.id+'\')">Избриши</button></td></tr>').join('')+'</tbody></table></div></div>';
}

function transactionForm(type){modal('<h2>'+(type==="payment"?"Нова наплата":"Нов трошок")+'</h2><form id="transactionForm" class="form-grid section">'+field("date","Датум",iso(new Date()),"date")+field("amount","Износ (PLN)",119,"number",'min="0" step="0.01"')+'<div class="wide">'+field("description","Опис","")+'</div></form><footer><button class="btn light" onclick="closeModal()">Откажи</button><button class="btn" onclick="saveTransaction(\''+type+'\')">Зачувај</button></footer>')}
function saveTransaction(type){const f=document.getElementById("transactionForm");if(!f.reportValidity())return;const d=formData("transactionForm");d.amount=Number(d.amount);db[type==="payment"?"payments":"expenses"].push({id:uid(),...d});save();closeModal();render()}
function deleteTransaction(type,id){if(!confirmDelete("Да се избрише трансакцијата?"))return;const key=type==="payment"?"payments":"expenses";db[key]=db[key].filter(x=>x.id!==id);save();render()}
function settings(){
 header("Поставки","Бизнис правила, подготовка и локални податоци.");
 const s=db.settings;
 document.getElementById("content").innerHTML='<div class="work-surface"><div class="work-bar"><strong>Бизнис параметри</strong><span>Правилата важат за сите идни ротации</span></div><form id="settingsForm" class="work-settings">'+field("price","Претплата (PLN/месец)",s.price,"number",'min="0" step="0.01"')+field("shipping","Транспорт по циклус (PLN)",s.shipping,"number",'min="0" step="0.01"')+field("handling","Обработка (PLN)",s.handling,"number",'min="0" step="0.01"')+field("buffer","Денови за подготовка (минимум 7)",Math.max(7,s.buffer),"number",'min="7" max="30"')+'<div class="work-settings-actions"><button type="button" class="btn" onclick="saveSettings()">Зачувај поставки</button></div></form><div class="work-bar work-bar-second"><strong>Локални податоци</strong><span>Резервна копија и тестирање</span></div><div class="work-actions"><button class="btn light" onclick="exportData()">Извези JSON</button><label class="btn light" style="margin:0;cursor:pointer">Увези JSON<input type="file" accept=".json" onchange="importData(event)" hidden></label><button class="btn light" onclick="demo()">Вчитај демо-податоци</button><button class="btn danger" onclick="resetAll()">Ресетирај локални податоци</button></div></div>';
}
function saveSettings(){const f=document.getElementById("settingsForm");if(!f.reportValidity())return;const d=formData("settingsForm");db.settings=Object.fromEntries(Object.entries(d).map(([k,v])=>[k,Number(v)]));db.settings.buffer=Math.max(7,db.settings.buffer);save();alert("Поставките се зачувани.")}
function exportData(){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(db,null,2)],{type:"application/json"}));a.download="montessori-backup-"+iso(new Date())+".json";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
async function importData(e){const file=e.target.files?.[0];if(!file)return;try{const x=JSON.parse(await file.text());if(!Array.isArray(x.customers)||!Array.isArray(x.packages)||!Array.isArray(x.stock))throw Error("Невалиден формат");if(!confirm("Увозот ќе ги замени сегашните податоци. Продолжи?"))return;db={...seed(),...x};save();render()}catch(err){alert("Не може да се увезе: "+err.message)}}
function buildDemo(){
 const data=seed();
 data.settings.buffer=7;
 const people=[
  ["Ана Петровска","Лука",12,"ul. Długa 12, 80-827 Gdańsk"],
  ["Бојан Стојанов","Мила",13,"ul. Świętojańska 48, 81-391 Gdynia"],
  ["Елена Марковска","Јана",14,"ul. Grunwaldzka 26, 80-241 Gdańsk"],
  ["Марија Илиевска","Филип",15,"ul. Kościuszki 7, 81-704 Sopot"],
  ["Стефан Николов","Ива",16,"ul. Morska 120, 81-225 Gdynia"]
 ];
 data.customers=people.map((p,i)=>({id:"demo-c"+i,name:p[0],child:p[1],email:"demo"+(i+1)+"@example.com",age:p[2],start:"2026-10-01",status:"active",address:p[3],source:"demo"}));
 // Seven tangible complete toy sets, five allocated for launch day and
 // M17–M18 prepared for upcoming monthly age progression.
 const ids=["M12","M13","M14","M15","M16","M17","M18"];
 data.stock=ids.map((id,i)=>({id:"demo-s"+i,code:"TS-"+id+"-001",packageId:id,price:Number(data.packages.find(p=>p.id===id).cost),condition:"Многу добра",status:"ready"}));
 data.payments=people.map((p,i)=>({id:"demo-pay"+i,date:"2026-10-01",description:"Претплата за октомври — "+p[0],amount:119}));
 data.expenses=[
  {id:"demo-exp1",date:"2026-09-28",description:"Набавка на 7 Montessori комплети",amount:ids.reduce((sum,id)=>sum+Number(data.packages.find(p=>p.id===id).cost),0)},
  {id:"demo-exp2",date:"2026-10-01",description:"Амбалажа за 5 стартни испораки",amount:75}
 ];
 return data;
}
function demo(){
 if(!confirm("Замена со старт на 1 октомври 2026: 5 деца, 7 физички Montessori комплети и пример-финансии?"))return;
 db=buildDemo();save();render();
}

function signup(){
 const root=document.getElementById("root");
 root.innerHTML='<main class="public-page"><div class="public-card"><a class="small muted" href="index.html">← Администрација</a><div class="public-logo"><img src="./assets/ToySharing%20House%20of%20Play.png" alt="ToySharing"></div><h1>Montessori програма за твоето дете</h1><p>5 внимателно избрани играчки според возраста. Нов сет секој месец.</p><div class="note"><b>'+money(db.settings.price)+' / месечно</b> · Демонстративна регистрација без плаќање</div><form id="signupForm" class="form-grid section">'+field("name","Родител")+field("email","Е-пошта","","email")+field("child","Име на дете")+field("birth","Датум на раѓање","","date")+field("start","Почеток",iso(new Date()),"date")+field("address","Адреса за достава")+'<div class="wide"><button type="submit" class="btn" style="width:100%">Пријави се</button></div></form><p class="small">Само локално демо. Не внесувај вистински лични податоци.</p></div></main>';
 document.getElementById("signupForm").addEventListener("submit",function(e){
  e.preventDefault();const d=formData("signupForm"),age=diffMonths(d.birth,d.start);
  if(date(d.birth)>date(d.start)||age<12||age>23){alert("Пилотот е за возраст од 12 до 23 месеци.");return}
  if(db.customers.some(c=>c.email.toLowerCase()===d.email.toLowerCase()&&c.child.toLowerCase()===d.child.toLowerCase())){alert("Оваа регистрација веќе постои.");return}
  db.customers.push({id:uid(),name:d.name,email:d.email,child:d.child,age:age,start:d.start,address:d.address,status:"paused",source:"public-demo"});
  save();document.querySelector(".public-card").innerHTML='<div class="public-mark"><i data-lucide="check"></i></div><h1>Регистрацијата е примена</h1><p>Не е извршено плаќање. Потребна е административна активација.</p><a class="btn" href="customers.html">Преглед во администрацијата</a>';
 });
}

function resetAll(){if(!confirm("Сите локални податоци ќе се избришат. Продолжи?"))return;db=seed();save();render()}
if(localStorage.getItem(KEY)===null){db=buildDemo();save();}
document.addEventListener("DOMContentLoaded",()=>{if(page()==="signup")signup();else if(page()==="confirm")receiptPage();else layout()});

function initializeLucide(){
  const run=()=>{if(window.lucide && document.querySelector("i[data-lucide]"))window.lucide.createIcons({attrs:{"stroke-width":1.75}})};
  const script=document.createElement("script");
  script.src="https://unpkg.com/lucide@0.468.0/dist/umd/lucide.min.js";
  script.onload=run;
  document.head.appendChild(script);
  const observer=new MutationObserver(run);
  observer.observe(document.body,{childList:true,subtree:true});
  run();
}
document.addEventListener("DOMContentLoaded",initializeLucide);
