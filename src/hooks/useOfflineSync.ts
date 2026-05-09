import { useEffect } from "react";
import { isOnline } from "../utils/network";
import { syncPendingRoutines } from "../utils/syncRoutines";
import { syncPendingHistory } from "../utils/syncHistory";

export function useOfflineSync() {
    useEffect(() => {
        const sync = async () => {
            if (!isOnline()) return;

            await syncPendingRoutines();
            await syncPendingHistory();
        };

        sync();

        window.addEventListener("online", sync);

        return () => {
            window.removeEventListener("online", sync);
        };
    }, []);
}
