# PoliSense AI

PoliSense AI is a full-stack application designed to analyze news articles for political leaning, bias, and rhetorical framing. It leverages advanced Natural Language Processing (NLP) models and Google's Gemini AI to provide users with a comprehensive understanding of the media they consume.

<img width="2706" height="3053" alt="image" src="https://github.com/user-attachments/assets/fc9c47ed-ecd5-4b2e-a09f-eb8a264f5f28" />



## Features

*   **Political Leaning Detection**: Classifies articles as Left, Center, or Right-leaning using a fine-tuned BERT model.
*   **Bias Detection**: Identifies specific sentences that exhibit bias and provides a confidence score for each detection.
*   **AI-Powered Summaries**: Uses Google Gemini to generate layman-friendly summaries and explanations of *why* an article was classified a certain way, citing specific biased sentences as evidence.
*   **Metadata Extraction**: Automatically extracts key details like title, outlet, published date, word count, and estimated read time.
*   **Multi-Format Support**: Accepts `.txt`, `.pdf`, and `.docx` files.
*   **Interactive Dashboard**: Visualizes the political stance with a gauge chart and highlights top biased sentences.

## Tech Stack

### Frontend
*   **React**: UI library for building the interactive dashboard.
*   **Vite**: Fast build tool and development server.
*   **Tailwind CSS**: Utility-first CSS framework for styling.
*   **Recharts**: For visualizing data (Gauge Chart).
*   **Google Gen AI SDK**: For communicating with the Gemini API.

### Backend
*   **FastAPI**: High-performance Python web framework for the API.
*   **PyTorch & Transformers**: For running the local NLP models (Political Bias BERT, etc.).
*   **PyPDF & Python-Docx**: For parsing document uploads.
*   **Uvicorn**: ASGI server for running the application.

### Infrastructure
*   **Docker & Docker Compose**: Containerization for easy deployment and orchestration of frontend and backend services.

## Prerequisites

*   **Docker Desktop**: Ensure Docker is installed and running.
*   **Google Gemini API Key**: You will need an API key from Google AI Studio.
*   **Local Models**: The application expects fine-tuned models to be present in the `backend/models/leaning` and `backend/models/bias` directories.

## Setup & Installation

1.  **Clone the Repository**
    ```bash
    git clone <repository-url>
    cd PoliSense
    ```

2.  **Configure Environment Variables**
    Create a `.env` file in the root directory with the following content:
    ```env
    MODEL_PATH=/app/models
    BACKEND_PORT=8000
    FRONTEND_PORT=3000
    GEMINI_API_KEY=your_actual_gemini_api_key_here
    ```

3.  **Prepare Models**
    Ensure your fine-tuned models are placed in the correct directory structure:
    ```
    backend/
    └── models/
        ├── leaning/
        │   ├── config.json
        │   ├── model.safetensors
        │   └── tokenizer/
        └── bias/
            ├── config.json
            ├── model.safetensors
            └── tokenizer/
    ```

4.  **Run with Docker Compose**
    Build and start the services:
    ```bash
    docker compose up --build
    ```

5.  **Access the Application**
    *   **Frontend**: Open [http://localhost:3000](http://localhost:3000) in your browser.
    *   **Backend API Docs**: Open [http://localhost:8000/docs](http://localhost:8000/docs) to explore the API endpoints.

## Usage

1.  **Upload a File**: Click the upload area to select a PDF, DOCX, or TXT file containing a news article.
2.  **Analyze**: The system will process the file. The backend will evaluate leaning and bias, while Gemini will generate a summary and explanation.
3.  **View Results**:
    *   Check the **Political Tier** gauge to see the overall stance.
    *   Read the **AI Summary** to understand the context and reasoning.
    *   Review **Top Biased Sentences** to see specific examples of biased language detected in the text.

## Project Structure

```
PoliSense/
├── backend/                 # FastAPI Backend
│   ├── models/              # Local NLP models (leaning/bias)
│   ├── main.py              # API entry point
│   ├── file_service.py      # Core logic for file processing & inference
│   ├── dtos.py              # Data Transfer Objects
│   └── Dockerfile           # Backend container config
├── frontend/                # React Frontend
│   ├── src/
│   │   ├── components/      # UI Components (Dashboard, FileUpload, etc.)
│   │   ├── services/        # API and Gemini service integrations
│   │   └── App.tsx          # Main application component
│   └── Dockerfile           # Frontend container config
├── docker-compose.yaml      # Orchestration config
└── .env                     # Environment variables
```

## License

[MIT](LICENSE)
