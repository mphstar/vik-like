import { Link, useNavigate, useParams } from 'react-router-dom';
import { useMemo, useState } from 'react';
import ImageUpload from '../components/ImageUpload';

type Align = 'left' | 'right';

export default function MuseumFormPage(){
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const initial = useMemo(() => ({
    id: (id || ''),
    title: isEdit ? `Museum ${id}` : '',
    navLabel: '',
    subtitle: '',
    bg: '' as string | undefined,
    content: '',
    ctaHref: '',
    align: 'left' as Align,
  }), [id, isEdit]);

  const [form, setForm] = useState(initial);
  const update = (patch: Partial<typeof initial>) => setForm(prev => ({ ...prev, ...patch }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: persist data via API/storage
    navigate('/admin/museums');
  };

  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{isEdit ? 'Ubah' : 'Tambah'} Museum</h2>
          <p className="text-sm text-neutral-500">Isi data museum dan lihat preview secara langsung.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/museums" className="rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800">Batal</Link>
          <button form="museum-form" type="submit" className="rounded-md bg-blue-600 text-white px-3 py-1.5 text-sm hover:bg-blue-700">Simpan</button>
        </div>
      </header>

      <form id="museum-form" onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          <Field label="Nama" required>
            <input
              required
              value={form.title}
              onChange={e=>update({ title: e.target.value })}
              className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
              placeholder="Nama museum"
            />
          </Field>
          <Field label="Nav Label">
            <input
              value={form.navLabel}
              onChange={e=>update({ navLabel: e.target.value })}
              className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
              placeholder="Label navigasi (opsional)"
            />
          </Field>
          <Field label="Subtitle">
            <input
              value={form.subtitle}
              onChange={e=>update({ subtitle: e.target.value })}
              className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
              placeholder="Lokasi/teks singkat"
            />
          </Field>
          <Field label="Background (upload)">
            <ImageUpload value={form.bg} onChange={(img)=>update({ bg: img })} />
          </Field>
          <Field label="Content (teks)">
            <textarea
              value={form.content}
              onChange={e=>update({ content: e.target.value })}
              className="w-full min-h-28 rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
              placeholder="Deskripsi museum untuk halaman daftar"
            />
          </Field>
          <Field label="CTA Href">
            <input
              value={form.ctaHref}
              onChange={e=>update({ ctaHref: e.target.value })}
              className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
              placeholder={`/museum/${form.id || 'id'}`}
            />
          </Field>
          <Field label="Align">
            <select
              value={form.align}
              onChange={e=>update({ align: e.target.value as Align })}
              className="w-full rounded-md border border-neutral-300 dark:border-neutral-700 bg-transparent px-3 py-2 text-sm"
            >
              <option value="left">left</option>
              <option value="right">right</option>
            </select>
          </Field>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">Preview</h3>
          <SectionPreview
            title={form.title}
            navLabel={form.navLabel}
            subtitle={form.subtitle}
            bg={form.bg}
            content={form.content}
            ctaHref={form.ctaHref || (form.id ? `/museum/${form.id}` : '')}
            align={form.align}
          />
        </div>
      </form>
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

function SectionPreview({ title, navLabel, subtitle, bg, content, ctaHref, align }: { title: string; navLabel?: string; subtitle?: string; bg?: string; content?: string; ctaHref?: string; align: Align }){
  const hasBg = Boolean(bg);
  const alignRight = (align || 'left') === 'right';
  return (
    <div className="relative overflow-hidden rounded-xl border border-neutral-200/70 dark:border-neutral-800 bg-neutral-900/80">
      <div className="relative aspect-[16/9] w-full">
        {hasBg ? (
          <img src={bg} alt="Background" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-700 to-neutral-900" />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(transparent,rgba(0,0,0,0.5))]" />
        <div className={`absolute inset-0 ${alignRight ? 'bg-gradient-to-l' : 'bg-gradient-to-r'} from-black/50 via-black/30 to-transparent`} />
        <div className={`absolute inset-0 flex items-center ${alignRight ? 'justify-end text-right' : 'justify-start text-left'}`}>
          <div className={`p-5 md:p-8 ${alignRight ? 'mr-2 md:mr-6' : 'ml-2 md:ml-6'} max-w-xl`}>
            <div className="text-white/90 text-xs uppercase tracking-wide">{navLabel || 'NAV'}</div>
            <h3 className="mt-1 text-white text-2xl md:text-3xl font-bold">{title || 'Judul Museum'}</h3>
            {subtitle ? (<p className="mt-1 text-white/85 text-sm">{subtitle}</p>) : null}
            {content ? (<p className="mt-3 text-white/90 text-sm leading-relaxed max-h-24 overflow-hidden">{content}</p>) : null}
            {ctaHref ? (
              <a href={ctaHref} target="_blank" rel="noreferrer" className="mt-4 inline-block rounded-md bg-white/90 px-3 py-1.5 text-sm font-medium text-neutral-900 shadow hover:bg-white">Kunjungi</a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
