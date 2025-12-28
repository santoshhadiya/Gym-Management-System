import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("member");

  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill in all fields");
      return;
    }

    // You can replace this logic with actual backend/API check
    console.log("Logging in with", { email, password, role });

    // Redirect based on role
    switch (role) {
      case "admin":
        navigate("/owner");
        break;
      case "trainer":
        navigate("/trainer");
        break;
      case "member":
        navigate("/member");
        break;
      case "visitor":
        navigate("/visitor");
        break;
      default:
        navigate("/");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md"
      >
        <h2 className="text-2xl font-bold text-center text-red-600 mb-6">
          Gym Login
        </h2>

        <div className="mb-4">
          <label className="block font-medium mb-1">Email</label>
          <input
            type="email"
            className="w-full border px-4 py-2 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Password</label>
          <input
            type="password"
            className="w-full border px-4 py-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <div className="mb-6">
          <label className="block font-medium mb-1">Login As</label>
          <select
            className="w-full border px-4 py-2 rounded"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="member">Member</option>
            <option value="trainer">Trainer</option>
            <option value="admin">Admin</option>
            <option value="visitor">Visitor</option>
          </select>
        </div>

        <button
          type="submit"
          className="bg-red-600 text-white px-6 py-2 w-full rounded hover:bg-red-700"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginPage