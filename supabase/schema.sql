-- Pristine Partners CRM Database Schema
-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
DO $$ BEGIN
  CREATE TYPE owner_type AS ENUM ('alex', 'mikail');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE lead_score_type AS ENUM ('hot', 'warm', 'cold');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE activity_outcome AS ENUM (
    'Answered',
    'No Answer',
    'Voicemail',
    'Not Interested',
    'Callback',
    'Meeting Booked',
    'Left Message',
    'Wrong Number'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE activity_channel AS ENUM ('Phone', 'LinkedIn', 'Email');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE appointment_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  business_name TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  website TEXT,
  linkedin_url TEXT,
  notes TEXT,
  source TEXT,
  last_contacted_at TIMESTAMPTZ,
  lead_score lead_score_type DEFAULT 'cold',
  owner owner_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pipelines table
CREATE TABLE IF NOT EXISTS pipelines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  stages JSONB NOT NULL DEFAULT '[]'::jsonb
);

-- Opportunities table
CREATE TABLE IF NOT EXISTS opportunities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  pipeline_id UUID NOT NULL REFERENCES pipelines(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  opportunity_value DECIMAL(12, 2),
  next_follow_up_date DATE,
  owner owner_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activities table
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  outcome activity_outcome NOT NULL,
  next_action TEXT,
  channel activity_channel NOT NULL,
  notes TEXT,
  logged_by owner_type NOT NULL,
  logged_at TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  contact_id UUID NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  datetime TIMESTAMPTZ NOT NULL,
  location TEXT,
  status appointment_status DEFAULT 'scheduled',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_contacts_owner ON contacts(owner);
CREATE INDEX IF NOT EXISTS idx_contacts_organization ON contacts(organization_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_contact ON opportunities(contact_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_pipeline ON opportunities(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_owner ON opportunities(owner);
CREATE INDEX IF NOT EXISTS idx_opportunities_stage ON opportunities(stage);
CREATE INDEX IF NOT EXISTS idx_opportunities_follow_up ON opportunities(next_follow_up_date);
CREATE INDEX IF NOT EXISTS idx_activities_contact ON activities(contact_id);
CREATE INDEX IF NOT EXISTS idx_activities_opportunity ON activities(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_activities_logged_at ON activities(logged_at);
CREATE INDEX IF NOT EXISTS idx_activities_channel ON activities(channel);
CREATE INDEX IF NOT EXISTS idx_appointments_contact ON appointments(contact_id);
CREATE INDEX IF NOT EXISTS idx_appointments_datetime ON appointments(datetime);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_contacts_lead_score ON contacts(lead_score);
CREATE INDEX IF NOT EXISTS idx_contacts_last_contacted ON contacts(last_contacted_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to opportunities table
DROP TRIGGER IF EXISTS update_opportunities_updated_at ON opportunities;
CREATE TRIGGER update_opportunities_updated_at
  BEFORE UPDATE ON opportunities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE pipelines ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (allow all operations for now)
-- Contacts policies
CREATE POLICY "Allow all operations on contacts for authenticated users" ON contacts
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Pipelines policies
CREATE POLICY "Allow all operations on pipelines for authenticated users" ON pipelines
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Opportunities policies
CREATE POLICY "Allow all operations on opportunities for authenticated users" ON opportunities
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Activities policies
CREATE POLICY "Allow all operations on activities for authenticated users" ON activities
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Appointments policies
CREATE POLICY "Allow all operations on appointments for authenticated users" ON appointments
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================
-- SEED DATA: Insert the 4 pipelines
-- ============================================

INSERT INTO pipelines (name, stages) VALUES
  (
    'Outreach',
    '["New Lead", "Contact Attempted", "Email", "Follow Up 1", "Follow Up 2", "Follow Up 3", "Not Interested"]'::jsonb
  ),
  (
    'LinkedIn',
    '["New Lead", "Follow Up 1", "Follow Up 2", "Follow Up 3", "Lead Nurture Long Term", "Not Interested"]'::jsonb
  ),
  (
    'Sales',
    '["Booked", "Showed", "No Show", "Offer Made", "Won", "Lost"]'::jsonb
  ),
  (
    'Client',
    '["Onboarding", "Live", "Upsell Opportunity", "Retention Risk", "Paused", "Churned"]'::jsonb
  )
ON CONFLICT DO NOTHING;

-- ============================================
-- TRIGGER: Auto-update last_contacted_at when activity is logged
-- ============================================
CREATE OR REPLACE FUNCTION update_contact_last_contacted()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE contacts SET last_contacted_at = NEW.logged_at WHERE id = NEW.contact_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_contact_last_contacted_trigger ON activities;
CREATE TRIGGER update_contact_last_contacted_trigger
  AFTER INSERT ON activities
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_last_contacted();

-- ============================================
-- MIGRATION: Add new columns to existing contacts table (run if upgrading)
-- ============================================
-- ALTER TABLE contacts ADD COLUMN IF NOT EXISTS address TEXT;
-- ALTER TABLE contacts ADD COLUMN IF NOT EXISTS city TEXT;
-- ALTER TABLE contacts ADD COLUMN IF NOT EXISTS postal_code TEXT;
-- ALTER TABLE contacts ADD COLUMN IF NOT EXISTS website TEXT;
-- ALTER TABLE contacts ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
-- ALTER TABLE contacts ADD COLUMN IF NOT EXISTS notes TEXT;
-- ALTER TABLE contacts ADD COLUMN IF NOT EXISTS source TEXT;
-- ALTER TABLE contacts ADD COLUMN IF NOT EXISTS last_contacted_at TIMESTAMPTZ;
-- ALTER TABLE contacts ADD COLUMN IF NOT EXISTS lead_score lead_score_type DEFAULT 'cold';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT 'Schema created successfully! Tables: contacts, pipelines, opportunities, activities, appointments' as message;
