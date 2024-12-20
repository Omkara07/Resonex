import { LoginForm } from '@/components/ui/Login-form'
import Image from 'next/image'

export default function LoginPage() {
    return (
        <div className="flex h-screen bg-black">
            <div className="w-full md:w-1/2 flex items-center justify-center p-8">
                <LoginForm />
            </div>
            <div className="hidden md:block md:w-1/2 relative">
                <Image
                    src="https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                    alt="Abstract geometric pattern"
                    layout="fill"
                    objectFit="cover"
                    className=""
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent"></div>
            </div>
        </div>
    )
}

