/**
 * AI Configuration for Text Analysis
 *
 * Customize these settings to adjust AI behavior
 */

export const AI_CONFIG = {
  // OpenAI Model Selection
  // Options: "gpt-4o", "gpt-4-turbo", "gpt-3.5-turbo"
  // gpt-4o: Most capable, best for complex analysis (~$0.005/analysis)
  // gpt-4-turbo: Fast and capable (~$0.003/analysis)
  // gpt-3.5-turbo: Most economical (~$0.001/analysis)
  model: "gpt-4o",

  // Temperature (0.0 - 2.0)
  // Lower values = more consistent/deterministic
  // Higher values = more creative/varied
  // Recommended: 0.3 for grading consistency
  temperature: 0.3,

  // Maximum tokens for response
  // Higher = more detailed analysis (also more expensive)
  maxTokens: 1500,

  // System prompt customization
  systemPrompt:
    "You are an expert educational assessment assistant. Your task is to analyze student essay responses and identify specific text segments that address each grading criterion. Be precise and fair in your assessments.",

  // Grade quality definitions
  gradeDefinitions: {
    Good: "Criterion is well addressed with clear, accurate, and complete information",
    Average:
      "Criterion is addressed but lacks depth, detail, or has minor issues",
    Weak: "Criterion is barely addressed, missing key information, or contains significant errors",
  },

  // Fuzzy matching settings
  fuzzyMatching: {
    enabled: true,
    minKeywordLength: 3, // Minimum length of keywords for fuzzy search
    maxKeywords: 5, // Maximum keywords to use for fuzzy matching
  },
};

/**
 * Subject-specific configurations
 * Override default settings for specific subjects
 */
export const SUBJECT_CONFIGS = {
  science: {
    systemPrompt:
      "You are an expert science educator. Analyze student responses for scientific accuracy, proper use of terminology, and demonstration of understanding of scientific processes.",
    temperature: 0.2, // More strict for factual content
  },

  literature: {
    systemPrompt:
      "You are an expert literature educator. Analyze student responses for textual evidence, critical thinking, and interpretation skills.",
    temperature: 0.4, // Slightly more flexible for interpretive content
  },

  history: {
    systemPrompt:
      "You are an expert history educator. Analyze student responses for historical accuracy, use of evidence, and understanding of cause-and-effect relationships.",
    temperature: 0.2,
  },

  math: {
    systemPrompt:
      "You are an expert mathematics educator. Analyze student responses for problem-solving approach, mathematical reasoning, and correct application of concepts.",
    temperature: 0.1, // Very strict for mathematical accuracy
  },
};

/**
 * Get configuration for a specific subject
 * Falls back to default config if subject not found
 */
export function getSubjectConfig(subject?: string) {
  if (subject) {
    const key = subject.toLowerCase() as keyof typeof SUBJECT_CONFIGS;
    if (SUBJECT_CONFIGS[key]) {
      return {
        ...AI_CONFIG,
        ...SUBJECT_CONFIGS[key],
      };
    }
  }
  return AI_CONFIG;
}
