import { createClient } from '@/lib/supabase/server'
import { SettingsForm } from '@/components/settings/SettingsForm'
import type { UserSettings, Pipeline, Owner } from '@/lib/supabase/types'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const userName = user?.email?.split('@')[0]?.toLowerCase() || 'alex'
  const currentUser: Owner = userName === 'mikail' ? 'mikail' : 'alex'

  const [{ data: settings }, { data: pipelines }, { data: branding }] = await Promise.all([
    supabase
      .from('user_settings')
      .select('*')
      .eq('owner', currentUser)
      .single(),
    supabase.from('pipelines').select('*'),
    supabase.from('branding_settings').select('*').single(),
  ])

  // Default settings if none exist
  const defaultSettings: Partial<UserSettings> = {
    owner: currentUser,
    follow_up_reminder_enabled: true,
    follow_up_reminder_time: '07:00',
    email_notifications: false,
    theme: 'light',
    default_pipeline_id: null,
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your preferences and notifications</p>
      </div>

      <SettingsForm
        settings={(settings as unknown as UserSettings) || (defaultSettings as UserSettings)}
        pipelines={(pipelines || []) as unknown as Pipeline[]}
        currentUser={currentUser}
        isNew={!settings}
        branding={branding as any}
      />
    </div>
  )
}
