# Project Algorithms and AI Models

This document outlines the algorithms and AI models used in the FinSight AI platform.

## 1. Large Language Model (AI Intelligence)
The core financial intelligence, including transaction categorization suggestions, financial insights, and the AI chatbot, is powered by:
- **Model**: `mistralai/mistral-7b-instruct-v0.1`
- **Provider**: OpenRouter API
- **Architecture**: Transformer-based LLM optimized for instruction following.

## 2. Financial News Categorization
Real-time news articles fetched from RSS feeds are categorized using a **Keyword-Based Classification Algorithm**:
- **Mechanism**: The backend (`server.ts`) scans the title and content of each article against specific keyword sets.
- **Categories**:
    - **Crypto**: Keywords like "bitcoin", "ethereum", "blockchain", "coinbase".
    - **Startups**: Keywords like "venture capital", "funding round", "ipo", "unicorn".
    - **Technology**: Keywords like "apple", "google", "ai", "nvidia", "software".
    - **Markets**: Keywords like "stock", "nasdaq", "sp 500", "equities".
    - **Economy**: Keywords like "inflation", "fed", "interest rate", "gdp".

## 3. Expense Forecasting
The platform predicts future spending using a **Hybrid Predictive Model**:
- **AI Prediction**: Analyzing historical spending patterns using the Mistral 7B model to identify trends and recurring costs.
- **Heuristic Fallback**: A **Simple Moving Average (SMA)** calculation used as a fallback to provide estimates based on average daily spending when API limits or errors occur.

## 4. Financial Calculations
- **Balance & Budget Tracking**: Standard **Aggregation Algorithms** ($O(n)$ complexity) are used to compute real-time balances, category-wise spending, and budget progress.
- **Wealth Horizon**: Uses **Compound Interest formulas** and **Linear Projection algorithms** to simulate wealth growth over time based on current savings rates and expected returns.
