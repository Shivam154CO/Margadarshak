-- 1. Index for fast college name search
CREATE INDEX IF NOT EXISTS idx_college_name ON colleges_2025 (college_name);

-- 2. Index for fast city search
CREATE INDEX IF NOT EXISTS idx_college_city ON colleges_2025 (city);

-- 3. Index for sorting by fees
CREATE INDEX IF NOT EXISTS idx_college_fees ON colleges_2025 (fees);
