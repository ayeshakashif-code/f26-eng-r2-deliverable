"use client";
import SpeciesImage from "@/components/species-image";
import { Leaf } from "lucide-react";
import EditSpeciesDialog from "./edit-species-dialog";
import SpeciesDetailsDialog from "./species-details-dialog";
import type { Species } from "./species-types";

export default function SpeciesCard({ species, sessionId }: { species: Species; sessionId: string }) {
  const commonName = species.common_name?.trim();
  const displayName = commonName && commonName.length > 0 ? commonName : species.scientific_name;
  const description = species.description?.split("\n\nSource:")[0]?.trim();

  return (
    <article className="field-panel group flex min-w-0 flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <div className="relative aspect-[16/11] w-full overflow-hidden bg-muted">
        <SpeciesImage src={species.image} name={displayName} />
        <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-background/95 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-foreground shadow-sm backdrop-blur">
          <Leaf className="h-3 w-3 text-primary" aria-hidden="true" />
          {species.kingdom}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <h3 className="field-title break-words text-2xl leading-tight">{displayName}</h3>
        <p className="mt-1 break-words text-sm italic text-muted-foreground">{species.scientific_name}</p>
        <p className="mt-3 line-clamp-3 break-words text-sm leading-6 text-muted-foreground">
          {description && description.length > 0 ? description : "No description has been added yet."}
        </p>
        <div className={`mt-auto grid gap-2 pt-6 ${sessionId === species.author ? "grid-cols-2" : "grid-cols-1"}`}>
          <SpeciesDetailsDialog species={species} />
          {sessionId === species.author && <EditSpeciesDialog species={species} userId={sessionId} />}
        </div>
      </div>
    </article>
  );
}
