import { redirect } from "next/navigation";
import { auth, signIn } from "../../auth";

export default async function LoginPage() {
  const session = await auth();

  // すでにログイン済みの場合、ホームページにリダイレクト
  if (session?.user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Home Appにログイン
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Googleアカウントでログインしてください
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out"
            >
              Googleでログイン
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
