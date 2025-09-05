export function ArrowNav({active,onJump,total}:{active:number;onJump:(i:number)=>void;total:number}){
  const disabledUp=active===0; const disabledDown=active===total-1;
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
      <button aria-label="Sebelumnya" disabled={disabledUp} onClick={()=>!disabledUp&&onJump(active-1)} className={`h-11 w-11 rounded-full border flex items-center justify-center text-white transition group backdrop-blur-sm bg-white/5 border-white/30 hover:bg-white/20 active:scale-95 ${disabledUp?'opacity-30 cursor-not-allowed':''}`}> <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 19V5" /><path d="m5 12 7-7 7 7" /></svg></button>
      <button aria-label="Berikutnya" disabled={disabledDown} onClick={()=>!disabledDown&&onJump(active+1)} className={`h-11 w-11 rounded-full border flex items-center justify-center text-white transition group backdrop-blur-sm bg-white/5 border-white/30 hover:bg-white/20 active:scale-95 ${disabledDown?'opacity-30 cursor-not-allowed':''}`}> <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-current" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 5v14" /><path d="m19 12-7 7-7-7" /></svg></button>
    </div>
  );
}
