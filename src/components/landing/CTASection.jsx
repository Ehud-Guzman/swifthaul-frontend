import { useNavigate } from 'react-router-dom';
import { ArrowRight, MapPin, Phone, MessageCircle } from 'lucide-react';

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-orange-500">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Ready to ship?</h2>
        <p className="text-orange-100 mb-8 text-lg">No account needed. Fill out a quick form and we'll handle the rest.</p>
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => navigate('/quote')}
            className="flex items-center gap-2 bg-white text-orange-600 font-bold px-7 py-3.5 rounded-xl hover:bg-orange-50 transition-colors shadow-lg"
          >
            Get a Free Quote <ArrowRight size={18} />
          </button>
          <button
            onClick={() => navigate('/register')}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 border border-orange-400 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors"
          >
            Create an Account
          </button>
        </div>

        {/* Contact channels */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-orange-100 text-sm font-medium">
          <a href="tel:+254700123456" className="flex items-center gap-2 hover:text-white transition-colors">
            <Phone size={15} />
            +254 700 123 456
          </a>
          <a
            href="https://wa.me/254700123456"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 hover:text-white transition-colors"
          >
            <MessageCircle size={15} />
            WhatsApp us
          </a>
          <span className="flex items-center gap-2 text-orange-200">
            <MapPin size={14} />
            Serving Nairobi, Mombasa, Kisumu, Eldoret &amp; more
          </span>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
