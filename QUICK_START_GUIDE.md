# 🚀 Quick Start Guide: 5-Minute Setup

## Step 1: Generate Code (2 minutes)

1. Go to **https://cutoutthemiddleman.netlify.app/**
2. Fill out the form:
   - Brand name, bio, voice
   - Select template and frequency
   - Enter Google Sheet ID (or leave empty to auto-create)
   - Select email provider
   - Enter sender email
   - Add API keys if using
3. Click **"Generate Custom Script"**
4. Click **"Copy Code"**

## Step 2: Paste into Apps Script (1 minute)

1. Open Google Sheets → Create new sheet (or use existing)
2. **Extensions** → **Apps Script**
3. Delete default code
4. Paste your generated code
5. **Save** (Ctrl/Cmd + S)

## Step 3: Add API Keys (1 minute)

1. Click **⚙️ Settings** (gear icon)
2. Scroll to **"Script Properties"**
3. Click **"Add script property"** for each:
   - `FROM_EMAIL`: Your sender email
   - `EMAIL_PROVIDER`: Your provider (e.g., `sendpulse`, `brevo`)
   - Provider API key (e.g., `BREVO_API_KEY`, `SENDPULSE_API_ID`, etc.)
4. Save each property

## Step 4: Deploy Web App (1 minute)

1. Click **Deploy** → **New deployment**
2. Click **⚙️ Settings** → Select **"Web app"**
3. Set **"Who has access"** to **"Anyone"** (if using public form)
4. Click **"Deploy"**
5. **Authorize** when prompted
6. **Copy the Web App URL**

## Step 5: Test (1 minute)

1. Click **Run** → Select **`testWebhook`** → Click **Run**
2. Check your Google Sheet - you should see a test entry
3. ✅ You're done!

## Connect ManyChat (Optional)

1. ManyChat → Automation → Flows
2. Add **Webhook** action
3. URL: Your Web App URL (from Step 4)
4. Method: POST
5. Parameters:
   - `email`: `{{contact.email}}`
   - `first_name`: `{{contact.first_name}}`
   - `source`: `manychat`

## Enable Gmail Detection (Optional)

If you enabled Gmail detection in dashboard:

1. **Run** → Select **`testGmailAccess`** → Click **Run** → **Authorize**
2. **Run** → Select **`setupAllTriggers`** → Click **Run**
3. ✅ Triggers are active!

---

**That's it!** Your system is live. Check your Google Sheet to see subscribers.

