import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

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
  
  // Local state for task progress (we set to 100 if completed, else 50)
  const [taskProgress, setTaskProgress] = useState(50);
  // New state for deletion flag
  const [isDeleted, setIsDeleted] = useState(false);
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const devsContainerRef = useRef(null);
  
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get("taskId");
  
  // Auto-scroll to bottom when new messages are added.
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Fetch task data using the taskId from the URL.
  useEffect(() => {
    const fetchTask = async () => {
      try {
        console.log("Task ID:", taskId);
        const res = await axios.post(
          `${import.meta.env.VITE_SERVER_URL}/manager/getTask`,
          { taskId }
        );
        console.log("Task Response:", res.data);
  
        if (!res.data || !res.data.id) {
          setAssignedTask(null);
          return;
        }
  
        // Determine overall task status based on assigned developers.
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
    if (taskId) {
      fetchTask();
    }
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
  
  // Delete task without auth header.
  const handleDeleteTask = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await axios.post(
          `${import.meta.env.VITE_SERVER_URL}/manager/deleteTask`,
          { taskId: assignedTask.id }
        );
        alert("Task deleted successfully");
        // Set deletion flag to true so that UI shows deletion message.
        setIsDeleted(true);
      } catch (error) {
        console.error("Error deleting task:", error);
        alert("Failed to delete task");
      }
    }
  };
  
  // Ensure there are always 4 team members.
  const filledMembers = [
    ...teamMembers,
    ...Array(Math.max(0, 4 - teamMembers.length)).fill({
      uid: null,
      name: "Vacant",
      email: "Not Assigned",
      subtask: "",
    }),
  ];
  
  // Get the logged-in developer's subtask.
  const myUid = localStorage.getItem("uid");
  const mySubtask =
    teamMembers.find((member) => member.uid === myUid)?.subtask || "No subtask assigned";
  
  // If task has been deleted, show a centered message.
  if (isDeleted) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-black to-gray-800 flex items-center justify-center">
        <p className="text-3xl text-red-500 font-bold">Task has been deleted.</p>
      </div>
    );
  }
  
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-black to-gray-800 flex flex-col p-6">
      {/* Navbar */}
      <nav className="w-full bg-gray-900 text-white p-4 flex justify-between items-center rounded-lg shadow-lg">
        <div className="flex flex-col">
          <h1 className="text-3xl font-extrabold">
            Task Name: {assignedTask ? assignedTask.title : "N/A"}
          </h1>
          <div className="mt-2">
            <div
              className={`px-4 py-2 rounded-md text-white font-bold ${
                assignedTask && assignedTask.status === "Completed"
                  ? "bg-green-500"
                  : "bg-yellow-500"
              }`}
            >
              {assignedTask && assignedTask.status ? assignedTask.status : "N/A"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-yellow-500 text-white rounded-md">
            Deadline: {assignedTask ? assignedTask.deadline : "N/A"}
          </span>
          <button
            onClick={handleDeleteTask}
            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md"
          >
            Delete Task
          </button>
        </div>
      </nav>
  
      <div className="flex flex-col md:flex-row gap-6 mt-6 h-[calc(100vh-140px)]">
        {/* Developers Section */}
        <div className="w-full md:w-1/2 bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-700 flex flex-col">
          <h2 className="text-xl font-semibold text-white mb-4">Assigned Developers</h2>
          <div ref={devsContainerRef} className="flex-1 overflow-y-auto pr-2">
            <ul className="space-y-4">
              {filledMembers.map((dev, index) => {
                const devStatus = dev.uid ? (dev.taskStatus || "In Progress") : null;
                const bgColor = dev.uid
                  ? devStatus === "Completed"
                    ? "bg-green-600 border-green-700"
                    : "bg-yellow-600 border-yellow-600"
                  : "bg-gray-700 border-gray-600";
                return (
                  <li key={index} className={`p-4 rounded-md border ${bgColor} text-white`}>
                    <div className="mb-2">
                      <span className="font-bold text-lg">{dev.name}</span>
                      {dev.techStack && (
                        <span className="ml-2 text-sm text-gray-300">
                          ({dev.techStack})
                        </span>
                      )}
                    </div>
                    <div className="mb-2">
                      <span className="font-semibold">Subtask: </span>
                      <span>{dev.subtask}</span>
                    </div>
                    {dev.uid && (
                      <div>
                        <span className="font-semibold">Status: </span>
                        <span
                          className={`px-2 py-1 rounded-md text-white text-sm ${
                            devStatus === "Completed" ? "bg-green-500" : "bg-yellow-500"
                          }`}
                        >
                          {devStatus}
                        </span>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
  
        {/* Chat Section */}
        <div className="w-full md:w-1/2 bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-700 flex flex-col">
          <h2 className="text-xl font-semibold text-white mb-4">Task Discussion</h2>
          <div ref={chatContainerRef} className="flex-1 bg-gray-800 p-4 rounded-lg overflow-y-auto">
            {messages.length > 0 ? (
              <div className="space-y-3">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`p-2 rounded-md ${
                      msg.sender === "System"
                        ? "bg-gray-700 text-gray-400 italic"
                        : "bg-gray-700 text-white"
                    }`}
                  >
                    <div className="flex justify-between">
                      <strong
                        className={msg.sender === "System" ? "text-gray-400" : "text-indigo-400"}
                      >
                        {msg.sender}
                      </strong>
                      <span className="text-xs text-gray-500">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="mt-1">{msg.text}</p>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            ) : (
              <p className="text-gray-400">No messages yet...</p>
            )}
          </div>
          <div className="mt-4 flex">
            <textarea
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              rows="2"
            />
            <button
              onClick={sendMessage}
              className="ml-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition duration-200"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Task;
