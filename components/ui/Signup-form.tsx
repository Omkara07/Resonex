'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { FcGoogle } from "react-icons/fc";
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import axios from 'axios'
import { useSearchParams } from 'next/navigation'


export function SignupForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullname, setFullname] = useState('')
    const searchParams = useSearchParams()
    const callbackUrl = searchParams.get("callbackUrl") || "/";

    const handleSignup = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        const res = await axios.post('/api/auth/signup', { email, password, name: fullname });
        console.log(res)
        await signIn("credentials", {
            email,
            password,
            callbackUrl
        })
    }
    const handleGoogleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault()
        const res = await signIn("google", { callbackUrl });
    }

    return (
        <div className="w-full max-w-md space-y-8">
            <div>
                <h2 className="mt-6 text-3xl font-extrabold text-white">Welcome back</h2>
                <p className="mt-2 text-sm text-gray-400">Please sign in to your account</p>
            </div>
            <form className="mt-8 space-y-6">
                <div className="rounded-md shadow-sm -space-y-px">
                    <div>
                        <Label htmlFor="fullname" className="sr-only">
                            Fullname
                        </Label>
                        <Input
                            id="fullname"
                            name="fullname"
                            type="text"
                            autoComplete="fullname"
                            required
                            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-white rounded-t-md focus:outline-none focus:ring-white focus:border-white focus:z-10 sm:text-sm bg-gray-900"
                            placeholder="Fullname"
                            value={fullname}
                            onChange={(e) => setFullname(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="email" className="sr-only">
                            Email address
                        </Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-white rounded-t-md focus:outline-none focus:ring-white focus:border-white focus:z-10 sm:text-sm bg-gray-900"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="password" className="sr-only">
                            Password
                        </Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-700 placeholder-gray-500 text-white rounded-b-md focus:outline-none focus:ring-white focus:border-white focus:z-10 sm:text-sm bg-gray-900"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <Button
                        type="submit"
                        onClick={handleSignup}
                        className="group relative w-full font-semibold flex justify-center py-2 px-4 border border-transparent text-sm rounded-md text-black bg-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
                    >
                        Sign up
                    </Button>
                </div>
                <div className="mt-6 flex items-center justify-center">
                    <div className="border-t border-gray-700 w-full"></div>
                    <div className="px-2 text-sm text-gray-500">Or</div>
                    <div className="border-t border-gray-700 w-full"></div>
                </div>
                <div className="mt-4">
                    <Button
                        type="button"
                        className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-semibold rounded-md text-black bg-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200"
                        onClick={handleGoogleLogin}
                    >
                        <FcGoogle className="h-8 w-8 font-bold text-xl" />
                        Login with Google
                    </Button>
                </div>
                <div className='flex items-center justify-center md:pt-10'>
                    <p>Already have an account? <Link href={`/auth/signin?callbackUrl=${callbackUrl}`} className="hover:underline text-sm text-white hover:text-gray-300 font-bold">Login</Link></p>
                </div>
            </form>
        </div>
    )
}

