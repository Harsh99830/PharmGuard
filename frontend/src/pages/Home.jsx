import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUpload, FiFileText, FiCheckCircle, FiSearch, FiActivity, FiLayers, FiChevronDown
} from 'react-icons/fi';

const RiskAssessmentHome = ({ onAnalyze }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [selectedDrugs, setSelectedDrugs] = useState([]);
  const [drugName, setDrugName] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  
  const drugOptions = [
    "CODEINE", "WARFARIN", "CLOPIDOGREL", 
    "SIMVASTATIN", "AZATHIOPRINE", "FLUOROURACIL"
  ];

  const filteredDrugs = drugOptions.filter(d => 
    d.toLowerCase().includes(drugName.toLowerCase()) && !selectedDrugs.includes(d)
  );

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      
      if (selectedFile.size > maxSize) {
        alert('VCF file size must be less than 5MB');
        e.target.value = ''; // Clear the input
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const addDrug = (drug) => {
    if (!selectedDrugs.includes(drug)) {
      setSelectedDrugs([...selectedDrugs, drug]);
      setDrugName("");
      setShowDropdown(false);
    }
  };

  const removeDrug = (drugToRemove) => {
    setSelectedDrugs(selectedDrugs.filter(drug => drug !== drugToRemove));
  };

  const isActive = file && selectedDrugs.length > 0;

  return (
    <div className="h-screen w-screen bg-[#0a0a0a] flex flex-col items-center justify-center font-sans text-white selection:bg-white selection:text-black overflow-hidden relative">
      
      {/* Deep Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,#1a1a1a_0%,transparent_70%)] opacity-60" />

      <main className="z-10 w-full max-w-5xl px-6">
        
        {/* --- Header Section --- */}
        <header className="flex items-center justify-between mb-20 px-2">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-5"
          >
            <div className="w-14 h-14 bg-white flex items-center justify-center rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.1)]">
               <FiLayers className="text-black text-3xl" />
            </div>
            <h1 className="text-5xl tracking-tighter flex gap-2">
              <span className="font-extralight text-white/40">pharm</span>
              <span className="font-black italic">GUARD</span>
            </h1>
          </motion.div>

          <div className="h-[1px] flex-1 mx-12 bg-gradient-to-r from-white/20 via-white/5 to-transparent" />

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-end">
            <span className={`text-[10px] font-bold tracking-[0.5em] uppercase mb-1 transition-colors duration-500 ${isActive ? 'text-white' : 'text-white/20'}`}>
               {isActive ? 'READY' : 'STANDBY'}
            </span>
            <div className={`h-1 w-12 rounded-full transition-all duration-500 ${isActive ? 'bg-white w-20' : 'bg-white/10 w-8'}`} />
          </motion.div>
        </header>

        {/* --- Side-by-Side Parameter Cards --- */}
        <div className="grid grid-cols-2 gap-8 mb-10">
          
          {/* Drug Input Card with Dropdown */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/[0.04] border border-white/15 rounded-[2.5rem] p-10 flex flex-col justify-between h-72 transition-all hover:bg-white/[0.06] hover:border-white/25 group relative"
          >
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-white transition-colors" />
                <p className="text-[10px] tracking-[0.4em] font-black text-white/30 uppercase">Selection</p>
              </div>
              <h3 className="text-2xl font-bold mb-3 tracking-tight">Pharmaceutical Target</h3>
              <p className="text-white/40 text-sm leading-relaxed max-w-[280px]">Define the compound for risk analysis.</p>
            </div>
            
            <div className="relative">
              <FiSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-colors z-20" />
              <input 
                type="text"
                placeholder="Search or select drug..."
                value={drugName}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                onChange={(e) => setDrugName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 focus:border-white/40 outline-none rounded-2xl py-5 pl-14 pr-12 text-base font-medium tracking-wide transition-all uppercase placeholder:normal-case z-10"
              />
              <FiChevronDown className={`absolute right-5 top-1/2 -translate-y-1/2 text-white/20 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''}`} />

              {/* Dropdown Menu */}
              <AnimatePresence>
                {showDropdown && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute left-0 right-0 top-[110%] bg-[#0f0f0f] border border-white/10 rounded-2xl overflow-hidden z-[50] shadow-2xl backdrop-blur-xl"
                  >
                    {filteredDrugs.length > 0 ? (
                      filteredDrugs.map((drug) => (
                        <div 
                          key={drug}
                          onClick={() => addDrug(drug)}
                          className="px-6 py-4 hover:bg-white hover:text-black transition-colors cursor-pointer text-xs font-bold tracking-widest uppercase"
                        >
                          {drug}
                        </div>
                      ))
                    ) : (
                      <div className="px-6 py-4 text-white/20 text-[10px] uppercase tracking-widest text-center">No results</div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* VCF Upload Card */}
          <motion.label 
            htmlFor="file-upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { 
  e.preventDefault(); 
  setIsDragging(false); 
  const droppedFile = e.dataTransfer.files[0];
  const maxSize = 5 * 1024 * 1024; // 5MB in bytes
  
  if (droppedFile && droppedFile.size > maxSize) {
    alert('VCF file size must be less than 5MB');
    return;
  }
  
  if (droppedFile) setFile(droppedFile); 
}}
            className={`cursor-pointer border rounded-[2.5rem] p-10 flex flex-col justify-between h-72 transition-all duration-500 group
              ${isDragging ? 'bg-white/[0.15] border-white/50' : 'bg-white/[0.04] border-white/15 hover:bg-white/[0.06] hover:border-white/25'}`}
          >
            <input id="file-upload" type="file" className="hidden" accept=".vcf" onChange={handleFileChange} />
            
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full transition-colors ${file ? 'bg-white' : 'bg-white/20 group-hover:bg-white'}`} />
                    <p className="text-[10px] tracking-[0.4em] font-black text-white/30 uppercase">Sequence</p>
                </div>
                {file && <FiCheckCircle className="text-white text-xl" />}
              </div>
              <h3 className="text-2xl font-bold mb-3 tracking-tight">Variant Data (VCF)</h3>
              <p className="text-white/40 text-sm leading-relaxed">
                {file ? `Buffered: ${file.name.substring(0, 24)}...` : "Import sequence data to extract genotypes."}
              </p>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-white/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> VCF ONLY
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-white/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> MAX 5MB
                </div>
              </div>
            </div>

            <div className={`flex items-center gap-4 rounded-2xl p-5 border transition-all duration-300 ${file ? 'bg-white text-black border-white' : 'bg-white/5 border-white/5 group-hover:border-white/10'}`}>
               <FiUpload className={`text-xl ${file ? 'text-black' : 'text-white/20'}`} />
               <span className="text-xs font-black tracking-[0.2em] uppercase">
                 {file ? "Sequence Locked" : "Select VCF Sequence"}
               </span>
            </div>
          </motion.label>
        </div>

        {/* --- Selected Drugs Section --- */}
        {selectedDrugs.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10"
          >
            <div className="flex flex-wrap gap-3">
              <AnimatePresence>
                {selectedDrugs.map((drug) => (
                  <motion.span 
                    key={drug}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="group flex items-center gap-2 px-4 py-2 bg-white text-black rounded-xl text-sm font-bold border border-white/20 shadow-sm hover:border-white/40 transition-all cursor-pointer"
                    onClick={() => removeDrug(drug)}
                  >
                    {drug}
                    <span className="text-black/40 group-hover:text-black transition-colors">×</span>
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

        {/* --- Primary Command Button --- */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative pt-6"
        >
          <motion.button 
            disabled={!isActive}
            whileHover={isActive ? { scale: 1.01, y: -2 } : {}}
            whileTap={isActive ? { scale: 0.99 } : {}}
            onClick={() => onAnalyze(selectedDrugs, file)}
            className={`w-full py-12 rounded-[2rem] font-black text-2xl uppercase tracking-[0.8em] flex items-center justify-center gap-8 transition-all duration-700
              ${isActive
                ? 'bg-white text-black shadow-[0_30px_60px_-15px_rgba(255,255,255,0.2)] cursor-pointer' 
                : 'bg-white/5 text-white border border-white/10 cursor-not-allowed opacity-50'}`}
          >
            <motion.div animate={isActive ? { scale: [1, 1.2, 1] } : {}} transition={{ repeat: Infinity, duration: 2 }}>
                <FiActivity className="text-3xl" />
            </motion.div>
            See Ur Report
          </motion.button>
        </motion.div>
      </main>

      {/* Frame Decors */}
      <div className="absolute top-12 left-12 w-32 h-px bg-gradient-to-r from-white/20 to-transparent" />
      <div className="absolute top-12 left-12 h-32 w-px bg-gradient-to-b from-white/20 to-transparent" />
      <div className="absolute bottom-12 right-12 w-32 h-px bg-gradient-to-l from-white/20 to-transparent" />
      <div className="absolute bottom-12 right-12 h-32 w-px bg-gradient-to-t from-white/20 to-transparent" />
    </div>
  );
};

export default RiskAssessmentHome;