import React, { useState } from 'react';
import { Newspaper } from 'lucide-react';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';
import { AppState, AnalysisResult } from './types';
import { uploadAndAnalyzeFile } from './services/apiService';
import { analyzePdfMetadataAndSummary } from './services/geminiService';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError(null);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setPdfBase64(null);
    setError(null);
  };

    const triggerAnalysis = async () => {
    if (!selectedFile) return;

    setAppState(AppState.ANALYZING);
    setError(null);
    
    // Read the file as base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64String = (reader.result as string).split(',')[1];
        setPdfBase64(base64String); // Store for ChatInterface

        // Step 1: Run Backend Analysis (Leaning & Bias)
        const backendResult = await uploadAndAnalyzeFile(selectedFile);

        // Process Backend Results
        const { leaning, bias } = backendResult;
        
        // Calculate Political Score (-100 to 100)
        // Assuming probabilities are [Left, Center, Right]
        const pLeft = leaning.probabilities[0] || 0;
        const pCenter = leaning.probabilities[1] || 0;
        const pRight = leaning.probabilities[2] || 0;
        
        const politicalScore = (pRight - pLeft) * 100;
        
        // Determine Label
        let politicalLabel = "Center";
        if (leaning.predicted_class_id === 0) politicalLabel = "Left";
        if (leaning.predicted_class_id === 2) politicalLabel = "Right";
        
        // Determine Direction
        let leaningDirection: 'Left' | 'Right' | 'Center' = 'Center';
        if (politicalScore < -10) leaningDirection = 'Left';
        if (politicalScore > 10) leaningDirection = 'Right';

        // Map Sentences
        const topSentences = bias.top_biased_sentences.map(s => ({
          text: s.sentence,
          impactScore: s.confidence_score * 10, // Scale 0-1 to 0-10
          reasoning: `Model confidence: ${(s.confidence_score * 100).toFixed(1)}%`
        }));

        // Step 2: Run Gemini Analysis (Metadata & Summary/Explanation)
        // Pass the backend results to Gemini so it can explain them
        const geminiResult = await analyzePdfMetadataAndSummary(base64String, {
            politicalLabel,
            politicalScore,
            topSentences: topSentences.map(s => s.text)
        });

        // Construct Final Result
        const finalResult: AnalysisResult = {
          metadata: geminiResult.metadata as any, // Type assertion as Gemini partial might be missing fields strictly
          summary: geminiResult.summary || "No summary available.",
          politicalScore,
          politicalLabel,
          leaningPercentage: Math.abs(politicalScore),
          leaningDirection,
          topSentences,
          confidenceScore: Math.max(pLeft, pCenter, pRight),
          confidenceReasoning: `The model is ${(Math.max(pLeft, pCenter, pRight) * 100).toFixed(1)}% confident in this classification.`
        };

        setResult(finalResult);
        setAppState(AppState.RESULTS);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to analyze the PDF. Please try again.");
        setAppState(AppState.ERROR);
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleReset = () => {
    setAppState(AppState.UPLOAD);
    setSelectedFile(null);
    setPdfBase64(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-2 rounded-lg shadow-lg">
              <Newspaper className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-gray-600">
            PoliSense AI
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-start bg-[#f8fafc]">
        {/* State: Upload or Analyzing (Logic handled inside FileUpload via props) */}
        {(appState === AppState.UPLOAD || appState === AppState.ANALYZING) && (
          <div className="w-full flex flex-col items-center">
            {appState === AppState.UPLOAD && !selectedFile && (
              <div className="mt-12 text-center max-w-2xl px-4 animate-fade-in-up">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Uncover Media Bias Instantly</h2>
                <p className="text-gray-600 text-lg">
                  Upload a news article PDF to detect political leaning, rhetorical framing, and key influential sentences using advanced AI.
                </p>
              </div>
            )}
            
            <FileUpload 
              selectedFile={selectedFile}
              onFileSelect={handleFileSelect}
              onAnalyze={triggerAnalysis}
              onClear={handleClearFile}
              isAnalyzing={appState === AppState.ANALYZING}
            />
          </div>
        )}

        {/* State: Results */}
        {appState === AppState.RESULTS && result && (
          <Dashboard 
            result={result} 
            onReset={handleReset} 
            pdfBase64={pdfBase64} 
          />
        )}

        {/* State: Error */}
        {appState === AppState.ERROR && (
          <div className="mt-20 p-8 bg-white rounded-xl shadow-lg border border-red-200 max-w-md text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Analysis Failed</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
                onClick={() => setAppState(AppState.UPLOAD)} // Go back to review/upload state
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
                Try Again
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} PoliSense AI for NLP Project. Analysis using our fine-tuned models, summarisation powered by Google Gemini 2.5.
        </div>
      </footer>
    </div>
  );
};

export default App;
