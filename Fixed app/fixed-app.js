// ===== MK3 DASHBOARD - MAIN APP.JS (FIXED VERSION) =====
// This fixes the issue where code was showing on the HTML pages

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('dashboardForm');
    const generateBtn = document.getElementById('generateBtn');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Disable button
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<span class="loader"></span> Generating...';
        
        try {
            // Collect form data
            const config = {
                brandName: document.getElementById('brandName').value.trim(),
                brandBio: document.getElementById('brandBio').value.trim(),
                brandVoice: document.getElementById('brandVoice').value.trim(),
                sampleContent: document.getElementById('sampleContent').value.trim(),
                emailProvider: document.getElementById('emailProvider').value,
                senderEmail: document.getElementById('senderEmail').value.trim(),
                template: document.querySelector('input[name="template"]:checked').value,
                frequency: document.getElementById('frequency').value,
                warmup: document.getElementById('warmup').checked,
                verification: document.getElementById('verification').checked,
                gmail: document.getElementById('gmail').checked,
                sheetId: document.getElementById('sheetId').value.trim(),
                geminiKey: document.getElementById('geminiKey').value.trim()
            };
            
            // Generate the complete code package
            const codePackage = generateCompletePackage(config);
            
            // Create download
            downloadCodePackage(codePackage, config.brandName);
            
            // Show success message
            showSuccessMessage();
            
        } catch (error) {
            console.error('Generation error:', error);
            alert('Error generating code: ' + error.message);
        } finally {
            // Re-enable button
            generateBtn.disabled = false;
            generateBtn.innerHTML = '🚀 Generate MK3 Script';
        }
    });
});

function generateCompletePackage(config) {
    // Generate all components
    const appsScript = generateMK3Script(config);
    const htmlFiles = generateHTMLFiles(config);
    const instructions = generateInstructions(config);
    
    return {
        'Code.gs': appsScript,
        'index.html': htmlFiles.index,
        'thank-you.html': htmlFiles.thankYou,
        'INSTRUCTIONS.md': instructions
    };
}

function generateHTMLFiles(config) {
    // FIXED: Properly generate HTML without code leakage
    const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Subscribe - ${escapeHtml(config.brandName)}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 500px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        
        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 28px;
        }
        
        .subtitle {
            color: #666;
            margin-bottom: 30px;
            line-height: 1.6;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: 500;
        }
        
        input {
            width: 100%;
            padding: 12px 15px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 16px;
            transition: border-color 0.3s;
        }
        
        input:focus {
            outline: none;
            border-color: #667eea;
        }
        
        button {
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
        }
        
        button:active {
            transform: translateY(0);
        }
        
        button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        
        .message {
            margin-top: 15px;
            padding: 12px;
            border-radius: 8px;
            display: none;
        }
        
        .message.success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .message.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        
        .loader {
            display: none;
            width: 20px;
            height: 20px;
            border: 3px solid #ffffff;
            border-top-color: transparent;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
            margin: 0 auto;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Subscribe to ${escapeHtml(config.brandName)}</h1>
        <p class="subtitle">${escapeHtml(config.brandBio || 'Get the latest updates and exclusive content delivered to your inbox.')}</p>
        
        <form id="subscribeForm">
            <div class="form-group">
                <label for="name">Name</label>
                <input type="text" id="name" name="name" required placeholder="Your name">
            </div>
            
            <div class="form-group">
                <label for="email">Email Address</label>
                <input type="email" id="email" name="email" required placeholder="you@example.com">
            </div>
            
            <button type="submit" id="submitBtn">
                <span id="btnText">Subscribe</span>
                <div class="loader" id="loader"></div>
            </button>
        </form>
        
        <div class="message" id="message"></div>
    </div>

    <script>
        (function() {
            const form = document.getElementById('subscribeForm');
            const submitBtn = document.getElementById('submitBtn');
            const btnText = document.getElementById('btnText');
            const loader = document.getElementById('loader');
            const message = document.getElementById('message');
            
            const scriptUrl = window.location.href.split('?')[0];
            
            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const name = document.getElementById('name').value.trim();
                const email = document.getElementById('email').value.trim();
                
                submitBtn.disabled = true;
                btnText.style.display = 'none';
                loader.style.display = 'block';
                message.style.display = 'none';
                
                try {
                    const response = await fetch(scriptUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            name: name,
                            email: email,
                            source: 'web_form'
                        })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        window.location.href = scriptUrl + '?thankyou=true';
                    } else {
                        throw new Error(data.error || 'Subscription failed');
                    }
                } catch (error) {
                    message.textContent = error.message || 'Something went wrong. Please try again.';
                    message.className = 'message error';
                    message.style.display = 'block';
                    
                    submitBtn.disabled = false;
                    btnText.style.display = 'block';
                    loader.style.display = 'none';
                }
            });
        })();
    </script>
