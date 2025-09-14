import { useParams } from 'react-router-dom';
import ImageUpload from '../components/ImageUpload';
import { useMemo, useState } from 'react';

type Explanation = { title: string; description: string; image?: string };

export default function MuseumDetailAdminPage(){
  const { id } = useParams();
  const initial = useMemo(()=> ({
    name: `Museum ${id}`,
    panorama: '' as string | undefined,
    explanations: [] as Explanation[],
  }), [id]);
  const [name, setName] = useState(initial.name);
  const [panorama, setPanorama] = useState<string | undefined>(initial.panorama);
  const [explanations, setExplanations] = useState<Explanation[]>(initial.explanations);

  const addItem = () => setExplanations(prev => [...prev, { title: '', description: '', image: undefined }]);
  const removeItem = (idx: number) => setExplanations(prev => prev.filter((_, i) => i !== idx));
  const updateItem = (idx: number, patch: Partial<Explanation>) =>
    setExplanations(prev => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Detail Museum</h2>
          <p className="text-sm text-neutral-500">Kelola konten museum: data, panorama, dan penjelasan.</p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800">Simpan</button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Field label="Nama">
            <input value={name} onChange={e=>setName(e.target.value)} className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm" placeholder="Nama museum" />
          </Field>
          <Field label="Panorama (upload)">
            <ImageUpload value={panorama} onChange={setPanorama} />
          </Field>
          <Field label="Explanations">
            <div className="grid grid-cols-1 gap-4">
              {explanations.map((it, idx) => (
                <div key={idx} className="rounded-lg border border-neutral-200/60 dark:border-neutral-800 p-3">
                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                    <div className="sm:col-span-2">
                      <ImageUpload value={it.image} onChange={(img)=>updateItem(idx, { image: img })} variant="tile" />
                    </div>
                    <div className="sm:col-span-3 space-y-2">
                      <input value={it.title} onChange={e=>updateItem(idx, { title: e.target.value })} className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm" placeholder="Judul" />
                      <textarea value={it.description} onChange={e=>updateItem(idx, { description: e.target.value })} className="w-full min-h-20 rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm" placeholder="Deskripsi" />
                      <div className="flex justify-end">
                        <button type="button" onClick={()=>removeItem(idx)} className="rounded-md border border-red-300 text-red-600 px-2 py-1.5 text-xs hover:bg-red-50 dark:border-red-700/60 dark:hover:bg-red-900/30">Hapus</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <button type="button" onClick={addItem} className="rounded-md border border-dashed border-neutral-300 dark:border-neutral-700 px-3 py-2 text-sm text-neutral-500 hover:bg-neutral-50 dark:hover:bg-neutral-800">+ Tambah Item</button>
            </div>
          </Field>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">Preview</h3>
          <MuseumPreview name={name} panorama={panorama} explanations={explanations} />
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }){
  return (
    <label className="block">
      <div className="mb-1 text-xs font-medium text-neutral-500">{label}</div>
      {children}
    </label>
  );
}

function MuseumPreview({ name, panorama, explanations }: { name: string; panorama?: string; explanations: Explanation[] }){
  const hasPano = Boolean(panorama);
  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200/70 dark:border-neutral-800">
      <div className="relative aspect-[16/9] bg-neutral-900">
        {hasPano ? (
          <img src={panorama} alt="Panorama" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-sm text-neutral-400">Panorama preview</div>
        )}
        <div className="absolute inset-x-0 top-0 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent p-3">
          <div className="text-white text-sm font-semibold">{name || 'Museum'}</div>
          <div className="rounded bg-white/20 px-2 py-0.5 text-[11px] text-white">Preview</div>
        </div>
      </div>
      {explanations.length > 0 && (
        <div className="divide-y divide-neutral-200/60 dark:divide-neutral-800 bg-white dark:bg-neutral-900">
          {explanations.map((it, i) => (
            <div key={i} className="flex gap-3 p-3">
              <div className="h-14 w-14 overflow-hidden rounded-md bg-neutral-100 dark:bg-neutral-800 ring-1 ring-inset ring-neutral-200/60 dark:ring-neutral-800/60">
                {it.image ? (
                  <img src={it.image} alt={it.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-[10px] text-neutral-400">img</div>
                )}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">{it.title || 'Judul'}</div>
                <div className="text-xs text-neutral-600 dark:text-neutral-300 line-clamp-2">{it.description || 'Deskripsi singkat...'}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
