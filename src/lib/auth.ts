import type { Session } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const getSession = cache(async (): Promise<Session | null> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error("Failed to fetch Supabase session", error);
    return null;
  }

  return session;
});

export async function requireUser() {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  return session.user;
}
