import { X, BarChart2 } from 'lucide-react';

function formatINR(v) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(v);
}

export default function CompareTray({ groups, compareIds, onRemove, onClearAll }) {
  const compared = groups.filter(g => compareIds.has(g.id));
  if (compared.length === 0) return null;

  const specs = ['price', 'storage', 'ram', 'store'];
  const labels = { price: 'PRICE', storage: 'STORAGE', ram: 'RAM', store: 'STORE' };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50">
      <div className="bg-panel border-t border-accent-dim shadow-[0_-8px_40px_0_rgba(0,0,0,0.6)] max-w-[1400px] mx-auto px-6 py-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart2 size={14} className="text-accent" />
            <span className="text-[10px] font-mono text-accent tracking-[0.2em]">
              COMPARE ({compared.length}/3)
            </span>
          </div>
          <button
            onClick={onClearAll}
            className="text-[10px] font-mono text-muted hover:text-white flex items-center gap-1.5 transition-colors tracking-widest border border-border px-3 py-1.5 hover:border-muted"
          >
            <X size={10} /> CLEAR ALL
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full">
            <thead>
              <tr>
                <td className="pr-8 pb-3 text-[9px] font-mono text-muted tracking-[0.2em] w-20">SPEC</td>
                {compared.map(g => {
                  return (
                    <th key={g.id} className="px-4 pb-3 text-left align-top min-w-[180px]">
                      <div className="flex items-start gap-3">
                        <img
                          src={g.image}
                          alt=""
                          className="w-10 h-10 object-contain bg-card-light p-1 flex-shrink-0"
                          onError={e => { e.target.src = `https://placehold.co/40/d0d8e4/1a1d23?text=${g.brand[0]}`; }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-white line-clamp-1">
                            {g.baseName}
                          </p>
                          <p className="text-[9px] font-mono text-muted mt-0.5 tracking-widest">{g.color}</p>
                        </div>
                        <button onClick={() => onRemove(g.id)} className="text-muted hover:text-white transition-colors">
                          <X size={12} />
                        </button>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {specs.map(spec => {
                const allPrices = compared.map(x => x.storageOptions[0]?.price ?? Infinity);
                const minPrice = Math.min(...allPrices);
                return (
                  <tr key={spec} className="border-t border-border">
                    <td className="py-2.5 pr-8 text-[9px] font-mono text-muted tracking-[0.15em]">
                      {labels[spec]}
                    </td>
                    {compared.map(g => {
                      const opt = g.storageOptions[0];
                      const isBest = spec === 'price' && opt?.price === minPrice;
                      let cell;
                      if (spec === 'price') {
                        cell = (
                          <span className={`text-xs font-mono font-semibold ${isBest ? 'text-accent' : 'text-white'}`}>
                            {isBest && '↓ '}{formatINR(opt?.price ?? 0)}
                          </span>
                        );
                      } else if (spec === 'storage') {
                        const sizes = g.storageOptions.map(o => o.storage).filter(Boolean).join(' / ');
                        cell = <span className="text-[10px] font-mono text-white">{sizes || '—'}</span>;
                      } else if (spec === 'store') {
                        cell = <span className="text-[10px] font-mono text-muted tracking-wider">{opt?.storeSource ?? '—'}</span>;
                      } else {
                        cell = <span className="text-[10px] font-mono text-white">{g[spec] ?? '—'}</span>;
                      }
                      return <td key={g.id} className="px-4 py-2.5">{cell}</td>;
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
