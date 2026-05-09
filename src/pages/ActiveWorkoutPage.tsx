import { useEffect, useState } from "react";
import type { ActiveWorkout } from "../types/workout";
import { saveWorkoutHistory } from "../utils/supabaseHistory";
import {
    loadPendingHistory,
    savePendingHistory,
    loadLocalHistory,
    saveLocalHistory,
} from "../utils/offlineStorage";
import { isOnline } from "../utils/network";

interface Props {
    workout: ActiveWorkout;
    onExit: () => void;
}

function ActiveWorkoutPage({ workout, onExit }: Props) {
    const [time, setTime] = useState(0);
    const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
    const [showFinishConfirm, setShowFinishConfirm] = useState(false);

    const [data, setData] = useState(() => ({
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

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(Date.now() - workout.startTime);
        }, 1000);

        return () => clearInterval(interval);
    }, [workout.startTime]);

    const updateSet = (
        exId: string,
        setNumber: number,
        field: any,
        value: any,
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

        const completedWorkout = {
            routineName: data.routineName,
            startTime: data.startTime,
            exercises: completedExercises,
            duration: Math.floor((Date.now() - data.startTime) / 1000),
            completed_at: new Date().toISOString(),
        };

        if (!isOnline()) {
            const pending = loadPendingHistory();

            savePendingHistory([
                ...pending,
                {
                    type: "save",
                    workout: completedWorkout,
                },
            ]);

            const local = loadLocalHistory();
            saveLocalHistory([completedWorkout, ...local]);

            onExit();
            return;
        }

        await saveWorkoutHistory(completedWorkout);

        const local = loadLocalHistory();
        saveLocalHistory([completedWorkout, ...local]);

        onExit();
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white p-4 pb-24">
            <div className="flex justify-between mb-4">
                <button onClick={() => setShowDiscardConfirm(true)}>
                    Discard
                </button>

                <button onClick={() => setShowFinishConfirm(true)}>
                    Finish
                </button>
            </div>

            <div className="text-center text-2xl mb-6">
                {Math.floor(time / 60000)}:
                {String(Math.floor((time % 60000) / 1000)).padStart(2, "0")}
            </div>

            {data.exercises.map((ex) => (
                <div key={ex.id} className="bg-gray-800 p-4 rounded-lg mb-6">
                    <h2>{ex.name}</h2>

                    {ex.sets.map((s) => (
                        <div
                            key={s.setNumber}
                            className="grid grid-cols-4 gap-2"
                        >
                            <span>{s.setNumber}</span>

                            <input
                                value={s.actualWeight}
                                onChange={(e) =>
                                    updateSet(
                                        ex.id,
                                        s.setNumber,
                                        "actualWeight",
                                        e.target.value,
                                    )
                                }
                            />

                            <input
                                value={s.actualReps}
                                onChange={(e) =>
                                    updateSet(
                                        ex.id,
                                        s.setNumber,
                                        "actualReps",
                                        e.target.value,
                                    )
                                }
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
                            >
                                ✓
                            </button>
                        </div>
                    ))}
                </div>
            ))}

            {showFinishConfirm && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
                    <div className="bg-gray-900 p-6 rounded-xl">
                        <p>Finish workout?</p>
                        <button onClick={() => setShowFinishConfirm(false)}>
                            Cancel
                        </button>
                        <button onClick={handleFinishWorkout}>Finish</button>
                    </div>
                </div>
            )}

            {showDiscardConfirm && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center">
                    <div className="bg-gray-900 p-6 rounded-xl">
                        <p>Discard workout?</p>
                        <button onClick={() => setShowDiscardConfirm(false)}>
                            Cancel
                        </button>
                        <button onClick={onExit}>Discard</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default ActiveWorkoutPage;
