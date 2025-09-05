import { useRef, useEffect, useState } from "react";
import { animate, type AnimationPlaybackControls } from "framer-motion";
import { Header } from './components/templates';
import { NavDots, ArrowNav, ScrollProgress } from './components/molecules';
import { CursorBullet, Section, type SectionData } from './components/organisms';
import { Logo } from './components/atoms';

const SECTIONS: SectionData[] = [
  {
    id: "intro",
    title: "Jelajah Nusantara",
  navLabel: "Intro",
    subtitle: "Eksplor keindahan alam & budaya Indonesia dari barat ke timur",
    bg: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?q=80&w=1400&auto=format&fit=crop",

    content: (
      <p className="max-w-2xl mx-auto md:mx-0 text-white/90 md:text-lg leading-relaxed">
        Indonesia adalah mosaik kepulauan dengan lebih dari 17.000 pulau, setiap sudutnya
        menawarkan lanskap dramatis, kuliner khas, dan tradisi hidup. Gulir untuk melihat beberapa
        destinasi ikonik yang memanggil petualang maupun pencari ketenangan.
      </p>
    ),
    ctaHref: "#",
  },
  {
    id: "bali",
    title: "Bali",
  navLabel: "Bali",
    subtitle: "Pulau Dewata: budaya, spiritualitas & seni yang berpadu",
    bg: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=1400&auto=format&fit=crop",
    content: (
      <div className="max-w-xl space-y-4">
        <p className="text-white/90">
          Dari terasering hijau Ubud hingga pantai berpasir emas di selatan, Bali memanjakan indera.
          Upacara harian, aroma dupa, dan arsitektur pura menciptakan ritme spiritual yang khas.
        </p>
        <ul className="text-white/80 text-sm md:text-base list-disc pl-5 grid gap-1">
          <li>Ubud: seni, yoga, kuliner sehat</li>
          <li>Canggu & Uluwatu: peselancar & sunset epik</li>
          <li>Tirta Empul & Tanah Lot: ritual & panorama</li>
        </ul>
      </div>
    ),
    ctaHref: "#",
  },
  {
    id: "raja-ampat",
    title: "Raja Ampat",
  navLabel: "Raja",
    subtitle: "Surga biodiversitas bawah laut dunia",
    bg: "https://akcdn.detik.net.id/visual/2025/06/10/fakta-menarik-raja-ampat-foto-unsplashcomsimon-spring-1749562020339_169.png?w=1200&q=90",
    overlays: ["/overlays/leaf.png"],
    content: (
      <div className="max-w-xl space-y-4">
        <p className="text-white/90">
          Perairan sebening kristal dengan karang sehat dan ribuan spesies ikan. Menyelam di sini
          seperti masuk katalog kehidupan laut yang berdenyut warna-warni.
        </p>
        <p className="text-white/80 text-sm md:text-base">
          Pulau karst yang menjulang dari laut tenang menciptakan labirin alami menakjubkan.
        </p>
      </div>
    ),
    ctaHref: "#",
  },
  {
    id: "bromo",
    title: "Bromo",
  navLabel: "Bromo",
    subtitle: "Drama matahari terbit di samudera pasir",
    bg: "https://torch.id/cdn/shop/articles/Artikel_167_-_Preview.webp?v=1713337145&width=1100",
    content: (
      <div className="max-w-xl space-y-4">
        <p className="text-white/90">
          Siluet gunung berlapis kabut, langit berubah dari ungu ke keemasan, lalu kawah mengepul.
          Pengalaman sunrise di Bromo adalah teater alam yang tak terlupakan.
        </p>
        <p className="text-white/80 text-sm md:text-base">
          Setelah itu, jelajah lautan pasir dan tangga menuju bibir kawah beraroma sulfur.
        </p>
      </div>
    ),
    ctaHref: "#",
  },
  {
    id: "closing",
    title: "Rencanakan Perjalananmu",
  navLabel: "Akhir",
    subtitle: "Saatnya wujudkan destinasi impian",
    bg: "https://images.unsplash.com/photo-1533636721434-0e2d61030955?q=80&w=1400&auto=format&fit=crop",
    content: (
      <p className="max-w-2xl text-white/90 md:text-lg leading-relaxed">
        Mulai dari memilih musim terbaik, memesan akomodasi berkelanjutan, hingga merencanakan
        aktivitas lokal yang autentik. Jadikan tripmu bermakna bagi komunitas & alam.
      </p>
    ),
    ctaHref: "#",
  },
];

