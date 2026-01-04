# Newsletter Script Generator with Instagram OAuth

This dashboard allows you to set up AI-powered newsletter automation and connect your Instagram account to automatically analyze your brand voice from your Instagram captions.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```
FACEBOOK_APP_ID=880402194330494
FACEBOOK_APP_SECRET=your_app_secret_here
REDIRECT_URI=http://localhost:4000/ig/callback.html
PORT=4000
```

**Important:** 
- Replace `your_app_secret_here` with your actual Facebook App Secret (found in Facebook App Settings)
- For production, update `REDIRECT_URI` to your production domain (e.g., `https://cutoutthemiddleman.netlify.app/ig/callback.html`)

### 3. Configure Facebook App Settings

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Select your app (COTMM - ID: 880402194330494)
3. Navigate to **Settings → Basic**
4. Add your redirect URI to **Valid OAuth Redirect URIs**:
   - For local: `http://localhost:4000/ig/callback.html`
   - For production: `https://cutoutthemiddleman.netlify.app/ig/callback.html`
5. Ensure these permissions are enabled:
   - `instagram_basic`
   - `pages_show_list`

### 4. Start the Server

```bash
npm start
```

Or for development with auto-reload:

```bash
npm run dev
```

The server will start on `http://localhost:4000`

### 5. Open the Dashboard

Navigate to `http://localhost:4000/dashboard.html` in your browser.

## Features

### Instagram OAuth Integration

1. **Connect Instagram**: Click the "Connect Instagram Account" button in the Brand Information section
2. **Authorize**: You'll be redirected to Facebook to authorize the app
3. **Auto-Analysis**: Once connected, the dashboard will:
   - Fetch your recent Instagram captions (up to 25 posts)
   - Display a preview of the captions
   - Allow you to use them for brand voice analysis
   - Automatically detect tone, style, and writing patterns

### Brand Voice Detection

The system analyzes your Instagram captions to detect:
- **Tone**: Casual, professional, or conversational
- **Writing Style**: Short/punchy, balanced, or detailed sentences
- **Emoji Usage**: Frequency and style
- **Common Patterns**: Recurring phrases and communication style

### Using Instagram Captions

1. After connecting Instagram, click "Use These Captions for Brand Voice Analysis"
2. The captions will be added to your Sample Content field
3. Brand Voice will be auto-filled with detected patterns
4. You can edit and refine the auto-detected voice as needed

## Project Structure

```
.
├── dashboard.html          # Main dashboard interface
├── server.js              # Express server for OAuth and API calls
├── package.json           # Dependencies
├── ig/
│   └── callback.html      # OAuth callback handler
└── README.md             # This file
```

## API Endpoints

### `GET /api/health`
Health check endpoint.

### `POST /api/instagram/exchange`
Exchanges OAuth authorization code for Instagram data.

**Request Body:**
```json
{
  "code": "authorization_code_from_facebook"
}
```

**Response:**
```json
{
  "success": true,
  "ig_user_id": "instagram_user_id",
  "page_id": "facebook_page_id",
  "media": [...],
  "captions": ["caption1", "caption2", ...]
}
```

## Deployment

### Netlify Deployment

1. Build and deploy your static files
2. Set up a Netlify Function or external server for the `/api/instagram/exchange` endpoint
3. Update `REDIRECT_URI` in your `.env` to match your production domain
4. Update the redirect URI in Facebook App Settings

### Environment Variables for Production

Make sure to set these in your hosting platform:
- `FACEBOOK_APP_ID`
- `FACEBOOK_APP_SECRET`
- `REDIRECT_URI` (production URL)
- `PORT` (if needed)

## Troubleshooting

### Instagram Connection Fails

1. Verify your Facebook App Secret is correct
2. Check that redirect URI matches exactly in Facebook App Settings
3. Ensure your Instagram account is a Business or Creator account
4. Verify the account is connected to a Facebook Page

### No Captions Retrieved

1. Make sure your Instagram account has posts with captions
2. Check that your account is a Business/Creator account (not Personal)
3. Verify the account is linked to a Facebook Page

### CORS Errors

The server includes CORS headers. If you still see errors:
1. Check that the API base URL matches your server URL
2. Verify the server is running and accessible

## Support

For issues or questions, check:
- Facebook App Settings
- Instagram Graph API documentation
- Server logs for detailed error messages






