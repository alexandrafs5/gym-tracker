import { useSyncStatus } from "../hooks/useSyncStatus.ts";

function SyncStatusIndicator() {
    const status = useSyncStatus();

    const config = {
        online: {
            text: "Synced",
            color: "text-green-400",
        },
        offline: {
            text: "Offline",
            color: "text-gray-400",
        },
        pending: {
            text: "Pending sync",
            color: "text-yellow-400",
        },
        syncing: {
            text: "Syncing...",
            color: "text-blue-400",
        },
    };

    return (
        <div className={`text-xs ${config[status].color}`}>
            {config[status].text}
        </div>
    );
}

export default SyncStatusIndicator;