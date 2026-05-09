import { useEffect, useState } from "react";
import type { Routine } from "../types/workout";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface Props {
    onBack: () => void;
    onSaveRoutine: (routine: Routine) => void;
    existingRoutine: Routine | null;
}

type SetUI = {
    setNumber: number;
    weight: string;
    reps: string;
    completed: boolean;
};

type ExerciseUI = {
    id: string;
    name: string;
    sets: SetUI[];
};

function SortableExercise({
    ex,
    children,
}: {
    ex: ExerciseUI;
    children: React.ReactNode;
}) {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: ex.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style}>
            <div
                {...attributes}
                {...listeners}
                className="mb-2 text-gray-500 cursor-grab active:cursor-grabbing"
            >
                ☰ Hold to reorder
            </div>

            {children}
        </div>
    );
}

function RoutineBuilderPage({ onBack, onSaveRoutine, existingRoutine }: Props) {
    const [routineName, setRoutineName] = useState("");
    const [exerciseName, setExerciseName] = useState("");
    const [exercises, setExercises] = useState<ExerciseUI[]>([]);

    useEffect(() => {
        if (existingRoutine) {
            setRoutineName(existingRoutine.name);

            setExercises(
                existingRoutine.exercises.map((ex) => ({
                    id: ex.id,
                    name: ex.name,
                    sets: ex.sets.map((s) => ({
                        setNumber: s.setNumber,
                        weight: String(s.weight ?? ""),
                        reps: String(s.reps ?? ""),
                        completed: s.completed,
                    })),
                })),
            );
        }
    }, [existingRoutine]);

    const handleAddExercise = () => {
        if (!exerciseName.trim()) return;

        const newExercise: ExerciseUI = {
            id: crypto.randomUUID(),
            name: exerciseName,
            sets: [
                {
                    setNumber: 1,
                    weight: "",
                    reps: "",
                    completed: false,
                },
            ],
        };

        setExercises((prev) => [...prev, newExercise]);
        setExerciseName("");
    };

    const handleUpdateExerciseName = (exerciseId: string, newName: string) => {
        setExercises((prev) =>
            prev.map((ex) =>
                ex.id === exerciseId ? { ...ex, name: newName } : ex,
            ),
        );
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
                                  weight: "",
                                  reps: "",
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
        if (field === "reps" && !/^\d*$/.test(value)) return;

        if (field === "weight" && !/^\d*\.?\d*$/.test(value)) return;

        setExercises((prev) =>
            prev.map((ex) =>
                ex.id !== exerciseId
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
        );
    };

    const handleSave = () => {
        const routine: Routine = {
            id: existingRoutine?.id ?? crypto.randomUUID(),
            name: routineName,
            exercises: exercises.map((ex) => ({
                id: ex.id,
                name: ex.name,
                sets: ex.sets.map((s) => ({
                    setNumber: s.setNumber,
                    weight: Number(s.weight || 0),
                    reps: Number(s.reps || 0),
                    completed: s.completed,
                })),
            })),
        };

        onSaveRoutine(routine);
    };

    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        setExercises((items) => {
            const oldIndex = items.findIndex((item) => item.id === active.id);

            const newIndex = items.findIndex((item) => item.id === over.id);

            return arrayMove(items, oldIndex, newIndex);
        });
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col">
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

                <DndContext
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={exercises.map((ex) => ex.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        {exercises.map((ex) => (
                            <SortableExercise key={ex.id} ex={ex}>
                                <div className="bg-gray-800 p-4 rounded-lg mb-6">
                                    <input
                                        value={ex.name}
                                        onChange={(e) =>
                                            handleUpdateExerciseName(
                                                ex.id,
                                                e.target.value,
                                            )
                                        }
                                        className="w-full bg-transparent border-b border-gray-600 text-lg font-semibold mb-3 pb-1"
                                        placeholder="Exercise name"
                                    />

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
                                                className="bg-gray-700 p-1 rounded"
                                                value={s.weight}
                                                onChange={(e) =>
                                                    handleUpdateSet(
                                                        ex.id,
                                                        s.setNumber,
                                                        "weight",
                                                        e.target.value,
                                                    )
                                                }
                                                inputMode="decimal"
                                            />

                                            <input
                                                className="bg-gray-700 p-1 rounded"
                                                value={s.reps}
                                                onChange={(e) =>
                                                    handleUpdateSet(
                                                        ex.id,
                                                        s.setNumber,
                                                        "reps",
                                                        e.target.value,
                                                    )
                                                }
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
                            </SortableExercise>
                        ))}
                    </SortableContext>
                </DndContext>
            </div>
        </div>
    );
}

export default RoutineBuilderPage;
