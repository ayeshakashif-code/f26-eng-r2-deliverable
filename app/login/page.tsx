import { getSafeReturnPath } from "@/lib/auth-utils";
import { createServerSupabaseClient } from "@/lib/server-utils";
import { Leaf, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import UserAuthForm from "./user-auth-form";

interface LoginPageProps {
  searchParams?: { error?: string | string[]; next?: string | string[] };
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const nextPath = getSafeReturnPath(searchParams?.next);
  // Verify the current user from the cookie-backed Supabase session.
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Users who are already signed in should be redirected to species page
    redirect(nextPath);
  }

  return (
    <div className="field-panel mx-auto my-8 flex w-full max-w-md flex-col justify-center space-y-6 p-7 sm:my-14 sm:p-10">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-primary">
        <Leaf className="h-7 w-7" strokeWidth={1.5} aria-hidden="true" />
      </div>
      <div className="flex flex-col space-y-2 text-center">
        <p className="field-eyebrow">Your curiosity belongs here</p>
        <h1 className="field-title text-4xl">Welcome to the field.</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Sign up or log in with a secure link sent to your email.
        </p>
      </div>
      {searchParams?.error === "invalid-link" && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm" role="alert">
          That sign-in link is expired or no longer matches this browser. Request one new link when email sending is
          available, then use only the newest email.
        </p>
      )}
      <UserAuthForm nextPath={nextPath} />
      <p className="flex items-center justify-center gap-2 border-t pt-5 text-xs text-muted-foreground">
        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        No password needed. Just you and your inbox.
      </p>
    </div>
  );
}
