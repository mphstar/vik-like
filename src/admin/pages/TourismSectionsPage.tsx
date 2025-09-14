import { Link } from 'react-router-dom';

export default function TourismSectionsPage(){
  return (
    <section className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Pariwisata Sections</h2>
          <p className="text-sm text-neutral-500">Kelola section di halaman pariwisata.</p>
        </div>
  <Link to="/admin/tourism-sections/new" className="rounded-md bg-blue-600 text-white px-3 py-2 text-sm hover:bg-blue-700">Tambah Section</Link>
      </header>
      <ul className="divide-y divide-neutral-200/60 dark:divide-neutral-800 rounded-lg border border-neutral-200/60 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        {[1,2,3].map((id)=> (
          <li key={id} className="flex items-center justify-between px-4 py-3">
            <div>
              <div className="font-medium">Section {id}</div>
              <div className="text-xs text-neutral-500">Judul contoh dan ringkasan singkat…</div>
            </div>
            <div className="flex gap-2">
              <Link to={`/admin/tourism-sections/${id}`} className="rounded-md border border-neutral-300 dark:border-neutral-700 px-2 py-1.5 text-xs hover:bg-neutral-50 dark:hover:bg-neutral-800">Ubah</Link>
              <button className="rounded-md border border-red-300 text-red-600 px-2 py-1.5 text-xs hover:bg-red-50 dark:border-red-700/60 dark:hover:bg-red-900/30">Hapus</button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
