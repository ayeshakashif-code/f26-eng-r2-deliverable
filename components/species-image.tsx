"use client";

import { speciesImageSources } from "@/lib/species-image";
import Image from "next/image";
import { useState } from "react";

interface SpeciesImageProps {
  src: string | null;
  name: string;
  priority?: boolean;
  sizes?: string;
}

export default function SpeciesImage(props: SpeciesImageProps) {
  // A new saved URL starts its own loading cycle, without retaining the old error.
  return <ImageWithFallback key={props.src} {...props} />;
}

function ImageWithFallback({ src, name, priority = false, sizes }: SpeciesImageProps) {
  const sources = speciesImageSources(src);
  const [attempt, setAttempt] = useState(0);
  const currentSource = sources[attempt];

  return currentSource ? (
    <Image
      src={currentSource}
      alt={name}
      fill
      priority={priority}
      sizes={sizes ?? "(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"}
      className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-105"
      onError={() => setAttempt((current) => current + 1)}
    />
  ) : (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-accent/60 text-primary">
      <svg viewBox="0 0 240 160" className="h-36 w-52" fill="none" aria-hidden="true">
        <circle cx="120" cy="80" r="65" fill="currentColor" opacity=".05" />
        <circle cx="120" cy="80" r="54" stroke="currentColor" opacity=".12" />
        <path
          d="M119 140C115 100 129 67 151 29M121 115C99 106 76 86 72 64M128 88C143 85 163 71 174 52"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M127 88C111 66 118 37 151 29C151 56 143 77 127 88ZM119 117C88 113 70 90 72 64C96 71 116 89 119 117ZM134 87C153 91 174 77 174 52C153 52 136 65 134 87Z"
          fill="currentColor"
          opacity=".2"
          stroke="currentColor"
        />
        <path d="M52 139H189" stroke="currentColor" opacity=".2" />
      </svg>
      <span className="text-xs font-medium tracking-wide">Photo not available</span>
      <span className="sr-only">for {name}</span>
    </div>
  );
}
