import { useState, useMemo, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import ProductCard, { HeroCard } from './components/ProductCard';
import CompareTray from './components/CompareTray';
import { MOCK_PRODUCTS, PRICE_MAX } from './data/mockProducts';
import Sidebar from './components/Sidebar';
import { SlidersHorizontal } from 'lucide-react';
import ChatBubble from './components/ChatBubble';

const DEFAULT_FILTERS = {
  priceRange: [0, PRICE_MAX],
  brands: [],
  stores: [],
  rams: [],
  storages: [],
};

// ── Parsing helpers ────────────────────────────────────────────────────────────

const KNOWN_COLORS = [
  'Natural Titanium', 'Titanium Black', 'Titanium Blue', 'Titanium Gray', 'Titanium White',
  'Space Gray', 'Deep Purple', 'Sierra Blue', 'Alpine Green', 'Product Red',
  'Glacier Blue', 'Platinum Silver', 'Natural Silver', 'Icy Blue', 'Midnight Black',
  'Phantom Black', 'Rose Gold', 'Mist Blue',
  'Midnight', 'Starlight', 'Blue', 'Green', 'Yellow', 'Pink', 'Red', 'Purple',
  'Orange', 'Black', 'White', 'Silver', 'Gold', 'Titanium', 'Graphite', 'Obsidian',
  'Sage', 'Teal', 'Coral', 'Lavender', 'Cream', 'Desert', 'Phantom', 'Prism',
  'Mystic', 'Arctic', 'Onyx', 'Ivory', 'Rose', 'Mint',
];

function parseStorageGB(s) {
  if (!s) return 0;
  const m = s.match(/^(\d+(?:\.\d+)?)\s*(GB|TB)$/i);
  if (!m) return 0;
  return parseFloat(m[1]) * (m[2].toUpperCase() === 'TB' ? 1024 : 1);
}

function parseProductInfo(title) {
  const dashMatch = title.match(/\s+[—–]\s+(.+)$/);
  if (dashMatch) {
    const color = dashMatch[1].trim();
    const baseName = title
      .slice(0, title.search(/\s+[—–]\s+/))
      .replace(/\s*\([^)]*\)/g, '')
      .trim();
    return { baseName, color };
  }

  const sorted = [...KNOWN_COLORS].sort((a, b) => b.length - a.length);
  for (const c of sorted) {
    const re = new RegExp(`(?:^|\\s)${c.replace(/\s+/g, '\\s+')}(?:\\s|$)`, 'i');
    if (re.test(title)) {
      const baseName = title
        .replace(new RegExp(c.replace(/\s+/g, '\\s+'), 'i'), '')
        .replace(/\s*\(?\d+\s*(?:GB|TB)\)?\s*/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
      return { baseName, color: c };
    }
  }

  // Try parenthetical pattern: "Apple iPhone 17 (Black, 256 GB)"
  const parenMatch = title.match(/\(([^,)]+),\s*\d+\s*(?:GB|TB)\)/i);
  if (parenMatch) {
    const color = parenMatch[1].trim();
    const baseName = title.replace(/\s*\([^)]*\)/g, '').trim();
    return { baseName, color };
  }

  const baseName = title.replace(/\s*\(?\d+\s*(?:GB|TB)\)?\s*/gi, '').trim();
  return { baseName, color: 'Default' };
}

function extractStorage(title, existing) {
  // Always returns a normalized, whitespace-free uppercase string (e.g. "128GB", "1TB") or null.
  let raw = null;
  if (existing) {
    raw = existing;
  } else {
    const parenM = title.match(/\(\s*[^,)]+,\s*(\d+\s*(?:GB|TB))\s*\)/i);
    if (parenM) raw = parenM[1];
    else {
      const m = title.match(/\b(\d+)\s*(GB|TB)\b/i);
      if (m) raw = `${m[1]}${m[2]}`;
    }
  }
  return raw ? raw.replace(/\s+/g, '').toUpperCase() : null;
}

