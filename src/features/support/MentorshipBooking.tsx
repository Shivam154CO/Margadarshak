import { useState } from "react";
import { Calendar, Clock, Video, User } from "lucide-react";
import SEO from "../../components/SEO";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

export default function MentorshipBooking() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [isBooking, setIsBooking] = useState(false);

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime) return alert("Please select a date and time");
    
    try {
      setIsBooking(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        alert("Please login first");
        navigate("/login");
        return;
      }

      const { error } = await supabase.from('mentorship_bookings').insert({
        user_id: session.user.id,
        booking_date: selectedDate,
        booking_time: selectedTime,
        status: 'pending',
        meeting_link: 'Pending Generation'
      });

      if (error) {
        alert(`Database Error: ${error.message}. (Ensure 'mentorship_bookings' table exists)`);
        console.error(error);
      } else {
        alert("Counseling session officially booked! Admin will review and provide a Google Meet link.");
        setSelectedDate("");
        setSelectedTime("");
        navigate("/dashboard");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans pt-24 pb-20 px-4">
      <SEO title="Book Counseling | SmartCF" description="Book a 1-on-1 counseling session with our admission experts." />
      
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">Expert <span className="text-rose-600">Guidance.</span></h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">Book a 45-minute 1-on-1 Google Meet session with ex-DTE counselors.</p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 md:p-12 border border-slate-200 dark:border-white/10 shadow-xl grid md:grid-cols-2 gap-12">
          {/* Booking Info */}
          <div className="space-y-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                <Video className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Google Meet Session</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">A private video link will be emailed to you instantly after admin confirmation.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Profile Review</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">We will review your uploaded scorecard before the session begins.</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"><Calendar className="w-4 h-4" /> Pick a Date</label>
              <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 p-4 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-rose-500 outline-none transition" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2"><Clock className="w-4 h-4" /> Pick a Time</label>
              <select value={selectedTime} onChange={e => setSelectedTime(e.target.value)} className="w-full bg-slate-50 dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 p-4 rounded-xl text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-rose-500 outline-none transition appearance-none">
                <option value="">Select slot...</option>
                <option value="10:00">10:00 AM IST</option>
                <option value="14:00">02:00 PM IST</option>
                <option value="18:00">06:00 PM IST</option>
              </select>
            </div>

            <button onClick={handleBooking} disabled={isBooking} className="w-full py-4 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-sm tracking-widest uppercase hover:scale-[1.02] transition transform shadow-lg disabled:opacity-50">
              {isBooking ? 'Processing...' : 'Confirm Request'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
