import UserDashboardPage from '@/components/ui/roomPage'
import { getServerSession } from 'next-auth'
import { NEXT_AUTH_CONFIG } from '../lib/auth'
import Redirect from '@/components/Redirect'
import UserDashboard from '@/components/ui/UserDashboard'

export default async function DashboardPage() {
    const session = await getServerSession(NEXT_AUTH_CONFIG)
    if (!session) {
        return <Redirect />
    }
    return (
        <>
            <Redirect />
            {/* <UserDashboardPage creatorId={session?.user?.id} canPlay={true} /> */}
            <UserDashboard />
        </>
    )
}

