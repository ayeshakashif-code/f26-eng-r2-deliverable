import { ModeToggle } from "@/app/_components-navbar/mode-toggle";
import { Toaster } from "@/components/ui/toaster";
import AuthStatus from "./_components-navbar/auth-status";
import Navbar from "./_components-navbar/navbar";
import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "Biodiversity Hub",
  description: "A shared field guide for exploring and documenting species.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* Hydration warning suppressed because of next-themes https://github.com/pacocoursey/next-themes */}
      <body>
        <Providers>
          <div className="min-h-screen">
            <a
              href="#main-content"
              className="sr-only z-50 rounded-lg bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
            >
              Skip to content
            </a>
            <header className="border-b border-border/70 bg-background/90 backdrop-blur-xl">
              <div className="mx-auto flex min-h-20 max-w-7xl items-center gap-2 px-4 py-3 sm:px-6 lg:px-8">
                <Navbar />
                <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-3">
                  <ModeToggle />
                  <AuthStatus />
                </div>
              </div>
            </header>
            <div className="px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
              <main id="main-content" tabIndex={-1}>
                {children}
              </main>
            </div>
          </div>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
