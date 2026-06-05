import { useState, useMemo } from "react";
import {
    EXERCISE_CATALOG,
    ALL_MUSCLES,
    type CatalogExercise,
} from "../data/exerciseCatalog";
import { getExerciseImage } from "../utils/getExerciseImage";

interface Props {
    onSelect: (exercise: CatalogExercise) => void;
    onClose: () => void;
}

function ExerciseCatalogModal({ onSelect, onClose }: Props) {
    const [search, setSearch] = useState("");
    const [selectedMuscle, setSelectedMuscle] = useState("All Muscles");
    const [selectedEquipment, setSelectedEquipment] = useState("All Equipment");
    const [showMuscleFilter, setShowMuscleFilter] = useState(false);
    const [showEquipmentFilter, setShowEquipmentFilter] = useState(false);

    const filtered = useMemo(() => {
        return EXERCISE_CATALOG.filter((ex) => {
            const matchSearch = ex.name
                .toLowerCase()
                .includes(search.toLowerCase());

            const matchMuscle =
                selectedMuscle === "All Muscles" ||
                ex.primaryMuscle === selectedMuscle ||
                ex.secondaryMuscles.includes(selectedMuscle);

            const matchEquipment =
                selectedEquipment === "All Equipment" ||
                ex.equipment === selectedEquipment;

            return matchSearch && matchMuscle && matchEquipment;
        }).sort((a, b) => {
            const aPrimary = a.primaryMuscle === selectedMuscle ? 0 : 1;
            const bPrimary = b.primaryMuscle === selectedMuscle ? 0 : 1;

            if (aPrimary !== bPrimary) return aPrimary - bPrimary;

            return a.name.localeCompare(b.name);
        });
    }, [search, selectedMuscle, selectedEquipment]);

    return (
        <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col">
            <div className="flex items-center justify-between px-4 pt-8 pb-3 border-b border-gray-800">
                <button
                    onClick={onClose}
                    className="text-blue-400 text-base font-medium"
                >
                    Cancel
                </button>

                <h2 className="text-white font-semibold text-base">
                    Add Exercise
                </h2>

                <div className="w-16" />
            </div>

            {/* SEARCH */}
            <div className="px-4 pt-3 pb-2">
                <div className="flex items-center bg-gray-800 rounded-xl px-3 py-2.5 gap-2">
                    <svg
                        className="w-4 h-4 text-gray-400 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                        />
                    </svg>

                    <input
                        className="bg-transparent text-white placeholder-gray-500 text-base flex-1 outline-none"
                        placeholder="Search exercise"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    {search && (
                        <button
                            onClick={() => setSearch("")}
                            className="text-gray-400"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* FILTERS */}
            <div className="px-4 pb-3 flex gap-2">
                <div className="relative flex-1">
                    <button
                        onClick={() => {
                            setShowEquipmentFilter(!showEquipmentFilter);
                            setShowMuscleFilter(false);
                        }}
                        className={`w-full py-2 rounded-xl text-sm font-medium transition-colors ${
                            selectedEquipment !== "All Equipment"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-800 text-white"
                        }`}
                    >
                        {selectedEquipment}
                    </button>

                    {showEquipmentFilter && (
                        <div className="absolute top-full mt-1 left-0 right-0 bg-gray-800 rounded-xl overflow-y-auto max-h-72 touch-pan-y z-20 border border-gray-700 shadow-xl">
                            {[
                                "All Equipment",
                                "Barbell",
                                "Dumbbell",
                                "Machine",
                                "Bodyweight",
                                "Cable",
                                "Plate",
                                "Band",
                                "Smith Machine",
                            ].map((eq) => (
                                <button
                                    key={eq}
                                    onClick={() => {
                                        setSelectedEquipment(eq);
                                        setShowEquipmentFilter(false);
                                    }}
                                    className={`w-full text-left px-4 py-2.5 text-sm border-b border-gray-700 last:border-0 ${
                                        selectedEquipment === eq
                                            ? "text-blue-400 bg-gray-700"
                                            : "text-white"
                                    }`}
                                >
                                    {eq}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="relative flex-1">
                    <button
                        onClick={() => {
                            setShowMuscleFilter(!showMuscleFilter);
                            setShowEquipmentFilter(false);
                        }}
                        className={`w-full py-2 rounded-xl text-sm font-medium transition-colors ${
                            selectedMuscle !== "All Muscles"
                                ? "bg-blue-600 text-white"
                                : "bg-gray-800 text-white"
                        }`}
                    >
                        {selectedMuscle}
                    </button>

                    {showMuscleFilter && (
                        <div className="absolute top-full mt-1 left-0 right-0 bg-gray-800 rounded-xl overflow-y-auto max-h-72 touch-pan-y z-20 border border-gray-700 shadow-xl">
                            {ALL_MUSCLES.map((muscle) => (
                                <button
                                    key={muscle}
                                    onClick={() => {
                                        setSelectedMuscle(muscle);
                                        setShowMuscleFilter(false);
                                    }}
                                    className={`w-full text-left px-4 py-2.5 text-sm border-b border-gray-700 last:border-0 ${
                                        selectedMuscle === muscle
                                            ? "text-blue-400 bg-gray-700"
                                            : "text-white"
                                    }`}
                                >
                                    {muscle}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* RESULT COUNT */}
            <div className="px-4 pb-2">
                <span className="text-xs text-gray-500 uppercase tracking-wider">
                    {search ||
                    selectedMuscle !== "All Muscles" ||
                    selectedEquipment !== "All Equipment"
                        ? `${filtered.length} result${
                              filtered.length !== 1 ? "s" : ""
                          }`
                        : "All Exercises"}
                </span>
            </div>

            {/* LIST */}
            <div
                className="flex-1 overflow-y-auto px-4"
                onClick={() => {
                    setShowMuscleFilter(false);
                    setShowEquipmentFilter(false);
                }}
            >
                {filtered.length === 0 ? (
                    <div className="text-center text-gray-500 mt-12 text-sm">
                        No exercises found
                    </div>
                ) : (
                    filtered.map((ex) => (
                        <button
                            key={ex.id}
                            onClick={() => onSelect(ex)}
                            className="w-full flex items-center gap-3 py-3 border-b border-gray-800 last:border-0 text-left active:bg-gray-800/50 transition-colors"
                        >
                            <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 bg-gray-800 border border-gray-700">
                                <img
                                    src={getExerciseImage(ex.id)}
                                    alt={ex.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-white font-medium text-sm">
                                    {ex.name}
                                </p>
                                <p className="text-gray-400 text-xs mt-0.5">
                                    {ex.primaryMuscle}
                                </p>
                                {ex.secondaryMuscles.length > 0 && (
                                    <p className="text-gray-600 text-xs mt-0.5 truncate">
                                        {ex.secondaryMuscles.join(", ")}
                                    </p>
                                )}
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}

export default ExerciseCatalogModal;
