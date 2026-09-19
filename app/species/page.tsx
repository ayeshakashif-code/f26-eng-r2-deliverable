import { createServerSupabaseClient } from "@/lib/server-utils";
import { redirect } from "next/navigation";
import AddSpeciesDialog from "./add-species-dialog";
import SpeciesCollection from "./species-collection";

export default async function SpeciesList() {
  // Verify the current user from the cookie-backed Supabase session.
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // this is a protected route - only users who are signed in can view this route
    redirect("/login?next=%2Fspecies");
  }

  // Obtain the ID of the currently signed-in user
  const sessionId = user.id;

  const { data: species } = await supabase.from("species").select("*").order("id", { ascending: false });

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-5 border-b border-border/70 pb-8 pt-2">
        <div>
          <p className="field-eyebrow">The living collection</p>
          <h1 className="field-title mt-3 text-4xl sm:text-5xl">A closer look at the natural world.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
            Discover species, share what you know, and keep curiosity growing.
          </p>
        </div>
        <AddSpeciesDialog userId={sessionId} />
      </div>
      <SpeciesCollection species={species ?? []} sessionId={sessionId} />
    </div>
  );
}
