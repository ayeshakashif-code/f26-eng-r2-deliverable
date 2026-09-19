import { createServerSupabaseClient } from "@/lib/server-utils";
import { cn } from "@/lib/utils";
import { Sprout } from "lucide-react";
import Link from "next/link";
import NavLinks from "./nav-links";

export default async function Navbar({ className, ...props }: React.HTMLAttributes<HTMLElement>) {
  // Create supabase server component client and obtain user session from stored cookie
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return (
    <nav
      className={cn("flex min-w-0 flex-wrap items-center gap-3 sm:gap-8", className)}
      aria-label="Main navigation"
      {...props}
    >
      <Link
        href="/"
        className="flex items-center gap-2.5 whitespace-nowrap text-base font-semibold tracking-tight"
        aria-label="Biodiversity Hub home"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
          <Sprout className="h-6 w-6" aria-hidden="true" />
        </span>
        <span className="hidden md:inline">
          Biodiversity<span className="font-normal text-muted-foreground"> Hub</span>
        </span>
      </Link>
      {user && <NavLinks />}
    </nav>
  );
}
