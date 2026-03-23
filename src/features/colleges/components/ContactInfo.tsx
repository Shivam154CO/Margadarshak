import React from 'react';
import { Mail, Phone, MapPin, Globe, ExternalLink } from 'lucide-react';

interface ContactInfoProps {
  email?: string;
  phone?: string;
  city: string;
  district?: string;
  website?: string;
}

export const ContactInfo: React.FC<ContactInfoProps> = ({
  email,
  phone,
  city,
  district,
  website,
}) => {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-gray-200/50 hover:shadow-lg transition-shadow duration-300">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h3>
      <div className="space-y-4">
        {email && email !== "N/A" && (
          <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-xl border border-blue-200/50 hover:border-blue-300 transition-colors group">
            <Mail className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <a href={`mailto:${email}`} className="font-medium text-blue-700 hover:text-blue-800 transition-colors">
                {email}
              </a>
            </div>
          </div>
        )}

        {phone && phone !== "N/A" && (
          <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-emerald-50 to-emerald-100/50 rounded-xl border border-emerald-200/50 hover:border-emerald-300 transition-colors group">
            <Phone className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <a href={`tel:${phone}`} className="font-medium text-emerald-700 hover:text-emerald-800 transition-colors">
                {phone}
              </a>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-amber-50 to-amber-100/50 rounded-xl border border-amber-200/50 hover:border-amber-300 transition-colors group">
          <MapPin className="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform" />
          <div>
            <p className="text-sm text-gray-600">Address</p>
            <p className="font-medium text-amber-700">{city}, {district || "Maharashtra"}, India</p>
          </div>
        </div>

        {website && website !== "N/A" && (
          <div className="flex items-center space-x-3 p-4 bg-gradient-to-r from-purple-50 to-purple-100/50 rounded-xl border border-purple-200/50 hover:border-purple-300 transition-colors group">
            <Globe className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" />
            <div>
              <p className="text-sm text-gray-600">Website</p>
              <a
                href={website}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-purple-700 hover:text-purple-800 transition-colors flex items-center"
              >
                Visit College Website
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
