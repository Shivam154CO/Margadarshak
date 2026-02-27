import type { College } from "../types/college";
import { getBranchFullName } from "./collegeHelpers";

export const getAIResponse = (message: string, college: College): string => {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('admission') || lowerMessage.includes('apply') || lowerMessage.includes('eligibility')) {
        return `For admission to ${college.college_name}, you need to meet the following criteria:
• Minimum cutoff rank: ${college.cutoff_rank || 'Check official website'}
• Category: ${college.category || 'GOPEN'}
• Degree: ${college.branch_code || 'Engineering'}

The admission process typically involves:
1. Online application through DTE Maharashtra
2. Document verification
3. Merit-based seat allocation
4. Fee payment and confirmation.`;
    }

    if (lowerMessage.includes('fee') || lowerMessage.includes('cost') || lowerMessage.includes('tuition')) {
        return `Fee structure for ${college.college_name}:
• Tuition Fee: ₹${college.fees?.toLocaleString() || 'Contact college'}
• Total annual fees depend on the branch and category. Scholarships may be available.`;
    }

    if (lowerMessage.includes('placement') || lowerMessage.includes('job') || lowerMessage.includes('salary') || lowerMessage.includes('package')) {
        const rate = college.placement_rate || 0;
        const avg = college.average_package_lpa || 0;
        const highest = college.highest_package_lpa || 0;
        return `Placement statistics for ${college.college_name}:
• Placement Rate: ${rate}%
• Average Package: ₹${avg} LPA
• Highest Package: ₹${highest} LPA
The college has a dedicated placement cell with many top recruiters.`;
    }

    if (lowerMessage.includes('hostel') || lowerMessage.includes('accommodation')) {
        return `Hostel facilities at ${college.college_name}:
• Available: ${college.hostel_available || 'Check with college'}
Hostels provide security, mess facilities, and common areas.`;
    }

    if (lowerMessage.includes('course') || lowerMessage.includes('branch')) {
        return `${college.college_name} offers:
• Branch: ${getBranchFullName(college.branch_name || '')}
• Available Branches: ${(college.branches || []).length} programs.`;
    }

    return `I'm here to help you with information about ${college.college_name}. You can ask about admissions, fees, placements, hostel facilities, or courses.`;
};
