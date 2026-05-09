import { supabase } from "../lib/supabase";
import { isOnline } from "./network";
import {
    loadPendingRoutines,
    savePendingRoutines,
    loadLocalRoutines,
    saveLocalRoutines,
} from "./offlineStorage";

export async function syncPendingRoutines() {
    if (!isOnline()) return;

    const pending = loadPendingRoutines();
    if (!pending.length) return;

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    let local = loadLocalRoutines();

    const remainingPending = [];

    for (const action of pending) {
        try {
            if (action.type === "save") {
                const { error } = await supabase.from("routines").upsert({
                    id: action.routine.id,
                    user_id: user.id,
                    name: action.routine.name,
                    exercises: action.routine.exercises,
                    position: action.position,
                });

                if (!error) {
                    const exists = local.find(
                        (r: any) => r.id === action.routine.id,
                    );

                    if (exists) {
                        local = local.map((r: any) =>
                            r.id === action.routine.id ? action.routine : r,
                        );
                    } else {
                        local.push(action.routine);
                    }
                } else {
                    remainingPending.push(action);
                }
            }

            if (action.type === "delete") {
                const { error } = await supabase
                    .from("routines")
                    .delete()
                    .eq("id", action.id);

                if (!error) {
                    local = local.filter((r: any) => r.id !== action.id);
                } else {
                    remainingPending.push(action);
                }
            }

            if (action.type === "reorder") {
                const updates = action.routines.map((r: any, index: number) =>
                    supabase
                        .from("routines")
                        .update({ position: index })
                        .eq("id", r.id),
                );

                const results = await Promise.all(updates);

                const hasError = results.some((r) => r.error);

                if (!hasError) {
                    local = action.routines;
                } else {
                    remainingPending.push(action);
                }
            }
        } catch (err) {
            console.error("Sync error:", err);
            remainingPending.push(action);
        }
    }

    saveLocalRoutines(local);

    savePendingRoutines(remainingPending);
}
