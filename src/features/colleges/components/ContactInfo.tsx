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
  const items = [
    email && email !== 'N/A' && {
      icon: Mail,
      label: 'Email',
      content: (
        <a href={`mailto:${email}`} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
          {email}
        </a>
      ),
    },
    phone && phone !== 'N/A' && {
      icon: Phone,
      label: 'Phone',
      content: (
        <a href={`tel:${phone}`} className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
          {phone}
        </a>
      ),
    },
    {
      icon: MapPin,
      label: 'Address',
      content: (
        <p className="text-sm font-semibold text-slate-700">
          {city}{district ? `, ${district}` : ''}, Maharashtra
        </p>
      ),
    },
    website && website !== 'N/A' && {
      icon: Globe,
      label: 'Website',
      content: (
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          Visit College Website <ExternalLink className="w-3 h-3" />
        </a>
      ),
    },
  ].filter(Boolean) as { icon: any; label: string; content: React.ReactNode }[];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100">
        <div className="w-8 h-8 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center justify-center">
          <MapPin className="w-4 h-4 text-indigo-500" />
        </div>
        <h3 className="text-base font-bold text-slate-800">Contact Information</h3>
      </div>

      <div className="divide-y divide-slate-100">
        {items.map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} className="flex items-start gap-4 px-6 py-3.5 hover:bg-slate-50 transition-colors">
              <div className="mt-0.5 w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{item.label}</p>
                {item.content}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
