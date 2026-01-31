import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast'; // Updated Toast
import { io } from "socket.io-client";
import { useGlobalContext } from '../../context/GlobalContext';
import { useTheme } from "../../context/ThemeContext"; // Theme Context

const Chat = () => {
  const { BACKEND_URL } = useGlobalContext();
  const { colors, theme } = useTheme(); // Consume Theme

  // --- STATE ---
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trainer, setTrainer] = useState(null); 
  
  const [showSidebar, setShowSidebar] = useState(true);
  
  const messagesEndRef = useRef(null);
  const currentChatRef = useRef(currentChat); 
  
  const user = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    currentChatRef.current = currentChat;
  }, [currentChat]);

  // --- AUTO SCROLL ---
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [messages]);

  // --- STYLE INJECTION ---
  useEffect(() => {
    // Only injecting FA, removed Toastify CSS
    const linkFA = document.createElement("link");
    linkFA.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    linkFA.rel = "stylesheet";
    document.head.appendChild(linkFA);
    
    return () => {
        document.head.removeChild(linkFA);
    }
  }, []);

  // --- SOCKET ---
  useEffect(() => {
    if (user && user.token) {
        const newSocket = io(BACKEND_URL);
        setSocket(newSocket);
        
        newSocket.emit("join", user._id); 

        newSocket.on("receiveMessage", (newMessage) => {
            const activeChat = currentChatRef.current;
            if (activeChat && newMessage.conversationId === activeChat._id) {
                setMessages((prev) => [...prev, newMessage]);
            }
            
            setConversations(prev => {
                 const existing = prev.find(c => c._id === newMessage.conversationId);
                 if (existing) {
                     return [
                         { ...existing, lastMessage: newMessage.text, updatedAt: new Date().toISOString() },
                         ...prev.filter(c => c._id !== newMessage.conversationId)
                     ];
                 }
                 return prev;
            });
        });

        return () => newSocket.close();
    }
  }, []);

  // --- FETCH DATA ---
  const fetchConversations = async () => {
      try {
          const res = await fetch(`${BACKEND_URL}/api/chat/conversations`, {
              headers: { Authorization: `Bearer ${user?.token}` }
          });
          const data = await res.json();
          setConversations(data);
      } catch (error) {
          console.error("Error fetching conversations:", error);
      } finally {
          setLoading(false);
      }
  };

  const fetchAssignedTrainer = async () => {
      try {
          const res = await fetch(`${BACKEND_URL}/api/members/profile`, {
              headers: { Authorization: `Bearer ${user?.token}` }
          });
          if (res.ok) {
              const data = await res.json();
              if (data.assignedTrainer) {
                  setTrainer(data.assignedTrainer);
              }
          }
      } catch (err) {
          console.error(err);
      }
  };

  useEffect(() => {
      if (user) {
          fetchConversations();
          fetchAssignedTrainer();
      }
  }, []);

  // --- ACTIONS ---
  const handleChatSelect = async (conv) => {
      setCurrentChat(conv);
      setShowSidebar(false);
      try {
        const res = await fetch(`${BACKEND_URL}/api/chat/messages/${conv._id}`, {
            headers: { Authorization: `Bearer ${user?.token}` }
        });
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error(err);
      }
  };

  const startChatWithTrainer = async () => {
      if (!trainer) {
          toast.error("No trainer assigned yet.");
          return;
      }
      
      const existing = conversations.find(c => c.participant?._id === trainer._id);
      if (existing) {
          handleChatSelect(existing);
      } else {
          try {
              const res = await fetch(`${BACKEND_URL}/api/chat/conversation`, {
                  method: "POST",
                  headers: { 
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${user.token}` 
                  },
                  body: JSON.stringify({ receiverId: trainer._id })
              });
              const newConv = await res.json();
              setConversations([newConv, ...conversations]);
              handleChatSelect(newConv);
          } catch (err) {
              toast.error("Failed to start chat");
          }
      }
  };

  const sendMessage = async () => {
      if (!input.trim() || !currentChat) return;

      const tempMsg = {
          _id: Date.now(),
          sender: { _id: user._id, name: user.name },
          text: input,
          createdAt: new Date().toISOString(),
          conversationId: currentChat._id
      };

      setMessages((prev) => [...prev, tempMsg]);
      const msgToSend = input;
      setInput('');

      try {
          const res = await fetch(`${BACKEND_URL}/api/chat/message`, {
              method: "POST",
              headers: { 
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${user?.token}` 
              },
              body: JSON.stringify({
                  conversationId: currentChat._id,
                  text: msgToSend
              })
          });
          
          const savedMsg = await res.json();
          
          if (socket) {
              socket.emit("sendMessage", {
                  senderId: user._id,
                  receiverId: currentChat.participant?._id,
                  message: savedMsg
              });
          }
          
          setConversations(prev => {
             return prev.map(c => 
                 c._id === currentChat._id 
                 ? { ...c, lastMessage: msgToSend, updatedAt: new Date().toISOString() } 
                 : c
             ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
          });

      } catch (error) {
          toast.error("Failed to send message");
      }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[85vh] gap-3" style={{ color: colors.textMuted }}>
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin"
             style={{ borderColor: colors.primary, borderTopColor: 'transparent' }}></div>
        <p className="font-medium">Loading Messages...</p>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row h-[92vh] md:h-[88vh] md:rounded-3xl overflow-hidden shadow-2xl border font-sans mx-auto max-w-7xl md:mt-4 relative"
         style={{ backgroundColor: colors.background, borderColor: colors.border }}>
      
      {/* --- SIDEBAR --- */}
      <div className={`
        ${showSidebar ? 'flex' : 'hidden md:flex'} 
        absolute inset-0 z-40 md:relative md:z-auto 
        w-full md:w-80 lg:w-96 
        border-r flex-col shrink-0 transition-all duration-300 backdrop-blur-md
      `}
      style={{ 
         backgroundColor: theme === 'dark' ? 'rgba(17, 24, 39, 0.95)' : 'rgba(205, 231, 254, 0.3)', // #111827 / #CDE7FE
         borderColor: colors.border
      }}>
        <div className="p-6 md:p-8 border-b" style={{ borderColor: colors.border, backgroundColor: theme === 'dark' ? colors.card : 'rgba(255,255,255,0.8)' }}>
           <div className="flex items-center justify-between">
              <h2 className="text-xl md:text-2xl font-extrabold tracking-tight" style={{ color: colors.text }}>Messages</h2>
              {!showSidebar && currentChat && (
                <button onClick={() => setShowSidebar(false)} className="md:hidden" style={{ color: colors.textMuted }}>
                  <i className="fa-solid fa-xmark text-xl"></i>
                </button>
              )}
           </div>
           {trainer && (
               <button 
                  onClick={startChatWithTrainer}
                  className="mt-4 w-full py-3 rounded-2xl text-[10px] md:text-xs font-black hover:shadow-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider active:scale-95"
                  style={{ backgroundColor: colors.primary, color: '#111827' }} // Always dark text on Lime
               >
                  <i className="fa-solid fa-user-ninja"></i> Chat with Trainer
               </button>
           )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
           {conversations.length > 0 ? conversations.map((conv) => (
              <div 
                key={conv._id}
                onClick={() => handleChatSelect(conv)}
                className={`group relative p-3 md:p-4 rounded-2xl cursor-pointer transition-all duration-300 flex items-center gap-3 md:gap-4`}
                style={{ 
                    backgroundColor: currentChat?._id === conv._id ? colors.card : 'transparent',
                    boxShadow: currentChat?._id === conv._id ? '0 10px 15px -3px rgba(0, 0, 0, 0.1)' : 'none'
                }}
              >
                 <div className={`w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-2xl flex items-center justify-center font-bold text-base md:text-lg shadow-sm transition-transform group-hover:scale-105`}
                      style={{ 
                          backgroundColor: currentChat?._id === conv._id ? colors.primary : (theme === 'dark' ? '#374151' : '#ffffff'),
                          color: currentChat?._id === conv._id ? '#111827' : colors.text,
                          border: currentChat?._id === conv._id ? 'none' : `1px solid ${colors.border}`
                      }}
                 >
                    {conv.participant?.name?.[0]?.toUpperCase()}
                 </div>
                 <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5 md:mb-1">
                       <h4 className="font-bold text-[14px] md:text-[15px] truncate" style={{ color: colors.text }}>{conv.participant?.name || "Unknown"}</h4>
                       <span className="text-[9px] md:text-[10px] font-semibold uppercase tracking-tighter" style={{ color: colors.textMuted }}>
                           {new Date(conv.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                       </span>
                    </div>
                    <p className={`text-[11px] md:text-xs truncate transition-colors`}
                       style={{ 
                           color: currentChat?._id === conv._id ? colors.text : colors.textMuted,
                           fontWeight: currentChat?._id === conv._id ? '600' : '400'
                       }}
                    >
                       {conv.lastMessage || "Start chatting..."}
                    </p>
                 </div>
              </div>
           )) : (
              <div className="text-center py-10 font-medium italic text-xs leading-relaxed" style={{ color: colors.textMuted }}>
                 No conversations yet.<br/>Start a chat with your trainer!
              </div>
           )}
        </div>
      </div>

      {/* --- CHAT AREA --- */}
      <div className={`
        ${!showSidebar || currentChat ? 'flex' : 'hidden md:flex'}
        flex-1 flex flex-col relative overflow-hidden h-full
      `}
      style={{ backgroundColor: theme === 'dark' ? '#0B0F19' : '#f8fafc' }}
      >
        {currentChat ? (
          <>
            {/* Background Pattern */}
            <div className="absolute inset-0 pointer-events-none z-0 opacity-50"
                 style={{ 
                    backgroundImage: 'url("https://elfsight.com/assets/chats/patterns/whatsapp.png")', // Keep or replace with local asset
                    backgroundSize: '400px',
                    filter: theme === 'dark' ? 'invert(1) opacity(0.05)' : 'opacity(0.4)'
                 }}>
            </div>

            {/* Chat Header */}
            <div className="px-4 md:px-8 py-3 md:py-5 border-b backdrop-blur-md flex justify-between items-center sticky top-0 z-20 shadow-sm"
                 style={{ 
                     backgroundColor: theme === 'dark' ? 'rgba(17, 24, 39, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                     borderColor: colors.border
                 }}
            >
               <div className="flex items-center gap-3 md:gap-4">
                  <button 
                    onClick={() => setShowSidebar(true)} 
                    className="md:hidden w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                    style={{ color: colors.textMuted }}
                  >
                    <i className="fa-solid fa-chevron-left"></i>
                  </button>
                  
                  <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-2xl flex items-center justify-center text-white font-bold text-base md:text-lg shadow-lg md:rotate-3"
                       style={{ backgroundColor: colors.text }}>
                     {currentChat.participant?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                     <h3 className="font-extrabold text-base md:text-lg leading-tight" style={{ color: colors.text }}>{currentChat.participant?.name}</h3>
                     <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest" style={{ color: colors.textMuted }}>Active</span>
                  </div>
               </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 md:space-y-6 scroll-smooth relative z-10 no-scrollbar">
               <div className="flex flex-col space-y-4 md:space-y-6">
                   {messages.map((msg, index) => {
                      const senderId = msg.sender?._id || msg.sender;
                      const isMe = senderId === user._id;
                      
                      return (
                         <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <div className={`group relative px-4 md:px-5 py-2.5 md:py-3.5 max-w-[85%] md:max-w-[75%] text-[13px] md:text-[14.5px] leading-relaxed shadow-sm transition-all hover:shadow-md ${
                               isMe 
                               ? 'rounded-2xl md:rounded-3xl rounded-tr-none font-medium' 
                               : 'rounded-2xl md:rounded-3xl rounded-tl-none font-medium'
                            }`}
                            style={{ 
                                backgroundColor: isMe ? colors.primary : colors.secondary,
                                color: isMe ? '#111827' : (theme === 'dark' ? '#fff' : '#111827')
                            }}
                            >
                               <p>{msg.text}</p>
                            </div>
                            <div className={`flex items-center gap-1 mt-1 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                                <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-tighter" style={{ color: colors.textMuted }}>
                                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ""}
                                </span>
                            </div>
                         </div>
                      );
                   })}
                   <div ref={messagesEndRef} className="h-2 w-full" />
               </div>
            </div>

            {/* Input Area */}
            <div className="p-3 md:p-6 border-t relative z-20"
                 style={{ backgroundColor: colors.card, borderColor: colors.border }}>
              <div className="relative flex items-center gap-2 md:gap-4">
                <div className="relative flex-1 group">
                    <input
                      type="text"
                      className="w-full border-none rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 focus:outline-none focus:ring-2 transition-all text-[14px] md:text-[15px] font-medium"
                      style={{ 
                          backgroundColor: theme === 'dark' ? '#1f2937' : '#f1f5f9',
                          color: colors.text,
                          // placeholder color handled via CSS class mostly, but text color ensures input is visible
                      }}
                      placeholder="Type your message..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                </div>
                
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="w-11 h-11 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none shrink-0"
                  style={{ backgroundColor: colors.primary, color: '#111827' }}
                >
                  <i className="fa-solid fa-paper-plane text-lg md:text-xl"></i>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 md:p-12 bg-opacity-40">
            <button 
              onClick={() => setShowSidebar(true)}
              className="md:hidden mb-8 px-6 py-2 bg-white rounded-full shadow-md font-bold flex items-center gap-2"
              style={{ color: colors.textMuted }}
            >
              <i className="fa-solid fa-list-ul"></i> Show Conversations
            </button>
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full flex items-center justify-center mb-6 shadow-xl ring-4 md:ring-8"
                 style={{ backgroundColor: colors.card, ringColor: 'rgba(205, 231, 254, 0.2)' }}>
               <i className="fa-solid fa-comments text-4xl md:text-5xl" style={{ color: colors.primary }}></i>
            </div>
            <h3 className="text-lg md:text-xl font-extrabold mb-2" style={{ color: colors.text }}>No conversation selected</h3>
            <p className="font-medium max-w-xs text-center leading-relaxed text-sm md:text-base" style={{ color: colors.textMuted }}>
                Pick a chat from the sidebar or reach out to your trainer to start messaging.
            </p>
          </div>
        )}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

export default Chat;