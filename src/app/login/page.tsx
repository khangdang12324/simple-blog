import { LoginForm } from "../../components/auth/login-form";
export default function LoginPage({
  searchParams,
}: {
  searchParams: { message?: string };
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bggray-50">
      <div
        className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg
shadow"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold">Đăng nhập</h2>
          <p className="mt-2 text-gray-600">
            Đăng nhập để quản lý blog của bạn
          </p>
        </div>

        {searchParams?.message && (
          <div
            className="bg-green-50 text-green-700 p-3 rounded-md
text-sm"
          >
            {searchParams.message}
          </div>
        )}

        <LoginForm />
      </div>
    </div>
  );
}
