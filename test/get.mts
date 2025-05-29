import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';

// 'http://usuario:senha@127.0.0.1:8080'; // ou 'socks5://127.0.0.1:1080'
const proxyUrl = "http://109.197.153.25:8888"
const agent = new HttpsProxyAgent(proxyUrl);

axios.get('https://api.ipify.org?format=json', { httpsAgent: agent })
  .then(res => console.log('IP pelo proxy:', res.data.ip))
  .catch(err => console.error('Erro no proxy:', err.message));
