import { supabase } from "../lib/supabase";
import type { Routine } from "../types/workout";

export async function fetchRoutines(): Promise<Routine[]> {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return [];

    const { data, error } = await supabase
        .from("routines")
        .select("*")
        .eq("user_id", user.id)
        .order("position", { ascending: true });

    if (error) {
        console.error("Fetch routines error:", error);
        return [];
    }

    return data.map((routine) => ({
        id: routine.id,
        name: routine.name,
        exercises: routine.exercises,
    }));
}

export async function saveRoutine(routine: Routine, position?: number) {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { error } = await supabase.from("routines").upsert({
        id: routine.id,
        user_id: user.id,
        name: routine.name,
        exercises: routine.exercises,
        position: position ?? 0,
    });

    if (error) {
        console.error("Save routine error:", error);
    }
}

export async function deleteRoutine(id: string) {
    const { error } = await supabase.from("routines").delete().eq("id", id);

    if (error) {
        console.error("Delete routine error:", error);
    }
}

export async function updateRoutineOrder(routines: Routine[]) {
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const updates = routines.map((routine, index) => ({
        id: routine.id,
        user_id: user.id,
        name: routine.name,
        exercises: routine.exercises,
        position: index,
    }));

    const { error } = await supabase.from("routines").upsert(updates);

    if (error) {
        console.error("Update routine order error:", error);
    }
}
