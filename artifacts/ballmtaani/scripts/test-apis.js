/**
 * Standalone API Test Script
 * Usage: node scripts/test-apis.js <GEMINI_KEY> <FOOTBALL_KEY>
 */

const https = require('https');

const GEMINI_KEY = process.argv[2];
const FOOTBALL_KEY = process.argv[3];

if (!GEMINI_KEY || !FOOTBALL_KEY) {
  console.log("Usage: node scripts/test-apis.js <GEMINI_KEY> <FOOTBALL_KEY>");
  process.exit(1);
}

async function testGemini() {
  console.log("\n--- Testing Gemini API ---");
  const data = JSON.stringify({
    contents: [{ parts: [{ text: "Explain offside in 10 words." }] }]
  });

  const options = {
    hostname: 'generativelanguage.googleapis.com',
    port: 443,
    path: `/v1/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log("✅ Gemini: SUCCESS");
          resolve(true);
        } else {
          console.log(`❌ Gemini: FAILED (${res.statusCode})`);
          console.log("Response:", body);
          resolve(false);
        }
      });
    });
    req.on('error', e => { console.error(e); resolve(false); });
    req.write(data);
    req.end();
  });
}

async function testFootball() {
  console.log("\n--- Testing API-Football ---");
  const options = {
    hostname: 'v3.football.api-sports.io',
    port: 443,
    path: '/status',
    method: 'GET',
    headers: {
      'x-apisports-key': FOOTBALL_KEY
    }
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', d => body += d);
      res.on('end', () => {
        const data = JSON.parse(body);
        if (res.statusCode === 200 && (!data.errors || Object.keys(data.errors).length === 0)) {
          console.log("✅ Football API: SUCCESS");
          resolve(true);
        } else {
          console.log(`❌ Football API: FAILED (${res.statusCode})`);
          console.log("Errors:", data.errors || body);
          resolve(false);
        }
      });
    });
    req.on('error', e => { console.error(e); resolve(false); });
    req.end();
  });
}

(async () => {
  await testGemini();
  await testFootball();
  console.log("\n--- End of Test ---");
})();
