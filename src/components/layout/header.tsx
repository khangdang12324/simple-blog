// src/components/layout/header.tsx
import Link from "next/link";
import { createClient } from "../../lib/supabase/server";
import { redirect } from "next/navigation";

export async function Header() {
  async function logoutAction() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-gray-900">
            Simple Blog
          </Link>

          {/* CHỖ NÀY ĐÃ XÓA Ô TÌM KIẾM */}

          <nav className="flex items-center gap-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              Trang chủ
            </Link>
            <Link href="/search" className="text-gray-600 hover:text-gray-900">
              Tìm kiếm
            </Link>
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="text-gray-600 hover:text-gray-900"
                >
                  Hồ sơ
                </Link>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    Đăng xuất
                  </button>
                </form>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Đăng nhập
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
