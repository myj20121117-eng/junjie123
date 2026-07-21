import React, { useState, useEffect } from 'react';
import { THEMATIC_VOCAB } from '../data/vocabularies';
import { VocabWord } from '../types';
import { 
  BookOpen, 
  Sparkles, 
  Volume2, 
  Bookmark, 
  BookmarkCheck,
  Search, 
  HelpCircle, 
  RotateCw,
  PlusCircle,
  Briefcase,
  Plane,
  Heart,
  BookMarked
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function VocabularyBuilder() {
  const [activeCategory, setActiveCategory] = useState<string>('animals');
  const [savedWords, setSavedWords] = useState<VocabWord[]>([]);
  const [topicInput, setTopicInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [customVocab, setCustomVocab] = useState<VocabWord[]>([]);
  const [flippedCards, setFlippedCards] = useState<Record<string, boolean>>({});

  // Load saved word bank from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('saved_word_bank');
    if (saved) {
      setSavedWords(JSON.parse(saved));
    }
  }, []);

  // Save word bank back to localStorage when changed
  const saveToLocalStorage = (list: VocabWord[]) => {
    setSavedWords(list);
    localStorage.setItem('saved_word_bank', JSON.stringify(list));
  };

  // Check if a word is already bookmarked
  const isBookmarked = (wordStr: string) => {
    return savedWords.some(item => item.word.toLowerCase() === wordStr.toLowerCase());
  };

  // Toggle bookmark / word bank save
  const toggleBookmark = (wordObj: VocabWord, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering card flip
    if (isBookmarked(wordObj.word)) {
      const updated = savedWords.filter(item => item.word.toLowerCase() !== wordObj.word.toLowerCase());
      saveToLocalStorage(updated);
    } else {
      const updated = [...savedWords, wordObj];
      saveToLocalStorage(updated);
    }
  };

  // Speak word or sentence using browser SpeechSynthesis
  const handleSpeak = (text: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering card flip
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9; // Slightly slower for clear learning
    window.speechSynthesis.speak(utterance);
  };

  // Card Flip controller
  const handleCardClick = (cardId: string) => {
    setFlippedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  // Handle Dynamic Word Topic Generation via Gemini
  const handleGenerateTopicVocab = async () => {
    if (!topicInput.trim() || loading) return;

    setLoading(true);
    try {
      const response = await fetch('/api/generate-vocab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topicInput.trim() })
      });

      if (!response.ok) {
        throw new Error('Failed to generate words');
      }

      const data = await response.json();
      setCustomVocab(data);
      setActiveCategory('custom'); // Switch view to Custom Generated words
      setTopicInput('');
    } catch (err) {
      console.error(err);
      alert('An error occurred while generating vocabulary. Please try a different topic.');
    } finally {
      setLoading(false);
    }
  };

  // Get active display word cards
  const getActiveWords = (): VocabWord[] => {
    if (activeCategory === 'saved') return savedWords;
    if (activeCategory === 'custom') return customVocab;
    return THEMATIC_VOCAB[activeCategory] || [];
  };

  const wordsToDisplay = getActiveWords();

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6" id="vocab_builder_container">
      {/* Category selector & Custom generation panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Nav Categories */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveCategory('animals')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeCategory === 'animals' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
            }`}
          >
            🐯 可爱动物园
          </button>
          <button
            onClick={() => setActiveCategory('colors')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeCategory === 'colors' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
            }`}
          >
            🎨 色彩与形状
          </button>
          <button
            onClick={() => setActiveCategory('foods')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeCategory === 'foods' 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/60'
            }`}
          >
            🍦 各种美味
          </button>

          {customVocab.length > 0 && (
            <button
              onClick={() => setActiveCategory('custom')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
                activeCategory === 'custom' 
                  ? 'bg-indigo-600 text-white shadow-sm' 
                  : 'bg-indigo-50 hover:bg-indigo-100/60 text-indigo-700 border border-indigo-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>智能主题词汇</span>
            </button>
          )}

          <button
            onClick={() => setActiveCategory('saved')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              activeCategory === 'saved' 
                ? 'bg-emerald-600 text-white shadow-sm' 
                : 'bg-emerald-50 hover:bg-emerald-100/60 text-emerald-700 border border-emerald-100'
            }`}
          >
            <BookMarked className="w-3.5 h-3.5" />
            <span>我的个性词库 ({savedWords.length})</span>
          </button>
        </div>

        {/* Dynamic Topic Generator input */}
        <div className="flex items-center gap-2 max-w-sm w-full md:w-auto shrink-0">
          <input
            type="text"
            value={topicInput}
            onChange={(e) => setTopicInput(e.target.value)}
            disabled={loading}
            placeholder="想要学什么词汇？（如: 玩具、游乐园）..."
            className="flex-1 bg-slate-50 focus:bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3 py-2 text-xs focus:outline-none disabled:bg-slate-100"
          />
          <button
            onClick={handleGenerateTopicVocab}
            disabled={loading || !topicInput.trim()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 shrink-0 transition-all disabled:bg-slate-300"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{loading ? '魔法生成中...' : '魔法出词'}</span>
          </button>
        </div>
      </div>

      {/* Vocabulary Flashcards Display Grid */}
      {wordsToDisplay.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-sm flex flex-col items-center justify-center">
          <BookOpen className="w-12 h-12 text-slate-300 mb-4" />
          <h4 className="font-bold text-slate-800 text-base">词库中暂无卡片</h4>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed max-w-sm">
            {activeCategory === 'saved' 
              ? '当你在玩耍、聊天、写作文或者浏览词汇时，点击卡片右上角的小书签，就可以随时把生词加到这里来复习哦！' 
              : '你可以在右侧输入你想学的主题（例如 "玩具"、"游乐园"），让 AI 小老师为你变出好玩的专属单词卡。'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5" id="vocab_cards_grid">
          {wordsToDisplay.map((item, idx) => {
            const cardId = `${activeCategory}-${item.word}-${idx}`;
            const isFlipped = !!flippedCards[cardId];
            const bookmarked = isBookmarked(item.word);

            return (
              <div
                key={cardId}
                onClick={() => handleCardClick(cardId)}
                className="h-[210px] w-full [perspective:1000px] cursor-pointer group"
              >
                {/* 3D Transform Card Component */}
                <div className={`relative w-full h-full text-center transition-all duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                  
                  {/* FRONT SIDE (Word & IPA) */}
                  <div className="absolute w-full h-full [backface-visibility:hidden] bg-white border border-slate-200 group-hover:border-indigo-400 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between text-left">
                    <div className="flex items-start justify-between">
                      <span className="text-[10px] uppercase font-extrabold tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">
                        {item.pos || 'vocabulary'}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={(e) => handleSpeak(item.word, e)}
                          title="单词朗读"
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => toggleBookmark(item, e)}
                          title={bookmarked ? '移出个性词库' : '加入个性词库'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            bookmarked ? 'text-emerald-600 hover:bg-emerald-50 bg-emerald-50/50' : 'text-slate-400 hover:text-emerald-600 hover:bg-slate-50'
                          }`}
                        >
                          {bookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col justify-center py-2">
                      <h3 className="text-2xl font-extrabold text-slate-800 tracking-tight leading-tight select-all">
                        {item.word}
                      </h3>
                      <p className="text-xs text-indigo-500 font-mono mt-1">
                        {item.phonetic}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 border-t border-slate-50 pt-2">
                      <span>查看中文翻译与例句</span>
                      <span className="font-mono flex items-center gap-0.5 group-hover:text-indigo-500">
                        Flip <RotateCw className="w-3 h-3 group-hover:animate-spin" />
                      </span>
                    </div>
                  </div>

                  {/* BACK SIDE (Translation & Examples) */}
                  <div className="absolute w-full h-full [backface-visibility:hidden] bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between text-left [transform:rotateY(180deg)]">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-lg font-bold text-indigo-700 leading-tight">
                          {item.meaning}
                        </h4>
                        <button
                          onClick={(e) => handleSpeak(item.exampleEn, e)}
                          title="例句朗读"
                          className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-white rounded transition-colors"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      
                      <p className="text-[11px] text-slate-500 italic mt-1.5 leading-snug">
                        <strong>Def:</strong> {item.definition}
                      </p>
                    </div>

                    <div className="my-2 border-t border-dashed border-slate-200 pt-2 flex-1 flex flex-col justify-center">
                      <p className="text-xs font-semibold text-slate-700 leading-normal font-sans">
                        "{item.exampleEn}"
                      </p>
                      <p className="text-xs text-slate-500 leading-normal mt-0.5">
                        {item.exampleZh}
                      </p>
                    </div>

                    <div className="text-[10px] text-slate-400 font-mono text-right flex items-center justify-between border-t border-slate-100 pt-1.5">
                      <span className="text-[10px] text-slate-400">点击卡片翻回正面</span>
                      <span className="flex items-center gap-0.5">
                        Word Bank
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
