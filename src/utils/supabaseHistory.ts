import { supabase } from "../lib/supabase";
import { isOnline } from "./network";
import { loadLocalHistory, saveLocalHistory } from "./offlineStorage";

export async function saveWorkoutHistory(workout: any) {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const payload = {
        user_id: user.id,
        routine_name: workout.routineName,
        completed_at: workout.completed_at,
        duration: workout.duration,
        exercises: workout.exercises,
    };

    if (!isOnline()) {
        const local = loadLocalHistory();
        saveLocalHistory([payload, ...local]);
        return;
    }

    const { error } = await supabase.from("workout_history").insert(payload);

    if (error) {
        const local = loadLocalHistory();
        saveLocalHistory([payload, ...local]);
    }
}

export async function fetchWorkoutHistory() {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    if (!isOnline()) {
        return loadLocalHistory();
    }

    const { data, error } = await supabase
        .from("workout_history")
        .select("*")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false });

    if (error) {
        return loadLocalHistory();
    }

    saveLocalHistory(data ?? []);
    return data ?? [];
}
