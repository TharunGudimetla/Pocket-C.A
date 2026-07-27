import { AiReply } from '../types';
import { env } from '../config/env';
import { logger } from '../utils/logger';

/**
 * ---------------------------------------------------------------------------
 * AI SERVICE
 * ---------------------------------------------------------------------------
 */

export const SYSTEM_PROMPT = `You are Pocket C.A. (Pocket Chartered Accountant), an AI assistant that
explains Accounting and Finance concepts to beginners in simple language.
Only answer questions about: accounting, bookkeeping, GST, income tax, TDS,
journal entries, ledgers, trial balance, balance sheets, P&L, cash flow,
depreciation, auditing basics, budgeting, savings, loans, interest, business
and personal finance, investments, working capital, financial ratios and
planning. For anything else, politely decline and redirect.

Answer naturally, like a patient teacher in a chat. Make every answer simple
and easy for a beginner to understand. Use plain words, short sentences, and
one small real-life example when it helps. Explain jargon in brackets the first
time you use it. Do not make answers too long: usually 2 to 5 short paragraphs
or a few bullets are enough.

GREETING RULE: Do NOT say "Hello", "Hello there", or introduce yourself as Pocket C.A. in follow-up messages. Only greet at the very beginning of a brand new conversation. In all follow-up messages within an existing chat, answer directly without repeating greetings or self-introductions.

Do not use the same fixed template every time. Choose the structure that fits
the user's question: sometimes a short paragraph, sometimes bullets, sometimes
steps, and sometimes a tiny comparison table. Avoid repeating the same headings
unless they genuinely help. Keep answers clear, practical, and concise.
This is educational content, not professional financial or legal advice.`;

const OFF_TOPIC_REPLY =
  "I'm Pocket C.A., an AI assistant focused on Accounting and Finance. Please ask questions related to Accounting, Bookkeeping, Taxation, or Finance.";

const FINANCE_KEYWORDS = [
  'account', 'accounting', 'gst', 'tax', 'tds', 'bookkeeping', 'journal',
  'ledger', 'trial balance', 'balance sheet', 'profit', 'loss', 'p&l',
  'depreciation', 'audit', 'budget', 'saving', 'loan', 'interest', 'emi',
  'finance', 'financial', 'investment', 'invest', 'asset', 'liability',
  'equity', 'expense', 'revenue', 'income', 'cash flow', 'working capital',
  'ratio', 'roi', 'debit', 'credit', 'capital', 'inventory', 'payroll',
  'invoice', 'receivable', 'payable', 'stock market', 'mutual fund', 'sip',
  'itr', 'salary', 'ppf', 'nps', 'insurance', 'compound interest',
];

const OFF_TOPIC_KEYWORDS = [
  'movie', 'film', 'cricket', 'football', 'sport', 'match', 'politics',
  'election', 'weather', 'game', 'gaming', 'song', 'music', 'recipe',
  'programming', 'code', 'travel', 'trip', 'celebrity', 'actor',
];

function isOnTopic(question: string): boolean {
  const q = question.toLowerCase();
  const hasFinanceWord = FINANCE_KEYWORDS.some((kw) => q.includes(kw));
  const hasOffTopicWord = OFF_TOPIC_KEYWORDS.some((kw) => q.includes(kw));
  if (hasFinanceWord) return true;
  if (hasOffTopicWord) return false;
  return true;
}

function removeLeadingGreetings(text: string): string {
  let cleaned = text.replace(/^(Hello[^\n]*!?[^\n]*\n+)+/i, '');
  cleaned = cleaned.replace(/^Hello there![^\n]*\n*/i, '');
  cleaned = cleaned.replace(/^Hello![^\n]*\n*/i, '');
  cleaned = cleaned.replace(/^Hi there![^\n]*\n*/i, '');
  cleaned = cleaned.replace(/^Hi![^\n]*\n*/i, '');
  cleaned = cleaned.replace(/^As your Pocket C\.A\.,?[^\n]*\n*/i, '');
  cleaned = cleaned.trim();
  return cleaned || text;
}

