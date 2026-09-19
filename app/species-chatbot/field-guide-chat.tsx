"use client";

import { Button } from "@/components/ui/button";
import type { ChatHistoryMessage, ChatRole, SpeciesChatContext } from "@/lib/chat-types";
import { ArrowUp, Compass, Leaf, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface DisplayMessage extends ChatHistoryMessage {
  id: string;
}

interface FailedRequest {
  message: string;
  history: ChatHistoryMessage[];
  speciesId?: number;
}

const generalStarters = [
  "How do polar bears stay warm in Arctic habitats?",
  "Compare the diets of giant pandas and brown bears.",
  "What are the main conservation threats facing sea turtles?",
];

function isErrorPayload(value: unknown): value is { error: string } {
  return typeof value === "object" && value !== null && "error" in value && typeof value.error === "string";
}

function isSuccessPayload(value: unknown): value is { response: string } {
  return typeof value === "object" && value !== null && "response" in value && typeof value.response === "string";
}

function newMessage(role: ChatRole, content: string): DisplayMessage {
  return { id: crypto.randomUUID(), role, content };
}

export default function FieldGuideChat({
  initialQuestion,
  initialSpecies,
  speciesNotice,
}: {
  initialQuestion: string;
  initialSpecies: SpeciesChatContext | null;
  speciesNotice: string | null;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState(initialQuestion);
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [selectedSpecies, setSelectedSpecies] = useState(initialSpecies);
  const [error, setError] = useState<string | null>(speciesNotice);
  const [failedRequest, setFailedRequest] = useState<FailedRequest | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const shouldAutoScrollRef = useRef(true);
  const activeControllerRef = useRef<AbortController | null>(null);
  const conversationGenerationRef = useRef(0);

  useEffect(() => {
    if (!shouldAutoScrollRef.current) return;
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) scrollArea.scrollTop = messages.length === 0 ? 0 : scrollArea.scrollHeight;
  }, [messages, isLoading]);

  const speciesName = selectedSpecies?.common_name ?? selectedSpecies?.scientific_name;
  const starters = selectedSpecies
    ? [
        `What habitat does ${speciesName} prefer?`,
        `What does ${speciesName} eat?`,
        `What are the main threats facing ${speciesName}?`,
      ]
    : generalStarters;

  const requestAnswer = async (request: FailedRequest, appendUser: boolean) => {
    const generation = conversationGenerationRef.current;
    const controller = new AbortController();
    activeControllerRef.current = controller;
    setIsLoading(true);
    setError(null);
    setFailedRequest(null);

    if (appendUser) setMessages((current) => [...current, newMessage("user", request.message)]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: request.message,
          history: request.history,
          speciesId: request.speciesId,
        }),
        signal: controller.signal,
      });
      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) throw new Error(isErrorPayload(payload) ? payload.error : "Field Guide could not respond.");
      if (!isSuccessPayload(payload)) throw new Error("Field Guide returned an unexpected response.");
      if (generation !== conversationGenerationRef.current) return;

      setMessages((current) => [...current, newMessage("assistant", payload.response)]);
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === "AbortError") return;
      if (generation !== conversationGenerationRef.current) return;

      setFailedRequest(request);
      setError(requestError instanceof Error ? requestError.message : "Field Guide could not respond.");
    } finally {
      if (generation === conversationGenerationRef.current) setIsLoading(false);
      if (activeControllerRef.current === controller) activeControllerRef.current = null;
    }
  };

  const submitDraft = () => {
    const message = draft.trim();
    if (message.length === 0 || isLoading) return;

    const history = messages.slice(-8).map(({ role, content }) => ({ role, content }));
    const request = { message, history, speciesId: selectedSpecies?.id };
    setDraft("");
    shouldAutoScrollRef.current = true;
    void requestAnswer(request, true);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    submitDraft();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    submitDraft();
  };

  const startNewConversation = () => {
    conversationGenerationRef.current += 1;
    activeControllerRef.current?.abort();
    activeControllerRef.current = null;
    setMessages([]);
    setSelectedSpecies(null);
    setDraft("");
    setError(null);
    setFailedRequest(null);
    setIsLoading(false);
    shouldAutoScrollRef.current = true;
    router.replace("/species-chatbot");
  };

  const removeSpecies = () => {
    setSelectedSpecies(null);
    setError(null);
    router.replace("/species-chatbot");
  };

  return (
    <div className="mx-auto flex h-[max(38rem,calc(100dvh-11rem))] w-full max-w-4xl flex-col gap-4">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b pb-4">
        <div>
          <p className="field-eyebrow">Wildlife and ecology assistant</p>
          <h1 className="field-title mt-2 text-4xl">Field Guide</h1>
          <p className="mt-2 text-sm text-muted-foreground">A little curiosity goes a long way.</p>
        </div>
        <Button type="button" variant="outline" onClick={startNewConversation}>
          <Plus className="h-4 w-4" aria-hidden="true" />
          New conversation
        </Button>
      </header>

      {selectedSpecies && (
        <div className="flex w-fit max-w-full items-center gap-2 rounded-full border bg-muted px-3 py-1.5 text-sm">
          <span className="truncate">Discussing: {speciesName}</span>
          <button
            type="button"
            onClick={removeSpecies}
            disabled={isLoading}
            className="rounded-full px-1 font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            aria-label={`Stop discussing ${speciesName}`}
          >
            ×
          </button>
        </div>
      )}

      <div
        ref={scrollAreaRef}
        onScroll={(event) => {
          const element = event.currentTarget;
          shouldAutoScrollRef.current = element.scrollHeight - element.scrollTop - element.clientHeight < 80;
        }}
        className="field-panel min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-6"
        aria-live="polite"
        aria-label="Field Guide conversation"
      >
        {messages.length === 0 ? (
          <section className="mx-auto flex min-h-full max-w-2xl flex-col items-center justify-center py-8 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-accent text-primary">
              <Leaf className="h-8 w-8" strokeWidth={1.5} aria-hidden="true" />
            </div>
            <h2 className="field-title text-3xl">What would you like to explore?</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
              Field Guide can help with habitats, diets, adaptations, comparisons, and conservation.
            </p>
            <div className="mt-6 grid w-full gap-2 sm:grid-cols-3">
              {starters.map((starter) => (
                <Button
                  key={starter}
                  type="button"
                  variant="outline"
                  className="h-auto flex-col items-start justify-start gap-3 rounded-2xl p-4 text-left text-xs leading-6"
                  onClick={() => setDraft(starter)}
                >
                  <Compass className="h-5 w-5 text-primary" aria-hidden="true" />
                  {starter}
                </Button>
              ))}
            </div>
          </section>
        ) : (
          messages.map((message) => (
            <article key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`min-w-0 max-w-[90%] break-words rounded-2xl px-4 py-3 text-sm leading-7 sm:max-w-[78%] ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "border bg-background text-foreground"
                }`}
              >
                <span className="sr-only">{message.role === "user" ? "You" : "Field Guide"}:</span>
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="mb-3 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>,
                    ol: ({ children }) => <ol className="mb-3 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>,
                    table: ({ children }) => (
                      <div className="my-3 overflow-x-auto">
                        <table className="w-full border-collapse text-left">{children}</table>
                      </div>
                    ),
                    th: ({ children }) => <th className="border px-2 py-1 font-semibold">{children}</th>,
                    td: ({ children }) => <td className="border px-2 py-1 align-top">{children}</td>,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            </article>
          ))
        )}
        {isLoading && (
          <p className="text-sm text-muted-foreground" role="status">
            Field Guide is thinking…
          </p>
        )}
      </div>

      {error && (
        <div
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm"
          role="alert"
        >
          <span>{error}</span>
          {failedRequest && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={isLoading}
              onClick={() => void requestAnswer(failedRequest, false)}
            >
              Retry
            </Button>
          )}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="field-panel p-3 focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-primary/20"
      >
        <label htmlFor="field-guide-message" className="sr-only">
          Ask Field Guide
        </label>
        <textarea
          id="field-guide-message"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={2_000}
          rows={2}
          placeholder="Ask about a species…"
          className="w-full resize-none rounded-xl bg-transparent p-2 text-sm outline-none placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          disabled={isLoading}
        />
        <div className="flex items-center justify-between gap-3 border-t pt-3">
          <p className="text-xs text-muted-foreground">Enter to send · Shift+Enter for a new line</p>
          <Button type="submit" disabled={isLoading || draft.trim().length === 0}>
            {isLoading ? "Waiting…" : "Send"}
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </form>
    </div>
  );
}
