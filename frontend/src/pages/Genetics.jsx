import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiActivity, FiInfo, FiLayers, FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const GENE_INFO = {
  CYP2D6: {
    function: 'Cytochrome P450 2D6 enzyme',
    role: 'Metabolizes many drugs including opioids and antidepressants'
  },
  CYP2C19: {
    function: 'Cytochrome P450 2C19 enzyme',
    role: 'Activates/metabolizes drugs like clopidogrel and PPIs'
  },
  CYP2C9: {
    function: 'Cytochrome P450 2C9 enzyme',
    role: 'Metabolizes warfarin and other drugs'
  },
  SLCO1B1: {
    function: 'Solute carrier organic anion transporter family member 1B1',
    role: 'Hepatic uptake transporter affecting statin exposure'
  },
  TPMT: {
    function: 'Thiopurine methyltransferase enzyme',
    role: 'Responsible for thiopurine (e.g., azathioprine) metabolism'
  },
  DPYD: {
    function: 'Dihydropyrimidine dehydrogenase enzyme',
    role: 'Key enzyme for fluoropyrimidine (e.g., 5-FU) metabolism'
  }
};

function getLatestCachedReport() {
  let best = null;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith('pharmaguard_')) continue;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const data = JSON.parse(raw);
      const ts = data?.timestamp ? Date.parse(data.timestamp) : 0;
      if (!best || ts > best.ts) {
        best = { ts, data };
      }
    } catch {
      // ignore
    }
  }
  return best?.data || null;
}

function normalizeZygosity(genotype) {
  if (!genotype) return 'N/A';
  if (genotype === '1/1') return 'Homozygous';
  if (genotype === '0/1' || genotype === '1/0') return 'Heterozygous';
  if (genotype === '0/0') return 'Wild-type';
  return genotype;
}

function inferImpactFromStar(star) {
  if (!star) return 'N/A';
  const s = String(star).toLowerCase();
  if (s.includes('loss') || s.includes('lo')) return 'Loss-of-function';
  if (s.includes('decreased')) return 'Decreased function';
  if (s.includes('increased')) return 'Increased function';
  return 'Variant effect depends on allele definition';
}

