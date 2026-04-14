const STEPS = [
  { n: '01', title: 'Request a Quote', desc: "Fill out our simple form — no account needed. Tell us what you're moving and where." },
  { n: '02', title: 'We Assign a Driver', desc: 'Our team reviews your request and assigns the right vehicle and driver.' },
  { n: '03', title: 'Track Your Shipment', desc: 'Use your tracking ID to follow your cargo in real-time from pickup to delivery.' },
];

const HowItWorksSection = () => (
  <section className="py-20 bg-slate-900 text-white">
    <div className="max-w-6xl mx-auto px-6">
      <div className="text-center mb-14">
        <h2 className="text-3xl font-bold mb-3">How It Works</h2>
        <p className="text-slate-400">Three simple steps from request to delivery.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {STEPS.map(({ n, title, desc }) => (
          <div key={n} className="relative">
            <div className="text-6xl font-black text-orange-500/20 mb-4 leading-none">{n}</div>
            <h3 className="text-lg font-bold mb-2">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorksSection;
