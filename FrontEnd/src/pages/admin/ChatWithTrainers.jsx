import React, { useState, useEffect, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { io } from "socket.io-client";
import { useGlobalContext } from '../../context/GlobalContext';

const ChatWithTrainer = () => {
    const {BACKEND_URL}=useGlobalContext();
  // --- STATE (LOGIC UNTOUCHED) ---
  const [trainers, setTrainers] = useState([]); 
  const [conversations, setConversations] = useState([]); 
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  
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

  // --- FETCH DATA (LOGIC UNTOUCHED) ---
  useEffect(() => {
      const fetchData = async () => {
          try {
              setLoading(true);
              const trainerRes = await fetch(`${BACKEND_URL}/api/trainers/data`, { 
                   headers: { Authorization: `Bearer ${user.token}` }
              });
              let trainerData = [];
              if (trainerRes.ok) {
                   trainerData = await trainerRes.json();
              } else {
                   const userRes = await fetch(`${BACKEND_URL}/api/admin/users?role=trainer`, {
                        headers: { Authorization: `Bearer ${user.token}` }
                   });
                   if(userRes.ok) trainerData = await userRes.json();
              }
              setTrainers(trainerData);

              const convRes = await fetch(`${BACKEND_URL}/api/chat/conversations`, {
                  headers: { Authorization: `Bearer ${user.token}` }
              });
              const convData = await convRes.json();
              setConversations(convData);
          } catch (error) {
              console.error(error);
              toast.error("Failed to load data");
          } finally {
              setLoading(false);
          }
      };
      if(user) fetchData();
  }, []);

  // --- SOCKET SETUP (LOGIC UNTOUCHED) ---
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

  // --- LOGIC FUNCTIONS (LOGIC UNTOUCHED) ---
  const handleTrainerSelect = async (trainer) => {
      const existing = conversations.find(c => c.participant?._id === trainer._id);
      if (existing) {
          selectChat(existing);
      } else {
          try {
              const res = await fetch(`${BACKEND_URL}/api/chat/conversation`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
                  body: JSON.stringify({ receiverId: trainer._id })
              });
              const newConv = await res.json();
              const fixedConv = { ...newConv, participant: trainer };
              setConversations([fixedConv, ...conversations]);
              selectChat(fixedConv);
          } catch (err) {
              toast.error("Failed to start chat");
          }
      }
  };

  const selectChat = async (conv) => {
      setCurrentChat(conv);
      try {
        const res = await fetch(`${BACKEND_URL}/api/chat/messages/${conv._id}`, {
            headers: { Authorization: `Bearer ${user.token}` }
        });
        const data = await res.json();
        setMessages(data);
      } catch (err) {
        console.error(err);
      }
  };

  const handleSend = async () => {
      if (!input.trim() || !currentChat) return;
      const text = input;
      setInput("");
      
      setMessages(prev => [...prev, { 
          _id: Date.now(), 
          sender: { _id: user._id, name: user.name }, 
          text, 
          createdAt: new Date().toISOString() 
      }]);
      
      try {
          const res = await fetch(`${BACKEND_URL}/api/chat/message`, {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
              body: JSON.stringify({ conversationId: currentChat._id, text })
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
                 ? { ...c, lastMessage: text, updatedAt: new Date().toISOString() } 
                 : c
             ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
          });
      } catch (err) {
          toast.error("Failed to send");
      }
  };

  // Merge list (LOGIC UNTOUCHED)
  const displayList = trainers.map(t => {
      const conv = conversations.find(c => c.participant?._id === t._id);
      return {
          ...t,
          conversationId: conv?._id,
          lastMessage: conv?.lastMessage || "Start a new conversation",
          updatedAt: conv?.updatedAt,
          participant: t
      };
  }).sort((a, b) => {
      if (a.updatedAt && b.updatedAt) return new Date(b.updatedAt) - new Date(a.updatedAt);
      if (a.updatedAt) return -1;
      if (b.updatedAt) return 1;
      return 0;
  });

  return (
    <div className="flex h-[88vh] bg-slate-100 rounded-3xl overflow-hidden shadow-2xl border border-white font-sans mx-auto max-w-7xl mt-4 relative">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar theme="colored" />

      {/* Sidebar - Theme colors integrated */}
      <div className="w-80 md:w-96 border-r border-slate-200 bg-[#CDE7FE]/30 backdrop-blur-md flex flex-col shrink-0">
        <div className="p-2 px-6 border-b border-slate-200 bg-white/80">
            <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Messages</h2>
                <div className="bg-[#D9F17F] text-slate-800 p-2 rounded-full h-8 w-8 flex items-center justify-center text-xs font-bold">
                    {displayList.length}
                </div>
            </div>
            <p className="text-sm text-slate-500 font-medium">Chat with fitness experts</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
            {loading ? (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                    <div className="w-8 h-8 border-4 border-[#D9F17F] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-400 text-sm font-medium">Syncing trainers...</p>
                </div>
            ) : (
                displayList.map(t => (
                    <div 
                        key={t._id} 
                        onClick={() => handleTrainerSelect(t)} 
                        className={`group relative p-2 px-2 rounded-2xl cursor-pointer flex items-center gap-4 transition-all duration-300 ${
                            currentChat?.participant?._id === t._id 
                            ? 'bg-white ring-2 ring-[#FEEF75] translate-x-1' 
                            : 'hover:bg-white '
                        }`}
                    >
                        <div className={`relative w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center text-slate-800 font-bold text-lg shadow-sm transition-transform group-hover:scale-105 ${
                            currentChat?.participant?._id === t._id ? 'bg-[#D9F17F]' : 'bg-white border border-slate-200'
                        }`}>
                            {t.name[0]?.toUpperCase()}
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-1">
                                <h4 className="font-bold text-slate-900 text-[15px] truncate">{t.name}</h4>
                                {t.updatedAt && (
                                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-tighter">
                                        {new Date(t.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                )}
                            </div>
                            <p className={`text-xs truncate transition-colors ${
                                currentChat?.participant?._id === t._id ? 'text-slate-900 font-medium' : 'text-slate-500'
                            }`}>
                                {t.lastMessage}
                            </p>
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>

      {/* Chat Area - WhatsApp pattern background */}
      <div className="flex-1 flex flex-col bg-slate-50 relative overflow-hidden">
        {currentChat ? (
            <>
                {/* Fixed Background Layer for the whole chat section */}
                <div 
                    className="absolute inset-0 pointer-events-none z-0"
                    style={{ 
                        backgroundImage: 'url("https://elfsight.com/assets/chats/patterns/whatsapp.png")',
                        backgroundSize: '400px',
                        backgroundRepeat: 'repeat'
                    }}
                >
                    {/* Consistent overlay for the entire section */}
                    <div className="absolute inset-0 bg-slate-50/60"></div>
                </div>

                <div className="px-8 py-2 border-b border-slate-200 bg-white/95 backdrop-blur-md flex justify-between items-center sticky top-0 z-20 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg rotate-3">
                            {currentChat.participant?.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                            <h3 className="font-extrabold text-slate-900 text-lg leading-tight">{currentChat.participant?.name}</h3>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Trainer</span>
                        </div>
                    </div>
                </div>

                {/* Messages container - Transparent to show the fixed background layer */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth relative z-10 no-scrollbar">
                    <div className="flex flex-col space-y-6">
                        {messages.map((msg, i) => {
                            const isMe = msg.sender === user._id || msg.sender?._id === user._id;
                            return (
                                <div key={i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
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
                            )
                        })}
                        {/* Scroll Target */}
                        <div ref={messagesEndRef} className="h-2 w-full" />
                    </div>
                </div>

                <div className="p-1 px-2  border-t border-slate-200 relative z-20">
                    <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative flex items-center gap-4">
                        <div className="relative flex-1 group">
                            <input 
                                className="w-full bg-slate-100 border-none rounded-2xl px-6 py-3 focus:outline-none focus:ring-2 focus:ring-[#FEEF75] focus:bg-white transition-all text-[15px] placeholder:text-slate-400 font-medium"
                                placeholder="Type your message..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                            />
                        </div>
                        <button 
                            type="submit" 
                            disabled={!input.trim()} 
                            className="bg-[#D9F17F] text-slate-900 w-12 h-12 rounded-2xl flex items-center justify-center font-bold hover:shadow-lg hover:shadow-[#D9F17F]/30 hover:-translate-y-0.5 transition-all disabled:opacity-90 disabled:translate-y-0 disabled:shadow-none"
                        >
                            <i className="fa-solid fa-paper-plane text-xl"></i>
                        </button>
                    </form>
                </div>
            </>
        ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-12 bg-white/40">
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl ring-8 ring-[#CDE7FE]/20">
                    <i className="fa-regular fa-comment-dots text-5xl text-[#D9F17F]"></i>
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 mb-2">No conversation selected</h3>
                <p className="text-slate-500 font-medium max-w-xs text-center leading-relaxed">
                    Pick a trainer from the sidebar to start discussing your fitness goals.
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

export default ChatWithTrainer;