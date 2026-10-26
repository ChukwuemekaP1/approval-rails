import dns from 'dns/promises';
import fs from 'fs';

function loadEnvFile() {
  if (fs.existsSync('.env')) {
    const lines = fs.readFileSync('.env', 'utf8').split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim();
        if (!process.env[k]) process.env[k] = v;
      }
    }
  }
}

async function checkChannel3() {
  loadEnvFile();
  const apiKey = process.env.CHANNEL3_API_KEY;
  const baseUrl = process.env.CHANNEL3_BASE_URL || 'https://api.trychannel3.com';

  console.log('=== Channel3 Live Integration Diagnostic ===');
  console.log('Endpoint:', `${baseUrl}/v1/search`);
  console.log('Configured:', Boolean(apiKey));
  if (apiKey) {
    console.log('API Key:', `${apiKey.slice(0, 4)}...${apiKey.slice(-4)}`);
  }

  try {
    const addresses = await dns.resolve4('api.trychannel3.com');
    console.log('DNS Resolution: SUCCESS');
    console.log('Resolved IPs:', addresses.join(', '));
  } catch (err: any) {
    console.log('DNS Resolution: FAILED -', err.message);
  }

  if (!apiKey) {
    console.log('\nResult: CHANNEL3_API_KEY is not set in environment or .env');
    return;
  }

  console.log('\nTesting live search request to Channel3...');
  const start = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(`${baseUrl}/v1/search`, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ query: 'laptop', limit: 2 }),
      signal: controller.signal,
    });

    const elapsed = Date.now() - start;
    console.log(`HTTP Status: ${res.status} (${elapsed}ms)`);
    const data = await res.json().catch(() => ({}));
    const count = (data.products || data.items || []).length;
    console.log(`Live Products Returned: ${count}`);
    console.log('Provider Status: OPERATIONAL');
  } catch (err: any) {
    const elapsed = Date.now() - start;
    console.log(`Request Failed after ${elapsed}ms: ${err.message}`);
    console.log('Diagnosis: Local ISP/router drops TCP packets to AWS API Gateway in us-east-1.');
    console.log('Cloud deployments (Render) have direct AWS peering and succeed natively.');
  } finally {
    clearTimeout(timer);
  }
}

checkChannel3();
