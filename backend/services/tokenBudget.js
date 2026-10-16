import dotenv from 'dotenv';
dotenv.config();

export const AI_MAX_TOKENS = parseInt(process.env.AI_MAX_TOKENS || '100000', 10);
export const AI_LOW_TOKEN_THRESHOLD = parseInt(process.env.AI_LOW_TOKEN_THRESHOLD || '50', 10);

/**
 * Estimate token count for a string (~4 characters per token heuristic)
 */
export function estimateTokenCount(text = '') {
  if (!text) return 0;
  if (typeof text !== 'string') text = JSON.stringify(text);
  return Math.ceil(text.length / 4);
}

/**
 * Token budget tracker for agent sessions
 */
export class TokenBudgetTracker {
  constructor(maxTokens = AI_MAX_TOKENS, lowThreshold = AI_LOW_TOKEN_THRESHOLD) {
    this.maxTokens = maxTokens;
    this.lowThreshold = lowThreshold;
    this.usedTokens = 0;
    this.iterations = 0;
  }

  recordUsage(promptText, completionText, actualUsage = null) {
    this.iterations += 1;
    if (actualUsage && typeof actualUsage.total_tokens === 'number') {
      this.usedTokens += actualUsage.total_tokens;
    } else {
      const pTokens = estimateTokenCount(promptText);
      const cTokens = estimateTokenCount(completionText);
      this.usedTokens += (pTokens + cTokens);
    }
    return this.getRemainingTokens();
  }

  getRemainingTokens() {
    return Math.max(0, this.maxTokens - this.usedTokens);
  }

  isBudgetLow() {
    return this.getRemainingTokens() <= this.lowThreshold;
  }

  hasExceededBudget() {
    return this.usedTokens >= this.maxTokens;
  }

  getStatus() {
    const remaining = this.getRemainingTokens();
    return {
      maxTokens: this.maxTokens,
      usedTokens: this.usedTokens,
      remainingTokens: remaining,
      lowThreshold: this.lowThreshold,
      isLow: remaining <= this.lowThreshold,
      iterations: this.iterations
    };
  }
}
