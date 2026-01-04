import React, { useState, useEffect, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';

const Chat = () => {
  // --- STYLE INJECTION ---
  useEffect(() => {
    const linkToast = document.createElement("link");
    linkToast.href = "https://cdnjs.cloudflare.com/ajax/libs/react-toastify/9.1.3/ReactToastify.min.css";
    linkToast.rel = "stylesheet";
    document.head.appendChild(linkToast);

    const linkFA = document.createElement("link");
    linkFA.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    linkFA.rel = "stylesheet";
    document.head.appendChild(linkFA);

    return () => {
      document.head.removeChild(linkToast);
      document.head.removeChild(linkFA);
    };
  }, []);

  // --- STATE & REFS ---
  const [messages, setMessages] = useState([
    { id: 1, sender: 'trainer', text: 'Hello! Ready for your next workout session?', time: '10:00 AM', type: 'text' },
    { id: 2, sender: 'member', text: 'Yes, I am! Can we schedule it for tomorrow morning?', time: '10:05 AM', type: 'text' },
  ]);
  const [input, setInput] = useState('');
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);

  // --- SCROLL LOGIC ---
  const scrollToBottom = () => {
    // Scroll the container specifically, not the whole window
    if (chatContainerRef.current) {
        const { scrollHeight, clientHeight } = chatContainerRef.current;
        chatContainerRef.current.scrollTo({
            top: scrollHeight - clientHeight,
            behavior: 'smooth'
        });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // --- HANDLERS ---
  const sendMessage = () => {
    if (!input.trim()) return;
    
    const newMessage = {
      id: Date.now(),
      sender: 'member',
      text: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text'
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    
    // Simulate trainer reply
    setTimeout(() => {
        const reply = {
            id: Date.now() + 1,
            sender: 'trainer',
            text: "Great! I'll confirm the slot shortly.",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'text'
        };
        setMessages(prev => [...prev, reply]);
        toast.info("New message from Trainer");
    }, 1500);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you would upload this to a server/storage bucket here
      // For this demo, we create a local URL
      const imageUrl = URL.createObjectURL(file);

      const newMessage = {
        id: Date.now(),
        sender: 'member',
        text: 'Sent an image', // Fallback text
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'image',
        url: imageUrl
      };
      
      setMessages(prev => [...prev, newMessage]);
      toast.success("Image sent successfully!");
    }
    // Reset the input so the same file can be selected again if needed
    e.target.value = null; 
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="w-full max-w-4xl mx-auto h-[80vh] bg-white border border-gray-100 rounded-[2.5rem] shadow-sm flex flex-col font-sans overflow-hidden">
      <ToastContainer position="top-right" autoClose={2000} />

      {/* Header */}
      <div className="bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-[#FEEF75] flex items-center justify-center text-yellow-900 font-bold border border-white shadow-sm">
              RM
           </div>
           <div>
              <h2 className="text-lg font-bold text-gray-900">Raj Mehta</h2>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span> 
                <span className="text-xs text-green-600 font-medium">Online</span>
              </div>
           </div>
        </div>
        <button className="w-8 h-8 rounded-full hover:bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors">
           <i className="fa-solid fa-ellipsis-vertical"></i>
        </button>
      </div>

      {/* Messages Area */}
      <div 
        ref={chatContainerRef}
        className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#fcfdfd]"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'member' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}
          >
             <div className={`max-w-[75%] p-3 rounded-2xl text-sm relative group shadow-sm ${
                msg.sender === 'member' 
                ? 'bg-[#CDE7FE] text-blue-900 rounded-tr-none' 
                : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
             }`}>
                {/* Content Rendering based on Type */}
                {msg.type === 'image' ? (
                  <div className="rounded-xl overflow-hidden mb-1 border border-white/50">
                    <img src={msg.url} alt="Attachment" className="max-w-full h-auto object-cover min-w-[150px]" />
                  </div>
                ) : (
                  <p className="leading-relaxed">{msg.text}</p>
                )}

                {/* Timestamp */}
                <span className={`text-[10px] absolute -bottom-5 ${msg.sender === 'member' ? 'right-0' : 'left-0'} text-gray-400 w-max font-medium opacity-0 group-hover:opacity-100 transition-opacity`}>
                   {msg.time}
                </span>
             </div>
          </div>
        ))}
        {/* Invisible div to scroll to */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-100 bg-white">
        <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:bg-white focus-within:border-[#CDE7FE] focus-within:ring-4 focus-within:ring-[#CDE7FE]/10 transition-all shadow-inner">
          
          {/* File Upload Button */}
          <button 
            onClick={() => fileInputRef.current.click()}
            className="w-9 h-9 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-blue-600 hover:border-blue-300 flex items-center justify-center transition-all flex-shrink-0 shadow-sm"
            title="Attach Image"
          >
             <i className="fa-solid fa-paperclip"></i>
          </button>
          
          {/* Hidden File Input */}
          <input 
             type="file" 
             ref={fileInputRef} 
             className="hidden" 
             accept="image/*"
             onChange={handleFileUpload} 
          />
          
          {/* Text Input */}
          <input
            type="text"
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-800 placeholder-gray-400 h-9 outline-none px-2"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          
          {/* Send Button */}
          <button
            onClick={sendMessage}
            className="px-5 py-2.5 bg-[#D9F17F] text-green-900 rounded-xl text-sm font-bold hover:bg-green-300 transition-all shadow-md active:scale-95 flex-shrink-0 flex items-center gap-2"
          >
            Send <i className="fa-solid fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;