import { NavLink, Outlet } from 'react-router-dom';
import { Logo } from '../../components/atoms/Logo';

export default function AdminLayout() {
  return (
    <div className="fixed inset-0 grid grid-cols-[260px_1fr] bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-100">
      <aside className="relative border-r border-neutral-200/60 dark:border-neutral-800/60 bg-gradient-to-b from-neutral-950 to-neutral-900 text-white">
        {/* Brand */}
        <div className="px-4 py-5 flex items-center gap-3">
          <Logo />
          <div>
            <div className="text-sm font-semibold tracking-wide">J-ViMS</div>
            <div className="text-[11px] text-white/60">Admin</div>
          </div>
        </div>
        <div className="mx-4 mb-3 border-t border-white/10" />
        {/* Nav */}
        <nav className="px-2 space-y-1.5 text-sm">
          <AdminLink to="/admin/templates" label="Templates" />
          <AdminLink to="/admin/tourism-sections" label="Pariwisata Sections" />
          <AdminLink to="/admin/museums" label="Museums" />
        </nav>
        {/* Glow accent */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-cyan-500/20 to-transparent blur-2xl" />
      </aside>
      <main className="overflow-y-auto">
        <div className="border-b border-neutral-200/60 dark:border-neutral-800/60 bg-white/70 dark:bg-neutral-950/40 backdrop-blur px-6 py-3">
          <h1 className="text-base font-semibold">Admin Console</h1>
        </div>
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function AdminLink({ to, label }: { to: string; label: string }){
  return (
    <NavLink
      to={to}
      className={({ isActive }) => [
        'group relative block rounded-lg px-3 py-2 transition',
        isActive
          ? 'bg-white/10 text-white'
          : 'text-white/80 hover:bg-white/5 hover:text-white',
      ].join(' ')}
      end
    >
      {({ isActive }) => (
        <>
          <span className="relative z-10">{label}</span>
          {isActive && (
            <span className="absolute inset-y-1 left-0 w-1 rounded-r bg-cyan-400" />
          )}
        </>
      )}
    </NavLink>
  );
}
