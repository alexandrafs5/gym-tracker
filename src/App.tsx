import { useState } from "react";
import HomePage from "./pages/HomePage";
import RoutineBuilderPage from "./pages/RoutineBuilderPage";
import type { Routine } from "./types/workout";

type ViewMode = "home" | "builder";

function App() {
    const [view, setView] = useState<ViewMode>("home");
    const [routines, setRoutines] = useState<Routine[]>([]);
    const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);

    const handleCreate = () => {
        setEditingRoutine(null);
        setView("builder");
    };

    const handleEdit = (routine: Routine) => {
        setEditingRoutine(routine);
        setView("builder");
    };

    const handleSave = (routine: Routine) => {
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

    const handleBack = () => {
        setView("home");
        setEditingRoutine(null);
    };

    if (view === "builder") {
        return (
            <RoutineBuilderPage
                onBack={handleBack}
                onSaveRoutine={handleSave}
                existingRoutine={editingRoutine}
            />
        );
    }

    return (
        <HomePage
            routines={routines}
            onCreateRoutine={handleCreate}
            onEditRoutine={handleEdit}
        />
    );
}

export default App;
