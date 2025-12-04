import React, { useCallback } from 'react';

interface PDFUploaderProps {
  onFileUpload: (file: File) => void;
  onError: (error: string) => void;
  isProcessing: boolean;
}

const PDFUploader: React.FC<PDFUploaderProps> = ({ onFileUpload, onError, isProcessing }) => {
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && file.type === 'application/pdf') {
        onFileUpload(file);
      } else if (file) {
        onError('Please upload a PDF file');
      }
    },
    [onFileUpload, onError]
  );

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      
      const file = event.dataTransfer.files?.[0];
      if (file && file.type === 'application/pdf') {
        onFileUpload(file);
      } else if (file) {
        onError('Please upload a PDF file');
      }
    },
    [onFileUpload, onError]
  );

  return (
    <div className="pdf-uploader">
      <div
        className="upload-area"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <svg
          className="upload-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <h3>Upload Political News PDF</h3>
        <p>Drag and drop your PDF here, or click to browse</p>
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          disabled={isProcessing}
          id="pdf-input"
        />
        <label htmlFor="pdf-input" className="upload-button">
          {isProcessing ? 'Processing...' : 'Choose File'}
        </label>
      </div>
    </div>
  );
};

export default PDFUploader;
