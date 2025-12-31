import React, { useState, useEffect, useRef } from "react";
import { ToastContainer, toast } from 'react-toastify';

const ChatWithMember = () => {
  // --- MOCK DATA ---
  const [users] = useState([
    { id: 101, name: "Riya Patel", role: "Member", avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhSCnZjyigxnrEnwTufQlW1ohzB8YQdFOJ1w&s" },
    { id: 102, name: "Amit Sharma", role: "Member", avatar: "https://i.pravatar.cc/150?u=102" },
    { id: 201, name: "Raj Mehta", role: "Trainer", avatar: "https://i.pravatar.cc/150?u=201" },
    { id: 202, name: "Sneha Rathi", role: "Trainer", avatar: "https://i.pravatar.cc/150?u=202" },
  ]);

  const [conversations, setConversations] = useState([
    {
      id: 1,
      userId: 101,
      userName: "Riya Patel",
      userRole: "Member",
      avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQhSCnZjyigxnrEnwTufQlW1ohzB8YQdFOJ1w&s",
      unread: 2,
      lastMessage: "Can I reschedule my session?",
      lastTime: "10:30 AM",
      messages: [
        { id: 1, sender: "admin", text: "Hi Riya, how is your training going?", time: "Yesterday", type: "text" },
        { id: 2, sender: "user", text: "It's great! Just needed to ask about tomorrow.", time: "10:28 AM", type: "text" },
        { id: 3, sender: "user", text: "Can I reschedule my session?", time: "10:30 AM", type: "text" }
      ]
    },
    {
      id: 2,
      userId: 201,
      userName: "Raj Mehta",
      userRole: "Trainer",
      avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR11_V5RkjctExup8jEDoaM9oS_Y4SAzXvq-w&s",
      unread: 0,
      lastMessage: "Updated the diet chart for Amit.",
      lastTime: "Yesterday",
      messages: [
        { id: 1, sender: "user", text: "Here is the new diet plan.", time: "Yesterday", type: "image", url: "https://placehold.co/300x200?text=Diet+Chart" },
        { id: 2, sender: "user", text: "Updated the diet chart for Amit.", time: "Yesterday", type: "text" },
        { id: 3, sender: "admin", text: "Thanks Raj, looks good.", time: "Yesterday", type: "text" }
      ]
    }
  ]);

  // --- STATE ---
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  
  const chatContainerRef = useRef(null); // Ref for the scrollable container
  const fileInputRef = useRef(null);

  const selectedChat = conversations.find(c => c.id === selectedChatId);

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

  // Auto-scroll logic (Fixed to prevent page scrolling)
  useEffect(() => {
    if (chatContainerRef.current) {
      const { scrollHeight, clientHeight } = chatContainerRef.current;
      chatContainerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: 'smooth'
      });
    }
  }, [selectedChat?.messages, selectedChatId]); // Trigger on message add or chat switch

  // --- HELPERS ---
  const getRoleBadge = (role) => {
    return role === "Trainer" 
      ? "bg-[#CDE7FE] text-blue-900 border-blue-200" 
      : "bg-gray-100 text-gray-600 border-gray-200";
  };

  // --- ACTIONS ---
  const handleSendMessage = () => {
    if (!messageText.trim() && !fileInputRef.current?.files[0]) return;

    const newMessage = {
      id: Date.now(),
      sender: "admin",
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: "text"
    };

    setConversations(prev => prev.map(chat => {
      if (chat.id === selectedChatId) {
        return {
          ...chat,
          messages: [...chat.messages, newMessage],
          lastMessage: "You: " + messageText,
          lastTime: "Just now"
        };
      }
      return chat;
    }));

    setMessageText("");
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const newMessage = {
        id: Date.now(),
        sender: "admin",
        text: "Sent an image",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: "image",
        url: URL.createObjectURL(file)
      };

      setConversations(prev => prev.map(chat => {
        if (chat.id === selectedChatId) {
          return {
            ...chat,
            messages: [...chat.messages, newMessage],
            lastMessage: "You sent an image",
            lastTime: "Just now"
          };
        }
        return chat;
      }));
      toast.success("Image sent!");
    }
  };

  const handleDeleteMessage = (msgId) => {
    if(window.confirm("Moderation: Delete this message?")) {
      setConversations(prev => prev.map(chat => {
        if (chat.id === selectedChatId) {
          return {
            ...chat,
            messages: chat.messages.filter(m => m.id !== msgId)
          };
        }
        return chat;
      }));
      toast.info("Message removed.");
    }
  };

  const startNewChat = (user) => {
    // Check if chat exists
    const existing = conversations.find(c => c.userId === user.id);
    if (existing) {
      setSelectedChatId(existing.id);
    } else {
      const newChat = {
        id: Date.now(),
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        avatar: user.avatar,
        unread: 0,
        lastMessage: "Start of conversation",
        lastTime: "Just now",
        messages: []
      };
      setConversations([newChat, ...conversations]);
      setSelectedChatId(newChat.id);
    }
    setShowNewChatModal(false);
  };

  // --- FILTERING ---
  const filteredChats = conversations.filter(c => 
    c.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full bg-white rounded-3xl shadow-sm border border-gray-100 font-sans h-[85vh] flex overflow-hidden relative">
      <ToastContainer position="top-right" autoClose={2000} />

      {/* --- SIDEBAR (Chat List) --- */}
      <div className="w-full md:w-1/3 bg-gray-50 border-r border-gray-200 flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-gray-900">Messages</h1>
            <button 
              onClick={() => setShowNewChatModal(true)}
              className="w-8 h-8 rounded-full bg-[#D9F17F] flex items-center justify-center text-green-900 hover:bg-green-300 transition-colors shadow-sm"
              title="New Chat"
            >
              <i className="fa-solid fa-plus"></i>
            </button>
          </div>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-100 border border-transparent focus:bg-white focus:border-[#CDE7FE] focus:ring-4 focus:ring-[#CDE7FE]/20 text-sm text-gray-700 transition-all outline-none"
            />
            <i className="fa-solid fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
          {filteredChats.map(chat => (
            <div 
              key={chat.id}
              onClick={() => setSelectedChatId(chat.id)}
              className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center gap-3 border ${selectedChatId === chat.id ? 'bg-white border-[#CDE7FE] shadow-sm' : 'bg-transparent border-transparent hover:bg-gray-100'}`}
            >
              <div className="relative">
                <img src={chat.avatar} alt={chat.userName} className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                {chat.unread > 0 && <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <h3 className={`text-sm font-bold truncate ${selectedChatId === chat.id ? 'text-blue-900' : 'text-gray-800'}`}>{chat.userName}</h3>
                  <span className="text-[10px] text-gray-400">{chat.lastTime}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs text-gray-500 truncate">{chat.lastMessage}</p>
                  {chat.unread > 0 && <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{chat.unread}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- MAIN CHAT AREA --- */}
      <div className="hidden md:flex flex-1 flex-col bg-white">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white shadow-sm z-10">
              <div className="flex items-center gap-3">
                <img src={selectedChat.avatar} alt={selectedChat.userName} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                <div>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    {selectedChat.userName}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${getRoleBadge(selectedChat.userRole)}`}>
                      {selectedChat.userRole}
                    </span>
                  </h2>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Online
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="w-9 h-9 rounded-full bg-gray-50 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center">
                  <i className="fa-solid fa-phone"></i>
                </button>
                <button className="w-9 h-9 rounded-full bg-gray-50 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center">
                  <i className="fa-solid fa-video"></i>
                </button>
                <button className="w-9 h-9 rounded-full bg-gray-50 text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center">
                  <i className="fa-solid fa-ellipsis-vertical"></i>
                </button>
              </div>
            </div>

            {/* Messages Feed */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50"
            >
              {selectedChat.messages.map(msg => {
                const isAdmin = msg.sender === "admin";
                return (
                  <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'} group`}>
                    <div className={`max-w-[70%] relative`}>
                      {/* Delete Button (Admin Mod) */}
                      <button 
                        onClick={() => handleDeleteMessage(msg.id)}
                        className={`absolute top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-500 p-2 ${isAdmin ? '-left-8' : '-right-8'}`}
                        title="Delete Message"
                      >
                        <i className="fa-solid fa-trash text-xs"></i>
                      </button>

                      {/* Message Bubble */}
                      <div className={`p-3 rounded-2xl text-sm ${isAdmin ? 'bg-[#D9F17F] text-green-900 rounded-tr-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none shadow-sm'}`}>
                        {msg.type === 'text' ? (
                          <p>{msg.text}</p>
                        ) : (
                          <div className="rounded-xl overflow-hidden mb-1">
                            <img src={msg.url} alt="Attachment" className="max-w-full h-auto object-cover" />
                          </div>
                        )}
                      </div>
                      
                      {/* Timestamp */}
                      <p className={`text-[10px] text-gray-400 mt-1 ${isAdmin ? 'text-right' : 'text-left'}`}>
                        {msg.time}
                        {isAdmin && <i className="fa-solid fa-check-double ml-1 text-blue-400"></i>}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:bg-white focus-within:border-[#CDE7FE] focus-within:ring-4 focus-within:ring-[#CDE7FE]/10 transition-all">
                <button 
                  onClick={() => fileInputRef.current.click()}
                  className="w-8 h-8 rounded-full bg-white border border-gray-300 text-gray-500 hover:text-blue-600 hover:border-blue-400 flex items-center justify-center transition-all flex-shrink-0"
                >
                  <i className="fa-solid fa-paperclip"></i>
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleFileUpload} 
                />
                
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-800 placeholder-gray-400 h-9 outline-none"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                />
                
                <button 
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm flex-shrink-0"
                >
                  Send <i className="fa-solid fa-paper-plane ml-1"></i>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-300 bg-gray-50">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
               <i className="fa-regular fa-comments text-4xl"></i>
            </div>
            <p className="text-lg font-medium text-gray-400">Select a conversation to start chatting</p>
          </div>
        )}
      </div>

      {/* --- NEW CHAT MODAL --- */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-[#f8f9fa] px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                 <h3 className="font-bold text-gray-900">Start New Conversation</h3>
                 <button onClick={() => setShowNewChatModal(false)} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                    <i className="fa-solid fa-xmark text-lg"></i>
                 </button>
              </div>
              <div className="p-4 max-h-[60vh] overflow-y-auto">
                 <p className="text-xs font-bold text-gray-400 uppercase mb-3 ml-1">Available Users</p>
                 <div className="space-y-2">
                    {users.map(user => (
                       <button 
                         key={user.id} 
                         onClick={() => startNewChat(user)}
                         className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#FEEF75]/30 transition-colors border border-transparent hover:border-[#FEEF75]"
                       >
                          <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                          <div className="text-left">
                             <p className="text-sm font-bold text-gray-900">{user.name}</p>
                             <span className={`text-[10px] px-2 py-0.5 rounded border ${getRoleBadge(user.role)}`}>{user.role}</span>
                          </div>
                       </button>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default ChatWithMember;