import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/header";

export const metadata: Metadata = {
  title: "Simple Blog",
  description: "Ứng dụng blog cá nhân với Next.js và Supabase",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className="min-h-screen bg-gray-50 text-gray-900 antialiased">
        <Header />
        {children}
      </body>
    </html>
  );
}
