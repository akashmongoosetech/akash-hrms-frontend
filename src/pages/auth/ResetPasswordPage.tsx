import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../../utils/api";
import { Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      toast.error("Invalid reset link");
      navigate("/login");
    }
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await API.post("/auth/reset-password", { token, password });
      toast.success("Password reset successfully! Please login with your new password.");
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#10B981',
              color: '#fff',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: '#EF4444',
              color: '#fff',
            },
          },
        }}
      />
      <div className="flex min-h-screen">
        {/* Left section (Blue background) */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 relative items-center justify-center overflow-hidden">
          {/* Decorative geometric shapes */}
          <div className="absolute inset-0 flex flex-wrap justify-center items-center opacity-80">
            <div className="bg-blue-500 w-40 h-40 rounded-tl-full m-2"></div>
            <div className="bg-indigo-500 w-32 h-32 rounded-br-full m-2"></div>
            <div className="bg-pink-400 w-24 h-24 rounded-tr-full m-2"></div>
            <div className="bg-blue-400 w-28 h-28 rounded-bl-full m-2"></div>
          </div>

          {/* Logo + Text */}
          <div className="relative text-white text-center z-10">
            <h1 className="text-3xl font-bold mb-2">My HR</h1>
            <p className="text-blue-100">Stay organized</p>
          </div>
        </div>

        {/* Right section (Reset Password Form) */}
        <div className="flex flex-col justify-center items-center w-full md:w-1/2 px-8">
          <div className="w-full max-w-sm">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Reset Password</h2>
            <p className="text-gray-500 mb-6">Enter your new password</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <input
                  type="password"
                  placeholder="New Password"
                  className="w-full p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Confirm New Password"
                  className="w-full p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-full font-semibold hover:bg-blue-700 transition flex justify-center items-center"
              >
                {loading ? <Loader2 size={20} className="animate-spin" /> : "Reset Password"}
              </button>
            </form>

            <p className="text-sm text-gray-600 text-center mt-6">
              Remember your password?{" "}
              <a href="/login" className="text-blue-600 hover:underline">
                Back to Login
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}