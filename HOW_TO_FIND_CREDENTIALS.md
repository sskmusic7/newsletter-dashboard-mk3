# 🔐 How to Find Your Brevo & SendPulse Credentials

## 📍 Where They're Stored

Your credentials are stored in **Google Apps Script Script Properties** (secure storage, not in code files).

## 🔍 How to View Them

### Option 1: Google Apps Script Editor

1. Go to: https://script.google.com
2. Open your project (the one with your email system)
3. Click **Project Settings** (gear icon ⚙️ on the left sidebar)
4. Scroll down to **Script Properties**
5. Look for:
   - `BREVO_API_KEY` - Your Brevo API key
   - `SENDPULSE_API_ID` - Your SendPulse API ID
   - `SENDPULSE_API_SECRET` - Your SendPulse API Secret

**Note:** Script Properties values are hidden by default (shown as dots). Click the eye icon 👁️ to reveal them.

### Option 2: View via Code (Temporary)

You can temporarily add this function to your `Code.gs` to view them:

```javascript
function viewCredentials() {
  const props = PropertiesService.getScriptProperties();
  const brevo = props.getProperty('BREVO_API_KEY');
  const sendpulseId = props.getProperty('SENDPULSE_API_ID');
  const sendpulseSecret = props.getProperty('SENDPULSE_API_SECRET');
  
  Logger.log('BREVO_API_KEY: ' + (brevo ? '***' + brevo.slice(-4) : 'NOT SET'));
  Logger.log('SENDPULSE_API_ID: ' + (sendpulseId ? sendpulseId : 'NOT SET'));
  Logger.log('SENDPULSE_API_SECRET: ' + (sendpulseSecret ? '***' + sendpulseSecret.slice(-4) : 'NOT SET'));
  
  // View in Execution log
  return {
    brevo: brevo ? '***' + brevo.slice(-4) : 'NOT SET',
    sendpulseId: sendpulseId || 'NOT SET',
    sendpulseSecret: sendpulseSecret ? '***' + sendpulseSecret.slice(-4) : 'NOT SET'
  };
}
```

Then:
1. Run the function `viewCredentials`
2. Check **Execution** tab to see the logs
3. **Delete this function after viewing** (for security)

## 🔑 If You Need to Get New Credentials

### Brevo (formerly Sendinblue)

1. Go to: https://app.brevo.com/
2. Log in with your Brevo account
3. Go to **Settings** → **SMTP & API**
4. Click **API Keys** tab
5. Create a new API key or view existing ones
6. Copy the API key

### SendPulse

1. Go to: https://sendpulse.com/
2. Log in with your SendPulse account
3. Go to **Settings** → **API**
4. You'll see:
   - **API ID** (your client ID)
   - **API Secret** (your client secret)
5. Copy both values

**Important for SendPulse:**
- You need **BOTH** API ID and API Secret
- These are stored as `SENDPULSE_API_ID` and `SENDPULSE_API_SECRET` in Script Properties
- The system automatically generates access tokens from these credentials

## 📝 What to Check

In Google Apps Script Script Properties, you should have:

**For Brevo:**
- ✅ `BREVO_API_KEY` = Your Brevo API key

**For SendPulse:**
- ✅ `SENDPULSE_API_ID` = Your SendPulse API ID
- ✅ `SENDPULSE_API_SECRET` = Your SendPulse API Secret

## ⚠️ Security Note

- Never share these credentials publicly
- Never commit them to version control
- If you suspect they're compromised, regenerate them in the provider dashboard
- Update the Script Properties with new values if you regenerate

---

**Need Help?**
- Check your email for signup confirmations from Brevo/SendPulse
- Check your password manager if you saved them there
- Contact Brevo/SendPulse support if you can't access your account
