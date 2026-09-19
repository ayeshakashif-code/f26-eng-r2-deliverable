import { ChatConfigurationError, generateResponse } from "@/lib/services/species-chat";
import { createServerSupabaseClient } from "@/lib/server-utils";
import { NextResponse } from "next/server";
import { z } from "zod";

const historyMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(2_000),
});

const requestSchema = z.object({
  message: z.string().trim().min(1).max(2_000),
  history: z.array(historyMessageSchema).max(8).optional(),
  speciesId: z.number().int().positive().optional(),
});

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid message and try again." }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in to use Field Guide." }, { status: 401 });
  }

  let species;
  if (parsed.data.speciesId !== undefined) {
    const { data, error } = await supabase
      .from("species")
      .select("id, scientific_name, common_name, kingdom, total_population, description")
      .eq("id", parsed.data.speciesId)
      .maybeSingle();

    if (error !== null || data === null) {
      return NextResponse.json({ error: "That species is no longer available." }, { status: 404 });
    }
    species = data;
  }

  try {
    const response = await generateResponse(parsed.data.message, {
      history: parsed.data.history,
      species,
    });
    return NextResponse.json({ response });
  } catch (error) {
    if (error instanceof ChatConfigurationError) {
      return NextResponse.json({ error: "Field Guide is not configured yet." }, { status: 503 });
    }
    console.error("Field Guide provider request failed:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Field Guide could not reach its language model. Please try again shortly." },
      { status: 502 },
    );
  }
}
