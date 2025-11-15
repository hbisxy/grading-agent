import { useState } from "react";

interface Criterion {
  id: string;
  text: string;
  color: string;
}

interface Highlight {
  criterionId: string;
  start: number;
  end: number;
}

interface AnalyzeTextResponse {
  highlights: Highlight[];
  suggestedGrades: Record<string, string>;
}

export const useTextAnalysis = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeText = async (
    content: string,
    criteria: Criterion[],
    question?: string
  ): Promise<AnalyzeTextResponse | null> => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch("/api/analyze-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          criteria,
          question,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze text");
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("Error analyzing text:", err);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    analyzeText,
    isAnalyzing,
    error,
  };
};
