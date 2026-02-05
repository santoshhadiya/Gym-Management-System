import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import logo from "../../assets/logo.png";
import { useGlobalContext } from '../../context/GlobalContext';

const ResetPassword = () => {
  const { api, BACKEND_URL, loadingIMG} = useGlobalContext();
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      // API call to the reset password endpoint 
      const response = await axios.put(`${BACKEND_URL}/api/auth/resetpassword/${token}`, { 
        password 
      });

      if (response.data.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Link expired or invalid. Please request a new one.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex w-full justify-center bg-slate-100 p-4 min-h-screen items-center font-sans">
        <div className="bg-white p-10 rounded-[2rem] shadow-xl w-full max-w-md text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle2 className="text-green-500 w-20 h-20" />
          </div>
          <h2 className="text-3xl font-black text-gray-800 mb-2">Success!</h2>
          <p className="text-gray-500 mb-6">Your password has been updated. Redirecting you to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full justify-center bg-slate-100 p-4 min-h-screen items-center font-sans">
      <div className="bg-white p-8 rounded-[2rem] shadow-xl w-full max-w-md">
        
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img src={logo} alt="Logo" className="h-24" />
        </div>

        <h2 className="text-2xl font-black text-gray-800 mb-2 text-center">Set New Password</h2>
        <p className="text-gray-500 text-sm mb-8 text-center">Please choose a strong password you haven't used before.</p>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-bold flex items-center gap-2">
            <i className="fa-solid fa-circle-exclamation"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-4">
          {/* New Password */}
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-yellow-600 transition-colors" />
            <input
              type={showPassword ? "text" : "password"}
              className="w-full bg-slate-50 border border-slate-200 pl-12 pr-12 py-3.5 rounded-xl focus:ring-4 focus:ring-[#FEEF75]/50 focus:border-[#FEEF75] outline-none transition-all font-medium text-gray-700"
              placeholder="New Password"
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

          {/* Confirm Password */}
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-yellow-600 transition-colors" />
            <input
              type={showPassword ? "text" : "password"}
              className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-3.5 rounded-xl focus:ring-4 focus:ring-[#FEEF75]/50 focus:border-[#FEEF75] outline-none transition-all font-medium text-gray-700"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FEEF75] hover:bg-[#ffca2b] text-black font-black py-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-2 flex justify-center items-center gap-2"
          >
            {loading ? (
              <><i className="fa-solid fa-circle-notch fa-spin"></i> Updating...</>
            ) : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;