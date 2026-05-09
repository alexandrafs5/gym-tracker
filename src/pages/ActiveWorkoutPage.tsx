import { useEffect, useState } from "react";
import type { ActiveWorkout } from "../types/workout";
import { saveWorkoutHistory } from "../utils/supabaseHistory";

interface Props {
    workout: ActiveWorkout;
    onExit: () => void;
}

type SetUI = {
    setNumber: number;
    plannedWeight: number;
    plannedReps: number;
    actualWeight: string;
    actualReps: string;
    completed: boolean;
};

type ExerciseUI = {
    id: string;
    name: string;
    sets: SetUI[];
};

type WorkoutUI = {
    routineName: string;
    startTime: number;
    exercises: ExerciseUI[];
};

function ActiveWorkoutPage({ workout, onExit }: Props) {
    const [time, setTime] = useState(0);

    const [data, setData] = useState<WorkoutUI>(() => ({
        routineName: workout.routineName,
        startTime: workout.startTime,
        exercises: workout.exercises.map((ex) => ({
            id: ex.id,
            name: ex.name,
            sets: ex.sets.map((s) => ({
                setNumber: s.setNumber,
                plannedWeight: s.plannedWeight,
                plannedReps: s.plannedReps,
                actualWeight: "",
                actualReps: "",
                completed: s.completed ?? false,
            })),
        })),
    }));

    const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

    const [showFinishConfirm, setShowFinishConfirm] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(Date.now() - workout.startTime);
        }, 1000);

        return () => clearInterval(interval);
    }, [workout.startTime]);

    const format = (ms: number) => {
        const m = Math.floor(ms / 60000);
        const s = Math.floor((ms % 60000) / 1000);

        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    const updateSet = (
        exId: string,
        setNumber: number,
        field: "actualWeight" | "actualReps" | "completed",
        value: string | boolean,
    ) => {
        setData((prev) => ({
            ...prev,
            exercises: prev.exercises.map((ex) =>
                ex.id !== exId
                    ? ex
                    : {
                          ...ex,
                          sets: ex.sets.map((s) =>
                              s.setNumber !== setNumber
                                  ? s
                                  : { ...s, [field]: value },
                          ),
                      },
            ),
        }));
    };

    const handleFinishWorkout = async () => {
        const completedExercises = data.exercises
            .map((ex) => ({
                ...ex,
                sets: ex.sets
                    .filter((s) => s.completed)
                    .map((s) => ({
                        setNumber: s.setNumber,
                        plannedWeight: s.plannedWeight,
                        plannedReps: s.plannedReps,
                        actualWeight: Number(s.actualWeight || s.plannedWeight),
                        actualReps: Number(s.actualReps || s.plannedReps),
                        completed: true,
                    })),
            }))
            .filter((ex) => ex.sets.length > 0);

        if (completedExercises.length === 0) {
            onExit();
            return;
        }

        const completedWorkout = {
            routineName: data.routineName,
            startTime: data.startTime,
            exercises: completedExercises,
        };

        await saveWorkoutHistory(completedWorkout);

        onExit();
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white p-4 pb-24">
            <div className="flex justify-between items-center mb-4">
                <button
                    onClick={() => setShowDiscardConfirm(true)}
                    className="text-gray-400"
                >
                    Discard
                </button>

                <button
                    onClick={() => setShowFinishConfirm(true)}
                    className="text-green-400"
                >
                    Finish
                </button>
            </div>

            <div className="text-center text-2xl mb-6">{format(time)}</div>

            {data.exercises.map((ex) => (
                <div key={ex.id} className="bg-gray-800 p-4 rounded-lg mb-6">
                    <h2 className="font-semibold mb-3">{ex.name}</h2>

                    <div className="grid grid-cols-4 text-gray-400 mb-3 text-sm">
                        <span>Set</span>
                        <span>Weight</span>
                        <span>Reps</span>
                        <span className="text-center">Done</span>
                    </div>

                    {ex.sets.map((s) => (
                        <div
                            key={s.setNumber}
                            className="grid grid-cols-4 gap-2 items-center mb-3"
                        >
                            <span className="text-gray-300">{s.setNumber}</span>

                            <input
                                placeholder={`${s.plannedWeight}`}
                                value={s.actualWeight}
                                onChange={(e) => {
                                    const value = e.target.value;

                                    if (!/^\d*\.?\d*$/.test(value)) return;

                                    updateSet(
                                        ex.id,
                                        s.setNumber,
                                        "actualWeight",
                                        value,
                                    );
                                }}
                                inputMode="decimal"
                                className="bg-gray-700 p-2 rounded text-white placeholder-gray-400"
                            />

                            <input
                                placeholder={`${s.plannedReps}`}
                                value={s.actualReps}
                                onChange={(e) => {
                                    const value = e.target.value;

                                    if (!/^\d*$/.test(value)) return;

                                    updateSet(
                                        ex.id,
                                        s.setNumber,
                                        "actualReps",
                                        value,
                                    );
                                }}
                                inputMode="numeric"
                                className="bg-gray-700 p-2 rounded text-white placeholder-gray-400"
                            />

                            <button
                                onClick={() =>
                                    updateSet(
                                        ex.id,
                                        s.setNumber,
                                        "completed",
                                        !s.completed,
                                    )
                                }
                                className={`w-6 h-6 mx-auto rounded-full border transition ${
                                    s.completed
                                        ? "bg-green-500 border-green-500"
                                        : "border-gray-500"
                                }`}
                            />
                        </div>
                    ))}
                </div>
            ))}

            {showDiscardConfirm && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-gray-900 p-6 rounded-xl w-[300px] text-center border border-gray-700">
                        <h2 className="text-lg font-semibold mb-2">
                            Discard workout?
                        </h2>

                        <p className="text-gray-400 text-sm mb-6">
                            This workout will not be saved.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDiscardConfirm(false)}
                                className="flex-1 bg-gray-700 py-2 rounded-lg"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={onExit}
                                className="flex-1 bg-red-500 text-black py-2 rounded-lg font-semibold"
                            >
                                Discard
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showFinishConfirm && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-gray-900 p-6 rounded-xl w-[300px] text-center border border-gray-700">
                        <h2 className="text-lg font-semibold mb-2">
                            Finish workout?
                        </h2>

                        <p className="text-gray-400 text-sm mb-6">
                            Only completed sets will be saved.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowFinishConfirm(false)}
                                className="flex-1 bg-gray-700 py-2 rounded-lg"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleFinishWorkout}
                                className="flex-1 bg-green-500 text-black py-2 rounded-lg font-semibold"
                            >
                                Finish
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ActiveWorkoutPage;
