import { supabase } from "../lib/supabase";

export async function saveWorkoutHistory(workout: any) {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase.from("workout_history").insert({
        ...workout,
        user_id: user.id,
        completed_at: workout.completed_at ?? new Date().toISOString(),
    });

    if (error) console.error(error);
}
