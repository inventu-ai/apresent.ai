/**
 * Extracts the number of slides from a user prompt
 * @param prompt - The user's input prompt
 * @returns The number of slides requested, or 10 as default
 */
export function extractSlideCount(prompt: string): number {
  if (!prompt || typeof prompt !== 'string') {
    return 10; // Default fallback
  }

  // Convert to lowercase for case-insensitive matching
  const lowerPrompt = prompt.toLowerCase();

  // Define regex patterns to match different ways users might specify slide count
  const patterns = [
    // "4 slides", "5 slides"
    /(\d+)\s*slides?/i,
    
    // "faça 4 slides", "fazer 5 slides"
    /(?:faça|fazer|crie|criar)\s*(\d+)\s*slides?/i,
    
    // "quero 4 slides", "preciso de 5 slides"
    /(?:quero|preciso\s*de|gostaria\s*de)\s*(\d+)\s*slides?/i,
    
    // "4 tópicos", "5 tópicos"
    /(\d+)\s*(?:tópicos?|topicos?)/i,
    
    // "apresentação com 4 slides"
    /apresentação\s*com\s*(\d+)\s*slides?/i,
    
    // "presentation with 4 slides" (English)
    /presentation\s*with\s*(\d+)\s*slides?/i,
    
    // "make 4 slides", "create 5 slides"
    /(?:make|create)\s*(\d+)\s*slides?/i,
    
    // "I want 4 slides", "I need 5 slides"
    /(?:i\s*want|i\s*need)\s*(\d+)\s*slides?/i,
    
    // Just a number followed by "slides" anywhere in the text
    /\b(\d+)\s*slides?\b/i,
  ];

  // Try each pattern
  for (const pattern of patterns) {
    const match = lowerPrompt.match(pattern);
    if (match && match[1]) {
      const count = parseInt(match[1], 10);
      
      // Validate the number is reasonable (between 1 and 30)
      if (count >= 1 && count <= 30) {
        return count;
      }
    }
  }

  // If no valid number found, return default
  return 10;
}