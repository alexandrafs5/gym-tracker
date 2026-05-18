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
                <div key={ex.id} className="bg-gray-800 p-4 rounded-xl mb-6">
                    <div className="flex items-center gap-3 mb-3">
                        {ex.imageUrl && (
                            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 bg-gray-700 border border-gray-600">
                                <img
                                    src={ex.imageUrl}
                                    alt={ex.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <h2 className="text-base font-semibold">{ex.name}</h2>
                    </div>

                    <div className="grid grid-cols-3 text-gray-400 text-sm mb-2">
                        <span>Set</span>
                        <span>Weight</span>
                        <span>Reps</span>
                    </div>

                    {ex.sets.map((set) => (
                        <div
                            key={set.setNumber}
                            className="grid grid-cols-3 mb-2 text-sm"
                        >
                            <span>{set.setNumber}</span>
                            <span>{set.actualWeight} lbs</span>
                            <span>{set.actualReps}</span>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

export default HistoryDetailPage;
