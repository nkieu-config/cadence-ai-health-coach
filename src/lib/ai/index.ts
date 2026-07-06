import { GoogleGenAI } from "@google/genai";
import { COACH_SYSTEM_PROMPT } from "./system-prompt";

export type ChatTurn = {
  role: "user" | "coach";
  content: string;
};

export type GenerateOptions = {
  system?: string;
  jsonSchema?: object;
};

const DEFAULT_MODEL = "gemini-2.5-flash";

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenAI({ apiKey });
}

export async function generate(
  turns: ChatTurn[],
  options: GenerateOptions = {}
): Promise<string> {
  const client = getClient();
  const response = await client.models.generateContent({
    model: process.env.AI_MODEL ?? DEFAULT_MODEL,
    contents: turns.map((turn) => ({
      role: turn.role === "user" ? "user" : "model",
      parts: [{ text: turn.content }],
    })),
    config: {
      systemInstruction: options.system ?? COACH_SYSTEM_PROMPT,
      ...(options.jsonSchema
        ? {
            responseMimeType: "application/json",
            responseSchema: options.jsonSchema,
          }
        : {}),
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("AI returned an empty response");
  }
  return text;
}

export async function generateJson<T>(
  turns: ChatTurn[],
  jsonSchema: object,
  system?: string
): Promise<T> {
  const raw = await generate(turns, { system, jsonSchema });
  return JSON.parse(raw) as T;
}

export { COACH_SYSTEM_PROMPT };
