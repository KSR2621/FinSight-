import React, { useState, useCallback } from 'react';
import { getFinancialNews } from '../services/geminiService';
import { NewspaperIcon, RefreshIcon } from './icons';
import { GroundingChunk } from '../types';

const News: React.FC = () => {
  const [newsSummary, setNewsSummary] = useState<string | null>(null);
  const [sources, setSources] = useState<GroundingChunk[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetchNews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setNewsSummary(null);
    setSources([]);

    try {
      const result = await getFinancialNews();
      setNewsSummary(result.summary);
      setSources(result.sources);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch news. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
        {error && <p className="text-red-500">{error}</p>}
        
        {newsSummary ? (
            <>
                <div className="prose prose-sm dark:prose-invert max-w-none text-text-secondary dark:text-gray-300" dangerouslySetInnerHTML={{ __html: newsSummary.replace(/\n/g, '<br />') }} />
                {sources.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-300 dark:border-gray-600">
                        <h4 className="text-xs font-semibold uppercase text-text-secondary dark:text-gray-400 mb-2">Sources</h4>
                        <ul className="list-disc list-inside space-y-1">
                            {sources.map((source, index) => (
                                <li key={index} className="text-sm">
                                    <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">
                                        {source.web.title || source.web.uri}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </>
        ) : (
            !isLoading && <p className="text-text-secondary dark:text-gray-400">Click "Get Latest News" to see an AI-powered summary of what's happening in the financial world.</p>
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
    </div>
  );
};

export default News;
