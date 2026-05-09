import { supabase } from "../lib/supabase";
import { isOnline } from "./network";
import {
    loadLocalRoutines,
    saveLocalRoutines,
    loadPendingRoutines,
    savePendingRoutines,
} from "./offlineStorage";

export async function fetchRoutines() {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    if (!isOnline()) {
        return loadLocalRoutines();
    }

    const { data, error } = await supabase
        .from("routines")
        .select("*")
        .eq("user_id", user.id)
        .order("position", { ascending: true });

    if (error) {
        console.error(error);
        return loadLocalRoutines();
    }

    const routines = data ?? [];

    saveLocalRoutines(routines);
    return routines;
}

export async function saveRoutine(routine: any, position: number) {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const payload = {
        id: routine.id,
        user_id: user.id,
        name: routine.name,
        exercises: routine.exercises,
        position,
    };

    if (!isOnline()) {
        const pending = loadPendingRoutines();

        savePendingRoutines([...pending, { type: "save", routine, position }]);

        const local = loadLocalRoutines();
        const updated = local.some((r: any) => r.id === routine.id)
            ? local.map((r: any) => (r.id === routine.id ? routine : r))
            : [...local, routine];

        saveLocalRoutines(updated);
        return;
    }

    const { error } = await supabase.from("routines").upsert(payload);

    if (error) {
        console.error(error);
        return;
    }

    const local = loadLocalRoutines();
    const updated = local.some((r: any) => r.id === routine.id)
        ? local.map((r: any) => (r.id === routine.id ? routine : r))
        : [...local, routine];

    saveLocalRoutines(updated);
}

export async function deleteRoutine(id: string) {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    if (!isOnline()) {
        const pending = loadPendingRoutines();

        savePendingRoutines([...pending, { type: "delete", id }]);

        saveLocalRoutines(loadLocalRoutines().filter((r: any) => r.id !== id));
        return;
    }

    await supabase.from("routines").delete().eq("id", id);

    saveLocalRoutines(loadLocalRoutines().filter((r: any) => r.id !== id));
}

export async function updateRoutineOrder(routines: any[]) {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    if (!isOnline()) {
        const pending = loadPendingRoutines();

        savePendingRoutines([...pending, { type: "reorder", routines }]);

        saveLocalRoutines(routines);
        return;
    }

    await Promise.all(
        routines.map((r, index) =>
            supabase
                .from("routines")
                .update({ position: index })
                .eq("id", r.id),
        ),
    );

    saveLocalRoutines(routines);
}
