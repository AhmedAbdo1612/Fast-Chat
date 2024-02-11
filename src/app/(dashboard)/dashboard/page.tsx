import Button from '@/components/ui/Button'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { FC } from 'react'

interface DashboardPageProps {
  
}

const DashboardPage: FC<DashboardPageProps> = async ({}) => {
  const session = await getServerSession(authOptions)

  return <pre>Dashboard</pre>
}

export default DashboardPage