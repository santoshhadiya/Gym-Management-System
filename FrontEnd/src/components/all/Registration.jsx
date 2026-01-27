import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Phone } from 'lucide-react';
import logo from "../../assets/logo.png"; // Removed to fix build error
import { useGlobalContext } from '../../context/GlobalContext';

const RegisterPage = () => {
  const {BACKEND_URL}=useGlobalContext()
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

  // Inject Font Awesome
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    // 1. Input Validation
    if (!formData.fullName || !formData.email || !formData.phone || !formData.password) {
      setError("All fields are required.");
      return;
    }
    
    if (formData.password.length < 6) {
       setError("Password must be at least 6 characters long.");
       return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);

    try {
      // 2. API Call
      const response = await fetch(`${BACKEND_URL}/api/auth/register`, {
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
        // 3. Success Handling
        alert("Registration Successful! Please login.");
        navigate("/login");
      } else {
        // 4. API Error Handling
        setError(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      // 5. Network Error Handling
      console.error("Registration Error:", err);
      setError("Server error. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-[#f1f4f9] p-4 font-sans">
      <div className="bg-white p-10 md:p-10 rounded-[2.5rem] shadow-sm w-fit gap-10 text-center border border-gray-100 my-4 flex flex-col md:flex-row">

        <div className='flex flex-col items-center justify-center'>
          {/* Logo Section */}
          <div className="flex justify-center mb-4">
             <img src={logo} className='h-40'/>
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
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
              <i className="fa-solid fa-circle-exclamation"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4 text-left">

            <div className='flex gap-2 flex-col md:flex-row'>
              <div className='gap-2 flex flex-col w-full md:w-[50%]'>
                {/* Full Name */}
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="text"
                    name="fullName"
                    className="w-full bg-[#f1f4f9] border border-[#dcdde1] pl-12 pr-4 py-3.5 rounded-xl focus:ring-2 focus:ring-[#FEEF75] outline-none transition placeholder-gray-400 font-medium"
                    placeholder="Full Name"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Email */}
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="email"
                    name="email"
                    className="w-full bg-[#f1f4f9] border border-[#dcdde1] pl-12 pr-4 py-3.5 rounded-xl focus:ring-2 focus:ring-[#FEEF75] outline-none transition placeholder-gray-400 font-medium"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                 {/* Phone */}
                 <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="tel"
                    name="phone"
                    className="w-full bg-[#f1f4f9] border border-[#dcdde1] pl-12 pr-4 py-3.5 rounded-xl focus:ring-2 focus:ring-[#FEEF75] outline-none transition placeholder-gray-400 font-medium"
                    placeholder="Phone Number"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className='gap-2 flex flex-col w-full md:w-[50%]'>
                {/* Password */}
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="w-full bg-[#f1f4f9] border border-[#dcdde1] pl-12 pr-16 py-3.5 rounded-xl focus:ring-2 focus:ring-[#FEEF75] outline-none transition placeholder-gray-400 font-medium"
                    placeholder="Create Password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 flex items-center gap-1.5 text-xs font-bold"
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>

                {/* Confirm Password */}
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                  <input
                    type="password"
                    name="confirmPassword"
                    className="w-full bg-[#f1f4f9] border border-[#dcdde1] pl-12 pr-4 py-3.5 rounded-xl focus:ring-2 focus:ring-[#FEEF75] outline-none transition placeholder-gray-400 font-medium"
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>

              </div>
            </div>
            <div className='w-full flex items-center justify-center pt-2'>
              {/* Register Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-[60%] bg-[#FEEF75] cursor-pointer hover:bg-[#ffca2b] text-gray-900 font-black py-4 rounded-full shadow-lg transition-transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <><i className="fa-solid fa-circle-notch fa-spin"></i> Creating...</> : "Create Account"}
              </button>
            </div>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 font-medium">
              Already have an account? <button onClick={() => navigate("/login")} className="font-bold text-gray-900 hover:underline">Login here</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;