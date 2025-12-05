import { GoogleGenAI, Type, Chat } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzePdfBias = async (base64Pdf: string): Promise<AnalysisResult> => {
  const modelId = "gemini-2.5-flash";

  const systemInstruction = `
    You are PoliSense, an expert political analyst AI specializing in detecting media bias, rhetorical patterns, and ideological leaning in news articles.
    Your task is to analyze the provided PDF text for political bias and extract key metadata.
    
    1. **Metadata Extraction**:
       - Extract the **Article Title**.
       - Identify the **News Outlet** or Source (infer from text if not explicit).
       - specific the **Published Date** (format YYYY-MM-DD, or "Unknown" if not found).
       - Count the **Word Count** (approximate).
       - Estimate the **Read Time** (e.g., "5 min read" based on 200 wpm).

    2. **Bias Analysis**:
       - Determine the political position on a spectrum from -100 (Far Left) to 100 (Far Right).
       - 0 represents a perfectly neutral Center.
       - Provide a numerical score (-100 to 100).
       - Provide a categorical label (e.g., Far-Left, Center-Left, Center, Center-Right, Far-Right).
       - Calculate the leaning percentage (absolute value).
       - Provide a concise summary (max 100 words) of the rhetorical analysis explaining *why* it fits this classification.
       - Identify the top 5 most influential sentences that indicate this bias, rated 1-10 on impact.
    
    3. **Confidence Assessment**:
       - Provide a **Confidence Score** from 0.0 to 1.0 indicating how certain you are of this analysis.
       - Higher scores (e.g., 0.9) mean the text has clear, explicit political markers.
       - Lower scores (e.g., 0.5) mean the text is ambiguous, short, or lacks strong signals.
       - Provide a short reasoning for this confidence score.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "application/pdf",
              data: base64Pdf,
            },
          },
          {
            text: "Analyze this article for political bias and metadata.",
          },
        ],
      },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            metadata: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "Headline of the article" },
                outlet: { type: Type.STRING, description: "Publisher or source" },
                publishedDate: { type: Type.STRING, description: "YYYY-MM-DD or Unknown" },
                wordCount: { type: Type.NUMBER, description: "Total word count" },
                readTime: { type: Type.STRING, description: "Estimated read time string" },
              },
              required: ["title", "outlet", "publishedDate", "wordCount", "readTime"],
            },
            politicalScore: { type: Type.NUMBER, description: "Score from -100 (Left) to 100 (Right)" },
            politicalLabel: { type: Type.STRING, description: "e.g. Center-Right" },
            leaningPercentage: { type: Type.NUMBER, description: "Absolute magnitude of bias (0-100)" },
            leaningDirection: { type: Type.STRING, description: "Left, Right, or Center" },
            summary: { type: Type.STRING, description: "Rhetorical analysis summary" },
            topSentences: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  text: { type: Type.STRING },
                  impactScore: { type: Type.NUMBER, description: "1-10 impact score" },
                },
                required: ["text", "impactScore"],
              },
            },
            confidenceScore: { type: Type.NUMBER, description: "0.0 to 1.0 score representing certainty" },
            confidenceReasoning: { type: Type.STRING, description: "Why this confidence score was given" }
          },
          required: ["metadata", "politicalScore", "politicalLabel", "leaningPercentage", "leaningDirection", "summary", "topSentences", "confidenceScore", "confidenceReasoning"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    } else {
      throw new Error("No response text received from Gemini.");
    }
  } catch (error) {
    console.error("Error analyzing PDF:", error);
    throw error;
  }
};

export const createChatSession = (base64Pdf: string, history: { role: string, text: string }[] = []): Chat => {
    // Determine the user prompt for the initial context setting
    // We construct the base history that primes the model with the PDF
    const baseHistory = [
        {
            role: "user",
            parts: [
                { inlineData: { mimeType: "application/pdf", data: base64Pdf } },
                { text: "Here is the article I want to discuss. Please answer my questions based on this text." }
            ]
        },
        {
            role: "model",
            parts: [{ text: "I have read the article and I am ready to answer your questions about its content, bias, and context." }]
        }
    ];

    // Map the restored history text to the API's content structure
    // We cast role to 'user' | 'model' as required by the SDK, assuming the input history is valid
    const restoredHistory = history.map(msg => ({
        role: msg.role as "user" | "model",
        parts: [{ text: msg.text }]
    }));

    return ai.chats.create({
        model: "gemini-2.5-flash",
        history: [...baseHistory, ...restoredHistory],
        config: {
          systemInstruction: "You are a helpful political analysis assistant. Answer questions based specifically on the provided news article PDF. Be objective and cite parts of the text when possible."
        }
    });
};