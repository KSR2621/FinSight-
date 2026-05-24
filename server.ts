import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import Parser from 'rss-parser';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_FILE = path.join(__dirname, 'data.json');

async function loadData() {
  const defaultData = {
    transactions: [],
    budgets: [],
    goals: [],
    bills: [
      { id: '1', name: 'Electricity Bill', amount: 1200, dueDate: '2026-04-05', isPaid: false, category: 'Utilities' },
      { id: '2', name: 'Internet', amount: 800, dueDate: '2026-04-10', isPaid: true, category: 'Utilities' },
    ],
    portfolio: [
      { id: '1', symbol: 'RELIANCE', name: 'Reliance Industries', quantity: 10, averagePrice: 2400, currentPrice: 2850, type: 'stock' },
      { id: '2', symbol: 'BTC', name: 'Bitcoin', quantity: 0.05, averagePrice: 45000, currentPrice: 65000, type: 'crypto' },
    ]
  };

  try {
    const data = await fs.readFile(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    return {
      ...defaultData,
      ...parsed,
      transactions: Array.isArray(parsed.transactions) ? parsed.transactions : [],
      budgets: Array.isArray(parsed.budgets) ? parsed.budgets : [],
      goals: Array.isArray(parsed.goals) ? parsed.goals : [],
      bills: Array.isArray(parsed.bills) ? parsed.bills : defaultData.bills,
      portfolio: Array.isArray(parsed.portfolio) ? parsed.portfolio : defaultData.portfolio,
    };
  } catch (error) {
    return defaultData;
  }
}

async function saveData(data: any) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Transactions API
  app.get('/api/transactions', async (req, res) => {
    const data = await loadData();
    res.json(data.transactions);
  });

  app.post('/api/transactions', async (req, res) => {
    const data = await loadData();
    const newTransaction = { ...req.body, id: Math.random().toString(36).substr(2, 9) };
    data.transactions.push(newTransaction);
    await saveData(data);
    res.status(201).json(newTransaction);
  });

  app.put('/api/transactions/:id', async (req, res) => {
    const { id } = req.params;
    const data = await loadData();
    const index = data.transactions.findIndex((t: any) => t.id === id);
    if (index !== -1) {
      data.transactions[index] = { ...data.transactions[index], ...req.body };
      await saveData(data);
      res.json(data.transactions[index]);
    } else {
      res.status(404).json({ error: 'Transaction not found' });
    }
  });

  app.delete('/api/transactions/:id', async (req, res) => {
    const { id } = req.params;
    const data = await loadData();
    data.transactions = data.transactions.filter((t: any) => t.id !== id);
    await saveData(data);
    res.status(204).send();
  });

  // Budgets API
  app.get('/api/budgets', async (req, res) => {
    const data = await loadData();
    res.json(data.budgets);
  });

  app.post('/api/budgets', async (req, res) => {
    const data = await loadData();
    const newBudget = { ...req.body, id: Math.random().toString(36).substr(2, 9) };
    data.budgets.push(newBudget);
    await saveData(data);
    res.status(201).json(newBudget);
  });

  app.put('/api/budgets/:id', async (req, res) => {
    const { id } = req.params;
    const data = await loadData();
    const index = data.budgets.findIndex((b: any) => b.id === id);
    if (index !== -1) {
      data.budgets[index] = { ...data.budgets[index], ...req.body };
      await saveData(data);
      res.json(data.budgets[index]);
    } else {
      res.status(404).json({ error: 'Budget not found' });
    }
  });

  app.delete('/api/budgets/:id', async (req, res) => {
    const { id } = req.params;
    const data = await loadData();
    data.budgets = data.budgets.filter((b: any) => b.id !== id);
    await saveData(data);
    res.status(204).send();
  });

  // Goals API
  app.get('/api/goals', async (req, res) => {
    const data = await loadData();
    res.json(data.goals);
  });

  app.post('/api/goals', async (req, res) => {
    const data = await loadData();
    const newGoal = { ...req.body, id: Math.random().toString(36).substr(2, 9) };
    data.goals.push(newGoal);
    await saveData(data);
    res.status(201).json(newGoal);
  });

  app.put('/api/goals/:id', async (req, res) => {
    const { id } = req.params;
    const data = await loadData();
    const index = data.goals.findIndex((g: any) => g.id === id);
    if (index !== -1) {
      data.goals[index] = { ...data.goals[index], ...req.body };
      await saveData(data);
      res.json(data.goals[index]);
    } else {
      res.status(404).json({ error: 'Goal not found' });
    }
  });

  app.delete('/api/goals/:id', async (req, res) => {
    const { id } = req.params;
    const data = await loadData();
    data.goals = data.goals.filter((g: any) => g.id !== id);
    await saveData(data);
    res.status(204).send();
  });

  // Bills API
  app.get('/api/bills', async (req, res) => {
    const data = await loadData();
    res.json(data.bills);
  });

  // Portfolio API
  app.get('/api/portfolio', async (req, res) => {
    const data = await loadData();
    res.json(data.portfolio);
  });

  // News API with Caching
  const parser = new Parser();
  let newsCache: { data: any, timestamp: number } | null = null;
  const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  const NEWS_SOURCES = [
    { name: 'BBC Business', url: 'http://feeds.bbci.co.uk/news/business/rss.xml', defaultCategory: 'Global' },
    { name: 'CNN Business', url: 'http://rss.cnn.com/rss/money_latest.rss', defaultCategory: 'Economy' },
    { name: 'Yahoo Finance', url: 'https://finance.yahoo.com/news/rssindex', defaultCategory: 'Markets' },
    { name: 'Google News Finance', url: 'https://news.google.com/rss/search?q=finance+markets+crypto+startups&hl=en-US&gl=US&ceid=US:en', defaultCategory: 'General' }
  ];

  app.get('/api/news', async (req, res) => {
    try {
      if (newsCache && (Date.now() - newsCache.timestamp < CACHE_DURATION)) {
        return res.json(newsCache.data);
      }

      const feedPromises = NEWS_SOURCES.map(async (source) => {
        try {
          const feed = await parser.parseURL(source.url);
          return feed.items.map(item => ({
            title: item.title,
            link: item.link,
            pubDate: item.pubDate,
            content: item.contentSnippet || item.content,
            source: source.name,
            category: source.defaultCategory, // Initial category based on source
            guid: item.guid || item.link
          }));
        } catch (error) {
          console.error(`Error fetching feed from ${source.name}:`, error);
          return [];
        }
      });

      const results = await Promise.all(feedPromises);
      let allNews = results.flat();

      // Sort by date
      allNews.sort((a, b) => {
        return new Date(b.pubDate || 0).getTime() - new Date(a.pubDate || 0).getTime();
      });

      // Simple keyword-based categorization enhancement
      allNews = allNews.map(item => {
        const text = (item.title + ' ' + (item.content || '')).toLowerCase();
        if (text.includes('crypto') || text.includes('bitcoin') || text.includes('ethereum') || text.includes('blockchain') || text.includes('binance') || text.includes('coinbase')) {
          item.category = 'Crypto';
        } else if (text.includes('startup') || text.includes('venture capital') || text.includes('funding round') || text.includes('ipo ') || text.includes('unicorn') || text.includes('founder')) {
          item.category = 'Startups';
        } else if (text.includes('tech') || text.includes('apple') || text.includes('google') || text.includes('microsoft') || text.includes('ai ') || text.includes('nvidia') || text.includes('software')) {
          item.category = 'Technology';
        } else if (text.includes('market') || text.includes('stock') || text.includes('nasdaq') || text.includes('sp 500') || text.includes('dow jones') || text.includes('equities') || text.includes('trading')) {
          item.category = 'Markets';
        } else if (text.includes('economy') || text.includes('inflation') || text.includes('fed ') || text.includes('interest rate') || text.includes('recession') || text.includes('gdp') || text.includes('fiscal')) {
          item.category = 'Economy';
        }
        return item;
      });

      newsCache = {
        data: allNews,
        timestamp: Date.now()
      };

      res.json(allNews);
    } catch (error) {
      console.error('News fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch news' });
    }
  });

  // AI Features
  app.post('/api/ai/forecast', (req, res) => {
    const { history } = req.body;
    const forecast = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000).toISOString(),
      amount: 100 + Math.random() * 50
    }));
    res.json({ forecast });
  });

  app.get('/api/ai/health-score', (req, res) => {
    res.json({
      score: 78,
      breakdown: {
        savings: 85,
        spending: 70,
        investments: 65,
        debt: 90
      },
      suggestions: [
        "You can save ₹2,000 more this month by reducing food delivery.",
        "Consider increasing your SIP in Nifty 50 Index Fund.",
        "Anomaly detected: Unusual spending at 'Apple Store' flagged."
      ]
    });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
