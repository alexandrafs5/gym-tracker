import { useEffect, useCallback } from "react";
import { isOnline } from "../utils/network";
import { syncPendingRoutines } from "../utils/syncRoutines";
import { syncPendingHistory } from "../utils/syncHistory";

export const SYNC_COMPLETE_EVENT = "gym-tracker:sync-complete";

export function useOfflineSync() {
    const sync = useCallback(async () => {
        if (!isOnline()) return;

        try {
            await syncPendingRoutines();
            await syncPendingHistory();
        } catch (err) {
            console.error("Background sync failed:", err);
        } finally {
            window.dispatchEvent(new CustomEvent(SYNC_COMPLETE_EVENT));
        }
    }, []);

    useEffect(() => {
        sync();

        window.addEventListener("online", sync);

        return () => {
            window.removeEventListener("online", sync);
        };
    }, [sync]);
}
