-- ============================================================
-- 008: Sub-Accounts & Intelligence Features
-- Converts demo accounts into real sub-account system with
-- lead intelligence, deal insights, and engagement tracking
-- ============================================================

-- Sub-Accounts master table
CREATE TABLE IF NOT EXISTS sub_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company_name TEXT NOT NULL,
  industry TEXT NOT NULL DEFAULT 'Real Estate',
  primary_color TEXT NOT NULL DEFAULT '#2563eb',
  secondary_color TEXT NOT NULL DEFAULT '#0f172a',
  logo_initial TEXT NOT NULL DEFAULT 'A',
  logo_url TEXT,
  pipeline_stages JSONB NOT NULL DEFAULT '["New Lead", "Qualified", "Proposal", "Negotiation", "Closed Won"]',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by TEXT NOT NULL DEFAULT 'alex',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sub-Account Contacts
CREATE TABLE IF NOT EXISTS sub_account_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_account_id UUID NOT NULL REFERENCES sub_accounts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  business_name TEXT,
  city TEXT,
  address TEXT,
  linkedin_url TEXT,
  lead_score TEXT NOT NULL DEFAULT 'cold' CHECK (lead_score IN ('hot', 'warm', 'cold')),
  source TEXT,
  engagement_score INTEGER NOT NULL DEFAULT 0,
  last_contacted_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sub-Account Contact Tags
