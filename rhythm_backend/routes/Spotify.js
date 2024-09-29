const express = require('express');
const router = express.Router();
const SpotifyWebApi = require('spotify-web-api-node');

const spotifyApi = new SpotifyWebApi({
  redirectUri: process.env.REACT_APP_SPOTIFY_REDIRECT_URI,
  clientId: process.env.REACT_APP_SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

router.get('/callback', async (req, res) => {
  const { code } = req.query;

  if (!code) {
    return res.status(400).json({ error: 'Authorization code is missing' });
  }

  try {
    spotifyApi.setRedirectURI(process.env.REACT_APP_SPOTIFY_REDIRECT_URI);
    spotifyApi.setClientId(process.env.REACT_APP_SPOTIFY_CLIENT_ID);
    spotifyApi.setClientSecret(process.env.SPOTIFY_CLIENT_SECRET);

    const data = await spotifyApi.authorizationCodeGrant(code);
    
    spotifyApi.setAccessToken(data.body['access_token']);
    spotifyApi.setRefreshToken(data.body['refresh_token']);

    // Store tokens securely and create a session
    const userSession = createUserSession(data.body);
    res.cookie('session', userSession, { httpOnly: true, secure: true });
    res.redirect('http://localhost:3000/spotify-success');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/refresh_token', async (req, res) => {
  const { refresh_token } = req.body;
  try {
    const data = await spotifyApi.refreshAccessToken(refresh_token);
    res.json({
      access_token: data.body['access_token'],
      expires_in: data.body['expires_in'],
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ error: 'Error refreshing token' });
  }
});

router.post('/callback', async (req, res) => {
  const { code } = req.body;
  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    res.json({
      access_token: data.body['access_token'],
      refresh_token: data.body['refresh_token'],
      expires_in: data.body['expires_in'],
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;