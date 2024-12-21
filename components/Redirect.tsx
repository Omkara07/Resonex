"use client";
import { useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const Redirect = () => {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname(); // Get the current pathname

    useEffect(() => {
        if (status === 'loading') {
            // Avoid running logic while the session is loading
            return;
        }

        if (!session && pathname !== '/') {
            const callbackUrl = encodeURIComponent(pathname || "/");
            router.push(`/auth/signin?callbackUrl=${callbackUrl}`);
        } else if (session && (pathname === '/' || pathname === '/auth/signin' || pathname === '/auth/signup')) {
            // Redirect authenticated users to the dashboard if on the root path
            router.push('/dashboard');
        }
    }, [session, status, pathname, router]);

    return null;
};

export default Redirect;
