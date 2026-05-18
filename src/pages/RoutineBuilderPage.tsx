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
import ExerciseCatalogModal from "../components/ExerciseCatalogModal";
import type { CatalogExercise } from "../data/exerciseCatalog";

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
    imageUrl?: string;
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
    const [exercises, setExercises] = useState<ExerciseUI[]>([]);
    const [showCatalog, setShowCatalog] = useState(false);

    useEffect(() => {
        if (existingRoutine) {
            setRoutineName(existingRoutine.name);
            setExercises(
                existingRoutine.exercises.map((ex) => ({
                    id: ex.id,
                    name: ex.name,
                    imageUrl: ex.imageUrl,
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

    const handleSelectFromCatalog = (catalogEx: CatalogExercise) => {
        const newExercise: ExerciseUI = {
            id: crypto.randomUUID(),
            name: catalogEx.name,
            imageUrl: catalogEx.imageUrl,
            sets: [{ setNumber: 1, weight: "", reps: "", completed: false }],
        };
        setExercises((prev) => [...prev, newExercise]);
        setShowCatalog(false);
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

    const handleRemoveExercise = (exerciseId: string) => {
        setExercises((prev) => prev.filter((ex) => ex.id !== exerciseId));
    };

    const handleSave = () => {
        const routine: Routine = {
            id: existingRoutine?.id ?? crypto.randomUUID(),
            name: routineName,
            exercises: exercises.map((ex) => ({
                id: ex.id,
                name: ex.name,
                imageUrl: ex.imageUrl,
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
        <>
            {showCatalog && (
                <ExerciseCatalogModal
                    onSelect={handleSelectFromCatalog}
                    onClose={() => setShowCatalog(false)}
                />
            )}

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
                            {existingRoutine
                                ? "Edit Routine"
                                : "Create Routine"}
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
                    <button
                        onClick={() => setShowCatalog(true)}
                        className="bg-blue-500 w-full py-3 rounded-xl mb-6 font-semibold text-white"
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
                                    <div className="bg-gray-800 p-4 rounded-xl mb-6">
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
                                            <input
                                                value={ex.name}
                                                onChange={(e) =>
                                                    handleUpdateExerciseName(
                                                        ex.id,
                                                        e.target.value,
                                                    )
                                                }
                                                className="flex-1 bg-transparent border-b border-gray-600 text-base font-semibold pb-1"
                                                placeholder="Exercise name"
                                            />
                                            <button
                                                onClick={() =>
                                                    handleRemoveExercise(ex.id)
                                                }
                                                className="text-gray-500 text-lg ml-1"
                                            >
                                                ✕
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-3 text-gray-400 text-sm mb-2">
                                            <span>Set</span>
                                            <span>Lbs</span>
                                            <span>Reps</span>
                                        </div>

                                        {ex.sets.map((s) => (
                                            <div
                                                key={s.setNumber}
                                                className="grid grid-cols-3 gap-2 mb-2"
                                            >
                                                <span className="flex items-center text-gray-300">
                                                    {s.setNumber}
                                                </span>
                                                <input
                                                    className="bg-gray-700 p-1.5 rounded-lg text-center"
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
                                                    placeholder="0"
                                                />
                                                <input
                                                    className="bg-gray-700 p-1.5 rounded-lg text-center"
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
                                                    placeholder="0"
                                                />
                                            </div>
                                        ))}

                                        <button
                                            onClick={() => handleAddSet(ex.id)}
                                            className="text-blue-400 mt-2 text-sm"
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
        </>
    );
}

export default RoutineBuilderPage;
