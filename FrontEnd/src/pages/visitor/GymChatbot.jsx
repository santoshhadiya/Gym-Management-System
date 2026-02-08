import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown'; //
import { useGlobalContext } from '../../context/GlobalContext';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-hot-toast';

const GymChatbot = () => {
  const { api  } = useGlobalContext();
  const { theme, colors } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'bot', text: "Hi! I'm your **Songar's Gym Assistant**. How can I help you today?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleSend = async (e, customText = null) => {
    if (e) e.preventDefault();
    const messageToSend = customText || input;
    if (!messageToSend.trim()) return;

    setMessages(prev => [...prev, { role: 'user', text: messageToSend }]);
    setInput('');
    setIsTyping(true);

    try {
      const { data } = await api.post('/chat/gemini', { userMessage: messageToSend });
      setMessages(prev => [...prev, { role: 'bot', text: data.botResponse }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: "I'm experiencing a technical glitch. Please call us for immediate help!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110"
        style={{ backgroundColor: colors.primary, color: '#000' }}
      >
        <i className={`fa-solid ${isOpen ? 'fa-xmark' : 'fa-comment-dots'} text-2xl`}></i>
      </button>

      {isOpen && (
        <div 
          className="absolute bottom-16 right-0 w-[350px] sm:w-[400px] h-[550px] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300"
          style={{ backgroundColor: colors.card, border: `1px solid ${colors.border}`, backdropFilter: 'blur(20px)' }}
        >
          {/* Header */}
          <div className="p-4 flex items-center gap-3 border-b" style={{ borderColor: colors.border, backgroundColor: colors.primary + '15' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: colors.primary }}>
              <i className="fa-solid fa-robot text-black text-lg"></i>
            </div>
            <div>
              <h4 className="font-black text-xs uppercase tracking-tighter" style={{ color: colors.text }}>Songar's Gym Assistant</h4>
              <span className="text-[10px] font-bold text-green-500 animate-pulse">● Live Support</span>
            </div>
          </div>

          {/* Chat Messages */}
          <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-hide">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'rounded-tr-none' : 'rounded-tl-none'}`}
                  style={{ 
                    backgroundColor: msg.role === 'user' ? colors.primary : colors.background,
                    color: msg.role === 'user' ? '#000' : colors.text,
                    border: msg.role === 'bot' ? `1px solid ${colors.border}` : 'none'
                  }}
                >
                  {/* RENDER BOT MESSAGE AS MARKDOWN */}
                  {msg.role === 'bot' ? (
                    <div className="markdown-content prose prose-sm dark:prose-invert">
                      <ReactMarkdown
                        components={{
                          ul: ({node, ...props}) => <ul className="list-disc ml-4 space-y-1 my-2" {...props} />,
                          strong: ({node, ...props}) => <strong className="font-black text-lime-500" {...props} />, // Highlight pricing/names
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  ) : msg.text}
                </div>
              </div>
            ))}
            {isTyping && <div className="text-xs opacity-50 ml-2" style={{ color: colors.text }}>Assistant is thinking...</div>}
          </div>

          {/* Quick Action Suggestions */}
          {messages.length < 3 && (
            <div className="px-4 pb-2 flex flex-wrap gap-2">
              {['Price Plans', 'Trainer Bio', 'Location'].map(tag => (
                <button 
                  key={tag} 
                  onClick={() => handleSend(null, tag)}
                  className="text-[10px] font-bold px-3 py-1 rounded-full border border-lime-400/30 hover:bg-lime-400/10 transition-all"
                  style={{ color: colors.text }}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-4 border-t flex gap-2" style={{ borderColor: colors.border }}>
            <input 
              type="text" value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="How can I help you join today?"
              className="flex-1 bg-transparent outline-none text-sm p-2" style={{ color: colors.text }}
            />
            <button 
              type="submit" disabled={!input.trim() || isTyping}
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:opacity-80 disabled:opacity-30"
              style={{ backgroundColor: colors.primary, color: '#000' }}
            >
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default GymChatbot;