import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import logo from "../../assets/logo.png";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("member"); // default to member
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Logic based on your previous code
    setTimeout(() => {
      const routes = {
        admin: "/owner",
        trainer: "/trainer",
        member: "/member",
      };
      navigate(routes[role] || "/");
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-[2rem] shadow-xl w-full max-w-md text-center">
        
        {/* Logo Placeholder */}
        <div className="flex justify-center mb-6">
                  <img 
                    src={logo} 
                    alt="Songar's GYM Logo" 
                    className="h-32 w-auto object-contain"
                  />
                </div>

        <h2 className="text-3xl font-bold text-gray-800 mb-1">Welcome Back!</h2>
        <p className="text-gray-500 text-sm mb-8">Please sign in to your Songar's GYM account.</p>

        {/* Role Selector Tabs */}
        <div className="flex justify-between gap-2 mb-6">
          {['admin', 'trainer', 'member'].map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`flex-1 py-2 rounded-full text-sm font-semibold border-2 transition-all duration-200 capitalize ${
                role === r 
                ? 'bg-[#F9C833] border-[#F9C833] text-gray-800 shadow-md' 
                : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Email Input */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-3 rounded-xl focus:ring-2 focus:ring-[#F9C833] outline-none transition"
              placeholder="Email or Username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type={showPassword ? "text" : "password"}
              className="w-full bg-slate-50 border border-slate-200 pl-12 pr-12 py-3 rounded-xl focus:ring-2 focus:ring-[#F9C833] outline-none transition"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 flex items-center gap-1 text-xs"
            >
              <span className="mr-1">Show</span>
              {showPassword ? <EyeOff size={16}/> : <Eye size={16} />}
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F9C833] hover:bg-[#e6b82e] text-gray-800 font-bold py-3 rounded-full shadow-lg transition-transform active:scale-95"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 space-y-3">
          <button className="text-sm font-semibold text-gray-700 hover:underline">
            Forgot Password?
          </button>
          <p className="text-sm text-gray-600">
            Don't have an account? <button onClick={() => navigate("/register")} className="font-bold text-gray-800 hover:underline">Register</button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;