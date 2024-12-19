"use client"
import { AudioWaveformIcon as Waveform } from 'lucide-react'
import { signIn, signOut, useSession } from 'next-auth/react'

export function DashboardHeader() {
    const session: any = useSession()
    return (
        <header className="bg-black p-4 border-b border-gray-800 flex justify-between md:px-20">
            <div className="container mx-auto flex items-center">
                <Waveform className="mr-2 h-6 w-6 text-gray-300" />
                <h1 className="text-xl font-bold text-white">Pulse~Point</h1>
            </div>
            <div>
                {
                    session?.data ?
                        <div>
                            <button className="flex text-sm hover:text-emerald-400 duration-150 font-semibold" onClick={() => signOut()}>Logout</button>
                        </div>
                        :
                        <div className="flex gap-6 text-sm">
                            <button className="flex hover:text-emerald-400 duration-150 font-semibold" onClick={() => signIn()}>Login</button>
                        </div>
                }
            </div>
        </header>
    )
}