function groupByColor(products) {
  const groups = new Map();
  for (const p of products) {
    const { baseName, color } = parseProductInfo(p.title);
    const key = `${p.brand}||${baseName}||${color}`;
    if (!groups.has(key)) {
      groups.set(key, {
        id: key, baseName, color,
        brand: p.brand, category: p.category, image: p.image,
        rating: p.rating, reviews: p.reviews, ram: p.ram, featured: p.featured,
        storageOptions: [],
      });
    }
    const g = groups.get(key);
    if (p.featured) g.featured = true;
    const storage = extractStorage(p.title, p.storage);
    if (!g.storageOptions.some(o => o.storage === storage)) {
      g.storageOptions.push({
        storage, price: p.currentPrice, originalPrice: p.originalPrice,
        avgPrice7d: p.avgPrice7d, storeSource: p.storeSource, productUrl: p.productUrl,
      });
    }
  }
  for (const g of groups.values()) {
    g.storageOptions.sort((a, b) => parseStorageGB(a.storage) - parseStorageGB(b.storage));
  }
  return Array.from(groups.values());
}

function detectCategory(title) {
  const t = (title || '').toLowerCase();
  if (/laptop|notebook|macbook|chromebook|thinkpad|zenbook|vivobook|ideapad|aspire|pavilion|inspiron|omen|envy|spectre/.test(t)) return 'Laptop';
  if (/tablet|ipad|galaxy tab/.test(t)) return 'Tablet';
  if (/watch|band|wearable|fitbit|garmin/.test(t)) return 'Wearable';
  return 'Mobile';
}

function mapApiResult(r, index) {
  const storeName = r.storeName?.toLowerCase().includes('amazon') ? 'Amazon' : 'Flipkart';
  const price = Number(r.price) || 0;
  return {
    id: `api-${index}`,
    title: r.productName,
    brand: r.brand,
    category: detectCategory(r.productName),
    currentPrice: price,
    originalPrice: price,
    avgPrice7d: price,
    rating: null, reviews: null, ram: null, storage: null,
    image: r.imageUrl,
    storeSource: storeName,
    productUrl: r.productUrl,
    featured: index === 0,
  };
}

const CATEGORY_CHIPS = ['ALL', 'MOBILES', 'LAPTOPS', 'TABLETS', 'WEARABLES'];

