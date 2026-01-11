import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import logo from "../../assets/logo.png"; // Commented out to fix build error

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("member"); // default to member
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // Add error state

  const navigate = useNavigate();

  // Inject Font Awesome for the logo icon
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
    setLoading(true);
    setError("");

    try {
      // API Call to Backend
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Save user info & token
        localStorage.setItem("userInfo", JSON.stringify(data));

        // Use role from backend, or fallback to selected role
        const userRole = data.role || role;

        const routes = {
          admin: "/admin",
          trainer: "/trainer",
          member: "/member",
        };
        navigate(routes[userRole] || "/");
      } else {
        setError(data.message || "Invalid credentials. Please try again.");
      }
    } catch (err) {
      console.error("Login Error:", err);
      // Fallback for dev/demo if backend is offline, remove in prod
      setError("Server unreachable. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full justify-center bg-slate-100 p-4 min-h-screen overflow-y-auto items-center font-sans">
      <div className="bg-white p-8 flex flex-col md:flex-row rounded-[2rem] shadow-xl w-full max-w-4xl gap-10 text-center h-fit items-center justify-center">

        <div className='flex flex-col items-center justify-center w-full md:w-1/2'>
          {/* Logo Section - Fixed */}
          <div className="flex justify-center mb-6">
             <img src={logo} className='h-40'/>
          </div>

          <h2 className="text-3xl font-black text-gray-800 mb-2">Welcome Back!</h2>
          <p className="text-gray-500 text-sm mb-8">Please sign in to your Songar's GYM account.</p>
        </div>

        <div className="w-full md:w-1/2">
          {/* Role Selector Tabs */}
          <div className="flex justify-between gap-2 mb-6 bg-gray-50 p-1 rounded-xl">
            {['admin', 'trainer', 'member'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${role === r
                  ? 'bg-[#FEEF75] text-gray-900 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-white'
                  }`}
              >
                {r}
              </button>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation"></i> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Input */}
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="email"
                className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-3.5 rounded-xl focus:ring-4 focus:ring-[#FEEF75]/50 focus:border-[#FEEF75] outline-none transition-all font-medium text-gray-700"
                placeholder="Email or Username"
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
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 flex items-center gap-1 text-xs transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#D9F17F] hover:bg-[#cbf056] text-green-900 font-black py-4 rounded-xl shadow-lg hover:shadow-green-500/20 transition-all transform hover:-translate-y-0.5 active:scale-95 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="fa-solid fa-circle-notch fa-spin"></i> Signing In...
                </span>
              ) : "Login to Dashboard"}
            </button>
          </form>

          <div className="mt-6 flex flex-col gap-3 text-sm">
            <button className="font-bold text-gray-400 hover:text-gray-600 transition-colors">
              Forgot Password?
            </button>
            <p className="text-gray-500">
              Don't have an account? <button onClick={() => navigate("/register")} className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors">Register Now</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;