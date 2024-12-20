import { getServerSession } from "next-auth";
import { NEXT_AUTH_CONFIG } from "./lib/auth";
import Image from "next/image";
import Redirect from "@/components/Redirect";
import Navbar from "@/components/ui/Navbar";

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
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <Redirect />
        <div className="mt-auto items-center flex flex-col gap-10">
          <div className="flex text-2xl font-semibold mt-10 ">Hello</div>
          {
            session ? (
              <div className="flex flex-col items-center">
                <Image
                  src={`${session?.user?.image}`}
                  alt="User Profile"
                  width={100}
                  height={100}
                  className="rounded-full  mb-5 mt-10"
                />
                <div className="text-4xl">Logged in as {session?.user?.name}</div>
                <div>{session?.user?.email}</div>
              </div>
            ) : (
              <div className="text-4xl">Not logged in</div>
            )
          }
        </div>
      </div>
    </>
  );
}
