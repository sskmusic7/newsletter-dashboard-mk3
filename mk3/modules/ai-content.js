// ===== AI CONTENT GENERATION MODULE =====
// Generates AI content generation functions (only included if Gemini key provided)

function generateAIContentFunctions(config) {
  if (!config.geminiKey) {
    return `// ===== AI CONTENT GENERATION =====
// AI content generation is disabled (no Gemini API key provided)
// To enable: Add GEMINI_API_KEY to Script Properties

function generateAIContent() {
  Logger.log('AI content generation disabled - GEMINI_API_KEY not configured');
  return null;
}`;
  }
  
  return `// ===== AI CONTENT GENERATION (GEMINI 2.5 FLASH) =====
/**
 * Generate newsletter content using Gemini 2.5 Flash AI
 * Trained on your brand voice and sample content
 * Uses Google's Gemini 2.0 Flash Experimental model for fast, high-quality content
 */
function generateAIContent() {
  const prompt = \`You are writing a newsletter for \${CONFIG.BRAND_NAME}.

Brand Bio: \${CONFIG.BRAND_BIO}

Brand Voice: \${CONFIG.BRAND_VOICE}

Sample Content:
\${CONFIG.SAMPLE_CONTENT || 'No sample content provided'}

Write a short, engaging newsletter (300-500 words) in this exact voice and style. Be authentic and conversational. Include a tip, insight, or story that provides value to subscribers.

DO NOT include subject line or placeholders. Just write the body content.\`;

  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
  
  const payload = {
    contents: [{
      parts: [{
        text: prompt
      }]
    }]
  };
  
  const options = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'x-goog-api-key': getGeminiKey()
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    const json = JSON.parse(response.getContentText());
    
    if (json.candidates && json.candidates[0]) {
      return json.candidates[0].content.parts[0].text;
    }
    
    return null;
  } catch (error) {
    Logger.log('Gemini API error: ' + error);
    return null;
  }
}`;
}


