import LandingNav from '../../components/landing/LandingNav';
import HeroSection from '../../components/landing/HeroSection';
import ServicesSection from '../../components/landing/ServicesSection';
import FleetSection from '../../components/landing/FleetSection';
import HowItWorksSection from '../../components/landing/HowItWorksSection';
import CTASection from '../../components/landing/CTASection';
import LandingFooter from '../../components/landing/LandingFooter';

const Landing = () => (
  <div className="min-h-screen bg-white text-slate-800 font-[system-ui]">
    <LandingNav />
    <HeroSection />
    <ServicesSection />
    <FleetSection />
    <HowItWorksSection />
    <CTASection />
    <LandingFooter />
  </div>
);

export default Landing;
