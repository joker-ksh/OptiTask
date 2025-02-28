import React, { useState, useEffect, useRef } from "react";

const Developerdash = () => {
  const [assignedTask, setAssignedTask] = useState({
    id: 1,
    title: "Implement Feature X",
    description: "Develop the UI and backend for Feature X.",
    status: "In Progress",
  });

  const [taskRemoved, setTaskRemoved] = useState(false);
  const manager = { name: "Charlie", email: "charlie@company.com" };

  const [teamMembers] = useState([
    { id: 1, name: "Alice", email: "alice@company.com" },
    { id: 2, name: "Bob", email: "bob@company.com" },
  ]);

  const [messages, setMessages] = useState([
    { id: 1, sender: "Alice", content: "Hello team!" },
    { id: 2, sender: "Charlie", content: "Please check your tasks." },
  ]);
  const [newMessage, setNewMessage] = useState("");

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

  const filledMembers = [
    ...teamMembers,
    ...Array(4 - teamMembers.length).fill({ id: null, name: "Vacant", email: "Not Assigned" }),
  ];

  const leftSectionRef = useRef(null);
  const [leftSectionHeight, setLeftSectionHeight] = useState("auto");

  useEffect(() => {
    if (leftSectionRef.current) {
      setLeftSectionHeight(`${leftSectionRef.current.offsetHeight}px`);
    }
  }, [filledMembers]);

  return (
    <div className="min-h-screen bg-gray-800 p-6 flex flex-col gap-6">
      <nav className="w-full bg-indigo-900 text-white p-4 flex justify-between items-center rounded-lg shadow-lg">
        <h1 className="text-lg font-semibold">Developer Dashboard</h1>
        <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition duration-200">
          Logout
        </button>
      </nav>

      <div className="flex flex-col md:flex-row gap-6">
        {!taskRemoved && (
          <div ref={leftSectionRef} className="flex flex-col gap-6 w-full md:w-1/2">
            <div className="bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-3">Assigned Task</h2>
              <h3 className="text-lg font-bold text-indigo-400">{assignedTask.title}</h3>
              <p className="text-gray-300 mt-2">{assignedTask.description}</p>
              <p className="mt-2 text-gray-400">
                Status:
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
              <div className="bg-gray-800 p-4 rounded-md mt-4 border border-gray-600">
                <h2 className="text-lg font-semibold text-white">Manager Details</h2>
                <p className="text-gray-300">
                  <span className="font-bold text-indigo-400">{manager.name}</span>
                  <br />
                  <span className="text-sm text-gray-400">{manager.email}</span>
                </p>
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
                      member.id ? "bg-gray-800 border-gray-700" : "bg-gray-700 border-gray-600"
                    }`}
                  >
                    <p className="text-gray-200 font-bold">{member.name}</p>
                    <p className="text-gray-400 text-sm">{member.email}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {taskRemoved && (
          <div className="w-full md:w-1/2 flex justify-center items-center">
            <p className="text-gray-400 text-lg font-semibold">No task assigned</p>
          </div>
        )}

        <div
          className="bg-gray-900 p-6 rounded-lg shadow-lg w-full md:w-1/2 border border-gray-700 flex flex-col"
          style={{ height: leftSectionHeight }}
        >
          <h2 className="text-xl font-semibold text-white mb-4">Group Chat</h2>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2" style={{ maxHeight: "80%" }}>
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