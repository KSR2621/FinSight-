import { Transaction, Category } from "../types";

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const MODEL = "mistralai/mistral-7b-instruct-v0.1"; // Or any other preferred model on OpenRouter

const callOpenRouter = async (prompt: string, isJson = false) => {
  if (!OPENROUTER_API_KEY) {
    throw new Error("AI_CONFIG_ERROR: OpenRouter API key is missing");
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": window.location.origin,
        "X-Title": "FinSight",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        response_format: isJson ? { type: "json_object" } : undefined,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenRouter API error: ${response.status} ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    if (!data.choices || data.choices.length === 0) {
      throw new Error("Invalid response from OpenRouter");
    }
    return data.choices[0].message.content;
  } catch (error) {
    console.error("AI request failed:", error);
    throw error;
  }
};

export const aiService = {
  // Auto-categorize a transaction description
  categorizeTransaction: async (description: string): Promise<Category> => {
    const prompt = `Categorize this financial transaction description into one of these categories: ${Object.values(Category).join(", ")}. 
    Description: "${description}"
    Return only the category name.`;

    try {
      const text = await callOpenRouter(prompt);
      const category = text.trim() as Category;
      return Object.values(Category).includes(category) ? category : Category.OTHER;
    } catch (error) {
      return Category.OTHER;
    }
  },

  // Generate spending insights and suggestions
  getFinancialInsights: async (transactions: Transaction[], budgets: any[]): Promise<string[]> => {
    const summary = transactions.slice(0, 20).map(t => `${t.date}: ${t.description} - ${t.amount} (${t.category})`).join("\n");
    const prompt = `Analyze these recent transactions and provide 3 actionable financial tips or observations. 
    Keep them short, professional, and encouraging.
    Transactions:
    ${summary}
    Return the response in JSON format with a key "insights" which is an array of strings.`;

    try {
      const text = await callOpenRouter(prompt, true);
      const data = JSON.parse(text);
      return data.insights || ["Keep tracking your expenses to get personalized insights.", "Consider setting up a budget for better control.", "You're doing great! Keep it up."];
    } catch (error) {
      return ["Keep tracking your expenses to get personalized insights.", "Consider setting up a budget for better control.", "You're doing great! Keep it up."];
    }
  },

  // Chatbot response
  getChatResponse: async (message: string, context: { transactions: Transaction[], balance: number }): Promise<string> => {
    const prompt = `You are FinSight AI, a professional financial assistant. 
    User Question: "${message}"
    User Context: Current Balance: ${context.balance}, Recent Transactions: ${context.transactions.slice(0, 5).map(t => t.description).join(", ")}
    Provide a helpful, concise response.`;

    return await callOpenRouter(prompt);
  },

  // Predict future expenses
  getExpenseForecast: async (transactions: Transaction[]): Promise<{ nextWeek: number, nextMonth: number, reasoning: string }> => {
    const expenses = transactions.filter(t => t.type === 'Expense');
    const summary = expenses.slice(0, 50).map(t => `${t.date}: ${t.amount} (${t.category})`).join("\n");
    
    const prompt = `Based on the following historical expense data, predict the total expenses for the next 7 days (next week) and the next 30 days (next month).
    Provide a brief reasoning for your prediction based on spending patterns, recurring costs, or anomalies.
    
    Historical Expenses:
    ${summary}
    
    Return the response in JSON format with these keys: "nextWeek" (number), "nextMonth" (number), "reasoning" (string).`;

    try {
      const text = await callOpenRouter(prompt, true);
      return JSON.parse(text);
    } catch (error) {
      // Fallback calculation
      const avgDaily = expenses.length > 0 
        ? expenses.reduce((sum, t) => sum + t.amount, 0) / (expenses.length * 30) // Very rough estimate
        : 0;
      return {
        nextWeek: avgDaily * 7,
        nextMonth: avgDaily * 30,
        reasoning: "Based on your average daily spending patterns."
      };
    }
  }
};
