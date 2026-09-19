import type { Database } from "./schema";

export type ChatRole = "user" | "assistant";

export interface ChatHistoryMessage {
  role: ChatRole;
  content: string;
}

type Species = Database["public"]["Tables"]["species"]["Row"];

export type SpeciesChatContext = Pick<
  Species,
  "id" | "scientific_name" | "common_name" | "kingdom" | "total_population" | "description"
>;
