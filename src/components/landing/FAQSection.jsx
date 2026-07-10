import { ChevronDown, MapPin } from 'lucide-react';

const FAQS = [
  {
    q: 'How is the price calculated?',
    a: 'Pricing is based on your cargo weight and the vehicle class it needs. You get an instant estimate before you confirm — no hidden fees, and the final price is confirmed when your driver is assigned.',
  },
  {
    q: 'Do I need an account to ship?',
    a: 'No. Request a quote as a guest and you’ll receive a tracking ID to follow your shipment. An account is only useful if you ship often and want history, saved details and faster rebooking.',
  },
  {
    q: 'Is my cargo insured?',
    a: 'Yes — every shipment carries goods-in-transit cover from pickup to delivery, whatever the vehicle class.',
  },
  {
    q: 'How fast can you dispatch?',
    a: 'Same-day dispatch is available for urgent requests — our team typically assigns a vehicle and driver within hours during business hours.',
  },
  {
    q: 'How do I pay?',
    a: 'M-Pesa, bank transfer, or cash on delivery for approved business clients. You only pay the price you were quoted.',
  },
];

const COUNTIES = ['Nairobi', 'Mombasa', 'Kisumu', 'Eldoret', 'Nakuru', 'Thika', 'Naivasha', 'Machakos'];

const FAQSection = () => (
  <section id="faq" className="py-20 bg-slate-50 scroll-mt-16">
    <div className="max-w-3xl mx-auto px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-3">Frequently Asked Questions</h2>
        <p className="text-slate-500">Everything you need to know before your first shipment.</p>
      </div>

      <div className="space-y-3 mb-14">
        {FAQS.map(({ q, a }) => (
          <details
            key={q}
            className="group bg-white rounded-2xl border border-slate-200 open:border-orange-300 open:shadow-sm transition-all"
          >
            <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-6 py-4 font-semibold text-sm text-slate-800 [&::-webkit-details-marker]:hidden">
              {q}
              <ChevronDown size={16} className="text-slate-400 shrink-0 transition-transform group-open:rotate-180" />
            </summary>
            <p className="px-6 pb-5 text-sm text-slate-500 leading-relaxed">{a}</p>
          </details>
        ))}
      </div>

      {/* Coverage */}
      <div className="text-center">
        <p className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-700 mb-4">
          <MapPin size={15} className="text-orange-500" />
          Where we operate
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          {COUNTIES.map((c) => (
            <span
              key={c}
              className="bg-white border border-slate-200 text-slate-600 text-xs font-medium px-3.5 py-1.5 rounded-full"
            >
              {c}
            </span>
          ))}
          <span className="bg-orange-50 border border-orange-200 text-orange-600 text-xs font-medium px-3.5 py-1.5 rounded-full">
            + more on request
          </span>
        </div>
      </div>
    </div>
  </section>
);

export default FAQSection;
