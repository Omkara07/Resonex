"use client"
import { useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import React, { use, useEffect } from 'react'

const Redirect = () => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname(); // Get the current pathname

    useEffect(() => {
        if (status === 'loading') {
            // Avoid running logic while the session is loading
            return;
        }

        if (!session) {
            router.push('/');
        } else if (pathname === '/') {
            router.push('/dashboard');
        }
    }, [session, status, pathname, router]);

    return null;
}

export default Redirect
