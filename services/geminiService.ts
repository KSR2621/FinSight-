import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Transaction, GroundingChunk } from '../types';

/**
 * Gets the AI client on-demand.
 * This function is called before every AI-related request to ensure the client
 * is initialized with the API key, which might not be available at module load time.
 * @returns An instance of GoogleGenAI
 * @throws An error if the API_KEY environment variable is not set.
 */
const getAiClient = (): GoogleGenAI => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("AI service not configured. Please ensure the API_KEY environment variable is set.");
  }
  return new GoogleGenAI({ apiKey });
};

export const getFinancialNews = async (): Promise<{ summary: string; sources: GroundingChunk[] }> => {
  const ai = getAiClient();
  
  try {
    const prompt = "What are the top 5 latest financial news headlines? Provide a brief summary of each.";

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const summary = response.text;
    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    return { summary, sources };
  } catch (error) {
    console.error("Error fetching financial news:", error);
    if (error instanceof Error && error.message.includes("API_KEY")) {
        throw new Error("AI service not configured. Please ensure the API_KEY environment variable is set.");
    }
    throw new Error("Sorry, I couldn't fetch the latest news at this moment.");
  }
};

export const generateFinancialSummary = async (transactions: Transaction[]): Promise<string> => {
  const ai = getAiClient();
  
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
    if (error instanceof Error && error.message.includes("API_KEY")) {
        return "AI service not configured. Please ensure the API_KEY environment variable is set.";
    }
    return "Sorry, I couldn't generate a summary at this moment. Please check the console for errors.";
  }
};

export const generateContentAnalysis = async (content: string): Promise<string> => {
    const ai = getAiClient();
    if (!content.trim()) return "Please provide some content to analyze.";

    try {
      const prompt = `
        Analyze the following text and provide a concise, insightful summary in markdown format.
        - Identify the main topics or arguments.
        - Determine the overall sentiment (e.g., positive, negative, neutral).
        - Extract any key takeaways or conclusions.
  
        Content to analyze:
        ---
        ${content}
        ---
      `;
  
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt
      });
      
      return response.text;
    } catch (error) {
      console.error("Error generating content analysis:", error);
       if (error instanceof Error && error.message.includes("API_KEY")) {
        return "AI service not configured. Please ensure the API_KEY environment variable is set.";
    }
      return "Sorry, I couldn't analyze the content at this moment. Please check the console for errors.";
    }
  };


export const startChat = (transactions: Transaction[]): Chat => {
    const ai = getAiClient();

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

export const startNewsChat = (newsSummary: string): Chat => {
    const ai = getAiClient();

    const history = [
        {
            role: "user",
            parts: [{text: `You are a helpful assistant. Your task is to answer questions based *only* on the provided financial news summary. Do not use any external knowledge. If the answer cannot be found in the summary, clearly state that the provided text does not contain the answer.

            Here is the news summary you must use:
            ---
            ${newsSummary}
            ---
            
            Now, please wait for the user's question.`}],
        },
        {
            role: "model",
            parts: [{text: "I have read the news summary. What would you like to know?"}]
        }
    ];

    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        history: history,
    });
    return chat;
};