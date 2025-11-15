# AI-Powered Text Highlighting Setup

## Overview

The grading agent now includes AI-powered text highlighting that automatically:

- Identifies text segments matching grading criteria
- Suggests grades (Weak/Average/Good) for each criterion
- Uses GPT-4 for intelligent analysis

## Setup Instructions

### 1. Get OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign up or log in
3. Create a new API key
4. Copy the key (it starts with `sk-...`)

### 2. Configure Environment Variables

1. Create a `.env.local` file in the project root:

   ```bash
   cp .env.local.example .env.local
   ```

2. Add your OpenAI API key:

   ```
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

3. Restart your development server:
   ```bash
   npm run dev
   ```

### 3. Usage

Once configured, you'll see an "AI Auto-Highlight" button in the grading interface:

1. Navigate to a student submission
2. Click the **AI Auto-Highlight** button
3. The AI will:
   - Analyze the student's response
   - Highlight relevant text for each criterion
   - Suggest grades for each criterion

## How It Works

### Backend (`/app/api/analyze-text/route.ts`)

The API endpoint:

1. Receives the student's text, grading criteria, and question
2. Constructs a detailed prompt for GPT-4
3. Asks the AI to identify exact text segments for each criterion
4. Returns highlights (start/end positions) and suggested grades

### Frontend Integration

**Hook** (`/app/hooks/useTextAnalysis.ts`):

- Provides `analyzeText()` function
- Manages loading state
- Handles errors

**Component** (`GradingCalibration.jsx`):

- Triggers analysis on button click
- Updates highlights state with AI results
- Applies suggested grades to the UI

## Cost Considerations

Using GPT-4o (recommended):

- ~$0.005 per analysis (approximately)
- For 100 assignments: ~$0.50

To reduce costs, you can switch to `gpt-3.5-turbo` in the API route:

```typescript
model: "gpt-3.5-turbo"; // Change from "gpt-4o"
```

## Customization

### Adjust AI Temperature

In `/app/api/analyze-text/route.ts`, modify the temperature parameter:

```typescript
temperature: 0.3,  // Lower = more consistent, Higher = more creative
```

### Change AI Model

Choose from:

- `gpt-4o` - Latest, most capable (recommended)
- `gpt-4-turbo` - Fast and capable
- `gpt-3.5-turbo` - Most cost-effective

### Customize Prompt

Edit the `buildAnalysisPrompt()` function to adjust how the AI analyzes text.

## Troubleshooting

### "OpenAI API key not configured" Error

- Ensure `.env.local` exists with `OPENAI_API_KEY`
- Restart the dev server after adding the key

### "Failed to analyze text with AI" Error

- Check your OpenAI API key is valid
- Verify you have API credits/billing set up
- Check the browser console for detailed error messages

### Highlights Not Appearing

- The AI tries to find exact text matches
- If fuzzy matching fails, manually highlight the text
- Check the console for processing warnings

## Future Enhancements

Potential improvements:

- Batch analysis for multiple assignments
- Fine-tuned models for specific subjects
- Confidence scores for each highlight
- Explanation generation for grades
- Multi-language support
