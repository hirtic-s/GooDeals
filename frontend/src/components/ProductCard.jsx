import { useState } from 'react';
import { ArrowUpRight, Plus, Minus } from 'lucide-react';
import { SiApple, SiSamsung, SiDell, SiHp, SiLenovo, SiXiaomi } from '@icons-pack/react-simple-icons';

const BRAND_ICONS = {
  Apple:   SiApple,
  Samsung: SiSamsung,
  Dell:    SiDell,
  HP:      SiHp,
  Lenovo:  SiLenovo,
  Xiaomi:  SiXiaomi,
};

function BrandIcon({ brand }) {
  const Icon = BRAND_ICONS[brand];
  if (!Icon) return null;
  return <Icon size={11} color="#94a3b8" style={{ flexShrink: 0 }} />;
}

function formatINR(n) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(n);
}

const COLOR_HEX = {
  'Midnight': '#1c2140', 'Starlight': '#f0e6d2', 'Black': '#111',
  'White': '#f5f5f0', 'Silver': '#b0b8c8', 'Gold': '#c9a84c',
  'Blue': '#4a7fd4', 'Green': '#34a853', 'Yellow': '#f5bc00',
  'Pink': '#e891b0', 'Red': '#cc3333', 'Purple': '#8b3cf7',
  'Titanium': '#7a8090', 'Space Gray': '#5c5f6b', 'Graphite': '#42444c',
  'Deep Purple': '#4b2075', 'Sierra Blue': '#4a90c4', 'Alpine Green': '#3a6448',
  'Rose Gold': '#b07070', 'Phantom Black': '#18181e', 'Icy Blue': '#8ecae6',
  'Sage': '#7a9e7e', 'Teal': '#2a8a7c', 'Coral': '#e8604c',
  'Lavender': '#9b72cf', 'Onyx': '#2c2e33', 'Obsidian': '#1e2228',
  'Natural Titanium': '#a09080', 'Titanium Black': '#2a2c32',
  'Mist Blue': '#7aa8c4', 'Default': '#4a5468',
};

/**
 * HeroCard — full-width featured card shown at top of results.
 */
