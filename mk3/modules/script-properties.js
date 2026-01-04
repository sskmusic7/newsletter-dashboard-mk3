// ===== SCRIPT PROPERTIES MODULE =====
// Generates functions to retrieve API keys and configuration from Script Properties

function generateScriptPropertiesFunctions(config) {
  return `// ===== SCRIPT PROPERTIES FUNCTIONS =====
// All API keys are stored in Script Properties for security
// Add them in: Project Settings → Script Properties

/**
 * Get FROM_EMAIL from Script Properties
 */
function getFromEmail() {
  const fromEmail = PropertiesService.getScriptProperties().getProperty('FROM_EMAIL');
  if (!fromEmail) {
    throw new Error('FROM_EMAIL not configured. Add it to Script Properties.');
  }
  return fromEmail;
}

/**
 * Get email provider from Script Properties
 */
function getEmailProvider() {
  const props = PropertiesService.getScriptProperties();
  return props.getProperty('EMAIL_PROVIDER') || '${config.primaryProvider || 'sendpulse'}';
}

/**
 * Check if failover is enabled
 */
function isFailoverEnabled() {
  const props = PropertiesService.getScriptProperties();
  const enabled = props.getProperty('ENABLE_FAILOVER');
  return enabled === null || enabled === undefined || enabled === 'true';
}

/**
 * Get API key for a specific provider
 */
function getProviderApiKey(provider) {
  const props = PropertiesService.getScriptProperties();
  const keyMap = {
    'sendgrid': 'SENDGRID_API_KEY',
    'brevo': 'BREVO_API_KEY',
    'sendpulse': 'SENDPULSE_API_KEY', // This is the access token (generated from ID + Secret)
    'resend': 'RESEND_API_KEY',
    'mailersend': 'MAILERSEND_API_KEY',
    'mailgun': 'MAILGUN_API_KEY'
  };
  
  const keyName = keyMap[provider];
  if (!keyName) return null;
  
  return props.getProperty(keyName);
}

/**
 * Get SendPulse API credentials (ID + Secret)
 */
function getSendPulseCredentials() {
  const props = PropertiesService.getScriptProperties();
  const apiId = props.getProperty('SENDPULSE_API_ID');
  const apiSecret = props.getProperty('SENDPULSE_API_SECRET');
  
  if (!apiId || !apiSecret) {
    throw new Error('SENDPULSE_API_ID and SENDPULSE_API_SECRET must be configured in Script Properties');
  }
  
  return { id: apiId, secret: apiSecret };
}

/**
 * Get SendPulse access token (generates new one if expired)
 * Tokens expire after 1 hour, so we cache them
 */
function getSendPulseAccessToken() {
  const props = PropertiesService.getScriptProperties();
  const cacheKey = 'SENDPULSE_TOKEN';
  const cacheExpiryKey = 'SENDPULSE_TOKEN_EXPIRY';
  
  // Check if we have a cached token that's still valid
  const cachedToken = props.getProperty(cacheKey);
  const tokenExpiry = props.getProperty(cacheExpiryKey);
  
  if (cachedToken && tokenExpiry && Date.now() < parseInt(tokenExpiry)) {
    // Token is still valid, return it
    return cachedToken;
  }
  
  // Generate new token
  const credentials = getSendPulseCredentials();
  
  const payload = {
    grant_type: 'client_credentials',
    client_id: credentials.id,
    client_secret: credentials.secret
  };
  
  const options = {
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch('https://api.sendpulse.com/oauth/access_token', options);
  const code = response.getResponseCode();
  
  if (code !== 200) {
    throw new Error('Failed to get SendPulse access token: ' + response.getContentText());
  }
  
  const result = JSON.parse(response.getContentText());
  const accessToken = result.access_token;
  const expiresIn = result.expires_in || 3600; // Default to 1 hour if not provided
  
  // Cache the token (expire 5 minutes before actual expiry for safety)
  const expiryTime = Date.now() + ((expiresIn - 300) * 1000);
  props.setProperty(cacheKey, accessToken);
  props.setProperty(cacheExpiryKey, expiryTime.toString());
  
  Logger.log('Generated new SendPulse access token (expires in ' + expiresIn + ' seconds)');
  return accessToken;
}

/**
 * Get Mailgun domain (required for Mailgun)
 */
function getMailgunDomain() {
  return PropertiesService.getScriptProperties().getProperty('MAILGUN_DOMAIN');
}

${config.geminiKey ? `
/**
 * Get Gemini API key (optional, for AI content generation)
 */
function getGeminiKey() {
  const key = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!key) {
    Logger.log('GEMINI_API_KEY not found. AI content generation will be disabled.');
    return null;
  }
  return key;
}
` : `
/**
 * Get Gemini API key (optional, for AI content generation)
 */
function getGeminiKey() {
  return PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
}
`}`;
}

