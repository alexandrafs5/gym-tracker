import { useEffect, useState } from "react";
import type { ActiveWorkout } from "../types/workout";
import { saveWorkoutHistory } from "../utils/supabaseHistory";

interface Props {
    workout: ActiveWorkout;
    onExit: () => void;
}

function ActiveWorkoutPage({ workout, onExit }: Props) {
    const [time, setTime] = useState(0);
    const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
    const [showFinishConfirm, setShowFinishConfirm] = useState(false);
    const [saving, setSaving] = useState(false);

    const [data, setData] = useState(() => ({
        routineName: workout.routineName,
        startTime: workout.startTime,
        exercises: workout.exercises.map((ex) => ({
            id: ex.id,
            name: ex.name,
            imageUrl: ex.imageUrl,
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
        setSaving(true);
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
            routine_name: data.routineName,
            startTime: data.startTime,
            exercises: completedExercises,
            duration: Math.floor((Date.now() - data.startTime) / 1000),
            completed_at: new Date().toISOString(),
        };

        await saveWorkoutHistory(completedWorkout);
        setSaving(false);
        onExit();
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white p-4 pb-24">
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

            <div className="text-center text-2xl mb-6 font-mono">
                {Math.floor(time / 60000)}:
                {String(Math.floor((time % 60000) / 1000)).padStart(2, "0")}
            </div>

            {data.exercises.map((ex) => (
                <div key={ex.id} className="bg-gray-800 p-4 rounded-xl mb-6">
                    {/* Exercise header with round image */}
                    <div className="flex items-center gap-3 mb-3">
                        {ex.imageUrl && (
                            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-gray-700 border border-gray-600">
                                <img
                                    src={ex.imageUrl}
                                    alt={ex.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <h2 className="font-semibold text-base">{ex.name}</h2>
                    </div>

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
                            <span className="text-gray-300 text-center">
                                {s.setNumber}
                            </span>
                            <input
                                className="bg-gray-700 p-1.5 rounded-lg text-center w-full text-sm"
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
                            <input
                                className="bg-gray-700 p-1.5 rounded-lg text-center w-full text-sm"
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
                                        className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
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
                                disabled={saving}
                                className="flex-1 bg-gray-700 py-2 rounded-lg"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleFinishWorkout}
                                disabled={saving}
                                className="flex-1 bg-green-500 text-black py-2 rounded-lg font-semibold disabled:opacity-60"
                            >
                                {saving ? "Saving..." : "Finish"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
