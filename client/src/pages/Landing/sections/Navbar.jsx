import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Leaf, Menu, X } from 'lucide-react';
import { useFarm } from '../../../context/FarmContext';
import { useAuth } from '../../../context/AuthContext';

const Navbar = () => {
  const { lang, toggleLanguage } = useFarm();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Testimonials', href: '#testimonials' }
  ];

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 w-full z-50 h-16 transition-all duration-300 flex items-center justify-between px-6 md:px-12 ${
          scrolled 
            ? 'backdrop-blur-lg bg-black/25 border-b border-white/10 shadow-lg' 
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        {/* Left Side: Brand Logo */}
        <a 
          href="#hero" 
          className="flex items-center gap-2 group cursor-pointer"
        >
          <img src="/logo.png" alt="AgroSmart Logo" className="w-8 h-8 object-contain group-hover:scale-105 transition-transform" />
          <span className="text-xl font-bold text-white tracking-wide">AgroSmart</span>
        </a>

        {/* Center Links (Desktop) */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a 
              key={link.name} 
              href={link.href} 
              className="text-white/80 hover:text-white text-sm font-medium transition-colors"
            >
              {link.name}
            </a>
          ))}
        </div>

        {/* Right Side Controls (Desktop) */}
        <div className="hidden md:flex items-center gap-4">
          {/* Language Toggle Pill */}
          <button 
            type="button"
            onClick={toggleLanguage}
            className="flex items-center justify-center px-3 py-1 bg-white/5 hover:bg-white/15 text-white text-xs font-semibold rounded-full border border-white/10 transition-colors cursor-pointer select-none"
          >
            {lang === 'en' ? 'EN | हिं' : 'हिं | EN'}
          </button>
          
          {isAuthenticated ? (
            <button 
              type="button"
              onClick={() => navigate('/dashboard')}
              className="bg-[#22c55e] text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-[#16a34a] transition-all cursor-pointer shadow-md active:scale-95"
            >
              Go to Dashboard
            </button>
          ) : (
            <>
              {/* Login Button */}
              <button 
                type="button"
                onClick={() => navigate('/login')}
                className="bg-white/5 border border-white/20 text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-white/15 transition-all cursor-pointer active:scale-95"
              >
                Login
              </button>

              {/* Get Started Button */}
              <button 
                type="button"
                onClick={() => navigate('/register')}
                className="bg-[#22c55e] text-white rounded-full px-5 py-2 text-sm font-semibold hover:bg-[#16a34a] transition-all cursor-pointer shadow-md active:scale-95"
              >
                Get Started
              </button>
            </>
          )}
        </div>

        {/* Hamburger Menu (Mobile) */}
        <div className="md:hidden flex items-center gap-3">
          <button 
            type="button"
            onClick={toggleLanguage}
            className="px-2.5 py-1 bg-white/10 text-white text-xs font-semibold rounded-full border border-white/10"
          >
            {lang === 'en' ? 'हिं' : 'EN'}
          </button>
          <button 
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white hover:text-white/80 transition-colors p-1"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Slide-down Mobile Menu Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="fixed top-16 left-0 w-full z-45 bg-[#1a3c2e]/95 backdrop-blur-lg border-b border-white/10 flex flex-col p-6 md:hidden space-y-5 shadow-2xl"
          >
            {navLinks.map((link) => (
              <a 
                key={link.name} 
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-white/90 hover:text-white text-base font-semibold py-1 transition-colors border-b border-white/5"
              >
                {link.name}
              </a>
            ))}

            <div className="flex flex-col gap-3 pt-2">
              {isAuthenticated ? (
                <button 
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/dashboard');
                  }}
                  className="w-full text-center bg-[#22c55e] text-white rounded-full py-2.5 text-sm font-semibold hover:bg-[#16a34a] transition-all shadow-md"
                >
                  Go to Dashboard
                </button>
              ) : (
                <>
                  <button 
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/login');
                    }}
                    className="w-full text-center bg-white/10 border border-white/30 text-white rounded-full py-2.5 text-sm font-semibold hover:bg-white/20 transition-all"
                  >
                    Login
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      navigate('/register');
                    }}
                    className="w-full text-center bg-[#22c55e] text-white rounded-full py-2.5 text-sm font-semibold hover:bg-[#16a34a] transition-all shadow-md"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
