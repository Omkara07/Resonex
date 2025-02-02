import { getServerSession } from "next-auth";
import { NEXT_AUTH_CONFIG } from "./lib/auth";
import Image from "next/image";
import Redirect from "@/components/Redirect";
import Navbar from "@/components/ui/Navbar";
import LandingPage, { AnimatedBackground } from "@/components/ui/LandingPageComp";

export default async function Home() {
  let session;
  try {
    session = await getServerSession(NEXT_AUTH_CONFIG);
  } catch (error) {
    console.error("Error fetching session:", error);
  }
  if (session) {
    console.log(session)
    return <Redirect />
  }
  return (
    <>
      <div className="flex justify-center">
        <Navbar />
      </div>
      <div className="">
        <Redirect />
        <LandingPage />
      </div>
    </>
  );
}



