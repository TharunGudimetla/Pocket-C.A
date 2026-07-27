import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';
import { env } from '../config/env';

/**
 * ---------------------------------------------------------------------------
 * RAG ENGINE & VECTOR RETRIEVAL SERVICE
 * ---------------------------------------------------------------------------
 */

export interface DocumentMetadata {
  docId: string;
  title: string;
  category: string;
  keywords: string[];
  summary: string;
  sourceRef: string;
  pageEstimate: number;
  updatedAt: string;
  filePath: string;
}

export interface DocumentChunk extends DocumentMetadata {
  chunkId: string;
  chunkIndex: number;
  content: string;
}

export interface SearchResultDoc extends DocumentMetadata {
  content: string;
  score: number; // 0 to 1
  scorePercent: number; // 0 to 100
}

export interface RagAnswerResponse {
  answer: string;
  relevantSections: string[];
  sources: Array<{ title: string; category: string; sourceRef: string; scorePercent: number }>;
  relatedTopics: string[];
  confidenceScore: number; // percentage
  confidenceLabel: 'High' | 'Medium' | 'Low' | 'None';
  isKnowledgeBaseMatch: boolean;
}

class RagService {
  private chunks: DocumentChunk[] = [];
  private vocabulary: Map<string, number> = new Map();
  private docVectors: Map<string, Map<string, number>> = new Map();
  private isIndexed: boolean = false;
  private lastIndexedAt: string = new Date().toISOString();
  private knowledgeDir: string = path.join(process.cwd(), 'knowledge');
  private uploadsDir: string = path.join(process.cwd(), 'knowledge', 'uploads');

  constructor() {
    this.ensureDirs();
    this.reindex();
  }

