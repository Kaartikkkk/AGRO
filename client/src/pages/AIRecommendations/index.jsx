import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BrainCircuit, 
  Sparkles, 
  ArrowRight, 
  Lightbulb, 
  Zap, 
  Leaf, 
  Loader2, 
  RefreshCw, 
  X, 
  MessageSquare, 
  Mic, 
  Send, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  CloudSun, 
  Plus, 
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Languages
} from 'lucide-react';
import DashboardLayout from '../../components/layout/MainLayout';
import { useFarm } from '../../context/FarmContext';
import { aiService } from '../../services/ai.service';
import { useToast } from '../../components/common/Toast';

const AIRecommendationsPage = () => {
  const { farms, loading: farmsLoading, t, lang, toggleLanguage } = useFarm();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('recommendations'); // 'recommendations' | 'chatbot'
  
  // Recommendations States
  const [selectedFarmId, setSelectedFarmId] = useState('all'); // 'all' | farmId
  const [recommendations, setRecommendations] = useState([]); // aggregated or single
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [refreshingFarmId, setRefreshingFarmId] = useState(null);
  const [expandedCards, setExpandedCards] = useState({}); // { farmId_recIndex: boolean }

  // Chatbot States
  const [chatFarmId, setChatFarmId] = useState('general'); // 'general' | farmId
  const [chatMessages, setChatMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedLang, setSelectedLang] = useState(lang || 'en');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  // Rotating skeleton messages
  const skeletonMessages = [
    "Checking weather patterns...",
    "Reviewing crop history...",
    "Analyzing soil data snapshot...",
    "Detecting regional disease issues...",
    "Formulating optimal advice..."
  ];
  const [skeletonMsgIndex, setSkeletonMsgIndex] = useState(0);

  const messageListEndRef = useRef(null);

  // Rotate skeleton messages
  useEffect(() => {
    let interval;
    if (loadingRecs) {
      interval = setInterval(() => {
        setSkeletonMsgIndex((prev) => (prev + 1) % skeletonMessages.length);
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [loadingRecs]);

  // Sync FarmContext language
  useEffect(() => {
    setSelectedLang(lang);
  }, [lang]);

  // Load recommendations
  const fetchRecommendations = async (farmId, forceRefresh = false) => {
    if (farms.length === 0) return;
    
    setLoadingRecs(true);
    try {
      if (farmId === 'all') {
        const data = await aiService.getAllRecommendations();
        setRecommendations(data || []);
      } else {
        const data = await aiService.getRecommendations(farmId);
        // Normalize single farm response to fit the loop array
        const farmObj = farms.find(f => f.id === farmId);
        setRecommendations([{
          farmId: farmId,
          plotName: farmObj?.plotName || 'Selected Farm',
          generated_at: data.generated_at,
          recommendation: data.recommendation,
          dismissed_indices: data.dismissed_indices || []
        }]);
      }
    } catch (error) {
      console.error("Failed to load recommendations:", error);
      showToast(error.response?.data?.message || "Couldn't generate recommendations right now.", "error");
    } finally {
      setLoadingRecs(false);
    }
  };

  // Load chat history
  const loadChatHistory = async () => {
    try {
      const history = await aiService.getChatHistory();
      setChatMessages(history || []);
    } catch (error) {
      console.error("Failed to load chat history:", error);
    }
  };

  useEffect(() => {
    if (farms.length > 0) {
      fetchRecommendations(selectedFarmId);
    }
  }, [farms, selectedFarmId]);

  useEffect(() => {
    if (activeTab === 'chatbot') {
      loadChatHistory();
    }
  }, [activeTab]);

  // Auto scroll chat to bottom
  useEffect(() => {
    if (messageListEndRef.current) {
      messageListEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isTyping]);

  // Refresh single farm recommendations
  const handleRefresh = async (farmId, e) => {
    e.stopPropagation();
    setRefreshingFarmId(farmId);
    try {
      const data = await aiService.refreshRecommendations(farmId);
      showToast("Recommendations updated successfully!", "success");
      
      // Update local state
      setRecommendations((prev) => prev.map(item => {
        if (item.farmId === farmId) {
          return {
            ...item,
            generated_at: data.generated_at,
            recommendation: data.recommendation,
            dismissed_indices: []
          };
        }
        return item;
      }));
    } catch (error) {
      console.error("Failed to refresh recommendations:", error);
      showToast(error.response?.data?.message || "Refresh failed or rate limit hit.", "error");
    } finally {
      setRefreshingFarmId(null);
    }
  };

  // Dismiss a specific recommendation card
  const handleDismissCard = async (farmId, recIndex, e) => {
    e.stopPropagation();
    try {
      const data = await aiService.dismissRecommendation(farmId, recIndex);
      
      // Update local state by updating dismissed_indices
      setRecommendations((prev) => prev.map(item => {
        if (item.farmId === farmId) {
          return {
            ...item,
            dismissed_indices: data.dismissed_indices || []
          };
        }
        return item;
      }));
      showToast("Recommendation dismissed.", "success");
    } catch (error) {
      console.error("Failed to dismiss recommendation:", error);
      showToast("Failed to dismiss item.", "error");
    }
  };

  // Send chatbot message
  const handleSendMessage = async (textToSend) => {
    const messageText = textToSend || inputText;
    if (!messageText.trim() || isTyping) return;

    setInputText('');
    
    // Add user message locally
    const userMsg = {
      id: Math.random().toString(),
      role: 'user',
      message: messageText,
      created_at: new Date().toISOString()
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    try {
      // Map chat messages to API format: [{ role: 'user'|'model', message: '...' }]
      const apiHistory = chatMessages.map(msg => ({
        role: msg.role,
        message: msg.message
      }));

      const activeFarmParam = chatFarmId === 'general' ? null : chatFarmId;
      const response = await aiService.sendChatMessage(
        messageText,
        apiHistory,
        activeFarmParam,
        selectedLang
      );

      // Add bot message
      setChatMessages((prev) => [...prev, {
        id: Math.random().toString(),
        role: 'model',
        message: response.reply,
        suggestions: response.suggestions,
        created_at: response.timestamp || new Date().toISOString()
      }]);
    } catch (error) {
      console.error("Chat error:", error);
      showToast(error.response?.data?.message || "AgroBot is busy. Try again later.", "error");
      setChatMessages((prev) => [...prev, {
        id: Math.random().toString(),
        role: 'model',
        message: "I'm having trouble responding right now. Please try again or verify your connection.",
        created_at: new Date().toISOString()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // Clear chat history
  const handleClearChat = async () => {
    try {
      await aiService.clearChatHistory();
      setChatMessages([]);
      setShowClearConfirm(false);
      showToast("Chat history cleared.", "success");
    } catch (error) {
      console.error("Failed to clear chat:", error);
      showToast("Failed to clear chat history.", "error");
    }
  };

  const toggleExpand = (farmId, index) => {
    const key = `${farmId}_${index}`;
    setExpandedCards(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Custom Markdown Parser to avoid external dependencies
  const renderMessageContent = (text) => {
    if (!text) return null;
    const lines = text.split('\n');
    return lines.map((line, lineIdx) => {
      let content = line;
      let isBullet = false;
      
      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        isBullet = true;
        content = line.trim().slice(2);
      }
      
      // Bold syntax parser **word**
      const boldParts = content.split(/(\*\*.*?\*\*)/g);
      const parsedLine = boldParts.map((part, partIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={partIdx} className="font-bold text-gray-800">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      if (isBullet) {
        return (
          <li key={lineIdx} className="ml-4 list-disc pl-1 text-sm text-gray-700 my-0.5">
            {parsedLine}
          </li>
        );
      }

      return (
        <p key={lineIdx} className="text-sm text-gray-700 leading-relaxed min-h-[1em] my-1">
          {parsedLine}
        </p>
      );
    });
  };

  // Utility to determine priority badge classes
  const getPriorityBadge = (priority) => {
    switch ((priority || '').toLowerCase()) {
      case 'high':
        return <span className="badge bg-red-50 text-red-700 border border-red-200">🔴 High Priority</span>;
      case 'medium':
        return <span className="badge bg-amber-50 text-amber-700 border border-amber-200">🟡 Medium Priority</span>;
      case 'low':
      default:
        return <span className="badge bg-green-50 text-primary border border-primary-100">🟢 Low Priority</span>;
    }
  };

  // Get style categories
  const getCategoryStyles = (category) => {
    switch ((category || '').toLowerCase()) {
      case 'irrigation':
        return { border: 'border-l-4 border-l-blue-500', bg: 'bg-blue-50/40', text: 'text-blue-700' };
      case 'fertilizer':
        return { border: 'border-l-4 border-l-green-500', bg: 'bg-green-50/40', text: 'text-green-700' };
      case 'pest_management':
        return { border: 'border-l-4 border-l-amber-500', bg: 'bg-amber-50/40', text: 'text-amber-700' };
      case 'crop_rotation':
        return { border: 'border-l-4 border-l-purple-500', bg: 'bg-purple-50/40', text: 'text-purple-700' };
      case 'weather_alert':
        return { border: 'border-l-4 border-l-red-500', bg: 'bg-red-50/40', text: 'text-red-700' };
      case 'general':
      default:
        return { border: 'border-l-4 border-l-gray-400', bg: 'bg-gray-50/40', text: 'text-gray-600' };
    }
  };

  const getUrgencyBadge = (urgency) => {
    switch ((urgency || '').toLowerCase()) {
      case 'today':
        return <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-red-100 text-red-800">Today</span>;
      case 'this_week':
        return <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-800">This Week</span>;
      case 'this_month':
      default:
        return <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">This Month</span>;
    }
  };

  // Helper to format Date
  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '--';
    const seconds = Math.floor((new Date() - new Date(dateStr)) / 1000);
    const intervals = {
      hour: 3600,
      minute: 60
    };
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / intervals.minute);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(seconds / intervals.hour);
    if (hours < 24) return `${hours}h ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <DashboardLayout 
      title="AI Recommendations" 
      subtitle="Personalized insights and general farming guidance powered by Gemini-2.0"
    >
      <div className="flex flex-col gap-6 h-full">
        {/* Tab Selector & Language Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white border border-border p-2.5 rounded-2xl shadow-sm">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('recommendations')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'recommendations' 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <BrainCircuit size={18} />
              💡 Smart Recommendations
            </button>
            <button
              onClick={() => setActiveTab('chatbot')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'chatbot' 
                  ? 'bg-white text-primary shadow-sm' 
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <MessageSquare size={18} />
              💬 Ask AgroBot
            </button>
          </div>

          <div className="flex items-center justify-end gap-3 px-2">
            <button 
              onClick={toggleLanguage}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-surface-hover hover:bg-slate-200 border border-border px-3 py-2 rounded-xl transition-all"
            >
              <Languages size={14} className="text-primary-light" />
              <span>Language: {selectedLang === 'en' ? 'English' : 'हिंदी'}</span>
            </button>
          </div>
        </div>

        {/* Tab View Container */}
        <div className="flex-1 min-h-0">
          <AnimatePresence mode="wait">
            
            {/* Tab 1: Recommendations */}
            {activeTab === 'recommendations' && (
              <motion.div
                key="recommendations-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-6 h-full"
              >
                {/* Farms Loading Indicator */}
                {farmsLoading ? (
                  <div className="card-padded flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="animate-spin text-primary" size={36} />
                    <span className="text-sm font-medium text-gray-500">Loading your farm records...</span>
                  </div>
                ) : farms.length === 0 ? (
                  // Empty State for No Farms
                  <div className="card-padded flex flex-col items-center text-center justify-center py-20 max-w-xl mx-auto gap-5">
                    <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center text-primary-light border border-primary-100">
                      <BrainCircuit size={32} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">No Farm Plots Registered</h3>
                      <p className="text-sm text-gray-500 mt-2 max-w-sm">
                        AgroSmart requires plot location, crop type, and crop calendars to generate highly targeted recommendations.
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('/farms')}
                      className="btn-primary flex items-center gap-2"
                    >
                      <Plus size={16} /> Add Plot →
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Farm Selector (if multi-farm) */}
                    {farms.length > 1 && (
                      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
                        <button
                          onClick={() => setSelectedFarmId('all')}
                          className={`px-4 py-2 text-xs font-bold rounded-full whitespace-nowrap transition-all border ${
                            selectedFarmId === 'all' 
                              ? 'bg-primary border-primary text-white' 
                              : 'bg-white border-border text-gray-600 hover:bg-slate-50'
                          }`}
                        >
                          🏠 All Farms
                        </button>
                        {farms.map((f) => (
                          <button
                            key={f.id}
                            onClick={() => setSelectedFarmId(f.id)}
                            className={`px-4 py-2 text-xs font-bold rounded-full whitespace-nowrap transition-all border ${
                              selectedFarmId === f.id 
                                ? 'bg-primary border-primary text-white' 
                                : 'bg-white border-border text-gray-600 hover:bg-slate-50'
                            }`}
                          >
                            🌾 {f.plotName}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Recommendations Content */}
                    {loadingRecs ? (
                      // Skeleton Loading state
                      <div className="flex-1 flex flex-col items-center justify-center bg-white border border-border rounded-2xl py-20 px-8 text-center gap-4">
                        <Loader2 className="animate-spin text-primary" size={42} />
                        <div>
                          <h4 className="text-base font-bold text-gray-900 animate-pulse">🤖 Analyzing your farm data...</h4>
                          <p className="text-xs text-gray-400 mt-1">{skeletonMessages[skeletonMsgIndex]}</p>
                        </div>
                      </div>
                    ) : (
                      // Grid list of recommendations
                      <div className="flex-1 overflow-y-auto space-y-6 pr-1 custom-scrollbar">
                        <AnimatePresence>
                          {recommendations.map((farmRec, fIdx) => {
                            const recs = farmRec.recommendation?.recommendations || [];
                            const nextCrop = farmRec.recommendation?.next_crop_suggestion || {};
                            const summary = farmRec.recommendation?.summary || '';
                            const priority = farmRec.recommendation?.priority || 'low';
                            const weatherImpact = farmRec.recommendation?.weather_impact || '';
                            const isRefreshing = refreshingFarmId === farmRec.farmId;

                            // Filter out dismissed recommendations
                            const dismissedList = farmRec.dismissed_indices || [];
                            const visibleRecs = recs.filter((_, idx) => !dismissedList.includes(idx));

                            return (
                              <motion.div
                                key={farmRec.farmId}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98 }}
                                transition={{ duration: 0.3, delay: fIdx * 0.1 }}
                                className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden"
                              >
                                {/* Farm Card Header */}
                                <div className="bg-slate-50/80 px-6 py-4 border-b border-border flex items-center justify-between flex-wrap gap-3">
                                  <div className="flex items-center gap-2.5">
                                    <span className="text-xl">🌾</span>
                                    <div>
                                      <h3 className="text-base font-bold text-gray-800">{farmRec.plotName}</h3>
                                      <span className="text-xs text-gray-400">
                                        Last generated: {formatTimeAgo(farmRec.generated_at)}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3">
                                    {getPriorityBadge(priority)}
                                    <button
                                      disabled={isRefreshing}
                                      onClick={(e) => handleRefresh(farmRec.farmId, e)}
                                      className={`p-2 rounded-xl border border-border text-gray-500 bg-white hover:bg-slate-100 hover:text-gray-800 transition-all ${
                                        isRefreshing ? 'cursor-not-allowed opacity-50' : 'active:scale-95'
                                      }`}
                                      title="Force Refresh recommendations"
                                    >
                                      <RefreshCw 
                                        size={14} 
                                        className={isRefreshing ? 'animate-spin text-primary' : ''} 
                                      />
                                    </button>
                                  </div>
                                </div>

                                <div className="p-6 space-y-6">
                                  {/* Summary Banner */}
                                  {summary && (
                                    <div className={`p-4 rounded-xl text-sm leading-relaxed border ${
                                      priority === 'high' 
                                        ? 'bg-red-50 text-red-800 border-red-100'
                                        : priority === 'medium'
                                        ? 'bg-amber-50 text-amber-800 border-amber-100'
                                        : 'bg-green-50/70 text-green-800 border-green-100'
                                    }`}>
                                      <div className="flex gap-2.5 items-start">
                                        <AlertCircle size={18} className="shrink-0 mt-0.5" />
                                        <span className="font-medium">{summary}</span>
                                      </div>
                                    </div>
                                  )}

                                  {/* Weather Impact callout */}
                                  {weatherImpact && (
                                    <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-sm flex gap-3 items-center">
                                      <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                                        <CloudSun size={18} />
                                      </div>
                                      <div>
                                        <span className="text-xs text-blue-500 font-bold block uppercase tracking-wider">Weather Impact</span>
                                        <p className="text-blue-800 font-medium leading-normal mt-0.5">{weatherImpact}</p>
                                      </div>
                                    </div>
                                  )}

                                  {/* Recommendations Checklist */}
                                  <div>
                                    <h4 className="section-label mb-3">Checklist ({visibleRecs.length} Action Items)</h4>
                                    {visibleRecs.length === 0 ? (
                                      <p className="text-sm text-gray-400 italic">All recommendations have been dismissed. Refresh to regenerate.</p>
                                    ) : (
                                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        {recs.map((rec, rIdx) => {
                                          if (dismissedList.includes(rIdx)) return null;

                                          const catStyles = getCategoryStyles(rec.category);
                                          const expandKey = `${farmRec.farmId}_${rIdx}`;
                                          const isExpanded = !!expandedCards[expandKey];

                                          return (
                                            <motion.div
                                              key={rIdx}
                                              layoutId={`card-${farmRec.farmId}-${rIdx}`}
                                              exit={{ opacity: 0, scale: 0.9, height: 0 }}
                                              className={`flex flex-col justify-between rounded-xl bg-white border border-border ${catStyles.border} overflow-hidden shadow-xs`}
                                            >
                                              <div 
                                                onClick={() => toggleExpand(farmRec.farmId, rIdx)}
                                                className="p-4 cursor-pointer flex items-start justify-between gap-3 select-none"
                                              >
                                                <div className="flex gap-3 items-start">
                                                  <span className="text-2xl pt-0.5 shrink-0">{rec.icon || '💡'}</span>
                                                  <div>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                      <h5 className="text-sm font-bold text-gray-800">{rec.title}</h5>
                                                      {getUrgencyBadge(rec.urgency)}
                                                    </div>
                                                    <span className="text-[10px] text-gray-400 uppercase font-semibold mt-1 block tracking-wider">
                                                      Category: {rec.category}
                                                    </span>
                                                  </div>
                                                </div>

                                                <div className="flex items-center gap-1.5 shrink-0">
                                                  <button
                                                    onClick={(e) => handleDismissCard(farmRec.farmId, rIdx, e)}
                                                    className="p-1 rounded-lg text-gray-400 hover:bg-slate-100 hover:text-red-500 transition-colors"
                                                    title="Dismiss Action"
                                                  >
                                                    <X size={14} />
                                                  </button>
                                                  {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                                                </div>
                                              </div>

                                              <AnimatePresence initial={false}>
                                                {isExpanded && (
                                                  <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="px-4 pb-4 pt-1 bg-slate-50/50 border-t border-slate-100 text-xs text-gray-600 leading-relaxed"
                                                  >
                                                    {rec.description}
                                                  </motion.div>
                                                )}
                                              </AnimatePresence>
                                            </motion.div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>

                                  {/* Next Crop Suggestion Card */}
                                  {nextCrop.crop && (
                                    <div className="bg-gradient-to-r from-primary-50 to-emerald-50/50 border border-emerald-100 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                                      <div className="flex gap-4 items-start">
                                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-primary-600 shadow-sm border border-emerald-100">
                                          <Leaf size={24} />
                                        </div>
                                        <div>
                                          <span className="text-[10px] font-bold uppercase tracking-wider text-primary-600 block">Suggested Next Crop</span>
                                          <h4 className="text-lg font-black text-gray-800 mt-0.5">{nextCrop.crop}</h4>
                                          <p className="text-sm text-gray-600 mt-1 max-w-2xl">{nextCrop.reason}</p>
                                          <span className="text-xs font-semibold text-gray-400 mt-2 block">
                                            📅 Sowing window: {nextCrop.best_sowing_window}
                                          </span>
                                        </div>
                                      </div>

                                      <button
                                        onClick={() => navigate('/farms')}
                                        className="btn-primary text-xs shrink-0 flex items-center gap-1.5 shadow-md active:scale-95 bg-primary-600 hover:bg-primary"
                                      >
                                        Plan This Crop <ArrowRight size={12} />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            )}

            {/* Tab 2: Chatbot */}
            {activeTab === 'chatbot' && (
              <motion.div
                key="chatbot-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col bg-white border border-border rounded-2xl shadow-sm h-[650px] overflow-hidden"
              >
                {/* Chatbot Header */}
                <div className="px-6 py-4 bg-slate-50 border-b border-border flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-primary to-primary-light text-white rounded-xl">
                      <BrainCircuit size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-gray-800">AgroBot</h3>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 px-1.5 py-0.5 bg-green-50 border border-green-200 rounded-full">
                          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                          Online
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">Ask me anything about farming</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Chat Context Selector */}
                    {farms.length > 0 && (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider hidden sm:inline">Active plot:</span>
                        <select
                          value={chatFarmId}
                          onChange={(e) => setChatFarmId(e.target.value)}
                          className="bg-white border border-border rounded-lg text-xs font-semibold px-2 py-1.5 text-gray-700 outline-none focus:border-primary transition-all"
                        >
                          <option value="general">🌾 General Context</option>
                          {farms.map((f) => (
                            <option key={f.id} value={f.id}>🌾 {f.plotName} ({f.currentCrop})</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <button
                      onClick={() => setShowClearConfirm(true)}
                      className="p-2 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 border border-transparent hover:border-red-100 transition-all"
                      title="Clear conversation"
                      disabled={chatMessages.length === 0}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Messages Scroller */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/40 custom-scrollbar">
                  {chatMessages.length === 0 ? (
                    // Welcome Message
                    <div className="flex flex-col items-center justify-center py-10 max-w-md mx-auto text-center gap-6">
                      <div className="w-16 h-16 rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center text-primary-light">
                        <BrainCircuit size={32} />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-gray-800">Namaste! I'm AgroBot</h4>
                        <p className="text-sm text-gray-500 mt-2">
                          Your virtual assistant. Ask me about crop rotation, fertilizers, pest control, weather adaptations, or anything else.
                        </p>
                      </div>

                      {/* Static quick tips */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full text-left">
                        <button
                          onClick={() => handleSendMessage("What crop should I plant next?")}
                          className="p-3 bg-white hover:bg-slate-50 border border-border hover:border-primary-100 rounded-xl text-xs font-semibold text-gray-600 transition-all hover:shadow-xs active:scale-98"
                        >
                          🌱 What crop should I plant next?
                        </button>
                        <button
                          onClick={() => handleSendMessage("How often should I water my wheat?")}
                          className="p-3 bg-white hover:bg-slate-50 border border-border hover:border-primary-100 rounded-xl text-xs font-semibold text-gray-600 transition-all hover:shadow-xs active:scale-98"
                        >
                          💧 How often should I water my wheat?
                        </button>
                        <button
                          onClick={() => handleSendMessage("How to control pests naturally?")}
                          className="p-3 bg-white hover:bg-slate-50 border border-border hover:border-primary-100 rounded-xl text-xs font-semibold text-gray-600 transition-all hover:shadow-xs active:scale-98"
                        >
                          🐛 How to control pests naturally?
                        </button>
                        <button
                          onClick={() => handleSendMessage("Is this weather good for my crops?")}
                          className="p-3 bg-white hover:bg-slate-50 border border-border hover:border-primary-100 rounded-xl text-xs font-semibold text-gray-600 transition-all hover:shadow-xs active:scale-98"
                        >
                          🌦️ Is this weather good for my crops?
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Active messages list */}
                      <div className="space-y-4">
                        {chatMessages.map((msg, index) => {
                          const isBot = msg.role === 'model';
                          return (
                            <motion.div
                              key={msg.id || index}
                              initial={{ opacity: 0, y: 10, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              transition={{ duration: 0.25 }}
                              className={`flex items-start gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}
                            >
                              {isBot && (
                                <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shrink-0 shadow-sm">
                                  🤖
                                </div>
                              )}

                              <div className="flex flex-col gap-1 max-w-[80%]">
                                <div className={`p-4 rounded-2xl text-sm border shadow-xs ${
                                  isBot 
                                    ? 'bg-white border-border text-gray-800 rounded-tl-xs' 
                                    : 'bg-primary border-primary text-white rounded-tr-xs'
                                }`}>
                                  {isBot ? renderMessageContent(msg.message) : <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>}
                                </div>
                                <span className={`text-[10px] text-gray-400 ${!isBot ? 'text-right' : ''}`}>
                                  {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                </span>
                              </div>
                            </motion.div>
                          );
                        })}

                        {/* Typing indicator */}
                        {isTyping && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-start gap-3 justify-start"
                          >
                            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shrink-0 shadow-sm">
                              🤖
                            </div>
                            <div className="p-4 rounded-2xl bg-white border border-border rounded-tl-xs flex items-center gap-1.5 py-3.5">
                              <span className="w-2.5 h-2.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <span className="w-2.5 h-2.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <span className="w-2.5 h-2.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </>
                  )}
                  <div ref={messageListEndRef} />
                </div>

                {/* Follow up suggestions */}
                {chatMessages.length > 0 && !isTyping && (
                  <div className="px-6 py-2 bg-slate-50 border-t border-border/60 flex flex-wrap gap-2 shrink-0 select-none">
                    {(chatMessages[chatMessages.length - 1]?.suggestions || []).map((sug, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(sug)}
                        className="px-3.5 py-1.5 bg-white hover:bg-slate-100 border border-border rounded-full text-xs text-primary font-semibold hover:shadow-xs active:scale-95 transition-all"
                      >
                        💡 {sug}
                      </button>
                    ))}
                  </div>
                )}

                {/* Chat Input form */}
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                  className="px-6 py-4 border-t border-border bg-white flex items-center gap-3 shrink-0"
                >
                  <button
                    type="button"
                    className="p-3 text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 border border-border rounded-xl transition-all"
                    title="Voice inputs (UI only)"
                  >
                    <Mic size={18} />
                  </button>

                  <input
                    type="text"
                    maxLength={500}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={isTyping ? "AgroBot is typing..." : "Ask AgroBot anything..."}
                    disabled={isTyping}
                    className="flex-1 px-4 py-3 bg-slate-50 border border-border rounded-xl text-sm focus:bg-white focus:border-primary focus:outline-none transition-all"
                  />

                  <button
                    type="submit"
                    disabled={!inputText.trim() || isTyping}
                    className={`p-3 text-white rounded-xl transition-all shadow-sm ${
                      !inputText.trim() || isTyping
                        ? 'bg-slate-300 cursor-not-allowed'
                        : 'bg-primary hover:bg-primary-700 hover:shadow-md active:scale-95'
                    }`}
                  >
                    <Send size={18} />
                  </button>
                </form>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      {/* Confirmation Modal to Clear Chat */}
      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClearConfirm(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />
            {/* Modal Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white max-w-sm w-full p-6 rounded-2xl shadow-xl border border-border z-10 text-center gap-4 flex flex-col"
            >
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
                <Trash2 size={22} />
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-800">Clear chat history?</h4>
                <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                  This action is permanent and will delete the entire transcript of your conversation with AgroBot from the database.
                </p>
              </div>
              <div className="flex gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-gray-600 bg-surface-hover hover:bg-slate-200 rounded-xl transition-all border border-border"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleClearChat}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-sm"
                >
                  Clear History
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </DashboardLayout>
  );
};

export default AIRecommendationsPage;
