import React, { useState, useEffect, useRef } from 'react';
import { SCENARIOS } from '../data/scenarios';
import { Scenario, ChatMessage } from '../types';
import { 
  Sparkles, 
  Volume2, 
  VolumeX,
  Languages, 
  Send, 
  RotateCcw, 
  ChevronRight, 
  User, 
  Bot, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Simple mapping for lucide icon strings to components
import { Coffee, Briefcase, Utensils, Hotel, MapPin, Smile, PawPrint, IceCream } from 'lucide-react';

const IconMap: Record<string, React.ComponentType<any>> = {
  Coffee,
  Briefcase,
  Utensils,
  Hotel,
  MapPin,
  Smile,
  PawPrint,
  IceCream,
  Sparkles
};

export default function RoleplayChat() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [showTranslations, setShowTranslations] = useState<Record<string, boolean>>({});

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load active session from localStorage on mount/scenario change
  useEffect(() => {
    if (selectedScenario) {
      const saved = localStorage.getItem(`chat_session_${selectedScenario.id}`);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        // Start fresh with the scenario's initial message
        const initialMsg: ChatMessage = {
          id: 'initial',
          role: 'assistant',
          text: selectedScenario.initialMessage,
          translation: '你好！🧸 我是泰迪，你毛茸茸的小熊朋友！今天我很高兴能和你一起玩。你叫什么名字呀？', // Fallback defaults
          hints: ['My name is Tom!', 'Hi Teddy! I am Lily.', 'Hello! I am seven years old.'],
          timestamp: Date.now()
        };
        // Quick custom translation map based on the scenario ID just in case
        if (selectedScenario.id === 'pet_friend') {
          initialMsg.translation = '汪汪！🐶 你好呀！我是巴迪，一只会说话的小狗！我想跑跑跳跳、尽情玩耍！你家里养宠物了吗？';
          initialMsg.hints = [
            'Yes, I have a cute cat!',
            'No, I do not have a pet.',
            'I love puppies! You are so cute.'
          ];
        } else if (selectedScenario.id === 'ice_cream') {
          initialMsg.translation = '你好！🍦 欢迎来到开心冰淇淋甜品店！我今天有粉粉的草莓味和甜甜的巧克力味。你想尝哪一个呢？';
          initialMsg.hints = [
            'I want chocolate ice cream, please!',
            'I like pink strawberry ice cream.',
            'Can I have both flavors?'
          ];
        } else if (selectedScenario.id === 'zoo_animals') {
          initialMsg.translation = '万岁！🦁 欢迎来到神奇动物园！我是导游利奥（Leo）。今天我们可以看到小猴子和大熊猫！你最喜欢什么动物呀？';
          initialMsg.hints = [
            'I love big pandas!',
            'I like cute monkeys.',
            'Can we see the lions?'
          ];
        } else if (selectedScenario.id === 'magic_wizard') {
          initialMsg.translation = '你好，年轻的小法师！🪄 我是梅林。看！我的魔法棒能让星星闪闪发光！你想跟我学一个神奇的魔法词吗？';
          initialMsg.hints = [
            'Yes! Teach me a magic word!',
            'Wow, your wand is so cool!',
            'Abracadabra! Did I do magic?'
          ];
        }

        setMessages([initialMsg]);
      }
    }
  }, [selectedScenario]);

  // Persist messages to localStorage
  useEffect(() => {
    if (selectedScenario && messages.length > 0) {
      localStorage.setItem(`chat_session_${selectedScenario.id}`, JSON.stringify(messages));
    }
  }, [messages, selectedScenario]);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Speak English text using browser speech synthesis
  const handleSpeak = (text: string, id: string) => {
    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel(); // Stop any active speech

    const cleanText = text.replace(/\[.*?\]/g, '').trim(); // Remove brackets if any
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';
    utterance.rate = speechRate;

    utterance.onend = () => {
      setSpeakingId(null);
    };

    utterance.onerror = () => {
      setSpeakingId(null);
    };

    setSpeakingId(id);
    window.speechSynthesis.speak(utterance);
  };

  // Toggle single message translation
  const toggleTranslation = (id: string) => {
    setShowTranslations(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Reset entire conversation
  const handleReset = () => {
    if (!selectedScenario) return;
    if (window.confirm('Are you sure you want to restart this conversation? This will clear history.')) {
      localStorage.removeItem(`chat_session_${selectedScenario.id}`);
      setSelectedScenario(null);
      setTimeout(() => {
        setSelectedScenario(selectedScenario);
      }, 50);
    }
  };

  // Send message
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || !selectedScenario || loading) return;

    // 1. Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend.trim(),
      timestamp: Date.now()
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputText('');
    setLoading(true);

    try {
      // Send chat log to express server
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioId: selectedScenario.id,
          systemPrompt: selectedScenario.systemPrompt,
          messages: updatedMessages.map(m => ({ role: m.role, text: m.text }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI partner');
      }

      const data = await response.json();

      // 2. Build grammar check results if available and append assistant response
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: data.aiResponse,
        translation: data.translation,
        hints: data.hints || [],
        timestamp: Date.now()
      };

      // Apply grammar corrections back to the user's message we just sent!
      if (data.grammarCheck) {
        setMessages(prev => {
          return prev.map((msg) => {
            if (msg.id === userMsg.id) {
              return {
                ...msg,
                grammarCheck: data.grammarCheck
              };
            }
            return msg;
          });
        });
      }

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      // Fallback assistant response on failure
      const fallbackMsg: ChatMessage = {
        id: `assistant-error-${Date.now()}`,
        role: 'assistant',
        text: "I'm sorry, I'm having trouble connecting to the network. Could you please say that again?",
        translation: '对不起，我连接网络时遇到了一些麻烦。你能再对我说一遍吗？',
        hints: ['Sure, let me repeat.', 'No problem, I understand.', 'Is everything okay?'],
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const currentIcon = (iconName: string) => {
    const Component = IconMap[iconName] || Coffee;
    return <Component className="w-6 h-6 text-indigo-600" />;
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col min-h-[600px] bg-slate-50 rounded-2xl border border-slate-150 overflow-hidden shadow-sm" id="roleplay_chat_container">
      {!selectedScenario ? (
        /* Scenario Selector Screen */
        <div className="flex-1 p-6 md:p-10 flex flex-col justify-center items-center">
          <div className="text-center max-w-xl mb-10">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full tracking-wider uppercase">
              Roleplay Partner
            </span>
            <h2 className="text-3xl font-bold text-slate-800 mt-3 tracking-tight">
              选择一个场景，开始英语口语对话
            </h2>
            <p className="text-slate-500 mt-2 text-sm leading-relaxed">
              智能AI将扮演不同身份，并针对你的回复实时进行<strong>语法纠错、用词优化与口语润色</strong>，帮助你彻底告别哑巴英语。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
            {SCENARIOS.map((scen, idx) => (
              <motion.button
                key={scen.id}
                whileHover={{ y: -3, scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => setSelectedScenario(scen)}
                className="flex text-left p-5 bg-white border border-slate-200 rounded-xl hover:border-indigo-400 hover:shadow-md transition-all duration-200 group relative overflow-hidden"
              >
                <div className="mr-4 p-3 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                  {currentIcon(scen.icon)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 text-base">{scen.nameZh}</span>
                    <span className="text-xs text-slate-400 group-hover:text-indigo-600 font-mono flex items-center gap-1 transition-colors">
                      {scen.name} <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                    {scen.descriptionZh}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      ) : (
        /* Active Chat Workspace */
        <div className="flex-1 flex flex-col bg-white">
          {/* Active Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setSelectedScenario(null)}
                className="text-slate-500 hover:text-slate-800 transition-colors text-sm font-semibold flex items-center"
              >
                ← 返回场景
              </button>
              <div className="h-4 w-[1px] bg-slate-300"></div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-indigo-100 rounded-md">
                  {currentIcon(selectedScenario.icon)}
                </span>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">{selectedScenario.nameZh}</h3>
                  <p className="text-xs text-slate-400 font-mono">{selectedScenario.name}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Speed Rate Control */}
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-600 shadow-sm">
                <span className="text-slate-400 mr-1.5">语音速度:</span>
                {[0.8, 1.0, 1.2].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => setSpeechRate(rate)}
                    className={`px-1.5 py-0.5 rounded ${speechRate === rate ? 'bg-indigo-600 text-white font-semibold' : 'hover:bg-slate-100'}`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>

              {/* Reset Session */}
              <button
                onClick={handleReset}
                title="清除聊天历史，重置此场景"
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Dialogue Messages list */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[500px]">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div key={msg.id} className="space-y-2">
                  <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} items-start gap-3`}>
                    {/* Bot Avatar */}
                    {!isUser && (
                      <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 shadow-sm">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm relative group transition-all duration-200 ${
                      isUser 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
                    }`}>
                      <p className="text-[14.5px] leading-relaxed whitespace-pre-wrap font-sans">{msg.text}</p>

                      {/* Display assistant's translation inline if toggled */}
                      {(!isUser && msg.translation) && (
                        <AnimatePresence>
                          {showTranslations[msg.id] && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-2 pt-2 border-t border-slate-200/50 text-slate-600 text-xs leading-relaxed"
                            >
                              {msg.translation}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      )}

                      {/* Action Menu (Translate and Voice Speaker) */}
                      <div className={`mt-2 flex items-center justify-end gap-1.5 pt-1.5 border-t ${
                        isUser ? 'border-indigo-500/30 text-indigo-200' : 'border-slate-200 text-slate-400'
                      }`}>
                        {!isUser && msg.translation && (
                          <button
                            onClick={() => toggleTranslation(msg.id)}
                            title="翻译/中英切换"
                            className={`p-1 rounded hover:bg-slate-200/60 hover:text-slate-700 transition-all ${showTranslations[msg.id] ? 'text-indigo-600 bg-slate-200/40' : ''}`}
                          >
                            <Languages className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleSpeak(msg.text, msg.id)}
                          title="听发音"
                          className={`p-1 rounded hover:bg-opacity-20 transition-all ${
                            isUser 
                              ? 'hover:bg-white text-indigo-200 hover:text-white' 
                              : `hover:bg-slate-200/60 hover:text-slate-700 ${speakingId === msg.id ? 'text-indigo-600 bg-slate-200/40 animate-pulse' : ''}`
                          }`}
                        >
                          {speakingId === msg.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* User Avatar */}
                    {isUser && (
                      <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-600 shrink-0 shadow-sm">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>

                  {/* Grammar correction results overlay (only for user messages if corrections are returned) */}
                  {isUser && msg.grammarCheck && (
                    <div className="flex justify-end gap-3">
                      <div className="max-w-[75%] mr-11">
                        {msg.grammarCheck.hasErrors ? (
                          <motion.div 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-xs text-amber-900"
                          >
                            <div className="flex items-center gap-1.5 text-amber-700 font-semibold mb-1">
                              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>语法用词诊断与优化</span>
                            </div>
                            <div className="space-y-1">
                              <p>
                                <span className="text-slate-400 line-through mr-1">"{msg.text}"</span>
                              </p>
                              <p className="font-semibold text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>推荐地道说法: </span>
                                <span>"{msg.grammarCheck.corrected}"</span>
                              </p>
                              {msg.grammarCheck.explanation && (
                                <p className="text-slate-600 mt-1.5 pl-4 border-l-2 border-amber-200 leading-relaxed text-[11px]">
                                  {msg.grammarCheck.explanation}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div 
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-emerald-50/70 border border-emerald-200 rounded-xl px-3 py-1.5 text-[11px] text-emerald-800 flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>非常好！表达地道，毫无语法错误。Excellent work!</span>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex justify-start items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-100 border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
                  <span className="text-xs text-slate-500">AI Partner is drafting response</span>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Expressions Hints / Help list */}
          {(!loading && messages.length > 0 && messages[messages.length - 1].role === 'assistant') && (
            <div className="px-6 py-2 bg-indigo-50/30 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-semibold mb-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>口语回复灵感（点击可直接代入输入框）:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {messages[messages.length - 1].hints?.map((hint, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInputText(hint)}
                    className="text-xs bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 px-3 py-1.5 rounded-full transition-all text-left shadow-sm truncate max-w-full"
                  >
                    {hint}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Interactive Keyboard Input */}
          <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage(inputText);
              }}
              disabled={loading}
              placeholder="用英语回复（例如: Great! What about you?）..."
              className="flex-1 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-2.5 text-sm focus:outline-none disabled:bg-slate-100 disabled:text-slate-400 shadow-inner"
            />
            <button
              onClick={() => handleSendMessage(inputText)}
              disabled={loading || !inputText.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-slate-300 rounded-xl px-4 py-2.5 font-semibold text-sm transition-all shadow-sm flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
