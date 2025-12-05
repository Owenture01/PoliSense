import { BackendAnalysisResponse } from "../types";

export const uploadAndAnalyzeFile = async (file: File): Promise<BackendAnalysisResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const backendPort = process.env.BACKEND_PORT || "8000";
    const response = await fetch(`http://localhost:${backendPort}/upload`, {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Backend analysis failed: ${response.statusText} - ${errorText}`);
    }

    return response.json();
};
