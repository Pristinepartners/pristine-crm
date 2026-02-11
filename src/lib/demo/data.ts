// Demo account data for client showcases
// Each account represents a potential client's CRM view

export interface DemoContact {
  id: string
  name: string
  email: string
  phone: string
  business_name: string
  lead_score: 'hot' | 'warm' | 'cold'
  source: string
  created_at: string
  last_contacted_at: string | null
  linkedin_url: string | null
  city: string | null
  tags: { name: string; color: string }[]
}

export interface DemoPipelineStage {
  name: string
  opportunities: DemoOpportunity[]
}

export interface DemoOpportunity {
  id: string
  contact_name: string
  business_name: string
  value: number
  stage: string
  next_follow_up: string | null
  created_at: string
}

export interface DemoAppointment {
  id: string
  title: string
  contact_name: string
  datetime: string
  location: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
}

export interface DemoSocialPost {
  id: string
  platform: 'facebook' | 'instagram' | 'linkedin'
  content: string
  scheduled_at: string
  status: 'draft' | 'scheduled' | 'published'
  image_url?: string
}

export interface DemoStats {
  totalContacts: number
  hotLeads: number
  warmLeads: number
  coldLeads: number
  totalPipelineValue: number
  appointmentsThisWeek: number
  postsScheduled: number
  postsPublished: number
  conversionRate: number
  avgDealSize: number
  dealsClosedThisMonth: number
  revenueThisMonth: number
}

export interface DemoAccount {
  id: string
  name: string
  companyName: string
  industry: string
  primaryColor: string
  secondaryColor: string
  logoInitial: string
  contacts: DemoContact[]
  pipelineStages: string[]
  opportunities: DemoOpportunity[]
  appointments: DemoAppointment[]
  socialPosts: DemoSocialPost[]
  stats: DemoStats
}

// Helper to generate dates relative to today
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

