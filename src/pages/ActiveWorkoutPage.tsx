import { useEffect, useState } from "react";
import type { ActiveWorkout } from "../types/workout";

interface Props {
    workout: ActiveWorkout;
    onExit: () => void;
}

function ActiveWorkoutPage({ workout, onExit }: Props) {
    const [time, setTime] = useState(0);
    const [data, setData] = useState(workout);

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(Date.now() - workout.startTime);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const format = (ms: number) => {
        const m = Math.floor(ms / 60000);
        const s = Math.floor((ms % 60000) / 1000);
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

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
                              s.setNumber === setNumber
                                  ? { ...s, [field]: value }
                                  : s,
                          ),
                      },
            ),
        }));
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white p-4">
            {/* TOP BAR */}
            <div className="flex justify-between items-center mb-4">
                <button onClick={onExit} className="text-gray-400">
                    Discard
                </button>

                <div className="font-bold">{workout.routineName}</div>

                <button onClick={onExit} className="text-green-400">
                    Finish
                </button>
            </div>

            {/* TIMER */}
            <div className="text-center text-2xl mb-6">{format(time)}</div>

            {/* EXERCISES */}
            {data.exercises.map((ex) => (
                <div key={ex.id} className="bg-gray-800 p-4 rounded-lg mb-6">
                    <h2 className="font-semibold mb-3">{ex.name}</h2>

                    {/* HEADER (ALINEADO PERFECTO) */}
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
                            {/* SET */}
                            <span className="text-gray-300">{s.setNumber}</span>

                            {/* WEIGHT */}
                            <input
                                type="number"
                                placeholder={`${s.plannedWeight}`}
                                value={
                                    s.actualWeight === 0 ? "" : s.actualWeight
                                }
                                onChange={(e) =>
                                    updateSet(
                                        ex.id,
                                        s.setNumber,
                                        "actualWeight",
                                        e.target.value === ""
                                            ? 0
                                            : Number(e.target.value),
                                    )
                                }
                                className="bg-gray-700 p-2 rounded text-white placeholder-gray-400"
                            />

                            {/* REPS */}
                            <input
                                type="number"
                                placeholder={`${s.plannedReps}`}
                                value={s.actualReps === 0 ? "" : s.actualReps}
                                onChange={(e) =>
                                    updateSet(
                                        ex.id,
                                        s.setNumber,
                                        "actualReps",
                                        e.target.value === ""
                                            ? 0
                                            : Number(e.target.value),
                                    )
                                }
                                className="bg-gray-700 p-2 rounded text-white placeholder-gray-400"
                            />

                            {/* CUSTOM CHECKBOX (BONITO) */}
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
        </div>
    );
}

export default ActiveWorkoutPage;
