// PsvWithMarkers.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';

// CSS wajib
import '@photo-sphere-viewer/core/index.css';
import '@photo-sphere-viewer/markers-plugin/index.css';

import { Viewer } from '@photo-sphere-viewer/core';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';

const PRIMARY_URL = 'https://raw.githubusercontent.com/jariq/KUK360/refs/heads/main/img/KUK360-Photo-Sample.jpg';
const FALLBACK_URL = 'https://photo-sphere-viewer-data.netlify.app/assets/sphere.jpg';

function preload(url: string): Promise<string> {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => res(url);
    img.onerror = () => rej(new Error('fail load ' + url));
    img.src = url;
  });
}

type Explanation = { title: string; description: string; image: string }
interface PsvWithMarkersProps {
  panoramaUrl?: string
  explanations: Explanation[]
  museumName?: string
}

const PsvWithMarkers: React.FC<PsvWithMarkersProps> = ({ panoramaUrl, explanations, museumName }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const closeDialog = useCallback(() => setActiveIdx(null), []);
  const openDialog = useCallback((idx: number) => setActiveIdx(idx), []);
  const nextDialog = useCallback(() => {
    setActiveIdx(prev => {
      if (prev == null) return prev;
      return (prev + 1) % explanations.length;
    });
  }, [explanations.length]);
  const prevDialog = useCallback(() => {
    setActiveIdx(prev => {
      if (prev == null) return prev;
      return (prev - 1 + explanations.length) % explanations.length;
    });
  }, [explanations.length]);

  useEffect(() => {
    if (!containerRef.current) return;
    let canceled = false;

    const init = async () => {
      setLoading(true);
      setError(null);
      let urlToUse = panoramaUrl || PRIMARY_URL;
      try {
        urlToUse = await preload(urlToUse);
      } catch {
        try {
          urlToUse = await preload(FALLBACK_URL);
          setError('Gambar utama gagal dimuat, memakai fallback.');
        } catch {
          setError('Semua sumber panorama gagal dimuat.');
          setLoading(false);
          return;
        }
      }
      if (canceled || !containerRef.current) return;

      // generate markers from explanations list: spread yaw evenly (-PI .. +PI)
      const expMarkers = explanations.map((ex, i) => {
        const yaw = -Math.PI + (i + 0.5) * (2 * Math.PI / Math.max(1, explanations.length));
        const pitch = 0; // bisa diatur nanti per data
        return {
          id: 'exp-' + i,
          position: { yaw, pitch },
          html: `<div class="exp-marker-dot"></div>`,
          anchor: 'bottom center' as const,
          tooltip: ex.title,
          // remove content so built-in panel tidak muncul
        };
      });

      const viewer = new Viewer({
        container: containerRef.current,
        panorama: urlToUse,
        // caption: museumName || 'Panorama Museum',
        touchmoveTwoFingers: true,
        mousewheelCtrlKey: true,
        

        plugins: [
          [MarkersPlugin, {
            markers: expMarkers,
          }],
        ],
      });
      viewerRef.current = viewer;
      const markersPlugin = viewer.getPlugin<MarkersPlugin>(MarkersPlugin);

      // @ts-ignore plugin emits (e, marker) but typing expects single argument; adapt
      markersPlugin.addEventListener('select-marker', (e: any, marker: any) => {
        const mk = marker || e?.marker;
        if (!mk || !mk.id || !mk.id.startsWith('exp-')) return;
        const idx = parseInt(mk.id.split('-')[1], 10);
        if (!isNaN(idx)) openDialog(idx);
      });

      viewer.addEventListener('panorama-loaded', () => {
        setLoading(false);
        if (audioRef.current) audioRef.current.volume = 0.25;
      });
      // @ts-ignore library internal event not exposed in types
      viewer.addEventListener('panorama-load-failed', () => { setLoading(false); setError(prev => prev || 'Panorama gagal dimuat.'); });

      if (canceled) viewer.destroy();

      return () => {
        // no-op cleanup tambahan
      };
    };
    init();

    return () => {
      canceled = true;
      viewerRef.current?.destroy();
      viewerRef.current = null;
    };
  }, [explanations.length, museumName, openDialog]);

  // Background music while loading panorama
  useEffect(() => {
    if (!loading) return;
    if (audioRef.current) return;
    const el = new Audio('/ambient.mp3'); // taruh file asli di public/ambient.mp3
    el.loop = true;
    el.volume = 0.4;
    audioRef.current = el;
    if (soundOn) {
      el.play().catch(() => {
        const resume = () => {
          el.play().catch(() => {});
          window.removeEventListener('click', resume);
          window.removeEventListener('touchstart', resume);
        };
        window.addEventListener('click', resume, { once: true });
        window.addEventListener('touchstart', resume, { once: true });
      });
    }
    return () => {
      el.pause();
      audioRef.current = null;
    };
  }, [loading, soundOn]);

  const toggleSound = () => {
    setSoundOn(prev => {
      const next = !prev;
      if (audioRef.current) {
        audioRef.current.muted = !next;
        if (next && audioRef.current.paused) audioRef.current.play().catch(() => {});
      }
      return next;
    });
  };

  // Keyboard navigation
  useEffect(() => {
    if (activeIdx == null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDialog();
      else if (e.key === 'ArrowRight') nextDialog();
      else if (e.key === 'ArrowLeft') prevDialog();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeIdx, closeDialog, nextDialog, prevDialog]);

  return (
    <div style={{ width: '100%', height: '100%', minHeight: 480, position: 'relative' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      {loading && (
        <div className="exp-loading-overlay">
          <div className="exp-loading-ring" />
          <div className="exp-loading-text">Memuat panorama...</div>
        </div>
      )}
      {error && (
        <div style={{ position: 'absolute', left: 8, top: 8, background: 'rgba(220,38,38,0.9)', color: '#fff', padding: '4px 8px', borderRadius: 6, fontSize: 12, maxWidth: 240, lineHeight: 1.3 }}>{error}</div>
      )}
      <div ref={contentRef} style={{ display: 'none' }} />
      <button
        onClick={toggleSound}
        className="exp-sound-toggle"
        aria-label={soundOn ? 'Matikan suara' : 'Nyalakan suara'}
      >{soundOn ? '🔊' : '🔇'}</button>

      {activeIdx != null && explanations[activeIdx] && (
        <div className="exp-dialog-backdrop" onClick={closeDialog}>
          <div className="exp-dialog" onClick={e => e.stopPropagation()}>
            <button className="exp-dialog_close" onClick={closeDialog} aria-label="Tutup">×</button>
            <div className="exp-dialog_media">
              <img src={explanations[activeIdx].image} alt={explanations[activeIdx].title} />
            </div>
            <div className="exp-dialog_body">
              <h2>{explanations[activeIdx].title}</h2>
              <p>{explanations[activeIdx].description}</p>
            </div>
            <div className="exp-dialog_nav">
              <button onClick={prevDialog} aria-label="Sebelumnya">◀</button>
              <div className="exp-dialog_index">{activeIdx + 1}/{explanations.length}</div>
              <button onClick={nextDialog} aria-label="Berikutnya">▶</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PsvWithMarkers;
