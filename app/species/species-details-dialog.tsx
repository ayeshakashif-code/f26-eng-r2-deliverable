"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowUpRight, BookOpen } from "lucide-react";
import Link from "next/link";
import type { Species } from "./species-types";

const populationFormatter = new Intl.NumberFormat();

function textOrFallback(value: string | null, fallback: string) {
  const trimmedValue = value?.trim();
  return trimmedValue !== undefined && trimmedValue.length > 0 ? trimmedValue : fallback;
}

export default function SpeciesDetailsDialog({ species }: { species: Species }) {
  const commonName = textOrFallback(species.common_name, "Not provided");
  const displayName = textOrFallback(species.common_name, species.scientific_name);
  const description = textOrFallback(species.description, "No description provided.");
  const population =
    species.total_population === null ? "Unknown" : populationFormatter.format(species.total_population);
  const trimmedCommonName = species.common_name?.trim();
  const speciesName =
    trimmedCommonName !== undefined && trimmedCommonName.length > 0 ? trimmedCommonName : species.scientific_name;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="w-full">
          Learn more
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-xl">
        <DialogHeader className="min-w-0 border-b pb-4 pr-6">
          <p className="field-eyebrow mb-2">Species profile</p>
          <DialogTitle className="field-title break-words text-3xl leading-tight sm:text-4xl">
            {displayName}
          </DialogTitle>
          <p className="break-words text-base italic text-muted-foreground">{species.scientific_name}</p>
          <DialogDescription className="sr-only">
            Classification, population, and full description for {displayName}.
          </DialogDescription>
        </DialogHeader>

        <dl className="grid min-w-0 gap-4 sm:grid-cols-2">
          <div className="min-w-0 rounded-lg bg-muted/50 p-4">
            <dt className="text-sm font-medium text-muted-foreground">Scientific name</dt>
            <dd className="mt-1 break-words text-base font-medium italic">{species.scientific_name}</dd>
          </div>
          <div className="min-w-0 rounded-lg bg-muted/50 p-4">
            <dt className="text-sm font-medium text-muted-foreground">Common name</dt>
            <dd className="mt-1 break-words text-base font-medium">{commonName}</dd>
          </div>
          <div className="min-w-0 rounded-lg bg-muted/50 p-4">
            <dt className="text-sm font-medium text-muted-foreground">Kingdom</dt>
            <dd className="mt-1 break-words text-base font-medium">{species.kingdom}</dd>
          </div>
          <div className="min-w-0 rounded-lg bg-muted/50 p-4">
            <dt className="text-sm font-medium text-muted-foreground">Total population</dt>
            <dd className="mt-1 break-words text-base font-medium tabular-nums">{population}</dd>
          </div>
          <div className="min-w-0 border-t pt-4 sm:col-span-2">
            <dt className="text-sm font-medium text-muted-foreground">Description</dt>
            <dd className="mt-2 whitespace-pre-wrap break-words leading-7">{description}</dd>
          </div>
        </dl>

        <Button asChild variant="outline" className="w-full sm:w-fit">
          <Link
            href={{
              pathname: "/species-chatbot",
              query: {
                speciesId: species.id,
                question: `What should I know about ${speciesName}?`,
              },
            }}
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            Ask about this species
          </Link>
        </Button>
      </DialogContent>
    </Dialog>
  );
}
