import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import logo from "../../assets/logo.png";
import { useGlobalContext } from '../../context/GlobalContext';

const LoginPage = () => {
  const { BACKEND_URL, user, setUser } = useGlobalContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate(`/${user.role}`, { replace: true });
    }
  }, [user, navigate]);

  // Load FontAwesome for icons
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // The backend returns the role automatically (admin, trainer, or member)
        const backendRole = data.role;

        // Update Global Context
        setUser({
          name: data.name,
          role: data.role,
          email: data.email,
          id: data._id
        });

        // Store for persistence
        localStorage.setItem("userInfo", JSON.stringify(data));

        // Dynamic routing based on the role fetched from the database
        const routes = {
          admin: "/admin",
          trainer: "/trainer",
          member: "/member",
        };

        navigate(routes[backendRole] || "/", { replace: true });

      } else {
        setError(data.message || "Invalid email or password.");
      }
    } catch (err) {
      console.error("Login Error:", err);
      setError("Unable to connect to the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full justify-center bg-slate-100 p-4 min-h-screen items-center font-sans">
      <div className="bg-white p-8 flex flex-col md:flex-row rounded-[2rem] shadow-xl w-full max-w-4xl gap-10 items-center justify-center">

        {/* Branding Section */}
        <div className='flex flex-col items-center justify-center w-full md:w-1/2'>
          <div className="flex justify-center mb-6">
            <img src={logo} className='h-40' alt="Gym Logo" />
          </div>
          <h2 className="text-3xl font-black text-gray-800 mb-2">Welcome Back!</h2>
          <p className="text-gray-500 text-sm mb-8">Please sign in to access your dashboard.</p>
        </div>

        <div className="w-full md:w-1/2">
          {/* Error Display */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Input */}
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="email"
                className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-3.5 rounded-xl focus:ring-4 focus:ring-[#FEEF75]/50 focus:border-[#FEEF75] outline-none transition-all font-medium text-gray-700"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password Input */}
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                className="w-full bg-slate-50 border border-slate-200 pl-12 pr-12 py-3.5 rounded-xl focus:ring-4 focus:ring-[#FEEF75]/50 focus:border-[#FEEF75] outline-none transition-all font-medium text-gray-700"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FEEF75] hover:bg-[#ffca2b] text-black font-black py-4 rounded-xl shadow-lg transition-all transform active:scale-95 disabled:opacity-70 mt-2 flex justify-center items-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin"></i> Signing In...
                </>
              ) : "Login to Dashboard"}
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-3 text-sm">
            <button
              onClick={() => navigate("/forgot-password")}
              className="font-bold text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              Forgot Password?
            </button>
            <p className="text-gray-500">
              Don't have an account? <button onClick={() => navigate("/register")} className="font-bold text-black cursor-pointer hover:underline transition-colors">Register Now</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;