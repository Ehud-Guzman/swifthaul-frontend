import { useNavigate } from 'react-router-dom';
import { Truck, Phone, MessageCircle, Mail, MapPin, Clock } from 'lucide-react';

const LandingFooter = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand */}
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-sm shadow-orange-900/30">
              <Truck size={16} className="text-white" />
            </div>
            <span className="font-bold text-white text-base tracking-tight">
              SwiftHaul
            </span>
          </div>
          <p className="text-sm leading-relaxed text-slate-500">
            Freight and cargo transport across Kenya — the right vehicle for every
            load, tracked from pickup to delivery.
          </p>
        </div>

        {/* Company */}
        <div>
          <h3 className="text-white text-sm font-semibold mb-4">Company</h3>
          <ul className="space-y-2.5 text-sm">
            {[
              { label: 'Get a Quote', to: '/quote' },
              { label: 'Track Shipment', to: '/track' },
              { label: 'Sign In', to: '/login' },
              { label: 'Create an Account', to: '/register' },
            ].map(({ label, to }) => (
              <li key={label}>
                <button
                  onClick={() => navigate(to)}
                  className="hover:text-white transition-colors"
                >
                  {label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Services */}
        <div>
          <h3 className="text-white text-sm font-semibold mb-4">Services</h3>
          <ul className="space-y-2.5 text-sm">
            {[
              'General Cargo',
              'Heavy Equipment',
              'Fragile & Perishable',
              'Same-Day Dispatch',
            ].map((s) => (
              <li key={s}>
                <a href="#services" className="hover:text-white transition-colors">
                  {s}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-white text-sm font-semibold mb-4">Contact</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <a href="tel:+254700123456" className="flex items-center gap-2.5 hover:text-white transition-colors">
                <Phone size={15} className="text-orange-400 shrink-0" />
                +254 700 123 456
              </a>
            </li>
            <li>
              <a
                href="https://wa.me/254700123456"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 hover:text-white transition-colors"
              >
                <MessageCircle size={15} className="text-orange-400 shrink-0" />
                WhatsApp
              </a>
            </li>
            <li>
              <a href="mailto:hello@swifthaul.co.ke" className="flex items-center gap-2.5 hover:text-white transition-colors">
                <Mail size={15} className="text-orange-400 shrink-0" />
                hello@swifthaul.co.ke
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <MapPin size={15} className="text-orange-400 shrink-0" />
              Nairobi, Kenya
            </li>
            <li className="flex items-center gap-2.5">
              <Clock size={15} className="text-orange-400 shrink-0" />
              Mon – Sat · 7:00 AM – 7:00 PM
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500 text-center md:text-left">
            © {currentYear} SwiftHaul Logistics. All rights reserved.
          </p>
          <p className="text-xs text-slate-500 text-center md:text-right">
            Created &amp; Managed By{' '}
            <a
              href="https://glimmerink.co.ke/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-400 hover:text-orange-400 transition-colors underline-offset-2 hover:underline font-medium"
            >
              GlimmerInk Creations
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
