import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../utils/api";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/dashboard");
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("userId", res.data.userId);
      localStorage.setItem(
        "userName",
        `${res.data.firstName} ${res.data.lastName}`
      );
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
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

      {/* Right section (Login Form) */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 px-8">
        <div className="w-full max-w-sm">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Hello!</h2>
          <p className="text-gray-500 mb-6">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                type="email"
                placeholder="Email Address"
                className="w-full p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                className="w-full p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-full font-semibold hover:bg-blue-700 transition flex justify-center items-center"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : "Login"}
            </button>
          </form>

          <p className="text-sm text-gray-600 text-center mt-6">
            Don’t have an account?{" "}
            <a href="/signup" className="text-blue-600 hover:underline">
              Register
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
