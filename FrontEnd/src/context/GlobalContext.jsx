import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api'; // Import the axios instance

// 1. Create the Context
const GlobalContext = createContext();

// 2. Create the Provider Component
export const GlobalProvider = ({ children }) => {
  // --- State Definitions ---
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("userInfo")) || null); // { name, role, email, etc. }
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Initial load check
  const [theme, setTheme] = useState('light'); // Example setting

  // --- Effects ---
  // Check for saved user/token on mount (verify with backend optional but recommended)
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('gymToken');
      const storedUser = localStorage.getItem('gymUser');

      if (token && storedUser) {
        try {
          // Optional: Verify token validity with a /me endpoint
          const { data } = await api.get('/auth/me');
          setUser(data);
          setIsAuthenticated(true);
        } catch (error) {
          console.error("Token verification failed", error);
          logout(); // Clear invalid data
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // --- Actions ---

  // Login Action
  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });

      setUser(data); // Assuming backend returns user object inside data
      setIsAuthenticated(true);

      localStorage.setItem('gymUser', JSON.stringify(data));
      localStorage.setItem('gymToken', data.token); // Assuming token is in data.token

      return { success: true };
    } catch (error) {
      console.error("Login failed", error.response?.data?.message || error.message);
      return {
        success: false,
        message: error.response?.data?.message || "Login failed. Please try again."
      };
    }
  };

  // Logout Action
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('gymUser');
    localStorage.removeItem('gymToken');
    // Optional: Redirect is handled by the component calling logout or protected route logic
  };

  // Update User Profile (Partial updates)
  const updateUser = async (updates) => {
    try {
      // Optimistic update
      setUser((prev) => {
        const updated = { ...prev, ...updates };
        localStorage.setItem('gymUser', JSON.stringify(updated));
        return updated;
      });

      // Send to backend
      await api.put('/users/profile', updates);

    } catch (error) {
      console.error("Update failed", error);
      // Revert or show error notification logic here
    }
  };

  // Toggle Theme (Example utility)
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const isHosted=false;
  const BACKEND_URL = !isHosted ? "http://localhost:5000" : "https://gym-management-system-backend-vive.onrender.com";


  // --- Context Value ---
  const value = {
    user,
    setUser,
    isAuthenticated,
    isLoading,
    theme,
    login,
    logout,
    updateUser,
    toggleTheme,
    BACKEND_URL,
    api, // Expose axios instance for use in other components
  };

  return (
    <GlobalContext.Provider value={value}>
      {!isLoading && children} {/* Wait for initial auth check before rendering app */}
    </GlobalContext.Provider>
  );
};

// 3. Custom Hook for easy usage
export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobalContext must be used within a GlobalProvider');
  }
  return context;
};