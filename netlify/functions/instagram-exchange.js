const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const { code } = JSON.parse(event.body || '{}');
  
  if (!code) {
    return {
      statusCode: 400,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ error: 'Missing code' })
    };
  }

  const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
  const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
  const REDIRECT_URI = process.env.REDIRECT_URI || 'https://cutoutthemiddleman.netlify.app/ig/callback.html';

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
      return {
        statusCode: tokenResp.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({
          error: 'Token exchange failed',
          details: tokenData
        })
      };
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
      return {
        statusCode: pagesResp.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({
          error: 'Page lookup failed',
          details: pagesData
        })
      };
    }
    
    const page = pagesData.data.find(
      p => p.instagram_business_account && p.instagram_business_account.id
    );
    
    if (!page) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({
          error: 'No Instagram business account found'
        })
      };
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
      return {
        statusCode: mediaResp.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        },
        body: JSON.stringify({
          error: 'Media fetch failed',
          details: mediaData
        })
      };
    }
    
    const media = Array.isArray(mediaData.data) ? mediaData.data : [];
    const captions = media.map(m => m.caption).filter(Boolean);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({
        success: true,
        ig_user_id: igUserId,
        page_id: page.id,
        media,
        captions
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({ 
        error: 'Server error', 
        details: String(err) 
      })
    };
  }
};






