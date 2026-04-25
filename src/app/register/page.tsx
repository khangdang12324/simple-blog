import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 text-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Đăng ký tài khoản</h2>
          <p className="mt-2 text-gray-700">
            Tạo tài khoản để bắt đầu viết blog
          </p>
        </div>

        <RegisterForm />
      </div>
    </div>
  );
}
