// ===== ai content MODULE ===== 
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
  
  return `// ===== AI CONTENT GENERATION (GEMINI) =====
/**
 * Generate newsletter content using Gemini AI
 * Trained on your brand voice and sample content
 */
function generateAIContent() {
  const prompt = \`You are writing a newsletter for \${CONFIG.BRAND_NAME}.

Brand Bio: \${CONFIG.BRAND_BIO}

Brand Voice: \${CONFIG.BRAND_VOICE}

Sample Content:
\${CONFIG.SAMPLE_CONTENT || 'No sample content provided'}

Write a short, engaging newsletter (300-500 words) in this exact voice and style. Be authentic and conversational. Include a tip, insight, or story that provides value to subscribers.

DO NOT include subject line or placeholders. Just write the body content.\`;

  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
  
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



// ===== config MODULE ===== 
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



// ===== gmail triggers MODULE ===== 
// ===== GMAIL REPLY DETECTION MODULE =====
// Generates Gmail trigger functions (only included if Gmail detection is enabled)

function generateGmailTriggerFunctions(config) {
  return `// ===== GMAIL REPLY DETECTION =====
// Automatic reply detection and user verification

/**
 * Set up Gmail trigger to watch for email replies
 * Run this ONCE to set up the trigger
 * 
 * This will check Gmail every 5 minutes for replies to your warming emails
 */
function setupGmailReplyTrigger() {
  // Delete existing triggers (cleanup)
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'processGmailReplies') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Create new trigger to check Gmail every 5 minutes
  ScriptApp.newTrigger('processGmailReplies')
    .timeBased()
    .everyMinutes(5)
    .create();
  
  Logger.log('Gmail reply trigger set up successfully!');
  Logger.log('This will check for replies every 5 minutes.');
  return 'Gmail reply trigger set up! It will check for replies every 5 minutes.';
}

/**
 * Set up Sheet Change trigger - runs immediately when sheet is edited
 * This checks for replies right away when someone submits the form
 */
function setupSheetChangeTrigger() {
  // Delete existing sheet change triggers (cleanup)
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'onSheetEdit' && trigger.getEventType() === ScriptApp.EventType.ON_CHANGE) {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // Create new trigger that runs when sheet changes
  const ss = getSpreadsheet();
  ScriptApp.newTrigger('onSheetEdit')
    .forSpreadsheet(ss)
    .onChange()
    .create();
  
  Logger.log('Sheet change trigger set up successfully!');
  Logger.log('This will check for replies immediately when the sheet is edited.');
  return 'Sheet change trigger set up! It will check for replies whenever the sheet changes.';
}

/**
 * This runs automatically when the sheet changes
 * It checks for replies immediately instead of waiting 5 minutes
 */
function onSheetEdit(e) {
  try {
    Logger.log('Sheet changed - checking for replies immediately...');
    processGmailReplies();
  } catch (error) {
    Logger.log('Error in onSheetEdit: ' + error);
  }
}

/**
 * Set up both triggers at once
 */
function setupAllTriggers() {
  setupGmailReplyTrigger();
  setupSheetChangeTrigger();
  return 'All triggers set up! Replies will be checked every 5 minutes AND immediately when sheet changes.';
}

/**
 * Process Gmail replies to warming emails
 * This function is called by the trigger every 5 minutes
 * 
 * It searches for email threads where you sent a warming email and received a reply,
 * then automatically verifies the user and sends the welcome email.
 */
function processGmailReplies() {
  try {
    // Get all pending users from the sheet
    const sheet = initializeSheet();
    const data = sheet.getDataRange().getValues();
    
    let processedCount = 0;
    
    Logger.log('Checking pending users for replies...');
    
    // Check each pending user
    for (let i = 1; i < data.length; i++) {
      const email = data[i][1] ? data[i][1].toLowerCase() : '';
      const status = data[i][5] || 'pending';
      
      // Only check pending users
      if (status === 'pending' && email) {
        Logger.log('Checking for replies from: ' + email);
        
        // Build search query that handles email variations
        // @gmail.com and @googlemail.com are interchangeable
        const emailParts = email.split('@');
        const username = emailParts[0];
        const domain = emailParts[1];
        
        let searchQueries = ['from:' + email];
        
        // Add @googlemail.com / @gmail.com variations
        if (domain === 'gmail.com') {
          searchQueries.push('from:' + username + '@googlemail.com');
        } else if (domain === 'googlemail.com') {
          searchQueries.push('from:' + username + '@gmail.com');
        }
        
        // Combine all variations into one search query
        const query = '(' + searchQueries.join(' OR ') + ') -label:processed-reply';
        Logger.log('Search query: ' + query);
        
        const threads = GmailApp.search(query, 0, 5); // Check last 5 emails from this person
        
        if (threads.length > 0) {
          Logger.log('Found ' + threads.length + ' emails from ' + email);
          
          // They replied! Verify them
          updateSubscriberStatus(email, 'verified');
          sheet.getRange(i + 1, 7).setValue(new Date()); // Update verified date
          
          // Send welcome email
          const name = data[i][2] || '';
          sendDownloadEmail(email, name);
          
          Logger.log('✓ Verified and sent welcome email to: ' + email);
          processedCount++;
          
          // Label all their threads as processed
          for (let t = 0; t < threads.length; t++) {
            try {
              let label = GmailApp.getUserLabelByName('processed-reply');
              if (!label) {
                label = GmailApp.createLabel('processed-reply');
              }
              threads[t].addLabel(label);
            } catch (labelError) {
              Logger.log('Could not label thread: ' + labelError);
            }
          }
        }
      }
    }
    
    Logger.log('Processed ' + processedCount + ' new replies');
    return 'Checked pending users, verified ' + processedCount + ' replies';
  } catch (error) {
    Logger.log('Error in processGmailReplies: ' + error);
    return 'Error: ' + error.message;
  }
}

/**
 * Test Gmail access - run this to trigger Gmail permission prompt
 */
