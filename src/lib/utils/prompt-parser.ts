/**
 * Extracts the number of slides/cards from a user prompt
 * @param prompt - The user's input prompt
 * @param maxAllowed - Maximum number of slides/cards allowed based on user's plan (default: 10)
 * @returns The number of slides/cards requested, or 10 as default
 */
export function extractSlideCount(prompt: string, maxAllowed: number = 10): number {
  if (!prompt || typeof prompt !== 'string') {
    return 10; // Default fallback
  }

  // Convert to lowercase for case-insensitive matching
  const lowerPrompt = prompt.toLowerCase();

  // Define regex patterns to match different ways users might specify slide count
  const patterns = [
    // "4 slides", "5 slides"
    /(\d+)\s*slides?/i,
    
    // "4 cards", "5 cards"
    /(\d+)\s*cards?/i,
    
    // "4 cartões", "5 cartões"
    /(\d+)\s*cartões?/i,
    
    // "faça 4 slides", "fazer 5 slides"
    /(?:faça|fazer|crie|criar)\s*(\d+)\s*slides?/i,
    
    // "faça 4 cards", "fazer 5 cards"
    /(?:faça|fazer|crie|criar)\s*(\d+)\s*cards?/i,
    
    // "faça 4 cartões", "fazer 5 cartões"
    /(?:faça|fazer|crie|criar)\s*(\d+)\s*cartões?/i,
    
    // "quero 4 slides", "preciso de 5 slides"
    /(?:quero|preciso\s*de|gostaria\s*de)\s*(\d+)\s*slides?/i,
    
    // "quero 4 cards", "preciso de 5 cards"
    /(?:quero|preciso\s*de|gostaria\s*de)\s*(\d+)\s*cards?/i,
    
    // "quero 4 cartões", "preciso de 5 cartões"
    /(?:quero|preciso\s*de|gostaria\s*de)\s*(\d+)\s*cartões?/i,
    
    // "4 tópicos", "5 tópicos"
    /(\d+)\s*(?:tópicos?|topicos?)/i,
    
    // "apresentação com 4 slides"
    /apresentação\s*com\s*(\d+)\s*slides?/i,
    
    // "apresentação com 4 cards"
    /apresentação\s*com\s*(\d+)\s*cards?/i,
    
    // "apresentação com 4 cartões"
    /apresentação\s*com\s*(\d+)\s*cartões?/i,
    
    // "presentation with 4 slides" (English)
    /presentation\s*with\s*(\d+)\s*slides?/i,
    
    // "presentation with 4 cards" (English)
    /presentation\s*with\s*(\d+)\s*cards?/i,
    
    // "make 4 slides", "create 5 slides"
    /(?:make|create)\s*(\d+)\s*slides?/i,
    
    // "make 4 cards", "create 5 cards"
    /(?:make|create)\s*(\d+)\s*cards?/i,
    
    // "I want 4 slides", "I need 5 slides"
    /(?:i\s*want|i\s*need)\s*(\d+)\s*slides?/i,
    
    // "I want 4 cards", "I need 5 cards"
    /(?:i\s*want|i\s*need)\s*(\d+)\s*cards?/i,
    
    // Just a number followed by "slides" anywhere in the text
    /\b(\d+)\s*slides?\b/i,
    
    // Just a number followed by "cards" anywhere in the text
    /\b(\d+)\s*cards?\b/i,
    
    // Just a number followed by "cartões" anywhere in the text
    /\b(\d+)\s*cartões?\b/i,
  ];

  // Try each pattern
  for (const pattern of patterns) {
    const match = lowerPrompt.match(pattern);
    if (match && match[1]) {
      const count = parseInt(match[1], 10);
      
      // Validate the number is reasonable (between 1 and maxAllowed)
      // If user requests more than maxAllowed, limit to maxAllowed
      if (count >= 1 && count <= maxAllowed) {
        return count;
      } else if (count > maxAllowed) {
        console.log(`🚫 User requested ${count} slides/cards, limiting to ${maxAllowed} (max allowed for plan)`);
        return maxAllowed; // Limit to plan maximum
      }
    }
  }

  // If no valid number found, return default
  return 10;
}
