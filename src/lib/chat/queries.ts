import { createClient } from "@/lib/supabase/server";
import {
  CHAT_COLUMNS,
  CHAT_HISTORY_LIMIT,
  type ChatMessage,
  type ChatMessageRow,
  toChatMessage,
} from "./types";

export async function getChatHistory(limit = CHAT_HISTORY_LIMIT): Promise<ChatMessage[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("chat_messages")
    .select(CHAT_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return (data as unknown as ChatMessageRow[]).map(toChatMessage).reverse();
}

export function needsReply(history: ChatMessage[]): boolean {
  return history.at(-1)?.role === "user";
}
