# MK3 Modular Code Generator

This directory contains the modular MK3 code generator system that combines features from both the presentation system and the SSK production system.

## Structure

```
mk3/
├── modules/          # Modular code generation functions
│   ├── config.js              # CONFIG object generation
│   ├── script-properties.js   # Script Properties functions
│   ├── spreadsheet.js         # Spreadsheet functions
│   ├── tokens.js              # Token management (if verification enabled)
│   ├── multi-provider.js      # Multi-provider email system
│   ├── verification.js        # Email verification workflow
│   ├── gmail-triggers.js      # Gmail reply detection
│   ├── templates.js           # Email templates
│   ├── newsletter.js          # Newsletter functions
│   ├── ai-content.js          # AI content generation
│   ├── webhook.js             # Webhook handler
│   └── test-functions.js      # Test functions
├── generator-mk3.js  # Main generator that combines all modules
└── README.md         # This file
```

## Usage

All modules export functions that generate code strings. The main generator combines them into a complete Google Apps Script file.

## Features Included

### From SSK Production System
- ✅ Multi-provider email system (7 providers with failover)
- ✅ Email verification workflow
- ✅ Gmail reply detection with triggers
- ✅ Advanced token management
- ✅ SendPulse OAuth token caching

### From Presentation System
- ✅ ManyChat webhook support
- ✅ Gemini AI content generation
- ✅ Brand voice training
- ✅ Newsletter scheduling
- ✅ Multiple email templates
- ✅ Warm-up mode

### MK3 Enhancements
- ✅ Modular code generation
- ✅ Optional feature toggles
- ✅ Combined best of both systems


