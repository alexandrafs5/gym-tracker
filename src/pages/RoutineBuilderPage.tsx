import { useEffect, useState } from "react";
import type { Routine, Exercise } from "../types/workout";

interface Props {
    onBack: () => void;
    onSaveRoutine: (routine: Routine) => void;
    existingRoutine: Routine | null;
}

function RoutineBuilderPage({ onBack, onSaveRoutine, existingRoutine }: Props) {
    const [routineName, setRoutineName] = useState("");
    const [exerciseName, setExerciseName] = useState("");
    const [exercises, setExercises] = useState<Exercise[]>([]);

    useEffect(() => {
        if (existingRoutine) {
            setRoutineName(existingRoutine.name);
            setExercises(existingRoutine.exercises);
        }
    }, [existingRoutine]);

    const handleAddExercise = () => {
        if (!exerciseName.trim()) return;

        const newExercise: Exercise = {
            id: crypto.randomUUID(),
            name: exerciseName,
            sets: [
                {
                    setNumber: 1,
                    weight: 0,
                    reps: 0,
                    completed: false,
                },
            ],
        };

        setExercises([...exercises, newExercise]);
        setExerciseName("");
    };

    const handleAddSet = (exerciseId: string) => {
        setExercises((prev) =>
            prev.map((ex) =>
                ex.id !== exerciseId
                    ? ex
                    : {
                          ...ex,
                          sets: [
                              ...ex.sets,
                              {
                                  setNumber: ex.sets.length + 1,
                                  weight: 0,
                                  reps: 0,
                                  completed: false,
                              },
                          ],
                      },
            ),
        );
    };

    const handleUpdateSet = (
        exerciseId: string,
        setNumber: number,
        field: "weight" | "reps",
        value: string,
    ) => {
        if (field === "reps") {
            if (!/^\d*$/.test(value)) return;
        }

        const parsedValue =
            value === ""
                ? 0
                : field === "weight"
                  ? parseFloat(value)
                  : parseInt(value);

        setExercises((prev) =>
            prev.map((ex) =>
                ex.id !== exerciseId
                    ? ex
                    : {
                          ...ex,
                          sets: ex.sets.map((s) =>
                              s.setNumber === setNumber
                                  ? { ...s, [field]: parsedValue }
                                  : s,
                          ),
                      },
            ),
        );
    };

    const handleSave = () => {
        const routine: Routine = {
            id: existingRoutine?.id ?? crypto.randomUUID(),
            name: routineName,
            exercises,
        };

        onSaveRoutine(routine);
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col">
            {/* TOP BAR */}
            <div className="sticky top-0 bg-gray-950 border-b border-gray-800 px-6 pt-6 pb-4">
                <div className="grid grid-cols-3 items-center mb-4">
                    <button
                        onClick={onBack}
                        className="text-gray-400 text-left"
                    >
                        ← Back
                    </button>

                    <h1 className="text-xl font-bold text-center">
                        Create Routine
                    </h1>

                    <button
                        onClick={handleSave}
                        className="text-gray-300 text-right"
                    >
                        Save
                    </button>
                </div>

                <input
                    className="w-full bg-transparent border-b border-gray-700 text-gray-300 pb-2"
                    placeholder="Routine name"
                    value={routineName}
                    onChange={(e) => setRoutineName(e.target.value)}
                />
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <input
                    className="w-full p-3 bg-gray-800 rounded-lg mb-4"
                    placeholder="Exercise name"
                    value={exerciseName}
                    onChange={(e) => setExerciseName(e.target.value)}
                />

                <button
                    onClick={handleAddExercise}
                    className="bg-blue-500 w-full py-2 rounded-lg mb-6"
                >
                    + Add Exercise
                </button>

                {exercises.map((ex) => (
                    <div
                        key={ex.id}
                        className="bg-gray-800 p-4 rounded-lg mb-6"
                    >
                        <h2 className="text-lg font-semibold mb-3">
                            {ex.name}
                        </h2>

                        <div className="grid grid-cols-3 text-gray-400 mb-2">
                            <span>Set</span>
                            <span>Lbs</span>
                            <span>Reps</span>
                        </div>

                        {ex.sets.map((s) => (
                            <div
                                key={s.setNumber}
                                className="grid grid-cols-3 gap-2 mb-2"
                            >
                                <span>{s.setNumber}</span>

                                <input
                                    value={s.weight === 0 ? "" : s.weight}
                                    onChange={(e) =>
                                        handleUpdateSet(
                                            ex.id,
                                            s.setNumber,
                                            "weight",
                                            e.target.value,
                                        )
                                    }
                                    className="bg-gray-700 p-1 rounded"
                                    inputMode="decimal"
                                />

                                <input
                                    value={s.reps === 0 ? "" : s.reps}
                                    onChange={(e) =>
                                        handleUpdateSet(
                                            ex.id,
                                            s.setNumber,
                                            "reps",
                                            e.target.value,
                                        )
                                    }
                                    className="bg-gray-700 p-1 rounded"
                                    inputMode="numeric"
                                />
                            </div>
                        ))}

                        <button
                            onClick={() => handleAddSet(ex.id)}
                            className="text-blue-400 mt-2"
                        >
                            + Add Set
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default RoutineBuilderPage;
