import React, { useState } from "react";

const Landing = () => {
  const [userType, setUserType] = useState("manager"); // Default to manager

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-black to-gray-800 flex flex-col">
      {/* Navbar */}
      <nav className="w-full bg-gray-900 py-4 shadow-md flex justify-center">
        <div className="flex gap-6">
          <button
            onClick={() => setUserType("manager")}
            className={`px-6 py-2 font-semibold rounded-md transition duration-200 ${
              userType === "manager"
                ? "bg-indigo-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            Manager
          </button>
          <button
            onClick={() => setUserType("developer")}
            className={`px-6 py-2 font-semibold rounded-md transition duration-200 ${
              userType === "developer"
                ? "bg-green-600 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
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
          <form>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Email</label>
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-300 mb-2">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-md transition duration-200"
            >
              Login
            </button>
          </form>
          <p className="text-gray-400 text-center mt-4">
            Don't have an account?{" "}
            <a
              href={userType === "manager" ? "/manager-signup" : "/developer-signup"}
              className="text-indigo-400 hover:underline"
            >
              Sign Up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
