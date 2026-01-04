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


