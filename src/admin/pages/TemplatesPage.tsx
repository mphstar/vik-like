export default function TemplatesPage(){
  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-lg font-semibold">Templates</h2>
        <p className="text-sm text-neutral-500">Pilih template aktif untuk halaman utama.</p>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1,2].map((id)=> (
          <div key={id} className="rounded-lg border border-neutral-200/60 dark:border-neutral-800 p-4 bg-white dark:bg-neutral-900">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Template {id}</h3>
              <button className="rounded-md border border-neutral-300 dark:border-neutral-700 px-3 py-1.5 text-sm hover:bg-neutral-50 dark:hover:bg-neutral-800">Jadikan aktif</button>
            </div>
            <div className="mt-3 h-24 rounded-md bg-neutral-100 dark:bg-neutral-800" />
          </div>
        ))}
      </div>
    </section>
  );
}
