// Delad synkronisering för MINI Körkoll. Kräver Firebase Auth + Firestore.
const dot = document.getElementById('syncDot');
const label = document.getElementById('syncLabel');
const share = document.getElementById('share');
const config = window.MINI_FIREBASE_CONFIG;
const codeKey = 'mini-family-room-v1';
const validRoom = s => /^[a-f0-9]{32}$/.test(s);
const fromHash = location.hash.match(/^#rum=([a-f0-9]{32})$/)?.[1];
let room = fromHash || localStorage.getItem(codeKey);
if (!validRoom(room || '')) room = Array.from(crypto.getRandomValues(new Uint8Array(16)), b=>b.toString(16).padStart(2,'0')).join('');
localStorage.setItem(codeKey, room);
if (!fromHash) history.replaceState(null,'', location.pathname + location.search + '#rum=' + room);
function status(message, active=false, failed=false){label.textContent=message;dot.classList.toggle('live',active);dot.classList.toggle('offline',failed)}
share.addEventListener('click',async()=>{
  if(!config){alert('Webbsidan är ännu inte kopplad till Firebase. Delning fungerar efter att molnsynkronisering är aktiverad.');return;}
  const url = location.href;
  try {if(navigator.share)await navigator.share({title:'MINI Körkoll',url});else {await navigator.clipboard.writeText(url);alert('Länken är kopierad.');}}
  catch(e){if(e.name!=='AbortError')prompt('Kopiera den här länken:',url)}
});
if (!config || !config.apiKey || !config.projectId || !config.appId) {
  status('Endast denna enhet · Synkronisering ej konfigurerad');
} else {
  try {
    const [{initializeApp},{getAuth,signInAnonymously},{getFirestore,doc,onSnapshot,setDoc,runTransaction}] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js'),
      import('https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js')
    ]);
    const app=initializeApp(config);
    const auth=getAuth(app);
    await signInAnonymously(auth);
    const db=getFirestore(app);
    const ref=doc(db,'miniRooms',room);
    let ready=false, writeTimeout, lastServer='';
    const safe=x=>({odometerKm:Number(x.odometerKm),start:String(x.start),limit:Number(x.limit),initial:Number(x.initial)});
    const serialize=x=>JSON.stringify(safe(x));
    onSnapshot(ref,async snap=>{
      if(!snap.exists()){
        if(!ready){
          try{ await runTransaction(db,async tx=>{const s=await tx.get(ref);if(!s.exists())tx.set(ref,{...safe(window.miniGetState()),updatedAt:Date.now()})}) }
          catch(err){status('Kunde inte skapa delad körkoll: '+err.code,false,true)}
        }
        return;
      }
      const data=snap.data();
      const same=serialize(data)===serialize(window.miniGetState());
      lastServer=serialize(data);
      if(!same)window.dispatchEvent(new CustomEvent('mini:remote',{detail:safe(data)}));
      ready=true;
      status('Synkroniserad · Gemensam mätarställning',true);
    },err=>status('Synkroniseringsfel: '+err.code,false,true));
    window.addEventListener('mini:changed',e=>{
      if(!ready)return;
      clearTimeout(writeTimeout);
      const v=safe(e.detail);
      writeTimeout=setTimeout(async()=>{
        if(serialize(v)===lastServer)return;
        status('Sparar till båda telefonerna…');
        try{await setDoc(ref,{...v,updatedAt:Date.now()});status('Synkroniserad · Gemensam mätarställning',true)}
        catch(err){status('Kunde inte spara: '+err.code,false,true)}
      },650);
    });
    status('Ansluter båda telefonerna…');
  } catch(err){status('Kunde inte ansluta · '+(err.code||err.message),false,true);}
}
