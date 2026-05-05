import { useState } from "react";
import type { Routine } from "../types/workout";

interface RoutineBuilderPageProps {
    onBack: () => void;
    onSaveRoutine: (routine: Routine) => void;
}

function RoutineBuilderPage({
    onBack,
    onSaveRoutine,
}: RoutineBuilderPageProps) {
    const [routineName, setRoutineName] = useState("");

    const handleSave = () => {
        if (!routineName.trim()) return;

        const newRoutine: Routine = {
            id: crypto.randomUUID(),
            name: routineName,
            exercises: [],
        };

        onSaveRoutine(newRoutine);
    };

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

            <button
                onClick={handleSave}
                className="bg-white text-black px-4 py-2 rounded-lg font-semibold"
            >
                Save Routine
            </button>
        </div>
    );
}

export default RoutineBuilderPage;