// ============================================================
// ACCOUNT 1: Luxe Realty Group
// ============================================================
const luxeRealty: DemoAccount = {
  id: 'luxe-realty',
  name: 'Luxe Realty Group',
  companyName: 'Luxe Realty Group',
  industry: 'Real Estate',
  primaryColor: '#2563eb',
  secondaryColor: '#0f172a',
  logoInitial: 'L',
  contacts: [
    {
      id: 'lx-c1', name: 'Sarah Mitchell', email: 'sarah@mitchellhomes.com', phone: '(555) 234-8901',
      business_name: 'Mitchell Homes', lead_score: 'hot', source: 'Referral', city: 'Beverly Hills',
      created_at: daysAgo(45), last_contacted_at: daysAgo(1), linkedin_url: 'https://linkedin.com/in/sarahmitchell',
      tags: [{ name: 'VIP Buyer', color: '#dc2626' }, { name: 'Pre-Approved', color: '#16a34a' }],
    },
    {
      id: 'lx-c2', name: 'David Chen', email: 'david.chen@luxeliving.com', phone: '(555) 345-6789',
      business_name: 'Luxe Living Properties', lead_score: 'hot', source: 'Website', city: 'Malibu',
      created_at: daysAgo(30), last_contacted_at: daysAgo(2), linkedin_url: 'https://linkedin.com/in/davidchen',
      tags: [{ name: 'Investor', color: '#9333ea' }],
    },
    {
      id: 'lx-c3', name: 'Emily Rodriguez', email: 'emily.r@gmail.com', phone: '(555) 456-7890',
      business_name: 'Rodriguez Family Trust', lead_score: 'warm', source: 'Open House', city: 'Santa Monica',
      created_at: daysAgo(20), last_contacted_at: daysAgo(5), linkedin_url: null,
      tags: [{ name: 'First-Time Buyer', color: '#0284c7' }],
    },
    {
      id: 'lx-c4', name: 'James Patterson', email: 'jpatterson@outlook.com', phone: '(555) 567-8901',
      business_name: 'Patterson Enterprises', lead_score: 'warm', source: 'LinkedIn', city: 'Bel Air',
      created_at: daysAgo(15), last_contacted_at: daysAgo(3), linkedin_url: 'https://linkedin.com/in/jamespatterson',
      tags: [{ name: 'Luxury', color: '#c9a96e' }],
    },
    {
      id: 'lx-c5', name: 'Maria Santos', email: 'maria@santosgroup.com', phone: '(555) 678-9012',
      business_name: 'Santos Investment Group', lead_score: 'hot', source: 'Referral', city: 'Hollywood Hills',
      created_at: daysAgo(60), last_contacted_at: daysAgo(1), linkedin_url: 'https://linkedin.com/in/mariasantos',
      tags: [{ name: 'Investor', color: '#9333ea' }, { name: 'VIP Buyer', color: '#dc2626' }],
    },
    {
      id: 'lx-c6', name: 'Robert Kim', email: 'rkim@kimproperties.com', phone: '(555) 789-0123',
      business_name: 'Kim Properties LLC', lead_score: 'cold', source: 'Cold Call', city: 'Pasadena',
      created_at: daysAgo(90), last_contacted_at: daysAgo(30), linkedin_url: null,
      tags: [],
    },
    {
      id: 'lx-c7', name: 'Amanda Foster', email: 'amanda.foster@email.com', phone: '(555) 890-1234',
      business_name: '', lead_score: 'warm', source: 'Instagram', city: 'Venice',
      created_at: daysAgo(10), last_contacted_at: daysAgo(4), linkedin_url: null,
      tags: [{ name: 'Downsizing', color: '#f59e0b' }],
    },
    {
      id: 'lx-c8', name: 'Thomas Wright', email: 'twright@wrightdev.com', phone: '(555) 901-2345',
      business_name: 'Wright Development', lead_score: 'hot', source: 'Conference', city: 'Century City',
      created_at: daysAgo(7), last_contacted_at: daysAgo(1), linkedin_url: 'https://linkedin.com/in/thomaswright',
      tags: [{ name: 'Developer', color: '#7c3aed' }, { name: 'High Net Worth', color: '#c9a96e' }],
    },
    {
      id: 'lx-c9', name: 'Lisa Nguyen', email: 'lisa.ng@gmail.com', phone: '(555) 012-3456',
      business_name: 'Nguyen Medical Practice', lead_score: 'warm', source: 'Website', city: 'Calabasas',
      created_at: daysAgo(25), last_contacted_at: daysAgo(7), linkedin_url: 'https://linkedin.com/in/lisanguyen',
      tags: [{ name: 'Relocation', color: '#06b6d4' }],
    },
    {
      id: 'lx-c10', name: 'Michael Brooks', email: 'mbrooks@email.com', phone: '(555) 123-4567',
      business_name: '', lead_score: 'cold', source: 'Zillow', city: 'Encino',
      created_at: daysAgo(120), last_contacted_at: daysAgo(45), linkedin_url: null,
      tags: [],
    },
  ],
  pipelineStages: ['New Lead', 'Qualified', 'Showing Scheduled', 'Offer Made', 'Under Contract', 'Closed Won'],
  opportunities: [
    { id: 'lx-o1', contact_name: 'Sarah Mitchell', business_name: 'Mitchell Homes', value: 2500000, stage: 'Under Contract', next_follow_up: daysFromNow(2), created_at: daysAgo(30) },
    { id: 'lx-o2', contact_name: 'David Chen', business_name: 'Luxe Living Properties', value: 4200000, stage: 'Offer Made', next_follow_up: daysFromNow(1), created_at: daysAgo(20) },
    { id: 'lx-o3', contact_name: 'Maria Santos', business_name: 'Santos Investment Group', value: 3800000, stage: 'Showing Scheduled', next_follow_up: daysFromNow(3), created_at: daysAgo(15) },
    { id: 'lx-o4', contact_name: 'Thomas Wright', business_name: 'Wright Development', value: 8500000, stage: 'Qualified', next_follow_up: daysFromNow(5), created_at: daysAgo(7) },
    { id: 'lx-o5', contact_name: 'Emily Rodriguez', business_name: 'Rodriguez Family Trust', value: 1200000, stage: 'Showing Scheduled', next_follow_up: daysFromNow(4), created_at: daysAgo(12) },
    { id: 'lx-o6', contact_name: 'James Patterson', business_name: 'Patterson Enterprises', value: 5600000, stage: 'New Lead', next_follow_up: daysFromNow(1), created_at: daysAgo(3) },
    { id: 'lx-o7', contact_name: 'Lisa Nguyen', business_name: 'Nguyen Medical Practice', value: 1800000, stage: 'Qualified', next_follow_up: daysFromNow(6), created_at: daysAgo(10) },
    { id: 'lx-o8', contact_name: 'Amanda Foster', business_name: '', value: 950000, stage: 'New Lead', next_follow_up: daysFromNow(2), created_at: daysAgo(5) },
  ],
  appointments: [
    { id: 'lx-a1', title: 'Property Showing - 1240 Sunset Blvd', contact_name: 'Sarah Mitchell', datetime: todayAt(10, 30), location: '1240 Sunset Blvd, Beverly Hills', status: 'scheduled' },
    { id: 'lx-a2', title: 'Listing Presentation', contact_name: 'David Chen', datetime: todayAt(14, 0), location: 'Zoom Video Call', status: 'scheduled' },
    { id: 'lx-a3', title: 'Coffee Meeting - Investment Portfolio', contact_name: 'Maria Santos', datetime: daysFromNowAt(1, 9, 0), location: 'The Coffee Bean, Beverly Hills', status: 'scheduled' },
    { id: 'lx-a4', title: 'Open House Preview', contact_name: 'Thomas Wright', datetime: daysFromNowAt(2, 11, 0), location: '8900 Wilshire Blvd', status: 'scheduled' },
    { id: 'lx-a5', title: 'Offer Review Meeting', contact_name: 'Emily Rodriguez', datetime: daysFromNowAt(3, 15, 30), location: 'Office - Conference Room A', status: 'scheduled' },
    { id: 'lx-a6', title: 'Closing Walk-Through', contact_name: 'Sarah Mitchell', datetime: daysFromNowAt(5, 10, 0), location: '1240 Sunset Blvd, Beverly Hills', status: 'scheduled' },
    { id: 'lx-a7', title: 'Market Analysis Call', contact_name: 'James Patterson', datetime: daysAgo(1), location: 'Phone Call', status: 'completed' },
    { id: 'lx-a8', title: 'Initial Consultation', contact_name: 'Robert Kim', datetime: daysAgo(3), location: 'Office', status: 'no_show' },
  ],
  socialPosts: [
    { id: 'lx-s1', platform: 'instagram', content: 'Just listed! Stunning 5-bed estate in Beverly Hills with panoramic city views. This architectural masterpiece features a resort-style pool, home theater, and wine cellar. DM for private showing. #LuxuryRealEstate #BeverlyHills #DreamHome', scheduled_at: daysFromNowAt(1, 10, 0), status: 'scheduled' },
    { id: 'lx-s2', platform: 'facebook', content: 'Thrilled to announce another successful closing! Congratulations to the Chen family on their beautiful new Malibu oceanfront property. It was a pleasure helping you find your dream home.', scheduled_at: daysFromNowAt(2, 12, 0), status: 'scheduled' },
    { id: 'lx-s3', platform: 'linkedin', content: 'Q4 Market Update: Beverly Hills luxury market remains strong with 12% YoY price appreciation. Average days on market for $3M+ properties dropped to 45 days. Contact us for a complimentary market analysis of your property.', scheduled_at: daysFromNowAt(3, 9, 0), status: 'scheduled' },
    { id: 'lx-s4', platform: 'instagram', content: 'Weekend open house alert! Join us Saturday 1-4pm at this stunning modern farmhouse in Bel Air. 4 beds, 5 baths, chef\'s kitchen, and a breathtaking infinity pool. Link in bio for details.', scheduled_at: daysFromNowAt(4, 11, 0), status: 'scheduled' },
    { id: 'lx-s5', platform: 'facebook', content: 'Looking to buy or sell in Los Angeles? Our team closed $45M in transactions this quarter. Schedule your free consultation today and let us show you why Luxe Realty Group is the #1 choice for luxury real estate.', scheduled_at: daysFromNowAt(5, 14, 0), status: 'draft' },
    { id: 'lx-s6', platform: 'linkedin', content: 'Excited to share that Luxe Realty Group has been named a top 10 luxury brokerage in Los Angeles by Luxury Real Estate Magazine. Thank you to our incredible team and loyal clients!', scheduled_at: daysAgo(2), status: 'published' },
    { id: 'lx-s7', platform: 'instagram', content: 'Behind the scenes at today\'s luxury staging. Every detail matters when presenting a $4.2M property. Swipe to see the transformation.', scheduled_at: daysAgo(5), status: 'published' },
    { id: 'lx-s8', platform: 'facebook', content: 'Tips for first-time luxury home buyers: 1) Get pre-approved 2) Know your must-haves vs nice-to-haves 3) Work with an experienced luxury agent 4) Don\'t skip the inspection. Contact us to start your journey!', scheduled_at: daysAgo(7), status: 'published' },
  ],
  stats: {
    totalContacts: 10,
    hotLeads: 4,
    warmLeads: 3,
    coldLeads: 2,
    totalPipelineValue: 28550000,
    appointmentsThisWeek: 6,
    postsScheduled: 5,
    postsPublished: 3,
    conversionRate: 34,
    avgDealSize: 3200000,
    dealsClosedThisMonth: 3,
    revenueThisMonth: 287500,
  },
}

