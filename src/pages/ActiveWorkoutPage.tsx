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
                completed: false,
            })),
        })),
    }));

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(Date.now() - workout.startTime);
        }, 1000);

        return () => clearInterval(interval);
    }, [workout.startTime]);

    useEffect(() => {
        if (showDiscardConfirm || showFinishConfirm) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }
    }, [showDiscardConfirm, showFinishConfirm]);

    const updateSet = (
        exId: string,
        setNumber: number,
        field: "actualWeight" | "actualReps" | "completed",
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
                { type: "save", workout: completedWorkout },
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
            {/* HEADER */}
            <div className="flex justify-between mb-4">
                <button
                    onClick={() => setShowDiscardConfirm(true)}
                    className="text-red-400"
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

            {/* TIMER */}
            <div className="text-center text-2xl mb-6 font-mono">
                {Math.floor(time / 60000)}:
                {String(Math.floor((time % 60000) / 1000)).padStart(2, "0")}
            </div>

            {/* EXERCISES */}
            {data.exercises.map((ex) => (
                <div key={ex.id} className="bg-gray-800 p-4 rounded-xl mb-6">
                    <h2 className="mb-3 font-semibold">{ex.name}</h2>

                    {/* HEADER */}
                    <div className="grid grid-cols-4 text-xs text-gray-400 mb-2">
                        <div className="text-center">Set</div>
                        <div className="text-center">Lbs</div>
                        <div className="text-center">Reps</div>
                        <div className="text-center">Done</div>
                    </div>

                    {ex.sets.map((s) => (
                        <div
                            key={`${ex.id}-${s.setNumber}`}
                            className="grid grid-cols-4 items-center gap-2 mb-2"
                        >
                            {/* SET */}
                            <span className="text-gray-300 text-center">
                                {s.setNumber}
                            </span>

                            {/* LBS */}
                            <input
                                className="bg-gray-700 p-1 rounded text-center w-full"
                                placeholder={`${s.plannedWeight}`}
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

                            {/* REPS */}
                            <input
                                className="bg-gray-700 p-1 rounded text-center w-full"
                                placeholder={`${s.plannedReps}`}
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

                            {/* DONE */}
                            <div className="flex justify-center">
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
                                    <div
                                        className={`w-5 h-5 rounded-full border-2 transition-all duration-200
                ${
                    s.completed
                        ? "bg-green-500 border-green-500"
                        : "border-gray-500"
                }`}
                                    />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ))}

            {/* FINISH MODAL */}
            {showFinishConfirm && (
                <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
                    <div className="bg-gray-900 p-6 rounded-2xl w-[300px] text-center border border-gray-700">
                        <h2 className="text-lg font-semibold mb-2">
                            Finish workout?
                        </h2>

                        <p className="text-gray-400 text-sm mb-6">
                            Save this workout to your history.
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

            {/* DISCARD MODAL */}
            {showDiscardConfirm && (
                <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
                    <div className="bg-gray-900 p-6 rounded-2xl w-[300px] text-center border border-gray-700">
                        <h2 className="text-lg font-semibold mb-2">
                            Discard workout?
                        </h2>

                        <p className="text-gray-400 text-sm mb-6">
                            You will lose all progress.
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
        </div>
    );
}

export default ActiveWorkoutPage;
