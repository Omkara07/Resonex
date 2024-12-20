import { Suspense } from 'react'
import UserDashboardPage from '@/components/ui/userDashboardPage'

interface PageProps {
    params: {
        creatorId: string
    }
}

export default async function CreatorPage({ params }: PageProps) {
    const { creatorId } = await params

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <UserDashboardPage creatorId={creatorId} canPlay={false} />
        </Suspense>
    )
}