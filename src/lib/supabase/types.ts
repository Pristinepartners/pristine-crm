export type Owner = 'alex' | 'mikail'

export type LeadScore = 'hot' | 'warm' | 'cold'

export type ActivityOutcome =
  | 'Answered'
  | 'No Answer'
  | 'Voicemail'
  | 'Not Interested'
  | 'Callback'
  | 'Meeting Booked'
  | 'Left Message'
  | 'Wrong Number'

export type ActivityChannel = 'Phone' | 'LinkedIn' | 'Email'

export type AppointmentStatus = 'scheduled' | 'completed' | 'cancelled' | 'no_show'

export interface Contact {
  id: string
  organization_id: string
  name: string
  email: string | null
  phone: string | null
  business_name: string | null
  address: string | null
  city: string | null
  postal_code: string | null
  website: string | null
  linkedin_url: string | null
  notes: string | null
  source: string | null
  last_contacted_at: string | null
  lead_score: LeadScore | null
  owner: Owner
  created_at: string
}

export interface Pipeline {
  id: string
  organization_id: string
  name: string
  stages: string[]
}

export interface Opportunity {
  id: string
  contact_id: string
  pipeline_id: string
  stage: string
  opportunity_value: number | null
  next_follow_up_date: string | null
  owner: Owner
  created_at: string
  updated_at: string
  // Joined fields
  contact?: Contact
  pipeline?: Pipeline
}

export interface Activity {
  id: string
  opportunity_id: string | null
  contact_id: string
  outcome: ActivityOutcome
  next_action: string | null
  channel: ActivityChannel
  notes: string | null
  logged_by: Owner
  logged_at: string
}

export interface Appointment {
  id: string
  contact_id: string
  opportunity_id: string | null
  title: string
  datetime: string
  location: string | null
  status: AppointmentStatus
  created_at: string
  // Joined fields
  contact?: Contact
}

// Daily Task for work list
export interface DailyTask {
  id: string
  owner: Owner
  title: string
  completed: boolean
  due_date: string
  scheduled_time: string | null
  priority: 'low' | 'medium' | 'high'
  is_company_wide: boolean
  created_at: string
}

// Notification
export interface Notification {
  id: string
  owner: Owner
  title: string
  message: string
  type: 'follow_up' | 'reminder' | 'system'
  read: boolean
  link?: string
  created_at: string
}

// Tag
export interface Tag {
  id: string
  name: string
  color: string
  created_at: string
}

// Contact Tag junction
export interface ContactTag {
  contact_id: string
  tag_id: string
  added_at: string
  tag?: Tag
}

// Email Template
export interface EmailTemplate {
  id: string
  name: string
  subject: string
  content: string
  created_at: string
  updated_at: string
}

// Agency Platform Types
export type ClientType = 'solo_agent' | 'team' | 'brokerage'
export type SubscriptionTier = 'starter' | 'professional' | 'enterprise'
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled' | 'trial'
export type ProjectType = 'website' | 'landing_page' | 'rebrand' | 'seo_campaign' | 'social_campaign' | 'ad_campaign' | 'content_creation' | 'other'
export type ProjectStatus = 'pending' | 'in_progress' | 'review' | 'completed' | 'on_hold' | 'cancelled'
export type PropertyType = 'single_family' | 'condo' | 'townhouse' | 'multi_family' | 'land' | 'commercial'
export type ListingStatus = 'active' | 'pending' | 'sold' | 'expired' | 'withdrawn'
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'

export interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  company_name: string | null
  company_type: ClientType | null
  website_url: string | null
  logo_url: string | null
  address: string | null
  city: string | null
  state: string | null
  subscription_tier: SubscriptionTier
  subscription_status: SubscriptionStatus
  monthly_fee: number | null
  contract_start_date: string | null
  contract_end_date: string | null
  notes: string | null
  owner: Owner
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  client_id: string
  name: string
  project_type: ProjectType
  status: ProjectStatus
  priority: 'low' | 'medium' | 'high' | 'urgent'
  description: string | null
  start_date: string | null
  due_date: string | null
  completed_date: string | null
  budget: number | null
  assigned_to: Owner | null
  created_at: string
  updated_at: string
  client?: Client
}

