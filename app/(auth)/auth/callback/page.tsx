import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AuthCallback() {
  const supabase = await createClient();

  const { error } = await supabase.auth.exchangeCodeForSession(
    process.env.NEXT_PUBLIC_SUPABASE_URL!
  );

  if (error) {
    console.error("Error exchanging code for session:", error);
    redirect("/login?error=auth_failed");
  }

  redirect("/dashboard");
}