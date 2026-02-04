/* Web Worker: generates crate codes off the main thread */
self.addEventListener('message', (e)=>{
  const data = e.data;
  if(!data || data.action!=='makeCode') return;
  const item = data.item || 'Unknown';
  const rarity = data.rarity || 'Common';
  const d = new Date();
  const time = d.toISOString().slice(2,16).replace(/[-T:]/g,'');
  const salt = Math.random().toString(36).substring(2,6).toUpperCase();
  const code = `HEL-${time}-${rarity}-${item}-${salt}`;
  self.postMessage({code, item, rarity});
});
