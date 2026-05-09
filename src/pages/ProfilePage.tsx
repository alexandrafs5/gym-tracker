interface ProfilePageProps {
    onOpenHistoryDetail: () => void;
}
function ProfilePage({ onOpenHistoryDetail }: ProfilePageProps) {
    return (
        <div className="min-h-screen bg-gray-950 text-white px-6 py-10">
            <h1 className="text-3xl font-bold mb-8">Profile</h1>
            <h2 className="text-xl font-semibold mb-4">Workout History</h2>
            <button
                onClick={onOpenHistoryDetail}
                className="w-full bg-gray-800 p-4 rounded-lg text-left"
            >
                No workouts yet
            </button>
        </div>
    );
}
export default ProfilePage;
