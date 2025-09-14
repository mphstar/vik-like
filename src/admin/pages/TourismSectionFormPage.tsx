import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import ImageUpload from '../components/ImageUpload';

// Mirror of SectionData shape used on the public site
type Align = 'left' | 'right';
type SectionFormData = {
  id: string;
  title: string;
  navLabel?: string;
  subtitle?: string;
  bg?: string;
  content?: string; // text content for admin; render-decisions happen on public site
  ctaHref?: string;
  overlays?: string[];
  align?: Align;
};

export default function TourismSectionFormPage(){
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  // Placeholder initial values; in real app, fetch by id when editing
  const initial: SectionFormData = useMemo(()=> ({
    id: id || '',
    title: isEdit ? `Section ${id}` : '',
    navLabel: '',
    subtitle: '',
    bg: '',
    content: '',
    ctaHref: '',
    overlays: [],
    align: 'left',
  }), [id, isEdit]);

  const [form, setForm] = useState<SectionFormData>(initial);

  const update = (patch: Partial<SectionFormData>) => setForm(prev => ({...prev, ...patch}));
  const updateOverlay = (idx: number, value: string) => {
    const arr = [...(form.overlays || [])];
    arr[idx] = value;
    update({ overlays: arr });
  };
  const addOverlay = () => update({ overlays: [...(form.overlays || []), ''] });
  const removeOverlay = (idx: number) => update({ overlays: (form.overlays || []).filter((_,i)=> i!==idx) });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: persist via API/storage
    navigate('/admin/tourism-sections');
  };

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{isEdit ? 'Ubah' : 'Tambah'} Section Pariwisata</h2>
          <p className="text-sm text-neutral-500">Form data sesuai tipe SectionData.</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/admin/tourism-sections" className="rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800">Batal</Link>
          <button form="section-form" type="submit" className="rounded-md bg-blue-600 text-white px-3 py-1.5 text-sm hover:bg-blue-700">Simpan</button>
        </div>
      </header>

      <form id="section-form" onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Field label="ID" required>
            <input
              required
              disabled={isEdit}
              value={form.id}
              onChange={e=>update({ id: e.target.value })}
              className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
              placeholder="unique-id"
            />
          </Field>
          <Field label="Title" required>
            <input
              required
              value={form.title}
              onChange={e=>update({ title: e.target.value })}
              className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
              placeholder="Judul utama"
            />
          </Field>
          <Field label="Nav Label">
            <input
              value={form.navLabel || ''}
              onChange={e=>update({ navLabel: e.target.value })}
              className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
              placeholder="Label navigasi (opsional)"
            />
          </Field>
          <Field label="Subtitle">
            <input
              value={form.subtitle || ''}
              onChange={e=>update({ subtitle: e.target.value })}
              className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
              placeholder="Subjudul (opsional)"
            />
          </Field>
          <Field label="Background (upload gambar)">
            <ImageUpload value={form.bg} onChange={(data)=>update({ bg: data })} />
          </Field>
        </div>

        <div className="space-y-4">
          <Field label="Content (teks)">
            <textarea
              value={form.content || ''}
              onChange={e=>update({ content: e.target.value })}
              className="w-full min-h-28 rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
              placeholder="Konten/teks untuk section"
            />
          </Field>
          <Field label="CTA Href">
            <input
              value={form.ctaHref || ''}
              onChange={e=>update({ ctaHref: e.target.value })}
              className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
              placeholder="https://..."
            />
          </Field>
          <Field label="Align">
            <select
              value={form.align || 'left'}
              onChange={e=>update({ align: e.target.value as Align })}
              className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            >
              <option value="left">left</option>
              <option value="right">right</option>
            </select>
          </Field>
        </div>

        <div className="md:col-span-2">
          <Field label="Overlays (upload gambar, bisa lebih dari satu)">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {(form.overlays || []).map((url, idx)=> (
                <div key={idx} className="relative">
                  <ImageUpload value={url} onChange={(data)=>updateOverlay(idx, data || '')} variant="tile" />
                  <button type="button" onClick={()=>removeOverlay(idx)} className="absolute right-2 top-2 rounded-md bg-red-600/90 px-2 py-1 text-[11px] font-medium text-white shadow hover:bg-red-600">Hapus</button>
                </div>
              ))}
              {/* Add tile */}
              <button type="button" onClick={addOverlay} className="grid aspect-[4/3] w-full place-items-center rounded-lg border border-dashed border-neutral-300 text-sm text-neutral-500 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800">+ Tambah</button>
            </div>
          </Field>
        </div>
      </form>

      {/* Live Preview */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">Preview</h3>
        <SectionPreview data={form} />
      </div>
    </section>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }){
  return (
    <label className="block">
      <div className="mb-1 text-xs font-medium text-neutral-500">
        {label} {required ? <span className="text-red-500">*</span> : null}
      </div>
      {children}
    </label>
  );
}

function SectionPreview({ data }: { data: SectionFormData }){
  const alignRight = (data.align || 'left') === 'right';
  const hasBg = Boolean(data.bg);
  const overlays = (data.overlays || []).filter(Boolean);

  return (
    <div className="relative overflow-hidden rounded-xl border border-neutral-200/70 dark:border-neutral-800 bg-neutral-900/80">
      <div className="relative aspect-[16/9] w-full">
        {hasBg ? (
          <img src={data.bg} alt="Background" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-700 to-neutral-900" />
        )}
        {/* vignette + gradient for readability */}
        <div className="absolute inset-0 bg-[radial-gradient(transparent,rgba(0,0,0,0.5))]" />
        <div className={`absolute inset-0 ${alignRight ? 'bg-gradient-to-l' : 'bg-gradient-to-r'} from-black/50 via-black/30 to-transparent`} />

        {/* Text content */}
        <div className={`absolute inset-0 flex items-center ${alignRight ? 'justify-end text-right' : 'justify-start text-left'}`}>
          <div className={`p-5 md:p-8 ${alignRight ? 'mr-2 md:mr-6' : 'ml-2 md:ml-6'} max-w-xl`}>
            <div className="text-white/90 text-xs uppercase tracking-wide">{data.navLabel || 'NAV'}</div>
            <h3 className="mt-1 text-white text-2xl md:text-3xl font-bold">{data.title || 'Judul Section'}</h3>
            {data.subtitle ? (
              <p className="mt-1 text-white/85 text-sm">{data.subtitle}</p>
            ) : null}
            {data.content ? (
              <p className="mt-3 text-white/90 text-sm leading-relaxed max-h-24 overflow-hidden">{data.content}</p>
            ) : null}
            {data.ctaHref ? (
              <a href={data.ctaHref} target="_blank" rel="noreferrer" className="mt-4 inline-block rounded-md bg-white/90 px-3 py-1.5 text-sm font-medium text-neutral-900 shadow hover:bg-white">Kunjungi</a>
            ) : null}
          </div>
        </div>

        {/* Overlay thumbnails preview */}
        {overlays.length > 0 ? (
          <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2">
            {overlays.map((url, i) => (
              <div key={i} className="overflow-hidden rounded-md ring-1 ring-white/40 shadow-md bg-white/10 backdrop-blur-sm">
                <img src={url} alt={`overlay-${i}`} className="h-14 w-20 object-cover" />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
