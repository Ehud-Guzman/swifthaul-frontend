import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Search, MapPin, CheckCircle2, Truck, PackageSearch } from 'lucide-react';

const STATS = [
  { value: '500+', label: 'Deliveries completed' },
  { value: '4', label: 'Vehicle classes' },
  { value: '8', label: 'Counties covered' },
  { value: '2 min', label: 'To request a pickup' },
];

const HeroSection = () => {
  const navigate = useNavigate();
  const [trackId, setTrackId] = useState('');

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    const id = trackId.trim();
    navigate(id ? `/track?id=${encodeURIComponent(id)}` : '/track');
  };

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

      <div className="relative max-w-7xl mx-auto px-6 pt-14 pb-16 md:pt-16 md:pb-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

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

          {/* Pricing signal */}
          <p className="mt-5 text-xs text-slate-400">
            Transparent rates by cargo weight and vehicle class — instant estimate, no signup.
          </p>
        </div>

        {/* ── Right: Live route panel with shipment card overlay ── */}
        <div className="hidden lg:block relative">

          {/* Route panel */}
          <div className="relative h-115 rounded-3xl overflow-hidden bg-slate-900 ring-1 ring-slate-800 shadow-2xl shadow-slate-900/30">

            {/* Dot grid */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage: 'radial-gradient(circle, rgba(148,163,184,0.4) 1px, transparent 1px)',
                backgroundSize: '26px 26px',
              }}
            />

            {/* Ambient glows */}
            <div className="absolute -top-24 -right-24 w-80 h-80 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Dashed route: Nairobi → Mombasa */}
            <svg viewBox="0 0 560 460" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
              <path
                d="M 100 75 C 220 85, 280 155, 345 205 S 435 285, 460 340"
                fill="none"
                stroke="#f97316"
                strokeOpacity="0.28"
                strokeWidth="6"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
              <path
                d="M 100 75 C 220 85, 280 155, 345 205 S 435 285, 460 340"
                fill="none"
                stroke="#fb923c"
                strokeWidth="2"
                strokeDasharray="7 9"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            {/* Origin marker */}
            <div className="absolute flex items-center gap-2" style={{ left: 'calc(17.9% - 6px)', top: 'calc(16.3% - 6px)' }}>
              <span className="relative flex w-3 h-3 shrink-0">
                <span className="absolute inline-flex w-full h-full rounded-full bg-orange-400 opacity-40 animate-ping" />
                <span className="relative inline-flex w-3 h-3 rounded-full bg-orange-400 ring-4 ring-orange-400/20" />
              </span>
              <span className="bg-slate-800/90 border border-slate-700 text-slate-200 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap backdrop-blur-sm">
                Nairobi · Picked up
              </span>
            </div>

            {/* Destination marker */}
            <div className="absolute flex flex-row-reverse items-center gap-2" style={{ right: 'calc(17.9% - 6px)', top: 'calc(73.9% - 6px)' }}>
              <span className="relative inline-flex w-3 h-3 shrink-0 rounded-full bg-slate-500 ring-4 ring-slate-500/20" />
              <span className="bg-slate-800/90 border border-slate-700 text-slate-400 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap backdrop-blur-sm">
                Mombasa · ETA 16:30
              </span>
            </div>

            {/* Truck in motion */}
            <div className="absolute" style={{ left: 'calc(69.6% - 18px)', top: 'calc(53.3% - 18px)' }}>
              <span className="absolute inset-0 rounded-xl bg-orange-500/40 animate-ping" />
              <div className="relative w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/40 ring-4 ring-orange-500/20">
                <Truck size={17} className="text-white" />
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute top-4 right-4 bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-orange-900/30">
              Real-time tracking
            </div>
          </div>

          {/* Shipment card — overlaps the panel */}
          <div className="absolute -bottom-8 -left-6 w-full max-w-sm">
            <div className="bg-slate-950 border border-slate-700/70 rounded-2xl p-6 shadow-2xl shadow-slate-950/60 ring-1 ring-white/5">

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
          </div>
        </div>
      </div>

      {/* ── Tracking widget ── */}
      <div className="relative max-w-7xl mx-auto px-6 pb-12">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-lg shadow-slate-900/5 p-4 md:p-5 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
              <PackageSearch size={19} className="text-orange-500" />
            </div>
            <div>
              <p className="font-semibold text-sm text-slate-900">Already shipped with us?</p>
              <p className="text-xs text-slate-500">Track your cargo with the ID from your confirmation.</p>
            </div>
          </div>
          <form onSubmit={handleTrackSubmit} className="flex flex-1 gap-2">
            <input
              type="text"
              value={trackId}
              onChange={(e) => setTrackId(e.target.value)}
              placeholder="Enter tracking ID, e.g. SH-A7K2M9QX"
              className="flex-1 min-w-0 px-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
            />
            <button
              type="submit"
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-colors shrink-0"
            >
              <Search size={15} />
              Track
            </button>
          </form>
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
