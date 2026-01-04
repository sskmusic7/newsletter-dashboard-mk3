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


