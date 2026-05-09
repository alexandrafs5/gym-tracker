import { supabase } from "../lib/supabase";

export async function saveWorkoutHistory(workout: any) {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase.from("workout_history").insert({
        user_id: user.id,
        routine_name: workout.routineName,
        completed_at: new Date().toISOString(),
        duration: workout.duration,
        exercises: workout.exercises,
    });

    if (error) console.error(error);
}

export async function fetchWorkoutHistory() {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from("workout_history")
        .select("*")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false });

    if (error) {
        console.error(error);
        return [];
    }

    return data ?? [];
}
