-- ============================================================
-- Ikigai: user_favorites table
-- Run this in your Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.user_favorites (
    id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at  TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL,
    user_id     uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,

    -- Composite key that uniquely identifies a college+branch slot
    college_code        text NOT NULL,
    branch              text NOT NULL,

    -- Snapshot of ML prediction data at the time of saving
    college_name                text,
    city                        text,
    branch_name                 text,
    branch_code                 text,
    fees                        numeric,
    placement_rate              numeric,
    cutoff_rank                 numeric,
    cutoff_percentile           numeric,
    category                    text,
    average_package_lpa         numeric,
    highest_package_lpa         numeric,
    total_intake                integer,
    seats                       integer,
    autonomy_status             text,
    hostel_available            text,
    image                       text,
    logo_url                    text,
    contact_email               text,
    contact_phone               text,
    website_url                 text,
    probability_level           text,
    is_most_probable            boolean DEFAULT false,
    admission_chance            numeric,
    admission_chance_percentage text,
    fit                         text,
    fit_reason                  text,
    match_score                 numeric,
    match_percentage            text,
    display_fees                text,
    display_seats               text,
    display_cutoff              text,
    display_placement           text,

    -- Each user can only save a given college_code + branch once
    UNIQUE (user_id, college_code, branch)
);

-- ── Row Level Security ─────────────────────────────────────────────────────────

ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;

-- Users can see only their own favorites
CREATE POLICY "Users can read own favorites"
    ON public.user_favorites
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Users can insert their own favorites
CREATE POLICY "Users can insert own favorites"
    ON public.user_favorites
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own favorites
CREATE POLICY "Users can delete own favorites"
    ON public.user_favorites
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- ── Index for fast user lookups ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_user_favorites_user_id
    ON public.user_favorites (user_id);
