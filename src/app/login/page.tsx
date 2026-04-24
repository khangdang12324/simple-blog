import { LoginForm } from "../../components/auth/login-form";
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 text-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Đăng nhập</h2>
          <p className="mt-2 text-gray-700">
            Đăng nhập để quản lý blog của bạn
          </p>
        </div>

        {params?.message && (
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">
            {params.message}
          </div>
        )}

        <LoginForm />
      </div>
    </div>
  );
}
