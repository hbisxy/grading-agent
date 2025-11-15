# Grading Agent

An AI-powered grading assistant that helps educators efficiently grade student essays by providing intelligent text highlighting, criterion-based assessment, and automated grading suggestions.

## Features

✨ **AI-Powered Text Analysis**
- Automatic highlighting of text segments matching grading criteria
- Intelligent grade suggestions (Weak/Average/Good)
- Uses GPT-4 for accurate content analysis

📝 **Manual Grading Calibration**
- Interactive interface for grading sample assignments
- Criterion-based assessment with color-coded highlights
- Manual text selection and grading for fine-tuning

📊 **Distribution Settings**
- Configure target grade distributions
- Set minimum scores and additional instructions
- Prepare AI for batch grading of remaining assignments

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure AI (Required for Auto-Highlighting)

See [AI_SETUP.md](./AI_SETUP.md) for detailed instructions.

Quick setup:
```bash
# Copy example env file
cp .env.local.example .env.local

# Add your OpenAI API key to .env.local
# OPENAI_API_KEY=sk-your-key-here
```

### 3. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Navigate to [http://localhost:3000/calibration](http://localhost:3000/calibration) to start grading.

## Project Structure

```
grading-agent/
├── app/
│   ├── api/
│   │   └── analyze-text/      # AI analysis endpoint
│   ├── components/
│   │   ├── GradingCalibration.jsx    # Main grading interface
│   │   └── DistributionSettings.jsx  # Grade distribution config
│   ├── hooks/
│   │   └── useTextAnalysis.ts        # AI analysis hook
│   └── calibration/
│       └── page.jsx                   # Calibration page route
├── scripts/
│   └── test-ai-analysis.js    # API testing utility
├── .env.local.example         # Environment variables template
└── AI_SETUP.md               # Detailed AI setup guide
```

## How It Works

### 1. Calibration Phase
- Educators grade a small sample (e.g., 3 assignments)
- Highlight text matching each criterion
- Assign grades (Weak/Average/Good)
- Use AI Auto-Highlight for suggestions

### 2. Distribution Configuration
- Set target average and standard deviation
- Define minimum acceptable scores
- Add custom grading instructions

### 3. AI Training (Future)
- AI learns from calibration examples
- Applies learned patterns to remaining assignments
- Maintains consistency with manual grading

## API Endpoints

### POST `/api/analyze-text`

Analyzes student text and identifies criterion matches.

**Request:**
```json
{
  "content": "Student essay text...",
  "criteria": [
    {
      "id": "criterion1",
      "text": "Describes key concept X",
      "color": "blue"
    }
  ],
  "question": "Essay question (optional)"
}
```

**Response:**
```json
{
  "highlights": [
    {
      "criterionId": "criterion1",
      "start": 45,
      "end": 120
    }
  ],
  "suggestedGrades": {
    "criterion1": "Good"
  }
}
```

## Testing

Test the AI analysis endpoint:
```bash
node scripts/test-ai-analysis.js
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
