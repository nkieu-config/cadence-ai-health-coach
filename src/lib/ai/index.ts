import { GoogleGenAI } from "@google/genai";
import { classifyAiError, isRetryable } from "./errors";
import { DEFAULT_MODEL } from "./model";
import { COACH_SYSTEM_PROMPT } from "./system-prompt";

export type ChatTurn = {
  role: "user" | "coach";
  content: string;
};

export type GenerateOptions = {
  system?: string;
  jsonSchema?: object;
};

const RETRY_DELAY_MS = 4000;

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenAI({ apiKey });
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function callModel(turns: ChatTurn[], options: GenerateOptions): Promise<string> {
  const client = getClient();
  const response = await client.models.generateContent({
    model: process.env.AI_MODEL?.trim() || DEFAULT_MODEL,
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

export async function generate(turns: ChatTurn[], options: GenerateOptions = {}): Promise<string> {
  try {
    return await callModel(turns, options);
  } catch (error) {
    const classified = classifyAiError(error);
    if (!isRetryable(classified)) throw classified;

    await sleep(RETRY_DELAY_MS);
    try {
      return await callModel(turns, options);
    } catch (retryError) {
      throw classifyAiError(retryError);
    }
  }
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
export {
  AiError,
  aiErrorMessage,
  classifyAiError,
  isQuotaExhausted,
  isRetryable,
  type AiFailure,
} from "./errors";
