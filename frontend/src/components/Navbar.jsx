import { Search, X, Sun, Moon } from 'lucide-react';

const NAV_LINKS = ['MOBILES', 'LAPTOPS', 'TABLETS'];

export default function Navbar({ searchQuery, onSearchChange, onSearch, onClear, hideSearch = false, isDark, toggleTheme }) {
  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#0f1116]/95 backdrop-blur-md border-b border-gray-200 dark:border-border">
      <div className="max-w-[1400px] mx-auto px-6 h-14 flex items-center gap-6">

        {/* Logo */}
        <span className="font-black text-lg tracking-widest text-[#0F1116] dark:text-white uppercase flex-shrink-0">
          GooDeals<span className="text-accent">.</span>
        </span>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(n => (
            <span
              key={n}
              onClick={() => onSearch && onSearch(n.toLowerCase())}
              className="text-[10px] font-mono text-muted hover:text-[#0F1116] dark:hover:text-white px-3 py-1 border border-transparent hover:border-gray-300 dark:hover:border-border cursor-pointer transition-colors tracking-widest"
            >
              [{' '}{n}{' '}]
            </span>
          ))}
        </nav>

        {/* Search — hidden on home view */}
        {!hideSearch && (
          <div className="flex-1 max-w-lg flex items-center gap-2 ml-auto">
            <div className="flex-1 relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                placeholder="SEARCH — iphone 17, macbook pro…"
                value={searchQuery}
                onChange={e => onSearchChange(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onSearch && onSearch()}
                className="w-full pl-9 pr-9 py-2 bg-panel border border-border text-white text-xs font-mono
                           placeholder:text-muted focus:outline-none focus:border-accent-dim
                           transition-colors tracking-wider"
              />
              {searchQuery && (
                <button
                  onClick={onClear}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white transition-colors"
                >
                  <X size={13} />
                </button>
              )}
            </div>
            <button
              onClick={() => onSearch && onSearch()}
              className="flex-shrink-0 px-4 py-2 border border-border text-muted hover:border-accent hover:text-accent
                         font-mono text-[10px] tracking-[0.15em] transition-colors"
            >
              GO
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
          <button
            onClick={toggleTheme}
            className="p-2 text-muted hover:text-[#0F1116] dark:hover:text-white border border-transparent hover:border-gray-300 dark:hover:border-border transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>
      </div>
    </header>
  );
}
