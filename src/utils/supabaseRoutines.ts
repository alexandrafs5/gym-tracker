import { supabase } from "../lib/supabase";
import { isOnline } from "./network";
import {
    saveLocalRoutines,
    loadLocalRoutines,
    savePendingRoutines,
    loadPendingRoutines,
} from "./offlineStorage";

export async function fetchRoutines() {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    let local = loadLocalRoutines();

    if (isOnline()) {
        const { data, error } = await supabase
            .from("routines")
            .select("*")
            .eq("user_id", user.id)
            .order("position", { ascending: true });

        if (error) {
            console.error(error);
            return applyPendingOrder(local);
        }

        const routines = data.map((r) => ({
            id: r.id,
            name: r.name,
            exercises: r.exercises,
        }));

        saveLocalRoutines(routines);

        return applyPendingOrder(routines ?? []);
    }

    return applyPendingOrder(local ?? []);
}

export async function saveRoutine(routine: any, position: number) {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    if (!isOnline()) {
        const pending = loadPendingRoutines();

        pending.push({
            type: "save",
            routine,
            position,
        });

        savePendingRoutines(pending);

        const local = loadLocalRoutines();

        const exists = local.find((r: any) => r.id === routine.id);

        const updated = exists
            ? local.map((r: any) => (r.id === routine.id ? routine : r))
            : [...local, routine];

        saveLocalRoutines(updated);

        return;
    }

    const { error } = await supabase.from("routines").upsert({
        id: routine.id,
        user_id: user.id,
        name: routine.name,
        exercises: routine.exercises,
        position,
    });

    if (error) {
        console.error("Save routine error:", error);
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

        pending.push({
            type: "delete",
            id,
        });

        savePendingRoutines(pending);

        const local = loadLocalRoutines().filter((r: any) => r.id !== id);

        saveLocalRoutines(local);

        return;
    }

    const { error } = await supabase.from("routines").delete().eq("id", id);

    if (error) {
        console.error("Delete routine error:", error);
        return;
    }

    const local = loadLocalRoutines().filter((r: any) => r.id !== id);

    saveLocalRoutines(local);
}

export async function updateRoutineOrder(routines: any[]) {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    if (!isOnline()) {
        const pending = loadPendingRoutines();

        pending.push({
            type: "reorder",
            ids: routines.map((r) => r.id),
        });

        savePendingRoutines(pending);

        saveLocalRoutines(routines);

        return;
    }

    const updates = routines.map((r, index) =>
        supabase.from("routines").update({ position: index }).eq("id", r.id),
    );

    await Promise.all(updates);

    saveLocalRoutines(routines);
}

function applyPendingOrder(local: any[]) {
    const pending = loadPendingRoutines();

    const reorder = pending.filter((p: any) => p.type === "reorder").at(-1);

    if (!reorder) return local;

    const map = new Map(local.map((r) => [r.id, r]));

    return reorder.ids.map((id: string) => map.get(id)).filter(Boolean);
}
