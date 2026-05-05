import { useEffect, useState } from "react";
import HomePage from "./pages/HomePage";
import RoutineBuilderPage from "./pages/RoutineBuilderPage";
import ActiveWorkoutPage from "./pages/ActiveWorkoutPage";
import type { Routine, ActiveWorkout } from "./types/workout";
import { loadRoutines, saveRoutines } from "./utils/storage";

type View = "home" | "builder" | "workout";

function App() {
    const [view, setView] = useState<View>("home");
    const [routines, setRoutines] = useState<Routine[]>(() => loadRoutines());

    const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
    const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(
        null,
    );

    const [routineToDelete, setRoutineToDelete] = useState<string | null>(null);

    useEffect(() => {
        saveRoutines(routines);
    }, [routines]);
    useEffect(() => {
        const splash = document.getElementById("splash-screen");
        if (splash) {
            setTimeout(() => {
                splash.style.opacity = "0";
                splash.style.transition = "0.4s ease";

                setTimeout(() => {
                    splash.remove();
                }, 400);
            }, 600);
        }
    }, []);

    const handleCreate = () => {
        setEditingRoutine(null);
        setView("builder");
    };

    const handleEdit = (routine: Routine) => {
        setEditingRoutine(routine);
        setView("builder");
    };

    const handleSaveRoutine = (routine: Routine) => {
        setRoutines((prev) => {
            const exists = prev.find((r) => r.id === routine.id);

            if (exists) {
                return prev.map((r) => (r.id === routine.id ? routine : r));
            }

            return [...prev, routine];
        });

        setView("home");
        setEditingRoutine(null);
    };

    const handleDeleteRoutine = (id: string) => {
        setRoutineToDelete(id);
    };

    const confirmDeleteRoutine = () => {
        if (!routineToDelete) return;

        setRoutines((prev) => prev.filter((r) => r.id !== routineToDelete));

        setRoutineToDelete(null);
    };

    const cancelDeleteRoutine = () => {
        setRoutineToDelete(null);
    };

    const startWorkout = (routine: Routine) => {
        const workout: ActiveWorkout = {
            routineId: routine.id,
            routineName: routine.name,
            startTime: Date.now(),
            exercises: routine.exercises.map((ex) => ({
                id: ex.id,
                name: ex.name,
                sets: ex.sets.map((s) => ({
                    setNumber: s.setNumber,
                    plannedWeight: s.weight,
                    plannedReps: s.reps,
                    actualWeight: 0,
                    actualReps: 0,
                    completed: false,
                })),
            })),
        };

        setActiveWorkout(workout);
        setView("workout");
    };

    const exitWorkout = () => {
        setActiveWorkout(null);
        setView("home");
    };

    if (view === "builder") {
        return (
            <RoutineBuilderPage
                onBack={() => setView("home")}
                onSaveRoutine={handleSaveRoutine}
                existingRoutine={editingRoutine}
            />
        );
    }

    if (view === "workout" && activeWorkout) {
        return (
            <ActiveWorkoutPage workout={activeWorkout} onExit={exitWorkout} />
        );
    }

    return (
        <>
            <HomePage
                routines={routines}
                onCreateRoutine={handleCreate}
                onEditRoutine={handleEdit}
                onStartWorkout={startWorkout}
                onDeleteRoutine={handleDeleteRoutine}
            />

            {routineToDelete && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-gray-900 p-6 rounded-xl w-[300px] text-center border border-gray-700">
                        <h2 className="text-lg font-semibold mb-2">
                            Delete routine?
                        </h2>

                        <p className="text-gray-400 text-sm mb-6">
                            This action cannot be undone.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={cancelDeleteRoutine}
                                className="flex-1 bg-gray-700 py-2 rounded-lg"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={confirmDeleteRoutine}
                                className="flex-1 bg-red-500 text-black py-2 rounded-lg font-semibold"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default App;
