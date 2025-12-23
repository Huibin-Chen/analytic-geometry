
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Send, X, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  onClose: () => void;
}

export const ChatAssistant: React.FC<Props> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '您好！我是您的《解析几何》AI助教。关于椭球面的圆截面、二次曲面的分类或陈老师课上的知识点，您有什么疑问吗？' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          { role: 'user', parts: [{ text: userMessage }] }
        ],
        config: {
          systemInstruction: '你是一个专业的大学数学助教，擅长解析几何。你的目标是帮助学生理解椭球面的性质，特别是圆截面的存在性及其数学证明。你的风格严谨而不失亲切，适合大一学生。如果你不知道陈慧斌老师具体的教学细节，请侧重于标准的数学知识讲解。',
        }
      });

      const aiResponse = response.text || '对不起，我暂时无法回答这个问题。';
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: '由于网络连接问题，我无法处理您的请求。请稍后再试。' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col h-full overflow-hidden">
      <div className="p-4 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bot className="text-indigo-400" />
          <h2 className="text-white font-semibold italic">解析几何 AI 助教</h2>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded-lg text-slate-400">
          <X size={20} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-grow p-4 overflow-y-auto space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
              m.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-tr-none' 
                : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
            }`}>
              <div className="flex items-center gap-2 mb-1 opacity-50 text-[10px] uppercase font-bold">
                {m.role === 'user' ? <User size={10} /> : <Bot size={10} />}
                {m.role === 'user' ? '你' : 'AI 助教'}
              </div>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 p-3 rounded-2xl text-slate-400 flex items-center gap-2">
              <Loader2 className="animate-spin" size={16} />
              正在思考...
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-slate-900/50 border-t border-slate-800">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="询问有关解析几何的问题..."
            className="flex-grow bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl transition-colors disabled:opacity-50"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