interface KnowledgeEntry {
  keywords: string[];
  build: () => string;
}

function section(
  title: string,
  simple: string,
  example: string,
  why: string,
  keyPoints: string[],
  related: string[]
): string {
  const points = keyPoints.map((p) => `- ${p}`).join('\n');
  const questions = related.map((r) => `- ${r}`).join('\n');
  return `### ${title}

**1. Simple Explanation**
${simple}

**2. Real-life Example**
${example}

**3. Why it Matters**
${why}

**4. Key Points to Remember**
${points}

**5. Related Questions**
${questions}`;
}

const KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    keywords: ['gst', 'goods and services tax'],
    build: () =>
      section(
        'What is GST?',
        'GST (Goods and Services Tax) is a single tax charged on the sale of most goods and services in India, replacing many older taxes like VAT and service tax.',
        'When you buy a ₹1,000 shirt with 12% GST, you pay ₹1,120 in total. The extra ₹120 goes to the government as tax, collected by the shop on its behalf.',
        'GST simplifies taxation, avoids "tax on tax", and makes it easier for businesses to operate across states with one uniform tax system.',
        [
          'GST has slabs: 0%, 5%, 12%, 18%, and 28%.',
          'It has three parts: CGST, SGST (within a state) and IGST (between states).',
          'Businesses above a turnover limit must register for GST.',
          'Input Tax Credit lets businesses reduce tax paid on purchases.',
        ],
        [
          'What is the difference between CGST and SGST?',
          'What is Input Tax Credit?',
          'Who needs to register for GST?',
        ]
      ),
  },
  {
    keywords: ['debit', 'credit', 'debit and credit'],
    build: () =>
      section(
        'Debit and Credit',
        'Debit and Credit are the two sides of every accounting entry. Debit means value coming into an account, Credit means value going out — together they always balance.',
        'If you buy office supplies for ₹500 in cash, you Debit "Supplies" (an asset increases) and Credit "Cash" (an asset decreases) by ₹500.',
        'Every transaction affects at least two accounts. Understanding debit and credit is the foundation of double-entry bookkeeping and accurate financial records.',
        [
          'Assets and Expenses increase with a Debit.',
          'Liabilities, Equity, and Income increase with a Credit.',
          'Total debits must always equal total credits.',
          'This is called the "double-entry" system.',
        ],
        [
          'What is a Journal Entry?',
          'What is the Golden Rules of Accounting?',
          'What is a Ledger?',
        ]
      ),
  },
  {
    keywords: ['bookkeeping', 'book keeping'],
    build: () =>
      section(
        'What is Bookkeeping?',
        'Bookkeeping is the day-to-day process of recording all financial transactions of a business — sales, purchases, receipts, and payments.',
        'A small shop owner writing down every sale and expense in a register (or software like Tally) every day is doing bookkeeping.',
        'Accurate bookkeeping keeps a business organized, helps with tax filing, and gives owners a clear picture of where their money is going.',
        [
          'Bookkeeping is the base; Accounting analyzes those records.',
          'Can be done manually or with software (Tally, Zoho Books, QuickBooks).',
          'Includes recording sales, purchases, receipts, and payments.',
          'Good bookkeeping makes audits and tax filing much easier.',
        ],
        [
          'What is the difference between Bookkeeping and Accounting?',
          'What is a Journal Entry?',
          'What is a Trial Balance?',
        ]
      ),
  },
  {
    keywords: ['balance sheet'],
    build: () =>
      section(
        'What is a Balance Sheet?',
        'A Balance Sheet is a financial statement that shows what a business owns (Assets), what it owes (Liabilities), and the owner\'s share (Equity) at a specific point in time.',
        'A company might show ₹10 lakh in Assets (cash, equipment, inventory), ₹4 lakh in Liabilities (loans, unpaid bills), and ₹6 lakh in Equity — the owner\'s actual stake.',
        'It tells investors, banks, and owners how financially healthy a business is, and whether it can cover its debts.',
        [
          'Formula: Assets = Liabilities + Equity.',
          'It is a "snapshot" at one date, not over a period.',
          'Assets are usually listed as Current (short-term) and Non-Current (long-term).',
          'Used alongside the Profit & Loss statement for a full picture.',
        ],
        [
          'What is the difference between Assets and Liabilities?',
          'What is a Profit and Loss statement?',
          'What are Financial Ratios?',
        ]
      ),
  },
  {
    keywords: ['journal entry', 'journal entries'],
    build: () =>
      section(
        'What is a Journal Entry?',
        'A Journal Entry is the first, chronological record of a business transaction, showing which accounts are debited and which are credited.',
        'When a business pays ₹2,000 rent in cash: Debit "Rent Expense" ₹2,000, Credit "Cash" ₹2,000 — recorded on the date it happened.',
        'Journal entries are the building blocks of all financial statements — without accurate entries, reports like the Balance Sheet would be wrong.',
        [
          'Recorded in chronological (date) order.',
          'Every entry needs at least one Debit and one Credit of equal value.',
          'Entries are later posted to the Ledger.',
          'Also called the "book of original entry".',
        ],
        [
          'What is a Ledger?',
          'What is Debit and Credit?',
          'What is a Trial Balance?',
        ]
      ),
  },
  {
    keywords: ['cash flow'],
    build: () =>
      section(
        'What is Cash Flow?',
        'Cash Flow is the movement of money into and out of a business — it shows whether a business actually has cash on hand, not just paper profit.',
        'A business can show ₹5 lakh profit on paper but still run out of cash if customers haven\'t paid their bills yet — that\'s a cash flow problem.',
        'Managing cash flow well ensures a business can pay salaries, rent, and suppliers on time, even if profits look good on paper.',
        [
          'Three types: Operating, Investing, and Financing cash flow.',
          'Positive cash flow means more money is coming in than going out.',
          'Profit and cash flow are not the same thing.',
          'Tracked using a Cash Flow Statement.',
        ],
        [
          'What is Working Capital?',
          'What is a Profit and Loss statement?',
          'How do I manage business expenses better?',
        ]
      ),
  },
  {
    keywords: ['income tax'],
    build: () =>
      section(
        'What is Income Tax?',
        'Income Tax is a tax the government charges on the income earned by individuals and businesses in a financial year, based on tax slabs.',
        'If your annual salary is ₹8,00,000, part of it is taxed at 0%, part at 5%, part at 10% and so on, depending on the current slab rates — not the whole amount at one rate.',
        'Understanding income tax helps you plan investments, claim eligible deductions, and avoid last-minute filing stress.',
        [
          'India uses slab-based taxation (progressive tax).',
          'You can choose between the Old and New tax regimes.',
          'Deductions (like 80C) can lower your taxable income under the old regime.',
          'Filed annually as an ITR (Income Tax Return).',
        ],
        [
          'What is TDS?',
          'What is the difference between Old and New tax regime?',
          'What is an ITR?',
        ]
      ),
  },
  {
    keywords: ['tds'],
    build: () =>
      section(
        'What is TDS?',
        'TDS (Tax Deducted at Source) means tax is deducted upfront by the payer (like an employer or bank) before paying you, and deposited with the government on your behalf.',
        'If your bank pays you ₹50,000 interest and deducts 10% TDS, you receive ₹45,000 and the bank sends ₹5,000 directly to the Income Tax Department.',
        'TDS ensures a steady flow of tax revenue and reduces tax evasion by collecting tax at the source of income itself.',
        [
          'Deducted on salary, interest, rent, professional fees, etc.',
          'The deductor gives you a TDS certificate (Form 16 / 16A).',
          'TDS deducted can be claimed/adjusted while filing your ITR.',
          'Different payments have different TDS rates.',
        ],
        [
          'What is Income Tax?',
          'What is Form 16?',
          'How do I claim a TDS refund?',
        ]
      ),
  },
  {
    keywords: ['asset', 'liability', 'assets and liabilities', 'liabilities'],
    build: () =>
      section(
        'Assets vs Liabilities',
        'An Asset is something a business or person owns that has value (cash, property, equipment). A Liability is something owed to someone else (loans, unpaid bills).',
        'A car you own outright is an Asset. A car loan you still owe the bank for is a Liability.',
        'Knowing the difference helps you (and businesses) understand true net worth — Assets minus Liabilities equals Equity or personal net worth.',
        [
          'Assets: cash, inventory, equipment, receivables, property.',
          'Liabilities: loans, unpaid salaries, accounts payable.',
          'Formula: Assets = Liabilities + Equity.',
          'More assets than liabilities generally means better financial health.',
        ],
        [
          'What is a Balance Sheet?',
          'What is Equity?',
          'What is Working Capital?',
        ]
      ),
  },
  {
    keywords: ['budget', 'budgeting'],
    build: () =>
      section(
        'What is Budgeting?',
        'Budgeting is the process of planning how much money you\'ll earn and spend over a period, so you can control your finances instead of being surprised by them.',
        'A simple 50/30/20 personal budget: 50% of income on needs, 30% on wants, and 20% on savings/investments.',
        'A good budget helps you avoid debt, build savings, and reach financial goals like buying a home or building an emergency fund.',
        [
          'Track income and expenses regularly (weekly/monthly).',
          'Separate "needs" from "wants".',
          'Build an emergency fund (3–6 months of expenses).',
          'Businesses use budgets to plan spending across departments.',
        ],
        [
          'What is Cash Flow?',
          'What is Compound Interest?',
          'How do I start saving effectively?',
        ]
      ),
  },
  {
    keywords: ['compound interest'],
    build: () =>
      section(
        'What is Compound Interest?',
        'Compound Interest is interest calculated on both the original amount you invested/borrowed AND on the interest already earned, so your money (or debt) grows faster over time.',
        'Invest ₹10,000 at 10% annual compound interest: Year 1 you earn ₹1,000 (total ₹11,000); Year 2 you earn 10% of ₹11,000 = ₹1,100 (total ₹12,100), and so on.',
        'It\'s why starting to invest early matters so much — compounding rewards time in the market more than trying to time the market.',
        [
          'Formula: A = P (1 + r/n)^(nt).',
          'The more frequently interest compounds, the faster growth happens.',
          'Works against you too — credit card debt compounds the same way.',
          'Long time horizons dramatically boost compounding effects.',
        ],
        [
          'What is Simple Interest?',
          'What is SIP (Systematic Investment Plan)?',
          'How does compounding affect loans?',
        ]
      ),
  },
];

