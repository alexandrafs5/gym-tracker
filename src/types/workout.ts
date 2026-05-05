export interface ExerciseSet {
    setNumber: number;
    weight: number;
    reps: number;
    completed: boolean;
}

export interface Exercise {
    id: string;
    name: string;
    sets: ExerciseSet[];
}

export interface Routine {
    id: string;
    name: string;
    exercises: Exercise[];
}

export interface ActiveSet {
    setNumber: number;
    plannedWeight: number;
    plannedReps: number;
    actualWeight: number;
    actualReps: number;
    completed: boolean;
}

export interface ActiveExercise {
    id: string;
    name: string;
    sets: ActiveSet[];
}

export interface ActiveWorkout {
    routineId: string;
    routineName: string;
    startTime: number;
    exercises: ActiveExercise[];
}
