import { useEffect, useState } from "react";
import { fetchWorkoutHistory } from "../utils/supabaseHistory";
import type { WorkoutHistory } from "../types/history";

interface ProfilePageProps {
    onOpenHistoryDetail: (workout: WorkoutHistory) => void;
}

function ProfilePage({ onOpenHistoryDetail }: ProfilePageProps) {
    const [history, setHistory] = useState<WorkoutHistory[]>([]);

    useEffect(() => {
        const loadHistory = async () => {
            const data = await fetchWorkoutHistory();
            setHistory(data);
        };

        loadHistory();
    }, []);

    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}m ${s}s`;
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString();
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white px-6 py-10 pb-24">
            <h1 className="text-3xl font-bold mb-8">Profile</h1>

            <h2 className="text-xl font-semibold mb-4">Workout History</h2>

            <div className="space-y-4">
                {history.length === 0 ? (
                    <div className="bg-gray-800 p-4 rounded-lg text-gray-400">
                        No workouts yet
                    </div>
                ) : (
                    history.map((workout) => (
                        <button
                            key={workout.id}
                            onClick={() => onOpenHistoryDetail(workout)}
                            className="w-full bg-gray-800 p-4 rounded-lg text-left"
                        >
                            <div className="font-semibold">
                                {workout.routine_name}
                            </div>

                            <div className="text-sm text-gray-400 mt-1">
                                {formatDate(workout.completed_at)} •{" "}
                                {formatDuration(workout.duration)}
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}

export default ProfilePage;
