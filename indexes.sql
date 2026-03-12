-- 1. Index for fast college name search
CREATE INDEX IF NOT EXISTS idx_college_name ON colleges_2025 (college_name);

-- 2. Index for fast city search
CREATE INDEX IF NOT EXISTS idx_college_city ON colleges_2025 (city);

-- 3. Index for sorting by fees
CREATE INDEX IF NOT EXISTS idx_college_fees ON colleges_2025 (fees);

-- 4. Index for exact college matching (ML lookup)
CREATE INDEX IF NOT EXISTS idx_college_code ON colleges_2025 (college_code);

-- 5. Index for branch matching (ML filter)
CREATE INDEX IF NOT EXISTS idx_branch_name ON colleges_2025 (branch_name);

-- 6. Index for category matching (ML strict filter)
CREATE INDEX IF NOT EXISTS idx_category ON colleges_2025 (category);

-- 7. Index for cutoff rank calculations
CREATE INDEX IF NOT EXISTS idx_cutoff_rank ON colleges_2025 (cutoff_rank);

-- 8. Composite index for the most common lookup combination
CREATE INDEX IF NOT EXISTS idx_college_code_branch ON colleges_2025 (college_code, branch_name);
