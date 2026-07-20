import type { Checkin } from "@/lib/domain";
import type { CheckinRow } from "./types";

export function toCheckin(row: CheckinRow): Checkin {
  return {
    checkinDate: row.checkin_date,
    mealsCount: row.meals_count,
    skippedMeals: (row.skipped_meals ?? []) as Checkin["skippedMeals"],
    firstMealTime: (row.first_meal_time ?? null) as Checkin["firstMealTime"],
    foodTypes: (row.food_types ?? []) as Checkin["foodTypes"],
    sweetDrinks: row.sweet_drinks ?? 0,
    mealFeeling: (row.meal_feeling ?? null) as Checkin["mealFeeling"],
    sleepHours: Number(row.sleep_hours),
    bedTimeBucket: row.bed_time_bucket as Checkin["bedTimeBucket"],
    sleepQuality: row.sleep_quality as Checkin["sleepQuality"],
    lateReason: (row.late_reason ?? null) as Checkin["lateReason"],
    movementTypes: (row.movement_types ?? []) as Checkin["movementTypes"],
    movementMinutes: row.movement_minutes ?? 0,
    movementBlocker: (row.movement_blocker ?? null) as Checkin["movementBlocker"],
    movementFeeling: (row.movement_feeling ?? null) as Checkin["movementFeeling"],
    energyLevel: row.energy_level as Checkin["energyLevel"],
    disruptors: (row.disruptors ?? []) as Checkin["disruptors"],
    note: row.note,
  };
}

export function toRow(checkin: Checkin, userId: string) {
  return {
    user_id: userId,
    checkin_date: checkin.checkinDate,
    meals_count: checkin.mealsCount,
    skipped_meals: checkin.skippedMeals,
    first_meal_time: checkin.firstMealTime,
    food_types: checkin.foodTypes,
    sweet_drinks: checkin.sweetDrinks,
    meal_feeling: checkin.mealFeeling,
    sleep_hours: checkin.sleepHours,
    bed_time_bucket: checkin.bedTimeBucket,
    sleep_quality: checkin.sleepQuality,
    late_reason: checkin.lateReason,
    movement_types: checkin.movementTypes,
    movement_minutes: checkin.movementMinutes,
    movement_blocker: checkin.movementBlocker,
    movement_feeling: checkin.movementFeeling,
    energy_level: checkin.energyLevel,
    disruptors: checkin.disruptors,
    note: checkin.note,
  };
}
