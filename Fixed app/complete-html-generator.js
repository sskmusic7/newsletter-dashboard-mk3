/**
 * MK3 HTML GENERATOR MODULE - COMPLETE FIXED VERSION
 * Drop this into your modules/ folder or wherever you handle HTML generation
 * 
 * This fixes the "code showing on pages" issue by:
 * 1. Properly escaping HTML entities
 * 2. Using clean template literals
 * 3. Wrapping JS in IIFE
 * 4. Properly closing script tags
 */

function generateHTMLFiles(config) {
    // HTML escaping utility
    function esc(text) {
        if (!text) return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return String(text).replace(/[&<>"']/g, m => map[m]);
    }

    // ============================================
    // INDEX.HTML - Subscription Form
    // ============================================
    const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Subscribe - ${esc(config.brandName)}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
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
            animation: slideUp 0.6s ease-out;
        }
        
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 28px;
            font-weight: 700;
        }
        
        .subtitle {
            color: #666;
            margin-bottom: 30px;
            line-height: 1.6;
            font-size: 15px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: 500;
            font-size: 14px;
        }
        
        input {
            width: 100%;
            padding: 12px 15px;
            border: 2px solid #e0e0e0;
            border-radius: 8px;
            font-size: 16px;
            transition: all 0.3s ease;
            font-family: inherit;
        }
        
        input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        input::placeholder {
            color: #999;
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
            transition: all 0.3s ease;
            font-family: inherit;
            position: relative;
            overflow: hidden;
        }
        
        button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
        }
        
        button:active:not(:disabled) {
            transform: translateY(0);
        }
        
        button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none;
        }
        
        .button-content {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }
        
        .message {
            margin-top: 15px;
            padding: 12px 15px;
            border-radius: 8px;
            display: none;
            font-size: 14px;
            animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
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
        
        .spinner {
            display: none;
            width: 18px;
            height: 18px;
            border: 3px solid #ffffff;
            border-top-color: transparent;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }
        
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        
        .footer-text {
            text-align: center;
            margin-top: 20px;
            font-size: 12px;
            color: #999;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Subscribe to ${esc(config.brandName)}</h1>
        <p class="subtitle">${esc(config.brandBio || 'Get the latest updates and exclusive content delivered to your inbox.')}</p>
        
        <form id="subscribeForm">
            <div class="form-group">
                <label for="name">Your Name</label>
                <input 
                    type="text" 
                    id="name" 
                    name="name" 
                    required 
                    placeholder="John Doe"
                    autocomplete="name"
                >
            </div>
            
            <div class="form-group">
                <label for="email">Email Address</label>
                <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    required 
                    placeholder="you@example.com"
                    autocomplete="email"
                >
            </div>
            
            <button type="submit" id="submitBtn">
                <div class="button-content">
                    <span id="btnText">Subscribe Now</span>
                    <div class="spinner" id="spinner"></div>
                </div>
            </button>
        </form>
        
        <div class="message" id="message"></div>
        
        <p class="footer-text">Powered by ${esc(config.brandName)}</p>
    </div>

    <script>
    (function() {
        'use strict';
        
        // Get elements
        var form = document.getElementById('subscribeForm');
        var submitBtn = document.getElementById('submitBtn');
        var btnText = document.getElementById('btnText');
        var spinner = document.getElementById('spinner');
        var message = document.getElementById('message');
        var nameInput = document.getElementById('name');
        var emailInput = document.getElementById('email');
        
        // Get script URL
        var scriptUrl = window.location.href.split('?')[0];
        
        // Email validation
        function isValidEmail(email) {
            var re = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
            return re.test(email);
        }
        
        // Show message
        function showMessage(text, type) {
            message.textContent = text;
            message.className = 'message ' + type;
            message.style.display = 'block';
        }
        
        // Hide message
        function hideMessage() {
            message.style.display = 'none';
        }
        
        // Set loading state
        function setLoading(loading) {
            submitBtn.disabled = loading;
            btnText.style.display = loading ? 'none' : 'inline';
            spinner.style.display = loading ? 'block' : 'none';
        }
        
        // Handle form submission
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            var name = nameInput.value.trim();
            var email = emailInput.value.trim();
            
            // Validate
            if (!name) {
                showMessage('Please enter your name', 'error');
                nameInput.focus();
                return;
            }
            
            if (!email || !isValidEmail(email)) {
                showMessage('Please enter a valid email address', 'error');
                emailInput.focus();
                return;
            }
            
            // Set loading state
            setLoading(true);
            hideMessage();
            
            // Submit to backend
            fetch(scriptUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    source: 'web_form',
                    timestamp: new Date().toISOString()
                })
            })
            .then(function(response) {
                return response.json();
            })
            .then(function(data) {
                if (data.success) {
                    // Redirect to thank you page
                    window.location.href = scriptUrl + '?thankyou=true';
                } else {
                    throw new Error(data.error || 'Subscription failed');
                }
            })
            .catch(function(error) {
                setLoading(false);
                showMessage(error.message || 'Something went wrong. Please try again.', 'error');
                console.error('Subscription error:', error);
            });
        });
        
        // Auto-focus first input
        if (nameInput) {
            nameInput.focus();
        }
    })();
    <\/script>
