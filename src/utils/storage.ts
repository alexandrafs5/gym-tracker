import type { Routine } from "../types/workout";

const KEY = "gym-tracker-routines";

export const saveRoutines = (routines: Routine[]) => {
    localStorage.setItem(KEY, JSON.stringify(routines));
};

export const loadRoutines = (): Routine[] => {
    const data = localStorage.getItem(KEY);
    return data ? JSON.parse(data) : [];
}