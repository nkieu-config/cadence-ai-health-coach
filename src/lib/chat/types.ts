export type ChatRole = "user" | "coach";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
};

export type ChatMessageRow = {
  id: string;
  role: string;
  content: string;
  created_at: string;
};

export const CHAT_COLUMNS = ["id", "role", "content", "created_at"].join(", ");

export const CHAT_HISTORY_LIMIT = 50;

export const CONTEXT_TURN_LIMIT = 20;

export const DAILY_MESSAGE_LIMIT = 5;

export const MESSAGE_MAX_LENGTH = 500;

export function toChatMessage(row: ChatMessageRow): ChatMessage {
  return {
    id: row.id,
    role: row.role as ChatRole,
    content: row.content,
    createdAt: row.created_at,
  };
}

export function needsReply(history: ChatMessage[]): boolean {
  return history.at(-1)?.role === "user";
}
