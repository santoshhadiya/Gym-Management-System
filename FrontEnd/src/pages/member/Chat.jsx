import React, { useState, useEffect, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { io } from "socket.io-client";

// Use backend URL from env or default to localhost
const BACKEND_URL = "http://localhost:5000";

const Chat = () => {
  // --- STATE (LOGIC UNTOUCHED) ---
  const [conversations, setConversations] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trainer, setTrainer] = useState(null); 
  
  const messagesEndRef = useRef(null);
  const currentChatRef = useRef(currentChat); 
  
  const user = JSON.parse(localStorage.getItem("userInfo"));

  useEffect(() => {
    currentChatRef.current = currentChat;
  }, [currentChat]);

  // --- AUTO SCROLL LOGIC ---
  useEffect(() => {
    if (messages.length > 0) {
      // Use block: "nearest" to prevent the whole page from scrolling up
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [messages]);

  // --- STYLE INJECTION (LOGIC UNTOUCHED) ---
  useEffect(() => {
    const linkFA = document.createElement("link");
    linkFA.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css";
    linkFA.rel = "stylesheet";
    document.head.appendChild(linkFA);
    
    const linkToast = document.createElement("link");
    linkToast.href = "https://cdnjs.cloudflare.com/ajax/libs/react-toastify/9.1.3/ReactToastify.min.css";
    linkToast.rel = "stylesheet";
    document.head.appendChild(linkToast);

    return () => {
        document.head.removeChild(linkFA);
        document.head.removeChild(linkToast);
    }
  }, []);

  // --- SOCKET CONNECTION (LOGIC UNTOUCHED) ---
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

  // --- FETCH DATA (LOGIC UNTOUCHED) ---
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

  // --- ACTIONS (LOGIC UNTOUCHED) ---
  const handleChatSelect = async (conv) => {
      setCurrentChat(conv);
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
          toast.warn("No trainer assigned yet.");
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
    <div className="flex flex-col items-center justify-center h-[85vh] gap-3 text-slate-400">
        <div className="w-8 h-8 border-4 border-[#D9F17F] border-t-transparent rounded-full animate-spin"></div>
        <p className="font-medium">Loading Messages...</p>
    </div>
  );

  return (
    <div className="flex h-[88vh] bg-slate-100 rounded-3xl overflow-hidden shadow-2xl border border-white font-sans mx-auto max-w-7xl mt-4 relative">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar theme="colored" />

      {/* --- SIDEBAR --- */}
      <div className="w-80 md:w-96 border-r border-slate-200 bg-[#CDE7FE]/30 backdrop-blur-md flex flex-col shrink-0">
        <div className="p-8 border-b border-slate-200 bg-white/80">
           <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Messages</h2>
           {trainer && (
               <button 
                  onClick={startChatWithTrainer}
                  className="mt-4 w-full py-3 bg-[#D9F17F] text-slate-800 rounded-2xl text-xs font-black hover:shadow-lg hover:shadow-[#D9F17F]/30 transition-all flex items-center justify-center gap-2 uppercase tracking-wider active:scale-95"
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
                className={`group relative p-4 rounded-2xl cursor-pointer transition-all duration-300 flex items-center gap-4 ${
                    currentChat?._id === conv._id 
                    ? 'bg-white shadow-xl ring-2 ring-[#FEEF75] translate-x-1' 
                    : 'hover:bg-white hover:shadow-lg'
                }`}
              >
                 <div className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center text-slate-800 font-bold text-lg shadow-sm transition-transform group-hover:scale-105 ${
                     currentChat?._id === conv._id ? 'bg-[#D9F17F]' : 'bg-white border border-slate-200'
                 }`}>
                    {conv.participant?.name?.[0]?.toUpperCase()}
                 </div>
                 <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                       <h4 className="font-bold text-slate-900 text-[15px] truncate">{conv.participant?.name || "Unknown"}</h4>
                       <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-tighter">
                           {new Date(conv.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                       </span>
                    </div>
                    <p className={`text-xs truncate transition-colors ${
                        currentChat?._id === conv._id ? 'text-slate-900 font-medium' : 'text-slate-500'
                    }`}>
                       {conv.lastMessage || "Start chatting..."}
                    </p>
                 </div>
              </div>
           )) : (
              <div className="text-center py-10 text-slate-400 font-medium italic text-xs leading-relaxed">
                 No conversations yet.<br/>Start a chat with your trainer!
              </div>
           )}
        </div>
      </div>

      {/* --- CHAT AREA --- */}
      <div className="flex-1 flex flex-col bg-slate-50 relative overflow-hidden">
        {currentChat ? (
          <>
            {/* Fixed Background Layer */}
            <div 
                className="absolute inset-0 pointer-events-none z-0"
                style={{ 
                    backgroundImage: 'url("https://elfsight.com/assets/chats/patterns/whatsapp.png")',
                    backgroundSize: '400px',
                    backgroundRepeat: 'repeat'
                }}
            >
                <div className="absolute inset-0 bg-slate-50/60"></div>
            </div>

            {/* Chat Header */}
            <div className="px-8 py-5 border-b border-slate-200 bg-white/95 backdrop-blur-md flex justify-between items-center sticky top-0 z-20 shadow-sm">
               <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg rotate-3">
                     {currentChat.participant?.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                     <h3 className="font-extrabold text-slate-900 text-lg leading-tight">{currentChat.participant?.name}</h3>
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active</span>
                  </div>
               </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth relative z-10 no-scrollbar">
               <div className="flex flex-col space-y-6">
                   {messages.map((msg, index) => {
                      const senderId = msg.sender?._id || msg.sender;
                      const isMe = senderId === user._id;
                      
                      return (
                         <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <div className={`group relative px-5 py-3.5 max-w-[75%] text-[14.5px] leading-relaxed shadow-sm transition-all hover:shadow-md ${
                               isMe 
                               ? 'bg-[#D9F17F] text-slate-900 rounded-3xl rounded-tr-none font-medium' 
                               : 'bg-[#CDE7FE] text-slate-900 rounded-3xl rounded-tl-none font-medium'
                            }`}>
                               <p>{msg.text}</p>
                            </div>
                            <div className={`flex items-center gap-1 mt-1.5 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
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
            <div className="p-6 bg-white border-t border-slate-200 relative z-20">
              <div className="relative flex items-center gap-4">
                <div className="relative flex-1 group">
                    <input
                      type="text"
                      className="w-full bg-slate-100 border-none rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-[#FEEF75] focus:bg-white transition-all text-[15px] placeholder:text-slate-400 font-medium"
                      placeholder="Type your message..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                </div>
                
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  className="bg-[#D9F17F] text-slate-900 w-14 h-14 rounded-2xl flex items-center justify-center font-bold hover:shadow-lg hover:shadow-[#D9F17F]/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
                >
                  <i className="fa-solid fa-paper-plane text-xl"></i>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-12 bg-white/40">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl ring-8 ring-[#CDE7FE]/20">
               <i className="fa-solid fa-comments text-5xl text-[#D9F17F]"></i>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mb-2">No conversation selected</h3>
            <p className="text-slate-500 font-medium max-w-xs text-center leading-relaxed">
                Pick a chat from the sidebar or reach out to your trainer to start messaging.
            </p>
          </div>
        )}
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default Chat;