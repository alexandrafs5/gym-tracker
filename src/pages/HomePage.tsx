import type { Routine } from "../types/workout";

interface HomePageProps {
    onCreateRoutine: () => void;
    onEditRoutine: (routine: Routine) => void;
    routines: Routine[];
}

function HomePage({ onCreateRoutine, onEditRoutine, routines }: HomePageProps) {
    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center px-6 py-10">
            <button
                onClick={onCreateRoutine}
                className="bg-white text-black px-6 py-3 rounded-lg font-semibold mb-8"
            >
                + New Routine
            </button>

            <h1 className="text-3xl font-bold mb-8 text-center">My Routines</h1>

            <div className="w-full max-w-md space-y-4">
                {routines.map((routine) => (
                    <button
                        key={routine.id}
                        onClick={() => onEditRoutine(routine)}
                        className="w-full bg-gray-800 p-4 rounded-lg text-left"
                    >
                        <h2 className="text-xl font-semibold">
                            {routine.name}
                        </h2>
                    </button>
                ))}
            </div>
        </div>
    );
}

export default HomePage;
