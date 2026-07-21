import React, { useState, useEffect } from 'react';
import RoleplayChat from './components/RoleplayChat';
import WritingChecker from './components/WritingChecker';
import VocabularyBuilder from './components/VocabularyBuilder';
import { 
  GraduationCap, 
  MessageSquare, 
  FileText, 
  BookOpen, 
  Sparkles, 
  Flame, 
  Award,
  HelpCircle,
  BookMarked
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'writing' | 'vocab'>('chat');
  const [studyStreak, setStudyStreak] = useState(1);
  const [savedCount, setSavedCount] = useState(0);

  // Load study streak or dictionary count for stats decoration
  useEffect(() => {
    // Basic study streak logic
    const lastStudy = localStorage.getItem('last_study_date');
    const today = new Date().toDateString();
    const streak = localStorage.getItem('study_streak');

    if (lastStudy === today) {
      if (streak) setStudyStreak(parseInt(streak));
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastStudy === yesterday.toDateString()) {
        const newStreak = streak ? parseInt(streak) + 1 : 1;
        setStudyStreak(newStreak);
        localStorage.setItem('study_streak', newStreak.toString());
      } else {
        localStorage.setItem('study_streak', '1');
        setStudyStreak(1);
      }
      localStorage.setItem('last_study_date', today);
    }

    // Monitor saved words count
    const updateSavedCount = () => {
      const saved = localStorage.getItem('saved_word_bank');
      if (saved) {
        setSavedCount(JSON.parse(saved).length);
      } else {
        setSavedCount(0);
      }
    };

    updateSavedCount();
    // Periodically sync saved words count
    const interval = setInterval(updateSavedCount, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800" id="app_root">
      {/* Navigation Header bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5">
            <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-md shadow-indigo-100 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-slate-900 text-lg tracking-tight">
                  AI少儿英语乐园 🧸
                </h1>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider">
                  Kids 🧒
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">
                24小时趣味少儿口语与写作英语树
              </p>
            </div>
          </div>

          {/* Stats Badges */}
          <div className="flex items-center gap-3">
            {/* Streak Badge */}
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-3 py-1.5 shadow-xs" title="每日学习打卡天数">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
              <span className="text-xs font-bold text-amber-800">{studyStreak} 天打卡</span>
            </div>

            {/* Saved Dictionary Badge */}
            <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-full px-3 py-1.5 shadow-xs" title="个性词库收藏生词数">
              <BookMarked className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-emerald-800">{savedCount} 生词</span>
            </div>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
        
        {/* Navigation Tabs Menu */}
        <div className="bg-white border border-slate-200 rounded-2xl p-1.5 shadow-xs max-w-xl mx-auto w-full grid grid-cols-3 gap-1" id="tab_navigation_bar">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl transition-all font-bold text-xs sm:text-sm ${
              activeTab === 'chat' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>魔法聊天 🧸</span>
          </button>

          <button
            onClick={() => setActiveTab('writing')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl transition-all font-bold text-xs sm:text-sm ${
              activeTab === 'writing' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>作文大玩家 ✏️</span>
          </button>

          <button
            onClick={() => setActiveTab('vocab')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl transition-all font-bold text-xs sm:text-sm ${
              activeTab === 'vocab' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>魔法卡片 🐯</span>
          </button>
        </div>

        {/* Display Active Panel with Motion transitions */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="w-full"
            >
              {activeTab === 'chat' && <RoleplayChat />}
              {activeTab === 'writing' && <WritingChecker />}
              {activeTab === 'vocab' && <VocabularyBuilder />}
            </motion.div>
          </AnimatePresence>
        </div>

      </main>

      {/* Footer credits */}
      <footer className="py-6 border-t border-slate-200 text-center text-xs text-slate-400 bg-white">
        <p className="font-sans">
          AI少儿英语乐园 • Powered by Gemini 3.5 Flash Model
        </p>
        <p className="mt-1 text-[10px]">
          利用最顶尖的人工智能，为 9 岁以下宝贝提供好玩、温暖、无压力的英语启蒙对练！
        </p>
      </footer>
    </div>
  );
}
