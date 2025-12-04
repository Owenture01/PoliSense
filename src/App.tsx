import { useState } from 'react';
import PDFUploader from './components/PDFUploader';
import BiasScale from './components/BiasScale';
import TopSentences from './components/TopSentences';
import BiasSummary from './components/BiasSummary';
import { extractTextFromPDF, analyzeBias } from './utils/biasAnalyzer';
import type { AnalyzedDocument } from './types';
import './App.css';

function App() {
  const [currentDocument, setCurrentDocument] = useState<AnalyzedDocument | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Extract text from PDF
      const text = await extractTextFromPDF(file);
      
      if (!text || text.trim().length === 0) {
        throw new Error('Could not extract text from PDF. The file may be empty or contain only images.');
      }

      // Analyze bias
      const analysis = analyzeBias(text);

      // Create analyzed document
      const document: AnalyzedDocument = {
        id: Date.now().toString(),
        fileName: file.name,
        uploadDate: new Date(),
        analysis,
        fullText: text,
      };

      setCurrentDocument(document);
    } catch (err) {
      console.error('Error processing PDF:', err);
      setError(err instanceof Error ? err.message : 'Failed to process PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>
            <span className="logo-icon">📊</span>
            PoliSense
          </h1>
          <p className="tagline">Political Bias Analyzer for News Articles</p>
        </div>
      </header>

      <main className="app-main">
        <div className="container">
          <PDFUploader 
            onFileUpload={handleFileUpload} 
            onError={setError}
            isProcessing={isProcessing} 
          />

          {error && (
            <div className="error-message">
              <strong>Error:</strong> {error}
            </div>
          )}

          {currentDocument && (
            <div className="analysis-results">
              <div className="document-info">
                <h2>Analysis Results</h2>
                <p className="file-name">
                  <strong>Document:</strong> {currentDocument.fileName}
                </p>
                <p className="upload-date">
                  <strong>Analyzed:</strong> {currentDocument.uploadDate.toLocaleString()}
                </p>
              </div>

              <BiasScale
                score={currentDocument.analysis.overallBiasScore}
                direction={currentDocument.analysis.biasDirection}
              />

              <TopSentences sentences={currentDocument.analysis.topSentences} />

              <BiasSummary
                summary={currentDocument.analysis.summary}
                direction={currentDocument.analysis.biasDirection}
              />
            </div>
          )}

          {!currentDocument && !isProcessing && (
            <div className="welcome-message">
              <h2>Welcome to PoliSense</h2>
              <p>
                Upload a PDF of a political news article to analyze its bias. 
                Our system will identify the political leaning, highlight the most biased sentences, 
                and provide a summary of the bias detected.
              </p>
            </div>
          )}
        </div>
      </main>

      <footer className="app-footer">
        <p>PoliSense © 2024 | Educational Demonstration</p>
      </footer>
    </div>
  );
}

export default App;
