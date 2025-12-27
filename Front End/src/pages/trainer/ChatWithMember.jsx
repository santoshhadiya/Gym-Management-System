import React, { useState } from 'react';

const ChatWithMember = () => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'trainer', text: 'Hello! How are your sessions going?' },
    { id: 2, sender: 'member', text: 'They are great! Feeling better already.' },
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      sender: 'trainer',
      text: input.trim(),
    };

    setMessages([...messages, newMessage]);
    setInput('');
  };

  return (
    <div className="max-w-4xl mx-auto mt-6 bg-white p-6 rounded-lg shadow-md flex flex-col h-[80vh]">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Chat with Member</h1>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto border rounded-lg p-4 bg-gray-50 space-y-3 mb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === 'trainer' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                msg.sender === 'trainer'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-900'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Message input */}
      <form onSubmit={handleSend} className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 border px-4 py-2 rounded-md"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatWithMember;
