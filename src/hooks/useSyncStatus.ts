import { useEffect, useState, useCallback } from "react";
import { isOnline } from "../utils/network";
import {
    loadPendingRoutines,
    loadPendingHistory,
} from "../utils/offlineStorage";
import { SYNC_COMPLETE_EVENT } from "./useOfflineSync";

type SyncStatus = "online" | "offline" | "syncing" | "pending";

export function useSyncStatus() {
    const [status, setStatus] = useState<SyncStatus>(
        isOnline() ? "online" : "offline",
    );

    const updateStatus = useCallback(() => {
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
    }, []);

    useEffect(() => {
        updateStatus();

        const onOnline = () => {
            setStatus("syncing");
        };
        const onOffline = () => setStatus("offline");
        const onSyncComplete = () => updateStatus();

        window.addEventListener("online", onOnline);
        window.addEventListener("offline", onOffline);
        window.addEventListener(SYNC_COMPLETE_EVENT, onSyncComplete);

        return () => {
            window.removeEventListener("online", onOnline);
            window.removeEventListener("offline", onOffline);
            window.removeEventListener(SYNC_COMPLETE_EVENT, onSyncComplete);
        };
    }, [updateStatus]);

    return status;
}
