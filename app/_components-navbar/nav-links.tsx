"use client";

import { cn } from "@/lib/utils";
import { BookOpen, LayoutGrid } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLinks() {
  const pathname = usePathname();
  return (
    <div className="flex items-center gap-1 rounded-full border bg-muted/60 p-1">
      {[
        { href: "/species", label: "Species", icon: LayoutGrid },
        { href: "/species-chatbot", label: "Field Guide", icon: BookOpen },
      ].map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          aria-current={pathname === href ? "page" : undefined}
          className={cn(
            "flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm",
            pathname === href
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:bg-card hover:text-foreground",
          )}
        >
          <Icon className="hidden h-4 w-4 sm:block" aria-hidden="true" />
          {label}
        </Link>
      ))}
    </div>
  );
}
