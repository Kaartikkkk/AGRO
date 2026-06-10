import React from 'react';
import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';

const TwitterIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const InstagramIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const LinkedinIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

const YoutubeIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);

const Footer = () => {
  const platformLinks = [
    { name: 'Dashboard', href: '#' },
    { name: 'Land Management', href: '#' },
    { name: 'Weather Forecast', href: '#' },
    { name: 'Mandi Prices', href: '#' },
    { name: 'Disease Detection', href: '#' },
    { name: 'Fertilizer Hub', href: '#' }
  ];

  const companyLinks = [
    { name: 'About Us', href: '#' },
    { name: 'Blog', href: '#' },
    { name: 'Careers', href: '#' },
    { name: 'Press', href: '#' },
    { name: 'Contact Us', href: '#' }
  ];

  const supportLinks = [
    { name: 'Help Center', href: '#' },
    { name: 'Documentation', href: '#' },
    { name: 'Privacy Policy', href: '#' },
    { name: 'Terms of Service', href: '#' },
    { name: 'Cookie Policy', href: '#' }
  ];

  const socialLinks = [
    { icon: TwitterIcon, href: '#' },
    { icon: InstagramIcon, href: '#' },
    { icon: LinkedinIcon, href: '#' },
    { icon: YoutubeIcon, href: '#' }
  ];

  return (
    <motion.footer 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-[#0f1f17] text-white pt-16 pb-8 px-6 select-none font-sans"
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
        
        {/* Column 1: Brand details & social links */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Leaf size={24} className="text-[#22c55e]" />
            <span className="text-xl font-bold tracking-wide">AgroSmart</span>
          </div>
          <p className="text-white/50 text-sm leading-relaxed max-w-xs font-normal">
            Making Indian farming smarter with the power of AI. From fields to market forecasts, we grow together.
          </p>
          <div className="flex gap-3 pt-2">
            {socialLinks.map((social, idx) => (
              <a
                key={idx}
                href={social.href}
                className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-white/60 hover:bg-[#22c55e] hover:text-white transition-all duration-200"
              >
                <social.icon size={16} />
              </a>
            ))}
          </div>
        </div>

        {/* Column 2: Platform Links */}
        <div>
          <h4 className="font-semibold text-white mb-4 tracking-wide uppercase text-xs text-white/95">Platform</h4>
          <ul className="space-y-2.5">
            {platformLinks.map((link) => (
              <li key={link.name}>
                <a 
                  href={link.href} 
                  className="text-white/50 hover:text-white text-sm font-medium transition-colors"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 3: Company Links */}
        <div>
          <h4 className="font-semibold text-white mb-4 tracking-wide uppercase text-xs text-white/95">Company</h4>
          <ul className="space-y-2.5">
            {companyLinks.map((link) => (
              <li key={link.name}>
                <a 
                  href={link.href} 
                  className="text-white/50 hover:text-white text-sm font-medium transition-colors"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Column 4: Support Links */}
        <div>
          <h4 className="font-semibold text-white mb-4 tracking-wide uppercase text-xs text-white/95">Support</h4>
          <ul className="space-y-2.5">
            {supportLinks.map((link) => (
              <li key={link.name}>
                <a 
                  href={link.href} 
                  className="text-[#ffffff80] hover:text-white text-sm font-medium transition-colors"
                >
                  {link.name}
                </a>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Horizontal Divider Line */}
      <div className="max-w-6xl mx-auto border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-center select-none pointer-events-none">
        
        {/* Left Side: Copyright */}
        <span className="text-white/40 text-xs font-medium">
          &copy; 2026 AgroSmart. All rights reserved.
        </span>

        {/* Right Side: Credit */}
        <span className="text-white/40 text-xs font-medium">
          Made with ❤️ for Indian Farmers
        </span>

      </div>

    </motion.footer>
  );
};

export default Footer;