const DEFAULT_ON_TOPIC_REPLY = section(
  "Here's a general overview",
  "That's a great Accounting/Finance question! I've covered the most common topics in detail, and I'm always learning to cover more. Try rephrasing with a specific term (e.g., GST, Balance Sheet, TDS, Budgeting) so I can give you a focused explanation.",
  'For example, instead of a broad question, try: "Explain Balance Sheet" or "What is TDS?"',
  'Specific questions let me walk you through a clear explanation, a real-life example, and key takeaways.',
  [
    'Try naming the exact concept you want explained.',
    'I cover Accounting, Bookkeeping, GST, Tax, and Personal/Business Finance.',
    'You can also tap one of the suggested questions to get started.',
  ],
  ['What is GST?', 'Explain Balance Sheet.', 'What is Budgeting?']
);

function findKnowledgeEntry(question: string): KnowledgeEntry | undefined {
  const q = question.toLowerCase();
  return KNOWLEDGE_BASE.find((entry) => entry.keywords.some((kw) => q.includes(kw)));
}

interface GeminiTextPart {
  text?: string;
}

interface GeminiGenerateContentResponse {
  candidates?: Array<{
    content?: {
      parts?: GeminiTextPart[];
    };
  }>;
  error?: {
    message?: string;
  };
}

