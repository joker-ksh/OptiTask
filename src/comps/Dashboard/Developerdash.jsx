import React, { useState, useEffect } from "react";
import axios from "axios";

const Developerdash = () => {
  const [assignedTask, setAssignedTask] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [manager, setManager] = useState(null);
  const [taskRemoved, setTaskRemoved] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, sender: "Alice", content: "Hello team!" },
    { id: 2, sender: "Charlie", content: "Please check your tasks." },
  ]);
  const [newMessage, setNewMessage] = useState("");

  // Fetch task data from the server and update state.
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const uid = localStorage.getItem("uid");
        const token = localStorage.getItem("authTokenDeveloper");
        const res = await axios.post(
          import.meta.env.VITE_SERVER_URL +"/developer/myTask",
          { uid },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(res.data);

        if (!res.data || !res.data.id) {
          setAssignedTask(null);
          return;
        }

        // Map JSON fields to our state.
        setAssignedTask({
          id: res.data.id,
          title: res.data.task,
          status: "In Progress", // Default status.
          deadline: res.data.deadline,
          taskLink: res.data.pdf,
        });
        // Set team members from the assignedDevelopers array.
        setTeamMembers(res.data.assignedDevelopers);
        // Set manager details.
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

  const handleLeaveTask = () => {
    setTaskRemoved(true);
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
    <div className="min-h-screen bg-gray-800 p-6 flex flex-col gap-6">
      <nav className="w-full bg-indigo-900 text-white p-4 flex justify-between items-center rounded-lg shadow-lg">
        <h1 className="text-lg font-semibold">Developer Dashboard</h1>
        <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition duration-200">
          Logout
        </button>
      </nav>

      {/* Use items-stretch so both columns have equal height */}
      <div className="flex flex-col md:flex-row gap-6 items-stretch">
        {(!assignedTask || taskRemoved) ? (
          <div className="w-full md:w-1/2 flex justify-center items-center">
            <p className="text-gray-400 text-lg font-semibold">No task assigned</p>
          </div>
        ) : (
          <div className="flex flex-col gap-6 w-full md:w-1/2">
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-700 flex flex-col">
              <h2 className="text-xl font-semibold text-white mb-3">Assigned Task</h2>
              <h3 className="text-4xl font-bold text-green-500">{assignedTask.title}</h3>
              {/* Display logged-in developer's subtask in yellow */}
              <p className="text-white mt-2 font-bold">
                <span className="text-indigo-300 text-xl">Your Subtask : </span> {mySubtask}
              </p>
              {assignedTask.taskLink && (
                <a
                  href={assignedTask.taskLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-400 underline mt-2 block"
                >
                  Task Link
                </a>
              )}
              <p className="mt-2 text-gray-400">
                Status:{" "}
                <span
                  className={`font-bold ${
                    assignedTask.status === "Completed"
                      ? "text-green-500"
                      : assignedTask.status === "In Progress"
                      ? "text-yellow-500"
                      : "text-red-500"
                  }`}
                >
                  {assignedTask.status}
                </span>
              </p>
              {assignedTask.deadline && (
                <p className="text-gray-300 mt-2">Deadline: {assignedTask.deadline}</p>
              )}
              <div className="bg-gray-800 p-4 rounded-md mt-4 border border-gray-600">
                <h2 className="text-lg font-semibold text-white">Manager Details</h2>
                {manager ? (
                  <p className="text-gray-300">
                    <span className="font-bold text-indigo-400">{manager.name}</span>
                    <br />
                    <span className="text-sm text-gray-400">{manager.email}</span>
                  </p>
                ) : (
                  <p className="text-gray-300">Loading manager details...</p>
                )}
              </div>
              <button
                onClick={handleLeaveTask}
                className="w-full mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition duration-200"
              >
                Leave Task
              </button>
            </div>

            <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-3">Team Members</h2>
              <ul className="space-y-3">
                {filledMembers.map((member, index) => (
                  <li
                    key={index}
                    className={`p-3 rounded-md border ${
                      member.uid ? "bg-gray-800 border-gray-700" : "bg-gray-700 border-gray-600"
                    }`}
                  >
                    <p className="text-gray-200 font-bold">{member.name}</p>
                    <p className="text-gray-400 text-sm">{member.email}</p>
                    {member.subtask && (
                      <p className="text-yellow-500 text-sm mt-1">{member.subtask}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Group Chat Container */}
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-full md:w-1/2 border border-gray-700 flex flex-col">
          <h2 className="text-xl font-semibold text-white mb-4">Group Chat</h2>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {messages.map((msg) => (
              <div key={msg.id} className="bg-gray-800 p-3 rounded-md">
                <p className="text-gray-400 text-sm">
                  <strong>{msg.sender}:</strong>
                </p>
                <p className="text-gray-300">{msg.content}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex">
            <input
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-l-md text-white focus:outline-none"
            />
            <button
              onClick={handleSendMessage}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-r-md transition duration-200"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Developerdash;
