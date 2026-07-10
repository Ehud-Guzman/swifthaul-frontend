import LandingNav from '../../components/landing/LandingNav';
import HeroSection from '../../components/landing/HeroSection';
import ServicesSection from '../../components/landing/ServicesSection';
import FleetSection from '../../components/landing/FleetSection';
import TrustSection from '../../components/landing/TrustSection';
import HowItWorksSection from '../../components/landing/HowItWorksSection';
import FAQSection from '../../components/landing/FAQSection';
import CTASection from '../../components/landing/CTASection';
import LandingFooter from '../../components/landing/LandingFooter';

const Landing = () => (
  <div className="min-h-screen bg-white text-slate-800 font-[system-ui]">
    <LandingNav />
    <HeroSection />
    <ServicesSection />
    <FleetSection />
    <TrustSection />
    <HowItWorksSection />
    <FAQSection />
    <CTASection />
    <LandingFooter />
  </div>
);

export default Landing;
