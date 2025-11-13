import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../utils/api";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import socket from "../../utils/socket";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/dashboard");
  }, [navigate]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6; // Minimum 6 characters
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setEmailError("");
    setPasswordError("");
    setServerError("");

    // Validate email
    if (!email.trim()) {
      setEmailError("Email is required");
      return;
    }
    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    // Validate password
    if (!password.trim()) {
      setPasswordError("Password is required");
      return;
    }
    if (!validatePassword(password)) {
      setPasswordError("Password must be at least 6 characters long");
      return;
    }

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
      // Join socket room for real-time updates
      socket.emit('join', res.data.userId);
      navigate("/dashboard");
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || "Login failed";
      setServerError(errorMessage);
      toast.error(errorMessage);
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
                className={`w-full p-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  emailError ? "border-red-500" : "border-gray-300"
                }`}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                required
              />
              {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
            </div>

            <div>
              <input
                type="password"
                placeholder="Password"
                className={`w-full p-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  passwordError ? "border-red-500" : "border-gray-300"
                }`}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError("");
                }}
                required
              />
              {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-full font-semibold hover:bg-blue-700 transition flex justify-center items-center"
            >
              {loading ? <Loader2 size={20} className="animate-spin" /> : "Login"}
            </button>

            {serverError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm text-center">{serverError}</p>
              </div>
            )}
          </form>

          <div className="text-sm text-gray-600 text-center mt-6 space-y-2">
            <p>
              <a href="/forgot-password" className="text-blue-600 hover:underline">
                Forgot Password?
              </a>
            </p>
            <p>
              Don’t have an account?{" "}
              <a href="/signup" className="text-blue-600 hover:underline">
                Register
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

