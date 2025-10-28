
import { GoogleGenAI, Chat } from "@google/genai";
import { Transaction } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateFinancialSummary = async (transactions: Transaction[]): Promise<string> => {
  if (!API_KEY) return "API Key not configured. Please add your Gemini API key.";
  try {
    const prompt = `
      Analyze the following financial transactions and provide a concise, insightful summary.
      - Highlight the biggest spending categories.
      - Mention the total income vs. total expenses.
      - Offer one smart suggestion for saving money based on the spending patterns.
      - Keep the tone encouraging and helpful.
      - Format the output as markdown.

      Transactions:
      ${JSON.stringify(transactions.slice(0, 50), null, 2)}
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
    });
    
    return response.text;
  } catch (error) {
    console.error("Error generating financial summary:", error);
    return "Sorry, I couldn't generate a summary at this moment. Please check the console for errors.";
  }
};


export const startChat = (transactions: Transaction[]): Chat => {
    const history = [
        {
            role: "user",
            parts: [{text: `You are a friendly and knowledgeable financial assistant for an expense tracker app. Your goal is to help users understand their finances and make better decisions. You have access to their recent transactions.

            Here are the user's transactions:
            ${JSON.stringify(transactions.slice(0, 50), null, 2)}
            
            Based on this data, answer user's questions. Be concise, helpful, and never give professional financial advice, but rather suggestions based on their provided data. Start the conversation by greeting the user and asking how you can help with their finances today.`}],
        },
        {
            role: "model",
            parts: [{text: "Hello! I'm your personal finance assistant. I can see your latest transactions. How can I help you analyze your spending or find savings opportunities today?"}]
        }
    ];

    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        history: history,
    });
    return chat;
};
