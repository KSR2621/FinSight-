
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Transaction, ChatMessage } from '../types';
import { startChat } from '../services/geminiService';
import { Chat } from '@google/genai';
import { PaperAirplaneIcon, XMarkIcon, ChatBubbleOvalLeftEllipsisIcon, SparklesIcon } from './icons';

interface AiChatbotProps {
  transactions: Transaction[];
}

const AiChatbot: React.FC<AiChatbotProps> = ({ transactions }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initializeChat = useCallback(() => {
    const chat = startChat(transactions);
    if (chat) {
        chatRef.current = chat;
        setMessages([{
            role: 'model',
            text: "Hello! I'm your personal finance assistant. How can I help you analyze your spending or find savings opportunities today?"
        }]);
        setIsInitialized(true);
    } else {
        setMessages([{
            role: 'model',
            text: "The AI chat feature is not available. Please ensure the API_KEY environment variable is configured correctly."
        }]);
        setIsInitialized(false);
    }
  }, [transactions]);

  useEffect(() => {
    if (isOpen) {
        initializeChat();
    }
  }, [isOpen, initializeChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !chatRef.current) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
        const result = await chatRef.current.sendMessageStream({ message: input });
        let modelResponse = '';
        setMessages(prev => [...prev, { role: 'model', text: '' }]);

        for await (const chunk of result) {
            modelResponse += chunk.text;
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].text = modelResponse;
                return newMessages;
            });
        }
    } catch (error) {
      console.error("Chat error:", error);
      const errorMessage: ChatMessage = { role: 'model', text: "Sorry, I'm having trouble connecting. Please try again later." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className={`fixed bottom-0 right-0 m-6 transition-transform duration-300 ${isOpen ? 'translate-x-full' : 'translate-x-0'}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          aria-label="Open AI Chatbot"
        >
          <ChatBubbleOvalLeftEllipsisIcon className="h-8 w-8" />
        </button>
      </div>

      <div className={`fixed bottom-0 right-0 z-50 w-full h-full sm:h-auto sm:max-w-md sm:max-h-[70vh] flex flex-col bg-card dark:bg-gray-800 shadow-2xl rounded-t-lg sm:rounded-lg sm:m-6 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <div className="flex items-center">
            <SparklesIcon className="h-6 w-6 text-primary dark:text-primary-dark mr-2" />
            <h3 className="text-lg font-semibold text-text-primary dark:text-white">Financial Assistant</h3>
          </div>
          <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-800 dark:hover:text-white">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs md:max-w-sm px-4 py-2 rounded-lg ${msg.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 text-text-primary dark:text-white rounded-bl-none'}`}>
                <p className="text-sm" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />')}} />
              </div>
            </div>
          ))}
          {isLoading && messages[messages.length-1].role === 'user' && (
            <div className="flex justify-start">
               <div className="max-w-xs md:max-w-sm px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-text-primary dark:text-white rounded-bl-none">
                <div className="flex items-center space-x-1">
                    <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></span>
                </div>
               </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
          <form onSubmit={handleSendMessage} className="flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your finances..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-full bg-transparent focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed"
              disabled={isLoading || !isInitialized}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim() || !isInitialized}
              className="bg-primary text-white px-4 py-2 rounded-r-full hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default AiChatbot;
