"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Bot, Cpu, Play, Sparkles, Zap, Activity, CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react";
import { usePreferences } from "@/context/PreferencesContext";
import { getApiBaseUrl } from "@/lib/config";

interface Plan {
  name: string;
  price_display: string;
  max_requests: number;
  features: string[];
}

interface AIStatus {
  ai_boost_active: boolean;
  plan: string;
  requests_used: number;
  max_requests: number;
  requests_remaining: number;
}

export default function AIBoostPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  const { t, lang } = usePreferences();

  const [activeTab, setActiveTab] = useState<'plans' | 'use' | 'usage'>('plans');
  const [plans, setPlans] = useState<Record<string, Plan>>({});
  const [status, setStatus] = useState<AIStatus | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // AI Features
  const [prompt, setPrompt] = useState('');
  const [featureType, setFeatureType] = useState<'improve' | 'feature' | 'tests' | 'docs' | 'chat'>('improve');
  const [codeInput, setCodeInput] = useState('');
  const [aiResponse, setAIResponse] = useState('');
  const [aiLoading, setAILoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [plansRes, statusRes] = await Promise.all([
        fetch(`${getApiBaseUrl()}/api/ai-boost/plans`),
        fetch(`${getApiBaseUrl()}/api/ai-boost/status/${projectId}`)
      ]);
      setPlans((await plansRes.json()).plans);
      const statusData = await statusRes.json();
      setStatus(statusData);
      if (statusData.plan) setSelectedPlan(statusData.plan);
    } catch (err) {
      setMessage({ type: 'error', text: t('common.error') });
    } finally {
      setLoading(false);
    }
  }, [projectId, t]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const activatePlan = async (planKey: string) => {
    setProcessing(true);
    setMessage(null);
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/ai-boost/mock-confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project_id: projectId, plan: planKey })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: data.message });
         void loadData();
        setActiveTab('use');
      } else {
        setMessage({ type: 'error', text: data.error || t('common.error') });
      }
    } catch {
      setMessage({ type: 'error', text: t('common.error') });
    } finally {
      setProcessing(false);
    }
  };

  const executeAI = async () => {
    if (!prompt.trim() && !codeInput.trim()) {
      setMessage({ type: 'error', text: 'Prompt/Code required' });
      return;
    }
    setAILoading(true);
    setAIResponse('');
    try {
      let endpoint = '';
      let body: any = {};

      switch (featureType) {
        case 'improve':
          endpoint = `${getApiBaseUrl()}/api/ai-boost/projects/${projectId}/ai/improve-code`;
          body = { code: codeInput || prompt, language: 'python' };
          break;
        case 'feature':
          endpoint = `${getApiBaseUrl()}/api/ai-boost/projects/${projectId}/ai/generate-feature`;
          body = { description: prompt, include_tests: false };
          break;
        case 'tests':
          endpoint = `${getApiBaseUrl()}/api/ai-boost/projects/${projectId}/ai/generate-tests`;
          body = { code: codeInput || prompt, language: 'python' };
          break;
        case 'docs':
          endpoint = `${getApiBaseUrl()}/api/ai-boost/projects/${projectId}/ai/generate-docs`;
          body = { code: codeInput || prompt };
          break;
        case 'chat':
          endpoint = `${getApiBaseUrl()}/api/ai-boost/projects/${projectId}/ai/chat`;
          body = { prompt };
          break;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (res.status === 403) {
        setMessage({ type: 'error', text: 'Limit reached or AI Boost inactive' });
        return;
      }

      const data = await res.json();
      if (data.success !== false) {
        setAIResponse(data.response || data.error);
         void loadData();
      } else {
        setMessage({ type: 'error', text: data.error || t('common.error') });
      }
    } catch {
      setMessage({ type: 'error', text: t('common.error') });
    } finally {
      setAILoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-primary" size={40} />
          <p className="animate-pulse font-medium text-gray-500">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  const usagePercent = status ? Math.round((status.requests_used / status.max_requests) * 100) : 0;

  return (
    <div className="min-h-screen bg-background text-foreground animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-b border-white/5 p-8">
        <div className="max-w-6xl mx-auto">
          <button onClick={() => router.push(`/projects/${projectId}`)} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 font-medium transition-colors">
            <ArrowLeft size={16} /> {t('common.back')}
          </button>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/30">
              <Cpu size={32} className="text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">{t('ai_boost.title')}</h1>
              <p className="text-gray-400 mt-1">{t('ai_boost.subtitle')}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-8">
        {/* Status Card */}
        <div className="bg-surface border border-border rounded-2xl p-6 mb-8 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
            <Cpu size={120} />
          </div>
          
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h2 className="text-lg font-bold flex items-center gap-2">
                {t('common.status')}: 
                <span className={status?.ai_boost_active ? 'text-green-400' : 'text-yellow-400'}>
                  {status?.ai_boost_active ? t('ai_boost.status_active') : t('ai_boost.status_inactive')}
                </span>
              </h2>
              {status?.plan && (
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">{t('common.stack')}: {plans[status.plan]?.name || status.plan}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-primary">{status?.requests_remaining || 0}</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{t('ai_boost.requests_remaining')}</p>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-6 bg-black/40 rounded-full h-3 border border-white/5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.3)] ${usagePercent > 80 ? 'bg-red-500' : usagePercent > 50 ? 'bg-yellow-500' : 'bg-primary'}`}
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
          <p className="text-[10px] font-bold text-gray-600 mt-2 uppercase tracking-widest">{status?.requests_used || 0} / {status?.max_requests || 0} {t('ai_boost.usage')}</p>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-surface border border-border rounded-xl mb-8 w-fit">
          {[
            { id: 'plans', label: t('ai_boost.plans') },
            { id: 'use', label: t('ai_boost.use') },
            { id: 'usage', label: t('ai_boost.usage') }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-gray-300'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Messages */}
        {message && (
          <div className={`p-4 rounded-xl mb-8 border animate-in slide-in-from-top-2 duration-300 ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
            <div className="flex items-center gap-3">
              {message.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
              <span className="font-medium text-sm">{message.text}</span>
            </div>
          </div>
        )}

        {/* Tab: Plans */}
        {activeTab === 'plans' && (
          <div className="grid md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {Object.entries(plans).map(([key, plan]) => (
              <div key={key} className={`bg-surface border-2 rounded-2xl p-6 transition-all group hover:scale-[1.02] ${status?.plan === key ? 'border-primary' : 'border-border hover:border-gray-700'}`}>
                <h3 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{plan.name}</h3>
                <p className="text-3xl font-black text-white mt-3">{plan.price_display}</p>
                <p className="text-[10px] font-bold text-gray-500 mt-1 uppercase tracking-widest">{plan.max_requests} requests</p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-center text-sm text-gray-400">
                      <CheckCircle size={14} className="text-primary mr-3 shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => activatePlan(key)}
                  disabled={processing || status?.ai_boost_active}
                  className={`w-full mt-8 py-3 rounded-xl font-bold transition-all shadow-lg ${status?.plan === key ? 'bg-green-500 text-black shadow-green-500/20' : 'bg-primary text-white hover:bg-blue-600 shadow-primary/20 disabled:opacity-50 active:scale-95'}`}
                >
                  {processing ? t('common.loading') : status?.plan === key ? t('ai_boost.status_active') : t('common.save')}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tab: Use */}
        {activeTab === 'use' && (
          <div className="bg-surface border border-border rounded-2xl p-8 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-500">
            {!status?.ai_boost_active ? (
              <div className="text-center py-12 space-y-6">
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-500 inline-block">
                  <AlertTriangle size={40} className="mx-auto" />
                </div>
                <p className="text-gray-400 font-medium">{t('ai_boost.status_inactive')}</p>
                <button onClick={() => setActiveTab('plans')} className="px-8 py-3 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95">
                  {t('ai_boost.plans')}
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  <Cpu size={24} className="text-primary" /> {t('ai_boost.execute')}
                </h2>

                {/* Feature Type Selector */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'improve', label: '🔧 Improve' },
                    { key: 'feature', label: '✨ Feature' },
                    { key: 'tests', label: '🧪 Tests' },
                    { key: 'docs', label: '📝 Docs' },
                    { key: 'chat', label: '💬 Chat' }
                  ].map(f => (
                    <button
                      key={f.key}
                      onClick={() => setFeatureType(f.key as any)}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all border ${featureType === f.key ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-black/20 border-border text-gray-500 hover:text-gray-300'
                        }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {/* Inputs */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest ml-1">Prompt</label>
                    <textarea
                      value={prompt}
                      onChange={e => setPrompt(e.target.value)}
                      placeholder={featureType === 'chat' ? '...' : '...'}
                      className="w-full p-4 bg-black/20 border border-border rounded-xl text-white placeholder-gray-600 focus:border-primary focus:outline-none transition-all h-24 text-sm shadow-inner"
                      maxLength={5000}
                    />
                  </div>

                  {['improve', 'tests', 'docs'].includes(featureType) && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-600 uppercase tracking-widest ml-1">Code</label>
                      <textarea
                        value={codeInput}
                        onChange={e => setCodeInput(e.target.value)}
                        placeholder="Paste code here..."
                        className="w-full p-4 bg-[#050505] border border-border rounded-xl text-green-400 font-mono text-xs focus:border-primary focus:outline-none transition-all h-48 shadow-inner"
                        maxLength={10000}
                      />
                    </div>
                  )}
                </div>

                <button
                  onClick={executeAI}
                  disabled={aiLoading}
                  className="w-full md:w-auto px-8 py-3 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-primary/20 disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  {aiLoading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
                  {aiLoading ? t('common.loading') : t('ai_boost.execute')}
                </button>

                {/* Response */}
                {aiResponse && (
                  <div className="mt-8 space-y-4 animate-in slide-in-from-top-4 duration-500">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <CheckCircle size={20} className="text-green-500" /> {t('ai_boost.response')}
                    </h3>
                    <div className="relative">
                       <pre className="bg-[#050505] border border-white/5 p-6 rounded-2xl overflow-x-auto text-xs text-gray-300 whitespace-pre-wrap shadow-2xl leading-relaxed">
                        {aiResponse}
                      </pre>
                      <div className="absolute top-4 right-4 text-[9px] font-black text-primary/30 uppercase tracking-[0.3em] select-none">
                        AGENT BOOST
                      </div>
                    </div>
                    <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest text-right">Ldcn AI Boost 🤖</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab: Usage */}
        {activeTab === 'usage' && (
          <div className="bg-surface border border-border rounded-2xl p-8 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="text-xl font-bold mb-8">{t('ai_boost.usage')}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Requests', value: status?.requests_used || 0, color: 'text-white' },
                { label: 'Limit', value: status?.max_requests || 0, color: 'text-white' },
                { label: 'Remaining', value: status?.requests_remaining || 0, color: 'text-green-400' },
                { label: 'Utilization', value: `${usagePercent}%`, color: 'text-primary' }
              ].map((stat, i) => (
                <div key={i} className="bg-black/20 border border-white/5 rounded-2xl p-6 transition-all hover:bg-black/30">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
