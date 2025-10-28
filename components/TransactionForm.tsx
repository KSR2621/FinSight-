import React, { useState, useEffect, useRef } from 'react';
import { Transaction, TransactionType, Category } from '../types';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../constants';
import { XMarkIcon, MicrophoneIcon } from './icons';

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


interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
  onEdit: (transaction: Transaction) => void;
  transactionToEdit: Transaction | null;
}

type MicStatus = 'idle' | 'starting' | 'listening';

const TransactionForm: React.FC<TransactionFormProps> = ({ isOpen, onClose, onAdd, onEdit, transactionToEdit }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [category, setCategory] = useState<Category>(Category.FOOD);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [micStatus, setMicStatus] = useState<MicStatus>('idle');
  const [isSpeechRecognitionSupported, setIsSpeechRecognitionSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (transactionToEdit) {
      setDescription(transactionToEdit.description);
      setAmount(String(transactionToEdit.amount));
      setType(transactionToEdit.type);
      setCategory(transactionToEdit.category);
      setDate(transactionToEdit.date);
    } else {
      // Reset form
      setDescription('');
      setAmount('');
      setType(TransactionType.EXPENSE);
      setCategory(Category.FOOD);
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [transactionToEdit, isOpen]);
  
  useEffect(() => {
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    setIsSpeechRecognitionSupported(!!SpeechRecognitionAPI);
    if (!SpeechRecognitionAPI) {
      console.warn('Speech Recognition not supported in this browser.');
    }
  }, []);


  useEffect(() => {
    // Update category list when type changes
    if (type === TransactionType.INCOME) {
      setCategory(INCOME_CATEGORIES[0]);
    } else {
      setCategory(EXPENSE_CATEGORIES[0]);
    }
  }, [type]);
  
  const handleToggleListening = () => {
    if (micStatus === 'listening') {
      recognitionRef.current?.stop();
      // onend will handle state transition
      return;
    }

    if (micStatus === 'starting' || !isSpeechRecognitionSupported) {
      return; // Do nothing if already starting or not supported
    }

    setMicStatus('starting');
    
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
      setDescription(transcript);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      // The onend event will fire after an error, cleaning up the state.
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const transactionData = {
      description,
      amount: parseFloat(amount),
      type,
      category,
      date,
    };
    if (transactionToEdit) {
      onEdit({ ...transactionData, id: transactionToEdit.id });
    } else {
      onAdd(transactionData);
    }
  };

  if (!isOpen) return null;

  const categoryOptions = type === TransactionType.INCOME ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const isMicActive = micStatus === 'listening' || micStatus === 'starting';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-card dark:bg-gray-800 rounded-lg p-8 w-full max-w-md m-4">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-text-primary dark:text-white">{transactionToEdit ? 'Edit' : 'Add'} Transaction</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <XMarkIcon className="h-6 w-6"/>
            </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-gray-300">Description</label>
            <div className="relative mt-1">
              <input type="text" value={description} onChange={e => setDescription(e.target.value)} required 
                     className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-transparent pr-10" />
              {isSpeechRecognitionSupported && (
                <button
                  type="button"
                  onClick={handleToggleListening}
                  disabled={micStatus === 'starting'}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-primary disabled:text-gray-300 disabled:cursor-wait"
                  aria-label={isMicActive ? 'Stop listening' : 'Start listening'}
                >
                  <MicrophoneIcon className={`h-5 w-5 ${isMicActive ? 'text-red-500 animate-pulse' : ''}`} />
                </button>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-gray-300">Amount</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} required min="0.01" step="0.01"
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-transparent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-gray-300">Type</label>
            <select value={type} onChange={e => setType(e.target.value as TransactionType)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-card dark:bg-gray-700">
              <option value={TransactionType.EXPENSE}>Expense</option>
              <option value={TransactionType.INCOME}>Income</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-gray-300">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value as Category)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-card dark:bg-gray-700">
              {categoryOptions.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary dark:text-gray-300">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} required
                   className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary bg-card dark:bg-gray-700" />
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-gray-300 dark:border-gray-500 rounded-md text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-md hover:bg-indigo-700">{transactionToEdit ? 'Save Changes' : 'Add Transaction'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;