import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Phone } from 'lucide-react';
import logo from "../../assets/logo.png"; // Ensure this matches your file path

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  const [role, setRole] = useState("member");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // Basic Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: role // Sending the selected role
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Registration successful
        alert("Registration Successful! Please login.");
        navigate("/login");
      } else {
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Registration Error:", err);
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#f1f4f9] p-4 font-sans">
      <div className="bg-white p-10 md:p-10 rounded-[2.5rem] shadow-sm w-fit gap-10  text-center border border-gray-100 my-4 flex">

        <div className='flex flex-col items-center justify-center'>
          {/* Logo Section */}
          <div className="flex justify-center mb-4">
            <img
              src={logo}
              alt="Songar's GYM Logo"
              className="h-24 w-auto object-contain"
            />
          </div>

          <h2 className="text-3xl font-bold text-[#2d3436] mb-2">Create Account</h2>
          <p className="text-gray-500 text-sm mb-6">Join the Songar's GYM family today!</p>

        </div>
        <div>
          {/* Role Selector */}
          <div className="flex justify-between gap-3 mb-6">
            {['trainer', 'member', 'admin'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`flex-1 py-2.5 rounded-full text-sm font-semibold border transition-all duration-200 capitalize cursor-pointer ${role === r
                  ? 'bg-[#FEEF75] border-[#FEEF75] text-gray-900 shadow-sm'
                  : ' border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
              >
                {r}
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 text-red-500 text-sm font-semibold bg-red-50 p-2 rounded-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4 text-left">

            <div className='flex gap-2'>
              <div className='gap-2 flex flex-col w-[50%]'>
                {/* Full Name */}
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="fullName"
                    className="w-full bg-[#f1f4f9] border border-[#dcdde1] pl-12 pr-4 py-3.5 rounded-xl focus:ring-2 focus:ring-[#FEEF75] outline-none transition placeholder-gray-400"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Email */}
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    className="w-full bg-[#f1f4f9] border border-[#dcdde1] pl-12 pr-4 py-3.5 rounded-xl focus:ring-2 focus:ring-[#FEEF75] outline-none transition placeholder-gray-400"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                 {/* Phone */}
                 <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    name="phone"
                    className="w-full bg-[#f1f4f9] border border-[#dcdde1] pl-12 pr-4 py-3.5 rounded-xl focus:ring-2 focus:ring-[#FEEF75] outline-none transition placeholder-gray-400"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className='gap-2 flex flex-col w-[50%]'>
                {/* Password */}
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="w-full bg-[#f1f4f9] border border-[#dcdde1] pl-12 pr-16 py-3.5 rounded-xl focus:ring-2 focus:ring-[#FEEF75] outline-none transition placeholder-gray-400"
                    placeholder="Create Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 flex items-center gap-1.5 text-sm"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* Confirm Password */}
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="password"
                    name="confirmPassword"
                    className="w-full bg-[#f1f4f9] border border-[#dcdde1] pl-12 pr-4 py-3.5 rounded-xl focus:ring-2 focus:ring-[#FEEF75] outline-none transition placeholder-gray-400"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>

              </div>
            </div>
            <div className='w-full flex items-center justify-center'>
              {/* Register Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-[50%] bg-[#FEEF75] cursor-pointer hover:bg-[#ffca2b] text-gray-900 font-bold py-4 rounded-full shadow-md transition-all active:scale-[0.98] mt-2 disabled:opacity-50"
              >
                {loading ? "Creating Account..." : "Register"}
              </button>
            </div>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account? <button onClick={() => navigate("/login")} className="font-bold text-gray-900 hover:underline">Login</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;