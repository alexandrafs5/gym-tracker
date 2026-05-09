import type { Routine } from "../types/workout";
import { supabase } from "../lib/supabase";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
    SortableContext,
    verticalListSortingStrategy,
    useSortable,
    arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface HomePageProps {
    onCreateRoutine: () => void;
    onEditRoutine: (routine: Routine) => void;
    onStartWorkout: (routine: Routine) => void;
    onDeleteRoutine: (id: string) => void;
    onReorderRoutines: (routines: Routine[]) => void;
    routines: Routine[];
}

function SortableRoutine({
    routine,
    children,
}: {
    routine: Routine;
    children: React.ReactNode;
}) {
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: routine.id });

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

function HomePage({
    onCreateRoutine,
    onEditRoutine,
    onStartWorkout,
    onDeleteRoutine,
    onReorderRoutines,
    routines,
}: HomePageProps) {
    const handleDragEnd = (event: any) => {
        const { active, over } = event;

        if (!over || active.id === over.id) return;

        const oldIndex = routines.findIndex(
            (routine) => routine.id === active.id,
        );

        const newIndex = routines.findIndex(
            (routine) => routine.id === over.id,
        );

        const reordered = arrayMove(routines, oldIndex, newIndex);

        onReorderRoutines(reordered);
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center px-6 py-10">
            <button
                onClick={() => supabase.auth.signOut()}
                className="absolute top-4 left-4 text-gray-400"
            >
                Logout
            </button>

            <button
                onClick={onCreateRoutine}
                className="bg-white text-black px-6 py-3 rounded-lg font-semibold mb-8"
            >
                + New Routine
            </button>

            <h1 className="text-3xl font-bold mb-8">My Routines</h1>

            <div className="w-full max-w-md">
                <DndContext
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={routines.map((routine) => routine.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-4">
                            {routines.map((routine) => (
                                <SortableRoutine
                                    key={routine.id}
                                    routine={routine}
                                >
                                    <div className="bg-gray-800 p-4 rounded-lg relative">
                                        <button
                                            onClick={() =>
                                                onDeleteRoutine(routine.id)
                                            }
                                            className="absolute top-2 right-2 text-red-400"
                                        >
                                            🗙
                                        </button>

                                        <button
                                            onClick={() =>
                                                onEditRoutine(routine)
                                            }
                                            className="text-left w-full"
                                        >
                                            <h2 className="text-xl font-semibold">
                                                {routine.name}
                                            </h2>
                                        </button>

                                        <button
                                            onClick={() =>
                                                onStartWorkout(routine)
                                            }
                                            className="mt-3 bg-green-500 text-black px-3 py-1 rounded-lg text-sm w-full"
                                        >
                                            Start Workout
                                        </button>
                                    </div>
                                </SortableRoutine>
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>
            </div>
        </div>
    );
}

export default HomePage;
