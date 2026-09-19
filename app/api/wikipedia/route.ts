import { createServerSupabaseClient } from "@/lib/server-utils";
import type { WikipediaArticle } from "@/lib/wikipedia-types";
import { NextResponse } from "next/server";
import { z } from "zod";

const searchSchema = z.string().trim().min(1).max(100);

const wikipediaResponseSchema = z.object({
  query: z
    .object({
      pages: z.array(
        z.object({
          pageid: z.number(),
          title: z.string(),
          index: z.number().optional(),
          extract: z.string().optional(),
          fullurl: z.string().url().optional(),
          pageimage: z.string().optional(),
          pageprops: z.record(z.unknown()).optional(),
          thumbnail: z
            .object({
              source: z.string().url(),
            })
            .optional(),
        }),
      ),
    })
    .optional(),
});

function pageUrl(title: string) {
  return `https://en.wikipedia.org/wiki/${encodeURIComponent(title.replaceAll(" ", "_"))}`;
}

export async function GET(request: Request) {
  const query = searchSchema.safeParse(new URL(request.url).searchParams.get("q"));
  if (!query.success) {
    return NextResponse.json({ error: "Enter a species name to search Wikipedia." }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Sign in to search Wikipedia." }, { status: 401 });
  }

  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: query.data,
    gsrnamespace: "0",
    gsrlimit: "6",
    prop: "extracts|pageimages|pageprops|info",
    exintro: "1",
    explaintext: "1",
    exsentences: "4",
    piprop: "thumbnail|name",
    pithumbsize: "960",
    inprop: "url",
    redirects: "1",
    format: "json",
    formatversion: "2",
  });

  try {
    const response = await fetch(`https://en.wikipedia.org/w/api.php?${params.toString()}`, {
      headers: {
        "Api-User-Agent": "BiodiversityHub/1.0 (https://github.com/ayeshakashif-code/f26-eng-r2-deliverable)",
      },
      signal: AbortSignal.timeout(8_000),
      next: { revalidate: 3_600 },
    });

    if (!response.ok) throw new Error(`Wikipedia returned ${response.status}.`);

    const parsed = wikipediaResponseSchema.safeParse(await response.json());
    if (!parsed.success) throw new Error("Wikipedia returned an unexpected response.");

    const articles: WikipediaArticle[] = (parsed.data.query?.pages ?? [])
      .filter((page) => page.pageprops?.disambiguation === undefined)
      .sort((first, second) => (first.index ?? Number.MAX_SAFE_INTEGER) - (second.index ?? Number.MAX_SAFE_INTEGER))
      .slice(0, 5)
      .map((page) => ({
        id: page.pageid,
        title: page.title,
        extract: page.extract?.trim() ?? "",
        articleUrl: page.fullurl ?? pageUrl(page.title),
        thumbnailUrl: page.thumbnail?.source ?? null,
        imageCreditUrl: page.pageimage === undefined ? null : pageUrl(`File:${page.pageimage}`),
      }));

    return NextResponse.json({ articles });
  } catch (error) {
    console.error("Wikipedia lookup failed:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { error: "Wikipedia is unavailable right now. You can still enter the species manually." },
      { status: 502 },
    );
  }
}
