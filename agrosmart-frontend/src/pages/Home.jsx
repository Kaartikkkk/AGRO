import React from 'react';
import HeroSection from '../components/landing/HeroSection';
import FeaturesSection from '../components/landing/FeaturesSection';
import { useFarm } from '../context/FarmContext';
import { motion } from 'framer-motion';
import { 
  ChevronRight, 
  MapPin, 
  Phone, 
  Mail, 
  Share2, 
  Globe, 
  Camera, 
  Languages 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { lang, toggleLanguage, t } = useFarm();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Navigation Overlay */}
      <nav className="fixed top-0 left-0 w-full z-50 p-6 flex justify-between items-center transition-all duration-300">
        <div className="flex items-center gap-2 glass px-4 py-2 rounded-full border-deep-green/30">
          <span className="text-2xl">🌾</span>
          <span className="text-2xl font-bold text-deep-green">AgroSmart</span>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleLanguage}
            className="glass p-2 px-4 rounded-full text-deep-green font-semibold flex items-center gap-2 hover:bg-white/40 transition-colors"
          >
            <Languages size={20} />
            <span>{lang === 'en' ? 'Hindi' : 'English'}</span>
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="btn-primary"
          >
            {t('login')}
          </button>
        </div>
      </nav>

      {/* Pages Content */}
      <main>
        <HeroSection />
        <FeaturesSection />

        {/* How It Works Section */}
        <section className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-800 mb-16">
              How It Works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
              <Step 
                num="1" 
                title="Input Farm Data" 
                desc="Enter your farm's location, crop types, and soil data for personalized monitoring."
              />
              <Step 
                num="2" 
                title="System Analyzes" 
                desc="Our AI system analyzes real-time weather and market data to generate insights."
                delay={0.2}
              />
              <Step 
                num="3" 
                title="Get Recommendations" 
                desc="Receive smart irrigation, fertilization, and harvesting alerts directly on your phone."
                delay={0.4}
              />
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 px-6">
          <div className="max-w-5xl mx-auto rounded-[32px] overflow-hidden relative bg-deep-green p-12 text-center text-white">
            <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />
            <motion.h2 
              initial={{ scale: 0.9 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold mb-6 relative z-10"
            >
              Ready to modernize your farm?
            </motion.h2>
            <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto relative z-10">
              Join thousands of smart farmers who use AgroSmart to optimize their harvest and increase profits.
            </p>
            <button 
              onClick={() => navigate('/signup')}
              className="bg-wheat-yellow text-soil-brown px-10 py-4 rounded-2xl font-bold text-xl hover:scale-105 transition-transform relative z-10 shadow-xl"
            >
              Sign Up Now 🚀
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-soil-brown text-white py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <h3 className="text-3xl font-bold mb-6 flex items-center gap-2">
              <span>🌾</span> AgroSmart
            </h3>
            <p className="text-white/60 leading-relaxed mb-8">
              Empowering global agriculture with data-driven intelligence. From soil to market, we are your partner in growth.
            </p>
            <div className="flex gap-4">
              <SocialLink icon={Share2} />
              <SocialLink icon={Globe} />
              <SocialLink icon={Camera} />
            </div>
          </div>
          <div>
            <h4 className="text-xl font-bold mb-6">Quick Links</h4>
            <ul className="space-y-4 text-white/70">
              <li><a href="#" className="hover:text-wheat-yellow">Home</a></li>
              <li><a href="#" className="hover:text-wheat-yellow">Features</a></li>
              <li><a href="#" className="hover:text-wheat-yellow">Pricing</a></li>
              <li><a href="#" className="hover:text-wheat-yellow">About Us</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xl font-bold mb-6">Support</h4>
            <ul className="space-y-4 text-white/70">
              <li><a href="#" className="hover:text-wheat-yellow">Help Center</a></li>
              <li><a href="#" className="hover:text-wheat-yellow">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-wheat-yellow">Terms of Service</a></li>
              <li><a href="#" className="hover:text-wheat-yellow">Contact Us</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xl font-bold mb-6">Connect</h4>
            <ul className="space-y-4 text-white/70">
              <li className="flex items-center gap-3">
                <MapPin size={20} className="text-wheat-yellow" />
                <span>Punjab, India</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={20} className="text-wheat-yellow" />
                <span>+91 98765-43210</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={20} className="text-wheat-yellow" />
                <span>support@agrosmart.com</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/10 text-center text-white/40">
          <p>© 2026 AgroSmart Technologies. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

const Step = ({ num, title, desc, delay = 0 }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
    className="flex flex-col items-center text-center group"
  >
    <div className="w-16 h-16 rounded-full bg-wheat-yellow text-soil-brown text-2xl font-black flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      {num}
    </div>
    <h4 className="text-2xl font-bold text-gray-800 mb-4">{title}</h4>
    <p className="text-gray-500 max-w-xs">{desc}</p>
  </motion.div>
);

const SocialLink = ({ icon: Icon }) => (
  <a href="#" className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-wheat-yellow transition-colors hover:text-soil-brown">
    <Icon size={20} />
  </a>
);

export default Home;
