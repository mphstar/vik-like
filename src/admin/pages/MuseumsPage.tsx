import { Link } from 'react-router-dom';

export default function MuseumsAdminPage(){
  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Museums</h2>
          <p className="text-sm text-neutral-500">Kelola daftar museum.</p>
        </div>
  <Link to="/admin/museums/new" className="rounded-md bg-blue-600 text-white px-3 py-2 text-sm hover:bg-blue-700">Tambah Museum</Link>
      </header>
      <ul className="divide-y divide-neutral-200/60 dark:divide-neutral-800 rounded-lg border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        {[{id:'museum-a', name:'Museum A'},{id:'museum-b', name:'Museum B'}].map((m)=> (
          <li key={m.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="font-medium">{m.name}</div>
              <div className="text-xs text-neutral-500">{m.id}</div>
            </div>
            <div className="flex gap-2">
              <a href={`/museum/${encodeURIComponent(m.id)}`} target="_blank" rel="noreferrer" className="rounded-md border border-green-300 text-green-700 px-2 py-1.5 text-xs hover:bg-green-50 dark:border-green-700/60 dark:text-green-300 dark:hover:bg-green-900/30">Preview</a>
              <Link to={`/admin/museums/${m.id}`} className="rounded-md border border-neutral-300 dark:border-neutral-700 px-2 py-1.5 text-xs hover:bg-neutral-50 dark:hover:bg-neutral-800">Detail</Link>
              <Link to={`/admin/museums/${m.id}/edit`} className="rounded-md border border-neutral-300 dark:border-neutral-700 px-2 py-1.5 text-xs hover:bg-neutral-50 dark:hover:bg-neutral-800">Ubah</Link>
              <button className="rounded-md border border-red-300 text-red-600 px-2 py-1.5 text-xs hover:bg-red-50 dark:border-red-700/60 dark:hover:bg-red-900/30">Hapus</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
