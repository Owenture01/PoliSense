import { GoogleGenAI, Type, Chat } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const analyzePdfMetadataAndSummary = async (base64Pdf: string): Promise<Partial<AnalysisResult>> => {
  const modelId = "gemini-2.5-flash";

  const systemInstruction = `
    You are PoliSense, an expert political analyst AI.
    Your task is to analyze the provided PDF text and extract key metadata and a summary.
    
    1. **Metadata Extraction**:
       - Extract the **Article Title**.
       - Identify the **News Outlet** or Source.
       - Identify the **Published Date** (format YYYY-MM-DD, or "Unknown").
       - Count the **Word Count** (approximate).
       - Estimate the **Read Time**.

    2. **Summary**:
       - Provide a concise summary (max 100 words) of the article's content and rhetorical framing.
       - Do NOT provide political scores or bias labels; these will be provided by another system.
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
            text: "Extract metadata and summary for this article.",
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
            summary: { type: Type.STRING, description: "Rhetorical analysis summary" },
          },
          required: ["metadata", "summary"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as Partial<AnalysisResult>;
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