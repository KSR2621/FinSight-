import React, { useState, useCallback } from 'react';
import { generateContentAnalysis } from '../services/geminiService';
import { DocumentMagnifyingGlassIcon, RefreshIcon } from './icons';

const AiContentAnalyzer: React.FC = () => {
  const [content, setContent] = useState<string>('');
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyzeContent = useCallback(async () => {
    if (!content.trim()) {
        setError("Please enter some content to analyze.");
        return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysis('');

    try {
      const result = await generateContentAnalysis(content);
      setAnalysis(result);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to analyze content. An unknown error occurred.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [content]);

  return (
    <div className="bg-card dark:bg-gray-800 p-6 rounded-lg shadow-md mt-8">
      <div className="flex items-center mb-4">
        <DocumentMagnifyingGlassIcon className="h-6 w-6 text-secondary dark:text-secondary-dark mr-2" />
        <h3 className="text-lg font-semibold text-text-primary dark:text-white">AI Content Analyzer</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste any text, article, or website content here to get an AI-powered analysis..."
                className="w-full h-64 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-transparent resize-y"
                disabled={isLoading}
            />
            <button
                onClick={handleAnalyzeContent}
                disabled={isLoading || !content.trim()}
                className="mt-4 w-full flex items-center justify-center px-4 py-2 bg-secondary text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors"
                >
                {isLoading ? (
                    <>
                    <RefreshIcon className="animate-spin h-5 w-5 mr-2" />
                    Analyzing...
                    </>
                ) : (
                    'Analyze Content'
                )}
            </button>
        </div>
        
        <div>
            <h4 className="text-md font-semibold text-text-primary dark:text-white mb-2">Analysis Result</h4>
            <div className="w-full h-72 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-900 overflow-y-auto">
                {error && <p className="text-red-500 text-sm">{error}</p>}
                
                {analysis ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none text-text-secondary dark:text-gray-300" dangerouslySetInnerHTML={{ __html: analysis.replace(/\n/g, '<br />') }} />
                ) : (
                    !isLoading && <p className="text-text-secondary dark:text-gray-400">Your analysis will appear here.</p>
                )}
                 {isLoading && (
                    <div className="flex items-center justify-center h-full">
                        <div className="flex items-center space-x-1 text-text-secondary dark:text-gray-400">
                            <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></span>
                            <span className="ml-2">Thinking...</span>
                        </div>
                    </div>
                )}
            </div>
        </div>

      </div>

    </div>
  );
};

export default AiContentAnalyzer;