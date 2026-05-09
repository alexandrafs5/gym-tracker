import { supabase } from "../lib/supabase";

export async function saveWorkoutHistory(workout: any) {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const duration = Math.floor((Date.now() - workout.startTime) / 1000);

    const { error } = await supabase.from("workout_history").insert({
        user_id: user.id,
        routine_name: workout.routineName,
        duration,
        exercises: workout.exercises,
    });

    if (error) {
        console.error("Save workout history error:", error);
    }
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
        .order("completed_at", {
            ascending: false,
        });

    if (error) {
        console.error("Fetch workout history error:", error);
        return [];
    }

    return data;
}
