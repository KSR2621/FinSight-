import React, { useState, useCallback, useRef, useEffect } from 'react';
import { getFinancialNews, startNewsChat } from '../services/geminiService';
import { NewspaperIcon, RefreshIcon, MicrophoneIcon, PaperAirplaneIcon } from './icons';
import { GroundingChunk, ChatMessage } from '../types';
import { Chat } from '@google/genai';

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  onstart: () => void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: { new(): SpeechRecognition };
    webkitSpeechRecognition: { new(): SpeechRecognition };
  }
}

const News: React.FC = () => {
  const [newsSummary, setNewsSummary] = useState<string | null>(null);
  const [sources, setSources] = useState<GroundingChunk[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  const [micStatus, setMicStatus] = useState<'idle' | 'listening'>('idle');
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSpeechRecognitionSupported(!!SpeechRecognitionAPI);
  }, []);
  
  const handleFetchNews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setNewsSummary(null);
    setSources([]);
    setChatMessages([]);
    chatRef.current = null;

    try {
      const result = await getFinancialNews();
      setNewsSummary(result.summary);
      setSources(result.sources);
      
      const chatSession = startNewsChat(result.summary);
      if (chatSession) {
        chatRef.current = chatSession;
        setChatMessages([{ role: 'model', text: "I've read the news summary. What would you like to know?" }]);
      } else {
        setChatMessages([{ role: 'model', text: "News loaded, but the follow-up chat is unavailable." }]);
      }

    } catch (err: any) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('Failed to fetch news. An unknown error occurred.');
        }
        console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendNewsMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading || !chatRef.current) return;

    const userMessage: ChatMessage = { role: 'user', text: chatInput };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsChatLoading(true);

    try {
        const result = await chatRef.current.sendMessageStream({ message: chatInput });
        let modelResponse = '';
        setChatMessages(prev => [...prev, { role: 'model', text: '' }]);

        for await (const chunk of result) {
            modelResponse += chunk.text;
            setChatMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].text = modelResponse;
                return newMessages;
            });
        }
    } catch (error) {
      console.error("News chat error:", error);
      const errorMessageText = error instanceof Error ? error.message : "Sorry, I encountered an error. Please try again.";
      const errorMessage: ChatMessage = { role: 'model', text: errorMessageText };
      setChatMessages(prev => {
          const newMessages = [...prev];
          if(newMessages.length > 0 && newMessages[newMessages.length-1].text === ''){
            newMessages[newMessages.length-1] = errorMessage;
          } else {
            newMessages.push(errorMessage);
          }
          return newMessages;
      });
    } finally {
      setIsChatLoading(false);
    }
  };
  
  const handleToggleListening = () => {
    if (micStatus === 'listening') {
      recognitionRef.current?.stop();
      return;
    }

    if (!isSpeechRecognitionSupported) return;

    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    recognitionRef.current = recognition;

    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setMicStatus('listening');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setChatInput(prev => prev ? `${prev} ${transcript}` : transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };
    
    recognition.onend = () => {
      setMicStatus('idle');
      recognitionRef.current = null;
    };
    
    try {
        recognition.start();
    } catch (e) {
        console.error("Failed to start speech recognition:", e);
        setMicStatus('idle');
        recognitionRef.current = null;
    }
  };

  return (
    <div className="bg-card dark:bg-gray-800 p-6 rounded-lg shadow-md mt-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
        <div className="flex items-center">
          <NewspaperIcon className="h-6 w-6 text-primary dark:text-primary-dark mr-2" />
          <h3 className="text-lg font-semibold text-text-primary dark:text-white">Latest Financial News</h3>
        </div>
        <button
          onClick={handleFetchNews}
          disabled={isLoading}
          className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <RefreshIcon className="animate-spin h-5 w-5 mr-2" />
              Fetching News...
            </>
          ) : (
            'Get Latest News'
          )}
        </button>
      </div>

      <div className="w-full min-h-[10rem] p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900 overflow-y-auto">
        {error && <p className="text-red-500 text-sm">{error}</p>}
        
        {newsSummary ? (
            <>
                <div className="prose prose-sm dark:prose-invert max-w-none text-text-secondary dark:text-gray-300" dangerouslySetInnerHTML={{ __html: newsSummary.replace(/\n/g, '<br />') }} />
                {sources.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
                        <h4 className="text-xs font-semibold uppercase text-text-secondary dark:text-gray-400 mb-2">Sources</h4>
                        <ul className="list-disc list-inside space-y-1">
                            {/* FIX: Add checks for optional properties to prevent runtime errors. */}
                            {sources.map((source, index) => (
                                source.web?.uri && (
                                <li key={index} className="text-sm">
                                    <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                                        {source.web.title || source.web.uri}
                                    </a>
                                </li>
                                )
                            ))}
                        </ul>
                    </div>
                )}
            </>
        ) : (
            !isLoading && !error && <p className="text-text-secondary dark:text-gray-400">Click "Get Latest News" to see an AI-powered summary of what's happening in the financial world.</p>
        )}
        {isLoading && (
            <div className="flex items-center justify-center h-full">
                <div className="flex items-center space-x-1 text-text-secondary dark:text-gray-400">
                    <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></span>
                    <span className="ml-2">Searching the web...</span>
                </div>
            </div>
        )}
      </div>

      {newsSummary && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-md font-semibold text-text-primary dark:text-white mb-2">Ask a follow-up question</h4>
          
          <div className="h-64 p-2 overflow-y-auto space-y-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900 mb-2">
            {chatMessages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs md:max-w-sm px-3 py-2 rounded-lg ${msg.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 text-text-primary dark:text-white rounded-bl-none'}`}>
                  <p className="text-sm" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />')}} />
                </div>
              </div>
            ))}
            {isChatLoading && chatMessages.length > 0 && chatMessages[chatMessages.length - 1].role === 'user' && (
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
            <div ref={chatMessagesEndRef} />
          </div>

          <form onSubmit={handleSendNewsMessage} className="flex items-center">
            <div className="relative w-full">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about the news above..."
                className="w-full pl-4 pr-12 py-2 border border-gray-300 dark:border-gray-600 rounded-l-md bg-transparent focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed"
                disabled={isChatLoading || !chatRef.current}
              />
              {isSpeechRecognitionSupported && (
                <button
                  type="button"
                  onClick={handleToggleListening}
                  disabled={isChatLoading || !chatRef.current}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-primary disabled:text-gray-300"
                  aria-label={micStatus === 'listening' ? 'Stop listening' : 'Start listening'}
                >
                  <MicrophoneIcon className={`h-5 w-5 ${micStatus === 'listening' ? 'text-red-500 animate-pulse' : ''}`} />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={isChatLoading || !chatInput.trim() || !chatRef.current}
              className="bg-primary text-white px-4 py-2 rounded-r-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed h-[42px]"
            >
              <PaperAirplaneIcon className="h-5 w-5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default News;
