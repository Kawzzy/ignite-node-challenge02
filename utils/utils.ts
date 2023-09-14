import { IMeal } from "../types/types";
import { FastifyRequest } from "fastify";

export function getUserId(req: FastifyRequest) {
  return req.cookies.sessionId
}

export function calculateLongestStreak(meals: Array<IMeal>) {
  
  let longestStreak = 0;
  let currentStreak = 0;

  for (const meal of meals) {
    if (meal.isHealthy) {
      currentStreak++;
    } else {
      longestStreak = Math.max(longestStreak, currentStreak);
      currentStreak = 0;
    }
  }

  return Math.max(longestStreak, currentStreak);
}