# Usage

```js
const https = require('https');
const { HttpsProxyAgent } = require('https-proxy-agent');

// Configurações
const proxyUrl = 'http://usuario:senha@proxy.exemplo.com:8080'; // replace it with the deployed url
const targetUrl = 'https://www.google.com/';

// Create the HTTP CONNECT agent
const agent = new HttpsProxyAgent(proxyUrl);

// makes the connection through the proxy
https.get(targetUrl, { agent }, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  console.log(`HEADERS: ${JSON.stringify(res.headers, null, 2)}`);

  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log('BODY:', chunk);
  });

  res.on('end', () => {
    console.log('Request completed!');
  });
}).on('error', (err) => {
  console.error('Request Error: ', err.message);
});
```
