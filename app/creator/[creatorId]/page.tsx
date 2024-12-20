import { Suspense } from 'react'
import UserDashboardPage from '@/components/ui/userDashboardPage'

export default async function CreatorPage({ params }: { params: any }) {
    const { creatorId } = await params

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <UserDashboardPage creatorId={creatorId} canPlay={false} />
        </Suspense>
    )
}