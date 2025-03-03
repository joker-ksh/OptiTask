import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Landing = () => {
  const [userType, setUserType] = useState("manager");
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState(""); // 🔴 State for error messages
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // Reset error message before attempting login
    console.log(`Logging in as ${userType}...`);
    console.log("User Credentials:", formData);

    try {
      let res;
      const url = import.meta.env.VITE_SERVER_URL;
      console.log(url)
      if (userType === "manager") {
        res = await axios.post(`${url}/manager/signin`, formData, {
          headers: { "Content-Type": "application/json" },
        });
        
        const data = res.data; 
        localStorage.setItem("authTokenManager", data.token);
        localStorage.setItem("uid", data.user.uid);
        // console.log(res);
        navigate(`/managerdash`);
      } 
      // Developer login logic
      else {
        res = await axios.post(import.meta.env.VITE_SERVER_URL+"/developer/signin", formData, {
          headers: { "Content-Type": "application/json" },
        });
        const data = res.data; 
        // console.log(data);
        // console.log(data.token);
        // console.log(data.uid);
        localStorage.setItem("authTokenDeveloper", data.token);
        localStorage.setItem("uid", data.uid);
        console.log(res);
        navigate(`/developerdash`);
      }

      console.log(`${userType} logged in successfully`);
    } catch (error) {
      console.error("Login error:", error.response?.data?.message || error.message);
      setErrorMessage(error.response?.data?.message || "Something went wrong. Please try again."); // 🔴 Set error message from server
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-black to-gray-800 flex flex-col">
      {/* Navbar */}
      <nav className="w-full bg-gray-900 py-4 shadow-md flex justify-center">
        <div className="flex gap-6">
          <button
            onClick={() => setUserType("manager")}
            className={`px-6 py-2 font-semibold rounded-md transition duration-200 ${
              userType === "manager" ? "bg-indigo-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Manager
          </button>
          <button
            onClick={() => setUserType("developer")}
            className={`px-6 py-2 font-semibold rounded-md transition duration-200 ${
              userType === "developer" ? "bg-green-600 text-white" : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Developer
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-grow items-center justify-center">
        <div className="w-full max-w-md bg-gray-900 p-8 rounded-xl shadow-lg">
          <h2 className="text-3xl font-bold text-center text-white mb-6">
            {userType === "manager" ? "Manager Login" : "Developer Login"}
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
            
            {/* 🔴 Error message displayed here */}
            {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-md transition duration-200"
            >
              Login
            </button>
          </form>
          <p className="text-gray-400 text-center mt-4">
            Don't have an account?{" "}
            <Link to={userType === "manager" ? "/managerSignUp" : "/DeveloperSignUp"} className="text-indigo-400 hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
