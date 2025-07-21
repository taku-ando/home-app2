import SideMenu from "@/components/SideMenu";
import { auth } from "../auth";

export default async function Header() {
  const session = await auth();

  console.log({ session });
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 h-14">
      <div className="h-full max-w-7xl mx-auto px-4 flex items-center">
        <div className="flex items-center gap-3">
          <SideMenu session={session} />
        </div>
      </div>
    </header>
  );
}
