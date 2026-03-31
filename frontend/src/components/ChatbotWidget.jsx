import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot } from 'lucide-react';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your Farm Bot assistant. Ask me about your farm data, market trends, or platform usage.", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const userMessage = input;
    setMessages(prev => [...prev, { text: userMessage, isBot: false }]);
    setInput('');
    setIsTyping(true);
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { text: data.reply, isBot: true }]);
    } catch (err) {
      setMessages(prev => [...prev, { text: "Network Error: Could not reach the backend AI core.", isBot: true }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999 }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="glass-panel"
            style={{ 
              position: 'absolute', 
              bottom: '5rem', 
              right: '0', 
              width: '350px', 
              height: '500px', 
              padding: 0,
              display: 'flex', 
              flexDirection: 'column', 
              overflow: 'hidden',
              boxShadow: 'var(--shadow-xl)',
              background: 'var(--bg-secondary)'
            }}
          >
            <div style={{ padding: '1.25rem', background: 'var(--primary-accent)', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Bot size={24} />
                <h3 style={{ margin: 0, fontSize: '1rem', color: 'white' }}>Farm Bot</h3>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ color: 'white', opacity: 0.8 }}><X size={20} /></button>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--bg-primary)' }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ alignSelf: msg.isBot ? 'flex-start' : 'flex-end', maxWidth: '80%' }}>
                  <div style={{ 
                    padding: '0.75rem 1rem', 
                    borderRadius: '1rem', 
                    borderBottomLeftRadius: msg.isBot ? 0 : '1rem',
                    borderBottomRightRadius: !msg.isBot ? 0 : '1rem',
                    background: msg.isBot ? 'var(--bg-secondary)' : 'var(--primary-accent)',
                    color: msg.isBot ? 'var(--color-text-main)' : 'white',
                    boxShadow: 'var(--shadow-sm)',
                    fontSize: '0.9rem',
                    border: msg.isBot ? '1px solid rgba(0,0,0,0.05)' : 'none'
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div style={{ alignSelf: 'flex-start', padding: '0.75rem 1rem', background: 'var(--bg-secondary)', borderRadius: '1rem', borderBottomLeftRadius: 0, fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                  <motion.span animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }}>...</motion.span>
                </div>
              )}
            </div>
            
            <form onSubmit={handleSend} style={{ padding: '1rem', background: 'var(--bg-secondary)', borderTop: '1px solid rgba(0,0,0,0.05)', display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                placeholder="Ask AI anything..." 
                style={{ flex: 1, padding: '0.75rem', borderRadius: '1.5rem', border: '1px solid rgba(0,0,0,0.1)', background: 'var(--bg-primary)', outline: 'none' }}
              />
              <button type="submit" style={{ background: 'var(--primary-accent)', color: 'white', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Send size={18} style={{ transform: 'translateX(-1px)' }} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)} 
        style={{ 
          width: '60px', 
          height: '60px', 
          borderRadius: '50%', 
          background: 'var(--primary-accent)', 
          color: 'white',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          boxShadow: 'var(--shadow-lg), var(--shadow-glow-green)'
        }}
      >
        {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
      </motion.button>
    </div>
  );
};

export default ChatbotWidget;
