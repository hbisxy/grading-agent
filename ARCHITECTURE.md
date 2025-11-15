# AI Text Analysis Architecture

## System Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│                    GradingCalibration.jsx                        │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  1. User clicks "AI Auto-Highlight" button               │  │
│  │  2. Calls useTextAnalysis hook                           │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Layer (Next.js)                         │
│                  /api/analyze-text/route.ts                      │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  3. Receives: content, criteria, question                │  │
│  │  4. Builds analysis prompt                               │  │
│  │  5. Calls OpenAI API                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        OpenAI API (GPT-4)                        │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  6. Analyzes student text                                │  │
│  │  7. Identifies text matching each criterion              │  │
│  │  8. Suggests grades (Weak/Average/Good)                  │  │
│  │  9. Returns JSON with highlights & grades                │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Layer (Next.js)                         │
│                  /api/analyze-text/route.ts                      │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  10. Processes AI response                               │  │
│  │  11. Converts text quotes to start/end positions         │  │
│  │  12. Returns highlights array                            │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
│                    GradingCalibration.jsx                        │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  13. Updates highlights state                            │  │
│  │  14. Updates grades state                                │  │
│  │  15. UI re-renders with colored highlights               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Request Structure

```typescript
{
  content: "Student's essay text...",
  criteria: [
    {
      id: "evaporation",
      text: "Describes evaporation process",
      color: "blue"
    }
  ],
  question: "Explain the water cycle..." // optional
}
```

### AI Response Structure

```json
{
  "highlights": [
    {
      "criterionId": "evaporation",
      "text": "Water evaporates from oceans...",
      "reasoning": "This segment clearly describes evaporation"
    }
  ],
  "suggestedGrades": {
    "evaporation": "Good",
    "condensation": "Average"
  }
}
```

### Processed Response

```typescript
{
  highlights: [
    {
      criterionId: "evaporation",
      start: 93,    // Character position in text
      end: 230      // Character position in text
    }
  ],
  suggestedGrades: {
    evaporation: "Good",
    condensation: "Average"
  }
}
```

## Key Components

### 1. Frontend Hook (`useTextAnalysis.ts`)

- **Purpose**: Abstracts API communication
- **Manages**: Loading state, error handling
- **Returns**: Analysis function and state

### 2. API Route (`/api/analyze-text/route.ts`)

- **Purpose**: Backend logic for AI analysis
- **Tasks**:
  - Validates input
  - Constructs AI prompt
  - Calls OpenAI
  - Processes response
  - Returns formatted data

### 3. Configuration (`ai-config.ts`)

- **Purpose**: Centralized AI settings
- **Contains**:
  - Model selection
  - Temperature settings
  - Subject-specific configs
  - Grade definitions

## Text Matching Algorithm

```
1. AI returns quoted text: "Water evaporates from oceans..."

2. Normalize both strings (lowercase)
   Original: "The water cycle... Water evaporates from oceans..."
   Quote: "water evaporates from oceans..."

3. Try exact match
   indexOf(quote) → finds position

4. If not found, try fuzzy matching:
   - Extract key words (length > 3)
   - Find sections with multiple keywords
   - Verify match quality

5. Return start/end positions
   { start: 93, end: 230 }
```

## Error Handling

```
Frontend Error → Show in UI with AlertCircle icon
   ↓
API Error → Log + Return 500
   ↓
OpenAI Error → Log + Return 500 with generic message
   ↓
Text Match Fail → Skip highlight (no error shown)
```

## Performance Considerations

- **Latency**: ~2-5 seconds per analysis
- **Cost**: ~$0.005 per assignment (GPT-4o)
- **Rate Limits**: OpenAI tier-based limits apply
- **Optimization**: Could batch multiple assignments

## Security

- API key stored in `.env.local` (never committed)
- Server-side only (Next.js API route)
- No client-side exposure of API key
- Input validation on API endpoint
