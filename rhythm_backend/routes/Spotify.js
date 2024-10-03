const express = require('express');
const router = express.Router();
const SpotifyWebApi = require('spotify-web-api-node');

const spotifyApi = new SpotifyWebApi({
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

router.get('/callback', async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).json({ error: 'Authorization code is missing' });
  }

  try {
    const data = await spotifyApi.authorizationCodeGrant(code);
    res.json({
      access_token: data.body['access_token'],
      refresh_token: data.body['refresh_token'],
      expires_in: data.body['expires_in'],
    });
  } catch (error) {
    console.error('Spotify API Error:', error);
    res.status(500).json({ error: 'Spotify API Error', message: error.message });
  }
});

router.post('/refresh_token', async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) {
    return res.status(400).json({ error: 'Refresh token is missing' });
  }
  spotifyApi.setRefreshToken(refresh_token);
  try {
    const data = await spotifyApi.refreshAccessToken();
    res.json({
      access_token: data.body['access_token'],
      expires_in: data.body['expires_in'],
    });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(500).json({ error: 'Error refreshing token', message: error.message });
  }
});

router.post('/set_token', (req, res) => {
  const { access_token } = req.body;
  if (!access_token) {
    return res.status(400).json({ error: 'Access token is missing' });
  }
  spotifyApi.setAccessToken(access_token);
  res.json({ message: 'Access token set successfully' });
});

module.exports = router;