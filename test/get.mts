import { createConnection } from 'net';

const proxy = { host: '127.0.0.1', port: 8080 };
const target = { host: 'instagram.com', port: 80 };

const socket = createConnection(proxy, () => {
  socket.write(`CONNECT ${target.host}:${target.port} HTTP/1.1\r\n` +
               `Host: ${target.host}:${target.port}\r\n\r\n`);
});

let stage: 'connect' | 'request' = 'connect';
let buffer = '';

socket.on('data', chunk => {
  const data = chunk.toString();

  if (stage === 'connect') {
    buffer += data;
    if (buffer.includes('\r\n\r\n')) {
      if (buffer.includes('200')) {
        stage = 'request';
        socket.write(`GET / HTTP/1.1\r\nHost: ${target.host}\r\nConnection: close\r\n\r\n`);
      } else {
        console.error('Proxy error:\n' + buffer);
        socket.end();
      }
    }
  } else {
    process.stdout.write(data); // imprime resposta do servidor
  }
});

socket.on('end', () => console.log('\nConexão encerrada.'));
socket.on('error', err => console.error('Erro:', err));
