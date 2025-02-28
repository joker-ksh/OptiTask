import React, { useState } from "react";

const Managerdash = () => {
  const [taskData, setTaskData] = useState({
    name: "",
    pdf: null,
    deadline: ""
  });
  const [taskPreview, setTaskPreview] = useState(null);
  const [tasks, setTasks] = useState([
    { id: 1, name: "Task A", deadline: "2025-03-10" },
    { id: 2, name: "Task B", deadline: "2025-04-15" },
    { id: 3, name: "Task C", deadline: "2025-05-20" }
  ]);

  const handleChange = (e) => {
    setTaskData({ ...taskData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTaskData({ ...taskData, pdf: file });
      setTaskPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTasks([...tasks, { ...taskData, id: tasks.length + 1 }]);
    setTaskData({ name: "", pdf: null, deadline: "" });
    setTaskPreview(null);
  };

  return (
    <div className="w-screen min-h-screen bg-gradient-to-br from-black to-gray-800 flex flex-col p-6">
      {/* Navbar */}
      <nav className="w-full bg-gray-900 text-white p-4 flex justify-between items-center rounded-lg shadow-lg">
        <h1 className="text-lg font-semibold">Manager's Dashboard</h1>
        <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition duration-200">
          Logout
        </button>
      </nav>

      {/* Main Content */}
      <div className="flex flex-col md:flex-row gap-6 mt-6">
        {/* Left Side - Task Creation Form & Upload Preview */}
        <div className="w-full md:w-1/3 bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-700 max-h-[70vh] overflow-y-auto">
          <h2 className="text-xl font-semibold text-white mb-4">Create Task</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Task Name</label>
              <input
                type="text"
                name="name"
                value={taskData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Upload Task (PDF)</label>
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileUpload}
                className="w-full bg-gray-800 text-gray-300 px-4 py-2 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            {taskPreview && (
              <iframe
                src={taskPreview}
                className="w-full h-48 border border-gray-700 rounded-md shadow-md mb-4"
              ></iframe>
            )}
            <div>
              <label className="block text-gray-300 mb-2">Deadline</label>
              <input
                type="date"
                name="deadline"
                value={taskData.deadline}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-md transition duration-200"
            >
              Create Task
            </button>
          </form>
        </div>

        {/* Right Side - Task List */}
        <div className="w-full md:w-2/3 bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-700 overflow-y-auto max-h-[70vh]">
          <h2 className="text-xl font-semibold text-white mb-4">Created Tasks</h2>
          <ul className="space-y-3">
            {tasks.map((task, index) => (
              <li
                key={index}
                className="p-3 bg-gray-800 border border-gray-700 rounded-md text-white cursor-pointer hover:bg-gray-700 transition flex justify-between items-center"
              >
                <span>{task.name}</span>
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
