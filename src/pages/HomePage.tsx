interface HomePageProps {
    onCreateRoutine: () => void;
}

function HomePage({ onCreateRoutine }: HomePageProps) {
    return (
        <div className="min-h-screen bg-gray-950 text-white p-6 flex flex-col items-center gap-5">
            <button
                className="bg-white text-black px-4 py-2 rounded-lg font-semibold"
                onClick={onCreateRoutine}
            >
                + New Routine
            </button>

            <h1 className="text-3xl font-bold mb-6">My Routines</h1>
        </div>
    );
}

export default HomePage;
