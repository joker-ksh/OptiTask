import React, { useState, useEffect, useRef } from "react";

const Task = () => {
  const [developers, setDevelopers] = useState([
    { id: 1, name: "John Doe", techStack: "React" },
    { id: 2, name: "Jane Smith", techStack: "Node.js" },
    { id: 3, name: "Alice Johnson", techStack: "Python" },
  ]);

  const [availableDevs, setAvailableDevs] = useState([
    { id: 4, name: "Bob Brown", techStack: "React" },
    { id: 5, name: "Charlie White", techStack: "Node.js" },
    { id: 6, name: "Diana Green", techStack: "Python" },
  ]);

  const [replacingDev, setReplacingDev] = useState(null);
  const [messages, setMessages] = useState([
    { sender: "System", text: "Task discussion started", timestamp: new Date().toISOString() },
    { sender: "John Doe", text: "I'll start working on the frontend components", timestamp: new Date(Date.now() - 3600000).toISOString() },
    { sender: "Jane Smith", text: "I'll set up the API endpoints", timestamp: new Date(Date.now() - 2700000).toISOString() },
  ]);
  const [newMessage, setNewMessage] = useState("");
  // Using a fixed sender "Manager" instead of allowing selection
  const currentSender = "Manager";
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const devsContainerRef = useRef(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleReplace = (devId) => {
    // Cancel replacement if clicking the same developer again
    if (replacingDev === devId) {
      setReplacingDev(null);
    } else {
      setReplacingDev(devId);
    }
  };

  const assignNewDev = (newDevId) => {
    if (!newDevId) return;
    
    // Find the developer being replaced
    const oldDev = developers.find(dev => dev.id === replacingDev);
    
    // Find the new developer
    const newDev = availableDevs.find(dev => dev.id === parseInt(newDevId));
    
    if (!oldDev || !newDev) return;
    
    // Update the developers list
    const updatedDevelopers = developers.map(dev => 
      dev.id === replacingDev ? { ...newDev, id: dev.id } : dev
    );
    
    // Update available developers by removing the selected one and adding the replaced one
    const updatedAvailableDevs = [
      ...availableDevs.filter(dev => dev.id !== newDev.id),
      { id: newDev.id, name: oldDev.name, techStack: oldDev.techStack }
    ];
    
    // Add a system message about the replacement
    const replacementMessage = {
      sender: "System",
      text: `${oldDev.name} has been replaced with ${newDev.name}`,
      timestamp: new Date().toISOString()
    };
    
    setDevelopers(updatedDevelopers);
    setAvailableDevs(updatedAvailableDevs);
    setMessages([...messages, replacementMessage]);
    setReplacingDev(null);
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      const newMsg = {
        sender: currentSender,
        text: newMessage,
        timestamp: new Date().toISOString()
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

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-black to-gray-800 flex flex-col p-6">
      <nav className="w-full bg-gray-900 text-white p-4 flex justify-between items-center rounded-lg shadow-lg">
        <h1 className="text-lg font-semibold">Task Name</h1>
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-red-600 text-white rounded-md">Deadline: 2025-03-10</span>
          <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition duration-200">
            Logout
          </button>
        </div>
      </nav>

      <div className="flex flex-col md:flex-row gap-6 mt-6 h-[calc(100vh-120px)]">
        {/* Developers Section */}
        <div className="w-full md:w-1/2 bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-700 flex flex-col">
          <h2 className="text-xl font-semibold text-white mb-4">Assigned Developers</h2>
          <div 
            ref={devsContainerRef}
            className="flex-1 overflow-y-auto pr-2"
          >
            <ul className="space-y-3">
              {developers.map((dev) => (
                <li
                  key={dev.id}
                  className="p-3 bg-gray-800 border border-gray-700 rounded-md text-white flex justify-between items-center"
                >
                  <span>{dev.name} ({dev.techStack})</span>
                  <button
                    onClick={() => handleReplace(dev.id)}
                    className={`${
                      replacingDev === dev.id 
                        ? "bg-red-500 hover:bg-red-600" 
                        : "bg-yellow-500 hover:bg-yellow-600"
                    } px-3 py-1 rounded-md text-black transition duration-200`}
                  >
                    {replacingDev === dev.id ? "Cancel" : "Replace"}
                  </button>
                </li>
              ))}
            </ul>

            {replacingDev !== null && (
              <div className="mt-4 bg-gray-800 p-4 border border-gray-700 rounded-md">
                <h3 className="text-white mb-2">Select New Developer</h3>
                <select
                  className="w-full bg-gray-700 text-white p-2 rounded-md"
                  onChange={(e) => assignNewDev(e.target.value)}
                  defaultValue=""
                >
                  <option value="" disabled>Select Developer</option>
                  {availableDevs.map((dev) => (
                    <option key={dev.id} value={dev.id}>
                      {dev.name} ({dev.techStack})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mt-4">
              <h3 className="text-white mb-2">Available Developers</h3>
              <ul className="space-y-2">
                {availableDevs.map((dev) => (
                  <li
                    key={dev.id}
                    className="p-2 bg-gray-800 border border-gray-700 rounded-md text-gray-300"
                  >
                    {dev.name} ({dev.techStack})
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Chat Section - Removed dropdown from header */}
        <div className="w-full md:w-1/2 bg-gray-900 p-6 rounded-lg shadow-lg border border-gray-700 flex flex-col">
          <h2 className="text-xl font-semibold text-white mb-4">Task Discussion</h2>
          
          <div 
            ref={chatContainerRef}
            className="flex-1 bg-gray-800 p-4 rounded-lg overflow-y-auto"
          >
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
                      <strong className={msg.sender === "System" ? "text-gray-400" : "text-indigo-400"}>
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
          
          <div className="mt-4">
            <div className="flex items-center text-gray-400 mb-1">
              <small>You are posting as: <span className="text-indigo-400">{currentSender}</span></small>
            </div>
            <div className="flex">
              <textarea
                placeholder="Type a message..."
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
    </div>
  );
};

export default Task;