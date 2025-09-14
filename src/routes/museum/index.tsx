import { useRef, useState, useLayoutEffect } from 'react'
import '@photo-sphere-viewer/core/index.css'
import { Viewer } from '@photo-sphere-viewer/core'
import { useParams } from 'react-router-dom'
import { MUSEUMS } from '../MuseumData'
import { Header } from '../../components/templates'

// Item type for explanations
type ExplanationItem = {
  title: string
  description: string
  image: string
}

const PANORAMA_URL =
  'https://raw.githubusercontent.com/jariq/KUK360/refs/heads/main/img/KUK360-Photo-Sample.jpg' // default sample
const FALLBACK_PANORAMA_URL =
  'https://raw.githubusercontent.com/jariq/KUK360/refs/heads/main/img/KUK360-Photo-Sample.jpg'

// Preload image to ensure it is reachable (CORS/404) before creating viewer
async function ensureImage(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(url)
    img.onerror = () => reject(new Error('Gagal memuat gambar: ' + url))
    img.src = url
  })
}

const MobileBottomSheet = ({
  items,
}: {
  items: ExplanationItem[]
}) => {
  const CLOSED = 56 // px visible when closed
  const [vh, setVh] = useState<number>(
    typeof window !== 'undefined'
      ? (window.visualViewport?.height ?? window.innerHeight)
      : 0
  )
  const [snap, setSnap] = useState<'closed' | 'half' | 'full'>('closed')
  const [dragTop, setDragTop] = useState<number | null>(null)
  const [dragging, setDragging] = useState(false)
  const startRef = useRef<{ y: number; top: number; eligible: boolean; inScrollable: HTMLElement | null } | null>(null)
  const velRef = useRef<Array<{ t: number; y: number }>>([])

  useLayoutEffect(() => {
    const onResize = () => {
      const h = window.visualViewport?.height ?? window.innerHeight
      setVh(h)
    }
    window.addEventListener('resize', onResize)
    window.visualViewport?.addEventListener('resize', onResize as any)
    return () => {
      window.removeEventListener('resize', onResize)
      window.visualViewport?.removeEventListener('resize', onResize as any)
    }
  }, [])

  const halfHeight = Math.round(0.7 * vh)
  const topForSnap = (s: typeof snap) => {
    const visible = s === 'closed' ? CLOSED : s === 'half' ? halfHeight : vh
    return Math.max(0, vh - visible)
  }

  const clampTop = (t: number) => Math.min(Math.max(t, 0), Math.max(0, vh - CLOSED))

  const currentTop = dragTop ?? topForSnap(snap)

  const getScrollableAncestor = (el: HTMLElement | null): HTMLElement | null => {
    let cur: HTMLElement | null = el
    while (cur) {
      if (cur.hasAttribute('data-scrollable')) return cur
      cur = cur.parentElement
    }
    return null
  }

  const onPointerDown = (e: React.PointerEvent) => {
    // Do not immediately capture; wait until movement threshold & eligibility
    const startTop = currentTop
    const target = e.target as HTMLElement | null
    const scrollable = getScrollableAncestor(target)
    startRef.current = { y: e.clientY, top: startTop, eligible: false, inScrollable: scrollable }
    velRef.current = [{ t: performance.now(), y: e.clientY }]
    // Visual feedback
    setDragging(false)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!startRef.current) return
    const s = startRef.current
    const dy = e.clientY - s.y
    const abs = Math.abs(dy)
    const now = performance.now()
    // keep velocity samples
    velRef.current.push({ t: now, y: e.clientY })
    if (velRef.current.length > 6) velRef.current.shift()

    // Decide eligibility once threshold passed
    if (!dragging) {
      if (abs < 6) return
      let eligible = true
      // If started inside scrollable content, allow drag only when at edges
      if (s.inScrollable) {
        const sc = s.inScrollable
        const atTop = sc.scrollTop <= 0
        const atBottom = sc.scrollTop + sc.clientHeight >= sc.scrollHeight - 1
        if (dy > 0 && !atTop) eligible = false // pulling down but content can scroll up
        if (dy < 0 && !atBottom) eligible = false // pulling up but content can scroll down
      }
      if (!eligible) {
        // let native scroll happen
        startRef.current = null
        return
      }
      // start dragging
      setDragging(true)
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      // Prevent text selection while dragging
      const b = document.body as HTMLBodyElement
      b.style.userSelect = 'none'
      s.eligible = true
    }

    // Active drag
    const nextTop = clampTop(s.top + dy)
    setDragTop(nextTop)
  }
  const finishDrag = (e?: React.PointerEvent) => {
    startRef.current = null
    const b = document.body as HTMLBodyElement
    b.style.userSelect = ''
    if (!dragging) return
    setDragging(false)
    if (e) try { (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId) } catch {}

    if (dragTop == null) { setDragTop(null); return }
    // Compute velocity px/ms from last samples
    const samples = velRef.current
    let velocity = 0
    if (samples.length >= 2) {
      const a = samples[0], z = samples[samples.length - 1]
      const dt = Math.max(1, z.t - a.t)
      velocity = (z.y - a.y) / dt // +down, -up
    }
    const v = velocity // px/ms
    const visible = vh - dragTop
    const ratio = vh > 0 ? visible / vh : 0
    // Velocity-aware snapping
    let next: typeof snap
    if (v < -0.6) next = 'full' // fast swipe up
    else if (v > 0.6) next = 'closed' // fast swipe down
    else if (ratio > 0.8) next = 'full'
    else if (ratio > 0.4) next = 'half'
    else next = 'closed'
    setSnap(next)
    setDragTop(null)
  }

  const openHalf = () => setSnap('half')
  const close = () => setSnap('closed')

  const isOpen = snap !== 'closed'

  return (
    <div
      className={[
        'fixed inset-x-0 bottom-0 z-[80] transition-[top] ease-out select-none',
        dragging ? 'duration-0 cursor-grabbing' : 'duration-300 cursor-grab',
      ].join(' ')}
      style={{ top: `${currentTop}px`, touchAction: 'none' as any }}
      aria-hidden={!isOpen}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
    >
      <div className="absolute inset-0 rounded-t-2xl bg-white/90 backdrop-blur dark:bg-neutral-900/90 shadow-2xl border-t border-neutral-200/60 dark:border-neutral-800 text-neutral-700 dark:text-neutral-200">
        {/* Handle & actions */}
        <div className="flex items-center gap-2 px-4 pt-2">
          <div className="mx-auto h-1.5 w-12 rounded-full bg-neutral-400/70" />
        </div>
        <div className="flex items-center justify-between px-4 py-2">
          <button
            onClick={() => (isOpen ? close() : openHalf())}
            className="text-sm font-medium text-neutral-700 dark:text-neutral-200"
            aria-expanded={isOpen}
          >
            {isOpen ? 'Tutup' : 'Penjelasan'}
          </button>
          {/* {isOpen && (
            <button
              onClick={toFull}
              className="rounded-md border border-neutral-300 px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-50 active:scale-[.98] dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              Layar Penuh
            </button>
          )} */}
        </div>

        {isOpen && (
          <div className="h-[calc(100%-56px)] overflow-y-auto px-4 pb-6" data-scrollable>
            <h3 className="mb-3 text-base font-semibold text-neutral-900 dark:text-neutral-100">Penjelasan</h3>
            <ul className="space-y-3">
              {items.map((it, i) => (
                <li key={i} className="flex gap-3 rounded-xl border border-neutral-200/60 bg-white/80 p-3 backdrop-blur-sm dark:border-neutral-800/60 dark:bg-neutral-900/70">
                  <img
                    src={it.image}
                    alt={it.title}
                    className="h-16 w-16 flex-none rounded-lg object-cover ring-1 ring-inset ring-neutral-200/60 dark:ring-neutral-800/60"
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">{it.title}</h4>
                    <p className="mt-1 text-xs leading-relaxed text-neutral-600 dark:text-neutral-300">
                      {it.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Floating button when closed */}
      {!isOpen && (
        <div className="pointer-events-none absolute -top-16 left-0 right-0 flex justify-center">
          <button
            onClick={openHalf}
            className="pointer-events-auto rounded-full bg-black/75 px-4 py-2 text-xs font-medium text-white shadow-lg backdrop-blur hover:bg-black/85"
          >
            Lihat Penjelasan
          </button>
        </div>
      )}
    </div>
  )
}

const Panorama = () => {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const viewerRef = useRef<Viewer | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useLayoutEffect(() => {
    const el = containerRef.current
    if (!el) return

    // Inject CSS to move PSV navbar to right side (scoped to this container)
    const STYLE_ID = 'psv-right-navbar-css'
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement('style')
      style.id = STYLE_ID
      style.textContent = `
      .psv-right-navbar .psv-navbar{
        position:absolute !important;
        top:50% !important; left:auto !important; right:10px !important; bottom:auto !important;
        transform:translateY(-50%);
        background:transparent !important;
        box-shadow:none !important;
        padding:0 !important;
        display:flex; flex-direction:column; gap:8px; align-items:stretch;
      }
      .psv-right-navbar .psv-navbar > *{ display:flex; flex-direction:column; gap:8px; }
      .psv-right-navbar .psv-navbar .psv-button{ margin:0 !important; }
      .psv-right-navbar .psv-navbar .psv-zoom-range{ width:140px !important; height:auto !important; transform:rotate(90deg); transform-origin:right center; }
      /* Hide controls on desktop screens */
      @media (min-width: 768px){
        .psv-right-navbar .psv-navbar{ display:none !important; }
      }
      `
      document.head.appendChild(style)
    }

    let initialized = false
    let disposed = false
  // Prefer route museum panorama if provided
    const idMatch = window.location.pathname.match(/\/museum\/(.+)$/)
    const museumFromId = idMatch ? MUSEUMS.find(m => m.id === decodeURIComponent(idMatch[1])) : undefined
    let currentUrl = museumFromId?.panorama || PANORAMA_URL
    let timeoutId: number | null = null

    const clearTimer = () => {
      if (timeoutId !== null) {
        clearTimeout(timeoutId)
        timeoutId = null
      }
    }

  const initWithUrl = (url: string) => {
      if (disposed) return
      currentUrl = url
      try {
        const viewer = new Viewer({
          container: el,
          panorama: url,
          touchmoveTwoFingers: true,
      navbar: ['zoom', 'fullscreen'],
          defaultYaw: 0,
          defaultPitch: 0,
        })

        const onReady = () => {
          setReady(true)
          clearTimer()
        }
        const onLoadFail = (e: any) => {
          const msg = typeof e === 'string' ? e : e?.message || 'Gagal memuat panorama.'
          // Try fallback once if not already using fallback
          if (currentUrl !== FALLBACK_PANORAMA_URL) {
            initFallbackWithNotice()
          } else {
            setError(msg)
          }
        }

        viewer.addEventListener('panorama-loaded', onReady)
        // @ts-expect-error event name provided by library
        viewer.addEventListener('panorama-load-failed', onLoadFail)
        // @ts-expect-error generic error safety
        viewer.addEventListener('error', onLoadFail)

        // Timeout: if not ready within 7s, attempt fallback
        clearTimer()
        timeoutId = window.setTimeout(() => {
          if (!ready && currentUrl !== FALLBACK_PANORAMA_URL) {
            initFallbackWithNotice()
          }
        }, 7000)

        viewerRef.current = viewer
        initialized = true
      } catch (e: any) {
        setError(e?.message || 'Gagal memuat viewer.')
      }
    }

    const initFallbackWithNotice = () => {
      // destroy current viewer before switching
      viewerRef.current?.destroy()
      viewerRef.current = null
      setError('Gambar utama gagal dimuat. Menampilkan contoh panorama.')
      initWithUrl(FALLBACK_PANORAMA_URL)
    }

    const tryInit = async () => {
      if (initialized || viewerRef.current) return
      const rect = el.getBoundingClientRect()
      if (rect.width <= 0 || rect.height <= 0) return

      // Preload and fallback if needed; preloading may still succeed but WebGL texture can fail due to CORS
      try {
        const goodUrl = await ensureImage(currentUrl)
        initWithUrl(goodUrl)
      } catch (e) {
        try {
          const fb = await ensureImage(FALLBACK_PANORAMA_URL)
          initWithUrl(fb)
          setError('Gambar utama gagal dimuat. Menampilkan contoh panorama.')
        } catch {
          setError('Semua sumber panorama gagal dimuat. Periksa URL/CORS dan koneksi internet Anda.')
        }
      }
    }

    const ro = new ResizeObserver(() => void tryInit())
    ro.observe(el)
    void tryInit()

    return () => {
      disposed = true
      clearTimer()
      ro.disconnect()
      viewerRef.current?.destroy()
      viewerRef.current = null
    }
  }, [ready])

  return (
    <div className="relative h-full w-full">
  <div ref={containerRef} className="h-full w-full psv-right-navbar" />
      {!ready && !error && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-sm text-neutral-500">
          Memuat foto 360°...
        </div>
      )}
      {error && !ready && (
        <div className="absolute inset-0 grid place-items-center bg-neutral-50/80 p-4 text-center text-sm text-red-600 dark:bg-neutral-900/70 dark:text-red-400">
          {error}
        </div>
      )}
      {error && ready && (
        <div className="pointer-events-none absolute right-2 top-2 rounded bg-red-600/80 px-2 py-1 text-[11px] font-medium text-white">
          {error}
        </div>
      )}
    </div>
  )
}

const MuseumIndex = () => {
  const { id } = useParams()
  const museum = MUSEUMS.find(m => m.id === id)
  const items: ExplanationItem[] = museum?.explanations || []

  // Lock document scroll while this page is mounted
  useLayoutEffect(() => {
    const html = document.documentElement
    const body = document.body
    const prevHtmlOverflow = html.style.overflow
    const prevHtmlHeight = html.style.height
    const prevBodyOverflow = body.style.overflow
    const prevBodyHeight = body.style.height
    html.style.overflow = 'hidden'
    html.style.height = '100%'
    body.style.overflow = 'hidden'
    body.style.height = '100%'
    return () => {
      html.style.overflow = prevHtmlOverflow
      html.style.height = prevHtmlHeight
      body.style.overflow = prevBodyOverflow
      body.style.height = prevBodyHeight
    }
  }, [])

  return (
    <div className="fixed inset-0 w-full overflow-hidden md:grid md:grid-cols-5">
      {/* Header overlay */}
      <div className="absolute inset-x-0 top-0 z-[70] pointer-events-none">
        <div className="pointer-events-auto">
          <Header
            active={0}
            onJump={() => {}}
            sections={[] as any}
            brand={museum?.name || 'Museum'}
            backHref="/museums"
          />
        </div>
      </div>
      {/* Viewer 60% on desktop */}
      <div className="h-full md:col-span-3">
        <Panorama />
      </div>

      {/* Sidebar explanations on desktop (40%) */}
      <aside className="hidden h-full z-[99] overflow-y-auto border-l border-neutral-200/60 dark:border-neutral-800/60 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 p-6 md:col-span-2 md:block">
        <h2 className="mb-4 text-xl font-semibold text-neutral-900 dark:text-neutral-100">Penjelasan</h2>
        <ul className="space-y-4">
          {items.map((it, i) => (
            <li key={i} className="flex gap-3 rounded-xl border border-neutral-200/60 bg-white/80 p-3 backdrop-blur-sm dark:border-neutral-800/60 dark:bg-neutral-900/70">
              <img
                src={it.image}
                alt={it.title}
                className="h-16 w-16 flex-none rounded-lg object-cover ring-1 ring-inset ring-neutral-200/60 dark:ring-neutral-800/60"
                loading="lazy"
              />
              <div className="min-w-0">
                <h4 className="truncate text-sm font-semibold text-neutral-900 dark:text-neutral-100">{it.title}</h4>
                <p className="mt-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-300">
                  {it.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </aside>

      {/* Mobile bottom sheet */}
      <div className="md:hidden">
        <MobileBottomSheet items={items} />
      </div>
    </div>
  )
}

export default MuseumIndex