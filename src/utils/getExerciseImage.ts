import { EXERCISE_ASSETS } from "../assets/exerciseAssets";

export function getExerciseImage(exerciseId: string): string {
    return EXERCISE_ASSETS[exerciseId] || "/exercises/fallback.jpg";
}
