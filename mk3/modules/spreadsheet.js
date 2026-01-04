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


