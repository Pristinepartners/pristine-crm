-- Tags table
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Contact-Tag junction table
CREATE TABLE contact_tags (
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (contact_id, tag_id)
);

-- Email Templates table
CREATE TABLE email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lead Score calculation function
CREATE OR REPLACE FUNCTION calculate_lead_score(p_contact_id UUID)
RETURNS TEXT AS $$
DECLARE
  score INTEGER := 0;
  activity_count INTEGER;
  meetings_booked INTEGER;
  positive_outcomes INTEGER;
  days_since_contact INTEGER;
  in_pipeline BOOLEAN;
  pipeline_stage TEXT;
BEGIN
  -- Count total activities
  SELECT COUNT(*) INTO activity_count
  FROM activities
  WHERE contact_id = p_contact_id;

  -- Each activity adds 5 points (max 30)
  score := score + LEAST(activity_count * 5, 30);

  -- Count meetings booked (10 points each, max 30)
  SELECT COUNT(*) INTO meetings_booked
  FROM activities
  WHERE contact_id = p_contact_id AND outcome = 'Meeting Booked';
  score := score + LEAST(meetings_booked * 10, 30);

  -- Count positive outcomes (Answered, Callback) - 3 points each
  SELECT COUNT(*) INTO positive_outcomes
  FROM activities
  WHERE contact_id = p_contact_id AND outcome IN ('Answered', 'Callback');
  score := score + LEAST(positive_outcomes * 3, 15);

  -- Days since last contact (subtract points for inactivity)
  SELECT EXTRACT(DAY FROM (now() - MAX(logged_at)))::INTEGER INTO days_since_contact
  FROM activities
  WHERE contact_id = p_contact_id;

  IF days_since_contact IS NOT NULL THEN
    IF days_since_contact <= 7 THEN
      score := score + 15;
    ELSIF days_since_contact <= 14 THEN
      score := score + 10;
    ELSIF days_since_contact <= 30 THEN
      score := score + 5;
    ELSE
      score := score - 10;
    END IF;
  END IF;

  -- Pipeline stage bonus
  SELECT EXISTS(SELECT 1 FROM opportunities WHERE contact_id = p_contact_id) INTO in_pipeline;
  IF in_pipeline THEN
    score := score + 10;

    -- Check if in later stages
    SELECT stage INTO pipeline_stage
    FROM opportunities
    WHERE contact_id = p_contact_id
    ORDER BY updated_at DESC
    LIMIT 1;

    IF pipeline_stage IN ('Proposal', 'Negotiation', 'Closed Won') THEN
      score := score + 15;
    ELSIF pipeline_stage IN ('Discovery', 'Demo', 'Trial') THEN
      score := score + 10;
    END IF;
  END IF;

  -- Appointments boost
  IF EXISTS(SELECT 1 FROM appointments WHERE contact_id = p_contact_id AND status = 'completed') THEN
    score := score + 15;
  END IF;

  -- Return score category
  IF score >= 60 THEN
    RETURN 'hot';
  ELSIF score >= 30 THEN
    RETURN 'warm';
  ELSE
    RETURN 'cold';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update contact lead score
CREATE OR REPLACE FUNCTION update_contact_lead_score()
RETURNS TRIGGER AS $$
DECLARE
  target_contact_id UUID;
BEGIN
  -- Get the contact_id from the affected row
  IF TG_OP = 'DELETE' THEN
    target_contact_id := OLD.contact_id;
  ELSE
    target_contact_id := NEW.contact_id;
  END IF;

  -- Update the contact's lead score
  UPDATE contacts
  SET lead_score = calculate_lead_score(target_contact_id)
  WHERE id = target_contact_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers to auto-update lead score
DROP TRIGGER IF EXISTS update_lead_score_on_activity ON activities;
CREATE TRIGGER update_lead_score_on_activity
  AFTER INSERT OR UPDATE OR DELETE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_lead_score();

DROP TRIGGER IF EXISTS update_lead_score_on_appointment ON appointments;
CREATE TRIGGER update_lead_score_on_appointment
  AFTER INSERT OR UPDATE OR DELETE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_lead_score();

DROP TRIGGER IF EXISTS update_lead_score_on_opportunity ON opportunities;
CREATE TRIGGER update_lead_score_on_opportunity
  AFTER INSERT OR UPDATE OR DELETE ON opportunities
  FOR EACH ROW
  EXECUTE FUNCTION update_contact_lead_score();

-- Create indexes for better query performance
CREATE INDEX idx_contact_tags_contact_id ON contact_tags(contact_id);
CREATE INDEX idx_contact_tags_tag_id ON contact_tags(tag_id);
CREATE INDEX idx_activities_contact_outcome ON activities(contact_id, outcome);
