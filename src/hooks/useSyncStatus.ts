import { useEffect, useState } from "react";
import { isOnline } from "../utils/network";
import {
    loadPendingRoutines,
    loadPendingHistory,
} from "../utils/offlineStorage";

type SyncStatus = "online" | "offline" | "syncing" | "pending";

export function useSyncStatus() {
    const [status, setStatus] = useState<SyncStatus>(
        isOnline() ? "online" : "offline",
    );

    const updateStatus = () => {
        if (!isOnline()) {
            setStatus("offline");
            return;
        }

        const pendingRoutines = loadPendingRoutines();
        const pendingHistory = loadPendingHistory();

        if (pendingRoutines.length || pendingHistory.length) {
            setStatus("pending");
        } else {
            setStatus("online");
        }
    };

    useEffect(() => {
        updateStatus();

        const onOnline = () => updateStatus();
        const onOffline = () => setStatus("offline");

        window.addEventListener("online", onOnline);
        window.addEventListener("offline", onOffline);

        return () => {
            window.removeEventListener("online", onOnline);
            window.removeEventListener("offline", onOffline);
        };
    }, []);

    return status;
}
