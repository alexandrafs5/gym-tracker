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

export const saveLocalHistory = (v: any[]) => safeSet("offline_history", v);
export const loadLocalHistory = () => safeGet("offline_history");

export const savePendingRoutines = (v: any[]) => safeSet("pending_routines", v);
export const loadPendingRoutines = () => safeGet("pending_routines");

export const savePendingHistory = (v: any[]) => safeSet("pending_history", v);
export const loadPendingHistory = () => safeGet("pending_history");