  private ensureDirs() {
    if (!fs.existsSync(this.knowledgeDir)) {
      fs.mkdirSync(this.knowledgeDir, { recursive: true });
    }
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  /**
   * Scans knowledge directories and indexes all Markdown, Text, and JSON documents.
   */
  public reindex(): { totalDocs: number; totalChunks: number; timestamp: string } {
    this.chunks = [];
    this.vocabulary.clear();
    this.docVectors.clear();

    const filePaths = this.getAllFiles(this.knowledgeDir);

    filePaths.forEach((filePath) => {
      try {
        const ext = path.extname(filePath).toLowerCase();
        if (['.md', '.txt', '.json', '.pdf', '.docx'].includes(ext)) {
          this.processFile(filePath);
        }
      } catch (err) {
        logger.error(`Error processing knowledge document ${filePath}:`, err);
      }
    });

    this.buildTfIdfVectors();
    this.isIndexed = true;
    this.lastIndexedAt = new Date().toISOString();

    logger.info(
      `[RAG System] Indexing completed. Indexed ${filePaths.length} files into ${this.chunks.length} vector chunks.`
    );

    return {
      totalDocs: filePaths.length,
      totalChunks: this.chunks.length,
      timestamp: this.lastIndexedAt,
    };
  }

  private getAllFiles(dir: string): string[] {
    let results: string[] = [];
    if (!fs.existsSync(dir)) return results;

    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        results = results.concat(this.getAllFiles(fullPath));
      } else {
        results.push(fullPath);
      }
    });
    return results;
  }

  private processFile(filePath: string) {
    const rawContent = fs.readFileSync(filePath, 'utf-8');
    const relativePath = path.relative(this.knowledgeDir, filePath);
    const docId = relativePath.replace(/\\/g, '/');
    const stat = fs.statSync(filePath);

    // Extract frontmatter / headers metadata
    const titleMatch = rawContent.match(/^#\s+(.+)$/m);
    const categoryMatch = rawContent.match(/##\s+Category\s*\n+([^\n#]+)/i);
    const keywordsMatch = rawContent.match(/##\s+Keywords\s*\n+([^\n#]+)/i);
    const summaryMatch = rawContent.match(/##\s+Summary\s*\n+([^\n#]+)/i);
    const sourceRefMatch = rawContent.match(/##\s+Source Reference\s*\n+([^\n#]+)/i);

    const title = titleMatch ? titleMatch[1].trim() : path.basename(filePath, path.extname(filePath));
    const category = categoryMatch ? categoryMatch[1].trim() : this.inferCategoryFromPath(filePath);
    const keywords = keywordsMatch
      ? keywordsMatch[1].split(',').map((k) => k.trim())
      : [title.toLowerCase()];
    const summary = summaryMatch ? summaryMatch[1].trim() : rawContent.slice(0, 160).trim() + '...';
    const sourceRef = sourceRefMatch ? sourceRefMatch[1].trim() : 'Chartered Accountant Knowledge Repository';

    const wordsCount = rawContent.split(/\s+/).length;
    const pageEstimate = Math.max(1, Math.ceil(wordsCount / 350));
    const updatedAt = stat.mtime.toISOString().split('T')[0];

    const metadata: DocumentMetadata = {
      docId,
      title,
      category,
      keywords,
      summary,
      sourceRef,
      pageEstimate,
      updatedAt,
      filePath,
    };

    // Split document into logical chunks
    const rawChunks = this.splitIntoChunks(rawContent);

    rawChunks.forEach((chunkContent, idx) => {
      const chunkId = `${docId}#chunk-${idx + 1}`;
      this.chunks.push({
        ...metadata,
        chunkId,
        chunkIndex: idx,
        content: chunkContent,
      });
    });
  }

  private inferCategoryFromPath(filePath: string): string {
    const lower = filePath.toLowerCase();
    if (lower.includes('gst')) return 'GST Slabs & Rules';
    if (lower.includes('tds')) return 'TDS & TCS Sections';
    if (lower.includes('standards') || lower.includes('ind-as')) return 'Ind AS & Accounting Standards';
    if (lower.includes('ratios')) return 'Financial Ratios & Metrics';
    if (lower.includes('income_tax')) return 'Income Tax & Deductions';
    if (lower.includes('companies')) return 'Companies Act & Depreciation';
    return 'General Accounting';
  }

  private splitIntoChunks(text: string): string[] {
    // Split by Markdown section headers or double linebreaks
    const sections = text.split(/(?=\n###?\s+)/);
    const chunks: string[] = [];

    sections.forEach((sec) => {
      const trimmed = sec.trim();
      if (trimmed.length > 0) {
        if (trimmed.length > 1200) {
          // Sub-divide long sections into 800-char paragraphs
          const paragraphs = trimmed.split(/\n\s*\n/);
          paragraphs.forEach((p) => {
            if (p.trim().length > 0) chunks.push(p.trim());
          });
        } else {
          chunks.push(trimmed);
        }
      }
    });

    return chunks.length > 0 ? chunks : [text.trim()];
  }

  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2);
  }

  private buildTfIdfVectors() {
    this.chunks.forEach((chunk) => {
      const tokens = this.tokenize(chunk.title + ' ' + chunk.keywords.join(' ') + ' ' + chunk.content);
      const tf = new Map<string, number>();

      tokens.forEach((t) => {
        tf.set(t, (tf.get(t) || 0) + 1);
        this.vocabulary.set(t, (this.vocabulary.get(t) || 0) + 1);
      });

      this.docVectors.set(chunk.chunkId, tf);
    });
  }

  /**
   * Performs Semantic Vector Search across indexed document chunks.
   */
  public search(query: string, topK: number = 6, filterCategory?: string): SearchResultDoc[] {
    if (this.chunks.length === 0) return [];

    const queryTokens = this.tokenize(query);
    if (queryTokens.length === 0) return [];

    const queryTf = new Map<string, number>();
    queryTokens.forEach((t) => queryTf.set(t, (queryTf.get(t) || 0) + 1));

    const results: Array<{ chunk: DocumentChunk; score: number }> = [];

    this.chunks.forEach((chunk) => {
      if (filterCategory && filterCategory !== 'all' && chunk.category !== filterCategory) {
        return;
      }

      const docTf = this.docVectors.get(chunk.chunkId);
      if (!docTf) return;

      // Calculate Dot Product & Vector Magnitudes
      let dotProduct = 0;
      let queryMag = 0;
      let docMag = 0;

      queryTf.forEach((qCount, token) => {
        queryMag += qCount * qCount;
        if (docTf.has(token)) {
          const dCount = docTf.get(token)!;
          // Apply IDF weighting boost for domain specific tokens
          const idf = Math.log(1 + this.chunks.length / (this.vocabulary.get(token) || 1));
          dotProduct += qCount * dCount * idf;
        }
      });

      docTf.forEach((dCount) => {
        docMag += dCount * dCount;
      });

      // Domain keyword exact match boost
      let keywordBoost = 1.0;
      const lowerQuery = query.toLowerCase();
      chunk.keywords.forEach((kw) => {
        if (lowerQuery.includes(kw.toLowerCase())) {
          keywordBoost += 0.35;
        }
      });

      if (lowerQuery.includes(chunk.title.toLowerCase())) {
        keywordBoost += 0.5;
      }

      const similarity =
        queryMag > 0 && docMag > 0 ? (dotProduct / (Math.sqrt(queryMag) * Math.sqrt(docMag))) * keywordBoost : 0;

      if (similarity > 0.05) {
        results.push({ chunk, score: Math.min(1.0, similarity) });
      }
    });

    results.sort((a, b) => b.score - a.score);

    // Group by document ID to return distinct document results
    const seenDocs = new Set<string>();
    const searchDocs: SearchResultDoc[] = [];

    for (const item of results) {
      if (!seenDocs.has(item.chunk.docId)) {
        seenDocs.add(item.chunk.docId);
        const scorePercent = Math.min(99, Math.round(item.score * 100));
        searchDocs.push({
          docId: item.chunk.docId,
          title: item.chunk.title,
          category: item.chunk.category,
          keywords: item.chunk.keywords,
          summary: item.chunk.summary,
          sourceRef: item.chunk.sourceRef,
          pageEstimate: item.chunk.pageEstimate,
          updatedAt: item.chunk.updatedAt,
          filePath: item.chunk.filePath,
          content: item.chunk.content,
          score: item.score,
          scorePercent: scorePercent > 0 ? scorePercent : 85,
        });
      }
      if (searchDocs.length >= topK) break;
    }

    return searchDocs;
  }

  /**
   * Retrieves context and generates structured RAG response with source citations.
   */
  public async generateRagResponse(
    question: string,
    history: Array<{ role: string; content: string }> = []
  ): Promise<RagAnswerResponse> {
    const topResults = this.search(question, 4);

    // Anti-hallucination guardrail check
    const bestScore = topResults.length > 0 ? topResults[0].score : 0;
    const isKnowledgeBaseMatch = topResults.length > 0 && bestScore >= 0.12;

    if (!isKnowledgeBaseMatch) {
      return {
        answer: "I couldn't find this topic in the accounting knowledge base. Please ask about GST, TDS, Ind AS Accounting Standards, Financial Ratios, or Income Tax.",
        relevantSections: [],
        sources: [],
        relatedTopics: [
          'What are the GST Rate Slabs?',
          'Explain Section 194J TDS rate',
          'What is Current Ratio formula?',
          'Summarize Ind AS 1 guidelines',
        ],
        confidenceScore: 0,
        confidenceLabel: 'None',
        isKnowledgeBaseMatch: false,
      };
    }

    const primaryDoc = topResults[0];
    const topPercent = primaryDoc.scorePercent;
    const confidenceLabel = topPercent >= 80 ? 'High' : topPercent >= 50 ? 'Medium' : 'Low';

    // Format Sources
    const sources = topResults.map((doc) => ({
      title: doc.title,
      category: doc.category,
      sourceRef: doc.sourceRef,
      scorePercent: doc.scorePercent,
    }));

    // Extract Relevant Sections
    const relevantSections = topResults.map(
      (doc) => `**${doc.title}** (${doc.category}): ${doc.summary}`
    );

    // Context Injection for LLM Generation
    const contextText = topResults
      .map(
        (doc, i) =>
          `[DOCUMENT ${i + 1}: ${doc.title} (${doc.sourceRef})]\n${doc.content}\n`
      )
      .join('\n\n');

    let answerText = '';

    if (env.aiProvider === 'gemini' && env.geminiApiKey.trim().length > 0) {
      try {
        answerText = await this.callGeminiWithContext(question, contextText, history);
      } catch (err) {
        logger.warn('Gemini RAG call failed, using deterministic RAG response:', err);
        answerText = this.buildDeterministicAnswer(primaryDoc, question);
      }
    } else {
      answerText = this.buildDeterministicAnswer(primaryDoc, question);
    }

    const relatedTopics = this.generateRelatedTopics(primaryDoc);

    return {
      answer: answerText,
      relevantSections,
      sources,
      relatedTopics,
      confidenceScore: topPercent,
      confidenceLabel,
      isKnowledgeBaseMatch: true,
    };
  }

  private async callGeminiWithContext(
    question: string,
    context: string,
    history: Array<{ role: string; content: string }>
  ): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      env.geminiModel
    )}:generateContent`;

    const ragSystemPrompt = `You are Pocket C.A., an AI Chartered Accountant assistant.
Your answers MUST be strictly derived from the provided Accounting & Tax Knowledge Base documents.

CRITICAL RAG RULES:
1. Answer clearly and beginner-friendly based on the provided Knowledge Base documents.
2. Explicitly reference the source section or rule (e.g. GST Act, Section 194J, Ind AS 1) in your response.
3. If the context does not contain enough details, answer based on accounting principles and note the source reference.
4. Do NOT say "Hello" in follow-up messages. Jump directly into answering naturally.`;

    const formattedHistory = history.slice(-6).map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const contents = [
      ...formattedHistory,
      {
        role: 'user',
        parts: [
          {
            text: `RETRIEVED KNOWLEDGE BASE CONTEXT:\n${context}\n\nUSER QUESTION: ${question}`,
          },
        ],
      },
    ];

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': env.geminiApiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: ragSystemPrompt }] },
        contents,
        generationConfig: { temperature: 0.4, maxOutputTokens: 650 },
      }),
    });

    const data = (await response.json()) as any;
    if (!response.ok) {
      throw new Error(data?.error?.message || 'Gemini RAG API request failed');
    }

    const text = data?.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('\n').trim();
    if (!text) throw new Error('Empty Gemini response');
    return text;
  }

  private buildDeterministicAnswer(doc: SearchResultDoc, question: string): string {
    return `### ${doc.title}\n\n**1. Overview**\n${doc.summary}\n\n**2. Key Rules & Provisions**\n${doc.content.replace(/^#.*\n+/g, '')}\n\n**Source Reference**: ${doc.sourceRef}`;
  }

  private generateRelatedTopics(doc: SearchResultDoc): string[] {
    if (doc.category.includes('GST')) {
      return [
        'What is the difference between CGST, SGST and IGST?',
        'How to claim Input Tax Credit under Section 16?',
        'What are the GSTR-1 and GSTR-3B due dates?',
      ];
    }
    if (doc.category.includes('TDS')) {
      return [
        'What is Section 194J TDS rate on professional fees?',
        'What are Section 194C rates for individual vs corporate contractors?',
        'What is the threshold limit for TDS on rent under Section 194I?',
      ];
    }
    if (doc.category.includes('Standards')) {
      return [
        'What are the core statements required under Ind AS 1?',
        'How to classify cash flows under Ind AS 7?',
        'What is the inventory valuation rule under Ind AS 2?',
      ];
    }
    return [
      'How to calculate Current Ratio and Quick Ratio?',
      'What is Debt to Equity Ratio benchmark?',
      'Explain DuPont Analysis for Return on Equity',
    ];
  }

  /**
   * Admin Capabilities: Get Index Stats
   */
  public getStats() {
    return {
      indexed: this.isIndexed,
      lastIndexedAt: this.lastIndexedAt,
      totalChunks: this.chunks.length,
      totalDocs: new Set(this.chunks.map((c) => c.docId)).size,
      vocabularySize: this.vocabulary.size,
      embeddingEngine: 'TF-IDF Cosine Vector Index (Local RAG Adapter)',
      knowledgeDir: this.knowledgeDir,
    };
  }

  /**
   * Admin Capabilities: Ingest new document
   */
  public addDocument(filename: string, content: string, category?: string): { docId: string; chunksAdded: number } {
    const targetPath = path.join(this.uploadsDir, filename);
    let mdContent = content;

    if (!content.startsWith('#')) {
      mdContent = `# ${path.basename(filename, path.extname(filename))}\n\n## Category\n${
        category || 'Admin Uploads'
      }\n\n## Summary\nAdmin uploaded knowledge document.\n\n## Source Reference\nInternal Compliance Repository\n\n${content}`;
    }

    fs.writeFileSync(targetPath, mdContent, 'utf-8');
    this.reindex();

    return {
      docId: `uploads/${filename}`,
      chunksAdded: this.chunks.filter((c) => c.docId.includes(filename)).length,
    };
  }

  /**
   * Admin Capabilities: Delete document
   */
  public deleteDocument(docId: string): boolean {
    const targetFile = path.join(this.knowledgeDir, docId);
    if (fs.existsSync(targetFile)) {
      fs.unlinkSync(targetFile);
      this.reindex();
      return true;
    }
    return false;
  }

  /**
   * Get all indexed document items
   */
  public getAllDocuments(): SearchResultDoc[] {
    const seen = new Set<string>();
    const list: SearchResultDoc[] = [];

    this.chunks.forEach((c) => {
      if (!seen.has(c.docId)) {
        seen.add(c.docId);
        list.push({
          docId: c.docId,
          title: c.title,
          category: c.category,
          keywords: c.keywords,
          summary: c.summary,
          sourceRef: c.sourceRef,
          pageEstimate: c.pageEstimate,
          updatedAt: c.updatedAt,
          filePath: c.filePath,
          content: c.content,
          score: 1.0,
          scorePercent: 100,
        });
      }
    });

    return list;
  }
}

export const ragService = new RagService();
