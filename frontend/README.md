# PoliSense

PoliSense is an AI-powered news analysis tool that detects political bias and ideological leaning in news articles. Using Google's Gemini AI, it analyzes PDF articles to reveal their political positioning, rhetorical patterns, and influential language.

## Features

- **Bias Detection**: Analyzes articles on a spectrum from -100 (far-left) to 100 (far-right) with categorical labels and confidence scores
- **Metadata Extraction**: Automatically extracts title, source, publication date, word count, and reading time
- **Sentence Analysis**: Identifies and ranks the top 5 most influential sentences that reveal bias
- **Visual Dashboard**: Interactive gauge charts and detailed breakdowns of political positioning
- **AI Chat Interface**: Ask follow-up questions about the analysis and explore specific claims or rhetoric

## Architecture

- **Frontend**: React 19 with TypeScript for type-safe component development
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Components**: Recharts for data visualization, Lucide React for icons
- **AI Engine**: Google Generative AI SDK with Gemini 2.5 Flash model
- **State Management**: React hooks for local state handling

## Setup

1. **Prerequisites**: Ensure Node.js is installed on your system

2. **Installation**:
   ```bash
   npm install
   ```

3. **API Configuration**: Create a `.env` file in the root directory:
   ```
   API_KEY=your_google_ai_api_key
   ```
   Get your API key from [Google AI Studio](https://aistudio.google.com/)

4. **Development**: Start the development server:
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

5. **Usage**: Upload a PDF news article, and the system will analyze it and display results in an interactive dashboard