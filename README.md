# PoliSense

**Political Bias Analyzer for News Articles**

PoliSense is a TypeScript-based web application that analyzes PDF documents of political news articles to detect and visualize political bias.

## Features

- 📄 **PDF Upload**: Drag-and-drop or browse to upload PDF documents
- 📊 **Bias Scale**: Visual representation of political bias from left to right
- 🎯 **Top 5 Sentences**: Identifies and displays the most biased sentences
- 📝 **Bias Summary**: Provides a concise explanation of detected bias

## Technology Stack

- **TypeScript**: Type-safe JavaScript
- **React**: UI framework
- **Vite**: Fast build tool and dev server
- **PDF.js**: PDF parsing and text extraction

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Owenture01/PoliSense.git
cd PoliSense
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`)

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

```bash
npm run preview
```

## Usage

1. Click the "Choose File" button or drag and drop a PDF file containing a political news article
2. Wait for the analysis to complete
3. View the results:
   - **Bias Scale**: Shows the overall political leaning (-100 to +100)
   - **Top 5 Sentences**: Highlights the most biased statements
   - **Summary**: Explains why the text is considered biased

## How It Works

The application uses a keyword-based algorithm to detect political bias:

- **Left-leaning keywords**: progressive, liberal, democrat, climate change, equality, etc.
- **Right-leaning keywords**: conservative, republican, traditional, free market, tax cuts, etc.

Each sentence is scored based on the presence of these keywords, and the overall document bias is calculated from the aggregate scores.

**Note**: This is a demonstration implementation. A production system would use advanced AI/ML models for more accurate and nuanced bias detection.

## Project Structure

```
PoliSense/
├── src/
│   ├── components/          # React components
│   │   ├── PDFUploader.tsx  # File upload component
│   │   ├── BiasScale.tsx    # Bias visualization
│   │   ├── TopSentences.tsx # Top biased sentences display
│   │   └── BiasSummary.tsx  # Summary component
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/               # Utility functions
│   │   └── biasAnalyzer.ts  # PDF parsing and bias analysis
│   ├── App.tsx              # Main application component
│   ├── App.css              # Application styles
│   └── main.tsx             # Application entry point
├── index.html               # HTML template
├── package.json             # Project dependencies
├── tsconfig.json            # TypeScript configuration
└── vite.config.ts           # Vite configuration
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Disclaimer

This tool is for educational and demonstration purposes only. The bias detection algorithm is simplified and should not be used for serious political analysis or decision-making.