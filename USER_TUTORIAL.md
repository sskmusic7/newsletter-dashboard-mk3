# 📚 Complete User Tutorial: From Dashboard to Deployment

## Overview

This tutorial walks you through the complete process from generating your code on the dashboard to having a fully functional newsletter automation system running on Google Apps Script.

---

## Part 1: Generate Your Code

### Step 1: Visit the Dashboard

1. Go to **https://cutoutthemiddleman.netlify.app/**
2. You'll see the Newsletter Agent Dashboard

### Step 2: Fill Out the Form

Fill in all the required fields:

**Brand Information:**
- **Brand Name** * (e.g., "Your Business Name")
- **About / Bio** * (2-3 sentences about your work)
- **Brand Voice & Tone** * (Describe your writing style)
- **Sample Content** (Optional but recommended - examples of your writing)

**Email Template:**
- Select one: Classic Newsletter, Story Style, or Personal Letter

**Sending Frequency:**
- Select: Daily, Weekly, Bi-Weekly, or Monthly
- Toggle "Enable Warm-Up Mode" if needed

**API Configuration:**
- **Google Sheet ID** * (Leave empty to auto-create, or paste existing Sheet ID)
- **Primary Email Provider** * (Select: SendPulse, Brevo, Resend, Mailgun, MailerSend, SendGrid, or Gmail)
- **Verified Sender Email** * (Your email address - must be verified with your provider)
- **Enable Email Failover** (Toggle - automatically uses backup providers if primary fails)
- **Enable Email Verification** (Toggle - enables warming email → reply → download workflow)
- **Enable Gmail Reply Detection** (Toggle - automatic reply detection if using verification)
- **Gemini API Key** (Optional - for AI content generation)

### Step 3: Generate Your Script

1. Click **"Generate Custom Script"** button
2. The generated code will appear in a code box below
3. Click **"Copy Code"** to copy it to your clipboard
4. **Save it somewhere safe** (like a text file) - you'll need it in the next steps

---

## Part 2: Set Up Google Apps Script

### Step 4: Create or Open Your Google Sheet

**Option A: Let the script create a sheet automatically**
- If you left "Google Sheet ID" empty, the script will create one automatically
- You can skip to Step 5

**Option B: Use an existing Google Sheet**
1. Open Google Sheets (sheets.google.com)
2. Create a new sheet or open an existing one
3. Copy the Sheet ID from the URL:
   - URL format: `https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit`
   - Copy everything between `/d/` and `/edit`

### Step 5: Open Apps Script Editor

1. In your Google Sheet, click **Extensions** → **Apps Script**
2. A new tab opens with the Apps Script editor
3. You'll see a default `Code.gs` file with some sample code

### Step 6: Paste Your Generated Code

1. **Delete all existing code** in the `Code.gs` file
2. **Paste your generated code** (the code you copied from the dashboard)
3. Click **Save** (💾 icon or Ctrl/Cmd + S)
4. Give your project a name (top left, e.g., "Newsletter Automation")

---

## Part 3: Add API Keys to Script Properties

**⚠️ IMPORTANT:** API keys are NOT stored in your code for security. You must add them separately.

### Step 7: Open Script Properties

1. In Apps Script, click the **⚙️ Settings/Project Settings** icon (left sidebar, looks like a gear)
2. Scroll down to **"Script Properties"** section
3. You'll see a table with "Property" and "Value" columns

### Step 8: Add Required Properties

Click **"Add script property"** for each of these:

**Required Properties:**

1. **Property**: `FROM_EMAIL`  
   **Value**: Your verified sender email (same as you entered in dashboard)

2. **Property**: `EMAIL_PROVIDER`  
   **Value**: Your primary provider (e.g., `sendpulse`, `brevo`, `sendgrid`, etc.)

3. **Property**: `ENABLE_FAILOVER`  
   **Value**: `true` or `false` (same as your dashboard selection)

