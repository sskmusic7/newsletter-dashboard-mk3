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


