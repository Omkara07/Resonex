"use client"
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import React, { use, useEffect } from 'react'

const Redirect = () => {
    const session = useSession()
    const router = useRouter()
    useEffect(() => {
        if (session?.data?.user) {
            router.push("/dashboard")
        }
        else {
            router.push("/")
        }
    }, [session])
    return null
}

export default Redirect