**Provider-Specific API Keys** (add only for providers you're using):

4. **Property**: `SENDGRID_API_KEY` (if using SendGrid)  
   **Value**: Your SendGrid API key (get from SendGrid → Settings → API Keys)

5. **Property**: `BREVO_API_KEY` (if using Brevo)  
   **Value**: Your Brevo API key (get from Brevo → Settings → API Keys → SMTP & API)

6. **Property**: `SENDPULSE_API_ID` (if using SendPulse)  
   **Value**: Your SendPulse API ID (get from SendPulse → Settings → API)

7. **Property**: `SENDPULSE_API_SECRET` (if using SendPulse)  
   **Value**: Your SendPulse API Secret (get from SendPulse → Settings → API)

8. **Property**: `RESEND_API_KEY` (if using Resend)  
   **Value**: Your Resend API key (get from Resend → Dashboard → API Keys)

9. **Property**: `MAILGUN_API_KEY` (if using Mailgun)  
   **Value**: Your Mailgun API key (get from Mailgun → Settings → API Keys)

10. **Property**: `MAILGUN_DOMAIN` (if using Mailgun)  
    **Value**: Your Mailgun domain (e.g., `mg.yourdomain.com`)

11. **Property**: `MAILERSEND_API_KEY` (if using MailerSend)  
    **Value**: Your MailerSend API key (get from MailerSend → Settings → API Tokens)

12. **Property**: `GEMINI_API_KEY` (if using AI content generation)  
    **Value**: Your Gemini API key (get from ai.google.dev)

**Optional Properties** (if using verification workflow):

13. **Property**: `BEAT_DOWNLOAD_URL` (if sending downloads)  
    **Value**: URL to your beat download

14. **Property**: `EBOOK_DOWNLOAD_URL` (if sending downloads)  
    **Value**: URL to your ebook download

15. **Property**: `SPREADSHEET_ID` (if using existing sheet)  
    **Value**: Your Google Sheet ID (only if you want to specify it explicitly)

**After adding each property:**
- Click **"Save script property"** (or just move to next one - they auto-save)

---

## Part 4: Deploy Your Script (Two Options)

### Option A: Webhook-Only (Recommended for ManyChat/API Integration)

If you're **only using ManyChat or API calls** (no public form), you just need the `.gs` file:

1. **You're done!** Just deploy as a Web App (see Part 5 below)
2. The generated code includes `doPost()` function that handles webhook submissions
3. No HTML files needed

### Option B: Public Form (If You Want a Web Form)

If you want a **public form** that people can visit and submit emails directly:

**You'll need to add HTML files to your Apps Script project:**

1. In Apps Script, click the **+** icon next to "Files" (left sidebar)
2. Select **"HTML"**
3. Name it **`index`** (this will be your form page)
4. You'll need to create the HTML form that POSTs to your webhook URL

**Important:** The generated code from the dashboard creates a **webhook handler** (doPost function). If you want a public form, you have two choices:

- **Choice 1:** Create a simple HTML form that POSTs to your Web App URL (external form)
- **Choice 2:** Add HTML files to Apps Script and add a `doGet()` function to serve them (more complex)

**For simplicity, we recommend Choice 1** - create a standalone HTML form on your website that posts to your Web App URL.

---

## Part 5: Set Up Gmail Triggers (If Using Gmail Detection)

### Step 9: Enable Gmail Permissions

If you enabled "Gmail Reply Detection" in the dashboard:

1. In Apps Script, click **Run** → Select **`testGmailAccess`** (from the function dropdown)
2. Click **Run** button (▶️)
3. You'll be asked to **Review Permissions**
4. Click **Review Permissions**
5. Select your Google account
6. You'll see a warning that Google hasn't verified the app - click **"Advanced"**
7. Click **"Go to [Your Project Name] (unsafe)"**
8. Click **"Allow"** to grant Gmail permissions

### Step 10: Set Up Automatic Triggers

1. In Apps Script, click **Run** → Select **`setupAllTriggers`**
2. Click **Run** button (▶️)
3. You'll see a message: "All triggers set up! Replies will be checked every 5 minutes AND immediately when sheet changes."
4. ✅ Triggers are now active!

**What this does:**
- Checks Gmail for replies every 5 minutes
- Checks immediately when your sheet is edited
- Automatically verifies users who reply to warming emails

---

## Part 6: Deploy as Web App

### Step 11: Deploy Your Script

1. In Apps Script, click **Deploy** → **New deployment**
2. Click the **⚙️ Settings** icon (next to "Select type")
3. Select **"Web app"**
4. Fill in the deployment settings:
   - **Description**: (Optional) e.g., "Newsletter Automation v1"
   - **Execute as**: **Me** (your account)
   - **Who has access**: 
     - Choose **"Anyone"** if you want a public form
     - Choose **"Only myself"** if only you will access it
   - **Require app authentication**: Usually leave unchecked
5. Click **"Deploy"**
6. You'll be asked to authorize the app again - click **"Authorize access"**
7. Select your account and click **"Allow"**

### Step 12: Copy Your Web App URL

1. After deployment, you'll see a **Web app URL**
2. It looks like: `https://script.google.com/macros/s/AKfycby.../exec`
3. **Copy this URL** - you'll need it for the next steps
4. Click **"Done"**

**⚠️ Important Notes:**
- This URL is your webhook endpoint
- Keep it secure - anyone with this URL can submit to your system
- If you redeploy, you'll get a new URL (unless you use "Manage deployments" to update existing)

---

## Part 7: Set Up Your Form (Optional - For Direct Submissions)

If you want a public form for people to submit their email directly (not just via ManyChat):

### Step 13: Create HTML Form (External - Recommended)

**Easier option:** Create a standalone HTML form on your website that posts to your Web App URL.

1. Create an HTML file on your website (or use a code block in WordPress/Squarespace/etc.)
2. Use this form code (replace `YOUR_WEB_APP_URL` with your actual Web App URL from Step 12):

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Subscribe to Newsletter</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 500px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .form-container {
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h2 {
            color: #333;
            margin-bottom: 20px;
        }
        input {
            width: 100%;
            padding: 12px;
            margin: 10px 0;
            border: 1px solid #ddd;
            border-radius: 4px;
            box-sizing: border-box;
        }
        button {
            width: 100%;
            padding: 12px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 16px;
            margin-top: 10px;
        }
        button:hover {
            background: #5568d3;
        }
        .success {
            background: #d4edda;
            color: #155724;
            padding: 15px;
            border-radius: 4px;
            margin-top: 20px;
            display: none;
        }
        .error {
            background: #f8d7da;
            color: #721c24;
            padding: 15px;
            border-radius: 4px;
            margin-top: 20px;
            display: none;
        }
    </style>
</head>
<body>
    <div class="form-container">
        <h2>Subscribe to Our Newsletter</h2>
        <form id="subscriptionForm">
            <input type="text" id="name" placeholder="Your Name" required>
            <input type="email" id="email" placeholder="Your Email" required>
            <button type="submit">Subscribe</button>
        </form>
        <div id="success" class="success">Thank you for subscribing! Check your email.</div>
        <div id="error" class="error"></div>
    </div>

    <script>
        document.getElementById('subscriptionForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            
            // Get your Web App URL (replace with your actual URL)
            const webAppUrl = 'YOUR_WEB_APP_URL_HERE';
            
            fetch(webAppUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    name: name,
                    source: 'direct'
                })
            })
            .then(() => {
                document.getElementById('success').style.display = 'block';
                document.getElementById('error').style.display = 'none';
                document.getElementById('subscriptionForm').reset();
            })
            .catch(error => {
                document.getElementById('error').textContent = 'Error: ' + error.message;
                document.getElementById('error').style.display = 'block';
                document.getElementById('success').style.display = 'none';
            });
        });
    </script>
