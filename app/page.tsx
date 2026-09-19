import SpeciesImage from "@/components/species-image";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Compass, Leaf, Sprout } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl">
      <section className="grid items-center gap-10 py-4 sm:py-8 lg:grid-cols-[1.05fr_1fr] lg:gap-16 lg:py-12">
        <div>
          <p className="field-eyebrow flex items-center gap-2">
            <Sprout className="h-4 w-4" aria-hidden="true" />A shared biodiversity field guide
          </p>
          <h1 className="field-title mt-6 text-5xl leading-[1.08] sm:text-6xl lg:text-7xl">
            A world of life.
            <br />
            <span className="text-primary">A little closer.</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-8 text-muted-foreground sm:text-lg">
            From familiar neighbors to extraordinary species. Explore the living world, share your knowledge, and find
            your next question.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/species">
                Explore species
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/species-chatbot">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                Ask Field Guide
              </Link>
            </Button>
          </div>
          <p className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
            <Leaf className="h-4 w-4 text-primary" aria-hidden="true" />
            For researchers, naturalists, and the endlessly curious.
          </p>
        </div>
        <figure className="group relative isolate aspect-[5/4] overflow-hidden rounded-[2rem] bg-muted shadow-xl lg:aspect-[4/5]">
          <SpeciesImage
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Irbis4.JPG/960px-Irbis4.JPG"
            name="Snow leopard on a rocky ledge"
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          <span className="absolute left-6 top-6 rounded-full border border-white/30 bg-black/30 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
            Meet the natural world
          </span>
          <figcaption className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8">
            <p className="text-xs uppercase tracking-[0.18em] text-white/80">Mountain wildlife</p>
            <p className="field-title mt-2 text-3xl">The elusive snow leopard</p>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3 text-xs text-white/80">
              <span className="italic">Panthera uncia</span>
              <a
                href="https://commons.wikimedia.org/wiki/File:Irbis4.JPG"
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4 hover:text-white"
              >
                Irbis1983 · Public domain ↗
              </a>
            </div>
          </figcaption>
        </figure>
      </section>
      <section className="grid gap-4 border-t border-border/70 py-9 sm:grid-cols-3" aria-label="Ways to explore">
        {[
          {
            title: "Discover the collection",
            description: "Get to know species through their names, characteristics, and community-contributed records.",
            icon: Compass,
            href: "/species",
          },
          {
            title: "Leave a little knowledge",
            description: "Add a field record of your own. Start from scratch or use a Wikipedia-assisted description.",
            icon: Sprout,
            href: "/species",
          },
          {
            title: "Follow your curiosity",
            description: "Explore habitats, adaptations, and conservation with a conversation in Field Guide.",
            icon: BookOpen,
            href: "/species-chatbot",
          },
        ].map(({ title, description, icon: Icon, href }) => (
          <Link key={title} href={href} className="group rounded-2xl p-5 transition-colors hover:bg-accent/50 sm:p-6">
            <Icon className="h-6 w-6 text-primary" strokeWidth={1.5} aria-hidden="true" />
            <h2 className="mt-4 flex items-center gap-2 text-base font-semibold">
              {title}
              <ArrowRight
                className="h-4 w-4 text-primary transition-transform motion-safe:group-hover:translate-x-1"
                aria-hidden="true"
              />
            </h2>
            <p className="mt-2 text-sm leading-7 text-muted-foreground">{description}</p>
          </Link>
        ))}
      </section>
      <footer className="flex flex-wrap justify-between gap-2 border-t py-5 text-xs text-muted-foreground">
        <span>Biodiversity Hub · A shared field guide</span>
        <span>Observe. Understand. Contribute.</span>
      </footer>
    </div>
  );
}
