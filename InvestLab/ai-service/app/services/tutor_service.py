import os
import re
from typing import List, Dict, Any

class TutorEngine:
    SYSTEM_PROMPT = """You are the InvestLab AI Finance Tutor, an educational assistant for students and beginners learning investing.
Your role:
1. Explain financial concepts, terms (P/E, EPS, Market Cap, Beta), and mechanisms in simple, beginner-friendly language.
2. Always use Indian Rupee (₹) and Indian market examples (e.g., NSE, BSE, Nifty 50, TCS, Reliance).
3. SAFETY RULES:
   - Provide financial education ONLY, never personalized investment recommendations.
   - Never promise returns or tell users that a stock is guaranteed to rise or fall.
   - Clearly state that all market investments involve risk and uncertainty.
   - You are NOT a certified financial adviser.
   - Always include an educational disclaimer."""

    DISCLAIMER = "InvestLab AI Finance Tutor provides educational information only, not personalized investment advice or recommendations. Simulated investments carry zero financial risk. Always consult a SEBI-registered financial advisor before making real-world investment decisions."

    @classmethod
    def get_response(cls, message: str, history: List[Dict[str, str]] = None) -> Dict[str, Any]:
        msg_clean = message.strip()
        q = msg_clean.lower()

        # Check if an external LLM key is configured (Gemini or OpenAI)
        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("OPENAI_API_KEY")

        if api_key:
            # When live LLM is configured, call provider (safely wrapped)
            try:
                # Placeholder for live LLM call if credentials provided
                pass
            except Exception:
                pass

        # High-precision curated educational engine for FinTech students
        if "pe" in q or "p/e" in q or "price to earnings" in q:
            reply = """### Price-to-Earnings (P/E) Ratio Explained

The **Price-to-Earnings (P/E) Ratio** measures what the market is willing to pay today for a stock relative to its earnings per share.

$$\\text{P/E Ratio} = \\frac{\\text{Market Price per Share}}{\\text{Earnings per Share (EPS)}}$$

**Practical Example:**
If **TCS** trades at **₹3,875** and has an EPS of **₹124.20**, its P/E ratio is:
$$\\frac{3875}{124.20} \\approx 31.2$$

This indicates investors are paying **₹31.20** for every **₹1** of net profit earned by TCS.

**Key Insights:**
- A **lower P/E** compared to industry peers might signal an undervalued stock or slower expected growth.
- A **higher P/E** indicates investors anticipate rapid future earnings expansion. Always compare companies within the same sector!"""
            return {"reply": reply, "source": "curated_demo", "disclaimer": cls.DISCLAIMER}

        if "sip" in q or "systematic investment" in q:
            reply = """### Systematic Investment Plan (SIP)

A **Systematic Investment Plan (SIP)** is a disciplined method where you invest a fixed amount regularly (e.g., ₹5,000 every month) into a mutual fund or stock basket.

**Why SIPs work so well:**
1. **Rupee-Cost Averaging:** When market prices dip, your ₹5,000 automatically buys *more units*; when prices rally, you buy *fewer units*.
2. **Power of Compounding:** You earn exponential returns on both your principal and past earnings over 5–15+ years.

**Example Calculation:**
- Monthly SIP: **₹5,000**
- Duration: **10 Years**
- Assumed Return: **12% per year**
- Total Invested: **₹6,00,000**
- Estimated Value: **~₹11,50,193** (an estimated gain of over ₹5.5 Lakhs!)"""
            return {"reply": reply, "source": "curated_demo", "disclaimer": cls.DISCLAIMER}

        if "diversif" in q or "allocation" in q:
            reply = """### Portfolio Diversification

**Diversification** is the foundational risk-management principle of spreading investments across different industries, asset classes, and market caps.

**Why it is essential:**
If you invest 100% of your ₹1,00,000 in a single company and that sector experiences headwinds, your entire net worth is at risk.

**A Sample Diversified Basket:**
- **Banking (e.g., HDFC Bank, ICICI Bank):** Drives economic growth and credit cycles.
- **IT (e.g., TCS, Infosys):** Resilient global demand and strong cash dividends.
- **FMCG (e.g., ITC):** Essential consumer staples with steady defensive cash flow.
- **Energy (e.g., Reliance):** Broad industrial and digital connectivity presence."""
            return {"reply": reply, "source": "curated_demo", "disclaimer": cls.DISCLAIMER}

        if "eps" in q or "earnings per share" in q:
            reply = """### Earnings Per Share (EPS)

**Earnings Per Share (EPS)** tells you how much net profit a company generates for each share of common stock outstanding.

$$\\text{EPS} = \\frac{\\text{Net Profit after Tax}}{\\text{Total Number of Outstanding Shares}}$$

**Example:**
If an Indian company earns **₹500 Crores** in profit and has **10 Crore shares** listed on the exchange, its EPS is **₹50 per share** ($500 \\div 10$). Consistently rising EPS over several years indicates robust business expansion."""
            return {"reply": reply, "source": "curated_demo", "disclaimer": cls.DISCLAIMER}

        # Default educational answer
        reply = """### Hello from InvestLab AI Finance Tutor!

I'm your dedicated interactive finance guide. I help you master investing principles with simulated examples in Indian Rupees.

**Quick questions you can ask me:**
- "What is a P/E ratio?"
- "Explain SIPs with an example"
- "What is portfolio diversification?"
- "Explain EPS in simple words"
- "What is the difference between stocks and mutual funds?"
- "How does risk affect investment returns?"

*What topic would you like to explore?*"""
        return {"reply": reply, "source": "curated_demo", "disclaimer": cls.DISCLAIMER}
