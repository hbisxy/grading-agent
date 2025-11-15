import { NextRequest, NextResponse } from "next/server";
import { AI_CONFIG } from "../../config/ai-config";

export async function POST(request: NextRequest) {
  try {
    const { content, criteria, question, subject } = await request.json();

    if (!content || !criteria || !Array.isArray(criteria)) {
      return NextResponse.json(
        { error: "Missing required fields: content, criteria" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    // Build the prompt for OpenAI
    const prompt = buildAnalysisPrompt(content, criteria, question);

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: AI_CONFIG.model,
        messages: [
          {
            role: "system",
            content: AI_CONFIG.systemPrompt,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: AI_CONFIG.temperature,
        max_tokens: AI_CONFIG.maxTokens,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("OpenAI API error:", error);
      return NextResponse.json(
        { error: "Failed to analyze text with AI" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const analysisResult = JSON.parse(data.choices[0].message.content);

    // Process the AI response to extract highlights
    const highlights = processAIResponse(analysisResult, content, criteria);

    return NextResponse.json({
      highlights,
      suggestedGrades: analysisResult.suggestedGrades || {},
    });
  } catch (error) {
    console.error("Error analyzing text:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function buildAnalysisPrompt(
  content: string,
  criteria: Array<{ id: string; text: string; color: string }>,
  question?: string
): string {
  const criteriaList = criteria
    .map((c, i) => `${i + 1}. [${c.id}] ${c.text}`)
    .join("\n");

  return `
Analyze the following student essay response and identify which parts of the text address each grading criterion.

${question ? `Question: ${question}\n` : ""}
Student Response:
"""
${content}
"""

Grading Criteria:
${criteriaList}

For each criterion, identify the EXACT text segments (word-for-word quotes) from the student response that address that criterion. A segment should be a continuous piece of text.

Also, suggest a grade (Weak/Average/Good) for each criterion based on:
- Weak: Criterion is barely addressed or missing key information
- Average: Criterion is addressed but lacks depth or has some issues
- Good: Criterion is well addressed with clear, accurate information

Respond with a JSON object in this exact format:
{
  "highlights": [
    {
      "criterionId": "criterion_id_here",
      "text": "exact quoted text from student response",
      "reasoning": "brief explanation of why this text addresses the criterion"
    }
  ],
  "suggestedGrades": {
    "criterion_id_1": "Good",
    "criterion_id_2": "Average"
  }
}

IMPORTANT: 
- The "text" field must contain EXACT quotes from the student response
- Only include text segments that genuinely address the criterion
- If a criterion is not addressed, don't include a highlight for it
- You can include multiple highlights for the same criterion if different parts address it
`;
}

interface AnalysisResult {
  highlights?: Array<{
    criterionId: string;
    text: string;
    reasoning: string;
  }>;
  suggestedGrades?: Record<string, string>;
}

function processAIResponse(
  analysisResult: AnalysisResult,
  content: string,
  criteria: Array<{ id: string; text: string; color: string }>
): Array<{ criterionId: string; start: number; end: number }> {
  const highlights: Array<{ criterionId: string; start: number; end: number }> =
    [];

  if (!analysisResult.highlights || !Array.isArray(analysisResult.highlights)) {
    return highlights;
  }

  for (const highlight of analysisResult.highlights) {
    const { criterionId, text } = highlight;

    // Verify the criterion exists
    if (!criteria.find((c) => c.id === criterionId)) {
      continue;
    }

    // Find the text in the content
    // We need to handle potential minor differences (extra spaces, etc.)
    const normalizedContent = content.toLowerCase();
    const normalizedText = text.toLowerCase().trim();

    let startIndex = normalizedContent.indexOf(normalizedText);

    // If exact match not found, try fuzzy matching by looking for key phrases
    if (startIndex === -1) {
      // Try to find partial matches
      const words = normalizedText
        .split(/\s+/)
        .filter((w: string) => w.length > 3);
      if (words.length > 0) {
        const firstWord = words[0];
        let searchStart = 0;

        // Look for sections containing key words
        while (
          (startIndex = normalizedContent.indexOf(firstWord, searchStart)) !==
          -1
        ) {
          // Check if this looks like the right section
          const section = normalizedContent.slice(
            startIndex,
            startIndex + normalizedText.length + 50
          );
          if (words.slice(0, 3).every((w: string) => section.includes(w))) {
            break;
          }
          searchStart = startIndex + 1;
        }
      }
    }

    if (startIndex !== -1) {
      highlights.push({
        criterionId,
        start: startIndex,
        end: startIndex + text.length,
      });
    }
  }

  return highlights;
}
