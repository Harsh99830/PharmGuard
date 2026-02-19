import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiArrowLeft, FiChevronDown, FiShield, FiSearch, FiFileText, FiX, FiAlertTriangle, FiActivity, FiUser, FiZap, FiDownload, FiCopy, FiCheck, FiSend
} from 'react-icons/fi';
import { apiService } from '../services/api';

/* ── 4-pointed star icon with blue gradient (matches uploaded reference) ── */
const GeminiIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="geminiGrad" x1="50" y1="0" x2="50" y2="100" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
        <stop offset="40%" stopColor="#7dd3fc" />
        <stop offset="100%" stopColor="#0ea5e9" />
      </linearGradient>
    </defs>
    <path
      d="M50 0 C50 0 44 38 12 50 C44 62 50 100 50 100 C50 100 56 62 88 50 C56 38 50 0 50 0 Z"
      fill="url(#geminiGrad)"
    />
  </svg>
);

const Analytics = ({ drugName, file, onBack }) => {
  const [expandedSection, setExpandedSection]   = useState(null);
  const [showSummary, setShowSummary]           = useState(false);
  const [data, setData]                         = useState(null);
  const [loading, setLoading]                   = useState(true);
  const [error, setError]                       = useState(null);
  const [copied, setCopied]                     = useState(false);

  /* AI Chat state */
  const [showAIChat, setShowAIChat]   = useState(false);
  const [chatInput, setChatInput]     = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await apiService.analyzeDrug(file, drugName);
        if (result.error) {
          setError(result.error_message || 'Unsupported VCF format or no matching variants found.');
          return;
        }
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (file && drugName) fetchData();
  }, [file, drugName]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  /* Open chat with a welcome message pre-loaded */
  const openAIChat = () => {
    if (chatMessages.length === 0) {
      setChatMessages([{
        role: 'assistant',
        text: `Hi! I'm your PharmaGuard AI. I can answer any questions about your ${data?.drug?.toUpperCase()} result, what it means for you, or what to ask your doctor. What would you like to know?`
      }]);
    }
    setShowAIChat(true);
  };

  const sendMessage = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const userMsg = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setChatLoading(true);

    try {
      const context = `
  Patient pharmacogenomic data:
  - Drug: ${data.drug}
  - Gene: ${data.pharmacogenomic_profile.primary_gene}
  - Phenotype: ${data.pharmacogenomic_profile.phenotype}
  - Risk: ${data.risk_assessment.risk_label}
  - Recommendation: ${data.clinical_recommendation.recommendation}
  - Summary: ${data.llm_generated_explanation.summary}

  You are a friendly, plain-English health assistant. Answer in 2-3 short sentences max. No jargon. Be warm and clear.
        `;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: context,
          messages: [
            ...chatMessages.filter(m => m.role !== 'assistant' || chatMessages.indexOf(m) > 0).map(m => ({
              role: m.role,
              content: m.text
            })),
            { role: "user", content: userMsg }
          ]
        })
      });

      const result = await response.json();
      const reply = result.content?.[0]?.text || "I'm sorry, I couldn't process that. Please try again.";
      setChatMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch {
      setChatMessages(prev => [...prev, { role: 'assistant', text: "Something went wrong. Please try again." }]);
    } finally {
      setChatLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen w-full bg-[#050505] text-white font-sans flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
        <p>Analyzing genetic data...</p>
      </div>
    </div>
  );

  if (error) {
    const isNoVariant = error.includes('No pharmacogenomic variant found');
    const detectedDrug = error.match(/for (\w+) \(/)?.[1]?.toUpperCase() || drugName?.toUpperCase();
    const supportedGenes  = ['CYP2C19', 'CYP2D6', 'CYP2C9', 'SLCO1B1', 'TPMT', 'DPYD'];
    const supportedDrugs  = ['Clopidogrel', 'Codeine', 'Warfarin', 'Simvastatin', 'Azathioprine', 'Fluorouracil'];

    return (
      <div className="min-h-screen w-full font-sans flex items-center justify-center p-6 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 50%, #fdf2f8 100%)' }}>

        {/* Decorative blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #bfdbfe, transparent)', transform: 'translate(-30%, -30%)' }} />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #fbcfe8, transparent)', transform: 'translate(30%, 30%)' }} />

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-xl relative z-10"
        >
          {/* ── Top branding strip ── */}
          <div className="flex items-center gap-2 mb-4 justify-center">
            <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center">
              <FiShield className="text-white text-sm" />
            </div>
            <span className="text-sm font-black text-gray-700 tracking-tight">PharmaGuard</span>
            <span className="text-[9px] font-bold text-blue-500 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">Clinical v4.2</span>
          </div>

          {/* ── Main card ── */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">

            {/* Header */}
            <div className="relative px-8 pt-8 pb-6 text-center" style={{ background: 'linear-gradient(160deg, #fff5f5 0%, #fef9f0 100%)' }}>
              {/* Pulsing icon */}
              <div className="relative inline-flex items-center justify-center mb-4">
                <span className="absolute w-16 h-16 rounded-full bg-red-100 animate-ping opacity-40" />
                <div className="relative w-14 h-14 rounded-2xl bg-red-50 border-2 border-red-200 flex items-center justify-center">
                  <FiAlertTriangle className="text-red-500 text-2xl" />
                </div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-400 mb-1">
                {isNoVariant ? 'Incompatible File' : 'Analysis Failed'}
              </p>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                {isNoVariant
                  ? <><span className="text-blue-500">{detectedDrug}</span> · No Variants Found</>
                  : 'Something went wrong'}
              </h1>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />

            {/* Body */}
            <div className="px-8 py-6 space-y-5">
              {isNoVariant ? (
                <>
                  {/* Description */}
                  <p className="text-sm text-gray-500 leading-relaxed text-center">
                    Your VCF file doesn't have the pharmacogenomic annotations needed.
                    PharmaGuard requires{' '}
                    <code className="text-[11px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-mono">GENE</code>
                    {' '}and{' '}
                    <code className="text-[11px] bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded font-mono">STAR</code>
                    {' '}fields in the INFO column.
                  </p>

                  {/* Two columns: genes + drugs */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                      <p className="text-[9px] font-black uppercase tracking-widest text-blue-400 mb-3">Supported Genes</p>
                      <div className="flex flex-wrap gap-1.5">
                        {supportedGenes.map(g => (
                          <span key={g} className="text-[10px] font-bold text-blue-700 bg-white border border-blue-200 px-2.5 py-1 rounded-full shadow-sm">{g}</span>
                        ))}
                      </div>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4">
                      <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-3">Supported Drugs</p>
                      <div className="flex flex-wrap gap-1.5">
                        {supportedDrugs.map(d => (
                          <span key={d} className="text-[10px] font-bold text-gray-600 bg-white border border-gray-200 px-2.5 py-1 rounded-full shadow-sm">{d}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Tip */}
                  <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-3">
                    <span className="text-base mt-0.5">💡</span>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      Use the <span className="font-bold">sample_patient.vcf</span> bundled with PharmaGuard — it has all required annotations and works out of the box.
                    </p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500 leading-relaxed text-center">{error}</p>
              )}
            </div>

            {/* Footer button */}
            <div className="px-8 pb-8">
              <button
                onClick={onBack}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white transition-all hover:opacity-90 hover:scale-[1.01] shadow-lg"
                style={{ background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' }}
              >
                <FiArrowLeft size={14} />
                Try a different file
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!data) return (
    <div className="min-h-screen w-full bg-[#050505] text-white font-sans flex items-center justify-center">
      <div className="text-center">
        <p>No data available</p>
        <button onClick={onBack} className="px-4 py-2 bg-white text-black rounded-lg mt-4">Go Back</button>
      </div>
    </div>
  );

  const kpis = [
    { label: 'Risk',         val: data.risk_assessment.risk_label,               icon: <FiAlertTriangle className="text-red-500" />,   sub: 'Risk Level',            alert: data.risk_assessment.risk_label === "Ineffective" || data.risk_assessment.risk_label === "Toxic" },
    { label: 'Phenotype',    val: data.pharmacogenomic_profile.phenotype,        icon: <FiZap className="text-blue-400" />,            sub: 'Metabolic Profile' },
    { label: 'Confidence',   val: `${data.risk_assessment.confidence_score * 100}%`, icon: <FiActivity className="text-emerald-500" />, sub: 'Model Precision' },
    { label: 'Actionability',val: data.clinical_recommendation.recommendation,  icon: <FiShield className="text-emerald-500" />,      sub: 'Clinical Recommendation' },
  ];

  const downloadPDF = () => {
    const pdfContent = `
  PHARMGUARD CLINICAL REPORT
  ============================
  Patient ID: ${data.patient_id}
  Drug: ${data.drug}
  Analysis Date: ${data.timestamp}
  Risk Level: ${data.risk_assessment.risk_label}
  Recommendation: ${data.clinical_recommendation.recommendation}
  Evidence: ${data.clinical_recommendation.evidence}
  Summary: ${data.llm_generated_explanation.summary}
      `;
    const blob = new Blob([pdfContent], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = `PharmGuard_Report_${data.patient_id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href     = url;
    link.download = `PharmGuard_${data.patient_id}_${data.drug}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedTimestamp = data.timestamp
    ? new Date(data.timestamp).toLocaleString('en-US', {
        month: 'short', day: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', timeZone: 'UTC', hour12: false
      }) + ' UTC'
    : '';

  return (
    <div className="min-h-screen w-full bg-white text-gray-800 font-sans relative selection:bg-blue-500 selection:text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,#3B82F6_0%,transparent_70%)] pointer-events-none opacity-5" />

      {/* ===== NAVBAR ===== */}
      <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 border border-blue-200">
              <FiShield className="text-blue-500 text-lg" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-gray-900 tracking-tight">PharmaGuard</span>
                <span className="text-[10px] font-bold text-blue-500 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">Clinical v4.2</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-800 bg-gray-100 px-2 py-0.5 rounded">Patient ID: {data.patient_id}</span>
                {formattedTimestamp && <span className="text-[10px] text-gray-400 font-medium">{formattedTimestamp}</span>}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right mr-2">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">Current Drug Therapy</p>
              <p className="text-sm font-black text-blue-500 uppercase tracking-wide">{data.drug}</p>
            </div>
            <button onClick={handleCopy} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-[11px] font-bold hover:bg-gray-50 transition-all">
              {copied ? <FiCheck className="text-green-500" /> : <FiCopy />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
            <button onClick={handleDownloadJSON} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 text-white text-[11px] font-bold hover:bg-blue-600 transition-all shadow-sm">
              <FiDownload /><span>Download JSON</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* ===== SIDEBAR ===== */}
        <aside className="w-80 bg-white border-r border-blue-200 p-6 flex flex-col shadow-lg">
          <div className="mb-8">
            <h2 className="text-[10px] tracking-[0.4em] text-blue-600 uppercase font-black mb-6">PharmGuard</h2>
            <nav className="space-y-2">
              <button className="w-full text-left px-4 py-3 rounded-xl bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 transition-all">Overview</button>
              <button className="w-full text-left px-4 py-3 rounded-xl text-gray-500 text-[10px] font-bold uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 transition-all">Genetic Details</button>
              <button className="w-full text-left px-4 py-3 rounded-xl text-gray-500 text-[10px] font-bold uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 transition-all">Recommendations</button>
              <button onClick={() => setShowSummary(true)} className="w-full text-left px-4 py-3 rounded-xl text-gray-500 text-[10px] font-bold uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 transition-all">Full Report</button>
            </nav>
          </div>
          <div className="mt-auto space-y-2">
            <button onClick={downloadPDF} className="w-full px-4 py-3 rounded-xl bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 transition-all">Export PDF</button>
            <button onClick={onBack} className="w-full px-4 py-3 rounded-xl bg-gray-100 text-gray-700 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-all">Back to Upload</button>
          </div>
        </aside>

        {/* ===== MAIN CONTENT ===== */}
        <main className="flex-1 p-4 md:p-8 relative z-10 overflow-y-auto bg-white">
          <div className="max-w-6xl mx-auto">
            <nav className="mb-8" />

            {/* ===== CLINICAL BANNER ===== */}
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 mb-8"
            >
              <div className="flex items-start gap-5 bg-white border border-gray-200 rounded-2xl px-7 py-5 shadow-sm">
                <div className="shrink-0 mt-0.5 w-14 h-14 rounded-full border-4 border-red-200 bg-red-50 flex items-center justify-center">
                  <FiAlertTriangle className="text-red-500 text-xl" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl font-black uppercase tracking-tight text-gray-900 mb-2">{data.drug}</h2>
                  <p className="text-[11px] font-bold text-red-500 uppercase tracking-widest mb-6">
                    Status: {data.risk_assessment.risk_label}
                  </p>
                  <div className="relative rounded-xl border border-gray-200 bg-gray-50 px-4 pt-5 pb-4">
                    <span className="absolute -top-2.5 left-3 bg-white px-2 text-[9px] font-black uppercase tracking-widest text-blue-500 border border-blue-100 rounded-full">
                      AI Summary
                    </span>
                    <button
                      onClick={openAIChat}
                      title="Ask AI about this result"
                      className="group absolute -top-4 right-2 w-8 h-8 rounded-full flex items-center justify-center bg-white hover:scale-110 transition-transform duration-300"
                      style={{ padding: '2px' }}
                    >
                      <span
                        className="pointer-events-none absolute inset-0 rounded-full"
                        style={{
                          background: 'conic-gradient(from 0deg, #0ea5e9, #fbcfe8, #0ea5e9, #fbcfe8, #0ea5e9)',
                          animation: 'spinBorder 2s linear infinite',
                          padding: '2px',
                          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                          WebkitMaskComposite: 'xor',
                          maskComposite: 'exclude',
                        }}
                      />
                      <span
                        className="pointer-events-none absolute inset-0 rounded-full"
                        style={{ boxShadow: '0 0 8px rgba(14,165,233,0.5)', animation: 'glowPulse 2s ease-in-out infinite' }}
                      />
                      <GeminiIcon size={18} />
                    </button>
                    <style>{`
                        @keyframes spinBorder { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                        @keyframes glowPulse { 0%,100% { opacity: 0.4; } 50% { opacity: 1; } }
                      `}</style>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {data.llm_generated_explanation?.summary || 'Pharmacogenomic analysis complete. Review findings below.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between bg-blue-500 rounded-2xl px-7 py-6 shadow-md">
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[0.25em] text-blue-200 mb-2">Recommendation Actionability</p>
                  <p className="text-lg font-black text-white leading-snug">{data.clinical_recommendation.recommendation}</p>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-200">Evidence Level</span>
                    <span className="text-[10px] font-black uppercase tracking-wide bg-white text-blue-600 px-3 py-1 rounded-full">
                      {data.clinical_recommendation.evidence || 'High (Level 1A)'}
                    </span>
                  </div>
                  <button onClick={() => setShowSummary(true)} className="w-full mt-1 bg-white text-blue-600 text-[11px] font-black uppercase tracking-widest py-2.5 rounded-xl hover:bg-blue-50 transition-all">
                    View Clinical Guidelines
                  </button>
                </div>
              </div>
            </motion.div>

            {/* ===== KPI GRID ===== */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {kpis.map((kpi, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-6 rounded-3xl border shadow-sm ${kpi.alert ? 'bg-red-50 border-red-200 shadow-[0_0_20px_rgba(239,68,68,0.1)]' : 'bg-white border-blue-200'}`}
                >
                  <div className="flex items-center gap-2 mb-3 text-gray-500">
                    <span className="text-sm">{kpi.icon}</span>
                    <span className="text-[9px] font-black uppercase tracking-widest text-blue-600">{kpi.label}</span>
                  </div>
                  <p className={`text-lg font-mono font-bold leading-none mb-1 ${kpi.alert ? 'text-red-600' : 'text-gray-800'}`}>{kpi.val}</p>
                  <p className="text-[8px] opacity-60 font-bold uppercase tracking-tighter text-gray-500">{kpi.sub}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* ===== SUMMARY MODAL ===== */}
      <AnimatePresence>
        {showSummary && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/95 backdrop-blur-2xl">
            <motion.div
              initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white text-black p-12 md:p-16 rounded-[4rem] shadow-2xl"
            >
              <button onClick={() => setShowSummary(false)} className="absolute top-10 right-10 text-black/20 hover:text-black"><FiX size={32}/></button>
              <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 bg-black text-white rounded-2xl flex items-center justify-center"><FiFileText size={24} /></div>
                <h3 className="text-4xl font-black uppercase tracking-tighter italic">Clinical Insight</h3>
              </div>
              <p className="text-xl font-medium leading-relaxed mb-10 opacity-80">{data.llm_generated_explanation.summary}</p>
              <div className="bg-red-600 text-white p-8 rounded-3xl">
                <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2">Protocol Suggestion</p>
                <p className="text-2xl font-black uppercase tracking-tight">{data.clinical_recommendation.recommendation}</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ===== AI CHAT MODAL ===== */}
      <AnimatePresence>
        {showAIChat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-4 sm:p-6"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) setShowAIChat(false); }}
          >
            <motion.div
              initial={{ y: 60, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 60, opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col"
              style={{ maxHeight: '80vh' }}
            >
              <div className="px-6 py-4 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #3b82f6 60%, #06b6d4 100%)' }}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                    <GeminiIcon size={18} />
                  </div>
                  <div>
                    <p className="text-white font-black text-sm tracking-tight">PharmaGuard AI</p>
                    <p className="text-white/60 text-[10px] font-medium">Ask anything about your result</p>
                  </div>
                </div>
                <button onClick={() => setShowAIChat(false)} className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-all">
                  <FiX size={16} />
                </button>
              </div>

              <div className="px-6 py-2.5 bg-gray-50 border-b border-gray-100 flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Analysing</span>
                <span className="text-[10px] font-black uppercase tracking-wide text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">{data.drug}</span>
                <span className="text-[9px] text-gray-400">·</span>
                <span className="text-[9px] font-medium text-gray-400">{data.risk_assessment.risk_label}</span>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-0">
                {chatMessages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="w-7 h-7 rounded-xl flex items-center justify-center mr-2 mt-0.5 shrink-0" style={{ background: 'linear-gradient(135deg, #4285F4 0%, #9B72CB 50%, #D96570 100%)' }}>
                        <GeminiIcon size={12} />
                      </div>
                    )}
                    <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-tr-sm' : 'bg-gray-100 text-gray-800 rounded-tl-sm'}`}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="w-7 h-7 rounded-xl flex items-center justify-center mr-2 shrink-0" style={{ background: 'linear-gradient(135deg, #4285F4 0%, #9B72CB 50%, #D96570 100%)' }}>
                      <GeminiIcon size={12} />
                    </div>
                    <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                      {[0, 0.2, 0.4].map((delay, i) => (
                        <motion.span key={i} className="w-1.5 h-1.5 rounded-full bg-gray-400 block" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="px-4 py-3 border-t border-gray-100 flex items-center gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Ask about your result..."
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:bg-white transition-all placeholder-gray-400"
                />
                <button
                  onClick={sendMessage}
                  disabled={!chatInput.trim() || chatLoading}
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #3b82f6)' }}
                >
                  <FiSend size={15} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Analytics;