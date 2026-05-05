import { useState } from "react";
import type { Routine, Exercise } from "../types/workout";

interface RoutineBuilderPageProps {
    onBack: () => void;
    onSaveRoutine: (routine: Routine) => void;
}

function RoutineBuilderPage({
    onBack,
    onSaveRoutine,
}: RoutineBuilderPageProps) {
    const [routineName, setRoutineName] = useState("");
    const [exerciseName, setExerciseName] = useState("");
    const [exercises, setExercises] = useState<Exercise[]>([]);

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
        setExercises(
            exercises.map((exercise) => {
                if (exercise.id !== exerciseId) return exercise;

                const newSet = {
                    setNumber: exercise.sets.length + 1,
                    weight: 0,
                    reps: 0,
                    completed: false,
                };

                return {
                    ...exercise,
                    sets: [...exercise.sets, newSet],
                };
            }),
        );
    };

    const handleUpdateSet = (
        exerciseId: string,
        setNumber: number,
        field: "weight" | "reps",
        value: number,
    ) => {
        setExercises(
            exercises.map((exercise) => {
                if (exercise.id !== exerciseId) return exercise;

                return {
                    ...exercise,
                    sets: exercise.sets.map((set) =>
                        set.setNumber === setNumber
                            ? { ...set, [field]: value }
                            : set,
                    ),
                };
            }),
        );
    };

    const handleSave = () => {
        if (!routineName.trim()) return;

        const newRoutine: Routine = {
            id: crypto.randomUUID(),
            name: routineName,
            exercises,
        };

        onSaveRoutine(newRoutine);
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col">
            <div className="sticky top-0 z-10 bg-gray-950 border-b border-gray-800 px-6 pt-6 pb-4">
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
                    type="text"
                    placeholder="Routine Name"
                    value={routineName}
                    onChange={(e) => setRoutineName(e.target.value)}
                    className="w-full bg-transparent border-b border-gray-700 pb-2 text-base text-gray-300 placeholder-gray-500 focus:outline-none focus:border-gray-500"
                />
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4 mb-8">
                    <input
                        type="text"
                        placeholder="Exercise Name"
                        value={exerciseName}
                        onChange={(e) => setExerciseName(e.target.value)}
                        className="w-full p-3 rounded-lg bg-gray-800 text-white"
                    />

                    <button
                        onClick={handleAddExercise}
                        className="bg-blue-500 px-4 py-2 rounded-lg font-semibold w-full"
                    >
                        + Add Exercise
                    </button>
                </div>

                <div className="space-y-8 pb-10">
                    {exercises.map((exercise) => (
                        <div
                            key={exercise.id}
                            className="bg-gray-800 p-4 rounded-lg"
                        >
                            <h2 className="text-xl font-semibold mb-4">
                                {exercise.name}
                            </h2>

                            <div className="grid grid-cols-3 gap-4 mb-2 font-semibold text-gray-300">
                                <span>Set</span>
                                <span>Lbs</span>
                                <span>Reps</span>
                            </div>

                            <div className="space-y-2">
                                {exercise.sets.map((set) => (
                                    <div
                                        key={set.setNumber}
                                        className="grid grid-cols-3 gap-4 items-center"
                                    >
                                        <span>{set.setNumber}</span>

                                        <input
                                            type="number"
                                            value={
                                                set.weight === 0
                                                    ? ""
                                                    : set.weight
                                            }
                                            onChange={(e) =>
                                                handleUpdateSet(
                                                    exercise.id,
                                                    set.setNumber,
                                                    "weight",
                                                    e.target.value === ""
                                                        ? 0
                                                        : Number(
                                                              e.target.value,
                                                          ),
                                                )
                                            }
                                            className="p-2 rounded bg-gray-700 text-white"
                                        />

                                        <input
                                            type="number"
                                            value={
                                                set.reps === 0 ? "" : set.reps
                                            }
                                            onChange={(e) =>
                                                handleUpdateSet(
                                                    exercise.id,
                                                    set.setNumber,
                                                    "reps",
                                                    e.target.value === ""
                                                        ? 0
                                                        : Number(
                                                              e.target.value,
                                                          ),
                                                )
                                            }
                                            className="p-2 rounded bg-gray-700 text-white"
                                        />
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => handleAddSet(exercise.id)}
                                className="mt-4 bg-gray-700 px-4 py-2 rounded-lg w-full"
                            >
                                + Add Set
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default RoutineBuilderPage;
