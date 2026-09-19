const PERSONS=[
{id:"samuel",name:"Samuel",color:"#2563eb"},
{id:"jonathan",name:"Jonathan",color:"#db2777"},
{id:"jurian",name:"Jurian",color:"#16a34a"},
{id:"laurens",name:"Laurens",color:"#ea580c"},
{id:"daniel",name:"Daniel",color:"#7c3aed"},
{id:"pablo",name:"Pablo",color:"#0891b2"}];

const db=supabase.createClient(window.SUPABASE_CONFIG.url,window.SUPABASE_CONFIG.key);
let selected=null,running=false,startAt=0,frame=null,pending=null;

const $=id=>document.getElementById(id);
const fmt=ms=>{let m=Math.floor(ms/60000),s=Math.floor(ms%60000/1000),c=Math.floor(ms%1000/10);return `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}.${String(c).padStart(2,"0")}`};
function screen(id){document.querySelectorAll(".screen").forEach(x=>x.classList.add("hidden"));$(id).classList.remove("hidden")}
function toast(x){$("toast").textContent=x;$("toast").classList.add("show");clearTimeout(window.tt);window.tt=setTimeout(()=>$("toast").classList.remove("show"),2200)}

$("people").innerHTML=PERSONS.map(p=>`<button class="person" style="background:${p.color}" data-id="${p.id}">${p.name}</button>`).join("");
document.querySelectorAll(".person").forEach(b=>b.onclick=()=>selectPerson(b.dataset.id));

function selectPerson(id){selected=PERSONS.find(p=>p.id===id);$("personName").textContent=selected.name;$("timer").textContent="00:00.00";$("timerBtn").textContent="START";$("timerBtn").classList.remove("running");$("hint").textContent="Druk op START om te beginnen.";screen("timerScreen")}
function tick(){if(!running)return;$("timer").textContent=fmt(performance.now()-startAt);frame=requestAnimationFrame(tick)}
function toggle(){if(!running){running=true;startAt=performance.now();$("timerBtn").textContent="STOP";$("timerBtn").classList.add("running");$("hint").textContent="Druk op STOP wanneer de trek voorbij is.";frame=requestAnimationFrame(tick)}else{running=false;cancelAnimationFrame(frame);let ms=Math.round(performance.now()-startAt);pending={person:selected,duration_ms:ms};$("resultName").textContent=selected.name;$("resultTime").textContent=fmt(ms);screen("result")}}
$("timerBtn").onclick=toggle;

$("discard").onclick=()=>{pending=null;screen("home");toast("Meting weggegooid")};
$("save").onclick=async()=>{if(!pending)return;$("save").disabled=true;let {error}=await db.from("measurements").insert({person_id:pending.person.id,duration_ms:pending.duration_ms});$("save").disabled=false;if(error){console.error(error);toast("Opslaan mislukt: "+error.message);return}pending=null;await loadScores();screen("home");toast("Meting opgeslagen")};
$("back").onclick=()=>{if(running)return toast("Stop eerst de timer.");screen("home")};
$("scores").onclick=()=>{screen("scoreScreen");loadScores()};
$("scoreBack").onclick=()=>screen("home");

async function loadScores(){
 let {data,error}=await db.from("measurements").select("id,person_id,duration_ms,created_at").order("duration_ms",{ascending:true});
 if(error){$("status").textContent="⚠️ Databasefout";$("scoreboard").innerHTML=`<p>${error.message}</p>`;return}
 $("status").textContent="● Verbonden";
 const best=new Map(),counts={};
 data.forEach(r=>{counts[r.person_id]=(counts[r.person_id]||0)+1;if(!best.has(r.person_id)||r.duration_ms<best.get(r.person_id).duration_ms)best.set(r.person_id,r)});
 const rows=[...best.values()].sort((a,b)=>a.duration_ms-b.duration_ms);
 $("scoreboard").innerHTML=rows.length?rows.map((r,i)=>{let p=PERSONS.find(x=>x.id===r.person_id)||{name:r.person_id};return `<div class="row"><b>${i+1}</b><div><strong>${p.name}</strong><small>${counts[r.person_id]} ${counts[r.person_id]===1?"poging":"pogingen"}</small></div><strong>${fmt(r.duration_ms)}</strong></div>`}).join(""):"<p class='empty'>Nog geen opgeslagen tijden.</p>";
}

db.channel("measurements-live").on("postgres_changes",{event:"*",schema:"public",table:"measurements"},async payload=>{console.log("Realtime:",payload);await loadScores()}).subscribe(status=>console.log("Realtime status:",status));
loadScores();