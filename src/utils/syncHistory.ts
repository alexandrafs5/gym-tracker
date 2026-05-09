import { supabase } from "../lib/supabase";
import { isOnline } from "./network";
import {
    loadPendingHistory,
    savePendingHistory,
    loadLocalHistory,
    saveLocalHistory,
} from "./offlineStorage";

export async function syncPendingHistory() {
    if (!isOnline()) return;

    const pending = loadPendingHistory();
    if (!pending.length) return;

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    let local = loadLocalHistory();
    const remaining = [];

    for (const item of pending) {
        try {
            if (item.type === "save") {
                const { error } = await supabase
                    .from("workout_history")
                    .insert({
                        user_id: user.id,
                        routine_name: item.workout.routineName,
                        duration: item.workout.duration,
                        exercises: item.workout.exercises,
                        completed_at: new Date().toISOString(),
                    });

                if (!error) {
                    local = [item.workout, ...local];
                } else {
                    remaining.push(item);
                }
            }
        } catch {
            remaining.push(item);
        }
    }

    saveLocalHistory(local);
    savePendingHistory(remaining);
}