CREATE TABLE IF NOT EXISTS sub_account_contact_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID NOT NULL REFERENCES sub_account_contacts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6b7280',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sub-Account Opportunities
CREATE TABLE IF NOT EXISTS sub_account_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_account_id UUID NOT NULL REFERENCES sub_accounts(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES sub_account_contacts(id) ON DELETE SET NULL,
  contact_name TEXT NOT NULL,
  business_name TEXT,
  stage TEXT NOT NULL,
  value NUMERIC NOT NULL DEFAULT 0,
  next_follow_up TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  closed_won BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sub-Account Appointments
CREATE TABLE IF NOT EXISTS sub_account_appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_account_id UUID NOT NULL REFERENCES sub_accounts(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES sub_account_contacts(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  datetime TIMESTAMPTZ NOT NULL,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sub-Account Social Posts
CREATE TABLE IF NOT EXISTS sub_account_social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_account_id UUID NOT NULL REFERENCES sub_accounts(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram', 'linkedin')),
  content TEXT NOT NULL,
  image_url TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sub-Account Website Visits (lead intelligence)
CREATE TABLE IF NOT EXISTS sub_account_website_visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_account_id UUID NOT NULL REFERENCES sub_accounts(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES sub_account_contacts(id) ON DELETE CASCADE,
  page_url TEXT NOT NULL,
  page_title TEXT,
  duration_seconds INTEGER DEFAULT 0,
  visited_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sub-Account Lead Events (engagement tracking)
CREATE TABLE IF NOT EXISTS sub_account_lead_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_account_id UUID NOT NULL REFERENCES sub_accounts(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES sub_account_contacts(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('email_open', 'link_click', 'page_view', 'form_submit', 'call', 'meeting', 'social_interaction')),
  description TEXT,
  metadata JSONB DEFAULT '{}',
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sub-Account Activities (unified activity log)
CREATE TABLE IF NOT EXISTS sub_account_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_account_id UUID NOT NULL REFERENCES sub_accounts(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES sub_account_contacts(id) ON DELETE SET NULL,
  opportunity_id UUID REFERENCES sub_account_opportunities(id) ON DELETE SET NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('call', 'email', 'meeting', 'note', 'task')),
  title TEXT NOT NULL,
  description TEXT,
  summary JSONB,
  logged_by TEXT NOT NULL DEFAULT 'alex',
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sub-Account Opportunity Stage History (auto-tracked)
CREATE TABLE IF NOT EXISTS sub_account_opportunity_stage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES sub_account_opportunities(id) ON DELETE CASCADE,
  from_stage TEXT,
  to_stage TEXT NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sub-Account Signals (purchase/sale intent)
CREATE TABLE IF NOT EXISTS sub_account_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_account_id UUID NOT NULL REFERENCES sub_accounts(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES sub_account_contacts(id) ON DELETE CASCADE,
  signal_type TEXT NOT NULL CHECK (signal_type IN ('purchase_intent', 'sale_intent', 're_engagement', 'deal_at_risk', 'high_engagement')),
  confidence NUMERIC NOT NULL DEFAULT 0.5 CHECK (confidence >= 0 AND confidence <= 1),
  title TEXT NOT NULL,
  description TEXT,
  dismissed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Sub-Account Outreach Suggestions
CREATE TABLE IF NOT EXISTS sub_account_outreach_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sub_account_id UUID NOT NULL REFERENCES sub_accounts(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES sub_account_contacts(id) ON DELETE CASCADE,
  suggestion_type TEXT NOT NULL CHECK (suggestion_type IN ('follow_up', 'post_meeting', 'negotiation_check', 're_engagement', 'introduction')),
  subject TEXT NOT NULL,
  message_template TEXT NOT NULL,
  sent BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX idx_sub_account_contacts_account ON sub_account_contacts(sub_account_id);
CREATE INDEX idx_sub_account_contacts_lead_score ON sub_account_contacts(lead_score);
CREATE INDEX idx_sub_account_opportunities_account ON sub_account_opportunities(sub_account_id);
CREATE INDEX idx_sub_account_opportunities_stage ON sub_account_opportunities(stage);
CREATE INDEX idx_sub_account_appointments_account ON sub_account_appointments(sub_account_id);
CREATE INDEX idx_sub_account_appointments_datetime ON sub_account_appointments(datetime);
CREATE INDEX idx_sub_account_social_posts_account ON sub_account_social_posts(sub_account_id);
CREATE INDEX idx_sub_account_website_visits_account ON sub_account_website_visits(sub_account_id);
CREATE INDEX idx_sub_account_website_visits_contact ON sub_account_website_visits(contact_id);
CREATE INDEX idx_sub_account_lead_events_account ON sub_account_lead_events(sub_account_id);
CREATE INDEX idx_sub_account_lead_events_contact ON sub_account_lead_events(contact_id);
CREATE INDEX idx_sub_account_lead_events_type ON sub_account_lead_events(event_type);
CREATE INDEX idx_sub_account_activities_account ON sub_account_activities(sub_account_id);
CREATE INDEX idx_sub_account_activities_contact ON sub_account_activities(contact_id);
CREATE INDEX idx_sub_account_stage_history_opp ON sub_account_opportunity_stage_history(opportunity_id);
CREATE INDEX idx_sub_account_signals_account ON sub_account_signals(sub_account_id);
CREATE INDEX idx_sub_account_signals_contact ON sub_account_signals(contact_id);
CREATE INDEX idx_sub_account_outreach_account ON sub_account_outreach_suggestions(sub_account_id);
CREATE INDEX idx_sub_account_contact_tags_contact ON sub_account_contact_tags(contact_id);

-- ============================================================
-- Triggers
-- ============================================================

-- Updated_at triggers
CREATE TRIGGER update_sub_accounts_updated_at
  BEFORE UPDATE ON sub_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sub_account_contacts_updated_at
  BEFORE UPDATE ON sub_account_contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sub_account_opportunities_updated_at
  BEFORE UPDATE ON sub_account_opportunities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sub_account_social_posts_updated_at
  BEFORE UPDATE ON sub_account_social_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-track opportunity stage changes
CREATE OR REPLACE FUNCTION track_sub_account_opportunity_stage_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.stage IS DISTINCT FROM NEW.stage THEN
    INSERT INTO sub_account_opportunity_stage_history (opportunity_id, from_stage, to_stage)
    VALUES (NEW.id, OLD.stage, NEW.stage);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_opportunity_stage_change
  AFTER UPDATE ON sub_account_opportunities
  FOR EACH ROW EXECUTE FUNCTION track_sub_account_opportunity_stage_change();

-- Auto-create initial stage history on insert
CREATE OR REPLACE FUNCTION init_sub_account_opportunity_stage_history()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO sub_account_opportunity_stage_history (opportunity_id, from_stage, to_stage)
  VALUES (NEW.id, NULL, NEW.stage);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER init_opportunity_stage_history
  AFTER INSERT ON sub_account_opportunities
  FOR EACH ROW EXECUTE FUNCTION init_sub_account_opportunity_stage_history();

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE sub_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_account_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_account_contact_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_account_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_account_appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_account_social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_account_website_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_account_lead_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_account_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_account_opportunity_stage_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_account_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE sub_account_outreach_suggestions ENABLE ROW LEVEL SECURITY;

-- Permissive policies (same pattern as existing tables)
CREATE POLICY "Allow all for authenticated users" ON sub_accounts FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON sub_account_contacts FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON sub_account_contact_tags FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON sub_account_opportunities FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON sub_account_appointments FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON sub_account_social_posts FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON sub_account_website_visits FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON sub_account_lead_events FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON sub_account_activities FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON sub_account_opportunity_stage_history FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON sub_account_signals FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated users" ON sub_account_outreach_suggestions FOR ALL USING (true);
