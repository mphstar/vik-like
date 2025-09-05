import { useParams, Link } from 'react-router-dom';
import { MUSEUMS } from './MuseumData';
import { useMemo, useRef, useEffect, useState } from 'react';
import { animate, type AnimationPlaybackControls } from 'framer-motion';
import { Section, type SectionData, CursorBullet } from '../components/organisms';
import { Header } from '../components/templates';
import { NavDots, ArrowNav, ScrollProgress } from '../components/molecules';
import { Logo } from '../components/atoms';

export function MuseumDetailPage(){
  const { id } = useParams();
  const museum = MUSEUMS.find(m=>m.id===id);
  if(!museum){
    return <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center gap-6">
      <p className="text-white/70">Museum tidak ditemukan.</p>
      <Link to="/museums" className="underline text-sm">Kembali</Link>
    </div>;
  }

  // Build sections: intro + each category
  const sections: SectionData[] = useMemo(()=>{
    const base: SectionData[] = [{
      id: 'intro',
      title: museum.name,
      navLabel: 'Intro',
      subtitle: museum.location,
      bg: museum.hero,
      content: <p className="max-w-2xl text-white/90 md:text-lg leading-relaxed">{museum.description}</p>,
    //   ctaHref: '/museums'
    }];
    const cat = museum.categories.map(c=> ({
      id: c.id,
      title: c.name,
      navLabel: c.name.split(/\s+/).slice(0,2).join(' '),
      subtitle: 'Kategori',
      align: c.align || 'left',
      bg: c.image,
      content: <div className="space-y-4"><p className="text-white/80 text-sm md:text-base">{c.blurb || 'Kategori koleksi.'}</p></div>
    } as SectionData));
    return [...base, ...cat];
  },[museum]);

  // Preload images
  const [progress,setProgress]=useState(0); const [ready,setReady]=useState(false); const preloadStarted=useRef(false);
  useEffect(()=>{ if(preloadStarted.current) return; preloadStarted.current=true; const urls=sections.map(s=>s.bg).filter(Boolean) as string[]; if(urls.length===0){setProgress(1); setReady(true); return;} let loaded=0; const start=performance.now(); urls.forEach(u=>{ const img=new Image(); const done=()=>{loaded++; setProgress(loaded/urls.length); if(loaded===urls.length){ const elapsed=performance.now()-start; const wait=Math.max(0,550-elapsed); setTimeout(()=>setReady(true),wait);} }; img.onload=done; img.onerror=done; img.src=u; }); },[sections]);

  const containerRef=useRef<HTMLDivElement|null>(null); const sectionRefs=useRef<(HTMLDivElement|null)[]>([]); const [active,setActive]=useState(0); const scrollAnimRef=useRef<AnimationPlaybackControls|null>(null); const isAnimatingRef=useRef(false);
  useEffect(()=>{ if(!ready) return; const rootEl=containerRef.current; if(!rootEl) return; const els=sectionRefs.current.filter(Boolean) as HTMLDivElement[]; const obs=new IntersectionObserver(entries=>{ entries.forEach(e=>{ if(e.isIntersecting){ const idx=els.findIndex(el=>el===e.target); if(idx!==-1) setActive(idx); } }); },{root:rootEl,threshold:0.5}); els.forEach(el=>obs.observe(el)); return ()=>obs.disconnect(); },[ready]);

  const SCROLL_CONF={ overshootRatio:0.08, overshootMin:36, overshootMax:100, phase1Duration:0.38, directDuration:0.55, springStiffness:150, springDamping:30 } as const;
  const scrollToIndex=(idx:number,opts?:{overshoot?:boolean})=>{ const container=containerRef.current; const targetEl=sectionRefs.current[idx]; if(!container||!targetEl) return; const start=container.scrollTop; const target=targetEl.offsetTop; if(Math.abs(target-start)<2) return; const maxScroll=container.scrollHeight-container.clientHeight; const direction=target>start?1:-1; const distance=Math.abs(target-start); const enableOvershoot=opts?.overshoot!==false; let overshoot=target; if(enableOvershoot){ const dynamic=Math.min(Math.max(distance*SCROLL_CONF.overshootRatio,SCROLL_CONF.overshootMin),SCROLL_CONF.overshootMax); overshoot=target+direction*dynamic;} overshoot=Math.min(Math.max(overshoot,0),maxScroll); scrollAnimRef.current?.stop(); isAnimatingRef.current=true; const prevSnap=container.style.scrollSnapType; container.style.scrollSnapType='none'; const finish=()=>{ isAnimatingRef.current=false; container.style.scrollSnapType=prevSnap||''; }; if(overshoot!==target){ const phase1=animate(start,overshoot,{duration:SCROLL_CONF.phase1Duration,ease:[0.3,0.95,0.55,0.98],onUpdate:v=>{container.scrollTop=v;}}); phase1.finished.then(()=>{ scrollAnimRef.current=animate(overshoot,target,{type:'spring',stiffness:SCROLL_CONF.springStiffness,damping:SCROLL_CONF.springDamping,restDelta:0.4,onUpdate:v=>{container.scrollTop=v;},onComplete:finish,onStop:finish}); }).catch(finish); } else { const direct=animate(start,target,{duration:SCROLL_CONF.directDuration,ease:[0.25,0.85,0.35,1],onUpdate:v=>{container.scrollTop=v;},onComplete:finish,onStop:finish}); direct.finished.catch(finish);} };

  useEffect(()=>{ if(!ready) return; const el=containerRef.current; if(!el) return; const lastRef={current:0}; const cooldown=420; const onWheel=(e:WheelEvent)=>{ if(isAnimatingRef.current){e.preventDefault(); return;} if(Math.abs(e.deltaY)<Math.abs(e.deltaX)) return; const now=performance.now(); if(now-lastRef.current<cooldown) return; if(Math.abs(e.deltaY)<40) return; e.preventDefault(); lastRef.current=now; let next=active+(e.deltaY>0?1:-1); if(next<0) next=0; else if(next>=sections.length) next=sections.length-1; if(next!==active) scrollToIndex(next); }; el.addEventListener('wheel',onWheel,{passive:false}); return ()=>el.removeEventListener('wheel',onWheel); },[active,ready,sections.length]);

  // Mobile snap assist (coarse pointer)
  useEffect(()=>{ if(!ready) return; const el=containerRef.current; if(!el) return; const isCoarse=window.matchMedia('(pointer:coarse)').matches; if(!isCoarse) return; let idle: number | null=null; const delay=120; const snap=()=>{ if(isAnimatingRef.current) return; const container=containerRef.current; if(!container) return; const st=container.scrollTop; let best=0; let bestDist=Infinity; sectionRefs.current.forEach((sec,i)=>{ if(!sec) return; const d=Math.abs(sec.offsetTop-st); if(d<bestDist){bestDist=d; best=i;} }); const target=sectionRefs.current[best]; if(!target) return; const diff=Math.abs(target.offsetTop-st); if(diff<14) return; container.scrollTo({top:target.offsetTop,behavior:'smooth'}); }; const onScroll=()=>{ if(idle) clearTimeout(idle); idle=window.setTimeout(snap,delay); }; el.addEventListener('scroll',onScroll,{passive:true}); return ()=>{ el.removeEventListener('scroll',onScroll); if(idle) clearTimeout(idle); }; },[active,ready,sections.length]);

  if(!ready){
    return <div className="h-screen w-screen flex items-center justify-center bg-black text-white relative overflow-hidden" aria-busy="true" aria-label="Memuat aset kategori">
      <div className="absolute inset-0 opacity-40 [mask-image:radial-gradient(circle_at_center,white,transparent_70%)] animate-pulse pointer-events-none bg-[conic-gradient(from_0deg,rgba(255,255,255,0.08),rgba(255,255,255,0)_55%,rgba(255,255,255,0.08))]" />
      <div className="relative z-10 flex flex-col items-center gap-8 px-6">
        <div className="flex items-center gap-4"><Logo /><span className="font-semibold tracking-wide text-lg">{museum.name.split(' ')[0]}</span></div>
        <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden"><div className="h-full bg-white transition-[width] duration-300 ease-out" style={{width:`${Math.round(progress*100)}%`}} /></div>
        <div className="text-xs font-mono tracking-wider text-white/70">{Math.round(progress*100)}%</div>
      </div>
    </div>;
  }

  return (
    <div ref={containerRef} className="h-screen w-screen overflow-y-scroll snap-y snap-mandatory scrollbar-none relative bg-black">
      <Header
        active={active}
        onJump={scrollToIndex}
        sections={sections}
        brand={museum.name.split(' ')[0]}
        backHref="/museums"
        actions={<>
          <Link to="/" className="text-xs text-white/60 hover:text-white transition underline/30">Home</Link>
        </>}
      />
      <NavDots count={sections.length} active={active} onJump={scrollToIndex} />
      {sections.map((s,i)=>(<Section key={s.id} ref={el=>{sectionRefs.current[i]=el;}} data={s} index={i} />))}
      <ScrollProgress targetRef={containerRef} />
      <ArrowNav active={active} onJump={scrollToIndex} total={sections.length} />
      <CursorBullet />
    </div>
  );
}
