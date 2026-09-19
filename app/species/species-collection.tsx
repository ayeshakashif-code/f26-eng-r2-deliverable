"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import SpeciesCard from "./species-card";
import type { Species } from "./species-types";

export default function SpeciesCollection({ species, sessionId }: { species: Species[]; sessionId: string }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const visibleSpecies = useMemo(() => {
    if (normalizedQuery.length === 0) return species;

    return species.filter((item) =>
      [item.scientific_name, item.common_name, item.description].some(
        (value) => value?.toLocaleLowerCase().includes(normalizedQuery),
      ),
    );
  }, [normalizedQuery, species]);

  return (
    <section aria-labelledby="species-collection-heading">
      <h2 id="species-collection-heading" className="mb-5 text-lg font-semibold tracking-tight">
        Species collection
      </h2>
      <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
        <div className="w-full sm:max-w-md">
          <label htmlFor="species-search" className="sr-only">
            Search the collection
          </label>
          <div className="relative flex items-center gap-2">
            <Search className="pointer-events-none absolute left-4 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="species-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search names or descriptions"
              className="h-12 rounded-full bg-card pl-11"
            />
            {query.length > 0 && (
              <Button type="button" variant="outline" onClick={() => setQuery("")}>
                Clear
              </Button>
            )}
          </div>
        </div>
        <p className="flex items-center gap-2 text-sm text-muted-foreground" role="status">
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          {visibleSpecies.length} of {species.length} species
        </p>
      </div>

      {visibleSpecies.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-muted/30 px-6 py-14 text-center">
          <h3 className="field-title break-words text-2xl">
            {species.length === 0 ? "Your collection starts here" : `No species match “${query.trim()}”`}
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {species.length === 0
              ? "Use Add species to contribute the first field record."
              : "Try another name or clear the search."}
          </p>
          {query.length > 0 && (
            <Button type="button" variant="outline" className="mt-4" onClick={() => setQuery("")}>
              Clear search
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {visibleSpecies.map((item) => (
            <SpeciesCard key={item.id} species={item} sessionId={sessionId} />
          ))}
        </div>
      )}
    </section>
  );
}
