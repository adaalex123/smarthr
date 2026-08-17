import { createContext, useState, useEffect } from "react";
import axios from "axios";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));

  const login = async (username, password) => {
    const res = await axios.post("http://127.0.0.1:8000/api/token/", { username, password });
    setToken(res.data.access);
    setRole(res.data.role);
    localStorage.setItem("token", res.data.access);
    localStorage.setItem("role", res.data.role);
  };

  const logout = () => {
    setToken(null); setRole(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ token, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}