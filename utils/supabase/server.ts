import { createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const createClient = (cookieStore: any) => {
  // The `cookies()` helper in Next can be sync or async depending on
  // the runtime and typing; normalize access using runtime checks.
  const asAny: any = cookieStore;

  return createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        try {
          if (typeof asAny.getAll === "function") {
            return asAny.getAll();
          }
          // cookieStore might be a Promise
          return asAny.then((s: any) => s.getAll());
        } catch {
          return [];
        }
      },
      setAll(cookiesToSet) {
        try {
          if (typeof asAny.set === "function") {
            cookiesToSet.forEach(({ name, value, options }: any) =>
              asAny.set(name, value, options)
            );
            return;
          }

          // If cookieStore is a promise, set on resolved store and ignore
          // errors when called from a Server Component context.
          (asAny as Promise<any>)?.then((s: any) =>
            cookiesToSet.forEach(({ name, value }: any) => s.set(name, value))
          );
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
  });
};
