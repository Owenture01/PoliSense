import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Loader2, Sparkles, Trash2 } from 'lucide-react';
import { Chat, GenerateContentResponse } from "@google/genai";
import { createChatSession } from '../services/geminiService';

interface ChatInterfaceProps {
  pdfBase64: string;
  chatId: string;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ pdfBase64, chatId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isInitializedRef = useRef(false);

  // Initialize chat and load history
  useEffect(() => {
    isInitializedRef.current = false;
    const storageKey = `politico_chat_${chatId}`;
    const savedHistory = localStorage.getItem(storageKey);
    
    let initialMessages: Message[] = [];
    
    if (savedHistory) {
      try {
        initialMessages = JSON.parse(savedHistory);
      } catch (e) {
        console.error("Failed to parse chat history", e);
      }
    }
    
    // If no history, set default welcome message
    if (initialMessages.length === 0) {
      initialMessages = [
        { id: 'init', role: 'model', text: "Hi! I've analyzed the article. Ask me anything about its content, sources, or bias." }
      ];
    }
    
    setMessages(initialMessages);

    // Prepare history for API (filter out the pure UI init message)
    // The API needs to know previous context to answer follow-up questions
    const apiHistory = initialMessages
      .filter(m => m.id !== 'init')
      .map(m => ({ role: m.role, text: m.text }));

    // Create session with restored history
    chatSessionRef.current = createChatSession(pdfBase64, apiHistory);
    isInitializedRef.current = true;
    
  }, [pdfBase64, chatId]);

  // Save history to localStorage whenever messages change
  useEffect(() => {
    if (!isInitializedRef.current) return;
    
    const storageKey = `politico_chat_${chatId}`;
    if (messages.length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, chatId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !chatSessionRef.current || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const result: GenerateContentResponse = await chatSessionRef.current.sendMessage({ message: userMsg.text });
      const responseText = result.text || "I'm sorry, I couldn't generate a response.";
      
      const botMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: responseText 
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      const errorMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: "Sorry, I encountered an error. Please try again." 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = (e: React.MouseEvent) => {
      e.stopPropagation();
      if(window.confirm("Are you sure you want to clear this chat history?")) {
        const storageKey = `politico_chat_${chatId}`;
        localStorage.removeItem(storageKey);
        setMessages([{ id: 'init', role: 'model', text: "History cleared. Ask me anything about the article." }]);
        // Re-initialize session without history
        chatSessionRef.current = createChatSession(pdfBase64, []);
      }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* Chat Window */}
      <div 
        className={`bg-white w-80 md:w-96 rounded-2xl shadow-2xl border border-gray-200 overflow-hidden mb-4 transition-all duration-300 origin-bottom-right pointer-events-auto flex flex-col ${
          isOpen ? 'opacity-100 scale-100 translate-y-0 h-[500px]' : 'opacity-0 scale-95 translate-y-4 h-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-white">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-bold">Article Assistant</h3>
          </div>
          <div className="flex items-center gap-1">
             <button 
                onClick={clearHistory} 
                className="text-white/60 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-colors"
                title="Clear History"
             >
                <Trash2 className="w-4 h-4" />
             </button>
             <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white p-1 transition-colors">
                <X className="w-5 h-5" />
             </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isLoading && (
             <div className="flex justify-start">
               <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                 <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 shrink-0 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the article..."
            className="flex-grow bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-0 rounded-full px-4 py-2 text-sm transition-all outline-none"
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="pointer-events-auto bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center group"
      >
        {isOpen ? (
          <X className="w-7 h-7" />
        ) : (
          <MessageSquare className="w-7 h-7" />
        )}
      </button>
    </div>
  );
};

export default ChatInterface;