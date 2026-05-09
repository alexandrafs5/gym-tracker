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
import ProfilePage from "./pages/ProfilePage";
import HistoryDetailPage from "./pages/HistoryDetailPage";
import BottomNav from "./components/BottomNav";
import type { WorkoutHistory } from "./types/history";
import { loadLocalRoutines } from "./utils/offlineStorage";
import { isOnline } from "./utils/network";

type View = "home" | "profile" | "historyDetail" | "builder" | "workout";

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
    const [selectedHistory, setSelectedHistory] =
        useState<WorkoutHistory | null>(null);

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
        } = supabase.auth.onAuthStateChange((_e, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    useEffect(() => {
        const loadUserRoutines = async () => {
            if (!session) {
                setRoutines([]);
                return;
            }

            const local = loadLocalRoutines();
            setRoutines(local);

            if (isOnline()) {
                const fresh = await fetchRoutines();
                setRoutines(fresh);
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

    if (!session) return <LoginPage />;

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

        const updated = exists
            ? routines.map((r) => (r.id === routine.id ? routine : r))
            : [...routines, routine];

        setRoutines(updated);

        const position = updated.findIndex((r) => r.id === routine.id);
        await saveRoutine(routine, position);

        setView("home");
        setEditingRoutine(null);
    };

    const handleDeleteRoutine = (id: string) => setRoutineToDelete(id);

    const confirmDeleteRoutine = async () => {
        if (!routineToDelete) return;

        const updated = routines.filter((r) => r.id !== routineToDelete);
        setRoutines(updated);

        await deleteRoutine(routineToDelete);
        await updateRoutineOrder(updated);

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

    if (view === "profile") {
        return <ProfilePage onOpenHistoryDetail={() => {}} />;
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

            <BottomNav
                currentView="home"
                onGoHome={() => setView("home")}
                onGoProfile={() => setView("profile")}
            />

            {routineToDelete && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                    <div className="bg-gray-900 p-6 rounded-xl">
                        <p>Delete routine?</p>
                        <button onClick={() => setRoutineToDelete(null)}>
                            Cancel
                        </button>
                        <button onClick={confirmDeleteRoutine}>Delete</button>
                    </div>
                </div>
            )}
        </>
    );
}

export default App;
