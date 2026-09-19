import { createServerSupabaseClient } from "@/lib/server-utils";
import { redirect } from "next/navigation";
import FieldGuideChat from "./field-guide-chat";

interface SearchParams {
  speciesId?: string | string[];
  question?: string | string[];
}

export default async function FieldGuidePage({ searchParams }: { searchParams?: SearchParams }) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=%2Fspecies-chatbot");

  const speciesIdValue = Array.isArray(searchParams?.speciesId) ? searchParams?.speciesId[0] : searchParams?.speciesId;
  const speciesId = speciesIdValue === undefined ? undefined : Number(speciesIdValue);
  const validSpeciesId =
    speciesId !== undefined && Number.isInteger(speciesId) && speciesId > 0 ? speciesId : undefined;

  let selectedSpecies = null;
  let speciesNotice: string | null = null;

  if (validSpeciesId !== undefined) {
    const { data, error } = await supabase
      .from("species")
      .select("id, scientific_name, common_name, kingdom, total_population, description")
      .eq("id", validSpeciesId)
      .maybeSingle();

    if (error !== null || data === null) {
      speciesNotice = "The selected species is unavailable, so this conversation has no record context.";
    } else selectedSpecies = data;
  } else if (speciesIdValue !== undefined) {
    speciesNotice = "The selected species link is invalid, so this conversation has no record context.";
  }

  const questionValue = Array.isArray(searchParams?.question) ? searchParams?.question[0] : searchParams?.question;
  const initialQuestion = questionValue?.slice(0, 2_000) ?? "";

  return (
    <FieldGuideChat initialQuestion={initialQuestion} initialSpecies={selectedSpecies} speciesNotice={speciesNotice} />
  );
}
