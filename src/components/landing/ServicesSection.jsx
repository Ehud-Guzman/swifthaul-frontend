import { Package, Truck, ShieldCheck, Clock } from 'lucide-react';

const SERVICES = [
  { icon: Package, label: 'General Cargo', desc: 'Everyday goods, furniture, electronics — handled with care.' },
  { icon: Truck, label: 'Heavy Equipment', desc: 'Machinery and oversized loads moved safely across Kenya.' },
  { icon: ShieldCheck, label: 'Fragile & Perishable', desc: 'Temperature-sensitive or delicate items get dedicated handling.' },
  { icon: Clock, label: 'Same-Day Dispatch', desc: 'Urgent cargo? We assign and dispatch within hours.' },
];

const ServicesSection = () => (
  <section className="py-20 bg-slate-50">
    <div className="max-w-6xl mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-3">What We Move</h2>
        <p className="text-slate-500 max-w-md mx-auto">Whatever your cargo, we have the right vehicle and driver for the job.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {SERVICES.map(({ icon: Icon, label, desc }) => (
          <div key={label} className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all group">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors">
              <Icon size={22} className="text-orange-500" />
            </div>
            <h3 className="font-semibold mb-2">{label}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ServicesSection;
