"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function mapForgotPasswordError(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("rate limit")) {
    return "Bạn gửi yêu cầu quá nhanh nên bị giới hạn tạm thời. Vui lòng chờ khoảng 60 giây rồi thử lại.";
  }

  return message;
}

export function ForgotPasswordForm() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        },
      );

      if (error) {
        setError(mapForgotPasswordError(error.message));
        return;
      }

      setSuccess(
        "Nếu email tồn tại trong hệ thống, chúng tôi đã gửi link đặt lại mật khẩu.",
      );
    } catch {
      setError("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleResetPassword} className="mt-8 space-y-6">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          {success}
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-800"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-blue-500"
          placeholder="email@example.com"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Đang xử lý..." : "Gửi email đặt lại mật khẩu"}
      </button>

      <p className="text-center text-sm text-gray-700">
        Nhớ lại mật khẩu?{" "}
        <Link href="/login" className="text-blue-700 hover:text-blue-800">
          Quay về đăng nhập
        </Link>
      </p>
    </form>
  );
}
