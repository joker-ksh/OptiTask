import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Landing = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (formData.email !== "man@gmail.com" || formData.password !== "man123") {
      setErrorMessage("Invalid credentials. Please try again.");
      return;
    }
    try {
      const url = import.meta.env.VITE_SERVER_URL;
      const res = await axios.post(`${url}/manager/signin`, formData, {
        headers: { "Content-Type": "application/json" },
      });
      const data = res.data;
      localStorage.setItem("authTokenManager", data.token);
      localStorage.setItem("uid", data.user.uid);
      navigate("/manager");
    } catch (error) {
      console.error("Login error:", error.response?.data?.message || error.message);
      setErrorMessage(
        error.response?.data?.message || "Something went wrong. Please try again."
      );
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-black to-gray-800 flex flex-col">
      {/* Navbar with Default Manager Credentials */}
      <nav className="w-full bg-gray-900 py-4 shadow-md flex items-center justify-between px-6">
        <div className="flex flex-col">
          <h1 className="text-white text-xl font-bold">Default Credentials:</h1>
          <h3 className="text-white mt-1">email: man@gmail.com</h3>
          <h3 className="text-white">password: man123</h3>
        </div>
      </nav>

      {/* Main Manager Login Form */}
      <div className="flex flex-grow items-center justify-center">
        <div className="w-full max-w-md bg-gray-900 p-8 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold text-center text-white mb-6">
            Manager Login
          </h2>
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            
            {/* Display error message if any */}
            {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-md transition duration-200"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Landing;