function testGmailAccess() {
  try {
    // This will trigger Gmail permission prompt
    const threads = GmailApp.getInboxThreads(0, 1);
    Logger.log('Gmail access works! Found ' + threads.length + ' threads');
    return '✓ Gmail permissions granted! Found ' + threads.length + ' inbox threads';
  } catch (error) {
    Logger.log('Gmail error: ' + error);
    return 'Error: ' + error.message + ' - Run this to get Gmail permissions';
  }
}

/**
 * Force authorization by accessing Gmail directly
 * This WILL trigger the authorization prompt
 */
function forceGmailAuth() {
  try {
    // Access Gmail to force authorization
    const label = GmailApp.getUserLabels();
    const threads = GmailApp.getInboxThreads(0, 1);
    const unread = GmailApp.getInboxUnreadCount();
    
    Logger.log('Gmail authorized! You have ' + unread + ' unread emails');
    return 'Gmail authorized successfully! Unread count: ' + unread;
  } catch (error) {
    Logger.log('Gmail authorization error: ' + error);
    return 'Error: ' + error.message;
  }
}`;
}



// ===== multi provider MODULE ===== 
// ===== MULTI-PROVIDER EMAIL SYSTEM MODULE =====
// Generates multi-provider email functions with automatic failover

function generateMultiProviderFunctions(config) {
  return `// ===== MULTI-PROVIDER EMAIL SYSTEM WITH FAILOVER =====

/**
 * Send email with automatic failover across multiple providers
 */
function sendEmail(to, subject, htmlContent, textContent) {
  const primaryProvider = getEmailProvider();
  const failoverEnabled = isFailoverEnabled();
  
  // Try primary provider first
  try {
    return sendEmailWithProvider(to, subject, htmlContent, textContent, primaryProvider);
  } catch (error) {
    Logger.log('Primary provider (' + primaryProvider + ') failed: ' + error);
    
    // If failover is disabled, throw the error
    if (!failoverEnabled) {
      throw error;
    }
    
    // Try failover providers
    const providers = CONFIG.PROVIDER_PRIORITY.filter(p => p !== primaryProvider);
    
    for (let i = 0; i < providers.length; i++) {
      const provider = providers[i];
      try {
        Logger.log('Trying failover provider: ' + provider);
        return sendEmailWithProvider(to, subject, htmlContent, textContent, provider);
      } catch (failoverError) {
        Logger.log('Failover provider (' + provider + ') failed: ' + failoverError);
        // Continue to next provider
      }
    }
    
    // All providers failed
    throw new Error('All email providers failed. Last error: ' + error);
  }
}

/**
 * Send email using a specific provider
 */
function sendEmailWithProvider(to, subject, htmlContent, textContent, provider) {
  Logger.log('Attempting to send email via ' + provider + ' to ' + to);
  
  switch (provider) {
    case 'sendgrid':
      return sendEmailViaSendGrid(to, subject, htmlContent, textContent);
    case 'brevo':
      return sendEmailViaBrevo(to, subject, htmlContent, textContent);
    case 'sendpulse':
      return sendEmailViaSendPulse(to, subject, htmlContent, textContent);
    case 'resend':
      return sendEmailViaResend(to, subject, htmlContent, textContent);
    case 'mailersend':
      return sendEmailViaMailerSend(to, subject, htmlContent, textContent);
    case 'mailgun':
      return sendEmailViaMailgun(to, subject, htmlContent, textContent);
    case 'gmail':
      return sendEmailViaGmail(to, subject, htmlContent, textContent);
    default:
      throw new Error('Unknown email provider: ' + provider);
  }
}

/**
 * SendGrid implementation
 */
