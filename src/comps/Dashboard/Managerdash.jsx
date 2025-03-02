import React, { useState, useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Managerdash = () => {
  const [taskData, setTaskData] = useState({
    task: "",
    pdf: null,
    deadline: "",
  });
  const [taskPreview, setTaskPreview] = useState(null);
  const [tasks, setTasks] = useState([
    { id: 1, task: "Task A", deadline: "2025-03-10" },
    { id: 2, task: "Task B", deadline: "2025-04-15" },
    { id: 3, task: "Task C", deadline: "2025-05-20" },
  ]);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  const [noTeamAvailable, setNoTeamAvailable] = useState(false);

  const handleChange = (e) => {
    setTaskData({ ...taskData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setTaskPreview(URL.createObjectURL(file));
      setUploadStatus("Uploading...");
      setUploading(true);
      await uploadToCloudinary(file);
    }
  };

  const uploadToCloudinary = async (file) => {
    const cloudName = import.meta.env.VITE_APP_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_APP_CLOUDINARY_UPLOAD_PRESET;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
      setUploading(true);
      setUploadStatus("Uploading...");
      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
        formData
      );
      setTaskData((prev) => ({ ...prev, pdf: res.data.secure_url }));
      setUploadStatus("Upload successful!");
    } catch (error) {
      setUploadStatus("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (uploading) return;
    if (!taskData.pdf) {
      setUploadStatus("Please upload a PDF before submitting.");
      return;
    }

    try {
      const token = localStorage.getItem("authTokenManager");
      const uid = localStorage.getItem("uid"); // Fetch the UID from localStorage

      if (!token || !uid) {
        setUploadStatus("Not authenticated. Please log in again.");
        return;
      }

      setUploading(true);

      const response = await axios.post(
        "http://localhost:5000/manager/createtask",
        { ...taskData, uid }, // Include the UID in the body of the request
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        toast.success("Task created successfully!", {
          position: "top-right",
          autoClose: 3000,
        });

        setTasks([...tasks, { ...taskData, id: tasks.length + 1 }]);
        setTaskData({ task: "", pdf: null, deadline: "" });
        setTaskPreview(null);
        setUploadStatus("");
      }
    } catch (error) {
      console.error("Error creating task:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to create task.", {
        position: "top-right",
        autoClose: 3000,
      });
      setNoTeamAvailable(true);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-screen min-h-screen bg-gradient-to-br from-black to-gray-800 flex flex-col p-6">
      <ToastContainer />
      <nav className="w-full bg-gray-900 text-white p-4 flex justify-between items-center rounded-lg shadow-lg">
        <h1 className="text-lg font-semibold">Manager's Dashboard</h1>
        <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md">Logout</button>
      </nav>

      <div className="flex flex-col md:flex-row gap-6 mt-6">
        <div className="w-full md:w-1/3 bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-700 max-h-[70vh] overflow-y-auto">
          <h2 className="text-xl font-semibold text-white mb-4">Create Task</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="task"
              placeholder="Task Name"
              value={taskData.task}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
            />
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileUpload}
              required
              disabled={uploading}
              className="w-full bg-gray-800 text-gray-300 px-4 py-2 border border-gray-700 rounded-md"
            />
            {uploadStatus && <p className="mt-2 text-sm text-blue-400">{uploadStatus}</p>}
            {taskPreview && (
              <iframe src={taskPreview} className="w-full h-48 border border-gray-700 rounded-md shadow-md mb-4"></iframe>
            )}
            <input
              type="date"
              name="deadline"
              value={taskData.deadline}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white"
            />

            {noTeamAvailable && (
              <p className="text-red-400 mt-2 text-center">No team is available currently.</p>
            )}

            <button
              type="submit"
              disabled={uploading}
              className={`w-full ${uploading ? "bg-gray-600" : "bg-indigo-600"} hover:${uploading ? "" : "bg-indigo-700"} text-white font-semibold py-3 rounded-md`}
            >
              {uploading ? (
                <div className="w-5 h-5 border-4 border-white border-t-transparent animate-spin rounded-full mx-auto"></div>
              ) : (
                "Create Task"
              )}
            </button>
          </form>
        </div>
        <div className="w-full md:w-2/3 bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-700 overflow-y-auto max-h-[70vh]">
          <h2 className="text-xl font-semibold text-white mb-4">Created Tasks</h2>
          <ul className="space-y-3">
            {tasks.map((task) => (
              <li key={task.id} className="p-3 bg-gray-800 border border-gray-700 rounded-md text-white flex justify-between">
                <span>{task.task}</span>
                <span className="px-2 py-1 bg-red-600 text-white rounded-md text-sm">{task.deadline}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Managerdash;
