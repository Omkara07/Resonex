import Redirect from '@/components/Redirect'
import UserDashboardPage from '@/components/ui/userDashboardPage'
import React from 'react'

const page = ({ params }: { params: { creatorId: string } }) => {
    const { creatorId } = params
    return (
        <>
            <Redirect />
            <UserDashboardPage creatorId={creatorId} canPlay={false} />
        </>
    )
}

export default page
