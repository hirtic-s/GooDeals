import { useState, useMemo, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import ProductCard, { HeroCard } from './components/ProductCard';
import CompareTray from './components/CompareTray';
import { MOCK_PRODUCTS } from './data/mockProducts';
import { SlidersHorizontal, Loader2 } from 'lucide-react';

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
  if (existing) return existing;
  // Prefer parenthetical storage: "(Black, 256 GB)" → "256 GB"
  const parenM = title.match(/\(\s*[^,)]+,\s*(\d+\s*(?:GB|TB))\s*\)/i);
  if (parenM) return parenM[1].replace(/\s+/, ' ').trim();
  const m = title.match(/\b(\d+)\s*(GB|TB)\b/i);
  return m ? `${m[1]} ${m[2].toUpperCase()}` : null;
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

function mapApiResult(r, index) {
  const storeName = r.storeName?.toLowerCase().includes('amazon') ? 'Amazon' : 'Flipkart';
  const price = Number(r.price) || 0;
  return {
    id: `api-${index}`,
    title: r.productName,
    brand: r.brand,
    category: 'Mobile',
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
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [compareIds, setCompareIds] = useState(new Set());
  const [searchResults, setSearchResults] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(null);
      setIsSearching(false);
      return;
    }
    clearTimeout(debounceRef.current);
    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `http://localhost:8080/api/v1/search?query=${encodeURIComponent(searchQuery.trim())}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setSearchResults((data.results || []).map(mapApiResult));
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

  const colorGroups = useMemo(() => groupByColor(baseProducts), [baseProducts]);
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

  return (
    <div className="min-h-screen bg-surface">
      <Navbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <main className="max-w-[1400px] mx-auto px-6 py-8 flex flex-col gap-8">

        {/* ── Section header ───────────────────────────────────────── */}
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <p className="text-[10px] font-mono text-muted tracking-[0.3em] uppercase">
              {isSearching
                ? '[ SEARCHING… ]'
                : searchQuery
                ? `[ RESULTS: "${searchQuery.toUpperCase()}" ]`
                : '[ NEW COLLECTION ]'}
            </p>
            <h2 className="text-5xl font-black uppercase leading-none text-white tracking-tight">
              {searchQuery
                ? searchQuery.toUpperCase()
                : 'BEST DEALS'}
            </h2>
          </div>

          {/* Right metadata + FILTERS */}
          <div className="hidden md:flex flex-col items-end gap-3">
            <button className="text-xs font-mono text-white border border-white px-5 py-2 hover:bg-white hover:text-surface transition-all tracking-[0.2em]">
              <span className="flex items-center gap-2">
                <SlidersHorizontal size={12} />
                FILTERS
              </span>
            </button>
            <div className="text-right">
              <p className="text-[10px] font-mono text-muted tracking-widest">
                {isSearching ? 'LOADING…' : `${colorGroups.length} MODEL${colorGroups.length !== 1 ? 'S' : ''} FOUND`}
              </p>
            </div>
          </div>
        </div>

        {/* ── Category chips ───────────────────────────────────────── */}
        <div className="flex items-center gap-2 flex-wrap">
          {CATEGORY_CHIPS.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-[10px] font-mono tracking-[0.2em] px-3 py-1.5 border transition-all ${
                activeCategory === cat
                  ? 'border-accent text-accent bg-accent/10'
                  : 'border-border text-muted hover:border-muted hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── Content ──────────────────────────────────────────────── */}
        {isSearching ? (
          <div className="flex flex-col items-center gap-4 py-32 text-center border border-border">
            <Loader2 size={28} className="text-accent animate-spin" />
            <p className="text-xs font-mono text-muted tracking-[0.2em]">SCANNING STORES…</p>
          </div>

        ) : colorGroups.length === 0 ? (
          <div className="flex flex-col items-center gap-4 py-32 text-center border border-border">
            <p className="text-5xl font-black text-border">?</p>
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
            {/* Hero */}
            {heroGroup && (
              <HeroCard
                group={heroGroup}
                isCompared={compareIds.has(heroGroup.id)}
                onToggleCompare={toggleCompare}
              />
            )}

            {/* Grid */}
            {gridGroups.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-px bg-border">
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
      </main>

      <CompareTray
        groups={allColorGroups}
        compareIds={compareIds}
        onRemove={id => toggleCompare(id)}
        onClearAll={() => setCompareIds(new Set())}
      />

      {compareIds.size > 0 && <div className="h-52" />}
    </div>
  );
}
