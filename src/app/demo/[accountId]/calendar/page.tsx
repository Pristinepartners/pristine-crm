import { getDemoAccount } from '@/lib/demo/data'
import { redirect } from 'next/navigation'
import { DemoCalendar } from '@/components/demo/DemoCalendar'

export default async function DemoCalendarPage({
  params,
}: {
  params: Promise<{ accountId: string }>
}) {
  const { accountId } = await params
  const account = getDemoAccount(accountId)
  if (!account) redirect('/demo/luxe-realty')

  return <DemoCalendar account={account} />
}
