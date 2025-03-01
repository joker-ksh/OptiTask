import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
const DeveloperSignUp = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    resume: null,
  });

  const [resumePreview, setResumePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadStatusColor, setUploadStatusColor] = useState("text-blue-400"); // Default color (blue)
  const navigate = useNavigate();
  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Resume Upload
  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("File selected:", file.name);
      setFormData({ ...formData, resume: file });
      setResumePreview(URL.createObjectURL(file));
      setUploadStatus("Uploading...");
      setUploadStatusColor("text-blue-400"); // Set to blue while uploading
      await uploadToCloudinary(file);
    }
  };

  // Upload Resume to Cloudinary
  const uploadToCloudinary = async (file) => {
    const cloudName = import.meta.env.VITE_APP_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_APP_CLOUDINARY_UPLOAD_PRESET;

    console.log("Cloudinary Cloud Name:", cloudName);
    console.log("Cloudinary Upload Preset:", uploadPreset);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      setUploading(true);
      setUploadStatus("Uploading...");
      setUploadStatusColor("text-blue-400"); // Set to blue while uploading

      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
        formData
      );
      console.log("Cloudinary Upload Response:", res.data);

      setFormData((prev) => {
        const updatedFormData = { ...prev, resume: res.data.secure_url };
        console.log("Updated Form Data:", updatedFormData);
        return updatedFormData;
      });

      setUploadStatus("Upload successful!");
      setUploadStatusColor("text-green-400"); // Green on success
    } catch (error) {
      console.error("Cloudinary Upload Error:", error);
      setUploadStatus("Upload failed. Try again.");
      setUploadStatusColor("text-red-400"); // Red on failure
    } finally {
      setUploading(false);
    }
  };

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Signup Data:", formData);

    // Send form data to backend
    axios
      .post("http://localhost:5000/developer/signup", formData)
      .then((res) => {
        console.log("Signup Response:", res.data);
        navigate(`/developerdash?${formData.email}`);
      })
      .catch((error) => {
        console.error("Signup Error:", error);
        alert("Signup failed. Try again.");
      });   
  };

  return (
    <div className="w-screen min-h-screen bg-gradient-to-br from-black to-gray-800 flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-5xl bg-gray-900 p-6 md:p-8 rounded-xl shadow-lg flex flex-col md:flex-row gap-6">
        {/* Left Side: Form Section */}
        <div className="w-full md:w-1/2">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">
            Developer Signup
          </h2>
          <form onSubmit={handleSubmit}>
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
            {uploadStatus && <p className={`text-center ${uploadStatusColor}`}>{uploadStatus}</p>}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-md transition duration-200"
            >
              Sign Up
            </button>
          </form>
        </div>
        <div className="w-full md:w-1/2 flex items-center justify-center">
          {resumePreview ? (
            <div className="w-full">
              <iframe
                src={resumePreview}
                className="hidden md:block w-full h-96 border border-gray-700 rounded-md shadow-md"
              ></iframe>
              <a
                href={resumePreview}
                download="resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="md:hidden block text-indigo-400 text-center mt-4 underline"
              >
                Open Resume
              </a>
            </div>
          ) : (
            <p className="text-gray-400 text-center text-sm md:text-base">
              Resume preview will appear here after upload.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeveloperSignUp;