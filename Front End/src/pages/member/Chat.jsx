import React, { useState } from 'react';

const Chat = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'trainer', text: 'Hello! Ready for your next workout session?' },
    { id: 2, sender: 'member', text: 'Yes, I am! Can we schedule it for tomorrow morning?' },
  ]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMessage = {
      id: Date.now(),
      sender: 'member',
      text: input.trim(),
    };
    setMessages([...messages, newMessage]);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="max-w-4xl mx-auto h-[80vh] bg-white border rounded-xl shadow-md flex flex-col">
      {/* Header */}
      <div className="bg-red-600 text-white px-6 py-4 rounded-t-xl flex justify-between items-center">
        <h2 className="text-xl font-semibold">Chat with Trainer</h2>
        <span className="text-sm">Online 💬</span>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-sm px-4 py-2 rounded-lg text-sm ${
              msg.sender === 'member'
                ? 'ml-auto bg-red-100 text-right'
                : 'mr-auto bg-gray-100 text-left'
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t flex items-center gap-2">
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 border border-gray-300 px-4 py-2 rounded-lg focus:outline-none"
        />
        <button
          onClick={sendMessage}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
