import Hero from '../components/landing/Hero';
import WhatYouLearn from '../components/landing/WhatYouLearn';
import Testimonials from '../components/landing/Testimonials';
import Pricing from '../components/landing/Pricing';
import Footer from '../components/shared/Footer';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      <Hero />
      <WhatYouLearn />
      <Testimonials />
      <Pricing />
      <Footer />
    </div>
  );
};

export default LandingPage;
