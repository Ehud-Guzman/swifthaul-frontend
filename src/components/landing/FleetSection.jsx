const VEHICLES = [
  { label: 'Mini Van', cap: 'Up to 500 kg', best: 'Small deliveries, last-mile', img: '/fleet/mini-van.jpeg' },
  { label: '3-Ton Truck', cap: 'Up to 3,000 kg', best: 'Mid-size cargo, inter-city', img: '/fleet/Isuzu-FRR-Truck.jpg' },
  { label: 'Flatbed', cap: 'Up to 8,000 kg', best: 'Heavy machinery, long loads', img: '/fleet/FLATBED-2.jpg' },
  { label: 'Semi Trailer', cap: 'Up to 30,000 kg', best: 'Bulk freight, long-haul', img: '/fleet/platform-semi-trailer.jpg' },
];

const FleetSection = () => (
  <section className="py-20">
    <div className="max-w-6xl mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-3">Our Fleet</h2>
        <p className="text-slate-500">Choose the vehicle that fits your cargo size and budget.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {VEHICLES.map(({ label, cap, best, img }) => (
          <div key={label} className="rounded-2xl border border-slate-200 overflow-hidden hover:border-orange-400 hover:shadow-md transition-all group">
            <div className="h-44 overflow-hidden bg-slate-100">
              <img
                src={img}
                alt={label}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-5">
              <h3 className="font-bold text-base mb-1">{label}</h3>
              <p className="text-orange-600 font-semibold text-sm mb-1">{cap}</p>
              <p className="text-slate-500 text-xs">{best}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FleetSection;
