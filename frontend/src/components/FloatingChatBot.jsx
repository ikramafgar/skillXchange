import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Send, X, Maximize2, Minimize2 } from 'lucide-react';
import { generateLocalResponse, simulateThinking } from '../utils/localAI';
import { useLocation } from 'react-router-dom';

const FloatingChatBot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your SkillXchange assistant. How can I help you today?",
      sender: 'ai'
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const location = useLocation();
  
  // List of paths where the chatbot should be hidden
  const hiddenPaths = [
    '/admin',
    '/chat',
    '/messages',
    '/payment',
    '/payment-result',
    '/verify-email'
    // Add more paths as needed
  ];
  
  // Check if chatbot should be hidden based on current path
  const isChatbotHidden = () => {
    return hiddenPaths.some(path => location.pathname.startsWith(path));
  };

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    // Initial check
    checkMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Adjust height for mobile devices when keyboard appears/disappears
  useEffect(() => {
    if (!isMobile) return;
    
    const handleResize = () => {
      if (!chatContainerRef.current) return;
      
      // Only adjust height when expanded on mobile
      if (isExpanded) {
        // Get visual viewport height
        const viewportHeight = window.visualViewport?.height || window.innerHeight;
        // Adjust height based on viewport
        chatContainerRef.current.style.height = `${viewportHeight * 0.6}px`;
      } else {
        // Reset to default height when collapsed
        chatContainerRef.current.style.height = '';
      }
    };
    
    window.visualViewport?.addEventListener('resize', handleResize);
    window.addEventListener('resize', handleResize);
    
    // Initial setup
    handleResize();
    
    return () => {
      window.visualViewport?.removeEventListener('resize', handleResize);
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobile, isExpanded]);

  const handleSend = async (e) => {
    e.preventDefault();

    if (input.trim() === '') return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: input,
      sender: 'user',
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // If chat is in compact mode, expand it
    if (isMobile && !isExpanded) {
      setIsExpanded(true);
    }

    try {
      // Simulate AI thinking delay
      await simulateThinking();
      
      // Generate response using local AI
      const responseText = generateLocalResponse(input);
      
      const aiMessage = {
        id: messages.length + 2,
        text: responseText,
        sender: 'ai',
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      
      const errorMessage = {
        id: messages.length + 2,
        text: 'Sorry, I encountered an error. Please try again later.',
        sender: 'ai',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Reset expanded state when opening chat
      setIsExpanded(false);
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Determine chat container size
  const getChatContainerClasses = () => {
    if (!isOpen) return 'hidden';
    
    let baseClasses = 'flex flex-col absolute bottom-16 right-4 sm:right-6 rounded-xl shadow-xl overflow-hidden border border-gray-100 bg-white z-50 transition-all duration-300';
    
    if (isMobile) {
      return `${baseClasses} ${isExpanded 
        ? 'w-[calc(100vw-32px)] h-[50vh] max-h-[450px]' 
        : 'w-[calc(100vw-32px)] h-[300px]'}`;
    }
    
    return `${baseClasses} ${isExpanded 
      ? 'w-[420px] md:w-[480px] lg:w-[550px] h-[550px] max-h-[75vh]' 
      : 'w-80 sm:w-96 h-96'}`;
  };
  
  // If the current path is in the hiddenPaths list, don't render the chatbot
  if (isChatbotHidden()) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Chat container */}
      <div 
        ref={chatContainerRef}
        className={getChatContainerClasses()}
        style={{
          maxHeight: isExpanded ? 'calc(90vh - 80px)' : '', 
          bottom: isMobile ? '64px' : '16px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Chat header */}
        <div className="flex justify-between items-center p-3 bg-gradient-to-r from-indigo-600 to-blue-500 text-white">
          <div className="flex items-center space-x-2">
            <MessageSquare size={18} className="text-indigo-100" />
            <span className="font-semibold">SkillXchange Assistant</span>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={toggleExpanded}
              aria-label={isExpanded ? "Minimize chat" : "Expand chat"}
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
            >
              {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button 
              onClick={toggleChat}
              aria-label="Close chat"
              className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 p-4 overflow-y-auto bg-white">
          <div className="space-y-4">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-tr-none shadow-md'
                      : 'bg-gray-100 text-gray-800 shadow-sm rounded-tl-none'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.text}</p>
                </div>
              </motion.div>
            ))}

            {isTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-gray-100 text-gray-800 p-4 rounded-2xl rounded-tl-none max-w-[85%] shadow-sm">
                  <div className="flex space-x-1.5">
                    <motion.div 
                      className="w-2.5 h-2.5 rounded-full bg-indigo-500"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: 0 }}
                    ></motion.div>
                    <motion.div 
                      className="w-2.5 h-2.5 rounded-full bg-indigo-500"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
                    ></motion.div>
                    <motion.div 
                      className="w-2.5 h-2.5 rounded-full bg-indigo-500"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
                    ></motion.div>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <form onSubmit={handleSend} className="p-3 border-t border-gray-100 bg-white">
          <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-2 py-2 bg-transparent text-gray-800 focus:outline-none text-sm"
            />
            <button
              type="submit"
              aria-label="Send message"
              className={`p-2 rounded-full text-white transition-colors ${
                isTyping || input.trim() === '' 
                  ? 'bg-indigo-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
              disabled={isTyping || input.trim() === ''}
            >
              <Send size={16} className="transform rotate-45" />
            </button>
          </div>
        </form>
      </div>

      {/* Floating button to open chat */}
      {!isOpen && (
        <motion.button
          onClick={toggleChat}
          aria-label="Open chat"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-indigo-600 to-blue-500 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <MessageSquare size={24} className="sm:h-6 sm:w-6" />
        </motion.button>
      )}
    </div>
  );
};

export default FloatingChatBot; 