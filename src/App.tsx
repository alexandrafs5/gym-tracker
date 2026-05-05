import { useState } from "react";
import HomePage from "./pages/HomePage";
import RoutineBuilderPage from "./pages/RoutineBuilderPage";
import type { Routine } from "./types/workout";

function App() {
    const [isCreatingRoutine, setIsCreatingRoutine] = useState(false);
    const [routines, setRoutines] = useState<Routine[]>([]);

    const addRoutine = (routine: Routine) => {
        setRoutines([...routines, routine]);
        setIsCreatingRoutine(false);
    };

    return isCreatingRoutine ? (
        <RoutineBuilderPage
            onBack={() => setIsCreatingRoutine(false)}
            onSaveRoutine={addRoutine}
        />
    ) : (
        <HomePage
            onCreateRoutine={() => setIsCreatingRoutine(true)}
            routines={routines}
        />
    );
}

export default App;
