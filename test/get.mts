import { createConnection } from 'net';
import { connect as createTlsConnection } from 'tls';



const proxy = { host: '127.0.0.1', port: 8080 };
const target = { host: 'www.instagram.com', port: 443 }; // Porta 443 para HTTPS

const socket = createConnection(proxy, () => {
  socket.write(
    `CONNECT ${target.host}:${target.port} HTTP/1.1\r\n` +
    `Host: ${target.host}:${target.port}\r\n\r\n`
  );
});

let buffer = '';
let tlsSocket: import('tls').TLSSocket | null = null;

socket.on('data', chunk => {
  const data = chunk.toString();
  buffer += data;

  if (buffer.includes('\r\n\r\n')) {
    if (buffer.includes('200 Connection Established')) {
      // Conexão com o proxy estabelecida, iniciar conexão TLS
      tlsSocket = createTlsConnection({
        socket, // Reutiliza o socket existente
        servername: target.host, // Necessário para SNI (Server Name Indication)
      });

      tlsSocket.write(
        `GET / HTTP/1.1\r\n` +
        `Host: ${target.host}\r\n` +
        `User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36\r\n` +
        `Connection: close\r\n\r\n`
      );

      tlsSocket.on('data', tlsData => {
        process.stdout.write(tlsData.toString()); // Imprime a resposta HTTPS
      });

      tlsSocket.on('end', () => console.log('\nConexão TLS encerrada.'));
      tlsSocket.on('error', err => console.error('Erro TLS:', err));
    } else {
      console.error('Erro ao estabelecer conexão com o proxy:\n' + buffer);
      socket.end();
    }
  }
});

socket.on('error', err => console.error('Erro no socket:', err));
socket.on('end', () => console.log('\nConexão encerrada.'));