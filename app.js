/* App JS - moved from inline script and enhanced */
const statusEl = document.getElementById('status');
const spinner = document.getElementById('spinner');
const crateResult = document.getElementById('crateResult');
const copyBtn = document.getElementById('copyBtn');
const submitBtn = document.getElementById('submitBtn');
const timer = document.getElementById('timer');

/* Theme handling */
(function initTheme(){
  const saved = localStorage.getItem('theme');
  const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  const theme = saved || (prefersLight? 'light' : 'dark');
  document.documentElement.setAttribute('data-theme', theme);
  const btn = document.getElementById('themeToggle');
  if(btn) btn.setAttribute('aria-pressed', theme==='light');
  if(btn){
    btn.addEventListener('click', ()=>{
      const cur = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', cur);
      localStorage.setItem('theme', cur);
      btn.setAttribute('aria-pressed', cur==='light');
    });
  }
})();

/* server status with graceful failure */
async function updateStatus(){
  try{
    const res = await fetch('https://api.mcsrvstat.us/2/helvornsmp.playserver.pro');
    if(!res.ok) throw new Error('Network');
    const data = await res.json();
    statusEl.textContent = data.online ? '🟢 Reachable' : '🔴 Sleeping';
  }catch(e){
    statusEl.textContent = '⚠ Status unavailable';
  }
}
updateStatus();
setInterval(updateStatus, 30000);

/* copy ip */
window.copyIP = function(id){
  const txt = document.getElementById(id).textContent;
  navigator.clipboard.writeText(txt).then(()=>{
    try{alert('Copied!')}catch(e){}
  });
};

/* Loot data */
const loot=[
  {item:'Diamond x6',rarity:'Uncommon'},
  {item:'Totem of Undying',rarity:'Rare'},
  {item:'Elytra',rarity:'Ultra Rare'},
  {item:'Beacon',rarity:'Legendary'},
  {item:'Nether Star',rarity:'Legendary'},
  {item:'Shulker Box',rarity:'Ultra Rare'},
  {item:'Enchanted Golden Apple',rarity:'Rare'},
  {item:'Iron Ingot x16',rarity:'Common'}
];

const weights={Common:50,Uncommon:25,Rare:15,'Ultra Rare':8,Legendary:2};
let lastCode = '';

function pickItem(){
  const list=[];
  loot.forEach(i=>{
    const w = weights[i.rarity] || 1;
    for(let x=0;x<w;x++) list.push(i);
  });
  return list[Math.floor(Math.random()*list.length)];
}

/* Web Worker for code generation */
let codeWorker;
if(window.Worker){
  try{ codeWorker = new Worker('worker.js'); }
  catch(e){ codeWorker = null; }
}
if(codeWorker){
  codeWorker.onmessage = (e)=>{
    const {code, item, rarity} = e.data;
    lastCode = code;
    crateResult.innerHTML = `🎉 You got: <span class="${rarityClass(rarity)}">${item}</span><br><br>Code:<br>${code}`;
    copyBtn.style.display='block';
    submitBtn.style.display='block';
    updateTimer();
  };
}

function rarityClass(r){
  if(!r) return 'common';
  if(r==='Common') return 'common';
  if(r==='Uncommon') return 'uncommon';
  if(r==='Rare') return 'rare';
  if(r==='Ultra Rare') return 'ultra';
  return 'legendary';
}

/* timer */
function updateTimer(){
  const last = localStorage.getItem('crateTime');
  if(!last){ timer.textContent=''; return; }
  const remaining = 86400000 - (Date.now()-Number(last));
  if(remaining<=0){ timer.textContent='✅ Crate Ready!'; return; }
  const h = Math.floor(remaining/3600000);
  const m = Math.floor((remaining%3600000)/60000);
  const s = Math.floor((remaining%60000)/1000);
  timer.textContent = `Next crate in ${h}h ${m}m ${s}s`;
}
setInterval(updateTimer,1000);
updateTimer();

function spinAnimation(callback){
  const items = loot.map(l=>l.item);
  let count=0;
  const spin = setInterval(()=>{
    spinner.textContent = items[Math.floor(Math.random()*items.length)];
    count++;
    if(count>20){ clearInterval(spin); callback(); }
  },100);
}

window.openCrate = function(){
  const last = localStorage.getItem('crateTime');
  if(last && Date.now()-Number(last) < 86400000){ updateTimer(); return; }
  spinAnimation(()=>{
    const reward = pickItem();
    localStorage.setItem('crateTime', String(Date.now()));
    if(codeWorker){
      codeWorker.postMessage({action:'makeCode', item: reward.item, rarity: reward.rarity});
    } else {
      // Fallback code gen on main thread
      const d=new Date();
      const time=d.toISOString().slice(2,16).replace(/[-T:]/g,'');
      const salt=Math.random().toString(36).substring(2,6).toUpperCase();
      const code = `HEL-${time}-${reward.rarity}-${reward.item}-${salt}`;
      lastCode = code;
      crateResult.innerHTML = `🎉 You got: <span class="${rarityClass(reward.rarity)}">${reward.item}</span><br><br>Code:<br>${code}`;
      copyBtn.style.display='block';
      submitBtn.style.display='block';
      updateTimer();
    }
  });
};

copyBtn.onclick = ()=>{
  if(!lastCode) return;
  navigator.clipboard.writeText(lastCode).then(()=>{ try{ alert('Code copied!') }catch(e){} });
};

/* submit claim (existing Google Script) */
const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyF_0sr790j2nhk_1lBc8EYRFuFQpKymO4T6OMUB--wy3bw_xQ5zMuMakyH114Q9HhN/exec';
submitBtn.onclick = async ()=>{
  const username = prompt('Enter your Minecraft username to claim:');
  if(!username) return;
  const rewardText = crateResult.textContent.match(/You got: (.+?)Code/);
  if(!rewardText) return alert('Error detecting reward.');
  const rewardItem = rewardText[1].trim();
  const rarityMatch = lastCode.match(/HEL-\d{6}-([^-]+)-/);
  const rewardRarity = rarityMatch ? rarityMatch[1] : 'Unknown';
  try{
    const res = await fetch(SCRIPT_URL, { method:'POST', body: JSON.stringify({ code: lastCode, item: rewardItem, rarity: rewardRarity, player: username }) });
    const data = await res.json();
    if(data.status === 'duplicate') alert('❌ This code was already claimed!');
    else if(data.status === 'success'){ alert('✅ Claim submitted! Staff will verify.'); submitBtn.style.display='none'; }
    else alert('⚠ Something went wrong.');
  }catch(e){ alert('⚠ Could not connect to the database.'); }
};

/* Simple hash navigation focus for accessibility */
window.addEventListener('hashchange', ()=>{
  const id = location.hash.replace('#','');
  if(!id) return;
  const el = document.getElementById(id);
  if(el) el.focus({preventScroll:false});
});

/* Register service worker for PWA (best-effort) */
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('service-worker.js').catch(()=>{});
}

/* Lightweight privacy-friendly analytics stub */
(function analyticsStub(){
  try{
    const key='hsmp_events';
    const events = JSON.parse(localStorage.getItem(key) || '[]');
    function track(name){
      events.push({name, t:Date.now()});
      localStorage.setItem(key, JSON.stringify(events.slice(-200)));
    }
    // track some interactions
    document.addEventListener('click', e=>{
      const t = e.target;
      if(t && t.classList && t.classList.contains('crateBtn')) track('open_crate');
      if(t && t.id === 'themeToggle') track('toggle_theme');
    });
  }catch(e){}
})();
