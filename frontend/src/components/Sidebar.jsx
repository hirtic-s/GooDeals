import { SlidersHorizontal, RotateCcw } from 'lucide-react';
import { BRANDS, RAM_OPTIONS, STORAGE_OPTIONS, PRICE_MAX } from '../data/mockProducts';

const brandColors = {
  Apple:   'bg-gray-100 text-gray-700',
  Samsung: 'bg-blue-50 text-blue-700',
  Dell:    'bg-red-50 text-red-700',
  HP:      'bg-sky-50 text-sky-700',
  Lenovo:  'bg-rose-50 text-rose-700',
  Xiaomi:  'bg-orange-50 text-orange-700',
};

const brandIcons = {
  Apple:   '🍎',
  Samsung: '📱',
  Dell:    '💻',
  HP:      '🖥️',
  Lenovo:  '⌨️',
  Xiaomi:  '⚡',
};

function formatINR(v) {
  if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(0)}K`;
  return `₹${v}`;
}

/**
 * Sidebar filter panel
 */
export default function Sidebar({ filters, onChange, onReset }) {
  const { priceRange, brands, rams, storages } = filters;

  function toggleArr(arr, val) {
    return arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val];
  }

  return (
    <aside className="glass rounded-3xl shadow-glass p-5 flex flex-col gap-6 h-fit sticky top-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-brand-700 font-bold text-base">
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
        <p className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider">Price Range (₹)</p>
        <div className="flex justify-between text-[11px] font-semibold text-brand-700 mb-2">
          <span className="px-2 py-0.5 bg-brand-600 text-white rounded-full">{formatINR(priceRange[0])}</span>
          <span className="px-2 py-0.5 bg-brand-600 text-white rounded-full">{formatINR(priceRange[1])}</span>
        </div>

        {/* Min thumb */}
        <div className="relative h-6 flex items-center">
          <div
            className="absolute h-1.5 rounded-full bg-brand-600"
            style={{
              left: `${(priceRange[0] / PRICE_MAX) * 100}%`,
              right: `${100 - (priceRange[1] / PRICE_MAX) * 100}%`,
            }}
          />
          <div className="absolute w-full h-1.5 rounded-full bg-brand-100" style={{ zIndex: 0 }} />
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
        <p className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider">Store</p>
        <div className="flex flex-col gap-2">
          {['Amazon', 'Flipkart'].map(store => {
            const active = filters.stores.includes(store);
            return (
              <button
                key={store}
                onClick={() => onChange({ ...filters, stores: toggleArr(filters.stores, store) })}
                className={`flex items-center gap-3 px-3 py-2 rounded-2xl text-sm font-medium border transition-all duration-200 ${
                  active
                    ? 'border-brand-400 bg-brand-50 text-brand-700'
                    : 'border-gray-100 bg-white/60 text-gray-600 hover:border-brand-200'
                }`}
              >
                <span className="w-4 h-4 rounded flex items-center justify-center border-2 transition-colors duration-200 flex-shrink-0"
                  style={{ borderColor: active ? '#7c3aed' : '#e5e7eb', background: active ? '#7c3aed' : 'white' }}
                >
                  {active && <span className="text-white text-[9px] font-black">✓</span>}
                </span>
                {store === 'Amazon' ? '🛒 Amazon India' : '🛍️ Flipkart'}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Brands ── */}
      <div>
        <p className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider">Brand</p>
        <div className="flex flex-col gap-2">
          {BRANDS.map(brand => {
            const active = brands.includes(brand);
            return (
              <button
                key={brand}
                onClick={() => onChange({ ...filters, brands: toggleArr(brands, brand) })}
                className={`flex items-center gap-3 px-3 py-2 rounded-2xl text-sm font-medium border transition-all duration-200 ${
                  active
                    ? 'border-brand-400 bg-brand-50 text-brand-700'
                    : 'border-gray-100 bg-white/60 text-gray-600 hover:border-brand-200'
                }`}
              >
                <span className="w-4 h-4 rounded flex items-center justify-center border-2 transition-colors duration-200 flex-shrink-0"
                  style={{ borderColor: active ? '#7c3aed' : '#e5e7eb', background: active ? '#7c3aed' : 'white' }}
                >
                  {active && <span className="text-white text-[9px] font-black">✓</span>}
                </span>
                <span className="text-base">{brandIcons[brand]}</span>
                <span>{brand}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── RAM ── */}
      <div>
        <p className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider">RAM</p>
        <div className="flex flex-wrap gap-2">
          {RAM_OPTIONS.map(opt => (
            <button
              key={opt}
              onClick={() => onChange({ ...filters, rams: toggleArr(rams, opt) })}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                rams.includes(opt)
                  ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                  : 'border-gray-200 text-gray-600 bg-white/70 hover:border-brand-300 hover:text-brand-600'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* ── Storage ── */}
      <div>
        <p className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider">Storage</p>
        <div className="flex flex-wrap gap-2">
          {STORAGE_OPTIONS.map(opt => (
            <button
              key={opt}
              onClick={() => onChange({ ...filters, storages: toggleArr(storages, opt) })}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ${
                storages.includes(opt)
                  ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                  : 'border-gray-200 text-gray-600 bg-white/70 hover:border-brand-300 hover:text-brand-600'
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