export function HeroCard({ group, isCompared, onToggleCompare }) {
  const [sliderIdx, setSliderIdx] = useState(0);
  const selected = group.storageOptions[sliderIdx] ?? group.storageOptions[0];
  const maxIdx = group.storageOptions.length - 1;
  const pct = maxIdx > 0 ? (sliderIdx / maxIdx) * 100 : 0;
  const swatchColor = COLOR_HEX[group.color] ?? '#4a5468';

  return (
    <div className="relative w-full border border-gray-200 dark:border-border bg-white dark:bg-card overflow-hidden mb-1">
      {/* Inner glow */}
      <div className="absolute inset-0 pointer-events-none" />

      <div className="flex flex-col md:flex-row min-h-[340px]">
        {/* Image pane */}
        <div className="relative md:w-[44%] bg-white flex items-center justify-center p-10 min-h-[240px]">
          {/* Series tag */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="text-[10px] font-mono text-[#6a7a8a] border border-[#b0bcc8] px-2 py-0.5 tracking-widest">
              [ SERIES_01 ]
            </span>
          </div>
          <img
            src={group.image}
            alt={group.baseName}
            className="object-contain h-52 w-full max-w-xs"
            onError={e => {
              e.target.src = `https://placehold.co/400x400/d0d8e4/1a1d23?text=${encodeURIComponent(group.brand[0] ?? '?')}`;
            }}
          />
          {/* Slide counter */}
          <div className="absolute bottom-4 right-4 font-mono text-[10px] text-[#6a7a8a] tracking-widest">
            01 ——— {String(group.storageOptions.length).padStart(2, '0')}
          </div>
        </div>

        {/* Info pane */}
        <div className="flex-1 flex flex-col justify-between p-8 md:p-10">
          {/* Title */}
          <div>
            <p className="flex items-center gap-1.5 text-[10px] font-mono text-muted tracking-[0.2em] uppercase mb-3">
              <BrandIcon brand={group.brand} />
              {group.brand} / {group.category}
            </p>
            <h1 className="text-4xl md:text-5xl font-black uppercase leading-none tracking-tight text-[#0F1116] dark:text-white mb-1">
              {group.baseName.replace(group.brand, '').trim()}
            </h1>
            <p className="text-[10px] font-mono text-accent tracking-widest">™ LATEST MODEL</p>
          </div>

          {/* Storage selector */}
          <div className="mt-8 space-y-4">
            <div className="flex items-center gap-6">
              <span className="text-[10px] font-mono text-muted tracking-[0.15em] w-14">SIZE</span>
              <div className="flex gap-3">
                {group.storageOptions.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => setSliderIdx(i)}
                    className={`text-xs font-mono px-2 py-0.5 border transition-all tracking-wider ${
                      i === sliderIdx
                        ? 'border-accent text-accent'
                        : 'border-gray-200 dark:border-border text-muted hover:border-muted'
                    }`}
                  >
                    {opt.storage ?? '—'}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-6">
              <span className="text-[10px] font-mono text-muted tracking-[0.15em] w-14">COLOUR</span>
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 inline-block border border-black/20 dark:border-white/20"
                  style={{ background: swatchColor }}
                />
                <span className="text-xs font-mono text-[#0F1116] dark:text-white tracking-wider uppercase">
                  {group.color}
                </span>
              </div>
            </div>

            {maxIdx > 0 && (
              <div className="flex items-center gap-6">
                <span className="text-[10px] font-mono text-muted tracking-[0.15em] w-14" />
                <div className="flex-1 max-w-xs">
                  <input
                    type="range" min={0} max={maxIdx} step={1} value={sliderIdx}
                    onChange={e => setSliderIdx(Number(e.target.value))}
                    className="step-slider"
                    style={{
                      background: `linear-gradient(to right, #6cb4e4 ${pct}%, var(--slider-track-empty) ${pct}%)`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Price + Buy */}
          <div className="mt-8 flex items-center gap-6">
            <div className="flex items-center gap-4 border border-gray-200 dark:border-border p-3">
              <div className="w-10 h-10 border border-accent flex items-center justify-center">
                <ArrowUpRight size={18} className="text-accent" />
              </div>
              <div>
                <p className="text-[9px] font-mono text-muted tracking-[0.2em] uppercase">ADD TO CART</p>
                <p className="text-xl font-mono font-semibold text-[#0F1116] dark:text-white">{formatINR(selected.price)}</p>
              </div>
            </div>
            <a
              href={selected.productUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-mono text-accent border border-accent-dim px-4 py-2 hover:bg-accent hover:text-[#0f1116] transition-all tracking-widest"
            >
              BUY NOW →
            </a>
            <button
              onClick={() => onToggleCompare(group.id)}
              className={`text-[10px] font-mono px-4 py-2 border tracking-widest transition-all ${
                isCompared ? 'border-accent bg-accent text-[#0f1116]' : 'border-gray-200 dark:border-border text-muted hover:border-muted'
              }`}
            >
              {isCompared ? '✓ COMPARE' : '+ COMPARE'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ProductCard — compact grid card per colour group.
 */
export default function ProductCard({ group, isCompared, onToggleCompare }) {
  const [sliderIdx, setSliderIdx] = useState(0);
  const selected = group.storageOptions[sliderIdx] ?? group.storageOptions[0];
  const maxIdx = group.storageOptions.length - 1;
  const pct = maxIdx > 0 ? (sliderIdx / maxIdx) * 100 : 0;
  const swatchColor = COLOR_HEX[group.color] ?? '#4a5468';

  return (
    <div className="group/card flex flex-col border border-gray-200 dark:border-border bg-white dark:bg-card hover:border-gray-400 dark:hover:border-border-accent transition-all duration-300 cursor-pointer">

      {/* Image container — light inner */}
      <div className="relative bg-white aspect-[4/3] overflow-hidden flex items-center justify-center p-6">
        {/* Inner glow */}
        <div className="absolute inset-0 pointer-events-none" />
        <img
          src={group.image}
          alt={group.baseName}
          className="object-contain h-full w-full max-h-36 transition-transform duration-500 group-hover/card:scale-105"
          onError={e => {
            e.target.src = `https://placehold.co/300x300/d0d8e4/1a1d23?text=${encodeURIComponent(group.brand[0] ?? '?')}`;
          }}
        />
        {/* Compare toggle */}
        <button
          onClick={() => onToggleCompare(group.id)}
          className={`absolute top-2 right-2 w-6 h-6 border flex items-center justify-center transition-all text-[9px] font-mono ${
            isCompared
              ? 'bg-accent border-accent text-[#0f1116]'
              : 'bg-white/80 dark:bg-card/60 border-gray-200 dark:border-border text-muted hover:border-accent hover:text-accent'
          }`}
        >
          {isCompared ? '✓' : '+'}
        </button>
      </div>

      {/* Metadata */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Name + color */}
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <BrandIcon brand={group.brand} />
            <span className="text-[9px] font-mono text-muted tracking-widest uppercase">{group.brand}</span>
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F1116] dark:text-white leading-tight line-clamp-2">
            {group.baseName}
          </h3>
          <div className="flex items-center gap-1.5 mt-1.5">
            <span
              className="w-2.5 h-2.5 border border-white/10 flex-shrink-0"
              style={{ background: swatchColor }}
            />
            <span className="text-[10px] font-mono text-muted tracking-wider uppercase">
              {group.color}
            </span>
          </div>
        </div>

        {/* Storage slider */}
        {maxIdx > 0 ? (
          <div className="space-y-2">
            <input
              type="range" min={0} max={maxIdx} step={1} value={sliderIdx}
              onChange={e => setSliderIdx(Number(e.target.value))}
              className="step-slider"
              style={{
                background: `linear-gradient(to right, #6cb4e4 ${pct}%, var(--slider-track-empty) ${pct}%)`,
              }}
            />
            <div className="flex justify-between">
              {group.storageOptions.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => setSliderIdx(i)}
                  className={`text-[9px] font-mono tracking-wider transition-colors ${
                    i === sliderIdx ? 'text-accent' : 'text-muted hover:text-[#0F1116] dark:hover:text-white'
                  }`}
                >
                  {opt.storage ?? '—'}
                </button>
              ))}
            </div>
          </div>
        ) : selected.storage ? (
          <span className="text-[9px] font-mono text-muted border border-gray-200 dark:border-border px-1.5 py-0.5 w-fit tracking-widest">
            {selected.storage}
          </span>
        ) : null}

        {/* Price + Buy */}
        <div className="flex items-center justify-between mt-auto pt-1 border-t border-gray-200 dark:border-border">
          <span className="text-sm font-mono font-semibold text-[#0F1116] dark:text-white tracking-wider">
            {formatINR(selected.price)}
          </span>
          <a
            href={selected.productUrl || '#'}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1 text-[9px] font-mono text-accent border border-accent-dim px-2.5 py-1.5
                       hover:bg-accent hover:text-[#0f1116] transition-all tracking-widest"
          >
            BUY <ArrowUpRight size={9} />
          </a>
        </div>

        {/* Store tag */}
        <p className="text-[9px] font-mono text-muted tracking-widest">
          VIA {(selected.storeSource ?? '—').toUpperCase()}
        </p>
      </div>
    </div>
  );
}
