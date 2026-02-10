-- Add missing columns to contacts table
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS postal_code TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS source TEXT;
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ;

-- Add is_company_wide to daily_tasks for personal vs company task toggle
ALTER TABLE daily_tasks ADD COLUMN IF NOT EXISTS is_company_wide BOOLEAN NOT NULL DEFAULT false;

-- Create index for better performance on company-wide tasks
CREATE INDEX IF NOT EXISTS idx_daily_tasks_company_wide ON daily_tasks(is_company_wide);
