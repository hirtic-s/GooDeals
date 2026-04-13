import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import { BRANDS, RAM_OPTIONS, STORAGE_OPTIONS, PRICE_MAX } from '../data/mockProducts';
import { SiApple, SiSamsung, SiDell, SiHp, SiLenovo, SiXiaomi } from '@icons-pack/react-simple-icons';

const brandIcons = {
  Apple:   SiApple,
  Samsung: SiSamsung,
  Dell:    SiDell,
  HP:      SiHp,
  Lenovo:  SiLenovo,
  Xiaomi:  SiXiaomi,
};

function BrandIcon({ name, isDark }) {
  const Icon = brandIcons[name];
  if (!Icon) return null;
  return <Icon size={14} color={isDark ? 'white' : '#0F1116'} style={{ flexShrink: 0 }} />;
}

function formatINR(v) {
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`;
  return `₹${v}`;
}

/**
 * Sidebar filter panel
 */
export default function Sidebar({ filters, onChange, onReset, isDark }) {
  const { priceRange, brands, rams, storages } = filters;

  function toggleArr(arr, val) {
    return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
  }

  return (
    <aside className="bg-paper dark:bg-card border border-gray-200 dark:border-border rounded-none p-5 flex flex-col gap-6 h-fit sticky top-20 w-64 flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-800 dark:text-white font-bold text-base">
          <SlidersHorizontal size={16} />
          Filters
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-brand-600 transition-colors duration-200 font-medium"
        >
          <RotateCcw size={11} />
          Reset
        </button>
      </div>

      {/* ── Price Range ── */}
      <div>
        <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">Price Range (₹)</p>
        <div className="flex justify-between text-[11px] font-semibold mb-2">
          <span className="px-2 py-0.5 bg-gray-700 dark:bg-gray-600 text-white rounded-full">{formatINR(priceRange[0])}</span>
          <span className="px-2 py-0.5 bg-gray-700 dark:bg-gray-600 text-white rounded-full">{formatINR(priceRange[1])}</span>
        </div>

        {/* Min thumb */}
        <div className="relative h-6 flex items-center">
          <div className="absolute w-full h-1.5 rounded-full bg-gray-200 dark:bg-border" style={{ zIndex: 0 }} />
          <div
            className="absolute h-1.5 rounded-full bg-accent"
            style={{
              left: `${(priceRange[0] / PRICE_MAX) * 100}%`,
              right: `${100 - (priceRange[1] / PRICE_MAX) * 100}%`,
              zIndex: 1,
            }}
          />
          <input
            type="range"
            min={0}
            max={PRICE_MAX}
            step={1000}
            value={priceRange[0]}
            onChange={e => {
              const v = Math.min(Number(e.target.value), priceRange[1] - 1000);
              onChange({ ...filters, priceRange: [v, priceRange[1]] });
            }}
            className="absolute w-full appearance-none bg-transparent cursor-pointer range-slider z-10"
          />
          <input
            type="range"
            min={0}
            max={PRICE_MAX}
            step={1000}
            value={priceRange[1]}
            onChange={e => {
              const v = Math.max(Number(e.target.value), priceRange[0] + 1000);
              onChange({ ...filters, priceRange: [priceRange[0], v] });
            }}
            className="absolute w-full appearance-none bg-transparent cursor-pointer range-slider z-10"
          />
        </div>
        <p className="text-[10px] text-gray-400 mt-1">Avg. price: ₹80K — ₹1.2L for electronics</p>
      </div>

      {/* ── Store ── */}
      <div>
        <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">Store</p>
        <div className="flex flex-col gap-2">
          {['Amazon', 'Flipkart'].map(store => {
            const active = filters.stores.includes(store);
            return (
              <button
                key={store}
                onClick={() => onChange({ ...filters, stores: toggleArr(filters.stores, store) })}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium border transition-all duration-200 ${
                  active
                    ? 'border-brand-500 bg-brand-600/10 text-brand-400'
                    : 'border-border text-muted dark:text-gray-200 hover:border-brand-500/50 hover:text-brand-400'
                }`}
              >
                <span className="w-3.5 h-3.5 flex items-center justify-center border transition-colors duration-200 flex-shrink-0"
                  style={{ borderColor: active ? '#7c3aed' : '#3a3d4a', background: active ? '#7c3aed' : 'transparent' }}
                >
                  {active && <span className="text-white text-[8px] font-black">✓</span>}
                </span>
                {store === 'Amazon' ? 'Amazon India' : 'Flipkart'}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Brands ── */}
      <div>
        <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">Brand</p>
        <div className="flex flex-col gap-2">
          {BRANDS.map(brand => {
            const active = brands.includes(brand);
            return (
              <button
                key={brand}
                onClick={() => onChange({ ...filters, brands: toggleArr(brands, brand) })}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-medium border transition-all duration-200 ${
                  active
                    ? 'border-brand-500 bg-brand-600/10 text-brand-400'
                    : 'border-border text-muted dark:text-gray-200 hover:border-brand-500/50 hover:text-brand-400'
                }`}
              >
                <span className="w-3.5 h-3.5 flex items-center justify-center border transition-colors duration-200 flex-shrink-0"
                  style={{ borderColor: active ? '#7c3aed' : '#3a3d4a', background: active ? '#7c3aed' : 'transparent' }}
                >
                  {active && <span className="text-white text-[8px] font-black">✓</span>}
                </span>
                {brandIcons[brand] && <BrandIcon name={brand} isDark={isDark} />}
                <span>{brand}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── RAM ── */}
      <div>
        <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">RAM</p>
        <div className="flex flex-wrap gap-2">
          {RAM_OPTIONS.map(opt => (
            <button
              key={opt}
              onClick={() => onChange({ ...filters, rams: toggleArr(rams, opt) })}
              className={`px-3 py-1.5 text-xs font-mono tracking-wider border transition-all duration-200 ${
                rams.includes(opt)
                  ? 'bg-brand-600/20 text-brand-400 border-brand-500'
                  : 'border-border text-muted dark:text-gray-200 hover:border-brand-500/50 hover:text-brand-400'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* ── Storage ── */}
      <div>
        <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">Storage</p>
        <div className="flex flex-wrap gap-2">
          {STORAGE_OPTIONS.map(opt => (
            <button
              key={opt}
              onClick={() => onChange({ ...filters, storages: toggleArr(storages, opt) })}
              className={`px-3 py-1.5 text-xs font-mono tracking-wider border transition-all duration-200 ${
                storages.includes(opt)
                  ? 'bg-brand-600/20 text-brand-400 border-brand-500'
                  : 'border-border text-muted dark:text-gray-200 hover:border-brand-500/50 hover:text-brand-400'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
