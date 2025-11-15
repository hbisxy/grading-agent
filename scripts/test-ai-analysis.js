/**
 * Test utility for the AI text analysis API
 *
 * This script helps verify that your OpenAI API key is configured correctly
 * and the analysis endpoint is working as expected.
 *
 * Run with: node scripts/test-ai-analysis.js
 */

const testCriteria = [
  {
    id: "evaporation",
    text: "Describes evaporation process and the role of solar energy",
    color: "blue",
  },
  {
    id: "condensation",
    text: "Explains condensation and cloud formation",
    color: "green",
  },
];

const testContent = `The water cycle is a continuous process that circulates water throughout Earth's systems. Water evaporates from oceans, lakes, and rivers due to heat from the sun, turning from liquid into water vapor.

As the water vapor rises into the atmosphere, it cools and condenses into clouds through a process called condensation.`;

const testQuestion =
  "Explain the water cycle and its importance to Earth's ecosystems.";

async function testAnalysis() {
  console.log("🧪 Testing AI Text Analysis API...\n");

  try {
    const response = await fetch("http://localhost:3000/api/analyze-text", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content: testContent,
        criteria: testCriteria,
        question: testQuestion,
      }),
    });

    console.log(`📡 Response Status: ${response.status}`);

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ API Error:", error);
      console.log("\n💡 Troubleshooting:");
      console.log("1. Check that .env.local has OPENAI_API_KEY set");
      console.log("2. Restart your dev server: npm run dev");
      console.log("3. Verify your OpenAI API key is valid");
      return;
    }

    const data = await response.json();

    console.log("\n✅ Analysis Successful!\n");
    console.log("📊 Results:");
    console.log("─".repeat(50));

    console.log("\n🎯 Highlights Found:", data.highlights.length);
    data.highlights.forEach((highlight, idx) => {
      console.log(`\n${idx + 1}. Criterion: ${highlight.criterionId}`);
      console.log(`   Position: ${highlight.start} - ${highlight.end}`);
      console.log(
        `   Text: "${testContent.substring(highlight.start, highlight.end)}"`
      );
    });

    console.log("\n📝 Suggested Grades:");
    Object.entries(data.suggestedGrades || {}).forEach(
      ([criterionId, grade]) => {
        console.log(`   ${criterionId}: ${grade}`);
      }
    );

    console.log("\n─".repeat(50));
    console.log("\n🎉 Test completed successfully!");
  } catch (error) {
    console.error("❌ Test Failed:", error.message);
    console.log("\n💡 Make sure your dev server is running:");
    console.log("   npm run dev");
  }
}

// Run the test
testAnalysis();
