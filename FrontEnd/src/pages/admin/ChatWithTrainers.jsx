import React, { useState } from "react";

const ChatWithTrainer = () => {
  const trainers = ["Trainer A", "Trainer B", "Trainer C"];
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState({}); // { trainer: [ { sender, text, timestamp } ] }

  const handleSend = () => {
    if (!message.trim() || !selectedTrainer) return;

    const newMessage = {
      sender: "You",
      text: message.trim(),
      timestamp: new Date().toLocaleTimeString(),
    };

    const updatedChat = chats[selectedTrainer]
      ? [...chats[selectedTrainer], newMessage]
      : [newMessage];

    setChats({ ...chats, [selectedTrainer]: updatedChat });
    setMessage("");
  };

  return (
    <div className="flex h-[80vh] bg-white rounded-lg shadow">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-100 p-4 border-r">
        <h2 className="text-xl font-semibold mb-3">Trainers</h2>
        <ul>
          {trainers.map((trainer) => (
            <li
              key={trainer}
              className={`p-2 rounded cursor-pointer ${
                selectedTrainer === trainer ? "bg-red-500 text-white" : "hover:bg-red-200"
              }`}
              onClick={() => setSelectedTrainer(trainer)}
            >
              {trainer}
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Section */}
      <div className="w-3/4 p-4 flex flex-col">
        {selectedTrainer ? (
          <>
            <h2 className="text-2xl font-bold mb-2 border-b pb-2">
              Chat with {selectedTrainer}
            </h2>
            <div className="flex-1 overflow-y-auto mb-4 border rounded p-3 bg-gray-50">
              {chats[selectedTrainer]?.map((msg, index) => (
                <div key={index} className="mb-2">
                  <div className="font-medium">{msg.sender}</div>
                  <div>{msg.text}</div>
                  <div className="text-xs text-gray-500">{msg.timestamp}</div>
                </div>
              ))}
              {(!chats[selectedTrainer] || chats[selectedTrainer].length === 0) && (
                <p className="text-gray-400">No messages yet.</p>
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                className="flex-1 border px-4 py-2 rounded"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button
                onClick={handleSend}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500 my-auto text-lg">
            Select a trainer to start chatting.
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWithTrainer;