const Genetics = () => {
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const latest = getLatestCachedReport();
    setReport(latest);
  }, []);

  const gene = report?.pharmacogenomic_profile?.primary_gene || 'N/A';
  const geneInfo = GENE_INFO[gene] || {
    function: 'N/A',
    role: 'N/A'
  };

  const variants = report?.pharmacogenomic_profile?.detected_variants || [];

  const rows = useMemo(() => {
    const mapped = variants.map((v, idx) => {
      const rsid = v?.rsid || v?.rsID || v?.id || `variant_${idx + 1}`;
      const star = v?.star || v?.star_allele || v?.allele || 'N/A';
      const genotype = v?.genotype || v?.zygosity || 'N/A';
      const zygosity = normalizeZygosity(v?.genotype || v?.zygosity);
      const impact = v?.functional_impact || v?.impact || inferImpactFromStar(v?.star || v?.star_allele);
      return { rsid, star, genotype, zygosity, impact };
    });

    const q = query.trim().toLowerCase();
    if (!q) return mapped;

    return mapped.filter(r =>
      [r.rsid, r.star, r.genotype, r.zygosity, r.impact].some(x => String(x).toLowerCase().includes(q))
    );
  }, [variants, query]);

  return (
    <div className="min-h-screen w-full bg-white text-gray-800 font-sans relative selection:bg-blue-500 selection:text-white">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,#3B82F6_0%,transparent_70%)] pointer-events-none opacity-5" />

      <header className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/analysis')}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-[11px] font-black uppercase tracking-widest text-gray-700"
            >
              <FiArrowLeft size={14} />
              Back
            </button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-gray-900 tracking-tight">Genetics</span>
                <span className="text-[10px] font-bold text-blue-500 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">/genetics</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-800 bg-gray-100 px-2 py-0.5 rounded">Patient ID: {report?.patient_id || 'N/A'}</span>
                {report?.drug ? (
                  <span className="text-[10px] text-gray-400 font-medium">Drug: {String(report.drug).toUpperCase()}</span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
              <FiLayers className="text-blue-600" />
            </div>
          </div>
        </div>
      </header>

      <div className="relative h-[calc(100vh-4rem)]">
        {/* ===== SIDEBAR ===== */}
        <aside className="fixed top-16 bottom-0 left-0 w-80 bg-white border-r border-blue-200 p-6 flex flex-col shadow-lg overflow-y-auto">
          <div className="mb-8">
            <h2 className="text-[10px] tracking-[0.4em] text-blue-600 uppercase font-black mb-6">PharmGuard</h2>
            <nav className="space-y-2">
              <button
                onClick={() => navigate('/analysis')}
                className="w-full text-left px-4 py-3 rounded-xl text-gray-500 text-[10px] font-bold uppercase tracking-widest hover:bg-blue-50 hover:text-blue-600 transition-all"
              >
                Overview
              </button>
              <button
                className="w-full text-left px-4 py-3 rounded-xl bg-blue-500 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 transition-all"
              >
                Genetic Details
              </button>
            </nav>
          </div>

          <div className="mt-auto space-y-2">
            <button
              onClick={() => navigate('/analysis')}
              className="w-full px-4 py-3 rounded-xl bg-gray-100 text-gray-700 text-[10px] font-bold uppercase tracking-widest hover:bg-gray-200 transition-all"
            >
              Back to Analysis
            </button>
          </div>
        </aside>

        {/* ===== MAIN CONTENT ===== */}
        <main className="ml-80 h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="max-w-screen-2xl mx-auto px-6 py-8">
            {!report ? (
              <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
                    <FiInfo className="text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-gray-900">No genetics data found</h2>
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                      Run an analysis first so PharmaGuard can save a report in localStorage.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-1 rounded-3xl border border-gray-200 bg-white p-7 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                
                <div>
                  <h3 className="text-lg font-black text-gray-900 mt-1">Gene Overview Panel</h3>
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gradient-to-b from-gray-50 to-white p-5 space-y-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Gene name</p>
                  <p className="text-xl font-black text-gray-900 mt-1">{gene}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Function</p>
                  <p className="text-sm text-gray-700 mt-1 leading-relaxed">{geneInfo.function}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Role in drug metabolism</p>
                  <p className="text-sm text-gray-700 mt-1 leading-relaxed">{geneInfo.role}</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="lg:col-span-2 rounded-3xl border border-gray-200 bg-white p-7 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-black text-gray-900 mt-1">Variant Details Panel</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Showing variants detected for the primary gene. Fields may be N/A depending on VCF annotations.
                  </p>
                </div>

                <div className="w-full max-w-xs">
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search rsID, star allele, impact..."
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-gray-200">
                <div className="grid grid-cols-12 bg-gray-50 px-4 py-3">
                  <div className="col-span-3 text-[10px] font-black uppercase tracking-widest text-gray-500">Variant rsID</div>
                  <div className="col-span-2 text-[10px] font-black uppercase tracking-widest text-gray-500">Star allele</div>
                  <div className="col-span-2 text-[10px] font-black uppercase tracking-widest text-gray-500">Zygosity</div>
                  <div className="col-span-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Functional impact</div>
                </div>

                {rows.length === 0 ? (
                  <div className="px-6 py-10 text-center">
                    <p className="text-sm text-gray-600">No variants to show.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {rows.map((r, idx) => (
                      <div key={idx} className="grid grid-cols-12 px-4 py-4 bg-white hover:bg-gray-50 transition-colors">
                        <div className="col-span-3">
                          <p className="text-sm font-mono font-bold text-gray-800">{r.rsid}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm font-black text-gray-800">{r.star}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-sm font-bold text-gray-700">{r.zygosity}</p>
                        </div>
                        <div className="col-span-5">
                          <p className="text-sm text-gray-700 leading-relaxed">{r.impact}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">Tip</p>
                <p className="text-sm text-blue-900/80 leading-relaxed">
                  For richer variant details (star allele, genotype, impact), ensure your VCF has PharmaGuard-style annotations such as <span className="font-mono">GENE</span> and <span className="font-mono">STAR</span> in the INFO field.
                </p>
              </div>
            </motion.div>
          </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Genetics;
