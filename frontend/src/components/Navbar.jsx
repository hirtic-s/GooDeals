import { Search, X, Bell, BarChart2 } from 'lucide-react';

const NAV_LINKS = ['CATALOG', 'MOBILES', 'LAPTOPS', 'TABLETS'];

export default function Navbar({ searchQuery, onSearchChange }) {
  return (
    <header className="sticky top-0 z-50 bg-[#0f1116]/95 backdrop-blur-md border-b border-border">
      <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center gap-6">

        {/* Logo */}
        <span className="font-black text-lg tracking-widest text-white uppercase flex-shrink-0">
          GD<span className="text-accent">.</span>
        </span>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(n => (
            <span
              key={n}
              className="text-[10px] font-mono text-muted hover:text-white px-3 py-1 border border-transparent hover:border-border cursor-pointer transition-colors tracking-widest"
            >
              [{' '}{n}{' '}]
            </span>
          ))}
        </nav>

        {/* Search */}
        <div className="flex-1 max-w-lg relative ml-auto">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="SEARCH — iphone 17, macbook pro…"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-9 py-2 bg-panel border border-border text-white text-xs font-mono
                       placeholder:text-muted focus:outline-none focus:border-accent-dim
                       transition-colors tracking-wider"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button className="p-2 text-muted hover:text-white border border-transparent hover:border-border transition-colors">
            <Bell size={14} />
          </button>
          <button className="p-2 text-muted hover:text-white border border-transparent hover:border-border transition-colors">
            <BarChart2 size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}
