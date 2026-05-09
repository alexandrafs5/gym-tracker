export function isOnline() {
    return navigator.onLine;
}

export function listenNetworkChanges(
    onOnline: () => void,
    onOffline: () => void,
) {
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
        window.removeEventListener("online", onOnline);
        window.removeEventListener("offline", onOffline);
    };
}