export interface ProjectTask {
  id: string
  project_id: string
  title: string
  description: string | null
  status: 'pending' | 'in_progress' | 'completed'
  assigned_to: Owner | null
  due_date: string | null
  completed_at: string | null
  sort_order: number
  created_at: string
}

export interface PropertyListing {
  id: string
  client_id: string
  mls_number: string | null
  address: string
  city: string | null
  state: string | null
  zip_code: string | null
  property_type: PropertyType | null
  listing_status: ListingStatus
  price: number | null
  bedrooms: number | null
  bathrooms: number | null
  square_feet: number | null
  description: string | null
  featured_image_url: string | null
  virtual_tour_url: string | null
  is_featured: boolean
  listed_date: string | null
  sold_date: string | null
  sold_price: number | null
  created_at: string
  updated_at: string
  client?: Client
}

export interface ContentAsset {
  id: string
  name: string
  asset_type: 'template' | 'image' | 'video' | 'document' | 'brand_kit'
  category: string | null
  file_url: string | null
  thumbnail_url: string | null
  description: string | null
  tags: string[] | null
  client_id: string | null
  is_global: boolean
  created_at: string
  client?: Client
}

export interface ClientCommunication {
  id: string
  client_id: string
  communication_type: 'email' | 'call' | 'meeting' | 'note'
  subject: string | null
  content: string | null
  logged_by: Owner
  logged_at: string
}

export interface Invoice {
  id: string
  client_id: string
  invoice_number: string
  amount: number
  status: InvoiceStatus
  due_date: string | null
  paid_date: string | null
  description: string | null
  line_items: { description: string; amount: number }[]
  created_at: string
  client?: Client
}

// User Settings
export interface UserSettings {
  id: string
  owner: Owner
  follow_up_reminder_enabled: boolean
  follow_up_reminder_time: string // HH:mm format
  email_notifications: boolean
  theme: 'light' | 'dark' | 'system'
  default_pipeline_id: string | null
  created_at: string
  updated_at: string
}

// Sub-Account Types
export interface SubAccount {
  id: string
  name: string
  company_name: string
  industry: string
  primary_color: string
  secondary_color: string
  logo_initial: string
  logo_url: string | null
  pipeline_stages: string[]
  is_active: boolean
  created_by: string
  created_at: string
  updated_at: string
}

export interface SubAccountContact {
  id: string
  sub_account_id: string
  name: string
  email: string | null
  phone: string | null
  business_name: string | null
  city: string | null
  address: string | null
  linkedin_url: string | null
  lead_score: LeadScore
  source: string | null
  engagement_score: number
  last_contacted_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
  tags?: SubAccountContactTag[]
}

export interface SubAccountContactTag {
  id: string
  contact_id: string
  name: string
  color: string
  created_at: string
}

export interface SubAccountOpportunity {
  id: string
  sub_account_id: string
  contact_id: string | null
  contact_name: string
  business_name: string | null
  stage: string
  value: number
  next_follow_up: string | null
  closed_at: string | null
  closed_won: boolean | null
  created_at: string
  updated_at: string
}

export interface SubAccountAppointment {
  id: string
  sub_account_id: string
  contact_id: string | null
  title: string
  contact_name: string
  datetime: string
  location: string | null
  status: AppointmentStatus
  notes: string | null
  created_at: string
}

