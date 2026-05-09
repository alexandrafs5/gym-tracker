import type { WorkoutHistory } from "../types/history";

interface HistoryDetailPageProps {
    workout: WorkoutHistory;
    onBack: () => void;
}

function HistoryDetailPage({ workout, onBack }: HistoryDetailPageProps) {
    return (
        <div className="min-h-screen bg-gray-950 text-white px-6 py-10">
            <button onClick={onBack} className="text-gray-400 mb-6">
                ← Back
            </button>

            <h1 className="text-3xl font-bold mb-2">{workout.routine_name}</h1>

            <p className="text-gray-400 mb-2">
                {new Date(workout.completed_at).toLocaleDateString()}
            </p>

            <p className="text-gray-400 mb-8">
                Duration: {Math.floor(workout.duration / 60)} min
            </p>

            {workout.exercises.map((ex) => (
                <div key={ex.id} className="bg-gray-800 p-4 rounded-lg mb-6">
                    <h2 className="text-lg font-semibold mb-3">{ex.name}</h2>

                    <div className="grid grid-cols-3 text-gray-400 mb-2">
                        <span>Set</span>
                        <span>Weight</span>
                        <span>Reps</span>
                    </div>

                    {ex.sets.map((set) => (
                        <div
                            key={set.setNumber}
                            className="grid grid-cols-3 mb-2"
                        >
                            <span>{set.setNumber}</span>
                            <span>{set.actualWeight}</span>
                            <span>{set.actualReps}</span>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

export default HistoryDetailPage;
