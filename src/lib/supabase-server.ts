import { cookies, headers } from "next/headers";
import {
  createServerClient,
  type CookieOptions,
} from "@supabase/auth-helpers-nextjs/server";
import env from "@/env";

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function createSupabaseServerClient() {
  const cookieStore = cookies();
  const headerList = headers();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    headers: {
      get(key: string) {
        return headerList.get(key) ?? undefined;
      },
    },
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch (error) {
          console.warn("Unable to set cookie on the server", error);
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch (error) {
          console.warn("Unable to remove cookie on the server", error);
        }
      },
    },
  });
}
