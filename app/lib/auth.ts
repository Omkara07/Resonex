import { prismaClient } from "@/lib/db";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export const NEXT_AUTH_CONFIG = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "email", type: "text", placeholder: "Email" },
                password: { label: "Password", type: "password", placeholder: "Password" },
            },
            async authorize(credentials: any): Promise<any> {
                if (!credentials) return null
                const { email, password } = credentials
                try {

                    const user = await prismaClient.user.findUnique({
                        where: {
                            email: email
                        }
                    })
                    if (!user) {
                        return null
                    }
                    if (user?.password !== password) {
                        return null
                    }
                    if (user.provider === "Google") return null

                    return {
                        id: user?.id,
                        email: user.email,
                        name: user.name
                    };
                }
                catch (e) {
                    console.log(e);
                    return null
                }
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        }),
    ],
    callbacks: {
        async signIn({ user }: { user: any }) {
            if (!user.email) {
                return false
            }
            try {
                const u = await prismaClient.user.findUnique({
                    where: {
                        email: user.email
                    }
                })
                if (!u) {
                    await prismaClient.user.create({
                        data: {
                            email: user.email,
                            provider: "Google"
                        }
                    })
                }
            }
            catch (e) {
                return false
            }
            return true
        },
        jwt: async ({ token, user }: { user: any, token: any }) => {
            // This runs on user sign-in
            if (user) {
                // Fetch user from your database
                const dbUser = await prismaClient.user.findUnique({
                    where: { email: user.email }, // Adjust to match your unique user field
                });

                if (dbUser) {
                    token.id = dbUser.id; // Attach Prisma user ID to the token
                }
            }
            return token;
        },

        // used to check and change the session sent to the frontend
        session: ({ token, session }: any) => {

            if (session && session.user && token?.id) {
                session.user.id = token.id
            }

            return session
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "auth/signin"
    }
};
