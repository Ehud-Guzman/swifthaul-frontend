import { useNavigate } from 'react-router-dom';
import { ArrowRight, Search, MapPin, CheckCircle2, Truck } from 'lucide-react';

const STATS = [
  { value: '500+', label: 'Deliveries completed' },
  { value: '4', label: 'Vehicle classes' },
  { value: '8', label: 'Counties covered' },
  { value: '2 min', label: 'To request a pickup' },
];

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section
      className="relative bg-white overflow-hidden"
      style={{
        backgroundImage:
          'radial-gradient(circle, rgba(0,0,0,0.04) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }}
    >
      {/* Ambient glow */}
      <div className="absolute -top-32 -left-32 w-125 h-125 bg-orange-400/12 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-100 h-100 bg-orange-400/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 pt-14 pb-24 md:pt-16 md:pb-32 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* ── Left: Copy ── */}
        <div>
    

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl font-extrabold leading-[1.05] tracking-tight mb-6 text-slate-900">
            Move Cargo
            <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-orange-500 to-orange-600">
              Across Kenya.
            </span>
            <br />
            Fast.
          </h1>

          {/* Subtext */}
          <p className="text-slate-500 text-lg leading-relaxed mb-10 max-w-lg">
            Verified drivers, real-time tracking, and the right vehicle for every load —
            from a mini van to a 30-tonne semi-trailer. No account needed.
          </p>

          {/* Trust signals */}
          <ul className="flex flex-col gap-2.5 mb-10">
            {[
              'Nairobi · Mombasa · Kisumu · Eldoret & more',
              'Mini van to semi-trailer — we match your load',
              'Track your shipment with a single ID',
            ].map((t) => (
              <li key={t} className="flex items-center gap-2.5 text-sm text-slate-600">
                <CheckCircle2 size={15} className="text-orange-500 shrink-0" />
                {t}
              </li>
            ))}
          </ul>

          {/* CTAs */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/quote')}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white px-7 py-3.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-orange-200 hover:shadow-orange-300"
            >
              Request a Delivery
              <ArrowRight size={17} />
            </button>
            <button
              onClick={() => navigate('/track')}
              className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 px-7 py-3.5 rounded-xl font-semibold text-sm transition-all"
            >
              <Search size={16} />
              Track Shipment
            </button>
          </div>
        </div>

        {/* ── Right: Shipment card mockup ── */}
        <div className="hidden lg:flex justify-center items-center">
          <div className="relative w-full max-w-sm">

            {/* Card — kept dark for contrast */}
            <div className="bg-slate-900 border border-slate-700/60 rounded-2xl p-6 shadow-2xl shadow-slate-900/20 ring-1 ring-slate-900/5">

              {/* Card header */}
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-0.5">Active Shipment</p>
                  <p className="text-white font-bold text-sm font-mono">SH-2026-00847</p>
                </div>
                <span className="flex items-center gap-1.5 bg-emerald-500/15 text-emerald-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  In Transit
                </span>
              </div>

              {/* Route */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-2.5 h-2.5 rounded-full bg-orange-400 ring-2 ring-orange-400/30" />
                  <div className="w-px h-10 bg-linear-to-b from-orange-400/60 to-slate-600" />
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-600 ring-2 ring-slate-500/30" />
                </div>
                <div className="flex flex-col justify-between h-full gap-5">
                  <div>
                    <p className="text-white text-sm font-semibold">Nairobi, CBD</p>
                    <p className="text-slate-500 text-xs">Picked up · 08:40</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm font-semibold">Mombasa, Kilindini</p>
                    <p className="text-slate-500 text-xs">Est. arrival · 16:30</p>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-5">
                <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                  <span>Progress</span>
                  <span className="text-orange-400 font-medium">68%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full w-[68%] bg-linear-to-r from-orange-500 to-orange-400 rounded-full" />
                </div>
              </div>

              {/* Driver */}
              <div className="flex items-center gap-3 bg-slate-800/60 rounded-xl px-3.5 py-3 border border-slate-700/40">
                <div className="w-9 h-9 bg-slate-700 rounded-lg flex items-center justify-center shrink-0">
                  <Truck size={16} className="text-orange-400" />
                </div>
                <div className="min-w-0">
                  <p className="text-white text-sm font-semibold truncate">James Mwangi</p>
                  <p className="text-slate-500 text-xs">3-Ton Truck · KBZ 421G</p>
                </div>
                <MapPin size={15} className="text-slate-500 ml-auto shrink-0" />
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -top-4 -right-4 bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-orange-200">
              Real-time tracking
            </div>
          </div>
        </div>
      </div>

      {/* ── Stat bar ── */}
      <div className="border-t border-slate-100 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 py-5 grid grid-cols-2 md:grid-cols-4 divide-x divide-slate-200">
          {STATS.map(({ value, label }) => (
            <div key={label} className="px-6 first:pl-0 last:pr-0 flex flex-col items-center text-center">
              <p className="text-slate-900 font-extrabold text-xl md:text-2xl tabular-nums">{value}</p>
              <p className="text-slate-500 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