// ============================================================
// ACCOUNT 2: Coastal Homes & Living
// ============================================================
const coastalHomes: DemoAccount = {
  id: 'coastal-homes',
  name: 'Coastal Homes & Living',
  companyName: 'Coastal Homes & Living',
  industry: 'Real Estate',
  primaryColor: '#0d9488',
  secondaryColor: '#0c1222',
  logoInitial: 'C',
  contacts: [
    {
      id: 'ch-c1', name: 'Jennifer Walsh', email: 'jen@walshfamily.com', phone: '(555) 111-2233',
      business_name: '', lead_score: 'hot', source: 'Website', city: 'Laguna Beach',
      created_at: daysAgo(30), last_contacted_at: daysAgo(1), linkedin_url: null,
      tags: [{ name: 'Beach Buyer', color: '#0891b2' }, { name: 'Cash Offer', color: '#16a34a' }],
    },
    {
      id: 'ch-c2', name: 'Mark Thompson', email: 'mthompson@coastinvest.com', phone: '(555) 222-3344',
      business_name: 'Coast Investment Partners', lead_score: 'hot', source: 'Referral', city: 'Newport Beach',
      created_at: daysAgo(45), last_contacted_at: daysAgo(2), linkedin_url: 'https://linkedin.com/in/markthompson',
      tags: [{ name: 'Investor', color: '#9333ea' }, { name: 'Multi-Property', color: '#f59e0b' }],
    },
    {
      id: 'ch-c3', name: 'Rachel Green', email: 'rachel.green@email.com', phone: '(555) 333-4455',
      business_name: '', lead_score: 'warm', source: 'Instagram', city: 'Dana Point',
      created_at: daysAgo(14), last_contacted_at: daysAgo(3), linkedin_url: null,
      tags: [{ name: 'Vacation Home', color: '#f97316' }],
    },
    {
      id: 'ch-c4', name: 'Carlos Mendoza', email: 'carlos@mendozalaw.com', phone: '(555) 444-5566',
      business_name: 'Mendoza Law Firm', lead_score: 'warm', source: 'Open House', city: 'San Clemente',
      created_at: daysAgo(21), last_contacted_at: daysAgo(5), linkedin_url: 'https://linkedin.com/in/carlosmendoza',
      tags: [{ name: 'Relocation', color: '#06b6d4' }],
    },
    {
      id: 'ch-c5', name: 'Stephanie Lee', email: 'slee@techcorp.io', phone: '(555) 555-6677',
      business_name: 'TechCorp', lead_score: 'hot', source: 'LinkedIn', city: 'Huntington Beach',
      created_at: daysAgo(10), last_contacted_at: daysAgo(1), linkedin_url: 'https://linkedin.com/in/stephanielee',
      tags: [{ name: 'Tech Exec', color: '#7c3aed' }, { name: 'Pre-Approved', color: '#16a34a' }],
    },
    {
      id: 'ch-c6', name: 'Brian O\'Connor', email: 'brian.oc@gmail.com', phone: '(555) 666-7788',
      business_name: '', lead_score: 'cold', source: 'Zillow', city: 'Seal Beach',
      created_at: daysAgo(60), last_contacted_at: daysAgo(25), linkedin_url: null,
      tags: [],
    },
    {
      id: 'ch-c7', name: 'Diana Park', email: 'diana@parkdesigns.com', phone: '(555) 777-8899',
      business_name: 'Park Interior Designs', lead_score: 'warm', source: 'Referral', city: 'Corona del Mar',
      created_at: daysAgo(8), last_contacted_at: daysAgo(2), linkedin_url: 'https://linkedin.com/in/dianapark',
      tags: [{ name: 'Design Professional', color: '#ec4899' }],
    },
    {
      id: 'ch-c8', name: 'Andrew Hayes', email: 'ahayes@hayesventures.com', phone: '(555) 888-9900',
      business_name: 'Hayes Ventures', lead_score: 'hot', source: 'Conference', city: 'Balboa Island',
      created_at: daysAgo(5), last_contacted_at: daysAgo(1), linkedin_url: 'https://linkedin.com/in/andrewhayes',
      tags: [{ name: 'Investor', color: '#9333ea' }, { name: 'High Net Worth', color: '#c9a96e' }],
    },
  ],
  pipelineStages: ['New Inquiry', 'Contacted', 'Site Visit Scheduled', 'Negotiation', 'Under Contract', 'Closed'],
  opportunities: [
    { id: 'ch-o1', contact_name: 'Jennifer Walsh', business_name: '', value: 1850000, stage: 'Under Contract', next_follow_up: daysFromNow(3), created_at: daysAgo(20) },
    { id: 'ch-o2', contact_name: 'Mark Thompson', business_name: 'Coast Investment Partners', value: 3200000, stage: 'Negotiation', next_follow_up: daysFromNow(1), created_at: daysAgo(25) },
    { id: 'ch-o3', contact_name: 'Stephanie Lee', business_name: 'TechCorp', value: 2100000, stage: 'Site Visit Scheduled', next_follow_up: daysFromNow(2), created_at: daysAgo(8) },
    { id: 'ch-o4', contact_name: 'Andrew Hayes', business_name: 'Hayes Ventures', value: 4500000, stage: 'Contacted', next_follow_up: daysFromNow(1), created_at: daysAgo(4) },
    { id: 'ch-o5', contact_name: 'Rachel Green', business_name: '', value: 975000, stage: 'Site Visit Scheduled', next_follow_up: daysFromNow(4), created_at: daysAgo(10) },
    { id: 'ch-o6', contact_name: 'Diana Park', business_name: 'Park Interior Designs', value: 1450000, stage: 'New Inquiry', next_follow_up: daysFromNow(2), created_at: daysAgo(3) },
    { id: 'ch-o7', contact_name: 'Carlos Mendoza', business_name: 'Mendoza Law Firm', value: 1650000, stage: 'Contacted', next_follow_up: daysFromNow(5), created_at: daysAgo(14) },
  ],
  appointments: [
    { id: 'ch-a1', title: 'Beach House Tour - 450 Coast Hwy', contact_name: 'Jennifer Walsh', datetime: todayAt(11, 0), location: '450 Coast Hwy, Laguna Beach', status: 'scheduled' },
    { id: 'ch-a2', title: 'Investment Portfolio Review', contact_name: 'Mark Thompson', datetime: todayAt(15, 30), location: 'Office - Newport Beach', status: 'scheduled' },
    { id: 'ch-a3', title: 'Property Walkthrough', contact_name: 'Stephanie Lee', datetime: daysFromNowAt(1, 10, 0), location: '890 Pacific Coast Hwy', status: 'scheduled' },
    { id: 'ch-a4', title: 'Design Consultation Meeting', contact_name: 'Diana Park', datetime: daysFromNowAt(2, 13, 0), location: 'Zoom Video Call', status: 'scheduled' },
    { id: 'ch-a5', title: 'Closing Documents Review', contact_name: 'Jennifer Walsh', datetime: daysFromNowAt(4, 14, 0), location: 'Title Company Office', status: 'scheduled' },
    { id: 'ch-a6', title: 'Market Analysis Presentation', contact_name: 'Andrew Hayes', datetime: daysAgo(1), location: 'Office', status: 'completed' },
    { id: 'ch-a7', title: 'Open House Prep Walk', contact_name: 'Carlos Mendoza', datetime: daysAgo(4), location: '123 Ocean View Dr', status: 'completed' },
  ],
  socialPosts: [
    { id: 'ch-s1', platform: 'instagram', content: 'Wake up to this view every morning. Oceanfront living at its finest in Laguna Beach. 3 bed, 3 bath, direct beach access. Schedule your private tour today. #CoastalLiving #LagunaBeach #OceanfrontHome', scheduled_at: daysFromNowAt(1, 9, 0), status: 'scheduled' },
    { id: 'ch-s2', platform: 'facebook', content: 'NEW LISTING ALERT! Beautiful Cape Cod-style home in Dana Point with ocean views from every room. Open house this Saturday 12-3pm. Come see why the Orange County coast is the best place to call home!', scheduled_at: daysFromNowAt(2, 11, 0), status: 'scheduled' },
    { id: 'ch-s3', platform: 'linkedin', content: 'Coastal real estate market update: Inventory in South Orange County remains tight with only 2.3 months of supply. If you\'re thinking about selling, now is an excellent time. Let\'s connect to discuss your options.', scheduled_at: daysFromNowAt(3, 8, 30), status: 'scheduled' },
    { id: 'ch-s4', platform: 'instagram', content: 'From "For Sale" to "Sold" in just 12 days! Another happy family settling into their dream coastal home. Nothing beats helping people find their perfect place by the sea.', scheduled_at: daysFromNowAt(5, 10, 0), status: 'draft' },
    { id: 'ch-s5', platform: 'facebook', content: '5 reasons to invest in coastal property: 1) Strong appreciation 2) Rental income potential 3) Lifestyle benefits 4) Limited supply 5) Tax advantages. Ready to start? Call us today!', scheduled_at: daysAgo(3), status: 'published' },
    { id: 'ch-s6', platform: 'instagram', content: 'Sunset from our latest listing in Newport Beach. Some things you just can\'t put a price on... but we can help you get close. DM us for details!', scheduled_at: daysAgo(6), status: 'published' },
  ],
  stats: {
    totalContacts: 8,
    hotLeads: 4,
    warmLeads: 3,
    coldLeads: 1,
    totalPipelineValue: 15725000,
    appointmentsThisWeek: 5,
    postsScheduled: 3,
    postsPublished: 2,
    conversionRate: 28,
    avgDealSize: 2150000,
    dealsClosedThisMonth: 2,
    revenueThisMonth: 193500,
  },
}

