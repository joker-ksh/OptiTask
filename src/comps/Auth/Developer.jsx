import React, { useState } from "react";

const Developer = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    resume: null,
  });

  const [resumePreview, setResumePreview] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleResumeUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, resume: file });
      setResumePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Signup Data:", formData);
    // Add Firebase signup logic here
  };

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-black to-gray-800 flex items-center justify-center px-4">
      <div className="w-full max-w-5xl bg-gray-900 p-8 rounded-xl shadow-lg flex flex-col md:flex-row gap-8">
        {/* Left Side: Form Section */}
        <div className="w-full md:w-1/2">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Developer Signup
          </h2>
          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Full Name</label>
              <input
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Email */}
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

            {/* Password */}
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

            {/* Resume Upload */}
            <div className="mb-6">
              <label className="block text-gray-300 mb-2">Upload Resume (PDF)</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleResumeUpload}
                className="w-full bg-gray-800 text-gray-300 px-4 py-2 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-md transition duration-200"
            >
              Sign Up
            </button>
          </form>
        </div>

        {/* Right Side: Resume Preview */}
        <div className="w-full md:w-1/2 flex items-center justify-center">
          {resumePreview ? (
            <iframe
              src={resumePreview}
              className="w-full h-96 border border-gray-700 rounded-md shadow-md"
            ></iframe>
          ) : (
            <p className="text-gray-400 text-center">
              Resume preview will appear here after upload.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Developer;
