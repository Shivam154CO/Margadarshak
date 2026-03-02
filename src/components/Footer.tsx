import React from 'react';
import {
  Twitter, Linkedin, Github, Youtube,
  ArrowRight, Mail, Phone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import IkigaiLogo from './IkigaiLogo';

const Footer: React.FC = React.memo(() => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();

  const handleNav = (path: string) => {
    if (path === '#' || !path) return;
    navigate(path);
    window.scrollTo(0, 0);
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 mt-auto w-full border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-12">
          {/* Brand & Mission */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center space-x-3 group cursor-pointer" onClick={() => handleNav('/')}>
              <IkigaiLogo size="lg" showText={true} lightText={true} />
            </div>

            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Helping students find their dream engineering colleges using smart data and simple tools. Your journey to the perfect campus starts here.
            </p>

            <div className="flex items-center space-x-3">
              {[Twitter, Linkedin, Github, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white hover:bg-indigo-600 transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Core Navigation */}
          <div className="lg:col-span-2 space-y-5">
            <h4 className="text-white font-bold text-sm tracking-wide">Main Menu</h4>
            <ul className="space-y-3">
              {[
                { name: 'Dashboard', path: '/dashboard' },
                { name: 'College Explorer', path: '/college-explorer' },
                { name: 'College Map', path: '/college-map' },
                { name: 'Compare', path: '/compare-college' }
              ].map((item) => (
                <li key={item.name}>
                  <button onClick={() => handleNav(item.path)} className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* User Links */}
          <div className="lg:col-span-2 space-y-5">
            <h4 className="text-white font-bold text-sm tracking-wide">Account</h4>
            <ul className="space-y-3">
              {[
                { name: 'My Profile', path: '/profile' },
                { name: 'Favorites', path: '/favorites' },
                { name: 'Support', path: '#' },
                { name: 'Contact Us', path: '#' }
              ].map((item) => (
                <li key={item.name}>
                  <button onClick={() => handleNav(item.path)} className="text-sm text-slate-400 hover:text-indigo-400 transition-colors">
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Section */}
          <div className="lg:col-span-4 space-y-6 bg-slate-800/40 p-6 rounded-2xl border border-slate-800">
            <div className="space-y-2">
              <h4 className="text-white font-bold">Stay Updated</h4>
              <p className="text-xs text-slate-400 leading-relaxed">Join our mailing list to receive the latest admission news and campus updates.</p>
            </div>

            <div className="relative">
              <input
                type="email"
                placeholder="Email address"
                className="w-full bg-slate-950 border border-slate-700 rounded-lg py-2.5 pl-4 pr-10 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600"
              />
              <button className="absolute right-2 top-2 bottom-2 w-7 bg-indigo-600 text-white rounded-md flex items-center justify-center hover:bg-indigo-500 transition-colors">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="flex flex-col space-y-2 pt-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-indigo-500/60" /> <span>support@ikigai.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-indigo-500/60" /> <span>+91 90497 10195</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-800/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-600">
            © {currentYear} Ikigai Platform. All rights reserved.
          </p>

          <div className="flex items-center space-x-6 text-xs font-medium text-slate-600">
            <a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Terms of Use</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
