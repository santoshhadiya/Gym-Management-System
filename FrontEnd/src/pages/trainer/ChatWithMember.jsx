import React, { useState, useEffect, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { io } from "socket.io-client";

const BACKEND_URL = "http://localhost:5000";

const ChatWithMember = () => {
    // --- STATE (LOGIC UNTOUCHED) ---
    const [conversations, setConversations] = useState([]); // Active chats
    const [assignedMembers, setAssignedMembers] = useState([]); // All assigned members
    const [currentChat, setCurrentChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [socket, setSocket] = useState(null);
    const [loading, setLoading] = useState(true);

    const messagesEndRef = useRef(null);
    const currentChatRef = useRef(currentChat);
    const user = JSON.parse(localStorage.getItem("userInfo"));

    // Keep ref in sync with state
    useEffect(() => {
        currentChatRef.current = currentChat;
    }, [currentChat]);

    // --- AUTO SCROLL LOGIC ---
    useEffect(() => {
        if (messages.length > 0) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    }, [messages]);

    // --- INITIAL DATA FETCHING (LOGIC UNTOUCHED) ---
    useEffect(() => {
        const initData = async () => {
            if (!user || !user.token) {
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                const convRes = await fetch(`${BACKEND_URL}/api/chat/conversations`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                const convData = await convRes.json();
                const memberChats = convData.filter(
                    (c) => c.participant?.role === "member"
                );

                setConversations(memberChats);
                if (user.role === 'trainer') {
                    const membersRes = await fetch(`${BACKEND_URL}/api/trainers/${user._id}/members/all`, {
                        headers: { Authorization: `Bearer ${user.token}` }
                    });
                    if (membersRes.ok) {
                        const membersData = await membersRes.json();
                        setAssignedMembers(membersData);
                    }
                }
            } catch (error) {
                console.error(error);
                toast.error("Could not load chat data");
            } finally {
                setLoading(false);
            }
        };
        initData();
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

    // --- STYLE INJECTION ---
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

    // --- SELECT CHAT / START NEW (LOGIC UNTOUCHED) ---
    const handleMemberSelect = async (member) => {
        const targetId = member._id || member.participant?._id;
        const existingConv = conversations.find(c => c.participant?._id === targetId);

        if (existingConv) {
            selectChat(existingConv);
        } else {
            try {
                const res = await fetch(`${BACKEND_URL}/api/chat/conversation`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user.token}`
                    },
                    body: JSON.stringify({ receiverId: targetId })
                });
                if (!res.ok) throw new Error("Failed to start chat");
                const newConv = await res.json();
                setConversations(prev => [newConv, ...prev]);
                selectChat(newConv);
            } catch (err) {
                toast.error("Could not start chat");
            }
        }
    };

    const selectChat = async (conv) => {
        setCurrentChat(conv);
        try {
            const res = await fetch(`${BACKEND_URL}/api/chat/messages/${conv._id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (!res.ok) throw new Error("Failed to load messages");
            const data = await res.json();
            setMessages(data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load history");
        }
    };

    const handleSend = async () => {
        if (!input.trim() || !currentChat) return;
        const text = input;
        setInput("");

        const tempMsg = {
            _id: Date.now(),
            sender: { _id: user._id, name: user.name },
            text,
            createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempMsg]);

        try {
            const res = await fetch(`${BACKEND_URL}/api/chat/message`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${user.token}` },
                body: JSON.stringify({ conversationId: currentChat._id, text })
            });
            if (!res.ok) throw new Error("Failed to send");
            const savedMsg = await res.json();
            if (socket) {
                socket.emit("sendMessage", {
                    senderId: user._id,
                    receiverId: currentChat.participant?._id,
                    message: savedMsg
                });
            }
            setConversations(prev => {
                const updated = prev.map(c =>
                    c._id === currentChat._id
                        ? { ...c, lastMessage: text, updatedAt: new Date().toISOString() }
                        : c
                );
                return updated.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
            });
        } catch (err) {
            toast.error("Message not sent");
        }
    };

    // Merge Lists Logic (STAYED AS PROVIDED)
    const displayList = [...conversations];
    assignedMembers.forEach(m => {
        const hasConv = conversations.some(c => c.participant?._id === m._id);
        // User provided logic ends here
    });

    return (
        <div className="flex h-[88vh] bg-slate-100 rounded-3xl overflow-hidden shadow-2xl border border-white font-sans mx-auto max-w-7xl mt-4 relative">
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar theme="colored" />

            {/* Sidebar List - Theme Integrated */}
            <div className="w-80 md:w-96 border-r border-slate-200 bg-[#CDE7FE]/30 backdrop-blur-md flex flex-col shrink-0">
                <div className="p-8 border-b border-slate-200 bg-white/80">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">Members</h2>
                        <div className="bg-[#D9F17F] text-slate-800 p-2 rounded-full h-8 w-8 flex items-center justify-center text-xs font-bold">
                            {displayList.length}
                        </div>
                    </div>
                    <p className="text-sm text-slate-500 font-medium">Manage your assigned trainees</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2 no-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full gap-3">
                            <div className="w-8 h-8 border-4 border-[#D9F17F] border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-slate-400 text-sm font-medium">Syncing members...</p>
                        </div>
                    ) : displayList.length === 0 ? (
                        <div className="text-center mt-10 px-4">
                            <p className="text-slate-400 font-medium italic">No members found.</p>
                        </div>
                    ) : (
                        displayList.map((item) => {
                            const participant = item.participant || {};
                            const isActive = currentChat?.participant?._id === participant._id;
                            if (!participant.name) return null;

                            return (
                                <div
                                    key={participant._id || item._id}
                                    onClick={() => handleMemberSelect(participant)}
                                    className={`group relative p-4 rounded-2xl cursor-pointer flex items-center gap-4 transition-all duration-300 ${isActive
                                        ? "bg-white shadow-xl ring-2 ring-[#FEEF75] translate-x-1"
                                        : "hover:bg-white hover:shadow-lg"
                                        }`}
                                >
                                    <div className={`relative w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center text-slate-800 font-bold text-lg shadow-sm transition-transform group-hover:scale-105 ${
                                        isActive ? "bg-[#D9F17F]" : "bg-white border border-slate-200"
                                    }`}>
                                        {participant.name?.[0]?.toUpperCase()}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex justify-between items-baseline mb-1">
                                            <p className="font-bold text-slate-900 text-[15px] truncate">
                                                {participant.name}
                                            </p>
                                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-tighter">
                                                {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : ""}
                                            </span>
                                        </div>

                                        <p className={`text-xs truncate transition-colors ${
                                            isActive ? "text-slate-900 font-medium" : "text-slate-500"
                                        }`}>
                                            {item.lastMessage || "Start conversation"}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Chat Area - WhatsApp Pattern + Soft Overlay */}
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

                        <div className="px-8 py-5 border-b border-slate-200 bg-white/95 backdrop-blur-md flex justify-between items-center sticky top-0 z-20 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-11 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg rotate-3">
                                    {currentChat.participant?.name?.[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-slate-900 text-lg leading-tight">{currentChat.participant?.name}</h3>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Member</span>
                                </div>
                            </div>
                        </div>

                        {/* Messages container */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth relative z-10 no-scrollbar">
                            <div className="flex flex-col space-y-6">
                                {messages.map((msg, i) => {
                                    const senderId = msg.sender?._id || msg.sender;
                                    const isMe = senderId === user._id;

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
                                                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                                <div ref={messagesEndRef} className="h-2 w-full" />
                            </div>
                        </div>

                        <div className="p-6 bg-white border-t border-slate-200 relative z-20">
                            <form 
                                onSubmit={e => { e.preventDefault(); handleSend(); }}
                                className="relative flex items-center gap-4"
                            >
                                <div className="relative flex-1 group">
                                    <input
                                        className="w-full bg-slate-100 border-none rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-[#FEEF75] focus:bg-white transition-all text-[15px] placeholder:text-slate-400 font-medium"
                                        value={input}
                                        onChange={e => setInput(e.target.value)}
                                        placeholder="Type a message..."
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="bg-[#D9F17F] text-slate-900 w-14 h-14 rounded-2xl flex items-center justify-center font-bold hover:shadow-lg hover:shadow-[#D9F17F]/30 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
                                    disabled={!input.trim()}
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
                            Select a member from your assigned list to begin messaging.
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

export default ChatWithMember;