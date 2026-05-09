export interface WorkoutHistory {
    id: string;
    routine_name: string;
    completed_at: string;
    duration: number;
    exercises: {
        id: string;
        name: string;
        sets: {
            setNumber: number;
            plannedWeight: number;
            plannedReps: number;
            actualWeight: number;
            actualReps: number;
            completed: boolean;
        }[];
    }[];
}
