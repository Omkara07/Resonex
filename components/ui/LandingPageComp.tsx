"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { MusicIcon, UsersIcon, ThumbsUpIcon, MessageSquareIcon, HeadphonesIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useRef } from "react"
import Framer from "./framerVis"

export default function LandingPage() {
    const targetRef = useRef<HTMLDivElement>(null)
    const { scrollYProgress } = useScroll({
        target: targetRef,
        offset: ["start start", "end start"],
    })

    const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
    const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])

    return (
        <Framer duration={0.8} >
            <div
                className="min-h-screen bg-gradient-to-b from-black via-zinc-900 to-neutral-900 text-white overflow-hidden"
                ref={targetRef}
            >
                <motion.div style={{ opacity, scale }}>
                    <HeroSection />
                </motion.div>
                <FeaturesSection />
                <ExperienceSection />
                <CTASection />
            </div>
        </Framer>
    )
}

function HeroSection() {
    const router = useRouter()
    return (
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center z-10"
            >
                <motion.h1
                    className="text-6xl md:text-8xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-400 to-zinc-700"
                    animate={{ backgroundPosition: ["0%", "25%", "50%", "75%", "100%"] }}
                    transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                >
                    {/* Harmony Hub */}
                    Resonex
                </motion.h1>
                <p className="text-xl md:text-2xl text-zinc-300 mb-8">Where music unites, and vibes synchronize.</p>
                <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0px 0px 8px rgb(59,130,246)" }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-zinc-700 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-zinc-800 transition duration-300"
                    onClick={() => router.push('/')}
                >
                    Start Jamming
                </motion.button>
            </motion.div>
            <AnimatedBackground />
        </section>
    )
}

export function AnimatedBackground() {
    return (
        <div className="absolute inset-0 z-0">
            {[...Array(30)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full bg-gradient-to-r from-gray-400 via-zinc-800 to-zinc-900 mix-blend-screen"
                    style={{
                        width: Math.random() * 100 + 50,
                        height: Math.random() * 100 + 50,
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                        y: [0, Math.random() * 100 - 50],
                        opacity: [0.1, 0.3, 0.1],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: Math.random() * 10 + 10,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "reverse",
                    }}
                />
            ))}
        </div>
    )
}

function FeaturesSection() {
    const features = [
        { icon: MusicIcon, title: "Shared Playlists", description: "Create and enjoy music together in real-time." },
        { icon: UsersIcon, title: "Collaborative Rooms", description: "Invite friends and make it a party." },
        { icon: ThumbsUpIcon, title: "Upvote System", description: "Democracy decides the next track." },
        { icon: MessageSquareIcon, title: "Real-time Chat", description: "Discuss and share your music taste." },
    ]

    return (
        <section className="py-20 bg-gradient-to-r from-zinc-900 to-neutral-900">
            <div className="container mx-auto px-4">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-4xl font-bold text-center mb-12 text-zinc-400"
                >
                    Features that Resonate
                </motion.h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            whileHover={{ scale: 1.05, boxShadow: "0px 0px 8px rgba(59,130,246,0.5)" }}
                            className="bg-zinc-800 bg-opacity-50 p-6 rounded-lg transition duration-300"
                        >
                            <feature.icon className="w-12 h-12 mb-4 text-zinc-500" />
                            <h3 className="text-xl font-semibold mb-2 text-zinc-200">{feature.title}</h3>
                            <p className="text-zinc-400">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}

function ExperienceSection() {
    return (
        <section className="py-20 bg-gradient-to-b from-neutral-900 to-zinc-900">
            <div className="container mx-auto px-4">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-4xl font-bold text-center mb-12 text-zinc-400"
                >
                    Immersive Music Experience
                </motion.h2>
                <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="md:w-1/2"
                    >
                        <HeadphonesIcon className="w-full h-64 text-zinc-700" />
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="md:w-1/2"
                    >
                        <h3 className="text-2xl font-semibold mb-4 text-zinc-200">Sync Your Vibes</h3>
                        <p className="text-zinc-400 mb-4">
                            Experience music like never before. Our real-time synchronization ensures everyone in the room hears the
                            same beat at the same time.
                        </p>
                        <p className="text-zinc-400">
                            With our innovative upvote system, the playlist becomes a democratic jukebox, reflecting the group's taste
                            in real-time.
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}

function CTASection() {
    const router = useRouter()
    return (
        <section className="py-20 bg-gradient-to-b from-zinc-900 to-black">
            <div className="container mx-auto px-4 text-center">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-4xl font-bold mb-6 text-zinc-400"
                >
                    Ready to Amplify Your Music Experience?
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="text-xl text-zinc-300 mb-8"
                >
                    Join thousands of music lovers and start your collaborative journey today.
                </motion.p>
                <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0px 0px 8px rgb(59,130,246)" }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-zinc-700 text-white px-8 py-3 rounded-full text-lg font-semibold hover:bg-zinc-800 transition duration-300"
                    onClick={() => router.push('/')}
                >
                    Create Your Room
                </motion.button>
            </div>
        </section>
    )
}

