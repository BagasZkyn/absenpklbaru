// netlify/functions/absen.js

const fetch = require('node-fetch');
const { CookieJar } = require('tough-cookie');
const fetchCookie = require('fetch-cookie');

const jar = new CookieJar();
const fetchWithCookies = fetchCookie(fetch, jar);

exports.handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  try {
    // Login Process
    const loginRes = await fetchWithCookies('https://absenpkl.stmbksimo.com/sw-proses?action=login', {
      method: 'POST',
      headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://absenpkl.stmbksimo.com/',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        email: process.env.EMAIL, // Gunakan environment variable
        password: process.env.PASSWORD // Gunakan environment variable
      })
    });

    const loginResult = await loginRes.text();
    
    if (!loginResult.toLowerCase().includes('success')) {
      console.error('Login failed:', loginResult);
      return {
        statusCode: 401,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ 
          status: 'error', 
          message: 'Authentication failed',
          detail: loginResult 
        })
      };
    }

    // Absen Process
    const absenRes = await fetchWithCookies('https://absenpkl.stmbksimo.com/sw-proses?action=absent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Referer': 'https://absenpkl.stmbksimo.com/absent'
      },
      body: new URLSearchParams({
        qrcode: '2025/53ECC/SW2025-03-21',
        latitude: '-7.530607277797366,110.58327667415142',
        radius: '2'
      })
    });

    const absenResult = await absenRes.text();
    
    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        status: 'success',
        server_response: absenResult
      })
    };

  } catch (err) {
    console.error('Error:', err);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        status: 'error',
        message: 'Internal server error',
        error_detail: err.message
      })
    };
  }
};
