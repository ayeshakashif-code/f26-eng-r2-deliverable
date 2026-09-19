import { SidebarNav } from "@/components/global/sidebar-nav";
import { Separator } from "@/components/ui/separator";
import { PageHeader1, PageSubHeader1 } from "@/components/ui/typography";
import { createServerSupabaseClient } from "@/lib/server-utils";
import { redirect } from "next/navigation";

const sidebarNavItems = [
  {
    title: "General",
    href: "/settings/general",
  },
  {
    title: "Profile",
    href: "/settings/profile",
  },
];

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default async function SettingsLayout({ children }: SettingsLayoutProps) {
  // Verify the current user from the cookie-backed Supabase session.
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // this is a protected route - only users who are signed in can view this route
    redirect("/login?next=%2Fsettings");
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="space-y-0.5">
        <PageHeader1>Settings</PageHeader1>
        <PageSubHeader1>Manage your account and profile settings.</PageSubHeader1>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="lg:w-1/5">
          <SidebarNav items={sidebarNavItems} />
        </aside>
        <div className="field-panel flex-1 p-6 sm:p-8 lg:max-w-2xl">{children}</div>
      </div>
    </div>
  );
}
