import { useState } from "react";
import { supabase } from "../lib/supabase";

function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSignup, setIsSignup] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isSignup) {
            if (password !== confirmPassword) {
                alert("Passwords do not match.");
                return;
            }

            const { error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) {
                alert(error.message);
            } else {
                alert("Check your email for confirmation.");
            }
        } else {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                alert(error.message);
            }
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col justify-center items-center px-6">
            <h1 className="text-3xl font-bold mb-8">
                {isSignup ? "Sign Up" : "Login"}
            </h1>

            <form
                onSubmit={handleAuth}
                className="w-full max-w-sm flex flex-col"
            >
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-800 mb-4"
                />

                <div className="relative mb-4">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 rounded-lg bg-gray-800 pr-16"
                    />

                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400"
                    >
                        {showPassword ? "Hide" : "Show"}
                    </button>
                </div>

                {isSignup && (
                    <div className="relative mb-4">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full p-3 rounded-lg bg-gray-800 pr-16"
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400"
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                )}

                <button
                    type="submit"
                    className="bg-white text-black px-6 py-3 rounded-lg font-semibold w-full"
                >
                    {isSignup ? "Create Account" : "Login"}
                </button>
            </form>

            <button
                onClick={() => {
                    setIsSignup(!isSignup);
                    setPassword("");
                    setConfirmPassword("");
                }}
                className="mt-4 text-gray-400"
            >
                {isSignup
                    ? "Already have an account? Login"
                    : "Need an account? Sign Up"}
            </button>
        </div>
    );
}

export default LoginPage;
