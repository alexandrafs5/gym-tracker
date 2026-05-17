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
        data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;

    if (!user) return;

    let local = loadLocalHistory();
    const remaining: any[] = [];

    for (const item of pending) {
        try {
            if (item.type === "save") {
                const workout = item.workout;
                const { data, error } = await supabase
                    .from("workout_history")
                    .insert({
                        user_id: user.id,
                        routine_name:
                            workout.routine_name ?? workout.routineName,
                        duration: workout.duration,
                        exercises: workout.exercises,
                        completed_at:
                            workout.completed_at ?? new Date().toISOString(),
                    })
                    .select()
                    .single();

                if (!error && data) {
                    local = local.filter(
                        (h: any) => h.id !== workout.id && h._isLocal !== true,
                    );
                    local = [data, ...local];
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
