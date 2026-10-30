import { config } from '../config/index.js';
import { TutorMessage } from '../types/index.js';

export interface TutorResponse {
  message: string;
  source: 'live_llm' | 'curated_demo';
  disclaimer: string;
}

export class TutorService {
  private static readonly DISCLAIMER =
    'InvestLab AI Finance Tutor provides educational information only, not personalized investment advice or recommendations. Simulated investments carry zero financial risk. Always consult a SEBI-registered financial advisor before making real-world investment decisions.';

  static async askTutor(userMessage: string, history: TutorMessage[] = []): Promise<TutorResponse> {
    const trimmed = userMessage.trim();
    if (!trimmed) {
      throw new Error('Message cannot be empty.');
    }

    // 1. Try forwarding to Python FastAPI AI service if running
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      const response = await fetch(`${config.aiServiceUrl}/api/tutor/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, history }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = (await response.json()) as any;
        if (data && data.reply) {
          return {
            message: data.reply,
            source: data.source || 'live_llm',
            disclaimer: this.DISCLAIMER,
          };
        }
      }
    } catch {
      // Python FastAPI service is offline or not configured; fallback gracefully to curated demo tutor
    }

    // 2. High-quality curated educational tutor engine (Demo mode)
    const reply = this.getCuratedEducationalAnswer(trimmed);
    return {
      message: reply,
      source: 'curated_demo',
      disclaimer: this.DISCLAIMER,
    };
  }

  private static getCuratedEducationalAnswer(query: string): string {
    const q = query.toLowerCase();

    if (q.includes('pe') || q.includes('p/e') || q.includes('price to earnings')) {
      return `### Understanding the Price-to-Earnings (P/E) Ratio

The **Price-to-Earnings (P/E) ratio** tells you how much the market is willing to pay today for every ₹1 of annual profit earned by a company.

**Formula:**
$$\\text{P/E Ratio} = \\frac{\\text{Current Share Price}}{\\text{Earnings Per Share (EPS)}}$$

**Practical Example in Indian Rupees:**
- Suppose **Company A** trades at **₹1,000** and earns an EPS of **₹50**. Its P/E is **20** ($1000 \\div 50$).
- Suppose **Company B** trades at **₹2,000** and also earns an EPS of **₹50**. Its P/E is **40** ($2000 \\div 50$).

**What does this mean?**
1. **Low P/E (e.g. 10–18):** May indicate that a stock is value-priced or that the market anticipates modest future earnings growth.
2. **High P/E (e.g. 35+):** Suggests investors expect rapid future revenue and profit expansion.

*Note: Always compare a company's P/E against its direct sector peers rather than unrelated industries!*`;
    }

    if (q.includes('sip') || q.includes('systematic investment')) {
      return `### Systematic Investment Plans (SIPs) Explained

A **Systematic Investment Plan (SIP)** is a disciplined investing strategy where you invest a fixed sum of money at regular intervals (typically monthly) into mutual funds or index baskets.

**Key Advantages:**
1. **Rupee-Cost Averaging:** When market prices dip, your fixed ₹5,000 buys *more* units; when prices rise, it buys *fewer* units. You never have to predict market tops or bottoms.
2. **The Power of Compounding:** You earn returns not only on your invested principal, but also on your accumulated prior returns.

**Example Calculation:**
- Monthly SIP: **₹5,000**
- Duration: **10 years**
- Assumed Return: **12% per annum**
- Total Invested: **₹6,00,000**
- Estimated Value: **~₹11,61,695** (an estimated gain of over ₹5.6 Lakhs!)

*Disclaimer: Actual mutual fund returns fluctuate with market conditions and are never guaranteed.*`;
    }

    if (q.includes('eps') || q.includes('earnings per share')) {
      return `### What is Earnings Per Share (EPS)?

**Earnings Per Share (EPS)** represents the portion of a company's net profit allocated to each individual share of common stock. It is one of the most vital health indicators of profitability.

**Formula:**
$$\\text{EPS} = \\frac{\\text{Net Profit after Taxes} - \\text{Preferred Dividends}}{\\text{Total Number of Outstanding Shares}}$$

**Example in Indian Rupees:**
- A tech company earns a Net Profit of **₹100 Crores**.
- It has **2 Crore shares** listed on the NSE.
- Its EPS is: $\\text{₹100 Cr} \\div \\text{2 Cr shares} = \\text{₹50 per share}$.

If EPS consistently grows year after year (e.g., from ₹35 to ₹42 to ₹50), it is a positive indicator of growing operational strength.`;
    }

    if (q.includes('diversif') || q.includes('allocation') || q.includes('basket')) {
      return `### What is Portfolio Diversification?

Diversification is the classic principle of **"never putting all your eggs in one basket."** By distributing your capital across various non-correlated sectors and asset classes, you reduce unsystematic risk.

**Why Diversification Matters:**
If you invest 100% of your ₹1,00,000 virtual cash into a single IT company and tech spending slows down globally, your entire portfolio could drop 25%.

**A Balanced Diversified Approach:**
- **Banking & Financial Services (e.g., HDFC Bank, ICICI Bank):** Anchors economic credit growth.
- **IT & Digital Transformation (e.g., TCS, Infosys):** Global export revenue and high return on equity.
- **Consumer Goods / FMCG (e.g., ITC):** Resilient everyday demand that hedges against recessions.
- **Energy & Conglomerates (e.g., Reliance):** Capital-intensive foundational infrastructure.

*Diversification does not eliminate market risk entirely, but it cushions your portfolio from individual company defaults.*`;
    }

    if (q.includes('mutual fund') || q.includes('difference between stocks')) {
      return `### Stocks vs. Mutual Funds: Key Differences

| Feature | Direct Stocks | Mutual Funds |
| :--- | :--- | :--- |
| **What it is** | Direct ownership in a single company | A pooled basket of multiple stocks & bonds |
| **Management** | You conduct all research and timing | Professional fund managers manage the basket |
| **Risk** | Higher company-specific risk | Spreads risk across 30–60+ companies |
| **Costs** | Brokerage fees per trade | Expense Ratio (annual fee deducted from NAV) |
| **Control** | Full control over buy/sell decisions | Fund manager selects individual assets |

For beginners, starting with **broad-market index funds** (like Nifty 50) through monthly SIPs is often the most cost-effective and stress-free way to start.`;
    }

    if (q.includes('risk') || q.includes('volatilit')) {
      return `### Understanding Investment Risk

All financial investments carry some degree of risk. In finance, **risk is closely tied to expected return**: assets with the potential for higher returns generally carry higher volatility and risk of capital loss.

**Types of Risk:**
1. **Market Risk (Systematic):** Broad macroeconomic downturns, inflation, or geopolitical events that impact the entire stock market.
2. **Company Risk (Unsystematic):** Specific risks affecting one business, such as management changes, competitor products, or regulatory fines.
3. **Liquidity Risk:** The difficulty of converting an asset into cash quickly without significant price penalties.

**How to manage risk:**
- Invest with a long-term horizon (5+ years).
- Maintain an emergency fund in liquid bank deposits.
- Use asset allocation across equities, debt, and cash.`;
    }

    // Default friendly educational response
    return `### Welcome to InvestLab Financial Education!

I am your **AI Finance Tutor**. I am here to help you build financial literacy and understand investing concepts in simple terms.

**Topics you can ask me about:**
- **Valuation:** "What is P/E Ratio?" or "How is EPS calculated?"
- **Compounding:** "Explain SIPs with an example"
- **Risk & Allocation:** "What is portfolio diversification?"
- **Instruments:** "What is the difference between stocks and mutual funds?"
- **Simulations:** "How do I calculate realized profit and loss?"

*What financial concept would you like to explore today?*`;
  }
}
