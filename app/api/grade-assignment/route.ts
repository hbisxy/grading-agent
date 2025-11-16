/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const {
      assignment,
      criteria,
      calibrationExamples,
      previousGrades,
      isRegrade,
    } = await request.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const prompt = buildGradingPrompt(
      assignment,
      criteria,
      calibrationExamples,
      previousGrades,
      isRegrade
    );

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content:
              "You are an expert grading assistant. Grade assignments consistently based on calibration examples.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      throw new Error("OpenAI API request failed");
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    // Process highlights to find exact positions
    const highlights = processHighlights(
      result.highlights || [],
      assignment.content,
      criteria
    );

    return NextResponse.json({
      score: result.score,
      reasoning: result.reasoning,
      highlights,
      criteriaScores: result.criteriaScores || {},
    });
  } catch (error) {
    console.error("Error grading assignment:", error);
    return NextResponse.json(
      { error: "Failed to grade assignment" },
      { status: 500 }
    );
  }
}

function buildGradingPrompt(
  assignment: any,
  criteria: any[],
  calibrationExamples: any[],
  previousGrades: any[],
  isRegrade: boolean
): string {
  const criteriaList = criteria.map((c, i) => `${i + 1}. ${c.text}`).join("\n");

  const examplesText = calibrationExamples
    .map(
      (ex, i) =>
        `Example ${i + 1} (Score: ${ex.score}/10):
${ex.content.substring(0, 200)}...
Grading reasoning: ${ex.reasoning || "Manually graded"}`
    )
    .join("\n\n");

  const avgScore =
    previousGrades.length > 0
      ? (
          previousGrades.reduce((sum, g) => sum + g.score, 0) /
          previousGrades.length
        ).toFixed(1)
      : "N/A";

  return `
Grade the following student assignment based on the calibration examples and criteria.

${
  isRegrade
    ? "⚠️ REGRADE MODE: Previous grading deviated too much. Adjust grading to be more consistent with calibration examples.\n"
    : ""
}

GRADING CRITERIA:
${criteriaList}

CALIBRATION EXAMPLES (for reference):
${examplesText}

CURRENT GRADING SESSION STATS:
- Average score so far: ${avgScore}
- Number of assignments graded: ${previousGrades.length}

STUDENT ASSIGNMENT TO GRADE:
Student: ${assignment.studentName}
Question: ${assignment.question}

Response:
"""
${assignment.content}
"""

Provide a grade out of 10 that is CONSISTENT with the calibration examples. Consider:
1. How well each criterion is addressed
2. Depth and accuracy of the response
3. Comparison to calibration examples
${isRegrade ? "4. Ensure consistency with the established average\n" : ""}

Respond with JSON in this format:
{
  "score": 7.5,
  "reasoning": "Brief explanation of the grade",
  "criteriaScores": {
    "criterion_id_1": "Good",
    "criterion_id_2": "Average"
  },
  "highlights": [
    {
      "criterionId": "criterion_id",
      "text": "exact quote from student response"
    }
  ]
}
`;
}

function processHighlights(
  highlights: any[],
  content: string,
  criteria: any[]
): any[] {
  const processed: any[] = [];

  for (const highlight of highlights) {
    const normalizedContent = content.toLowerCase();
    const normalizedText = highlight.text.toLowerCase().trim();
    const startIndex = normalizedContent.indexOf(normalizedText);

    if (startIndex !== -1) {
      processed.push({
        criterionId: highlight.criterionId,
        start: startIndex,
        end: startIndex + highlight.text.length,
      });
    }
  }

  return processed;
}
