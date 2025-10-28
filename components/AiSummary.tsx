
import React, { useState, useCallback } from 'react';
import { Transaction } from '../types';
import { generateFinancialSummary } from '../services/geminiService';
import { SparklesIcon, RefreshIcon } from './icons';
import ApiKeyModal from './ApiKeyModal';

interface AiSummaryProps {
  transactions: Transaction[];
}

const AiSummary: React.FC<AiSummaryProps> = ({ transactions }) => {
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  const handleGenerateSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await generateFinancialSummary(transactions);
      setSummary(result);
    } catch (err) {
      if (err instanceof Error && err.message.includes("AI service not configured")) {
        setShowApiKeyModal(true);
        setError("Please provide your API key to generate insights.");
      } else {
        setError('Failed to generate summary. Please try again.');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [transactions]);

  return (
    <div className="bg-card dark:bg-gray-800 p-6 rounded-lg shadow-md">
      {showApiKeyModal && (
        <ApiKeyModal
          onClose={() => setShowApiKeyModal(false)}
          onSave={(key) => {
            sessionStorage.setItem('gemini_api_key', key);
            setShowApiKeyModal(false);
            handleGenerateSummary(); // Retry
          }}
        />
      )}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
            <SparklesIcon className="h-6 w-6 text-yellow-400 mr-2" />
            <h3 className="text-lg font-semibold text-text-primary dark:text-white">AI Financial Summary</h3>
        </div>
        <button
          onClick={handleGenerateSummary}
          disabled={isLoading}
          className="flex items-center px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <RefreshIcon className="animate-spin h-5 w-5 mr-2" />
              Generating...
            </>
          ) : (
             'Generate Insights'
          )}
        </button>
      </div>

      {error && <p className="text-red-500">{error}</p>}
      
      {summary ? (
        <div className="prose prose-sm dark:prose-invert max-w-none text-text-secondary dark:text-gray-300" dangerouslySetInnerHTML={{ __html: summary.replace(/\n/g, '<br />') }} />
      ) : (
        <p className="text-text-secondary dark:text-gray-400">Click "Generate Insights" to get an AI-powered summary of your recent financial activity.</p>
      )}
    </div>
  );
};

export default AiSummary;