// ============================================================
// ACCOUNT 3: Summit Financial Advisors
// ============================================================
const summitFinancial: DemoAccount = {
  id: 'summit-financial',
  name: 'Summit Financial Advisors',
  companyName: 'Summit Financial Advisors',
  industry: 'Financial Services',
  primaryColor: '#7c3aed',
  secondaryColor: '#1a0f2e',
  logoInitial: 'S',
  contacts: [
    {
      id: 'sf-c1', name: 'Richard Blackwell', email: 'rblackwell@blackwellind.com', phone: '(555) 100-2001',
      business_name: 'Blackwell Industries', lead_score: 'hot', source: 'Referral', city: 'Manhattan',
      created_at: daysAgo(60), last_contacted_at: daysAgo(1), linkedin_url: 'https://linkedin.com/in/richardblackwell',
      tags: [{ name: 'High Net Worth', color: '#c9a96e' }, { name: 'Portfolio Review', color: '#7c3aed' }],
    },
    {
      id: 'sf-c2', name: 'Katherine Moore', email: 'kmoore@moorefoundation.org', phone: '(555) 200-3002',
      business_name: 'Moore Family Foundation', lead_score: 'hot', source: 'Event', city: 'Greenwich',
      created_at: daysAgo(40), last_contacted_at: daysAgo(2), linkedin_url: 'https://linkedin.com/in/katherinemoore',
      tags: [{ name: 'Foundation', color: '#0891b2' }, { name: 'Estate Planning', color: '#dc2626' }],
    },
    {
      id: 'sf-c3', name: 'Alexander Volkov', email: 'avolkov@volkovtech.com', phone: '(555) 300-4003',
      business_name: 'Volkov Technologies', lead_score: 'hot', source: 'LinkedIn', city: 'San Francisco',
      created_at: daysAgo(25), last_contacted_at: daysAgo(1), linkedin_url: 'https://linkedin.com/in/alexandervolkov',
      tags: [{ name: 'Tech Founder', color: '#2563eb' }, { name: 'IPO Planning', color: '#f59e0b' }],
    },
    {
      id: 'sf-c4', name: 'Patricia Williams', email: 'pwilliams@email.com', phone: '(555) 400-5004',
      business_name: '', lead_score: 'warm', source: 'Website', city: 'Stamford',
      created_at: daysAgo(18), last_contacted_at: daysAgo(4), linkedin_url: null,
      tags: [{ name: 'Retirement Planning', color: '#16a34a' }],
    },
    {
      id: 'sf-c5', name: 'Daniel Nakamura', email: 'dnakamura@nkcapital.com', phone: '(555) 500-6005',
      business_name: 'NK Capital Management', lead_score: 'warm', source: 'Conference', city: 'Chicago',
      created_at: daysAgo(35), last_contacted_at: daysAgo(7), linkedin_url: 'https://linkedin.com/in/danielnakamura',
      tags: [{ name: 'Wealth Management', color: '#9333ea' }],
    },
    {
      id: 'sf-c6', name: 'Susan Clarke', email: 'sclarke@clarkemed.com', phone: '(555) 600-7006',
      business_name: 'Clarke Medical Group', lead_score: 'hot', source: 'Referral', city: 'Boston',
      created_at: daysAgo(12), last_contacted_at: daysAgo(1), linkedin_url: 'https://linkedin.com/in/susanclarke',
      tags: [{ name: 'Medical Professional', color: '#ec4899' }, { name: 'Tax Strategy', color: '#f97316' }],
    },
    {
      id: 'sf-c7', name: 'George Henderson', email: 'ghenderson@hendersonfarms.com', phone: '(555) 700-8007',
      business_name: 'Henderson Agricultural', lead_score: 'warm', source: 'Cold Email', city: 'Dallas',
      created_at: daysAgo(50), last_contacted_at: daysAgo(10), linkedin_url: null,
      tags: [{ name: 'Agriculture', color: '#22c55e' }],
    },
    {
      id: 'sf-c8', name: 'Michelle Torres', email: 'mtorres@torresarch.com', phone: '(555) 800-9008',
      business_name: 'Torres Architecture', lead_score: 'cold', source: 'Website', city: 'Miami',
      created_at: daysAgo(90), last_contacted_at: daysAgo(30), linkedin_url: 'https://linkedin.com/in/michelletorres',
      tags: [],
    },
    {
      id: 'sf-c9', name: 'William Chang', email: 'wchang@changventures.com', phone: '(555) 900-0009',
      business_name: 'Chang Ventures', lead_score: 'hot', source: 'Referral', city: 'Seattle',
      created_at: daysAgo(8), last_contacted_at: daysAgo(1), linkedin_url: 'https://linkedin.com/in/williamchang',
      tags: [{ name: 'Venture Capital', color: '#2563eb' }, { name: 'High Net Worth', color: '#c9a96e' }],
    },
    {
      id: 'sf-c10', name: 'Elizabeth Grant', email: 'egrant@grantlaw.com', phone: '(555) 010-1110',
      business_name: 'Grant & Associates Law', lead_score: 'warm', source: 'Event', city: 'Washington DC',
      created_at: daysAgo(20), last_contacted_at: daysAgo(3), linkedin_url: 'https://linkedin.com/in/elizabethgrant',
      tags: [{ name: 'Legal Professional', color: '#475569' }, { name: 'Trust Planning', color: '#7c3aed' }],
    },
    {
      id: 'sf-c11', name: 'Robert Patel', email: 'rpatel@patelgroup.com', phone: '(555) 020-2220',
      business_name: 'Patel Holdings Group', lead_score: 'warm', source: 'LinkedIn', city: 'Houston',
      created_at: daysAgo(15), last_contacted_at: daysAgo(5), linkedin_url: 'https://linkedin.com/in/robertpatel',
      tags: [{ name: 'Real Estate Portfolio', color: '#f59e0b' }],
    },
    {
      id: 'sf-c12', name: 'Amy Richardson', email: 'arichardson@email.com', phone: '(555) 030-3330',
      business_name: '', lead_score: 'cold', source: 'Website', city: 'Portland',
      created_at: daysAgo(75), last_contacted_at: daysAgo(40), linkedin_url: null,
      tags: [],
    },
  ],
  pipelineStages: ['Discovery', 'Financial Analysis', 'Proposal Sent', 'Review Meeting', 'Agreement Signed'],
  opportunities: [
    { id: 'sf-o1', contact_name: 'Richard Blackwell', business_name: 'Blackwell Industries', value: 5000000, stage: 'Review Meeting', next_follow_up: daysFromNow(1), created_at: daysAgo(30) },
    { id: 'sf-o2', contact_name: 'Katherine Moore', business_name: 'Moore Family Foundation', value: 12000000, stage: 'Proposal Sent', next_follow_up: daysFromNow(3), created_at: daysAgo(20) },
    { id: 'sf-o3', contact_name: 'Alexander Volkov', business_name: 'Volkov Technologies', value: 8500000, stage: 'Financial Analysis', next_follow_up: daysFromNow(2), created_at: daysAgo(15) },
    { id: 'sf-o4', contact_name: 'Susan Clarke', business_name: 'Clarke Medical Group', value: 3200000, stage: 'Proposal Sent', next_follow_up: daysFromNow(4), created_at: daysAgo(10) },
    { id: 'sf-o5', contact_name: 'William Chang', business_name: 'Chang Ventures', value: 15000000, stage: 'Discovery', next_follow_up: daysFromNow(1), created_at: daysAgo(5) },
    { id: 'sf-o6', contact_name: 'Elizabeth Grant', business_name: 'Grant & Associates Law', value: 2800000, stage: 'Financial Analysis', next_follow_up: daysFromNow(5), created_at: daysAgo(12) },
    { id: 'sf-o7', contact_name: 'Daniel Nakamura', business_name: 'NK Capital Management', value: 6500000, stage: 'Discovery', next_follow_up: daysFromNow(3), created_at: daysAgo(18) },
    { id: 'sf-o8', contact_name: 'Robert Patel', business_name: 'Patel Holdings Group', value: 4200000, stage: 'Discovery', next_follow_up: daysFromNow(6), created_at: daysAgo(8) },
    { id: 'sf-o9', contact_name: 'Patricia Williams', business_name: '', value: 1500000, stage: 'Financial Analysis', next_follow_up: daysFromNow(4), created_at: daysAgo(14) },
  ],
  appointments: [
    { id: 'sf-a1', title: 'Portfolio Strategy Review', contact_name: 'Richard Blackwell', datetime: todayAt(9, 0), location: 'Office - Board Room', status: 'scheduled' },
    { id: 'sf-a2', title: 'Estate Planning Consultation', contact_name: 'Katherine Moore', datetime: todayAt(13, 30), location: 'Zoom Video Call', status: 'scheduled' },
    { id: 'sf-a3', title: 'IPO Tax Strategy Session', contact_name: 'Alexander Volkov', datetime: daysFromNowAt(1, 11, 0), location: 'Google Meet', status: 'scheduled' },
    { id: 'sf-a4', title: 'Retirement Planning Review', contact_name: 'Patricia Williams', datetime: daysFromNowAt(1, 15, 0), location: 'Office', status: 'scheduled' },
    { id: 'sf-a5', title: 'Medical Practice Financial Review', contact_name: 'Susan Clarke', datetime: daysFromNowAt(2, 10, 0), location: 'Zoom Video Call', status: 'scheduled' },
    { id: 'sf-a6', title: 'VC Fund Structure Meeting', contact_name: 'William Chang', datetime: daysFromNowAt(3, 14, 30), location: 'Office - Conference Room', status: 'scheduled' },
    { id: 'sf-a7', title: 'Trust Planning Session', contact_name: 'Elizabeth Grant', datetime: daysFromNowAt(4, 11, 0), location: 'Phone Call', status: 'scheduled' },
    { id: 'sf-a8', title: 'Quarterly Review Call', contact_name: 'Daniel Nakamura', datetime: daysAgo(2), location: 'Zoom', status: 'completed' },
    { id: 'sf-a9', title: 'Initial Consultation', contact_name: 'George Henderson', datetime: daysAgo(5), location: 'Office', status: 'completed' },
  ],
  socialPosts: [
    { id: 'sf-s1', platform: 'linkedin', content: 'Market volatility creating opportunities? Our latest analysis shows 3 sectors positioned for growth in 2026. Download our free whitepaper to learn how high-net-worth investors are positioning their portfolios. #WealthManagement #InvestmentStrategy', scheduled_at: daysFromNowAt(1, 8, 0), status: 'scheduled' },
    { id: 'sf-s2', platform: 'facebook', content: 'Tax planning tip: Year-end is approaching. Have you reviewed your tax-loss harvesting opportunities? Our advisors can help you optimize your portfolio for tax efficiency. Schedule a complimentary review today.', scheduled_at: daysFromNowAt(2, 10, 0), status: 'scheduled' },
    { id: 'sf-s3', platform: 'linkedin', content: 'Proud to welcome 3 new ultra-high-net-worth families to Summit Financial this quarter. Our AUM now exceeds $2.1B. Thank you for trusting us with your financial future. #FinancialPlanning #WealthManagement', scheduled_at: daysFromNowAt(3, 9, 30), status: 'scheduled' },
    { id: 'sf-s4', platform: 'facebook', content: 'Upcoming Webinar: "Estate Planning Strategies for Business Owners" - Join our senior partners for a deep dive into trust structures, succession planning, and tax optimization. Register now - limited spots available!', scheduled_at: daysFromNowAt(4, 11, 0), status: 'scheduled' },
    { id: 'sf-s5', platform: 'linkedin', content: 'The 5 biggest financial planning mistakes we see with tech founders: 1) Over-concentration in company stock 2) Ignoring estate planning 3) Poor tax strategy 4) No insurance review 5) Lifestyle creep. Contact us for a founder-focused financial review.', scheduled_at: daysFromNowAt(5, 8, 30), status: 'draft' },
    { id: 'sf-s6', platform: 'instagram', content: 'Behind the scenes at our annual client appreciation dinner. Thank you to everyone who joined us for an evening of insights and connection. Our clients aren\'t just numbers - they\'re family.', scheduled_at: daysFromNowAt(6, 12, 0), status: 'draft' },
    { id: 'sf-s7', platform: 'linkedin', content: 'Summit Financial Advisors has been named to the Barron\'s Top 100 Independent Wealth Advisors list for the 5th consecutive year. This recognition reflects our commitment to putting clients first.', scheduled_at: daysAgo(3), status: 'published' },
    { id: 'sf-s8', platform: 'facebook', content: 'Inflation, interest rates, and your portfolio - our latest market commentary is now available. Visit our website to read the full analysis and what it means for your investments.', scheduled_at: daysAgo(5), status: 'published' },
    { id: 'sf-s9', platform: 'linkedin', content: 'Congratulations to our client Alexander Volkov on the successful Series C funding of Volkov Technologies. We\'re honored to be part of your financial planning journey. #FinancialAdvisory #TechStartups', scheduled_at: daysAgo(8), status: 'published' },
    { id: 'sf-s10', platform: 'instagram', content: 'Teamwork makes the dream work! Our advisors just completed their annual advanced certification training. Always learning, always growing - for you.', scheduled_at: daysAgo(12), status: 'published' },
  ],
  stats: {
    totalContacts: 12,
    hotLeads: 5,
    warmLeads: 4,
    coldLeads: 2,
    totalPipelineValue: 58700000,
    appointmentsThisWeek: 7,
    postsScheduled: 4,
    postsPublished: 4,
    conversionRate: 42,
    avgDealSize: 5800000,
    dealsClosedThisMonth: 2,
    revenueThisMonth: 485000,
  },
}

// ============================================================
// Export all accounts
// ============================================================
export const DEMO_ACCOUNTS: DemoAccount[] = [luxeRealty, coastalHomes, summitFinancial]

export function getDemoAccount(accountId: string): DemoAccount | undefined {
  return DEMO_ACCOUNTS.find(a => a.id === accountId)
}

// Admin users who can see all demo accounts
export const DEMO_ADMIN_EMAILS = ['alex@pristinepartners.com', 'alex@pristine.com']

export function isAdminUser(email: string): boolean {
  const prefix = email.split('@')[0]?.toLowerCase()
  return prefix === 'alex'
}
