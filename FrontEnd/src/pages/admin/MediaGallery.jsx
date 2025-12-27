import React, { useState } from "react";

const MediaGallery = () => {
  const [mediaList, setMediaList] = useState([
    {
      id: 1,
      type: "image",
      url: "https://source.unsplash.com/400x300/?gym,fitness",
    },
    {
      id: 2,
      type: "video",
      url: "https://www.w3schools.com/html/mov_bbb.mp4",
    },
  ]);

  const [mediaType, setMediaType] = useState("image");
  const [mediaURL, setMediaURL] = useState("");

  const handleUpload = () => {
    if (!mediaURL) return alert("Please enter a valid URL");

    const newMedia = {
      id: Date.now(),
      type: mediaType,
      url: mediaURL,
    };

    setMediaList([newMedia, ...mediaList]);
    setMediaURL("");
  };

  const handleDelete = (id) => {
    const confirmed = window.confirm("Delete this media?");
    if (confirmed) {
      setMediaList(mediaList.filter((m) => m.id !== id));
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-6 p-6 bg-white shadow rounded-xl">
      <h1 className="text-3xl font-bold text-red-600 mb-6">Media Gallery</h1>

      {/* Upload section */}
      <div className="bg-gray-50 p-4 rounded-md shadow-sm mb-8 flex flex-col md:flex-row gap-4">
        <select
          value={mediaType}
          onChange={(e) => setMediaType(e.target.value)}
          className="border px-4 py-2 rounded"
        >
          <option value="image">Image</option>
          <option value="video">Video</option>
        </select>

        <input
          type="text"
          placeholder="Enter media URL"
          className="flex-1 border px-4 py-2 rounded"
          value={mediaURL}
          onChange={(e) => setMediaURL(e.target.value)}
        />

        <button
          onClick={handleUpload}
          className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
        >
          Upload
        </button>
      </div>

      {/* Media grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {mediaList.map((media) => (
          <div
            key={media.id}
            className="border rounded-lg overflow-hidden shadow-sm relative group"
          >
            {media.type === "image" ? (
              <img
                src={media.url}
                alt="Media"
                className="w-full h-60 object-cover"
              />
            ) : (
              <video controls className="w-full h-60 object-cover">
                <source src={media.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
            <button
              onClick={() => handleDelete(media.id)}
              className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-xs hidden group-hover:block"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MediaGallery;
