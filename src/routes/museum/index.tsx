import { useRef, useState, useLayoutEffect } from 'react'
import '@photo-sphere-viewer/core/index.css'
import { Viewer } from '@photo-sphere-viewer/core'

// Item type for explanations
type ExplanationItem = {
  title: string
  description: string
  image: string
}

const PANORAMA_URL =
  'https://raw.githubusercontent.com/jariq/KUK360/refs/heads/main/img/KUK360-Photo-Sample.jpg' // sample equirectangular image
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
  const startRef = useRef<{ y: number; top: number } | null>(null)

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

  const onPointerDown = (e: React.PointerEvent) => {
    setDragging(true)
    const startTop = currentTop
    startRef.current = { y: e.clientY, top: startTop }
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || !startRef.current) return
    const dy = e.clientY - startRef.current.y
    const nextTop = clampTop(startRef.current.top + dy)
    setDragTop(nextTop)
  }
  const finishDrag = () => {
    if (!dragging) return
    setDragging(false)
    if (dragTop == null) return setDragTop(null)
    const visible = vh - dragTop
    const ratio = vh > 0 ? visible / vh : 0
    let next: typeof snap
    if (ratio > 0.85) next = 'full'
    else if (ratio > 0.35) next = 'half'
    else next = 'closed'
    setSnap(next)
    setDragTop(null)
  }

  const openHalf = () => setSnap('half')
  const close = () => setSnap('closed')
  const toFull = () => setSnap('full')

  const isOpen = snap !== 'closed'

  return (
    <div
      className={[
        'fixed inset-x-0 bottom-0 z-40 transition-[top] ease-out',
        dragging ? 'duration-0' : 'duration-300',
      ].join(' ')}
      style={{ top: `${currentTop}px` }}
      aria-hidden={!isOpen}
    >
      <div className="absolute inset-0 rounded-t-2xl bg-white/90 backdrop-blur dark:bg-neutral-900/90 shadow-2xl border-t border-neutral-200/60 dark:border-neutral-800 text-neutral-700 dark:text-neutral-200">
        {/* Handle & actions */}
        <div
          className="flex items-center gap-2 px-4 pt-2"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={finishDrag}
          onPointerCancel={finishDrag}
        >
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
          {isOpen && (
            <button
              onClick={toFull}
              className="rounded-md border border-neutral-300 px-2 py-1 text-xs text-neutral-700 hover:bg-neutral-50 active:scale-[.98] dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              Layar Penuh
            </button>
          )}
        </div>

        {isOpen && (
          <div className="h-[calc(100%-56px)] overflow-y-auto px-4 pb-6">
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

    let initialized = false
    let disposed = false
    let currentUrl = PANORAMA_URL
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
          navbar: ['zoom', 'move', 'fullscreen'],
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
        const goodUrl = await ensureImage(PANORAMA_URL)
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
      <div ref={containerRef} className="h-full w-full" />
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
  const items: ExplanationItem[] = [
    {
      title: 'Gerbang Utama',
      description: 'Area pintu masuk museum dengan arsitektur kolonial yang khas. Geser untuk melihat detail ornamen.',
      image: 'https://placehold.co/128x128/png?text=1',
    },
    {
      title: 'Ruang Pamer A',
      description: 'Koleksi artefak abad ke-19. Perhatikan label informasi di dinding sebelah barat.',
      image: 'https://placehold.co/128x128/png?text=2',
    },
    {
      title: 'Patio Tengah',
      description: 'Halaman terbuka sebagai titik istirahat. Tersedia bangku dan pencahayaan alami.',
      image: 'https://placehold.co/128x128/png?text=3',
    },
  ]

  return (
    <div className="h-[100dvh] w-full md:grid md:grid-cols-5">
      {/* Viewer 60% on desktop */}
      <div className="h-[100dvh] md:col-span-3">
        <Panorama />
      </div>

      {/* Sidebar explanations on desktop (40%) */}
      <aside className="hidden h-[100dvh] overflow-y-auto border-l border-neutral-200/60 dark:border-neutral-800/60 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-200 p-6 md:col-span-2 md:block">
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