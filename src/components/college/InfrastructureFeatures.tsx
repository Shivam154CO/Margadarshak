import React from "react";
import { motion } from "framer-motion";
import { Wifi, Home, BookOpen, Car, Library, Newspaper, Globe, School } from "lucide-react";
import type { College } from "../../types/college";

interface InfrastructureFeaturesProps {
    college: College;
}

export const InfrastructureFeatures: React.FC<InfrastructureFeaturesProps> = ({ college }) => {
    const facilities = [
        { icon: Wifi, label: "Campus WiFi", desc: "High-speed 1Gbps connectivity across campus", active: college.wifi_campus !== "No" },
        { icon: Home, label: "Residential", desc: "Modern hostels with laundry & recreation", active: college.hostel_available === "Yes" },
        { icon: BookOpen, label: "E-Library", desc: "Access to 50,000+ digital journals", active: true },
        { icon: Car, label: "Transport", desc: "Inter-city bus service for 15+ routes", active: true },
        { icon: Library, label: "Smart Labs", desc: "NVIDIA powered AI & Compute labs", active: true },
        { icon: Newspaper, label: "Cafeteria", desc: "Multicuisine food court & study zones", active: true },
        { icon: Globe, label: "Innovation Hub", desc: "Platform for startup incubation", active: true },
        { icon: School, label: "Auditorium", desc: "1500+ seating capacity tech hall", active: true },
    ];

    return (
        <div className="space-y-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {facilities.map((f, i) => (
                    <motion.div
                        key={i}
                        whileHover={{ y: -5, scale: 1.02 }}
                        className={`p-8 rounded-[2.5rem] border transition-all ${f.active
                            ? 'bg-white border-slate-100 shadow-xl shadow-slate-200/50'
                            : 'bg-slate-50 border-slate-200 opacity-60 grayscale'
                            }`}
                    >
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${f.active ? 'bg-indigo-600' : 'bg-slate-400'
                            }`}>
                            <f.icon className="w-7 h-7 text-white" />
                        </div>
                        <h4 className="text-xl font-black text-slate-800 mb-2">{f.label}</h4>
                        <p className="text-sm font-medium text-slate-500 leading-relaxed">{f.desc}</p>
                    </motion.div>
                ))}
            </div>

            {/* Campus Stats */}
            <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-purple-900 rounded-[3rem] p-12 text-white shadow-2xl">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                    <div>
                        <div className="text-4xl font-black mb-1">50+</div>
                        <div className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Research Labs</div>
                    </div>
                    <div>
                        <div className="text-4xl font-black mb-1">200+</div>
                        <div className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Expert Faculty</div>
                    </div>
                    <div>
                        <div className="text-4xl font-black mb-1">75+</div>
                        <div className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Student Clubs</div>
                    </div>
                    <div>
                        <div className="text-4xl font-black mb-1">10k+</div>
                        <div className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Student Community</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
