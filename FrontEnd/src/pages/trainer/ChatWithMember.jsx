import React, { useState, useEffect, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';

const ChatWithMember = () => {
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

  // --- MOCK DATA ---
  const [conversations, setConversations] = useState([
    {
      id: "admin",
      name: "Gym Admin / Owner",
      role: "Admin",
      avatar: "https://ui-avatars.com/api/?name=Admin+Owner&background=0D8ABC&color=fff",
      status: "online",
      unread: 1,
      messages: [
        { id: 1, sender: "admin", text: "Please submit the weekly reports by Friday.", time: "Yesterday", type: "text" },
        { id: 2, sender: "me", text: "Sure, I'm finalizing them now.", time: "Yesterday", type: "text" },
        { id: 3, sender: "admin", text: "Great, thanks!", time: "10:00 AM", type: "text" }
      ]
    },
    {
      id: 1,
      name: "Ravi Patel",
      role: "Member",
      avatar: "https://i.pravatar.cc/150?u=1",
      status: "online",
      unread: 2,
      messages: [
        { id: 1, sender: "me", text: "How is the new diet plan going?", time: "Yesterday", type: "text" },
        { id: 2, sender: "member", text: "It's good but I feel hungry in the evening.", time: "09:30 AM", type: "text" },
        { id: 3, sender: "member", text: "Can we add a snack?", time: "09:31 AM", type: "text" }
      ]
    },
    {
      id: 2,
      name: "Priya Shah",
      role: "Member",
      avatar: "https://i.pravatar.cc/150?u=2",
      status: "offline",
      unread: 0,
      messages: [
        { id: 1, sender: "member", text: "I'll be late for tomorrow's session.", time: "Mon", type: "text" },
        { id: 2, sender: "me", text: "No problem, let's reschedule.", time: "Mon", type: "text" }
      ]
    },
    {
      id: 3,
      name: "Amit Joshi",
      role: "Member",
      avatar: "https://i.pravatar.cc/150?u=3",
      status: "offline",
      unread: 0,
      messages: []
    }
  ]);

  // --- STATE ---
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [messageText, setMessageText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);

  const selectedChat = conversations.find(c => c.id === selectedChatId);

  // --- SCROLL LOGIC ---
  const scrollToBottom = () => {
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
  }, [selectedChat?.messages]);

  // --- HANDLERS ---
  const handleSendMessage = () => {
    if (!messageText.trim() && !fileInputRef.current?.files[0]) return;

    const newMessage = {
      id: Date.now(),
      sender: "me",
      text: messageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: "text"
    };

    setConversations(prev => prev.map(chat => {
      if (chat.id === selectedChatId) {
        return {
          ...chat,
          messages: [...chat.messages, newMessage],
          // Move this chat to top (simple logic)
          // timestamp: Date.now() 
        };
      }
      return chat;
    }));

    setMessageText("");
    
    // Simulate Reply
    if (selectedChatId === 'admin') {
       setTimeout(() => {
          const reply = {
             id: Date.now() + 1,
             sender: "admin",
             text: "Acknowledged.",
             time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
             type: "text"
          };
          setConversations(prev => prev.map(c => c.id === 'admin' ? { ...c, messages: [...c.messages, reply] } : c));
          toast.info("New message from Admin");
       }, 2000);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      const newMessage = {
        id: Date.now(),
        sender: "me",
        text: "Sent an attachment",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: "image",
        url: imageUrl
      };

      setConversations(prev => prev.map(chat => {
        if (chat.id === selectedChatId) {
          return {
            ...chat,
            messages: [...chat.messages, newMessage]
          };
        }
        return chat;
      }));
      toast.success("File sent!");
      e.target.value = null;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSendMessage();
  };

  // --- FILTERING ---
  const filteredChats = conversations.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full bg-white rounded-[2.5rem] shadow-sm border border-gray-100 font-sans h-[85vh] flex overflow-hidden relative">
      <ToastContainer position="top-right" autoClose={2000} />

      {/* --- SIDEBAR LIST --- */}
      <div className="w-full md:w-1/3 bg-gray-50 border-r border-gray-200 flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <h1 className="text-xl font-bold text-gray-900 mb-4">Messages</h1>
          <div className="relative">
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-100 border-none focus:ring-2 focus:ring-[#CDE7FE] text-sm text-gray-700 transition-all outline-none"
            />
            <i className="fa-solid fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs"></i>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
          
          {/* Admin Chat (Sticky or highlighted) */}
          {filteredChats.filter(c => c.role === 'Admin').map(chat => (
             <div 
               key={chat.id}
               onClick={() => setSelectedChatId(chat.id)}
               className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center gap-3 border mb-2 ${selectedChatId === chat.id ? 'bg-[#CDE7FE]/20 border-[#CDE7FE] shadow-sm' : 'bg-blue-50 border-blue-100 hover:bg-blue-100'}`}
             >
                <div className="relative">
                   <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-600 text-white font-bold border-2 border-white shadow-sm">
                      <i className="fa-solid fa-user-shield"></i>
                   </div>
                   {chat.unread > 0 && <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">{chat.unread}</div>}
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex justify-between items-center mb-0.5">
                      <h3 className="text-sm font-bold text-blue-900">Admin / Owner</h3>
                      <span className="text-[10px] text-gray-400">Official</span>
                   </div>
                   <p className="text-xs text-blue-700 truncate font-medium">Direct Line</p>
                </div>
             </div>
          ))}

          <div className="px-2 py-2 text-xs font-bold text-gray-400 uppercase tracking-wider">Members</div>

          {/* Member Chats */}
          {filteredChats.filter(c => c.role === 'Member').map(chat => (
            <div 
              key={chat.id}
              onClick={() => setSelectedChatId(chat.id)}
              className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center gap-3 border ${selectedChatId === chat.id ? 'bg-white border-[#FEEF75] shadow-sm ring-1 ring-[#FEEF75]' : 'bg-transparent border-transparent hover:bg-gray-100'}`}
            >
              <div className="relative">
                <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                {chat.status === 'online' && <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <h3 className={`text-sm font-bold truncate ${selectedChatId === chat.id ? 'text-gray-900' : 'text-gray-700'}`}>{chat.name}</h3>
                  {chat.unread > 0 && <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{chat.unread}</span>}
                </div>
                <p className="text-xs text-gray-500 truncate">
                   {chat.messages.length > 0 ? chat.messages[chat.messages.length-1].text : "Start conversation..."}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- MAIN CHAT AREA --- */}
      <div className="hidden md:flex flex-1 flex-col bg-white">
        {selectedChat ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white shadow-sm z-10">
              <div className="flex items-center gap-3">
                {selectedChat.role === 'Admin' ? (
                   <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                      <i className="fa-solid fa-user-shield"></i>
                   </div>
                ) : (
                   <img src={selectedChat.avatar} alt={selectedChat.name} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                )}
                <div>
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    {selectedChat.name}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${selectedChat.role === 'Admin' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-600'}`}>
                      {selectedChat.role}
                    </span>
                  </h2>
                  {selectedChat.role !== 'Admin' && (
                     <p className="text-xs text-gray-500 flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${selectedChat.status === 'online' ? 'bg-green-500' : 'bg-gray-300'}`}></span> 
                        {selectedChat.status === 'online' ? 'Online' : 'Offline'}
                     </p>
                  )}
                </div>
              </div>
              <button className="w-9 h-9 rounded-full bg-gray-50 text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center">
                 <i className="fa-solid fa-ellipsis-vertical"></i>
              </button>
            </div>

            {/* Messages */}
            <div 
               ref={chatContainerRef}
               className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#fcfdfd]"
            >
              {selectedChat.messages.length > 0 ? selectedChat.messages.map(msg => {
                const isMe = msg.sender === "me";
                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                    <div className={`max-w-[75%] p-3 rounded-2xl text-sm shadow-sm relative group ${
                       isMe 
                       ? 'bg-[#D9F17F] text-green-900 rounded-tr-none' 
                       : 'bg-white border border-gray-100 text-gray-800 rounded-tl-none'
                    }`}>
                        {msg.type === 'image' ? (
                           <div className="rounded-xl overflow-hidden mb-1 border border-white/50">
                              <img src={msg.url} alt="Attachment" className="max-w-full h-auto object-cover min-w-[150px]" />
                           </div>
                        ) : (
                           <p className="leading-relaxed">{msg.text}</p>
                        )}
                        <span className={`text-[10px] absolute -bottom-5 ${isMe ? 'right-0' : 'left-0'} text-gray-400 w-max opacity-0 group-hover:opacity-100 transition-opacity`}>
                           {msg.time}
                        </span>
                    </div>
                  </div>
                );
              }) : (
                 <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <i className="fa-regular fa-paper-plane text-4xl mb-3 opacity-30"></i>
                    <p>Start a conversation with {selectedChat.name}</p>
                 </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:bg-white focus-within:border-[#FEEF75] focus-within:ring-4 focus-within:ring-[#FEEF75]/20 transition-all">
                <button 
                  onClick={() => fileInputRef.current.click()}
                  className="w-9 h-9 rounded-full bg-white border border-gray-300 text-gray-500 hover:text-blue-600 hover:border-blue-400 flex items-center justify-center transition-all flex-shrink-0"
                  title="Send File"
                >
                  <i className="fa-solid fa-paperclip"></i>
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload} 
                />
                
                <input
                  type="text"
                  placeholder={`Message ${selectedChat.name}...`}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-800 placeholder-gray-400 h-9 outline-none px-2"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                
                <button 
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-700 transition-colors shadow-sm flex-shrink-0 flex items-center gap-2"
                >
                  Send <i className="fa-solid fa-paper-plane text-xs"></i>
                </button>
              </div>
            </div>

          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-300 bg-gray-50">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
               <i className="fa-solid fa-comments text-4xl text-gray-300"></i>
            </div>
            <p className="text-lg font-medium text-gray-400">Select a client or admin to chat</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default ChatWithMember;