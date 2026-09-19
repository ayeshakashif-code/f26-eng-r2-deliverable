"use client";

import SpeciesImage from "@/components/species-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { WikipediaArticle, WikipediaSearchResponse } from "@/lib/wikipedia-types";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { SpeciesFormValues } from "./species-form";

function hasError(value: unknown): value is { error: string } {
  return typeof value === "object" && value !== null && "error" in value && typeof value.error === "string";
}

function hasArticles(value: unknown): value is WikipediaSearchResponse {
  return typeof value === "object" && value !== null && "articles" in value && Array.isArray(value.articles);
}

function importedDescription(article: WikipediaArticle) {
  const attribution = [
    `Source: Wikipedia contributors, “${article.title}.” ${article.articleUrl}`,
    "Text adapted under CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/.",
    article.imageCreditUrl === null
      ? null
      : `Image source and licensing details: ${article.imageCreditUrl} (image licensing may differ from Wikipedia text).`,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");

  return `${article.extract}\n\n${attribution}`;
}

export default function WikipediaLookup({
  form,
  disabled,
}: {
  form: UseFormReturn<SpeciesFormValues>;
  disabled: boolean;
}) {
  const [query, setQuery] = useState("");
  const [articles, setArticles] = useState<WikipediaArticle[]>([]);
  const [selectedArticleId, setSelectedArticleId] = useState<number | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef(0);

  useEffect(
    () => () => {
      requestIdRef.current += 1;
      controllerRef.current?.abort();
    },
    [],
  );

  const selectedArticle = articles.find((article) => article.id === selectedArticleId) ?? null;

  const search = async () => {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length === 0) {
      requestIdRef.current += 1;
      controllerRef.current?.abort();
      controllerRef.current = null;
      setIsSearching(false);
      setStatus(null);
      setError("Enter a common or scientific name.");
      return;
    }

    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    setIsSearching(true);
    setError(null);
    setStatus(null);

    try {
      const response = await fetch(`/api/wikipedia?q=${encodeURIComponent(trimmedQuery)}`, {
        signal: controller.signal,
      });
      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) throw new Error(hasError(payload) ? payload.error : "Wikipedia search failed.");
      if (!hasArticles(payload)) throw new Error("Wikipedia returned an unexpected response.");
      if (requestId !== requestIdRef.current) return;

      setArticles(payload.articles);
      setSelectedArticleId(payload.articles[0]?.id ?? null);
      if (payload.articles.length === 0) setStatus("No matching Wikipedia articles were found.");
      else if (payload.articles.length > 1) setStatus("Choose the article that matches your species.");
      else setStatus("One matching article found.");
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === "AbortError") return;
      if (requestId !== requestIdRef.current) return;

      setArticles([]);
      setSelectedArticleId(null);
      setError(requestError instanceof Error ? requestError.message : "Wikipedia search failed.");
    } finally {
      if (requestId === requestIdRef.current) setIsSearching(false);
      if (controllerRef.current === controller) controllerRef.current = null;
    }
  };

  const useArticle = () => {
    if (selectedArticle === null || selectedArticle.extract.length === 0) return;

    const currentDescription = form.getValues("description")?.trim() ?? "";
    const currentImage = form.getValues("image")?.trim() ?? "";
    const description = importedDescription(selectedArticle);
    const replacesDescription = currentDescription.length > 0 && currentDescription !== description;
    const replacesImage =
      selectedArticle.thumbnailUrl !== null && currentImage.length > 0 && currentImage !== selectedArticle.thumbnailUrl;

    if (
      (replacesDescription || replacesImage) &&
      !window.confirm("This will replace your existing description or image URL. Continue?")
    ) {
      return;
    }

    form.setValue("description", description, { shouldDirty: true, shouldValidate: true });
    if (selectedArticle.thumbnailUrl !== null) {
      form.setValue("image", selectedArticle.thumbnailUrl, { shouldDirty: true, shouldValidate: true });
      setStatus("Description and image added. Review or edit them before saving.");
    } else {
      setStatus("Description added. This article has no image, so your current image was preserved.");
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    void search();
  };

  return (
    <section
      className="mb-5 rounded-xl border bg-muted/40 p-4"
      aria-labelledby="wikipedia-lookup-heading"
      aria-busy={isSearching}
    >
      <div className="mb-3">
        <label id="wikipedia-lookup-heading" htmlFor="wikipedia-query" className="text-sm font-semibold">
          Find on Wikipedia
        </label>
        <p className="text-xs text-muted-foreground">
          Search by a common or scientific name, then choose what to import.
        </p>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          id="wikipedia-query"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. red panda or Ailurus fulgens"
          maxLength={100}
          disabled={disabled}
        />
        <Button type="button" variant="outline" onClick={() => void search()} disabled={disabled}>
          {isSearching ? "Searching…" : "Search"}
        </Button>
      </div>

      {error && (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      {status && (
        <p className="mt-3 text-sm text-muted-foreground" role="status">
          {status}
        </p>
      )}

      {articles.length > 1 && (
        <div className="mt-3 flex flex-wrap gap-2" aria-label="Matching Wikipedia articles">
          {articles.map((article) => (
            <Button
              key={article.id}
              type="button"
              size="sm"
              variant={article.id === selectedArticleId ? "default" : "outline"}
              onClick={() => setSelectedArticleId(article.id)}
              disabled={disabled || isSearching}
            >
              {article.title}
            </Button>
          ))}
        </div>
      )}

      {selectedArticle && (
        <article className="mt-4 grid gap-4 rounded-lg border bg-background p-3 sm:grid-cols-[7rem_1fr]">
          {selectedArticle.thumbnailUrl ? (
            <div className="relative aspect-square overflow-hidden rounded-md bg-muted">
              <SpeciesImage src={selectedArticle.thumbnailUrl} name={selectedArticle.title} sizes="112px" />
            </div>
          ) : (
            <div className="flex aspect-square items-center justify-center rounded-md bg-muted px-2 text-center text-xs text-muted-foreground">
              No article image
            </div>
          )}
          <div className="min-w-0">
            <h4 className="break-words font-semibold">{selectedArticle.title}</h4>
            <p className="mt-1 line-clamp-4 text-sm leading-6 text-muted-foreground">
              {selectedArticle.extract || "This article has no plain-text introduction to import."}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                onClick={useArticle}
                disabled={disabled || isSearching || selectedArticle.extract.length === 0}
              >
                Use description and image
              </Button>
              <a
                href={selectedArticle.articleUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                View on Wikipedia
              </a>
            </div>
          </div>
        </article>
      )}
    </section>
  );
}
