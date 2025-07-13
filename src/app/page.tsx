import Image from "next/image";
import { auth } from "@/auth";
import HealthChecker from "@/components/HealthChecker";
import { Button } from "@/components/ui/button";
import { handleSignIn } from "@/lib/auth-actions";

export default async function Home() {
  const session = await auth();

  console.log(session);

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <HealthChecker />
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        {session === null && (
          <div>
            <form action={handleSignIn}>
              <Button type="submit">Signin with Google</Button>
            </form>
          </div>
        )}
      </footer>
    </div>
  );
}
