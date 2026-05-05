import type { Routine } from "../types/workout";

interface HomePageProps {
    onCreateRoutine: () => void;
    routines: Routine[];
}

function HomePage({ onCreateRoutine, routines }: HomePageProps) {
    return (
        <div className="min-h-screen bg-gray-950 text-white p-6">
            <h1 className="text-3xl font-bold mb-6">My Routines</h1>

            <button
                onClick={onCreateRoutine}
                className="bg-white text-black px-4 py-2 rounded-lg font-semibold mb-6"
            >
                + New Routine
            </button>

            <div className="space-y-4">
                {routines.map((routine) => (
                    <div
                        key={routine.id}
                        className="bg-gray-800 p-4 rounded-lg"
                    >
                        <h2 className="text-xl font-semibold">
                            {routine.name}
                        </h2>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default HomePage;
