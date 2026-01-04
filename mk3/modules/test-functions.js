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


