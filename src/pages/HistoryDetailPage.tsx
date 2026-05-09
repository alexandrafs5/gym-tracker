interface HistoryDetailPageProps {
    onBack: () => void;
}
function HistoryDetailPage({ onBack }: HistoryDetailPageProps) {
    return (
        <div className="min-h-screen bg-gray-950 text-white px-6 py-10">
            <button onClick={onBack} className="text-gray-400 mb-6">
                ← Back
            </button>
            <h1 className="text-3xl font-bold mb-6">Workout Details</h1>
            <p className="text-gray-400">
                Workout history details coming soon.
            </p>
        </div>
    );
}
export default HistoryDetailPage;
