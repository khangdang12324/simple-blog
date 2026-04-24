import { ResetPasswordForm } from "../../components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-10 text-gray-900 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md space-y-8 rounded-lg bg-white p-8 shadow">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Đặt lại mật khẩu</h2>
          <p className="mt-2 text-gray-700">Nhập mật khẩu mới để hoàn tất</p>
        </div>

        <ResetPasswordForm />
      </div>
    </div>
  );
}
