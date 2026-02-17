import React from 'react';
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react';

const Footer: React.FC = React.memo(() => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-16 mt-auto w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                <div className="text-white font-bold text-xl">I</div>
              </div>
              <div>
                <div className="text-xl font-bold">Ikigai</div>
                <div className="text-xs text-gray-400">AI-Powered Admissions Predictor</div>
              </div>
            </div>
            <p className="text-gray-400 mb-6">
              Data-driven engineering admission predictions and analytics platform
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Phone className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <MapPin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <div className="font-bold text-lg mb-6">Features</div>
            <ul className="space-y-3 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">AI Predictions</a></li>
              <li><a href="#" className="hover:text-white transition-colors">College Analytics</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Interactive Maps</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Comparison Tools</a></li>
            </ul>
          </div>

          <div>
            <div className="font-bold text-lg mb-6">Resources</div>
            <ul className="space-y-3 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Admission Guide</a></li>
              <li><a href="#" className="hover:text-white transition-colors">College Rankings</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Career Insights</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
            </ul>
          </div>

          <div>
            <div className="font-bold text-lg mb-6">Support</div>
            <ul className="space-y-3 text-gray-400">
              <li><a href="mailto:support@ikigai.edu" className="hover:text-white transition-colors">support@ikigai.edu</a></li>
              <li><a href="tel:+919876543210" className="hover:text-white transition-colors">+91 98765 43210</a></li>
              <li className="text-gray-400">Mumbai • Delhi • Bangalore</li>
              <li><a href="#" className="text-blue-400 hover:text-blue-300 transition-colors inline-flex items-center">
                Help Center <ExternalLink className="w-4 h-4 ml-1" />
              </a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} Ikigai. Engineering admission intelligence platform.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
