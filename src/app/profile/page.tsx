import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/profile/profile-form";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
      {profile ? (
        <ProfileForm profile={profile} />
      ) : (
        <p>Không tìm thấy hồ sơ.</p>
      )}
    </main>
  );
}