export default function App() {
  // ==== Asset Preloader (background & overlays) ====
  const [progress, setProgress] = useState(0); // 0..1
  const [ready, setReady] = useState(false);
  const preloadStarted = useRef(false);
  useEffect(() => {
    if (preloadStarted.current) return; // only once
    preloadStarted.current = true;
    const urls = Array.from(
      new Set(
        SECTIONS.flatMap(s => [s.bg, ...(s.overlays || [])].filter(Boolean) as string[])
      )
    );
    if (urls.length === 0) { setProgress(1); setReady(true); return; }
    let loaded = 0;
    const start = performance.now();
    urls.forEach(u => {
      const img = new Image();
      const done = () => {
        loaded += 1;
        setProgress(loaded / urls.length);
        if (loaded === urls.length) {
          const elapsed = performance.now() - start;
            const minDelay = 550; // ms for nicer fade
            const wait = Math.max(0, minDelay - elapsed);
            setTimeout(() => setReady(true), wait);
        }
      };
      img.onload = done; img.onerror = done; img.src = u;
    });
  }, []);

  // Konfigurasi kecepatan animasi (mudah diubah)
  const SCROLL_CONF = {
    overshootRatio: 0.08,      // semula 0.12 (lebih kecil => lebih tenang)
    overshootMin: 36,          // px (semula 48)
    overshootMax: 100,         // px (semula 140)
    phase1Duration: 0.38,      // semula 0.27
    directDuration: 0.55,      // semula 0.42
    springStiffness: 150,      // semula 210
    springDamping: 30,         // semula 28 (lebih tinggi => cepat settle tanpa bounce liar)
  } as const;
  // gunakan union | null eksplisit agar konsisten dengan prop ScrollProgress
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);
  const scrollAnimRef = useRef<AnimationPlaybackControls | null>(null);
  const isAnimatingRef = useRef(false);

  // Observe section masuk viewport untuk highlight nav (re-init setelah ready)
  useEffect(() => {
    if (!ready) return; // tunggu container render
    const rootEl = containerRef.current;
    if (!rootEl) return;
    const els = sectionRefs.current.filter(Boolean) as HTMLDivElement[];
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = els.findIndex((el) => el === e.target);
            if (idx !== -1) setActive(idx);
          }
        });
      },
      { root: rootEl, threshold: 0.5 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [ready]);

  const scrollToIndex = (idx: number, opts?: { overshoot?: boolean }) => {
    const container = containerRef.current;
    const targetEl = sectionRefs.current[idx];
    if (!container || !targetEl) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) { targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
    const start = container.scrollTop;
    const target = targetEl.offsetTop;
    if (Math.abs(target - start) < 2) return;
    const maxScroll = container.scrollHeight - container.clientHeight;
    const direction = target > start ? 1 : -1;
    const distance = Math.abs(target - start);
    const isTouchLike = window.matchMedia('(pointer:coarse)').matches;
    // Matikan overshoot di perangkat sentuh agar tidak terasa "melenting" aneh
    const enableOvershoot = opts?.overshoot !== false && !isTouchLike; // default true kecuali touch
    // Overshoot proporsional; jika disable overshoot (flick cepat), langsung ke target
    let overshoot = target;
    if (enableOvershoot) {
      const dynamic = Math.min(
        Math.max(distance * SCROLL_CONF.overshootRatio, SCROLL_CONF.overshootMin),
        SCROLL_CONF.overshootMax
      );
      overshoot = target + direction * dynamic;
    }
    if (overshoot < 0) overshoot = 0;
    if (overshoot > maxScroll) overshoot = maxScroll;
    scrollAnimRef.current?.stop();
    isAnimatingRef.current = true;
    // Matikan snap sementara supaya overshoot tidak dipotong browser
    const prevSnap = container.style.scrollSnapType;
    container.style.scrollSnapType = 'none';
    const goPhase2 = () => {
      scrollAnimRef.current = animate(overshoot, target, {
        type: 'spring',
        stiffness: enableOvershoot ? SCROLL_CONF.springStiffness : SCROLL_CONF.springStiffness + 40,
        damping: enableOvershoot ? SCROLL_CONF.springDamping : SCROLL_CONF.springDamping + 6,
        mass: 1,
        restDelta: 0.4,
        onUpdate: (v: number) => { container.scrollTop = v; },
        onComplete: () => { isAnimatingRef.current = false; container.style.scrollSnapType = prevSnap || ''; },
        onStop: () => { isAnimatingRef.current = false; container.style.scrollSnapType = prevSnap || ''; }
      });
    };
    if (overshoot !== target) {
      const phase1 = animate(start, overshoot, {
        duration: SCROLL_CONF.phase1Duration,
        ease: [0.3, 0.95, 0.55, 0.98],
        onUpdate: (v: number) => { container.scrollTop = v; }
      });
      phase1.finished.then(goPhase2).catch(() => { isAnimatingRef.current = false; container.style.scrollSnapType = prevSnap || ''; });
    } else {
      // langsung target (tanpa overshoot)
      const direct = animate(start, target, {
        duration: SCROLL_CONF.directDuration,
        ease: [0.25, 0.85, 0.35, 1],
        onUpdate: (v: number) => { container.scrollTop = v; },
        onComplete: () => { isAnimatingRef.current = false; container.style.scrollSnapType = prevSnap || ''; },
        onStop: () => { isAnimatingRef.current = false; container.style.scrollSnapType = prevSnap || ''; }
      });
      direct.finished.catch(() => { isAnimatingRef.current = false; container.style.scrollSnapType = prevSnap || ''; });
    }
  };

  // Wheel listener ringan: hanya snap bila gesture cukup besar; bounce via scrollToIndex
  useEffect(() => {
    if (!ready) return; // attach setelah siap
    const el = containerRef.current;
    if (!el) return;
    const lastRef = { current: 0 };
    const cooldown = 420;
    const onWheel = (e: WheelEvent) => {
      if (isAnimatingRef.current) { e.preventDefault(); return; }
      if (Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      const now = performance.now();
      if (now - lastRef.current < cooldown) return; // biarkan native mikro-geser di antara cooldown
      if (Math.abs(e.deltaY) < 40) return;
      e.preventDefault();
      lastRef.current = now;
      let next = active + (e.deltaY > 0 ? 1 : -1);
      if (next < 0) next = 0; else if (next >= SECTIONS.length) next = SECTIONS.length - 1;
      if (next !== active) scrollToIndex(next);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [active, ready]);

  // ===== Mobile natural snap assist (sederhana anti-glitch) =====
  useEffect(() => {
    if (!ready) return; const el = containerRef.current; if (!el) return;
    const isCoarse = window.matchMedia('(pointer:coarse)').matches; if (!isCoarse) return;
    let idleTimer: number | null = null;
    const IDLE_DELAY = 120; // ms setelah momentum berhenti
    const snapToNearest = () => {
      if (isAnimatingRef.current) return; const container = containerRef.current; if (!container) return;
      const scrollTop = container.scrollTop; let best = 0; let bestDist = Infinity;
      sectionRefs.current.forEach((sec, i) => { if (!sec) return; const d = Math.abs(sec.offsetTop - scrollTop); if (d < bestDist) { bestDist = d; best = i; } });
      const target = sectionRefs.current[best]; if (!target) return; const diff = Math.abs(target.offsetTop - scrollTop); if (diff < 14) return;
      // Gunakan native smooth agar tidak jitter (tanpa overshoot)
      container.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
    };
    const onScroll = () => { if (idleTimer) clearTimeout(idleTimer); idleTimer = window.setTimeout(snapToNearest, IDLE_DELAY); };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => { el.removeEventListener('scroll', onScroll); if (idleTimer) clearTimeout(idleTimer); };
  }, [active, ready]);

  if (!ready) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black text-white relative overflow-hidden" aria-busy="true" aria-label="Memuat aset">
        <div className="absolute inset-0 opacity-40 [mask-image:radial-gradient(circle_at_center,white,transparent_70%)] animate-pulse pointer-events-none bg-[conic-gradient(from_0deg,rgba(255,255,255,0.08),rgba(255,255,255,0)_55%,rgba(255,255,255,0.08))]" />
        <div className="relative z-10 flex flex-col items-center gap-8 px-6">
          <div className="flex items-center gap-4">
            <Logo />
            <span className="font-semibold tracking-wide text-lg">J-ViMs</span>
          </div>
          <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-white transition-[width] duration-300 ease-out" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
          <div className="text-xs font-mono tracking-wider text-white/70">{Math.round(progress * 100)}%</div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      data-scroll-root="true"
      className="h-screen w-screen overflow-y-scroll snap-y snap-mandatory scrollbar-none relative bg-black"
    >
  <Header active={active} onJump={scrollToIndex} sections={SECTIONS} brand="J-ViMs" />
      <NavDots count={SECTIONS.length} active={active} onJump={scrollToIndex} />
      {SECTIONS.map((s, i) => (
        <Section
          key={s.id}
          ref={(el) => { sectionRefs.current[i] = el; }}
          data={s}
          index={i}
        />
      ))}
      <ScrollProgress targetRef={containerRef} />
      <ArrowNav active={active} onJump={scrollToIndex} total={SECTIONS.length} />
      <CursorBullet />
    </div>
  );
}

/** ====== UI PARTS ====== */

// Tambahkan keyframes global via injection (sekali)
// (Pendekatan sederhana tanpa file CSS terpisah)
const styleId = "__shine_keyframes";
if (typeof document !== "undefined" && !document.getElementById(styleId)) {
  const el = document.createElement("style");
  el.id = styleId;
  el.textContent = `@keyframes shine {0% {opacity:0; transform:translateX(0);} 40% {opacity:0.85;} 100% {opacity:0; transform:translateX(220%);} }
@keyframes overlayZoomIn {0% {opacity:0; transform:scale(1.15);} 60% {opacity:.85;} 100% {opacity:1; transform:scale(1);} }`;
  document.head.appendChild(el);
}

// ===== Error Boundary (prevent silent blank) =====
// Using dynamic import-safe guard (React may not be global in some setups)
// If React 18 strict mode double invokes mount this is harmless.
import React from 'react';
class AppErrorBoundary extends React.Component<{children: React.ReactNode},{error?: any}> {
  constructor(p:any){super(p);this.state={error:undefined};}
  static getDerivedStateFromError(error:any){return {error};}
  componentDidCatch(error:any,info:any){console.error('App crash:',error,info);}
  render(){
    if(this.state.error){
      return <div style={{padding:'2rem',color:'#fff',background:'#111',fontFamily:'monospace'}}>
        <h2 style={{marginTop:0}}>Terjadi error</h2>
        <pre style={{whiteSpace:'pre-wrap',fontSize:'12px'}}>{String(this.state.error)}</pre>
        <button onClick={()=>location.reload()} style={{marginTop:'1rem',padding:'0.55rem 1rem',background:'#fff',color:'#000',border:0,cursor:'pointer'}}>Reload</button>
      </div>;
    }
    return this.props.children as any;
  }
}

export function RootApp(){
  return <AppErrorBoundary><App /></AppErrorBoundary>;
}
