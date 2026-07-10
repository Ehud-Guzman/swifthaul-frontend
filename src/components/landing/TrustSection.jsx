import { ShieldCheck, UserCheck, Timer, PhoneCall, Quote } from 'lucide-react';

const GUARANTEES = [
  { icon: ShieldCheck, title: 'Goods-in-transit cover', desc: 'Every shipment is covered from pickup to delivery.' },
  { icon: UserCheck, title: 'Verified drivers', desc: 'Every driver is vetted, licensed and background-checked.' },
  { icon: Timer, title: '98% on-time delivery', desc: 'Delivered within the promised window, tracked end to end.' },
  { icon: PhoneCall, title: 'Real human support', desc: 'Talk to our dispatch team seven days a week.' },
];

const TESTIMONIALS = [
  {
    quote: 'Moved our entire warehouse stock from Industrial Area to Mombasa in one day. The tracking link kept the whole team calm.',
    name: 'Grace Wanjiru',
    role: 'Operations Lead, Duka Bora Traders',
  },
  {
    quote: "We ship fresh produce weekly and timing is everything. SwiftHaul's drivers arrive on time, every time.",
    name: 'Peter Otieno',
    role: 'Kisumu Fresh Exports',
  },
  {
    quote: 'Booked a flatbed for a generator at 8am — it was on site in Nakuru by evening. No calls, no chasing.',
    name: 'Amina Hassan',
    role: 'Site Manager, Jenga Construction',
  },
];

const TrustSection = () => (
  <section className="py-20 bg-white">
    <div className="max-w-6xl mx-auto px-6">

      {/* Guarantees */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-3">Your Cargo Is in Safe Hands</h2>
        <p className="text-slate-500 max-w-md mx-auto">The guarantees behind every shipment we move.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {GUARANTEES.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="flex flex-col items-center text-center px-4">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-4">
              <Icon size={22} className="text-orange-500" />
            </div>
            <h3 className="font-semibold mb-1.5">{title}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* Testimonials */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {TESTIMONIALS.map(({ quote, name, role }) => (
          <figure key={name} className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
            <Quote size={18} className="text-orange-400 mb-3" />
            <blockquote className="text-sm text-slate-600 leading-relaxed mb-4">
              &ldquo;{quote}&rdquo;
            </blockquote>
            <figcaption>
              <p className="text-sm font-semibold text-slate-900">{name}</p>
              <p className="text-xs text-slate-500">{role}</p>
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  </section>
);

export default TrustSection;
