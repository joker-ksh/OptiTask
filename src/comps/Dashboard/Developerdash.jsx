import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
const Developerdash = () => {
  const [assignedTask, setAssignedTask] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [manager, setManager] = useState(null);
  const [messages, setMessages] = useState([
    { id: 1, sender: "Alice", content: "Hello team!" },
    { id: 2, sender: "Charlie", content: "Please check your tasks." },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [taskStatus, setTaskStatus] = useState("In Progress");
  const [isPageLoading, setIsPageLoading] = useState(true);


  const navigate = useNavigate();


  // Fetch task data from the server and update state.
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const uid = localStorage.getItem("uid");
        const token = localStorage.getItem("authTokenDeveloper");
        const res = await fetch(
          import.meta.env.VITE_SERVER_URL + "/developer/myTask",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ uid }),
          }
        );
        const data = await res.json();
        console.log(data);

        if (!data || !data.id) {
          setAssignedTask(null);
          return;
        }

        const taskData = {
          id: data.id,
          title: data.task,
          status: data.status || "In Progress",
          deadline: data.deadline,
          taskLink: data.pdf,
        };

        const developersFromResponse = data.assignedDevelopers || [];
        setTeamMembers(developersFromResponse);

        const uidStored = localStorage.getItem("uid");
        const myDev = developersFromResponse.find(
          (member) => member.uid === uidStored
        );
        if (myDev && myDev.taskStatus === "Completed") {
          taskData.status = "Completed";
        }

        setAssignedTask(taskData);
        setTaskStatus(taskData.status);

        setManager({
          id: data.managerId,
          name: data.managerName,
          email: data.managerEmail,
        });
      } catch (e) {
        console.error("Error fetching task data:", e);
      } finally {
        setIsPageLoading(false);
      }
    };
    fetchTask();
  }, []);

  const handleSendMessage = () => {
    if (newMessage.trim() !== "") {
      const message = {
        id: messages.length + 1,
        sender: "You",
        content: newMessage.trim(),
      };
      setMessages([...messages, message]);
      setNewMessage("");
    }
  };

  const handleUpdateStatus = async () => {
    if (!assignedTask) return;
    try {
      const token = localStorage.getItem("authTokenDeveloper");
      const uid = localStorage.getItem("uid");
      console.log(uid, token, assignedTask.id, taskStatus);
      const response = await fetch(
        import.meta.env.VITE_SERVER_URL + "/developer/updateTask",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ taskId: assignedTask.id, status: taskStatus, uid: uid }),
        }
      );
      alert("Task status updated successfully");
      setAssignedTask({ ...assignedTask, status: taskStatus });
    } catch (error) {
      console.error("Error updating task status:", error);
      alert("Failed to update task status");
    }
  };

  const filledMembers = [
    ...teamMembers,
    ...Array(4 - teamMembers.length).fill({
      uid: null,
      name: "Vacant",
      email: "Not Assigned",
      subtask: "",
    }),
  ];

  const handleLogout = () => {
    localStorage.removeItem("authTokenDeveloper");
    localStorage.removeItem("uid");
    navigate('/');
  }
  const myUid = localStorage.getItem("uid");
  const mySubtask =
    teamMembers.find((member) => member.uid === myUid)?.subtask ||
    "No subtask assigned";
  const myName =
    teamMembers.find((member) => member.uid === myUid)?.name || "Developer";

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex justify-center items-center">
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/20">
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
            <p className="text-white text-xl font-medium">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Navigation Bar */}
      <nav className="backdrop-blur-md bg-white/10 border-b border-white/20 text-white p-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Welcome, {myName}!
            </h1>
            <p className="text-gray-300 text-sm mt-1">Developer Dashboard</p>
          </div>
          <button onClick={handleLogout} className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Assigned Task Section */}
          <div className="space-y-6">
            {!assignedTask ? (
              <div className="backdrop-blur-md bg-white/10 rounded-2xl border border-white/20 p-12 text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No Task Assigned</h3>
                <p className="text-gray-300">You don't have any active tasks at the moment.</p>
              </div>
            ) : (
              <div className="backdrop-blur-md bg-white/10 rounded-2xl border border-white/20 p-8 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg mr-3 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                      </svg>
                    </div>
                    Assigned Task
                  </h2>
                  <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    assignedTask.status === "Completed"
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : assignedTask.status === "In Progress"
                      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}>
                    {assignedTask.status}
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-3">
                      {assignedTask.title}
                    </h3>
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <p className="text-gray-300 text-sm mb-2">Your Subtask</p>
                      <p className="text-white font-semibold text-lg">{mySubtask}</p>
                    </div>
                  </div>

                  {assignedTask.taskLink && (
                    <a
                      href={assignedTask.taskLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                      </svg>
                      View Task Details
                    </a>
                  )}

                  {assignedTask.deadline && (
                    <div className="flex items-center text-gray-300">
                      <svg className="w-5 h-5 mr-2 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Deadline: {assignedTask.deadline}
                    </div>
                  )}

                  {assignedTask.status !== "Completed" && (
                    <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                      <h4 className="text-white font-semibold mb-4">Update Task Status</h4>
                      <div className="flex items-center space-x-4">
                        <select
                          value={taskStatus}
                          onChange={(e) => setTaskStatus(e.target.value)}
                          className="flex-1 p-3 bg-white/10 text-black border border-white/20 rounded-xl focus:border-purple-500 focus:outline-none backdrop-blur-md"
                        >
                          <option value="In Progress" className="text-black bg-white">In Progress</option>
                          <option value="Completed" className="text-black bg-white">Completed</option>
                        </select>
                        <button
                          onClick={handleUpdateStatus}
                          className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl transition-all duration-300 transform hover:scale-105"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Manager Details */}
            <div className="backdrop-blur-md bg-white/10 rounded-2xl border border-white/20 p-6">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded mr-3 flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                Manager Details
              </h3>
              {manager ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Manager Name</p>
                    <p className="text-lg font-semibold text-white">{manager.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400 mb-1">Email</p>
                    <p className="text-gray-300">{manager.email}</p>
                  </div>
                </div>
              ) : (
                <div className="animate-pulse">
                  <div className="h-4 bg-white/10 rounded mb-2"></div>
                  <div className="h-4 bg-white/10 rounded w-3/4"></div>
                </div>
              )}
            </div>
          </div>

          {/* Team Members Section */}
          <div className="backdrop-blur-md bg-white/10 rounded-2xl border border-white/20 p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg mr-3 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              Team Members
            </h2>
            
            <div className="space-y-4">
              {filledMembers.map((member, index) => (
                <div
                  key={index}
                  className={`p-6 rounded-xl border transition-all duration-300 ${
                    member.uid
                      ? "bg-white/5 border-white/10"
                      : "bg-gray-500/10 border-gray-500/20 opacity-60"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        member.uid
                          ? "bg-gradient-to-r from-blue-500 to-purple-500"
                          : "bg-gray-500"
                      }`}>
                        <span className="text-white font-semibold text-sm">
                          {member.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className={`font-semibold ${
                          member.uid ? "text-white" : "text-gray-400"
                        }`}>
                          {member.name}
                        </h4>
                        <p className="text-gray-400 text-sm">{member.email}</p>
                      </div>
                    </div>
                    {member.uid && member.uid === myUid && (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30">
                        You
                      </span>
                    )}
                  </div>
                  {member.subtask && (
                    <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/5">
                      <p className="text-xs text-gray-400 mb-1">Assigned Subtask</p>
                      <p className="text-yellow-400 text-sm font-medium">{member.subtask}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Developerdash;