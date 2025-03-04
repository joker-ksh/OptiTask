import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const Task = () => {
  const [assignedTask, setAssignedTask] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [manager, setManager] = useState(null);
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

  // New state for task progress (0 to 100)
  const [taskProgress, setTaskProgress] = useState(50); // Default to 50%

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const devsContainerRef = useRef(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch task data from the backend (single API endpoint)
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const uid = localStorage.getItem("uid");
        const token = localStorage.getItem("authTokenDeveloper");
        const res = await axios.post(
          import.meta.env.VITE_SERVER_URL + "/developer/myTask",
          { uid },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(res.data);

        if (!res.data || !res.data.id) {
          setAssignedTask(null);
          return;
        }

        // Map JSON fields from the API response to our state.
        const taskData = {
          id: res.data.id,
          title: res.data.task,
          status: res.data.taskStatus || "In Progress",
          deadline: res.data.deadline,
          taskLink: res.data.pdf,
          text: res.data.text,
          createdBy: res.data.createdBy,
          createdAt: res.data.createdAt,
        };

        setAssignedTask(taskData);
        setTaskStatus(taskData.status);
        setTeamMembers(res.data.assignedDevelopers || []);
        setManager({
          id: res.data.managerId,
          name: res.data.managerName,
          email: res.data.managerEmail,
        });
      } catch (e) {
        console.error("Error fetching task data:", e);
      }
    };
    fetchTask();
  }, []);

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

  const handleDeleteTask = () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      // Replace this alert with your actual deletion logic or API call.
      alert("Task deleted");
    }
  };

  // Fill in vacant team member slots so that there are always 4 items.
  const filledMembers = [
    ...teamMembers,
    ...Array(4 - teamMembers.length).fill({
      uid: null,
      name: "Vacant",
      email: "Not Assigned",
      subtask: "",
    }),
  ];

  // Get the logged-in developer's subtask.
  const myUid = localStorage.getItem("uid");
  const mySubtask =
    teamMembers.find((member) => member.uid === myUid)?.subtask ||
    "No subtask assigned";

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-black to-gray-800 flex flex-col p-6">
      {/* Navbar with Task Name, Progress Indicator, Deadline, and Delete Task button */}
      <nav className="w-full bg-gray-900 text-white p-4 flex justify-between items-center rounded-lg shadow-lg">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold">Task Name: {assignedTask ? assignedTask.title : "N/A"}</h1>
          <div className="flex items-center gap-2">
            <span
              className={`h-3 w-3 rounded-full ${assignedTask && assignedTask.status === "Completed" ? "bg-green-500" : "bg-yellow-500"}`}
            ></span>
            <span>{assignedTask && assignedTask.status ? assignedTask.status : "N/A"}</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-red-600 text-white rounded-md">
            Deadline: {assignedTask ? assignedTask.deadline : "N/A"}
          </span>
          <button onClick={handleDeleteTask} className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md">
            Delete Task
          </button>
        </div>
      </nav>

      <div className="flex flex-col md:flex-row gap-6 mt-6 h-[calc(100vh-140px)]">
        {/* Developers Section */}
        <div className="w-full md:w-1/2 bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-700 flex flex-col">
          <h2 className="text-xl font-semibold text-white mb-4">Assigned Developers</h2>
          <div ref={devsContainerRef} className="flex-1 overflow-y-auto pr-2">
            <ul className="space-y-3">
              {filledMembers.map((dev, index) => (
                <li
                  key={index}
                  className={`p-3 rounded-md border ${
                    dev.uid
                      ? dev.taskStatus === "Completed"
                        ? "bg-green-600 border-green-700"
                        : "bg-yellow-600 border-yellow-600"
                      : "bg-gray-700 border-gray-600"
                  }`}
                >
                  <p className="text-white font-bold">{dev.name}</p>
                  <p className="text-gray-200 text-sm">{dev.email}</p>
                  {dev.techStack && (
                    <p className="text-gray-200 text-sm">Tech: {dev.techStack}</p>
                  )}
                  {dev.subtask && (
                    <p className="text-gray-200 text-sm mt-1">Subtask: {dev.subtask}</p>
                  )}
                </li>
              ))}
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
                      msg.sender === "System" ? "bg-gray-700 text-gray-400 italic" : "bg-gray-700 text-white"
                    }`}
                  >
                    <div className="flex justify-between">
                      <strong className={msg.sender === "System" ? "text-gray-400" : "text-indigo-400"}>
                        {msg.sender}
                      </strong>
                      <span className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleTimeString()}</span>
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
