const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json());
app.use(express.static('.')); // Serve static files from current directory

const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Main exchange endpoint
app.post('/api/instagram/exchange', async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Missing code' });

  try {
    // Exchange code for user token
    const tokenResp = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token?` +
      new URLSearchParams({
        client_id: FACEBOOK_APP_ID,
        client_secret: FACEBOOK_APP_SECRET,
        redirect_uri: REDIRECT_URI,
        code
      })
    );
    const tokenData = await tokenResp.json();
    if (!tokenResp.ok) {
      return res.status(tokenResp.status).json({
        error: 'Token exchange failed',
        details: tokenData
      });
    }
    const userToken = tokenData.access_token;

    // Find pages with attached IG account
    const pagesResp = await fetch(
      `https://graph.facebook.com/v21.0/me/accounts?` +
      new URLSearchParams({
        fields: 'id,name,access_token,instagram_business_account',
        access_token: userToken
      })
    );
    const pagesData = await pagesResp.json();
    if (!pagesResp.ok) {
      return res.status(pagesResp.status).json({
        error: 'Page lookup failed',
        details: pagesData
      });
    }
    const page = pagesData.data.find(
      p => p.instagram_business_account && p.instagram_business_account.id
    );
    if (!page) {
      return res.status(400).json({
        error: 'No Instagram business account found'
      });
    }
    const igUserId = page.instagram_business_account.id;
    const pageToken = page.access_token;

    // Fetch recent IG media
    const mediaResp = await fetch(
      `https://graph.facebook.com/v21.0/${igUserId}/media?` +
      new URLSearchParams({
        fields: 'id,caption,permalink,timestamp',
        access_token: pageToken,
        limit: '25'
      })
    );
    const mediaData = await mediaResp.json();
    if (!mediaResp.ok) {
      return res.status(mediaResp.status).json({
        error: 'Media fetch failed',
        details: mediaData
      });
    }
    const media = Array.isArray(mediaData.data) ? mediaData.data : [];
    const captions = media.map(m => m.caption).filter(Boolean);

    res.json({
      success: true,
      ig_user_id: igUserId,
      page_id: page.id,
      media,
      captions
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: String(err) });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

