export const USER_DATA_TABLES = [
  "checkins",
  "goals",
  "chat_messages",
  "ai_outputs",
  "profiles",
] as const;

export type UserDataTable = (typeof USER_DATA_TABLES)[number];
