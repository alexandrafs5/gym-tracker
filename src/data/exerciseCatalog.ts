export interface CatalogExercise {
    id: string;
    name: string;
    primaryMuscle: string;
    secondaryMuscles: string[];
    equipment: string;
    imageUrl: string;
}

export const EXERCISE_CATALOG: CatalogExercise[] = [
    {
        id: "squat-barbell",
        name: "Squat (Barbell)",
        primaryMuscle: "Quadriceps",
        secondaryMuscles: ["Glutes", "Hamstrings", "Core"],
        equipment: "Barbell",
        imageUrl: "/exercises/BARBELL-SQUAT.gif",
    },
    {
        id: "hip-thrust-barbell",
        name: "Hip Thrust (Barbell)",
        primaryMuscle: "Glutes",
        secondaryMuscles: ["Hamstrings", "Core"],
        equipment: "Barbell",
        imageUrl: "/exercises/Barbell-Hip-Thrust.gif",
    },
    {
        id: "bench-press-barbell",
        name: "Bench Press (Barbell)",
        primaryMuscle: "Chest",
        secondaryMuscles: ["Triceps", "Shoulders"],
        equipment: "Barbell",
        imageUrl: "/exercises/Barbell-Bench-Press.gif",
    },
];

export const ALL_MUSCLES = [
    "All Muscles",
    ...Array.from(
        new Set(
            EXERCISE_CATALOG.flatMap((e) => [
                e.primaryMuscle,
                ...e.secondaryMuscles,
            ]),
        ),
    ).sort(),
];

export const ALL_EQUIPMENT = [
    "All Equipment",
    ...Array.from(new Set(EXERCISE_CATALOG.map((e) => e.equipment))).sort(),
];
