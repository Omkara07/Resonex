import UserDashboardPage from '@/components/ui/userDashboardPage'
import { getServerSession } from 'next-auth'
import { NEXT_AUTH_CONFIG } from '../lib/auth'
import Redirect from '@/components/Redirect'

export default async function DashboardPage() {
    const session = await getServerSession(NEXT_AUTH_CONFIG)
    if (!session) {
        return null
    }
    return (
        <>
            <Redirect />
            <UserDashboardPage creatorId={session?.user?.id} canPlay={true} />
        </>
    )
}

