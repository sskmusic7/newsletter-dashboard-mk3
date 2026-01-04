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


