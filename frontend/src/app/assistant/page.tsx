"use client";

import { useState } from "react";
import { chatQuery } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Send, Bot, User, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";

export default function Assistant() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: "user", content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await chatQuery(userMsg.content, messages);
      setMessages((prev) => [...prev, { role: "assistant", ...res }]);
    } catch (e) {
      setMessages((prev) => [...prev, { role: "assistant", error: "Failed to connect to AI engine." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Bot className="text-indigo-400" /> AI Data Assistant
        </h1>
        <p className="text-neutral-400 mt-1">Ask anything about your supply chain data.</p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden bg-neutral-900/50">
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-neutral-500 space-y-4">
              <SparklesIcon className="w-12 h-12 text-neutral-700" />
              <p>Try asking: "What is the total revenue?" or "Which supplier generated the highest profit?"</p>
            </div>
          )}
          {messages.map((msg, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} 
              animate={{ opacity: 1, y: 0 }} 
              key={i} 
              className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-neutral-800 border border-neutral-700'}`}>
                {msg.role === 'user' ? <User size={14} /> : <Bot size={14} className="text-indigo-400" />}
              </div>
              <div className="space-y-2">
                <div className={`p-4 rounded-2xl ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-neutral-800 text-neutral-200 border border-neutral-700 rounded-tl-none'}`}>
                  {msg.role === 'user' ? msg.content : (msg.answer || msg.error)}
                </div>
                
                {msg.role === 'assistant' && msg.methodology && (
                  <div className="px-4 py-3 bg-neutral-950/50 rounded-xl border border-neutral-800 text-xs text-neutral-400 font-mono">
                    <div className="flex items-center gap-1.5 mb-1 text-neutral-300">
                      <ShieldAlert size={12} /> Methodology
                    </div>
                    {msg.methodology}
                  </div>
                )}
                
                {msg.role === 'assistant' && msg.supporting_data && msg.supporting_data.length > 0 && (
                  <div className="mt-2 overflow-x-auto rounded-xl border border-neutral-800">
                    <table className="w-full text-sm text-left text-neutral-300">
                      <thead className="text-xs uppercase bg-neutral-900 border-b border-neutral-800 text-neutral-500">
                        <tr>
                          {Object.keys(msg.supporting_data[0]).map(k => <th key={k} className="px-4 py-2">{k}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {msg.supporting_data.map((row: any, idx: number) => (
                          <tr key={idx} className="border-b border-neutral-800 bg-neutral-950/50">
                            {Object.values(row).map((v: any, j: number) => {
                              let displayValue = String(v);
                              if (typeof v === 'number') {
                                displayValue = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(v);
                              } else if (typeof v === 'string' && !isNaN(Number(v)) && v.trim() !== '') {
                                displayValue = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(Number(v));
                              }
                              return <td key={j} className="px-4 py-2">{displayValue}</td>;
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex gap-3 text-neutral-500 items-center">
               <Bot size={16} className="animate-pulse" /> Generating response from data...
            </div>
          )}
        </div>
        
        <div className="p-4 bg-neutral-950/80 border-t border-neutral-800">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-2"
          >
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask a question about the dataset..."
              className="flex-1 bg-neutral-900 border border-neutral-700 rounded-full px-5 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
            />
            <button 
              type="submit"
              disabled={loading || !input.trim()}
              className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white hover:bg-indigo-500 transition-colors disabled:opacity-50"
            >
              <Send size={18} className={input.trim() ? "translate-x-0.5" : ""} />
            </button>
          </form>
        </div>
      </Card>
    </div>
  );
}

function SparklesIcon(props: any) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
}
