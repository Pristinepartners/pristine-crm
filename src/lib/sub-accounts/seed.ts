import type { SupabaseClient } from '@supabase/supabase-js'

function daysFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

function daysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

function todayAt(hour: number, minute: number = 0): string {
  const d = new Date()
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

function daysFromNowAt(days: number, hour: number, minute: number = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(hour, minute, 0, 0)
  return d.toISOString()
}

interface AccountSeed {
  name: string
  company_name: string
  industry: string
  primary_color: string
  secondary_color: string
  logo_initial: string
  pipeline_stages: string[]
  contacts: {
    name: string; email: string; phone: string; business_name: string;
    lead_score: string; source: string; city: string;
    last_contacted_at: string | null; linkedin_url: string | null;
    created_at: string;
    tags: { name: string; color: string }[]
  }[]
  opportunities: {
    contact_name: string; business_name: string; value: number;
    stage: string; next_follow_up: string | null; created_at: string
  }[]
  appointments: {
    title: string; contact_name: string; datetime: string;
    location: string; status: string
  }[]
  socialPosts: {
    platform: string; content: string; scheduled_at: string; status: string
  }[]
}

const ACCOUNTS: AccountSeed[] = [
  {
    name: 'Luxe Realty Group',
    company_name: 'Luxe Realty Group',
    industry: 'Real Estate',
    primary_color: '#2563eb',
    secondary_color: '#0f172a',
    logo_initial: 'L',
    pipeline_stages: ['New Lead', 'Qualified', 'Showing Scheduled', 'Offer Made', 'Under Contract', 'Closed Won'],
    contacts: [
      { name: 'Sarah Mitchell', email: 'sarah@mitchellhomes.com', phone: '(555) 234-8901', business_name: 'Mitchell Homes', lead_score: 'hot', source: 'Referral', city: 'Beverly Hills', created_at: daysAgo(45), last_contacted_at: daysAgo(1), linkedin_url: 'https://linkedin.com/in/sarahmitchell', tags: [{ name: 'VIP Buyer', color: '#dc2626' }, { name: 'Pre-Approved', color: '#16a34a' }] },
      { name: 'David Chen', email: 'david.chen@luxeliving.com', phone: '(555) 345-6789', business_name: 'Luxe Living Properties', lead_score: 'hot', source: 'Website', city: 'Malibu', created_at: daysAgo(30), last_contacted_at: daysAgo(2), linkedin_url: 'https://linkedin.com/in/davidchen', tags: [{ name: 'Investor', color: '#9333ea' }] },
      { name: 'Emily Rodriguez', email: 'emily.r@gmail.com', phone: '(555) 456-7890', business_name: 'Rodriguez Family Trust', lead_score: 'warm', source: 'Open House', city: 'Santa Monica', created_at: daysAgo(20), last_contacted_at: daysAgo(5), linkedin_url: null, tags: [{ name: 'First-Time Buyer', color: '#0284c7' }] },
      { name: 'James Patterson', email: 'jpatterson@outlook.com', phone: '(555) 567-8901', business_name: 'Patterson Enterprises', lead_score: 'warm', source: 'LinkedIn', city: 'Bel Air', created_at: daysAgo(15), last_contacted_at: daysAgo(3), linkedin_url: 'https://linkedin.com/in/jamespatterson', tags: [{ name: 'Luxury', color: '#c9a96e' }] },
      { name: 'Maria Santos', email: 'maria@santosgroup.com', phone: '(555) 678-9012', business_name: 'Santos Investment Group', lead_score: 'hot', source: 'Referral', city: 'Hollywood Hills', created_at: daysAgo(60), last_contacted_at: daysAgo(1), linkedin_url: 'https://linkedin.com/in/mariasantos', tags: [{ name: 'Investor', color: '#9333ea' }, { name: 'VIP Buyer', color: '#dc2626' }] },
      { name: 'Robert Kim', email: 'rkim@kimproperties.com', phone: '(555) 789-0123', business_name: 'Kim Properties LLC', lead_score: 'cold', source: 'Cold Call', city: 'Pasadena', created_at: daysAgo(90), last_contacted_at: daysAgo(30), linkedin_url: null, tags: [] },
      { name: 'Amanda Foster', email: 'amanda.foster@email.com', phone: '(555) 890-1234', business_name: '', lead_score: 'warm', source: 'Instagram', city: 'Venice', created_at: daysAgo(10), last_contacted_at: daysAgo(4), linkedin_url: null, tags: [{ name: 'Downsizing', color: '#f59e0b' }] },
      { name: 'Thomas Wright', email: 'twright@wrightdev.com', phone: '(555) 901-2345', business_name: 'Wright Development', lead_score: 'hot', source: 'Conference', city: 'Century City', created_at: daysAgo(7), last_contacted_at: daysAgo(1), linkedin_url: 'https://linkedin.com/in/thomaswright', tags: [{ name: 'Developer', color: '#7c3aed' }, { name: 'High Net Worth', color: '#c9a96e' }] },
      { name: 'Lisa Nguyen', email: 'lisa.ng@gmail.com', phone: '(555) 012-3456', business_name: 'Nguyen Medical Practice', lead_score: 'warm', source: 'Website', city: 'Calabasas', created_at: daysAgo(25), last_contacted_at: daysAgo(7), linkedin_url: 'https://linkedin.com/in/lisanguyen', tags: [{ name: 'Relocation', color: '#06b6d4' }] },
      { name: 'Michael Brooks', email: 'mbrooks@email.com', phone: '(555) 123-4567', business_name: '', lead_score: 'cold', source: 'Zillow', city: 'Encino', created_at: daysAgo(120), last_contacted_at: daysAgo(45), linkedin_url: null, tags: [] },
    ],
    opportunities: [
      { contact_name: 'Sarah Mitchell', business_name: 'Mitchell Homes', value: 2500000, stage: 'Under Contract', next_follow_up: daysFromNow(2), created_at: daysAgo(30) },
      { contact_name: 'David Chen', business_name: 'Luxe Living Properties', value: 4200000, stage: 'Offer Made', next_follow_up: daysFromNow(1), created_at: daysAgo(20) },
      { contact_name: 'Maria Santos', business_name: 'Santos Investment Group', value: 3800000, stage: 'Showing Scheduled', next_follow_up: daysFromNow(3), created_at: daysAgo(15) },
      { contact_name: 'Thomas Wright', business_name: 'Wright Development', value: 8500000, stage: 'Qualified', next_follow_up: daysFromNow(5), created_at: daysAgo(7) },
      { contact_name: 'Emily Rodriguez', business_name: 'Rodriguez Family Trust', value: 1200000, stage: 'Showing Scheduled', next_follow_up: daysFromNow(4), created_at: daysAgo(12) },
      { contact_name: 'James Patterson', business_name: 'Patterson Enterprises', value: 5600000, stage: 'New Lead', next_follow_up: daysFromNow(1), created_at: daysAgo(3) },
      { contact_name: 'Lisa Nguyen', business_name: 'Nguyen Medical Practice', value: 1800000, stage: 'Qualified', next_follow_up: daysFromNow(6), created_at: daysAgo(10) },
      { contact_name: 'Amanda Foster', business_name: '', value: 950000, stage: 'New Lead', next_follow_up: daysFromNow(2), created_at: daysAgo(5) },
    ],
    appointments: [
      { title: 'Property Showing - 1240 Sunset Blvd', contact_name: 'Sarah Mitchell', datetime: todayAt(10, 30), location: '1240 Sunset Blvd, Beverly Hills', status: 'scheduled' },
      { title: 'Listing Presentation', contact_name: 'David Chen', datetime: todayAt(14, 0), location: 'Zoom Video Call', status: 'scheduled' },
      { title: 'Coffee Meeting - Investment Portfolio', contact_name: 'Maria Santos', datetime: daysFromNowAt(1, 9, 0), location: 'The Coffee Bean, Beverly Hills', status: 'scheduled' },
      { title: 'Open House Preview', contact_name: 'Thomas Wright', datetime: daysFromNowAt(2, 11, 0), location: '8900 Wilshire Blvd', status: 'scheduled' },
      { title: 'Offer Review Meeting', contact_name: 'Emily Rodriguez', datetime: daysFromNowAt(3, 15, 30), location: 'Office - Conference Room A', status: 'scheduled' },
      { title: 'Closing Walk-Through', contact_name: 'Sarah Mitchell', datetime: daysFromNowAt(5, 10, 0), location: '1240 Sunset Blvd, Beverly Hills', status: 'scheduled' },
      { title: 'Market Analysis Call', contact_name: 'James Patterson', datetime: daysAgo(1), location: 'Phone Call', status: 'completed' },
      { title: 'Initial Consultation', contact_name: 'Robert Kim', datetime: daysAgo(3), location: 'Office', status: 'no_show' },
    ],
    socialPosts: [
      { platform: 'instagram', content: 'Just listed! Stunning 5-bed estate in Beverly Hills with panoramic city views. This architectural masterpiece features a resort-style pool, home theater, and wine cellar. DM for private showing. #LuxuryRealEstate #BeverlyHills #DreamHome', scheduled_at: daysFromNowAt(1, 10, 0), status: 'scheduled' },
      { platform: 'facebook', content: 'Thrilled to announce another successful closing! Congratulations to the Chen family on their beautiful new Malibu oceanfront property.', scheduled_at: daysFromNowAt(2, 12, 0), status: 'scheduled' },
      { platform: 'linkedin', content: 'Q4 Market Update: Beverly Hills luxury market remains strong with 12% YoY price appreciation.', scheduled_at: daysFromNowAt(3, 9, 0), status: 'scheduled' },
      { platform: 'instagram', content: 'Weekend open house alert! Join us Saturday 1-4pm at this stunning modern farmhouse in Bel Air.', scheduled_at: daysFromNowAt(4, 11, 0), status: 'scheduled' },
      { platform: 'facebook', content: 'Looking to buy or sell in Los Angeles? Our team closed $45M in transactions this quarter.', scheduled_at: daysFromNowAt(5, 14, 0), status: 'draft' },
      { platform: 'linkedin', content: 'Excited to share that Luxe Realty Group has been named a top 10 luxury brokerage in Los Angeles.', scheduled_at: daysAgo(2), status: 'published' },
      { platform: 'instagram', content: 'Behind the scenes at today\'s luxury staging. Every detail matters when presenting a $4.2M property.', scheduled_at: daysAgo(5), status: 'published' },
      { platform: 'facebook', content: 'Tips for first-time luxury home buyers: 1) Get pre-approved 2) Know your must-haves 3) Work with an experienced agent.', scheduled_at: daysAgo(7), status: 'published' },
    ],
  },
  {
    name: 'Coastal Homes & Living',
    company_name: 'Coastal Homes & Living',
    industry: 'Real Estate',
    primary_color: '#0d9488',
    secondary_color: '#0c1222',
    logo_initial: 'C',
    pipeline_stages: ['New Inquiry', 'Contacted', 'Site Visit Scheduled', 'Negotiation', 'Under Contract', 'Closed'],
    contacts: [
      { name: 'Jennifer Walsh', email: 'jen@walshfamily.com', phone: '(555) 111-2233', business_name: '', lead_score: 'hot', source: 'Website', city: 'Laguna Beach', created_at: daysAgo(30), last_contacted_at: daysAgo(1), linkedin_url: null, tags: [{ name: 'Beach Buyer', color: '#0891b2' }, { name: 'Cash Offer', color: '#16a34a' }] },
      { name: 'Mark Thompson', email: 'mthompson@coastinvest.com', phone: '(555) 222-3344', business_name: 'Coast Investment Partners', lead_score: 'hot', source: 'Referral', city: 'Newport Beach', created_at: daysAgo(45), last_contacted_at: daysAgo(2), linkedin_url: 'https://linkedin.com/in/markthompson', tags: [{ name: 'Investor', color: '#9333ea' }, { name: 'Multi-Property', color: '#f59e0b' }] },
      { name: 'Rachel Green', email: 'rachel.green@email.com', phone: '(555) 333-4455', business_name: '', lead_score: 'warm', source: 'Instagram', city: 'Dana Point', created_at: daysAgo(14), last_contacted_at: daysAgo(3), linkedin_url: null, tags: [{ name: 'Vacation Home', color: '#f97316' }] },
      { name: 'Carlos Mendoza', email: 'carlos@mendozalaw.com', phone: '(555) 444-5566', business_name: 'Mendoza Law Firm', lead_score: 'warm', source: 'Open House', city: 'San Clemente', created_at: daysAgo(21), last_contacted_at: daysAgo(5), linkedin_url: 'https://linkedin.com/in/carlosmendoza', tags: [{ name: 'Relocation', color: '#06b6d4' }] },
      { name: 'Stephanie Lee', email: 'slee@techcorp.io', phone: '(555) 555-6677', business_name: 'TechCorp', lead_score: 'hot', source: 'LinkedIn', city: 'Huntington Beach', created_at: daysAgo(10), last_contacted_at: daysAgo(1), linkedin_url: 'https://linkedin.com/in/stephanielee', tags: [{ name: 'Tech Exec', color: '#7c3aed' }, { name: 'Pre-Approved', color: '#16a34a' }] },
      { name: "Brian O'Connor", email: 'brian.oc@gmail.com', phone: '(555) 666-7788', business_name: '', lead_score: 'cold', source: 'Zillow', city: 'Seal Beach', created_at: daysAgo(60), last_contacted_at: daysAgo(25), linkedin_url: null, tags: [] },
      { name: 'Diana Park', email: 'diana@parkdesigns.com', phone: '(555) 777-8899', business_name: 'Park Interior Designs', lead_score: 'warm', source: 'Referral', city: 'Corona del Mar', created_at: daysAgo(8), last_contacted_at: daysAgo(2), linkedin_url: 'https://linkedin.com/in/dianapark', tags: [{ name: 'Design Professional', color: '#ec4899' }] },
      { name: 'Andrew Hayes', email: 'ahayes@hayesventures.com', phone: '(555) 888-9900', business_name: 'Hayes Ventures', lead_score: 'hot', source: 'Conference', city: 'Balboa Island', created_at: daysAgo(5), last_contacted_at: daysAgo(1), linkedin_url: 'https://linkedin.com/in/andrewhayes', tags: [{ name: 'Investor', color: '#9333ea' }, { name: 'High Net Worth', color: '#c9a96e' }] },
    ],
    opportunities: [
      { contact_name: 'Jennifer Walsh', business_name: '', value: 1850000, stage: 'Under Contract', next_follow_up: daysFromNow(3), created_at: daysAgo(20) },
      { contact_name: 'Mark Thompson', business_name: 'Coast Investment Partners', value: 3200000, stage: 'Negotiation', next_follow_up: daysFromNow(1), created_at: daysAgo(25) },
      { contact_name: 'Stephanie Lee', business_name: 'TechCorp', value: 2100000, stage: 'Site Visit Scheduled', next_follow_up: daysFromNow(2), created_at: daysAgo(8) },
      { contact_name: 'Andrew Hayes', business_name: 'Hayes Ventures', value: 4500000, stage: 'Contacted', next_follow_up: daysFromNow(1), created_at: daysAgo(4) },
      { contact_name: 'Rachel Green', business_name: '', value: 975000, stage: 'Site Visit Scheduled', next_follow_up: daysFromNow(4), created_at: daysAgo(10) },
      { contact_name: 'Diana Park', business_name: 'Park Interior Designs', value: 1450000, stage: 'New Inquiry', next_follow_up: daysFromNow(2), created_at: daysAgo(3) },
      { contact_name: 'Carlos Mendoza', business_name: 'Mendoza Law Firm', value: 1650000, stage: 'Contacted', next_follow_up: daysFromNow(5), created_at: daysAgo(14) },
    ],
    appointments: [
      { title: 'Beach House Tour - 450 Coast Hwy', contact_name: 'Jennifer Walsh', datetime: todayAt(11, 0), location: '450 Coast Hwy, Laguna Beach', status: 'scheduled' },
      { title: 'Investment Portfolio Review', contact_name: 'Mark Thompson', datetime: todayAt(15, 30), location: 'Office - Newport Beach', status: 'scheduled' },
      { title: 'Property Walkthrough', contact_name: 'Stephanie Lee', datetime: daysFromNowAt(1, 10, 0), location: '890 Pacific Coast Hwy', status: 'scheduled' },
      { title: 'Design Consultation Meeting', contact_name: 'Diana Park', datetime: daysFromNowAt(2, 13, 0), location: 'Zoom Video Call', status: 'scheduled' },
      { title: 'Closing Documents Review', contact_name: 'Jennifer Walsh', datetime: daysFromNowAt(4, 14, 0), location: 'Title Company Office', status: 'scheduled' },
      { title: 'Market Analysis Presentation', contact_name: 'Andrew Hayes', datetime: daysAgo(1), location: 'Office', status: 'completed' },
      { title: 'Open House Prep Walk', contact_name: 'Carlos Mendoza', datetime: daysAgo(4), location: '123 Ocean View Dr', status: 'completed' },
    ],
    socialPosts: [
      { platform: 'instagram', content: 'Wake up to this view every morning. Oceanfront living at its finest in Laguna Beach. #CoastalLiving', scheduled_at: daysFromNowAt(1, 9, 0), status: 'scheduled' },
      { platform: 'facebook', content: 'NEW LISTING ALERT! Beautiful Cape Cod-style home in Dana Point with ocean views from every room.', scheduled_at: daysFromNowAt(2, 11, 0), status: 'scheduled' },
      { platform: 'linkedin', content: 'Coastal real estate market update: Inventory in South Orange County remains tight.', scheduled_at: daysFromNowAt(3, 8, 30), status: 'scheduled' },
      { platform: 'instagram', content: 'From "For Sale" to "Sold" in just 12 days! Another happy family settling into their dream coastal home.', scheduled_at: daysFromNowAt(5, 10, 0), status: 'draft' },
      { platform: 'facebook', content: '5 reasons to invest in coastal property: 1) Strong appreciation 2) Rental income potential.', scheduled_at: daysAgo(3), status: 'published' },
      { platform: 'instagram', content: 'Sunset from our latest listing in Newport Beach. Some things you just can\'t put a price on.', scheduled_at: daysAgo(6), status: 'published' },
    ],
  },
  {
    name: 'Summit Financial Advisors',
    company_name: 'Summit Financial Advisors',
    industry: 'Financial Services',
    primary_color: '#7c3aed',
    secondary_color: '#1a0f2e',
    logo_initial: 'S',
    pipeline_stages: ['Discovery', 'Financial Analysis', 'Proposal Sent', 'Review Meeting', 'Agreement Signed'],
    contacts: [
      { name: 'Richard Blackwell', email: 'rblackwell@blackwellind.com', phone: '(555) 100-2001', business_name: 'Blackwell Industries', lead_score: 'hot', source: 'Referral', city: 'Manhattan', created_at: daysAgo(60), last_contacted_at: daysAgo(1), linkedin_url: 'https://linkedin.com/in/richardblackwell', tags: [{ name: 'High Net Worth', color: '#c9a96e' }, { name: 'Portfolio Review', color: '#7c3aed' }] },
      { name: 'Katherine Moore', email: 'kmoore@moorefoundation.org', phone: '(555) 200-3002', business_name: 'Moore Family Foundation', lead_score: 'hot', source: 'Event', city: 'Greenwich', created_at: daysAgo(40), last_contacted_at: daysAgo(2), linkedin_url: 'https://linkedin.com/in/katherinemoore', tags: [{ name: 'Foundation', color: '#0891b2' }, { name: 'Estate Planning', color: '#dc2626' }] },
      { name: 'Alexander Volkov', email: 'avolkov@volkovtech.com', phone: '(555) 300-4003', business_name: 'Volkov Technologies', lead_score: 'hot', source: 'LinkedIn', city: 'San Francisco', created_at: daysAgo(25), last_contacted_at: daysAgo(1), linkedin_url: 'https://linkedin.com/in/alexandervolkov', tags: [{ name: 'Tech Founder', color: '#2563eb' }, { name: 'IPO Planning', color: '#f59e0b' }] },
      { name: 'Patricia Williams', email: 'pwilliams@email.com', phone: '(555) 400-5004', business_name: '', lead_score: 'warm', source: 'Website', city: 'Stamford', created_at: daysAgo(18), last_contacted_at: daysAgo(4), linkedin_url: null, tags: [{ name: 'Retirement Planning', color: '#16a34a' }] },
      { name: 'Daniel Nakamura', email: 'dnakamura@nkcapital.com', phone: '(555) 500-6005', business_name: 'NK Capital Management', lead_score: 'warm', source: 'Conference', city: 'Chicago', created_at: daysAgo(35), last_contacted_at: daysAgo(7), linkedin_url: 'https://linkedin.com/in/danielnakamura', tags: [{ name: 'Wealth Management', color: '#9333ea' }] },
      { name: 'Susan Clarke', email: 'sclarke@clarkemed.com', phone: '(555) 600-7006', business_name: 'Clarke Medical Group', lead_score: 'hot', source: 'Referral', city: 'Boston', created_at: daysAgo(12), last_contacted_at: daysAgo(1), linkedin_url: 'https://linkedin.com/in/susanclarke', tags: [{ name: 'Medical Professional', color: '#ec4899' }, { name: 'Tax Strategy', color: '#f97316' }] },
      { name: 'George Henderson', email: 'ghenderson@hendersonfarms.com', phone: '(555) 700-8007', business_name: 'Henderson Agricultural', lead_score: 'warm', source: 'Cold Email', city: 'Dallas', created_at: daysAgo(50), last_contacted_at: daysAgo(10), linkedin_url: null, tags: [{ name: 'Agriculture', color: '#22c55e' }] },
      { name: 'Michelle Torres', email: 'mtorres@torresarch.com', phone: '(555) 800-9008', business_name: 'Torres Architecture', lead_score: 'cold', source: 'Website', city: 'Miami', created_at: daysAgo(90), last_contacted_at: daysAgo(30), linkedin_url: 'https://linkedin.com/in/michelletorres', tags: [] },
      { name: 'William Chang', email: 'wchang@changventures.com', phone: '(555) 900-0009', business_name: 'Chang Ventures', lead_score: 'hot', source: 'Referral', city: 'Seattle', created_at: daysAgo(8), last_contacted_at: daysAgo(1), linkedin_url: 'https://linkedin.com/in/williamchang', tags: [{ name: 'Venture Capital', color: '#2563eb' }, { name: 'High Net Worth', color: '#c9a96e' }] },
      { name: 'Elizabeth Grant', email: 'egrant@grantlaw.com', phone: '(555) 010-1110', business_name: 'Grant & Associates Law', lead_score: 'warm', source: 'Event', city: 'Washington DC', created_at: daysAgo(20), last_contacted_at: daysAgo(3), linkedin_url: 'https://linkedin.com/in/elizabethgrant', tags: [{ name: 'Legal Professional', color: '#475569' }, { name: 'Trust Planning', color: '#7c3aed' }] },
      { name: 'Robert Patel', email: 'rpatel@patelgroup.com', phone: '(555) 020-2220', business_name: 'Patel Holdings Group', lead_score: 'warm', source: 'LinkedIn', city: 'Houston', created_at: daysAgo(15), last_contacted_at: daysAgo(5), linkedin_url: 'https://linkedin.com/in/robertpatel', tags: [{ name: 'Real Estate Portfolio', color: '#f59e0b' }] },
      { name: 'Amy Richardson', email: 'arichardson@email.com', phone: '(555) 030-3330', business_name: '', lead_score: 'cold', source: 'Website', city: 'Portland', created_at: daysAgo(75), last_contacted_at: daysAgo(40), linkedin_url: null, tags: [] },
    ],
    opportunities: [
      { contact_name: 'Richard Blackwell', business_name: 'Blackwell Industries', value: 5000000, stage: 'Review Meeting', next_follow_up: daysFromNow(1), created_at: daysAgo(30) },
      { contact_name: 'Katherine Moore', business_name: 'Moore Family Foundation', value: 12000000, stage: 'Proposal Sent', next_follow_up: daysFromNow(3), created_at: daysAgo(20) },
      { contact_name: 'Alexander Volkov', business_name: 'Volkov Technologies', value: 8500000, stage: 'Financial Analysis', next_follow_up: daysFromNow(2), created_at: daysAgo(15) },
      { contact_name: 'Susan Clarke', business_name: 'Clarke Medical Group', value: 3200000, stage: 'Proposal Sent', next_follow_up: daysFromNow(4), created_at: daysAgo(10) },
      { contact_name: 'William Chang', business_name: 'Chang Ventures', value: 15000000, stage: 'Discovery', next_follow_up: daysFromNow(1), created_at: daysAgo(5) },
      { contact_name: 'Elizabeth Grant', business_name: 'Grant & Associates Law', value: 2800000, stage: 'Financial Analysis', next_follow_up: daysFromNow(5), created_at: daysAgo(12) },
      { contact_name: 'Daniel Nakamura', business_name: 'NK Capital Management', value: 6500000, stage: 'Discovery', next_follow_up: daysFromNow(3), created_at: daysAgo(18) },
      { contact_name: 'Robert Patel', business_name: 'Patel Holdings Group', value: 4200000, stage: 'Discovery', next_follow_up: daysFromNow(6), created_at: daysAgo(8) },
      { contact_name: 'Patricia Williams', business_name: '', value: 1500000, stage: 'Financial Analysis', next_follow_up: daysFromNow(4), created_at: daysAgo(14) },
    ],
    appointments: [
      { title: 'Portfolio Strategy Review', contact_name: 'Richard Blackwell', datetime: todayAt(9, 0), location: 'Office - Board Room', status: 'scheduled' },
      { title: 'Estate Planning Consultation', contact_name: 'Katherine Moore', datetime: todayAt(13, 30), location: 'Zoom Video Call', status: 'scheduled' },
      { title: 'IPO Tax Strategy Session', contact_name: 'Alexander Volkov', datetime: daysFromNowAt(1, 11, 0), location: 'Google Meet', status: 'scheduled' },
      { title: 'Retirement Planning Review', contact_name: 'Patricia Williams', datetime: daysFromNowAt(1, 15, 0), location: 'Office', status: 'scheduled' },
      { title: 'Medical Practice Financial Review', contact_name: 'Susan Clarke', datetime: daysFromNowAt(2, 10, 0), location: 'Zoom Video Call', status: 'scheduled' },
      { title: 'VC Fund Structure Meeting', contact_name: 'William Chang', datetime: daysFromNowAt(3, 14, 30), location: 'Office - Conference Room', status: 'scheduled' },
      { title: 'Trust Planning Session', contact_name: 'Elizabeth Grant', datetime: daysFromNowAt(4, 11, 0), location: 'Phone Call', status: 'scheduled' },
      { title: 'Quarterly Review Call', contact_name: 'Daniel Nakamura', datetime: daysAgo(2), location: 'Zoom', status: 'completed' },
      { title: 'Initial Consultation', contact_name: 'George Henderson', datetime: daysAgo(5), location: 'Office', status: 'completed' },
    ],
    socialPosts: [
      { platform: 'linkedin', content: 'Market volatility creating opportunities? Our latest analysis shows 3 sectors positioned for growth in 2026. #WealthManagement', scheduled_at: daysFromNowAt(1, 8, 0), status: 'scheduled' },
      { platform: 'facebook', content: 'Tax planning tip: Year-end is approaching. Have you reviewed your tax-loss harvesting opportunities?', scheduled_at: daysFromNowAt(2, 10, 0), status: 'scheduled' },
      { platform: 'linkedin', content: 'Proud to welcome 3 new ultra-high-net-worth families to Summit Financial this quarter. Our AUM now exceeds $2.1B.', scheduled_at: daysFromNowAt(3, 9, 30), status: 'scheduled' },
      { platform: 'facebook', content: 'Upcoming Webinar: "Estate Planning Strategies for Business Owners" - Register now!', scheduled_at: daysFromNowAt(4, 11, 0), status: 'scheduled' },
      { platform: 'linkedin', content: 'The 5 biggest financial planning mistakes we see with tech founders.', scheduled_at: daysFromNowAt(5, 8, 30), status: 'draft' },
      { platform: 'instagram', content: 'Behind the scenes at our annual client appreciation dinner. Our clients aren\'t just numbers - they\'re family.', scheduled_at: daysFromNowAt(6, 12, 0), status: 'draft' },
      { platform: 'linkedin', content: 'Summit Financial Advisors named to Barron\'s Top 100 Independent Wealth Advisors list for the 5th year.', scheduled_at: daysAgo(3), status: 'published' },
      { platform: 'facebook', content: 'Inflation, interest rates, and your portfolio - our latest market commentary is now available.', scheduled_at: daysAgo(5), status: 'published' },
      { platform: 'linkedin', content: 'Congratulations to our client Alexander Volkov on the successful Series C funding of Volkov Technologies.', scheduled_at: daysAgo(8), status: 'published' },
      { platform: 'instagram', content: 'Teamwork makes the dream work! Our advisors completed their annual advanced certification training.', scheduled_at: daysAgo(12), status: 'published' },
    ],
  },
]

// Event types for synthetic intelligence data
const EVENT_TYPES = ['email_open', 'link_click', 'page_view', 'form_submit', 'call', 'meeting', 'social_interaction'] as const
const PAGES = ['/home', '/listings', '/about', '/contact', '/blog/market-update', '/pricing', '/testimonials', '/services']

export async function seedSubAccountData(supabase: SupabaseClient) {
  // Check if already seeded
  const { data: existing } = await supabase.from('sub_accounts').select('id').limit(1)
  if (existing && existing.length > 0) {
    return { success: false, message: 'Sub-accounts already exist. Delete existing data first.' }
  }

  for (const account of ACCOUNTS) {
    // Insert account
    const { data: acctData, error: acctError } = await supabase
      .from('sub_accounts')
      .insert({
        name: account.name,
        company_name: account.company_name,
        industry: account.industry,
        primary_color: account.primary_color,
        secondary_color: account.secondary_color,
        logo_initial: account.logo_initial,
        pipeline_stages: JSON.stringify(account.pipeline_stages),
      })
      .select('id')
      .single()

    if (acctError || !acctData) {
      console.error('Failed to create account:', acctError)
      continue
    }

    const accountId = acctData.id

    // Insert contacts and collect IDs mapped by name
    const contactMap = new Map<string, string>()
    for (const contact of account.contacts) {
      const { data: cData, error: cError } = await supabase
        .from('sub_account_contacts')
        .insert({
          sub_account_id: accountId,
          name: contact.name,
          email: contact.email,
          phone: contact.phone,
          business_name: contact.business_name || null,
          lead_score: contact.lead_score,
          source: contact.source,
          city: contact.city,
          last_contacted_at: contact.last_contacted_at,
          linkedin_url: contact.linkedin_url,
          created_at: contact.created_at,
        })
        .select('id')
        .single()

      if (cData) {
        contactMap.set(contact.name, cData.id)

        // Insert tags
        if (contact.tags.length > 0) {
          await supabase.from('sub_account_contact_tags').insert(
            contact.tags.map(t => ({
              contact_id: cData.id,
              name: t.name,
              color: t.color,
            }))
          )
        }
      }
    }

    // Insert opportunities
    for (const opp of account.opportunities) {
      const contactId = contactMap.get(opp.contact_name) || null
      await supabase.from('sub_account_opportunities').insert({
        sub_account_id: accountId,
        contact_id: contactId,
        contact_name: opp.contact_name,
        business_name: opp.business_name || null,
        stage: opp.stage,
        value: opp.value,
        next_follow_up: opp.next_follow_up,
        created_at: opp.created_at,
      })
    }

    // Insert appointments
    for (const apt of account.appointments) {
      const contactId = contactMap.get(apt.contact_name) || null
      await supabase.from('sub_account_appointments').insert({
        sub_account_id: accountId,
        contact_id: contactId,
        title: apt.title,
        contact_name: apt.contact_name,
        datetime: apt.datetime,
        location: apt.location,
        status: apt.status,
      })
    }

    // Insert social posts
    for (const post of account.socialPosts) {
      await supabase.from('sub_account_social_posts').insert({
        sub_account_id: accountId,
        platform: post.platform,
        content: post.content,
        scheduled_at: post.scheduled_at,
        status: post.status,
      })
    }

    // Generate synthetic lead events and website visits for intelligence features
    const contactEntries = Array.from(contactMap.entries())
    for (const [contactName, contactId] of contactEntries) {
      const contact = account.contacts.find(c => c.name === contactName)
      if (!contact) continue

      // More events for hotter leads
      const eventCount = contact.lead_score === 'hot' ? 15 : contact.lead_score === 'warm' ? 8 : 3

      for (let i = 0; i < eventCount; i++) {
        const eventType = EVENT_TYPES[Math.floor(Math.random() * EVENT_TYPES.length)]
        await supabase.from('sub_account_lead_events').insert({
          sub_account_id: accountId,
          contact_id: contactId,
          event_type: eventType,
          description: `${contactName} - ${eventType.replace('_', ' ')}`,
          occurred_at: daysAgo(Math.floor(Math.random() * 30)),
        })
      }

      // Website visits
      const visitCount = contact.lead_score === 'hot' ? 8 : contact.lead_score === 'warm' ? 4 : 1
      for (let i = 0; i < visitCount; i++) {
        const page = PAGES[Math.floor(Math.random() * PAGES.length)]
        await supabase.from('sub_account_website_visits').insert({
          sub_account_id: accountId,
          contact_id: contactId,
          page_url: page,
          page_title: page.replace('/', '').replace(/-/g, ' ') || 'Home',
          duration_seconds: Math.floor(Math.random() * 300) + 10,
          visited_at: daysAgo(Math.floor(Math.random() * 30)),
        })
      }
    }

    // Generate signals for hot leads
    const hotContacts = account.contacts.filter(c => c.lead_score === 'hot')
    for (const contact of hotContacts) {
      const contactId = contactMap.get(contact.name)
      if (!contactId) continue
      await supabase.from('sub_account_signals').insert({
        sub_account_id: accountId,
        contact_id: contactId,
        signal_type: 'purchase_intent',
        confidence: 0.7 + Math.random() * 0.3,
        title: `High engagement from ${contact.name}`,
        description: `${contact.name} has shown strong purchase intent with multiple page views and email opens in the last 7 days.`,
      })
    }

    // Generate outreach suggestions
    for (const contact of account.contacts.slice(0, 4)) {
      const contactId = contactMap.get(contact.name)
      if (!contactId) continue
      await supabase.from('sub_account_outreach_suggestions').insert({
        sub_account_id: accountId,
        contact_id: contactId,
        suggestion_type: 'follow_up',
        subject: `Follow up with ${contact.name}`,
        message_template: `Hi ${contact.name.split(' ')[0]},\n\nI wanted to follow up on our recent conversation. I have some new information that I think would be valuable for you.\n\nWould you have time for a quick call this week?\n\nBest regards`,
      })
    }
  }

  return { success: true, message: 'Successfully seeded 3 sub-accounts with all data.' }
}
