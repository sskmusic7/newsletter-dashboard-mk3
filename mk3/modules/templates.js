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


