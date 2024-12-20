"use client"
import Redirect from '@/components/Redirect'
import UserDashboardPage from '@/components/ui/userDashboardPage'
import React from 'react'

interface PageProps {
    params: {
        creatorId: string;
    };
}

const Page: React.FC<PageProps> = ({ params }) => {
    const { creatorId } = params;
    return (
        <>
            <Redirect />
            <UserDashboardPage creatorId={creatorId} canPlay={false} />
        </>
    );
}

export default Page;
