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
    id : string;
    name: string;
    exercises: Exercise[];
}