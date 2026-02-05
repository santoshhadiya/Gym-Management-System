import { useState } from 'react';
import axios from 'axios';
import { Mail, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGlobalContext } from '../../context/GlobalContext';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { api, BACKEND_URL, loadingIMG} = useGlobalContext();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/auth/forgotpassword`, { email });
      alert('A reset link has been sent to your email.');
    } catch (err) {
      alert(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex w-full justify-center bg-slate-100 p-4 min-h-screen items-center font-sans">
      <div className="bg-white p-8 rounded-[2rem] shadow-xl w-full max-w-md">
        <button onClick={() => navigate('/login')} className="flex items-center gap-2 text-gray-400 hover:text-gray-600 mb-6 text-sm font-bold">
          <ArrowLeft size={16} /> Back to Login
        </button>
        <h2 className="text-2xl font-black text-gray-800 mb-2">Reset Password</h2>
        <p className="text-gray-500 text-sm mb-6">Enter your email and we'll send you a link to get back into your account.</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              className="w-full bg-slate-50 border border-slate-200 pl-12 pr-4 py-3.5 rounded-xl outline-none"
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#FEEF75] hover:bg-[#ffca2b] text-black font-black py-4 rounded-xl shadow-lg transition-all disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;