import { useState } from "react";
interface RoutineBuilderPageProps {
    onBack: () => void;
}
function RoutineBuilderPage({ onBack }: RoutineBuilderPageProps) {
    const [routineName, setRoutineName] = useState("");
    return (
        <div className="min-h-screen bg-gray-950 text-white p-6">
            <button onClick={onBack} className="mb-4 text-gray-400">
                ← Back
            </button>
            <h1 className="text-3xl font-bold mb-6">Create Routine</h1>
            <input
                type="text"
                placeholder="Routine Name"
                value={routineName}
                onChange={(e) => setRoutineName(e.target.value)}
                className="w-full p-3 rounded-lg bg-gray-800 text-white mb-6"
            />
            <p className="text-gray-400">
                Current Routine: {routineName || "Unnamed Routine"}
            </p>
        </div>
    );
}
export default RoutineBuilderPage;
