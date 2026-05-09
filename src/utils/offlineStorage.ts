const safeGet = (key: string) => {
    try {
        const data = localStorage.getItem(key);
        if (!data) return [];
        return JSON.parse(data);
    } catch (err) {
        console.error(`Error parsing ${key}`, err);
        return [];
    }
};

const safeSet = (key: string, value: any[]) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {
        console.error(`Error saving ${key}`, err);
    }
};

export function saveLocalRoutines(routines: any[]) {
    safeSet("offline_routines", routines);
}

export function loadLocalRoutines() {
    return safeGet("offline_routines");
}

export function saveLocalHistory(history: any[]) {
    safeSet("offline_history", history);
}

export function loadLocalHistory() {
    return safeGet("offline_history");
}

export function savePendingRoutines(routines: any[]) {
    safeSet("pending_routines", routines);
}

export function loadPendingRoutines() {
    return safeGet("pending_routines");
}

export function savePendingHistory(history: any[]) {
    safeSet("pending_history", history);
}

export function loadPendingHistory() {
    return safeGet("pending_history");
}
