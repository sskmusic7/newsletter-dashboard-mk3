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


