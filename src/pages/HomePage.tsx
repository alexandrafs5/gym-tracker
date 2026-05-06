import type { Routine } from "../types/workout";
import { supabase } from "../lib/supabase";

interface HomePageProps {
    onCreateRoutine: () => void;
    onEditRoutine: (routine: Routine) => void;
    onStartWorkout: (routine: Routine) => void;
    onDeleteRoutine: (id: string) => void;
    routines: Routine[];
}

function HomePage({
    onCreateRoutine,
    onEditRoutine,
    onStartWorkout,
    onDeleteRoutine,
    routines,
}: HomePageProps) {
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

            <div className="w-full max-w-md space-y-4">
                {routines.map((routine) => (
                    <div
                        key={routine.id}
                        className="bg-gray-800 p-4 rounded-lg relative"
                    >
                        <button
                            onClick={() => onDeleteRoutine(routine.id)}
                            className="absolute top-2 right-2 text-red-400"
                        >
                            🗙
                        </button>

                        <button
                            onClick={() => onEditRoutine(routine)}
                            className="text-left w-full"
                        >
                            <h2 className="text-xl font-semibold">
                                {routine.name}
                            </h2>
                        </button>

                        <button
                            onClick={() => onStartWorkout(routine)}
                            className="mt-3 bg-green-500 text-black px-3 py-1 rounded-lg text-sm w-full"
                        >
                            Start Workout
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default HomePage;
