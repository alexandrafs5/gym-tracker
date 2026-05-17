const safeGet = (key: string) => {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

const safeSet = (key: string, value: any[]) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {}
};

export const saveLocalRoutines = (v: any[]) => safeSet("offline_routines", v);
export const loadLocalRoutines = () => safeGet("offline_routines");

export const normalizeHistoryEntry = (entry: any): any => {
    if (!entry) return entry;
    return {
        id:
            entry.id ??
            `local_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        routine_name: entry.routine_name ?? entry.routineName ?? "",
        completed_at: entry.completed_at ?? new Date().toISOString(),
        duration: entry.duration ?? 0,
        exercises: entry.exercises ?? [],
        user_id: entry.user_id ?? null,
        _isLocal: entry._isLocal ?? false,
    };
};

export const saveLocalHistory = (v: any[]) =>
    safeSet("offline_history", v.map(normalizeHistoryEntry));

export const loadLocalHistory = () =>
    safeGet("offline_history").map(normalizeHistoryEntry);

export const savePendingRoutines = (v: any[]) => safeSet("pending_routines", v);
export const loadPendingRoutines = () => safeGet("pending_routines");

export const savePendingHistory = (v: any[]) => safeSet("pending_history", v);
export const loadPendingHistory = () => safeGet("pending_history");