export interface SubAccountSocialPost {
  id: string
  sub_account_id: string
  platform: 'facebook' | 'instagram' | 'linkedin'
  content: string
  image_url: string | null
  scheduled_at: string
  status: 'draft' | 'scheduled' | 'published'
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface SubAccountWebsiteVisit {
  id: string
  sub_account_id: string
  contact_id: string | null
  page_url: string
  page_title: string | null
  duration_seconds: number
  visited_at: string
}

export interface SubAccountLeadEvent {
  id: string
  sub_account_id: string
  contact_id: string | null
  event_type: 'email_open' | 'link_click' | 'page_view' | 'form_submit' | 'call' | 'meeting' | 'social_interaction'
  description: string | null
  metadata: Record<string, unknown>
  occurred_at: string
}

export interface SubAccountActivity {
  id: string
  sub_account_id: string
  contact_id: string | null
  opportunity_id: string | null
  activity_type: 'call' | 'email' | 'meeting' | 'note' | 'task'
  title: string
  description: string | null
  summary: { participants?: string[]; key_points?: string[]; action_items?: string[]; next_steps?: string[] } | null
  logged_by: string
  logged_at: string
}

export interface SubAccountStageHistory {
  id: string
  opportunity_id: string
  from_stage: string | null
  to_stage: string
  changed_at: string
}

export interface SubAccountSignal {
  id: string
  sub_account_id: string
  contact_id: string | null
  signal_type: 'purchase_intent' | 'sale_intent' | 're_engagement' | 'deal_at_risk' | 'high_engagement'
  confidence: number
  title: string
  description: string | null
  dismissed: boolean
  created_at: string
}

export interface SubAccountOutreachSuggestion {
  id: string
  sub_account_id: string
  contact_id: string | null
  suggestion_type: 'follow_up' | 'post_meeting' | 'negotiation_check' | 're_engagement' | 'introduction'
  subject: string
  message_template: string
  sent: boolean
  created_at: string
}

// Database type definition for Supabase client
export type Database = {
  public: {
    Tables: {
      contacts: {
        Row: {
          id: string
          organization_id: string
          name: string
          email: string | null
          phone: string | null
          business_name: string | null
          address: string | null
          city: string | null
          postal_code: string | null
          website: string | null
          linkedin_url: string | null
          notes: string | null
          source: string | null
          last_contacted_at: string | null
          lead_score: string
          owner: string
          created_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          email?: string | null
          phone?: string | null
          business_name?: string | null
          address?: string | null
          city?: string | null
          postal_code?: string | null
          website?: string | null
          linkedin_url?: string | null
          notes?: string | null
          source?: string | null
          last_contacted_at?: string | null
          lead_score?: string
          owner: string
          created_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          business_name?: string | null
          address?: string | null
          city?: string | null
          postal_code?: string | null
          website?: string | null
          linkedin_url?: string | null
          notes?: string | null
          source?: string | null
          last_contacted_at?: string | null
          lead_score?: string
          owner?: string
          created_at?: string
        }
        Relationships: []
      }
      pipelines: {
        Row: {
          id: string
          organization_id: string
          name: string
          stages: string[]
        }
        Insert: {
          id?: string
          organization_id: string
          name: string
          stages: string[]
        }
        Update: {
          id?: string
          organization_id?: string
          name?: string
          stages?: string[]
        }
        Relationships: []
      }
      opportunities: {
        Row: {
          id: string
          contact_id: string
          pipeline_id: string
          stage: string
          opportunity_value: number | null
          next_follow_up_date: string | null
          owner: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          contact_id: string
          pipeline_id: string
          stage: string
          opportunity_value?: number | null
          next_follow_up_date?: string | null
          owner: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          contact_id?: string
          pipeline_id?: string
          stage?: string
          opportunity_value?: number | null
          next_follow_up_date?: string | null
          owner?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      activities: {
        Row: {
          id: string
          opportunity_id: string | null
          contact_id: string
          outcome: string
          next_action: string | null
          channel: string
          notes: string | null
          logged_by: string
          logged_at: string
        }
        Insert: {
          id?: string
          opportunity_id?: string | null
          contact_id: string
          outcome: string
          next_action?: string | null
          channel: string
          notes?: string | null
          logged_by: string
          logged_at?: string
        }
        Update: {
          id?: string
          opportunity_id?: string | null
          contact_id?: string
          outcome?: string
          next_action?: string | null
          channel?: string
          notes?: string | null
          logged_by?: string
          logged_at?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          id: string
          contact_id: string
          opportunity_id: string | null
          title: string
          datetime: string
          location: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          contact_id: string
          opportunity_id?: string | null
          title: string
          datetime: string
          location?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          contact_id?: string
          opportunity_id?: string | null
          title?: string
          datetime?: string
          location?: string | null
          status?: string
          created_at?: string
        }
        Relationships: []
      }
      daily_tasks: {
        Row: {
          id: string
          owner: string
          title: string
          completed: boolean
          due_date: string
          scheduled_time: string | null
          priority: string
          is_company_wide: boolean
          created_at: string
        }
        Insert: {
          id?: string
          owner: string
          title: string
          completed?: boolean
          due_date: string
          scheduled_time?: string | null
          priority?: string
          is_company_wide?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          owner?: string
          title?: string
          completed?: boolean
          due_date?: string
          scheduled_time?: string | null
          priority?: string
          is_company_wide?: boolean
          created_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          id: string
          owner: string
          title: string
          message: string
          type: string
          read: boolean
          link: string | null
          created_at: string
        }
        Insert: {
          id?: string
          owner: string
          title: string
          message: string
          type: string
          read?: boolean
          link?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          owner?: string
          title?: string
          message?: string
          type?: string
          read?: boolean
          link?: string | null
          created_at?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          id: string
          owner: string
          follow_up_reminder_enabled: boolean
          follow_up_reminder_time: string
          email_notifications: boolean
          theme: string
          default_pipeline_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner: string
          follow_up_reminder_enabled?: boolean
          follow_up_reminder_time?: string
          email_notifications?: boolean
          theme?: string
          default_pipeline_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner?: string
          follow_up_reminder_enabled?: boolean
          follow_up_reminder_time?: string
          email_notifications?: boolean
          theme?: string
          default_pipeline_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      tags: {
        Row: {
          id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          created_at?: string
        }
        Relationships: []
      }
      contact_tags: {
        Row: {
          contact_id: string
          tag_id: string
          added_at: string
        }
        Insert: {
          contact_id: string
          tag_id: string
          added_at?: string
        }
        Update: {
          contact_id?: string
          tag_id?: string
          added_at?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          id: string
          name: string
          subject: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          subject: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          subject?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      automations: {
        Row: {
          id: string
          name: string
          description: string | null
          trigger_type: string
          trigger_config: Record<string, unknown>
          actions: unknown[]
          is_active: boolean
          pipeline_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          trigger_type: string
          trigger_config?: Record<string, unknown>
          actions?: unknown[]
          is_active?: boolean
          pipeline_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          trigger_type?: string
          trigger_config?: Record<string, unknown>
          actions?: unknown[]
          is_active?: boolean
          pipeline_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      social_posts: {
        Row: {
          id: string
          platform: string
          content: string
          image_url: string | null
          scheduled_at: string
          status: string
          published_at: string | null
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          platform: string
          content: string
          image_url?: string | null
          scheduled_at: string
          status?: string
          published_at?: string | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          platform?: string
          content?: string
          image_url?: string | null
          scheduled_at?: string
          status?: string
          published_at?: string | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      funnels: {
        Row: {
          id: string
          name: string
          slug: string
          content: Record<string, unknown>
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          content?: Record<string, unknown>
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          content?: Record<string, unknown>
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      websites: {
        Row: {
          id: string
          name: string
          slug: string
          content: Record<string, unknown>
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          content?: Record<string, unknown>
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          content?: Record<string, unknown>
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      forms: {
        Row: {
          id: string
          name: string
          slug: string
          content: Record<string, unknown>
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          content?: Record<string, unknown>
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          content?: Record<string, unknown>
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      surveys: {
        Row: {
          id: string
          name: string
          slug: string
          content: Record<string, unknown>
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          content?: Record<string, unknown>
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          content?: Record<string, unknown>
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      branding_settings: {
        Row: {
          id: string
          logo_url: string | null
          company_name: string
          primary_color: string
          secondary_color: string
          accent_color: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          logo_url?: string | null
          company_name?: string
          primary_color?: string
          secondary_color?: string
          accent_color?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          logo_url?: string | null
          company_name?: string
          primary_color?: string
          secondary_color?: string
          accent_color?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      meetings: {
        Row: {
          id: string
          title: string
          description: string | null
          start_time: string
          end_time: string | null
          location: string | null
          meeting_link: string | null
          is_recurring: boolean
          recurrence_pattern: string | null
          recurrence_end_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          start_time: string
          end_time?: string | null
          location?: string | null
          meeting_link?: string | null
          is_recurring?: boolean
          recurrence_pattern?: string | null
          recurrence_end_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          start_time?: string
          end_time?: string | null
          location?: string | null
          meeting_link?: string | null
          is_recurring?: boolean
          recurrence_pattern?: string | null
          recurrence_end_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      call_scripts: {
        Row: {
          id: string
          name: string
          content: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          content: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          content?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          id: string
          name: string
          email: string | null
          phone: string | null
          company_name: string | null
          company_type: string | null
          website_url: string | null
          logo_url: string | null
          address: string | null
          city: string | null
          state: string | null
          subscription_tier: string
          subscription_status: string
          monthly_fee: number | null
          contract_start_date: string | null
          contract_end_date: string | null
          notes: string | null
          owner: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email?: string | null
          phone?: string | null
          company_name?: string | null
          company_type?: string | null
          website_url?: string | null
          logo_url?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          subscription_tier?: string
          subscription_status?: string
          monthly_fee?: number | null
          contract_start_date?: string | null
          contract_end_date?: string | null
          notes?: string | null
          owner: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string | null
          phone?: string | null
          company_name?: string | null
          company_type?: string | null
          website_url?: string | null
          logo_url?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          subscription_tier?: string
          subscription_status?: string
          monthly_fee?: number | null
          contract_start_date?: string | null
          contract_end_date?: string | null
          notes?: string | null
          owner?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          id: string
          client_id: string
          name: string
          project_type: string
          status: string
          priority: string
          description: string | null
          start_date: string | null
          due_date: string | null
          completed_date: string | null
          budget: number | null
          assigned_to: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          name: string
          project_type: string
          status?: string
          priority?: string
          description?: string | null
          start_date?: string | null
          due_date?: string | null
          completed_date?: string | null
          budget?: number | null
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          name?: string
          project_type?: string
          status?: string
          priority?: string
          description?: string | null
          start_date?: string | null
          due_date?: string | null
          completed_date?: string | null
          budget?: number | null
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      project_tasks: {
        Row: {
          id: string
          project_id: string
          title: string
          description: string | null
          status: string
          assigned_to: string | null
          due_date: string | null
          completed_at: string | null
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          description?: string | null
          status?: string
          assigned_to?: string | null
          due_date?: string | null
          completed_at?: string | null
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          description?: string | null
          status?: string
          assigned_to?: string | null
          due_date?: string | null
          completed_at?: string | null
          sort_order?: number
          created_at?: string
        }
        Relationships: []
      }
      property_listings: {
        Row: {
          id: string
          client_id: string
          mls_number: string | null
          address: string
          city: string | null
          state: string | null
          zip_code: string | null
          property_type: string | null
          listing_status: string
          price: number | null
          bedrooms: number | null
          bathrooms: number | null
          square_feet: number | null
          description: string | null
          featured_image_url: string | null
          virtual_tour_url: string | null
          is_featured: boolean
          listed_date: string | null
          sold_date: string | null
          sold_price: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          mls_number?: string | null
          address: string
          city?: string | null
          state?: string | null
          zip_code?: string | null
          property_type?: string | null
          listing_status?: string
          price?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          square_feet?: number | null
          description?: string | null
          featured_image_url?: string | null
          virtual_tour_url?: string | null
          is_featured?: boolean
          listed_date?: string | null
          sold_date?: string | null
          sold_price?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          mls_number?: string | null
          address?: string
          city?: string | null
          state?: string | null
          zip_code?: string | null
          property_type?: string | null
          listing_status?: string
          price?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          square_feet?: number | null
          description?: string | null
          featured_image_url?: string | null
          virtual_tour_url?: string | null
          is_featured?: boolean
          listed_date?: string | null
          sold_date?: string | null
          sold_price?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      content_assets: {
        Row: {
          id: string
          name: string
          asset_type: string
          category: string | null
          file_url: string | null
          thumbnail_url: string | null
          description: string | null
          tags: string[] | null
          client_id: string | null
          is_global: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          asset_type: string
          category?: string | null
          file_url?: string | null
          thumbnail_url?: string | null
          description?: string | null
          tags?: string[] | null
          client_id?: string | null
          is_global?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          asset_type?: string
          category?: string | null
          file_url?: string | null
          thumbnail_url?: string | null
          description?: string | null
          tags?: string[] | null
          client_id?: string | null
          is_global?: boolean
          created_at?: string
        }
        Relationships: []
      }
      client_communications: {
        Row: {
          id: string
          client_id: string
          communication_type: string
          subject: string | null
          content: string | null
          logged_by: string
          logged_at: string
        }
        Insert: {
          id?: string
          client_id: string
          communication_type: string
          subject?: string | null
          content?: string | null
          logged_by: string
          logged_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          communication_type?: string
          subject?: string | null
          content?: string | null
          logged_by?: string
          logged_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          id: string
          client_id: string
          invoice_number: string
          amount: number
          status: string
          due_date: string | null
          paid_date: string | null
          description: string | null
          line_items: unknown
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          invoice_number: string
          amount: number
          status?: string
          due_date?: string | null
          paid_date?: string | null
          description?: string | null
          line_items?: unknown
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          invoice_number?: string
          amount?: number
          status?: string
          due_date?: string | null
          paid_date?: string | null
          description?: string | null
          line_items?: unknown
          created_at?: string
        }
        Relationships: []
      }
      sub_accounts: {
        Row: {
          id: string
          name: string
          company_name: string
          industry: string
          primary_color: string
          secondary_color: string
          logo_initial: string
          logo_url: string | null
          pipeline_stages: string
          is_active: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          company_name: string
          industry?: string
          primary_color?: string
          secondary_color?: string
          logo_initial?: string
          logo_url?: string | null
          pipeline_stages?: string
          is_active?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          company_name?: string
          industry?: string
          primary_color?: string
          secondary_color?: string
          logo_initial?: string
          logo_url?: string | null
          pipeline_stages?: string
          is_active?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      sub_account_contacts: {
        Row: {
          id: string
          sub_account_id: string
          name: string
          email: string | null
          phone: string | null
          business_name: string | null
          city: string | null
          address: string | null
          linkedin_url: string | null
          lead_score: string
          source: string | null
          engagement_score: number
          last_contacted_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sub_account_id: string
          name: string
          email?: string | null
          phone?: string | null
          business_name?: string | null
          city?: string | null
          address?: string | null
          linkedin_url?: string | null
          lead_score?: string
          source?: string | null
          engagement_score?: number
          last_contacted_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sub_account_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          business_name?: string | null
          city?: string | null
          address?: string | null
          linkedin_url?: string | null
          lead_score?: string
          source?: string | null
          engagement_score?: number
          last_contacted_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      sub_account_contact_tags: {
        Row: {
          id: string
          contact_id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          contact_id: string
          name: string
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          contact_id?: string
          name?: string
          color?: string
          created_at?: string
        }
        Relationships: []
      }
      sub_account_opportunities: {
        Row: {
          id: string
          sub_account_id: string
          contact_id: string | null
          contact_name: string
          business_name: string | null
          stage: string
          value: number
          next_follow_up: string | null
          closed_at: string | null
          closed_won: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sub_account_id: string
          contact_id?: string | null
          contact_name: string
          business_name?: string | null
          stage: string
          value?: number
          next_follow_up?: string | null
          closed_at?: string | null
          closed_won?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sub_account_id?: string
          contact_id?: string | null
          contact_name?: string
          business_name?: string | null
          stage?: string
          value?: number
          next_follow_up?: string | null
          closed_at?: string | null
          closed_won?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      sub_account_appointments: {
        Row: {
          id: string
          sub_account_id: string
          contact_id: string | null
          title: string
          contact_name: string
          datetime: string
          location: string | null
          status: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          sub_account_id: string
          contact_id?: string | null
          title: string
          contact_name: string
          datetime: string
          location?: string | null
          status?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          sub_account_id?: string
          contact_id?: string | null
          title?: string
          contact_name?: string
          datetime?: string
          location?: string | null
          status?: string
          notes?: string | null
          created_at?: string
        }
        Relationships: []
      }
      sub_account_social_posts: {
        Row: {
          id: string
          sub_account_id: string
          platform: string
          content: string
          image_url: string | null
          scheduled_at: string
          status: string
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          sub_account_id: string
          platform: string
          content: string
          image_url?: string | null
          scheduled_at: string
          status?: string
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          sub_account_id?: string
          platform?: string
          content?: string
          image_url?: string | null
          scheduled_at?: string
          status?: string
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      sub_account_lead_events: {
        Row: {
          id: string
          sub_account_id: string
          contact_id: string | null
          event_type: string
          description: string | null
          metadata: unknown
          occurred_at: string
        }
        Insert: {
          id?: string
          sub_account_id: string
          contact_id?: string | null
          event_type: string
          description?: string | null
          metadata?: unknown
          occurred_at?: string
        }
        Update: {
          id?: string
          sub_account_id?: string
          contact_id?: string | null
          event_type?: string
          description?: string | null
          metadata?: unknown
          occurred_at?: string
        }
        Relationships: []
      }
      sub_account_website_visits: {
        Row: {
          id: string
          sub_account_id: string
          contact_id: string | null
          page_url: string
          page_title: string | null
          duration_seconds: number
          visited_at: string
        }
        Insert: {
          id?: string
          sub_account_id: string
          contact_id?: string | null
          page_url: string
          page_title?: string | null
          duration_seconds?: number
          visited_at?: string
        }
        Update: {
          id?: string
          sub_account_id?: string
          contact_id?: string | null
          page_url?: string
          page_title?: string | null
          duration_seconds?: number
          visited_at?: string
        }
        Relationships: []
      }
      sub_account_signals: {
        Row: {
          id: string
          sub_account_id: string
          contact_id: string | null
          signal_type: string
          confidence: number
          title: string
          description: string | null
          dismissed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sub_account_id: string
          contact_id?: string | null
          signal_type: string
          confidence?: number
          title: string
          description?: string | null
          dismissed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sub_account_id?: string
          contact_id?: string | null
          signal_type?: string
          confidence?: number
          title?: string
          description?: string | null
          dismissed?: boolean
          created_at?: string
        }
        Relationships: []
      }
      sub_account_outreach_suggestions: {
        Row: {
          id: string
          sub_account_id: string
          contact_id: string | null
          suggestion_type: string
          subject: string
          message_template: string
          sent: boolean
          created_at: string
        }
        Insert: {
          id?: string
          sub_account_id: string
          contact_id?: string | null
          suggestion_type: string
          subject: string
          message_template: string
          sent?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          sub_account_id?: string
          contact_id?: string | null
          suggestion_type?: string
          subject?: string
          message_template?: string
          sent?: boolean
          created_at?: string
        }
        Relationships: []
      }
      sub_account_activities: {
        Row: {
          id: string
          sub_account_id: string
          contact_id: string | null
          opportunity_id: string | null
          activity_type: string
          title: string
          description: string | null
          summary: unknown | null
          logged_by: string
          logged_at: string
        }
        Insert: {
          id?: string
          sub_account_id: string
          contact_id?: string | null
          opportunity_id?: string | null
          activity_type: string
          title: string
          description?: string | null
          summary?: unknown | null
          logged_by: string
          logged_at?: string
        }
        Update: {
          id?: string
          sub_account_id?: string
          contact_id?: string | null
          opportunity_id?: string | null
          activity_type?: string
          title?: string
          description?: string | null
          summary?: unknown | null
          logged_by?: string
          logged_at?: string
        }
        Relationships: []
      }
      sub_account_opportunity_stage_history: {
        Row: {
          id: string
          opportunity_id: string
          from_stage: string | null
          to_stage: string
          changed_at: string
        }
        Insert: {
          id?: string
          opportunity_id: string
          from_stage?: string | null
          to_stage: string
          changed_at?: string
        }
        Update: {
          id?: string
          opportunity_id?: string
          from_stage?: string | null
          to_stage?: string
          changed_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_lead_score: {
        Args: { p_contact_id: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
