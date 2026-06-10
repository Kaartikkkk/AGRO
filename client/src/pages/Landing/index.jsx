import React from 'react';
import Navbar from './sections/Navbar';
import Hero from './sections/Hero';
import Features from './sections/Features';
import HowItWorks from './sections/HowItWorks';
import Testimonials from './sections/Testimonials';
import CTABanner from './sections/CTABanner';
import Footer from './sections/Footer';

const Landing = () => {
  return (
    <div className="min-h-screen bg-white text-[#111827] overflow-x-hidden">
      <Navbar />
      <div id="hero">
        <Hero />
      </div>
      <div id="features">
        <Features />
      </div>
      <div id="how-it-works">
        <HowItWorks />
      </div>
      <div id="testimonials">
        <Testimonials />
      </div>
      <CTABanner />
      <Footer />
    </div>
  );
};

export default Landing;
