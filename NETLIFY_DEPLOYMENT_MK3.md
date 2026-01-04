# Netlify Deployment Guide - MK3 Version

## Current Setup

- **Netlify Site**: https://cutoutthemiddleman.netlify.app/
- **Current Version**: Old dashboard (single provider, basic features)
- **New Version**: MK3 dashboard (multi-provider, verification, Gmail detection, AI content)

## Deployment Steps

### Option 1: Replace index.html (Recommended)

1. **Backup current version** (already done - `dashboard_backup.html` exists)

2. **Update the dashboard file**:
   - The complete MK3 generator has been integrated into `dashboard_mk3.html`
   - Replace `index.html` with `dashboard_mk3.html`

3. **Deploy to Netlify**:
   ```bash
   # Option A: Via Git (if connected)
   git add dashboard_mk3.html
   git commit -m "Update to MK3 version with all advanced features"
   git push
   # Netlify will auto-deploy
   
   # Option B: Via Netlify Dashboard
   # 1. Go to https://app.netlify.com/projects/cutoutthemiddleman
   # 2. Go to "Deploys" tab
   # 3. Drag & drop the NEWSLETTER SCRIPT GENERATOR folder
   #    (Netlify will use index.html automatically)
   
   # Option C: Via Netlify CLI
   netlify deploy --prod --dir="NEWSLETTER SCRIPT GENERATOR"
   ```

### Option 2: Keep Both Versions

If you want to keep the old version accessible:

1. Keep `index.html` as the old version
2. Rename `dashboard_mk3.html` to `dashboard.html` (or keep as-is)
3. Access via: `https://cutoutthemiddleman.netlify.app/dashboard_mk3.html`

## What's New in MK3

The MK3 version includes:

✅ **Multi-Provider Email System**
- 7 email providers: SendPulse, Brevo, Resend, Mailgun, MailerSend, SendGrid, Gmail
- Automatic failover if primary provider fails
- Select primary provider in dashboard

✅ **Email Verification Workflow**
- Optional verification mode (toggle in dashboard)
- Warming email → Reply → Download email flow
- Token management system

✅ **Gmail Reply Detection**
- Automatic Gmail reply detection (toggle in dashboard)
- Time-based triggers (every 5 minutes)
- Sheet-change triggers (instant verification)
- Handles @gmail.com and @googlemail.com variations

✅ **AI Content Generation**
- Gemini AI integration (if API key provided)
- Brand voice training
- Sample content analysis

✅ **All Original Features**
- ManyChat webhook support
- Newsletter scheduling (daily, weekly, biweekly, monthly)
- 3 email templates (Newsletter, Story, Minimal)
- Warm-up mode
- Instagram integration (existing)

## File Structure

```
NEWSLETTER SCRIPT GENERATOR/
├── index.html                    # Current Netlify entry point (OLD VERSION)
├── dashboard_mk3.html            # NEW MK3 VERSION (with complete generator)
├── dashboard_backup.html         # Backup of original
├── netlify.toml                  # Netlify configuration
├── netlify/
│   └── functions/                # Netlify functions (Instagram, etc.)
└── mk3/                          # MK3 generator modules
    ├── generator-complete-inline.js  # Complete generator (embedded in dashboard_mk3.html)
    └── modules/                   # All 12 modules
```

## After Deployment

1. **Test the dashboard**: Visit https://cutoutthemiddleman.netlify.app/
2. **Fill out the form** with all the new options:
   - Select primary email provider
   - Enable/disable verification workflow
   - Enable/disable Gmail detection
   - Enable/disable failover
3. **Generate a script** and verify it includes all selected features
4. **Test the generated script** in Google Apps Script editor

## Rollback (if needed)

If you need to rollback to the old version:

```bash
# Option 1: Git revert
git revert HEAD
git push

# Option 2: Replace files
cp dashboard_backup.html index.html
# Then deploy again
```

## Notes

- The MK3 generator is embedded inline in `dashboard_mk3.html` (no external dependencies)
- All Netlify functions (Instagram exchange, etc.) remain unchanged
- The `netlify.toml` configuration remains the same
- The dashboard works completely client-side (no server changes needed)

