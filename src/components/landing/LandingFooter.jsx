import { useNavigate } from 'react-router-dom';
import { Truck } from 'lucide-react';

const LandingFooter = () => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Main row: logo, nav, copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo + credit */}
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-sm shadow-orange-900/30">
                <Truck size={16} className="text-white" />
              </div>
              <span className="font-bold text-white text-base tracking-tight">
                SwiftHaul
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Designed by{' '}
              <a
                href="https://glimmerink.co.ke"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-orange-400 transition-colors underline-offset-2 hover:underline"
              >
                GlimmerInk
              </a>
            </p>
          </div>

          {/* Quick links */}
          <div className="flex gap-6 text-sm font-medium">
            <button
              onClick={() => navigate('/login')}
              className="text-slate-400 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/quote')}
              className="text-slate-400 hover:text-white transition-colors"
            >
              Get Quote
            </button>
            <button
              onClick={() => navigate('/track')}
              className="text-slate-400 hover:text-white transition-colors"
            >
              Track
            </button>
          </div>

          {/* Copyright */}
          <p className="text-xs text-slate-500 text-center md:text-right">
            © {currentYear} SwiftHaul Logistics. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;