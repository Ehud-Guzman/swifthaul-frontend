import { useNavigate } from 'react-router-dom';
import { Truck, Search } from 'lucide-react';

const LandingNav = () => {
  const navigate = useNavigate();

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div 
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center shadow-sm shadow-orange-200 group-hover:bg-orange-600 transition-colors">
            <Truck size={18} className="text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900">
            SwiftHaul
          </span>
        </div>

        {/* Section links */}
        <div className="hidden lg:flex items-center gap-1">
          {[
            { label: 'Services', href: '#services' },
            { label: 'Fleet', href: '#fleet' },
            { label: 'How It Works', href: '#how-it-works' },
            { label: 'FAQ', href: '#faq' },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {label}
            </a>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => navigate('/track')}
            className="hidden sm:flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Search size={16} />
            Track
          </button>
          {/* Compact icon-only for mobile, label for desktop */}
          <button
            onClick={() => navigate('/track')}
            className="sm:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Track shipment"
          >
            <Search size={20} />
          </button>

          <button
            onClick={() => navigate('/login')}
            className="text-sm font-medium text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Sign In
          </button>

          <button
            onClick={() => navigate('/quote')}
            className="text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl shadow-sm shadow-orange-200 transition-all"
          >
            Get Quote
          </button>
        </div>
      </div>
    </nav>
  );
};

export default LandingNav;