</body>
</html>`;

    const thankYouHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank You - ${escapeHtml(config.brandName)}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 20px;
            padding: 50px 40px;
            max-width: 500px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
        }
        
        .checkmark {
            width: 80px;
            height: 80px;
            margin: 0 auto 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: scaleIn 0.5s ease-out;
        }
        
        .checkmark svg {
            width: 50px;
            height: 50px;
            stroke: white;
            stroke-width: 3;
            fill: none;
            stroke-dasharray: 100;
            stroke-dashoffset: 100;
            animation: drawCheck 0.8s ease-out 0.3s forwards;
        }
        
        @keyframes scaleIn {
            from { transform: scale(0); }
            to { transform: scale(1); }
        }
        
        @keyframes drawCheck {
            to { stroke-dashoffset: 0; }
        }
        
        h1 {
            color: #333;
            margin-bottom: 15px;
            font-size: 32px;
        }
        
        .subtitle {
            color: #666;
            line-height: 1.6;
            margin-bottom: 30px;
            font-size: 16px;
        }
        
        .next-steps {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 25px;
            margin-top: 30px;
            text-align: left;
        }
        
        .next-steps h3 {
            color: #333;
            margin-bottom: 15px;
            font-size: 18px;
        }
        
        .next-steps ul {
            list-style: none;
            padding-left: 0;
        }
        
        .next-steps li {
            padding: 10px 0;
            color: #555;
            position: relative;
            padding-left: 30px;
        }
        
        .next-steps li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #667eea;
            font-weight: bold;
            font-size: 18px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="checkmark">
            <svg viewBox="0 0 52 52">
                <polyline points="12,26 22,36 40,16"/>
            </svg>
        </div>
        
        <h1>You're All Set! 🎉</h1>
        <p class="subtitle">
            Thank you for subscribing to ${escapeHtml(config.brandName)}! 
            ${config.verification ? 
                "We've sent you a welcome email. Please reply to it to confirm your subscription and get your exclusive content." : 
                "You'll start receiving our updates soon."}
        </p>
        
        <div class="next-steps">
            <h3>What's Next?</h3>
            <ul>
                ${config.verification ? `
                <li>Check your inbox for our welcome email</li>
                <li>Reply to the email to confirm your subscription</li>
                <li>Get instant access to exclusive content</li>
                ` : `
                <li>Check your inbox for our welcome email</li>
                <li>Look out for regular updates from us</li>
                <li>Enjoy exclusive content and insights</li>
                `}
            </ul>
        </div>
    </div>
</body>
</html>`;

    return {
        index: indexHtml,
        thankYou: thankYouHtml
    };
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function generateInstructions(config) {
    return `# MK3 Newsletter Automation - Setup Instructions

## 📦 What You Generated

You've successfully generated a complete newsletter automation system with:
- ✅ Multi-provider email system
- ✅ ${config.verification ? 'Email verification workflow' : 'Direct subscription'}
- ✅ ${config.gmail ? 'Gmail reply detection' : 'Standard email handling'}
- ✅ ${config.geminiKey ? 'AI content generation' : 'Manual content creation'}
- ✅ ${config.template} template
- ✅ ManyChat webhook support

## 🚀 Setup Steps

### 1. Create Google Apps Script Project
1. Go to [script.google.com](https://script.google.com)
2. Click "New Project"
3. Name it "${config.brandName} Newsletter"

### 2. Add the Files
1. Delete the default Code.gs content
2. Paste the content from your generated **Code.gs** file
3. Click the + next to Files
4. Add **index.html** (paste content from generated file)
5. Add **thank-you.html** (paste content from generated file)

### 3. Configure Script Properties
1. In Apps Script, click **Project Settings** (gear icon)
2. Scroll to **Script Properties**
3. Click **Add script property** and add:

${config.geminiKey ? `**GEMINI_API_KEY**
Value: ${config.geminiKey}
` : ''}
**PRIMARY_EMAIL_PROVIDER**
Value: ${config.emailProvider}

**${config.emailProvider.toUpperCase()}_API_KEY**
Value: [Your ${config.emailProvider} API key]

**SENDER_EMAIL**
Value: ${config.senderEmail}

### 4. Deploy as Web App
1. Click **Deploy** > **New deployment**
2. Click the gear icon next to "Select type"
3. Choose **Web app**
4. Set:
   - Description: "MK3 Newsletter v1"
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Click **Deploy**
6. Copy the Web App URL (you'll need this!)

### 5. ${config.gmail ? 'Enable Gmail Triggers' : 'Test the System'}
${config.gmail ? `
1. Run the \`setupAllTriggers()\` function once
2. This enables automatic Gmail reply detection
` : `
1. Run \`testWebhook()\` to test subscriptions
2. Run \`sendTestNewsletter()\` to test email sending
`}

