import { Suspense } from 'react'
import UserDashboardPage from '@/components/ui/userDashboardPage'

interface PageProps {
    params: {
        creatorId: string
    }
}

// @ts-ignore
export default async function CreatorPage({ params }: PageProps) {
    // @ts-ignore
    const { creatorId } = await params

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <UserDashboardPage creatorId={creatorId} canPlay={false} />
        </Suspense>
    )
}