import { useState } from "react";
import HomePage from "./pages/HomePage";
import RoutineBuilderPage from "./pages/RoutineBuilderPage";
import ActiveWorkoutPage from "./pages/ActiveWorkoutPage";
import type { Routine, ActiveWorkout } from "./types/workout";

type View = "home" | "builder" | "workout";

function App() {
    const [view, setView] = useState<View>("home");
    const [routines, setRoutines] = useState<Routine[]>([]);
    const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);
    const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(
        null,
    );

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

    /* WORKOUT FLOW */
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

    /* ROUTING */
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
        <HomePage
            routines={routines}
            onCreateRoutine={handleCreate}
            onEditRoutine={handleEdit}
            onStartWorkout={startWorkout}
        />
    );
}

export default App;
