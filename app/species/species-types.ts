import type { Database } from "@/lib/schema";

export type Species = Database["public"]["Tables"]["species"]["Row"];
