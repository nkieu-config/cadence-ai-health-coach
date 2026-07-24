"use server";

import { revalidatePath } from "next/cache";
import {
  COACH_SYSTEM_PROMPT,
  aiErrorMessage,
  generate,
  isQuotaExhausted,
  type ChatTurn,
} from "@/lib/ai";
import { getCheckins } from "@/lib/checkins/queries";
import { createClient } from "@/lib/supabase/server";
import { buildCoachContext } from "./context";
import { buildCoachOpener } from "./opener";
import { countMessagesToday, getChatHistory, recordMessageSent } from "./queries";
import {
  CHAT_COLUMNS,
  CONTEXT_TURN_LIMIT,
  DAILY_MESSAGE_LIMIT,
  MESSAGE_MAX_LENGTH,
  type ChatMessage,
  type ChatMessageRow,
  toChatMessage,
} from "./types";

export type ChatResult =
  | { ok: true; message: ChatMessage }
  | { error: string; userMessage?: ChatMessage; quotaLeft?: number }
  | { notice: string; userMessage?: ChatMessage; quotaLeft?: number };
export type ClearResult = { ok: true } | { error: string };

type Supabase = Awaited<ReturnType<typeof createClient>>;

const OPENER_WINDOW_DAYS = 7;

async function insertMessage(
  supabase: Supabase,
  userId: string,
  role: "user" | "coach",
  content: string
): Promise<ChatMessage | null> {
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({ user_id: userId, role, content })
    .select(CHAT_COLUMNS)
    .single();

  if (error || !data) return null;
  return toChatMessage(data as unknown as ChatMessageRow);
}

// คำถามเปิดสร้างฝั่ง server แล้วโชว์เป็นข้อความโค้ช แต่ไม่เคยถูกบันทึกลง DB
// ถ้าไม่ยัดกลับเข้า turns โมเดลจะไม่เห็นคำถามที่ผู้ใช้กำลังตอบอยู่
async function openingTurn(): Promise<ChatTurn | null> {
  const opener = buildCoachOpener(await getCheckins(OPENER_WINDOW_DAYS));
  return opener ? { role: "coach", content: `${opener.fact}\n\n${opener.question}` } : null;
}

async function replyToHistory(
  supabase: Supabase,
  userId: string,
  history: ChatMessage[]
): Promise<ChatResult> {
  const recent = history.slice(-CONTEXT_TURN_LIMIT);
  const turns: ChatTurn[] = recent.map((message) => ({
    role: message.role,
    content: message.content,
  }));

  if (recent[0]?.role === "user") {
    const opening = await openingTurn();
    if (opening) turns.unshift(opening);
  }

  const context = await buildCoachContext();
  const system = context ? `${COACH_SYSTEM_PROMPT}\n\n${context}` : COACH_SYSTEM_PROMPT;

  let reply: string;
  try {
    reply = await generate(turns, { system });
  } catch (error) {
    // โควตา AI หมดไม่ใช่ความผิดผู้ใช้ — ต้องไม่ขึ้นโทน error
    return isQuotaExhausted(error)
      ? { notice: aiErrorMessage(error) }
      : { error: aiErrorMessage(error) };
  }

  const message = await insertMessage(supabase, userId, "coach", reply);
  if (!message) {
    return { error: "บันทึกคำตอบไม่สำเร็จ กด “ลองใหม่” ได้เลย" };
  }

  revalidatePath("/coach");
  return { ok: true, message };
}

export async function sendCoachMessage(text: string): Promise<ChatResult> {
  const content = text.trim();
  if (!content) {
    return { error: "พิมพ์ข้อความก่อนส่ง" };
  }
  if (content.length > MESSAGE_MAX_LENGTH) {
    return { error: `ข้อความยาวเกิน ${MESSAGE_MAX_LENGTH} ตัวอักษร` };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" };
  }

  if ((await countMessagesToday()) >= DAILY_MESSAGE_LIMIT) {
    return {
      notice: `วันนี้คุยกับโค้ชครบ ${DAILY_MESSAGE_LIMIT} ข้อความแล้ว — พรุ่งนี้กลับมาคุยต่อได้ ระหว่างนี้ยังเช็คอินและดูข้อมูลย้อนหลังได้ตามปกติ`,
      quotaLeft: 0,
    };
  }

  const saved = await insertMessage(supabase, user.id, "user", content);
  if (!saved) {
    return { error: "ส่งข้อความไม่สำเร็จ ลองใหม่อีกครั้ง" };
  }
  await recordMessageSent();
  revalidatePath("/coach");

  const history = await getChatHistory();
  const result = await replyToHistory(supabase, user.id, history);
  return "ok" in result ? result : { ...result, userMessage: saved };
}

export async function retryCoachReply(): Promise<ChatResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" };
  }

  const history = await getChatHistory();
  if (history.at(-1)?.role !== "user") {
    return { error: "ไม่มีข้อความที่รอคำตอบอยู่" };
  }

  return replyToHistory(supabase, user.id, history);
}

export async function clearChatHistory(): Promise<ClearResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" };
  }

  const { error } = await supabase.from("chat_messages").delete().eq("user_id", user.id);
  if (error) {
    return { error: "ลบประวัติแชทไม่สำเร็จ ลองใหม่อีกครั้ง" };
  }

  revalidatePath("/coach");
  return { ok: true };
}
