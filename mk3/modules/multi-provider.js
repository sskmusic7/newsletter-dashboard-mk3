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


