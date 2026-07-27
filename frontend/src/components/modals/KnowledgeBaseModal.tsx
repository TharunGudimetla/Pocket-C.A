import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  BookOpen,
  Search,
  FileText,
  Percent,
  Calculator,
  ArrowRight,
  Sparkles,
  Upload,
  RefreshCw,
  Trash2,
  ShieldAlert,
  Database,
  Layers,
} from 'lucide-react';
import { knowledgeService, RagDocItem, RagStatus } from '../../services/knowledge.service';

interface KnowledgeBaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt?: (prompt: string) => void;
}

const KB_CATEGORIES = [
  { id: 'all', name: 'All Topics', icon: BookOpen, color: 'bg-brand-blue/10 text-brand-blue' },
  { id: 'gst', name: 'GST Slabs & Rules', icon: Percent, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
  { id: 'tds', name: 'TDS & TCS Sections', icon: FileText, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
  { id: 'accounting', name: 'Ind AS & Accounting Standards', icon: BookOpen, color: 'bg-violet-500/10 text-violet-600 dark:text-violet-400' },
  { id: 'ratios', name: 'Financial Ratios & Metrics', icon: Calculator, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
];

export function KnowledgeBaseModal({ isOpen, onClose, onSelectPrompt }: KnowledgeBaseModalProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [ragDocs, setRagDocs] = useState<RagDocItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminStatus, setAdminStatus] = useState<RagStatus | null>(null);

  // Admin upload state
  const [uploadName, setUploadName] = useState('');
  const [uploadCategory, setUploadCategory] = useState('General Accounting');
  const [uploadContent, setUploadContent] = useState('');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchRagSearch();
    }
  }, [isOpen, search, activeCategory]);

  const fetchRagSearch = async () => {
    setLoading(true);
    try {
      const docs = await knowledgeService.search(search, activeCategory);
      setRagDocs(docs);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const fetchAdminStatus = async () => {
    try {
      const status = await knowledgeService.getAdminStatus();
      setAdminStatus(status);
    } catch {
      // Error handling
    }
  };

  const handleToggleAdmin = () => {
    const next = !showAdmin;
    setShowAdmin(next);
    if (next) fetchAdminStatus();
  };

  const handleReindex = async () => {
    try {
      setLoading(true);
      await knowledgeService.reindex();
      setMessage('RAG vector index rebuilt successfully!');
      fetchAdminStatus();
      fetchRagSearch();
    } catch {
      setMessage('Failed to reindex vector database.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadName || !uploadContent) return;
    setUploading(true);
    try {
      await knowledgeService.uploadDocument(uploadName, uploadContent, uploadCategory);
      setMessage(`Document "${uploadName}" uploaded and indexed successfully!`);
      setUploadName('');
      setUploadContent('');
      fetchAdminStatus();
      fetchRagSearch();
    } catch {
      setMessage('Failed to upload document.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    try {
      await knowledgeService.deleteDocument(docId);
      setMessage(`Document ${docId} deleted.`);
      fetchAdminStatus();
      fetchRagSearch();
    } catch {
      setMessage('Failed to delete document.');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="flex h-[85vh] w-full max-w-4xl flex-col rounded-2xl border border-border bg-surface shadow-floating overflow-hidden"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-card">
                <BookOpen size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-[17px] font-bold text-ink">Chartered Accountant Knowledge Base</h3>
                  <span className="inline-flex items-center gap-1 rounded-full bg-brand-teal/10 px-2 py-0.5 text-[10px] font-extrabold text-brand-teal border border-brand-teal/20 uppercase tracking-wider">
                    <Sparkles size={10} /> RAG Vector Engine
                  </span>
                </div>
                <p className="text-[13px] text-ink-muted">
                  Semantic retrieval system for GST, TDS, Ind AS, and Financial Ratios
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleToggleAdmin}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all border ${
                  showAdmin
                    ? 'border-brand-blue bg-brand-blue text-white shadow-sm'
                    : 'border-border bg-sidebar text-ink-muted hover:text-ink'
                }`}
              >
                {showAdmin ? 'View Knowledge Base' : 'Admin Portal'}
              </button>
              <button
                onClick={onClose}
                className="rounded-xl p-2 text-ink-muted hover:bg-sidebar hover:text-ink transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {!showAdmin ? (
            <>
              {/* Search & Category Filter */}
              <div className="border-b border-border bg-sidebar/50 px-6 py-3 space-y-3">
                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Semantic Search Knowledge Base (e.g. GST rates, Sec 194J, Ind AS 7)..."
                    className="h-10 w-full rounded-xl border border-border bg-surface pl-10 pr-4 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                  />
                  {search && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono text-brand-teal font-bold bg-brand-teal/10 px-2 py-0.5 rounded">
                      Vector Similarity Ranking
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin pb-1">
                  {KB_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                        activeCategory === cat.id
                          ? 'bg-brand-blue text-white shadow-sm'
                          : 'bg-surface text-ink-muted hover:text-ink border border-border'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* RAG Topics & Search Results Grid */}
              <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-4">
                {loading && (
                  <div className="flex h-32 items-center justify-center text-xs text-ink-muted">
                    Retrieving vector matched documents...
                  </div>
                )}

                {!loading && ragDocs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ragDocs.map((doc, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: idx * 0.04 }}
                        className="group flex flex-col justify-between rounded-xl border border-border bg-card p-4 transition-all hover:border-brand-blue/40 hover:shadow-card"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[10.5px] font-bold text-brand-blue bg-brand-blue/10 px-2 py-0.5 rounded border border-brand-blue/20">
                              {doc.category}
                            </span>
                            <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                              {doc.scorePercent}% Match
                            </span>
                          </div>
                          <h5 className="text-[14.5px] font-bold text-ink group-hover:text-brand-blue transition-colors">
                            {doc.title}
                          </h5>
                          <p className="mt-1.5 text-[12.5px] text-ink-muted leading-relaxed line-clamp-3">
                            {doc.summary}
                          </p>
                        </div>

                        <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3">
                          <div className="flex items-center gap-3 text-[11px] text-ink-faint">
                            <span>{doc.pageEstimate} page{doc.pageEstimate > 1 ? 's' : ''}</span>
                            <span>&middot;</span>
                            <span>Updated: {doc.updatedAt}</span>
                          </div>
                          {onSelectPrompt && (
                            <button
                              onClick={() => {
                                onSelectPrompt(`Explain ${doc.title} in detail according to ${doc.sourceRef}`);
                                onClose();
                              }}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-blue hover:text-brand-teal transition-colors"
                            >
                              Ask Pocket C.A. <ArrowRight size={13} />
                            </button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  !loading && (
                    <div className="flex h-48 flex-col items-center justify-center text-center">
                      <p className="text-sm font-medium text-ink-muted">
                        No matching Knowledge Base topics found.
                      </p>
                      <p className="text-xs text-ink-faint mt-1">
                        Try searching for "GST", "Section 194J", "Ind AS", or "Current Ratio".
                      </p>
                    </div>
                  )
                )}
              </div>
            </>
          ) : (
            /* Admin Knowledge Management Panel */
            <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-6">
              <div className="rounded-xl border border-brand-teal/30 bg-brand-teal/5 p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-ink flex items-center gap-2">
                    <Database size={16} className="text-brand-teal" /> RAG Vector Index Status
                  </h4>
                  <p className="text-xs text-ink-muted mt-1">
                    TF-IDF Cosine Vector Indexing Engine & Document Repository
                  </p>
                </div>
                <button
                  onClick={handleReindex}
                  disabled={loading}
                  className="flex items-center gap-1.5 rounded-lg bg-brand-teal px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-brand-teal/90 transition-all disabled:opacity-50"
                >
                  <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                  Re-index Documents
                </button>
              </div>

              {message && (
                <div className="rounded-xl border border-brand-blue/30 bg-brand-blue/10 p-3 text-xs font-semibold text-brand-blue">
                  {message}
                </div>
              )}

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-border bg-card p-3 text-center">
                  <span className="text-xs text-ink-muted font-medium">Total Documents</span>
                  <p className="text-lg font-extrabold text-ink mt-0.5">{adminStatus?.totalDocs || 0}</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-3 text-center">
                  <span className="text-xs text-ink-muted font-medium">Vector Chunks</span>
                  <p className="text-lg font-extrabold text-brand-blue mt-0.5">{adminStatus?.totalChunks || 0}</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-3 text-center">
                  <span className="text-xs text-ink-muted font-medium">Vocabulary Terms</span>
                  <p className="text-lg font-extrabold text-brand-teal mt-0.5">{adminStatus?.vocabularySize || 0}</p>
                </div>
                <div className="rounded-xl border border-border bg-card p-3 text-center">
                  <span className="text-xs text-ink-muted font-medium">Status</span>
                  <p className="text-xs font-bold text-emerald-500 mt-1 uppercase">Active & Indexed</p>
                </div>
              </div>

              {/* Upload Document Form */}
              <div className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm">
                <h4 className="text-sm font-bold text-ink flex items-center gap-2">
                  <Upload size={16} className="text-brand-blue" /> Add New Knowledge Document
                </h4>
                <form onSubmit={handleUploadSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Document Filename (e.g. income-tax-rules.md)"
                      value={uploadName}
                      onChange={(e) => setUploadName(e.target.value)}
                      required
                      className="h-9 w-full rounded-xl border border-border bg-surface px-3 text-xs text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                    />
                    <select
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value)}
                      className="h-9 w-full rounded-xl border border-border bg-surface px-3 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                    >
                      <option value="GST Slabs & Rules">GST Slabs & Rules</option>
                      <option value="TDS & TCS Sections">TDS & TCS Sections</option>
                      <option value="Ind AS & Accounting Standards">Ind AS & Accounting Standards</option>
                      <option value="Financial Ratios & Metrics">Financial Ratios & Metrics</option>
                      <option value="Income Tax & Deductions">Income Tax & Deductions</option>
                      <option value="Companies Act & Depreciation">Companies Act & Depreciation</option>
                    </select>
                  </div>
                  <textarea
                    rows={4}
                    placeholder="Enter document text, Markdown, or JSON content to index..."
                    value={uploadContent}
                    onChange={(e) => setUploadContent(e.target.value)}
                    required
                    className="w-full rounded-xl border border-border bg-surface p-3 text-xs text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                  />
                  <button
                    type="submit"
                    disabled={uploading}
                    className="flex items-center gap-2 rounded-xl bg-brand-gradient px-4 py-2 text-xs font-bold text-white shadow-card hover:bg-brand-gradient-hover transition-all disabled:opacity-50"
                  >
                    <Upload size={14} />
                    {uploading ? 'Ingesting Document...' : 'Ingest & Index Document'}
                  </button>
                </form>
              </div>

              {/* Managed Documents List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-faint flex items-center gap-2">
                  <Layers size={14} /> Managed RAG Documents ({ragDocs.length})
                </h4>
                <div className="space-y-2">
                  {ragDocs.map((doc, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-2.5"
                    >
                      <div className="min-w-0 pr-3">
                        <p className="text-xs font-bold text-ink truncate">{doc.title}</p>
                        <p className="text-[10.5px] text-ink-muted truncate">{doc.docId} &middot; {doc.category}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteDoc(doc.docId)}
                        className="rounded-lg p-1.5 text-ink-faint hover:bg-red-500/10 hover:text-red-500 transition-colors"
                        title="Delete Document"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
