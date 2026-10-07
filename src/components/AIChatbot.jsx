import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { api } from '../api';
import { ReportShareModal } from './ReportShareModal';
import {
  Bot,
  Sparkles,
  Send,
  X,
  RefreshCw,
  Trash2,
  ChevronDown,
  Download,
  Share2,
  HelpCircle,
  Cpu,
  Database,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

const SUGGESTED_QUESTIONS = [
  'What is our total procurement spend?',
  'Which vendor has the highest purchase value?',
  'Which department has the most assets?',
  'Show purchases above ₹50,000.',
  'Which assets need replacement?',
  'Summarize this year\'s procurement.',
  'Show recent purchase transactions.',
  'Generate analytics report.'
];

export const AIChatbot = () => {
  const { currentUser } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeMode, setActiveMode] = useState('agent'); // 'agent' | 'rule'
  const [tokenInfo, setTokenInfo] = useState({ remainingTokens: 4000, isLow: false });
  const [shareModalData, setShareModalData] = useState(null);

  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'assistant',
      mode: 'agent',
      text: `👋 **Welcome to AssetMS AI Assistant!**\n\nI can analyze campus asset inventories, query real-time procurement expenditure, inspect supplier records, and generate verified reports.\n\nHow may I assist you today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const prompt = (textToSend || inputMessage).trim();
    if (!prompt || loading) return;

    const userMsgId = `usr-${Date.now()}`;
    const userMsg = {
      id: userMsgId,
      sender: 'user',
      text: prompt,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await api.sendAiChat({
        prompt,
        user: currentUser || { id: 'GUEST', name: 'Campus User', role: 'faculty' },
        conversationHistory: messages.slice(-4).map((m) => ({
          role: m.sender === 'user' ? 'user' : 'assistant',
          content: m.text
        }))
      });

      const assistantMsg = {
        id: `ast-${Date.now()}`,
        sender: 'assistant',
        mode: response.mode || 'rule',
        text: response.responseText || response.message || 'Information retrieved.',
        structuredData: response.structuredData,
        reportAction: response.reportAction,
        toolUsed: response.toolUsed,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      if (response.mode) {
        setActiveMode(response.mode);
      }
      if (response.remainingTokens !== undefined) {
        setTokenInfo({
          remainingTokens: response.remainingTokens,
          isLow: response.tokenBudgetLow
        });
      }

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.warn('AI agent query error. Falling back to rule query:', err.message);
      // Emergency Rule fallback
      try {
        const fallback = await api.sendRuleQuery({
          prompt,
          userRole: currentUser?.role || 'faculty'
        });

        const fallbackMsg = {
          id: `ast-fb-${Date.now()}`,
          sender: 'assistant',
          mode: 'rule',
          text: fallback.responseText || 'Database query result retrieved.',
          structuredData: fallback.structuredData,
          reportAction: fallback.reportAction,
          toolUsed: fallback.toolUsed,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setActiveMode('rule');
        setMessages((prev) => [...prev, fallbackMsg]);
      } catch (fallbackErr) {
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            sender: 'assistant',
            mode: 'rule',
            text: `⚠️ **Notice:** Could not complete request. Please try asking a specific asset or purchase question.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'assistant',
        mode: 'agent',
        text: `Conversation cleared. How can I assist you with your campus asset management?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleDownloadReportPdf = async (type = 'analytics', year = 'all') => {
    try {
      let blob;
      let filename;
      if (type === 'purchase' || type === 'purchases') {
        blob = await api.downloadPurchasesPdf({ from: year !== 'all' ? `${year}-01-01` : '' });
        filename = `AssetMS_Purchase_History_${new Date().toISOString().slice(0, 10)}.pdf`;
      } else {
        blob = await api.downloadAnalyticsPdf({ timeframe: year });
        filename = `AssetMS_Analytics_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert('Failed to download report: ' + e.message);
    }
  };

  // Render Formatted Markdown
  const renderFormattedText = (text) => {
    if (!text) return null;

    // Split text into paragraphs/lines
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let trimmed = line.trim();
      if (!trimmed) return <div key={idx} className="h-2" />;

      // Header 3: ### Title
      if (trimmed.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-xs font-black text-slate-900 dark:text-white mt-1.5 mb-1 font-display tracking-tight">
            {trimmed.replace('### ', '')}
          </h4>
        );
      }

      // Bullet Point
      if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const content = trimmed.substring(2);
        return (
          <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-200 my-0.5 leading-relaxed">
            <span className="text-indigo-500 font-bold">•</span>
            <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(content) }} />
          </div>
        );
      }

      // Numbered List (1. 2. 3.)
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
      if (numMatch) {
        return (
          <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-200 my-0.5 leading-relaxed">
            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 text-[11px]">{numMatch[1]}.</span>
            <span dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(numMatch[2]) }} />
          </div>
        );
      }

      return (
        <p key={idx} className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed my-0.5" dangerouslySetInnerHTML={{ __html: formatInlineMarkdown(trimmed) }} />
      );
    });
  };

  const formatInlineMarkdown = (str) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-slate-900 dark:text-white">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">$1</code>');
  };

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 hover:from-indigo-500 hover:to-violet-600 text-white rounded-full shadow-2xl shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer group border border-white/20"
          aria-label="Open AssetMS AI Assistant"
        >
          <div className="relative">
            <Bot size={20} className="group-hover:rotate-12 transition-transform duration-300" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full" />
          </div>
          <span className="font-bold text-xs font-display tracking-tight">AssetMS AI</span>
          <Sparkles size={14} className="text-amber-300 animate-pulse" />
        </button>
      )}

      {/* Slide-in / Popover AI Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-300">
          {/* Top Chat Header */}
          <div className="p-3.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-indigo-900/40">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
                <Bot size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold font-display">AssetMS AI Assistant</h3>
                  {/* Mode Pill */}
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      activeMode === 'agent'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${activeMode === 'agent' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    {activeMode === 'agent' ? '● Agent Mode' : '● Rule Mode'}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">Live Campus MySQL Knowledge Graph</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                title="Clear Chat History"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <Trash2 size={14} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Minimize Chat"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] p-3 rounded-2xl text-xs ${
                    m.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-xs shadow-md'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-xs border border-slate-200 dark:border-slate-700/80 shadow-xs'
                  }`}
                >
                  {m.sender === 'assistant' ? (
                    <div className="space-y-1">
                      {renderFormattedText(m.text)}

                      {/* Interactive Report Action Button */}
                      {m.reportAction && (
                        <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-700 flex flex-wrap gap-2">
                          <button
                            onClick={() => handleDownloadReportPdf(m.reportAction.type, m.reportAction.year)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-[11px] font-bold transition cursor-pointer"
                          >
                            <Download size={13} /> Download PDF Report
                          </button>
                          <button
                            onClick={() => setShareModalData({ reportType: m.reportAction.type })}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 text-[11px] font-bold transition cursor-pointer"
                          >
                            <Share2 size={13} /> Share via Email / WhatsApp
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="leading-relaxed">{m.text}</p>
                  )}
                </div>

                <div className="flex items-center gap-1.5 mt-1 px-1">
                  <span className="text-[9px] text-slate-400">{m.timestamp}</span>
                  {m.sender === 'assistant' && (
                    <span className="text-[9px] text-indigo-500 dark:text-indigo-400 font-mono">
                      {m.mode === 'agent' ? '⚡ AI Agent' : '🔍 Real Database Tool'}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {loading && (
              <div className="flex items-center gap-2 p-3 bg-white dark:bg-slate-800 rounded-2xl rounded-bl-xs border border-slate-200 dark:border-slate-700 w-fit">
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 ml-1">
                  {activeMode === 'agent' ? 'Agent evaluating query...' : 'Querying MySQL Database...'}
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Questions Chips */}
          <div className="p-2 bg-slate-100/70 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 mb-1 px-1">
              <Sparkles size={11} className="text-indigo-500" />
              <span>Suggested Queries:</span>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {SUGGESTED_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="whitespace-nowrap text-[10px] px-2.5 py-1 rounded-full bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-600 hover:text-indigo-600 border border-slate-200 dark:border-slate-600 transition cursor-pointer font-medium"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask about assets, procurement spend, vendors..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={loading}
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-white border border-transparent focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || loading}
                className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white transition cursor-pointer shadow-sm"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Share Report Modal from AI trigger */}
      {shareModalData && (
        <ReportShareModal
          isOpen={Boolean(shareModalData)}
          onClose={() => setShareModalData(null)}
          reportType={shareModalData.reportType || 'analytics'}
          title="Share AI-Generated Campus Report"
        />
      )}
    </>
  );
};
