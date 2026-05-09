interface BottomNavProps {
    currentView: "home" | "profile";
    onGoHome: () => void;
    onGoProfile: () => void;
}
function BottomNav({ currentView, onGoHome, onGoProfile }: BottomNavProps) {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 flex justify-around py-4">
            <button
                onClick={onGoHome}
                className={
                    currentView === "home"
                        ? "text-white font-semibold"
                        : "text-gray-500"
                }
            >
                Home
            </button>
            <button
                onClick={onGoProfile}
                className={
                    currentView === "profile"
                        ? "text-white font-semibold"
                        : "text-gray-500"
                }
            >
                Profile
            </button>
        </div>
    );
}
export default BottomNav;
