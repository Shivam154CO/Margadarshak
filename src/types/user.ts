export interface UserProfile {
    id: string;
    name: string;
    email: string;
    phone?: string;
    state: string;
    city?: string;
    category: string;
    exam_type: string;
    cet_rank?: string;
    cet_score?: string;
    diploma_rank?: string;
    diploma_score?: string;
    preferred_branches: string[];
    university_preference?: string;
    address?: string;
    profile_complete: boolean;
    created_at?: string;
    updated_at?: string;
}
