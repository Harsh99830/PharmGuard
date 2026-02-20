import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import RiskAssessmentHome from './pages/Home';
import AnalysisDashboard from './pages/Analysis';
import Genetics from './pages/Genetics';

function AppContent() {
  const navigate = useNavigate();
  
  // Shared state to pass data from Home to Analysis
  const [analysisData, setAnalysisData] = useState({
    drugName: "",
    file: null
  });

  // Function called when user clicks "See Ur Report"
  const handleStartAnalysis = (drug, file) => {
    const normalizedDrug = Array.isArray(drug) ? drug[0] : drug;
    setAnalysisData({ drugName: normalizedDrug || "", file: file });
    navigate('/analysis');
  };

  return (
    <div className="min-h-screen bg-black">
      <Routes>
        <Route 
          path="/" 
          element={
            <RiskAssessmentHome onAnalyze={handleStartAnalysis} />
          } 
        />
        <Route 
          path="/analysis" 
          element={
            <AnalysisDashboard 
              drugName={analysisData.drugName} 
              file={analysisData.file} 
              onBack={() => navigate('/')} 
            />
          } 
        />

        <Route path="/genetics" element={<Genetics />} />

        {/* Redirect any unknown routes to Home */}
        <Route path="*" element={<RiskAssessmentHome onAnalyze={handleStartAnalysis} />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;