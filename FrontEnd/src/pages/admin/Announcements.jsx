import React, { useState } from "react";

const Announcements = () => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [announcements, setAnnouncements] = useState([]);

  const handlePost = (e) => {
    e.preventDefault();
    if (!title || !message) return alert("Please fill in both fields");

    const newAnnouncement = {
      id: announcements.length + 1,
      title,
      message,
      date: new Date().toLocaleString(),
    };

    setAnnouncements([newAnnouncement, ...announcements]);
    setTitle("");
    setMessage("");
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white shadow-lg rounded-xl">
      <h1 className="text-3xl font-bold text-red-600 mb-4">Send Announcement</h1>

      <form onSubmit={handlePost} className="space-y-4 mb-6">
        <div>
          <label className="block font-medium mb-1">Title</label>
          <input
            type="text"
            className="w-full border border-gray-300 px-4 py-2 rounded"
            placeholder="e.g., Gym Holiday Notice"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Message</label>
          <textarea
            className="w-full border border-gray-300 px-4 py-2 rounded h-28"
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
        >
          Post Announcement
        </button>
      </form>

      {announcements.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-3">Posted Announcements</h2>
          <ul className="space-y-4">
            {announcements.map((a) => (
              <li key={a.id} className="bg-gray-50 p-4 rounded border">
                <div className="font-semibold text-lg">{a.title}</div>
                <p className="text-gray-700">{a.message}</p>
                <div className="text-sm text-gray-500 mt-1">Posted on: {a.date}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Announcements;
