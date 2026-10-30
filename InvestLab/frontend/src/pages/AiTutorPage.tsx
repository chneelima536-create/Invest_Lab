import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Trash2,
  Sparkles,
  ShieldAlert,
  User,
  Info,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { tutorApi } from '../services/api';
import { TutorMessage } from '../types';

export const AiTutorPage: React.FC = () => {
  const [messages, setMessages] = useState<TutorMessage[]>([
    {
      id: 'msg_welcome',
      role: 'assistant',
      content: `### Welcome! I'm your InvestLab Finance Tutor. 👋

Ask me about stocks, SIPs, P/E ratios, EPS, diversification, or investing basics. I explain financial terms in beginner-friendly language with practical examples in Indian Rupees.

*Disclaimer: I provide educational explanations only, not personalized investment advice.*`,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      source: 'curated_demo',
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const starterChips = [
    'What is a P/E ratio?',
    'Explain SIPs with an example.',
    'What is diversification?',
    'Explain EPS in simple words.',
    'What is the difference between stocks and mutual funds?',
    'How does risk affect returns?',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isTyping) return;

    const userMsg: TutorMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await tutorApi.chat(text, historyPayload);

      const assistantMsg: TutorMessage = {
        id: `ast_${Date.now()}`,
        role: 'assistant',
        content: res.message,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        source: res.source,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: TutorMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content:
          'I apologize, but I encountered an issue retrieving the answer. Please check your network or try asking another question.',
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'msg_reset',
        role: 'assistant',
        content: `Chat history cleared. What investing concept would you like to explore next?`,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        source: 'curated_demo',
      },
    ]);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)]">
      {/* Header and Disclaimer */}
      <div className="bg-white p-4 rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#172B4D]">InvestLab AI Finance Tutor</h2>
              <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                Educational AI
              </span>
            </div>
            <p className="text-[11px] text-[#64748B]">
              Trained on financial concepts with Indian Rupee examples · No personalized stock advice
            </p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          title="Clear Chat History"
          className="p-2 text-[#64748B] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 text-xs font-semibold"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Clear Chat</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4 sm:p-6 overflow-y-auto space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                m.role === 'user' ? 'bg-[#172B4D] text-white' : 'bg-blue-600 text-white'
              }`}
            >
              {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-[#2563EB] text-white font-medium shadow-xs rounded-tr-none'
                  : 'bg-slate-50 border border-slate-200 text-[#172B4D] rounded-tl-none whitespace-pre-line'
              }`}
            >
              {m.content}

              <div
                className={`mt-2 flex items-center justify-between text-[10px] pt-1 border-t ${
                  m.role === 'user'
                    ? 'border-blue-400/40 text-blue-100'
                    : 'border-slate-200 text-[#64748B]'
                }`}
              >
                <span>{m.timestamp}</span>
                {m.source && (
                  <span className="uppercase text-[9px] font-semibold tracking-wider">
                    {m.source === 'live_llm' ? 'Live LLM' : 'Curated FinTech Tutor'}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none p-3.5 flex items-center gap-1.5 text-xs text-[#64748B]">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 text-[11px]">Tutor is generating educational explanation...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Question Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs shrink-0">
        <span className="text-[11px] font-semibold text-[#64748B] shrink-0 mr-1 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Prompts:
        </span>
        {starterChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip)}
            className="px-3 py-1.5 rounded-lg bg-white hover:bg-blue-50 border border-[#E2E8F0] hover:border-blue-300 text-[#172B4D] hover:text-blue-600 text-xs font-medium whitespace-nowrap shadow-2xs transition-colors shrink-0"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="bg-white p-2 rounded-2xl border border-[#E2E8F0] shadow-sm flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about P/E ratio, compounding, market risk, or stock valuation..."
          className="flex-1 bg-transparent px-3 py-2 text-xs text-[#172B4D] placeholder-[#64748B] focus:outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || isTyping}
          className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-xs transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
