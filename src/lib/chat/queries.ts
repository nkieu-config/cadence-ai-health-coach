import { today } from "@/lib/checkins/date";
import { createClient } from "@/lib/supabase/server";
import {
  CHAT_COLUMNS,
  CHAT_HISTORY_LIMIT,
  DAILY_MESSAGE_LIMIT,
  type ChatMessage,
  type ChatMessageRow,
  toChatMessage,
} from "./types";

async function countFromMessages(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("chat_messages")
    .select("id", { count: "exact", head: true })
    .eq("role", "user")
    .gte("created_at", `${today()}T00:00:00+07:00`);

  if (error) return 0;
  return count ?? 0;
}

// ตัวนับแยกอยู่รอดการล้างประวัติ จึงเป็นแหล่งความจริงของโควตา
// ถ้า migration 0004 ยังไม่ถูก apply จะตกกลับไปนับจากแถวแบบเดิม แอปจึงไม่พังระหว่างรอ deploy
export async function countMessagesToday(): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("chat_daily_usage")
    .select("message_count")
    .eq("usage_date", today())
    .maybeSingle();

  if (error) return countFromMessages();

  const tracked = (data as { message_count: number } | null)?.message_count ?? 0;
  return Math.max(tracked, await countFromMessages());
}

export async function recordMessageSent(): Promise<void> {
  const supabase = await createClient();
  await supabase.rpc("bump_chat_usage", { day: today() });
}

export async function messagesLeftToday(): Promise<number> {
  return Math.max(0, DAILY_MESSAGE_LIMIT - (await countMessagesToday()));
}

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
