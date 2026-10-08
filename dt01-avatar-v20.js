/* DT-01 unified authenticated member avatar renderer (droid, private upload or emoji). */
(()=>{'use strict';
const cache=new Map();
async function render(holder,value,db,alt='Profilbild'){
 if(!holder)return;
 holder.replaceChildren();
 if(/^droid:[A-Za-z0-9_-]+\.webp$/.test(value||'')){
  const img=document.createElement('img');img.alt=alt;img.loading='lazy';
  img.src='./assets/droid-default/'+value.slice(6);
  img.onerror=()=>{if(img.isConnected){holder.textContent='🤖'}};holder.append(img);return;
 }
 if(/^upload:[a-f0-9-]{36}\/avatar\.(png|jpg|webp)$/.test(value||'')&&db){
  const path=value.slice(7), cached=cache.get(path),now=Date.now();let url=cached&&cached.until>now?cached.url:null;
  if(!url){const {data,error}=await db.storage.from('dt01-profile-avatars').createSignedUrl(path,600);
   if(error||!data?.signedUrl){holder.textContent='🤖';return}url=data.signedUrl;cache.set(path,{url,until:now+8*60*1000});}
  if(!holder.isConnected)return;
  const img=document.createElement('img');img.alt=alt;img.loading='lazy';img.src=url;
  img.onerror=()=>{if(img.isConnected)holder.textContent='🤖'};holder.append(img);return;
 }
 holder.textContent=typeof value==='string'&&value&&!value.startsWith('upload:')?value:'🤖';
}
window.DT01Avatar={render,invalidate:()=>cache.clear()};
window.addEventListener('dt01:profile-updated',()=>cache.clear());
})();