</body>
</html>
```

3. **Replace `YOUR_WEB_APP_URL`** with your actual Web App URL from Step 12
4. **Host this HTML file** on your website (upload to your server, or use a code block in WordPress/Squarespace/Wix/etc.)

**Alternative: Embed in Your Website**

You can also embed this form directly in your website's HTML. The form will POST to your Google Apps Script Web App URL.

**Note:** The generated code from the dashboard includes `doPost()` function that handles form submissions. You don't need to modify the code - just POST to your Web App URL!

---

## Part 8: Connect ManyChat (Optional)

If you're using ManyChat to capture leads:

### Step 15: Set Up ManyChat Webhook

1. Log into ManyChat
2. Go to **Automation** → **Flows**
3. Create or edit a flow
4. Add a **"Webhook"** action
5. Set the webhook URL to your **Web App URL** (from Step 12)
6. Set method to **POST**
7. Add these parameters:
   - `email`: `{{contact.email}}`
   - `first_name`: `{{contact.first_name}}`
   - `source`: `manychat`
8. Save the flow
9. Test it by triggering the flow

---

## Part 9: Test Your System

### Step 16: Test the Webhook

1. In Apps Script, click **Run** → Select **`testWebhook`**
2. Click **Run** button (▶️)
3. Check the **Execution log** (View → Logs or Ctrl/Cmd + Enter)
4. You should see: "Test result: ..."
5. Check your Google Sheet - you should see a test entry

### Step 17: Test Email Sending

1. In Apps Script, click **Run** → Select **`sendTestNewsletter`**
2. Click **Run** button (▶️)
3. Check your email inbox (the FROM_EMAIL address)
4. You should receive a test newsletter email

### Step 18: Test with Real Submission

1. Use your form URL or ManyChat flow
2. Submit a test email
3. Check your Google Sheet - you should see the new subscriber
4. If verification is enabled, check the subscriber's email for a warming email
5. Reply to the warming email
6. Check your sheet - status should change to "verified"
7. Check the subscriber's email - they should receive the download/welcome email

---

## Part 10: View Your Data

### Step 19: Check Your Google Sheet

Your Google Sheet will have these columns (automatically created):

- **Timestamp**: When they subscribed
- **Email**: Subscriber email
- **Name**: Subscriber name
- **Source**: Where they came from (manychat, direct, etc.)
- **Token**: Access token (if using verification)
- **Status**: pending, verified, or active
- **Verified Date**: When they were verified (if applicable)

### Step 20: View Event Log

If you have an "EventLog" sheet, you can see:
- All system events
- Errors
- Successful operations
- Newsletter sends

---

## Troubleshooting

### Issue: "FROM_EMAIL not configured"
**Solution:** Add `FROM_EMAIL` to Script Properties (Step 8)

### Issue: "SENDGRID_API_KEY not configured"
**Solution:** Add the API key for your selected provider to Script Properties

### Issue: Gmail trigger not working
**Solution:** 
1. Run `testGmailAccess()` to grant permissions (Step 9)
2. Run `setupAllTriggers()` to create triggers (Step 10)

### Issue: Form submission not working
**Solution:**
1. Check that Web App is deployed with "Anyone" access (Step 11)
2. Verify the Web App URL is correct
3. Check Execution log for errors

### Issue: Emails not sending
**Solution:**
1. Verify API keys are correct in Script Properties
2. Check that your sender email is verified with your email provider
3. Run `testAllProviders()` to test each provider
4. Check Execution log for specific error messages

### Issue: Verification workflow not working
**Solution:**
1. Make sure "Enable Email Verification" was enabled in dashboard
2. Check that warming emails are being sent (check Execution log)
3. If using Gmail detection, make sure triggers are set up (Step 10)
4. Check that replies are being detected (run `processGmailReplies()` manually)

---

## Next Steps

Once everything is working:

1. **Set up newsletter scheduling** (if using scheduled sends)
2. **Customize email templates** (edit the template functions in Code.gs)
3. **Monitor your Google Sheet** for new subscribers
4. **Check Event Log** for any errors
5. **Test with real users** before going live

---

## Quick Reference: Function List

Your generated code includes these test functions (accessible via Run menu):

- `testWebhook()` - Test webhook submission
- `sendTestNewsletter()` - Send test email
- `testGmailAccess()` - Test Gmail permissions
- `setupAllTriggers()` - Set up Gmail triggers
- `testAllProviders()` - Test all email providers
- `showMySpreadsheet()` - Show spreadsheet URL
- `manualVerify(email)` - Manually verify a user

---

## Support

If you encounter issues:
1. Check the Execution log in Apps Script (View → Logs)
2. Check your Google Sheet for errors
3. Verify all Script Properties are set correctly
4. Test individual functions using the Run menu

---

**Congratulations!** 🎉 Your newsletter automation system is now live!

