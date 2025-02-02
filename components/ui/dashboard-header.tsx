"use client"
import { AudioWaveformIcon as Waveform } from 'lucide-react'
import { signIn, signOut, useSession } from 'next-auth/react'

export function DashboardHeader() {
    const session: any = useSession()
    return (
        <header className="bg-black p-4 border-b border-zinc-800 fixed flex z-30 justify-between md:px-20 w-full">
            <div className="container mx-auto flex items-center">
                <Waveform className="mr-2 h-6 w-6 text-zinc-300" />
                <h1 className="text-xl font-bold text-white">Resonex</h1>
            </div>
            <div>
                {
                    session?.data ?
                        <div>
                            <button className="flex text-sm duration-150 font-medium text-black bg-white px-4 py-1.5 rounded-lg" onClick={() => signOut({
                                callbackUrl: '/auth/signin?callbackUrl=/dashboard', // Redirect to signin page after logout
                            })}>Logout</button>
                        </div>
                        :
                        <div className="flex gap-6 text-sm">
                            <button className="flex text-sm duration-150 font-medium text-black bg-white px-4 py-1.5 rounded-lg" onClick={() => signIn()}>Login</button>
                        </div>
                }
            </div>
        </header >
    )
}