### 6. Connect ManyChat (Optional)
1. In ManyChat, create a Flow
2. Add an **Action** > **Send to Google Sheets**
3. Paste your Web App URL
4. Add these fields:
   - email={{user_email}}
   - first_name={{first_name}}
   - source=manychat

## 📊 Your Google Sheet
${config.sheetId ? `
Your data will be stored in: https://docs.google.com/spreadsheets/d/${config.sheetId}
` : `
A new Google Sheet will be automatically created on first run!
`}

## 🔐 API Key Resources
- **SendPulse**: https://login.sendpulse.com/settings/
- **Gemini AI**: https://ai.google.dev

## ⚠️ Important Notes
- API keys are stored securely in Script Properties (not in code)
- ${config.verification ? 'Users must reply to the welcome email to get verified' : 'Users are immediately added to your list'}
- Test everything before going live!

## 🆘 Troubleshooting
- If emails aren't sending: Check Script Properties are set correctly
- If form doesn't work: Make sure Web App is deployed with "Anyone" access
- For Gmail triggers: Run setupAllTriggers() once manually

## 📞 Need Help?
Generated by MK3 Dashboard - ${new Date().toISOString()}
Brand: ${config.brandName}

Happy automating! 🚀
`;
}

function downloadCodePackage(codePackage, brandName) {
    // Create a zip-like text file with all code
    let combinedContent = '='.repeat(80) + '\n';
    combinedContent += 'MK3 NEWSLETTER AUTOMATION - COMPLETE CODE PACKAGE\n';
    combinedContent += 'Brand: ' + brandName + '\n';
    combinedContent += 'Generated: ' + new Date().toISOString() + '\n';
    combinedContent += '='.repeat(80) + '\n\n';
    
    for (const [filename, content] of Object.entries(codePackage)) {
        combinedContent += '\n' + '='.repeat(80) + '\n';
        combinedContent += 'FILE: ' + filename + '\n';
        combinedContent += '='.repeat(80) + '\n\n';
        combinedContent += content + '\n\n';
    }
    
    // Create download
    const blob = new Blob([combinedContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MK3-${brandName.replace(/\s+/g, '-')}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function showSuccessMessage() {
    // Show a nice success message
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 40px; border-radius: 20px; max-width: 500px; text-align: center;">
            <div style="font-size: 60px; margin-bottom: 20px;">🎉</div>
            <h2 style="margin-bottom: 15px;">Code Generated Successfully!</h2>
            <p style="color: #666; margin-bottom: 25px;">
                Your complete MK3 system has been downloaded. 
                Check your downloads folder and follow the instructions!
            </p>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="background: #667eea; color: white; border: none; padding: 12px 30px; border-radius: 8px; cursor: pointer; font-size: 16px;">
                Got it!
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Note: This file assumes generateMK3Script() is loaded from another module
