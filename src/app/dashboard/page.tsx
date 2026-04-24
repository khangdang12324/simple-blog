import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-700">Ban da dang nhap thanh cong.</p>
        <p className="mt-4 text-sm text-gray-600">
          Email hien tai:{" "}
          <span className="font-medium text-gray-900">{user.email}</span>
        </p>
      </div>
    </main>
  );
}