function sendEmailViaSendGrid(to, subject, htmlContent, textContent) {
  const apiKey = getProviderApiKey('sendgrid');
  if (!apiKey) {
    throw new Error('SENDGRID_API_KEY not configured');
  }
  
  const payload = {
    personalizations: [{
      to: [{ email: to }]
    }],
    from: {
      email: getFromEmail(),
      name: CONFIG.FROM_NAME
    },
    subject: subject,
    content: [
      {
        type: 'text/html',
        value: htmlContent
      },
      {
        type: 'text/plain',
        value: textContent || htmlContent.replace(/<[^>]*>/g, '')
      }
    ]
  };
  
  const options = {
    method: 'post',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch('https://api.sendgrid.com/v3/mail/send', options);
  
  if (response.getResponseCode() !== 202) {
    throw new Error('SendGrid error: ' + response.getContentText());
  }
  
  Logger.log('✓ Email sent via SendGrid to ' + to);
  return true;
}

/**
 * Brevo (Sendinblue) implementation
 */
function sendEmailViaBrevo(to, subject, htmlContent, textContent) {
  const apiKey = getProviderApiKey('brevo');
  if (!apiKey) {
    throw new Error('BREVO_API_KEY not configured');
  }
  
  const payload = {
    sender: {
      email: getFromEmail(),
      name: CONFIG.FROM_NAME
    },
    to: [{ email: to }],
    subject: subject,
    htmlContent: htmlContent,
    textContent: textContent || htmlContent.replace(/<[^>]*>/g, '')
  };
  
  const options = {
    method: 'post',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch('https://api.brevo.com/v3/smtp/email', options);
  const code = response.getResponseCode();
  
  if (code !== 201 && code !== 200) {
    throw new Error('Brevo error: ' + response.getContentText());
  }
  
  Logger.log('✓ Email sent via Brevo to ' + to);
  return true;
}

/**
 * SendPulse implementation (uses OAuth with API ID + Secret)
 */
function sendEmailViaSendPulse(to, subject, htmlContent, textContent) {
  // Get access token (will generate if needed)
  const accessToken = getSendPulseAccessToken();
  
  const payload = {
    email: {
      from: {
        email: getFromEmail(),
        name: CONFIG.FROM_NAME
      },
      to: [{ email: to }],
      subject: subject,
      html: htmlContent,
      text: textContent || htmlContent.replace(/<[^>]*>/g, '')
    }
  };
  
  const options = {
    method: 'post',
    headers: {
      'Authorization': 'Bearer ' + accessToken,
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch('https://api.sendpulse.com/smtp/emails', options);
  const code = response.getResponseCode();
  
  if (code !== 200 && code !== 201) {
    throw new Error('SendPulse error: ' + response.getContentText());
  }
  
  Logger.log('✓ Email sent via SendPulse to ' + to);
  return true;
}

/**
 * Resend implementation
 */
function sendEmailViaResend(to, subject, htmlContent, textContent) {
  const apiKey = getProviderApiKey('resend');
  if (!apiKey) {
    throw new Error('RESEND_API_KEY not configured');
  }
  
  const payload = {
    from: CONFIG.FROM_NAME + ' <' + getFromEmail() + '>',
    to: [to],
    subject: subject,
    html: htmlContent,
    text: textContent || htmlContent.replace(/<[^>]*>/g, '')
  };
  
  const options = {
    method: 'post',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch('https://api.resend.com/emails', options);
  const code = response.getResponseCode();
  
  if (code !== 200) {
    throw new Error('Resend error: ' + response.getContentText());
  }
  
  Logger.log('✓ Email sent via Resend to ' + to);
  return true;
}

/**
 * MailerSend implementation
 */
function sendEmailViaMailerSend(to, subject, htmlContent, textContent) {
  const apiKey = getProviderApiKey('mailersend');
  if (!apiKey) {
    throw new Error('MAILERSEND_API_KEY not configured');
  }
  
  const payload = {
    from: {
      email: getFromEmail(),
      name: CONFIG.FROM_NAME
    },
    to: [{ email: to }],
    subject: subject,
    html: htmlContent,
    text: textContent || htmlContent.replace(/<[^>]*>/g, '')
  };
  
  const options = {
    method: 'post',
    headers: {
      'Authorization': 'Bearer ' + apiKey,
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch('https://api.mailersend.com/v1/email', options);
  const code = response.getResponseCode();
  
  if (code !== 202 && code !== 200) {
    throw new Error('MailerSend error: ' + response.getContentText());
  }
  
  Logger.log('✓ Email sent via MailerSend to ' + to);
  return true;
}

/**
 * Mailgun implementation
 */
function sendEmailViaMailgun(to, subject, htmlContent, textContent) {
  const apiKey = getProviderApiKey('mailgun');
  const domain = getMailgunDomain();
  
  if (!apiKey) {
    throw new Error('MAILGUN_API_KEY not configured');
  }
  if (!domain) {
    throw new Error('MAILGUN_DOMAIN not configured');
  }
  
  const formData = {
    from: CONFIG.FROM_NAME + ' <' + getFromEmail() + '>',
    to: to,
    subject: subject,
    html: htmlContent,
    text: textContent || htmlContent.replace(/<[^>]*>/g, '')
  };
  
  const options = {
    method: 'post',
    headers: {
      'Authorization': 'Basic ' + Utilities.base64Encode('api:' + apiKey)
    },
    payload: formData,
    muteHttpExceptions: true
  };
  
  const response = UrlFetchApp.fetch('https://api.mailgun.net/v3/' + domain + '/messages', options);
  const code = response.getResponseCode();
  
  if (code !== 200) {
    throw new Error('Mailgun error: ' + response.getContentText());
  }
  
  Logger.log('✓ Email sent via Mailgun to ' + to);
  return true;
}

/**
 * Gmail implementation (via GmailApp)
 */
function sendEmailViaGmail(to, subject, htmlContent, textContent) {
  try {
    GmailApp.sendEmail(to, subject, textContent || htmlContent.replace(/<[^>]*>/g, ''), {
      htmlBody: htmlContent,
      name: CONFIG.FROM_NAME
    });
    Logger.log('✓ Email sent via Gmail to ' + to);
    return true;
  } catch (error) {
    throw new Error('Gmail error: ' + error.message);
  }
}`;
}



// ===== newsletter MODULE ===== 
// ===== NEWSLETTER FUNCTIONS MODULE =====
// Generates newsletter sending and scheduling functions

function generateNewsletterFunctions(config) {
  const needsSheet = !config.sheetId || config.sheetId.trim() === '';
  const getSheetCall = needsSheet ? 'getOrCreateSpreadsheet()' : 'getSpreadsheet()';
  
  return `// ===== NEWSLETTER FUNCTIONS =====

/**
 * Send newsletter to all active subscribers
 * Respects warm-up mode and uses multi-provider email system
 */
function sendNewsletter(subject, content) {
  const ss = ${getSheetCall};
  const sheet = ss.getSheetByName(CONFIG.SHEET_NAME) || ss.getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  let sentCount = 0;
  let failedCount = 0;
  
  // Skip header row
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const email = row[1]; // Email column (index 1)
    const status = row[5] || 'active'; // Status column (index 5)
    const name = row[2] || ''; // Name column (index 2)
    
    // Only send to active/verified subscribers
    if ((status === 'active' || status === 'verified') && email) {
      try {
        const htmlContent = getEmailTemplate(content);
        sendEmail(email, subject, htmlContent, content.replace(/<[^>]*>/g, ''));
        sentCount++;
        
        // Respect warm-up mode
        if (CONFIG.WARMUP_MODE) {
          Utilities.sleep(2000); // 2 second delay between emails
        }
      } catch (error) {
        Logger.log('Failed to send to ' + email + ': ' + error);
        failedCount++;
      }
    }
  }
  
  logEvent({
    event: 'NEWSLETTER_SENT',
    details: \`Sent to \${sentCount} subscribers, \${failedCount} failed\`,
    status: sentCount > 0 ? 'SUCCESS' : 'ERROR'
  });
  
  Logger.log('Newsletter sent: ' + sentCount + ' successful, ' + failedCount + ' failed');
  return { sent: sentCount, failed: failedCount };
}

/**
 * Scheduled newsletter send function
 * Set up a time-based trigger for this function based on CONFIG.FREQUENCY
 * 
 * Frequency options:
 * - daily: Set trigger to run daily
 * - weekly: Set trigger to run weekly (e.g., every Monday)
 * - biweekly: Set trigger to run every 2 weeks
 * - monthly: Set trigger to run monthly (e.g., 1st of month)
 */
function scheduledNewsletterSend() {
  ${config.geminiKey ? `
  // Generate AI content if Gemini key is configured
  const aiContent = generateAIContent();
  const content = aiContent || '<p>Weekly update from ' + CONFIG.BRAND_NAME + '</p>';
  ` : `
  // Manual content - edit this each time or use AI if configured
  const content = '<p>Your newsletter content goes here. Edit this function to add your content, or enable AI content generation.</p>';
  `}
  
  const subject = CONFIG.BRAND_NAME + ' Newsletter';
  const result = sendNewsletter(subject, content);
  
  Logger.log('Scheduled newsletter sent: ' + result.sent + ' successful, ' + result.failed + ' failed');
  return result;
}`;
}



// ===== script properties MODULE ===== 
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



// ===== spreadsheet MODULE ===== 
// ===== SPREADSHEET MODULE =====
// Generates spreadsheet initialization and helper functions

function generateSpreadsheetFunctions(config) {
  const needsSheet = !config.sheetId || config.sheetId.trim() === '';
  
  return `// ===== SPREADSHEET FUNCTIONS =====
/**
 * Get the spreadsheet - works with bound scripts (created from sheet) or standalone
 */
function getSpreadsheet() {
  // First, try to get the bound spreadsheet (if script was created from within a sheet)
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) return ss;
  } catch (e) {
    // Not a bound script, try Script Properties
  }
  
  // Fallback: Get spreadsheet ID from Script Properties
  const spreadsheetId = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
  if (spreadsheetId) {
    return SpreadsheetApp.openById(spreadsheetId);
  }
  
  throw new Error('No spreadsheet found. Either run this from a bound script (created from sheet) or set SPREADSHEET_ID in Script Properties.');
}

${needsSheet ? `
/**
 * Auto-create Google Sheet if it doesn't exist
 */
function getOrCreateSpreadsheet() {
  const scriptProps = PropertiesService.getScriptProperties();
  let sheetId = CONFIG.SHEET_ID || scriptProps.getProperty('NEWSLETTER_SHEET_ID');
  
  if (!sheetId) {
    Logger.log('Creating new Google Sheet for newsletter subscribers...');
    
    // Create new spreadsheet
    const ss = SpreadsheetApp.create(CONFIG.BRAND_NAME + ' - Newsletter Subscribers');
    sheetId = ss.getId();
    
    // Set up the main sheet with headers
    const sheet = ss.getActiveSheet();
    sheet.setName(CONFIG.SHEET_NAME);
    sheet.getRange(1, 1, 1, 7).setValues([
      ['Timestamp', 'Email', 'Name', 'Token', 'Source', 'Status', 'Verified Date']
    ]);
    sheet.getRange(1, 1, 1, 7).setFontWeight('bold');
    sheet.getRange(1, 1, 1, 7).setBackground('#4285f4');
    sheet.getRange(1, 1, 1, 7).setFontColor('#ffffff');
    sheet.setFrozenRows(1);
    
    // Create EventLog sheet
    const logSheet = ss.insertSheet('EventLog');
    logSheet.getRange(1, 1, 1, 4).setValues([
      ['Timestamp', 'Event', 'Details', 'Status']
    ]);
    logSheet.getRange(1, 1, 1, 4).setFontWeight('bold');
    logSheet.setFrozenRows(1);
    
    // Save the sheet ID to script properties so we remember it
    scriptProps.setProperty('NEWSLETTER_SHEET_ID', sheetId);
    
    Logger.log('✅ Created new Google Sheet: ' + ss.getUrl());
    Logger.log('📋 Sheet ID saved to Script Properties');
    
    // Return the new spreadsheet
    return ss;
  }
  
  // Sheet already exists, open it
  return SpreadsheetApp.openById(sheetId);
}
` : ''}

/**
 * Initialize Google Sheet with headers if not exists
 */
function initializeSheet() {
  try {
    const ss = ${needsSheet ? 'getOrCreateSpreadsheet()' : 'getSpreadsheet()'};
    let sheet = ss.getSheetByName(CONFIG.SHEET_NAME);
    
    // Create sheet if it doesn't exist
    if (!sheet) {
      sheet = ss.insertSheet(CONFIG.SHEET_NAME);
    }
    
    // Set headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp',
        'Email',
        'Name',
        'Token',
        'Source',
        'Status',
        'Verified Date'
      ]);
      
      // Format header row
      const headerRange = sheet.getRange(1, 1, 1, 7);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#4285f4');
      headerRange.setFontColor('#ffffff');
      sheet.setFrozenRows(1);
    }
    
    return sheet;
  } catch (error) {
    Logger.log('Error initializing sheet: ' + error);
    throw new Error('Could not access Google Sheet. Make sure you run this script from within a Google Sheet (Extensions → Apps Script).');
  }
}

/**
 * Get or create a sheet by name
 */
function getOrMakeSheet(name) {
  const ss = ${needsSheet ? 'getOrCreateSpreadsheet()' : 'getSpreadsheet()'};
  let sh = ss.getSheetByName(name);
  if (!sh) sh = ss.insertSheet(name);
  return sh;
}

/**
 * Log events to EventLog sheet
 */
function logEvent(data) {
  const sh = getOrMakeSheet('EventLog');
  if (sh.getLastRow() === 0) {
    sh.appendRow(['Timestamp', 'Event', 'Details', 'Status']);
    sh.getRange(1, 1, 1, 4).setFontWeight('bold');
  }
  sh.appendRow([
    new Date(),
    data.event || '',
    data.details || '',
    data.status || 'INFO'
  ]);
}

/**
 * Add subscriber to Google Sheet
 */
function addToSheet(email, name, token, source, status) {
  try {
    const sheet = initializeSheet();
    const timestamp = new Date();
    
    sheet.appendRow([
      timestamp,
      email,
      name || '',
      token || '',
      source || 'direct',
      status || 'active',
      ''
    ]);
    
    Logger.log('Added ' + email + ' to sheet with status: ' + (status || 'active'));
    return true;
  } catch (error) {
    Logger.log('Error adding to sheet: ' + error);
    throw error;
  }
}

/**
 * Update subscriber status in sheet
 */
function updateSubscriberStatus(email, status) {
  try {
    const sheet = initializeSheet();
    const data = sheet.getDataRange().getValues();
    
    // Find the email and update status
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] && data[i][1].toLowerCase() === email.toLowerCase()) {
        // Update status column (column 6, index 5)
        sheet.getRange(i + 1, 6).setValue(status);
        if (status === 'verified') {
          sheet.getRange(i + 1, 7).setValue(new Date()); // Update verified date
        }
        Logger.log('Updated ' + email + ' status to: ' + status);
        return true;
      }
    }
    
    Logger.log('Email not found in sheet: ' + email);
    return false;
  } catch (error) {
    Logger.log('Error updating subscriber status: ' + error);
    return false;
  }
}

/**
 * Check if email already exists in sheet
 */
function emailExists(email) {
  try {
    const sheet = initializeSheet();
    const data = sheet.getDataRange().getValues();
    
    // Skip header row
    for (let i = 1; i < data.length; i++) {
      if (data[i][1] && data[i][1].toLowerCase() === email.toLowerCase()) {
        return true;
      }
    }
    return false;
  } catch (error) {
    Logger.log('Error checking email: ' + error);
    return false;
  }
}

/**
 * Get the spreadsheet URL (useful for showing users where their data is)
 */
function getSpreadsheetUrl() {
  const ss = ${needsSheet ? 'getOrCreateSpreadsheet()' : 'getSpreadsheet()'};
  return ss.getUrl();
}`;
}



// ===== templates MODULE ===== 
// ===== EMAIL TEMPLATES MODULE =====
// Generates email template functions (all 3 templates: newsletter, story, minimal)

function generateTemplateFunctions(config) {
  return `// ===== EMAIL TEMPLATES =====
/**
 * Get email template based on CONFIG.TEMPLATE setting
 * Returns HTML wrapped in selected template design
 */
function getEmailTemplate(content) {
  const templates = {
    newsletter: \`
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background: white; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; color: white; }
          .content { padding: 30px 20px; line-height: 1.6; color: #333; }
          .footer { background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">\${CONFIG.BRAND_NAME}</h1>
          </div>
          <div class="content">
            \${content}
          </div>
          <div class="footer">
            <p>You're receiving this because you subscribed to \${CONFIG.BRAND_NAME}</p>
            <p><a href="#">Unsubscribe</a></p>
          </div>
        </div>
      </body>
      </html>
    \`,
    
    story: \`
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #000; color: white; }
          .container { max-width: 480px; margin: 0 auto; }
          .content { padding: 20px; font-size: 16px; line-height: 1.5; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="content">
            \${content}
          </div>
          <div class="footer">
            <p>\${CONFIG.BRAND_NAME}</p>
          </div>
        </div>
      </body>
      </html>
    \`,
    
    minimal: \`
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { margin: 0; padding: 20px; font-family: Georgia, serif; background: white; color: #333; line-height: 1.8; }
          .container { max-width: 600px; margin: 0 auto; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #999; }
        </style>
      </head>
      <body>
        <div class="container">
          \${content}
          <div class="footer">
            <p>\${CONFIG.BRAND_NAME}</p>
          </div>
        </div>
      </body>
      </html>
    \`
  };
  
  return templates[CONFIG.TEMPLATE].replace('\\\${content}', content);
}`;
}



// ===== test functions MODULE ===== 
// ===== TEST FUNCTIONS MODULE =====
// Generates test and utility functions

function generateTestFunctions(config) {
  const needsSheet = !config.sheetId || config.sheetId.trim() === '';
  const getSheetCall = needsSheet ? 'getOrCreateSpreadsheet()' : 'getSpreadsheet()';
  
  return `// ===== TEST FUNCTIONS =====

/**
 * Show spreadsheet URL and information
 * Run this to see where your Google Sheet is located
 */
function showMySpreadsheet() {
  const ss = ${getSheetCall};
  const url = ss.getUrl();
  Logger.log('📊 Your Newsletter Spreadsheet: ' + url);
  Logger.log('Sheet ID: ' + ss.getId());
  Logger.log('Sheet Name: ' + ss.getName());
  
  return {
    url: url,
    sheetId: ss.getId(),
    name: ss.getName()
  };
}

/**
 * Test webhook function
 * Simulates a ManyChat submission for testing
 */
function testWebhook() {
  const testData = {
    parameter: {
      source: 'test',
      first_name: 'Test',
      name: 'Test User',
      email: 'test@example.com'
    }
  };
  
  const result = doPost(testData);
  Logger.log('Test webhook result: ' + result.getContent());
  Logger.log('Run showMySpreadsheet() to see where your data went!');
  return result.getContent();
}

/**
 * Send test newsletter
 * Sends a test email to the FROM_EMAIL address
 */
function sendTestNewsletter() {
  const subject = 'Test Newsletter from ' + CONFIG.BRAND_NAME;
  const content = '<h2>Test Newsletter</h2><p>This is a test newsletter. If you're seeing this, everything is working correctly!</p><p>Your email system is configured properly.</p>';
  
  try {
    const htmlContent = getEmailTemplate(content);
    sendEmail(getFromEmail(), subject, htmlContent, content.replace(/<[^>]*>/g, ''));
    Logger.log('✓ Test newsletter sent to: ' + getFromEmail());
    Logger.log('Check your inbox!');
    return 'Test newsletter sent successfully to ' + getFromEmail();
  } catch (error) {
    Logger.log('Error sending test newsletter: ' + error);
    return 'Error: ' + error.toString();
  }
}

/**
 * Test email sending with all providers
 * This will try to send a test email via each configured provider
 */
function testAllProviders() {
  const testEmail = getFromEmail();
  const subject = 'Provider Test from ' + CONFIG.BRAND_NAME;
  const content = '<p>This is a provider test email.</p>';
  const htmlContent = getEmailTemplate(content);
  const textContent = content.replace(/<[^>]*>/g, '');
  
  const results = {};
  const providers = CONFIG.PROVIDER_PRIORITY;
  
  for (let i = 0; i < providers.length; i++) {
    const provider = providers[i];
    try {
      sendEmailWithProvider(testEmail, subject, htmlContent, textContent, provider);
      results[provider] = '✓ Success';
      Logger.log(provider + ': ✓ Success');
    } catch (error) {
      results[provider] = '✗ Failed: ' + error.toString();
      Logger.log(provider + ': ✗ Failed - ' + error.toString());
    }
  }
  
  return results;
}

${config.verification ? `
/**
 * Manual verification function (if verification is enabled)
 * Use this to manually verify a user
 */
function manualVerify(email) {
  if (!email || !isValidEmail(email)) {
    return 'Invalid email address';
  }
  
  const sheet = initializeSheet();
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    const sheetEmail = data[i][1] ? data[i][1].toLowerCase() : '';
    if (sheetEmail === email.toLowerCase()) {
      const currentStatus = data[i][5] || 'pending';
      
      if (currentStatus === 'verified') {
        return 'Email already verified: ' + email;
      }
      
      // Update status to verified
      updateSubscriberStatus(email, 'verified');
      sheet.getRange(i + 1, 7).setValue(new Date());
      
      // Send welcome email
      const name = data[i][2] || '';
      sendDownloadEmail(email, name);
      
      Logger.log('Manually verified: ' + email);
      return '✓ Verified and sent welcome email to ' + email;
    }
  }
  
  return 'Email not found in sheet: ' + email;
}
` : ''}

${config.gmail ? `
/**
 * Test Gmail access (if Gmail detection is enabled)
 */
function testGmailAccess() {
  try {
    const threads = GmailApp.getInboxThreads(0, 1);
    Logger.log('Gmail access works! Found ' + threads.length + ' threads');
    return '✓ Gmail permissions granted! Found ' + threads.length + ' inbox threads';
  } catch (error) {
    Logger.log('Gmail error: ' + error);
    return 'Error: ' + error.message + ' - Run this to get Gmail permissions';
  }
}
` : ''}`;
}



// ===== tokens MODULE ===== 
// ===== TOKEN MANAGEMENT MODULE =====
// Generates token management functions (only included if verification is enabled)

function generateTokenFunctions(config) {
  const needsSheet = !config.sheetId || config.sheetId.trim() === '';
  
  return `// ===== TOKEN MANAGEMENT =====
// Tokens are stored in Google Sheet (not Script Properties - which is for config only)

/**
 * Generate and store a unique access token
 * Tokens are stored in the Google Sheet, not Script Properties (which is for config only)
 */
function generateToken(email) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const token = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    email + timestamp + random
  ).map(function(byte) {
    return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('').substring(0, 32);
  
  // Store token in Google Sheet (not Script Properties!)
  // Create a "Tokens" sheet if it doesn't exist
  try {
    const ss = ${needsSheet ? 'getOrCreateSpreadsheet()' : 'getSpreadsheet()'};
    let tokenSheet = ss.getSheetByName('Tokens');
    
    if (!tokenSheet) {
      tokenSheet = ss.insertSheet('Tokens');
      tokenSheet.appendRow(['Token', 'Email', 'Created', 'Expires']);
      // Format header
      const headerRange = tokenSheet.getRange(1, 1, 1, 4);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#ff9800');
      headerRange.setFontColor('#ffffff');
    }
    
    // Store token with expiration (24 hours)
    const expiration = timestamp + (24 * 60 * 60 * 1000);
    tokenSheet.appendRow([
      token,
      email,
      new Date(timestamp),
      new Date(expiration)
    ]);
    
    // Clean up old expired tokens (keep sheet tidy)
    cleanupExpiredTokens(tokenSheet);
    
  } catch (error) {
    Logger.log('Error storing token in sheet: ' + error);
    // Fallback: if sheet fails, we can't store token, but still return it
    // The token validation will fail, but at least the system won't crash
  }
  
  return token;
}

/**
 * Validate and retrieve token information from Google Sheet
 */
function validateToken(token) {
  if (!token) return null;
  
  try {
    const ss = ${needsSheet ? 'getOrCreateSpreadsheet()' : 'getSpreadsheet()'};
    const tokenSheet = ss.getSheetByName('Tokens');
    
    if (!tokenSheet) return null;
    
    const data = tokenSheet.getDataRange().getValues();
    const now = Date.now();
    
    // Skip header row, search for token
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === token) {
        const email = data[i][1];
        const expiration = new Date(data[i][3]).getTime();
        
        // Check if expired
        if (now > expiration) {
          // Delete expired token
          tokenSheet.deleteRow(i + 1);
          return null;
        }
        
        return { email: email, expiration: expiration };
      }
    }
    
    return null;
  } catch (error) {
    Logger.log('Error validating token: ' + error);
    return null;
  }
}

/**
 * Delete token after use
 */
function deleteToken(token) {
  try {
    const ss = ${needsSheet ? 'getOrCreateSpreadsheet()' : 'getSpreadsheet()'};
    const tokenSheet = ss.getSheetByName('Tokens');
    
    if (!tokenSheet) return;
    
    const data = tokenSheet.getDataRange().getValues();
    
    // Find and delete token
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === token) {
        tokenSheet.deleteRow(i + 1);
        return;
      }
    }
  } catch (error) {
    Logger.log('Error deleting token: ' + error);
  }
}

/**
 * Clean up expired tokens from the Tokens sheet
 */
function cleanupExpiredTokens(tokenSheet) {
  try {
    const data = tokenSheet.getDataRange().getValues();
    const now = Date.now();
    let deletedCount = 0;
    
    // Start from bottom to avoid index issues when deleting rows
    for (let i = data.length - 1; i >= 1; i--) {
      if (data[i][3]) { // If expiration exists
        const expiration = new Date(data[i][3]).getTime();
        if (now > expiration) {
          tokenSheet.deleteRow(i + 1);
          deletedCount++;
        }
      }
    }
    
    if (deletedCount > 0) {
      Logger.log('Cleaned up ' + deletedCount + ' expired tokens');
    }
  } catch (error) {
    Logger.log('Error cleaning up tokens: ' + error);
  }
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
  return emailRegex.test(email);
}`;
}



// ===== verification MODULE ===== 
// ===== EMAIL VERIFICATION WORKFLOW MODULE =====
// Generates verification workflow functions (only included if verification is enabled)

function generateVerificationFunctions(config) {
  // Escape function for template strings
  const escapeForTemplate = (str) => {
    if (!str) return '';
    return str.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\${/g, '\\${');
  };
  
  return `// ===== EMAIL VERIFICATION WORKFLOW =====
// This workflow sends a warming email, waits for reply, then sends downloads

/**
 * Send warming email after form submission (asks them to reply)
 */
function sendWarmingEmail(email, name) {
  const htmlContent = \`<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #667eea;">Hey \${name || 'there'}! 👋</h2>
    <p>Thanks for subscribing to \${CONFIG.BRAND_NAME}!</p>
    <p>Quick question: Are you actively interested in receiving our updates and content?</p>
    <p>Just reply "yes" or say hi, and we'll make sure you're on the list!</p>
    <p>Looking forward to hearing from you!</p>
    <p>Best,<br>\${CONFIG.BRAND_NAME}</p>
  </div>
</body>
</html>\`;
  
  const textContent = \`Hey \${name || 'there'}! 👋\\n\\nThanks for subscribing to \${CONFIG.BRAND_NAME}!\\n\\nQuick question: Are you actively interested in receiving our updates and content?\\n\\nJust reply "yes" or say hi, and we'll make sure you're on the list!\\n\\nLooking forward to hearing from you!\\n\\nBest,\\n\${CONFIG.BRAND_NAME}\`;
  
  return sendEmail(
    email,
    'Quick question from ' + CONFIG.BRAND_NAME + '? 👋',
    htmlContent,
    textContent
  );
}

/**
 * Send welcome/download email after verification
 * Customize this based on your needs (downloads, welcome content, etc.)
 */
function sendDownloadEmail(email, name) {
  const htmlContent = \`<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <h2 style="color: #667eea;">Welcome to \${CONFIG.BRAND_NAME}! 🎉</h2>
    <p>Hi \${name || 'there'},</p>
    <p>Thank you for confirming! You're now subscribed to our newsletter.</p>
    <p>We're excited to share valuable content with you.</p>
    <p>Best,<br>\${CONFIG.BRAND_NAME}</p>
  </div>
</body>
</html>\`;
  
  const textContent = \`Welcome to \${CONFIG.BRAND_NAME}! 🎉\\n\\nHi \${name || 'there'},\\n\\nThank you for confirming! You're now subscribed to our newsletter.\\n\\nWe're excited to share valuable content with you.\\n\\nBest,\\n\${CONFIG.BRAND_NAME}\`;
  
  return sendEmail(
    email,
    'Welcome to ' + CONFIG.BRAND_NAME + '! 🎉',
    htmlContent,
    textContent
  );
}

/**
 * Manual verification function (can be called directly)
 * Use this to manually verify a user and send welcome email
 * 
 * Example: manualVerify('user@example.com')
 */
function manualVerify(email) {
  if (!email || !isValidEmail(email)) {
    return 'Invalid email address';
  }
  
  const sheet = initializeSheet();
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    const sheetEmail = data[i][1] ? data[i][1].toLowerCase() : '';
    if (sheetEmail === email.toLowerCase()) {
      const currentStatus = data[i][5] || 'pending';
      
      if (currentStatus === 'verified') {
        return 'Email already verified: ' + email;
      }
      
      // Update status to verified
      updateSubscriberStatus(email, 'verified');
      sheet.getRange(i + 1, 7).setValue(new Date());
      
      // Send welcome email
      const name = data[i][2] || '';
      sendDownloadEmail(email, name);
      
      Logger.log('Manually verified: ' + email);
      return '✓ Verified and sent welcome email to ' + email;
    }
  }
  
  return 'Email not found in sheet: ' + email;
}`;
}



// ===== weuhook MODULE ===== 
// ===== WEBHOOK HANDLER MODULE =====
// Generates webhook handler for ManyChat and direct form submissions

function generateWebhookHandler(config) {
  const needsSheet = !config.sheetId || config.sheetId.trim() === '';
  const getSheetCall = needsSheet ? 'getOrCreateSpreadsheet()' : 'getSpreadsheet()';
  
  return `// ===== WEBHOOK HANDLER =====
/**
 * Main doPost function - handles POST requests (webhooks from ManyChat, forms, etc.)
 */
function doPost(e) {
  try {
    const ss = ${getSheetCall};
    const sheet = initializeSheet();
    
    // Handle ManyChat submissions (URL parameters)
    if (e.parameter && e.parameter.email) {
      const email = e.parameter.email.trim().toLowerCase();
      const name = (e.parameter.first_name || e.parameter.name || '').trim();
      const source = e.parameter.source || 'manychat';
      
      // Validate email
      if (!isValidEmail(email)) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: 'Invalid email address'
        })).setMimeType(ContentService.MimeType.JSON);
      }
      
      // Check if email already exists
      if (emailExists(email)) {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: 'This email is already subscribed'
        })).setMimeType(ContentService.MimeType.JSON);
      }
      
      // Determine initial status based on verification setting
      const initialStatus = CONFIG.ENABLE_VERIFICATION ? 'pending' : 'active';
      
      // Generate token if verification is enabled
      const token = CONFIG.ENABLE_VERIFICATION ? generateToken(email) : '';
      
      // Add to sheet
      addToSheet(email, name, token, source, initialStatus);
      
      logEvent({
        event: 'NEW_SUBSCRIBER',
        details: email + ' from ' + source,
        status: 'SUCCESS'
      });
      
      // Send warming email if verification is enabled
      if (CONFIG.ENABLE_VERIFICATION) {
        try {
          sendWarmingEmail(email, name);
          Logger.log('Warming email sent to: ' + email);
        } catch (emailError) {
          Logger.log('Error sending warming email: ' + emailError);
        }
      }
      
      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        message: 'Subscriber added',
        status: initialStatus,
        sheet_url: ss.getUrl()
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Handle JSON POST requests (direct form submissions)
    if (e.postData && e.postData.contents) {
      try {
        const postData = JSON.parse(e.postData.contents);
        const email = (postData.email || '').trim().toLowerCase();
        const name = (postData.name || '').trim();
        const source = postData.source || 'direct';
        
        // Validate email
        if (!isValidEmail(email)) {
          return ContentService.createTextOutput(JSON.stringify({
            success: false,
            error: 'Invalid email address'
          })).setMimeType(ContentService.MimeType.JSON);
        }
        
        // Check if email already exists
        if (emailExists(email)) {
          return ContentService.createTextOutput(JSON.stringify({
            success: false,
            error: 'This email is already subscribed'
          })).setMimeType(ContentService.MimeType.JSON);
        }
        
        // Determine initial status
        const initialStatus = CONFIG.ENABLE_VERIFICATION ? 'pending' : 'active';
        const token = CONFIG.ENABLE_VERIFICATION ? generateToken(email) : '';
        
        // Add to sheet
        addToSheet(email, name, token, source, initialStatus);
        
        logEvent({
          event: 'NEW_SUBSCRIBER',
          details: email + ' from ' + source,
          status: 'SUCCESS'
        });
        
        // Send warming email if verification is enabled
        if (CONFIG.ENABLE_VERIFICATION) {
          try {
            sendWarmingEmail(email, name);
            Logger.log('Warming email sent to: ' + email);
          } catch (emailError) {
            Logger.log('Error sending warming email: ' + emailError);
          }
        }
        
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          message: 'Subscriber added',
          status: initialStatus,
          sheet_url: ss.getUrl()
        })).setMimeType(ContentService.MimeType.JSON);
      } catch (parseError) {
        Logger.log('Error parsing JSON: ' + parseError);
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          error: 'Invalid JSON data'
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // Invalid request
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: 'Invalid request format'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error in doPost: ' + error);
    
    logEvent({
      event: 'ERROR',
      details: error.toString(),
      status: 'ERROR'
    });
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: 'Internal server error: ' + error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}`;
}



// ===== MK3 CODE GENERATOR - MAIN FILE =====
// Combines all modules to generate complete Google Apps Script code

// This function combines all modules into a single generated script
function generateMK3Script(config) {
  // Build the complete script by combining all modules
  const parts = [];
  
  // Header comment
  parts.push(`/**
 * MK3 Newsletter Automation Script
 * Generated by Advanced Dashboard
 * 
 * Features:
 * - Multi-provider email system with automatic failover
 * ${config.verification ? '- Email verification workflow (warming email → reply → download)' : ''}
 * ${config.gmail ? '- Gmail reply detection with automatic triggers' : ''}
 * ${config.geminiKey ? '- AI content generation with Gemini' : ''}
 * - Newsletter scheduling and automation
 * - ManyChat webhook support
 * - Advanced token management
 * - ${config.template === 'newsletter' ? 'Classic Newsletter' : config.template === 'story' ? 'Story Style' : 'Personal Letter'} template
 * 
 * Brand: ${config.brandName}
 * Generated: ${new Date().toISOString()}
 */

`);
  
  // 1. Configuration
  parts.push(generateConfig(config));
  parts.push('\n');
  
  // 2. Script Properties Functions
  parts.push(generateScriptPropertiesFunctions(config));
  parts.push('\n');
  
  // 3. Spreadsheet Functions
  parts.push(generateSpreadsheetFunctions(config));
  parts.push('\n');
  
  // 4. Token Management (if verification enabled)
  if (config.verification) {
    parts.push(generateTokenFunctions(config));
    parts.push('\n');
  }
  
  // 5. Multi-Provider Email System
  parts.push(generateMultiProviderFunctions(config));
  parts.push('\n');
  
  // 6. Email Verification Workflow (if enabled)
  if (config.verification) {
    parts.push(generateVerificationFunctions(config));
    parts.push('\n');
  }
  
  // 7. Gmail Triggers (if enabled)
  if (config.gmail) {
    parts.push(generateGmailTriggerFunctions(config));
    parts.push('\n');
  }
  
  // 8. Email Templates
  parts.push(generateTemplateFunctions(config));
  parts.push('\n');
  
  // 9. AI Content Generation (if Gemini key provided)
  if (config.geminiKey) {
    parts.push(generateAIContentFunctions(config));
    parts.push('\n');
  }
  
  // 10. Newsletter Functions
  parts.push(generateNewsletterFunctions(config));
  parts.push('\n');
  
  // 11. Webhook Handler
  parts.push(generateWebhookHandler(config));
  parts.push('\n');
  
  // 12. Test Functions
  parts.push(generateTestFunctions(config));
  parts.push('\n');
  
  // Footer comment
  parts.push(`// ===== END OF SCRIPT =====
// 
// Next Steps:
// 1. Add API keys to Script Properties (see instructions in code)
// 2. Deploy as Web App
// 3. ${config.gmail ? 'Run setupAllTriggers() to enable Gmail reply detection' : ''}
// 4. Connect ManyChat webhook (if using ManyChat)
// 5. Test with testWebhook() and sendTestNewsletter()
//
// Generated by MK3 Dashboard
`);
  
  return parts.join('\n');
}

// NOTE: All module functions are defined in separate files in the modules/ directory
// In a browser environment, these would be loaded via <script> tags before this file
// For now, the functions are assumed to be available in the global scope
// 
// Module functions (loaded from modules/):
// - generateConfig(config)
// - generateScriptPropertiesFunctions(config)
// - generateSpreadsheetFunctions(config)
// - generateTokenFunctions(config)
// - generateMultiProviderFunctions(config)
// - generateVerificationFunctions(config)
// - generateGmailTriggerFunctions(config)
// - generateTemplateFunctions(config)
// - generateAIContentFunctions(config)
// - generateNewsletterFunctions(config)
// - generateWebhookHandler(config)
// - generateTestFunctions(config)

