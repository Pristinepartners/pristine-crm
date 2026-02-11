import { getDemoAccount } from '@/lib/demo/data'
import { redirect } from 'next/navigation'
import { DemoContacts } from '@/components/demo/DemoContacts'

export default async function DemoContactsPage({
  params,
}: {
  params: Promise<{ accountId: string }>
}) {
  const { accountId } = await params
  const account = getDemoAccount(accountId)
  if (!account) redirect('/demo/luxe-realty')

  return <DemoContacts account={account} />
}