function shouldUseGemini(): boolean {
  return env.aiProvider === 'gemini' && env.geminiApiKey.trim().length > 0;
}

function mockReply(question: string, isFirstMessage: boolean): AiReply {
  const entry = findKnowledgeEntry(question);
  let content = entry ? entry.build() : DEFAULT_ON_TOPIC_REPLY;

  if (!isFirstMessage) {
    content = removeLeadingGreetings(content);
  }

  return { content, isOnTopic: true };
}

async function generateGeminiReply(
  question: string,
  history: Array<{ role: string; content: string }> = [],
  isFirstMessage: boolean = true
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    env.geminiModel
  )}:generateContent`;

  const formattedHistory = history.slice(-10).map((m) => ({
    role: m.role === 'user' ? 'user' : 'model',
    parts: [{ text: m.content }],
  }));

  const userPromptText = isFirstMessage
    ? `Question: ${question}\n\nAnswer beginner-friendly and concisely.`
    : `Follow-up Question: ${question}\n\nIMPORTANT: Do NOT say "Hello", "Hello there", or introduce yourself as Pocket C.A. again. Jump directly into answering the question naturally and concisely based on the ongoing conversation.`;

  const contents = [
    ...formattedHistory,
    {
      role: 'user',
      parts: [{ text: userPromptText }],
    },
  ];

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': env.geminiApiKey,
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT }],
      },
      contents,
      generationConfig: {
        temperature: 0.65,
        topP: 0.95,
        maxOutputTokens: 550,
      },
    }),
  });

  const data = (await response.json()) as GeminiGenerateContentResponse;

  if (!response.ok) {
    throw new Error(data.error?.message || `Gemini API failed with ${response.status}`);
  }

  let content = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text)
    .filter(Boolean)
    .join('\n')
    .trim();

  if (!content) {
    throw new Error('Gemini returned an empty response');
  }

  if (!isFirstMessage) {
    content = removeLeadingGreetings(content);
  }

  return content;
}

import { ragService } from './rag.service';

export interface GenerateReplyOptions {
  isFirstMessage?: boolean;
  history?: Array<{ role: string; content: string }>;
}

export async function generateReply(
  question: string,
  options?: GenerateReplyOptions
): Promise<AiReply> {
  const isFirstMessage = options?.isFirstMessage ?? true;
  const history = options?.history ?? [];

  if (!isOnTopic(question)) {
    return { content: OFF_TOPIC_REPLY, isOnTopic: false };
  }

  // Run RAG Engine Pipeline: Document Retrieval -> Context Injection -> LLM Answer
  const ragResult = await ragService.generateRagResponse(question, history);

  if (!ragResult.isKnowledgeBaseMatch) {
    return {
      content: ragResult.answer,
      isOnTopic: true,
    };
  }

  let formattedContent = ragResult.answer;

  // Append Verified Sources
  if (ragResult.sources.length > 0) {
    const sourcesList = ragResult.sources
      .map((s) => `- **${s.title}** (*${s.sourceRef}*) &mdash; \`${s.scorePercent}% Relevance Match\``)
      .join('\n');

    formattedContent += `\n\n---\n\n#### 📚 Verified Sources & References (${ragResult.confidenceScore}% Confidence Match)\n${sourcesList}`;
  }

  // Append Related Topics
  if (ragResult.relatedTopics.length > 0) {
    const topicsList = ragResult.relatedTopics.map((t) => `- ${t}`).join('\n');
    formattedContent += `\n\n#### 💡 Related Knowledge Topics\n${topicsList}`;
  }

  return { content: formattedContent, isOnTopic: true };
}
