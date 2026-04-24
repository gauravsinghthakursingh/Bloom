import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Leaf, Sparkles, MessageSquareShare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { chatWithBloom } from '../services/aiService';
import { cn } from '../lib/utils';
import { contactSupportWhatsApp } from '../lib/billUtils';
import { Button } from './ui/Button';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hi! I\'m Bloom, your plant care assistant. How can I help you grow your green space today? 🌱' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    const response = await chatWithBloom(userMessage);
    
    setMessages(prev => [...prev, { role: 'model', text: response || 'Something went wrong.' }]);
    setIsLoading(false);
  };

  const handleWhatsAppHandoff = () => {
    const lastUserMsg = messages.filter(m => m.role === 'user').pop()?.text;
    const message = lastUserMsg 
      ? `Hi, Bloom AI couldn't quite help with this: "${lastUserMsg}". Can you help?`
      : undefined;
    contactSupportWhatsApp(message);
  };

  return (
    <div className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-50">
      <AnimatePresence>
        {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20, transformOrigin: 'bottom right' }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="absolute bottom-16 right-0 w-[calc(100vw-3rem)] sm:w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden flex flex-col h-[500px] transition-colors"
            >
              {/* Header */}
              <div className="bg-green-600 dark:bg-green-700 p-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-white/20 p-2 rounded-full">
                    <Leaf className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm">Bloom AI</h3>
                    <div className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
                      <span className="text-[10px] text-green-100">Always online</span>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="hover:bg-white/20 p-1 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
  
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50 dark:bg-gray-950/50 transition-colors">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      "flex flex-col max-w-[85%]",
                      msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                    )}
                  >
                    <div
                      className={cn(
                        "px-4 py-2 rounded-2xl text-sm leading-relaxed transition-colors",
                        msg.role === 'user' 
                          ? "bg-green-600 dark:bg-green-700 text-white rounded-br-none" 
                          : "bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-700 rounded-bl-none"
                      )}
                    >
                      <div className="[&>p]:mb-2 [&>ul]:list-disc [&>ul]:ml-4 [&>ol]:list-decimal [&>ol]:ml-4 [&>li]:mb-1 last:[&>p]:mb-0">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
                      {msg.role === 'user' ? 'You' : 'Bloom'}
                    </span>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex max-w-[85%] mr-auto items-start">
                    <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 shadow-sm border border-gray-100 dark:border-gray-700 rounded-2xl rounded-bl-none px-4 py-3 flex gap-1 transition-colors">
                      <div className="w-1.5 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
                
                {messages.length > 2 && !isLoading && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-center pt-2"
                  >
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-[11px] h-8 bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/50 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 font-bold gap-2 rounded-full shadow-sm transition-colors"
                      onClick={handleWhatsAppHandoff}
                    >
                      <MessageSquareShare className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                      Talk to Support on WhatsApp
                    </Button>
                  </motion.div>
                )}
              </div>
  
              {/* Input */}
              <form 
                onSubmit={handleSend}
                className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex gap-2 transition-colors"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about plant care..."
                  className="flex-1 bg-gray-100 dark:bg-gray-800 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-green-500 transition-all outline-none text-gray-900 dark:text-gray-100"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="bg-green-600 dark:bg-green-700 text-white p-2 rounded-xl hover:bg-green-700 dark:hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </form>
            </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors relative",
          isOpen ? "bg-red-500 text-white" : "bg-green-600 text-white"
        )}
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <>
            <MessageCircle className="w-6 h-6" />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-amber-400 text-gray-900 p-1 rounded-full border-2 border-white"
            >
              <Sparkles className="w-2.5 h-2.5 fill-current" />
            </motion.div>
          </>
        )}
      </motion.button>
    </div>
  );
};
