"use client"
import { AudioWaveform } from 'lucide-react'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import React, { useEffect } from 'react'

const Navbar = () => {
    const router = useRouter()
    const session = useSession()
    return (
        <div className="flex items-center justify-between py-5 text-xl line px-8 font-bold font-mono border-b border-b-gray-700 mt-3 border border-gray-700  rounded-full hover:shadow-gray-900 hover:border-b-3 duration-700 hover:border-t hover:border-t-gray-500 hover:shadow-xl bg-transparent/60 backdrop-blur-xl z-20 fixed w-[70%] max-md:max-w-[350px] max-md:w-full">
            <button className="md:pl-8 pl-1 flex group duration-300" onClick={() => router.push('/')}>
                <AudioWaveform className="mr-2 h-6 w-6 text-gray-300" />
                <h1 className="text-xl font-bold text-white">Pulse~Point</h1>
            </button>
            {
                session.data ?
                    <div>
                        <button className="flex text-sm duration-150 font-medium text-black bg-gray-400 hover:bg-white px-4 py-1.5 rounded-lg" onClick={() => signOut()}>Logout</button>
                    </div>
                    :
                    <div className="flex gap-6 text-sm">
                        <button className="flex text-sm duration-150 font-medium text-black bg-gray-400 hover:bg-white px-4 py-1.5 rounded-lg" onClick={() => router.push('/auth/signin')}>Login</button>
                    </div>
            }
        </div>

    )
}
export default Navbar