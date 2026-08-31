import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Send, Sparkles, FolderGit2,
  Trash2, Scissors, ArrowUpRight, Zap
} from 'lucide-react';
import type { ChatMessage } from '../../types';

const AVAILABLE_MODELS = [
  { id: 'Gemini 3.7 Flash', name: 'Gemini 3.7 Flash (High)', provider: 'Google DeepMind', cost: '~280 tokens' },
  { id: 'Claude 3.7 Sonnet', name: 'Claude 3.7 Sonnet', provider: 'Anthropic', cost: '~650 tokens' },
  { id: 'o3-mini-high', name: 'OpenAI o3-mini', provider: 'OpenAI', cost: '~800 tokens' },
  { id: 'DeepSeek R1', name: 'DeepSeek R1 Reasoner', provider: 'DeepSeek', cost: '~400 tokens' },
];

export const PromptHub: React.FC = () => {
  const { 
    messages, 
    sendMessage, 
    isGenerating, 
    clearHistory, 
    workspaces, 
    activeWorkspaceId, 
    setActiveWorkspaceId,
    startSnipMode,
    snips
  } = useApp();

  const [inputVal, setInputVal] = useState('');
  const [selectedModel, setSelectedModel] = useState(AVAILABLE_MODELS[0].id);
  const [attachedSnipUrl, setAttachedSnipUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const handleSend = () => {
    if (!inputVal.trim() && !attachedSnipUrl) return;
    sendMessage(inputVal, selectedModel, attachedSnipUrl || undefined);
    setInputVal('');
    setAttachedSnipUrl(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[520px]">
      {/* Top Controls: Model Selector & Workspace Pill */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          {/* Model Selector */}
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-black/50 border border-white/15 text-xs text-slate-200 font-semibold rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-sky-400 cursor-pointer"
          >
            {AVAILABLE_MODELS.map(m => (
              <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                {m.name}
              </option>
            ))}
          </select>

          {/* Active Workspace Selector */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/10 text-xs text-slate-300">
            <FolderGit2 className="w-3.5 h-3.5 text-sky-400" />
            <select
              value={activeWorkspaceId}
              onChange={(e) => setActiveWorkspaceId(e.target.value)}
              className="bg-transparent text-xs text-slate-300 focus:outline-none cursor-pointer"
            >
              {workspaces.map(ws => (
                <option key={ws.id} value={ws.id} className="bg-slate-900 text-white">
                  {ws.name} ({ws.branch})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Button */}
        <button
          onClick={clearHistory}
          title="Limpiar conversación"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white mb-1">SideNotch AI Companion</h4>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              Solicita refactorizaciones, consulta el estado de tus cuotas o adjunta una captura de Snipaste para inspección visual.
            </p>
          </div>
        ) : (
          messages.map((msg: ChatMessage) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
              >
                {/* Header tag */}
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 px-1 font-mono">
                  <span>{isUser ? 'Tú' : msg.model}</span>
                  {msg.tokensUsed && (
                    <span className="text-sky-400/80 font-medium">({msg.tokensUsed} tokens)</span>
                  )}
                </div>

                {/* Bubble Body */}
                <div
                  className={`
                    p-3.5 rounded-2xl max-w-[85%] text-xs leading-relaxed
                    ${isUser
                      ? 'bg-gradient-to-br from-sky-600/90 to-indigo-600/90 text-white rounded-br-sm shadow-lg'
                      : 'bg-white/[0.06] backdrop-blur-xl border border-white/10 text-slate-100 rounded-bl-sm shadow-md'}
                  `}
                >
                  {/* Attached Image if any */}
                  {msg.attachedSnipUrl && (
                    <div className="mb-2 rounded-xl overflow-hidden border border-white/20">
                      <img src={msg.attachedSnipUrl} alt="Snip" className="max-h-40 w-auto object-cover" />
                    </div>
                  )}

                  <div className="whitespace-pre-wrap">{msg.text}</div>

                  {/* Suggested Quick Actions */}
                  {msg.suggestedActions && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2 border-t border-white/10">
                      {msg.suggestedActions.map((action, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            setInputVal(action);
                          }}
                          className="text-[10px] px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 border border-white/10 transition-colors flex items-center gap-1"
                        >
                          <span>{action}</span>
                          <ArrowUpRight className="w-2.5 h-2.5 opacity-60" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {/* Live typing indicator */}
        {isGenerating && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-white/5 border border-white/10 text-xs text-sky-400 w-fit">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            <span className="font-mono">Generando respuesta con {selectedModel}...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Attached snip preview if selected */}
      {attachedSnipUrl && (
        <div className="p-2 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <img src={attachedSnipUrl} alt="Attached Snip" className="w-10 h-8 object-cover rounded-md" />
            <span className="text-xs text-slate-300 font-mono">Captura Snipaste adjunta</span>
          </div>
          <button
            onClick={() => setAttachedSnipUrl(null)}
            className="text-xs text-slate-400 hover:text-red-400 p-1"
          >
            Quitar
          </button>
        </div>
      )}

      {/* Input Area Bar */}
      <div className="pt-2 border-t border-white/10">
        <div className="relative rounded-2xl liquid-glass border border-white/15 p-2 focus-within:border-sky-400/80 transition-colors">
          <textarea
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Escribe una instrucción para ${selectedModel}...`}
            rows={2}
            className="w-full bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none resize-none px-1 py-0.5 leading-relaxed"
          />

          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            {/* Quick Actions */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  if (snips.length > 0) {
                    setAttachedSnipUrl(snips[0].imageDataUrl);
                  } else {
                    startSnipMode();
                  }
                }}
                title="Adjuntar captura Snipaste"
                className="px-2 py-1 rounded-lg bg-white/5 hover:bg-white/15 text-slate-300 hover:text-white text-[11px] flex items-center gap-1.5 border border-white/10 transition-colors"
              >
                <Scissors className="w-3 h-3 text-sky-400" />
                <span>Adjuntar Snip</span>
              </button>

              <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                <Zap className="w-2.5 h-2.5 text-amber-400" />
                Costo est: ~320t
              </span>
            </div>

            {/* Send Button */}
            <button
              onClick={handleSend}
              disabled={isGenerating || (!inputVal.trim() && !attachedSnipUrl)}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all spring-interactive"
            >
              <span>Enviar</span>
              <Send className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
