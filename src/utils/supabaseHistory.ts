import { supabase } from "../lib/supabase";
import { isOnline } from "./network";
import {
    loadLocalHistory,
    saveLocalHistory,
    savePendingHistory,
    loadPendingHistory,
    normalizeHistoryEntry,
} from "./offlineStorage";

export async function saveWorkoutHistory(workout: any) {
    const {
        data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;

    if (!user) return;

    const normalized = normalizeHistoryEntry({
        ...workout,
        user_id: user.id,
        _isLocal: true,
    });

    if (!isOnline()) {
        const local = loadLocalHistory();
        saveLocalHistory([normalized, ...local]);

        const pending = loadPendingHistory();
        savePendingHistory([...pending, { type: "save", workout: normalized }]);
        return;
    }

    const { data, error } = await supabase
        .from("workout_history")
        .insert({
            user_id: user.id,
            routine_name: normalized.routine_name,
            completed_at: normalized.completed_at,
            duration: normalized.duration,
            exercises: normalized.exercises,
        })
        .select()
        .single();

    if (error) {
        const local = loadLocalHistory();
        saveLocalHistory([normalized, ...local]);

        const pending = loadPendingHistory();
        savePendingHistory([...pending, { type: "save", workout: normalized }]);
    } else if (data) {
        const local = loadLocalHistory();
        saveLocalHistory([data, ...local]);
    }
}

export async function fetchWorkoutHistory() {
    const {
        data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;

    if (!user) return loadLocalHistory();

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

    const serverData = data ?? [];
    const localData = loadLocalHistory();
    const localOnlyEntries = localData.filter((h: any) => h._isLocal === true);

    const merged = [...serverData, ...localOnlyEntries];
    saveLocalHistory(merged);

    return merged;
}
