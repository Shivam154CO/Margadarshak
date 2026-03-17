import { useState, useCallback } from 'react';
import type { College } from '../../../types/college';

const getBranchFullName = (branchName: string) => {
  const branch = (branchName || "").toUpperCase();
  if (branch.includes("CSE") || branch.includes("COMPUTER")) return "Computer Science and Engineering";
  if (branch.includes("IT")) return "Information Technology";
  if (branch.includes("ECE")) return "Electronics and Communication Engineering";
  if (branch.includes("EEE")) return "Electrical and Electronics Engineering";
  if (branch.includes("MECH")) return "Mechanical Engineering";
  if (branch.includes("CIVIL")) return "Civil Engineering";
  if (branch.includes("E&TC")) return "Electronics and Telecommunication";
  if (branch.includes("AIDS") || branch.includes("AI&DS")) return "Artificial Intelligence and Data Science";
  if (branch.includes("AI&ML") || branch.includes("AIML")) return "Artificial Intelligence and Machine Learning";
  if (branch.includes("CS")) return "Computer Science";
  return branchName || "Engineering";
};

const getAIResponse = (message: string, college: College): string => {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('admission') || lowerMessage.includes('apply') || lowerMessage.includes('eligibility')) {
    return `For admission to ${college.college_name}, you need to meet the following criteria:
• Minimum cutoff rank: ${college.cutoff_rank || 'Check official website'}
• Category: ${college.category || 'GOPEN'}
• Degree: ${college.degree_type || 'Engineering'}
• Duration: ${college.duration_years || 4} years

The admission process typically involves:
1. Online application through DTE Maharashtra
2. Document verification
3. Merit-based seat allocation
4. Fee payment and confirmation`;
  }

  if (lowerMessage.includes('fee') || lowerMessage.includes('cost') || lowerMessage.includes('tuition') || lowerMessage.includes('payment')) {
    return `Fee structure for ${college.college_name}:
• Tuition Fee: ₹${college.fees?.toLocaleString() || 'Contact college'}
• Hostel Fee: ₹${college.hostel_fees?.toLocaleString() || 'Not available'}
• Bus Fee: ₹${college.bus_fees?.toLocaleString() || 'Not available'}

Total annual fees: ₹${(college.fees || 0) + (college.hostel_fees || 0) + (college.bus_fees || 0)} approximately.`;
  }

  if (lowerMessage.includes('placement') || lowerMessage.includes('job') || lowerMessage.includes('salary') || lowerMessage.includes('package')) {
    return `Placement statistics for ${college.college_name}:
• Placement Rate: ${college.placement_rate || 0}%
• Average Package: ₹${college.average_package_lpa || 0} LPA
• Highest Package: ₹${college.highest_package_lpa || 0} LPA
• Top Recruiters include: ${college.top_recruiters || 'Various companies'}`;
  }

  if (lowerMessage.includes('infrastructure') || lowerMessage.includes('facility') || lowerMessage.includes('campus') || lowerMessage.includes('lab')) {
    return `Campus facilities at ${college.college_name}:
• laboratories: ${college.labs_count || 'Multiple'} specialized labs
• WiFi Campus: ${college.wifi_campus || 'Available'}
• Transport: ${college.transport_facility || 'Available'}
• Library: ${college.library_books?.toLocaleString() || 'Well-stocked'} books`;
  }

  return `I'm here to help you with information about ${college.college_name}. You can ask me about:
• Admission process and eligibility
• Fee structure and scholarships
• Placement statistics and careers
• Campus infrastructure and facilities`;
};

export function useCollegeAIChat(college: College) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { 
        role: 'assistant', 
        content: `Hi! I'm your AI assistant for ${college.college_name || 'this college'}. I can help you with information about admissions, fees, placements, courses, and more.` 
    }
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  const sendMessage = useCallback((e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isThinking) return;

    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsThinking(true);

    setTimeout(() => {
      const response = getAIResponse(userMsg, college);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      setIsThinking(false);
    }, 1000);
  }, [input, isThinking, college]);

  return {
    isOpen,
    setIsOpen,
    messages,
    input,
    setInput,
    sendMessage,
    isThinking
  };
}
