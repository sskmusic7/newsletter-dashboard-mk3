// ===== CONFIGURATION MODULE =====
// Generates the CONFIG object and provider priority

function generateConfig(config) {
  const needsSheet = !config.sheetId || config.sheetId.trim() === '';
  const providerPriority = ['sendpulse', 'brevo', 'resend', 'mailgun', 'mailersend', 'sendgrid', 'gmail'];
  
  // Escape user input to prevent template string injection
  const escapeForTemplate = (str) => {
    if (!str) return '';
    return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${');
  };

  return `// ===== CONFIGURATION =====
const CONFIG = {
  // Sheet Configuration
  SHEET_NAME: 'Subscribers',
  ${needsSheet ? `SHEET_ID: null, // Will be auto-created on first run` : `SHEET_ID: '${config.sheetId}',`}
  
  // Email Configuration
  FROM_NAME: '${escapeForTemplate(config.brandName)}',
  
  // Email Provider Priority (will try in this order if failover is enabled)
  PROVIDER_PRIORITY: ${JSON.stringify(providerPriority)},
  
  // Template & Frequency
  TEMPLATE: '${config.template}',
  FREQUENCY: '${config.frequency}',
  WARMUP_MODE: ${config.warmup},
  
  // Feature Toggles
  ENABLE_VERIFICATION: ${config.verification || false},
  ENABLE_GMAIL_DETECTION: ${config.gmail || false},
  
  // Brand Voice (for AI content generation)
  BRAND_NAME: \`${escapeForTemplate(config.brandName)}\`,
  BRAND_BIO: \`${escapeForTemplate(config.brandBio)}\`,
  BRAND_VOICE: \`${escapeForTemplate(config.brandVoice)}\`,
  SAMPLE_CONTENT: \`${escapeForTemplate(config.sampleContent || '')}\`
};`;
}

