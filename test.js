const https = require('https');

const data = JSON.stringify({
  email: 'admin@example.com',
  password: '123456'
});

const options = {
  hostname: 'crm-project-one-ruddy.vercel.app',
  port: 443,
  path: '/api/v1/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, res => {
  console.log(`\n--- HTTP STATUS CODE: ${res.statusCode} ---`);
  let body = '';
  res.on('data', d => { body += d; });
  res.on('end', () => console.log(`--- RESPONSE BODY: ---\n${body}\n----------------------`));
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
