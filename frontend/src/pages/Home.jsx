import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiUpload, FiFileText, FiCheckCircle, FiSearch, FiActivity, FiLayers, FiChevronDown, FiX, FiInfo
} from 'react-icons/fi';

const RiskAssessmentHome = ({ onAnalyze }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [selectedDrugs, setSelectedDrugs] = useState([]);
  const [drugName, setDrugName] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [parsedData, setParsedData] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const drugOptions = [
    "CODEINE", "WARFARIN", "CLOPIDOGREL", 
    "SIMVASTATIN", "AZATHIOPRINE", "FLUOROURACIL"
  ];

  const filteredDrugs = drugOptions.filter(d => 
    d.toLowerCase().includes(drugName.toLowerCase()) && !selectedDrugs.includes(d)
  );

  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSuccess]);

  const parseVCFFile = async (file) => {
    setIsParsing(true);
    try {
      const text = await file.text();
      const lines = text.split('\n');
      const variants = [];
      let headerLine = null;
      
      for (const line of lines) {
        if (line.startsWith('#')) {
          if (line.startsWith('##')) continue; 
          headerLine = line;
          continue; 
        }
        if (!headerLine) continue; 
        const columns = line.split('\t');
        if (columns.length < 10) continue; 
        
        const chr = columns[0];
        const pos = columns[1];
        const rsid = columns[2];
        const ref = columns[3];
        const alt = columns[4];
        const info = columns[7];
        
        const infoFields = info.split(';');
        let gene = null;
        for (const field of infoFields) {
          if (field.startsWith('GENE=')) gene = field.split('=')[1];
        }

        const targetGenes = ["CYP2D6", "CYP2C19", "CYP2C9", "SLCO1B1", "TPMT", "DPYD"];
        if (gene && targetGenes.includes(gene)) {
          variants.push({
            chr, pos, rsid, ref, alt, gene, 
            qual: columns[5], filter: columns[6], info, format: columns[8], sample: columns[9]
          });
        }
      }
      
      setParsedData({
        fileName: file.name,
        fileSize: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        variantCount: variants.length,
        variants: variants
      });
      setShowSuccess(true);
    } catch (error) {
      alert('Failed to parse VCF file.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      await parseVCFFile(selectedFile);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault(); 
    setIsDragging(false); 
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      await parseVCFFile(droppedFile);
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
    <div className="min-h-screen bg-[#f5f7f8] text-slate-900 pb-20 relative font-sans">
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-1/2 transform -translate-x-1/2 z-[100] bg-emerald-500 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 font-bold"
          >
            <FiCheckCircle className="text-xl" />
            VCF Uploaded Successfully!
          </motion.div>
        )}
      </AnimatePresence>

      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 px-6 lg:px-12 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 w-1/4">
          <div className="bg-[#007fff] p-1.5 rounded-lg flex items-center justify-center text-white">
            <FiLayers className="text-2xl" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">PharmaGuard</h1>
        </div>
        
        <nav className="flex-grow flex justify-center">
          <a className="text-sm font-semibold text-slate-700 hover:text-[#007fff] transition-colors" href="#">Dashboard</a>
        </nav>
        
        <div className="w-1/4"></div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 lg:py-16">
        <div className="mb-10 text-left">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Patient Genomic Analysis</h2>
          <p className="text-slate-500 mt-2 text-lg">Upload clinical sequencing data to assess adverse drug reaction risks.</p>
        </div>

        {/* Updated Grid: 6/12 for Inputs and 6/12 for Preview to decrease preview width */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-6 space-y-6">
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#007fff]/10 text-[#007fff] text-sm font-bold">1</div>
                <h3 className="text-lg font-bold text-slate-900">Genomic Data Upload</h3>
              </div>
              
              <div className="relative group">
                <div 
                  className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl py-12 px-6 transition-all bg-slate-50
                    ${isDragging ? 'border-[#007fff]/50' : 'border-slate-300 group-hover:border-[#007fff]/50'}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                >
                  <div className="w-14 h-14 rounded-full bg-[#007fff]/10 flex items-center justify-center mb-4 text-[#007fff]">
                    <FiUpload className="text-3xl" />
                  </div>
                  <p className="text-slate-900 font-semibold text-center truncate max-w-full px-2">
                    {file ? file.name : 'Drag & drop VCF file here'}
                  </p>
                  <p className="text-slate-500 text-sm mt-1 mb-6 text-center">Max 5MB. Supports .vcf</p>
                  <label className="bg-white border border-slate-200 text-slate-700 px-6 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer">
                    <FiSearch className="text-sm" />
                    {file ? 'Change File' : 'Select File'}
                    <input type="file" className="hidden" accept=".vcf" onChange={handleFileChange} />
                  </label>
                </div>
              </div>
            </section>

            <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center justify-center w-7 h-7 rounded-full bg-[#007fff]/10 text-[#007fff] text-sm font-bold">2</div>
                <h3 className="text-lg font-bold text-slate-900">Target Medications</h3>
              </div>
              
              <div className="space-y-4">
                <div className="w-full min-h-[56px] border border-slate-200 rounded-lg p-2 flex flex-wrap gap-2 items-center bg-slate-50 focus-within:border-[#007fff]/30 transition-colors">
                  {selectedDrugs.map((drug) => (
                    <span key={drug} className="flex items-center gap-1.5 bg-[#007fff]/10 text-[#007fff] px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider border border-[#007fff]/20">
                      {drug}
                      <button onClick={() => removeDrug(drug)} className="hover:text-red-500 transition-colors"><FiX /></button>
                    </span>
                  ))}
                  <input 
                    type="text"
                    value={drugName}
                    onFocus={() => setShowDropdown(true)}
                    onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                    onChange={(e) => setDrugName(e.target.value)}
                    className="flex-grow bg-transparent border-none focus:ring-0 text-sm py-1.5 outline-none shadow-none"
                    placeholder="Search drug..."
                  />
                </div>
                
                {showDropdown && filteredDrugs.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 bg-white p-2 border border-slate-100 rounded-lg shadow-sm">
                    {filteredDrugs.map((drug) => (
                      <button 
                        key={drug} 
                        onMouseDown={(e) => e.preventDefault()} 
                        onClick={() => addDrug(drug)} 
                        className="text-[10px] font-bold text-slate-500 hover:text-white hover:bg-[#007fff] uppercase border border-slate-200 px-2 py-1 rounded-md transition-all"
                      >
                        {drug}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </section>

            <button 
              disabled={!isActive}
              onClick={() => onAnalyze(selectedDrugs, file)}
              className={`w-full py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 group
                ${isActive ? 'bg-[#007fff] hover:bg-[#007fff]/90 text-white shadow-[#007fff]/20' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}
            >
              <FiActivity className={isActive ? 'animate-pulse' : ''} />
              Analyze Risk
            </button>
          </div>

          {/* Slimmer Preview Column (lg:col-span-6) */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            <section className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col transition-all duration-300">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiFileText className="text-slate-400" />
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Parsing Preview</h3>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isParsing ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">{isParsing ? 'Parsing' : 'Ready'}</span>
                </div>
              </div>

              {parsedData ? (
                <div className="p-4 flex flex-col">
                  <div className="border border-slate-200 rounded-lg overflow-x-auto bg-white max-h-[500px] overflow-y-auto shadow-inner">
                    <table className="w-full text-left text-xs min-w-[700px]">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 sticky top-0 z-10">
                        <tr>
                          <th className="px-3 py-2.5 font-bold uppercase">CHROM</th>
                          <th className="px-3 py-2.5 font-bold uppercase">POS</th>
                          <th className="px-3 py-2.5 font-bold uppercase">ID</th>
                          <th className="px-3 py-2.5 font-bold uppercase">REF</th>
                          <th className="px-3 py-2.5 font-bold uppercase">ALT</th>
                          <th className="px-3 py-2.5 font-bold uppercase">GENE</th>
                          <th className="px-3 py-2.5 font-bold uppercase">SAMPLE</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono text-slate-600">
                        {parsedData.variants.map((variant, index) => (
                          <tr key={index} className="hover:bg-slate-50 transition-colors">
                            <td className="px-3 py-2">{variant.chr}</td>
                            <td className="px-3 py-2">{variant.pos}</td>
                            <td className="px-3 py-2">{variant.rsid}</td>
                            <td className="px-3 py-2">{variant.ref}</td>
                            <td className="px-3 py-2 text-[#007fff] font-bold">{variant.alt}</td>
                            <td className="px-3 py-2 text-emerald-600 font-bold">{variant.gene}</td>
                            <td className="px-3 py-2 truncate max-w-[120px]">{variant.sample}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-4 flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                    <FiLayers />
                    <span>{parsedData.variantCount} pharmacogenomic variants found</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center text-center py-24">
                  <div>
                    <FiFileText className="text-4xl text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-500 text-sm font-medium">No file uploaded</p>
                    <p className="text-slate-400 text-xs mt-1">Preview will appear here</p>
                  </div>
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RiskAssessmentHome;