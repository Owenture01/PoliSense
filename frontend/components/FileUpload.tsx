import React, { useCallback, useState } from 'react';
import { FileType, Play, RefreshCw, X } from 'lucide-react';

interface FileUploadProps {
  selectedFile: File | null;
  onFileSelect: (file: File) => void;
  onAnalyze: () => void;
  onClear: () => void;
  isAnalyzing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  selectedFile, 
  onFileSelect, 
  onAnalyze, 
  onClear, 
  isAnalyzing 
}) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf") {
        onFileSelect(file);
      } else {
        alert("Please upload a valid PDF file.");
      }
    }
  }, [onFileSelect]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === "application/pdf") {
        onFileSelect(file);
      } else {
         alert("Please upload a valid PDF file.");
      }
    }
  };

  // State 1: Analyzing (Loading)
  if (isAnalyzing) {
    return (
      <div className="w-full max-w-2xl mx-auto mt-10 p-6">
        <div className="flex flex-col items-center justify-center w-full h-80 bg-white rounded-xl border-2 border-dashed border-blue-300 bg-blue-50">
           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
           <p className="text-lg font-medium text-gray-600">Analyzing Article...</p>
           <p className="text-sm text-gray-500 mt-2">This may take up to 30 seconds.</p>
        </div>
      </div>
    );
  }

  // State 2: File Selected (Review)
  if (selectedFile) {
    return (
      <div className="w-full max-w-2xl mx-auto mt-10 p-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-8 text-center">
            <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <FileType className="w-10 h-10 text-indigo-600" />
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2 truncate px-4">
              {selectedFile.name}
            </h3>
            <p className="text-gray-500 mb-8 font-medium">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • PDF Document
            </p>
            
            <div className="flex flex-col gap-3 max-w-md mx-auto">
              <button 
                onClick={onAnalyze}
                className="flex items-center justify-center gap-2 w-full py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold rounded-xl transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              >
                <Play className="w-5 h-5 fill-current" />
                Analyze Political Bias
              </button>
              
              <button 
                onClick={onClear}
                className="flex items-center justify-center gap-2 w-full py-3 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-600 font-semibold rounded-xl transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Re-upload / Change File
              </button>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-center text-sm text-gray-500">
              Ready for analysis using advanced AI algorithms.
          </div>
        </div>
      </div>
    );
  }

  // State 3: Dropzone (Default)
  return (
    <div className="w-full max-w-2xl mx-auto mt-10 p-6">
       <div 
        className={`relative flex flex-col items-center justify-center w-full h-80 bg-white rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer group ${
          dragActive ? "border-blue-500 bg-blue-50 scale-[1.02]" : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
        }`}
        onDragEnter={handleDrag} 
        onDragLeave={handleDrag} 
        onDragOver={handleDrag} 
        onDrop={handleDrop}
        onClick={() => document.getElementById('dropzone-file')?.click()}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center pointer-events-none">
            <div className="p-4 bg-blue-50 rounded-full mb-4 group-hover:bg-blue-100 transition-colors">
                <FileType className="w-10 h-10 text-blue-500" />
            </div>
            
            <p className="mb-2 text-xl font-bold text-gray-700">Drag and Drop News Article PDF Here</p>
            <p className="mb-4 text-sm text-gray-500">or click to browse files</p>
        </div>
        
        <input 
            id="dropzone-file" 
            type="file" 
            className="hidden" 
            accept="application/pdf"
            onChange={handleChange}
        />
      </div>
    </div>
  );
};

export default FileUpload;