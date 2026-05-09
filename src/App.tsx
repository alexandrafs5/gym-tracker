import { useEffect, useState } from "react";
import HomePage from "./pages/HomePage";
import RoutineBuilderPage from "./pages/RoutineBuilderPage";
import ActiveWorkoutPage from "./pages/ActiveWorkoutPage";
import type { Routine, ActiveWorkout } from "./types/workout";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";
import LoginPage from "./pages/LoginPage";
import {
    fetchRoutines,
    saveRoutine,
    deleteRoutine,
    updateRoutineOrder,
} from "./utils/supabaseRoutines";

type View = "home" | "builder" | "workout";

function App() {
    const [view, setView] = useState<View>("home");
    const [routines, setRoutines] = useState<Routine[]>([]);

    const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
    const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(
        null,
    );

    const [routineToDelete, setRoutineToDelete] = useState<string | null>(null);

    const [session, setSession] = useState<Session | null>(null);
    const [loadingAuth, setLoadingAuth] = useState(true);

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

    useEffect(() => {
        const getSession = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            setSession(session);
            setLoadingAuth(false);
        };

        getSession();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    useEffect(() => {
        const loadUserRoutines = async () => {
            if (session) {
                const routinesData = await fetchRoutines();
                setRoutines(routinesData);
            } else {
                setRoutines([]);
            }
        };

        loadUserRoutines();
    }, [session]);

    if (loadingAuth) {
        return (
            <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
                Loading...
            </div>
        );
    }

    if (!session) {
        return <LoginPage />;
    }

    const handleCreate = () => {
        setEditingRoutine(null);
        setView("builder");
    };

    const handleEdit = (routine: Routine) => {
        setEditingRoutine(routine);
        setView("builder");
    };

    const handleSaveRoutine = async (routine: Routine) => {
        const exists = routines.find((r) => r.id === routine.id);

        let updatedRoutines: Routine[];

        if (exists) {
            updatedRoutines = routines.map((r) =>
                r.id === routine.id ? routine : r,
            );
        } else {
            updatedRoutines = [...routines, routine];
        }

        setRoutines(updatedRoutines);

        const position = updatedRoutines.findIndex((r) => r.id === routine.id);

        await saveRoutine(routine, position);

        setView("home");
        setEditingRoutine(null);
    };

    const handleDeleteRoutine = (id: string) => {
        setRoutineToDelete(id);
    };

    const confirmDeleteRoutine = async () => {
        if (!routineToDelete) return;

        const updatedRoutines = routines.filter(
            (r) => r.id !== routineToDelete,
        );

        setRoutines(updatedRoutines);

        await deleteRoutine(routineToDelete);
        await updateRoutineOrder(updatedRoutines);

        setRoutineToDelete(null);
    };

    const cancelDeleteRoutine = () => {
        setRoutineToDelete(null);
    };

    const handleReorderRoutines = async (newRoutines: Routine[]) => {
        setRoutines(newRoutines);
        await updateRoutineOrder(newRoutines);
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
                onReorderRoutines={handleReorderRoutines}
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
