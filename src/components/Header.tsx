import { auth, signOut } from "@/auth";
import { Button } from "@/components/ui/button";

export default async function Header() {
  const session = await auth();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 h-14">
      <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold font-[family-name:var(--font-geist-sans)]">
            Home App
          </h1>
        </div>

        <div className="flex items-center gap-4">
          {session?.user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {session.user.name}
              </span>
              <form
                action={async () => {
                  "use server";
                  await signOut();
                }}
              >
                <Button variant="outline" size="sm" type="submit">
                  サインアウト
                </Button>
              </form>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
