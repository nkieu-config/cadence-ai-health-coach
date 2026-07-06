import type { Checkin, PatternCandidate } from "./types";

export const MIN_DAYS_FOR_ANALYSIS = 7;
export const MIN_DAYS_PER_GROUP = 3;
export const MIN_RELATIVE_DIFFERENCE = 0.2;

export function hasEnoughData(checkins: Checkin[]): boolean {
  return checkins.length >= MIN_DAYS_FOR_ANALYSIS;
}

export function computePatternCandidates(checkins: Checkin[]): PatternCandidate[] {
  if (!hasEnoughData(checkins)) {
    return [];
  }
  throw new Error("F3-01: computePatternCandidates not implemented yet");
}

export type * from "./types";