export default function App() {
  const [isDark, setIsDark] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [compareIds, setCompareIds] = useState(new Set());
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      setIsSearching(false);
      setFilters(DEFAULT_FILTERS);
      setActiveCategory('ALL');
      return;
    }
    clearTimeout(debounceRef.current);
    setIsSearching(true);
    setSearchResults(null);
    setFilters(DEFAULT_FILTERS);
    setActiveCategory('ALL');
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/v1/search?query=${encodeURIComponent(searchQuery.trim())}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const mapped = (data.results || []).map(mapApiResult);
        const maxPrice = mapped.reduce((m, p) => Math.max(m, p.currentPrice || 0), PRICE_MAX);
        setFilters(f => ({ ...f, priceRange: [f.priceRange[0], maxPrice] }));
        setSearchResults(mapped);
      } catch (e) {
        console.error('Search failed', e);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 800);
    return () => clearTimeout(debounceRef.current);
  }, [searchQuery]);

  const baseProducts = searchResults !== null ? searchResults : MOCK_PRODUCTS;

  // Derive filter options exclusively from real search results, never from mock fallback data.
  // searchResults is null before any search, [] on empty results, [...] on hits.
  const filterSource = useMemo(() => searchResults ?? [], [searchResults]);

  const resultsMaxPrice = useMemo(() => {
    if (filterSource.length === 0) return PRICE_MAX;
    return Math.max(PRICE_MAX, ...filterSource.map(p => p.currentPrice || 0));
  }, [filterSource]);

  const availableBrands = useMemo(() => {
    const seen = new Set();
    for (const p of filterSource) {
      if (p.brand && p.brand.trim()) seen.add(p.brand.trim());
    }
    return [...seen].sort();
  }, [filterSource]);

  const availableStorages = useMemo(() => {
    const seen = new Set();
    for (const p of filterSource) {
      const s = extractStorage(p.title, p.storage);
      if (s) seen.add(s);
    }
    return [...seen].sort((a, b) => parseStorageGB(a) - parseStorageGB(b));
  }, [filterSource]);

  const availableRams = useMemo(() => {
    const seen = new Set();
    for (const p of filterSource) {
      if (p.ram) seen.add(p.ram.replace(/\s+/g, '').toUpperCase());
    }
    return [...seen].sort();
  }, [filterSource]);

  const filteredProducts = useMemo(() => {
    const { priceRange, brands, stores, rams, storages } = filters;
    return baseProducts.filter(p => {
      if (activeCategory !== 'ALL' && !activeCategory.startsWith(p.category.toUpperCase())) return false;
      if (p.currentPrice < priceRange[0] || p.currentPrice > priceRange[1]) return false;
      if (brands.length > 0 && !brands.includes((p.brand || '').trim())) return false;
      if (stores.length > 0 && !stores.includes(p.storeSource)) return false;
      if (rams.length > 0) {
        const pRam = p.ram ? p.ram.replace(/\s+/g, '').toUpperCase() : null;
        if (!rams.includes(pRam)) return false;
      }
      if (storages.length > 0) {
        const pStorage = extractStorage(p.title, p.storage);
        if (!storages.includes(pStorage)) return false;
      }
      return true;
    });
  }, [baseProducts, filters, activeCategory]);

  const colorGroups = useMemo(() => groupByColor(filteredProducts), [filteredProducts]);
  const allColorGroups = useMemo(() => groupByColor(baseProducts), [baseProducts]);

  function toggleCompare(id) {
    setCompareIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 3) next.add(id);
      return next;
    });
  }

  const heroGroup = colorGroups[0] ?? null;
  const gridGroups = colorGroups.slice(1);

  const isHomeView = !searchQuery;

  return (
    <div className={`${isDark ? 'dark bg-surface' : 'bg-paper'} min-h-screen`}>
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} hideSearch={isHomeView} isDark={isDark} toggleTheme={() => setIsDark(d => !d)} />

      <main className="max-w-[1400px] mx-auto px-6 flex flex-col gap-8">

        {isHomeView ? (
          /* ── HOME VIEW ──────────────────────────────────────────── */
          <div className="flex flex-col items-center justify-center min-h-[80vh] gap-8">
            {/* Giant search input */}
            <div className="w-full max-w-3xl border-b-2 border-[#0F1116] dark:border-white">
              <input
                type="text"
                placeholder="SEARCH STORES..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full bg-transparent text-[#0F1116] dark:text-white text-6xl font-mono font-black
                           placeholder:text-muted caret-accent
                           focus:outline-none py-4 tracking-tight"
              />
            </div>

            {/* Trending searches */}
            <div className="flex flex-col items-center gap-4 w-full max-w-3xl">
              <p className="text-[10px] font-mono text-muted tracking-[0.4em] self-start">
                [ TRENDING SEARCHES ]
              </p>
              <div className="flex gap-3 flex-wrap">
                {['iPhone 15', 'MacBook M3', 'S24 Ultra'].map(term => (
                  <button
                    key={term}
                    onClick={() => setSearchQuery(term)}
                    className="font-mono text-xs tracking-widest border border-gray-200 dark:border-border text-muted
                               px-4 py-2 hover:border-[#0F1116] dark:hover:border-white hover:text-[#0F1116] dark:hover:text-white transition-all"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>

        ) : (
          /* ── RESULTS VIEW ───────────────────────────────────────── */
          <div className="flex flex-col gap-8 py-8">

            {/* Section header */}
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <p className={`text-[10px] font-mono tracking-[0.3em] uppercase ${isDark ? 'text-muted' : 'text-[#0F1116]/70'}`}>
                  {isSearching ? '[ SEARCHING… ]' : `[ RESULTS: "${searchQuery.toUpperCase()}" ]`}
                </p>
                <h2 className={`text-5xl font-black uppercase leading-none tracking-tight ${isDark ? 'text-white' : 'text-[#0F1116]'}`}>
                  {searchQuery.toUpperCase()}
                </h2>
              </div>

              <div className="hidden md:flex flex-col items-end gap-3">
                <button className="text-xs font-mono text-[#0F1116] dark:text-white border border-[#0F1116] dark:border-white px-5 py-2 hover:bg-[#0F1116] dark:hover:bg-white hover:text-white dark:hover:text-surface transition-all tracking-[0.2em]">
                  <span className="flex items-center gap-2">
                    <SlidersHorizontal size={12} />
                    FILTERS
                  </span>
                </button>
                <p className={`text-[10px] font-mono tracking-widest ${isDark ? 'text-muted' : 'text-[#0F1116]/70'}`}>
                  {isSearching ? 'LOADING…' : `${colorGroups.length} MODEL${colorGroups.length !== 1 ? 'S' : ''} FOUND`}
                </p>
              </div>
            </div>

            {/* Category chips */}
            <div className="flex items-center gap-2 flex-wrap">
              {CATEGORY_CHIPS.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-[10px] font-mono tracking-[0.2em] px-3 py-1.5 border transition-all ${
                    activeCategory === cat
                      ? 'border-accent text-accent bg-accent/10'
                      : 'border-gray-200 dark:border-border text-muted hover:border-[#0F1116] dark:hover:border-muted hover:text-[#0F1116] dark:hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex gap-6 items-start">
            {!isSearching && searchResults !== null && (
              <Sidebar
                filters={filters}
                onChange={setFilters}
                onReset={() => setFilters(DEFAULT_FILTERS)}
                isDark={isDark}
                availableBrands={availableBrands}
                availableStorages={availableStorages}
                availableRams={availableRams}
                priceMax={resultsMaxPrice}
              />
            )}
            <div className="flex-1 min-w-0">
            {isSearching ? (
              <div className="flex flex-col items-center gap-4 py-32 text-center border border-gray-200 dark:border-border">
                <style>{`
                  @keyframes retro-fill {
                    from { width: 0% }
                    to   { width: 100% }
                  }
                  .retro-bar {
                    animation: retro-fill 1.8s steps(12, end) infinite;
                  }
                `}</style>
                <div className="w-64 h-5 border-2 border-[#0F1116] dark:border-white overflow-hidden bg-transparent">
                  <div className="retro-bar h-full bg-[#0F1116] dark:bg-white" />
                </div>
                <p className="text-xs font-mono text-muted tracking-[0.2em]">SCANNING STORES...</p>
              </div>

            ) : colorGroups.length === 0 ? (
              <div className="flex flex-col items-center gap-4 py-32 text-center border border-gray-200 dark:border-border">
                <p className="text-5xl font-black text-gray-300 dark:text-border">?</p>
                <p className="text-sm font-mono text-muted tracking-widest">NO RESULTS FOUND</p>
                <button
                  onClick={() => { setSearchQuery(''); setActiveCategory('ALL'); }}
                  className="text-[10px] font-mono border border-accent text-accent px-4 py-2 hover:bg-accent hover:text-surface transition-all tracking-widest"
                >
                  RESET
                </button>
              </div>

            ) : (
              <>
                {heroGroup && (
                  <HeroCard
                    group={heroGroup}
                    isCompared={compareIds.has(heroGroup.id)}
                    onToggleCompare={toggleCompare}
                  />
                )}
                {gridGroups.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                    {gridGroups.map(group => (
                      <ProductCard
                        key={group.id}
                        group={group}
                        isCompared={compareIds.has(group.id)}
                        onToggleCompare={toggleCompare}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
            </div>{/* flex-1 */}
            </div>{/* flex gap-6 */}
          </div>
        )}
      </main>

      <CompareTray
        groups={allColorGroups}
        compareIds={compareIds}
        onRemove={id => toggleCompare(id)}
        onClearAll={() => setCompareIds(new Set())}
      />

      {compareIds.size > 0 && <div className="h-52" />}

      <ChatBubble />
    </div>
  );
}
