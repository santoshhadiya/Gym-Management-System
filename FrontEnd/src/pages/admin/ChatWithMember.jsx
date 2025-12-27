import React, { useState } from "react";

const ChatWithMember = () => {
  const members = ["Riya Patel", "Amit Sharma", "John Doe"];
  const [selectedMember, setSelectedMember] = useState(null);
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState({}); // { member: [ { sender, text, timestamp } ] }

  const handleSend = () => {
    if (!message.trim() || !selectedMember) return;

    const newMessage = {
      sender: "You",
      text: message.trim(),
      timestamp: new Date().toLocaleTimeString(),
    };

    const updatedChat = chats[selectedMember]
      ? [...chats[selectedMember], newMessage]
      : [newMessage];

    setChats({ ...chats, [selectedMember]: updatedChat });
    setMessage("");
  };

  return (
    <div className="flex h-[80vh] rounded-xl shadow bg-white">
      {/* Sidebar */}
      <div className="w-1/4 border-r p-4 bg-gray-100">
        <h2 className="text-xl font-semibold mb-4">Members</h2>
        <ul>
          {members.map((member) => (
            <li
              key={member}
              className={`p-2 rounded cursor-pointer ${
                selectedMember === member ? "bg-red-500 text-white" : "hover:bg-red-100"
              }`}
              onClick={() => setSelectedMember(member)}
            >
              {member}
            </li>
          ))}
        </ul>
      </div>

      {/* Chat Window */}
      <div className="w-3/4 p-4 flex flex-col">
        {selectedMember ? (
          <>
            <h2 className="text-2xl font-bold mb-2 border-b pb-2">
              Chat with {selectedMember}
            </h2>
            <div className="flex-1 overflow-y-auto mb-4 p-2 border rounded">
              {chats[selectedMember]?.map((msg, idx) => (
                <div key={idx} className="mb-2">
                  <div className="font-semibold">{msg.sender}</div>
                  <div className="text-sm text-gray-800">{msg.text}</div>
                  <div className="text-xs text-gray-500">{msg.timestamp}</div>
                </div>
              ))}
              {(!chats[selectedMember] || chats[selectedMember].length === 0) && (
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
          <div className="text-gray-500 text-center my-auto text-lg">
            Select a member to start chatting.
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWithMember;