</body>
</html>`;

    // ============================================
    // THANK-YOU.HTML - Confirmation Page
    // ============================================
    const thankYouHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank You - ${esc(config.brandName)}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
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
            max-width: 550px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
            animation: slideUp 0.6s ease-out;
        }
        
        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .checkmark-wrapper {
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
        
        @keyframes scaleIn {
            0% {
                transform: scale(0);
                opacity: 0;
            }
            50% {
                transform: scale(1.1);
            }
            100% {
                transform: scale(1);
                opacity: 1;
            }
        }
        
        .checkmark {
            width: 50px;
            height: 50px;
            stroke: white;
            stroke-width: 3;
            fill: none;
            stroke-dasharray: 100;
            stroke-dashoffset: 100;
            animation: drawCheck 0.8s ease-out 0.3s forwards;
        }
        
        @keyframes drawCheck {
            to {
                stroke-dashoffset: 0;
            }
        }
        
        h1 {
            color: #333;
            margin-bottom: 15px;
            font-size: 32px;
            font-weight: 700;
        }
        
        .subtitle {
            color: #666;
            line-height: 1.7;
            margin-bottom: 35px;
            font-size: 16px;
        }
        
        .next-steps {
            background: #f8f9fa;
            border-radius: 12px;
            padding: 30px;
            margin-top: 30px;
            text-align: left;
        }
        
        .next-steps h3 {
            color: #333;
            margin-bottom: 20px;
            font-size: 18px;
            font-weight: 600;
            text-align: center;
        }
        
        .next-steps ul {
            list-style: none;
            padding-left: 0;
        }
        
        .next-steps li {
            padding: 12px 0;
            color: #555;
            position: relative;
            padding-left: 35px;
            line-height: 1.5;
        }
        
        .next-steps li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #667eea;
            font-weight: bold;
            font-size: 20px;
            top: 10px;
        }
        
        .cta-button {
            display: inline-block;
            margin-top: 25px;
            padding: 12px 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            transition: all 0.3s ease;
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
        }
        
        .footer-text {
            margin-top: 30px;
            font-size: 12px;
            color: #999;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="checkmark-wrapper">
            <svg class="checkmark" viewBox="0 0 52 52">
                <polyline points="12,26 22,36 40,16"/>
            </svg>
        </div>
        
        <h1>You're All Set! 🎉</h1>
        
        <p class="subtitle">
            Thank you for subscribing to <strong>${esc(config.brandName)}</strong>! 
            ${config.verification ? 
                "We've sent you a welcome email. Please check your inbox and reply to confirm your subscription." : 
                "You'll start receiving our exclusive updates soon."}
        </p>
        
        <div class="next-steps">
            <h3>What Happens Next?</h3>
            <ul>
                ${config.verification ? `
                <li>Check your inbox for our welcome email (check spam folder too)</li>
                <li>Reply to the email to confirm your subscription</li>
                <li>Get instant access to exclusive downloads and content</li>
                <li>Start receiving ${config.frequency || 'regular'} updates</li>
                ` : `
                <li>Check your inbox for our welcome email</li>
                <li>Look out for ${config.frequency || 'regular'} updates from us</li>
                <li>Enjoy exclusive content, tips, and insights</li>
                <li>Reply anytime - we love hearing from our subscribers!</li>
                `}
            </ul>
        </div>
        
        <p class="footer-text">Powered by ${esc(config.brandName)}</p>
    </div>
</body>
</html>`;

    return {
        index: indexHtml,
        thankYou: thankYouHtml
    };
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generateHTMLFiles };
}

// Also expose globally for browser use
if (typeof window !== 'undefined') {
    window.generateHTMLFiles = generateHTMLFiles;
}
