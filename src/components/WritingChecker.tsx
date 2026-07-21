import React, { useState } from 'react';
import { 
  Sparkles, 
  Trash2, 
  Copy, 
  Check, 
  HelpCircle, 
  AlertTriangle, 
  Award, 
  FileText, 
  ArrowRightLeft, 
  CheckCircle,
  TrendingUp,
  Briefcase,
  Smile
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { WritingCheckResult } from '../types';

export default function WritingChecker() {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<WritingCheckResult | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const wordCount = inputText.trim() === '' ? 0 : inputText.trim().split(/\s+/).length;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleCheck = async () => {
    if (!inputText.trim() || loading) return;

    setLoading(true);
    setResult(null);
    setLoadingStep(0);

    // Simulate stepping through loader for premium feel
    const stepInterval = setInterval(() => {
      setLoadingStep(prev => (prev < 2 ? prev + 1 : prev));
    }, 1500);

    try {
      const response = await fetch('/api/check-writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText })
      });

      if (!response.ok) {
        throw new Error('Failed to analyze text');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      alert('An error occurred while checking your writing. Please try again.');
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
    }
  };

  const handleClear = () => {
    if (window.confirm('Clear all input and results?')) {
      setInputText('');
      setResult(null);
    }
  };

  // Determine score color classes
  const getScoreColor = (score: number) => {
    if (score >= 85) return { bg: 'bg-emerald-50 text-emerald-800 border-emerald-200', circle: 'stroke-emerald-500', text: 'text-emerald-600' };
    if (score >= 70) return { bg: 'bg-amber-50 text-amber-800 border-amber-200', circle: 'stroke-amber-500', text: 'text-amber-600' };
    return { bg: 'bg-rose-50 text-rose-800 border-rose-200', circle: 'stroke-rose-500', text: 'text-rose-600' };
  };

  const scoreDetails = result ? getScoreColor(result.score) : null;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6" id="writing_checker_container">
      {/* Input Work area */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-md">
              <FileText className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-slate-800 text-base">魔法少儿作文大玩家 ✏️</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {wordCount} 单词 | {inputText.length} 字母
          </span>
        </div>

        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={6}
          disabled={loading}
          placeholder="写下你想说的话或小作文（例如：I love playing with my dog Buddy!），AI小老师会帮你变得超级地道哦！"
          className="w-full p-4 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl text-slate-800 text-sm focus:outline-none resize-y min-h-[120px] disabled:bg-slate-50 disabled:text-slate-400"
        />

        <div className="flex items-center justify-end gap-3 mt-4">
          {inputText.trim() && (
            <button
              onClick={handleClear}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>清空输入</span>
            </button>
          )}

          <button
            onClick={handleCheck}
            disabled={loading || !inputText.trim()}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all disabled:bg-slate-300 shadow-sm flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{loading ? '正在诊断中...' : '一键语法分析与纠错'}</span>
          </button>
        </div>
      </div>

      {/* Loading Steps screen */}
      {loading && (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 shadow-sm flex flex-col items-center justify-center text-center">
          <div className="relative w-16 h-16 mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
            <div className="absolute inset-0 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin"></div>
          </div>
          <h4 className="font-bold text-slate-800 text-base">正在深度解析文本...</h4>
          <p className="text-slate-400 text-xs mt-1.5 max-w-sm">
            AI 正在精细核对词性、分析句法逻辑，并设计多套修改润色方案
          </p>

          {/* Loading status steps */}
          <div className="mt-6 flex gap-6 text-xs font-medium text-slate-400">
            <span className={loadingStep >= 0 ? 'text-indigo-600 font-semibold' : ''}>1. 扫描错别字</span>
            <span className="text-slate-300">→</span>
            <span className={loadingStep >= 1 ? 'text-indigo-600 font-semibold' : ''}>2. 句法结构诊断</span>
            <span className="text-slate-300">→</span>
            <span className={loadingStep >= 2 ? 'text-indigo-600 font-semibold' : ''}>3. 生成地道改写</span>
          </div>
        </div>
      )}

      {/* Analysis Results Display */}
      {result && scoreDetails && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Diagnostic Stats Header */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Circular score display */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col items-center justify-center">
              <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase mb-3">英语评估得分</span>
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="8" fill="transparent" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    stroke="currentColor" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * result.score) / 100}
                    className={`transition-all duration-1000 ${scoreDetails.circle}`}
                  />
                </svg>
                <span className="text-3xl font-extrabold text-slate-800">{result.score}</span>
              </div>
              <span className={`mt-3 text-xs font-bold px-2.5 py-1 rounded-full border ${scoreDetails.bg}`}>
                {result.score >= 85 ? '优秀 Excellent' : result.score >= 70 ? '良好 Good' : '需改进 Improve'}
              </span>
            </div>

            {/* General Feedback overview */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm md:col-span-3 flex flex-col justify-center">
              <div className="flex items-center gap-1.5 text-slate-700 font-bold mb-2">
                <Award className="w-4 h-4 text-indigo-600" />
                <span>写作诊断与备考评语</span>
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">
                {result.overallFeedback}
              </p>
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> 
                  发现错漏 {result.detailedCorrections.length} 处
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
                  词汇优化已覆盖
                </span>
              </div>
            </div>
          </div>

          {/* Side-by-Side original and polished comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-400">原始作文</span>
                <span className="text-[10px] text-rose-500 font-semibold px-2 py-0.5 bg-rose-50 rounded-full">
                  Original
                </span>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap flex-1 min-h-[100px] font-sans">
                {result.original}
              </p>
            </div>

            <div className="bg-white border border-indigo-200 bg-indigo-50/10 rounded-2xl p-5 shadow-sm flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-600/5 rounded-full transform translate-x-4 -translate-y-4"></div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 relative z-10">
                <span className="text-xs font-bold text-indigo-600">完美地道版本</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-emerald-600 font-semibold px-2 py-0.5 bg-emerald-50 rounded-full">
                    Corrected & Polished
                  </span>
                  <button
                    onClick={() => handleCopy(result.corrected, 'corrected')}
                    className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded transition-all"
                    title="复制完美地道版本"
                  >
                    {copiedType === 'corrected' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
              <p className="text-slate-800 text-sm font-semibold leading-relaxed whitespace-pre-wrap flex-1 min-h-[100px] font-sans relative z-10">
                {result.corrected}
              </p>
            </div>
          </div>

          {/* Detailed corrections table list */}
          {result.detailedCorrections.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center gap-1.5 text-slate-800 font-bold mb-4">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>错漏处精准解析列表 ({result.detailedCorrections.length})</span>
              </div>

              <div className="space-y-4">
                {result.detailedCorrections.map((corr, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200/60 rounded-xl grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                    <div className="md:col-span-1 flex items-center justify-center">
                      <span className="w-5 h-5 bg-slate-200 text-slate-700 rounded-full font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                    </div>

                    <div className="md:col-span-5 space-y-2">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-0.5">原句/原词:</span>
                        <span className="px-2 py-1 bg-red-50 text-red-700 border border-red-100 rounded text-xs font-semibold inline-block line-through">
                          {corr.error}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-0.5">修正为:</span>
                        <span className="px-2 py-1 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded text-xs font-semibold inline-block">
                          {corr.fix}
                        </span>
                      </div>
                    </div>

                    <div className="md:col-span-6 bg-white p-3 border border-slate-150 rounded-lg">
                      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1">原因与语法解析:</span>
                      <p className="text-slate-600 text-xs leading-relaxed">
                        {corr.explanation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Style variations rewrite */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center gap-1.5 text-slate-800 font-bold mb-4">
              <ArrowRightLeft className="w-4 h-4 text-indigo-600" />
              <span>给力的两种魔法改写方案</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Professional Style (Mapped to Shiny Advanced) */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 relative">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-indigo-700 flex items-center gap-1.5 bg-indigo-50 px-2.5 py-1 rounded-full">
                    <Briefcase className="w-3.5 h-3.5" />
                    ✨ 闪亮升级的高级版 (Shiny Advanced)
                  </span>
                  <button
                    onClick={() => handleCopy(result.alternativeVersions.professional, 'professional')}
                    className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-white border border-transparent hover:border-slate-200 rounded transition-all shadow-sm"
                    title="复制高级版本"
                  >
                    {copiedType === 'professional' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-slate-700 text-xs leading-relaxed font-sans italic">
                  "{result.alternativeVersions.professional}"
                </p>
              </div>

              {/* Casual Style (Mapped to Easy & Cute) */}
              <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 relative">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-teal-700 flex items-center gap-1.5 bg-teal-50 px-2.5 py-1 rounded-full">
                    <Smile className="w-3.5 h-3.5" />
                    🎈 简单又可爱的版本 (Easy & Cute)
                  </span>
                  <button
                    onClick={() => handleCopy(result.alternativeVersions.casual, 'casual')}
                    className="p-1 text-slate-400 hover:text-teal-600 hover:bg-white border border-transparent hover:border-slate-200 rounded transition-all shadow-sm"
                    title="复制可爱版本"
                  >
                    {copiedType === 'casual' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <p className="text-slate-700 text-xs leading-relaxed font-sans italic">
                  "{result.alternativeVersions.casual}"
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
