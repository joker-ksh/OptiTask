import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";
import { FiSend, FiTrash2, FiUserCheck, FiAlertCircle } from "react-icons/fi";

const Task = () => {
  const [assignedTask, setAssignedTask] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [messages, setMessages] = useState([
    { sender: "System", text: "Task discussion started", timestamp: new Date().toISOString() },
    {
      sender: "John Doe",
      text: "I'll start working on the frontend components",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      sender: "Jane Smith",
      text: "I'll set up the API endpoints",
      timestamp: new Date(Date.now() - 2700000).toISOString(),
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const currentSender = "Manager";

  const [taskProgress, setTaskProgress] = useState(50);
  const [isDeleted, setIsDeleted] = useState(false);

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const devsContainerRef = useRef(null);

  const [searchParams] = useSearchParams();
  const taskId = searchParams.get("taskId");

  // Auto-scroll on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Function to fetch task data
  const fetchTask = async () => {
    if (!taskId) return;
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_SERVER_URL}/manager/getTask`,
        { taskId }
      );

      if (!res.data || !res.data.id) {
        setAssignedTask(null);
        return;
      }

      const developersFromResponse = res.data.assignedDevelopers || [];
      const allCompleted =
        developersFromResponse.length > 0 &&
        developersFromResponse.every(
          (dev) => (dev.taskStatus || "In Progress") === "Completed"
        );
      const overallStatus = allCompleted ? "Completed" : "In Progress";

      const taskData = {
        id: res.data.id,
        title: res.data.task,
        status: res.data.taskStatus || overallStatus,
        deadline: res.data.deadline,
        taskLink: res.data.pdf,
        text: res.data.text,
        createdBy: res.data.createdBy,
        createdAt: res.data.createdAt,
      };

      setAssignedTask(taskData);
      setTaskProgress(overallStatus === "Completed" ? 100 : 50);
      setTeamMembers(developersFromResponse);
    } catch (e) {
      console.error("Error fetching task data:", e);
    }
  };

  // Fetch task on component mount
  useEffect(() => {
    fetchTask();
  }, [taskId]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const newMsg = {
        sender: currentSender,
        text: newMessage,
        timestamp: new Date().toISOString(),
      };
      setMessages([...messages, newMsg]);
      setNewMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Delete task
  const handleDeleteTask = async () => {
    if (!assignedTask) return;
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await axios.post(
          `${import.meta.env.VITE_SERVER_URL}/manager/deleteTask`,
          { taskId: assignedTask.id }
        );
        alert("Task deleted successfully");
        setIsDeleted(true);
      } catch (error) {
        console.error("Error deleting task:", error);
        alert("Failed to delete task");
      }
    }
  };

  // Refresh task data (after creation or updates)
  const refreshTask = async () => {
    await fetchTask();
  };

  // Ensure 4 team members
  const filledMembers = [
    ...teamMembers,
    ...Array(Math.max(0, 4 - teamMembers.length)).fill({
      uid: null,
      name: "Vacant",
      email: "Not Assigned",
      subtask: "",
    }),
  ];

  const myUid = localStorage.getItem("uid");
  const mySubtask =
    teamMembers.find((member) => member.uid === myUid)?.subtask || "No subtask assigned";

  if (isDeleted) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-black via-red-950 to-gray-900 flex items-center justify-center">
        <div className="relative p-8">
          <div className="absolute inset-0 bg-red-500/10 backdrop-blur-sm border border-red-500/30 transform rotate-1"></div>
          <div className="relative bg-gray-900/90 border-2 border-red-500 p-8 clip-path-polygon">
            <p className="text-3xl text-red-400 font-bold tracking-wide">TASK DELETED</p>
            <div className="mt-2 h-1 bg-gradient-to-r from-red-500 to-transparent"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex flex-col p-6 space-y-8">
      {/* Task Header with Edgy Design */}
      <div className="relative bg-gradient-to-r from-purple-800 to-indigo-800 p-8 rounded-xl border-2 border-gray-700 shadow-2xl overflow-hidden">
        {/* Geometric background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-32 h-32 bg-purple-400 transform rotate-45 -translate-x-16 -translate-y-16"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-indigo-400 transform rotate-12 translate-x-12 translate-y-12"></div>
        </div>
        
        {/* Top accent line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-indigo-400"></div>
        
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">
              {assignedTask?.title || "Task Details"}
            </h1>
            <div className="flex flex-wrap gap-3 items-center">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                assignedTask?.status === "Completed"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-yellow-500/20 text-yellow-400"
              }`}>
                {assignedTask?.status || "Loading..."}
              </span>
              <div className="flex items-center gap-2 text-purple-200">
                <FiAlertCircle className="flex-shrink-0" />
                <span>Deadline: {assignedTask?.deadline || "N/A"}</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleDeleteTask}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/90 hover:bg-red-600 text-white rounded-xl transition-all"
          >
            <FiTrash2 className="text-lg" />
            Delete Task
          </button>
        </div>
        
        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-indigo-400"></div>
      </div>

      {/* Centered Team Section with Edgy Design */}
      <div className="flex-1 flex justify-center items-start">
        <div className="w-full max-w-4xl bg-gray-800 rounded-2xl border border-gray-700 shadow-2xl relative overflow-hidden">
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-purple-400 rounded-tl-lg"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-purple-400 rounded-tr-lg"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-purple-400 rounded-bl-lg"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-purple-400 rounded-br-lg"></div>
          
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-purple-800 p-6 border-b border-gray-700 rounded-t-2xl">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
              <FiUserCheck className="text-purple-400" />
              Team Members
            </h2>
            <div className="mt-3 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent mx-auto w-48 rounded-full"></div>
          </div>
          
          {/* Team Members Grid */}
          <div className="p-8">
            <div ref={devsContainerRef} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-96 overflow-y-auto">
              {filledMembers.map((dev, index) => (
                <div
                  key={index}
                  className={`relative p-6 transition-all duration-300 rounded-xl ${
                    dev.uid 
                      ? "bg-gray-700 hover:bg-gray-600 border border-gray-600 hover:border-gray-500" 
                      : "bg-gray-800 border border-gray-700"
                  } group`}
                >

                  
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white">{dev.name}</span>
                    </div>
                    
                    {dev.techStack && (
                      <span className="text-xs text-purple-300 bg-purple-900 px-2 py-1 rounded-full">
                        {dev.techStack}
                      </span>
                    )}
                    
                    {dev.uid ? (
                      <>
                        <p className="text-sm text-gray-300 mb-2">
                          <span className="font-semibold">Subtask:</span> {dev.subtask}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs ${
                            dev.taskStatus === "Completed"
                              ? "bg-green-500/30 text-green-400"
                              : "bg-yellow-500/30 text-yellow-400"
                          }`}>
                            {dev.taskStatus || "In Progress"}
                          </span>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-400 italic">Unassigned</p>
                    )}
                  </div>
                  
                  {/* Hover effect lines */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-xl">
                    <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-purple-400 to-transparent rounded-t-xl"></div>
                    <div className="absolute bottom-0 right-0 w-full h-0.5 bg-gradient-to-l from-purple-400 to-transparent rounded-b-xl"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Bottom accent */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-purple-400 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default Task;