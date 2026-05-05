import { useState } from "react";
import HomePage from "./pages/HomePage";
import RoutineBuilderPage from "./pages/RoutineBuilderPage";

function App() {
    const [isCreatingRoutine, setIsCreatingRoutine] = useState(false);
    return isCreatingRoutine ? (
        <RoutineBuilderPage onBack={() => setIsCreatingRoutine(false)} />
    ) : (
        <HomePage onCreateRoutine={() => setIsCreatingRoutine(true)} />
    );
}

export default App;
